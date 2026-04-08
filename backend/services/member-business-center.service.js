import { randomUUID } from 'crypto';

import {
  readRegisteredMembersStore,
  writeRegisteredMembersStore,
} from '../stores/member.store.js';

const BUSINESS_CENTER_ACTIVATION_CAP = 5;
const LEGACY_COMPLETIONS_PER_BUSINESS_CENTER = 5;
const BUSINESS_CENTER_NODE_TYPE_PRIMARY = 'primary';
const BUSINESS_CENTER_NODE_TYPE_PLACEHOLDER = 'placeholder';
const PLACEMENT_SIDE_LEFT = 'left';
const PLACEMENT_SIDE_RIGHT = 'right';

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeCredential(value) {
  return normalizeText(value).toLowerCase();
}

function toWholeNumber(value, fallback = 0) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return Math.max(0, Math.floor(Number(fallback) || 0));
  }
  return Math.max(0, Math.floor(numeric));
}

function normalizeBusinessCenterNodeType(value) {
  return normalizeCredential(value) === BUSINESS_CENTER_NODE_TYPE_PLACEHOLDER
    ? BUSINESS_CENTER_NODE_TYPE_PLACEHOLDER
    : BUSINESS_CENTER_NODE_TYPE_PRIMARY;
}

function isBusinessCenterPlaceholderMember(member = {}) {
  return normalizeBusinessCenterNodeType(member?.businessCenterNodeType) === BUSINESS_CENTER_NODE_TYPE_PLACEHOLDER;
}

function normalizePlacementSide(value) {
  return normalizeCredential(value) === PLACEMENT_SIDE_RIGHT
    ? PLACEMENT_SIDE_RIGHT
    : (normalizeCredential(value) === PLACEMENT_SIDE_LEFT ? PLACEMENT_SIDE_LEFT : '');
}

function resolveAuthenticatedIdentity(memberInput = {}) {
  return {
    userId: normalizeText(memberInput?.id || memberInput?.userId),
    username: normalizeText(memberInput?.username),
    email: normalizeText(memberInput?.email),
  };
}

function doesMemberMatchIdentity(member = {}, identity = {}) {
  const userIdKey = normalizeText(identity?.userId);
  const usernameKey = normalizeCredential(identity?.username);
  const emailKey = normalizeCredential(identity?.email);
  const memberIdKey = normalizeText(member?.userId || member?.id);
  const memberUsernameKey = normalizeCredential(member?.memberUsername || member?.username);
  const memberEmailKey = normalizeCredential(member?.email);

  return Boolean(
    (userIdKey && memberIdKey === userIdKey)
    || (usernameKey && memberUsernameKey === usernameKey)
    || (emailKey && memberEmailKey === emailKey)
  );
}

function doesMemberMatchOwner(member = {}, ownerIdentity = {}) {
  const ownerUserId = normalizeText(ownerIdentity?.userId);
  const ownerUsername = normalizeCredential(ownerIdentity?.username);
  const ownerEmail = normalizeCredential(ownerIdentity?.email);

  if (!ownerUserId && !ownerUsername && !ownerEmail) {
    return false;
  }

  const memberOwnerUserId = normalizeText(member?.businessCenterOwnerUserId);
  const memberOwnerUsername = normalizeCredential(member?.businessCenterOwnerUsername);
  const memberOwnerEmail = normalizeCredential(member?.businessCenterOwnerEmail);

  return Boolean(
    (ownerUserId && memberOwnerUserId && memberOwnerUserId === ownerUserId)
    || (ownerUsername && memberOwnerUsername && memberOwnerUsername === ownerUsername)
    || (ownerEmail && memberOwnerEmail && memberOwnerEmail === ownerEmail)
  );
}

function parseSortableTimestamp(value) {
  const parsed = Date.parse(normalizeText(value));
  return Number.isFinite(parsed) ? parsed : 0;
}

function resolvePrimaryMemberIndex(members = [], identity = {}) {
  const safeMembers = Array.isArray(members) ? members : [];
  const matchingEntries = safeMembers
    .map((member, index) => ({ member, index }))
    .filter(({ member }) => doesMemberMatchIdentity(member, identity));

  if (!matchingEntries.length) {
    return -1;
  }

  const nonPlaceholderEntries = matchingEntries
    .filter(({ member }) => !isBusinessCenterPlaceholderMember(member));
  const candidateEntries = nonPlaceholderEntries.length > 0 ? nonPlaceholderEntries : matchingEntries;

  const usernameKey = normalizeCredential(identity?.username);
  if (usernameKey) {
    const exactUsernameMatch = candidateEntries.find(({ member }) => {
      return normalizeCredential(member?.memberUsername || member?.username) === usernameKey;
    });
    if (exactUsernameMatch) {
      return exactUsernameMatch.index;
    }
  }

  candidateEntries.sort((left, right) => {
    const createdAtDiff = parseSortableTimestamp(right.member?.createdAt) - parseSortableTimestamp(left.member?.createdAt);
    if (createdAtDiff !== 0) {
      return createdAtDiff;
    }
    return left.index - right.index;
  });

  return candidateEntries[0]?.index ?? -1;
}

function resolveOwnerIdentityFromPrimary(primaryMember = {}, authenticatedIdentity = {}) {
  const ownerUserId = normalizeText(
    primaryMember?.businessCenterOwnerUserId
    || primaryMember?.userId
    || authenticatedIdentity?.userId,
  );
  const ownerUsername = normalizeText(
    primaryMember?.businessCenterOwnerUsername
    || authenticatedIdentity?.username
    || primaryMember?.memberUsername,
  );
  const ownerEmail = normalizeText(
    primaryMember?.businessCenterOwnerEmail
    || authenticatedIdentity?.email
    || primaryMember?.email,
  );

  return {
    userId: ownerUserId,
    username: ownerUsername,
    email: ownerEmail,
  };
}

function collectOwnedMemberIndexes(members = [], ownerIdentity = {}, authenticatedIdentity = {}) {
  const indexes = new Set();
  const safeMembers = Array.isArray(members) ? members : [];

  safeMembers.forEach((member, index) => {
    if (doesMemberMatchOwner(member, ownerIdentity) || doesMemberMatchIdentity(member, authenticatedIdentity)) {
      indexes.add(index);
    }
  });

  return Array.from(indexes.values());
}

function computeBusinessCenterLedger(primaryMember = {}, ownedMembers = []) {
  const placeholders = (Array.isArray(ownedMembers) ? ownedMembers : [])
    .filter((member) => isBusinessCenterPlaceholderMember(member));
  const placeholdersActivatedCount = placeholders.length;
  const activatedFromRecord = toWholeNumber(primaryMember?.businessCentersActivated, 0);
  const activatedUncapped = Math.max(placeholdersActivatedCount, activatedFromRecord);
  const activated = Math.min(BUSINESS_CENTER_ACTIVATION_CAP, activatedUncapped);

  const completedLegacyTierCount = toWholeNumber(primaryMember?.legacyLeadershipCompletedTierCount, 0);
  const earnedFromCompletions = Math.floor(completedLegacyTierCount / LEGACY_COMPLETIONS_PER_BUSINESS_CENTER);
  const earnedLifetimeFromRecord = toWholeNumber(primaryMember?.businessCentersEarnedLifetime, 0);
  const earnedLifetime = Math.max(earnedLifetimeFromRecord, earnedFromCompletions, activatedUncapped);

  const pendingTotal = Math.max(0, earnedLifetime - activated);
  const overflowPending = Math.max(0, earnedLifetime - BUSINESS_CENTER_ACTIVATION_CAP);
  const activatablePending = Math.max(
    0,
    Math.min(BUSINESS_CENTER_ACTIVATION_CAP, earnedLifetime) - activated,
  );

  return {
    cap: BUSINESS_CENTER_ACTIVATION_CAP,
    completedLegacyTierCount,
    earnedLifetime,
    activated,
    activatablePending,
    pendingTotal,
    overflowPending,
    isAtCap: activated >= BUSINESS_CENTER_ACTIVATION_CAP,
  };
}

function applyBusinessCenterTracking(primaryMember = {}, ownerIdentity = {}, ledger = {}) {
  return {
    ...primaryMember,
    businessCenterOwnerUserId: normalizeText(ownerIdentity?.userId) || null,
    businessCenterOwnerUsername: normalizeText(ownerIdentity?.username),
    businessCenterOwnerEmail: normalizeText(ownerIdentity?.email),
    businessCenterNodeType: BUSINESS_CENTER_NODE_TYPE_PRIMARY,
    businessCenterIndex: 0,
    businessCenterLabel: '',
    businessCenterActivatedAt: '',
    businessCenterPinnedSide: '',
    legacyLeadershipCompletedTierCount: toWholeNumber(ledger?.completedLegacyTierCount, primaryMember?.legacyLeadershipCompletedTierCount),
    businessCentersEarnedLifetime: toWholeNumber(ledger?.earnedLifetime, primaryMember?.businessCentersEarnedLifetime),
    businessCentersActivated: toWholeNumber(ledger?.activated, primaryMember?.businessCentersActivated),
    businessCentersPending: toWholeNumber(ledger?.pendingTotal, primaryMember?.businessCentersPending),
    businessCentersOverflowPending: toWholeNumber(ledger?.overflowPending, primaryMember?.businessCentersOverflowPending),
    businessCentersCount: toWholeNumber(ledger?.activated, primaryMember?.businessCentersCount),
  };
}

function syncOwnedMemberOwnership(member = {}, ownerIdentity = {}) {
  return {
    ...member,
    businessCenterOwnerUserId: normalizeText(ownerIdentity?.userId) || null,
    businessCenterOwnerUsername: normalizeText(ownerIdentity?.username),
    businessCenterOwnerEmail: normalizeText(ownerIdentity?.email),
  };
}

function sortBusinessCentersByIndexAndDate(left = {}, right = {}) {
  const indexDiff = toWholeNumber(left?.businessCenterIndex, 0) - toWholeNumber(right?.businessCenterIndex, 0);
  if (indexDiff !== 0) {
    return indexDiff;
  }
  return parseSortableTimestamp(left?.createdAt) - parseSortableTimestamp(right?.createdAt);
}

function mapBusinessCenterNodeForResponse(member = {}) {
  return {
    id: normalizeText(member?.id),
    userId: normalizeText(member?.userId),
    fullName: normalizeText(member?.fullName),
    memberUsername: normalizeText(member?.memberUsername),
    sponsorUsername: normalizeText(member?.sponsorUsername),
    sponsorName: normalizeText(member?.sponsorName),
    placementLeg: normalizeText(member?.placementLeg),
    businessCenterNodeType: normalizeBusinessCenterNodeType(member?.businessCenterNodeType),
    businessCenterIndex: toWholeNumber(member?.businessCenterIndex, 0),
    businessCenterLabel: normalizeText(member?.businessCenterLabel),
    businessCenterPinnedSide: normalizeText(member?.businessCenterPinnedSide),
    businessCenterActivatedAt: normalizeText(member?.businessCenterActivatedAt),
    createdAt: normalizeText(member?.createdAt),
  };
}

function buildBusinessCenterStatusPayload(primaryMember = {}, ownerIdentity = {}, ledger = {}, ownedMembers = []) {
  const safeOwnedMembers = Array.isArray(ownedMembers) ? ownedMembers : [];
  const placeholders = safeOwnedMembers
    .filter((member) => isBusinessCenterPlaceholderMember(member))
    .sort(sortBusinessCentersByIndexAndDate);

  return {
    success: true,
    owner: {
      userId: normalizeText(ownerIdentity?.userId),
      username: normalizeText(ownerIdentity?.username),
      email: normalizeText(ownerIdentity?.email),
      fullName: normalizeText(primaryMember?.fullName),
    },
    activeNode: mapBusinessCenterNodeForResponse(primaryMember),
    placeholders: placeholders.map((placeholder) => mapBusinessCenterNodeForResponse(placeholder)),
    businessCenters: {
      cap: BUSINESS_CENTER_ACTIVATION_CAP,
      completedLegacyTierCount: toWholeNumber(ledger?.completedLegacyTierCount, 0),
      earnedLifetime: toWholeNumber(ledger?.earnedLifetime, 0),
      activated: toWholeNumber(ledger?.activated, 0),
      activatablePending: toWholeNumber(ledger?.activatablePending, 0),
      pendingTotal: toWholeNumber(ledger?.pendingTotal, 0),
      overflowPending: toWholeNumber(ledger?.overflowPending, 0),
      count: toWholeNumber(ledger?.activated, 0),
      isAtCap: Boolean(ledger?.isAtCap),
      isStaffTreeAccount: Boolean(primaryMember?.isStaffTreeAccount),
    },
  };
}

function createUniqueBusinessCenterUsername(baseUsernameInput = '', businessCenterIndex = 1, members = []) {
  const baseUsername = normalizeCredential(baseUsernameInput)
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    || 'member';
  const safeMembers = Array.isArray(members) ? members : [];
  const takenUsernames = new Set(
    safeMembers
      .map((member) => normalizeCredential(member?.memberUsername))
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

function patchDirectSponsorReferencesToPlaceholder(members = [], activeUsernameInput = '', placeholderUsernameInput = '', placeholderLabelInput = '') {
  const safeMembers = Array.isArray(members) ? members : [];
  const activeUsernameKey = normalizeCredential(activeUsernameInput);
  const placeholderUsername = normalizeText(placeholderUsernameInput);
  const placeholderUsernameKey = normalizeCredential(placeholderUsername);
  const placeholderLabel = normalizeText(placeholderLabelInput);

  if (!activeUsernameKey || !placeholderUsername) {
    return safeMembers;
  }

  return safeMembers.map((member) => {
    const memberUsernameKey = normalizeCredential(member?.memberUsername || member?.username);
    if (memberUsernameKey && memberUsernameKey === placeholderUsernameKey) {
      return member;
    }

    const sponsorUsernameKey = normalizeCredential(member?.sponsorUsername);
    const spilloverReferenceKey = normalizeCredential(member?.spilloverParentReference);
    const shouldSwapSponsor = sponsorUsernameKey && sponsorUsernameKey === activeUsernameKey;
    const shouldSwapSpilloverReference = spilloverReferenceKey && spilloverReferenceKey === activeUsernameKey;

    if (!shouldSwapSponsor && !shouldSwapSpilloverReference) {
      return member;
    }

    const nextMember = {
      ...member,
    };

    if (shouldSwapSponsor) {
      nextMember.sponsorUsername = placeholderUsername;
      if (placeholderLabel) {
        nextMember.sponsorName = placeholderLabel;
      }
    }

    if (shouldSwapSpilloverReference) {
      nextMember.spilloverParentReference = placeholderUsername;
    }

    return nextMember;
  });
}

function resolveContextFromMembers(members = [], authenticatedIdentity = {}) {
  const primaryMemberIndex = resolvePrimaryMemberIndex(members, authenticatedIdentity);
  if (primaryMemberIndex < 0) {
    return {
      success: false,
      status: 404,
      error: 'Registered member record was not found for this account.',
    };
  }

  const primaryMember = members[primaryMemberIndex];
  const ownerIdentity = resolveOwnerIdentityFromPrimary(primaryMember, authenticatedIdentity);
  const ownedMemberIndexes = collectOwnedMemberIndexes(members, ownerIdentity, authenticatedIdentity);
  const safeOwnedMemberIndexes = ownedMemberIndexes.includes(primaryMemberIndex)
    ? ownedMemberIndexes
    : [primaryMemberIndex, ...ownedMemberIndexes];
  const ownedMembers = safeOwnedMemberIndexes
    .map((memberIndex) => members[memberIndex])
    .filter(Boolean);
  const ledger = computeBusinessCenterLedger(primaryMember, ownedMembers);

  return {
    success: true,
    primaryMemberIndex,
    primaryMember,
    ownerIdentity,
    ownedMemberIndexes: safeOwnedMemberIndexes,
    ownedMembers,
    ledger,
  };
}

function syncTrackingFieldsAcrossOwnedMembers(members = [], context = {}) {
  const safeMembers = Array.isArray(members) ? members.slice() : [];
  const primaryMemberIndexRaw = Number(context?.primaryMemberIndex);
  const primaryMemberIndex = Number.isFinite(primaryMemberIndexRaw)
    ? Math.floor(primaryMemberIndexRaw)
    : -1;
  if (!Number.isFinite(primaryMemberIndex) || primaryMemberIndex < 0 || !safeMembers[primaryMemberIndex]) {
    return {
      members: safeMembers,
      changed: false,
    };
  }

  let changed = false;
  const ownerIdentity = context?.ownerIdentity || {};
  const ledger = context?.ledger || {};
  const ownedMemberIndexes = Array.isArray(context?.ownedMemberIndexes) ? context.ownedMemberIndexes : [];

  const nextPrimaryMember = applyBusinessCenterTracking(
    syncOwnedMemberOwnership(safeMembers[primaryMemberIndex], ownerIdentity),
    ownerIdentity,
    ledger,
  );

  if (JSON.stringify(nextPrimaryMember) !== JSON.stringify(safeMembers[primaryMemberIndex])) {
    safeMembers[primaryMemberIndex] = nextPrimaryMember;
    changed = true;
  }

  ownedMemberIndexes.forEach((memberIndex) => {
    if (memberIndex === primaryMemberIndex || !safeMembers[memberIndex]) {
      return;
    }

    const existingMember = safeMembers[memberIndex];
    const nextMember = syncOwnedMemberOwnership(existingMember, ownerIdentity);
    if (normalizeBusinessCenterNodeType(nextMember?.businessCenterNodeType) === BUSINESS_CENTER_NODE_TYPE_PLACEHOLDER) {
      nextMember.businessCenterNodeType = BUSINESS_CENTER_NODE_TYPE_PLACEHOLDER;
    }

    if (JSON.stringify(nextMember) !== JSON.stringify(existingMember)) {
      safeMembers[memberIndex] = nextMember;
      changed = true;
    }
  });

  return {
    members: safeMembers,
    changed,
  };
}

async function resolveBusinessCenterStateForMember(memberInput = {}) {
  const authenticatedIdentity = resolveAuthenticatedIdentity(memberInput);
  if (!authenticatedIdentity.userId && !authenticatedIdentity.username && !authenticatedIdentity.email) {
    return {
      success: false,
      status: 400,
      error: 'Authenticated member identity is required.',
    };
  }

  const members = await readRegisteredMembersStore();
  const context = resolveContextFromMembers(members, authenticatedIdentity);
  if (!context.success) {
    return context;
  }

  return {
    success: true,
    status: 200,
    members,
    authenticatedIdentity,
    ...context,
  };
}

export async function listBusinessCentersForMember(memberInput = {}) {
  const contextResult = await resolveBusinessCenterStateForMember(memberInput);
  if (!contextResult.success) {
    return contextResult;
  }

  const trackingSync = syncTrackingFieldsAcrossOwnedMembers(contextResult.members, contextResult);
  if (trackingSync.changed) {
    await writeRegisteredMembersStore(trackingSync.members);
  }

  const refreshedContext = resolveContextFromMembers(
    trackingSync.members,
    contextResult.authenticatedIdentity,
  );
  if (!refreshedContext.success) {
    return refreshedContext;
  }

  return {
    success: true,
    status: 200,
    data: buildBusinessCenterStatusPayload(
      refreshedContext.primaryMember,
      refreshedContext.ownerIdentity,
      refreshedContext.ledger,
      refreshedContext.ownedMembers,
    ),
  };
}

export async function syncBusinessCenterProgressForMember(memberInput = {}, payload = {}) {
  const completedLegacyTierCount = toWholeNumber(payload?.completedLegacyTierCount, Number.NaN);
  if (!Number.isFinite(completedLegacyTierCount)) {
    return {
      success: false,
      status: 400,
      error: 'A valid completedLegacyTierCount is required.',
    };
  }

  const contextResult = await resolveBusinessCenterStateForMember(memberInput);
  if (!contextResult.success) {
    return contextResult;
  }

  const nextMembers = contextResult.members.slice();
  const existingPrimaryMember = nextMembers[contextResult.primaryMemberIndex];
  nextMembers[contextResult.primaryMemberIndex] = {
    ...existingPrimaryMember,
    legacyLeadershipCompletedTierCount: completedLegacyTierCount,
  };

  const nextContext = resolveContextFromMembers(nextMembers, contextResult.authenticatedIdentity);
  if (!nextContext.success) {
    return nextContext;
  }

  const trackingSync = syncTrackingFieldsAcrossOwnedMembers(nextMembers, nextContext);
  const finalMembers = trackingSync.members;
  await writeRegisteredMembersStore(finalMembers);

  const refreshedContext = resolveContextFromMembers(finalMembers, contextResult.authenticatedIdentity);
  if (!refreshedContext.success) {
    return refreshedContext;
  }

  return {
    success: true,
    status: 200,
    data: {
      ...buildBusinessCenterStatusPayload(
        refreshedContext.primaryMember,
        refreshedContext.ownerIdentity,
        refreshedContext.ledger,
        refreshedContext.ownedMembers,
      ),
      progressUpdated: true,
    },
  };
}

export async function activateBusinessCenterForMember(memberInput = {}, payload = {}) {
  const preferredSide = normalizePlacementSide(
    payload?.side
    || payload?.placementSide
    || payload?.pinnedSide,
  );
  if (!preferredSide) {
    return {
      success: false,
      status: 400,
      error: 'Activation side is required (left or right).',
    };
  }

  const contextResult = await resolveBusinessCenterStateForMember(memberInput);
  if (!contextResult.success) {
    return contextResult;
  }

  if (Boolean(contextResult.primaryMember?.isStaffTreeAccount)) {
    return {
      success: false,
      status: 403,
      error: 'Business Center activation is disabled for staff/admin tree accounts.',
      data: buildBusinessCenterStatusPayload(
        contextResult.primaryMember,
        contextResult.ownerIdentity,
        contextResult.ledger,
        contextResult.ownedMembers,
      ),
    };
  }

  if (contextResult.ledger.activatablePending <= 0) {
    return {
      success: false,
      status: 409,
      error: contextResult.ledger.isAtCap
        ? `Maximum of ${BUSINESS_CENTER_ACTIVATION_CAP} active Business Centers has been reached.`
        : 'No Business Center activations are currently available.',
      data: buildBusinessCenterStatusPayload(
        contextResult.primaryMember,
        contextResult.ownerIdentity,
        contextResult.ledger,
        contextResult.ownedMembers,
      ),
    };
  }

  const nextMembers = contextResult.members.slice();
  const previousPrimaryMember = nextMembers[contextResult.primaryMemberIndex];
  const activeUsername = normalizeText(
    contextResult.authenticatedIdentity?.username
    || previousPrimaryMember?.memberUsername,
  );

  if (!activeUsername) {
    return {
      success: false,
      status: 409,
      error: 'Unable to activate Business Center because the active node username is missing.',
    };
  }

  const nextBusinessCenterIndex = Math.max(1, contextResult.ledger.activated + 1);
  const placeholderLabel = `Business Center #${nextBusinessCenterIndex}`;
  const placeholderUsername = createUniqueBusinessCenterUsername(
    activeUsername,
    nextBusinessCenterIndex,
    nextMembers,
  );
  const nowIso = new Date().toISOString();

  const placeholderMember = {
    ...previousPrimaryMember,
    fullName: placeholderLabel,
    memberUsername: placeholderUsername,
    sponsorUsername: activeUsername,
    sponsorName: normalizeText(previousPrimaryMember?.fullName || activeUsername),
    placementLeg: preferredSide,
    isSpillover: false,
    spilloverPlacementSide: '',
    spilloverParentReference: '',
    packageBv: 0,
    starterPersonalPv: 0,
    activityActiveUntilAt: '',
    lastProductPurchaseAt: '',
    lastPurchaseAt: '',
    lastAccountUpgradeAt: '',
    lastAccountUpgradeFromPackage: '',
    lastAccountUpgradeToPackage: '',
    lastAccountUpgradePvGain: 0,
    fastTrackBonusAmount: 0,
    serverCutoffBaselineStarterPersonalPv: 0,
    businessCenterOwnerUserId: normalizeText(contextResult.ownerIdentity?.userId) || null,
    businessCenterOwnerUsername: normalizeText(contextResult.ownerIdentity?.username),
    businessCenterOwnerEmail: normalizeText(contextResult.ownerIdentity?.email),
    businessCenterNodeType: BUSINESS_CENTER_NODE_TYPE_PLACEHOLDER,
    businessCenterIndex: nextBusinessCenterIndex,
    businessCenterLabel: placeholderLabel,
    businessCenterActivatedAt: nowIso,
    businessCenterPinnedSide: preferredSide,
    businessCentersEarnedLifetime: 0,
    businessCentersActivated: 0,
    businessCentersPending: 0,
    businessCentersOverflowPending: 0,
    businessCentersCount: 0,
  };

  const newPrimaryMember = {
    ...previousPrimaryMember,
    id: `reg_${Date.now()}_${randomUUID().slice(0, 8)}`,
    fullName: normalizeText(previousPrimaryMember?.fullName) || normalizeText(contextResult.ownerIdentity?.username),
    memberUsername: activeUsername,
    businessCenterOwnerUserId: normalizeText(contextResult.ownerIdentity?.userId) || null,
    businessCenterOwnerUsername: normalizeText(contextResult.ownerIdentity?.username),
    businessCenterOwnerEmail: normalizeText(contextResult.ownerIdentity?.email),
    businessCenterNodeType: BUSINESS_CENTER_NODE_TYPE_PRIMARY,
    businessCenterIndex: 0,
    businessCenterLabel: '',
    businessCenterActivatedAt: '',
    businessCenterPinnedSide: '',
    createdAt: nowIso,
  };

  nextMembers[contextResult.primaryMemberIndex] = placeholderMember;

  const rewiredMembers = patchDirectSponsorReferencesToPlaceholder(
    nextMembers,
    activeUsername,
    placeholderUsername,
    placeholderLabel,
  );

  rewiredMembers.unshift(newPrimaryMember);

  const nextContext = resolveContextFromMembers(
    rewiredMembers,
    contextResult.authenticatedIdentity,
  );
  if (!nextContext.success) {
    return nextContext;
  }

  const trackingSync = syncTrackingFieldsAcrossOwnedMembers(rewiredMembers, nextContext);
  const finalMembers = trackingSync.members;

  await writeRegisteredMembersStore(finalMembers);

  const refreshedContext = resolveContextFromMembers(
    finalMembers,
    contextResult.authenticatedIdentity,
  );
  if (!refreshedContext.success) {
    return refreshedContext;
  }

  return {
    success: true,
    status: 201,
    data: {
      ...buildBusinessCenterStatusPayload(
        refreshedContext.primaryMember,
        refreshedContext.ownerIdentity,
        refreshedContext.ledger,
        refreshedContext.ownedMembers,
      ),
      activation: {
        side: preferredSide,
        businessCenterIndex: nextBusinessCenterIndex,
        placeholderLabel,
        placeholderUsername,
        activatedAt: nowIso,
      },
    },
  };
}
