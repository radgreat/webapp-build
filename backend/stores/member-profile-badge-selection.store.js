import pool from '../db/db.js';
import adminPool from '../db/admin-db.js';

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

function mapDbSelectionToApp(row) {
  if (!row) {
    return null;
  }

  return {
    userId: normalizeText(row.user_id),
    achievementId: normalizeText(row.achievement_id),
    createdAt: toIsoStringOrEmpty(row.created_at),
    updatedAt: toIsoStringOrEmpty(row.updated_at),
  };
}

let memberProfileBadgeSelectionSchemaReady = false;
let memberProfileBadgeSelectionSchemaPromise = null;

async function runMemberProfileBadgeSelectionSchemaMigrations(executor = pool) {
  await executor.query(`
    CREATE INDEX IF NOT EXISTS member_profile_badge_selection_updated_idx
    ON charge.member_profile_badge_selection (updated_at DESC)
  `);
}

async function installMemberProfileBadgeSelectionTableViaAdmin() {
  const client = await adminPool.connect();
  let transactionClosed = false;

  try {
    await client.query('BEGIN');
    await client.query(`
      CREATE TABLE IF NOT EXISTS charge.member_profile_badge_selection (
        user_id text PRIMARY KEY,
        achievement_id text NOT NULL DEFAULT '',
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW()
      )
    `);

    await runMemberProfileBadgeSelectionSchemaMigrations(client);

    const serviceRole = normalizeText(process.env.DB_USER);
    if (serviceRole) {
      const quotedServiceRole = quoteIdentifier(serviceRole);
      await client.query(`GRANT USAGE ON SCHEMA charge TO ${quotedServiceRole}`);
      await client.query(`
        GRANT SELECT, INSERT, UPDATE, DELETE
        ON TABLE charge.member_profile_badge_selection
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

async function installMemberProfileBadgeSelectionTableViaServiceRole() {
  const client = await pool.connect();
  let transactionClosed = false;

  try {
    await client.query('BEGIN');
    await client.query(`
      CREATE TABLE IF NOT EXISTS charge.member_profile_badge_selection (
        user_id text PRIMARY KEY,
        achievement_id text NOT NULL DEFAULT '',
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW()
      )
    `);

    await runMemberProfileBadgeSelectionSchemaMigrations(client);

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

export async function ensureMemberProfileBadgeSelectionTables() {
  if (memberProfileBadgeSelectionSchemaReady) {
    return;
  }

  if (memberProfileBadgeSelectionSchemaPromise) {
    return memberProfileBadgeSelectionSchemaPromise;
  }

  memberProfileBadgeSelectionSchemaPromise = (async () => {
    const probe = await pool.query(`
      SELECT to_regclass('charge.member_profile_badge_selection') AS table_name
    `);

    let tableName = probe.rows?.[0]?.table_name || null;
    if (!tableName) {
      try {
        await installMemberProfileBadgeSelectionTableViaAdmin();
      } catch {
        await installMemberProfileBadgeSelectionTableViaServiceRole();
      }

      const recheck = await pool.query(`
        SELECT to_regclass('charge.member_profile_badge_selection') AS table_name
      `);
      tableName = recheck.rows?.[0]?.table_name || null;
      if (!tableName) {
        throw new Error(
          'Member profile badge selection table is not installed in schema "charge". Install "charge.member_profile_badge_selection" first.',
        );
      }
    }

    await runMemberProfileBadgeSelectionSchemaMigrations(pool);
    await pool.query('SELECT 1 FROM charge.member_profile_badge_selection LIMIT 1');
    memberProfileBadgeSelectionSchemaReady = true;
  })().catch((error) => {
    memberProfileBadgeSelectionSchemaReady = false;
    throw error;
  }).finally(() => {
    if (!memberProfileBadgeSelectionSchemaReady) {
      memberProfileBadgeSelectionSchemaPromise = null;
    }
  });

  return memberProfileBadgeSelectionSchemaPromise;
}

export async function readMemberProfileBadgeSelectionByUserId(userIdInput, executor = pool) {
  await ensureMemberProfileBadgeSelectionTables();

  const userId = normalizeText(userIdInput);
  if (!userId) {
    return null;
  }

  const result = await executor.query(`
    SELECT
      user_id,
      achievement_id,
      created_at,
      updated_at
    FROM charge.member_profile_badge_selection
    WHERE user_id = $1
    LIMIT 1
  `, [userId]);

  return mapDbSelectionToApp(result.rows[0] || null);
}

export async function upsertMemberProfileBadgeSelection(selectionPayload = {}, executor = pool) {
  await ensureMemberProfileBadgeSelectionTables();

  const userId = normalizeText(selectionPayload?.userId);
  const achievementId = normalizeText(selectionPayload?.achievementId);
  if (!userId) {
    return null;
  }

  const result = await executor.query(`
    INSERT INTO charge.member_profile_badge_selection (
      user_id,
      achievement_id
    )
    VALUES ($1, $2)
    ON CONFLICT (user_id)
    DO UPDATE
    SET
      achievement_id = EXCLUDED.achievement_id,
      updated_at = NOW()
    RETURNING
      user_id,
      achievement_id,
      created_at,
      updated_at
  `, [
    userId,
    achievementId,
  ]);

  return mapDbSelectionToApp(result.rows[0] || null);
}
