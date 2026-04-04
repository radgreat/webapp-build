import pool from '../db/db.js';
import adminPool from '../db/admin-db.js';

function normalizeText(value) {
  return String(value || '').trim();
}

function toSignedWholeNumber(value, fallback = -1) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }
  return Math.floor(numeric);
}

function toWholeNumber(value, fallback = 0) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }
  return Math.max(0, Math.floor(numeric));
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

function mapDbRankAdvancementMonthlyRowToApp(row) {
  if (!row) {
    return null;
  }

  return {
    userId: normalizeText(row.user_id),
    periodKey: normalizeText(row.period_key),
    highestRank: normalizeText(row.highest_rank),
    highestRankIndex: Math.max(-1, toSignedWholeNumber(row.highest_rank_index, -1)),
    highestRankAchievementId: normalizeText(row.highest_rank_achievement_id),
    highestRequiredCycles: toWholeNumber(row.highest_required_cycles, 0),
    highestAchievedAt: toIsoStringOrEmpty(row.highest_achieved_at),
    createdAt: toIsoStringOrEmpty(row.created_at),
    updatedAt: toIsoStringOrEmpty(row.updated_at),
  };
}

let memberRankAdvancementSchemaReady = false;
let memberRankAdvancementSchemaPromise = null;

async function installMemberRankAdvancementTableViaAdmin() {
  const client = await adminPool.connect();
  let transactionClosed = false;

  try {
    await client.query('BEGIN');
    await client.query(`
      CREATE TABLE IF NOT EXISTS charge.member_rank_advancement_monthly_progress (
        user_id text NOT NULL,
        period_key text NOT NULL,
        highest_rank text NOT NULL DEFAULT '',
        highest_rank_index integer NOT NULL DEFAULT -1,
        highest_rank_achievement_id text NOT NULL DEFAULT '',
        highest_required_cycles integer NOT NULL DEFAULT 0,
        highest_achieved_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, period_key),
        CONSTRAINT member_rank_advancement_monthly_progress_rank_index_check CHECK (highest_rank_index >= -1),
        CONSTRAINT member_rank_advancement_monthly_progress_required_cycles_check CHECK (highest_required_cycles >= 0)
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS member_rank_advancement_monthly_progress_period_idx
      ON charge.member_rank_advancement_monthly_progress (period_key)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS member_rank_advancement_monthly_progress_rank_idx
      ON charge.member_rank_advancement_monthly_progress (highest_rank_index DESC)
    `);

    const serviceRole = normalizeText(process.env.DB_USER);
    if (serviceRole) {
      const quotedServiceRole = quoteIdentifier(serviceRole);
      await client.query(`GRANT USAGE ON SCHEMA charge TO ${quotedServiceRole}`);
      await client.query(`
        GRANT SELECT, INSERT, UPDATE, DELETE
        ON TABLE charge.member_rank_advancement_monthly_progress
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

async function installMemberRankAdvancementTableViaServiceRole() {
  const client = await pool.connect();
  let transactionClosed = false;

  try {
    await client.query('BEGIN');
    await client.query(`
      CREATE TABLE IF NOT EXISTS charge.member_rank_advancement_monthly_progress (
        user_id text NOT NULL,
        period_key text NOT NULL,
        highest_rank text NOT NULL DEFAULT '',
        highest_rank_index integer NOT NULL DEFAULT -1,
        highest_rank_achievement_id text NOT NULL DEFAULT '',
        highest_required_cycles integer NOT NULL DEFAULT 0,
        highest_achieved_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, period_key),
        CONSTRAINT member_rank_advancement_monthly_progress_rank_index_check CHECK (highest_rank_index >= -1),
        CONSTRAINT member_rank_advancement_monthly_progress_required_cycles_check CHECK (highest_required_cycles >= 0)
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS member_rank_advancement_monthly_progress_period_idx
      ON charge.member_rank_advancement_monthly_progress (period_key)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS member_rank_advancement_monthly_progress_rank_idx
      ON charge.member_rank_advancement_monthly_progress (highest_rank_index DESC)
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

export async function ensureMemberRankAdvancementTables() {
  if (memberRankAdvancementSchemaReady) {
    return;
  }

  if (memberRankAdvancementSchemaPromise) {
    return memberRankAdvancementSchemaPromise;
  }

  memberRankAdvancementSchemaPromise = (async () => {
    const probe = await pool.query(`
      SELECT to_regclass('charge.member_rank_advancement_monthly_progress') AS table_name
    `);

    let tableName = probe.rows?.[0]?.table_name || null;
    if (!tableName) {
      try {
        await installMemberRankAdvancementTableViaAdmin();
      } catch (error) {
        await installMemberRankAdvancementTableViaServiceRole();
      }

      const recheck = await pool.query(`
        SELECT to_regclass('charge.member_rank_advancement_monthly_progress') AS table_name
      `);
      tableName = recheck.rows?.[0]?.table_name || null;
      if (!tableName) {
        throw new Error(
          'Member rank advancement monthly progress table is not installed in schema "charge". Install "charge.member_rank_advancement_monthly_progress" first.',
        );
      }
    }

    await pool.query('SELECT 1 FROM charge.member_rank_advancement_monthly_progress LIMIT 1');
    memberRankAdvancementSchemaReady = true;
  })().catch((error) => {
    memberRankAdvancementSchemaReady = false;
    throw error;
  }).finally(() => {
    if (!memberRankAdvancementSchemaReady) {
      memberRankAdvancementSchemaPromise = null;
    }
  });

  return memberRankAdvancementSchemaPromise;
}

export async function readMemberRankAdvancementMonthlyProgress(userIdInput, periodKeyInput, executor = pool) {
  await ensureMemberRankAdvancementTables();

  const userId = normalizeText(userIdInput);
  const periodKey = normalizeText(periodKeyInput);
  if (!userId || !periodKey) {
    return null;
  }

  const result = await executor.query(`
    SELECT
      user_id,
      period_key,
      highest_rank,
      highest_rank_index,
      highest_rank_achievement_id,
      highest_required_cycles,
      highest_achieved_at,
      created_at,
      updated_at
    FROM charge.member_rank_advancement_monthly_progress
    WHERE user_id = $1
      AND period_key = $2
    LIMIT 1
  `, [userId, periodKey]);

  return mapDbRankAdvancementMonthlyRowToApp(result.rows?.[0] || null);
}

export async function upsertMemberRankAdvancementMonthlyHighest(progressPayload = {}, executor = pool) {
  await ensureMemberRankAdvancementTables();

  const userId = normalizeText(progressPayload?.userId);
  const periodKey = normalizeText(progressPayload?.periodKey);
  const highestRank = normalizeText(progressPayload?.highestRank);
  const highestRankIndex = Math.max(-1, toSignedWholeNumber(progressPayload?.highestRankIndex, -1));
  const highestRankAchievementId = normalizeText(progressPayload?.highestRankAchievementId);
  const highestRequiredCycles = toWholeNumber(progressPayload?.highestRequiredCycles, 0);
  const highestAchievedAt = normalizeText(progressPayload?.highestAchievedAt);

  if (!userId || !periodKey) {
    return null;
  }

  const result = await executor.query(`
    INSERT INTO charge.member_rank_advancement_monthly_progress (
      user_id,
      period_key,
      highest_rank,
      highest_rank_index,
      highest_rank_achievement_id,
      highest_required_cycles,
      highest_achieved_at,
      updated_at
    )
    VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      CASE
        WHEN $4 >= 0
          THEN COALESCE($7::timestamptz, NOW())
        ELSE NULL
      END,
      NOW()
    )
    ON CONFLICT (user_id, period_key)
    DO UPDATE SET
      highest_rank = CASE
        WHEN EXCLUDED.highest_rank_index > charge.member_rank_advancement_monthly_progress.highest_rank_index
          THEN EXCLUDED.highest_rank
        ELSE charge.member_rank_advancement_monthly_progress.highest_rank
      END,
      highest_rank_index = GREATEST(
        charge.member_rank_advancement_monthly_progress.highest_rank_index,
        EXCLUDED.highest_rank_index
      ),
      highest_rank_achievement_id = CASE
        WHEN EXCLUDED.highest_rank_index > charge.member_rank_advancement_monthly_progress.highest_rank_index
          THEN EXCLUDED.highest_rank_achievement_id
        ELSE charge.member_rank_advancement_monthly_progress.highest_rank_achievement_id
      END,
      highest_required_cycles = CASE
        WHEN EXCLUDED.highest_rank_index > charge.member_rank_advancement_monthly_progress.highest_rank_index
          THEN EXCLUDED.highest_required_cycles
        ELSE charge.member_rank_advancement_monthly_progress.highest_required_cycles
      END,
      highest_achieved_at = CASE
        WHEN EXCLUDED.highest_rank_index > charge.member_rank_advancement_monthly_progress.highest_rank_index
          THEN COALESCE(EXCLUDED.highest_achieved_at, NOW())
        ELSE charge.member_rank_advancement_monthly_progress.highest_achieved_at
      END,
      updated_at = NOW()
    RETURNING
      user_id,
      period_key,
      highest_rank,
      highest_rank_index,
      highest_rank_achievement_id,
      highest_required_cycles,
      highest_achieved_at,
      created_at,
      updated_at
  `, [
    userId,
    periodKey,
    highestRank,
    highestRankIndex,
    highestRankAchievementId,
    highestRequiredCycles,
    highestAchievedAt || null,
  ]);

  return mapDbRankAdvancementMonthlyRowToApp(result.rows?.[0] || null);
}
