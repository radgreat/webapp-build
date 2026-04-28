import { randomInt, randomUUID } from 'crypto';
import pool from '../db/db.js';
import {
  readRegisteredMembersStore,
  writeRegisteredMembersStore,
  upsertRegisteredMemberRecord,
} from '../stores/member.store.js';
import {
  readMockStoreInvoicesStore,
  resolveNextStoreInvoiceId,
} from '../stores/invoice.store.js';
import {
  readMockUsersStore,
  writeMockUsersStore,
  upsertMockUserRecord,
  findUserByUsername,
  findUserByEmail,
  isUsernameTaken,
  isStoreCodeTaken,
} from '../stores/user.store.js';
import { upsertPasswordSetupTokenRecord } from '../stores/token.store.js';
import { insertMockEmailOutboxRecord } from '../stores/email.store.js';
import { createStoreInvoice, syncStoreInvoiceStripeDetails } from './invoice.service.js';
import {
  linkStripeCustomerToUserIdentity,
  resolveOrCreateStripeCustomerForUserIdentity,
  resolveStripeClient,
  resolveStripeCustomerId,
} from './stripe-client.service.js';
import {
  normalizeText,
  normalizeCredential,
  normalizeCountryFlag,
  normalizeUsernameCandidate,
  generateRandomPassword,
  issuePasswordSetupToken,
  buildPasswordSetupLink,
  resolveAuthAccountAudience,
} from '../utils/auth.helpers.js';
import {
  resolveMemberActivityStateByPersonalBv,
  resolveMemberPersonalBvSnapshot,
} from '../utils/member-activity.helpers.js';
import {
  MEMBERSHIP_PLACEMENT_RESERVATION_PACKAGE_KEY,
  MEMBERSHIP_PLACEMENT_RESERVATION_PACKAGE_LABEL,
  isMembershipPlacementReservationPackage,
  isPendingOrReservationMember,
  buildAccountUpgradeRequiredResult,
} from '../utils/member-capability.helpers.js';
import {
  readCommissionContainerByUserId,
  upsertCommissionContainerByUserId,
} from '../stores/commission-container.store.js';
import { createFastTrackCommissionLedgerEntry } from './ledger.service.js';

const DEFAULT_ATTRIBUTION_STORE_CODE = 'REGISTRATION_LOCKED';
const DEFAULT_ENROLLMENT_RETURN_PATH = '/binary-tree-next.html';
const STRIPE_METADATA_VALUE_LIMIT = 500;
const ENROLLMENT_PAYMENT_FLOW = 'member-enrollment';
const FREE_ACCOUNT_PACKAGE_KEY = 'preferred-customer-pack';
const FREE_ACCOUNT_RANK_LABEL = 'Preferred Customer';
const STORE_LINK_CODE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const DEFAULT_STORE_LINK_CODE_LENGTH = 10;
const MIN_STORE_LINK_CODE_LENGTH = 6;
const MAX_STORE_LINK_CODE_LENGTH = 24;
const PLACEMENT_LEG_LEFT = 'left';
const PLACEMENT_LEG_RIGHT = 'right';
const PLACEMENT_LEG_SPILLOVER = 'spillover';
const PLACEMENT_LEG_EXTREME_LEFT = 'extreme-left';
const PLACEMENT_LEG_EXTREME_RIGHT = 'extreme-right';
const BUSINESS_CENTER_NODE_TYPE_MAIN_CENTER = 'main_center';
const BUSINESS_CENTER_NODE_TYPE_BUSINESS_CENTER = 'business_center';
const BUSINESS_CENTER_NODE_TYPE_STAFF_ADMIN = 'staff_admin';
const BUSINESS_CENTER_NODE_TYPE_LEGACY_PLACEHOLDER = 'legacy_placeholder';

const FAST_TRACK_PACKAGE_META = {
  [FREE_ACCOUNT_PACKAGE_KEY]: { label: 'Free Account', price: 0, bv: 0 },
  [MEMBERSHIP_PLACEMENT_RESERVATION_PACKAGE_KEY]: {
    label: MEMBERSHIP_PLACEMENT_RESERVATION_PACKAGE_LABEL,
    price: 49.99,
    bv: 0,
    canEarn: false,
    canEnroll: false,
    canSponsor: false,
    storeLinkEnabled: false,
    binaryTreeViewOnly: true,
    isReservationPlan: true,
  },
  'personal-builder-pack': { label: 'Personal Builder Pack', price: 192, bv: 150 },
  'business-builder-pack': { label: 'Business Builder Pack', price: 384, bv: 300 },
  'infinity-builder-pack': { label: 'Infinity Builder Pack', price: 640, bv: 500 },
  'legacy-builder-pack': { label: 'Legacy Builder Pack', price: 1280, bv: 1000 },
};
const PACKAGE_PRODUCT_BV = 50;
const PACKAGE_PRODUCT_PRICE_USD = 64;
const PACKAGE_PRODUCT_COUNT_BY_KEY = {
  [FREE_ACCOUNT_PACKAGE_KEY]: 0,
  [MEMBERSHIP_PLACEMENT_RESERVATION_PACKAGE_KEY]: 0,
  'personal-builder-pack': 3,
  'business-builder-pack': 6,
  'infinity-builder-pack': 10,
  'legacy-builder-pack': 20,
};
const ACCOUNT_UPGRADE_SPLIT_PRODUCT_META = Object.freeze({
  metacharge: Object.freeze({
    key: 'metacharge',
    label: 'MetaCharge',
  }),
  metaroast: Object.freeze({
    key: 'metaroast',
    label: 'MetaRoast',
  }),
});
const ACCOUNT_UPGRADE_DEFAULT_SPLIT_SELECTED_PRODUCT_KEY = 'metaroast';
const ACCOUNT_PACKAGE_PRODUCT_KEY_SPLIT = 'split';
const ACCOUNT_UPGRADE_PRODUCT_MODE_ALL_METACHARGE = 'all-metacharge';
const ACCOUNT_UPGRADE_PRODUCT_MODE_ALL_METAROAST = 'all-metaroast';
const ACCOUNT_UPGRADE_PRODUCT_MODE_SPLIT = 'split';
const ACCOUNT_UPGRADE_DEFAULT_PRODUCT_MODE = ACCOUNT_UPGRADE_PRODUCT_MODE_ALL_METACHARGE;
const ENROLLMENT_DEFAULT_PRODUCT_KEY = 'metacharge';
const ACCOUNT_UPGRADE_SPLIT_ELIGIBLE_PACKAGE_KEY_SET = new Set([
  'business-builder-pack',
  'infinity-builder-pack',
  'legacy-builder-pack',
]);

const FAST_TRACK_TIER_META = {
  'personal-pack': { label: 'Personal Pack' },
  'business-pack': { label: 'Business Pack' },
  'achievers-pack': { label: 'Infinity Pack' },
  'legacy-pack': { label: 'Legacy Pack' },
};

const STARTING_RANK_BY_PACKAGE = {
  [FREE_ACCOUNT_PACKAGE_KEY]: FREE_ACCOUNT_RANK_LABEL,
  [MEMBERSHIP_PLACEMENT_RESERVATION_PACKAGE_KEY]: 'Personal',
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
  [MEMBERSHIP_PLACEMENT_RESERVATION_PACKAGE_KEY]: 'personal-pack',
  'personal-builder-pack': 'personal-pack',
  'business-builder-pack': 'business-pack',
  'infinity-builder-pack': 'achievers-pack',
  'legacy-builder-pack': 'legacy-pack',
};
const FREE_ACCOUNT_RANK_KEY_SET = new Set([
  'preferred customer',
  'preferred',
  'free account',
  'free',
]);

function resolvePendingEnrollmentRestrictionResult(isAdminPlacement, authenticatedMember) {
  if (isAdminPlacement) {
    return null;
  }
  if (!isPendingOrReservationMember(authenticatedMember)) {
    return null;
  }
  return buildAccountUpgradeRequiredResult(403);
}

function toWholeNumber(value, fallback = 0) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return Math.max(0, Math.floor(Number(fallback) || 0));
  }
  return Math.max(0, Math.floor(numeric));
}

function normalizeBusinessCenterNodeType(value) {
  const normalized = normalizeCredential(value);
  if (normalized === BUSINESS_CENTER_NODE_TYPE_BUSINESS_CENTER || normalized === 'business-center') {
    return BUSINESS_CENTER_NODE_TYPE_BUSINESS_CENTER;
  }
  if (normalized === BUSINESS_CENTER_NODE_TYPE_STAFF_ADMIN || normalized === 'staff-admin') {
    return BUSINESS_CENTER_NODE_TYPE_STAFF_ADMIN;
  }
  if (
    normalized === BUSINESS_CENTER_NODE_TYPE_LEGACY_PLACEHOLDER
    || normalized === 'legacy-placeholder'
    || normalized === 'placeholder'
  ) {
    return BUSINESS_CENTER_NODE_TYPE_LEGACY_PLACEHOLDER;
  }
  return BUSINESS_CENTER_NODE_TYPE_MAIN_CENTER;
}

function isBusinessCenterPlaceholderMember(member = {}) {
  return normalizeBusinessCenterNodeType(member?.businessCenterNodeType) === BUSINESS_CENTER_NODE_TYPE_LEGACY_PLACEHOLDER;
}

function isBusinessCenterAuxiliaryNode(member = {}) {
  const nodeType = normalizeBusinessCenterNodeType(member?.businessCenterNodeType);
  const businessCenterIndex = toWholeNumber(member?.businessCenterIndex, 0);
  return nodeType === BUSINESS_CENTER_NODE_TYPE_BUSINESS_CENTER || businessCenterIndex > 0;
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

function resolvePrimaryMemberIndexForIdentity(members = [], identity = {}) {
  const safeMembers = Array.isArray(members) ? members : [];
  const matchingMemberIndexes = safeMembers
    .map((member, index) => ({ member, index }))
    .filter(({ member }) => doesMemberMatchIdentity(member, identity));

  if (!matchingMemberIndexes.length) {
    return -1;
  }

  const mainCenterMatches = matchingMemberIndexes
    .filter(({ member }) => normalizeBusinessCenterNodeType(member?.businessCenterNodeType) === BUSINESS_CENTER_NODE_TYPE_MAIN_CENTER);
  if (mainCenterMatches.length > 0) {
    const usernameKey = normalizeCredential(identity?.username);
    if (usernameKey) {
      const strictUsernameMainMatch = mainCenterMatches.find(({ member }) => (
        normalizeCredential(member?.memberUsername || member?.username) === usernameKey
      ));
      if (strictUsernameMainMatch) {
        return strictUsernameMainMatch.index;
      }
    }
    return mainCenterMatches[0].index;
  }

  const nonPlaceholderMatches = matchingMemberIndexes
    .filter(({ member }) => !isBusinessCenterPlaceholderMember(member));
  if (nonPlaceholderMatches.length === 0) {
    return matchingMemberIndexes[0].index;
  }

  const usernameKey = normalizeCredential(identity?.username);
  if (usernameKey) {
    const strictUsernameMatch = nonPlaceholderMatches.find(({ member }) => (
      normalizeCredential(member?.memberUsername || member?.username) === usernameKey
    ));
    if (strictUsernameMatch) {
      return strictUsernameMatch.index;
    }
  }

  return nonPlaceholderMatches[0].index;
}

function normalizeStoreCode(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '');
}

function clampStoreLinkCodeLength(value, fallback = DEFAULT_STORE_LINK_CODE_LENGTH) {
  const numeric = Number.parseInt(String(value || ''), 10);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }
  return Math.min(MAX_STORE_LINK_CODE_LENGTH, Math.max(MIN_STORE_LINK_CODE_LENGTH, numeric));
}

function createRandomStoreLinkCode(length = DEFAULT_STORE_LINK_CODE_LENGTH) {
  const resolvedLength = clampStoreLinkCodeLength(length, DEFAULT_STORE_LINK_CODE_LENGTH);
  let generatedCode = '';
  for (let index = 0; index < resolvedLength; index += 1) {
    const nextCharacterIndex = randomInt(0, STORE_LINK_CODE_ALPHABET.length);
    generatedCode += STORE_LINK_CODE_ALPHABET[nextCharacterIndex];
  }
  return generatedCode;
}

function composeUsernameCandidate(base, suffix) {
  const safeBase = String(base || '').trim().toLowerCase();
  const numericSuffix = Number(suffix);
  if (!safeBase) {
    return '';
  }
  if (!Number.isFinite(numericSuffix) || numericSuffix <= 1) {
    return safeBase.slice(0, 24);
  }

  const suffixText = String(Math.floor(numericSuffix));
  const maxBaseLength = Math.max(1, 24 - suffixText.length);
  return `${safeBase.slice(0, maxBaseLength)}${suffixText}`;
}

async function createUniqueUsernameWithLookup(requestedUsername, email, options = {}) {
  const baseCandidate = normalizeUsernameCandidate(requestedUsername)
    || normalizeUsernameCandidate(String(email || '').split('@')[0])
    || `member${randomInt(1000, 10000)}`;
  const safeBase = baseCandidate.slice(0, 24) || `member${randomInt(1000, 10000)}`;
  const client = options?.client;

  for (let suffix = 1; suffix < 500; suffix += 1) {
    const candidate = composeUsernameCandidate(safeBase, suffix);
    if (!candidate) {
      continue;
    }
    const taken = await isUsernameTaken(candidate, { client });
    if (!taken) {
      return candidate;
    }
  }

  const fallback = composeUsernameCandidate(`${safeBase}${String(Date.now()).slice(-6)}`, 1)
    || `member${randomInt(1000, 10000)}`;
  const fallbackTaken = await isUsernameTaken(fallback, { client });
  return fallbackTaken ? `member${Date.now()}` : fallback;
}

async function createUniqueStoreCode(options = {}) {
  const configuredLength = clampStoreLinkCodeLength(
    options?.length ?? process.env.STORE_LINK_CODE_LENGTH,
    DEFAULT_STORE_LINK_CODE_LENGTH,
  );
  const safeReservedCodes = options?.reservedStoreCodes instanceof Set
    ? options.reservedStoreCodes
    : new Set();
  const client = options?.client;

  const tryReserve = async (candidateInput) => {
    const candidate = normalizeStoreCode(candidateInput);
    if (!candidate || safeReservedCodes.has(candidate)) {
      return '';
    }
    const taken = await isStoreCodeTaken(candidate, { client });
    if (taken) {
      return '';
    }
    safeReservedCodes.add(candidate);
    return candidate;
  };

  for (let index = 0; index < 700; index += 1) {
    const candidate = createRandomStoreLinkCode(configuredLength);
    const reservedCandidate = await tryReserve(candidate);
    if (reservedCandidate) {
      return reservedCandidate;
    }
  }

  const fallbackCode = normalizeStoreCode(randomUUID().replace(/-/g, '')).slice(0, configuredLength);
  const reservedFallbackCode = await tryReserve(fallbackCode);
  if (reservedFallbackCode) {
    return reservedFallbackCode;
  }

  for (let attempt = 0; attempt < 300; attempt += 1) {
    const candidate = createRandomStoreLinkCode(configuredLength);
    const reservedCandidate = await tryReserve(candidate);
    if (reservedCandidate) {
      return reservedCandidate;
    }
  }

  throw new Error('Unable to generate a unique random store code.');
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

function resolvePlacementSideFromLeg(placementLegInput, spilloverPlacementSideInput = PLACEMENT_LEG_LEFT) {
  const placementLeg = normalizePlacementLeg(placementLegInput, {
    allowSpillover: true,
    fallback: PLACEMENT_LEG_LEFT,
  });
  if (
    placementLeg === PLACEMENT_LEG_RIGHT
    || placementLeg === PLACEMENT_LEG_EXTREME_RIGHT
  ) {
    return PLACEMENT_LEG_RIGHT;
  }
  if (placementLeg === PLACEMENT_LEG_SPILLOVER) {
    return normalizeCredential(spilloverPlacementSideInput) === PLACEMENT_LEG_RIGHT
      ? PLACEMENT_LEG_RIGHT
      : PLACEMENT_LEG_LEFT;
  }
  return PLACEMENT_LEG_LEFT;
}

function isBinaryTreePlacementEligibleMember(member = {}) {
  if (isBusinessCenterPlaceholderMember(member) || isBusinessCenterAuxiliaryNode(member)) {
    return false;
  }

  const packageKey = normalizeCredential(member?.enrollmentPackage);
  if (packageKey === FREE_ACCOUNT_PACKAGE_KEY) {
    return false;
  }

  const normalizedRank = normalizeCredential(
    normalizeRankLabelForDisplay(member?.accountRank || member?.rank),
  );
  if (FREE_ACCOUNT_RANK_KEY_SET.has(normalizedRank)) {
    return false;
  }

  return true;
}

function resolveSponsorFirstLevelLegOccupancy(members = [], sponsorUsernameInput = '') {
  const sponsorUsername = normalizeCredential(sponsorUsernameInput);
  if (!sponsorUsername) {
    return {
      left: false,
      right: false,
    };
  }

  let leftOccupied = false;
  let rightOccupied = false;

  for (const member of Array.isArray(members) ? members : []) {
    const safeMember = member && typeof member === 'object' ? member : null;
    if (!safeMember || !isBinaryTreePlacementEligibleMember(safeMember)) {
      continue;
    }

    const memberSponsorUsername = normalizeCredential(safeMember?.sponsorUsername || safeMember?.sponsor_username);
    if (!memberSponsorUsername || memberSponsorUsername !== sponsorUsername) {
      continue;
    }

    const memberPlacementLeg = normalizePlacementLeg(safeMember?.placementLeg, {
      allowSpillover: true,
      fallback: PLACEMENT_LEG_LEFT,
    });
    if (memberPlacementLeg === PLACEMENT_LEG_SPILLOVER) {
      continue;
    }

    const placementSide = resolvePlacementSideFromLeg(
      memberPlacementLeg,
      safeMember?.spilloverPlacementSide,
    );
    if (placementSide === PLACEMENT_LEG_RIGHT) {
      rightOccupied = true;
    } else {
      leftOccupied = true;
    }

    if (leftOccupied && rightOccupied) {
      break;
    }
  }

  return {
    left: leftOccupied,
    right: rightOccupied,
  };
}

async function resolveServerEnforcedEnrollmentPlacement(payload = {}) {
  const isAdminPlacement = Boolean(payload?.isAdminPlacement);
  const requestedSponsorUsername = normalizeCredential(payload?.sponsorUsername);
  const requestedPlacementLeg = normalizePlacementLeg(payload?.placementLeg, {
    allowSpillover: true,
    fallback: PLACEMENT_LEG_LEFT,
  });
  const requestedSpilloverSide = (
    normalizeCredential(payload?.spilloverPlacementSide) === PLACEMENT_LEG_RIGHT
  )
    ? PLACEMENT_LEG_RIGHT
    : PLACEMENT_LEG_LEFT;
  const requestedPlacementSide = resolvePlacementSideFromLeg(
    requestedPlacementLeg,
    requestedSpilloverSide,
  );
  const requestedSpilloverParentMode = normalizeCredential(payload?.spilloverParentMode || 'auto') === 'manual'
    ? 'manual'
    : 'auto';
  const requestedSpilloverParentReference = normalizeText(payload?.spilloverParentReference);
  const authenticatedMember = payload?.authenticatedMember && typeof payload.authenticatedMember === 'object'
    ? payload.authenticatedMember
    : null;
  const memberActorUsername = normalizeCredential(
    authenticatedMember?.username
    || authenticatedMember?.memberUsername
    || payload?.memberActorUsername
    || payload?.enrollerUsername,
  );

  if (isAdminPlacement) {
    const effectiveSponsorUsername = requestedSponsorUsername || memberActorUsername;
    const effectivePlacementLeg = requestedPlacementLeg;
    const effectiveSpilloverSide = effectivePlacementLeg === PLACEMENT_LEG_SPILLOVER
      ? requestedSpilloverSide
      : '';
    const effectiveSpilloverParentMode = effectivePlacementLeg === PLACEMENT_LEG_SPILLOVER
      ? requestedSpilloverParentMode
      : 'auto';
    const effectiveSpilloverParentReference = (
      effectivePlacementLeg === PLACEMENT_LEG_SPILLOVER
      && effectiveSpilloverParentMode === 'manual'
    )
      ? requestedSpilloverParentReference
      : '';

    return {
      actorUsername: memberActorUsername,
      sponsorUsername: effectiveSponsorUsername,
      placementLeg: effectivePlacementLeg,
      spilloverPlacementSide: effectiveSpilloverSide,
      spilloverParentMode: effectiveSpilloverParentMode,
      spilloverParentReference: effectiveSpilloverParentReference,
      forcedByPolicy: false,
      spilloverEnabled: true,
      firstLevelLegs: {
        left: false,
        right: false,
      },
    };
  }

  const actorUsername = memberActorUsername || requestedSponsorUsername;
  if (!actorUsername) {
    return {
      actorUsername: '',
      sponsorUsername: requestedSponsorUsername,
      placementLeg: requestedPlacementLeg,
      spilloverPlacementSide: requestedPlacementLeg === PLACEMENT_LEG_SPILLOVER ? requestedSpilloverSide : '',
      spilloverParentMode: 'auto',
      spilloverParentReference: '',
      forcedByPolicy: false,
      spilloverEnabled: false,
      firstLevelLegs: {
        left: false,
        right: false,
      },
    };
  }

  const members = await readRegisteredMembersStore();
  const firstLevelLegs = resolveSponsorFirstLevelLegOccupancy(members, actorUsername);
  const spilloverEnabled = Boolean(firstLevelLegs.left && firstLevelLegs.right);
  if (spilloverEnabled) {
    const effectiveSpilloverParentReference = requestedSpilloverParentReference;
    const effectiveSpilloverParentMode = effectiveSpilloverParentReference
      ? 'manual'
      : 'auto';
    return {
      actorUsername,
      sponsorUsername: actorUsername,
      placementLeg: PLACEMENT_LEG_SPILLOVER,
      spilloverPlacementSide: requestedPlacementSide,
      spilloverParentMode: effectiveSpilloverParentMode,
      spilloverParentReference: effectiveSpilloverParentReference,
      forcedByPolicy: (
        requestedPlacementLeg !== PLACEMENT_LEG_SPILLOVER
        || requestedSponsorUsername !== actorUsername
      ),
      spilloverEnabled,
      firstLevelLegs,
    };
  }

  const directPlacementLeg = requestedPlacementSide === PLACEMENT_LEG_RIGHT
    ? PLACEMENT_LEG_RIGHT
    : PLACEMENT_LEG_LEFT;
  const directSponsorUsername = actorUsername;

  return {
    actorUsername,
    sponsorUsername: directSponsorUsername,
    placementLeg: directPlacementLeg,
    spilloverPlacementSide: '',
    spilloverParentMode: 'auto',
    spilloverParentReference: '',
    forcedByPolicy: (
      requestedPlacementLeg === PLACEMENT_LEG_SPILLOVER
      || (requestedSponsorUsername && requestedSponsorUsername !== actorUsername)
    ),
    spilloverEnabled,
    firstLevelLegs,
  };
}

function roundCurrencyAmount(value) {
  return Math.round((Math.max(0, Number(value) || 0)) * 100) / 100;
}

function resolveCurrencyMinorAmount(amount) {
  return Math.max(0, Math.round((Number(amount) || 0) * 100));
}

function resolveCheckoutTaxFromTotal(totalAmount, subtotalAmount, discountAmount = 0) {
  const safeTotal = roundCurrencyAmount(totalAmount);
  const safeSubtotal = roundCurrencyAmount(subtotalAmount);
  const safeDiscount = roundCurrencyAmount(discountAmount);
  const taxableAmount = roundCurrencyAmount(Math.max(0, safeSubtotal - safeDiscount));
  return roundCurrencyAmount(Math.max(0, safeTotal - taxableAmount));
}

function sanitizeStripeMetadataValue(value, fallbackValue = '') {
  const normalizedValue = normalizeText(value || fallbackValue);
  if (!normalizedValue) {
    return '';
  }
  return normalizedValue.slice(0, STRIPE_METADATA_VALUE_LIMIT);
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

function resolveEnrollmentStripeReferenceData(reference = {}) {
  const safeReference = reference && typeof reference === 'object' ? reference : {};
  const invoiceObject = safeReference.invoice && typeof safeReference.invoice === 'object'
    ? safeReference.invoice
    : null;

  return {
    stripeCustomerId: normalizeText(safeReference.customerId || safeReference.stripeCustomerId),
    stripePaymentIntentId: normalizeText(safeReference.paymentIntentId || safeReference.stripePaymentIntentId),
    stripeCheckoutSessionId: normalizeText(safeReference.checkoutSessionId || safeReference.stripeCheckoutSessionId),
    stripeInvoiceId: normalizeText(safeReference.invoiceId || invoiceObject?.id),
    stripeInvoiceNumber: normalizeText(safeReference.invoiceNumber || invoiceObject?.number),
    stripeInvoiceHostedUrl: normalizeStripeUrl(safeReference.invoiceHostedUrl || invoiceObject?.hosted_invoice_url),
    stripeInvoicePdfUrl: normalizeStripeUrl(safeReference.invoicePdfUrl || invoiceObject?.invoice_pdf),
    stripePaymentStatus: normalizeText(safeReference.paymentStatus || invoiceObject?.status),
  };
}

function normalizePathname(pathname, fallbackPath = '/') {
  const rawPath = normalizeText(pathname);
  if (!rawPath) {
    return fallbackPath;
  }

  try {
    const parsed = new URL(rawPath, 'http://localhost');
    const normalizedPathname = normalizeText(parsed.pathname) || fallbackPath;
    const normalizedSearch = normalizeText(parsed.search);
    return `${normalizedPathname}${normalizedSearch}`;
  } catch {
    return fallbackPath;
  }
}

function resolveRequestOrigin(context = {}) {
  const contextOrigin = normalizeText(context.origin);
  if (contextOrigin) {
    try {
      const parsed = new URL(contextOrigin);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.origin;
      }
    } catch {
      // Fall through to environment/default origins.
    }
  }

  const envOrigin = normalizeText(process.env.PUBLIC_APP_ORIGIN);
  if (envOrigin) {
    try {
      const parsed = new URL(envOrigin);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.origin;
      }
    } catch {
      // Fall through to localhost fallback.
    }
  }

  const fallbackPort = Number.parseInt(process.env.PORT || '3000', 10) || 3000;
  return `http://localhost:${fallbackPort}`;
}

function resolveEnrollmentCheckoutReturnUrls(origin, returnPath) {
  const safeOrigin = normalizeText(origin);
  const defaultReturnUrl = new URL(DEFAULT_ENROLLMENT_RETURN_PATH, safeOrigin);

  let baseReturnUrl = defaultReturnUrl;
  const resolvedPath = normalizePathname(returnPath, DEFAULT_ENROLLMENT_RETURN_PATH);
  try {
    baseReturnUrl = new URL(resolvedPath, safeOrigin);
  } catch {
    baseReturnUrl = defaultReturnUrl;
  }

  const successUrl = new URL(baseReturnUrl.toString());
  successUrl.searchParams.set('checkout', 'success');
  successUrl.searchParams.set('session_id', '{CHECKOUT_SESSION_ID}');
  const successUrlString = successUrl.toString().replace('%7BCHECKOUT_SESSION_ID%7D', '{CHECKOUT_SESSION_ID}');

  const cancelUrl = new URL(baseReturnUrl.toString());
  cancelUrl.searchParams.set('checkout', 'cancel');
  cancelUrl.searchParams.delete('session_id');

  return {
    successUrl: successUrlString,
    cancelUrl: cancelUrl.toString(),
  };
}

function resolveEnrollmentCheckoutSummary(enrollmentPackage) {
  const packageMeta = FAST_TRACK_PACKAGE_META[normalizeCredential(enrollmentPackage)] || null;
  if (!packageMeta) {
    return {
      packageLabel: '',
      packagePrice: 0,
      packageBv: 0,
      subtotal: 0,
      discount: 0,
      tax: 0,
      total: 0,
    };
  }

  const packagePrice = roundCurrencyAmount(Number(packageMeta.price) || 0);
  const packageBv = toWholeNumber(packageMeta.bv, 0);
  const discount = 0;
  const taxableAmount = roundCurrencyAmount(Math.max(0, packagePrice - discount));
  const tax = 0;
  const total = taxableAmount;

  return {
    packageLabel: normalizeText(packageMeta.label),
    packagePrice,
    packageBv,
    subtotal: packagePrice,
    discount,
    tax,
    total,
  };
}

function resolveExistingRegisteredMemberByIdentity(members, identity = {}) {
  const normalizedMembers = Array.isArray(members) ? members : [];
  const emailKey = normalizeCredential(identity?.email);
  const usernameKey = normalizeCredential(identity?.memberUsername || identity?.username);
  const userIdKey = normalizeText(identity?.userId);

  return normalizedMembers.find((member) => {
    const memberEmailKey = normalizeCredential(member?.email);
    const memberUsernameKey = normalizeCredential(member?.memberUsername || member?.username);
    const memberUserIdKey = normalizeText(member?.userId || member?.id);

    return Boolean(
      (emailKey && memberEmailKey === emailKey)
      || (usernameKey && memberUsernameKey === usernameKey)
      || (userIdKey && memberUserIdKey === userIdKey)
    );
  }) || null;
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

function resolvePackageProductCount(packageKey) {
  const normalizedPackageKey = normalizeCredential(packageKey);
  if (Object.prototype.hasOwnProperty.call(PACKAGE_PRODUCT_COUNT_BY_KEY, normalizedPackageKey)) {
    return Math.max(0, toWholeNumber(PACKAGE_PRODUCT_COUNT_BY_KEY[normalizedPackageKey], 0));
  }

  const packageBv = Math.max(0, toWholeNumber(FAST_TRACK_PACKAGE_META?.[normalizedPackageKey]?.bv, 0));
  if (packageBv <= 0) {
    return 0;
  }

  return Math.max(0, Math.floor(packageBv / PACKAGE_PRODUCT_BV));
}

function normalizeAccountUpgradeSplitProductKey(value = '') {
  const normalized = normalizeCredential(value).replace(/[^a-z0-9]/g, '');
  if (!normalized) {
    return '';
  }
  if (normalized.includes('roast')) {
    return 'metaroast';
  }
  if (normalized.includes('charge')) {
    return 'metacharge';
  }
  return '';
}

function normalizeAccountPackageProductKey(value = '') {
  const normalized = normalizeCredential(value).replace(/[^a-z0-9]/g, '');
  if (!normalized) {
    return '';
  }
  if (normalized.includes('split')) {
    return ACCOUNT_PACKAGE_PRODUCT_KEY_SPLIT;
  }
  return normalizeAccountUpgradeSplitProductKey(normalized);
}

function isAccountUpgradeSplitEligiblePackage(packageKey = '') {
  const normalizedPackageKey = normalizeCredential(packageKey);
  return ACCOUNT_UPGRADE_SPLIT_ELIGIBLE_PACKAGE_KEY_SET.has(normalizedPackageKey);
}

function resolveEnrollmentProductKey(value = '', packageKey = '') {
  const normalizedProductKey = normalizeAccountPackageProductKey(value);
  if (normalizedProductKey === ACCOUNT_PACKAGE_PRODUCT_KEY_SPLIT) {
    return isAccountUpgradeSplitEligiblePackage(packageKey)
      ? ACCOUNT_PACKAGE_PRODUCT_KEY_SPLIT
      : ENROLLMENT_DEFAULT_PRODUCT_KEY;
  }
  return normalizedProductKey || ENROLLMENT_DEFAULT_PRODUCT_KEY;
}

function resolveCurrentPackageProductKeyFromSource(source = null) {
  const safeSource = source && typeof source === 'object' ? source : {};
  const candidates = [
    safeSource.currentPackageProductKey,
    safeSource.current_package_product_key,
    safeSource.enrollmentProductKey,
    safeSource.enrollment_product_key,
    safeSource.defaultProductKey,
    safeSource.default_product_key,
  ];
  for (const candidate of candidates) {
    const normalizedProductKey = normalizeAccountPackageProductKey(candidate);
    if (normalizedProductKey) {
      return normalizedProductKey;
    }
  }
  return '';
}

function normalizeAccountUpgradeProductMode(value = '', selectedProductKey = '', targetPackageKey = '') {
  const splitAllowed = isAccountUpgradeSplitEligiblePackage(targetPackageKey);
  const normalized = normalizeCredential(value).replace(/[^a-z0-9]/g, '');
  if (normalized.includes('split') && splitAllowed) {
    return ACCOUNT_UPGRADE_PRODUCT_MODE_SPLIT;
  }
  if (normalized.includes('roast')) {
    return ACCOUNT_UPGRADE_PRODUCT_MODE_ALL_METAROAST;
  }
  if (normalized.includes('charge')) {
    return ACCOUNT_UPGRADE_PRODUCT_MODE_ALL_METACHARGE;
  }

  const normalizedSelectedProductKey = normalizeAccountUpgradeSplitProductKey(selectedProductKey);
  if (normalizedSelectedProductKey === 'metaroast') {
    return ACCOUNT_UPGRADE_PRODUCT_MODE_ALL_METAROAST;
  }
  if (normalizedSelectedProductKey === 'metacharge') {
    return ACCOUNT_UPGRADE_PRODUCT_MODE_ALL_METACHARGE;
  }
  return ACCOUNT_UPGRADE_DEFAULT_PRODUCT_MODE;
}

function resolveAccountUpgradeProductKeyByMode(productMode = '', selectedProductKey = '', targetPackageKey = '') {
  const normalizedMode = normalizeAccountUpgradeProductMode(
    productMode,
    selectedProductKey,
    targetPackageKey,
  );
  if (normalizedMode === ACCOUNT_UPGRADE_PRODUCT_MODE_ALL_METAROAST) {
    return 'metaroast';
  }
  if (normalizedMode === ACCOUNT_UPGRADE_PRODUCT_MODE_ALL_METACHARGE) {
    return 'metacharge';
  }
  const normalizedSelectedProductKey = normalizeAccountUpgradeSplitProductKey(selectedProductKey);
  if (normalizedSelectedProductKey) {
    return normalizedSelectedProductKey;
  }
  return ACCOUNT_UPGRADE_DEFAULT_SPLIT_SELECTED_PRODUCT_KEY;
}

function resolveComplementaryAccountUpgradeSplitProductKey(productKey = '') {
  const normalizedProductKey = normalizeAccountUpgradeSplitProductKey(productKey);
  return normalizedProductKey === 'metaroast' ? 'metacharge' : 'metaroast';
}

function resolveAccountUpgradeSplitProductMeta(productKey = '') {
  const normalizedProductKey = normalizeAccountUpgradeSplitProductKey(productKey);
  if (normalizedProductKey && ACCOUNT_UPGRADE_SPLIT_PRODUCT_META[normalizedProductKey]) {
    return ACCOUNT_UPGRADE_SPLIT_PRODUCT_META[normalizedProductKey];
  }
  return ACCOUNT_UPGRADE_SPLIT_PRODUCT_META[ACCOUNT_UPGRADE_DEFAULT_SPLIT_SELECTED_PRODUCT_KEY];
}

function resolveAccountUpgradeProductAllocation({
  currentPackageKey = '',
  targetPackageKey = '',
  selectedProductKey = '',
  selectedProductMode = '',
  currentPackageProductKey = '',
} = {}) {
  const currentPackageProducts = Math.max(0, resolvePackageProductCount(currentPackageKey));
  const normalizedTargetPackageKey = normalizeCredential(targetPackageKey);
  const targetPackageProducts = Math.max(
    currentPackageProducts,
    resolvePackageProductCount(normalizedTargetPackageKey),
  );
  const productCount = Math.max(0, targetPackageProducts - currentPackageProducts);
  const normalizedCurrentPackageProductKey = normalizeAccountPackageProductKey(currentPackageProductKey)
    || ENROLLMENT_DEFAULT_PRODUCT_KEY;
  const normalizedProductMode = normalizeAccountUpgradeProductMode(
    selectedProductMode,
    selectedProductKey,
    normalizedTargetPackageKey,
  );
  let resolvedSelectedProductKey = resolveAccountUpgradeProductKeyByMode(
    normalizedProductMode,
    selectedProductKey || ACCOUNT_UPGRADE_DEFAULT_SPLIT_SELECTED_PRODUCT_KEY,
    normalizedTargetPackageKey,
  );
  let selectedProduct = resolveAccountUpgradeSplitProductMeta(
    resolvedSelectedProductKey,
  );
  let carryoverProduct = resolveAccountUpgradeSplitProductMeta(
    resolveComplementaryAccountUpgradeSplitProductKey(selectedProduct.key),
  );
  let carryoverQuantity = 0;
  let selectedQuantity = productCount;
  if (normalizedProductMode === ACCOUNT_UPGRADE_PRODUCT_MODE_SPLIT) {
    const currentPackageIsSplit = normalizedCurrentPackageProductKey === ACCOUNT_PACKAGE_PRODUCT_KEY_SPLIT;
    const resolvedCarryoverProductKey = currentPackageIsSplit
      ? resolveComplementaryAccountUpgradeSplitProductKey(selectedProduct.key)
      : (
          normalizeAccountUpgradeSplitProductKey(normalizedCurrentPackageProductKey)
          || resolveComplementaryAccountUpgradeSplitProductKey(selectedProduct.key)
        );
    carryoverProduct = resolveAccountUpgradeSplitProductMeta(resolvedCarryoverProductKey);
    resolvedSelectedProductKey = resolveComplementaryAccountUpgradeSplitProductKey(carryoverProduct.key);
    selectedProduct = resolveAccountUpgradeSplitProductMeta(resolvedSelectedProductKey);
    const carryoverTargetTotal = Math.ceil(targetPackageProducts / 2);
    const existingCarryoverProductQuantity = currentPackageIsSplit
      ? Math.floor(currentPackageProducts / 2)
      : currentPackageProducts;
    const carryoverNeeded = Math.max(0, carryoverTargetTotal - existingCarryoverProductQuantity);
    carryoverQuantity = Math.min(productCount, carryoverNeeded);
    selectedQuantity = Math.max(0, productCount - carryoverQuantity);
  }
  const lines = [];
  if (carryoverQuantity > 0) {
    lines.push({
      productKey: carryoverProduct.key,
      productLabel: carryoverProduct.label,
      quantity: carryoverQuantity,
    });
  }
  if (selectedQuantity > 0) {
    lines.push({
      productKey: selectedProduct.key,
      productLabel: selectedProduct.label,
      quantity: selectedQuantity,
    });
  }
  const splitLabel = lines.length > 0
    ? lines.map((line) => `${line.productLabel} ${line.quantity}x`).join(' + ')
    : `${selectedProduct.label} 0x`;

  return {
    currentPackageProductKey: normalizedCurrentPackageProductKey,
    selectedProductMode: normalizedProductMode,
    selectedProductKey: selectedProduct.key,
    selectedProductLabel: selectedProduct.label,
    selectedProductQuantity: selectedQuantity,
    carryoverProductKey: carryoverProduct.key,
    carryoverProductLabel: carryoverProduct.label,
    carryoverProductQuantity: carryoverQuantity,
    splitLabel,
    lines,
  };
}

function resolveFastTrackBonusAmount({ enrollmentPackage, sponsorFastTrackTier, isAdminPlacement }) {
  if (isAdminPlacement) {
    return 0;
  }

  const commissionableBv = Number(FAST_TRACK_PACKAGE_META?.[enrollmentPackage]?.bv);
  const sponsorRate = Number(FAST_TRACK_RATE_BY_TIER?.[sponsorFastTrackTier]);

  if (!Number.isFinite(commissionableBv) || commissionableBv <= 0 || !Number.isFinite(sponsorRate) || sponsorRate <= 0) {
    return 0;
  }

  return roundCurrencyAmount(commissionableBv * sponsorRate);
}

function resolveCommissionContainerBalanceNumber(source = {}, ...keys) {
  const safeSource = source && typeof source === 'object' ? source : {};
  for (const key of keys) {
    if (!key) {
      continue;
    }
    const parsed = Number(safeSource[key]);
    if (Number.isFinite(parsed)) {
      return roundCurrencyAmount(parsed);
    }
  }
  return 0;
}

async function creditSponsorFastTrackCommissionContainer({
  sponsorUser = null,
  fastTrackBonusAmount = 0,
  client = null,
  executor = null,
} = {}) {
  const safeBonusAmount = roundCurrencyAmount(fastTrackBonusAmount);
  const sponsor = sponsorUser && typeof sponsorUser === 'object' ? sponsorUser : null;
  const dbExecutor = executor || client || pool;
  if (!sponsor || safeBonusAmount <= 0) {
    return null;
  }
  if (isPendingOrReservationMember(sponsor)) {
    return null;
  }

  const sponsorUserId = normalizeText(sponsor?.id || sponsor?.userId);
  if (!sponsorUserId) {
    return null;
  }

  try {
    const existingSnapshot = await readCommissionContainerByUserId(sponsorUserId, dbExecutor);
    const existingBalances = existingSnapshot?.balances && typeof existingSnapshot.balances === 'object'
      ? existingSnapshot.balances
      : {};
    const nextFastTrackBalance = roundCurrencyAmount(
      resolveCommissionContainerBalanceNumber(existingBalances, 'fasttrack', 'fastTrack')
      + safeBonusAmount,
    );

    return upsertCommissionContainerByUserId({
      userId: sponsorUserId,
      username: normalizeText(sponsor?.username || existingSnapshot?.username),
      email: normalizeText(sponsor?.email || existingSnapshot?.email),
      currencyCode: normalizeText(existingSnapshot?.currencyCode || 'USD').toUpperCase() || 'USD',
      balances: {
        fasttrack: nextFastTrackBalance,
        infinitybuilder: resolveCommissionContainerBalanceNumber(existingBalances, 'infinitybuilder', 'infinityBuilder'),
        legacyleadership: resolveCommissionContainerBalanceNumber(existingBalances, 'legacyleadership', 'legacyLeadership'),
        salesteam: resolveCommissionContainerBalanceNumber(existingBalances, 'salesteam', 'salesTeam'),
      },
      claimMaps: existingSnapshot?.claimMaps,
    }, dbExecutor);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error || '');
    console.warn(`[MemberEnrollment] Fast Track credit sync skipped for ${sponsorUserId}: ${errorMessage}`);
    return null;
  }
}

export async function createRegisteredMemberPaymentIntent(payload = {}) {
  let stripe = null;
  try {
    stripe = resolveStripeClient();
  } catch (error) {
    return {
      success: false,
      status: 503,
      error: error instanceof Error ? error.message : 'Stripe is unavailable.',
    };
  }

  const fullName = normalizeText(payload?.fullName);
  const email = normalizeText(payload?.email);
  const memberUsernameInput = normalizeText(payload?.memberUsername);
  const countryFlag = normalizeCountryFlag(payload?.countryFlag);
  const sponsorUsernameInput = normalizeCredential(payload?.sponsorUsername);
  const sponsorNameInput = normalizeText(payload?.sponsorName);
  const isAdminPlacement = Boolean(payload?.isAdminPlacement);
  const enrollmentContext = isAdminPlacement ? 'admin' : 'member';
  const placementLegInput = normalizePlacementLeg(payload?.placementLeg, {
    allowSpillover: true,
    fallback: PLACEMENT_LEG_LEFT,
  });
  const placementLegInputRaw = normalizeCredential(payload?.placementLeg);
  const spilloverPlacementSideInput = (
    normalizeCredential(payload?.spilloverPlacementSide) === PLACEMENT_LEG_RIGHT
    || placementLegInputRaw === 'spillover-right'
    || placementLegInputRaw === 'spillover_right'
    || placementLegInputRaw === 'spillover right'
  )
    ? PLACEMENT_LEG_RIGHT
    : PLACEMENT_LEG_LEFT;
  const requestedSpilloverParentMode = normalizeCredential(payload?.spilloverParentMode || 'auto');
  const spilloverParentModeInput = requestedSpilloverParentMode === 'manual' ? 'manual' : 'auto';
  const spilloverParentReferenceInput = normalizeText(payload?.spilloverParentReference);
  const enrollmentPackage = normalizeCredential(payload?.enrollmentPackage);
  const enrollmentProductKey = resolveEnrollmentProductKey(
    payload?.enrollmentProductKey
    || payload?.enrollment_product_key
    || payload?.enrollmentProduct
    || payload?.enrollment_product
    || payload?.productKey
    || payload?.product_key,
    enrollmentPackage,
  );
  const requestedFastTrackTier = normalizeCredential(
    payload?.fastTrackTier || FAST_TRACK_TIER_BY_PACKAGE[enrollmentPackage]
  );
  const billingAddress = normalizeText(payload?.billingAddress);
  const billingCity = normalizeText(payload?.billingCity);
  const billingState = normalizeText(payload?.billingState);
  const billingPostalCode = normalizeText(payload?.billingPostalCode);
  const billingCountry = normalizeText(payload?.billingCountry);
  const billingCountryCode = normalizeText(payload?.billingCountryCode).toUpperCase();
  const authenticatedMember = payload?.authenticatedMember && typeof payload.authenticatedMember === 'object'
    ? payload.authenticatedMember
    : null;
  const pendingEnrollmentRestriction = resolvePendingEnrollmentRestrictionResult(
    isAdminPlacement,
    authenticatedMember,
  );
  if (pendingEnrollmentRestriction) {
    return pendingEnrollmentRestriction;
  }
  const authenticatedMemberDisplayName = normalizeText(
    authenticatedMember?.name
    || authenticatedMember?.fullName
    || authenticatedMember?.username
    || authenticatedMember?.memberUsername,
  );

  if (!fullName || !email) {
    return {
      success: false,
      status: 400,
      error: 'Full name and email are required.',
    };
  }

  const placementPolicy = await resolveServerEnforcedEnrollmentPlacement({
    ...payload,
    isAdminPlacement,
    sponsorUsername: sponsorUsernameInput,
    placementLeg: placementLegInput,
    spilloverPlacementSide: spilloverPlacementSideInput,
    spilloverParentMode: spilloverParentModeInput,
    spilloverParentReference: spilloverParentReferenceInput,
    authenticatedMember,
  });
  const actorUsername = normalizeCredential(placementPolicy?.actorUsername);
  if (!isAdminPlacement && !actorUsername) {
    return {
      success: false,
      status: 401,
      error: 'Member authentication is required to submit enrollment.',
    };
  }

  const sponsorUsername = normalizeCredential(placementPolicy?.sponsorUsername || sponsorUsernameInput);
  if (!sponsorUsername) {
    return {
      success: false,
      status: 400,
      error: 'Sponsor username is required for member enrollment.',
    };
  }
  const sponsorName = normalizeText(
    sponsorNameInput
    || (sponsorUsername === actorUsername ? authenticatedMemberDisplayName : '')
    || sponsorUsername,
  );
  const placementLeg = normalizePlacementLeg(placementPolicy?.placementLeg, {
    allowSpillover: true,
    fallback: PLACEMENT_LEG_LEFT,
  });
  const spilloverPlacementSide = placementLeg === PLACEMENT_LEG_SPILLOVER
    ? resolvePlacementSideFromLeg(placementLeg, placementPolicy?.spilloverPlacementSide)
    : '';
  const spilloverParentMode = (
    placementLeg === PLACEMENT_LEG_SPILLOVER
    && normalizeCredential(placementPolicy?.spilloverParentMode) === 'manual'
  )
    ? 'manual'
    : 'auto';
  const effectiveSpilloverParentReference = (
    placementLeg === PLACEMENT_LEG_SPILLOVER && spilloverParentMode === 'manual'
  )
    ? normalizeText(placementPolicy?.spilloverParentReference)
    : '';

  if (!FAST_TRACK_PACKAGE_META[enrollmentPackage]) {
    return {
      success: false,
      status: 400,
      error: 'Invalid enrollment package.',
    };
  }

  const checkoutSummary = resolveEnrollmentCheckoutSummary(enrollmentPackage);
  if (checkoutSummary.total <= 0) {
    return {
      success: false,
      status: 400,
      error: 'Only paid enrollment packages are allowed in this panel.',
    };
  }

  if (!FAST_TRACK_TIER_META[requestedFastTrackTier]) {
    return {
      success: false,
      status: 400,
      error: 'Invalid Fast Track tier.',
    };
  }

  if (
    placementLeg === PLACEMENT_LEG_SPILLOVER
    && spilloverParentMode === 'manual'
    && !effectiveSpilloverParentReference
  ) {
    return {
      success: false,
      status: 400,
      error: 'Manual spillover placement requires a receiving parent reference.',
    };
  }

  const existingUserByEmail = await findUserByEmail(email);
  if (existingUserByEmail) {
    return {
      success: false,
      status: 409,
      error: 'A member with this email already exists.',
    };
  }

  const members = await readRegisteredMembersStore();
  const existingMember = resolveExistingRegisteredMemberByIdentity(members, {
    email,
    memberUsername: memberUsernameInput,
  });
  if (existingMember) {
    return {
      success: false,
      status: 409,
      error: 'A member with this email already exists.',
    };
  }

  const existingInvoices = await readMockStoreInvoicesStore();
  const invoiceIdSeed = resolveNextStoreInvoiceId(existingInvoices);
  const invoiceId = `${invoiceIdSeed}-${String(randomInt(100, 1000))}`;
  const packageBv = toWholeNumber(checkoutSummary.packageBv, 0);
  const taxableAmountMinor = resolveCurrencyMinorAmount(checkoutSummary.total);
  if (taxableAmountMinor <= 0) {
    return {
      success: false,
      status: 400,
      error: 'Enrollment subtotal must be greater than zero.',
    };
  }

  const paymentIntentMetadata = {
    flow: sanitizeStripeMetadataValue(ENROLLMENT_PAYMENT_FLOW),
    source: sanitizeStripeMetadataValue('binary-tree-next'),
    invoice_id: sanitizeStripeMetadataValue(invoiceId),
    enrollment_context: sanitizeStripeMetadataValue(enrollmentContext),
    full_name: sanitizeStripeMetadataValue(fullName),
    email: sanitizeStripeMetadataValue(email),
    member_username: sanitizeStripeMetadataValue(memberUsernameInput),
    country_flag: sanitizeStripeMetadataValue(countryFlag),
    placement_leg: sanitizeStripeMetadataValue(placementLeg),
    spillover_placement_side: sanitizeStripeMetadataValue(spilloverPlacementSide),
    spillover_parent_mode: sanitizeStripeMetadataValue(spilloverParentMode),
    spillover_parent_reference: sanitizeStripeMetadataValue(effectiveSpilloverParentReference),
    enrollment_package: sanitizeStripeMetadataValue(enrollmentPackage),
    enrollment_product_key: sanitizeStripeMetadataValue(enrollmentProductKey),
    fast_track_tier: sanitizeStripeMetadataValue(requestedFastTrackTier),
    sponsor_username: sanitizeStripeMetadataValue(sponsorUsername),
    sponsor_name: sanitizeStripeMetadataValue(sponsorName || sponsorUsername),
    billing_address: sanitizeStripeMetadataValue(billingAddress),
    billing_city: sanitizeStripeMetadataValue(billingCity),
    billing_state: sanitizeStripeMetadataValue(billingState),
    billing_postal_code: sanitizeStripeMetadataValue(billingPostalCode),
    billing_country: sanitizeStripeMetadataValue(billingCountry),
    billing_country_code: sanitizeStripeMetadataValue(billingCountryCode),
    package_label: sanitizeStripeMetadataValue(checkoutSummary.packageLabel),
    package_bv: String(packageBv),
    subtotal: String(checkoutSummary.subtotal),
    discount_amount: String(checkoutSummary.discount),
    tax_amount: '0',
    total_amount: String(checkoutSummary.total),
  };
  let stripeCustomerId = '';
  try {
    const customerResolution = await resolveOrCreateStripeCustomerForUserIdentity({
      email,
      name: fullName,
    }, {
      stripe,
      allowCreate: true,
      metadata: {
        checkout_type: 'member-enrollment',
      },
    });
    stripeCustomerId = normalizeText(customerResolution?.customerId);
  } catch {
    stripeCustomerId = '';
  }

  if (stripeCustomerId) {
    paymentIntentMetadata.stripe_customer_id = sanitizeStripeMetadataValue(stripeCustomerId);
  }

  if (!/^[A-Z]{2}$/.test(billingCountryCode)) {
    return {
      success: false,
      status: 400,
      error: 'Billing country code is required for Stripe Tax calculation.',
    };
  }

  const taxCode = normalizeText(process.env.STRIPE_ENROLLMENT_TAX_CODE);
  let taxCalculationId = '';
  let totalAmountMinor = taxableAmountMinor;
  let taxAmount = 0;
  try {
    const taxCalculation = await stripe.tax.calculations.create({
      currency: 'usd',
      line_items: [
        {
          amount: taxableAmountMinor,
          quantity: 1,
          reference: sanitizeStripeMetadataValue(
            `${enrollmentPackage || 'member-enrollment'}-checkout`,
            'member-enrollment-checkout',
          ),
          tax_code: taxCode || undefined,
        },
      ],
      customer_details: {
        address: {
          line1: billingAddress || undefined,
          city: billingCity || undefined,
          state: billingState || undefined,
          postal_code: billingPostalCode || undefined,
          country: billingCountryCode,
        },
        address_source: 'billing',
      },
    });
    taxCalculationId = normalizeText(taxCalculation?.id);
    totalAmountMinor = Math.max(
      taxableAmountMinor,
      Math.round(Number(taxCalculation?.amount_total || taxableAmountMinor)),
    );
    taxAmount = roundCurrencyAmount((totalAmountMinor - taxableAmountMinor) / 100);
  } catch (error) {
    const message = error instanceof Error && error.message
      ? error.message
      : 'Unable to calculate Stripe Tax for enrollment payment.';
    const statusCode = Number(error?.statusCode);
    const status = Number.isFinite(statusCode) && statusCode >= 400 && statusCode < 600
      ? statusCode
      : 502;
    return {
      success: false,
      status,
      error: message,
    };
  }

  paymentIntentMetadata.tax_amount = String(taxAmount);
  paymentIntentMetadata.total_amount = String(roundCurrencyAmount(totalAmountMinor / 100));
  if (taxCalculationId) {
    paymentIntentMetadata.tax_calculation_id = sanitizeStripeMetadataValue(taxCalculationId);
  }

  try {
    const paymentIntentCreatePayload = {
      amount: totalAmountMinor,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      receipt_email: email || undefined,
      customer: stripeCustomerId || undefined,
      metadata: paymentIntentMetadata,
    };
    if (taxCalculationId) {
      paymentIntentCreatePayload.hooks = {
        inputs: {
          tax: {
            calculation: taxCalculationId,
          },
        },
      };
    }
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentCreatePayload);

    if (!paymentIntent?.id || !paymentIntent?.client_secret) {
      return {
        success: false,
        status: 500,
        error: 'Stripe payment intent was not created.',
      };
    }

    return {
      success: true,
      status: 201,
      data: {
        success: true,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        checkout: {
          invoiceId,
          packageLabel: checkoutSummary.packageLabel,
          packageBv: packageBv,
          subtotal: checkoutSummary.subtotal,
          discount: checkoutSummary.discount,
          tax: taxAmount,
          total: roundCurrencyAmount(totalAmountMinor / 100),
        },
      },
    };
  } catch (error) {
    const message = error instanceof Error && error.message
      ? error.message
      : 'Unable to create Stripe payment intent.';

    return {
      success: false,
      status: 502,
      error: message,
    };
  }
}

export async function completeRegisteredMemberPaymentIntent(payload = {}) {
  let stripe = null;
  try {
    stripe = resolveStripeClient();
  } catch (error) {
    return {
      success: false,
      status: 503,
      error: error instanceof Error ? error.message : 'Stripe is unavailable.',
    };
  }

  const paymentIntentId = normalizeText(payload?.paymentIntentId);
  if (!paymentIntentId) {
    return {
      success: false,
      status: 400,
      error: 'Payment intent ID is required.',
    };
  }

  let paymentIntent = null;
  try {
    paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['latest_charge.invoice'],
    });
  } catch (error) {
    const message = error instanceof Error && error.message
      ? error.message
      : 'Unable to retrieve payment intent.';

    return {
      success: false,
      status: 404,
      error: message,
    };
  }

  const paymentStatus = normalizeText(paymentIntent?.status).toLowerCase();
  if (paymentStatus !== 'succeeded') {
    return {
      success: true,
      status: 202,
      data: {
        success: true,
        completed: false,
        paid: paymentStatus === 'succeeded',
        paymentIntent: {
          id: paymentIntent?.id || paymentIntentId,
          status: paymentIntent?.status || '',
        },
      },
    };
  }

  const metadata = paymentIntent?.metadata && typeof paymentIntent.metadata === 'object'
    ? paymentIntent.metadata
    : {};
  const stripeReference = resolveEnrollmentStripeReferenceData({
    customerId: payload?.checkoutSessionCustomerId || resolveStripeCustomerId(paymentIntent?.customer),
    paymentIntentId: paymentIntent?.id || paymentIntentId,
    checkoutSessionId: payload?.checkoutSessionId || '',
    paymentStatus: paymentIntent?.status || '',
    invoice: paymentIntent?.latest_charge?.invoice || null,
  });

  const flowTag = normalizeCredential(metadata.flow || metadata.payment_flow);
  if (flowTag !== ENROLLMENT_PAYMENT_FLOW) {
    return {
      success: false,
      status: 400,
      error: 'Payment intent is not linked to enrollment flow.',
    };
  }

  const enrollmentContext = normalizeCredential(metadata.enrollment_context);
  const isAdminPlacement = Boolean(payload?.isAdminPlacement) || enrollmentContext === 'admin';
  const fullName = normalizeText(metadata.full_name);
  const email = normalizeText(metadata.email);
  const memberUsernameInput = normalizeText(metadata.member_username);
  const countryFlag = normalizeCountryFlag(metadata.country_flag);
  const sponsorUsernameFromPaymentMetadata = normalizeCredential(metadata.sponsor_username);
  const sponsorNameFromPaymentMetadata = normalizeText(metadata.sponsor_name);
  const placementLeg = normalizePlacementLeg(metadata.placement_leg, {
    allowSpillover: true,
    fallback: PLACEMENT_LEG_LEFT,
  });
  const placementLegRaw = normalizeCredential(metadata.placement_leg);
  const spilloverPlacementSide = (
    normalizeCredential(metadata.spillover_placement_side) === PLACEMENT_LEG_RIGHT
    || placementLegRaw === 'spillover-right'
    || placementLegRaw === 'spillover_right'
    || placementLegRaw === 'spillover right'
  )
    ? PLACEMENT_LEG_RIGHT
    : PLACEMENT_LEG_LEFT;
  const spilloverParentModeInput = normalizeCredential(metadata.spillover_parent_mode || 'auto');
  const spilloverParentMode = spilloverParentModeInput === 'manual' ? 'manual' : 'auto';
  const spilloverParentReference = normalizeText(metadata.spillover_parent_reference);
  const effectiveSpilloverParentReference = (
    placementLeg === PLACEMENT_LEG_SPILLOVER && spilloverParentMode === 'manual'
  )
    ? spilloverParentReference
    : '';
  const enrollmentPackage = normalizeCredential(metadata.enrollment_package);
  const enrollmentProductKey = resolveEnrollmentProductKey(
    metadata.enrollment_product_key
    || metadata.enrollmentProductKey
    || metadata.product_key
    || metadata.productKey,
    enrollmentPackage,
  );
  const requestedFastTrackTier = normalizeCredential(metadata.fast_track_tier);
  const billingAddress = normalizeText(metadata.billing_address);
  const billingCity = normalizeText(metadata.billing_city);
  const billingState = normalizeText(metadata.billing_state);
  const billingPostalCode = normalizeText(metadata.billing_postal_code);
  const billingCountry = normalizeText(metadata.billing_country);
  const billingCountryCode = normalizeText(metadata.billing_country_code);

  if (!fullName || !email || !FAST_TRACK_PACKAGE_META[enrollmentPackage]) {
    return {
      success: false,
      status: 400,
      error: 'Payment metadata is incomplete for enrollment.',
    };
  }

  if (!FAST_TRACK_TIER_META[requestedFastTrackTier]) {
    return {
      success: false,
      status: 400,
      error: 'Payment metadata includes an invalid Fast Track tier.',
    };
  }

  const checkoutSummary = resolveEnrollmentCheckoutSummary(enrollmentPackage);
  if (checkoutSummary.total <= 0) {
    return {
      success: false,
      status: 400,
      error: 'Only paid enrollment packages are allowed in this panel.',
    };
  }

  const members = await readRegisteredMembersStore();
  let createdMember = resolveExistingRegisteredMemberByIdentity(members, {
    email,
    memberUsername: memberUsernameInput,
  });
  let alreadyProcessed = Boolean(createdMember);

  if (!createdMember) {
    const registrationResult = await createRegisteredMember({
      fullName,
      email,
      memberUsername: memberUsernameInput,
      phone: '',
      notes: '',
      countryFlag,
      placementLeg,
      spilloverPlacementSide,
      spilloverParentMode,
      spilloverParentReference: effectiveSpilloverParentReference,
      enrollmentPackage,
      enrollmentProductKey,
      fastTrackTier: requestedFastTrackTier,
      sponsorUsername: sponsorUsernameFromPaymentMetadata,
      sponsorName: sponsorNameFromPaymentMetadata || sponsorUsernameFromPaymentMetadata,
      billingAddress,
      billingCity,
      billingState,
      billingPostalCode,
      billingCountry,
      billingCountryCode,
      isAdminPlacement,
      enrollmentContext: isAdminPlacement ? 'admin' : 'member',
      authenticatedMember: payload?.authenticatedMember || null,
      enrollmentSourceId: normalizeText(paymentIntent?.id || paymentIntentId || metadata.invoice_id),
      enrollmentOrderReference: normalizeText(metadata.invoice_id || ''),
      paymentReference: normalizeText(paymentIntent?.id || paymentIntentId || ''),
      paymentIntentId: normalizeText(paymentIntent?.id || paymentIntentId || ''),
      paymentStatus: normalizeText(paymentIntent?.status || ''),
    });

    if (!registrationResult.success) {
      if (registrationResult.status === 409) {
        const membersAfterConflict = await readRegisteredMembersStore();
        const matchedExistingMember = resolveExistingRegisteredMemberByIdentity(membersAfterConflict, {
          email,
          memberUsername: memberUsernameInput,
        });
        if (matchedExistingMember) {
          createdMember = matchedExistingMember;
          alreadyProcessed = true;
        } else {
          return {
            success: false,
            status: 409,
            error: registrationResult.error || 'Enrollment already exists.',
          };
        }
      } else {
        return {
          success: false,
          status: registrationResult.status,
          error: registrationResult.error || 'Unable to register member after successful payment.',
        };
      }
    } else {
      createdMember = registrationResult.member;
      alreadyProcessed = false;
    }
  }

  if (!createdMember || typeof createdMember !== 'object') {
    return {
      success: false,
      status: 500,
      error: 'Payment succeeded, but enrollment record is missing.',
    };
  }

  if (stripeReference.stripeCustomerId) {
    await linkStripeCustomerToUserIdentity({
      customerId: stripeReference.stripeCustomerId,
      userId: normalizeText(createdMember?.userId),
      username: normalizeText(createdMember?.memberUsername || memberUsernameInput),
      email: normalizeText(createdMember?.email || email),
    }).catch(() => {});
  }

  const invoiceId = normalizeText(metadata.invoice_id).toUpperCase() || `INV-${Date.now()}`;
  const packageBv = toWholeNumber(metadata.package_bv, checkoutSummary.packageBv);
  const discountAmount = roundCurrencyAmount(metadata.discount_amount);
  const subtotalAmount = roundCurrencyAmount(metadata.subtotal || checkoutSummary.subtotal);
  const capturedAmount = roundCurrencyAmount(
    (Number(paymentIntent?.amount_received) || Number(paymentIntent?.amount) || 0) / 100
  );
  const totalAmount = capturedAmount > 0
    ? capturedAmount
    : roundCurrencyAmount(metadata.total_amount || checkoutSummary.total);
  const resolvedTaxAmount = resolveCheckoutTaxFromTotal(totalAmount, subtotalAmount, discountAmount);

  let invoiceRecord = null;
  let invoiceWarning = '';
  const existingInvoices = await readMockStoreInvoicesStore();
  invoiceRecord = (Array.isArray(existingInvoices) ? existingInvoices : []).find((invoice) => {
    return normalizeText(invoice?.id).toUpperCase() === invoiceId;
  }) || null;

  if (invoiceRecord) {
    const syncResult = await syncStoreInvoiceStripeDetails({
      invoiceId,
      stripeCustomerId: stripeReference.stripeCustomerId,
      stripePaymentIntentId: stripeReference.stripePaymentIntentId,
      stripeCheckoutSessionId: stripeReference.stripeCheckoutSessionId,
      stripeInvoiceId: stripeReference.stripeInvoiceId,
      stripeInvoiceNumber: stripeReference.stripeInvoiceNumber,
      stripeInvoiceHostedUrl: stripeReference.stripeInvoiceHostedUrl,
      stripeInvoicePdfUrl: stripeReference.stripeInvoicePdfUrl,
      stripePaymentStatus: stripeReference.stripePaymentStatus,
    });
    if (syncResult.success) {
      invoiceRecord = syncResult.data?.invoice || invoiceRecord;
    }
  }

  if (!invoiceRecord) {
    let attributionKey = DEFAULT_ATTRIBUTION_STORE_CODE;
    const createdMemberSponsorUsername = normalizeCredential(
      createdMember?.sponsorUsername || sponsorUsernameFromPaymentMetadata,
    );
    const matchedSponsorUser = createdMemberSponsorUsername
      ? await findUserByUsername(createdMemberSponsorUsername)
      : null;
    if (matchedSponsorUser) {
      attributionKey = resolveSponsorAttributionStoreCode(matchedSponsorUser);
    }

    const invoiceResult = await createStoreInvoice({
      invoiceId,
      buyer: normalizeText(createdMember?.fullName || fullName || 'Enrollment Buyer'),
      buyerUserId: normalizeText(createdMember?.userId),
      buyerUsername: normalizeText(createdMember?.memberUsername || memberUsernameInput),
      buyerEmail: normalizeText(createdMember?.email || email),
      attributionKey,
      amount: totalAmount,
      bp: packageBv,
      discount: discountAmount,
      stripeCustomerId: stripeReference.stripeCustomerId,
      stripePaymentIntentId: stripeReference.stripePaymentIntentId,
      stripeCheckoutSessionId: stripeReference.stripeCheckoutSessionId,
      stripeInvoiceId: stripeReference.stripeInvoiceId,
      stripeInvoiceNumber: stripeReference.stripeInvoiceNumber,
      stripeInvoiceHostedUrl: stripeReference.stripeInvoiceHostedUrl,
      stripeInvoicePdfUrl: stripeReference.stripeInvoicePdfUrl,
      stripePaymentStatus: stripeReference.stripePaymentStatus,
      status: 'Posted',
    });

    if (invoiceResult.success) {
      invoiceRecord = invoiceResult.data?.invoice || null;
    } else if (invoiceResult.status === 409) {
      const invoicesAfterConflict = await readMockStoreInvoicesStore();
      invoiceRecord = (Array.isArray(invoicesAfterConflict) ? invoicesAfterConflict : []).find((invoice) => {
        return normalizeText(invoice?.id).toUpperCase() === invoiceId;
      }) || null;
      if (invoiceRecord) {
        const syncResult = await syncStoreInvoiceStripeDetails({
          invoiceId,
          stripeCustomerId: stripeReference.stripeCustomerId,
          stripePaymentIntentId: stripeReference.stripePaymentIntentId,
          stripeCheckoutSessionId: stripeReference.stripeCheckoutSessionId,
          stripeInvoiceId: stripeReference.stripeInvoiceId,
          stripeInvoiceNumber: stripeReference.stripeInvoiceNumber,
          stripeInvoiceHostedUrl: stripeReference.stripeInvoiceHostedUrl,
          stripeInvoicePdfUrl: stripeReference.stripeInvoicePdfUrl,
          stripePaymentStatus: stripeReference.stripePaymentStatus,
        });
        if (syncResult.success) {
          invoiceRecord = syncResult.data?.invoice || invoiceRecord;
        }
      }
    } else {
      invoiceWarning = normalizeText(invoiceResult.error || 'Invoice could not be created.');
    }
  }

  return {
    success: true,
    status: 200,
    data: {
      success: true,
      completed: true,
      alreadyProcessed,
      member: createdMember,
      invoice: invoiceRecord,
      warning: invoiceWarning,
      paymentIntent: {
        id: paymentIntent?.id || paymentIntentId,
        status: paymentIntent?.status || '',
        amount: totalAmount,
      },
      checkout: {
        invoiceId,
        packageLabel: checkoutSummary.packageLabel,
        packageBv,
        subtotal: subtotalAmount,
        discount: discountAmount,
        tax: resolvedTaxAmount,
        total: totalAmount,
      },
    },
  };
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
  const sponsorUsernameInput = normalizeCredential(payload?.sponsorUsername);
  const sponsorNameInput = normalizeText(payload?.sponsorName);
  const isAdminPlacement = Boolean(payload?.isAdminPlacement);
  const enrollmentContext = isAdminPlacement ? 'admin' : 'member';
  const placementLegInput = normalizePlacementLeg(payload?.placementLeg, {
    allowSpillover: true,
    fallback: PLACEMENT_LEG_LEFT,
  });
  const placementLegInputRaw = normalizeCredential(payload?.placementLeg);
  const spilloverPlacementSideInput = (
    normalizeCredential(payload?.spilloverPlacementSide) === PLACEMENT_LEG_RIGHT
    || placementLegInputRaw === 'spillover-right'
    || placementLegInputRaw === 'spillover_right'
    || placementLegInputRaw === 'spillover right'
  )
    ? PLACEMENT_LEG_RIGHT
    : PLACEMENT_LEG_LEFT;
  const requestedSpilloverParentMode = normalizeCredential(payload?.spilloverParentMode || 'auto');
  const spilloverParentModeInput = requestedSpilloverParentMode === 'manual' ? 'manual' : 'auto';
  const spilloverParentReferenceInput = normalizeText(payload?.spilloverParentReference);
  const enrollmentPackage = normalizeCredential(payload?.enrollmentPackage);
  const enrollmentProductKey = resolveEnrollmentProductKey(
    payload?.enrollmentProductKey
    || payload?.enrollment_product_key
    || payload?.enrollmentProduct
    || payload?.enrollment_product
    || payload?.productKey
    || payload?.product_key,
    enrollmentPackage,
  );
  const requestedFastTrackTier = normalizeCredential(payload?.fastTrackTier);
  const isStaffTreeAccount = Boolean(payload?.isStaffTreeAccount);
  const authenticatedMember = payload?.authenticatedMember && typeof payload.authenticatedMember === 'object'
    ? payload.authenticatedMember
    : null;
  const pendingEnrollmentRestriction = resolvePendingEnrollmentRestrictionResult(
    isAdminPlacement,
    authenticatedMember,
  );
  if (pendingEnrollmentRestriction) {
    return pendingEnrollmentRestriction;
  }
  const authenticatedMemberDisplayName = normalizeText(
    authenticatedMember?.name
    || authenticatedMember?.fullName
    || authenticatedMember?.username
    || authenticatedMember?.memberUsername,
  );

  if (!fullName || !email) {
    return {
      success: false,
      status: 400,
      error: 'Full name and email are required.',
    };
  }

  const placementPolicy = await resolveServerEnforcedEnrollmentPlacement({
    ...payload,
    isAdminPlacement,
    sponsorUsername: sponsorUsernameInput,
    placementLeg: placementLegInput,
    spilloverPlacementSide: spilloverPlacementSideInput,
    spilloverParentMode: spilloverParentModeInput,
    spilloverParentReference: spilloverParentReferenceInput,
    authenticatedMember,
  });
  const actorUsername = normalizeCredential(placementPolicy?.actorUsername);
  if (!isAdminPlacement && !actorUsername) {
    return {
      success: false,
      status: 401,
      error: 'Member authentication is required to submit enrollment.',
    };
  }

  const sponsorUsername = normalizeCredential(placementPolicy?.sponsorUsername || sponsorUsernameInput);
  if (!sponsorUsername) {
    return {
      success: false,
      status: 400,
      error: 'Sponsor username is required for member enrollment.',
    };
  }
  const sponsorName = normalizeText(
    sponsorNameInput
    || (sponsorUsername === actorUsername ? authenticatedMemberDisplayName : '')
    || sponsorUsername,
  );
  const placementLeg = normalizePlacementLeg(placementPolicy?.placementLeg, {
    allowSpillover: true,
    fallback: PLACEMENT_LEG_LEFT,
  });
  const spilloverPlacementSide = placementLeg === PLACEMENT_LEG_SPILLOVER
    ? resolvePlacementSideFromLeg(placementLeg, placementPolicy?.spilloverPlacementSide)
    : '';
  const spilloverParentMode = (
    placementLeg === PLACEMENT_LEG_SPILLOVER
    && normalizeCredential(placementPolicy?.spilloverParentMode) === 'manual'
  )
    ? 'manual'
    : 'auto';
  const effectiveSpilloverParentReference = (
    placementLeg === PLACEMENT_LEG_SPILLOVER && spilloverParentMode === 'manual'
  )
    ? normalizeText(placementPolicy?.spilloverParentReference)
    : '';

  if (!FAST_TRACK_PACKAGE_META[enrollmentPackage]) {
    return {
      success: false,
      status: 400,
      error: 'Invalid enrollment package.',
    };
  }

  if (
    placementLeg === PLACEMENT_LEG_SPILLOVER
    && spilloverParentMode === 'manual'
    && !effectiveSpilloverParentReference
  ) {
    return {
      success: false,
      status: 400,
      error: 'Manual spillover placement requires a receiving parent reference.',
    };
  }

  const client = await pool.connect();
  let transactionStarted = false;
  try {
    let matchedSponsorUser = await findUserByUsername(sponsorUsername, { client });
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

    const existingUserByEmail = await findUserByEmail(email, { client });
    if (existingUserByEmail) {
      return {
        success: false,
        status: 409,
        error: 'A member with this email already exists.',
      };
    }

    const memberUsername = await createUniqueUsernameWithLookup(memberUsernameInput, email, { client });
    const reservedStoreCodes = new Set();
    let shouldPersistSponsorUser = false;
    if (matchedSponsorUser) {
      const sponsorStoreCode = normalizeStoreCode(matchedSponsorUser?.storeCode);
      const sponsorPublicStoreCode = normalizeStoreCode(matchedSponsorUser?.publicStoreCode);
      if (sponsorStoreCode) {
        reservedStoreCodes.add(sponsorStoreCode);
      }
      if (sponsorPublicStoreCode) {
        reservedStoreCodes.add(sponsorPublicStoreCode);
      }
      if (!sponsorStoreCode || !sponsorPublicStoreCode) {
        const nextSponsorStoreCode = sponsorStoreCode || await createUniqueStoreCode({
          reservedStoreCodes,
          client,
        });
        const nextSponsorPublicStoreCode = sponsorPublicStoreCode || await createUniqueStoreCode({
          reservedStoreCodes,
          client,
        });
        matchedSponsorUser = {
          ...matchedSponsorUser,
          storeCode: nextSponsorStoreCode,
          publicStoreCode: nextSponsorPublicStoreCode,
        };
        shouldPersistSponsorUser = true;
      }
    }

    const sponsorAttributionStoreCode = resolveSponsorAttributionStoreCode(matchedSponsorUser);
    const publicStoreCode = await createUniqueStoreCode({
      reservedStoreCodes,
      client,
    });
    const storeCode = await createUniqueStoreCode({
      reservedStoreCodes,
      client,
    });
    const temporaryPassword = generateRandomPassword();
    const packageMeta = FAST_TRACK_PACKAGE_META[enrollmentPackage];
    const packagePrice = Number(packageMeta.price);
    const packageBv = Number(packageMeta.bv);
    const startingRank = STARTING_RANK_BY_PACKAGE[enrollmentPackage] || 'Personal';
    const isReservationPlan = isMembershipPlacementReservationPackage(enrollmentPackage);
    const fastTrackBonusAmount = resolveFastTrackBonusAmount({
      enrollmentPackage,
      sponsorFastTrackTier: resolvedSponsorFastTrackTier,
      isAdminPlacement,
    });

    const createdAtDate = new Date();
    const createdAt = createdAtDate.toISOString();
    const enrollmentActivityState = resolveMemberActivityStateByPersonalBv({
      passwordSetupRequired: true,
      createdAt,
      currentPersonalPvBv: packageBv,
    }, {
      referenceDate: createdAtDate,
    });
    const activityActiveUntilAt = normalizeText(enrollmentActivityState?.activeUntilAt);
    const currentPersonalPvBv = Math.max(0, Math.floor(Number(enrollmentActivityState?.currentPersonalPvBv) || 0));
    const accountStatus = isReservationPlan
      ? 'pending'
      : normalizeText(enrollmentActivityState?.accountStatus) || 'inactive';
    const userId = `usr_${Date.now()}_${randomUUID().slice(0, 8)}`;

    const newUser = {
      id: userId,
      name: fullName,
      username: memberUsername,
      email,
      countryFlag,
      password: temporaryPassword,
      passwordSetupRequired: true,
      accountStatus,
      attributionStoreCode: sponsorAttributionStoreCode,
      publicStoreCode,
      storeCode,
      enrollmentPackage,
      currentPackageProductKey: enrollmentProductKey,
      enrollmentPackageLabel: packageMeta.label,
      enrollmentPackagePrice: packagePrice,
      enrollmentPackageBv: packageBv,
      starterPersonalPv: packageBv,
      currentPersonalPvBv,
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
      currentPackageProductKey: enrollmentProductKey,
      enrollmentPackageLabel: packageMeta.label,
      fastTrackTier: resolvedSponsorFastTrackTier,
      fastTrackTierLabel: FAST_TRACK_TIER_META[resolvedSponsorFastTrackTier].label,
      packagePrice,
      packageBv,
      starterPersonalPv: packageBv,
      currentPersonalPvBv,
      rank: startingRank,
      accountRank: startingRank,
      accountStatus,
      status: accountStatus,
      activityActiveUntilAt,
      lastProductPurchaseAt: '',
      lastPurchaseAt: '',
      fastTrackBonusAmount,
      passwordSetupRequired: true,
      passwordSetupEmailQueued: true,
      passwordSetupTokenExpiresAt: tokenRecord.expiresAt,
      passwordSetupLink: setupLink,
      businessCenterOwnerUserId: userId,
      businessCenterOwnerUsername: memberUsername,
      businessCenterOwnerEmail: email,
      businessCenterNodeType: isStaffTreeAccount
        ? BUSINESS_CENTER_NODE_TYPE_STAFF_ADMIN
        : BUSINESS_CENTER_NODE_TYPE_MAIN_CENTER,
      businessCenterIndex: 0,
      businessCenterLabel: 'Main Center',
      businessCenterActivatedAt: '',
      businessCenterPinnedSide: '',
      isEarningEligible: !isStaffTreeAccount && !isReservationPlan,
      activationStatus: isReservationPlan ? 'inactive' : 'active',
      sourceQualificationTier: 0,
      legacyLeadershipCompletedTierCount: 0,
      businessCentersEarnedLifetime: 0,
      businessCentersActivated: 0,
      businessCentersPending: 0,
      businessCentersOverflowPending: 0,
      businessCentersCount: 0,
      isStaffTreeAccount,
      createdAt,
    };

    await client.query('BEGIN');
    transactionStarted = true;
    if (shouldPersistSponsorUser && matchedSponsorUser) {
      await upsertMockUserRecord(matchedSponsorUser, { client });
    }
    await upsertMockUserRecord(newUser, { client, preferInsert: true });
    await upsertRegisteredMemberRecord(createdMember, { client, preferInsert: true });
    const sponsorFastTrackCreditResult = await creditSponsorFastTrackCommissionContainer({
      sponsorUser: matchedSponsorUser,
      fastTrackBonusAmount,
      client,
    });
    if (fastTrackBonusAmount > 0 && matchedSponsorUser) {
      try {
        const sponsorLedgerUserId = normalizeText(matchedSponsorUser?.id || matchedSponsorUser?.userId);
        await createFastTrackCommissionLedgerEntry({
          userId: sponsorLedgerUserId,
          username: normalizeText(matchedSponsorUser?.username),
          email: normalizeText(matchedSponsorUser?.email),
          sponsorUserId: sponsorLedgerUserId,
          sponsorUsername: normalizeText(matchedSponsorUser?.username),
          sponsorEmail: normalizeText(matchedSponsorUser?.email),
          sponsorFastTrackTier: resolvedSponsorFastTrackTier,
          enrolledUserId: normalizeText(createdMember?.userId || newUser?.id),
          enrolledUsername: normalizeText(createdMember?.memberUsername || newUser?.username),
          enrolledEmail: normalizeText(createdMember?.email || newUser?.email),
          enrolledName: normalizeText(createdMember?.fullName || newUser?.name),
          enrollmentId: normalizeText(payload?.enrollmentSourceId || createdMember?.id),
          orderReference: normalizeText(payload?.enrollmentOrderReference || payload?.invoiceId || payload?.invoice_id),
          paymentReference: normalizeText(payload?.paymentReference || payload?.paymentIntentId || payload?.checkoutSessionId),
          packageKey: enrollmentPackage,
          packageLabel: packageMeta?.label,
          amountUsd: fastTrackBonusAmount,
          status: sponsorFastTrackCreditResult ? 'posted' : 'failed',
          sourceId: normalizeText(payload?.enrollmentSourceId || createdMember?.id),
          sourceRef: normalizeText(payload?.enrollmentOrderReference || payload?.invoiceId || payload?.paymentIntentId || createdMember?.id),
          idempotencyKey: `fast_track:${normalizeText(payload?.enrollmentSourceId || createdMember?.id)}:${sponsorLedgerUserId}`,
          description: `Fast Track commission from enrollment ${normalizeText(createdMember?.memberUsername || createdMember?.id)}`,
          debug: {
            isAdminPlacement,
            creditApplied: Boolean(sponsorFastTrackCreditResult),
            enrollmentContext,
          },
        }, {
          executor: client,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error || 'Unknown ledger error.');
        console.warn(`[MemberEnrollment] Unable to persist Fast Track ledger entry for ${normalizeText(createdMember?.id)}: ${errorMessage}`);
      }
    }
    await upsertPasswordSetupTokenRecord(tokenRecord, { client, preferInsert: true });
    await insertMockEmailOutboxRecord(emailLogRecord, { client, preferInsert: true });
    await client.query('COMMIT');
    transactionStarted = false;

    return {
      success: true,
      status: 201,
      member: createdMember,
    };
  } catch (error) {
    if (transactionStarted) {
      await client.query('ROLLBACK');
    }
    throw error;
  } finally {
    client.release();
  }
}

export async function updateRegisteredMemberPlacement(payload = {}) {
  const memberId = normalizeText(payload?.memberId);
  const sponsorUsername = normalizeCredential(payload?.sponsorUsername);
  const sponsorName = normalizeText(payload?.sponsorName);
  const isAdminPlacement = Boolean(payload?.isAdminPlacement);
  const authenticatedMember = payload?.authenticatedMember && typeof payload.authenticatedMember === 'object'
    ? payload.authenticatedMember
    : null;
  const pendingEnrollmentRestriction = resolvePendingEnrollmentRestrictionResult(
    isAdminPlacement,
    authenticatedMember,
  );
  if (pendingEnrollmentRestriction) {
    return pendingEnrollmentRestriction;
  }
  const memberActorUsername = normalizeCredential(
    authenticatedMember?.username
    || authenticatedMember?.memberUsername
    || payload?.memberActorUsername
    || payload?.enrollerUsername,
  );
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

  if (!isAdminPlacement && !memberActorUsername) {
    return {
      success: false,
      status: 401,
      error: 'Member authentication is required to update placement.',
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
  if (!isAdminPlacement && memberSponsorUsername && memberSponsorUsername !== memberActorUsername) {
    return {
      success: false,
      status: 403,
      error: 'You can only update placement for members under your sponsor line.',
    };
  }
  if (!isAdminPlacement && sponsorUsername && sponsorUsername !== memberActorUsername) {
    return {
      success: false,
      status: 403,
      error: 'Sponsor reassignment is not available for member placement updates.',
    };
  }
  const shouldReassignSponsor = Boolean(
    sponsorUsername
    && sponsorUsername !== memberSponsorUsername
  );

  if (shouldReassignSponsor && !isAdminPlacement) {
    return {
      success: false,
      status: 403,
      error: 'You can only update placement for members under your sponsor line.',
    };
  }

  let nextSponsorUsername = normalizeText(existingMember?.sponsorUsername);
  let nextSponsorName = normalizeText(existingMember?.sponsorName);
  let memberUserAttributionStoreCodePatch = '';
  let shouldPatchMemberUserAttribution = false;
  const users = shouldReassignSponsor ? await readMockUsersStore() : [];

  if (shouldReassignSponsor) {
    const matchedSponsorUser = users.find(
      (user) => normalizeCredential(user?.username) === sponsorUsername
    ) || null;
    if (!matchedSponsorUser) {
      return {
        success: false,
        status: 404,
        error: 'Sponsor username was not found.',
      };
    }
    nextSponsorUsername = sponsorUsername;
    nextSponsorName = sponsorName
      || normalizeText(matchedSponsorUser?.name || matchedSponsorUser?.username || sponsorUsername);
    memberUserAttributionStoreCodePatch = resolveSponsorAttributionStoreCode(matchedSponsorUser);
    shouldPatchMemberUserAttribution = true;
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
    sponsorUsername: shouldReassignSponsor ? nextSponsorUsername : existingMember?.sponsorUsername,
    sponsorName: shouldReassignSponsor ? nextSponsorName : existingMember?.sponsorName,
    placementLeg,
    isSpillover: placementLeg === PLACEMENT_LEG_SPILLOVER,
    spilloverPlacementSide: placementLeg === PLACEMENT_LEG_SPILLOVER ? spilloverPlacementSide : '',
    spilloverParentReference: placementLeg === PLACEMENT_LEG_SPILLOVER ? effectiveSpilloverParentReference : '',
  };

  members[memberIndex] = updatedMember;
  await writeRegisteredMembersStore(members);

  if (shouldPatchMemberUserAttribution) {
    const updatedMemberUserId = normalizeText(updatedMember?.userId || updatedMember?.id);
    const updatedMemberUsername = normalizeCredential(updatedMember?.memberUsername || updatedMember?.username);
    const updatedMemberEmail = normalizeCredential(updatedMember?.email);

    const matchedUserIndex = users.findIndex((user) => {
      if (updatedMemberUserId && normalizeText(user?.id) === updatedMemberUserId) {
        return true;
      }

      const userUsername = normalizeCredential(user?.username);
      const userEmail = normalizeCredential(user?.email);
      return (
        (updatedMemberUsername && userUsername === updatedMemberUsername)
        || (updatedMemberEmail && userEmail === updatedMemberEmail)
      );
    });

    if (matchedUserIndex >= 0) {
      users[matchedUserIndex] = {
        ...users[matchedUserIndex],
        attributionStoreCode: memberUserAttributionStoreCodePatch,
      };
      await writeMockUsersStore(users);
    }
  }

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


export async function recordMemberPurchase(payload, options = {}) {
  const userId = normalizeText(payload?.userId);
  const username = normalizeCredential(payload?.username);
  const email = normalizeCredential(payload?.email);
  const pvGain = Math.max(0, Math.floor(Number(payload?.pvGain) || 0));
  const persistMode = normalizeCredential(options?.persistMode || 'rewrite');
  const useTargetedPersistence = persistMode === 'upsert';
  const allowPendingPersonalBvCredit = options?.allowPendingPersonalBvCredit === true;

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
  const isPendingReservationMember = isPendingOrReservationMember(existingUser);
  if (isPendingReservationMember && !allowPendingPersonalBvCredit) {
    return buildAccountUpgradeRequiredResult();
  }
  const userPackageKey = normalizeCredential(existingUser?.enrollmentPackage);
  const userRankKey = normalizeCredential(
    normalizeRankLabelForDisplay(existingUser?.accountRank || existingUser?.rank)
  );
  const isFreeAccountUser = userPackageKey === FREE_ACCOUNT_PACKAGE_KEY || userRankKey === normalizeCredential(FREE_ACCOUNT_RANK_LABEL);
  const effectivePvGain = isFreeAccountUser ? 0 : pvGain;
  const personalBvSnapshot = resolveMemberPersonalBvSnapshot(existingUser, { referenceDate: now });

  const enrollmentPackageBv = Math.max(0, Math.floor(Number(existingUser?.enrollmentPackageBv) || 0));
  const currentStarterPersonalPv = Math.max(
    0,
    Math.floor(Number(existingUser?.starterPersonalPv) || enrollmentPackageBv)
  );
  const nextStarterPersonalPvSafe = currentStarterPersonalPv + effectivePvGain;
  const nextCurrentPersonalPvBv = Math.max(
    0,
    personalBvSnapshot.currentPersonalPvBv + effectivePvGain,
  );
  const nextActivityState = isPendingReservationMember
    ? null
    : resolveMemberActivityStateByPersonalBv({
        ...existingUser,
        starterPersonalPv: nextStarterPersonalPvSafe,
        currentPersonalPvBv: nextCurrentPersonalPvBv,
        lastProductPurchaseAt: nowIso,
        lastPurchaseAt: nowIso,
      }, {
        referenceDate: now,
      });
  const nextActivityActiveUntilAt = normalizeText(
    nextActivityState?.activeUntilAt
    || existingUser?.activityActiveUntilAt
    || '',
  );
  const nextAccountStatus = isPendingReservationMember
    ? 'pending'
    : normalizeText(nextActivityState?.accountStatus) || 'inactive';

  users[userIndex] = {
    ...existingUser,
    starterPersonalPv: nextStarterPersonalPvSafe,
    currentPersonalPvBv: nextCurrentPersonalPvBv,
    accountStatus: nextAccountStatus,
    activityActiveUntilAt: nextActivityActiveUntilAt,
    lastProductPurchaseAt: nowIso,
    lastPurchaseAt: nowIso,
  };

  if (useTargetedPersistence) {
    await upsertMockUserRecord(users[userIndex]);
  } else {
    await writeMockUsersStore(users);
  }

  const matchedUser = users[userIndex];
  const identity = {
    userId: normalizeText(matchedUser?.id),
    username: normalizeCredential(matchedUser?.username),
    email: normalizeCredential(matchedUser?.email),
  };
  const primaryMemberIndex = resolvePrimaryMemberIndexForIdentity(members, identity);

  const updatedMembers = members.map((member, index) => {
    if (index !== primaryMemberIndex || isBusinessCenterPlaceholderMember(member)) {
      return member;
    }

    return {
      ...member,
      starterPersonalPv: nextStarterPersonalPvSafe,
      currentPersonalPvBv: nextCurrentPersonalPvBv,
      accountStatus: nextAccountStatus,
      status: nextAccountStatus,
      activityActiveUntilAt: nextActivityActiveUntilAt,
      lastProductPurchaseAt: nowIso,
      lastPurchaseAt: nowIso,
    };
  });

  if (useTargetedPersistence) {
    if (primaryMemberIndex >= 0 && !isBusinessCenterPlaceholderMember(members[primaryMemberIndex])) {
      const nextPrimaryMember = updatedMembers[primaryMemberIndex];
      if (nextPrimaryMember) {
        await upsertRegisteredMemberRecord(nextPrimaryMember);
      }
    }
  } else {
    await writeRegisteredMembersStore(updatedMembers);
  }

  return {
    success: true,
    status: 200,
    user: {
      id: users[userIndex]?.id || '',
      username: users[userIndex]?.username || '',
      email: users[userIndex]?.email || '',
      starterPersonalPv: nextStarterPersonalPvSafe,
      currentPersonalPvBv: nextCurrentPersonalPvBv,
      activityActiveUntilAt: nextActivityActiveUntilAt,
      lastProductPurchaseAt: nowIso,
      lastPurchaseAt: nowIso,
    },
    purchase: {
      pvGain: effectivePvGain,
      starterPersonalPv: nextStarterPersonalPvSafe,
      currentPersonalPvBv: nextCurrentPersonalPvBv,
    },
  };
}

export async function createRegisteredMemberCheckoutSession(payload = {}, context = {}) {
  let stripe = null;
  try {
    stripe = resolveStripeClient();
  } catch (error) {
    return {
      success: false,
      status: 503,
      error: error instanceof Error ? error.message : 'Stripe is unavailable.',
    };
  }

  const fullName = normalizeText(payload?.fullName);
  const email = normalizeText(payload?.email);
  const memberUsernameInput = normalizeText(payload?.memberUsername);
  const countryFlag = normalizeCountryFlag(payload?.countryFlag);
  const sponsorUsernameInput = normalizeCredential(payload?.sponsorUsername);
  const sponsorNameInput = normalizeText(payload?.sponsorName);
  const isAdminPlacement = Boolean(payload?.isAdminPlacement);
  const enrollmentContext = isAdminPlacement ? 'admin' : 'member';
  const placementLegInput = normalizePlacementLeg(payload?.placementLeg, {
    allowSpillover: true,
    fallback: PLACEMENT_LEG_LEFT,
  });
  const placementLegInputRaw = normalizeCredential(payload?.placementLeg);
  const spilloverPlacementSideInput = (
    normalizeCredential(payload?.spilloverPlacementSide) === PLACEMENT_LEG_RIGHT
    || placementLegInputRaw === 'spillover-right'
    || placementLegInputRaw === 'spillover_right'
    || placementLegInputRaw === 'spillover right'
  )
    ? PLACEMENT_LEG_RIGHT
    : PLACEMENT_LEG_LEFT;
  const requestedSpilloverParentMode = normalizeCredential(payload?.spilloverParentMode || 'auto');
  const spilloverParentModeInput = requestedSpilloverParentMode === 'manual' ? 'manual' : 'auto';
  const spilloverParentReferenceInput = normalizeText(payload?.spilloverParentReference);
  const enrollmentPackage = normalizeCredential(payload?.enrollmentPackage);
  const enrollmentProductKey = resolveEnrollmentProductKey(
    payload?.enrollmentProductKey
    || payload?.enrollment_product_key
    || payload?.enrollmentProduct
    || payload?.enrollment_product
    || payload?.productKey
    || payload?.product_key,
    enrollmentPackage,
  );
  const requestedFastTrackTier = normalizeCredential(
    payload?.fastTrackTier || FAST_TRACK_TIER_BY_PACKAGE[enrollmentPackage]
  );
  const billingAddress = normalizeText(payload?.billingAddress);
  const billingCity = normalizeText(payload?.billingCity);
  const billingState = normalizeText(payload?.billingState);
  const billingPostalCode = normalizeText(payload?.billingPostalCode);
  const billingCountry = normalizeText(payload?.billingCountry);
  const billingCountryCode = normalizeText(payload?.billingCountryCode).toUpperCase();
  const authenticatedMember = payload?.authenticatedMember && typeof payload.authenticatedMember === 'object'
    ? payload.authenticatedMember
    : null;
  const pendingEnrollmentRestriction = resolvePendingEnrollmentRestrictionResult(
    isAdminPlacement,
    authenticatedMember,
  );
  if (pendingEnrollmentRestriction) {
    return pendingEnrollmentRestriction;
  }
  const authenticatedMemberDisplayName = normalizeText(
    authenticatedMember?.name
    || authenticatedMember?.fullName
    || authenticatedMember?.username
    || authenticatedMember?.memberUsername,
  );

  if (!fullName || !email) {
    return {
      success: false,
      status: 400,
      error: 'Full name and email are required.',
    };
  }

  const placementPolicy = await resolveServerEnforcedEnrollmentPlacement({
    ...payload,
    isAdminPlacement,
    sponsorUsername: sponsorUsernameInput,
    placementLeg: placementLegInput,
    spilloverPlacementSide: spilloverPlacementSideInput,
    spilloverParentMode: spilloverParentModeInput,
    spilloverParentReference: spilloverParentReferenceInput,
    authenticatedMember,
  });
  const actorUsername = normalizeCredential(placementPolicy?.actorUsername);
  if (!isAdminPlacement && !actorUsername) {
    return {
      success: false,
      status: 401,
      error: 'Member authentication is required to submit enrollment.',
    };
  }

  const sponsorUsername = normalizeCredential(placementPolicy?.sponsorUsername || sponsorUsernameInput);
  if (!sponsorUsername) {
    return {
      success: false,
      status: 400,
      error: 'Sponsor username is required for member enrollment.',
    };
  }
  const sponsorName = normalizeText(
    sponsorNameInput
    || (sponsorUsername === actorUsername ? authenticatedMemberDisplayName : '')
    || sponsorUsername,
  );
  const placementLeg = normalizePlacementLeg(placementPolicy?.placementLeg, {
    allowSpillover: true,
    fallback: PLACEMENT_LEG_LEFT,
  });
  const spilloverPlacementSide = placementLeg === PLACEMENT_LEG_SPILLOVER
    ? resolvePlacementSideFromLeg(placementLeg, placementPolicy?.spilloverPlacementSide)
    : '';
  const spilloverParentMode = (
    placementLeg === PLACEMENT_LEG_SPILLOVER
    && normalizeCredential(placementPolicy?.spilloverParentMode) === 'manual'
  )
    ? 'manual'
    : 'auto';
  const effectiveSpilloverParentReference = (
    placementLeg === PLACEMENT_LEG_SPILLOVER && spilloverParentMode === 'manual'
  )
    ? normalizeText(placementPolicy?.spilloverParentReference)
    : '';

  if (!FAST_TRACK_PACKAGE_META[enrollmentPackage]) {
    return {
      success: false,
      status: 400,
      error: 'Invalid enrollment package.',
    };
  }

  const checkoutSummary = resolveEnrollmentCheckoutSummary(enrollmentPackage);
  if (checkoutSummary.total <= 0) {
    return {
      success: false,
      status: 400,
      error: 'Only paid enrollment packages are allowed in this panel.',
    };
  }

  if (!FAST_TRACK_TIER_META[requestedFastTrackTier]) {
    return {
      success: false,
      status: 400,
      error: 'Invalid Fast Track tier.',
    };
  }

  if (
    placementLeg === PLACEMENT_LEG_SPILLOVER
    && spilloverParentMode === 'manual'
    && !effectiveSpilloverParentReference
  ) {
    return {
      success: false,
      status: 400,
      error: 'Manual spillover placement requires a receiving parent reference.',
    };
  }

  const existingUserByEmail = await findUserByEmail(email);
  if (existingUserByEmail) {
    return {
      success: false,
      status: 409,
      error: 'A member with this email already exists.',
    };
  }

  const members = await readRegisteredMembersStore();
  const existingMember = resolveExistingRegisteredMemberByIdentity(members, {
    email,
    memberUsername: memberUsernameInput,
  });
  if (existingMember) {
    return {
      success: false,
      status: 409,
      error: 'A member with this email already exists.',
    };
  }

  const existingInvoices = await readMockStoreInvoicesStore();
  const invoiceIdSeed = resolveNextStoreInvoiceId(existingInvoices);
  const invoiceId = `${invoiceIdSeed}-${String(randomInt(100, 1000))}`;
  const packageBv = toWholeNumber(checkoutSummary.packageBv, 0);
  const origin = resolveRequestOrigin(context);
  const returnUrls = resolveEnrollmentCheckoutReturnUrls(origin, payload.returnPath);

  const paymentIntentMetadata = {
    flow: sanitizeStripeMetadataValue(ENROLLMENT_PAYMENT_FLOW),
    source: sanitizeStripeMetadataValue('binary-tree-next'),
    invoice_id: sanitizeStripeMetadataValue(invoiceId),
    enrollment_context: sanitizeStripeMetadataValue(enrollmentContext),
    full_name: sanitizeStripeMetadataValue(fullName),
    email: sanitizeStripeMetadataValue(email),
    member_username: sanitizeStripeMetadataValue(memberUsernameInput),
    country_flag: sanitizeStripeMetadataValue(countryFlag),
    placement_leg: sanitizeStripeMetadataValue(placementLeg),
    spillover_placement_side: sanitizeStripeMetadataValue(spilloverPlacementSide),
    spillover_parent_mode: sanitizeStripeMetadataValue(spilloverParentMode),
    spillover_parent_reference: sanitizeStripeMetadataValue(effectiveSpilloverParentReference),
    enrollment_package: sanitizeStripeMetadataValue(enrollmentPackage),
    enrollment_product_key: sanitizeStripeMetadataValue(enrollmentProductKey),
    fast_track_tier: sanitizeStripeMetadataValue(requestedFastTrackTier),
    sponsor_username: sanitizeStripeMetadataValue(sponsorUsername),
    sponsor_name: sanitizeStripeMetadataValue(sponsorName || sponsorUsername),
    billing_address: sanitizeStripeMetadataValue(billingAddress),
    billing_city: sanitizeStripeMetadataValue(billingCity),
    billing_state: sanitizeStripeMetadataValue(billingState),
    billing_postal_code: sanitizeStripeMetadataValue(billingPostalCode),
    billing_country: sanitizeStripeMetadataValue(billingCountry),
    billing_country_code: sanitizeStripeMetadataValue(billingCountryCode),
    package_label: sanitizeStripeMetadataValue(checkoutSummary.packageLabel),
    package_bv: String(packageBv),
    subtotal: String(checkoutSummary.subtotal),
    discount_amount: String(checkoutSummary.discount),
    tax_amount: String(checkoutSummary.tax),
    total_amount: String(checkoutSummary.total),
  };

  const sessionMetadata = {
    checkout_type: sanitizeStripeMetadataValue('member-enrollment'),
    payment_flow: sanitizeStripeMetadataValue('hosted-session'),
    invoice_id: paymentIntentMetadata.invoice_id,
    enrollment_context: paymentIntentMetadata.enrollment_context,
    sponsor_username: paymentIntentMetadata.sponsor_username,
    enrollment_package: paymentIntentMetadata.enrollment_package,
    enrollment_product_key: paymentIntentMetadata.enrollment_product_key,
    package_label: paymentIntentMetadata.package_label,
    package_bv: paymentIntentMetadata.package_bv,
    total_amount: paymentIntentMetadata.total_amount,
    source: paymentIntentMetadata.source,
  };
  let stripeCustomerId = '';
  try {
    const customerResolution = await resolveOrCreateStripeCustomerForUserIdentity({
      email,
      name: fullName,
    }, {
      stripe,
      allowCreate: true,
      metadata: {
        checkout_type: 'member-enrollment',
      },
    });
    stripeCustomerId = normalizeText(customerResolution?.customerId);
  } catch {
    stripeCustomerId = '';
  }

  if (stripeCustomerId) {
    paymentIntentMetadata.stripe_customer_id = sanitizeStripeMetadataValue(stripeCustomerId);
    sessionMetadata.stripe_customer_id = sanitizeStripeMetadataValue(stripeCustomerId);
  }

  const packageLabel = checkoutSummary.packageLabel || 'Enrollment Package';
  const lineItemName = `${packageLabel} Enrollment`;
  const lineItemDescription = packageBv > 0
    ? `${packageBv} BV`
    : '';
  const taxableAmountMinor = resolveCurrencyMinorAmount(checkoutSummary.total);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: returnUrls.successUrl,
      cancel_url: returnUrls.cancelUrl,
      automatic_tax: {
        enabled: true,
      },
      customer: stripeCustomerId || undefined,
      customer_email: stripeCustomerId ? undefined : (email || undefined),
      customer_creation: stripeCustomerId ? undefined : 'always',
      customer_update: stripeCustomerId
        ? {
          address: 'auto',
          name: 'auto',
        }
        : undefined,
      invoice_creation: {
        enabled: true,
        invoice_data: {
          metadata: {
            invoice_id: sessionMetadata.invoice_id,
            checkout_type: sessionMetadata.checkout_type,
            source: sessionMetadata.source,
          },
        },
      },
      billing_address_collection: 'required',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: taxableAmountMinor,
            product_data: {
              name: lineItemName,
              description: lineItemDescription || undefined,
            },
          },
          quantity: 1,
        },
      ],
      metadata: sessionMetadata,
      payment_intent_data: {
        receipt_email: email || undefined,
        metadata: paymentIntentMetadata,
      },
    });

    if (!session?.id || !session?.url) {
      return {
        success: false,
        status: 500,
        error: 'Stripe checkout session was not created.',
      };
    }

    return {
      success: true,
      status: 201,
      data: {
        success: true,
        sessionId: session.id,
        sessionUrl: session.url,
        checkout: {
          invoiceId,
          packageLabel: checkoutSummary.packageLabel,
          packageBv: packageBv,
          subtotal: checkoutSummary.subtotal,
          discount: checkoutSummary.discount,
          tax: checkoutSummary.tax,
          total: checkoutSummary.total,
        },
      },
    };
  } catch (error) {
    const message = error instanceof Error && error.message
      ? error.message
      : 'Unable to create Stripe checkout session.';

    return {
      success: false,
      status: 502,
      error: message,
    };
  }
}

export async function completeRegisteredMemberCheckoutSession(payload = {}) {
  let stripe = null;
  try {
    stripe = resolveStripeClient();
  } catch (error) {
    return {
      success: false,
      status: 503,
      error: error instanceof Error ? error.message : 'Stripe is unavailable.',
    };
  }

  const sessionId = normalizeText(payload?.sessionId);
  if (!sessionId) {
    return {
      success: false,
      status: 400,
      error: 'Checkout session ID is required.',
    };
  }

  let session = null;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (error) {
    const message = error instanceof Error && error.message
      ? error.message
      : 'Unable to retrieve checkout session.';

    return {
      success: false,
      status: 404,
      error: message,
    };
  }

  const paymentStatus = normalizeText(session?.payment_status).toLowerCase();
  const checkoutStatus = normalizeText(session?.status).toLowerCase();
  const isPaid = paymentStatus === 'paid';
  const isComplete = checkoutStatus === 'complete';

  if (!isPaid || !isComplete) {
    return {
      success: true,
      status: 202,
      data: {
        success: true,
        completed: false,
        paid: isPaid,
        checkoutSession: {
          id: session?.id || sessionId,
          paymentStatus: session?.payment_status || '',
          status: session?.status || '',
        },
      },
    };
  }

  const paymentIntentId = normalizeText(
    typeof session?.payment_intent === 'string'
      ? session.payment_intent
      : session?.payment_intent?.id,
  );
  if (!paymentIntentId) {
    return {
      success: false,
      status: 409,
      error: 'Checkout session did not include a payment intent reference.',
    };
  }

  const completionResult = await completeRegisteredMemberPaymentIntent({
    paymentIntentId,
    isAdminPlacement: Boolean(payload?.isAdminPlacement),
    authenticatedMember: payload?.authenticatedMember || null,
    checkoutSessionId: session?.id || sessionId,
    checkoutSessionCustomerId: resolveStripeCustomerId(session?.customer),
    checkoutSessionPaymentStatus: session?.payment_status || '',
  });
  if (!completionResult.success) {
    return completionResult;
  }

  const safeCompletionData = completionResult.data && typeof completionResult.data === 'object'
    ? completionResult.data
    : {};

  return {
    success: true,
    status: completionResult.status,
    data: {
      ...safeCompletionData,
      checkoutSession: {
        id: session?.id || sessionId,
        paymentStatus: session?.payment_status || '',
        status: session?.status || '',
      },
    },
  };
}

export async function upgradeMemberAccount(payload, options = {}) {
  const userId = normalizeText(payload?.userId);
  const username = normalizeCredential(payload?.username);
  const email = normalizeCredential(payload?.email);
  const targetPackageInput = normalizeCredential(payload?.targetPackage);
  const requestedSplitSelectedProductKey = normalizeAccountUpgradeSplitProductKey(
    payload?.upgradeSplitSelectedProductKey
    || payload?.upgradeSplitProductKey
    || payload?.accountUpgradeSelectedProductKey
    || payload?.upgradeProductKey
    || payload?.selectedProductKey,
  );
  const requestedSplitProductMode = normalizeAccountUpgradeProductMode(
    payload?.upgradeSplitProductMode
    || payload?.accountUpgradeProductMode
    || payload?.account_upgrade_product_mode
    || payload?.upgradeProductMode
    || payload?.selectedProductMode
    || '',
    requestedSplitSelectedProductKey,
    targetPackageInput,
  );
  const persistMode = normalizeCredential(options?.persistMode || 'rewrite');
  const useTargetedPersistence = persistMode === 'upsert';

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
    const normalizedPackageKey = normalizeCredential(packageKey);
    if (normalizedPackageKey === MEMBERSHIP_PLACEMENT_RESERVATION_PACKAGE_KEY) {
      return ACCOUNT_UPGRADE_PACKAGE_ORDER.indexOf(FREE_ACCOUNT_PACKAGE_KEY);
    }
    return ACCOUNT_UPGRADE_PACKAGE_ORDER.indexOf(normalizedPackageKey);
  }

  function resolveNextPackageKeyForUpgrade(currentPackageKey) {
    if (isMembershipPlacementReservationPackage(currentPackageKey)) {
      return 'personal-builder-pack';
    }
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
  const existingIdentity = {
    userId: normalizeText(existingUser?.id),
    username: normalizeCredential(existingUser?.username),
    email: normalizeCredential(existingUser?.email),
  };
  const existingPrimaryMemberIndexForUpgrade = resolvePrimaryMemberIndexForIdentity(
    members,
    existingIdentity,
  );
  const existingPrimaryMemberRecordForUpgrade = existingPrimaryMemberIndexForUpgrade >= 0
    ? members[existingPrimaryMemberIndexForUpgrade]
    : null;
  const currentPackageProductKey = resolveCurrentPackageProductKeyFromSource(existingUser)
    || resolveCurrentPackageProductKeyFromSource(existingPrimaryMemberRecordForUpgrade)
    || ENROLLMENT_DEFAULT_PRODUCT_KEY;

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
  const currentPackageBv = Math.max(0, toWholeNumber(currentPackageMeta?.bv, 0));
  const nextPackageBv = Math.max(currentPackageBv, toWholeNumber(nextPackageMeta?.bv, currentPackageBv));
  const currentPackagePrice = roundCurrencyAmount(Number(currentPackageMeta?.price) || 0);
  const nextPackagePrice = Math.max(currentPackagePrice, roundCurrencyAmount(Number(nextPackageMeta?.price) || currentPackagePrice));
  const currentPackageProducts = resolvePackageProductCount(currentPackageKey);
  const nextPackageProducts = Math.max(currentPackageProducts, resolvePackageProductCount(targetPackageKey));
  const upgradeProductCount = Math.max(0, nextPackageProducts - currentPackageProducts);
  const productAllocation = resolveAccountUpgradeProductAllocation({
    currentPackageKey,
    targetPackageKey,
    selectedProductKey: requestedSplitSelectedProductKey,
    selectedProductMode: requestedSplitProductMode,
    currentPackageProductKey,
  });
  const nextCurrentPackageProductKey = productAllocation.selectedProductMode === ACCOUNT_UPGRADE_PRODUCT_MODE_SPLIT
    ? ACCOUNT_PACKAGE_PRODUCT_KEY_SPLIT
    : (
        normalizeAccountUpgradeSplitProductKey(productAllocation.selectedProductKey)
        || currentPackageProductKey
      );
  const upgradeBvGain = Math.max(0, nextPackageBv - currentPackageBv);
  const upgradePriceDue = roundCurrencyAmount(upgradeProductCount * PACKAGE_PRODUCT_PRICE_USD);
  const currentStarterPersonalPv = Math.max(
    0,
    Math.floor(Number(existingUser?.starterPersonalPv) || currentPackageBv)
  );
  const nextStarterPersonalPv = currentStarterPersonalPv + upgradeBvGain;

  const nextRank = STARTING_RANK_BY_PACKAGE[targetPackageKey]
    || normalizeRankLabelForDisplay(existingUser?.accountRank || existingUser?.rank)
    || 'Personal';

  const personalBvSnapshot = resolveMemberPersonalBvSnapshot(existingUser, { referenceDate: now });
  const nextCurrentPersonalPvBv = Math.max(
    0,
    personalBvSnapshot.currentPersonalPvBv + upgradeBvGain,
  );
  const nextActivityState = resolveMemberActivityStateByPersonalBv({
    ...existingUser,
    enrollmentPackage: targetPackageKey,
    enrollmentPackageBv: nextPackageBv,
    starterPersonalPv: nextStarterPersonalPv,
    currentPersonalPvBv: nextCurrentPersonalPvBv,
    rank: nextRank,
    accountRank: nextRank,
    lastProductPurchaseAt: nowIso,
    lastPurchaseAt: nowIso,
    lastAccountUpgradeAt: nowIso,
    accountStatus: '',
    status: '',
  }, {
    referenceDate: now,
  });
  const nextActivityActiveUntilAt = normalizeText(
    nextActivityState?.activeUntilAt
    || existingUser?.activityActiveUntilAt
    || '',
  );
  const nextAccountStatus = normalizeText(nextActivityState?.accountStatus) || 'inactive';

  users[userIndex] = {
    ...existingUser,
    enrollmentPackage: targetPackageKey,
    currentPackageProductKey: nextCurrentPackageProductKey,
    enrollmentPackageLabel: nextPackageMeta.label,
    enrollmentPackagePrice: nextPackagePrice,
    enrollmentPackageBv: nextPackageBv,
    starterPersonalPv: nextStarterPersonalPv,
    currentPersonalPvBv: nextCurrentPersonalPvBv,
    rank: nextRank,
    accountRank: nextRank,
    accountStatus: nextAccountStatus,
    status: nextAccountStatus,
    activityActiveUntilAt: nextActivityActiveUntilAt,
    lastProductPurchaseAt: nowIso,
    lastPurchaseAt: nowIso,
    lastAccountUpgradeAt: nowIso,
    lastAccountUpgradeFromPackage: currentPackageKey,
    lastAccountUpgradeToPackage: targetPackageKey,
    lastAccountUpgradePvGain: upgradeBvGain,
  };

  const matchedUser = users[userIndex];
  const identity = {
    userId: normalizeText(matchedUser?.id),
    username: normalizeCredential(matchedUser?.username),
    email: normalizeCredential(matchedUser?.email),
  };
  const primaryMemberIndex = resolvePrimaryMemberIndexForIdentity(members, identity);
  const sourceMemberRecord = primaryMemberIndex >= 0 ? members[primaryMemberIndex] : null;

  function resolveSponsorUsernameFromAttributionCode(candidateCode = '') {
    const normalizedCandidateCode = normalizeCredential(candidateCode);
    if (!normalizedCandidateCode) {
      return '';
    }

    const matchedOwner = users.find((user) => {
      const ownerStoreCode = normalizeCredential(user?.storeCode);
      const ownerPublicStoreCode = normalizeCredential(user?.publicStoreCode);
      return ownerStoreCode === normalizedCandidateCode
        || ownerPublicStoreCode === normalizedCandidateCode;
    });

    return normalizeCredential(matchedOwner?.username);
  }

  const directSponsorUsernameForFastTrackUpgrade = normalizeCredential(
    sourceMemberRecord?.sponsorUsername
    || sourceMemberRecord?.sponsor_username
    || matchedUser?.sponsorUsername
    || matchedUser?.sponsor_username,
  );
  const attributionStoreCodeForFastTrackUpgrade = normalizeCredential(
    sourceMemberRecord?.attributionStoreCode
    || sourceMemberRecord?.attribution_store_code
    || matchedUser?.attributionStoreCode
    || matchedUser?.attribution_store_code,
  );
  const attributedSponsorUsernameForFastTrackUpgrade = resolveSponsorUsernameFromAttributionCode(
    attributionStoreCodeForFastTrackUpgrade,
  );
  const sponsorUsernameForFastTrackUpgrade = directSponsorUsernameForFastTrackUpgrade
    || attributedSponsorUsernameForFastTrackUpgrade;
  const sponsorResolutionSourceLabel = directSponsorUsernameForFastTrackUpgrade
    ? 'direct sponsor'
    : (attributedSponsorUsernameForFastTrackUpgrade ? 'store attribution owner' : 'unresolved');

  const isFirstPaidUpgradeFromEntryPlan = (
    (
      currentPackageKey === FREE_ACCOUNT_PACKAGE_KEY
      || currentPackageKey === MEMBERSHIP_PLACEMENT_RESERVATION_PACKAGE_KEY
    )
    && targetPackageKey !== FREE_ACCOUNT_PACKAGE_KEY
    && targetPackageKey !== MEMBERSHIP_PLACEMENT_RESERVATION_PACKAGE_KEY
  );
  let fastTrackUpgradeBonusAmount = 0;
  let fastTrackUpgradeBonusApplied = false;
  let fastTrackUpgradeSponsorUsername = '';
  let fastTrackUpgradeSponsorTier = '';
  let fastTrackUpgradeBonusMessage = isFirstPaidUpgradeFromEntryPlan
    ? 'First paid upgrade detected. Fast Track sponsor credit is pending.'
    : 'Fast Track bonus is disabled for paid-to-paid upgrades.';

  let updatedMemberRecord = null;

  const updatedMembers = members.map((member, index) => {
    if (index !== primaryMemberIndex || isBusinessCenterPlaceholderMember(member)) {
      return member;
    }

    const upgradedMember = {
      ...member,
      enrollmentPackage: targetPackageKey,
      currentPackageProductKey: nextCurrentPackageProductKey,
      enrollmentPackageLabel: nextPackageMeta.label,
      packagePrice: nextPackagePrice,
      packageBv: nextPackageBv,
      starterPersonalPv: nextStarterPersonalPv,
      currentPersonalPvBv: nextCurrentPersonalPvBv,
      rank: nextRank,
      accountRank: nextRank,
      accountStatus: nextAccountStatus,
      status: nextAccountStatus,
      activityActiveUntilAt: nextActivityActiveUntilAt,
      lastProductPurchaseAt: nowIso,
      lastPurchaseAt: nowIso,
      lastAccountUpgradeAt: nowIso,
      lastAccountUpgradeFromPackage: currentPackageKey,
      lastAccountUpgradeToPackage: targetPackageKey,
      lastAccountUpgradePvGain: upgradeBvGain,
      isEarningEligible: true,
      activationStatus: 'active',
    };

    updatedMemberRecord = upgradedMember;
    return upgradedMember;
  });

  if (useTargetedPersistence) {
    await upsertMockUserRecord(users[userIndex]);
    if (updatedMemberRecord) {
      await upsertRegisteredMemberRecord(updatedMemberRecord);
    }
  } else {
    await writeMockUsersStore(users);
    await writeRegisteredMembersStore(updatedMembers);
  }

  if (isFirstPaidUpgradeFromEntryPlan) {
    if (!sponsorUsernameForFastTrackUpgrade) {
      fastTrackUpgradeBonusMessage = 'First paid upgrade completed, but sponsor was missing so Fast Track was skipped.';
    } else {
      const matchedSponsorUser = users.find((user) => (
        normalizeCredential(user?.username) === sponsorUsernameForFastTrackUpgrade
      )) || await findUserByUsername(sponsorUsernameForFastTrackUpgrade);

      if (!matchedSponsorUser) {
        fastTrackUpgradeBonusMessage = 'First paid upgrade completed, but sponsor account was not found so Fast Track was skipped.';
      } else {
        const resolvedSponsorFastTrackTier = resolveFastTrackTierFromSponsorUser(matchedSponsorUser);
        fastTrackUpgradeSponsorUsername = normalizeText(
          matchedSponsorUser?.username || sponsorUsernameForFastTrackUpgrade,
        );
        fastTrackUpgradeSponsorTier = resolvedSponsorFastTrackTier;

        if (!FAST_TRACK_TIER_META[resolvedSponsorFastTrackTier]) {
          fastTrackUpgradeBonusMessage = 'First paid upgrade completed, but sponsor Fast Track tier was invalid.';
        } else {
          fastTrackUpgradeBonusAmount = resolveFastTrackBonusAmount({
            enrollmentPackage: targetPackageKey,
            sponsorFastTrackTier: resolvedSponsorFastTrackTier,
            isAdminPlacement: false,
          });

          if (fastTrackUpgradeBonusAmount > 0) {
            const fastTrackCreditResult = await creditSponsorFastTrackCommissionContainer({
              sponsorUser: matchedSponsorUser,
              fastTrackBonusAmount: fastTrackUpgradeBonusAmount,
            });
            fastTrackUpgradeBonusApplied = Boolean(fastTrackCreditResult);
            try {
              const sponsorLedgerUserId = normalizeText(matchedSponsorUser?.id || matchedSponsorUser?.userId);
              await createFastTrackCommissionLedgerEntry({
                userId: sponsorLedgerUserId,
                username: normalizeText(matchedSponsorUser?.username),
                email: normalizeText(matchedSponsorUser?.email),
                sponsorUserId: sponsorLedgerUserId,
                sponsorUsername: normalizeText(matchedSponsorUser?.username),
                sponsorEmail: normalizeText(matchedSponsorUser?.email),
                sponsorFastTrackTier: resolvedSponsorFastTrackTier,
                enrolledUserId: normalizeText(matchedUser?.id),
                enrolledUsername: normalizeText(matchedUser?.username),
                enrolledEmail: normalizeText(matchedUser?.email),
                enrolledName: normalizeText(matchedUser?.name),
                enrollmentId: `upgrade:${normalizeText(matchedUser?.id)}:${targetPackageKey}`,
                orderReference: normalizeText(payload?.orderReference || payload?.invoiceId || payload?.invoice_id),
                paymentReference: normalizeText(payload?.paymentReference || payload?.paymentIntentId || payload?.checkoutSessionId),
                packageKey: targetPackageKey,
                packageLabel: nextPackageMeta?.label,
                amountUsd: fastTrackUpgradeBonusAmount,
                status: fastTrackUpgradeBonusApplied ? 'posted' : 'failed',
                sourceId: `upgrade:${normalizeText(matchedUser?.id)}:${targetPackageKey}`,
                sourceRef: normalizeText(payload?.orderReference || payload?.invoiceId || targetPackageKey),
                idempotencyKey: `fast_track:upgrade:${normalizeText(matchedUser?.id)}:${targetPackageKey}:${sponsorLedgerUserId}`,
                description: `Fast Track commission from first paid upgrade (${targetPackageKey})`,
                debug: {
                  source: 'account-upgrade',
                  sponsorResolutionSource: sponsorResolutionSourceLabel,
                  creditApplied: fastTrackUpgradeBonusApplied,
                },
              });
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : String(error || 'Unknown ledger error.');
              console.warn(`[AccountUpgrade] Unable to persist Fast Track ledger entry for ${normalizeText(matchedUser?.id)}: ${errorMessage}`);
            }
            fastTrackUpgradeBonusMessage = fastTrackUpgradeBonusApplied
              ? `Fast Track bonus credited to ${sponsorResolutionSourceLabel} from first paid upgrade.`
              : 'First paid upgrade completed, but Fast Track commission wallet write failed.';
          } else {
            fastTrackUpgradeBonusMessage = 'First paid upgrade completed with zero Fast Track bonus amount.';
          }
        }
      }
    }
  }

  return {
    success: true,
    status: 200,
    user: {
      id: users[userIndex]?.id || '',
      username: users[userIndex]?.username || '',
      email: users[userIndex]?.email || '',
      enrollmentPackage: targetPackageKey,
      currentPackageProductKey: nextCurrentPackageProductKey,
      enrollmentPackageLabel: nextPackageMeta.label,
      enrollmentPackagePrice: nextPackagePrice,
      enrollmentPackageBv: nextPackageBv,
      starterPersonalPv: nextStarterPersonalPv,
      currentPersonalPvBv: nextCurrentPersonalPvBv,
      rank: nextRank,
      accountRank: nextRank,
      activityActiveUntilAt: nextActivityActiveUntilAt,
      lastProductPurchaseAt: nowIso,
      lastPurchaseAt: nowIso,
    },
    member: updatedMemberRecord,
    upgrade: {
      fromPackage: currentPackageKey,
      fromPackageProductKey: currentPackageProductKey,
      toPackage: targetPackageKey,
      toPackageProductKey: nextCurrentPackageProductKey,
      currentPackagePrice,
      currentPackageBv,
      currentPackageProducts,
      targetPackagePrice: nextPackagePrice,
      targetPackageBv: nextPackageBv,
      targetPackageProducts: nextPackageProducts,
      price: nextPackagePrice,
      bv: nextPackageBv,
      priceDue: upgradePriceDue,
      bvGain: upgradeBvGain,
      pvGain: upgradeBvGain,
      productCount: upgradeProductCount,
      productBv: upgradeProductCount * PACKAGE_PRODUCT_BV,
      productAllocation,
      fastTrackBonusApplied: fastTrackUpgradeBonusApplied,
      fastTrackBonusAmount: fastTrackUpgradeBonusAmount,
      fastTrackBonusSponsorUsername: fastTrackUpgradeSponsorUsername,
      fastTrackBonusSponsorTier: fastTrackUpgradeSponsorTier,
      fastTrackBonusMessage: fastTrackUpgradeBonusMessage,
    },
  };
}
