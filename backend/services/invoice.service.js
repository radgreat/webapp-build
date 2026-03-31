import {
  readMockStoreInvoicesStore,
  writeMockStoreInvoicesStore,
  resolveNextStoreInvoiceId,
  sanitizeStoreInvoiceRecord,
} from '../stores/invoice.store.js';
import { readMockUsersStore } from '../stores/user.store.js';

const LEGACY_STORE_CODE_ALIASES = Object.freeze({
  'CHG-7X42': 'CHG-ZERO',
});

function normalizeText(value) {
  return String(value || '').trim();
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

  return (Array.isArray(users) ? users : []).find((user) => {
    const candidateCodes = [
      user?.storeCode,
      user?.publicStoreCode,
      user?.attributionStoreCode,
    ].map((candidate) => normalizeStoreCode(candidate));

    return candidateCodes.includes(normalizedStoreCode);
  }) || null;
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
  const bp = Math.max(0, Math.floor(Number(payload.bp) || 0));
  const discount = Number(payload.discount);
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

  if (bp <= 0) {
    return {
      success: false,
      status: 400,
      error: 'Invoice BP must be greater than 0.',
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
    attributionKey,
    amount,
    bp,
    discount: Number.isFinite(discount) ? discount : 0,
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
