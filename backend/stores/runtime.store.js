import pool from '../db/db.js'

async function ensureRuntimeSettingsLegalColumnsStore() {
  await pool.query(`
    ALTER TABLE charge.runtime_settings
      ADD COLUMN IF NOT EXISTS legal_terms_of_service TEXT,
      ADD COLUMN IF NOT EXISTS legal_agreement TEXT,
      ADD COLUMN IF NOT EXISTS legal_shipping_policy TEXT,
      ADD COLUMN IF NOT EXISTS legal_refund_policy TEXT
  `)
}

export async function readRuntimeSettingsStore() {
  await ensureRuntimeSettingsLegalColumnsStore()

  const result = await pool.query(`
    SELECT
      dashboard_mockup_mode_enabled,
      tier_claim_mock_mode_enabled,
      legal_terms_of_service,
      legal_agreement,
      legal_shipping_policy,
      legal_refund_policy,
      updated_by,
      updated_at
    FROM charge.runtime_settings
    WHERE id = 1
  `)

  return result.rows[0]
}

export async function writeRuntimeSettingsStore(payload) {
  await ensureRuntimeSettingsLegalColumnsStore()

  const {
    dashboardMockupModeEnabled,
    tierClaimMockModeEnabled,
    legalTermsOfService,
    legalAgreement,
    legalShippingPolicy,
    legalRefundPolicy,
    updatedBy
  } = payload

  const result = await pool.query(`
    UPDATE charge.runtime_settings
    SET
      dashboard_mockup_mode_enabled = $1,
      tier_claim_mock_mode_enabled = $2,
      legal_terms_of_service = $3,
      legal_agreement = $4,
      legal_shipping_policy = $5,
      legal_refund_policy = $6,
      updated_by = $7,
      updated_at = NOW()
    WHERE id = 1
    RETURNING *
  `, [
    dashboardMockupModeEnabled,
    tierClaimMockModeEnabled,
    legalTermsOfService,
    legalAgreement,
    legalShippingPolicy,
    legalRefundPolicy,
    updatedBy || 'system'
  ])

  return result.rows[0]
}
