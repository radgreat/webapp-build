import { readRegisteredMembersStore } from '../stores/member.store.js';
import { createLeadershipMatchingBonusLedgerEntry } from './ledger.service.js';

const MAX_SPONSOR_LEVEL = 9;
const BONUS_TYPE_KEY = 'leadership_matching_bonus';
const FINALIZED_STATUSES = new Set(['posted', 'paid', 'finalized']);
const SUPPORTED_SOURCE_TYPES = new Set(['sales_team_commission', 'sales-team-commission']);

const LEADERSHIP_MATCH_PERCENT_BY_RANK = Object.freeze({
  ruby: Object.freeze([5, 0, 0, 0, 0, 0, 0, 0, 0]),
  emerald: Object.freeze([5, 5, 0, 0, 0, 0, 0, 0, 0]),
  sapphire: Object.freeze([5, 5, 5, 0, 0, 0, 0, 0, 0]),
  diamond: Object.freeze([10, 7, 5, 5, 0, 0, 0, 0, 0]),
  bluediamond: Object.freeze([10, 7, 5, 5, 5, 0, 0, 0, 0]),
  blackdiamond: Object.freeze([10, 7, 5, 5, 5, 5, 0, 0, 0]),
  crown: Object.freeze([15, 10, 7, 5, 5, 5, 5, 0, 0]),
  doublecrown: Object.freeze([15, 10, 7, 5, 5, 5, 5, 5, 0]),
  royalcrown: Object.freeze([15, 10, 7, 5, 5, 5, 5, 5, 5]),
});

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeCredential(value) {
  return normalizeText(value).toLowerCase();
}

function normalizeRankKey(value) {
  const normalized = normalizeCredential(value).replace(/[^a-z0-9]+/g, '');
  if (normalized === 'blue') {
    return '';
  }
  if (Object.prototype.hasOwnProperty.call(LEADERSHIP_MATCH_PERCENT_BY_RANK, normalized)) {
    return normalized;
  }
  return '';
}

function roundCurrencyAmount(value, fallback = 0) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return Math.max(0, Math.round((Number(fallback) || 0) * 100) / 100);
  }
  return Math.max(0, Math.round(numeric * 100) / 100);
}

function resolveMatchPercentForLevel(rankLabel, levelInput) {
  const level = Math.max(1, Math.min(MAX_SPONSOR_LEVEL, Number.parseInt(String(levelInput || 1), 10) || 1));
  const rankKey = normalizeRankKey(rankLabel);
  if (!rankKey) {
    return 0;
  }
  const levelTable = LEADERSHIP_MATCH_PERCENT_BY_RANK[rankKey] || [];
  return Math.max(0, Number(levelTable[level - 1] || 0));
}

function prefersCandidateRow(existingRow = null, candidateRow = null) {
  if (!candidateRow || typeof candidateRow !== 'object') {
    return false;
  }
  if (!existingRow || typeof existingRow !== 'object') {
    return true;
  }

  const candidateType = normalizeCredential(candidateRow?.businessCenterNodeType);
  const existingType = normalizeCredential(existingRow?.businessCenterNodeType);
  if (candidateType === 'main_center' && existingType !== 'main_center') {
    return true;
  }
  if (!normalizeText(existingRow?.userId) && normalizeText(candidateRow?.userId)) {
    return true;
  }
  return false;
}

function buildMemberLookup(members = []) {
  const byUsername = new Map();
  const byUserId = new Map();

  (Array.isArray(members) ? members : []).forEach((memberRow) => {
    const safeRow = memberRow && typeof memberRow === 'object' ? memberRow : null;
    if (!safeRow) {
      return;
    }

    const usernameKey = normalizeCredential(safeRow?.memberUsername || safeRow?.username);
    if (usernameKey) {
      const existingRow = byUsername.get(usernameKey) || null;
      if (prefersCandidateRow(existingRow, safeRow)) {
        byUsername.set(usernameKey, safeRow);
      } else if (!existingRow) {
        byUsername.set(usernameKey, safeRow);
      }
    }

    const userId = normalizeText(safeRow?.userId);
    if (userId) {
      const existingRow = byUserId.get(userId) || null;
      if (prefersCandidateRow(existingRow, safeRow)) {
        byUserId.set(userId, safeRow);
      } else if (!existingRow) {
        byUserId.set(userId, safeRow);
      }
    }
  });

  return {
    byUsername,
    byUserId,
  };
}

function resolveSourceEarnerMember(lookup, payload = {}) {
  const byUserId = lookup?.byUserId instanceof Map ? lookup.byUserId : new Map();
  const byUsername = lookup?.byUsername instanceof Map ? lookup.byUsername : new Map();

  const sourceUserId = normalizeText(payload?.sourceEarnerUserId || payload?.userId);
  if (sourceUserId && byUserId.has(sourceUserId)) {
    return byUserId.get(sourceUserId) || null;
  }

  const sourceUsername = normalizeCredential(payload?.sourceEarnerUsername || payload?.username);
  if (sourceUsername && byUsername.has(sourceUsername)) {
    return byUsername.get(sourceUsername) || null;
  }

  const sourceEmail = normalizeCredential(payload?.sourceEarnerEmail || payload?.email);
  if (sourceEmail) {
    for (const row of byUsername.values()) {
      if (normalizeCredential(row?.email) === sourceEmail) {
        return row;
      }
    }
  }

  return null;
}

function buildEarningIdempotencyKey(sourceSalesTeamCommissionId, recipientUserId, sponsorLevel) {
  return [
    BONUS_TYPE_KEY,
    normalizeText(sourceSalesTeamCommissionId),
    normalizeText(recipientUserId),
    `level:${Math.max(1, Number.parseInt(String(sponsorLevel || 1), 10) || 1)}`,
  ].join(':');
}

const LEADERSHIP_MATCHING_DEFAULT_DEPENDENCIES = Object.freeze({
  readRegisteredMembersStore,
  createLeadershipMatchingBonusLedgerEntry,
});

const leadershipMatchingDependencies = {
  ...LEADERSHIP_MATCHING_DEFAULT_DEPENDENCIES,
};

export function __setLeadershipMatchingServiceDependenciesForTests(overrides = {}) {
  if (!overrides || typeof overrides !== 'object') {
    return;
  }
  Object.assign(leadershipMatchingDependencies, overrides);
}

export function __resetLeadershipMatchingServiceDependenciesForTests() {
  Object.assign(leadershipMatchingDependencies, LEADERSHIP_MATCHING_DEFAULT_DEPENDENCIES);
}

export function resolveLeadershipMatchingPercent(rankLabel, sponsorLevel) {
  return resolveMatchPercentForLevel(rankLabel, sponsorLevel);
}

export async function processLeadershipMatchingBonusFromSalesTeamCommission(payload = {}, options = {}) {
  const sourceSalesTeamCommissionId = normalizeText(
    payload?.sourceSalesTeamCommissionId
    || payload?.salesTeamCommissionId
    || payload?.sourceId,
  );
  const sourceEarnerUserId = normalizeText(payload?.sourceEarnerUserId || payload?.userId);
  const baseSalesTeamCommissionAmount = roundCurrencyAmount(
    payload?.baseSalesTeamCommissionAmount ?? payload?.amountUsd ?? payload?.amount,
    0,
  );
  const sourceType = normalizeCredential(payload?.sourceType || 'sales_team_commission').replace(/\s+/g, '_');
  const sourceStatus = normalizeCredential(payload?.status || payload?.sourceStatus || 'posted');

  if (!sourceSalesTeamCommissionId || !sourceEarnerUserId || baseSalesTeamCommissionAmount <= 0) {
    return {
      success: true,
      status: 200,
      data: {
        success: true,
        skipped: true,
        reason: 'Missing required source commission context.',
        entries: [],
      },
    };
  }

  if (!SUPPORTED_SOURCE_TYPES.has(sourceType)) {
    return {
      success: true,
      status: 200,
      data: {
        success: true,
        skipped: true,
        reason: `Unsupported source type "${sourceType}" for Leadership Matching Bonus.`,
        entries: [],
      },
    };
  }

  if (sourceStatus && !FINALIZED_STATUSES.has(sourceStatus)) {
    return {
      success: true,
      status: 200,
      data: {
        success: true,
        skipped: true,
        reason: `Source status "${sourceStatus}" is not finalized.`,
        entries: [],
      },
    };
  }

  const registeredMembers = await leadershipMatchingDependencies.readRegisteredMembersStore({
    client: options?.executor,
  });
  const lookup = buildMemberLookup(registeredMembers);
  const sourceMember = resolveSourceEarnerMember(lookup, payload);
  if (!sourceMember) {
    return {
      success: true,
      status: 200,
      data: {
        success: true,
        skipped: true,
        reason: 'Source earner member profile was not found in registered members.',
        entries: [],
      },
    };
  }

  const entries = [];
  const visitedSponsorKeys = new Set();
  let sponsorUsernameKey = normalizeCredential(sourceMember?.sponsorUsername);

  for (let level = 1; level <= MAX_SPONSOR_LEVEL; level += 1) {
    if (!sponsorUsernameKey) {
      break;
    }
    if (visitedSponsorKeys.has(sponsorUsernameKey)) {
      break;
    }
    visitedSponsorKeys.add(sponsorUsernameKey);

    const sponsorMember = lookup.byUsername.get(sponsorUsernameKey) || null;
    if (!sponsorMember) {
      break;
    }

    const recipientUserId = normalizeText(sponsorMember?.userId);
    const recipientRank = normalizeText(sponsorMember?.accountRank || sponsorMember?.rank);
    const matchPercentage = resolveMatchPercentForLevel(recipientRank, level);
    const matchAmount = roundCurrencyAmount((baseSalesTeamCommissionAmount * matchPercentage) / 100, 0);
    const shouldCreateEntry = Boolean(recipientUserId && matchPercentage > 0 && matchAmount > 0);

    let ledgerResult = {
      entry: null,
      idempotent: false,
      skipped: true,
    };

    if (shouldCreateEntry) {
      const idempotencyKey = buildEarningIdempotencyKey(sourceSalesTeamCommissionId, recipientUserId, level);
      ledgerResult = await leadershipMatchingDependencies.createLeadershipMatchingBonusLedgerEntry({
        userId: recipientUserId,
        username: normalizeText(sponsorMember?.memberUsername || sponsorMember?.username),
        email: normalizeText(sponsorMember?.email),
        recipientUserId,
        recipientUsername: normalizeText(sponsorMember?.memberUsername || sponsorMember?.username),
        recipientEmail: normalizeText(sponsorMember?.email),
        recipientRank,
        sponsorLevel: level,
        matchPercentage,
        amountUsd: matchAmount,
        baseSalesTeamCommissionAmount,
        status: 'posted',
        sourceId: sourceSalesTeamCommissionId,
        sourceSalesTeamCommissionId,
        sourceCycleId: normalizeText(payload?.sourceCycleId || payload?.cycleId),
        sourceCycleBatchId: normalizeText(payload?.sourceCycleBatchId || payload?.cycleBatchId),
        sourceCycleCutoffId: normalizeText(payload?.sourceCycleCutoffId || payload?.cycleCutoffId),
        sourceEarnerUserId,
        sourceEarnerUsername: normalizeText(payload?.sourceEarnerUsername || payload?.username),
        sourceEarnerEmail: normalizeText(payload?.sourceEarnerEmail || payload?.email),
        sourceRef: normalizeText(payload?.sourceRef || payload?.sourceCycleId || sourceSalesTeamCommissionId),
        idempotencyKey,
        description: `Leadership matching bonus L${level} from Sales Team commission ${sourceSalesTeamCommissionId}`,
        postedAt: normalizeText(payload?.postedAt),
        createdAt: normalizeText(payload?.createdAt),
      }, {
        executor: options?.executor,
      });
    }

    entries.push({
      sponsorLevel: level,
      sponsorUsername: normalizeText(sponsorMember?.memberUsername || sponsorMember?.username),
      recipientUserId,
      recipientRank,
      matchPercentage,
      baseSalesTeamCommissionAmount,
      matchingBonusAmount: shouldCreateEntry ? matchAmount : 0,
      skipped: Boolean(ledgerResult?.skipped) || !shouldCreateEntry,
      idempotent: Boolean(ledgerResult?.idempotent),
      ledgerEntryId: normalizeText(ledgerResult?.entry?.id),
    });

    sponsorUsernameKey = normalizeCredential(sponsorMember?.sponsorUsername);
  }

  const createdCount = entries.filter((entry) => !entry.skipped && !entry.idempotent && entry.ledgerEntryId).length;
  const idempotentCount = entries.filter((entry) => !entry.skipped && entry.idempotent).length;
  const skippedCount = entries.filter((entry) => entry.skipped).length;

  return {
    success: true,
    status: 200,
    data: {
      success: true,
      sourceSalesTeamCommissionId,
      sourceEarnerUserId,
      maxSponsorLevels: MAX_SPONSOR_LEVEL,
      traversedLevels: entries.length,
      createdCount,
      idempotentCount,
      skippedCount,
      entries,
    },
  };
}
