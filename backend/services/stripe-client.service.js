import Stripe from 'stripe';

import {
  findUserStripeProfileByConnectAccountId,
  findUserStripeProfileByCustomerId,
  findUserStripeProfileByEmail,
  findUserStripeProfileById,
  findUserStripeProfileByUsername,
  updateUserStripeConnectProfileById,
  updateUserStripeCustomerIdById,
} from '../stores/user.store.js';

let cachedStripeClient = null;
let cachedStripeApiKey = '';

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeEmail(value) {
  const normalized = normalizeText(value).toLowerCase();
  return normalized.includes('@') ? normalized : '';
}

function resolveSafeMetadataMap(metadata = {}) {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return {};
  }

  const entries = Object.entries(metadata).map(([key, value]) => [
    normalizeText(key),
    normalizeText(value),
  ]).filter(([key, value]) => Boolean(key && value));

  return Object.fromEntries(entries);
}

function resolveStripeCustomerId(value) {
  if (typeof value === 'string') {
    return normalizeText(value);
  }
  if (value && typeof value === 'object') {
    return normalizeText(value.id);
  }
  return '';
}

function resolveStripeConnectAccountId(value) {
  if (typeof value === 'string') {
    return normalizeText(value);
  }
  if (value && typeof value === 'object') {
    return normalizeText(value.id);
  }
  return '';
}

function normalizeStripePayoutMethod(valueInput, fallback = 'standard') {
  const normalized = normalizeText(valueInput).toLowerCase();
  if (normalized === 'instant') {
    return 'instant';
  }
  if (normalized === 'standard') {
    return 'standard';
  }
  return fallback === 'instant' ? 'instant' : 'standard';
}

function resolveReturnUrl(returnUrlInput = '', fallbackOriginInput = '', fallbackPathInput = '/index.html') {
  const fallbackOrigin = normalizeText(fallbackOriginInput)
    || normalizeText(process.env.PUBLIC_APP_ORIGIN)
    || 'http://localhost:3000';
  const fallbackPath = normalizeText(fallbackPathInput) || '/index.html';
  const fallbackUrl = new URL(fallbackPath.startsWith('/') ? fallbackPath : '/index.html', fallbackOrigin);
  const requestedReturnUrl = normalizeText(returnUrlInput);
  if (!requestedReturnUrl) {
    return fallbackUrl.toString();
  }

  try {
    const parsed = new URL(requestedReturnUrl, fallbackOrigin);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return fallbackUrl.toString();
    }
    return parsed.toString();
  } catch {
    return fallbackUrl.toString();
  }
}

async function resolveUserStripeProfile(identity = {}, options = {}) {
  const client = options?.client;
  const userId = normalizeText(identity?.userId);
  const username = normalizeText(identity?.username);
  const email = normalizeEmail(identity?.email);
  const customerId = normalizeText(identity?.customerId);
  const connectAccountId = normalizeText(identity?.connectAccountId);

  if (userId) {
    return findUserStripeProfileById(userId, { client });
  }
  if (username) {
    return findUserStripeProfileByUsername(username, { client });
  }
  if (email) {
    return findUserStripeProfileByEmail(email, { client });
  }
  if (customerId) {
    return findUserStripeProfileByCustomerId(customerId, { client });
  }
  if (connectAccountId) {
    return findUserStripeProfileByConnectAccountId(connectAccountId, { client });
  }

  return null;
}

async function retrieveStripeCustomerSafe(stripe, customerIdInput) {
  const customerId = normalizeText(customerIdInput);
  if (!customerId) {
    return null;
  }

  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (!customer || customer.deleted) {
      return null;
    }
    return customer;
  } catch {
    return null;
  }
}

async function resolveStripeCustomerByEmail(stripe, emailInput = '') {
  const email = normalizeEmail(emailInput);
  if (!email) {
    return null;
  }

  try {
    const result = await stripe.customers.list({
      email,
      limit: 10,
    });
    return (Array.isArray(result?.data) ? result.data : []).find((entry) => (
      entry
      && !entry.deleted
      && normalizeEmail(entry.email) === email
    )) || null;
  } catch {
    return null;
  }
}

function resolveStripeConnectDefaultCountry() {
  const candidate = normalizeText(
    process.env.STRIPE_CONNECT_DEFAULT_COUNTRY
    || process.env.STRIPE_CONNECT_COUNTRY
    || 'US',
  ).toUpperCase();
  return /^[A-Z]{2}$/.test(candidate) ? candidate : 'US';
}

function buildStripeConnectStatusSnapshot(payload = {}) {
  const detailsSubmitted = payload?.detailsSubmitted === true;
  const payoutsEnabled = payload?.payoutsEnabled === true;
  const chargesEnabled = payload?.chargesEnabled === true;
  const onboardingComplete = payload?.onboardingComplete === true
    || (detailsSubmitted && payoutsEnabled);

  return {
    connectAccountId: normalizeText(payload?.connectAccountId),
    detailsSubmitted,
    payoutsEnabled,
    chargesEnabled,
    onboardingComplete,
    lastSyncedAt: normalizeText(payload?.lastSyncedAt) || new Date().toISOString(),
    onboardingCompletedAt: onboardingComplete
      ? (normalizeText(payload?.onboardingCompletedAt) || new Date().toISOString())
      : '',
  };
}

function resolveStripeConnectStatusSnapshotFromAccount(account = null) {
  if (!account || typeof account !== 'object') {
    return buildStripeConnectStatusSnapshot({});
  }

  return buildStripeConnectStatusSnapshot({
    connectAccountId: resolveStripeConnectAccountId(account),
    detailsSubmitted: account.details_submitted === true,
    payoutsEnabled: account.payouts_enabled === true,
    chargesEnabled: account.charges_enabled === true,
  });
}

async function retrieveStripeConnectAccountSafe(stripe, connectAccountIdInput) {
  const connectAccountId = normalizeText(connectAccountIdInput);
  if (!connectAccountId) {
    return null;
  }

  try {
    const account = await stripe.accounts.retrieve(connectAccountId);
    if (!account || account.deleted) {
      return null;
    }
    return account;
  } catch {
    return null;
  }
}

async function persistStripeConnectStatusToUser(profile = null, statusSnapshot = {}, options = {}) {
  if (!profile?.id) {
    return profile || null;
  }

  const status = buildStripeConnectStatusSnapshot(statusSnapshot);
  const updated = await updateUserStripeConnectProfileById(profile.id, {
    stripeConnectAccountId: status.connectAccountId,
    stripeConnectDetailsSubmitted: status.detailsSubmitted,
    stripeConnectPayoutsEnabled: status.payoutsEnabled,
    stripeConnectChargesEnabled: status.chargesEnabled,
    stripeConnectOnboardingComplete: status.onboardingComplete,
    stripeConnectLastSyncedAt: status.lastSyncedAt,
    stripeConnectOnboardingCompletedAt: status.onboardingCompletedAt,
  }, {
    client: options?.client,
  }).catch(() => null);

  return updated || profile;
}

async function createStripeConnectAccountForProfile(stripe, profile = null, identity = {}, options = {}) {
  if (!profile?.id) {
    throw new Error('Unable to create Stripe Connect payout account without a member profile.');
  }

  const email = normalizeEmail(identity?.email || profile?.email);
  const name = normalizeText(identity?.name || profile?.name);
  const account = await stripe.accounts.create({
    type: 'express',
    country: resolveStripeConnectDefaultCountry(),
    email: email || undefined,
    business_type: 'individual',
    capabilities: {
      transfers: { requested: true },
    },
    metadata: resolveSafeMetadataMap({
      ...(options?.metadata || {}),
      member_user_id: normalizeText(profile?.id || identity?.userId),
      member_username: normalizeText(profile?.username || identity?.username),
    }),
  });

  return account;
}

export function resolveStripeClient() {
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

export function resolveStripeWebhookSecret() {
  return normalizeText(process.env.STRIPE_WEBHOOK_SECRET);
}

export async function linkStripeCustomerToUserIdentity(identity = {}, options = {}) {
  const customerId = normalizeText(identity?.customerId);
  if (!customerId) {
    return {
      linked: false,
      conflict: false,
      user: null,
    };
  }

  const profile = await resolveUserStripeProfile(identity, {
    client: options?.client,
  });
  if (!profile?.id) {
    return {
      linked: false,
      conflict: false,
      user: null,
    };
  }

  const existingCustomerId = normalizeText(profile.stripeCustomerId);
  if (existingCustomerId === customerId) {
    return {
      linked: true,
      conflict: false,
      user: profile,
    };
  }

  if (existingCustomerId && existingCustomerId !== customerId) {
    return {
      linked: false,
      conflict: true,
      user: profile,
    };
  }

  const updated = await updateUserStripeCustomerIdById(profile.id, customerId, {
    client: options?.client,
  });
  return {
    linked: Boolean(updated?.id),
    conflict: false,
    user: updated || profile,
  };
}

export async function resolveOrCreateStripeCustomerForUserIdentity(identity = {}, options = {}) {
  const stripe = options?.stripe || resolveStripeClient();
  const allowCreate = options?.allowCreate !== false;
  const profile = await resolveUserStripeProfile(identity, {
    client: options?.client,
  });

  const explicitCustomerId = normalizeText(identity?.customerId);
  const mappedCustomerId = normalizeText(profile?.stripeCustomerId);
  const candidateCustomerIds = [explicitCustomerId, mappedCustomerId]
    .map((value) => normalizeText(value))
    .filter(Boolean);

  for (const candidateId of candidateCustomerIds) {
    const matchedCustomer = await retrieveStripeCustomerSafe(stripe, candidateId);
    if (!matchedCustomer) {
      continue;
    }

    if (profile?.id && normalizeText(profile.stripeCustomerId) !== matchedCustomer.id) {
      await updateUserStripeCustomerIdById(profile.id, matchedCustomer.id, {
        client: options?.client,
      }).catch(() => {});
    }

    return {
      customer: matchedCustomer,
      customerId: matchedCustomer.id,
      user: profile,
      created: false,
    };
  }

  const identityEmail = normalizeEmail(identity?.email || profile?.email);
  if (identityEmail) {
    const emailMatchedCustomer = await resolveStripeCustomerByEmail(stripe, identityEmail);
    if (emailMatchedCustomer) {
      if (profile?.id && normalizeText(profile.stripeCustomerId) !== emailMatchedCustomer.id) {
        await updateUserStripeCustomerIdById(profile.id, emailMatchedCustomer.id, {
          client: options?.client,
        }).catch(() => {});
      }

      return {
        customer: emailMatchedCustomer,
        customerId: emailMatchedCustomer.id,
        user: profile,
        created: false,
      };
    }
  }

  if (!allowCreate) {
    return {
      customer: null,
      customerId: '',
      user: profile,
      created: false,
    };
  }

  const customer = await stripe.customers.create({
    email: identityEmail || undefined,
    name: normalizeText(identity?.name || profile?.name) || undefined,
    metadata: resolveSafeMetadataMap({
      ...(options?.metadata || {}),
      member_user_id: normalizeText(profile?.id || identity?.userId),
      member_username: normalizeText(profile?.username || identity?.username),
    }),
  });

  if (profile?.id && customer?.id) {
    await updateUserStripeCustomerIdById(profile.id, customer.id, {
      client: options?.client,
    }).catch(() => {});
  }

  return {
    customer: customer && !customer.deleted ? customer : null,
    customerId: customer?.id || '',
    user: profile,
    created: true,
  };
}

export async function resolveOrCreateStripeConnectAccountForUserIdentity(identity = {}, options = {}) {
  const stripe = options?.stripe || resolveStripeClient();
  const allowCreate = options?.allowCreate !== false;
  const profile = await resolveUserStripeProfile(identity, {
    client: options?.client,
  });
  const explicitConnectAccountId = normalizeText(identity?.connectAccountId);
  const mappedConnectAccountId = normalizeText(profile?.stripeConnectAccountId);
  const candidateConnectAccountIds = [explicitConnectAccountId, mappedConnectAccountId]
    .map((value) => normalizeText(value))
    .filter(Boolean);

  for (const candidateId of candidateConnectAccountIds) {
    const matchedAccount = await retrieveStripeConnectAccountSafe(stripe, candidateId);
    if (!matchedAccount) {
      continue;
    }
    const statusSnapshot = resolveStripeConnectStatusSnapshotFromAccount(matchedAccount);
    const persistedProfile = await persistStripeConnectStatusToUser(profile, statusSnapshot, options);
    return {
      account: matchedAccount,
      connectAccountId: statusSnapshot.connectAccountId,
      user: persistedProfile || profile,
      created: false,
      status: statusSnapshot,
    };
  }

  if (!allowCreate) {
    const statusSnapshot = buildStripeConnectStatusSnapshot({
      connectAccountId: mappedConnectAccountId,
      detailsSubmitted: profile?.stripeConnectDetailsSubmitted === true,
      payoutsEnabled: profile?.stripeConnectPayoutsEnabled === true,
      chargesEnabled: profile?.stripeConnectChargesEnabled === true,
      onboardingComplete: profile?.stripeConnectOnboardingComplete === true,
      lastSyncedAt: profile?.stripeConnectLastSyncedAt,
      onboardingCompletedAt: profile?.stripeConnectOnboardingCompletedAt,
    });
    return {
      account: null,
      connectAccountId: statusSnapshot.connectAccountId,
      user: profile,
      created: false,
      status: statusSnapshot,
    };
  }

  const createdAccount = await createStripeConnectAccountForProfile(stripe, profile, identity, options);
  const statusSnapshot = resolveStripeConnectStatusSnapshotFromAccount(createdAccount);
  const persistedProfile = await persistStripeConnectStatusToUser(profile, statusSnapshot, options);
  return {
    account: createdAccount,
    connectAccountId: statusSnapshot.connectAccountId,
    user: persistedProfile || profile,
    created: true,
    status: statusSnapshot,
  };
}

export async function resolveStripeConnectStatusForUserIdentity(identity = {}, options = {}) {
  const stripe = options?.stripe || resolveStripeClient();
  const allowCreate = options?.allowCreate === true;
  const fetchRemote = options?.fetchRemote !== false;
  const resolution = await resolveOrCreateStripeConnectAccountForUserIdentity(identity, {
    ...options,
    stripe,
    allowCreate,
  });

  if (fetchRemote && resolution.connectAccountId) {
    const refreshedAccount = await retrieveStripeConnectAccountSafe(stripe, resolution.connectAccountId);
    if (refreshedAccount) {
      const statusSnapshot = resolveStripeConnectStatusSnapshotFromAccount(refreshedAccount);
      const persistedProfile = await persistStripeConnectStatusToUser(resolution.user, statusSnapshot, options);
      return {
        account: refreshedAccount,
        connectAccountId: statusSnapshot.connectAccountId,
        user: persistedProfile || resolution.user,
        status: statusSnapshot,
      };
    }
  }

  return {
    account: resolution.account || null,
    connectAccountId: normalizeText(resolution.connectAccountId),
    user: resolution.user || null,
    status: buildStripeConnectStatusSnapshot(resolution.status || {}),
  };
}

export async function createStripeConnectOnboardingLinkForUserIdentity(identity = {}, options = {}) {
  const stripe = options?.stripe || resolveStripeClient();
  const connectResolution = await resolveOrCreateStripeConnectAccountForUserIdentity(identity, {
    ...options,
    stripe,
    allowCreate: true,
  });
  const connectAccountId = normalizeText(connectResolution.connectAccountId);
  if (!connectAccountId) {
    throw new Error('Unable to resolve Stripe Connect payout account.');
  }

  const refreshUrl = resolveReturnUrl(
    options?.refreshUrl,
    options?.fallbackOrigin,
    options?.fallbackPath || '/index.html',
  );
  const returnUrl = resolveReturnUrl(
    options?.returnUrl,
    options?.fallbackOrigin,
    options?.fallbackPath || '/index.html',
  );

  const onboardingLink = await stripe.accountLinks.create({
    account: connectAccountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  });

  const refreshedStatus = await resolveStripeConnectStatusForUserIdentity({
    connectAccountId,
  }, {
    stripe,
    allowCreate: false,
    fetchRemote: true,
    client: options?.client,
  });

  return {
    onboardingUrl: normalizeText(onboardingLink?.url),
    expiresAt: Number(onboardingLink?.expires_at || 0) > 0
      ? new Date(Number(onboardingLink.expires_at) * 1000).toISOString()
      : '',
    connectAccountId,
    status: refreshedStatus.status,
    user: refreshedStatus.user || connectResolution.user || null,
  };
}

export async function createStripeConnectDashboardLoginLinkForUserIdentity(identity = {}, options = {}) {
  const stripe = options?.stripe || resolveStripeClient();
  const connectResolution = await resolveOrCreateStripeConnectAccountForUserIdentity(identity, {
    ...options,
    stripe,
    allowCreate: false,
  });
  const connectAccountId = normalizeText(connectResolution.connectAccountId);
  if (!connectAccountId) {
    throw new Error('Stripe payout account is not connected yet.');
  }

  const loginLink = await stripe.accounts.createLoginLink(connectAccountId);
  const dashboardUrl = normalizeText(loginLink?.url);
  if (!dashboardUrl) {
    throw new Error('Stripe dashboard login link was not returned.');
  }

  const refreshedStatus = await resolveStripeConnectStatusForUserIdentity({
    connectAccountId,
  }, {
    stripe,
    allowCreate: false,
    fetchRemote: true,
    client: options?.client,
  });

  return {
    dashboardUrl,
    connectAccountId,
    status: refreshedStatus.status,
    user: refreshedStatus.user || connectResolution.user || null,
  };
}

export async function createStripeConnectTransferForPayout(payload = {}, options = {}) {
  const stripe = options?.stripe || resolveStripeClient();
  const requestId = normalizeText(payload?.payoutRequestId || payload?.requestId);
  const connectAccountId = resolveStripeConnectAccountId(payload?.connectAccountId);
  const amountUsd = Math.max(0, Number(payload?.amountUsd || payload?.amount || 0));
  const amountMinor = Math.max(0, Math.round(amountUsd * 100));
  if (!requestId || !connectAccountId || amountMinor <= 0) {
    throw new Error('Stripe transfer requires request id, connected account id, and amount.');
  }

  const currency = normalizeText(payload?.currencyCode || 'USD').toLowerCase() || 'usd';
  return stripe.transfers.create({
    amount: amountMinor,
    currency,
    destination: connectAccountId,
    description: normalizeText(payload?.description) || `Charge payout ${requestId}`,
    metadata: resolveSafeMetadataMap({
      payout_request_id: requestId,
      source_key: normalizeText(payload?.sourceKey || ''),
      member_user_id: normalizeText(payload?.memberUserId || ''),
      member_username: normalizeText(payload?.memberUsername || ''),
      ...(payload?.metadata && typeof payload.metadata === 'object' ? payload.metadata : {}),
    }),
  }, {
    idempotencyKey: normalizeText(payload?.idempotencyKey) || `charge-payout-transfer-${requestId}`,
  });
}

export async function createStripeConnectPayoutForConnectedAccount(payload = {}, options = {}) {
  const stripe = options?.stripe || resolveStripeClient();
  const requestId = normalizeText(payload?.payoutRequestId || payload?.requestId);
  const connectAccountId = resolveStripeConnectAccountId(payload?.connectAccountId);
  const amountUsd = Math.max(0, Number(payload?.amountUsd || payload?.amount || 0));
  const amountMinor = Math.max(0, Math.round(amountUsd * 100));
  if (!requestId || !connectAccountId || amountMinor <= 0) {
    throw new Error('Stripe payout requires request id, connected account id, and amount.');
  }

  const currency = normalizeText(payload?.currencyCode || 'USD').toLowerCase() || 'usd';
  const method = normalizeStripePayoutMethod(payload?.method, 'standard');
  return stripe.payouts.create({
    amount: amountMinor,
    currency,
    method,
    description: normalizeText(payload?.description) || `Charge payout ${requestId}`,
    metadata: resolveSafeMetadataMap({
      payout_request_id: requestId,
      transfer_id: normalizeText(payload?.transferId),
      source_key: normalizeText(payload?.sourceKey || ''),
      member_user_id: normalizeText(payload?.memberUserId || ''),
      member_username: normalizeText(payload?.memberUsername || ''),
      ...(payload?.metadata && typeof payload.metadata === 'object' ? payload.metadata : {}),
    }),
  }, {
    stripeAccount: connectAccountId,
    idempotencyKey: normalizeText(payload?.idempotencyKey) || `charge-payout-connected-payout-${requestId}`,
  });
}

export async function createStripeBillingPortalSessionForUserIdentity(identity = {}, options = {}) {
  const stripe = options?.stripe || resolveStripeClient();
  const customerResolution = await resolveOrCreateStripeCustomerForUserIdentity(identity, {
    stripe,
    allowCreate: true,
    metadata: options?.metadata || {},
  });
  const customerId = normalizeText(customerResolution.customerId);
  if (!customerId) {
    throw new Error('Unable to resolve Stripe customer for billing portal.');
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: resolveReturnUrl(options?.returnUrl, options?.fallbackOrigin),
  });

  return {
    session,
    customerId,
    user: customerResolution.user || null,
  };
}

export {
  normalizeEmail,
  normalizeText,
  resolveStripeConnectAccountId,
  resolveStripeCustomerId,
};
