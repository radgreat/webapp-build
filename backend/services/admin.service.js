import { readRegisteredMembersStore, writeRegisteredMembersStore } from '../stores/member.store.js';
import { readMockUsersStore, writeMockUsersStore } from '../stores/user.store.js';
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

const RUNTIME_SETTINGS_TABLE_NAME = 'runtime_settings';
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
  memberTitleCatalog: 'member_title_catalog',
  preferredAttributionClaims: 'preferred_attribution_claims',
  preferredAttributionLocks: 'preferred_account_attribution_locks',
  ewalletAccounts: 'ewallet_accounts',
  ewalletPeerTransfers: 'ewallet_peer_transfers',
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

function resolveNextCutoffCarryForwardBaselines(snapshot, existingState) {
  if (!snapshot || typeof snapshot !== 'object') {
    return {
      baselineLeftLegBv: 0,
      baselineRightLegBv: 0,
    };
  }

  const totalLeftLegBv = Math.max(0, toWholeNumber(snapshot?.leftLegBv, 0));
  const totalRightLegBv = Math.max(0, toWholeNumber(snapshot?.rightLegBv, 0));
  const cycleLowerBv = Math.max(1, toWholeNumber(snapshot?.cycleLowerBv, 500));
  const cycleHigherBv = Math.max(cycleLowerBv, toWholeNumber(snapshot?.cycleHigherBv, 1000));

  const existingBaselineLeftLegBv = Math.min(
    totalLeftLegBv,
    Math.max(0, toWholeNumber(existingState?.baselineLeftLegBv, 0))
  );
  const existingBaselineRightLegBv = Math.min(
    totalRightLegBv,
    Math.max(0, toWholeNumber(existingState?.baselineRightLegBv, 0))
  );

  const currentWeekLeftLegBv = Math.max(0, totalLeftLegBv - existingBaselineLeftLegBv);
  const currentWeekRightLegBv = Math.max(0, totalRightLegBv - existingBaselineRightLegBv);
  const lowerLegCurrentWeekBv = Math.min(currentWeekLeftLegBv, currentWeekRightLegBv);
  const higherLegCurrentWeekBv = Math.max(currentWeekLeftLegBv, currentWeekRightLegBv);
  const lowerLegSide = currentWeekLeftLegBv <= currentWeekRightLegBv ? 'left' : 'right';

  const cyclesToApply = Math.max(0, Math.floor(Math.min(
    lowerLegCurrentWeekBv / cycleHigherBv,
    higherLegCurrentWeekBv / cycleLowerBv,
  )));

  // Dynamic rule: weaker leg consumes the higher threshold; stronger leg consumes the lower threshold.
  const lowerLegConsumedBv = Math.min(lowerLegCurrentWeekBv, cyclesToApply * cycleHigherBv);
  const higherLegConsumedBv = Math.min(higherLegCurrentWeekBv, cyclesToApply * cycleLowerBv);
  const consumedLeftLegBv = lowerLegSide === 'left' ? lowerLegConsumedBv : higherLegConsumedBv;
  const consumedRightLegBv = lowerLegSide === 'right' ? lowerLegConsumedBv : higherLegConsumedBv;

  return {
    baselineLeftLegBv: Math.min(totalLeftLegBv, existingBaselineLeftLegBv + consumedLeftLegBv),
    baselineRightLegBv: Math.min(totalRightLegBv, existingBaselineRightLegBv + consumedRightLegBv),
  };
}

export async function resetAllMockData(payload = {}) {
  const clearedBy = normalizeText(payload.updatedBy || payload.clearedBy || 'admin');
  const cleared = Object.keys(FLUSH_TRUNCATE_TABLES_BY_KEY).reduce((accumulator, key) => {
    accumulator[key] = 0;
    return accumulator;
  }, {
    runtimeSettings: 0,
  });
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

    const runtimeSettingsExists = await doesChargeTableExist(client, RUNTIME_SETTINGS_TABLE_NAME);
    if (runtimeSettingsExists) {
      await client.query(`
        ALTER TABLE charge.runtime_settings
          ADD COLUMN IF NOT EXISTS dashboard_mockup_mode_enabled boolean NOT NULL DEFAULT FALSE,
          ADD COLUMN IF NOT EXISTS tier_claim_mock_mode_enabled boolean NOT NULL DEFAULT FALSE,
          ADD COLUMN IF NOT EXISTS legal_terms_of_service TEXT,
          ADD COLUMN IF NOT EXISTS legal_agreement TEXT,
          ADD COLUMN IF NOT EXISTS legal_shipping_policy TEXT,
          ADD COLUMN IF NOT EXISTS legal_refund_policy TEXT,
          ADD COLUMN IF NOT EXISTS unattributed_free_account_fallback_sponsor_username TEXT,
          ADD COLUMN IF NOT EXISTS updated_by TEXT,
          ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT NOW()
      `);

      cleared.runtimeSettings = await countRowsInChargeTable(client, RUNTIME_SETTINGS_TABLE_NAME);

      await client.query(`
        DELETE FROM charge.runtime_settings
        WHERE id <> 1
      `);

      await client.query(`
        INSERT INTO charge.runtime_settings (
          id,
          dashboard_mockup_mode_enabled,
          tier_claim_mock_mode_enabled,
          legal_terms_of_service,
          legal_agreement,
          legal_shipping_policy,
          legal_refund_policy,
          unattributed_free_account_fallback_sponsor_username,
          updated_by,
          updated_at
        )
        VALUES (1, FALSE, FALSE, '', '', '', '', '', $1, NOW())
        ON CONFLICT (id)
        DO UPDATE
        SET
          dashboard_mockup_mode_enabled = EXCLUDED.dashboard_mockup_mode_enabled,
          tier_claim_mock_mode_enabled = EXCLUDED.tier_claim_mock_mode_enabled,
          legal_terms_of_service = EXCLUDED.legal_terms_of_service,
          legal_agreement = EXCLUDED.legal_agreement,
          legal_shipping_policy = EXCLUDED.legal_shipping_policy,
          legal_refund_policy = EXCLUDED.legal_refund_policy,
          unattributed_free_account_fallback_sponsor_username = EXCLUDED.unattributed_free_account_fallback_sponsor_username,
          updated_by = EXCLUDED.updated_by,
          updated_at = NOW()
      `, [clearedBy]);
    } else {
      missingTables.push(RUNTIME_SETTINGS_TABLE_NAME);
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
    const identityKeys = resolveMetricsIdentityKeys(snapshot);
    const matchedUser = resolveFirstLookupMatch(identityKeys, userIdentityLookup);
    const activityState = matchedUser
      ? resolveMemberActivityStateByPersonalBv(matchedUser)
      : null;
    const isEarningEligible = activityState
      ? activityState.isActive === true
      : true;
    const weakerLegBv = Math.min(leftLegBv, rightLegBv);
    const strongerLegBv = Math.max(leftLegBv, rightLegBv);
    const computedCycles = Math.floor(Math.min(
      weakerLegBv / cycleHigherBv,
      strongerLegBv / cycleLowerBv,
    ));
    const totalCycles = isEarningEligible ? computedCycles : 0;

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

  nextUsers.forEach((user, index) => {
    const identityKeys = resolveMetricsIdentityKeys({
      userId: user?.id,
      username: user?.username,
      email: user?.email,
    });

    const matchedSnapshot = nextSnapshots.find((entry) => doesMetricsRecordBelongToIdentity(entry, identityKeys)) || null;
    const existingState = existingCutoffStates.find((entry) => doesMetricsRecordBelongToIdentity(entry, identityKeys)) || null;
    const nextCarryForwardBaselines = resolveNextCutoffCarryForwardBaselines(matchedSnapshot, existingState);

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
