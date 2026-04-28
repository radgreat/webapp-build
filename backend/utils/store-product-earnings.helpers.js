const FREE_ACCOUNT_PACKAGE_KEY = 'preferred-customer-pack';
const MEMBERSHIP_PLACEMENT_RESERVATION_PACKAGE_KEY = 'membership-placement-reservation';
const PAID_MEMBER_PACKAGE_KEY = 'paid-member-pack';
const PREFERRED_PERSONAL_PACKAGE_KEY = 'personal-builder-pack';
const PREFERRED_BUSINESS_PACKAGE_KEY = 'business-builder-pack';
const PREFERRED_INFINITY_PACKAGE_KEY = 'infinity-builder-pack';
const PREFERRED_LEGACY_PACKAGE_KEY = 'legacy-builder-pack';
const DEFAULT_BUILDER_PACKAGE_KEY = PAID_MEMBER_PACKAGE_KEY;

export const STORE_PRODUCT_PACKAGE_KEYS = Object.freeze([
  PREFERRED_PERSONAL_PACKAGE_KEY,
  PREFERRED_BUSINESS_PACKAGE_KEY,
  PREFERRED_INFINITY_PACKAGE_KEY,
  PREFERRED_LEGACY_PACKAGE_KEY,
  PAID_MEMBER_PACKAGE_KEY,
]);

export const DEFAULT_STORE_PACKAGE_EARNINGS = Object.freeze({
  [PREFERRED_PERSONAL_PACKAGE_KEY]: Object.freeze({ retailCommission: 4, bv: 50 }),
  [PREFERRED_BUSINESS_PACKAGE_KEY]: Object.freeze({ retailCommission: 8, bv: 48 }),
  [PREFERRED_INFINITY_PACKAGE_KEY]: Object.freeze({ retailCommission: 12, bv: 44 }),
  [PREFERRED_LEGACY_PACKAGE_KEY]: Object.freeze({ retailCommission: 20, bv: 38 }),
  [PAID_MEMBER_PACKAGE_KEY]: Object.freeze({ retailCommission: 0, bv: 50 }),
});

const PACKAGE_KEY_ALIASES = Object.freeze({
  [PREFERRED_PERSONAL_PACKAGE_KEY]: Object.freeze([
    PREFERRED_PERSONAL_PACKAGE_KEY,
    'personal_builder_pack',
    'personalBuilderPack',
    'personal',
    'personal-pack',
    FREE_ACCOUNT_PACKAGE_KEY,
    MEMBERSHIP_PLACEMENT_RESERVATION_PACKAGE_KEY,
    'membership_placement_reservation',
    'membershipPlacementReservation',
    'preferred_customer_pack',
    'preferredCustomerPack',
    'preferred-customer',
    'free-account',
    'freeAccount',
    'free',
  ]),
  [PREFERRED_BUSINESS_PACKAGE_KEY]: Object.freeze([
    PREFERRED_BUSINESS_PACKAGE_KEY,
    'business_builder_pack',
    'businessBuilderPack',
    'business',
    'business-pack',
  ]),
  [PREFERRED_INFINITY_PACKAGE_KEY]: Object.freeze([
    PREFERRED_INFINITY_PACKAGE_KEY,
    'infinity_builder_pack',
    'infinityBuilderPack',
    'infinity',
    'achievers-pack',
  ]),
  [PREFERRED_LEGACY_PACKAGE_KEY]: Object.freeze([
    PREFERRED_LEGACY_PACKAGE_KEY,
    'legacy_builder_pack',
    'legacyBuilderPack',
    'legacy',
    'legacy-pack',
  ]),
  [PAID_MEMBER_PACKAGE_KEY]: Object.freeze([
    PAID_MEMBER_PACKAGE_KEY,
    'paid_member_pack',
    'paidMemberPack',
    'paid-member',
    'paid_member',
    'paid-member-account',
    'paid',
    // Backward compatibility: pre-paid-bucket products can still resolve paid BV.
    PREFERRED_PERSONAL_PACKAGE_KEY,
    'personal_builder_pack',
    'personalBuilderPack',
    'personal',
    'personal-pack',
    PREFERRED_BUSINESS_PACKAGE_KEY,
    'business_builder_pack',
    'businessBuilderPack',
    'business',
    'business-pack',
    PREFERRED_INFINITY_PACKAGE_KEY,
    'infinity_builder_pack',
    'infinityBuilderPack',
    'infinity',
    'achievers-pack',
    PREFERRED_LEGACY_PACKAGE_KEY,
    'legacy_builder_pack',
    'legacyBuilderPack',
    'legacy',
    'legacy-pack',
  ]),
});

function normalizeText(value) {
  return String(value || '').trim();
}

function toWholeNumber(value, fallback = 0) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return Math.max(0, Math.floor(Number(fallback) || 0));
  }
  return Math.max(0, Math.floor(numericValue));
}

function roundCurrency(value, fallback = 0) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return Math.round((Math.max(0, Number(fallback) || 0) + Number.EPSILON) * 100) / 100;
  }
  return Math.round((Math.max(0, numericValue) + Number.EPSILON) * 100) / 100;
}

export function normalizeStorePackageKey(value) {
  const normalizedValue = normalizeText(value).toLowerCase().replace(/[_\s]+/g, '-');
  if (!normalizedValue) {
    return '';
  }

  const matchedKey = STORE_PRODUCT_PACKAGE_KEYS.find((packageKey) => {
    const aliases = PACKAGE_KEY_ALIASES[packageKey] || [];
    return aliases.includes(normalizedValue);
  });
  return matchedKey || normalizedValue;
}

function resolveRawPackageEarningEntry(rawPackageEarnings = {}, packageKey = '') {
  if (!rawPackageEarnings || typeof rawPackageEarnings !== 'object') {
    return null;
  }

  const aliases = PACKAGE_KEY_ALIASES[packageKey] || [packageKey];
  for (const alias of aliases) {
    if (Object.prototype.hasOwnProperty.call(rawPackageEarnings, alias)) {
      const candidate = rawPackageEarnings[alias];
      if (candidate && typeof candidate === 'object') {
        return candidate;
      }
    }
  }

  return null;
}

function normalizeStorePackageEarningEntry(rawEntry = {}, fallbackEntry = {}) {
  const source = rawEntry && typeof rawEntry === 'object' ? rawEntry : {};
  const fallback = fallbackEntry && typeof fallbackEntry === 'object' ? fallbackEntry : {};

  const retailCommission = roundCurrency(
    source.retailCommission
      ?? source.retail
      ?? source.commission
      ?? source.usd
      ?? source.amount,
    fallback.retailCommission,
  );

  const bv = toWholeNumber(
    source.bv
      ?? source.bp
      ?? source.personalBv,
    fallback.bv,
  );

  return {
    retailCommission,
    bv,
  };
}

export function normalizeStoreProductPackageEarnings(rawPackageEarnings = {}, options = {}) {
  const fallbackMode = normalizeText(options?.fallbackMode).toLowerCase();
  const fallbackBp = toWholeNumber(options?.fallbackBp ?? options?.fallbackBv, 0);
  const normalized = {};

  STORE_PRODUCT_PACKAGE_KEYS.forEach((packageKey) => {
    const defaultEntry = DEFAULT_STORE_PACKAGE_EARNINGS[packageKey]
      || { retailCommission: 0, bv: 0 };

    const fallbackEntry = (fallbackMode === 'legacy-bp' && packageKey === PAID_MEMBER_PACKAGE_KEY)
      ? { retailCommission: defaultEntry.retailCommission, bv: fallbackBp }
      : defaultEntry;

    const rawEntry = resolveRawPackageEarningEntry(rawPackageEarnings, packageKey);
    normalized[packageKey] = normalizeStorePackageEarningEntry(rawEntry, fallbackEntry);
  });

  return normalized;
}

export function resolveStorePackageEarning(source = {}, packageKey = '', options = {}) {
  const sourceObject = source && typeof source === 'object' ? source : {};
  const rawPackageEarnings = sourceObject?.packageEarnings && typeof sourceObject.packageEarnings === 'object'
    ? sourceObject.packageEarnings
    : sourceObject;
  const normalizedPackageEarnings = normalizeStoreProductPackageEarnings(rawPackageEarnings, {
    fallbackBp: sourceObject?.bp,
    fallbackMode: options?.fallbackMode,
  });

  const normalizedRequestedPackageKey = normalizeStorePackageKey(packageKey);
  const fallbackPackageKey = normalizeStorePackageKey(options?.fallbackPackageKey) || DEFAULT_BUILDER_PACKAGE_KEY;
  const resolvedPackageKey = STORE_PRODUCT_PACKAGE_KEYS.includes(normalizedRequestedPackageKey)
    ? normalizedRequestedPackageKey
    : fallbackPackageKey;

  return normalizedPackageEarnings[resolvedPackageKey]
    || normalizedPackageEarnings[DEFAULT_BUILDER_PACKAGE_KEY]
    || { retailCommission: 0, bv: 0 };
}

export function resolveStoreProductLegacyBp(source = {}) {
  return toWholeNumber(
    resolveStorePackageEarning(source, PAID_MEMBER_PACKAGE_KEY).bv,
    0,
  );
}
