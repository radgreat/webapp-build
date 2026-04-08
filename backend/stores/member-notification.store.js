import pool from '../db/db.js';
import adminPool from '../db/admin-db.js';

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeCredential(value) {
  return normalizeText(value).toLowerCase();
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

function parseMetadataObject(value) {
  if (!value) {
    return {};
  }

  if (typeof value === 'object' && !Array.isArray(value)) {
    return value;
  }

  try {
    const parsed = JSON.parse(String(value || '{}'));
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function normalizeNotificationCategory(value) {
  const normalized = normalizeCredential(value);
  if (normalized === 'announcement' || normalized === 'announcements') {
    return 'announcement';
  }
  if (normalized === 'notification' || normalized === 'notifications') {
    return 'notification';
  }
  return '';
}

function buildAudienceTargets(userIdInput, usernameInput) {
  const userId = normalizeText(userIdInput);
  const username = normalizeCredential(usernameInput);
  const audienceTargets = ['all'];

  if (userId) {
    audienceTargets.push(`user:${userId}`);
  }
  if (username) {
    audienceTargets.push(`username:${username}`);
  }

  return audienceTargets;
}

function mapDbMemberNotificationRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: normalizeText(row.notification_id),
    category: normalizeNotificationCategory(row.category) || 'notification',
    audience: normalizeText(row.audience || 'all') || 'all',
    title: normalizeText(row.title),
    message: normalizeText(row.message),
    tone: normalizeCredential(row.tone) || 'info',
    ctaLabel: normalizeText(row.cta_label),
    ctaHref: normalizeText(row.cta_href),
    metadata: parseMetadataObject(row.metadata_json),
    pinned: Boolean(row.pinned),
    startAt: toIsoStringOrEmpty(row.start_at),
    expiresAt: toIsoStringOrEmpty(row.expires_at),
    createdAt: toIsoStringOrEmpty(row.created_at),
    updatedAt: toIsoStringOrEmpty(row.updated_at),
    readAt: toIsoStringOrEmpty(row.read_at),
    read: Boolean(row.read_at),
  };
}

const DEFAULT_MEMBER_NOTIFICATION_SEED = Object.freeze([
  Object.freeze({
    notificationId: 'seed-member-notification-welcome-2026',
    category: 'notification',
    audience: 'all',
    title: 'Welcome back to your dashboard',
    message: 'Review your latest cycles, payouts, and profile milestones before the next cutoff.',
    tone: 'info',
    ctaLabel: 'Open Dashboard',
    ctaHref: '/dashboard',
    pinned: false,
    startAt: '2026-04-01T00:00:00.000Z',
    expiresAt: '',
    metadataJson: Object.freeze({
      source: 'system-seed',
      release: '2026-q2',
    }),
  }),
  Object.freeze({
    notificationId: 'seed-member-notification-achievement-2026',
    category: 'notification',
    audience: 'all',
    title: 'Check claimable achievements',
    message: 'New rank and event rewards may be ready to claim in your Profile Achievements panel.',
    tone: 'success',
    ctaLabel: 'Open Profile',
    ctaHref: '/profile',
    pinned: false,
    startAt: '2026-04-01T00:00:00.000Z',
    expiresAt: '',
    metadataJson: Object.freeze({
      source: 'system-seed',
      module: 'profile-achievements',
    }),
  }),
  Object.freeze({
    notificationId: 'seed-member-announcement-legacy-q2-2026',
    category: 'announcement',
    audience: 'all',
    title: 'Legacy Builder Leadership Program: Q2 2026',
    message: 'Program window is April 1, 2026 through June 30, 2026. Track required enrollments in Profile Achievements.',
    tone: 'warning',
    ctaLabel: 'View Event Progress',
    ctaHref: '/profile',
    pinned: true,
    startAt: '2026-04-01T00:00:00.000Z',
    expiresAt: '2026-07-01T00:00:00.000Z',
    metadataJson: Object.freeze({
      source: 'system-seed',
      programId: 'legacy-builder-leadership-program-q2-2026',
    }),
  }),
  Object.freeze({
    notificationId: 'seed-member-announcement-store-updates-2026',
    category: 'announcement',
    audience: 'all',
    title: 'Storefront checkout updates are live',
    message: 'Your My Store checkout now supports refreshed cart and payment handling improvements.',
    tone: 'info',
    ctaLabel: 'Open My Store',
    ctaHref: '/mystore',
    pinned: false,
    startAt: '2026-04-01T00:00:00.000Z',
    expiresAt: '',
    metadataJson: Object.freeze({
      source: 'system-seed',
      module: 'storefront',
    }),
  }),
]);

let memberNotificationSchemaReady = false;
let memberNotificationSchemaPromise = null;

async function installMemberNotificationTables(executor, options = {}) {
  const grantRole = normalizeText(options?.grantRole);
  const client = await executor.connect();
  let transactionClosed = false;

  try {
    await client.query('BEGIN');
    await client.query(`
      CREATE TABLE IF NOT EXISTS charge.member_notifications (
        notification_id text PRIMARY KEY,
        category text NOT NULL DEFAULT 'notification',
        audience text NOT NULL DEFAULT 'all',
        title text NOT NULL DEFAULT '',
        message text NOT NULL DEFAULT '',
        tone text NOT NULL DEFAULT 'info',
        cta_label text NOT NULL DEFAULT '',
        cta_href text NOT NULL DEFAULT '',
        metadata_json jsonb NOT NULL DEFAULT '{}'::jsonb,
        pinned boolean NOT NULL DEFAULT false,
        start_at timestamptz NOT NULL DEFAULT NOW(),
        expires_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW(),
        CONSTRAINT member_notifications_category_check CHECK (
          category IN ('notification', 'announcement')
        ),
        CONSTRAINT member_notifications_tone_check CHECK (
          tone IN ('info', 'success', 'warning', 'danger')
        )
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS member_notifications_visibility_idx
      ON charge.member_notifications (audience, category, pinned DESC, created_at DESC)
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS charge.member_notification_reads (
        notification_id text NOT NULL
          REFERENCES charge.member_notifications(notification_id)
          ON DELETE CASCADE,
        user_id text NOT NULL,
        read_at timestamptz NOT NULL DEFAULT NOW(),
        PRIMARY KEY (notification_id, user_id)
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS member_notification_reads_user_idx
      ON charge.member_notification_reads (user_id, read_at DESC)
    `);

    if (grantRole) {
      const escapedRole = grantRole.replace(/"/g, '""');
      await client.query(`GRANT USAGE ON SCHEMA charge TO "${escapedRole}"`);
      await client.query(`
        GRANT SELECT, INSERT, UPDATE, DELETE
        ON TABLE charge.member_notifications, charge.member_notification_reads
        TO "${escapedRole}"
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

async function ensureMemberNotificationSeedData(executor = pool) {
  const rowCountResult = await executor.query(`
    SELECT COUNT(*)::int AS total
    FROM charge.member_notifications
  `);
  const totalRows = Number(rowCountResult.rows?.[0]?.total || 0);
  if (totalRows > 0) {
    return;
  }

  for (const seedEntry of DEFAULT_MEMBER_NOTIFICATION_SEED) {
    await executor.query(`
      INSERT INTO charge.member_notifications (
        notification_id,
        category,
        audience,
        title,
        message,
        tone,
        cta_label,
        cta_href,
        metadata_json,
        pinned,
        start_at,
        expires_at,
        created_at,
        updated_at
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,$11,$12,$13,$14
      )
      ON CONFLICT (notification_id)
      DO NOTHING
    `, [
      normalizeText(seedEntry.notificationId),
      normalizeNotificationCategory(seedEntry.category) || 'notification',
      normalizeText(seedEntry.audience || 'all') || 'all',
      normalizeText(seedEntry.title),
      normalizeText(seedEntry.message),
      normalizeCredential(seedEntry.tone) || 'info',
      normalizeText(seedEntry.ctaLabel),
      normalizeText(seedEntry.ctaHref),
      JSON.stringify(seedEntry.metadataJson || {}),
      Boolean(seedEntry.pinned),
      toIsoStringOrEmpty(seedEntry.startAt) || new Date().toISOString(),
      toIsoStringOrEmpty(seedEntry.expiresAt) || null,
      toIsoStringOrEmpty(seedEntry.startAt) || new Date().toISOString(),
      new Date().toISOString(),
    ]);
  }
}

export async function ensureMemberNotificationTables() {
  if (memberNotificationSchemaReady) {
    return;
  }

  if (memberNotificationSchemaPromise) {
    return memberNotificationSchemaPromise;
  }

  memberNotificationSchemaPromise = (async () => {
    const probe = await pool.query(`
      SELECT to_regclass('charge.member_notifications') AS notifications_table_name,
             to_regclass('charge.member_notification_reads') AS reads_table_name
    `);
    let notificationsTableName = probe.rows?.[0]?.notifications_table_name || null;
    let readsTableName = probe.rows?.[0]?.reads_table_name || null;

    if (!notificationsTableName || !readsTableName) {
      try {
        await installMemberNotificationTables(adminPool, {
          grantRole: normalizeText(process.env.DB_USER),
        });
      } catch {
        await installMemberNotificationTables(pool);
      }

      const recheck = await pool.query(`
        SELECT to_regclass('charge.member_notifications') AS notifications_table_name,
               to_regclass('charge.member_notification_reads') AS reads_table_name
      `);
      notificationsTableName = recheck.rows?.[0]?.notifications_table_name || null;
      readsTableName = recheck.rows?.[0]?.reads_table_name || null;
      if (!notificationsTableName || !readsTableName) {
        throw new Error(
          'Member notification tables are not installed in schema "charge".',
        );
      }
    }

    await ensureMemberNotificationSeedData(pool);
    memberNotificationSchemaReady = true;
  })().catch((error) => {
    memberNotificationSchemaReady = false;
    throw error;
  }).finally(() => {
    if (!memberNotificationSchemaReady) {
      memberNotificationSchemaPromise = null;
    }
  });

  return memberNotificationSchemaPromise;
}

export async function listVisibleMemberNotificationsForUser(
  userIdInput,
  usernameInput,
  options = {},
  executor = pool,
) {
  await ensureMemberNotificationTables();

  const userId = normalizeText(userIdInput);
  if (!userId) {
    return [];
  }

  const audienceTargets = buildAudienceTargets(userId, usernameInput);
  const normalizedCategory = normalizeNotificationCategory(options?.category);
  const requestedLimit = Number.parseInt(String(options?.limit || '60'), 10);
  const limit = Number.isFinite(requestedLimit)
    ? Math.max(1, Math.min(200, requestedLimit))
    : 60;

  const result = await executor.query(`
    SELECT
      n.notification_id,
      n.category,
      n.audience,
      n.title,
      n.message,
      n.tone,
      n.cta_label,
      n.cta_href,
      n.metadata_json,
      n.pinned,
      n.start_at,
      n.expires_at,
      n.created_at,
      n.updated_at,
      r.read_at
    FROM charge.member_notifications n
    LEFT JOIN charge.member_notification_reads r
      ON r.notification_id = n.notification_id
     AND r.user_id = $1
    WHERE n.audience = ANY($2::text[])
      AND ($3::text = '' OR n.category = $3::text)
      AND (n.start_at IS NULL OR n.start_at <= NOW())
      AND (n.expires_at IS NULL OR n.expires_at > NOW())
    ORDER BY n.pinned DESC, n.created_at DESC
    LIMIT $4
  `, [
    userId,
    audienceTargets,
    normalizedCategory,
    limit,
  ]);

  return (Array.isArray(result.rows) ? result.rows : [])
    .map(mapDbMemberNotificationRow)
    .filter(Boolean);
}

export async function findVisibleMemberNotificationById(
  userIdInput,
  usernameInput,
  notificationIdInput,
  executor = pool,
) {
  await ensureMemberNotificationTables();

  const userId = normalizeText(userIdInput);
  const notificationId = normalizeText(notificationIdInput);
  if (!userId || !notificationId) {
    return null;
  }

  const audienceTargets = buildAudienceTargets(userId, usernameInput);
  const result = await executor.query(`
    SELECT
      n.notification_id,
      n.category,
      n.audience,
      n.title,
      n.message,
      n.tone,
      n.cta_label,
      n.cta_href,
      n.metadata_json,
      n.pinned,
      n.start_at,
      n.expires_at,
      n.created_at,
      n.updated_at,
      r.read_at
    FROM charge.member_notifications n
    LEFT JOIN charge.member_notification_reads r
      ON r.notification_id = n.notification_id
     AND r.user_id = $1
    WHERE n.notification_id = $2
      AND n.audience = ANY($3::text[])
      AND (n.start_at IS NULL OR n.start_at <= NOW())
      AND (n.expires_at IS NULL OR n.expires_at > NOW())
    LIMIT 1
  `, [
    userId,
    notificationId,
    audienceTargets,
  ]);

  return mapDbMemberNotificationRow(result.rows?.[0] || null);
}

export async function markMemberNotificationRead(userIdInput, notificationIdInput, executor = pool) {
  await ensureMemberNotificationTables();

  const userId = normalizeText(userIdInput);
  const notificationId = normalizeText(notificationIdInput);
  if (!userId || !notificationId) {
    return null;
  }

  const result = await executor.query(`
    INSERT INTO charge.member_notification_reads (
      notification_id,
      user_id,
      read_at
    )
    VALUES ($1, $2, NOW())
    ON CONFLICT (notification_id, user_id)
    DO UPDATE
      SET read_at = EXCLUDED.read_at
    RETURNING
      notification_id,
      user_id,
      read_at
  `, [
    notificationId,
    userId,
  ]);

  const row = result.rows?.[0] || null;
  if (!row) {
    return null;
  }

  return {
    notificationId: normalizeText(row.notification_id),
    userId: normalizeText(row.user_id),
    readAt: toIsoStringOrEmpty(row.read_at),
  };
}

export async function markAllVisibleMemberNotificationsRead(
  userIdInput,
  usernameInput,
  options = {},
  executor = pool,
) {
  await ensureMemberNotificationTables();

  const userId = normalizeText(userIdInput);
  if (!userId) {
    return {
      markedCount: 0,
      notificationIds: [],
    };
  }

  const audienceTargets = buildAudienceTargets(userId, usernameInput);
  const normalizedCategory = normalizeNotificationCategory(options?.category);
  const result = await executor.query(`
    INSERT INTO charge.member_notification_reads (
      notification_id,
      user_id,
      read_at
    )
    SELECT
      n.notification_id,
      $1,
      NOW()
    FROM charge.member_notifications n
    WHERE n.audience = ANY($2::text[])
      AND ($3::text = '' OR n.category = $3::text)
      AND (n.start_at IS NULL OR n.start_at <= NOW())
      AND (n.expires_at IS NULL OR n.expires_at > NOW())
    ON CONFLICT (notification_id, user_id)
    DO UPDATE
      SET read_at = EXCLUDED.read_at
    RETURNING notification_id
  `, [
    userId,
    audienceTargets,
    normalizedCategory,
  ]);

  const rows = Array.isArray(result.rows) ? result.rows : [];
  return {
    markedCount: rows.length,
    notificationIds: rows.map((row) => normalizeText(row.notification_id)).filter(Boolean),
  };
}
