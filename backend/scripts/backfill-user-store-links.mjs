import { randomInt } from 'crypto';
import dotenv from 'dotenv';
import { readMockUsersStore, writeMockUsersStore } from '../stores/user.store.js';
import { readRegisteredMembersStore } from '../stores/member.store.js';

dotenv.config();

const DEFAULT_ATTRIBUTION_STORE_CODE = 'REGISTRATION_LOCKED';

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
    const candidateCode = `${normalizedPrefix}-${randomSuffix}`;
    if (!safeExistingCodes.has(candidateCode)) {
      safeExistingCodes.add(candidateCode);
      return candidateCode;
    }
  }

  const timestampSuffix = String(Date.now()).slice(-4);
  const fallbackCode = `${normalizedPrefix}-${timestampSuffix}`;
  safeExistingCodes.add(fallbackCode);
  return fallbackCode;
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
  const users = await readMockUsersStore();
  const members = await readRegisteredMembersStore();

  if (!Array.isArray(users) || users.length === 0) {
    console.log(JSON.stringify({
      totalUsers: 0,
      updatedUsers: 0,
      message: 'No users found. Nothing to backfill.',
    }, null, 2));
    return;
  }

  const existingCodes = collectExistingStoreCodes(users);
  let assignedStoreCodeCount = 0;
  let assignedPublicStoreCodeCount = 0;

  const usersWithStoreCodes = users.map((user) => {
    const seed = user?.username || user?.email || user?.id || String(Date.now());
    const currentStoreCode = normalizeStoreCode(user?.storeCode);
    const currentPublicStoreCode = normalizeStoreCode(user?.publicStoreCode);

    const nextStoreCode = currentStoreCode || (() => {
      assignedStoreCodeCount += 1;
      return createUniqueStoreCode(existingCodes, 'M', seed);
    })();

    const nextPublicStoreCode = currentPublicStoreCode || (() => {
      assignedPublicStoreCodeCount += 1;
      return createUniqueStoreCode(existingCodes, 'CHG', seed);
    })();

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
    if (currentAttributionCode) {
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
      message: 'All users already had valid store-link fields.',
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
    sampleUpdatedUsers: changedUsers.slice(0, 10),
  }, null, 2));
}

run().catch((error) => {
  console.error('Failed to backfill user store-link fields:', error?.stack || error?.message || error);
  process.exitCode = 1;
});
