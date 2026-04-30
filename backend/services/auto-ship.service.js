import pool from '../db/db.js';
import { findUserById, findUserByIdentifier } from '../stores/user.store.js';
import { createStoreInvoice, syncStoreInvoiceStripeDetails } from './invoice.service.js';
import { recordMemberPurchase } from './member.service.js';
import {
  ensureAutoShipTables,
  insertUserAutoShipEvent,
  readUserAutoShipSettingByCustomerId,
  readUserAutoShipSettingBySubscriptionId,
  readUserAutoShipSettingByUserId,
  upsertUserAutoShipSetting,
} from '../stores/auto-ship.store.js';
import {
  ensureLedgerTables,
  insertLedgerEntry,
} from '../stores/ledger.store.js';
import {
  linkStripeCustomerToUserIdentity,
  resolveOrCreateStripeCustomerForUserIdentity,
  resolveStripeClient,
  resolveStripeCustomerId,
} from './stripe-client.service.js';
import {
  LEDGER_ENTRY_DIRECTIONS,
  LEDGER_ENTRY_STATUSES,
  LEDGER_ENTRY_TYPES,
  LEDGER_SOURCE_TYPES,
} from '../utils/ledger.helpers.js';

const AUTOSHIP_PRODUCT_BV = 50;

const AUTOSHIP_PRODUCTS = Object.freeze({
  metacharge: Object.freeze({
    key: 'metacharge',
    name: 'MetaCharge™',
    priceEnvKey: 'STRIPE_AUTOSHIP_METACHARGE_PRICE_ID',
    fallbackMonthlyPrice: 0,
  }),
  metaroast: Object.freeze({
    key: 'metaroast',
    name: 'MetaRoast™',
    priceEnvKey: 'STRIPE_AUTOSHIP_METAROAST_PRICE_ID',
    fallbackMonthlyPrice: 0,
  }),
});

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeCredential(value) {
  return normalizeText(value).toLowerCase();
}

function normalizeEmail(value) {
  const normalized = normalizeCredential(value);
  return normalized.includes('@') ? normalized : '';
}

function toIsoStringOrEmpty(value) {
  if (!value) {
    return '';
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString();
}

function toIsoFromUnixSeconds(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return '';
  }
  return new Date(Math.round(parsed * 1000)).toISOString();
}

function roundCurrencyAmount(value, fallback = 0) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return Math.round((Math.max(0, Number(fallback) || 0) + Number.EPSILON) * 100) / 100;
  }
  return Math.round((Math.max(0, parsed) + Number.EPSILON) * 100) / 100;
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

function resolveRequestOrigin(context = {}) {
  const candidate = normalizeText(context?.origin || process.env.PUBLIC_APP_ORIGIN || '');
  if (candidate) {
    try {
      const parsed = new URL(candidate);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.origin;
      }
    } catch {
      // fall through
    }
  }

  const fallbackPort = Number.parseInt(process.env.PORT || '3000', 10) || 3000;
  return `http://localhost:${fallbackPort}`;
}

function resolveReturnUrl(returnUrlInput = '', context = {}) {
  const fallbackOrigin = resolveRequestOrigin(context);
  const fallback = new URL('/index.html', fallbackOrigin);
  const requested = normalizeText(returnUrlInput);
  if (!requested) {
    return fallback.toString();
  }

  try {
    const parsed = new URL(requested, fallbackOrigin);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return fallback.toString();
    }
    return parsed.toString();
  } catch {
    return fallback.toString();
  }
}

function resolveUserIdentityPayload(memberUser = {}) {
  return {
    userId: normalizeText(memberUser?.id || memberUser?.userId),
    username: normalizeText(memberUser?.username),
    email: normalizeEmail(memberUser?.email),
    name: normalizeText(memberUser?.name || memberUser?.fullName || memberUser?.username),
  };
}

async function resolveUserFromMemberAuth(memberUserInput = {}) {
  const userId = normalizeText(memberUserInput?.id);
  if (!userId) {
    return null;
  }
  return findUserById(userId);
}

function resolveAutoShipProductOption(productKeyInput = '') {
  const key = normalizeCredential(productKeyInput);
  if (key === 'metacharge') {
    return AUTOSHIP_PRODUCTS.metacharge;
  }
  if (key === 'metaroast') {
    return AUTOSHIP_PRODUCTS.metaroast;
  }
  return null;
}

function resolveAutoShipProductPriceId(productKeyInput = '') {
  const productOption = resolveAutoShipProductOption(productKeyInput);
  if (!productOption) {
    return '';
  }
  return normalizeText(process.env[productOption.priceEnvKey]);
}

function resolveAutoShipProductByPriceId(priceIdInput = '') {
  const priceId = normalizeText(priceIdInput);
  if (!priceId) {
    return null;
  }

  const metachargePriceId = resolveAutoShipProductPriceId('metacharge');
  if (metachargePriceId && metachargePriceId === priceId) {
    return AUTOSHIP_PRODUCTS.metacharge;
  }

  const metaroastPriceId = resolveAutoShipProductPriceId('metaroast');
  if (metaroastPriceId && metaroastPriceId === priceId) {
    return AUTOSHIP_PRODUCTS.metaroast;
  }

  return null;
}

function normalizeAutoShipStatusFromStripeStatus(value) {
  const normalized = normalizeCredential(value);
  if (
    normalized === 'active'
    || normalized === 'trialing'
    || normalized === 'paused'
  ) {
    return 'active';
  }

  if (
    normalized === 'past_due'
    || normalized === 'past-due'
    || normalized === 'past due'
    || normalized === 'unpaid'
    || normalized === 'incomplete'
    || normalized === 'incomplete_expired'
  ) {
    return 'past_due';
  }

  if (normalized === 'canceled' || normalized === 'cancelled') {
    return 'canceled';
  }

  return 'inactive';
}

function resolveAutoShipStatusLabel(statusInput = '') {
  const status = normalizeCredential(statusInput);
  if (status === 'active') {
    return 'Active';
  }
  if (status === 'past_due') {
    return 'Past Due';
  }
  if (status === 'canceled') {
    return 'Canceled';
  }
  return 'Inactive';
}

function resolveAutoShipPriceFromLineItem(lineItem = null, fallbackAmount = 0) {
  if (!lineItem || typeof lineItem !== 'object') {
    return roundCurrencyAmount(fallbackAmount, fallbackAmount);
  }

  const fromUnitAmount = Number(lineItem?.price?.unit_amount);
  if (Number.isFinite(fromUnitAmount) && fromUnitAmount >= 0) {
    return roundCurrencyAmount(fromUnitAmount / 100, fallbackAmount);
  }

  const fromAmount = Number(lineItem?.amount);
  const quantity = Math.max(1, Number(lineItem?.quantity) || 1);
  if (Number.isFinite(fromAmount) && fromAmount >= 0) {
    return roundCurrencyAmount((fromAmount / 100) / quantity, fallbackAmount);
  }

  return roundCurrencyAmount(fallbackAmount, fallbackAmount);
}

function resolveAutoShipProductFromSubscription(subscription = null, fallbackProductKey = '') {
  const safeFallback = resolveAutoShipProductOption(fallbackProductKey);
  const items = Array.isArray(subscription?.items?.data) ? subscription.items.data : [];
  if (items.length > 0) {
    const byPrice = resolveAutoShipProductByPriceId(items[0]?.price?.id || items[0]?.price);
    if (byPrice) {
      return byPrice;
    }
  }

  const metadataProductKey = normalizeCredential(
    subscription?.metadata?.autoship_product_key
    || subscription?.metadata?.selected_product_key
    || '',
  );
  const byMetadata = resolveAutoShipProductOption(metadataProductKey);
  if (byMetadata) {
    return byMetadata;
  }

  return safeFallback;
}

function resolveAutoShipMonthlyPriceFromSubscription(subscription = null, fallback = 0) {
  const items = Array.isArray(subscription?.items?.data) ? subscription.items.data : [];
  if (items.length === 0) {
    return roundCurrencyAmount(fallback, fallback);
  }
  return resolveAutoShipPriceFromLineItem(items[0], fallback);
}

function resolveAutoShipSubscriptionCurrentPeriodStart(subscription = null) {
  const subscriptionPeriodStart = toIsoFromUnixSeconds(subscription?.current_period_start);
  if (subscriptionPeriodStart) {
    return subscriptionPeriodStart;
  }

  const firstItem = Array.isArray(subscription?.items?.data)
    ? subscription.items.data[0]
    : null;
  return toIsoFromUnixSeconds(firstItem?.current_period_start);
}

function resolveAutoShipSubscriptionCurrentPeriodEnd(subscription = null) {
  const subscriptionPeriodEnd = toIsoFromUnixSeconds(subscription?.current_period_end);
  if (subscriptionPeriodEnd) {
    return subscriptionPeriodEnd;
  }

  const firstItem = Array.isArray(subscription?.items?.data)
    ? subscription.items.data[0]
    : null;
  return toIsoFromUnixSeconds(firstItem?.current_period_end);
}

function resolveAutoShipNextBillingDateFromSubscription(subscription = null) {
  const periodEnd = resolveAutoShipSubscriptionCurrentPeriodEnd(subscription);
  if (periodEnd) {
    return periodEnd;
  }
  const billingCycleAnchor = toIsoFromUnixSeconds(subscription?.billing_cycle_anchor);
  if (billingCycleAnchor) {
    return billingCycleAnchor;
  }
  return '';
}

function resolveAutoShipScheduledBillingAnchorUnix(member = {}, options = {}) {
  const activeUntilRaw = toIsoStringOrEmpty(
    member?.activityActiveUntilAt
    || member?.activity_active_until_at
    || member?.activeUntilAt
    || member?.active_until_at,
  );
  if (!activeUntilRaw) {
    return null;
  }

  const activeUntilDate = new Date(activeUntilRaw);
  if (!Number.isFinite(activeUntilDate.getTime())) {
    return null;
  }

  const offsetDays = Number.isFinite(Number(options?.offsetDays))
    ? Number(options.offsetDays)
    : 1;
  const minimumLeadMs = Number.isFinite(Number(options?.minimumLeadMs))
    ? Math.max(60_000, Number(options.minimumLeadMs))
    : (10 * 60 * 1000);

  const anchorMs = activeUntilDate.getTime() + (Math.max(0, offsetDays) * 24 * 60 * 60 * 1000);
  if (!Number.isFinite(anchorMs) || anchorMs <= (Date.now() + minimumLeadMs)) {
    return null;
  }

  return Math.floor(anchorMs / 1000);
}

function buildAutoShipProductOptionList() {
  const options = Object.values(AUTOSHIP_PRODUCTS).map((entry) => {
    const configuredPriceId = normalizeText(process.env[entry.priceEnvKey]);
    return {
      key: entry.key,
      name: entry.name,
      configured: Boolean(configuredPriceId),
      priceId: configuredPriceId,
    };
  });

  return options;
}

function isManageBillingEligibleStatus(statusInput = '') {
  const status = normalizeCredential(statusInput);
  return status === 'active' || status === 'past_due' || status === 'canceled';
}

function buildAutoShipResponsePayload(setting = null, options = {}) {
  const productOption = resolveAutoShipProductOption(setting?.selectedProductKey || '');
  const status = normalizeCredential(setting?.status || 'inactive') || 'inactive';
  const monthlyPrice = roundCurrencyAmount(
    setting?.monthlyPrice,
    productOption?.fallbackMonthlyPrice || 0,
  );
  const scheduledBillingAnchorAt = toIsoStringOrEmpty(setting?.metadata?.scheduledBillingAnchorAt);
  const nextBillingDate = toIsoStringOrEmpty(setting?.nextBillingDate) || scheduledBillingAnchorAt;
  const allowManageBilling = isManageBillingEligibleStatus(status);
  const subscriptionStatus = normalizeText(setting?.stripeSubscriptionStatus || '');

  return {
    success: true,
    autoShip: {
      status,
      statusLabel: resolveAutoShipStatusLabel(status),
      stripeSubscriptionStatus: subscriptionStatus,
      selectedProductKey: productOption?.key || '',
      selectedProductName: productOption?.name || normalizeText(setting?.selectedProductName),
      personalBvPerShipment: AUTOSHIP_PRODUCT_BV,
      monthlyPrice,
      currentPeriodStart: toIsoStringOrEmpty(setting?.currentPeriodStart),
      currentPeriodEnd: toIsoStringOrEmpty(setting?.currentPeriodEnd),
      nextBillingDate,
      canceledAt: toIsoStringOrEmpty(setting?.canceledAt),
      failureMessage: normalizeText(setting?.failureMessage),
      stripeCustomerId: normalizeText(setting?.stripeCustomerId),
      stripeSubscriptionId: normalizeText(setting?.stripeSubscriptionId),
      scheduledBillingAnchorAt,
      paymentDetailsManagedBy: 'Stripe',
      products: buildAutoShipProductOptionList(),
      canEnable: status === 'inactive' || status === 'canceled',
      canManageBilling: allowManageBilling,
      canCancel: status === 'active' || status === 'past_due',
      canChangeProduct: status === 'active' || status === 'past_due',
      lastSyncedAt: normalizeText(options?.lastSyncedAt || '') || new Date().toISOString(),
    },
  };
}

async function upsertAutoShipSettingFromSubscription(params = {}) {
  const user = params?.user || null;
  const subscription = params?.subscription || null;
  const setting = params?.setting || null;
  const metadata = params?.metadata && typeof params.metadata === 'object'
    ? params.metadata
    : {};

  const selectedProduct = resolveAutoShipProductFromSubscription(subscription, setting?.selectedProductKey);
  const selectedProductKey = selectedProduct?.key || normalizeCredential(setting?.selectedProductKey);
  const selectedProductName = selectedProduct?.name || normalizeText(setting?.selectedProductName);
  const monthlyPrice = resolveAutoShipMonthlyPriceFromSubscription(
    subscription,
    setting?.monthlyPrice || selectedProduct?.fallbackMonthlyPrice || 0,
  );
  const stripeStatus = normalizeText(subscription?.status || setting?.stripeSubscriptionStatus);
  const normalizedStatus = normalizeAutoShipStatusFromStripeStatus(stripeStatus || setting?.status);
  const currentPeriodStart = resolveAutoShipSubscriptionCurrentPeriodStart(subscription)
    || toIsoStringOrEmpty(setting?.currentPeriodStart);
  const currentPeriodEnd = resolveAutoShipSubscriptionCurrentPeriodEnd(subscription)
    || toIsoStringOrEmpty(setting?.currentPeriodEnd);
  const nextBillingDate = resolveAutoShipNextBillingDateFromSubscription(subscription)
    || toIsoStringOrEmpty(setting?.nextBillingDate);
  const canceledAt = toIsoFromUnixSeconds(subscription?.canceled_at)
    || toIsoStringOrEmpty(setting?.canceledAt);
  const customerId = resolveStripeCustomerId(subscription?.customer)
    || normalizeText(setting?.stripeCustomerId);
  const subscriptionId = normalizeText(subscription?.id || setting?.stripeSubscriptionId);
  const latestInvoiceId = normalizeText(
    subscription?.latest_invoice?.id
    || subscription?.latest_invoice
    || setting?.latestInvoiceId,
  );
  const latestPaymentIntentId = normalizeText(
    subscription?.latest_invoice?.payment_intent?.id
    || subscription?.latest_invoice?.payment_intent
    || setting?.latestPaymentIntentId,
  );

  const upserted = await upsertUserAutoShipSetting({
    ...(setting || {}),
    userId: normalizeText(user?.id || setting?.userId),
    username: normalizeText(user?.username || setting?.username),
    email: normalizeEmail(user?.email || setting?.email),
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    stripeSubscriptionStatus: stripeStatus,
    selectedProductKey,
    selectedProductName,
    monthlyPrice,
    status: normalizedStatus,
    currentPeriodStart: currentPeriodStart || null,
    currentPeriodEnd: currentPeriodEnd || null,
    nextBillingDate: nextBillingDate || null,
    canceledAt: canceledAt || null,
    latestInvoiceId,
    latestPaymentIntentId,
    failureMessage: normalizedStatus === 'past_due'
      ? normalizeText(setting?.failureMessage || 'Subscription payment is past due.')
      : '',
    metadata: {
      ...(setting?.metadata || {}),
      ...metadata,
    },
    updatedAt: new Date().toISOString(),
  });

  return upserted;
}

function isAutoShipMetadata(metadata = {}) {
  const checkoutType = normalizeCredential(metadata?.checkout_type);
  const flow = normalizeCredential(metadata?.flow || metadata?.payment_flow);
  const autoShipFlag = normalizeCredential(metadata?.autoship || metadata?.auto_ship);
  const productKey = normalizeCredential(metadata?.autoship_product_key || metadata?.selected_product_key);
  return checkoutType === 'autoship'
    || flow === 'autoship'
    || autoShipFlag === 'true'
    || productKey === 'metacharge'
    || productKey === 'metaroast';
}

function resolveUserIdentityFromMetadata(metadata = {}, fallback = {}) {
  return {
    userId: normalizeText(
      metadata?.buyer_user_id
      || metadata?.member_user_id
      || metadata?.user_id
      || fallback?.userId,
    ),
    username: normalizeText(
      metadata?.buyer_username
      || metadata?.member_username
      || metadata?.username
      || fallback?.username,
    ),
    email: normalizeEmail(
      metadata?.buyer_email
      || metadata?.email
      || fallback?.email,
    ),
  };
}

async function resolveUserFromIdentity(identity = {}) {
  const userId = normalizeText(identity?.userId);
  if (userId) {
    const byId = await findUserById(userId);
    if (byId) {
      return byId;
    }
  }

  const username = normalizeText(identity?.username);
  if (username) {
    const byUsername = await findUserByIdentifier(username);
    if (byUsername) {
      return byUsername;
    }
  }

  const email = normalizeEmail(identity?.email);
  if (email) {
    const byEmail = await findUserByIdentifier(email);
    if (byEmail) {
      return byEmail;
    }
  }

  return null;
}

async function retrieveSubscriptionSafe(stripe, subscriptionIdInput = '') {
  const subscriptionId = normalizeText(subscriptionIdInput);
  if (!subscriptionId) {
    return null;
  }

  try {
    return await stripe.subscriptions.retrieve(subscriptionId, {
      expand: [
        'items.data.price',
        'latest_invoice.payment_intent',
      ],
    });
  } catch {
    return null;
  }
}

async function retrieveInvoiceSafe(stripe, invoiceIdInput = '') {
  const invoiceId = normalizeText(invoiceIdInput);
  if (!invoiceId) {
    return null;
  }

  try {
    return await stripe.invoices.retrieve(invoiceId, {
      expand: [
        'payment_intent',
        'lines.data.price',
      ],
    });
  } catch {
    return null;
  }
}

async function retrieveCheckoutSessionSafe(stripe, checkoutSessionIdInput = '') {
  const checkoutSessionId = normalizeText(checkoutSessionIdInput);
  if (!checkoutSessionId) {
    return null;
  }

  try {
    return await stripe.checkout.sessions.retrieve(checkoutSessionId, {
      expand: [
        'subscription',
      ],
    });
  } catch {
    return null;
  }
}

function isAutoShipSubscriptionCandidate(subscriptionObject = null) {
  const subscription = subscriptionObject && typeof subscriptionObject === 'object'
    ? subscriptionObject
    : null;
  if (!subscription) {
    return false;
  }

  const metadata = subscription?.metadata && typeof subscription.metadata === 'object'
    ? subscription.metadata
    : {};
  if (isAutoShipMetadata(metadata)) {
    return true;
  }

  const configuredAutoShipPriceIds = new Set([
    resolveAutoShipProductPriceId('metacharge'),
    resolveAutoShipProductPriceId('metaroast'),
  ].filter(Boolean));
  if (configuredAutoShipPriceIds.size === 0) {
    return false;
  }

  const items = Array.isArray(subscription?.items?.data)
    ? subscription.items.data
    : [];
  return items.some((item) => {
    const priceId = normalizeText(item?.price?.id || item?.price);
    return Boolean(priceId) && configuredAutoShipPriceIds.has(priceId);
  });
}

async function findLatestAutoShipSubscriptionForCustomer(stripe, customerIdInput = '') {
  const customerId = normalizeText(customerIdInput);
  if (!customerId) {
    return null;
  }

  let subscriptions = [];
  try {
    const result = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 20,
    });
    subscriptions = Array.isArray(result?.data) ? result.data : [];
  } catch {
    subscriptions = [];
  }

  const candidates = [];
  for (const entry of subscriptions) {
    if (!isAutoShipSubscriptionCandidate(entry)) {
      continue;
    }
    const refreshed = await retrieveSubscriptionSafe(stripe, entry?.id || '');
    const candidate = refreshed || entry;
    if (candidate?.id) {
      candidates.push(candidate);
    }
  }

  if (candidates.length === 0) {
    return null;
  }

  const statusRank = (subscription = null) => {
    const status = normalizeCredential(subscription?.status);
    if (status === 'active' || status === 'trialing' || status === 'paused') {
      return 4;
    }
    if (status === 'past_due' || status === 'incomplete' || status === 'unpaid') {
      return 3;
    }
    if (status === 'incomplete_expired') {
      return 2;
    }
    if (status === 'canceled' || status === 'cancelled') {
      return 1;
    }
    return 0;
  };

  candidates.sort((left, right) => {
    const rankDiff = statusRank(right) - statusRank(left);
    if (rankDiff !== 0) {
      return rankDiff;
    }

    const createdLeft = Number(left?.created) || 0;
    const createdRight = Number(right?.created) || 0;
    return createdRight - createdLeft;
  });

  if (candidates[0]) {
    return candidates[0];
  }

  return null;
}

async function resolveExistingStoreInvoiceForStripeInvoice(stripeInvoiceIdInput = '', userIdInput = '') {
  const stripeInvoiceId = normalizeText(stripeInvoiceIdInput);
  const userId = normalizeText(userIdInput);
  if (!stripeInvoiceId || !userId) {
    return null;
  }

  const result = await pool.query(`
    SELECT
      id,
      stripe_invoice_id,
      buyer_user_id
    FROM charge.store_invoices
    WHERE stripe_invoice_id = $1
      AND buyer_user_id = $2
    ORDER BY created_at DESC
    LIMIT 1
  `, [stripeInvoiceId, userId]).catch(() => null);

  if (!result || !Array.isArray(result.rows) || result.rows.length === 0) {
    return null;
  }

  return {
    id: normalizeText(result.rows[0]?.id),
    stripeInvoiceId: normalizeText(result.rows[0]?.stripe_invoice_id),
    buyerUserId: normalizeText(result.rows[0]?.buyer_user_id),
  };
}

function resolvePriceFromInvoice(invoice = null, fallback = 0) {
  const amountPaid = Number(invoice?.amount_paid);
  if (Number.isFinite(amountPaid) && amountPaid > 0) {
    return roundCurrencyAmount(amountPaid / 100, fallback);
  }

  const amountDue = Number(invoice?.amount_due);
  if (Number.isFinite(amountDue) && amountDue > 0) {
    return roundCurrencyAmount(amountDue / 100, fallback);
  }

  const lineItems = Array.isArray(invoice?.lines?.data) ? invoice.lines.data : [];
  if (lineItems.length > 0) {
    return resolveAutoShipPriceFromLineItem(lineItems[0], fallback);
  }

  return roundCurrencyAmount(fallback, fallback);
}

function resolveProductFromInvoice(invoice = null, fallbackProductKey = '') {
  const lineItems = Array.isArray(invoice?.lines?.data) ? invoice.lines.data : [];
  if (lineItems.length > 0) {
    const lineItem = lineItems[0];
    const byPrice = resolveAutoShipProductByPriceId(lineItem?.price?.id || lineItem?.price);
    if (byPrice) {
      return byPrice;
    }
  }

  const metadataProduct = resolveAutoShipProductOption(
    invoice?.metadata?.autoship_product_key
    || invoice?.metadata?.selected_product_key
    || fallbackProductKey,
  );
  return metadataProduct;
}

function resolveAutoShipCheckoutSuccessUrl(returnUrlInput = '', context = {}) {
  const returnUrl = resolveReturnUrl(returnUrlInput, context);
  const url = new URL(returnUrl);
  url.searchParams.set('settings', 'payment');
  url.searchParams.set('autoship', 'success');
  url.searchParams.set('source', 'autoship');
  url.searchParams.set('session_id', '{CHECKOUT_SESSION_ID}');
  return url.toString();
}

function resolveAutoShipCheckoutCancelUrl(returnUrlInput = '', context = {}) {
  const returnUrl = resolveReturnUrl(returnUrlInput, context);
  const url = new URL(returnUrl);
  url.searchParams.set('settings', 'payment');
  url.searchParams.set('autoship', 'cancel');
  url.searchParams.set('source', 'autoship');
  return url.toString();
}

export async function getMemberAutoShipStatus(memberUserInput = {}) {
  await ensureAutoShipTables();

  const matchedUser = await resolveUserFromMemberAuth(memberUserInput);
  if (!matchedUser) {
    return {
      success: false,
      status: 404,
      error: 'Member account was not found for Auto Ship status.',
    };
  }

  let setting = await readUserAutoShipSettingByUserId(matchedUser.id);
  if (!setting) {
    return {
      success: true,
      status: 200,
      data: buildAutoShipResponsePayload({
        userId: matchedUser.id,
        username: matchedUser.username,
        email: matchedUser.email,
        status: 'inactive',
      }),
    };
  }

  let stripe = null;
  try {
    stripe = resolveStripeClient();
  } catch {
    stripe = null;
  }

  if (stripe) {
    const knownSubscriptionId = normalizeText(setting.stripeSubscriptionId);
    let knownCustomerId = normalizeText(setting.stripeCustomerId);
    let subscription = null;

    if (knownSubscriptionId) {
      subscription = await retrieveSubscriptionSafe(stripe, knownSubscriptionId);
      if (!knownCustomerId) {
        knownCustomerId = resolveStripeCustomerId(subscription?.customer);
      }
    }

    if (!subscription && !knownSubscriptionId && normalizeText(setting.latestCheckoutSessionId)) {
      const checkoutSession = await retrieveCheckoutSessionSafe(stripe, setting.latestCheckoutSessionId);
      const sessionSubscriptionId = normalizeText(
        checkoutSession?.subscription?.id
        || checkoutSession?.subscription,
      );
      if (sessionSubscriptionId) {
        subscription = await retrieveSubscriptionSafe(stripe, sessionSubscriptionId);
        if (!knownCustomerId) {
          knownCustomerId = resolveStripeCustomerId(subscription?.customer)
            || resolveStripeCustomerId(checkoutSession?.customer);
        }
      } else if (!knownCustomerId) {
        knownCustomerId = resolveStripeCustomerId(checkoutSession?.customer);
      }
    }

    if (knownCustomerId) {
      const latestCustomerAutoShipSubscription = await findLatestAutoShipSubscriptionForCustomer(stripe, knownCustomerId);
      if (!subscription) {
        subscription = latestCustomerAutoShipSubscription;
      } else {
        const knownStatus = normalizeCredential(subscription?.status);
        const latestStatus = normalizeCredential(latestCustomerAutoShipSubscription?.status);
        const knownId = normalizeText(subscription?.id);
        const latestId = normalizeText(latestCustomerAutoShipSubscription?.id);
        const knownTerminal = knownStatus === 'canceled' || knownStatus === 'incomplete_expired';
        const latestPreferred = latestStatus === 'active'
          || latestStatus === 'trialing'
          || latestStatus === 'paused'
          || latestStatus === 'past_due'
          || latestStatus === 'incomplete'
          || latestStatus === 'unpaid';
        if (
          latestCustomerAutoShipSubscription
          && latestId
          && latestId !== knownId
          && (knownTerminal || latestPreferred)
        ) {
          subscription = latestCustomerAutoShipSubscription;
        }
      }
    }

    if (subscription) {
      setting = await upsertAutoShipSettingFromSubscription({
        user: matchedUser,
        subscription,
        setting,
        metadata: {
          lastSyncedSource: 'member-status',
        },
      });

      const latestInvoiceCandidate = (() => {
        if (!subscription?.latest_invoice) {
          return null;
        }
        if (typeof subscription.latest_invoice === 'object') {
          return subscription.latest_invoice;
        }
        return null;
      })();
      const latestInvoiceId = normalizeText(
        latestInvoiceCandidate?.id
        || subscription?.latest_invoice,
      );
      let latestInvoice = latestInvoiceCandidate;
      if (!latestInvoice && latestInvoiceId) {
        latestInvoice = await retrieveInvoiceSafe(stripe, latestInvoiceId);
      }

      const invoiceStatus = normalizeCredential(latestInvoice?.status || '');
      const invoiceId = normalizeText(latestInvoice?.id || '');
      if (invoiceStatus === 'paid' && invoiceId) {
        const existingAutoShipInvoice = await resolveExistingStoreInvoiceForStripeInvoice(
          invoiceId,
          matchedUser.id,
        );
        if (!existingAutoShipInvoice) {
          await handleAutoShipInvoicePaymentSucceeded(latestInvoice, null).catch(() => null);
          const refreshedSetting = await readUserAutoShipSettingByUserId(matchedUser.id);
          if (refreshedSetting) {
            setting = refreshedSetting;
          }
        }
      }
    }
  }

  return {
    success: true,
    status: 200,
    data: buildAutoShipResponsePayload(setting),
  };
}

export async function createMemberAutoShipCheckoutSession(memberUserInput = {}, payload = {}, context = {}) {
  await ensureAutoShipTables();

  const matchedUser = await resolveUserFromMemberAuth(memberUserInput);
  if (!matchedUser) {
    return {
      success: false,
      status: 404,
      error: 'Member account was not found for Auto Ship setup.',
    };
  }

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

  const requestedProduct = resolveAutoShipProductOption(payload?.selectedProductKey || payload?.productKey);
  if (!requestedProduct) {
    return {
      success: false,
      status: 400,
      error: 'Select a valid Auto Ship product (MetaCharge™ or MetaRoast™).',
    };
  }

  const selectedPriceId = resolveAutoShipProductPriceId(requestedProduct.key);
  if (!selectedPriceId) {
    return {
      success: false,
      status: 503,
      error: `Auto Ship price is not configured for ${requestedProduct.name}.`,
    };
  }

  const existingSetting = await readUserAutoShipSettingByUserId(matchedUser.id);
  const existingStatus = normalizeCredential(existingSetting?.status);
  if (
    normalizeText(existingSetting?.stripeSubscriptionId)
    && (existingStatus === 'active' || existingStatus === 'past_due')
  ) {
    return {
      success: false,
      status: 409,
      error: 'Auto Ship is already enabled for this account. Manage or cancel the current subscription first.',
      data: buildAutoShipResponsePayload(existingSetting),
    };
  }

  const identity = resolveUserIdentityPayload(matchedUser);
  const customerResolution = await resolveOrCreateStripeCustomerForUserIdentity(identity, {
    stripe,
    allowCreate: true,
    metadata: {
      source: 'member-autoship',
    },
  });
  const stripeCustomerId = normalizeText(customerResolution?.customerId);
  if (!stripeCustomerId) {
    return {
      success: false,
      status: 502,
      error: 'Unable to resolve Stripe customer for Auto Ship setup.',
    };
  }

  // Guard against duplicate active subscriptions when local status is stale
  // (for example if Stripe webhook delivery is delayed or not configured).
  const remoteAutoShipSubscription = await findLatestAutoShipSubscriptionForCustomer(stripe, stripeCustomerId);
  if (remoteAutoShipSubscription?.id) {
    const syncedSetting = await upsertAutoShipSettingFromSubscription({
      user: matchedUser,
      subscription: remoteAutoShipSubscription,
      setting: existingSetting || {
        userId: matchedUser.id,
        username: matchedUser.username,
        email: matchedUser.email,
        stripeCustomerId,
      },
      metadata: {
        lastSyncedSource: 'checkout-preflight',
      },
    });
    const syncedStatus = normalizeCredential(syncedSetting?.status);
    if (
      normalizeText(syncedSetting?.stripeSubscriptionId)
      && (syncedStatus === 'active' || syncedStatus === 'past_due')
    ) {
      return {
        success: false,
        status: 409,
        error: 'Auto Ship is already enabled for this account. Manage or cancel the current subscription first.',
        data: buildAutoShipResponsePayload(syncedSetting),
      };
    }
  }

  const returnUrl = normalizeText(payload?.returnUrl || payload?.return_url || '');
  const successUrl = resolveAutoShipCheckoutSuccessUrl(returnUrl, context);
  const cancelUrl = resolveAutoShipCheckoutCancelUrl(returnUrl, context);

  const metadata = resolveSafeMetadataMap({
    checkout_type: 'autoship',
    flow: 'autoship',
    autoship: 'true',
    autoship_product_key: requestedProduct.key,
    autoship_product_name: requestedProduct.name,
    buyer_user_id: identity.userId,
    buyer_username: identity.username,
    buyer_email: identity.email,
    source: 'member-dashboard-settings',
  });
  const scheduledBillingAnchorUnix = resolveAutoShipScheduledBillingAnchorUnix(matchedUser, {
    offsetDays: 1,
    minimumLeadMs: 10 * 60 * 1000,
  });
  const scheduledBillingAnchorAt = scheduledBillingAnchorUnix
    ? new Date(scheduledBillingAnchorUnix * 1000).toISOString()
    : '';

  let session = null;
  try {
    const subscriptionData = {
      metadata,
      ...(scheduledBillingAnchorUnix
        ? {
            billing_cycle_anchor: scheduledBillingAnchorUnix,
            proration_behavior: 'none',
          }
        : {}),
    };

    session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
      client_reference_id: identity.userId || undefined,
      success_url: successUrl,
      cancel_url: cancelUrl,
      automatic_tax: {
        enabled: true,
      },
      payment_method_collection: 'always',
      customer_update: {
        address: 'auto',
        shipping: 'auto',
        name: 'auto',
      },
      billing_address_collection: 'required',
      line_items: [
        {
          price: selectedPriceId,
          quantity: 1,
        },
      ],
      metadata,
      subscription_data: subscriptionData,
    });
  } catch (error) {
    return {
      success: false,
      status: 502,
      error: error instanceof Error
        ? error.message
        : 'Unable to create Stripe checkout session for Auto Ship.',
    };
  }

  const preCheckoutSetting = await upsertUserAutoShipSetting({
    ...(existingSetting || {}),
    userId: matchedUser.id,
    username: matchedUser.username,
    email: matchedUser.email,
    stripeCustomerId,
    selectedProductKey: requestedProduct.key,
    selectedProductName: requestedProduct.name,
    monthlyPrice: roundCurrencyAmount(existingSetting?.monthlyPrice || requestedProduct.fallbackMonthlyPrice, 0),
    status: existingStatus === 'canceled' ? 'canceled' : 'inactive',
    latestCheckoutSessionId: normalizeText(session?.id),
    metadata: {
      ...(existingSetting?.metadata || {}),
      latestCheckoutSource: 'member-autoship',
      scheduledBillingAnchorAt: scheduledBillingAnchorAt || '',
      billingBehavior: scheduledBillingAnchorUnix ? 'anchor-after-active-window' : 'immediate',
    },
    updatedAt: new Date().toISOString(),
  });

  await insertUserAutoShipEvent({
    userId: matchedUser.id,
    autoShipSettingId: normalizeText(preCheckoutSetting?.id),
    eventType: 'checkout_session_created',
    stripeSubscriptionId: normalizeText(preCheckoutSetting?.stripeSubscriptionId),
    description: `Auto Ship setup started for ${requestedProduct.name}.`,
    metadata: {
      checkoutSessionId: normalizeText(session?.id),
      selectedProductKey: requestedProduct.key,
      selectedProductName: requestedProduct.name,
      scheduledBillingAnchorAt: scheduledBillingAnchorAt || '',
      billingBehavior: scheduledBillingAnchorUnix ? 'anchor-after-active-window' : 'immediate',
    },
  }).catch(() => {});

  return {
    success: true,
    status: 200,
    data: {
      success: true,
      checkoutUrl: normalizeText(session?.url),
      checkoutSessionId: normalizeText(session?.id),
      customerId: stripeCustomerId,
      scheduledBillingAnchorAt: scheduledBillingAnchorAt || '',
      billingBehavior: scheduledBillingAnchorUnix ? 'anchor-after-active-window' : 'immediate',
      autoShip: buildAutoShipResponsePayload(preCheckoutSetting).autoShip,
    },
  };
}

export async function cancelMemberAutoShip(memberUserInput = {}, payload = {}) {
  await ensureAutoShipTables();

  const matchedUser = await resolveUserFromMemberAuth(memberUserInput);
  if (!matchedUser) {
    return {
      success: false,
      status: 404,
      error: 'Member account was not found for Auto Ship cancellation.',
    };
  }

  const existingSetting = await readUserAutoShipSettingByUserId(matchedUser.id);
  if (!existingSetting || !normalizeText(existingSetting.stripeSubscriptionId)) {
    return {
      success: false,
      status: 404,
      error: 'Auto Ship subscription was not found for this account.',
    };
  }

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

  const cancelImmediately = payload?.cancelImmediately !== false;
  let subscription = null;
  try {
    if (cancelImmediately) {
      subscription = await stripe.subscriptions.cancel(existingSetting.stripeSubscriptionId);
    } else {
      subscription = await stripe.subscriptions.update(existingSetting.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    }
  } catch (error) {
    return {
      success: false,
      status: 502,
      error: error instanceof Error
        ? error.message
        : 'Unable to cancel Auto Ship subscription.',
    };
  }

  const nextStatus = cancelImmediately
    ? 'canceled'
    : normalizeAutoShipStatusFromStripeStatus(subscription?.status || existingSetting?.status);
  const canceledAt = cancelImmediately
    ? new Date().toISOString()
    : toIsoFromUnixSeconds(subscription?.canceled_at) || toIsoStringOrEmpty(existingSetting?.canceledAt);

  const updatedSetting = await upsertUserAutoShipSetting({
    ...existingSetting,
    userId: matchedUser.id,
    username: matchedUser.username,
    email: matchedUser.email,
    stripeSubscriptionStatus: normalizeText(subscription?.status || existingSetting?.stripeSubscriptionStatus),
    status: nextStatus,
    canceledAt: canceledAt || null,
    currentPeriodStart: toIsoFromUnixSeconds(subscription?.current_period_start) || existingSetting?.currentPeriodStart,
    currentPeriodEnd: toIsoFromUnixSeconds(subscription?.current_period_end) || existingSetting?.currentPeriodEnd,
    nextBillingDate: cancelImmediately
      ? ''
      : resolveAutoShipNextBillingDateFromSubscription(subscription) || existingSetting?.nextBillingDate,
    metadata: {
      ...(existingSetting?.metadata || {}),
      canceledBy: 'member',
      canceledAt: canceledAt || new Date().toISOString(),
    },
    updatedAt: new Date().toISOString(),
  });

  await insertUserAutoShipEvent({
    userId: matchedUser.id,
    autoShipSettingId: normalizeText(updatedSetting?.id),
    eventType: 'canceled',
    stripeSubscriptionId: normalizeText(existingSetting?.stripeSubscriptionId),
    description: cancelImmediately
      ? 'Auto Ship canceled immediately by member.'
      : 'Auto Ship set to cancel at period end by member.',
    metadata: {
      cancelImmediately,
      subscriptionStatus: normalizeText(subscription?.status),
    },
  }).catch(() => {});

  return {
    success: true,
    status: 200,
    data: buildAutoShipResponsePayload(updatedSetting),
  };
}

export async function updateMemberAutoShipProduct(memberUserInput = {}, payload = {}) {
  await ensureAutoShipTables();

  const matchedUser = await resolveUserFromMemberAuth(memberUserInput);
  if (!matchedUser) {
    return {
      success: false,
      status: 404,
      error: 'Member account was not found for Auto Ship update.',
    };
  }

  const existingSetting = await readUserAutoShipSettingByUserId(matchedUser.id);
  if (!existingSetting || !normalizeText(existingSetting.stripeSubscriptionId)) {
    return {
      success: false,
      status: 404,
      error: 'Auto Ship subscription was not found for this account.',
    };
  }

  const existingStatus = normalizeCredential(existingSetting.status);
  if (existingStatus !== 'active' && existingStatus !== 'past_due') {
    return {
      success: false,
      status: 409,
      error: 'Auto Ship product can only be changed while subscription is active or past due.',
      data: buildAutoShipResponsePayload(existingSetting),
    };
  }

  const requestedProduct = resolveAutoShipProductOption(payload?.selectedProductKey || payload?.productKey);
  if (!requestedProduct) {
    return {
      success: false,
      status: 400,
      error: 'Select a valid Auto Ship product (MetaCharge™ or MetaRoast™).',
    };
  }

  const existingProductKey = normalizeCredential(existingSetting.selectedProductKey);
  if (requestedProduct.key === existingProductKey) {
    return {
      success: true,
      status: 200,
      data: buildAutoShipResponsePayload(existingSetting),
    };
  }

  const selectedPriceId = resolveAutoShipProductPriceId(requestedProduct.key);
  if (!selectedPriceId) {
    return {
      success: false,
      status: 503,
      error: `Auto Ship price is not configured for ${requestedProduct.name}.`,
    };
  }

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

  const subscription = await retrieveSubscriptionSafe(stripe, existingSetting.stripeSubscriptionId);
  if (!subscription) {
    return {
      success: false,
      status: 404,
      error: 'Stripe subscription could not be found for Auto Ship update.',
    };
  }

  const subscriptionItem = Array.isArray(subscription?.items?.data) ? subscription.items.data[0] : null;
  const subscriptionItemId = normalizeText(subscriptionItem?.id);
  if (!subscriptionItemId) {
    return {
      success: false,
      status: 409,
      error: 'Stripe subscription item is missing. Unable to change Auto Ship product.',
    };
  }

  let updatedSubscription = null;
  try {
    updatedSubscription = await stripe.subscriptions.update(subscription.id, {
      items: [
        {
          id: subscriptionItemId,
          price: selectedPriceId,
        },
      ],
      proration_behavior: 'none',
      metadata: resolveSafeMetadataMap({
        ...(subscription?.metadata || {}),
        autoship_product_key: requestedProduct.key,
        autoship_product_name: requestedProduct.name,
      }),
    }, {
      idempotencyKey: `autoship-product-update:${subscription.id}:${requestedProduct.key}`,
    });
  } catch (error) {
    return {
      success: false,
      status: 502,
      error: error instanceof Error
        ? error.message
        : 'Unable to change Auto Ship product.',
    };
  }

  const refreshedSubscription = await retrieveSubscriptionSafe(
    stripe,
    normalizeText(updatedSubscription?.id || subscription.id),
  );
  const resolvedSubscription = refreshedSubscription || updatedSubscription || subscription;
  const updatedSetting = await upsertAutoShipSettingFromSubscription({
    user: matchedUser,
    subscription: resolvedSubscription,
    setting: existingSetting,
    metadata: {
      productUpdatedBy: 'member',
      updatedProductKey: requestedProduct.key,
    },
  });

  await insertUserAutoShipEvent({
    userId: matchedUser.id,
    autoShipSettingId: normalizeText(updatedSetting?.id),
    eventType: 'product_changed',
    stripeSubscriptionId: normalizeText(updatedSetting?.stripeSubscriptionId),
    description: `Auto Ship product changed to ${requestedProduct.name}.`,
    metadata: {
      previousProductKey: existingProductKey,
      nextProductKey: requestedProduct.key,
      nextProductName: requestedProduct.name,
    },
  }).catch(() => {});

  return {
    success: true,
    status: 200,
    data: buildAutoShipResponsePayload(updatedSetting),
  };
}

export async function handleAutoShipCheckoutSessionCompleted(checkoutSession = null, event = null) {
  await ensureAutoShipTables();

  const session = checkoutSession && typeof checkoutSession === 'object'
    ? checkoutSession
    : null;
  if (!session?.id) {
    return {
      handled: false,
      reason: 'empty-checkout-session',
    };
  }

  const metadata = session?.metadata && typeof session.metadata === 'object'
    ? session.metadata
    : {};
  const isAutoShip = isAutoShipMetadata(metadata) || normalizeCredential(session?.mode) === 'subscription';
  if (!isAutoShip) {
    return {
      handled: false,
      reason: 'not-autoship-checkout',
    };
  }

  let stripe = null;
  try {
    stripe = resolveStripeClient();
  } catch (error) {
    return {
      handled: false,
      reason: error instanceof Error ? error.message : 'stripe-unavailable',
    };
  }

  const identity = resolveUserIdentityFromMetadata(metadata, {
    userId: normalizeText(session?.client_reference_id),
    email: normalizeEmail(session?.customer_details?.email),
  });
  const matchedUser = await resolveUserFromIdentity(identity);
  if (!matchedUser) {
    return {
      handled: false,
      reason: 'autoship-user-not-found',
    };
  }

  const subscriptionId = normalizeText(session?.subscription);
  const subscription = await retrieveSubscriptionSafe(stripe, subscriptionId);
  if (!subscription?.id) {
    return {
      handled: false,
      reason: 'autoship-subscription-not-found',
    };
  }

  await linkStripeCustomerToUserIdentity({
    customerId: resolveStripeCustomerId(session?.customer),
    userId: matchedUser.id,
    username: matchedUser.username,
    email: matchedUser.email,
  }).catch(() => {});

  const existingSetting = await readUserAutoShipSettingByUserId(matchedUser.id);
  const updatedSetting = await upsertAutoShipSettingFromSubscription({
    user: matchedUser,
    subscription,
    setting: {
      ...(existingSetting || {}),
      latestCheckoutSessionId: normalizeText(session.id),
    },
    metadata: {
      checkoutSessionId: normalizeText(session.id),
      setupCompletedAt: new Date().toISOString(),
    },
  });

  await insertUserAutoShipEvent({
    userId: matchedUser.id,
    autoShipSettingId: normalizeText(updatedSetting?.id),
    eventType: 'checkout_completed',
    stripeEventId: normalizeText(event?.id),
    stripeSubscriptionId: normalizeText(updatedSetting?.stripeSubscriptionId),
    description: 'Auto Ship setup completed via Stripe Checkout.',
    metadata: {
      checkoutSessionId: normalizeText(session.id),
      subscriptionId: normalizeText(updatedSetting?.stripeSubscriptionId),
    },
  }).catch(() => {});

  return {
    handled: true,
    category: 'autoship-checkout',
    userId: normalizeText(matchedUser?.id),
    stripeSubscriptionId: normalizeText(updatedSetting?.stripeSubscriptionId),
    settingStatus: normalizeText(updatedSetting?.status),
  };
}

export async function handleAutoShipSubscriptionUpdated(subscriptionObject = null, event = null) {
  await ensureAutoShipTables();

  const subscription = subscriptionObject && typeof subscriptionObject === 'object'
    ? subscriptionObject
    : null;
  if (!subscription?.id) {
    return {
      handled: false,
      reason: 'empty-subscription',
    };
  }

  const metadata = subscription?.metadata && typeof subscription.metadata === 'object'
    ? subscription.metadata
    : {};
  const isAutoShip = isAutoShipMetadata(metadata);
  const subscriptionId = normalizeText(subscription.id);
  const customerId = resolveStripeCustomerId(subscription.customer);

  let setting = await readUserAutoShipSettingBySubscriptionId(subscriptionId);
  if (!setting && customerId) {
    setting = await readUserAutoShipSettingByCustomerId(customerId);
  }
  if (!setting && !isAutoShip) {
    return {
      handled: false,
      reason: 'not-autoship-subscription',
    };
  }

  let matchedUser = null;
  if (setting?.userId) {
    matchedUser = await findUserById(setting.userId);
  }

  if (!matchedUser) {
    const identity = resolveUserIdentityFromMetadata(metadata);
    matchedUser = await resolveUserFromIdentity(identity);
  }

  if (!matchedUser) {
    return {
      handled: false,
      reason: 'autoship-subscription-user-not-found',
    };
  }

  const mergedSetting = await upsertAutoShipSettingFromSubscription({
    user: matchedUser,
    subscription,
    setting: setting || {
      userId: matchedUser.id,
      username: matchedUser.username,
      email: matchedUser.email,
      stripeCustomerId: customerId,
    },
    metadata: {
      subscriptionWebhookType: normalizeText(event?.type),
    },
  });

  const eventType = normalizeText(event?.type);
  const normalizedStatus = normalizeAutoShipStatusFromStripeStatus(subscription?.status);
  const autoShipEventType = eventType === 'customer.subscription.deleted'
    ? 'subscription_canceled'
    : 'subscription_updated';
  const description = eventType === 'customer.subscription.deleted'
    ? 'Auto Ship subscription canceled from Stripe.'
    : `Auto Ship subscription updated (status: ${normalizedStatus}).`;

  await insertUserAutoShipEvent({
    userId: matchedUser.id,
    autoShipSettingId: normalizeText(mergedSetting?.id),
    eventType: autoShipEventType,
    stripeEventId: normalizeText(event?.id),
    stripeSubscriptionId: subscriptionId,
    description,
    metadata: {
      stripeStatus: normalizeText(subscription?.status),
      status: normalizedStatus,
    },
  }).catch(() => {});

  return {
    handled: true,
    category: 'autoship-subscription',
    userId: matchedUser.id,
    stripeSubscriptionId: subscriptionId,
    status: normalizedStatus,
  };
}

export async function handleAutoShipInvoicePaymentSucceeded(invoiceObject = null, event = null) {
  await ensureAutoShipTables();

  const invoice = invoiceObject && typeof invoiceObject === 'object'
    ? invoiceObject
    : null;
  if (!invoice?.id) {
    return {
      handled: false,
      reason: 'empty-invoice',
    };
  }

  const metadata = invoice?.metadata && typeof invoice.metadata === 'object'
    ? invoice.metadata
    : {};
  const subscriptionId = normalizeText(invoice?.subscription);
  const customerId = resolveStripeCustomerId(invoice?.customer);

  let setting = null;
  if (subscriptionId) {
    setting = await readUserAutoShipSettingBySubscriptionId(subscriptionId);
  }
  if (!setting && customerId) {
    setting = await readUserAutoShipSettingByCustomerId(customerId);
  }
  if (!setting && !isAutoShipMetadata(metadata)) {
    return {
      handled: false,
      reason: 'not-autoship-invoice',
    };
  }

  let matchedUser = null;
  if (setting?.userId) {
    matchedUser = await findUserById(setting.userId);
  }
  if (!matchedUser) {
    const identity = resolveUserIdentityFromMetadata(metadata, {
      email: normalizeEmail(invoice?.customer_email),
    });
    matchedUser = await resolveUserFromIdentity(identity);
  }
  if (!matchedUser) {
    return {
      handled: false,
      reason: 'autoship-invoice-user-not-found',
    };
  }

  const existingInvoiceRecord = await resolveExistingStoreInvoiceForStripeInvoice(
    normalizeText(invoice.id),
    normalizeText(matchedUser.id),
  );
  const earlySelectedProduct = resolveProductFromInvoice(
    invoice,
    setting?.selectedProductKey || '',
  ) || resolveAutoShipProductOption(setting?.selectedProductKey || '');
  const earlyMonthlyPrice = resolvePriceFromInvoice(
    invoice,
    setting?.monthlyPrice || earlySelectedProduct?.fallbackMonthlyPrice || 0,
  );
  if (existingInvoiceRecord) {
    await ensureLedgerTables().catch(() => {});
    await insertLedgerEntry({
      userId: normalizeText(matchedUser.id),
      username: normalizeText(matchedUser.username),
      email: normalizeEmail(matchedUser.email),
      type: LEDGER_ENTRY_TYPES.ADJUSTMENT,
      direction: LEDGER_ENTRY_DIRECTIONS.CREDIT,
      amount: 0,
      bvAmount: AUTOSHIP_PRODUCT_BV,
      status: LEDGER_ENTRY_STATUSES.POSTED,
      sourceType: LEDGER_SOURCE_TYPES.ORDER,
      sourceId: normalizeText(invoice?.id || existingInvoiceRecord?.id || `autoship-${Date.now()}`),
      sourceRef: normalizeText(existingInvoiceRecord?.id || invoice?.number || invoice?.id),
      idempotencyKey: `autoship-ledger:${normalizeText(invoice?.id)}:${normalizeText(matchedUser.id)}`,
      description: `Auto Ship ${earlySelectedProduct?.name || 'product'} purchase posted (${AUTOSHIP_PRODUCT_BV} BV credited).`,
      metadata: {
        category: 'autoship_purchase',
        stripeInvoiceId: normalizeText(invoice?.id),
        stripeSubscriptionId: normalizeText(subscriptionId || setting?.stripeSubscriptionId),
        selectedProductKey: normalizeText(earlySelectedProduct?.key || setting?.selectedProductKey),
        selectedProductName: normalizeText(earlySelectedProduct?.name || setting?.selectedProductName),
        monthlyPrice: earlyMonthlyPrice,
        creditedBv: AUTOSHIP_PRODUCT_BV,
        backfilledFromExistingInvoice: true,
      },
    }).catch(() => null);

    await insertUserAutoShipEvent({
      userId: matchedUser.id,
      autoShipSettingId: normalizeText(setting?.id),
      eventType: 'payment_succeeded',
      stripeInvoiceId: normalizeText(invoice?.id),
      stripeSubscriptionId: normalizeText(setting?.stripeSubscriptionId || subscriptionId),
      description: `Auto Ship payment succeeded and credited ${AUTOSHIP_PRODUCT_BV} Personal BV.`,
      metadata: {
        monthlyPrice: earlyMonthlyPrice,
        productKey: earlySelectedProduct?.key || normalizeText(setting?.selectedProductKey),
        productName: earlySelectedProduct?.name || normalizeText(setting?.selectedProductName),
        backfilledFromExistingInvoice: true,
      },
    }).catch(() => {});

    return {
      handled: true,
      idempotent: true,
      category: 'autoship-invoice',
      userId: matchedUser.id,
      stripeInvoiceId: normalizeText(invoice.id),
    };
  }

  let stripe = null;
  try {
    stripe = resolveStripeClient();
  } catch {
    stripe = null;
  }

  let subscription = null;
  if (stripe && subscriptionId) {
    subscription = await retrieveSubscriptionSafe(stripe, subscriptionId);
  }

  const selectedProduct = resolveProductFromInvoice(
    invoice,
    setting?.selectedProductKey
      || subscription?.metadata?.autoship_product_key
      || '',
  ) || resolveAutoShipProductOption(setting?.selectedProductKey || '');
  const monthlyPrice = resolvePriceFromInvoice(
    invoice,
    setting?.monthlyPrice || selectedProduct?.fallbackMonthlyPrice || 0,
  );
  const stripePaymentStatus = normalizeText(invoice?.status || invoice?.collection_status || 'paid');

  const purchaseResult = await recordMemberPurchase({
    userId: matchedUser.id,
    username: matchedUser.username,
    email: matchedUser.email,
    pvGain: AUTOSHIP_PRODUCT_BV,
  }, {
    persistMode: 'upsert',
  });

  if (!purchaseResult?.success) {
    return {
      handled: false,
      reason: normalizeText(purchaseResult?.error) || 'autoship-purchase-credit-failed',
    };
  }

  const invoiceResult = await createStoreInvoice({
    buyer: normalizeText(matchedUser?.name || matchedUser?.username || matchedUser?.email || 'Auto Ship Member'),
    buyerUserId: normalizeText(matchedUser.id),
    buyerUsername: normalizeText(matchedUser.username),
    buyerEmail: normalizeEmail(matchedUser.email),
    buyerPackageKey: `autoship_${selectedProduct?.key || 'product'}`,
    attributionKey: normalizeText(matchedUser?.attributionStoreCode || matchedUser?.storeCode || 'REGISTRATION_LOCKED'),
    amount: monthlyPrice,
    bp: AUTOSHIP_PRODUCT_BV,
    retailCommission: monthlyPrice,
    discount: 0,
    stripeCustomerId: customerId,
    stripePaymentIntentId: normalizeText(invoice?.payment_intent),
    stripeInvoiceId: normalizeText(invoice?.id),
    stripeInvoiceNumber: normalizeText(invoice?.number),
    stripeInvoiceHostedUrl: normalizeText(invoice?.hosted_invoice_url),
    stripeInvoicePdfUrl: normalizeText(invoice?.invoice_pdf),
    stripePaymentStatus,
    status: 'Posted',
  });

  if (!invoiceResult?.success && invoiceResult?.status !== 409) {
    await syncStoreInvoiceStripeDetails({
      stripeCustomerId: customerId,
      stripePaymentIntentId: normalizeText(invoice?.payment_intent),
      stripeInvoiceId: normalizeText(invoice?.id),
      stripeInvoiceNumber: normalizeText(invoice?.number),
      stripeInvoiceHostedUrl: normalizeText(invoice?.hosted_invoice_url),
      stripeInvoicePdfUrl: normalizeText(invoice?.invoice_pdf),
      stripePaymentStatus,
    }).catch(() => {});
  }

  await ensureLedgerTables().catch(() => {});
  await insertLedgerEntry({
    userId: normalizeText(matchedUser.id),
    username: normalizeText(matchedUser.username),
    email: normalizeEmail(matchedUser.email),
    type: LEDGER_ENTRY_TYPES.ADJUSTMENT,
    direction: LEDGER_ENTRY_DIRECTIONS.CREDIT,
    amount: 0,
    bvAmount: AUTOSHIP_PRODUCT_BV,
    status: LEDGER_ENTRY_STATUSES.POSTED,
    sourceType: LEDGER_SOURCE_TYPES.ORDER,
    sourceId: normalizeText(invoice?.id || invoiceResult?.data?.invoice?.id || `autoship-${Date.now()}`),
    sourceRef: normalizeText(invoiceResult?.data?.invoice?.id || invoice?.number || invoice?.id),
    idempotencyKey: `autoship-ledger:${normalizeText(invoice?.id)}:${normalizeText(matchedUser.id)}`,
    description: `Auto Ship ${selectedProduct?.name || 'product'} purchase posted (${AUTOSHIP_PRODUCT_BV} BV credited).`,
    metadata: {
      category: 'autoship_purchase',
      stripeInvoiceId: normalizeText(invoice?.id),
      stripeSubscriptionId: normalizeText(subscriptionId || setting?.stripeSubscriptionId),
      selectedProductKey: normalizeText(selectedProduct?.key || setting?.selectedProductKey),
      selectedProductName: normalizeText(selectedProduct?.name || setting?.selectedProductName),
      monthlyPrice,
      creditedBv: AUTOSHIP_PRODUCT_BV,
    },
  }).catch(() => null);

  const existingSetting = setting || await readUserAutoShipSettingByUserId(matchedUser.id);
  const updatedSetting = await upsertUserAutoShipSetting({
    ...(existingSetting || {}),
    userId: matchedUser.id,
    username: matchedUser.username,
    email: matchedUser.email,
    stripeCustomerId: customerId || normalizeText(existingSetting?.stripeCustomerId),
    stripeSubscriptionId: subscriptionId || normalizeText(existingSetting?.stripeSubscriptionId),
    stripeSubscriptionStatus: normalizeText(
      subscription?.status
      || existingSetting?.stripeSubscriptionStatus
      || 'active',
    ),
    selectedProductKey: selectedProduct?.key || normalizeText(existingSetting?.selectedProductKey),
    selectedProductName: selectedProduct?.name || normalizeText(existingSetting?.selectedProductName),
    monthlyPrice,
    status: 'active',
    currentPeriodStart: resolveAutoShipSubscriptionCurrentPeriodStart(subscription)
      || toIsoStringOrEmpty(existingSetting?.currentPeriodStart)
      || toIsoStringOrEmpty(invoice?.period_start),
    currentPeriodEnd: resolveAutoShipSubscriptionCurrentPeriodEnd(subscription)
      || toIsoStringOrEmpty(existingSetting?.currentPeriodEnd)
      || toIsoStringOrEmpty(invoice?.period_end),
    nextBillingDate: resolveAutoShipNextBillingDateFromSubscription(subscription)
      || toIsoStringOrEmpty(invoice?.period_end)
      || toIsoStringOrEmpty(existingSetting?.nextBillingDate),
    latestInvoiceId: normalizeText(invoice?.id),
    latestPaymentIntentId: normalizeText(invoice?.payment_intent),
    failureMessage: '',
    metadata: {
      ...(existingSetting?.metadata || {}),
      lastSuccessfulInvoiceId: normalizeText(invoice?.id),
      lastSuccessfulInvoiceAt: new Date().toISOString(),
    },
    updatedAt: new Date().toISOString(),
  });

  await insertUserAutoShipEvent({
    userId: matchedUser.id,
    autoShipSettingId: normalizeText(updatedSetting?.id),
    eventType: 'payment_succeeded',
    stripeEventId: normalizeText(event?.id),
    stripeInvoiceId: normalizeText(invoice?.id),
    stripeSubscriptionId: normalizeText(updatedSetting?.stripeSubscriptionId),
    description: `Auto Ship payment succeeded and credited ${AUTOSHIP_PRODUCT_BV} Personal BV.`,
    metadata: {
      monthlyPrice,
      productKey: selectedProduct?.key || normalizeText(updatedSetting?.selectedProductKey),
      productName: selectedProduct?.name || normalizeText(updatedSetting?.selectedProductName),
      purchaseResult: {
        currentPersonalPvBv: Number(purchaseResult?.purchase?.currentPersonalPvBv || 0),
        starterPersonalPv: Number(purchaseResult?.purchase?.starterPersonalPv || 0),
      },
      invoiceId: normalizeText(invoiceResult?.data?.invoice?.id),
    },
  }).catch(() => {});

  return {
    handled: true,
    category: 'autoship-invoice',
    userId: matchedUser.id,
    stripeInvoiceId: normalizeText(invoice?.id),
    stripeSubscriptionId: normalizeText(updatedSetting?.stripeSubscriptionId),
    monthlyPrice,
    bvCredited: AUTOSHIP_PRODUCT_BV,
  };
}

export async function handleAutoShipInvoicePaymentFailed(invoiceObject = null, event = null) {
  await ensureAutoShipTables();

  const invoice = invoiceObject && typeof invoiceObject === 'object'
    ? invoiceObject
    : null;
  if (!invoice?.id) {
    return {
      handled: false,
      reason: 'empty-invoice',
    };
  }

  const metadata = invoice?.metadata && typeof invoice.metadata === 'object'
    ? invoice.metadata
    : {};
  const subscriptionId = normalizeText(invoice?.subscription);
  const customerId = resolveStripeCustomerId(invoice?.customer);

  let setting = null;
  if (subscriptionId) {
    setting = await readUserAutoShipSettingBySubscriptionId(subscriptionId);
  }
  if (!setting && customerId) {
    setting = await readUserAutoShipSettingByCustomerId(customerId);
  }
  if (!setting && !isAutoShipMetadata(metadata)) {
    return {
      handled: false,
      reason: 'not-autoship-invoice',
    };
  }

  let matchedUser = null;
  if (setting?.userId) {
    matchedUser = await findUserById(setting.userId);
  }
  if (!matchedUser) {
    const identity = resolveUserIdentityFromMetadata(metadata, {
      email: normalizeEmail(invoice?.customer_email),
    });
    matchedUser = await resolveUserFromIdentity(identity);
  }
  if (!matchedUser) {
    return {
      handled: false,
      reason: 'autoship-invoice-user-not-found',
    };
  }

  const selectedProduct = resolveProductFromInvoice(invoice, setting?.selectedProductKey || '')
    || resolveAutoShipProductOption(setting?.selectedProductKey || '');
  const monthlyPrice = resolvePriceFromInvoice(invoice, setting?.monthlyPrice || selectedProduct?.fallbackMonthlyPrice || 0);
  const failureMessage = normalizeText(
    invoice?.last_finalization_error?.message
    || invoice?.last_payment_error?.message
    || 'Stripe payment failed for Auto Ship. Update billing details to continue.',
  );

  const updatedSetting = await upsertUserAutoShipSetting({
    ...(setting || {}),
    userId: matchedUser.id,
    username: matchedUser.username,
    email: matchedUser.email,
    stripeCustomerId: customerId || normalizeText(setting?.stripeCustomerId),
    stripeSubscriptionId: subscriptionId || normalizeText(setting?.stripeSubscriptionId),
    stripeSubscriptionStatus: normalizeText(setting?.stripeSubscriptionStatus || 'past_due'),
    selectedProductKey: selectedProduct?.key || normalizeText(setting?.selectedProductKey),
    selectedProductName: selectedProduct?.name || normalizeText(setting?.selectedProductName),
    monthlyPrice,
    status: 'past_due',
    latestInvoiceId: normalizeText(invoice?.id),
    latestPaymentIntentId: normalizeText(invoice?.payment_intent),
    failureMessage,
    metadata: {
      ...(setting?.metadata || {}),
      lastFailedInvoiceId: normalizeText(invoice?.id),
      lastFailedInvoiceAt: new Date().toISOString(),
    },
    updatedAt: new Date().toISOString(),
  });

  await insertUserAutoShipEvent({
    userId: matchedUser.id,
    autoShipSettingId: normalizeText(updatedSetting?.id),
    eventType: 'payment_failed',
    stripeEventId: normalizeText(event?.id),
    stripeInvoiceId: normalizeText(invoice?.id),
    stripeSubscriptionId: normalizeText(updatedSetting?.stripeSubscriptionId),
    description: 'Auto Ship payment failed.',
    metadata: {
      failureMessage,
      monthlyPrice,
      productKey: selectedProduct?.key || normalizeText(updatedSetting?.selectedProductKey),
    },
  }).catch(() => {});

  return {
    handled: true,
    category: 'autoship-invoice-failed',
    userId: matchedUser.id,
    stripeInvoiceId: normalizeText(invoice?.id),
    stripeSubscriptionId: normalizeText(updatedSetting?.stripeSubscriptionId),
  };
}

export async function handleAutoShipSubscriptionDeleted(subscriptionObject = null, event = null) {
  return handleAutoShipSubscriptionUpdated(subscriptionObject, event);
}

export function isAutoShipStripeMetadataCandidate(metadata = {}) {
  return isAutoShipMetadata(metadata);
}
