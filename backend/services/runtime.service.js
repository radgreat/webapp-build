import {
  readRuntimeSettingsStore,
  writeRuntimeSettingsStore,
} from '../stores/runtime.store.js';

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeFallbackSponsorUsername(value) {
  return normalizeText(value).toLowerCase();
}

function normalizeLegalDocuments(value = {}) {
  const source = value && typeof value === 'object' ? value : {};
  return {
    termsOfService: normalizeText(source.termsOfService),
    agreement: normalizeText(source.agreement),
    shippingPolicy: normalizeText(source.shippingPolicy),
    refundPolicy: normalizeText(source.refundPolicy),
  };
}

function mapLegalDocumentsFromStore(settings = {}) {
  return normalizeLegalDocuments({
    termsOfService: settings?.legal_terms_of_service,
    agreement: settings?.legal_agreement,
    shippingPolicy: settings?.legal_shipping_policy,
    refundPolicy: settings?.legal_refund_policy,
  });
}

function mapFallbackSponsorUsernameFromStore(settings = {}) {
  return normalizeFallbackSponsorUsername(
    settings?.unattributed_free_account_fallback_sponsor_username,
  );
}

export async function getRuntimeSettings() {
  const settings = await readRuntimeSettingsStore();
  const legalDocuments = mapLegalDocumentsFromStore(settings);
  const fallbackSponsorUsername = mapFallbackSponsorUsernameFromStore(settings);

  return {
    success: true,
    status: 200,
    data: {
      settings: {
        dashboardMockupModeEnabled: Boolean(settings?.dashboard_mockup_mode_enabled),
        tierClaimMockModeEnabled: Boolean(settings?.tier_claim_mock_mode_enabled),
        legal: legalDocuments,
        unattributedFreeAccountFallbackSponsorUsername: fallbackSponsorUsername,
      },
    },
  };
}

export async function updateRuntimeSettings(payload = {}) {
  const currentSettings = await readRuntimeSettingsStore();
  const currentLegalDocuments = mapLegalDocumentsFromStore(currentSettings);
  const incomingLegalDocuments = payload?.legal && typeof payload.legal === 'object'
    ? payload.legal
    : {};
  const normalizedIncomingLegalDocuments = normalizeLegalDocuments(incomingLegalDocuments);
  const hasIncomingLegalDocuments = payload?.legal && typeof payload.legal === 'object';
  const hasIncomingFallbackSponsorUsername = Object.prototype.hasOwnProperty.call(
    payload || {},
    'unattributedFreeAccountFallbackSponsorUsername',
  );
  const nextLegalDocuments = {
    termsOfService: hasIncomingLegalDocuments
      ? normalizedIncomingLegalDocuments.termsOfService
      : currentLegalDocuments.termsOfService,
    agreement: hasIncomingLegalDocuments
      ? normalizedIncomingLegalDocuments.agreement
      : currentLegalDocuments.agreement,
    shippingPolicy: hasIncomingLegalDocuments
      ? normalizedIncomingLegalDocuments.shippingPolicy
      : currentLegalDocuments.shippingPolicy,
    refundPolicy: hasIncomingLegalDocuments
      ? normalizedIncomingLegalDocuments.refundPolicy
      : currentLegalDocuments.refundPolicy,
  };
  const currentFallbackSponsorUsername = mapFallbackSponsorUsernameFromStore(currentSettings);
  const nextFallbackSponsorUsername = hasIncomingFallbackSponsorUsername
    ? normalizeFallbackSponsorUsername(payload?.unattributedFreeAccountFallbackSponsorUsername)
    : currentFallbackSponsorUsername;

  const nextSettings = {
    dashboardMockupModeEnabled:
      typeof payload.dashboardMockupModeEnabled === 'boolean'
        ? payload.dashboardMockupModeEnabled
        : Boolean(currentSettings?.dashboard_mockup_mode_enabled),

    tierClaimMockModeEnabled:
      typeof payload.tierClaimMockModeEnabled === 'boolean'
        ? payload.tierClaimMockModeEnabled
        : Boolean(currentSettings?.tier_claim_mock_mode_enabled),

    legalTermsOfService: nextLegalDocuments.termsOfService,
    legalAgreement: nextLegalDocuments.agreement,
    legalShippingPolicy: nextLegalDocuments.shippingPolicy,
    legalRefundPolicy: nextLegalDocuments.refundPolicy,
    unattributedFreeAccountFallbackSponsorUsername: nextFallbackSponsorUsername,

    updatedBy: normalizeText(payload.updatedBy || 'admin'),
  };

  const updated = await writeRuntimeSettingsStore(nextSettings);
  const persistedLegalDocuments = mapLegalDocumentsFromStore(updated);

  return {
    success: true,
    status: 200,
    data: {
      success: true,
      settings: {
        dashboardMockupModeEnabled: Boolean(updated?.dashboard_mockup_mode_enabled),
        tierClaimMockModeEnabled: Boolean(updated?.tier_claim_mock_mode_enabled),
        legal: persistedLegalDocuments,
        unattributedFreeAccountFallbackSponsorUsername: mapFallbackSponsorUsernameFromStore(updated),
      },
      updatedAt: updated?.updated_at || new Date().toISOString(),
      updatedBy: updated?.updated_by || nextSettings.updatedBy,
    },
  };
}
