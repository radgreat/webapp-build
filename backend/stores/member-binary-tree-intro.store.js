import pool from '../db/db.js';
import adminPool, { isAdminDbConfigured } from '../db/admin-db.js';

const PINNED_NODE_IDS_LIMIT = 10;
const TIER_SORT_DIRECTION_ASC = 'asc';
const TIER_SORT_DIRECTION_DESC = 'desc';

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

function quoteIdentifier(value) {
  return `"${String(value || '').replace(/"/g, '""')}"`;
}

function normalizePinnedNodeIds(value) {
  const source = Array.isArray(value) ? value : [];
  const deduped = [];
  const seen = new Set();

  for (const rawNodeId of source) {
    const nodeId = normalizeText(rawNodeId);
    if (!nodeId || seen.has(nodeId)) {
      continue;
    }
    seen.add(nodeId);
    deduped.push(nodeId);
    if (deduped.length >= PINNED_NODE_IDS_LIMIT) {
      break;
    }
  }

  return deduped;
}

function normalizeTierSortDirection(value) {
  const normalized = normalizeText(value).toLowerCase();
  return normalized === TIER_SORT_DIRECTION_DESC
    ? TIER_SORT_DIRECTION_DESC
    : TIER_SORT_DIRECTION_ASC;
}

function normalizeTierSortDirections(value = {}) {
  const source = value && typeof value === 'object' ? value : {};
  return {
    infinityBuilderTierSortDirection: normalizeTierSortDirection(
      source.infinityBuilderTierSortDirection
        || source.infinityBuilder
        || source.infinity_builder_tier_sort_direction
        || source.infinity_builder
        || '',
    ),
    legacyLeadershipTierSortDirection: normalizeTierSortDirection(
      source.legacyLeadershipTierSortDirection
        || source.legacyLeadership
        || source.legacy_leadership_tier_sort_direction
        || source.legacy_leadership
        || '',
    ),
  };
}

function mapDbIntroStateToApp(row) {
  if (!row) {
    return null;
  }
  return {
    userId: normalizeText(row.user_id),
    firstOpenedAt: toIsoStringOrEmpty(row.first_opened_at),
    lastOpenedAt: toIsoStringOrEmpty(row.last_opened_at),
    pinnedNodeIds: normalizePinnedNodeIds(row.pinned_node_ids),
    pinnedNodeIdsUpdatedAt: toIsoStringOrEmpty(row.pinned_node_ids_updated_at),
    infinityBuilderTierSortDirection: normalizeTierSortDirection(row.infinity_builder_tier_sort_direction),
    legacyLeadershipTierSortDirection: normalizeTierSortDirection(row.legacy_leadership_tier_sort_direction),
    tierSortDirectionsUpdatedAt: toIsoStringOrEmpty(row.tier_sort_directions_updated_at),
    updatedAt: toIsoStringOrEmpty(row.updated_at),
  };
}

let introSchemaReady = false;
let introSchemaPromise = null;

async function installIntroTableViaAdmin() {
  const client = await adminPool.connect();
  let transactionClosed = false;

  try {
    await client.query('BEGIN');
    await client.query(`
      CREATE TABLE IF NOT EXISTS charge.member_binary_tree_intro_state (
        user_id text PRIMARY KEY,
        first_opened_at timestamptz NOT NULL DEFAULT NOW(),
        last_opened_at timestamptz NOT NULL DEFAULT NOW(),
        pinned_node_ids text[] NOT NULL DEFAULT ARRAY[]::text[],
        pinned_node_ids_updated_at timestamptz,
        infinity_builder_tier_sort_direction text NOT NULL DEFAULT 'asc',
        legacy_leadership_tier_sort_direction text NOT NULL DEFAULT 'asc',
        tier_sort_directions_updated_at timestamptz,
        updated_at timestamptz NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`
      ALTER TABLE charge.member_binary_tree_intro_state
      ADD COLUMN IF NOT EXISTS pinned_node_ids text[] NOT NULL DEFAULT ARRAY[]::text[]
    `);
    await client.query(`
      ALTER TABLE charge.member_binary_tree_intro_state
      ADD COLUMN IF NOT EXISTS pinned_node_ids_updated_at timestamptz
    `);
    await client.query(`
      ALTER TABLE charge.member_binary_tree_intro_state
      ADD COLUMN IF NOT EXISTS infinity_builder_tier_sort_direction text NOT NULL DEFAULT 'asc'
    `);
    await client.query(`
      ALTER TABLE charge.member_binary_tree_intro_state
      ADD COLUMN IF NOT EXISTS legacy_leadership_tier_sort_direction text NOT NULL DEFAULT 'asc'
    `);
    await client.query(`
      ALTER TABLE charge.member_binary_tree_intro_state
      ADD COLUMN IF NOT EXISTS tier_sort_directions_updated_at timestamptz
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS member_binary_tree_intro_state_last_opened_at_idx
      ON charge.member_binary_tree_intro_state (last_opened_at)
    `);

    const serviceRole = normalizeText(process.env.DB_USER);
    if (serviceRole) {
      const quotedServiceRole = quoteIdentifier(serviceRole);
      await client.query(`GRANT USAGE ON SCHEMA charge TO ${quotedServiceRole}`);
      await client.query(`
        GRANT SELECT, INSERT, UPDATE
        ON TABLE charge.member_binary_tree_intro_state
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

async function installIntroTableViaServiceRole() {
  const client = await pool.connect();
  let transactionClosed = false;

  try {
    await client.query('BEGIN');
    await client.query(`
      CREATE TABLE IF NOT EXISTS charge.member_binary_tree_intro_state (
        user_id text PRIMARY KEY,
        first_opened_at timestamptz NOT NULL DEFAULT NOW(),
        last_opened_at timestamptz NOT NULL DEFAULT NOW(),
        pinned_node_ids text[] NOT NULL DEFAULT ARRAY[]::text[],
        pinned_node_ids_updated_at timestamptz,
        infinity_builder_tier_sort_direction text NOT NULL DEFAULT 'asc',
        legacy_leadership_tier_sort_direction text NOT NULL DEFAULT 'asc',
        tier_sort_directions_updated_at timestamptz,
        updated_at timestamptz NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`
      ALTER TABLE charge.member_binary_tree_intro_state
      ADD COLUMN IF NOT EXISTS pinned_node_ids text[] NOT NULL DEFAULT ARRAY[]::text[]
    `);
    await client.query(`
      ALTER TABLE charge.member_binary_tree_intro_state
      ADD COLUMN IF NOT EXISTS pinned_node_ids_updated_at timestamptz
    `);
    await client.query(`
      ALTER TABLE charge.member_binary_tree_intro_state
      ADD COLUMN IF NOT EXISTS infinity_builder_tier_sort_direction text NOT NULL DEFAULT 'asc'
    `);
    await client.query(`
      ALTER TABLE charge.member_binary_tree_intro_state
      ADD COLUMN IF NOT EXISTS legacy_leadership_tier_sort_direction text NOT NULL DEFAULT 'asc'
    `);
    await client.query(`
      ALTER TABLE charge.member_binary_tree_intro_state
      ADD COLUMN IF NOT EXISTS tier_sort_directions_updated_at timestamptz
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS member_binary_tree_intro_state_last_opened_at_idx
      ON charge.member_binary_tree_intro_state (last_opened_at)
    `);
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

async function ensureIntroTableColumns(executor) {
  await executor.query(`
    ALTER TABLE charge.member_binary_tree_intro_state
    ADD COLUMN IF NOT EXISTS pinned_node_ids text[] NOT NULL DEFAULT ARRAY[]::text[]
  `);
  await executor.query(`
    ALTER TABLE charge.member_binary_tree_intro_state
    ADD COLUMN IF NOT EXISTS pinned_node_ids_updated_at timestamptz
  `);
  await executor.query(`
    ALTER TABLE charge.member_binary_tree_intro_state
    ADD COLUMN IF NOT EXISTS infinity_builder_tier_sort_direction text NOT NULL DEFAULT 'asc'
  `);
  await executor.query(`
    ALTER TABLE charge.member_binary_tree_intro_state
    ADD COLUMN IF NOT EXISTS legacy_leadership_tier_sort_direction text NOT NULL DEFAULT 'asc'
  `);
  await executor.query(`
    ALTER TABLE charge.member_binary_tree_intro_state
    ADD COLUMN IF NOT EXISTS tier_sort_directions_updated_at timestamptz
  `);
}

export async function ensureMemberBinaryTreeIntroTable() {
  if (introSchemaReady) {
    return;
  }
  if (introSchemaPromise) {
    return introSchemaPromise;
  }

  introSchemaPromise = (async () => {
    const probe = await pool.query(`
      SELECT to_regclass('charge.member_binary_tree_intro_state') AS table_name
    `);
    let tableName = probe.rows?.[0]?.table_name || null;

    if (!tableName) {
      let installed = false;
      if (isAdminDbConfigured()) {
        try {
          await installIntroTableViaAdmin();
          installed = true;
        } catch {
          installed = false;
        }
      }
      if (!installed) {
        await installIntroTableViaServiceRole();
      }

      const recheck = await pool.query(`
        SELECT to_regclass('charge.member_binary_tree_intro_state') AS table_name
      `);
      tableName = recheck.rows?.[0]?.table_name || null;
      if (!tableName) {
        throw new Error(
          'Binary tree intro table is not installed in schema "charge".',
        );
      }
    }

    let columnsEnsured = false;
    if (isAdminDbConfigured()) {
      try {
        await ensureIntroTableColumns(adminPool);
        columnsEnsured = true;
      } catch {
        columnsEnsured = false;
      }
    }
    if (!columnsEnsured) {
      await ensureIntroTableColumns(pool);
    }

    await pool.query('SELECT 1 FROM charge.member_binary_tree_intro_state LIMIT 1');
    introSchemaReady = true;
  })().catch((error) => {
    introSchemaReady = false;
    throw error;
  }).finally(() => {
    if (!introSchemaReady) {
      introSchemaPromise = null;
    }
  });

  return introSchemaPromise;
}

export async function readMemberBinaryTreeIntroStateByUserId(userIdInput, executor = pool) {
  await ensureMemberBinaryTreeIntroTable();

  const userId = normalizeText(userIdInput);
  if (!userId) {
    return null;
  }

  const result = await executor.query(`
    SELECT
      user_id,
      first_opened_at,
      last_opened_at,
      pinned_node_ids,
      pinned_node_ids_updated_at,
      infinity_builder_tier_sort_direction,
      legacy_leadership_tier_sort_direction,
      tier_sort_directions_updated_at,
      updated_at
    FROM charge.member_binary_tree_intro_state
    WHERE user_id = $1
    LIMIT 1
  `, [userId]);

  return mapDbIntroStateToApp(result.rows[0] || null);
}

export async function touchMemberBinaryTreeIntroStateByUserId(userIdInput, executor = pool) {
  await ensureMemberBinaryTreeIntroTable();

  const userId = normalizeText(userIdInput);
  if (!userId) {
    return null;
  }

  const existing = await readMemberBinaryTreeIntroStateByUserId(userId, executor);
  if (existing) {
    const result = await executor.query(`
      UPDATE charge.member_binary_tree_intro_state
      SET
        last_opened_at = NOW(),
        updated_at = NOW()
      WHERE user_id = $1
      RETURNING
        user_id,
        first_opened_at,
        last_opened_at,
        pinned_node_ids,
        pinned_node_ids_updated_at,
        infinity_builder_tier_sort_direction,
        legacy_leadership_tier_sort_direction,
        tier_sort_directions_updated_at,
        updated_at
    `, [userId]);
    return {
      firstTime: false,
      state: mapDbIntroStateToApp(result.rows[0] || null),
    };
  }

  try {
    const result = await executor.query(`
      INSERT INTO charge.member_binary_tree_intro_state (
        user_id,
        first_opened_at,
        last_opened_at,
        pinned_node_ids,
        pinned_node_ids_updated_at,
        infinity_builder_tier_sort_direction,
        legacy_leadership_tier_sort_direction,
        tier_sort_directions_updated_at,
        updated_at
      )
      VALUES ($1, NOW(), NOW(), ARRAY[]::text[], NULL, 'asc', 'asc', NULL, NOW())
      RETURNING
        user_id,
        first_opened_at,
        last_opened_at,
        pinned_node_ids,
        pinned_node_ids_updated_at,
        infinity_builder_tier_sort_direction,
        legacy_leadership_tier_sort_direction,
        tier_sort_directions_updated_at,
        updated_at
    `, [userId]);

    return {
      firstTime: true,
      state: mapDbIntroStateToApp(result.rows[0] || null),
    };
  } catch (error) {
    if (normalizeText(error?.code) !== '23505') {
      throw error;
    }
    const result = await executor.query(`
      UPDATE charge.member_binary_tree_intro_state
      SET
        last_opened_at = NOW(),
        updated_at = NOW()
      WHERE user_id = $1
      RETURNING
        user_id,
        first_opened_at,
        last_opened_at,
        pinned_node_ids,
        pinned_node_ids_updated_at,
        infinity_builder_tier_sort_direction,
        legacy_leadership_tier_sort_direction,
        tier_sort_directions_updated_at,
        updated_at
    `, [userId]);
    return {
      firstTime: false,
      state: mapDbIntroStateToApp(result.rows[0] || null),
    };
  }
}

export async function deleteMemberBinaryTreeIntroStateByUserId(userIdInput, executor = pool) {
  await ensureMemberBinaryTreeIntroTable();

  const userId = normalizeText(userIdInput);
  if (!userId) {
    return {
      deleted: false,
      rowCount: 0,
    };
  }

  const result = await executor.query(`
    DELETE FROM charge.member_binary_tree_intro_state
    WHERE user_id = $1
  `, [userId]);

  const rowCount = Math.max(0, Number(result?.rowCount || 0));
  return {
    deleted: rowCount > 0,
    rowCount,
  };
}

export async function updateMemberBinaryTreePinnedNodeIdsByUserId(
  userIdInput,
  pinnedNodeIdsInput = [],
  executor = pool,
) {
  await ensureMemberBinaryTreeIntroTable();

  const userId = normalizeText(userIdInput);
  if (!userId) {
    return null;
  }

  const pinnedNodeIds = normalizePinnedNodeIds(pinnedNodeIdsInput);
  const result = await executor.query(`
    INSERT INTO charge.member_binary_tree_intro_state (
      user_id,
      first_opened_at,
      last_opened_at,
      pinned_node_ids,
      pinned_node_ids_updated_at,
      infinity_builder_tier_sort_direction,
      legacy_leadership_tier_sort_direction,
      tier_sort_directions_updated_at,
      updated_at
    )
    VALUES ($1, NOW(), NOW(), $2::text[], NOW(), 'asc', 'asc', NULL, NOW())
    ON CONFLICT (user_id)
    DO UPDATE SET
      pinned_node_ids = EXCLUDED.pinned_node_ids,
      pinned_node_ids_updated_at = NOW(),
      updated_at = NOW()
    RETURNING
      user_id,
      first_opened_at,
      last_opened_at,
      pinned_node_ids,
      pinned_node_ids_updated_at,
      infinity_builder_tier_sort_direction,
      legacy_leadership_tier_sort_direction,
      tier_sort_directions_updated_at,
      updated_at
  `, [userId, pinnedNodeIds]);

  return mapDbIntroStateToApp(result.rows[0] || null);
}

export async function updateMemberBinaryTreeTierSortDirectionsByUserId(
  userIdInput,
  tierSortDirectionsInput = {},
  executor = pool,
) {
  await ensureMemberBinaryTreeIntroTable();

  const userId = normalizeText(userIdInput);
  if (!userId) {
    return null;
  }

  const nextDirections = normalizeTierSortDirections(tierSortDirectionsInput);
  const result = await executor.query(`
    INSERT INTO charge.member_binary_tree_intro_state (
      user_id,
      first_opened_at,
      last_opened_at,
      pinned_node_ids,
      pinned_node_ids_updated_at,
      infinity_builder_tier_sort_direction,
      legacy_leadership_tier_sort_direction,
      tier_sort_directions_updated_at,
      updated_at
    )
    VALUES ($1, NOW(), NOW(), ARRAY[]::text[], NULL, $2::text, $3::text, NOW(), NOW())
    ON CONFLICT (user_id)
    DO UPDATE SET
      infinity_builder_tier_sort_direction = EXCLUDED.infinity_builder_tier_sort_direction,
      legacy_leadership_tier_sort_direction = EXCLUDED.legacy_leadership_tier_sort_direction,
      tier_sort_directions_updated_at = NOW(),
      updated_at = NOW()
    RETURNING
      user_id,
      first_opened_at,
      last_opened_at,
      pinned_node_ids,
      pinned_node_ids_updated_at,
      infinity_builder_tier_sort_direction,
      legacy_leadership_tier_sort_direction,
      tier_sort_directions_updated_at,
      updated_at
  `, [
    userId,
    nextDirections.infinityBuilderTierSortDirection,
    nextDirections.legacyLeadershipTierSortDirection,
  ]);

  return mapDbIntroStateToApp(result.rows[0] || null);
}
