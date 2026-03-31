import pool from '../db/db.js';

function normalizeText(value) {
  return String(value || '').trim();
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
    attributionKey: row.attribution_key || 'REGISTRATION_LOCKED',
    amount: Number(row.amount || 0),
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
    attribution_key: invoice?.attributionKey || 'REGISTRATION_LOCKED',
    amount: Number(invoice?.amount || 0),
    bp: Math.max(0, Math.floor(Number(invoice?.bp) || 0)),
    discount: Number(invoice?.discount || 0),
    status: normalizeStoreInvoiceStatus(invoice?.status),
    created_at: invoice?.createdAt || new Date().toISOString(),
  };
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
    attributionKey: normalizeText(invoice.attributionKey) || 'REGISTRATION_LOCKED',
    amount: Number.isFinite(amountRaw) ? Math.max(0, amountRaw) : 0,
    bp: Math.max(0, Math.floor(Number(invoice.bp) || 0)),
    discount: Number.isFinite(discountRaw) ? Math.max(0, discountRaw) : 0,
    status: normalizeStoreInvoiceStatus(invoice.status),
    createdAt: Number.isFinite(createdAtMs) ? new Date(createdAtMs).toISOString() : new Date().toISOString(),
  };
}

export async function readMockStoreInvoicesStore() {
  const result = await pool.query(`
    SELECT
      id,
      buyer,
      buyer_user_id,
      buyer_username,
      buyer_email,
      attribution_key,
      amount,
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
          attribution_key,
          amount,
          bp,
          discount,
          status,
          created_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      `, [
        row.id,
        row.buyer,
        row.buyer_user_id,
        row.buyer_username,
        row.buyer_email,
        row.attribution_key,
        row.amount,
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