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
  if (normalized === 'fulfilled') {
    return 'Fulfilled';
  }
  return 'Pending';
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
    status: normalizePayoutRequestStatus(row.status),
    requestedByUserId: row.requested_by_user_id || '',
    requestedByUsername: row.requested_by_username || '',
    requestedByEmail: row.requested_by_email || '',
    requestedByName: row.requested_by_name || '',
    createdAt: toIsoStringOrEmpty(row.created_at),
    updatedAt: toIsoStringOrEmpty(row.updated_at),
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
  };
}

function mapAppPayoutToDbPayout(request) {
  return {
    id: request?.id || '',
    source_key: normalizeCommissionPayoutSourceKey(request?.sourceKey),
    source_label: request?.sourceLabel || resolveCommissionPayoutSourceLabel(request?.sourceKey),
    amount: Number(request?.amount || 0),
    status: normalizePayoutRequestStatus(request?.status),
    requested_by_user_id: request?.requestedByUserId || request?.userId || null,
    requested_by_username: request?.requestedByUsername || request?.username || null,
    requested_by_email: request?.requestedByEmail || request?.email || null,
    requested_by_name: request?.requestedByName || request?.name || null,
    created_at: request?.createdAt || new Date().toISOString(),
    updated_at: request?.updatedAt || null,
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
  };
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

  return {
    id: normalizeText(request.id) || normalizeText(fallbackId) || `payout_${Date.now()}`,
    sourceKey: normalizeCommissionPayoutSourceKey(request.sourceKey),
    sourceLabel: normalizeText(request.sourceLabel) || resolveCommissionPayoutSourceLabel(request.sourceKey),
    amount: Math.max(0, Number(request.amount) || 0),
    status: normalizePayoutRequestStatus(request.status),
    requestedByUserId: normalizeText(request.requestedByUserId || request.userId),
    requestedByUsername: normalizeText(request.requestedByUsername || request.username),
    requestedByEmail: normalizeText(request.requestedByEmail || request.email),
    requestedByName: normalizeText(request.requestedByName || request.name),
    createdAt: request.createdAt || new Date().toISOString(),
    updatedAt: request.updatedAt || '',
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
  };
}

export async function readMockPayoutRequestsStore() {
  const result = await pool.query(`
    SELECT
      id,
      source_key,
      source_label,
      amount,
      status,
      requested_by_user_id,
      requested_by_username,
      requested_by_email,
      requested_by_name,
      created_at,
      updated_at,
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
      gateway_message
    FROM charge.payout_requests
    ORDER BY created_at DESC
  `);

  return result.rows.map(mapDbPayoutToAppPayout);
}

export async function writeMockPayoutRequestsStore(requests) {
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
          status,
          requested_by_user_id,
          requested_by_username,
          requested_by_email,
          requested_by_name,
          created_at,
          updated_at,
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
          gateway_message
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
          $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
          $21,$22,$23
        )
      `, [
        row.id,
        row.source_key,
        row.source_label,
        row.amount,
        row.status,
        row.requested_by_user_id,
        row.requested_by_username,
        row.requested_by_email,
        row.requested_by_name,
        row.created_at,
        row.updated_at,
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
      status,
      requested_by_user_id,
      requested_by_username,
      requested_by_email,
      requested_by_name,
      created_at,
      updated_at,
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
      gateway_message
    FROM charge.payout_requests
    WHERE id = $1
    LIMIT 1
    ${forUpdate}
  `, [requestId]);

  return mapDbPayoutToAppPayout(result.rows[0] || null);
}

export async function updatePayoutRequestById(requestPayload = {}, executor = pool) {
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
      status = $5,
      requested_by_user_id = $6,
      requested_by_username = $7,
      requested_by_email = $8,
      requested_by_name = $9,
      created_at = $10,
      updated_at = $11,
      fulfilled_at = $12,
      fulfilled_by = $13,
      transfer_mode = $14,
      bank_details = $15,
      transfer_reference = $16,
      general_info = $17,
      gateway_key = $18,
      gateway_label = $19,
      gateway_route = $20,
      gateway_status = $21,
      gateway_reference = $22,
      gateway_message = $23
    WHERE id = $1
    RETURNING
      id,
      source_key,
      source_label,
      amount,
      status,
      requested_by_user_id,
      requested_by_username,
      requested_by_email,
      requested_by_name,
      created_at,
      updated_at,
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
      gateway_message
  `, [
    requestId,
    row.source_key,
    row.source_label,
    row.amount,
    row.status,
    row.requested_by_user_id,
    row.requested_by_username,
    row.requested_by_email,
    row.requested_by_name,
    row.created_at,
    row.updated_at,
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
  ]);

  return mapDbPayoutToAppPayout(result.rows[0] || null);
}

export {
  normalizeCommissionPayoutSourceKey,
  resolveCommissionPayoutSourceLabel,
};
