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

function mapDbMemberAuthSessionToApp(row) {
  if (!row) {
    return null;
  }

  return {
    sessionId: row.session_id || '',
    userId: row.user_id || '',
    sessionTokenHash: row.session_token_hash || '',
    issuedAt: toIsoStringOrEmpty(row.issued_at),
    expiresAt: toIsoStringOrEmpty(row.expires_at),
    revokedAt: toIsoStringOrEmpty(row.revoked_at),
    lastSeenAt: toIsoStringOrEmpty(row.last_seen_at),
    createdAt: toIsoStringOrEmpty(row.created_at),
    updatedAt: toIsoStringOrEmpty(row.updated_at),
  };
}

let memberAuthSessionSchemaReady = false;
let memberAuthSessionSchemaPromise = null;

async function installMemberAuthSessionTableViaAdmin() {
  const client = await adminPool.connect();
  let transactionClosed = false;

  try {
    await client.query('BEGIN');
    await client.query(`
      CREATE TABLE IF NOT EXISTS charge.member_auth_sessions (
        session_id text PRIMARY KEY,
        user_id text NOT NULL,
        session_token_hash text NOT NULL UNIQUE,
        issued_at timestamptz NOT NULL DEFAULT NOW(),
        expires_at timestamptz NOT NULL,
        revoked_at timestamptz,
        last_seen_at timestamptz NOT NULL DEFAULT NOW(),
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW(),
        CONSTRAINT member_auth_sessions_expiry_check CHECK (expires_at > issued_at)
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS member_auth_sessions_user_id_idx
      ON charge.member_auth_sessions (user_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS member_auth_sessions_expires_at_idx
      ON charge.member_auth_sessions (expires_at)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS member_auth_sessions_revoked_at_idx
      ON charge.member_auth_sessions (revoked_at)
    `);

    const serviceRole = normalizeText(process.env.DB_USER);
    if (serviceRole) {
      const quotedServiceRole = quoteIdentifier(serviceRole);
      await client.query(`GRANT USAGE ON SCHEMA charge TO ${quotedServiceRole}`);
      await client.query(`
        GRANT SELECT, INSERT, UPDATE, DELETE
        ON TABLE charge.member_auth_sessions
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

async function installMemberAuthSessionTableViaServiceRole() {
  const client = await pool.connect();
  let transactionClosed = false;

  try {
    await client.query('BEGIN');
    await client.query(`
      CREATE TABLE IF NOT EXISTS charge.member_auth_sessions (
        session_id text PRIMARY KEY,
        user_id text NOT NULL,
        session_token_hash text NOT NULL UNIQUE,
        issued_at timestamptz NOT NULL DEFAULT NOW(),
        expires_at timestamptz NOT NULL,
        revoked_at timestamptz,
        last_seen_at timestamptz NOT NULL DEFAULT NOW(),
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW(),
        CONSTRAINT member_auth_sessions_expiry_check CHECK (expires_at > issued_at)
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS member_auth_sessions_user_id_idx
      ON charge.member_auth_sessions (user_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS member_auth_sessions_expires_at_idx
      ON charge.member_auth_sessions (expires_at)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS member_auth_sessions_revoked_at_idx
      ON charge.member_auth_sessions (revoked_at)
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

export async function ensureMemberAuthSessionTables() {
  if (memberAuthSessionSchemaReady) {
    return;
  }

  if (memberAuthSessionSchemaPromise) {
    return memberAuthSessionSchemaPromise;
  }

  memberAuthSessionSchemaPromise = (async () => {
    const probe = await pool.query(`
      SELECT to_regclass('charge.member_auth_sessions') AS table_name
    `);

    let tableName = probe.rows?.[0]?.table_name || null;
    if (!tableName) {
      try {
        await installMemberAuthSessionTableViaAdmin();
      } catch (error) {
        await installMemberAuthSessionTableViaServiceRole();
      }

      const recheck = await pool.query(`
        SELECT to_regclass('charge.member_auth_sessions') AS table_name
      `);
      tableName = recheck.rows?.[0]?.table_name || null;
      if (!tableName) {
        throw new Error(
          'Member auth sessions table is not installed in schema "charge". Install "charge.member_auth_sessions" first.',
        );
      }
    }

    await pool.query('SELECT 1 FROM charge.member_auth_sessions LIMIT 1');
    memberAuthSessionSchemaReady = true;
  })().catch((error) => {
    memberAuthSessionSchemaReady = false;
    throw error;
  }).finally(() => {
    if (!memberAuthSessionSchemaReady) {
      memberAuthSessionSchemaPromise = null;
    }
  });

  return memberAuthSessionSchemaPromise;
}

export async function insertMemberAuthSession(sessionPayload = {}, executor = pool) {
  await ensureMemberAuthSessionTables();

  const sessionId = normalizeText(sessionPayload?.sessionId);
  const userId = normalizeText(sessionPayload?.userId);
  const sessionTokenHash = normalizeText(sessionPayload?.sessionTokenHash);
  const issuedAt = normalizeText(sessionPayload?.issuedAt);
  const expiresAt = normalizeText(sessionPayload?.expiresAt);

  if (!sessionId || !userId || !sessionTokenHash || !expiresAt) {
    return null;
  }

  const result = await executor.query(`
    INSERT INTO charge.member_auth_sessions (
      session_id,
      user_id,
      session_token_hash,
      issued_at,
      expires_at,
      revoked_at,
      last_seen_at
    )
    VALUES ($1, $2, $3, COALESCE($4::timestamptz, NOW()), $5::timestamptz, NULL, NOW())
    RETURNING
      session_id,
      user_id,
      session_token_hash,
      issued_at,
      expires_at,
      revoked_at,
      last_seen_at,
      created_at,
      updated_at
  `, [
    sessionId,
    userId,
    sessionTokenHash,
    issuedAt || null,
    expiresAt,
  ]);

  return mapDbMemberAuthSessionToApp(result.rows[0] || null);
}

export async function readMemberAuthSessionByTokenHash(tokenHashInput, executor = pool) {
  await ensureMemberAuthSessionTables();

  const tokenHash = normalizeText(tokenHashInput);
  if (!tokenHash) {
    return null;
  }

  const result = await executor.query(`
    SELECT
      session_id,
      user_id,
      session_token_hash,
      issued_at,
      expires_at,
      revoked_at,
      last_seen_at,
      created_at,
      updated_at
    FROM charge.member_auth_sessions
    WHERE session_token_hash = $1
    ORDER BY created_at DESC
    LIMIT 1
  `, [tokenHash]);

  return mapDbMemberAuthSessionToApp(result.rows[0] || null);
}

export async function readActiveMemberAuthSessionByTokenHash(tokenHashInput, executor = pool) {
  await ensureMemberAuthSessionTables();

  const tokenHash = normalizeText(tokenHashInput);
  if (!tokenHash) {
    return null;
  }

  const result = await executor.query(`
    SELECT
      session_id,
      user_id,
      session_token_hash,
      issued_at,
      expires_at,
      revoked_at,
      last_seen_at,
      created_at,
      updated_at
    FROM charge.member_auth_sessions
    WHERE session_token_hash = $1
      AND revoked_at IS NULL
      AND expires_at > NOW()
    ORDER BY created_at DESC
    LIMIT 1
  `, [tokenHash]);

  return mapDbMemberAuthSessionToApp(result.rows[0] || null);
}

export async function touchMemberAuthSessionById(sessionIdInput, executor = pool) {
  await ensureMemberAuthSessionTables();

  const sessionId = normalizeText(sessionIdInput);
  if (!sessionId) {
    return null;
  }

  const result = await executor.query(`
    UPDATE charge.member_auth_sessions
    SET
      last_seen_at = NOW(),
      updated_at = NOW()
    WHERE session_id = $1
    RETURNING
      session_id,
      user_id,
      session_token_hash,
      issued_at,
      expires_at,
      revoked_at,
      last_seen_at,
      created_at,
      updated_at
  `, [sessionId]);

  return mapDbMemberAuthSessionToApp(result.rows[0] || null);
}

export async function revokeMemberAuthSessionById(sessionIdInput, executor = pool) {
  await ensureMemberAuthSessionTables();

  const sessionId = normalizeText(sessionIdInput);
  if (!sessionId) {
    return null;
  }

  const result = await executor.query(`
    UPDATE charge.member_auth_sessions
    SET
      revoked_at = NOW(),
      updated_at = NOW()
    WHERE session_id = $1
    RETURNING
      session_id,
      user_id,
      session_token_hash,
      issued_at,
      expires_at,
      revoked_at,
      last_seen_at,
      created_at,
      updated_at
  `, [sessionId]);

  return mapDbMemberAuthSessionToApp(result.rows[0] || null);
}
