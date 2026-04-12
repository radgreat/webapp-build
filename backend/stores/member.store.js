import pool from '../db/db.js';

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeCredential(value) {
  return normalizeText(value).toLowerCase();
}

function toWholeNumber(value, fallback = 0) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return Math.max(0, Math.floor(Number(fallback) || 0));
  }
  return Math.max(0, Math.floor(numeric));
}

function normalizeBusinessCenterNodeType(value) {
  return normalizeCredential(value) === 'placeholder'
    ? 'placeholder'
    : 'primary';
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

function mapDbMemberToAppMember(row) {
  if (!row) {
    return null;
  }

  const linkedAccountStatus = normalizeText(
    row.user_account_status
    || row.account_status,
  );
  const effectivePasswordSetupRequired = (
    typeof row.user_password_setup_required === 'boolean'
      ? row.user_password_setup_required
      : row.password_setup_required
  );
  const effectiveActivityActiveUntilAt = (
    row.user_activity_active_until_at
    || row.activity_active_until_at
  );

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
    accountStatus: linkedAccountStatus,
    status: linkedAccountStatus,
    activityActiveUntilAt: toIsoStringOrEmpty(effectiveActivityActiveUntilAt),
    lastProductPurchaseAt: toIsoStringOrEmpty(row.last_product_purchase_at),
    lastPurchaseAt: toIsoStringOrEmpty(row.last_purchase_at),
    lastAccountUpgradeAt: toIsoStringOrEmpty(row.last_account_upgrade_at),
    lastAccountUpgradeFromPackage: row.last_account_upgrade_from_package,
    lastAccountUpgradeToPackage: row.last_account_upgrade_to_package,
    lastAccountUpgradePvGain: Number(row.last_account_upgrade_pv_gain || 0),
    fastTrackBonusAmount: Number(row.fast_track_bonus_amount || 0),
    passwordSetupRequired: Boolean(effectivePasswordSetupRequired),
    passwordSetupEmailQueued: Boolean(row.password_setup_email_queued),
    passwordSetupTokenExpiresAt: toIsoStringOrEmpty(row.password_setup_token_expires_at),
    passwordSetupLink: row.password_setup_link,
    serverCutoffBaselineStarterPersonalPv: Number(row.server_cutoff_baseline_starter_personal_pv || 0),
    serverCutoffBaselineSetAt: toIsoStringOrEmpty(row.server_cutoff_baseline_set_at),
    businessCenterOwnerUserId: row.business_center_owner_user_id,
    businessCenterOwnerUsername: row.business_center_owner_username,
    businessCenterOwnerEmail: row.business_center_owner_email,
    businessCenterNodeType: normalizeBusinessCenterNodeType(row.business_center_node_type),
    businessCenterIndex: toWholeNumber(row.business_center_index, 0),
    businessCenterLabel: row.business_center_label,
    businessCenterActivatedAt: toIsoStringOrEmpty(row.business_center_activated_at),
    businessCenterPinnedSide: row.business_center_pinned_side,
    legacyLeadershipCompletedTierCount: toWholeNumber(row.legacy_leadership_completed_tier_count, 0),
    businessCentersEarnedLifetime: toWholeNumber(row.business_centers_earned_lifetime, 0),
    businessCentersActivated: toWholeNumber(row.business_centers_activated, 0),
    businessCentersPending: toWholeNumber(row.business_centers_pending, 0),
    businessCentersOverflowPending: toWholeNumber(row.business_centers_overflow_pending, 0),
    businessCentersCount: toWholeNumber(row.business_centers_count, 0),
    isStaffTreeAccount: Boolean(row.is_staff_tree_account),
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
    business_center_owner_user_id: member?.businessCenterOwnerUserId || null,
    business_center_owner_username: member?.businessCenterOwnerUsername || '',
    business_center_owner_email: member?.businessCenterOwnerEmail || '',
    business_center_node_type: normalizeBusinessCenterNodeType(member?.businessCenterNodeType),
    business_center_index: toWholeNumber(member?.businessCenterIndex, 0),
    business_center_label: member?.businessCenterLabel || '',
    business_center_activated_at: member?.businessCenterActivatedAt || null,
    business_center_pinned_side: member?.businessCenterPinnedSide || '',
    legacy_leadership_completed_tier_count: toWholeNumber(member?.legacyLeadershipCompletedTierCount, 0),
    business_centers_earned_lifetime: toWholeNumber(member?.businessCentersEarnedLifetime, 0),
    business_centers_activated: toWholeNumber(member?.businessCentersActivated, 0),
    business_centers_pending: toWholeNumber(member?.businessCentersPending, 0),
    business_centers_overflow_pending: toWholeNumber(member?.businessCentersOverflowPending, 0),
    business_centers_count: toWholeNumber(member?.businessCentersCount, 0),
    is_staff_tree_account: Boolean(member?.isStaffTreeAccount),
    created_at: member?.createdAt || new Date().toISOString(),
  };
}

function resolveQueryClient(candidateClient) {
  return candidateClient && typeof candidateClient.query === 'function'
    ? candidateClient
    : pool;
}

let registeredMembersBusinessCenterColumnsReady = false;
let registeredMembersBusinessCenterColumnsPromise = null;

async function ensureRegisteredMembersBusinessCenterColumns() {
  if (registeredMembersBusinessCenterColumnsReady) {
    return;
  }

  if (registeredMembersBusinessCenterColumnsPromise) {
    return registeredMembersBusinessCenterColumnsPromise;
  }

  registeredMembersBusinessCenterColumnsPromise = (async () => {
    await pool.query(`
      ALTER TABLE charge.registered_members
        ADD COLUMN IF NOT EXISTS business_center_owner_user_id text,
        ADD COLUMN IF NOT EXISTS business_center_owner_username text NOT NULL DEFAULT '',
        ADD COLUMN IF NOT EXISTS business_center_owner_email text NOT NULL DEFAULT '',
        ADD COLUMN IF NOT EXISTS business_center_node_type text NOT NULL DEFAULT 'primary',
        ADD COLUMN IF NOT EXISTS business_center_index integer NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS business_center_label text NOT NULL DEFAULT '',
        ADD COLUMN IF NOT EXISTS business_center_activated_at timestamptz,
        ADD COLUMN IF NOT EXISTS business_center_pinned_side text NOT NULL DEFAULT '',
        ADD COLUMN IF NOT EXISTS legacy_leadership_completed_tier_count integer NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS business_centers_earned_lifetime integer NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS business_centers_activated integer NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS business_centers_pending integer NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS business_centers_overflow_pending integer NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS business_centers_count integer NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS is_staff_tree_account boolean NOT NULL DEFAULT false
    `);

    await pool.query(`
      UPDATE charge.registered_members
      SET business_center_node_type = 'primary'
      WHERE business_center_node_type IS NULL
         OR BTRIM(business_center_node_type) = ''
    `);

    registeredMembersBusinessCenterColumnsReady = true;
  })().catch((error) => {
    registeredMembersBusinessCenterColumnsReady = false;
    throw error;
  }).finally(() => {
    if (!registeredMembersBusinessCenterColumnsReady) {
      registeredMembersBusinessCenterColumnsPromise = null;
    }
  });

  return registeredMembersBusinessCenterColumnsPromise;
}

export async function warmRegisteredMembersStoreSchema() {
  await ensureRegisteredMembersBusinessCenterColumns();
}

export async function readRegisteredMembersStore() {
  await ensureRegisteredMembersBusinessCenterColumns();

  const result = await pool.query(`
    SELECT
      rm.*,
      linked_user.account_status AS user_account_status,
      linked_user.password_setup_required AS user_password_setup_required,
      linked_user.activity_active_until_at AS user_activity_active_until_at
    FROM charge.registered_members AS rm
    LEFT JOIN LATERAL (
      SELECT
        mu.account_status,
        mu.password_setup_required,
        mu.activity_active_until_at,
        mu.updated_at,
        mu.created_at
      FROM charge.member_users AS mu
      WHERE (
        BTRIM(COALESCE(rm.user_id, '')) <> ''
        AND mu.id = rm.user_id
      )
      OR (
        BTRIM(COALESCE(rm.user_id, '')) = ''
        AND BTRIM(COALESCE(rm.member_username, '')) <> ''
        AND LOWER(mu.username) = LOWER(rm.member_username)
      )
      OR (
        BTRIM(COALESCE(rm.user_id, '')) = ''
        AND BTRIM(COALESCE(rm.email, '')) <> ''
        AND LOWER(mu.email) = LOWER(rm.email)
      )
      ORDER BY
        CASE
          WHEN BTRIM(COALESCE(rm.user_id, '')) <> '' AND mu.id = rm.user_id THEN 0
          WHEN BTRIM(COALESCE(rm.member_username, '')) <> '' AND LOWER(mu.username) = LOWER(rm.member_username) THEN 1
          ELSE 2
        END,
        mu.updated_at DESC NULLS LAST,
        mu.created_at DESC NULLS LAST
      LIMIT 1
    ) AS linked_user ON TRUE
    ORDER BY rm.created_at DESC
  `);

  return result.rows.map(mapDbMemberToAppMember);
}

export async function writeRegisteredMembersStore(members) {
  await ensureRegisteredMembersBusinessCenterColumns();

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
          business_center_owner_user_id,
          business_center_owner_username,
          business_center_owner_email,
          business_center_node_type,
          business_center_index,
          business_center_label,
          business_center_activated_at,
          business_center_pinned_side,
          legacy_leadership_completed_tier_count,
          business_centers_earned_lifetime,
          business_centers_activated,
          business_centers_pending,
          business_centers_overflow_pending,
          business_centers_count,
          is_staff_tree_account,
          created_at
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
          $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
          $21,$22,$23,$24,$25,$26,$27,$28,$29,$30,
          $31,$32,$33,$34,$35,$36,$37,$38,$39,$40,
          $41,$42,$43,$44,$45,$46,$47,$48,$49,$50,
          $51,$52,$53,$54,$55
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
        row.business_center_owner_user_id,
        row.business_center_owner_username,
        row.business_center_owner_email,
        row.business_center_node_type,
        row.business_center_index,
        row.business_center_label,
        row.business_center_activated_at,
        row.business_center_pinned_side,
        row.legacy_leadership_completed_tier_count,
        row.business_centers_earned_lifetime,
        row.business_centers_activated,
        row.business_centers_pending,
        row.business_centers_overflow_pending,
        row.business_centers_count,
        row.is_staff_tree_account,
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

export async function upsertRegisteredMemberRecord(member, options = {}) {
  await ensureRegisteredMembersBusinessCenterColumns();

  const row = mapAppMemberToDbMember(member);
  if (!row.id) {
    throw new Error('Cannot upsert registered member without an id.');
  }

  const client = resolveQueryClient(options?.client);
  const insertValues = [
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
    row.business_center_owner_user_id,
    row.business_center_owner_username,
    row.business_center_owner_email,
    row.business_center_node_type,
    row.business_center_index,
    row.business_center_label,
    row.business_center_activated_at,
    row.business_center_pinned_side,
    row.legacy_leadership_completed_tier_count,
    row.business_centers_earned_lifetime,
    row.business_centers_activated,
    row.business_centers_pending,
    row.business_centers_overflow_pending,
    row.business_centers_count,
    row.is_staff_tree_account,
    row.created_at,
  ];
  const insertSql = `
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
      business_center_owner_user_id,
      business_center_owner_username,
      business_center_owner_email,
      business_center_node_type,
      business_center_index,
      business_center_label,
      business_center_activated_at,
      business_center_pinned_side,
      legacy_leadership_completed_tier_count,
      business_centers_earned_lifetime,
      business_centers_activated,
      business_centers_pending,
      business_centers_overflow_pending,
      business_centers_count,
      is_staff_tree_account,
      created_at
    )
    VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
      $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
      $21,$22,$23,$24,$25,$26,$27,$28,$29,$30,
      $31,$32,$33,$34,$35,$36,$37,$38,$39,$40,
      $41,$42,$43,$44,$45,$46,$47,$48,$49,$50,
      $51,$52,$53,$54,$55
    )
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
    UPDATE charge.registered_members
    SET
      user_id = $2,
      full_name = $3,
      email = $4,
      country_flag = $5,
      member_username = $6,
      phone = $7,
      notes = $8,
      sponsor_username = $9,
      sponsor_name = $10,
      enrollment_context = $11,
      is_admin_placement = $12,
      placement_leg = $13,
      is_spillover = $14,
      spillover_placement_side = $15,
      spillover_parent_reference = $16,
      enrollment_package = $17,
      enrollment_package_label = $18,
      fast_track_tier = $19,
      fast_track_tier_label = $20,
      package_price = $21,
      package_bv = $22,
      rank = $23,
      account_rank = $24,
      starter_personal_pv = $25,
      activity_active_until_at = $26,
      last_product_purchase_at = $27,
      last_purchase_at = $28,
      last_account_upgrade_at = $29,
      last_account_upgrade_from_package = $30,
      last_account_upgrade_to_package = $31,
      last_account_upgrade_pv_gain = $32,
      fast_track_bonus_amount = $33,
      password_setup_required = $34,
      password_setup_email_queued = $35,
      password_setup_token_expires_at = $36,
      password_setup_link = $37,
      server_cutoff_baseline_starter_personal_pv = $38,
      server_cutoff_baseline_set_at = $39,
      business_center_owner_user_id = $40,
      business_center_owner_username = $41,
      business_center_owner_email = $42,
      business_center_node_type = $43,
      business_center_index = $44,
      business_center_label = $45,
      business_center_activated_at = $46,
      business_center_pinned_side = $47,
      legacy_leadership_completed_tier_count = $48,
      business_centers_earned_lifetime = $49,
      business_centers_activated = $50,
      business_centers_pending = $51,
      business_centers_overflow_pending = $52,
      business_centers_count = $53,
      is_staff_tree_account = $54,
      updated_at = NOW()
    WHERE id = $1
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
    row.business_center_owner_user_id,
    row.business_center_owner_username,
    row.business_center_owner_email,
    row.business_center_node_type,
    row.business_center_index,
    row.business_center_label,
    row.business_center_activated_at,
    row.business_center_pinned_side,
    row.legacy_leadership_completed_tier_count,
    row.business_centers_earned_lifetime,
    row.business_centers_activated,
    row.business_centers_pending,
    row.business_centers_overflow_pending,
    row.business_centers_count,
    row.is_staff_tree_account,
  ]);

  if (updateResult.rowCount > 0) {
    return;
  }

  await client.query(insertSql, insertValues);
}
