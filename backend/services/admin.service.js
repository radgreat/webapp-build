import { readRegisteredMembersStore, writeRegisteredMembersStore } from '../stores/member.store.js';
import { readMockUsersStore, writeMockUsersStore } from '../stores/user.store.js';
import { readPasswordSetupTokensStore, writePasswordSetupTokensStore } from '../stores/token.store.js';
import { readMockEmailOutboxStore, writeMockEmailOutboxStore } from '../stores/email.store.js';
import { readMockStoreInvoicesStore, writeMockStoreInvoicesStore } from '../stores/invoice.store.js';
import { readMockPayoutRequestsStore, writeMockPayoutRequestsStore } from '../stores/payout.store.js';
import {
  readMockBinaryTreeMetricsStore,
  writeMockBinaryTreeMetricsStore,
  readMockSalesTeamCommissionsStore,
  writeMockSalesTeamCommissionsStore,
} from '../stores/metrics.store.js';
import {
  readForceServerCutoffHistoryStore,
  writeForceServerCutoffHistoryStore,
  readMemberServerCutoffStateStore,
  writeMemberServerCutoffStateStore,
} from '../stores/cutoff.store.js';
import adminPool, { isAdminDbConfigured } from '../db/admin-db.js';

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeCredential(value) {
  return normalizeText(value).toLowerCase();
}

function toWholeNumber(value, fallback = 0) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }
  return Math.max(0, Math.floor(numeric));
}

function roundCurrencyAmount(value) {
  return Math.round((Math.max(0, Number(value) || 0)) * 100) / 100;
}

const SALES_TEAM_CYCLE_COMMISSION_PLAN = Object.freeze({
  'preferred-customer-pack': Object.freeze({ multiplier: 0, perCycle: 0, weeklyCapCycles: 0 }),
  'personal-builder-pack': Object.freeze({ multiplier: 0.05, perCycle: 25, weeklyCapCycles: 50 }),
  'business-builder-pack': Object.freeze({ multiplier: 0.075, perCycle: 37.5, weeklyCapCycles: 250 }),
  'infinity-builder-pack': Object.freeze({ multiplier: 0.1, perCycle: 50, weeklyCapCycles: 500 }),
  'legacy-builder-pack': Object.freeze({ multiplier: 0.125, perCycle: 62.5, weeklyCapCycles: 1000 }),
});

const FAST_TRACK_PACKAGE_META = {
  'preferred-customer-pack': { label: 'Free Account', price: 0, bv: 0 },
  'personal-builder-pack': { label: 'Personal Builder Pack', price: 192, bv: 192 },
  'business-builder-pack': { label: 'Business Builder Pack', price: 384, bv: 300 },
  'infinity-builder-pack': { label: 'Infinity Builder Pack', price: 640, bv: 500 },
  'legacy-builder-pack': { label: 'Legacy Builder Pack', price: 1280, bv: 1000 },
};

function buildUserIdentityLookup(users) {
  const lookup = new Map();

  (Array.isArray(users) ? users : []).forEach((user) => {
    [user?.id, user?.username, user?.email].forEach((candidate) => {
      const key = normalizeCredential(candidate);
      if (key && !lookup.has(key)) {
        lookup.set(key, user);
      }
    });
  });

  return lookup;
}

function resolveMetricsIdentityKeys(identityPayload) {
  const keys = new Set();

  const appendKey = (value) => {
    const normalized = normalizeCredential(value);
    if (normalized) {
      keys.add(normalized);
    }
  };

  appendKey(identityPayload?.userId);
  appendKey(identityPayload?.username);
  appendKey(identityPayload?.email);
  return keys;
}

function doesMetricsRecordBelongToIdentity(record, identityKeys) {
  if (!(identityKeys instanceof Set) || identityKeys.size === 0) {
    return false;
  }

  const candidates = [record?.userId, record?.username, record?.email];
  return candidates.some((candidate) => {
    const normalized = normalizeCredential(candidate);
    return normalized ? identityKeys.has(normalized) : false;
  });
}

function resolveFirstLookupMatch(identityKeys, lookup) {
  if (!(identityKeys instanceof Set) || identityKeys.size === 0 || !(lookup instanceof Map) || lookup.size === 0) {
    return null;
  }

  for (const key of identityKeys) {
    if (lookup.has(key)) {
      return lookup.get(key) || null;
    }
  }

  return null;
}

function resolvePackageKeyFromRankLabel(rankValue) {
  const normalizedRank = normalizeCredential(rankValue);
  if (normalizedRank === 'preferred customer' || normalizedRank === 'free account' || normalizedRank === 'free') return 'preferred-customer-pack';
  if (normalizedRank === 'personal') return 'personal-builder-pack';
  if (normalizedRank === 'business') return 'business-builder-pack';
  if (normalizedRank === 'infinity') return 'infinity-builder-pack';
  if (normalizedRank === 'legacy') return 'legacy-builder-pack';
  return '';
}

function resolveSalesTeamCycleCommissionProfile(packageKey) {
  const normalizedPackageKey = normalizeCredential(packageKey);
  const fallbackPackageKey = 'personal-builder-pack';
  const resolvedPackageKey = SALES_TEAM_CYCLE_COMMISSION_PLAN[normalizedPackageKey]
    ? normalizedPackageKey
    : fallbackPackageKey;

  const profile = SALES_TEAM_CYCLE_COMMISSION_PLAN[resolvedPackageKey];

  return {
    packageKey: resolvedPackageKey,
    multiplier: Math.max(0, Number(profile?.multiplier) || 0),
    perCycleAmount: roundCurrencyAmount(profile?.perCycle),
    weeklyCapCycles: Math.max(0, toWholeNumber(profile?.weeklyCapCycles, 0)),
  };
}

function doesPayoutRequestBelongToIdentity(request, identityKeys) {
  if (!(identityKeys instanceof Set) || identityKeys.size === 0) {
    return false;
  }

  const candidates = [
    request?.requestedByUserId,
    request?.requestedByUsername,
    request?.requestedByEmail,
  ];

  return candidates.some((candidate) => {
    const normalizedCandidate = normalizeCredential(candidate);
    return normalizedCandidate ? identityKeys.has(normalizedCandidate) : false;
  });
}

function resolveSalesTeamPayoutOffsetAmount(identityKeys, payoutRequests) {
  if (!(identityKeys instanceof Set) || identityKeys.size === 0) {
    return 0;
  }

  return (Array.isArray(payoutRequests) ? payoutRequests : []).reduce((sum, request) => {
    if (normalizeCredential(request?.sourceKey) !== 'salesteam') {
      return sum;
    }
    if (!doesPayoutRequestBelongToIdentity(request, identityKeys)) {
      return sum;
    }
    return sum + Math.max(0, Number(request?.amount) || 0);
  }, 0);
}

export async function resetAllMockData(payload = {}) {
  if (!isAdminDbConfigured()) {
    return {
      success: false,
      status: 500,
      data: {
        success: false,
        error: 'Admin database credentials are not configured. Set DB_ADMIN_USER and DB_ADMIN_PASSWORD.',
      },
    };
  }

  const tablesByKey = {
    members: 'registered_members',
    users: 'member_users',
    tokens: 'password_setup_tokens',
    emails: 'email_outbox',
    invoices: 'store_invoices',
    payoutRequests: 'payout_requests',
    binaryTreeSnapshots: 'binary_tree_metrics_snapshots',
    salesTeamCommissions: 'sales_team_commission_snapshots',
    forceServerCutoffHistory: 'force_server_cutoff_history',
    memberServerCutoffStates: 'member_server_cutoff_states',
  };

  const tableNames = Object.values(tablesByKey);
  const qualifiedTableList = tableNames.map((name) => `charge.${name}`).join(', ');
  const client = await adminPool.connect();

  let cleared = {
    members: 0,
    users: 0,
    tokens: 0,
    emails: 0,
    invoices: 0,
    payoutRequests: 0,
    binaryTreeSnapshots: 0,
    salesTeamCommissions: 0,
    forceServerCutoffHistory: 0,
    memberServerCutoffStates: 0,
  };

  try {
    await client.query('BEGIN');

    const countEntries = [];
    for (const [key, tableName] of Object.entries(tablesByKey)) {
      const countResult = await client.query(
        `SELECT COUNT(*)::int AS count FROM charge.${tableName}`
      );
      countEntries.push([key, Number(countResult.rows[0]?.count || 0)]);
    }

    cleared = Object.fromEntries(countEntries);

    await client.query(`TRUNCATE TABLE ${qualifiedTableList}`);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  return {
    success: true,
    status: 200,
    data: {
      success: true,
      clearedAt: new Date().toISOString(),
      clearedBy: normalizeText(payload.updatedBy || payload.clearedBy || 'admin'),
      cleared,
    },
  };
}

export async function getForceServerCutoffHistory(query = {}) {
  const requestedLimit = Number.parseInt(String(query?.limit ?? '25'), 10);
  const historyLimit = Number.isFinite(requestedLimit)
    ? Math.min(100, Math.max(1, requestedLimit))
    : 25;

  const history = await readForceServerCutoffHistoryStore();

  return {
    success: true,
    status: 200,
    data: {
      success: true,
      count: history.length,
      history: history.slice(0, historyLimit),
    },
  };
}

export async function forceServerCutoff(payload = {}) {
  const [snapshots, commissions, users, members, payoutRequests, existingCutoffStates, existingHistory] = await Promise.all([
    readMockBinaryTreeMetricsStore(),
    readMockSalesTeamCommissionsStore(),
    readMockUsersStore(),
    readRegisteredMembersStore(),
    readMockPayoutRequestsStore(),
    readMemberServerCutoffStateStore(),
    readForceServerCutoffHistoryStore(),
  ]);

  const snapshotRecords = Array.isArray(snapshots) ? snapshots : [];
  const existingCommissions = Array.isArray(commissions) ? commissions : [];
  const normalizedUsers = Array.isArray(users) ? users : [];
  const normalizedMembers = Array.isArray(members) ? members : [];
  const userIdentityLookup = buildUserIdentityLookup(normalizedUsers);
  const matchedCommissionIndexes = new Set();
  const nextSnapshots = [];
  const nextCommissions = [];
  const nowIso = new Date().toISOString();

  const resolveEnrollmentPackageBv = (packageKey) => {
    const normalizedPackageKey = normalizeCredential(packageKey);
    const packageBvRaw = Number(FAST_TRACK_PACKAGE_META?.[normalizedPackageKey]?.bv);
    return Number.isFinite(packageBvRaw) ? Math.max(0, Math.floor(packageBvRaw)) : 0;
  };

  const nextUsers = normalizedUsers.map((user) => {
    const enrollmentPackageBv = Math.max(
      0,
      toWholeNumber(user?.enrollmentPackageBv, resolveEnrollmentPackageBv(user?.enrollmentPackage))
    );
    const starterPersonalPv = Math.max(0, toWholeNumber(user?.starterPersonalPv, enrollmentPackageBv));

    return {
      ...user,
      serverCutoffBaselineStarterPersonalPv: starterPersonalPv,
      serverCutoffBaselineSetAt: nowIso,
    };
  });

  const nextMembers = normalizedMembers.map((member) => {
    const enrollmentPackageBv = Math.max(
      0,
      toWholeNumber(member?.packageBv, resolveEnrollmentPackageBv(member?.enrollmentPackage))
    );
    const starterPersonalPv = Math.max(0, toWholeNumber(member?.starterPersonalPv, enrollmentPackageBv));

    return {
      ...member,
      serverCutoffBaselineStarterPersonalPv: starterPersonalPv,
      serverCutoffBaselineSetAt: nowIso,
    };
  });

  let totalCyclesApplied = 0;
  let totalCappedCycles = 0;
  let totalOverflowCycles = 0;
  let totalGrossCommissionAmount = 0;
  let totalPayoutOffsetAmount = 0;
  let totalNetCommissionAmount = 0;

  snapshotRecords.forEach((snapshot, snapshotIndex) => {
    const leftLegBv = Math.max(0, toWholeNumber(snapshot?.leftLegBv, 0));
    const rightLegBv = Math.max(0, toWholeNumber(snapshot?.rightLegBv, 0));
    const cycleLowerBv = Math.max(1, toWholeNumber(snapshot?.cycleLowerBv, 500));
    const cycleHigherBv = Math.max(cycleLowerBv, toWholeNumber(snapshot?.cycleHigherBv, 1000));

    const totalCycles = Math.floor(Math.min(
      leftLegBv / cycleLowerBv,
      rightLegBv / cycleHigherBv,
    ));

    totalCyclesApplied += totalCycles;

    nextSnapshots.push({
      ...snapshot,
      leftLegBv,
      rightLegBv,
      cycleLowerBv,
      cycleHigherBv,
      totalCycles,
      totalAccumulatedBv: leftLegBv + rightLegBv,
      updatedAt: nowIso,
      createdAt: snapshot?.createdAt || nowIso,
    });

    const identityKeys = resolveMetricsIdentityKeys(snapshot);
    const matchedUser = resolveFirstLookupMatch(identityKeys, userIdentityLookup);

    const existingCommissionIndex = existingCommissions.findIndex((commission, commissionIndex) => {
      if (matchedCommissionIndexes.has(commissionIndex)) {
        return false;
      }
      return doesMetricsRecordBelongToIdentity(commission, identityKeys);
    });

    const existingCommission = existingCommissionIndex >= 0 ? existingCommissions[existingCommissionIndex] : null;
    if (existingCommissionIndex >= 0) {
      matchedCommissionIndexes.add(existingCommissionIndex);
    }

    const packageKeyFromCommission = normalizeCredential(existingCommission?.accountPackageKey);
    const packageKeyFromUser = normalizeCredential(matchedUser?.enrollmentPackage);
    const packageKeyFromRank = resolvePackageKeyFromRankLabel(
      snapshot?.accountRank || matchedUser?.accountRank || matchedUser?.rank
    );

    const commissionProfile = resolveSalesTeamCycleCommissionProfile(
      packageKeyFromCommission || packageKeyFromUser || packageKeyFromRank || 'personal-builder-pack'
    );

    const cappedCycles = commissionProfile.weeklyCapCycles > 0
      ? Math.min(totalCycles, commissionProfile.weeklyCapCycles)
      : totalCycles;

    const overflowCycles = Math.max(0, totalCycles - cappedCycles);
    const grossCommissionAmount = roundCurrencyAmount(cappedCycles * commissionProfile.perCycleAmount);
    const payoutOffsetAmountRaw = roundCurrencyAmount(resolveSalesTeamPayoutOffsetAmount(identityKeys, payoutRequests));
    // Keep payout offset bounded by current gross commission so DB integrity
    // checks remain valid and net commission cannot underflow.
    const payoutOffsetAmount = roundCurrencyAmount(Math.min(grossCommissionAmount, payoutOffsetAmountRaw));
    const netCommissionAmount = roundCurrencyAmount(Math.max(0, grossCommissionAmount - payoutOffsetAmount));

    totalCappedCycles += cappedCycles;
    totalOverflowCycles += overflowCycles;
    totalGrossCommissionAmount = roundCurrencyAmount(totalGrossCommissionAmount + grossCommissionAmount);
    totalPayoutOffsetAmount = roundCurrencyAmount(totalPayoutOffsetAmount + payoutOffsetAmount);
    totalNetCommissionAmount = roundCurrencyAmount(totalNetCommissionAmount + netCommissionAmount);

    nextCommissions.push({
      ...(existingCommission || {}),
      id: existingCommission?.id || `sales_team_commission_${Date.now()}_${snapshotIndex + 1}`,
      userId: normalizeText(existingCommission?.userId || snapshot?.userId || matchedUser?.id),
      username: normalizeText(existingCommission?.username || snapshot?.username || matchedUser?.username),
      email: normalizeText(existingCommission?.email || snapshot?.email || matchedUser?.email),
      accountPackageKey: commissionProfile.packageKey,
      cycleMultiplier: commissionProfile.multiplier,
      perCycleAmount: commissionProfile.perCycleAmount,
      weeklyCapCycles: commissionProfile.weeklyCapCycles,
      totalCycles,
      cappedCycles,
      overflowCycles,
      grossCommissionAmount,
      payoutOffsetAmount,
      netCommissionAmount,
      updatedAt: nowIso,
      createdAt: existingCommission?.createdAt || nowIso,
    });
  });

  const untouchedCommissions = existingCommissions.filter((_, index) => !matchedCommissionIndexes.has(index));

  const nextCutoffStates = [];
  let memberServerCutoffStatesUpdated = 0;

  nextUsers.forEach((user, index) => {
    const identityKeys = resolveMetricsIdentityKeys({
      userId: user?.id,
      username: user?.username,
      email: user?.email,
    });

    const matchedSnapshot = nextSnapshots.find((entry) => doesMetricsRecordBelongToIdentity(entry, identityKeys)) || null;
    const existingState = existingCutoffStates.find((entry) => doesMetricsRecordBelongToIdentity(entry, identityKeys)) || null;

    const nextState = {
      ...(existingState || {}),
      id: existingState?.id || `member_cutoff_state_${Date.now()}_${index + 1}`,
      userId: normalizeText(existingState?.userId || user?.id || matchedSnapshot?.userId),
      username: normalizeText(existingState?.username || user?.username || matchedSnapshot?.username),
      email: normalizeText(existingState?.email || user?.email || matchedSnapshot?.email),
      baselineLeftLegBv: matchedSnapshot ? Math.max(0, toWholeNumber(matchedSnapshot?.leftLegBv, 0)) : 0,
      baselineRightLegBv: matchedSnapshot ? Math.max(0, toWholeNumber(matchedSnapshot?.rightLegBv, 0)) : 0,
      lastAppliedCutoffUtcMs: Math.max(0, Math.floor(Date.parse(nowIso) || 0)),
      createdAt: existingState?.createdAt || nowIso,
      updatedAt: nowIso,
    };

    nextCutoffStates.push(nextState);
    memberServerCutoffStatesUpdated += 1;
  });

  const appliedSummary = {
    snapshotsUpdated: nextSnapshots.length,
    commissionsUpdated: nextCommissions.length,
    commissionsUnchanged: untouchedCommissions.length,
    memberServerCutoffStatesTargeted: nextUsers.length,
    memberServerCutoffStatesUpdated,
    totalCyclesApplied,
    totalCappedCycles,
    totalOverflowCycles,
    totalGrossCommissionAmount,
    totalPayoutOffsetAmount,
    totalNetCommissionAmount,
  };

  const historyEntry = {
    id: `force_cutoff_${Date.now()}`,
    forcedAt: nowIso,
    forcedBy: normalizeText(payload.updatedBy || payload.forcedBy || 'admin'),
    applied: appliedSummary,
  };

  const nextHistory = [historyEntry, ...(Array.isArray(existingHistory) ? existingHistory : [])];

  // Writes are ordered to avoid deadlocks across related tables (users/members
  // and dependent snapshots/cutoff state writes).
  await writeMockUsersStore(nextUsers);
  await writeRegisteredMembersStore(nextMembers);
  await writeMockBinaryTreeMetricsStore(nextSnapshots);
  await writeMockSalesTeamCommissionsStore([...nextCommissions, ...untouchedCommissions]);
  await writeMemberServerCutoffStateStore(nextCutoffStates);
  await writeForceServerCutoffHistoryStore(nextHistory);

  return {
    success: true,
    status: 200,
    data: {
      success: true,
      forcedAt: nowIso,
      forcedBy: historyEntry.forcedBy,
      applied: appliedSummary,
      historyEntry,
      history: nextHistory.slice(0, 25),
    },
  };
}
