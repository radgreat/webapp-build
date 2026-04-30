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

function normalizeJsonObject(value) {
  if (!value) {
    return {};
  }

  if (typeof value === 'object' && !Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? parsed
        : {};
    } catch {
      return {};
    }
  }

  return {};
}

function mapDbStripeWebhookEvent(row) {
  if (!row) {
    return null;
  }

  return {
    eventId: normalizeText(row.event_id),
    eventType: normalizeText(row.event_type),
    handled: row.handled === true,
    category: normalizeText(row.category),
    reason: normalizeText(row.reason),
    summary: normalizeJsonObject(row.summary_json),
    processedAt: toIsoStringOrEmpty(row.processed_at),
  };
}

let stripeWebhookEventsReady = false;
let stripeWebhookEventsPromise = null;

async function installStripeWebhookEventsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS charge.stripe_webhook_events (
      event_id text PRIMARY KEY,
      event_type text NOT NULL DEFAULT '',
      handled boolean NOT NULL DEFAULT false,
      category text NOT NULL DEFAULT '',
      reason text NOT NULL DEFAULT '',
      summary_json jsonb NOT NULL DEFAULT '{}'::jsonb,
      processed_at timestamptz NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS stripe_webhook_events_processed_at_idx
    ON charge.stripe_webhook_events (processed_at DESC)
  `);
}

export async function ensureStripeWebhookEventTable() {
  if (stripeWebhookEventsReady) {
    return;
  }

  if (stripeWebhookEventsPromise) {
    return stripeWebhookEventsPromise;
  }

  stripeWebhookEventsPromise = (async () => {
    await installStripeWebhookEventsTable();
    stripeWebhookEventsReady = true;
  })().catch((error) => {
    stripeWebhookEventsReady = false;
    throw error;
  }).finally(() => {
    if (!stripeWebhookEventsReady) {
      stripeWebhookEventsPromise = null;
    }
  });

  return stripeWebhookEventsPromise;
}

export async function readStripeWebhookEventByEventId(eventIdInput, executor = pool, options = {}) {
  await ensureStripeWebhookEventTable();

  const eventId = normalizeText(eventIdInput);
  if (!eventId) {
    return null;
  }

  const lockClause = options?.forUpdate === true ? 'FOR UPDATE' : '';
  const result = await executor.query(`
    SELECT
      event_id,
      event_type,
      handled,
      category,
      reason,
      summary_json,
      processed_at
    FROM charge.stripe_webhook_events
    WHERE event_id = $1
    LIMIT 1
    ${lockClause}
  `, [eventId]);

  return mapDbStripeWebhookEvent(result.rows?.[0] || null);
}

export async function insertStripeWebhookEvent(payload = {}, executor = pool) {
  await ensureStripeWebhookEventTable();

  const eventId = normalizeText(payload?.eventId || payload?.id);
  if (!eventId) {
    throw new Error('Stripe webhook event id is required.');
  }

  const eventType = normalizeText(payload?.eventType || payload?.type);
  const handled = payload?.handled === true;
  const category = normalizeText(payload?.category);
  const reason = normalizeText(payload?.reason);
  const summary = normalizeJsonObject(payload?.summary);
  const processedAt = toIsoStringOrEmpty(payload?.processedAt) || new Date().toISOString();

  const result = await executor.query(`
    INSERT INTO charge.stripe_webhook_events (
      event_id,
      event_type,
      handled,
      category,
      reason,
      summary_json,
      processed_at
    )
    VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7::timestamptz)
    ON CONFLICT (event_id)
    DO NOTHING
    RETURNING
      event_id,
      event_type,
      handled,
      category,
      reason,
      summary_json,
      processed_at
  `, [
    eventId,
    eventType,
    handled,
    category,
    reason,
    JSON.stringify(summary),
    processedAt,
  ]);

  const insertedRow = result.rows?.[0] || null;
  if (insertedRow) {
    return {
      event: mapDbStripeWebhookEvent(insertedRow),
      inserted: true,
    };
  }

  const existingEvent = await readStripeWebhookEventByEventId(eventId, executor);
  return {
    event: existingEvent,
    inserted: false,
  };
}
