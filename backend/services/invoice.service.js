import {
  readMockStoreInvoicesStore,
  writeMockStoreInvoicesStore,
  resolveNextStoreInvoiceId,
  sanitizeStoreInvoiceRecord,
} from '../stores/invoice.store.js';
import { readMockUsersStore } from '../stores/user.store.js';
import { normalizeStorePackageKey } from '../utils/store-product-earnings.helpers.js';

const LEGACY_STORE_CODE_ALIASES = Object.freeze({
  'CHG-7X42': 'CHG-ZERO',
});

function normalizeText(value) {
  return String(value || '').trim();
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

function normalizeStoreInvoiceStatus(value) {
  const normalized = normalizeText(value).toLowerCase();
  return normalized === 'posted' ? 'Posted' : 'Pending';
}

function normalizeStoreCode(value) {
  const normalizedValue = String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '');
  return LEGACY_STORE_CODE_ALIASES[normalizedValue] || normalizedValue;
}

function roundCurrencyAmount(value) {
  return Math.round((Math.max(0, Number(value) || 0) + Number.EPSILON) * 100) / 100;
}

function normalizeJsonObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return value;
}

function resolveStoreCodeFromLink(linkValue) {
  const normalizedLink = String(linkValue || '').trim();
  if (!normalizedLink) {
    return '';
  }

  try {
    const parsedUrl = normalizedLink.includes('://')
      ? new URL(normalizedLink)
      : new URL(normalizedLink, 'https://shop.charge.com');
    const queryCode = normalizeStoreCode(parsedUrl.searchParams.get('store') || '');
    return queryCode;
  } catch {
    return '';
  }
}

function resolveStoreOwnerByAttributionCode(users, storeCode) {
  const normalizedStoreCode = normalizeStoreCode(storeCode);
  if (!normalizedStoreCode) {
    return null;
  }

  const safeUsers = Array.isArray(users) ? users : [];
  const directStoreOwner = safeUsers.find((user) => {
    const ownerStoreCode = normalizeStoreCode(user?.storeCode);
    const ownerPublicStoreCode = normalizeStoreCode(user?.publicStoreCode);
    return ownerStoreCode === normalizedStoreCode || ownerPublicStoreCode === normalizedStoreCode;
  });
  if (directStoreOwner) {
    return directStoreOwner;
  }

  const attributionMatches = safeUsers.filter((user) => (
    normalizeStoreCode(user?.attributionStoreCode) === normalizedStoreCode
  ));
  if (attributionMatches.length === 1) {
    return attributionMatches[0];
  }

  return null;
}

export async function getStoreInvoices() {
  const invoices = await readMockStoreInvoicesStore();
  return {
    success: true,
    status: 200,
    data: { invoices },
  };
}

export async function createStoreInvoice(payload = {}) {
  const requestedInvoiceId = normalizeText(payload.invoiceId || payload.id).toUpperCase();
  const buyer = normalizeText(payload.buyer);
  const buyerUserId = normalizeText(payload.buyerUserId);
  const buyerUsername = normalizeText(payload.buyerUsername);
  const buyerEmail = normalizeText(payload.buyerEmail);
  const rawAttributionKey = normalizeStoreCode(payload.attributionKey);
  const memberStoreCode = normalizeStoreCode(payload.memberStoreCode);
  const memberStoreCodeFromLink = resolveStoreCodeFromLink(payload.memberStoreLink);
  if (
    memberStoreCode
    && memberStoreCodeFromLink
    && memberStoreCode !== memberStoreCodeFromLink
  ) {
    return {
      success: false,
      status: 400,
      error: 'Store code does not match store link. Please verify attribution details.',
    };
  }

  const attributionKey = rawAttributionKey || memberStoreCode || memberStoreCodeFromLink || 'REGISTRATION_LOCKED';
  const amount = Number(payload.amount);
  const buyerPackageKey = normalizeStorePackageKey(payload.buyerPackageKey);
  const retailCommission = roundCurrencyAmount(
    payload.retailCommission
      ?? payload.commission
      ?? payload.ownerRetailCommission
      ?? amount,
  );
  const bp = Math.max(0, Math.floor(Number(payload.bp) || 0));
  const discount = Number(payload.discount);
  const attributionSnapshot = normalizeJsonObject(payload.attributionSnapshot);
  const settlementProfile = normalizeJsonObject(payload.settlementProfile);
  const stripeCustomerId = normalizeText(payload.stripeCustomerId);
  const stripeCheckoutSessionId = normalizeText(payload.stripeCheckoutSessionId);
  const stripePaymentIntentId = normalizeText(payload.stripePaymentIntentId);
  const stripeInvoiceId = normalizeText(payload.stripeInvoiceId);
  const stripeInvoiceNumber = normalizeText(payload.stripeInvoiceNumber);
  const stripeInvoiceHostedUrl = normalizeStripeUrl(payload.stripeInvoiceHostedUrl);
  const stripeInvoicePdfUrl = normalizeStripeUrl(payload.stripeInvoicePdfUrl);
  const stripePaymentStatus = normalizeText(payload.stripePaymentStatus);
  const status = normalizeStoreInvoiceStatus(payload.status);

  if (!buyer) {
    return {
      success: false,
      status: 400,
      error: 'Buyer is required to create a store invoice.',
    };
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return {
      success: false,
      status: 400,
      error: 'Invoice amount must be greater than 0.',
    };
  }

  const users = await readMockUsersStore();
  const providedMemberStoreCode = memberStoreCode || memberStoreCodeFromLink;
  if (providedMemberStoreCode) {
    const matchedMemberStoreOwner = resolveStoreOwnerByAttributionCode(users, providedMemberStoreCode);
    if (!matchedMemberStoreOwner) {
      return {
        success: false,
        status: 404,
        error: 'Member store code was not found. Please verify the store code.',
      };
    }
  }

  const attributionOwner = resolveStoreOwnerByAttributionCode(users, attributionKey);
  const invoices = await readMockStoreInvoicesStore();
  const invoiceId = requestedInvoiceId || resolveNextStoreInvoiceId(invoices);
  const existingInvoice = invoices.find((invoice) => (
    normalizeText(invoice?.id).toUpperCase() === invoiceId
  ));
  if (existingInvoice) {
    return {
      success: false,
      status: 409,
      error: `Invoice ${invoiceId} already exists.`,
    };
  }
  const createdAt = new Date().toISOString();

  const createdInvoice = sanitizeStoreInvoiceRecord({
    id: invoiceId,
    buyer,
    buyerUserId,
    buyerUsername,
    buyerEmail,
    buyerPackageKey,
    attributionKey,
    amount,
    retailCommission,
    bp,
    discount: Number.isFinite(discount) ? discount : 0,
    attributionSnapshot,
    settlementProfile,
    stripeCustomerId,
    stripeCheckoutSessionId,
    stripePaymentIntentId,
    stripeInvoiceId,
    stripeInvoiceNumber,
    stripeInvoiceHostedUrl,
    stripeInvoicePdfUrl,
    stripePaymentStatus,
    status,
    createdAt,
  }, invoiceId);

  if (!createdInvoice) {
    return {
      success: false,
      status: 500,
      error: 'Unable to create invoice payload.',
    };
  }

  invoices.unshift(createdInvoice);
  await writeMockStoreInvoicesStore(invoices);

  return {
    success: true,
    status: 201,
    data: {
      success: true,
      invoice: createdInvoice,
      attributionOwner: attributionOwner
        ? {
            userId: attributionOwner.id || '',
            username: attributionOwner.username || '',
            email: attributionOwner.email || '',
            name: attributionOwner.name || attributionOwner.username || 'Store Owner',
            storeCode: attributionOwner.storeCode || '',
            publicStoreCode: attributionOwner.publicStoreCode || '',
          }
        : null,
    },
  };
}

export async function syncStoreInvoiceStripeDetails(payload = {}) {
  const invoiceId = normalizeText(payload.invoiceId).toUpperCase();
  const stripeCheckoutSessionId = normalizeText(payload.stripeCheckoutSessionId);
  const stripePaymentIntentId = normalizeText(payload.stripePaymentIntentId);
  const stripeInvoiceId = normalizeText(payload.stripeInvoiceId);

  const hasLookupKey = Boolean(invoiceId || stripeCheckoutSessionId || stripePaymentIntentId || stripeInvoiceId);
  if (!hasLookupKey) {
    return {
      success: false,
      status: 400,
      error: 'Invoice sync requires invoiceId or Stripe reference identifiers.',
    };
  }

  const invoices = await readMockStoreInvoicesStore();
  const invoiceIndex = invoices.findIndex((invoice) => {
    if (!invoice || typeof invoice !== 'object') {
      return false;
    }

    if (invoiceId && normalizeText(invoice.id).toUpperCase() === invoiceId) {
      return true;
    }

    if (
      stripeCheckoutSessionId
      && normalizeText(invoice.stripeCheckoutSessionId) === stripeCheckoutSessionId
    ) {
      return true;
    }

    if (
      stripePaymentIntentId
      && normalizeText(invoice.stripePaymentIntentId) === stripePaymentIntentId
    ) {
      return true;
    }

    if (stripeInvoiceId && normalizeText(invoice.stripeInvoiceId) === stripeInvoiceId) {
      return true;
    }

    return false;
  });

  if (invoiceIndex < 0) {
    return {
      success: false,
      status: 404,
      error: 'Store invoice was not found for Stripe synchronization.',
    };
  }

  const existingInvoice = invoices[invoiceIndex];
  const mergedInvoice = sanitizeStoreInvoiceRecord({
    ...existingInvoice,
    stripeCustomerId: normalizeText(payload.stripeCustomerId) || normalizeText(existingInvoice?.stripeCustomerId),
    stripeCheckoutSessionId: stripeCheckoutSessionId || normalizeText(existingInvoice?.stripeCheckoutSessionId),
    stripePaymentIntentId: stripePaymentIntentId || normalizeText(existingInvoice?.stripePaymentIntentId),
    stripeInvoiceId: stripeInvoiceId || normalizeText(existingInvoice?.stripeInvoiceId),
    stripeInvoiceNumber: normalizeText(payload.stripeInvoiceNumber) || normalizeText(existingInvoice?.stripeInvoiceNumber),
    stripeInvoiceHostedUrl: normalizeStripeUrl(payload.stripeInvoiceHostedUrl) || normalizeStripeUrl(existingInvoice?.stripeInvoiceHostedUrl),
    stripeInvoicePdfUrl: normalizeStripeUrl(payload.stripeInvoicePdfUrl) || normalizeStripeUrl(existingInvoice?.stripeInvoicePdfUrl),
    stripePaymentStatus: normalizeText(payload.stripePaymentStatus) || normalizeText(existingInvoice?.stripePaymentStatus),
  }, normalizeText(existingInvoice?.id));

  if (!mergedInvoice) {
    return {
      success: false,
      status: 500,
      error: 'Unable to build synced store invoice payload.',
    };
  }

  invoices[invoiceIndex] = mergedInvoice;
  await writeMockStoreInvoicesStore(invoices);

  return {
    success: true,
    status: 200,
    data: {
      success: true,
      invoice: mergedInvoice,
    },
  };
}
