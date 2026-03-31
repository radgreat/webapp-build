import { randomInt, randomUUID } from 'crypto';
import { readRegisteredMembersStore, writeRegisteredMembersStore } from '../stores/member.store.js';
import { readMockUsersStore, writeMockUsersStore } from '../stores/user.store.js';
import { readPasswordSetupTokensStore, writePasswordSetupTokensStore } from '../stores/token.store.js';
import { readMockEmailOutboxStore, writeMockEmailOutboxStore } from '../stores/email.store.js';
import {
  normalizeText,
  normalizeCredential,
  normalizeCountryFlag,
  createUniqueUsername,
  generateRandomPassword,
  issuePasswordSetupToken,
  buildPasswordSetupLink,
  resolveAuthAccountAudience,
} from '../utils/auth.helpers.js';

const ACCOUNT_ACTIVITY_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
const DEFAULT_ATTRIBUTION_STORE_CODE = 'REGISTRATION_LOCKED';
const FREE_ACCOUNT_PACKAGE_KEY = 'preferred-customer-pack';
const FREE_ACCOUNT_RANK_LABEL = 'Preferred Customer';
const PLACEMENT_LEG_LEFT = 'left';
const PLACEMENT_LEG_RIGHT = 'right';
const PLACEMENT_LEG_SPILLOVER = 'spillover';
const PLACEMENT_LEG_EXTREME_LEFT = 'extreme-left';
const PLACEMENT_LEG_EXTREME_RIGHT = 'extreme-right';

const FAST_TRACK_PACKAGE_META = {
  [FREE_ACCOUNT_PACKAGE_KEY]: { label: 'Free Account', price: 0, bv: 0 },
  'personal-builder-pack': { label: 'Personal Builder Pack', price: 192, bv: 192 },
  'business-builder-pack': { label: 'Business Builder Pack', price: 360, bv: 360 },
  'infinity-builder-pack': { label: 'Infinity Builder Pack', price: 560, bv: 560 },
  'legacy-builder-pack': { label: 'Legacy Builder Pack', price: 960, bv: 960 },
};

const FAST_TRACK_TIER_META = {
  'personal-pack': { label: 'Personal Pack' },
  'business-pack': { label: 'Business Pack' },
  'achievers-pack': { label: 'Infinity Pack' },
  'legacy-pack': { label: 'Legacy Pack' },
};

const STARTING_RANK_BY_PACKAGE = {
  [FREE_ACCOUNT_PACKAGE_KEY]: FREE_ACCOUNT_RANK_LABEL,
  'personal-builder-pack': 'Personal',
  'business-builder-pack': 'Business',
  'infinity-builder-pack': 'Infinity',
  'legacy-builder-pack': 'Legacy',
};

const FAST_TRACK_RATE_BY_TIER = {
  'personal-pack': 0.075,
  'business-pack': 0.10,
  'achievers-pack': 0.125,
  'legacy-pack': 0.20,
};

const FAST_TRACK_TIER_BY_PACKAGE = {
  [FREE_ACCOUNT_PACKAGE_KEY]: 'personal-pack',
  'personal-builder-pack': 'personal-pack',
  'business-builder-pack': 'business-pack',
  'infinity-builder-pack': 'achievers-pack',
  'legacy-builder-pack': 'legacy-pack',
};

function normalizeStoreCode(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '');
}

function createStoreCodeSuffix(seedValue, fallbackSuffix = '1000') {
  const normalizedSeed = String(seedValue || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
  if (normalizedSeed.length >= 4) {
    return normalizedSeed.slice(0, 4);
  }
  const fallback = String(fallbackSuffix || '1000')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '') || '1000';
  return `${normalizedSeed}${fallback}`.slice(0, 4);
}

function collectExistingStoreCodes(users) {
  const existingCodes = new Set();
  (Array.isArray(users) ? users : []).forEach((user) => {
    [
      user?.storeCode,
      user?.publicStoreCode,
      user?.attributionStoreCode,
    ].forEach((candidateCode) => {
      const normalizedCode = normalizeStoreCode(candidateCode);
      if (normalizedCode) {
        existingCodes.add(normalizedCode);
      }
    });
  });
  return existingCodes;
}

function createUniqueStoreCode(existingCodes, prefix, preferredSuffix) {
  const normalizedPrefix = String(prefix || 'CHG')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '') || 'CHG';
  const normalizedPreferredSuffix = createStoreCodeSuffix(preferredSuffix);
  const safeExistingCodes = existingCodes instanceof Set ? existingCodes : new Set();

  const preferredCode = `${normalizedPrefix}-${normalizedPreferredSuffix}`;
  if (!safeExistingCodes.has(preferredCode)) {
    safeExistingCodes.add(preferredCode);
    return preferredCode;
  }

  for (let index = 0; index < 250; index += 1) {
    const randomSuffix = String(randomInt(1000, 10000));
    const candidate = `${normalizedPrefix}-${randomSuffix}`;
    if (!safeExistingCodes.has(candidate)) {
      safeExistingCodes.add(candidate);
      return candidate;
    }
  }

  const timestampSuffix = String(Date.now()).slice(-4);
  const fallbackCode = `${normalizedPrefix}-${timestampSuffix}`;
  safeExistingCodes.add(fallbackCode);
  return fallbackCode;
}

function resolveSponsorAttributionStoreCode(sponsorUser) {
  return normalizeStoreCode(
    sponsorUser?.storeCode
    || sponsorUser?.publicStoreCode
    || sponsorUser?.attributionStoreCode,
  ) || DEFAULT_ATTRIBUTION_STORE_CODE;
}

function resolveStartingRankFromEnrollmentPackage(packageKey) {
  const normalizedPackageKey = normalizeCredential(packageKey);
  return STARTING_RANK_BY_PACKAGE[normalizedPackageKey] || '';
}

function normalizeRankLabelForDisplay(value) {
  const rankLabel = normalizeText(value);
  if (!rankLabel) {
    return '';
  }

  const normalizedRankLabel = normalizeCredential(rankLabel);

  if (normalizedRankLabel === 'starter') {
    return '';
  }
  if (
    normalizedRankLabel === 'preferred customer'
    || normalizedRankLabel === 'preferred'
    || normalizedRankLabel === 'free account'
    || normalizedRankLabel === 'free'
  ) {
    return FREE_ACCOUNT_RANK_LABEL;
  }
  if (
    normalizedRankLabel === 'personal'
    || normalizedRankLabel === 'personal pack'
    || normalizedRankLabel === 'personal rank'
  ) {
    return 'Personal';
  }
  if (
    normalizedRankLabel === 'business'
    || normalizedRankLabel === 'business pack'
    || normalizedRankLabel === 'business rank'
  ) {
    return 'Business';
  }
  if (
    normalizedRankLabel === 'achievers pack'
    || normalizedRankLabel === 'infinity'
    || normalizedRankLabel === 'infinity pack'
    || normalizedRankLabel === 'infinity rank'
  ) {
    return 'Infinity';
  }
  if (
    normalizedRankLabel === 'legacy'
    || normalizedRankLabel === 'legacy pack'
    || normalizedRankLabel === 'legacy rank'
  ) {
    return 'Legacy';
  }

  return rankLabel;
}

function normalizePlacementLeg(value, options = {}) {
  const allowSpillover = options.allowSpillover !== false;
  const fallback = typeof options.fallback === 'string' ? options.fallback : PLACEMENT_LEG_LEFT;
  const normalizedPlacementLeg = normalizeCredential(value);

  if (normalizedPlacementLeg === PLACEMENT_LEG_RIGHT) {
    return PLACEMENT_LEG_RIGHT;
  }

  if (
    normalizedPlacementLeg === PLACEMENT_LEG_EXTREME_LEFT
    || normalizedPlacementLeg === 'extremeleft'
    || normalizedPlacementLeg === 'extreme_left'
    || normalizedPlacementLeg === 'extreme left'
  ) {
    return PLACEMENT_LEG_EXTREME_LEFT;
  }

  if (
    normalizedPlacementLeg === PLACEMENT_LEG_EXTREME_RIGHT
    || normalizedPlacementLeg === 'extremeright'
    || normalizedPlacementLeg === 'extreme_right'
    || normalizedPlacementLeg === 'extreme right'
  ) {
    return PLACEMENT_LEG_EXTREME_RIGHT;
  }

  if (allowSpillover && normalizedPlacementLeg === PLACEMENT_LEG_SPILLOVER) {
    return PLACEMENT_LEG_SPILLOVER;
  }
  if (
    allowSpillover
    && (
      normalizedPlacementLeg === 'spillover-right'
      || normalizedPlacementLeg === 'spillover_right'
      || normalizedPlacementLeg === 'spillover right'
      || normalizedPlacementLeg === 'spillover-left'
      || normalizedPlacementLeg === 'spillover_left'
      || normalizedPlacementLeg === 'spillover left'
    )
  ) {
    return PLACEMENT_LEG_SPILLOVER;
  }

  return fallback;
}

function roundCurrencyAmount(value) {
  return Math.round((Math.max(0, Number(value) || 0)) * 100) / 100;
}

function resolveFastTrackTierFromRank(rankValue) {
  const normalizedRank = normalizeCredential(normalizeRankLabelForDisplay(rankValue));
  if (normalizedRank === 'legacy') {
    return 'legacy-pack';
  }
  if (normalizedRank === 'infinity') {
    return 'achievers-pack';
  }
  if (normalizedRank === 'business') {
    return 'business-pack';
  }
  return 'personal-pack';
}

function resolveFastTrackTierFromSponsorUser(sponsorUser) {
  const sponsorPackageKey = normalizeCredential(sponsorUser?.enrollmentPackage);
  if (FAST_TRACK_TIER_BY_PACKAGE[sponsorPackageKey]) {
    return FAST_TRACK_TIER_BY_PACKAGE[sponsorPackageKey];
  }

  return resolveFastTrackTierFromRank(sponsorUser?.accountRank || sponsorUser?.rank);
}

function resolveFastTrackBonusAmount({ enrollmentPackage, sponsorFastTrackTier, isAdminPlacement }) {
  if (isAdminPlacement) {
    return 0;
  }

  const packagePrice = Number(FAST_TRACK_PACKAGE_META?.[enrollmentPackage]?.price);
  const sponsorRate = Number(FAST_TRACK_RATE_BY_TIER?.[sponsorFastTrackTier]);

  if (!Number.isFinite(packagePrice) || packagePrice <= 0 || !Number.isFinite(sponsorRate) || sponsorRate <= 0) {
    return 0;
  }

  return roundCurrencyAmount(packagePrice * sponsorRate);
}

export async function getRegisteredMembers() {
  const members = await readRegisteredMembersStore();
  return { members };
}

export async function createRegisteredMember(payload) {
  const fullName = normalizeText(payload?.fullName);
  const email = normalizeText(payload?.email);
  const memberUsernameInput = normalizeText(payload?.memberUsername);
  const phone = normalizeText(payload?.phone);
  const notes = normalizeText(payload?.notes);
  const countryFlag = normalizeCountryFlag(payload?.countryFlag);
  const sponsorUsername = normalizeCredential(payload?.sponsorUsername);
  const sponsorName = normalizeText(payload?.sponsorName);
  const isAdminPlacement = Boolean(payload?.isAdminPlacement);
  const enrollmentContext = isAdminPlacement ? 'admin' : 'member';
  const placementLeg = normalizePlacementLeg(payload?.placementLeg, {
    allowSpillover: true,
    fallback: PLACEMENT_LEG_LEFT,
  });
  const placementLegRaw = normalizeCredential(payload?.placementLeg);
  const spilloverPlacementSide = (
    normalizeCredential(payload?.spilloverPlacementSide) === PLACEMENT_LEG_RIGHT
    || placementLegRaw === 'spillover-right'
    || placementLegRaw === 'spillover_right'
    || placementLegRaw === 'spillover right'
  )
    ? PLACEMENT_LEG_RIGHT
    : PLACEMENT_LEG_LEFT;
  const spilloverParentModeInput = normalizeCredential(payload?.spilloverParentMode || 'auto');
  const spilloverParentMode = spilloverParentModeInput === 'manual' ? 'manual' : 'auto';
  const spilloverParentReference = normalizeText(payload?.spilloverParentReference);
  const effectiveSpilloverParentReference = (
    placementLeg === PLACEMENT_LEG_SPILLOVER && spilloverParentMode === 'manual'
  )
    ? spilloverParentReference
    : '';
  const enrollmentPackage = normalizeCredential(payload?.enrollmentPackage);
  const requestedFastTrackTier = normalizeCredential(payload?.fastTrackTier);

  if (!fullName || !email) {
    return {
      success: false,
      status: 400,
      error: 'Full name and email are required.',
    };
  }

  if (!sponsorUsername) {
    return {
      success: false,
      status: 400,
      error: 'Sponsor username is required for member enrollment.',
    };
  }

  if (!FAST_TRACK_PACKAGE_META[enrollmentPackage]) {
    return {
      success: false,
      status: 400,
      error: 'Invalid enrollment package.',
    };
  }

  if (placementLeg === PLACEMENT_LEG_SPILLOVER && spilloverParentMode === 'manual' && !effectiveSpilloverParentReference) {
    return {
      success: false,
      status: 400,
      error: 'Manual spillover placement requires a receiving parent reference.',
    };
  }

  const users = await readMockUsersStore();
  const matchedSponsorUserIndex = users.findIndex(
    (user) => normalizeCredential(user?.username) === sponsorUsername
  );
  let matchedSponsorUser = matchedSponsorUserIndex >= 0
    ? users[matchedSponsorUserIndex]
    : null;
  const resolvedSponsorFastTrackTier = matchedSponsorUser
    ? resolveFastTrackTierFromSponsorUser(matchedSponsorUser)
    : requestedFastTrackTier;

  if (!FAST_TRACK_TIER_META[resolvedSponsorFastTrackTier]) {
    return {
      success: false,
      status: 400,
      error: 'Invalid Fast Track tier.',
    };
  }

  const normalizedEmail = normalizeCredential(email);
  const emailExists = users.some((user) => normalizeCredential(user?.email) === normalizedEmail);

  if (emailExists) {
    return {
      success: false,
      status: 409,
      error: 'A member with this email already exists.',
    };
  }

  const members = await readRegisteredMembersStore();
  const tokens = await readPasswordSetupTokensStore();
  const outbox = await readMockEmailOutboxStore();

  const memberUsername = createUniqueUsername(users, memberUsernameInput, email);
  const existingStoreCodes = collectExistingStoreCodes(users);
  if (matchedSponsorUser) {
    const sponsorStoreCode = normalizeStoreCode(matchedSponsorUser?.storeCode);
    const sponsorPublicStoreCode = normalizeStoreCode(matchedSponsorUser?.publicStoreCode);
    if (!sponsorStoreCode || !sponsorPublicStoreCode) {
      const sponsorStoreSeed = matchedSponsorUser?.username || sponsorUsername || `sponsor-${Date.now()}`;
      const nextSponsorStoreCode = sponsorStoreCode || createUniqueStoreCode(existingStoreCodes, 'M', sponsorStoreSeed);
      const nextSponsorPublicStoreCode = sponsorPublicStoreCode || createUniqueStoreCode(existingStoreCodes, 'CHG', sponsorStoreSeed);
      matchedSponsorUser = {
        ...matchedSponsorUser,
        storeCode: nextSponsorStoreCode,
        publicStoreCode: nextSponsorPublicStoreCode,
      };
      if (matchedSponsorUserIndex >= 0) {
        users[matchedSponsorUserIndex] = matchedSponsorUser;
      }
    }
  }

  const sponsorAttributionStoreCode = resolveSponsorAttributionStoreCode(matchedSponsorUser);
  const publicStoreCode = createUniqueStoreCode(existingStoreCodes, 'CHG', memberUsername);
  const storeCode = createUniqueStoreCode(existingStoreCodes, 'M', memberUsername);
  const temporaryPassword = generateRandomPassword();
  const packageMeta = FAST_TRACK_PACKAGE_META[enrollmentPackage];
  const packagePrice = Number(packageMeta.price);
  const packageBv = Number(packageMeta.bv);
  const startingRank = STARTING_RANK_BY_PACKAGE[enrollmentPackage] || 'Personal';
  const fastTrackBonusAmount = resolveFastTrackBonusAmount({
    enrollmentPackage,
    sponsorFastTrackTier: resolvedSponsorFastTrackTier,
    isAdminPlacement,
  });

  const createdAtDate = new Date();
  const createdAt = createdAtDate.toISOString();
  const activityActiveUntilAt = new Date(createdAtDate.getTime() + ACCOUNT_ACTIVITY_WINDOW_MS).toISOString();
  const userId = `usr_${Date.now()}_${randomUUID().slice(0, 8)}`;

  const newUser = {
    id: userId,
    name: fullName,
    username: memberUsername,
    email,
    countryFlag,
    password: temporaryPassword,
    passwordSetupRequired: true,
    accountStatus: 'pending-password-setup',
    attributionStoreCode: sponsorAttributionStoreCode,
    publicStoreCode,
    storeCode,
    enrollmentPackage,
    enrollmentPackageLabel: packageMeta.label,
    enrollmentPackagePrice: packagePrice,
    enrollmentPackageBv: packageBv,
    starterPersonalPv: packageBv,
    starterTotalCycles: 0,
    rank: startingRank,
    accountRank: startingRank,
    activityActiveUntilAt,
    lastProductPurchaseAt: '',
    lastPurchaseAt: '',
    createdAt,
  };

  const tokenRecord = issuePasswordSetupToken(userId, email);
  const setupLink = buildPasswordSetupLink(tokenRecord.token, email, {
    audience: resolveAuthAccountAudience(newUser),
  });

  const emailLogRecord = {
    id: `mail_${Date.now()}_${randomUUID().slice(0, 8)}`,
    to: email,
    subject: 'Charge account password setup',
    body: `Welcome to Charge. Click the link to set your password: ${setupLink}`,
    setupLink,
    createdAt,
    status: 'queued',
  };

  const createdMember = {
    id: `reg_${Date.now()}_${randomUUID().slice(0, 8)}`,
    userId,
    fullName,
    email,
    countryFlag,
    memberUsername,
    phone,
    notes,
    sponsorUsername,
    sponsorName,
    enrollmentContext,
    isAdminPlacement,
    placementLeg,
    isSpillover: placementLeg === PLACEMENT_LEG_SPILLOVER,
    spilloverPlacementSide: placementLeg === PLACEMENT_LEG_SPILLOVER ? spilloverPlacementSide : '',
    spilloverParentMode: placementLeg === PLACEMENT_LEG_SPILLOVER ? spilloverParentMode : '',
    spilloverParentReference: placementLeg === PLACEMENT_LEG_SPILLOVER ? effectiveSpilloverParentReference : '',
    enrollmentPackage,
    enrollmentPackageLabel: packageMeta.label,
    fastTrackTier: resolvedSponsorFastTrackTier,
    fastTrackTierLabel: FAST_TRACK_TIER_META[resolvedSponsorFastTrackTier].label,
    packagePrice,
    packageBv,
    starterPersonalPv: packageBv,
    rank: startingRank,
    accountRank: startingRank,
    activityActiveUntilAt,
    lastProductPurchaseAt: '',
    lastPurchaseAt: '',
    fastTrackBonusAmount,
    passwordSetupRequired: true,
    passwordSetupEmailQueued: true,
    passwordSetupTokenExpiresAt: tokenRecord.expiresAt,
    passwordSetupLink: setupLink,
    createdAt,
  };

  users.unshift(newUser);
  members.unshift(createdMember);
  tokens.unshift(tokenRecord);
  outbox.unshift(emailLogRecord);

  await writeMockUsersStore(users);
  await writeRegisteredMembersStore(members);
  await writePasswordSetupTokensStore(tokens);
  await writeMockEmailOutboxStore(outbox);

  return {
    success: true,
    status: 201,
    member: createdMember,
  };
}

export async function updateRegisteredMemberPlacement(payload = {}) {
  const memberId = normalizeText(payload?.memberId);
  const sponsorUsername = normalizeCredential(payload?.sponsorUsername);
  const placementLegInput = normalizePlacementLeg(payload?.placementLeg, {
    allowSpillover: true,
    fallback: '',
  });
  const placementLegInputRaw = normalizeCredential(payload?.placementLeg);
  const spilloverPlacementSideInput = normalizeCredential(payload?.spilloverPlacementSide);
  const spilloverParentModeInput = normalizeCredential(payload?.spilloverParentMode);
  const spilloverParentReferenceInput = normalizeText(payload?.spilloverParentReference);

  if (!memberId) {
    return {
      success: false,
      status: 400,
      error: 'Member ID is required.',
    };
  }

  const members = await readRegisteredMembersStore();
  const memberIndex = members.findIndex((member) => normalizeText(member?.id) === memberId);

  if (memberIndex < 0) {
    return {
      success: false,
      status: 404,
      error: 'Registered member not found.',
    };
  }

  const existingMember = members[memberIndex];
  const memberSponsorUsername = normalizeCredential(existingMember?.sponsorUsername);
  if (sponsorUsername && memberSponsorUsername && sponsorUsername !== memberSponsorUsername) {
    return {
      success: false,
      status: 403,
      error: 'You can only update placement for members under your sponsor line.',
    };
  }

  const fallbackPlacementLeg = normalizePlacementLeg(existingMember?.placementLeg, {
    allowSpillover: true,
    fallback: PLACEMENT_LEG_LEFT,
  });
  const placementLeg = normalizePlacementLeg(placementLegInput || fallbackPlacementLeg, {
    allowSpillover: true,
    fallback: PLACEMENT_LEG_LEFT,
  });

  const fallbackSpilloverSide = normalizeCredential(existingMember?.spilloverPlacementSide || 'left');
  const derivedSpilloverSideFromPlacementLeg = (
    placementLegInputRaw === 'spillover-right'
    || placementLegInputRaw === 'spillover_right'
    || placementLegInputRaw === 'spillover right'
  )
    ? PLACEMENT_LEG_RIGHT
    : '';
  const spilloverPlacementSideRaw = spilloverPlacementSideInput || derivedSpilloverSideFromPlacementLeg || fallbackSpilloverSide;
  const spilloverPlacementSide = spilloverPlacementSideRaw === PLACEMENT_LEG_RIGHT
    ? PLACEMENT_LEG_RIGHT
    : PLACEMENT_LEG_LEFT;

  const existingSpilloverParentReference = normalizeText(existingMember?.spilloverParentReference);
  const defaultSpilloverParentMode = existingSpilloverParentReference ? 'manual' : 'auto';
  const spilloverParentModeRaw = spilloverParentModeInput || defaultSpilloverParentMode;
  const spilloverParentMode = spilloverParentModeRaw === 'manual' ? 'manual' : 'auto';

  const effectiveSpilloverParentReference = (
    placementLeg === PLACEMENT_LEG_SPILLOVER && spilloverParentMode === 'manual'
  )
    ? normalizeText(spilloverParentReferenceInput || existingSpilloverParentReference)
    : '';

  if (placementLeg === PLACEMENT_LEG_SPILLOVER && spilloverParentMode === 'manual' && !effectiveSpilloverParentReference) {
    return {
      success: false,
      status: 400,
      error: 'Manual spillover placement requires a receiving parent reference.',
    };
  }

  const updatedMember = {
    ...existingMember,
    placementLeg,
    isSpillover: placementLeg === PLACEMENT_LEG_SPILLOVER,
    spilloverPlacementSide: placementLeg === PLACEMENT_LEG_SPILLOVER ? spilloverPlacementSide : '',
    spilloverParentReference: placementLeg === PLACEMENT_LEG_SPILLOVER ? effectiveSpilloverParentReference : '',
  };

  members[memberIndex] = updatedMember;
  await writeRegisteredMembersStore(members);

  return {
    success: true,
    status: 200,
    member: {
      ...updatedMember,
      spilloverParentMode: placementLeg === PLACEMENT_LEG_SPILLOVER
        ? (effectiveSpilloverParentReference ? 'manual' : 'auto')
        : '',
    },
  };
}

export async function getMemberRanks() {
  const users = await readMockUsersStore();

  const members = users.map((user) => {
    const packageRank = resolveStartingRankFromEnrollmentPackage(user?.enrollmentPackage);
    const normalizedRank = normalizeRankLabelForDisplay(user?.rank);
    const normalizedAccountRank = normalizeRankLabelForDisplay(user?.accountRank);

    return {
      id: user?.id || '',
      username: user?.username || '',
      email: user?.email || '',
      rank: normalizedRank || packageRank,
      accountRank: normalizedAccountRank || normalizedRank || packageRank,
      countryFlag: normalizeCountryFlag(user?.countryFlag),
      activityActiveUntilAt: typeof user?.activityActiveUntilAt === 'string' ? user.activityActiveUntilAt : '',
      lastProductPurchaseAt: typeof user?.lastProductPurchaseAt === 'string' ? user.lastProductPurchaseAt : '',
      lastPurchaseAt: typeof user?.lastPurchaseAt === 'string' ? user.lastPurchaseAt : '',
      createdAt: typeof user?.createdAt === 'string' ? user.createdAt : '',
    };
  });

  return { members };
}


export async function recordMemberPurchase(payload) {
  const userId = normalizeText(payload?.userId);
  const username = normalizeCredential(payload?.username);
  const email = normalizeCredential(payload?.email);
  const pvGain = Math.max(0, Math.floor(Number(payload?.pvGain) || 0));

  if (!userId && !username && !email) {
    return {
      success: false,
      status: 400,
      error: 'A member identifier is required to record purchase activity.',
    };
  }

  const users = await readMockUsersStore();
  const members = await readRegisteredMembersStore();

  const userIndex = users.findIndex((user) => {
    if (userId && String(user?.id || '') === userId) {
      return true;
    }

    const existingUsername = normalizeCredential(user?.username);
    const existingEmail = normalizeCredential(user?.email);

    if (username && existingUsername === username) {
      return true;
    }

    if (email && existingEmail === email) {
      return true;
    }

    return false;
  });

  if (userIndex < 0) {
    return {
      success: false,
      status: 404,
      error: 'Member account not found.',
    };
  }

  const now = new Date();
  const nowIso = now.toISOString();

  const existingUser = users[userIndex];
  const userPackageKey = normalizeCredential(existingUser?.enrollmentPackage);
  const userRankKey = normalizeCredential(
    normalizeRankLabelForDisplay(existingUser?.accountRank || existingUser?.rank)
  );
  const isFreeAccountUser = userPackageKey === FREE_ACCOUNT_PACKAGE_KEY || userRankKey === normalizeCredential(FREE_ACCOUNT_RANK_LABEL);
  const effectivePvGain = isFreeAccountUser ? 0 : pvGain;
  const existingActivityActiveUntil = (
    typeof existingUser?.activityActiveUntilAt === 'string' && existingUser.activityActiveUntilAt.trim()
  )
    ? existingUser.activityActiveUntilAt
    : nowIso;

  const existingActivityMs = Date.parse(existingActivityActiveUntil);
  const baseMs = Number.isFinite(existingActivityMs) && existingActivityMs > now.getTime()
    ? existingActivityMs
    : now.getTime();

  const nextActivityActiveUntilAt = new Date(
    baseMs + ACCOUNT_ACTIVITY_WINDOW_MS
  ).toISOString();

  const enrollmentPackageBv = Math.max(0, Math.floor(Number(existingUser?.enrollmentPackageBv) || 0));
  const currentStarterPersonalPv = Math.max(
    0,
    Math.floor(Number(existingUser?.starterPersonalPv) || enrollmentPackageBv)
  );
  const nextStarterPersonalPvSafe = currentStarterPersonalPv + effectivePvGain;

  users[userIndex] = {
    ...existingUser,
    starterPersonalPv: nextStarterPersonalPvSafe,
    activityActiveUntilAt: nextActivityActiveUntilAt,
    lastProductPurchaseAt: nowIso,
    lastPurchaseAt: nowIso,
  };

  await writeMockUsersStore(users);

  const matchedUser = users[userIndex];
  const userIdKey = normalizeText(matchedUser?.id);
  const usernameKey = normalizeCredential(matchedUser?.username);
  const emailKey = normalizeCredential(matchedUser?.email);

  const updatedMembers = members.map((member) => {
    const memberIdKey = normalizeText(member?.userId || member?.id);
    const memberUsernameKey = normalizeCredential(member?.memberUsername);
    const memberEmailKey = normalizeCredential(member?.email);

    const matchesMember = (
      (userIdKey && memberIdKey === userIdKey)
      || (usernameKey && memberUsernameKey === usernameKey)
      || (emailKey && memberEmailKey === emailKey)
    );

    if (!matchesMember) {
      return member;
    }

    return {
      ...member,
      starterPersonalPv: nextStarterPersonalPvSafe,
      activityActiveUntilAt: nextActivityActiveUntilAt,
      lastProductPurchaseAt: nowIso,
      lastPurchaseAt: nowIso,
    };
  });

  await writeRegisteredMembersStore(updatedMembers);

  return {
    success: true,
    status: 200,
    user: {
      id: users[userIndex]?.id || '',
      username: users[userIndex]?.username || '',
      email: users[userIndex]?.email || '',
      starterPersonalPv: nextStarterPersonalPvSafe,
      activityActiveUntilAt: nextActivityActiveUntilAt,
      lastProductPurchaseAt: nowIso,
      lastPurchaseAt: nowIso,
    },
    purchase: {
      pvGain: effectivePvGain,
      starterPersonalPv: nextStarterPersonalPvSafe,
    },
  };
}

export async function upgradeMemberAccount(payload) {
  const userId = normalizeText(payload?.userId);
  const username = normalizeCredential(payload?.username);
  const email = normalizeCredential(payload?.email);
  const targetPackageInput = normalizeCredential(payload?.targetPackage);

  const ACCOUNT_UPGRADE_PACKAGE_ORDER = [
    FREE_ACCOUNT_PACKAGE_KEY,
    'personal-builder-pack',
    'business-builder-pack',
    'infinity-builder-pack',
    'legacy-builder-pack',
  ];

  function resolveCurrentPackageKeyForUpgrade(user) {
    const packageKey = normalizeCredential(user?.enrollmentPackage);
    if (FAST_TRACK_PACKAGE_META[packageKey]) {
      return packageKey;
    }
    return '';
  }

  function resolveAccountPackageTierIndex(packageKey) {
    return ACCOUNT_UPGRADE_PACKAGE_ORDER.indexOf(normalizeCredential(packageKey));
  }

  function resolveNextPackageKeyForUpgrade(currentPackageKey) {
    const currentIndex = resolveAccountPackageTierIndex(currentPackageKey);
    if (currentIndex < 0) {
      return '';
    }
    return ACCOUNT_UPGRADE_PACKAGE_ORDER[currentIndex + 1] || '';
  }

  if (!userId && !username && !email) {
    return {
      success: false,
      status: 400,
      error: 'A member identifier is required to process account upgrades.',
    };
  }

  const users = await readMockUsersStore();
  const members = await readRegisteredMembersStore();

  const userIndex = users.findIndex((user) => {
    if (userId && String(user?.id || '') === userId) {
      return true;
    }

    const existingUsername = normalizeCredential(user?.username);
    const existingEmail = normalizeCredential(user?.email);

    if (username && existingUsername === username) {
      return true;
    }

    if (email && existingEmail === email) {
      return true;
    }

    return false;
  });

  if (userIndex < 0) {
    return {
      success: false,
      status: 404,
      error: 'Member account not found.',
    };
  }

  const now = new Date();
  const nowIso = now.toISOString();
  const existingUser = users[userIndex];

  const currentPackageKey = resolveCurrentPackageKeyForUpgrade(existingUser);
  if (!currentPackageKey || !FAST_TRACK_PACKAGE_META[currentPackageKey]) {
    return {
      success: false,
      status: 400,
      error: 'Unable to resolve current package tier for this account.',
    };
  }

  const currentTierIndex = resolveAccountPackageTierIndex(currentPackageKey);
  const highestTierIndex = ACCOUNT_UPGRADE_PACKAGE_ORDER.length - 1;

  if (currentTierIndex < 0) {
    return {
      success: false,
      status: 400,
      error: 'Unable to resolve current package tier for this account.',
    };
  }

  if (currentTierIndex >= highestTierIndex) {
    return {
      success: false,
      status: 409,
      error: 'Your account is already at the highest package tier.',
    };
  }

  const fallbackNextPackageKey = resolveNextPackageKeyForUpgrade(currentPackageKey);
  const targetPackageKey = targetPackageInput || fallbackNextPackageKey;
  const targetTierIndex = resolveAccountPackageTierIndex(targetPackageKey);

  if (targetTierIndex < 0 || !FAST_TRACK_PACKAGE_META[targetPackageKey]) {
    return {
      success: false,
      status: 400,
      error: 'Selected package is invalid.',
    };
  }

  if (targetTierIndex <= currentTierIndex) {
    return {
      success: false,
      status: 409,
      error: targetTierIndex === currentTierIndex
        ? 'Your account is already on this package tier.'
        : 'Downgrade is not allowed. Please choose a higher package tier.',
    };
  }

  const currentPackageMeta = FAST_TRACK_PACKAGE_META[currentPackageKey];
  const nextPackageMeta = FAST_TRACK_PACKAGE_META[targetPackageKey];

  const currentPackageBv = Math.max(
    0,
    Math.floor(Number(existingUser?.enrollmentPackageBv) || Number(currentPackageMeta?.bv) || 0)
  );
  const nextPackageBv = Math.max(
    currentPackageBv,
    Math.floor(Number(nextPackageMeta?.bv) || currentPackageBv)
  );

  const pvGain = Math.max(0, nextPackageBv - currentPackageBv);
  const currentStarterPersonalPv = Math.max(
    0,
    Math.floor(Number(existingUser?.starterPersonalPv) || currentPackageBv)
  );
  const nextStarterPersonalPv = currentStarterPersonalPv + pvGain;

  const nextRank = STARTING_RANK_BY_PACKAGE[targetPackageKey]
    || normalizeRankLabelForDisplay(existingUser?.accountRank || existingUser?.rank)
    || 'Personal';

  const existingActivityActiveUntil = (
    typeof existingUser?.activityActiveUntilAt === 'string' && existingUser.activityActiveUntilAt.trim()
  )
    ? existingUser.activityActiveUntilAt
    : nowIso;

  const existingActivityMs = Date.parse(existingActivityActiveUntil);
  const baseMs = Number.isFinite(existingActivityMs) && existingActivityMs > now.getTime()
    ? existingActivityMs
    : now.getTime();

  const nextActivityActiveUntilAt = new Date(
    baseMs + ACCOUNT_ACTIVITY_WINDOW_MS
  ).toISOString();

  users[userIndex] = {
    ...existingUser,
    enrollmentPackage: targetPackageKey,
    enrollmentPackageLabel: nextPackageMeta.label,
    enrollmentPackagePrice: Number(nextPackageMeta.price),
    enrollmentPackageBv: nextPackageBv,
    starterPersonalPv: nextStarterPersonalPv,
    rank: nextRank,
    accountRank: nextRank,
    activityActiveUntilAt: nextActivityActiveUntilAt,
    lastProductPurchaseAt: nowIso,
    lastPurchaseAt: nowIso,
    lastAccountUpgradeAt: nowIso,
    lastAccountUpgradeFromPackage: currentPackageKey,
    lastAccountUpgradeToPackage: targetPackageKey,
    lastAccountUpgradePvGain: pvGain,
  };

  const matchedUser = users[userIndex];
  const userIdKey = normalizeText(matchedUser?.id);
  const usernameKey = normalizeCredential(matchedUser?.username);
  const emailKey = normalizeCredential(matchedUser?.email);

  let updatedMemberRecord = null;

  const updatedMembers = members.map((member) => {
    const memberIdKey = normalizeText(member?.userId || member?.id);
    const memberUsernameKey = normalizeCredential(member?.memberUsername);
    const memberEmailKey = normalizeCredential(member?.email);

    const matchesMember = (
      (userIdKey && memberIdKey === userIdKey)
      || (usernameKey && memberUsernameKey === usernameKey)
      || (emailKey && memberEmailKey === emailKey)
    );

    if (!matchesMember) {
      return member;
    }

    const upgradedMember = {
      ...member,
      enrollmentPackage: targetPackageKey,
      enrollmentPackageLabel: nextPackageMeta.label,
      packagePrice: Number(nextPackageMeta.price),
      packageBv: nextPackageBv,
      starterPersonalPv: nextStarterPersonalPv,
      rank: nextRank,
      accountRank: nextRank,
      activityActiveUntilAt: nextActivityActiveUntilAt,
      lastProductPurchaseAt: nowIso,
      lastPurchaseAt: nowIso,
      lastAccountUpgradeAt: nowIso,
      lastAccountUpgradeFromPackage: currentPackageKey,
      lastAccountUpgradeToPackage: targetPackageKey,
      lastAccountUpgradePvGain: pvGain,
    };

    updatedMemberRecord = upgradedMember;
    return upgradedMember;
  });

  await writeMockUsersStore(users);
  await writeRegisteredMembersStore(updatedMembers);

  return {
    success: true,
    status: 200,
    user: {
      id: users[userIndex]?.id || '',
      username: users[userIndex]?.username || '',
      email: users[userIndex]?.email || '',
      enrollmentPackage: targetPackageKey,
      enrollmentPackageLabel: nextPackageMeta.label,
      enrollmentPackagePrice: Number(nextPackageMeta.price),
      enrollmentPackageBv: nextPackageBv,
      starterPersonalPv: nextStarterPersonalPv,
      rank: nextRank,
      accountRank: nextRank,
      activityActiveUntilAt: nextActivityActiveUntilAt,
      lastProductPurchaseAt: nowIso,
      lastPurchaseAt: nowIso,
    },
    member: updatedMemberRecord,
    upgrade: {
      fromPackage: currentPackageKey,
      toPackage: targetPackageKey,
      price: Number(nextPackageMeta.price),
      bv: nextPackageBv,
      pvGain,
    },
  };
}
