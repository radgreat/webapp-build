import pool from '../db/db.js';
import adminPool, { isAdminDbConfigured } from '../db/admin-db.js';
import {
  LEDGER_ENTRY_DIRECTIONS,
  LEDGER_ENTRY_STATUSES,
  LEDGER_ENTRY_TYPES,
  LEDGER_SOURCE_TYPES,
  createLedgerRecordId,
  normalizeCredential,
  normalizeLedgerDirection,
  normalizeLedgerEntryType,
  normalizeLedgerIdempotencyKey,
  normalizeLedgerSourceType,
  normalizeLedgerStatus,
  normalizeText,
  roundCurrencyAmount,
  toIsoStringOrEmpty,
  toWholeNumber,
} from '../utils/ledger.helpers.js';

function quoteIdentifier(value) {
  return `"${String(value || '').replace(/"/g, '""')}"`;
}

function normalizeJsonObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return value;
}

function normalizeLedgerSourceRef(value) {
  return normalizeText(value).slice(0, 220);
}

function normalizeLedgerDescription(value) {
  return normalizeText(value).slice(0, 700);
}

function normalizeLedgerSourceId(value, fallback = '') {
  return normalizeText(value || fallback).slice(0, 190);
}

function mapDbLedgerEntryToApp(row) {
  if (!row) {
    return null;
  }

  return {
    id: normalizeText(row.id),
    userId: normalizeText(row.user_id),
    username: normalizeText(row.username),
    email: normalizeText(row.email),
    type: normalizeLedgerEntryType(row.type, LEDGER_ENTRY_TYPES.ADJUSTMENT),
    direction: normalizeLedgerDirection(row.direction, LEDGER_ENTRY_DIRECTIONS.CREDIT),
    amount: roundCurrencyAmount(row.amount, 0),
    bvAmount: toWholeNumber(row.bv_amount, 0),
    status: normalizeLedgerStatus(row.status, LEDGER_ENTRY_STATUSES.POSTED),
    sourceType: normalizeLedgerSourceType(row.source_type, LEDGER_SOURCE_TYPES.ADMIN_ADJUSTMENT),
    sourceId: normalizeText(row.source_id),
    sourceRef: normalizeText(row.source_ref),
    idempotencyKey: normalizeText(row.idempotency_key),
    description: normalizeText(row.description),
    metadata: normalizeJsonObject(row.metadata),
    relatedEntryId: normalizeText(row.related_entry_id),
    createdAt: toIsoStringOrEmpty(row.created_at),
    updatedAt: toIsoStringOrEmpty(row.updated_at),
    postedAt: toIsoStringOrEmpty(row.posted_at),
    reversedAt: toIsoStringOrEmpty(row.reversed_at),
  };
}

let ledgerTablesReady = false;
let ledgerTablesPromise = null;

async function installLedgerTablesWithPool(targetPool, options = {}) {
  const client = await targetPool.connect();
  let transactionClosed = false;

  try {
    await client.query('BEGIN');
    await client.query(`
      CREATE TABLE IF NOT EXISTS charge.ledger_entries (
        id text PRIMARY KEY,
        user_id text NOT NULL,
        username text NOT NULL DEFAULT '',
        email text NOT NULL DEFAULT '',
        type text NOT NULL,
        direction text NOT NULL,
        amount numeric(14,2) NOT NULL DEFAULT 0,
        bv_amount integer NOT NULL DEFAULT 0,
        status text NOT NULL DEFAULT 'posted',
        source_type text NOT NULL,
        source_id text NOT NULL,
        source_ref text NOT NULL DEFAULT '',
        idempotency_key text NOT NULL DEFAULT '',
        description text NOT NULL DEFAULT '',
        metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
        related_entry_id text NOT NULL DEFAULT '',
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW(),
        posted_at timestamptz,
        reversed_at timestamptz,
        CONSTRAINT ledger_entries_type_check CHECK (
          type IN (
            'retail_commission',
            'fast_track_commission',
            'sales_team_commission',
            'payout',
            'adjustment',
            'reversal'
          )
        ),
        CONSTRAINT ledger_entries_direction_check CHECK (direction IN ('credit', 'debit')),
        CONSTRAINT ledger_entries_amount_check CHECK (amount >= 0),
        CONSTRAINT ledger_entries_bv_amount_check CHECK (bv_amount >= 0),
        CONSTRAINT ledger_entries_status_check CHECK (status IN ('pending', 'posted', 'paid', 'reversed', 'failed')),
        CONSTRAINT ledger_entries_source_type_check CHECK (
          source_type IN ('order', 'enrollment', 'binary_cycle', 'payout', 'admin_adjustment')
        )
      )
    `);
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS ledger_entries_idempotency_key_unique_idx
      ON charge.ledger_entries (idempotency_key)
      WHERE BTRIM(COALESCE(idempotency_key, '')) <> ''
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS ledger_entries_user_created_idx
      ON charge.ledger_entries (user_id, created_at DESC)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS ledger_entries_user_status_created_idx
      ON charge.ledger_entries (user_id, status, created_at DESC)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS ledger_entries_type_created_idx
      ON charge.ledger_entries (type, created_at DESC)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS ledger_entries_source_lookup_idx
      ON charge.ledger_entries (source_type, source_id, created_at DESC)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS ledger_entries_username_lower_idx
      ON charge.ledger_entries (LOWER(username))
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS ledger_entries_email_lower_idx
      ON charge.ledger_entries (LOWER(email))
    `);

    const serviceRole = normalizeText(process.env.DB_USER);
    if (options?.grantServiceRole === true && serviceRole) {
      const quotedServiceRole = quoteIdentifier(serviceRole);
      await client.query(`GRANT USAGE ON SCHEMA charge TO ${quotedServiceRole}`);
      await client.query(`
        GRANT SELECT, INSERT, UPDATE, DELETE
        ON TABLE charge.ledger_entries
        TO ${quotedServiceRole}
      `);
    }

    await client.query('COMMIT');
    transactionClosed = true;
    return true;
  } catch (error) {
    if (!transactionClosed) {
      await client.query('ROLLBACK').catch(() => {});
    }
    throw error;
  } finally {
    client.release();
  }
}

async function installLedgerTablesViaPrimary() {
  return installLedgerTablesWithPool(pool, {
    grantServiceRole: false,
  });
}

async function installLedgerTablesViaAdmin() {
  return installLedgerTablesWithPool(adminPool, {
    grantServiceRole: true,
  });
}

async function ensureLedgerTableColumns() {
  await pool.query(`
    ALTER TABLE charge.ledger_entries
    ADD COLUMN IF NOT EXISTS source_ref text NOT NULL DEFAULT ''
  `);
  await pool.query(`
    ALTER TABLE charge.ledger_entries
    ADD COLUMN IF NOT EXISTS idempotency_key text NOT NULL DEFAULT ''
  `);
  await pool.query(`
    ALTER TABLE charge.ledger_entries
    ADD COLUMN IF NOT EXISTS related_entry_id text NOT NULL DEFAULT ''
  `);
  await pool.query(`
    ALTER TABLE charge.ledger_entries
    ADD COLUMN IF NOT EXISTS posted_at timestamptz
  `);
  await pool.query(`
    ALTER TABLE charge.ledger_entries
    ADD COLUMN IF NOT EXISTS reversed_at timestamptz
  `);
}

export async function ensureLedgerTables() {
  if (ledgerTablesReady) {
    return;
  }

  if (ledgerTablesPromise) {
    return ledgerTablesPromise;
  }

  ledgerTablesPromise = (async () => {
    const existsResult = await pool.query(`
      SELECT to_regclass('charge.ledger_entries') AS table_name
    `);
    let tableName = normalizeText(existsResult.rows[0]?.table_name);

    if (!tableName) {
      let primaryInstallError = null;
      try {
        await installLedgerTablesViaPrimary();
      } catch (error) {
        primaryInstallError = error;
      }

      if (primaryInstallError) {
        let adminInstallError = null;
        const shouldAttemptAdminInstall = isAdminDbConfigured();
        if (shouldAttemptAdminInstall) {
          try {
            await installLedgerTablesViaAdmin();
          } catch (error) {
            adminInstallError = error;
          }
        }

        if (!shouldAttemptAdminInstall || adminInstallError) {
          const primaryMessage = primaryInstallError instanceof Error
            ? primaryInstallError.message
            : String(primaryInstallError || 'Unknown primary install error.');
          const adminMessage = adminInstallError
            ? (adminInstallError instanceof Error
              ? adminInstallError.message
              : String(adminInstallError || 'Unknown admin install error.'))
            : 'Admin DB credentials are not configured.';
          throw new Error(
            `Unable to install ledger table with available DB credentials. Primary install failed: ${primaryMessage}. Admin install failed: ${adminMessage}`,
          );
        }
      }

      const recheckResult = await pool.query(`
        SELECT to_regclass('charge.ledger_entries') AS table_name
      `);
      tableName = normalizeText(recheckResult.rows[0]?.table_name);
      if (!tableName) {
        throw new Error('Ledger table is not installed in schema "charge".');
      }
    }

    await ensureLedgerTableColumns();
    await pool.query('SELECT 1 FROM charge.ledger_entries LIMIT 1');
    ledgerTablesReady = true;
  })().catch((error) => {
    ledgerTablesReady = false;
    throw error;
  }).finally(() => {
    if (!ledgerTablesReady) {
      ledgerTablesPromise = null;
    }
  });

  return ledgerTablesPromise;
}

export async function readLedgerEntryById(entryIdInput, executor = pool, options = {}) {
  await ensureLedgerTables();

  const entryId = normalizeText(entryIdInput);
  if (!entryId) {
    return null;
  }

  const lockClause = options?.forUpdate === true ? 'FOR UPDATE' : '';
  const result = await executor.query(`
    SELECT
      id,
      user_id,
      username,
      email,
      type,
      direction,
      amount,
      bv_amount,
      status,
      source_type,
      source_id,
      source_ref,
      idempotency_key,
      description,
      metadata,
      related_entry_id,
      created_at,
      updated_at,
      posted_at,
      reversed_at
    FROM charge.ledger_entries
    WHERE id = $1
    LIMIT 1
    ${lockClause}
  `, [entryId]);

  return mapDbLedgerEntryToApp(result.rows[0] || null);
}

export async function readLedgerEntryByIdempotencyKey(idempotencyKeyInput, executor = pool, options = {}) {
  await ensureLedgerTables();

  const idempotencyKey = normalizeLedgerIdempotencyKey(idempotencyKeyInput);
  if (!idempotencyKey) {
    return null;
  }

  const lockClause = options?.forUpdate === true ? 'FOR UPDATE' : '';
  const result = await executor.query(`
    SELECT
      id,
      user_id,
      username,
      email,
      type,
      direction,
      amount,
      bv_amount,
      status,
      source_type,
      source_id,
      source_ref,
      idempotency_key,
      description,
      metadata,
      related_entry_id,
      created_at,
      updated_at,
      posted_at,
      reversed_at
    FROM charge.ledger_entries
    WHERE idempotency_key = $1
    LIMIT 1
    ${lockClause}
  `, [idempotencyKey]);

  return mapDbLedgerEntryToApp(result.rows[0] || null);
}

function normalizeLedgerRowInput(payload = {}) {
  const amount = roundCurrencyAmount(payload?.amount, 0);
  const status = normalizeLedgerStatus(payload?.status, LEDGER_ENTRY_STATUSES.POSTED);
  const createdAt = toIsoStringOrEmpty(payload?.createdAt) || new Date().toISOString();
  const normalizedPostedAt = toIsoStringOrEmpty(payload?.postedAt);
  const normalizedReversedAt = toIsoStringOrEmpty(payload?.reversedAt);

  const postedAt = normalizedPostedAt
    || (
      (status === LEDGER_ENTRY_STATUSES.POSTED || status === LEDGER_ENTRY_STATUSES.PAID)
        ? createdAt
        : ''
    );
  const reversedAt = normalizedReversedAt
    || (status === LEDGER_ENTRY_STATUSES.REVERSED ? createdAt : '');

  return {
    id: normalizeText(payload?.id) || createLedgerRecordId('ledger'),
    userId: normalizeText(payload?.userId),
    username: normalizeText(payload?.username),
    email: normalizeText(payload?.email),
    type: normalizeLedgerEntryType(payload?.type, LEDGER_ENTRY_TYPES.ADJUSTMENT),
    direction: normalizeLedgerDirection(payload?.direction, LEDGER_ENTRY_DIRECTIONS.CREDIT),
    amount,
    bvAmount: toWholeNumber(payload?.bvAmount, 0),
    status,
    sourceType: normalizeLedgerSourceType(payload?.sourceType, LEDGER_SOURCE_TYPES.ADMIN_ADJUSTMENT),
    sourceId: normalizeLedgerSourceId(payload?.sourceId, createLedgerRecordId('source')),
    sourceRef: normalizeLedgerSourceRef(payload?.sourceRef),
    idempotencyKey: normalizeLedgerIdempotencyKey(payload?.idempotencyKey),
    description: normalizeLedgerDescription(payload?.description),
    metadata: normalizeJsonObject(payload?.metadata),
    relatedEntryId: normalizeText(payload?.relatedEntryId).slice(0, 190),
    createdAt,
    postedAt,
    reversedAt,
  };
}

export async function insertLedgerEntry(payload = {}, executor = pool) {
  await ensureLedgerTables();

  const normalized = normalizeLedgerRowInput(payload);
  if (!normalized.userId) {
    throw new Error('Ledger entry userId is required.');
  }

  if (!normalized.sourceId) {
    throw new Error('Ledger entry sourceId is required.');
  }

  if (normalized.idempotencyKey) {
    const existingEntry = await readLedgerEntryByIdempotencyKey(normalized.idempotencyKey, executor, { forUpdate: true });
    if (existingEntry) {
      return {
        entry: existingEntry,
        idempotent: true,
      };
    }
  }

  try {
    const result = await executor.query(`
      INSERT INTO charge.ledger_entries (
        id,
        user_id,
        username,
        email,
        type,
        direction,
        amount,
        bv_amount,
        status,
        source_type,
        source_id,
        source_ref,
        idempotency_key,
        description,
        metadata,
        related_entry_id,
        created_at,
        updated_at,
        posted_at,
        reversed_at
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15::jsonb,$16,$17,NOW(),$18,$19
      )
      RETURNING
        id,
        user_id,
        username,
        email,
        type,
        direction,
        amount,
        bv_amount,
        status,
        source_type,
        source_id,
        source_ref,
        idempotency_key,
        description,
        metadata,
        related_entry_id,
        created_at,
        updated_at,
        posted_at,
        reversed_at
    `, [
      normalized.id,
      normalized.userId,
      normalized.username,
      normalized.email,
      normalized.type,
      normalized.direction,
      normalized.amount,
      normalized.bvAmount,
      normalized.status,
      normalized.sourceType,
      normalized.sourceId,
      normalized.sourceRef,
      normalized.idempotencyKey,
      normalized.description,
      JSON.stringify(normalized.metadata),
      normalized.relatedEntryId,
      normalized.createdAt,
      normalized.postedAt || null,
      normalized.reversedAt || null,
    ]);

    return {
      entry: mapDbLedgerEntryToApp(result.rows[0] || null),
      idempotent: false,
    };
  } catch (error) {
    if (error && error.code === '23505' && normalized.idempotencyKey) {
      const existingEntry = await readLedgerEntryByIdempotencyKey(normalized.idempotencyKey, executor);
      if (existingEntry) {
        return {
          entry: existingEntry,
          idempotent: true,
        };
      }
    }
    throw error;
  }
}

export async function updateLedgerEntryStatusById(
  entryIdInput,
  statusInput,
  options = {},
  executor = pool,
) {
  await ensureLedgerTables();

  const entryId = normalizeText(entryIdInput);
  if (!entryId) {
    return null;
  }

  const status = normalizeLedgerStatus(statusInput, LEDGER_ENTRY_STATUSES.POSTED);
  const metadataPatch = normalizeJsonObject(options?.metadata);
  const description = normalizeLedgerDescription(options?.description);
  const relatedEntryId = normalizeText(options?.relatedEntryId).slice(0, 190);
  const postedAtInput = toIsoStringOrEmpty(options?.postedAt);
  const reversedAtInput = toIsoStringOrEmpty(options?.reversedAt);

  const result = await executor.query(`
    UPDATE charge.ledger_entries
    SET
      status = $2,
      description = CASE
        WHEN $3 <> '' THEN $3
        ELSE description
      END,
      metadata = CASE
        WHEN $4::jsonb = '{}'::jsonb THEN metadata
        ELSE metadata || $4::jsonb
      END,
      related_entry_id = CASE
        WHEN $5 <> '' THEN $5
        ELSE related_entry_id
      END,
      posted_at = CASE
        WHEN $2 IN ('posted', 'paid') THEN COALESCE(posted_at, NULLIF($6, '')::timestamptz, NOW())
        ELSE posted_at
      END,
      reversed_at = CASE
        WHEN $2 = 'reversed' THEN COALESCE(NULLIF($7, '')::timestamptz, NOW())
        ELSE reversed_at
      END,
      updated_at = NOW()
    WHERE id = $1
    RETURNING
      id,
      user_id,
      username,
      email,
      type,
      direction,
      amount,
      bv_amount,
      status,
      source_type,
      source_id,
      source_ref,
      idempotency_key,
      description,
      metadata,
      related_entry_id,
      created_at,
      updated_at,
      posted_at,
      reversed_at
  `, [
    entryId,
    status,
    description,
    JSON.stringify(metadataPatch),
    relatedEntryId,
    postedAtInput,
    reversedAtInput,
  ]);

  return mapDbLedgerEntryToApp(result.rows[0] || null);
}

function buildLedgerFilterClauses(filters = {}, values = []) {
  const clauses = [];

  const userId = normalizeText(filters?.userId);
  const username = normalizeCredential(filters?.username);
  const email = normalizeCredential(filters?.email);
  if (userId) {
    values.push(userId);
    clauses.push(`user_id = $${values.length}`);
  } else {
    if (username) {
      values.push(username);
      clauses.push(`LOWER(username) = $${values.length}`);
    }
    if (email) {
      values.push(email);
      clauses.push(`LOWER(email) = $${values.length}`);
    }
  }

  const userSearch = normalizeText(filters?.userSearch);
  if (userSearch) {
    values.push(`%${userSearch.toLowerCase()}%`);
    clauses.push(`(
      LOWER(user_id) LIKE $${values.length}
      OR LOWER(username) LIKE $${values.length}
      OR LOWER(email) LIKE $${values.length}
    )`);
  }

  const typeList = String(filters?.type || filters?.types || '')
    .split(',')
    .map((entry) => normalizeLedgerEntryType(entry, ''))
    .filter(Boolean);
  if (typeList.length > 0) {
    values.push(typeList);
    clauses.push(`type = ANY($${values.length}::text[])`);
  }

  const statusList = String(filters?.status || filters?.statuses || '')
    .split(',')
    .map((entry) => normalizeLedgerStatus(entry, ''))
    .filter(Boolean);
  if (statusList.length > 0) {
    values.push(statusList);
    clauses.push(`status = ANY($${values.length}::text[])`);
  }

  const sourceTypeList = String(filters?.sourceType || filters?.sourceTypes || '')
    .split(',')
    .map((entry) => normalizeLedgerSourceType(entry, ''))
    .filter(Boolean);
  if (sourceTypeList.length > 0) {
    values.push(sourceTypeList);
    clauses.push(`source_type = ANY($${values.length}::text[])`);
  }

  const sourceId = normalizeText(filters?.sourceId);
  if (sourceId) {
    values.push(sourceId);
    clauses.push(`source_id = $${values.length}`);
  }

  const search = normalizeText(filters?.search);
  if (search) {
    values.push(`%${search.toLowerCase()}%`);
    clauses.push(`(
      LOWER(id) LIKE $${values.length}
      OR LOWER(source_id) LIKE $${values.length}
      OR LOWER(source_ref) LIKE $${values.length}
      OR LOWER(description) LIKE $${values.length}
      OR LOWER(username) LIKE $${values.length}
      OR LOWER(email) LIKE $${values.length}
      OR LOWER(type) LIKE $${values.length}
    )`);
  }

  const fromDate = toIsoStringOrEmpty(filters?.fromDate || filters?.startDate);
  if (fromDate) {
    values.push(fromDate);
    clauses.push(`created_at >= $${values.length}::timestamptz`);
  }

  const toDate = toIsoStringOrEmpty(filters?.toDate || filters?.endDate);
  if (toDate) {
    values.push(toDate);
    clauses.push(`created_at <= $${values.length}::timestamptz`);
  }

  return clauses;
}

function resolveListLimit(value, fallback = 50) {
  const parsed = Number.parseInt(String(value ?? fallback), 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.min(250, Math.max(1, parsed));
}

function resolveListOffset(value, fallback = 0) {
  const parsed = Number.parseInt(String(value ?? fallback), 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(0, parsed);
}

export async function listLedgerEntries(filters = {}, executor = pool) {
  await ensureLedgerTables();

  const values = [];
  const clauses = buildLedgerFilterClauses(filters, values);
  const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
  const limit = resolveListLimit(filters?.limit, 50);
  const offset = resolveListOffset(filters?.offset, 0);

  const countResult = await executor.query(`
    SELECT COUNT(*)::bigint AS total_count
    FROM charge.ledger_entries
    ${whereClause}
  `, values);
  const totalCount = Number(countResult.rows[0]?.total_count || 0);

  values.push(limit);
  values.push(offset);
  const listResult = await executor.query(`
    SELECT
      id,
      user_id,
      username,
      email,
      type,
      direction,
      amount,
      bv_amount,
      status,
      source_type,
      source_id,
      source_ref,
      idempotency_key,
      description,
      metadata,
      related_entry_id,
      created_at,
      updated_at,
      posted_at,
      reversed_at
    FROM charge.ledger_entries
    ${whereClause}
    ORDER BY created_at DESC, id DESC
    LIMIT $${values.length - 1}
    OFFSET $${values.length}
  `, values);

  return {
    entries: listResult.rows.map(mapDbLedgerEntryToApp),
    totalCount,
    limit,
    offset,
  };
}

export async function getLedgerSummary(filters = {}, executor = pool) {
  await ensureLedgerTables();

  const values = [];
  const clauses = buildLedgerFilterClauses(filters, values);
  const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';

  const summaryResult = await executor.query(`
    WITH filtered_entries AS (
      SELECT
        type,
        direction,
        amount,
        status
      FROM charge.ledger_entries
      ${whereClause}
    )
    SELECT
      COALESCE(SUM(
        CASE
          WHEN direction = 'credit'
            AND type IN ('retail_commission', 'fast_track_commission', 'sales_team_commission', 'adjustment')
          THEN amount
          ELSE 0
        END
      ), 0)::numeric(14,2) AS total_earned,
      COALESCE(SUM(
        CASE
          WHEN status = 'pending'
          THEN CASE WHEN direction = 'credit' THEN amount ELSE -amount END
          ELSE 0
        END
      ), 0)::numeric(14,2) AS pending_balance,
      COALESCE(SUM(
        CASE
          WHEN status = 'posted'
          THEN CASE WHEN direction = 'credit' THEN amount ELSE -amount END
          ELSE 0
        END
      ), 0)::numeric(14,2) AS posted_balance,
      COALESCE(SUM(
        CASE
          WHEN status IN ('posted', 'paid')
          THEN CASE WHEN direction = 'credit' THEN amount ELSE -amount END
          ELSE 0
        END
      ), 0)::numeric(14,2) AS available_balance,
      COALESCE(SUM(
        CASE
          WHEN type = 'payout' AND direction = 'debit' AND status = 'paid'
          THEN amount
          ELSE 0
        END
      ), 0)::numeric(14,2) AS paid_out_amount,
      COALESCE(SUM(
        CASE
          WHEN type = 'reversal' AND direction = 'debit'
          THEN amount
          ELSE 0
        END
      ), 0)::numeric(14,2) AS reversed_amount
    FROM filtered_entries
  `, values);

  const byStatusResult = await executor.query(`
    SELECT
      status,
      COALESCE(SUM(
        CASE WHEN direction = 'credit' THEN amount ELSE -amount END
      ), 0)::numeric(14,2) AS net_amount
    FROM charge.ledger_entries
    ${whereClause}
    GROUP BY status
  `, values);

  const byTypeResult = await executor.query(`
    SELECT
      type,
      COUNT(*)::bigint AS entry_count,
      COALESCE(SUM(
        CASE WHEN direction = 'credit' THEN amount ELSE -amount END
      ), 0)::numeric(14,2) AS net_amount
    FROM charge.ledger_entries
    ${whereClause}
    GROUP BY type
  `, values);

  const summaryRow = summaryResult.rows[0] || {};
  const byStatus = {};
  byStatusResult.rows.forEach((row) => {
    byStatus[normalizeLedgerStatus(row?.status, row?.status || '')] = roundCurrencyAmount(row?.net_amount, 0);
  });

  const byType = {};
  byTypeResult.rows.forEach((row) => {
    const typeKey = normalizeLedgerEntryType(row?.type, row?.type || '');
    byType[typeKey] = {
      count: Number(row?.entry_count || 0),
      netAmount: roundCurrencyAmount(row?.net_amount, 0),
    };
  });

  return {
    totalEarned: roundCurrencyAmount(summaryRow.total_earned, 0),
    pendingBalance: roundCurrencyAmount(summaryRow.pending_balance, 0),
    postedBalance: roundCurrencyAmount(summaryRow.posted_balance, 0),
    availableBalance: roundCurrencyAmount(summaryRow.available_balance, 0),
    paidOutAmount: roundCurrencyAmount(summaryRow.paid_out_amount, 0),
    reversedAmount: roundCurrencyAmount(summaryRow.reversed_amount, 0),
    byStatus,
    byType,
  };
}
