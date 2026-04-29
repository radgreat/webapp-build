import pool from '../db/db.js';

const COMMISSION_SOURCE_KEY_TO_TRANSFER_ID = Object.freeze({
  fasttrack: 'commission-fasttrack',
  infinitybuilder: 'commission-infinitybuilder',
  legacyleadership: 'commission-legacyleadership',
  salesteam: 'commission-salesteam',
  retailprofit: 'commission-retailprofit',
  matchingbonus: 'commission-matchingbonus',
});

const TRANSFER_ID_TO_COMMISSION_SOURCE_KEY = Object.freeze({
  'commission-fasttrack': 'fasttrack',
  'commission-infinitybuilder': 'infinitybuilder',
  'commission-legacyleadership': 'legacyleadership',
  'commission-salesteam': 'salesteam',
  'commission-retailprofit': 'retailprofit',
  'commission-matchingbonus': 'matchingbonus',
});

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeCredential(value) {
  return normalizeText(value).toLowerCase();
}

function normalizeCommissionSourceKey(sourceKey) {
  const normalized = normalizeCredential(sourceKey);
  if (Object.prototype.hasOwnProperty.call(COMMISSION_SOURCE_KEY_TO_TRANSFER_ID, normalized)) {
    return normalized;
  }
  return '';
}

export function resolveWalletCommissionTransferSenderId(sourceKey) {
  const normalizedSourceKey = normalizeCommissionSourceKey(sourceKey);
  if (!normalizedSourceKey) {
    return '';
  }
  return COMMISSION_SOURCE_KEY_TO_TRANSFER_ID[normalizedSourceKey] || '';
}

export function resolveWalletCommissionSourceKeyFromSenderId(senderUserId) {
  const normalizedSenderUserId = normalizeCredential(senderUserId);
  if (!normalizedSenderUserId) {
    return '';
  }
  return TRANSFER_ID_TO_COMMISSION_SOURCE_KEY[normalizedSenderUserId] || '';
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

function roundCurrencyAmount(value) {
  return Math.round((Math.max(0, Number(value) || 0)) * 100) / 100;
}

function mapDbWalletAccountToAppWalletAccount(row) {
  if (!row) {
    return null;
  }

  return {
    userId: row.user_id || '',
    username: row.username || '',
    email: row.email || '',
    accountName: row.account_name || '',
    balance: roundCurrencyAmount(row.balance),
    currencyCode: row.currency_code || 'USD',
    createdAt: toIsoStringOrEmpty(row.created_at),
    updatedAt: toIsoStringOrEmpty(row.updated_at),
  };
}

function mapDbWalletTransferToAppWalletTransfer(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id || '',
    referenceCode: row.reference_code || '',
    senderUserId: row.sender_user_id || '',
    senderUsername: row.sender_username || '',
    senderEmail: row.sender_email || '',
    recipientUserId: row.recipient_user_id || '',
    recipientUsername: row.recipient_username || '',
    recipientEmail: row.recipient_email || '',
    amount: roundCurrencyAmount(row.amount),
    currencyCode: row.currency_code || 'USD',
    note: row.note || '',
    status: row.status || 'Completed',
    createdAt: toIsoStringOrEmpty(row.created_at),
    updatedAt: toIsoStringOrEmpty(row.updated_at),
  };
}

let walletSchemaReady = false;
let walletSchemaPromise = null;

export async function ensureWalletTables() {
  if (walletSchemaReady) {
    return;
  }

  if (walletSchemaPromise) {
    return walletSchemaPromise;
  }

  walletSchemaPromise = (async () => {
    const result = await pool.query(`
      SELECT
        to_regclass('charge.ewallet_accounts') AS accounts_table,
        to_regclass('charge.ewallet_peer_transfers') AS transfers_table
    `);

    const row = result.rows[0] || {};
    if (!row.accounts_table || !row.transfers_table) {
      throw new Error('E-Wallet tables are not installed in schema "charge".');
    }

    // Probe select permissions for the active runtime role.
    await pool.query('SELECT 1 FROM charge.ewallet_accounts LIMIT 1');
    await pool.query('SELECT 1 FROM charge.ewallet_peer_transfers LIMIT 1');
    walletSchemaReady = true;
  })().catch((error) => {
    walletSchemaReady = false;
    throw error;
  }).finally(() => {
    if (!walletSchemaReady) {
      walletSchemaPromise = null;
    }
  });

  return walletSchemaPromise;
}

export async function readWalletAccountByUserId(userIdInput, executor = pool) {
  await ensureWalletTables();

  const userId = normalizeText(userIdInput);
  if (!userId) {
    return null;
  }

  const result = await executor.query(`
    SELECT
      user_id,
      username,
      email,
      account_name,
      balance,
      currency_code,
      created_at,
      updated_at
    FROM charge.ewallet_accounts
    WHERE user_id = $1
    LIMIT 1
  `, [userId]);

  return mapDbWalletAccountToAppWalletAccount(result.rows[0] || null);
}

export async function readWalletAccountByIdentity(identityPayload = {}, executor = pool) {
  await ensureWalletTables();

  const userId = normalizeText(identityPayload?.userId);
  if (userId) {
    return readWalletAccountByUserId(userId, executor);
  }

  const username = normalizeCredential(identityPayload?.username);
  const email = normalizeCredential(identityPayload?.email);

  if (!username && !email) {
    return null;
  }

  const clauses = [];
  const values = [];

  if (username) {
    values.push(username);
    clauses.push(`LOWER(username) = $${values.length}`);
  }

  if (email) {
    values.push(email);
    clauses.push(`LOWER(email) = $${values.length}`);
  }

  const result = await executor.query(`
    SELECT
      user_id,
      username,
      email,
      account_name,
      balance,
      currency_code,
      created_at,
      updated_at
    FROM charge.ewallet_accounts
    WHERE ${clauses.join(' OR ')}
    ORDER BY updated_at DESC
    LIMIT 1
  `, values);

  return mapDbWalletAccountToAppWalletAccount(result.rows[0] || null);
}

export async function upsertWalletAccount(accountPayload = {}, executor = pool) {
  await ensureWalletTables();

  const userId = normalizeText(accountPayload?.userId);
  if (!userId) {
    return null;
  }

  const username = normalizeText(accountPayload?.username);
  const email = normalizeText(accountPayload?.email);
  const accountName = normalizeText(accountPayload?.accountName || accountPayload?.name);
  const currencyCode = normalizeText(accountPayload?.currencyCode || 'USD').toUpperCase() || 'USD';
  const startingBalance = roundCurrencyAmount(accountPayload?.startingBalance);

  const result = await executor.query(`
    INSERT INTO charge.ewallet_accounts (
      user_id,
      username,
      email,
      account_name,
      balance,
      currency_code
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (user_id)
    DO UPDATE SET
      username = CASE
        WHEN EXCLUDED.username <> '' THEN EXCLUDED.username
        ELSE charge.ewallet_accounts.username
      END,
      email = CASE
        WHEN EXCLUDED.email <> '' THEN EXCLUDED.email
        ELSE charge.ewallet_accounts.email
      END,
      account_name = CASE
        WHEN EXCLUDED.account_name <> '' THEN EXCLUDED.account_name
        ELSE charge.ewallet_accounts.account_name
      END,
      currency_code = CASE
        WHEN EXCLUDED.currency_code <> '' THEN EXCLUDED.currency_code
        ELSE charge.ewallet_accounts.currency_code
      END,
      updated_at = NOW()
    RETURNING
      user_id,
      username,
      email,
      account_name,
      balance,
      currency_code,
      created_at,
      updated_at
  `, [
    userId,
    username,
    email,
    accountName,
    startingBalance,
    currencyCode,
  ]);

  return mapDbWalletAccountToAppWalletAccount(result.rows[0] || null);
}

export async function updateWalletAccountBalanceByUserId(userIdInput, nextBalanceInput, executor = pool) {
  await ensureWalletTables();

  const userId = normalizeText(userIdInput);
  if (!userId) {
    return null;
  }

  const nextBalance = roundCurrencyAmount(nextBalanceInput);

  const result = await executor.query(`
    UPDATE charge.ewallet_accounts
    SET
      balance = $2,
      updated_at = NOW()
    WHERE user_id = $1
    RETURNING
      user_id,
      username,
      email,
      account_name,
      balance,
      currency_code,
      created_at,
      updated_at
  `, [userId, nextBalance]);

  return mapDbWalletAccountToAppWalletAccount(result.rows[0] || null);
}

export async function lockWalletAccountsByUserIds(userIds, executor) {
  await ensureWalletTables();

  const uniqueUserIds = Array.from(new Set(
    (Array.isArray(userIds) ? userIds : [])
      .map((value) => normalizeText(value))
      .filter(Boolean)
  ));

  if (!uniqueUserIds.length) {
    return [];
  }

  const result = await executor.query(`
    SELECT
      user_id,
      username,
      email,
      account_name,
      balance,
      currency_code,
      created_at,
      updated_at
    FROM charge.ewallet_accounts
    WHERE user_id = ANY($1::text[])
    ORDER BY user_id ASC
    FOR UPDATE
  `, [uniqueUserIds]);

  return result.rows.map(mapDbWalletAccountToAppWalletAccount);
}

export async function insertWalletPeerTransfer(transferPayload = {}, executor = pool) {
  await ensureWalletTables();

  const amount = roundCurrencyAmount(transferPayload?.amount);
  if (amount <= 0) {
    return null;
  }

  const transferId = normalizeText(transferPayload?.id);
  const referenceCode = normalizeText(transferPayload?.referenceCode);
  const senderUserId = normalizeText(transferPayload?.senderUserId);
  const recipientUserId = normalizeText(transferPayload?.recipientUserId);

  if (!transferId || !referenceCode || !senderUserId || !recipientUserId || senderUserId === recipientUserId) {
    return null;
  }

  const nowIso = new Date().toISOString();
  const result = await executor.query(`
    INSERT INTO charge.ewallet_peer_transfers (
      id,
      reference_code,
      sender_user_id,
      sender_username,
      sender_email,
      recipient_user_id,
      recipient_username,
      recipient_email,
      amount,
      currency_code,
      note,
      status,
      created_at,
      updated_at
    )
    VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14
    )
    RETURNING
      id,
      reference_code,
      sender_user_id,
      sender_username,
      sender_email,
      recipient_user_id,
      recipient_username,
      recipient_email,
      amount,
      currency_code,
      note,
      status,
      created_at,
      updated_at
  `, [
    transferId,
    referenceCode,
    senderUserId,
    normalizeText(transferPayload?.senderUsername),
    normalizeText(transferPayload?.senderEmail),
    recipientUserId,
    normalizeText(transferPayload?.recipientUsername),
    normalizeText(transferPayload?.recipientEmail),
    amount,
    normalizeText(transferPayload?.currencyCode || 'USD').toUpperCase() || 'USD',
    normalizeText(transferPayload?.note),
    normalizeText(transferPayload?.status || 'Completed') || 'Completed',
    transferPayload?.createdAt || nowIso,
    nowIso,
  ]);

  return mapDbWalletTransferToAppWalletTransfer(result.rows[0] || null);
}

export async function listWalletTransfersForUserId(userIdInput, limitInput = 50, executor = pool) {
  await ensureWalletTables();

  const userId = normalizeText(userIdInput);
  if (!userId) {
    return [];
  }

  const requestedLimit = Number.parseInt(String(limitInput ?? '50'), 10);
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(100, Math.max(1, requestedLimit))
    : 50;

  const result = await executor.query(`
    SELECT
      id,
      reference_code,
      sender_user_id,
      sender_username,
      sender_email,
      recipient_user_id,
      recipient_username,
      recipient_email,
      amount,
      currency_code,
      note,
      status,
      created_at,
      updated_at
    FROM charge.ewallet_peer_transfers
    WHERE sender_user_id = $1 OR recipient_user_id = $1
    ORDER BY created_at DESC
    LIMIT $2
  `, [userId, limit]);

  return result.rows.map(mapDbWalletTransferToAppWalletTransfer);
}

export async function readWalletCommissionOffsetMapForUserId(userIdInput, executor = pool) {
  await ensureWalletTables();

  const userId = normalizeText(userIdInput);
  const offsetMap = {
    fasttrack: 0,
    infinitybuilder: 0,
    legacyleadership: 0,
    salesteam: 0,
    retailprofit: 0,
    matchingbonus: 0,
  };

  if (!userId) {
    return offsetMap;
  }

  const transferSenderIds = Object.values(COMMISSION_SOURCE_KEY_TO_TRANSFER_ID);
  const result = await executor.query(`
    SELECT
      sender_user_id,
      COALESCE(SUM(amount), 0) AS total_amount
    FROM charge.ewallet_peer_transfers
    WHERE recipient_user_id = $1
      AND sender_user_id = ANY($2::text[])
    GROUP BY sender_user_id
  `, [userId, transferSenderIds]);

  result.rows.forEach((row) => {
    const sourceKey = resolveWalletCommissionSourceKeyFromSenderId(row?.sender_user_id);
    if (!sourceKey || !Object.prototype.hasOwnProperty.call(offsetMap, sourceKey)) {
      return;
    }
    offsetMap[sourceKey] = roundCurrencyAmount(row?.total_amount);
  });

  return offsetMap;
}

export async function insertWalletPayoutRequest(requestPayload = {}, executor = pool) {
  const requestId = normalizeText(requestPayload?.id);
  const sourceKey = normalizeText(requestPayload?.sourceKey || 'ewallet');
  const sourceLabel = normalizeText(requestPayload?.sourceLabel || 'E-Wallet');
  const requestedByUserId = normalizeText(requestPayload?.requestedByUserId);
  const amount = roundCurrencyAmount(requestPayload?.amount);
  if (!requestId || !requestedByUserId || amount <= 0) {
    return null;
  }

  const createdAt = requestPayload?.createdAt || new Date().toISOString();
  const updatedAt = requestPayload?.updatedAt || createdAt;

  const result = await executor.query(`
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
      $1,$2,$3,$4,'Pending',$5,$6,$7,$8,$9,$10,NULL,'','','','',$11,'','','','','',''
    )
    RETURNING id
  `, [
    requestId,
    sourceKey,
    sourceLabel,
    amount,
    requestedByUserId,
    normalizeText(requestPayload?.requestedByUsername),
    normalizeText(requestPayload?.requestedByEmail),
    normalizeText(requestPayload?.requestedByName),
    createdAt,
    updatedAt,
    normalizeText(requestPayload?.generalInfo || 'E-Wallet payout request'),
  ]);

  return result.rows[0] || null;
}
