import pool from '../db/db.js';
import adminPool from '../db/admin-db.js';

const PAYOUT_STATUS_LABELS = Object.freeze({
  requested: 'Requested',
  processing: 'Processing',
  paid: 'Paid',
  failed: 'Failed',
  cancelled: 'Cancelled',
});

const OPEN_PAYOUT_STATUS_LABELS = Object.freeze([
  'Pending',
  PAYOUT_STATUS_LABELS.requested,
  PAYOUT_STATUS_LABELS.processing,
]);

const SUCCESS_PAYOUT_STATUS_LABELS = Object.freeze([
  'Fulfilled',
  PAYOUT_STATUS_LABELS.paid,
]);

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

function normalizeJsonObject(value, fallback = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return fallback;
  }
  return value;
}

function sanitizePayoutStatusHistoryEntry(entry = {}, fallbackIndex = 0) {
  const source = entry && typeof entry === 'object' ? entry : {};
  const changedAt = normalizeText(source.changedAt) || new Date().toISOString();
  const fromStatus = normalizePayoutRequestStatus(source.fromStatus || source.previousStatus);
  const toStatus = normalizePayoutRequestStatus(source.toStatus || source.nextStatus);
  const actorKey = normalizeText(source.actorKey || source.actor || '');
  const actorLabel = normalizeText(source.actorLabel || source.actorName || '');
  const note = normalizeText(source.note);
  const metadata = normalizeJsonObject(source.metadata, {});

  return {
    id: normalizeText(source.id) || `payout-status-${Date.now()}-${fallbackIndex + 1}`,
    fromStatus,
    toStatus,
    actorKey,
    actorLabel,
    note,
    metadata,
    changedAt,
  };
}

function sanitizePayoutStatusHistory(historyInput = []) {
  const source = Array.isArray(historyInput) ? historyInput : [];
  return source
    .map((entry, index) => sanitizePayoutStatusHistoryEntry(entry, index))
    .sort((left, right) => {
      const leftMs = Date.parse(left?.changedAt || '');
      const rightMs = Date.parse(right?.changedAt || '');
      return (Number.isFinite(leftMs) ? leftMs : 0) - (Number.isFinite(rightMs) ? rightMs : 0);
    });
}

function quoteIdentifier(value) {
  return `"${String(value || '').replace(/"/g, '""')}"`;
}

function normalizeCommissionPayoutSourceKey(value) {
  const normalized = normalizeText(value).toLowerCase();
  if (normalized === 'fasttrack') return 'fasttrack';
  if (normalized === 'infinitybuilder') return 'infinitybuilder';
  if (normalized === 'legacyleadership') return 'legacyleadership';
  if (normalized === 'salesteam') return 'salesteam';
  if (normalized === 'ewallet') return 'ewallet';
  return 'commission';
}

function resolveCommissionPayoutSourceLabel(sourceKey) {
  const normalized = normalizeCommissionPayoutSourceKey(sourceKey);
  if (normalized === 'fasttrack') return 'Fast Track Bonus';
  if (normalized === 'infinitybuilder') return 'Infinity Tier Commission';
  if (normalized === 'legacyleadership') return 'Legacy Leadership Bonus';
  if (normalized === 'salesteam') return 'Sales Team Commissions';
  if (normalized === 'ewallet') return 'E-Wallet';
  return 'Commission';
}

function normalizePayoutRequestStatus(value) {
  const normalized = normalizeText(value).toLowerCase();
  if (normalized === 'pending' || normalized === 'requested') {
    return PAYOUT_STATUS_LABELS.requested;
  }
  if (normalized === 'processing') {
    return PAYOUT_STATUS_LABELS.processing;
  }
  if (normalized === 'fulfilled' || normalized === 'paid') {
    return PAYOUT_STATUS_LABELS.paid;
  }
  if (normalized === 'failed') {
    return PAYOUT_STATUS_LABELS.failed;
  }
  if (normalized === 'cancelled' || normalized === 'canceled') {
    return PAYOUT_STATUS_LABELS.cancelled;
  }
  return PAYOUT_STATUS_LABELS.requested;
}

function normalizePayoutRequestStatusForDb(value) {
  const normalized = normalizePayoutRequestStatus(value);
  if (normalized === PAYOUT_STATUS_LABELS.requested) {
    return PAYOUT_STATUS_LABELS.requested;
  }
  if (normalized === PAYOUT_STATUS_LABELS.processing) {
    return PAYOUT_STATUS_LABELS.processing;
  }
  if (normalized === PAYOUT_STATUS_LABELS.paid) {
    return PAYOUT_STATUS_LABELS.paid;
  }
  if (normalized === PAYOUT_STATUS_LABELS.failed) {
    return PAYOUT_STATUS_LABELS.failed;
  }
  if (normalized === PAYOUT_STATUS_LABELS.cancelled) {
    return PAYOUT_STATUS_LABELS.cancelled;
  }
  return PAYOUT_STATUS_LABELS.requested;
}

function mapDbPayoutToAppPayout(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    sourceKey: row.source_key,
    sourceLabel: row.source_label,
    amount: Number(row.amount || 0),
    paidAmount: Number(row.paid_amount || 0),
    status: normalizePayoutRequestStatus(row.status),
    requestedByUserId: row.requested_by_user_id || '',
    requestedByUsername: row.requested_by_username || '',
    requestedByEmail: row.requested_by_email || '',
    requestedByName: row.requested_by_name || '',
    createdAt: toIsoStringOrEmpty(row.created_at),
    requestedAt: toIsoStringOrEmpty(row.requested_at),
    updatedAt: toIsoStringOrEmpty(row.updated_at),
    processingStartedAt: toIsoStringOrEmpty(row.processing_started_at),
    failedAt: toIsoStringOrEmpty(row.failed_at),
    cancelledAt: toIsoStringOrEmpty(row.cancelled_at),
    fulfilledAt: toIsoStringOrEmpty(row.fulfilled_at),
    fulfilledBy: row.fulfilled_by || '',
    transferMode: row.transfer_mode || '',
    bankDetails: row.bank_details || '',
    transferReference: row.transfer_reference || '',
    generalInfo: row.general_info || '',
    gatewayKey: row.gateway_key || '',
    gatewayLabel: row.gateway_label || '',
    gatewayRoute: row.gateway_route || '',
    gatewayStatus: row.gateway_status || '',
    gatewayReference: row.gateway_reference || '',
    gatewayMessage: row.gateway_message || '',
    stripeConnectAccountId: row.stripe_connect_account_id || '',
    statusHistory: sanitizePayoutStatusHistory(row.status_history_json),
  };
}

function mapAppPayoutToDbPayout(request) {
  const statusHistory = sanitizePayoutStatusHistory(request?.statusHistory);
  const paidAmount = Math.max(0, Number(request?.paidAmount || 0));
  return {
    id: request?.id || '',
    source_key: normalizeCommissionPayoutSourceKey(request?.sourceKey),
    source_label: request?.sourceLabel || resolveCommissionPayoutSourceLabel(request?.sourceKey),
    amount: Number(request?.amount || 0),
    paid_amount: paidAmount,
    status: normalizePayoutRequestStatusForDb(request?.status),
    requested_by_user_id: request?.requestedByUserId || request?.userId || null,
    requested_by_username: request?.requestedByUsername || request?.username || null,
    requested_by_email: request?.requestedByEmail || request?.email || null,
    requested_by_name: request?.requestedByName || request?.name || null,
    created_at: request?.createdAt || new Date().toISOString(),
    requested_at: request?.requestedAt || request?.createdAt || new Date().toISOString(),
    updated_at: request?.updatedAt || null,
    processing_started_at: request?.processingStartedAt || null,
    failed_at: request?.failedAt || null,
    cancelled_at: request?.cancelledAt || null,
    fulfilled_at: request?.fulfilledAt || null,
    fulfilled_by: request?.fulfilledBy || '',
    transfer_mode: request?.transferMode || '',
    bank_details: request?.bankDetails || '',
    transfer_reference: request?.transferReference || '',
    general_info: request?.generalInfo || '',
    gateway_key: request?.gatewayKey || '',
    gateway_label: request?.gatewayLabel || '',
    gateway_route: request?.gatewayRoute || '',
    gateway_status: request?.gatewayStatus || '',
    gateway_reference: request?.gatewayReference || '',
    gateway_message: request?.gatewayMessage || '',
    stripe_connect_account_id: request?.stripeConnectAccountId || '',
    status_history_json: statusHistory,
  };
}

let payoutRequestSchemaReady = false;
let payoutRequestSchemaPromise = null;

async function installPayoutRequestSchemaViaExecutor(executor = pool) {
  await executor.query(`
    ALTER TABLE charge.payout_requests
      ADD COLUMN IF NOT EXISTS requested_at timestamptz,
      ADD COLUMN IF NOT EXISTS processing_started_at timestamptz,
      ADD COLUMN IF NOT EXISTS failed_at timestamptz,
      ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
      ADD COLUMN IF NOT EXISTS paid_amount numeric(14,2) NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS stripe_connect_account_id text NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS status_history_json jsonb NOT NULL DEFAULT '[]'::jsonb
  `);
  await executor.query(`
    UPDATE charge.payout_requests
    SET requested_at = COALESCE(requested_at, created_at)
    WHERE requested_at IS NULL
  `);
  await executor.query(`
    UPDATE charge.payout_requests
    SET status_history_json = '[]'::jsonb
    WHERE status_history_json IS NULL
  `);
  await executor.query(`
    UPDATE charge.payout_requests
    SET paid_amount = CASE
      WHEN LOWER(BTRIM(COALESCE(status, ''))) IN ('fulfilled', 'paid')
        THEN GREATEST(COALESCE(amount, 0), 0)
      ELSE COALESCE(paid_amount, 0)
    END
    WHERE paid_amount IS NULL OR paid_amount < 0
  `);
}

async function ensurePayoutRequestConstraintsViaExecutor(executor = pool) {
  await executor.query(`
    ALTER TABLE charge.payout_requests
    DROP CONSTRAINT IF EXISTS payout_requests_status_check
  `);
  await executor.query(`
    ALTER TABLE charge.payout_requests
    ADD CONSTRAINT payout_requests_status_check
    CHECK (status = ANY (ARRAY[
      'Pending'::text,
      'Fulfilled'::text,
      'Requested'::text,
      'Processing'::text,
      'Paid'::text,
      'Failed'::text,
      'Cancelled'::text
    ]))
  `);
  await executor.query(`
    ALTER TABLE charge.payout_requests
    DROP CONSTRAINT IF EXISTS payout_requests_check
  `);
  await executor.query(`
    ALTER TABLE charge.payout_requests
    ADD CONSTRAINT payout_requests_check
    CHECK (
      status <> 'Fulfilled'::text
      OR fulfilled_at IS NOT NULL
    )
  `);
}

async function ensurePayoutRequestIndexesViaExecutor(executor = pool) {
  await executor.query(`
    CREATE INDEX IF NOT EXISTS ix_payout_requests_user_status_created
    ON charge.payout_requests (requested_by_user_id, status, created_at DESC)
  `);
  await executor.query(`
    CREATE INDEX IF NOT EXISTS ix_payout_requests_gateway_reference
    ON charge.payout_requests (gateway_reference)
    WHERE gateway_reference <> ''
  `);
  await executor.query(`
    CREATE INDEX IF NOT EXISTS ix_payout_requests_stripe_connect_account_id
    ON charge.payout_requests (stripe_connect_account_id)
    WHERE stripe_connect_account_id <> ''
  `);
}

export async function ensurePayoutRequestSchema() {
  if (payoutRequestSchemaReady) {
    return;
  }
  if (payoutRequestSchemaPromise) {
    return payoutRequestSchemaPromise;
  }

  payoutRequestSchemaPromise = (async () => {
    try {
      await installPayoutRequestSchemaViaExecutor(pool);
      await ensurePayoutRequestConstraintsViaExecutor(pool);
      await ensurePayoutRequestIndexesViaExecutor(pool);
      payoutRequestSchemaReady = true;
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error || '');
      if (!/permission denied|must be owner|not owner/i.test(message)) {
        throw error;
      }
    }

    const adminClient = await adminPool.connect();
    let transactionClosed = false;
    try {
      await adminClient.query('BEGIN');
      await installPayoutRequestSchemaViaExecutor(adminClient);
      await ensurePayoutRequestConstraintsViaExecutor(adminClient);
      await ensurePayoutRequestIndexesViaExecutor(adminClient);

      const serviceRole = normalizeText(process.env.DB_USER);
      if (serviceRole) {
        const quotedServiceRole = quoteIdentifier(serviceRole);
        await adminClient.query(`GRANT USAGE ON SCHEMA charge TO ${quotedServiceRole}`);
        await adminClient.query(`
          GRANT SELECT, INSERT, UPDATE, DELETE
          ON TABLE charge.payout_requests
          TO ${quotedServiceRole}
        `);
      }

      await adminClient.query('COMMIT');
      transactionClosed = true;
      payoutRequestSchemaReady = true;
    } catch (error) {
      if (!transactionClosed) {
        await adminClient.query('ROLLBACK').catch(() => {});
      }
      payoutRequestSchemaReady = false;
      throw error;
    } finally {
      adminClient.release();
    }
  })().catch((error) => {
    payoutRequestSchemaReady = false;
    throw error;
  }).finally(() => {
    if (!payoutRequestSchemaReady) {
      payoutRequestSchemaPromise = null;
    }
  });

  return payoutRequestSchemaPromise;
}

export function resolvePayoutRequestIdentityKeys(identityPayload) {
  const keys = new Set();

  const appendKey = (value) => {
    const normalizedValue = normalizeText(value).toLowerCase();
    if (normalizedValue) {
      keys.add(normalizedValue);
    }
  };

  appendKey(identityPayload?.userId);
  appendKey(identityPayload?.username);
  appendKey(identityPayload?.email);
  return keys;
}

export function doesPayoutRequestBelongToIdentity(request, identityKeys) {
  if (!(identityKeys instanceof Set) || identityKeys.size === 0) {
    return false;
  }

  const candidates = [
    request?.requestedByUserId,
    request?.requestedByUsername,
    request?.requestedByEmail,
  ];

  return candidates.some((candidate) => {
    const normalizedCandidate = normalizeText(candidate).toLowerCase();
    return normalizedCandidate ? identityKeys.has(normalizedCandidate) : false;
  });
}

export function sanitizePayoutRequestRecord(request, fallbackId = '') {
  if (!request || typeof request !== 'object') {
    return null;
  }

  const status = normalizePayoutRequestStatus(request.status);
  const amount = Math.max(0, Number(request.amount) || 0);
  const paidAmount = Math.max(0, Number(request.paidAmount || 0));
  const effectivePaidAmount = SUCCESS_PAYOUT_STATUS_LABELS.includes(status)
    ? Math.max(amount, paidAmount)
    : paidAmount;

  return {
    id: normalizeText(request.id) || normalizeText(fallbackId) || `payout_${Date.now()}`,
    sourceKey: normalizeCommissionPayoutSourceKey(request.sourceKey),
    sourceLabel: normalizeText(request.sourceLabel) || resolveCommissionPayoutSourceLabel(request.sourceKey),
    amount,
    paidAmount: effectivePaidAmount,
    status,
    requestedByUserId: normalizeText(request.requestedByUserId || request.userId),
    requestedByUsername: normalizeText(request.requestedByUsername || request.username),
    requestedByEmail: normalizeText(request.requestedByEmail || request.email),
    requestedByName: normalizeText(request.requestedByName || request.name),
    createdAt: request.createdAt || new Date().toISOString(),
    requestedAt: request.requestedAt || request.createdAt || new Date().toISOString(),
    updatedAt: request.updatedAt || '',
    processingStartedAt: request.processingStartedAt || '',
    failedAt: request.failedAt || '',
    cancelledAt: request.cancelledAt || '',
    fulfilledAt: request.fulfilledAt || '',
    fulfilledBy: normalizeText(request.fulfilledBy),
    transferMode: normalizeText(request.transferMode),
    bankDetails: normalizeText(request.bankDetails),
    transferReference: normalizeText(request.transferReference),
    generalInfo: normalizeText(request.generalInfo),
    gatewayKey: normalizeText(request.gatewayKey),
    gatewayLabel: normalizeText(request.gatewayLabel),
    gatewayRoute: normalizeText(request.gatewayRoute),
    gatewayStatus: normalizeText(request.gatewayStatus),
    gatewayReference: normalizeText(request.gatewayReference),
    gatewayMessage: normalizeText(request.gatewayMessage),
    stripeConnectAccountId: normalizeText(request.stripeConnectAccountId),
    statusHistory: sanitizePayoutStatusHistory(request.statusHistory),
  };
}

export async function readMockPayoutRequestsStore() {
  await ensurePayoutRequestSchema();

  const result = await pool.query(`
    SELECT
      id,
      source_key,
      source_label,
      amount,
      paid_amount,
      status,
      requested_by_user_id,
      requested_by_username,
      requested_by_email,
      requested_by_name,
      created_at,
      requested_at,
      updated_at,
      processing_started_at,
      failed_at,
      cancelled_at,
      fulfilled_at,
      fulfilled_by,
      transfer_mode,
      bank_details,
      transfer_reference,
      general_info,
      gateway_key,
      gateway_label,
      gateway_route,
      gateway_status,
      gateway_reference,
      gateway_message,
      stripe_connect_account_id,
      status_history_json
    FROM charge.payout_requests
    ORDER BY created_at DESC
  `);

  return result.rows.map(mapDbPayoutToAppPayout);
}

export async function insertPayoutRequestRecord(requestPayload = {}, executor = pool) {
  await ensurePayoutRequestSchema();

  const row = mapAppPayoutToDbPayout(requestPayload);
  if (!row.id) {
    return null;
  }

  const result = await executor.query(`
    INSERT INTO charge.payout_requests (
      id,
      source_key,
      source_label,
      amount,
      paid_amount,
      status,
      requested_by_user_id,
      requested_by_username,
      requested_by_email,
      requested_by_name,
      created_at,
      requested_at,
      updated_at,
      processing_started_at,
      failed_at,
      cancelled_at,
      fulfilled_at,
      fulfilled_by,
      transfer_mode,
      bank_details,
      transfer_reference,
      general_info,
      gateway_key,
      gateway_label,
      gateway_route,
      gateway_status,
      gateway_reference,
      gateway_message,
      stripe_connect_account_id,
      status_history_json
    )
    VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
      $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
      $21,$22,$23,$24,$25,$26,$27,$28,$29,$30::jsonb
    )
    RETURNING
      id,
      source_key,
      source_label,
      amount,
      paid_amount,
      status,
      requested_by_user_id,
      requested_by_username,
      requested_by_email,
      requested_by_name,
      created_at,
      requested_at,
      updated_at,
      processing_started_at,
      failed_at,
      cancelled_at,
      fulfilled_at,
      fulfilled_by,
      transfer_mode,
      bank_details,
      transfer_reference,
      general_info,
      gateway_key,
      gateway_label,
      gateway_route,
      gateway_status,
      gateway_reference,
      gateway_message,
      stripe_connect_account_id,
      status_history_json
  `, [
    row.id,
    row.source_key,
    row.source_label,
    row.amount,
    row.paid_amount,
    row.status,
    row.requested_by_user_id,
    row.requested_by_username,
    row.requested_by_email,
    row.requested_by_name,
    row.created_at,
    row.requested_at,
    row.updated_at,
    row.processing_started_at,
    row.failed_at,
    row.cancelled_at,
    row.fulfilled_at,
    row.fulfilled_by,
    row.transfer_mode,
    row.bank_details,
    row.transfer_reference,
    row.general_info,
    row.gateway_key,
    row.gateway_label,
    row.gateway_route,
    row.gateway_status,
    row.gateway_reference,
    row.gateway_message,
    row.stripe_connect_account_id,
    JSON.stringify(row.status_history_json || []),
  ]);

  return mapDbPayoutToAppPayout(result.rows[0] || null);
}

export async function writeMockPayoutRequestsStore(requests) {
  await ensurePayoutRequestSchema();

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM charge.payout_requests');

    for (const request of Array.isArray(requests) ? requests : []) {
      const row = mapAppPayoutToDbPayout(request);

      await client.query(`
        INSERT INTO charge.payout_requests (
          id,
          source_key,
          source_label,
          amount,
          paid_amount,
          status,
          requested_by_user_id,
          requested_by_username,
          requested_by_email,
          requested_by_name,
          created_at,
          requested_at,
          updated_at,
          processing_started_at,
          failed_at,
          cancelled_at,
          fulfilled_at,
          fulfilled_by,
          transfer_mode,
          bank_details,
          transfer_reference,
          general_info,
          gateway_key,
          gateway_label,
          gateway_route,
          gateway_status,
          gateway_reference,
          gateway_message,
          stripe_connect_account_id,
          status_history_json
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
          $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
          $21,$22,$23,$24,$25,$26,$27,$28,$29,$30::jsonb
        )
      `, [
        row.id,
        row.source_key,
        row.source_label,
        row.amount,
        row.paid_amount,
        row.status,
        row.requested_by_user_id,
        row.requested_by_username,
        row.requested_by_email,
        row.requested_by_name,
        row.created_at,
        row.requested_at,
        row.updated_at,
        row.processing_started_at,
        row.failed_at,
        row.cancelled_at,
        row.fulfilled_at,
        row.fulfilled_by,
        row.transfer_mode,
        row.bank_details,
        row.transfer_reference,
        row.general_info,
        row.gateway_key,
        row.gateway_label,
        row.gateway_route,
        row.gateway_status,
        row.gateway_reference,
        row.gateway_message,
        row.stripe_connect_account_id,
        JSON.stringify(row.status_history_json || []),
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

export async function readPayoutRequestById(requestIdInput, executor = pool, options = {}) {
  await ensurePayoutRequestSchema();

  const requestId = normalizeText(requestIdInput);
  if (!requestId) {
    return null;
  }

  const forUpdate = options?.forUpdate === true ? 'FOR UPDATE' : '';
  const result = await executor.query(`
    SELECT
      id,
      source_key,
      source_label,
      amount,
      paid_amount,
      status,
      requested_by_user_id,
      requested_by_username,
      requested_by_email,
      requested_by_name,
      created_at,
      requested_at,
      updated_at,
      processing_started_at,
      failed_at,
      cancelled_at,
      fulfilled_at,
      fulfilled_by,
      transfer_mode,
      bank_details,
      transfer_reference,
      general_info,
      gateway_key,
      gateway_label,
      gateway_route,
      gateway_status,
      gateway_reference,
      gateway_message,
      stripe_connect_account_id,
      status_history_json
    FROM charge.payout_requests
    WHERE id = $1
    LIMIT 1
    ${forUpdate}
  `, [requestId]);

  return mapDbPayoutToAppPayout(result.rows[0] || null);
}

export async function readPayoutRequestByGatewayReference(gatewayReferenceInput, executor = pool) {
  await ensurePayoutRequestSchema();

  const gatewayReference = normalizeText(gatewayReferenceInput);
  if (!gatewayReference) {
    return null;
  }

  const result = await executor.query(`
    SELECT
      id,
      source_key,
      source_label,
      amount,
      paid_amount,
      status,
      requested_by_user_id,
      requested_by_username,
      requested_by_email,
      requested_by_name,
      created_at,
      requested_at,
      updated_at,
      processing_started_at,
      failed_at,
      cancelled_at,
      fulfilled_at,
      fulfilled_by,
      transfer_mode,
      bank_details,
      transfer_reference,
      general_info,
      gateway_key,
      gateway_label,
      gateway_route,
      gateway_status,
      gateway_reference,
      gateway_message,
      stripe_connect_account_id,
      status_history_json
    FROM charge.payout_requests
    WHERE gateway_reference = $1
    LIMIT 1
  `, [gatewayReference]);

  return mapDbPayoutToAppPayout(result.rows[0] || null);
}

export async function readPayoutRequestByTransferReference(transferReferenceInput, executor = pool) {
  await ensurePayoutRequestSchema();

  const transferReference = normalizeText(transferReferenceInput);
  if (!transferReference) {
    return null;
  }

  const result = await executor.query(`
    SELECT
      id,
      source_key,
      source_label,
      amount,
      paid_amount,
      status,
      requested_by_user_id,
      requested_by_username,
      requested_by_email,
      requested_by_name,
      created_at,
      requested_at,
      updated_at,
      processing_started_at,
      failed_at,
      cancelled_at,
      fulfilled_at,
      fulfilled_by,
      transfer_mode,
      bank_details,
      transfer_reference,
      general_info,
      gateway_key,
      gateway_label,
      gateway_route,
      gateway_status,
      gateway_reference,
      gateway_message,
      stripe_connect_account_id,
      status_history_json
    FROM charge.payout_requests
    WHERE transfer_reference = $1
    LIMIT 1
  `, [transferReference]);

  return mapDbPayoutToAppPayout(result.rows[0] || null);
}

export async function updatePayoutRequestById(requestPayload = {}, executor = pool) {
  await ensurePayoutRequestSchema();

  const requestId = normalizeText(requestPayload?.id);
  if (!requestId) {
    return null;
  }

  const row = mapAppPayoutToDbPayout(requestPayload);
  const result = await executor.query(`
    UPDATE charge.payout_requests
    SET
      source_key = $2,
      source_label = $3,
      amount = $4,
      paid_amount = $5,
      status = $6,
      requested_by_user_id = $7,
      requested_by_username = $8,
      requested_by_email = $9,
      requested_by_name = $10,
      created_at = $11,
      requested_at = $12,
      updated_at = $13,
      processing_started_at = $14,
      failed_at = $15,
      cancelled_at = $16,
      fulfilled_at = $17,
      fulfilled_by = $18,
      transfer_mode = $19,
      bank_details = $20,
      transfer_reference = $21,
      general_info = $22,
      gateway_key = $23,
      gateway_label = $24,
      gateway_route = $25,
      gateway_status = $26,
      gateway_reference = $27,
      gateway_message = $28,
      stripe_connect_account_id = $29,
      status_history_json = $30::jsonb
    WHERE id = $1
    RETURNING
      id,
      source_key,
      source_label,
      amount,
      paid_amount,
      status,
      requested_by_user_id,
      requested_by_username,
      requested_by_email,
      requested_by_name,
      created_at,
      requested_at,
      updated_at,
      processing_started_at,
      failed_at,
      cancelled_at,
      fulfilled_at,
      fulfilled_by,
      transfer_mode,
      bank_details,
      transfer_reference,
      general_info,
      gateway_key,
      gateway_label,
      gateway_route,
      gateway_status,
      gateway_reference,
      gateway_message,
      stripe_connect_account_id,
      status_history_json
  `, [
    requestId,
    row.source_key,
    row.source_label,
    row.amount,
    row.paid_amount,
    row.status,
    row.requested_by_user_id,
    row.requested_by_username,
    row.requested_by_email,
    row.requested_by_name,
    row.created_at,
    row.requested_at,
    row.updated_at,
    row.processing_started_at,
    row.failed_at,
    row.cancelled_at,
    row.fulfilled_at,
    row.fulfilled_by,
    row.transfer_mode,
    row.bank_details,
    row.transfer_reference,
    row.general_info,
    row.gateway_key,
    row.gateway_label,
    row.gateway_route,
    row.gateway_status,
    row.gateway_reference,
    row.gateway_message,
    row.stripe_connect_account_id,
    JSON.stringify(row.status_history_json || []),
  ]);

  return mapDbPayoutToAppPayout(result.rows[0] || null);
}

export async function sumOpenPayoutRequestAmountByUserId(userIdInput, executor = pool, options = {}) {
  await ensurePayoutRequestSchema();

  const userId = normalizeText(userIdInput);
  if (!userId) {
    return 0;
  }

  const excludedRequestId = normalizeText(options?.excludeRequestId);
  const result = excludedRequestId
    ? await executor.query(`
      SELECT COALESCE(SUM(amount), 0) AS total_amount
      FROM charge.payout_requests
      WHERE requested_by_user_id = $1
        AND status = ANY($2::text[])
        AND id <> $3
    `, [userId, OPEN_PAYOUT_STATUS_LABELS, excludedRequestId])
    : await executor.query(`
      SELECT COALESCE(SUM(amount), 0) AS total_amount
      FROM charge.payout_requests
      WHERE requested_by_user_id = $1
        AND status = ANY($2::text[])
    `, [userId, OPEN_PAYOUT_STATUS_LABELS]);

  return Math.max(0, Number(result.rows[0]?.total_amount || 0));
}

export {
  OPEN_PAYOUT_STATUS_LABELS,
  PAYOUT_STATUS_LABELS,
  SUCCESS_PAYOUT_STATUS_LABELS,
  normalizeCommissionPayoutSourceKey,
  normalizePayoutRequestStatus,
  resolveCommissionPayoutSourceLabel,
};
