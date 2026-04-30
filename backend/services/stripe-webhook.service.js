import {
  completeStoreCheckoutPaymentIntent,
  completeStoreCheckoutSession,
} from './store-checkout.service.js';
import pool from '../db/db.js';
import {
  completeRegisteredMemberCheckoutSession,
  completeRegisteredMemberPaymentIntent,
} from './member.service.js';
import { syncStoreInvoiceStripeDetails } from './invoice.service.js';
import {
  findUserStripeProfileByConnectAccountId,
  updateUserStripeConnectProfileById,
} from '../stores/user.store.js';
import {
  normalizePayoutRequestStatus,
  readPayoutRequestById,
  readPayoutRequestByGatewayReference,
  readPayoutRequestByTransferReference,
  sanitizePayoutRequestRecord,
  updatePayoutRequestById,
} from '../stores/payout.store.js';
import {
  ensureWalletTables,
  lockWalletAccountsByUserIds,
  updateWalletAccountBalanceByUserId,
  upsertWalletAccount,
} from '../stores/wallet.store.js';
import {
  linkStripeCustomerToUserIdentity,
  resolveStripeCustomerId,
} from './stripe-client.service.js';
import {
  ensureStripeWebhookEventTable,
  insertStripeWebhookEvent,
  readStripeWebhookEventByEventId,
} from '../stores/stripe-webhook-event.store.js';
import {
  handleAutoShipCheckoutSessionCompleted,
  handleAutoShipInvoicePaymentFailed,
  handleAutoShipInvoicePaymentSucceeded,
  handleAutoShipSubscriptionDeleted,
  handleAutoShipSubscriptionUpdated,
  isAutoShipStripeMetadataCandidate,
} from './auto-ship.service.js';
import { retryEligibleFailedStripePayoutRequests } from './payout.service.js';

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeEmail(value) {
  const normalized = normalizeText(value).toLowerCase();
  return normalized.includes('@') ? normalized : '';
}

function normalizeStripeUrl(value) {
  const normalized = normalizeText(value);
  if (!normalized) {
    return '';
  }
  if (!normalized.startsWith('https://') && !normalized.startsWith('http://')) {
    return '';
  }
  return normalized;
}

function resolveMetadataFromObject(source = null) {
  if (!source || typeof source !== 'object') {
    return {};
  }
  if (source.metadata && typeof source.metadata === 'object') {
    return source.metadata;
  }
  return {};
}

function resolveWebhookIdentityFromMetadata(metadata = {}, fallback = {}) {
  return {
    userId: normalizeText(
      metadata.buyer_user_id
      || metadata.user_id
      || fallback.userId,
    ),
    username: normalizeText(
      metadata.buyer_username
      || metadata.member_username
      || metadata.username
      || fallback.username,
    ),
    email: normalizeEmail(
      metadata.buyer_email
      || metadata.email
      || fallback.email,
    ),
  };
}

function normalizePayoutStatusForWebhook(statusInput) {
  return normalizePayoutRequestStatus(statusInput);
}

function buildPayoutStatusHistoryFromWebhook(request = {}, nextStatusInput, noteInput = '', metadataInput = {}) {
  const currentStatus = normalizePayoutStatusForWebhook(request?.status);
  const nextStatus = normalizePayoutStatusForWebhook(nextStatusInput);
  if (currentStatus === nextStatus) {
    return Array.isArray(request?.statusHistory) ? request.statusHistory : [];
  }

  const metadata = metadataInput && typeof metadataInput === 'object' && !Array.isArray(metadataInput)
    ? metadataInput
    : {};
  const history = Array.isArray(request?.statusHistory) ? request.statusHistory : [];
  return [
    ...history,
    {
      id: `payout-webhook-${Date.now()}`,
      fromStatus: currentStatus,
      toStatus: nextStatus,
      actorKey: 'stripe-webhook',
      actorLabel: 'Stripe Webhook',
      note: normalizeText(noteInput),
      metadata,
      changedAt: new Date().toISOString(),
    },
  ];
}

function roundCurrencyAmount(valueInput) {
  return Math.round((Math.max(0, Number(valueInput) || 0)) * 100) / 100;
}

async function restoreWalletBalanceFromPayoutRequest(matchedRequest = null) {
  const userId = normalizeText(matchedRequest?.requestedByUserId);
  if (!matchedRequest || !userId) {
    return;
  }

  await ensureWalletTables().catch(() => {});
  await upsertWalletAccount({
    userId,
    username: normalizeText(matchedRequest?.requestedByUsername),
    email: normalizeText(matchedRequest?.requestedByEmail),
    accountName: normalizeText(matchedRequest?.requestedByName),
    currencyCode: 'USD',
    startingBalance: 0,
  }).catch(() => {});

  const lockedAccounts = await lockWalletAccountsByUserIds([userId]).catch(() => []);
  const matchedWallet = Array.isArray(lockedAccounts)
    ? lockedAccounts.find((account) => normalizeText(account?.userId) === userId)
    : null;
  if (!matchedWallet) {
    return;
  }

  const currentBalance = roundCurrencyAmount(matchedWallet.balance);
  const restoredBalance = roundCurrencyAmount(currentBalance + roundCurrencyAmount(matchedRequest?.amount));
  await updateWalletAccountBalanceByUserId(userId, restoredBalance).catch(() => {});
}

async function resolvePayoutRequestFromStripeReferences(payloadObject = null, options = {}) {
  const object = payloadObject && typeof payloadObject === 'object'
    ? payloadObject
    : {};
  const metadata = object.metadata && typeof object.metadata === 'object'
    ? object.metadata
    : {};

  const payoutRequestId = normalizeText(
    options?.payoutRequestId
    || metadata.payout_request_id
    || metadata.payoutRequestId,
  );
  if (payoutRequestId) {
    const byId = await readPayoutRequestById(payoutRequestId).catch(() => null);
    if (byId) {
      return byId;
    }
  }

  const gatewayReference = normalizeText(
    options?.gatewayReference
    || object.id
    || metadata.payout_id
    || metadata.payoutId,
  );
  if (gatewayReference) {
    const byGatewayReference = await readPayoutRequestByGatewayReference(gatewayReference).catch(() => null);
    if (byGatewayReference) {
      return byGatewayReference;
    }
  }

  const transferReference = normalizeText(
    options?.transferReference
    || object.transfer
    || metadata.transfer_id
    || metadata.transferId,
  );
  if (transferReference) {
    return readPayoutRequestByTransferReference(transferReference).catch(() => null);
  }

  return null;
}

async function handleConnectAccountUpdated(accountObject = null) {
  if (!accountObject || typeof accountObject !== 'object') {
    return;
  }

  const connectAccountId = normalizeText(accountObject.id);
  if (!connectAccountId) {
    return;
  }

  const matchedProfile = await findUserStripeProfileByConnectAccountId(connectAccountId).catch(() => null);
  if (!matchedProfile?.id) {
    return;
  }

  const detailsSubmitted = accountObject.details_submitted === true;
  const payoutsEnabled = accountObject.payouts_enabled === true;
  const chargesEnabled = accountObject.charges_enabled === true;
  const onboardingComplete = detailsSubmitted && payoutsEnabled;

  await updateUserStripeConnectProfileById(matchedProfile.id, {
    stripeConnectAccountId: connectAccountId,
    stripeConnectDetailsSubmitted: detailsSubmitted,
    stripeConnectPayoutsEnabled: payoutsEnabled,
    stripeConnectChargesEnabled: chargesEnabled,
    stripeConnectOnboardingComplete: onboardingComplete,
    stripeConnectLastSyncedAt: new Date().toISOString(),
  }).catch(() => {});
}

async function handleTransferReversed(transferObject = null) {
  if (!transferObject || typeof transferObject !== 'object') {
    return;
  }

  const transferId = normalizeText(transferObject.id);
  if (!transferId) {
    return;
  }

  const matchedRequest = await resolvePayoutRequestFromStripeReferences(transferObject, {
    transferReference: transferId,
    gatewayReference: transferId,
  });
  if (!matchedRequest) {
    return;
  }

  const currentStatus = normalizePayoutStatusForWebhook(matchedRequest.status);
  if (currentStatus === 'Failed' || currentStatus === 'Cancelled') {
    return;
  }

  const nowIso = new Date().toISOString();
  const failureMessage = normalizeText(transferObject.failure_message || 'Stripe transfer was reversed.');
  const updatedRequest = sanitizePayoutRequestRecord({
    ...matchedRequest,
    status: 'Failed',
    updatedAt: nowIso,
    failedAt: nowIso,
    gatewayStatus: 'reversed',
    gatewayMessage: failureMessage,
    statusHistory: buildPayoutStatusHistoryFromWebhook(
      matchedRequest,
      'Failed',
      failureMessage,
      {
        transferId,
        event: 'transfer.reversed',
      },
    ),
  }, matchedRequest.id);

  await updatePayoutRequestById(updatedRequest).catch(() => {});

  if (currentStatus === 'Paid') {
    await restoreWalletBalanceFromPayoutRequest(matchedRequest);
  }
}

async function handlePayoutPaid(payoutObject = null) {
  if (!payoutObject || typeof payoutObject !== 'object') {
    return;
  }

  const payoutId = normalizeText(payoutObject.id);
  if (!payoutId) {
    return;
  }

  const matchedRequest = await resolvePayoutRequestFromStripeReferences(payoutObject, {
    gatewayReference: payoutId,
  });
  if (!matchedRequest) {
    return;
  }

  const currentStatus = normalizePayoutStatusForWebhook(matchedRequest.status);
  if (currentStatus === 'Failed' || currentStatus === 'Cancelled') {
    return;
  }

  const nowIso = new Date().toISOString();
  const nextStatus = 'Paid';
  const updatedRequest = sanitizePayoutRequestRecord({
    ...matchedRequest,
    status: nextStatus,
    updatedAt: nowIso,
    gatewayStatus: 'paid',
    gatewayReference: payoutId,
    gatewayMessage: normalizeText(
      payoutObject.failure_message
      || 'Stripe payout reached paid status.',
    ),
    statusHistory: currentStatus === 'Paid'
      ? matchedRequest.statusHistory
      : buildPayoutStatusHistoryFromWebhook(
        matchedRequest,
        nextStatus,
        'Stripe payout reached paid status.',
        {
          payoutId,
          transferId: normalizeText(payoutObject?.metadata?.transfer_id || payoutObject?.transfer),
          event: 'payout.paid',
        },
      ),
  }, matchedRequest.id);

  await updatePayoutRequestById(updatedRequest).catch(() => {});
}

async function handlePayoutFailed(payoutObject = null) {
  if (!payoutObject || typeof payoutObject !== 'object') {
    return;
  }

  const payoutId = normalizeText(payoutObject.id);
  if (!payoutId) {
    return;
  }

  const matchedRequest = await resolvePayoutRequestFromStripeReferences(payoutObject, {
    gatewayReference: payoutId,
  });
  if (!matchedRequest) {
    return;
  }

  const currentStatus = normalizePayoutStatusForWebhook(matchedRequest.status);
  if (currentStatus === 'Failed' || currentStatus === 'Cancelled') {
    return;
  }

  const nowIso = new Date().toISOString();
  const failureMessage = normalizeText(
    payoutObject.failure_message
    || payoutObject.failure_code
    || 'Stripe payout failed.',
  );
  const updatedRequest = sanitizePayoutRequestRecord({
    ...matchedRequest,
    status: 'Failed',
    updatedAt: nowIso,
    failedAt: nowIso,
    gatewayStatus: normalizeText(payoutObject.status || 'failed'),
    gatewayReference: payoutId,
    gatewayMessage: failureMessage,
    statusHistory: buildPayoutStatusHistoryFromWebhook(
      matchedRequest,
      'Failed',
      failureMessage,
      {
        payoutId,
        transferId: normalizeText(payoutObject?.metadata?.transfer_id || payoutObject?.transfer),
        event: `payout.${normalizeText(payoutObject?.status || 'failed').toLowerCase() || 'failed'}`,
      },
    ),
  }, matchedRequest.id);

  await updatePayoutRequestById(updatedRequest).catch(() => {});

  if (currentStatus === 'Paid') {
    await restoreWalletBalanceFromPayoutRequest(matchedRequest);
  }
}

async function handleBalanceAvailable(balanceObject = null) {
  const available = Array.isArray(balanceObject?.available) ? balanceObject.available : [];
  const hasPositiveAmount = available.some((entry) => Number(entry?.amount || 0) > 0);
  if (!hasPositiveAmount) {
    return {
      trigger: 'stripe.balance.available',
      processedCount: 0,
      paidCount: 0,
      failedCount: 0,
      skipped: true,
      reason: 'no-positive-available-balance',
    };
  }

  const retrySummary = await retryEligibleFailedStripePayoutRequests({
    force: true,
    trigger: 'stripe.balance.available',
  }).catch(() => null);
  return {
    trigger: 'stripe.balance.available',
    processedCount: Number(retrySummary?.data?.processedCount || 0),
    paidCount: Number(retrySummary?.data?.paidCount || 0),
    failedCount: Number(retrySummary?.data?.failedCount || 0),
    skipped: retrySummary?.data?.skipped === true,
    reason: normalizeText(retrySummary?.data?.reason),
  };
}

function resolveInvoiceSyncPayloadFromInvoiceObject(invoice = null) {
  if (!invoice || typeof invoice !== 'object') {
    return null;
  }

  const metadata = resolveMetadataFromObject(invoice);
  return {
    invoiceId: normalizeText(metadata.invoice_id).toUpperCase(),
    stripeCustomerId: resolveStripeCustomerId(invoice.customer),
    stripeInvoiceId: normalizeText(invoice.id),
    stripeInvoiceNumber: normalizeText(invoice.number),
    stripeInvoiceHostedUrl: normalizeStripeUrl(invoice.hosted_invoice_url),
    stripeInvoicePdfUrl: normalizeStripeUrl(invoice.invoice_pdf),
    stripePaymentStatus: normalizeText(invoice.status || invoice.collection_status || invoice.payment_status),
  };
}

function isEnrollmentFlowMetadata(metadata = {}) {
  const checkoutType = normalizeText(metadata.checkout_type).toLowerCase();
  const flow = normalizeText(metadata.flow || metadata.payment_flow).toLowerCase();
  if (checkoutType === 'member-enrollment') {
    return true;
  }
  if (flow === 'member-enrollment') {
    return true;
  }
  return Boolean(normalizeText(metadata.enrollment_package));
}

function isAutoShipCheckoutSession(session = null, metadata = {}) {
  if (isAutoShipStripeMetadataCandidate(metadata)) {
    return true;
  }
  const mode = normalizeText(session?.mode).toLowerCase();
  if (mode !== 'subscription') {
    return false;
  }
  const autoShipProductKey = normalizeText(
    metadata?.autoship_product_key
    || metadata?.selected_product_key
    || '',
  ).toLowerCase();
  return autoShipProductKey === 'metacharge' || autoShipProductKey === 'metaroast';
}

function buildWebhookSummaryPayload(event = {}, result = {}) {
  const summary = {};
  const resultObject = result && typeof result === 'object' ? result : {};

  const stripeObjectId = normalizeText(event?.data?.object?.id);
  if (stripeObjectId) {
    summary.objectId = stripeObjectId;
  }

  const userId = normalizeText(resultObject?.userId);
  if (userId) {
    summary.userId = userId;
  }

  const stripeInvoiceId = normalizeText(resultObject?.stripeInvoiceId);
  if (stripeInvoiceId) {
    summary.stripeInvoiceId = stripeInvoiceId;
  }

  const stripeSubscriptionId = normalizeText(resultObject?.stripeSubscriptionId);
  if (stripeSubscriptionId) {
    summary.stripeSubscriptionId = stripeSubscriptionId;
  }

  const settingStatus = normalizeText(resultObject?.settingStatus || resultObject?.status);
  if (settingStatus) {
    summary.status = settingStatus;
  }

  if (resultObject?.idempotent === true) {
    summary.idempotent = true;
  }

  if (resultObject?.retrySummary && typeof resultObject.retrySummary === 'object') {
    summary.retrySummary = {
      processedCount: Number(resultObject.retrySummary.processedCount || 0),
      paidCount: Number(resultObject.retrySummary.paidCount || 0),
      failedCount: Number(resultObject.retrySummary.failedCount || 0),
      skipped: resultObject.retrySummary.skipped === true,
      reason: normalizeText(resultObject.retrySummary.reason),
    };
  }

  return summary;
}

async function syncStoreInvoiceFromPaymentIntent(paymentIntent = null) {
  const metadata = resolveMetadataFromObject(paymentIntent);
  const syncResult = await syncStoreInvoiceStripeDetails({
    invoiceId: normalizeText(metadata.invoice_id).toUpperCase(),
    stripeCustomerId: resolveStripeCustomerId(paymentIntent?.customer),
    stripePaymentIntentId: normalizeText(paymentIntent?.id),
    stripeInvoiceId: normalizeText(paymentIntent?.latest_charge?.invoice?.id || paymentIntent?.invoice),
    stripeInvoiceNumber: normalizeText(paymentIntent?.latest_charge?.invoice?.number),
    stripeInvoiceHostedUrl: normalizeStripeUrl(paymentIntent?.latest_charge?.invoice?.hosted_invoice_url),
    stripeInvoicePdfUrl: normalizeStripeUrl(paymentIntent?.latest_charge?.invoice?.invoice_pdf),
    stripePaymentStatus: normalizeText(paymentIntent?.status),
  });

  return syncResult;
}

async function handleCheckoutSessionCompleted(checkoutSession = null, event = null) {
  const session = checkoutSession && typeof checkoutSession === 'object'
    ? checkoutSession
    : null;
  if (!session?.id) {
    return {
      handled: false,
      reason: 'empty-checkout-session',
    };
  }

  const metadata = resolveMetadataFromObject(session);
  if (isAutoShipCheckoutSession(session, metadata)) {
    const autoShipResult = await handleAutoShipCheckoutSessionCompleted(session, event);
    return autoShipResult || {
      handled: false,
      reason: 'autoship-checkout-unhandled',
    };
  }

  if (isEnrollmentFlowMetadata(metadata)) {
    await completeRegisteredMemberCheckoutSession({
      sessionId: normalizeText(session.id),
    });
  } else {
    await completeStoreCheckoutSession({
      sessionId: normalizeText(session.id),
    });
  }

  const customerId = resolveStripeCustomerId(session.customer);
  if (customerId) {
    const identity = resolveWebhookIdentityFromMetadata(metadata, {
      email: normalizeEmail(session.customer_details?.email),
    });
    await linkStripeCustomerToUserIdentity({
      customerId,
      userId: identity.userId,
      username: identity.username,
      email: identity.email,
    }).catch(() => {});
  }

  await syncStoreInvoiceStripeDetails({
    invoiceId: normalizeText(metadata.invoice_id).toUpperCase(),
    stripeCheckoutSessionId: normalizeText(session.id),
    stripePaymentIntentId: resolveStripeCustomerId(session.payment_intent),
    stripeCustomerId: customerId,
    stripeInvoiceId: resolveStripeCustomerId(session.invoice),
    stripePaymentStatus: normalizeText(session.payment_status),
  }).catch(() => {});

  return {
    handled: true,
    category: 'checkout-session',
  };
}

async function handlePaymentIntentSucceeded(paymentIntent = null) {
  const stripePaymentIntent = paymentIntent && typeof paymentIntent === 'object'
    ? paymentIntent
    : null;
  if (!stripePaymentIntent?.id) {
    return;
  }

  const metadata = resolveMetadataFromObject(stripePaymentIntent);
  if (isEnrollmentFlowMetadata(metadata)) {
    await completeRegisteredMemberPaymentIntent({
      paymentIntentId: normalizeText(stripePaymentIntent.id),
    });
  } else {
    await completeStoreCheckoutPaymentIntent({
      paymentIntentId: normalizeText(stripePaymentIntent.id),
    });
  }

  const identity = resolveWebhookIdentityFromMetadata(metadata, {
    email: normalizeEmail(stripePaymentIntent.receipt_email),
  });
  await linkStripeCustomerToUserIdentity({
    customerId: resolveStripeCustomerId(stripePaymentIntent.customer),
    userId: identity.userId,
    username: identity.username,
    email: identity.email,
  }).catch(() => {});

  await syncStoreInvoiceFromPaymentIntent(stripePaymentIntent).catch(() => {});
}

async function handlePaymentIntentStatusUpdate(paymentIntent = null) {
  const stripePaymentIntent = paymentIntent && typeof paymentIntent === 'object'
    ? paymentIntent
    : null;
  if (!stripePaymentIntent?.id) {
    return;
  }

  await syncStoreInvoiceFromPaymentIntent(stripePaymentIntent).catch(() => {});
}

async function handleInvoiceEvent(invoice = null) {
  const payload = resolveInvoiceSyncPayloadFromInvoiceObject(invoice);
  if (!payload) {
    return {
      handled: false,
      reason: 'empty-invoice',
    };
  }

  await syncStoreInvoiceStripeDetails(payload).catch(() => {});

  const metadata = resolveMetadataFromObject(invoice);
  await linkStripeCustomerToUserIdentity({
    customerId: payload.stripeCustomerId,
    userId: normalizeText(metadata.buyer_user_id),
    username: normalizeText(metadata.buyer_username || metadata.member_username),
    email: normalizeEmail(metadata.buyer_email || metadata.email || invoice?.customer_email),
  }).catch(() => {});

  return {
    handled: true,
    category: 'invoice',
  };
}

async function handleInvoicePaymentSucceeded(invoice = null, event = null) {
  const autoShipResult = await handleAutoShipInvoicePaymentSucceeded(invoice, event).catch(() => ({
    handled: false,
  }));
  const invoiceSyncResult = await handleInvoiceEvent(invoice);
  if (autoShipResult?.handled) {
    return {
      handled: true,
      category: autoShipResult?.category || 'autoship-invoice',
      ...autoShipResult,
    };
  }
  return invoiceSyncResult;
}

async function handleInvoicePaymentFailed(invoice = null, event = null) {
  const autoShipResult = await handleAutoShipInvoicePaymentFailed(invoice, event).catch(() => ({
    handled: false,
  }));
  const invoiceSyncResult = await handleInvoiceEvent(invoice);
  if (autoShipResult?.handled) {
    return {
      handled: true,
      category: autoShipResult?.category || 'autoship-invoice-failed',
      ...autoShipResult,
    };
  }
  return invoiceSyncResult;
}

async function dispatchStripeWebhookEvent(event = {}) {
  const eventType = normalizeText(event?.type);
  const eventObject = event?.data?.object || null;
  if (!eventType || !eventObject) {
    return {
      handled: false,
      reason: 'empty-event',
    };
  }

  switch (eventType) {
    case 'checkout.session.completed':
      return handleCheckoutSessionCompleted(eventObject, event);
    case 'payment_intent.succeeded':
      await handlePaymentIntentSucceeded(eventObject);
      return {
        handled: true,
        category: 'payment-intent',
      };
    case 'payment_intent.payment_failed':
    case 'payment_intent.canceled':
      await handlePaymentIntentStatusUpdate(eventObject);
      return {
        handled: true,
        category: 'payment-intent-status',
      };
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      return handleAutoShipSubscriptionUpdated(eventObject, event);
    case 'customer.subscription.deleted':
      return handleAutoShipSubscriptionDeleted(eventObject, event);
    case 'invoice.payment_succeeded':
      return handleInvoicePaymentSucceeded(eventObject, event);
    case 'invoice.payment_failed':
      return handleInvoicePaymentFailed(eventObject, event);
    case 'invoice.created':
    case 'invoice.finalized':
    case 'invoice.paid':
    case 'invoice.voided':
    case 'invoice.marked_uncollectible':
      return handleInvoiceEvent(eventObject);
    case 'account.updated':
      await handleConnectAccountUpdated(eventObject);
      return {
        handled: true,
        category: 'connect-account',
      };
    case 'transfer.reversed':
      await handleTransferReversed(eventObject);
      return {
        handled: true,
        category: 'payout-transfer',
      };
    case 'payout.paid':
      await handlePayoutPaid(eventObject);
      return {
        handled: true,
        category: 'payout',
      };
    case 'payout.failed':
    case 'payout.canceled': {
      await handlePayoutFailed(eventObject);
      return {
        handled: true,
        category: 'payout',
      };
    }
    case 'balance.available': {
      const retrySummary = await handleBalanceAvailable(eventObject);
      return {
        handled: true,
        category: 'balance-available',
        retrySummary,
      };
    }
    default:
      return {
        handled: false,
        reason: 'ignored-event',
      };
  }
}

export async function handleStripeWebhookEvent(event = {}) {
  const eventId = normalizeText(event?.id);
  const eventType = normalizeText(event?.type);
  const eventObject = event?.data?.object || null;
  if (!eventType || !eventObject) {
    return {
      handled: false,
      reason: 'empty-event',
    };
  }

  if (!eventId) {
    return dispatchStripeWebhookEvent(event);
  }

  await ensureStripeWebhookEventTable();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`
      SELECT pg_advisory_xact_lock(hashtext($1))
    `, [`stripe-webhook:${eventId}`]);

    const existingEvent = await readStripeWebhookEventByEventId(eventId, client, { forUpdate: true });
    if (existingEvent) {
      await client.query('COMMIT');
      return {
        handled: existingEvent.handled,
        category: normalizeText(existingEvent.category),
        reason: normalizeText(existingEvent.reason) || 'already-processed',
        idempotent: true,
      };
    }

    const dispatchResult = await dispatchStripeWebhookEvent(event);
    const handled = dispatchResult?.handled === true;
    const category = normalizeText(dispatchResult?.category);
    const reason = normalizeText(dispatchResult?.reason);
    const summary = buildWebhookSummaryPayload(event, dispatchResult);

    await insertStripeWebhookEvent({
      eventId,
      eventType,
      handled,
      category,
      reason,
      summary,
      processedAt: new Date().toISOString(),
    }, client);

    await client.query('COMMIT');
    return dispatchResult;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}
