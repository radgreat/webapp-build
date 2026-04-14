const FREE_ACCOUNT_PACKAGE_KEY = 'preferred-customer-pack';
const DEFAULT_BUILDER_PACKAGE_KEY = 'personal-builder-pack';

export const STORE_PRODUCT_PACKAGE_KEYS = Object.freeze([
  FREE_ACCOUNT_PACKAGE_KEY,
  'personal-builder-pack',
  'business-builder-pack',
  'infinity-builder-pack',
  'legacy-builder-pack',
]);

export const DEFAULT_STORE_PACKAGE_EARNINGS = Object.freeze({
  [FREE_ACCOUNT_PACKAGE_KEY]: Object.freeze({ retailCommission: 4, bv: 50 }),
  'personal-builder-pack': Object.freeze({ retailCommission: 4, bv: 50 }),
  'business-builder-pack': Object.freeze({ retailCommission: 8, bv: 48 }),
  'infinity-builder-pack': Object.freeze({ retailCommission: 12, bv: 44 }),
  'legacy-builder-pack': Object.freeze({ retailCommission: 20, bv: 38 }),
});

const PACKAGE_KEY_ALIASES = Object.freeze({
  [FREE_ACCOUNT_PACKAGE_KEY]: Object.freeze([
    FREE_ACCOUNT_PACKAGE_KEY,
    'preferred_customer_pack',
    'preferredCustomerPack',
    'preferred-customer',
    'free-account',
    'freeAccount',
    'free',
  ]),
  'personal-builder-pack': Object.freeze([
    'personal-builder-pack',
    'personal_builder_pack',
    'personalBuilderPack',
    'personal',
    'personal-pack',
  ]),
  'business-builder-pack': Object.freeze([
    'business-builder-pack',
    'business_builder_pack',
    'businessBuilderPack',
    'business',
    'business-pack',
  ]),
  'infinity-builder-pack': Object.freeze([
    'infinity-builder-pack',
    'infinity_builder_pack',
    'infinityBuilderPack',
    'infinity',
    'achievers-pack',
  ]),
  'legacy-builder-pack': Object.freeze([
    'legacy-builder-pack',
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

    const fallbackEntry = (fallbackMode === 'legacy-bp' && packageKey !== FREE_ACCOUNT_PACKAGE_KEY)
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
    resolveStorePackageEarning(source, 'legacy-builder-pack').bv,
    0,
  );
}
