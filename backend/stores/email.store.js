import pool from '../db/db.js';

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

function mapDbEmailToAppEmail(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    to: row.recipient_email,
    subject: row.subject,
    body: row.body,
    setupLink: row.setup_link,
    status: row.status,
    createdAt: toIsoStringOrEmpty(row.created_at),
    updatedAt: toIsoStringOrEmpty(row.updated_at),
  };
}

function mapAppEmailToDbEmail(email) {
  return {
    id: email?.id || '',
    recipient_email: email?.to || '',
    subject: email?.subject || '',
    body: email?.body || '',
    setup_link: email?.setupLink || '',
    status: email?.status || 'queued',
    created_at: email?.createdAt || new Date().toISOString(),
  };
}

export async function readMockEmailOutboxStore() {
  const result = await pool.query(`
    SELECT
      id,
      recipient_email,
      subject,
      body,
      setup_link,
      status,
      created_at,
      updated_at
    FROM charge.email_outbox
    ORDER BY created_at DESC
  `);

  return result.rows.map(mapDbEmailToAppEmail);
}

export async function writeMockEmailOutboxStore(emails) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM charge.email_outbox');

    for (const email of Array.isArray(emails) ? emails : []) {
      const row = mapAppEmailToDbEmail(email);

      await client.query(`
        INSERT INTO charge.email_outbox (
          id,
          recipient_email,
          subject,
          body,
          setup_link,
          status,
          created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        row.id,
        row.recipient_email,
        row.subject,
        row.body,
        row.setup_link,
        row.status,
        row.created_at,
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