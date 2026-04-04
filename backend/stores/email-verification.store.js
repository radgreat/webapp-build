import pool from '../db/db.js';
import adminPool from '../db/admin-db.js';
import { invalidateMemberUsersEmailVerificationColumnsCache } from './user.store.js';

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

function mapDbEmailVerificationTokenToApp(row) {
  if (!row) {
    return null;
  }

  return {
    tokenId: normalizeText(row.token_id),
    userId: normalizeText(row.user_id),
    email: normalizeText(row.email).toLowerCase(),
    tokenHash: normalizeText(row.token_hash),
    createdAt: toIsoStringOrEmpty(row.created_at),
    expiresAt: toIsoStringOrEmpty(row.expires_at),
    usedAt: toIsoStringOrEmpty(row.used_at),
    revokedAt: toIsoStringOrEmpty(row.revoked_at),
    updatedAt: toIsoStringOrEmpty(row.updated_at),
  };
}

let memberEmailVerificationSchemaReady = false;
let memberEmailVerificationSchemaPromise = null;

async function installEmailVerificationSchemaViaAdmin() {
  const client = await adminPool.connect();
  let transactionClosed = false;

  try {
    await client.query('BEGIN');
    await client.query(`
      ALTER TABLE charge.member_users
      ADD COLUMN IF NOT EXISTS email_verified boolean NOT NULL DEFAULT FALSE
    `);
    await client.query(`
      ALTER TABLE charge.member_users
      ADD COLUMN IF NOT EXISTS email_verified_at timestamptz
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS charge.member_email_verification_tokens (
        token_id text PRIMARY KEY,
        user_id text NOT NULL,
        email text NOT NULL,
        token_hash text NOT NULL UNIQUE,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        expires_at timestamptz NOT NULL,
        used_at timestamptz,
        revoked_at timestamptz,
        updated_at timestamptz NOT NULL DEFAULT NOW(),
        CONSTRAINT member_email_verification_tokens_expiry_check CHECK (expires_at > created_at)
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS member_email_verification_tokens_user_id_idx
      ON charge.member_email_verification_tokens (user_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS member_email_verification_tokens_email_idx
      ON charge.member_email_verification_tokens (email)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS member_email_verification_tokens_expires_at_idx
      ON charge.member_email_verification_tokens (expires_at)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS member_email_verification_tokens_active_idx
      ON charge.member_email_verification_tokens (token_hash, expires_at)
      WHERE used_at IS NULL AND revoked_at IS NULL
    `);

    const serviceRole = normalizeText(process.env.DB_USER);
    if (serviceRole) {
      const quotedServiceRole = quoteIdentifier(serviceRole);
      await client.query(`GRANT USAGE ON SCHEMA charge TO ${quotedServiceRole}`);
      await client.query(`
        GRANT SELECT, INSERT, UPDATE, DELETE
        ON TABLE charge.member_users
        TO ${quotedServiceRole}
      `);
      await client.query(`
        GRANT SELECT, INSERT, UPDATE, DELETE
        ON TABLE charge.member_email_verification_tokens
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

async function installEmailVerificationSchemaViaServiceRole() {
  const client = await pool.connect();
  let transactionClosed = false;

  try {
    await client.query('BEGIN');
    await client.query(`
      ALTER TABLE charge.member_users
      ADD COLUMN IF NOT EXISTS email_verified boolean NOT NULL DEFAULT FALSE
    `);
    await client.query(`
      ALTER TABLE charge.member_users
      ADD COLUMN IF NOT EXISTS email_verified_at timestamptz
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS charge.member_email_verification_tokens (
        token_id text PRIMARY KEY,
        user_id text NOT NULL,
        email text NOT NULL,
        token_hash text NOT NULL UNIQUE,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        expires_at timestamptz NOT NULL,
        used_at timestamptz,
        revoked_at timestamptz,
        updated_at timestamptz NOT NULL DEFAULT NOW(),
        CONSTRAINT member_email_verification_tokens_expiry_check CHECK (expires_at > created_at)
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS member_email_verification_tokens_user_id_idx
      ON charge.member_email_verification_tokens (user_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS member_email_verification_tokens_email_idx
      ON charge.member_email_verification_tokens (email)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS member_email_verification_tokens_expires_at_idx
      ON charge.member_email_verification_tokens (expires_at)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS member_email_verification_tokens_active_idx
      ON charge.member_email_verification_tokens (token_hash, expires_at)
      WHERE used_at IS NULL AND revoked_at IS NULL
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

export async function ensureEmailVerificationSchema() {
  if (memberEmailVerificationSchemaReady) {
    return;
  }

  if (memberEmailVerificationSchemaPromise) {
    return memberEmailVerificationSchemaPromise;
  }

  memberEmailVerificationSchemaPromise = (async () => {
    const probe = await pool.query(`
      SELECT
        to_regclass('charge.member_email_verification_tokens') AS tokens_table_name,
        EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'charge'
            AND table_name = 'member_users'
            AND column_name = 'email_verified'
        ) AS has_email_verified,
        EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'charge'
            AND table_name = 'member_users'
            AND column_name = 'email_verified_at'
        ) AS has_email_verified_at
    `);

    const probeRow = probe.rows?.[0] || {};
    const hasTokensTable = Boolean(probeRow.tokens_table_name);
    const hasEmailVerified = probeRow.has_email_verified === true;
    const hasEmailVerifiedAt = probeRow.has_email_verified_at === true;

    if (!hasTokensTable || !hasEmailVerified || !hasEmailVerifiedAt) {
      try {
        await installEmailVerificationSchemaViaAdmin();
      } catch (error) {
        await installEmailVerificationSchemaViaServiceRole();
      }
    }

    await pool.query('SELECT 1 FROM charge.member_email_verification_tokens LIMIT 1');
    invalidateMemberUsersEmailVerificationColumnsCache();
    memberEmailVerificationSchemaReady = true;
  })().catch((error) => {
    memberEmailVerificationSchemaReady = false;
    throw error;
  }).finally(() => {
    if (!memberEmailVerificationSchemaReady) {
      memberEmailVerificationSchemaPromise = null;
    }
  });

  return memberEmailVerificationSchemaPromise;
}

export async function revokeOpenEmailVerificationTokensByUserId(userIdInput, executor = pool) {
  await ensureEmailVerificationSchema();

  const userId = normalizeText(userIdInput);
  if (!userId) {
    return 0;
  }

  const result = await executor.query(`
    UPDATE charge.member_email_verification_tokens
    SET
      revoked_at = NOW(),
      updated_at = NOW()
    WHERE user_id = $1
      AND used_at IS NULL
      AND revoked_at IS NULL
      AND expires_at > NOW()
  `, [userId]);

  return Number(result.rowCount || 0);
}

export async function createEmailVerificationTokenRecord(tokenPayload = {}, executor = pool) {
  await ensureEmailVerificationSchema();

  const tokenId = normalizeText(tokenPayload?.tokenId);
  const userId = normalizeText(tokenPayload?.userId);
  const email = normalizeText(tokenPayload?.email).toLowerCase();
  const tokenHash = normalizeText(tokenPayload?.tokenHash);
  const createdAt = normalizeText(tokenPayload?.createdAt) || new Date().toISOString();
  const expiresAt = normalizeText(tokenPayload?.expiresAt);

  if (!tokenId || !userId || !email || !tokenHash || !expiresAt) {
    return null;
  }

  const result = await executor.query(`
    INSERT INTO charge.member_email_verification_tokens (
      token_id,
      user_id,
      email,
      token_hash,
      created_at,
      expires_at,
      used_at,
      revoked_at,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5::timestamptz, $6::timestamptz, NULL, NULL, NOW())
    RETURNING
      token_id,
      user_id,
      email,
      token_hash,
      created_at,
      expires_at,
      used_at,
      revoked_at,
      updated_at
  `, [
    tokenId,
    userId,
    email,
    tokenHash,
    createdAt,
    expiresAt,
  ]);

  return mapDbEmailVerificationTokenToApp(result.rows[0] || null);
}

export async function readEmailVerificationTokenByHash(tokenHashInput, executor = pool) {
  await ensureEmailVerificationSchema();

  const tokenHash = normalizeText(tokenHashInput);
  if (!tokenHash) {
    return null;
  }

  const result = await executor.query(`
    SELECT
      token_id,
      user_id,
      email,
      token_hash,
      created_at,
      expires_at,
      used_at,
      revoked_at,
      updated_at
    FROM charge.member_email_verification_tokens
    WHERE token_hash = $1
    ORDER BY created_at DESC
    LIMIT 1
  `, [tokenHash]);

  return mapDbEmailVerificationTokenToApp(result.rows[0] || null);
}

export async function readActiveEmailVerificationTokenByHash(tokenHashInput, executor = pool) {
  await ensureEmailVerificationSchema();

  const tokenHash = normalizeText(tokenHashInput);
  if (!tokenHash) {
    return null;
  }

  const result = await executor.query(`
    SELECT
      token_id,
      user_id,
      email,
      token_hash,
      created_at,
      expires_at,
      used_at,
      revoked_at,
      updated_at
    FROM charge.member_email_verification_tokens
    WHERE token_hash = $1
      AND used_at IS NULL
      AND revoked_at IS NULL
      AND expires_at > NOW()
    ORDER BY created_at DESC
    LIMIT 1
  `, [tokenHash]);

  return mapDbEmailVerificationTokenToApp(result.rows[0] || null);
}

export async function markEmailVerificationTokenUsedById(tokenIdInput, usedAtInput = '', executor = pool) {
  await ensureEmailVerificationSchema();

  const tokenId = normalizeText(tokenIdInput);
  if (!tokenId) {
    return null;
  }

  const usedAt = normalizeText(usedAtInput) || new Date().toISOString();
  const result = await executor.query(`
    UPDATE charge.member_email_verification_tokens
    SET
      used_at = $2::timestamptz,
      revoked_at = NULL,
      updated_at = NOW()
    WHERE token_id = $1
    RETURNING
      token_id,
      user_id,
      email,
      token_hash,
      created_at,
      expires_at,
      used_at,
      revoked_at,
      updated_at
  `, [tokenId, usedAt]);

  return mapDbEmailVerificationTokenToApp(result.rows[0] || null);
}
