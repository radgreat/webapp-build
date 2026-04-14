import {
  createBinaryTreeNextEngineAdapter,
  detectBinaryTreeNextEngineMode,
} from '/binary-tree-next-engine-adapter.mjs';

const MEMBER_AUTH_STORAGE_KEY = 'vault-auth-user';
const MEMBER_AUTH_COOKIE_KEY = 'vault-auth-user-cookie';
const ADMIN_AUTH_STORAGE_KEY = 'vault-admin-auth-user';
const ADMIN_AUTH_COOKIE_KEY = 'vault-admin-auth-user-cookie';

const MIN_SCALE = 0.025;
const MAX_SCALE = Number.MAX_VALUE;
const CAMERA_DAMPING = 12;
const WHEEL_ZOOM_CAMERA_DAMPING = 9.5;
const NODE_RADIUS_BASE = 40;
const WORLD_RADIUS_BASE = 34;
const DEFAULT_HOME_SCALE = 0.025;
const PROJECTION_BASE_SCALE = 0.92;
const DEFAULT_ROOT_FOCUS_RADIUS = 38;
const UNIVERSE_DEPTH_CAP = 20;
const ANTICIPATION_MAX_GLOBAL_DEPTH = 20;
const LIVE_TREE_GLOBAL_ROOT_ID = '__global-root__';
const FREE_ACCOUNT_PACKAGE_KEY = 'preferred-customer-pack';
const FREE_ACCOUNT_RANK_KEY_SET = new Set([
  'preferred customer',
  'preferred',
  'free account',
  'free',
]);
const RIGHT_PLACEMENT_KEY_SET = new Set([
  'right',
  'extreme-right',
  'extreme_right',
  'extreme right',
  'spillover-right',
  'spillover_right',
  'spillover right',
]);
const SPILLOVER_PLACEMENT_KEY_SET = new Set([
  'spillover',
  'spillover-right',
  'spillover_right',
  'spillover right',
  'spillover-left',
  'spillover_left',
  'spillover left',
]);
const EXTREME_PLACEMENT_KEY_SET = new Set([
  'extreme-left',
  'extreme_left',
  'extreme left',
  'extreme-right',
  'extreme_right',
  'extreme right',
]);
const SELECTION_POP_MS = 320;
const SELECTION_RELEASE_MS = 220;
const SELECTION_MAX_EMPHASIS = 1.22;
const ENROLL_PLACEMENT_GROW_MS = 980;
const ENROLL_PLACEMENT_START_SCALE = 0.66;
const ENROLL_PLACEMENT_OVERSHOOT_SCALE = 1.1;
const ENROLL_PLACEMENT_OVERSHOOT_RATIO = 0.74;
const ENROLL_PLACEMENT_END_SCALE = 1;
const ENROLL_PLACEMENT_CAMERA_DAMPING = 5.9;
const ENROLL_PLACEMENT_FOCUS_RADIUS = 34;
const ENROLL_PLACEMENT_FOCUS_Y_RATIO = 0.5;
const ENROLL_PLACEMENT_CAMERA_SETTLE_DELAY_MS = 110;
const ENROLL_PLACEMENT_CAMERA_WAIT_MAX_MS = 1800;
const ENROLL_PLACEMENT_CONNECTOR_DRAW_RATIO = 0.88;
const TREE_NEXT_LIVE_SYNC_INITIAL_DELAY_MS = 900;
const TREE_NEXT_LIVE_SYNC_VISIBLE_INTERVAL_MS = 2800;
const TREE_NEXT_LIVE_SYNC_HIDDEN_INTERVAL_MS = 12000;
const TREE_NEXT_LIVE_SYNC_NEW_NODE_ANIMATION_LIMIT = 24;
const ANTICIPATION_BUTTON_ID_PREFIX = 'anticipation-slot-';
const MAIN_BACKGROUND_COLOR = '#E9EAEE';
const SHELL_PANEL_COLOR = '#F2F2F6';
const SHELL_PANEL_BORDER_COLOR = '#E7E7EA';
const SKELETON_SLOT_COLOR = '#EDEDED';
const STARTUP_REVEAL_MS = 860;
const STARTUP_REVEAL_OFFSET_Y = 86;
const STARTUP_REVEAL_BLUR_PX = 14;
const STARTUP_REVEAL_STAGGER_MS = 52;
const STARTUP_PANEL_REVEAL_MS = 620;
const STARTUP_PANEL_OFFSET_Y = 40;
const STARTUP_PANEL_BLUR_PX = 10;
const STARTUP_SIDE_PANEL_DELAY_MS = 540;
const STARTUP_DOCK_DELAY_MS = 700;
const STARTUP_REVEAL_MIN_FILTER_PX = 0.35;
const STARTUP_REVEAL_MIN_TRANSLATE_PX = 0.08;
const STARTUP_REVEAL_MIN_ALPHA = 0.995;
const STARTUP_REVEAL_END_FILTER_PROGRESS = 0.82;
const STARTUP_REVEAL_DEPTH_JITTER_BASE_MS = 18;
const STARTUP_REVEAL_DEPTH_JITTER_CAP_MS = 220;
const STARTUP_PERF_SAMPLE_MIN_FRAMES = 12;
const STARTUP_PERF_FRAME_BUDGET_MS = 20;
const STARTUP_PERF_HEAVY_PIXEL_BUDGET = 5600000;
const WHEEL_STEP_ZOOM_IN_FACTOR = 1.12;
const WHEEL_STEP_ZOOM_OUT_FACTOR = 0.9;
const UNIVERSE_ENTER_GLOBAL_ZOOM_MS = 620;
const UNIVERSE_ENTER_GLOBAL_FOCUS_RADIUS = 72;
const UNIVERSE_ENTER_LOCAL_START_SCALE_FACTOR = 0.6;
const UNIVERSE_ENTER_CAMERA_DAMPING = 4.8;
const UNIVERSE_ENTER_TRANSITION_MIN_SCALE = 0.01;
const UNIVERSE_ENTER_LOCAL_FADE_IN_MS = 300;
const UNIVERSE_BACK_LOCAL_ZOOM_MS = 620;
const UNIVERSE_BACK_LOCAL_ZOOM_OUT_FACTOR = 0.74;
const UNIVERSE_BACK_PARENT_START_SCALE_FACTOR = 1.42;
const UNIVERSE_BACK_CAMERA_DAMPING = 4.8;
const UNIVERSE_BACK_PARENT_FADE_IN_MS = 300;
const UNIVERSE_BACK_LOCAL_FADE_OUT_DELAY_MS = 0.80;
const UNIVERSE_BACK_LOCAL_FADE_OUT_MS = Math.max(
  1,
  UNIVERSE_BACK_LOCAL_ZOOM_MS - UNIVERSE_BACK_LOCAL_FADE_OUT_DELAY_MS,
);
const DEFAULT_TRACKPAD_ZOOM_SENSITIVITY = 2;
const MIN_TRACKPAD_ZOOM_SENSITIVITY = 0.05;
const MAX_TRACKPAD_ZOOM_SENSITIVITY = 6;
const TRACKPAD_PINCH_DELTA_BASE = 60;
const LOADING_MIN_MS = 460;
const LOADING_FADE_MS = 260;
const FIRST_OPEN_SPLASH_FADE_MS = 260;
const SIDE_NAV_BRAND_ITEM_BUTTON_PREFIX = 'side-nav-brand-item-';
const SIDE_NAV_SEARCH_INPUT_ID = 'binary-tree-next-side-nav-search';
const SIDE_NAV_SEARCH_DROPDOWN_ID = 'binary-tree-next-side-nav-search-dropdown';
const SIDE_NAV_PROFILE_MENU_ID = 'binary-tree-next-side-nav-profile-menu';
const SIDE_NAV_SEARCH_RESULT_MAX = 18;
const PINNED_NODE_IDS_STORAGE_KEY = 'binary-tree-next-pinned-node-ids-v1';
const PINNED_NODE_IDS_SERVER_SYNC_DEBOUNCE_MS = 280;
const MOCK_FIRST_TIME_OVERRIDE_STORAGE_KEY = 'binary-tree-next-mock-first-time-override-v1';
const ACTIVE_MEMBER_MONTHLY_PERSONAL_BV_MIN = 50;
const SERVER_CUTOFF_TIMEZONE = 'America/Los_Angeles';
const SERVER_CUTOFF_WEEKDAY = 6;
const SERVER_CUTOFF_HOUR = 23;
const SERVER_CUTOFF_MINUTE = 59;
const MEMBER_REGISTERED_MEMBERS_API = '/api/registered-members';
const MEMBER_BINARY_TREE_PINNED_NODES_API = '/api/member-auth/binary-tree-next/pinned-nodes';
const ADMIN_REGISTERED_MEMBERS_API = '/api/admin/registered-members';
const ACCOUNT_OVERVIEW_BINARY_TREE_METRICS_API = '/api/binary-tree-metrics';
const ACCOUNT_OVERVIEW_SALES_TEAM_COMMISSIONS_API = '/api/sales-team-commissions';
const ACCOUNT_OVERVIEW_COMMISSION_CONTAINERS_API = '/api/commission-containers';
const ACCOUNT_OVERVIEW_E_WALLET_API = '/api/e-wallet';
const ACCOUNT_OVERVIEW_REMOTE_SYNC_VISIBLE_INTERVAL_MS = TREE_NEXT_LIVE_SYNC_VISIBLE_INTERVAL_MS;
const ACCOUNT_OVERVIEW_REMOTE_SYNC_HIDDEN_INTERVAL_MS = TREE_NEXT_LIVE_SYNC_HIDDEN_INTERVAL_MS;
const ACCOUNT_OVERVIEW_REMOTE_SYNC_RETRY_INTERVAL_MS = 2800;
const MEMBER_REGISTERED_MEMBERS_INTENT_API = '/api/registered-members/intent';
const ADMIN_REGISTERED_MEMBERS_INTENT_API = '/api/admin/registered-members/intent';
const MEMBER_REGISTERED_MEMBERS_INTENT_COMPLETE_API = '/api/registered-members/intent/complete';
const ADMIN_REGISTERED_MEMBERS_INTENT_COMPLETE_API = '/api/admin/registered-members/intent/complete';
const MEMBER_DASHBOARD_HOME_PATH = '/index.html';
const ADMIN_DASHBOARD_HOME_PATH = '/admin.html';
const ENROLL_STRIPE_CHECKOUT_CONFIG_API = '/api/store-checkout/config';
const ENROLL_STRIPE_SCRIPT_URL = 'https://js.stripe.com/v3/';
const ENROLL_BILLING_COUNTRY_CATALOG_URL = '/node_modules/flag-icons/country.json';
const ENROLL_DEFAULT_COUNTRY_FLAG = 'us';
const ENROLL_DEFAULT_BILLING_COUNTRY_CODE = 'US';
const ENROLL_BILLING_COUNTRY_FALLBACK_OPTIONS = Object.freeze([
  Object.freeze({ code: 'US', label: 'United States' }),
]);
const ENROLL_DEFAULT_PACKAGE_KEY = 'legacy-builder-pack';
const ENROLL_CHECKOUT_TAX_RATE = 0.0975;
const ACCOUNT_OVERVIEW_SALES_TEAM_CYCLE_COMMISSION_PLAN = Object.freeze({
  [FREE_ACCOUNT_PACKAGE_KEY]: { perCycle: 0, weeklyCapCycles: 0 },
  'personal-builder-pack': { perCycle: 25, weeklyCapCycles: 50 },
  'business-builder-pack': { perCycle: 37.5, weeklyCapCycles: 250 },
  'infinity-builder-pack': { perCycle: 50, weeklyCapCycles: 500 },
  'legacy-builder-pack': { perCycle: 62.5, weeklyCapCycles: 1000 },
});
const ENROLL_SPILLOVER_MODE_DIRECT = 'direct';
const ENROLL_SPILLOVER_MODE_SPILLOVER = 'spillover';
const ENROLL_PANEL_MIN_WIDTH = 340;
const ENROLL_PANEL_MAX_WIDTH = 560;
const ENROLL_PANEL_HORIZONTAL_GAP = 22;
const ENROLL_PANEL_EDGE_PADDING = 12;
const ENROLL_PACKAGE_META = Object.freeze({
  'preferred-customer-pack': Object.freeze({
    label: 'Free Account',
    bv: 0,
    price: 0,
    selectableProducts: 0,
  }),
  'personal-builder-pack': Object.freeze({
    label: 'Personal Builder Pack',
    bv: 192,
    price: 192,
    selectableProducts: 3,
  }),
  'business-builder-pack': Object.freeze({
    label: 'Business Builder Pack',
    bv: 300,
    price: 384,
    selectableProducts: 6,
  }),
  'infinity-builder-pack': Object.freeze({
    label: 'Infinity Builder Pack',
    bv: 500,
    price: 640,
    selectableProducts: 10,
  }),
  'legacy-builder-pack': Object.freeze({
    label: 'Legacy Builder Pack',
    bv: 1000,
    price: 1280,
    selectableProducts: 20,
  }),
});
const ENROLL_PAID_PACKAGE_KEY_SET = new Set([
  'personal-builder-pack',
  'business-builder-pack',
  'infinity-builder-pack',
  'legacy-builder-pack',
]);
const ENROLL_FAST_TRACK_TIER_LABEL_BY_KEY = Object.freeze({
  'personal-pack': 'Personal Pack',
  'business-pack': 'Business Pack',
  'achievers-pack': 'Infinity Pack',
  'legacy-pack': 'Legacy Pack',
});
const ENROLL_FAST_TRACK_RATE_BY_TIER = Object.freeze({
  'personal-pack': 0.075,
  'business-pack': 0.10,
  'achievers-pack': 0.125,
  'legacy-pack': 0.20,
});
const ENROLL_FAST_TRACK_TIER_BY_PACKAGE = Object.freeze({
  'preferred-customer-pack': 'personal-pack',
  'personal-builder-pack': 'personal-pack',
  'business-builder-pack': 'business-pack',
  'infinity-builder-pack': 'achievers-pack',
  'legacy-builder-pack': 'legacy-pack',
});
const ENROLL_STEP_COPY = Object.freeze({
  1: Object.freeze({
    title: 'Enroll Member',
    subtitle: "You're about to register a new member and help them take their first step toward building their business. This process will set up their account so they can start growing, earning, and accessing all available opportunities.",
  }),
  2: Object.freeze({
    title: 'Choose the Right Package',
    subtitle: 'Select the package that best fits their goals and how they plan to grow their business. Each option offers different discounts, product quantities, and earning potential.',
  }),
  3: Object.freeze({
    title: 'Complete Registration & Payment',
    subtitle: "You're almost done! Please review all the information entered and ensure the selected package is correct before proceeding.",
  }),
  4: Object.freeze({
    title: 'Registration Complete',
    subtitle: "You're all set. This enrollment has been recorded and the member can now start building.",
  }),
});
const APPLE_MAPS_NODE_PALETTES = Object.freeze({
  root: Object.freeze({
    light: [196, 146, 115],
    mid: [168, 112, 79],
    dark: [129, 85, 58],
  }),
  accent: Object.freeze({
    light: [36, 204, 230],
    mid: [18, 181, 212],
    dark: [9, 155, 196],
  }),
  neutral: Object.freeze({
    light: [173, 181, 198],
    mid: [145, 154, 173],
    dark: [122, 131, 150],
  }),
  direct: Object.freeze({
    light: [191, 130, 255],
    mid: [158, 95, 236],
    dark: [123, 66, 209],
  }),
  directInactive: Object.freeze({
    light: [138, 145, 158],
    mid: [109, 117, 130],
    dark: [82, 90, 103],
  }),
  ocean: Object.freeze({
    light: [122, 181, 226],
    mid: [94, 151, 205],
    dark: [70, 120, 178],
  }),
  mint: Object.freeze({
    light: [150, 205, 160],
    mid: [119, 180, 132],
    dark: [90, 149, 105],
  }),
  amber: Object.freeze({
    light: [224, 180, 120],
    mid: [197, 150, 92],
    dark: [167, 118, 64],
  }),
  rose: Object.freeze({
    light: [214, 157, 151],
    mid: [188, 128, 124],
    dark: [158, 99, 97],
  }),
});
const APPLE_MAPS_NODE_COLOR_ROTATION = Object.freeze(['neutral', 'ocean', 'mint', 'amber', 'rose']);
const ACCOUNT_OVERVIEW_BADGE_PALETTES = Object.freeze({
  legacyRank: Object.freeze({
    light: [72, 128, 156],
    mid: [43, 86, 115],
    dark: [24, 50, 74],
  }),
  legacyFounder: Object.freeze({
    light: [212, 169, 72],
    mid: [164, 122, 34],
    dark: [118, 85, 22],
  }),
});
const SIDE_NAV_BRAND_MENU_ITEMS = [
  { id: 'profile', label: 'Profile', action: 'brand-menu:page:profile' },
  { id: 'dashboard', label: 'Home', action: 'brand-menu:page:dashboard' },
  { id: 'my-store', label: 'My Store', action: 'brand-menu:page:my-store' },
  { id: 'settings', label: 'Settings', action: 'brand-menu:page:settings' },
];
const SIDE_NAV_BRAND_LOGOUT_ITEM = { id: 'logout', label: 'Log out', action: 'brand-menu:action:logout' };
const isMacPlatform = (() => {
  const userAgentPlatform = safeText(window.navigator?.userAgentData?.platform || '');
  if (userAgentPlatform) {
    return /mac/i.test(userAgentPlatform);
  }
  const legacyPlatform = safeText(window.navigator?.platform || '');
  if (legacyPlatform) {
    return /mac/i.test(legacyPlatform);
  }
  return /mac/i.test(safeText(window.navigator?.userAgent || ''));
})();

const canvas = document.getElementById('figma-tree-canvas');
const bootErrorElement = document.getElementById('boot-error');
const loadingScreenElement = document.getElementById('binary-tree-loading');
const firstOpenSplashElement = document.getElementById('binary-tree-first-open-splash');
const accountOverviewPanelElement = document.getElementById('tree-next-account-overview-panel');
const accountOverviewRefreshButtonElement = document.getElementById('tree-next-account-overview-refresh');
const accountOverviewRankBadgeElement = document.getElementById('tree-next-account-overview-rank-badge');
const accountOverviewRankIconElement = document.getElementById('tree-next-account-overview-rank-icon');
const accountOverviewRankLabelElement = document.getElementById('tree-next-account-overview-rank-label');
const accountOverviewTitleBadgeElement = document.getElementById('tree-next-account-overview-title-badge');
const accountOverviewTitleIconElement = document.getElementById('tree-next-account-overview-title-icon');
const accountOverviewTitleLabelElement = document.getElementById('tree-next-account-overview-title-label');
const accountOverviewAvatarElement = document.getElementById('tree-next-account-overview-avatar');
const accountOverviewAvatarInitialsElement = document.getElementById('tree-next-account-overview-avatar-initials');
const accountOverviewStatusDotElement = document.getElementById('tree-next-account-overview-status-dot');
const accountOverviewNameElement = document.getElementById('tree-next-account-overview-name');
const accountOverviewHandleElement = document.getElementById('tree-next-account-overview-handle');
const accountOverviewJoinedElement = document.getElementById('tree-next-account-overview-joined');
const accountOverviewSalesTeamValueElement = document.getElementById('tree-next-account-overview-sales-team-value');
const accountOverviewTotalBvValueElement = document.getElementById('tree-next-account-overview-total-bv-value');
const accountOverviewPersonalBvValueElement = document.getElementById('tree-next-account-overview-personal-bv-value');
const accountOverviewActiveWindowValueElement = document.getElementById('tree-next-account-overview-active-window-value');
const accountOverviewCycleValueElement = document.getElementById('tree-next-account-overview-cycle-value');
const accountOverviewCycleLabelElement = document.getElementById('tree-next-account-overview-cycle-label');
const accountOverviewDirectSponsorsValueElement = document.getElementById('tree-next-account-overview-direct-sponsors-value');
const accountOverviewEwalletValueElement = document.getElementById('tree-next-account-overview-ewallet-value');
const accountOverviewRetailProfitValueElement = document.getElementById('tree-next-account-overview-retail-profit-value');
const accountOverviewFastTrackValueElement = document.getElementById('tree-next-account-overview-fast-track-value');
const accountOverviewTrackSalesTeamValueElement = document.getElementById('tree-next-account-overview-track-sales-team-value');
const accountOverviewInfinityBuilderValueElement = document.getElementById('tree-next-account-overview-infinity-builder-value');
const accountOverviewLegacyBuilderValueElement = document.getElementById('tree-next-account-overview-legacy-builder-value');
const accountOverviewCommissionButtons = Array.from(document.querySelectorAll('[data-account-overview-commission]'));
const treeNextEnrollModalOverlayElement = document.getElementById('tree-next-enroll-modal-overlay');
const treeNextEnrollModalElement = document.getElementById('tree-next-enroll-modal');
const treeNextEnrollModalTitleElement = document.getElementById('tree-next-enroll-modal-title');
const treeNextEnrollModalSubtitleElement = document.getElementById('tree-next-enroll-modal-subtitle');
const treeNextEnrollModalDismissButton = document.getElementById('tree-next-enroll-modal-dismiss');
const treeNextEnrollModalForm = document.getElementById('tree-next-enroll-modal-form');
const treeNextEnrollModalSubmitButton = document.getElementById('tree-next-enroll-submit');
const treeNextEnrollModalFeedback = document.getElementById('tree-next-enroll-modal-feedback');
const treeNextEnrollModalDoneButton = document.getElementById('tree-next-enroll-done');
const treeNextEnrollStepIndicatorsElement = document.getElementById('tree-next-enroll-step-indicators');
const treeNextEnrollStepElements = Array.from(document.querySelectorAll('[data-enroll-step]'));
const treeNextEnrollStepDotElements = Array.from(document.querySelectorAll('[data-enroll-step-dot]'));
const treeNextEnrollStepOneNextButton = document.getElementById('tree-next-enroll-step-1-next');
const treeNextEnrollStepTwoPreviousButton = document.getElementById('tree-next-enroll-step-2-previous');
const treeNextEnrollStepTwoNextButton = document.getElementById('tree-next-enroll-step-2-next');
const treeNextEnrollStepThreePreviousButton = document.getElementById('tree-next-enroll-step-3-previous');
const treeNextEnrollPlacementLegInput = document.getElementById('tree-next-enroll-placement-leg');
const treeNextEnrollPlacementParentIdInput = document.getElementById('tree-next-enroll-placement-parent-id');
const treeNextEnrollEmailInput = document.getElementById('tree-next-enroll-email');
const treeNextEnrollUsernameInput = document.getElementById('tree-next-enroll-username');
const treeNextEnrollFirstNameInput = document.getElementById('tree-next-enroll-first-name');
const treeNextEnrollLastNameInput = document.getElementById('tree-next-enroll-last-name');
const treeNextEnrollSponsorInput = document.getElementById('tree-next-enroll-sponsor');
const treeNextEnrollParentInput = document.getElementById('tree-next-enroll-parent');
const treeNextEnrollLegPositionInput = document.getElementById('tree-next-enroll-leg-position');
const treeNextEnrollSpilloverModeInput = document.getElementById('tree-next-enroll-spillover-mode');
const treeNextEnrollSpilloverModeFieldGroup = treeNextEnrollSpilloverModeInput instanceof HTMLElement
  ? treeNextEnrollSpilloverModeInput.closest('.tree-next-enroll-field-group')
  : null;
const treeNextEnrollCountryFlagInput = document.getElementById('tree-next-enroll-country-flag');
const treeNextEnrollPackageInput = document.getElementById('tree-next-enroll-package');
const treeNextEnrollFastTrackTierInput = document.getElementById('tree-next-enroll-fast-track-tier');
const treeNextEnrollPackageBvElement = document.getElementById('tree-next-enroll-package-bv');
const treeNextEnrollPackageProductsElement = document.getElementById('tree-next-enroll-package-products');
const treeNextEnrollPackageFastTrackBonusElement = document.getElementById('tree-next-enroll-package-fast-track-bonus');
const treeNextEnrollSummaryPackageLabelElement = document.getElementById('tree-next-enroll-summary-package-label');
const treeNextEnrollSummarySubtotalElement = document.getElementById('tree-next-enroll-summary-subtotal');
const treeNextEnrollSummaryDiscountElement = document.getElementById('tree-next-enroll-summary-discount');
const treeNextEnrollSummaryTaxElement = document.getElementById('tree-next-enroll-summary-tax');
const treeNextEnrollSummaryTotalElement = document.getElementById('tree-next-enroll-summary-total');
const treeNextEnrollNameOnCardInput = document.getElementById('tree-next-enroll-name-on-card');
const treeNextEnrollBillingAddressInput = document.getElementById('tree-next-enroll-billing-address');
const treeNextEnrollBillingCityInput = document.getElementById('tree-next-enroll-billing-city');
const treeNextEnrollBillingStateInput = document.getElementById('tree-next-enroll-billing-state');
const treeNextEnrollBillingPostalCodeInput = document.getElementById('tree-next-enroll-billing-postal-code');
const treeNextEnrollBillingCountrySelect = document.getElementById('tree-next-enroll-billing-country');
const treeNextEnrollCardNumberElement = document.getElementById('tree-next-enroll-card-number-element');
const treeNextEnrollCardExpiryElement = document.getElementById('tree-next-enroll-card-expiry-element');
const treeNextEnrollCardCvcElement = document.getElementById('tree-next-enroll-card-cvc-element');
const treeNextEnrollCardErrorElement = document.getElementById('tree-next-enroll-card-error');
const treeNextEnrollThankYouNameElement = document.getElementById('tree-next-enroll-thank-you-name');
const treeNextEnrollThankYouPackageElement = document.getElementById('tree-next-enroll-thank-you-package');
const treeNextEnrollThankYouCommissionElement = document.getElementById('tree-next-enroll-thank-you-commission');
const treeNextEnrollPasswordSetupLinkInput = document.getElementById('tree-next-enroll-password-setup-link');
const treeNextEnrollPasswordSetupOpenButton = document.getElementById('tree-next-enroll-password-setup-open');
const treeNextEnrollPasswordSetupCopyButton = document.getElementById('tree-next-enroll-password-setup-copy');
const treeNextEnrollPasswordSetupFeedbackElement = document.getElementById('tree-next-enroll-password-setup-feedback');
const treeNextEnrollCustomSelectWrapElements = Array.from(
  document.querySelectorAll('[data-enroll-custom-select]'),
);
const treeNextEnrollCustomSelectByNativeId = new Map();

let treeNextEnrollStripeClient = null;
let treeNextEnrollStripeElements = null;
let treeNextEnrollStripeCardNumber = null;
let treeNextEnrollStripeCardExpiry = null;
let treeNextEnrollStripeCardCvc = null;
let treeNextEnrollStripeInitPromise = null;
let treeNextEnrollBillingCountryHydrationPromise = null;
let accountOverviewLastRenderSignature = '';
let accountOverviewSelectedCommissionKey = '';
let accountOverviewRemoteSnapshot = createEmptyAccountOverviewRemoteSnapshot();
let accountOverviewRemoteDataVersion = 0;
let accountOverviewRemoteSyncPromise = null;
let accountOverviewRemoteSyncInFlight = false;
let accountOverviewRemoteLastRequestAtMs = 0;
let accountOverviewRemoteLastSyncedAtMs = 0;
let accountOverviewRemoteIdentityKey = '';
let accountOverviewRemoteRequestSequence = 0;
let accountOverviewCachedLegVolumeSignature = '';
let accountOverviewCachedLegVolumeMetrics = null;
let isTreeNextEnrollStripeReady = false;
let isTreeNextEnrollStripeCardComplete = false;
let isTreeNextEnrollStripeCardExpiryComplete = false;
let isTreeNextEnrollStripeCardCvcComplete = false;

if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error('Missing #figma-tree-canvas');
}

const context = canvas.getContext('2d', { alpha: false });
if (!context) {
  throw new Error('Unable to initialize 2D canvas context.');
}
const glassBackdropCanvas = document.createElement('canvas');
const glassBackdropContext = glassBackdropCanvas.getContext('2d', { alpha: false });
if (!glassBackdropContext) {
  throw new Error('Unable to initialize offscreen glass backdrop context.');
}
let launchStateResetInFlight = false;
let pinnedNodeIdsServerSyncTimerId = 0;
let pinnedNodeIdsServerSyncInFlight = false;
let pinnedNodeIdsServerSyncQueued = false;
let pinnedNodeIdsLastSyncedKey = '';
let pinnedNodeIdsLocalDirty = false;
const avatarImageAssetCache = new Map();

const state = {
  source: 'member',
  session: null,
  engineMode: {
    mode: 'mock-js',
    reason: 'Initializing runtime...',
    wasmSupported: typeof WebAssembly === 'object',
    wasmArtifactDetected: false,
  },
  adapter: createBinaryTreeNextEngineAdapter(),
  nodes: [],
  selectedId: '',
  query: '',
  depthFilter: 'all',
  showConnectors: true,
  pinnedNodeIds: [],
  universe: {
    rootId: 'root',
    depthCap: UNIVERSE_DEPTH_CAP,
    breadcrumb: ['root'],
    cameraByRoot: Object.create(null),
    history: [],
    enterPrepToken: '',
    enterPrepTimeoutId: 0,
    enterPrepRafId: 0,
    backPrepToken: '',
    backPrepRafId: 0,
    enterViewFadeMode: 'none',
    enterViewFadeStartedAtMs: 0,
    enterViewFadeDurationMs: 0,
  },
  ui: {
    sideNavOpen: true,
    accountOverviewVisible: false,
    sideNavBrandMenuOpen: false,
    sideNavBrandMenuAnchorRect: null,
    sideNavSearchInputRect: null,
    sideNavSearchInputOpacity: 0,
    sideNavSearchDropdownRect: null,
    sideNavSearchResults: [],
    sideNavSearchDropdownOpen: false,
    sideNavSearchActiveIndex: -1,
    sideNavFavorites: {
      viewportRect: null,
      contentWidth: 0,
      scrollX: 0,
      dragActive: false,
      dragPointerId: null,
      dragStartX: 0,
      dragStartScrollX: 0,
      dragStartY: 0,
      dragMoved: false,
      tapAction: '',
      placesCacheKey: '',
      placesCacheLimit: 0,
      placesCache: [],
    },
  },
  enroll: {
    open: false,
    step: 1,
    submitting: false,
    placementLock: null,
    pendingPlacement: null,
    lastTriggerElement: null,
  },
  layout: null,
  viewport: null,
  frameResult: null,
  anticipationSlots: [],
  nodeChildLegIndex: new Map(),
  buttons: [],
  hoveredButtonId: '',
  pointer: {
    x: 0,
    y: 0,
    inside: false,
  },
  drag: {
    active: false,
    pointerId: null,
    lastX: 0,
    lastY: 0,
  },
  reverseTrackpadMovement: false,
  trackpadZoomSensitivity: DEFAULT_TRACKPAD_ZOOM_SENSITIVITY,
  camera: {
    view: {
      x: 0,
      y: 0,
      scale: DEFAULT_HOME_SCALE,
    },
    target: null,
    targetReason: '',
  },
  perf: {
    fps: 0,
    frameMs: 0,
  },
  intro: {
    startedAtMs: null,
    durationMs: STARTUP_REVEAL_MS,
    offsetYPx: STARTUP_REVEAL_OFFSET_Y,
    blurPx: STARTUP_REVEAL_BLUR_PX,
    staggerMs: STARTUP_REVEAL_STAGGER_MS,
    panelBlurPx: STARTUP_PANEL_BLUR_PX,
    mode: 'full',
    connectorRevealMode: 'full',
    skipDotReveal: false,
    skipConnectorReveal: false,
    degradedForPerf: false,
    sampleCount: 0,
    sampleFrameMsTotal: 0,
  },
  loading: {
    startedAtMs: performance.now(),
    minMs: LOADING_MIN_MS,
    fadeMs: LOADING_FADE_MS,
  },
  launchState: {
    firstTime: false,
    firstOpenedAt: '',
    lastOpenedAt: '',
    pinnedNodeIds: [],
    pinnedNodeIdsUpdatedAt: '',
    checkedAt: '',
    source: 'uninitialized',
  },
  timeMs: performance.now(),
  selectionFxTracks: Object.create(null),
  placementFxTracks: Object.create(null),
  pendingPlacementReveal: null,
  liveSync: {
    started: false,
    timerId: 0,
    inFlight: false,
    lastAppliedHash: '',
    lastSyncedAtMs: 0,
    errorStreak: 0,
  },
  renderSize: {
    width: 1,
    height: 1,
    dpr: 1,
  },
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function easeOutCubic(value) {
  const t = clamp(value, 0, 1);
  return 1 - Math.pow(1 - t, 3);
}

function easeOutBack(value) {
  const t = clamp(value, 0, 1);
  const c1 = 1.4;
  const c3 = c1 + 1;
  return 1 + (c3 * Math.pow(t - 1, 3)) + (c1 * Math.pow(t - 1, 2));
}

function getNowMs() {
  return Number.isFinite(state.timeMs) ? state.timeMs : performance.now();
}

function prefersReducedMotion() {
  if (typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function detectStartupRevealMode() {
  if (prefersReducedMotion()) {
    return 'lite';
  }
  const width = Math.max(1, Math.floor(safeNumber(state.renderSize.width, 1)));
  const height = Math.max(1, Math.floor(safeNumber(state.renderSize.height, 1)));
  const dpr = Math.max(1, safeNumber(state.renderSize.dpr, 1));
  const pixelLoad = width * height * dpr * dpr;
  const cpuCores = Math.max(0, Math.floor(safeNumber(window.navigator?.hardwareConcurrency, 0)));
  const memoryGb = Math.max(0, safeNumber(window.navigator?.deviceMemory, 0));
  const heavyPixels = pixelLoad >= STARTUP_PERF_HEAVY_PIXEL_BUDGET;
  const constrainedCpu = cpuCores > 0 && cpuCores <= 8;
  const constrainedMemory = memoryGb > 0 && memoryGb <= 8;
  return (heavyPixels || constrainedCpu || constrainedMemory) ? 'lite' : 'full';
}

function configureStartupRevealProfile() {
  const intro = state.intro;
  const mode = detectStartupRevealMode();
  intro.mode = mode;
  intro.degradedForPerf = false;
  intro.sampleCount = 0;
  intro.sampleFrameMsTotal = 0;
  intro.skipDotReveal = true;
  intro.skipConnectorReveal = false;
  intro.connectorRevealMode = mode === 'lite' ? 'lite' : 'full';

  if (mode === 'lite') {
    intro.durationMs = 620;
    intro.offsetYPx = 52;
    intro.blurPx = 0;
    intro.staggerMs = 26;
    intro.panelBlurPx = 0;
    return;
  }

  intro.durationMs = STARTUP_REVEAL_MS;
  intro.offsetYPx = STARTUP_REVEAL_OFFSET_Y;
  intro.blurPx = STARTUP_REVEAL_BLUR_PX;
  intro.staggerMs = STARTUP_REVEAL_STAGGER_MS;
  intro.panelBlurPx = STARTUP_PANEL_BLUR_PX;
}

function adaptStartupRevealForFrameBudget(frameMs) {
  const intro = state.intro;
  if (!intro || intro.degradedForPerf || !Number.isFinite(intro.startedAtMs)) {
    return;
  }
  if ((state.timeMs - intro.startedAtMs) > 2200) {
    return;
  }

  intro.sampleCount = Math.max(0, Math.floor(safeNumber(intro.sampleCount, 0))) + 1;
  intro.sampleFrameMsTotal = Math.max(0, safeNumber(intro.sampleFrameMsTotal, 0)) + Math.max(0, safeNumber(frameMs, 0));
  if (intro.sampleCount < STARTUP_PERF_SAMPLE_MIN_FRAMES) {
    return;
  }

  const averageFrameMs = intro.sampleFrameMsTotal / intro.sampleCount;
  if (averageFrameMs <= STARTUP_PERF_FRAME_BUDGET_MS) {
    return;
  }

  intro.degradedForPerf = true;
  intro.mode = 'adaptive-lite';
  intro.durationMs = Math.min(safeNumber(intro.durationMs, STARTUP_REVEAL_MS), 620);
  intro.offsetYPx = Math.min(safeNumber(intro.offsetYPx, STARTUP_REVEAL_OFFSET_Y), 52);
  intro.blurPx = 0;
  intro.staggerMs = Math.min(safeNumber(intro.staggerMs, STARTUP_REVEAL_STAGGER_MS), 26);
  intro.panelBlurPx = 0;
  intro.connectorRevealMode = 'lite';
  intro.skipDotReveal = true;
  intro.skipConnectorReveal = false;
}

function hideLoadingScreenImmediately() {
  if (!(loadingScreenElement instanceof HTMLElement)) {
    return;
  }
  loadingScreenElement.style.display = 'none';
  loadingScreenElement.classList.remove('is-leaving');
}

function hideFirstOpenSplashImmediately() {
  if (!(firstOpenSplashElement instanceof HTMLElement)) {
    return;
  }
  firstOpenSplashElement.style.display = 'none';
  firstOpenSplashElement.classList.remove('is-visible');
  firstOpenSplashElement.classList.remove('is-leaving');
}

async function completeLoadingScreen() {
  const loading = state.loading || {};
  const startedAtMs = safeNumber(loading.startedAtMs, performance.now());
  const minMs = Math.max(0, safeNumber(loading.minMs, LOADING_MIN_MS));
  const elapsedMs = Math.max(0, performance.now() - startedAtMs);
  const waitMs = Math.max(0, minMs - elapsedMs);
  if (waitMs > 0) {
    await new Promise((resolve) => {
      window.setTimeout(resolve, waitMs);
    });
  }

  if (!(loadingScreenElement instanceof HTMLElement)) {
    return;
  }
  loadingScreenElement.classList.add('is-leaving');
  const fadeMs = Math.max(0, safeNumber(loading.fadeMs, LOADING_FADE_MS));
  if (fadeMs > 0) {
    await new Promise((resolve) => {
      window.setTimeout(resolve, fadeMs);
    });
  }
  loadingScreenElement.style.display = 'none';
}

function resolveSelectionEmphasis(nodeId, nowMs = getNowMs(), mutate = true) {
  const safeNodeId = safeText(nodeId);
  if (!safeNodeId) {
    return 0;
  }

  const track = state.selectionFxTracks[safeNodeId];
  if (!track) {
    return safeNodeId === safeText(state.selectedId) ? 1 : 0;
  }

  const duration = Math.max(1, safeNumber(track.duration, SELECTION_POP_MS));
  const t = clamp((nowMs - safeNumber(track.start, nowMs)) / duration, 0, 1);
  const easingValue = track.mode === 'select' ? easeOutBack(t) : easeOutCubic(t);
  const from = safeNumber(track.from, 0);
  const to = safeNumber(track.to, 0);
  let value = from + ((to - from) * easingValue);
  if (track.mode === 'select') {
    value = clamp(value, 0, SELECTION_MAX_EMPHASIS);
  } else {
    value = clamp(value, 0, 1);
  }

  if (t >= 1) {
    value = clamp(to, 0, SELECTION_MAX_EMPHASIS);
    if (mutate) {
      delete state.selectionFxTracks[safeNodeId];
    }
  }

  return value;
}

function startSelectionAnimation(
  nodeId,
  toValue,
  mode = 'select',
  nowMs = getNowMs(),
  fromOverride = null,
) {
  const safeNodeId = safeText(nodeId);
  if (!safeNodeId) {
    return;
  }
  const from = Number.isFinite(fromOverride)
    ? clamp(safeNumber(fromOverride, 0), 0, SELECTION_MAX_EMPHASIS)
    : resolveSelectionEmphasis(safeNodeId, nowMs, false);
  state.selectionFxTracks[safeNodeId] = {
    from,
    to: clamp(safeNumber(toValue, 0), 0, SELECTION_MAX_EMPHASIS),
    start: nowMs,
    duration: mode === 'select' ? SELECTION_POP_MS : SELECTION_RELEASE_MS,
    mode,
  };
}

function updateSelectionAnimations(nowMs = getNowMs()) {
  const ids = Object.keys(state.selectionFxTracks);
  for (const id of ids) {
    resolveSelectionEmphasis(id, nowMs, true);
  }
}

function resolvePlacementScale(nodeId, nowMs = getNowMs(), mutate = true) {
  const safeNodeId = safeText(nodeId);
  if (!safeNodeId) {
    return ENROLL_PLACEMENT_END_SCALE;
  }

  const track = state.placementFxTracks[safeNodeId];
  if (!track) {
    return ENROLL_PLACEMENT_END_SCALE;
  }

  const duration = Math.max(1, safeNumber(track.duration, ENROLL_PLACEMENT_GROW_MS));
  const t = clamp((nowMs - safeNumber(track.start, nowMs)) / duration, 0, 1);
  const from = safeNumber(track.from, ENROLL_PLACEMENT_START_SCALE);
  const peak = safeNumber(track.peak, ENROLL_PLACEMENT_OVERSHOOT_SCALE);
  const to = safeNumber(track.to, ENROLL_PLACEMENT_END_SCALE);
  const peakRatio = clamp(safeNumber(track.peakRatio, ENROLL_PLACEMENT_OVERSHOOT_RATIO), 0.05, 0.95);
  let scale = to;
  if (t <= peakRatio) {
    const localT = peakRatio <= 0 ? 1 : clamp(t / peakRatio, 0, 1);
    const easingValue = easeOutCubic(localT);
    scale = from + ((peak - from) * easingValue);
  } else {
    const localT = peakRatio >= 1 ? 1 : clamp((t - peakRatio) / (1 - peakRatio), 0, 1);
    const easingValue = easeOutCubic(localT);
    scale = peak + ((to - peak) * easingValue);
  }
  scale = clamp(scale, 0.2, 3);
  if (t >= 1) {
    scale = clamp(to, 0.2, 3);
    if (mutate) {
      delete state.placementFxTracks[safeNodeId];
    }
  }

  return scale;
}

function startPlacementGrowAnimation(nodeId, nowMs = getNowMs()) {
  const safeNodeId = safeText(nodeId);
  if (!safeNodeId) {
    return;
  }
  state.placementFxTracks[safeNodeId] = {
    from: ENROLL_PLACEMENT_START_SCALE,
    peak: ENROLL_PLACEMENT_OVERSHOOT_SCALE,
    peakRatio: ENROLL_PLACEMENT_OVERSHOOT_RATIO,
    to: ENROLL_PLACEMENT_END_SCALE,
    start: nowMs,
    duration: ENROLL_PLACEMENT_GROW_MS,
  };
}

function updatePlacementAnimations(nowMs = getNowMs()) {
  const ids = Object.keys(state.placementFxTracks);
  for (const id of ids) {
    resolvePlacementScale(id, nowMs, true);
  }
}

function queuePlacementRevealAfterCamera(nodeId, options = {}) {
  const safeNodeId = safeText(nodeId);
  if (!safeNodeId) {
    state.pendingPlacementReveal = null;
    return false;
  }
  const nowMs = safeNumber(options.nowMs, getNowMs());
  const safeParentId = safeText(options.parentId);
  const safePlacementLeg = normalizeBinarySide(options.placementLeg) === 'right' ? 'right' : 'left';
  state.pendingPlacementReveal = {
    nodeId: safeNodeId,
    parentId: safeParentId,
    placementLeg: safePlacementLeg,
    queuedAtMs: nowMs,
    startAtMs: nowMs + ENROLL_PLACEMENT_CAMERA_SETTLE_DELAY_MS,
    maxWaitMs: ENROLL_PLACEMENT_CAMERA_WAIT_MAX_MS,
  };
  return true;
}

function resolvePendingPlacementRevealNodeId() {
  const pending = state.pendingPlacementReveal;
  if (!pending || typeof pending !== 'object') {
    return '';
  }
  return safeText(pending.nodeId);
}

function resolvePendingPlacementRevealReservation() {
  const pending = state.pendingPlacementReveal;
  if (!pending || typeof pending !== 'object') {
    return null;
  }
  const parentId = safeText(pending.parentId);
  const placementLeg = normalizeBinarySide(pending.placementLeg) === 'right' ? 'right' : 'left';
  if (!parentId) {
    return null;
  }
  return {
    parentId,
    placementLeg,
  };
}

function isNodeHiddenForPendingPlacement(nodeId) {
  const safeNodeId = safeText(nodeId);
  if (!safeNodeId) {
    return false;
  }
  return safeNodeId === resolvePendingPlacementRevealNodeId();
}

function consumePendingPlacementReveal(options = {}) {
  const pending = state.pendingPlacementReveal;
  if (!pending || typeof pending !== 'object') {
    return false;
  }
  const safeNodeId = safeText(pending.nodeId);
  if (!safeNodeId) {
    state.pendingPlacementReveal = null;
    return false;
  }
  const nowMs = safeNumber(options.nowMs, getNowMs());
  const cameraBusy = Boolean(state.camera.target) && safeText(state.camera.targetReason) === 'enroll-placement';
  const queuedAtMs = safeNumber(pending.queuedAtMs, nowMs);
  const startAtMs = safeNumber(pending.startAtMs, queuedAtMs);
  const maxWaitMs = Math.max(120, safeNumber(pending.maxWaitMs, ENROLL_PLACEMENT_CAMERA_WAIT_MAX_MS));
  const timedOut = (nowMs - queuedAtMs) >= maxWaitMs;
  if (cameraBusy && !timedOut) {
    return false;
  }
  if (nowMs < startAtMs && !timedOut) {
    return false;
  }
  state.pendingPlacementReveal = null;
  startPlacementGrowAnimation(safeNodeId, nowMs);
  return true;
}

function resolvePlacementConnectorProgress(track, nowMs = getNowMs()) {
  if (!track || typeof track !== 'object') {
    return 1;
  }
  const duration = Math.max(1, safeNumber(track.duration, ENROLL_PLACEMENT_GROW_MS));
  const startMs = safeNumber(track.start, nowMs);
  const t = clamp((nowMs - startMs) / duration, 0, 1);
  const drawPhase = clamp(
    t / Math.max(0.12, ENROLL_PLACEMENT_CONNECTOR_DRAW_RATIO),
    0,
    1,
  );
  return easeOutCubic(drawPhase);
}

function drawConnectorPathProgress(startX, startY, branchY, endX, endY, stroke, lineWidth, progress = 1) {
  const safeProgress = clamp(safeNumber(progress, 1), 0, 1);
  if (safeProgress <= 0) {
    return;
  }
  const segments = [
    { x1: startX, y1: startY, x2: startX, y2: branchY },
    { x1: startX, y1: branchY, x2: endX, y2: branchY },
    { x1: endX, y1: branchY, x2: endX, y2: endY },
  ];
  const lengths = segments.map((segment) => {
    const dx = segment.x2 - segment.x1;
    const dy = segment.y2 - segment.y1;
    return Math.sqrt((dx * dx) + (dy * dy));
  });
  const totalLength = lengths.reduce((sum, length) => sum + length, 0);
  if (!Number.isFinite(totalLength) || totalLength <= 0) {
    return;
  }

  let remaining = totalLength * safeProgress;
  context.beginPath();
  context.moveTo(startX, startY);
  for (let index = 0; index < segments.length; index += 1) {
    if (remaining <= 0) {
      break;
    }
    const segment = segments[index];
    const segmentLength = Math.max(0, safeNumber(lengths[index], 0));
    if (segmentLength <= 0.0001) {
      context.lineTo(segment.x2, segment.y2);
      continue;
    }
    if (remaining >= segmentLength) {
      context.lineTo(segment.x2, segment.y2);
      remaining -= segmentLength;
      continue;
    }
    const ratio = clamp(remaining / segmentLength, 0, 1);
    context.lineTo(
      segment.x1 + ((segment.x2 - segment.x1) * ratio),
      segment.y1 + ((segment.y2 - segment.y1) * ratio),
    );
    remaining = 0;
    break;
  }
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.strokeStyle = stroke;
  context.lineWidth = lineWidth;
  context.stroke();
}

function setSelectedNode(nextId, options = {}) {
  const {
    animate = false,
    toggleIfSame = false,
  } = options;
  const currentId = safeText(state.selectedId);
  const targetId = safeText(nextId);
  const nowMs = getNowMs();

  if (toggleIfSame && targetId && targetId === currentId) {
    if (!animate) {
      state.selectionFxTracks = Object.create(null);
      state.selectedId = '';
      return;
    }
    startSelectionAnimation(currentId, 0, 'deselect', nowMs);
    state.selectedId = '';
    return;
  }

  if (targetId === currentId) {
    return;
  }

  if (!animate) {
    state.selectionFxTracks = Object.create(null);
    state.selectedId = targetId;
    return;
  }

  if (currentId) {
    startSelectionAnimation(currentId, 0, 'deselect', nowMs);
  }
  if (targetId) {
    startSelectionAnimation(targetId, 1, 'select', nowMs, 0);
  }
  state.selectedId = targetId;
}

function safeText(value) {
  return String(value || '').trim();
}

function safeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeBinarySide(value) {
  const normalized = safeText(value).toLowerCase();
  if (normalized === 'left' || normalized === 'right') {
    return normalized;
  }
  return '';
}

function normalizeCredentialValue(value) {
  return safeText(value).toLowerCase();
}

function formatInteger(value, fallback = 0) {
  const safeValue = Math.max(0, Math.floor(safeNumber(value, fallback)));
  return safeValue.toLocaleString();
}

function formatVolumeValue(value, suffix = ' BV') {
  return `${formatInteger(value, 0)}${suffix}`;
}

function formatCompactVolumeValue(value) {
  const safeValue = Math.max(0, safeNumber(value, 0));
  if (safeValue >= 1000000) {
    const millions = safeValue / 1000000;
    const precision = millions >= 10 ? 0 : 1;
    return `${millions.toFixed(precision)}M BV`;
  }
  if (safeValue >= 1000) {
    const thousands = safeValue / 1000;
    const precision = thousands >= 100 ? 0 : 1;
    return `${thousands.toFixed(precision)}k BV`;
  }
  return `${Math.round(safeValue)} BV`;
}

function formatExactVolumeValue(value) {
  return `${Math.max(0, Math.round(safeNumber(value, 0))).toLocaleString()} BV`;
}

function measureTextWidth(text, options = {}) {
  const {
    size = 12,
    weight = 500,
    family = '"SF Pro Text", "SF Pro Display", "Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
  } = options;
  context.save();
  context.font = `${weight} ${size}px ${family}`;
  const width = context.measureText(safeText(text)).width;
  context.restore();
  return width;
}

function resolveAchievementIconKeyFromLabel(label) {
  const normalized = safeText(label).toLowerCase();
  if (!normalized || normalized === 'private') {
    return 'placeholder';
  }
  if (normalized.includes('legacy founder')) {
    return 'legacy-founder-star';
  }
  if (normalized.includes('legacy director')) {
    return 'legacy-director-star';
  }
  if (normalized.includes('legacy ambassador')) {
    return 'legacy-ambassador-star';
  }
  if (normalized.includes('presidential circle')) {
    return 'presidential-circle-star';
  }
  if (normalized.includes('black diamond')) {
    return 'black-diamond';
  }
  if (normalized.includes('blue diamond')) {
    return 'blue-diamond';
  }
  if (normalized.includes('diamond')) {
    return 'diamond';
  }
  if (normalized.includes('double crown')) {
    return 'double-crown';
  }
  if (normalized.includes('royal crown')) {
    return 'royal-crown';
  }
  if (normalized.includes('crown')) {
    return 'crown';
  }
  if (normalized.includes('emerald')) {
    return 'emerald';
  }
  if (normalized.includes('sapphire')) {
    return 'sapphire';
  }
  if (normalized.includes('ruby')) {
    return 'ruby';
  }
  if (normalized.includes('legacy')) {
    return 'legacy';
  }
  if (normalized.includes('infinity') || normalized.includes('achiever')) {
    return 'infinity';
  }
  if (normalized.includes('business')) {
    return 'business';
  }
  if (
    normalized.includes('personal')
    || normalized.includes('starter')
    || normalized.includes('builder')
  ) {
    return 'personal';
  }
  return 'placeholder';
}

const TITLE_ICON_BASE_NAME_BY_KEY = Object.freeze({
  'legacy-founder-star': 'legacy-founder-star',
  'legacy-director-star': 'legacy-director-star',
  'legacy-ambassador-star': 'legacy-ambassador-star',
  'presidential-circle-star': 'presidential-circle-star',
  'time-limited-event-legacy-founder': 'legacy-founder-star',
  'time-limited-event-legacy-director': 'legacy-director-star',
  'time-limited-event-legacy-ambassador': 'legacy-ambassador-star',
  'time-limited-event-presidential-circle': 'presidential-circle-star',
});

function resolveTitleIconBaseName(value) {
  const normalized = safeText(value).toLowerCase();
  if (!normalized) {
    return '';
  }
  if (Object.prototype.hasOwnProperty.call(TITLE_ICON_BASE_NAME_BY_KEY, normalized)) {
    return TITLE_ICON_BASE_NAME_BY_KEY[normalized];
  }
  if (
    normalized === 'legacy-founder'
    || normalized === 'legacy-director'
    || normalized === 'legacy-ambassador'
    || normalized === 'presidential-circle'
  ) {
    return `${normalized}-star`;
  }
  return '';
}

function resolveTitleIconPathFromValue(value, options = {}) {
  const {
    preserveExplicitSuffix = false,
  } = options;
  const safeValue = safeText(value);
  const withoutSvgSuffix = safeValue.replace(/\.svg$/i, '');
  const baseName = resolveTitleIconBaseName(withoutSvgSuffix);
  if (!baseName) {
    return '';
  }
  const fileName = preserveExplicitSuffix && /\.svg$/i.test(safeValue)
    ? safeValue
    : `${baseName}-light.svg`;
  return `/brand_assets/Icons/Title-Icons/${fileName}`;
}

function resolveNodeDetailsIconPath(rawValue, fallbackLabel = '') {
  const safeValue = safeText(rawValue);
  if (!safeValue) {
    const fallbackKey = resolveAchievementIconKeyFromLabel(fallbackLabel);
    const titleIconPath = resolveTitleIconPathFromValue(fallbackKey);
    if (titleIconPath) {
      return titleIconPath;
    }
    return `/brand_assets/Icons/Achievements/${fallbackKey}-light.svg`;
  }
  if (/^(https?:)?\/\//i.test(safeValue) || safeValue.startsWith('/')) {
    return safeValue;
  }
  if (safeValue.toLowerCase().endsWith('.svg')) {
    const titleIconPath = resolveTitleIconPathFromValue(safeValue, { preserveExplicitSuffix: true });
    if (titleIconPath) {
      return titleIconPath;
    }
    return `/brand_assets/Icons/Achievements/${safeValue}`;
  }
  const titleIconPath = resolveTitleIconPathFromValue(safeValue);
  if (titleIconPath) {
    return titleIconPath;
  }
  return `/brand_assets/Icons/Achievements/${safeValue}-light.svg`;
}

function resolveNodePrimaryTitleLabel(nodeInput = null, fallbackLabel = '') {
  const node = nodeInput && typeof nodeInput === 'object' ? nodeInput : null;
  const candidates = [
    node?.profileAccountTitle,
    node?.profile_account_title,
    node?.accountTitle,
    node?.account_title,
    node?.title,
    node?.profileTitle1,
    node?.profile_title1,
    node?.profile_title_1,
  ];
  for (const candidate of candidates) {
    const label = safeText(candidate);
    if (label) {
      return label;
    }
  }
  return safeText(fallbackLabel);
}

function resolveNodeSecondaryTitleLabel(nodeInput = null, fallbackLabel = '') {
  const node = nodeInput && typeof nodeInput === 'object' ? nodeInput : null;
  const candidates = [
    node?.profileAccountTitleSecondary,
    node?.profile_account_title_secondary,
    node?.accountTitleSecondary,
    node?.account_title_secondary,
    node?.profileTitle2,
    node?.profile_title2,
    node?.profile_title_2,
  ];
  for (const candidate of candidates) {
    const label = safeText(candidate);
    if (label) {
      return label;
    }
  }
  return safeText(fallbackLabel);
}

function resolveNodeRankIconPathValue(nodeInput = null) {
  const node = nodeInput && typeof nodeInput === 'object' ? nodeInput : null;
  return safeText(
    node?.profileBadgeRankIconPath
    || node?.profile_badge_rank_icon_path
    || node?.profileRankIconPath
    || node?.profile_rank_icon_path
    || node?.rankIconPath
    || node?.rank_icon_path
    || node?.accountRankIconPath
    || node?.account_rank_icon_path
    || '',
  );
}

function resolveNodeTitleIconPathValue(nodeInput = null) {
  const node = nodeInput && typeof nodeInput === 'object' ? nodeInput : null;
  return safeText(
    node?.profileBadgeTitleIconPath
    || node?.profile_badge_title_icon_path
    || node?.profileTitleIconPath
    || node?.profile_title_icon_path
    || node?.profileTitle1IconPath
    || node?.profile_title1_icon_path
    || node?.profile_title_1_icon_path
    || node?.titleIconPath
    || node?.title_icon_path
    || node?.accountTitleIconPath
    || node?.account_title_icon_path
    || node?.accountTitleSecondaryIconPath
    || node?.account_title_secondary_icon_path
    || '',
  );
}

function isTreeNextRankBuilderFallbackTitle(titleLabel, rankLabel) {
  const normalizedTitle = normalizeCredentialValue(titleLabel);
  const normalizedRank = normalizeCredentialValue(rankLabel);
  if (!normalizedTitle || !normalizedRank) {
    return false;
  }
  return normalizedTitle === `${normalizedRank} builder`;
}

function resolveForcedTitleIconPathFromLabels(labelsInput = []) {
  const labels = Array.isArray(labelsInput) ? labelsInput : [];
  for (const rawLabel of labels) {
    const label = safeText(rawLabel);
    if (!label) {
      continue;
    }
    const titleKey = resolveAchievementIconKeyFromLabel(label);
    if (!titleKey) {
      continue;
    }
    const titleIconPath = resolveTitleIconPathFromValue(titleKey);
    if (titleIconPath) {
      return titleIconPath;
    }
  }
  return '';
}

function resolveNodeDetailRankAndTitleIcons(node) {
  const rankLabel = safeText(node?.rank || node?.accountRank || node?.account_rank || '');
  const rankIconPath = resolveNodeDetailsIconPath(
    resolveNodeRankIconPathValue(node),
    rankLabel,
  );
  const rankIconKey = resolveAchievementIconKeyFromLabel(rankLabel);
  const badges = Array.isArray(node?.badges) ? node.badges : [];
  const primaryTitleLabel = resolveNodePrimaryTitleLabel(node);
  const secondaryTitleLabel = resolveNodeSecondaryTitleLabel(node);
  const titleCandidates = [
    primaryTitleLabel,
    secondaryTitleLabel,
    safeText(node?.title || ''),
    ...badges.map((badge) => safeText(badge)),
    rankLabel,
  ].filter(Boolean);
  const forcedTitleIconPath = resolveForcedTitleIconPathFromLabels([
    primaryTitleLabel,
    secondaryTitleLabel,
    safeText(node?.title || ''),
  ]);
  if (forcedTitleIconPath) {
    return [rankIconPath, forcedTitleIconPath].filter(Boolean);
  }
  let fallbackTitleKey = 'placeholder';
  for (const candidate of titleCandidates) {
    const key = resolveAchievementIconKeyFromLabel(candidate);
    if (key && key !== rankIconKey) {
      fallbackTitleKey = key;
      break;
    }
  }
  if (fallbackTitleKey === 'placeholder' && rankIconKey) {
    fallbackTitleKey = rankIconKey;
  }
  const titleIconPath = resolveNodeDetailsIconPath(
    resolveNodeTitleIconPathValue(node),
    fallbackTitleKey,
  );
  return [rankIconPath, titleIconPath].filter(Boolean);
}

function drawImageAssetRect(x, y, width, height, imageUrl) {
  const asset = resolveAvatarImageAsset(imageUrl);
  if (!asset || !asset.loaded || asset.error) {
    return false;
  }
  const sourceWidth = Math.max(1, Math.floor(safeNumber(asset.image.naturalWidth, asset.image.width)));
  const sourceHeight = Math.max(1, Math.floor(safeNumber(asset.image.naturalHeight, asset.image.height)));
  const drawX = Math.round(safeNumber(x, 0));
  const drawY = Math.round(safeNumber(y, 0));
  const drawWidth = Math.max(1, Math.round(safeNumber(width, 1)));
  const drawHeight = Math.max(1, Math.round(safeNumber(height, 1)));
  context.save();
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(
    asset.image,
    0,
    0,
    sourceWidth,
    sourceHeight,
    drawX,
    drawY,
    drawWidth,
    drawHeight,
  );
  context.restore();
  return true;
}

function resolveNodeCurrentPersonalBvForActivity(nodeInput = null) {
  const node = nodeInput && typeof nodeInput === 'object' ? nodeInput : null;
  if (!node) {
    return 0;
  }

  const cutoffTimestampMs = Date.parse(safeText(
    node?.activityActiveUntilAt
    ?? node?.activity_active_until_at
    ?? '',
  ));
  const hasExpiredCutoff = Number.isFinite(cutoffTimestampMs) && Date.now() >= cutoffTimestampMs;

  const explicitCurrentPersonalBv = safeNumber(
    node?.currentPersonalPvBv
    ?? node?.current_personal_pv_bv
    ?? node?.monthlyPersonalBv
    ?? node?.monthly_personal_bv,
    NaN,
  );
  if (Number.isFinite(explicitCurrentPersonalBv)) {
    return hasExpiredCutoff ? 0 : Math.max(0, Math.floor(explicitCurrentPersonalBv));
  }

  const starterPersonalPv = Math.max(0, Math.floor(safeNumber(
    node?.starterPersonalPv
    ?? node?.starter_personal_pv
    ?? node?.personalVolumeBv
    ?? node?.personal_volume_bv
    ?? node?.volume
    ?? node?.packageBv
    ?? node?.package_bv,
    0,
  )));
  const baselinePersonalPv = safeNumber(
    node?.serverCutoffBaselineStarterPersonalPv
    ?? node?.server_cutoff_baseline_starter_personal_pv
    ?? node?.personalVolumeBaselineBv
    ?? node?.personal_volume_baseline_bv,
    NaN,
  );
  if (Number.isFinite(baselinePersonalPv) && baselinePersonalPv > 0) {
    return hasExpiredCutoff
      ? 0
      : Math.max(0, starterPersonalPv - Math.max(0, Math.floor(baselinePersonalPv)));
  }
  return hasExpiredCutoff ? 0 : starterPersonalPv;
}

function resolveNodeActivityState(node) {
  const safeNode = node && typeof node === 'object' ? node : null;
  const rawStatus = safeText(safeNode?.accountStatus || safeNode?.status || '').toLowerCase();
  const nodeIdKey = normalizeCredentialValue(safeNode?.id);
  if (
    nodeIdKey === normalizeCredentialValue(LIVE_TREE_GLOBAL_ROOT_ID)
    || nodeIdKey === 'company-root'
  ) {
    return true;
  }
  if (
    rawStatus.includes('inactive')
    || rawStatus.includes('dormant')
    || rawStatus.includes('review')
    || rawStatus.includes('suspend')
    || rawStatus.includes('disable')
    || rawStatus.includes('expired')
  ) {
    return false;
  }

  const currentPersonalBv = resolveNodeCurrentPersonalBvForActivity(safeNode);
  return currentPersonalBv >= ACTIVE_MEMBER_MONTHLY_PERSONAL_BV_MIN;
}

function resolveSessionSponsorUsernameKey(sessionInput = state.session) {
  const session = sessionInput && typeof sessionInput === 'object' ? sessionInput : null;
  return normalizeCredentialValue(
    safeText(
      session?.memberUsername
      || session?.member_username
      || session?.username
      || session?.user_name
      || '',
    ).replace(/^@+/, ''),
  );
}

function isNodePersonallyEnrolledBySession(nodeInput = null) {
  const node = nodeInput && typeof nodeInput === 'object' ? nodeInput : null;
  if (!node) {
    return false;
  }

  const sessionSponsorUsernameKey = resolveSessionSponsorUsernameKey();
  const sponsorUsernameKey = normalizeCredentialValue(
    safeText(
      node?.sponsorUsername
      || node?.sponsor_username
      || '',
    ).replace(/^@+/, ''),
  );
  if (sessionSponsorUsernameKey && sponsorUsernameKey) {
    return sponsorUsernameKey === sessionSponsorUsernameKey;
  }
  return false;
}

function resolveNodeAvatarPhotoUrl(nodeInput = null) {
  const node = nodeInput && typeof nodeInput === 'object' ? nodeInput : null;
  if (!node) {
    return '';
  }
  const candidates = [
    node.avatarUrl,
    node.avatar_url,
    node.profilePhotoUrl,
    node.profile_photo_url,
    node.profileImageUrl,
    node.profile_image_url,
    node.profilePicture,
    node.profile_picture,
    node.profilePhoto,
    node.profile_photo,
    node.photoUrl,
    node.photo_url,
    node.imageUrl,
    node.image_url,
    node.picture,
  ];
  for (const candidate of candidates) {
    const value = safeText(candidate);
    if (value) {
      return value;
    }
  }
  return '';
}

function resolveNodeCycleCount(nodeInput = null, volumeMetricsInput = null) {
  const node = nodeInput && typeof nodeInput === 'object' ? nodeInput : null;
  const directCandidates = [
    node?.cycles,
    node?.cycleCount,
    node?.cycle_count,
    node?.computedCycles,
    node?.computed_cycles,
  ];
  for (const candidate of directCandidates) {
    const parsed = Number(candidate);
    if (Number.isFinite(parsed) && parsed >= 0) {
      return Math.floor(parsed);
    }
  }
  const metrics = volumeMetricsInput && typeof volumeMetricsInput === 'object'
    ? volumeMetricsInput
    : {};
  const leftLeg = Math.max(0, Math.floor(safeNumber(metrics.leftVolume, 0)));
  const rightLeg = Math.max(0, Math.floor(safeNumber(metrics.rightVolume, 0)));
  const weakerLeg = Math.min(leftLeg, rightLeg);
  const strongerLeg = Math.max(leftLeg, rightLeg);
  const cyclesFromWeakerLeg = Math.floor(weakerLeg / 500);
  const cyclesFromStrongerLeg = Math.floor(strongerLeg / 1000);
  return Math.max(0, Math.min(cyclesFromWeakerLeg, cyclesFromStrongerLeg));
}

function resolveDetailsRelationIconPath(buttonId, mode = 'light') {
  const safeButtonId = safeText(buttonId).toLowerCase();
  const safeMode = safeText(mode).toLowerCase();
  const isLightMode = safeMode !== 'dark';
  if (safeButtonId === 'parent') {
    return isLightMode
      ? '/brand_assets/Icons/UI/Parent-Button-Icon-FIlled-Blue.png'
      : '/brand_assets/Icons/UI/Parent-Button-Icon-FIlled-White.png';
  }
  if (safeButtonId === 'sponsor') {
    return isLightMode
      ? '/brand_assets/Icons/UI/Sponsor-Button-Icon-Filled-Blue.png'
      : '/brand_assets/Icons/UI/Sponsor-Button-Icon-Filled-White.png';
  }
  if (safeButtonId === 'perspective') {
    return isLightMode
      ? '/brand_assets/Icons/UI/Enter-User-Perspective-Outline-Blue.png'
      : '/brand_assets/Icons/UI/Enter-User-Perspective-Outline-White.png';
  }
  return '';
}

function isEditableTarget(target = document.activeElement) {
  if (!target) {
    return false;
  }
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
    return true;
  }
  return Boolean(target instanceof HTMLElement && target.isContentEditable);
}

function readPinnedNodeIdsFromStorage() {
  try {
    const raw = window.localStorage?.getItem(PINNED_NODE_IDS_STORAGE_KEY);
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistPinnedNodeIdsToStorage() {
  try {
    window.localStorage?.setItem(PINNED_NODE_IDS_STORAGE_KEY, JSON.stringify(state.pinnedNodeIds || []));
  } catch {
    // Ignore storage write failures.
  }
}

function normalizePinnedNodeIds(idsInput = state.pinnedNodeIds) {
  const incoming = Array.isArray(idsInput) ? idsInput : [];
  const deduped = [];
  const seen = new Set();
  for (const rawId of incoming) {
    const safeId = safeText(rawId);
    if (!safeId || seen.has(safeId)) {
      continue;
    }
    const exists = state.adapter.resolveNodeMetrics(safeId, getGlobalUniverseOptions());
    if (!exists) {
      continue;
    }
    seen.add(safeId);
    deduped.push(safeId);
  }
  return deduped;
}

function setPinnedNodeIds(nextIds, options = {}) {
  const persistLocal = options?.persistLocal !== false;
  const syncServer = options?.syncServer !== false;
  state.pinnedNodeIds = normalizePinnedNodeIds(nextIds);
  const favorites = getSideNavFavoritesState();
  favorites.placesCacheKey = '';
  favorites.placesCacheLimit = 0;
  favorites.placesCache = [];

  if (persistLocal) {
    persistPinnedNodeIdsToStorage();
  }

  if (syncServer) {
    if (canSyncPinnedNodeIdsToServer()) {
      pinnedNodeIdsLocalDirty = true;
    }
    schedulePinnedNodeIdsServerSync();
  }
}

function isNodePinned(nodeId) {
  const safeNodeId = safeText(nodeId);
  return Boolean(safeNodeId && Array.isArray(state.pinnedNodeIds) && state.pinnedNodeIds.includes(safeNodeId));
}

function togglePinnedNode(nodeId = state.selectedId) {
  const safeNodeId = safeText(nodeId);
  if (!safeNodeId) {
    return false;
  }
  const current = normalizePinnedNodeIds(state.pinnedNodeIds);
  const existingIndex = current.indexOf(safeNodeId);
  if (existingIndex >= 0) {
    current.splice(existingIndex, 1);
    setPinnedNodeIds(current);
    return false;
  }
  current.unshift(safeNodeId);
  setPinnedNodeIds(current.slice(0, 10));
  return true;
}

function removePinnedNode(nodeId) {
  const safeNodeId = safeText(nodeId);
  if (!safeNodeId) {
    return;
  }
  const current = normalizePinnedNodeIds(state.pinnedNodeIds).filter((id) => id !== safeNodeId);
  setPinnedNodeIds(current);
}

function resolveGlobalNodeMetrics(nodeId) {
  const safeNodeId = safeText(nodeId);
  if (!safeNodeId) {
    return null;
  }
  return state.adapter.resolveNodeMetrics(safeNodeId, getGlobalUniverseOptions());
}

function resolveNodeById(nodeId) {
  return resolveGlobalNodeMetrics(nodeId)?.node || null;
}

function resolveNodeIdByUsername(username) {
  const normalizedUsername = normalizeCredentialValue(username);
  if (!normalizedUsername) {
    return '';
  }

  for (const rawNode of state.nodes) {
    const node = rawNode && typeof rawNode === 'object' ? rawNode : null;
    if (!node) {
      continue;
    }
    const nodeUsername = normalizeCredentialValue(node.username);
    if (nodeUsername && nodeUsername === normalizedUsername) {
      const nodeId = safeText(node.id);
      if (nodeId) {
        return nodeId;
      }
    }
  }

  return '';
}

function resolveTreeNextEnrollmentSponsorNodeId(createdMember, parentId, isSpilloverPlacement) {
  const sponsorUsername = normalizeCredentialValue(
    createdMember?.sponsorUsername
    || createdMember?.sponsor_username
    || createdMember?.sponsor
    || '',
  );

  const usernameSponsorId = resolveNodeIdByUsername(sponsorUsername);
  if (usernameSponsorId && resolveNodeById(usernameSponsorId)) {
    return usernameSponsorId;
  }

  if (isSpilloverPlacement) {
    const homeSponsorId = safeText(resolvePreferredGlobalHomeNodeId());
    if (homeSponsorId && resolveNodeById(homeSponsorId)) {
      return homeSponsorId;
    }
  }

  return parentId;
}

function rebuildNodeChildLegIndex() {
  const nextIndex = new Map();
  const nodeById = new Map();

  for (const rawNode of state.nodes) {
    const node = rawNode && typeof rawNode === 'object' ? rawNode : null;
    if (!node) {
      continue;
    }
    const nodeId = safeText(node.id);
    if (nodeId) {
      nodeById.set(nodeId, node);
    }
    const parentId = safeText(node.parent || node.parentId);
    const side = normalizeBinarySide(node.side || node.placementSide || node.sponsorLeg);
    if (!parentId || !side) {
      continue;
    }
    let legs = nextIndex.get(parentId);
    if (!legs) {
      legs = { left: false, right: false };
      nextIndex.set(parentId, legs);
    }
    legs[side] = true;
  }

  for (const rawNode of state.nodes) {
    const node = rawNode && typeof rawNode === 'object' ? rawNode : null;
    if (!node) {
      continue;
    }
    const nodeId = safeText(node.id);
    if (!nodeId) {
      continue;
    }
    const leftChildId = safeText(node.leftChildId);
    const rightChildId = safeText(node.rightChildId);
    if (!leftChildId && !rightChildId) {
      continue;
    }
    let legs = nextIndex.get(nodeId);
    if (!legs) {
      legs = { left: false, right: false };
      nextIndex.set(nodeId, legs);
    }
    if (leftChildId && nodeById.has(leftChildId)) {
      legs.left = true;
    }
    if (rightChildId && nodeById.has(rightChildId)) {
      legs.right = true;
    }
  }

  state.nodeChildLegIndex = nextIndex;
}

function resolveNodeChildLegState(nodeId) {
  const safeNodeId = safeText(nodeId);
  if (!safeNodeId) {
    return { left: false, right: false };
  }
  const legs = state.nodeChildLegIndex instanceof Map
    ? state.nodeChildLegIndex.get(safeNodeId)
    : null;
  return {
    left: Boolean(legs?.left),
    right: Boolean(legs?.right),
  };
}

function requestEnrollMemberFromTree(parentId, side) {
  const safeParentId = safeText(parentId);
  const placementLeg = normalizeBinarySide(side) === 'right' ? 'right' : 'left';
  if (!safeParentId) {
    return;
  }

  const parentNode = resolveNodeById(safeParentId);
  if (!parentNode) {
    return;
  }

  const parentName = safeText(
    parentNode.name
    || parentNode.memberCode
    || parentNode.username
    || parentNode.id
    || safeParentId,
  ) || safeParentId;
  const parentMemberCode = safeText(
    parentNode.memberCode
    || parentNode.username
    || parentNode.id
    || safeParentId,
  );

  window.dispatchEvent(new CustomEvent('binary-tree-enroll-member-request', {
    detail: {
      parentId: safeParentId,
      parentName,
      parentMemberCode,
      placementLeg,
    },
  }));
}

function resolveEnrollRegisteredMembersApi() {
  return state.source === 'admin'
    ? ADMIN_REGISTERED_MEMBERS_API
    : MEMBER_REGISTERED_MEMBERS_API;
}

function resolveEnrollRegisteredMembersIntentApi() {
  return state.source === 'admin'
    ? ADMIN_REGISTERED_MEMBERS_INTENT_API
    : MEMBER_REGISTERED_MEMBERS_INTENT_API;
}

function resolveEnrollRegisteredMembersIntentCompleteApi() {
  return state.source === 'admin'
    ? ADMIN_REGISTERED_MEMBERS_INTENT_COMPLETE_API
    : MEMBER_REGISTERED_MEMBERS_INTENT_COMPLETE_API;
}

function resolveEnrollFastTrackTierFromPackage(packageKey) {
  const normalizedPackage = normalizeCredentialValue(packageKey);
  return ENROLL_FAST_TRACK_TIER_BY_PACKAGE[normalizedPackage] || 'personal-pack';
}

function resolveEnrollFastTrackTierLabel(tierKey) {
  const normalizedTier = normalizeCredentialValue(tierKey);
  return ENROLL_FAST_TRACK_TIER_LABEL_BY_KEY[normalizedTier] || ENROLL_FAST_TRACK_TIER_LABEL_BY_KEY['personal-pack'];
}

function isTreeNextEnrollPaidPackage(packageKey) {
  const normalizedPackage = normalizeCredentialValue(packageKey);
  return ENROLL_PAID_PACKAGE_KEY_SET.has(normalizedPackage);
}

function resolveTreeNextEnrollPackageKey(packageKey) {
  const normalizedPackage = normalizeCredentialValue(packageKey);
  if (isTreeNextEnrollPaidPackage(normalizedPackage)) {
    return normalizedPackage;
  }
  return ENROLL_DEFAULT_PACKAGE_KEY;
}

function resolveEnrollPackageMeta(packageKey) {
  const normalizedPackage = normalizeCredentialValue(packageKey);
  return ENROLL_PACKAGE_META[normalizedPackage] || ENROLL_PACKAGE_META[ENROLL_DEFAULT_PACKAGE_KEY];
}

function resolveEnrollPackagePrice(packageKey) {
  const packageMeta = resolveEnrollPackageMeta(packageKey);
  return Math.max(0, safeNumber(packageMeta?.price, packageMeta?.bv || 0));
}

function resolveEnrollPackageBv(packageKey) {
  const packageMeta = resolveEnrollPackageMeta(packageKey);
  return Math.max(0, safeNumber(packageMeta?.bv, packageMeta?.price || 0));
}

function resolveEnrollFastTrackBonusAmount(packageKey, tierKey) {
  const commissionableBv = resolveEnrollPackageBv(packageKey);
  const sponsorRate = safeNumber(ENROLL_FAST_TRACK_RATE_BY_TIER[normalizeCredentialValue(tierKey)], 0);
  if (commissionableBv <= 0 || sponsorRate <= 0) {
    return 0;
  }
  return Math.round((commissionableBv * sponsorRate) * 100) / 100;
}

function formatEnrollCurrency(value) {
  const normalizedAmount = Math.round(Math.max(0, safeNumber(value, 0)) * 100) / 100;
  return `$${normalizedAmount.toFixed(2)}`;
}

function resolveTreeNextEnrollStepCopy(step) {
  const normalizedStep = Math.max(1, Math.min(4, Math.floor(safeNumber(step, 1))));
  return ENROLL_STEP_COPY[normalizedStep] || ENROLL_STEP_COPY[1];
}

function isTreeNextEnrollModalOpen() {
  return Boolean(state.enroll?.open);
}

function setTreeNextEnrollFeedback(message, status = false, options = {}) {
  if (!(treeNextEnrollModalFeedback instanceof HTMLElement)) {
    return;
  }
  const safeMessage = safeText(message);
  let resolvedVariant = 'neutral';
  let showLoading = false;
  if (typeof status === 'boolean') {
    resolvedVariant = status ? 'success' : 'error';
  } else if (typeof status === 'string') {
    const variantKey = normalizeCredentialValue(status);
    if (variantKey === 'success' || variantKey === 'error' || variantKey === 'neutral') {
      resolvedVariant = variantKey;
    }
  } else if (status && typeof status === 'object') {
    const statusVariantKey = normalizeCredentialValue(status.variant || 'neutral');
    if (statusVariantKey === 'success' || statusVariantKey === 'error' || statusVariantKey === 'neutral') {
      resolvedVariant = statusVariantKey;
    }
    showLoading = status.loading === true;
  }
  if (options && typeof options === 'object') {
    const optionVariantKey = normalizeCredentialValue(options.variant || '');
    if (optionVariantKey === 'success' || optionVariantKey === 'error' || optionVariantKey === 'neutral') {
      resolvedVariant = optionVariantKey;
    }
    if (options.loading === true) {
      showLoading = true;
    } else if (options.loading === false) {
      showLoading = false;
    }
  }

  treeNextEnrollModalFeedback.textContent = safeMessage;
  treeNextEnrollModalFeedback.classList.remove('is-error', 'is-success', 'is-neutral', 'is-loading');
  if (!safeMessage) {
    return;
  }
  treeNextEnrollModalFeedback.classList.add(`is-${resolvedVariant}`);
  if (showLoading) {
    treeNextEnrollModalFeedback.classList.add('is-loading');
  }
}

function clearTreeNextEnrollFeedback() {
  setTreeNextEnrollFeedback('', false);
}

function normalizeTreeNextEnrollPasswordSetupLink(value) {
  const rawValue = safeText(value);
  if (!rawValue) {
    return '';
  }
  try {
    const parsedUrl = new URL(rawValue, window.location.origin);
    const protocol = safeText(parsedUrl.protocol).toLowerCase();
    if (protocol !== 'http:' && protocol !== 'https:') {
      return '';
    }
    return parsedUrl.toString();
  } catch {
    return '';
  }
}

function setTreeNextEnrollPasswordSetupFeedback(message = '', variant = '') {
  if (!(treeNextEnrollPasswordSetupFeedbackElement instanceof HTMLElement)) {
    return;
  }
  const safeMessage = safeText(message);
  treeNextEnrollPasswordSetupFeedbackElement.textContent = safeMessage;
  treeNextEnrollPasswordSetupFeedbackElement.classList.remove('is-error', 'is-success');
  if (variant === 'error') {
    treeNextEnrollPasswordSetupFeedbackElement.classList.add('is-error');
  } else if (variant === 'success') {
    treeNextEnrollPasswordSetupFeedbackElement.classList.add('is-success');
  }
}

function resolveTreeNextEnrollPasswordSetupLinkFromInput() {
  const inputValue = treeNextEnrollPasswordSetupLinkInput instanceof HTMLInputElement
    ? treeNextEnrollPasswordSetupLinkInput.value
    : '';
  return normalizeTreeNextEnrollPasswordSetupLink(inputValue);
}

function setTreeNextEnrollPasswordSetupLink(value = '') {
  const safeLink = normalizeTreeNextEnrollPasswordSetupLink(value);
  if (treeNextEnrollPasswordSetupLinkInput instanceof HTMLInputElement) {
    treeNextEnrollPasswordSetupLinkInput.value = safeLink;
  }
  if (treeNextEnrollPasswordSetupOpenButton instanceof HTMLButtonElement) {
    treeNextEnrollPasswordSetupOpenButton.disabled = !safeLink;
  }
  if (treeNextEnrollPasswordSetupCopyButton instanceof HTMLButtonElement) {
    treeNextEnrollPasswordSetupCopyButton.disabled = !safeLink;
  }
  if (safeLink) {
    setTreeNextEnrollPasswordSetupFeedback('Use this link to create the member password.');
  } else {
    setTreeNextEnrollPasswordSetupFeedback('Password setup link is unavailable for this enrollment.');
  }
}

function openTreeNextEnrollPasswordSetupLink() {
  const safeLink = resolveTreeNextEnrollPasswordSetupLinkFromInput();
  if (!safeLink) {
    setTreeNextEnrollPasswordSetupFeedback('No password setup link available yet.', 'error');
    return;
  }
  const openedWindow = window.open(safeLink, '_blank', 'noopener,noreferrer');
  if (!openedWindow) {
    setTreeNextEnrollPasswordSetupFeedback('Popup blocked. Use Copy Link instead.', 'error');
    return;
  }
  setTreeNextEnrollPasswordSetupFeedback('Password setup link opened in a new tab.', 'success');
}

async function copyTreeNextEnrollPasswordSetupLink() {
  const safeLink = resolveTreeNextEnrollPasswordSetupLinkFromInput();
  if (!safeLink) {
    setTreeNextEnrollPasswordSetupFeedback('No password setup link available yet.', 'error');
    return;
  }
  let copied = false;
  if (navigator.clipboard && window.isSecureContext) {
    copied = await navigator.clipboard.writeText(safeLink)
      .then(() => true)
      .catch(() => false);
  }
  if (!copied && treeNextEnrollPasswordSetupLinkInput instanceof HTMLInputElement) {
    treeNextEnrollPasswordSetupLinkInput.focus({ preventScroll: true });
    treeNextEnrollPasswordSetupLinkInput.select();
    treeNextEnrollPasswordSetupLinkInput.setSelectionRange(0, safeLink.length);
    copied = document.execCommand('copy');
  }
  setTreeNextEnrollPasswordSetupFeedback(
    copied ? 'Password setup link copied.' : 'Unable to copy link. Select the field and copy manually.',
    copied ? 'success' : 'error',
  );
}

function setTreeNextEnrollCardError(message = '') {
  if (!(treeNextEnrollCardErrorElement instanceof HTMLElement)) {
    return;
  }
  treeNextEnrollCardErrorElement.textContent = safeText(message);
}

function clearTreeNextEnrollCardError() {
  setTreeNextEnrollCardError('');
}

function clearTreeNextEnrollCardInput() {
  isTreeNextEnrollStripeCardComplete = false;
  isTreeNextEnrollStripeCardExpiryComplete = false;
  isTreeNextEnrollStripeCardCvcComplete = false;
  clearTreeNextEnrollCardError();
  if (
    treeNextEnrollStripeCardNumber
    && typeof treeNextEnrollStripeCardNumber.clear === 'function'
  ) {
    treeNextEnrollStripeCardNumber.clear();
  }
  if (
    treeNextEnrollStripeCardExpiry
    && typeof treeNextEnrollStripeCardExpiry.clear === 'function'
  ) {
    treeNextEnrollStripeCardExpiry.clear();
  }
  if (
    treeNextEnrollStripeCardCvc
    && typeof treeNextEnrollStripeCardCvc.clear === 'function'
  ) {
    treeNextEnrollStripeCardCvc.clear();
  }
}

function resolveTreeNextEnrollStripeBillingCountryCode(rawValue) {
  const normalizedValue = safeText(rawValue).trim();
  if (!normalizedValue) {
    return '';
  }
  const lowercaseValue = normalizedValue.toLowerCase();
  if (/^[a-z]{2}$/.test(lowercaseValue)) {
    return lowercaseValue.toUpperCase();
  }
  if (
    lowercaseValue === 'usa'
    || lowercaseValue === 'u.s.a.'
    || lowercaseValue === 'us'
    || lowercaseValue === 'u.s.'
    || lowercaseValue === 'united states'
    || lowercaseValue === 'united states of america'
  ) {
    return 'US';
  }
  return '';
}

function placeTreeNextEnrollCustomSelectMenu(entry) {
  const wrapper = entry?.wrapper;
  const menu = entry?.menu;
  if (!(wrapper instanceof HTMLElement) || !(menu instanceof HTMLElement)) {
    return;
  }
  const wrapperRect = wrapper.getBoundingClientRect();
  const viewportPadding = 12;
  const preferredMaxHeight = 260;
  const estimatedMenuHeight = Math.max(120, Math.min(preferredMaxHeight, safeNumber(menu.scrollHeight, preferredMaxHeight)));
  const spaceBelow = Math.max(0, (window.innerHeight || 0) - wrapperRect.bottom - viewportPadding);
  const spaceAbove = Math.max(0, wrapperRect.top - viewportPadding);
  const openUpward = spaceBelow < Math.min(160, estimatedMenuHeight) && spaceAbove > spaceBelow;
  const maxHeight = Math.max(
    120,
    Math.min(
      preferredMaxHeight,
      openUpward ? Math.max(120, spaceAbove - 8) : Math.max(120, spaceBelow - 8),
    ),
  );
  const left = Math.round(clamp(wrapperRect.left, viewportPadding, Math.max(viewportPadding, (window.innerWidth || 0) - wrapperRect.width - viewportPadding)));
  const width = Math.max(160, Math.round(wrapperRect.width));
  const top = openUpward
    ? Math.round(Math.max(viewportPadding, wrapperRect.top - maxHeight - 8))
    : Math.round(Math.min((window.innerHeight || 0) - maxHeight - viewportPadding, wrapperRect.bottom + 8));

  menu.style.left = `${left}px`;
  menu.style.top = `${top}px`;
  menu.style.width = `${width}px`;
  menu.style.maxHeight = `${Math.round(maxHeight)}px`;
}

function attachTreeNextEnrollCustomSelectMenuToFloatingRoot(entry) {
  const menu = entry?.menu;
  if (!(menu instanceof HTMLElement)) {
    return;
  }
  if (menu.parentElement !== document.body) {
    document.body.appendChild(menu);
  }
  menu.classList.add('is-floating');
  placeTreeNextEnrollCustomSelectMenu(entry);
}

function attachTreeNextEnrollCustomSelectMenuToWrapper(entry) {
  const wrapper = entry?.wrapper;
  const menu = entry?.menu;
  if (!(wrapper instanceof HTMLElement) || !(menu instanceof HTMLElement)) {
    return;
  }
  if (menu.parentElement !== wrapper) {
    wrapper.appendChild(menu);
  }
  menu.classList.remove('is-floating');
  menu.style.left = '';
  menu.style.top = '';
  menu.style.width = '';
  menu.style.maxHeight = '';
}

function closeTreeNextEnrollCustomSelect(entry, options = {}) {
  const {
    restoreFocus = false,
  } = options;
  const wrapper = entry?.wrapper;
  const trigger = entry?.trigger;
  const menu = entry?.menu;
  if (!(wrapper instanceof HTMLElement)) {
    return;
  }
  if (typeof entry?.detachFloatingHandlers === 'function') {
    entry.detachFloatingHandlers();
    entry.detachFloatingHandlers = null;
  }
  wrapper.classList.remove('is-open');
  if (menu instanceof HTMLElement) {
    menu.classList.remove('is-open');
    attachTreeNextEnrollCustomSelectMenuToWrapper(entry);
  }
  if (trigger instanceof HTMLButtonElement) {
    trigger.setAttribute('aria-expanded', 'false');
    if (restoreFocus) {
      trigger.focus({ preventScroll: true });
    }
  }
}

function closeAllTreeNextEnrollCustomSelects(exceptEntry = null) {
  for (const entry of treeNextEnrollCustomSelectByNativeId.values()) {
    if (!entry || entry === exceptEntry) {
      continue;
    }
    closeTreeNextEnrollCustomSelect(entry);
  }
}

function syncTreeNextEnrollCustomSelectDisplay(entry) {
  const nativeSelect = entry?.nativeSelect;
  const valueElement = entry?.valueElement;
  const optionButtons = Array.isArray(entry?.optionButtons) ? entry.optionButtons : [];
  if (!(nativeSelect instanceof HTMLSelectElement)) {
    return;
  }

  const selectedOption = nativeSelect.selectedOptions?.[0]
    || nativeSelect.options?.[nativeSelect.selectedIndex]
    || nativeSelect.options?.[0]
    || null;
  const selectedValue = safeText(nativeSelect.value);
  const label = safeText(selectedOption?.textContent || selectedOption?.label || '');

  if (valueElement instanceof HTMLElement) {
    valueElement.textContent = label || safeText(valueElement.textContent);
    valueElement.classList.toggle('is-placeholder', !selectedValue);
  }

  for (const optionButton of optionButtons) {
    if (!(optionButton instanceof HTMLButtonElement)) {
      continue;
    }
    const optionValue = safeText(optionButton.dataset.selectValue);
    const isSelected = optionValue && optionValue === selectedValue;
    optionButton.classList.toggle('is-selected', isSelected);
    optionButton.setAttribute('aria-selected', isSelected ? 'true' : 'false');
  }
}

function syncTreeNextEnrollCustomSelectById(selectId) {
  const safeSelectId = safeText(selectId);
  if (!safeSelectId) {
    return;
  }
  const entry = treeNextEnrollCustomSelectByNativeId.get(safeSelectId);
  if (!entry) {
    return;
  }
  syncTreeNextEnrollCustomSelectDisplay(entry);
}

function syncTreeNextEnrollCustomSelectsFromNative() {
  for (const entry of treeNextEnrollCustomSelectByNativeId.values()) {
    syncTreeNextEnrollCustomSelectDisplay(entry);
  }
}

function buildTreeNextEnrollCustomSelectMenu(entry) {
  const nativeSelect = entry?.nativeSelect;
  const menu = entry?.menu;
  if (!(nativeSelect instanceof HTMLSelectElement) || !(menu instanceof HTMLElement)) {
    return;
  }

  menu.innerHTML = '';
  entry.optionButtons = [];
  for (const option of Array.from(nativeSelect.options || [])) {
    const optionValue = safeText(option?.value);
    const optionLabel = safeText(option?.label || option?.textContent || optionValue);
    const optionButton = document.createElement('button');
    optionButton.type = 'button';
    optionButton.className = 'tree-next-enroll-custom-select-option';
    optionButton.dataset.selectValue = optionValue;
    optionButton.setAttribute('role', 'option');
    optionButton.setAttribute('aria-selected', 'false');
    optionButton.textContent = optionLabel || optionValue;
    if (option.disabled) {
      optionButton.disabled = true;
      optionButton.setAttribute('aria-disabled', 'true');
    }
    optionButton.addEventListener('click', () => {
      if (optionButton.disabled) {
        return;
      }
      if (nativeSelect.value !== optionValue) {
        nativeSelect.value = optionValue;
        nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
      syncTreeNextEnrollCustomSelectDisplay(entry);
      closeTreeNextEnrollCustomSelect(entry, { restoreFocus: true });
    });
    menu.appendChild(optionButton);
    entry.optionButtons.push(optionButton);
  }
  syncTreeNextEnrollCustomSelectDisplay(entry);
}

function openTreeNextEnrollCustomSelect(entry) {
  const wrapper = entry?.wrapper;
  const trigger = entry?.trigger;
  const menu = entry?.menu;
  if (!(wrapper instanceof HTMLElement)) {
    return;
  }
  closeAllTreeNextEnrollCustomSelects(entry);
  attachTreeNextEnrollCustomSelectMenuToFloatingRoot(entry);
  const syncFloatingMenu = () => {
    placeTreeNextEnrollCustomSelectMenu(entry);
  };
  const detachFloatingHandlers = () => {
    window.removeEventListener('resize', syncFloatingMenu);
    window.removeEventListener('scroll', syncFloatingMenu, true);
  };
  entry.detachFloatingHandlers = detachFloatingHandlers;
  window.addEventListener('resize', syncFloatingMenu, { passive: true });
  window.addEventListener('scroll', syncFloatingMenu, true);
  wrapper.classList.add('is-open');
  if (menu instanceof HTMLElement) {
    menu.classList.add('is-open');
  }
  if (trigger instanceof HTMLButtonElement) {
    trigger.setAttribute('aria-expanded', 'true');
  }
}

function registerTreeNextEnrollCustomSelect(wrapper) {
  if (!(wrapper instanceof HTMLElement)) {
    return null;
  }

  const nativeSelect = wrapper.querySelector('select.tree-next-enroll-native-select');
  const trigger = wrapper.querySelector('[data-enroll-custom-select-trigger]');
  const valueElement = wrapper.querySelector('[data-enroll-custom-select-value]');
  const menu = wrapper.querySelector('[data-enroll-custom-select-menu]');
  if (
    !(nativeSelect instanceof HTMLSelectElement)
    || !(trigger instanceof HTMLButtonElement)
    || !(menu instanceof HTMLElement)
  ) {
    return null;
  }

  const entry = {
    wrapper,
    nativeSelect,
    trigger,
    valueElement,
    menu,
    optionButtons: [],
    detachFloatingHandlers: null,
  };
  treeNextEnrollCustomSelectByNativeId.set(nativeSelect.id, entry);
  buildTreeNextEnrollCustomSelectMenu(entry);
  trigger.addEventListener('click', () => {
    const isOpen = wrapper.classList.contains('is-open');
    if (isOpen) {
      closeTreeNextEnrollCustomSelect(entry, { restoreFocus: true });
      return;
    }
    openTreeNextEnrollCustomSelect(entry);
  });
  trigger.addEventListener('keydown', (event) => {
    const key = safeText(event?.key).toLowerCase();
    if (key === ' ' || key === 'spacebar' || key === 'enter' || key === 'arrowdown') {
      event.preventDefault();
      openTreeNextEnrollCustomSelect(entry);
      const firstEnabledOption = entry.optionButtons.find((button) => button instanceof HTMLButtonElement && !button.disabled);
      if (firstEnabledOption) {
        firstEnabledOption.focus({ preventScroll: true });
      }
      return;
    }
    if (key === 'escape') {
      event.preventDefault();
      closeTreeNextEnrollCustomSelect(entry, { restoreFocus: true });
    }
  });
  nativeSelect.addEventListener('change', () => {
    syncTreeNextEnrollCustomSelectDisplay(entry);
  });
  menu.addEventListener('keydown', (event) => {
    const key = safeText(event?.key).toLowerCase();
    if (key === 'escape') {
      event.preventDefault();
      closeTreeNextEnrollCustomSelect(entry, { restoreFocus: true });
    }
  });
  return entry;
}

function initTreeNextEnrollCustomSelects() {
  treeNextEnrollCustomSelectByNativeId.clear();
  for (const wrapper of treeNextEnrollCustomSelectWrapElements) {
    registerTreeNextEnrollCustomSelect(wrapper);
  }

  document.addEventListener('pointerdown', (event) => {
    const eventTarget = event?.target;
    if (!(eventTarget instanceof Node)) {
      closeAllTreeNextEnrollCustomSelects();
      return;
    }
    for (const entry of treeNextEnrollCustomSelectByNativeId.values()) {
      if (
        (entry?.wrapper instanceof HTMLElement && entry.wrapper.contains(eventTarget))
        || (entry?.menu instanceof HTMLElement && entry.menu.contains(eventTarget))
      ) {
        return;
      }
    }
    closeAllTreeNextEnrollCustomSelects();
  });

  document.addEventListener('keydown', (event) => {
    const key = safeText(event?.key).toLowerCase();
    if (key === 'escape') {
      closeAllTreeNextEnrollCustomSelects();
    }
  });
}

function applyTreeNextEnrollBillingCountryOptions(countryOptions = [], options = {}) {
  if (!(treeNextEnrollBillingCountrySelect instanceof HTMLSelectElement)) {
    return;
  }
  const {
    preserveSelection = true,
  } = options;
  const previousValue = safeText(treeNextEnrollBillingCountrySelect.value).trim().toUpperCase();
  const desiredValue = preserveSelection && previousValue
    ? previousValue
    : ENROLL_DEFAULT_BILLING_COUNTRY_CODE;
  const seenCodes = new Set();
  const normalizedOptions = [];
  for (const entry of Array.isArray(countryOptions) ? countryOptions : []) {
    const code = safeText(entry?.code || '').trim().toUpperCase();
    const label = safeText(entry?.label || '').trim();
    if (!/^[A-Z]{2}$/.test(code) || !label || seenCodes.has(code)) {
      continue;
    }
    seenCodes.add(code);
    normalizedOptions.push({
      code,
      label,
    });
  }
  if (!seenCodes.has(ENROLL_DEFAULT_BILLING_COUNTRY_CODE)) {
    normalizedOptions.unshift({
      code: ENROLL_DEFAULT_BILLING_COUNTRY_CODE,
      label: 'United States',
    });
  }

  treeNextEnrollBillingCountrySelect.innerHTML = '';
  for (const optionData of normalizedOptions) {
    const optionElement = document.createElement('option');
    optionElement.value = optionData.code;
    optionElement.textContent = optionData.label;
    treeNextEnrollBillingCountrySelect.appendChild(optionElement);
  }
  if (!treeNextEnrollBillingCountrySelect.value) {
    treeNextEnrollBillingCountrySelect.value = ENROLL_DEFAULT_BILLING_COUNTRY_CODE;
  }
  const hasDesiredValue = Array.from(treeNextEnrollBillingCountrySelect.options).some(
    (option) => safeText(option?.value).trim().toUpperCase() === desiredValue,
  );
  treeNextEnrollBillingCountrySelect.value = hasDesiredValue
    ? desiredValue
    : ENROLL_DEFAULT_BILLING_COUNTRY_CODE;
  if (!treeNextEnrollBillingCountrySelect.value && treeNextEnrollBillingCountrySelect.options.length > 0) {
    treeNextEnrollBillingCountrySelect.value = safeText(treeNextEnrollBillingCountrySelect.options[0]?.value);
  }

  const entry = treeNextEnrollCustomSelectByNativeId.get(treeNextEnrollBillingCountrySelect.id);
  if (entry) {
    buildTreeNextEnrollCustomSelectMenu(entry);
  }
  syncTreeNextEnrollCustomSelectById(treeNextEnrollBillingCountrySelect.id);
}

async function hydrateTreeNextEnrollBillingCountryOptions() {
  if (!(treeNextEnrollBillingCountrySelect instanceof HTMLSelectElement)) {
    return;
  }
  if (treeNextEnrollBillingCountrySelect.dataset.countriesHydrated === 'true') {
    syncTreeNextEnrollCustomSelectById(treeNextEnrollBillingCountrySelect.id);
    return;
  }
  if (treeNextEnrollBillingCountryHydrationPromise) {
    await treeNextEnrollBillingCountryHydrationPromise;
    return;
  }

  treeNextEnrollBillingCountryHydrationPromise = (async () => {
    try {
      const response = await fetch(ENROLL_BILLING_COUNTRY_CATALOG_URL, {
        method: 'GET',
        cache: 'no-store',
        credentials: 'same-origin',
      });
      const payload = await response.json().catch(() => []);
      if (!response.ok || !Array.isArray(payload)) {
        throw new Error(`Billing country catalog unavailable (${response.status}).`);
      }
      const options = payload
        .map((entry) => {
          const code = safeText(entry?.code || '').trim().toUpperCase();
          const label = safeText(entry?.name || '').trim();
          const isoSupported = entry?.iso !== false;
          return {
            code,
            label,
            isoSupported,
          };
        })
        .filter((entry) => /^[A-Z]{2}$/.test(entry.code) && entry.label && entry.isoSupported)
        .sort((left, right) => left.label.localeCompare(right.label, 'en', { sensitivity: 'base' }));
      if (!options.length) {
        throw new Error('Billing country catalog is empty.');
      }
      const preferredOptionIndex = options.findIndex((entry) => entry.code === ENROLL_DEFAULT_BILLING_COUNTRY_CODE);
      if (preferredOptionIndex > 0) {
        const [preferredOption] = options.splice(preferredOptionIndex, 1);
        options.unshift(preferredOption);
      }
      applyTreeNextEnrollBillingCountryOptions(options, { preserveSelection: true });
      treeNextEnrollBillingCountrySelect.dataset.countriesHydrated = 'true';
    } catch (error) {
      console.warn('Unable to hydrate enrollment billing countries:', error);
      applyTreeNextEnrollBillingCountryOptions(ENROLL_BILLING_COUNTRY_FALLBACK_OPTIONS, { preserveSelection: true });
    }
  })();

  try {
    await treeNextEnrollBillingCountryHydrationPromise;
  } finally {
    treeNextEnrollBillingCountryHydrationPromise = null;
  }
}

async function fetchTreeNextEnrollStripeCheckoutConfig() {
  try {
    const response = await fetch(ENROLL_STRIPE_CHECKOUT_CONFIG_API, {
      method: 'GET',
      cache: 'no-store',
      credentials: 'same-origin',
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = typeof payload?.error === 'string' && payload.error.trim()
        ? payload.error.trim()
        : `Unable to load Stripe checkout config (${response.status}).`;
      throw new Error(message);
    }
    const publishableKey = safeText(payload?.publishableKey);
    if (!publishableKey) {
      throw new Error('Stripe publishable key was not returned.');
    }
    return {
      ok: true,
      publishableKey,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Unable to initialize Stripe checkout.',
    };
  }
}

async function ensureTreeNextEnrollStripeScriptLoaded() {
  if (typeof window.Stripe === 'function') {
    return true;
  }

  const existingScript = document.querySelector(`script[src="${ENROLL_STRIPE_SCRIPT_URL}"]`);
  if (existingScript instanceof HTMLScriptElement) {
    await new Promise((resolve) => {
      if (typeof window.Stripe === 'function') {
        resolve(true);
        return;
      }
      const handleResolve = () => resolve(true);
      const handleReject = () => resolve(false);
      existingScript.addEventListener('load', handleResolve, { once: true });
      existingScript.addEventListener('error', handleReject, { once: true });
      window.setTimeout(() => resolve(typeof window.Stripe === 'function'), 1800);
    });
    return typeof window.Stripe === 'function';
  }

  const script = document.createElement('script');
  script.src = ENROLL_STRIPE_SCRIPT_URL;
  script.async = true;
  const loaded = await new Promise((resolve) => {
    script.addEventListener('load', () => resolve(true), { once: true });
    script.addEventListener('error', () => resolve(false), { once: true });
    window.setTimeout(() => resolve(false), 3000);
    document.head.appendChild(script);
  });
  return loaded && typeof window.Stripe === 'function';
}

function resolveTreeNextEnrollStripeCardStyle() {
  return {
    base: {
      color: '#000000',
      iconColor: '#888888',
      fontFamily: '"Inter", "SF Pro Text", "SF Pro Display", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
      fontSize: '13px',
      lineHeight: '1.3',
      fontSmoothing: 'antialiased',
      '::placeholder': {
        color: '#888888',
      },
    },
    invalid: {
      color: '#C04157',
      iconColor: '#C04157',
    },
  };
}

async function initializeTreeNextEnrollStripeCard(options = {}) {
  if (
    isTreeNextEnrollStripeReady
    && treeNextEnrollStripeCardNumber
    && treeNextEnrollStripeCardExpiry
    && treeNextEnrollStripeCardCvc
  ) {
    return true;
  }
  if (
    !(treeNextEnrollCardNumberElement instanceof HTMLElement)
    || !(treeNextEnrollCardExpiryElement instanceof HTMLElement)
    || !(treeNextEnrollCardCvcElement instanceof HTMLElement)
  ) {
    setTreeNextEnrollCardError('Card payment fields are unavailable.');
    return false;
  }
  if (treeNextEnrollStripeInitPromise) {
    return treeNextEnrollStripeInitPromise;
  }

  treeNextEnrollStripeInitPromise = (async () => {
    const stripeLoaded = await ensureTreeNextEnrollStripeScriptLoaded();
    if (!stripeLoaded || typeof window.Stripe !== 'function') {
      setTreeNextEnrollCardError('Stripe checkout could not be loaded. Please refresh and try again.');
      return false;
    }

    const configResult = await fetchTreeNextEnrollStripeCheckoutConfig();
    if (!configResult.ok) {
      setTreeNextEnrollCardError(configResult.message || 'Unable to initialize Stripe checkout.');
      return false;
    }

    try {
      treeNextEnrollStripeClient = window.Stripe(configResult.publishableKey);
      if (!treeNextEnrollStripeClient) {
        throw new Error('Stripe client could not be initialized.');
      }

      treeNextEnrollStripeElements = treeNextEnrollStripeClient.elements();
      treeNextEnrollStripeCardNumber = treeNextEnrollStripeElements.create('cardNumber', {
        style: resolveTreeNextEnrollStripeCardStyle(),
        placeholder: 'Card number',
        showIcon: true,
        iconStyle: 'solid',
        disableLink: false,
      });
      treeNextEnrollStripeCardExpiry = treeNextEnrollStripeElements.create('cardExpiry', {
        style: resolveTreeNextEnrollStripeCardStyle(),
        placeholder: 'MM / YY',
      });
      treeNextEnrollStripeCardCvc = treeNextEnrollStripeElements.create('cardCvc', {
        style: resolveTreeNextEnrollStripeCardStyle(),
        placeholder: 'CVC',
      });
      treeNextEnrollStripeCardNumber.mount(treeNextEnrollCardNumberElement);
      treeNextEnrollStripeCardExpiry.mount(treeNextEnrollCardExpiryElement);
      treeNextEnrollStripeCardCvc.mount(treeNextEnrollCardCvcElement);
      treeNextEnrollStripeCardNumber.on('change', (event) => {
        isTreeNextEnrollStripeCardComplete = event?.complete === true;
        setTreeNextEnrollCardError(event?.error?.message || '');
      });
      treeNextEnrollStripeCardExpiry.on('change', (event) => {
        isTreeNextEnrollStripeCardExpiryComplete = event?.complete === true;
        setTreeNextEnrollCardError(event?.error?.message || '');
      });
      treeNextEnrollStripeCardCvc.on('change', (event) => {
        isTreeNextEnrollStripeCardCvcComplete = event?.complete === true;
        setTreeNextEnrollCardError(event?.error?.message || '');
      });

      isTreeNextEnrollStripeReady = true;
      isTreeNextEnrollStripeCardComplete = false;
      isTreeNextEnrollStripeCardExpiryComplete = false;
      isTreeNextEnrollStripeCardCvcComplete = false;
      if (options.silent !== true) {
        clearTreeNextEnrollCardError();
      }
      return true;
    } catch (error) {
      setTreeNextEnrollCardError(error instanceof Error ? error.message : 'Unable to initialize Stripe card fields.');
      return false;
    }
  })();

  try {
    return await treeNextEnrollStripeInitPromise;
  } finally {
    treeNextEnrollStripeInitPromise = null;
  }
}

function syncTreeNextEnrollTierFromPackage() {
  const selectedPackage = resolveTreeNextEnrollPackageKey(
    treeNextEnrollPackageInput?.value || ENROLL_DEFAULT_PACKAGE_KEY,
  );
  if (
    treeNextEnrollPackageInput instanceof HTMLSelectElement
    && normalizeCredentialValue(treeNextEnrollPackageInput.value) !== selectedPackage
  ) {
    treeNextEnrollPackageInput.value = selectedPackage;
  }
  const tierKey = resolveEnrollFastTrackTierFromPackage(selectedPackage);
  if (treeNextEnrollFastTrackTierInput instanceof HTMLInputElement) {
    treeNextEnrollFastTrackTierInput.value = tierKey;
  }
  syncTreeNextEnrollCustomSelectById('tree-next-enroll-package');
}

function syncTreeNextEnrollPackagePreview() {
  const selectedPackage = resolveTreeNextEnrollPackageKey(
    treeNextEnrollPackageInput?.value || ENROLL_DEFAULT_PACKAGE_KEY,
  );
  if (
    treeNextEnrollPackageInput instanceof HTMLSelectElement
    && normalizeCredentialValue(treeNextEnrollPackageInput.value) !== selectedPackage
  ) {
    treeNextEnrollPackageInput.value = selectedPackage;
  }
  const packageMeta = resolveEnrollPackageMeta(selectedPackage);
  const tierFromForm = normalizeCredentialValue(treeNextEnrollFastTrackTierInput?.value || '');
  const tierKey = tierFromForm || resolveEnrollFastTrackTierFromPackage(selectedPackage);
  const packageBv = Math.max(0, Math.floor(safeNumber(packageMeta?.bv, 0)));
  const selectableProducts = Math.max(0, Math.floor(safeNumber(packageMeta?.selectableProducts, 0)));
  const fastTrackBonusAmount = Math.max(0, safeNumber(resolveEnrollFastTrackBonusAmount(selectedPackage, tierKey), 0));
  const packagePrice = resolveEnrollPackagePrice(selectedPackage);
  const subtotalAmount = Math.max(0, safeNumber(packagePrice, 0));
  const discountAmount = 0;
  const taxableAmount = Math.max(0, subtotalAmount - discountAmount);
  const taxAmount = Math.round((taxableAmount * ENROLL_CHECKOUT_TAX_RATE) * 100) / 100;
  const totalAmount = Math.round((taxableAmount + taxAmount) * 100) / 100;

  if (treeNextEnrollPackageBvElement instanceof HTMLElement) {
    treeNextEnrollPackageBvElement.textContent = `${formatInteger(packageBv)} BV`;
  }
  if (treeNextEnrollPackageProductsElement instanceof HTMLElement) {
    treeNextEnrollPackageProductsElement.textContent = `${formatInteger(selectableProducts)} Selectable Product${selectableProducts === 1 ? '' : 's'}`;
  }
  if (treeNextEnrollPackageFastTrackBonusElement instanceof HTMLElement) {
    treeNextEnrollPackageFastTrackBonusElement.textContent = formatEnrollCurrency(fastTrackBonusAmount);
  }
  if (treeNextEnrollSummaryPackageLabelElement instanceof HTMLElement) {
    treeNextEnrollSummaryPackageLabelElement.textContent = packageMeta?.label || 'Package';
  }
  if (treeNextEnrollSummarySubtotalElement instanceof HTMLElement) {
    treeNextEnrollSummarySubtotalElement.textContent = formatEnrollCurrency(subtotalAmount);
  }
  if (treeNextEnrollSummaryDiscountElement instanceof HTMLElement) {
    treeNextEnrollSummaryDiscountElement.textContent = formatEnrollCurrency(discountAmount);
  }
  if (treeNextEnrollSummaryTaxElement instanceof HTMLElement) {
    treeNextEnrollSummaryTaxElement.textContent = formatEnrollCurrency(taxAmount);
  }
  if (treeNextEnrollSummaryTotalElement instanceof HTMLElement) {
    treeNextEnrollSummaryTotalElement.textContent = formatEnrollCurrency(totalAmount);
  }
  syncTreeNextEnrollCustomSelectById('tree-next-enroll-package');
}

function resolveTreeNextEnrollPlacementSideFromLock(placementLock = state.enroll?.placementLock) {
  return normalizeBinarySide(placementLock?.placementLeg) === 'right' ? 'right' : 'left';
}

function isTreeNextEnrollAdminPlacementMode() {
  return state.source === 'admin';
}

function resolveTreeNextEnrollMemberAutoSpilloverMode() {
  return canTreeNextEnrollUseSpilloverForRootUser()
    ? ENROLL_SPILLOVER_MODE_SPILLOVER
    : ENROLL_SPILLOVER_MODE_DIRECT;
}

function resolveTreeNextEnrollSpilloverModeValue() {
  if (!isTreeNextEnrollAdminPlacementMode()) {
    return resolveTreeNextEnrollMemberAutoSpilloverMode();
  }
  const normalizedMode = normalizeCredentialValue(
    treeNextEnrollSpilloverModeInput?.value || ENROLL_SPILLOVER_MODE_SPILLOVER,
  );
  return normalizedMode === ENROLL_SPILLOVER_MODE_DIRECT
    ? ENROLL_SPILLOVER_MODE_DIRECT
    : ENROLL_SPILLOVER_MODE_SPILLOVER;
}

function canTreeNextEnrollUseSpilloverForRootUser() {
  const rootLegState = resolveNodeChildLegState('root');
  return Boolean(rootLegState.left && rootLegState.right);
}

function syncTreeNextEnrollSpilloverAvailability() {
  const isAdminPlacementMode = isTreeNextEnrollAdminPlacementMode();
  if (treeNextEnrollSpilloverModeFieldGroup instanceof HTMLElement) {
    treeNextEnrollSpilloverModeFieldGroup.hidden = !isAdminPlacementMode;
    treeNextEnrollSpilloverModeFieldGroup.setAttribute('aria-hidden', isAdminPlacementMode ? 'false' : 'true');
  }

  if (!(treeNextEnrollSpilloverModeInput instanceof HTMLSelectElement)) {
    return resolveTreeNextEnrollSpilloverModeValue() === ENROLL_SPILLOVER_MODE_SPILLOVER;
  }

  if (!isAdminPlacementMode) {
    const memberAutoSpilloverMode = resolveTreeNextEnrollMemberAutoSpilloverMode();
    if (treeNextEnrollSpilloverModeInput.value !== memberAutoSpilloverMode) {
      treeNextEnrollSpilloverModeInput.value = memberAutoSpilloverMode;
    }

    const memberSpilloverSelectEntry = treeNextEnrollCustomSelectByNativeId.get('tree-next-enroll-spillover-mode');
    if (memberSpilloverSelectEntry) {
      buildTreeNextEnrollCustomSelectMenu(memberSpilloverSelectEntry);
      closeTreeNextEnrollCustomSelect(memberSpilloverSelectEntry);
    } else {
      syncTreeNextEnrollCustomSelectById('tree-next-enroll-spillover-mode');
    }
    return memberAutoSpilloverMode === ENROLL_SPILLOVER_MODE_SPILLOVER;
  }

  let hasSpilloverOption = false;
  let hasDirectOption = false;
  for (const option of Array.from(treeNextEnrollSpilloverModeInput.options || [])) {
    const optionMode = normalizeCredentialValue(option?.value);
    if (optionMode === ENROLL_SPILLOVER_MODE_SPILLOVER) {
      option.disabled = false;
      hasSpilloverOption = true;
      continue;
    }
    if (optionMode === ENROLL_SPILLOVER_MODE_DIRECT) {
      option.disabled = false;
      hasDirectOption = true;
    }
  }

  const selectedMode = normalizeCredentialValue(treeNextEnrollSpilloverModeInput.value || '');
  if (
    selectedMode !== ENROLL_SPILLOVER_MODE_SPILLOVER
    && selectedMode !== ENROLL_SPILLOVER_MODE_DIRECT
  ) {
    treeNextEnrollSpilloverModeInput.value = hasSpilloverOption
      ? ENROLL_SPILLOVER_MODE_SPILLOVER
      : (hasDirectOption ? ENROLL_SPILLOVER_MODE_DIRECT : ENROLL_SPILLOVER_MODE_SPILLOVER);
  }

  const spilloverSelectEntry = treeNextEnrollCustomSelectByNativeId.get('tree-next-enroll-spillover-mode');
  if (spilloverSelectEntry) {
    buildTreeNextEnrollCustomSelectMenu(spilloverSelectEntry);
    closeTreeNextEnrollCustomSelect(spilloverSelectEntry);
  } else {
    syncTreeNextEnrollCustomSelectById('tree-next-enroll-spillover-mode');
  }

  return resolveTreeNextEnrollSpilloverModeValue() === ENROLL_SPILLOVER_MODE_SPILLOVER;
}

function syncTreeNextEnrollLegPositionField() {
  if (!(treeNextEnrollLegPositionInput instanceof HTMLInputElement)) {
    return;
  }
  const placementSide = resolveTreeNextEnrollPlacementSideFromLock(state.enroll?.placementLock);
  const sideLabel = placementSide === 'right' ? 'Right' : 'Left';
  const spilloverMode = resolveTreeNextEnrollSpilloverModeValue();
  treeNextEnrollLegPositionInput.value = spilloverMode === ENROLL_SPILLOVER_MODE_SPILLOVER
    ? `Spillover ${sideLabel} Leg`
    : `${sideLabel} Leg`;
}

function resolveTreeNextEnrollSessionSponsorIdentity() {
  const sponsorUsername = normalizeCredentialValue(
    state.session?.username
    || state.session?.memberUsername
    || '',
  );
  const sponsorName = safeText(
    resolveSessionDisplayName()
    || state.session?.name
    || state.session?.username
    || state.session?.memberUsername
    || '',
  );
  return {
    sponsorUsername,
    sponsorName,
  };
}

function resolveTreeNextEnrollSponsorIdentityForMode(placementLock = state.enroll?.placementLock) {
  const directIdentity = resolvePlacementSponsorIdentity(placementLock);
  const spilloverMode = resolveTreeNextEnrollSpilloverModeValue();
  if (spilloverMode !== ENROLL_SPILLOVER_MODE_SPILLOVER) {
    return directIdentity;
  }

  const sessionIdentity = resolveTreeNextEnrollSessionSponsorIdentity();
  if (sessionIdentity.sponsorUsername) {
    return {
      sponsorUsername: sessionIdentity.sponsorUsername,
      sponsorName: sessionIdentity.sponsorName || sessionIdentity.sponsorUsername,
    };
  }
  if (sessionIdentity.sponsorName) {
    return {
      sponsorUsername: directIdentity.sponsorUsername,
      sponsorName: sessionIdentity.sponsorName,
    };
  }
  return directIdentity;
}

function syncTreeNextEnrollSponsorField() {
  if (!(treeNextEnrollSponsorInput instanceof HTMLInputElement)) {
    return;
  }
  if (!state.enroll?.placementLock) {
    treeNextEnrollSponsorInput.value = '';
    return;
  }
  const { sponsorUsername, sponsorName } = resolveTreeNextEnrollSponsorIdentityForMode(state.enroll.placementLock);
  treeNextEnrollSponsorInput.value = sponsorName || sponsorUsername;
}

function setTreeNextEnrollStep(step, options = {}) {
  const {
    focusField = false,
  } = options;
  const normalizedStep = Math.max(1, Math.min(4, Math.floor(safeNumber(step, 1))));
  state.enroll.step = normalizedStep;
  if (treeNextEnrollModalElement instanceof HTMLElement) {
    treeNextEnrollModalElement.dataset.enrollCurrentStep = String(normalizedStep);
  }

  for (const stepElement of treeNextEnrollStepElements) {
    if (!(stepElement instanceof HTMLElement)) {
      continue;
    }
    const elementStep = Math.floor(safeNumber(stepElement.dataset.enrollStep, 0));
    stepElement.classList.toggle('is-active', elementStep === normalizedStep);
  }

  const stepCopy = resolveTreeNextEnrollStepCopy(normalizedStep);
  if (treeNextEnrollModalTitleElement instanceof HTMLElement) {
    treeNextEnrollModalTitleElement.textContent = stepCopy.title;
  }
  if (treeNextEnrollModalSubtitleElement instanceof HTMLElement) {
    treeNextEnrollModalSubtitleElement.textContent = stepCopy.subtitle;
  }

  for (const dotElement of treeNextEnrollStepDotElements) {
    if (!(dotElement instanceof HTMLElement)) {
      continue;
    }
    const dotStep = Math.floor(safeNumber(dotElement.dataset.enrollStepDot, 0));
    dotElement.classList.toggle('is-active', dotStep === Math.min(3, normalizedStep));
  }
  if (treeNextEnrollStepIndicatorsElement instanceof HTMLElement) {
    treeNextEnrollStepIndicatorsElement.classList.toggle('is-hidden', normalizedStep > 3);
  }
  syncTreeNextEnrollPanelPosition();

  if (!focusField) {
    return;
  }
  window.requestAnimationFrame(() => {
    if (normalizedStep === 1 && treeNextEnrollEmailInput instanceof HTMLInputElement) {
      treeNextEnrollEmailInput.focus({ preventScroll: true });
      return;
    }
    if (normalizedStep === 2 && treeNextEnrollPackageInput instanceof HTMLSelectElement) {
      treeNextEnrollPackageInput.focus({ preventScroll: true });
      return;
    }
    if (normalizedStep === 3 && treeNextEnrollNameOnCardInput instanceof HTMLInputElement) {
      treeNextEnrollNameOnCardInput.focus({ preventScroll: true });
      return;
    }
    if (normalizedStep === 4 && treeNextEnrollModalDoneButton instanceof HTMLButtonElement) {
      treeNextEnrollModalDoneButton.focus({ preventScroll: true });
    }
  });
}

function resolveTreeNextEnrollStep() {
  return Math.max(1, Math.min(4, Math.floor(safeNumber(state.enroll?.step, 1))));
}

function showTreeNextEnrollThankYouStep(options = {}) {
  const enrolledName = safeText(options?.enrolledName) || 'New member';
  const packageLabel = safeText(options?.packageLabel) || 'Legacy Builder Package';
  const commissionAmount = Math.max(0, safeNumber(options?.commissionAmount, 0));
  const passwordSetupLink = safeText(options?.passwordSetupLink);

  if (treeNextEnrollThankYouNameElement instanceof HTMLElement) {
    treeNextEnrollThankYouNameElement.textContent = enrolledName;
  }
  if (treeNextEnrollThankYouPackageElement instanceof HTMLElement) {
    treeNextEnrollThankYouPackageElement.textContent = packageLabel;
  }
  if (treeNextEnrollThankYouCommissionElement instanceof HTMLElement) {
    treeNextEnrollThankYouCommissionElement.textContent = formatEnrollCurrency(commissionAmount);
  }
  setTreeNextEnrollPasswordSetupLink(passwordSetupLink);
  setTreeNextEnrollStep(4, { focusField: true });
}

function syncTreeNextEnrollPanelPosition(layoutInput = state.layout) {
  if (!(treeNextEnrollModalElement instanceof HTMLElement)) {
    return;
  }

  const viewportWidth = Math.max(
    1,
    Math.floor(safeNumber(state.renderSize?.width, window.innerWidth || 1)),
  );
  const viewportHeight = Math.max(
    1,
    Math.floor(safeNumber(state.renderSize?.height, window.innerHeight || 1)),
  );
  const isCompactPanelViewport = viewportHeight <= 1065 || viewportWidth <= 1366;
  const isStepThreeActive = resolveTreeNextEnrollStep() === 3;
  const compactPanelMaxWidth = viewportHeight <= 820
    ? 500
    : (viewportHeight <= 1065 ? 540 : 550);
  const panelMaxWidth = isCompactPanelViewport
    ? compactPanelMaxWidth
    : ENROLL_PANEL_MAX_WIDTH;
  const panelHorizontalGap = isCompactPanelViewport
    ? 18
    : ENROLL_PANEL_HORIZONTAL_GAP;
  const horizontalEdgePadding = ENROLL_PANEL_EDGE_PADDING;
  const verticalEdgePadding = isStepThreeActive && viewportHeight <= 1065
    ? 6
    : ENROLL_PANEL_EDGE_PADDING;
  const availableWidth = Math.max(ENROLL_PANEL_MIN_WIDTH, viewportWidth - (horizontalEdgePadding * 2));
  const panelWidth = Math.max(
    Math.min(ENROLL_PANEL_MIN_WIDTH, availableWidth),
    Math.min(panelMaxWidth, Math.floor(availableWidth)),
  );

  const layout = layoutInput && typeof layoutInput === 'object' ? layoutInput : null;
  const sideNav = layout?.sideNav || null;
  const sideNavToggle = layout?.sideNavToggle || null;
  const sideNavOpen = Boolean(state.ui?.sideNavOpen);

  let anchorLeft = Math.round((viewportWidth - panelWidth) / 2);
  if (sideNavOpen && sideNav) {
    anchorLeft = Math.round(sideNav.x + sideNav.width + panelHorizontalGap);
  } else if (sideNavToggle) {
    anchorLeft = Math.round(sideNavToggle.x + sideNavToggle.width + panelHorizontalGap);
  }

  const clampedLeft = clamp(
    anchorLeft,
    horizontalEdgePadding,
    Math.max(horizontalEdgePadding, viewportWidth - panelWidth - horizontalEdgePadding),
  );
  const centerTop = Math.round(viewportHeight / 2);
  const maxHeight = Math.max(320, viewportHeight - (verticalEdgePadding * 2));

  treeNextEnrollModalElement.style.width = `${panelWidth}px`;
  treeNextEnrollModalElement.style.left = `${clampedLeft}px`;
  treeNextEnrollModalElement.style.top = `${centerTop}px`;
  treeNextEnrollModalElement.style.maxHeight = `${maxHeight}px`;
}

function isAccountOverviewPanelAvailable() {
  return accountOverviewPanelElement instanceof HTMLElement;
}

function setAccountOverviewText(element, value) {
  if (!(element instanceof HTMLElement)) {
    return;
  }
  element.textContent = safeText(value);
}

function createEmptyAccountOverviewRemoteSnapshot() {
  return {
    binaryTreeMetrics: null,
    salesTeamCommission: null,
    commissionContainerSnapshot: null,
    eWalletSnapshot: null,
    walletCommissionOffsets: null,
    retailProfitBalance: 0,
    updatedAtMs: 0,
  };
}

function resetAccountOverviewRemoteSnapshot() {
  accountOverviewRemoteRequestSequence += 1;
  accountOverviewRemoteSnapshot = createEmptyAccountOverviewRemoteSnapshot();
  accountOverviewRemoteDataVersion = 0;
  accountOverviewRemoteSyncPromise = null;
  accountOverviewRemoteSyncInFlight = false;
  accountOverviewRemoteLastRequestAtMs = 0;
  accountOverviewRemoteLastSyncedAtMs = 0;
  accountOverviewRemoteIdentityKey = '';
  accountOverviewCachedLegVolumeSignature = '';
  accountOverviewCachedLegVolumeMetrics = null;
  accountOverviewLastRenderSignature = '';
}

function resolveAccountOverviewIdentityPayload(homeNode = null) {
  const session = state.session && typeof state.session === 'object' ? state.session : null;
  const userId = safeText(
    session?.id
    || session?.userId
    || session?.user_id
    || session?.memberId
    || session?.member_id
    || homeNode?.id
    || '',
  );
  const username = safeText(
    session?.username
    || session?.memberUsername
    || session?.member_username
    || session?.userName
    || session?.user_name
    || homeNode?.username
    || homeNode?.memberCode
    || '',
  ).replace(/^@+/, '');
  const email = safeText(
    session?.email
    || session?.userEmail
    || session?.user_email
    || session?.login
    || '',
  );
  return {
    userId,
    username,
    email,
  };
}

function resolveAccountOverviewIdentityKey(identityPayload = {}) {
  const userId = safeText(identityPayload?.userId);
  const username = normalizeCredentialValue(safeText(identityPayload?.username).replace(/^@+/, ''));
  const email = normalizeCredentialValue(identityPayload?.email);
  return [userId, username, email].join('|');
}

function appendAccountOverviewIdentityQuery(query, identityPayload = {}) {
  if (!(query instanceof URLSearchParams)) {
    return;
  }
  const userId = safeText(identityPayload?.userId);
  const username = safeText(identityPayload?.username).replace(/^@+/, '');
  const email = safeText(identityPayload?.email);
  if (userId) {
    query.set('userId', userId);
  }
  if (username) {
    query.set('username', username);
  }
  if (email) {
    query.set('email', email);
  }
}

async function fetchAccountOverviewEndpoint(endpoint, query = new URLSearchParams()) {
  const queryString = query instanceof URLSearchParams
    ? query.toString()
    : '';
  const requestUrl = queryString ? `${endpoint}?${queryString}` : endpoint;

  try {
    const response = await fetch(requestUrl, {
      method: 'GET',
      cache: 'no-store',
      credentials: 'same-origin',
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      return null;
    }
    return payload && typeof payload === 'object' ? payload : null;
  } catch {
    return null;
  }
}

function resolveAccountOverviewRetailProfitFallback(homeNode = null) {
  const session = state.session && typeof state.session === 'object' ? state.session : null;
  const candidates = [
    homeNode?.retailProfit,
    homeNode?.retail_profit,
    homeNode?.retailCommission,
    homeNode?.retail_commission,
    session?.retailProfit,
    session?.retail_profit,
    session?.retailCommission,
    session?.retail_commission,
    session?.storeRetailProfit,
    session?.store_retail_profit,
  ];
  for (const candidate of candidates) {
    const parsed = safeNumber(candidate, Number.NaN);
    if (Number.isFinite(parsed)) {
      return Math.max(0, parsed);
    }
  }
  return 0;
}

function resolveAccountOverviewSeedWalletBalance(homeNode = null) {
  const session = state.session && typeof state.session === 'object' ? state.session : null;
  const candidates = [
    accountOverviewRemoteSnapshot?.eWalletSnapshot?.balance,
    session?.walletBalance,
    session?.wallet_balance,
    session?.eWalletBalance,
    session?.ewalletBalance,
    session?.e_wallet_balance,
    homeNode?.walletBalance,
    homeNode?.wallet_balance,
    homeNode?.eWalletBalance,
    homeNode?.ewalletBalance,
    homeNode?.e_wallet_balance,
  ];
  for (const candidate of candidates) {
    const parsed = safeNumber(candidate, Number.NaN);
    if (Number.isFinite(parsed)) {
      return Math.max(0, parsed);
    }
  }
  return 0;
}

function resolveAccountOverviewSalesTeamCommissionRecord(payload = null) {
  if (payload?.commission && typeof payload.commission === 'object') {
    return payload.commission;
  }
  const list = Array.isArray(payload?.commissions) ? payload.commissions : [];
  return list.find((entry) => entry && typeof entry === 'object') || null;
}

function resolveAccountOverviewRemoteSyncIntervalMs(options = {}) {
  const {
    forRetry = false,
  } = options;
  const panelVisible = Boolean(state.ui?.accountOverviewVisible);
  const hiddenSyncMode = document.visibilityState === 'hidden' || !panelVisible;
  const baseIntervalMs = hiddenSyncMode
    ? ACCOUNT_OVERVIEW_REMOTE_SYNC_HIDDEN_INTERVAL_MS
    : ACCOUNT_OVERVIEW_REMOTE_SYNC_VISIBLE_INTERVAL_MS;
  if (!forRetry) {
    return baseIntervalMs;
  }
  return Math.min(baseIntervalMs, ACCOUNT_OVERVIEW_REMOTE_SYNC_RETRY_INTERVAL_MS);
}

async function refreshAccountOverviewRemoteSnapshot(options = {}) {
  const {
    force = false,
    homeNode = null,
  } = options;

  if (accountOverviewRemoteSyncInFlight && accountOverviewRemoteSyncPromise) {
    return accountOverviewRemoteSyncPromise;
  }

  const identityPayload = resolveAccountOverviewIdentityPayload(homeNode);
  const identityKey = resolveAccountOverviewIdentityKey(identityPayload);
  const hasIdentity = Boolean(
    safeText(identityPayload.userId)
    || safeText(identityPayload.username)
    || safeText(identityPayload.email),
  );
  if (!hasIdentity) {
    resetAccountOverviewRemoteSnapshot();
    return accountOverviewRemoteSnapshot;
  }

  const nowMs = Date.now();
  const hasSuccessfulSync = accountOverviewRemoteLastSyncedAtMs > 0;
  const minimumIntervalMs = hasSuccessfulSync
    ? resolveAccountOverviewRemoteSyncIntervalMs()
    : resolveAccountOverviewRemoteSyncIntervalMs({ forRetry: true });
  const identityChanged = identityKey !== accountOverviewRemoteIdentityKey;
  if (
    !force
    && !identityChanged
    && accountOverviewRemoteLastRequestAtMs > 0
    && (nowMs - accountOverviewRemoteLastRequestAtMs) < minimumIntervalMs
  ) {
    return accountOverviewRemoteSnapshot;
  }

  accountOverviewRemoteIdentityKey = identityKey;
  accountOverviewRemoteLastRequestAtMs = nowMs;
  accountOverviewRemoteSyncInFlight = true;
  accountOverviewRemoteRequestSequence += 1;
  const requestSequence = accountOverviewRemoteRequestSequence;
  accountOverviewRemoteSyncPromise = (async () => {
    const identityQuery = new URLSearchParams();
    appendAccountOverviewIdentityQuery(identityQuery, identityPayload);

    const walletQuery = new URLSearchParams(identityQuery.toString());
    walletQuery.set('limit', '25');
    const seedBalance = resolveAccountOverviewSeedWalletBalance(homeNode);
    if (seedBalance > 0) {
      walletQuery.set('seedBalance', seedBalance.toFixed(2));
    }

    const [
      binaryTreeMetricsPayload,
      salesTeamCommissionsPayload,
      commissionContainersPayload,
      eWalletPayload,
    ] = await Promise.all([
      fetchAccountOverviewEndpoint(ACCOUNT_OVERVIEW_BINARY_TREE_METRICS_API, identityQuery),
      fetchAccountOverviewEndpoint(ACCOUNT_OVERVIEW_SALES_TEAM_COMMISSIONS_API, identityQuery),
      fetchAccountOverviewEndpoint(ACCOUNT_OVERVIEW_COMMISSION_CONTAINERS_API, identityQuery),
      fetchAccountOverviewEndpoint(ACCOUNT_OVERVIEW_E_WALLET_API, walletQuery),
    ]);

    const binaryTreeMetrics = (
      binaryTreeMetricsPayload?.snapshot
      && typeof binaryTreeMetricsPayload.snapshot === 'object'
    )
      ? binaryTreeMetricsPayload.snapshot
      : null;
    const salesTeamCommission = resolveAccountOverviewSalesTeamCommissionRecord(salesTeamCommissionsPayload);
    const commissionContainerSnapshot = (
      commissionContainersPayload?.snapshot
      && typeof commissionContainersPayload.snapshot === 'object'
    )
      ? commissionContainersPayload.snapshot
      : null;
    const eWalletSnapshot = (
      eWalletPayload?.wallet
      && typeof eWalletPayload.wallet === 'object'
    )
      ? eWalletPayload.wallet
      : null;
    const walletCommissionOffsets = (
      eWalletPayload?.commissionOffsets
      && typeof eWalletPayload.commissionOffsets === 'object'
    )
      ? eWalletPayload.commissionOffsets
      : null;

    const retailProfitBalance = resolveAccountOverviewRetailProfitFallback(homeNode);
    if (requestSequence !== accountOverviewRemoteRequestSequence) {
      return accountOverviewRemoteSnapshot;
    }
    const nextSnapshot = {
      binaryTreeMetrics,
      salesTeamCommission,
      commissionContainerSnapshot,
      eWalletSnapshot,
      walletCommissionOffsets,
      retailProfitBalance,
      updatedAtMs: Date.now(),
    };

    accountOverviewRemoteSnapshot = nextSnapshot;
    accountOverviewRemoteDataVersion += 1;
    if (binaryTreeMetrics || salesTeamCommission || commissionContainerSnapshot || eWalletSnapshot) {
      accountOverviewRemoteLastSyncedAtMs = nextSnapshot.updatedAtMs;
    }
    accountOverviewLastRenderSignature = '';
    return accountOverviewRemoteSnapshot;
  })();

  try {
    return await accountOverviewRemoteSyncPromise;
  } finally {
    if (requestSequence === accountOverviewRemoteRequestSequence) {
      accountOverviewRemoteSyncInFlight = false;
      accountOverviewRemoteSyncPromise = null;
    }
  }
}

function maybeRefreshAccountOverviewRemoteSnapshot(homeNode = null) {
  if (!isAccountOverviewPanelAvailable()) {
    return;
  }
  const identityPayload = resolveAccountOverviewIdentityPayload(homeNode);
  const hasIdentity = Boolean(
    safeText(identityPayload.userId)
    || safeText(identityPayload.username)
    || safeText(identityPayload.email),
  );
  if (!hasIdentity) {
    return;
  }
  const identityKey = resolveAccountOverviewIdentityKey(identityPayload);
  const identityChanged = identityKey !== accountOverviewRemoteIdentityKey;
  const referenceMs = accountOverviewRemoteLastSyncedAtMs || accountOverviewRemoteLastRequestAtMs;
  const refreshIntervalMs = accountOverviewRemoteLastSyncedAtMs > 0
    ? resolveAccountOverviewRemoteSyncIntervalMs()
    : resolveAccountOverviewRemoteSyncIntervalMs({ forRetry: true });
  if (
    identityChanged
    || !referenceMs
    || (Date.now() - referenceMs) >= refreshIntervalMs
  ) {
    void refreshAccountOverviewRemoteSnapshot({
      force: identityChanged,
      homeNode,
    });
  }
}

function resolveAccountOverviewJoinedAtMs(homeNode = null) {
  const session = state.session && typeof state.session === 'object' ? state.session : null;
  const candidates = [
    homeNode?.createdAt,
    homeNode?.created_at,
    homeNode?.joinedAt,
    homeNode?.joined_at,
    session?.createdAt,
    session?.created_at,
    session?.joinedAt,
    session?.joined_at,
    session?.registeredAt,
    session?.registered_at,
  ];

  for (const candidate of candidates) {
    const parsed = Date.parse(safeText(candidate));
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return Number.NaN;
}

function formatAccountOverviewJoinedDate(joinedAtMs) {
  if (!Number.isFinite(joinedAtMs)) {
    return 'Joined recently';
  }
  try {
    const formatted = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(joinedAtMs));
    return `Joined ${formatted}`;
  } catch (_) {
    return 'Joined recently';
  }
}

function resolveAccountOverviewDirectSponsorCount(homeNode = null) {
  const safeNodes = Array.isArray(state.nodes) ? state.nodes : [];
  if (!safeNodes.length) {
    return 0;
  }

  const homeNodeId = normalizeCredentialValue(
    safeText(homeNode?.id || resolvePreferredGlobalHomeNodeId()),
  );
  let totalDirectSponsors = 0;

  for (const node of safeNodes) {
    const nodeId = normalizeCredentialValue(safeText(node?.id));
    if (!nodeId || nodeId === 'root' || (homeNodeId && nodeId === homeNodeId)) {
      continue;
    }

    if (isNodePersonallyEnrolledBySession(node)) {
      totalDirectSponsors += 1;
      continue;
    }

    const sponsorNodeId = normalizeCredentialValue(
      safeText(node?.sponsorId || node?.globalSponsorId || node?.sourceSponsorId || ''),
    );
    if (homeNodeId && sponsorNodeId && sponsorNodeId === homeNodeId) {
      totalDirectSponsors += 1;
    }
  }

  return totalDirectSponsors;
}

function resolveAccountOverviewAnchoredMonthlyCutoffMs(homeNode = null, referenceDate = new Date()) {
  const session = state.session && typeof state.session === 'object' ? state.session : null;
  const anchorCandidates = [
    homeNode?.createdAt,
    homeNode?.created_at,
    homeNode?.enrolledAt,
    homeNode?.enrolled_at,
    session?.createdAt,
    session?.created_at,
    session?.registeredAt,
    session?.registered_at,
  ];
  let anchorDate = null;
  for (const candidate of anchorCandidates) {
    const parsed = Date.parse(safeText(candidate));
    if (Number.isFinite(parsed)) {
      anchorDate = new Date(parsed);
      break;
    }
  }
  if (!(anchorDate instanceof Date) || Number.isNaN(anchorDate.getTime())) {
    return Number.NaN;
  }

  const safeReferenceDate = referenceDate instanceof Date && !Number.isNaN(referenceDate.getTime())
    ? referenceDate
    : new Date();

  const buildCutoffUtcMs = (year, monthIndex) => {
    const lastDayOfMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
    const anchoredDay = Math.min(anchorDate.getUTCDate(), lastDayOfMonth);
    return Date.UTC(
      year,
      monthIndex,
      anchoredDay,
      anchorDate.getUTCHours(),
      anchorDate.getUTCMinutes(),
      anchorDate.getUTCSeconds(),
      anchorDate.getUTCMilliseconds(),
    );
  };

  let nextCutoffMs = buildCutoffUtcMs(
    safeReferenceDate.getUTCFullYear(),
    safeReferenceDate.getUTCMonth(),
  );
  if (nextCutoffMs <= safeReferenceDate.getTime()) {
    const nextMonthIndex = safeReferenceDate.getUTCMonth() + 1;
    const nextYear = safeReferenceDate.getUTCFullYear() + Math.floor(nextMonthIndex / 12);
    const normalizedNextMonthIndex = ((nextMonthIndex % 12) + 12) % 12;
    nextCutoffMs = buildCutoffUtcMs(nextYear, normalizedNextMonthIndex);
  }

  return nextCutoffMs;
}

function resolveAccountOverviewActivityUntilLabel(homeNode = null) {
  const session = state.session && typeof state.session === 'object' ? state.session : null;
  const storedActiveUntilCandidates = [
    homeNode?.activityActiveUntilAt,
    homeNode?.activity_active_until_at,
    session?.activityActiveUntilAt,
    session?.activity_active_until_at,
  ];
  let storedActiveUntilMs = Number.NaN;
  for (const candidate of storedActiveUntilCandidates) {
    const parsed = Date.parse(safeText(candidate));
    if (Number.isFinite(parsed)) {
      storedActiveUntilMs = parsed;
      break;
    }
  }

  const now = new Date();
  const anchoredCutoffMs = resolveAccountOverviewAnchoredMonthlyCutoffMs(homeNode, now);
  const activeUntilMs = Number.isFinite(anchoredCutoffMs)
    ? anchoredCutoffMs
    : storedActiveUntilMs;
  if (!Number.isFinite(activeUntilMs)) {
    return '--';
  }

  const remainingMs = activeUntilMs - now.getTime();
  if (remainingMs <= 0) {
    return 'Expired';
  }
  return formatCountdown(remainingMs);
}

function resolveAccountOverviewLegVolumeMetrics(homeNodeIdInput = 'root') {
  const homeNodeId = safeText(homeNodeIdInput || 'root') || 'root';
  const snapshotHash = safeText(state.liveSync?.lastAppliedHash || '');
  const cacheSignature = `${homeNodeId}::${snapshotHash}`;
  if (
    cacheSignature
    && cacheSignature === accountOverviewCachedLegVolumeSignature
    && accountOverviewCachedLegVolumeMetrics
  ) {
    return accountOverviewCachedLegVolumeMetrics;
  }

  const fallbackMetrics = {
    personalVolume: 0,
    leftVolume: 0,
    rightVolume: 0,
    totalVolume: 0,
  };
  let resolvedMetrics = fallbackMetrics;
  try {
    const metrics = resolveNodeLegVolumes(homeNodeId);
    if (metrics && typeof metrics === 'object') {
      resolvedMetrics = {
        personalVolume: Math.max(0, Math.floor(safeNumber(metrics.personalVolume, 0))),
        leftVolume: Math.max(0, Math.floor(safeNumber(metrics.leftVolume, 0))),
        rightVolume: Math.max(0, Math.floor(safeNumber(metrics.rightVolume, 0))),
        totalVolume: Math.max(0, Math.floor(safeNumber(metrics.totalVolume, 0))),
      };
    }
  } catch {
    resolvedMetrics = fallbackMetrics;
  }

  accountOverviewCachedLegVolumeSignature = cacheSignature;
  accountOverviewCachedLegVolumeMetrics = resolvedMetrics;
  return resolvedMetrics;
}

function resolveAccountOverviewTotalOrganizationBv(homeNode = null) {
  const remoteMetrics = accountOverviewRemoteSnapshot?.binaryTreeMetrics;
  const remoteTotal = safeNumber(remoteMetrics?.totalAccumulatedBv, Number.NaN);
  if (Number.isFinite(remoteTotal)) {
    return Math.max(0, Math.floor(remoteTotal));
  }

  const explicitCandidates = [
    homeNode?.totalAccumulatedBv,
    homeNode?.total_accumulated_bv,
    homeNode?.totalOrganizationBv,
    homeNode?.total_organization_bv,
  ];
  for (const candidate of explicitCandidates) {
    const parsed = safeNumber(candidate, Number.NaN);
    if (Number.isFinite(parsed)) {
      return Math.max(0, Math.floor(parsed));
    }
  }

  const homeNodeId = safeText(homeNode?.id || resolvePreferredGlobalHomeNodeId()) || 'root';
  const legVolumeMetrics = resolveAccountOverviewLegVolumeMetrics(homeNodeId);
  return Math.max(
    0,
    Math.floor(safeNumber(legVolumeMetrics.leftVolume, 0) + safeNumber(legVolumeMetrics.rightVolume, 0)),
  );
}

function resolveAccountOverviewPersonalBv(homeNode = null) {
  const remoteMetrics = accountOverviewRemoteSnapshot?.binaryTreeMetrics;
  const remotePersonalBv = safeNumber(remoteMetrics?.accountPersonalPv, Number.NaN);
  if (Number.isFinite(remotePersonalBv)) {
    return Math.max(0, Math.floor(remotePersonalBv));
  }

  const session = state.session && typeof state.session === 'object' ? state.session : null;
  const candidates = [
    homeNode?.currentPersonalPvBv,
    homeNode?.current_personal_pv_bv,
    homeNode?.monthlyPersonalBv,
    homeNode?.monthly_personal_bv,
    session?.currentPersonalPvBv,
    session?.current_personal_pv_bv,
    session?.monthlyPersonalBv,
    session?.monthly_personal_bv,
  ];
  for (const candidate of candidates) {
    const parsed = safeNumber(candidate, Number.NaN);
    if (Number.isFinite(parsed)) {
      return Math.max(0, Math.floor(parsed));
    }
  }

  return Math.max(0, Math.floor(resolveNodeCurrentPersonalBvForActivity(homeNode)));
}

function resolveAccountOverviewSalesTeamCycleProfile(packageKeyInput = ENROLL_DEFAULT_PACKAGE_KEY) {
  const normalizedPackageKey = normalizeCredentialValue(packageKeyInput);
  return ACCOUNT_OVERVIEW_SALES_TEAM_CYCLE_COMMISSION_PLAN[normalizedPackageKey]
    || ACCOUNT_OVERVIEW_SALES_TEAM_CYCLE_COMMISSION_PLAN[ENROLL_DEFAULT_PACKAGE_KEY]
    || { perCycle: 0, weeklyCapCycles: 0 };
}

function resolveAccountOverviewCycleCapMetrics(homeNode = null) {
  const session = state.session && typeof state.session === 'object' ? state.session : null;
  const remoteMetrics = accountOverviewRemoteSnapshot?.binaryTreeMetrics;
  const salesTeamCommission = accountOverviewRemoteSnapshot?.salesTeamCommission;
  const profile = resolveAccountOverviewSalesTeamCycleProfile(
    salesTeamCommission?.accountPackageKey
    || homeNode?.enrollmentPackage
    || session?.enrollmentPackage
    || ENROLL_DEFAULT_PACKAGE_KEY,
  );
  const weeklyCapCycles = Math.max(0, Math.floor(safeNumber(
    salesTeamCommission?.weeklyCapCycles,
    profile.weeklyCapCycles,
  )));
  const totalCycles = Math.max(0, Math.floor(safeNumber(
    salesTeamCommission?.cappedCycles,
    salesTeamCommission?.totalCycles ?? remoteMetrics?.totalCycles ?? 0,
  )));
  const cappedCycles = weeklyCapCycles > 0
    ? Math.min(totalCycles, weeklyCapCycles)
    : totalCycles;
  return {
    cappedCycles,
    weeklyCapCycles,
  };
}

function resolveAccountOverviewEWalletBalance(homeNode = null) {
  const remoteWallet = accountOverviewRemoteSnapshot?.eWalletSnapshot;
  const remoteBalance = safeNumber(remoteWallet?.balance, Number.NaN);
  if (Number.isFinite(remoteBalance)) {
    return Math.max(0, remoteBalance);
  }
  return resolveAccountOverviewSeedWalletBalance(homeNode);
}

function resolveAccountOverviewCommissionValue(...candidates) {
  for (const candidate of candidates) {
    const parsed = safeNumber(candidate, Number.NaN);
    if (Number.isFinite(parsed)) {
      return Math.max(0, parsed);
    }
  }
  return 0;
}

function resolveAccountOverviewCommissionBalances(homeNode = null) {
  const session = state.session && typeof state.session === 'object' ? state.session : null;
  const commissionContainerBalances = (
    accountOverviewRemoteSnapshot?.commissionContainerSnapshot?.balances
    && typeof accountOverviewRemoteSnapshot.commissionContainerSnapshot.balances === 'object'
  )
    ? accountOverviewRemoteSnapshot.commissionContainerSnapshot.balances
    : {};
  const salesTeamCommission = accountOverviewRemoteSnapshot?.salesTeamCommission;
  const salesTeamCycleMetrics = resolveAccountOverviewCycleCapMetrics(homeNode);
  const salesTeamProfile = resolveAccountOverviewSalesTeamCycleProfile(
    salesTeamCommission?.accountPackageKey
    || homeNode?.enrollmentPackage
    || session?.enrollmentPackage
    || ENROLL_DEFAULT_PACKAGE_KEY,
  );
  const fallbackSalesTeamGross = salesTeamCycleMetrics.cappedCycles * Math.max(0, safeNumber(salesTeamProfile?.perCycle, 0));
  const walletCommissionOffsets = (
    accountOverviewRemoteSnapshot?.walletCommissionOffsets
    && typeof accountOverviewRemoteSnapshot.walletCommissionOffsets === 'object'
  )
    ? accountOverviewRemoteSnapshot.walletCommissionOffsets
    : {};
  return {
    retailProfit: resolveAccountOverviewCommissionValue(
      walletCommissionOffsets.retailprofit,
      walletCommissionOffsets.retail,
      accountOverviewRemoteSnapshot?.retailProfitBalance,
      homeNode?.retailProfit,
      homeNode?.retail_profit,
      session?.retailProfit,
      session?.retail_profit,
    ),
    fastTrack: resolveAccountOverviewCommissionValue(
      commissionContainerBalances.fasttrack,
      commissionContainerBalances.fastTrack,
      homeNode?.fastTrackBonusAmount,
      homeNode?.fast_track_bonus_amount,
      session?.fastTrackBonusAmount,
      session?.fast_track_bonus_amount,
    ),
    salesTeam: resolveAccountOverviewCommissionValue(
      commissionContainerBalances.salesteam,
      commissionContainerBalances.salesTeam,
      salesTeamCommission?.netCommissionAmount,
      salesTeamCommission?.grossCommissionAmount,
      fallbackSalesTeamGross,
    ),
    infinityBuilder: resolveAccountOverviewCommissionValue(
      commissionContainerBalances.infinitybuilder,
      commissionContainerBalances.infinityBuilder,
      homeNode?.infinityBuilderBonusAmount,
      homeNode?.infinity_builder_bonus_amount,
      session?.infinityBuilderBonusAmount,
      session?.infinity_builder_bonus_amount,
    ),
    legacyBuilder: resolveAccountOverviewCommissionValue(
      commissionContainerBalances.legacyleadership,
      commissionContainerBalances.legacyLeadership,
      homeNode?.legacyLeadershipBonusAmount,
      homeNode?.legacy_leadership_bonus_amount,
      session?.legacyLeadershipBonusAmount,
      session?.legacy_leadership_bonus_amount,
    ),
  };
}

function resolveAccountOverviewBadgePalette(label, fallbackVariant = 'neutral') {
  const normalized = normalizeCredentialValue(label);
  if (
    normalized.includes('founder')
    || normalized.includes('title 1')
    || normalized.includes('title1')
  ) {
    return ACCOUNT_OVERVIEW_BADGE_PALETTES.legacyFounder;
  }
  if (normalized.includes('legacy')) {
    return ACCOUNT_OVERVIEW_BADGE_PALETTES.legacyRank;
  }
  if (normalized.includes('infinity') || normalized.includes('achiever')) {
    return APPLE_MAPS_NODE_PALETTES.accent;
  }
  if (normalized.includes('business')) {
    return APPLE_MAPS_NODE_PALETTES.mint;
  }
  if (
    normalized.includes('personal')
    || normalized.includes('starter')
    || normalized.includes('builder')
  ) {
    return APPLE_MAPS_NODE_PALETTES.neutral;
  }
  const safeVariant = APPLE_MAPS_NODE_PALETTES[fallbackVariant]
    ? fallbackVariant
    : 'neutral';
  return resolveNodeAvatarPalette(`account-overview:${normalized || safeVariant}`, {
    variant: safeVariant,
  });
}

function resolveAccountOverviewGradientBackground(palette, options = {}) {
  void options;
  return resolveCssGradientFromPalette(palette);
}

function syncAccountOverviewPanelPosition(layoutInput = state.layout) {
  if (!isAccountOverviewPanelAvailable()) {
    return;
  }

  const layout = layoutInput && typeof layoutInput === 'object' ? layoutInput : null;
  const sideNav = layout?.sideNav || null;
  const sideNavToggle = layout?.sideNavToggle || null;
  const sideNavOpen = Boolean(state.ui?.sideNavOpen);

  const viewportWidth = Math.max(
    1,
    Math.floor(safeNumber(state.renderSize?.width, window.innerWidth || 1)),
  );
  const viewportHeight = Math.max(
    1,
    Math.floor(safeNumber(state.renderSize?.height, window.innerHeight || 1)),
  );

  const panelHorizontalGap = 18;
  const panelEdgePadding = 18;
  const rightDockReservedWidth = 72;
  const panelTop = sideNav
    ? Math.round(sideNav.y)
    : panelEdgePadding;
  const panelHeight = sideNav
    ? Math.round(sideNav.height)
    : Math.max(320, viewportHeight - (panelEdgePadding * 2));

  let anchorLeft = Math.round((viewportWidth - 640) / 2);
  if (sideNavOpen && sideNav) {
    anchorLeft = Math.round(sideNav.x + sideNav.width + panelHorizontalGap);
  } else if (sideNavToggle) {
    anchorLeft = Math.round(sideNavToggle.x + sideNavToggle.width + panelHorizontalGap);
  }

  const maxUsableWidth = Math.max(
    360,
    Math.floor(viewportWidth - anchorLeft - rightDockReservedWidth),
  );
  const panelWidth = clamp(Math.round(Math.min(760, maxUsableWidth)), 360, maxUsableWidth);

  const clampedLeft = clamp(
    anchorLeft,
    panelEdgePadding,
    Math.max(
      panelEdgePadding,
      viewportWidth - panelWidth - rightDockReservedWidth,
    ),
  );
  const clampedTop = clamp(
    panelTop,
    panelEdgePadding,
    Math.max(panelEdgePadding, viewportHeight - panelHeight - panelEdgePadding),
  );
  const clampedHeight = clamp(
    panelHeight,
    320,
    Math.max(320, viewportHeight - (panelEdgePadding * 2)),
  );

  accountOverviewPanelElement.style.setProperty('--tree-next-account-overview-left', `${clampedLeft}px`);
  accountOverviewPanelElement.style.setProperty('--tree-next-account-overview-top', `${clampedTop}px`);
  accountOverviewPanelElement.style.setProperty('--tree-next-account-overview-width', `${panelWidth}px`);
  accountOverviewPanelElement.style.setProperty('--tree-next-account-overview-height', `${clampedHeight}px`);
  accountOverviewPanelElement.classList.remove('is-positioning');
}

function syncAccountOverviewPanelVisuals() {
  if (!isAccountOverviewPanelAvailable()) {
    return;
  }

  const session = state.session && typeof state.session === 'object' ? state.session : null;
  const homeNodeId = resolvePreferredGlobalHomeNodeId();
  const homeNode = resolveNodeById(homeNodeId) || resolveNodeById('root');
  maybeRefreshAccountOverviewRemoteSnapshot(homeNode);
  const displayName = resolveSessionDisplayName();
  const email = resolveSessionDisplayEmail();
  const username = safeText(homeNode?.username || session?.username || session?.login || '');
  const handleSeed = username.replace(/^@+/, '') || safeText(email.split('@')[0]);
  const handleText = handleSeed ? `@${handleSeed}` : '@member';
  const rankLabel = safeText(
    homeNode?.rank
    || homeNode?.accountRank
    || homeNode?.account_rank
    || session?.accountRank
    || session?.account_rank
    || session?.rank
    || accountOverviewRankLabelElement?.textContent
    || 'Legacy',
  );
  const fallbackTitleLabel = safeText(accountOverviewTitleLabelElement?.textContent) || rankLabel || 'Member Title';
  const sessionTitleLabel = resolveNodePrimaryTitleLabel(session, fallbackTitleLabel);
  const sessionTitleIsFallback = isTreeNextRankBuilderFallbackTitle(sessionTitleLabel, rankLabel);
  const homeTitleLabel = resolveNodePrimaryTitleLabel(homeNode);
  const homeTitleIsFallback = isTreeNextRankBuilderFallbackTitle(homeTitleLabel, rankLabel);
  let titleLabel = fallbackTitleLabel;
  if (state.source === 'member') {
    if (sessionTitleLabel && !sessionTitleIsFallback) {
      titleLabel = sessionTitleLabel;
    } else if (homeTitleLabel && !homeTitleIsFallback) {
      titleLabel = homeTitleLabel;
    } else {
      titleLabel = sessionTitleLabel || homeTitleLabel || fallbackTitleLabel;
    }
  } else if (homeTitleLabel && !homeTitleIsFallback) {
    titleLabel = homeTitleLabel;
  } else {
    titleLabel = sessionTitleLabel || homeTitleLabel || fallbackTitleLabel;
  }
  const joinedText = formatAccountOverviewJoinedDate(resolveAccountOverviewJoinedAtMs(homeNode));
  const iconSourceNode = {
    ...(homeNode && typeof homeNode === 'object' ? homeNode : {}),
    ...(session && typeof session === 'object' ? session : {}),
    rank: rankLabel,
    accountRank: rankLabel,
    title: titleLabel,
    accountTitle: titleLabel,
    profileAccountTitle: titleLabel,
  };
  const [rankIconPath, titleIconPath] = resolveNodeDetailRankAndTitleIcons(iconSourceNode);
  const avatarSignature = resolveSessionAvatarSignature();
  const activeState = homeNode ? resolveNodeActivityState(homeNode) : true;
  const activeUntilLabel = resolveAccountOverviewActivityUntilLabel(homeNode);
  const totalOrganizationBv = resolveAccountOverviewTotalOrganizationBv(homeNode);
  const personalBv = resolveAccountOverviewPersonalBv(homeNode);
  const cycleCapMetrics = resolveAccountOverviewCycleCapMetrics(homeNode);
  const directSponsorCount = resolveAccountOverviewDirectSponsorCount(homeNode);
  const eWalletBalance = resolveAccountOverviewEWalletBalance(homeNode);
  const commissionBalances = resolveAccountOverviewCommissionBalances(homeNode);
  const cycleCapText = `${formatInteger(cycleCapMetrics.cappedCycles, 0)} / ${formatInteger(cycleCapMetrics.weeklyCapCycles, 0)}`;
  const renderSignature = [
    displayName,
    handleText,
    rankLabel,
    titleLabel,
    joinedText,
    avatarSignature,
    safeText(rankIconPath),
    safeText(titleIconPath),
    activeState ? '1' : '0',
    activeUntilLabel,
    String(totalOrganizationBv),
    String(personalBv),
    cycleCapText,
    String(directSponsorCount),
    formatEnrollCurrency(eWalletBalance),
    formatEnrollCurrency(commissionBalances.retailProfit),
    formatEnrollCurrency(commissionBalances.fastTrack),
    formatEnrollCurrency(commissionBalances.salesTeam),
    formatEnrollCurrency(commissionBalances.infinityBuilder),
    formatEnrollCurrency(commissionBalances.legacyBuilder),
    String(accountOverviewRemoteDataVersion),
  ].join('::');
  if (renderSignature === accountOverviewLastRenderSignature) {
    return;
  }
  accountOverviewLastRenderSignature = renderSignature;

  setAccountOverviewText(accountOverviewNameElement, displayName);
  setAccountOverviewText(accountOverviewHandleElement, handleText);
  setAccountOverviewText(accountOverviewJoinedElement, joinedText);
  setAccountOverviewText(accountOverviewRankLabelElement, rankLabel);
  setAccountOverviewText(accountOverviewTitleLabelElement, titleLabel);
  setAccountOverviewText(accountOverviewActiveWindowValueElement, activeUntilLabel);
  setAccountOverviewText(accountOverviewTotalBvValueElement, formatVolumeValue(totalOrganizationBv));
  setAccountOverviewText(accountOverviewPersonalBvValueElement, formatVolumeValue(personalBv));
  setAccountOverviewText(accountOverviewCycleValueElement, cycleCapText);
  setAccountOverviewText(accountOverviewCycleLabelElement, 'Weekly Cycle Cap');
  setAccountOverviewText(accountOverviewDirectSponsorsValueElement, formatInteger(directSponsorCount, 0));
  setAccountOverviewText(accountOverviewEwalletValueElement, formatEnrollCurrency(eWalletBalance));
  setAccountOverviewText(accountOverviewSalesTeamValueElement, formatEnrollCurrency(commissionBalances.salesTeam));
  setAccountOverviewText(accountOverviewRetailProfitValueElement, formatEnrollCurrency(commissionBalances.retailProfit));
  setAccountOverviewText(accountOverviewFastTrackValueElement, formatEnrollCurrency(commissionBalances.fastTrack));
  setAccountOverviewText(accountOverviewTrackSalesTeamValueElement, formatEnrollCurrency(commissionBalances.salesTeam));
  setAccountOverviewText(accountOverviewInfinityBuilderValueElement, formatEnrollCurrency(commissionBalances.infinityBuilder));
  setAccountOverviewText(accountOverviewLegacyBuilderValueElement, formatEnrollCurrency(commissionBalances.legacyBuilder));

  if (accountOverviewRankIconElement instanceof HTMLImageElement && rankIconPath) {
    accountOverviewRankIconElement.src = rankIconPath;
  }
  if (accountOverviewTitleIconElement instanceof HTMLImageElement && titleIconPath) {
    accountOverviewTitleIconElement.src = titleIconPath;
  }

  const sessionAvatarBackground = resolveSessionAvatarCssBackground();
  if (accountOverviewAvatarElement instanceof HTMLElement) {
    if (sessionAvatarBackground.isPhoto) {
      accountOverviewAvatarElement.style.backgroundImage = sessionAvatarBackground.image;
      accountOverviewAvatarElement.dataset.avatarPhoto = 'true';
    } else {
      accountOverviewAvatarElement.style.backgroundImage = resolveAccountOverviewGradientBackground(
        resolveSessionAvatarPalette(),
        { sheenAlpha: 0.26 },
      );
      accountOverviewAvatarElement.dataset.avatarPhoto = 'false';
    }
  }
  if (accountOverviewAvatarInitialsElement instanceof HTMLElement) {
    accountOverviewAvatarInitialsElement.textContent = resolveInitials(displayName);
  }
  if (accountOverviewStatusDotElement instanceof HTMLElement) {
    accountOverviewStatusDotElement.classList.toggle('is-inactive', !activeState);
  }

  const rankPalette = resolveAccountOverviewBadgePalette(rankLabel, 'ocean');
  const titlePalette = resolveAccountOverviewBadgePalette(titleLabel, 'amber');
  if (accountOverviewRankBadgeElement instanceof HTMLElement) {
    accountOverviewRankBadgeElement.style.backgroundImage = resolveAccountOverviewGradientBackground(rankPalette, {
      sheenAlpha: 0.22,
    });
    accountOverviewRankBadgeElement.style.boxShadow = 'none';
  }
  if (accountOverviewTitleBadgeElement instanceof HTMLElement) {
    accountOverviewTitleBadgeElement.style.backgroundImage = resolveAccountOverviewGradientBackground(titlePalette, {
      sheenAlpha: 0.22,
    });
    accountOverviewTitleBadgeElement.style.boxShadow = 'none';
  }
}

function syncAccountOverviewPanelVisibility() {
  if (!isAccountOverviewPanelAvailable()) {
    return;
  }

  const isVisible = Boolean(state.ui?.accountOverviewVisible);
  accountOverviewPanelElement.classList.toggle('is-hidden', !isVisible);
  accountOverviewPanelElement.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
}

function setAccountOverviewPanelVisible(isVisible) {
  state.ui.accountOverviewVisible = Boolean(isVisible);
  syncAccountOverviewPanelVisibility();
  if (state.ui.accountOverviewVisible) {
    const homeNodeId = resolvePreferredGlobalHomeNodeId();
    const homeNode = resolveNodeById(homeNodeId) || resolveNodeById('root');
    void refreshAccountOverviewRemoteSnapshot({ force: true, homeNode });
  }
}

function initAccountOverviewPanel() {
  if (!isAccountOverviewPanelAvailable()) {
    return;
  }

  syncAccountOverviewPanelPosition();
  syncAccountOverviewPanelVisuals();
  syncAccountOverviewPanelVisibility();
  void refreshAccountOverviewRemoteSnapshot({ force: true });

  if (accountOverviewRefreshButtonElement instanceof HTMLElement) {
    accountOverviewRefreshButtonElement.addEventListener('click', () => {
      setAccountOverviewPanelVisible(false);
    });
  }
}

function setTreeNextEnrollModalOpen(isOpen) {
  const nextOpen = Boolean(isOpen);
  state.enroll.open = nextOpen;
  if (!(treeNextEnrollModalOverlayElement instanceof HTMLElement)) {
    return;
  }
  syncTreeNextEnrollPanelPosition();
  treeNextEnrollModalOverlayElement.classList.toggle('is-open', nextOpen);
  treeNextEnrollModalOverlayElement.setAttribute('aria-hidden', nextOpen ? 'false' : 'true');
}

function closeTreeNextEnrollModal(options = {}) {
  if (!isTreeNextEnrollModalOpen()) {
    return;
  }

  const {
    restoreFocus = true,
    clearFeedback = true,
    resetForm = false,
    clearPlacementLock = true,
    clearPendingPlacement = true,
  } = options;

  setTreeNextEnrollModalOpen(false);
  state.enroll.submitting = false;
  state.enroll.step = 1;
  if (clearFeedback) {
    clearTreeNextEnrollFeedback();
  }
  clearTreeNextEnrollCardInput();
  closeAllTreeNextEnrollCustomSelects();

  if (resetForm && treeNextEnrollModalForm instanceof HTMLFormElement) {
    treeNextEnrollModalForm.reset();
    if (treeNextEnrollCountryFlagInput instanceof HTMLInputElement) {
      treeNextEnrollCountryFlagInput.value = ENROLL_DEFAULT_COUNTRY_FLAG;
    }
    if (treeNextEnrollPackageInput instanceof HTMLSelectElement) {
      treeNextEnrollPackageInput.value = ENROLL_DEFAULT_PACKAGE_KEY;
    }
    if (treeNextEnrollSpilloverModeInput instanceof HTMLSelectElement) {
      treeNextEnrollSpilloverModeInput.value = isTreeNextEnrollAdminPlacementMode()
        ? ENROLL_SPILLOVER_MODE_SPILLOVER
        : resolveTreeNextEnrollMemberAutoSpilloverMode();
    }
    if (treeNextEnrollBillingCountrySelect instanceof HTMLSelectElement) {
      treeNextEnrollBillingCountrySelect.value = ENROLL_DEFAULT_BILLING_COUNTRY_CODE;
    }
    syncTreeNextEnrollTierFromPackage();
    syncTreeNextEnrollPackagePreview();
    syncTreeNextEnrollSpilloverAvailability();
    syncTreeNextEnrollLegPositionField();
    setTreeNextEnrollPasswordSetupLink('');
  }
  syncTreeNextEnrollCustomSelectsFromNative();
  setTreeNextEnrollStep(1, { focusField: false });

  if (clearPlacementLock) {
    state.enroll.placementLock = null;
  }
  if (clearPendingPlacement) {
    state.enroll.pendingPlacement = null;
  }

  if (
    restoreFocus
    && state.enroll.lastTriggerElement instanceof HTMLElement
    && typeof state.enroll.lastTriggerElement.focus === 'function'
  ) {
    state.enroll.lastTriggerElement.focus({ preventScroll: true });
  }
  state.enroll.lastTriggerElement = null;
}

function openTreeNextEnrollModal(requestDetail = {}) {
  if (!(treeNextEnrollModalForm instanceof HTMLFormElement) || !(treeNextEnrollPlacementLegInput instanceof HTMLInputElement)) {
    return;
  }

  const placementLeg = normalizeBinarySide(requestDetail?.placementLeg) === 'right' ? 'right' : 'left';
  const requestedParentId = safeText(requestDetail?.parentId);
  if (!requestedParentId) {
    setTreeNextEnrollFeedback('Placement context is missing. Select an anticipation node again.', false);
    return;
  }
  const parentId = requestedParentId;

  const parentName = safeText(
    requestDetail?.parentName
    || requestDetail?.parentMemberCode
    || parentId,
  ) || parentId;
  const parentReference = safeText(
    requestDetail?.parentMemberCode
    || requestDetail?.parentUsername
    || parentId,
  ) || parentId;

  state.enroll.lastTriggerElement = document.activeElement instanceof HTMLElement
    ? document.activeElement
    : null;
  state.enroll.pendingPlacement = null;
  state.enroll.placementLock = {
    parentId,
    parentName,
    parentReference,
    placementLeg,
  };

  treeNextEnrollModalForm.reset();
  if (treeNextEnrollCountryFlagInput instanceof HTMLInputElement) {
    treeNextEnrollCountryFlagInput.value = ENROLL_DEFAULT_COUNTRY_FLAG;
  }
  if (treeNextEnrollPackageInput instanceof HTMLSelectElement) {
    treeNextEnrollPackageInput.value = ENROLL_DEFAULT_PACKAGE_KEY;
  }
  if (treeNextEnrollSpilloverModeInput instanceof HTMLSelectElement) {
    treeNextEnrollSpilloverModeInput.value = isTreeNextEnrollAdminPlacementMode()
      ? ENROLL_SPILLOVER_MODE_SPILLOVER
      : resolveTreeNextEnrollMemberAutoSpilloverMode();
  }
  if (treeNextEnrollBillingCountrySelect instanceof HTMLSelectElement) {
    treeNextEnrollBillingCountrySelect.value = ENROLL_DEFAULT_BILLING_COUNTRY_CODE;
  }
  syncTreeNextEnrollTierFromPackage();
  syncTreeNextEnrollPackagePreview();
  syncTreeNextEnrollCustomSelectsFromNative();
  clearTreeNextEnrollFeedback();
  clearTreeNextEnrollCardInput();
  void hydrateTreeNextEnrollBillingCountryOptions();

  treeNextEnrollPlacementLegInput.value = placementLeg;
  if (treeNextEnrollPlacementParentIdInput instanceof HTMLInputElement) {
    treeNextEnrollPlacementParentIdInput.value = parentId;
  }

  if (treeNextEnrollParentInput instanceof HTMLInputElement) {
    treeNextEnrollParentInput.value = parentName;
  }
  syncTreeNextEnrollSpilloverAvailability();
  syncTreeNextEnrollSponsorField();
  syncTreeNextEnrollLegPositionField();
  if (treeNextEnrollThankYouNameElement instanceof HTMLElement) {
    treeNextEnrollThankYouNameElement.textContent = 'New member';
  }
  if (treeNextEnrollThankYouPackageElement instanceof HTMLElement) {
    const packageMeta = resolveEnrollPackageMeta(ENROLL_DEFAULT_PACKAGE_KEY);
    treeNextEnrollThankYouPackageElement.textContent = packageMeta?.label || 'Legacy Builder Package';
  }
  if (treeNextEnrollThankYouCommissionElement instanceof HTMLElement) {
    const tierKey = resolveEnrollFastTrackTierFromPackage(ENROLL_DEFAULT_PACKAGE_KEY);
    treeNextEnrollThankYouCommissionElement.textContent = formatEnrollCurrency(
      resolveEnrollFastTrackBonusAmount(ENROLL_DEFAULT_PACKAGE_KEY, tierKey),
    );
  }
  setTreeNextEnrollPasswordSetupLink('');

  setTreeNextEnrollStep(1, { focusField: false });
  setTreeNextEnrollModalOpen(true);
  window.requestAnimationFrame(() => {
    if (treeNextEnrollEmailInput instanceof HTMLInputElement) {
      treeNextEnrollEmailInput.focus({ preventScroll: true });
    }
  });
  void initializeTreeNextEnrollStripeCard({ silent: true });
}

function resolvePlacementSponsorIdentity(placementLock) {
  const parentNode = resolveNodeById(placementLock?.parentId);
  const sessionUsername = normalizeCredentialValue(
    state.session?.username
    || state.session?.memberUsername
    || '',
  );
  const sponsorUsername = normalizeCredentialValue(
    parentNode?.username
    || sessionUsername
    || 'root.sponsor',
  ) || 'root.sponsor';
  const sponsorName = safeText(
    parentNode?.name
    || resolveSessionDisplayName()
    || parentNode?.username
    || sponsorUsername,
  ) || sponsorUsername;

  return {
    sponsorUsername,
    sponsorName,
  };
}

async function submitTreeNextEnrollmentRequest(payload = {}) {
  const response = await fetch(resolveEnrollRegisteredMembersApi(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
    body: JSON.stringify(payload),
  });

  const responseContentType = safeText(response.headers.get('content-type')).toLowerCase();
  const responsePayload = await response.json().catch(() => null);

  if (!response.ok) {
    const failureMessage = typeof responsePayload?.error === 'string'
      ? responsePayload.error
      : 'Registration request failed.';
    throw new Error(failureMessage);
  }

  const createdMember = responsePayload?.member;
  if (!createdMember || typeof createdMember !== 'object') {
    if (!responseContentType.includes('application/json')) {
      throw new Error('Enrollment API returned a non-JSON response. Restart your local server and retry.');
    }
    throw new Error('Registration completed but response payload is invalid.');
  }

  return createdMember;
}

async function createTreeNextEnrollmentPaymentIntent(payload = {}) {
  const response = await fetch(resolveEnrollRegisteredMembersIntentApi(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
    body: JSON.stringify(payload),
  });

  const responsePayload = await response.json().catch(() => null);
  if (!response.ok) {
    const failureMessage = typeof responsePayload?.error === 'string'
      ? responsePayload.error
      : 'Unable to create Stripe payment intent for enrollment.';
    throw new Error(failureMessage);
  }

  const paymentIntentId = safeText(responsePayload?.paymentIntentId);
  const clientSecret = safeText(responsePayload?.clientSecret);
  if (!paymentIntentId || !clientSecret) {
    throw new Error('Enrollment payment intent response is missing required Stripe fields.');
  }

  return {
    paymentIntentId,
    clientSecret,
    checkout: responsePayload?.checkout && typeof responsePayload.checkout === 'object'
      ? responsePayload.checkout
      : {},
  };
}

async function completeTreeNextEnrollmentPaymentIntent(paymentIntentId) {
  const safePaymentIntentId = safeText(paymentIntentId);
  if (!safePaymentIntentId) {
    throw new Error('Payment intent ID is required to finalize enrollment.');
  }

  const response = await fetch(resolveEnrollRegisteredMembersIntentCompleteApi(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
    body: JSON.stringify({
      paymentIntentId: safePaymentIntentId,
    }),
  });

  const responsePayload = await response.json().catch(() => null);
  if (!response.ok) {
    const failureMessage = typeof responsePayload?.error === 'string'
      ? responsePayload.error
      : 'Unable to finalize enrollment payment.';
    throw new Error(failureMessage);
  }

  const completed = responsePayload?.completed === true;
  const member = responsePayload?.member && typeof responsePayload.member === 'object'
    ? responsePayload.member
    : null;

  return {
    completed,
    member,
    invoice: responsePayload?.invoice && typeof responsePayload.invoice === 'object'
      ? responsePayload.invoice
      : null,
    warning: safeText(responsePayload?.warning),
    paymentIntent: responsePayload?.paymentIntent && typeof responsePayload.paymentIntent === 'object'
      ? responsePayload.paymentIntent
      : null,
  };
}

function resolveUniqueTreeNodeId(baseId) {
  const normalizedBaseId = safeText(baseId).replace(/\s+/g, '-');
  const fallbackBaseId = normalizedBaseId || `n-enroll-${Date.now()}`;
  const existingIds = new Set(state.nodes.map((node) => safeText(node?.id)).filter(Boolean));
  if (!existingIds.has(fallbackBaseId)) {
    return fallbackBaseId;
  }

  let attempt = 2;
  while (attempt < 10000) {
    const candidateId = `${fallbackBaseId}-${attempt}`;
    if (!existingIds.has(candidateId)) {
      return candidateId;
    }
    attempt += 1;
  }

  return `${fallbackBaseId}-${Date.now()}`;
}

function applyTreeNextEnrollmentNode(createdMember, placementLock, packageKey) {
  const parentId = safeText(placementLock?.parentId);
  const placementLeg = normalizeBinarySide(placementLock?.placementLeg) === 'right' ? 'right' : 'left';
  if (!parentId) {
    return {
      success: false,
      error: 'Placement parent is missing.',
    };
  }
  if (!resolveNodeById(parentId)) {
    return {
      success: false,
      error: 'Placement parent no longer exists in the current tree view.',
    };
  }

  const legState = resolveNodeChildLegState(parentId);
  if (placementLeg === 'left' && legState.left) {
    return {
      success: false,
      error: 'Left slot is already filled for this parent.',
    };
  }
  if (placementLeg === 'right' && legState.right) {
    return {
      success: false,
      error: 'Right slot is already filled for this parent.',
    };
  }

  const normalizedPackageKey = normalizeCredentialValue(packageKey || createdMember?.enrollmentPackage);
  const packageMeta = ENROLL_PACKAGE_META[normalizedPackageKey] || ENROLL_PACKAGE_META[ENROLL_DEFAULT_PACKAGE_KEY];
  const nodeId = resolveUniqueTreeNodeId(
    createdMember?.userId
    || createdMember?.id
    || createdMember?.memberUsername
    || createdMember?.email
    || '',
  );
  const displayName = safeText(createdMember?.fullName || createdMember?.name || nodeId) || nodeId;
  const displayUsername = safeText(createdMember?.memberUsername || createdMember?.username || nodeId).replace(/^@+/, '');
  const accountRank = safeText(createdMember?.accountRank || createdMember?.rank || '').trim() || 'Personal';
  const packageBv = Math.max(0, Math.floor(safeNumber(createdMember?.packageBv, packageMeta?.bv || 0)));
  const accountStatus = createdMember?.passwordSetupRequired ? 'Pending' : 'Active';
  const starterPersonalPv = Math.max(0, Math.floor(safeNumber(createdMember?.starterPersonalPv, packageBv)));
  const baselineStarterPersonalPv = Math.max(0, Math.floor(safeNumber(
    createdMember?.serverCutoffBaselineStarterPersonalPv
    ?? createdMember?.server_cutoff_baseline_starter_personal_pv,
    0,
  )));
  const currentPersonalPvBv = Math.max(0, starterPersonalPv - baselineStarterPersonalPv);
  const isSpilloverPlacement = Boolean(createdMember?.isSpillover)
    || normalizeCredentialValue(createdMember?.placementLeg) === 'spillover';
  const sponsorId = resolveTreeNextEnrollmentSponsorNodeId(createdMember, parentId, isSpilloverPlacement);
  const sponsorUsername = safeText(
    createdMember?.sponsorUsername
    || createdMember?.sponsor_username
    || createdMember?.sponsor
    || '',
  ).replace(/^@+/, '');

  state.nodes.push({
    id: nodeId,
    parent: parentId,
    side: placementLeg,
    name: displayName,
    username: displayUsername,
    role: 'Distributor',
    status: accountStatus === 'Pending' ? 'stabilizing' : 'active',
    accountStatus,
    rank: accountRank,
    title: `${accountRank} Builder`,
    badges: [accountRank],
    volume: starterPersonalPv > 0 ? starterPersonalPv : packageBv,
    packageBv,
    starterPersonalPv,
    serverCutoffBaselineStarterPersonalPv: baselineStarterPersonalPv,
    currentPersonalPvBv,
    monthlyPersonalBv: currentPersonalPvBv,
    sponsorId,
    globalSponsorId: sponsorId,
    sponsorUsername,
    sponsorLeg: placementLeg,
    isSpillover: isSpilloverPlacement,
  });

  state.adapter.setNodes(state.nodes);
  rebuildNodeChildLegIndex();
  updateTreeNextLiveSnapshotHash(state.nodes);

  return {
    success: true,
    nodeId,
    parentId,
    placementLeg,
  };
}

function finalizePendingTreeNextEnrollmentPlacement(options = {}) {
  const pendingPlacement = state.enroll?.pendingPlacement;
  if (!pendingPlacement || typeof pendingPlacement !== 'object') {
    return {
      success: false,
      skipped: true,
      error: 'No pending enrollment placement to apply.',
    };
  }

  const applyResult = applyTreeNextEnrollmentNode(
    pendingPlacement.createdMember,
    pendingPlacement.placementLock,
    pendingPlacement.packageKey,
  );
  if (!applyResult.success) {
    return applyResult;
  }

  state.enroll.pendingPlacement = null;

  if (options.animate !== false) {
    startPlacementGrowAnimation(applyResult.nodeId);
  }

  return applyResult;
}

function validateTreeNextEnrollStepOne() {
  const email = safeText(treeNextEnrollEmailInput?.value);
  const memberUsername = safeText(treeNextEnrollUsernameInput?.value).replace(/^@+/, '');
  const firstName = safeText(treeNextEnrollFirstNameInput?.value);
  const lastName = safeText(treeNextEnrollLastNameInput?.value);

  if (!email || !memberUsername || !firstName || !lastName) {
    setTreeNextEnrollFeedback('Email, username, first name, and last name are required.', false);
    if (!email && treeNextEnrollEmailInput instanceof HTMLInputElement) {
      treeNextEnrollEmailInput.focus({ preventScroll: true });
    } else if (!memberUsername && treeNextEnrollUsernameInput instanceof HTMLInputElement) {
      treeNextEnrollUsernameInput.focus({ preventScroll: true });
    } else if (!firstName && treeNextEnrollFirstNameInput instanceof HTMLInputElement) {
      treeNextEnrollFirstNameInput.focus({ preventScroll: true });
    } else if (!lastName && treeNextEnrollLastNameInput instanceof HTMLInputElement) {
      treeNextEnrollLastNameInput.focus({ preventScroll: true });
    }
    return false;
  }

  const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!looksLikeEmail) {
    setTreeNextEnrollFeedback('Enter a valid email address.', false);
    if (treeNextEnrollEmailInput instanceof HTMLInputElement) {
      treeNextEnrollEmailInput.focus({ preventScroll: true });
    }
    return false;
  }
  return true;
}

function validateTreeNextEnrollStepTwo() {
  syncTreeNextEnrollSpilloverAvailability();
  const packageKey = resolveTreeNextEnrollPackageKey(
    treeNextEnrollPackageInput?.value || ENROLL_DEFAULT_PACKAGE_KEY,
  );
  if (!ENROLL_PACKAGE_META[packageKey]) {
    setTreeNextEnrollFeedback('Select a valid enrollment package.', false);
    if (treeNextEnrollPackageInput instanceof HTMLSelectElement) {
      treeNextEnrollPackageInput.focus({ preventScroll: true });
    }
    return false;
  }
  if (!isTreeNextEnrollPaidPackage(packageKey)) {
    setTreeNextEnrollFeedback('Only paid enrollment packages are allowed in this panel.', false);
    if (treeNextEnrollPackageInput instanceof HTMLSelectElement) {
      treeNextEnrollPackageInput.value = ENROLL_DEFAULT_PACKAGE_KEY;
      treeNextEnrollPackageInput.focus({ preventScroll: true });
    }
    syncTreeNextEnrollTierFromPackage();
    syncTreeNextEnrollPackagePreview();
    syncTreeNextEnrollCustomSelectById('tree-next-enroll-package');
    return false;
  }
  if (isTreeNextEnrollAdminPlacementMode() && treeNextEnrollSpilloverModeInput instanceof HTMLSelectElement) {
    const spilloverMode = normalizeCredentialValue(treeNextEnrollSpilloverModeInput.value || '');
    if (spilloverMode !== ENROLL_SPILLOVER_MODE_DIRECT && spilloverMode !== ENROLL_SPILLOVER_MODE_SPILLOVER) {
      setTreeNextEnrollFeedback('Select whether this registration should use spillover placement.', false);
      treeNextEnrollSpilloverModeInput.focus({ preventScroll: true });
      return false;
    }
  }
  return true;
}

async function handleTreeNextEnrollModalSubmit(event) {
  event.preventDefault();
  clearTreeNextEnrollFeedback();

  if (resolveTreeNextEnrollStep() !== 3) {
    return;
  }
  if (!(treeNextEnrollModalForm instanceof HTMLFormElement)) {
    return;
  }

  const placementLock = state.enroll?.placementLock;
  if (!placementLock) {
    setTreeNextEnrollFeedback('Placement context is missing. Select an anticipation node again.', false);
    return;
  }

  const legState = resolveNodeChildLegState(placementLock.parentId);
  if (
    (placementLock.placementLeg === 'left' && legState.left)
    || (placementLock.placementLeg === 'right' && legState.right)
  ) {
    setTreeNextEnrollFeedback('This slot is no longer available. Select another anticipation node.', false);
    return;
  }

  if (!validateTreeNextEnrollStepOne() || !validateTreeNextEnrollStepTwo()) {
    return;
  }

  const stripeReady = await initializeTreeNextEnrollStripeCard({ silent: true });
  if (!stripeReady) {
    setTreeNextEnrollFeedback('Stripe card fields are not ready yet.', false);
    return;
  }

  const cardholderName = safeText(treeNextEnrollNameOnCardInput?.value);
  const billingAddress = safeText(treeNextEnrollBillingAddressInput?.value);
  const billingCity = safeText(treeNextEnrollBillingCityInput?.value);
  const billingState = safeText(treeNextEnrollBillingStateInput?.value);
  const billingPostalCode = safeText(treeNextEnrollBillingPostalCodeInput?.value);
  const billingCountryValue = safeText(treeNextEnrollBillingCountrySelect?.value);
  const billingCountryLabel = safeText(
    treeNextEnrollBillingCountrySelect instanceof HTMLSelectElement
      ? treeNextEnrollBillingCountrySelect.selectedOptions?.[0]?.textContent
      : '',
  );
  const billingCountryCode = resolveTreeNextEnrollStripeBillingCountryCode(
    billingCountryValue || billingCountryLabel,
  );
  if (!cardholderName) {
    setTreeNextEnrollFeedback('Cardholder name is required before checkout.', false);
    if (treeNextEnrollNameOnCardInput instanceof HTMLInputElement) {
      treeNextEnrollNameOnCardInput.focus({ preventScroll: true });
    }
    return;
  }
  if (!billingAddress || !billingCity || !billingState || !billingPostalCode || !billingCountryCode) {
    setTreeNextEnrollFeedback('Billing address, city, state, ZIP, and country are required.', false);
    if (!billingAddress && treeNextEnrollBillingAddressInput instanceof HTMLInputElement) {
      treeNextEnrollBillingAddressInput.focus({ preventScroll: true });
    } else if (!billingCity && treeNextEnrollBillingCityInput instanceof HTMLInputElement) {
      treeNextEnrollBillingCityInput.focus({ preventScroll: true });
    } else if (!billingState && treeNextEnrollBillingStateInput instanceof HTMLInputElement) {
      treeNextEnrollBillingStateInput.focus({ preventScroll: true });
    } else if (!billingPostalCode && treeNextEnrollBillingPostalCodeInput instanceof HTMLInputElement) {
      treeNextEnrollBillingPostalCodeInput.focus({ preventScroll: true });
    } else if (!billingCountryCode) {
      const billingCountryEntry = treeNextEnrollCustomSelectByNativeId.get('tree-next-enroll-billing-country');
      if (billingCountryEntry?.trigger instanceof HTMLButtonElement) {
        billingCountryEntry.trigger.focus({ preventScroll: true });
      } else if (treeNextEnrollBillingCountrySelect instanceof HTMLSelectElement) {
        treeNextEnrollBillingCountrySelect.focus({ preventScroll: true });
      }
    }
    return;
  }
  if (!isTreeNextEnrollStripeCardComplete || !isTreeNextEnrollStripeCardExpiryComplete || !isTreeNextEnrollStripeCardCvcComplete) {
    setTreeNextEnrollCardError('Please enter a complete card number, expiry date, and CVC.');
    setTreeNextEnrollFeedback('Please enter a complete card number, expiry date, and CVC.', false);
    return;
  }

  const email = safeText(treeNextEnrollEmailInput?.value);
  const memberUsername = safeText(treeNextEnrollUsernameInput?.value).replace(/^@+/, '');
  const firstName = safeText(treeNextEnrollFirstNameInput?.value);
  const lastName = safeText(treeNextEnrollLastNameInput?.value);
  const fullName = safeText(`${firstName} ${lastName}`);
  const countryFlag = normalizeCredentialValue(treeNextEnrollCountryFlagInput?.value || ENROLL_DEFAULT_COUNTRY_FLAG);
  const packageKey = resolveTreeNextEnrollPackageKey(
    treeNextEnrollPackageInput?.value || ENROLL_DEFAULT_PACKAGE_KEY,
  );
  const tierFromForm = normalizeCredentialValue(treeNextEnrollFastTrackTierInput?.value || '');
  const tierKey = tierFromForm || resolveEnrollFastTrackTierFromPackage(packageKey);
  const placementSide = resolveTreeNextEnrollPlacementSideFromLock(placementLock);
  const spilloverMode = resolveTreeNextEnrollSpilloverModeValue();
  const isAdminPlacementMode = isTreeNextEnrollAdminPlacementMode();
  const isSpilloverPlacement = spilloverMode === ENROLL_SPILLOVER_MODE_SPILLOVER;
  const placementLeg = isSpilloverPlacement ? 'spillover' : placementSide;
  const spilloverPlacementSide = placementSide;
  const spilloverParentMode = isSpilloverPlacement
    ? (isAdminPlacementMode ? 'manual' : 'auto')
    : 'auto';
  const spilloverParentReference = (isSpilloverPlacement && isAdminPlacementMode)
    ? safeText(placementLock.parentReference || placementLock.parentId)
    : '';

  if (!countryFlag) {
    setTreeNextEnrollFeedback('Country flag is required.', false);
    return;
  }
  if (!isTreeNextEnrollPaidPackage(packageKey)) {
    setTreeNextEnrollFeedback('Only paid enrollment packages are allowed in this panel.', false);
    return;
  }
  if (!ENROLL_FAST_TRACK_TIER_LABEL_BY_KEY[tierKey]) {
    setTreeNextEnrollFeedback('Fast Track tier is invalid for this package.', false);
    return;
  }

  const { sponsorUsername, sponsorName } = resolveTreeNextEnrollSponsorIdentityForMode(placementLock);
  const submitLabel = treeNextEnrollModalSubmitButton instanceof HTMLButtonElement
    ? treeNextEnrollModalSubmitButton.textContent || 'Register and Pay'
    : 'Register and Pay';
  state.enroll.submitting = true;
  if (treeNextEnrollModalSubmitButton instanceof HTMLButtonElement) {
    treeNextEnrollModalSubmitButton.disabled = true;
    treeNextEnrollModalSubmitButton.textContent = 'Registering...';
  }

  try {
    const stripeBillingAddress = {
      line1: billingAddress,
      city: billingCity,
      state: billingState,
      postal_code: billingPostalCode,
    };
    if (billingCountryCode) {
      stripeBillingAddress.country = billingCountryCode;
    }

    state.enroll.pendingPlacement = null;
    setTreeNextEnrollFeedback('Preparing secure payment...', 'neutral', { loading: true });
    const paymentIntentResult = await createTreeNextEnrollmentPaymentIntent({
      fullName,
      email,
      memberUsername,
      phone: '',
      notes: '',
      countryFlag,
      placementLeg,
      spilloverPlacementSide,
      spilloverParentMode,
      spilloverParentReference,
      enrollmentPackage: packageKey,
      fastTrackTier: tierKey,
      sponsorUsername,
      sponsorName,
      billingAddress,
      billingCity,
      billingState,
      billingPostalCode,
      billingCountry: billingCountryLabel || billingCountryCode,
      billingCountryCode,
    });

    if (!(treeNextEnrollStripeClient && treeNextEnrollStripeCardNumber)) {
      throw new Error('Stripe card fields are not ready yet.');
    }
    clearTreeNextEnrollCardError();
    if (treeNextEnrollModalSubmitButton instanceof HTMLButtonElement) {
      treeNextEnrollModalSubmitButton.textContent = 'Confirming card...';
    }
    setTreeNextEnrollFeedback('Confirming your payment with Stripe...', 'neutral', { loading: true });

    const { error: stripeConfirmError, paymentIntent } = await treeNextEnrollStripeClient.confirmCardPayment(
      paymentIntentResult.clientSecret,
      {
        payment_method: {
          card: treeNextEnrollStripeCardNumber,
          billing_details: {
            name: cardholderName,
            email,
            address: stripeBillingAddress,
          },
        },
      },
    );
    if (stripeConfirmError) {
      const stripeErrorMessage = safeText(stripeConfirmError?.message) || 'Payment could not be confirmed.';
      setTreeNextEnrollCardError(stripeErrorMessage);
      throw new Error(stripeErrorMessage);
    }

    const finalizedPaymentIntentId = safeText(paymentIntent?.id || paymentIntentResult.paymentIntentId);
    if (!finalizedPaymentIntentId) {
      throw new Error('Payment was submitted, but no Stripe payment reference was returned.');
    }

    if (treeNextEnrollModalSubmitButton instanceof HTMLButtonElement) {
      treeNextEnrollModalSubmitButton.textContent = 'Finalizing enrollment...';
    }
    setTreeNextEnrollFeedback('Finalizing enrollment...', 'neutral', { loading: true });

    let completionResult = await completeTreeNextEnrollmentPaymentIntent(finalizedPaymentIntentId);
    let completionAttempts = 0;
    while (!completionResult.completed && completionAttempts < 5) {
      await new Promise((resolve) => window.setTimeout(resolve, 700));
      completionAttempts += 1;
      completionResult = await completeTreeNextEnrollmentPaymentIntent(finalizedPaymentIntentId);
    }
    if (!completionResult.completed || !completionResult.member) {
      throw new Error('Payment captured, but enrollment is still processing. Please retry in a moment.');
    }

    const createdMember = completionResult.member;
    const enrolledName = safeText(createdMember?.fullName || fullName) || 'Member';
    const packageLabel = safeText(
      createdMember?.enrollmentPackageLabel
      || resolveEnrollPackageMeta(packageKey)?.label
      || 'Legacy Builder Package',
    ) || 'Legacy Builder Package';
    const effectiveTier = normalizeCredentialValue(createdMember?.fastTrackTier || tierKey);
    const fallbackBonus = resolveEnrollFastTrackBonusAmount(packageKey, effectiveTier);
    const commissionAmount = Math.max(0, safeNumber(createdMember?.fastTrackBonusAmount, fallbackBonus));
    const placementSideLabel = spilloverPlacementSide.toUpperCase();
    const placementSummary = isSpilloverPlacement
      ? `SPILLOVER ${placementSideLabel}`
      : `${placementSideLabel} leg`;
    const successFeedback = `${enrolledName} enrolled on ${placementSummary} under ${placementLock.parentName}.`;
    const finalFeedback = completionResult.warning
      ? `${successFeedback} ${completionResult.warning}`
      : successFeedback;
    setTreeNextEnrollFeedback(finalFeedback, true);
    showTreeNextEnrollThankYouStep({
      enrolledName,
      packageLabel,
      commissionAmount,
      passwordSetupLink: createdMember?.passwordSetupLink,
    });
    state.enroll.pendingPlacement = {
      createdMember,
      placementLock: {
        ...placementLock,
      },
      packageKey,
    };
  } catch (error) {
    const fallbackMessage = error instanceof Error
      ? error.message
      : 'Unable to register member right now.';
    setTreeNextEnrollFeedback(fallbackMessage, false);
  } finally {
    state.enroll.submitting = false;
    if (treeNextEnrollModalSubmitButton instanceof HTMLButtonElement) {
      treeNextEnrollModalSubmitButton.disabled = false;
      treeNextEnrollModalSubmitButton.textContent = submitLabel;
    }
  }
}

function initTreeNextEnrollModal() {
  if (!(treeNextEnrollModalForm instanceof HTMLFormElement)) {
    return;
  }

  setTreeNextEnrollModalOpen(false);
  clearTreeNextEnrollFeedback();
  clearTreeNextEnrollCardError();
  initTreeNextEnrollCustomSelects();
  applyTreeNextEnrollBillingCountryOptions(ENROLL_BILLING_COUNTRY_FALLBACK_OPTIONS, {
    preserveSelection: true,
  });
  void hydrateTreeNextEnrollBillingCountryOptions();

  if (treeNextEnrollCountryFlagInput instanceof HTMLInputElement) {
    treeNextEnrollCountryFlagInput.value = ENROLL_DEFAULT_COUNTRY_FLAG;
  }
  if (treeNextEnrollPackageInput instanceof HTMLSelectElement) {
    treeNextEnrollPackageInput.value = ENROLL_DEFAULT_PACKAGE_KEY;
    treeNextEnrollPackageInput.addEventListener('change', () => {
      syncTreeNextEnrollTierFromPackage();
      syncTreeNextEnrollPackagePreview();
      clearTreeNextEnrollFeedback();
    });
  }
  if (treeNextEnrollSpilloverModeInput instanceof HTMLSelectElement) {
    treeNextEnrollSpilloverModeInput.value = isTreeNextEnrollAdminPlacementMode()
      ? ENROLL_SPILLOVER_MODE_SPILLOVER
      : resolveTreeNextEnrollMemberAutoSpilloverMode();
    treeNextEnrollSpilloverModeInput.addEventListener('change', () => {
      if (!isTreeNextEnrollAdminPlacementMode()) {
        treeNextEnrollSpilloverModeInput.value = resolveTreeNextEnrollMemberAutoSpilloverMode();
      }
      syncTreeNextEnrollLegPositionField();
      syncTreeNextEnrollSponsorField();
      clearTreeNextEnrollFeedback();
    });
  }
  if (treeNextEnrollBillingCountrySelect instanceof HTMLSelectElement) {
    treeNextEnrollBillingCountrySelect.value = ENROLL_DEFAULT_BILLING_COUNTRY_CODE;
    treeNextEnrollBillingCountrySelect.addEventListener('change', () => {
      clearTreeNextEnrollFeedback();
    });
  }
  syncTreeNextEnrollTierFromPackage();
  syncTreeNextEnrollPackagePreview();
  syncTreeNextEnrollSpilloverAvailability();
  syncTreeNextEnrollLegPositionField();
  syncTreeNextEnrollSponsorField();
  syncTreeNextEnrollCustomSelectsFromNative();
  setTreeNextEnrollStep(1, { focusField: false });
  setTreeNextEnrollPasswordSetupLink('');

  if (treeNextEnrollModalDismissButton instanceof HTMLButtonElement) {
    treeNextEnrollModalDismissButton.addEventListener('click', () => {
      closeTreeNextEnrollModal({
        restoreFocus: true,
        clearFeedback: true,
        resetForm: true,
        clearPlacementLock: true,
      });
    });
  }
  if (treeNextEnrollModalDoneButton instanceof HTMLButtonElement) {
    treeNextEnrollModalDoneButton.addEventListener('click', () => {
      const applyResult = finalizePendingTreeNextEnrollmentPlacement({ animate: false });
      if (!applyResult.success && !applyResult.skipped) {
        setTreeNextEnrollFeedback(`Member created, but tree update failed: ${applyResult.error}`, false);
        return;
      }
      closeTreeNextEnrollModal({
        restoreFocus: false,
        clearFeedback: true,
        resetForm: true,
        clearPlacementLock: true,
        clearPendingPlacement: true,
      });
      if (applyResult.success) {
        playEnrollmentPlacementReveal({
          nodeId: applyResult.nodeId,
          parentId: applyResult.parentId,
          placementLeg: applyResult.placementLeg,
        });
      }
    });
  }
  if (treeNextEnrollPasswordSetupOpenButton instanceof HTMLButtonElement) {
    treeNextEnrollPasswordSetupOpenButton.addEventListener('click', () => {
      openTreeNextEnrollPasswordSetupLink();
    });
  }
  if (treeNextEnrollPasswordSetupCopyButton instanceof HTMLButtonElement) {
    treeNextEnrollPasswordSetupCopyButton.addEventListener('click', () => {
      void copyTreeNextEnrollPasswordSetupLink();
    });
  }
  if (treeNextEnrollPasswordSetupLinkInput instanceof HTMLInputElement) {
    treeNextEnrollPasswordSetupLinkInput.addEventListener('focus', () => {
      const safeLink = resolveTreeNextEnrollPasswordSetupLinkFromInput();
      if (!safeLink) {
        return;
      }
      treeNextEnrollPasswordSetupLinkInput.select();
    });
  }
  if (treeNextEnrollStepOneNextButton instanceof HTMLButtonElement) {
    treeNextEnrollStepOneNextButton.addEventListener('click', () => {
      clearTreeNextEnrollFeedback();
      if (!validateTreeNextEnrollStepOne()) {
        return;
      }
      setTreeNextEnrollStep(2, { focusField: true });
    });
  }
  if (treeNextEnrollStepTwoPreviousButton instanceof HTMLButtonElement) {
    treeNextEnrollStepTwoPreviousButton.addEventListener('click', () => {
      clearTreeNextEnrollFeedback();
      setTreeNextEnrollStep(1, { focusField: true });
    });
  }
  if (treeNextEnrollStepTwoNextButton instanceof HTMLButtonElement) {
    treeNextEnrollStepTwoNextButton.addEventListener('click', async () => {
      clearTreeNextEnrollFeedback();
      if (!validateTreeNextEnrollStepTwo()) {
        return;
      }
      setTreeNextEnrollStep(3, { focusField: true });
      await initializeTreeNextEnrollStripeCard({ silent: true });
    });
  }
  if (treeNextEnrollStepThreePreviousButton instanceof HTMLButtonElement) {
    treeNextEnrollStepThreePreviousButton.addEventListener('click', () => {
      clearTreeNextEnrollFeedback();
      setTreeNextEnrollStep(2, { focusField: true });
    });
  }

  treeNextEnrollModalForm.addEventListener('keydown', (event) => {
    const key = safeText(event?.key).toLowerCase();
    if (key !== 'enter' || event.shiftKey) {
      return;
    }
    if (event.target instanceof HTMLTextAreaElement) {
      return;
    }
    const currentStep = resolveTreeNextEnrollStep();
    if (currentStep === 1) {
      event.preventDefault();
      if (validateTreeNextEnrollStepOne()) {
        setTreeNextEnrollStep(2, { focusField: true });
      }
      return;
    }
    if (currentStep === 2) {
      event.preventDefault();
      if (validateTreeNextEnrollStepTwo()) {
        setTreeNextEnrollStep(3, { focusField: true });
      }
    }
  });

  treeNextEnrollModalForm.addEventListener('submit', handleTreeNextEnrollModalSubmit);
  window.addEventListener('binary-tree-enroll-member-request', (event) => {
    openTreeNextEnrollModal(event?.detail || {});
  });
}

function resolveNodeReferenceLabel(nodeId, fallback = '-') {
  const node = resolveNodeById(nodeId);
  if (!node) {
    return fallback;
  }
  const name = safeText(node.name || node.id) || fallback;
  const username = safeText(node.username || '');
  if (username) {
    return `${name} (@${username})`;
  }
  return name;
}

function resolveNodeLegVolumes(nodeId) {
  const globalMeta = resolveGlobalNodeMetrics(nodeId);
  const selectedNode = globalMeta?.node || null;
  const personalVolume = Math.max(0, Math.floor(safeNumber(selectedNode?.volume, 0)));
  if (!globalMeta) {
    return {
      personalVolume,
      leftVolume: 0,
      rightVolume: 0,
      totalVolume: personalVolume,
    };
  }

  const selectedPath = safeText(globalMeta.globalPath).toUpperCase();
  const leftPrefix = `${selectedPath}L`;
  const rightPrefix = `${selectedPath}R`;
  const globalNodes = state.adapter.resolveVisibleNodes(getGlobalUniverseOptions());
  let leftVolume = 0;
  let rightVolume = 0;

  for (const candidateNode of globalNodes) {
    const candidatePath = safeText(candidateNode?.path).toUpperCase();
    const candidateVolume = Math.max(0, Math.floor(safeNumber(candidateNode?.volume, 0)));
    if (leftPrefix && candidatePath.startsWith(leftPrefix)) {
      leftVolume += candidateVolume;
      continue;
    }
    if (rightPrefix && candidatePath.startsWith(rightPrefix)) {
      rightVolume += candidateVolume;
    }
  }

  return {
    personalVolume,
    leftVolume,
    rightVolume,
    totalVolume: personalVolume + leftVolume + rightVolume,
  };
}

function resolvePinnedPlaces(limit = 8) {
  const safeLimit = Math.max(1, Math.floor(safeNumber(limit, 8)));
  const favoritesState = getSideNavFavoritesState();
  const pinnedIds = Array.isArray(state.pinnedNodeIds)
    ? state.pinnedNodeIds.slice(0, safeLimit)
    : [];
  const cacheKey = pinnedIds.join('|');
  if (
    favoritesState.placesCacheKey === cacheKey
    && favoritesState.placesCacheLimit === safeLimit
    && Array.isArray(favoritesState.placesCache)
  ) {
    return favoritesState.placesCache;
  }

  const places = pinnedIds.map((nodeId) => {
    const node = resolveNodeById(nodeId);
    const volumes = resolveNodeLegVolumes(nodeId);
    return {
      key: nodeId,
      nodeId,
      label: truncateText(safeText(node?.name || nodeId), 18),
      initials: resolveInitials(safeText(node?.name || nodeId)),
      subtitle: formatCompactVolumeValue(volumes.totalVolume),
    };
  });

  favoritesState.placesCacheKey = cacheKey;
  favoritesState.placesCacheLimit = safeLimit;
  favoritesState.placesCache = places;
  return places;
}

function formatCutoffHourMinute(hour24, minute) {
  const normalizedHour24 = clamp(Number.isFinite(hour24) ? hour24 : 0, 0, 23);
  const normalizedMinute = clamp(Number.isFinite(minute) ? minute : 0, 0, 59);
  const period = normalizedHour24 >= 12 ? 'PM' : 'AM';
  const hour12 = normalizedHour24 % 12 || 12;
  return `${hour12}:${String(normalizedMinute).padStart(2, '0')} ${period}`;
}

function getTimeZoneShortLabel(timeZone) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date());
    return parts.find((part) => part.type === 'timeZoneName')?.value || 'PT';
  } catch {
    return 'PT';
  }
}

function resolveNextServerCutoffDate(nowDate = new Date()) {
  const now = nowDate instanceof Date ? nowDate : new Date();
  const targetWeekday = SERVER_CUTOFF_WEEKDAY;
  for (let dayOffset = 0; dayOffset <= 8; dayOffset += 1) {
    const candidate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + dayOffset,
      SERVER_CUTOFF_HOUR,
      SERVER_CUTOFF_MINUTE,
      0,
      0,
    );
    if (candidate.getDay() !== targetWeekday) {
      continue;
    }
    if (candidate.getTime() <= now.getTime()) {
      continue;
    }
    return candidate;
  }
  return new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
}

function formatCountdown(remainingMs) {
  const totalSeconds = Math.max(0, Math.floor(safeNumber(remainingMs, 0) / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (days > 0) {
    return `${days}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;
  }
  return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
}

function resolveServerCutoffSnapshot(nowDate = new Date()) {
  const now = nowDate instanceof Date ? nowDate : new Date();
  const nextCutoff = resolveNextServerCutoffDate(now);
  const timeZoneShort = getTimeZoneShortLabel(SERVER_CUTOFF_TIMEZONE);
  const cutoffWeekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const cutoffWeekday = cutoffWeekdays[SERVER_CUTOFF_WEEKDAY] || 'Sat';
  const cutoffTimeLabel = formatCutoffHourMinute(SERVER_CUTOFF_HOUR, SERVER_CUTOFF_MINUTE);
  let serverTimeLabel = now.toLocaleString();
  try {
    serverTimeLabel = new Intl.DateTimeFormat('en-US', {
      timeZone: SERVER_CUTOFF_TIMEZONE,
      weekday: 'short',
      month: 'short',
      day: '2-digit',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZoneName: 'short',
    }).format(now);
  } catch {
    // Keep local fallback label.
  }

  return {
    serverTimeLabel,
    cutoffLabel: `Cut-off ${cutoffWeekday} ${cutoffTimeLabel} ${timeZoneShort}`,
    countdownLabel: formatCountdown(nextCutoff.getTime() - now.getTime()),
  };
}

function hashUnit(value) {
  const text = safeText(value);
  if (!text) {
    return 0;
  }
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
}

function resolveDepthRevealExtraDelay(depth = 0, key = '') {
  const safeDepth = Math.max(0, Math.floor(safeNumber(depth, 0)));
  if (safeDepth <= 2) {
    return 0;
  }
  const spread = Math.min(
    STARTUP_REVEAL_DEPTH_JITTER_CAP_MS,
    Math.max(0, safeDepth - 2) * STARTUP_REVEAL_DEPTH_JITTER_BASE_MS,
  );
  if (!spread) {
    return 0;
  }
  return hashUnit(key) * spread;
}

function sanitizeTrackpadZoomSensitivity(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_TRACKPAD_ZOOM_SENSITIVITY;
  }
  return clamp(parsed, MIN_TRACKPAD_ZOOM_SENSITIVITY, MAX_TRACKPAD_ZOOM_SENSITIVITY);
}

function resolveSessionUserId(sessionInput = state.session) {
  const session = sessionInput && typeof sessionInput === 'object' ? sessionInput : null;
  const candidate = safeText(
    session?.id
    || session?.userId
    || session?.memberId
    || session?.member_id
    || session?.username
    || session?.email
    || 'member'
  );
  return candidate || 'member';
}

function consumeMockFirstTimeLaunchOverride() {
  if (state.source !== 'member') {
    return false;
  }
  if (safeText(state.engineMode?.mode) !== 'mock-js') {
    return false;
  }
  if (state.launchState?.firstTime === true) {
    return false;
  }

  const sessionUserId = resolveSessionUserId();
  const consumedKey = `${MOCK_FIRST_TIME_OVERRIDE_STORAGE_KEY}:${sessionUserId}`;
  try {
    const consumed = safeText(window.localStorage?.getItem(consumedKey));
    if (consumed === '1') {
      return false;
    }
    window.localStorage?.setItem(consumedKey, '1');
  } catch {
    // Ignore local-storage failures in test override flow.
  }

  state.launchState = createDefaultLaunchState({
    firstTime: true,
    source: 'mock-first-time-override',
    checkedAt: new Date().toISOString(),
  });
  return true;
}

function clearMockFirstTimeLaunchOverrideMarker() {
  const sessionUserId = resolveSessionUserId();
  if (!sessionUserId) {
    return;
  }
  const consumedKey = `${MOCK_FIRST_TIME_OVERRIDE_STORAGE_KEY}:${sessionUserId}`;
  try {
    window.localStorage?.removeItem(consumedKey);
  } catch {
    // Ignore local-storage failures in test override flow.
  }
}

function isLikelyTrackpadWheelEvent(event) {
  if (!event) {
    return false;
  }
  const wheelDeltaPixelMode = typeof WheelEvent === 'function'
    ? WheelEvent.DOM_DELTA_PIXEL
    : 0;
  if (event.deltaMode !== wheelDeltaPixelMode) {
    return false;
  }

  const absDeltaX = Math.abs(safeNumber(event.deltaX, 0));
  const absDeltaY = Math.abs(safeNumber(event.deltaY, 0));
  if (absDeltaX > 0) {
    return true;
  }
  if (absDeltaY === 0) {
    return false;
  }
  if (!Number.isInteger(absDeltaY)) {
    return true;
  }
  if (absDeltaY < 16) {
    return true;
  }
  return absDeltaY % 120 !== 0 && absDeltaY % 100 !== 0;
}

function isManualWheelZoomModifierPressed(event) {
  if (!event) {
    return false;
  }
  if (isMacPlatform) {
    return Boolean(event.metaKey) && !event.ctrlKey;
  }
  return Boolean(event.ctrlKey);
}

function resolveSessionDisplayName() {
  const session = state.session && typeof state.session === 'object' ? state.session : null;
  const firstName = safeText(session?.firstName || session?.first_name || session?.givenName || session?.given_name);
  const lastName = safeText(session?.lastName || session?.last_name || session?.familyName || session?.family_name);
  const combinedName = safeText(`${firstName} ${lastName}`);
  const explicitName = safeText(session?.name || session?.fullName || session?.displayName);
  if (explicitName) {
    return explicitName;
  }
  if (combinedName) {
    return combinedName;
  }
  return state.source === 'admin' ? 'Admin' : 'Member';
}

function resolveSessionDisplayEmail() {
  const session = state.session && typeof state.session === 'object' ? state.session : null;
  const email = safeText(session?.email || session?.userEmail || session?.username || session?.login || '');
  if (email) {
    return email;
  }
  return state.source === 'admin' ? 'admin@example.com' : 'member@example.com';
}

function normalizeRgbTriplet(red, green, blue) {
  return [
    clamp(Math.round(safeNumber(red, 0)), 0, 255),
    clamp(Math.round(safeNumber(green, 0)), 0, 255),
    clamp(Math.round(safeNumber(blue, 0)), 0, 255),
  ];
}

function parseHexColorTriplet(rawValue) {
  const value = safeText(rawValue).replace(/^#/, '');
  if (!value) {
    return null;
  }
  if (/^[0-9a-f]{3}$/i.test(value)) {
    const expanded = value.split('').map((part) => `${part}${part}`).join('');
    return normalizeRgbTriplet(
      Number.parseInt(expanded.slice(0, 2), 16),
      Number.parseInt(expanded.slice(2, 4), 16),
      Number.parseInt(expanded.slice(4, 6), 16),
    );
  }
  if (/^[0-9a-f]{6}$/i.test(value)) {
    return normalizeRgbTriplet(
      Number.parseInt(value.slice(0, 2), 16),
      Number.parseInt(value.slice(2, 4), 16),
      Number.parseInt(value.slice(4, 6), 16),
    );
  }
  return null;
}

function parseRgbColorTriplet(rawValue) {
  const match = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*[\d.]+\s*)?\)$/i.exec(safeText(rawValue));
  if (!match) {
    return null;
  }
  return normalizeRgbTriplet(match[1], match[2], match[3]);
}

function buildAvatarPaletteFromColorTriplet(rgbTriplet) {
  const [baseRed, baseGreen, baseBlue] = normalizeRgbTriplet(
    rgbTriplet?.[0],
    rgbTriplet?.[1],
    rgbTriplet?.[2],
  );
  const brighten = (value, amount) => Math.round(value + ((255 - value) * amount));
  const darken = (value, amount) => Math.round(value * (1 - amount));
  return {
    light: normalizeRgbTriplet(
      brighten(baseRed, 0.34),
      brighten(baseGreen, 0.34),
      brighten(baseBlue, 0.34),
    ),
    mid: normalizeRgbTriplet(baseRed, baseGreen, baseBlue),
    dark: normalizeRgbTriplet(
      darken(baseRed, 0.3),
      darken(baseGreen, 0.3),
      darken(baseBlue, 0.3),
    ),
  };
}

function isAvatarPaletteRecord(palette) {
  if (!palette || typeof palette !== 'object') {
    return false;
  }
  const groups = [palette.light, palette.mid, palette.dark];
  return groups.every((group) => (
    Array.isArray(group)
    && group.length >= 3
    && group.slice(0, 3).every((value) => Number.isFinite(Number(value)))
  ));
}

function resolveAvatarColorTripletFromRecord(recordInput = null) {
  const record = recordInput && typeof recordInput === 'object' ? recordInput : null;
  if (!record) {
    return null;
  }

  const rgbArrayCandidates = [
    record.avatarColorRgb,
    record.avatar_color_rgb,
    record.profileColorRgb,
    record.profile_color_rgb,
    record.themeColorRgb,
    record.theme_color_rgb,
    record.brandColorRgb,
    record.brand_color_rgb,
    record.colorRgb,
    record.color_rgb,
  ];
  for (const candidate of rgbArrayCandidates) {
    if (Array.isArray(candidate) && candidate.length >= 3) {
      return normalizeRgbTriplet(candidate[0], candidate[1], candidate[2]);
    }
  }

  const rgbObjectCandidates = [
    record.avatarColor,
    record.avatar_color,
    record.profileColor,
    record.profile_color,
    record.themeColor,
    record.theme_color,
    record.brandColor,
    record.brand_color,
    record.color,
  ];
  for (const candidate of rgbObjectCandidates) {
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
      continue;
    }
    const red = candidate.r ?? candidate.red;
    const green = candidate.g ?? candidate.green;
    const blue = candidate.b ?? candidate.blue;
    if ([red, green, blue].every((value) => Number.isFinite(Number(value)))) {
      return normalizeRgbTriplet(red, green, blue);
    }
  }

  const colorStringCandidates = [
    record.avatarColor,
    record.avatar_color,
    record.avatarColorHex,
    record.avatar_color_hex,
    record.profileColor,
    record.profile_color,
    record.profileColorHex,
    record.profile_color_hex,
    record.themeColor,
    record.theme_color,
    record.brandColor,
    record.brand_color,
    record.color,
  ];
  for (const candidate of colorStringCandidates) {
    const rawColor = safeText(candidate);
    if (!rawColor) {
      continue;
    }
    const parsedHex = parseHexColorTriplet(rawColor);
    if (parsedHex) {
      return parsedHex;
    }
    const parsedRgb = parseRgbColorTriplet(rawColor);
    if (parsedRgb) {
      return parsedRgb;
    }
  }

  return null;
}

function resolveAvatarPaletteFromRecord(recordInput = null) {
  const record = recordInput && typeof recordInput === 'object' ? recordInput : null;
  if (!record) {
    return null;
  }
  const explicitPalette = (
    record.avatarPalette
    || record.avatar_palette
    || record.profilePalette
    || record.profile_palette
  );
  if (!isAvatarPaletteRecord(explicitPalette)) {
    return null;
  }
  return {
    light: normalizeRgbTriplet(explicitPalette.light[0], explicitPalette.light[1], explicitPalette.light[2]),
    mid: normalizeRgbTriplet(explicitPalette.mid[0], explicitPalette.mid[1], explicitPalette.mid[2]),
    dark: normalizeRgbTriplet(explicitPalette.dark[0], explicitPalette.dark[1], explicitPalette.dark[2]),
  };
}

function resolveSessionAvatarColorTriplet(sessionInput = state.session) {
  return resolveAvatarColorTripletFromRecord(sessionInput);
}

function resolveSessionAvatarSeed(sessionInput = state.session) {
  const session = sessionInput && typeof sessionInput === 'object' ? sessionInput : null;
  const explicitSeed = safeText(session?.avatarSeed || session?.avatar_seed || session?.profileSeed || session?.profile_seed);
  if (explicitSeed) {
    return explicitSeed;
  }
  return resolveSessionUserId(sessionInput);
}

function resolveSessionAvatarPalette(sessionInput = state.session) {
  const explicitPalette = resolveAvatarPaletteFromRecord(sessionInput);
  if (explicitPalette) {
    return explicitPalette;
  }

  const colorTriplet = resolveSessionAvatarColorTriplet(sessionInput);
  if (colorTriplet) {
    return buildAvatarPaletteFromColorTriplet(colorTriplet);
  }

  return resolveNodeAvatarPalette(resolveSessionAvatarSeed(sessionInput), { variant: 'auto' });
}

function isLikelyAvatarImageUrl(rawUrl) {
  const url = safeText(rawUrl);
  if (!url) {
    return false;
  }
  return (
    /^https?:\/\//i.test(url)
    || url.startsWith('/')
    || url.startsWith('data:image/')
    || url.startsWith('blob:')
  );
}

function resolveSessionAvatarPhotoUrl(sessionInput = state.session) {
  const session = sessionInput && typeof sessionInput === 'object' ? sessionInput : null;
  if (!session) {
    return '';
  }
  const candidates = [
    session.avatarUrl,
    session.avatar_url,
    session.profilePhotoUrl,
    session.profile_photo_url,
    session.profileImageUrl,
    session.profile_image_url,
    session.profilePicture,
    session.profile_picture,
    session.profilePhoto,
    session.profile_photo,
    session.photoUrl,
    session.photo_url,
    session.imageUrl,
    session.image_url,
    session.picture,
  ];
  for (const candidate of candidates) {
    const safeCandidate = safeText(candidate);
    if (isLikelyAvatarImageUrl(safeCandidate)) {
      return safeCandidate;
    }
  }
  return '';
}

function resolveSessionAvatarNodeIdSet(sessionInput = state.session) {
  const session = sessionInput && typeof sessionInput === 'object' ? sessionInput : null;
  const idSet = new Set(['root']);
  if (!session) {
    return idSet;
  }
  const candidates = [
    session.id,
    session.userId,
    session.user_id,
    session.memberId,
    session.member_id,
    session.nodeId,
    session.node_id,
    session.treeNodeId,
    session.tree_node_id,
    session.binaryTreeNodeId,
    session.binary_tree_node_id,
    session.rootNodeId,
    session.root_node_id,
    session.username,
    session.email,
  ];
  for (const candidate of candidates) {
    const safeCandidate = safeText(candidate).toLowerCase();
    if (safeCandidate) {
      idSet.add(safeCandidate);
    }
  }
  return idSet;
}

function isSessionAvatarNodeId(nodeId, sessionInput = state.session) {
  const safeNodeId = safeText(nodeId).toLowerCase();
  if (!safeNodeId) {
    return false;
  }
  return resolveSessionAvatarNodeIdSet(sessionInput).has(safeNodeId);
}

function toCssUrlValue(rawUrl) {
  const safeUrl = safeText(rawUrl);
  if (!safeUrl) {
    return '';
  }
  const escaped = safeUrl.replace(/["\\\n\r]/g, '\\$&');
  return `url("${escaped}")`;
}

function resolveSessionAvatarCssBackground(sessionInput = state.session) {
  const photoUrl = resolveSessionAvatarPhotoUrl(sessionInput);
  if (photoUrl) {
    return {
      image: toCssUrlValue(photoUrl),
      isPhoto: true,
    };
  }
  const palette = resolveSessionAvatarPalette(sessionInput);
  return {
    image: `linear-gradient(140deg, ${colorWithAlpha(palette.light, 1)} 0%, ${colorWithAlpha(palette.mid, 1)} 58%, ${colorWithAlpha(palette.dark, 1)} 100%)`,
    isPhoto: false,
  };
}

function resolveSessionAvatarSignature(sessionInput = state.session) {
  const photoUrl = resolveSessionAvatarPhotoUrl(sessionInput);
  if (photoUrl) {
    return `photo:${photoUrl}`;
  }
  const colorTriplet = resolveSessionAvatarColorTriplet(sessionInput);
  if (colorTriplet) {
    return `rgb:${colorTriplet.join(',')}`;
  }
  return `seed:${resolveSessionAvatarSeed(sessionInput)}`;
}

function resolveAvatarImageAsset(imageUrl) {
  const safeUrl = safeText(imageUrl);
  if (!safeUrl) {
    return null;
  }
  const cached = avatarImageAssetCache.get(safeUrl);
  if (cached) {
    return cached;
  }

  const image = new Image();
  image.decoding = 'async';
  const asset = {
    url: safeUrl,
    image,
    loaded: false,
    error: false,
  };
  image.addEventListener('load', () => {
    asset.loaded = true;
    asset.error = false;
  });
  image.addEventListener('error', () => {
    asset.error = true;
  });
  image.src = safeUrl;

  avatarImageAssetCache.set(safeUrl, asset);
  if (avatarImageAssetCache.size > 32) {
    const oldestKey = avatarImageAssetCache.keys().next().value;
    if (oldestKey && oldestKey !== safeUrl) {
      avatarImageAssetCache.delete(oldestKey);
    }
  }
  return asset;
}

function drawImageAvatarCircle(cx, cy, radius, imageUrl) {
  const asset = resolveAvatarImageAsset(imageUrl);
  if (!asset || !asset.loaded || asset.error) {
    return false;
  }
  const safeRadius = Math.max(0.2, safeNumber(radius, 0.2));
  const sourceWidth = Math.max(1, Math.floor(safeNumber(asset.image.naturalWidth, asset.image.width)));
  const sourceHeight = Math.max(1, Math.floor(safeNumber(asset.image.naturalHeight, asset.image.height)));
  const sourceSize = Math.max(1, Math.min(sourceWidth, sourceHeight));
  const sourceX = Math.max(0, Math.floor((sourceWidth - sourceSize) / 2));
  const sourceY = Math.max(0, Math.floor((sourceHeight - sourceSize) / 2));

  context.save();
  context.beginPath();
  context.arc(cx, cy, safeRadius, 0, Math.PI * 2);
  context.closePath();
  context.clip();
  context.drawImage(
    asset.image,
    sourceX,
    sourceY,
    sourceSize,
    sourceSize,
    cx - safeRadius,
    cy - safeRadius,
    safeRadius * 2,
    safeRadius * 2,
  );
  context.restore();
  return true;
}

function drawResolvedAvatarCircle(cx, cy, radius, nodeId, options = {}) {
  const safeNodeId = safeText(nodeId);
  const disablePhoto = options?.disablePhoto === true;
  if (isSessionAvatarNodeId(safeNodeId)) {
    const photoUrl = resolveSessionAvatarPhotoUrl();
    if (!disablePhoto && photoUrl && drawImageAvatarCircle(cx, cy, radius, photoUrl)) {
      const sheen = createNodeAvatarSheen(cx, cy, Math.max(0.2, safeNumber(radius, 0.2)), options);
      context.beginPath();
      context.arc(cx, cy, Math.max(0.2, safeNumber(radius, 0.2)), 0, Math.PI * 2);
      context.fillStyle = sheen;
      context.fill();
      return { usedPhoto: true };
    }
    const useSessionPalette = options?.ignoreSourcePalette !== true;
    fillNodeAvatarCircle(cx, cy, radius, safeNodeId || resolveSessionAvatarSeed(), useSessionPalette
      ? {
        ...options,
        palette: resolveSessionAvatarPalette(),
        variant: 'auto',
      }
      : options);
    return { usedPhoto: false };
  }

  const nodeRecord = options?.node && typeof options.node === 'object'
    ? options.node
    : resolveNodeById(safeNodeId);
  const photoUrl = resolveNodeAvatarPhotoUrl(nodeRecord);
  if (!disablePhoto && photoUrl && drawImageAvatarCircle(cx, cy, radius, photoUrl)) {
    const sheen = createNodeAvatarSheen(cx, cy, Math.max(0.2, safeNumber(radius, 0.2)), options);
    context.beginPath();
    context.arc(cx, cy, Math.max(0.2, safeNumber(radius, 0.2)), 0, Math.PI * 2);
    context.fillStyle = sheen;
    context.fill();
    return { usedPhoto: true };
  }

  fillNodeAvatarCircle(cx, cy, radius, safeNodeId, {
    ...options,
    node: nodeRecord,
  });
  return { usedPhoto: false };
}

function resolveProjectionScale(rawScale) {
  const safeRawInput = safeNumber(rawScale, DEFAULT_HOME_SCALE);
  const transitionReason = safeText(state.camera?.targetReason);
  const universeTransitionActive = transitionReason === 'universe-enter' || transitionReason === 'universe-back';
  const minScale = universeTransitionActive
    ? Math.min(MIN_SCALE, UNIVERSE_ENTER_TRANSITION_MIN_SCALE)
    : MIN_SCALE;
  const safeRawScale = clamp(safeRawInput, minScale, MAX_SCALE);
  return (safeRawScale / DEFAULT_HOME_SCALE) * PROJECTION_BASE_SCALE;
}

function resolveRawScaleFromProjection(projectionScale) {
  const safeProjection = Math.max(0.000001, safeNumber(projectionScale, PROJECTION_BASE_SCALE));
  const rawScale = (safeProjection / PROJECTION_BASE_SCALE) * DEFAULT_HOME_SCALE;
  return clamp(rawScale, MIN_SCALE, MAX_SCALE);
}

function getUniverseRootId() {
  return safeText(state.universe?.rootId) || 'root';
}

function getUniverseDepthCap() {
  const fallbackDepthCap = state.universe?.depthCap ?? UNIVERSE_DEPTH_CAP;
  return Math.max(0, Math.floor(safeNumber(fallbackDepthCap, UNIVERSE_DEPTH_CAP)));
}

function getUniverseOptions(overrides = {}) {
  return {
    universeRootId: getUniverseRootId(),
    universeDepthCap: getUniverseDepthCap(),
    ...overrides,
  };
}

function getGlobalUniverseOptions(overrides = {}) {
  return {
    universeRootId: 'root',
    universeDepthCap: Number.MAX_SAFE_INTEGER,
    ...overrides,
  };
}

function cloneCameraView(view = state.camera.view) {
  return {
    x: safeNumber(view?.x, 0),
    y: safeNumber(view?.y, 0),
    scale: clamp(safeNumber(view?.scale, DEFAULT_HOME_SCALE), MIN_SCALE, MAX_SCALE),
  };
}

function rememberUniverseCamera(rootId = getUniverseRootId()) {
  const safeRootId = safeText(rootId);
  if (!safeRootId) {
    return;
  }
  state.universe.cameraByRoot[safeRootId] = cloneCameraView();
}

function restoreUniverseCamera(rootId = getUniverseRootId(), animated = true) {
  const safeRootId = safeText(rootId);
  if (!safeRootId) {
    return false;
  }
  const cachedView = state.universe.cameraByRoot[safeRootId];
  if (!cachedView) {
    return false;
  }
  setCameraTarget(cloneCameraView(cachedView), animated);
  return true;
}

function refreshUniverseBreadcrumb(rootId = getUniverseRootId()) {
  const safeRootId = safeText(rootId) || 'root';
  const chain = state.adapter.resolveAncestorChain(safeRootId);
  state.universe.breadcrumb = chain.length ? chain : ['root'];
}

function focusUniverseRoot(animated = true) {
  return focusNode(getUniverseRootId(), DEFAULT_ROOT_FOCUS_RADIUS, animated);
}

function setUniverseEnterViewFade(mode = 'none', durationMs = 0) {
  const safeMode = safeText(mode).toLowerCase();
  if (safeMode !== 'out' && safeMode !== 'in') {
    state.universe.enterViewFadeMode = 'none';
    state.universe.enterViewFadeStartedAtMs = 0;
    state.universe.enterViewFadeDurationMs = 0;
    return;
  }
  state.universe.enterViewFadeMode = safeMode;
  state.universe.enterViewFadeStartedAtMs = getNowMs();
  state.universe.enterViewFadeDurationMs = Math.max(1, Math.floor(safeNumber(durationMs, 0)));
}

function resolveUniverseEnterViewOpacity(nowMs = getNowMs()) {
  const mode = safeText(state.universe?.enterViewFadeMode).toLowerCase();
  if (mode !== 'out' && mode !== 'in') {
    return 1;
  }
  const startedAtMs = safeNumber(state.universe?.enterViewFadeStartedAtMs, nowMs);
  const durationMs = Math.max(1, Math.floor(safeNumber(state.universe?.enterViewFadeDurationMs, 1)));
  const t = clamp((nowMs - startedAtMs) / durationMs, 0, 1);
  const eased = easeOutCubic(t);

  if (mode === 'out') {
    return Math.max(0, 1 - eased);
  }

  if (t >= 1) {
    state.universe.enterViewFadeMode = 'none';
    state.universe.enterViewFadeStartedAtMs = 0;
    state.universe.enterViewFadeDurationMs = 0;
    return 1;
  }
  return eased;
}

function clearPendingUniverseEnterPrep(options = {}) {
  const { preserveFade = false } = options;
  const timerId = Math.floor(safeNumber(state.universe?.enterPrepTimeoutId, 0));
  if (timerId > 0) {
    window.clearTimeout(timerId);
  }
  const rafId = Math.floor(safeNumber(state.universe?.enterPrepRafId, 0));
  if (rafId > 0) {
    window.cancelAnimationFrame(rafId);
  }
  state.universe.enterPrepTimeoutId = 0;
  state.universe.enterPrepRafId = 0;
  state.universe.enterPrepToken = '';
  if (!preserveFade) {
    setUniverseEnterViewFade('none');
  }
}

function clearPendingUniverseBackPrep(options = {}) {
  const { preserveFade = false } = options;
  const rafId = Math.floor(safeNumber(state.universe?.backPrepRafId, 0));
  if (rafId > 0) {
    window.cancelAnimationFrame(rafId);
  }
  state.universe.backPrepRafId = 0;
  state.universe.backPrepToken = '';
  if (!preserveFade) {
    setUniverseEnterViewFade('none');
  }
}

function createPovSnapshot(rootId = getUniverseRootId()) {
  const safeRootId = safeText(rootId) || 'root';
  return {
    rootId: safeRootId,
    selectedId: safeText(state.selectedId) || safeRootId,
    query: safeText(state.query),
    depthFilter: safeText(state.depthFilter || 'all') || 'all',
  };
}

function enterNodeUniverse(nodeId = state.selectedId, animated = true, options = {}) {
  const {
    restoreCachedCamera = true,
    animateLocalFromZoomedOut = false,
  } = options;
  clearPendingUniverseEnterPrep({ preserveFade: true });
  clearPendingUniverseBackPrep({ preserveFade: true });
  const targetNodeId = safeText(nodeId);
  if (!targetNodeId) {
    return false;
  }
  const globalMetrics = state.adapter.resolveNodeMetrics(targetNodeId, getGlobalUniverseOptions());
  if (!globalMetrics) {
    return false;
  }

  const currentRootId = getUniverseRootId();
  if (targetNodeId === currentRootId) {
    return focusUniverseRoot(animated);
  }

  if (!Array.isArray(state.universe.history)) {
    state.universe.history = [];
  }

  rememberUniverseCamera(currentRootId);
  state.universe.history.push(createPovSnapshot(currentRootId));

  state.universe.rootId = targetNodeId;
  refreshUniverseBreadcrumb(targetNodeId);
  state.query = '';
  state.depthFilter = 'all';
  setSelectedNode(targetNodeId, { animate: false });

  if (restoreCachedCamera && restoreUniverseCamera(targetNodeId, animated)) {
    return true;
  }

  if (animateLocalFromZoomedOut) {
    const viewport = state.viewport || state.layout?.viewport;
    const localMetrics = state.adapter.resolveNodeMetrics(targetNodeId, getUniverseOptions());
    if (viewport && localMetrics) {
      const baseRadius = NODE_RADIUS_BASE * (localMetrics.worldRadius / WORLD_RADIUS_BASE);
      const desiredProjectionScale = DEFAULT_ROOT_FOCUS_RADIUS / Math.max(0.001, baseRadius);
      const finalScale = resolveRawScaleFromProjection(desiredProjectionScale);
      const finalProjectionScale = resolveProjectionScale(finalScale);
      const desiredX = viewport.x + (viewport.width * 0.5);
      const desiredY = viewport.y + (viewport.height * 0.44);
      const finalView = {
        scale: finalScale,
        x: desiredX - viewport.centerX - (localMetrics.worldX * finalProjectionScale),
        y: desiredY - viewport.baseY - (localMetrics.worldY * finalProjectionScale),
      };
      const startScale = clamp(
        finalScale * UNIVERSE_ENTER_LOCAL_START_SCALE_FACTOR,
        Math.min(MIN_SCALE, UNIVERSE_ENTER_TRANSITION_MIN_SCALE),
        MAX_SCALE,
      );
      const startProjectionScale = (startScale / DEFAULT_HOME_SCALE) * PROJECTION_BASE_SCALE;
      const startView = {
        scale: startScale,
        x: desiredX - viewport.centerX - (localMetrics.worldX * startProjectionScale),
        y: desiredY - viewport.baseY - (localMetrics.worldY * startProjectionScale),
      };
      state.camera.target = null;
      state.camera.targetReason = 'universe-enter';
      state.camera.view = {
        x: safeNumber(startView.x, state.camera.view.x),
        y: safeNumber(startView.y, state.camera.view.y),
        scale: clamp(
          safeNumber(startView.scale, state.camera.view.scale),
          Math.min(MIN_SCALE, UNIVERSE_ENTER_TRANSITION_MIN_SCALE),
          MAX_SCALE,
        ),
      };
      setCameraTarget(finalView, animated);
      state.camera.targetReason = 'universe-enter';
      return true;
    }
  }

  setCameraTarget(computeHomeView(), false);
  return focusUniverseRoot(animated);
}

function enterNodeUniverseWithZoomHint(nodeId = state.selectedId) {
  const targetNodeId = safeText(nodeId);
  if (!targetNodeId) {
    return false;
  }

  const currentRootId = getUniverseRootId();
  if (targetNodeId === currentRootId) {
    return focusUniverseRoot(true);
  }

  clearPendingUniverseEnterPrep();
  const globalMetrics = state.adapter.resolveNodeMetrics(targetNodeId, getGlobalUniverseOptions());
  if (!globalMetrics) {
    return false;
  }
  setUniverseEnterViewFade('out', UNIVERSE_ENTER_GLOBAL_ZOOM_MS);

  if (!focusNode(targetNodeId, UNIVERSE_ENTER_GLOBAL_FOCUS_RADIUS, true)) {
    setUniverseEnterViewFade('in', UNIVERSE_ENTER_LOCAL_FADE_IN_MS);
    return enterNodeUniverse(targetNodeId, true, {
      restoreCachedCamera: false,
      animateLocalFromZoomedOut: true,
    });
  }
  state.camera.targetReason = 'universe-enter';

  const prepToken = `${targetNodeId}:${Math.floor(getNowMs())}`;
  const startedAtMs = getNowMs();
  state.universe.enterPrepToken = prepToken;
  const continueEnter = () => {
    if (state.universe.enterPrepToken !== prepToken) {
      return;
    }

    const elapsedMs = Math.max(0, getNowMs() - startedAtMs);
    if (elapsedMs < UNIVERSE_ENTER_GLOBAL_ZOOM_MS) {
      state.universe.enterPrepRafId = window.requestAnimationFrame(continueEnter);
      return;
    }

    state.universe.enterPrepRafId = 0;
    state.universe.enterPrepToken = '';
    setUniverseEnterViewFade('in', UNIVERSE_ENTER_LOCAL_FADE_IN_MS);
    enterNodeUniverse(targetNodeId, true, {
      restoreCachedCamera: false,
      animateLocalFromZoomedOut: true,
    });
  };
  state.universe.enterPrepRafId = window.requestAnimationFrame(continueEnter);
  return true;
}

function gotoUniverseFromBreadcrumb(targetRootId, animated = true) {
  const safeTargetRootId = safeText(targetRootId);
  if (!safeTargetRootId) {
    return false;
  }

  const currentRootId = getUniverseRootId();
  if (safeTargetRootId === currentRootId) {
    return focusUniverseRoot(animated);
  }

  const breadcrumb = Array.isArray(state.universe.breadcrumb)
    ? state.universe.breadcrumb
    : [];
  const targetIndex = breadcrumb.indexOf(safeTargetRootId);
  if (targetIndex < 0) {
    return false;
  }

  const safeHistory = Array.isArray(state.universe.history)
    ? state.universe.history
    : [];
  const targetSnapshot = safeHistory[targetIndex] || null;

  rememberUniverseCamera(currentRootId);
  state.universe.history = safeHistory.slice(0, targetIndex);
  state.universe.rootId = safeTargetRootId;
  refreshUniverseBreadcrumb(safeTargetRootId);
  state.query = safeText(targetSnapshot?.query || '');
  state.depthFilter = safeText(targetSnapshot?.depthFilter || 'all') || 'all';
  setSelectedNode(safeText(targetSnapshot?.selectedId || safeTargetRootId), { animate: false });

  if (restoreUniverseCamera(safeTargetRootId, animated)) {
    return true;
  }

  if (focusNode(state.selectedId || safeTargetRootId, 30, animated)) {
    return true;
  }
  return focusUniverseRoot(animated);
}

function exitNodeUniverse(animated = true, options = {}) {
  const {
    restoreCachedCamera = true,
    animateParentFromZoomedIn = false,
  } = options;
  clearPendingUniverseEnterPrep({ preserveFade: true });
  clearPendingUniverseBackPrep({ preserveFade: true });
  const currentRootId = getUniverseRootId();
  if (!currentRootId) {
    return false;
  }

  if (!Array.isArray(state.universe.history)) {
    state.universe.history = [];
  }

  if (!state.universe.history.length && currentRootId === 'root') {
    return false;
  }

  rememberUniverseCamera(currentRootId);
  const previousPov = state.universe.history.pop() || null;
  const parentRootId = safeText(previousPov?.rootId) || 'root';

  state.universe.rootId = parentRootId;
  refreshUniverseBreadcrumb(parentRootId);
  state.query = safeText(previousPov?.query || '');
  state.depthFilter = safeText(previousPov?.depthFilter || 'all');
  setSelectedNode(safeText(previousPov?.selectedId || parentRootId), { animate: false });

  if (restoreCachedCamera && restoreUniverseCamera(parentRootId, animated)) {
    return true;
  }

  if (animateParentFromZoomedIn) {
    const viewport = state.viewport || state.layout?.viewport;
    const parentTargetId = safeText(state.selectedId || parentRootId) || parentRootId;
    const parentMetrics = state.adapter.resolveNodeMetrics(parentTargetId, getUniverseOptions());
    if (viewport && parentMetrics) {
      const baseRadius = NODE_RADIUS_BASE * (parentMetrics.worldRadius / WORLD_RADIUS_BASE);
      const desiredProjectionScale = DEFAULT_ROOT_FOCUS_RADIUS / Math.max(0.001, baseRadius);
      const finalScale = resolveRawScaleFromProjection(desiredProjectionScale);
      const finalProjectionScale = resolveProjectionScale(finalScale);
      const desiredX = viewport.x + (viewport.width * 0.5);
      const desiredY = viewport.y + (viewport.height * 0.44);
      const finalView = {
        scale: finalScale,
        x: desiredX - viewport.centerX - (parentMetrics.worldX * finalProjectionScale),
        y: desiredY - viewport.baseY - (parentMetrics.worldY * finalProjectionScale),
      };
      const startScale = clamp(
        finalScale * UNIVERSE_BACK_PARENT_START_SCALE_FACTOR,
        Math.min(MIN_SCALE, UNIVERSE_ENTER_TRANSITION_MIN_SCALE),
        MAX_SCALE,
      );
      const startProjectionScale = (startScale / DEFAULT_HOME_SCALE) * PROJECTION_BASE_SCALE;
      const startView = {
        scale: startScale,
        x: desiredX - viewport.centerX - (parentMetrics.worldX * startProjectionScale),
        y: desiredY - viewport.baseY - (parentMetrics.worldY * startProjectionScale),
      };
      state.camera.target = null;
      state.camera.targetReason = 'universe-back';
      state.camera.view = {
        x: safeNumber(startView.x, state.camera.view.x),
        y: safeNumber(startView.y, state.camera.view.y),
        scale: clamp(
          safeNumber(startView.scale, state.camera.view.scale),
          Math.min(MIN_SCALE, UNIVERSE_ENTER_TRANSITION_MIN_SCALE),
          MAX_SCALE,
        ),
      };
      setCameraTarget(finalView, animated);
      state.camera.targetReason = 'universe-back';
      return true;
    }
  }

  if (focusNode(state.selectedId || parentRootId, 30, animated)) {
    return true;
  }
  return focusUniverseRoot(animated);
}

function exitNodeUniverseWithZoomHint(animated = true) {
  clearPendingUniverseEnterPrep();
  clearPendingUniverseBackPrep();

  const currentRootId = getUniverseRootId();
  if (!currentRootId) {
    return false;
  }

  const hasHistory = Array.isArray(state.universe.history) && state.universe.history.length > 0;
  if (!hasHistory && currentRootId === 'root') {
    return false;
  }

  const viewport = state.viewport || state.layout?.viewport;
  const currentRootMetrics = state.adapter.resolveNodeMetrics(currentRootId, getUniverseOptions());
  if (viewport && currentRootMetrics) {
    const referenceScale = clamp(
      safeNumber(state.camera.target?.scale, state.camera.view.scale),
      Math.min(MIN_SCALE, UNIVERSE_ENTER_TRANSITION_MIN_SCALE),
      MAX_SCALE,
    );
    const zoomOutScale = clamp(
      referenceScale * UNIVERSE_BACK_LOCAL_ZOOM_OUT_FACTOR,
      Math.min(MIN_SCALE, UNIVERSE_ENTER_TRANSITION_MIN_SCALE),
      MAX_SCALE,
    );
    const zoomOutProjectionScale = (zoomOutScale / DEFAULT_HOME_SCALE) * PROJECTION_BASE_SCALE;
    const desiredX = viewport.x + (viewport.width * 0.5);
    const desiredY = viewport.y + (viewport.height * 0.44);
    const localZoomOutView = {
      scale: zoomOutScale,
      x: desiredX - viewport.centerX - (currentRootMetrics.worldX * zoomOutProjectionScale),
      y: desiredY - viewport.baseY - (currentRootMetrics.worldY * zoomOutProjectionScale),
    };
    setCameraTarget(localZoomOutView, true);
    state.camera.targetReason = 'universe-back';
  }

  const prepToken = `${safeText(currentRootId)}:${Math.floor(getNowMs())}`;
  const startedAtMs = getNowMs();
  let backFadeOutStarted = false;
  state.universe.backPrepToken = prepToken;
  const continueBack = () => {
    if (state.universe.backPrepToken !== prepToken) {
      return;
    }

    const elapsedMs = Math.max(0, getNowMs() - startedAtMs);
    if (!backFadeOutStarted && elapsedMs >= UNIVERSE_BACK_LOCAL_FADE_OUT_DELAY_MS) {
      setUniverseEnterViewFade('out', UNIVERSE_BACK_LOCAL_FADE_OUT_MS);
      backFadeOutStarted = true;
    }
    if (elapsedMs < UNIVERSE_BACK_LOCAL_ZOOM_MS) {
      state.universe.backPrepRafId = window.requestAnimationFrame(continueBack);
      return;
    }

    state.universe.backPrepRafId = 0;
    state.universe.backPrepToken = '';
    setUniverseEnterViewFade('in', UNIVERSE_BACK_PARENT_FADE_IN_MS);
    exitNodeUniverse(animated, {
      restoreCachedCamera: false,
      animateParentFromZoomedIn: true,
    });
  };
  state.universe.backPrepRafId = window.requestAnimationFrame(continueBack);
  return true;
}

function parseSessionPayload(raw) {
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function safeStorageGet(storage, key) {
  try {
    if (!storage) {
      return null;
    }
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function readCookieValue(key) {
  const source = safeText(document.cookie);
  const encodedKey = `${encodeURIComponent(key)}=`;
  const pairs = source.split(';');
  for (const pair of pairs) {
    const trimmedPair = pair.trim();
    if (!trimmedPair.startsWith(encodedKey)) {
      continue;
    }
    return decodeURIComponent(trimmedPair.slice(encodedKey.length));
  }
  return null;
}

function readSessionSnapshot(storageKey, cookieKey) {
  const localSession = parseSessionPayload(safeStorageGet(window.localStorage, storageKey));
  if (localSession) {
    return localSession;
  }
  const tabSession = parseSessionPayload(safeStorageGet(window.sessionStorage, storageKey));
  if (tabSession) {
    return tabSession;
  }
  return parseSessionPayload(readCookieValue(cookieKey));
}

function normalizePinnedNodeIdsFromLaunchStatePayload(value) {
  const source = Array.isArray(value) ? value : [];
  const deduped = [];
  const seen = new Set();
  for (const rawNodeId of source) {
    const nodeId = safeText(rawNodeId);
    if (!nodeId || seen.has(nodeId)) {
      continue;
    }
    seen.add(nodeId);
    deduped.push(nodeId);
    if (deduped.length >= 10) {
      break;
    }
  }
  return deduped;
}

function resolveTimestampMs(value) {
  const timestampMs = Date.parse(safeText(value));
  return Number.isFinite(timestampMs) ? timestampMs : 0;
}

function createDefaultLaunchState(overrides = {}) {
  return {
    firstTime: false,
    firstOpenedAt: '',
    lastOpenedAt: '',
    pinnedNodeIds: [],
    pinnedNodeIdsUpdatedAt: '',
    checkedAt: new Date().toISOString(),
    source: 'fallback',
    ...overrides,
  };
}

function normalizeMemberBinaryTreeLaunchStatePayload(payload = {}, source = 'server') {
  return createDefaultLaunchState({
    firstTime: payload?.firstTime === true,
    firstOpenedAt: safeText(payload?.firstOpenedAt),
    lastOpenedAt: safeText(payload?.lastOpenedAt),
    pinnedNodeIds: normalizePinnedNodeIdsFromLaunchStatePayload(payload?.pinnedNodeIds),
    pinnedNodeIdsUpdatedAt: safeText(payload?.pinnedNodeIdsUpdatedAt),
    checkedAt: safeText(payload?.checkedAt) || new Date().toISOString(),
    source,
  });
}

async function fetchMemberBinaryTreeLaunchState(memberSession) {
  const authToken = safeText(memberSession?.authToken);
  if (!authToken) {
    return createDefaultLaunchState({ source: 'missing-auth-token' });
  }

  try {
    const response = await fetch('/api/member-auth/binary-tree-next/launch-state', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return createDefaultLaunchState({
        source: `http-${response.status}`,
      });
    }

    const payload = await response.json().catch(() => ({}));
    return normalizeMemberBinaryTreeLaunchStatePayload(payload, 'server');
  } catch {
    return createDefaultLaunchState({ source: 'network-fallback' });
  }
}

function clearPinnedNodeIdsServerSyncTimer() {
  if (pinnedNodeIdsServerSyncTimerId) {
    window.clearTimeout(pinnedNodeIdsServerSyncTimerId);
    pinnedNodeIdsServerSyncTimerId = 0;
  }
}

function canSyncPinnedNodeIdsToServer() {
  return state.source === 'member' && Boolean(safeText(state.session?.authToken));
}

function resolvePinnedNodeIdsSyncKey(idsInput = state.pinnedNodeIds) {
  return normalizePinnedNodeIds(idsInput).join('|');
}

async function fetchMemberBinaryTreePinnedNodes(memberSession = state.session) {
  const authToken = safeText(memberSession?.authToken);
  if (!authToken) {
    return {
      success: false,
      status: 401,
      reason: 'missing-auth-token',
    };
  }

  try {
    const response = await fetch(MEMBER_BINARY_TREE_PINNED_NODES_API, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        reason: `http-${response.status}`,
      };
    }

    const payload = await response.json().catch(() => ({}));
    return {
      success: true,
      status: 200,
      pinnedNodeIds: normalizePinnedNodeIdsFromLaunchStatePayload(payload?.pinnedNodeIds),
      pinnedNodeIdsUpdatedAt: safeText(payload?.pinnedNodeIdsUpdatedAt),
      checkedAt: safeText(payload?.checkedAt),
    };
  } catch {
    return {
      success: false,
      status: 0,
      reason: 'network-fallback',
    };
  }
}

async function flushPinnedNodeIdsServerSync() {
  if (!canSyncPinnedNodeIdsToServer()) {
    return;
  }

  if (pinnedNodeIdsServerSyncInFlight) {
    pinnedNodeIdsServerSyncQueued = true;
    return;
  }

  const authToken = safeText(state.session?.authToken);
  if (!authToken) {
    return;
  }

  const currentPinnedNodeIds = normalizePinnedNodeIds(state.pinnedNodeIds);
  const currentSyncKey = currentPinnedNodeIds.join('|');
  if (currentSyncKey === pinnedNodeIdsLastSyncedKey) {
    pinnedNodeIdsLocalDirty = false;
    return;
  }

  pinnedNodeIdsServerSyncInFlight = true;
  try {
    const response = await fetch(MEMBER_BINARY_TREE_PINNED_NODES_API, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pinnedNodeIds: currentPinnedNodeIds,
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const shouldRetry = response.status !== 401 && response.status !== 403;
      if (shouldRetry) {
        schedulePinnedNodeIdsServerSync();
      }
      return;
    }

    const payload = await response.json().catch(() => ({}));
    const serverPinnedNodeIds = normalizePinnedNodeIds(payload?.pinnedNodeIds);
    const serverSyncKey = serverPinnedNodeIds.join('|');

    pinnedNodeIdsLocalDirty = false;
    pinnedNodeIdsLastSyncedKey = serverSyncKey;
    if (serverSyncKey !== currentSyncKey) {
      setPinnedNodeIds(serverPinnedNodeIds, {
        persistLocal: true,
        syncServer: false,
      });
    }

    if (state.launchState && typeof state.launchState === 'object') {
      state.launchState.pinnedNodeIds = serverPinnedNodeIds.slice();
      state.launchState.pinnedNodeIdsUpdatedAt = safeText(payload?.pinnedNodeIdsUpdatedAt);
    }
  } catch {
    schedulePinnedNodeIdsServerSync();
  } finally {
    pinnedNodeIdsServerSyncInFlight = false;
    if (pinnedNodeIdsServerSyncQueued) {
      pinnedNodeIdsServerSyncQueued = false;
      void flushPinnedNodeIdsServerSync();
    }
  }
}

function schedulePinnedNodeIdsServerSync(options = {}) {
  if (!canSyncPinnedNodeIdsToServer()) {
    return;
  }

  const immediate = options?.immediate === true;
  if (immediate) {
    clearPinnedNodeIdsServerSyncTimer();
    void flushPinnedNodeIdsServerSync();
    return;
  }

  clearPinnedNodeIdsServerSyncTimer();
  pinnedNodeIdsServerSyncTimerId = window.setTimeout(() => {
    pinnedNodeIdsServerSyncTimerId = 0;
    void flushPinnedNodeIdsServerSync();
  }, PINNED_NODE_IDS_SERVER_SYNC_DEBOUNCE_MS);
}

async function syncPinnedNodeIdsFromServer(reason = 'timer') {
  if (state.source !== 'member') {
    return { success: false, skipped: true, reason: 'non-member-source' };
  }

  if (!canSyncPinnedNodeIdsToServer()) {
    return { success: false, skipped: true, reason: 'missing-auth-token' };
  }

  if (pinnedNodeIdsLocalDirty || pinnedNodeIdsServerSyncInFlight || pinnedNodeIdsServerSyncTimerId > 0) {
    return { success: false, skipped: true, reason: 'local-sync-pending' };
  }

  const remoteState = await fetchMemberBinaryTreePinnedNodes(state.session);
  if (!remoteState.success) {
    return {
      success: false,
      skipped: false,
      reason: remoteState.reason || 'remote-fetch-failed',
    };
  }

  const remotePinnedNodeIds = normalizePinnedNodeIds(remoteState.pinnedNodeIds);
  const remoteSyncKey = remotePinnedNodeIds.join('|');
  const remoteUpdatedAt = safeText(remoteState.pinnedNodeIdsUpdatedAt);
  const remoteUpdatedAtMs = resolveTimestampMs(remoteUpdatedAt);
  const localUpdatedAt = safeText(state.launchState?.pinnedNodeIdsUpdatedAt);
  const localUpdatedAtMs = resolveTimestampMs(localUpdatedAt);

  if (remoteSyncKey === pinnedNodeIdsLastSyncedKey && remoteUpdatedAtMs <= localUpdatedAtMs) {
    return { success: true, skipped: true, reason: 'already-synced' };
  }

  if (remoteUpdatedAtMs > 0 && localUpdatedAtMs > 0 && remoteUpdatedAtMs < localUpdatedAtMs) {
    return { success: true, skipped: true, reason: 'stale-remote-state' };
  }

  const localSyncKey = resolvePinnedNodeIdsSyncKey(state.pinnedNodeIds);
  if (remoteSyncKey !== localSyncKey) {
    setPinnedNodeIds(remotePinnedNodeIds, {
      persistLocal: true,
      syncServer: false,
    });
  }

  pinnedNodeIdsLastSyncedKey = remoteSyncKey;
  if (state.launchState && typeof state.launchState === 'object') {
    state.launchState.pinnedNodeIds = remotePinnedNodeIds.slice();
    state.launchState.pinnedNodeIdsUpdatedAt = remoteUpdatedAt;
  }

  return {
    success: true,
    skipped: false,
    reason,
    applied: remoteSyncKey !== localSyncKey,
  };
}

async function resetMemberBinaryTreeLaunchStateFromDock() {
  if (state.source !== 'member') {
    return;
  }
  if (launchStateResetInFlight) {
    return;
  }

  const authToken = safeText(state.session?.authToken);
  if (!authToken) {
    showBootError('Missing member auth token. Unable to reset Binary Tree intro state.');
    return;
  }

  launchStateResetInFlight = true;
  try {
    let response = await fetch('/api/member-auth/binary-tree-next/launch-state', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      cache: 'no-store',
    });

    // Fallback for environments/proxies that do not forward DELETE.
    if (response.status === 404 || response.status === 405) {
      response = await fetch('/api/member-auth/binary-tree-next/launch-state/reset', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        cache: 'no-store',
      });
    }

    if (!response.ok) {
      showBootError(`Unable to reset Binary Tree intro state (HTTP ${response.status}).`);
      return;
    }

    clearMockFirstTimeLaunchOverrideMarker();
    window.location.reload();
  } catch {
    showBootError('Unable to reset Binary Tree intro state right now.');
  } finally {
    launchStateResetInFlight = false;
  }
}

async function waitForFirstOpenSplashContinue() {
  if (state.source !== 'member' || state.launchState?.firstTime !== true) {
    hideFirstOpenSplashImmediately();
    return;
  }
  if (!(firstOpenSplashElement instanceof HTMLElement)) {
    return;
  }

  firstOpenSplashElement.style.display = 'flex';
  firstOpenSplashElement.classList.remove('is-leaving');
  firstOpenSplashElement.classList.remove('is-visible');
  window.requestAnimationFrame(() => {
    if (firstOpenSplashElement.style.display !== 'none') {
      firstOpenSplashElement.classList.add('is-visible');
    }
  });

  await new Promise((resolve) => {
    let settled = false;

    const cleanup = () => {
      firstOpenSplashElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown, true);
    };

    const finalize = () => {
      if (settled) {
        return;
      }
      settled = true;
      firstOpenSplashElement.classList.remove('is-visible');
      firstOpenSplashElement.classList.add('is-leaving');
      window.setTimeout(() => {
        firstOpenSplashElement.style.display = 'none';
        firstOpenSplashElement.classList.remove('is-leaving');
        cleanup();
        resolve();
      }, FIRST_OPEN_SPLASH_FADE_MS);
    };

    const onPointerDown = (event) => {
      event.preventDefault();
      finalize();
    };

    const onKeyDown = (event) => {
      if (event.key === 'Enter' || event.key === ' ' || event.code === 'Space') {
        event.preventDefault();
        finalize();
      }
    };

    firstOpenSplashElement.addEventListener('pointerdown', onPointerDown, { passive: false });
    window.addEventListener('keydown', onKeyDown, true);
  });
}

function resolveAppSource() {
  const params = new URLSearchParams(window.location.search || '');
  const source = safeText(params.get('source')).toLowerCase();
  return source === 'admin' ? 'admin' : 'member';
}

function redirectTo(pathname) {
  if (pathname) {
    window.location.replace(pathname);
  }
}

async function validateMemberSession(memberSession) {
  if (!memberSession || typeof memberSession !== 'object') {
    return {
      ok: false,
      redirectTo: '/login.html',
      reason: 'Member session not found.',
    };
  }

  const authToken = safeText(memberSession.authToken);
  if (!authToken) {
    return {
      ok: false,
      redirectTo: '/login.html',
      reason: 'Missing member auth token.',
    };
  }

  try {
    const response = await fetch('/api/member-auth/email-verification-status', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      cache: 'no-store',
    });

    if (response.ok) {
      return {
        ok: true,
        session: memberSession,
      };
    }

    if (response.status === 401 || response.status === 403) {
      return {
        ok: false,
        redirectTo: '/login.html',
        reason: 'Member session expired or unauthorized.',
      };
    }

    return {
      ok: true,
      session: memberSession,
      warning: `Session check returned HTTP ${response.status}; allowing local shell boot.`,
    };
  } catch {
    return {
      ok: true,
      session: memberSession,
      warning: 'Session validation endpoint unreachable; allowing local shell boot.',
    };
  }
}

async function bootstrapSession() {
  const source = resolveAppSource();
  state.source = source;
  if (document.documentElement instanceof HTMLElement) {
    document.documentElement.setAttribute('data-tree-next-source', source);
  }
  if (document.body instanceof HTMLElement) {
    document.body.setAttribute('data-tree-next-source', source);
  }
  state.launchState = createDefaultLaunchState({
    source: source === 'admin' ? 'admin-skip' : 'not-checked',
  });

  if (source === 'admin') {
    const adminSession = readSessionSnapshot(ADMIN_AUTH_STORAGE_KEY, ADMIN_AUTH_COOKIE_KEY);
    if (!adminSession) {
      redirectTo('/admin-login.html');
      return false;
    }
    state.session = adminSession;
    return true;
  }

  const memberSession = readSessionSnapshot(MEMBER_AUTH_STORAGE_KEY, MEMBER_AUTH_COOKIE_KEY);
  const validation = await validateMemberSession(memberSession);
  if (!validation.ok) {
    redirectTo(validation.redirectTo);
    return false;
  }
  state.session = validation.session;
  state.launchState = await fetchMemberBinaryTreeLaunchState(validation.session);
  return true;
}

function truncateText(text, maxLength) {
  const safe = safeText(text);
  if (!safe || safe.length <= maxLength) {
    return safe;
  }
  return `${safe.slice(0, maxLength - 1)}...`;
}

function truncateTextToWidth(text, maxWidth, options = {}) {
  const safe = safeText(text);
  const safeMaxWidth = Math.max(0, safeNumber(maxWidth, 0));
  if (!safe || safeMaxWidth <= 0) {
    return '';
  }

  if (measureTextWidth(safe, options) <= safeMaxWidth) {
    return safe;
  }

  const ellipsis = '...';
  const ellipsisWidth = measureTextWidth(ellipsis, options);
  if (ellipsisWidth > safeMaxWidth) {
    return '';
  }

  for (let end = safe.length - 1; end > 0; end -= 1) {
    const candidate = `${safe.slice(0, end)}${ellipsis}`;
    if (measureTextWidth(candidate, options) <= safeMaxWidth) {
      return candidate;
    }
  }

  return ellipsis;
}

function resolveInitials(name) {
  const safeName = safeText(name);
  if (!safeName) {
    return '?';
  }
  const parts = safeName.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
}

function normalizeTreeNextLiveLookupKey(value) {
  return normalizeCredentialValue(safeText(value).replace(/^@+/, ''));
}

function resolveTreeNextLiveMemberCreatedAtMs(member = {}, index = 0, totalMembers = 0, nowMs = Date.now()) {
  const createdAtMs = Date.parse(safeText(member?.createdAt || member?.updatedAt || ''));
  if (Number.isFinite(createdAtMs)) {
    return createdAtMs;
  }
  return nowMs - (Math.max(0, totalMembers - index) * 60000);
}

function resolveTreeNextLiveNodeStatusFromAccountStatus(accountStatus) {
  const normalized = normalizeCredentialValue(accountStatus);
  if (
    normalized.includes('review')
    || normalized.includes('dormant')
    || normalized.includes('inactive')
    || normalized.includes('suspend')
    || normalized.includes('disable')
  ) {
    return 'stabilizing';
  }
  return 'active';
}

function resolveTreeNextLiveMemberAccountStatus(member = {}) {
  const explicitStatus = safeText(
    member?.accountStatus
    || member?.status
    || member?.userAccountStatus
    || member?.user_account_status
    || member?.memberAccountStatus
    || member?.member_account_status,
  );
  const normalizedExplicitStatus = normalizeCredentialValue(explicitStatus);
  if (
    normalizedExplicitStatus.includes('review')
    || normalizedExplicitStatus.includes('dormant')
    || normalizedExplicitStatus.includes('inactive')
    || normalizedExplicitStatus.includes('suspend')
    || normalizedExplicitStatus.includes('disable')
    || normalizedExplicitStatus.includes('expired')
  ) {
    return explicitStatus || 'Inactive';
  }

  const personalVolumeSnapshot = resolveTreeNextLiveMemberPersonalVolumeSnapshot(member);
  const isActiveByPersonalBv = personalVolumeSnapshot.currentPersonalPvBv >= ACTIVE_MEMBER_MONTHLY_PERSONAL_BV_MIN;
  if (explicitStatus) {
    return isActiveByPersonalBv ? 'Active' : 'Inactive';
  }
  if (typeof member?.isActive === 'boolean') {
    return member.isActive && isActiveByPersonalBv ? 'Active' : 'Inactive';
  }
  if (typeof member?.active === 'boolean') {
    return member.active && isActiveByPersonalBv ? 'Active' : 'Inactive';
  }
  return isActiveByPersonalBv ? 'Active' : 'Inactive';
}

function isTreeNextLiveBinaryTreeEligibleMember(member = {}) {
  const packageKey = normalizeCredentialValue(member?.enrollmentPackage);
  const rankKey = normalizeCredentialValue(member?.accountRank || member?.rank);
  if (packageKey === FREE_ACCOUNT_PACKAGE_KEY) {
    return false;
  }
  if (FREE_ACCOUNT_RANK_KEY_SET.has(rankKey)) {
    return false;
  }
  return true;
}

function resolveTreeNextLiveMemberPlacementPreference(member = {}) {
  const placementLeg = normalizeCredentialValue(member?.placementLeg);
  const spilloverSide = normalizeCredentialValue(member?.spilloverPlacementSide);
  const isSpillover = Boolean(member?.isSpillover) || SPILLOVER_PLACEMENT_KEY_SET.has(placementLeg);
  const isExtreme = EXTREME_PLACEMENT_KEY_SET.has(placementLeg);
  const preferredSide = (
    RIGHT_PLACEMENT_KEY_SET.has(placementLeg)
    || (isSpillover && spilloverSide === 'right')
  )
    ? 'right'
    : 'left';
  return {
    preferredSide,
    isSpillover,
    isExtreme,
  };
}

function resolveTreeNextLiveMemberRank(member = {}) {
  const explicitRank = safeText(member?.accountRank || member?.rank);
  if (explicitRank) {
    return explicitRank;
  }

  const packageKey = normalizeCredentialValue(member?.enrollmentPackage);
  if (packageKey === 'legacy-builder-pack') {
    return 'Legacy';
  }
  if (packageKey === 'infinity-builder-pack') {
    return 'Infinity';
  }
  if (packageKey === 'business-builder-pack') {
    return 'Business';
  }
  if (packageKey === 'personal-builder-pack') {
    return 'Personal';
  }
  if (packageKey === FREE_ACCOUNT_PACKAGE_KEY) {
    return 'Preferred Customer';
  }
  return 'Personal';
}

function resolveTreeNextLiveMemberPersonalVolumeSnapshot(member = {}) {
  const packageKey = normalizeCredentialValue(member?.enrollmentPackage);
  const packageMeta = ENROLL_PACKAGE_META[packageKey];
  const packageBv = Math.max(0, Math.floor(safeNumber(member?.packageBv, safeNumber(packageMeta?.bv, 0))));
  const starterPersonalPv = Math.max(0, Math.floor(safeNumber(member?.starterPersonalPv, packageBv)));
  const baselineStarterPersonalPv = Math.max(0, Math.floor(safeNumber(
    member?.serverCutoffBaselineStarterPersonalPv
    ?? member?.server_cutoff_baseline_starter_personal_pv,
    0,
  )));
  const currentPersonalPvBv = Math.max(0, starterPersonalPv - baselineStarterPersonalPv);
  return {
    packageBv,
    starterPersonalPv,
    baselineStarterPersonalPv,
    currentPersonalPvBv,
  };
}

function createTreeNextLiveNodeIdForMember(member = {}, index = 0, usedNodeIds = new Set()) {
  const candidates = [
    member?.userId,
    member?.id,
    member?.memberUsername,
    member?.username,
    member?.email,
    `member-${index + 1}`,
  ];

  let baseId = '';
  for (const candidate of candidates) {
    const sanitized = safeText(candidate)
      .replace(/^@+/, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9._-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (!sanitized) {
      continue;
    }
    baseId = sanitized;
    break;
  }

  if (!baseId) {
    baseId = `member-${index + 1}`;
  }
  if (baseId === 'root' || baseId === LIVE_TREE_GLOBAL_ROOT_ID) {
    baseId = `member-${baseId}`;
  }

  if (!usedNodeIds.has(baseId)) {
    usedNodeIds.add(baseId);
    return baseId;
  }

  let attempt = 2;
  while (attempt < 10000) {
    const candidateId = `${baseId}-${attempt}`;
    if (!usedNodeIds.has(candidateId)) {
      usedNodeIds.add(candidateId);
      return candidateId;
    }
    attempt += 1;
  }

  const fallbackId = `${baseId}-${Date.now()}`;
  usedNodeIds.add(fallbackId);
  return fallbackId;
}

function createTreeNextLiveScopedRootNode(sourceNode = null) {
  const source = sourceNode && typeof sourceNode === 'object' ? sourceNode : null;
  const session = state.session && typeof state.session === 'object' ? state.session : null;
  const sessionDisplayName = safeText(resolveSessionDisplayName());
  const sourceDisplayName = safeText(source?.name);
  const sourceUsername = safeText(source?.username || source?.memberCode).replace(/^@+/, '');
  const sessionUsername = safeText(
    session?.username
    || session?.memberUsername
    || session?.email
    || '',
  ).replace(/^@+/, '');
  const displayName = state.source === 'admin'
    ? (sourceDisplayName || sessionDisplayName || 'Company Root')
    : (sourceDisplayName || sessionDisplayName || 'Member');
  const username = state.source === 'admin'
    ? (sourceUsername || sessionUsername || 'company-root')
    : (sourceUsername || sessionUsername || 'member');
  const rank = safeText(
    source?.rank
    || source?.accountRank
    || source?.account_rank
    || session?.accountRank
    || session?.account_rank
    || session?.rank
    || 'Legacy',
  ) || 'Legacy';
  const accountStatus = safeText(source?.accountStatus || source?.status || 'Active') || 'Active';
  const fallbackTitle = `${rank} Builder`;
  const sourceTitle = resolveNodePrimaryTitleLabel(source);
  const sessionTitle = resolveNodePrimaryTitleLabel(session);
  const sessionTitleIsFallback = isTreeNextRankBuilderFallbackTitle(sessionTitle, rank);
  const sourceTitleIsFallback = isTreeNextRankBuilderFallbackTitle(sourceTitle, rank);
  let title = fallbackTitle;
  if (state.source === 'member') {
    if (sessionTitle && !sessionTitleIsFallback) {
      title = sessionTitle;
    } else if (sourceTitle && !sourceTitleIsFallback) {
      title = sourceTitle;
    } else {
      title = sessionTitle || sourceTitle || fallbackTitle;
    }
  } else if (sourceTitle && !sourceTitleIsFallback) {
    title = sourceTitle;
  } else {
    title = sessionTitle || sourceTitle || fallbackTitle;
  }
  const secondaryTitle = resolveNodeSecondaryTitleLabel(source) || resolveNodeSecondaryTitleLabel(session);
  const rankIconPath = resolveNodeRankIconPathValue(source) || resolveNodeRankIconPathValue(session);
  const titleIconPath = resolveNodeTitleIconPathValue(source) || resolveNodeTitleIconPathValue(session);
  const sourceBadges = Array.isArray(source?.badges)
    ? source.badges.map((badge) => safeText(badge)).filter(Boolean)
    : [];
  const badges = sourceBadges.length ? sourceBadges : [rank];
  const volume = Math.max(0, Math.floor(safeNumber(source?.volume, 0)));
  const starterPersonalPv = Math.max(0, Math.floor(safeNumber(source?.starterPersonalPv, volume)));
  const baselineStarterPersonalPv = Math.max(0, Math.floor(safeNumber(
    source?.serverCutoffBaselineStarterPersonalPv
    ?? source?.server_cutoff_baseline_starter_personal_pv,
    0,
  )));
  const currentPersonalPvBv = Math.max(0, starterPersonalPv - baselineStarterPersonalPv);
  const sourceAvatarPalette = resolveAvatarPaletteFromRecord(source)
    || resolveAvatarPaletteFromRecord(session);
  const sourceAvatarColorTriplet = resolveAvatarColorTripletFromRecord(source)
    || resolveAvatarColorTripletFromRecord(session);
  const sourceAvatarColorValue = safeText(
    source?.avatarColor
    || source?.avatar_color
    || source?.avatarColorHex
    || source?.avatar_color_hex
    || source?.profileColor
    || source?.profile_color
    || session?.avatarColor
    || session?.avatar_color
    || session?.profileColor
    || session?.profile_color,
  );
  const sourceAvatarPhotoUrl = safeText(
    source?.avatarUrl
    || source?.avatar_url
    || source?.profilePhotoUrl
    || source?.profile_photo_url
    || source?.profileImageUrl
    || source?.profile_image_url
    || session?.avatarUrl
    || session?.avatar_url
    || session?.profilePhotoUrl
    || session?.profile_photo_url
    || session?.profileImageUrl
    || session?.profile_image_url,
  );
  const sourceAvatarSeed = resolveNodeAvatarSeed(source, resolveSessionAvatarSeed(session));

  return {
    id: 'root',
    parent: '',
    side: '',
    memberCode: username,
    name: displayName,
    username,
    role: safeText(source?.role || 'Network Head') || 'Network Head',
    status: resolveTreeNextLiveNodeStatusFromAccountStatus(accountStatus),
    accountStatus,
    rank,
    accountRank: rank,
    title,
    accountTitle: title,
    profileAccountTitle: title,
    accountTitleSecondary: secondaryTitle,
    profileAccountTitleSecondary: secondaryTitle,
    rankIconPath,
    titleIconPath,
    profileBadgeRankIconPath: rankIconPath,
    profileBadgeTitleIconPath: titleIconPath,
    badges,
    volume,
    starterPersonalPv,
    serverCutoffBaselineStarterPersonalPv: baselineStarterPersonalPv,
    currentPersonalPvBv,
    monthlyPersonalBv: currentPersonalPvBv,
    sponsorId: '',
    globalSponsorId: '',
    sponsorUsername: '',
    sponsorLeg: '',
    isSpillover: false,
    countryFlag: safeText(source?.countryFlag || session?.countryFlag || ''),
    enrollmentPackage: safeText(source?.enrollmentPackage || session?.enrollmentPackage || ''),
    avatarSeed: sourceAvatarSeed,
    avatarColor: sourceAvatarColorValue,
    avatarColorRgb: sourceAvatarColorTriplet ? [...sourceAvatarColorTriplet] : null,
    avatarPalette: sourceAvatarPalette,
    avatarUrl: sourceAvatarPhotoUrl,
  };
}

function rebuildTreeNextLiveChildReferences(nodesInput = []) {
  const nodes = Array.isArray(nodesInput)
    ? nodesInput
      .filter((node) => node && typeof node === 'object')
      .map((node) => ({ ...node }))
    : [];
  const nodeById = new Map();

  for (const node of nodes) {
    const nodeId = safeText(node?.id);
    if (!nodeId) {
      continue;
    }
    node.id = nodeId;
    node.leftChildId = '';
    node.rightChildId = '';
    nodeById.set(nodeId, node);
  }

  for (const node of nodeById.values()) {
    const parentId = safeText(node?.parent);
    const side = normalizeBinarySide(node?.side);
    if (!parentId || !side || !nodeById.has(parentId)) {
      continue;
    }
    const parentNode = nodeById.get(parentId);
    if (side === 'left') {
      parentNode.leftChildId = node.id;
    } else {
      parentNode.rightChildId = node.id;
    }
  }

  return Array.from(nodeById.values());
}

function resolveTreeNextLiveViewerGlobalNodeId(nodeById, lookupToNodeId) {
  const session = state.session && typeof state.session === 'object' ? state.session : null;
  const candidates = [
    session?.rootNodeId,
    session?.root_node_id,
    session?.nodeId,
    session?.node_id,
    session?.treeNodeId,
    session?.tree_node_id,
    session?.binaryTreeNodeId,
    session?.binary_tree_node_id,
    session?.id,
    session?.userId,
    session?.user_id,
    session?.memberId,
    session?.member_id,
    session?.username,
    session?.memberUsername,
    session?.email,
  ];

  for (const candidate of candidates) {
    const safeCandidate = safeText(candidate).replace(/^@+/, '');
    if (!safeCandidate) {
      continue;
    }
    if (nodeById.has(safeCandidate)) {
      return safeCandidate;
    }
    const normalizedLookup = normalizeTreeNextLiveLookupKey(safeCandidate);
    if (normalizedLookup && lookupToNodeId.has(normalizedLookup)) {
      return safeText(lookupToNodeId.get(normalizedLookup));
    }
  }

  return LIVE_TREE_GLOBAL_ROOT_ID;
}

function buildTreeNextNodesFromRegisteredMembers(membersInput = []) {
  const nowMs = Date.now();
  const sourceMembers = Array.isArray(membersInput)
    ? membersInput.filter((member) => member && typeof member === 'object')
    : [];
  const members = sourceMembers
    .filter((member) => isTreeNextLiveBinaryTreeEligibleMember(member))
    .slice();

  members.sort((left, right) => {
    const leftMs = resolveTreeNextLiveMemberCreatedAtMs(left, 0, members.length, nowMs);
    const rightMs = resolveTreeNextLiveMemberCreatedAtMs(right, 0, members.length, nowMs);
    if (leftMs !== rightMs) {
      return leftMs - rightMs;
    }
    const leftKey = normalizeTreeNextLiveLookupKey(
      left?.userId || left?.id || left?.memberUsername || left?.email,
    );
    const rightKey = normalizeTreeNextLiveLookupKey(
      right?.userId || right?.id || right?.memberUsername || right?.email,
    );
    return leftKey.localeCompare(rightKey);
  });

  const usedNodeIds = new Set(['root', LIVE_TREE_GLOBAL_ROOT_ID]);
  const nodeById = new Map();
  const lookupToNodeId = new Map();
  const memberNodeIdByIndex = new Map();

  const registerLookup = (rawValue, nodeId) => {
    const lookupKey = normalizeTreeNextLiveLookupKey(rawValue);
    if (!lookupKey || !nodeId) {
      return;
    }
    lookupToNodeId.set(lookupKey, nodeId);
  };

  const globalRootNode = {
    id: LIVE_TREE_GLOBAL_ROOT_ID,
    parent: '',
    side: '',
    memberCode: 'company-root',
    name: 'Company Root',
    username: 'company-root',
    role: 'Network Head',
    status: 'active',
    accountStatus: 'Active',
    rank: 'Legacy',
    title: 'Company Root',
    badges: ['Legacy'],
    volume: 0,
    starterPersonalPv: 0,
    serverCutoffBaselineStarterPersonalPv: 0,
    currentPersonalPvBv: 0,
    monthlyPersonalBv: 0,
    sponsorId: '',
    globalSponsorId: '',
    sponsorUsername: '',
    sponsorLeg: '',
    isSpillover: false,
  };
  nodeById.set(LIVE_TREE_GLOBAL_ROOT_ID, globalRootNode);
  registerLookup(LIVE_TREE_GLOBAL_ROOT_ID, LIVE_TREE_GLOBAL_ROOT_ID);
  registerLookup('company-root', LIVE_TREE_GLOBAL_ROOT_ID);
  registerLookup('admin', LIVE_TREE_GLOBAL_ROOT_ID);

  members.forEach((member, index) => {
    const nodeId = createTreeNextLiveNodeIdForMember(member, index, usedNodeIds);
    memberNodeIdByIndex.set(index, nodeId);

    const username = safeText(member?.memberUsername || member?.username).replace(/^@+/, '');
    const displayName = safeText(
      member?.fullName
      || username
      || member?.email
      || `Member ${index + 1}`,
    ) || `Member ${index + 1}`;
    const accountStatus = resolveTreeNextLiveMemberAccountStatus(member);
    const personalVolumeSnapshot = resolveTreeNextLiveMemberPersonalVolumeSnapshot(member);
    const sponsorUsername = safeText(member?.sponsorUsername || member?.sponsor_username).replace(/^@+/, '');
    const rank = resolveTreeNextLiveMemberRank(member);
    const fallbackTitle = `${rank} Builder`;
    const primaryTitle = resolveNodePrimaryTitleLabel(member);
    const title = primaryTitle || fallbackTitle;
    const secondaryTitle = resolveNodeSecondaryTitleLabel(member);
    const rankIconPath = resolveNodeRankIconPathValue(member);
    const titleIconPath = resolveNodeTitleIconPathValue(member);
    const createdAt = safeText(member?.createdAt || member?.updatedAt || '');
    const avatarPalette = resolveAvatarPaletteFromRecord(member);
    const avatarColorTriplet = resolveAvatarColorTripletFromRecord(member);
    const avatarColorValue = safeText(
      member?.avatarColor
      || member?.avatar_color
      || member?.avatarColorHex
      || member?.avatar_color_hex
      || member?.profileColor
      || member?.profile_color,
    );
    const avatarPhotoUrl = safeText(
      member?.avatarUrl
      || member?.avatar_url
      || member?.profilePhotoUrl
      || member?.profile_photo_url
      || member?.profileImageUrl
      || member?.profile_image_url,
    );
    const avatarSeed = resolveNodeAvatarSeed(member, nodeId);
    const node = {
      id: nodeId,
      parent: '',
      side: '',
      memberCode: username || nodeId,
      name: displayName,
      username: username || nodeId,
      role: 'Distributor',
      status: resolveTreeNextLiveNodeStatusFromAccountStatus(accountStatus),
      accountStatus,
      rank,
      accountRank: rank,
      title,
      accountTitle: title,
      profileAccountTitle: primaryTitle || title,
      accountTitleSecondary: secondaryTitle,
      profileAccountTitleSecondary: secondaryTitle,
      rankIconPath,
      titleIconPath,
      profileBadgeRankIconPath: rankIconPath,
      profileBadgeTitleIconPath: titleIconPath,
      badges: [rank],
      volume: personalVolumeSnapshot.starterPersonalPv > 0
        ? personalVolumeSnapshot.starterPersonalPv
        : personalVolumeSnapshot.packageBv,
      starterPersonalPv: personalVolumeSnapshot.starterPersonalPv,
      serverCutoffBaselineStarterPersonalPv: personalVolumeSnapshot.baselineStarterPersonalPv,
      currentPersonalPvBv: personalVolumeSnapshot.currentPersonalPvBv,
      monthlyPersonalBv: personalVolumeSnapshot.currentPersonalPvBv,
      sponsorId: '',
      globalSponsorId: '',
      sponsorUsername,
      sponsorLeg: '',
      isSpillover: false,
      countryFlag: normalizeCredentialValue(member?.countryFlag),
      enrollmentPackage: normalizeCredentialValue(member?.enrollmentPackage),
      packageBv: personalVolumeSnapshot.packageBv,
      fastTrackTier: normalizeCredentialValue(member?.fastTrackTier),
      businessCenterNodeType: safeText(member?.businessCenterNodeType),
      isStaffTreeAccount: Boolean(member?.isStaffTreeAccount),
      createdAt,
      avatarSeed,
      avatarColor: avatarColorValue,
      avatarColorRgb: avatarColorTriplet ? [...avatarColorTriplet] : null,
      avatarPalette,
      avatarUrl: avatarPhotoUrl,
    };

    nodeById.set(nodeId, node);
    registerLookup(member?.id, nodeId);
    registerLookup(member?.userId, nodeId);
    registerLookup(member?.memberUsername, nodeId);
    registerLookup(member?.username, nodeId);
    registerLookup(member?.email, nodeId);
    registerLookup(nodeId, nodeId);
  });

  const findOpenPlacement = (startingParentId, preferredSide) => {
    const normalizedPreferred = normalizeBinarySide(preferredSide) === 'right' ? 'right' : 'left';
    const primaryChildKey = normalizedPreferred === 'right' ? 'rightChildId' : 'leftChildId';
    const secondaryChildKey = normalizedPreferred === 'right' ? 'leftChildId' : 'rightChildId';
    const queue = [];
    const visited = new Set();
    const resolvedStartParentId = nodeById.has(startingParentId) ? startingParentId : LIVE_TREE_GLOBAL_ROOT_ID;
    const startParentNode = nodeById.get(resolvedStartParentId);
    if (!startParentNode) {
      return null;
    }

    if (!safeText(startParentNode[primaryChildKey])) {
      return { parentId: resolvedStartParentId, side: normalizedPreferred };
    }

    const firstQueueId = safeText(startParentNode[primaryChildKey]);
    if (firstQueueId && nodeById.has(firstQueueId)) {
      queue.push(firstQueueId);
    }

    while (queue.length > 0) {
      const parentId = safeText(queue.shift());
      if (!parentId || visited.has(parentId) || !nodeById.has(parentId)) {
        continue;
      }
      visited.add(parentId);

      const parentNode = nodeById.get(parentId);
      if (!safeText(parentNode[primaryChildKey])) {
        return { parentId, side: normalizedPreferred };
      }
      if (!safeText(parentNode[secondaryChildKey])) {
        return {
          parentId,
          side: normalizedPreferred === 'right' ? 'left' : 'right',
        };
      }

      const primaryChildId = safeText(parentNode[primaryChildKey]);
      const secondaryChildId = safeText(parentNode[secondaryChildKey]);
      if (primaryChildId && nodeById.has(primaryChildId)) {
        queue.push(primaryChildId);
      }
      if (secondaryChildId && nodeById.has(secondaryChildId)) {
        queue.push(secondaryChildId);
      }
    }

    return null;
  };

  const findExtremePlacement = (startingParentId, preferredSide) => {
    const normalizedPreferred = normalizeBinarySide(preferredSide) === 'right' ? 'right' : 'left';
    const childKey = normalizedPreferred === 'right' ? 'rightChildId' : 'leftChildId';
    const resolvedStartParentId = nodeById.has(startingParentId) ? startingParentId : LIVE_TREE_GLOBAL_ROOT_ID;
    let currentParentId = resolvedStartParentId;
    const visited = new Set();

    while (currentParentId && nodeById.has(currentParentId) && !visited.has(currentParentId)) {
      visited.add(currentParentId);
      const currentNode = nodeById.get(currentParentId);
      const nextChildId = safeText(currentNode?.[childKey]);
      if (!nextChildId || !nodeById.has(nextChildId)) {
        return { parentId: currentParentId, side: normalizedPreferred };
      }
      currentParentId = nextChildId;
    }

    return null;
  };

  members.forEach((member, index) => {
    const nodeId = memberNodeIdByIndex.get(index);
    const node = nodeById.get(nodeId);
    if (!node) {
      return;
    }

    const sponsorLookup = normalizeTreeNextLiveLookupKey(member?.sponsorUsername);
    const sponsorNodeId = (sponsorLookup && lookupToNodeId.has(sponsorLookup))
      ? lookupToNodeId.get(sponsorLookup)
      : LIVE_TREE_GLOBAL_ROOT_ID;
    const placementPreference = resolveTreeNextLiveMemberPlacementPreference(member);
    const requestedParentLookup = placementPreference.isSpillover
      ? normalizeTreeNextLiveLookupKey(member?.spilloverParentReference)
      : '';
    const requestedParentId = (requestedParentLookup && lookupToNodeId.has(requestedParentLookup))
      ? lookupToNodeId.get(requestedParentLookup)
      : sponsorNodeId;
    const placement = placementPreference.isExtreme
      ? findExtremePlacement(requestedParentId, placementPreference.preferredSide)
      : findOpenPlacement(requestedParentId, placementPreference.preferredSide);

    if (!placement || !nodeById.has(placement.parentId)) {
      return;
    }

    const parentNode = nodeById.get(placement.parentId);
    if (placement.side === 'right') {
      parentNode.rightChildId = nodeId;
    } else {
      parentNode.leftChildId = nodeId;
    }

    node.parent = placement.parentId;
    node.side = placement.side;
    node.placementParentId = placement.parentId;
    node.placementSide = placement.side;
    node.sponsorId = sponsorNodeId === nodeId ? LIVE_TREE_GLOBAL_ROOT_ID : sponsorNodeId;
    if (!nodeById.has(node.sponsorId)) {
      node.sponsorId = LIVE_TREE_GLOBAL_ROOT_ID;
    }
    node.globalSponsorId = node.sponsorId;
    node.isSpillover = placementPreference.isSpillover
      || Boolean(node.sponsorId && node.sponsorId !== node.parent);
    node.sponsorLeg = node.sponsorId === node.parent ? node.side : '';
  });

  const viewerNodeId = resolveTreeNextLiveViewerGlobalNodeId(nodeById, lookupToNodeId);
  const includedNodeIds = new Set();
  const queue = [viewerNodeId];
  while (queue.length > 0) {
    const candidateId = safeText(queue.shift());
    if (!candidateId || includedNodeIds.has(candidateId) || !nodeById.has(candidateId)) {
      continue;
    }
    includedNodeIds.add(candidateId);
    const candidateNode = nodeById.get(candidateId);
    const leftChildId = safeText(candidateNode?.leftChildId);
    const rightChildId = safeText(candidateNode?.rightChildId);
    if (leftChildId && nodeById.has(leftChildId)) {
      queue.push(leftChildId);
    }
    if (rightChildId && nodeById.has(rightChildId)) {
      queue.push(rightChildId);
    }
  }

  const sourceRootNode = nodeById.get(viewerNodeId) || nodeById.get(LIVE_TREE_GLOBAL_ROOT_ID) || null;
  const scopedNodes = [createTreeNextLiveScopedRootNode(sourceRootNode)];

  for (const includedNodeId of includedNodeIds) {
    if (includedNodeId === viewerNodeId || !nodeById.has(includedNodeId)) {
      continue;
    }
    const sourceNode = nodeById.get(includedNodeId);
    const sourceParentId = safeText(sourceNode?.parent);
    const mappedParentId = sourceParentId === viewerNodeId
      ? 'root'
      : (includedNodeIds.has(sourceParentId) ? sourceParentId : 'root');
    const sourceSponsorId = safeText(sourceNode?.sponsorId);
    let mappedSponsorId = '';
    if (sourceSponsorId === viewerNodeId) {
      mappedSponsorId = 'root';
    } else if (sourceSponsorId && includedNodeIds.has(sourceSponsorId)) {
      mappedSponsorId = sourceSponsorId;
    } else if (sourceNode?.isSpillover) {
      mappedSponsorId = 'root';
    } else {
      mappedSponsorId = mappedParentId || 'root';
    }

    const scopedNode = {
      ...sourceNode,
      parent: mappedParentId,
      sponsorId: mappedSponsorId,
      sourceSponsorId,
    };
    scopedNode.sponsorLeg = scopedNode.sponsorId === scopedNode.parent
      ? normalizeBinarySide(scopedNode.side)
      : '';
    scopedNode.isSpillover = Boolean(
      scopedNode.sponsorId
      && scopedNode.parent
      && scopedNode.sponsorId !== scopedNode.parent,
    );
    scopedNodes.push(scopedNode);
  }

  const normalizedScopedNodes = rebuildTreeNextLiveChildReferences(scopedNodes);
  if (normalizedScopedNodes.length > 0) {
    return normalizedScopedNodes;
  }
  return rebuildTreeNextLiveChildReferences([createTreeNextLiveScopedRootNode(null)]);
}

async function fetchTreeNextLiveRegisteredMembers() {
  const response = await fetch(resolveEnrollRegisteredMembersApi(), {
    method: 'GET',
    cache: 'no-store',
    credentials: 'same-origin',
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = safeText(payload?.error) || `Unable to load registered members (${response.status}).`;
    throw new Error(message);
  }
  return Array.isArray(payload?.members) ? payload.members : [];
}

async function loadTreeNextLiveNodes() {
  try {
    const members = await fetchTreeNextLiveRegisteredMembers();
    return buildTreeNextNodesFromRegisteredMembers(members);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load live binary tree data.';
    showBootError(message);
    return buildTreeNextNodesFromRegisteredMembers([]);
  }
}

function resolveTreeNextLiveNodeSignature(node = {}) {
  const safeNode = node && typeof node === 'object' ? node : {};
  const paletteSignature = isAvatarPaletteRecord(safeNode.avatarPalette)
    ? [
      normalizeRgbTriplet(safeNode.avatarPalette.light?.[0], safeNode.avatarPalette.light?.[1], safeNode.avatarPalette.light?.[2]).join(','),
      normalizeRgbTriplet(safeNode.avatarPalette.mid?.[0], safeNode.avatarPalette.mid?.[1], safeNode.avatarPalette.mid?.[2]).join(','),
      normalizeRgbTriplet(safeNode.avatarPalette.dark?.[0], safeNode.avatarPalette.dark?.[1], safeNode.avatarPalette.dark?.[2]).join(','),
    ].join('/')
    : '';
  const colorTripletSignature = Array.isArray(safeNode.avatarColorRgb) && safeNode.avatarColorRgb.length >= 3
    ? normalizeRgbTriplet(safeNode.avatarColorRgb[0], safeNode.avatarColorRgb[1], safeNode.avatarColorRgb[2]).join(',')
    : '';
  return [
    safeText(safeNode.id),
    safeText(safeNode.parent),
    normalizeBinarySide(safeNode.side),
    safeText(safeNode.sponsorId),
    safeText(safeNode.accountStatus || safeNode.status),
    safeText(safeNode.rank || safeNode.accountRank),
    safeText(safeNode.title),
    Math.floor(safeNumber(safeNode.volume, 0)),
    safeText(safeNode.businessCenterNodeType),
    safeText(safeNode.memberCode),
    safeNode.isSpillover ? '1' : '0',
    safeText(safeNode.avatarSeed),
    safeText(safeNode.avatarColor),
    safeText(safeNode.avatarUrl),
    colorTripletSignature,
    paletteSignature,
  ].join('|');
}

function computeTreeNextLiveNodesSignature(nodesInput = []) {
  const safeNodes = Array.isArray(nodesInput) ? nodesInput : [];
  return safeNodes
    .map((node) => resolveTreeNextLiveNodeSignature(node))
    .filter(Boolean)
    .sort()
    .join('~');
}

function updateTreeNextLiveSnapshotHash(nodesInput = state.nodes) {
  if (!state.liveSync || typeof state.liveSync !== 'object') {
    return '';
  }
  const nextHash = computeTreeNextLiveNodesSignature(nodesInput);
  state.liveSync.lastAppliedHash = nextHash;
  return nextHash;
}

function resolveTreeNextLiveSyncIntervalMs() {
  return document.visibilityState === 'hidden'
    ? TREE_NEXT_LIVE_SYNC_HIDDEN_INTERVAL_MS
    : TREE_NEXT_LIVE_SYNC_VISIBLE_INTERVAL_MS;
}

function clearTreeNextLiveSyncTimer() {
  const timerId = Math.floor(safeNumber(state.liveSync?.timerId, 0));
  if (timerId > 0) {
    window.clearTimeout(timerId);
  }
  if (state.liveSync && typeof state.liveSync === 'object') {
    state.liveSync.timerId = 0;
  }
}

function shouldPauseTreeNextLiveSync() {
  if (state.enroll?.submitting || state.enroll?.pendingPlacement) {
    return true;
  }
  if (state.pendingPlacementReveal) {
    return true;
  }
  return Object.keys(state.placementFxTracks).length > 0;
}

function resolveTreeNextLiveAddedNodeIds(previousNodesInput = [], nextNodesInput = []) {
  const previousNodes = Array.isArray(previousNodesInput) ? previousNodesInput : [];
  const nextNodes = Array.isArray(nextNodesInput) ? nextNodesInput : [];
  if (!previousNodes.length || !nextNodes.length) {
    return [];
  }

  const previousNodeIds = new Set();
  for (const node of previousNodes) {
    const nodeId = safeText(node?.id);
    if (!nodeId) {
      continue;
    }
    previousNodeIds.add(nodeId);
  }

  const addedNodeIds = [];
  for (const node of nextNodes) {
    const nodeId = safeText(node?.id);
    if (!nodeId || previousNodeIds.has(nodeId) || nodeId === 'root') {
      continue;
    }
    const parentId = safeText(node?.parent);
    const side = normalizeBinarySide(node?.side);
    if (!parentId || !side) {
      continue;
    }
    addedNodeIds.push(nodeId);
  }
  return addedNodeIds;
}

function startTreeNextLiveAddedNodeAnimations(nodeIdsInput = [], nowMs = getNowMs()) {
  const nodeIds = Array.isArray(nodeIdsInput) ? nodeIdsInput : [];
  if (!nodeIds.length) {
    return [];
  }
  const limit = Math.max(0, Math.floor(safeNumber(
    TREE_NEXT_LIVE_SYNC_NEW_NODE_ANIMATION_LIMIT,
    24,
  )));
  const animatedNodeIds = limit > 0 ? nodeIds.slice(0, limit) : [];
  for (const nodeId of animatedNodeIds) {
    startPlacementGrowAnimation(nodeId, nowMs);
  }
  return animatedNodeIds;
}

function applyTreeNextLiveNodes(nextNodes, options = {}) {
  const safeNextNodes = Array.isArray(nextNodes) ? nextNodes : [];
  const previousNodes = Array.isArray(state.nodes) ? state.nodes : [];
  const animateNewNodes = options?.animateNewNodes === true;
  const addedNodeIds = animateNewNodes
    ? resolveTreeNextLiveAddedNodeIds(previousNodes, safeNextNodes)
    : [];
  const previousSelectedId = safeText(state.selectedId);
  const previousHash = safeText(state.liveSync?.lastAppliedHash);
  const nextHash = computeTreeNextLiveNodesSignature(safeNextNodes);
  const force = options?.force === true;
  if (!force && previousHash && nextHash === previousHash) {
    return {
      applied: false,
      unchanged: true,
    };
  }

  state.nodes = safeNextNodes;
  state.adapter.setNodes(state.nodes);
  rebuildNodeChildLegIndex();
  updateTreeNextLiveSnapshotHash(state.nodes);
  const homeNodeId = resolvePreferredGlobalHomeNodeId();
  const homeNode = resolveNodeById(homeNodeId) || resolveNodeById('root');
  maybeRefreshAccountOverviewRemoteSnapshot(homeNode);

  if (previousSelectedId) {
    const selectedStillExists = state.nodes.some((node) => safeText(node?.id) === previousSelectedId);
    if (!selectedStillExists) {
      setSelectedNode('', { animate: false });
    }
  }

  if (isTreeNextEnrollModalOpen()) {
    syncTreeNextEnrollSpilloverAvailability();
    syncTreeNextEnrollSponsorField();
    syncTreeNextEnrollLegPositionField();
  }

  const animatedNodeIds = animateNewNodes
    ? startTreeNextLiveAddedNodeAnimations(addedNodeIds, getNowMs())
    : [];

  return {
    applied: true,
    unchanged: false,
    animatedNodeIds,
  };
}

async function syncTreeNextLiveNodes(options = {}) {
  const {
    force = false,
    silent = true,
    reason = 'timer',
  } = options;

  if (!state.liveSync || typeof state.liveSync !== 'object') {
    return { success: false, skipped: true, error: 'Live sync state unavailable.' };
  }
  if (state.liveSync.inFlight) {
    return { success: false, skipped: true, reason: 'in-flight' };
  }
  if (!force && shouldPauseTreeNextLiveSync()) {
    return { success: false, skipped: true, reason: 'paused' };
  }

  state.liveSync.inFlight = true;
  try {
    const members = await fetchTreeNextLiveRegisteredMembers();
    const nextNodes = buildTreeNextNodesFromRegisteredMembers(members);
    const applyResult = applyTreeNextLiveNodes(nextNodes, {
      force,
      animateNewNodes: true,
    });
    await syncPinnedNodeIdsFromServer(reason);
    state.liveSync.lastSyncedAtMs = Date.now();
    state.liveSync.errorStreak = 0;
    return {
      success: true,
      ...applyResult,
    };
  } catch (error) {
    state.liveSync.lastSyncedAtMs = Date.now();
    state.liveSync.errorStreak = Math.max(0, Math.floor(safeNumber(state.liveSync.errorStreak, 0))) + 1;
    const safeErrorMessage = error instanceof Error ? error.message : String(error);
    console.warn(`[TreeNext] Live sync failed (${reason}): ${safeErrorMessage}`);
    if (!silent && !isTreeNextEnrollModalOpen()) {
      setTreeNextEnrollFeedback(`Live sync warning: ${safeErrorMessage}`, false);
    }
    return {
      success: false,
      skipped: false,
      error: safeErrorMessage,
    };
  } finally {
    state.liveSync.inFlight = false;
  }
}

function scheduleTreeNextLiveSync(delayMs = resolveTreeNextLiveSyncIntervalMs()) {
  if (!state.liveSync || typeof state.liveSync !== 'object') {
    return;
  }
  clearTreeNextLiveSyncTimer();
  const safeDelayMs = Math.max(600, Math.floor(safeNumber(delayMs, resolveTreeNextLiveSyncIntervalMs())));
  state.liveSync.timerId = window.setTimeout(async () => {
    state.liveSync.timerId = 0;
    await syncTreeNextLiveNodes({ force: false, silent: true, reason: 'timer' });
    scheduleTreeNextLiveSync(resolveTreeNextLiveSyncIntervalMs());
  }, safeDelayMs);
}

function startTreeNextLiveSync() {
  if (!state.liveSync || typeof state.liveSync !== 'object') {
    return;
  }
  if (state.liveSync.started) {
    return;
  }
  state.liveSync.started = true;
  scheduleTreeNextLiveSync(TREE_NEXT_LIVE_SYNC_INITIAL_DELAY_MS);
}

function onTreeNextLiveSyncVisibilityChange() {
  if (!state.liveSync?.started) {
    return;
  }
  if (document.visibilityState === 'visible') {
    void syncTreeNextLiveNodes({ force: true, silent: true, reason: 'visibility' });
  }
  scheduleTreeNextLiveSync(resolveTreeNextLiveSyncIntervalMs());
}

function onTreeNextLiveSyncWindowFocus() {
  if (!state.liveSync?.started) {
    return;
  }
  void syncTreeNextLiveNodes({ force: true, silent: true, reason: 'focus' });
  scheduleTreeNextLiveSync(resolveTreeNextLiveSyncIntervalMs());
}

function updateCanvasSize() {
  const width = Math.max(1, Math.floor(window.innerWidth || 1));
  const height = Math.max(1, Math.floor(window.innerHeight || 1));
  const dpr = clamp(window.devicePixelRatio || 1, 1, 2.5);

  state.renderSize.width = width;
  state.renderSize.height = height;
  state.renderSize.dpr = dpr;

  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  glassBackdropCanvas.width = Math.floor(width * dpr);
  glassBackdropCanvas.height = Math.floor(height * dpr);

  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  glassBackdropContext.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function resolveLayout(width, height) {
  const edgePad = clamp(Math.round(Math.min(width, height) * 0.022), 20, 28);
  const sideNavMaxWidth = Math.max(320, width - (edgePad * 2) - 24);
  const sideNavWidth = clamp(390, 320, sideNavMaxWidth);
  const sideNavVerticalInset = clamp(edgePad - 10, 10, edgePad);

  const workspace = {
    x: 0,
    y: 0,
    width,
    height,
  };
  const sideNav = {
    x: edgePad,
    y: sideNavVerticalInset,
    width: sideNavWidth,
    height: height - (sideNavVerticalInset * 2),
  };
  const sideNavToggle = {
    x: edgePad,
    y: sideNavVerticalInset,
    width: 124,
    height: 30,
  };
  const topBar = {
    width: 0,
    height: 0,
  };
  topBar.x = Math.round((width - topBar.width) / 2);
  topBar.y = edgePad;

  const bottomBar = {
    width: clamp(Math.round(width * 0.29), 320, 430),
    height: 92,
  };
  bottomBar.x = Math.round((width - bottomBar.width) / 2);
  bottomBar.y = height - edgePad - bottomBar.height - 10;

  const viewport = {
    x: 0,
    y: 0,
    width,
    height,
    centerX: width / 2,
    baseY: Math.max(78, Math.round(height * 0.12)),
  };

  return {
    workspace,
    sideNav,
    sideNavToggle,
    topBar,
    bottomBar,
    viewport,
  };
}

function roundedRectPath(ctx, x, y, width, height, radius) {
  const clampedRadius = clamp(radius, 0, Math.min(width / 2, height / 2));
  ctx.beginPath();
  ctx.moveTo(x + clampedRadius, y);
  ctx.lineTo(x + width - clampedRadius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + clampedRadius);
  ctx.lineTo(x + width, y + height - clampedRadius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - clampedRadius, y + height);
  ctx.lineTo(x + clampedRadius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - clampedRadius);
  ctx.lineTo(x, y + clampedRadius);
  ctx.quadraticCurveTo(x, y, x + clampedRadius, y);
  ctx.closePath();
}

function fillRoundedRect(ctx, x, y, width, height, radius, fillStyle) {
  roundedRectPath(ctx, x, y, width, height, radius);
  ctx.fillStyle = fillStyle;
  ctx.fill();
}

function strokeRoundedRect(ctx, x, y, width, height, radius, strokeStyle, lineWidth = 1) {
  roundedRectPath(ctx, x, y, width, height, radius);
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = strokeStyle;
  ctx.stroke();
}

function drawText(text, x, y, options = {}) {
  const {
    size = 12,
    weight = 500,
    family = '"SF Pro Text", "SF Pro Display", "Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    color = '#d5d8e1',
    align = 'left',
    baseline = 'middle',
    maxWidth = undefined,
  } = options;
  context.font = `${weight} ${size}px ${family}`;
  context.fillStyle = color;
  context.textAlign = align;
  context.textBaseline = baseline;
  if (typeof maxWidth === 'number') {
    context.fillText(text, x, y, maxWidth);
  } else {
    context.fillText(text, x, y);
  }
}

function line(ctx, fromX, fromY, toX, toY, strokeStyle, lineWidth = 1) {
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

function drawChevronGlyph(centerX, centerY, options = {}) {
  const {
    size = 8,
    color = '#696f7c',
    expanded = false,
    lineWidth = 1.7,
  } = options;
  const half = Math.max(2, size * 0.5);
  context.save();
  context.beginPath();
  if (expanded) {
    context.moveTo(centerX - half, centerY + 1.4);
    context.lineTo(centerX, centerY - 1.2);
    context.lineTo(centerX + half, centerY + 1.4);
  } else {
    context.moveTo(centerX - half, centerY - 1.2);
    context.lineTo(centerX, centerY + 1.4);
    context.lineTo(centerX + half, centerY - 1.2);
  }
  context.strokeStyle = color;
  context.lineWidth = lineWidth;
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.stroke();
  context.restore();
}

function drawSearchGlyph(centerX, centerY, options = {}) {
  const {
    color = '#404652',
    size = 20,
    weight = 400,
  } = options;
  drawText(String.fromCodePoint(0xE8B6), centerX, centerY, {
    size,
    weight,
    family: '"Material Symbols Outlined", "Segoe UI Symbol", sans-serif',
    color,
    align: 'center',
  });
}

function drawFallbackFamilyHistoryGlyph(centerX, centerY, size = 18, color = '#077AFF') {
  const safeSize = Math.max(12, safeNumber(size, 18));
  const nodeRadius = Math.max(1.8, safeSize * 0.12);
  const leftX = centerX - (safeSize * 0.22);
  const rightX = centerX + (safeSize * 0.22);
  const topY = centerY - (safeSize * 0.2);
  const trunkY = centerY + (safeSize * 0.05);
  const bottomY = centerY + (safeSize * 0.24);
  context.save();
  context.strokeStyle = color;
  context.fillStyle = color;
  context.lineWidth = Math.max(1.3, safeSize * 0.07);
  context.lineCap = 'round';
  context.beginPath();
  context.moveTo(leftX, topY + nodeRadius);
  context.lineTo(leftX, trunkY);
  context.lineTo(rightX, trunkY);
  context.lineTo(rightX, topY + nodeRadius);
  context.moveTo(centerX, trunkY);
  context.lineTo(centerX, bottomY - nodeRadius);
  context.stroke();
  context.beginPath();
  context.arc(leftX, topY, nodeRadius, 0, Math.PI * 2);
  context.arc(rightX, topY, nodeRadius, 0, Math.PI * 2);
  context.arc(centerX, bottomY, nodeRadius, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawFallbackPersonAddGlyph(centerX, centerY, size = 18, color = '#077AFF') {
  const safeSize = Math.max(12, safeNumber(size, 18));
  const headRadius = Math.max(1.8, safeSize * 0.12);
  const headX = centerX - (safeSize * 0.14);
  const headY = centerY - (safeSize * 0.2);
  const shouldersY = centerY + (safeSize * 0.06);
  const plusX = centerX + (safeSize * 0.2);
  const plusY = centerY - (safeSize * 0.03);
  const plusHalf = safeSize * 0.12;
  context.save();
  context.fillStyle = color;
  context.strokeStyle = color;
  context.lineWidth = Math.max(1.3, safeSize * 0.075);
  context.lineCap = 'round';
  context.beginPath();
  context.arc(headX, headY, headRadius, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.moveTo(headX - (safeSize * 0.2), shouldersY + (safeSize * 0.18));
  context.quadraticCurveTo(headX, shouldersY - (safeSize * 0.08), headX + (safeSize * 0.2), shouldersY + (safeSize * 0.18));
  context.lineTo(headX + (safeSize * 0.2), shouldersY + (safeSize * 0.28));
  context.lineTo(headX - (safeSize * 0.2), shouldersY + (safeSize * 0.28));
  context.closePath();
  context.fill();
  context.beginPath();
  context.moveTo(plusX - plusHalf, plusY);
  context.lineTo(plusX + plusHalf, plusY);
  context.moveTo(plusX, plusY - plusHalf);
  context.lineTo(plusX, plusY + plusHalf);
  context.stroke();
  context.restore();
}

function drawMaterialButtonIcon(iconName, centerX, centerY, options = {}) {
  const {
    size = 18,
    weight = 500,
    color = '#077AFF',
    fallbackGlyph = null,
    fill = 1,
  } = options;
  const safeName = safeText(iconName);
  context.save();
  context.font = `${weight} ${size}px "Material Symbols Outlined", "Segoe UI Symbol", sans-serif`;
  const measuredWidth = context.measureText(safeName).width;
  const looksLikeLigature = measuredWidth > 0 && measuredWidth <= (size * 1.8);
  context.restore();
  if (looksLikeLigature) {
    context.save();
    context.font = `${weight} ${size}px "Material Symbols Outlined", "Segoe UI Symbol", sans-serif`;
    try {
      // Use filled Material Symbols when canvas supports variation settings.
      context.fontVariationSettings = `"FILL" ${Math.max(0, Math.min(1, safeNumber(fill, 1)))}, "wght" ${Math.max(100, Math.min(700, Math.round(safeNumber(weight, 500))))}, "GRAD" 0, "opsz" ${Math.max(20, Math.round(safeNumber(size, 18)))}`;
    } catch {
      // Ignore unsupported canvas font variation settings.
    }
    context.fillStyle = color;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(safeName, centerX, centerY);
    context.restore();
    return;
  }
  if (typeof fallbackGlyph === 'function') {
    fallbackGlyph(centerX, centerY, size, color);
  }
}

function colorWithAlpha(rgbTriplet = [0, 0, 0], alpha = 1) {
  const [r, g, b] = Array.isArray(rgbTriplet) ? rgbTriplet : [0, 0, 0];
  return `rgba(${Math.round(clamp(safeNumber(r, 0), 0, 255))}, ${Math.round(clamp(safeNumber(g, 0), 0, 255))}, ${Math.round(clamp(safeNumber(b, 0), 0, 255))}, ${clamp(safeNumber(alpha, 1), 0, 1).toFixed(3)})`;
}

function resolveNodeAvatarSeed(nodeInput = null, fallback = '') {
  const node = nodeInput && typeof nodeInput === 'object' ? nodeInput : null;
  const explicitSeed = safeText(
    node?.avatarSeed
    || node?.avatar_seed
    || node?.profileSeed
    || node?.profile_seed,
  );
  if (explicitSeed) {
    return explicitSeed;
  }
  const candidates = [
    node?.userId,
    node?.user_id,
    node?.memberId,
    node?.member_id,
    node?.memberUsername,
    node?.member_username,
    node?.username,
    node?.memberCode,
    node?.member_code,
    node?.email,
    node?.id,
    fallback,
  ];
  for (const candidate of candidates) {
    const safeCandidate = safeText(candidate);
    if (safeCandidate) {
      return safeCandidate;
    }
  }
  return '';
}

function resolveNodeAvatarPalette(nodeId = '', options = {}) {
  if (isAvatarPaletteRecord(options?.palette)) {
    const palette = options.palette;
    return {
      light: normalizeRgbTriplet(palette.light[0], palette.light[1], palette.light[2]),
      mid: normalizeRgbTriplet(palette.mid[0], palette.mid[1], palette.mid[2]),
      dark: normalizeRgbTriplet(palette.dark[0], palette.dark[1], palette.dark[2]),
    };
  }
  const sourceNode = options?.node && typeof options.node === 'object'
    ? options.node
    : null;
  const ignoreSourcePalette = options?.ignoreSourcePalette === true;
  if (!ignoreSourcePalette) {
    const sourcePalette = resolveAvatarPaletteFromRecord(sourceNode);
    if (sourcePalette) {
      return sourcePalette;
    }
    const sourceColorTriplet = resolveAvatarColorTripletFromRecord(sourceNode);
    if (sourceColorTriplet) {
      return buildAvatarPaletteFromColorTriplet(sourceColorTriplet);
    }
  }
  const variant = safeText(options.variant).toLowerCase();
  if (variant === 'root') {
    return APPLE_MAPS_NODE_PALETTES.root;
  }
  if (variant === 'accent') {
    return APPLE_MAPS_NODE_PALETTES.accent;
  }
  if (variant === 'neutral') {
    return APPLE_MAPS_NODE_PALETTES.neutral;
  }
  if (variant && APPLE_MAPS_NODE_PALETTES[variant]) {
    return APPLE_MAPS_NODE_PALETTES[variant];
  }
  const safeId = safeText(resolveNodeAvatarSeed(sourceNode, nodeId)).toLowerCase();
  if (safeId === 'root') {
    return APPLE_MAPS_NODE_PALETTES.root;
  }
  if (!safeId) {
    return APPLE_MAPS_NODE_PALETTES.neutral;
  }
  const paletteKeys = APPLE_MAPS_NODE_COLOR_ROTATION;
  const paletteIndex = Math.max(0, Math.min(
    paletteKeys.length - 1,
    Math.floor(hashUnit(safeId) * paletteKeys.length),
  ));
  const paletteKey = paletteKeys[paletteIndex];
  return APPLE_MAPS_NODE_PALETTES[paletteKey] || APPLE_MAPS_NODE_PALETTES.neutral;
}

function createNodeAvatarGradient(cx, cy, radius, nodeId, options = {}) {
  const safeRadius = Math.max(1, safeNumber(radius, 1));
  const alpha = clamp(safeNumber(options.alpha, 0.98), 0, 1);
  const palette = resolveNodeAvatarPalette(nodeId, options);
  const gradient = context.createLinearGradient(
    cx - (safeRadius * 0.58),
    cy - (safeRadius * 0.62),
    cx + (safeRadius * 0.74),
    cy + (safeRadius * 0.76),
  );
  gradient.addColorStop(0, colorWithAlpha(palette.light, alpha));
  gradient.addColorStop(0.56, colorWithAlpha(palette.mid, alpha));
  gradient.addColorStop(1, colorWithAlpha(palette.dark, alpha));
  return gradient;
}

function createNodeAvatarSheen(cx, cy, radius, options = {}) {
  const safeRadius = Math.max(1, safeNumber(radius, 1));
  const alpha = clamp(safeNumber(options.alpha, 0.98), 0, 1);
  const sheenStrength = clamp(safeNumber(options.sheenAlpha, 0.18), 0, 1) * alpha;
  const gradient = context.createRadialGradient(
    cx - (safeRadius * 0.34),
    cy - (safeRadius * 0.42),
    Math.max(1, safeRadius * 0.08),
    cx - (safeRadius * 0.24),
    cy - (safeRadius * 0.32),
    safeRadius,
  );
  gradient.addColorStop(0, `rgba(255, 255, 255, ${sheenStrength.toFixed(3)})`);
  gradient.addColorStop(0.58, `rgba(255, 255, 255, ${(sheenStrength * 0.36).toFixed(3)})`);
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  return gradient;
}

function fillNodeAvatarCircle(cx, cy, radius, nodeId, options = {}) {
  const safeRadius = Math.max(0.2, safeNumber(radius, 0.2));
  const gradient = createNodeAvatarGradient(cx, cy, safeRadius, nodeId, options);
  context.beginPath();
  context.arc(cx, cy, safeRadius, 0, Math.PI * 2);
  context.fillStyle = gradient;
  context.fill();

  const sheen = createNodeAvatarSheen(cx, cy, safeRadius, options);
  context.beginPath();
  context.arc(cx, cy, safeRadius, 0, Math.PI * 2);
  context.fillStyle = sheen;
  context.fill();
}

function drawFavoriteNodeAvatar(cx, cy, radius, nodeId, initials, hovered = false) {
  const safeRadius = Math.max(14, safeNumber(radius, 0));
  const iconRadius = hovered ? (safeRadius * 1.03) : safeRadius;
  const safeNodeId = safeText(nodeId);
  const nodeRecord = resolveNodeById(safeNodeId);

  const avatarRender = drawResolvedAvatarCircle(cx, cy, iconRadius, safeNodeId, {
    node: nodeRecord,
    variant: 'auto',
    alpha: 0.98,
    sheenAlpha: hovered ? 0.22 : 0.18,
  });

  if (!avatarRender.usedPhoto) {
    drawText(initials, cx, cy + 0.5, {
      size: Math.max(11, Math.floor(iconRadius * 0.54)),
      weight: 700,
      color: '#F7FAFF',
      align: 'center',
    });
  }
}

function registerButton({ id, x, y, width, height, action, rounded = true }) {
  state.buttons.push({
    id,
    x,
    y,
    width,
    height,
    action,
    rounded,
  });
}

function buttonUnderPointer(pointerX, pointerY) {
  for (let index = state.buttons.length - 1; index >= 0; index -= 1) {
    const button = state.buttons[index];
    const inside = (
      pointerX >= button.x
      && pointerX <= button.x + button.width
      && pointerY >= button.y
      && pointerY <= button.y + button.height
    );
    if (inside) {
      return button;
    }
  }
  return null;
}

function pointInsideRect(pointX, pointY, rect) {
  if (!rect) {
    return false;
  }
  return (
    pointX >= rect.x
    && pointX <= rect.x + rect.width
    && pointY >= rect.y
    && pointY <= rect.y + rect.height
  );
}

function pointInsideActiveSideNav(pointX, pointY) {
  if (!state.ui.sideNavOpen) {
    return false;
  }
  return pointInsideRect(pointX, pointY, state.layout?.sideNav);
}

function getSideNavFavoritesState() {
  if (!state.ui || typeof state.ui !== 'object') {
    state.ui = {};
  }
  if (!state.ui.sideNavFavorites || typeof state.ui.sideNavFavorites !== 'object') {
    state.ui.sideNavFavorites = {
      viewportRect: null,
      contentWidth: 0,
      scrollX: 0,
      dragActive: false,
      dragPointerId: null,
      dragStartX: 0,
      dragStartScrollX: 0,
      dragStartY: 0,
      dragMoved: false,
      tapAction: '',
      placesCacheKey: '',
      placesCacheLimit: 0,
      placesCache: [],
    };
  }
  return state.ui.sideNavFavorites;
}

function pointInsideFavoritesCarousel(pointX, pointY) {
  if (!state.ui.sideNavOpen) {
    return false;
  }
  const favorites = getSideNavFavoritesState();
  return pointInsideRect(pointX, pointY, favorites.viewportRect);
}

function clampFavoritesScroll(value) {
  const favorites = getSideNavFavoritesState();
  const maxScroll = Math.max(0, safeNumber(favorites.contentWidth, 0) - safeNumber(favorites.viewportRect?.width, 0));
  return clamp(safeNumber(value, 0), 0, maxScroll);
}

function setFavoritesScroll(nextScroll) {
  const favorites = getSideNavFavoritesState();
  favorites.scrollX = clampFavoritesScroll(nextScroll);
}

function scrollFavoritesBy(delta) {
  const favorites = getSideNavFavoritesState();
  setFavoritesScroll(safeNumber(favorites.scrollX, 0) + safeNumber(delta, 0));
}

function beginFavoritesCarouselDrag(pointerId, pointerX, pointerY = 0, tapAction = '') {
  const favorites = getSideNavFavoritesState();
  favorites.dragActive = true;
  favorites.dragPointerId = pointerId;
  favorites.dragStartX = safeNumber(pointerX, 0);
  favorites.dragStartY = safeNumber(pointerY, 0);
  favorites.dragStartScrollX = safeNumber(favorites.scrollX, 0);
  favorites.dragMoved = false;
  favorites.tapAction = safeText(tapAction);
}

function updateFavoritesCarouselDrag(pointerId, pointerX, pointerY = 0) {
  const favorites = getSideNavFavoritesState();
  if (!favorites.dragActive || pointerId !== favorites.dragPointerId) {
    return false;
  }
  const deltaX = safeNumber(pointerX, 0) - safeNumber(favorites.dragStartX, 0);
  const deltaY = safeNumber(pointerY, 0) - safeNumber(favorites.dragStartY, 0);
  setFavoritesScroll(safeNumber(favorites.dragStartScrollX, 0) - deltaX);
  if (!favorites.dragMoved && (Math.abs(deltaX) >= 6 || Math.abs(deltaY) >= 6)) {
    favorites.dragMoved = true;
  }
  return true;
}

function stopFavoritesCarouselDrag(pointerId = null) {
  const favorites = getSideNavFavoritesState();
  if (!favorites.dragActive) {
    return;
  }
  if (pointerId !== null && pointerId !== favorites.dragPointerId) {
    return;
  }
  favorites.dragActive = false;
  favorites.dragPointerId = null;
  favorites.dragStartY = 0;
  favorites.dragMoved = false;
  favorites.tapAction = '';
  if (!state.drag.active) {
    canvas.classList.remove('dragging');
  }
}

function resolveFavoritesCarouselReleaseAction(pointerId) {
  const favorites = getSideNavFavoritesState();
  if (!favorites.dragActive || pointerId !== favorites.dragPointerId) {
    return '';
  }
  const action = favorites.dragMoved ? '' : safeText(favorites.tapAction);
  stopFavoritesCarouselDrag(pointerId);
  return action;
}

function findProjectedNodeAt(pointX, pointY) {
  const projectedNodes = Array.isArray(state.frameResult?.projectedNodes)
    ? state.frameResult.projectedNodes
    : [];
  let best = null;
  for (let index = projectedNodes.length - 1; index >= 0; index -= 1) {
    const node = projectedNodes[index];
    if (isNodeHiddenForPendingPlacement(node.id)) {
      continue;
    }
    const deltaX = pointX - node.x;
    const deltaY = pointY - node.y;
    const baseRadius = node.lodTier === 'dot' ? Math.max(4, node.r + 3) : Math.max(node.r, 5);
    const hitRadius = baseRadius + 4;
    if ((deltaX * deltaX) + (deltaY * deltaY) > hitRadius * hitRadius) {
      continue;
    }
    if (!best || node.r > best.r) {
      best = node;
    }
  }
  return best;
}

function clearBootError() {
  if (bootErrorElement) {
    bootErrorElement.style.display = 'none';
    bootErrorElement.textContent = '';
  }
}

function showBootError(message) {
  const safeMessage = safeText(message) || 'Unknown bootstrap error.';
  if (bootErrorElement) {
    bootErrorElement.textContent = safeMessage;
    bootErrorElement.style.display = 'block';
  }
}

function drawBackground(width, height) {
  context.fillStyle = MAIN_BACKGROUND_COLOR;
  context.fillRect(0, 0, width, height);
}

function drawWorkspaceBackdrop(workspace) {
  // Intentionally blank: plain Apple-gray background, no grid overlay.
}

function drawBackdropBlurRegion(rect, radius = 20, blurPx = 16) {
  const safeBlur = clamp(Math.floor(blurPx), 0, 24);
  if (!safeBlur) {
    return;
  }
  const width = state.renderSize.width;
  const height = state.renderSize.height;
  const padding = Math.max(8, safeBlur * 2);
  const sourceX = Math.max(0, rect.x - padding);
  const sourceY = Math.max(0, rect.y - padding);
  const sourceWidth = Math.max(1, Math.min(width - sourceX, rect.width + (padding * 2)));
  const sourceHeight = Math.max(1, Math.min(height - sourceY, rect.height + (padding * 2)));

  context.save();
  roundedRectPath(context, rect.x, rect.y, rect.width, rect.height, radius);
  context.clip();
  context.filter = `blur(${safeBlur}px)`;
  context.globalAlpha = 0.96;
  context.drawImage(
    glassBackdropCanvas,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
  );
  context.restore();
}

function drawGlassCard(rect, options = {}) {
  const {
    radius = 24,
    blur = 16,
    fillTop = 'rgba(255, 255, 255, 0.9)',
    fillBottom = 'rgba(255, 255, 255, 0.84)',
    edge = 'rgba(255, 255, 255, 0.98)',
    rim = 'rgba(205, 211, 221, 0.78)',
    shadow = 'rgba(102, 109, 123, 0.18)',
    shadowBlur = 28,
    shadowOffsetY = 10,
    bloomStrength = 0.24,
  } = options;

  drawBackdropBlurRegion(rect, radius, blur);

  const gradient = context.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.height);
  gradient.addColorStop(0, fillTop);
  gradient.addColorStop(1, fillBottom);
  fillRoundedRect(context, rect.x, rect.y, rect.width, rect.height, radius, gradient);

  context.save();
  roundedRectPath(context, rect.x, rect.y, rect.width, rect.height, radius);
  context.clip();
  const bloom = context.createRadialGradient(
    rect.x + (rect.width * 0.18),
    rect.y + (rect.height * 0.08),
    0,
    rect.x + (rect.width * 0.18),
    rect.y + (rect.height * 0.08),
    Math.max(rect.width, rect.height) * 0.95,
  );
  bloom.addColorStop(0, `rgba(255, 255, 255, ${clamp(bloomStrength, 0, 1).toFixed(2)})`);
  bloom.addColorStop(0.52, 'rgba(255, 255, 255, 0.14)');
  bloom.addColorStop(1, 'rgba(255, 255, 255, 0)');
  context.fillStyle = bloom;
  context.fillRect(rect.x, rect.y, rect.width, rect.height);
  context.restore();

  context.save();
  context.shadowColor = shadow;
  context.shadowBlur = shadowBlur;
  context.shadowOffsetY = shadowOffsetY;
  strokeRoundedRect(context, rect.x + 0.5, rect.y + 0.5, rect.width - 1, rect.height - 1, radius, edge);
  context.restore();

  strokeRoundedRect(context, rect.x + 0.5, rect.y + 0.5, rect.width - 1, rect.height - 1, radius, rim);

  const innerSheen = context.createLinearGradient(rect.x, rect.y, rect.x + rect.width, rect.y);
  innerSheen.addColorStop(0, 'rgba(255,255,255,0.64)');
  innerSheen.addColorStop(1, 'rgba(255,255,255,0.12)');
  strokeRoundedRect(
    context,
    rect.x + 1.5,
    rect.y + 1.5,
    rect.width - 3,
    rect.height - 3,
    Math.max(2, radius - 2),
    innerSheen,
  );
}

function drawPanelChrome(panel, tone = 'left') {
  void tone;
  fillRoundedRect(context, panel.x, panel.y, panel.width, panel.height, 36, SHELL_PANEL_COLOR);
  strokeRoundedRect(
    context,
    panel.x + 0.5,
    panel.y + 0.5,
    panel.width - 1,
    panel.height - 1,
    36,
    SHELL_PANEL_BORDER_COLOR,
    1,
  );
}

function drawSkeletonSlot(x, y, width, height, radius = 20) {
  fillRoundedRect(context, x, y, width, height, radius, SKELETON_SLOT_COLOR);
}

function drawSmallButton({
  id,
  x,
  y,
  width,
  height,
  label,
  action,
  active = false,
}) {
  const hovered = state.hoveredButtonId === id;
  let fill = 'rgba(255, 255, 255, 0.5)';
  let stroke = 'rgba(197,203,217,0.8)';
  let textColor = '#3f4552';

  if (active) {
    fill = 'rgba(138, 145, 162, 0.92)';
    stroke = 'rgba(116, 123, 140, 0.98)';
    textColor = '#f8f9fc';
  } else if (hovered) {
    fill = 'rgba(255, 255, 255, 0.68)';
    stroke = 'rgba(177, 184, 199, 0.94)';
  }

  context.save();
  if (active || hovered) {
    context.shadowColor = 'rgba(117, 124, 146, 0.18)';
    context.shadowBlur = active ? 12 : 8;
    context.shadowOffsetY = 4;
  }
  fillRoundedRect(context, x, y, width, height, 13, fill);
  context.restore();
  strokeRoundedRect(context, x + 0.5, y + 0.5, width - 1, height - 1, 13, stroke);
  drawText(label, x + (width / 2), y + (height / 2) + 0.5, {
    size: 11,
    weight: active ? 600 : 500,
    color: textColor,
    align: 'center',
  });

  registerButton({
    id,
    x,
    y,
    width,
    height,
    action,
  });
}

function resolveSearchResultScore(node, queryLower) {
  const safeQuery = safeText(queryLower).toLowerCase();
  if (!safeQuery) {
    return 0;
  }

  const nodeId = safeText(node?.id).toLowerCase();
  const name = safeText(node?.name).toLowerCase();
  const username = safeText(node?.username).toLowerCase();
  const rank = safeText(node?.rank).toLowerCase();
  const title = safeText(node?.title).toLowerCase();

  let score = 0;
  if (nodeId === safeQuery) {
    score += 180;
  } else if (nodeId.startsWith(safeQuery)) {
    score += 86;
  } else if (nodeId.includes(safeQuery)) {
    score += 38;
  }

  if (username === safeQuery) {
    score += 170;
  } else if (username.startsWith(safeQuery)) {
    score += 120;
  } else if (username.includes(safeQuery)) {
    score += 54;
  }

  if (name === safeQuery) {
    score += 160;
  } else if (name.startsWith(safeQuery)) {
    score += 112;
  } else if (name.includes(safeQuery)) {
    score += 52;
  }

  if (rank.startsWith(safeQuery)) {
    score += 22;
  } else if (rank.includes(safeQuery)) {
    score += 12;
  }

  if (title.startsWith(safeQuery)) {
    score += 18;
  } else if (title.includes(safeQuery)) {
    score += 10;
  }

  return score;
}

function resolveNodeAvatarCssGradient(nodeId) {
  const safeNodeId = safeText(nodeId);
  const nodeRecord = resolveNodeById(safeNodeId);
  const palette = isSessionAvatarNodeId(safeNodeId)
    ? resolveSessionAvatarPalette()
    : resolveNodeAvatarPalette(safeNodeId, {
      node: nodeRecord,
      variant: safeNodeId.toLowerCase() === 'root' ? 'root' : 'auto',
    });
  return resolveCssGradientFromPalette(palette);
}

function resolveAvatarCssBackgroundForNode(nodeId) {
  const safeNodeId = safeText(nodeId);
  if (isSessionAvatarNodeId(safeNodeId)) {
    return resolveSessionAvatarCssBackground();
  }
  const nodeRecord = resolveNodeById(safeNodeId);
  const photoUrl = resolveNodeAvatarPhotoUrl(nodeRecord);
  if (photoUrl) {
    return {
      image: toCssUrlValue(photoUrl),
      isPhoto: true,
    };
  }
  return {
    image: resolveNodeAvatarCssGradient(safeNodeId),
    isPhoto: false,
  };
}

function resolveCssGradientFromPalette(palette) {
  const safePalette = isAvatarPaletteRecord(palette)
    ? {
      light: normalizeRgbTriplet(palette.light[0], palette.light[1], palette.light[2]),
      mid: normalizeRgbTriplet(palette.mid[0], palette.mid[1], palette.mid[2]),
      dark: normalizeRgbTriplet(palette.dark[0], palette.dark[1], palette.dark[2]),
    }
    : resolveNodeAvatarPalette('neutral', { variant: 'neutral' });
  return `linear-gradient(140deg, ${colorWithAlpha(safePalette.light, 1)} 0%, ${colorWithAlpha(safePalette.mid, 1)} 58%, ${colorWithAlpha(safePalette.dark, 1)} 100%)`;
}

function resolveSearchResultsForQuery(query, limit = SIDE_NAV_SEARCH_RESULT_MAX) {
  const safeQuery = safeText(query).trim();
  const queryLower = safeQuery.toLowerCase();
  if (!queryLower) {
    return [];
  }

  const matches = state.adapter.resolveVisibleNodes({
    ...getUniverseOptions(),
    query: queryLower,
    depth: 'all',
  });
  if (!Array.isArray(matches) || !matches.length) {
    return [];
  }

  const ranked = [];
  for (const candidate of matches) {
    const nodeId = safeText(candidate?.id);
    if (!nodeId) {
      continue;
    }
    const name = safeText(candidate?.name || nodeId) || nodeId;
    const username = safeText(candidate?.username);
    const rank = safeText(candidate?.rank);
    const title = safeText(candidate?.title);
    const subtitleParts = [];
    if (username) {
      subtitleParts.push(`@${username}`);
    }
    if (rank) {
      subtitleParts.push(rank);
    }
    if (!subtitleParts.length && title) {
      subtitleParts.push(title);
    }
    if (!subtitleParts.length) {
      subtitleParts.push(`ID: ${nodeId}`);
    }
    ranked.push({
      id: nodeId,
      name,
      initials: resolveInitials(name),
      username,
      rank,
      title,
      subtitle: subtitleParts.join(' · '),
      depth: Math.max(0, Math.floor(safeNumber(candidate?.depth, 0))),
      score: resolveSearchResultScore(candidate, queryLower),
    });
  }

  ranked.sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }
    if (left.depth !== right.depth) {
      return left.depth - right.depth;
    }
    return safeText(left.name).localeCompare(safeText(right.name));
  });

  return ranked.slice(0, Math.max(1, limit));
}

function closeSearchDropdown() {
  state.ui.sideNavSearchDropdownOpen = false;
  state.ui.sideNavSearchActiveIndex = -1;
}

function refreshSearchResults(options = {}) {
  const {
    openDropdown = false,
    preserveActive = false,
  } = options;
  const safeQuery = safeText(state.query).trim();
  const previousActive = preserveActive
    ? safeText(state.ui.sideNavSearchResults?.[state.ui.sideNavSearchActiveIndex]?.id)
    : '';
  const nextResults = resolveSearchResultsForQuery(safeQuery);
  state.ui.sideNavSearchResults = nextResults;

  if (!safeQuery || !nextResults.length) {
    closeSearchDropdown();
    return;
  }

  if (previousActive) {
    const previousIndex = nextResults.findIndex((entry) => safeText(entry.id) === previousActive);
    state.ui.sideNavSearchActiveIndex = previousIndex >= 0 ? previousIndex : 0;
  } else {
    const currentIndex = Math.floor(safeNumber(state.ui.sideNavSearchActiveIndex, -1));
    state.ui.sideNavSearchActiveIndex = (
      currentIndex >= 0 && currentIndex < nextResults.length
    )
      ? currentIndex
      : 0;
  }

  if (openDropdown) {
    state.ui.sideNavSearchDropdownOpen = true;
  }
}

function moveSearchActiveIndex(step) {
  const results = Array.isArray(state.ui.sideNavSearchResults) ? state.ui.sideNavSearchResults : [];
  if (!results.length) {
    return false;
  }
  const safeStep = Math.sign(safeNumber(step, 0)) || 1;
  const current = Math.floor(safeNumber(state.ui.sideNavSearchActiveIndex, -1));
  const seed = current < 0 ? (safeStep > 0 ? -1 : 0) : current;
  const nextIndex = (seed + safeStep + results.length) % results.length;
  state.ui.sideNavSearchActiveIndex = nextIndex;
  state.ui.sideNavSearchDropdownOpen = true;
  return true;
}

function focusSearchResultById(nodeId, animated = true) {
  const targetNodeId = safeText(nodeId);
  if (!targetNodeId) {
    return false;
  }
  const focused = focusNode(targetNodeId, 30, animated);
  if (!focused) {
    return false;
  }

  const result = (Array.isArray(state.ui.sideNavSearchResults) ? state.ui.sideNavSearchResults : [])
    .find((entry) => safeText(entry.id) === targetNodeId);
  if (result) {
    state.query = safeText(result.username || result.name || targetNodeId);
  }
  closeSearchDropdown();
  return true;
}

function focusFirstSearchResult(animated = true) {
  if (!Array.isArray(state.ui.sideNavSearchResults) || !state.ui.sideNavSearchResults.length) {
    refreshSearchResults({ openDropdown: false, preserveActive: false });
  }
  const results = Array.isArray(state.ui.sideNavSearchResults) ? state.ui.sideNavSearchResults : [];
  if (!results.length) {
    return false;
  }
  const activeIndex = clamp(
    Math.floor(safeNumber(state.ui.sideNavSearchActiveIndex, 0)),
    0,
    Math.max(0, results.length - 1),
  );
  const target = results[activeIndex] || results[0];
  return focusSearchResultById(target.id, animated);
}

function ensureSideNavSearchDropdown() {
  let dropdown = document.getElementById(SIDE_NAV_SEARCH_DROPDOWN_ID);
  if (dropdown instanceof HTMLDivElement) {
    return dropdown;
  }

  dropdown = document.createElement('div');
  dropdown.id = SIDE_NAV_SEARCH_DROPDOWN_ID;
  dropdown.style.position = 'fixed';
  dropdown.style.left = '0px';
  dropdown.style.top = '0px';
  dropdown.style.width = '0px';
  dropdown.style.maxHeight = '264px';
  dropdown.style.overflowY = 'auto';
  dropdown.style.overflowX = 'hidden';
  dropdown.style.padding = '6px';
  dropdown.style.boxSizing = 'border-box';
  dropdown.style.borderRadius = '16px';
  dropdown.style.border = '1px solid #DEE3EC';
  dropdown.style.background = '#FFFFFF';
  dropdown.style.boxShadow = '0 14px 28px rgba(46, 57, 77, 0.18), 0 4px 10px rgba(46, 57, 77, 0.12)';
  dropdown.style.backdropFilter = 'blur(6px)';
  dropdown.style.webkitBackdropFilter = 'blur(6px)';
  dropdown.style.zIndex = '24';
  dropdown.style.display = 'none';
  dropdown.style.opacity = '0';

  dropdown.addEventListener('mousedown', (event) => {
    event.preventDefault();
  });
  dropdown.addEventListener('mousemove', (event) => {
    const target = event.target instanceof Element
      ? event.target.closest('button[data-search-node-id]')
      : null;
    if (!(target instanceof HTMLButtonElement)) {
      return;
    }
    const index = Math.floor(safeNumber(target.dataset.searchIndex, -1));
    if (index >= 0) {
      state.ui.sideNavSearchActiveIndex = index;
    }
  });
  dropdown.addEventListener('click', (event) => {
    const target = event.target instanceof Element
      ? event.target.closest('button[data-search-node-id]')
      : null;
    if (!(target instanceof HTMLButtonElement)) {
      return;
    }
    const nodeId = safeText(target.dataset.searchNodeId);
    if (!nodeId) {
      return;
    }
    if (focusSearchResultById(nodeId, true)) {
      const input = ensureSideNavSearchInput();
      input.value = state.query;
      input.blur();
    }
  });

  document.body.appendChild(dropdown);
  return dropdown;
}

function resolveSideNavProfileMenuIconSpec(itemId) {
  const safeItemId = safeText(itemId);
  if (safeItemId === 'profile') {
    return {
      iconName: 'account_circle',
      iconSizePx: 15,
      iconGlyph: String.fromCodePoint(0xE853),
      palette: buildAvatarPaletteFromColorTriplet([74, 126, 236]), // Blue
    };
  }
  if (safeItemId === 'dashboard') {
    return {
      iconName: 'home',
      iconSizePx: 14,
      iconGlyph: String.fromCodePoint(0xE88A),
      palette: buildAvatarPaletteFromColorTriplet([78, 176, 111]), // Green
    };
  }
  if (safeItemId === 'my-store') {
    return {
      iconName: 'local_mall',
      iconSizePx: 14,
      iconGlyph: String.fromCodePoint(0xE54C),
      palette: buildAvatarPaletteFromColorTriplet([137, 96, 206]), // Purple
    };
  }
  if (safeItemId === 'settings') {
    return {
      iconName: 'settings',
      iconSizePx: 14,
      iconGlyph: String.fromCodePoint(0xE8B8),
      palette: buildAvatarPaletteFromColorTriplet([143, 152, 167]), // Gray
    };
  }
  if (safeItemId === 'logout') {
    return {
      iconName: 'logout',
      iconSizePx: 14,
      iconGlyph: String.fromCodePoint(0xE9BA),
      palette: buildAvatarPaletteFromColorTriplet([212, 92, 108]), // Red
    };
  }
  return {
    iconName: 'account_circle',
    iconSizePx: 14,
    iconGlyph: String.fromCodePoint(0xE853),
    palette: buildAvatarPaletteFromColorTriplet([122, 140, 170]),
  };
}

function ensureSideNavProfileMenu() {
  let menu = document.getElementById(SIDE_NAV_PROFILE_MENU_ID);
  if (menu instanceof HTMLDivElement) {
    return menu;
  }

  menu = document.createElement('div');
  menu.id = SIDE_NAV_PROFILE_MENU_ID;
  menu.style.position = 'fixed';
  menu.style.left = '0px';
  menu.style.top = '0px';
  menu.style.width = '0px';
  menu.style.maxHeight = '0px';
  menu.style.overflowY = 'auto';
  menu.style.overflowX = 'hidden';
  menu.style.padding = '8px';
  menu.style.boxSizing = 'border-box';
  menu.style.borderRadius = '16px';
  menu.style.border = '1px solid #DEE3EC';
  menu.style.background = '#FFFFFF';
  menu.style.boxShadow = '0 8px 18px rgba(46, 57, 77, 0.12), 0 2px 6px rgba(46, 57, 77, 0.08)';
  menu.style.backdropFilter = 'blur(6px)';
  menu.style.webkitBackdropFilter = 'blur(6px)';
  menu.style.zIndex = '25';
  menu.style.display = 'none';
  menu.style.opacity = '0';

  menu.addEventListener('mousedown', (event) => {
    event.preventDefault();
  });
  menu.addEventListener('click', (event) => {
    const targetElement = event.target instanceof Element ? event.target : null;
    if (!targetElement) {
      return;
    }
    const closeButton = targetElement.closest('button[data-profile-close]');
    if (closeButton instanceof HTMLButtonElement) {
      state.ui.sideNavBrandMenuOpen = false;
      return;
    }
    const actionButton = targetElement.closest('button[data-profile-action]');
    if (!(actionButton instanceof HTMLButtonElement)) {
      return;
    }
    const action = safeText(actionButton.dataset.profileAction);
    if (!action) {
      return;
    }
    triggerAction(action);
  });

  document.body.appendChild(menu);
  return menu;
}

function renderSideNavProfileMenu(menu) {
  const profileName = truncateText(resolveSessionDisplayName(), 32);
  const profileEmail = truncateText(resolveSessionDisplayEmail(), 44);
  const profileInitials = truncateText(resolveInitials(profileName) || '?', 2).toUpperCase();
  const sessionAvatarBackground = resolveSessionAvatarCssBackground();
  const sessionAvatarSignature = resolveSessionAvatarSignature();
  const menuItems = [...SIDE_NAV_BRAND_MENU_ITEMS, SIDE_NAV_BRAND_LOGOUT_ITEM];
  const renderKey = `${profileName}::${profileEmail}::${sessionAvatarSignature}::${menuItems.map((item) => safeText(item.id)).join('|')}`;
  if (menu.dataset.renderKey === renderKey) {
    return;
  }
  menu.dataset.renderKey = renderKey;
  menu.innerHTML = '';

  const header = document.createElement('div');
  header.style.position = 'relative';
  header.style.padding = '24px 4px 10px';
  header.style.textAlign = 'center';

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.dataset.profileClose = '1';
  closeButton.style.position = 'absolute';
  closeButton.style.top = '0';
  closeButton.style.right = '0';
  closeButton.style.width = '24px';
  closeButton.style.height = '24px';
  closeButton.style.border = 'none';
  closeButton.style.borderRadius = '999px';
  closeButton.style.background = '#EFF2F8';
  closeButton.style.color = '#323C4F';
  closeButton.style.display = 'inline-flex';
  closeButton.style.alignItems = 'center';
  closeButton.style.justifyContent = 'center';
  closeButton.style.fontFamily = '"Material Symbols Outlined", "Segoe UI Symbol", sans-serif';
  closeButton.style.fontSize = '18px';
  closeButton.style.fontWeight = '400';
  closeButton.style.lineHeight = '1';
  closeButton.style.fontVariationSettings = '"opsz" 20, "wght" 400, "FILL" 0, "GRAD" 0';
  closeButton.style.fontFeatureSettings = '"liga" 1';
  closeButton.style.cursor = 'pointer';
  closeButton.textContent = 'close_small';
  header.appendChild(closeButton);

  const avatar = document.createElement('div');
  avatar.style.margin = '6px auto 8px';
  avatar.style.width = '64px';
  avatar.style.height = '64px';
  avatar.style.borderRadius = '999px';
  avatar.style.display = 'flex';
  avatar.style.alignItems = 'center';
  avatar.style.justifyContent = 'center';
  avatar.style.backgroundImage = sessionAvatarBackground.image;
  avatar.style.backgroundSize = 'cover';
  avatar.style.backgroundPosition = 'center';
  avatar.style.backgroundRepeat = 'no-repeat';
  avatar.style.color = '#F7FAFF';
  avatar.style.fontFamily = '"SF Pro Text", "SF Pro Display", "Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif';
  avatar.style.fontSize = '19px';
  avatar.style.fontWeight = '700';
  avatar.style.letterSpacing = '0.02em';
  avatar.style.lineHeight = '1';
  avatar.textContent = sessionAvatarBackground.isPhoto ? '' : profileInitials;
  header.appendChild(avatar);

  const title = document.createElement('div');
  title.textContent = profileName;
  title.style.fontFamily = '"SF Pro Display", "Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif';
  title.style.fontSize = '24px';
  title.style.fontWeight = '700';
  title.style.lineHeight = '1.12';
  title.style.letterSpacing = '-0.02em';
  title.style.color = '#0E1117';
  title.style.padding = '0 8px';
  title.style.whiteSpace = 'nowrap';
  title.style.overflow = 'hidden';
  title.style.textOverflow = 'ellipsis';
  header.appendChild(title);

  const subtitle = document.createElement('div');
  subtitle.textContent = profileEmail;
  subtitle.style.marginTop = '2px';
  subtitle.style.fontFamily = '"SF Pro Text", "SF Pro Display", "Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif';
  subtitle.style.fontSize = '14px';
  subtitle.style.fontWeight = '600';
  subtitle.style.color = '#666D7B';
  subtitle.style.lineHeight = '1.3';
  subtitle.style.whiteSpace = 'nowrap';
  subtitle.style.overflow = 'hidden';
  subtitle.style.textOverflow = 'ellipsis';
  subtitle.style.padding = '0 8px';
  header.appendChild(subtitle);

  const list = document.createElement('div');
  list.style.marginTop = '4px';
  list.style.borderRadius = '14px';
  list.style.border = '1px solid #E3E8F0';
  list.style.background = '#F3F5F9';
  list.style.overflow = 'hidden';

  menuItems.forEach((item, index) => {
    const iconSpec = resolveSideNavProfileMenuIconSpec(item.id);
    const rowButton = document.createElement('button');
    rowButton.type = 'button';
    rowButton.dataset.profileAction = safeText(item.action);
    rowButton.style.display = 'flex';
    rowButton.style.alignItems = 'center';
    rowButton.style.justifyContent = 'space-between';
    rowButton.style.width = '100%';
    rowButton.style.minHeight = '44px';
    rowButton.style.padding = '0 12px';
    rowButton.style.border = 'none';
    rowButton.style.background = 'transparent';
    rowButton.style.cursor = 'pointer';
    rowButton.style.textAlign = 'left';
    rowButton.style.outline = 'none';
    rowButton.style.boxSizing = 'border-box';
    rowButton.style.transition = 'background-color 140ms ease';
    rowButton.addEventListener('mouseenter', () => {
      rowButton.style.background = '#EAEFF7';
    });
    rowButton.addEventListener('mouseleave', () => {
      rowButton.style.background = 'transparent';
    });

    const left = document.createElement('div');
    left.style.display = 'flex';
    left.style.alignItems = 'center';
    left.style.gap = '12px';
    left.style.minWidth = '0';

    const icon = document.createElement('span');
    icon.style.width = '24px';
    icon.style.height = '24px';
    icon.style.borderRadius = '999px';
    icon.style.display = 'inline-flex';
    icon.style.alignItems = 'center';
    icon.style.justifyContent = 'center';
    icon.style.flex = '0 0 auto';
    icon.style.backgroundImage = resolveCssGradientFromPalette(iconSpec.palette);
    icon.style.backgroundSize = 'cover';
    icon.style.backgroundPosition = 'center';
    icon.style.backgroundRepeat = 'no-repeat';
    icon.style.color = '#FFFFFF';
    icon.style.fontFamily = '"Material Symbols Outlined", "Segoe UI Symbol", sans-serif';
    icon.style.fontSize = `${Math.max(12, Math.floor(safeNumber(iconSpec.iconSizePx, 14)))}px`;
    icon.style.fontWeight = '700';
    icon.style.lineHeight = '1';
    icon.style.fontVariationSettings = '"opsz" 20, "wght" 700, "FILL" 1, "GRAD" 0';
    icon.style.fontFeatureSettings = '"liga" 0';
    icon.textContent = safeText(iconSpec.iconGlyph || iconSpec.iconName || String.fromCodePoint(0xE853));

    const label = document.createElement('span');
    label.textContent = safeText(item.label);
    label.style.fontFamily = '"SF Pro Text", "SF Pro Display", "Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif';
    label.style.fontSize = '13px';
    label.style.fontWeight = item.id === 'logout' ? '600' : '700';
    label.style.color = item.id === 'logout' ? '#703C46' : '#161B25';
    label.style.lineHeight = '1.25';
    label.style.whiteSpace = 'nowrap';
    label.style.overflow = 'hidden';
    label.style.textOverflow = 'ellipsis';

    const chevron = document.createElement('span');
    chevron.textContent = '>';
    chevron.style.fontFamily = '"SF Pro Text", "SF Pro Display", "Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif';
    chevron.style.fontSize = '15px';
    chevron.style.fontWeight = '500';
    chevron.style.color = item.id === 'logout' ? '#8D6A71' : '#8A93A6';
    chevron.style.lineHeight = '1';
    chevron.style.marginLeft = '12px';
    chevron.style.flex = '0 0 auto';

    left.appendChild(icon);
    left.appendChild(label);
    rowButton.appendChild(left);
    rowButton.appendChild(chevron);
    list.appendChild(rowButton);

    if (index < menuItems.length - 1) {
      const divider = document.createElement('div');
      divider.style.height = '1px';
      divider.style.margin = '0 10px';
      divider.style.background = '#DEE5EF';
      divider.style.pointerEvents = 'none';
      list.appendChild(divider);
    }
  });

  menu.appendChild(header);
  menu.appendChild(list);
}

function syncSideNavProfileMenu() {
  const menu = ensureSideNavProfileMenu();
  const anchorRect = state.ui.sideNavBrandMenuAnchorRect;
  const dropdownRect = state.ui.sideNavSearchDropdownRect;
  const opacity = clamp(safeNumber(state.ui.sideNavSearchInputOpacity, 1), 0, 1);
  if (!anchorRect || !state.ui.sideNavBrandMenuOpen || opacity <= 0.001) {
    menu.style.display = 'none';
    menu.style.opacity = '0';
    menu.dataset.renderKey = '';
    return;
  }

  const viewportPadding = 10;
  const viewportWidth = Math.max(0, window.innerWidth);
  const viewportHeight = Math.max(0, window.innerHeight);
  const maxMenuWidth = Math.max(220, viewportWidth - (viewportPadding * 2));
  const searchLeft = dropdownRect ? Math.round(dropdownRect.x) : Math.round(anchorRect.x);
  const profileRight = Math.round(anchorRect.x + anchorRect.width);
  const anchorDistance = Math.abs(profileRight - searchLeft);
  const useSearchAlignedWidth = Boolean(dropdownRect) && anchorDistance <= 260;
  const computedWidth = useSearchAlignedWidth
    ? Math.max(240, profileRight - searchLeft)
    : 248;
  const menuWidth = clamp(computedWidth, 220, maxMenuWidth);
  const menuAnchorGap = 6;
  let menuX = useSearchAlignedWidth
    ? searchLeft
    : Math.round(anchorRect.x - menuWidth - menuAnchorGap);
  if (menuX + menuWidth > viewportWidth - viewportPadding) {
    menuX = Math.max(viewportPadding, (viewportWidth - viewportPadding) - menuWidth);
  }
  menuX = clamp(menuX, viewportPadding, Math.max(viewportPadding, viewportWidth - menuWidth - viewportPadding));
  const menuY = useSearchAlignedWidth
    ? Math.round(anchorRect.y + anchorRect.height + 2)
    : Math.round(anchorRect.y);
  const availableHeight = Math.max(220, viewportHeight - menuY - viewportPadding);
  const menuMaxHeight = Math.min(540, availableHeight);

  menu.style.display = 'block';
  menu.style.opacity = opacity.toFixed(3);
  menu.style.left = `${menuX}px`;
  menu.style.top = `${menuY}px`;
  menu.style.width = `${menuWidth}px`;
  menu.style.maxHeight = `${Math.round(menuMaxHeight)}px`;
  renderSideNavProfileMenu(menu);
}

function renderSearchDropdown(dropdown) {
  const results = Array.isArray(state.ui.sideNavSearchResults) ? state.ui.sideNavSearchResults : [];
  const activeIndex = clamp(
    Math.floor(safeNumber(state.ui.sideNavSearchActiveIndex, 0)),
    0,
    Math.max(0, results.length - 1),
  );
  const renderKey = `${results.map((entry) => safeText(entry.id)).join('|')}::${activeIndex}::${resolveSessionAvatarSignature()}`;
  if (dropdown.dataset.renderKey === renderKey) {
    return;
  }
  dropdown.dataset.renderKey = renderKey;
  dropdown.innerHTML = '';

  results.forEach((entry, index) => {
    const isActiveNode = safeText(entry.id) === safeText(state.selectedId);
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.searchNodeId = safeText(entry.id);
    button.dataset.searchIndex = String(index);
    button.style.display = 'block';
    button.style.width = '100%';
    button.style.border = 'none';
    button.style.background = index === activeIndex ? '#EEF2F8' : 'transparent';
    button.style.borderRadius = '12px';
    button.style.boxSizing = 'border-box';
    button.style.minHeight = '54px';
    button.style.padding = '8px 10px';
    button.style.textAlign = 'left';
    button.style.cursor = 'pointer';
    button.style.outline = 'none';

    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.gap = '10px';
    row.style.width = '100%';

    const avatarCore = document.createElement('span');
    avatarCore.style.position = 'relative';
    avatarCore.style.display = 'inline-flex';
    avatarCore.style.alignItems = 'center';
    avatarCore.style.justifyContent = 'center';
    avatarCore.style.flex = '0 0 auto';
    avatarCore.style.width = '28px';
    avatarCore.style.height = '28px';
    avatarCore.style.borderRadius = '999px';
    avatarCore.style.boxSizing = 'border-box';
    const avatarBackground = resolveAvatarCssBackgroundForNode(entry.id);
    avatarCore.style.backgroundImage = avatarBackground.image;
    avatarCore.style.backgroundSize = 'cover';
    avatarCore.style.backgroundPosition = 'center';
    avatarCore.style.backgroundRepeat = 'no-repeat';
    avatarCore.style.boxShadow = isActiveNode
      ? '0 4px 10px rgba(53, 64, 84, 0.2)'
      : '0 4px 10px rgba(53, 64, 84, 0.16)';
    avatarCore.style.border = isActiveNode ? '2px solid #FFFFFF' : '2px solid transparent';
    avatarCore.style.color = '#F7FAFF';
    avatarCore.style.fontFamily = '"SF Pro Text", "SF Pro Display", "Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif';
    avatarCore.style.fontSize = '10px';
    avatarCore.style.fontWeight = '700';
    avatarCore.style.lineHeight = '1';
    avatarCore.style.letterSpacing = '0.01em';
    avatarCore.textContent = avatarBackground.isPhoto
      ? ''
      : truncateText(safeText(entry.initials || '?'), 2).toUpperCase();

    const avatarSheen = document.createElement('span');
    avatarSheen.style.position = 'absolute';
    avatarSheen.style.inset = '0';
    avatarSheen.style.borderRadius = '999px';
    avatarSheen.style.pointerEvents = 'none';
    avatarSheen.style.background = 'radial-gradient(circle at 28% 24%, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.04) 54%, rgba(255, 255, 255, 0) 100%)';

    avatarCore.appendChild(avatarSheen);

    const content = document.createElement('div');
    content.style.minWidth = '0';
    content.style.flex = '1 1 auto';

    const title = document.createElement('div');
    const titleText = entry.username
      ? `${truncateText(entry.name, 22)} (@${truncateText(entry.username, 18)})`
      : truncateText(entry.name, 28);
    title.textContent = titleText;
    title.style.fontFamily = '"SF Pro Text", "SF Pro Display", "Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif';
    title.style.fontSize = '12px';
    title.style.fontWeight = '700';
    title.style.color = '#232938';
    title.style.lineHeight = '1.3';
    title.style.whiteSpace = 'nowrap';
    title.style.overflow = 'hidden';
    title.style.textOverflow = 'ellipsis';

    const subtitle = document.createElement('div');
    subtitle.textContent = truncateText(safeText(entry.subtitle), 48);
    subtitle.style.marginTop = '2px';
    subtitle.style.fontFamily = '"SF Pro Text", "SF Pro Display", "Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif';
    subtitle.style.fontSize = '11px';
    subtitle.style.fontWeight = '500';
    subtitle.style.color = '#687287';
    subtitle.style.lineHeight = '1.35';
    subtitle.style.whiteSpace = 'nowrap';
    subtitle.style.overflow = 'hidden';
    subtitle.style.textOverflow = 'ellipsis';

    content.appendChild(title);
    content.appendChild(subtitle);
    row.appendChild(avatarCore);
    row.appendChild(content);
    button.appendChild(row);
    dropdown.appendChild(button);

    if (index < results.length - 1) {
      const divider = document.createElement('div');
      divider.style.height = '1px';
      divider.style.margin = '0 10px';
      divider.style.background = '#E8EDF5';
      divider.style.pointerEvents = 'none';
      dropdown.appendChild(divider);
    }
  });
}

function applySearchQuery(nextQuery, options = {}) {
  const {
    openDropdown = true,
    preserveActive = false,
  } = options;
  state.query = safeText(nextQuery);
  refreshSearchResults({
    openDropdown,
    preserveActive,
  });
}

function ensureSideNavSearchInput() {
  let input = document.getElementById(SIDE_NAV_SEARCH_INPUT_ID);
  if (input instanceof HTMLInputElement) {
    return input;
  }

  input = document.createElement('input');
  input.id = SIDE_NAV_SEARCH_INPUT_ID;
  input.type = 'search';
  input.placeholder = 'Search username or name';
  input.autocomplete = 'off';
  input.spellcheck = false;
  input.style.position = 'fixed';
  input.style.left = '0px';
  input.style.top = '0px';
  input.style.width = '0px';
  input.style.height = '0px';
  input.style.padding = '0 4px';
  input.style.border = 'none';
  input.style.borderRadius = '0';
  input.style.background = 'transparent';
  input.style.appearance = 'none';
  input.style.webkitAppearance = 'none';
  input.style.boxSizing = 'border-box';
  input.style.fontFamily = '"SF Pro Text", "SF Pro Display", "Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif';
  input.style.fontSize = '13px';
  input.style.fontWeight = '600';
  input.style.color = '#4A505C';
  input.style.caretColor = '#4A505C';
  input.style.zIndex = '22';
  input.style.outline = 'none';
  input.style.display = 'none';
  input.style.boxShadow = 'none';
  input.style.transition = 'opacity 140ms ease';

  input.addEventListener('focus', () => {
    state.ui.sideNavBrandMenuOpen = false;
    input.style.opacity = '1';
    refreshSearchResults({
      openDropdown: true,
      preserveActive: true,
    });
  });
  input.addEventListener('blur', () => {
    input.style.opacity = '1';
    window.setTimeout(() => {
      if (document.activeElement === input) {
        return;
      }
      closeSearchDropdown();
    }, 120);
  });
  input.addEventListener('input', (event) => {
    const target = event.currentTarget;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    applySearchQuery(target.value, {
      openDropdown: true,
      preserveActive: false,
    });
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
      refreshSearchResults({
        openDropdown: true,
        preserveActive: true,
      });
      if (moveSearchActiveIndex(1)) {
        event.preventDefault();
      }
      return;
    }
    if (event.key === 'ArrowUp') {
      refreshSearchResults({
        openDropdown: true,
        preserveActive: true,
      });
      if (moveSearchActiveIndex(-1)) {
        event.preventDefault();
      }
      return;
    }
    if (event.key === 'Enter') {
      if (focusFirstSearchResult(true)) {
        input.value = state.query;
        input.blur();
        event.preventDefault();
      }
      return;
    }
    if (event.key === 'Escape') {
      applySearchQuery('', {
        openDropdown: false,
        preserveActive: false,
      });
      input.value = '';
      closeSearchDropdown();
      input.blur();
      event.preventDefault();
    }
  });

  document.body.appendChild(input);
  return input;
}

function syncSideNavSearchInput() {
  const input = ensureSideNavSearchInput();
  const dropdown = ensureSideNavSearchDropdown();
  const rect = state.ui.sideNavSearchInputRect;
  const dropdownRect = state.ui.sideNavSearchDropdownRect;
  const opacity = clamp(safeNumber(state.ui.sideNavSearchInputOpacity, 1), 0, 1);
  if (!state.ui.sideNavOpen || !rect || !dropdownRect || opacity <= 0.001) {
    input.style.display = 'none';
    dropdown.style.display = 'none';
    dropdown.style.opacity = '0';
    dropdown.dataset.renderKey = '';
    return;
  }

  input.style.display = 'block';
  input.style.opacity = opacity.toFixed(3);
  input.style.left = `${Math.round(rect.x)}px`;
  input.style.top = `${Math.round(rect.y)}px`;
  input.style.width = `${Math.max(32, Math.round(rect.width))}px`;
  input.style.height = `${Math.max(24, Math.round(rect.height))}px`;
  if (document.activeElement !== input && input.value !== state.query) {
    input.value = state.query;
  }

  const hasResults = Array.isArray(state.ui.sideNavSearchResults) && state.ui.sideNavSearchResults.length > 0;
  const showDropdown = (
    hasResults
    && state.ui.sideNavSearchDropdownOpen
    && !state.ui.sideNavBrandMenuOpen
    && safeText(state.query).trim().length > 0
  );
  if (!showDropdown) {
    dropdown.style.display = 'none';
    dropdown.style.opacity = '0';
    dropdown.dataset.renderKey = '';
    return;
  }

  const dropdownWidth = Math.max(220, Math.round(dropdownRect.width));
  dropdown.style.display = 'block';
  dropdown.style.opacity = opacity.toFixed(3);
  dropdown.style.left = `${Math.round(dropdownRect.x)}px`;
  dropdown.style.top = `${Math.round(dropdownRect.y + dropdownRect.height + 6)}px`;
  dropdown.style.width = `${dropdownWidth}px`;
  renderSearchDropdown(dropdown);
}

function resolveUniverseCrumbLabel(nodeId) {
  const safeNodeId = safeText(nodeId);
  if (!safeNodeId || safeNodeId === 'root') {
    return 'Root';
  }
  const nodeMatch = /^n-(\d+)$/i.exec(safeNodeId);
  if (nodeMatch) {
    return `Node ${nodeMatch[1]}`;
  }
  const globalMeta = state.adapter.resolveNodeMetrics(safeNodeId, getGlobalUniverseOptions());
  const resolvedName = safeText(globalMeta?.node?.name);
  if (resolvedName) {
    return truncateText(resolvedName, 12);
  }
  return truncateText(safeNodeId, 12);
}

function drawUniverseBreadcrumbLinks(startX, startY, maxWidth) {
  const breadcrumb = Array.isArray(state.universe.breadcrumb)
    ? state.universe.breadcrumb
    : [];
  if (!breadcrumb.length || maxWidth <= 0) {
    return;
  }

  const endX = startX + maxWidth;
  const currentRootId = getUniverseRootId();
  let cursorX = startX;
  const height = 18;

  for (let index = 0; index < breadcrumb.length; index += 1) {
    const crumbId = safeText(breadcrumb[index]);
    const label = resolveUniverseCrumbLabel(crumbId);
    const active = crumbId === currentRootId;
    const crumbWidth = clamp(26 + (label.length * 5.2), 48, 116);

    if (cursorX + crumbWidth > endX) {
      drawText('...', Math.max(startX + 8, endX - 8), startY + (height / 2) + 0.5, {
        size: 10,
        weight: 600,
        color: '#7b8190',
        align: 'right',
      });
      break;
    }

    const fill = active ? 'rgba(149, 156, 172, 0.9)' : 'rgba(255,255,255,0.64)';
    const stroke = active ? 'rgba(126, 133, 149, 0.95)' : 'rgba(181,186,197,0.84)';
    const textColor = active ? '#f8f9fc' : '#495061';
    fillRoundedRect(context, cursorX, startY, crumbWidth, height, 12, fill);
    strokeRoundedRect(context, cursorX + 0.5, startY + 0.5, crumbWidth - 1, height - 1, 12, stroke);
    drawText(label, cursorX + (crumbWidth / 2), startY + (height / 2) + 0.5, {
      size: 10,
      weight: active ? 600 : 500,
      color: textColor,
      align: 'center',
    });

    if (!active) {
      registerButton({
        id: `crumb-${crumbId}`,
        x: cursorX,
        y: startY,
        width: crumbWidth,
        height,
        action: `universe:goto:${crumbId}`,
      });
    }

    cursorX += crumbWidth;
    if (index < breadcrumb.length - 1) {
      if (cursorX + 14 > endX) {
        break;
      }
      drawText('>', cursorX + 7, startY + (height / 2) + 0.5, {
        size: 10,
        weight: 700,
        color: '#7b8190',
        align: 'center',
      });
      cursorX += 14;
    }
  }
}

function drawSideNav(layout) {
  const panelReveal = resolveStartupRevealForPanel(STARTUP_SIDE_PANEL_DELAY_MS);
  if (panelReveal.progress <= 0) {
    state.ui.sideNavSearchInputRect = null;
    state.ui.sideNavSearchInputOpacity = 0;
    state.ui.sideNavSearchDropdownRect = null;
    state.ui.sideNavBrandMenuAnchorRect = null;
    state.ui.sideNavBrandMenuOpen = false;
    closeSearchDropdown();
    const favorites = getSideNavFavoritesState();
    favorites.viewportRect = null;
    stopFavoritesCarouselDrag(null);
    return;
  }
  const applyPanelReveal = beginStartupReveal(panelReveal);

  try {
    const panel = layout.sideNav;
    const buttonYOffset = applyPanelReveal ? panelReveal.translateY : 0;
    state.ui.sideNavSearchInputOpacity = applyPanelReveal
      ? clamp(safeNumber(panelReveal.alpha, 1), 0, 1)
      : 1;

    const insetX = 18;
    const slotX = panel.x + insetX;
    const slotWidth = panel.width - (insetX * 2);
    const topPadding = 18;
    const gap = 16;
    const searchRowHeight = 42;
    const panelHeightScale = clamp((panel.height - 620) / 240, 0, 1);
    const favoritesCardHeight = Math.round(136 + (32 * panelHeightScale));
    const favoritesToDetailsGap = Math.round(4 + (8 * panelHeightScale));
    const timerCardHeight = 124;

    let y = panel.y + topPadding;
    const topControlButtonSize = 36;
    const floatingProfileSize = 44;
    const searchAvatarGap = 8;
    const searchPillHeight = 36;
    const topControlY = y + ((searchRowHeight - searchPillHeight) / 2);

    const profileButtonId = 'side-nav-floating-profile';
    const profileX = Math.max(
      8,
      Math.round((layout.workspace.x + layout.workspace.width) - floatingProfileSize - 8),
    );
    // Align to side-nav shell top instead of the search row height.
    const profileY = panel.y;
    const profileCenterX = profileX + (floatingProfileSize / 2);
    const profileCenterY = profileY + (floatingProfileSize / 2);
    const profileName = resolveSessionDisplayName();
    const profileInitials = resolveInitials(profileName);
    const profileRingRadius = (floatingProfileSize / 2);
    const profileInnerRadius = profileRingRadius;

    context.save();
    context.shadowColor = 'rgba(25, 36, 52, 0.16)';
    context.shadowBlur = 8;
    context.shadowOffsetY = 2;
    const sessionAvatarRender = drawResolvedAvatarCircle(
      profileCenterX,
      profileCenterY,
      profileInnerRadius,
      resolveSessionUserId(),
      {
        alpha: 0.98,
        sheenAlpha: 0.2,
      },
    );
    context.restore();
    if (!sessionAvatarRender.usedPhoto) {
      drawText(profileInitials, profileCenterX, profileCenterY + 0.5, {
        size: Math.round(clamp(floatingProfileSize * 0.32, 12, 16)),
        weight: 700,
        color: '#F5F9FF',
        align: 'center',
      });
    }
    registerButton({
      id: profileButtonId,
      x: profileX,
      y: profileY + buttonYOffset,
      width: floatingProfileSize,
      height: floatingProfileSize,
      action: 'brand-menu:toggle',
    });
    state.ui.sideNavBrandMenuAnchorRect = {
      x: profileX,
      y: profileY + buttonYOffset,
      width: floatingProfileSize,
      height: floatingProfileSize,
    };

    const sideNavToggleButtonId = 'side-nav-panel-toggle';
    const drawSideNavToggleButton = (buttonX, buttonY, size, action = 'side-nav:toggle') => {
      const hovered = state.hoveredButtonId === sideNavToggleButtonId;
      const buttonFill = hovered ? '#E8EAF0' : SHELL_PANEL_COLOR;
      const buttonStroke = hovered ? '#DFE2EA' : SHELL_PANEL_COLOR;
      const iconColor = hovered ? '#444444' : '#888888';
      fillRoundedRect(context, buttonX, buttonY, size, size, Math.round(size / 2), buttonFill);
      strokeRoundedRect(context, buttonX + 0.5, buttonY + 0.5, size - 1, size - 1, Math.round(size / 2), buttonStroke, 1);
      drawMaterialButtonIcon('side_navigation', buttonX + (size / 2), buttonY + (size / 2) + 0.5, {
        size: Math.round(size * 0.58),
        weight: 500,
        color: iconColor,
        fill: 0,
      });
      registerButton({
        id: sideNavToggleButtonId,
        x: buttonX,
        y: buttonY + buttonYOffset,
        width: size,
        height: size,
        action,
      });
    };

    if (!state.ui.sideNavOpen) {
      state.ui.sideNavSearchInputRect = null;
      state.ui.sideNavSearchDropdownRect = null;
      closeSearchDropdown();
      const favorites = getSideNavFavoritesState();
      favorites.viewportRect = null;
      stopFavoritesCarouselDrag(null);

      const collapsedToggleX = panel.x + insetX;
      drawSideNavToggleButton(collapsedToggleX, topControlY, topControlButtonSize);
      return;
    }

    drawPanelChrome(panel, 'left');

    const searchPillWidth = slotWidth - topControlButtonSize - searchAvatarGap;
    const searchPillX = slotX;
    const searchPillY = topControlY;
    fillRoundedRect(context, searchPillX, searchPillY, searchPillWidth, searchPillHeight, 18, '#FFFFFF');
    drawSearchGlyph(searchPillX + 18, searchPillY + (searchPillHeight / 2) + 0.5, {
      color: '#353B47',
      size: 21,
      weight: 450,
    });

    const searchInputRect = {
      x: searchPillX + 36,
      y: searchPillY + 2 + buttonYOffset,
      width: searchPillWidth - 42,
      height: searchPillHeight - 4,
    };
    state.ui.sideNavSearchInputRect = searchInputRect;
    state.ui.sideNavSearchDropdownRect = {
      x: searchPillX,
      y: searchPillY + buttonYOffset,
      width: searchPillWidth,
      height: searchPillHeight,
    };
    const sideNavToggleX = searchPillX + searchPillWidth + searchAvatarGap;
    drawSideNavToggleButton(sideNavToggleX, searchPillY, topControlButtonSize);

    y += searchRowHeight + gap;
    drawText('Favorites', slotX + 4, y + 15, {
      size: 15,
      weight: 700,
      color: '#15181E',
    });

    const pinToggleLabel = isNodePinned(state.selectedId) ? 'Unpin' : 'Pin';
    const pinToggleId = 'side-nav-pin-selected';
    const pinToggleWidth = 72;
    const pinToggleHeight = 22;
    const pinToggleX = slotX + slotWidth - pinToggleWidth - 4;
    const pinToggleY = y + 4;
    const canPinSelected = Boolean(safeText(state.selectedId));
    fillRoundedRect(
      context,
      pinToggleX,
      pinToggleY,
      pinToggleWidth,
      pinToggleHeight,
      11,
      canPinSelected ? '#ECEFF5' : '#F1F2F6',
    );
    strokeRoundedRect(
      context,
      pinToggleX + 0.5,
      pinToggleY + 0.5,
      pinToggleWidth - 1,
      pinToggleHeight - 1,
      11,
      canPinSelected ? '#DCE1EB' : '#E6E8EF',
    );
    drawText(pinToggleLabel, pinToggleX + (pinToggleWidth / 2), pinToggleY + (pinToggleHeight / 2) + 0.5, {
      size: 10,
      weight: 700,
      color: canPinSelected ? '#495163' : '#8C93A3',
      align: 'center',
    });
    if (canPinSelected) {
      registerButton({
        id: pinToggleId,
        x: pinToggleX,
        y: pinToggleY + buttonYOffset,
        width: pinToggleWidth,
        height: pinToggleHeight,
        action: 'pin:toggle-selected',
      });
    }

    const favorites = resolvePinnedPlaces(12);
    const favoritesViewportTopInset = Math.round(20 + (6 * panelHeightScale));
    const favoritesViewportBottomInset = Math.round(8 + (10 * panelHeightScale));
    const favoritesViewport = {
      x: slotX + 2,
      y: y + favoritesViewportTopInset,
      width: slotWidth - 4,
      height: Math.max(84, favoritesCardHeight - favoritesViewportTopInset - favoritesViewportBottomInset),
    };
    const favoritesState = getSideNavFavoritesState();
    favoritesState.viewportRect = { ...favoritesViewport };
    const itemRadius = 30;
    const itemSlotWidth = 84;
    const itemGap = 8;
    const contentWidth = favorites.length
      ? ((favorites.length * itemSlotWidth) + (Math.max(0, favorites.length - 1) * itemGap) + 12)
      : favoritesViewport.width;
    favoritesState.contentWidth = contentWidth;
    favoritesState.scrollX = clampFavoritesScroll(favoritesState.scrollX);

    context.save();
    roundedRectPath(context, favoritesViewport.x, favoritesViewport.y, favoritesViewport.width, favoritesViewport.height, 12);
    context.clip();

    if (!favorites.length) {
      drawText('No favorites yet. Pin a node from the tree.', favoritesViewport.x + 8, favoritesViewport.y + 16, {
        size: 11,
        weight: 500,
        color: '#7A8292',
      });
    }

    for (let index = 0; index < favorites.length; index += 1) {
      const favorite = favorites[index];
      const itemX = favoritesViewport.x + 6 + (index * (itemSlotWidth + itemGap)) - safeNumber(favoritesState.scrollX, 0);
      const centerX = itemX + (itemSlotWidth / 2);
      const centerY = favoritesViewport.y + itemRadius + 6;
      const buttonId = `side-nav-favorite-${favorite.key}`;
      const hovered = state.hoveredButtonId === buttonId;
      const favoriteTextMaxWidth = Math.max(40, itemSlotWidth - 10);
      const favoriteLabel = truncateTextToWidth(favorite.label, favoriteTextMaxWidth, {
        size: 12,
        weight: 600,
      });
      const favoriteSubtitle = truncateTextToWidth(favorite.subtitle, favoriteTextMaxWidth, {
        size: 10,
        weight: 500,
      });

      drawFavoriteNodeAvatar(centerX, centerY, itemRadius, favorite.nodeId, favorite.initials, hovered);
      drawText(favoriteLabel, centerX, centerY + itemRadius + 17, {
        size: 12,
        weight: 600,
        color: '#1B1F27',
        align: 'center',
        maxWidth: favoriteTextMaxWidth,
      });
      drawText(favoriteSubtitle, centerX, centerY + itemRadius + 33, {
        size: 10,
        weight: 500,
        color: '#7A8292',
        align: 'center',
        maxWidth: favoriteTextMaxWidth,
      });

      registerButton({
        id: buttonId,
        x: itemX,
        y: (centerY - itemRadius) + buttonYOffset,
        width: itemSlotWidth,
        height: (itemRadius * 2) + 40,
        action: `pin:focus:${favorite.nodeId}`,
      });
    }

    context.restore();

    y += favoritesCardHeight + favoritesToDetailsGap;
    const timerCardY = panel.y + panel.height - topPadding - timerCardHeight;
    const detailsCardHeight = Math.max(120, timerCardY - y - gap);
    const detailsBottomY = y + detailsCardHeight;
    const detailInsetX = slotX + 16;
    const detailContentWidth = slotWidth - 32;
    const detailCenterX = slotX + (slotWidth / 2);
    const detailRightX = slotX + slotWidth - 16;
    const detailVerticalScale = clamp((detailsCardHeight - 380) / 240, 0, 1);
    const detailsHeadingSize = Math.round(22 + (2 * detailVerticalScale));
    const detailPrimaryTextSize = Math.round(22 + (2 * detailVerticalScale));
    const detailSecondaryTextSize = Math.round(11 + detailVerticalScale);
    const detailRankTextSize = detailSecondaryTextSize;
    const detailMetricTextSize = detailSecondaryTextSize;
    const detailRelationLabelSize = Math.round(13 + detailVerticalScale);

    fillRoundedRect(context, slotX, y, slotWidth, detailsCardHeight, 28, '#FFFFFF');
    strokeRoundedRect(context, slotX + 0.5, y + 0.5, slotWidth - 1, detailsCardHeight - 1, 28, '#E2E2E2');

    const selectedNodeId = safeText(state.selectedId);
    const selectedNode = resolveNodeById(selectedNodeId);
    const detailsHeadingY = y + Math.round(34 + (2 * detailVerticalScale));
    drawText('Details', detailCenterX, detailsHeadingY, {
      size: detailsHeadingSize,
      weight: 600,
      family: '"Inter", "SF Pro Text", "SF Pro Display", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
      color: '#111111',
      align: 'center',
    });

    if (!selectedNode) {
      drawText('Select a node to view details.', detailCenterX, detailsHeadingY + 38, {
        size: Math.max(12, detailSecondaryTextSize),
        weight: 500,
        family: '"Inter", "SF Pro Text", "SF Pro Display", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
        color: '#888888',
        align: 'center',
        maxWidth: detailContentWidth,
      });
    } else {
      const volumeMetrics = resolveNodeLegVolumes(selectedNodeId);
      const displayName = truncateText(safeText(selectedNode.name || selectedNode.id), 24);
      const username = truncateText(safeText(selectedNode.username || selectedNode.id), 24);
      const nodeInitials = resolveInitials(safeText(selectedNode.name || selectedNode.id));
      const selectedAvatarNodeId = safeText(selectedNode.id || selectedNodeId);
      const selectedAvatarVariant = isSessionAvatarNodeId(selectedAvatarNodeId)
        ? 'auto'
        : (selectedAvatarNodeId.toLowerCase() === 'root' ? 'root' : 'auto');
      const rankValue = truncateText(safeText(selectedNode.rank || '-'), 16) || '-';
      const isActiveAccount = resolveNodeActivityState(selectedNode);
      const activityDotColor = isActiveAccount ? '#30C655' : '#B5B5B5';
      const rankAndTitleIconPaths = resolveNodeDetailRankAndTitleIcons(selectedNode).slice(0, 2);

      const avatarRadius = Math.round(34 + (20 * detailVerticalScale));
      // Keep head space under "Details", but compress aggressively on shorter laptop heights.
      const compactHeaderToAvatarTopGap = 12;
      const preferredHeaderToAvatarTopGap = 64;
      const headerToAvatarTopGap = Math.round(
        compactHeaderToAvatarTopGap
        + ((preferredHeaderToAvatarTopGap - compactHeaderToAvatarTopGap) * detailVerticalScale),
      );
      const avatarCenterY = detailsHeadingY + headerToAvatarTopGap + avatarRadius;
      const nodePhotoUrl = resolveNodeAvatarPhotoUrl(selectedNode);
      let usedPhotoAvatar = false;
      context.beginPath();
      context.arc(detailCenterX, avatarCenterY, avatarRadius + 1.5, 0, Math.PI * 2);
      context.fillStyle = '#FFFFFF';
      context.fill();
      if (nodePhotoUrl) {
        usedPhotoAvatar = drawImageAvatarCircle(detailCenterX, avatarCenterY, avatarRadius, nodePhotoUrl);
      }
      if (!usedPhotoAvatar) {
        drawResolvedAvatarCircle(detailCenterX, avatarCenterY, avatarRadius, selectedAvatarNodeId, {
          node: selectedNode,
          variant: selectedAvatarVariant,
          alpha: 0.98,
          sheenAlpha: 0.16,
        });
        const avatarInitialsSize = Math.round(clamp(avatarRadius * 0.63, 24, 34));
        drawText(nodeInitials, detailCenterX, avatarCenterY + 0.5, {
          size: avatarInitialsSize,
          weight: 700,
          family: '"Inter", "SF Pro Text", "SF Pro Display", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
          color: '#FFFFFF',
          align: 'center',
        });
      }

      const statusDotCenterX = detailCenterX + (avatarRadius * 0.62);
      const statusDotCenterY = avatarCenterY + (avatarRadius * 0.68);
      const statusDotOuterRadius = clamp(Math.round(avatarRadius * 0.19), 7, 10);
      const statusDotInnerRadius = Math.max(5, statusDotOuterRadius - 2);
      context.beginPath();
      context.arc(statusDotCenterX, statusDotCenterY, statusDotOuterRadius, 0, Math.PI * 2);
      context.fillStyle = '#FFFFFF';
      context.fill();
      context.beginPath();
      context.arc(statusDotCenterX, statusDotCenterY, statusDotInnerRadius, 0, Math.PI * 2);
      context.fillStyle = activityDotColor;
      context.fill();

      const avatarToNameGap = Math.round(44 + (36 * detailVerticalScale));
      const nameToUsernameGap = Math.round(16 + (10 * detailVerticalScale));
      const usernameToRankGap = Math.round(14 + (10 * detailVerticalScale));
      const displayNameY = avatarCenterY + avatarToNameGap;
      const usernameY = displayNameY + nameToUsernameGap;
      const rankY = usernameY + usernameToRankGap;
      drawText(displayName, detailCenterX, displayNameY, {
        size: detailPrimaryTextSize,
        weight: 600,
        family: '"Inter", "SF Pro Text", "SF Pro Display", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
        color: '#111111',
        align: 'center',
        maxWidth: detailContentWidth,
      });
      drawText(`@${username}`, detailCenterX, usernameY, {
        size: detailSecondaryTextSize,
        weight: 500,
        family: '"Inter", "SF Pro Text", "SF Pro Display", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
        color: '#888888',
        align: 'center',
        maxWidth: detailContentWidth,
      });

      const rankIconSize = Math.round(14 + (2 * detailVerticalScale));
      const rankIconGap = 4;
      const rankTextWidth = measureTextWidth(rankValue, {
        size: detailRankTextSize,
        weight: 500,
        family: '"Inter", "SF Pro Text", "SF Pro Display", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
      });
      const iconBlockWidth = rankAndTitleIconPaths.length
        ? (10 + (rankAndTitleIconPaths.length * rankIconSize) + ((rankAndTitleIconPaths.length - 1) * rankIconGap))
        : 0;
      const rankRowWidth = rankTextWidth + iconBlockWidth;
      let rankCursorX = detailCenterX - (rankRowWidth / 2);
      drawText(rankValue, rankCursorX, rankY, {
        size: detailRankTextSize,
        weight: 500,
        family: '"Inter", "SF Pro Text", "SF Pro Display", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
        color: '#888888',
      });
      rankCursorX += rankTextWidth + 10;
      for (let index = 0; index < rankAndTitleIconPaths.length; index += 1) {
        const iconPath = rankAndTitleIconPaths[index];
        const iconX = rankCursorX + (index * (rankIconSize + rankIconGap));
        const iconY = rankY - (rankIconSize / 2);
        const drawn = drawImageAssetRect(iconX, iconY, rankIconSize, rankIconSize, iconPath);
        if (!drawn) {
          fillRoundedRect(context, iconX, iconY, rankIconSize, rankIconSize, 4, '#DADADA');
        }
      }

      const cyclesCount = resolveNodeCycleCount(selectedNode, volumeMetrics);
      const relationButtonHeight = Math.round(32 + (14 * detailVerticalScale));
      const relationButtonGap = Math.round(4 + (8 * detailVerticalScale));
      const metricsToButtonsGap = Math.round(6 + (10 * detailVerticalScale));
      const detailsBottomPad = Math.round(8 + (10 * detailVerticalScale));
      const minMetricRowHeight = Math.round(12 + (10 * detailVerticalScale));
      const maxMetricRowHeight = Math.round(50 + (8 * detailVerticalScale));
      const rankToMetricsGap = Math.round(10 + (26 * detailVerticalScale));
      const parentId = safeText(selectedNode.parent);
      const preferredSponsorId = safeText(selectedNode.sponsorId);
      const sponsorId = resolveNodeById(preferredSponsorId) ? preferredSponsorId : parentId;
      const detailsPanelMode = 'light';
      const relationButtons = [
        {
          id: 'parent',
          style: 'filled',
          iconName: 'family_history',
          iconPath: resolveDetailsRelationIconPath('parent', detailsPanelMode),
          nodeId: parentId,
          fallbackGlyph: drawFallbackFamilyHistoryGlyph,
        },
        {
          id: 'sponsor',
          style: 'filled',
          iconName: 'person_add',
          iconPath: resolveDetailsRelationIconPath('sponsor', detailsPanelMode),
          nodeId: sponsorId,
          fallbackGlyph: drawFallbackPersonAddGlyph,
        },
      ];
      const relationBlockHeight = (
        relationButtons.length * relationButtonHeight
      ) + (Math.max(0, relationButtons.length - 1) * relationButtonGap);
      const metricRows = [
        { label: 'Total Organization BV', value: formatExactVolumeValue(volumeMetrics.totalVolume) },
        { label: 'Left Leg', value: formatExactVolumeValue(volumeMetrics.leftVolume) },
        { label: 'Right Leg', value: formatExactVolumeValue(volumeMetrics.rightVolume) },
        { label: 'Cycles', value: String(cyclesCount) },
      ];
      const maxRelationStartY = detailsBottomY - relationBlockHeight - detailsBottomPad;
      const desiredMetricsStartY = rankY + rankToMetricsGap;
      const maxMetricsStartY = maxRelationStartY - metricsToButtonsGap - (metricRows.length * minMetricRowHeight);
      const metricsStartY = Math.min(desiredMetricsStartY, maxMetricsStartY);
      const availableMetricHeight = Math.max(
        0,
        detailsBottomY
          - metricsStartY
          - relationBlockHeight
          - metricsToButtonsGap
          - detailsBottomPad,
      );
      const metricRowHeight = clamp(
        Math.floor(availableMetricHeight / Math.max(1, metricRows.length)),
        minMetricRowHeight,
        maxMetricRowHeight,
      );
      metricRows.forEach((row, rowIndex) => {
        const rowTopY = metricsStartY + (rowIndex * metricRowHeight);
        const metricRowTextY = rowTopY + clamp(metricRowHeight * 0.5, 11, 20);
        const metricDividerInset = Math.max(2, Math.round(metricRowHeight * 0.12));
        drawText(row.label, detailInsetX + 2, metricRowTextY, {
          size: detailMetricTextSize,
          weight: 500,
          family: '"Inter", "SF Pro Text", "SF Pro Display", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
          color: '#888888',
          maxWidth: detailContentWidth * 0.6,
        });
        drawText(row.value, detailRightX, metricRowTextY, {
          size: detailMetricTextSize,
          weight: 400,
          family: '"Inter", "SF Pro Text", "SF Pro Display", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
          color: '#171717',
          align: 'right',
        });
        line(
          context,
          detailInsetX,
          rowTopY + metricRowHeight - metricDividerInset,
          detailInsetX + detailContentWidth,
          rowTopY + metricRowHeight - metricDividerInset,
          '#E2E2E2',
          1,
        );
      });

      const relationStartY = maxRelationStartY;
      const relationButtonLabelFamily = '"Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif';
      const relationButtonLabelWeight = 600;

      relationButtons.forEach((entry, index) => {
        const buttonY = relationStartY + (index * (relationButtonHeight + relationButtonGap));
        if (buttonY + relationButtonHeight > detailsBottomY - 8) {
          return;
        }
        const isOutlineButton = safeText(entry.style).toLowerCase() === 'outline';
        const nodeId = safeText(entry.nodeId);
        const relationNode = resolveNodeById(nodeId);
        const buttonEnabled = Boolean(nodeId);
        const customLabel = safeText(entry.label);
        const buttonLabel = customLabel || (buttonEnabled
          ? truncateText(safeText(relationNode?.name || relationNode?.id || nodeId), 24)
          : '-');
        const buttonFill = isOutlineButton
          ? '#FFFFFF'
          : (buttonEnabled ? '#D0E6FF' : '#E1EBF8');
        const buttonTextColor = isOutlineButton
          ? '#077AFF'
          : (buttonEnabled ? '#077AFF' : '#7D9BC2');
        const iconSize = Math.round(clamp(
          relationButtonHeight * (isOutlineButton ? 0.62 : 0.58),
          18,
          isOutlineButton ? 28 : 26,
        ));
        const iconCenterX = detailInsetX + Math.round(22 + (relationButtonHeight * 0.3));
        const iconCenterY = buttonY + (relationButtonHeight / 2) + 0.5;
        fillRoundedRect(context, detailInsetX, buttonY, detailContentWidth, relationButtonHeight, 23, buttonFill);
        if (isOutlineButton) {
          strokeRoundedRect(
            context,
            detailInsetX + 0.5,
            buttonY + 0.5,
            detailContentWidth - 1,
            relationButtonHeight - 1,
            23,
            '#077AFF',
            1,
          );
        }
        const renderedSvg = drawImageAssetRect(
          iconCenterX - (iconSize / 2),
          iconCenterY - (iconSize / 2),
          iconSize,
          iconSize,
          safeText(entry.iconPath),
        );
        if (!renderedSvg) {
          drawMaterialButtonIcon(entry.iconName, iconCenterX, iconCenterY, {
            size: iconSize,
            weight: isOutlineButton ? 500 : 600,
            color: buttonTextColor,
            fallbackGlyph: entry.fallbackGlyph,
            fill: isOutlineButton ? 0 : 1,
          });
        }
        drawText(buttonLabel, detailCenterX, buttonY + (relationButtonHeight / 2) + 0.5, {
          size: detailRelationLabelSize,
          weight: relationButtonLabelWeight,
          family: relationButtonLabelFamily,
          color: buttonTextColor,
          align: 'center',
          maxWidth: detailContentWidth - 84,
        });
        const buttonAction = safeText(entry.action) || (nodeId ? `node:focus:${nodeId}` : '');
        if (buttonEnabled && buttonAction) {
          registerButton({
            id: `side-nav-relation-${entry.id}`,
            x: detailInsetX,
            y: buttonY + buttonYOffset,
            width: detailContentWidth,
            height: relationButtonHeight,
            action: buttonAction,
          });
        }
      });
    }

    fillRoundedRect(context, slotX, timerCardY, slotWidth, timerCardHeight, 18, '#F6F7FA');
    strokeRoundedRect(context, slotX + 0.5, timerCardY + 0.5, slotWidth - 1, timerCardHeight - 1, 18, '#E4E7ED');
    const cutoffSnapshot = resolveServerCutoffSnapshot();
    drawText('Server Timer', slotX + 14, timerCardY + 16, {
      size: 10,
      weight: 700,
      color: '#656C7D',
    });
    drawText(cutoffSnapshot.serverTimeLabel, slotX + 14, timerCardY + 34, {
      size: 11,
      weight: 500,
      color: '#3E4658',
      maxWidth: slotWidth - 28,
    });
    drawText(cutoffSnapshot.cutoffLabel, slotX + 14, timerCardY + 50, {
      size: 10,
      weight: 600,
      color: '#70798B',
      maxWidth: slotWidth - 28,
    });
    drawText('Next cut-off in', slotX + 14, timerCardY + 74, {
      size: 10,
      weight: 600,
      color: '#70798B',
    });
    drawText(cutoffSnapshot.countdownLabel, slotX + 14, timerCardY + 94, {
      size: 16,
      weight: 700,
      color: '#2F3645',
    });

  } finally {
    if (applyPanelReveal) {
      context.restore();
    }
  }
}

function drawRightPanel(layout) {
  const panel = layout.rightPanel;
  drawPanelChrome(panel, 'right');

  drawText('Design', panel.x + 16, panel.y + 22, {
    size: 12,
    weight: 600,
    color: '#e4e8f5',
  });
  drawText('Prototype', panel.x + 70, panel.y + 22, {
    size: 12,
    weight: 500,
    color: '#8f9ab1',
  });

  const universeRootId = getUniverseRootId();
  const selectedLocalMeta = state.selectedId
    ? state.adapter.resolveNodeMetrics(state.selectedId, getUniverseOptions())
    : null;
  const selectedGlobalMeta = state.selectedId
    ? state.adapter.resolveNodeMetrics(state.selectedId, getGlobalUniverseOptions())
    : null;
  const selectedNode = selectedLocalMeta?.node || selectedGlobalMeta?.node || null;
  const universeGlobalMeta = state.adapter.resolveNodeMetrics(universeRootId, getGlobalUniverseOptions());
  fillRoundedRect(context, panel.x + 12, panel.y + 40, panel.width - 24, 222, 22, '#202127');
  strokeRoundedRect(context, panel.x + 12.5, panel.y + 40.5, panel.width - 25, 221, 22, 'rgba(255,255,255,0.07)');

  drawText('Selected Node', panel.x + 24, panel.y + 58, {
    size: 11,
    weight: 600,
    color: '#adb7cc',
  });
  drawText(
    truncateText(safeText(selectedNode?.name || '(none)'), 24),
    panel.x + 24,
    panel.y + 80,
    {
      size: 14,
      weight: 700,
      color: '#f2f6ff',
    },
  );
  drawText(
    truncateText(safeText(selectedNode?.id || '-'), 28),
    panel.x + 24,
    panel.y + 99,
    {
      size: 10,
      weight: 500,
      color: '#9aa5be',
    },
  );

  drawText(`Local Depth: ${selectedLocalMeta ? selectedLocalMeta.localDepth : '-'}`, panel.x + 24, panel.y + 124, {
    size: 11,
    weight: 500,
    color: '#d5dcef',
  });
  drawText(`Global Depth: ${selectedGlobalMeta ? selectedGlobalMeta.globalDepth : '-'}`, panel.x + 24, panel.y + 142, {
    size: 11,
    weight: 500,
    color: '#d5dcef',
  });
  drawText(`Local Path: ${selectedLocalMeta ? selectedLocalMeta.localPath || '(root)' : '-'}`, panel.x + 24, panel.y + 160, {
    size: 11,
    weight: 500,
    color: '#d5dcef',
    maxWidth: panel.width - 58,
  });
  drawText(`Global Path: ${selectedGlobalMeta ? selectedGlobalMeta.globalPath || '(root)' : '-'}`, panel.x + 24, panel.y + 178, {
    size: 11,
    weight: 500,
    color: '#d5dcef',
    maxWidth: panel.width - 58,
  });
  drawText(`Universe Root: ${universeRootId}`, panel.x + 24, panel.y + 196, {
    size: 11,
    weight: 500,
    color: '#d5dcef',
    maxWidth: panel.width - 58,
  });
  drawText(
    `Volume: ${selectedNode ? safeNumber(selectedNode.volume, 0).toLocaleString() : '-'}`,
    panel.x + 24,
    panel.y + 214,
    {
      size: 11,
      weight: 500,
      color: '#d5dcef',
    },
  );
  drawText('Universe Trail', panel.x + 24, panel.y + 232, {
    size: 10,
    weight: 600,
    color: '#9aa5be',
  });
  drawUniverseBreadcrumbLinks(panel.x + 24, panel.y + 238, panel.width - 52);

  const stats = state.frameResult?.stats || {};
  fillRoundedRect(context, panel.x + 12, panel.y + 264, panel.width - 24, 182, 22, '#202127');
  strokeRoundedRect(context, panel.x + 12.5, panel.y + 264.5, panel.width - 25, 181, 22, 'rgba(255,255,255,0.07)');

  drawText('Render Stats', panel.x + 24, panel.y + 282, {
    size: 11,
    weight: 600,
    color: '#adb7cc',
  });
  drawText(`Visible: ${safeNumber(stats.visible, 0)}`, panel.x + 24, panel.y + 304, {
    size: 11,
    weight: 500,
    color: '#d8deef',
  });
  drawText(`Full detail: ${safeNumber(stats.full, 0)}`, panel.x + 24, panel.y + 322, {
    size: 11,
    weight: 500,
    color: '#d8deef',
  });
  drawText(`Medium detail: ${safeNumber(stats.medium, 0)}`, panel.x + 24, panel.y + 340, {
    size: 11,
    weight: 500,
    color: '#d8deef',
  });
  drawText(`Dot detail: ${safeNumber(stats.dot, 0)}`, panel.x + 24, panel.y + 358, {
    size: 11,
    weight: 500,
    color: '#d8deef',
  });
  drawText(`Hidden: ${safeNumber(stats.hidden, 0)}`, panel.x + 24, panel.y + 376, {
    size: 11,
    weight: 500,
    color: '#d8deef',
  });
  drawText(`Culled: ${safeNumber(stats.culled, 0)}`, panel.x + 24, panel.y + 394, {
    size: 11,
    weight: 500,
    color: '#d8deef',
  });
  drawText(`Connectors: ${safeNumber(stats.connectors, 0)}`, panel.x + 24, panel.y + 412, {
    size: 11,
    weight: 500,
    color: '#d8deef',
  });
  drawText(`Total filtered: ${safeNumber(stats.total, 0)}`, panel.x + 24, panel.y + 430, {
    size: 11,
    weight: 500,
    color: '#d8deef',
  });
  drawText(
    `Universe: ${universeRootId} (cap ${getUniverseDepthCap()})`,
    panel.x + 24,
    panel.y + 448,
    {
      size: 10,
      weight: 500,
      color: '#9aa5be',
      maxWidth: panel.width - 58,
    },
  );

  fillRoundedRect(context, panel.x + 12, panel.y + panel.height - 126, panel.width - 24, 114, 22, '#202127');
  strokeRoundedRect(context, panel.x + 12.5, panel.y + panel.height - 125.5, panel.width - 25, 113, 22, 'rgba(255,255,255,0.07)');
  drawText(`Engine: ${state.engineMode.mode}`, panel.x + 24, panel.y + panel.height - 104, {
    size: 11,
    weight: 600,
    color: '#dde4f6',
  });
  drawText(`Scale: ${state.camera.view.scale.toFixed(3)}`, panel.x + 24, panel.y + panel.height - 86, {
    size: 11,
    weight: 500,
    color: '#b8c2d9',
  });
  drawText(`Root Global Depth: ${universeGlobalMeta ? universeGlobalMeta.globalDepth : '-'}`, panel.x + 24, panel.y + panel.height - 68, {
    size: 11,
    weight: 500,
    color: '#b8c2d9',
  });
  drawText(`FPS: ${state.perf.fps.toFixed(1)}`, panel.x + 24, panel.y + panel.height - 50, {
    size: 11,
    weight: 500,
    color: '#b8c2d9',
  });
  drawText(`Frame: ${state.perf.frameMs.toFixed(1)} ms`, panel.x + 24, panel.y + panel.height - 32, {
    size: 11,
    weight: 500,
    color: '#b8c2d9',
  });
}

function drawTopCenterBar(layout) {
  void layout;
}

function drawBottomToolBar(layout) {
  const panelReveal = resolveStartupRevealForPanel(STARTUP_DOCK_DELAY_MS);
  if (panelReveal.progress <= 0) {
    return;
  }
  const applyPanelReveal = beginStartupReveal(panelReveal);
  const buttonYOffset = applyPanelReveal ? panelReveal.translateY : 0;

  try {
  const panel = layout.sideNav;
  const workspace = layout.workspace;
  const railButtonSize = 44;
  const railGap = 12;
  const railEdgeInset = 8;
  const railTopGapFromProfile = 14;
  const dockIconSize = 20;
  const floatingProfileSize = 44;
  const profileX = Math.max(
    8,
    Math.round((workspace.x + workspace.width) - floatingProfileSize - 8),
  );
  const profileY = panel.y;
  const profileLeftDockButtons = [
    {
      id: 'profile-left-dock-account-overview',
      iconGlyph: String.fromCodePoint(0xE871),
      iconLigature: 'dashboard',
      action: 'panel:account-overview:toggle',
    },
    {
      id: 'profile-left-dock-rank-advancement',
      iconGlyph: String.fromCodePoint(0xEB6B),
      iconLigature: 'workspace_premium',
      action: 'panel:rank-advancement:placeholder',
    },
  ];
  const profileLeftDockButtonSize = 40;
  const profileLeftDockGap = 8;
  let profileLeftDockCursorRight = profileX - profileLeftDockGap;
  for (let index = 0; index < profileLeftDockButtons.length; index += 1) {
    const button = profileLeftDockButtons[index];
    const hovered = state.hoveredButtonId === button.id;
    const isAccountOverviewToggle = button.action === 'panel:account-overview:toggle';
    const active = isAccountOverviewToggle && Boolean(state.ui?.accountOverviewVisible);
    const x = profileLeftDockCursorRight - profileLeftDockButtonSize;
    const y = profileY + Math.round((floatingProfileSize - profileLeftDockButtonSize) / 2);
    const fill = active
      ? '#D7E7FF'
      : (hovered ? '#E7E9EF' : SHELL_PANEL_COLOR);
    const stroke = active
      ? '#BDD5F8'
      : (hovered ? '#D7DBE6' : SHELL_PANEL_COLOR);
    const iconColor = active ? '#1F5EA3' : '#4A5262';
    const radius = profileLeftDockButtonSize / 2;
    const centerX = x + radius;
    const centerY = y + radius;

    context.beginPath();
    context.arc(centerX, centerY, radius, 0, Math.PI * 2);
    context.fillStyle = fill;
    context.fill();
    context.beginPath();
    context.arc(centerX, centerY, Math.max(1, radius - 0.5), 0, Math.PI * 2);
    context.lineWidth = 1;
    context.strokeStyle = stroke;
    context.stroke();

    const iconLigature = safeText(button.iconLigature);
    if (iconLigature) {
      drawMaterialButtonIcon(iconLigature, centerX, centerY + 0.5, {
        size: 18,
        weight: 500,
        color: iconColor,
        fill: 0,
        fallbackGlyph: () => {
          drawText(button.iconGlyph, centerX, centerY + 0.5, {
            size: 18,
            weight: 500,
            family: '"Material Symbols Outlined", "Segoe UI Symbol", sans-serif',
            color: iconColor,
            align: 'center',
          });
        },
      });
    } else {
      drawText(button.iconGlyph, centerX, centerY + 0.5, {
        size: 18,
        weight: 500,
        family: '"Material Symbols Outlined", "Segoe UI Symbol", sans-serif',
        color: iconColor,
        align: 'center',
      });
    }

    registerButton({
      id: button.id,
      x,
      y: y + buttonYOffset,
      width: profileLeftDockButtonSize,
      height: profileLeftDockButtonSize,
      action: button.action,
    });

    profileLeftDockCursorRight = x - profileLeftDockGap;
  }

  const railX = Math.round((workspace.x + workspace.width) - railButtonSize - railEdgeInset);
  const railStartY = panel.y + floatingProfileSize + railTopGapFromProfile;

  const dockButtons = [
    {
      id: 'dock-placeholder',
      iconGlyph: String.fromCodePoint(0xF525),
      iconLigature: 'asterisk',
      action: 'dock:placeholder',
    },
    {
      id: 'dock-deep',
      iconGlyph: String.fromCodePoint(0xE16D),
      iconLigature: 'low_priority',
      action: 'camera:deep',
    },
    {
      id: 'dock-enter',
      iconGlyph: String.fromCodePoint(0xEA77),
      iconLigature: 'send_money',
      action: 'universe:enter',
    },
    {
      id: 'dock-home',
      iconGlyph: String.fromCodePoint(0xE9B2),
      iconLigature: 'home',
      action: 'camera:home',
    },
    {
      id: 'dock-back',
      iconGlyph: String.fromCodePoint(0xEF7D),
      iconLigature: 'arrow_left_alt',
      action: 'universe:back',
    },
  ];

  for (let index = 0; index < dockButtons.length; index += 1) {
    const button = dockButtons[index];
    const hovered = state.hoveredButtonId === button.id;
    const isAccountOverviewToggle = button.action === 'panel:account-overview:toggle';
    const active = isAccountOverviewToggle && Boolean(state.ui?.accountOverviewVisible);
    const x = railX;
    const y = railStartY + (index * (railButtonSize + railGap));
    const fill = active
      ? '#D7E7FF'
      : (hovered ? '#DEDEDE' : SHELL_PANEL_COLOR);
    const stroke = active
      ? '#BDD5F8'
      : (hovered ? '#DFE2EA' : SHELL_PANEL_COLOR);
    const iconColor = active ? '#1F5EA3' : '#444444';
    const radius = railButtonSize / 2;
    const circleCenterX = x + radius;
    const circleCenterY = y + radius;

    context.beginPath();
    context.arc(circleCenterX, circleCenterY, radius, 0, Math.PI * 2);
    context.fillStyle = fill;
    context.fill();
    context.beginPath();
    context.arc(circleCenterX, circleCenterY, Math.max(1, radius - 0.5), 0, Math.PI * 2);
    context.lineWidth = 1;
    context.strokeStyle = stroke;
    context.stroke();

    const iconCenterX = circleCenterX;
    const iconCenterY = circleCenterY + 0.5;
    const iconLigature = safeText(button.iconLigature);
    if (iconLigature) {
      drawMaterialButtonIcon(iconLigature, iconCenterX, iconCenterY, {
        size: dockIconSize,
        weight: 500,
        color: iconColor,
        fill: 0,
        fallbackGlyph: () => {
          drawText(button.iconGlyph, iconCenterX, iconCenterY, {
            size: dockIconSize,
            weight: 500,
            family: '"Material Symbols Outlined", "Segoe UI Symbol", sans-serif',
            color: iconColor,
            align: 'center',
          });
        },
      });
    } else {
      drawText(button.iconGlyph, iconCenterX, iconCenterY, {
        size: dockIconSize,
        weight: 500,
        family: '"Material Symbols Outlined", "Segoe UI Symbol", sans-serif',
        color: iconColor,
        align: 'center',
      });
    }
    registerButton({
      id: button.id,
      x,
      y: y + buttonYOffset,
      width: railButtonSize,
      height: railButtonSize,
      action: button.action,
    });
  }
  } finally {
    if (applyPanelReveal) {
      context.restore();
    }
  }
}

function resolveStartupRevealForDepth(depth = 0, nowMs = getNowMs(), extraDelayMs = 0) {
  const intro = state.intro;
  if (!intro || !Number.isFinite(intro.startedAtMs)) {
    const safeDepth = Math.max(0, Math.floor(safeNumber(depth, 0)));
    const depthDrift = 1 + Math.min(8, safeDepth) * 0.08;
    return {
      active: true,
      progress: 0,
      translateY: safeNumber(intro?.offsetYPx, STARTUP_REVEAL_OFFSET_Y) * depthDrift,
      blurPx: safeNumber(intro?.blurPx, STARTUP_REVEAL_BLUR_PX),
      alpha: 0,
    };
  }
  const durationMs = Math.max(1, safeNumber(intro.durationMs, STARTUP_REVEAL_MS));
  const safeDepth = Math.max(0, Math.floor(safeNumber(depth, 0)));
  const staggerMs = Math.max(0, safeNumber(intro.staggerMs, STARTUP_REVEAL_STAGGER_MS));
  const delayMs = (safeDepth * staggerMs) + Math.max(0, safeNumber(extraDelayMs, 0));
  const elapsedMs = Math.max(0, nowMs - safeNumber(intro.startedAtMs, nowMs) - delayMs);
  const t = clamp(elapsedMs / durationMs, 0, 1);
  const eased = easeOutCubic(t);
  const inverse = 1 - eased;
  const blurTailWeight = t >= STARTUP_REVEAL_END_FILTER_PROGRESS
    ? clamp(
      (1 - t) / Math.max(0.0001, 1 - STARTUP_REVEAL_END_FILTER_PROGRESS),
      0,
      1,
    )
    : 1;
  const depthDrift = 1 + Math.min(8, safeDepth) * 0.08;
  return {
    active: t < 1,
    progress: t,
    translateY: safeNumber(intro.offsetYPx, STARTUP_REVEAL_OFFSET_Y) * depthDrift * inverse,
    blurPx: safeNumber(intro.blurPx, STARTUP_REVEAL_BLUR_PX) * inverse * blurTailWeight,
    alpha: clamp(0.12 + (eased * 0.88), 0, 1),
  };
}

function resolveStartupRevealForPanel(delayMs = 0, nowMs = getNowMs()) {
  const intro = state.intro;
  const safeDelayMs = Math.max(0, safeNumber(delayMs, 0));
  const panelBlurPx = Math.max(0, safeNumber(intro?.panelBlurPx, STARTUP_PANEL_BLUR_PX));
  if (!intro || !Number.isFinite(intro.startedAtMs)) {
    return {
      active: true,
      progress: 0,
      translateY: STARTUP_PANEL_OFFSET_Y,
      blurPx: panelBlurPx,
      alpha: 0,
    };
  }

  const durationMs = STARTUP_PANEL_REVEAL_MS;
  const elapsedMs = Math.max(0, nowMs - safeNumber(intro.startedAtMs, nowMs) - safeDelayMs);
  const t = clamp(elapsedMs / durationMs, 0, 1);
  const eased = easeOutCubic(t);
  const inverse = 1 - eased;
  return {
    active: t < 1,
    progress: t,
    translateY: STARTUP_PANEL_OFFSET_Y * inverse,
    blurPx: panelBlurPx * inverse,
    alpha: clamp(0.12 + (eased * 0.88), 0, 1),
  };
}

function shouldApplyStartupReveal(reveal) {
  if (!reveal || !reveal.active) {
    return false;
  }
  const translateY = safeNumber(reveal.translateY, 0);
  const blurPx = Math.max(0, safeNumber(reveal.blurPx, 0));
  const alpha = clamp(safeNumber(reveal.alpha, 1), 0, 1);
  return (
    Math.abs(translateY) >= STARTUP_REVEAL_MIN_TRANSLATE_PX
    || blurPx >= STARTUP_REVEAL_MIN_FILTER_PX
    || alpha < STARTUP_REVEAL_MIN_ALPHA
  );
}

function beginStartupReveal(reveal) {
  if (!shouldApplyStartupReveal(reveal)) {
    return false;
  }
  const translateY = safeNumber(reveal.translateY, 0);
  const blurPx = Math.max(0, safeNumber(reveal.blurPx, 0));
  const alpha = clamp(safeNumber(reveal.alpha, 1), 0, 1);

  context.save();
  if (Math.abs(translateY) >= STARTUP_REVEAL_MIN_TRANSLATE_PX) {
    context.translate(0, translateY);
  }
  if (alpha < 1) {
    context.globalAlpha *= alpha;
  }
  if (blurPx >= STARTUP_REVEAL_MIN_FILTER_PX) {
    context.filter = `blur(${blurPx.toFixed(2)}px)`;
  }
  return true;
}

function resolveAnticipationSlots(frame, frameOptions) {
  if (resolvePendingPlacementRevealNodeId()) {
    return [];
  }
  if (Object.keys(state.placementFxTracks).length > 0) {
    return [];
  }
  const selectedProjected = frame?.selectedProjected;
  if (!selectedProjected) {
    return [];
  }

  const selectedNodeId = safeText(selectedProjected.id);
  if (!selectedNodeId) {
    return [];
  }

  const childLegs = resolveNodeChildLegState(selectedNodeId);
  if (childLegs.left && childLegs.right) {
    return [];
  }

  const baseLocalPath = safeText(selectedProjected.localPath).toUpperCase();
  if (baseLocalPath && /[^LR]/.test(baseLocalPath)) {
    return [];
  }

  // Enrollment slots are view-capped by the active universe depth, not absolute global depth.
  // This allows registration beyond global depth 20 by entering local view.
  const universeDepthCap = Math.min(getUniverseDepthCap(), ANTICIPATION_MAX_GLOBAL_DEPTH);
  const selectedGlobalDepth = Math.max(
    0,
    Math.floor(safeNumber(selectedProjected.globalDepth, safeNumber(selectedProjected.node?.depth, 0))),
  );
  const pendingReservation = resolvePendingPlacementRevealReservation();
  const sides = ['left', 'right'];
  const slots = [];

  for (const side of sides) {
    if (
      pendingReservation
      && pendingReservation.parentId === selectedNodeId
      && pendingReservation.placementLeg === side
    ) {
      continue;
    }
    if (childLegs[side]) {
      continue;
    }
    const direction = side === 'right' ? 'R' : 'L';
    const slotLocalPath = `${baseLocalPath}${direction}`;
    if (slotLocalPath.length > universeDepthCap) {
      continue;
    }
    const slotGlobalDepth = selectedGlobalDepth + 1;

    const projectedSlot = state.adapter.projectLocalPath(slotLocalPath, frameOptions);
    if (!projectedSlot) {
      continue;
    }

    const radius = clamp(safeNumber(projectedSlot.r, 0) * 0.88, 6.5, 32);
    if (radius <= 0.2) {
      continue;
    }

    const encodedParentId = encodeURIComponent(selectedNodeId);
    const key = `${selectedNodeId}:${side}`;
    slots.push({
      key,
      buttonId: `${ANTICIPATION_BUTTON_ID_PREFIX}${encodedParentId}-${side}`,
      action: `anticipation:${encodedParentId}|${side}`,
      parentNodeId: selectedNodeId,
      side,
      x: safeNumber(projectedSlot.x, 0),
      y: safeNumber(projectedSlot.y, 0),
      r: radius,
      localDepth: Math.max(0, Math.floor(safeNumber(projectedSlot.localDepth, slotLocalPath.length))),
      globalDepth: slotGlobalDepth,
    });
  }

  return slots;
}

function drawAnticipationConnectors(anticipationSlots, projectedNodes) {
  if (!state.showConnectors) {
    return;
  }
  const slots = Array.isArray(anticipationSlots) ? anticipationSlots : [];
  const visibleNodes = Array.isArray(projectedNodes) ? projectedNodes : [];
  if (!slots.length || !visibleNodes.length) {
    return;
  }

  const nodeById = new Map();
  for (const node of visibleNodes) {
    nodeById.set(node.id, node);
  }

  const nowMs = getNowMs();
  for (const slot of slots) {
    const parent = nodeById.get(slot.parentNodeId);
    if (!parent) {
      continue;
    }

    const revealDepth = Math.max(
      0,
      Math.floor(
        Math.max(
          safeNumber(parent.localDepth, 0),
          safeNumber(slot.localDepth, safeNumber(parent.localDepth, 0) + 1),
        ),
      ),
    );
    const revealExtraDelayMs = resolveDepthRevealExtraDelay(revealDepth, slot.key);
    const skipReveal = Boolean(state.intro?.skipConnectorReveal);
    let connectorAlpha = 1;
    let yOffset = 0;
    if (!skipReveal) {
      const reveal = resolveStartupRevealForDepth(revealDepth, nowMs, revealExtraDelayMs);
      if (reveal.progress <= 0) {
        continue;
      }
      connectorAlpha = clamp(reveal.alpha, 0, 1);
      yOffset = safeNumber(reveal.translateY, 0);
    }

    const startX = safeNumber(parent.x, 0);
    const startY = safeNumber(parent.y, 0) + (safeNumber(parent.r, 0) * 0.72) + yOffset;
    const endX = safeNumber(slot.x, 0);
    const endY = safeNumber(slot.y, 0) - (safeNumber(slot.r, 0) * 0.72) + yOffset;

    const gap = Math.max(2, endY - startY);
    const branchShare = parent.r >= 22 ? 0.34 : (parent.r >= 10 ? 0.28 : 0.22);
    const branchY = startY + (gap * branchShare);
    const branchRadius = Math.max(0.08, Math.min(safeNumber(parent.r, 0), safeNumber(slot.r, 0)));
    const lineWidth = clamp(branchRadius * 0.07, 0.06, 1.0);
    const stroke = `rgba(103,140,190,${(0.32 * connectorAlpha).toFixed(3)})`;

    context.save();
    context.setLineDash([7, 5]);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = stroke;
    context.lineWidth = lineWidth;
    context.beginPath();
    context.moveTo(startX, startY);
    if (branchY > startY + 0.5) {
      context.lineTo(startX, branchY);
    }
    if (Math.abs(endX - startX) > 0.5) {
      context.lineTo(endX, branchY);
    }
    context.lineTo(endX, endY);
    context.stroke();
    context.restore();
  }
}

function drawAnticipationSlots(anticipationSlots) {
  const slots = Array.isArray(anticipationSlots) ? anticipationSlots : [];
  if (!slots.length) {
    return;
  }

  for (const slot of slots) {
    const revealDepth = Math.max(0, Math.floor(safeNumber(slot.localDepth, 0)));
    const revealExtraDelayMs = resolveDepthRevealExtraDelay(revealDepth, slot.key);
    const reveal = resolveStartupRevealForDepth(revealDepth, getNowMs(), revealExtraDelayMs);
    if (reveal.progress <= 0) {
      continue;
    }
    const applyReveal = beginStartupReveal(reveal);

    try {
      const radius = Math.max(3.5, safeNumber(slot.r, 8));
      const hover = state.hoveredButtonId === slot.buttonId;
      const sideLabel = slot.side === 'right' ? 'RIGHT' : 'LEFT';

      registerButton({
        id: slot.buttonId,
        x: slot.x - radius - 8,
        y: slot.y - radius - 8,
        width: (radius + 8) * 2,
        height: (radius + 8) * 2,
        action: slot.action,
      });

      const outerRadius = radius + (hover ? 6 : 4);
      context.beginPath();
      context.arc(slot.x, slot.y, outerRadius, 0, Math.PI * 2);
      context.fillStyle = hover
        ? 'rgba(106,154,218,0.20)'
        : 'rgba(106,154,218,0.13)';
      context.fill();

      context.beginPath();
      context.arc(slot.x, slot.y, radius, 0, Math.PI * 2);
      context.fillStyle = hover
        ? 'rgba(255,255,255,0.92)'
        : 'rgba(255,255,255,0.86)';
      context.fill();
      context.lineWidth = hover ? 2.1 : 1.7;
      context.strokeStyle = hover
        ? 'rgba(88,132,194,0.90)'
        : 'rgba(88,132,194,0.76)';
      context.stroke();

      drawText('+', slot.x, slot.y + 0.5, {
        size: Math.max(11, Math.round(radius * 1.05)),
        weight: 700,
        color: hover ? '#4E7CAF' : '#5F86B7',
        align: 'center',
      });

      drawText(sideLabel, slot.x, slot.y + radius + 10, {
        size: 9,
        weight: 600,
        color: hover ? '#6A7E97' : '#7A8BA2',
        align: 'center',
        baseline: 'top',
      });
    } finally {
      if (applyReveal) {
        context.restore();
      }
    }
  }
}

function drawConnectors(projectedNodes) {
  if (!state.showConnectors) {
    return;
  }
  const visibleNodes = (Array.isArray(projectedNodes) ? projectedNodes : [])
    .filter((node) => !isNodeHiddenForPendingPlacement(node.id));
  if (!visibleNodes.length) {
    return;
  }

  const nodeById = new Map();
  for (const node of visibleNodes) {
    nodeById.set(node.id, node);
  }

  const childrenByParent = new Map();
  for (const node of visibleNodes) {
    const parentId = safeText(node.node?.parent);
    if (!parentId || !nodeById.has(parentId)) {
      continue;
    }
    if (!childrenByParent.has(parentId)) {
      childrenByParent.set(parentId, []);
    }
    childrenByParent.get(parentId).push(node);
  }

  function resolveChildTop(node) {
    return node.y - (Math.max(0.08, node.r * 0.72));
  }

  const nowMs = getNowMs();
  for (const [parentId, children] of childrenByParent.entries()) {
    const parent = nodeById.get(parentId);
    if (!parent || !children.length) {
      continue;
    }

    const parentDepth = safeNumber(parent.localDepth, safeNumber(parent.node?.depth, 0));
    const childDepth = Math.min(...children.map((child) => safeNumber(child.localDepth, parentDepth + 1)));
    const revealDepth = Math.max(parentDepth, childDepth);
    const revealExtraDelayMs = resolveDepthRevealExtraDelay(revealDepth, parentId);
    const skipReveal = Boolean(state.intro?.skipConnectorReveal);
    const connectorRevealMode = safeText(state.intro?.connectorRevealMode || 'full') || 'full';
    let applyReveal = false;
    let connectorAlpha = 1;
    let yOffset = 0;
    if (!skipReveal) {
      const reveal = resolveStartupRevealForDepth(revealDepth, nowMs, revealExtraDelayMs);
      if (reveal.progress <= 0) {
        continue;
      }
      if (connectorRevealMode === 'full') {
        applyReveal = beginStartupReveal(reveal);
      } else {
        connectorAlpha = clamp(reveal.alpha, 0, 1);
        yOffset = safeNumber(reveal.translateY, 0);
      }
    }

    children.sort((left, right) => left.x - right.x);

    const parentBottom = parent.y + (parent.r * 0.72) + yOffset;
    const minChildTop = Math.min(...children.map((child) => resolveChildTop(child) + yOffset));
    const gap = Math.max(2, minChildTop - parentBottom);
    const smallestChildRadius = Math.max(0.08, Math.min(...children.map((child) => child.r)));
    const trunkShare = parent.r >= 22 ? 0.34 : (parent.r >= 10 ? 0.28 : 0.22);
    let branchY = parentBottom + (gap * trunkShare);
    const minTrunk = Math.max(0.08, parent.r * 0.045);
    branchY = Math.max(parentBottom + minTrunk, branchY);
    branchY = Math.min(branchY, minChildTop - Math.max(0.06, smallestChildRadius * 0.08));
    if (branchY <= parentBottom) {
      branchY = parentBottom + 0.08;
    }

    const strong = parent.lodTier === 'full' || children.some((child) => child.lodTier === 'full');
    const stroke = strong
      ? `rgba(95,132,181,${(0.42 * connectorAlpha).toFixed(3)})`
      : `rgba(121,149,190,${(0.24 * connectorAlpha).toFixed(3)})`;
    const branchRadius = Math.max(0.08, Math.min(parent.r, ...children.map((child) => child.r)));
    const lineWidth = strong
      ? clamp(branchRadius * 0.09, 0.08, 1.4)
      : clamp(branchRadius * 0.07, 0.06, 1.0);

    const animatedChildren = children.filter((child) => Boolean(state.placementFxTracks[safeText(child.id)]));
    const staticChildren = animatedChildren.length
      ? children.filter((child) => !state.placementFxTracks[safeText(child.id)])
      : children;

    if (!animatedChildren.length) {
      line(context, parent.x, parentBottom, parent.x, branchY, stroke, lineWidth);

      if (children.length === 1) {
        const child = children[0];
        line(context, parent.x, branchY, child.x, branchY, stroke, lineWidth);
        line(context, child.x, branchY, child.x, resolveChildTop(child) + yOffset, stroke, lineWidth);
        if (applyReveal) {
          context.restore();
        }
        continue;
      }

      const minX = children[0].x;
      const maxX = children[children.length - 1].x;
      line(context, minX, branchY, maxX, branchY, stroke, lineWidth);

      for (const child of children) {
        line(context, child.x, branchY, child.x, resolveChildTop(child) + yOffset, stroke, lineWidth);
      }
      if (applyReveal) {
        context.restore();
      }
      continue;
    }

    if (staticChildren.length > 0) {
      line(context, parent.x, parentBottom, parent.x, branchY, stroke, lineWidth);
      if (staticChildren.length === 1) {
        const child = staticChildren[0];
        line(context, parent.x, branchY, child.x, branchY, stroke, lineWidth);
        line(context, child.x, branchY, child.x, resolveChildTop(child) + yOffset, stroke, lineWidth);
      } else {
        const minStaticX = staticChildren[0].x;
        const maxStaticX = staticChildren[staticChildren.length - 1].x;
        line(context, minStaticX, branchY, maxStaticX, branchY, stroke, lineWidth);
        for (const child of staticChildren) {
          line(context, child.x, branchY, child.x, resolveChildTop(child) + yOffset, stroke, lineWidth);
        }
      }
    }

    for (const child of animatedChildren) {
      const childTop = resolveChildTop(child) + yOffset;
      const track = state.placementFxTracks[safeText(child.id)];
      const progress = resolvePlacementConnectorProgress(track, nowMs);
      drawConnectorPathProgress(
        parent.x,
        parentBottom,
        branchY,
        child.x,
        childTop,
        stroke,
        lineWidth,
        progress,
      );
    }
    if (applyReveal) {
      context.restore();
    }
  }
}

function drawNode(node) {
  if (isNodeHiddenForPendingPlacement(node.id)) {
    return;
  }
  const localDepth = safeNumber(node.localDepth, safeNumber(node.node?.depth, 0));
  const skipReveal = Boolean(state.intro?.skipDotReveal) && node.lodTier === 'dot';
  let applyReveal = false;
  if (!skipReveal) {
    const revealExtraDelayMs = resolveDepthRevealExtraDelay(localDepth, node.id);
    const reveal = resolveStartupRevealForDepth(localDepth, getNowMs(), revealExtraDelayMs);
    if (reveal.progress <= 0) {
      return;
    }
    applyReveal = beginStartupReveal(reveal);
  }

  try {
  const isSelected = node.id === state.selectedId;
  const isFocusPathNode = Boolean(node.isFocusPathNode);
  const hasAncestorRing = isFocusPathNode && !isSelected;
  const selectionEmphasis = clamp(resolveSelectionEmphasis(node.id), 0, SELECTION_MAX_EMPHASIS);
  const placementScale = resolvePlacementScale(node.id);
  const renderedRadius = Math.max(0.2, node.r * placementScale);
  const activeRingStrength = clamp(selectionEmphasis, 0, 1);
  const activeRingPulse = Math.max(0, selectionEmphasis - 1);
  const hasActiveRing = activeRingStrength > 0.001;
  const activeRingAlpha = (0.34 + (activeRingStrength * 0.64)).toFixed(3);

  const nodeId = safeText(node.id);
  const sourceNode = node?.node && typeof node.node === 'object' ? node.node : null;
  const nodeRecord = sourceNode || node;
  const isActiveAccount = resolveNodeActivityState(nodeRecord);
  const isPersonallyEnrolledNode = isNodePersonallyEnrolledBySession(nodeRecord);
  const baseNodeVariant = isSessionAvatarNodeId(nodeId)
    ? 'auto'
    : (nodeId.toLowerCase() === 'root' ? 'root' : 'auto');
  const nodeVariant = isPersonallyEnrolledNode ? 'direct' : baseNodeVariant;
  const avatarRenderOptions = isActiveAccount
    ? (isPersonallyEnrolledNode
      ? {
        variant: nodeVariant,
        disablePhoto: true,
        ignoreSourcePalette: true,
      }
      : {})
    : {
      variant: isPersonallyEnrolledNode ? 'directInactive' : 'neutral',
      disablePhoto: true,
      ignoreSourcePalette: true,
    };
  let usedPhotoAvatar = false;

  if (node.lodTier === 'dot') {
    const r = Math.max(renderedRadius, 0.3);
    if (hasActiveRing || hasAncestorRing) {
      const pulseScale = 1 + (activeRingPulse * 0.08);
      const scaledRadius = r * pulseScale;
      const outerExtra = hasActiveRing ? (0.92 * activeRingStrength) : 0.9;
      const outerR = Math.max(1.2, scaledRadius + outerExtra);
      const innerR = Math.max(0.2, scaledRadius - (0.2 * (hasActiveRing ? activeRingStrength : 1)));
      context.beginPath();
      context.arc(node.x, node.y, outerR, 0, Math.PI * 2);
      context.fillStyle = hasActiveRing
        ? `rgba(255,255,255,${activeRingAlpha})`
        : 'rgba(174,184,198,0.9)';
      context.fill();

      drawResolvedAvatarCircle(node.x, node.y, innerR, nodeId, {
        node: sourceNode,
        variant: nodeVariant,
        alpha: 0.98,
        sheenAlpha: 0.15,
        ...avatarRenderOptions,
      });
      return;
    }

    drawResolvedAvatarCircle(node.x, node.y, r, nodeId, {
      node: sourceNode,
      variant: nodeVariant,
      alpha: 0.96,
      sheenAlpha: 0.12,
      ...avatarRenderOptions,
    });
    return;
  }

  const ringWidth = clamp(renderedRadius * 0.2, 2.4, 7.2);
  const pulseScale = 1 + (activeRingPulse * 0.06);
  const outerR = renderedRadius * pulseScale;
  const innerR = hasActiveRing
    ? Math.max(1.2, outerR - (ringWidth * activeRingStrength))
    : (hasAncestorRing
      ? Math.max(1.2, outerR - ringWidth)
      : outerR);

  if (hasActiveRing || hasAncestorRing) {
    context.beginPath();
    context.arc(node.x, node.y, outerR, 0, Math.PI * 2);
    context.fillStyle = hasActiveRing
      ? `rgba(255,255,255,${activeRingAlpha})`
      : 'rgba(176,186,200,0.9)';
    context.fill();
    context.lineWidth = 1;
    context.strokeStyle = hasActiveRing
      ? `rgba(241,248,255,${(0.46 + (activeRingStrength * 0.44)).toFixed(3)})`
      : 'rgba(148,162,180,0.82)';
    context.stroke();
  }

  const baseAvatarRender = drawResolvedAvatarCircle(node.x, node.y, innerR, nodeId, {
    node: sourceNode,
    variant: nodeVariant,
    alpha: 0.98,
    sheenAlpha: 0.16,
    ...avatarRenderOptions,
  });
  usedPhotoAvatar = Boolean(baseAvatarRender?.usedPhoto);
  context.beginPath();
  context.arc(node.x, node.y, innerR, 0, Math.PI * 2);
  context.lineWidth = (hasActiveRing || hasAncestorRing) ? 1.25 : 1;
  context.strokeStyle = hasActiveRing
    ? `rgba(255,255,255,${(0.28 + (activeRingStrength * 0.52)).toFixed(3)})`
    : (hasAncestorRing ? 'rgba(178,191,210,0.72)' : 'rgba(232,244,255,0.5)');
  context.stroke();

  const hideDeepLevelLabel = (
    localDepth >= 4
    && renderedRadius < 16
    && !isSelected
  );
  if (hideDeepLevelLabel || renderedRadius < 9 || usedPhotoAvatar) {
    return;
  }

  drawText(resolveInitials(node.node.name), node.x, node.y + 0.5, {
    size: Math.max(7, Math.floor(innerR * 0.56)),
    weight: 700,
    color: '#f8fbff',
    align: 'center',
  });
  } finally {
    if (applyReveal) {
      context.restore();
    }
  }
}

function drawTreeViewport(layout) {
  const viewport = layout.viewport;
  const projectionScale = resolveProjectionScale(state.camera.view.scale);

  const frameOptions = {
    ...getUniverseOptions(),
    depth: state.depthFilter,
    selectedId: state.selectedId,
    showConnectors: state.showConnectors,
    view: {
      x: state.camera.view.x,
      y: state.camera.view.y,
      scale: projectionScale,
    },
    viewport,
    nodeRadiusBase: NODE_RADIUS_BASE,
    lodThresholds: {
      full: 14,
      medium: 6.5,
      dot: 1.4,
      min: 0.3,
    },
    semanticDepth: {
      enabled: true,
      baseScale: PROJECTION_BASE_SCALE,
      baseFullDepth: 5,
      baseVisibleDepth: 5,
      fullDepthPerOctave: 1,
      visibleDepthPerOctave: 3,
    },
    cullMargin: Math.max(220, Math.round(Math.min(viewport.width, viewport.height) * 0.34)),
    devicePixelRatio: 1,
  };
  const frame = state.adapter.computeFrame(frameOptions);
  const anticipationSlots = resolveAnticipationSlots(frame, frameOptions);

  state.frameResult = frame;
  state.anticipationSlots = anticipationSlots;
  state.viewport = viewport;
  const projectedNodes = Array.isArray(frame.projectedNodes) ? frame.projectedNodes : [];

  context.save();
  context.beginPath();
  context.rect(layout.workspace.x, layout.workspace.y, layout.workspace.width, layout.workspace.height);
  context.clip();
  const universeViewOpacity = clamp(resolveUniverseEnterViewOpacity(), 0, 1);
  if (universeViewOpacity <= 0.001) {
    context.restore();
    return;
  }
  if (universeViewOpacity < 1) {
    context.globalAlpha *= universeViewOpacity;
  }

  drawConnectors(projectedNodes);
  drawAnticipationConnectors(anticipationSlots, projectedNodes);
  const selectedNode = projectedNodes.find((node) => node.id === state.selectedId) || null;

  for (const node of projectedNodes) {
    if (selectedNode && node.id === selectedNode.id) {
      continue;
    }
    drawNode(node);
  }
  if (selectedNode) {
    drawNode(selectedNode);
  }
  drawAnticipationSlots(anticipationSlots);

  context.restore();
}

function renderFrame() {
  const width = state.renderSize.width;
  const height = state.renderSize.height;

  state.layout = resolveLayout(width, height);
  state.buttons = [];
  if (isTreeNextEnrollModalOpen()) {
    syncTreeNextEnrollPanelPosition(state.layout);
  }

  context.clearRect(0, 0, width, height);
  drawBackground(width, height);
  drawWorkspaceBackdrop(state.layout.workspace);
  drawTreeViewport(state.layout);
  drawSideNav(state.layout);
  drawBottomToolBar(state.layout);
  syncAccountOverviewPanelPosition(state.layout);
  syncAccountOverviewPanelVisuals();
  syncAccountOverviewPanelVisibility();
  syncSideNavSearchInput();
  syncSideNavProfileMenu();
}
function setCameraTarget(nextView, animated = true) {
  const targetView = {
    x: safeNumber(nextView?.x, state.camera.view.x),
    y: safeNumber(nextView?.y, state.camera.view.y),
    scale: clamp(safeNumber(nextView?.scale, state.camera.view.scale), MIN_SCALE, MAX_SCALE),
  };
  if (!animated) {
    state.camera.target = null;
    state.camera.targetReason = '';
    state.camera.view = targetView;
    return;
  }
  state.camera.target = targetView;
  state.camera.targetReason = 'generic';
}

function animateCamera(deltaSeconds) {
  const target = state.camera.target;
  if (!target) {
    return;
  }
  const dampingRate = state.camera.targetReason === 'wheel'
    ? WHEEL_ZOOM_CAMERA_DAMPING
    : (state.camera.targetReason === 'universe-enter'
      ? UNIVERSE_ENTER_CAMERA_DAMPING
      : (state.camera.targetReason === 'universe-back'
        ? UNIVERSE_BACK_CAMERA_DAMPING
        : (state.camera.targetReason === 'enroll-placement'
          ? ENROLL_PLACEMENT_CAMERA_DAMPING
          : CAMERA_DAMPING)));
  const damping = 1 - Math.exp(-dampingRate * deltaSeconds);
  state.camera.view.x += (target.x - state.camera.view.x) * damping;
  state.camera.view.y += (target.y - state.camera.view.y) * damping;
  state.camera.view.scale += (target.scale - state.camera.view.scale) * damping;

  const done = (
    Math.abs(target.x - state.camera.view.x) < 0.1
    && Math.abs(target.y - state.camera.view.y) < 0.1
    && Math.abs(target.scale - state.camera.view.scale) < 0.0005
  );
  if (done) {
    state.camera.view = {
      x: target.x,
      y: target.y,
      scale: target.scale,
    };
    state.camera.target = null;
    state.camera.targetReason = '';
  }
}

function computeHomeView() {
  const viewport = state.viewport || state.layout?.viewport;
  const baseHomeView = {
    x: 0,
    y: 0,
    scale: DEFAULT_HOME_SCALE,
  };
  if (!viewport) {
    return baseHomeView;
  }

  const rootMetrics = state.adapter.resolveNodeMetrics(getUniverseRootId(), getUniverseOptions());
  if (!rootMetrics) {
    return baseHomeView;
  }

  const projectionScale = resolveProjectionScale(baseHomeView.scale);
  const desiredX = viewport.x + (viewport.width * 0.5);
  const desiredY = viewport.y + (viewport.height * 0.5);
  return {
    scale: baseHomeView.scale,
    x: desiredX - viewport.centerX - (rootMetrics.worldX * projectionScale),
    y: desiredY - viewport.baseY - (rootMetrics.worldY * projectionScale),
  };
}

function focusNodeForEnrollmentPlacement(nodeId, options = {}) {
  const targetNodeId = safeText(nodeId);
  if (!targetNodeId) {
    return false;
  }
  const viewport = state.viewport || state.layout?.viewport;
  if (!viewport) {
    return false;
  }

  const metrics = state.adapter.resolveNodeMetrics(targetNodeId, getUniverseOptions());
  if (!metrics) {
    return false;
  }

  const desiredRadius = Math.max(12, safeNumber(options.desiredRadius, ENROLL_PLACEMENT_FOCUS_RADIUS));
  const centerYRatio = clamp(
    safeNumber(options.centerYRatio, ENROLL_PLACEMENT_FOCUS_Y_RATIO),
    0.2,
    0.8,
  );
  const baseRadius = NODE_RADIUS_BASE * (metrics.worldRadius / WORLD_RADIUS_BASE);
  const desiredProjectionScale = desiredRadius / Math.max(0.001, baseRadius);
  const resolvedScale = resolveRawScaleFromProjection(desiredProjectionScale);
  const currentScaleReference = clamp(
    safeNumber(state.camera.target?.scale, state.camera.view.scale),
    MIN_SCALE,
    MAX_SCALE,
  );
  const minimumZoomInScale = clamp(currentScaleReference * 1.07, MIN_SCALE, MAX_SCALE);
  const scale = clamp(Math.max(resolvedScale, minimumZoomInScale), MIN_SCALE, MAX_SCALE);
  const projectionScale = resolveProjectionScale(scale);
  const desiredX = viewport.x + (viewport.width * 0.5);
  const desiredY = viewport.y + (viewport.height * centerYRatio);

  const targetView = {
    scale,
    x: desiredX - viewport.centerX - (metrics.worldX * projectionScale),
    y: desiredY - viewport.baseY - (metrics.worldY * projectionScale),
  };
  const animated = options.animated !== false;

  setCameraTarget(targetView, animated);
  if (animated && state.camera.target) {
    state.camera.targetReason = 'enroll-placement';
  }
  return true;
}

function playEnrollmentPlacementReveal(input) {
  const payload = (input && typeof input === 'object') ? input : null;
  const safeNodeId = safeText(payload?.nodeId ?? input);
  if (!safeNodeId) {
    return false;
  }
  const safeParentId = safeText(payload?.parentId);
  const safePlacementLeg = normalizeBinarySide(payload?.placementLeg) === 'right' ? 'right' : 'left';
  queuePlacementRevealAfterCamera(safeNodeId, {
    parentId: safeParentId,
    placementLeg: safePlacementLeg,
  });
  const focused = focusNodeForEnrollmentPlacement(safeNodeId, { animated: true });
  if (
    focused
    && state.camera.target
    && safeText(state.camera.targetReason) === 'enroll-placement'
  ) {
    return true;
  }
  state.pendingPlacementReveal = null;
  startPlacementGrowAnimation(safeNodeId);
  return true;
}

function focusNode(nodeId, desiredRadius = 24, animated = true) {
  const targetNodeId = safeText(nodeId);
  if (!targetNodeId) {
    return false;
  }
  const viewport = state.viewport || state.layout?.viewport;
  if (!viewport) {
    return false;
  }

  const metrics = state.adapter.resolveNodeMetrics(targetNodeId, getUniverseOptions());
  if (!metrics) {
    return false;
  }

  const baseRadius = NODE_RADIUS_BASE * (metrics.worldRadius / WORLD_RADIUS_BASE);
  const desiredProjectionScale = desiredRadius / Math.max(0.001, baseRadius);
  const scale = resolveRawScaleFromProjection(desiredProjectionScale);
  const projectionScale = resolveProjectionScale(scale);

  const desiredX = viewport.x + (viewport.width * 0.5);
  const desiredY = viewport.y + (viewport.height * 0.44);

  const targetView = {
    scale,
    x: desiredX - viewport.centerX - (metrics.worldX * projectionScale),
    y: desiredY - viewport.baseY - (metrics.worldY * projectionScale),
  };

  setSelectedNode(targetNodeId, { animate: animated });
  setCameraTarget(targetView, animated);
  return true;
}

function focusDeepestNode(animated = true) {
  const deepestId = safeText(state.adapter.resolveDeepestNodeId(getUniverseOptions()));
  if (!deepestId) {
    return false;
  }
  return focusNode(deepestId, 26, animated);
}

function focusRoot(animated = true) {
  return focusUniverseRoot(animated);
}

function resolvePreferredGlobalHomeNodeId() {
  const session = state.session && typeof state.session === 'object' ? state.session : null;
  const candidates = [
    session?.rootNodeId,
    session?.root_node_id,
    session?.nodeId,
    session?.node_id,
    session?.treeNodeId,
    session?.tree_node_id,
    session?.binaryTreeNodeId,
    session?.binary_tree_node_id,
    session?.id,
    session?.userId,
    session?.user_id,
    session?.memberId,
    session?.member_id,
    'root',
  ];
  const attemptedIds = new Set();
  for (const candidate of candidates) {
    const safeCandidate = safeText(candidate);
    if (!safeCandidate) {
      continue;
    }
    const checks = [safeCandidate];
    const lowerCandidate = safeCandidate.toLowerCase();
    if (lowerCandidate && lowerCandidate !== safeCandidate) {
      checks.push(lowerCandidate);
    }
    for (const checkId of checks) {
      if (attemptedIds.has(checkId)) {
        continue;
      }
      attemptedIds.add(checkId);
      const globalMeta = state.adapter.resolveNodeMetrics(checkId, getGlobalUniverseOptions());
      const resolvedId = safeText(globalMeta?.node?.id || checkId);
      if (resolvedId) {
        return resolvedId;
      }
    }
  }
  return 'root';
}

function goToGlobalHome(animated = true) {
  const currentRootId = getUniverseRootId();
  if (currentRootId !== 'root') {
    rememberUniverseCamera(currentRootId);
  }

  state.universe.rootId = 'root';
  state.universe.history = [];
  refreshUniverseBreadcrumb('root');
  state.query = '';
  state.depthFilter = 'all';

  const preferredHomeNodeId = resolvePreferredGlobalHomeNodeId();
  if (focusNode(preferredHomeNodeId, DEFAULT_ROOT_FOCUS_RADIUS, animated)) {
    return true;
  }
  if (focusNode('root', DEFAULT_ROOT_FOCUS_RADIUS, animated)) {
    return true;
  }

  setSelectedNode('', { animate: false });
  setCameraTarget(computeHomeView(), animated);
  return false;
}

function fitCameraToFilteredNodes(animated = true) {
  const viewport = state.viewport || state.layout?.viewport;
  if (!viewport) {
    return false;
  }
  const bounds = state.adapter.resolveWorldBounds({
    ...getUniverseOptions(),
    depth: state.depthFilter,
  });
  if (!bounds) {
    return false;
  }

  const paddingX = 74;
  const paddingY = 96;
  const availableWidth = Math.max(48, viewport.width - (paddingX * 2));
  const availableHeight = Math.max(48, viewport.height - (paddingY * 2));

  let desiredProjectionScale = Math.min(
    availableWidth / Math.max(1, bounds.width),
    availableHeight / Math.max(1, bounds.height),
  );
  const scale = resolveRawScaleFromProjection(desiredProjectionScale);
  const projectionScale = resolveProjectionScale(scale);

  const centerWorldX = (bounds.minX + bounds.maxX) / 2;
  const centerWorldY = (bounds.minY + bounds.maxY) / 2;

  const desiredX = viewport.x + (viewport.width * 0.5);
  const desiredY = viewport.y + (viewport.height * 0.5);

  setCameraTarget({
    scale,
    x: desiredX - viewport.centerX - (centerWorldX * projectionScale),
    y: desiredY - viewport.baseY - (centerWorldY * projectionScale),
  }, animated);

  return true;
}

function applyZoomAtPoint(pointX, pointY, nextScale) {
  const viewport = state.viewport || state.layout?.viewport;
  if (!viewport) {
    return;
  }
  const oldRawScale = clamp(state.camera.view.scale, MIN_SCALE, MAX_SCALE);
  const rawScale = clamp(nextScale, MIN_SCALE, MAX_SCALE);
  if (Math.abs(rawScale - oldRawScale) < 0.000001) {
    return;
  }
  const oldProjectionScale = resolveProjectionScale(oldRawScale);
  const projectionScale = resolveProjectionScale(rawScale);
  const worldX = (pointX - viewport.centerX - state.camera.view.x) / oldProjectionScale;
  const worldY = (pointY - viewport.baseY - state.camera.view.y) / oldProjectionScale;

  state.camera.target = null;
  state.camera.targetReason = '';
  state.camera.view.scale = rawScale;
  state.camera.view.x = pointX - viewport.centerX - (worldX * projectionScale);
  state.camera.view.y = pointY - viewport.baseY - (worldY * projectionScale);
}

function resolveZoomTargetViewAtPoint(pointX, pointY, nextScale, referenceView = state.camera.view) {
  const viewport = state.viewport || state.layout?.viewport;
  if (!viewport) {
    return null;
  }
  const sourceView = cloneCameraView(referenceView);
  const sourceScale = clamp(sourceView.scale, MIN_SCALE, MAX_SCALE);
  const targetScale = clamp(nextScale, MIN_SCALE, MAX_SCALE);
  if (Math.abs(targetScale - sourceScale) < 0.000001) {
    return null;
  }

  const sourceProjectionScale = resolveProjectionScale(sourceScale);
  const targetProjectionScale = resolveProjectionScale(targetScale);
  const worldX = (pointX - viewport.centerX - sourceView.x) / sourceProjectionScale;
  const worldY = (pointY - viewport.baseY - sourceView.y) / sourceProjectionScale;

  return {
    scale: targetScale,
    x: pointX - viewport.centerX - (worldX * targetProjectionScale),
    y: pointY - viewport.baseY - (worldY * targetProjectionScale),
  };
}

function applySmoothWheelZoomAtPoint(pointX, pointY, nextScale) {
  const referenceView = (
    state.camera.target
    && state.camera.targetReason === 'wheel'
  )
    ? state.camera.target
    : state.camera.view;
  const targetView = resolveZoomTargetViewAtPoint(pointX, pointY, nextScale, referenceView);
  if (!targetView) {
    return;
  }
  setCameraTarget(targetView, true);
  state.camera.targetReason = 'wheel';
}

function getWheelZoomReferenceScale() {
  const referenceView = (
    state.camera.target
    && state.camera.targetReason === 'wheel'
  )
    ? state.camera.target
    : state.camera.view;
  return clamp(safeNumber(referenceView?.scale, state.camera.view.scale), MIN_SCALE, MAX_SCALE);
}

function panCameraBy(deltaX, deltaY) {
  const safeDeltaX = safeNumber(deltaX, 0);
  const safeDeltaY = safeNumber(deltaY, 0);
  if (safeDeltaX === 0 && safeDeltaY === 0) {
    return;
  }
  state.camera.target = null;
  state.camera.view.x += safeDeltaX;
  state.camera.view.y += safeDeltaY;
}

function triggerAction(action) {
  const safeAction = safeText(action);
  if (!safeAction || safeAction === 'noop') {
    return;
  }
  if (safeAction === 'universe:enter') {
    clearPendingUniverseBackPrep();
  } else if (safeAction === 'universe:back') {
    clearPendingUniverseEnterPrep();
  } else {
    clearPendingUniverseEnterPrep();
    clearPendingUniverseBackPrep();
  }

  if (safeAction === 'brand-menu:toggle') {
    state.ui.sideNavBrandMenuOpen = !state.ui.sideNavBrandMenuOpen;
    if (state.ui.sideNavBrandMenuOpen) {
      closeSearchDropdown();
      const searchInput = ensureSideNavSearchInput();
      if (document.activeElement === searchInput) {
        searchInput.blur();
      }
    }
    return;
  }
  if (safeAction === 'side-nav:toggle') {
    state.ui.sideNavOpen = !state.ui.sideNavOpen;
    state.ui.sideNavBrandMenuOpen = false;
    closeSearchDropdown();
    const searchInput = ensureSideNavSearchInput();
    if (document.activeElement === searchInput) {
      searchInput.blur();
    }
    return;
  }
  if (safeAction === 'panel:account-overview:toggle') {
    setAccountOverviewPanelVisible(!Boolean(state.ui?.accountOverviewVisible));
    return;
  }
  if (safeAction.startsWith('brand-menu:page:')) {
    const targetPage = safeAction.slice('brand-menu:page:'.length);
    state.ui.sideNavBrandMenuOpen = false;
    if (targetPage === 'dashboard') {
      const dashboardPath = state.source === 'admin'
        ? ADMIN_DASHBOARD_HOME_PATH
        : MEMBER_DASHBOARD_HOME_PATH;
      redirectTo(dashboardPath);
    }
    return;
  }
  if (safeAction === 'brand-menu:action:logout') {
    state.ui.sideNavBrandMenuOpen = false;
    return;
  }
  if (safeAction === 'camera:home') {
    goToGlobalHome(true);
    return;
  }
  if (safeAction === 'camera:fit') {
    fitCameraToFilteredNodes(true);
    return;
  }
  if (safeAction === 'camera:deep') {
    focusDeepestNode(true);
    return;
  }
  if (safeAction === 'camera:root') {
    focusRoot(true);
    return;
  }
  if (safeAction.startsWith('universe:goto:')) {
    const targetRootId = safeAction.slice('universe:goto:'.length);
    gotoUniverseFromBreadcrumb(targetRootId, true);
    return;
  }
  if (safeAction === 'universe:enter') {
    enterNodeUniverseWithZoomHint(state.selectedId);
    return;
  }
  if (safeAction === 'universe:back') {
    exitNodeUniverseWithZoomHint(true);
    return;
  }
  if (safeAction === 'toggle:connectors') {
    state.showConnectors = !state.showConnectors;
    return;
  }
  if (safeAction === 'pin:toggle-selected') {
    const selectedId = safeText(state.selectedId);
    if (!selectedId) {
      return;
    }
    const pinnedNow = togglePinnedNode(selectedId);
    if (pinnedNow) {
      focusNode(selectedId, 30, true);
    }
    return;
  }
  if (safeAction.startsWith('pin:focus:')) {
    const nodeId = safeAction.slice('pin:focus:'.length);
    if (!nodeId) {
      return;
    }
    focusNode(nodeId, 30, true);
    return;
  }
  if (safeAction.startsWith('pin:remove:')) {
    const nodeId = safeAction.slice('pin:remove:'.length);
    removePinnedNode(nodeId);
    return;
  }
  if (safeAction.startsWith('node:focus:')) {
    const nodeId = safeAction.slice('node:focus:'.length);
    if (!nodeId) {
      return;
    }
    focusNode(nodeId, 30, true);
    return;
  }
  if (safeAction.startsWith('anticipation:')) {
    const payload = safeAction.slice('anticipation:'.length);
    const separatorIndex = payload.indexOf('|');
    const encodedParentId = separatorIndex >= 0
      ? payload.slice(0, separatorIndex)
      : payload;
    const sideValue = separatorIndex >= 0
      ? payload.slice(separatorIndex + 1)
      : '';
    let parentId = '';
    try {
      parentId = decodeURIComponent(encodedParentId || '');
    } catch {
      parentId = encodedParentId || '';
    }
    requestEnrollMemberFromTree(parentId, normalizeBinarySide(sideValue) || 'left');
    return;
  }
  if (safeAction === 'dock:placeholder') {
    void resetMemberBinaryTreeLaunchStateFromDock();
    return;
  }
  if (safeAction === 'panel:rank-advancement:placeholder') {
    // Placeholder action intentionally kept inert until Rank Advancement panel is implemented.
    return;
  }
  if (safeAction.startsWith('depth:')) {
    state.depthFilter = safeAction.slice('depth:'.length) || 'all';
    fitCameraToFilteredNodes(true);
    return;
  }
  if (safeAction.startsWith('query:')) {
    const mode = safeAction.slice('query:'.length);
    if (mode === 'all') {
      applySearchQuery('', { animated: true });
    } else if (mode === 'deep') {
      applySearchQuery('deep', { animated: true });
    } else if (mode === 'high') {
      applySearchQuery('leader', { animated: true });
    } else {
      applySearchQuery(mode, { animated: true });
    }
  }
}

function updateHoverState(pointX, pointY) {
  const button = buttonUnderPointer(pointX, pointY);
  state.hoveredButtonId = button?.id || '';
}

function onPointerDown(event) {
  clearPendingUniverseEnterPrep();
  clearPendingUniverseBackPrep();
  const pointerX = event.clientX;
  const pointerY = event.clientY;
  state.pointer.x = pointerX;
  state.pointer.y = pointerY;

  closeSearchDropdown();
  updateHoverState(pointerX, pointerY);
  const pointerInsideFavorites = pointInsideFavoritesCarousel(pointerX, pointerY);
  const brandMenuOpen = Boolean(state.ui.sideNavBrandMenuOpen);
  const button = buttonUnderPointer(pointerX, pointerY);
  if (button) {
    const isBrandButton = (
      safeText(button.action) === 'brand-menu:toggle'
      || button.id.startsWith(SIDE_NAV_BRAND_ITEM_BUTTON_PREFIX)
    );
    const isFavoriteButton = button.id.startsWith('side-nav-favorite-');
    if (brandMenuOpen && !isBrandButton) {
      state.ui.sideNavBrandMenuOpen = false;
    }
    if (pointerInsideFavorites && isFavoriteButton) {
      beginFavoritesCarouselDrag(event.pointerId, pointerX, pointerY, button.action);
      canvas.classList.add('dragging');
      try {
        canvas.setPointerCapture(event.pointerId);
      } catch {
        // Ignore pointer capture failures.
      }
      return;
    }
    triggerAction(button.action);
    return;
  }

  if (pointerInsideFavorites) {
    if (brandMenuOpen) {
      state.ui.sideNavBrandMenuOpen = false;
    }
    beginFavoritesCarouselDrag(event.pointerId, pointerX, pointerY);
    canvas.classList.add('dragging');
    try {
      canvas.setPointerCapture(event.pointerId);
    } catch {
      // Ignore pointer capture failures.
    }
    return;
  }

  if (brandMenuOpen) {
    state.ui.sideNavBrandMenuOpen = false;
    if (pointInsideActiveSideNav(pointerX, pointerY)) {
      return;
    }
  }

  if (!pointInsideRect(pointerX, pointerY, state.layout?.workspace)) {
    return;
  }
  if (pointInsideActiveSideNav(pointerX, pointerY)) {
    return;
  }

  const hitNode = findProjectedNodeAt(pointerX, pointerY);
  if (hitNode) {
    setSelectedNode(hitNode.id, { animate: true, toggleIfSame: true });
    return;
  }

  state.drag.active = true;
  state.drag.pointerId = event.pointerId;
  state.drag.lastX = pointerX;
  state.drag.lastY = pointerY;
  state.camera.target = null;
  canvas.classList.add('dragging');
  try {
    canvas.setPointerCapture(event.pointerId);
  } catch {
    // Ignore pointer capture failures.
  }
}

function onPointerMove(event) {
  state.pointer.x = event.clientX;
  state.pointer.y = event.clientY;
  state.pointer.inside = true;

  if (updateFavoritesCarouselDrag(event.pointerId, event.clientX, event.clientY)) {
    return;
  }

  if (state.drag.active && event.pointerId === state.drag.pointerId) {
    const deltaX = event.clientX - state.drag.lastX;
    const deltaY = event.clientY - state.drag.lastY;
    state.drag.lastX = event.clientX;
    state.drag.lastY = event.clientY;
    state.camera.view.x += deltaX;
    state.camera.view.y += deltaY;
    return;
  }

  updateHoverState(event.clientX, event.clientY);
}

function stopDragging(pointerId) {
  if (!state.drag.active) {
    return;
  }
  if (pointerId !== null && pointerId !== undefined && pointerId !== state.drag.pointerId) {
    return;
  }
  state.drag.active = false;
  state.drag.pointerId = null;
  if (!getSideNavFavoritesState().dragActive) {
    canvas.classList.remove('dragging');
  }
}

function onPointerUp(event) {
  const releaseAction = resolveFavoritesCarouselReleaseAction(event.pointerId);
  if (releaseAction) {
    triggerAction(releaseAction);
  }
  stopDragging(event.pointerId);
  try {
    canvas.releasePointerCapture(event.pointerId);
  } catch {
    // Ignore.
  }
}

function onPointerLeave() {
  state.pointer.inside = false;
  state.hoveredButtonId = '';
  stopFavoritesCarouselDrag(null);
  stopDragging(null);
}

function onWheel(event) {
  clearPendingUniverseEnterPrep();
  clearPendingUniverseBackPrep();
  const layout = state.layout;
  if (!layout || !pointInsideRect(event.clientX, event.clientY, layout.workspace)) {
    return;
  }
  if (pointInsideFavoritesCarousel(event.clientX, event.clientY)) {
    event.preventDefault();
    const deltaX = safeNumber(event.deltaX, 0);
    const deltaY = safeNumber(event.deltaY, 0);
    const horizontalDelta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
    scrollFavoritesBy(horizontalDelta);
    return;
  }
  if (pointInsideActiveSideNav(event.clientX, event.clientY)) {
    return;
  }

  const isTrackpadEvent = isLikelyTrackpadWheelEvent(event);
  const isTrackpadPinchZoom = isTrackpadEvent && event.ctrlKey && !event.metaKey;
  const isManualZoom = isManualWheelZoomModifierPressed(event);

  if (isTrackpadPinchZoom) {
    event.preventDefault();
    const zoomSensitivity = sanitizeTrackpadZoomSensitivity(state.trackpadZoomSensitivity);
    const zoomMultiplier = Math.exp((-safeNumber(event.deltaY, 0) / TRACKPAD_PINCH_DELTA_BASE) * zoomSensitivity);
    const nextScale = state.camera.view.scale * zoomMultiplier;
    applyZoomAtPoint(event.clientX, event.clientY, nextScale);
    return;
  }

  if (isTrackpadEvent && !isManualZoom) {
    event.preventDefault();
    const panDirection = state.reverseTrackpadMovement ? 1 : -1;
    const deltaX = safeNumber(event.deltaX, 0) * panDirection;
    const deltaY = safeNumber(event.deltaY, 0) * panDirection;
    panCameraBy(deltaX, deltaY);
    return;
  }

  if (isManualZoom) {
    event.preventDefault();
    const baseScale = getWheelZoomReferenceScale();
    const zoomFactor = safeNumber(event.deltaY, 0) < 0
      ? WHEEL_STEP_ZOOM_IN_FACTOR
      : WHEEL_STEP_ZOOM_OUT_FACTOR;
    applySmoothWheelZoomAtPoint(event.clientX, event.clientY, baseScale * zoomFactor);
    return;
  }

  event.preventDefault();
  const baseScale = getWheelZoomReferenceScale();
  const zoomMultiplier = Math.exp(-safeNumber(event.deltaY, 0) * 0.0016);
  const nextScale = baseScale * zoomMultiplier;
  applySmoothWheelZoomAtPoint(event.clientX, event.clientY, nextScale);
}

function onKeyDown(event) {
  const key = safeText(event.key).toLowerCase();
  const panStep = 34;

  if (isTreeNextEnrollModalOpen()) {
    if (key === 'escape') {
      closeTreeNextEnrollModal({ restoreFocus: true, clearFeedback: true, resetForm: false, clearPlacementLock: true });
      event.preventDefault();
    }
    return;
  }

  if (key === 'escape' && state.ui.sideNavBrandMenuOpen) {
    state.ui.sideNavBrandMenuOpen = false;
    event.preventDefault();
    return;
  }

  if (isEditableTarget()) {
    if (key === 'escape' && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
      event.preventDefault();
    }
    return;
  }

  if (key === 'u') {
    clearPendingUniverseBackPrep();
  } else if (key === 'b') {
    clearPendingUniverseEnterPrep();
  } else {
    clearPendingUniverseEnterPrep();
    clearPendingUniverseBackPrep();
  }

  if (key === 'arrowup') {
    state.camera.target = null;
    state.camera.view.y += panStep;
    event.preventDefault();
    return;
  }
  if (key === 'arrowdown') {
    state.camera.target = null;
    state.camera.view.y -= panStep;
    event.preventDefault();
    return;
  }
  if (key === 'arrowleft') {
    state.camera.target = null;
    state.camera.view.x += panStep;
    event.preventDefault();
    return;
  }
  if (key === 'arrowright') {
    state.camera.target = null;
    state.camera.view.x -= panStep;
    event.preventDefault();
    return;
  }
  if (key === '+' || key === '=') {
    const viewport = state.viewport || state.layout?.viewport;
    if (viewport) {
      const centerX = viewport.x + (viewport.width / 2);
      const centerY = viewport.y + (viewport.height / 2);
      applyZoomAtPoint(centerX, centerY, state.camera.view.scale * 1.16);
    }
    event.preventDefault();
    return;
  }
  if (key === '-') {
    const viewport = state.viewport || state.layout?.viewport;
    if (viewport) {
      const centerX = viewport.x + (viewport.width / 2);
      const centerY = viewport.y + (viewport.height / 2);
      applyZoomAtPoint(centerX, centerY, state.camera.view.scale / 1.16);
    }
    event.preventDefault();
    return;
  }
  if (key === 'f') {
    fitCameraToFilteredNodes(true);
    event.preventDefault();
    return;
  }
  if (key === 'h' || key === '0') {
    goToGlobalHome(true);
    event.preventDefault();
    return;
  }
  if (key === 'd') {
    focusDeepestNode(true);
    event.preventDefault();
    return;
  }
  if (key === 'r') {
    focusRoot(true);
    event.preventDefault();
    return;
  }
  if (key === 'u') {
    enterNodeUniverseWithZoomHint(state.selectedId);
    event.preventDefault();
    return;
  }
  if (key === 'b') {
    exitNodeUniverseWithZoomHint(true);
    event.preventDefault();
    return;
  }
  if (key === 'c') {
    state.showConnectors = !state.showConnectors;
    event.preventDefault();
    return;
  }
  if (key === 'p') {
    togglePinnedNode(state.selectedId);
    event.preventDefault();
  }
}

function onSessionStorageChange(event) {
  const expectedStorageKey = state.source === 'admin'
    ? ADMIN_AUTH_STORAGE_KEY
    : MEMBER_AUTH_STORAGE_KEY;
  const expectedCookieKey = state.source === 'admin'
    ? ADMIN_AUTH_COOKIE_KEY
    : MEMBER_AUTH_COOKIE_KEY;
  const changedKey = safeText(event?.key);
  if (changedKey && changedKey !== expectedStorageKey) {
    return;
  }
  const nextSession = readSessionSnapshot(expectedStorageKey, expectedCookieKey);
  if (!nextSession) {
    return;
  }
  state.session = nextSession;
  resetAccountOverviewRemoteSnapshot();
  pinnedNodeIdsLastSyncedKey = '';
  pinnedNodeIdsLocalDirty = false;
  void refreshAccountOverviewRemoteSnapshot({ force: true });
  if (state.source === 'member') {
    schedulePinnedNodeIdsServerSync({ immediate: true });
  }
}

function bindEvents() {
  window.addEventListener('resize', updateCanvasSize);
  window.addEventListener('keydown', onKeyDown, { passive: false });
  window.addEventListener('storage', onSessionStorageChange);
  document.addEventListener('visibilitychange', onTreeNextLiveSyncVisibilityChange);
  window.addEventListener('focus', onTreeNextLiveSyncWindowFocus);
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerLeave);
  canvas.addEventListener('wheel', onWheel, { passive: false });
}

let lastTimestamp = performance.now();
function tickFrame(timestamp) {
  state.timeMs = timestamp;
  updateSelectionAnimations(timestamp);
  updatePlacementAnimations(timestamp);

  const deltaSeconds = Math.max(0.0001, Math.min(0.08, (timestamp - lastTimestamp) / 1000));
  lastTimestamp = timestamp;

  adaptStartupRevealForFrameBudget(deltaSeconds * 1000);
  animateCamera(deltaSeconds);
  consumePendingPlacementReveal({ nowMs: timestamp });
  renderFrame();

  const instantFps = 1 / deltaSeconds;
  state.perf.fps = state.perf.fps === 0
    ? instantFps
    : ((state.perf.fps * 0.88) + (instantFps * 0.12));
  state.perf.frameMs = state.perf.fps > 0 ? (1000 / state.perf.fps) : 0;

  window.requestAnimationFrame(tickFrame);
}

async function bootstrap() {
  clearBootError();
  state.loading.startedAtMs = performance.now();
  hideFirstOpenSplashImmediately();
  if (loadingScreenElement instanceof HTMLElement) {
    loadingScreenElement.style.display = 'flex';
    loadingScreenElement.classList.remove('is-leaving');
  }

  const hasSession = await bootstrapSession();
  if (!hasSession) {
    return;
  }

  state.engineMode = await detectBinaryTreeNextEngineMode();
  consumeMockFirstTimeLaunchOverride();

  state.nodes = await loadTreeNextLiveNodes();
  state.adapter.setNodes(state.nodes);
  rebuildNodeChildLegIndex();
  updateTreeNextLiveSnapshotHash(state.nodes);
  state.universe.rootId = 'root';
  state.universe.depthCap = UNIVERSE_DEPTH_CAP;
  state.universe.cameraByRoot = Object.create(null);
  state.universe.history = [];
  state.universe.enterPrepToken = '';
  state.universe.enterPrepTimeoutId = 0;
  state.universe.enterPrepRafId = 0;
  state.universe.backPrepToken = '';
  state.universe.backPrepRafId = 0;
  state.universe.enterViewFadeMode = 'none';
  state.universe.enterViewFadeStartedAtMs = 0;
  state.universe.enterViewFadeDurationMs = 0;
  refreshUniverseBreadcrumb('root');

  setSelectedNode('', { animate: false });
  const localPinnedNodeIds = normalizePinnedNodeIds(readPinnedNodeIdsFromStorage());
  const launchStatePinnedNodeIds = normalizePinnedNodeIds(state.launchState?.pinnedNodeIds);
  const launchStatePinnedNodeIdsUpdatedAt = safeText(state.launchState?.pinnedNodeIdsUpdatedAt);

  if (state.source === 'member') {
    const shouldBackfillServerPinnedNodeIds = (
      launchStatePinnedNodeIds.length === 0
      && !launchStatePinnedNodeIdsUpdatedAt
      && localPinnedNodeIds.length > 0
    );

    const initialPinnedNodeIds = shouldBackfillServerPinnedNodeIds
      ? localPinnedNodeIds
      : launchStatePinnedNodeIds;

    setPinnedNodeIds(initialPinnedNodeIds, {
      persistLocal: true,
      syncServer: false,
    });

    pinnedNodeIdsLastSyncedKey = shouldBackfillServerPinnedNodeIds
      ? resolvePinnedNodeIdsSyncKey(launchStatePinnedNodeIds)
      : resolvePinnedNodeIdsSyncKey(initialPinnedNodeIds);

    if (shouldBackfillServerPinnedNodeIds) {
      schedulePinnedNodeIdsServerSync({ immediate: true });
    }
    pinnedNodeIdsLocalDirty = false;
  } else {
    setPinnedNodeIds(localPinnedNodeIds, {
      persistLocal: true,
      syncServer: false,
    });
    pinnedNodeIdsLastSyncedKey = '';
    pinnedNodeIdsLocalDirty = false;
  }

  updateCanvasSize();
  configureStartupRevealProfile();
  state.layout = resolveLayout(state.renderSize.width, state.renderSize.height);
  state.viewport = state.layout.viewport;
  bindEvents();
  initTreeNextEnrollModal();
  initAccountOverviewPanel();
  startTreeNextLiveSync();

  setCameraTarget(computeHomeView(), false);
  rememberUniverseCamera('root');

  state.timeMs = performance.now();
  renderFrame();
  await completeLoadingScreen();
  await waitForFirstOpenSplashContinue();
  state.intro.startedAtMs = performance.now();
  lastTimestamp = state.intro.startedAtMs;
  window.requestAnimationFrame(tickFrame);
}

bootstrap().catch((error) => {
  hideLoadingScreenImmediately();
  hideFirstOpenSplashImmediately();
  showBootError(error instanceof Error ? error.message : String(error));
});
