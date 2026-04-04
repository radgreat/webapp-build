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

function mapDbMemberTitleCatalogToApp(row) {
  if (!row) {
    return null;
  }

  return {
    titleId: normalizeText(row.title_id),
    titleSlug: normalizeText(row.title_slug),
    title: normalizeText(row.title),
    description: normalizeText(row.description),
    iconPath: normalizeText(row.icon_path),
    sourceAchievementId: normalizeText(row.source_achievement_id),
    sourceEventId: normalizeText(row.source_event_id),
    claimRule: normalizeText(row.claim_rule),
    isActive: Boolean(row.is_active),
    metadata: parseMetadata(row.metadata_json),
    createdAt: toIsoStringOrEmpty(row.created_at),
    updatedAt: toIsoStringOrEmpty(row.updated_at),
  };
}

let memberTitleCatalogSchemaReady = false;
let memberTitleCatalogSchemaPromise = null;

async function runMemberTitleCatalogSchemaMigrations(executor = pool) {
  await executor.query(`
    ALTER TABLE charge.member_title_catalog
    ADD COLUMN IF NOT EXISTS icon_path text NOT NULL DEFAULT ''
  `);

  await executor.query(`
    ALTER TABLE charge.member_title_catalog
    ADD COLUMN IF NOT EXISTS source_achievement_id text NOT NULL DEFAULT ''
  `);

  await executor.query(`
    ALTER TABLE charge.member_title_catalog
    ADD COLUMN IF NOT EXISTS source_event_id text NOT NULL DEFAULT ''
  `);

  await executor.query(`
    ALTER TABLE charge.member_title_catalog
    ADD COLUMN IF NOT EXISTS claim_rule text NOT NULL DEFAULT 'achievement'
  `);

  await executor.query(`
    ALTER TABLE charge.member_title_catalog
    ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true
  `);

  await executor.query(`
    ALTER TABLE charge.member_title_catalog
    ADD COLUMN IF NOT EXISTS metadata_json jsonb NOT NULL DEFAULT '{}'::jsonb
  `);

  await executor.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS member_title_catalog_title_slug_unique_idx
    ON charge.member_title_catalog (title_slug)
  `);

  await executor.query(`
    CREATE INDEX IF NOT EXISTS member_title_catalog_is_active_idx
    ON charge.member_title_catalog (is_active)
  `);

  await executor.query(`
    CREATE INDEX IF NOT EXISTS member_title_catalog_source_achievement_idx
    ON charge.member_title_catalog (source_achievement_id)
  `);
}

async function installMemberTitleCatalogTableViaAdmin() {
  const client = await adminPool.connect();
  let transactionClosed = false;

  try {
    await client.query('BEGIN');
    await client.query(`
      CREATE TABLE IF NOT EXISTS charge.member_title_catalog (
        title_id text PRIMARY KEY,
        title_slug text NOT NULL,
        title text NOT NULL DEFAULT '',
        description text NOT NULL DEFAULT '',
        icon_path text NOT NULL DEFAULT '',
        source_achievement_id text NOT NULL DEFAULT '',
        source_event_id text NOT NULL DEFAULT '',
        claim_rule text NOT NULL DEFAULT 'achievement',
        is_active boolean NOT NULL DEFAULT true,
        metadata_json jsonb NOT NULL DEFAULT '{}'::jsonb,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW(),
        CONSTRAINT member_title_catalog_title_slug_unique UNIQUE (title_slug)
      )
    `);

    await runMemberTitleCatalogSchemaMigrations(client);

    const serviceRole = normalizeText(process.env.DB_USER);
    if (serviceRole) {
      const quotedServiceRole = quoteIdentifier(serviceRole);
      await client.query(`GRANT USAGE ON SCHEMA charge TO ${quotedServiceRole}`);
      await client.query(`
        GRANT SELECT, INSERT, UPDATE, DELETE
        ON TABLE charge.member_title_catalog
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

async function installMemberTitleCatalogTableViaServiceRole() {
  const client = await pool.connect();
  let transactionClosed = false;

  try {
    await client.query('BEGIN');
    await client.query(`
      CREATE TABLE IF NOT EXISTS charge.member_title_catalog (
        title_id text PRIMARY KEY,
        title_slug text NOT NULL,
        title text NOT NULL DEFAULT '',
        description text NOT NULL DEFAULT '',
        icon_path text NOT NULL DEFAULT '',
        source_achievement_id text NOT NULL DEFAULT '',
        source_event_id text NOT NULL DEFAULT '',
        claim_rule text NOT NULL DEFAULT 'achievement',
        is_active boolean NOT NULL DEFAULT true,
        metadata_json jsonb NOT NULL DEFAULT '{}'::jsonb,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW(),
        CONSTRAINT member_title_catalog_title_slug_unique UNIQUE (title_slug)
      )
    `);

    await runMemberTitleCatalogSchemaMigrations(client);

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

export async function ensureMemberTitleCatalogTables() {
  if (memberTitleCatalogSchemaReady) {
    return;
  }

  if (memberTitleCatalogSchemaPromise) {
    return memberTitleCatalogSchemaPromise;
  }

  memberTitleCatalogSchemaPromise = (async () => {
    const probe = await pool.query(`
      SELECT to_regclass('charge.member_title_catalog') AS table_name
    `);

    let tableName = probe.rows?.[0]?.table_name || null;
    if (!tableName) {
      try {
        await installMemberTitleCatalogTableViaAdmin();
      } catch {
        await installMemberTitleCatalogTableViaServiceRole();
      }

      const recheck = await pool.query(`
        SELECT to_regclass('charge.member_title_catalog') AS table_name
      `);
      tableName = recheck.rows?.[0]?.table_name || null;
      if (!tableName) {
        throw new Error(
          'Member title catalog table is not installed in schema "charge". Install "charge.member_title_catalog" first.',
        );
      }
    }

    await runMemberTitleCatalogSchemaMigrations(pool);
    await pool.query('SELECT 1 FROM charge.member_title_catalog LIMIT 1');
    memberTitleCatalogSchemaReady = true;
  })().catch((error) => {
    memberTitleCatalogSchemaReady = false;
    throw error;
  }).finally(() => {
    if (!memberTitleCatalogSchemaReady) {
      memberTitleCatalogSchemaPromise = null;
    }
  });

  return memberTitleCatalogSchemaPromise;
}

export async function listActiveMemberTitleCatalogEntries(executor = pool) {
  await ensureMemberTitleCatalogTables();

  const result = await executor.query(`
    SELECT
      title_id,
      title_slug,
      title,
      description,
      icon_path,
      source_achievement_id,
      source_event_id,
      claim_rule,
      is_active,
      metadata_json,
      created_at,
      updated_at
    FROM charge.member_title_catalog
    WHERE is_active = TRUE
    ORDER BY LOWER(title) ASC, created_at ASC
  `);

  return result.rows.map(mapDbMemberTitleCatalogToApp).filter(Boolean);
}

export async function findActiveMemberTitleCatalogEntryBySlug(titleSlugInput, executor = pool) {
  await ensureMemberTitleCatalogTables();

  const titleSlug = normalizeText(titleSlugInput);
  if (!titleSlug) {
    return null;
  }

  const result = await executor.query(`
    SELECT
      title_id,
      title_slug,
      title,
      description,
      icon_path,
      source_achievement_id,
      source_event_id,
      claim_rule,
      is_active,
      metadata_json,
      created_at,
      updated_at
    FROM charge.member_title_catalog
    WHERE title_slug = $1
      AND is_active = TRUE
    LIMIT 1
  `, [titleSlug]);

  return mapDbMemberTitleCatalogToApp(result.rows[0] || null);
}

export async function upsertMemberTitleCatalogEntry(entryPayload = {}, executor = pool) {
  await ensureMemberTitleCatalogTables();

  const titleId = normalizeText(entryPayload?.titleId);
  const titleSlug = normalizeText(entryPayload?.titleSlug);
  const title = normalizeText(entryPayload?.title);
  const description = normalizeText(entryPayload?.description);
  const iconPath = normalizeText(entryPayload?.iconPath);
  const sourceAchievementId = normalizeText(entryPayload?.sourceAchievementId);
  const sourceEventId = normalizeText(entryPayload?.sourceEventId);
  const claimRule = normalizeText(entryPayload?.claimRule) || 'achievement';
  const isActive = entryPayload?.isActive !== false;
  const metadata = entryPayload?.metadata && typeof entryPayload.metadata === 'object'
    ? entryPayload.metadata
    : {};

  if (!titleId || !titleSlug || !title) {
    return null;
  }

  const result = await executor.query(`
    INSERT INTO charge.member_title_catalog (
      title_id,
      title_slug,
      title,
      description,
      icon_path,
      source_achievement_id,
      source_event_id,
      claim_rule,
      is_active,
      metadata_json
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb)
    ON CONFLICT (title_slug)
    DO UPDATE
    SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      icon_path = EXCLUDED.icon_path,
      source_achievement_id = EXCLUDED.source_achievement_id,
      source_event_id = EXCLUDED.source_event_id,
      claim_rule = EXCLUDED.claim_rule,
      is_active = EXCLUDED.is_active,
      metadata_json = EXCLUDED.metadata_json,
      updated_at = NOW()
    RETURNING
      title_id,
      title_slug,
      title,
      description,
      icon_path,
      source_achievement_id,
      source_event_id,
      claim_rule,
      is_active,
      metadata_json,
      created_at,
      updated_at
  `, [
    titleId,
    titleSlug,
    title,
    description,
    iconPath,
    sourceAchievementId,
    sourceEventId,
    claimRule,
    isActive,
    JSON.stringify(metadata),
  ]);

  return mapDbMemberTitleCatalogToApp(result.rows[0] || null);
}
