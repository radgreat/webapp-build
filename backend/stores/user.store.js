import pool from '../db/db.js';
import {
  resolveMemberAccountStatusByPersonalBv,
  resolveMemberActivityStateByPersonalBv,
} from '../utils/member-activity.helpers.js';

function normalizeCredential(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizeStoreCode(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '');
}

function mapDbUserToAppUser(row) {
  if (!row) {
    return null;
  }

  const activityState = resolveMemberActivityStateByPersonalBv({
    accountStatus: row.account_status,
    passwordSetupRequired: row.password_setup_required,
    enrollmentPackageBv: row.enrollment_package_bv,
    starterPersonalPv: row.starter_personal_pv,
    activityActiveUntilAt: row.activity_active_until_at,
    lastProductPurchaseAt: row.last_product_purchase_at,
    lastPurchaseAt: row.last_purchase_at,
    lastAccountUpgradeAt: row.last_account_upgrade_at,
    createdAt: row.created_at,
    serverCutoffBaselineStarterPersonalPv: row.server_cutoff_baseline_starter_personal_pv,
    currentPersonalPvBv: row.current_personal_pv_bv,
    currentWeekPersonalPv: row.current_week_personal_pv,
  });

  return {
    id: row.id,
    name: row.name,
    username: row.username,
    email: row.email,
    countryFlag: row.country_flag,
    password: row.password_value,
    passwordSetupRequired: row.password_setup_required,
    accountStatus: activityState.accountStatus,
    attributionStoreCode: row.attribution_store_code,
    publicStoreCode: row.public_store_code,
    storeCode: row.store_code,
    enrollmentPackage: row.enrollment_package,
    enrollmentPackageLabel: row.enrollment_package_label,
    enrollmentPackagePrice: Number(row.enrollment_package_price || 0),
    enrollmentPackageBv: Number(row.enrollment_package_bv || 0),
    starterPersonalPv: Number(row.starter_personal_pv || 0),
    starterTotalCycles: Number(row.starter_total_cycles || 0),
    rank: row.rank,
    accountRank: row.account_rank,
    //activityActiveUntilAt: row.activity_active_until_at,
    //lastProductPurchaseAt: row.last_product_purchase_at,
    //lastPurchaseAt: row.last_purchase_at,
    //lastAccountUpgradeAt: row.last_account_upgrade_at,
    activityActiveUntilAt: activityState.activeUntilAt || toIsoStringOrEmpty(row.activity_active_until_at),
    lastProductPurchaseAt: toIsoStringOrEmpty(row.last_product_purchase_at),
    lastPurchaseAt: toIsoStringOrEmpty(row.last_purchase_at),
    lastAccountUpgradeAt: toIsoStringOrEmpty(row.last_account_upgrade_at),

    lastAccountUpgradeFromPackage: row.last_account_upgrade_from_package,
    lastAccountUpgradeToPackage: row.last_account_upgrade_to_package,
    lastAccountUpgradePvGain: Number(row.last_account_upgrade_pv_gain || 0),
    //passwordUpdatedAt: row.password_updated_at,
    passwordUpdatedAt: toIsoStringOrEmpty(row.password_updated_at),

    serverCutoffBaselineStarterPersonalPv: Number(row.server_cutoff_baseline_starter_personal_pv || 0),
    currentPersonalPvBv: activityState.currentPersonalPvBv,
    monthlyPersonalBv: activityState.currentPersonalPvBv,
    isActive: activityState.isActive,
    //serverCutoffBaselineSetAt: row.server_cutoff_baseline_set_at,
    //createdAt: row.created_at,
    //updatedAt: row.updated_at,
    serverCutoffBaselineSetAt: toIsoStringOrEmpty(row.server_cutoff_baseline_set_at),
    createdAt: toIsoStringOrEmpty(row.created_at),
    updatedAt: toIsoStringOrEmpty(row.updated_at),
  };
}

//***********************/
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
//***********************/

function mapAppUserToDbUser(user) {
  const derivedAccountStatus = resolveMemberAccountStatusByPersonalBv(user);
  return {
    id: user?.id || '',
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    country_flag: user?.countryFlag || 'un',
    password_value: user?.password || '',
    password_setup_required: Boolean(user?.passwordSetupRequired),
    account_status: derivedAccountStatus || 'inactive',
    attribution_store_code: user?.attributionStoreCode || '',
    public_store_code: user?.publicStoreCode || '',
    store_code: user?.storeCode || '',
    enrollment_package: user?.enrollmentPackage || '',
    enrollment_package_label: user?.enrollmentPackageLabel || '',
    enrollment_package_price: Number(user?.enrollmentPackagePrice || 0),
    enrollment_package_bv: Number(user?.enrollmentPackageBv || 0),
    starter_personal_pv: Number(user?.starterPersonalPv || 0),
    starter_total_cycles: Number(user?.starterTotalCycles || 0),
    current_personal_pv_bv: Number(user?.currentPersonalPvBv || user?.monthlyPersonalBv || 0),
    rank: user?.rank || 'Personal',
    account_rank: user?.accountRank || 'Personal',
    activity_active_until_at: user?.activityActiveUntilAt || null,
    last_product_purchase_at: user?.lastProductPurchaseAt || null,
    last_purchase_at: user?.lastPurchaseAt || null,
    last_account_upgrade_at: user?.lastAccountUpgradeAt || null,
    last_account_upgrade_from_package: user?.lastAccountUpgradeFromPackage || '',
    last_account_upgrade_to_package: user?.lastAccountUpgradeToPackage || '',
    last_account_upgrade_pv_gain: Number(user?.lastAccountUpgradePvGain || 0),
    password_updated_at: user?.passwordUpdatedAt || null,
    server_cutoff_baseline_starter_personal_pv: Number(user?.serverCutoffBaselineStarterPersonalPv || 0),
    server_cutoff_baseline_set_at: user?.serverCutoffBaselineSetAt || null,
    created_at: user?.createdAt || new Date().toISOString(),
  };
}

function resolveQueryClient(candidateClient) {
  return candidateClient && typeof candidateClient.query === 'function'
    ? candidateClient
    : pool;
}

let memberUsersPersonalVolumeColumnsReady = false;
let memberUsersPersonalVolumeColumnsPromise = null;
let memberUsersStripeCustomerColumnReady = false;
let memberUsersStripeCustomerColumnPromise = null;
let memberUsersStripePayoutColumnsReady = false;
let memberUsersStripePayoutColumnsPromise = null;
let memberUsersEmailVerificationColumnsCache = null;
let memberUserLookupIndexesReady = false;
let memberUserLookupIndexesPromise = null;

async function ensureMemberUsersPersonalVolumeColumns() {
  if (memberUsersPersonalVolumeColumnsReady) {
    return;
  }
  if (memberUsersPersonalVolumeColumnsPromise) {
    return memberUsersPersonalVolumeColumnsPromise;
  }

  memberUsersPersonalVolumeColumnsPromise = (async () => {
    await pool.query(`
      ALTER TABLE charge.member_users
        ADD COLUMN IF NOT EXISTS current_personal_pv_bv integer NOT NULL DEFAULT 0
    `);
    memberUsersPersonalVolumeColumnsReady = true;
  })().catch((error) => {
    memberUsersPersonalVolumeColumnsReady = false;
    throw error;
  }).finally(() => {
    if (!memberUsersPersonalVolumeColumnsReady) {
      memberUsersPersonalVolumeColumnsPromise = null;
    }
  });

  return memberUsersPersonalVolumeColumnsPromise;
}

async function ensureMemberUsersStripeCustomerColumn() {
  if (memberUsersStripeCustomerColumnReady) {
    return;
  }
  if (memberUsersStripeCustomerColumnPromise) {
    return memberUsersStripeCustomerColumnPromise;
  }

  memberUsersStripeCustomerColumnPromise = (async () => {
    await pool.query(`
      ALTER TABLE charge.member_users
        ADD COLUMN IF NOT EXISTS stripe_customer_id text NOT NULL DEFAULT ''
    `);
    memberUsersStripeCustomerColumnReady = true;
  })().catch((error) => {
    memberUsersStripeCustomerColumnReady = false;
    throw error;
  }).finally(() => {
    if (!memberUsersStripeCustomerColumnReady) {
      memberUsersStripeCustomerColumnPromise = null;
    }
  });

  return memberUsersStripeCustomerColumnPromise;
}

async function ensureMemberUsersStripePayoutColumns() {
  if (memberUsersStripePayoutColumnsReady) {
    return;
  }
  if (memberUsersStripePayoutColumnsPromise) {
    return memberUsersStripePayoutColumnsPromise;
  }

  memberUsersStripePayoutColumnsPromise = (async () => {
    await pool.query(`
      ALTER TABLE charge.member_users
        ADD COLUMN IF NOT EXISTS stripe_connect_account_id text NOT NULL DEFAULT '',
        ADD COLUMN IF NOT EXISTS stripe_connect_details_submitted boolean NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS stripe_connect_payouts_enabled boolean NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS stripe_connect_charges_enabled boolean NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS stripe_connect_onboarding_complete boolean NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS stripe_connect_last_synced_at timestamptz,
        ADD COLUMN IF NOT EXISTS stripe_connect_onboarding_completed_at timestamptz
    `);
    memberUsersStripePayoutColumnsReady = true;
  })().catch((error) => {
    memberUsersStripePayoutColumnsReady = false;
    throw error;
  }).finally(() => {
    if (!memberUsersStripePayoutColumnsReady) {
      memberUsersStripePayoutColumnsPromise = null;
    }
  });

  return memberUsersStripePayoutColumnsPromise;
}

export function invalidateMemberUsersEmailVerificationColumnsCache() {
  memberUsersEmailVerificationColumnsCache = null;
}

export async function ensureMemberUserLookupIndexes() {
  await ensureMemberUsersStripeCustomerColumn();
  await ensureMemberUsersStripePayoutColumns();

  if (memberUserLookupIndexesReady) {
    return;
  }
  if (memberUserLookupIndexesPromise) {
    return memberUserLookupIndexesPromise;
  }

  memberUserLookupIndexesPromise = (async () => {
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_member_users_lower_username
      ON charge.member_users (LOWER(username))
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_member_users_lower_email
      ON charge.member_users (LOWER(email))
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_member_users_upper_store_code
      ON charge.member_users (UPPER(store_code))
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_member_users_upper_public_store_code
      ON charge.member_users (UPPER(public_store_code))
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_member_users_upper_attribution_store_code
      ON charge.member_users (UPPER(attribution_store_code))
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_member_users_stripe_customer_id
      ON charge.member_users (stripe_customer_id)
      WHERE stripe_customer_id <> ''
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_member_users_stripe_connect_account_id
      ON charge.member_users (stripe_connect_account_id)
      WHERE stripe_connect_account_id <> ''
    `);
    memberUserLookupIndexesReady = true;
  })().catch((error) => {
    memberUserLookupIndexesReady = false;
    throw error;
  }).finally(() => {
    if (!memberUserLookupIndexesReady) {
      memberUserLookupIndexesPromise = null;
    }
  });

  return memberUserLookupIndexesPromise;
}

async function resolveMemberUsersEmailVerificationColumns(options = {}) {
  const forceRefresh = options?.forceRefresh === true;
  if (!forceRefresh && memberUsersEmailVerificationColumnsCache) {
    return memberUsersEmailVerificationColumnsCache;
  }

  const result = await pool.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'charge'
      AND table_name = 'member_users'
      AND column_name IN ('email_verified', 'email_verified_at')
  `);

  const columnNames = new Set(result.rows.map((row) => String(row?.column_name || '').trim()));
  memberUsersEmailVerificationColumnsCache = {
    hasEmailVerified: columnNames.has('email_verified'),
    hasEmailVerifiedAt: columnNames.has('email_verified_at'),
  };

  return memberUsersEmailVerificationColumnsCache;
}

export async function readMockUsersStore() {
  await ensureMemberUsersPersonalVolumeColumns();

  const result = await pool.query(`
    SELECT
      id,
      name,
      username,
      email,
      country_flag,
      password_value,
      password_setup_required,
      account_status,
      attribution_store_code,
      public_store_code,
      store_code,
      enrollment_package,
      enrollment_package_label,
      enrollment_package_price,
      enrollment_package_bv,
      starter_personal_pv,
      starter_total_cycles,
      current_personal_pv_bv,
      rank,
      account_rank,
      activity_active_until_at,
      last_product_purchase_at,
      last_purchase_at,
      last_account_upgrade_at,
      last_account_upgrade_from_package,
      last_account_upgrade_to_package,
      last_account_upgrade_pv_gain,
      password_updated_at,
      server_cutoff_baseline_starter_personal_pv,
      server_cutoff_baseline_set_at,
      created_at,
      updated_at
    FROM charge.member_users
    ORDER BY created_at DESC
  `);

  return result.rows.map(mapDbUserToAppUser);
}

export async function writeMockUsersStore(users) {
  await ensureMemberUsersPersonalVolumeColumns();

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM charge.member_users');

    for (const user of Array.isArray(users) ? users : []) {
      const row = mapAppUserToDbUser(user);

      await client.query(`
        INSERT INTO charge.member_users (
          id,
          name,
          username,
          email,
          country_flag,
          password_value,
          password_setup_required,
          account_status,
          attribution_store_code,
          public_store_code,
          store_code,
          enrollment_package,
          enrollment_package_label,
          enrollment_package_price,
          enrollment_package_bv,
          starter_personal_pv,
          starter_total_cycles,
          current_personal_pv_bv,
          rank,
          account_rank,
          activity_active_until_at,
          last_product_purchase_at,
          last_purchase_at,
          last_account_upgrade_at,
          last_account_upgrade_from_package,
          last_account_upgrade_to_package,
          last_account_upgrade_pv_gain,
          password_updated_at,
          server_cutoff_baseline_starter_personal_pv,
          server_cutoff_baseline_set_at,
          created_at
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
          $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
          $21,$22,$23,$24,$25,$26,$27,$28,$29,$30,
          $31
        )
      `, [
        row.id,
        row.name,
        row.username,
        row.email,
        row.country_flag,
        row.password_value,
        row.password_setup_required,
        row.account_status,
        row.attribution_store_code,
        row.public_store_code,
        row.store_code,
        row.enrollment_package,
        row.enrollment_package_label,
        row.enrollment_package_price,
        row.enrollment_package_bv,
        row.starter_personal_pv,
        row.starter_total_cycles,
        row.current_personal_pv_bv,
        row.rank,
        row.account_rank,
        row.activity_active_until_at,
        row.last_product_purchase_at,
        row.last_purchase_at,
        row.last_account_upgrade_at,
        row.last_account_upgrade_from_package,
        row.last_account_upgrade_to_package,
        row.last_account_upgrade_pv_gain,
        row.password_updated_at,
        row.server_cutoff_baseline_starter_personal_pv,
        row.server_cutoff_baseline_set_at,
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

export async function upsertMockUserRecord(user, options = {}) {
  await ensureMemberUsersPersonalVolumeColumns();

  const row = mapAppUserToDbUser(user);
  if (!row.id) {
    throw new Error('Cannot upsert member user without an id.');
  }

  const client = resolveQueryClient(options?.client);
  const insertValues = [
    row.id,
    row.name,
    row.username,
    row.email,
    row.country_flag,
    row.password_value,
    row.password_setup_required,
    row.account_status,
    row.attribution_store_code,
    row.public_store_code,
    row.store_code,
    row.enrollment_package,
    row.enrollment_package_label,
    row.enrollment_package_price,
    row.enrollment_package_bv,
    row.starter_personal_pv,
    row.starter_total_cycles,
    row.current_personal_pv_bv,
    row.rank,
    row.account_rank,
    row.activity_active_until_at,
    row.last_product_purchase_at,
    row.last_purchase_at,
    row.last_account_upgrade_at,
    row.last_account_upgrade_from_package,
    row.last_account_upgrade_to_package,
    row.last_account_upgrade_pv_gain,
    row.password_updated_at,
    row.server_cutoff_baseline_starter_personal_pv,
    row.server_cutoff_baseline_set_at,
    row.created_at,
  ];
  const insertSql = `
    INSERT INTO charge.member_users (
      id,
      name,
      username,
      email,
      country_flag,
      password_value,
      password_setup_required,
      account_status,
      attribution_store_code,
      public_store_code,
      store_code,
      enrollment_package,
      enrollment_package_label,
      enrollment_package_price,
      enrollment_package_bv,
      starter_personal_pv,
      starter_total_cycles,
      current_personal_pv_bv,
      rank,
      account_rank,
      activity_active_until_at,
      last_product_purchase_at,
      last_purchase_at,
      last_account_upgrade_at,
      last_account_upgrade_from_package,
      last_account_upgrade_to_package,
      last_account_upgrade_pv_gain,
      password_updated_at,
      server_cutoff_baseline_starter_personal_pv,
      server_cutoff_baseline_set_at,
      created_at
    )
    VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
      $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
      $21,$22,$23,$24,$25,$26,$27,$28,$29,$30,
      $31
    )
  `;

  if (options?.preferInsert === true) {
    try {
      const fastInsertResult = await client.query(`${insertSql} ON CONFLICT (id) DO NOTHING`, insertValues);
      if (fastInsertResult.rowCount > 0) {
        return;
      }
    } catch (error) {
      // Some environments may not expose a unique/primary-key constraint on id.
      if (error?.code !== '42P10') {
        throw error;
      }
    }
  }

  const updateResult = await client.query(`
    UPDATE charge.member_users
    SET
      name = $2,
      username = $3,
      email = $4,
      country_flag = $5,
      password_value = $6,
      password_setup_required = $7,
      account_status = $8,
      attribution_store_code = $9,
      public_store_code = $10,
      store_code = $11,
      enrollment_package = $12,
      enrollment_package_label = $13,
      enrollment_package_price = $14,
      enrollment_package_bv = $15,
      starter_personal_pv = $16,
      starter_total_cycles = $17,
      rank = $18,
      account_rank = $19,
      activity_active_until_at = $20,
      last_product_purchase_at = $21,
      last_purchase_at = $22,
      last_account_upgrade_at = $23,
      last_account_upgrade_from_package = $24,
      last_account_upgrade_to_package = $25,
      last_account_upgrade_pv_gain = $26,
      password_updated_at = $27,
      server_cutoff_baseline_starter_personal_pv = $28,
      server_cutoff_baseline_set_at = $29,
      current_personal_pv_bv = $30,
      updated_at = NOW()
    WHERE id = $1
  `, [
    row.id,
    row.name,
    row.username,
    row.email,
    row.country_flag,
    row.password_value,
    row.password_setup_required,
    row.account_status,
    row.attribution_store_code,
    row.public_store_code,
    row.store_code,
    row.enrollment_package,
    row.enrollment_package_label,
    row.enrollment_package_price,
    row.enrollment_package_bv,
    row.starter_personal_pv,
    row.starter_total_cycles,
    row.rank,
    row.account_rank,
    row.activity_active_until_at,
    row.last_product_purchase_at,
    row.last_purchase_at,
    row.last_account_upgrade_at,
    row.last_account_upgrade_from_package,
    row.last_account_upgrade_to_package,
    row.last_account_upgrade_pv_gain,
    row.password_updated_at,
    row.server_cutoff_baseline_starter_personal_pv,
    row.server_cutoff_baseline_set_at,
    row.current_personal_pv_bv,
  ]);

  if (updateResult.rowCount > 0) {
    return;
  }

  await client.query(insertSql, insertValues);
}

export async function findUserByIdentifier(identifierInput) {
  await ensureMemberUsersPersonalVolumeColumns();

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
      country_flag,
      password_value,
      password_setup_required,
      account_status,
      attribution_store_code,
      public_store_code,
      store_code,
      enrollment_package,
      enrollment_package_label,
      enrollment_package_price,
      enrollment_package_bv,
      starter_personal_pv,
      starter_total_cycles,
      current_personal_pv_bv,
      rank,
      account_rank,
      activity_active_until_at,
      last_product_purchase_at,
      last_purchase_at,
      last_account_upgrade_at,
      last_account_upgrade_from_package,
      last_account_upgrade_to_package,
      last_account_upgrade_pv_gain,
      password_updated_at,
      server_cutoff_baseline_starter_personal_pv,
      server_cutoff_baseline_set_at,
      created_at,
      updated_at
    FROM charge.member_users
    WHERE LOWER(username) = $1 OR LOWER(email) = $1
    LIMIT 1
  `, [identifier]);

  return mapDbUserToAppUser(result.rows[0] || null);
}

export async function findUserById(userIdInput) {
  await ensureMemberUsersPersonalVolumeColumns();

  const userId = String(userIdInput || '').trim();
  if (!userId) {
    return null;
  }

  const result = await pool.query(`
    SELECT
      id,
      name,
      username,
      email,
      country_flag,
      password_value,
      password_setup_required,
      account_status,
      attribution_store_code,
      public_store_code,
      store_code,
      enrollment_package,
      enrollment_package_label,
      enrollment_package_price,
      enrollment_package_bv,
      starter_personal_pv,
      starter_total_cycles,
      current_personal_pv_bv,
      rank,
      account_rank,
      activity_active_until_at,
      last_product_purchase_at,
      last_purchase_at,
      last_account_upgrade_at,
      last_account_upgrade_from_package,
      last_account_upgrade_to_package,
      last_account_upgrade_pv_gain,
      password_updated_at,
      server_cutoff_baseline_starter_personal_pv,
      server_cutoff_baseline_set_at,
      created_at,
      updated_at
    FROM charge.member_users
    WHERE id = $1
    LIMIT 1
  `, [userId]);

  return mapDbUserToAppUser(result.rows[0] || null);
}

export async function findUserByUsername(usernameInput, options = {}) {
  await ensureMemberUsersPersonalVolumeColumns();

  const username = normalizeCredential(usernameInput);
  if (!username) {
    return null;
  }

  const client = resolveQueryClient(options?.client);
  const result = await client.query(`
    SELECT
      id,
      name,
      username,
      email,
      country_flag,
      password_value,
      password_setup_required,
      account_status,
      attribution_store_code,
      public_store_code,
      store_code,
      enrollment_package,
      enrollment_package_label,
      enrollment_package_price,
      enrollment_package_bv,
      starter_personal_pv,
      starter_total_cycles,
      current_personal_pv_bv,
      rank,
      account_rank,
      activity_active_until_at,
      last_product_purchase_at,
      last_purchase_at,
      last_account_upgrade_at,
      last_account_upgrade_from_package,
      last_account_upgrade_to_package,
      last_account_upgrade_pv_gain,
      password_updated_at,
      server_cutoff_baseline_starter_personal_pv,
      server_cutoff_baseline_set_at,
      created_at,
      updated_at
    FROM charge.member_users
    WHERE LOWER(username) = $1
    LIMIT 1
  `, [username]);

  return mapDbUserToAppUser(result.rows[0] || null);
}

export async function findUserByEmail(emailInput, options = {}) {
  await ensureMemberUsersPersonalVolumeColumns();

  const email = normalizeCredential(emailInput);
  if (!email) {
    return null;
  }

  const client = resolveQueryClient(options?.client);
  const result = await client.query(`
    SELECT
      id,
      name,
      username,
      email,
      country_flag,
      password_value,
      password_setup_required,
      account_status,
      attribution_store_code,
      public_store_code,
      store_code,
      enrollment_package,
      enrollment_package_label,
      enrollment_package_price,
      enrollment_package_bv,
      starter_personal_pv,
      starter_total_cycles,
      current_personal_pv_bv,
      rank,
      account_rank,
      activity_active_until_at,
      last_product_purchase_at,
      last_purchase_at,
      last_account_upgrade_at,
      last_account_upgrade_from_package,
      last_account_upgrade_to_package,
      last_account_upgrade_pv_gain,
      password_updated_at,
      server_cutoff_baseline_starter_personal_pv,
      server_cutoff_baseline_set_at,
      created_at,
      updated_at
    FROM charge.member_users
    WHERE LOWER(email) = $1
    LIMIT 1
  `, [email]);

  return mapDbUserToAppUser(result.rows[0] || null);
}

export async function isUsernameTaken(usernameInput, options = {}) {
  const username = normalizeCredential(usernameInput);
  if (!username) {
    return false;
  }

  const client = resolveQueryClient(options?.client);
  const result = await client.query(`
    SELECT 1
    FROM charge.member_users
    WHERE LOWER(username) = $1
    LIMIT 1
  `, [username]);

  return Boolean(result.rows.length);
}

export async function isEmailTaken(emailInput, options = {}) {
  const email = normalizeCredential(emailInput);
  if (!email) {
    return false;
  }

  const client = resolveQueryClient(options?.client);
  const result = await client.query(`
    SELECT 1
    FROM charge.member_users
    WHERE LOWER(email) = $1
    LIMIT 1
  `, [email]);

  return Boolean(result.rows.length);
}

export async function isStoreCodeTaken(storeCodeInput, options = {}) {
  const storeCode = normalizeStoreCode(storeCodeInput);
  if (!storeCode) {
    return false;
  }

  const client = resolveQueryClient(options?.client);
  const result = await client.query(`
    SELECT 1
    FROM charge.member_users
    WHERE UPPER(store_code) = $1
      OR UPPER(public_store_code) = $1
      OR UPPER(attribution_store_code) = $1
    LIMIT 1
  `, [storeCode]);

  return Boolean(result.rows.length);
}

export async function updateUserById(userIdInput, updater) {
  await ensureMemberUsersPersonalVolumeColumns();

  const userId = String(userIdInput || '').trim();
  if (!userId) {
    return null;
  }

  const existingUser = await findUserById(userId);
  if (!existingUser) {
    return null;
  }

  const nextUser = typeof updater === 'function'
    ? updater(existingUser)
    : { ...existingUser, ...(updater || {}) };

  const row = mapAppUserToDbUser(nextUser);

  const result = await pool.query(`
    UPDATE charge.member_users
    SET
      name = $2,
      username = $3,
      email = $4,
      country_flag = $5,
      password_value = $6,
      password_setup_required = $7,
      account_status = $8,
      attribution_store_code = $9,
      public_store_code = $10,
      store_code = $11,
      enrollment_package = $12,
      enrollment_package_label = $13,
      enrollment_package_price = $14,
      enrollment_package_bv = $15,
      starter_personal_pv = $16,
      starter_total_cycles = $17,
      rank = $18,
      account_rank = $19,
      activity_active_until_at = $20,
      last_product_purchase_at = $21,
      last_purchase_at = $22,
      last_account_upgrade_at = $23,
      last_account_upgrade_from_package = $24,
      last_account_upgrade_to_package = $25,
      last_account_upgrade_pv_gain = $26,
      password_updated_at = $27,
      server_cutoff_baseline_starter_personal_pv = $28,
      server_cutoff_baseline_set_at = $29,
      current_personal_pv_bv = $30
    WHERE id = $1
    RETURNING
      id,
      name,
      username,
      email,
      country_flag,
      password_value,
      password_setup_required,
      account_status,
      attribution_store_code,
      public_store_code,
      store_code,
      enrollment_package,
      enrollment_package_label,
      enrollment_package_price,
      enrollment_package_bv,
      starter_personal_pv,
      starter_total_cycles,
      current_personal_pv_bv,
      rank,
      account_rank,
      activity_active_until_at,
      last_product_purchase_at,
      last_purchase_at,
      last_account_upgrade_at,
      last_account_upgrade_from_package,
      last_account_upgrade_to_package,
      last_account_upgrade_pv_gain,
      password_updated_at,
      server_cutoff_baseline_starter_personal_pv,
      server_cutoff_baseline_set_at,
      created_at,
      updated_at
  `, [
    userId,
    row.name,
    row.username,
    row.email,
    row.country_flag,
    row.password_value,
    row.password_setup_required,
    row.account_status,
    row.attribution_store_code,
    row.public_store_code,
    row.store_code,
    row.enrollment_package,
    row.enrollment_package_label,
    row.enrollment_package_price,
    row.enrollment_package_bv,
    row.starter_personal_pv,
    row.starter_total_cycles,
    row.rank,
    row.account_rank,
    row.activity_active_until_at,
    row.last_product_purchase_at,
    row.last_purchase_at,
    row.last_account_upgrade_at,
    row.last_account_upgrade_from_package,
    row.last_account_upgrade_to_package,
    row.last_account_upgrade_pv_gain,
    row.password_updated_at,
    row.server_cutoff_baseline_starter_personal_pv,
    row.server_cutoff_baseline_set_at,
    row.current_personal_pv_bv,
  ]);

  return mapDbUserToAppUser(result.rows[0] || null);
}

export async function readUserEmailVerificationStatusById(userIdInput) {
  const userId = String(userIdInput || '').trim();
  if (!userId) {
    return null;
  }

  const columns = await resolveMemberUsersEmailVerificationColumns();
  if (!columns.hasEmailVerified) {
    return {
      supported: false,
      verified: false,
      verifiedAt: '',
      source: 'member_users.email_verified:not_configured',
    };
  }

  const verificationTimestampSelect = columns.hasEmailVerifiedAt
    ? 'email_verified_at'
    : 'NULL::timestamptz AS email_verified_at';

  const result = await pool.query(`
    SELECT
      COALESCE(email_verified, FALSE) AS email_verified,
      ${verificationTimestampSelect}
    FROM charge.member_users
    WHERE id = $1
    LIMIT 1
  `, [userId]);

  const row = result.rows[0] || null;
  if (!row) {
    return null;
  }

  return {
    supported: true,
    verified: Boolean(row.email_verified),
    verifiedAt: toIsoStringOrEmpty(row.email_verified_at),
    source: columns.hasEmailVerifiedAt
      ? 'member_users.email_verified+email_verified_at'
      : 'member_users.email_verified',
  };
}

export async function updateUserEmailAddressById(userIdInput, nextEmailInput, options = {}, executor = pool) {
  const userId = String(userIdInput || '').trim();
  const nextEmail = normalizeCredential(nextEmailInput);
  if (!userId || !nextEmail) {
    return null;
  }

  const columns = await resolveMemberUsersEmailVerificationColumns();
  const shouldSetVerification = Object.prototype.hasOwnProperty.call(options || {}, 'emailVerified');
  const queryValues = [userId, nextEmail];
  const setClauses = [
    'email = $2',
    'updated_at = NOW()',
  ];

  if (shouldSetVerification && columns.hasEmailVerified) {
    const emailVerified = options?.emailVerified === true;
    const verifiedAt = emailVerified
      ? (String(options?.verifiedAt || '').trim() || new Date().toISOString())
      : null;
    queryValues.push(emailVerified);
    setClauses.push(`email_verified = $${queryValues.length}`);
    if (columns.hasEmailVerifiedAt) {
      queryValues.push(verifiedAt);
      setClauses.push(`email_verified_at = $${queryValues.length}::timestamptz`);
    }
  }

  const result = await executor.query(`
    UPDATE charge.member_users
    SET ${setClauses.join(', ')}
    WHERE id = $1
    RETURNING id
  `, queryValues);

  if (!result.rows[0]?.id) {
    return null;
  }

  return findUserById(userId);
}

export async function updateUserEmailVerificationStateById(userIdInput, options = {}, executor = pool) {
  const userId = String(userIdInput || '').trim();
  if (!userId) {
    return null;
  }

  const columns = await resolveMemberUsersEmailVerificationColumns();
  if (!columns.hasEmailVerified) {
    return findUserById(userId);
  }

  const emailVerified = options?.emailVerified === true;
  const verifiedAt = emailVerified
    ? (String(options?.verifiedAt || '').trim() || new Date().toISOString())
    : null;

  const result = columns.hasEmailVerifiedAt
    ? await executor.query(`
      UPDATE charge.member_users
      SET
        email_verified = $2,
        email_verified_at = $3::timestamptz,
        updated_at = NOW()
      WHERE id = $1
      RETURNING id
    `, [userId, emailVerified, verifiedAt])
    : await executor.query(`
      UPDATE charge.member_users
      SET
        email_verified = $2,
        updated_at = NOW()
      WHERE id = $1
      RETURNING id
    `, [userId, emailVerified]);

  if (!result.rows[0]?.id) {
    return null;
  }

  return findUserById(userId);
}

function mapStripeProfileRowToUser(row) {
  if (!row) {
    return null;
  }

  return {
    id: String(row.id || '').trim(),
    name: String(row.name || '').trim(),
    username: String(row.username || '').trim(),
    email: String(row.email || '').trim(),
    stripeCustomerId: String(row.stripe_customer_id || '').trim(),
    stripeConnectAccountId: String(row.stripe_connect_account_id || '').trim(),
    stripeConnectDetailsSubmitted: row.stripe_connect_details_submitted === true,
    stripeConnectPayoutsEnabled: row.stripe_connect_payouts_enabled === true,
    stripeConnectChargesEnabled: row.stripe_connect_charges_enabled === true,
    stripeConnectOnboardingComplete: row.stripe_connect_onboarding_complete === true,
    stripeConnectLastSyncedAt: toIsoStringOrEmpty(row.stripe_connect_last_synced_at),
    stripeConnectOnboardingCompletedAt: toIsoStringOrEmpty(row.stripe_connect_onboarding_completed_at),
  };
}

export async function findUserStripeProfileById(userIdInput, options = {}) {
  await ensureMemberUsersStripeCustomerColumn();
  await ensureMemberUsersStripePayoutColumns();

  const userId = String(userIdInput || '').trim();
  if (!userId) {
    return null;
  }

  const client = resolveQueryClient(options?.client);
  const result = await client.query(`
    SELECT
      id,
      name,
      username,
      email,
      stripe_customer_id,
      stripe_connect_account_id,
      stripe_connect_details_submitted,
      stripe_connect_payouts_enabled,
      stripe_connect_charges_enabled,
      stripe_connect_onboarding_complete,
      stripe_connect_last_synced_at,
      stripe_connect_onboarding_completed_at
    FROM charge.member_users
    WHERE id = $1
    LIMIT 1
  `, [userId]);

  return mapStripeProfileRowToUser(result.rows[0] || null);
}

export async function findUserStripeProfileByUsername(usernameInput, options = {}) {
  await ensureMemberUsersStripeCustomerColumn();
  await ensureMemberUsersStripePayoutColumns();

  const username = normalizeCredential(usernameInput);
  if (!username) {
    return null;
  }

  const client = resolveQueryClient(options?.client);
  const result = await client.query(`
    SELECT
      id,
      name,
      username,
      email,
      stripe_customer_id,
      stripe_connect_account_id,
      stripe_connect_details_submitted,
      stripe_connect_payouts_enabled,
      stripe_connect_charges_enabled,
      stripe_connect_onboarding_complete,
      stripe_connect_last_synced_at,
      stripe_connect_onboarding_completed_at
    FROM charge.member_users
    WHERE LOWER(username) = $1
    LIMIT 1
  `, [username]);

  return mapStripeProfileRowToUser(result.rows[0] || null);
}

export async function findUserStripeProfileByEmail(emailInput, options = {}) {
  await ensureMemberUsersStripeCustomerColumn();
  await ensureMemberUsersStripePayoutColumns();

  const email = normalizeCredential(emailInput);
  if (!email) {
    return null;
  }

  const client = resolveQueryClient(options?.client);
  const result = await client.query(`
    SELECT
      id,
      name,
      username,
      email,
      stripe_customer_id,
      stripe_connect_account_id,
      stripe_connect_details_submitted,
      stripe_connect_payouts_enabled,
      stripe_connect_charges_enabled,
      stripe_connect_onboarding_complete,
      stripe_connect_last_synced_at,
      stripe_connect_onboarding_completed_at
    FROM charge.member_users
    WHERE LOWER(email) = $1
    LIMIT 1
  `, [email]);

  return mapStripeProfileRowToUser(result.rows[0] || null);
}

export async function findUserStripeProfileByCustomerId(customerIdInput, options = {}) {
  await ensureMemberUsersStripeCustomerColumn();
  await ensureMemberUsersStripePayoutColumns();

  const customerId = String(customerIdInput || '').trim();
  if (!customerId) {
    return null;
  }

  const client = resolveQueryClient(options?.client);
  const result = await client.query(`
    SELECT
      id,
      name,
      username,
      email,
      stripe_customer_id,
      stripe_connect_account_id,
      stripe_connect_details_submitted,
      stripe_connect_payouts_enabled,
      stripe_connect_charges_enabled,
      stripe_connect_onboarding_complete,
      stripe_connect_last_synced_at,
      stripe_connect_onboarding_completed_at
    FROM charge.member_users
    WHERE stripe_customer_id = $1
    LIMIT 1
  `, [customerId]);

  return mapStripeProfileRowToUser(result.rows[0] || null);
}

export async function updateUserStripeCustomerIdById(userIdInput, stripeCustomerIdInput, options = {}) {
  await ensureMemberUsersStripeCustomerColumn();
  await ensureMemberUsersStripePayoutColumns();

  const userId = String(userIdInput || '').trim();
  const stripeCustomerId = String(stripeCustomerIdInput || '').trim();
  if (!userId) {
    return null;
  }

  const client = resolveQueryClient(options?.client);
  const result = await client.query(`
    UPDATE charge.member_users
    SET
      stripe_customer_id = $2,
      updated_at = NOW()
    WHERE id = $1
    RETURNING
      id,
      name,
      username,
      email,
      stripe_customer_id,
      stripe_connect_account_id,
      stripe_connect_details_submitted,
      stripe_connect_payouts_enabled,
      stripe_connect_charges_enabled,
      stripe_connect_onboarding_complete,
      stripe_connect_last_synced_at,
      stripe_connect_onboarding_completed_at
  `, [userId, stripeCustomerId]);

  return mapStripeProfileRowToUser(result.rows[0] || null);
}

export async function findUserStripeProfileByConnectAccountId(connectAccountIdInput, options = {}) {
  await ensureMemberUsersStripeCustomerColumn();
  await ensureMemberUsersStripePayoutColumns();

  const connectAccountId = String(connectAccountIdInput || '').trim();
  if (!connectAccountId) {
    return null;
  }

  const client = resolveQueryClient(options?.client);
  const result = await client.query(`
    SELECT
      id,
      name,
      username,
      email,
      stripe_customer_id,
      stripe_connect_account_id,
      stripe_connect_details_submitted,
      stripe_connect_payouts_enabled,
      stripe_connect_charges_enabled,
      stripe_connect_onboarding_complete,
      stripe_connect_last_synced_at,
      stripe_connect_onboarding_completed_at
    FROM charge.member_users
    WHERE stripe_connect_account_id = $1
    LIMIT 1
  `, [connectAccountId]);

  return mapStripeProfileRowToUser(result.rows[0] || null);
}

export async function updateUserStripeConnectProfileById(userIdInput, payload = {}, options = {}) {
  await ensureMemberUsersStripeCustomerColumn();
  await ensureMemberUsersStripePayoutColumns();

  const userId = String(userIdInput || '').trim();
  if (!userId) {
    return null;
  }

  const connectAccountId = String(payload?.stripeConnectAccountId || '').trim();
  const detailsSubmitted = payload?.stripeConnectDetailsSubmitted === true;
  const payoutsEnabled = payload?.stripeConnectPayoutsEnabled === true;
  const chargesEnabled = payload?.stripeConnectChargesEnabled === true;
  const onboardingComplete = payload?.stripeConnectOnboardingComplete === true;
  const lastSyncedAt = String(payload?.stripeConnectLastSyncedAt || '').trim() || new Date().toISOString();
  const onboardingCompletedAt = onboardingComplete
    ? (String(payload?.stripeConnectOnboardingCompletedAt || '').trim() || new Date().toISOString())
    : null;

  const client = resolveQueryClient(options?.client);
  const result = await client.query(`
    UPDATE charge.member_users
    SET
      stripe_connect_account_id = $2,
      stripe_connect_details_submitted = $3,
      stripe_connect_payouts_enabled = $4,
      stripe_connect_charges_enabled = $5,
      stripe_connect_onboarding_complete = $6,
      stripe_connect_last_synced_at = $7::timestamptz,
      stripe_connect_onboarding_completed_at = CASE
        WHEN $6 THEN COALESCE(stripe_connect_onboarding_completed_at, $8::timestamptz)
        ELSE NULL
      END,
      updated_at = NOW()
    WHERE id = $1
    RETURNING
      id,
      name,
      username,
      email,
      stripe_customer_id,
      stripe_connect_account_id,
      stripe_connect_details_submitted,
      stripe_connect_payouts_enabled,
      stripe_connect_charges_enabled,
      stripe_connect_onboarding_complete,
      stripe_connect_last_synced_at,
      stripe_connect_onboarding_completed_at
  `, [
    userId,
    connectAccountId,
    detailsSubmitted,
    payoutsEnabled,
    chargesEnabled,
    onboardingComplete,
    lastSyncedAt,
    onboardingCompletedAt,
  ]);

  return mapStripeProfileRowToUser(result.rows[0] || null);
}
