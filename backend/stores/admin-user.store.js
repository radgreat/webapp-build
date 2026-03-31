import pool from '../db/db.js';

function normalizeCredential(value) {
  return String(value || '').trim().toLowerCase();
}

function mapDbAdminUserToAppAdminUser(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    username: row.username,
    email: row.email,
    password: row.password_value,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at || ''),
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at || ''),
  };
}

export async function findAdminUserByIdentifier(identifierInput) {
  const identifier = normalizeCredential(identifierInput);
  if (!identifier) {
    return null;
  }

  const result = await pool.query(`
    SELECT
      id,
      name,
      username,
      email,
      password_value,
      created_at,
      updated_at
    FROM charge.admin_users
    WHERE LOWER(username) = $1
      OR LOWER(email) = $1
    LIMIT 1
  `, [identifier]);

  return mapDbAdminUserToAppAdminUser(result.rows[0] || null);
}
