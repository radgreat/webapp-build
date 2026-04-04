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

function parseMetadata(value) {
  if (!value) {
    return {};
  }

  if (typeof value === 'object') {
    return value;
  }

  try {
    const parsed = JSON.parse(String(value));
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function quoteIdentifier(value) {
  return `"${String(value || '').replace(/"/g, '""')}"`;
}

function mapDbMemberTitleAwardToApp(row) {
  if (!row) {
    return null;
  }

  return {
    awardId: normalizeText(row.award_id),
    userId: normalizeText(row.user_id),
    titleSlug: normalizeText(row.title_slug),
    title: normalizeText(row.title),
    titleDescription: normalizeText(row.title_description),
    sourceAchievementId: normalizeText(row.source_achievement_id),
    sourceClaimId: normalizeText(row.source_claim_id),
    eventId: normalizeText(row.event_id),
    metadata: parseMetadata(row.metadata_json),
    awardedAt: toIsoStringOrEmpty(row.awarded_at),
    expiresAt: toIsoStringOrEmpty(row.expires_at),
    revokedAt: toIsoStringOrEmpty(row.revoked_at),
    createdAt: toIsoStringOrEmpty(row.created_at),
    updatedAt: toIsoStringOrEmpty(row.updated_at),
  };
}

let memberTitleAwardsSchemaReady = false;
let memberTitleAwardsSchemaPromise = null;

async function runMemberTitleAwardSchemaMigrations(executor = pool) {
  await executor.query(`
    ALTER TABLE charge.member_title_awards
    ADD COLUMN IF NOT EXISTS metadata_json jsonb NOT NULL DEFAULT '{}'::jsonb
  `);

  await executor.query(`
    ALTER TABLE charge.member_title_awards
    ADD COLUMN IF NOT EXISTS title_description text NOT NULL DEFAULT ''
  `);

  await executor.query(`
    ALTER TABLE charge.member_title_awards
    ADD COLUMN IF NOT EXISTS source_achievement_id text NOT NULL DEFAULT ''
  `);

  await executor.query(`
    ALTER TABLE charge.member_title_awards
    ADD COLUMN IF NOT EXISTS source_claim_id text NOT NULL DEFAULT ''
  `);

  await executor.query(`
    ALTER TABLE charge.member_title_awards
    ADD COLUMN IF NOT EXISTS event_id text NOT NULL DEFAULT ''
  `);

  await executor.query(`
    ALTER TABLE charge.member_title_awards
    ADD COLUMN IF NOT EXISTS expires_at timestamptz
  `);

  await executor.query(`
    ALTER TABLE charge.member_title_awards
    ADD COLUMN IF NOT EXISTS revoked_at timestamptz
  `);

  await executor.query(`
    CREATE INDEX IF NOT EXISTS member_title_awards_user_id_idx
    ON charge.member_title_awards (user_id)
  `);

  await executor.query(`
    CREATE INDEX IF NOT EXISTS member_title_awards_title_slug_idx
    ON charge.member_title_awards (title_slug)
  `);

  await executor.query(`
    CREATE INDEX IF NOT EXISTS member_title_awards_active_idx
    ON charge.member_title_awards (user_id, revoked_at, expires_at)
  `);

  await executor.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS member_title_awards_user_title_unique_idx
    ON charge.member_title_awards (user_id, title_slug)
  `);
}

async function installMemberTitleAwardTableViaAdmin() {
  const client = await adminPool.connect();
  let transactionClosed = false;

  try {
    await client.query('BEGIN');
    await client.query(`
      CREATE TABLE IF NOT EXISTS charge.member_title_awards (
        award_id text PRIMARY KEY,
        user_id text NOT NULL,
        title_slug text NOT NULL,
        title text NOT NULL DEFAULT '',
        title_description text NOT NULL DEFAULT '',
        source_achievement_id text NOT NULL DEFAULT '',
        source_claim_id text NOT NULL DEFAULT '',
        event_id text NOT NULL DEFAULT '',
        metadata_json jsonb NOT NULL DEFAULT '{}'::jsonb,
        awarded_at timestamptz NOT NULL DEFAULT NOW(),
        expires_at timestamptz NULL,
        revoked_at timestamptz NULL,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW(),
        CONSTRAINT member_title_awards_user_title_unique UNIQUE (user_id, title_slug)
      )
    `);

    await runMemberTitleAwardSchemaMigrations(client);

    const serviceRole = normalizeText(process.env.DB_USER);
    if (serviceRole) {
      const quotedServiceRole = quoteIdentifier(serviceRole);
      await client.query(`GRANT USAGE ON SCHEMA charge TO ${quotedServiceRole}`);
      await client.query(`
        GRANT SELECT, INSERT, UPDATE, DELETE
        ON TABLE charge.member_title_awards
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

async function installMemberTitleAwardTableViaServiceRole() {
  const client = await pool.connect();
  let transactionClosed = false;

  try {
    await client.query('BEGIN');
    await client.query(`
      CREATE TABLE IF NOT EXISTS charge.member_title_awards (
        award_id text PRIMARY KEY,
        user_id text NOT NULL,
        title_slug text NOT NULL,
        title text NOT NULL DEFAULT '',
        title_description text NOT NULL DEFAULT '',
        source_achievement_id text NOT NULL DEFAULT '',
        source_claim_id text NOT NULL DEFAULT '',
        event_id text NOT NULL DEFAULT '',
        metadata_json jsonb NOT NULL DEFAULT '{}'::jsonb,
        awarded_at timestamptz NOT NULL DEFAULT NOW(),
        expires_at timestamptz NULL,
        revoked_at timestamptz NULL,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW(),
        CONSTRAINT member_title_awards_user_title_unique UNIQUE (user_id, title_slug)
      )
    `);

    await runMemberTitleAwardSchemaMigrations(client);

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

export async function ensureMemberTitleAwardTables() {
  if (memberTitleAwardsSchemaReady) {
    return;
  }

  if (memberTitleAwardsSchemaPromise) {
    return memberTitleAwardsSchemaPromise;
  }

  memberTitleAwardsSchemaPromise = (async () => {
    const probe = await pool.query(`
      SELECT to_regclass('charge.member_title_awards') AS table_name
    `);

    let tableName = probe.rows?.[0]?.table_name || null;
    if (!tableName) {
      try {
        await installMemberTitleAwardTableViaAdmin();
      } catch {
        await installMemberTitleAwardTableViaServiceRole();
      }

      const recheck = await pool.query(`
        SELECT to_regclass('charge.member_title_awards') AS table_name
      `);
      tableName = recheck.rows?.[0]?.table_name || null;
      if (!tableName) {
        throw new Error(
          'Member title awards table is not installed in schema "charge". Install "charge.member_title_awards" first.',
        );
      }
    }

    await runMemberTitleAwardSchemaMigrations(pool);
    await pool.query('SELECT 1 FROM charge.member_title_awards LIMIT 1');
    memberTitleAwardsSchemaReady = true;
  })().catch((error) => {
    memberTitleAwardsSchemaReady = false;
    throw error;
  }).finally(() => {
    if (!memberTitleAwardsSchemaReady) {
      memberTitleAwardsSchemaPromise = null;
    }
  });

  return memberTitleAwardsSchemaPromise;
}

export async function listActiveMemberTitleAwardsByUserId(userIdInput, executor = pool) {
  await ensureMemberTitleAwardTables();

  const userId = normalizeText(userIdInput);
  if (!userId) {
    return [];
  }

  const result = await executor.query(`
    SELECT
      award_id,
      user_id,
      title_slug,
      title,
      title_description,
      source_achievement_id,
      source_claim_id,
      event_id,
      metadata_json,
      awarded_at,
      expires_at,
      revoked_at,
      created_at,
      updated_at
    FROM charge.member_title_awards
    WHERE user_id = $1
      AND revoked_at IS NULL
      AND (expires_at IS NULL OR expires_at > NOW())
    ORDER BY awarded_at DESC, created_at DESC
  `, [userId]);

  return result.rows.map(mapDbMemberTitleAwardToApp).filter(Boolean);
}

export async function findActiveMemberTitleAwardByUserIdAndSlug(
  userIdInput,
  titleSlugInput,
  executor = pool,
) {
  await ensureMemberTitleAwardTables();

  const userId = normalizeText(userIdInput);
  const titleSlug = normalizeText(titleSlugInput);
  if (!userId || !titleSlug) {
    return null;
  }

  const result = await executor.query(`
    SELECT
      award_id,
      user_id,
      title_slug,
      title,
      title_description,
      source_achievement_id,
      source_claim_id,
      event_id,
      metadata_json,
      awarded_at,
      expires_at,
      revoked_at,
      created_at,
      updated_at
    FROM charge.member_title_awards
    WHERE user_id = $1
      AND title_slug = $2
      AND revoked_at IS NULL
      AND (expires_at IS NULL OR expires_at > NOW())
    ORDER BY awarded_at DESC, created_at DESC
    LIMIT 1
  `, [userId, titleSlug]);

  return mapDbMemberTitleAwardToApp(result.rows[0] || null);
}

export async function insertMemberTitleAward(awardPayload = {}, executor = pool) {
  await ensureMemberTitleAwardTables();

  const awardId = normalizeText(awardPayload?.awardId);
  const userId = normalizeText(awardPayload?.userId);
  const titleSlug = normalizeText(awardPayload?.titleSlug);
  const title = normalizeText(awardPayload?.title);
  const titleDescription = normalizeText(awardPayload?.titleDescription);
  const sourceAchievementId = normalizeText(awardPayload?.sourceAchievementId);
  const sourceClaimId = normalizeText(awardPayload?.sourceClaimId);
  const eventId = normalizeText(awardPayload?.eventId);
  const awardedAt = normalizeText(awardPayload?.awardedAt);
  const expiresAt = normalizeText(awardPayload?.expiresAt);
  const metadata = awardPayload?.metadata && typeof awardPayload.metadata === 'object'
    ? awardPayload.metadata
    : {};

  if (!awardId || !userId || !titleSlug || !title) {
    return null;
  }

  const result = await executor.query(`
    INSERT INTO charge.member_title_awards (
      award_id,
      user_id,
      title_slug,
      title,
      title_description,
      source_achievement_id,
      source_claim_id,
      event_id,
      metadata_json,
      awarded_at,
      expires_at
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, COALESCE($10::timestamptz, NOW()), $11::timestamptz
    )
    ON CONFLICT (user_id, title_slug)
    DO UPDATE
    SET updated_at = NOW()
    RETURNING
      award_id,
      user_id,
      title_slug,
      title,
      title_description,
      source_achievement_id,
      source_claim_id,
      event_id,
      metadata_json,
      awarded_at,
      expires_at,
      revoked_at,
      created_at,
      updated_at
  `, [
    awardId,
    userId,
    titleSlug,
    title,
    titleDescription,
    sourceAchievementId,
    sourceClaimId,
    eventId,
    JSON.stringify(metadata),
    awardedAt || null,
    expiresAt || null,
  ]);

  return mapDbMemberTitleAwardToApp(result.rows[0] || null);
}
