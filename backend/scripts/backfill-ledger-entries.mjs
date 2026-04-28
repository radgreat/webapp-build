import pool from '../db/db.js';
import { readMockStoreInvoicesStore } from '../stores/invoice.store.js';
import { readRegisteredMembersStore } from '../stores/member.store.js';
import { readMockSalesTeamCommissionsStore } from '../stores/metrics.store.js';
import { readMockPayoutRequestsStore } from '../stores/payout.store.js';
import { readMockUsersStore } from '../stores/user.store.js';
import {
  createFastTrackCommissionLedgerEntry,
  createPayoutLedgerEntry,
  createRetailCommissionLedgerEntry,
  createSalesTeamCommissionLedgerEntry,
} from '../services/ledger.service.js';

const RETAIL_BUYER_PACKAGE_KEY = 'preferred-customer-pack';
const PAYOUT_LEDGER_STATUS = Object.freeze({
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
});

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeCredential(value) {
  return normalizeText(value).toLowerCase();
}

function normalizeStoreCode(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '');
}

function normalizeNumber(value, fallback = 0) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }
  return numeric;
}

function resolveScriptOptions(args = []) {
  const normalizedArgs = Array.isArray(args)
    ? args.map((value) => normalizeText(value)).filter(Boolean)
    : [];

  const findArgValue = (prefixes = []) => {
    const match = normalizedArgs.find((entry) => (
      prefixes.some((prefix) => entry.toLowerCase().startsWith(prefix))
    ));
    if (!match) {
      return '';
    }
    const separatorIndex = match.indexOf('=');
    if (separatorIndex < 0) {
      return '';
    }
    return normalizeText(match.slice(separatorIndex + 1));
  };

  const hasFlag = (flag) => normalizedArgs.some((entry) => entry.toLowerCase() === flag);

  return {
    dryRun: hasFlag('--dry-run'),
    targetUserId: findArgValue(['--user-id=']),
    targetUsername: findArgValue(['--username=']),
    targetEmail: findArgValue(['--email=']),
    includeFailedPayouts: !hasFlag('--skip-failed-payouts'),
    includePendingPayouts: !hasFlag('--skip-pending-payouts'),
    includeSalesTeamSnapshots: !hasFlag('--skip-sales-team'),
  };
}

function buildIdentityLookup(users = []) {
  const byUserId = new Map();
  const byUsername = new Map();
  const byEmail = new Map();
  const byStoreCode = new Map();
  const byAttributionStoreCode = new Map();

  for (const user of Array.isArray(users) ? users : []) {
    const userId = normalizeText(user?.id);
    const username = normalizeCredential(user?.username);
    const email = normalizeCredential(user?.email);
    const primaryStoreCodes = [
      normalizeStoreCode(user?.storeCode),
      normalizeStoreCode(user?.publicStoreCode),
    ].filter(Boolean);
    const attributionStoreCode = normalizeStoreCode(user?.attributionStoreCode);

    if (userId) {
      byUserId.set(userId, user);
    }
    if (username) {
      byUsername.set(username, user);
    }
    if (email) {
      byEmail.set(email, user);
    }
    for (const storeCode of primaryStoreCodes) {
      if (!byStoreCode.has(storeCode)) {
        byStoreCode.set(storeCode, user);
      }
    }

    if (attributionStoreCode && !byAttributionStoreCode.has(attributionStoreCode)) {
      byAttributionStoreCode.set(attributionStoreCode, user);
    }
  }

  return {
    byUserId,
    byUsername,
    byEmail,
    byStoreCode,
    byAttributionStoreCode,
  };
}

function buildMemberLookup(members = []) {
  const byUserId = new Map();
  const byUsername = new Map();
  const byEmail = new Map();

  for (const member of Array.isArray(members) ? members : []) {
    const userId = normalizeText(member?.userId);
    const username = normalizeCredential(member?.memberUsername);
    const email = normalizeCredential(member?.email);
    if (userId) {
      byUserId.set(userId, member);
    }
    if (username) {
      byUsername.set(username, member);
    }
    if (email) {
      byEmail.set(email, member);
    }
  }

  return { byUserId, byUsername, byEmail };
}

function buildInvoiceLookup(invoices = []) {
  const byId = new Map();
  const byBuyerUserId = new Map();
  const byBuyerUsername = new Map();
  const byBuyerEmail = new Map();

  const appendInvoice = (targetMap, key, invoice) => {
    if (!key) {
      return;
    }
    if (!targetMap.has(key)) {
      targetMap.set(key, []);
    }
    targetMap.get(key).push(invoice);
  };

  for (const invoice of Array.isArray(invoices) ? invoices : []) {
    const id = normalizeText(invoice?.id);
    if (id) {
      byId.set(id, invoice);
    }

    appendInvoice(byBuyerUserId, normalizeText(invoice?.buyerUserId), invoice);
    appendInvoice(byBuyerUsername, normalizeCredential(invoice?.buyerUsername), invoice);
    appendInvoice(byBuyerEmail, normalizeCredential(invoice?.buyerEmail), invoice);
  }

  return {
    byId,
    byBuyerUserId,
    byBuyerUsername,
    byBuyerEmail,
  };
}

function resolveUserFromIdentity(identity = {}, lookup = {}) {
  const userId = normalizeText(identity?.userId || identity?.id);
  if (userId && lookup.byUserId?.has(userId)) {
    return lookup.byUserId.get(userId);
  }

  const username = normalizeCredential(identity?.username);
  if (username && lookup.byUsername?.has(username)) {
    return lookup.byUsername.get(username);
  }

  const email = normalizeCredential(identity?.email);
  if (email && lookup.byEmail?.has(email)) {
    return lookup.byEmail.get(email);
  }

  return null;
}

function resolveMemberFromIdentity(identity = {}, lookup = {}) {
  const userId = normalizeText(identity?.userId || identity?.id);
  if (userId && lookup.byUserId?.has(userId)) {
    return lookup.byUserId.get(userId);
  }

  const username = normalizeCredential(identity?.username || identity?.memberUsername);
  if (username && lookup.byUsername?.has(username)) {
    return lookup.byUsername.get(username);
  }

  const email = normalizeCredential(identity?.email);
  if (email && lookup.byEmail?.has(email)) {
    return lookup.byEmail.get(email);
  }

  return null;
}

function resolveInvoiceOwnerUser(invoice, userLookup) {
  const attributionSnapshot = invoice?.attributionSnapshot && typeof invoice.attributionSnapshot === 'object'
    ? invoice.attributionSnapshot
    : {};

  const byIdentity = resolveUserFromIdentity({
    userId: attributionSnapshot.ownerUserId || attributionSnapshot.owner_user_id || attributionSnapshot.userId,
    username: attributionSnapshot.ownerUsername || attributionSnapshot.owner_username || attributionSnapshot.username,
    email: attributionSnapshot.ownerEmail || attributionSnapshot.owner_email || attributionSnapshot.email,
  }, userLookup);

  if (byIdentity) {
    return byIdentity;
  }

  const candidateStoreCodes = [
    attributionSnapshot.memberStoreCode,
    attributionSnapshot.member_store_code,
    attributionSnapshot.storeCode,
    attributionSnapshot.store_code,
    invoice?.attributionKey,
  ].map(normalizeStoreCode).filter(Boolean);

  for (const storeCode of candidateStoreCodes) {
    if (userLookup.byStoreCode?.has(storeCode)) {
      return userLookup.byStoreCode.get(storeCode);
    }
  }

  for (const storeCode of candidateStoreCodes) {
    if (userLookup.byAttributionStoreCode?.has(storeCode)) {
      return userLookup.byAttributionStoreCode.get(storeCode);
    }
  }

  return null;
}

function resolveBuyerPackageKey(invoice, buyerUser, buyerMember) {
  const directBuyerPackageKey = normalizeCredential(invoice?.buyerPackageKey);
  if (directBuyerPackageKey) {
    return directBuyerPackageKey;
  }

  const userBuyerPackageKey = normalizeCredential(buyerUser?.enrollmentPackage);
  if (userBuyerPackageKey) {
    return userBuyerPackageKey;
  }

  return normalizeCredential(buyerMember?.enrollmentPackage);
}

function isPreferredRetailCommissionInvoice(invoice, buyerPackageKey) {
  const settlementProfile = invoice?.settlementProfile && typeof invoice.settlementProfile === 'object'
    ? invoice.settlementProfile
    : {};

  const isPreferredBuyerCheckout = settlementProfile.isPreferredBuyerCheckout === true;
  const checkoutMode = normalizeCredential(settlementProfile.checkoutMode);
  const isPreferredMode = checkoutMode.includes('preferred');
  const isPreferredPackage = buyerPackageKey === RETAIL_BUYER_PACKAGE_KEY;

  return isPreferredBuyerCheckout || isPreferredMode || isPreferredPackage;
}

function resolveClosestEnrollmentInvoice(member, invoiceLookup) {
  const candidates = [];
  const uniqueInvoiceIds = new Set();

  const appendFromMap = (map, key) => {
    if (!key || !map?.has(key)) {
      return;
    }
    for (const candidate of map.get(key)) {
      const candidateId = normalizeText(candidate?.id);
      if (!candidateId || uniqueInvoiceIds.has(candidateId)) {
        continue;
      }
      uniqueInvoiceIds.add(candidateId);
      candidates.push(candidate);
    }
  };

  appendFromMap(invoiceLookup.byBuyerUserId, normalizeText(member?.userId));
  appendFromMap(invoiceLookup.byBuyerUsername, normalizeCredential(member?.memberUsername));
  appendFromMap(invoiceLookup.byBuyerEmail, normalizeCredential(member?.email));

  if (candidates.length === 0) {
    return null;
  }

  const memberCreatedAtMs = Date.parse(normalizeText(member?.createdAt));
  if (!Number.isFinite(memberCreatedAtMs)) {
    return candidates[0];
  }

  return candidates.sort((left, right) => {
    const leftMs = Date.parse(normalizeText(left?.createdAt));
    const rightMs = Date.parse(normalizeText(right?.createdAt));
    const leftDistance = Number.isFinite(leftMs) ? Math.abs(leftMs - memberCreatedAtMs) : Number.MAX_SAFE_INTEGER;
    const rightDistance = Number.isFinite(rightMs) ? Math.abs(rightMs - memberCreatedAtMs) : Number.MAX_SAFE_INTEGER;
    return leftDistance - rightDistance;
  })[0] || null;
}

function mapPayoutStatusToLedgerStatus(value) {
  const normalized = normalizeCredential(value);
  if (normalized === 'paid' || normalized === 'fulfilled') {
    return PAYOUT_LEDGER_STATUS.PAID;
  }
  if (normalized === 'failed' || normalized === 'cancelled' || normalized === 'canceled') {
    return PAYOUT_LEDGER_STATUS.FAILED;
  }
  return PAYOUT_LEDGER_STATUS.PENDING;
}

function resolveTargetFilter(options = {}) {
  return {
    userId: normalizeText(options?.targetUserId),
    username: normalizeCredential(options?.targetUsername),
    email: normalizeCredential(options?.targetEmail),
  };
}

function hasTargetFilter(targetFilter = {}) {
  return Boolean(
    normalizeText(targetFilter?.userId)
    || normalizeCredential(targetFilter?.username)
    || normalizeCredential(targetFilter?.email),
  );
}

function doesUserMatchTarget(user = {}, targetFilter = {}) {
  if (!hasTargetFilter(targetFilter)) {
    return true;
  }

  const userId = normalizeText(user?.id);
  const username = normalizeCredential(user?.username);
  const email = normalizeCredential(user?.email);

  if (normalizeText(targetFilter?.userId) && normalizeText(targetFilter.userId) === userId) {
    return true;
  }
  if (normalizeCredential(targetFilter?.username) && normalizeCredential(targetFilter.username) === username) {
    return true;
  }
  if (normalizeCredential(targetFilter?.email) && normalizeCredential(targetFilter.email) === email) {
    return true;
  }

  return false;
}

function createSectionSummary() {
  return {
    scanned: 0,
    eligible: 0,
    created: 0,
    idempotent: 0,
    skipped: 0,
    failed: 0,
    samples: [],
    skippedSamples: [],
    errorSamples: [],
  };
}

function pushSample(targetList = [], samplePayload = {}, limit = 15) {
  if (!Array.isArray(targetList) || targetList.length >= limit) {
    return;
  }
  targetList.push(samplePayload);
}

async function runBackfill() {
  const options = resolveScriptOptions(process.argv.slice(2));
  const targetFilter = resolveTargetFilter(options);

  const [users, members, invoices, salesTeamSnapshots, payoutRequests] = await Promise.all([
    readMockUsersStore(),
    readRegisteredMembersStore(),
    readMockStoreInvoicesStore(),
    readMockSalesTeamCommissionsStore(),
    readMockPayoutRequestsStore(),
  ]);

  const userLookup = buildIdentityLookup(users);
  const memberLookup = buildMemberLookup(members);
  const invoiceLookup = buildInvoiceLookup(invoices);

  const summary = {
    dryRun: options.dryRun,
    target: hasTargetFilter(targetFilter) ? targetFilter : null,
    options: {
      includeFailedPayouts: options.includeFailedPayouts,
      includePendingPayouts: options.includePendingPayouts,
      includeSalesTeamSnapshots: options.includeSalesTeamSnapshots,
    },
    totals: {
      retailCommission: createSectionSummary(),
      fastTrackCommission: createSectionSummary(),
      salesTeamCommission: createSectionSummary(),
      payouts: createSectionSummary(),
    },
  };

  for (const invoice of Array.isArray(invoices) ? invoices : []) {
    const retailSummary = summary.totals.retailCommission;
    retailSummary.scanned += 1;

    const invoiceId = normalizeText(invoice?.id);
    const retailCommissionAmount = normalizeNumber(invoice?.retailCommission, 0);
    if (!invoiceId || retailCommissionAmount <= 0) {
      retailSummary.skipped += 1;
      pushSample(retailSummary.skippedSamples, {
        invoiceId,
        reason: 'retail-commission-is-zero-or-missing',
      });
      continue;
    }

    const ownerUser = resolveInvoiceOwnerUser(invoice, userLookup);
    if (!ownerUser) {
      retailSummary.skipped += 1;
      pushSample(retailSummary.skippedSamples, {
        invoiceId,
        reason: 'owner-user-not-resolved',
        attributionKey: normalizeStoreCode(invoice?.attributionKey),
      });
      continue;
    }

    if (!doesUserMatchTarget(ownerUser, targetFilter)) {
      retailSummary.skipped += 1;
      continue;
    }

    const buyerUser = resolveUserFromIdentity({
      userId: invoice?.buyerUserId,
      username: invoice?.buyerUsername,
      email: invoice?.buyerEmail,
    }, userLookup);
    const buyerMember = resolveMemberFromIdentity({
      userId: invoice?.buyerUserId,
      memberUsername: invoice?.buyerUsername,
      email: invoice?.buyerEmail,
    }, memberLookup);
    const buyerPackageKey = resolveBuyerPackageKey(invoice, buyerUser, buyerMember);
    const isPreferredInvoice = isPreferredRetailCommissionInvoice(invoice, buyerPackageKey);

    if (!isPreferredInvoice) {
      retailSummary.skipped += 1;
      pushSample(retailSummary.skippedSamples, {
        invoiceId,
        reason: 'invoice-does-not-match-preferred-retail-signals',
        buyerPackageKey,
      });
      continue;
    }

    retailSummary.eligible += 1;
    const settlementProfile = invoice?.settlementProfile && typeof invoice.settlementProfile === 'object'
      ? invoice.settlementProfile
      : {};
    const attributionSnapshot = invoice?.attributionSnapshot && typeof invoice.attributionSnapshot === 'object'
      ? invoice.attributionSnapshot
      : {};

    const ownerBv = normalizeNumber(settlementProfile.ownerBv, Number(invoice?.bp) || 0);
    const payload = {
      userId: normalizeText(ownerUser?.id),
      username: normalizeText(ownerUser?.username),
      email: normalizeText(ownerUser?.email),
      buyerUserId: normalizeText(invoice?.buyerUserId),
      buyerUsername: normalizeText(invoice?.buyerUsername),
      buyerEmail: normalizeText(invoice?.buyerEmail),
      buyerName: normalizeText(invoice?.buyer),
      storeOwnerUserId: normalizeText(ownerUser?.id),
      storeOwnerUsername: normalizeText(ownerUser?.username),
      storeOwnerEmail: normalizeText(ownerUser?.email),
      storeCode: normalizeStoreCode(
        attributionSnapshot.memberStoreCode
        || attributionSnapshot.member_store_code
        || attributionSnapshot.storeCode
        || attributionSnapshot.store_code
        || invoice?.attributionKey
        || ownerUser?.storeCode
        || ownerUser?.publicStoreCode
        || ownerUser?.attributionStoreCode,
      ),
      amountUsd: retailCommissionAmount,
      bvAmount: Math.max(0, Math.floor(ownerBv)),
      status: normalizeText(invoice?.status),
      sourceId: invoiceId,
      sourceRef: normalizeText(invoice?.stripeInvoiceNumber || invoiceId),
      orderId: invoiceId,
      invoiceId,
      invoiceStatus: normalizeText(invoice?.status),
      orderReference: normalizeText(invoice?.stripeInvoiceId || invoice?.stripePaymentIntentId || invoice?.stripeCheckoutSessionId),
      paymentReference: normalizeText(invoice?.stripePaymentIntentId || invoice?.stripeCheckoutSessionId),
      accountPackageKey: normalizeText(buyerPackageKey),
      settlementPackageKey: normalizeText(settlementProfile.settlementPackageKey),
      accountPackageLabel: normalizeText(settlementProfile.buyerPackageLabel || ''),
      checkoutMode: normalizeText(settlementProfile.checkoutMode),
      attributionKey: normalizeText(invoice?.attributionKey),
      memberStoreCode: normalizeStoreCode(
        attributionSnapshot.memberStoreCode
        || attributionSnapshot.member_store_code
        || invoice?.attributionKey,
      ),
      memberStoreLink: normalizeText(settlementProfile.memberStoreLink || ''),
      description: `Retail commission backfill from store order ${invoiceId}`,
      idempotencyKey: `retail_commission:${invoiceId}:${normalizeText(ownerUser?.id)}`,
      createdAt: normalizeText(invoice?.createdAt),
      postedAt: normalizeText(invoice?.createdAt),
      debug: {
        backfillSource: 'backfill-ledger-entries.mjs',
        preferredSignal: {
          buyerPackageKey,
          isPreferredBuyerCheckout: settlementProfile.isPreferredBuyerCheckout === true,
          checkoutMode: normalizeCredential(settlementProfile.checkoutMode),
        },
      },
    };

    if (options.dryRun) {
      retailSummary.created += 1;
      pushSample(retailSummary.samples, {
        invoiceId,
        userId: payload.userId,
        username: payload.username,
        amountUsd: payload.amountUsd,
        bvAmount: payload.bvAmount,
        idempotencyKey: payload.idempotencyKey,
      });
      continue;
    }

    try {
      const result = await createRetailCommissionLedgerEntry(payload);
      if (result?.idempotent) {
        retailSummary.idempotent += 1;
      } else if (result?.skipped) {
        retailSummary.skipped += 1;
      } else {
        retailSummary.created += 1;
      }
      pushSample(retailSummary.samples, {
        invoiceId,
        ledgerEntryId: normalizeText(result?.entry?.id),
        userId: payload.userId,
        username: payload.username,
        amountUsd: payload.amountUsd,
        idempotent: Boolean(result?.idempotent),
      });
    } catch (error) {
      retailSummary.failed += 1;
      pushSample(retailSummary.errorSamples, {
        invoiceId,
        error: error instanceof Error ? error.message : String(error || 'Unknown error.'),
      });
    }
  }

  for (const member of Array.isArray(members) ? members : []) {
    const fastTrackSummary = summary.totals.fastTrackCommission;
    fastTrackSummary.scanned += 1;

    const sourceId = normalizeText(member?.id);
    const fastTrackBonusAmount = normalizeNumber(member?.fastTrackBonusAmount, 0);
    if (!sourceId || fastTrackBonusAmount <= 0) {
      fastTrackSummary.skipped += 1;
      continue;
    }

    const sponsorUser = resolveUserFromIdentity({
      username: member?.sponsorUsername,
    }, userLookup);
    if (!sponsorUser) {
      fastTrackSummary.skipped += 1;
      pushSample(fastTrackSummary.skippedSamples, {
        memberId: sourceId,
        memberUsername: normalizeText(member?.memberUsername),
        reason: 'sponsor-user-not-resolved',
      });
      continue;
    }

    if (!doesUserMatchTarget(sponsorUser, targetFilter)) {
      fastTrackSummary.skipped += 1;
      continue;
    }

    const matchedInvoice = resolveClosestEnrollmentInvoice(member, invoiceLookup);
    fastTrackSummary.eligible += 1;

    const payload = {
      userId: normalizeText(sponsorUser?.id),
      username: normalizeText(sponsorUser?.username),
      email: normalizeText(sponsorUser?.email),
      sponsorUserId: normalizeText(sponsorUser?.id),
      sponsorUsername: normalizeText(sponsorUser?.username),
      sponsorEmail: normalizeText(sponsorUser?.email),
      enrolledUserId: normalizeText(member?.userId),
      enrolledUsername: normalizeText(member?.memberUsername),
      enrolledEmail: normalizeText(member?.email),
      enrolledName: normalizeText(member?.fullName),
      enrollmentId: sourceId,
      orderReference: normalizeText(matchedInvoice?.id || matchedInvoice?.stripeInvoiceId),
      paymentReference: normalizeText(matchedInvoice?.stripePaymentIntentId || matchedInvoice?.stripeCheckoutSessionId),
      packageKey: normalizeText(member?.enrollmentPackage),
      packageLabel: normalizeText(member?.enrollmentPackageLabel),
      amountUsd: fastTrackBonusAmount,
      status: 'posted',
      sourceId,
      sourceRef: normalizeText(matchedInvoice?.id || member?.memberUsername || sourceId),
      idempotencyKey: `fast_track:${sourceId}:${normalizeText(sponsorUser?.id)}`,
      description: `Fast Track commission backfill from enrollment ${normalizeText(member?.memberUsername || sourceId)}`,
      createdAt: normalizeText(member?.createdAt),
      postedAt: normalizeText(member?.createdAt),
      debug: {
        backfillSource: 'backfill-ledger-entries.mjs',
        matchedInvoiceId: normalizeText(matchedInvoice?.id),
      },
    };

    if (options.dryRun) {
      fastTrackSummary.created += 1;
      pushSample(fastTrackSummary.samples, {
        memberId: sourceId,
        memberUsername: payload.enrolledUsername,
        sponsorUsername: payload.username,
        amountUsd: payload.amountUsd,
        idempotencyKey: payload.idempotencyKey,
      });
      continue;
    }

    try {
      const result = await createFastTrackCommissionLedgerEntry(payload);
      if (result?.idempotent) {
        fastTrackSummary.idempotent += 1;
      } else if (result?.skipped) {
        fastTrackSummary.skipped += 1;
      } else {
        fastTrackSummary.created += 1;
      }
      pushSample(fastTrackSummary.samples, {
        memberId: sourceId,
        sponsorUsername: payload.username,
        amountUsd: payload.amountUsd,
        ledgerEntryId: normalizeText(result?.entry?.id),
        idempotent: Boolean(result?.idempotent),
      });
    } catch (error) {
      fastTrackSummary.failed += 1;
      pushSample(fastTrackSummary.errorSamples, {
        memberId: sourceId,
        error: error instanceof Error ? error.message : String(error || 'Unknown error.'),
      });
    }
  }

  if (options.includeSalesTeamSnapshots) {
    for (const snapshot of Array.isArray(salesTeamSnapshots) ? salesTeamSnapshots : []) {
      const salesTeamSummary = summary.totals.salesTeamCommission;
      salesTeamSummary.scanned += 1;

      const sourceId = normalizeText(snapshot?.id);
      const netCommissionAmount = normalizeNumber(snapshot?.netCommissionAmount, 0);
      const cycleCount = Math.max(
        0,
        Math.floor(normalizeNumber(snapshot?.cappedCycles, normalizeNumber(snapshot?.totalCycles, 0))),
      );

      if (!sourceId || netCommissionAmount <= 0 || cycleCount <= 0) {
        salesTeamSummary.skipped += 1;
        continue;
      }

      const cycleUser = resolveUserFromIdentity({
        userId: snapshot?.userId,
        username: snapshot?.username,
        email: snapshot?.email,
      }, userLookup);
      if (!cycleUser) {
        salesTeamSummary.skipped += 1;
        pushSample(salesTeamSummary.skippedSamples, {
          snapshotId: sourceId,
          reason: 'cycle-user-not-resolved',
        });
        continue;
      }

      if (!doesUserMatchTarget(cycleUser, targetFilter)) {
        salesTeamSummary.skipped += 1;
        continue;
      }

      salesTeamSummary.eligible += 1;
      const payload = {
        userId: normalizeText(cycleUser?.id),
        username: normalizeText(cycleUser?.username),
        email: normalizeText(cycleUser?.email),
        amountUsd: netCommissionAmount,
        bvAmount: cycleCount * 1500,
        status: 'posted',
        sourceId,
        sourceRef: sourceId,
        cycleId: sourceId,
        cycleBatchId: `snapshot:${sourceId}`,
        cycleCount,
        leftBvUsed: 0,
        rightBvUsed: 0,
        commissionPeriodLabel: 'Sales Team snapshot backfill',
        packageKey: normalizeText(snapshot?.accountPackageKey),
        perCycleAmount: normalizeNumber(snapshot?.perCycleAmount, 0),
        idempotencyKey: `sales_team_cycle:${sourceId}:${normalizeText(cycleUser?.id)}`,
        description: `Sales Team commission backfill from snapshot ${sourceId}`,
        createdAt: normalizeText(snapshot?.createdAt),
        postedAt: normalizeText(snapshot?.updatedAt || snapshot?.createdAt),
        debug: {
          backfillSource: 'backfill-ledger-entries.mjs',
          snapshotDerived: true,
          overflowCycles: normalizeNumber(snapshot?.overflowCycles, 0),
          grossCommissionAmount: normalizeNumber(snapshot?.grossCommissionAmount, 0),
          payoutOffsetAmount: normalizeNumber(snapshot?.payoutOffsetAmount, 0),
        },
      };

      if (options.dryRun) {
        salesTeamSummary.created += 1;
        pushSample(salesTeamSummary.samples, {
          snapshotId: sourceId,
          username: payload.username,
          amountUsd: payload.amountUsd,
          cycleCount,
          idempotencyKey: payload.idempotencyKey,
        });
        continue;
      }

      try {
        const result = await createSalesTeamCommissionLedgerEntry(payload);
        if (result?.idempotent) {
          salesTeamSummary.idempotent += 1;
        } else if (result?.skipped) {
          salesTeamSummary.skipped += 1;
        } else {
          salesTeamSummary.created += 1;
        }
        pushSample(salesTeamSummary.samples, {
          snapshotId: sourceId,
          username: payload.username,
          amountUsd: payload.amountUsd,
          ledgerEntryId: normalizeText(result?.entry?.id),
          idempotent: Boolean(result?.idempotent),
        });
      } catch (error) {
        salesTeamSummary.failed += 1;
        pushSample(salesTeamSummary.errorSamples, {
          snapshotId: sourceId,
          error: error instanceof Error ? error.message : String(error || 'Unknown error.'),
        });
      }
    }
  }

  for (const request of Array.isArray(payoutRequests) ? payoutRequests : []) {
    const payoutSummary = summary.totals.payouts;
    payoutSummary.scanned += 1;

    const requestId = normalizeText(request?.id);
    if (!requestId) {
      payoutSummary.skipped += 1;
      continue;
    }

    const payoutUser = resolveUserFromIdentity({
      userId: request?.requestedByUserId,
      username: request?.requestedByUsername,
      email: request?.requestedByEmail,
    }, userLookup);
    if (!payoutUser) {
      payoutSummary.skipped += 1;
      pushSample(payoutSummary.skippedSamples, {
        requestId,
        reason: 'payout-user-not-resolved',
      });
      continue;
    }

    if (!doesUserMatchTarget(payoutUser, targetFilter)) {
      payoutSummary.skipped += 1;
      continue;
    }

    const ledgerStatus = mapPayoutStatusToLedgerStatus(request?.status);
    if (!options.includeFailedPayouts && ledgerStatus === PAYOUT_LEDGER_STATUS.FAILED) {
      payoutSummary.skipped += 1;
      continue;
    }
    if (!options.includePendingPayouts && ledgerStatus === PAYOUT_LEDGER_STATUS.PENDING) {
      payoutSummary.skipped += 1;
      continue;
    }

    const amount = ledgerStatus === PAYOUT_LEDGER_STATUS.PAID
      ? Math.max(0, normalizeNumber(request?.paidAmount, normalizeNumber(request?.amount, 0)))
      : Math.max(0, normalizeNumber(request?.amount, 0));
    if (amount <= 0) {
      payoutSummary.skipped += 1;
      pushSample(payoutSummary.skippedSamples, {
        requestId,
        reason: 'payout-amount-is-zero',
        status: normalizeText(request?.status),
      });
      continue;
    }

    payoutSummary.eligible += 1;
    const paidIdempotencyKey = `payout:${requestId}:${normalizeText(payoutUser?.id)}`;
    const nonPaidIdempotencyKey = `payout_${ledgerStatus}:${requestId}:${normalizeText(payoutUser?.id)}`;
    const idempotencyKey = ledgerStatus === PAYOUT_LEDGER_STATUS.PAID
      ? paidIdempotencyKey
      : nonPaidIdempotencyKey;

    const payload = {
      userId: normalizeText(payoutUser?.id),
      username: normalizeText(payoutUser?.username),
      email: normalizeText(payoutUser?.email),
      amountUsd: amount,
      status: ledgerStatus,
      sourceId: requestId,
      sourceRef: normalizeText(
        request?.gatewayReference
        || request?.transferReference
        || request?.id,
      ),
      payoutRequestId: requestId,
      payoutMethod: normalizeText(request?.sourceLabel || request?.sourceKey),
      transferMode: normalizeText(request?.transferMode),
      gatewayKey: normalizeText(request?.gatewayKey),
      gatewayLabel: normalizeText(request?.gatewayLabel),
      gatewayReference: normalizeText(request?.gatewayReference),
      transferReference: normalizeText(request?.transferReference),
      idempotencyKey,
      description: `Payout ${ledgerStatus} backfill (${requestId})`,
      createdAt: normalizeText(request?.requestedAt || request?.createdAt),
      postedAt: ledgerStatus === PAYOUT_LEDGER_STATUS.PAID
        ? normalizeText(request?.fulfilledAt || request?.updatedAt || request?.requestedAt || request?.createdAt)
        : '',
      debug: {
        backfillSource: 'backfill-ledger-entries.mjs',
        requestStatus: normalizeText(request?.status),
        sourceKey: normalizeText(request?.sourceKey),
      },
    };

    if (options.dryRun) {
      payoutSummary.created += 1;
      pushSample(payoutSummary.samples, {
        requestId,
        username: payload.username,
        amountUsd: payload.amountUsd,
        status: payload.status,
        idempotencyKey: payload.idempotencyKey,
      });
      continue;
    }

    try {
      const result = await createPayoutLedgerEntry(payload);
      if (result?.idempotent) {
        payoutSummary.idempotent += 1;
      } else if (result?.skipped) {
        payoutSummary.skipped += 1;
      } else {
        payoutSummary.created += 1;
      }
      pushSample(payoutSummary.samples, {
        requestId,
        username: payload.username,
        amountUsd: payload.amountUsd,
        status: payload.status,
        ledgerEntryId: normalizeText(result?.entry?.id),
        idempotent: Boolean(result?.idempotent),
      });
    } catch (error) {
      payoutSummary.failed += 1;
      pushSample(payoutSummary.errorSamples, {
        requestId,
        error: error instanceof Error ? error.message : String(error || 'Unknown error.'),
      });
    }
  }

  return summary;
}

runBackfill()
  .then((summary) => {
    console.log(JSON.stringify(summary, null, 2));
  })
  .catch((error) => {
    console.error('Ledger backfill failed:', error?.stack || error?.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end().catch(() => {});
  });
