import pool from '../db/db.js';

function normalizeCredential(value) {
  return String(value || '').trim().toLowerCase();
}

function mapDbUserToAppUser(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    username: row.username,
    email: row.email,
    countryFlag: row.country_flag,
    password: row.password_value,
    passwordSetupRequired: row.password_setup_required,
    accountStatus: row.account_status,
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
    activityActiveUntilAt: toIsoStringOrEmpty(row.activity_active_until_at),
    lastProductPurchaseAt: toIsoStringOrEmpty(row.last_product_purchase_at),
    lastPurchaseAt: toIsoStringOrEmpty(row.last_purchase_at),
    lastAccountUpgradeAt: toIsoStringOrEmpty(row.last_account_upgrade_at),

    lastAccountUpgradeFromPackage: row.last_account_upgrade_from_package,
    lastAccountUpgradeToPackage: row.last_account_upgrade_to_package,
    lastAccountUpgradePvGain: Number(row.last_account_upgrade_pv_gain || 0),
    //passwordUpdatedAt: row.password_updated_at,
    passwordUpdatedAt: toIsoStringOrEmpty(row.password_updated_at),

    serverCutoffBaselineStarterPersonalPv: Number(row.server_cutoff_baseline_starter_personal_pv || 0),
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
  return {
    id: user?.id || '',
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    country_flag: user?.countryFlag || 'un',
    password_value: user?.password || '',
    password_setup_required: Boolean(user?.passwordSetupRequired),
    account_status: user?.accountStatus || 'active',
    attribution_store_code: user?.attributionStoreCode || '',
    public_store_code: user?.publicStoreCode || '',
    store_code: user?.storeCode || '',
    enrollment_package: user?.enrollmentPackage || '',
    enrollment_package_label: user?.enrollmentPackageLabel || '',
    enrollment_package_price: Number(user?.enrollmentPackagePrice || 0),
    enrollment_package_bv: Number(user?.enrollmentPackageBv || 0),
    starter_personal_pv: Number(user?.starterPersonalPv || 0),
    starter_total_cycles: Number(user?.starterTotalCycles || 0),
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

export async function readMockUsersStore() {
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
          $21,$22,$23,$24,$25,$26,$27,$28,$29,$30
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

export async function findUserByIdentifier(identifierInput) {
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

export async function updateUserById(userIdInput, updater) {
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
      server_cutoff_baseline_set_at = $29
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
  ]);

  return mapDbUserToAppUser(result.rows[0] || null);
}