import { randomUUID } from 'crypto';
import pool from '../db/db.js';

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeCredential(value) {
  return normalizeText(value).toLowerCase();
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

function roundCurrencyAmount(value, fallback = 0) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return Math.round((Math.max(0, Number(fallback) || 0) + Number.EPSILON) * 100) / 100;
  }

  return Math.round((Math.max(0, parsed) + Number.EPSILON) * 100) / 100;
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

function normalizeAutoShipStatus(value) {
  const normalized = normalizeCredential(value);
  if (normalized === 'active') {
    return 'active';
  }
  if (normalized === 'past_due' || normalized === 'past-due' || normalized === 'past due') {
    return 'past_due';
  }
  if (normalized === 'canceled' || normalized === 'cancelled') {
    return 'canceled';
  }
  return 'inactive';
}

function mapDbAutoShipSetting(row) {
  if (!row) {
    return null;
  }

  return {
    id: normalizeText(row.id),
    userId: normalizeText(row.user_id),
    username: normalizeText(row.username),
    email: normalizeText(row.email),
    stripeCustomerId: normalizeText(row.stripe_customer_id),
    stripeSubscriptionId: normalizeText(row.stripe_subscription_id),
    stripeSubscriptionStatus: normalizeText(row.stripe_subscription_status),
    selectedProductKey: normalizeText(row.selected_product_key),
    selectedProductName: normalizeText(row.selected_product_name),
    monthlyPrice: roundCurrencyAmount(row.monthly_price, 0),
    status: normalizeAutoShipStatus(row.status),
    currentPeriodStart: toIsoStringOrEmpty(row.current_period_start),
    currentPeriodEnd: toIsoStringOrEmpty(row.current_period_end),
    nextBillingDate: toIsoStringOrEmpty(row.next_billing_date),
    canceledAt: toIsoStringOrEmpty(row.canceled_at),
    latestInvoiceId: normalizeText(row.latest_invoice_id),
    latestPaymentIntentId: normalizeText(row.latest_payment_intent_id),
    latestCheckoutSessionId: normalizeText(row.latest_checkout_session_id),
    failureMessage: normalizeText(row.failure_message),
    metadata: normalizeJsonObject(row.metadata_json),
    createdAt: toIsoStringOrEmpty(row.created_at),
    updatedAt: toIsoStringOrEmpty(row.updated_at),
  };
}

function normalizeAutoShipSettingRowInput(payload = {}) {
  const id = normalizeText(payload?.id) || `autoship_${Date.now()}_${randomUUID().slice(0, 8)}`;
  return {
    id,
    userId: normalizeText(payload?.userId || payload?.user_id),
    username: normalizeText(payload?.username),
    email: normalizeText(payload?.email),
    stripeCustomerId: normalizeText(payload?.stripeCustomerId || payload?.stripe_customer_id),
    stripeSubscriptionId: normalizeText(payload?.stripeSubscriptionId || payload?.stripe_subscription_id),
    stripeSubscriptionStatus: normalizeText(payload?.stripeSubscriptionStatus || payload?.stripe_subscription_status).toLowerCase(),
    selectedProductKey: normalizeText(payload?.selectedProductKey || payload?.selected_product_key).toLowerCase(),
    selectedProductName: normalizeText(payload?.selectedProductName || payload?.selected_product_name),
    monthlyPrice: roundCurrencyAmount(payload?.monthlyPrice ?? payload?.monthly_price, 0),
    status: normalizeAutoShipStatus(payload?.status),
    currentPeriodStart: toIsoStringOrEmpty(payload?.currentPeriodStart || payload?.current_period_start),
    currentPeriodEnd: toIsoStringOrEmpty(payload?.currentPeriodEnd || payload?.current_period_end),
    nextBillingDate: toIsoStringOrEmpty(payload?.nextBillingDate || payload?.next_billing_date),
    canceledAt: toIsoStringOrEmpty(payload?.canceledAt || payload?.canceled_at),
    latestInvoiceId: normalizeText(payload?.latestInvoiceId || payload?.latest_invoice_id),
    latestPaymentIntentId: normalizeText(payload?.latestPaymentIntentId || payload?.latest_payment_intent_id),
    latestCheckoutSessionId: normalizeText(payload?.latestCheckoutSessionId || payload?.latest_checkout_session_id),
    failureMessage: normalizeText(payload?.failureMessage || payload?.failure_message),
    metadata: normalizeJsonObject(payload?.metadata || payload?.metadata_json),
    createdAt: toIsoStringOrEmpty(payload?.createdAt || payload?.created_at),
    updatedAt: toIsoStringOrEmpty(payload?.updatedAt || payload?.updated_at),
  };
}

function mapDbAutoShipEvent(row) {
  if (!row) {
    return null;
  }

  return {
    id: normalizeText(row.id),
    userId: normalizeText(row.user_id),
    autoShipSettingId: normalizeText(row.auto_ship_setting_id),
    eventType: normalizeText(row.event_type),
    stripeEventId: normalizeText(row.stripe_event_id),
    stripeInvoiceId: normalizeText(row.stripe_invoice_id),
    stripeSubscriptionId: normalizeText(row.stripe_subscription_id),
    description: normalizeText(row.description),
    metadata: normalizeJsonObject(row.metadata_json),
    createdAt: toIsoStringOrEmpty(row.created_at),
  };
}

let autoShipSchemaReady = false;
let autoShipSchemaPromise = null;

async function installAutoShipTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS charge.user_auto_ship_settings (
      id text PRIMARY KEY,
      user_id text NOT NULL UNIQUE,
      username text NOT NULL DEFAULT '',
      email text NOT NULL DEFAULT '',
      stripe_customer_id text NOT NULL DEFAULT '',
      stripe_subscription_id text NOT NULL DEFAULT '',
      stripe_subscription_status text NOT NULL DEFAULT '',
      selected_product_key text NOT NULL DEFAULT '',
      selected_product_name text NOT NULL DEFAULT '',
      monthly_price numeric(12,2) NOT NULL DEFAULT 0,
      status text NOT NULL DEFAULT 'inactive',
      current_period_start timestamptz,
      current_period_end timestamptz,
      next_billing_date timestamptz,
      canceled_at timestamptz,
      latest_invoice_id text NOT NULL DEFAULT '',
      latest_payment_intent_id text NOT NULL DEFAULT '',
      latest_checkout_session_id text NOT NULL DEFAULT '',
      failure_message text NOT NULL DEFAULT '',
      metadata_json jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT NOW(),
      updated_at timestamptz NOT NULL DEFAULT NOW(),
      CONSTRAINT user_auto_ship_settings_status_check CHECK (status IN ('active', 'inactive', 'past_due', 'canceled'))
    )
  `);

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS user_auto_ship_settings_subscription_unique_idx
    ON charge.user_auto_ship_settings (stripe_subscription_id)
    WHERE BTRIM(COALESCE(stripe_subscription_id, '')) <> ''
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS user_auto_ship_settings_customer_idx
    ON charge.user_auto_ship_settings (stripe_customer_id)
    WHERE BTRIM(COALESCE(stripe_customer_id, '')) <> ''
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS user_auto_ship_settings_status_idx
    ON charge.user_auto_ship_settings (status, updated_at DESC)
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS charge.user_auto_ship_events (
      id text PRIMARY KEY,
      user_id text NOT NULL,
      auto_ship_setting_id text NOT NULL DEFAULT '',
      event_type text NOT NULL DEFAULT '',
      stripe_event_id text NOT NULL DEFAULT '',
      stripe_invoice_id text NOT NULL DEFAULT '',
      stripe_subscription_id text NOT NULL DEFAULT '',
      description text NOT NULL DEFAULT '',
      metadata_json jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS user_auto_ship_events_user_idx
    ON charge.user_auto_ship_events (user_id, created_at DESC)
  `);

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS user_auto_ship_events_stripe_event_unique_idx
    ON charge.user_auto_ship_events (stripe_event_id)
    WHERE BTRIM(COALESCE(stripe_event_id, '')) <> ''
  `);
}

export async function ensureAutoShipTables() {
  if (autoShipSchemaReady) {
    return;
  }

  if (autoShipSchemaPromise) {
    return autoShipSchemaPromise;
  }

  autoShipSchemaPromise = (async () => {
    await installAutoShipTables();
    autoShipSchemaReady = true;
  })().catch((error) => {
    autoShipSchemaReady = false;
    throw error;
  }).finally(() => {
    if (!autoShipSchemaReady) {
      autoShipSchemaPromise = null;
    }
  });

  return autoShipSchemaPromise;
}

export async function readUserAutoShipSettingByUserId(userIdInput, executor = pool, options = {}) {
  await ensureAutoShipTables();

  const userId = normalizeText(userIdInput);
  if (!userId) {
    return null;
  }

  const lockClause = options?.forUpdate === true ? 'FOR UPDATE' : '';
  const result = await executor.query(`
    SELECT
      id,
      user_id,
      username,
      email,
      stripe_customer_id,
      stripe_subscription_id,
      stripe_subscription_status,
      selected_product_key,
      selected_product_name,
      monthly_price,
      status,
      current_period_start,
      current_period_end,
      next_billing_date,
      canceled_at,
      latest_invoice_id,
      latest_payment_intent_id,
      latest_checkout_session_id,
      failure_message,
      metadata_json,
      created_at,
      updated_at
    FROM charge.user_auto_ship_settings
    WHERE user_id = $1
    LIMIT 1
    ${lockClause}
  `, [userId]);

  return mapDbAutoShipSetting(result.rows?.[0] || null);
}

export async function readUserAutoShipSettingBySubscriptionId(subscriptionIdInput, executor = pool, options = {}) {
  await ensureAutoShipTables();

  const subscriptionId = normalizeText(subscriptionIdInput);
  if (!subscriptionId) {
    return null;
  }

  const lockClause = options?.forUpdate === true ? 'FOR UPDATE' : '';
  const result = await executor.query(`
    SELECT
      id,
      user_id,
      username,
      email,
      stripe_customer_id,
      stripe_subscription_id,
      stripe_subscription_status,
      selected_product_key,
      selected_product_name,
      monthly_price,
      status,
      current_period_start,
      current_period_end,
      next_billing_date,
      canceled_at,
      latest_invoice_id,
      latest_payment_intent_id,
      latest_checkout_session_id,
      failure_message,
      metadata_json,
      created_at,
      updated_at
    FROM charge.user_auto_ship_settings
    WHERE stripe_subscription_id = $1
    LIMIT 1
    ${lockClause}
  `, [subscriptionId]);

  return mapDbAutoShipSetting(result.rows?.[0] || null);
}

export async function readUserAutoShipSettingByCustomerId(customerIdInput, executor = pool, options = {}) {
  await ensureAutoShipTables();

  const customerId = normalizeText(customerIdInput);
  if (!customerId) {
    return null;
  }

  const lockClause = options?.forUpdate === true ? 'FOR UPDATE' : '';
  const result = await executor.query(`
    SELECT
      id,
      user_id,
      username,
      email,
      stripe_customer_id,
      stripe_subscription_id,
      stripe_subscription_status,
      selected_product_key,
      selected_product_name,
      monthly_price,
      status,
      current_period_start,
      current_period_end,
      next_billing_date,
      canceled_at,
      latest_invoice_id,
      latest_payment_intent_id,
      latest_checkout_session_id,
      failure_message,
      metadata_json,
      created_at,
      updated_at
    FROM charge.user_auto_ship_settings
    WHERE stripe_customer_id = $1
    LIMIT 1
    ${lockClause}
  `, [customerId]);

  return mapDbAutoShipSetting(result.rows?.[0] || null);
}

export async function upsertUserAutoShipSetting(payload = {}, executor = pool) {
  await ensureAutoShipTables();

  const row = normalizeAutoShipSettingRowInput(payload);
  if (!row.userId) {
    throw new Error('Auto Ship setting userId is required.');
  }

  const createdAt = row.createdAt || new Date().toISOString();
  const updatedAt = row.updatedAt || new Date().toISOString();

  const result = await executor.query(`
    INSERT INTO charge.user_auto_ship_settings (
      id,
      user_id,
      username,
      email,
      stripe_customer_id,
      stripe_subscription_id,
      stripe_subscription_status,
      selected_product_key,
      selected_product_name,
      monthly_price,
      status,
      current_period_start,
      current_period_end,
      next_billing_date,
      canceled_at,
      latest_invoice_id,
      latest_payment_intent_id,
      latest_checkout_session_id,
      failure_message,
      metadata_json,
      created_at,
      updated_at
    )
    VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
      $11,$12,$13,$14,$15,$16,$17,$18,$19,$20::jsonb,$21,$22
    )
    ON CONFLICT (user_id)
    DO UPDATE SET
      username = EXCLUDED.username,
      email = EXCLUDED.email,
      stripe_customer_id = EXCLUDED.stripe_customer_id,
      stripe_subscription_id = EXCLUDED.stripe_subscription_id,
      stripe_subscription_status = EXCLUDED.stripe_subscription_status,
      selected_product_key = EXCLUDED.selected_product_key,
      selected_product_name = EXCLUDED.selected_product_name,
      monthly_price = EXCLUDED.monthly_price,
      status = EXCLUDED.status,
      current_period_start = EXCLUDED.current_period_start,
      current_period_end = EXCLUDED.current_period_end,
      next_billing_date = EXCLUDED.next_billing_date,
      canceled_at = EXCLUDED.canceled_at,
      latest_invoice_id = EXCLUDED.latest_invoice_id,
      latest_payment_intent_id = EXCLUDED.latest_payment_intent_id,
      latest_checkout_session_id = EXCLUDED.latest_checkout_session_id,
      failure_message = EXCLUDED.failure_message,
      metadata_json = EXCLUDED.metadata_json,
      updated_at = EXCLUDED.updated_at
    RETURNING
      id,
      user_id,
      username,
      email,
      stripe_customer_id,
      stripe_subscription_id,
      stripe_subscription_status,
      selected_product_key,
      selected_product_name,
      monthly_price,
      status,
      current_period_start,
      current_period_end,
      next_billing_date,
      canceled_at,
      latest_invoice_id,
      latest_payment_intent_id,
      latest_checkout_session_id,
      failure_message,
      metadata_json,
      created_at,
      updated_at
  `, [
    row.id,
    row.userId,
    row.username,
    row.email,
    row.stripeCustomerId,
    row.stripeSubscriptionId,
    row.stripeSubscriptionStatus,
    row.selectedProductKey,
    row.selectedProductName,
    row.monthlyPrice,
    row.status,
    row.currentPeriodStart || null,
    row.currentPeriodEnd || null,
    row.nextBillingDate || null,
    row.canceledAt || null,
    row.latestInvoiceId,
    row.latestPaymentIntentId,
    row.latestCheckoutSessionId,
    row.failureMessage,
    JSON.stringify(row.metadata),
    createdAt,
    updatedAt,
  ]);

  return mapDbAutoShipSetting(result.rows?.[0] || null);
}

export async function insertUserAutoShipEvent(payload = {}, executor = pool) {
  await ensureAutoShipTables();

  const userId = normalizeText(payload?.userId || payload?.user_id);
  if (!userId) {
    throw new Error('Auto Ship event userId is required.');
  }

  const eventType = normalizeText(payload?.eventType || payload?.event_type);
  const stripeEventId = normalizeText(payload?.stripeEventId || payload?.stripe_event_id);
  const stripeInvoiceId = normalizeText(payload?.stripeInvoiceId || payload?.stripe_invoice_id);
  const stripeSubscriptionId = normalizeText(payload?.stripeSubscriptionId || payload?.stripe_subscription_id);
  const eventId = normalizeText(payload?.id)
    || (
      stripeEventId
        ? `autoship_evt_${stripeEventId}`
        : (
          eventType && stripeInvoiceId
            ? `autoship_evt_${eventType}_${stripeInvoiceId}_${userId}`
            : (
              eventType && stripeSubscriptionId
                ? `autoship_evt_${eventType}_${stripeSubscriptionId}_${userId}`
                : `autoship_evt_${Date.now()}_${randomUUID().slice(0, 8)}`
            )
        )
    ).slice(0, 190);
  const autoShipSettingId = normalizeText(payload?.autoShipSettingId || payload?.auto_ship_setting_id);
  const description = normalizeText(payload?.description);
  const metadata = normalizeJsonObject(payload?.metadata || payload?.metadata_json);
  const createdAt = toIsoStringOrEmpty(payload?.createdAt || payload?.created_at) || new Date().toISOString();

  const result = await executor.query(`
    INSERT INTO charge.user_auto_ship_events (
      id,
      user_id,
      auto_ship_setting_id,
      event_type,
      stripe_event_id,
      stripe_invoice_id,
      stripe_subscription_id,
      description,
      metadata_json,
      created_at
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10::timestamptz)
    ON CONFLICT (id)
    DO NOTHING
    RETURNING
      id,
      user_id,
      auto_ship_setting_id,
      event_type,
      stripe_event_id,
      stripe_invoice_id,
      stripe_subscription_id,
      description,
      metadata_json,
      created_at
  `, [
    eventId,
    userId,
    autoShipSettingId,
    eventType,
    stripeEventId,
    stripeInvoiceId,
    stripeSubscriptionId,
    description,
    JSON.stringify(metadata),
    createdAt,
  ]);

  const insertedRow = result.rows?.[0] || null;
  if (insertedRow) {
    return {
      event: mapDbAutoShipEvent(insertedRow),
      inserted: true,
    };
  }

  if (!stripeEventId) {
    return {
      event: null,
      inserted: false,
    };
  }

  const existingResult = await executor.query(`
    SELECT
      id,
      user_id,
      auto_ship_setting_id,
      event_type,
      stripe_event_id,
      stripe_invoice_id,
      stripe_subscription_id,
      description,
      metadata_json,
      created_at
    FROM charge.user_auto_ship_events
    WHERE id = $1
    LIMIT 1
  `, [eventId]);

  return {
    event: mapDbAutoShipEvent(existingResult.rows?.[0] || null),
    inserted: false,
  };
}
