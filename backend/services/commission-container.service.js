import { findUserById, findUserByIdentifier } from '../stores/user.store.js';
import {
  readCommissionContainerByUserId,
  readCommissionContainerByIdentity,
  upsertCommissionContainerByUserId,
  buildDefaultCommissionContainerSnapshot,
  sanitizeCommissionContainerBalances,
  sanitizeCommissionContainerClaimMaps,
  ensureCommissionContainerTables,
} from '../stores/commission-container.store.js';

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeCredential(value) {
  return normalizeText(value).toLowerCase();
}

function normalizeCommissionContainerBalancesPayload(balanceInput = {}) {
  const source = balanceInput && typeof balanceInput === 'object'
    ? balanceInput
    : {};

  return {
    fasttrack: source.fasttrack ?? source.fastTrack,
    infinitybuilder: source.infinitybuilder ?? source.infinityBuilder,
    legacyleadership: source.legacyleadership ?? source.legacyLeadership,
    salesteam: source.salesteam ?? source.salesTeam,
  };
}

function normalizeCommissionContainerClaimMapsPayload(claimMapsInput = {}) {
  const source = claimMapsInput && typeof claimMapsInput === 'object'
    ? claimMapsInput
    : {};

  return {
    infinitybuilder: source.infinitybuilder ?? source.infinityBuilder ?? {},
    legacyleadership: source.legacyleadership ?? source.legacyLeadership ?? {},
  };
}

function hasOwn(source, key) {
  return Boolean(source && typeof source === 'object' && Object.prototype.hasOwnProperty.call(source, key));
}

function resolveRequestedIdentityPayload(payload = {}) {
  return {
    userId: normalizeText(payload?.userId),
    username: normalizeText(payload?.username),
    email: normalizeText(payload?.email),
  };
}

function buildFallbackContainerUserId(identityPayload = {}) {
  const explicitUserId = normalizeText(identityPayload?.userId);
  if (explicitUserId) {
    return explicitUserId;
  }

  const usernameKey = normalizeCredential(identityPayload?.username);
  if (usernameKey) {
    return `identity_username_${usernameKey.replace(/[^a-z0-9._-]/g, '_')}`;
  }

  const emailKey = normalizeCredential(identityPayload?.email);
  if (emailKey) {
    return `identity_email_${emailKey.replace(/[^a-z0-9._-]/g, '_')}`;
  }

  return '';
}

async function resolveMemberUserFromIdentity(identityPayload = {}) {
  const userId = normalizeText(identityPayload?.userId);
  if (userId) {
    const byId = await findUserById(userId);
    if (byId) {
      return byId;
    }
  }

  const username = normalizeText(identityPayload?.username);
  if (username) {
    const byUsername = await findUserByIdentifier(username);
    if (byUsername) {
      return byUsername;
    }
  }

  const email = normalizeText(identityPayload?.email);
  if (email) {
    const byEmail = await findUserByIdentifier(email);
    if (byEmail) {
      return byEmail;
    }
  }

  return null;
}

export async function getCommissionContainers(query = {}) {
  await ensureCommissionContainerTables();

  const requestedIdentity = resolveRequestedIdentityPayload(query);
  if (!requestedIdentity.userId && !requestedIdentity.username && !requestedIdentity.email) {
    return {
      success: false,
      status: 400,
      error: 'A userId, username, or email is required to load commission containers.',
    };
  }

  const memberUser = await resolveMemberUserFromIdentity(query);
  const canonicalIdentity = memberUser
    ? {
      userId: normalizeText(memberUser.id),
      username: normalizeText(memberUser.username),
      email: normalizeText(memberUser.email),
    }
    : {
      ...requestedIdentity,
      userId: buildFallbackContainerUserId(requestedIdentity),
    };
  const snapshot = canonicalIdentity.userId
    ? await readCommissionContainerByUserId(canonicalIdentity.userId)
    : await readCommissionContainerByIdentity(canonicalIdentity);

  return {
    success: true,
    status: 200,
    data: {
      success: true,
      snapshot: snapshot || buildDefaultCommissionContainerSnapshot(canonicalIdentity),
    },
  };
}

export async function saveCommissionContainers(payload = {}) {
  await ensureCommissionContainerTables();

  const requestedIdentity = resolveRequestedIdentityPayload(payload);
  if (!requestedIdentity.userId && !requestedIdentity.username && !requestedIdentity.email) {
    return {
      success: false,
      status: 400,
      error: 'A userId, username, or email is required to save commission containers.',
    };
  }

  const memberUser = await resolveMemberUserFromIdentity(payload);
  const canonicalIdentity = memberUser
    ? {
      userId: normalizeText(memberUser.id),
      username: normalizeText(memberUser.username),
      email: normalizeText(memberUser.email),
    }
    : {
      ...requestedIdentity,
      userId: buildFallbackContainerUserId(requestedIdentity),
    };

  const existingSnapshot = await readCommissionContainerByIdentity(canonicalIdentity)
    || buildDefaultCommissionContainerSnapshot(canonicalIdentity);
  const rawBalancesPayload = payload?.balances && typeof payload.balances === 'object'
    ? payload.balances
    : null;
  const normalizedBalancesPayload = normalizeCommissionContainerBalancesPayload(rawBalancesPayload);
  const normalizedClaimMapsPayload = normalizeCommissionContainerClaimMapsPayload(
    payload?.claimMaps && typeof payload.claimMaps === 'object' ? payload.claimMaps : null,
  );

  const hasBalancePatch = rawBalancesPayload !== null;
  const hasClaimMapPatch = Boolean(
    payload?.claimMaps
    && typeof payload.claimMaps === 'object'
    && (
      hasOwn(payload.claimMaps, 'infinitybuilder')
      || hasOwn(payload.claimMaps, 'infinityBuilder')
      || hasOwn(payload.claimMaps, 'legacyleadership')
      || hasOwn(payload.claimMaps, 'legacyLeadership')
    )
  );
  const nextBalances = hasBalancePatch
    ? sanitizeCommissionContainerBalances({
      ...(existingSnapshot?.balances || {}),
      ...normalizedBalancesPayload,
    })
    : sanitizeCommissionContainerBalances(existingSnapshot?.balances);
  const nextClaimMaps = hasClaimMapPatch
    ? sanitizeCommissionContainerClaimMaps({
      ...(existingSnapshot?.claimMaps || {}),
      ...normalizedClaimMapsPayload,
    })
    : sanitizeCommissionContainerClaimMaps(existingSnapshot?.claimMaps);
  const nextCurrencyCode = normalizeText(
    payload?.currencyCode
    || existingSnapshot?.currencyCode
    || 'USD',
  ).toUpperCase() || 'USD';

  const snapshot = await upsertCommissionContainerByUserId({
    userId: normalizeText(canonicalIdentity.userId),
    username: normalizeText(canonicalIdentity.username),
    email: normalizeText(canonicalIdentity.email),
    currencyCode: nextCurrencyCode,
    balances: nextBalances,
    claimMaps: nextClaimMaps,
  });

  return {
    success: true,
    status: 200,
    data: {
      success: true,
      snapshot: snapshot || buildDefaultCommissionContainerSnapshot(canonicalIdentity),
    },
  };
}

export async function updateCommissionContainerBalances(payload = {}) {
  const snapshotPayload = {
    ...payload,
    balances: normalizeCommissionContainerBalancesPayload(payload?.balances),
  };
  return saveCommissionContainers(snapshotPayload);
}

export function resolveCommissionContainerIdentityKey(identityPayload = {}) {
  const userId = normalizeCredential(identityPayload?.userId);
  if (userId) {
    return userId;
  }

  const username = normalizeCredential(identityPayload?.username);
  if (username) {
    return username;
  }

  return normalizeCredential(identityPayload?.email);
}
