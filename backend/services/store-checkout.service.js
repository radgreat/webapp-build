import Stripe from 'stripe';

import { createStoreInvoice } from './invoice.service.js';
import { createRegisteredMember, recordMemberPurchase } from './member.service.js';
import { readStoreProductsStore } from '../stores/store-product.store.js';
import {
  readMockStoreInvoicesStore,
  resolveNextStoreInvoiceId,
} from '../stores/invoice.store.js';
import { readMockUsersStore } from '../stores/user.store.js';
import {
  readPasswordSetupTokensStore,
  writePasswordSetupTokensStore,
} from '../stores/token.store.js';
import {
  buildPasswordSetupLink,
  isSetupTokenExpired,
  issuePasswordSetupToken,
  resolveAuthAccountAudience,
} from '../utils/auth.helpers.js';

const LEGACY_STORE_CODE_ALIASES = Object.freeze({
  'CHG-7X42': 'CHG-ZERO',
});
const DEFAULT_DISCOUNT_PERCENT = 15;
const MAX_CHECKOUT_CART_LINES = 32;
const MAX_CHECKOUT_LINE_QUANTITY = 99;
const INVOICE_STATUS_PENDING_AMOUNT = 220;
const DEFAULT_SHIPPING_MODE = 'Standard Shipping';
const DEFAULT_PUBLIC_STORE_PATH = '/store.html';
const DEFAULT_CHECKOUT_RETURN_PATH = '/store-checkout.html';
const STRIPE_METADATA_VALUE_LIMIT = 500;
const CHECKOUT_MODE_GUEST = 'guest';
const CHECKOUT_MODE_FREE_ACCOUNT = 'free-account';
const FREE_ACCOUNT_USERNAME_PATTERN = /^[a-zA-Z0-9._-]{3,24}$/;
const FREE_ACCOUNT_PACKAGE_KEY = 'preferred-customer-pack';
const PLACEMENT_LEG_EXTREME_LEFT = 'extreme-left';
const PLACEMENT_LEG_EXTREME_RIGHT = 'extreme-right';
const UNATTRIBUTED_FREE_ACCOUNT_SPONSOR_ENV_KEYS = Object.freeze([
  'UNATTRIBUTED_FREE_ACCOUNT_SPONSOR_USERNAME',
  'FREE_ACCOUNT_HOLDING_SPONSOR_USERNAME',
  'PREFERRED_CUSTOMER_HOLDING_SPONSOR_USERNAME',
]);
const DEFAULT_UNATTRIBUTED_FREE_ACCOUNT_SPONSOR_USERNAME = 'admin';

let cachedStripeClient = null;
let cachedStripeApiKey = '';

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeStoreCode(value) {
  const normalizedValue = normalizeText(value)
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '');
  return LEGACY_STORE_CODE_ALIASES[normalizedValue] || normalizedValue;
}

function toWholeNumber(value, fallback = 0) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return fallback;
  }
  return Math.max(0, Math.floor(numericValue));
}

function roundCurrency(value) {
  return Math.round((Math.max(0, Number(value) || 0) + Number.EPSILON) * 100) / 100;
}

function resolveCurrencyMinorAmount(amount) {
  return Math.max(0, Math.round((Number(amount) || 0) * 100));
}

function normalizeDiscountPercent(value, fallbackPercent = DEFAULT_DISCOUNT_PERCENT) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return fallbackPercent;
  }

  return Math.max(0, Math.min(60, Math.round(numericValue * 100) / 100));
}

function resolveDiscountPercentForCheckoutMode(value, checkoutMode = CHECKOUT_MODE_GUEST) {
  if (checkoutMode !== CHECKOUT_MODE_FREE_ACCOUNT) {
    return 0;
  }
  return normalizeDiscountPercent(value, DEFAULT_DISCOUNT_PERCENT);
}

function normalizeEmail(value) {
  const normalizedValue = normalizeText(value).toLowerCase();
  if (!normalizedValue) {
    return '';
  }
  return normalizedValue.includes('@') ? normalizedValue : '';
}

function normalizeShippingMode(value) {
  const normalizedValue = normalizeText(value);
  return normalizedValue || DEFAULT_SHIPPING_MODE;
}

function normalizePathname(value, fallbackPath = DEFAULT_CHECKOUT_RETURN_PATH) {
  const normalizedValue = normalizeText(value);
  if (!normalizedValue || !normalizedValue.startsWith('/')) {
    return fallbackPath;
  }

  return normalizedValue;
}

function sanitizeStripeMetadataValue(value, fallbackValue = '') {
  const normalizedValue = normalizeText(value || fallbackValue);
  if (!normalizedValue) {
    return '';
  }

  return normalizedValue.slice(0, STRIPE_METADATA_VALUE_LIMIT);
}

function normalizeCheckoutMode(value) {
  const normalizedValue = normalizeText(value).toLowerCase();
  return normalizedValue === CHECKOUT_MODE_FREE_ACCOUNT
    ? CHECKOUT_MODE_FREE_ACCOUNT
    : CHECKOUT_MODE_GUEST;
}

function normalizePlacementLeg(value) {
  const normalizedValue = normalizeText(value).toLowerCase();
  if (normalizedValue === 'right') {
    return 'right';
  }
  if (
    normalizedValue === PLACEMENT_LEG_EXTREME_LEFT
    || normalizedValue === 'extremeleft'
    || normalizedValue === 'extreme_left'
    || normalizedValue === 'extreme left'
  ) {
    return PLACEMENT_LEG_EXTREME_LEFT;
  }
  if (
    normalizedValue === PLACEMENT_LEG_EXTREME_RIGHT
    || normalizedValue === 'extremeright'
    || normalizedValue === 'extreme_right'
    || normalizedValue === 'extreme right'
  ) {
    return PLACEMENT_LEG_EXTREME_RIGHT;
  }
  if (normalizedValue === 'spillover') {
    return 'spillover';
  }
  if (
    normalizedValue === 'spillover-left'
    || normalizedValue === 'spillover_left'
    || normalizedValue === 'spillover left'
    || normalizedValue === 'spillover-right'
    || normalizedValue === 'spillover_right'
    || normalizedValue === 'spillover right'
  ) {
    return 'spillover';
  }
  return 'left';
}

function resolveFreeAccountCheckoutFields(payload = {}) {
  return {
    memberUsername: normalizeText(payload.freeAccountMemberUsername),
    phone: normalizeText(payload.freeAccountPhone),
    countryFlag: normalizeText(payload.freeAccountCountryFlag).toLowerCase() || 'us',
    notes: normalizeText(payload.freeAccountNotes),
  };
}

function resolveFreeAccountCheckoutFieldsFromMetadata(metadata = {}) {
  return resolveFreeAccountCheckoutFields({
    freeAccountMemberUsername: metadata.free_account_member_username || metadata.freeAccountMemberUsername,
    freeAccountPhone: metadata.free_account_phone || metadata.freeAccountPhone,
    freeAccountCountryFlag: metadata.free_account_country_flag || metadata.freeAccountCountryFlag,
    freeAccountNotes: metadata.free_account_notes || metadata.freeAccountNotes,
  });
}

function resolveRequestedCheckoutStoreCode(payload = {}, context = {}) {
  const payloadStoreCode = normalizeStoreCode(payload?.storeCode);
  const referrerStoreCode = normalizeStoreCode(context?.referrerStoreCode);

  if (referrerStoreCode && payloadStoreCode && payloadStoreCode !== referrerStoreCode) {
    return {
      ok: false,
      status: 400,
      error: 'Checkout store code does not match the locked store link.',
    };
  }

  const requestedStoreCode = referrerStoreCode || payloadStoreCode;
  return {
    ok: true,
    storeCode: requestedStoreCode,
  };
}

function resolveInvoiceStatus(amount) {
  return Number(amount) >= INVOICE_STATUS_PENDING_AMOUNT ? 'Pending' : 'Posted';
}

function resolveStoreOwnerByAttributionCode(users, storeCode) {
  const normalizedStoreCode = normalizeStoreCode(storeCode);
  if (!normalizedStoreCode) {
    return null;
  }

  return (Array.isArray(users) ? users : []).find((user) => {
    const candidateCodes = [
      user?.storeCode,
      user?.publicStoreCode,
      user?.attributionStoreCode,
    ].map((candidate) => normalizeStoreCode(candidate));

    return candidateCodes.includes(normalizedStoreCode);
  }) || null;
}

function resolveConfiguredUnattributedFreeAccountSponsorUsername() {
  for (const envKey of UNATTRIBUTED_FREE_ACCOUNT_SPONSOR_ENV_KEYS) {
    const candidateValue = normalizeText(process.env[envKey]);
    if (candidateValue) {
      return candidateValue;
    }
  }

  return DEFAULT_UNATTRIBUTED_FREE_ACCOUNT_SPONSOR_USERNAME;
}

function resolveCheckoutAttribution({
  users = [],
  requestedStoreCode = '',
  checkoutMode = CHECKOUT_MODE_GUEST,
} = {}) {
  const normalizedRequestedStoreCode = normalizeStoreCode(requestedStoreCode);
  if (normalizedRequestedStoreCode) {
    const attributionOwner = resolveStoreOwnerByAttributionCode(users, normalizedRequestedStoreCode);
    if (!attributionOwner) {
      return {
        ok: false,
        status: 404,
        error: 'Member store code was not found. Please verify the store code.',
      };
    }

    return {
      ok: true,
      attributionOwner,
      attributionStoreCode: normalizedRequestedStoreCode,
      hasLinkAttribution: true,
      fallbackAttributionUsed: false,
    };
  }

  if (checkoutMode === CHECKOUT_MODE_FREE_ACCOUNT) {
    return {
      ok: true,
      attributionOwner: null,
      attributionStoreCode: '',
      hasLinkAttribution: false,
      fallbackAttributionUsed: false,
    };
  }

  return {
    ok: true,
    attributionOwner: null,
    attributionStoreCode: '',
    hasLinkAttribution: false,
    fallbackAttributionUsed: false,
  };
}

function normalizeCheckoutCartLines(lines) {
  const safeLines = Array.isArray(lines) ? lines : [];
  const quantityByProduct = new Map();

  safeLines.forEach((line) => {
    const productId = normalizeText(line?.productId);
    if (!productId) {
      return;
    }

    const quantity = toWholeNumber(line?.quantity, 0);
    if (quantity <= 0) {
      return;
    }

    const nextQuantity = (quantityByProduct.get(productId) || 0) + quantity;
    quantityByProduct.set(productId, Math.min(MAX_CHECKOUT_LINE_QUANTITY, nextQuantity));
  });

  return Array.from(quantityByProduct.entries())
    .slice(0, MAX_CHECKOUT_CART_LINES)
    .map(([productId, quantity]) => ({
      productId,
      quantity,
    }));
}

function buildPublicStoreLink(origin, storeCode) {
  const safeOrigin = normalizeText(origin);
  if (!safeOrigin) {
    return '';
  }

  const url = new URL(DEFAULT_PUBLIC_STORE_PATH, safeOrigin);
  const normalizedStoreCode = normalizeStoreCode(storeCode);
  if (normalizedStoreCode) {
    url.searchParams.set('store', normalizedStoreCode);
  }

  return url.toString();
}

function resolveCheckoutReturnUrls(origin, returnPath, storeCode) {
  const safeOrigin = normalizeText(origin);
  const defaultReturnUrl = new URL(DEFAULT_CHECKOUT_RETURN_PATH, safeOrigin);
  const normalizedStoreCode = normalizeStoreCode(storeCode);

  let baseReturnUrl = defaultReturnUrl;
  const resolvedPath = normalizePathname(returnPath, DEFAULT_CHECKOUT_RETURN_PATH);
  try {
    baseReturnUrl = new URL(resolvedPath, safeOrigin);
  } catch {
    baseReturnUrl = defaultReturnUrl;
  }

  if (normalizedStoreCode && !baseReturnUrl.searchParams.get('store')) {
    baseReturnUrl.searchParams.set('store', normalizedStoreCode);
  }

  const successUrl = new URL(baseReturnUrl.toString());
  successUrl.searchParams.set('checkout', 'success');
  successUrl.searchParams.set('session_id', '{CHECKOUT_SESSION_ID}');

  const cancelUrl = new URL(baseReturnUrl.toString());
  cancelUrl.searchParams.set('checkout', 'cancel');
  cancelUrl.searchParams.delete('session_id');

  return {
    successUrl: successUrl.toString(),
    cancelUrl: cancelUrl.toString(),
  };
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
      // Fallback to environment/default values below.
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
      // Fallback to localhost below.
    }
  }

  const fallbackPort = Number.parseInt(process.env.PORT || '3000', 10) || 3000;
  return `http://localhost:${fallbackPort}`;
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

function resolveStripePublishableKey() {
  const publishableKey = normalizeText(process.env.STRIPE_PUBLISHABLE_KEY);
  if (!publishableKey) {
    throw new Error('Stripe is not configured. Set STRIPE_PUBLISHABLE_KEY to continue.');
  }

  if (!publishableKey.startsWith('pk_')) {
    throw new Error('STRIPE_PUBLISHABLE_KEY must start with "pk_".');
  }

  return publishableKey;
}

function buildCheckoutLineItems(cartLines, products, discountRate = 0) {
  const productById = new Map((Array.isArray(products) ? products : []).map((product) => [product.id, product]));

  const checkoutLines = [];
  let subtotal = 0;
  let total = 0;
  let totalBp = 0;

  (Array.isArray(cartLines) ? cartLines : []).forEach((line) => {
    const product = productById.get(line.productId);
    if (!product || product.stock <= 0) {
      return;
    }

    const quantity = Math.min(
      Math.max(1, toWholeNumber(line.quantity, 1)),
      Math.max(0, toWholeNumber(product.stock, 0)),
      MAX_CHECKOUT_LINE_QUANTITY,
    );

    if (quantity <= 0) {
      return;
    }

    const baseUnitPrice = roundCurrency(product.price);
    const discountedUnitPrice = roundCurrency(baseUnitPrice * (1 - discountRate));
    const unitAmount = resolveCurrencyMinorAmount(discountedUnitPrice);
    if (unitAmount <= 0) {
      return;
    }

    subtotal += (baseUnitPrice * quantity);
    totalBp += toWholeNumber(product.bp, 0) * quantity;
    total += (unitAmount * quantity) / 100;

    const imageCandidates = Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : [product.image];

    const safeImages = imageCandidates
      .map((image) => normalizeText(image))
      .filter((image) => image.startsWith('https://') || image.startsWith('http://'));

    checkoutLines.push({
      productId: product.id,
      quantity,
      unitAmount,
      lineItem: {
        price_data: {
          currency: 'usd',
          product_data: {
            name: normalizeText(product.title).slice(0, 200) || 'Store Product',
            description: normalizeText(product.description).slice(0, 500),
            images: safeImages.slice(0, 8),
            metadata: {
              product_id: sanitizeStripeMetadataValue(product.id),
            },
          },
          unit_amount: unitAmount,
        },
        quantity,
      },
    });
  });

  const roundedSubtotal = roundCurrency(subtotal);
  const roundedTotal = roundCurrency(total);
  const discount = roundCurrency(Math.max(0, roundedSubtotal - roundedTotal));

  return {
    checkoutLines,
    lineItems: checkoutLines.map((line) => line.lineItem),
    subtotal: roundedSubtotal,
    total: roundedTotal,
    discount,
    bp: Math.max(0, toWholeNumber(totalBp, 0)),
  };
}

function parseMetadataCurrencyValue(value, fallback = 0) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return roundCurrency(parsed);
}

function parseMetadataWholeNumber(value, fallback = 0) {
  const parsed = Number.parseInt(String(value || ''), 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(0, parsed);
}

function validateCheckoutCustomerFields(payload = {}, checkoutMode = CHECKOUT_MODE_GUEST) {
  const buyerName = normalizeText(payload.buyerName);
  const buyerEmail = normalizeEmail(payload.buyerEmail);
  const shippingAddress = normalizeText(payload.shippingAddress);
  const shippingMode = normalizeShippingMode(payload.shippingMode);
  const freeAccountFields = resolveFreeAccountCheckoutFields(payload);

  if (!buyerName) {
    return {
      ok: false,
      status: 400,
      error: 'Buyer name is required.',
    };
  }

  if (!buyerEmail) {
    return {
      ok: false,
      status: 400,
      error: 'Buyer email is required.',
    };
  }

  if (!shippingAddress) {
    return {
      ok: false,
      status: 400,
      error: 'Shipping address is required.',
    };
  }

  if (checkoutMode === CHECKOUT_MODE_FREE_ACCOUNT) {
    if (!freeAccountFields.memberUsername) {
      return {
        ok: false,
        status: 400,
        error: 'Username is required for Free Account registration.',
      };
    }

    if (!FREE_ACCOUNT_USERNAME_PATTERN.test(freeAccountFields.memberUsername)) {
      return {
        ok: false,
        status: 400,
        error: 'Username must be 3-24 characters and can include letters, numbers, dot, underscore, and dash.',
      };
    }
  }

  return {
    ok: true,
    fields: {
      buyerName,
      buyerEmail,
      shippingAddress,
      shippingMode,
      freeAccount: freeAccountFields,
    },
  };
}

async function ensureOpenPasswordSetupLinkForUser({
  userId = '',
  email = '',
  accountAudience = 'free',
} = {}) {
  try {
    const normalizedUserId = normalizeText(userId);
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedUserId || !normalizedEmail) {
      return '';
    }

    const tokens = await readPasswordSetupTokensStore();
    let openToken = tokens.find((tokenRecord) => {
      if (normalizeText(tokenRecord?.userId) !== normalizedUserId) {
        return false;
      }
      if (normalizeText(tokenRecord?.usedAt)) {
        return false;
      }
      return !isSetupTokenExpired(tokenRecord);
    }) || null;

    if (!openToken) {
      openToken = issuePasswordSetupToken(normalizedUserId, normalizedEmail);
      tokens.unshift(openToken);
      await writePasswordSetupTokensStore(tokens);
    }

    return openToken?.token
      ? buildPasswordSetupLink(openToken.token, normalizedEmail, { audience: accountAudience })
      : '';
  } catch (error) {
    console.warn('[store-checkout] Unable to create preferred-customer password setup link:', error);
    return '';
  }
}

async function resolveCheckoutBuyerPreferredCustomerIdentity({
  attributionKey = '',
  buyerName = '',
  buyerEmail = '',
  freeAccountRegistration = {},
} = {}) {
  const normalizedAttributionKey = normalizeStoreCode(attributionKey);
  const normalizedBuyerEmail = normalizeEmail(buyerEmail);
  const normalizedBuyerName = normalizeText(buyerName) || 'Store Customer';
  const normalizedFreeAccountRegistration = freeAccountRegistration && typeof freeAccountRegistration === 'object'
    ? freeAccountRegistration
    : {};
  const requestedMemberUsername = normalizeText(normalizedFreeAccountRegistration.memberUsername);
  const requestedPhone = normalizeText(normalizedFreeAccountRegistration.phone);
  const requestedCountryFlag = normalizeText(normalizedFreeAccountRegistration.countryFlag).toLowerCase() || 'us';
  const attributionLabel = normalizedAttributionKey || 'NO-ATTRIBUTION';
  const defaultRegistrationNote = `Auto-created from store checkout (${attributionLabel}).`;
  const requestedNotes = normalizeText(normalizedFreeAccountRegistration.notes);
  const registrationNotes = requestedNotes
    ? `${requestedNotes} | ${defaultRegistrationNote}`
    : defaultRegistrationNote;

  const fallbackIdentity = {
    ok: false,
    created: false,
    userId: '',
    username: '',
    email: normalizedBuyerEmail,
    setupLink: '',
    reason: '',
  };

  if (!normalizedBuyerEmail) {
    return {
      ...fallbackIdentity,
      reason: 'Buyer email is missing.',
    };
  }

  const users = await readMockUsersStore();
  const existingUser = users.find((user) => normalizeEmail(user?.email) === normalizedBuyerEmail);
  if (existingUser) {
    const setupLink = existingUser?.passwordSetupRequired
      ? await ensureOpenPasswordSetupLinkForUser({
          userId: existingUser?.id,
          email: existingUser?.email || normalizedBuyerEmail,
          accountAudience: resolveAuthAccountAudience(existingUser),
        })
      : '';

    return {
      ok: true,
      created: false,
      userId: normalizeText(existingUser?.id),
      username: normalizeText(existingUser?.username),
      email: normalizeEmail(existingUser?.email) || normalizedBuyerEmail,
      setupLink,
      reason: '',
    };
  }

  const sponsorUser = normalizedAttributionKey
    ? resolveStoreOwnerByAttributionCode(users, normalizedAttributionKey)
    : null;
  let sponsorUsername = normalizeText(sponsorUser?.username);
  let sponsorName = normalizeText(sponsorUser?.name || sponsorUser?.username || 'Store Owner');

  // Free-account checkouts without referral attribution are parked under a holding sponsor
  // (defaults to "admin") so Admin can reassign later without crediting random uplines.
  if (!sponsorUsername && !normalizedAttributionKey) {
    const configuredHoldingSponsorUsername = normalizeText(resolveConfiguredUnattributedFreeAccountSponsorUsername());
    const matchedHoldingSponsorUser = (Array.isArray(users) ? users : []).find((user) => {
      const username = normalizeText(user?.username).toLowerCase();
      const email = normalizeEmail(user?.email);
      const targetKey = configuredHoldingSponsorUsername.toLowerCase();
      return username === targetKey || email === targetKey;
    }) || null;

    sponsorUsername = normalizeText(
      matchedHoldingSponsorUser?.username || configuredHoldingSponsorUsername
    );
    sponsorName = normalizeText(
      matchedHoldingSponsorUser?.name
      || matchedHoldingSponsorUser?.username
      || configuredHoldingSponsorUsername
      || 'Admin Holding',
    );
  }

  if (!sponsorUsername) {
    return {
      ...fallbackIdentity,
      reason: normalizedAttributionKey
        ? 'Unable to resolve store owner for preferred-customer attribution.'
        : 'Unable to resolve holding sponsor for unattributed free-account registration.',
    };
  }

  // Free-account buyers do not choose placement during storefront checkout.
  // If the owner has placement preferences in profile fields, honor them; otherwise default to left.
  const sponsorPlacementLegRaw = normalizeText(
    sponsorUser?.defaultPlacementLeg || sponsorUser?.preferredPlacementLeg,
  );
  const sponsorPlacementLeg = normalizePlacementLeg(sponsorPlacementLegRaw);
  const sponsorSpilloverPlacementSideRaw = normalizeText(
    sponsorUser?.defaultSpilloverPlacementSide || sponsorUser?.preferredSpilloverPlacementSide,
  ).toLowerCase();
  const sponsorSpilloverPlacementSide = sponsorSpilloverPlacementSideRaw === 'right'
    ? 'right'
    : 'left';

  const registrationResult = await createRegisteredMember({
    fullName: normalizedBuyerName,
    email: normalizedBuyerEmail,
    memberUsername: requestedMemberUsername || (normalizedBuyerEmail.split('@')[0] || ''),
    phone: requestedPhone,
    notes: registrationNotes,
    countryFlag: requestedCountryFlag,
    placementLeg: sponsorPlacementLeg,
    spilloverPlacementSide: sponsorSpilloverPlacementSide,
    spilloverParentMode: 'auto',
    spilloverParentReference: '',
    enrollmentPackage: 'preferred-customer-pack',
    fastTrackTier: 'personal-pack',
    sponsorUsername,
    sponsorName,
  });

  if (registrationResult?.success) {
    const createdMember = registrationResult?.member || {};
    const resolvedSetupLink = await ensureOpenPasswordSetupLinkForUser({
      userId: createdMember?.userId,
      email: createdMember?.email || normalizedBuyerEmail,
      accountAudience: 'free',
    });

    return {
      ok: true,
      created: true,
      userId: normalizeText(createdMember?.userId),
      username: normalizeText(createdMember?.memberUsername),
      email: normalizeEmail(createdMember?.email) || normalizedBuyerEmail,
      setupLink: resolvedSetupLink || normalizeText(createdMember?.passwordSetupLink),
      reason: '',
    };
  }

  if (registrationResult?.status === 409) {
    const usersAfterConflict = await readMockUsersStore();
    const matchedUser = usersAfterConflict.find((user) => normalizeEmail(user?.email) === normalizedBuyerEmail);
    if (matchedUser) {
      const setupLink = matchedUser?.passwordSetupRequired
        ? await ensureOpenPasswordSetupLinkForUser({
            userId: matchedUser?.id,
            email: matchedUser?.email || normalizedBuyerEmail,
            accountAudience: resolveAuthAccountAudience(matchedUser),
          })
        : '';

      return {
        ok: true,
        created: false,
        userId: normalizeText(matchedUser?.id),
        username: normalizeText(matchedUser?.username),
        email: normalizeEmail(matchedUser?.email) || normalizedBuyerEmail,
        setupLink,
        reason: '',
      };
    }
  }

  return {
    ...fallbackIdentity,
    reason: normalizeText(registrationResult?.error) || 'Unable to auto-enroll checkout buyer as Free Account.',
  };
}

async function finalizeSuccessfulStoreCheckout({
  amount,
  metadata = {},
  buyerName = '',
  buyerEmail = '',
  paymentReference = {},
}) {
  const invoiceId = normalizeText(metadata.invoice_id).toUpperCase();
  if (!invoiceId) {
    return {
      success: false,
      status: 400,
      error: 'Checkout metadata is missing invoice identifier.',
    };
  }

  const normalizedAmount = roundCurrency(amount);
  const bp = parseMetadataWholeNumber(metadata.bp, 0);
  const discount = parseMetadataCurrencyValue(metadata.discount_amount, 0);
  const invoiceStatus = normalizeText(metadata.invoice_status) || resolveInvoiceStatus(normalizedAmount);
  const attributionKey = normalizeStoreCode(metadata.attribution_key || metadata.member_store_code);
  const memberStoreCode = normalizeStoreCode(metadata.member_store_code || attributionKey);
  const memberStoreLink = normalizeText(metadata.member_store_link);
  const resolvedBuyerName = normalizeText(buyerName || metadata.buyer_name || 'Store Buyer');
  const resolvedBuyerEmail = normalizeEmail(buyerEmail || metadata.buyer_email);
  const checkoutMode = normalizeCheckoutMode(metadata.checkout_mode || metadata.checkoutMode);
  const freeAccountCheckoutFields = resolveFreeAccountCheckoutFieldsFromMetadata(metadata);

  let preferredCustomerIdentity = {
    ok: false,
    created: false,
    userId: '',
    username: '',
    email: resolvedBuyerEmail,
    setupLink: '',
    reason: '',
  };
  if (checkoutMode === CHECKOUT_MODE_FREE_ACCOUNT) {
    preferredCustomerIdentity = await resolveCheckoutBuyerPreferredCustomerIdentity({
      attributionKey,
      buyerName: resolvedBuyerName,
      buyerEmail: resolvedBuyerEmail,
      freeAccountRegistration: freeAccountCheckoutFields,
    });
    if (!preferredCustomerIdentity.ok && preferredCustomerIdentity.reason) {
      console.warn('[store-checkout] Preferred customer auto-enrollment skipped:', preferredCustomerIdentity.reason);
    }
  } else {
    preferredCustomerIdentity = {
      ...preferredCustomerIdentity,
      reason: 'Guest checkout selected. Free account not created.',
    };
  }

  const buyerUserId = normalizeText(
    metadata.buyer_user_id
    || (checkoutMode === CHECKOUT_MODE_FREE_ACCOUNT ? preferredCustomerIdentity.userId : ''),
  );
  const buyerUsername = normalizeText(
    metadata.buyer_username
    || (checkoutMode === CHECKOUT_MODE_FREE_ACCOUNT ? preferredCustomerIdentity.username : ''),
  );
  const buyerEmailForInvoice = normalizeEmail(
    resolvedBuyerEmail
    || (checkoutMode === CHECKOUT_MODE_FREE_ACCOUNT ? preferredCustomerIdentity.email : ''),
  );

  const existingInvoices = await readMockStoreInvoicesStore();
  const existingInvoice = existingInvoices.find((invoice) => (
    normalizeText(invoice?.id).toUpperCase() === invoiceId
  ));

  if (existingInvoice) {
    return {
      success: true,
      status: 200,
      data: {
        success: true,
        completed: true,
        alreadyProcessed: true,
        invoice: existingInvoice,
        preferredCustomer: preferredCustomerIdentity,
        ...paymentReference,
      },
    };
  }

  const invoiceResult = await createStoreInvoice({
    invoiceId,
    buyer: resolvedBuyerName || 'Store Buyer',
    buyerUserId,
    buyerUsername,
    buyerEmail: buyerEmailForInvoice,
    attributionKey,
    memberStoreCode,
    memberStoreLink,
    amount: normalizedAmount,
    bp,
    discount,
    status: invoiceStatus,
  });

  if (!invoiceResult.success) {
    if (invoiceResult.status === 409) {
      const invoicesAfterConflict = await readMockStoreInvoicesStore();
      const matchedInvoice = invoicesAfterConflict.find((invoice) => (
        normalizeText(invoice?.id).toUpperCase() === invoiceId
      ));
      if (matchedInvoice) {
        return {
          success: true,
          status: 200,
          data: {
            success: true,
            completed: true,
            alreadyProcessed: true,
            invoice: matchedInvoice,
            preferredCustomer: preferredCustomerIdentity,
            ...paymentReference,
          },
        };
      }
    }

    return {
      success: false,
      status: invoiceResult.status,
      error: invoiceResult.error,
    };
  }

  const createdInvoice = invoiceResult.data?.invoice || null;
  const attributionOwner = invoiceResult.data?.attributionOwner || null;

  let ownerCredit = {
    ok: true,
    message: 'No owner BV credit required.',
  };

  if (bp > 0 && attributionOwner && (attributionOwner.userId || attributionOwner.username || attributionOwner.email)) {
    const ownerCreditResult = await recordMemberPurchase({
      userId: normalizeText(attributionOwner.userId),
      username: normalizeText(attributionOwner.username),
      email: normalizeText(attributionOwner.email),
      pvGain: bp,
    });

    ownerCredit = ownerCreditResult.success
      ? {
          ok: true,
          message: 'Owner BV credit applied.',
          user: ownerCreditResult.user,
          purchase: ownerCreditResult.purchase,
        }
      : {
          ok: false,
          message: ownerCreditResult.error || 'Unable to credit owner BV.',
        };
  }

  return {
    success: true,
    status: 200,
    data: {
      success: true,
      completed: true,
      alreadyProcessed: false,
      invoice: createdInvoice,
      attributionOwner,
      preferredCustomer: preferredCustomerIdentity,
      ownerCredit,
      ...paymentReference,
    },
  };
}

export function getStoreCheckoutConfig() {
  try {
    const publishableKey = resolveStripePublishableKey();
    return {
      success: true,
      status: 200,
      data: {
        success: true,
        publishableKey,
      },
    };
  } catch (error) {
    return {
      success: false,
      status: 503,
      error: error instanceof Error ? error.message : 'Stripe is unavailable.',
    };
  }
}

export async function createStoreCheckoutPaymentIntent(payload = {}, context = {}) {
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

  const cartLines = normalizeCheckoutCartLines(payload.cartLines);
  if (cartLines.length === 0) {
    return {
      success: false,
      status: 400,
      error: 'Cart is empty. Add products before checkout.',
    };
  }

  const storeCodeResolution = resolveRequestedCheckoutStoreCode(payload, context);
  if (!storeCodeResolution.ok) {
    return {
      success: false,
      status: storeCodeResolution.status,
      error: storeCodeResolution.error,
    };
  }
  const requestedStoreCode = storeCodeResolution.storeCode;

  const checkoutMode = normalizeCheckoutMode(payload.checkoutMode);
  const customerValidation = validateCheckoutCustomerFields(payload, checkoutMode);
  if (!customerValidation.ok) {
    return {
      success: false,
      status: customerValidation.status,
      error: customerValidation.error,
    };
  }
  const buyerName = customerValidation.fields.buyerName;
  const buyerEmail = customerValidation.fields.buyerEmail;
  const shippingAddress = customerValidation.fields.shippingAddress;
  const shippingMode = customerValidation.fields.shippingMode;
  const freeAccountCheckoutFields = customerValidation.fields.freeAccount || {};

  const users = await readMockUsersStore();
  const attributionResolution = resolveCheckoutAttribution({
    users,
    requestedStoreCode,
    checkoutMode,
  });
  if (!attributionResolution.ok) {
    return {
      success: false,
      status: attributionResolution.status,
      error: attributionResolution.error,
    };
  }
  const attributionStoreCode = attributionResolution.attributionStoreCode;
  const memberStoreCodeForMetadata = attributionResolution.hasLinkAttribution
    ? attributionStoreCode
    : '';

  const products = await readStoreProductsStore({ includeArchived: false });
  const discountPercent = resolveDiscountPercentForCheckoutMode(payload.discountPercent, checkoutMode);
  const discountRate = discountPercent / 100;

  const checkoutSummary = buildCheckoutLineItems(cartLines, products, discountRate);
  if (checkoutSummary.lineItems.length === 0 || checkoutSummary.total <= 0) {
    return {
      success: false,
      status: 400,
      error: 'Unable to build checkout from the selected cart items.',
    };
  }

  const invoices = await readMockStoreInvoicesStore();
  const invoiceId = resolveNextStoreInvoiceId(invoices);
  const origin = resolveRequestOrigin(context);
  const memberStoreLink = normalizeText(payload.memberStoreLink) || buildPublicStoreLink(origin, requestedStoreCode);
  const invoiceStatus = resolveInvoiceStatus(checkoutSummary.total);

  const checkoutMetadata = {
    checkout_type: 'storefront',
    payment_flow: 'embedded-elements',
    invoice_id: sanitizeStripeMetadataValue(invoiceId),
    attribution_key: sanitizeStripeMetadataValue(attributionStoreCode),
    member_store_code: sanitizeStripeMetadataValue(memberStoreCodeForMetadata),
    member_store_link: sanitizeStripeMetadataValue(memberStoreLink),
    buyer_name: sanitizeStripeMetadataValue(buyerName),
    buyer_email: sanitizeStripeMetadataValue(buyerEmail),
    shipping_address: sanitizeStripeMetadataValue(shippingAddress),
    shipping_mode: sanitizeStripeMetadataValue(shippingMode),
    buyer_user_id: sanitizeStripeMetadataValue(payload.buyerUserId),
    buyer_username: sanitizeStripeMetadataValue(payload.buyerUsername),
    checkout_mode: sanitizeStripeMetadataValue(checkoutMode, CHECKOUT_MODE_GUEST),
    free_account_member_username: sanitizeStripeMetadataValue(
      checkoutMode === CHECKOUT_MODE_FREE_ACCOUNT ? freeAccountCheckoutFields.memberUsername : '',
    ),
    free_account_phone: sanitizeStripeMetadataValue(
      checkoutMode === CHECKOUT_MODE_FREE_ACCOUNT ? freeAccountCheckoutFields.phone : '',
    ),
    free_account_country_flag: sanitizeStripeMetadataValue(
      checkoutMode === CHECKOUT_MODE_FREE_ACCOUNT ? freeAccountCheckoutFields.countryFlag : '',
    ),
    free_account_notes: sanitizeStripeMetadataValue(
      checkoutMode === CHECKOUT_MODE_FREE_ACCOUNT ? freeAccountCheckoutFields.notes : '',
    ),
    bp: String(Math.max(0, toWholeNumber(checkoutSummary.bp, 0))),
    subtotal: String(checkoutSummary.subtotal),
    discount_amount: String(checkoutSummary.discount),
    discount_percent: String(discountPercent),
    invoice_status: sanitizeStripeMetadataValue(invoiceStatus),
    source: sanitizeStripeMetadataValue(payload.source || 'storefront'),
  };

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: resolveCurrencyMinorAmount(checkoutSummary.total),
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      receipt_email: buyerEmail || undefined,
      metadata: checkoutMetadata,
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
          attributionKey: attributionStoreCode,
          subtotal: checkoutSummary.subtotal,
          discount: checkoutSummary.discount,
          total: checkoutSummary.total,
          bp: checkoutSummary.bp,
          discountPercent,
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

export async function createStoreCheckoutSession(payload = {}, context = {}) {
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

  const cartLines = normalizeCheckoutCartLines(payload.cartLines);
  if (cartLines.length === 0) {
    return {
      success: false,
      status: 400,
      error: 'Cart is empty. Add products before checkout.',
    };
  }

  const storeCodeResolution = resolveRequestedCheckoutStoreCode(payload, context);
  if (!storeCodeResolution.ok) {
    return {
      success: false,
      status: storeCodeResolution.status,
      error: storeCodeResolution.error,
    };
  }
  const requestedStoreCode = storeCodeResolution.storeCode;

  const checkoutMode = normalizeCheckoutMode(payload.checkoutMode);
  const customerValidation = validateCheckoutCustomerFields(payload, checkoutMode);
  if (!customerValidation.ok) {
    return {
      success: false,
      status: customerValidation.status,
      error: customerValidation.error,
    };
  }
  const buyerName = customerValidation.fields.buyerName;
  const buyerEmail = customerValidation.fields.buyerEmail;
  const shippingAddress = customerValidation.fields.shippingAddress;
  const shippingMode = customerValidation.fields.shippingMode;
  const freeAccountCheckoutFields = customerValidation.fields.freeAccount || {};

  const users = await readMockUsersStore();
  const attributionResolution = resolveCheckoutAttribution({
    users,
    requestedStoreCode,
    checkoutMode,
  });
  if (!attributionResolution.ok) {
    return {
      success: false,
      status: attributionResolution.status,
      error: attributionResolution.error,
    };
  }
  const attributionStoreCode = attributionResolution.attributionStoreCode;
  const memberStoreCodeForMetadata = attributionResolution.hasLinkAttribution
    ? attributionStoreCode
    : '';

  const products = await readStoreProductsStore({ includeArchived: false });
  const discountPercent = resolveDiscountPercentForCheckoutMode(payload.discountPercent, checkoutMode);
  const discountRate = discountPercent / 100;

  const checkoutSummary = buildCheckoutLineItems(cartLines, products, discountRate);
  if (checkoutSummary.lineItems.length === 0 || checkoutSummary.total <= 0) {
    return {
      success: false,
      status: 400,
      error: 'Unable to build checkout from the selected cart items.',
    };
  }

  const invoices = await readMockStoreInvoicesStore();
  const invoiceId = resolveNextStoreInvoiceId(invoices);
  const origin = resolveRequestOrigin(context);
  const returnUrls = resolveCheckoutReturnUrls(origin, payload.returnPath, requestedStoreCode);

  const memberStoreLink = normalizeText(payload.memberStoreLink) || buildPublicStoreLink(origin, requestedStoreCode);
  const invoiceStatus = resolveInvoiceStatus(checkoutSummary.total);

  const checkoutMetadata = {
    checkout_type: 'storefront',
    payment_flow: 'hosted-session',
    invoice_id: sanitizeStripeMetadataValue(invoiceId),
    attribution_key: sanitizeStripeMetadataValue(attributionStoreCode),
    member_store_code: sanitizeStripeMetadataValue(memberStoreCodeForMetadata),
    member_store_link: sanitizeStripeMetadataValue(memberStoreLink),
    buyer_name: sanitizeStripeMetadataValue(buyerName),
    buyer_email: sanitizeStripeMetadataValue(buyerEmail),
    shipping_address: sanitizeStripeMetadataValue(shippingAddress),
    shipping_mode: sanitizeStripeMetadataValue(shippingMode),
    buyer_user_id: sanitizeStripeMetadataValue(payload.buyerUserId),
    buyer_username: sanitizeStripeMetadataValue(payload.buyerUsername),
    checkout_mode: sanitizeStripeMetadataValue(checkoutMode, CHECKOUT_MODE_GUEST),
    free_account_member_username: sanitizeStripeMetadataValue(
      checkoutMode === CHECKOUT_MODE_FREE_ACCOUNT ? freeAccountCheckoutFields.memberUsername : '',
    ),
    free_account_phone: sanitizeStripeMetadataValue(
      checkoutMode === CHECKOUT_MODE_FREE_ACCOUNT ? freeAccountCheckoutFields.phone : '',
    ),
    free_account_country_flag: sanitizeStripeMetadataValue(
      checkoutMode === CHECKOUT_MODE_FREE_ACCOUNT ? freeAccountCheckoutFields.countryFlag : '',
    ),
    free_account_notes: sanitizeStripeMetadataValue(
      checkoutMode === CHECKOUT_MODE_FREE_ACCOUNT ? freeAccountCheckoutFields.notes : '',
    ),
    bp: String(Math.max(0, toWholeNumber(checkoutSummary.bp, 0))),
    subtotal: String(checkoutSummary.subtotal),
    discount_amount: String(checkoutSummary.discount),
    discount_percent: String(discountPercent),
    invoice_status: sanitizeStripeMetadataValue(invoiceStatus),
    source: sanitizeStripeMetadataValue(payload.source || 'storefront'),
  };

  const paymentIntentMetadata = {
    invoice_id: checkoutMetadata.invoice_id,
    attribution_key: checkoutMetadata.attribution_key,
    member_store_code: checkoutMetadata.member_store_code,
    checkout_mode: checkoutMetadata.checkout_mode,
    free_account_member_username: checkoutMetadata.free_account_member_username,
    free_account_phone: checkoutMetadata.free_account_phone,
    free_account_country_flag: checkoutMetadata.free_account_country_flag,
    free_account_notes: checkoutMetadata.free_account_notes,
    bp: checkoutMetadata.bp,
    source: checkoutMetadata.source,
  };

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: returnUrls.successUrl,
      cancel_url: returnUrls.cancelUrl,
      line_items: checkoutSummary.lineItems,
      customer_email: buyerEmail || undefined,
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'],
      },
      metadata: checkoutMetadata,
      payment_intent_data: {
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
          attributionKey: attributionStoreCode,
          subtotal: checkoutSummary.subtotal,
          discount: checkoutSummary.discount,
          total: checkoutSummary.total,
          bp: checkoutSummary.bp,
          discountPercent,
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

export async function completeStoreCheckoutSession(payload = {}) {
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

  const sessionId = normalizeText(payload.sessionId);
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

  const metadata = session?.metadata && typeof session.metadata === 'object'
    ? session.metadata
    : {};

  const sessionCustomerDetails = session?.customer_details && typeof session.customer_details === 'object'
    ? session.customer_details
    : {};

  return finalizeSuccessfulStoreCheckout({
    amount: (Number(session?.amount_total) || 0) / 100,
    metadata,
    buyerName: normalizeText(sessionCustomerDetails.name || metadata.buyer_name || 'Store Buyer'),
    buyerEmail: normalizeText(sessionCustomerDetails.email || metadata.buyer_email),
    paymentReference: {
      checkoutSession: {
        id: session?.id || sessionId,
        paymentStatus: session?.payment_status || '',
        status: session?.status || '',
      },
    },
  });
}

export async function completeStoreCheckoutPaymentIntent(payload = {}) {
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

  const paymentIntentId = normalizeText(payload.paymentIntentId);
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

  return finalizeSuccessfulStoreCheckout({
    amount: (Number(paymentIntent?.amount_received) || Number(paymentIntent?.amount) || 0) / 100,
    metadata,
    buyerName: normalizeText(metadata.buyer_name || 'Store Buyer'),
    buyerEmail: normalizeText(paymentIntent?.receipt_email || metadata.buyer_email),
    paymentReference: {
      paymentIntent: {
        id: paymentIntent?.id || paymentIntentId,
        status: paymentIntent?.status || '',
      },
    },
  });
}
