import { readMockUsersStore } from '../stores/user.store.js';
import { readPasswordSetupTokensStore, writePasswordSetupTokensStore } from '../stores/token.store.js';
import { readMockEmailOutboxStore, writeMockEmailOutboxStore } from '../stores/email.store.js';
import { readMockStoreInvoicesStore, writeMockStoreInvoicesStore } from '../stores/invoice.store.js';
import { readMockPayoutRequestsStore, writeMockPayoutRequestsStore } from '../stores/payout.store.js';
import servicePool from '../db/db.js';
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
import adminPool from '../db/admin-db.js';
import { resolveMemberActivityStateByPersonalBv } from '../utils/member-activity.helpers.js';
import {
  BINARY_CYCLE_STRONG_LEG_BV,
  BINARY_CYCLE_WEAK_LEG_BV,
  resolveBinaryCycleComputation,
  resolveServerCutoffCarryForwardState,
} from '../utils/binary-cycle.helpers.js';

const SQL_IDENTIFIER_PATTERN = /^[a-z_][a-z0-9_]*$/i;

const FLUSH_TRUNCATE_TABLES_BY_KEY = Object.freeze({
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
  memberAuthSessions: 'member_auth_sessions',
  memberEmailVerificationTokens: 'member_email_verification_tokens',
  memberBinaryTreeIntroState: 'member_binary_tree_intro_state',
  memberCommissionContainers: 'member_commission_containers',
  memberGoodLifeMonthlyProgress: 'member_good_life_monthly_progress',
  memberNotifications: 'member_notifications',
  memberNotificationReads: 'member_notification_reads',
  memberRankAdvancementMonthlyProgress: 'member_rank_advancement_monthly_progress',
  memberAchievementClaims: 'member_achievement_claims',
  memberTitleAwards: 'member_title_awards',
  memberProfileBadgeSelection: 'member_profile_badge_selection',
  preferredAttributionClaims: 'preferred_attribution_claims',
  preferredAttributionLocks: 'preferred_account_attribution_locks',
  userAutoShipSettings: 'user_auto_ship_settings',
  userAutoShipEvents: 'user_auto_ship_events',
  ewalletAccounts: 'ewallet_accounts',
  ewalletPeerTransfers: 'ewallet_peer_transfers',
  ledgerEntries: 'ledger_entries',
  walletLedgerEntries: 'wallet_ledger_entries',
  businessCenterOwnerProgress: 'business_center_owner_progress',
  businessCenterActivationAudit: 'business_center_activation_audit',
  businessCenterCycleStates: 'business_center_cycle_states',
  businessCenterCommissionEvents: 'business_center_commission_events',
  stripeWebhookEvents: 'stripe_webhook_events',
});

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

function assertSafeTableIdentifier(tableName) {
  const normalizedTableName = normalizeText(tableName);
  if (!SQL_IDENTIFIER_PATTERN.test(normalizedTableName)) {
    throw new Error(`Unsafe table identifier: ${normalizedTableName || '(empty)'}`);
  }

  return normalizedTableName;
}

function buildQualifiedChargeTableName(tableName) {
  return `charge.${assertSafeTableIdentifier(tableName)}`;
}

async function doesChargeTableExist(client, tableName) {
  const qualifiedName = buildQualifiedChargeTableName(tableName);
  const result = await client.query(`
    SELECT to_regclass($1) AS table_name
  `, [qualifiedName]);

  return Boolean(result.rows?.[0]?.table_name);
}

async function countRowsInChargeTable(client, tableName) {
  const qualifiedTableName = buildQualifiedChargeTableName(tableName);
  const countResult = await client.query(`
    SELECT COUNT(*)::int AS count
    FROM ${qualifiedTableName}
  `);

  return Number(countResult.rows?.[0]?.count || 0);
}

function resolvePgErrorCode(error) {
  return normalizeText(error?.code).toUpperCase();
}

function isPgAuthenticationFailure(error) {
  const errorCode = resolvePgErrorCode(error);
  const errorMessage = normalizeText(error?.message).toLowerCase();
  return errorCode === '28P01'
    || errorCode === '28000'
    || errorMessage.includes('password authentication failed');
}

async function connectResetClientWithFallback() {
  try {
    const adminClient = await adminPool.connect();
    return {
      client: adminClient,
      warning: '',
      connectionRole: 'admin',
    };
  } catch (adminError) {
    if (!isPgAuthenticationFailure(adminError)) {
      throw adminError;
    }

    const serviceClient = await servicePool.connect();
    return {
      client: serviceClient,
      warning: 'Admin DB credentials failed authentication. Flush ran using service DB credentials.',
      connectionRole: 'service',
    };
  }
}

const SALES_TEAM_CYCLE_COMMISSION_PLAN = Object.freeze({
  'preferred-customer-pack': Object.freeze({ multiplier: 0, perCycle: 0, weeklyCapCycles: 0 }),
  'personal-builder-pack': Object.freeze({ multiplier: 0.05, perCycle: 25, weeklyCapCycles: 50 }),
  'business-builder-pack': Object.freeze({ multiplier: 0.075, perCycle: 37.5, weeklyCapCycles: 250 }),
  'infinity-builder-pack': Object.freeze({ multiplier: 0.1, perCycle: 50, weeklyCapCycles: 500 }),
  'legacy-builder-pack': Object.freeze({ multiplier: 0.125, perCycle: 62.5, weeklyCapCycles: 1000 }),
});

const CYCLE_RULE_STRONGER_BV = BINARY_CYCLE_STRONG_LEG_BV;
const CYCLE_RULE_WEAKER_BV = BINARY_CYCLE_WEAK_LEG_BV;

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
    const normalizedStatus = normalizeCredential(request?.status);
    if (normalizedStatus === 'failed' || normalizedStatus === 'cancelled' || normalizedStatus === 'canceled') {
      return sum;
    }
    if (!doesPayoutRequestBelongToIdentity(request, identityKeys)) {
      return sum;
    }
    return sum + Math.max(0, Number(request?.amount) || 0);
  }, 0);
}

function isMemberActiveForServerCutoff(activityState) {
  if (!activityState || typeof activityState !== 'object') {
    return true;
  }

  const currentPersonalPvBv = Math.max(0, toWholeNumber(
    activityState?.currentPersonalPvBv,
    activityState?.currentPersonalBv,
  ));
  const requiredPersonalBv = Math.max(1, toWholeNumber(
    activityState?.requiredPersonalBv,
    50,
  ));

  if (Number.isFinite(currentPersonalPvBv) && Number.isFinite(requiredPersonalBv)) {
    return currentPersonalPvBv >= requiredPersonalBv;
  }

  return activityState.isActive === true;
}

function resolveNextCutoffCarryForwardBaselines(snapshot, existingState, options = {}) {
  const isActiveAtCutoff = options?.isActiveAtCutoff !== false;

  if (!snapshot || typeof snapshot !== 'object') {
    return {
      baselineLeftLegBv: Math.max(0, toWholeNumber(existingState?.baselineLeftLegBv, 0)),
      baselineRightLegBv: Math.max(0, toWholeNumber(existingState?.baselineRightLegBv, 0)),
      currentWeekLeftLegBv: 0,
      currentWeekRightLegBv: 0,
      consumedLeftLegBv: 0,
      consumedRightLegBv: 0,
      carryForwardLeftLegBv: 0,
      carryForwardRightLegBv: 0,
      cyclesToApply: 0,
      wasFlushedForInactivity: false,
      strongLegSide: 'left',
    };
  }

  const totalLeftLegBv = Math.max(0, toWholeNumber(snapshot?.leftLegBv, 0));
  const totalRightLegBv = Math.max(0, toWholeNumber(snapshot?.rightLegBv, 0));
  const carryForwardState = resolveServerCutoffCarryForwardState({
    totalLeftLegBv,
    totalRightLegBv,
    baselineLeftLegBv: Math.max(0, toWholeNumber(existingState?.baselineLeftLegBv, 0)),
    baselineRightLegBv: Math.max(0, toWholeNumber(existingState?.baselineRightLegBv, 0)),
    isActiveAtCutoff,
    strongLegCycleBv: CYCLE_RULE_STRONGER_BV,
    weakLegCycleBv: CYCLE_RULE_WEAKER_BV,
  });

  return {
    ...carryForwardState,
  };
}

export async function resetAllMockData(payload = {}) {
  const clearedBy = normalizeText(payload.updatedBy || payload.clearedBy || 'admin');
  const cleared = Object.keys(FLUSH_TRUNCATE_TABLES_BY_KEY).reduce((accumulator, key) => {
    accumulator[key] = 0;
    return accumulator;
  }, {});
  const missingTables = [];
  const warnings = [];
  const { client, warning: connectionWarning, connectionRole } = await connectResetClientWithFallback();
  if (connectionWarning) {
    warnings.push(connectionWarning);
  }

  try {
    await client.query('BEGIN');

    const truncationTableNames = [];
    for (const [key, tableName] of Object.entries(FLUSH_TRUNCATE_TABLES_BY_KEY)) {
      const tableExists = await doesChargeTableExist(client, tableName);
      if (!tableExists) {
        missingTables.push(tableName);
        continue;
      }

      truncationTableNames.push(tableName);
      cleared[key] = await countRowsInChargeTable(client, tableName);
    }

    if (truncationTableNames.length > 0) {
      const qualifiedTableList = truncationTableNames
        .map((tableName) => buildQualifiedChargeTableName(tableName))
        .join(', ');
      await client.query(`TRUNCATE TABLE ${qualifiedTableList}`);
    }

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
      clearedBy,
      cleared,
      missingTables: Array.from(new Set(missingTables)).sort(),
      warnings,
      connectionRole,
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
  const [snapshots, commissions, users, payoutRequests, existingCutoffStates, existingHistory] = await Promise.all([
    readMockBinaryTreeMetricsStore(),
    readMockSalesTeamCommissionsStore(),
    readMockUsersStore(),
    readMockPayoutRequestsStore(),
    readMemberServerCutoffStateStore(),
    readForceServerCutoffHistoryStore(),
  ]);

  const snapshotRecords = Array.isArray(snapshots) ? snapshots : [];
  const existingCommissions = Array.isArray(commissions) ? commissions : [];
  const normalizedUsers = Array.isArray(users) ? users : [];
  const userIdentityLookup = buildUserIdentityLookup(normalizedUsers);
  const matchedCommissionIndexes = new Set();
  const nextSnapshots = [];
  const nextCommissions = [];
  const nowIso = new Date().toISOString();

  let totalCyclesApplied = 0;
  let totalCappedCycles = 0;
  let totalOverflowCycles = 0;
  let totalGrossCommissionAmount = 0;
  let totalPayoutOffsetAmount = 0;
  let totalNetCommissionAmount = 0;
  let carryForwardEntriesLogged = 0;
  let cycleConsumptionEntriesLogged = 0;
  let inactivityFlushEntriesLogged = 0;

  snapshotRecords.forEach((snapshot, snapshotIndex) => {
    const leftLegBv = Math.max(0, toWholeNumber(snapshot?.leftLegBv, 0));
    const rightLegBv = Math.max(0, toWholeNumber(snapshot?.rightLegBv, 0));
    const cycleLowerBv = CYCLE_RULE_STRONGER_BV;
    const cycleHigherBv = CYCLE_RULE_WEAKER_BV;
    const identityKeys = resolveMetricsIdentityKeys(snapshot);
    const matchedUser = resolveFirstLookupMatch(identityKeys, userIdentityLookup);
    const existingState = existingCutoffStates.find((entry) => doesMetricsRecordBelongToIdentity(entry, identityKeys)) || null;
    const activityState = matchedUser
      ? resolveMemberActivityStateByPersonalBv(matchedUser)
      : null;
    const isEarningEligible = isMemberActiveForServerCutoff(activityState);
    const existingBaselineLeftLegBv = Math.min(
      leftLegBv,
      Math.max(0, toWholeNumber(existingState?.baselineLeftLegBv, 0)),
    );
    const existingBaselineRightLegBv = Math.min(
      rightLegBv,
      Math.max(0, toWholeNumber(existingState?.baselineRightLegBv, 0)),
    );
    const currentWeekLeftLegBv = Math.max(0, leftLegBv - existingBaselineLeftLegBv);
    const currentWeekRightLegBv = Math.max(0, rightLegBv - existingBaselineRightLegBv);
    const cycleComputation = resolveBinaryCycleComputation({
      leftVolume: currentWeekLeftLegBv,
      rightVolume: currentWeekRightLegBv,
      strongLegCycleBv: cycleLowerBv,
      weakLegCycleBv: cycleHigherBv,
    });
    const totalCycles = isEarningEligible ? cycleComputation.cycleCount : 0;

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

  normalizedUsers.forEach((user, index) => {
    const identityKeys = resolveMetricsIdentityKeys({
      userId: user?.id,
      username: user?.username,
      email: user?.email,
    });

    const matchedSnapshot = nextSnapshots.find((entry) => doesMetricsRecordBelongToIdentity(entry, identityKeys)) || null;
    const existingState = existingCutoffStates.find((entry) => doesMetricsRecordBelongToIdentity(entry, identityKeys)) || null;
    const activityState = resolveMemberActivityStateByPersonalBv(user);
    const isActiveAtCutoff = isMemberActiveForServerCutoff(activityState);
    const nextCarryForwardBaselines = resolveNextCutoffCarryForwardBaselines(
      matchedSnapshot,
      existingState,
      { isActiveAtCutoff },
    );
    const auditIdentity = normalizeText(
      user?.username
      || user?.email
      || user?.id
      || matchedSnapshot?.username
      || matchedSnapshot?.email
      || matchedSnapshot?.userId
      || `member_${index + 1}`,
    );

    if (nextCarryForwardBaselines.wasFlushedForInactivity) {
      inactivityFlushEntriesLogged += 1;
      console.info(`[force-server-cutoff] BV flushed due to inactivity (${auditIdentity})`, {
        activeAtCutoff: isActiveAtCutoff,
        currentWeekLeftLegBv: nextCarryForwardBaselines.currentWeekLeftLegBv,
        currentWeekRightLegBv: nextCarryForwardBaselines.currentWeekRightLegBv,
      });
    } else {
      if (nextCarryForwardBaselines.cyclesToApply > 0) {
        cycleConsumptionEntriesLogged += 1;
        console.info(`[force-server-cutoff] BV consumed for cycle payout (${auditIdentity})`, {
          activeAtCutoff: isActiveAtCutoff,
          cyclesToApply: nextCarryForwardBaselines.cyclesToApply,
          strongLegSide: nextCarryForwardBaselines.strongLegSide,
          consumedLeftLegBv: nextCarryForwardBaselines.consumedLeftLegBv,
          consumedRightLegBv: nextCarryForwardBaselines.consumedRightLegBv,
        });
      }
      if (nextCarryForwardBaselines.carryForwardLeftLegBv > 0 || nextCarryForwardBaselines.carryForwardRightLegBv > 0) {
        carryForwardEntriesLogged += 1;
        console.info(`[force-server-cutoff] BV carried forward (${auditIdentity})`, {
          activeAtCutoff: isActiveAtCutoff,
          carryForwardLeftLegBv: nextCarryForwardBaselines.carryForwardLeftLegBv,
          carryForwardRightLegBv: nextCarryForwardBaselines.carryForwardRightLegBv,
        });
      }
    }

    const nextState = {
      ...(existingState || {}),
      id: existingState?.id || `member_cutoff_state_${Date.now()}_${index + 1}`,
      userId: normalizeText(existingState?.userId || user?.id || matchedSnapshot?.userId),
      username: normalizeText(existingState?.username || user?.username || matchedSnapshot?.username),
      email: normalizeText(existingState?.email || user?.email || matchedSnapshot?.email),
      baselineLeftLegBv: nextCarryForwardBaselines.baselineLeftLegBv,
      baselineRightLegBv: nextCarryForwardBaselines.baselineRightLegBv,
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
    memberServerCutoffStatesTargeted: normalizedUsers.length,
    memberServerCutoffStatesUpdated,
    totalCyclesApplied,
    totalCappedCycles,
    totalOverflowCycles,
    totalGrossCommissionAmount,
    totalPayoutOffsetAmount,
    totalNetCommissionAmount,
    carryForwardEntriesLogged,
    cycleConsumptionEntriesLogged,
    inactivityFlushEntriesLogged,
  };

  const historyEntry = {
    id: `force_cutoff_${Date.now()}`,
    forcedAt: nowIso,
    forcedBy: normalizeText(payload.updatedBy || payload.forcedBy || 'admin'),
    applied: appliedSummary,
  };

  const nextHistory = [historyEntry, ...(Array.isArray(existingHistory) ? existingHistory : [])];

  // Writes are ordered to avoid deadlocks across related snapshot/state tables.
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
