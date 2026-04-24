import { randomUUID } from 'crypto';

import pool from '../db/db.js';

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeStoreCode(value) {
  return normalizeText(value)
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '');
}

function normalizeAttributionMode(value) {
  const normalizedValue = normalizeText(value).toLowerCase();
  return normalizedValue === 'member_link'
    ? 'member_link'
    : 'admin_parking';
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

function normalizeJsonObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return value;
}

function resolveQueryClient(candidateClient) {
  return candidateClient && typeof candidateClient.query === 'function'
    ? candidateClient
    : pool;
}

function mapDbAttributionClaimToAppClaim(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    nonce: row.nonce,
    source: row.source || '',
    ownerUserId: row.owner_user_id || '',
    ownerStoreCode: row.owner_store_code || '',
    campaign: row.campaign || '',
    productId: row.product_id || '',
    issuedAt: toIsoStringOrEmpty(row.issued_at),
    expiresAt: toIsoStringOrEmpty(row.expires_at),
    consumedAt: toIsoStringOrEmpty(row.consumed_at),
    status: row.status || 'active',
    rawPayload: normalizeJsonObject(row.raw_payload),
    createdAt: toIsoStringOrEmpty(row.created_at),
    updatedAt: toIsoStringOrEmpty(row.updated_at),
  };
}

function mapDbAttributionLockToAppLock(row) {
  if (!row) {
    return null;
  }

  return {
    userId: row.user_id,
    attributionMode: normalizeAttributionMode(row.attribution_mode),
    attributionOwnerUserId: row.attribution_owner_user_id || '',
    attributionStoreCode: row.attribution_store_code || '',
    attributionClaimId: row.attribution_claim_id || '',
    attributionSource: row.attribution_source || '',
    attributionCampaign: row.attribution_campaign || '',
    attributionProductId: row.attribution_product_id || '',
    attributionLockedAt: toIsoStringOrEmpty(row.attribution_locked_at),
    metadata: normalizeJsonObject(row.metadata),
    createdAt: toIsoStringOrEmpty(row.created_at),
    updatedAt: toIsoStringOrEmpty(row.updated_at),
  };
}

let preferredAttributionSchemaReady = false;
let preferredAttributionSchemaPromise = null;

async function ensurePreferredAttributionSchema() {
  if (preferredAttributionSchemaReady) {
    return;
  }
  if (preferredAttributionSchemaPromise) {
    return preferredAttributionSchemaPromise;
  }

  preferredAttributionSchemaPromise = (async () => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS charge.preferred_attribution_claims (
        id text PRIMARY KEY,
        nonce text NOT NULL UNIQUE,
        source text NOT NULL DEFAULT '',
        owner_user_id text,
        owner_store_code text,
        campaign text,
        product_id text,
        issued_at timestamptz NOT NULL DEFAULT NOW(),
        expires_at timestamptz,
        consumed_at timestamptz,
        status text NOT NULL DEFAULT 'active',
        raw_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_preferred_attribution_claims_owner_user
      ON charge.preferred_attribution_claims (owner_user_id)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_preferred_attribution_claims_owner_store_code
      ON charge.preferred_attribution_claims (UPPER(owner_store_code))
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_preferred_attribution_claims_status
      ON charge.preferred_attribution_claims (status)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_preferred_attribution_claims_expires_at
      ON charge.preferred_attribution_claims (expires_at)
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS charge.preferred_account_attribution_locks (
        user_id text PRIMARY KEY,
        attribution_mode text NOT NULL DEFAULT 'admin_parking',
        attribution_owner_user_id text,
        attribution_store_code text,
        attribution_claim_id text,
        attribution_source text NOT NULL DEFAULT '',
        attribution_campaign text NOT NULL DEFAULT '',
        attribution_product_id text NOT NULL DEFAULT '',
        attribution_locked_at timestamptz NOT NULL DEFAULT NOW(),
        metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_preferred_account_attribution_locks_owner_user
      ON charge.preferred_account_attribution_locks (attribution_owner_user_id)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_preferred_account_attribution_locks_store_code
      ON charge.preferred_account_attribution_locks (UPPER(attribution_store_code))
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_preferred_account_attribution_locks_mode
      ON charge.preferred_account_attribution_locks (attribution_mode)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_preferred_account_attribution_locks_claim_id
      ON charge.preferred_account_attribution_locks (attribution_claim_id)
    `);

    preferredAttributionSchemaReady = true;
  })().catch((error) => {
    preferredAttributionSchemaReady = false;
    throw error;
  }).finally(() => {
    if (!preferredAttributionSchemaReady) {
      preferredAttributionSchemaPromise = null;
    }
  });

  return preferredAttributionSchemaPromise;
}

export async function warmPreferredAttributionStoreSchema() {
  await ensurePreferredAttributionSchema();
}

export async function createPreferredAttributionClaim(claimInput = {}, options = {}) {
  await ensurePreferredAttributionSchema();

  const client = resolveQueryClient(options?.client);
  const claimId = normalizeText(claimInput.id) || `patc_${randomUUID()}`;
  const nonce = normalizeText(claimInput.nonce) || randomUUID().replace(/-/g, '');
  const source = normalizeText(claimInput.source);
  const ownerUserId = normalizeText(claimInput.ownerUserId || claimInput.owner_user_id);
  const ownerStoreCode = normalizeStoreCode(claimInput.ownerStoreCode || claimInput.owner_store_code);
  const campaign = normalizeText(claimInput.campaign);
  const productId = normalizeText(claimInput.productId || claimInput.product_id);
  const issuedAtRaw = claimInput.issuedAt || claimInput.issued_at;
  const expiresAtRaw = claimInput.expiresAt || claimInput.expires_at;
  const status = normalizeText(claimInput.status).toLowerCase() || 'active';
  const rawPayload = normalizeJsonObject(claimInput.rawPayload ?? claimInput.raw_payload);

  const issuedAt = issuedAtRaw ? toIsoStringOrEmpty(issuedAtRaw) : new Date().toISOString();
  const expiresAt = expiresAtRaw ? toIsoStringOrEmpty(expiresAtRaw) : '';

  const result = await client.query(`
    INSERT INTO charge.preferred_attribution_claims (
      id,
      nonce,
      source,
      owner_user_id,
      owner_store_code,
      campaign,
      product_id,
      issued_at,
      expires_at,
      status,
      raw_payload
    )
    VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11
    )
    RETURNING
      id,
      nonce,
      source,
      owner_user_id,
      owner_store_code,
      campaign,
      product_id,
      issued_at,
      expires_at,
      consumed_at,
      status,
      raw_payload,
      created_at,
      updated_at
  `, [
    claimId,
    nonce,
    source,
    ownerUserId || null,
    ownerStoreCode || null,
    campaign || null,
    productId || null,
    issuedAt,
    expiresAt || null,
    status,
    rawPayload,
  ]);

  return mapDbAttributionClaimToAppClaim(result.rows[0] || null);
}

export async function findPreferredAttributionClaimByNonce(nonceInput, options = {}) {
  await ensurePreferredAttributionSchema();

  const nonce = normalizeText(nonceInput);
  if (!nonce) {
    return null;
  }

  const client = resolveQueryClient(options?.client);
  const result = await client.query(`
    SELECT
      id,
      nonce,
      source,
      owner_user_id,
      owner_store_code,
      campaign,
      product_id,
      issued_at,
      expires_at,
      consumed_at,
      status,
      raw_payload,
      created_at,
      updated_at
    FROM charge.preferred_attribution_claims
    WHERE nonce = $1
    LIMIT 1
  `, [nonce]);

  return mapDbAttributionClaimToAppClaim(result.rows[0] || null);
}

export async function findPreferredAttributionClaimById(claimIdInput, options = {}) {
  await ensurePreferredAttributionSchema();

  const claimId = normalizeText(claimIdInput);
  if (!claimId) {
    return null;
  }

  const client = resolveQueryClient(options?.client);
  const result = await client.query(`
    SELECT
      id,
      nonce,
      source,
      owner_user_id,
      owner_store_code,
      campaign,
      product_id,
      issued_at,
      expires_at,
      consumed_at,
      status,
      raw_payload,
      created_at,
      updated_at
    FROM charge.preferred_attribution_claims
    WHERE id = $1
    LIMIT 1
  `, [claimId]);

  return mapDbAttributionClaimToAppClaim(result.rows[0] || null);
}

export async function consumePreferredAttributionClaim(claimIdInput, options = {}) {
  await ensurePreferredAttributionSchema();

  const claimId = normalizeText(claimIdInput);
  if (!claimId) {
    return null;
  }

  const client = resolveQueryClient(options?.client);
  const consumedAt = options?.consumedAt
    ? toIsoStringOrEmpty(options.consumedAt)
    : new Date().toISOString();
  const nextStatus = normalizeText(options?.status).toLowerCase() || 'consumed';

  const result = await client.query(`
    UPDATE charge.preferred_attribution_claims
    SET
      consumed_at = COALESCE(consumed_at, $2::timestamptz),
      status = $3,
      updated_at = NOW()
    WHERE id = $1
      AND consumed_at IS NULL
    RETURNING
      id,
      nonce,
      source,
      owner_user_id,
      owner_store_code,
      campaign,
      product_id,
      issued_at,
      expires_at,
      consumed_at,
      status,
      raw_payload,
      created_at,
      updated_at
  `, [claimId, consumedAt, nextStatus]);

  return mapDbAttributionClaimToAppClaim(result.rows[0] || null);
}

export async function upsertPreferredAccountAttributionLock(lockInput = {}, options = {}) {
  await ensurePreferredAttributionSchema();

  const client = resolveQueryClient(options?.client);
  const userId = normalizeText(lockInput.userId || lockInput.user_id);
  if (!userId) {
    throw new Error('Cannot upsert preferred attribution lock without user id.');
  }

  const attributionMode = normalizeAttributionMode(lockInput.attributionMode || lockInput.attribution_mode);
  const attributionOwnerUserId = normalizeText(
    lockInput.attributionOwnerUserId || lockInput.attribution_owner_user_id,
  );
  const attributionStoreCode = normalizeStoreCode(
    lockInput.attributionStoreCode || lockInput.attribution_store_code,
  );
  const attributionClaimId = normalizeText(
    lockInput.attributionClaimId || lockInput.attribution_claim_id,
  );
  const attributionSource = normalizeText(lockInput.attributionSource || lockInput.attribution_source);
  const attributionCampaign = normalizeText(lockInput.attributionCampaign || lockInput.attribution_campaign);
  const attributionProductId = normalizeText(lockInput.attributionProductId || lockInput.attribution_product_id);
  const attributionLockedAt = lockInput.attributionLockedAt || lockInput.attribution_locked_at
    ? toIsoStringOrEmpty(lockInput.attributionLockedAt || lockInput.attribution_locked_at)
    : new Date().toISOString();
  const metadata = normalizeJsonObject(lockInput.metadata);

  const result = await client.query(`
    INSERT INTO charge.preferred_account_attribution_locks (
      user_id,
      attribution_mode,
      attribution_owner_user_id,
      attribution_store_code,
      attribution_claim_id,
      attribution_source,
      attribution_campaign,
      attribution_product_id,
      attribution_locked_at,
      metadata
    )
    VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10
    )
    ON CONFLICT (user_id)
    DO UPDATE SET
      attribution_mode = EXCLUDED.attribution_mode,
      attribution_owner_user_id = EXCLUDED.attribution_owner_user_id,
      attribution_store_code = EXCLUDED.attribution_store_code,
      attribution_claim_id = EXCLUDED.attribution_claim_id,
      attribution_source = EXCLUDED.attribution_source,
      attribution_campaign = EXCLUDED.attribution_campaign,
      attribution_product_id = EXCLUDED.attribution_product_id,
      attribution_locked_at = EXCLUDED.attribution_locked_at,
      metadata = EXCLUDED.metadata,
      updated_at = NOW()
    RETURNING
      user_id,
      attribution_mode,
      attribution_owner_user_id,
      attribution_store_code,
      attribution_claim_id,
      attribution_source,
      attribution_campaign,
      attribution_product_id,
      attribution_locked_at,
      metadata,
      created_at,
      updated_at
  `, [
    userId,
    attributionMode,
    attributionOwnerUserId || null,
    attributionStoreCode || null,
    attributionClaimId || null,
    attributionSource,
    attributionCampaign,
    attributionProductId,
    attributionLockedAt,
    metadata,
  ]);

  return mapDbAttributionLockToAppLock(result.rows[0] || null);
}

export async function findPreferredAccountAttributionLockByUserId(userIdInput, options = {}) {
  await ensurePreferredAttributionSchema();

  const userId = normalizeText(userIdInput);
  if (!userId) {
    return null;
  }

  const client = resolveQueryClient(options?.client);
  const result = await client.query(`
    SELECT
      user_id,
      attribution_mode,
      attribution_owner_user_id,
      attribution_store_code,
      attribution_claim_id,
      attribution_source,
      attribution_campaign,
      attribution_product_id,
      attribution_locked_at,
      metadata,
      created_at,
      updated_at
    FROM charge.preferred_account_attribution_locks
    WHERE user_id = $1
    LIMIT 1
  `, [userId]);

  return mapDbAttributionLockToAppLock(result.rows[0] || null);
}
