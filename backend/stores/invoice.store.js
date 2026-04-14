import pool from '../db/db.js';

function normalizeText(value) {
  return String(value || '').trim();
}

function roundCurrency(value) {
  return Math.round((Math.max(0, Number(value) || 0) + Number.EPSILON) * 100) / 100;
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

function normalizeStoreInvoiceStatus(value) {
  const normalized = normalizeText(value).toLowerCase();
  return normalized === 'posted' ? 'Posted' : 'Pending';
}

function mapDbInvoiceToAppInvoice(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    buyer: row.buyer,
    buyerUserId: row.buyer_user_id || '',
    buyerUsername: row.buyer_username || '',
    buyerEmail: row.buyer_email || '',
    buyerPackageKey: normalizeText(row.buyer_package_key),
    attributionKey: row.attribution_key || 'REGISTRATION_LOCKED',
    amount: Number(row.amount || 0),
    retailCommission: roundCurrency(row.retail_commission),
    bp: Number(row.bp || 0),
    discount: Number(row.discount || 0),
    status: normalizeStoreInvoiceStatus(row.status),
    createdAt: toIsoStringOrEmpty(row.created_at),
    updatedAt: toIsoStringOrEmpty(row.updated_at),
  };
}

function mapAppInvoiceToDbInvoice(invoice) {
  return {
    id: invoice?.id || '',
    buyer: invoice?.buyer || 'Store buyer',
    buyer_user_id: invoice?.buyerUserId || null,
    buyer_username: invoice?.buyerUsername || null,
    buyer_email: invoice?.buyerEmail || null,
    buyer_package_key: normalizeText(invoice?.buyerPackageKey),
    attribution_key: invoice?.attributionKey || 'REGISTRATION_LOCKED',
    amount: Number(invoice?.amount || 0),
    retail_commission: roundCurrency(
      invoice?.retailCommission ?? invoice?.amount,
    ),
    bp: Math.max(0, Math.floor(Number(invoice?.bp) || 0)),
    discount: Number(invoice?.discount || 0),
    status: normalizeStoreInvoiceStatus(invoice?.status),
    created_at: invoice?.createdAt || new Date().toISOString(),
  };
}

let storeInvoiceColumnsReady = false;
let storeInvoiceColumnsPromise = null;

async function ensureStoreInvoiceColumns() {
  if (storeInvoiceColumnsReady) {
    return;
  }
  if (storeInvoiceColumnsPromise) {
    return storeInvoiceColumnsPromise;
  }

  storeInvoiceColumnsPromise = (async () => {
    await pool.query(`
      ALTER TABLE charge.store_invoices
      ADD COLUMN IF NOT EXISTS buyer_package_key text NOT NULL DEFAULT ''
    `);
    await pool.query(`
      ALTER TABLE charge.store_invoices
      ADD COLUMN IF NOT EXISTS retail_commission numeric(12,2) NOT NULL DEFAULT 0
    `);
    storeInvoiceColumnsReady = true;
  })().catch((error) => {
    storeInvoiceColumnsReady = false;
    throw error;
  }).finally(() => {
    if (!storeInvoiceColumnsReady) {
      storeInvoiceColumnsPromise = null;
    }
  });

  return storeInvoiceColumnsPromise;
}

function resolveStoreInvoiceSeedValue(invoiceId) {
  const match = normalizeText(invoiceId).toUpperCase().match(/^INV-(\d+)$/);
  if (!match) {
    return 0;
  }

  const parsed = Number.parseInt(match[1], 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function resolveNextStoreInvoiceId(invoices) {
  const highestSeed = (Array.isArray(invoices) ? invoices : []).reduce((maxSeed, invoice) => {
    const seed = resolveStoreInvoiceSeedValue(invoice?.id);
    return seed > maxSeed ? seed : maxSeed;
  }, 240929);

  return `INV-${highestSeed + 1}`;
}

export function sanitizeStoreInvoiceRecord(invoice, fallbackId = '') {
  if (!invoice || typeof invoice !== 'object') {
    return null;
  }

  const nextInvoiceId = normalizeText(invoice.id) || normalizeText(fallbackId) || `INV-${Date.now()}`;
  const amountRaw = Number(invoice.amount);
  const discountRaw = Number(invoice.discount);
  const createdAtRaw = normalizeText(invoice.createdAt);
  const createdAtMs = Date.parse(createdAtRaw);

  return {
    id: nextInvoiceId,
    buyer: normalizeText(invoice.buyer) || 'Store buyer',
    buyerUserId: normalizeText(invoice.buyerUserId),
    buyerUsername: normalizeText(invoice.buyerUsername),
    buyerEmail: normalizeText(invoice.buyerEmail),
    buyerPackageKey: normalizeText(invoice.buyerPackageKey),
    attributionKey: normalizeText(invoice.attributionKey) || 'REGISTRATION_LOCKED',
    amount: Number.isFinite(amountRaw) ? Math.max(0, amountRaw) : 0,
    retailCommission: roundCurrency(invoice.retailCommission ?? amountRaw),
    bp: Math.max(0, Math.floor(Number(invoice.bp) || 0)),
    discount: Number.isFinite(discountRaw) ? Math.max(0, discountRaw) : 0,
    status: normalizeStoreInvoiceStatus(invoice.status),
    createdAt: Number.isFinite(createdAtMs) ? new Date(createdAtMs).toISOString() : new Date().toISOString(),
  };
}

export async function readMockStoreInvoicesStore() {
  await ensureStoreInvoiceColumns();

  const result = await pool.query(`
    SELECT
      id,
      buyer,
      buyer_user_id,
      buyer_username,
      buyer_email,
      buyer_package_key,
      attribution_key,
      amount,
      retail_commission,
      bp,
      discount,
      status,
      created_at,
      updated_at
    FROM charge.store_invoices
    ORDER BY created_at DESC
  `);

  return result.rows.map(mapDbInvoiceToAppInvoice);
}

export async function writeMockStoreInvoicesStore(invoices) {
  await ensureStoreInvoiceColumns();

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM charge.store_invoices');

    for (const invoice of Array.isArray(invoices) ? invoices : []) {
      const row = mapAppInvoiceToDbInvoice(invoice);

      await client.query(`
        INSERT INTO charge.store_invoices (
          id,
          buyer,
          buyer_user_id,
          buyer_username,
          buyer_email,
          buyer_package_key,
          attribution_key,
          amount,
          retail_commission,
          bp,
          discount,
          status,
          created_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      `, [
        row.id,
        row.buyer,
        row.buyer_user_id,
        row.buyer_username,
        row.buyer_email,
        row.buyer_package_key,
        row.attribution_key,
        row.amount,
        row.retail_commission,
        row.bp,
        row.discount,
        row.status,
        row.created_at,
      ]);
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
