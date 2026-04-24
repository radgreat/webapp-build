import { randomUUID, randomInt } from 'crypto';
import { resolveMemberActivityStateByPersonalBv } from './member-activity.helpers.js';

export const PASSWORD_MIN_LENGTH = 8;
export const FREE_ACCOUNT_PACKAGE_KEY = 'preferred-customer-pack';
const PASSWORD_SETUP_TOKEN_TTL_MS = 48 * 60 * 60 * 1000;
const FREE_ACCOUNT_RANK_KEY_SET = new Set(['preferred customer', 'free account', 'free']);

export function normalizeText(value) {
  return String(value || '').trim();
}

export function normalizeCredential(value) {
  return normalizeText(value).toLowerCase();
}

export function normalizeMemberKey(value) {
  return normalizeText(value).toLowerCase();
}

export function normalizeCountryFlag(value) {
  const rawValue = normalizeText(value);
  return rawValue || 'un';
}

export function isPasswordStrong(password) {
  const value = String(password || '');

  if (value.length < PASSWORD_MIN_LENGTH) {
    return false;
  }

  const hasLower = /[a-z]/.test(value);
  const hasUpper = /[A-Z]/.test(value);
  const hasNumber = /[0-9]/.test(value);
  const hasSpecial = /[^A-Za-z0-9]/.test(value);

  return hasLower && hasUpper && hasNumber && hasSpecial;
}

export function isSetupTokenExpired(record) {
  const expiryMs = Date.parse(String(record?.expiresAt || ''));
  if (!Number.isFinite(expiryMs)) {
    return true;
  }

  return expiryMs <= Date.now();
}

export function resolveSetupToken(tokens, rawToken) {
  const token = normalizeText(rawToken);

  if (!token) {
    return { status: 400, error: 'Missing setup token.' };
  }

  const record = (Array.isArray(tokens) ? tokens : []).find(
    (entry) => String(entry?.token || '') === token
  );

  if (!record) {
    return { status: 404, error: 'Invalid or unknown setup link.' };
  }

  if (record.usedAt) {
    return { status: 409, error: 'This setup link has already been used.' };
  }

  if (isSetupTokenExpired(record)) {
    return { status: 410, error: 'This setup link has expired. Request a new one.' };
  }

  return { status: 200, record };
}

export function sanitizeUserForAuthResponse(user) {
  const activityState = resolveMemberActivityStateByPersonalBv(user);
  return {
    id: user?.id || null,
    name: user?.name || user?.username || 'User',
    username: user?.username || '',
    email: user?.email || '',
    countryFlag: user?.countryFlag || '',
    accountStatus: activityState.accountStatus,
    isActive: activityState.isActive,
    attributionStoreCode: typeof user?.attributionStoreCode === 'string' ? user.attributionStoreCode : '',
    publicStoreCode: typeof user?.publicStoreCode === 'string' ? user.publicStoreCode : '',
    storeCode: typeof user?.storeCode === 'string' ? user.storeCode : '',
    enrollmentPackage: user?.enrollmentPackage || '',
    enrollmentPackageLabel: user?.enrollmentPackageLabel || '',
    enrollmentPackagePrice: Number.isFinite(Number(user?.enrollmentPackagePrice))
      ? Number(user.enrollmentPackagePrice)
      : 0,
    enrollmentPackageBv: Number.isFinite(Number(user?.enrollmentPackageBv))
      ? Number(user.enrollmentPackageBv)
      : 0,
    starterPersonalPv: Number.isFinite(Number(user?.starterPersonalPv))
      ? Number(user.starterPersonalPv)
      : 0,
    currentPersonalPvBv: activityState.currentPersonalPvBv,
    monthlyPersonalBv: activityState.currentPersonalPvBv,
    starterTotalCycles: Number.isFinite(Number(user?.starterTotalCycles))
      ? Number(user.starterTotalCycles)
      : 0,
    createdAt: typeof user?.createdAt === 'string' ? user.createdAt : '',
    rank: typeof user?.rank === 'string' ? user.rank : '',
    accountRank: typeof user?.accountRank === 'string' ? user.accountRank : '',
    activityActiveUntilAt: activityState.activeUntilAt,
    lastProductPurchaseAt: typeof user?.lastProductPurchaseAt === 'string'
      ? user.lastProductPurchaseAt
      : '',
    lastPurchaseAt: typeof user?.lastPurchaseAt === 'string'
      ? user.lastPurchaseAt
      : '',
  };
}

function normalizeSetupAudience(value) {
  return normalizeCredential(value) === 'free' ? 'free' : 'member';
}

export function resolveAuthAccountAudience(user = {}) {
  const normalizedPackageKey = normalizeMemberKey(user?.enrollmentPackage);
  if (normalizedPackageKey === FREE_ACCOUNT_PACKAGE_KEY) {
    return 'free';
  }

  const normalizedRank = normalizeMemberKey(user?.accountRank || user?.rank);
  if (FREE_ACCOUNT_RANK_KEY_SET.has(normalizedRank)) {
    return 'free';
  }

  return 'member';
}

export function normalizeUsernameCandidate(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '');
}

export function createUniqueUsername(users, requestedUsername, email) {
  const baseCandidate = normalizeUsernameCandidate(requestedUsername)
    || normalizeUsernameCandidate(String(email || '').split('@')[0])
    || `member${randomInt(1000, 10000)}`;

  const safeBase = baseCandidate.slice(0, 24) || `member${randomInt(1000, 10000)}`;
  const existing = new Set(
    (Array.isArray(users) ? users : []).map((user) => normalizeUsernameCandidate(user?.username)),
  );

  let candidate = safeBase;
  let suffix = 2;

  while (existing.has(candidate)) {
    candidate = `${safeBase}${suffix}`;
    suffix += 1;
  }

  return candidate;
}

export function generateRandomPassword(length = 12) {
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const numbers = '23456789';
  const symbols = '!@#$%^&*()-_=+';
  const all = `${lower}${upper}${numbers}${symbols}`;

  const pick = (pool) => pool[randomInt(0, pool.length)];
  const chars = [
    pick(lower),
    pick(upper),
    pick(numbers),
    pick(symbols),
  ];

  while (chars.length < Math.max(PASSWORD_MIN_LENGTH, length)) {
    chars.push(pick(all));
  }

  for (let index = chars.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(0, index + 1);
    const temp = chars[index];
    chars[index] = chars[swapIndex];
    chars[swapIndex] = temp;
  }

  return chars.join('');
}

export function issuePasswordSetupToken(userId, email) {
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + PASSWORD_SETUP_TOKEN_TTL_MS);
  const token = `${randomUUID().replace(/-/g, '')}${randomUUID().replace(/-/g, '')}`;

  return {
    id: `pst_${createdAt.getTime()}_${randomUUID().slice(0, 8)}`,
    token,
    userId,
    email: normalizeCredential(email),
    createdAt: createdAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    usedAt: null,
  };
}

export function buildPasswordSetupLink(token, email = '', options = {}) {
  const safeOptions = options && typeof options === 'object' ? options : {};
  const audience = normalizeSetupAudience(safeOptions.audience);
  const setupPath = audience === 'free'
    ? '/store-password-setup.html'
    : '/password-setup.html';
  const setupUrl = new URL(setupPath, 'http://localhost');
  setupUrl.searchParams.set('token', normalizeText(token));

  const normalizedEmail = normalizeCredential(email);
  if (normalizedEmail) {
    setupUrl.searchParams.set('email', normalizedEmail);
  }

  setupUrl.searchParams.set('audience', audience);

  return `${setupUrl.pathname}${setupUrl.search}`;
}
