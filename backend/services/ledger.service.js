import {
  ensureLedgerTables,
  getLedgerSummary,
  insertLedgerEntry,
  listLedgerEntries,
  readLedgerEntryById,
  readLedgerEntryByIdempotencyKey,
  updateLedgerEntryStatusById,
} from '../stores/ledger.store.js';
import { findUserById, findUserByIdentifier } from '../stores/user.store.js';
import {
  LEDGER_ENTRY_DIRECTIONS,
  LEDGER_ENTRY_STATUSES,
  LEDGER_ENTRY_TYPES,
  LEDGER_SOURCE_TYPES,
  createLedgerRecordId,
  isLedgerCreditDirection,
  normalizeCredential,
  normalizeLedgerDirection,
  normalizeLedgerIdempotencyKey,
  normalizeLedgerStatus,
  normalizeText,
  roundCurrencyAmount,
  toUpperEnum,
  toWholeNumber,
} from '../utils/ledger.helpers.js';

const LEDGER_SERVICE_DEFAULT_DEPENDENCIES = Object.freeze({
  ensureLedgerTables,
  getLedgerSummary,
  insertLedgerEntry,
  listLedgerEntries,
  readLedgerEntryById,
  readLedgerEntryByIdempotencyKey,
  updateLedgerEntryStatusById,
  findUserById,
  findUserByIdentifier,
});

const ledgerServiceDependencies = {
  ...LEDGER_SERVICE_DEFAULT_DEPENDENCIES,
};

export function __setLedgerServiceDependenciesForTests(overrides = {}) {
  if (!overrides || typeof overrides !== 'object') {
    return;
  }

  Object.assign(ledgerServiceDependencies, overrides);
}

export function __resetLedgerServiceDependenciesForTests() {
  Object.assign(ledgerServiceDependencies, LEDGER_SERVICE_DEFAULT_DEPENDENCIES);
}

function buildLedgerDescription(fallback, sourceId) {
  const description = normalizeText(fallback);
  if (description) {
    return description;
  }
  const normalizedSourceId = normalizeText(sourceId);
  return normalizedSourceId ? `Ledger entry for ${normalizedSourceId}` : 'Ledger entry';
}

function toApiLedgerEntry(entry = null) {
  if (!entry || typeof entry !== 'object') {
    return null;
  }

  return {
    ...entry,
    typeCode: toUpperEnum(entry.type),
    directionCode: toUpperEnum(entry.direction),
    statusCode: toUpperEnum(entry.status),
    sourceTypeCode: toUpperEnum(entry.sourceType),
  };
}

function toApiLedgerSummary(summary = {}) {
  const safeSummary = summary && typeof summary === 'object' ? summary : {};
  return {
    totalEarned: roundCurrencyAmount(safeSummary.totalEarned, 0),
    pendingBalance: roundCurrencyAmount(safeSummary.pendingBalance, 0),
    postedBalance: roundCurrencyAmount(safeSummary.postedBalance, 0),
    availableBalance: roundCurrencyAmount(safeSummary.availableBalance, 0),
    paidOutAmount: roundCurrencyAmount(safeSummary.paidOutAmount, 0),
    reversedAmount: roundCurrencyAmount(safeSummary.reversedAmount, 0),
    byStatus: safeSummary.byStatus && typeof safeSummary.byStatus === 'object'
      ? Object.fromEntries(
          Object.entries(safeSummary.byStatus).map(([status, netAmount]) => [
            normalizeLedgerStatus(status, status),
            roundCurrencyAmount(netAmount, 0),
          ]),
        )
      : {},
    byType: safeSummary.byType && typeof safeSummary.byType === 'object'
      ? Object.fromEntries(
          Object.entries(safeSummary.byType).map(([type, value]) => {
            const safeValue = value && typeof value === 'object' ? value : {};
            return [
              normalizeCredential(type),
              {
                count: Math.max(0, Number(safeValue.count || 0)),
                netAmount: roundCurrencyAmount(safeValue.netAmount, 0),
              },
            ];
          }),
        )
      : {},
  };
}

function resolveIdempotencyKeyWithFallback(candidate, fallback) {
  const normalizedCandidate = normalizeLedgerIdempotencyKey(candidate);
  if (normalizedCandidate) {
    return normalizedCandidate;
  }
  return normalizeLedgerIdempotencyKey(fallback);
}

function resolveLedgerEntryStatusFromInvoiceStatus(invoiceStatusInput, fallbackStatus = LEDGER_ENTRY_STATUSES.POSTED) {
  const normalizedInvoiceStatus = normalizeCredential(invoiceStatusInput);
  if (normalizedInvoiceStatus === 'pending') {
    return LEDGER_ENTRY_STATUSES.PENDING;
  }
  if (normalizedInvoiceStatus === 'failed') {
    return LEDGER_ENTRY_STATUSES.FAILED;
  }
  if (normalizedInvoiceStatus === 'reversed') {
    return LEDGER_ENTRY_STATUSES.REVERSED;
  }
  if (normalizedInvoiceStatus === 'paid') {
    return LEDGER_ENTRY_STATUSES.PAID;
  }
  if (normalizedInvoiceStatus === 'posted') {
    return LEDGER_ENTRY_STATUSES.POSTED;
  }
  return normalizeLedgerStatus(fallbackStatus, LEDGER_ENTRY_STATUSES.POSTED);
}

export function resolveLedgerStatusFromInvoiceStatus(invoiceStatusInput, fallbackStatus = LEDGER_ENTRY_STATUSES.POSTED) {
  return resolveLedgerEntryStatusFromInvoiceStatus(invoiceStatusInput, fallbackStatus);
}

function buildRetailCommissionMetadata(payload = {}) {
  return {
    buyer: {
      userId: normalizeText(payload?.buyerUserId),
      username: normalizeText(payload?.buyerUsername),
      email: normalizeText(payload?.buyerEmail),
      name: normalizeText(payload?.buyerName),
    },
    storeOwner: {
      userId: normalizeText(payload?.storeOwnerUserId || payload?.userId),
      username: normalizeText(payload?.storeOwnerUsername || payload?.username),
      email: normalizeText(payload?.storeOwnerEmail || payload?.email),
      storeCode: normalizeText(payload?.storeCode),
    },
    package: {
      accountPackageKey: normalizeText(payload?.accountPackageKey || payload?.packageKey),
      accountPackageLabel: normalizeText(payload?.accountPackageLabel || payload?.packageLabel),
      settlementPackageKey: normalizeText(payload?.settlementPackageKey),
    },
    order: {
      orderId: normalizeText(payload?.orderId || payload?.sourceId),
      invoiceId: normalizeText(payload?.invoiceId || payload?.sourceId),
      paymentReference: normalizeText(payload?.paymentReference),
      invoiceStatus: normalizeText(payload?.invoiceStatus),
    },
    checkout: {
      checkoutMode: normalizeText(payload?.checkoutMode),
      attributionKey: normalizeText(payload?.attributionKey),
      memberStoreLink: normalizeText(payload?.memberStoreLink),
      memberStoreCode: normalizeText(payload?.memberStoreCode),
    },
    debug: payload?.debug && typeof payload.debug === 'object' ? payload.debug : {},
  };
}

function buildFastTrackMetadata(payload = {}) {
  return {
    sponsor: {
      userId: normalizeText(payload?.userId),
      username: normalizeText(payload?.username),
      email: normalizeText(payload?.email),
      fastTrackTier: normalizeText(payload?.sponsorFastTrackTier || payload?.fastTrackTier),
    },
    enrolledMember: {
      userId: normalizeText(payload?.enrolledUserId),
      username: normalizeText(payload?.enrolledUsername),
      email: normalizeText(payload?.enrolledEmail),
      name: normalizeText(payload?.enrolledName),
    },
    enrollment: {
      enrollmentId: normalizeText(payload?.enrollmentId || payload?.sourceId),
      packageKey: normalizeText(payload?.packageKey || payload?.enrollmentPackage),
      packageLabel: normalizeText(payload?.packageLabel),
      orderReference: normalizeText(payload?.orderReference),
      paymentReference: normalizeText(payload?.paymentReference),
    },
    debug: payload?.debug && typeof payload.debug === 'object' ? payload.debug : {},
  };
}

function buildSalesTeamMetadata(payload = {}) {
  return {
    cycle: {
      cycleId: normalizeText(payload?.cycleId || payload?.sourceId),
      cycleBatchId: normalizeText(payload?.cycleBatchId || payload?.sourceId),
      cycleCount: Math.max(0, toWholeNumber(payload?.cycleCount, 0)),
      cappedCycleCount: Math.max(0, toWholeNumber(payload?.cappedCycleCount, payload?.cycleCount)),
      overflowCycleCount: Math.max(0, toWholeNumber(payload?.overflowCycleCount, 0)),
      leftBvUsed: Math.max(0, toWholeNumber(payload?.leftBvUsed, 0)),
      rightBvUsed: Math.max(0, toWholeNumber(payload?.rightBvUsed, 0)),
      leftCarryoverBefore: Math.max(0, toWholeNumber(payload?.leftCarryoverBefore, 0)),
      rightCarryoverBefore: Math.max(0, toWholeNumber(payload?.rightCarryoverBefore, 0)),
      leftCarryoverAfter: Math.max(0, toWholeNumber(payload?.leftCarryoverAfter, 0)),
      rightCarryoverAfter: Math.max(0, toWholeNumber(payload?.rightCarryoverAfter, 0)),
    },
    commissionPeriod: {
      startAt: normalizeText(payload?.commissionPeriodStartAt || payload?.periodStartAt),
      endAt: normalizeText(payload?.commissionPeriodEndAt || payload?.periodEndAt),
      label: normalizeText(payload?.commissionPeriodLabel || payload?.periodLabel),
    },
    package: {
      packageKey: normalizeText(payload?.packageKey || payload?.accountPackageKey),
      perCycleAmount: roundCurrencyAmount(payload?.perCycleAmount, 0),
    },
    debug: payload?.debug && typeof payload.debug === 'object' ? payload.debug : {},
  };
}

function buildLeadershipMatchingBonusMetadata(payload = {}) {
  return {
    sourceCommission: {
      salesTeamCommissionId: normalizeText(payload?.sourceSalesTeamCommissionId || payload?.sourceId),
      cycleId: normalizeText(payload?.sourceCycleId || payload?.cycleId),
      cycleBatchId: normalizeText(payload?.sourceCycleBatchId || payload?.cycleBatchId),
      cycleCutoffId: normalizeText(payload?.sourceCycleCutoffId || payload?.cycleCutoffId),
      sourceEarnerUserId: normalizeText(payload?.sourceEarnerUserId),
      sourceEarnerUsername: normalizeText(payload?.sourceEarnerUsername),
      sourceEarnerEmail: normalizeText(payload?.sourceEarnerEmail),
      baseAmount: roundCurrencyAmount(payload?.baseSalesTeamCommissionAmount ?? payload?.baseAmount, 0),
    },
    recipient: {
      userId: normalizeText(payload?.userId || payload?.recipientUserId),
      username: normalizeText(payload?.username || payload?.recipientUsername),
      email: normalizeText(payload?.email || payload?.recipientEmail),
      rank: normalizeText(payload?.recipientRank),
    },
    matching: {
      sponsorLevel: Math.max(1, toWholeNumber(payload?.sponsorLevel, 1)),
      percentage: roundCurrencyAmount(payload?.matchPercentage, 0),
      amount: roundCurrencyAmount(payload?.amountUsd ?? payload?.amount, 0),
    },
    debug: payload?.debug && typeof payload.debug === 'object' ? payload.debug : {},
  };
}

function buildMatchingBonusTransferMetadata(payload = {}) {
  return {
    transfer: {
      transferId: normalizeText(payload?.transferId || payload?.sourceId),
      transactionId: normalizeText(payload?.transactionId),
      sourceBalance: 'matching_bonus',
      destinationBalance: 'wallet',
      previousMatchingBonusBalance: roundCurrencyAmount(payload?.previousMatchingBonusBalance, 0),
      newMatchingBonusBalance: roundCurrencyAmount(payload?.newMatchingBonusBalance, 0),
      previousWalletBalance: roundCurrencyAmount(payload?.previousWalletBalance, 0),
      newWalletBalance: roundCurrencyAmount(payload?.newWalletBalance, 0),
    },
    debug: payload?.debug && typeof payload.debug === 'object' ? payload.debug : {},
  };
}

function buildPayoutMetadata(payload = {}) {
  return {
    payout: {
      payoutRequestId: normalizeText(payload?.payoutRequestId || payload?.sourceId),
      payoutMethod: normalizeText(payload?.payoutMethod),
      transferMode: normalizeText(payload?.transferMode),
      gatewayKey: normalizeText(payload?.gatewayKey),
      gatewayLabel: normalizeText(payload?.gatewayLabel),
      gatewayReference: normalizeText(payload?.gatewayReference),
      transferReference: normalizeText(payload?.transferReference),
    },
    debug: payload?.debug && typeof payload.debug === 'object' ? payload.debug : {},
  };
}

export async function createRetailCommissionLedgerEntry(payload = {}, options = {}) {
  await ledgerServiceDependencies.ensureLedgerTables();

  const userId = normalizeText(payload?.userId || payload?.storeOwnerUserId);
  const amount = roundCurrencyAmount(payload?.amountUsd ?? payload?.amount, 0);
  const sourceId = normalizeText(payload?.sourceId || payload?.orderId || payload?.invoiceId);
  if (!userId || amount <= 0 || !sourceId) {
    return {
      entry: null,
      idempotent: false,
      skipped: true,
    };
  }

  const status = resolveLedgerEntryStatusFromInvoiceStatus(
    payload?.status || payload?.invoiceStatus,
    LEDGER_ENTRY_STATUSES.POSTED,
  );
  const idempotencyKey = resolveIdempotencyKeyWithFallback(
    payload?.idempotencyKey,
    `retail_commission:${sourceId}:${userId}`,
  );

  return ledgerServiceDependencies.insertLedgerEntry({
    userId,
    username: normalizeText(payload?.username || payload?.storeOwnerUsername),
    email: normalizeText(payload?.email || payload?.storeOwnerEmail),
    type: LEDGER_ENTRY_TYPES.RETAIL_COMMISSION,
    direction: LEDGER_ENTRY_DIRECTIONS.CREDIT,
    amount,
    bvAmount: Math.max(0, toWholeNumber(payload?.bvAmount, 0)),
    status,
    sourceType: LEDGER_SOURCE_TYPES.ORDER,
    sourceId,
    sourceRef: normalizeText(payload?.sourceRef || payload?.orderReference || payload?.invoiceNumber || sourceId),
    idempotencyKey,
    description: buildLedgerDescription(payload?.description, `Retail commission from order ${sourceId}`),
    metadata: buildRetailCommissionMetadata(payload),
    postedAt: normalizeText(payload?.postedAt),
    createdAt: normalizeText(payload?.createdAt),
  }, options?.executor);
}

export async function createFastTrackCommissionLedgerEntry(payload = {}, options = {}) {
  await ledgerServiceDependencies.ensureLedgerTables();

  const userId = normalizeText(payload?.userId || payload?.sponsorUserId);
  const amount = roundCurrencyAmount(payload?.amountUsd ?? payload?.amount, 0);
  const sourceId = normalizeText(payload?.sourceId || payload?.enrollmentId || payload?.orderReference);
  if (!userId || amount <= 0 || !sourceId) {
    return {
      entry: null,
      idempotent: false,
      skipped: true,
    };
  }

  const status = normalizeLedgerStatus(payload?.status, LEDGER_ENTRY_STATUSES.POSTED);
  const idempotencyKey = resolveIdempotencyKeyWithFallback(
    payload?.idempotencyKey,
    `fast_track:${sourceId}:${userId}`,
  );

  return ledgerServiceDependencies.insertLedgerEntry({
    userId,
    username: normalizeText(payload?.username || payload?.sponsorUsername),
    email: normalizeText(payload?.email || payload?.sponsorEmail),
    type: LEDGER_ENTRY_TYPES.FAST_TRACK_COMMISSION,
    direction: LEDGER_ENTRY_DIRECTIONS.CREDIT,
    amount,
    bvAmount: Math.max(0, toWholeNumber(payload?.bvAmount, 0)),
    status,
    sourceType: LEDGER_SOURCE_TYPES.ENROLLMENT,
    sourceId,
    sourceRef: normalizeText(payload?.sourceRef || payload?.orderReference || sourceId),
    idempotencyKey,
    description: buildLedgerDescription(payload?.description, `Fast Track commission from enrollment ${sourceId}`),
    metadata: buildFastTrackMetadata(payload),
    postedAt: normalizeText(payload?.postedAt),
    createdAt: normalizeText(payload?.createdAt),
  }, options?.executor);
}

export async function createSalesTeamCommissionLedgerEntry(payload = {}, options = {}) {
  await ledgerServiceDependencies.ensureLedgerTables();

  const userId = normalizeText(payload?.userId);
  const amount = roundCurrencyAmount(payload?.amountUsd ?? payload?.amount, 0);
  const sourceId = normalizeText(payload?.sourceId || payload?.cycleId || payload?.cycleBatchId);
  if (!userId || amount <= 0 || !sourceId) {
    return {
      entry: null,
      idempotent: false,
      skipped: true,
    };
  }

  const status = normalizeLedgerStatus(payload?.status, LEDGER_ENTRY_STATUSES.POSTED);
  const idempotencyKey = resolveIdempotencyKeyWithFallback(
    payload?.idempotencyKey,
    `sales_team_cycle:${sourceId}:${userId}`,
  );

  return ledgerServiceDependencies.insertLedgerEntry({
    userId,
    username: normalizeText(payload?.username),
    email: normalizeText(payload?.email),
    type: LEDGER_ENTRY_TYPES.SALES_TEAM_COMMISSION,
    direction: LEDGER_ENTRY_DIRECTIONS.CREDIT,
    amount,
    bvAmount: Math.max(0, toWholeNumber(payload?.bvAmount, 0)),
    status,
    sourceType: LEDGER_SOURCE_TYPES.BINARY_CYCLE,
    sourceId,
    sourceRef: normalizeText(payload?.sourceRef || payload?.cycleReference || sourceId),
    idempotencyKey,
    description: buildLedgerDescription(payload?.description, `Sales Team commission from cycle ${sourceId}`),
    metadata: buildSalesTeamMetadata(payload),
    postedAt: normalizeText(payload?.postedAt),
    createdAt: normalizeText(payload?.createdAt),
  }, options?.executor);
}

export async function createLeadershipMatchingBonusLedgerEntry(payload = {}, options = {}) {
  await ledgerServiceDependencies.ensureLedgerTables();

  const userId = normalizeText(payload?.userId || payload?.recipientUserId);
  const amount = roundCurrencyAmount(payload?.amountUsd ?? payload?.amount, 0);
  const sourceSalesTeamCommissionId = normalizeText(
    payload?.sourceSalesTeamCommissionId
    || payload?.sourceId
    || payload?.salesTeamCommissionId,
  );
  if (!userId || amount <= 0 || !sourceSalesTeamCommissionId) {
    return {
      entry: null,
      idempotent: false,
      skipped: true,
    };
  }

  const sponsorLevel = Math.max(1, toWholeNumber(payload?.sponsorLevel, 1));
  const status = normalizeLedgerStatus(payload?.status, LEDGER_ENTRY_STATUSES.POSTED);
  const idempotencyKey = resolveIdempotencyKeyWithFallback(
    payload?.idempotencyKey,
    `leadership_matching_bonus:${sourceSalesTeamCommissionId}:${userId}:level:${sponsorLevel}`,
  );

  return ledgerServiceDependencies.insertLedgerEntry({
    userId,
    username: normalizeText(payload?.username || payload?.recipientUsername),
    email: normalizeText(payload?.email || payload?.recipientEmail),
    type: LEDGER_ENTRY_TYPES.LEADERSHIP_MATCHING_BONUS,
    direction: LEDGER_ENTRY_DIRECTIONS.CREDIT,
    amount,
    bvAmount: Math.max(0, toWholeNumber(payload?.bvAmount, 0)),
    status,
    sourceType: LEDGER_SOURCE_TYPES.SALES_TEAM_COMMISSION,
    sourceId: sourceSalesTeamCommissionId,
    sourceRef: normalizeText(payload?.sourceRef || payload?.sourceCycleId || sourceSalesTeamCommissionId),
    idempotencyKey,
    description: buildLedgerDescription(payload?.description, `Leadership matching bonus from Sales Team commission ${sourceSalesTeamCommissionId}`),
    metadata: buildLeadershipMatchingBonusMetadata(payload),
    postedAt: normalizeText(payload?.postedAt),
    createdAt: normalizeText(payload?.createdAt),
  }, options?.executor);
}

export async function createMatchingBonusTransferToWalletLedgerEntry(payload = {}, options = {}) {
  await ledgerServiceDependencies.ensureLedgerTables();

  const userId = normalizeText(payload?.userId);
  const amount = roundCurrencyAmount(payload?.amountUsd ?? payload?.amount, 0);
  const sourceId = normalizeText(payload?.sourceId || payload?.transferId || payload?.transactionId);
  if (!userId || amount <= 0 || !sourceId) {
    return {
      entry: null,
      idempotent: false,
      skipped: true,
    };
  }

  const status = normalizeLedgerStatus(payload?.status, LEDGER_ENTRY_STATUSES.POSTED);
  const idempotencyKey = resolveIdempotencyKeyWithFallback(
    payload?.idempotencyKey,
    `matching_bonus_transfer:${sourceId}:${userId}`,
  );

  return ledgerServiceDependencies.insertLedgerEntry({
    userId,
    username: normalizeText(payload?.username),
    email: normalizeText(payload?.email),
    type: LEDGER_ENTRY_TYPES.MATCHING_BONUS_TRANSFER_TO_WALLET,
    direction: LEDGER_ENTRY_DIRECTIONS.DEBIT,
    amount,
    bvAmount: 0,
    status,
    sourceType: LEDGER_SOURCE_TYPES.COMMISSION_TRANSFER,
    sourceId,
    sourceRef: normalizeText(payload?.sourceRef || sourceId),
    idempotencyKey,
    description: buildLedgerDescription(payload?.description, `Matching Bonus transferred to wallet (${sourceId})`),
    metadata: buildMatchingBonusTransferMetadata(payload),
    postedAt: normalizeText(payload?.postedAt),
    createdAt: normalizeText(payload?.createdAt),
  }, options?.executor);
}

export async function createPayoutLedgerEntry(payload = {}, options = {}) {
  await ledgerServiceDependencies.ensureLedgerTables();

  const userId = normalizeText(payload?.userId);
  const amount = roundCurrencyAmount(payload?.amountUsd ?? payload?.amount, 0);
  const sourceId = normalizeText(payload?.sourceId || payload?.payoutRequestId || payload?.requestId);
  if (!userId || amount <= 0 || !sourceId) {
    return {
      entry: null,
      idempotent: false,
      skipped: true,
    };
  }

  const status = normalizeLedgerStatus(payload?.status, LEDGER_ENTRY_STATUSES.PAID);
  const idempotencyKey = resolveIdempotencyKeyWithFallback(
    payload?.idempotencyKey,
    `payout:${sourceId}:${userId}`,
  );

  return ledgerServiceDependencies.insertLedgerEntry({
    userId,
    username: normalizeText(payload?.username),
    email: normalizeText(payload?.email),
    type: LEDGER_ENTRY_TYPES.PAYOUT,
    direction: LEDGER_ENTRY_DIRECTIONS.DEBIT,
    amount,
    bvAmount: 0,
    status,
    sourceType: LEDGER_SOURCE_TYPES.PAYOUT,
    sourceId,
    sourceRef: normalizeText(payload?.sourceRef || payload?.gatewayReference || sourceId),
    idempotencyKey,
    description: buildLedgerDescription(payload?.description, `Payout processed (${sourceId})`),
    metadata: buildPayoutMetadata(payload),
    postedAt: normalizeText(payload?.postedAt),
    createdAt: normalizeText(payload?.createdAt),
  }, options?.executor);
}

export async function createAdminAdjustmentLedgerEntry(payload = {}, options = {}) {
  await ledgerServiceDependencies.ensureLedgerTables();

  const userId = normalizeText(payload?.userId);
  const amount = roundCurrencyAmount(payload?.amountUsd ?? payload?.amount, 0);
  const sourceId = normalizeText(payload?.sourceId || payload?.referenceId || createLedgerRecordId('adj'));
  if (!userId || amount <= 0) {
    return {
      entry: null,
      idempotent: false,
      skipped: true,
    };
  }

  const direction = normalizeLedgerDirection(payload?.direction, LEDGER_ENTRY_DIRECTIONS.CREDIT);
  const status = normalizeLedgerStatus(payload?.status, LEDGER_ENTRY_STATUSES.POSTED);
  const idempotencyKey = resolveIdempotencyKeyWithFallback(
    payload?.idempotencyKey,
    '',
  );

  return ledgerServiceDependencies.insertLedgerEntry({
    userId,
    username: normalizeText(payload?.username),
    email: normalizeText(payload?.email),
    type: LEDGER_ENTRY_TYPES.ADJUSTMENT,
    direction,
    amount,
    bvAmount: Math.max(0, toWholeNumber(payload?.bvAmount, 0)),
    status,
    sourceType: LEDGER_SOURCE_TYPES.ADMIN_ADJUSTMENT,
    sourceId,
    sourceRef: normalizeText(payload?.sourceRef || sourceId),
    idempotencyKey,
    description: buildLedgerDescription(payload?.description, 'Admin adjustment'),
    metadata: payload?.metadata && typeof payload.metadata === 'object' ? payload.metadata : {},
    postedAt: normalizeText(payload?.postedAt),
    createdAt: normalizeText(payload?.createdAt),
  }, options?.executor);
}

export async function postLedgerEntry(payload = {}, options = {}) {
  await ledgerServiceDependencies.ensureLedgerTables();

  const entryId = normalizeText(payload?.entryId || payload?.id);
  if (!entryId) {
    return {
      success: false,
      status: 400,
      error: 'Ledger entry id is required.',
    };
  }

  const existingEntry = await ledgerServiceDependencies.readLedgerEntryById(entryId, options?.executor, { forUpdate: true });
  if (!existingEntry) {
    return {
      success: false,
      status: 404,
      error: 'Ledger entry not found.',
    };
  }

  if (normalizeCredential(existingEntry.status) === LEDGER_ENTRY_STATUSES.POSTED) {
    return {
      success: true,
      status: 200,
      data: {
        success: true,
        idempotent: true,
        entry: toApiLedgerEntry(existingEntry),
      },
    };
  }

  const updatedEntry = await ledgerServiceDependencies.updateLedgerEntryStatusById(
    entryId,
    LEDGER_ENTRY_STATUSES.POSTED,
    {
      description: normalizeText(payload?.description),
      postedAt: normalizeText(payload?.postedAt),
      metadata: payload?.metadata && typeof payload.metadata === 'object' ? payload.metadata : {},
    },
    options?.executor,
  );

  return {
    success: true,
    status: 200,
    data: {
      success: true,
      idempotent: false,
      entry: toApiLedgerEntry(updatedEntry),
    },
  };
}

export async function reverseLedgerEntry(payload = {}, options = {}) {
  await ledgerServiceDependencies.ensureLedgerTables();

  const entryId = normalizeText(payload?.entryId || payload?.id);
  if (!entryId) {
    return {
      success: false,
      status: 400,
      error: 'Ledger entry id is required.',
    };
  }

  const existingEntry = await ledgerServiceDependencies.readLedgerEntryById(entryId, options?.executor, { forUpdate: true });
  if (!existingEntry) {
    return {
      success: false,
      status: 404,
      error: 'Ledger entry not found.',
    };
  }

  const reversalIdempotencyKey = resolveIdempotencyKeyWithFallback(
    payload?.idempotencyKey,
    `reversal:${entryId}`,
  );
  if (!reversalIdempotencyKey) {
    return {
      success: false,
      status: 400,
      error: 'A reversal idempotency key could not be resolved.',
    };
  }

  const existingReversal = await ledgerServiceDependencies.readLedgerEntryByIdempotencyKey(reversalIdempotencyKey, options?.executor, { forUpdate: true });
  if (existingReversal) {
    const updatedOriginalEntry = normalizeCredential(existingEntry.status) === LEDGER_ENTRY_STATUSES.REVERSED
      ? existingEntry
      : await ledgerServiceDependencies.updateLedgerEntryStatusById(
          entryId,
          LEDGER_ENTRY_STATUSES.REVERSED,
          {
            description: normalizeText(payload?.description || existingEntry.description),
            metadata: {
              reversalEntryId: existingReversal.id,
            },
            relatedEntryId: existingReversal.id,
          },
          options?.executor,
        );

    return {
      success: true,
      status: 200,
      data: {
        success: true,
        idempotent: true,
        originalEntry: toApiLedgerEntry(updatedOriginalEntry),
        reversalEntry: toApiLedgerEntry(existingReversal),
      },
    };
  }

  const reverseDirection = isLedgerCreditDirection(existingEntry.direction)
    ? LEDGER_ENTRY_DIRECTIONS.DEBIT
    : LEDGER_ENTRY_DIRECTIONS.CREDIT;
  const reversalReason = normalizeText(payload?.reason || payload?.description || 'Reversal posted.');
  const reversalSourceId = normalizeText(payload?.sourceId || `${existingEntry.sourceId}:reversal`);
  const reversalSourceRef = normalizeText(payload?.sourceRef || existingEntry.sourceRef || reversalSourceId);

  const reversalInsertResult = await ledgerServiceDependencies.insertLedgerEntry({
    userId: existingEntry.userId,
    username: existingEntry.username,
    email: existingEntry.email,
    type: LEDGER_ENTRY_TYPES.REVERSAL,
    direction: reverseDirection,
    amount: roundCurrencyAmount(existingEntry.amount, 0),
    bvAmount: Math.max(0, toWholeNumber(payload?.bvAmount, existingEntry.bvAmount)),
    status: LEDGER_ENTRY_STATUSES.POSTED,
    sourceType: normalizeText(payload?.sourceType || existingEntry.sourceType || LEDGER_SOURCE_TYPES.ADMIN_ADJUSTMENT),
    sourceId: reversalSourceId,
    sourceRef: reversalSourceRef,
    idempotencyKey: reversalIdempotencyKey,
    description: reversalReason,
    relatedEntryId: existingEntry.id,
    metadata: {
      originalEntryId: existingEntry.id,
      originalType: existingEntry.type,
      originalStatus: existingEntry.status,
      originalDirection: existingEntry.direction,
      reason: reversalReason,
      ...(
        payload?.metadata && typeof payload.metadata === 'object'
          ? payload.metadata
          : {}
      ),
    },
    postedAt: normalizeText(payload?.postedAt),
    createdAt: normalizeText(payload?.createdAt),
  }, options?.executor);

  const reversalEntry = reversalInsertResult.entry;
  const originalEntry = await ledgerServiceDependencies.updateLedgerEntryStatusById(
    existingEntry.id,
    LEDGER_ENTRY_STATUSES.REVERSED,
    {
      description: existingEntry.description,
      reversedAt: normalizeText(payload?.reversedAt),
      relatedEntryId: normalizeText(reversalEntry?.id),
      metadata: {
        reversalEntryId: normalizeText(reversalEntry?.id),
      },
    },
    options?.executor,
  );

  return {
    success: true,
    status: 200,
    data: {
      success: true,
      idempotent: reversalInsertResult.idempotent,
      originalEntry: toApiLedgerEntry(originalEntry),
      reversalEntry: toApiLedgerEntry(reversalEntry),
    },
  };
}

function buildMemberLedgerQueryFilters(query = {}, authenticatedMember = {}) {
  return {
    userId: normalizeText(authenticatedMember?.id || query?.userId),
    username: normalizeText(authenticatedMember?.username || query?.username),
    email: normalizeText(authenticatedMember?.email || query?.email),
    type: normalizeText(query?.type || query?.types),
    status: normalizeText(query?.status || query?.statuses),
    sourceType: normalizeText(query?.sourceType || query?.sourceTypes),
    sourceId: normalizeText(query?.sourceId),
    search: normalizeText(query?.search),
    fromDate: normalizeText(query?.fromDate || query?.startDate),
    toDate: normalizeText(query?.toDate || query?.endDate),
    limit: query?.limit,
    offset: query?.offset,
  };
}

export async function getUserLedgerEntries(query = {}, authenticatedMember = {}) {
  await ledgerServiceDependencies.ensureLedgerTables();

  const userId = normalizeText(authenticatedMember?.id || query?.userId);
  if (!userId) {
    return {
      success: false,
      status: 400,
      error: 'Member identity is required for ledger lookup.',
    };
  }

  const filters = buildMemberLedgerQueryFilters(query, authenticatedMember);
  const result = await ledgerServiceDependencies.listLedgerEntries(filters);

  return {
    success: true,
    status: 200,
    data: {
      success: true,
      totalCount: result.totalCount,
      limit: result.limit,
      offset: result.offset,
      entries: result.entries.map(toApiLedgerEntry).filter(Boolean),
    },
  };
}

export async function getUserLedgerSummary(query = {}, authenticatedMember = {}) {
  await ledgerServiceDependencies.ensureLedgerTables();

  const userId = normalizeText(authenticatedMember?.id || query?.userId);
  if (!userId) {
    return {
      success: false,
      status: 400,
      error: 'Member identity is required for ledger summary.',
    };
  }

  const filters = buildMemberLedgerQueryFilters(query, authenticatedMember);
  const summary = await ledgerServiceDependencies.getLedgerSummary(filters);
  return {
    success: true,
    status: 200,
    data: {
      success: true,
      summary: toApiLedgerSummary(summary),
    },
  };
}

export async function getAdminLedgerEntries(query = {}) {
  await ledgerServiceDependencies.ensureLedgerTables();

  const filters = {
    userId: normalizeText(query?.userId),
    username: normalizeText(query?.username),
    email: normalizeText(query?.email),
    userSearch: normalizeText(query?.userSearch || query?.user || query?.member),
    type: normalizeText(query?.type || query?.types),
    status: normalizeText(query?.status || query?.statuses),
    sourceType: normalizeText(query?.sourceType || query?.sourceTypes),
    sourceId: normalizeText(query?.sourceId),
    search: normalizeText(query?.search),
    fromDate: normalizeText(query?.fromDate || query?.startDate),
    toDate: normalizeText(query?.toDate || query?.endDate),
    limit: query?.limit,
    offset: query?.offset,
  };

  const result = await ledgerServiceDependencies.listLedgerEntries(filters);
  return {
    success: true,
    status: 200,
    data: {
      success: true,
      totalCount: result.totalCount,
      limit: result.limit,
      offset: result.offset,
      entries: result.entries.map(toApiLedgerEntry).filter(Boolean),
    },
  };
}

export async function getAdminLedgerSummary(query = {}) {
  await ledgerServiceDependencies.ensureLedgerTables();

  const filters = {
    userId: normalizeText(query?.userId),
    username: normalizeText(query?.username),
    email: normalizeText(query?.email),
    userSearch: normalizeText(query?.userSearch || query?.user || query?.member),
    type: normalizeText(query?.type || query?.types),
    status: normalizeText(query?.status || query?.statuses),
    sourceType: normalizeText(query?.sourceType || query?.sourceTypes),
    sourceId: normalizeText(query?.sourceId),
    search: normalizeText(query?.search),
    fromDate: normalizeText(query?.fromDate || query?.startDate),
    toDate: normalizeText(query?.toDate || query?.endDate),
  };

  const summary = await ledgerServiceDependencies.getLedgerSummary(filters);
  return {
    success: true,
    status: 200,
    data: {
      success: true,
      summary: toApiLedgerSummary(summary),
    },
  };
}

async function resolveLedgerTargetUser(payload = {}) {
  const userId = normalizeText(payload?.userId);
  if (userId) {
    const byId = await ledgerServiceDependencies.findUserById(userId);
    if (byId) {
      return byId;
    }
  }

  const username = normalizeText(payload?.username);
  if (username) {
    const byUsername = await ledgerServiceDependencies.findUserByIdentifier(username);
    if (byUsername) {
      return byUsername;
    }
  }

  const email = normalizeText(payload?.email);
  if (email) {
    const byEmail = await ledgerServiceDependencies.findUserByIdentifier(email);
    if (byEmail) {
      return byEmail;
    }
  }

  const identifier = normalizeText(payload?.identifier);
  if (identifier) {
    return ledgerServiceDependencies.findUserByIdentifier(identifier);
  }

  return null;
}

export async function createAdminLedgerAdjustment(payload = {}) {
  await ledgerServiceDependencies.ensureLedgerTables();

  const targetUser = await resolveLedgerTargetUser(payload);
  if (!targetUser) {
    return {
      success: false,
      status: 404,
      error: 'Target member account was not found for ledger adjustment.',
    };
  }

  const amount = roundCurrencyAmount(payload?.amount, 0);
  if (amount <= 0) {
    return {
      success: false,
      status: 400,
      error: 'Adjustment amount must be greater than 0.',
    };
  }

  const direction = normalizeLedgerDirection(payload?.direction, LEDGER_ENTRY_DIRECTIONS.CREDIT);
  const result = await createAdminAdjustmentLedgerEntry({
    userId: normalizeText(targetUser.id),
    username: normalizeText(targetUser.username),
    email: normalizeText(targetUser.email),
    amount,
    direction,
    bvAmount: Math.max(0, toWholeNumber(payload?.bvAmount, 0)),
    status: normalizeLedgerStatus(payload?.status, LEDGER_ENTRY_STATUSES.POSTED),
    sourceId: normalizeText(payload?.sourceId || payload?.referenceId || createLedgerRecordId('admin-adjustment')),
    sourceRef: normalizeText(payload?.sourceRef || payload?.referenceLabel),
    idempotencyKey: normalizeText(payload?.idempotencyKey),
    description: buildLedgerDescription(
      payload?.description,
      `Manual ${direction === LEDGER_ENTRY_DIRECTIONS.DEBIT ? 'debit' : 'credit'} adjustment`,
    ),
    metadata: {
      adminActor: normalizeText(payload?.adminActor || payload?.updatedBy || 'admin'),
      note: normalizeText(payload?.note),
      ...(payload?.metadata && typeof payload.metadata === 'object' ? payload.metadata : {}),
    },
  });

  return {
    success: true,
    status: result.idempotent ? 200 : 201,
    data: {
      success: true,
      idempotent: result.idempotent,
      entry: toApiLedgerEntry(result.entry),
    },
  };
}
