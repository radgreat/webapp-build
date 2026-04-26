import { randomUUID } from 'crypto';
import pool from '../db/db.js';
import { findUserById, findUserByIdentifier } from '../stores/user.store.js';
import {
  PAYOUT_STATUS_LABELS,
  insertPayoutRequestRecord,
  readMockPayoutRequestsStore,
  readPayoutRequestById,
  resolveCommissionPayoutSourceLabel,
  resolvePayoutRequestIdentityKeys,
  doesPayoutRequestBelongToIdentity,
  normalizeCommissionPayoutSourceKey,
  normalizePayoutRequestStatus,
  sanitizePayoutRequestRecord,
  sumOpenPayoutRequestAmountByUserId,
  updatePayoutRequestById,
} from '../stores/payout.store.js';
import {
  ensureWalletTables,
  lockWalletAccountsByUserIds,
  updateWalletAccountBalanceByUserId,
  upsertWalletAccount,
} from '../stores/wallet.store.js';
import {
  createStripeConnectPayoutForConnectedAccount,
  createStripeConnectTransferForPayout,
  resolveStripeConnectStatusForUserIdentity,
} from './stripe-client.service.js';
import {
  buildAccountUpgradeRequiredResult,
  isPendingOrReservationMember,
} from '../utils/member-capability.helpers.js';
import { resolveMemberActivityStateByPersonalBv } from '../utils/member-activity.helpers.js';

const DEFAULT_CURRENCY_CODE = 'USD';
const DEFAULT_MINIMUM_PAYOUT_AMOUNT_USD = 20;
const EWALLET_PAYOUT_SOURCE_KEY = 'ewallet';
const STRIPE_GATEWAY_KEY = 'stripe_connect';
const STRIPE_GATEWAY_LABEL = 'Stripe Connect';
const STRIPE_TRANSFER_MODE_KEY = 'stripe';
const RETRY_ACTOR_KEY = 'system:auto-retry';
const DEFAULT_PAYOUT_AUTO_RETRY_INTERVAL_MS = 30_000;
const MIN_PAYOUT_AUTO_RETRY_INTERVAL_MS = 5_000;
const MAX_PAYOUT_AUTO_RETRY_INTERVAL_MS = 600_000;
const DEFAULT_PAYOUT_AUTO_RETRY_MAX_ATTEMPTS = 12;
const DEFAULT_PAYOUT_AUTO_RETRY_MAX_PER_CYCLE = 8;
const DEFAULT_PAYOUT_AUTO_RETRY_BASE_DELAY_SECONDS = 30;
const DEFAULT_PAYOUT_AUTO_RETRY_MAX_DELAY_SECONDS = 900;
const DEFAULT_STRIPE_CONNECTED_PAYOUT_ENABLED = true;
const DEFAULT_STRIPE_CONNECTED_PAYOUT_METHOD = 'instant';

let failedStripeRetrySweepInFlight = false;

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeCredential(value) {
  return normalizeText(value).toLowerCase();
}

function roundCurrencyAmount(value) {
  return Math.round((Math.max(0, Number(value) || 0)) * 100) / 100;
}

function toCurrencyMinorUnits(amountInput) {
  return Math.max(0, Math.round((Math.max(0, Number(amountInput) || 0)) * 100));
}

function resolvePayoutRequestMinimumAmountUsd() {
  const fromEnv = Number.parseFloat(String(
    process.env.PAYOUT_MIN_WITHDRAWAL_USD
    || process.env.MINIMUM_PAYOUT_REQUEST_USD
    || process.env.MIN_PAYOUT_REQUEST_USD
    || '',
  ).trim());
  if (Number.isFinite(fromEnv) && fromEnv > 0) {
    return roundCurrencyAmount(fromEnv);
  }
  return DEFAULT_MINIMUM_PAYOUT_AMOUNT_USD;
}

function resolvePayoutAutoFulfillEnabled() {
  const normalized = normalizeCredential(process.env.PAYOUT_AUTO_FULFILL_ENABLED || 'true');
  if (!normalized) {
    return true;
  }
  if (normalized === '0' || normalized === 'false' || normalized === 'off' || normalized === 'no') {
    return false;
  }
  return true;
}

function normalizeStripeConnectedPayoutMethod(valueInput, fallbackMethod = DEFAULT_STRIPE_CONNECTED_PAYOUT_METHOD) {
  const normalized = normalizeCredential(valueInput);
  if (normalized === 'instant') {
    return 'instant';
  }
  if (normalized === 'standard') {
    return 'standard';
  }
  return fallbackMethod === 'standard' ? 'standard' : 'instant';
}

function resolveStripeConnectedPayoutEnabled() {
  return normalizeBooleanFlag(
    process.env.STRIPE_CONNECT_CREATE_PAYOUT,
    DEFAULT_STRIPE_CONNECTED_PAYOUT_ENABLED,
  );
}

function resolveStripeConnectedPayoutMethod() {
  return normalizeStripeConnectedPayoutMethod(
    process.env.STRIPE_CONNECT_PAYOUT_METHOD,
    DEFAULT_STRIPE_CONNECTED_PAYOUT_METHOD,
  );
}

function normalizeBooleanFlag(value, fallback = false) {
  const normalized = normalizeCredential(value);
  if (!normalized) {
    return fallback;
  }
  if (normalized === '1' || normalized === 'true' || normalized === 'on' || normalized === 'yes') {
    return true;
  }
  if (normalized === '0' || normalized === 'false' || normalized === 'off' || normalized === 'no') {
    return false;
  }
  return fallback;
}

function resolvePositiveInteger(valueInput, fallbackValue, minimumValue = 1, maximumValue = Number.MAX_SAFE_INTEGER) {
  const parsed = Number.parseInt(String(valueInput || '').trim(), 10);
  if (!Number.isFinite(parsed) || parsed < minimumValue) {
    return fallbackValue;
  }
  return Math.min(Math.max(parsed, minimumValue), maximumValue);
}

function resolvePositiveNumber(valueInput, fallbackValue, minimumValue = 0, maximumValue = Number.MAX_SAFE_INTEGER) {
  const parsed = Number.parseFloat(String(valueInput || '').trim());
  if (!Number.isFinite(parsed) || parsed < minimumValue) {
    return fallbackValue;
  }
  return Math.min(Math.max(parsed, minimumValue), maximumValue);
}

export function resolvePayoutAutoRetryEnabled() {
  return normalizeBooleanFlag(process.env.PAYOUT_AUTO_RETRY_ENABLED, true);
}

export function resolvePayoutAutoRetryIntervalMs() {
  return resolvePositiveInteger(
    process.env.PAYOUT_AUTO_RETRY_INTERVAL_MS,
    DEFAULT_PAYOUT_AUTO_RETRY_INTERVAL_MS,
    MIN_PAYOUT_AUTO_RETRY_INTERVAL_MS,
    MAX_PAYOUT_AUTO_RETRY_INTERVAL_MS,
  );
}

function resolvePayoutAutoRetryMaxAttempts() {
  return resolvePositiveInteger(
    process.env.PAYOUT_AUTO_RETRY_MAX_ATTEMPTS,
    DEFAULT_PAYOUT_AUTO_RETRY_MAX_ATTEMPTS,
    1,
    100,
  );
}

function resolvePayoutAutoRetryMaxPerCycle() {
  return resolvePositiveInteger(
    process.env.PAYOUT_AUTO_RETRY_MAX_PER_CYCLE,
    DEFAULT_PAYOUT_AUTO_RETRY_MAX_PER_CYCLE,
    1,
    100,
  );
}

function resolvePayoutAutoRetryBaseDelaySeconds() {
  return resolvePositiveNumber(
    process.env.PAYOUT_AUTO_RETRY_BASE_DELAY_SECONDS,
    DEFAULT_PAYOUT_AUTO_RETRY_BASE_DELAY_SECONDS,
    1,
    86_400,
  );
}

function resolvePayoutAutoRetryMaxDelaySeconds() {
  const configuredMaxDelay = resolvePositiveNumber(
    process.env.PAYOUT_AUTO_RETRY_MAX_DELAY_SECONDS,
    DEFAULT_PAYOUT_AUTO_RETRY_MAX_DELAY_SECONDS,
    1,
    172_800,
  );
  return Math.max(configuredMaxDelay, resolvePayoutAutoRetryBaseDelaySeconds());
}

function resolvePayoutAutoRetryAllFailuresEnabled() {
  return normalizeBooleanFlag(process.env.PAYOUT_AUTO_RETRY_STRIPE_ALL_FAILURES, false);
}

function isStatusOpen(statusInput) {
  const normalized = normalizePayoutRequestStatus(statusInput);
  return normalized === PAYOUT_STATUS_LABELS.requested
    || normalized === PAYOUT_STATUS_LABELS.processing;
}

function isStatusPaid(statusInput) {
  const normalized = normalizePayoutRequestStatus(statusInput);
  return normalized === PAYOUT_STATUS_LABELS.paid;
}

function isStatusFinal(statusInput) {
  const normalized = normalizePayoutRequestStatus(statusInput);
  return normalized === PAYOUT_STATUS_LABELS.paid
    || normalized === PAYOUT_STATUS_LABELS.failed
    || normalized === PAYOUT_STATUS_LABELS.cancelled;
}

function normalizeAdminRequestedStatus(statusInput) {
  const normalized = normalizeCredential(statusInput);
  if (!normalized) {
    return '';
  }
  if (normalized === 'pending' || normalized === 'requested') {
    return PAYOUT_STATUS_LABELS.requested;
  }
  if (normalized === 'processing') {
    return PAYOUT_STATUS_LABELS.processing;
  }
  if (normalized === 'fulfilled' || normalized === 'paid') {
    return PAYOUT_STATUS_LABELS.paid;
  }
  if (normalized === 'failed') {
    return PAYOUT_STATUS_LABELS.failed;
  }
  if (normalized === 'cancelled' || normalized === 'canceled') {
    return PAYOUT_STATUS_LABELS.cancelled;
  }
  return '';
}

function normalizeTransferMode(value) {
  const normalized = normalizeCredential(value);
  if (!normalized) {
    return '';
  }
  if (normalized === 'stripe' || normalized === 'stripe-connect') {
    return STRIPE_TRANSFER_MODE_KEY;
  }
  if (normalized === 'bank-transfer' || normalized === 'banktransfer') {
    return 'bank-transfer';
  }
  if (normalized === 'wire-transfer' || normalized === 'wiretransfer') {
    return 'wire-transfer';
  }
  if (normalized === 'zelle') {
    return 'zelle';
  }
  return normalized;
}

function resolveFulfillmentGatewayLabel(transferModeInput) {
  const transferMode = normalizeTransferMode(transferModeInput);
  if (transferMode === STRIPE_TRANSFER_MODE_KEY) {
    return STRIPE_GATEWAY_LABEL;
  }
  if (transferMode === 'bank-transfer') {
    return 'Bank Transfer';
  }
  if (transferMode === 'wire-transfer') {
    return 'Wire Transfer';
  }
  if (transferMode === 'zelle') {
    return 'Zelle';
  }
  return transferMode ? transferMode.toUpperCase() : 'Manual';
}

function resolveFulfillmentGatewayRoute(transferModeInput) {
  const transferMode = normalizeTransferMode(transferModeInput);
  if (transferMode === STRIPE_TRANSFER_MODE_KEY) {
    return '/api/admin/payout-requests/fulfill/stripe';
  }
  if (transferMode === 'bank-transfer') {
    return '/api/admin/payout-requests/fulfill/bank-transfer';
  }
  if (transferMode === 'wire-transfer') {
    return '/api/admin/payout-requests/fulfill/wire-transfer';
  }
  if (transferMode === 'zelle') {
    return '/api/admin/payout-requests/fulfill/zelle';
  }
  return '/api/admin/payout-requests/fulfill';
}

function resolveRequestActor(payload = {}) {
  const actorLabel = normalizeText(
    payload?.updatedBy
    || payload?.fulfilledBy
    || payload?.actorLabel
    || payload?.actor
    || payload?.requestedByName
    || payload?.requestedByUsername
    || payload?.requestedByEmail
    || 'system',
  );
  const actorKey = normalizeCredential(payload?.actorKey || actorLabel || 'system');
  return {
    actorKey,
    actorLabel: actorLabel || 'system',
  };
}

function buildStatusHistoryEntry(fromStatusInput, toStatusInput, payload = {}) {
  const fromStatus = normalizePayoutRequestStatus(fromStatusInput);
  const toStatus = normalizePayoutRequestStatus(toStatusInput);
  const actor = resolveRequestActor(payload);
  const metadata = payload?.metadata && typeof payload.metadata === 'object' && !Array.isArray(payload.metadata)
    ? payload.metadata
    : {};
  return {
    id: normalizeText(payload?.id) || `payout-status-${Date.now()}-${randomUUID().slice(0, 8)}`,
    fromStatus,
    toStatus,
    actorKey: actor.actorKey,
    actorLabel: actor.actorLabel,
    note: normalizeText(payload?.note),
    metadata,
    changedAt: normalizeText(payload?.changedAt) || new Date().toISOString(),
  };
}

function appendStatusHistoryEntry(existingHistoryInput, entryInput) {
  const existingHistory = Array.isArray(existingHistoryInput) ? existingHistoryInput : [];
  const entry = entryInput && typeof entryInput === 'object' ? entryInput : null;
  if (!entry) {
    return existingHistory;
  }
  return [...existingHistory, entry];
}

function applyStatusTransition(requestInput = {}, nextStatusInput, transition = {}) {
  const request = requestInput && typeof requestInput === 'object' ? requestInput : {};
  const nextStatus = normalizePayoutRequestStatus(nextStatusInput);
  const currentStatus = normalizePayoutRequestStatus(request.status);
  if (currentStatus === nextStatus) {
    return sanitizePayoutRequestRecord(request);
  }

  const changedAt = normalizeText(transition.changedAt) || new Date().toISOString();
  const transferMode = normalizeTransferMode(transition.transferMode || request.transferMode);
  const historyEntry = buildStatusHistoryEntry(currentStatus, nextStatus, {
    ...transition,
    changedAt,
  });
  const statusHistory = appendStatusHistoryEntry(request.statusHistory, historyEntry);

  const nextRequest = {
    ...request,
    status: nextStatus,
    updatedAt: changedAt,
    statusHistory,
    transferMode: transferMode || normalizeTransferMode(request.transferMode),
  };

  if (nextStatus === PAYOUT_STATUS_LABELS.requested) {
    nextRequest.requestedAt = normalizeText(request.requestedAt) || changedAt;
    nextRequest.processingStartedAt = '';
    nextRequest.failedAt = '';
    nextRequest.cancelledAt = '';
    nextRequest.fulfilledAt = '';
    nextRequest.fulfilledBy = '';
    nextRequest.paidAmount = 0;
    nextRequest.gatewayStatus = 'requested';
    return sanitizePayoutRequestRecord(nextRequest);
  }

  if (nextStatus === PAYOUT_STATUS_LABELS.processing) {
    nextRequest.processingStartedAt = normalizeText(request.processingStartedAt) || changedAt;
    nextRequest.failedAt = '';
    nextRequest.cancelledAt = '';
    nextRequest.gatewayStatus = normalizeText(transition.gatewayStatus || request.gatewayStatus || 'processing');
    return sanitizePayoutRequestRecord(nextRequest);
  }

  if (nextStatus === PAYOUT_STATUS_LABELS.failed) {
    nextRequest.failedAt = changedAt;
    nextRequest.gatewayStatus = normalizeText(transition.gatewayStatus || 'failed');
    nextRequest.gatewayMessage = normalizeText(transition.gatewayMessage || request.gatewayMessage);
    return sanitizePayoutRequestRecord(nextRequest);
  }

  if (nextStatus === PAYOUT_STATUS_LABELS.cancelled) {
    nextRequest.cancelledAt = changedAt;
    nextRequest.gatewayStatus = normalizeText(transition.gatewayStatus || 'cancelled');
    nextRequest.gatewayMessage = normalizeText(transition.gatewayMessage || request.gatewayMessage);
    return sanitizePayoutRequestRecord(nextRequest);
  }

  if (nextStatus === PAYOUT_STATUS_LABELS.paid) {
    const amount = roundCurrencyAmount(nextRequest.amount);
    const fulfilledBy = normalizeText(transition.fulfilledBy || transition.updatedBy || request.fulfilledBy);
    nextRequest.paidAmount = amount;
    nextRequest.fulfilledAt = normalizeText(request.fulfilledAt) || changedAt;
    nextRequest.fulfilledBy = fulfilledBy || 'system';
    nextRequest.failedAt = '';
    nextRequest.cancelledAt = '';
    nextRequest.gatewayStatus = normalizeText(transition.gatewayStatus || request.gatewayStatus || 'succeeded');
    nextRequest.gatewayMessage = normalizeText(transition.gatewayMessage || request.gatewayMessage);
    if (normalizeText(transition.gatewayReference)) {
      nextRequest.gatewayReference = normalizeText(transition.gatewayReference);
    }
    if (normalizeText(transition.transferReference)) {
      nextRequest.transferReference = normalizeText(transition.transferReference);
    }
    if (normalizeText(transition.gatewayKey)) {
      nextRequest.gatewayKey = normalizeText(transition.gatewayKey);
    }
    if (normalizeText(transition.gatewayLabel)) {
      nextRequest.gatewayLabel = normalizeText(transition.gatewayLabel);
    }
    if (normalizeText(transition.gatewayRoute)) {
      nextRequest.gatewayRoute = normalizeText(transition.gatewayRoute);
    }
    if (normalizeText(transition.bankDetails)) {
      nextRequest.bankDetails = normalizeText(transition.bankDetails);
    }
    if (normalizeText(transition.generalInfo)) {
      nextRequest.generalInfo = normalizeText(transition.generalInfo);
    }
    return sanitizePayoutRequestRecord(nextRequest);
  }

  return sanitizePayoutRequestRecord(nextRequest);
}

async function resolveMemberUserFromIdentity(identityPayload = {}) {
  const userId = normalizeText(identityPayload?.userId);
  if (userId) {
    const byId = await findUserById(userId);
    if (byId) {
      return byId;
    }
  }

  const username = normalizeText(identityPayload?.username);
  if (username) {
    const byUsername = await findUserByIdentifier(username);
    if (byUsername) {
      return byUsername;
    }
  }

  const email = normalizeText(identityPayload?.email);
  if (email) {
    const byEmail = await findUserByIdentifier(email);
    if (byEmail) {
      return byEmail;
    }
  }

  return null;
}

async function lockMemberWalletAccount(memberUser = {}, payload = {}, executor = pool) {
  await ensureWalletTables();

  await upsertWalletAccount({
    userId: normalizeText(memberUser.id),
    username: normalizeText(memberUser.username),
    email: normalizeText(memberUser.email),
    accountName: normalizeText(memberUser.name),
    currencyCode: DEFAULT_CURRENCY_CODE,
    startingBalance: roundCurrencyAmount(payload?.senderSeedBalance),
  }, executor);

  const lockedAccounts = await lockWalletAccountsByUserIds([memberUser.id], executor);
  return lockedAccounts.find((account) => normalizeText(account?.userId) === normalizeText(memberUser.id)) || null;
}

async function resolveWalletRequestabilityForAmount(memberUser = {}, amountInput = 0, executor = pool, options = {}) {
  const walletAccount = await lockMemberWalletAccount(memberUser, options, executor);
  if (!walletAccount) {
    return {
      success: false,
      status: 500,
      error: 'Unable to lock your E-Wallet account for payout processing.',
    };
  }

  const walletBalance = roundCurrencyAmount(walletAccount.balance);
  const reservedOpenAmount = roundCurrencyAmount(await sumOpenPayoutRequestAmountByUserId(
    memberUser.id,
    executor,
    options?.excludeRequestId ? { excludeRequestId: options.excludeRequestId } : {},
  ));
  const requestableBalance = roundCurrencyAmount(Math.max(0, walletBalance - reservedOpenAmount));
  const requestedAmount = roundCurrencyAmount(amountInput);

  if (requestedAmount > requestableBalance) {
    return {
      success: false,
      status: 400,
      error: `Amount exceeds available payout balance. Requestable: ${requestableBalance.toFixed(2)} USD.`,
      walletBalance,
      reservedOpenAmount,
      requestableBalance,
    };
  }

  return {
    success: true,
    walletBalance,
    reservedOpenAmount,
    requestableBalance,
    nextWalletBalance: roundCurrencyAmount(walletBalance - requestedAmount),
  };
}

async function resolveStripePayoutEligibilityForMember(memberUser = {}, options = {}) {
  let payoutAccountStatus = null;
  try {
    payoutAccountStatus = await resolveStripeConnectStatusForUserIdentity({
      userId: memberUser.id,
      username: memberUser.username,
      email: memberUser.email,
      name: memberUser.name,
    }, {
      allowCreate: false,
      fetchRemote: options.fetchRemote !== false,
      metadata: {
        source: 'payout-service',
      },
    });
  } catch (error) {
    return {
      success: false,
      status: 503,
      error: error instanceof Error
        ? error.message
        : 'Stripe payout infrastructure is currently unavailable.',
      connectAccountId: '',
      statusPayload: {},
    };
  }

  const status = payoutAccountStatus?.status && typeof payoutAccountStatus.status === 'object'
    ? payoutAccountStatus.status
    : {};
  const connectAccountId = normalizeText(
    payoutAccountStatus?.connectAccountId
    || status.connectAccountId
    || memberUser?.stripeConnectAccountId,
  );
  const onboardingComplete = status.onboardingComplete === true;
  const payoutsEnabled = status.payoutsEnabled === true;

  if (!connectAccountId) {
    return {
      success: false,
      status: 400,
      error: 'Payout account is not connected. Complete Stripe payout onboarding first.',
      connectAccountId: '',
      statusPayload: status,
    };
  }
  if (!onboardingComplete) {
    return {
      success: false,
      status: 400,
      error: 'Payout onboarding is incomplete. Complete Stripe onboarding to request payouts.',
      connectAccountId,
      statusPayload: status,
    };
  }
  if (!payoutsEnabled) {
    return {
      success: false,
      status: 400,
      error: 'Stripe payouts are not enabled for this payout account yet.',
      connectAccountId,
      statusPayload: status,
    };
  }

  return {
    success: true,
    connectAccountId,
    statusPayload: status,
  };
}

async function executeStripeTransferForPayoutRequest(request = {}, memberUser = {}, options = {}) {
  const requestId = normalizeText(request?.id);
  const connectAccountId = normalizeText(options?.connectAccountId || request?.stripeConnectAccountId);
  const amount = roundCurrencyAmount(request?.amount);

  if (!requestId || !connectAccountId || toCurrencyMinorUnits(amount) <= 0) {
    throw new Error('Stripe transfer execution requires request id, connected account id, and amount.');
  }

  const transfer = await createStripeConnectTransferForPayout({
    payoutRequestId: requestId,
    connectAccountId,
    amountUsd: amount,
    currencyCode: normalizeText(options?.currencyCode || DEFAULT_CURRENCY_CODE),
    sourceKey: normalizeCommissionPayoutSourceKey(request?.sourceKey),
    memberUserId: normalizeText(memberUser?.id || request?.requestedByUserId),
    memberUsername: normalizeText(memberUser?.username || request?.requestedByUsername),
    idempotencyKey: `charge-payout-transfer-${requestId}`,
  });

  let payout = null;
  const shouldCreateConnectedPayout = options?.createConnectedPayout !== false
    ? resolveStripeConnectedPayoutEnabled()
    : false;
  if (shouldCreateConnectedPayout) {
    payout = await createStripeConnectPayoutForConnectedAccount({
      payoutRequestId: requestId,
      connectAccountId,
      amountUsd: amount,
      currencyCode: normalizeText(options?.currencyCode || DEFAULT_CURRENCY_CODE),
      sourceKey: normalizeCommissionPayoutSourceKey(request?.sourceKey),
      memberUserId: normalizeText(memberUser?.id || request?.requestedByUserId),
      memberUsername: normalizeText(memberUser?.username || request?.requestedByUsername),
      transferId: normalizeText(transfer?.id),
      method: normalizeStripeConnectedPayoutMethod(options?.payoutMethod || resolveStripeConnectedPayoutMethod()),
      idempotencyKey: `charge-payout-connected-payout-${requestId}`,
    });
  }

  const payoutId = normalizeText(payout?.id);
  const payoutStatus = normalizeCredential(payout?.status || '');
  const gatewayStatus = payoutId
    ? (payoutStatus || 'pending')
    : 'succeeded';
  const gatewayMessage = payoutId
    ? `Stripe transfer succeeded and payout ${gatewayStatus || 'pending'} to connected account.`
    : 'Stripe transfer created successfully.';

  return {
    transfer,
    payout,
    gatewayKey: STRIPE_GATEWAY_KEY,
    gatewayLabel: STRIPE_GATEWAY_LABEL,
    gatewayRoute: payoutId ? '/v1/payouts' : '/v1/transfers',
    gatewayStatus,
    gatewayReference: payoutId || normalizeText(transfer?.id),
    gatewayMessage,
    transferMode: STRIPE_TRANSFER_MODE_KEY,
    transferReference: normalizeText(transfer?.id),
    stripeConnectAccountId: connectAccountId,
  };
}

function resolveEpochMs(valueInput) {
  const normalized = normalizeText(valueInput);
  if (!normalized) {
    return 0;
  }
  const parsed = Date.parse(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function resolveRetryAttemptCountFromStatusHistory(request = {}) {
  const statusHistory = Array.isArray(request?.statusHistory) ? request.statusHistory : [];
  let retryAttemptCount = 0;
  let retryFailureTransitions = 0;

  statusHistory.forEach((entry = {}) => {
    const actorKey = normalizeCredential(entry?.actorKey);
    if (actorKey !== RETRY_ACTOR_KEY) {
      return;
    }

    const metadataAttempt = Number.parseInt(String(entry?.metadata?.retryAttempt || '').trim(), 10);
    if (Number.isFinite(metadataAttempt) && metadataAttempt > retryAttemptCount) {
      retryAttemptCount = metadataAttempt;
    }

    const toStatus = normalizePayoutRequestStatus(entry?.toStatus);
    if (toStatus === PAYOUT_STATUS_LABELS.failed) {
      retryFailureTransitions += 1;
    }
  });

  return Math.max(retryAttemptCount, retryFailureTransitions);
}

function resolveLatestFailureTimestampMs(request = {}) {
  const directFailureTimestampMs = resolveEpochMs(request?.failedAt || request?.updatedAt);
  let latestFailureTimestampMs = directFailureTimestampMs;
  const statusHistory = Array.isArray(request?.statusHistory) ? request.statusHistory : [];
  statusHistory.forEach((entry = {}) => {
    if (normalizePayoutRequestStatus(entry?.toStatus) !== PAYOUT_STATUS_LABELS.failed) {
      return;
    }
    const changedAtMs = resolveEpochMs(entry?.changedAt);
    if (changedAtMs > latestFailureTimestampMs) {
      latestFailureTimestampMs = changedAtMs;
    }
  });
  return latestFailureTimestampMs;
}

function resolveRetryBackoffDelayMs(nextAttemptNumberInput = 1) {
  const baseDelayMs = Math.round(resolvePayoutAutoRetryBaseDelaySeconds() * 1000);
  const maxDelayMs = Math.round(resolvePayoutAutoRetryMaxDelaySeconds() * 1000);
  const nextAttemptNumber = Math.max(1, Number(nextAttemptNumberInput) || 1);
  const exponentialStep = Math.max(0, nextAttemptNumber - 1);
  return Math.min(maxDelayMs, baseDelayMs * (2 ** exponentialStep));
}

function isRetryableInsufficientFundsFailure(request = {}) {
  const combinedMessage = normalizeCredential([
    request?.gatewayMessage,
    request?.generalInfo,
    request?.transferReference,
  ].filter(Boolean).join(' '));
  return /insufficient(?:\s+available)?\s+funds/.test(combinedMessage)
    || /available\s+balance/.test(combinedMessage);
}

function isFailedStripePayoutRequest(request = {}) {
  return normalizePayoutRequestStatus(request?.status) === PAYOUT_STATUS_LABELS.failed
    && normalizeTransferMode(request?.transferMode) === STRIPE_TRANSFER_MODE_KEY
    && normalizeCommissionPayoutSourceKey(request?.sourceKey) === EWALLET_PAYOUT_SOURCE_KEY
    && Boolean(normalizeText(request?.id));
}

function buildUserIdentityError() {
  return {
    success: false,
    status: 400,
    error: 'A member identifier is required to process payout requests.',
  };
}

function buildInvalidAmountError(minimumAmount) {
  return {
    success: false,
    status: 400,
    error: `Payout amount must be at least ${minimumAmount.toFixed(2)} USD.`,
  };
}

function buildActiveAccountRequiredResult(status = 403) {
  return {
    success: false,
    status,
    error: 'Active account required.',
  };
}

function isInactiveMemberForPayout(member = {}) {
  const activityState = resolveMemberActivityStateByPersonalBv(member);
  return activityState?.isActive !== true;
}

export async function getPayoutRequests(query = {}) {
  const identityKeys = resolvePayoutRequestIdentityKeys({
    userId: query?.userId,
    username: query?.username,
    email: query?.email,
  });

  if (identityKeys.size === 0) {
    return buildUserIdentityError();
  }

  const requests = await readMockPayoutRequestsStore();
  const filteredRequests = requests.filter((request) =>
    doesPayoutRequestBelongToIdentity(request, identityKeys)
  );

  return {
    success: true,
    status: 200,
    data: {
      requests: filteredRequests,
    },
  };
}

export async function createPayoutRequest(payload = {}) {
  const sourceKey = normalizeCommissionPayoutSourceKey(payload?.sourceKey);
  if (sourceKey !== EWALLET_PAYOUT_SOURCE_KEY) {
    return {
      success: false,
      status: 400,
      error: 'Only E-Wallet payout requests are supported by this endpoint.',
    };
  }

  const minimumAmount = resolvePayoutRequestMinimumAmountUsd();
  const amount = roundCurrencyAmount(payload?.amount);
  const requestedPayoutMethod = normalizeStripeConnectedPayoutMethod(
    payload?.payoutMethod || payload?.stripePayoutMethod || resolveStripeConnectedPayoutMethod(),
  );
  if (amount < minimumAmount) {
    return buildInvalidAmountError(minimumAmount);
  }

  const memberUser = await resolveMemberUserFromIdentity(payload);
  if (!memberUser) {
    return {
      success: false,
      status: 404,
      error: 'Member account was not found for this payout request.',
    };
  }
  if (isPendingOrReservationMember(memberUser)) {
    return buildAccountUpgradeRequiredResult();
  }
  if (isInactiveMemberForPayout(memberUser)) {
    return buildActiveAccountRequiredResult();
  }

  const payoutEligibility = await resolveStripePayoutEligibilityForMember(memberUser);
  if (!payoutEligibility.success) {
    return payoutEligibility;
  }

  const client = await pool.connect();
  let transactionClosed = false;

  try {
    await client.query('BEGIN');

    const walletReadiness = await resolveWalletRequestabilityForAmount(memberUser, amount, client, payload);
    if (!walletReadiness.success) {
      await client.query('ROLLBACK');
      transactionClosed = true;
      return walletReadiness;
    }

    const nowIso = new Date().toISOString();
    const requestRecord = sanitizePayoutRequestRecord({
      id: normalizeText(payload?.id) || `payout_${Date.now()}_${randomUUID().slice(0, 8)}`,
      sourceKey,
      sourceLabel: resolveCommissionPayoutSourceLabel(sourceKey),
      amount,
      paidAmount: 0,
      status: PAYOUT_STATUS_LABELS.requested,
      requestedByUserId: memberUser.id,
      requestedByUsername: memberUser.username,
      requestedByEmail: memberUser.email,
      requestedByName: normalizeText(payload?.requestedByName || memberUser.name || memberUser.username),
      createdAt: nowIso,
      requestedAt: nowIso,
      updatedAt: nowIso,
      transferMode: STRIPE_TRANSFER_MODE_KEY,
      transferReference: '',
      generalInfo: normalizeText(payload?.note || payload?.generalInfo || ''),
      gatewayKey: STRIPE_GATEWAY_KEY,
      gatewayLabel: STRIPE_GATEWAY_LABEL,
      gatewayRoute: resolveFulfillmentGatewayRoute(STRIPE_TRANSFER_MODE_KEY),
      gatewayStatus: 'requested',
      gatewayReference: '',
      gatewayMessage: '',
      stripeConnectAccountId: payoutEligibility.connectAccountId,
      statusHistory: [
        buildStatusHistoryEntry('', PAYOUT_STATUS_LABELS.requested, {
          actorKey: normalizeCredential(memberUser.id || memberUser.username || memberUser.email),
          actorLabel: normalizeText(memberUser.username || memberUser.email || memberUser.id),
          note: 'Payout request submitted.',
          changedAt: nowIso,
          metadata: {
            sourceKey,
            minimumAmount,
            payoutMethod: requestedPayoutMethod,
          },
        }),
      ],
    });

    const insertedRequest = await insertPayoutRequestRecord(requestRecord, client);
    if (!insertedRequest) {
      await client.query('ROLLBACK');
      transactionClosed = true;
      return {
        success: false,
        status: 500,
        error: 'Unable to create payout request.',
      };
    }

    await client.query('COMMIT');
    transactionClosed = true;

    const shouldAutoFulfill = Object.prototype.hasOwnProperty.call(payload || {}, 'autoFulfill')
      ? payload?.autoFulfill !== false
      : resolvePayoutAutoFulfillEnabled();
    if (shouldAutoFulfill) {
      const autoFulfillmentResult = await fulfillAdminPayoutRequest({
        id: insertedRequest.id,
        transferMode: STRIPE_TRANSFER_MODE_KEY,
        payoutMethod: requestedPayoutMethod,
        generalInfo: normalizeText(payload?.note || payload?.generalInfo || 'Auto-fulfilled immediately after payout request submission.'),
        note: 'Auto-fulfilled immediately after payout request submission.',
        updatedBy: 'system:auto-payout',
        fulfilledBy: 'system:auto-payout',
      });
      if (!autoFulfillmentResult?.success) {
        return autoFulfillmentResult;
      }

      return {
        success: true,
        status: autoFulfillmentResult.status || 200,
        data: {
          ...(autoFulfillmentResult.data || {}),
          success: true,
          autoFulfilled: true,
          minimumAmount,
          walletBalance: walletReadiness.walletBalance,
          reservedBalance: roundCurrencyAmount(walletReadiness.reservedOpenAmount),
          requestableBalance: roundCurrencyAmount(walletReadiness.nextWalletBalance),
        },
      };
    }

    return {
      success: true,
      status: 201,
      data: {
        success: true,
        request: insertedRequest,
        minimumAmount,
        walletBalance: walletReadiness.walletBalance,
        reservedBalance: roundCurrencyAmount(walletReadiness.reservedOpenAmount + amount),
        requestableBalance: roundCurrencyAmount(walletReadiness.requestableBalance - amount),
      },
    };
  } catch (error) {
    if (!transactionClosed) {
      await client.query('ROLLBACK').catch(() => {});
    }
    throw error;
  } finally {
    client.release();
  }
}

export async function getAdminPayoutRequests() {
  const requests = await readMockPayoutRequestsStore();
  return {
    success: true,
    status: 200,
    data: {
      requests,
    },
  };
}

export async function updateAdminPayoutRequestStatus(payload = {}) {
  const requestId = normalizeText(payload?.id);
  if (!requestId) {
    return {
      success: false,
      status: 400,
      error: 'Payout request id is required.',
    };
  }

  const nextStatus = normalizeAdminRequestedStatus(payload?.status);
  if (!nextStatus) {
    return {
      success: false,
      status: 400,
      error: 'Status must be one of requested, processing, paid, failed, or cancelled.',
    };
  }

  if (nextStatus === PAYOUT_STATUS_LABELS.paid) {
    return fulfillAdminPayoutRequest(payload);
  }

  const client = await pool.connect();
  let transactionClosed = false;

  try {
    await client.query('BEGIN');

    const existingRequest = await readPayoutRequestById(requestId, client, { forUpdate: true });
    if (!existingRequest) {
      await client.query('ROLLBACK');
      transactionClosed = true;
      return {
        success: false,
        status: 404,
        error: 'Payout request not found.',
      };
    }

    const currentStatus = normalizePayoutRequestStatus(existingRequest.status);
    if (currentStatus === nextStatus) {
      await client.query('COMMIT');
      transactionClosed = true;
      return {
        success: true,
        status: 200,
        data: {
          success: true,
          request: existingRequest,
          updatedAt: normalizeText(existingRequest.updatedAt || existingRequest.createdAt),
          statusChanged: false,
        },
      };
    }

    if (isStatusPaid(currentStatus)) {
      await client.query('ROLLBACK');
      transactionClosed = true;
      return {
        success: false,
        status: 400,
        error: 'Paid payout requests cannot be reopened.',
      };
    }

    const nowIso = new Date().toISOString();
    const transitionedRequest = applyStatusTransition(existingRequest, nextStatus, {
      changedAt: nowIso,
      note: normalizeText(payload?.note || payload?.generalInfo || `Admin status updated to ${nextStatus}.`),
      ...resolveRequestActor(payload),
      gatewayStatus: normalizeText(payload?.gatewayStatus || ''),
      gatewayMessage: normalizeText(payload?.gatewayMessage || payload?.generalInfo || ''),
    });
    const updatedRequest = await updatePayoutRequestById(transitionedRequest, client);
    if (!updatedRequest) {
      await client.query('ROLLBACK');
      transactionClosed = true;
      return {
        success: false,
        status: 500,
        error: 'Unable to update payout request status.',
      };
    }

    await client.query('COMMIT');
    transactionClosed = true;

    return {
      success: true,
      status: 200,
      data: {
        success: true,
        request: updatedRequest,
        updatedAt: nowIso,
        statusChanged: true,
      },
    };
  } catch (error) {
    if (!transactionClosed) {
      await client.query('ROLLBACK').catch(() => {});
    }
    throw error;
  } finally {
    client.release();
  }
}

export async function fulfillAdminPayoutRequest(payload = {}) {
  const requestId = normalizeText(payload?.id);
  if (!requestId) {
    return {
      success: false,
      status: 400,
      error: 'Payout request id is required.',
    };
  }

  const transferMode = normalizeTransferMode(payload?.transferMode || payload?.mode || STRIPE_TRANSFER_MODE_KEY);
  if (!transferMode) {
    return {
      success: false,
      status: 400,
      error: 'A transfer mode is required for payout fulfillment.',
    };
  }

  const client = await pool.connect();
  let transactionClosed = false;

  try {
    await client.query('BEGIN');

    const existingRequest = await readPayoutRequestById(requestId, client, { forUpdate: true });
    if (!existingRequest) {
      await client.query('ROLLBACK');
      transactionClosed = true;
      return {
        success: false,
        status: 404,
        error: 'Payout request not found.',
      };
    }

    const currentStatus = normalizePayoutRequestStatus(existingRequest.status);
    if (isStatusPaid(currentStatus)) {
      await client.query('COMMIT');
      transactionClosed = true;
      return {
        success: true,
        status: 200,
        data: {
          success: true,
          request: existingRequest,
          updatedAt: normalizeText(existingRequest.updatedAt || existingRequest.fulfilledAt || existingRequest.createdAt),
          statusChanged: false,
        },
      };
    }

    if (normalizeCommissionPayoutSourceKey(existingRequest.sourceKey) !== EWALLET_PAYOUT_SOURCE_KEY) {
      await client.query('ROLLBACK');
      transactionClosed = true;
      return {
        success: false,
        status: 400,
        error: 'Only E-Wallet payout requests can be fulfilled through this workflow.',
      };
    }

    const memberUser = await resolveMemberUserFromIdentity({
      userId: existingRequest.requestedByUserId,
      username: existingRequest.requestedByUsername,
      email: existingRequest.requestedByEmail,
    });
    if (!memberUser) {
      await client.query('ROLLBACK');
      transactionClosed = true;
      return {
        success: false,
        status: 404,
        error: 'Member account was not found for this payout request.',
      };
    }
    if (isPendingOrReservationMember(memberUser)) {
      await client.query('ROLLBACK');
      transactionClosed = true;
      return buildAccountUpgradeRequiredResult();
    }
    if (isInactiveMemberForPayout(memberUser)) {
      await client.query('ROLLBACK');
      transactionClosed = true;
      return buildActiveAccountRequiredResult();
    }

    const amount = roundCurrencyAmount(existingRequest.amount);
    const walletReadiness = await resolveWalletRequestabilityForAmount(memberUser, amount, client, {
      excludeRequestId: requestId,
    });
    if (!walletReadiness.success) {
      await client.query('ROLLBACK');
      transactionClosed = true;
      return walletReadiness;
    }

    const nowIso = new Date().toISOString();
    let requestInProgress = existingRequest;
    if (currentStatus !== PAYOUT_STATUS_LABELS.processing) {
      requestInProgress = applyStatusTransition(existingRequest, PAYOUT_STATUS_LABELS.processing, {
        changedAt: nowIso,
        note: 'Payout fulfillment started.',
        ...resolveRequestActor(payload),
        metadata: payload?.metadata,
        transferMode,
        gatewayStatus: 'processing',
      });
      requestInProgress = await updatePayoutRequestById(requestInProgress, client);
      if (!requestInProgress) {
        await client.query('ROLLBACK');
        transactionClosed = true;
        return {
          success: false,
          status: 500,
          error: 'Unable to set payout request to processing.',
        };
      }
    }

    let fulfillmentGatewayMeta = {
      gatewayKey: normalizeText(requestInProgress.gatewayKey || transferMode || 'manual'),
      gatewayLabel: normalizeText(requestInProgress.gatewayLabel || resolveFulfillmentGatewayLabel(transferMode)),
      gatewayRoute: normalizeText(requestInProgress.gatewayRoute || resolveFulfillmentGatewayRoute(transferMode)),
      gatewayStatus: 'succeeded',
      gatewayReference: normalizeText(payload?.gatewayReference || payload?.transferReference || requestInProgress.gatewayReference),
      gatewayMessage: normalizeText(payload?.gatewayMessage || payload?.generalInfo || ''),
      transferReference: normalizeText(payload?.transferReference || requestInProgress.transferReference),
      transferMode,
      stripeConnectAccountId: normalizeText(requestInProgress.stripeConnectAccountId),
    };

    if (transferMode === STRIPE_TRANSFER_MODE_KEY) {
      const payoutEligibility = await resolveStripePayoutEligibilityForMember(memberUser, {
        fetchRemote: true,
      });
      if (!payoutEligibility.success) {
        const failedRequest = applyStatusTransition(requestInProgress, PAYOUT_STATUS_LABELS.failed, {
          changedAt: nowIso,
          note: payoutEligibility.error,
          ...resolveRequestActor(payload),
          metadata: payload?.metadata,
          transferMode,
          gatewayStatus: 'failed',
          gatewayMessage: payoutEligibility.error,
        });
        const savedFailedRequest = await updatePayoutRequestById(failedRequest, client);
        await client.query('COMMIT');
        transactionClosed = true;
        return {
          success: false,
          status: payoutEligibility.status || 400,
          error: payoutEligibility.error,
          data: {
            request: savedFailedRequest || failedRequest,
          },
        };
      }

      try {
        const stripeResult = await executeStripeTransferForPayoutRequest(requestInProgress, memberUser, {
          connectAccountId: payoutEligibility.connectAccountId,
          currencyCode: DEFAULT_CURRENCY_CODE,
          payoutMethod: normalizeStripeConnectedPayoutMethod(
            payload?.stripePayoutMethod || payload?.payoutMethod || resolveStripeConnectedPayoutMethod(),
          ),
        });
        fulfillmentGatewayMeta = {
          ...fulfillmentGatewayMeta,
          ...stripeResult,
        };
      } catch (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : 'Stripe payout transfer failed.';
        const failedRequest = applyStatusTransition(requestInProgress, PAYOUT_STATUS_LABELS.failed, {
          changedAt: nowIso,
          note: errorMessage,
          ...resolveRequestActor(payload),
          metadata: payload?.metadata,
          transferMode,
          gatewayKey: STRIPE_GATEWAY_KEY,
          gatewayLabel: STRIPE_GATEWAY_LABEL,
          gatewayRoute: resolveFulfillmentGatewayRoute(STRIPE_TRANSFER_MODE_KEY),
          gatewayStatus: 'failed',
          gatewayMessage: errorMessage,
        });
        const savedFailedRequest = await updatePayoutRequestById(failedRequest, client);
        await client.query('COMMIT');
        transactionClosed = true;
        return {
          success: false,
          status: 502,
          error: errorMessage,
          data: {
            request: savedFailedRequest || failedRequest,
          },
        };
      }
    }

    const updatedWallet = await updateWalletAccountBalanceByUserId(
      memberUser.id,
      walletReadiness.nextWalletBalance,
      client,
    );
    if (!updatedWallet) {
      await client.query('ROLLBACK');
      transactionClosed = true;
      return {
        success: false,
        status: 500,
        error: 'Unable to debit E-Wallet balance during payout fulfillment.',
      };
    }

    const paidRequest = applyStatusTransition(requestInProgress, PAYOUT_STATUS_LABELS.paid, {
      changedAt: nowIso,
      note: normalizeText(payload?.generalInfo || 'Payout fulfilled successfully.'),
      ...resolveRequestActor(payload),
      metadata: payload?.metadata,
      transferMode: fulfillmentGatewayMeta.transferMode,
      fulfilledBy: normalizeText(payload?.updatedBy || payload?.fulfilledBy || 'admin'),
      bankDetails: normalizeText(payload?.bankDetails || requestInProgress.bankDetails),
      generalInfo: normalizeText(payload?.generalInfo || requestInProgress.generalInfo),
      gatewayKey: fulfillmentGatewayMeta.gatewayKey,
      gatewayLabel: fulfillmentGatewayMeta.gatewayLabel,
      gatewayRoute: fulfillmentGatewayMeta.gatewayRoute,
      gatewayStatus: fulfillmentGatewayMeta.gatewayStatus,
      gatewayReference: fulfillmentGatewayMeta.gatewayReference,
      gatewayMessage: fulfillmentGatewayMeta.gatewayMessage,
      transferReference: fulfillmentGatewayMeta.transferReference,
    });
    const savedPaidRequest = await updatePayoutRequestById({
      ...paidRequest,
      stripeConnectAccountId: normalizeText(
        fulfillmentGatewayMeta.stripeConnectAccountId || requestInProgress.stripeConnectAccountId,
      ),
    }, client);
    if (!savedPaidRequest) {
      await client.query('ROLLBACK');
      transactionClosed = true;
      return {
        success: false,
        status: 500,
        error: 'Unable to finalize payout request fulfillment.',
      };
    }

    await client.query('COMMIT');
    transactionClosed = true;

    return {
      success: true,
      status: 200,
      data: {
        success: true,
        request: savedPaidRequest,
        updatedAt: nowIso,
        statusChanged: true,
      },
    };
  } catch (error) {
    if (!transactionClosed) {
      await client.query('ROLLBACK').catch(() => {});
    }
    throw error;
  } finally {
    client.release();
  }
}

export async function retryEligibleFailedStripePayoutRequests(options = {}) {
  const forceRetry = options?.force === true;
  const trigger = normalizeText(options?.trigger || options?.reason || 'interval');
  if (!forceRetry && !resolvePayoutAutoRetryEnabled()) {
    return {
      success: true,
      status: 200,
      data: {
        skipped: true,
        reason: 'disabled',
        trigger,
        processedCount: 0,
        paidCount: 0,
        failedCount: 0,
      },
    };
  }

  if (failedStripeRetrySweepInFlight) {
    return {
      success: true,
      status: 200,
      data: {
        skipped: true,
        reason: 'already-in-progress',
        trigger,
        processedCount: 0,
        paidCount: 0,
        failedCount: 0,
      },
    };
  }

  failedStripeRetrySweepInFlight = true;
  try {
    const allowAllFailures = options?.allowAllFailures === true || resolvePayoutAutoRetryAllFailuresEnabled();
    const maxAttempts = resolvePayoutAutoRetryMaxAttempts();
    const maxPerCycle = resolvePayoutAutoRetryMaxPerCycle();
    const nowMs = Date.now();
    const allRequests = await readMockPayoutRequestsStore();
    const failedStripeRequests = allRequests.filter((request) => isFailedStripePayoutRequest(request));

    const eligibleCandidates = failedStripeRequests
      .map((request) => {
        const retryAttemptCount = resolveRetryAttemptCountFromStatusHistory(request);
        const nextAttemptNumber = retryAttemptCount + 1;
        if (retryAttemptCount >= maxAttempts) {
          return null;
        }
        if (!allowAllFailures && !isRetryableInsufficientFundsFailure(request)) {
          return null;
        }

        const latestFailureAtMs = resolveLatestFailureTimestampMs(request);
        const retryDelayMs = resolveRetryBackoffDelayMs(nextAttemptNumber);
        const nextEligibleAtMs = latestFailureAtMs > 0 ? latestFailureAtMs + retryDelayMs : 0;
        const dueToRetry = forceRetry || nextEligibleAtMs === 0 || nowMs >= nextEligibleAtMs;
        if (!dueToRetry) {
          return null;
        }

        return {
          request,
          retryAttemptCount,
          nextAttemptNumber,
          latestFailureAtMs,
          retryDelayMs,
          nextEligibleAtMs,
        };
      })
      .filter(Boolean)
      .sort((left, right) => (
        (left.nextEligibleAtMs || 0) - (right.nextEligibleAtMs || 0)
      ))
      .slice(0, maxPerCycle);

    const processed = [];
    for (const candidate of eligibleCandidates) {
      const requestId = normalizeText(candidate?.request?.id);
      if (!requestId) {
        continue;
      }

      const retryNote = `Auto-retry attempt ${candidate.nextAttemptNumber} (${trigger || 'interval'}).`;
      const retryMetadata = {
        retryAttempt: candidate.nextAttemptNumber,
        retryTrigger: trigger || 'interval',
        retryForced: forceRetry,
        retryRetryableFailureScope: allowAllFailures ? 'all' : 'insufficient-funds',
        retryDelayMs: candidate.retryDelayMs,
        retryPreviousFailureAt: candidate.latestFailureAtMs > 0
          ? new Date(candidate.latestFailureAtMs).toISOString()
          : '',
      };

      try {
        const retryResult = await fulfillAdminPayoutRequest({
          id: requestId,
          transferMode: STRIPE_TRANSFER_MODE_KEY,
          generalInfo: retryNote,
          note: retryNote,
          updatedBy: RETRY_ACTOR_KEY,
          fulfilledBy: RETRY_ACTOR_KEY,
          actorKey: RETRY_ACTOR_KEY,
          actorLabel: 'System Auto Retry',
          metadata: retryMetadata,
        });

        processed.push({
          requestId,
          success: retryResult?.success === true,
          status: Number(retryResult?.status || 0),
          error: normalizeText(retryResult?.error),
          nextAttemptNumber: candidate.nextAttemptNumber,
        });
      } catch (error) {
        processed.push({
          requestId,
          success: false,
          status: 500,
          error: error instanceof Error ? error.message : 'Retry sweep failed unexpectedly.',
          nextAttemptNumber: candidate.nextAttemptNumber,
        });
      }
    }

    const paidCount = processed.filter((entry) => entry.success).length;
    const failedCount = processed.length - paidCount;
    return {
      success: true,
      status: 200,
      data: {
        skipped: false,
        trigger,
        forced: forceRetry,
        scannedCount: failedStripeRequests.length,
        eligibleCount: eligibleCandidates.length,
        processedCount: processed.length,
        paidCount,
        failedCount,
        maxAttempts,
        maxPerCycle,
        processed,
      },
    };
  } finally {
    failedStripeRetrySweepInFlight = false;
  }
}
