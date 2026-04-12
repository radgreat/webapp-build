import pool from '../db/db.js';

function toIsoStringOrNull(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function mapDbTokenToAppToken(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    token: row.token,
    userId: row.user_id,
    email: row.email,
    createdAt: toIsoStringOrNull(row.created_at),
    expiresAt: toIsoStringOrNull(row.expires_at),
    usedAt: toIsoStringOrNull(row.used_at),
    updatedAt: toIsoStringOrNull(row.updated_at),
  };
}

function mapAppTokenToDbToken(token) {
  return {
    id: token?.id || '',
    token: token?.token || '',
    user_id: token?.userId || '',
    email: token?.email || '',
    created_at: token?.createdAt || new Date().toISOString(),
    expires_at: token?.expiresAt || new Date().toISOString(),
    used_at: token?.usedAt || null,
  };
}

function resolveQueryClient(candidateClient) {
  return candidateClient && typeof candidateClient.query === 'function'
    ? candidateClient
    : pool;
}

export async function readPasswordSetupTokensStore() {
  const result = await pool.query(`
    SELECT
      id,
      token,
      user_id,
      email,
      created_at,
      expires_at,
      used_at,
      updated_at
    FROM charge.password_setup_tokens
    ORDER BY created_at DESC
  `);

  return result.rows.map(mapDbTokenToAppToken);
}

export async function writePasswordSetupTokensStore(tokens) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM charge.password_setup_tokens');

    for (const token of Array.isArray(tokens) ? tokens : []) {
      const row = mapAppTokenToDbToken(token);

      await client.query(`
        INSERT INTO charge.password_setup_tokens (
          id,
          token,
          user_id,
          email,
          created_at,
          expires_at,
          used_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        row.id,
        row.token,
        row.user_id,
        row.email,
        row.created_at,
        row.expires_at,
        row.used_at,
      ]);
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function upsertPasswordSetupTokenRecord(token, options = {}) {
  const row = mapAppTokenToDbToken(token);
  if (!row.id) {
    throw new Error('Cannot upsert password setup token without an id.');
  }

  const client = resolveQueryClient(options?.client);
  const insertValues = [
    row.id,
    row.token,
    row.user_id,
    row.email,
    row.created_at,
    row.expires_at,
    row.used_at,
  ];
  const insertSql = `
    INSERT INTO charge.password_setup_tokens (
      id,
      token,
      user_id,
      email,
      created_at,
      expires_at,
      used_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `;

  if (options?.preferInsert === true) {
    try {
      const fastInsertResult = await client.query(`${insertSql} ON CONFLICT (id) DO NOTHING`, insertValues);
      if (fastInsertResult.rowCount > 0) {
        return;
      }
    } catch (error) {
      if (error?.code !== '42P10') {
        throw error;
      }
    }
  }

  const updateResult = await client.query(`
    UPDATE charge.password_setup_tokens
    SET
      token = $2,
      user_id = $3,
      email = $4,
      expires_at = $5,
      used_at = $6,
      updated_at = NOW()
    WHERE id = $1
  `, [
    row.id,
    row.token,
    row.user_id,
    row.email,
    row.expires_at,
    row.used_at,
  ]);

  if (updateResult.rowCount > 0) {
    return;
  }

  await client.query(insertSql, insertValues);
}

export async function findTokenRecord(tokenInput) {
  const token = String(tokenInput || '').trim();
  if (!token) {
    return null;
  }

  const result = await pool.query(`
    SELECT
      id,
      token,
      user_id,
      email,
      created_at,
      expires_at,
      used_at,
      updated_at
    FROM charge.password_setup_tokens
    WHERE token = $1
    LIMIT 1
  `, [token]);

  return mapDbTokenToAppToken(result.rows[0] || null);
}

export async function markAllOpenTokensUsedByUserId(userIdInput, usedAt) {
  const userId = String(userIdInput || '').trim();
  if (!userId) {
    return [];
  }

  const usedAtIso = usedAt || new Date().toISOString();

  await pool.query(`
    UPDATE charge.password_setup_tokens
    SET used_at = $2
    WHERE user_id = $1
      AND used_at IS NULL
  `, [userId, usedAtIso]);

  return readPasswordSetupTokensStore();
}
