import { randomInt } from 'crypto';
import dotenv from 'dotenv';
import { readMockUsersStore, writeMockUsersStore } from '../stores/user.store.js';
import { readRegisteredMembersStore } from '../stores/member.store.js';

dotenv.config();

const DEFAULT_ATTRIBUTION_STORE_CODE = 'REGISTRATION_LOCKED';
const STORE_LINK_CODE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const DEFAULT_STORE_LINK_CODE_LENGTH = 10;
const MIN_STORE_LINK_CODE_LENGTH = 6;
const MAX_STORE_LINK_CODE_LENGTH = 24;

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeCredential(value) {
  return normalizeText(value).toLowerCase();
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

function resolveScriptOptions(args = []) {
  const normalizedArgs = Array.isArray(args)
    ? args.map((value) => normalizeText(value).toLowerCase()).filter(Boolean)
    : [];
  const codeLengthArg = normalizedArgs.find((value) => (
    value.startsWith('--code-length=')
    || value.startsWith('--length=')
  ));
  const parsedCodeLength = codeLengthArg
    ? Number.parseInt(codeLengthArg.split('=')[1] || '', 10)
    : Number.NaN;

  return {
    refreshAllStoreCodes: normalizedArgs.includes('--refresh-all'),
    dryRun: normalizedArgs.includes('--dry-run'),
    codeLength: Number.isFinite(parsedCodeLength)
      ? parsedCodeLength
      : undefined,
  };
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

function createUniqueStoreCode(existingCodes, options = {}) {
  const safeExistingCodes = existingCodes instanceof Set ? existingCodes : new Set();
  const resolvedLength = clampStoreLinkCodeLength(
    options?.codeLength ?? process.env.STORE_LINK_CODE_LENGTH,
    DEFAULT_STORE_LINK_CODE_LENGTH,
  );

  for (let index = 0; index < 1000; index += 1) {
    const candidateCode = createRandomStoreLinkCode(resolvedLength);
    if (!safeExistingCodes.has(candidateCode)) {
      safeExistingCodes.add(candidateCode);
      return candidateCode;
    }
  }

  for (let attempt = 0; attempt < 500; attempt += 1) {
    const fallbackCode = createRandomStoreLinkCode(resolvedLength);
    if (!safeExistingCodes.has(fallbackCode)) {
      safeExistingCodes.add(fallbackCode);
      return fallbackCode;
    }
  }

  const guaranteedFallback = createRandomStoreLinkCode(resolvedLength);
  safeExistingCodes.add(guaranteedFallback);
  return guaranteedFallback;
}

function createMemberLookupMaps(members) {
  const byUserId = new Map();
  const byUsername = new Map();
  const byEmail = new Map();

  (Array.isArray(members) ? members : []).forEach((member) => {
    const userIdKey = normalizeText(member?.userId);
    if (userIdKey) {
      byUserId.set(userIdKey, member);
    }

    const usernameKey = normalizeCredential(member?.memberUsername);
    if (usernameKey) {
      byUsername.set(usernameKey, member);
    }

    const emailKey = normalizeCredential(member?.email);
    if (emailKey) {
      byEmail.set(emailKey, member);
    }
  });

  return { byUserId, byUsername, byEmail };
}

function resolveMemberForUser(user, memberLookup) {
  const userIdKey = normalizeText(user?.id);
  if (userIdKey && memberLookup.byUserId.has(userIdKey)) {
    return memberLookup.byUserId.get(userIdKey);
  }

  const usernameKey = normalizeCredential(user?.username);
  if (usernameKey && memberLookup.byUsername.has(usernameKey)) {
    return memberLookup.byUsername.get(usernameKey);
  }

  const emailKey = normalizeCredential(user?.email);
  if (emailKey && memberLookup.byEmail.has(emailKey)) {
    return memberLookup.byEmail.get(emailKey);
  }

  return null;
}

function resolveSponsorAttributionCode(user, memberLookup, usersByUsername) {
  const memberRecord = resolveMemberForUser(user, memberLookup);
  const sponsorUsername = normalizeCredential(memberRecord?.sponsorUsername);
  if (!sponsorUsername) {
    return DEFAULT_ATTRIBUTION_STORE_CODE;
  }

  const sponsorUser = usersByUsername.get(sponsorUsername);
  if (!sponsorUser) {
    return DEFAULT_ATTRIBUTION_STORE_CODE;
  }

  return normalizeStoreCode(
    sponsorUser?.storeCode
    || sponsorUser?.publicStoreCode
    || sponsorUser?.attributionStoreCode,
  ) || DEFAULT_ATTRIBUTION_STORE_CODE;
}

function describeChangedUser(previousUser, nextUser) {
  return {
    id: nextUser?.id || '',
    username: nextUser?.username || '',
    email: nextUser?.email || '',
    before: {
      storeCode: normalizeStoreCode(previousUser?.storeCode),
      publicStoreCode: normalizeStoreCode(previousUser?.publicStoreCode),
      attributionStoreCode: normalizeStoreCode(previousUser?.attributionStoreCode),
    },
    after: {
      storeCode: normalizeStoreCode(nextUser?.storeCode),
      publicStoreCode: normalizeStoreCode(nextUser?.publicStoreCode),
      attributionStoreCode: normalizeStoreCode(nextUser?.attributionStoreCode),
    },
  };
}

function userStoreFieldsChanged(previousUser, nextUser) {
  return normalizeStoreCode(previousUser?.storeCode) !== normalizeStoreCode(nextUser?.storeCode)
    || normalizeStoreCode(previousUser?.publicStoreCode) !== normalizeStoreCode(nextUser?.publicStoreCode)
    || normalizeStoreCode(previousUser?.attributionStoreCode) !== normalizeStoreCode(nextUser?.attributionStoreCode);
}

async function run() {
  const scriptOptions = resolveScriptOptions(process.argv.slice(2));
  const users = await readMockUsersStore();
  const members = await readRegisteredMembersStore();

  if (!Array.isArray(users) || users.length === 0) {
    console.log(JSON.stringify({
      totalUsers: 0,
      updatedUsers: 0,
      message: 'No users found. Nothing to backfill.',
      options: scriptOptions,
    }, null, 2));
    return;
  }

  const existingCodes = collectExistingStoreCodes(users);
  let assignedStoreCodeCount = 0;
  let assignedPublicStoreCodeCount = 0;

  const usersWithStoreCodes = users.map((user) => {
    const currentStoreCode = normalizeStoreCode(user?.storeCode);
    const currentPublicStoreCode = normalizeStoreCode(user?.publicStoreCode);

    const shouldRefreshStoreCode = scriptOptions.refreshAllStoreCodes || !currentStoreCode;
    const shouldRefreshPublicStoreCode = scriptOptions.refreshAllStoreCodes || !currentPublicStoreCode;

    const nextStoreCode = shouldRefreshStoreCode
      ? (() => {
        assignedStoreCodeCount += 1;
        return createUniqueStoreCode(existingCodes, {
          codeLength: scriptOptions.codeLength,
        });
      })()
      : currentStoreCode;

    const nextPublicStoreCode = shouldRefreshPublicStoreCode
      ? (() => {
        assignedPublicStoreCodeCount += 1;
        return createUniqueStoreCode(existingCodes, {
          codeLength: scriptOptions.codeLength,
        });
      })()
      : currentPublicStoreCode;

    return {
      ...user,
      storeCode: nextStoreCode,
      publicStoreCode: nextPublicStoreCode,
    };
  });

  const usersByUsername = new Map();
  usersWithStoreCodes.forEach((user) => {
    const usernameKey = normalizeCredential(user?.username);
    if (usernameKey) {
      usersByUsername.set(usernameKey, user);
    }
  });

  const memberLookup = createMemberLookupMaps(members);
  let assignedAttributionStoreCodeCount = 0;

  const usersWithAttribution = usersWithStoreCodes.map((user) => {
    const currentAttributionCode = normalizeStoreCode(user?.attributionStoreCode);
    const shouldRefreshAttributionCode = scriptOptions.refreshAllStoreCodes || !currentAttributionCode;
    if (!shouldRefreshAttributionCode) {
      return {
        ...user,
        attributionStoreCode: currentAttributionCode,
      };
    }

    assignedAttributionStoreCodeCount += 1;
    const attributionStoreCode = resolveSponsorAttributionCode(user, memberLookup, usersByUsername);
    return {
      ...user,
      attributionStoreCode,
    };
  });

  const changedUsers = [];
  usersWithAttribution.forEach((user, index) => {
    if (userStoreFieldsChanged(users[index], user)) {
      changedUsers.push(describeChangedUser(users[index], user));
    }
  });

  if (changedUsers.length === 0) {
    console.log(JSON.stringify({
      totalUsers: users.length,
      updatedUsers: 0,
      assignedStoreCodeCount: 0,
      assignedPublicStoreCodeCount: 0,
      assignedAttributionStoreCodeCount: 0,
      message: 'All users already had valid store-link fields for current script options.',
      options: scriptOptions,
    }, null, 2));
    return;
  }

  if (scriptOptions.dryRun) {
    console.log(JSON.stringify({
      totalUsers: users.length,
      updatedUsers: changedUsers.length,
      assignedStoreCodeCount,
      assignedPublicStoreCodeCount,
      assignedAttributionStoreCodeCount,
      dryRun: true,
      options: scriptOptions,
      sampleUpdatedUsers: changedUsers.slice(0, 10),
    }, null, 2));
    return;
  }

  await writeMockUsersStore(usersWithAttribution);

  console.log(JSON.stringify({
    totalUsers: users.length,
    updatedUsers: changedUsers.length,
    assignedStoreCodeCount,
    assignedPublicStoreCodeCount,
    assignedAttributionStoreCodeCount,
    dryRun: false,
    options: scriptOptions,
    sampleUpdatedUsers: changedUsers.slice(0, 10),
  }, null, 2));
}

run().catch((error) => {
  console.error('Failed to backfill user store-link fields:', error?.stack || error?.message || error);
  process.exitCode = 1;
});
