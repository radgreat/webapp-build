import pool from '../db/db.js';
import adminPool from '../db/admin-db.js';

const DEFAULT_COMMISSION_CONTAINER_BALANCES = Object.freeze({
  fasttrack: 0,
  infinitybuilder: 0,
  legacyleadership: 0,
  salesteam: 0,
});

const DEFAULT_COMMISSION_CONTAINER_CLAIM_MAPS = Object.freeze({
  infinitybuilder: Object.freeze({}),
  legacyleadership: Object.freeze({}),
});

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

function roundCurrencyAmount(value) {
  return Math.round((Math.max(0, Number(value) || 0)) * 100) / 100;
}

function quoteIdentifier(value) {
  return `"${String(value || '').replace(/"/g, '""')}"`;
}

function toWholeNumber(value, fallback = 0) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }
  return Math.max(0, Math.floor(numeric));
}

export function createDefaultCommissionContainerBalances() {
  return {
    fasttrack: 0,
    infinitybuilder: 0,
    legacyleadership: 0,
    salesteam: 0,
  };
}

export function sanitizeCommissionContainerBalances(balanceInput = {}) {
  const source = balanceInput && typeof balanceInput === 'object'
    ? balanceInput
    : {};
  const nextBalances = createDefaultCommissionContainerBalances();

  Object.keys(nextBalances).forEach((sourceKey) => {
    nextBalances[sourceKey] = roundCurrencyAmount(source[sourceKey]);
  });

  return nextBalances;
}

export function sanitizeCommissionContainerClaimMap(claimMapInput = {}) {
  const source = claimMapInput && typeof claimMapInput === 'object'
    ? claimMapInput
    : {};
  const sanitizedClaimMap = {};

  Object.entries(source).forEach(([tierKey, claimRecord]) => {
    const tierNumber = toWholeNumber(tierKey, 0);
    if (tierNumber <= 0) {
      return;
    }

    const safeRecord = claimRecord && typeof claimRecord === 'object'
      ? claimRecord
      : {};
    const seedHandles = Array.isArray(safeRecord.seedHandles)
      ? safeRecord.seedHandles
        .map((handle) => normalizeText(handle))
        .filter(Boolean)
      : [];

    const normalizedTierNumber = toWholeNumber(safeRecord.tierNumber, tierNumber);
    sanitizedClaimMap[String(tierNumber)] = {
      tierNumber: normalizedTierNumber > 0 ? normalizedTierNumber : tierNumber,
      startedAt: normalizeText(safeRecord.startedAt),
      claimedAt: normalizeText(safeRecord.claimedAt),
      amount: roundCurrencyAmount(safeRecord.amount),
      completedNodeCount: toWholeNumber(safeRecord.completedNodeCount, 0),
      seedHandles,
    };
  });

  return sanitizedClaimMap;
}

export function sanitizeCommissionContainerClaimMaps(claimMapsInput = {}) {
  const source = claimMapsInput && typeof claimMapsInput === 'object'
    ? claimMapsInput
    : {};

  return {
    infinitybuilder: sanitizeCommissionContainerClaimMap(source.infinitybuilder),
    legacyleadership: sanitizeCommissionContainerClaimMap(source.legacyleadership),
  };
}

export function buildDefaultCommissionContainerSnapshot(identityPayload = {}) {
  return {
    userId: normalizeText(identityPayload?.userId),
    username: normalizeText(identityPayload?.username),
    email: normalizeText(identityPayload?.email),
    currencyCode: normalizeText(identityPayload?.currencyCode || 'USD').toUpperCase() || 'USD',
    balances: createDefaultCommissionContainerBalances(),
    claimMaps: {
      infinitybuilder: {},
      legacyleadership: {},
    },
    createdAt: '',
    updatedAt: '',
  };
}

function mapDbCommissionContainerToApp(row) {
  if (!row) {
    return null;
  }

  const claimMaps = sanitizeCommissionContainerClaimMaps({
    infinitybuilder: row.infinitybuilder_claim_map,
    legacyleadership: row.legacyleadership_claim_map,
  });

  return {
    userId: row.user_id || '',
    username: row.username || '',
    email: row.email || '',
    currencyCode: row.currency_code || 'USD',
    balances: sanitizeCommissionContainerBalances({
      fasttrack: row.fasttrack_balance,
      infinitybuilder: row.infinitybuilder_balance,
      legacyleadership: row.legacyleadership_balance,
      salesteam: row.salesteam_balance,
    }),
    claimMaps,
    createdAt: toIsoStringOrEmpty(row.created_at),
    updatedAt: toIsoStringOrEmpty(row.updated_at),
  };
}

let commissionContainerSchemaReady = false;
let commissionContainerSchemaPromise = null;

async function installCommissionContainerTableViaAdmin() {
  const client = await adminPool.connect();
  let transactionClosed = false;

  try {
    await client.query('BEGIN');
    await client.query(`
      CREATE TABLE IF NOT EXISTS charge.member_commission_containers (
        user_id text PRIMARY KEY,
        username text NOT NULL DEFAULT '',
        email text NOT NULL DEFAULT '',
        currency_code text NOT NULL DEFAULT 'USD',
        fasttrack_balance numeric(14,2) NOT NULL DEFAULT 0,
        infinitybuilder_balance numeric(14,2) NOT NULL DEFAULT 0,
        legacyleadership_balance numeric(14,2) NOT NULL DEFAULT 0,
        salesteam_balance numeric(14,2) NOT NULL DEFAULT 0,
        infinitybuilder_claim_map jsonb NOT NULL DEFAULT '{}'::jsonb,
        legacyleadership_claim_map jsonb NOT NULL DEFAULT '{}'::jsonb,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW(),
        CONSTRAINT member_commission_containers_fasttrack_balance_check CHECK (fasttrack_balance >= 0),
        CONSTRAINT member_commission_containers_infinitybuilder_balance_check CHECK (infinitybuilder_balance >= 0),
        CONSTRAINT member_commission_containers_legacyleadership_balance_check CHECK (legacyleadership_balance >= 0),
        CONSTRAINT member_commission_containers_salesteam_balance_check CHECK (salesteam_balance >= 0)
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS member_commission_containers_username_lower_idx
      ON charge.member_commission_containers (LOWER(username))
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS member_commission_containers_email_lower_idx
      ON charge.member_commission_containers (LOWER(email))
    `);

    const serviceRole = normalizeText(process.env.DB_USER);
    if (serviceRole) {
      const quotedServiceRole = quoteIdentifier(serviceRole);
      await client.query(`GRANT USAGE ON SCHEMA charge TO ${quotedServiceRole}`);
      await client.query(`
        GRANT SELECT, INSERT, UPDATE, DELETE
        ON TABLE charge.member_commission_containers
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

export async function ensureCommissionContainerTables() {
  if (commissionContainerSchemaReady) {
    return;
  }

  if (commissionContainerSchemaPromise) {
    return commissionContainerSchemaPromise;
  }

  commissionContainerSchemaPromise = (async () => {
    const result = await pool.query(`
      SELECT to_regclass('charge.member_commission_containers') AS table_name
    `);

    let row = result.rows[0] || {};
    if (!row.table_name) {
      await installCommissionContainerTableViaAdmin();

      const recheck = await pool.query(`
        SELECT to_regclass('charge.member_commission_containers') AS table_name
      `);
      row = recheck.rows[0] || {};

      if (!row.table_name) {
        throw new Error(
          'Commission container table is not installed in schema "charge". Install "charge.member_commission_containers" first.',
        );
      }
    }

    await pool.query('SELECT 1 FROM charge.member_commission_containers LIMIT 1');
    commissionContainerSchemaReady = true;
  })().catch((error) => {
    commissionContainerSchemaReady = false;
    throw error;
  }).finally(() => {
    if (!commissionContainerSchemaReady) {
      commissionContainerSchemaPromise = null;
    }
  });

  return commissionContainerSchemaPromise;
}

export async function readCommissionContainerByUserId(userIdInput, executor = pool) {
  await ensureCommissionContainerTables();

  const userId = normalizeText(userIdInput);
  if (!userId) {
    return null;
  }

  const result = await executor.query(`
    SELECT
      user_id,
      username,
      email,
      currency_code,
      fasttrack_balance,
      infinitybuilder_balance,
      legacyleadership_balance,
      salesteam_balance,
      infinitybuilder_claim_map,
      legacyleadership_claim_map,
      created_at,
      updated_at
    FROM charge.member_commission_containers
    WHERE user_id = $1
    LIMIT 1
  `, [userId]);

  return mapDbCommissionContainerToApp(result.rows[0] || null);
}

export async function readCommissionContainerByIdentity(identityPayload = {}, executor = pool) {
  await ensureCommissionContainerTables();

  const userId = normalizeText(identityPayload?.userId);
  if (userId) {
    return readCommissionContainerByUserId(userId, executor);
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
      currency_code,
      fasttrack_balance,
      infinitybuilder_balance,
      legacyleadership_balance,
      salesteam_balance,
      infinitybuilder_claim_map,
      legacyleadership_claim_map,
      created_at,
      updated_at
    FROM charge.member_commission_containers
    WHERE ${clauses.join(' OR ')}
    ORDER BY updated_at DESC
    LIMIT 1
  `, values);

  return mapDbCommissionContainerToApp(result.rows[0] || null);
}

export async function upsertCommissionContainerByUserId(containerPayload = {}, executor = pool) {
  await ensureCommissionContainerTables();

  const userId = normalizeText(containerPayload?.userId);
  if (!userId) {
    return null;
  }

  const username = normalizeText(containerPayload?.username);
  const email = normalizeText(containerPayload?.email);
  const currencyCode = normalizeText(containerPayload?.currencyCode || 'USD').toUpperCase() || 'USD';
  const balances = sanitizeCommissionContainerBalances(containerPayload?.balances);
  const claimMaps = sanitizeCommissionContainerClaimMaps(containerPayload?.claimMaps);

  const result = await executor.query(`
    INSERT INTO charge.member_commission_containers (
      user_id,
      username,
      email,
      currency_code,
      fasttrack_balance,
      infinitybuilder_balance,
      legacyleadership_balance,
      salesteam_balance,
      infinitybuilder_claim_map,
      legacyleadership_claim_map
    )
    VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10::jsonb
    )
    ON CONFLICT (user_id)
    DO UPDATE SET
      username = CASE
        WHEN EXCLUDED.username <> '' THEN EXCLUDED.username
        ELSE charge.member_commission_containers.username
      END,
      email = CASE
        WHEN EXCLUDED.email <> '' THEN EXCLUDED.email
        ELSE charge.member_commission_containers.email
      END,
      currency_code = CASE
        WHEN EXCLUDED.currency_code <> '' THEN EXCLUDED.currency_code
        ELSE charge.member_commission_containers.currency_code
      END,
      fasttrack_balance = EXCLUDED.fasttrack_balance,
      infinitybuilder_balance = EXCLUDED.infinitybuilder_balance,
      legacyleadership_balance = EXCLUDED.legacyleadership_balance,
      salesteam_balance = EXCLUDED.salesteam_balance,
      infinitybuilder_claim_map = EXCLUDED.infinitybuilder_claim_map,
      legacyleadership_claim_map = EXCLUDED.legacyleadership_claim_map,
      updated_at = NOW()
    RETURNING
      user_id,
      username,
      email,
      currency_code,
      fasttrack_balance,
      infinitybuilder_balance,
      legacyleadership_balance,
      salesteam_balance,
      infinitybuilder_claim_map,
      legacyleadership_claim_map,
      created_at,
      updated_at
  `, [
    userId,
    username,
    email,
    currencyCode,
    balances.fasttrack,
    balances.infinitybuilder,
    balances.legacyleadership,
    balances.salesteam,
    JSON.stringify(claimMaps.infinitybuilder),
    JSON.stringify(claimMaps.legacyleadership),
  ]);

  return mapDbCommissionContainerToApp(result.rows[0] || null);
}

export {
  DEFAULT_COMMISSION_CONTAINER_BALANCES,
  DEFAULT_COMMISSION_CONTAINER_CLAIM_MAPS,
};
