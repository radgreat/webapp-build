import { randomUUID, createHash } from 'crypto';
import pool from '../db/db.js';
import {
  warmRegisteredMembersStoreSchema,
  readRegisteredMembersStore,
  upsertRegisteredMemberRecord,
} from '../stores/member.store.js';
import {
  ensureWalletTables,
  upsertWalletAccount,
  lockWalletAccountsByUserIds,
  updateWalletAccountBalanceByUserId,
} from '../stores/wallet.store.js';
import {
  findUserById,
  findUserByIdentifier,
} from '../stores/user.store.js';
import {
  buildAccountUpgradeRequiredResult,
  isPendingOrReservationMember,
} from '../utils/member-capability.helpers.js';

const MAX_BUSINESS_CENTER_COUNT = 3;
const NODE_TYPE_MAIN_CENTER = 'main_center';
const NODE_TYPE_BUSINESS_CENTER = 'business_center';
const NODE_TYPE_STAFF_ADMIN = 'staff_admin';
const NODE_TYPE_LEGACY_PLACEHOLDER = 'legacy_placeholder';

const ACTIVATION_STATUS_ACTIVE = 'active';
const ACTIVATION_STATUS_INACTIVE = 'inactive';
const ACTIVATION_STATUS_DEPRECATED = 'deprecated';
const ACTIVATION_STATUS_FROZEN = 'frozen';

const PLACEMENT_SIDE_LEFT = 'left';
const PLACEMENT_SIDE_RIGHT = 'right';

const COMMISSION_SOURCE_TYPE_MAIN = 'main_center';
const COMMISSION_SOURCE_TYPE_BUSINESS = 'business_center';
const LEDGER_DIRECTION_CREDIT = 'credit';
const LEDGER_REFERENCE_TYPE_BUSINESS_CENTER_COMMISSION = 'business_center_commission';

const DEFAULT_UNLOCK_RULES = Object.freeze([
  Object.freeze({ businessCenterIndex: 1, requiredTier: 3, centerLabel: 'Business Center #1' }),
  Object.freeze({ businessCenterIndex: 2, requiredTier: 4, centerLabel: 'Business Center #2' }),
  Object.freeze({ businessCenterIndex: 3, requiredTier: 5, centerLabel: 'Business Center #3' }),
]);

let businessCenterSchemaReady = false;
let businessCenterSchemaPromise = null;

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeCredential(value) {
  return normalizeText(value).toLowerCase();
}

function toWholeNumber(value, fallback = 0) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return Math.max(0, Math.floor(Number(fallback) || 0));
  }
  return Math.max(0, Math.floor(parsed));
}

function roundCurrencyAmount(value, fallback = 0) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return Math.max(0, Math.round((Number(fallback) || 0) * 100) / 100);
  }
  return Math.max(0, Math.round(parsed * 100) / 100);
}

function parseSortableTimestamp(value) {
  const parsed = Date.parse(normalizeText(value));
  return Number.isFinite(parsed) ? parsed : 0;
}

function toIsoStringOrEmpty(value) {
  if (!value) {
    return '';
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString();
}

function normalizeBusinessCenterNodeType(value) {
  const normalized = normalizeCredential(value);
  if (normalized === NODE_TYPE_BUSINESS_CENTER || normalized === 'business-center') {
    return NODE_TYPE_BUSINESS_CENTER;
  }
  if (normalized === NODE_TYPE_STAFF_ADMIN || normalized === 'staff-admin') {
    return NODE_TYPE_STAFF_ADMIN;
  }
  if (
    normalized === NODE_TYPE_LEGACY_PLACEHOLDER
    || normalized === 'legacy-placeholder'
    || normalized === 'placeholder'
  ) {
    return NODE_TYPE_LEGACY_PLACEHOLDER;
  }
  return NODE_TYPE_MAIN_CENTER;
}

function normalizeActivationStatus(value) {
  const normalized = normalizeCredential(value);
  if (normalized === ACTIVATION_STATUS_INACTIVE) {
    return ACTIVATION_STATUS_INACTIVE;
  }
  if (normalized === ACTIVATION_STATUS_DEPRECATED) {
    return ACTIVATION_STATUS_DEPRECATED;
  }
  if (normalized === ACTIVATION_STATUS_FROZEN) {
    return ACTIVATION_STATUS_FROZEN;
  }
  return ACTIVATION_STATUS_ACTIVE;
}

function normalizePlacementSide(value) {
  const normalized = normalizeCredential(value);
  if (normalized === PLACEMENT_SIDE_RIGHT) {
    return PLACEMENT_SIDE_RIGHT;
  }
  if (normalized === PLACEMENT_SIDE_LEFT) {
    return PLACEMENT_SIDE_LEFT;
  }
  return '';
}

function normalizeCommissionSourceCenterType(value, centerIndex = 0) {
  const normalized = normalizeCredential(value);
  if (normalized === COMMISSION_SOURCE_TYPE_BUSINESS || normalized === 'business-center') {
    return COMMISSION_SOURCE_TYPE_BUSINESS;
  }
  if (normalized === COMMISSION_SOURCE_TYPE_MAIN || normalized === 'main-center') {
    return COMMISSION_SOURCE_TYPE_MAIN;
  }
  return toWholeNumber(centerIndex, 0) > 0
    ? COMMISSION_SOURCE_TYPE_BUSINESS
    : COMMISSION_SOURCE_TYPE_MAIN;
}

function normalizeCommissionType(value, fallback = 'sales_team_cycle') {
  const normalized = normalizeCredential(value)
    .replace(/[^a-z0-9_:-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
  return normalized || normalizeCredential(fallback) || 'sales_team_cycle';
}

function normalizeIdempotencyKey(value) {
  const normalized = normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9:_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return normalized.slice(0, 160);
}

function createRecordId(prefix) {
  return `${normalizeText(prefix) || 'rec'}_${Date.now()}_${randomUUID().slice(0, 8)}`;
}

function hashDedupKey(input) {
  return createHash('sha256').update(String(input || '')).digest('hex');
}

function resolveBusinessCenterLabel(index, fallbackLabel = '') {
  const safeIndex = toWholeNumber(index, 0);
  if (safeIndex <= 0) {
    return 'Main Center';
  }
  if (safeIndex <= MAX_BUSINESS_CENTER_COUNT) {
    return `Business Center #${safeIndex}`;
  }
  const fallback = normalizeText(fallbackLabel);
  return fallback || `Legacy Center #${safeIndex}`;
}

function resolveQueryExecutor(candidateExecutor) {
  return candidateExecutor && typeof candidateExecutor.query === 'function'
    ? candidateExecutor
    : pool;
}

function resolveAuthenticatedIdentity(memberInput = {}) {
  return {
    userId: normalizeText(memberInput?.id || memberInput?.userId),
    username: normalizeText(memberInput?.username),
    email: normalizeText(memberInput?.email),
  };
}

async function resolveAuthenticatedUserByIdentity(identity = {}) {
  const userId = normalizeText(identity?.userId);
  if (userId) {
    const matchedById = await findUserById(userId);
    if (matchedById) {
      return matchedById;
    }
  }

  const username = normalizeText(identity?.username);
  if (username) {
    const matchedByUsername = await findUserByIdentifier(username);
    if (matchedByUsername) {
      return matchedByUsername;
    }
  }

  const email = normalizeText(identity?.email);
  if (email) {
    const matchedByEmail = await findUserByIdentifier(email);
    if (matchedByEmail) {
      return matchedByEmail;
    }
  }

  return null;
}

async function resolvePendingAccountRestrictionForMember(memberInput = {}) {
  const authenticatedIdentity = resolveAuthenticatedIdentity(memberInput);
  if (
    !authenticatedIdentity.userId
    && !authenticatedIdentity.username
    && !authenticatedIdentity.email
  ) {
    return null;
  }

  const authenticatedUser = await resolveAuthenticatedUserByIdentity(authenticatedIdentity);
  if (!authenticatedUser) {
    return null;
  }

  if (isPendingOrReservationMember(authenticatedUser)) {
    return buildAccountUpgradeRequiredResult();
  }

  return null;
}

function doesMemberMatchIdentity(member = {}, identity = {}) {
  const identityUserId = normalizeText(identity?.userId);
  const identityUsername = normalizeCredential(identity?.username);
  const identityEmail = normalizeCredential(identity?.email);

  const memberUserId = normalizeText(member?.userId || member?.id);
  const memberUsername = normalizeCredential(member?.memberUsername || member?.username);
  const memberEmail = normalizeCredential(member?.email);

  return Boolean(
    (identityUserId && identityUserId === memberUserId)
    || (identityUsername && identityUsername === memberUsername)
    || (identityEmail && identityEmail === memberEmail)
  );
}

function doesMemberMatchOwner(member = {}, ownerIdentity = {}) {
  const ownerUserId = normalizeText(ownerIdentity?.userId);
  const ownerUsername = normalizeCredential(ownerIdentity?.username);
  const ownerEmail = normalizeCredential(ownerIdentity?.email);

  if (!ownerUserId && !ownerUsername && !ownerEmail) {
    return false;
  }

  const memberOwnerUserId = normalizeText(member?.businessCenterOwnerUserId || member?.userId);
  const memberOwnerUsername = normalizeCredential(
    member?.businessCenterOwnerUsername
    || member?.memberUsername
    || member?.username,
  );
  const memberOwnerEmail = normalizeCredential(member?.businessCenterOwnerEmail || member?.email);

  return Boolean(
    (ownerUserId && memberOwnerUserId && ownerUserId === memberOwnerUserId)
    || (ownerUsername && memberOwnerUsername && ownerUsername === memberOwnerUsername)
    || (ownerEmail && memberOwnerEmail && ownerEmail === memberOwnerEmail)
  );
}

function resolveOwnerIdentityFromPrimary(primaryMember = {}, authenticatedIdentity = {}) {
  return {
    userId: normalizeText(
      primaryMember?.businessCenterOwnerUserId
      || primaryMember?.userId
      || authenticatedIdentity?.userId,
    ),
    username: normalizeText(
      primaryMember?.businessCenterOwnerUsername
      || authenticatedIdentity?.username
      || primaryMember?.memberUsername,
    ),
    email: normalizeText(
      primaryMember?.businessCenterOwnerEmail
      || authenticatedIdentity?.email
      || primaryMember?.email,
    ),
    fullName: normalizeText(primaryMember?.fullName),
  };
}

function compareOwnedMemberEntryForPrimary(leftEntry = {}, rightEntry = {}) {
  const leftMember = leftEntry?.member || {};
  const rightMember = rightEntry?.member || {};

  const leftMainPriority = (
    normalizeBusinessCenterNodeType(leftMember?.businessCenterNodeType) === NODE_TYPE_MAIN_CENTER
    && toWholeNumber(leftMember?.businessCenterIndex, 0) === 0
  ) ? 1 : 0;
  const rightMainPriority = (
    normalizeBusinessCenterNodeType(rightMember?.businessCenterNodeType) === NODE_TYPE_MAIN_CENTER
    && toWholeNumber(rightMember?.businessCenterIndex, 0) === 0
  ) ? 1 : 0;

  if (leftMainPriority !== rightMainPriority) {
    return rightMainPriority - leftMainPriority;
  }

  const createdAtDiff = parseSortableTimestamp(rightMember?.createdAt) - parseSortableTimestamp(leftMember?.createdAt);
  if (createdAtDiff !== 0) {
    return createdAtDiff;
  }

  return Number(leftEntry?.index || 0) - Number(rightEntry?.index || 0);
}

function resolvePrimaryMemberEntryForIdentity(members = [], authenticatedIdentity = {}) {
  const matchingEntries = (Array.isArray(members) ? members : [])
    .map((member, index) => ({ member, index }))
    .filter(({ member }) => doesMemberMatchIdentity(member, authenticatedIdentity));

  if (!matchingEntries.length) {
    return null;
  }

  const usernameKey = normalizeCredential(authenticatedIdentity?.username);
  if (usernameKey) {
    const strictMainEntry = matchingEntries.find(({ member }) => {
      return (
        normalizeBusinessCenterNodeType(member?.businessCenterNodeType) === NODE_TYPE_MAIN_CENTER
        && normalizeCredential(member?.memberUsername) === usernameKey
      );
    });
    if (strictMainEntry) {
      return strictMainEntry;
    }
  }

  const sortedEntries = matchingEntries.slice().sort(compareOwnedMemberEntryForPrimary);
  return sortedEntries[0] || null;
}

function collectOwnedMemberEntries(members = [], ownerIdentity = {}, authenticatedIdentity = {}, primaryEntry = null) {
  const ownedEntries = [];
  const seenIndexes = new Set();

  (Array.isArray(members) ? members : []).forEach((member, index) => {
    if (doesMemberMatchOwner(member, ownerIdentity) || doesMemberMatchIdentity(member, authenticatedIdentity)) {
      ownedEntries.push({ member, index });
      seenIndexes.add(index);
    }
  });

  if (primaryEntry && Number.isFinite(primaryEntry.index) && !seenIndexes.has(primaryEntry.index)) {
    ownedEntries.unshift(primaryEntry);
  }

  return ownedEntries;
}

function sortCenterEntry(leftEntry = {}, rightEntry = {}) {
  const leftMember = leftEntry?.member || {};
  const rightMember = rightEntry?.member || {};
  const leftIndex = toWholeNumber(leftMember?.businessCenterIndex, 0);
  const rightIndex = toWholeNumber(rightMember?.businessCenterIndex, 0);

  if (leftIndex !== rightIndex) {
    return leftIndex - rightIndex;
  }

  const leftActivated = parseSortableTimestamp(leftMember?.businessCenterActivatedAt || leftMember?.createdAt);
  const rightActivated = parseSortableTimestamp(rightMember?.businessCenterActivatedAt || rightMember?.createdAt);
  if (leftActivated !== rightActivated) {
    return leftActivated - rightActivated;
  }

  return Number(leftEntry?.index || 0) - Number(rightEntry?.index || 0);
}

function isActiveBusinessCenterEntry(entry = {}) {
  const member = entry?.member || {};
  const nodeType = normalizeBusinessCenterNodeType(member?.businessCenterNodeType);
  const activationStatus = normalizeActivationStatus(member?.activationStatus);
  const centerIndex = toWholeNumber(member?.businessCenterIndex, 0);

  return (
    nodeType === NODE_TYPE_BUSINESS_CENTER
    && centerIndex > 0
    && centerIndex <= MAX_BUSINESS_CENTER_COUNT
    && activationStatus === ACTIVATION_STATUS_ACTIVE
  );
}

function resolveOwnerBusinessCenterContext(members = [], authenticatedIdentity = {}) {
  const primaryEntry = resolvePrimaryMemberEntryForIdentity(members, authenticatedIdentity);
  if (!primaryEntry) {
    return {
      success: false,
      status: 404,
      error: 'Registered member record was not found for this account.',
    };
  }

  const ownerIdentity = resolveOwnerIdentityFromPrimary(primaryEntry.member, authenticatedIdentity);
  const ownedMemberEntries = collectOwnedMemberEntries(
    members,
    ownerIdentity,
    authenticatedIdentity,
    primaryEntry,
  );

  if (!ownedMemberEntries.length) {
    return {
      success: false,
      status: 404,
      error: 'No Business Center nodes were found for this account owner.',
    };
  }

  const sortedOwnedEntries = ownedMemberEntries.slice().sort(sortCenterEntry);

  const mainCenterEntry = sortedOwnedEntries.find((entry) => {
    const nodeType = normalizeBusinessCenterNodeType(entry?.member?.businessCenterNodeType);
    const centerIndex = toWholeNumber(entry?.member?.businessCenterIndex, 0);
    return nodeType === NODE_TYPE_MAIN_CENTER && centerIndex === 0;
  }) || primaryEntry;

  const isStaffTreeAccount = Boolean(
    mainCenterEntry?.member?.isStaffTreeAccount
    || sortedOwnedEntries.some((entry) => {
      const nodeType = normalizeBusinessCenterNodeType(entry?.member?.businessCenterNodeType);
      return Boolean(entry?.member?.isStaffTreeAccount) || nodeType === NODE_TYPE_STAFF_ADMIN;
    })
  );

  const activeBusinessCenterEntries = sortedOwnedEntries.filter(isActiveBusinessCenterEntry);
  const legacyPlaceholderEntries = sortedOwnedEntries.filter((entry) => {
    const nodeType = normalizeBusinessCenterNodeType(entry?.member?.businessCenterNodeType);
    return nodeType === NODE_TYPE_LEGACY_PLACEHOLDER;
  });

  return {
    success: true,
    members: Array.isArray(members) ? members : [],
    authenticatedIdentity,
    ownerIdentity,
    primaryEntry,
    mainCenterEntry,
    ownedMemberEntries: sortedOwnedEntries,
    activeBusinessCenterEntries,
    legacyPlaceholderEntries,
    isStaffTreeAccount,
  };
}

async function resolveOwnerIdentityAgainstUserStore(ownerIdentity = {}, options = {}) {
  const executor = resolveQueryExecutor(options?.client);

  const ownerUserId = normalizeText(ownerIdentity?.userId);
  let matchedUser = null;
  if (ownerUserId) {
    matchedUser = await findUserById(ownerUserId, { client: executor });
  }

  if (!matchedUser) {
    const username = normalizeText(ownerIdentity?.username);
    if (username) {
      matchedUser = await findUserByIdentifier(username, { client: executor });
    }
  }

  if (!matchedUser) {
    const email = normalizeText(ownerIdentity?.email);
    if (email) {
      matchedUser = await findUserByIdentifier(email, { client: executor });
    }
  }

  return {
    userId: normalizeText(matchedUser?.id || ownerIdentity?.userId),
    username: normalizeText(matchedUser?.username || ownerIdentity?.username),
    email: normalizeText(matchedUser?.email || ownerIdentity?.email),
    fullName: normalizeText(matchedUser?.name || ownerIdentity?.fullName),
  };
}

function mapUnlockRuleRow(row = {}) {
  const businessCenterIndex = Math.max(1, Math.min(
    MAX_BUSINESS_CENTER_COUNT,
    toWholeNumber(row?.business_center_index ?? row?.businessCenterIndex, 1),
  ));

  return {
    id: normalizeText(row?.id) || `bc_unlock_rule_${businessCenterIndex}`,
    businessCenterIndex,
    requiredTier: Math.max(1, toWholeNumber(row?.required_tier ?? row?.requiredTier, businessCenterIndex + 2)),
    centerLabel: normalizeText(row?.center_label ?? row?.centerLabel) || resolveBusinessCenterLabel(businessCenterIndex),
    isActive: row?.is_active !== false,
    createdAt: toIsoStringOrEmpty(row?.created_at || row?.createdAt),
    updatedAt: toIsoStringOrEmpty(row?.updated_at || row?.updatedAt),
  };
}

async function readBusinessCenterUnlockRules(executor = pool) {
  await ensureBusinessCenterRedesignTables();
  const result = await executor.query(`
    SELECT
      id,
      business_center_index,
      required_tier,
      center_label,
      is_active,
      created_at,
      updated_at
    FROM charge.business_center_unlock_rules
    WHERE is_active = TRUE
    ORDER BY business_center_index ASC
  `);

  const rules = result.rows.map(mapUnlockRuleRow)
    .filter((rule) => rule.businessCenterIndex >= 1 && rule.businessCenterIndex <= MAX_BUSINESS_CENTER_COUNT);

  if (rules.length > 0) {
    return rules;
  }

  return DEFAULT_UNLOCK_RULES.map((rule, index) => ({
    id: `default_unlock_rule_${index + 1}`,
    businessCenterIndex: rule.businessCenterIndex,
    requiredTier: rule.requiredTier,
    centerLabel: rule.centerLabel,
    isActive: true,
    createdAt: '',
    updatedAt: '',
  }));
}

function normalizeProgressPayload(existingProgress = {}) {
  return {
    ownerUserId: normalizeText(existingProgress?.ownerUserId || existingProgress?.owner_user_id),
    ownerUsername: normalizeText(existingProgress?.ownerUsername || existingProgress?.owner_username),
    ownerEmail: normalizeText(existingProgress?.ownerEmail || existingProgress?.owner_email),
    completedLegacyTierCount: toWholeNumber(
      existingProgress?.completedLegacyTierCount ?? existingProgress?.completed_legacy_tier_count,
      0,
    ),
    unlockedCount: Math.min(MAX_BUSINESS_CENTER_COUNT, toWholeNumber(
      existingProgress?.unlockedCount ?? existingProgress?.unlocked_count,
      0,
    )),
    activatedCount: Math.min(MAX_BUSINESS_CENTER_COUNT, toWholeNumber(
      existingProgress?.activatedCount ?? existingProgress?.activated_count,
      0,
    )),
    pendingCount: Math.min(MAX_BUSINESS_CENTER_COUNT, toWholeNumber(
      existingProgress?.pendingCount ?? existingProgress?.pending_count,
      0,
    )),
    sourceQualificationTier: toWholeNumber(
      existingProgress?.sourceQualificationTier ?? existingProgress?.source_qualification_tier,
      0,
    ),
    unlockedCenterIndexes: Array.isArray(existingProgress?.unlockedCenterIndexes)
      ? existingProgress.unlockedCenterIndexes.map((value) => toWholeNumber(value, 0)).filter((value) => value > 0)
      : [],
    activatedCenterIndexes: Array.isArray(existingProgress?.activatedCenterIndexes)
      ? existingProgress.activatedCenterIndexes.map((value) => toWholeNumber(value, 0)).filter((value) => value > 0)
      : [],
    pendingCenterIndexes: Array.isArray(existingProgress?.pendingCenterIndexes)
      ? existingProgress.pendingCenterIndexes.map((value) => toWholeNumber(value, 0)).filter((value) => value > 0)
      : [],
    overflowPending: toWholeNumber(existingProgress?.overflowPending ?? existingProgress?.overflow_pending, 0),
    isAtCap: Boolean(existingProgress?.isAtCap),
    updatedAt: toIsoStringOrEmpty(existingProgress?.updatedAt || existingProgress?.updated_at),
    lastSyncedAt: toIsoStringOrEmpty(existingProgress?.lastSyncedAt || existingProgress?.last_synced_at),
    createdAt: toIsoStringOrEmpty(existingProgress?.createdAt || existingProgress?.created_at),
  };
}

async function readOwnerProgressRecord(ownerUserIdInput, executor = pool) {
  await ensureBusinessCenterRedesignTables();

  const ownerUserId = normalizeText(ownerUserIdInput);
  if (!ownerUserId) {
    return null;
  }

  const result = await executor.query(`
    SELECT
      owner_user_id,
      owner_username,
      owner_email,
      completed_legacy_tier_count,
      unlocked_count,
      activated_count,
      pending_count,
      source_qualification_tier,
      unlocked_center_indexes,
      activated_center_indexes,
      pending_center_indexes,
      overflow_pending,
      created_at,
      updated_at,
      last_synced_at
    FROM charge.business_center_owner_progress
    WHERE owner_user_id = $1
    LIMIT 1
  `, [ownerUserId]);

  return result.rows[0] ? normalizeProgressPayload(result.rows[0]) : null;
}

async function upsertOwnerProgressRecord(progressPayload = {}, executor = pool) {
  await ensureBusinessCenterRedesignTables();

  const normalizedProgress = normalizeProgressPayload(progressPayload);
  const ownerUserId = normalizeText(normalizedProgress.ownerUserId);
  if (!ownerUserId) {
    return normalizedProgress;
  }

  const result = await executor.query(`
    INSERT INTO charge.business_center_owner_progress (
      owner_user_id,
      owner_username,
      owner_email,
      completed_legacy_tier_count,
      unlocked_count,
      activated_count,
      pending_count,
      source_qualification_tier,
      unlocked_center_indexes,
      activated_center_indexes,
      pending_center_indexes,
      overflow_pending,
      updated_at,
      last_synced_at
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::integer[],$10::integer[],$11::integer[],$12,NOW(),NOW())
    ON CONFLICT (owner_user_id)
    DO UPDATE SET
      owner_username = CASE
        WHEN EXCLUDED.owner_username <> '' THEN EXCLUDED.owner_username
        ELSE charge.business_center_owner_progress.owner_username
      END,
      owner_email = CASE
        WHEN EXCLUDED.owner_email <> '' THEN EXCLUDED.owner_email
        ELSE charge.business_center_owner_progress.owner_email
      END,
      completed_legacy_tier_count = EXCLUDED.completed_legacy_tier_count,
      unlocked_count = EXCLUDED.unlocked_count,
      activated_count = EXCLUDED.activated_count,
      pending_count = EXCLUDED.pending_count,
      source_qualification_tier = EXCLUDED.source_qualification_tier,
      unlocked_center_indexes = EXCLUDED.unlocked_center_indexes,
      activated_center_indexes = EXCLUDED.activated_center_indexes,
      pending_center_indexes = EXCLUDED.pending_center_indexes,
      overflow_pending = EXCLUDED.overflow_pending,
      updated_at = NOW(),
      last_synced_at = NOW()
    RETURNING
      owner_user_id,
      owner_username,
      owner_email,
      completed_legacy_tier_count,
      unlocked_count,
      activated_count,
      pending_count,
      source_qualification_tier,
      unlocked_center_indexes,
      activated_center_indexes,
      pending_center_indexes,
      overflow_pending,
      created_at,
      updated_at,
      last_synced_at
  `, [
    ownerUserId,
    normalizeText(normalizedProgress.ownerUsername),
    normalizeText(normalizedProgress.ownerEmail),
    toWholeNumber(normalizedProgress.completedLegacyTierCount, 0),
    Math.min(MAX_BUSINESS_CENTER_COUNT, toWholeNumber(normalizedProgress.unlockedCount, 0)),
    Math.min(MAX_BUSINESS_CENTER_COUNT, toWholeNumber(normalizedProgress.activatedCount, 0)),
    Math.min(MAX_BUSINESS_CENTER_COUNT, toWholeNumber(normalizedProgress.pendingCount, 0)),
    toWholeNumber(normalizedProgress.sourceQualificationTier, 0),
    normalizedProgress.unlockedCenterIndexes,
    normalizedProgress.activatedCenterIndexes,
    normalizedProgress.pendingCenterIndexes,
    toWholeNumber(normalizedProgress.overflowPending, 0),
  ]);

  return normalizeProgressPayload(result.rows[0] || normalizedProgress);
}

function mapRuleByCenterIndex(unlockRules = []) {
  const ruleByIndex = new Map();
  (Array.isArray(unlockRules) ? unlockRules : []).forEach((rule) => {
    const centerIndex = toWholeNumber(rule?.businessCenterIndex, 0);
    if (centerIndex > 0 && centerIndex <= MAX_BUSINESS_CENTER_COUNT && !ruleByIndex.has(centerIndex)) {
      ruleByIndex.set(centerIndex, {
        businessCenterIndex: centerIndex,
        requiredTier: Math.max(1, toWholeNumber(rule?.requiredTier, centerIndex + 2)),
        centerLabel: normalizeText(rule?.centerLabel) || resolveBusinessCenterLabel(centerIndex),
      });
    }
  });
  return ruleByIndex;
}

function buildProgressFromContext(context = {}, unlockRules = [], options = {}) {
  const existingProgress = normalizeProgressPayload(options?.existingProgress || {});
  const ruleByIndex = mapRuleByCenterIndex(unlockRules);

  const memberTierCounts = (Array.isArray(context?.ownedMemberEntries) ? context.ownedMemberEntries : [])
    .map((entry) => toWholeNumber(entry?.member?.legacyLeadershipCompletedTierCount, 0));
  const highestMemberTierCount = memberTierCounts.length
    ? Math.max(...memberTierCounts)
    : 0;

  const baselineTierCount = Math.max(
    highestMemberTierCount,
    toWholeNumber(context?.mainCenterEntry?.member?.legacyLeadershipCompletedTierCount, 0),
    toWholeNumber(existingProgress.completedLegacyTierCount, 0),
  );

  const overrideTierCountRaw = Number(options?.completedLegacyTierCountOverride);
  const hasTierOverride = Number.isFinite(overrideTierCountRaw) && overrideTierCountRaw >= 0;
  const preserveHigherCompletedTierCount = options?.preserveHigherCompletedTierCount !== false;

  const completedLegacyTierCount = hasTierOverride
    ? (
      preserveHigherCompletedTierCount
        ? Math.max(baselineTierCount, Math.floor(overrideTierCountRaw))
        : Math.floor(overrideTierCountRaw)
    )
    : baselineTierCount;

  const unlockedCenterIndexesFromRules = (Array.isArray(unlockRules) ? unlockRules : [])
    .filter((rule) => completedLegacyTierCount >= Math.max(1, toWholeNumber(rule?.requiredTier, 0)))
    .map((rule) => toWholeNumber(rule?.businessCenterIndex, 0))
    .filter((index) => index > 0 && index <= MAX_BUSINESS_CENTER_COUNT)
    .sort((left, right) => left - right);

  const activatedCenterIndexSet = new Set();
  (Array.isArray(context?.activeBusinessCenterEntries) ? context.activeBusinessCenterEntries : []).forEach((entry) => {
    const centerIndex = toWholeNumber(entry?.member?.businessCenterIndex, 0);
    if (centerIndex > 0 && centerIndex <= MAX_BUSINESS_CENTER_COUNT) {
      activatedCenterIndexSet.add(centerIndex);
    }
  });

  const unlockedCenterIndexSet = new Set(unlockedCenterIndexesFromRules);
  activatedCenterIndexSet.forEach((centerIndex) => unlockedCenterIndexSet.add(centerIndex));

  const unlockedCenterIndexes = Array.from(unlockedCenterIndexSet.values())
    .filter((value) => value > 0 && value <= MAX_BUSINESS_CENTER_COUNT)
    .sort((left, right) => left - right)
    .slice(0, MAX_BUSINESS_CENTER_COUNT);
  const activatedCenterIndexes = Array.from(activatedCenterIndexSet.values())
    .filter((value) => value > 0 && value <= MAX_BUSINESS_CENTER_COUNT)
    .sort((left, right) => left - right)
    .slice(0, MAX_BUSINESS_CENTER_COUNT);
  const pendingCenterIndexes = unlockedCenterIndexes
    .filter((centerIndex) => !activatedCenterIndexSet.has(centerIndex));

  const sourceQualificationTier = unlockedCenterIndexes
    .reduce((highestTier, centerIndex) => {
      const rule = ruleByIndex.get(centerIndex);
      return Math.max(highestTier, toWholeNumber(rule?.requiredTier, 0));
    }, 0);

  const unlockedCount = unlockedCenterIndexes.length;
  const activatedCount = activatedCenterIndexes.length;
  const pendingCount = pendingCenterIndexes.length;
  const overflowPending = Math.max(0, unlockedCenterIndexesFromRules.length - MAX_BUSINESS_CENTER_COUNT);

  return normalizeProgressPayload({
    ownerUserId: normalizeText(context?.ownerIdentity?.userId),
    ownerUsername: normalizeText(context?.ownerIdentity?.username),
    ownerEmail: normalizeText(context?.ownerIdentity?.email),
    completedLegacyTierCount,
    unlockedCount,
    activatedCount,
    pendingCount,
    sourceQualificationTier,
    unlockedCenterIndexes,
    activatedCenterIndexes,
    pendingCenterIndexes,
    overflowPending,
    isAtCap: activatedCount >= MAX_BUSINESS_CENTER_COUNT,
  });
}

function hasBusinessCenterTrackingDiff(currentMember = {}, nextMember = {}) {
  const compareKeys = [
    'businessCenterOwnerUserId',
    'businessCenterOwnerUsername',
    'businessCenterOwnerEmail',
    'businessCenterNodeType',
    'businessCenterIndex',
    'businessCenterLabel',
    'businessCenterActivatedAt',
    'businessCenterPinnedSide',
    'isEarningEligible',
    'activationStatus',
    'sourceQualificationTier',
    'legacyLeadershipCompletedTierCount',
    'businessCentersEarnedLifetime',
    'businessCentersActivated',
    'businessCentersPending',
    'businessCentersOverflowPending',
    'businessCentersCount',
  ];

  return compareKeys.some((key) => {
    const leftValue = currentMember?.[key];
    const rightValue = nextMember?.[key];

    if (typeof leftValue === 'number' || typeof rightValue === 'number') {
      return Number(leftValue || 0) !== Number(rightValue || 0);
    }

    if (typeof leftValue === 'boolean' || typeof rightValue === 'boolean') {
      return Boolean(leftValue) !== Boolean(rightValue);
    }

    return normalizeText(leftValue) !== normalizeText(rightValue);
  });
}

function sanitizeOwnedMemberForBackfill(entry = {}, context = {}, unlockRules = []) {
  const member = entry?.member || {};
  const isStaffTreeAccount = Boolean(context?.isStaffTreeAccount || member?.isStaffTreeAccount);
  const centerIndexRaw = toWholeNumber(member?.businessCenterIndex, 0);
  let centerIndex = centerIndexRaw;

  const ruleByCenterIndex = mapRuleByCenterIndex(unlockRules);
  const existingNodeType = normalizeBusinessCenterNodeType(member?.businessCenterNodeType);
  let nodeType = existingNodeType;

  if (isStaffTreeAccount) {
    centerIndex = 0;
    nodeType = NODE_TYPE_STAFF_ADMIN;
  } else if (centerIndex <= 0) {
    centerIndex = 0;
    nodeType = NODE_TYPE_MAIN_CENTER;
  } else if (centerIndex <= MAX_BUSINESS_CENTER_COUNT) {
    nodeType = NODE_TYPE_BUSINESS_CENTER;
  } else {
    nodeType = NODE_TYPE_LEGACY_PLACEHOLDER;
  }

  let activationStatus = normalizeActivationStatus(member?.activationStatus);
  if (nodeType === NODE_TYPE_MAIN_CENTER || nodeType === NODE_TYPE_STAFF_ADMIN || nodeType === NODE_TYPE_BUSINESS_CENTER) {
    activationStatus = ACTIVATION_STATUS_ACTIVE;
  }
  if (nodeType === NODE_TYPE_LEGACY_PLACEHOLDER || centerIndex > MAX_BUSINESS_CENTER_COUNT) {
    activationStatus = ACTIVATION_STATUS_DEPRECATED;
  }

  const rule = ruleByCenterIndex.get(centerIndex);
  const sourceQualificationTier = Math.max(
    toWholeNumber(member?.sourceQualificationTier, 0),
    toWholeNumber(rule?.requiredTier, 0),
  );

  return {
    ...member,
    businessCenterOwnerUserId: normalizeText(context?.ownerIdentity?.userId) || normalizeText(member?.businessCenterOwnerUserId || member?.userId) || null,
    businessCenterOwnerUsername: normalizeText(context?.ownerIdentity?.username) || normalizeText(member?.businessCenterOwnerUsername || member?.memberUsername),
    businessCenterOwnerEmail: normalizeText(context?.ownerIdentity?.email) || normalizeText(member?.businessCenterOwnerEmail || member?.email),
    businessCenterNodeType: nodeType,
    businessCenterIndex: centerIndex,
    businessCenterLabel: resolveBusinessCenterLabel(centerIndex, member?.businessCenterLabel || rule?.centerLabel),
    businessCenterActivatedAt: (
      centerIndex > 0
        ? (normalizeText(member?.businessCenterActivatedAt) || normalizeText(member?.createdAt))
        : ''
    ),
    businessCenterPinnedSide: (
      centerIndex > 0
        ? normalizePlacementSide(member?.businessCenterPinnedSide || member?.placementLeg)
        : ''
    ),
    isEarningEligible: (
      !isStaffTreeAccount
      && nodeType !== NODE_TYPE_LEGACY_PLACEHOLDER
      && activationStatus === ACTIVATION_STATUS_ACTIVE
    ),
    activationStatus,
    sourceQualificationTier,
  };
}

async function applyOwnerBackfillUpdates(context = {}, unlockRules = [], executor = pool) {
  const ownedEntries = Array.isArray(context?.ownedMemberEntries)
    ? context.ownedMemberEntries.slice().sort(sortCenterEntry)
    : [];
  if (!ownedEntries.length) {
    return { changed: false, updatedCount: 0 };
  }

  const retainedCenterIndexes = new Set();
  const updates = [];

  for (const entry of ownedEntries) {
    const nextMember = sanitizeOwnedMemberForBackfill(entry, context, unlockRules);
    const centerIndex = toWholeNumber(nextMember?.businessCenterIndex, 0);
    const nodeType = normalizeBusinessCenterNodeType(nextMember?.businessCenterNodeType);

    if (centerIndex > 0 && centerIndex <= MAX_BUSINESS_CENTER_COUNT && nodeType === NODE_TYPE_BUSINESS_CENTER) {
      if (retainedCenterIndexes.has(centerIndex)) {
        nextMember.businessCenterNodeType = NODE_TYPE_LEGACY_PLACEHOLDER;
        nextMember.activationStatus = ACTIVATION_STATUS_DEPRECATED;
        nextMember.isEarningEligible = false;
      } else {
        retainedCenterIndexes.add(centerIndex);
      }
    }

    if (hasBusinessCenterTrackingDiff(entry.member, nextMember)) {
      updates.push(nextMember);
    }
  }

  if (!updates.length) {
    return {
      changed: false,
      updatedCount: 0,
    };
  }

  for (const updatedMember of updates) {
    await upsertRegisteredMemberRecord(updatedMember, { client: executor });
  }

  return {
    changed: true,
    updatedCount: updates.length,
  };
}

function createTrackingUpdatedMember(member = {}, context = {}, progress = {}, unlockRules = []) {
  const isStaffTreeAccount = Boolean(context?.isStaffTreeAccount || member?.isStaffTreeAccount);
  const centerIndex = toWholeNumber(member?.businessCenterIndex, 0);
  const nodeTypeNormalized = normalizeBusinessCenterNodeType(member?.businessCenterNodeType);
  const ruleByCenterIndex = mapRuleByCenterIndex(unlockRules);
  const unlockRule = ruleByCenterIndex.get(centerIndex);

  let nextNodeType = nodeTypeNormalized;
  if (isStaffTreeAccount) {
    nextNodeType = NODE_TYPE_STAFF_ADMIN;
  } else if (centerIndex <= 0) {
    nextNodeType = NODE_TYPE_MAIN_CENTER;
  } else if (centerIndex <= MAX_BUSINESS_CENTER_COUNT) {
    nextNodeType = NODE_TYPE_BUSINESS_CENTER;
  } else {
    nextNodeType = NODE_TYPE_LEGACY_PLACEHOLDER;
  }

  let nextActivationStatus = normalizeActivationStatus(member?.activationStatus);
  if (nextNodeType === NODE_TYPE_MAIN_CENTER || nextNodeType === NODE_TYPE_STAFF_ADMIN || nextNodeType === NODE_TYPE_BUSINESS_CENTER) {
    nextActivationStatus = ACTIVATION_STATUS_ACTIVE;
  }
  if (nextNodeType === NODE_TYPE_LEGACY_PLACEHOLDER || centerIndex > MAX_BUSINESS_CENTER_COUNT) {
    nextActivationStatus = ACTIVATION_STATUS_DEPRECATED;
  }

  const nextIsEarningEligible = (
    !isStaffTreeAccount
    && nextNodeType !== NODE_TYPE_LEGACY_PLACEHOLDER
    && nextActivationStatus === ACTIVATION_STATUS_ACTIVE
  );

  const nextSourceQualificationTier = (centerIndex > 0 && centerIndex <= MAX_BUSINESS_CENTER_COUNT)
    ? Math.max(
      toWholeNumber(member?.sourceQualificationTier, 0),
      toWholeNumber(unlockRule?.requiredTier, 0),
    )
    : toWholeNumber(progress?.sourceQualificationTier, toWholeNumber(member?.sourceQualificationTier, 0));

  return {
    ...member,
    businessCenterOwnerUserId: normalizeText(context?.ownerIdentity?.userId) || normalizeText(member?.businessCenterOwnerUserId || member?.userId) || null,
    businessCenterOwnerUsername: normalizeText(context?.ownerIdentity?.username) || normalizeText(member?.businessCenterOwnerUsername || member?.memberUsername),
    businessCenterOwnerEmail: normalizeText(context?.ownerIdentity?.email) || normalizeText(member?.businessCenterOwnerEmail || member?.email),
    businessCenterNodeType: nextNodeType,
    businessCenterIndex: centerIndex,
    businessCenterLabel: resolveBusinessCenterLabel(centerIndex, member?.businessCenterLabel || unlockRule?.centerLabel),
    businessCenterActivatedAt: (
      centerIndex > 0
        ? (normalizeText(member?.businessCenterActivatedAt) || normalizeText(member?.createdAt))
        : ''
    ),
    businessCenterPinnedSide: (
      centerIndex > 0
        ? normalizePlacementSide(member?.businessCenterPinnedSide || member?.placementLeg)
        : ''
    ),
    isEarningEligible: nextIsEarningEligible,
    activationStatus: nextActivationStatus,
    sourceQualificationTier: nextSourceQualificationTier,
    legacyLeadershipCompletedTierCount: toWholeNumber(progress?.completedLegacyTierCount, member?.legacyLeadershipCompletedTierCount),
    businessCentersEarnedLifetime: toWholeNumber(progress?.unlockedCount, member?.businessCentersEarnedLifetime),
    businessCentersActivated: toWholeNumber(progress?.activatedCount, member?.businessCentersActivated),
    businessCentersPending: toWholeNumber(progress?.pendingCount, member?.businessCentersPending),
    businessCentersOverflowPending: toWholeNumber(progress?.overflowPending, member?.businessCentersOverflowPending),
    businessCentersCount: toWholeNumber(progress?.activatedCount, member?.businessCentersCount),
  };
}

async function applyOwnerTrackingUpdates(context = {}, progress = {}, unlockRules = [], executor = pool) {
  const ownedEntries = Array.isArray(context?.ownedMemberEntries)
    ? context.ownedMemberEntries
    : [];

  const updates = [];
  for (const entry of ownedEntries) {
    const nextMember = createTrackingUpdatedMember(entry.member, context, progress, unlockRules);
    if (hasBusinessCenterTrackingDiff(entry.member, nextMember)) {
      updates.push(nextMember);
    }
  }

  if (!updates.length) {
    return {
      changed: false,
      updatedCount: 0,
    };
  }

  for (const member of updates) {
    await upsertRegisteredMemberRecord(member, { client: executor });
  }

  return {
    changed: true,
    updatedCount: updates.length,
  };
}

function createUniqueBusinessCenterUsername(baseUsernameInput = '', businessCenterIndex = 1, members = []) {
  const baseUsername = normalizeCredential(baseUsernameInput)
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    || 'member';

  const takenUsernames = new Set(
    (Array.isArray(members) ? members : [])
      .map((member) => normalizeCredential(member?.memberUsername || member?.username))
      .filter(Boolean),
  );

  const seed = `${baseUsername}-bc-${Math.max(1, toWholeNumber(businessCenterIndex, 1))}`;
  let candidate = seed;
  let suffix = 2;

  while (takenUsernames.has(candidate)) {
    candidate = `${seed}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

async function patchDirectSponsorReferencesToDemotedNode({
  demotedUsername,
  demotedLabel,
  activeUsername,
  demotedNodeId,
  executor,
}) {
  const client = resolveQueryExecutor(executor);
  const safeDemotedUsername = normalizeText(demotedUsername);
  const safeDemotedLabel = normalizeText(demotedLabel);
  const safeActiveUsername = normalizeText(activeUsername);
  const safeDemotedNodeId = normalizeText(demotedNodeId);

  if (!safeDemotedUsername || !safeActiveUsername || !safeDemotedNodeId) {
    return;
  }

  await client.query(`
    UPDATE charge.registered_members
    SET
      sponsor_username = $1,
      sponsor_name = CASE
        WHEN $2 <> '' THEN $2
        ELSE sponsor_name
      END,
      updated_at = NOW()
    WHERE LOWER(BTRIM(COALESCE(sponsor_username, ''))) = LOWER($3)
      AND id <> $4
  `, [
    safeDemotedUsername,
    safeDemotedLabel,
    safeActiveUsername,
    safeDemotedNodeId,
  ]);

  await client.query(`
    UPDATE charge.registered_members
    SET
      spillover_parent_reference = $1,
      updated_at = NOW()
    WHERE LOWER(BTRIM(COALESCE(spillover_parent_reference, ''))) = LOWER($2)
      AND id <> $3
  `, [
    safeDemotedUsername,
    safeActiveUsername,
    safeDemotedNodeId,
  ]);
}

function resolveOwnerLockIdentity(ownerIdentity = {}, fallbackIdentity = {}) {
  const ownerUserId = normalizeText(ownerIdentity?.userId || fallbackIdentity?.userId);
  if (ownerUserId) {
    return `bc-owner:${ownerUserId}`;
  }

  const ownerUsername = normalizeCredential(ownerIdentity?.username || fallbackIdentity?.username);
  if (ownerUsername) {
    return `bc-owner-u:${ownerUsername}`;
  }

  const ownerEmail = normalizeCredential(ownerIdentity?.email || fallbackIdentity?.email);
  if (ownerEmail) {
    return `bc-owner-e:${ownerEmail}`;
  }

  return '';
}

async function acquireOwnerAdvisoryLock(ownerIdentity = {}, fallbackIdentity = {}, executor = pool) {
  const client = resolveQueryExecutor(executor);
  const lockIdentity = resolveOwnerLockIdentity(ownerIdentity, fallbackIdentity);
  if (!lockIdentity) {
    return;
  }

  await client.query(`
    SELECT pg_advisory_xact_lock(hashtext($1))
  `, [lockIdentity]);
}

function mapBusinessCenterNodeForResponse(member = {}) {
  const nodeType = normalizeBusinessCenterNodeType(member?.businessCenterNodeType);
  const centerIndex = toWholeNumber(member?.businessCenterIndex, 0);

  return {
    id: normalizeText(member?.id),
    userId: normalizeText(member?.userId),
    ownerUserId: normalizeText(member?.businessCenterOwnerUserId || member?.userId),
    fullName: normalizeText(member?.fullName),
    memberUsername: normalizeText(member?.memberUsername),
    sponsorUsername: normalizeText(member?.sponsorUsername),
    sponsorName: normalizeText(member?.sponsorName),
    placementLeg: normalizeText(member?.placementLeg),
    businessCenterNodeType: nodeType,
    businessCenterIndex: centerIndex,
    businessCenterLabel: resolveBusinessCenterLabel(centerIndex, member?.businessCenterLabel),
    businessCenterPinnedSide: normalizeText(member?.businessCenterPinnedSide),
    businessCenterActivatedAt: normalizeText(member?.businessCenterActivatedAt),
    activationStatus: normalizeActivationStatus(member?.activationStatus),
    isEarningEligible: Boolean(member?.isEarningEligible),
    sourceQualificationTier: toWholeNumber(member?.sourceQualificationTier, 0),
    createdAt: normalizeText(member?.createdAt),
    updatedAt: normalizeText(member?.updatedAt),
  };
}

function buildBusinessCenterStatusPayload(state = {}) {
  const context = state?.context || {};
  const progress = normalizeProgressPayload(state?.progress || {});
  const unlockRules = Array.isArray(state?.unlockRules) ? state.unlockRules : [];

  const ownerIdentity = context?.ownerIdentity || {};
  const mainCenterNode = context?.mainCenterEntry?.member || null;
  const centerNodes = (Array.isArray(context?.ownedMemberEntries) ? context.ownedMemberEntries : [])
    .slice()
    .sort(sortCenterEntry)
    .map((entry) => mapBusinessCenterNodeForResponse(entry.member));

  const placeholders = centerNodes.filter((node) => node.businessCenterNodeType === NODE_TYPE_LEGACY_PLACEHOLDER);
  const isStaffTreeAccount = Boolean(context?.isStaffTreeAccount);

  const unlockRulePayload = unlockRules
    .map((rule) => ({
      businessCenterIndex: toWholeNumber(rule?.businessCenterIndex, 0),
      requiredTier: toWholeNumber(rule?.requiredTier, 0),
      centerLabel: normalizeText(rule?.centerLabel) || resolveBusinessCenterLabel(rule?.businessCenterIndex),
    }))
    .filter((rule) => rule.businessCenterIndex >= 1 && rule.businessCenterIndex <= MAX_BUSINESS_CENTER_COUNT)
    .sort((left, right) => left.businessCenterIndex - right.businessCenterIndex);

  const nextUnlockRule = unlockRulePayload.find((rule) => !progress.unlockedCenterIndexes.includes(rule.businessCenterIndex)) || null;

  return {
    success: true,
    owner: {
      userId: normalizeText(ownerIdentity?.userId),
      username: normalizeText(ownerIdentity?.username),
      email: normalizeText(ownerIdentity?.email),
      fullName: normalizeText(ownerIdentity?.fullName || mainCenterNode?.fullName),
    },
    activeNode: mapBusinessCenterNodeForResponse(mainCenterNode || {}),
    centers: centerNodes,
    placeholders,
    businessCenters: {
      cap: MAX_BUSINESS_CENTER_COUNT,
      maxCenters: MAX_BUSINESS_CENTER_COUNT,
      completedLegacyTierCount: toWholeNumber(progress.completedLegacyTierCount, 0),
      earnedLifetime: toWholeNumber(progress.unlockedCount, 0),
      unlockedCount: toWholeNumber(progress.unlockedCount, 0),
      activated: toWholeNumber(progress.activatedCount, 0),
      activatedCount: toWholeNumber(progress.activatedCount, 0),
      activatablePending: toWholeNumber(progress.pendingCount, 0),
      pendingCount: toWholeNumber(progress.pendingCount, 0),
      pendingTotal: toWholeNumber(progress.pendingCount, 0),
      pendingCenterIndexes: progress.pendingCenterIndexes,
      unlockedCenterIndexes: progress.unlockedCenterIndexes,
      activatedCenterIndexes: progress.activatedCenterIndexes,
      overflowPending: toWholeNumber(progress.overflowPending, 0),
      sourceQualificationTier: toWholeNumber(progress.sourceQualificationTier, 0),
      count: toWholeNumber(progress.activatedCount, 0),
      isAtCap: toWholeNumber(progress.activatedCount, 0) >= MAX_BUSINESS_CENTER_COUNT,
      isStaffTreeAccount,
      unlockRules: unlockRulePayload,
      nextUnlockTier: nextUnlockRule?.requiredTier || null,
      nextBusinessCenterIndex: nextUnlockRule?.businessCenterIndex || null,
    },
  };
}

async function resolveAndSyncOwnerBusinessCenterState(memberInput = {}, options = {}) {
  await ensureBusinessCenterRedesignTables();

  const executor = resolveQueryExecutor(options?.client);
  const authenticatedIdentity = resolveAuthenticatedIdentity(memberInput);
  if (!authenticatedIdentity.userId && !authenticatedIdentity.username && !authenticatedIdentity.email) {
    return {
      success: false,
      status: 400,
      error: 'Authenticated member identity is required.',
    };
  }

  let members = await readRegisteredMembersStore({ client: executor });
  let context = resolveOwnerBusinessCenterContext(members, authenticatedIdentity);
  if (!context.success) {
    return context;
  }

  const canonicalOwnerIdentity = await resolveOwnerIdentityAgainstUserStore(context.ownerIdentity, {
    client: executor,
  });
  context = {
    ...context,
    ownerIdentity: canonicalOwnerIdentity,
  };

  const unlockRules = await readBusinessCenterUnlockRules(executor);

  const backfillResult = await applyOwnerBackfillUpdates(context, unlockRules, executor);
  if (backfillResult.changed) {
    members = await readRegisteredMembersStore({ client: executor });
    context = resolveOwnerBusinessCenterContext(members, authenticatedIdentity);
    if (!context.success) {
      return context;
    }

    context = {
      ...context,
      ownerIdentity: canonicalOwnerIdentity,
    };
  }

  const existingProgress = await readOwnerProgressRecord(canonicalOwnerIdentity.userId, executor);
  const progress = buildProgressFromContext(context, unlockRules, {
    existingProgress,
    completedLegacyTierCountOverride: options?.completedLegacyTierCount,
    preserveHigherCompletedTierCount: options?.preserveHigherCompletedTierCount !== false,
  });

  const persistedProgress = await upsertOwnerProgressRecord({
    ...progress,
    ownerUserId: canonicalOwnerIdentity.userId,
    ownerUsername: canonicalOwnerIdentity.username,
    ownerEmail: canonicalOwnerIdentity.email,
  }, executor);

  const trackingResult = await applyOwnerTrackingUpdates(context, persistedProgress, unlockRules, executor);
  if (trackingResult.changed) {
    members = await readRegisteredMembersStore({ client: executor });
    context = resolveOwnerBusinessCenterContext(members, authenticatedIdentity);
    if (!context.success) {
      return context;
    }

    context = {
      ...context,
      ownerIdentity: canonicalOwnerIdentity,
    };
  }

  const finalProgress = buildProgressFromContext(context, unlockRules, {
    existingProgress: persistedProgress,
    completedLegacyTierCountOverride: persistedProgress.completedLegacyTierCount,
    preserveHigherCompletedTierCount: true,
  });

  const finalPersistedProgress = await upsertOwnerProgressRecord({
    ...finalProgress,
    ownerUserId: canonicalOwnerIdentity.userId,
    ownerUsername: canonicalOwnerIdentity.username,
    ownerEmail: canonicalOwnerIdentity.email,
  }, executor);

  return {
    success: true,
    status: 200,
    authenticatedIdentity,
    members,
    context,
    unlockRules,
    progress: finalPersistedProgress,
    changed: backfillResult.changed || trackingResult.changed,
  };
}

function mapCommissionEventRow(row = {}) {
  return {
    id: normalizeText(row?.id),
    eventDedupKey: normalizeText(row?.event_dedup_key),
    ownerUserId: normalizeText(row?.owner_user_id),
    ownerUsername: normalizeText(row?.owner_username),
    ownerEmail: normalizeText(row?.owner_email),
    sourceNodeId: normalizeText(row?.source_node_id),
    sourceCenterType: normalizeCommissionSourceCenterType(row?.source_center_type, row?.source_center_index),
    sourceCenterIndex: toWholeNumber(row?.source_center_index, 0),
    sourceCenterLabel: normalizeText(row?.source_center_label) || resolveBusinessCenterLabel(row?.source_center_index),
    commissionType: normalizeCommissionType(row?.commission_type, 'sales_team_cycle'),
    amount: roundCurrencyAmount(row?.amount, 0),
    currencyCode: normalizeText(row?.currency_code || 'USD').toUpperCase() || 'USD',
    cycleCount: toWholeNumber(row?.cycle_count, 0),
    leftVolumeUsed: toWholeNumber(row?.left_volume_used, 0),
    rightVolumeUsed: toWholeNumber(row?.right_volume_used, 0),
    metadata: row?.metadata && typeof row.metadata === 'object' ? row.metadata : {},
    createdAt: toIsoStringOrEmpty(row?.created_at),
  };
}

function mapWalletLedgerEntryRow(row = {}) {
  return {
    id: normalizeText(row?.id),
    ownerUserId: normalizeText(row?.owner_user_id),
    ownerUsername: normalizeText(row?.owner_username),
    ownerEmail: normalizeText(row?.owner_email),
    entryDirection: normalizeText(row?.entry_direction),
    amount: roundCurrencyAmount(row?.amount, 0),
    currencyCode: normalizeText(row?.currency_code || 'USD').toUpperCase() || 'USD',
    balanceBefore: roundCurrencyAmount(row?.balance_before, 0),
    balanceAfter: roundCurrencyAmount(row?.balance_after, 0),
    referenceType: normalizeText(row?.reference_type),
    referenceId: normalizeText(row?.reference_id),
    sourceNodeId: normalizeText(row?.source_node_id),
    sourceCenterType: normalizeCommissionSourceCenterType(row?.source_center_type, row?.source_center_index),
    sourceCenterIndex: toWholeNumber(row?.source_center_index, 0),
    sourceCenterLabel: normalizeText(row?.source_center_label) || resolveBusinessCenterLabel(row?.source_center_index),
    commissionType: normalizeCommissionType(row?.commission_type, 'sales_team_cycle'),
    metadata: row?.metadata && typeof row.metadata === 'object' ? row.metadata : {},
    createdAt: toIsoStringOrEmpty(row?.created_at),
  };
}

async function readCommissionEventByDedupKey(eventDedupKeyInput, executor = pool) {
  await ensureBusinessCenterRedesignTables();

  const eventDedupKey = normalizeText(eventDedupKeyInput);
  if (!eventDedupKey) {
    return null;
  }

  const result = await executor.query(`
    SELECT
      id,
      event_dedup_key,
      owner_user_id,
      owner_username,
      owner_email,
      source_node_id,
      source_center_type,
      source_center_index,
      source_center_label,
      commission_type,
      amount,
      currency_code,
      cycle_count,
      left_volume_used,
      right_volume_used,
      metadata,
      created_at
    FROM charge.business_center_commission_events
    WHERE event_dedup_key = $1
    LIMIT 1
  `, [eventDedupKey]);

  if (!result.rows[0]) {
    return null;
  }

  return mapCommissionEventRow(result.rows[0]);
}

async function insertCommissionEventRow(payload = {}, executor = pool) {
  await ensureBusinessCenterRedesignTables();

  const eventDedupKey = normalizeText(payload?.eventDedupKey);
  if (!eventDedupKey) {
    return null;
  }

  const eventId = normalizeText(payload?.id) || createRecordId('bc_event');
  const sourceCenterIndex = Math.max(0, Math.min(MAX_BUSINESS_CENTER_COUNT, toWholeNumber(payload?.sourceCenterIndex, 0)));
  const sourceCenterType = normalizeCommissionSourceCenterType(payload?.sourceCenterType, sourceCenterIndex);

  const result = await executor.query(`
    INSERT INTO charge.business_center_commission_events (
      id,
      event_dedup_key,
      owner_user_id,
      owner_username,
      owner_email,
      source_node_id,
      source_center_type,
      source_center_index,
      source_center_label,
      commission_type,
      amount,
      currency_code,
      cycle_count,
      left_volume_used,
      right_volume_used,
      metadata,
      created_at
    )
    VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16::jsonb,$17
    )
    RETURNING
      id,
      event_dedup_key,
      owner_user_id,
      owner_username,
      owner_email,
      source_node_id,
      source_center_type,
      source_center_index,
      source_center_label,
      commission_type,
      amount,
      currency_code,
      cycle_count,
      left_volume_used,
      right_volume_used,
      metadata,
      created_at
  `, [
    eventId,
    eventDedupKey,
    normalizeText(payload?.ownerUserId),
    normalizeText(payload?.ownerUsername),
    normalizeText(payload?.ownerEmail),
    normalizeText(payload?.sourceNodeId),
    sourceCenterType,
    sourceCenterIndex,
    normalizeText(payload?.sourceCenterLabel) || resolveBusinessCenterLabel(sourceCenterIndex),
    normalizeCommissionType(payload?.commissionType, 'sales_team_cycle'),
    roundCurrencyAmount(payload?.amount, 0),
    normalizeText(payload?.currencyCode || 'USD').toUpperCase() || 'USD',
    toWholeNumber(payload?.cycleCount, 0),
    toWholeNumber(payload?.leftVolumeUsed, 0),
    toWholeNumber(payload?.rightVolumeUsed, 0),
    JSON.stringify(payload?.metadata && typeof payload.metadata === 'object' ? payload.metadata : {}),
    normalizeText(payload?.createdAt) || new Date().toISOString(),
  ]);

  return mapCommissionEventRow(result.rows[0] || null);
}

async function insertWalletLedgerEntry(payload = {}, executor = pool) {
  await ensureBusinessCenterRedesignTables();

  const ledgerId = normalizeText(payload?.id) || createRecordId('bc_ledger');
  const sourceCenterIndex = Math.max(0, Math.min(MAX_BUSINESS_CENTER_COUNT, toWholeNumber(payload?.sourceCenterIndex, 0)));

  const result = await executor.query(`
    INSERT INTO charge.wallet_ledger_entries (
      id,
      owner_user_id,
      owner_username,
      owner_email,
      entry_direction,
      amount,
      currency_code,
      balance_before,
      balance_after,
      reference_type,
      reference_id,
      source_node_id,
      source_center_type,
      source_center_index,
      source_center_label,
      commission_type,
      metadata,
      created_at
    )
    VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17::jsonb,$18
    )
    RETURNING
      id,
      owner_user_id,
      owner_username,
      owner_email,
      entry_direction,
      amount,
      currency_code,
      balance_before,
      balance_after,
      reference_type,
      reference_id,
      source_node_id,
      source_center_type,
      source_center_index,
      source_center_label,
      commission_type,
      metadata,
      created_at
  `, [
    ledgerId,
    normalizeText(payload?.ownerUserId),
    normalizeText(payload?.ownerUsername),
    normalizeText(payload?.ownerEmail),
    normalizeText(payload?.entryDirection || LEDGER_DIRECTION_CREDIT),
    roundCurrencyAmount(payload?.amount, 0),
    normalizeText(payload?.currencyCode || 'USD').toUpperCase() || 'USD',
    roundCurrencyAmount(payload?.balanceBefore, 0),
    roundCurrencyAmount(payload?.balanceAfter, 0),
    normalizeText(payload?.referenceType || LEDGER_REFERENCE_TYPE_BUSINESS_CENTER_COMMISSION),
    normalizeText(payload?.referenceId),
    normalizeText(payload?.sourceNodeId),
    normalizeCommissionSourceCenterType(payload?.sourceCenterType, sourceCenterIndex),
    sourceCenterIndex,
    normalizeText(payload?.sourceCenterLabel) || resolveBusinessCenterLabel(sourceCenterIndex),
    normalizeCommissionType(payload?.commissionType, 'sales_team_cycle'),
    JSON.stringify(payload?.metadata && typeof payload.metadata === 'object' ? payload.metadata : {}),
    normalizeText(payload?.createdAt) || new Date().toISOString(),
  ]);

  return mapWalletLedgerEntryRow(result.rows[0] || null);
}

async function resolveWalletOwnerProfile(ownerIdentity = {}, executor = pool) {
  const ownerUserId = normalizeText(ownerIdentity?.userId);
  let userRecord = null;

  if (ownerUserId) {
    userRecord = await findUserById(ownerUserId, { client: executor });
  }

  if (!userRecord) {
    const ownerUsername = normalizeText(ownerIdentity?.username);
    if (ownerUsername) {
      userRecord = await findUserByIdentifier(ownerUsername, { client: executor });
    }
  }

  if (!userRecord) {
    const ownerEmail = normalizeText(ownerIdentity?.email);
    if (ownerEmail) {
      userRecord = await findUserByIdentifier(ownerEmail, { client: executor });
    }
  }

  return {
    userId: normalizeText(userRecord?.id || ownerIdentity?.userId),
    username: normalizeText(userRecord?.username || ownerIdentity?.username),
    email: normalizeText(userRecord?.email || ownerIdentity?.email),
    accountName: normalizeText(userRecord?.name || ownerIdentity?.fullName || ownerIdentity?.username),
  };
}

async function creditOwnerWalletFromCommissionEvent(eventPayload = {}, executor = pool) {
  await ensureWalletTables();

  const ownerProfile = await resolveWalletOwnerProfile({
    userId: eventPayload?.ownerUserId,
    username: eventPayload?.ownerUsername,
    email: eventPayload?.ownerEmail,
    fullName: eventPayload?.ownerName,
  }, executor);

  const ownerUserId = normalizeText(ownerProfile.userId || eventPayload?.ownerUserId);
  if (!ownerUserId) {
    throw new Error('Unable to credit owner wallet because owner user id was missing.');
  }

  await upsertWalletAccount({
    userId: ownerUserId,
    username: normalizeText(ownerProfile.username || eventPayload?.ownerUsername),
    email: normalizeText(ownerProfile.email || eventPayload?.ownerEmail),
    accountName: normalizeText(ownerProfile.accountName || eventPayload?.ownerName || ownerProfile.username),
    currencyCode: normalizeText(eventPayload?.currencyCode || 'USD').toUpperCase() || 'USD',
    startingBalance: 0,
  }, executor);

  const lockedAccounts = await lockWalletAccountsByUserIds([ownerUserId], executor);
  const walletAccount = lockedAccounts.find((account) => normalizeText(account?.userId) === ownerUserId);
  if (!walletAccount) {
    throw new Error('Unable to lock owner wallet account for commission credit.');
  }

  const balanceBefore = roundCurrencyAmount(walletAccount?.balance, 0);
  const amount = roundCurrencyAmount(eventPayload?.amount, 0);
  const balanceAfter = roundCurrencyAmount(balanceBefore + amount, balanceBefore);

  const updatedWalletAccount = await updateWalletAccountBalanceByUserId(ownerUserId, balanceAfter, executor);
  if (!updatedWalletAccount) {
    throw new Error('Unable to update owner wallet balance for commission credit.');
  }

  const ledgerEntry = await insertWalletLedgerEntry({
    ownerUserId,
    ownerUsername: ownerProfile.username,
    ownerEmail: ownerProfile.email,
    entryDirection: LEDGER_DIRECTION_CREDIT,
    amount,
    currencyCode: eventPayload?.currencyCode,
    balanceBefore,
    balanceAfter,
    referenceType: LEDGER_REFERENCE_TYPE_BUSINESS_CENTER_COMMISSION,
    referenceId: normalizeText(eventPayload?.eventId),
    sourceNodeId: normalizeText(eventPayload?.sourceNodeId),
    sourceCenterType: normalizeCommissionSourceCenterType(eventPayload?.sourceCenterType, eventPayload?.sourceCenterIndex),
    sourceCenterIndex: toWholeNumber(eventPayload?.sourceCenterIndex, 0),
    sourceCenterLabel: normalizeText(eventPayload?.sourceCenterLabel),
    commissionType: normalizeCommissionType(eventPayload?.commissionType, 'sales_team_cycle'),
    metadata: eventPayload?.metadata,
    createdAt: eventPayload?.createdAt,
  }, executor);

  return {
    wallet: {
      userId: ownerUserId,
      username: normalizeText(ownerProfile.username),
      email: normalizeText(ownerProfile.email),
      balanceBefore,
      balanceAfter,
      currencyCode: normalizeText(eventPayload?.currencyCode || 'USD').toUpperCase() || 'USD',
    },
    ledgerEntry,
  };
}

async function insertCommissionEventAndCreditWallet(payload = {}, options = {}) {
  const executor = resolveQueryExecutor(options?.executor);
  const eventDedupKey = normalizeText(payload?.eventDedupKey);
  if (!eventDedupKey) {
    throw new Error('Commission event dedup key is required.');
  }

  const existingEvent = await readCommissionEventByDedupKey(eventDedupKey, executor);
  if (existingEvent) {
    return {
      idempotent: true,
      event: existingEvent,
      ledgerEntry: null,
      wallet: null,
    };
  }

  const commissionEvent = await insertCommissionEventRow(payload, executor);
  if (!commissionEvent) {
    throw new Error('Unable to insert Business Center commission event.');
  }

  const walletCreditResult = await creditOwnerWalletFromCommissionEvent({
    ...payload,
    eventId: commissionEvent.id,
    ownerUserId: commissionEvent.ownerUserId,
    ownerUsername: commissionEvent.ownerUsername,
    ownerEmail: commissionEvent.ownerEmail,
    sourceNodeId: commissionEvent.sourceNodeId,
    sourceCenterType: commissionEvent.sourceCenterType,
    sourceCenterIndex: commissionEvent.sourceCenterIndex,
    sourceCenterLabel: commissionEvent.sourceCenterLabel,
    commissionType: commissionEvent.commissionType,
    amount: commissionEvent.amount,
    currencyCode: commissionEvent.currencyCode,
    createdAt: commissionEvent.createdAt,
  }, executor);

  return {
    idempotent: false,
    event: commissionEvent,
    ledgerEntry: walletCreditResult.ledgerEntry,
    wallet: walletCreditResult.wallet,
  };
}

function resolveCommissionEventDedupKey(payload = {}) {
  const explicitKey = normalizeIdempotencyKey(
    payload?.eventDedupKey
    || payload?.eventIdempotencyKey
    || payload?.idempotencyKey
    || payload?.requestId,
  );

  if (explicitKey) {
    return explicitKey;
  }

  const ownerUserId = normalizeText(payload?.ownerUserId);
  const sourceNodeId = normalizeText(payload?.sourceNodeId);
  const sourceCenterIndex = toWholeNumber(payload?.sourceCenterIndex, 0);
  const commissionType = normalizeCommissionType(payload?.commissionType, 'sales_team_cycle');
  const amount = roundCurrencyAmount(payload?.amount, 0).toFixed(2);
  const cycleCount = toWholeNumber(payload?.cycleCount, 0);
  const leftVolumeUsed = toWholeNumber(payload?.leftVolumeUsed, 0);
  const rightVolumeUsed = toWholeNumber(payload?.rightVolumeUsed, 0);
  const rawKey = `${ownerUserId}|${sourceNodeId}|${sourceCenterIndex}|${commissionType}|${amount}|${cycleCount}|${leftVolumeUsed}|${rightVolumeUsed}`;
  return hashDedupKey(rawKey);
}

function resolveDateRangeFilters(query = {}) {
  const nowMs = Date.now();
  const defaultLimit = 100;
  const limitRaw = Number(query?.limit);
  const limit = Number.isFinite(limitRaw)
    ? Math.min(500, Math.max(1, Math.floor(limitRaw)))
    : defaultLimit;

  const daysRaw = Number(query?.days);
  const days = Number.isFinite(daysRaw) && daysRaw > 0
    ? Math.min(3650, Math.floor(daysRaw))
    : null;

  const fromCandidate = normalizeText(query?.from || query?.startDate);
  const toCandidate = normalizeText(query?.to || query?.endDate);

  const fromMsParsed = Date.parse(fromCandidate);
  const toMsParsed = Date.parse(toCandidate);

  let fromIso = '';
  let toIso = '';

  if (Number.isFinite(fromMsParsed)) {
    fromIso = new Date(fromMsParsed).toISOString();
  }
  if (Number.isFinite(toMsParsed)) {
    toIso = new Date(toMsParsed).toISOString();
  }

  if (!fromIso && days) {
    fromIso = new Date(nowMs - (days * 24 * 60 * 60 * 1000)).toISOString();
  }

  return {
    limit,
    fromIso,
    toIso,
  };
}

async function listCommissionEventsByOwner(ownerUserIdInput, query = {}, executor = pool) {
  await ensureBusinessCenterRedesignTables();

  const ownerUserId = normalizeText(ownerUserIdInput);
  if (!ownerUserId) {
    return [];
  }

  const filters = resolveDateRangeFilters(query);
  const whereClauses = ['owner_user_id = $1'];
  const values = [ownerUserId];

  if (filters.fromIso) {
    values.push(filters.fromIso);
    whereClauses.push(`created_at >= $${values.length}::timestamptz`);
  }

  if (filters.toIso) {
    values.push(filters.toIso);
    whereClauses.push(`created_at <= $${values.length}::timestamptz`);
  }

  values.push(filters.limit);

  const result = await executor.query(`
    SELECT
      id,
      event_dedup_key,
      owner_user_id,
      owner_username,
      owner_email,
      source_node_id,
      source_center_type,
      source_center_index,
      source_center_label,
      commission_type,
      amount,
      currency_code,
      cycle_count,
      left_volume_used,
      right_volume_used,
      metadata,
      created_at
    FROM charge.business_center_commission_events
    WHERE ${whereClauses.join(' AND ')}
    ORDER BY created_at DESC
    LIMIT $${values.length}
  `, values);

  return result.rows.map(mapCommissionEventRow);
}

async function buildBusinessCenterEarningsSummary(ownerIdentity = {}, query = {}, options = {}) {
  const executor = resolveQueryExecutor(options?.executor);
  const ownerUserId = normalizeText(ownerIdentity?.userId);

  const events = ownerUserId
    ? await listCommissionEventsByOwner(ownerUserId, query, executor)
    : [];

  const centerBreakdownMap = new Map();
  const commissionTypeTotals = {};
  let totalAmount = 0;

  events.forEach((event) => {
    const centerIndex = Math.max(0, Math.min(MAX_BUSINESS_CENTER_COUNT, toWholeNumber(event?.sourceCenterIndex, 0)));
    const centerType = normalizeCommissionSourceCenterType(event?.sourceCenterType, centerIndex);
    const centerLabel = normalizeText(event?.sourceCenterLabel) || resolveBusinessCenterLabel(centerIndex);

    if (!centerBreakdownMap.has(centerIndex)) {
      centerBreakdownMap.set(centerIndex, {
        centerIndex,
        centerType,
        centerLabel,
        eventCount: 0,
        totalAmount: 0,
        commissionTypes: {},
      });
    }

    const centerEntry = centerBreakdownMap.get(centerIndex);
    const amount = roundCurrencyAmount(event?.amount, 0);
    const commissionType = normalizeCommissionType(event?.commissionType, 'sales_team_cycle');

    centerEntry.eventCount += 1;
    centerEntry.totalAmount = roundCurrencyAmount(centerEntry.totalAmount + amount, centerEntry.totalAmount);
    centerEntry.commissionTypes[commissionType] = roundCurrencyAmount(
      Number(centerEntry.commissionTypes[commissionType] || 0) + amount,
      0,
    );

    totalAmount = roundCurrencyAmount(totalAmount + amount, totalAmount);
    commissionTypeTotals[commissionType] = roundCurrencyAmount(
      Number(commissionTypeTotals[commissionType] || 0) + amount,
      0,
    );
  });

  const centers = [];
  centers.push({
    centerIndex: 0,
    centerType: COMMISSION_SOURCE_TYPE_MAIN,
    centerLabel: 'Main Center',
    eventCount: 0,
    totalAmount: 0,
    commissionTypes: {},
  });

  DEFAULT_UNLOCK_RULES.forEach((rule) => {
    centers.push({
      centerIndex: rule.businessCenterIndex,
      centerType: COMMISSION_SOURCE_TYPE_BUSINESS,
      centerLabel: rule.centerLabel,
      eventCount: 0,
      totalAmount: 0,
      commissionTypes: {},
    });
  });

  const mergedCenters = centers.map((baseCenter) => {
    const matchedEntry = centerBreakdownMap.get(baseCenter.centerIndex);
    if (!matchedEntry) {
      return baseCenter;
    }
    return {
      ...baseCenter,
      ...matchedEntry,
    };
  });

  return {
    ownerUserId,
    ownerUsername: normalizeText(ownerIdentity?.username),
    ownerEmail: normalizeText(ownerIdentity?.email),
    totalAmount,
    currencyCode: 'USD',
    eventCount: events.length,
    commissionTypeTotals,
    centers: mergedCenters.sort((left, right) => left.centerIndex - right.centerIndex),
    recentEvents: events,
  };
}

async function buildBusinessCenterWalletSummary(ownerIdentity = {}, query = {}, options = {}) {
  const executor = resolveQueryExecutor(options?.executor);
  const ownerUserId = normalizeText(ownerIdentity?.userId);

  await ensureBusinessCenterRedesignTables();
  await ensureWalletTables();

  const walletOwnerProfile = await resolveWalletOwnerProfile(ownerIdentity, executor);
  const resolvedOwnerUserId = normalizeText(walletOwnerProfile.userId || ownerUserId);

  if (!resolvedOwnerUserId) {
    return {
      ownerUserId: '',
      ownerUsername: normalizeText(ownerIdentity?.username),
      ownerEmail: normalizeText(ownerIdentity?.email),
      wallet: {
        balance: 0,
        currencyCode: 'USD',
      },
      totalCreditedAmount: 0,
      ledgerEntryCount: 0,
      centerBreakdown: [],
      recentLedgerEntries: [],
    };
  }

  const walletAccount = await upsertWalletAccount({
    userId: resolvedOwnerUserId,
    username: normalizeText(walletOwnerProfile.username),
    email: normalizeText(walletOwnerProfile.email),
    accountName: normalizeText(walletOwnerProfile.accountName || walletOwnerProfile.username),
    currencyCode: 'USD',
    startingBalance: 0,
  }, executor);

  const rangeFilters = resolveDateRangeFilters(query);
  const whereClauses = [
    'owner_user_id = $1',
    `entry_direction = '${LEDGER_DIRECTION_CREDIT}'`,
  ];
  const values = [resolvedOwnerUserId];

  if (rangeFilters.fromIso) {
    values.push(rangeFilters.fromIso);
    whereClauses.push(`created_at >= $${values.length}::timestamptz`);
  }

  if (rangeFilters.toIso) {
    values.push(rangeFilters.toIso);
    whereClauses.push(`created_at <= $${values.length}::timestamptz`);
  }

  const totalsResult = await executor.query(`
    SELECT
      COALESCE(SUM(amount), 0) AS total_credited_amount,
      COUNT(*) AS ledger_entry_count
    FROM charge.wallet_ledger_entries
    WHERE ${whereClauses.join(' AND ')}
  `, values);

  const centerBreakdownResult = await executor.query(`
    SELECT
      source_center_index,
      source_center_type,
      source_center_label,
      COALESCE(SUM(amount), 0) AS total_amount,
      COUNT(*) AS entry_count
    FROM charge.wallet_ledger_entries
    WHERE ${whereClauses.join(' AND ')}
    GROUP BY source_center_index, source_center_type, source_center_label
    ORDER BY source_center_index ASC
  `, values);

  const recentLedgerValues = values.slice();
  recentLedgerValues.push(rangeFilters.limit);
  const recentLedgerResult = await executor.query(`
    SELECT
      id,
      owner_user_id,
      owner_username,
      owner_email,
      entry_direction,
      amount,
      currency_code,
      balance_before,
      balance_after,
      reference_type,
      reference_id,
      source_node_id,
      source_center_type,
      source_center_index,
      source_center_label,
      commission_type,
      metadata,
      created_at
    FROM charge.wallet_ledger_entries
    WHERE ${whereClauses.join(' AND ')}
    ORDER BY created_at DESC
    LIMIT $${recentLedgerValues.length}
  `, recentLedgerValues);

  const totalsRow = totalsResult.rows[0] || {};
  const centerBreakdown = centerBreakdownResult.rows.map((row) => ({
    sourceCenterIndex: toWholeNumber(row?.source_center_index, 0),
    sourceCenterType: normalizeCommissionSourceCenterType(row?.source_center_type, row?.source_center_index),
    sourceCenterLabel: normalizeText(row?.source_center_label) || resolveBusinessCenterLabel(row?.source_center_index),
    totalAmount: roundCurrencyAmount(row?.total_amount, 0),
    entryCount: toWholeNumber(row?.entry_count, 0),
  }));

  const recentLedgerEntries = recentLedgerResult.rows.map(mapWalletLedgerEntryRow);

  return {
    ownerUserId: resolvedOwnerUserId,
    ownerUsername: normalizeText(walletOwnerProfile.username),
    ownerEmail: normalizeText(walletOwnerProfile.email),
    wallet: {
      balance: roundCurrencyAmount(walletAccount?.balance, 0),
      currencyCode: normalizeText(walletAccount?.currencyCode || 'USD').toUpperCase() || 'USD',
      updatedAt: toIsoStringOrEmpty(walletAccount?.updatedAt),
    },
    totalCreditedAmount: roundCurrencyAmount(totalsRow?.total_credited_amount, 0),
    ledgerEntryCount: toWholeNumber(totalsRow?.ledger_entry_count, 0),
    centerBreakdown,
    recentLedgerEntries,
  };
}

async function readActivationAuditByIdempotency(ownerUserIdInput, idempotencyKeyInput, executor = pool) {
  await ensureBusinessCenterRedesignTables();

  const ownerUserId = normalizeText(ownerUserIdInput);
  const idempotencyKey = normalizeText(idempotencyKeyInput);
  if (!ownerUserId || !idempotencyKey) {
    return null;
  }

  const result = await executor.query(`
    SELECT
      id,
      owner_user_id,
      owner_username,
      owner_email,
      request_id,
      idempotency_key,
      business_center_index,
      side,
      new_top_node_id,
      demoted_node_id,
      demoted_node_username,
      new_top_username,
      activated_at,
      metadata
    FROM charge.business_center_activation_audit
    WHERE owner_user_id = $1
      AND idempotency_key = $2
    LIMIT 1
  `, [ownerUserId, idempotencyKey]);

  return result.rows[0] || null;
}

async function insertActivationAudit(payload = {}, executor = pool) {
  await ensureBusinessCenterRedesignTables();

  const result = await executor.query(`
    INSERT INTO charge.business_center_activation_audit (
      id,
      owner_user_id,
      owner_username,
      owner_email,
      request_id,
      idempotency_key,
      business_center_index,
      side,
      new_top_node_id,
      demoted_node_id,
      demoted_node_username,
      new_top_username,
      triggered_by_user_id,
      triggered_by_username,
      triggered_by_email,
      activated_at,
      metadata
    )
    VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17::jsonb
    )
    RETURNING id
  `, [
    normalizeText(payload?.id) || createRecordId('bc_activation_audit'),
    normalizeText(payload?.ownerUserId),
    normalizeText(payload?.ownerUsername),
    normalizeText(payload?.ownerEmail),
    normalizeText(payload?.requestId),
    normalizeIdempotencyKey(payload?.idempotencyKey),
    toWholeNumber(payload?.businessCenterIndex, 0),
    normalizePlacementSide(payload?.side),
    normalizeText(payload?.newTopNodeId),
    normalizeText(payload?.demotedNodeId),
    normalizeText(payload?.demotedNodeUsername),
    normalizeText(payload?.newTopUsername),
    normalizeText(payload?.triggeredByUserId),
    normalizeText(payload?.triggeredByUsername),
    normalizeText(payload?.triggeredByEmail),
    normalizeText(payload?.activatedAt) || new Date().toISOString(),
    JSON.stringify(payload?.metadata && typeof payload.metadata === 'object' ? payload.metadata : {}),
  ]);

  return normalizeText(result.rows[0]?.id);
}

function resolveNextPendingBusinessCenterIndex(progress = {}) {
  const pendingCenterIndexes = Array.isArray(progress?.pendingCenterIndexes)
    ? progress.pendingCenterIndexes
      .map((value) => toWholeNumber(value, 0))
      .filter((value) => value > 0 && value <= MAX_BUSINESS_CENTER_COUNT)
      .sort((left, right) => left - right)
    : [];

  return pendingCenterIndexes[0] || 0;
}

export async function listBusinessCentersForMember(memberInput = {}) {
  const stateResult = await resolveAndSyncOwnerBusinessCenterState(memberInput, {
    preserveHigherCompletedTierCount: true,
  });
  if (!stateResult.success) {
    return stateResult;
  }

  const basePayload = buildBusinessCenterStatusPayload(stateResult);

  const earningsSummary = await buildBusinessCenterEarningsSummary(
    stateResult.context?.ownerIdentity,
    {},
    { executor: pool },
  ).catch(() => null);

  const walletSummary = await buildBusinessCenterWalletSummary(
    stateResult.context?.ownerIdentity,
    {},
    { executor: pool },
  ).catch(() => null);

  return {
    success: true,
    status: 200,
    data: {
      ...basePayload,
      ...(earningsSummary ? { earningsSummary } : {}),
      ...(walletSummary ? { walletSummary } : {}),
    },
  };
}

export async function syncBusinessCenterProgressForMember(memberInput = {}, payload = {}) {
  const pendingAccountRestriction = await resolvePendingAccountRestrictionForMember(memberInput);
  if (pendingAccountRestriction) {
    return pendingAccountRestriction;
  }

  const completedLegacyTierCountRaw = Number(payload?.completedLegacyTierCount);
  if (!Number.isFinite(completedLegacyTierCountRaw) || completedLegacyTierCountRaw < 0) {
    return {
      success: false,
      status: 400,
      error: 'A valid completedLegacyTierCount is required.',
    };
  }

  const stateResult = await resolveAndSyncOwnerBusinessCenterState(memberInput, {
    completedLegacyTierCount: Math.floor(completedLegacyTierCountRaw),
    preserveHigherCompletedTierCount: true,
  });

  if (!stateResult.success) {
    return stateResult;
  }

  return {
    success: true,
    status: 200,
    data: {
      ...buildBusinessCenterStatusPayload(stateResult),
      progressUpdated: true,
    },
  };
}

export async function activateBusinessCenterForMember(memberInput = {}, payload = {}) {
  const pendingAccountRestriction = await resolvePendingAccountRestrictionForMember(memberInput);
  if (pendingAccountRestriction) {
    return pendingAccountRestriction;
  }

  const requestedSide = normalizePlacementSide(
    payload?.side
    || payload?.placementSide
    || payload?.pinnedSide,
  );
  const preferredSide = PLACEMENT_SIDE_LEFT;

  if (requestedSide && requestedSide !== PLACEMENT_SIDE_LEFT) {
    return {
      success: false,
      status: 400,
      error: 'Business Center activation is locked to LEFT side only.',
    };
  }

  const idempotencyKey = normalizeIdempotencyKey(payload?.idempotencyKey || payload?.requestId);
  const requestId = normalizeText(payload?.requestId) || createRecordId('bc_activation_request');

  const client = await pool.connect();
  let transactionClosed = false;

  try {
    await client.query('BEGIN');

    await acquireOwnerAdvisoryLock({}, resolveAuthenticatedIdentity(memberInput), client);

    let stateResult = await resolveAndSyncOwnerBusinessCenterState(memberInput, {
      client,
      preserveHigherCompletedTierCount: true,
    });

    if (!stateResult.success) {
      await client.query('ROLLBACK');
      transactionClosed = true;
      return stateResult;
    }

    const ownerUserId = normalizeText(stateResult.context?.ownerIdentity?.userId);
    if (!ownerUserId) {
      await client.query('ROLLBACK');
      transactionClosed = true;
      return {
        success: false,
        status: 409,
        error: 'Owner user id is missing for this Business Center account.',
      };
    }

    if (idempotencyKey) {
      const existingAudit = await readActivationAuditByIdempotency(ownerUserId, idempotencyKey, client);
      if (existingAudit) {
        await client.query('COMMIT');
        transactionClosed = true;

        const refreshedState = await resolveAndSyncOwnerBusinessCenterState(memberInput, {
          preserveHigherCompletedTierCount: true,
        });

        if (!refreshedState.success) {
          return refreshedState;
        }

        return {
          success: true,
          status: 200,
          data: {
            ...buildBusinessCenterStatusPayload(refreshedState),
            activation: {
              side: normalizeText(existingAudit.side),
              businessCenterIndex: toWholeNumber(existingAudit.business_center_index, 0),
              businessCenterLabel: resolveBusinessCenterLabel(existingAudit.business_center_index),
              demotedUsername: normalizeText(existingAudit.demoted_node_username),
              activatedAt: toIsoStringOrEmpty(existingAudit.activated_at),
              idempotentReplay: true,
            },
          },
        };
      }
    }

    const basePayload = buildBusinessCenterStatusPayload(stateResult);
    const businessCenterMeta = basePayload.businessCenters || {};

    if (Boolean(businessCenterMeta.isStaffTreeAccount)) {
      await client.query('ROLLBACK');
      transactionClosed = true;
      return {
        success: false,
        status: 403,
        error: 'Business Center activation is disabled for staff/admin tree accounts.',
        data: basePayload,
      };
    }

    const nextCenterIndex = resolveNextPendingBusinessCenterIndex(stateResult.progress);
    if (nextCenterIndex <= 0) {
      await client.query('ROLLBACK');
      transactionClosed = true;
      return {
        success: false,
        status: 409,
        error: (toWholeNumber(stateResult.progress?.activatedCount, 0) >= MAX_BUSINESS_CENTER_COUNT)
          ? `Maximum of ${MAX_BUSINESS_CENTER_COUNT} active Business Centers has been reached.`
          : 'No Business Center activations are currently available.',
        data: basePayload,
      };
    }

    const existingCenterCollision = stateResult.context?.ownedMemberEntries?.find((entry) => {
      const member = entry?.member || {};
      return (
        toWholeNumber(member?.businessCenterIndex, 0) === nextCenterIndex
        && normalizeBusinessCenterNodeType(member?.businessCenterNodeType) === NODE_TYPE_BUSINESS_CENTER
        && normalizeActivationStatus(member?.activationStatus) === ACTIVATION_STATUS_ACTIVE
      );
    });

    if (existingCenterCollision) {
      await client.query('ROLLBACK');
      transactionClosed = true;
      return {
        success: false,
        status: 409,
        error: `Business Center #${nextCenterIndex} is already active for this account owner.`,
        data: basePayload,
      };
    }

    const mainCenterMember = stateResult.context?.mainCenterEntry?.member || null;
    if (!mainCenterMember) {
      await client.query('ROLLBACK');
      transactionClosed = true;
      return {
        success: false,
        status: 409,
        error: 'Main Center node was not found for this account owner.',
      };
    }

    const activeUsername = normalizeText(
      mainCenterMember?.memberUsername
      || stateResult.context?.ownerIdentity?.username
      || stateResult.authenticatedIdentity?.username,
    );

    if (!activeUsername) {
      await client.query('ROLLBACK');
      transactionClosed = true;
      return {
        success: false,
        status: 409,
        error: 'Unable to activate Business Center because the active node username is missing.',
      };
    }

    const nowIso = new Date().toISOString();
    const centerLabel = resolveBusinessCenterLabel(nextCenterIndex);
    const demotedUsername = createUniqueBusinessCenterUsername(
      activeUsername,
      nextCenterIndex,
      stateResult.members,
    );

    const demotedNode = {
      ...mainCenterMember,
      fullName: centerLabel,
      memberUsername: demotedUsername,
      sponsorUsername: activeUsername,
      sponsorName: normalizeText(mainCenterMember?.fullName || stateResult.context?.ownerIdentity?.fullName || activeUsername),
      placementLeg: preferredSide,
      isSpillover: false,
      spilloverPlacementSide: '',
      spilloverParentReference: '',
      packageBv: 0,
      starterPersonalPv: 0,
      currentPersonalPvBv: 0,
      fastTrackBonusAmount: 0,
      serverCutoffBaselineStarterPersonalPv: 0,
      businessCenterOwnerUserId: normalizeText(stateResult.context?.ownerIdentity?.userId) || null,
      businessCenterOwnerUsername: normalizeText(stateResult.context?.ownerIdentity?.username),
      businessCenterOwnerEmail: normalizeText(stateResult.context?.ownerIdentity?.email),
      businessCenterNodeType: NODE_TYPE_BUSINESS_CENTER,
      businessCenterIndex: nextCenterIndex,
      businessCenterLabel: centerLabel,
      businessCenterActivatedAt: nowIso,
      businessCenterPinnedSide: preferredSide,
      isEarningEligible: true,
      activationStatus: ACTIVATION_STATUS_ACTIVE,
      sourceQualificationTier: Math.max(
        toWholeNumber(mainCenterMember?.sourceQualificationTier, 0),
        toWholeNumber(
          DEFAULT_UNLOCK_RULES.find((rule) => rule.businessCenterIndex === nextCenterIndex)?.requiredTier,
          0,
        ),
      ),
    };

    const newTopNode = {
      ...mainCenterMember,
      id: createRecordId('reg'),
      fullName: normalizeText(mainCenterMember?.fullName || stateResult.context?.ownerIdentity?.fullName || activeUsername),
      memberUsername: activeUsername,
      businessCenterOwnerUserId: normalizeText(stateResult.context?.ownerIdentity?.userId) || null,
      businessCenterOwnerUsername: normalizeText(stateResult.context?.ownerIdentity?.username),
      businessCenterOwnerEmail: normalizeText(stateResult.context?.ownerIdentity?.email),
      businessCenterNodeType: NODE_TYPE_MAIN_CENTER,
      businessCenterIndex: 0,
      businessCenterLabel: 'Main Center',
      businessCenterActivatedAt: '',
      businessCenterPinnedSide: '',
      isEarningEligible: true,
      activationStatus: ACTIVATION_STATUS_ACTIVE,
      sourceQualificationTier: toWholeNumber(stateResult.progress?.sourceQualificationTier, 0),
      createdAt: nowIso,
    };

    await upsertRegisteredMemberRecord(demotedNode, {
      client,
    });

    await patchDirectSponsorReferencesToDemotedNode({
      demotedUsername,
      demotedLabel: centerLabel,
      activeUsername,
      demotedNodeId: normalizeText(demotedNode?.id),
      executor: client,
    });

    await upsertRegisteredMemberRecord(newTopNode, {
      client,
      preferInsert: true,
    });

    stateResult = await resolveAndSyncOwnerBusinessCenterState(memberInput, {
      client,
      preserveHigherCompletedTierCount: true,
    });

    if (!stateResult.success) {
      await client.query('ROLLBACK');
      transactionClosed = true;
      return stateResult;
    }

    await insertActivationAudit({
      id: createRecordId('bc_activation_audit'),
      ownerUserId: normalizeText(stateResult.context?.ownerIdentity?.userId),
      ownerUsername: normalizeText(stateResult.context?.ownerIdentity?.username),
      ownerEmail: normalizeText(stateResult.context?.ownerIdentity?.email),
      requestId,
      idempotencyKey,
      businessCenterIndex: nextCenterIndex,
      side: preferredSide,
      newTopNodeId: normalizeText(newTopNode?.id),
      demotedNodeId: normalizeText(demotedNode?.id),
      demotedNodeUsername: demotedUsername,
      newTopUsername: activeUsername,
      triggeredByUserId: normalizeText(stateResult.authenticatedIdentity?.userId),
      triggeredByUsername: normalizeText(stateResult.authenticatedIdentity?.username),
      triggeredByEmail: normalizeText(stateResult.authenticatedIdentity?.email),
      activatedAt: nowIso,
      metadata: {
        activationSide: preferredSide,
        sourceMainNodeId: normalizeText(mainCenterMember?.id),
      },
    }, client);

    await client.query('COMMIT');
    transactionClosed = true;

    const refreshedState = await resolveAndSyncOwnerBusinessCenterState(memberInput, {
      preserveHigherCompletedTierCount: true,
    });

    if (!refreshedState.success) {
      return refreshedState;
    }

    return {
      success: true,
      status: 201,
      data: {
        ...buildBusinessCenterStatusPayload(refreshedState),
        activation: {
          side: preferredSide,
          businessCenterIndex: nextCenterIndex,
          businessCenterLabel: centerLabel,
          demotedUsername,
          activatedAt: nowIso,
          requestId,
          idempotencyKey,
        },
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

export async function getBusinessCenterEarningsForMember(memberInput = {}, query = {}) {
  const stateResult = await resolveAndSyncOwnerBusinessCenterState(memberInput, {
    preserveHigherCompletedTierCount: true,
  });
  if (!stateResult.success) {
    return stateResult;
  }

  const earningsSummary = await buildBusinessCenterEarningsSummary(
    stateResult.context?.ownerIdentity,
    query,
    { executor: pool },
  );

  return {
    success: true,
    status: 200,
    data: {
      success: true,
      owner: {
        userId: normalizeText(stateResult.context?.ownerIdentity?.userId),
        username: normalizeText(stateResult.context?.ownerIdentity?.username),
        email: normalizeText(stateResult.context?.ownerIdentity?.email),
        fullName: normalizeText(stateResult.context?.ownerIdentity?.fullName),
      },
      earnings: earningsSummary,
    },
  };
}

export async function getBusinessCenterWalletSummaryForMember(memberInput = {}, query = {}) {
  const stateResult = await resolveAndSyncOwnerBusinessCenterState(memberInput, {
    preserveHigherCompletedTierCount: true,
  });
  if (!stateResult.success) {
    return stateResult;
  }

  const walletSummary = await buildBusinessCenterWalletSummary(
    stateResult.context?.ownerIdentity,
    query,
    { executor: pool },
  );

  return {
    success: true,
    status: 200,
    data: {
      success: true,
      owner: {
        userId: normalizeText(stateResult.context?.ownerIdentity?.userId),
        username: normalizeText(stateResult.context?.ownerIdentity?.username),
        email: normalizeText(stateResult.context?.ownerIdentity?.email),
        fullName: normalizeText(stateResult.context?.ownerIdentity?.fullName),
      },
      walletSummary,
    },
  };
}

export async function recordBusinessCenterCommissionEvent(payload = {}) {
  await ensureBusinessCenterRedesignTables();

  const ownerUserId = normalizeText(payload?.ownerUserId);
  const sourceNodeId = normalizeText(payload?.sourceNodeId);
  const amount = roundCurrencyAmount(payload?.amount, 0);

  if (!ownerUserId) {
    return {
      success: false,
      status: 400,
      error: 'ownerUserId is required to record Business Center commission events.',
    };
  }

  if (!sourceNodeId) {
    return {
      success: false,
      status: 400,
      error: 'sourceNodeId is required to record Business Center commission events.',
    };
  }

  if (amount <= 0) {
    return {
      success: false,
      status: 400,
      error: 'Commission event amount must be greater than 0.',
    };
  }

  const eventDedupKey = resolveCommissionEventDedupKey(payload);
  if (!eventDedupKey) {
    return {
      success: false,
      status: 400,
      error: 'An idempotency key is required for immutable commission event recording.',
    };
  }

  const client = await pool.connect();
  let transactionClosed = false;

  try {
    await client.query('BEGIN');

    await client.query(`
      SELECT pg_advisory_xact_lock(hashtext($1))
    `, [`bc-event:${eventDedupKey}`]);

    const eventResult = await insertCommissionEventAndCreditWallet({
      id: normalizeText(payload?.id) || createRecordId('bc_event'),
      eventDedupKey,
      ownerUserId,
      ownerUsername: normalizeText(payload?.ownerUsername),
      ownerEmail: normalizeText(payload?.ownerEmail),
      sourceNodeId,
      sourceCenterType: normalizeCommissionSourceCenterType(payload?.sourceCenterType, payload?.sourceCenterIndex),
      sourceCenterIndex: toWholeNumber(payload?.sourceCenterIndex, 0),
      sourceCenterLabel: normalizeText(payload?.sourceCenterLabel),
      commissionType: normalizeCommissionType(payload?.commissionType, 'sales_team_cycle'),
      amount,
      currencyCode: normalizeText(payload?.currencyCode || 'USD').toUpperCase() || 'USD',
      cycleCount: toWholeNumber(payload?.cycleCount, 0),
      leftVolumeUsed: toWholeNumber(payload?.leftVolumeUsed, 0),
      rightVolumeUsed: toWholeNumber(payload?.rightVolumeUsed, 0),
      metadata: payload?.metadata,
      createdAt: normalizeText(payload?.createdAt) || new Date().toISOString(),
    }, {
      executor: client,
    });

    await client.query('COMMIT');
    transactionClosed = true;

    return {
      success: true,
      status: eventResult.idempotent ? 200 : 201,
      data: {
        success: true,
        idempotent: eventResult.idempotent,
        event: eventResult.event,
        ledgerEntry: eventResult.ledgerEntry,
        wallet: eventResult.wallet,
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

function resolveCycleSplitComputation({
  leftVolume,
  rightVolume,
  cycleLowerBv,
  cycleHigherBv,
}) {
  let remainingLeft = Math.max(0, toWholeNumber(leftVolume, 0));
  let remainingRight = Math.max(0, toWholeNumber(rightVolume, 0));
  const lowerBv = Math.max(1, toWholeNumber(cycleLowerBv, 500));
  const higherBv = Math.max(lowerBv, toWholeNumber(cycleHigherBv, 1000));

  let cycleCount = 0;

  while (true) {
    const weakerIsLeft = remainingLeft <= remainingRight;
    const weakerVolume = weakerIsLeft ? remainingLeft : remainingRight;
    const strongerVolume = weakerIsLeft ? remainingRight : remainingLeft;

    if (weakerVolume < higherBv || strongerVolume < lowerBv) {
      break;
    }

    // Dynamic rule: weaker leg consumes higher threshold; stronger leg consumes lower threshold.
    if (weakerIsLeft) {
      remainingLeft -= higherBv;
      remainingRight -= lowerBv;
    } else {
      remainingLeft -= lowerBv;
      remainingRight -= higherBv;
    }

    cycleCount += 1;
  }

  const usedLeftVolume = Math.max(0, toWholeNumber(leftVolume, 0) - remainingLeft);
  const usedRightVolume = Math.max(0, toWholeNumber(rightVolume, 0) - remainingRight);

  return {
    cycleCount,
    usedLeftVolume,
    usedRightVolume,
    remainingLeftVolume: remainingLeft,
    remainingRightVolume: remainingRight,
  };
}

export async function settleBusinessCenterCycleCommission(payload = {}) {
  await ensureBusinessCenterRedesignTables();

  const ownerUserId = normalizeText(payload?.ownerUserId);
  const sourceNodeId = normalizeText(payload?.sourceNodeId);
  const sourceCenterIndex = Math.max(0, Math.min(MAX_BUSINESS_CENTER_COUNT, toWholeNumber(payload?.sourceCenterIndex, 0)));
  const sourceCenterType = normalizeCommissionSourceCenterType(payload?.sourceCenterType, sourceCenterIndex);
  const sourceCenterLabel = normalizeText(payload?.sourceCenterLabel) || resolveBusinessCenterLabel(sourceCenterIndex);
  const commissionType = normalizeCommissionType(payload?.commissionType, 'sales_team_cycle');
  const perCycleAmount = roundCurrencyAmount(payload?.perCycleAmount, 0);

  if (!ownerUserId) {
    return {
      success: false,
      status: 400,
      error: 'ownerUserId is required for cycle settlement.',
    };
  }

  if (!sourceNodeId) {
    return {
      success: false,
      status: 400,
      error: 'sourceNodeId is required for cycle settlement.',
    };
  }

  if (perCycleAmount <= 0) {
    return {
      success: false,
      status: 400,
      error: 'perCycleAmount must be greater than 0 for cycle settlement.',
    };
  }

  const upstreamOwnerUserId = normalizeText(payload?.upstreamOwnerUserId);
  if (
    upstreamOwnerUserId
    && upstreamOwnerUserId === ownerUserId
    && payload?.allowSelfOwnedCascade !== true
  ) {
    return {
      success: false,
      status: 409,
      error: 'Self-owned recursive cycle settlement was blocked to prevent payout inflation.',
    };
  }

  const eventDedupKey = resolveCommissionEventDedupKey({
    eventDedupKey: payload?.volumeReference || payload?.eventDedupKey || payload?.idempotencyKey,
    ownerUserId,
    sourceNodeId,
    sourceCenterIndex,
    commissionType,
    amount: 0,
  });

  if (!eventDedupKey) {
    return {
      success: false,
      status: 400,
      error: 'volumeReference or idempotency key is required for idempotent cycle settlement.',
    };
  }

  const leftVolumeDelta = Math.max(0, toWholeNumber(payload?.leftVolumeDelta, 0));
  const rightVolumeDelta = Math.max(0, toWholeNumber(payload?.rightVolumeDelta, 0));
  const cycleLowerBv = Math.max(1, toWholeNumber(payload?.cycleLowerBv, 500));
  const cycleHigherBv = Math.max(cycleLowerBv, toWholeNumber(payload?.cycleHigherBv, 1000));

  const client = await pool.connect();
  let transactionClosed = false;

  try {
    await client.query('BEGIN');

    await client.query(`
      SELECT pg_advisory_xact_lock(hashtext($1))
    `, [`bc-cycle:${sourceNodeId}`]);

    const existingEvent = await readCommissionEventByDedupKey(eventDedupKey, client);
    if (existingEvent) {
      await client.query('COMMIT');
      transactionClosed = true;

      return {
        success: true,
        status: 200,
        data: {
          success: true,
          idempotent: true,
          event: existingEvent,
        },
      };
    }

    await client.query(`
      INSERT INTO charge.business_center_cycle_states (
        source_node_id,
        owner_user_id,
        source_center_index,
        source_center_label,
        left_carry_volume,
        right_carry_volume,
        total_cycles,
        total_volume_left_consumed,
        total_volume_right_consumed,
        updated_at
      )
      VALUES ($1,$2,$3,$4,0,0,0,0,0,NOW())
      ON CONFLICT (source_node_id) DO NOTHING
    `, [
      sourceNodeId,
      ownerUserId,
      sourceCenterIndex,
      sourceCenterLabel,
    ]);

    const cycleStateResult = await client.query(`
      SELECT
        source_node_id,
        owner_user_id,
        source_center_index,
        source_center_label,
        left_carry_volume,
        right_carry_volume,
        total_cycles,
        total_volume_left_consumed,
        total_volume_right_consumed
      FROM charge.business_center_cycle_states
      WHERE source_node_id = $1
      LIMIT 1
      FOR UPDATE
    `, [sourceNodeId]);

    const cycleState = cycleStateResult.rows[0] || {};
    const leftCarryBefore = toWholeNumber(cycleState?.left_carry_volume, 0);
    const rightCarryBefore = toWholeNumber(cycleState?.right_carry_volume, 0);
    const leftVolumeForComputation = leftCarryBefore + leftVolumeDelta;
    const rightVolumeForComputation = rightCarryBefore + rightVolumeDelta;

    const cycleComputation = resolveCycleSplitComputation({
      leftVolume: leftVolumeForComputation,
      rightVolume: rightVolumeForComputation,
      cycleLowerBv,
      cycleHigherBv,
    });

    const totalCyclesAfter = toWholeNumber(cycleState?.total_cycles, 0) + cycleComputation.cycleCount;
    const totalLeftConsumedAfter = toWholeNumber(cycleState?.total_volume_left_consumed, 0) + cycleComputation.usedLeftVolume;
    const totalRightConsumedAfter = toWholeNumber(cycleState?.total_volume_right_consumed, 0) + cycleComputation.usedRightVolume;

    await client.query(`
      UPDATE charge.business_center_cycle_states
      SET
        owner_user_id = $2,
        source_center_index = $3,
        source_center_label = $4,
        left_carry_volume = $5,
        right_carry_volume = $6,
        total_cycles = $7,
        total_volume_left_consumed = $8,
        total_volume_right_consumed = $9,
        updated_at = NOW()
      WHERE source_node_id = $1
    `, [
      sourceNodeId,
      ownerUserId,
      sourceCenterIndex,
      sourceCenterLabel,
      cycleComputation.remainingLeftVolume,
      cycleComputation.remainingRightVolume,
      totalCyclesAfter,
      totalLeftConsumedAfter,
      totalRightConsumedAfter,
    ]);

    const commissionAmount = roundCurrencyAmount(cycleComputation.cycleCount * perCycleAmount, 0);
    if (cycleComputation.cycleCount <= 0 || commissionAmount <= 0) {
      await client.query('COMMIT');
      transactionClosed = true;

      return {
        success: true,
        status: 200,
        data: {
          success: true,
          idempotent: false,
          commissionCreated: false,
          cycle: {
            sourceNodeId,
            cycleCount: cycleComputation.cycleCount,
            usedLeftVolume: cycleComputation.usedLeftVolume,
            usedRightVolume: cycleComputation.usedRightVolume,
            leftCarryVolume: cycleComputation.remainingLeftVolume,
            rightCarryVolume: cycleComputation.remainingRightVolume,
            cycleLowerBv,
            cycleHigherBv,
          },
        },
      };
    }

    const eventResult = await insertCommissionEventAndCreditWallet({
      id: createRecordId('bc_event'),
      eventDedupKey,
      ownerUserId,
      ownerUsername: normalizeText(payload?.ownerUsername),
      ownerEmail: normalizeText(payload?.ownerEmail),
      sourceNodeId,
      sourceCenterType,
      sourceCenterIndex,
      sourceCenterLabel,
      commissionType,
      amount: commissionAmount,
      currencyCode: normalizeText(payload?.currencyCode || 'USD').toUpperCase() || 'USD',
      cycleCount: cycleComputation.cycleCount,
      leftVolumeUsed: cycleComputation.usedLeftVolume,
      rightVolumeUsed: cycleComputation.usedRightVolume,
      metadata: {
        volumeReference: normalizeText(payload?.volumeReference),
        cycleLowerBv,
        cycleHigherBv,
        leftVolumeDelta,
        rightVolumeDelta,
      },
      createdAt: new Date().toISOString(),
    }, {
      executor: client,
    });

    await client.query('COMMIT');
    transactionClosed = true;

    return {
      success: true,
      status: eventResult.idempotent ? 200 : 201,
      data: {
        success: true,
        idempotent: eventResult.idempotent,
        commissionCreated: !eventResult.idempotent,
        cycle: {
          sourceNodeId,
          cycleCount: cycleComputation.cycleCount,
          usedLeftVolume: cycleComputation.usedLeftVolume,
          usedRightVolume: cycleComputation.usedRightVolume,
          leftCarryVolume: cycleComputation.remainingLeftVolume,
          rightCarryVolume: cycleComputation.remainingRightVolume,
          cycleLowerBv,
          cycleHigherBv,
        },
        event: eventResult.event,
        ledgerEntry: eventResult.ledgerEntry,
        wallet: eventResult.wallet,
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

export async function ensureBusinessCenterRedesignTables() {
  if (businessCenterSchemaReady) {
    return;
  }

  if (businessCenterSchemaPromise) {
    return businessCenterSchemaPromise;
  }

  businessCenterSchemaPromise = (async () => {
    await warmRegisteredMembersStoreSchema();

    await pool.query(`
      ALTER TABLE charge.registered_members
        ALTER COLUMN business_center_node_type SET DEFAULT 'main_center'
    `);

    await pool.query(`
      ALTER TABLE charge.registered_members
        ADD COLUMN IF NOT EXISTS is_earning_eligible boolean NOT NULL DEFAULT true,
        ADD COLUMN IF NOT EXISTS activation_status text NOT NULL DEFAULT 'active',
        ADD COLUMN IF NOT EXISTS source_qualification_tier integer NOT NULL DEFAULT 0
    `);

    await pool.query(`
      UPDATE charge.registered_members
      SET business_center_owner_user_id = user_id
      WHERE business_center_owner_user_id IS NULL
        AND BTRIM(COALESCE(user_id, '')) <> ''
    `);

    await pool.query(`
      UPDATE charge.registered_members
      SET business_center_node_type = 'main_center'
      WHERE LOWER(BTRIM(COALESCE(business_center_node_type, ''))) IN ('primary', 'main')
    `);

    await pool.query(`
      UPDATE charge.registered_members
      SET business_center_node_type = 'legacy_placeholder'
      WHERE LOWER(BTRIM(COALESCE(business_center_node_type, ''))) = 'placeholder'
    `);

    await pool.query(`
      UPDATE charge.registered_members
      SET business_center_node_type = 'staff_admin',
          activation_status = 'active',
          is_earning_eligible = false,
          business_center_index = 0,
          business_center_label = 'Main Center'
      WHERE is_staff_tree_account = true
    `);

    await pool.query(`
      UPDATE charge.registered_members
      SET business_center_node_type = 'main_center',
          activation_status = 'active',
          business_center_index = 0,
          business_center_label = 'Main Center',
          is_earning_eligible = CASE
            WHEN is_staff_tree_account THEN false
            ELSE true
          END
      WHERE is_staff_tree_account = false
        AND business_center_index <= 0
    `);

    await pool.query(`
      UPDATE charge.registered_members
      SET business_center_node_type = 'business_center',
          activation_status = 'active',
          is_earning_eligible = CASE
            WHEN is_staff_tree_account THEN false
            ELSE true
          END,
          business_center_label = CASE
            WHEN business_center_index BETWEEN 1 AND 3 THEN CONCAT('Business Center #', business_center_index)
            ELSE business_center_label
          END,
          business_center_activated_at = COALESCE(business_center_activated_at, created_at)
      WHERE is_staff_tree_account = false
        AND business_center_index BETWEEN 1 AND 3
        AND LOWER(BTRIM(COALESCE(business_center_node_type, ''))) IN ('business_center', 'legacy_placeholder')
    `);

    await pool.query(`
      UPDATE charge.registered_members
      SET business_center_node_type = 'legacy_placeholder',
          activation_status = 'deprecated',
          is_earning_eligible = false,
          business_center_label = CASE
            WHEN BTRIM(COALESCE(business_center_label, '')) = '' THEN CONCAT('Legacy Center #', business_center_index)
            ELSE business_center_label
          END
      WHERE business_center_index > 3
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_registered_members_business_center_owner_user_id
      ON charge.registered_members (business_center_owner_user_id)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_registered_members_business_center_owner_username_lower
      ON charge.registered_members (LOWER(business_center_owner_username))
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS charge.business_center_unlock_rules (
        id text PRIMARY KEY,
        business_center_index integer NOT NULL,
        required_tier integer NOT NULL,
        center_label text NOT NULL DEFAULT '',
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW(),
        CONSTRAINT business_center_unlock_rules_center_index_check CHECK (business_center_index BETWEEN 1 AND 3),
        CONSTRAINT business_center_unlock_rules_required_tier_check CHECK (required_tier > 0)
      )
    `);

    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS business_center_unlock_rules_center_index_unique_idx
      ON charge.business_center_unlock_rules (business_center_index)
    `);

    await pool.query(`
      INSERT INTO charge.business_center_unlock_rules (
        id,
        business_center_index,
        required_tier,
        center_label,
        is_active,
        created_at,
        updated_at
      )
      VALUES
        ('bc_unlock_rule_1', 1, 3, 'Business Center #1', TRUE, NOW(), NOW()),
        ('bc_unlock_rule_2', 2, 4, 'Business Center #2', TRUE, NOW(), NOW()),
        ('bc_unlock_rule_3', 3, 5, 'Business Center #3', TRUE, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        business_center_index = EXCLUDED.business_center_index,
        required_tier = EXCLUDED.required_tier,
        center_label = EXCLUDED.center_label,
        updated_at = NOW()
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS charge.business_center_owner_progress (
        owner_user_id text PRIMARY KEY,
        owner_username text NOT NULL DEFAULT '',
        owner_email text NOT NULL DEFAULT '',
        completed_legacy_tier_count integer NOT NULL DEFAULT 0,
        unlocked_count integer NOT NULL DEFAULT 0,
        activated_count integer NOT NULL DEFAULT 0,
        pending_count integer NOT NULL DEFAULT 0,
        source_qualification_tier integer NOT NULL DEFAULT 0,
        unlocked_center_indexes integer[] NOT NULL DEFAULT ARRAY[]::integer[],
        activated_center_indexes integer[] NOT NULL DEFAULT ARRAY[]::integer[],
        pending_center_indexes integer[] NOT NULL DEFAULT ARRAY[]::integer[],
        overflow_pending integer NOT NULL DEFAULT 0,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW(),
        last_synced_at timestamptz NOT NULL DEFAULT NOW(),
        CONSTRAINT business_center_owner_progress_completed_tier_check CHECK (completed_legacy_tier_count >= 0),
        CONSTRAINT business_center_owner_progress_unlocked_check CHECK (unlocked_count >= 0 AND unlocked_count <= 3),
        CONSTRAINT business_center_owner_progress_activated_check CHECK (activated_count >= 0 AND activated_count <= 3),
        CONSTRAINT business_center_owner_progress_pending_check CHECK (pending_count >= 0 AND pending_count <= 3)
      )
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS business_center_owner_progress_username_lower_idx
      ON charge.business_center_owner_progress (LOWER(owner_username))
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS charge.business_center_activation_audit (
        id text PRIMARY KEY,
        owner_user_id text NOT NULL,
        owner_username text NOT NULL DEFAULT '',
        owner_email text NOT NULL DEFAULT '',
        request_id text NOT NULL DEFAULT '',
        idempotency_key text NOT NULL DEFAULT '',
        business_center_index integer NOT NULL,
        side text NOT NULL,
        new_top_node_id text NOT NULL,
        demoted_node_id text NOT NULL,
        demoted_node_username text NOT NULL,
        new_top_username text NOT NULL,
        triggered_by_user_id text NOT NULL DEFAULT '',
        triggered_by_username text NOT NULL DEFAULT '',
        triggered_by_email text NOT NULL DEFAULT '',
        activated_at timestamptz NOT NULL DEFAULT NOW(),
        metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
        CONSTRAINT business_center_activation_audit_index_check CHECK (business_center_index BETWEEN 1 AND 3),
        CONSTRAINT business_center_activation_audit_side_check CHECK (side IN ('left', 'right'))
      )
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS business_center_activation_audit_owner_idx
      ON charge.business_center_activation_audit (owner_user_id, activated_at DESC)
    `);

    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS business_center_activation_audit_owner_center_unique_idx
      ON charge.business_center_activation_audit (owner_user_id, business_center_index)
    `);

    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS business_center_activation_audit_owner_idempotency_unique_idx
      ON charge.business_center_activation_audit (owner_user_id, idempotency_key)
      WHERE BTRIM(COALESCE(idempotency_key, '')) <> ''
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS charge.business_center_cycle_states (
        source_node_id text PRIMARY KEY,
        owner_user_id text NOT NULL,
        source_center_index integer NOT NULL,
        source_center_label text NOT NULL DEFAULT '',
        left_carry_volume integer NOT NULL DEFAULT 0,
        right_carry_volume integer NOT NULL DEFAULT 0,
        total_cycles integer NOT NULL DEFAULT 0,
        total_volume_left_consumed integer NOT NULL DEFAULT 0,
        total_volume_right_consumed integer NOT NULL DEFAULT 0,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW(),
        CONSTRAINT business_center_cycle_states_center_index_check CHECK (source_center_index BETWEEN 0 AND 3),
        CONSTRAINT business_center_cycle_states_left_carry_check CHECK (left_carry_volume >= 0),
        CONSTRAINT business_center_cycle_states_right_carry_check CHECK (right_carry_volume >= 0)
      )
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS business_center_cycle_states_owner_idx
      ON charge.business_center_cycle_states (owner_user_id, source_center_index)
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS charge.business_center_commission_events (
        id text PRIMARY KEY,
        event_dedup_key text NOT NULL,
        owner_user_id text NOT NULL,
        owner_username text NOT NULL DEFAULT '',
        owner_email text NOT NULL DEFAULT '',
        source_node_id text NOT NULL,
        source_center_type text NOT NULL,
        source_center_index integer NOT NULL,
        source_center_label text NOT NULL DEFAULT '',
        commission_type text NOT NULL,
        amount numeric(14,2) NOT NULL,
        currency_code text NOT NULL DEFAULT 'USD',
        cycle_count integer NOT NULL DEFAULT 0,
        left_volume_used integer NOT NULL DEFAULT 0,
        right_volume_used integer NOT NULL DEFAULT 0,
        metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        CONSTRAINT business_center_commission_events_center_type_check CHECK (source_center_type IN ('main_center', 'business_center')),
        CONSTRAINT business_center_commission_events_center_index_check CHECK (source_center_index BETWEEN 0 AND 3),
        CONSTRAINT business_center_commission_events_amount_check CHECK (amount >= 0)
      )
    `);

    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS business_center_commission_events_dedup_key_unique_idx
      ON charge.business_center_commission_events (event_dedup_key)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS business_center_commission_events_owner_idx
      ON charge.business_center_commission_events (owner_user_id, created_at DESC)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS business_center_commission_events_source_center_idx
      ON charge.business_center_commission_events (owner_user_id, source_center_index, created_at DESC)
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS charge.wallet_ledger_entries (
        id text PRIMARY KEY,
        owner_user_id text NOT NULL,
        owner_username text NOT NULL DEFAULT '',
        owner_email text NOT NULL DEFAULT '',
        entry_direction text NOT NULL,
        amount numeric(14,2) NOT NULL,
        currency_code text NOT NULL DEFAULT 'USD',
        balance_before numeric(14,2) NOT NULL,
        balance_after numeric(14,2) NOT NULL,
        reference_type text NOT NULL,
        reference_id text NOT NULL,
        source_node_id text NOT NULL DEFAULT '',
        source_center_type text NOT NULL DEFAULT 'main_center',
        source_center_index integer NOT NULL DEFAULT 0,
        source_center_label text NOT NULL DEFAULT '',
        commission_type text NOT NULL DEFAULT '',
        metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        CONSTRAINT wallet_ledger_entries_direction_check CHECK (entry_direction IN ('credit', 'debit')),
        CONSTRAINT wallet_ledger_entries_amount_check CHECK (amount >= 0),
        CONSTRAINT wallet_ledger_entries_balance_before_check CHECK (balance_before >= 0),
        CONSTRAINT wallet_ledger_entries_balance_after_check CHECK (balance_after >= 0),
        CONSTRAINT wallet_ledger_entries_source_center_type_check CHECK (source_center_type IN ('main_center', 'business_center')),
        CONSTRAINT wallet_ledger_entries_source_center_index_check CHECK (source_center_index BETWEEN 0 AND 3)
      )
    `);

    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS wallet_ledger_entries_reference_unique_idx
      ON charge.wallet_ledger_entries (reference_type, reference_id)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS wallet_ledger_entries_owner_idx
      ON charge.wallet_ledger_entries (owner_user_id, created_at DESC)
    `);

    businessCenterSchemaReady = true;
  })().catch((error) => {
    businessCenterSchemaReady = false;
    throw error;
  }).finally(() => {
    if (!businessCenterSchemaReady) {
      businessCenterSchemaPromise = null;
    }
  });

  return businessCenterSchemaPromise;
}
