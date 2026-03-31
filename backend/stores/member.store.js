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

function mapDbMemberToAppMember(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    userId: row.user_id,
    fullName: row.full_name,
    email: row.email,
    countryFlag: row.country_flag,
    memberUsername: row.member_username,
    phone: row.phone,
    notes: row.notes,
    sponsorUsername: row.sponsor_username,
    sponsorName: row.sponsor_name,
    enrollmentContext: row.enrollment_context,
    isAdminPlacement: row.is_admin_placement,
    placementLeg: row.placement_leg,
    isSpillover: row.is_spillover,
    spilloverPlacementSide: row.spillover_placement_side,
    spilloverParentReference: row.spillover_parent_reference,
    enrollmentPackage: row.enrollment_package,
    enrollmentPackageLabel: row.enrollment_package_label,
    fastTrackTier: row.fast_track_tier,
    fastTrackTierLabel: row.fast_track_tier_label,
    packagePrice: Number(row.package_price || 0),
    packageBv: Number(row.package_bv || 0),
    rank: row.rank,
    accountRank: row.account_rank,
    starterPersonalPv: Number(row.starter_personal_pv || 0),
    activityActiveUntilAt: toIsoStringOrEmpty(row.activity_active_until_at),
    lastProductPurchaseAt: toIsoStringOrEmpty(row.last_product_purchase_at),
    lastPurchaseAt: toIsoStringOrEmpty(row.last_purchase_at),
    lastAccountUpgradeAt: toIsoStringOrEmpty(row.last_account_upgrade_at),
    lastAccountUpgradeFromPackage: row.last_account_upgrade_from_package,
    lastAccountUpgradeToPackage: row.last_account_upgrade_to_package,
    lastAccountUpgradePvGain: Number(row.last_account_upgrade_pv_gain || 0),
    fastTrackBonusAmount: Number(row.fast_track_bonus_amount || 0),
    passwordSetupRequired: Boolean(row.password_setup_required),
    passwordSetupEmailQueued: Boolean(row.password_setup_email_queued),
    passwordSetupTokenExpiresAt: toIsoStringOrEmpty(row.password_setup_token_expires_at),
    passwordSetupLink: row.password_setup_link,
    serverCutoffBaselineStarterPersonalPv: Number(row.server_cutoff_baseline_starter_personal_pv || 0),
    serverCutoffBaselineSetAt: toIsoStringOrEmpty(row.server_cutoff_baseline_set_at),
    createdAt: toIsoStringOrEmpty(row.created_at),
    updatedAt: toIsoStringOrEmpty(row.updated_at),
  };
}

function mapAppMemberToDbMember(member) {
  return {
    id: member?.id || '',
    user_id: member?.userId || null,
    full_name: member?.fullName || '',
    email: member?.email || '',
    country_flag: member?.countryFlag || 'un',
    member_username: member?.memberUsername || '',
    phone: member?.phone || '',
    notes: member?.notes || '',
    sponsor_username: member?.sponsorUsername || '',
    sponsor_name: member?.sponsorName || '',
    enrollment_context: member?.enrollmentContext || 'member',
    is_admin_placement: Boolean(member?.isAdminPlacement),
    placement_leg: member?.placementLeg || 'left',
    is_spillover: Boolean(member?.isSpillover),
    spillover_placement_side: member?.spilloverPlacementSide || '',
    spillover_parent_reference: member?.spilloverParentReference || '',
    enrollment_package: member?.enrollmentPackage || '',
    enrollment_package_label: member?.enrollmentPackageLabel || '',
    fast_track_tier: member?.fastTrackTier || '',
    fast_track_tier_label: member?.fastTrackTierLabel || '',
    package_price: Number(member?.packagePrice || 0),
    package_bv: Number(member?.packageBv || 0),
    rank: member?.rank || 'Personal',
    account_rank: member?.accountRank || 'Personal',
    starter_personal_pv: Number(member?.starterPersonalPv || 0),
    activity_active_until_at: member?.activityActiveUntilAt || null,
    last_product_purchase_at: member?.lastProductPurchaseAt || null,
    last_purchase_at: member?.lastPurchaseAt || null,
    last_account_upgrade_at: member?.lastAccountUpgradeAt || null,
    last_account_upgrade_from_package: member?.lastAccountUpgradeFromPackage || '',
    last_account_upgrade_to_package: member?.lastAccountUpgradeToPackage || '',
    last_account_upgrade_pv_gain: Number(member?.lastAccountUpgradePvGain || 0),
    fast_track_bonus_amount: Number(member?.fastTrackBonusAmount || 0),
    password_setup_required: Boolean(member?.passwordSetupRequired),
    password_setup_email_queued: Boolean(member?.passwordSetupEmailQueued),
    password_setup_token_expires_at: member?.passwordSetupTokenExpiresAt || null,
    password_setup_link: member?.passwordSetupLink || '',
    server_cutoff_baseline_starter_personal_pv: Number(member?.serverCutoffBaselineStarterPersonalPv || 0),
    server_cutoff_baseline_set_at: member?.serverCutoffBaselineSetAt || null,
    created_at: member?.createdAt || new Date().toISOString(),
  };
}

export async function readRegisteredMembersStore() {
  const result = await pool.query(`
    SELECT
      id,
      user_id,
      full_name,
      email,
      country_flag,
      member_username,
      phone,
      notes,
      sponsor_username,
      sponsor_name,
      enrollment_context,
      is_admin_placement,
      placement_leg,
      is_spillover,
      spillover_placement_side,
      spillover_parent_reference,
      enrollment_package,
      enrollment_package_label,
      fast_track_tier,
      fast_track_tier_label,
      package_price,
      package_bv,
      rank,
      account_rank,
      starter_personal_pv,
      activity_active_until_at,
      last_product_purchase_at,
      last_purchase_at,
      last_account_upgrade_at,
      last_account_upgrade_from_package,
      last_account_upgrade_to_package,
      last_account_upgrade_pv_gain,
      fast_track_bonus_amount,
      password_setup_required,
      password_setup_email_queued,
      password_setup_token_expires_at,
      password_setup_link,
      server_cutoff_baseline_starter_personal_pv,
      server_cutoff_baseline_set_at,
      created_at,
      updated_at
    FROM charge.registered_members
    ORDER BY created_at DESC
  `);

  return result.rows.map(mapDbMemberToAppMember);
}

export async function writeRegisteredMembersStore(members) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM charge.registered_members');

    for (const member of Array.isArray(members) ? members : []) {
      const row = mapAppMemberToDbMember(member);

      await client.query(`
        INSERT INTO charge.registered_members (
          id,
          user_id,
          full_name,
          email,
          country_flag,
          member_username,
          phone,
          notes,
          sponsor_username,
          sponsor_name,
          enrollment_context,
          is_admin_placement,
          placement_leg,
          is_spillover,
          spillover_placement_side,
          spillover_parent_reference,
          enrollment_package,
          enrollment_package_label,
          fast_track_tier,
          fast_track_tier_label,
          package_price,
          package_bv,
          rank,
          account_rank,
          starter_personal_pv,
          activity_active_until_at,
          last_product_purchase_at,
          last_purchase_at,
          last_account_upgrade_at,
          last_account_upgrade_from_package,
          last_account_upgrade_to_package,
          last_account_upgrade_pv_gain,
          fast_track_bonus_amount,
          password_setup_required,
          password_setup_email_queued,
          password_setup_token_expires_at,
          password_setup_link,
          server_cutoff_baseline_starter_personal_pv,
          server_cutoff_baseline_set_at,
          created_at
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
          $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
          $21,$22,$23,$24,$25,$26,$27,$28,$29,$30,
          $31,$32,$33,$34,$35,$36,$37,$38,$39,$40
        )
      `, [
        row.id,
        row.user_id,
        row.full_name,
        row.email,
        row.country_flag,
        row.member_username,
        row.phone,
        row.notes,
        row.sponsor_username,
        row.sponsor_name,
        row.enrollment_context,
        row.is_admin_placement,
        row.placement_leg,
        row.is_spillover,
        row.spillover_placement_side,
        row.spillover_parent_reference,
        row.enrollment_package,
        row.enrollment_package_label,
        row.fast_track_tier,
        row.fast_track_tier_label,
        row.package_price,
        row.package_bv,
        row.rank,
        row.account_rank,
        row.starter_personal_pv,
        row.activity_active_until_at,
        row.last_product_purchase_at,
        row.last_purchase_at,
        row.last_account_upgrade_at,
        row.last_account_upgrade_from_package,
        row.last_account_upgrade_to_package,
        row.last_account_upgrade_pv_gain,
        row.fast_track_bonus_amount,
        row.password_setup_required,
        row.password_setup_email_queued,
        row.password_setup_token_expires_at,
        row.password_setup_link,
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