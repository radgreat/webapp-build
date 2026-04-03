import pool from '../db/db.js';
import adminPool from '../db/admin-db.js';

function normalizeText(value) {
  return String(value || '').trim();
}

function roundCurrencyAmount(value) {
  return Math.round((Math.max(0, Number(value) || 0)) * 100) / 100;
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

function mapDbGoodLifeRowToApp(row) {
  if (!row) {
    return null;
  }

  return {
    userId: normalizeText(row.user_id),
    periodKey: normalizeText(row.period_key),
    highestRank: normalizeText(row.highest_rank),
    highestRankIndex: Number.isFinite(Number(row.highest_rank_index))
      ? Math.max(-1, Math.floor(Number(row.highest_rank_index)))
      : -1,
    highestAchievementId: normalizeText(row.highest_rank_achievement_id),
    highestRewardAmount: roundCurrencyAmount(row.highest_reward_amount),
    claimedAchievementId: normalizeText(row.claimed_achievement_id),
    claimedRank: normalizeText(row.claimed_rank),
    claimedRewardAmount: roundCurrencyAmount(row.claimed_reward_amount),
    claimedAt: toIsoStringOrEmpty(row.claimed_at),
    createdAt: toIsoStringOrEmpty(row.created_at),
    updatedAt: toIsoStringOrEmpty(row.updated_at),
  };
}

let memberGoodLifeSchemaReady = false;
let memberGoodLifeSchemaPromise = null;

async function installMemberGoodLifeTableViaAdmin() {
  const client = await adminPool.connect();
  let transactionClosed = false;

  try {
    await client.query('BEGIN');
    await client.query(`
      CREATE TABLE IF NOT EXISTS charge.member_good_life_monthly_progress (
        user_id text NOT NULL,
        period_key text NOT NULL,
        highest_rank text NOT NULL DEFAULT '',
        highest_rank_index integer NOT NULL DEFAULT -1,
        highest_rank_achievement_id text NOT NULL DEFAULT '',
        highest_reward_amount numeric(14,2) NOT NULL DEFAULT 0,
        claimed_achievement_id text NOT NULL DEFAULT '',
        claimed_rank text NOT NULL DEFAULT '',
        claimed_reward_amount numeric(14,2) NOT NULL DEFAULT 0,
        claimed_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, period_key),
        CONSTRAINT member_good_life_monthly_progress_rank_index_check CHECK (highest_rank_index >= -1),
        CONSTRAINT member_good_life_monthly_progress_amount_check CHECK (
          highest_reward_amount >= 0
          AND claimed_reward_amount >= 0
        )
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS member_good_life_monthly_progress_period_idx
      ON charge.member_good_life_monthly_progress (period_key)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS member_good_life_monthly_progress_claimed_at_idx
      ON charge.member_good_life_monthly_progress (claimed_at DESC)
    `);

    const serviceRole = normalizeText(process.env.DB_USER);
    if (serviceRole) {
      const quotedServiceRole = quoteIdentifier(serviceRole);
      await client.query(`GRANT USAGE ON SCHEMA charge TO ${quotedServiceRole}`);
      await client.query(`
        GRANT SELECT, INSERT, UPDATE, DELETE
        ON TABLE charge.member_good_life_monthly_progress
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

async function installMemberGoodLifeTableViaServiceRole() {
  const client = await pool.connect();
  let transactionClosed = false;

  try {
    await client.query('BEGIN');
    await client.query(`
      CREATE TABLE IF NOT EXISTS charge.member_good_life_monthly_progress (
        user_id text NOT NULL,
        period_key text NOT NULL,
        highest_rank text NOT NULL DEFAULT '',
        highest_rank_index integer NOT NULL DEFAULT -1,
        highest_rank_achievement_id text NOT NULL DEFAULT '',
        highest_reward_amount numeric(14,2) NOT NULL DEFAULT 0,
        claimed_achievement_id text NOT NULL DEFAULT '',
        claimed_rank text NOT NULL DEFAULT '',
        claimed_reward_amount numeric(14,2) NOT NULL DEFAULT 0,
        claimed_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, period_key),
        CONSTRAINT member_good_life_monthly_progress_rank_index_check CHECK (highest_rank_index >= -1),
        CONSTRAINT member_good_life_monthly_progress_amount_check CHECK (
          highest_reward_amount >= 0
          AND claimed_reward_amount >= 0
        )
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS member_good_life_monthly_progress_period_idx
      ON charge.member_good_life_monthly_progress (period_key)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS member_good_life_monthly_progress_claimed_at_idx
      ON charge.member_good_life_monthly_progress (claimed_at DESC)
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

export async function ensureMemberGoodLifeTables() {
  if (memberGoodLifeSchemaReady) {
    return;
  }

  if (memberGoodLifeSchemaPromise) {
    return memberGoodLifeSchemaPromise;
  }

  memberGoodLifeSchemaPromise = (async () => {
    const probe = await pool.query(`
      SELECT to_regclass('charge.member_good_life_monthly_progress') AS table_name
    `);

    let tableName = probe.rows?.[0]?.table_name || null;
    if (!tableName) {
      try {
        await installMemberGoodLifeTableViaAdmin();
      } catch (error) {
        await installMemberGoodLifeTableViaServiceRole();
      }

      const recheck = await pool.query(`
        SELECT to_regclass('charge.member_good_life_monthly_progress') AS table_name
      `);
      tableName = recheck.rows?.[0]?.table_name || null;
      if (!tableName) {
        throw new Error(
          'Member Good Life monthly progress table is not installed in schema "charge". Install "charge.member_good_life_monthly_progress" first.',
        );
      }
    }

    await pool.query('SELECT 1 FROM charge.member_good_life_monthly_progress LIMIT 1');
    memberGoodLifeSchemaReady = true;
  })().catch((error) => {
    memberGoodLifeSchemaReady = false;
    throw error;
  }).finally(() => {
    if (!memberGoodLifeSchemaReady) {
      memberGoodLifeSchemaPromise = null;
    }
  });

  return memberGoodLifeSchemaPromise;
}

export async function readMemberGoodLifeMonthlyProgress(userIdInput, periodKeyInput, executor = pool) {
  await ensureMemberGoodLifeTables();

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
      highest_reward_amount,
      claimed_achievement_id,
      claimed_rank,
      claimed_reward_amount,
      claimed_at,
      created_at,
      updated_at
    FROM charge.member_good_life_monthly_progress
    WHERE user_id = $1
      AND period_key = $2
    LIMIT 1
  `, [userId, periodKey]);

  return mapDbGoodLifeRowToApp(result.rows?.[0] || null);
}

export async function upsertMemberGoodLifeMonthlyHighest(progressPayload = {}, executor = pool) {
  await ensureMemberGoodLifeTables();

  const userId = normalizeText(progressPayload?.userId);
  const periodKey = normalizeText(progressPayload?.periodKey);
  const highestRank = normalizeText(progressPayload?.highestRank);
  const highestRankIndexRaw = Number(progressPayload?.highestRankIndex);
  const highestRankIndex = Number.isFinite(highestRankIndexRaw)
    ? Math.max(-1, Math.floor(highestRankIndexRaw))
    : -1;
  const highestAchievementId = normalizeText(progressPayload?.highestAchievementId);
  const highestRewardAmount = roundCurrencyAmount(progressPayload?.highestRewardAmount);

  if (!userId || !periodKey) {
    return null;
  }

  const result = await executor.query(`
    INSERT INTO charge.member_good_life_monthly_progress (
      user_id,
      period_key,
      highest_rank,
      highest_rank_index,
      highest_rank_achievement_id,
      highest_reward_amount,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, NOW())
    ON CONFLICT (user_id, period_key)
    DO UPDATE SET
      highest_rank = CASE
        WHEN EXCLUDED.highest_rank_index > charge.member_good_life_monthly_progress.highest_rank_index
          THEN EXCLUDED.highest_rank
        ELSE charge.member_good_life_monthly_progress.highest_rank
      END,
      highest_rank_index = GREATEST(
        charge.member_good_life_monthly_progress.highest_rank_index,
        EXCLUDED.highest_rank_index
      ),
      highest_rank_achievement_id = CASE
        WHEN EXCLUDED.highest_rank_index > charge.member_good_life_monthly_progress.highest_rank_index
          THEN EXCLUDED.highest_rank_achievement_id
        ELSE charge.member_good_life_monthly_progress.highest_rank_achievement_id
      END,
      highest_reward_amount = CASE
        WHEN EXCLUDED.highest_rank_index > charge.member_good_life_monthly_progress.highest_rank_index
          THEN EXCLUDED.highest_reward_amount
        ELSE charge.member_good_life_monthly_progress.highest_reward_amount
      END,
      updated_at = NOW()
    RETURNING
      user_id,
      period_key,
      highest_rank,
      highest_rank_index,
      highest_rank_achievement_id,
      highest_reward_amount,
      claimed_achievement_id,
      claimed_rank,
      claimed_reward_amount,
      claimed_at,
      created_at,
      updated_at
  `, [
    userId,
    periodKey,
    highestRank,
    highestRankIndex,
    highestAchievementId,
    highestRewardAmount,
  ]);

  return mapDbGoodLifeRowToApp(result.rows?.[0] || null);
}

export async function markMemberGoodLifeMonthlyClaim(claimPayload = {}, executor = pool) {
  await ensureMemberGoodLifeTables();

  const userId = normalizeText(claimPayload?.userId);
  const periodKey = normalizeText(claimPayload?.periodKey);
  const claimedAchievementId = normalizeText(claimPayload?.claimedAchievementId);
  const claimedRank = normalizeText(claimPayload?.claimedRank);
  const claimedRewardAmount = roundCurrencyAmount(claimPayload?.claimedRewardAmount);
  const claimedAt = normalizeText(claimPayload?.claimedAt);

  if (!userId || !periodKey || !claimedAchievementId) {
    return null;
  }

  const result = await executor.query(`
    UPDATE charge.member_good_life_monthly_progress
    SET
      claimed_achievement_id = $3,
      claimed_rank = $4,
      claimed_reward_amount = $5,
      claimed_at = COALESCE($6::timestamptz, NOW()),
      updated_at = NOW()
    WHERE user_id = $1
      AND period_key = $2
      AND claimed_at IS NULL
    RETURNING
      user_id,
      period_key,
      highest_rank,
      highest_rank_index,
      highest_rank_achievement_id,
      highest_reward_amount,
      claimed_achievement_id,
      claimed_rank,
      claimed_reward_amount,
      claimed_at,
      created_at,
      updated_at
  `, [
    userId,
    periodKey,
    claimedAchievementId,
    claimedRank,
    claimedRewardAmount,
    claimedAt || null,
  ]);

  return mapDbGoodLifeRowToApp(result.rows?.[0] || null);
}
