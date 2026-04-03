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

function mapDbMemberAchievementClaimToApp(row) {
  if (!row) {
    return null;
  }

  return {
    claimId: row.claim_id || '',
    userId: row.user_id || '',
    achievementId: row.achievement_id || '',
    claimPeriod: row.claim_period || '',
    tabId: row.achievement_tab || '',
    categoryId: row.achievement_category || '',
    title: row.title || '',
    description: row.description || '',
    requiredRank: row.required_rank || '',
    rewardAmount: roundCurrencyAmount(row.reward_amount),
    claimedAt: toIsoStringOrEmpty(row.claimed_at),
    createdAt: toIsoStringOrEmpty(row.created_at),
    updatedAt: toIsoStringOrEmpty(row.updated_at),
  };
}

let memberAchievementSchemaReady = false;
let memberAchievementSchemaPromise = null;

async function runMemberAchievementClaimSchemaMigrations(executor = pool) {
  await executor.query(`
    ALTER TABLE charge.member_achievement_claims
    ADD COLUMN IF NOT EXISTS claim_period text
  `);

  await executor.query(`
    UPDATE charge.member_achievement_claims
    SET claim_period = CASE
      WHEN LOWER(COALESCE(achievement_tab, '')) = 'rank'
        THEN TO_CHAR(DATE_TRUNC('month', COALESCE(claimed_at, created_at, NOW())), 'YYYY-MM')
      ELSE 'lifetime'
    END
    WHERE claim_period IS NULL
      OR BTRIM(claim_period) = ''
  `);

  await executor.query(`
    ALTER TABLE charge.member_achievement_claims
    ALTER COLUMN claim_period SET DEFAULT 'lifetime'
  `);

  await executor.query(`
    ALTER TABLE charge.member_achievement_claims
    ALTER COLUMN claim_period SET NOT NULL
  `);

  await executor.query(`
    ALTER TABLE charge.member_achievement_claims
    DROP CONSTRAINT IF EXISTS member_achievement_claims_user_achievement_unique
  `);

  await executor.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        JOIN pg_namespace n ON n.oid = t.relnamespace
        WHERE c.conname = 'member_achievement_claims_user_achievement_period_unique'
          AND n.nspname = 'charge'
          AND t.relname = 'member_achievement_claims'
      ) THEN
        ALTER TABLE charge.member_achievement_claims
        ADD CONSTRAINT member_achievement_claims_user_achievement_period_unique
        UNIQUE (user_id, achievement_id, claim_period);
      END IF;
    END
    $$;
  `);

  await executor.query(`
    CREATE INDEX IF NOT EXISTS member_achievement_claims_user_tab_period_idx
    ON charge.member_achievement_claims (user_id, achievement_tab, claim_period)
  `);

  await executor.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS member_achievement_claims_rank_month_unique_idx
    ON charge.member_achievement_claims (user_id, claim_period)
    WHERE LOWER(COALESCE(achievement_tab, '')) = 'rank'
  `);
}

async function installMemberAchievementTableViaAdmin() {
  const client = await adminPool.connect();
  let transactionClosed = false;

  try {
    await client.query('BEGIN');
    await client.query(`
      CREATE TABLE IF NOT EXISTS charge.member_achievement_claims (
        claim_id text PRIMARY KEY,
        user_id text NOT NULL,
        achievement_id text NOT NULL,
        claim_period text NOT NULL DEFAULT 'lifetime',
        achievement_tab text NOT NULL DEFAULT '',
        achievement_category text NOT NULL DEFAULT '',
        title text NOT NULL DEFAULT '',
        description text NOT NULL DEFAULT '',
        required_rank text NOT NULL DEFAULT '',
        reward_amount numeric(14,2) NOT NULL DEFAULT 0,
        claimed_at timestamptz NOT NULL DEFAULT NOW(),
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW(),
        CONSTRAINT member_achievement_claims_reward_amount_check CHECK (reward_amount >= 0),
        CONSTRAINT member_achievement_claims_user_achievement_period_unique UNIQUE (user_id, achievement_id, claim_period)
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS member_achievement_claims_user_id_idx
      ON charge.member_achievement_claims (user_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS member_achievement_claims_tab_idx
      ON charge.member_achievement_claims (achievement_tab)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS member_achievement_claims_user_tab_period_idx
      ON charge.member_achievement_claims (user_id, achievement_tab, claim_period)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS member_achievement_claims_claimed_at_idx
      ON charge.member_achievement_claims (claimed_at DESC)
    `);
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS member_achievement_claims_rank_month_unique_idx
      ON charge.member_achievement_claims (user_id, claim_period)
      WHERE LOWER(COALESCE(achievement_tab, '')) = 'rank'
    `);

    const serviceRole = normalizeText(process.env.DB_USER);
    if (serviceRole) {
      const quotedServiceRole = quoteIdentifier(serviceRole);
      await client.query(`GRANT USAGE ON SCHEMA charge TO ${quotedServiceRole}`);
      await client.query(`
        GRANT SELECT, INSERT, UPDATE, DELETE
        ON TABLE charge.member_achievement_claims
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

async function installMemberAchievementTableViaServiceRole() {
  const client = await pool.connect();
  let transactionClosed = false;

  try {
    await client.query('BEGIN');
    await client.query(`
      CREATE TABLE IF NOT EXISTS charge.member_achievement_claims (
        claim_id text PRIMARY KEY,
        user_id text NOT NULL,
        achievement_id text NOT NULL,
        claim_period text NOT NULL DEFAULT 'lifetime',
        achievement_tab text NOT NULL DEFAULT '',
        achievement_category text NOT NULL DEFAULT '',
        title text NOT NULL DEFAULT '',
        description text NOT NULL DEFAULT '',
        required_rank text NOT NULL DEFAULT '',
        reward_amount numeric(14,2) NOT NULL DEFAULT 0,
        claimed_at timestamptz NOT NULL DEFAULT NOW(),
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW(),
        CONSTRAINT member_achievement_claims_reward_amount_check CHECK (reward_amount >= 0),
        CONSTRAINT member_achievement_claims_user_achievement_period_unique UNIQUE (user_id, achievement_id, claim_period)
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS member_achievement_claims_user_id_idx
      ON charge.member_achievement_claims (user_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS member_achievement_claims_tab_idx
      ON charge.member_achievement_claims (achievement_tab)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS member_achievement_claims_user_tab_period_idx
      ON charge.member_achievement_claims (user_id, achievement_tab, claim_period)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS member_achievement_claims_claimed_at_idx
      ON charge.member_achievement_claims (claimed_at DESC)
    `);
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS member_achievement_claims_rank_month_unique_idx
      ON charge.member_achievement_claims (user_id, claim_period)
      WHERE LOWER(COALESCE(achievement_tab, '')) = 'rank'
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

export async function ensureMemberAchievementTables() {
  if (memberAchievementSchemaReady) {
    return;
  }

  if (memberAchievementSchemaPromise) {
    return memberAchievementSchemaPromise;
  }

  memberAchievementSchemaPromise = (async () => {
    const probe = await pool.query(`
      SELECT to_regclass('charge.member_achievement_claims') AS table_name
    `);

    let tableName = probe.rows?.[0]?.table_name || null;
    if (!tableName) {
      try {
        await installMemberAchievementTableViaAdmin();
      } catch (error) {
        await installMemberAchievementTableViaServiceRole();
      }

      const recheck = await pool.query(`
        SELECT to_regclass('charge.member_achievement_claims') AS table_name
      `);
      tableName = recheck.rows?.[0]?.table_name || null;
      if (!tableName) {
        throw new Error(
          'Member achievement claims table is not installed in schema "charge". Install "charge.member_achievement_claims" first.',
        );
      }
    }

    await runMemberAchievementClaimSchemaMigrations(pool);
    await pool.query('SELECT 1 FROM charge.member_achievement_claims LIMIT 1');
    memberAchievementSchemaReady = true;
  })().catch((error) => {
    memberAchievementSchemaReady = false;
    throw error;
  }).finally(() => {
    if (!memberAchievementSchemaReady) {
      memberAchievementSchemaPromise = null;
    }
  });

  return memberAchievementSchemaPromise;
}

export async function listMemberAchievementClaimsByUserId(userIdInput, executor = pool) {
  await ensureMemberAchievementTables();

  const userId = normalizeText(userIdInput);
  if (!userId) {
    return [];
  }

  const result = await executor.query(`
    SELECT
      claim_id,
      user_id,
      achievement_id,
      claim_period,
      achievement_tab,
      achievement_category,
      title,
      description,
      required_rank,
      reward_amount,
      claimed_at,
      created_at,
      updated_at
    FROM charge.member_achievement_claims
    WHERE user_id = $1
    ORDER BY claimed_at DESC, created_at DESC
  `, [userId]);

  return result.rows.map(mapDbMemberAchievementClaimToApp).filter(Boolean);
}

export async function findMemberAchievementClaimByUserIdAndAchievementId(userIdInput, achievementIdInput, executor = pool) {
  await ensureMemberAchievementTables();

  const userId = normalizeText(userIdInput);
  const achievementId = normalizeText(achievementIdInput);
  if (!userId || !achievementId) {
    return null;
  }

  const result = await executor.query(`
    SELECT
      claim_id,
      user_id,
      achievement_id,
      claim_period,
      achievement_tab,
      achievement_category,
      title,
      description,
      required_rank,
      reward_amount,
      claimed_at,
      created_at,
      updated_at
    FROM charge.member_achievement_claims
    WHERE user_id = $1
      AND achievement_id = $2
    ORDER BY claimed_at DESC, created_at DESC
    LIMIT 1
  `, [userId, achievementId]);

  return mapDbMemberAchievementClaimToApp(result.rows[0] || null);
}

export async function findMemberAchievementClaimByUserIdAndAchievementIdAndPeriod(
  userIdInput,
  achievementIdInput,
  claimPeriodInput,
  executor = pool,
) {
  await ensureMemberAchievementTables();

  const userId = normalizeText(userIdInput);
  const achievementId = normalizeText(achievementIdInput);
  const claimPeriod = normalizeText(claimPeriodInput);
  if (!userId || !achievementId || !claimPeriod) {
    return null;
  }

  const result = await executor.query(`
    SELECT
      claim_id,
      user_id,
      achievement_id,
      claim_period,
      achievement_tab,
      achievement_category,
      title,
      description,
      required_rank,
      reward_amount,
      claimed_at,
      created_at,
      updated_at
    FROM charge.member_achievement_claims
    WHERE user_id = $1
      AND achievement_id = $2
      AND claim_period = $3
    ORDER BY claimed_at DESC, created_at DESC
    LIMIT 1
  `, [userId, achievementId, claimPeriod]);

  return mapDbMemberAchievementClaimToApp(result.rows[0] || null);
}

export async function insertMemberAchievementClaim(claimPayload = {}, executor = pool) {
  await ensureMemberAchievementTables();

  const claimId = normalizeText(claimPayload?.claimId);
  const userId = normalizeText(claimPayload?.userId);
  const achievementId = normalizeText(claimPayload?.achievementId);
  const claimPeriod = normalizeText(claimPayload?.claimPeriod) || 'lifetime';
  const tabId = normalizeText(claimPayload?.tabId);
  const categoryId = normalizeText(claimPayload?.categoryId);
  const title = normalizeText(claimPayload?.title);
  const description = normalizeText(claimPayload?.description);
  const requiredRank = normalizeText(claimPayload?.requiredRank);
  const rewardAmount = roundCurrencyAmount(claimPayload?.rewardAmount);
  const claimedAt = normalizeText(claimPayload?.claimedAt);

  if (!claimId || !userId || !achievementId) {
    return null;
  }

  const result = await executor.query(`
    INSERT INTO charge.member_achievement_claims (
      claim_id,
      user_id,
      achievement_id,
      claim_period,
      achievement_tab,
      achievement_category,
      title,
      description,
      required_rank,
      reward_amount,
      claimed_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, COALESCE($11::timestamptz, NOW()))
    RETURNING
      claim_id,
      user_id,
      achievement_id,
      claim_period,
      achievement_tab,
      achievement_category,
      title,
      description,
      required_rank,
      reward_amount,
      claimed_at,
      created_at,
      updated_at
  `, [
    claimId,
    userId,
    achievementId,
    claimPeriod,
    tabId,
    categoryId,
    title,
    description,
    requiredRank,
    rewardAmount,
    claimedAt || null,
  ]);

  return mapDbMemberAchievementClaimToApp(result.rows[0] || null);
}
