import { createStoreInvoice } from './invoice.service.js';
import { createRegisteredMember, recordMemberPurchase, upgradeMemberAccount } from './member.service.js';
import pool from '../db/db.js';
import {
  linkStripeCustomerToUserIdentity,
  resolveOrCreateStripeCustomerForUserIdentity,
  resolveStripeClient,
  resolveStripeCustomerId,
} from './stripe-client.service.js';
import { readStoreProductsStore } from '../stores/store-product.store.js';
import {
  readMockStoreInvoicesStore,
  writeMockStoreInvoicesStore,
  sanitizeStoreInvoiceRecord,
  resolveNextStoreInvoiceId,
} from '../stores/invoice.store.js';
import { readMockUsersStore } from '../stores/user.store.js';
import {
  readPasswordSetupTokensStore,
  writePasswordSetupTokensStore,
} from '../stores/token.store.js';
import { readRuntimeSettingsStore } from '../stores/runtime.store.js';
import {
  buildPasswordSetupLink,
  isSetupTokenExpired,
  issuePasswordSetupToken,
  resolveAuthAccountAudience,
} from '../utils/auth.helpers.js';
import {
  normalizeStorePackageKey,
  resolveStorePackageEarning,
} from '../utils/store-product-earnings.helpers.js';
import {
  ACCOUNT_UPGRADE_REQUIRED_ERROR_MESSAGE,
  isPendingOrReservationMember,
} from '../utils/member-capability.helpers.js';

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
const DEFAULT_BUILDER_PACKAGE_KEY = 'personal-builder-pack';
const PREFERRED_UPGRADE_CHECKOUT_CLIENT = 'preferred-dashboard-upgrade';
const CHECKOUT_PERSIST_MODE_REWRITE = 'rewrite';
const CHECKOUT_PERSIST_MODE_UPSERT = 'upsert';
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

function resolveDiscountPercentForCheckoutMode(value, checkoutMode = CHECKOUT_MODE_GUEST, options = {}) {
  const isPreferredBuyer = options?.isPreferredBuyer === true;
  const allowPreferredCustomerDiscount = checkoutMode === CHECKOUT_MODE_FREE_ACCOUNT || isPreferredBuyer;

  if (!allowPreferredCustomerDiscount) {
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

function resolveCheckoutClientTag(value) {
  return normalizeText(value).toLowerCase();
}

function resolveCheckoutClientTagFromPayload(payload = {}) {
  return resolveCheckoutClientTag(
    payload.checkoutClient
    || payload.checkout_client
    || payload.checkout_client_tag
    || '',
  );
}

function resolveCheckoutClientTagFromMetadata(metadata = {}) {
  return resolveCheckoutClientTag(
    metadata.checkout_client
    || metadata.checkoutClient
    || metadata.checkout_client_tag
    || '',
  );
}

function isPreferredUpgradeCheckoutClient(value = '') {
  return resolveCheckoutClientTag(value) === PREFERRED_UPGRADE_CHECKOUT_CLIENT;
}

function resolveCheckoutPersistenceMode(metadata = {}) {
  return isPreferredUpgradeCheckoutClient(resolveCheckoutClientTagFromMetadata(metadata))
    ? CHECKOUT_PERSIST_MODE_UPSERT
    : CHECKOUT_PERSIST_MODE_REWRITE;
}

function shouldPersistBuyerIdentityForCheckout({
  checkoutMode = CHECKOUT_MODE_GUEST,
  source = '',
} = {}) {
  const normalizedSource = normalizeText(source).toLowerCase();
  if (normalizedSource === 'member-dashboard') {
    return true;
  }

  if (
    normalizedSource === 'public-storefront'
    && (
      checkoutMode === CHECKOUT_MODE_GUEST
      || checkoutMode === CHECKOUT_MODE_FREE_ACCOUNT
    )
  ) {
    return false;
  }

  return checkoutMode !== CHECKOUT_MODE_GUEST;
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

function resolveStoreOwnerByAttributionCode(users, storeCode, options = {}) {
  const normalizedStoreCode = normalizeStoreCode(storeCode);
  if (!normalizedStoreCode) {
    return null;
  }

  const includeRestrictedOwners = options?.includeRestrictedOwners === true;
  const safeUsers = Array.isArray(users) ? users : [];
  const directStoreOwner = safeUsers.find((user) => {
    const ownerStoreCode = normalizeStoreCode(user?.storeCode);
    const ownerPublicStoreCode = normalizeStoreCode(user?.publicStoreCode);
    return ownerStoreCode === normalizedStoreCode || ownerPublicStoreCode === normalizedStoreCode;
  });
  if (directStoreOwner) {
    if (!includeRestrictedOwners && isPendingOrReservationMember(directStoreOwner)) {
      return null;
    }
    return directStoreOwner;
  }

  const attributionMatches = safeUsers.filter((user) => (
    normalizeStoreCode(user?.attributionStoreCode) === normalizedStoreCode
  ));
  if (attributionMatches.length === 1) {
    if (!includeRestrictedOwners && isPendingOrReservationMember(attributionMatches[0])) {
      return null;
    }
    return attributionMatches[0];
  }

  return null;
}

function resolveCheckoutBuyerIdentity(users = [], payload = {}) {
  const safeUsers = Array.isArray(users) ? users : [];
  const buyerUserId = normalizeText(payload?.buyerUserId || payload?.buyer_user_id);
  const buyerUsername = normalizeText(payload?.buyerUsername || payload?.buyer_username).toLowerCase();
  const buyerEmail = normalizeEmail(payload?.buyerEmail || payload?.buyer_email);

  if (!buyerUserId && !buyerUsername && !buyerEmail) {
    return null;
  }

  return safeUsers.find((user) => {
    const userId = normalizeText(user?.id);
    const username = normalizeText(user?.username).toLowerCase();
    const email = normalizeEmail(user?.email);
    return Boolean(
      (buyerUserId && userId && userId === buyerUserId)
      || (buyerUsername && username && username === buyerUsername)
      || (buyerEmail && email && email === buyerEmail),
    );
  }) || null;
}

function resolveCheckoutBuyerPackageKey({
  users = [],
  payload = {},
  checkoutMode = CHECKOUT_MODE_GUEST,
  fallbackPackageKey = DEFAULT_BUILDER_PACKAGE_KEY,
  matchedBuyer = null,
} = {}) {
  if (checkoutMode === CHECKOUT_MODE_FREE_ACCOUNT) {
    return FREE_ACCOUNT_PACKAGE_KEY;
  }

  const resolvedMatchedBuyer = matchedBuyer || resolveCheckoutBuyerIdentity(users, payload);
  const matchedPackageKey = normalizeStorePackageKey(resolvedMatchedBuyer?.enrollmentPackage);
  if (matchedPackageKey) {
    return matchedPackageKey;
  }

  return normalizeStorePackageKey(fallbackPackageKey) || DEFAULT_BUILDER_PACKAGE_KEY;
}

function resolveCheckoutSettlementProfile({
  checkoutMode = CHECKOUT_MODE_GUEST,
  buyerPackageKey = DEFAULT_BUILDER_PACKAGE_KEY,
  attributionOwner = null,
  hasKnownBuyerIdentity = false,
} = {}) {
  const normalizedBuyerPackageKey = normalizeStorePackageKey(buyerPackageKey)
    || DEFAULT_BUILDER_PACKAGE_KEY;
  const isPreferredBuyer = (
    checkoutMode === CHECKOUT_MODE_FREE_ACCOUNT
    || normalizedBuyerPackageKey === FREE_ACCOUNT_PACKAGE_KEY
  );
  const isRetailGuest = checkoutMode === CHECKOUT_MODE_GUEST && hasKnownBuyerIdentity !== true;
  const usesOwnerSettlement = isPreferredBuyer || isRetailGuest;
  const ownerPackageKey = normalizeStorePackageKey(attributionOwner?.enrollmentPackage)
    || DEFAULT_BUILDER_PACKAGE_KEY;
  const earningsPackageKey = usesOwnerSettlement && attributionOwner
    ? ownerPackageKey
    : normalizedBuyerPackageKey;

  return {
    isPreferredBuyer,
    isRetailGuest,
    usesOwnerSettlement,
    buyerPackageKey: normalizedBuyerPackageKey,
    ownerPackageKey,
    earningsPackageKey,
    applyBuyerBvCredit: !usesOwnerSettlement,
    applyOwnerBvCredit: Boolean(usesOwnerSettlement && attributionOwner),
    includeRetailCommission: Boolean(usesOwnerSettlement && attributionOwner),
  };
}

function resolveAttributionStoreCodeFromOwner(owner = null) {
  if (!owner || typeof owner !== 'object') {
    return '';
  }

  return normalizeStoreCode(
    owner?.attributionStoreCode
    || owner?.storeCode
    || owner?.publicStoreCode,
  );
}

function resolveImplicitAttributionOwnerFromBuyer({
  users = [],
  matchedBuyer = null,
  checkoutMode = CHECKOUT_MODE_GUEST,
  buyerPackageKey = DEFAULT_BUILDER_PACKAGE_KEY,
} = {}) {
  if (!matchedBuyer || typeof matchedBuyer !== 'object') {
    return null;
  }

  const normalizedBuyerPackageKey = normalizeStorePackageKey(buyerPackageKey)
    || DEFAULT_BUILDER_PACKAGE_KEY;
  const isPreferredBuyer = (
    checkoutMode === CHECKOUT_MODE_FREE_ACCOUNT
    || normalizedBuyerPackageKey === FREE_ACCOUNT_PACKAGE_KEY
  );
  if (!isPreferredBuyer) {
    return null;
  }

  const candidateStoreCodes = [
    normalizeStoreCode(matchedBuyer?.attributionStoreCode),
    normalizeStoreCode(matchedBuyer?.storeCode),
    normalizeStoreCode(matchedBuyer?.publicStoreCode),
  ].filter(Boolean);

  for (const candidateStoreCode of candidateStoreCodes) {
    const owner = resolveStoreOwnerByAttributionCode(users, candidateStoreCode);
    if (owner) {
      return owner;
    }
  }

  return null;
}

async function resolveConfiguredUnattributedFreeAccountSponsorUsername() {
  try {
    const runtimeSettings = await readRuntimeSettingsStore();
    const runtimeConfiguredValue = normalizeText(
      runtimeSettings?.unattributed_free_account_fallback_sponsor_username,
    );
    if (runtimeConfiguredValue) {
      return runtimeConfiguredValue;
    }
  } catch (error) {
    console.warn('[store-checkout] Unable to read runtime fallback sponsor setting:', error);
  }

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
    const attributionOwner = resolveStoreOwnerByAttributionCode(
      users,
      normalizedRequestedStoreCode,
      { includeRestrictedOwners: true },
    );
    if (!attributionOwner) {
      return {
        ok: false,
        status: 404,
        error: 'Member store code was not found. Please verify the store code.',
      };
    }
    if (isPendingOrReservationMember(attributionOwner)) {
      return {
        ok: false,
        status: 403,
        error: ACCOUNT_UPGRADE_REQUIRED_ERROR_MESSAGE,
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

function normalizeCheckoutUpgradeProductKey(value = '') {
  const normalized = normalizeText(value).toLowerCase().replace(/[^a-z0-9]/g, '');
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

function normalizeCheckoutUpgradeProductMode(value = '', selectedProductKey = '') {
  const normalizedMode = normalizeText(value).toLowerCase().replace(/[^a-z0-9]/g, '');
  if (normalizedMode.includes('split')) {
    return 'split';
  }
  if (normalizedMode.includes('roast')) {
    return 'all-metaroast';
  }
  if (normalizedMode.includes('charge')) {
    return 'all-metacharge';
  }

  const normalizedSelectedProductKey = normalizeCheckoutUpgradeProductKey(selectedProductKey);
  if (normalizedSelectedProductKey) {
    return 'split';
  }
  return 'all-metacharge';
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
  const successUrlString = successUrl.toString().replace('%7BCHECKOUT_SESSION_ID%7D', '{CHECKOUT_SESSION_ID}');

  const cancelUrl = new URL(baseReturnUrl.toString());
  cancelUrl.searchParams.set('checkout', 'cancel');
  cancelUrl.searchParams.delete('session_id');

  return {
    successUrl: successUrlString,
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

function buildCheckoutLineItems(cartLines, products, discountRate = 0, options = {}) {
  const productById = new Map((Array.isArray(products) ? products : []).map((product) => [product.id, product]));
  const buyerPackageKey = normalizeStorePackageKey(options?.buyerPackageKey) || DEFAULT_BUILDER_PACKAGE_KEY;
  const earningsPackageKey = normalizeStorePackageKey(options?.earningsPackageKey)
    || buyerPackageKey
    || DEFAULT_BUILDER_PACKAGE_KEY;
  const applyBuyerBvCredit = options?.applyBuyerBvCredit !== false;
  const applyOwnerBvCredit = options?.applyOwnerBvCredit === true;
  const includeRetailCommission = options?.includeRetailCommission === true;

  const checkoutLines = [];
  let subtotal = 0;
  let total = 0;
  let totalResolvedBv = 0;
  let totalRetailCommission = 0;

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
    const packageEarning = resolveStorePackageEarning(product, earningsPackageKey, {
      fallbackPackageKey: DEFAULT_BUILDER_PACKAGE_KEY,
    });
    const resolvedBvPerUnit = toWholeNumber(
      packageEarning?.bv,
      toWholeNumber(product.bp, 0),
    );
    const retailCommissionPerUnit = includeRetailCommission
      ? roundCurrency(packageEarning?.retailCommission)
      : 0;
    totalResolvedBv += resolvedBvPerUnit * quantity;
    totalRetailCommission += retailCommissionPerUnit * quantity;
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
  const invoiceBv = Math.max(0, toWholeNumber(totalResolvedBv, 0));
  const buyerBv = applyBuyerBvCredit ? invoiceBv : 0;
  const ownerBv = applyOwnerBvCredit ? invoiceBv : 0;

  return {
    checkoutLines,
    lineItems: checkoutLines.map((line) => line.lineItem),
    subtotal: roundedSubtotal,
    total: roundedTotal,
    discount,
    buyerPackageKey,
    earningsPackageKey,
    invoiceBv,
    buyerBv,
    ownerBv,
    retailCommission: roundCurrency(totalRetailCommission),
    bp: invoiceBv,
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

function resolveStripeInvoiceReference(invoice = null) {
  if (!invoice || typeof invoice !== 'object') {
    return {
      id: '',
      number: '',
      hostedUrl: '',
      pdfUrl: '',
      paymentStatus: '',
    };
  }

  return {
    id: normalizeText(invoice.id),
    number: normalizeText(invoice.number),
    hostedUrl: normalizeStripeUrl(invoice.hosted_invoice_url),
    pdfUrl: normalizeStripeUrl(invoice.invoice_pdf),
    paymentStatus: normalizeText(invoice.status || invoice.collection_status || invoice.payment_status),
  };
}

function resolveStripeReferenceData(reference = {}) {
  const safeReference = reference && typeof reference === 'object' ? reference : {};
  const invoiceReference = resolveStripeInvoiceReference(safeReference.invoice);

  return {
    stripeCustomerId: normalizeText(safeReference.customerId || safeReference.stripeCustomerId),
    stripeCheckoutSessionId: normalizeText(safeReference.checkoutSessionId || safeReference.stripeCheckoutSessionId),
    stripePaymentIntentId: normalizeText(safeReference.paymentIntentId || safeReference.stripePaymentIntentId),
    stripeInvoiceId: normalizeText(safeReference.invoiceId || invoiceReference.id),
    stripeInvoiceNumber: normalizeText(safeReference.invoiceNumber || invoiceReference.number),
    stripeInvoiceHostedUrl: normalizeStripeUrl(safeReference.invoiceHostedUrl || invoiceReference.hostedUrl),
    stripeInvoicePdfUrl: normalizeStripeUrl(safeReference.invoicePdfUrl || invoiceReference.pdfUrl),
    stripePaymentStatus: normalizeText(
      safeReference.paymentStatus
      || safeReference.stripePaymentStatus
      || invoiceReference.paymentStatus,
    ),
  };
}

function mergeInvoiceStripeReference(invoice, stripeReference = {}) {
  return sanitizeStoreInvoiceRecord({
    ...invoice,
    stripeCustomerId: normalizeText(stripeReference.stripeCustomerId) || normalizeText(invoice?.stripeCustomerId),
    stripeCheckoutSessionId: normalizeText(stripeReference.stripeCheckoutSessionId) || normalizeText(invoice?.stripeCheckoutSessionId),
    stripePaymentIntentId: normalizeText(stripeReference.stripePaymentIntentId) || normalizeText(invoice?.stripePaymentIntentId),
    stripeInvoiceId: normalizeText(stripeReference.stripeInvoiceId) || normalizeText(invoice?.stripeInvoiceId),
    stripeInvoiceNumber: normalizeText(stripeReference.stripeInvoiceNumber) || normalizeText(invoice?.stripeInvoiceNumber),
    stripeInvoiceHostedUrl: normalizeStripeUrl(stripeReference.stripeInvoiceHostedUrl) || normalizeStripeUrl(invoice?.stripeInvoiceHostedUrl),
    stripeInvoicePdfUrl: normalizeStripeUrl(stripeReference.stripeInvoicePdfUrl) || normalizeStripeUrl(invoice?.stripeInvoicePdfUrl),
    stripePaymentStatus: normalizeText(stripeReference.stripePaymentStatus) || normalizeText(invoice?.stripePaymentStatus),
  }, normalizeText(invoice?.id));
}

function hasInvoiceStripeReferenceChanges(previousInvoice = {}, nextInvoice = {}) {
  const fields = [
    'stripeCustomerId',
    'stripeCheckoutSessionId',
    'stripePaymentIntentId',
    'stripeInvoiceId',
    'stripeInvoiceNumber',
    'stripeInvoiceHostedUrl',
    'stripeInvoicePdfUrl',
    'stripePaymentStatus',
  ];

  return fields.some((field) => normalizeText(previousInvoice?.[field]) !== normalizeText(nextInvoice?.[field]));
}

async function resolveStripeInvoiceForCheckoutSession(stripe, session = null) {
  const checkoutInvoiceId = resolveStripeCustomerId(session?.invoice);
  if (checkoutInvoiceId) {
    try {
      return await stripe.invoices.retrieve(checkoutInvoiceId);
    } catch {
      return null;
    }
  }

  const paymentIntentId = resolveStripeCustomerId(session?.payment_intent);
  if (!paymentIntentId) {
    return null;
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['latest_charge.invoice'],
    });
    const invoiceFromPaymentIntent = paymentIntent?.latest_charge?.invoice || null;
    const invoiceId = resolveStripeCustomerId(invoiceFromPaymentIntent);
    if (!invoiceId) {
      return null;
    }
    if (invoiceFromPaymentIntent && typeof invoiceFromPaymentIntent === 'object' && !invoiceFromPaymentIntent.deleted) {
      return invoiceFromPaymentIntent;
    }
    return stripe.invoices.retrieve(invoiceId);
  } catch {
    return null;
  }
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
    ? resolveStoreOwnerByAttributionCode(users, normalizedAttributionKey, { includeRestrictedOwners: true })
    : null;
  if (sponsorUser && isPendingOrReservationMember(sponsorUser)) {
    return {
      ...fallbackIdentity,
      reason: ACCOUNT_UPGRADE_REQUIRED_ERROR_MESSAGE,
    };
  }
  let sponsorUsername = normalizeText(sponsorUser?.username);
  let sponsorName = normalizeText(sponsorUser?.name || sponsorUser?.username || 'Store Owner');

  // Free-account checkouts without referral attribution are parked under a holding sponsor
  // (defaults to "admin") so Admin can reassign later without crediting random uplines.
  if (!sponsorUsername && !normalizedAttributionKey) {
    const configuredHoldingSponsorUsername = normalizeText(
      await resolveConfiguredUnattributedFreeAccountSponsorUsername(),
    );
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

function resolveCheckoutAccountUpgradeTargetPackage(metadata = {}) {
  return normalizeStorePackageKey(
    metadata.account_upgrade_target_package
    || metadata.accountUpgradeTargetPackage
    || metadata.account_upgrade_package
    || '',
  );
}

function resolveCheckoutAccountUpgradeSelectedProductKey(metadata = {}) {
  return normalizeCheckoutUpgradeProductKey(
    metadata.account_upgrade_selected_product_key
    || metadata.accountUpgradeSelectedProductKey
    || metadata.account_upgrade_product_key
    || metadata.accountUpgradeProductKey
    || metadata.upgrade_product_key
    || metadata.upgradeProductKey
    || '',
  );
}

function resolveCheckoutAccountUpgradeProductMode(metadata = {}, selectedProductKey = '') {
  return normalizeCheckoutUpgradeProductMode(
    metadata.account_upgrade_product_mode
    || metadata.accountUpgradeProductMode
    || metadata.account_upgrade_split_mode
    || metadata.accountUpgradeSplitMode
    || metadata.account_upgrade_mode
    || metadata.accountUpgradeMode
    || '',
    selectedProductKey,
  );
}

function isCheckoutAccountUpgradeEnabled(metadata = {}) {
  const explicitFlag = normalizeText(
    metadata.account_upgrade_enabled
    || metadata.accountUpgradeEnabled
    || '',
  ).toLowerCase();
  if (explicitFlag === '1' || explicitFlag === 'true' || explicitFlag === 'yes') {
    return true;
  }
  return Boolean(resolveCheckoutAccountUpgradeTargetPackage(metadata));
}

async function applyCheckoutAccountUpgrade({
  metadata = {},
  buyerUserId = '',
  buyerUsername = '',
  buyerEmail = '',
} = {}) {
  const upgradeTargetPackage = resolveCheckoutAccountUpgradeTargetPackage(metadata);
  const upgradeSelectedProductKey = resolveCheckoutAccountUpgradeSelectedProductKey(metadata);
  const upgradeProductMode = resolveCheckoutAccountUpgradeProductMode(metadata, upgradeSelectedProductKey);
  const shouldUpgrade = isCheckoutAccountUpgradeEnabled(metadata) && Boolean(upgradeTargetPackage);
  if (!shouldUpgrade) {
    return {
      ok: true,
      attempted: false,
      targetPackage: '',
      message: 'No account upgrade requested for this checkout.',
    };
  }

  const userId = normalizeText(buyerUserId);
  const username = normalizeText(buyerUsername);
  const email = normalizeEmail(buyerEmail);
  if (!userId && !username && !email) {
    return {
      ok: false,
      attempted: true,
      targetPackage: upgradeTargetPackage,
      message: 'Payment completed, but account upgrade could not be linked to a member account.',
    };
  }

  const upgradeResult = await upgradeMemberAccount({
    userId,
    username,
    email,
    targetPackage: upgradeTargetPackage,
    upgradeSplitSelectedProductKey: upgradeSelectedProductKey,
    upgradeSplitProductMode: upgradeProductMode,
  }, {
    persistMode: resolveCheckoutPersistenceMode(metadata),
  });
  if (upgradeResult?.success) {
    return {
      ok: true,
      attempted: true,
      targetPackage: upgradeTargetPackage,
      message: 'Account upgrade applied.',
      user: upgradeResult.user || null,
      member: upgradeResult.member || null,
      upgrade: upgradeResult.upgrade || null,
    };
  }

  const errorMessage = normalizeText(upgradeResult?.error);
  const normalizedErrorMessage = errorMessage.toLowerCase();
  const alreadyUpgraded = (
    upgradeResult?.status === 409
    && (
      normalizedErrorMessage.includes('already on this package tier')
      || normalizedErrorMessage.includes('already at the highest package tier')
    )
  );
  if (alreadyUpgraded) {
    return {
      ok: true,
      attempted: true,
      targetPackage: upgradeTargetPackage,
      message: errorMessage || 'Account already upgraded to the requested package tier.',
      user: upgradeResult.user || null,
      member: upgradeResult.member || null,
      upgrade: upgradeResult.upgrade || null,
    };
  }

  return {
    ok: false,
    attempted: true,
    targetPackage: upgradeTargetPackage,
    status: Number.isFinite(Number(upgradeResult?.status)) ? Number(upgradeResult.status) : 500,
    message: errorMessage || 'Payment completed, but account upgrade could not be processed.',
  };
}

async function finalizeSuccessfulStoreCheckout({
  amount,
  metadata = {},
  buyerName = '',
  buyerEmail = '',
  paymentReference = {},
  stripeReference = {},
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
  const invoiceBv = parseMetadataWholeNumber(
    metadata.invoice_bv ?? metadata.bp ?? metadata.buyer_bv,
    0,
  );
  let buyerBv = parseMetadataWholeNumber(metadata.buyer_bv, invoiceBv);
  const retailCommission = parseMetadataCurrencyValue(metadata.retail_commission, 0);
  const buyerPackageKey = normalizeStorePackageKey(metadata.buyer_package_key || '');
  const discount = parseMetadataCurrencyValue(metadata.discount_amount, 0);
  const invoiceStatus = normalizeText(metadata.invoice_status) || resolveInvoiceStatus(normalizedAmount);
  const attributionKey = normalizeStoreCode(metadata.attribution_key || metadata.member_store_code);
  const memberStoreCode = normalizeStoreCode(metadata.member_store_code || attributionKey);
  const memberStoreLink = normalizeText(metadata.member_store_link);
  const resolvedBuyerName = normalizeText(buyerName || metadata.buyer_name || 'Store Buyer');
  const resolvedBuyerEmail = normalizeEmail(buyerEmail || metadata.buyer_email);
  const checkoutMode = normalizeCheckoutMode(metadata.checkout_mode || metadata.checkoutMode);
  const persistBuyerIdentityFromMetadata = shouldPersistBuyerIdentityForCheckout({
    checkoutMode,
    source: metadata.source || metadata.source_label || '',
  });
  const accountUpgradeTargetPackage = resolveCheckoutAccountUpgradeTargetPackage(metadata);
  const isAccountUpgradeCheckout = (
    isCheckoutAccountUpgradeEnabled(metadata)
    && Boolean(accountUpgradeTargetPackage)
  );
  const checkoutPersistenceMode = resolveCheckoutPersistenceMode(metadata);
  const resolvedBuyerPackageKey = buyerPackageKey
    || (checkoutMode === CHECKOUT_MODE_FREE_ACCOUNT ? FREE_ACCOUNT_PACKAGE_KEY : '');
  const isPreferredBuyerCheckout = resolvedBuyerPackageKey === FREE_ACCOUNT_PACKAGE_KEY;
  let ownerBv = parseMetadataWholeNumber(metadata.owner_bv, 0);
  if (ownerBv <= 0 && isPreferredBuyerCheckout && buyerBv > 0) {
    ownerBv = buyerBv;
  }
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
    (persistBuyerIdentityFromMetadata ? metadata.buyer_user_id : '')
    || (checkoutMode === CHECKOUT_MODE_FREE_ACCOUNT ? preferredCustomerIdentity.userId : ''),
  );
  const buyerUsername = normalizeText(
    (persistBuyerIdentityFromMetadata ? metadata.buyer_username : '')
    || (checkoutMode === CHECKOUT_MODE_FREE_ACCOUNT ? preferredCustomerIdentity.username : ''),
  );
  const buyerEmailForInvoice = normalizeEmail(
    resolvedBuyerEmail
    || (checkoutMode === CHECKOUT_MODE_FREE_ACCOUNT ? preferredCustomerIdentity.email : ''),
  );
  if (
    buyerBv <= 0
    && ownerBv <= 0
    && invoiceBv > 0
    && checkoutMode === CHECKOUT_MODE_GUEST
    && persistBuyerIdentityFromMetadata
    && (buyerUserId || buyerUsername || buyerEmailForInvoice)
  ) {
    // Legacy sessions may carry buyer identity but store buyer_bv as zero.
    // In member-dashboard guest flow, treat invoice BV as buyer credit.
    buyerBv = invoiceBv;
  }
  const normalizedStripeReference = resolveStripeReferenceData({
    ...stripeReference,
    paymentStatus: stripeReference?.paymentStatus || paymentReference?.paymentStatus,
  });

  if (normalizedStripeReference.stripeCustomerId) {
    await linkStripeCustomerToUserIdentity({
      customerId: normalizedStripeReference.stripeCustomerId,
      userId: buyerUserId,
      username: buyerUsername,
      email: buyerEmailForInvoice,
    }).catch(() => {});
  }

  const settlementLockKey = `store-checkout:${invoiceId}`;
  const settlementLockClient = await pool.connect();
  await settlementLockClient.query('SELECT pg_advisory_lock(hashtext($1))', [settlementLockKey]);
  try {
    const existingInvoices = await readMockStoreInvoicesStore();
    const existingInvoiceIndex = existingInvoices.findIndex((invoice) => (
      normalizeText(invoice?.id).toUpperCase() === invoiceId
    ));
    const existingInvoice = existingInvoiceIndex >= 0 ? existingInvoices[existingInvoiceIndex] : null;

    if (existingInvoice) {
      const patchedInvoice = mergeInvoiceStripeReference(existingInvoice, normalizedStripeReference);
      if (patchedInvoice && hasInvoiceStripeReferenceChanges(existingInvoice, patchedInvoice)) {
        existingInvoices[existingInvoiceIndex] = patchedInvoice;
        await writeMockStoreInvoicesStore(existingInvoices);
      }

      const accountUpgrade = await applyCheckoutAccountUpgrade({
        metadata,
        buyerUserId,
        buyerUsername,
        buyerEmail: buyerEmailForInvoice,
      });
      return {
        success: true,
        status: 200,
        data: {
          success: true,
          completed: true,
          alreadyProcessed: true,
          invoice: patchedInvoice || existingInvoice,
          preferredCustomer: preferredCustomerIdentity,
          accountUpgrade,
          ...paymentReference,
        },
      };
    }

    const attributionSnapshot = {
      attributionKey: attributionKey || '',
      memberStoreCode: memberStoreCode || '',
      memberStoreLink: memberStoreLink || '',
      checkoutMode,
      source: normalizeText(metadata.source || metadata.source_label || ''),
      fallbackAttributionUsed: normalizeText(metadata.fallback_attribution_used).toLowerCase() === 'true',
    };
    const settlementProfileSnapshot = {
      buyerPackageKey: resolvedBuyerPackageKey || '',
      isPreferredBuyerCheckout,
      ownerBv,
      buyerBv,
      retailCommission,
      discount,
      accountUpgradeTargetPackage,
    };

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
      bp: invoiceBv,
      retailCommission,
      buyerPackageKey,
      discount,
      attributionSnapshot,
      settlementProfile: settlementProfileSnapshot,
      stripeCustomerId: normalizedStripeReference.stripeCustomerId,
      stripeCheckoutSessionId: normalizedStripeReference.stripeCheckoutSessionId,
      stripePaymentIntentId: normalizedStripeReference.stripePaymentIntentId,
      stripeInvoiceId: normalizedStripeReference.stripeInvoiceId,
      stripeInvoiceNumber: normalizedStripeReference.stripeInvoiceNumber,
      stripeInvoiceHostedUrl: normalizedStripeReference.stripeInvoiceHostedUrl,
      stripeInvoicePdfUrl: normalizedStripeReference.stripeInvoicePdfUrl,
      stripePaymentStatus: normalizedStripeReference.stripePaymentStatus,
      status: invoiceStatus,
    });

    if (!invoiceResult.success) {
      if (invoiceResult.status === 409) {
        const invoicesAfterConflict = await readMockStoreInvoicesStore();
        const matchedInvoiceIndex = invoicesAfterConflict.findIndex((invoice) => (
          normalizeText(invoice?.id).toUpperCase() === invoiceId
        ));
        const matchedInvoice = matchedInvoiceIndex >= 0
          ? invoicesAfterConflict[matchedInvoiceIndex]
          : null;
        if (matchedInvoice) {
          const patchedInvoice = mergeInvoiceStripeReference(matchedInvoice, normalizedStripeReference);
          if (patchedInvoice && hasInvoiceStripeReferenceChanges(matchedInvoice, patchedInvoice)) {
            invoicesAfterConflict[matchedInvoiceIndex] = patchedInvoice;
            await writeMockStoreInvoicesStore(invoicesAfterConflict);
          }

          const accountUpgrade = await applyCheckoutAccountUpgrade({
            metadata,
            buyerUserId,
            buyerUsername,
            buyerEmail: buyerEmailForInvoice,
          });
          return {
            success: true,
            status: 200,
            data: {
              success: true,
              completed: true,
              alreadyProcessed: true,
              invoice: patchedInvoice || matchedInvoice,
              preferredCustomer: preferredCustomerIdentity,
              accountUpgrade,
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
    const effectiveAttributionOwner = isPendingOrReservationMember(attributionOwner)
      ? null
      : attributionOwner;

    let buyerCredit = {
      ok: true,
      message: isAccountUpgradeCheckout
        ? 'Buyer BV credit skipped for account upgrade checkout.'
        : 'No buyer BV credit required.',
    };

    if (
      !isAccountUpgradeCheckout
      && buyerBv > 0
      && (buyerUserId || buyerUsername || buyerEmailForInvoice)
    ) {
      const buyerCreditResult = await recordMemberPurchase({
        userId: buyerUserId,
        username: buyerUsername,
        email: buyerEmailForInvoice,
        pvGain: buyerBv,
      }, {
        persistMode: checkoutPersistenceMode,
        allowPendingPersonalBvCredit: true,
      });

      buyerCredit = buyerCreditResult.success
        ? {
            ok: true,
            message: 'Buyer BV credit applied.',
            user: buyerCreditResult.user,
            purchase: buyerCreditResult.purchase,
          }
        : {
            ok: false,
            message: buyerCreditResult.error || 'Unable to credit buyer BV.',
          };
    }

    let ownerCredit = {
      ok: true,
      message: 'No owner BV credit required.',
    };

    if (
      ownerBv > 0
      && effectiveAttributionOwner
      && (effectiveAttributionOwner.userId || effectiveAttributionOwner.username || effectiveAttributionOwner.email)
    ) {
      const ownerCreditResult = await recordMemberPurchase({
        userId: normalizeText(effectiveAttributionOwner.userId),
        username: normalizeText(effectiveAttributionOwner.username),
        email: normalizeText(effectiveAttributionOwner.email),
        pvGain: ownerBv,
      }, {
        persistMode: checkoutPersistenceMode,
      });

      ownerCredit = ownerCreditResult.success
        ? {
            ok: true,
            message: 'Owner BV credit applied from preferred-customer purchase.',
            user: ownerCreditResult.user,
            purchase: ownerCreditResult.purchase,
          }
        : {
            ok: false,
            message: ownerCreditResult.error || 'Unable to credit owner BV.',
          };
    }

    const ownerRetailCommission = {
      amount: retailCommission,
      attributed: Boolean(
        effectiveAttributionOwner
        && (effectiveAttributionOwner.userId || effectiveAttributionOwner.username || effectiveAttributionOwner.email),
      ),
      owner: effectiveAttributionOwner,
      message: effectiveAttributionOwner
        ? (retailCommission > 0
          ? 'Retail commission mapped to attribution owner.'
          : 'No retail commission for this checkout.')
        : (retailCommission > 0
          ? 'Retail commission recorded without attribution owner.'
          : 'No retail commission for this checkout.'),
    };
    const accountUpgrade = await applyCheckoutAccountUpgrade({
      metadata,
      buyerUserId,
      buyerUsername,
      buyerEmail: buyerEmailForInvoice,
    });

    return {
      success: true,
      status: 200,
      data: {
        success: true,
        completed: true,
        alreadyProcessed: false,
        invoice: createdInvoice,
        attributionOwner: effectiveAttributionOwner,
        preferredCustomer: preferredCustomerIdentity,
        accountUpgrade,
        buyerCredit,
        ownerCredit,
        ownerRetailCommission,
        ...paymentReference,
      },
    };
  } finally {
    await settlementLockClient.query('SELECT pg_advisory_unlock(hashtext($1))', [settlementLockKey]).catch(() => {});
    settlementLockClient.release();
  }
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

function appendStoreCodeToRelativePath(pathnameWithSearch = '', storeCode = '') {
  const normalizedPathnameWithSearch = normalizeText(pathnameWithSearch);
  const normalizedStoreCode = normalizeStoreCode(storeCode);
  if (!normalizedPathnameWithSearch) {
    return '';
  }

  try {
    const parsedUrl = new URL(normalizedPathnameWithSearch, 'http://localhost');
    if (normalizedStoreCode) {
      parsedUrl.searchParams.set('store', normalizedStoreCode);
    }
    return `${parsedUrl.pathname}${parsedUrl.search}`;
  } catch {
    return normalizedPathnameWithSearch;
  }
}

function resolvePreferredRegistrationPayloadFields(payload = {}) {
  const buyerName = normalizeText(payload?.buyerName || payload?.fullName || payload?.name);
  const buyerEmail = normalizeEmail(payload?.buyerEmail || payload?.email);
  const freeAccountRegistration = resolveFreeAccountCheckoutFields(payload);

  if (!buyerName) {
    return {
      ok: false,
      status: 400,
      error: 'Full name is required.',
    };
  }

  if (!buyerEmail) {
    return {
      ok: false,
      status: 400,
      error: 'A valid email is required.',
    };
  }

  if (!freeAccountRegistration.memberUsername) {
    return {
      ok: false,
      status: 400,
      error: 'Username is required for Preferred Account registration.',
    };
  }

  if (!FREE_ACCOUNT_USERNAME_PATTERN.test(freeAccountRegistration.memberUsername)) {
    return {
      ok: false,
      status: 400,
      error: 'Username must be 3-24 characters and can include letters, numbers, dot, underscore, and dash.',
    };
  }

  return {
    ok: true,
    fields: {
      buyerName,
      buyerEmail,
      freeAccountRegistration,
    },
  };
}

export async function registerPreferredCustomerWithoutCheckout(payload = {}, context = {}) {
  const storeCodeResolution = resolveRequestedCheckoutStoreCode(payload, context);
  if (!storeCodeResolution.ok) {
    return {
      success: false,
      status: storeCodeResolution.status,
      error: storeCodeResolution.error,
    };
  }
  const requestedStoreCode = storeCodeResolution.storeCode;

  const payloadFields = resolvePreferredRegistrationPayloadFields(payload);
  if (!payloadFields.ok) {
    return {
      success: false,
      status: payloadFields.status,
      error: payloadFields.error,
    };
  }

  const identity = await resolveCheckoutBuyerPreferredCustomerIdentity({
    attributionKey: requestedStoreCode,
    buyerName: payloadFields.fields.buyerName,
    buyerEmail: payloadFields.fields.buyerEmail,
    freeAccountRegistration: payloadFields.fields.freeAccountRegistration,
  });

  if (!identity.ok) {
    const blockedForPendingOwner = normalizeText(identity.reason) === ACCOUNT_UPGRADE_REQUIRED_ERROR_MESSAGE;
    return {
      success: false,
      status: blockedForPendingOwner ? 403 : 422,
      error: identity.reason || 'Unable to register Preferred Account at this time.',
    };
  }

  const setupLink = appendStoreCodeToRelativePath(identity.setupLink, requestedStoreCode);
  const loginLink = appendStoreCodeToRelativePath('/login.html', requestedStoreCode);
  const created = identity.created === true;

  return {
    success: true,
    status: created ? 201 : 200,
    data: {
      success: true,
      registration: {
        created,
        userId: normalizeText(identity.userId),
        username: normalizeText(identity.username),
        email: normalizeEmail(identity.email),
        attributionStoreCode: requestedStoreCode,
        requiresPasswordSetup: Boolean(setupLink),
        setupLink,
        loginLink,
        message: setupLink
          ? 'Preferred account is ready. Continue to password setup.'
          : 'Preferred account exists and already has a password. Continue to login.',
      },
    },
  };
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

  const products = await readStoreProductsStore({ includeArchived: false });
  const matchedBuyer = resolveCheckoutBuyerIdentity(users, payload);
  const buyerPackageKey = resolveCheckoutBuyerPackageKey({
    users,
    payload,
    checkoutMode,
    matchedBuyer,
  });
  const implicitAttributionOwner = attributionResolution.attributionOwner
    ? null
    : resolveImplicitAttributionOwnerFromBuyer({
        users,
        matchedBuyer,
        checkoutMode,
        buyerPackageKey,
      });
  const effectiveAttributionOwner = attributionResolution.attributionOwner || implicitAttributionOwner;
  const effectiveAttributionStoreCode = attributionStoreCode
    || resolveAttributionStoreCodeFromOwner(effectiveAttributionOwner);
  const memberStoreCodeForMetadata = (
    attributionResolution.hasLinkAttribution
    || Boolean(implicitAttributionOwner)
  )
    ? effectiveAttributionStoreCode
    : '';
  const settlementProfile = resolveCheckoutSettlementProfile({
    checkoutMode,
    buyerPackageKey,
    attributionOwner: effectiveAttributionOwner,
    hasKnownBuyerIdentity: Boolean(matchedBuyer),
  });
  const discountPercent = resolveDiscountPercentForCheckoutMode(payload.discountPercent, checkoutMode, {
    isPreferredBuyer: settlementProfile.isPreferredBuyer,
  });
  const discountRate = discountPercent / 100;

  const checkoutSummary = buildCheckoutLineItems(cartLines, products, discountRate, {
    buyerPackageKey: settlementProfile.buyerPackageKey,
    earningsPackageKey: settlementProfile.earningsPackageKey,
    applyBuyerBvCredit: settlementProfile.applyBuyerBvCredit,
    applyOwnerBvCredit: settlementProfile.applyOwnerBvCredit,
    includeRetailCommission: settlementProfile.includeRetailCommission,
  });
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
  const persistBuyerIdentityForMetadata = shouldPersistBuyerIdentityForCheckout({
    checkoutMode,
    source: payload.source,
  });
  const accountUpgradeTargetPackage = normalizeStorePackageKey(
    payload.accountUpgradeTargetPackage || payload.account_upgrade_target_package,
  );
  const isAccountUpgradeCheckout = Boolean(accountUpgradeTargetPackage);
  const accountUpgradeSelectedProductKey = normalizeCheckoutUpgradeProductKey(
    payload.accountUpgradeSelectedProductKey
    || payload.account_upgrade_selected_product_key
    || payload.accountUpgradeProductKey
    || payload.account_upgrade_product_key
    || payload.upgradeProductKey
    || payload.upgrade_product_key
    || '',
  );
  const accountUpgradeProductMode = normalizeCheckoutUpgradeProductMode(
    payload.accountUpgradeProductMode
    || payload.account_upgrade_product_mode
    || payload.accountUpgradeSplitMode
    || payload.account_upgrade_split_mode
    || payload.accountUpgradeMode
    || payload.account_upgrade_mode
    || '',
    accountUpgradeSelectedProductKey,
  );
  const checkoutClientTag = resolveCheckoutClientTagFromPayload(payload);

  const checkoutMetadata = {
    checkout_type: 'storefront',
    payment_flow: 'embedded-elements',
    invoice_id: sanitizeStripeMetadataValue(invoiceId),
    attribution_key: sanitizeStripeMetadataValue(effectiveAttributionStoreCode),
    member_store_code: sanitizeStripeMetadataValue(memberStoreCodeForMetadata),
    member_store_link: sanitizeStripeMetadataValue(memberStoreLink),
    buyer_name: sanitizeStripeMetadataValue(buyerName),
    buyer_email: sanitizeStripeMetadataValue(buyerEmail),
    shipping_address: sanitizeStripeMetadataValue(shippingAddress),
    shipping_mode: sanitizeStripeMetadataValue(shippingMode),
    buyer_user_id: sanitizeStripeMetadataValue(
      persistBuyerIdentityForMetadata ? payload.buyerUserId : '',
    ),
    buyer_username: sanitizeStripeMetadataValue(
      persistBuyerIdentityForMetadata ? payload.buyerUsername : '',
    ),
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
    buyer_package_key: sanitizeStripeMetadataValue(checkoutSummary.buyerPackageKey || settlementProfile.buyerPackageKey),
    settlement_package_key: sanitizeStripeMetadataValue(checkoutSummary.earningsPackageKey || settlementProfile.earningsPackageKey),
    invoice_bv: String(Math.max(0, toWholeNumber(checkoutSummary.invoiceBv, 0))),
    buyer_bv: String(Math.max(0, toWholeNumber(checkoutSummary.buyerBv, 0))),
    owner_bv: String(Math.max(0, toWholeNumber(checkoutSummary.ownerBv, 0))),
    retail_commission: String(roundCurrency(checkoutSummary.retailCommission)),
    bp: String(Math.max(0, toWholeNumber(checkoutSummary.bp, 0))),
    subtotal: String(checkoutSummary.subtotal),
    discount_amount: String(checkoutSummary.discount),
    discount_percent: String(discountPercent),
    invoice_status: sanitizeStripeMetadataValue(invoiceStatus),
    fallback_attribution_used: implicitAttributionOwner && !attributionResolution.hasLinkAttribution ? 'true' : 'false',
    account_upgrade_enabled: isAccountUpgradeCheckout ? 'true' : 'false',
    account_upgrade_target_package: sanitizeStripeMetadataValue(accountUpgradeTargetPackage),
    account_upgrade_selected_product_key: sanitizeStripeMetadataValue(accountUpgradeSelectedProductKey),
    account_upgrade_product_mode: sanitizeStripeMetadataValue(accountUpgradeProductMode),
    checkout_client: sanitizeStripeMetadataValue(checkoutClientTag),
    source: sanitizeStripeMetadataValue(payload.source || 'storefront'),
  };
  let stripeCustomerId = '';
  try {
    const customerResolution = await resolveOrCreateStripeCustomerForUserIdentity({
      userId: persistBuyerIdentityForMetadata ? normalizeText(payload.buyerUserId) : '',
      username: persistBuyerIdentityForMetadata ? normalizeText(payload.buyerUsername) : '',
      email: buyerEmail,
      name: buyerName,
    }, {
      stripe,
      allowCreate: checkoutMode !== CHECKOUT_MODE_GUEST || persistBuyerIdentityForMetadata,
      metadata: {
        checkout_type: 'storefront',
      },
    });
    stripeCustomerId = normalizeText(customerResolution?.customerId);
  } catch {
    stripeCustomerId = '';
  }

  if (stripeCustomerId) {
    checkoutMetadata.stripe_customer_id = sanitizeStripeMetadataValue(stripeCustomerId);
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: resolveCurrencyMinorAmount(checkoutSummary.total),
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      receipt_email: buyerEmail || undefined,
      customer: stripeCustomerId || undefined,
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
          attributionKey: effectiveAttributionStoreCode,
          subtotal: checkoutSummary.subtotal,
          discount: checkoutSummary.discount,
          total: checkoutSummary.total,
          buyerPackageKey: checkoutSummary.buyerPackageKey || settlementProfile.buyerPackageKey,
          settlementPackageKey: checkoutSummary.earningsPackageKey || settlementProfile.earningsPackageKey,
          invoiceBv: checkoutSummary.invoiceBv,
          buyerBv: checkoutSummary.buyerBv,
          ownerBv: checkoutSummary.ownerBv,
          retailCommission: checkoutSummary.retailCommission,
          bp: checkoutSummary.bp,
          discountPercent,
          isPreferredBuyer: settlementProfile.isPreferredBuyer,
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

  const products = await readStoreProductsStore({ includeArchived: false });
  const matchedBuyer = resolveCheckoutBuyerIdentity(users, payload);
  const buyerPackageKey = resolveCheckoutBuyerPackageKey({
    users,
    payload,
    checkoutMode,
    matchedBuyer,
  });
  const implicitAttributionOwner = attributionResolution.attributionOwner
    ? null
    : resolveImplicitAttributionOwnerFromBuyer({
        users,
        matchedBuyer,
        checkoutMode,
        buyerPackageKey,
      });
  const effectiveAttributionOwner = attributionResolution.attributionOwner || implicitAttributionOwner;
  const effectiveAttributionStoreCode = attributionStoreCode
    || resolveAttributionStoreCodeFromOwner(effectiveAttributionOwner);
  const memberStoreCodeForMetadata = (
    attributionResolution.hasLinkAttribution
    || Boolean(implicitAttributionOwner)
  )
    ? effectiveAttributionStoreCode
    : '';
  const settlementProfile = resolveCheckoutSettlementProfile({
    checkoutMode,
    buyerPackageKey,
    attributionOwner: effectiveAttributionOwner,
    hasKnownBuyerIdentity: Boolean(matchedBuyer),
  });
  const discountPercent = resolveDiscountPercentForCheckoutMode(payload.discountPercent, checkoutMode, {
    isPreferredBuyer: settlementProfile.isPreferredBuyer,
  });
  const discountRate = discountPercent / 100;

  const checkoutSummary = buildCheckoutLineItems(cartLines, products, discountRate, {
    buyerPackageKey: settlementProfile.buyerPackageKey,
    earningsPackageKey: settlementProfile.earningsPackageKey,
    applyBuyerBvCredit: settlementProfile.applyBuyerBvCredit,
    applyOwnerBvCredit: settlementProfile.applyOwnerBvCredit,
    includeRetailCommission: settlementProfile.includeRetailCommission,
  });
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
  const persistBuyerIdentityForMetadata = shouldPersistBuyerIdentityForCheckout({
    checkoutMode,
    source: payload.source,
  });
  const accountUpgradeTargetPackage = normalizeStorePackageKey(
    payload.accountUpgradeTargetPackage || payload.account_upgrade_target_package,
  );
  const isAccountUpgradeCheckout = Boolean(accountUpgradeTargetPackage);
  const accountUpgradeSelectedProductKey = normalizeCheckoutUpgradeProductKey(
    payload.accountUpgradeSelectedProductKey
    || payload.account_upgrade_selected_product_key
    || payload.accountUpgradeProductKey
    || payload.account_upgrade_product_key
    || payload.upgradeProductKey
    || payload.upgrade_product_key
    || '',
  );
  const accountUpgradeProductMode = normalizeCheckoutUpgradeProductMode(
    payload.accountUpgradeProductMode
    || payload.account_upgrade_product_mode
    || payload.accountUpgradeSplitMode
    || payload.account_upgrade_split_mode
    || payload.accountUpgradeMode
    || payload.account_upgrade_mode
    || '',
    accountUpgradeSelectedProductKey,
  );
  const checkoutClientTag = resolveCheckoutClientTagFromPayload(payload);

  const checkoutMetadata = {
    checkout_type: 'storefront',
    payment_flow: 'hosted-session',
    invoice_id: sanitizeStripeMetadataValue(invoiceId),
    attribution_key: sanitizeStripeMetadataValue(effectiveAttributionStoreCode),
    member_store_code: sanitizeStripeMetadataValue(memberStoreCodeForMetadata),
    member_store_link: sanitizeStripeMetadataValue(memberStoreLink),
    buyer_name: sanitizeStripeMetadataValue(buyerName),
    buyer_email: sanitizeStripeMetadataValue(buyerEmail),
    shipping_address: sanitizeStripeMetadataValue(shippingAddress),
    shipping_mode: sanitizeStripeMetadataValue(shippingMode),
    buyer_user_id: sanitizeStripeMetadataValue(
      persistBuyerIdentityForMetadata ? payload.buyerUserId : '',
    ),
    buyer_username: sanitizeStripeMetadataValue(
      persistBuyerIdentityForMetadata ? payload.buyerUsername : '',
    ),
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
    buyer_package_key: sanitizeStripeMetadataValue(checkoutSummary.buyerPackageKey || settlementProfile.buyerPackageKey),
    settlement_package_key: sanitizeStripeMetadataValue(checkoutSummary.earningsPackageKey || settlementProfile.earningsPackageKey),
    invoice_bv: String(Math.max(0, toWholeNumber(checkoutSummary.invoiceBv, 0))),
    buyer_bv: String(Math.max(0, toWholeNumber(checkoutSummary.buyerBv, 0))),
    owner_bv: String(Math.max(0, toWholeNumber(checkoutSummary.ownerBv, 0))),
    retail_commission: String(roundCurrency(checkoutSummary.retailCommission)),
    bp: String(Math.max(0, toWholeNumber(checkoutSummary.bp, 0))),
    subtotal: String(checkoutSummary.subtotal),
    discount_amount: String(checkoutSummary.discount),
    discount_percent: String(discountPercent),
    invoice_status: sanitizeStripeMetadataValue(invoiceStatus),
    fallback_attribution_used: implicitAttributionOwner && !attributionResolution.hasLinkAttribution ? 'true' : 'false',
    account_upgrade_enabled: isAccountUpgradeCheckout ? 'true' : 'false',
    account_upgrade_target_package: sanitizeStripeMetadataValue(accountUpgradeTargetPackage),
    account_upgrade_selected_product_key: sanitizeStripeMetadataValue(accountUpgradeSelectedProductKey),
    account_upgrade_product_mode: sanitizeStripeMetadataValue(accountUpgradeProductMode),
    checkout_client: sanitizeStripeMetadataValue(checkoutClientTag),
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
    buyer_package_key: checkoutMetadata.buyer_package_key,
    settlement_package_key: checkoutMetadata.settlement_package_key,
    invoice_bv: checkoutMetadata.invoice_bv,
    buyer_bv: checkoutMetadata.buyer_bv,
    owner_bv: checkoutMetadata.owner_bv,
    retail_commission: checkoutMetadata.retail_commission,
    bp: checkoutMetadata.bp,
    account_upgrade_enabled: checkoutMetadata.account_upgrade_enabled,
    account_upgrade_target_package: checkoutMetadata.account_upgrade_target_package,
    account_upgrade_selected_product_key: checkoutMetadata.account_upgrade_selected_product_key,
    account_upgrade_product_mode: checkoutMetadata.account_upgrade_product_mode,
    checkout_client: checkoutMetadata.checkout_client,
    source: checkoutMetadata.source,
  };
  let stripeCustomerId = '';
  try {
    const customerResolution = await resolveOrCreateStripeCustomerForUserIdentity({
      userId: persistBuyerIdentityForMetadata ? normalizeText(payload.buyerUserId) : '',
      username: persistBuyerIdentityForMetadata ? normalizeText(payload.buyerUsername) : '',
      email: buyerEmail,
      name: buyerName,
    }, {
      stripe,
      allowCreate: checkoutMode !== CHECKOUT_MODE_GUEST || persistBuyerIdentityForMetadata,
      metadata: {
        checkout_type: 'storefront',
      },
    });
    stripeCustomerId = normalizeText(customerResolution?.customerId);
  } catch {
    stripeCustomerId = '';
  }

  if (stripeCustomerId) {
    checkoutMetadata.stripe_customer_id = sanitizeStripeMetadataValue(stripeCustomerId);
    paymentIntentMetadata.stripe_customer_id = sanitizeStripeMetadataValue(stripeCustomerId);
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: returnUrls.successUrl,
      cancel_url: returnUrls.cancelUrl,
      automatic_tax: {
        enabled: true,
      },
      line_items: checkoutSummary.lineItems,
      customer: stripeCustomerId || undefined,
      customer_email: stripeCustomerId ? undefined : (buyerEmail || undefined),
      customer_creation: stripeCustomerId ? undefined : 'always',
      customer_update: stripeCustomerId
        ? {
          address: 'auto',
          shipping: 'auto',
          name: 'auto',
        }
        : undefined,
      invoice_creation: {
        enabled: true,
        invoice_data: {
          metadata: {
            invoice_id: checkoutMetadata.invoice_id,
            checkout_type: checkoutMetadata.checkout_type,
            source: checkoutMetadata.source,
          },
        },
      },
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'],
      },
      metadata: checkoutMetadata,
      payment_intent_data: {
        receipt_email: buyerEmail || undefined,
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
          attributionKey: effectiveAttributionStoreCode,
          subtotal: checkoutSummary.subtotal,
          discount: checkoutSummary.discount,
          total: checkoutSummary.total,
          buyerPackageKey: checkoutSummary.buyerPackageKey || settlementProfile.buyerPackageKey,
          settlementPackageKey: checkoutSummary.earningsPackageKey || settlementProfile.earningsPackageKey,
          invoiceBv: checkoutSummary.invoiceBv,
          buyerBv: checkoutSummary.buyerBv,
          ownerBv: checkoutSummary.ownerBv,
          retailCommission: checkoutSummary.retailCommission,
          bp: checkoutSummary.bp,
          discountPercent,
          isPreferredBuyer: settlementProfile.isPreferredBuyer,
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
  const stripeInvoice = await resolveStripeInvoiceForCheckoutSession(stripe, session);
  const stripeReference = resolveStripeReferenceData({
    customerId: resolveStripeCustomerId(session?.customer),
    checkoutSessionId: session?.id || sessionId,
    paymentIntentId: resolveStripeCustomerId(session?.payment_intent),
    paymentStatus: session?.payment_status || '',
    invoice: stripeInvoice,
  });

  return finalizeSuccessfulStoreCheckout({
    amount: (Number(session?.amount_total) || 0) / 100,
    metadata,
    buyerName: normalizeText(sessionCustomerDetails.name || metadata.buyer_name || 'Store Buyer'),
    buyerEmail: normalizeText(sessionCustomerDetails.email || metadata.buyer_email),
    paymentReference: {
      paymentStatus: session?.payment_status || '',
      checkoutSession: {
        id: session?.id || sessionId,
        paymentStatus: session?.payment_status || '',
        status: session?.status || '',
      },
    },
    stripeReference,
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
  const stripeReference = resolveStripeReferenceData({
    customerId: resolveStripeCustomerId(paymentIntent?.customer),
    paymentIntentId: paymentIntent?.id || paymentIntentId,
    paymentStatus: paymentIntent?.status || '',
    invoice: paymentIntent?.latest_charge?.invoice || null,
  });

  return finalizeSuccessfulStoreCheckout({
    amount: (Number(paymentIntent?.amount_received) || Number(paymentIntent?.amount) || 0) / 100,
    metadata,
    buyerName: normalizeText(metadata.buyer_name || 'Store Buyer'),
    buyerEmail: normalizeText(paymentIntent?.receipt_email || metadata.buyer_email),
    paymentReference: {
      paymentStatus: paymentIntent?.status || '',
      paymentIntent: {
        id: paymentIntent?.id || paymentIntentId,
        status: paymentIntent?.status || '',
      },
    },
    stripeReference,
  });
}
