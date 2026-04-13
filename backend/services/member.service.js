import Stripe from 'stripe';
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
import { createStoreInvoice } from './invoice.service.js';
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

const ACCOUNT_ACTIVITY_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
const DEFAULT_ATTRIBUTION_STORE_CODE = 'REGISTRATION_LOCKED';
const ENROLL_CHECKOUT_TAX_RATE = 0.0975;
const STRIPE_METADATA_VALUE_LIMIT = 500;
const ENROLLMENT_PAYMENT_FLOW = 'member-enrollment';
const FREE_ACCOUNT_PACKAGE_KEY = 'preferred-customer-pack';
const FREE_ACCOUNT_RANK_LABEL = 'Preferred Customer';
const PLACEMENT_LEG_LEFT = 'left';
const PLACEMENT_LEG_RIGHT = 'right';
const PLACEMENT_LEG_SPILLOVER = 'spillover';
const PLACEMENT_LEG_EXTREME_LEFT = 'extreme-left';
const PLACEMENT_LEG_EXTREME_RIGHT = 'extreme-right';
const BUSINESS_CENTER_NODE_TYPE_PRIMARY = 'primary';
const BUSINESS_CENTER_NODE_TYPE_PLACEHOLDER = 'placeholder';

const FAST_TRACK_PACKAGE_META = {
  [FREE_ACCOUNT_PACKAGE_KEY]: { label: 'Free Account', price: 0, bv: 0 },
  'personal-builder-pack': { label: 'Personal Builder Pack', price: 192, bv: 192 },
  'business-builder-pack': { label: 'Business Builder Pack', price: 384, bv: 300 },
  'infinity-builder-pack': { label: 'Infinity Builder Pack', price: 640, bv: 500 },
  'legacy-builder-pack': { label: 'Legacy Builder Pack', price: 1280, bv: 1000 },
};
const PACKAGE_PRODUCT_BV = 50;
const PACKAGE_PRODUCT_PRICE_USD = 64;
const PACKAGE_PRODUCT_COUNT_BY_KEY = {
  [FREE_ACCOUNT_PACKAGE_KEY]: 0,
  'personal-builder-pack': 3,
  'business-builder-pack': 6,
  'infinity-builder-pack': 10,
  'legacy-builder-pack': 20,
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

let cachedStripeClient = null;
let cachedStripeApiKey = '';

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

async function createUniqueStoreCode(prefix, preferredSuffix, options = {}) {
  const normalizedPrefix = String(prefix || 'CHG')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '') || 'CHG';
  const normalizedPreferredSuffix = createStoreCodeSuffix(preferredSuffix);
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

  const preferredCode = `${normalizedPrefix}-${normalizedPreferredSuffix}`;
  const reservedPreferred = await tryReserve(preferredCode);
  if (reservedPreferred) {
    return reservedPreferred;
  }

  for (let index = 0; index < 250; index += 1) {
    const randomSuffix = String(randomInt(1000, 10000));
    const candidate = `${normalizedPrefix}-${randomSuffix}`;
    const reservedCandidate = await tryReserve(candidate);
    if (reservedCandidate) {
      return reservedCandidate;
    }
  }

  const timestampSuffix = String(Date.now()).slice(-4);
  const fallbackCode = `${normalizedPrefix}-${timestampSuffix}`;
  const reservedFallbackCode = await tryReserve(fallbackCode);
  if (reservedFallbackCode) {
    return reservedFallbackCode;
  }

  for (let attempt = 0; attempt < 120; attempt += 1) {
    const candidate = `${normalizedPrefix}-${String(randomInt(1000, 10000))}`;
    const reservedCandidate = await tryReserve(candidate);
    if (reservedCandidate) {
      return reservedCandidate;
    }
  }

  return `${normalizedPrefix}-${Date.now()}`;
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

function resolveCurrencyMinorAmount(amount) {
  return Math.max(0, Math.round((Number(amount) || 0) * 100));
}

function sanitizeStripeMetadataValue(value, fallbackValue = '') {
  const normalizedValue = normalizeText(value || fallbackValue);
  if (!normalizedValue) {
    return '';
  }
  return normalizedValue.slice(0, STRIPE_METADATA_VALUE_LIMIT);
}

function resolveStripeClient() {
  const stripeSecretKey = normalizeText(process.env.STRIPE_SECRET_KEY);
  if (!stripeSecretKey) {
    throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY to continue.');
  }

  if (!cachedStripeClient || cachedStripeApiKey !== stripeSecretKey) {
    cachedStripeApiKey = stripeSecretKey;
    cachedStripeClient = new Stripe(stripeSecretKey);
  }

  return cachedStripeClient;
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
  const taxableAmount = Math.max(0, packagePrice - discount);
  const tax = roundCurrencyAmount(taxableAmount * ENROLL_CHECKOUT_TAX_RATE);
  const total = roundCurrencyAmount(taxableAmount + tax);

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
  const requestedSpilloverParentMode = normalizeCredential(payload?.spilloverParentMode || 'auto');
  const spilloverParentMode = (
    placementLeg === PLACEMENT_LEG_SPILLOVER
    && isAdminPlacement
    && requestedSpilloverParentMode === 'manual'
  )
    ? 'manual'
    : 'auto';
  const spilloverParentReference = normalizeText(payload?.spilloverParentReference);
  const effectiveSpilloverParentReference = (
    placementLeg === PLACEMENT_LEG_SPILLOVER && spilloverParentMode === 'manual'
  )
    ? spilloverParentReference
    : '';
  const enrollmentPackage = normalizeCredential(payload?.enrollmentPackage);
  const requestedFastTrackTier = normalizeCredential(
    payload?.fastTrackTier || FAST_TRACK_TIER_BY_PACKAGE[enrollmentPackage]
  );
  const billingAddress = normalizeText(payload?.billingAddress);
  const billingCity = normalizeText(payload?.billingCity);
  const billingState = normalizeText(payload?.billingState);
  const billingPostalCode = normalizeText(payload?.billingPostalCode);
  const billingCountry = normalizeText(payload?.billingCountry);
  const billingCountryCode = normalizeText(payload?.billingCountryCode).toUpperCase();

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

  if (placementLeg === PLACEMENT_LEG_SPILLOVER && spilloverParentMode === 'manual' && !effectiveSpilloverParentReference) {
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
    tax_rate: String(ENROLL_CHECKOUT_TAX_RATE),
    total_amount: String(checkoutSummary.total),
  };

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: resolveCurrencyMinorAmount(checkoutSummary.total),
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      receipt_email: email || undefined,
      metadata: paymentIntentMetadata,
    });

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
          tax: checkoutSummary.tax,
          total: checkoutSummary.total,
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
    paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
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
  const sponsorUsername = normalizeCredential(metadata.sponsor_username);
  const sponsorName = normalizeText(metadata.sponsor_name);
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
  const requestedFastTrackTier = normalizeCredential(metadata.fast_track_tier);
  const billingAddress = normalizeText(metadata.billing_address);
  const billingCity = normalizeText(metadata.billing_city);
  const billingState = normalizeText(metadata.billing_state);
  const billingPostalCode = normalizeText(metadata.billing_postal_code);
  const billingCountry = normalizeText(metadata.billing_country);
  const billingCountryCode = normalizeText(metadata.billing_country_code);

  if (!fullName || !email || !sponsorUsername || !FAST_TRACK_PACKAGE_META[enrollmentPackage]) {
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
      fastTrackTier: requestedFastTrackTier,
      sponsorUsername,
      sponsorName: sponsorName || sponsorUsername,
      billingAddress,
      billingCity,
      billingState,
      billingPostalCode,
      billingCountry,
      billingCountryCode,
      isAdminPlacement,
      enrollmentContext: isAdminPlacement ? 'admin' : 'member',
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

  const invoiceId = normalizeText(metadata.invoice_id).toUpperCase() || `INV-${Date.now()}`;
  const packageBv = toWholeNumber(metadata.package_bv, checkoutSummary.packageBv);
  const discountAmount = roundCurrencyAmount(metadata.discount_amount);
  const capturedAmount = roundCurrencyAmount(
    (Number(paymentIntent?.amount_received) || Number(paymentIntent?.amount) || 0) / 100
  );
  const totalAmount = capturedAmount > 0
    ? capturedAmount
    : roundCurrencyAmount(metadata.total_amount || checkoutSummary.total);

  let invoiceRecord = null;
  let invoiceWarning = '';
  const existingInvoices = await readMockStoreInvoicesStore();
  invoiceRecord = (Array.isArray(existingInvoices) ? existingInvoices : []).find((invoice) => {
    return normalizeText(invoice?.id).toUpperCase() === invoiceId;
  }) || null;

  if (!invoiceRecord) {
    let attributionKey = DEFAULT_ATTRIBUTION_STORE_CODE;
    const matchedSponsorUser = sponsorUsername
      ? await findUserByUsername(sponsorUsername)
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
      status: 'Posted',
    });

    if (invoiceResult.success) {
      invoiceRecord = invoiceResult.data?.invoice || null;
    } else if (invoiceResult.status === 409) {
      const invoicesAfterConflict = await readMockStoreInvoicesStore();
      invoiceRecord = (Array.isArray(invoicesAfterConflict) ? invoicesAfterConflict : []).find((invoice) => {
        return normalizeText(invoice?.id).toUpperCase() === invoiceId;
      }) || null;
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
        subtotal: roundCurrencyAmount(metadata.subtotal || checkoutSummary.subtotal),
        discount: discountAmount,
        tax: roundCurrencyAmount(metadata.tax_amount || checkoutSummary.tax),
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
  const requestedSpilloverParentMode = normalizeCredential(payload?.spilloverParentMode || 'auto');
  const spilloverParentMode = (
    placementLeg === PLACEMENT_LEG_SPILLOVER
    && isAdminPlacement
    && requestedSpilloverParentMode === 'manual'
  )
    ? 'manual'
    : 'auto';
  const spilloverParentReference = normalizeText(payload?.spilloverParentReference);
  const effectiveSpilloverParentReference = (
    placementLeg === PLACEMENT_LEG_SPILLOVER && spilloverParentMode === 'manual'
  )
    ? spilloverParentReference
    : '';
  const enrollmentPackage = normalizeCredential(payload?.enrollmentPackage);
  const requestedFastTrackTier = normalizeCredential(payload?.fastTrackTier);
  const isStaffTreeAccount = Boolean(payload?.isStaffTreeAccount);

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
        const sponsorStoreSeed = matchedSponsorUser?.username || sponsorUsername || `sponsor-${Date.now()}`;
        const nextSponsorStoreCode = sponsorStoreCode || await createUniqueStoreCode('M', sponsorStoreSeed, {
          reservedStoreCodes,
          client,
        });
        const nextSponsorPublicStoreCode = sponsorPublicStoreCode || await createUniqueStoreCode('CHG', sponsorStoreSeed, {
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
    const publicStoreCode = await createUniqueStoreCode('CHG', memberUsername, {
      reservedStoreCodes,
      client,
    });
    const storeCode = await createUniqueStoreCode('M', memberUsername, {
      reservedStoreCodes,
      client,
    });
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
      businessCenterOwnerUserId: userId,
      businessCenterOwnerUsername: memberUsername,
      businessCenterOwnerEmail: email,
      businessCenterNodeType: BUSINESS_CENTER_NODE_TYPE_PRIMARY,
      businessCenterIndex: 0,
      businessCenterLabel: '',
      businessCenterActivatedAt: '',
      businessCenterPinnedSide: '',
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
  const currentPackageBv = Math.max(0, toWholeNumber(currentPackageMeta?.bv, 0));
  const nextPackageBv = Math.max(currentPackageBv, toWholeNumber(nextPackageMeta?.bv, currentPackageBv));
  const currentPackagePrice = roundCurrencyAmount(Number(currentPackageMeta?.price) || 0);
  const nextPackagePrice = Math.max(currentPackagePrice, roundCurrencyAmount(Number(nextPackageMeta?.price) || currentPackagePrice));
  const currentPackageProducts = resolvePackageProductCount(currentPackageKey);
  const nextPackageProducts = Math.max(currentPackageProducts, resolvePackageProductCount(targetPackageKey));
  const upgradeProductCount = Math.max(0, nextPackageProducts - currentPackageProducts);
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
    enrollmentPackagePrice: nextPackagePrice,
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
    lastAccountUpgradePvGain: upgradeBvGain,
  };

  const matchedUser = users[userIndex];
  const identity = {
    userId: normalizeText(matchedUser?.id),
    username: normalizeCredential(matchedUser?.username),
    email: normalizeCredential(matchedUser?.email),
  };
  const primaryMemberIndex = resolvePrimaryMemberIndexForIdentity(members, identity);

  let updatedMemberRecord = null;

  const updatedMembers = members.map((member, index) => {
    if (index !== primaryMemberIndex || isBusinessCenterPlaceholderMember(member)) {
      return member;
    }

    const upgradedMember = {
      ...member,
      enrollmentPackage: targetPackageKey,
      enrollmentPackageLabel: nextPackageMeta.label,
      packagePrice: nextPackagePrice,
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
      lastAccountUpgradePvGain: upgradeBvGain,
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
      enrollmentPackagePrice: nextPackagePrice,
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
      fastTrackBonusApplied: false,
    },
  };
}
