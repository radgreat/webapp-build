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
const ADMIN_ROOT_DISPLAY_NAME = 'Administrator';
const ADMIN_ROOT_USERNAME = 'administrator';
const ADMIN_ROOT_TITLE = 'Administrator';
const ADMIN_ROOT_ROLE = 'Administrator';
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
const TREE_NEXT_PRIVACY_ANONYMOUS_LABEL = 'Anonymous';
const TREE_NEXT_PRIVACY_HIDDEN_LABEL = 'Hidden';
const EXTREME_PLACEMENT_KEY_SET = new Set([
  'extreme-left',
  'extreme_left',
  'extreme left',
  'extreme-right',
  'extreme_right',
  'extreme right',
]);
const PLACEMENT_OPTION_LEFT = 'left';
const PLACEMENT_OPTION_RIGHT = 'right';
const PLACEMENT_OPTION_SPILLOVER_LEFT = 'spillover-left';
const PLACEMENT_OPTION_SPILLOVER_RIGHT = 'spillover-right';
const PLACEMENT_OPTION_EXTREME_LEFT = 'extreme-left';
const PLACEMENT_OPTION_EXTREME_RIGHT = 'extreme-right';
const PREFERRED_ACCOUNTS_PLACEMENT_OPTIONS = Object.freeze([
  PLACEMENT_OPTION_LEFT,
  PLACEMENT_OPTION_RIGHT,
  PLACEMENT_OPTION_SPILLOVER_LEFT,
  PLACEMENT_OPTION_SPILLOVER_RIGHT,
  PLACEMENT_OPTION_EXTREME_LEFT,
  PLACEMENT_OPTION_EXTREME_RIGHT,
]);
const PREFERRED_ACCOUNTS_PLACEMENT_LABEL_BY_OPTION = Object.freeze({
  [PLACEMENT_OPTION_LEFT]: 'Left',
  [PLACEMENT_OPTION_RIGHT]: 'Right',
  [PLACEMENT_OPTION_SPILLOVER_LEFT]: 'Spill Over Left',
  [PLACEMENT_OPTION_SPILLOVER_RIGHT]: 'Spill Over Right',
  [PLACEMENT_OPTION_EXTREME_LEFT]: 'Extreme Left',
  [PLACEMENT_OPTION_EXTREME_RIGHT]: 'Extreme Right',
});
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
const MEMBER_AUTH_SESSION_API = '/api/member-auth/session';
const MEMBER_REGISTERED_MEMBERS_API = '/api/registered-members';
const MEMBER_BINARY_TREE_PINNED_NODES_API = '/api/member-auth/binary-tree-next/pinned-nodes';
const MEMBER_BINARY_TREE_TIER_SORT_DIRECTIONS_API = '/api/member-auth/binary-tree-next/tier-sort-directions';
const ADMIN_REGISTERED_MEMBERS_API = '/api/admin/registered-members';
const ACCOUNT_OVERVIEW_BINARY_TREE_METRICS_API = '/api/binary-tree-metrics';
const ACCOUNT_OVERVIEW_SALES_TEAM_COMMISSIONS_API = '/api/sales-team-commissions';
const ACCOUNT_OVERVIEW_COMMISSION_CONTAINERS_API = '/api/commission-containers';
const ACCOUNT_OVERVIEW_E_WALLET_API = '/api/e-wallet';
const MEMBER_ACHIEVEMENTS_API = '/api/member-auth/achievements';
const MEMBER_GOOD_LIFE_MONTHLY_API = '/api/member-auth/good-life/monthly';
const ACCOUNT_OVERVIEW_REMOTE_SYNC_VISIBLE_INTERVAL_MS = TREE_NEXT_LIVE_SYNC_VISIBLE_INTERVAL_MS;
const ACCOUNT_OVERVIEW_REMOTE_SYNC_HIDDEN_INTERVAL_MS = TREE_NEXT_LIVE_SYNC_HIDDEN_INTERVAL_MS;
const ACCOUNT_OVERVIEW_REMOTE_SYNC_RETRY_INTERVAL_MS = 2800;
const RANK_ADVANCEMENT_REMOTE_SYNC_VISIBLE_INTERVAL_MS = TREE_NEXT_LIVE_SYNC_VISIBLE_INTERVAL_MS;
const RANK_ADVANCEMENT_REMOTE_SYNC_HIDDEN_INTERVAL_MS = TREE_NEXT_LIVE_SYNC_HIDDEN_INTERVAL_MS;
const RANK_ADVANCEMENT_REMOTE_SYNC_RETRY_INTERVAL_MS = 2800;
const MEMBER_REGISTERED_MEMBERS_SESSION_API = '/api/registered-members/session';
const ADMIN_REGISTERED_MEMBERS_SESSION_API = '/api/admin/registered-members/session';
const MEMBER_REGISTERED_MEMBERS_SESSION_COMPLETE_API = '/api/registered-members/session/complete';
const ADMIN_REGISTERED_MEMBERS_SESSION_COMPLETE_API = '/api/admin/registered-members/session/complete';
const STORE_INVOICES_API = '/api/store-invoices';
const MEMBER_DASHBOARD_HOME_PATH = '/index.html';
const ADMIN_DASHBOARD_HOME_PATH = '/admin.html';
const ENROLL_STRIPE_CHECKOUT_CONFIG_API = '/api/store-checkout/config';
const MY_STORE_CHECKOUT_SESSION_API = '/api/store-checkout/session';
const MY_STORE_CHECKOUT_SESSION_COMPLETE_API = '/api/store-checkout/complete';
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
    bv: 150,
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
const INFINITY_BUILDER_DIRECT_SPONSORS_PER_TIER = 3;
const INFINITY_BUILDER_TIER_NODE_REQUIREMENT = 3;
const INFINITY_BUILDER_TIER_BONUS_USD = 150;
const LEGACY_LEADERSHIP_TIER_BONUS_USD = 2000;
const INFINITY_BUILDER_TIER_OVERRIDE_RATE = 0.01;
const INFINITY_BUILDER_MIN_VISIBLE_TIERS = 6;
const INFINITY_BUILDER_MAX_VISIBLE_TIERS = 18;
const INFINITY_BUILDER_QUALIFYING_PACKAGE_KEY_SET = new Set([
  'infinity-builder-pack',
  'legacy-builder-pack',
]);
const LEGACY_LEADERSHIP_REQUIRED_PACKAGE_KEY = 'legacy-builder-pack';
const LEGACY_LEADERSHIP_TOTAL_NODES_PER_TIER = 40;
const LEGACY_LEADERSHIP_MAX_DEPTH = 3;
const LEGACY_LEADERSHIP_BASE_VISIBLE_TIERS = 1;
const LEGACY_LEADERSHIP_PREVIEW_LOCKED_TIERS = 0;
const LEGACY_TIER_CANVAS_NODE_COUNTS_BY_DEPTH = Object.freeze([1, 3, 9, 27]);
const LEGACY_TIER_CANVAS_PLACEHOLDER_ID_PREFIX = 'legacy-tier-canvas-empty';
const LEGACY_TIER_CANVAS_RADIUS_DEPTH_DECAY = 0.56;
const LEGACY_TIER_CANVAS_WORLD_RADIUS_MIN = 0.0002;
const INFINITY_BUILDER_PANEL_MODE_INFINITY = 'infinity';
const INFINITY_BUILDER_PANEL_MODE_LEGACY_LEADERSHIP = 'legacy-leadership';
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
  inactive: Object.freeze({
    light: [171, 176, 186],
    mid: [141, 147, 158],
    dark: [112, 119, 131],
  }),
  direct: Object.freeze({
    light: [191, 130, 255],
    mid: [158, 95, 236],
    dark: [123, 66, 209],
  }),
  directInactive: Object.freeze({
    light: [138, 144, 154],
    mid: [107, 113, 124],
    dark: [77, 84, 96],
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
const APPLE_MAPS_NODE_COLOR_ROTATION = Object.freeze(['ocean', 'mint', 'amber', 'rose']);
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
const MY_STORE_FEATURED_PRODUCT = Object.freeze({
  productKey: 'metacharge',
  label: 'MetaCharge™',
  imageUrl: '/brand_assets/Product%20Images/MetaCharge%20Blue%20Bottle%20-%20NOBG.png',
  price: 64,
  bv: 38,
  quantity: 1,
});
const MY_STORE_UPGRADE_PRODUCT_UNIT_BV = 50;
const MY_STORE_UPGRADE_DEFAULT_PRODUCT_KEY = 'metacharge';
const MY_STORE_UPGRADE_PRODUCT_META = Object.freeze({
  metacharge: Object.freeze({
    productKey: 'metacharge',
    label: 'MetaCharge™',
    imageUrl: '/brand_assets/Product%20Images/MetaCharge%20Blue%20Bottle%20-%20NOBG.png',
    unitPrice: 64,
    unitBv: MY_STORE_UPGRADE_PRODUCT_UNIT_BV,
  }),
  metaroast: Object.freeze({
    productKey: 'metaroast',
    label: 'MetaRoast™',
    imageUrl: '/brand_assets/Product%20Images/MetaCharge%20Blue%20Bottle%20-%20NOBG.png',
    unitPrice: 64,
    unitBv: MY_STORE_UPGRADE_PRODUCT_UNIT_BV,
  }),
});
const MY_STORE_STEP_CATALOG = 'catalog';
const MY_STORE_STEP_REVIEW = 'review';
const MY_STORE_STEP_CHECKOUT = 'checkout';
const MY_STORE_STEP_THANK_YOU = 'thank-you';
const MY_STORE_VALID_STEPS = new Set([
  MY_STORE_STEP_CATALOG,
  MY_STORE_STEP_REVIEW,
  MY_STORE_STEP_CHECKOUT,
  MY_STORE_STEP_THANK_YOU,
]);
const TREE_NEXT_STRIPE_RETURN_FLOW_QUERY_KEY = 'bt_checkout_flow';
const TREE_NEXT_STRIPE_RETURN_TARGET_QUERY_KEY = 'bt_return_target';
const TREE_NEXT_STRIPE_RETURN_FLOW_MY_STORE = 'my-store';
const TREE_NEXT_STRIPE_RETURN_FLOW_ENROLL = 'enroll-member';
const TREE_NEXT_STRIPE_RETURN_SIGNAL_STORAGE_KEY = 'binary-tree-next-stripe-return-signal-v1';
const TREE_NEXT_STRIPE_RETURN_SIGNAL_MAX_AGE_MS = 10 * 60 * 1000;
const TREE_NEXT_STRIPE_RETURN_MESSAGE_TYPE = 'binary-tree-next-stripe-return';
const MY_STORE_CHECKOUT_NETWORK_RETRY_LIMIT = 12;
const MY_STORE_CHECKOUT_NETWORK_RETRY_DELAY_MS = 1800;
const TREE_NEXT_PENDING_CHECKOUT_MY_STORE_KEY = 'binary-tree-next-pending-checkout-my-store-v1';
const TREE_NEXT_PENDING_CHECKOUT_ENROLL_KEY = 'binary-tree-next-pending-checkout-enroll-v1';
const MY_STORE_PACKAGE_DISPLAY_META = Object.freeze({
  'preferred-customer-pack': Object.freeze({
    label: 'Preferred Customer Account',
  }),
  'personal-builder-pack': Object.freeze({
    label: 'Personal Builder Package',
  }),
  'business-builder-pack': Object.freeze({
    label: 'Business Builder Package',
  }),
  'infinity-builder-pack': Object.freeze({
    label: 'Infinity Builder Package',
  }),
  'legacy-builder-pack': Object.freeze({
    label: 'Legacy Builder Package',
  }),
});
const MY_STORE_UPGRADE_PACKAGE_KEYS_BY_PACKAGE = Object.freeze({
  'preferred-customer-pack': Object.freeze([
    'personal-builder-pack',
    'business-builder-pack',
    'infinity-builder-pack',
    'legacy-builder-pack',
  ]),
  'personal-builder-pack': Object.freeze([
    'business-builder-pack',
    'infinity-builder-pack',
    'legacy-builder-pack',
  ]),
  'business-builder-pack': Object.freeze([
    'infinity-builder-pack',
    'legacy-builder-pack',
  ]),
  'infinity-builder-pack': Object.freeze([
    'legacy-builder-pack',
  ]),
  'legacy-builder-pack': Object.freeze([]),
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
const accountOverviewActiveWindowLabelElement = resolveAccountOverviewTileLabelElement(accountOverviewActiveWindowValueElement);
const accountOverviewTotalBvLabelElement = resolveAccountOverviewTileLabelElement(accountOverviewTotalBvValueElement);
const accountOverviewPersonalBvLabelElement = resolveAccountOverviewTileLabelElement(accountOverviewPersonalBvValueElement);
const accountOverviewDirectSponsorsLabelElement = resolveAccountOverviewTileLabelElement(accountOverviewDirectSponsorsValueElement);
const accountOverviewEwalletLabelElement = resolveAccountOverviewTileLabelElement(accountOverviewEwalletValueElement);
const ACCOUNT_OVERVIEW_DEFAULT_LABELS = Object.freeze({
  activeWindow: safeText(accountOverviewActiveWindowLabelElement?.textContent || 'Account Active Until') || 'Account Active Until',
  totalBv: safeText(accountOverviewTotalBvLabelElement?.textContent || 'Total Organization BV') || 'Total Organization BV',
  personalBv: safeText(accountOverviewPersonalBvLabelElement?.textContent || 'Personal BV') || 'Personal BV',
  cycle: safeText(accountOverviewCycleLabelElement?.textContent || 'Weekly Cycle Cap') || 'Weekly Cycle Cap',
  directSponsors: safeText(accountOverviewDirectSponsorsLabelElement?.textContent || 'Direct Sponsors') || 'Direct Sponsors',
  eWallet: safeText(accountOverviewEwalletLabelElement?.textContent || 'E-Wallet') || 'E-Wallet',
});
const accountOverviewCommissionButtons = Array.from(document.querySelectorAll('[data-account-overview-commission]'));
const infinityBuilderPanelElement = document.getElementById('tree-next-infinity-builder-panel');
const infinityBuilderCloseButtonElement = document.getElementById('tree-next-infinity-builder-close');
const infinityBuilderBackButtonElement = document.getElementById('tree-next-infinity-builder-back');
const infinityBuilderBreadcrumbCurrentElement = document.getElementById('tree-next-infinity-builder-breadcrumb-current');
const infinityBuilderTitleElement = document.getElementById('tree-next-infinity-builder-title');
const infinityBuilderCopyElement = document.getElementById('tree-next-infinity-builder-copy');
const infinityBuilderTierTitleElement = document.getElementById('tree-next-infinity-builder-tier-title');
const infinityBuilderTierSubtitleElement = document.getElementById('tree-next-infinity-builder-tier-subtitle');
const infinityBuilderTierGridElement = document.getElementById('tree-next-infinity-builder-tier-grid');
const infinityBuilderTierBonusElement = document.getElementById('tree-next-infinity-builder-tier-bonus');
const infinityBuilderClaimButtonElement = document.getElementById('tree-next-infinity-builder-claim');
const infinityBuilderViewTreeButtonElement = document.getElementById('tree-next-infinity-builder-view-tree');
const infinityBuilderClaimFeedbackElement = document.getElementById('tree-next-infinity-builder-claim-feedback');
const infinityBuilderCurrentSortElement = document.getElementById('tree-next-infinity-builder-current-sort');
const infinityBuilderCurrentListElement = document.getElementById('tree-next-infinity-builder-current-list');
const infinityBuilderCurrentEmptyElement = document.getElementById('tree-next-infinity-builder-current-empty');
const rankAdvancementPanelElement = document.getElementById('tree-next-rank-advancement-panel');
const rankAdvancementCloseButtonElement = document.getElementById('tree-next-rank-advancement-close');
const rankAdvancementTargetPrefixElement = document.getElementById('tree-next-rank-advancement-target-prefix');
const rankAdvancementTargetRankElement = document.getElementById('tree-next-rank-advancement-target-rank');
const rankAdvancementAcquiredSinceElement = document.getElementById('tree-next-rank-advancement-acquired-since');
const rankAdvancementRewardPreviewElement = document.getElementById('tree-next-rank-advancement-reward-preview');
const rankAdvancementGoodLifePreviewElement = document.getElementById('tree-next-rank-advancement-good-life-preview');
const rankAdvancementPersonalRequirementElement = document.getElementById('tree-next-rank-advancement-personal-requirement');
const rankAdvancementDirectRequirementElement = document.getElementById('tree-next-rank-advancement-direct-requirement');
const rankAdvancementCyclesRequirementElement = document.getElementById('tree-next-rank-advancement-cycles-requirement');
const rankAdvancementMembersRequirementElement = document.getElementById('tree-next-rank-advancement-members-requirement');
const rankAdvancementMilestonesElement = document.getElementById('tree-next-rank-advancement-milestones');
const rankAdvancementProgressFillElement = document.getElementById('tree-next-rank-advancement-progress-fill');
const rankAdvancementRewardIconElement = document.getElementById('tree-next-rank-advancement-reward-icon');
const rankAdvancementRewardRankElement = document.getElementById('tree-next-rank-advancement-reward-rank');
const rankAdvancementRewardAmountElement = document.getElementById('tree-next-rank-advancement-reward-amount');
const rankAdvancementGoodLifeCopyElement = document.getElementById('tree-next-rank-advancement-good-life-copy');
const rankAdvancementGoodLifeRankElement = document.getElementById('tree-next-rank-advancement-good-life-rank');
const rankAdvancementGoodLifeAmountElement = document.getElementById('tree-next-rank-advancement-good-life-amount');
const rankAdvancementAnalysisTotalBvElement = document.getElementById('tree-next-rank-advancement-analysis-total-bv');
const rankAdvancementAnalysisPersonalBvElement = document.getElementById('tree-next-rank-advancement-analysis-personal-bv');
const rankAdvancementAnalysisCyclesElement = document.getElementById('tree-next-rank-advancement-analysis-cycles');
const rankAdvancementClaimButtonElement = document.getElementById('tree-next-rank-advancement-claim');
const rankAdvancementClaimTimerElement = document.getElementById('tree-next-rank-advancement-claim-timer');
const rankAdvancementFeedbackElement = document.getElementById('tree-next-rank-advancement-feedback');
const preferredAccountsPanelElement = document.getElementById('tree-next-preferred-accounts-panel');
const preferredAccountsCloseButtonElement = document.getElementById('tree-next-preferred-accounts-close');
const preferredAccountsAvatarElement = document.getElementById('tree-next-preferred-accounts-avatar');
const preferredAccountsAvatarInitialsElement = document.getElementById('tree-next-preferred-accounts-initials');
const preferredAccountsNameElement = document.getElementById('tree-next-preferred-accounts-name');
const preferredAccountsTotalSpendElement = document.getElementById('tree-next-preferred-accounts-total-spend');
const preferredAccountsTotalBvElement = document.getElementById('tree-next-preferred-accounts-total-bv');
const preferredAccountsSinceElement = document.getElementById('tree-next-preferred-accounts-since');
const preferredAccountsOriginElement = document.getElementById('tree-next-preferred-accounts-origin');
const preferredAccountsPlacementPlanInput = document.getElementById('tree-next-preferred-accounts-placement-plan');
const preferredAccountsSaveButtonElement = document.getElementById('tree-next-preferred-accounts-save');
const preferredAccountsFeedbackElement = document.getElementById('tree-next-preferred-accounts-feedback');
const preferredAccountsEmptyElement = document.getElementById('tree-next-preferred-accounts-empty');
const preferredAccountsListElement = document.getElementById('tree-next-preferred-accounts-list');
const myStorePanelElement = document.getElementById('tree-next-my-store-panel');
const myStoreScrollElement = myStorePanelElement?.querySelector('.tree-next-my-store-scroll') || null;
const myStoreHeaderElement = myStorePanelElement?.querySelector('.tree-next-my-store-header') || null;
const myStoreCatalogViewElement = myStorePanelElement?.querySelector('[data-my-store-view="catalog"]') || null;
const myStoreReviewViewElement = myStorePanelElement?.querySelector('[data-my-store-view="review"]') || null;
const myStoreCheckoutViewElement = myStorePanelElement?.querySelector('[data-my-store-view="checkout"]') || null;
const myStoreThankYouViewElement = myStorePanelElement?.querySelector('[data-my-store-view="thank-you"]') || null;
const myStoreShareViewElement = myStorePanelElement?.querySelector('[data-my-store-share-block]') || null;
const myStoreBreadcrumbsElement = document.getElementById('tree-next-my-store-breadcrumbs');
const myStoreCloseButtonElement = document.getElementById('tree-next-my-store-close');
const myStoreFeaturedImageElement = document.getElementById('tree-next-my-store-featured-image');
const myStoreFeaturedLabelElement = document.getElementById('tree-next-my-store-featured-label');
const myStoreUpgradesSectionElement = document.getElementById('tree-next-my-store-upgrades-section');
const myStoreUpgradesGridElement = document.getElementById('tree-next-my-store-upgrades-grid');
const myStoreReviewImageElement = document.getElementById('tree-next-my-store-review-image');
const myStoreReviewTitleElement = document.getElementById('tree-next-my-store-review-title');
const myStoreReviewNameElement = document.getElementById('tree-next-my-store-review-name');
const myStoreReviewQuantityControlElement = document.getElementById('tree-next-my-store-review-quantity-control');
const myStoreReviewQuantityDecreaseButtonElement = document.getElementById('tree-next-my-store-review-qty-decrease');
const myStoreReviewQuantityIncreaseButtonElement = document.getElementById('tree-next-my-store-review-qty-increase');
const myStoreReviewQuantityElement = document.getElementById('tree-next-my-store-review-quantity');
const myStoreReviewUpgradeProductSelectorElement = document.getElementById('tree-next-my-store-upgrade-product-selector');
const myStoreReviewUpgradeProductButtons = Array.from(
  myStorePanelElement?.querySelectorAll('[data-my-store-upgrade-product-key]') || [],
);
const myStoreReviewPriceElement = document.getElementById('tree-next-my-store-review-price');
const myStoreReviewBvElement = document.getElementById('tree-next-my-store-review-bv');
const myStoreReviewRemoveButtonElement = document.getElementById('tree-next-my-store-review-remove');
const myStoreReviewCheckoutButtonElement = document.getElementById('tree-next-my-store-review-checkout');
const myStoreCheckoutFormElement = document.getElementById('tree-next-my-store-checkout-form');
const myStoreCheckoutProductLabelElement = document.getElementById('tree-next-my-store-checkout-product-label');
const myStoreCheckoutSubtotalElement = document.getElementById('tree-next-my-store-checkout-subtotal');
const myStoreCheckoutDiscountElement = document.getElementById('tree-next-my-store-checkout-discount');
const myStoreCheckoutTaxElement = document.getElementById('tree-next-my-store-checkout-tax');
const myStoreCheckoutTotalElement = document.getElementById('tree-next-my-store-checkout-total');
const myStoreCheckoutNameInputElement = document.getElementById('tree-next-my-store-checkout-name');
const myStoreCardNumberElement = document.getElementById('tree-next-my-store-card-number-element');
const myStoreCardExpiryElement = document.getElementById('tree-next-my-store-card-expiry-element');
const myStoreCardCvcElement = document.getElementById('tree-next-my-store-card-cvc-element');
const myStoreCheckoutBillingAddressInputElement = document.getElementById('tree-next-my-store-checkout-billing-address');
const myStoreCheckoutBillingCityInputElement = document.getElementById('tree-next-my-store-checkout-billing-city');
const myStoreCheckoutBillingStateInputElement = document.getElementById('tree-next-my-store-checkout-billing-state');
const myStoreCheckoutBillingPostalInputElement = document.getElementById('tree-next-my-store-checkout-billing-postal');
const myStoreCheckoutBillingCountrySelect = document.getElementById('tree-next-my-store-checkout-billing-country');
const myStoreCheckoutCardErrorElement = document.getElementById('tree-next-my-store-card-error');
const myStoreCheckoutPreviousButtonElement = document.getElementById('tree-next-my-store-checkout-previous');
const myStoreCheckoutPayButtonElement = document.getElementById('tree-next-my-store-checkout-pay');
const myStoreCheckoutFeedbackElement = document.getElementById('tree-next-my-store-checkout-feedback');
const myStoreThankYouMessageElement = document.getElementById('tree-next-my-store-thank-you-message');
const myStoreThankYouInvoiceElement = document.getElementById('tree-next-my-store-thank-you-invoice');
const myStoreThankYouStatusElement = document.getElementById('tree-next-my-store-thank-you-status');
const myStoreThankYouAmountElement = document.getElementById('tree-next-my-store-thank-you-amount');
const myStoreThankYouBvElement = document.getElementById('tree-next-my-store-thank-you-bv');
const myStoreThankYouDateElement = document.getElementById('tree-next-my-store-thank-you-date');
const myStoreThankYouDoneButtonElement = document.getElementById('tree-next-my-store-thank-you-done');
const myStoreCopyLinkButtonElement = document.getElementById('tree-next-my-store-copy-link');
const myStoreCopyFeedbackElement = document.getElementById('tree-next-my-store-copy-feedback');
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
let myStoreStripeClient = null;
let myStoreStripeElements = null;
let myStoreStripeCardNumber = null;
let myStoreStripeCardExpiry = null;
let myStoreStripeCardCvc = null;
let myStoreStripeInitPromise = null;
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
let sideNavMemberStatusCachedSignature = '';
let sideNavMemberStatusCachedSnapshot = null;
let rankAdvancementLastRenderSignature = '';
let rankAdvancementSnapshot = null;
let rankAdvancementDataVersion = 0;
let rankAdvancementSyncPromise = null;
let rankAdvancementSyncInFlight = false;
let rankAdvancementLastRequestAtMs = 0;
let rankAdvancementLastSyncedAtMs = 0;
let rankAdvancementIdentityKey = '';
let rankAdvancementLoading = false;
let rankAdvancementClaimInFlight = false;
let rankAdvancementCachedAchievementsPayload = null;
let rankAdvancementCachedGoodLifePayload = null;
let rankAdvancementFeedbackTimerId = 0;
let rankAdvancementClaimTimerIntervalId = 0;
let rankAdvancementSelectedMilestoneId = '';
let infinityBuilderPanelMode = INFINITY_BUILDER_PANEL_MODE_INFINITY;
let infinityBuilderLastRenderSignature = '';
let infinityBuilderSelectedTierNumber = 1;
let infinityBuilderClaimInFlight = false;
let infinityBuilderClaimFeedbackTimerId = 0;
let infinityBuilderClaimFeedbackTierNumber = 0;
let infinityBuilderLastPanelSnapshot = null;
let infinityBuilderTierSortDirectionInfinity = 'asc';
let infinityBuilderTierSortDirectionLegacyLeadership = 'asc';
let infinityBuilderTierSortDirectionsUpdatedAt = '';
let infinityBuilderTierSortDirectionsSyncInFlight = false;
let infinityBuilderTierSortDirectionsSyncQueued = false;
let infinityBuilderTierSortDirectionsLastSyncedKey = '';
let infinityBuilderTierSortDirectionsLocalDirty = false;
let legacyTierCanvasOpenTimerId = 0;
let legacyTierCanvasOpenToken = '';
let legacyTierCanvasTierSwitchTimerId = 0;
let legacyTierCanvasTierSwitchToken = '';
const legacyTierCanvasViewState = {
  active: false,
  tierNumber: 0,
  signature: '',
  model: null,
  anchorView: null,
  tierEntries: [],
  dropdownOpen: false,
  tierSwitchInFlight: false,
};
let preferredAccountsLastRenderSignature = '';
let preferredAccountsRows = [];
let preferredAccountsRowsDataSignature = '';
let preferredAccountsSelectedMemberId = '';
let preferredAccountsInvoices = [];
let preferredAccountsDataVersion = 0;
let preferredAccountsSyncPromise = null;
let preferredAccountsSyncInFlight = false;
let preferredAccountsLastRequestAtMs = 0;
let preferredAccountsLastSyncedAtMs = 0;
let preferredAccountsFeedbackTimerId = 0;
let preferredAccountsRenderErrorLoggedAtMs = 0;
let renderLoopErrorLoggedAtMs = 0;
let myStoreLastRenderSignature = '';
let isTreeNextEnrollStripeReady = false;
let isTreeNextEnrollStripeCardComplete = false;
let isTreeNextEnrollStripeCardExpiryComplete = false;
let isTreeNextEnrollStripeCardCvcComplete = false;
let isMyStoreStripeReady = false;
let isMyStoreStripeCardComplete = false;
let isMyStoreStripeCardExpiryComplete = false;
let isMyStoreStripeCardCvcComplete = false;

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
const treeNextStripeReturnSignalHandledKeys = new Set();
const myStoreCheckoutFinalizationInFlightSessionIds = new Set();
const enrollCheckoutFinalizationInFlightSessionIds = new Set();
const myStoreCheckoutRetryAttemptBySession = new Map();
const myStoreCheckoutRetryTimeoutBySession = new Map();
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
    infinityBuilderVisible: false,
    rankAdvancementVisible: false,
    preferredAccountsVisible: false,
    preferredAccountsSaving: false,
    myStoreVisible: false,
    myStoreStep: MY_STORE_STEP_CATALOG,
    myStoreSelection: null,
    myStoreCheckoutCompletion: null,
    myStoreCheckoutSubmitting: false,
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
    infinityBuilderTierSortDirection: 'asc',
    legacyLeadershipTierSortDirection: 'asc',
    tierSortDirectionsUpdatedAt: '',
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
  const nodeUsernameKey = normalizeCredentialValue(
    safeText(safeNode?.username || safeNode?.memberCode || ''),
  );
  if (
    nodeIdKey === normalizeCredentialValue(LIVE_TREE_GLOBAL_ROOT_ID)
    || nodeIdKey === 'company-root'
    || nodeIdKey === normalizeCredentialValue(ADMIN_ROOT_USERNAME)
    || nodeUsernameKey === normalizeCredentialValue(ADMIN_ROOT_USERNAME)
    || (state.source === 'admin' && nodeIdKey === 'root')
  ) {
    return true;
  }
  if (
    rawStatus.includes('inactive')
    || rawStatus.includes('dormant')
    || rawStatus.includes('stabilizing')
    || rawStatus.includes('review')
    || rawStatus.includes('suspend')
    || rawStatus.includes('disable')
    || rawStatus.includes('expired')
  ) {
    return false;
  }
  if (typeof safeNode?.isActive === 'boolean') {
    return safeNode.isActive;
  }
  if (typeof safeNode?.active === 'boolean') {
    return safeNode.active;
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
  const parentUsername = safeText(
    parentNode.username
    || parentNode.memberCode
    || parentNode.id
    || safeParentId,
  ).replace(/^@+/, '');

  window.dispatchEvent(new CustomEvent('binary-tree-enroll-member-request', {
    detail: {
      parentId: safeParentId,
      parentName,
      parentMemberCode,
      parentUsername,
      placementLeg,
    },
  }));
}

function resolveEnrollRegisteredMembersApi() {
  return state.source === 'admin'
    ? ADMIN_REGISTERED_MEMBERS_API
    : MEMBER_REGISTERED_MEMBERS_API;
}

function resolveEnrollRegisteredMembersSessionApi() {
  return state.source === 'admin'
    ? ADMIN_REGISTERED_MEMBERS_SESSION_API
    : MEMBER_REGISTERED_MEMBERS_SESSION_API;
}

function resolveEnrollRegisteredMembersSessionCompleteApi() {
  return state.source === 'admin'
    ? ADMIN_REGISTERED_MEMBERS_SESSION_COMPLETE_API
    : MEMBER_REGISTERED_MEMBERS_SESSION_COMPLETE_API;
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

function resolveTreeNextBillingCountrySelectElements() {
  const countrySelectElements = [];
  if (treeNextEnrollBillingCountrySelect instanceof HTMLSelectElement) {
    countrySelectElements.push(treeNextEnrollBillingCountrySelect);
  }
  if (
    myStoreCheckoutBillingCountrySelect instanceof HTMLSelectElement
    && !countrySelectElements.some((element) => element === myStoreCheckoutBillingCountrySelect)
  ) {
    countrySelectElements.push(myStoreCheckoutBillingCountrySelect);
  }
  return countrySelectElements;
}

function applyTreeNextEnrollBillingCountryOptions(countryOptions = [], options = {}) {
  const countrySelectElements = resolveTreeNextBillingCountrySelectElements();
  if (!countrySelectElements.length) {
    return;
  }
  const {
    preserveSelection = true,
  } = options;
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

  for (const nativeSelect of countrySelectElements) {
    const previousValue = safeText(nativeSelect.value).trim().toUpperCase();
    const desiredValue = preserveSelection && previousValue
      ? previousValue
      : ENROLL_DEFAULT_BILLING_COUNTRY_CODE;
    nativeSelect.innerHTML = '';
    for (const optionData of normalizedOptions) {
      const optionElement = document.createElement('option');
      optionElement.value = optionData.code;
      optionElement.textContent = optionData.label;
      nativeSelect.appendChild(optionElement);
    }
    if (!nativeSelect.value) {
      nativeSelect.value = ENROLL_DEFAULT_BILLING_COUNTRY_CODE;
    }
    const hasDesiredValue = Array.from(nativeSelect.options).some(
      (option) => safeText(option?.value).trim().toUpperCase() === desiredValue,
    );
    nativeSelect.value = hasDesiredValue
      ? desiredValue
      : ENROLL_DEFAULT_BILLING_COUNTRY_CODE;
    if (!nativeSelect.value && nativeSelect.options.length > 0) {
      nativeSelect.value = safeText(nativeSelect.options[0]?.value);
    }

    const entry = treeNextEnrollCustomSelectByNativeId.get(nativeSelect.id);
    if (entry) {
      buildTreeNextEnrollCustomSelectMenu(entry);
    }
    syncTreeNextEnrollCustomSelectById(nativeSelect.id);
  }
}

async function hydrateTreeNextEnrollBillingCountryOptions() {
  const countrySelectElements = resolveTreeNextBillingCountrySelectElements();
  if (!countrySelectElements.length) {
    return;
  }
  const areAllHydrated = countrySelectElements.every((nativeSelect) => nativeSelect.dataset.countriesHydrated === 'true');
  if (areAllHydrated) {
    for (const nativeSelect of countrySelectElements) {
      syncTreeNextEnrollCustomSelectById(nativeSelect.id);
    }
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
      for (const nativeSelect of resolveTreeNextBillingCountrySelectElements()) {
        nativeSelect.dataset.countriesHydrated = 'true';
      }
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

function setMyStoreCheckoutCardError(message = '') {
  if (!(myStoreCheckoutCardErrorElement instanceof HTMLElement)) {
    return;
  }
  myStoreCheckoutCardErrorElement.textContent = safeText(message);
}

function clearMyStoreCheckoutCardError() {
  setMyStoreCheckoutCardError('');
}

function clearMyStoreStripeCardInput() {
  isMyStoreStripeCardComplete = false;
  isMyStoreStripeCardExpiryComplete = false;
  isMyStoreStripeCardCvcComplete = false;
  clearMyStoreCheckoutCardError();
  if (myStoreStripeCardNumber && typeof myStoreStripeCardNumber.clear === 'function') {
    try {
      myStoreStripeCardNumber.clear();
    } catch {
      // no-op
    }
  }
  if (myStoreStripeCardExpiry && typeof myStoreStripeCardExpiry.clear === 'function') {
    try {
      myStoreStripeCardExpiry.clear();
    } catch {
      // no-op
    }
  }
  if (myStoreStripeCardCvc && typeof myStoreStripeCardCvc.clear === 'function') {
    try {
      myStoreStripeCardCvc.clear();
    } catch {
      // no-op
    }
  }
}

async function initializeMyStoreStripeCard(options = {}) {
  if (
    isMyStoreStripeReady
    && myStoreStripeCardNumber
    && myStoreStripeCardExpiry
    && myStoreStripeCardCvc
  ) {
    return true;
  }
  if (
    !(myStoreCardNumberElement instanceof HTMLElement)
    || !(myStoreCardExpiryElement instanceof HTMLElement)
    || !(myStoreCardCvcElement instanceof HTMLElement)
  ) {
    setMyStoreCheckoutCardError('Card payment fields are unavailable.');
    return false;
  }
  if (myStoreStripeInitPromise) {
    return myStoreStripeInitPromise;
  }

  myStoreStripeInitPromise = (async () => {
    const stripeLoaded = await ensureTreeNextEnrollStripeScriptLoaded();
    if (!stripeLoaded || typeof window.Stripe !== 'function') {
      setMyStoreCheckoutCardError('Stripe checkout could not be loaded. Please refresh and try again.');
      return false;
    }

    const configResult = await fetchTreeNextEnrollStripeCheckoutConfig();
    if (!configResult.ok) {
      setMyStoreCheckoutCardError(configResult.message || 'Unable to initialize Stripe checkout.');
      return false;
    }

    try {
      myStoreStripeClient = window.Stripe(configResult.publishableKey);
      if (!myStoreStripeClient) {
        throw new Error('Stripe client could not be initialized.');
      }

      myStoreStripeElements = myStoreStripeClient.elements();
      myStoreStripeCardNumber = myStoreStripeElements.create('cardNumber', {
        style: resolveTreeNextEnrollStripeCardStyle(),
        placeholder: 'Card number',
        showIcon: true,
        iconStyle: 'solid',
        disableLink: false,
      });
      myStoreStripeCardExpiry = myStoreStripeElements.create('cardExpiry', {
        style: resolveTreeNextEnrollStripeCardStyle(),
        placeholder: 'MM / YY',
      });
      myStoreStripeCardCvc = myStoreStripeElements.create('cardCvc', {
        style: resolveTreeNextEnrollStripeCardStyle(),
        placeholder: 'CVC',
      });
      myStoreStripeCardNumber.mount(myStoreCardNumberElement);
      myStoreStripeCardExpiry.mount(myStoreCardExpiryElement);
      myStoreStripeCardCvc.mount(myStoreCardCvcElement);
      myStoreStripeCardNumber.on('change', (event) => {
        isMyStoreStripeCardComplete = event?.complete === true;
        setMyStoreCheckoutCardError(event?.error?.message || '');
      });
      myStoreStripeCardExpiry.on('change', (event) => {
        isMyStoreStripeCardExpiryComplete = event?.complete === true;
        setMyStoreCheckoutCardError(event?.error?.message || '');
      });
      myStoreStripeCardCvc.on('change', (event) => {
        isMyStoreStripeCardCvcComplete = event?.complete === true;
        setMyStoreCheckoutCardError(event?.error?.message || '');
      });

      isMyStoreStripeReady = true;
      isMyStoreStripeCardComplete = false;
      isMyStoreStripeCardExpiryComplete = false;
      isMyStoreStripeCardCvcComplete = false;
      if (options.silent !== true) {
        clearMyStoreCheckoutCardError();
      }
      return true;
    } catch (error) {
      setMyStoreCheckoutCardError(error instanceof Error ? error.message : 'Unable to initialize Stripe card fields.');
      return false;
    }
  })();

  try {
    return await myStoreStripeInitPromise;
  } finally {
    myStoreStripeInitPromise = null;
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

function resolveAccountOverviewTileLabelElement(valueElement) {
  if (!(valueElement instanceof HTMLElement)) {
    return null;
  }
  const tileElement = valueElement.closest('.tree-next-account-overview-tile');
  if (!(tileElement instanceof HTMLElement)) {
    return null;
  }
  const labelElement = tileElement.querySelector('.tree-next-account-overview-tile-label');
  return labelElement instanceof HTMLElement ? labelElement : null;
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

function normalizeAccountOverviewScopeKey(scopeInput = 'identity') {
  return normalizeCredentialValue(scopeInput) === 'system' ? 'system' : 'identity';
}

function isAccountOverviewSystemTotalsNodeSelection(nodeInput = null) {
  const node = nodeInput && typeof nodeInput === 'object' ? nodeInput : null;
  if (!node) {
    return true;
  }
  const nodeIdKey = normalizeCredentialValue(safeText(node.id));
  const usernameKey = normalizeCredentialValue(
    safeText(node.username || node.memberCode || ''),
  );
  return (
    !nodeIdKey
    || nodeIdKey === 'root'
    || nodeIdKey === normalizeCredentialValue(LIVE_TREE_GLOBAL_ROOT_ID)
    || nodeIdKey === normalizeCredentialValue(ADMIN_ROOT_USERNAME)
    || usernameKey === normalizeCredentialValue(ADMIN_ROOT_USERNAME)
  );
}

function resolveAccountOverviewPanelContext() {
  const preferredHomeNodeId = resolvePreferredGlobalHomeNodeId();
  const preferredHomeNode = resolveNodeById(preferredHomeNodeId) || resolveNodeById('root') || null;
  if (state.source !== 'admin') {
    return {
      homeNode: preferredHomeNode,
      selectedNode: null,
      systemTotals: false,
      scope: 'identity',
      preferHomeNodeIdentity: false,
    };
  }

  const selectedNodeId = safeText(state.selectedId);
  const selectedNode = resolveNodeById(selectedNodeId);
  if (isAccountOverviewSystemTotalsNodeSelection(selectedNode)) {
    return {
      homeNode: preferredHomeNode,
      selectedNode,
      systemTotals: true,
      scope: 'system',
      preferHomeNodeIdentity: false,
    };
  }

  return {
    homeNode: selectedNode,
    selectedNode,
    systemTotals: false,
    scope: 'identity',
    preferHomeNodeIdentity: true,
  };
}

function resolveAccountOverviewIdentityPayload(homeNode = null, options = {}) {
  const session = state.session && typeof state.session === 'object' ? state.session : null;
  const {
    preferHomeNode = false,
    allowAnonymous = false,
  } = options;
  if (allowAnonymous) {
    return {
      userId: '',
      username: '',
      email: '',
    };
  }

  const orderedUserIdCandidates = preferHomeNode
    ? [
      homeNode?.userId,
      homeNode?.memberUserId,
      homeNode?.sourceUserId,
      homeNode?.id,
      session?.id,
      session?.userId,
      session?.user_id,
      session?.memberId,
      session?.member_id,
    ]
    : [
      session?.id,
      session?.userId,
      session?.user_id,
      session?.memberId,
      session?.member_id,
      homeNode?.userId,
      homeNode?.memberUserId,
      homeNode?.sourceUserId,
      homeNode?.id,
    ];
  const orderedUsernameCandidates = preferHomeNode
    ? [
      homeNode?.username,
      homeNode?.memberUsername,
      homeNode?.member_username,
      homeNode?.memberCode,
      session?.username,
      session?.memberUsername,
      session?.member_username,
      session?.userName,
      session?.user_name,
    ]
    : [
      session?.username,
      session?.memberUsername,
      session?.member_username,
      session?.userName,
      session?.user_name,
      homeNode?.username,
      homeNode?.memberUsername,
      homeNode?.member_username,
      homeNode?.memberCode,
    ];
  const orderedEmailCandidates = preferHomeNode
    ? [
      homeNode?.email,
      homeNode?.memberEmail,
      homeNode?.member_email,
      session?.email,
      session?.userEmail,
      session?.user_email,
      session?.login,
    ]
    : [
      session?.email,
      session?.userEmail,
      session?.user_email,
      session?.login,
      homeNode?.email,
      homeNode?.memberEmail,
      homeNode?.member_email,
    ];

  let userId = '';
  for (const candidate of orderedUserIdCandidates) {
    userId = safeText(candidate);
    if (userId) {
      break;
    }
  }

  let username = '';
  for (const candidate of orderedUsernameCandidates) {
    username = safeText(candidate).replace(/^@+/, '');
    if (username) {
      break;
    }
  }

  let email = '';
  for (const candidate of orderedEmailCandidates) {
    email = safeText(candidate);
    if (email) {
      break;
    }
  }

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

function resolveAccountOverviewBinaryTreeMetricsRecord(payload = null) {
  if (payload?.snapshot && typeof payload.snapshot === 'object') {
    return payload.snapshot;
  }
  const list = Array.isArray(payload?.snapshots) ? payload.snapshots : [];
  return list.find((entry) => entry && typeof entry === 'object') || null;
}

function summarizeAccountOverviewBinaryTreeMetrics(payload = null) {
  const list = Array.isArray(payload?.snapshots) ? payload.snapshots : [];
  if (!list.length) {
    return null;
  }

  const summary = {
    id: 'system-binary-tree-summary',
    totalAccumulatedBv: 0,
    accountPersonalPv: 0,
    totalCycles: 0,
    leftLegBv: 0,
    rightLegBv: 0,
    accountRank: ADMIN_ROOT_DISPLAY_NAME,
    updatedAt: '',
  };

  for (const entry of list) {
    if (!entry || typeof entry !== 'object') {
      continue;
    }
    summary.totalAccumulatedBv += Math.max(0, safeNumber(entry.totalAccumulatedBv, 0));
    summary.accountPersonalPv += Math.max(0, safeNumber(entry.accountPersonalPv, 0));
    summary.totalCycles += Math.max(0, safeNumber(entry.totalCycles, 0));
    summary.leftLegBv += Math.max(0, safeNumber(entry.leftLegBv, 0));
    summary.rightLegBv += Math.max(0, safeNumber(entry.rightLegBv, 0));
  }

  summary.totalAccumulatedBv = Math.floor(summary.totalAccumulatedBv);
  summary.accountPersonalPv = Math.floor(summary.accountPersonalPv);
  summary.totalCycles = Math.floor(summary.totalCycles);
  summary.leftLegBv = Math.floor(summary.leftLegBv);
  summary.rightLegBv = Math.floor(summary.rightLegBv);
  return summary;
}

function resolveAccountOverviewSalesTeamCommissionRecord(payload = null) {
  if (payload?.commission && typeof payload.commission === 'object') {
    return payload.commission;
  }
  const list = Array.isArray(payload?.commissions) ? payload.commissions : [];
  return list.find((entry) => entry && typeof entry === 'object') || null;
}

function summarizeAccountOverviewSalesTeamCommissions(payload = null) {
  const list = Array.isArray(payload?.commissions) ? payload.commissions : [];
  if (!list.length) {
    return null;
  }

  const summary = {
    id: 'system-sales-team-summary',
    accountPackageKey: ENROLL_DEFAULT_PACKAGE_KEY,
    cycleMultiplier: 0,
    perCycleAmount: 0,
    weeklyCapCycles: 0,
    totalCycles: 0,
    cappedCycles: 0,
    overflowCycles: 0,
    grossCommissionAmount: 0,
    payoutOffsetAmount: 0,
    netCommissionAmount: 0,
    currencyCode: 'USD',
  };

  for (const entry of list) {
    if (!entry || typeof entry !== 'object') {
      continue;
    }
    summary.weeklyCapCycles += Math.max(0, safeNumber(entry.weeklyCapCycles, 0));
    summary.totalCycles += Math.max(0, safeNumber(entry.totalCycles, 0));
    summary.cappedCycles += Math.max(0, safeNumber(entry.cappedCycles, 0));
    summary.overflowCycles += Math.max(0, safeNumber(entry.overflowCycles, 0));
    summary.grossCommissionAmount += Math.max(0, safeNumber(entry.grossCommissionAmount, 0));
    summary.payoutOffsetAmount += Math.max(0, safeNumber(entry.payoutOffsetAmount, 0));
    summary.netCommissionAmount += Math.max(0, safeNumber(entry.netCommissionAmount, 0));
  }

  summary.weeklyCapCycles = Math.floor(summary.weeklyCapCycles);
  summary.totalCycles = Math.floor(summary.totalCycles);
  summary.cappedCycles = Math.floor(summary.cappedCycles);
  summary.overflowCycles = Math.floor(summary.overflowCycles);
  summary.grossCommissionAmount = Math.round(summary.grossCommissionAmount * 100) / 100;
  summary.payoutOffsetAmount = Math.round(summary.payoutOffsetAmount * 100) / 100;
  summary.netCommissionAmount = Math.round(summary.netCommissionAmount * 100) / 100;
  return summary;
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
    scope = 'identity',
    preferHomeNodeIdentity = false,
  } = options;

  if (accountOverviewRemoteSyncInFlight && accountOverviewRemoteSyncPromise) {
    return accountOverviewRemoteSyncPromise;
  }

  const normalizedScope = normalizeAccountOverviewScopeKey(scope);
  const allowAnonymous = normalizedScope === 'system';
  const identityPayload = resolveAccountOverviewIdentityPayload(homeNode, {
    preferHomeNode: preferHomeNodeIdentity,
    allowAnonymous,
  });
  const identityKey = `${normalizedScope}::${resolveAccountOverviewIdentityKey(identityPayload)}`;
  const hasIdentity = Boolean(
    safeText(identityPayload.userId)
    || safeText(identityPayload.username)
    || safeText(identityPayload.email),
  );
  if (!allowAnonymous && !hasIdentity) {
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
    if (hasIdentity) {
      appendAccountOverviewIdentityQuery(identityQuery, identityPayload);
    }

    const walletQuery = new URLSearchParams(identityQuery.toString());
    walletQuery.set('limit', '25');
    const seedBalance = resolveAccountOverviewSeedWalletBalance(homeNode);
    if (!allowAnonymous && seedBalance > 0) {
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
      allowAnonymous
        ? Promise.resolve(null)
        : fetchAccountOverviewEndpoint(ACCOUNT_OVERVIEW_COMMISSION_CONTAINERS_API, identityQuery),
      allowAnonymous
        ? Promise.resolve(null)
        : fetchAccountOverviewEndpoint(ACCOUNT_OVERVIEW_E_WALLET_API, walletQuery),
    ]);

    const binaryTreeMetrics = normalizedScope === 'system'
      ? (
        summarizeAccountOverviewBinaryTreeMetrics(binaryTreeMetricsPayload)
        || resolveAccountOverviewBinaryTreeMetricsRecord(binaryTreeMetricsPayload)
      )
      : resolveAccountOverviewBinaryTreeMetricsRecord(binaryTreeMetricsPayload);
    const salesTeamCommission = normalizedScope === 'system'
      ? (
        summarizeAccountOverviewSalesTeamCommissions(salesTeamCommissionsPayload)
        || resolveAccountOverviewSalesTeamCommissionRecord(salesTeamCommissionsPayload)
      )
      : resolveAccountOverviewSalesTeamCommissionRecord(salesTeamCommissionsPayload);
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

    const retailProfitBalance = normalizedScope === 'system'
      ? 0
      : resolveAccountOverviewRetailProfitFallback(homeNode);
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
      scope: normalizedScope,
      identity: identityPayload,
      updatedAtMs: Date.now(),
    };

    accountOverviewRemoteSnapshot = nextSnapshot;
    accountOverviewRemoteDataVersion += 1;
    if (
      binaryTreeMetrics
      || salesTeamCommission
      || commissionContainerSnapshot
      || eWalletSnapshot
      || normalizedScope === 'system'
    ) {
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

function maybeRefreshAccountOverviewRemoteSnapshot(homeNode = null, options = {}) {
  if (!isAccountOverviewPanelAvailable()) {
    return;
  }
  const normalizedScope = normalizeAccountOverviewScopeKey(options?.scope || 'identity');
  const allowAnonymous = normalizedScope === 'system';
  const preferHomeNodeIdentity = options?.preferHomeNodeIdentity === true;
  const identityPayload = resolveAccountOverviewIdentityPayload(homeNode, {
    preferHomeNode: preferHomeNodeIdentity,
    allowAnonymous,
  });
  const hasIdentity = Boolean(
    safeText(identityPayload.userId)
    || safeText(identityPayload.username)
    || safeText(identityPayload.email),
  );
  if (!allowAnonymous && !hasIdentity) {
    return;
  }
  const identityKey = `${normalizedScope}::${resolveAccountOverviewIdentityKey(identityPayload)}`;
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
      scope: normalizedScope,
      preferHomeNodeIdentity,
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

function resolveAccountOverviewDirectSponsorCount(homeNode = null, options = {}) {
  const safeNodes = Array.isArray(state.nodes) ? state.nodes : [];
  if (!safeNodes.length) {
    return 0;
  }

  if (options?.systemTotals === true) {
    return safeNodes.reduce((count, node) => {
      const nodeId = normalizeCredentialValue(safeText(node?.id));
      if (
        !nodeId
        || nodeId === 'root'
        || nodeId === normalizeCredentialValue(LIVE_TREE_GLOBAL_ROOT_ID)
        || nodeId === normalizeCredentialValue(ADMIN_ROOT_USERNAME)
      ) {
        return count;
      }
      return count + 1;
    }, 0);
  }

  const homeNodeId = normalizeCredentialValue(
    safeText(homeNode?.id || resolvePreferredGlobalHomeNodeId()),
  );
  const homeUsernameKey = normalizeCredentialValue(
    safeText(homeNode?.username || homeNode?.memberCode || ''),
  );
  let totalDirectSponsors = 0;

  for (const node of safeNodes) {
    const nodeId = normalizeCredentialValue(safeText(node?.id));
    if (
      !nodeId
      || nodeId === 'root'
      || nodeId === normalizeCredentialValue(LIVE_TREE_GLOBAL_ROOT_ID)
      || (homeNodeId && nodeId === homeNodeId)
    ) {
      continue;
    }

    const sponsorNodeId = normalizeCredentialValue(
      safeText(node?.sponsorId || node?.globalSponsorId || node?.sourceSponsorId || ''),
    );
    if (homeNodeId && sponsorNodeId && sponsorNodeId === homeNodeId) {
      totalDirectSponsors += 1;
      continue;
    }

    const sponsorUsernameKey = normalizeCredentialValue(
      safeText(node?.sponsorUsername || node?.sponsor_username || '').replace(/^@+/, ''),
    );
    if (homeUsernameKey && sponsorUsernameKey && sponsorUsernameKey === homeUsernameKey) {
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

function resolveAccountOverviewSystemSalesRevenueTotal() {
  const safeNodes = Array.isArray(state.nodes) ? state.nodes : [];
  let totalRevenue = 0;
  for (const node of safeNodes) {
    const nodeIdKey = normalizeCredentialValue(safeText(node?.id));
    if (
      !nodeIdKey
      || nodeIdKey === 'root'
      || nodeIdKey === normalizeCredentialValue(LIVE_TREE_GLOBAL_ROOT_ID)
      || nodeIdKey === normalizeCredentialValue(ADMIN_ROOT_USERNAME)
    ) {
      continue;
    }
    const packagePrice = safeNumber(node?.packagePrice, Number.NaN);
    const fallbackBv = safeNumber(node?.packageBv, 0);
    const amount = Number.isFinite(packagePrice) && packagePrice > 0
      ? packagePrice
      : Math.max(0, fallbackBv);
    totalRevenue += amount;
  }
  return Math.max(0, Math.round(totalRevenue * 100) / 100);
}

function resolveAccountOverviewSystemFastTrackGeneratedTotal() {
  const safeNodes = Array.isArray(state.nodes) ? state.nodes : [];
  let totalFastTrack = 0;
  for (const node of safeNodes) {
    const nodeIdKey = normalizeCredentialValue(safeText(node?.id));
    if (
      !nodeIdKey
      || nodeIdKey === 'root'
      || nodeIdKey === normalizeCredentialValue(LIVE_TREE_GLOBAL_ROOT_ID)
      || nodeIdKey === normalizeCredentialValue(ADMIN_ROOT_USERNAME)
    ) {
      continue;
    }
    totalFastTrack += Math.max(0, safeNumber(
      node?.fastTrackBonusAmount ?? node?.fast_track_bonus_amount,
      0,
    ));
  }
  return Math.max(0, Math.round(totalFastTrack * 100) / 100);
}

function resolveAccountOverviewEWalletBalance(homeNode = null, options = {}) {
  if (options?.systemTotals === true) {
    return resolveAccountOverviewSystemSalesRevenueTotal();
  }
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

function resolveAccountOverviewCommissionBalances(homeNode = null, options = {}) {
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
  if (options?.systemTotals === true) {
    const generatedFastTrack = resolveAccountOverviewSystemFastTrackGeneratedTotal();
    return {
      retailProfit: resolveAccountOverviewCommissionValue(
        walletCommissionOffsets.retailprofit,
        walletCommissionOffsets.retail,
        accountOverviewRemoteSnapshot?.retailProfitBalance,
      ),
      fastTrack: resolveAccountOverviewCommissionValue(
        commissionContainerBalances.fasttrack,
        commissionContainerBalances.fastTrack,
        generatedFastTrack,
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
      ),
      legacyBuilder: resolveAccountOverviewCommissionValue(
        commissionContainerBalances.legacyleadership,
        commissionContainerBalances.legacyLeadership,
      ),
    };
  }
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
  const overviewContext = resolveAccountOverviewPanelContext();
  const homeNode = overviewContext?.homeNode || resolveNodeById('root');
  const systemTotalsMode = overviewContext?.systemTotals === true;
  maybeRefreshAccountOverviewRemoteSnapshot(homeNode, {
    scope: overviewContext?.scope,
    preferHomeNodeIdentity: overviewContext?.preferHomeNodeIdentity,
  });
  if (Boolean(state.ui?.preferredAccountsVisible)) {
    maybeRefreshPreferredAccountsSnapshot();
  }
  const displayName = systemTotalsMode
    ? ADMIN_ROOT_DISPLAY_NAME
    : (safeText(homeNode?.name || resolveSessionDisplayName()) || resolveSessionDisplayName());
  const email = systemTotalsMode
    ? ''
    : safeText(homeNode?.email || resolveSessionDisplayEmail());
  const username = systemTotalsMode
    ? ADMIN_ROOT_USERNAME
    : safeText(homeNode?.username || homeNode?.memberCode || session?.username || session?.login || '');
  const handleSeed = username.replace(/^@+/, '') || safeText(email.split('@')[0]);
  const handleText = handleSeed ? `@${handleSeed}` : '@member';
  const rankLabel = systemTotalsMode
    ? ADMIN_ROOT_DISPLAY_NAME
    : safeText(
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
  let titleLabel = systemTotalsMode ? 'System Overview' : fallbackTitleLabel;
  if (systemTotalsMode) {
    titleLabel = 'System Overview';
  } else if (state.source === 'member') {
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
  const joinedText = systemTotalsMode
    ? 'Live system totals'
    : formatAccountOverviewJoinedDate(resolveAccountOverviewJoinedAtMs(homeNode));
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
  const avatarSignature = [
    systemTotalsMode ? 'system' : 'member',
    safeText(homeNode?.id),
    safeText(homeNode?.username),
    safeText(homeNode?.avatarUrl || homeNode?.avatar_url),
    resolveSessionAvatarSignature(),
  ].join('|');
  const activeState = systemTotalsMode
    ? true
    : (homeNode ? resolveNodeActivityState(homeNode) : true);
  const activeUntilLabel = systemTotalsMode
    ? 'Exempt'
    : resolveAccountOverviewActivityUntilLabel(homeNode);
  const totalOrganizationBv = resolveAccountOverviewTotalOrganizationBv(homeNode);
  const personalBv = resolveAccountOverviewPersonalBv(homeNode);
  const cycleCapMetrics = resolveAccountOverviewCycleCapMetrics(homeNode);
  const directSponsorCount = resolveAccountOverviewDirectSponsorCount(homeNode, {
    systemTotals: systemTotalsMode,
  });
  const eWalletBalance = resolveAccountOverviewEWalletBalance(homeNode, {
    systemTotals: systemTotalsMode,
  });
  const commissionBalances = resolveAccountOverviewCommissionBalances(homeNode, {
    systemTotals: systemTotalsMode,
  });
  const totalCommissionGenerated = Math.max(0, (
    safeNumber(commissionBalances.retailProfit, 0)
    + safeNumber(commissionBalances.fastTrack, 0)
    + safeNumber(commissionBalances.salesTeam, 0)
    + safeNumber(commissionBalances.infinityBuilder, 0)
    + safeNumber(commissionBalances.legacyBuilder, 0)
  ));
  const cycleCapText = systemTotalsMode
    ? formatEnrollCurrency(resolveAccountOverviewSystemSalesRevenueTotal())
    : `${formatInteger(cycleCapMetrics.cappedCycles, 0)} / ${formatInteger(cycleCapMetrics.weeklyCapCycles, 0)}`;
  const cycleLabelText = systemTotalsMode
    ? 'Total Generated Revenue'
    : ACCOUNT_OVERVIEW_DEFAULT_LABELS.cycle;
  const activeWindowLabelText = systemTotalsMode
    ? 'Administrator Mode'
    : ACCOUNT_OVERVIEW_DEFAULT_LABELS.activeWindow;
  const totalBvLabelText = systemTotalsMode
    ? 'Total Organization BV'
    : ACCOUNT_OVERVIEW_DEFAULT_LABELS.totalBv;
  const personalBvLabelText = systemTotalsMode
    ? 'Total Personal BV'
    : ACCOUNT_OVERVIEW_DEFAULT_LABELS.personalBv;
  const directSponsorsLabelText = systemTotalsMode
    ? 'Total Members'
    : ACCOUNT_OVERVIEW_DEFAULT_LABELS.directSponsors;
  const eWalletLabelText = systemTotalsMode
    ? 'Total Commission Generated'
    : ACCOUNT_OVERVIEW_DEFAULT_LABELS.eWallet;
  const ewalletDisplayValue = systemTotalsMode
    ? formatEnrollCurrency(totalCommissionGenerated)
    : formatEnrollCurrency(eWalletBalance);
  const renderSignature = [
    systemTotalsMode ? 'system' : 'member',
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
    cycleLabelText,
    activeWindowLabelText,
    totalBvLabelText,
    personalBvLabelText,
    directSponsorsLabelText,
    eWalletLabelText,
    String(directSponsorCount),
    ewalletDisplayValue,
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
  setAccountOverviewText(accountOverviewActiveWindowLabelElement, activeWindowLabelText);
  setAccountOverviewText(accountOverviewTotalBvValueElement, formatVolumeValue(totalOrganizationBv));
  setAccountOverviewText(accountOverviewTotalBvLabelElement, totalBvLabelText);
  setAccountOverviewText(accountOverviewPersonalBvValueElement, formatVolumeValue(personalBv));
  setAccountOverviewText(accountOverviewPersonalBvLabelElement, personalBvLabelText);
  setAccountOverviewText(accountOverviewCycleValueElement, cycleCapText);
  setAccountOverviewText(accountOverviewCycleLabelElement, cycleLabelText);
  setAccountOverviewText(accountOverviewDirectSponsorsValueElement, formatInteger(directSponsorCount, 0));
  setAccountOverviewText(accountOverviewDirectSponsorsLabelElement, directSponsorsLabelText);
  setAccountOverviewText(accountOverviewEwalletValueElement, ewalletDisplayValue);
  setAccountOverviewText(accountOverviewEwalletLabelElement, eWalletLabelText);
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

  const nodePhotoUrl = resolveNodeAvatarPhotoUrl(homeNode);
  const nodeAvatarPalette = resolveAvatarPaletteFromRecord(homeNode) || resolveSessionAvatarPalette();
  const sessionAvatarBackground = resolveSessionAvatarCssBackground();
  if (accountOverviewAvatarElement instanceof HTMLElement) {
    if (!systemTotalsMode && nodePhotoUrl) {
      accountOverviewAvatarElement.style.backgroundImage = `url("${nodePhotoUrl}")`;
      accountOverviewAvatarElement.dataset.avatarPhoto = 'true';
    } else if (!systemTotalsMode && sessionAvatarBackground.isPhoto) {
      accountOverviewAvatarElement.style.backgroundImage = sessionAvatarBackground.image;
      accountOverviewAvatarElement.dataset.avatarPhoto = 'true';
    } else {
      accountOverviewAvatarElement.style.backgroundImage = resolveAccountOverviewGradientBackground(
        nodeAvatarPalette,
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
  if (state.ui.accountOverviewVisible) {
    state.ui.infinityBuilderVisible = false;
    state.ui.rankAdvancementVisible = false;
    state.ui.preferredAccountsVisible = false;
    state.ui.myStoreVisible = false;
    syncInfinityBuilderPanelVisibility();
    syncRankAdvancementPanelVisibility();
    syncPreferredAccountsPanelVisibility();
    syncMyStorePanelVisibility();
  }
  syncAccountOverviewPanelVisibility();
  if (state.ui.accountOverviewVisible) {
    const overviewContext = resolveAccountOverviewPanelContext();
    const homeNode = overviewContext?.homeNode || resolveNodeById('root');
    void refreshAccountOverviewRemoteSnapshot({
      force: true,
      homeNode,
      scope: overviewContext?.scope,
      preferHomeNodeIdentity: overviewContext?.preferHomeNodeIdentity,
    });
  }
}

function initAccountOverviewPanel() {
  if (!isAccountOverviewPanelAvailable()) {
    return;
  }

  syncAccountOverviewPanelPosition();
  syncAccountOverviewPanelVisuals();
  syncAccountOverviewPanelVisibility();
  const overviewContext = resolveAccountOverviewPanelContext();
  void refreshAccountOverviewRemoteSnapshot({
    force: true,
    homeNode: overviewContext?.homeNode || null,
    scope: overviewContext?.scope,
    preferHomeNodeIdentity: overviewContext?.preferHomeNodeIdentity,
  });

  if (accountOverviewRefreshButtonElement instanceof HTMLElement) {
    accountOverviewRefreshButtonElement.addEventListener('click', () => {
      setAccountOverviewPanelVisible(false);
    });
  }
  for (const commissionButton of accountOverviewCommissionButtons) {
    if (!(commissionButton instanceof HTMLButtonElement)) {
      continue;
    }
    commissionButton.addEventListener('click', () => {
      const commissionKey = normalizeCredentialValue(
        commissionButton.dataset.accountOverviewCommission || '',
      );
      accountOverviewSelectedCommissionKey = commissionKey;
      if (commissionKey === 'infinity-builder' || commissionKey === 'infinitybuilder') {
        setInfinityBuilderPanelMode(INFINITY_BUILDER_PANEL_MODE_INFINITY);
        setInfinityBuilderPanelVisible(true);
      } else if (
        commissionKey === 'legacy-builder'
        || commissionKey === 'legacybuilder'
        || commissionKey === 'legacy-leadership'
        || commissionKey === 'legacyleadership'
      ) {
        setInfinityBuilderPanelMode(INFINITY_BUILDER_PANEL_MODE_LEGACY_LEADERSHIP);
        setInfinityBuilderPanelVisible(true);
      }
    });
  }
}

function isInfinityBuilderPanelAvailable() {
  return infinityBuilderPanelElement instanceof HTMLElement;
}

function normalizeInfinityBuilderPanelMode(modeInput = INFINITY_BUILDER_PANEL_MODE_INFINITY) {
  const normalizedMode = normalizeCredentialValue(modeInput);
  if (
    normalizedMode === INFINITY_BUILDER_PANEL_MODE_LEGACY_LEADERSHIP
    || normalizedMode === 'legacyleadership'
    || normalizedMode === 'legacy-builder'
    || normalizedMode === 'legacybuilder'
  ) {
    return INFINITY_BUILDER_PANEL_MODE_LEGACY_LEADERSHIP;
  }
  return INFINITY_BUILDER_PANEL_MODE_INFINITY;
}

function isLegacyLeadershipPanelMode() {
  return normalizeInfinityBuilderPanelMode(infinityBuilderPanelMode)
    === INFINITY_BUILDER_PANEL_MODE_LEGACY_LEADERSHIP;
}

function resolveInfinityBuilderPanelModeConfig(modeInput = infinityBuilderPanelMode) {
  const mode = normalizeInfinityBuilderPanelMode(modeInput);
  if (mode === INFINITY_BUILDER_PANEL_MODE_LEGACY_LEADERSHIP) {
    return {
      mode,
      panelTitle: 'Legacy Leadership Bonus',
      panelCopyHtml: (
        'The <strong>Legacy Leadership Bonus</strong> rewards leaders who build Legacy-only'
        + ' teams through mapped depth levels (0-3). Each completed tier unlocks a one-time'
        + ' tier reward.'
      ),
      tierLabelPrefix: 'Legacy Tier',
      claimMapPrimaryKey: 'legacyleadership',
      claimMapFallbackKey: 'legacyLeadership',
      claimMessageLabel: 'Legacy tier reward',
      currentEmptyText: 'Enroll Legacy package members to start building Tier 1.',
      currentAriaLabelPrefix: 'View Legacy Tier',
      commissionBalanceKey: 'legacyBuilder',
      maxDepth: LEGACY_LEADERSHIP_MAX_DEPTH,
      totalNodesPerTier: LEGACY_LEADERSHIP_TOTAL_NODES_PER_TIER,
      baseVisibleTierCount: LEGACY_LEADERSHIP_BASE_VISIBLE_TIERS,
      previewLockedTierCount: LEGACY_LEADERSHIP_PREVIEW_LOCKED_TIERS,
      showMonthlyOverride: false,
      unlockByDirectRequirement: true,
      directSeedLabel: 'Legacy enrollments',
    };
  }
  return {
    mode,
    panelTitle: 'Infinity Builder Bonus',
    panelCopyHtml: (
      'The <strong>Infinity Builder Bonus</strong> rewards members who build strong foundations.'
      + ' Each tier is completed after 3 direct Infinity/Legacy enrollments. Then each member'
      + ' unlocks 1% monthly only after duplicating to 3 active direct enrollments.'
    ),
    tierLabelPrefix: 'Infinity Tier',
    claimMapPrimaryKey: 'infinitybuilder',
    claimMapFallbackKey: 'infinityBuilder',
    claimMessageLabel: 'Tier reward',
    currentEmptyText: 'Enroll Infinity or Legacy package members to start building Tier 1.',
    currentAriaLabelPrefix: 'View Infinity Tier',
    commissionBalanceKey: 'infinityBuilder',
    maxDepth: 1,
    totalNodesPerTier: INFINITY_BUILDER_TIER_NODE_REQUIREMENT,
    baseVisibleTierCount: INFINITY_BUILDER_MIN_VISIBLE_TIERS,
    previewLockedTierCount: 0,
    showMonthlyOverride: true,
    unlockByDirectRequirement: false,
    directSeedLabel: 'Infinity/Legacy enrollments',
  };
}

function isLegacyTierCanvasViewActive() {
  return Boolean(
    legacyTierCanvasViewState.active
    && legacyTierCanvasViewState.model
    && isLegacyLeadershipPanelMode(),
  );
}

function clearPendingLegacyTierCanvasOpen() {
  if (legacyTierCanvasOpenTimerId > 0) {
    window.clearTimeout(legacyTierCanvasOpenTimerId);
  }
  legacyTierCanvasOpenTimerId = 0;
  legacyTierCanvasOpenToken = '';
}

function clearPendingLegacyTierCanvasTierSwitch(options = {}) {
  const preserveFade = options?.preserveFade === true;
  if (legacyTierCanvasTierSwitchTimerId > 0) {
    window.clearTimeout(legacyTierCanvasTierSwitchTimerId);
  }
  legacyTierCanvasTierSwitchTimerId = 0;
  legacyTierCanvasTierSwitchToken = '';
  legacyTierCanvasViewState.tierSwitchInFlight = false;
  if (!preserveFade) {
    setUniverseEnterViewFade('none');
  }
}

function captureLegacyTierCanvasAnchorView(options = {}) {
  const preferTarget = options?.preferTarget !== false;
  const cameraTarget = preferTarget && state.camera?.target && typeof state.camera.target === 'object'
    ? state.camera.target
    : null;
  const cameraView = state.camera?.view && typeof state.camera.view === 'object'
    ? state.camera.view
    : null;
  const sourceView = cameraTarget || cameraView || null;
  if (!sourceView) {
    return {
      x: 0,
      y: 0,
      scale: DEFAULT_HOME_SCALE,
    };
  }
  return {
    x: safeNumber(sourceView.x, 0),
    y: safeNumber(sourceView.y, 0),
    scale: clamp(safeNumber(sourceView.scale, DEFAULT_HOME_SCALE), MIN_SCALE, MAX_SCALE),
  };
}

function resolveLegacyTierCanvasTierEntries(snapshotInput = null, selectedTierInput = null) {
  const snapshot = snapshotInput && typeof snapshotInput === 'object' ? snapshotInput : null;
  const tiers = Array.isArray(snapshot?.tiers) ? snapshot.tiers : [];
  const selectedTierNumber = Math.max(
    1,
    Math.floor(safeNumber(
      selectedTierInput?.tierNumber,
      safeNumber(infinityBuilderSelectedTierNumber, 1),
    )),
  );
  const unlockedOrSelected = tiers.filter((tier) => (
    tier
    && typeof tier === 'object'
    && (Boolean(tier.isUnlocked) || Math.floor(safeNumber(tier.tierNumber, 0)) === selectedTierNumber)
  ));
  const sourceTiers = unlockedOrSelected.length ? unlockedOrSelected : tiers;
  const tierNumberSet = new Set();
  for (const tier of sourceTiers) {
    const tierNumber = Math.floor(safeNumber(tier?.tierNumber, 0));
    if (tierNumber > 0) {
      tierNumberSet.add(tierNumber);
    }
  }
  if (!tierNumberSet.size && selectedTierNumber > 0) {
    tierNumberSet.add(selectedTierNumber);
  }
  const tierNumbers = Array.from(tierNumberSet).sort((a, b) => a - b);
  return tierNumbers.map((tierNumber) => ({
    tierNumber,
    label: `Legacy Tier ${tierNumber}`,
    isSelected: tierNumber === selectedTierNumber,
  }));
}

function syncLegacyTierCanvasTierEntries(snapshotInput = null, selectedTierInput = null) {
  legacyTierCanvasViewState.tierEntries = resolveLegacyTierCanvasTierEntries(
    snapshotInput,
    selectedTierInput,
  );
  if (legacyTierCanvasViewState.tierEntries.length <= 1) {
    legacyTierCanvasViewState.dropdownOpen = false;
  }
}

function selectLegacyTierCanvasTier(tierNumberInput = 0, options = {}) {
  const requestedTierNumber = Math.floor(safeNumber(tierNumberInput, NaN));
  if (!Number.isFinite(requestedTierNumber) || requestedTierNumber <= 0) {
    return false;
  }
  if (!isLegacyLeadershipPanelMode()) {
    setInfinityBuilderPanelMode(INFINITY_BUILDER_PANEL_MODE_LEGACY_LEADERSHIP);
  }

  const previousTierNumber = infinityBuilderSelectedTierNumber;
  const wasLegacyViewActive = isLegacyTierCanvasViewActive();
  const previousLegacyTierNumber = Math.max(
    1,
    Math.floor(safeNumber(
      legacyTierCanvasViewState?.tierNumber,
      previousTierNumber,
    )),
  );
  infinityBuilderSelectedTierNumber = requestedTierNumber;
  let selectedTierContext = resolveInfinityBuilderSelectedTierContext();
  if (!selectedTierContext) {
    const fallbackSnapshot = infinityBuilderLastPanelSnapshot;
    const fallbackTier = resolveInfinityBuilderSelectedTierFromSnapshot(
      fallbackSnapshot,
      requestedTierNumber,
    );
    if (fallbackSnapshot && fallbackTier) {
      selectedTierContext = {
        snapshot: fallbackSnapshot,
        selectedTier: fallbackTier,
      };
    }
  }
  if (!selectedTierContext) {
    infinityBuilderSelectedTierNumber = previousTierNumber;
    return false;
  }

  const resolvedTierNumber = Math.max(
    1,
    Math.floor(safeNumber(selectedTierContext?.selectedTier?.tierNumber, requestedTierNumber)),
  );
  infinityBuilderSelectedTierNumber = resolvedTierNumber;
  infinityBuilderClaimFeedbackTierNumber = 0;
  infinityBuilderLastRenderSignature = '';
  infinityBuilderLastPanelSnapshot = selectedTierContext.snapshot || infinityBuilderLastPanelSnapshot;
  syncLegacyTierCanvasTierEntries(selectedTierContext.snapshot, selectedTierContext.selectedTier);

  const keepDropdownOpen = options?.keepDropdownOpen === true;
  if (!keepDropdownOpen) {
    legacyTierCanvasViewState.dropdownOpen = false;
  }

  const tierChanged = resolvedTierNumber !== previousLegacyTierNumber;
  const shouldAnimateTierSwitch = wasLegacyViewActive && tierChanged;
  if (shouldAnimateTierSwitch) {
    const fadeOutDurationMs = 500;
    const fadeInDurationMs = 760;
    clearPendingLegacyTierCanvasTierSwitch({ preserveFade: true });
    clearPendingUniverseEnterPrep({ preserveFade: true });
    clearPendingUniverseBackPrep({ preserveFade: true });
    legacyTierCanvasViewState.tierSwitchInFlight = true;
    setUniverseEnterViewFade('out', fadeOutDurationMs);
    const switchToken = `${resolvedTierNumber}:${Math.floor(getNowMs())}`;
    legacyTierCanvasTierSwitchToken = switchToken;
    legacyTierCanvasTierSwitchTimerId = window.setTimeout(() => {
      if (legacyTierCanvasTierSwitchToken !== switchToken) {
        return;
      }
      legacyTierCanvasTierSwitchToken = '';
      legacyTierCanvasTierSwitchTimerId = 0;
      legacyTierCanvasViewState.tierSwitchInFlight = false;
      syncLegacyTierCanvasViewModel(selectedTierContext.snapshot, selectedTierContext.selectedTier);
      setUniverseEnterViewFade('in', fadeInDurationMs);
    }, fadeOutDurationMs);
  } else if (wasLegacyViewActive) {
    clearPendingLegacyTierCanvasTierSwitch();
    syncLegacyTierCanvasViewModel(selectedTierContext.snapshot, selectedTierContext.selectedTier);
  }

  if (Boolean(state.ui?.infinityBuilderVisible)) {
    syncInfinityBuilderPanelVisuals();
  } else {
    syncInfinityBuilderViewTreeButtonState({
      isLegacyMode: true,
      tierNumber: infinityBuilderSelectedTierNumber,
    });
  }
  return true;
}

function closeLegacyTierCanvasView(options = {}) {
  const preserveSelection = options?.preserveSelection !== false;
  clearPendingLegacyTierCanvasOpen();
  clearPendingLegacyTierCanvasTierSwitch();
  const hadViewState = Boolean(legacyTierCanvasViewState.active || legacyTierCanvasViewState.model);
  legacyTierCanvasViewState.active = false;
  legacyTierCanvasViewState.tierNumber = 0;
  legacyTierCanvasViewState.signature = '';
  legacyTierCanvasViewState.model = null;
  legacyTierCanvasViewState.anchorView = null;
  legacyTierCanvasViewState.tierEntries = [];
  legacyTierCanvasViewState.dropdownOpen = false;
  legacyTierCanvasViewState.tierSwitchInFlight = false;
  if (!preserveSelection || !hadViewState) {
    return;
  }
  const selectedId = safeText(state.selectedId);
  if (!selectedId) {
    return;
  }
  const existsInMainTree = Array.isArray(state.nodes)
    && state.nodes.some((node) => normalizeCredentialValue(node?.id) === normalizeCredentialValue(selectedId));
  if (!existsInMainTree) {
    setSelectedNode('', { animate: false });
  }
}

function exitLegacyTierCanvasToBinaryDefault(animated = true) {
  if (!isLegacyTierCanvasViewActive()) {
    return false;
  }
  closeLegacyTierCanvasView({ preserveSelection: true });
  goToGlobalHome(animated);
  return true;
}

function toggleLegacyTierCanvasPanelVisibility() {
  if (!isLegacyTierCanvasViewActive()) {
    return false;
  }
  legacyTierCanvasViewState.dropdownOpen = false;
  const nextVisible = !Boolean(state.ui?.infinityBuilderVisible);
  if (nextVisible) {
    setInfinityBuilderPanelMode(INFINITY_BUILDER_PANEL_MODE_LEGACY_LEADERSHIP);
  }
  setInfinityBuilderPanelVisible(nextVisible);
  return true;
}

function allocateLegacyTierCanvasNodeId(baseIdInput = '', fallbackId = '', usageByBase = new Map()) {
  const baseId = safeText(baseIdInput) || safeText(fallbackId) || 'legacy-tier-canvas-node';
  const seenCount = Math.max(0, Math.floor(safeNumber(usageByBase.get(baseId), 0)));
  usageByBase.set(baseId, seenCount + 1);
  if (seenCount === 0) {
    return baseId;
  }
  return `${baseId}::${seenCount + 1}`;
}

function createLegacyTierCanvasPlaceholderNode(nodeId = '', parentId = '', tierNumber = 1, depthLevel = 0, slotIndex = 0) {
  return {
    id: safeText(nodeId),
    parent: safeText(parentId),
    side: 'left',
    depth: Math.max(0, Math.floor(safeNumber(depthLevel, 0))),
    path: '',
    name: '',
    username: '',
    accountStatus: 'inactive',
    isActive: false,
    isLegacyTierEmptySlot: true,
    isLegacyTierViewPlaceholder: true,
    legacyTierNumber: Math.max(1, Math.floor(safeNumber(tierNumber, 1))),
    legacyTierSlotIndex: Math.max(0, Math.floor(safeNumber(slotIndex, 0))),
  };
}

function buildLegacyTierCanvasNodeDescriptor(options = {}) {
  const tierNumber = Math.max(1, Math.floor(safeNumber(options?.tierNumber, 1)));
  const depthLevel = Math.max(0, Math.floor(safeNumber(options?.depthLevel, 0)));
  const slotIndex = Math.max(0, Math.floor(safeNumber(options?.slotIndex, 0)));
  const parentId = safeText(options?.parentId);
  const snapshotEntry = options?.snapshotEntry && typeof options.snapshotEntry === 'object'
    ? options.snapshotEntry
    : null;
  const usageByBase = options?.usageByBase instanceof Map ? options.usageByBase : new Map();
  const sourceNode = snapshotEntry?.node && typeof snapshotEntry.node === 'object'
    ? snapshotEntry.node
    : null;
  const preferredNodeId = safeText(snapshotEntry?.nodeId || sourceNode?.id);
  const fallbackNodeId = `${LEGACY_TIER_CANVAS_PLACEHOLDER_ID_PREFIX}:tier-${tierNumber}:depth-${depthLevel}:slot-${slotIndex}`;
  const resolvedNodeId = allocateLegacyTierCanvasNodeId(preferredNodeId, fallbackNodeId, usageByBase);
  const isEmpty = !sourceNode;
  const avatarSeedId = safeText(sourceNode?.id || snapshotEntry?.nodeId || resolvedNodeId) || resolvedNodeId;
  const displayName = safeText(
    snapshotEntry?.displayName
    || sourceNode?.name
    || snapshotEntry?.username
    || sourceNode?.username
    || sourceNode?.memberCode
    || sourceNode?.member_code
    || sourceNode?.id
    || '',
  );
  const username = safeText(
    snapshotEntry?.username
    || sourceNode?.username
    || sourceNode?.memberCode
    || sourceNode?.member_code
    || '',
  );
  const nodeRecord = isEmpty
    ? createLegacyTierCanvasPlaceholderNode(
      resolvedNodeId,
      parentId,
      tierNumber,
      depthLevel,
      slotIndex,
    )
    : {
      ...sourceNode,
      id: resolvedNodeId,
      parent: parentId,
      side: safeText(sourceNode?.side || ''),
      depth: depthLevel,
      path: safeText(sourceNode?.path),
      name: displayName || safeText(sourceNode?.name),
      username,
      avatarSeed: safeText(sourceNode?.avatarSeed || sourceNode?.avatar_seed || avatarSeedId) || avatarSeedId,
      avatarSeedId,
      isLegacyTierEmptySlot: false,
      isLegacyTierViewPlaceholder: false,
    };
  const isActive = isEmpty ? false : resolveNodeActivityState(sourceNode);
  return {
    id: resolvedNodeId,
    parentId,
    node: nodeRecord,
    isEmpty,
    isActive,
    avatarSeedId,
    depthLevel,
    slotIndex,
  };
}

function buildLegacyTierCanvasViewModel(snapshotInput = null, selectedTierInput = null) {
  const snapshot = snapshotInput && typeof snapshotInput === 'object' ? snapshotInput : null;
  const selectedTier = selectedTierInput && typeof selectedTierInput === 'object' ? selectedTierInput : null;
  if (!snapshot || !selectedTier) {
    return null;
  }
  const tierNumber = Math.max(1, Math.floor(safeNumber(selectedTier?.tierNumber, 1)));
  const usageByBase = new Map();
  const rootSnapshotEntry = {
    node: snapshot?.homeNode && typeof snapshot.homeNode === 'object' ? snapshot.homeNode : null,
    nodeId: safeText(snapshot?.homeNode?.id || ''),
    username: resolveInfinityBuilderNodeUsername(snapshot?.homeNode),
    displayName: safeText(
      snapshot?.homeNode?.name
      || snapshot?.homeNode?.username
      || snapshot?.homeNode?.memberCode
      || snapshot?.homeNode?.id,
    ),
  };
  const rootDescriptor = buildLegacyTierCanvasNodeDescriptor({
    snapshotEntry: rootSnapshotEntry,
    parentId: '',
    tierNumber,
    depthLevel: 0,
    slotIndex: 0,
    usageByBase,
  });

  const seedSnapshotsInput = Array.isArray(selectedTier?.seedSnapshots)
    ? selectedTier.seedSnapshots
    : [];
  const seedSnapshots = Array.from(
    { length: INFINITY_BUILDER_DIRECT_SPONSORS_PER_TIER },
    (_, seedIndex) => {
      const seedSnapshot = seedSnapshotsInput[seedIndex];
      return seedSnapshot && typeof seedSnapshot === 'object' ? seedSnapshot : null;
    },
  );

  const levelOneDescriptors = seedSnapshots.map((seedSnapshot, seedIndex) => (
    buildLegacyTierCanvasNodeDescriptor({
      snapshotEntry: seedSnapshot,
      parentId: rootDescriptor.id,
      tierNumber,
      depthLevel: 1,
      slotIndex: seedIndex,
      usageByBase,
    })
  ));

  const levelTwoDescriptors = [];
  for (let seedIndex = 0; seedIndex < INFINITY_BUILDER_DIRECT_SPONSORS_PER_TIER; seedIndex += 1) {
    const seedSnapshot = seedSnapshots[seedIndex];
    const childSnapshotsInput = Array.isArray(seedSnapshot?.childSnapshots)
      ? seedSnapshot.childSnapshots
      : [];
    for (let childIndex = 0; childIndex < INFINITY_BUILDER_TIER_NODE_REQUIREMENT; childIndex += 1) {
      const slotIndex = (seedIndex * INFINITY_BUILDER_TIER_NODE_REQUIREMENT) + childIndex;
      const parentDescriptor = levelOneDescriptors[seedIndex];
      levelTwoDescriptors.push(buildLegacyTierCanvasNodeDescriptor({
        snapshotEntry: childSnapshotsInput[childIndex] || null,
        parentId: safeText(parentDescriptor?.id),
        tierNumber,
        depthLevel: 2,
        slotIndex,
        usageByBase,
      }));
    }
  }

  const levelThreeDescriptors = [];
  for (let seedIndex = 0; seedIndex < INFINITY_BUILDER_DIRECT_SPONSORS_PER_TIER; seedIndex += 1) {
    const seedSnapshot = seedSnapshots[seedIndex];
    const depthTwoGroupSnapshotsInput = Array.isArray(seedSnapshot?.depthTwoGroupSnapshots)
      ? seedSnapshot.depthTwoGroupSnapshots
      : [];
    for (let groupIndex = 0; groupIndex < INFINITY_BUILDER_TIER_NODE_REQUIREMENT; groupIndex += 1) {
      const parentLevelTwoIndex = (seedIndex * INFINITY_BUILDER_TIER_NODE_REQUIREMENT) + groupIndex;
      const parentDescriptor = levelTwoDescriptors[parentLevelTwoIndex];
      const groupSnapshot = Array.isArray(depthTwoGroupSnapshotsInput[groupIndex])
        ? depthTwoGroupSnapshotsInput[groupIndex]
        : [];
      for (let childIndex = 0; childIndex < INFINITY_BUILDER_TIER_NODE_REQUIREMENT; childIndex += 1) {
        const slotIndex = (
          (seedIndex * levelTwoDescriptors.length)
          + (groupIndex * INFINITY_BUILDER_TIER_NODE_REQUIREMENT)
          + childIndex
        );
        levelThreeDescriptors.push(buildLegacyTierCanvasNodeDescriptor({
          snapshotEntry: groupSnapshot[childIndex] || null,
          parentId: safeText(parentDescriptor?.id),
          tierNumber,
          depthLevel: 3,
          slotIndex,
          usageByBase,
        }));
      }
    }
  }

  const nodesByDepth = [
    [rootDescriptor],
    levelOneDescriptors,
    levelTwoDescriptors,
    levelThreeDescriptors,
  ];
  const descriptors = nodesByDepth.reduce(
    (accumulator, depthDescriptors) => accumulator.concat(depthDescriptors),
    [],
  );
  const signature = [
    `tier:${tierNumber}`,
    ...descriptors.map((descriptor) => [
      descriptor.depthLevel,
      descriptor.slotIndex,
      descriptor.avatarSeedId,
      descriptor.isEmpty ? '0' : (descriptor.isActive ? '1' : '2'),
    ].join(':')),
  ].join('|');
  return {
    tierNumber,
    title: `Legacy Tier ${tierNumber} Tree View`,
    rootId: rootDescriptor.id,
    nodesByDepth,
    descriptors,
    signature,
  };
}

function syncLegacyTierCanvasViewModel(snapshotInput = null, selectedTierInput = null) {
  if (!legacyTierCanvasViewState.active) {
    return false;
  }
  const model = buildLegacyTierCanvasViewModel(snapshotInput, selectedTierInput);
  if (!model) {
    closeLegacyTierCanvasView({ preserveSelection: true });
    return false;
  }
  legacyTierCanvasViewState.active = true;
  legacyTierCanvasViewState.tierNumber = model.tierNumber;
  legacyTierCanvasViewState.signature = model.signature;
  legacyTierCanvasViewState.model = model;
  syncLegacyTierCanvasTierEntries(snapshotInput, selectedTierInput);
  if (!legacyTierCanvasViewState.anchorView || typeof legacyTierCanvasViewState.anchorView !== 'object') {
    legacyTierCanvasViewState.anchorView = captureLegacyTierCanvasAnchorView({
      preferTarget: true,
    });
  }
  const selectedId = safeText(state.selectedId);
  const visibleIds = new Set(model.descriptors.map((descriptor) => descriptor.id));
  if (!selectedId || !visibleIds.has(selectedId)) {
    setSelectedNode(model.rootId, { animate: false });
  }
  return true;
}

function openLegacyTierCanvasView(snapshotInput = null, selectedTierInput = null, options = {}) {
  clearPendingLegacyTierCanvasTierSwitch({ preserveFade: true });
  legacyTierCanvasViewState.active = true;
  const resetAnchorView = options?.resetAnchorView !== false;
  if (resetAnchorView || !legacyTierCanvasViewState.anchorView) {
    legacyTierCanvasViewState.anchorView = captureLegacyTierCanvasAnchorView({
      preferTarget: options?.preferTargetAnchor !== false,
    });
  }
  return syncLegacyTierCanvasViewModel(snapshotInput, selectedTierInput);
}

function syncInfinityBuilderViewTreeButtonState(options = {}) {
  if (!(infinityBuilderViewTreeButtonElement instanceof HTMLButtonElement)) {
    return;
  }
  const isLegacyMode = options?.isLegacyMode === true;
  const tierNumber = Math.max(
    1,
    Math.floor(safeNumber(options?.tierNumber, infinityBuilderSelectedTierNumber || 1)),
  );
  if (isLegacyMode) {
    infinityBuilderViewTreeButtonElement.hidden = false;
    infinityBuilderViewTreeButtonElement.disabled = false;
    infinityBuilderViewTreeButtonElement.textContent = 'View Tree';
    infinityBuilderViewTreeButtonElement.setAttribute('aria-pressed', 'false');
    infinityBuilderViewTreeButtonElement.setAttribute('aria-label', `View Legacy Tier ${tierNumber} Tree`);
    return;
  }
  infinityBuilderViewTreeButtonElement.hidden = true;
  infinityBuilderViewTreeButtonElement.disabled = true;
  infinityBuilderViewTreeButtonElement.setAttribute('aria-pressed', 'false');
  infinityBuilderViewTreeButtonElement.textContent = 'View Tree';
  infinityBuilderViewTreeButtonElement.setAttribute('aria-label', 'View Legacy Tier Tree');
}

function normalizeInfinityBuilderTierSortDirection(directionInput = 'asc') {
  const safeDirection = safeText(directionInput).toLowerCase();
  return safeDirection === 'desc' ? 'desc' : 'asc';
}

function normalizeInfinityBuilderTierSortMode(modeInput = infinityBuilderPanelMode) {
  return normalizeInfinityBuilderPanelMode(modeInput) === INFINITY_BUILDER_PANEL_MODE_LEGACY_LEADERSHIP
    ? INFINITY_BUILDER_PANEL_MODE_LEGACY_LEADERSHIP
    : INFINITY_BUILDER_PANEL_MODE_INFINITY;
}

function resolveInfinityBuilderTierSortDirectionForMode(modeInput = infinityBuilderPanelMode) {
  const mode = normalizeInfinityBuilderTierSortMode(modeInput);
  if (mode === INFINITY_BUILDER_PANEL_MODE_LEGACY_LEADERSHIP) {
    return normalizeInfinityBuilderTierSortDirection(infinityBuilderTierSortDirectionLegacyLeadership);
  }
  return normalizeInfinityBuilderTierSortDirection(infinityBuilderTierSortDirectionInfinity);
}

function resolveInfinityBuilderTierSortDirectionsSyncKey() {
  return [
    resolveInfinityBuilderTierSortDirectionForMode(INFINITY_BUILDER_PANEL_MODE_INFINITY),
    resolveInfinityBuilderTierSortDirectionForMode(INFINITY_BUILDER_PANEL_MODE_LEGACY_LEADERSHIP),
  ].join('|');
}

function applyInfinityBuilderTierSortDirections(directionsInput = {}, options = {}) {
  const source = directionsInput && typeof directionsInput === 'object' ? directionsInput : {};
  const previousSyncKey = resolveInfinityBuilderTierSortDirectionsSyncKey();

  infinityBuilderTierSortDirectionInfinity = normalizeInfinityBuilderTierSortDirection(
    source.infinityBuilderTierSortDirection
      || source.infinityBuilder
      || infinityBuilderTierSortDirectionInfinity,
  );
  infinityBuilderTierSortDirectionLegacyLeadership = normalizeInfinityBuilderTierSortDirection(
    source.legacyLeadershipTierSortDirection
      || source.legacyLeadership
      || infinityBuilderTierSortDirectionLegacyLeadership,
  );
  const updatedAt = safeText(source.tierSortDirectionsUpdatedAt);
  if (updatedAt) {
    infinityBuilderTierSortDirectionsUpdatedAt = updatedAt;
  }

  const nextSyncKey = resolveInfinityBuilderTierSortDirectionsSyncKey();
  if (nextSyncKey !== previousSyncKey) {
    infinityBuilderLastRenderSignature = '';
    if (Boolean(state.ui?.infinityBuilderVisible)) {
      syncInfinityBuilderPanelVisuals();
    }
    if (options?.syncServer !== false) {
      if (canSyncInfinityBuilderTierSortDirectionsToServer()) {
        infinityBuilderTierSortDirectionsLocalDirty = true;
      }
      requestInfinityBuilderTierSortDirectionsServerSync();
    }
  }
}

function applyInfinityBuilderTierSortDirectionsFromLaunchState(launchStateInput = state.launchState, options = {}) {
  const launchState = launchStateInput && typeof launchStateInput === 'object'
    ? launchStateInput
    : {};
  applyInfinityBuilderTierSortDirections({
    infinityBuilderTierSortDirection: launchState?.infinityBuilderTierSortDirection,
    legacyLeadershipTierSortDirection: launchState?.legacyLeadershipTierSortDirection,
    tierSortDirectionsUpdatedAt: launchState?.tierSortDirectionsUpdatedAt,
  }, {
    syncServer: options?.syncServer === true,
  });
  if (options?.markSynced === true) {
    infinityBuilderTierSortDirectionsLastSyncedKey = resolveInfinityBuilderTierSortDirectionsSyncKey();
    infinityBuilderTierSortDirectionsLocalDirty = false;
  }
}

function resolveInfinityBuilderTierSortLabel(
  directionInput = resolveInfinityBuilderTierSortDirectionForMode(infinityBuilderPanelMode),
) {
  const direction = normalizeInfinityBuilderTierSortDirection(directionInput);
  return direction === 'desc' ? 'Sort: Descending' : 'Sort: Ascending';
}

function toggleInfinityBuilderTierSortDirection() {
  const mode = normalizeInfinityBuilderTierSortMode(infinityBuilderPanelMode);
  const currentDirection = resolveInfinityBuilderTierSortDirectionForMode(mode);
  const nextDirection = currentDirection === 'asc' ? 'desc' : 'asc';
  if (mode === INFINITY_BUILDER_PANEL_MODE_LEGACY_LEADERSHIP) {
    applyInfinityBuilderTierSortDirections({
      legacyLeadershipTierSortDirection: nextDirection,
    }, {
      syncServer: true,
    });
    return;
  }
  applyInfinityBuilderTierSortDirections({
    infinityBuilderTierSortDirection: nextDirection,
  }, {
    syncServer: true,
  });
}

function resolveInfinityBuilderSelectedTierFromSnapshot(snapshotInput = null, tierNumberInput = infinityBuilderSelectedTierNumber) {
  const snapshot = snapshotInput && typeof snapshotInput === 'object' ? snapshotInput : null;
  const tiers = Array.isArray(snapshot?.tiers) ? snapshot.tiers : [];
  if (tiers.length === 0) {
    return null;
  }
  const requestedTierNumber = Math.max(1, Math.floor(safeNumber(tierNumberInput, infinityBuilderSelectedTierNumber)));
  return tiers.find((tier) => tier.tierNumber === requestedTierNumber)
    || tiers.find((tier) => tier.isUnlocked)
    || tiers[0]
    || null;
}

function resolveInfinityBuilderSelectedTierContext() {
  const overviewContext = resolveAccountOverviewPanelContext();
  const homeNode = overviewContext?.homeNode || resolveNodeById('root');
  const snapshot = buildInfinityBuilderPanelSnapshot(homeNode);
  const selectedTier = resolveInfinityBuilderSelectedTierFromSnapshot(snapshot);
  if (!selectedTier) {
    return null;
  }
  return {
    snapshot,
    selectedTier,
  };
}

function resolveLegacyTierCanvasAnimationAnchorNodeId(snapshotInput = null, selectedTierInput = null) {
  const snapshot = snapshotInput && typeof snapshotInput === 'object' ? snapshotInput : null;
  const selectedTier = selectedTierInput && typeof selectedTierInput === 'object' ? selectedTierInput : null;
  const seedSnapshots = Array.isArray(selectedTier?.seedSnapshots)
    ? selectedTier.seedSnapshots
    : [];
  for (const seedSnapshot of seedSnapshots) {
    const seedNode = seedSnapshot?.node && typeof seedSnapshot.node === 'object'
      ? seedSnapshot.node
      : null;
    if (!seedNode) {
      continue;
    }
    const focusId = resolveInfinityBuilderFocusNodeId(seedNode, {
      nodeId: seedSnapshot?.nodeId,
      username: seedSnapshot?.username,
    });
    if (focusId) {
      return focusId;
    }
  }
  const homeNode = snapshot?.homeNode && typeof snapshot.homeNode === 'object'
    ? snapshot.homeNode
    : null;
  const homeFocusId = resolveInfinityBuilderFocusNodeId(homeNode, {
    nodeId: safeText(homeNode?.id),
    username: resolveInfinityBuilderNodeUsername(homeNode),
  });
  if (homeFocusId) {
    return homeFocusId;
  }
  return safeText(resolvePreferredGlobalHomeNodeId() || 'root') || 'root';
}

function viewLegacyTierCanvasTree() {
  if (!isLegacyLeadershipPanelMode()) {
    setInfinityBuilderPanelMode(INFINITY_BUILDER_PANEL_MODE_LEGACY_LEADERSHIP);
  }
  const modeConfig = resolveInfinityBuilderPanelModeConfig();
  if (modeConfig.mode !== INFINITY_BUILDER_PANEL_MODE_LEGACY_LEADERSHIP) {
    closeLegacyTierCanvasView({ preserveSelection: true });
    return false;
  }
  let selectedTierContext = resolveInfinityBuilderSelectedTierContext();
  if (!selectedTierContext) {
    const fallbackSnapshot = infinityBuilderLastPanelSnapshot;
    const fallbackTier = resolveInfinityBuilderSelectedTierFromSnapshot(fallbackSnapshot);
    if (fallbackSnapshot && fallbackTier) {
      selectedTierContext = {
        snapshot: fallbackSnapshot,
        selectedTier: fallbackTier,
      };
    }
  }
  if (!selectedTierContext) {
    syncInfinityBuilderPanelVisuals();
    selectedTierContext = resolveInfinityBuilderSelectedTierContext();
  }
  if (!selectedTierContext) {
    return false;
  }

  syncInfinityBuilderViewTreeButtonState({
    isLegacyMode: true,
    tierNumber: selectedTierContext?.selectedTier?.tierNumber,
  });
  infinityBuilderLastPanelSnapshot = selectedTierContext.snapshot || infinityBuilderLastPanelSnapshot;
  legacyTierCanvasViewState.dropdownOpen = false;

  clearPendingUniverseEnterPrep({ preserveFade: true });
  clearPendingUniverseBackPrep({ preserveFade: true });
  clearPendingLegacyTierCanvasOpen();
  clearPendingLegacyTierCanvasTierSwitch({ preserveFade: true });

  const anchorNodeId = resolveLegacyTierCanvasAnimationAnchorNodeId(
    selectedTierContext.snapshot,
    selectedTierContext.selectedTier,
  );
  setUniverseEnterViewFade('out', Math.min(220, UNIVERSE_ENTER_GLOBAL_ZOOM_MS));
  if (anchorNodeId && focusNode(anchorNodeId, UNIVERSE_ENTER_GLOBAL_FOCUS_RADIUS, true)) {
    state.camera.targetReason = 'universe-enter';
  }

  legacyTierCanvasOpenTimerId = 0;
  legacyTierCanvasOpenToken = '';
  let opened = false;
  try {
    opened = openLegacyTierCanvasView(
      selectedTierContext.snapshot,
      selectedTierContext.selectedTier,
      {
        resetAnchorView: true,
        preferTargetAnchor: true,
      },
    );
  } catch (error) {
    console.error('[TreeNext] Legacy tier canvas open failed:', error);
    opened = false;
  }
  if (!opened) {
    setUniverseEnterViewFade('none');
    syncInfinityBuilderViewTreeButtonState({
      isLegacyMode: true,
      tierNumber: selectedTierContext?.selectedTier?.tierNumber,
    });
    return false;
  }
  setUniverseEnterViewFade('in', UNIVERSE_ENTER_LOCAL_FADE_IN_MS);
  infinityBuilderLastRenderSignature = '';
  syncInfinityBuilderPanelVisuals();
  window.requestAnimationFrame(() => {
    try {
      renderFrame();
    } catch (error) {
      console.error('[TreeNext] Legacy tier canvas immediate render failed:', error);
    }
  });
  return true;
}

function openLegacyTierOneCanvasView() {
  const targetTierNumber = 1;
  legacyTierCanvasViewState.dropdownOpen = false;
  if (!isLegacyLeadershipPanelMode()) {
    setInfinityBuilderPanelMode(INFINITY_BUILDER_PANEL_MODE_LEGACY_LEADERSHIP);
  }
  infinityBuilderSelectedTierNumber = targetTierNumber;
  infinityBuilderClaimFeedbackTierNumber = 0;
  infinityBuilderLastRenderSignature = '';

  if (isLegacyTierCanvasViewActive()) {
    return selectLegacyTierCanvasTier(targetTierNumber);
  }
  return viewLegacyTierCanvasTree();
}

function toggleLegacyTierQuickAccessView() {
  if (isLegacyTierCanvasViewActive()) {
    return exitLegacyTierCanvasToBinaryDefault(true);
  }
  return openLegacyTierOneCanvasView();
}

function setInfinityBuilderPanelMode(modeInput = INFINITY_BUILDER_PANEL_MODE_INFINITY) {
  const normalizedMode = normalizeInfinityBuilderPanelMode(modeInput);
  if (normalizedMode === infinityBuilderPanelMode) {
    return;
  }
  infinityBuilderPanelMode = normalizedMode;
  if (normalizedMode !== INFINITY_BUILDER_PANEL_MODE_LEGACY_LEADERSHIP) {
    closeLegacyTierCanvasView({ preserveSelection: true });
  }
  infinityBuilderSelectedTierNumber = 1;
  infinityBuilderClaimFeedbackTierNumber = 0;
  infinityBuilderLastRenderSignature = '';
  infinityBuilderLastPanelSnapshot = null;
  setInfinityBuilderClaimFeedback('');
  syncInfinityBuilderViewTreeButtonState({
    isLegacyMode: normalizedMode === INFINITY_BUILDER_PANEL_MODE_LEGACY_LEADERSHIP,
    tierNumber: infinityBuilderSelectedTierNumber,
  });
  if (Boolean(state.ui?.infinityBuilderVisible)) {
    syncInfinityBuilderPanelVisuals();
  }
}

function resetInfinityBuilderPanelState() {
  infinityBuilderPanelMode = INFINITY_BUILDER_PANEL_MODE_INFINITY;
  infinityBuilderLastRenderSignature = '';
  infinityBuilderLastPanelSnapshot = null;
  infinityBuilderSelectedTierNumber = 1;
  infinityBuilderTierSortDirectionInfinity = 'asc';
  infinityBuilderTierSortDirectionLegacyLeadership = 'asc';
  infinityBuilderTierSortDirectionsUpdatedAt = '';
  infinityBuilderTierSortDirectionsSyncInFlight = false;
  infinityBuilderTierSortDirectionsSyncQueued = false;
  infinityBuilderTierSortDirectionsLastSyncedKey = '';
  infinityBuilderTierSortDirectionsLocalDirty = false;
  infinityBuilderClaimInFlight = false;
  infinityBuilderClaimFeedbackTierNumber = 0;
  if (infinityBuilderClaimFeedbackTimerId) {
    clearTimeout(infinityBuilderClaimFeedbackTimerId);
    infinityBuilderClaimFeedbackTimerId = 0;
  }
  setInfinityBuilderClaimFeedback('');
  closeLegacyTierCanvasView({ preserveSelection: false });
  syncInfinityBuilderViewTreeButtonState({ isLegacyMode: false });
}

function isInfinityBuilderPlaceholderNode(nodeInput = null) {
  const node = nodeInput && typeof nodeInput === 'object' ? nodeInput : null;
  if (!node) {
    return false;
  }
  const placeholderType = normalizeCredentialValue(
    safeText(node?.businessCenterNodeType || node?.business_center_node_type || ''),
  );
  if (!placeholderType) {
    return false;
  }
  return (
    placeholderType.includes('placeholder')
    || placeholderType.includes('queued')
    || placeholderType.includes('reserved')
  );
}

function isInfinityBuilderSpilloverNode(nodeInput = null) {
  const node = nodeInput && typeof nodeInput === 'object' ? nodeInput : null;
  if (!node) {
    return false;
  }
  const placementLeg = normalizeCredentialValue(
    safeText(node?.placementLeg || node?.placement_leg || node?.sponsorLeg || node?.sponsor_leg || ''),
  );
  if (SPILLOVER_PLACEMENT_KEY_SET.has(placementLeg)) {
    return true;
  }
  if (Boolean(node?.isSpillover || node?.is_spillover)) {
    return true;
  }
  const parentKey = normalizeCredentialValue(
    safeText(node?.parent || node?.parentId || node?.parent_id || ''),
  );
  const sponsorKey = normalizeCredentialValue(
    safeText(node?.sponsorId || node?.globalSponsorId || node?.sourceSponsorId || ''),
  );
  return Boolean(parentKey && sponsorKey && sponsorKey !== parentKey);
}

function isTreeNextNodeAnonymized(nodeInput = null) {
  const node = nodeInput && typeof nodeInput === 'object' ? nodeInput : null;
  if (!node) {
    return false;
  }
  const normalizedName = normalizeCredentialValue(safeText(node?.name || ''));
  const normalizedMemberCode = normalizeCredentialValue(
    safeText(node?.memberCode || node?.member_code || node?.username || '').replace(/^@+/, ''),
  );

  if (
    normalizedName.includes('anonymous')
    || normalizedName.includes('annonymous')
    || normalizedName.startsWith('spillover direct')
    || normalizedName.startsWith('spillover network')
    || normalizedName.startsWith('direct sponsor')
    || normalizedName.startsWith('network member')
  ) {
    return true;
  }

  if (
    normalizedMemberCode.startsWith('spillover-')
    || normalizedMemberCode.startsWith('spillover-network-')
    || normalizedMemberCode.startsWith('anonymous-')
  ) {
    return true;
  }

  return false;
}

function isTreeNextOutsideOrganizationSpilloverNode(nodeInput = null) {
  const node = nodeInput && typeof nodeInput === 'object' ? nodeInput : null;
  // In scoped user trees, outside-source spillovers typically lose a resolvable sponsor id.
  const outsideSpillover = Boolean(
    node
    && Boolean(node?.isSpillover)
    && safeText(node?.placementParentId || node?.placement_parent_id || node?.parent || '')
    && !safeText(node?.sponsorId || ''),
  );
  const isViewerOwnedSponsorBranchNode = Boolean(
    node?.isViewerOwnedSponsorBranchNode
    || node?.is_viewer_owned_sponsor_branch_node,
  );
  // Keep viewer-owned sponsor branches visible even when sponsor placement is out-of-scope.
  return outsideSpillover && !isViewerOwnedSponsorBranchNode;
}

function resolveTreeNextSpilloverOutsideScopedOrganizationSource(nodeInput = null, viewerNodeId, includedNodeIds = null) {
  const node = nodeInput && typeof nodeInput === 'object' ? nodeInput : null;
  const sponsorNodeId = safeText(node?.sponsorId || '');
  const normalizedViewerNodeId = safeText(viewerNodeId || '');
  const included = includedNodeIds instanceof Set ? includedNodeIds : new Set();
  const sourceWasSpillover = Boolean(
    node?.isSpillover
    || node?.is_spillover
    || node?.placementLeg === 'spillover'
    || node?.placement_leg === 'spillover'
    || node?.sponsorLeg === 'spillover'
    || node?.sponsor_leg === 'spillover',
  );
  return Boolean(
    sourceWasSpillover
    && sponsorNodeId
    && sponsorNodeId !== normalizedViewerNodeId
    && !included.has(sponsorNodeId),
  );
}

function shouldApplyTreeNextNodePrivacyMask(nodeInput = null) {
  const node = nodeInput && typeof nodeInput === 'object' ? nodeInput : null;
  if (!node) {
    return false;
  }
  return (
    isTreeNextNodeAnonymized(node)
    || isTreeNextOutsideOrganizationSpilloverNode(node)
  );
}

function resolveTreeNextNodePublicIdentity(nodeInput = null, options = {}) {
  const node = nodeInput && typeof nodeInput === 'object' ? nodeInput : null;
  const fallbackName = safeText(options?.fallbackName || options?.fallback || node?.id || 'Member') || 'Member';
  const isMasked = shouldApplyTreeNextNodePrivacyMask(node);
  if (isMasked) {
    return {
      isMasked: true,
      name: TREE_NEXT_PRIVACY_ANONYMOUS_LABEL,
      username: '',
      usernameLabel: TREE_NEXT_PRIVACY_HIDDEN_LABEL,
      initials: resolveInitials(TREE_NEXT_PRIVACY_ANONYMOUS_LABEL),
    };
  }

  const name = safeText(node?.name || node?.id || fallbackName) || fallbackName;
  const username = safeText(node?.username || node?.memberCode || node?.member_code || '').replace(/^@+/, '');
  return {
    isMasked: false,
    name,
    username,
    usernameLabel: username ? `@${username}` : '',
    initials: resolveInitials(name),
  };
}

function resolveInfinityBuilderNodeAddedAtMs(nodeInput = null) {
  const node = nodeInput && typeof nodeInput === 'object' ? nodeInput : null;
  if (!node) {
    return 0;
  }
  const numericAddedAt = safeNumber(node?.addedAt, Number.NaN);
  if (Number.isFinite(numericAddedAt)) {
    return Math.max(0, Math.floor(numericAddedAt));
  }
  const candidates = [
    node?.createdAt,
    node?.created_at,
    node?.addedAt,
    node?.added_at,
    node?.updatedAt,
    node?.updated_at,
    node?.enrolledAt,
    node?.enrolled_at,
  ];
  for (const candidate of candidates) {
    const parsed = Date.parse(safeText(candidate));
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return 0;
}

function compareInfinityBuilderNodesOldestToNewest(leftNodeInput = null, rightNodeInput = null) {
  const leftNode = leftNodeInput && typeof leftNodeInput === 'object' ? leftNodeInput : null;
  const rightNode = rightNodeInput && typeof rightNodeInput === 'object' ? rightNodeInput : null;
  const leftAddedAt = resolveInfinityBuilderNodeAddedAtMs(leftNode);
  const rightAddedAt = resolveInfinityBuilderNodeAddedAtMs(rightNode);
  if (leftAddedAt !== rightAddedAt) {
    return leftAddedAt - rightAddedAt;
  }
  const leftKey = safeText(leftNode?.id || leftNode?.username || leftNode?.memberCode || '');
  const rightKey = safeText(rightNode?.id || rightNode?.username || rightNode?.memberCode || '');
  return leftKey.localeCompare(rightKey);
}

function isInfinityBuilderQualifyingSeedNode(nodeInput = null, options = {}) {
  const node = nodeInput && typeof nodeInput === 'object' ? nodeInput : null;
  if (!node || isInfinityBuilderPlaceholderNode(node)) {
    return false;
  }
  const modeConfig = resolveInfinityBuilderPanelModeConfig(options?.mode || infinityBuilderPanelMode);
  const packageKey = normalizeCredentialValue(
    node?.enrollmentPackage
    || node?.enrollment_package
    || node?.packageKey
    || node?.package_key,
  );
  if (modeConfig.mode === INFINITY_BUILDER_PANEL_MODE_LEGACY_LEADERSHIP) {
    return packageKey === LEGACY_LEADERSHIP_REQUIRED_PACKAGE_KEY;
  }
  return INFINITY_BUILDER_QUALIFYING_PACKAGE_KEY_SET.has(packageKey);
}

function isInfinityBuilderQualifyingChildNode(nodeInput = null, options = {}) {
  const node = nodeInput && typeof nodeInput === 'object' ? nodeInput : null;
  if (!node || isInfinityBuilderPlaceholderNode(node)) {
    return false;
  }
  const modeConfig = resolveInfinityBuilderPanelModeConfig(options?.mode || infinityBuilderPanelMode);
  const packageKey = normalizeCredentialValue(
    node?.enrollmentPackage
    || node?.enrollment_package
    || node?.packageKey
    || node?.package_key,
  );
  if (modeConfig.mode === INFINITY_BUILDER_PANEL_MODE_LEGACY_LEADERSHIP) {
    return packageKey === LEGACY_LEADERSHIP_REQUIRED_PACKAGE_KEY;
  }
  return ENROLL_PAID_PACKAGE_KEY_SET.has(packageKey);
}

function resolveInfinityBuilderNodeUsername(nodeInput = null) {
  const node = nodeInput && typeof nodeInput === 'object' ? nodeInput : null;
  if (!node) {
    return '';
  }
  const rawUsername = safeText(
    node?.username
    || node?.memberUsername
    || node?.member_username
    || node?.memberCode
    || node?.member_code
    || node?.id,
  );
  if (!rawUsername) {
    return '';
  }
  return rawUsername.startsWith('@') ? rawUsername : `@${rawUsername}`;
}

function resolveInfinityBuilderNodeInitials(initialsInput = '') {
  const initials = safeText(initialsInput).replace(/\s+/g, '').slice(0, 2).toUpperCase();
  return initials;
}

function resolveInfinityBuilderMutedPalette(basePaletteInput = null, mixRatio = 0.52) {
  const basePalette = isAvatarPaletteRecord(basePaletteInput)
    ? {
      light: normalizeRgbTriplet(basePaletteInput.light[0], basePaletteInput.light[1], basePaletteInput.light[2]),
      mid: normalizeRgbTriplet(basePaletteInput.mid[0], basePaletteInput.mid[1], basePaletteInput.mid[2]),
      dark: normalizeRgbTriplet(basePaletteInput.dark[0], basePaletteInput.dark[1], basePaletteInput.dark[2]),
    }
    : resolveNodeAvatarPalette('infinity-builder:muted-fallback', { variant: 'ocean' });
  const inactivePalette = APPLE_MAPS_NODE_PALETTES.inactive;
  const safeMix = clamp(safeNumber(mixRatio, 0.52), 0, 1);
  const blendChannel = (baseValue, inactiveValue) => Math.round(
    (baseValue * (1 - safeMix)) + (inactiveValue * safeMix),
  );
  const blendTriplet = (baseTriplet, inactiveTriplet) => normalizeRgbTriplet(
    blendChannel(baseTriplet[0], inactiveTriplet[0]),
    blendChannel(baseTriplet[1], inactiveTriplet[1]),
    blendChannel(baseTriplet[2], inactiveTriplet[2]),
  );
  return {
    light: blendTriplet(basePalette.light, inactivePalette.light),
    mid: blendTriplet(basePalette.mid, inactivePalette.mid),
    dark: blendTriplet(basePalette.dark, inactivePalette.dark),
  };
}

function resolveInfinityBuilderNodeBackgroundImage(nodeInput = null, options = {}) {
  const node = nodeInput && typeof nodeInput === 'object' ? nodeInput : null;
  const fallbackSeed = safeText(
    options?.fallbackSeed
    || node?.id
    || node?.username
    || node?.memberCode
    || 'placeholder',
  );
  if (!node) {
    // Empty slots always use a consistent gray placeholder tone.
    return resolveCssGradientFromPalette(APPLE_MAPS_NODE_PALETTES.inactive);
  }

  const nodeId = safeText(
    node?.id
    || node?.nodeId
    || node?.userId
    || node?.memberId
    || node?.username
    || node?.memberCode
    || fallbackSeed,
  );
  const nodeRecord = resolveNodeById(nodeId) || node;
  const isActiveAccount = options?.active !== false && resolveNodeActivityState(nodeRecord);
  const isPersonallyEnrolledNode = isNodePersonallyEnrolledBySession(nodeRecord);
  const baseVariant = isSessionAvatarNodeId(nodeId)
    ? 'auto'
    : (nodeId.toLowerCase() === 'root' ? 'root' : 'auto');
  const nodeVariant = isPersonallyEnrolledNode ? 'direct' : baseVariant;

  const paletteForState = resolveNodeAvatarPalette(
    nodeId || `infinity-builder:${fallbackSeed}`,
    isActiveAccount
      ? (isPersonallyEnrolledNode
        ? {
          node: nodeRecord,
          variant: nodeVariant,
          ignoreSourcePalette: true,
        }
        : {
          node: nodeRecord,
          variant: nodeVariant,
        })
      : {
        node: nodeRecord,
        variant: isPersonallyEnrolledNode ? 'directInactive' : 'inactive',
        ignoreSourcePalette: true,
      },
  );
  return resolveCssGradientFromPalette(paletteForState);
}

function resolveInfinityBuilderFocusNodeId(nodeInput = null, options = {}) {
  const node = nodeInput && typeof nodeInput === 'object' ? nodeInput : null;
  const directNodeId = safeText(options?.nodeId || node?.id);
  if (directNodeId) {
    return directNodeId;
  }
  const rawUsername = safeText(
    options?.username
    || node?.username
    || node?.memberUsername
    || node?.member_username
    || node?.memberCode
    || node?.member_code
    || '',
  ).replace(/^@+/, '');
  if (!rawUsername) {
    return '';
  }
  return safeText(resolveNodeIdByUsername(rawUsername));
}

function buildInfinityBuilderEmptyChildSnapshot(seedToken = '') {
  return {
    node: null,
    nodeId: '',
    username: '',
    initials: '',
    isActive: false,
    backgroundImage: resolveInfinityBuilderNodeBackgroundImage(null, {
      active: true,
      fallbackSeed: `child-empty:${seedToken}`,
    }),
  };
}

function buildInfinityBuilderEmptySeedSnapshot(slotIndex = 0, tierNumber = 1) {
  return {
    slotIndex,
    node: null,
    nodeId: '',
    displayName: '',
    username: '',
    initials: '',
    isActive: false,
    isCompletedNode: false,
    completedChildCount: 0,
    totalOrganizationBv: 0,
    monthlyOverrideUsd: 0,
    weeklyOverrideUsd: 0,
    backgroundImage: resolveInfinityBuilderNodeBackgroundImage(null, {
      active: true,
      fallbackSeed: `seed-empty:tier-${tierNumber}:slot-${slotIndex}`,
    }),
    childSnapshots: Array.from(
      { length: INFINITY_BUILDER_TIER_NODE_REQUIREMENT },
      (_, childIndex) => buildInfinityBuilderEmptyChildSnapshot(`tier-${tierNumber}:slot-${slotIndex}:${childIndex}`),
    ),
  };
}

function resolveInfinityBuilderRawClaimMap(modeInput = infinityBuilderPanelMode) {
  const modeConfig = resolveInfinityBuilderPanelModeConfig(modeInput);
  const rawClaimMaps = (
    accountOverviewRemoteSnapshot?.commissionContainerSnapshot?.claimMaps
    && typeof accountOverviewRemoteSnapshot.commissionContainerSnapshot.claimMaps === 'object'
  )
    ? accountOverviewRemoteSnapshot.commissionContainerSnapshot.claimMaps
    : {};
  const primaryKey = safeText(modeConfig?.claimMapPrimaryKey);
  const fallbackKey = safeText(modeConfig?.claimMapFallbackKey);
  if (primaryKey && rawClaimMaps?.[primaryKey] && typeof rawClaimMaps[primaryKey] === 'object') {
    return rawClaimMaps[primaryKey];
  }
  if (fallbackKey && rawClaimMaps?.[fallbackKey] && typeof rawClaimMaps[fallbackKey] === 'object') {
    return rawClaimMaps[fallbackKey];
  }
  return {};
}

function resolveInfinityBuilderClaimRecordMap(modeInput = infinityBuilderPanelMode) {
  const rawClaimMapInput = resolveInfinityBuilderRawClaimMap(modeInput);
  const rawClaimMap = (
    rawClaimMapInput
    && typeof rawClaimMapInput === 'object'
  )
    ? rawClaimMapInput
    : {};
  const claimRecordMap = new Map();
  for (const [tierKey, claimRecordInput] of Object.entries(rawClaimMap)) {
    const claimRecord = claimRecordInput && typeof claimRecordInput === 'object'
      ? claimRecordInput
      : {};
    const tierFromKey = Math.floor(safeNumber(tierKey, Number.NaN));
    const tierFromRecord = Math.floor(safeNumber(claimRecord?.tierNumber, Number.NaN));
    const tierNumber = Number.isFinite(tierFromRecord) && tierFromRecord > 0
      ? tierFromRecord
      : tierFromKey;
    if (!Number.isFinite(tierNumber) || tierNumber <= 0) {
      continue;
    }
    claimRecordMap.set(tierNumber, {
      tierNumber,
      amount: Math.max(0, safeNumber(claimRecord?.amount, 0)),
      claimedAt: safeText(claimRecord?.claimedAt),
      startedAt: safeText(claimRecord?.startedAt),
      completedNodeCount: Math.max(0, Math.floor(safeNumber(claimRecord?.completedNodeCount, 0))),
      seedHandles: Array.isArray(claimRecord?.seedHandles)
        ? claimRecord.seedHandles.map((value) => safeText(value)).filter(Boolean)
        : [],
    });
  }
  return claimRecordMap;
}

function setInfinityBuilderClaimFeedback(message, options = {}) {
  if (!(infinityBuilderClaimFeedbackElement instanceof HTMLElement)) {
    return;
  }
  const {
    isError = false,
    isSuccess = false,
    persist = false,
  } = options;
  const text = safeText(message);
  infinityBuilderClaimFeedbackElement.textContent = text;
  infinityBuilderClaimFeedbackElement.classList.toggle('is-error', Boolean(text) && Boolean(isError));
  infinityBuilderClaimFeedbackElement.classList.toggle('is-success', Boolean(text) && Boolean(isSuccess));
  if (infinityBuilderClaimFeedbackTimerId) {
    clearTimeout(infinityBuilderClaimFeedbackTimerId);
    infinityBuilderClaimFeedbackTimerId = 0;
  }
  if (!text || persist) {
    return;
  }
  const capture = text;
  infinityBuilderClaimFeedbackTimerId = window.setTimeout(() => {
    if (!(infinityBuilderClaimFeedbackElement instanceof HTMLElement)) {
      return;
    }
    if (safeText(infinityBuilderClaimFeedbackElement.textContent) !== capture) {
      return;
    }
    infinityBuilderClaimFeedbackElement.textContent = '';
    infinityBuilderClaimFeedbackElement.classList.remove('is-error', 'is-success');
    infinityBuilderClaimFeedbackTimerId = 0;
  }, 4000);
}

async function claimInfinityBuilderTierReward() {
  if (infinityBuilderClaimInFlight) {
    return;
  }

  const modeConfig = resolveInfinityBuilderPanelModeConfig();
  const overviewContext = resolveAccountOverviewPanelContext();
  const homeNode = overviewContext?.homeNode || resolveNodeById('root');
  const snapshot = buildInfinityBuilderPanelSnapshot(homeNode);
  if (!Array.isArray(snapshot?.tiers) || snapshot.tiers.length === 0) {
    setInfinityBuilderClaimFeedback('Tier details are not available yet.', { isError: true });
    return;
  }
  const selectedTier = snapshot.tiers.find((tier) => tier.tierNumber === infinityBuilderSelectedTierNumber)
    || snapshot.tiers.find((tier) => tier.isUnlocked)
    || snapshot.tiers[0];
  if (!selectedTier || !selectedTier.isUnlocked) {
    setInfinityBuilderClaimFeedback('This tier is not unlocked yet.', { isError: true });
    return;
  }
  if (!selectedTier.isCompleted) {
    setInfinityBuilderClaimFeedback('Complete this tier before claiming its reward.', { isError: true });
    return;
  }
  if (selectedTier.isClaimed) {
    setInfinityBuilderClaimFeedback('This tier reward has already been claimed.', { isSuccess: true });
    return;
  }

  const identityPayload = resolveAccountOverviewIdentityPayload(homeNode, {
    preferHomeNode: overviewContext?.preferHomeNodeIdentity === true,
    allowAnonymous: false,
  });
  const hasIdentity = Boolean(
    safeText(identityPayload?.userId)
    || safeText(identityPayload?.username)
    || safeText(identityPayload?.email),
  );
  if (!hasIdentity) {
    setInfinityBuilderClaimFeedback('Sign in before claiming tier rewards.', { isError: true });
    return;
  }

  const existingInfinityClaimMap = resolveInfinityBuilderRawClaimMap(modeConfig.mode);
  const tierKey = String(selectedTier.tierNumber);
  const existingTierRecord = (
    existingInfinityClaimMap[tierKey]
    && typeof existingInfinityClaimMap[tierKey] === 'object'
  )
    ? existingInfinityClaimMap[tierKey]
    : {};
  const claimedAt = new Date().toISOString();
  const enrolledHandles = selectedTier.seedSnapshots
    .map((memberSnapshot) => safeText(
      memberSnapshot?.node?.username
      || memberSnapshot?.node?.memberCode
      || memberSnapshot?.node?.id,
    ))
    .filter(Boolean);
  const tierRewardUsdFallback = modeConfig.mode === INFINITY_BUILDER_PANEL_MODE_LEGACY_LEADERSHIP
    ? LEGACY_LEADERSHIP_TIER_BONUS_USD
    : INFINITY_BUILDER_TIER_BONUS_USD;
  const tierRewardUsd = Math.max(0, safeNumber(selectedTier?.tierBonusUsd, tierRewardUsdFallback));
  const nextInfinityClaimMap = {
    ...existingInfinityClaimMap,
    [tierKey]: {
      tierNumber: selectedTier.tierNumber,
      amount: tierRewardUsd,
      claimedAt,
      startedAt: safeText(existingTierRecord?.startedAt) || claimedAt,
      completedNodeCount: Math.max(
        0,
        Math.floor(safeNumber(
          selectedTier?.tierProgressCount,
          safeNumber(selectedTier?.litNodeCount, selectedTier.seedCount),
        )),
      ),
      seedHandles: enrolledHandles,
    },
  };

  infinityBuilderClaimInFlight = true;
  infinityBuilderClaimFeedbackTierNumber = selectedTier.tierNumber;
  setInfinityBuilderClaimFeedback(`Claiming ${modeConfig.claimMessageLabel.toLowerCase()}...`, { persist: true });
  infinityBuilderLastRenderSignature = '';
  syncInfinityBuilderPanelVisuals();

  try {
    const nextClaimMaps = {
      [modeConfig.claimMapPrimaryKey]: nextInfinityClaimMap,
    };
    const response = await fetch(ACCOUNT_OVERVIEW_COMMISSION_CONTAINERS_API, {
      method: 'POST',
      cache: 'no-store',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: safeText(identityPayload.userId),
        username: safeText(identityPayload.username),
        email: safeText(identityPayload.email),
        claimMaps: nextClaimMaps,
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const errorMessage = safeText(payload?.error)
        || `Unable to claim tier reward (${response.status}).`;
      throw new Error(errorMessage);
    }
    if (payload?.snapshot && typeof payload.snapshot === 'object') {
      accountOverviewRemoteSnapshot = {
        ...accountOverviewRemoteSnapshot,
        commissionContainerSnapshot: payload.snapshot,
        updatedAtMs: Date.now(),
      };
      accountOverviewRemoteDataVersion += 1;
    }
    const successLabel = modeConfig.mode === INFINITY_BUILDER_PANEL_MODE_LEGACY_LEADERSHIP
      ? `Legacy Tier ${selectedTier.tierNumber} reward claimed successfully.`
      : `Tier ${selectedTier.tierNumber} reward claimed successfully.`;
    setInfinityBuilderClaimFeedback(successLabel, { isSuccess: true });
    infinityBuilderLastRenderSignature = '';
    syncInfinityBuilderPanelVisuals();
    void refreshAccountOverviewRemoteSnapshot({
      force: true,
      homeNode,
      scope: overviewContext?.scope,
      preferHomeNodeIdentity: overviewContext?.preferHomeNodeIdentity,
    });
  } catch (error) {
    setInfinityBuilderClaimFeedback(
      safeText(error?.message) || 'Unable to claim tier reward right now.',
      { isError: true },
    );
  } finally {
    infinityBuilderClaimInFlight = false;
    infinityBuilderLastRenderSignature = '';
    syncInfinityBuilderPanelVisuals();
  }
}

function focusInfinityBuilderPanelNode(nodeIdInput = '') {
  const nodeId = safeText(nodeIdInput);
  if (!nodeId) {
    return false;
  }
  if (isLegacyTierCanvasViewActive()) {
    const projectedNodes = Array.isArray(state.frameResult?.projectedNodes)
      ? state.frameResult.projectedNodes
      : [];
    if (projectedNodes.some((node) => safeText(node?.id) === nodeId)) {
      setSelectedNode(nodeId, { animate: true });
      return true;
    }
  }
  if (focusNode(nodeId, 30, true)) {
    return true;
  }

  const globalMetrics = state.adapter.resolveNodeMetrics(nodeId, getGlobalUniverseOptions());
  if (!globalMetrics?.node) {
    return false;
  }

  goToGlobalHome(false);
  return focusNode(nodeId, 30, true);
}

function resolveInfinityBuilderEventTargetElement(eventInput = null) {
  const rawTarget = eventInput?.target || null;
  if (rawTarget instanceof Element) {
    return rawTarget;
  }
  if (
    rawTarget
    && typeof rawTarget === 'object'
    && 'parentElement' in rawTarget
    && rawTarget.parentElement instanceof Element
  ) {
    return rawTarget.parentElement;
  }
  return null;
}

function buildInfinityBuilderBonusPanelSnapshot(homeNode = null) {
  const safeNodes = Array.isArray(state.nodes) ? state.nodes : [];
  const resolvedHomeNode = homeNode && typeof homeNode === 'object'
    ? homeNode
    : (resolveNodeById(resolvePreferredGlobalHomeNodeId()) || resolveNodeById('root') || null);
  const homeNodeIdKey = normalizeCredentialValue(
    safeText(resolvedHomeNode?.id || 'root'),
  );
  const homeGlobalNodeIdKey = normalizeCredentialValue(
    safeText(resolvePreferredGlobalHomeNodeId() || resolvedHomeNode?.id || 'root'),
  );
  const homeUsernameKey = normalizeCredentialValue(
    safeText(resolvedHomeNode?.username || resolvedHomeNode?.memberCode || '').replace(/^@+/, ''),
  );
  const rootKey = normalizeCredentialValue(LIVE_TREE_GLOBAL_ROOT_ID);
  const adminKey = normalizeCredentialValue(ADMIN_ROOT_USERNAME);
  const sponsorChildrenById = new Map();
  const sponsorChildrenByUsername = new Map();
  const directSeedNodes = [];

  for (const nodeInput of safeNodes) {
    const node = nodeInput && typeof nodeInput === 'object' ? nodeInput : null;
    if (!node) {
      continue;
    }
    const nodeIdKey = normalizeCredentialValue(safeText(node?.id));
    if (!nodeIdKey || nodeIdKey === 'root' || nodeIdKey === rootKey || nodeIdKey === adminKey) {
      continue;
    }
    if (isInfinityBuilderPlaceholderNode(node)) {
      continue;
    }
    const mappedSponsorIdKey = normalizeCredentialValue(
      safeText(node?.sponsorId || node?.globalSponsorId || ''),
    );
    const sourceSponsorIdKey = normalizeCredentialValue(
      safeText(node?.sourceSponsorId || node?.source_sponsor_id || ''),
    );
    if (mappedSponsorIdKey) {
      if (!sponsorChildrenById.has(mappedSponsorIdKey)) {
        sponsorChildrenById.set(mappedSponsorIdKey, []);
      }
      sponsorChildrenById.get(mappedSponsorIdKey).push(node);
    }
    const sponsorUsernameKey = normalizeCredentialValue(
      safeText(node?.sponsorUsername || node?.sponsor_username || '').replace(/^@+/, ''),
    );
    if (sponsorUsernameKey) {
      if (!sponsorChildrenByUsername.has(sponsorUsernameKey)) {
        sponsorChildrenByUsername.set(sponsorUsernameKey, []);
      }
      sponsorChildrenByUsername.get(sponsorUsernameKey).push(node);
    }
    if (!isInfinityBuilderQualifyingSeedNode(node, {
      mode: INFINITY_BUILDER_PANEL_MODE_INFINITY,
    })) {
      continue;
    }
    const directSponsorIdKey = sourceSponsorIdKey || mappedSponsorIdKey;
    const isDirectBySponsorId = Boolean(
      directSponsorIdKey
      && (
        (homeNodeIdKey && directSponsorIdKey === homeNodeIdKey)
        || (homeGlobalNodeIdKey && directSponsorIdKey === homeGlobalNodeIdKey)
      ),
    );
    const isDirectBySponsorUsername = Boolean(
      homeUsernameKey
      && sponsorUsernameKey
      && sponsorUsernameKey === homeUsernameKey,
    );
    if (isDirectBySponsorId || isDirectBySponsorUsername) {
      directSeedNodes.push(node);
    }
  }

  for (const [sponsorIdKey, childNodesInput] of sponsorChildrenById.entries()) {
    const childNodes = Array.isArray(childNodesInput) ? childNodesInput.slice() : [];
    childNodes.sort(compareInfinityBuilderNodesOldestToNewest);
    sponsorChildrenById.set(sponsorIdKey, childNodes);
  }
  for (const [sponsorUsernameKey, childNodesInput] of sponsorChildrenByUsername.entries()) {
    const childNodes = Array.isArray(childNodesInput) ? childNodesInput.slice() : [];
    childNodes.sort(compareInfinityBuilderNodesOldestToNewest);
    sponsorChildrenByUsername.set(sponsorUsernameKey, childNodes);
  }
  directSeedNodes.sort(compareInfinityBuilderNodesOldestToNewest);

  const computedTierCount = Math.max(
    INFINITY_BUILDER_MIN_VISIBLE_TIERS,
    Math.ceil(directSeedNodes.length / INFINITY_BUILDER_DIRECT_SPONSORS_PER_TIER) + 1,
  );
  const tierCount = clamp(
    computedTierCount,
    INFINITY_BUILDER_MIN_VISIBLE_TIERS,
    INFINITY_BUILDER_MAX_VISIBLE_TIERS,
  );
  const claimRecordMap = resolveInfinityBuilderClaimRecordMap(
    INFINITY_BUILDER_PANEL_MODE_INFINITY,
  );
  const tiers = [];
  for (let tierIndex = 0; tierIndex < tierCount; tierIndex += 1) {
    const tierNumber = tierIndex + 1;
    const tierSeedNodes = directSeedNodes.slice(
      tierIndex * INFINITY_BUILDER_DIRECT_SPONSORS_PER_TIER,
      (tierIndex + 1) * INFINITY_BUILDER_DIRECT_SPONSORS_PER_TIER,
    );
    const seedSnapshots = [];
    let completedSeedNodeCount = 0;
    for (let slotIndex = 0; slotIndex < INFINITY_BUILDER_DIRECT_SPONSORS_PER_TIER; slotIndex += 1) {
      const seedNode = tierSeedNodes[slotIndex] || null;
      if (!seedNode) {
        seedSnapshots.push(buildInfinityBuilderEmptySeedSnapshot(slotIndex, tierNumber));
        continue;
      }
      const seedNodeId = safeText(seedNode?.id);
      const seedNodeIdKey = normalizeCredentialValue(seedNodeId);
      const seedUsernameKey = normalizeCredentialValue(
        safeText(seedNode?.username || seedNode?.memberCode || '').replace(/^@+/, ''),
      );
      const rawChildCandidates = seedNodeIdKey && sponsorChildrenById.has(seedNodeIdKey)
        ? sponsorChildrenById.get(seedNodeIdKey)
        : (seedUsernameKey && sponsorChildrenByUsername.has(seedUsernameKey)
          ? sponsorChildrenByUsername.get(seedUsernameKey)
          : []);
      const childCandidates = Array.isArray(rawChildCandidates)
        ? rawChildCandidates
          .filter((childNode) => isInfinityBuilderQualifyingChildNode(childNode, {
            mode: INFINITY_BUILDER_PANEL_MODE_INFINITY,
          }))
          .slice()
          .sort(compareInfinityBuilderNodesOldestToNewest)
        : [];
      const childNodes = childCandidates.slice(0, INFINITY_BUILDER_TIER_NODE_REQUIREMENT);
      const childSnapshots = [];
      let completedChildCount = 0;
      for (let childIndex = 0; childIndex < INFINITY_BUILDER_TIER_NODE_REQUIREMENT; childIndex += 1) {
        const childNode = childNodes[childIndex] || null;
        if (!childNode) {
          childSnapshots.push(buildInfinityBuilderEmptyChildSnapshot(`tier-${tierNumber}:slot-${slotIndex}:${childIndex}`));
          continue;
        }
        const childDisplayName = safeText(
          childNode?.name
          || childNode?.username
          || childNode?.memberCode
          || childNode?.id
          || 'Member',
        ) || 'Member';
        const childUsername = resolveInfinityBuilderNodeUsername(childNode);
        const childNodeId = safeText(childNode?.id);
        const childActive = resolveNodeActivityState(childNode);
        if (childActive) {
          completedChildCount += 1;
        }
        childSnapshots.push({
          node: childNode,
          nodeId: childNodeId,
          username: childUsername,
          initials: resolveInitials(childDisplayName),
          isActive: childActive,
          backgroundImage: resolveInfinityBuilderNodeBackgroundImage(childNode, {
            active: childActive,
            fallbackSeed: `tier-${tierNumber}:slot-${slotIndex}:child-${childIndex}`,
          }),
        });
      }
      const seedDisplayName = safeText(
        seedNode?.name
        || seedNode?.username
        || seedNode?.memberCode
        || seedNodeId
        || 'Member',
      ) || 'Member';
      const seedUsername = resolveInfinityBuilderNodeUsername(seedNode);
      const seedActive = resolveNodeActivityState(seedNode);
      const isCompletedNode = seedActive && completedChildCount >= INFINITY_BUILDER_TIER_NODE_REQUIREMENT;
      if (isCompletedNode) {
        completedSeedNodeCount += 1;
      }
      const volumeMetrics = resolveNodeLegVolumes(seedNodeId);
      const totalOrganizationBv = Math.max(0, Math.floor(safeNumber(volumeMetrics?.totalVolume, 0)));
      const monthlyOverrideUsd = isCompletedNode
        ? Math.max(0, Math.round(totalOrganizationBv * INFINITY_BUILDER_TIER_OVERRIDE_RATE * 100) / 100)
        : 0;
      seedSnapshots.push({
        slotIndex,
        node: seedNode,
        nodeId: seedNodeId,
        displayName: seedDisplayName,
        username: seedUsername,
        initials: resolveInitials(seedDisplayName),
        isActive: seedActive,
        isCompletedNode,
        completedChildCount,
        totalOrganizationBv,
        monthlyOverrideUsd,
        weeklyOverrideUsd: monthlyOverrideUsd,
        backgroundImage: resolveInfinityBuilderNodeBackgroundImage(seedNode, {
          active: seedActive,
          fallbackSeed: `tier-${tierNumber}:slot-${slotIndex}`,
        }),
        childSnapshots,
      });
    }
    const directRequirementMet = tierSeedNodes.length >= INFINITY_BUILDER_DIRECT_SPONSORS_PER_TIER;
    const tierCompleted = directRequirementMet;
    const claimRecord = claimRecordMap.get(tierNumber) || null;
    const isClaimed = Boolean(safeText(claimRecord?.claimedAt));
    tiers.push({
      tierNumber,
      seedCount: tierSeedNodes.length,
      directRequirementMet,
      completedSeedNodeCount,
      isCompleted: tierCompleted,
      isUnlocked: false,
      isClaimed,
      claimRecord,
      tierBonusUsd: INFINITY_BUILDER_TIER_BONUS_USD,
      seedSnapshots,
    });
  }

  for (let tierIndex = 0; tierIndex < tiers.length; tierIndex += 1) {
    if (tierIndex === 0) {
      tiers[tierIndex].isUnlocked = true;
      continue;
    }
    const previousTier = tiers[tierIndex - 1];
    tiers[tierIndex].isUnlocked = Boolean(previousTier?.isUnlocked && previousTier?.isCompleted);
  }

  const completedTierCount = tiers.reduce((count, tier) => count + (tier.isCompleted ? 1 : 0), 0);
  const claimedTierCount = tiers.reduce((count, tier) => count + (tier.isClaimed ? 1 : 0), 0);
  const unlockedTierCount = tiers.reduce((count, tier) => count + (tier.isUnlocked ? 1 : 0), 0);
  const totalMonthlyOverrideUsd = tiers.reduce((sum, tier) => (
    sum + tier.seedSnapshots.reduce(
      (seedSum, seedSnapshot) => seedSum + Math.max(0, safeNumber(
        seedSnapshot?.monthlyOverrideUsd,
        safeNumber(seedSnapshot?.weeklyOverrideUsd, 0),
      )),
      0,
    )
  ), 0);
  const commissionBalances = resolveAccountOverviewCommissionBalances(resolvedHomeNode, {
    systemTotals: false,
  });
  const currentBalanceUsd = Math.max(0, safeNumber(commissionBalances?.infinityBuilder, 0));

  return {
    homeNode: resolvedHomeNode,
    tiers,
    directSeedCount: directSeedNodes.length,
    completedTierCount,
    claimedTierCount,
    unlockedTierCount,
    totalTierRewardUsd: completedTierCount * INFINITY_BUILDER_TIER_BONUS_USD,
    claimableTierRewardUsd: Math.max(0, (completedTierCount - claimedTierCount) * INFINITY_BUILDER_TIER_BONUS_USD),
    totalMonthlyOverrideUsd: Math.max(0, Math.round(totalMonthlyOverrideUsd * 100) / 100),
    totalWeeklyOverrideUsd: Math.max(0, Math.round(totalMonthlyOverrideUsd * 100) / 100),
    currentBalanceUsd,
  };
}

function buildLegacyLeadershipPanelSnapshot(homeNode = null) {
  const modeConfig = resolveInfinityBuilderPanelModeConfig(
    INFINITY_BUILDER_PANEL_MODE_LEGACY_LEADERSHIP,
  );
  const safeNodes = Array.isArray(state.nodes) ? state.nodes : [];
  const resolvedHomeNode = homeNode && typeof homeNode === 'object'
    ? homeNode
    : (resolveNodeById(resolvePreferredGlobalHomeNodeId()) || resolveNodeById('root') || null);
  const homeNodeIdKey = normalizeCredentialValue(
    safeText(resolvedHomeNode?.id || 'root'),
  );
  const homeGlobalNodeIdKey = normalizeCredentialValue(
    safeText(resolvePreferredGlobalHomeNodeId() || resolvedHomeNode?.id || 'root'),
  );
  const homeUsernameKey = normalizeCredentialValue(
    safeText(resolvedHomeNode?.username || resolvedHomeNode?.memberCode || '').replace(/^@+/, ''),
  );
  const rootKey = normalizeCredentialValue(LIVE_TREE_GLOBAL_ROOT_ID);
  const adminKey = normalizeCredentialValue(ADMIN_ROOT_USERNAME);
  const sponsorChildrenById = new Map();
  const sponsorChildrenByUsername = new Map();
  const directSeedNodes = [];

  const toNodeIdentityKey = (nodeInput = null) => normalizeCredentialValue(
    safeText(
      nodeInput?.id
      || nodeInput?.username
      || nodeInput?.memberCode
      || nodeInput?.member_code
      || '',
    ),
  );

  for (const nodeInput of safeNodes) {
    const node = nodeInput && typeof nodeInput === 'object' ? nodeInput : null;
    if (!node) {
      continue;
    }
    const nodeIdKey = normalizeCredentialValue(safeText(node?.id));
    if (!nodeIdKey || nodeIdKey === 'root' || nodeIdKey === rootKey || nodeIdKey === adminKey) {
      continue;
    }
    if (isInfinityBuilderPlaceholderNode(node)) {
      continue;
    }
    if (!isInfinityBuilderQualifyingChildNode(node, { mode: modeConfig.mode })) {
      continue;
    }
    const mappedSponsorIdKey = normalizeCredentialValue(
      safeText(node?.sponsorId || node?.globalSponsorId || ''),
    );
    const sourceSponsorIdKey = normalizeCredentialValue(
      safeText(node?.sourceSponsorId || node?.source_sponsor_id || ''),
    );
    if (mappedSponsorIdKey) {
      if (!sponsorChildrenById.has(mappedSponsorIdKey)) {
        sponsorChildrenById.set(mappedSponsorIdKey, []);
      }
      sponsorChildrenById.get(mappedSponsorIdKey).push(node);
    }
    const sponsorUsernameKey = normalizeCredentialValue(
      safeText(node?.sponsorUsername || node?.sponsor_username || '').replace(/^@+/, ''),
    );
    if (sponsorUsernameKey) {
      if (!sponsorChildrenByUsername.has(sponsorUsernameKey)) {
        sponsorChildrenByUsername.set(sponsorUsernameKey, []);
      }
      sponsorChildrenByUsername.get(sponsorUsernameKey).push(node);
    }
    if (!isInfinityBuilderQualifyingSeedNode(node, { mode: modeConfig.mode })) {
      continue;
    }
    const directSponsorIdKey = sourceSponsorIdKey || mappedSponsorIdKey;
    const isDirectBySponsorId = Boolean(
      directSponsorIdKey
      && (
        (homeNodeIdKey && directSponsorIdKey === homeNodeIdKey)
        || (homeGlobalNodeIdKey && directSponsorIdKey === homeGlobalNodeIdKey)
      ),
    );
    const isDirectBySponsorUsername = Boolean(
      homeUsernameKey
      && sponsorUsernameKey
      && sponsorUsernameKey === homeUsernameKey,
    );
    if (isDirectBySponsorId || isDirectBySponsorUsername) {
      directSeedNodes.push(node);
    }
  }

  for (const [sponsorIdKey, childNodesInput] of sponsorChildrenById.entries()) {
    const childNodes = Array.isArray(childNodesInput) ? childNodesInput.slice() : [];
    childNodes.sort(compareInfinityBuilderNodesOldestToNewest);
    sponsorChildrenById.set(sponsorIdKey, childNodes);
  }
  for (const [sponsorUsernameKey, childNodesInput] of sponsorChildrenByUsername.entries()) {
    const childNodes = Array.isArray(childNodesInput) ? childNodesInput.slice() : [];
    childNodes.sort(compareInfinityBuilderNodesOldestToNewest);
    sponsorChildrenByUsername.set(sponsorUsernameKey, childNodes);
  }
  directSeedNodes.sort(compareInfinityBuilderNodesOldestToNewest);

  const levelTwoCap = INFINITY_BUILDER_TIER_NODE_REQUIREMENT ** 2;
  const levelThreeCap = INFINITY_BUILDER_TIER_NODE_REQUIREMENT ** 3;
  const fullySeededTierCount = Math.floor(
    directSeedNodes.length / INFINITY_BUILDER_DIRECT_SPONSORS_PER_TIER,
  );
  const computedTierCount = Math.max(
    modeConfig.baseVisibleTierCount + modeConfig.previewLockedTierCount,
    fullySeededTierCount + 1 + modeConfig.previewLockedTierCount,
  );
  const tierCount = clamp(
    computedTierCount,
    modeConfig.baseVisibleTierCount,
    INFINITY_BUILDER_MAX_VISIBLE_TIERS,
  );

  const resolveChildCandidates = (nodeInput = null) => {
    const node = nodeInput && typeof nodeInput === 'object' ? nodeInput : null;
    if (!node) {
      return [];
    }
    const nodeIdKey = normalizeCredentialValue(safeText(node?.id));
    const nodeUsernameKey = normalizeCredentialValue(
      safeText(node?.username || node?.memberCode || '').replace(/^@+/, ''),
    );
    const rawCandidatesById = nodeIdKey && sponsorChildrenById.has(nodeIdKey)
      ? sponsorChildrenById.get(nodeIdKey)
      : [];
    const rawCandidatesByUsername = nodeUsernameKey && sponsorChildrenByUsername.has(nodeUsernameKey)
      ? sponsorChildrenByUsername.get(nodeUsernameKey)
      : [];
    const seenNodeKeys = new Set();
    const resolvedChildren = [];
    for (const candidateInput of [...rawCandidatesById, ...rawCandidatesByUsername]) {
      const candidate = candidateInput && typeof candidateInput === 'object'
        ? candidateInput
        : null;
      if (!candidate || !isInfinityBuilderQualifyingChildNode(candidate, { mode: modeConfig.mode })) {
        continue;
      }
      const candidateKey = toNodeIdentityKey(candidate);
      if (!candidateKey || seenNodeKeys.has(candidateKey)) {
        continue;
      }
      seenNodeKeys.add(candidateKey);
      resolvedChildren.push(candidate);
    }
    resolvedChildren.sort(compareInfinityBuilderNodesOldestToNewest);
    return resolvedChildren;
  };

  const buildLegacyChildSnapshot = (nodeInput = null, fallbackSeed = '', depthLevel = 1) => {
    const node = nodeInput && typeof nodeInput === 'object' ? nodeInput : null;
    if (!node) {
      return {
        node: null,
        nodeId: '',
        username: '',
        initials: '',
        isActive: false,
        depthLevel,
        backgroundImage: resolveInfinityBuilderNodeBackgroundImage(null, {
          active: true,
          fallbackSeed,
        }),
      };
    }
    const displayName = safeText(
      node?.name
      || node?.username
      || node?.memberCode
      || node?.id,
    );
    const nodeActive = resolveNodeActivityState(node);
    return {
      node,
      nodeId: safeText(node?.id),
      username: resolveInfinityBuilderNodeUsername(node),
      initials: displayName ? resolveInitials(displayName) : '',
      isActive: nodeActive,
      depthLevel,
      backgroundImage: resolveInfinityBuilderNodeBackgroundImage(node, {
        active: nodeActive,
        fallbackSeed,
      }),
    };
  };

  const buildLegacyEmptySeedSnapshot = (slotIndex = 0, tierNumber = 1) => ({
    slotIndex,
    node: null,
    nodeId: '',
    displayName: '',
    username: '',
    initials: '',
    isActive: false,
    isCompletedNode: false,
    completedChildCount: 0,
    totalOrganizationBv: 0,
    monthlyOverrideUsd: 0,
    weeklyOverrideUsd: 0,
    tierMappedNodeCount: 0,
    backgroundImage: resolveInfinityBuilderNodeBackgroundImage(null, {
      active: true,
      fallbackSeed: `legacy-seed-empty:tier-${tierNumber}:slot-${slotIndex}`,
    }),
    childSnapshots: Array.from(
      { length: INFINITY_BUILDER_TIER_NODE_REQUIREMENT },
      (_, childIndex) => buildLegacyChildSnapshot(
        null,
        `legacy-child-empty:tier-${tierNumber}:slot-${slotIndex}:${childIndex}`,
        1,
      ),
    ),
    depthTwoSnapshots: Array.from(
      { length: levelTwoCap },
      (_, childIndex) => buildLegacyChildSnapshot(
        null,
        `legacy-depth-two-empty:tier-${tierNumber}:slot-${slotIndex}:${childIndex}`,
        2,
      ),
    ),
    depthTwoGroupSnapshots: Array.from(
      { length: INFINITY_BUILDER_TIER_NODE_REQUIREMENT },
      (_, groupIndex) => Array.from(
        { length: INFINITY_BUILDER_TIER_NODE_REQUIREMENT },
        (_, childIndex) => buildLegacyChildSnapshot(
          null,
          `legacy-depth-two-empty-group:tier-${tierNumber}:slot-${slotIndex}:${groupIndex}:${childIndex}`,
          2,
        ),
      ),
    ),
    depthThreeSnapshots: Array.from(
      { length: levelThreeCap },
      (_, childIndex) => buildLegacyChildSnapshot(
        null,
        `legacy-depth-three-empty:tier-${tierNumber}:slot-${slotIndex}:${childIndex}`,
        3,
      ),
    ),
    depthThreeGroupSnapshots: Array.from(
      { length: levelTwoCap },
      (_, groupIndex) => Array.from(
        { length: INFINITY_BUILDER_TIER_NODE_REQUIREMENT },
        (_, childIndex) => buildLegacyChildSnapshot(
          null,
          `legacy-depth-three-empty-group:tier-${tierNumber}:slot-${slotIndex}:${groupIndex}:${childIndex}`,
          3,
        ),
      ),
    ),
  });

  const claimRecordMap = resolveInfinityBuilderClaimRecordMap(modeConfig.mode);
  const tiers = [];
  for (let tierIndex = 0; tierIndex < tierCount; tierIndex += 1) {
    const tierNumber = tierIndex + 1;
    const tierSeedNodes = directSeedNodes.slice(
      tierIndex * INFINITY_BUILDER_DIRECT_SPONSORS_PER_TIER,
      (tierIndex + 1) * INFINITY_BUILDER_DIRECT_SPONSORS_PER_TIER,
    );
    const seedSnapshots = [];
    let tierQualifiedNodeCount = 0;
    for (let slotIndex = 0; slotIndex < INFINITY_BUILDER_DIRECT_SPONSORS_PER_TIER; slotIndex += 1) {
      const seedNode = tierSeedNodes[slotIndex] || null;
      if (!seedNode) {
        seedSnapshots.push(buildLegacyEmptySeedSnapshot(slotIndex, tierNumber));
        continue;
      }
      const levelOneNodes = resolveChildCandidates(seedNode).slice(
        0,
        INFINITY_BUILDER_TIER_NODE_REQUIREMENT,
      );
      const levelTwoNodeGroups = Array.from(
        { length: INFINITY_BUILDER_TIER_NODE_REQUIREMENT },
        () => [],
      );
      for (
        let levelOneIndex = 0;
        levelOneIndex < INFINITY_BUILDER_TIER_NODE_REQUIREMENT;
        levelOneIndex += 1
      ) {
        const levelOneNode = levelOneNodes[levelOneIndex] || null;
        if (!levelOneNode) {
          continue;
        }
        levelTwoNodeGroups[levelOneIndex] = resolveChildCandidates(levelOneNode).slice(
          0,
          INFINITY_BUILDER_TIER_NODE_REQUIREMENT,
        );
      }
      const levelTwoNodes = levelTwoNodeGroups.flat().slice(0, levelTwoCap);
      const levelThreeNodeGroups = Array.from({ length: levelTwoCap }, () => []);
      for (let levelTwoIndex = 0; levelTwoIndex < levelTwoCap; levelTwoIndex += 1) {
        const levelTwoNode = levelTwoNodes[levelTwoIndex] || null;
        if (!levelTwoNode) {
          continue;
        }
        levelThreeNodeGroups[levelTwoIndex] = resolveChildCandidates(levelTwoNode).slice(
          0,
          INFINITY_BUILDER_TIER_NODE_REQUIREMENT,
        );
      }
      const levelThreeNodes = levelThreeNodeGroups.flat().slice(0, levelThreeCap);

      const levelOneSnapshots = Array.from(
        { length: INFINITY_BUILDER_TIER_NODE_REQUIREMENT },
        (_, childIndex) => buildLegacyChildSnapshot(
          levelOneNodes[childIndex] || null,
          `legacy-child:tier-${tierNumber}:slot-${slotIndex}:${childIndex}`,
          1,
        ),
      );
      const levelTwoSnapshots = Array.from(
        { length: levelTwoCap },
        (_, childIndex) => buildLegacyChildSnapshot(
          levelTwoNodes[childIndex] || null,
          `legacy-depth-two:tier-${tierNumber}:slot-${slotIndex}:${childIndex}`,
          2,
        ),
      );
      const levelTwoGroupSnapshots = Array.from(
        { length: INFINITY_BUILDER_TIER_NODE_REQUIREMENT },
        (_, groupIndex) => Array.from(
          { length: INFINITY_BUILDER_TIER_NODE_REQUIREMENT },
          (_, childIndex) => buildLegacyChildSnapshot(
            levelTwoNodeGroups[groupIndex]?.[childIndex] || null,
            `legacy-depth-two-group:tier-${tierNumber}:slot-${slotIndex}:${groupIndex}:${childIndex}`,
            2,
          ),
        ),
      );
      const levelThreeSnapshots = Array.from(
        { length: levelThreeCap },
        (_, childIndex) => buildLegacyChildSnapshot(
          levelThreeNodes[childIndex] || null,
          `legacy-depth-three:tier-${tierNumber}:slot-${slotIndex}:${childIndex}`,
          3,
        ),
      );
      const levelThreeGroupSnapshots = Array.from(
        { length: levelTwoCap },
        (_, groupIndex) => Array.from(
          { length: INFINITY_BUILDER_TIER_NODE_REQUIREMENT },
          (_, childIndex) => buildLegacyChildSnapshot(
            levelThreeNodeGroups[groupIndex]?.[childIndex] || null,
            `legacy-depth-three-group:tier-${tierNumber}:slot-${slotIndex}:${groupIndex}:${childIndex}`,
            3,
          ),
        ),
      );

      const seedNodeId = safeText(seedNode?.id);
      const seedDisplayName = safeText(
        seedNode?.name
        || seedNode?.username
        || seedNode?.memberCode
        || seedNodeId,
      );
      const seedActive = resolveNodeActivityState(seedNode);
      const seedMappedNodeCount = (
        1
        + levelOneNodes.length
        + levelTwoNodes.length
        + levelThreeNodes.length
      );
      tierQualifiedNodeCount += seedMappedNodeCount;
      seedSnapshots.push({
        slotIndex,
        node: seedNode,
        nodeId: seedNodeId,
        displayName: seedDisplayName,
        username: resolveInfinityBuilderNodeUsername(seedNode),
        initials: seedDisplayName ? resolveInitials(seedDisplayName) : '',
        isActive: seedActive,
        isCompletedNode: false,
        completedChildCount: levelOneNodes.length,
        totalOrganizationBv: seedMappedNodeCount,
        monthlyOverrideUsd: 0,
        weeklyOverrideUsd: 0,
        tierMappedNodeCount: seedMappedNodeCount,
        backgroundImage: resolveInfinityBuilderNodeBackgroundImage(seedNode, {
          active: seedActive,
          fallbackSeed: `legacy-seed:tier-${tierNumber}:slot-${slotIndex}`,
        }),
        childSnapshots: levelOneSnapshots,
        depthTwoSnapshots: levelTwoSnapshots,
        depthTwoGroupSnapshots: levelTwoGroupSnapshots,
        depthThreeSnapshots: levelThreeSnapshots,
        depthThreeGroupSnapshots: levelThreeGroupSnapshots,
      });
    }

    const directRequirementMet = tierSeedNodes.length >= INFINITY_BUILDER_DIRECT_SPONSORS_PER_TIER;
    const downlineNodeCap = Math.max(0, modeConfig.totalNodesPerTier - 1);
    const cappedQualifiedNodeCount = Math.min(downlineNodeCap, tierQualifiedNodeCount);
    const effectiveQualifiedNodeCount = directRequirementMet
      ? cappedQualifiedNodeCount
      : Math.min(cappedQualifiedNodeCount, tierSeedNodes.length);
    // Legacy tier view is a 40-node map that includes the home/root node.
    const baseRootNodeCount = resolvedHomeNode ? 1 : 0;
    const tierProgressCount = Math.min(
      modeConfig.totalNodesPerTier,
      baseRootNodeCount + effectiveQualifiedNodeCount,
    );
    const tierCompleted = directRequirementMet && tierProgressCount >= modeConfig.totalNodesPerTier;
    const claimRecord = claimRecordMap.get(tierNumber) || null;
    const isClaimed = Boolean(safeText(claimRecord?.claimedAt));
    const completedSeedNodeCount = seedSnapshots.reduce(
      (count, seedSnapshot) => count + (seedSnapshot?.node ? 1 : 0),
      0,
    );
    tiers.push({
      tierNumber,
      seedCount: tierSeedNodes.length,
      directRequirementMet,
      completedSeedNodeCount,
      isCompleted: tierCompleted,
      isUnlocked: false,
      isClaimed,
      claimRecord,
      tierBonusUsd: Math.max(
        0,
        safeNumber(claimRecord?.amount, LEGACY_LEADERSHIP_TIER_BONUS_USD),
      ),
      tierProgressCount,
      totalNodeRequirement: modeConfig.totalNodesPerTier,
      litNodeCount: tierProgressCount,
      seedSnapshots,
    });
  }

  for (let tierIndex = 0; tierIndex < tiers.length; tierIndex += 1) {
    const isBaseVisibleTier = tierIndex < modeConfig.baseVisibleTierCount;
    if (tierIndex === 0) {
      tiers[tierIndex].isUnlocked = true;
      continue;
    }
    const previousTier = tiers[tierIndex - 1];
    const unlockedByProgress = modeConfig.unlockByDirectRequirement
      ? Boolean(previousTier?.isUnlocked && previousTier?.directRequirementMet)
      : Boolean(previousTier?.isUnlocked && previousTier?.isCompleted);
    tiers[tierIndex].isUnlocked = isBaseVisibleTier || unlockedByProgress;
  }

  const completedTierCount = tiers.reduce((count, tier) => count + (tier.isCompleted ? 1 : 0), 0);
  const claimedTierCount = tiers.reduce((count, tier) => count + (tier.isClaimed ? 1 : 0), 0);
  const unlockedTierCount = tiers.reduce((count, tier) => count + (tier.isUnlocked ? 1 : 0), 0);
  const totalTierRewardUsd = tiers.reduce(
    (sum, tier) => sum + (tier?.isCompleted ? Math.max(0, safeNumber(tier?.tierBonusUsd, 0)) : 0),
    0,
  );
  const claimableTierRewardUsd = tiers.reduce(
    (sum, tier) => sum + (
      tier?.isCompleted && !tier?.isClaimed
        ? Math.max(0, safeNumber(tier?.tierBonusUsd, 0))
        : 0
    ),
    0,
  );
  const commissionBalances = resolveAccountOverviewCommissionBalances(resolvedHomeNode, {
    systemTotals: false,
  });
  const currentBalanceUsd = Math.max(0, safeNumber(commissionBalances?.legacyBuilder, 0));

  return {
    homeNode: resolvedHomeNode,
    tiers,
    directSeedCount: directSeedNodes.length,
    completedTierCount,
    claimedTierCount,
    unlockedTierCount,
    totalTierRewardUsd,
    claimableTierRewardUsd,
    totalMonthlyOverrideUsd: 0,
    totalWeeklyOverrideUsd: 0,
    currentBalanceUsd,
    totalNodeRequirement: modeConfig.totalNodesPerTier,
  };
}

function buildInfinityBuilderPanelSnapshot(homeNode = null) {
  if (isLegacyLeadershipPanelMode()) {
    return buildLegacyLeadershipPanelSnapshot(homeNode);
  }
  return buildInfinityBuilderBonusPanelSnapshot(homeNode);
}

function syncInfinityBuilderPanelPosition(layoutInput = state.layout) {
  if (!isInfinityBuilderPanelAvailable()) {
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

  infinityBuilderPanelElement.style.setProperty('--tree-next-infinity-builder-left', `${clampedLeft}px`);
  infinityBuilderPanelElement.style.setProperty('--tree-next-infinity-builder-top', `${clampedTop}px`);
  infinityBuilderPanelElement.style.setProperty('--tree-next-infinity-builder-width', `${panelWidth}px`);
  infinityBuilderPanelElement.style.setProperty('--tree-next-infinity-builder-height', `${clampedHeight}px`);
  infinityBuilderPanelElement.classList.remove('is-positioning');
}

function syncInfinityBuilderPanelVisuals() {
  if (!isInfinityBuilderPanelAvailable() || !Boolean(state.ui?.infinityBuilderVisible)) {
    return;
  }
  const modeConfig = resolveInfinityBuilderPanelModeConfig();
  const isLegacyMode = modeConfig.mode === INFINITY_BUILDER_PANEL_MODE_LEGACY_LEADERSHIP;
  const overviewContext = resolveAccountOverviewPanelContext();
  const homeNode = overviewContext?.homeNode || resolveNodeById('root');
  maybeRefreshAccountOverviewRemoteSnapshot(homeNode, {
    scope: overviewContext?.scope,
    preferHomeNodeIdentity: overviewContext?.preferHomeNodeIdentity,
  });
  const snapshot = buildInfinityBuilderPanelSnapshot(homeNode);
  if (!Array.isArray(snapshot?.tiers) || snapshot.tiers.length === 0) {
    syncInfinityBuilderViewTreeButtonState({ isLegacyMode });
    return;
  }
  infinityBuilderLastPanelSnapshot = snapshot;
  const selectedTier = resolveInfinityBuilderSelectedTierFromSnapshot(snapshot);
  if (!selectedTier) {
    syncInfinityBuilderViewTreeButtonState({ isLegacyMode });
    return;
  }
  if (selectedTier.tierNumber !== infinityBuilderSelectedTierNumber) {
    infinityBuilderSelectedTierNumber = selectedTier.tierNumber;
  }
  if (!isLegacyMode && isLegacyTierCanvasViewActive()) {
    closeLegacyTierCanvasView({ preserveSelection: true });
  } else if (
    isLegacyMode
    && isLegacyTierCanvasViewActive()
    && !legacyTierCanvasViewState.tierSwitchInFlight
  ) {
    syncLegacyTierCanvasViewModel(snapshot, selectedTier);
  }

  const tiersSignature = snapshot.tiers.map((tier) => [
    tier.tierNumber,
    tier.isUnlocked ? '1' : '0',
    tier.isCompleted ? '1' : '0',
    tier.isClaimed ? '1' : '0',
    tier.seedCount,
    tier.completedSeedNodeCount,
    tier.seedSnapshots.map((seedSnapshot) => {
      if (!seedSnapshot?.node) {
        return 'empty';
      }
      return [
        safeText(seedSnapshot.nodeId),
        seedSnapshot.isActive ? '1' : '0',
        seedSnapshot.isCompletedNode ? '1' : '0',
        seedSnapshot.completedChildCount,
        Math.floor(safeNumber(seedSnapshot.totalOrganizationBv, 0)),
      ].join(':');
    }).join(','),
  ].join('|')).join('~');
  const renderSignature = [
    safeText(state.liveSync?.lastAppliedHash || ''),
    modeConfig.mode,
    accountOverviewRemoteDataVersion,
    infinityBuilderSelectedTierNumber,
    resolveInfinityBuilderTierSortDirectionForMode(INFINITY_BUILDER_PANEL_MODE_INFINITY),
    resolveInfinityBuilderTierSortDirectionForMode(INFINITY_BUILDER_PANEL_MODE_LEGACY_LEADERSHIP),
    snapshot.directSeedCount,
    snapshot.completedTierCount,
    snapshot.claimedTierCount,
    snapshot.totalTierRewardUsd.toFixed(2),
    snapshot.currentBalanceUsd.toFixed(2),
    safeNumber(snapshot.totalMonthlyOverrideUsd, snapshot.totalWeeklyOverrideUsd).toFixed(2),
    tiersSignature,
  ].join('::');
  if (renderSignature === infinityBuilderLastRenderSignature) {
    return;
  }
  infinityBuilderLastRenderSignature = renderSignature;

  if (infinityBuilderBreadcrumbCurrentElement instanceof HTMLElement) {
    infinityBuilderBreadcrumbCurrentElement.textContent = modeConfig.panelTitle;
  }
  if (infinityBuilderTitleElement instanceof HTMLElement) {
    infinityBuilderTitleElement.textContent = modeConfig.panelTitle;
  }
  if (infinityBuilderCopyElement instanceof HTMLElement) {
    infinityBuilderCopyElement.innerHTML = modeConfig.panelCopyHtml;
  }

  if (infinityBuilderTierTitleElement instanceof HTMLElement) {
    infinityBuilderTierTitleElement.textContent = `${modeConfig.tierLabelPrefix} ${selectedTier.tierNumber}`;
  }
  if (infinityBuilderTierSubtitleElement instanceof HTMLElement) {
    const previousTierNumber = Math.max(1, selectedTier.tierNumber - 1);
    const remainingSeeds = Math.max(0, INFINITY_BUILDER_DIRECT_SPONSORS_PER_TIER - selectedTier.seedCount);
    const tierProgressCount = Math.max(
      0,
      Math.floor(safeNumber(
        selectedTier?.tierProgressCount,
        safeNumber(selectedTier?.litNodeCount, selectedTier.seedCount),
      )),
    );
    const totalNodeRequirement = Math.max(
      0,
      Math.floor(safeNumber(
        selectedTier?.totalNodeRequirement,
        safeNumber(snapshot?.totalNodeRequirement, modeConfig.totalNodesPerTier),
      )),
    );
    if (!selectedTier.isUnlocked) {
      infinityBuilderTierSubtitleElement.textContent = (
        `Tier ${selectedTier.tierNumber} unlocks after Tier ${previousTierNumber} reaches `
        + `${INFINITY_BUILDER_DIRECT_SPONSORS_PER_TIER} ${modeConfig.directSeedLabel}.`
      );
    } else if (selectedTier.isCompleted) {
      if (isLegacyMode) {
        infinityBuilderTierSubtitleElement.textContent = selectedTier.isClaimed
          ? 'Tier completed and claimed. One-time reward archived.'
          : 'Tier completed. One-time reward is ready to claim.';
      } else {
        infinityBuilderTierSubtitleElement.textContent = (
          selectedTier.isClaimed
            ? 'Tier completed and claimed. Monthly 1% bonuses remain active per qualified member.'
            : 'Tier completed. Monthly 1% bonuses are active per qualified member.'
        );
      }
    } else if (isLegacyMode) {
      if (!selectedTier.directRequirementMet) {
        infinityBuilderTierSubtitleElement.textContent = (
          `${selectedTier.seedCount}/${INFINITY_BUILDER_DIRECT_SPONSORS_PER_TIER} Legacy enrollments completed. `
          + (remainingSeeds > 0
            ? `Enroll ${remainingSeeds} more Legacy member${remainingSeeds === 1 ? '' : 's'} to continue.`
            : 'Direct requirement met.')
        );
      } else {
        infinityBuilderTierSubtitleElement.textContent = '';
      }
    } else {
      infinityBuilderTierSubtitleElement.textContent = (
        `${selectedTier.seedCount}/${INFINITY_BUILDER_DIRECT_SPONSORS_PER_TIER} Infinity/Legacy enrollments completed. `
        + (remainingSeeds > 0
          ? `Enroll ${remainingSeeds} more to complete this tier.`
          : 'Tier enrollment requirement met.')
      );
    }
  }
  const selectedTierRewardUsd = Math.max(
    0,
    safeNumber(
      selectedTier?.tierBonusUsd,
      isLegacyMode ? LEGACY_LEADERSHIP_TIER_BONUS_USD : INFINITY_BUILDER_TIER_BONUS_USD,
    ),
  );
  if (infinityBuilderTierBonusElement instanceof HTMLElement) {
    const selectedTierMonthlyOverrideUsd = selectedTier.seedSnapshots.reduce(
      (sum, seedSnapshot) => sum + Math.max(0, safeNumber(
        seedSnapshot?.monthlyOverrideUsd,
        safeNumber(seedSnapshot?.weeklyOverrideUsd, 0),
      )),
      0,
    );
    if (!selectedTier.isUnlocked) {
      infinityBuilderTierBonusElement.textContent = `Tier reward: ${formatEnrollCurrency(selectedTierRewardUsd)} (locked)`;
    } else if (selectedTier.isClaimed) {
      infinityBuilderTierBonusElement.textContent = `Tier reward claimed: ${formatEnrollCurrency(selectedTierRewardUsd)} USD`;
    } else if (selectedTier.isCompleted) {
      if (isLegacyMode) {
        infinityBuilderTierBonusElement.textContent = (
          `Tier completed: ${formatEnrollCurrency(selectedTierRewardUsd)} USD one-time reward ready`
        );
      } else {
        infinityBuilderTierBonusElement.textContent = (
          `Tier completed: ${formatEnrollCurrency(selectedTierRewardUsd)} USD ready `
          + `| Active monthly 1% total: ${formatEnrollCurrency(selectedTierMonthlyOverrideUsd)}`
        );
      }
    } else {
      const tierProgressCount = Math.max(
        0,
        Math.floor(safeNumber(
          selectedTier?.tierProgressCount,
          safeNumber(selectedTier?.litNodeCount, selectedTier.seedCount),
        )),
      );
      const totalNodeRequirement = Math.max(
        0,
        Math.floor(safeNumber(
          selectedTier?.totalNodeRequirement,
          safeNumber(snapshot?.totalNodeRequirement, modeConfig.totalNodesPerTier),
        )),
      );
      infinityBuilderTierBonusElement.textContent = isLegacyMode
        ? `Tier progress: ${tierProgressCount}/${totalNodeRequirement} mapped Legacy nodes`
        : `Tier reward: ${formatEnrollCurrency(selectedTierRewardUsd)} USD`;
    }
  }
  if (infinityBuilderClaimButtonElement instanceof HTMLButtonElement) {
    const claimAmountLabel = formatEnrollCurrency(selectedTierRewardUsd);
    if (infinityBuilderClaimInFlight) {
      infinityBuilderClaimButtonElement.disabled = true;
      infinityBuilderClaimButtonElement.textContent = 'Claiming...';
    } else if (!selectedTier.isUnlocked) {
      infinityBuilderClaimButtonElement.disabled = true;
      infinityBuilderClaimButtonElement.textContent = `Claim ${claimAmountLabel} Tier Reward`;
    } else if (selectedTier.isClaimed) {
      infinityBuilderClaimButtonElement.disabled = true;
      infinityBuilderClaimButtonElement.textContent = 'Tier Reward Claimed';
    } else if (selectedTier.isCompleted) {
      infinityBuilderClaimButtonElement.disabled = false;
      infinityBuilderClaimButtonElement.textContent = `Claim ${claimAmountLabel} Tier Reward`;
    } else {
      infinityBuilderClaimButtonElement.disabled = true;
      infinityBuilderClaimButtonElement.textContent = `Claim ${claimAmountLabel} Tier Reward`;
    }
  }
  syncInfinityBuilderViewTreeButtonState({
    isLegacyMode,
    tierNumber: selectedTier?.tierNumber,
  });
  if (infinityBuilderClaimFeedbackElement instanceof HTMLElement) {
    if (!infinityBuilderClaimInFlight && infinityBuilderClaimFeedbackTierNumber !== selectedTier.tierNumber) {
      setInfinityBuilderClaimFeedback('');
    }
  }

  if (infinityBuilderTierGridElement instanceof HTMLElement) {
    infinityBuilderTierGridElement.innerHTML = '';
    const tierFragment = document.createDocumentFragment();
    for (const seedSnapshot of selectedTier.seedSnapshots) {
      const seedCard = document.createElement('article');
      seedCard.className = 'tree-next-infinity-builder-node-card';
      if (isLegacyMode) {
        seedCard.classList.add('is-legacy-mode');
      }
      const seedCore = document.createElement('div');
      seedCore.className = 'tree-next-infinity-builder-node-core';
      if (!seedSnapshot.node) {
        seedCore.classList.add('is-empty');
      } else if (!seedSnapshot.isActive) {
        seedCore.classList.add('is-inactive');
      }
      seedCore.style.backgroundImage = safeText(seedSnapshot.backgroundImage);
      seedCore.textContent = seedSnapshot.node
        ? resolveInfinityBuilderNodeInitials(seedSnapshot.initials || '')
        : '';
      if (seedSnapshot.node) {
        const seedNodeId = resolveInfinityBuilderFocusNodeId(seedSnapshot.node, {
          nodeId: seedSnapshot.nodeId,
          username: seedSnapshot.username,
        });
        if (seedNodeId) {
          seedCore.dataset.infinityBuilderFocusNodeId = seedNodeId;
          seedCore.classList.add('is-focusable');
          seedCore.tabIndex = 0;
          seedCore.setAttribute('role', 'button');
        }
        const seedLabel = safeText(seedSnapshot.username || seedSnapshot.displayName || '');
        if (seedLabel) {
          seedCore.title = seedLabel;
        }
      }

      const branchElement = document.createElement('div');
      branchElement.className = 'tree-next-infinity-builder-node-branch';
      const childRow = document.createElement('div');
      childRow.className = 'tree-next-infinity-builder-node-children';
      for (const childSnapshot of seedSnapshot.childSnapshots) {
        const childItem = document.createElement('span');
        childItem.className = 'tree-next-infinity-builder-node-child-item';
        const childDot = document.createElement('span');
        childDot.className = 'tree-next-infinity-builder-node-child';
        if (!childSnapshot.node) {
          childDot.classList.add('is-empty');
        } else if (!childSnapshot.isActive) {
          childDot.classList.add('is-inactive');
        }
        childDot.style.backgroundImage = safeText(childSnapshot.backgroundImage);
        childDot.textContent = childSnapshot.node
          ? resolveInfinityBuilderNodeInitials(childSnapshot.initials || '')
          : '';
        if (childSnapshot.node) {
          const childNodeId = resolveInfinityBuilderFocusNodeId(childSnapshot.node, {
            nodeId: childSnapshot.nodeId,
            username: childSnapshot.username,
          });
          if (childNodeId) {
            childDot.dataset.infinityBuilderFocusNodeId = childNodeId;
            childDot.classList.add('is-focusable');
            childDot.tabIndex = 0;
            childDot.setAttribute('role', 'button');
            childItem.dataset.infinityBuilderFocusNodeId = childNodeId;
            childItem.classList.add('is-focusable');
          }
          const childLabel = safeText(childSnapshot.username || '');
          if (childLabel) {
            childDot.title = childLabel;
          }
        }

        childItem.append(childDot);
        childRow.append(childItem);
      }

      let bvElement = null;
      let payoutElement = null;
      let usernameElement = null;
      let statusElement = null;
      if (!isLegacyMode) {
        bvElement = document.createElement('p');
        bvElement.className = 'tree-next-infinity-builder-node-bv';
        bvElement.textContent = formatVolumeValue(seedSnapshot.totalOrganizationBv);

        payoutElement = document.createElement('p');
        payoutElement.className = 'tree-next-infinity-builder-node-payout';
        payoutElement.textContent = `${formatEnrollCurrency(safeNumber(
          seedSnapshot.monthlyOverrideUsd,
          seedSnapshot.weeklyOverrideUsd,
        ))} / month`;

        usernameElement = document.createElement('p');
        usernameElement.className = 'tree-next-infinity-builder-node-username';
        usernameElement.textContent = safeText(seedSnapshot.node ? seedSnapshot.username : '');
        if (!usernameElement.textContent) {
          usernameElement.hidden = true;
        }

        statusElement = document.createElement('p');
        statusElement.className = 'tree-next-infinity-builder-node-status';
        if (!seedSnapshot.node) {
          statusElement.textContent = '';
        } else if (!selectedTier.directRequirementMet) {
          const tierSeedsNeeded = Math.max(0, INFINITY_BUILDER_DIRECT_SPONSORS_PER_TIER - selectedTier.seedCount);
          statusElement.textContent = tierSeedsNeeded > 0
            ? `Need ${tierSeedsNeeded} more enrollment${tierSeedsNeeded === 1 ? '' : 's'}`
            : 'Waiting for enrollment completion';
        } else if (!seedSnapshot.isActive) {
          statusElement.textContent = 'Account inactive';
        } else if (seedSnapshot.isCompletedNode) {
          statusElement.textContent = '1% monthly active';
        } else {
          const remainingChildren = Math.max(0, INFINITY_BUILDER_TIER_NODE_REQUIREMENT - seedSnapshot.completedChildCount);
          statusElement.textContent = `Need ${remainingChildren} active enrollment${remainingChildren === 1 ? '' : 's'} for 1%`;
        }
      }

      seedCard.append(seedCore, branchElement, childRow);
      if (!isLegacyMode) {
        seedCard.append(bvElement, payoutElement, usernameElement, statusElement);
      }
      tierFragment.append(seedCard);
    }
    infinityBuilderTierGridElement.append(tierFragment);
  }

  if (infinityBuilderCurrentListElement instanceof HTMLElement) {
    if (infinityBuilderCurrentSortElement instanceof HTMLButtonElement) {
      const tierSortDirection = resolveInfinityBuilderTierSortDirectionForMode(infinityBuilderPanelMode);
      const sortLabel = resolveInfinityBuilderTierSortLabel(tierSortDirection);
      infinityBuilderCurrentSortElement.textContent = sortLabel;
      infinityBuilderCurrentSortElement.setAttribute('aria-label', `${sortLabel}. Tap to toggle.`);
      infinityBuilderCurrentSortElement.setAttribute(
        'aria-pressed',
        tierSortDirection === 'desc' ? 'true' : 'false',
      );
    }
    const tierSortDirection = resolveInfinityBuilderTierSortDirectionForMode(infinityBuilderPanelMode);
    const sortedTiers = Array.isArray(snapshot?.tiers)
      ? snapshot.tiers.slice().sort((leftTier, rightTier) => {
        const leftTierNumber = Math.max(0, Math.floor(safeNumber(leftTier?.tierNumber, 0)));
        const rightTierNumber = Math.max(0, Math.floor(safeNumber(rightTier?.tierNumber, 0)));
        return tierSortDirection === 'desc'
          ? (rightTierNumber - leftTierNumber)
          : (leftTierNumber - rightTierNumber);
      })
      : [];
    infinityBuilderCurrentListElement.innerHTML = '';
    const listFragment = document.createDocumentFragment();
    for (const tier of sortedTiers) {
      const rowButton = document.createElement('button');
      rowButton.type = 'button';
      rowButton.className = 'tree-next-infinity-builder-current-item';
      if (tier.tierNumber === infinityBuilderSelectedTierNumber) {
        rowButton.classList.add('is-active');
      }
      rowButton.dataset.infinityBuilderTier = String(tier.tierNumber);
      rowButton.setAttribute('aria-pressed', tier.tierNumber === infinityBuilderSelectedTierNumber ? 'true' : 'false');
      rowButton.setAttribute('aria-label', `${modeConfig.currentAriaLabelPrefix} ${tier.tierNumber}`);

      const row = document.createElement('div');
      row.className = 'tree-next-infinity-builder-current-row';

      const tierLabel = document.createElement('p');
      tierLabel.className = 'tree-next-infinity-builder-current-tier';
      tierLabel.textContent = `Tier ${tier.tierNumber}`;

      const seedList = document.createElement('div');
      seedList.className = 'tree-next-infinity-builder-current-seeds';
      for (const seedSnapshot of tier.seedSnapshots) {
        const seedEntry = document.createElement('span');
        seedEntry.className = 'tree-next-infinity-builder-current-seed-entry';
        const seedDot = document.createElement('span');
        seedDot.className = 'tree-next-infinity-builder-current-seed';
        const seedInitials = resolveInfinityBuilderNodeInitials(seedSnapshot.initials || '');
        if (!seedSnapshot?.node) {
          seedDot.classList.add('is-empty');
          seedDot.textContent = '';
        } else if (!seedSnapshot.isActive) {
          seedDot.classList.add('is-inactive');
          seedDot.textContent = seedInitials;
        } else {
          seedDot.textContent = seedInitials;
        }
        seedDot.style.backgroundImage = safeText(seedSnapshot.backgroundImage);
        if (seedSnapshot?.node) {
          const seedNodeId = resolveInfinityBuilderFocusNodeId(seedSnapshot.node, {
            nodeId: seedSnapshot.nodeId,
            username: seedSnapshot.username,
          });
          if (seedNodeId) {
            seedDot.dataset.infinityBuilderFocusNodeId = seedNodeId;
            seedDot.classList.add('is-focusable');
            seedEntry.dataset.infinityBuilderFocusNodeId = seedNodeId;
            seedEntry.classList.add('is-focusable');
          }
          const seedLabel = safeText(seedSnapshot.username || seedSnapshot.displayName || '');
          if (seedLabel) {
            seedDot.title = seedLabel;
          }
        }
        if (isLegacyMode) {
          seedEntry.append(seedDot);
        } else {
          const seedHandle = document.createElement('span');
          seedHandle.className = 'tree-next-infinity-builder-current-seed-handle';
          seedHandle.textContent = seedSnapshot?.node ? safeText(seedSnapshot.username || '') : '';
          if (!seedHandle.textContent) {
            seedHandle.hidden = true;
          }
          seedEntry.append(seedDot, seedHandle);
        }
        seedList.append(seedEntry);
      }

      if (isLegacyMode) {
        const rowProgress = document.createElement('p');
        rowProgress.className = 'tree-next-infinity-builder-current-progress';
        const rowRequirementCount = Math.max(
          1,
          Math.floor(safeNumber(tier?.totalNodeRequirement, modeConfig.totalNodesPerTier)),
        );
        const rowMappedCount = Math.max(
          0,
          Math.floor(safeNumber(
            tier?.tierProgressCount,
            safeNumber(tier?.litNodeCount, tier?.seedCount),
          )),
        );
        rowProgress.textContent = `${Math.min(rowMappedCount, rowRequirementCount)}/${rowRequirementCount}`;
        row.classList.add('has-progress');
        row.append(tierLabel, seedList, rowProgress);
      } else {
        row.append(tierLabel, seedList);
      }
      rowButton.append(row);
      listFragment.append(rowButton);
    }
    infinityBuilderCurrentListElement.append(listFragment);
  }

  if (infinityBuilderCurrentEmptyElement instanceof HTMLElement) {
    infinityBuilderCurrentEmptyElement.hidden = snapshot.directSeedCount > 0;
    if (snapshot.directSeedCount === 0) {
      infinityBuilderCurrentEmptyElement.textContent = modeConfig.currentEmptyText;
    }
  }
}

function syncInfinityBuilderPanelVisibility() {
  if (!isInfinityBuilderPanelAvailable()) {
    return;
  }
  const isVisible = Boolean(state.ui?.infinityBuilderVisible);
  infinityBuilderPanelElement.classList.toggle('is-hidden', !isVisible);
  infinityBuilderPanelElement.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
}

function setInfinityBuilderPanelVisible(isVisible) {
  const nextVisible = Boolean(isVisible);
  state.ui.infinityBuilderVisible = nextVisible;
  if (nextVisible) {
    if (infinityBuilderPanelElement instanceof HTMLElement) {
      infinityBuilderPanelElement.classList.remove('is-positioning');
    }
    state.ui.accountOverviewVisible = false;
    state.ui.rankAdvancementVisible = false;
    state.ui.preferredAccountsVisible = false;
    state.ui.myStoreVisible = false;
    syncAccountOverviewPanelVisibility();
    syncRankAdvancementPanelVisibility();
    syncPreferredAccountsPanelVisibility();
    syncMyStorePanelVisibility();
    infinityBuilderLastRenderSignature = '';
    infinityBuilderClaimFeedbackTierNumber = 0;
    setInfinityBuilderClaimFeedback('');
    const overviewContext = resolveAccountOverviewPanelContext();
    const homeNode = overviewContext?.homeNode || resolveNodeById('root');
    void refreshAccountOverviewRemoteSnapshot({
      force: true,
      homeNode,
      scope: overviewContext?.scope,
      preferHomeNodeIdentity: overviewContext?.preferHomeNodeIdentity,
    });
    syncInfinityBuilderViewTreeButtonState({
      isLegacyMode: isLegacyLeadershipPanelMode(),
      tierNumber: infinityBuilderSelectedTierNumber,
    });
    syncInfinityBuilderPanelVisuals();
  } else {
    infinityBuilderLastPanelSnapshot = null;
  }
  syncInfinityBuilderPanelVisibility();
}

function initInfinityBuilderPanel() {
  if (!isInfinityBuilderPanelAvailable()) {
    return;
  }
  syncInfinityBuilderPanelPosition();
  syncInfinityBuilderPanelVisibility();
  if (infinityBuilderCloseButtonElement instanceof HTMLButtonElement) {
    infinityBuilderCloseButtonElement.addEventListener('click', () => {
      setInfinityBuilderPanelVisible(false);
    });
  }
  if (infinityBuilderBackButtonElement instanceof HTMLButtonElement) {
    infinityBuilderBackButtonElement.addEventListener('click', () => {
      setInfinityBuilderPanelVisible(false);
      setAccountOverviewPanelVisible(true);
    });
  }
  if (infinityBuilderClaimButtonElement instanceof HTMLButtonElement) {
    infinityBuilderClaimButtonElement.addEventListener('click', () => {
      void claimInfinityBuilderTierReward();
    });
  }
  if (infinityBuilderCurrentSortElement instanceof HTMLButtonElement) {
    infinityBuilderCurrentSortElement.addEventListener('click', (event) => {
      event.preventDefault();
      toggleInfinityBuilderTierSortDirection();
      infinityBuilderLastRenderSignature = '';
      syncInfinityBuilderPanelVisuals();
    });
  }
  if (infinityBuilderViewTreeButtonElement instanceof HTMLButtonElement) {
    infinityBuilderViewTreeButtonElement.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!viewLegacyTierCanvasTree()) {
        syncInfinityBuilderPanelVisuals();
      }
    });
  }
  if (infinityBuilderPanelElement instanceof HTMLElement) {
    infinityBuilderPanelElement.addEventListener('click', (event) => {
      const targetElement = resolveInfinityBuilderEventTargetElement(event);
      const focusElement = targetElement?.closest('[data-infinity-builder-focus-node-id]');
      if (!(focusElement instanceof HTMLElement)) {
        return;
      }
      const focusNodeId = safeText(focusElement.dataset.infinityBuilderFocusNodeId);
      if (!focusNodeId) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      focusInfinityBuilderPanelNode(focusNodeId);
    });
    infinityBuilderPanelElement.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') {
        return;
      }
      const targetElement = resolveInfinityBuilderEventTargetElement(event);
      const focusElement = targetElement?.closest('[data-infinity-builder-focus-node-id]');
      if (!(focusElement instanceof HTMLElement)) {
        return;
      }
      const focusNodeId = safeText(focusElement.dataset.infinityBuilderFocusNodeId);
      if (!focusNodeId) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      focusInfinityBuilderPanelNode(focusNodeId);
    });
  }
  if (infinityBuilderCurrentListElement instanceof HTMLElement) {
    infinityBuilderCurrentListElement.addEventListener('click', (event) => {
      const targetElement = resolveInfinityBuilderEventTargetElement(event);
      const focusElement = targetElement?.closest('[data-infinity-builder-focus-node-id]');
      if (focusElement instanceof HTMLElement) {
        return;
      }
      const rowButton = targetElement?.closest('[data-infinity-builder-tier]');
      if (!(rowButton instanceof HTMLElement)) {
        return;
      }
      const tierNumber = Math.floor(safeNumber(rowButton.dataset.infinityBuilderTier, 0));
      if (!Number.isFinite(tierNumber) || tierNumber <= 0 || tierNumber === infinityBuilderSelectedTierNumber) {
        return;
      }
      infinityBuilderSelectedTierNumber = tierNumber;
      infinityBuilderClaimFeedbackTierNumber = 0;
      infinityBuilderLastRenderSignature = '';
      syncInfinityBuilderPanelVisuals();
    });
  }
}

const RANK_ADVANCEMENT_FALLBACK_MILESTONES = Object.freeze([
  Object.freeze({
    id: 'rank-ruby',
    title: 'Ruby',
    requiredRank: 'Ruby',
    requiredDirectSponsorsPerSide: 1,
    requiredPersonalPvBv: 50,
    requiredCycles: 5,
    rewardUsd: 62.5,
    iconPath: '/brand_assets/Icons/Achievements/ruby.svg',
  }),
  Object.freeze({
    id: 'rank-emerald',
    title: 'Emerald',
    requiredRank: 'Emerald',
    requiredDirectSponsorsPerSide: 1,
    requiredPersonalPvBv: 50,
    requiredCycles: 10,
    rewardUsd: 125,
    iconPath: '/brand_assets/Icons/Achievements/emerald.svg',
  }),
  Object.freeze({
    id: 'rank-sapphire',
    title: 'Sapphire',
    requiredRank: 'Sapphire',
    requiredDirectSponsorsPerSide: 1,
    requiredPersonalPvBv: 50,
    requiredCycles: 20,
    rewardUsd: 250,
    iconPath: '/brand_assets/Icons/Achievements/sapphire.svg',
  }),
  Object.freeze({
    id: 'rank-diamond',
    title: 'Diamond',
    requiredRank: 'Diamond',
    requiredDirectSponsorsPerSide: 2,
    requiredPersonalPvBv: 100,
    requiredCycles: 40,
    rewardUsd: 500,
    iconPath: '/brand_assets/Icons/Achievements/diamond.svg',
  }),
  Object.freeze({
    id: 'rank-blue-diamond',
    title: 'Blue Diamond',
    requiredRank: 'Blue Diamond',
    requiredDirectSponsorsPerSide: 2,
    requiredPersonalPvBv: 100,
    requiredCycles: 80,
    rewardUsd: 1000,
    iconPath: '/brand_assets/Icons/Achievements/blue-diamond.svg',
  }),
  Object.freeze({
    id: 'rank-black-diamond',
    title: 'Black Diamond',
    requiredRank: 'Black Diamond',
    requiredDirectSponsorsPerSide: 2,
    requiredPersonalPvBv: 100,
    requiredCycles: 160,
    rewardUsd: 2000,
    iconPath: '/brand_assets/Icons/Achievements/black-diamond.svg',
  }),
  Object.freeze({
    id: 'rank-crown',
    title: 'Crown',
    requiredRank: 'Crown',
    requiredDirectSponsorsPerSide: 3,
    requiredPersonalPvBv: 200,
    requiredCycles: 320,
    rewardUsd: 4000,
    iconPath: '/brand_assets/Icons/Achievements/crown.svg',
  }),
  Object.freeze({
    id: 'rank-double-crown',
    title: 'Double Crown',
    requiredRank: 'Double Crown',
    requiredDirectSponsorsPerSide: 3,
    requiredPersonalPvBv: 200,
    requiredCycles: 640,
    rewardUsd: 8000,
    iconPath: '/brand_assets/Icons/Achievements/double-crown.svg',
  }),
  Object.freeze({
    id: 'rank-royal-crown',
    title: 'Royal Crown',
    requiredRank: 'Royal Crown',
    requiredDirectSponsorsPerSide: 3,
    requiredPersonalPvBv: 200,
    requiredCycles: 1000,
    rewardUsd: 12500,
    iconPath: '/brand_assets/Icons/Achievements/royal-crown.svg',
  }),
]);

const RANK_ADVANCEMENT_GOOD_LIFE_MILESTONE_REWARD_BY_RANK_KEY = Object.freeze({
  diamond: 500,
  'blue diamond': 1000,
  'black diamond': 2000,
  crown: 4000,
  'double crown': 8000,
  'royal crown': 12500,
});

const RANK_ADVANCEMENT_MEMBER_REQUIREMENT_BY_RANK_KEY = Object.freeze({
  emerald: '1 Ruby Member',
  sapphire: '1 Emerald Member',
  diamond: '1 Sapphire Member',
  'blue diamond': '1 Diamond Member',
  'black diamond': '1 Blue Diamond Member',
  crown: '2 Black Diamond Members',
  'double crown': '2 Crown Members',
  'royal crown': '2 Double Crown Members',
});

const RANK_ADVANCEMENT_MEMBER_REQUIREMENT_RULE_BY_RANK_KEY = Object.freeze({
  emerald: Object.freeze({ requiredRank: 'Ruby', requiredCount: 1 }),
  sapphire: Object.freeze({ requiredRank: 'Emerald', requiredCount: 1 }),
  diamond: Object.freeze({ requiredRank: 'Sapphire', requiredCount: 1 }),
  'blue diamond': Object.freeze({ requiredRank: 'Diamond', requiredCount: 1 }),
  'black diamond': Object.freeze({ requiredRank: 'Blue Diamond', requiredCount: 1 }),
  crown: Object.freeze({ requiredRank: 'Black Diamond', requiredCount: 2 }),
  'double crown': Object.freeze({ requiredRank: 'Crown', requiredCount: 2 }),
  'royal crown': Object.freeze({ requiredRank: 'Double Crown', requiredCount: 2 }),
});

const RANK_ADVANCEMENT_NODE_BACKGROUND_BY_RANK_KEY = Object.freeze({
  ruby: 'linear-gradient(135deg, #6A0A35 0%, #2C0820 100%)',
  emerald: 'linear-gradient(135deg, #0D4E36 0%, #072719 100%)',
  sapphire: 'linear-gradient(135deg, #1A3F90 0%, #0E244F 100%)',
  diamond: 'linear-gradient(135deg, #124E68 0%, #0A2430 100%)',
  'blue diamond': 'linear-gradient(135deg, #153D7A 0%, #0A1E45 100%)',
  'black diamond': 'linear-gradient(135deg, #2A3448 0%, #111A2A 100%)',
  crown: 'linear-gradient(135deg, #4A3A0C 0%, #241B05 100%)',
  'double crown': 'linear-gradient(135deg, #4B2E08 0%, #231503 100%)',
  'royal crown': 'linear-gradient(135deg, #3D2B70 0%, #1A1038 100%)',
});

function clearRankAdvancementFeedbackTimer() {
  if (rankAdvancementFeedbackTimerId) {
    window.clearTimeout(rankAdvancementFeedbackTimerId);
    rankAdvancementFeedbackTimerId = 0;
  }
}

function setRankAdvancementFeedback(message, options = {}) {
  if (!(rankAdvancementFeedbackElement instanceof HTMLElement)) {
    return;
  }
  const safeMessage = safeText(message);
  const {
    isError = false,
    isSuccess = false,
    persist = false,
  } = options;
  clearRankAdvancementFeedbackTimer();
  rankAdvancementFeedbackElement.textContent = safeMessage;
  rankAdvancementFeedbackElement.classList.toggle('is-error', Boolean(isError && safeMessage));
  rankAdvancementFeedbackElement.classList.toggle('is-success', Boolean(isSuccess && safeMessage));
  if (safeMessage && !persist) {
    rankAdvancementFeedbackTimerId = window.setTimeout(() => {
      if (!(rankAdvancementFeedbackElement instanceof HTMLElement)) {
        return;
      }
      rankAdvancementFeedbackElement.textContent = '';
      rankAdvancementFeedbackElement.classList.remove('is-error', 'is-success');
      rankAdvancementFeedbackTimerId = 0;
    }, 3400);
  }
}

function formatRankAdvancementRewardCurrency(value) {
  const amount = Math.max(0, safeNumber(value, 0));
  return `${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} USD`;
}

function formatRankAdvancementAcquiredSinceDate(value, options = {}) {
  const safeValue = safeText(value);
  let timestampMs = Date.parse(safeValue);
  if (!Number.isFinite(timestampMs)) {
    const periodKey = safeText(options?.periodKey);
    const match = periodKey.match(/^(\d{4})-(\d{2})$/);
    if (match) {
      const year = Number.parseInt(match[1], 10);
      const month = Number.parseInt(match[2], 10) - 1;
      if (Number.isFinite(year) && Number.isFinite(month) && month >= 0 && month <= 11) {
        timestampMs = Date.UTC(year, month, 1);
      }
    }
  }
  if (!Number.isFinite(timestampMs)) {
    return '';
  }
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(timestampMs));
  } catch {
    return '';
  }
}

function normalizeRankAdvancementRankKey(value) {
  return normalizeCredentialValue(safeText(value).replace(/^rank-/, '').replace(/[_-]+/g, ' '));
}

function resolveRankAdvancementMemberRequirementRule(rankLabel = '') {
  const rankKey = normalizeRankAdvancementRankKey(rankLabel);
  return RANK_ADVANCEMENT_MEMBER_REQUIREMENT_RULE_BY_RANK_KEY[rankKey] || null;
}

function resolveRankAdvancementNodeRankLabel(nodeInput = null) {
  const node = nodeInput && typeof nodeInput === 'object' ? nodeInput : null;
  return safeText(
    node?.rank
    || node?.accountRank
    || node?.account_rank
    || node?.profileRank
    || node?.profile_rank
    || '',
  );
}

function resolveRankAdvancementDescendantRankCounts(homeNode = null) {
  const counts = new Map();
  const rootNodeId = safeText(
    homeNode?.id
    || resolvePreferredGlobalHomeNodeId()
    || 'root',
  ) || 'root';
  if (!rootNodeId) {
    return counts;
  }

  const nodeById = new Map();
  const childrenByParent = new Map();
  const appendChild = (parentIdInput, childIdInput) => {
    const parentId = safeText(parentIdInput);
    const childId = safeText(childIdInput);
    if (!parentId || !childId || parentId === childId) {
      return;
    }
    let childSet = childrenByParent.get(parentId);
    if (!childSet) {
      childSet = new Set();
      childrenByParent.set(parentId, childSet);
    }
    childSet.add(childId);
  };

  for (let index = 0; index < state.nodes.length; index += 1) {
    const rawNode = state.nodes[index];
    const node = rawNode && typeof rawNode === 'object' ? rawNode : null;
    if (!node) {
      continue;
    }
    const nodeId = safeText(node.id);
    if (!nodeId) {
      continue;
    }
    nodeById.set(nodeId, node);
    appendChild(node.parent || node.parentId || node.parent_id, nodeId);
  }

  for (let index = 0; index < state.nodes.length; index += 1) {
    const rawNode = state.nodes[index];
    const node = rawNode && typeof rawNode === 'object' ? rawNode : null;
    if (!node) {
      continue;
    }
    const nodeId = safeText(node.id);
    if (!nodeId) {
      continue;
    }
    appendChild(nodeId, node.leftChildId || node.left_child_id);
    appendChild(nodeId, node.rightChildId || node.right_child_id);
  }

  const visited = new Set([rootNodeId]);
  const queue = [rootNodeId];
  while (queue.length > 0) {
    const parentId = queue.shift();
    const childIds = childrenByParent.get(parentId);
    if (!(childIds instanceof Set) || childIds.size === 0) {
      continue;
    }
    childIds.forEach((childId) => {
      if (!childId || visited.has(childId)) {
        return;
      }
      visited.add(childId);
      queue.push(childId);
      const childNode = nodeById.get(childId) || resolveNodeById(childId);
      const rankKey = normalizeRankAdvancementRankKey(resolveRankAdvancementNodeRankLabel(childNode));
      if (!rankKey) {
        return;
      }
      counts.set(rankKey, Math.max(0, safeNumber(counts.get(rankKey), 0)) + 1);
    });
  }

  return counts;
}

function resolveRankAdvancementMilestoneBackground(rankLabel = '') {
  const key = normalizeRankAdvancementRankKey(rankLabel);
  return RANK_ADVANCEMENT_NODE_BACKGROUND_BY_RANK_KEY[key]
    || 'linear-gradient(135deg, #273750 0%, #111B29 100%)';
}

function resolveRankAdvancementMilestoneIconPath(item = {}) {
  const explicitPath = safeText(item?.iconPath);
  if (explicitPath && explicitPath.startsWith('/brand_assets/')) {
    return explicitPath;
  }
  const rankLabel = safeText(item?.title || item?.requiredRank || '');
  if (rankLabel) {
    const iconKey = resolveAchievementIconKeyFromLabel(rankLabel);
    if (iconKey && iconKey !== 'placeholder') {
      return `/brand_assets/Icons/Achievements/${iconKey}.svg`;
    }
  }
  return '/brand_assets/Icons/Achievements/diamond.svg';
}

function sortRankAdvancementMilestones(itemsInput = []) {
  const safeItems = Array.isArray(itemsInput) ? itemsInput : [];
  return safeItems
    .filter((item) => item && typeof item === 'object')
    .slice()
    .sort((left, right) => {
      const leftCycles = Math.max(0, Math.floor(safeNumber(left?.requiredCycles, 0)));
      const rightCycles = Math.max(0, Math.floor(safeNumber(right?.requiredCycles, 0)));
      if (leftCycles !== rightCycles) {
        return leftCycles - rightCycles;
      }
      const leftDirect = Math.max(0, Math.floor(safeNumber(left?.requiredDirectSponsorsPerSide, 0)));
      const rightDirect = Math.max(0, Math.floor(safeNumber(right?.requiredDirectSponsorsPerSide, 0)));
      if (leftDirect !== rightDirect) {
        return leftDirect - rightDirect;
      }
      return safeText(left?.title || '').localeCompare(safeText(right?.title || ''));
    });
}

function resolveRankAdvancementSyncIntervalMs(options = {}) {
  const {
    forRetry = false,
  } = options;
  const panelVisible = Boolean(state.ui?.rankAdvancementVisible);
  const hiddenSyncMode = document.visibilityState === 'hidden' || !panelVisible;
  const baseIntervalMs = hiddenSyncMode
    ? RANK_ADVANCEMENT_REMOTE_SYNC_HIDDEN_INTERVAL_MS
    : RANK_ADVANCEMENT_REMOTE_SYNC_VISIBLE_INTERVAL_MS;
  if (!forRetry) {
    return baseIntervalMs;
  }
  return Math.min(baseIntervalMs, RANK_ADVANCEMENT_REMOTE_SYNC_RETRY_INTERVAL_MS);
}

function buildRankAdvancementRequestHeaders(baseHeaders = {}) {
  const headers = {
    ...baseHeaders,
  };
  if (state.source !== 'member') {
    return headers;
  }
  const authToken = safeText(state.session?.authToken);
  if (!authToken) {
    return headers;
  }
  return {
    ...headers,
    Authorization: `Bearer ${authToken}`,
  };
}

function isRankAdvancementPanelAvailable() {
  return rankAdvancementPanelElement instanceof HTMLElement;
}

function resetRankAdvancementSnapshot() {
  rankAdvancementSnapshot = null;
  rankAdvancementDataVersion = 0;
  rankAdvancementSyncPromise = null;
  rankAdvancementSyncInFlight = false;
  rankAdvancementLastRequestAtMs = 0;
  rankAdvancementLastSyncedAtMs = 0;
  rankAdvancementIdentityKey = '';
  rankAdvancementLoading = false;
  rankAdvancementClaimInFlight = false;
  rankAdvancementCachedAchievementsPayload = null;
  rankAdvancementCachedGoodLifePayload = null;
  rankAdvancementLastRenderSignature = '';
  rankAdvancementSelectedMilestoneId = '';
  setRankAdvancementFeedback('', { persist: true });
}

function resolveRankAdvancementMemberRequirementLabel(rankLabel = '') {
  const rankKey = normalizeRankAdvancementRankKey(rankLabel);
  return RANK_ADVANCEMENT_MEMBER_REQUIREMENT_BY_RANK_KEY[rankKey] || 'No member rank requirement';
}

function resolveRankAdvancementGoodLifeFallbackReward(rankLabel = '') {
  const rankKey = normalizeRankAdvancementRankKey(rankLabel);
  return Math.max(0, safeNumber(RANK_ADVANCEMENT_GOOD_LIFE_MILESTONE_REWARD_BY_RANK_KEY[rankKey], 0));
}

function resolveRankAdvancementMilestonesFromPayload(achievementsPayload = null) {
  const sourceAchievements = Array.isArray(achievementsPayload?.achievements)
    ? achievementsPayload.achievements
    : [];
  const mappedRankAchievements = sourceAchievements
    .filter((achievement) => normalizeCredentialValue(achievement?.tabId) === 'rank')
    .map((achievement) => {
      const title = safeText(achievement?.title || achievement?.requiredRank || 'Rank');
      const requiredRank = safeText(achievement?.requiredRank || title || 'Rank');
      return {
        id: safeText(achievement?.id || `rank-${normalizeRankAdvancementRankKey(requiredRank).replace(/\s+/g, '-')}`),
        title: title || requiredRank,
        requiredRank,
        requiredDirectSponsorsPerSide: Math.max(
          0,
          Math.floor(safeNumber(achievement?.requiredDirectSponsorsPerSide, 0)),
        ),
        requiredPersonalPvBv: Math.max(
          0,
          Math.floor(safeNumber(achievement?.requiredPersonalPvBv, 0)),
        ),
        requiredLegPersonalPvBv: Math.max(
          0,
          Math.floor(safeNumber(achievement?.requiredLegPersonalPvBv, 0)),
        ),
        requiredCycles: Math.max(0, Math.floor(safeNumber(achievement?.requiredCycles, 0))),
        currentLeftDirectSponsors: Math.max(0, Math.floor(safeNumber(achievement?.currentLeftDirectSponsors, 0))),
        currentRightDirectSponsors: Math.max(0, Math.floor(safeNumber(achievement?.currentRightDirectSponsors, 0))),
        currentDirectSponsorsTotal: Math.max(0, Math.floor(safeNumber(achievement?.currentDirectSponsorsTotal, 0))),
        currentPersonalPvBv: Math.max(0, Math.floor(safeNumber(achievement?.currentPersonalPvBv, 0))),
        currentLeftQualifiedPersonalPvSponsors: Math.max(
          0,
          Math.floor(safeNumber(achievement?.currentLeftQualifiedPersonalPvSponsors, 0)),
        ),
        currentRightQualifiedPersonalPvSponsors: Math.max(
          0,
          Math.floor(safeNumber(achievement?.currentRightQualifiedPersonalPvSponsors, 0)),
        ),
        requiresActive: Boolean(achievement?.requiresActive),
        lockReason: safeText(achievement?.lockReason),
        rewardUsd: Math.max(0, safeNumber(achievement?.rewardUsd, 0)),
        status: normalizeCredentialValue(achievement?.status),
        eligible: Boolean(achievement?.eligible),
        claimId: safeText(achievement?.claimId),
        claimedAt: safeText(achievement?.claimedAt),
        iconPath: resolveRankAdvancementMilestoneIconPath(achievement),
      };
    });

  const sortedMilestones = sortRankAdvancementMilestones(mappedRankAchievements);
  if (sortedMilestones.length > 0) {
    return sortedMilestones;
  }
  return sortRankAdvancementMilestones(RANK_ADVANCEMENT_FALLBACK_MILESTONES);
}

function resolveRankAdvancementMilestoneProgressState(milestone = {}, context = {}) {
  const requiredRankLabel = safeText(milestone?.title || milestone?.requiredRank);
  const memberRequirementRule = resolveRankAdvancementMemberRequirementRule(requiredRankLabel);
  const requiredMemberRankLabel = safeText(memberRequirementRule?.requiredRank);
  const requiredMemberCount = Math.max(0, Math.floor(safeNumber(memberRequirementRule?.requiredCount, 0)));
  const requiredMemberRankKey = normalizeRankAdvancementRankKey(requiredMemberRankLabel);
  const descendantRankCounts = context?.descendantRankCounts instanceof Map
    ? context.descendantRankCounts
    : new Map();
  const currentQualifiedMemberCount = requiredMemberRankKey
    ? Math.max(0, Math.floor(safeNumber(descendantRankCounts.get(requiredMemberRankKey), 0)))
    : 0;
  const requiredCycles = Math.max(0, Math.floor(safeNumber(milestone?.requiredCycles, 0)));
  const requiredPersonalBv = Math.max(0, Math.floor(safeNumber(milestone?.requiredPersonalPvBv, 0)));
  const requiredDirectPerSide = Math.max(0, Math.floor(safeNumber(milestone?.requiredDirectSponsorsPerSide, 0)));
  const requiredLegPersonalBv = Math.max(0, Math.floor(safeNumber(milestone?.requiredLegPersonalPvBv, 0)));
  const currentCycles = Math.max(0, Math.floor(safeNumber(context?.currentCycles, 0)));
  const currentPersonalBv = Math.max(
    0,
    Math.floor(safeNumber(milestone?.currentPersonalPvBv, context?.currentPersonalBv)),
  );
  const currentLeftDirectSponsors = Math.max(
    0,
    Math.floor(safeNumber(milestone?.currentLeftDirectSponsors, context?.leftDirectSponsors)),
  );
  const currentRightDirectSponsors = Math.max(
    0,
    Math.floor(safeNumber(milestone?.currentRightDirectSponsors, context?.rightDirectSponsors)),
  );
  const currentLeftQualifiedPersonalPvSponsors = Math.max(
    0,
    Math.floor(
      safeNumber(
        milestone?.currentLeftQualifiedPersonalPvSponsors,
        currentLeftDirectSponsors,
      ),
    ),
  );
  const currentRightQualifiedPersonalPvSponsors = Math.max(
    0,
    Math.floor(
      safeNumber(
        milestone?.currentRightQualifiedPersonalPvSponsors,
        currentRightDirectSponsors,
      ),
    ),
  );
  const requiresActive = Boolean(milestone?.requiresActive);
  const accountIsActive = context?.isActive !== false;

  const cycleMet = requiredCycles <= 0 || currentCycles >= requiredCycles;
  const personalMet = requiredPersonalBv <= 0 || currentPersonalBv >= requiredPersonalBv;
  const directMet = requiredDirectPerSide <= 0 || (
    currentLeftDirectSponsors >= requiredDirectPerSide
    && currentRightDirectSponsors >= requiredDirectPerSide
  );
  const legPersonalMet = requiredLegPersonalBv <= 0 || (
    currentLeftQualifiedPersonalPvSponsors >= requiredDirectPerSide
    && currentRightQualifiedPersonalPvSponsors >= requiredDirectPerSide
  );
  const memberMet = requiredMemberCount <= 0 || currentQualifiedMemberCount >= requiredMemberCount;
  const activeMet = !requiresActive || accountIsActive;
  const statusKey = normalizeCredentialValue(milestone?.status);
  const claimedByStatus = statusKey === 'claimed' || Boolean(milestone?.claimId || milestone?.claimedAt || milestone?.claimed);
  const metByStatus = (
    statusKey === 'eligible'
    || statusKey === 'claimable'
    || statusKey === 'claimed'
    || Boolean(milestone?.eligible)
    || claimedByStatus
  );
  const metByValues = cycleMet && personalMet && directMet && legPersonalMet && memberMet && activeMet;
  const met = metByValues || (claimedByStatus ? true : (metByStatus && memberMet));

  return {
    met,
    cycleMet,
    personalMet,
    directMet,
    legPersonalMet,
    memberMet,
    activeMet,
    currentCycles,
    currentPersonalBv,
    currentLeftDirectSponsors,
    currentRightDirectSponsors,
    currentQualifiedMemberCount,
    requiredCycles,
    requiredPersonalBv,
    requiredDirectPerSide,
    requiredLegPersonalBv,
    requiredMemberRankLabel,
    requiredMemberCount,
    cycleShortfall: Math.max(0, requiredCycles - currentCycles),
    personalBvShortfall: Math.max(0, requiredPersonalBv - currentPersonalBv),
    leftDirectShortfall: Math.max(0, requiredDirectPerSide - currentLeftDirectSponsors),
    rightDirectShortfall: Math.max(0, requiredDirectPerSide - currentRightDirectSponsors),
    memberShortfall: Math.max(0, requiredMemberCount - currentQualifiedMemberCount),
  };
}

function resolveRankAdvancementProgressPercent(
  milestonesInput = [],
  milestoneProgressStatesInput = [],
  currentCyclesInput = 0,
) {
  const milestones = Array.isArray(milestonesInput) ? milestonesInput : [];
  if (milestones.length <= 1) {
    return 0;
  }
  const milestoneProgressStates = Array.isArray(milestoneProgressStatesInput)
    ? milestoneProgressStatesInput
    : [];
  const cycleThresholds = milestones.map((milestone) => Math.max(0, Math.floor(safeNumber(milestone?.requiredCycles, 0))));
  const lastIndex = cycleThresholds.length - 1;
  let highestMetIndex = -1;
  for (let index = 0; index < milestones.length; index += 1) {
    if (milestoneProgressStates[index]?.met) {
      highestMetIndex = index;
    }
  }

  if (highestMetIndex >= lastIndex) {
    return 100;
  }

  const currentCycles = Math.max(0, Math.floor(safeNumber(currentCyclesInput, 0)));
  const segmentStartIndex = highestMetIndex;
  const nextIndex = Math.min(lastIndex, segmentStartIndex + 1);
  const startThreshold = segmentStartIndex >= 0
    ? cycleThresholds[segmentStartIndex]
    : 0;
  const endThreshold = Math.max(startThreshold + 1, cycleThresholds[nextIndex]);
  const segmentRange = Math.max(1, endThreshold - startThreshold);
  let segmentProgress = clamp((currentCycles - startThreshold) / segmentRange, 0, 1);
  if (nextIndex < milestoneProgressStates.length && !milestoneProgressStates[nextIndex]?.met) {
    segmentProgress = Math.min(segmentProgress, 0.92);
  }
  const progressNumerator = segmentStartIndex >= 0
    ? segmentStartIndex + segmentProgress
    : segmentProgress;
  let progressRatio = clamp(progressNumerator / Math.max(1, lastIndex), 0, 1);
  if (segmentStartIndex >= 0 && segmentStartIndex < lastIndex) {
    const minimumPastThresholdRatio = clamp((segmentStartIndex + 0.08) / Math.max(1, lastIndex), 0, 1);
    progressRatio = Math.max(progressRatio, minimumPastThresholdRatio);
  }
  return Math.max(0, Math.min(100, progressRatio * 100));
}

function resolveRankAdvancementEarnedMilestoneIndex(milestonesInput = [], achievementsPayload = null) {
  const milestones = Array.isArray(milestonesInput) ? milestonesInput : [];
  if (!milestones.length) {
    return -1;
  }
  const explicitEarnedIds = [
    achievementsPayload?.rankClaimedAchievementId,
    achievementsPayload?.highestEligibleRankAchievementId,
    achievementsPayload?.runRankAchievementId,
    achievementsPayload?.rankRunAchievementId,
    achievementsPayload?.highestRecordedRankAchievementId,
  ].map((value) => safeText(value)).filter(Boolean);
  for (let index = 0; index < explicitEarnedIds.length; index += 1) {
    const matchedIndex = resolveRankAdvancementMilestoneIndexById(milestones, explicitEarnedIds[index]);
    if (matchedIndex >= 0) {
      return matchedIndex;
    }
  }

  let statusDrivenIndex = -1;
  for (let index = 0; index < milestones.length; index += 1) {
    const milestone = milestones[index];
    const statusKey = normalizeCredentialValue(milestone?.status);
    if (
      statusKey === 'claimed'
      || statusKey === 'eligible'
      || statusKey === 'claimable'
      || Boolean(milestone?.claimId || milestone?.claimedAt || milestone?.eligible || milestone?.claimed)
    ) {
      statusDrivenIndex = index;
    }
  }
  return statusDrivenIndex;
}

function resolveRankAdvancementSelectedMilestoneIndex(milestonesInput = [], defaultMilestoneIndex = 0) {
  const milestones = Array.isArray(milestonesInput) ? milestonesInput : [];
  if (!milestones.length) {
    rankAdvancementSelectedMilestoneId = '';
    return -1;
  }

  const selectedIndex = resolveRankAdvancementMilestoneIndexById(milestones, rankAdvancementSelectedMilestoneId);
  if (selectedIndex >= 0) {
    return selectedIndex;
  }

  const clampedDefaultIndex = clamp(
    Math.floor(safeNumber(defaultMilestoneIndex, 0)),
    0,
    milestones.length - 1,
  );
  const fallbackMilestone = milestones[clampedDefaultIndex] || milestones[0];
  rankAdvancementSelectedMilestoneId = safeText(fallbackMilestone?.id);
  return resolveRankAdvancementMilestoneIndexById(milestones, rankAdvancementSelectedMilestoneId);
}

function resolveRankAdvancementMilestoneIndexById(milestonesInput = [], achievementId = '') {
  const milestones = Array.isArray(milestonesInput) ? milestonesInput : [];
  const safeAchievementId = safeText(achievementId);
  if (!safeAchievementId) {
    return -1;
  }
  for (let index = 0; index < milestones.length; index += 1) {
    if (safeText(milestones[index]?.id) === safeAchievementId) {
      return index;
    }
  }
  return -1;
}

function resolveRankAdvancementMilestoneIndexByRankLabel(milestonesInput = [], rankLabel = '') {
  const milestones = Array.isArray(milestonesInput) ? milestonesInput : [];
  const targetRankKey = normalizeRankAdvancementRankKey(rankLabel);
  if (!targetRankKey) {
    return -1;
  }
  for (let index = 0; index < milestones.length; index += 1) {
    const milestoneRankKey = normalizeRankAdvancementRankKey(
      safeText(milestones[index]?.title || milestones[index]?.requiredRank),
    );
    if (milestoneRankKey === targetRankKey) {
      return index;
    }
  }
  return -1;
}

function resolveRankAdvancementRunMilestoneIndex(milestonesInput = [], currentCyclesInput = 0, achievementsPayload = null) {
  const milestones = Array.isArray(milestonesInput) ? milestonesInput : [];
  if (!milestones.length) {
    return -1;
  }

  const currentCycles = Math.max(0, Math.floor(safeNumber(currentCyclesInput, 0)));
  let reachedIndex = -1;
  for (let index = 0; index < milestones.length; index += 1) {
    const requiredCycles = Math.max(0, Math.floor(safeNumber(milestones[index]?.requiredCycles, 0)));
    if (currentCycles >= requiredCycles) {
      reachedIndex = index;
    }
  }
  const clampRunIndexByCycles = (resolvedIndex) => {
    if (resolvedIndex < 0) {
      return resolvedIndex;
    }
    if (reachedIndex < 0) {
      return resolvedIndex;
    }
    return Math.min(resolvedIndex, reachedIndex);
  };

  const explicitRunAchievementId = safeText(
    achievementsPayload?.runRankAchievementId
    || achievementsPayload?.rankRunAchievementId
    || achievementsPayload?.highestEligibleRankAchievementId
    || achievementsPayload?.rankClaimedAchievementId,
  );
  const explicitRunIndex = resolveRankAdvancementMilestoneIndexById(milestones, explicitRunAchievementId);
  if (explicitRunIndex >= 0) {
    return clampRunIndexByCycles(explicitRunIndex);
  }

  let eligibleIndex = -1;
  for (let index = 0; index < milestones.length; index += 1) {
    const statusKey = normalizeCredentialValue(milestones[index]?.status);
    if (
      statusKey === 'eligible'
      || statusKey === 'claimable'
      || statusKey === 'claimed'
      || Boolean(milestones[index]?.eligible)
    ) {
      eligibleIndex = index;
    }
  }
  if (eligibleIndex >= 0) {
    return clampRunIndexByCycles(eligibleIndex);
  }
  if (reachedIndex >= 0) {
    return reachedIndex;
  }

  return 0;
}

function resolveRankAdvancementClaimableMilestone(milestonesInput = []) {
  const milestones = Array.isArray(milestonesInput) ? milestonesInput : [];
  let claimableMilestone = null;
  for (let index = 0; index < milestones.length; index += 1) {
    const milestone = milestones[index];
    const statusKey = normalizeCredentialValue(milestone?.status);
    const claimed = statusKey === 'claimed' || Boolean(milestone?.claimId || milestone?.claimedAt);
    const eligible = statusKey === 'eligible' || statusKey === 'claimable' || Boolean(milestone?.eligible);
    if (!claimed && eligible) {
      claimableMilestone = milestone;
    }
  }
  return claimableMilestone;
}

function buildRankAdvancementSnapshotFromPayloads(achievementsPayload = null, goodLifePayload = null, homeNode = null) {
  const milestones = resolveRankAdvancementMilestonesFromPayload(achievementsPayload).map((milestone) => {
    const statusKey = normalizeCredentialValue(milestone?.status);
    const claimed = statusKey === 'claimed' || Boolean(milestone?.claimId || milestone?.claimedAt);
    const eligible = statusKey === 'eligible' || statusKey === 'claimable' || Boolean(milestone?.eligible);
    return {
      ...milestone,
      status: statusKey || (claimed ? 'claimed' : (eligible ? 'eligible' : 'locked')),
      claimed,
      eligible,
      iconPath: resolveRankAdvancementMilestoneIconPath(milestone),
    };
  });

  const accountOverviewContext = resolveAccountOverviewPanelContext();
  const resolvedHomeNode = homeNode
    || accountOverviewContext?.homeNode
    || resolveNodeById(resolvePreferredGlobalHomeNodeId())
    || resolveNodeById('root')
    || null;
  const remoteMetrics = accountOverviewRemoteSnapshot?.binaryTreeMetrics;
  const currentCycles = Math.max(
    0,
    Math.floor(
      safeNumber(
        achievementsPayload?.currentCycles,
        safeNumber(
          remoteMetrics?.totalCycles,
          resolveAccountOverviewCycleCapMetrics(resolvedHomeNode).cappedCycles,
        ),
      ),
    ),
  );
  const totalBv = Math.max(0, Math.floor(resolveAccountOverviewTotalOrganizationBv(resolvedHomeNode)));
  const personalBv = Math.max(
    0,
    Math.floor(safeNumber(achievementsPayload?.currentPersonalPvBv, resolveAccountOverviewPersonalBv(resolvedHomeNode))),
  );
  const leftDirectSponsors = Math.max(0, Math.floor(safeNumber(achievementsPayload?.leftDirectSponsors, 0)));
  const rightDirectSponsors = Math.max(0, Math.floor(safeNumber(achievementsPayload?.rightDirectSponsors, 0)));
  const totalDirectSponsors = Math.max(
    0,
    Math.floor(safeNumber(achievementsPayload?.totalDirectSponsors, leftDirectSponsors + rightDirectSponsors)),
  );
  const descendantRankCounts = resolveRankAdvancementDescendantRankCounts(resolvedHomeNode);
  const isActive = Boolean(achievementsPayload?.isActive);
  const milestoneProgressStates = milestones.map((milestone) => resolveRankAdvancementMilestoneProgressState(
    milestone,
    {
      currentCycles,
      currentPersonalBv: personalBv,
      leftDirectSponsors,
      rightDirectSponsors,
      descendantRankCounts,
      isActive,
    },
  ));
  let highestMetMilestoneIndex = -1;
  for (let index = 0; index < milestoneProgressStates.length; index += 1) {
    if (milestoneProgressStates[index]?.met) {
      highestMetMilestoneIndex = index;
    }
  }

  const claimedMilestoneIndex = resolveRankAdvancementMilestoneIndexById(
    milestones,
    safeText(achievementsPayload?.rankClaimedAchievementId),
  );
  const serverEarnedMilestoneIndex = resolveRankAdvancementEarnedMilestoneIndex(milestones, achievementsPayload);
  let earnedMilestoneIndex = highestMetMilestoneIndex;
  if (claimedMilestoneIndex >= 0) {
    earnedMilestoneIndex = claimedMilestoneIndex;
  } else if (serverEarnedMilestoneIndex >= 0) {
    earnedMilestoneIndex = highestMetMilestoneIndex >= 0
      ? Math.min(serverEarnedMilestoneIndex, highestMetMilestoneIndex)
      : -1;
  }
  const earnedMilestone = earnedMilestoneIndex >= 0
    ? (milestones[earnedMilestoneIndex] || null)
    : null;
  const defaultTargetMilestoneIndex = milestones.length > 0
    ? clamp(
      earnedMilestoneIndex >= 0
        ? earnedMilestoneIndex + 1
        : 0,
      0,
      milestones.length - 1,
    )
    : -1;
  const targetMilestoneIndex = resolveRankAdvancementSelectedMilestoneIndex(milestones, defaultTargetMilestoneIndex);
  const targetMilestone = targetMilestoneIndex >= 0
    ? (milestones[targetMilestoneIndex] || null)
    : null;
  const targetProgress = targetMilestoneIndex >= 0
    ? (milestoneProgressStates[targetMilestoneIndex] || null)
    : null;
  const claimableMilestone = resolveRankAdvancementClaimableMilestone(milestones);
  const claimableMilestoneIndex = resolveRankAdvancementMilestoneIndexById(
    milestones,
    safeText(claimableMilestone?.id),
  );
  const claimableMilestoneMet = (
    claimableMilestoneIndex >= 0
    && claimableMilestoneIndex < milestoneProgressStates.length
    && Boolean(milestoneProgressStates[claimableMilestoneIndex]?.met)
  );
  const claimedRankThisPeriod = Boolean(
    safeText(achievementsPayload?.rankClaimedAchievementId)
    || safeText(achievementsPayload?.rankClaimedAchievementTitle)
    || milestones.some((milestone) => Boolean(milestone?.claimed)),
  );
  const canClaimRankReward = Boolean(claimableMilestone && claimableMilestoneMet && !claimedRankThisPeriod);
  const claimAchievementId = canClaimRankReward ? safeText(claimableMilestone?.id) : '';
  const progressPercent = resolveRankAdvancementProgressPercent(
    milestones,
    milestoneProgressStates,
    currentCycles,
  );

  const hasMonthlyRankReward = Boolean(earnedMilestone);
  const rewardMilestone = hasMonthlyRankReward ? earnedMilestone : null;
  const runRankLabel = hasMonthlyRankReward
    ? safeText(rewardMilestone?.title || rewardMilestone?.requiredRank || 'Unranked')
    : 'Wait next month for details';
  const targetRankLabel = safeText(targetMilestone?.title || targetMilestone?.requiredRank || 'Rank') || 'Rank';
  const targetRequiredCycles = Math.max(0, Math.floor(safeNumber(targetMilestone?.requiredCycles, currentCycles)));
  const targetRequiredPersonalBv = Math.max(
    0,
    Math.floor(safeNumber(targetMilestone?.requiredPersonalPvBv, 0)),
  );
  const targetRequiredDirectPerSide = Math.max(
    0,
    Math.floor(safeNumber(targetMilestone?.requiredDirectSponsorsPerSide, 0)),
  );
  const targetCurrentLeftDirect = Math.max(
    0,
    Math.floor(safeNumber(targetProgress?.currentLeftDirectSponsors, leftDirectSponsors)),
  );
  const targetCurrentRightDirect = Math.max(
    0,
    Math.floor(safeNumber(targetProgress?.currentRightDirectSponsors, rightDirectSponsors)),
  );
  const targetCurrentPersonalBv = Math.max(
    0,
    Math.floor(safeNumber(targetProgress?.currentPersonalBv, personalBv)),
  );
  const targetRequiresLegPersonalBv = Math.max(
    0,
    Math.floor(safeNumber(targetMilestone?.requiredLegPersonalPvBv, 0)),
  );
  const targetPersonalMet = Boolean(targetProgress?.personalMet || targetRequiredPersonalBv <= 0);
  const targetDirectMet = Boolean(
    targetRequiredDirectPerSide <= 0
    || (
      Boolean(targetProgress?.directMet)
      && (targetRequiresLegPersonalBv <= 0 || Boolean(targetProgress?.legPersonalMet))
    ),
  );
  const targetCyclesMet = Boolean(targetProgress?.cycleMet || targetRequiredCycles <= 0);
  const targetMemberMet = Boolean(
    safeText(targetProgress?.requiredMemberRankLabel)
    && Math.max(0, Math.floor(safeNumber(targetProgress?.requiredMemberCount, 0))) > 0
    && targetProgress?.memberMet,
  );
  const targetCyclesRemaining = Math.max(0, targetRequiredCycles - currentCycles);
  const targetPersonalBvRemaining = Math.max(0, targetRequiredPersonalBv - targetCurrentPersonalBv);
  const targetLeftDirectRemaining = Math.max(0, targetRequiredDirectPerSide - targetCurrentLeftDirect);
  const targetRightDirectRemaining = Math.max(0, targetRequiredDirectPerSide - targetCurrentRightDirect);
  const rankRunPeriod = safeText(achievementsPayload?.rankRunPeriod);
  const targetMilestoneClaimedAt = safeText(targetMilestone?.claimedAt);
  const targetAcquiredSinceDateLabel = formatRankAdvancementAcquiredSinceDate(targetMilestoneClaimedAt, {
    periodKey: rankRunPeriod,
  });
  const targetRewardUsd = Math.max(0, safeNumber(targetMilestone?.rewardUsd, 0));
  const targetGoodLifePreviewUsd = Math.max(0, safeNumber(
    resolveRankAdvancementGoodLifeFallbackReward(targetRankLabel),
    0,
  ));
  const showTargetGoodLifePreview = targetGoodLifePreviewUsd > 0;
  const currentAccountRankTitle = safeText(
    achievementsPayload?.currentRank
    || resolvedHomeNode?.accountRank
    || resolvedHomeNode?.rank,
  );
  const currentAccountRankMilestoneIndex = resolveRankAdvancementMilestoneIndexByRankLabel(
    milestones,
    currentAccountRankTitle,
  );

  const goodLifeRewardAmount = hasMonthlyRankReward
    ? resolveRankAdvancementGoodLifeFallbackReward(runRankLabel)
    : 0;
  const showGoodLifeBonus = hasMonthlyRankReward && goodLifeRewardAmount > 0;
  const rewardUsd = Math.max(0, safeNumber(rewardMilestone?.rewardUsd, 0));
  const rewardIconPath = hasMonthlyRankReward
    ? resolveRankAdvancementMilestoneIconPath(rewardMilestone || {})
    : '/brand_assets/Icons/Achievements/ruby.svg';
  const rankClaimedTitle = safeText(achievementsPayload?.rankClaimedAchievementTitle);

  return {
    updatedAtMs: Date.now(),
    milestones,
    runMilestoneIndex: earnedMilestoneIndex,
    runMilestoneId: safeText(rewardMilestone?.id),
    runRankTitle: runRankLabel,
    defaultTargetMilestoneIndex: defaultTargetMilestoneIndex >= 0 ? defaultTargetMilestoneIndex : 0,
    defaultTargetAchievementId: defaultTargetMilestoneIndex >= 0
      ? safeText(milestones[defaultTargetMilestoneIndex]?.id)
      : '',
    targetMilestoneIndex,
    targetAchievementId: safeText(targetMilestone?.id),
    targetRankTitle: targetRankLabel,
    targetRequiredCycles,
    targetRequiredPersonalBv,
    targetRequiredDirectPerSide,
    targetCurrentPersonalBv,
    targetCurrentLeftDirect,
    targetCurrentRightDirect,
    targetPersonalMet,
    targetDirectMet,
    targetCyclesMet,
    targetMemberMet,
    targetCyclesRemaining,
    targetPersonalBvRemaining,
    targetLeftDirectRemaining,
    targetRightDirectRemaining,
    targetMilestoneClaimedAt,
    targetAcquiredSinceDateLabel,
    targetRewardUsd,
    targetGoodLifePreviewUsd,
    showTargetGoodLifePreview,
    currentAccountRankTitle,
    currentAccountRankMilestoneIndex,
    targetMembersRequirementLabel: resolveRankAdvancementMemberRequirementLabel(targetRankLabel),
    currentCycles,
    currentPersonalBv: personalBv,
    totalBv,
    leftDirectSponsors,
    rightDirectSponsors,
    totalDirectSponsors,
    highestMetMilestoneIndex,
    hasMonthlyRankReward,
    rankRewardUsd: rewardUsd,
    rewardIconPath,
    goodLifeRewardUsd: goodLifeRewardAmount,
    showGoodLifeBonus,
    progressPercent: Math.max(0, Math.min(100, progressPercent)),
    claimAchievementId,
    claimAchievementTitle: safeText(claimableMilestone?.title || claimableMilestone?.requiredRank),
    canClaimRankReward,
    rankClaimed: claimedRankThisPeriod,
    rankClaimedTitle,
    hasGoodLifeClaimedThisPeriod: Boolean(safeText(goodLifePayload?.claimedAt)),
    rankRunPeriod,
    rankRunPeriodLabel: safeText(achievementsPayload?.rankRunPeriodLabel),
    periodLabel: safeText(
      goodLifePayload?.periodLabel
      || achievementsPayload?.rankClaimPeriodLabel
      || 'This Month',
    ) || 'This Month',
  };
}

function resolveRankAdvancementRenderSignature(snapshot = null) {
  if (!snapshot || typeof snapshot !== 'object') {
    return 'empty';
  }
  return [
    safeText(snapshot.targetAchievementId),
    safeText(snapshot.defaultTargetAchievementId),
    safeText(snapshot.runMilestoneId),
    safeText(snapshot.claimAchievementId),
    safeText(snapshot.rankClaimedTitle),
    safeText(snapshot.runRankTitle),
    String(Boolean(snapshot.hasMonthlyRankReward)),
    String(Boolean(snapshot.showGoodLifeBonus)),
    Math.round(safeNumber(snapshot.progressPercent, 0)),
    Math.floor(safeNumber(snapshot.currentCycles, 0)),
    Math.floor(safeNumber(snapshot.targetCyclesRemaining, 0)),
    Math.floor(safeNumber(snapshot.targetPersonalBvRemaining, 0)),
    Math.floor(safeNumber(snapshot.targetLeftDirectRemaining, 0)),
    Math.floor(safeNumber(snapshot.targetRightDirectRemaining, 0)),
    safeText(snapshot.targetMilestoneClaimedAt),
    safeText(snapshot.targetAcquiredSinceDateLabel),
    Math.round(safeNumber(snapshot.targetRewardUsd, 0) * 100),
    Math.round(safeNumber(snapshot.targetGoodLifePreviewUsd, 0) * 100),
    String(Boolean(snapshot.showTargetGoodLifePreview)),
    safeText(snapshot.currentAccountRankTitle),
    Math.floor(safeNumber(snapshot.currentAccountRankMilestoneIndex, -1)),
    String(Boolean(snapshot.targetPersonalMet)),
    String(Boolean(snapshot.targetDirectMet)),
    String(Boolean(snapshot.targetCyclesMet)),
    String(Boolean(snapshot.targetMemberMet)),
    Math.floor(safeNumber(snapshot.highestMetMilestoneIndex, -1)),
    Math.floor(safeNumber(snapshot.totalBv, 0)),
    Math.floor(safeNumber(snapshot.currentPersonalBv, 0)),
    Math.round(safeNumber(snapshot.rankRewardUsd, 0) * 100),
    Math.round(safeNumber(snapshot.goodLifeRewardUsd, 0) * 100),
    safeText(snapshot.periodLabel),
  ].join('::');
}

function renderRankAdvancementMilestones(snapshot = null) {
  if (!(rankAdvancementMilestonesElement instanceof HTMLElement)) {
    return;
  }
  const milestones = Array.isArray(snapshot?.milestones) ? snapshot.milestones : [];
  rankAdvancementMilestonesElement.innerHTML = '';
  if (!milestones.length) {
    return;
  }

  const fragment = document.createDocumentFragment();
  const safeRunIndex = Math.floor(safeNumber(snapshot?.runMilestoneIndex, -1));
  const highestMetMilestoneIndex = Math.floor(safeNumber(snapshot?.highestMetMilestoneIndex, -1));
  const safeCurrentRankMilestoneIndex = Math.floor(safeNumber(snapshot?.currentAccountRankMilestoneIndex, -1));
  const targetAchievementId = safeText(snapshot?.targetAchievementId);
  milestones.forEach((milestone, index) => {
    const milestoneId = safeText(milestone?.id);
    const item = document.createElement('li');
    item.className = 'tree-next-rank-advancement-milestone';
    if (milestoneId === targetAchievementId) {
      item.classList.add('is-target', 'is-selected');
    }
    if (index === safeCurrentRankMilestoneIndex) {
      item.classList.add('is-current-rank');
    }
    if (index <= highestMetMilestoneIndex || index <= safeRunIndex) {
      item.classList.add('is-passed');
    } else {
      item.classList.add('is-upcoming');
    }
    const risePx = Math.round(index * 7);
    item.style.setProperty('--rank-node-rise', `${risePx}px`);

    const nodeElement = document.createElement('button');
    nodeElement.type = 'button';
    nodeElement.className = 'tree-next-rank-advancement-milestone-node tree-next-rank-advancement-milestone-button';
    nodeElement.style.setProperty(
      '--rank-node-bg',
      resolveRankAdvancementMilestoneBackground(milestone?.title || milestone?.requiredRank),
    );
    nodeElement.setAttribute(
      'data-selected-label',
      safeText(milestone?.title || milestone?.requiredRank || 'Rank'),
    );
    nodeElement.setAttribute('aria-label', `View ${safeText(milestone?.title || 'Rank')} requirements`);
    nodeElement.setAttribute('aria-pressed', milestoneId === targetAchievementId ? 'true' : 'false');
    if (milestoneId) {
      nodeElement.dataset.rankAdvancementSelectId = milestoneId;
      nodeElement.addEventListener('click', () => {
        if (!milestoneId || milestoneId === rankAdvancementSelectedMilestoneId) {
          return;
        }
        rankAdvancementSelectedMilestoneId = milestoneId;
        const overviewContext = resolveAccountOverviewPanelContext();
        const homeNode = overviewContext?.homeNode
          || resolveNodeById(resolvePreferredGlobalHomeNodeId())
          || resolveNodeById('root');
        rankAdvancementSnapshot = buildRankAdvancementSnapshotFromPayloads(
          rankAdvancementCachedAchievementsPayload,
          rankAdvancementCachedGoodLifePayload,
          homeNode,
        );
        rankAdvancementLastRenderSignature = '';
        syncRankAdvancementPanelVisuals();
      });
    } else {
      nodeElement.disabled = true;
    }

    const iconElement = document.createElement('img');
    iconElement.className = 'tree-next-rank-advancement-milestone-icon';
    iconElement.src = resolveRankAdvancementMilestoneIconPath(milestone);
    iconElement.alt = `${safeText(milestone?.title || 'Rank')} icon`;
    iconElement.loading = 'lazy';
    iconElement.decoding = 'async';

    const stemElement = document.createElement('span');
    stemElement.className = 'tree-next-rank-advancement-milestone-stem';

    nodeElement.append(iconElement);
    item.append(nodeElement, stemElement);
    fragment.append(item);
  });
  rankAdvancementMilestonesElement.append(fragment);
}

function syncRankAdvancementPanelPosition(layoutInput = state.layout) {
  if (!isRankAdvancementPanelAvailable()) {
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

  rankAdvancementPanelElement.style.setProperty('--tree-next-rank-advancement-left', `${clampedLeft}px`);
  rankAdvancementPanelElement.style.setProperty('--tree-next-rank-advancement-top', `${clampedTop}px`);
  rankAdvancementPanelElement.style.setProperty('--tree-next-rank-advancement-width', `${panelWidth}px`);
  rankAdvancementPanelElement.style.setProperty('--tree-next-rank-advancement-height', `${clampedHeight}px`);
  rankAdvancementPanelElement.classList.remove('is-positioning');
}

function syncRankAdvancementPanelVisibility() {
  if (!isRankAdvancementPanelAvailable()) {
    return;
  }
  const isVisible = Boolean(state.ui?.rankAdvancementVisible);
  rankAdvancementPanelElement.classList.toggle('is-hidden', !isVisible);
  rankAdvancementPanelElement.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
}

function syncRankAdvancementPanelVisuals() {
  if (!isRankAdvancementPanelAvailable()) {
    return;
  }

  const overviewContext = resolveAccountOverviewPanelContext();
  const homeNode = overviewContext?.homeNode || resolveNodeById(resolvePreferredGlobalHomeNodeId()) || resolveNodeById('root');
  if (Boolean(state.ui?.rankAdvancementVisible)) {
    maybeRefreshRankAdvancementSnapshot({ homeNode });
  }

  const snapshot = rankAdvancementSnapshot && typeof rankAdvancementSnapshot === 'object'
    ? rankAdvancementSnapshot
    : buildRankAdvancementSnapshotFromPayloads(null, null, homeNode);
  const renderSignature = resolveRankAdvancementRenderSignature(snapshot);
  if (renderSignature === rankAdvancementLastRenderSignature) {
    return;
  }
  rankAdvancementLastRenderSignature = renderSignature;

  const targetIsCurrentRun = (
    Boolean(snapshot?.hasMonthlyRankReward)
    && safeText(snapshot?.targetAchievementId) === safeText(snapshot?.runMilestoneId)
  );
  const isInspectingCustomRank = (
    safeText(snapshot?.targetAchievementId)
    && safeText(snapshot?.targetAchievementId) !== safeText(snapshot?.defaultTargetAchievementId)
  );
  const targetMilestoneIndex = Math.floor(safeNumber(snapshot?.targetMilestoneIndex, -1));
  const highestMetMilestoneIndex = Math.floor(safeNumber(snapshot?.highestMetMilestoneIndex, -1));
  const runMilestoneIndex = Math.floor(safeNumber(snapshot?.runMilestoneIndex, -1));
  const isInspectingPassedRank = Boolean(
    isInspectingCustomRank
    && targetMilestoneIndex >= 0
    && (
      targetMilestoneIndex <= highestMetMilestoneIndex
      || targetMilestoneIndex <= runMilestoneIndex
    )
  );
  setAccountOverviewText(
    rankAdvancementTargetPrefixElement,
    isInspectingCustomRank
      ? 'Rank Preview'
      : (targetIsCurrentRun ? 'Current highest monthly run' : 'Keep it going! Running for'),
  );
  setAccountOverviewText(rankAdvancementTargetRankElement, snapshot?.targetRankTitle || 'Rank');
  if (rankAdvancementAcquiredSinceElement instanceof HTMLElement) {
    const acquiredSinceDateLabel = safeText(snapshot?.targetAcquiredSinceDateLabel);
    const showAcquiredSince = Boolean(isInspectingCustomRank && isInspectingPassedRank && acquiredSinceDateLabel);
    rankAdvancementAcquiredSinceElement.hidden = !showAcquiredSince;
    rankAdvancementAcquiredSinceElement.textContent = showAcquiredSince
      ? `Acquired since ${acquiredSinceDateLabel}`
      : '';
  }
  if (rankAdvancementRewardPreviewElement instanceof HTMLElement) {
    rankAdvancementRewardPreviewElement.textContent = `Rank Bonus: $${formatRankAdvancementRewardCurrency(snapshot?.targetRewardUsd)}`;
  }
  if (rankAdvancementGoodLifePreviewElement instanceof HTMLElement) {
    const showGoodLifePreview = Boolean(snapshot?.showTargetGoodLifePreview);
    rankAdvancementGoodLifePreviewElement.hidden = !showGoodLifePreview;
    rankAdvancementGoodLifePreviewElement.textContent = showGoodLifePreview
      ? `Good life Bonus: $${formatRankAdvancementRewardCurrency(snapshot?.targetGoodLifePreviewUsd)}`
      : '';
  }
  const targetRequiredPersonalBv = Math.max(0, Math.floor(safeNumber(snapshot?.targetRequiredPersonalBv, 0)));
  const targetRequiredDirectPerSide = Math.max(0, Math.floor(safeNumber(snapshot?.targetRequiredDirectPerSide, 0)));
  const targetRequiredCycles = Math.max(0, Math.floor(safeNumber(snapshot?.targetRequiredCycles, 0)));
  const targetPersonalMet = Boolean(snapshot?.targetPersonalMet);
  const targetDirectMet = Boolean(snapshot?.targetDirectMet);
  const targetCyclesMet = Boolean(snapshot?.targetCyclesMet);
  setAccountOverviewText(
    rankAdvancementPersonalRequirementElement,
    targetRequiredPersonalBv > 0
      ? `Minimum ${formatInteger(targetRequiredPersonalBv, 0)} Personal BV`
      : 'No personal BV requirement',
  );
  setAccountOverviewText(
    rankAdvancementDirectRequirementElement,
    targetRequiredDirectPerSide > 0
      ? (
        `${formatInteger(targetRequiredDirectPerSide, 0)}:${formatInteger(targetRequiredDirectPerSide, 0)} `
        + 'Active Direct Sponsors (50 Personal BV each)'
      )
      : 'No direct sponsor requirement',
  );
  setAccountOverviewText(
    rankAdvancementCyclesRequirementElement,
    targetRequiredCycles > 0
      ? `${formatInteger(snapshot?.currentCycles, 0)} / ${formatInteger(targetRequiredCycles, 0)} Cycles`
      : `${formatInteger(snapshot?.currentCycles, 0)} Cycles`,
  );
  setAccountOverviewText(
    rankAdvancementMembersRequirementElement,
    snapshot?.targetMembersRequirementLabel || 'No member rank requirement',
  );

  if (isInspectingCustomRank && !isInspectingPassedRank) {
    if (rankAdvancementPersonalRequirementElement instanceof HTMLElement) {
      rankAdvancementPersonalRequirementElement.classList.remove('is-met');
      rankAdvancementPersonalRequirementElement.classList.add('is-neutral');
    }
    if (rankAdvancementDirectRequirementElement instanceof HTMLElement) {
      rankAdvancementDirectRequirementElement.classList.remove('is-met');
      rankAdvancementDirectRequirementElement.classList.add('is-neutral');
    }
    if (rankAdvancementCyclesRequirementElement instanceof HTMLElement) {
      rankAdvancementCyclesRequirementElement.classList.remove('is-met');
      rankAdvancementCyclesRequirementElement.classList.add('is-neutral');
    }
    if (rankAdvancementMembersRequirementElement instanceof HTMLElement) {
      rankAdvancementMembersRequirementElement.classList.remove('is-met');
      rankAdvancementMembersRequirementElement.classList.add('is-neutral');
    }
  } else {
    const forceMetForPassedPreview = Boolean(isInspectingPassedRank);
    const targetMemberMet = Boolean(snapshot?.targetMemberMet);
    const renderPersonalMet = forceMetForPassedPreview || targetPersonalMet;
    const renderDirectMet = forceMetForPassedPreview || targetDirectMet;
    const renderCyclesMet = forceMetForPassedPreview || targetCyclesMet;
    const renderMembersMet = forceMetForPassedPreview || targetMemberMet;
    if (rankAdvancementPersonalRequirementElement instanceof HTMLElement) {
      rankAdvancementPersonalRequirementElement.classList.toggle('is-met', renderPersonalMet);
      rankAdvancementPersonalRequirementElement.classList.toggle('is-neutral', !renderPersonalMet);
    }
    if (rankAdvancementDirectRequirementElement instanceof HTMLElement) {
      rankAdvancementDirectRequirementElement.classList.toggle('is-met', renderDirectMet);
      rankAdvancementDirectRequirementElement.classList.toggle('is-neutral', !renderDirectMet);
    }
    if (rankAdvancementCyclesRequirementElement instanceof HTMLElement) {
      rankAdvancementCyclesRequirementElement.classList.toggle('is-met', renderCyclesMet);
      rankAdvancementCyclesRequirementElement.classList.toggle('is-neutral', !renderCyclesMet);
    }
    if (rankAdvancementMembersRequirementElement instanceof HTMLElement) {
      rankAdvancementMembersRequirementElement.classList.toggle('is-met', renderMembersMet);
      rankAdvancementMembersRequirementElement.classList.toggle('is-neutral', !renderMembersMet);
    }
  }

  if (rankAdvancementProgressFillElement instanceof HTMLElement) {
    rankAdvancementProgressFillElement.style.width = `${Math.max(0, Math.min(100, safeNumber(snapshot?.progressPercent, 0))).toFixed(2)}%`;
  }
  renderRankAdvancementMilestones(snapshot);

  const hasMonthlyRankReward = Boolean(snapshot?.hasMonthlyRankReward);
  if (rankAdvancementRewardIconElement instanceof HTMLImageElement) {
    rankAdvancementRewardIconElement.src = safeText(snapshot?.rewardIconPath || '/brand_assets/Icons/Achievements/diamond.svg');
    rankAdvancementRewardIconElement.alt = hasMonthlyRankReward
      ? `${safeText(snapshot?.runRankTitle || 'Rank')} reward icon`
      : 'Rank reward pending';
  }
  setAccountOverviewText(
    rankAdvancementRewardRankElement,
    hasMonthlyRankReward ? (snapshot?.runRankTitle || 'Rank') : 'Wait next month for details',
  );
  setAccountOverviewText(
    rankAdvancementRewardAmountElement,
    hasMonthlyRankReward
      ? `$${formatRankAdvancementRewardCurrency(snapshot?.rankRewardUsd)}`
      : '$0.00 USD',
  );
  if (rankAdvancementGoodLifeCopyElement instanceof HTMLElement) {
    rankAdvancementGoodLifeCopyElement.hidden = !Boolean(snapshot?.showGoodLifeBonus);
  }
  if (Boolean(snapshot?.showGoodLifeBonus)) {
    setAccountOverviewText(rankAdvancementGoodLifeRankElement, 'Good life Bonus');
    setAccountOverviewText(
      rankAdvancementGoodLifeAmountElement,
      `$${formatRankAdvancementRewardCurrency(snapshot?.goodLifeRewardUsd)}`,
    );
  }
  setAccountOverviewText(rankAdvancementAnalysisTotalBvElement, formatVolumeValue(snapshot?.totalBv));
  setAccountOverviewText(rankAdvancementAnalysisPersonalBvElement, formatVolumeValue(snapshot?.currentPersonalBv));
  setAccountOverviewText(rankAdvancementAnalysisCyclesElement, formatInteger(snapshot?.currentCycles, 0));

  if (rankAdvancementClaimButtonElement instanceof HTMLButtonElement) {
    const hasClaimed = Boolean(snapshot?.rankClaimed);
    const canClaim = Boolean(snapshot?.canClaimRankReward);
    rankAdvancementClaimButtonElement.classList.toggle('is-claimed', hasClaimed);
    if (rankAdvancementClaimInFlight) {
      rankAdvancementClaimButtonElement.disabled = true;
      rankAdvancementClaimButtonElement.textContent = 'Claiming...';
    } else if (hasClaimed) {
      rankAdvancementClaimButtonElement.disabled = true;
      rankAdvancementClaimButtonElement.textContent = 'Claimed for this month';
    } else if (canClaim) {
      rankAdvancementClaimButtonElement.disabled = false;
      rankAdvancementClaimButtonElement.textContent = 'Claim now';
    } else if (!hasMonthlyRankReward) {
      rankAdvancementClaimButtonElement.disabled = true;
      rankAdvancementClaimButtonElement.textContent = 'Wait next month for details';
    } else {
      rankAdvancementClaimButtonElement.disabled = true;
      rankAdvancementClaimButtonElement.textContent = 'Claim at the end of the month';
    }
  }
}

async function fetchRankAdvancementEndpoint(endpoint, options = {}) {
  const {
    method = 'GET',
    headers = {},
    body,
  } = options;
  try {
    const response = await fetch(endpoint, {
      method,
      cache: 'no-store',
      credentials: 'same-origin',
      headers,
      ...(typeof body === 'undefined' ? {} : { body }),
    });
    const payload = await response.json().catch(() => ({}));
    return {
      ok: response.ok,
      status: response.status,
      payload: payload && typeof payload === 'object' ? payload : {},
    };
  } catch {
    return {
      ok: false,
      status: 0,
      payload: {},
    };
  }
}

async function refreshRankAdvancementSnapshot(options = {}) {
  if (!isRankAdvancementPanelAvailable()) {
    return null;
  }
  if (rankAdvancementSyncInFlight && rankAdvancementSyncPromise) {
    return rankAdvancementSyncPromise;
  }

  const force = options?.force === true;
  const overviewContext = resolveAccountOverviewPanelContext();
  const homeNode = options?.homeNode
    || overviewContext?.homeNode
    || resolveNodeById(resolvePreferredGlobalHomeNodeId())
    || resolveNodeById('root')
    || null;
  const identityPayload = resolveAccountOverviewIdentityPayload(homeNode, {
    preferHomeNode: true,
    allowAnonymous: state.source !== 'member',
  });
  const hasIdentity = Boolean(
    safeText(identityPayload?.userId)
    || safeText(identityPayload?.username)
    || safeText(identityPayload?.email),
  );
  if (state.source === 'member' && !hasIdentity) {
    rankAdvancementSnapshot = buildRankAdvancementSnapshotFromPayloads(null, null, homeNode);
    rankAdvancementDataVersion += 1;
    rankAdvancementLastRenderSignature = '';
    syncRankAdvancementPanelVisuals();
    return rankAdvancementSnapshot;
  }

  const identityKey = resolveAccountOverviewIdentityKey(identityPayload);
  const identityChanged = identityKey !== rankAdvancementIdentityKey;
  const nowMs = Date.now();
  const hasSuccessfulSync = rankAdvancementLastSyncedAtMs > 0;
  const minimumIntervalMs = hasSuccessfulSync
    ? resolveRankAdvancementSyncIntervalMs()
    : resolveRankAdvancementSyncIntervalMs({ forRetry: true });
  if (
    !force
    && !identityChanged
    && rankAdvancementLastRequestAtMs > 0
    && (nowMs - rankAdvancementLastRequestAtMs) < minimumIntervalMs
  ) {
    return rankAdvancementSnapshot;
  }

  rankAdvancementIdentityKey = identityKey;
  rankAdvancementLastRequestAtMs = nowMs;
  rankAdvancementSyncInFlight = true;
  rankAdvancementLoading = true;
  syncRankAdvancementPanelVisuals();
  rankAdvancementSyncPromise = (async () => {
    const requestHeaders = buildRankAdvancementRequestHeaders();
    const [achievementsResponse, goodLifeResponse] = await Promise.all([
      fetchRankAdvancementEndpoint(MEMBER_ACHIEVEMENTS_API, {
        method: 'GET',
        headers: requestHeaders,
      }),
      fetchRankAdvancementEndpoint(MEMBER_GOOD_LIFE_MONTHLY_API, {
        method: 'GET',
        headers: requestHeaders,
      }),
    ]);

    if (achievementsResponse.ok && achievementsResponse.payload && typeof achievementsResponse.payload === 'object') {
      rankAdvancementCachedAchievementsPayload = achievementsResponse.payload;
    }
    if (goodLifeResponse.ok && goodLifeResponse.payload && typeof goodLifeResponse.payload === 'object') {
      rankAdvancementCachedGoodLifePayload = goodLifeResponse.payload;
    }

    const nextSnapshot = buildRankAdvancementSnapshotFromPayloads(
      rankAdvancementCachedAchievementsPayload,
      rankAdvancementCachedGoodLifePayload,
      homeNode,
    );
    rankAdvancementSnapshot = nextSnapshot;
    rankAdvancementDataVersion += 1;
    rankAdvancementLastRenderSignature = '';
    if (achievementsResponse.ok || goodLifeResponse.ok) {
      rankAdvancementLastSyncedAtMs = Date.now();
    }
    return rankAdvancementSnapshot;
  })().catch((error) => {
    console.warn('[TreeNext] Rank advancement sync failed:', error);
    if (!rankAdvancementSnapshot) {
      rankAdvancementSnapshot = buildRankAdvancementSnapshotFromPayloads(null, null, homeNode);
      rankAdvancementDataVersion += 1;
      rankAdvancementLastRenderSignature = '';
    }
    return rankAdvancementSnapshot;
  }).finally(() => {
    rankAdvancementSyncPromise = null;
    rankAdvancementSyncInFlight = false;
    rankAdvancementLoading = false;
    syncRankAdvancementPanelVisuals();
  });

  return rankAdvancementSyncPromise;
}

function maybeRefreshRankAdvancementSnapshot(options = {}) {
  if (!isRankAdvancementPanelAvailable()) {
    return;
  }
  if (!Boolean(state.ui?.rankAdvancementVisible) && options?.force !== true) {
    return;
  }
  void refreshRankAdvancementSnapshot(options);
}

async function claimRankAdvancementMonthlyReward() {
  if (!isRankAdvancementPanelAvailable()) {
    return;
  }
  if (rankAdvancementClaimInFlight || rankAdvancementSyncInFlight) {
    return;
  }
  const snapshot = rankAdvancementSnapshot && typeof rankAdvancementSnapshot === 'object'
    ? rankAdvancementSnapshot
    : buildRankAdvancementSnapshotFromPayloads();
  const claimAchievementId = safeText(snapshot?.claimAchievementId);
  if (!claimAchievementId) {
    setRankAdvancementFeedback('No rank reward is claimable yet for this month.', { isError: true });
    return;
  }
  if (state.source !== 'member') {
    setRankAdvancementFeedback('Rank reward claims are available only for member sessions.', { isError: true });
    return;
  }
  const authToken = safeText(state.session?.authToken);
  if (!authToken) {
    setRankAdvancementFeedback('Sign in again before claiming rank rewards.', { isError: true });
    return;
  }

  rankAdvancementClaimInFlight = true;
  rankAdvancementLastRenderSignature = '';
  setRankAdvancementFeedback('Claiming monthly rank reward...', { persist: true });
  syncRankAdvancementPanelVisuals();

  try {
    const claimResponse = await fetchRankAdvancementEndpoint(
      `${MEMBER_ACHIEVEMENTS_API}/${encodeURIComponent(claimAchievementId)}/claim`,
      {
        method: 'POST',
        headers: buildRankAdvancementRequestHeaders(),
      },
    );
    if (!claimResponse.ok) {
      const errorMessage = safeText(claimResponse.payload?.error)
        || `Unable to claim rank reward (${claimResponse.status}).`;
      throw new Error(errorMessage);
    }

    const goodLifeResponse = await fetchRankAdvancementEndpoint(MEMBER_GOOD_LIFE_MONTHLY_API, {
      method: 'GET',
      headers: buildRankAdvancementRequestHeaders(),
    });
    if (claimResponse.payload && typeof claimResponse.payload === 'object') {
      rankAdvancementCachedAchievementsPayload = claimResponse.payload;
    }
    if (goodLifeResponse.ok && goodLifeResponse.payload && typeof goodLifeResponse.payload === 'object') {
      rankAdvancementCachedGoodLifePayload = goodLifeResponse.payload;
    }
    const overviewContext = resolveAccountOverviewPanelContext();
    const homeNode = overviewContext?.homeNode || resolveNodeById(resolvePreferredGlobalHomeNodeId()) || resolveNodeById('root');
    rankAdvancementSnapshot = buildRankAdvancementSnapshotFromPayloads(
      rankAdvancementCachedAchievementsPayload,
      rankAdvancementCachedGoodLifePayload,
      homeNode,
    );
    rankAdvancementDataVersion += 1;
    rankAdvancementLastRenderSignature = '';
    rankAdvancementLastSyncedAtMs = Date.now();
    const claimedLabel = safeText(rankAdvancementSnapshot?.rankClaimedTitle || snapshot?.claimAchievementTitle || 'Rank reward');
    setRankAdvancementFeedback(`${claimedLabel} claimed successfully.`, { isSuccess: true });
  } catch (error) {
    const message = error instanceof Error && error.message
      ? error.message
      : 'Unable to claim monthly rank reward.';
    setRankAdvancementFeedback(message, { isError: true, persist: true });
  } finally {
    rankAdvancementClaimInFlight = false;
    rankAdvancementLastRenderSignature = '';
    syncRankAdvancementPanelVisuals();
  }
}

function setRankAdvancementPanelVisible(isVisible) {
  const nextVisible = Boolean(isVisible);
  state.ui.rankAdvancementVisible = nextVisible;
  if (nextVisible) {
    state.ui.accountOverviewVisible = false;
    state.ui.infinityBuilderVisible = false;
    state.ui.preferredAccountsVisible = false;
    state.ui.myStoreVisible = false;
    syncAccountOverviewPanelVisibility();
    syncInfinityBuilderPanelVisibility();
    syncPreferredAccountsPanelVisibility();
    syncMyStorePanelVisibility();
    rankAdvancementLastRenderSignature = '';
    rankAdvancementSelectedMilestoneId = '';
    setRankAdvancementFeedback('');
    const overviewContext = resolveAccountOverviewPanelContext();
    const homeNode = overviewContext?.homeNode || resolveNodeById(resolvePreferredGlobalHomeNodeId()) || resolveNodeById('root');
    void refreshRankAdvancementSnapshot({ force: true, homeNode });
  }
  syncRankAdvancementPanelVisibility();
}

function initRankAdvancementPanel() {
  if (!isRankAdvancementPanelAvailable()) {
    return;
  }
  syncRankAdvancementPanelPosition();
  syncRankAdvancementPanelVisuals();
  syncRankAdvancementPanelVisibility();
  const overviewContext = resolveAccountOverviewPanelContext();
  const homeNode = overviewContext?.homeNode || resolveNodeById(resolvePreferredGlobalHomeNodeId()) || resolveNodeById('root');
  void refreshRankAdvancementSnapshot({ force: true, homeNode });
  setRankAdvancementFeedback('');

  if (rankAdvancementCloseButtonElement instanceof HTMLButtonElement) {
    rankAdvancementCloseButtonElement.addEventListener('click', () => {
      setRankAdvancementPanelVisible(false);
    });
  }
  if (rankAdvancementClaimButtonElement instanceof HTMLButtonElement) {
    rankAdvancementClaimButtonElement.addEventListener('click', () => {
      void claimRankAdvancementMonthlyReward();
    });
  }
}

function isPreferredAccountsPanelAvailable() {
  return preferredAccountsPanelElement instanceof HTMLElement;
}

function resolvePreferredAccountsSyncIntervalMs(options = {}) {
  if (options?.forRetry) {
    return ACCOUNT_OVERVIEW_REMOTE_SYNC_RETRY_INTERVAL_MS;
  }
  return document.visibilityState === 'hidden'
    ? TREE_NEXT_LIVE_SYNC_HIDDEN_INTERVAL_MS
    : TREE_NEXT_LIVE_SYNC_VISIBLE_INTERVAL_MS;
}

function normalizePreferredPlacementOptionValue(value, fallbackValue = PLACEMENT_OPTION_LEFT) {
  const normalized = normalizeCredentialValue(value);
  if (PREFERRED_ACCOUNTS_PLACEMENT_OPTIONS.includes(normalized)) {
    return normalized;
  }
  if (SPILLOVER_PLACEMENT_KEY_SET.has(normalized)) {
    return RIGHT_PLACEMENT_KEY_SET.has(normalized)
      ? PLACEMENT_OPTION_SPILLOVER_RIGHT
      : PLACEMENT_OPTION_SPILLOVER_LEFT;
  }
  if (EXTREME_PLACEMENT_KEY_SET.has(normalized)) {
    return RIGHT_PLACEMENT_KEY_SET.has(normalized)
      ? PLACEMENT_OPTION_EXTREME_RIGHT
      : PLACEMENT_OPTION_EXTREME_LEFT;
  }
  if (normalized === 'right') {
    return PLACEMENT_OPTION_RIGHT;
  }
  return PREFERRED_ACCOUNTS_PLACEMENT_OPTIONS.includes(fallbackValue)
    ? fallbackValue
    : PLACEMENT_OPTION_LEFT;
}

function resolvePreferredPlacementOptionFromMember(member = {}) {
  const placementLeg = normalizeCredentialValue(member?.placementLeg);
  if (placementLeg === PLACEMENT_OPTION_EXTREME_RIGHT) {
    return PLACEMENT_OPTION_EXTREME_RIGHT;
  }
  if (placementLeg === PLACEMENT_OPTION_EXTREME_LEFT) {
    return PLACEMENT_OPTION_EXTREME_LEFT;
  }
  if (SPILLOVER_PLACEMENT_KEY_SET.has(placementLeg)) {
    const spilloverSide = normalizeCredentialValue(member?.spilloverPlacementSide);
    return spilloverSide === 'right'
      ? PLACEMENT_OPTION_SPILLOVER_RIGHT
      : PLACEMENT_OPTION_SPILLOVER_LEFT;
  }
  return placementLeg === 'right'
    ? PLACEMENT_OPTION_RIGHT
    : PLACEMENT_OPTION_LEFT;
}

function resolvePreferredPlacementPayloadFromOption(placementOption) {
  const normalizedOption = normalizePreferredPlacementOptionValue(placementOption);
  if (normalizedOption === PLACEMENT_OPTION_RIGHT) {
    return {
      placementLeg: 'right',
      spilloverPlacementSide: '',
    };
  }
  if (normalizedOption === PLACEMENT_OPTION_EXTREME_LEFT) {
    return {
      placementLeg: PLACEMENT_OPTION_EXTREME_LEFT,
      spilloverPlacementSide: '',
    };
  }
  if (normalizedOption === PLACEMENT_OPTION_EXTREME_RIGHT) {
    return {
      placementLeg: PLACEMENT_OPTION_EXTREME_RIGHT,
      spilloverPlacementSide: '',
    };
  }
  if (normalizedOption === PLACEMENT_OPTION_SPILLOVER_RIGHT) {
    return {
      placementLeg: 'spillover',
      spilloverPlacementSide: 'right',
    };
  }
  if (normalizedOption === PLACEMENT_OPTION_SPILLOVER_LEFT) {
    return {
      placementLeg: 'spillover',
      spilloverPlacementSide: 'left',
    };
  }
  return {
    placementLeg: 'left',
    spilloverPlacementSide: '',
  };
}

function formatPreferredAccountsDate(value, fallback = '--') {
  const parsedMs = Date.parse(safeText(value));
  if (!Number.isFinite(parsedMs)) {
    return fallback;
  }
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    }).format(new Date(parsedMs));
  } catch {
    return fallback;
  }
}

function resolvePreferredAccountsOriginLabel(member = {}) {
  if (Boolean(member?.isAdminPlacement)) {
    return 'System Transfer';
  }
  return 'Direct Link';
}

function collectPreferredAccountsMemberIdentityKeys(member = {}) {
  return new Set([
    normalizeCredentialValue(member?.userId),
    normalizeCredentialValue(member?.id),
    normalizeCredentialValue(member?.memberUsername || member?.username),
    normalizeCredentialValue(member?.email),
  ].filter(Boolean));
}

function collectPreferredAccountsInvoiceIdentityKeys(invoice = {}) {
  return [
    normalizeCredentialValue(invoice?.buyerUserId),
    normalizeCredentialValue(invoice?.buyerUsername),
    normalizeCredentialValue(invoice?.buyerEmail),
  ].filter(Boolean);
}

function doesInvoiceMatchPreferredAccountsMember(invoice = {}, member = {}) {
  const memberIdentityKeys = collectPreferredAccountsMemberIdentityKeys(member);
  if (memberIdentityKeys.size === 0) {
    return false;
  }
  const invoiceIdentityKeys = collectPreferredAccountsInvoiceIdentityKeys(invoice);
  return invoiceIdentityKeys.some((identityKey) => memberIdentityKeys.has(identityKey));
}

function resolvePreferredAccountsOwnerUsernameKey() {
  if (state.source === 'admin') {
    return '';
  }
  const homeNode = resolveNodeById(resolvePreferredGlobalHomeNodeId()) || resolveNodeById('root');
  const candidates = [
    homeNode?.username,
    homeNode?.memberCode,
    state.session?.username,
    state.session?.memberUsername,
    state.session?.member_username,
  ];
  for (const candidate of candidates) {
    const resolved = normalizeCredentialValue(safeText(candidate).replace(/^@+/, ''));
    if (resolved && resolved !== normalizeCredentialValue(ADMIN_ROOT_USERNAME)) {
      return resolved;
    }
  }
  return '';
}

function isPreferredAccountsMemberCandidate(member = {}) {
  const packageKey = normalizeCredentialValue(member?.enrollmentPackage);
  if (packageKey === FREE_ACCOUNT_PACKAGE_KEY) {
    return true;
  }
  const rankKey = normalizeCredentialValue(member?.accountRank || member?.rank);
  return FREE_ACCOUNT_RANK_KEY_SET.has(rankKey);
}

function resolvePreferredAccountsDisplayName(member = {}) {
  return safeText(
    member?.fullName
    || member?.name
    || member?.memberUsername
    || member?.username
    || member?.email
    || 'Preferred Customer',
  ) || 'Preferred Customer';
}

function buildPreferredAccountsRowsFromData(membersInput = [], invoicesInput = []) {
  const safeMembers = Array.isArray(membersInput) ? membersInput : [];
  const safeInvoices = Array.isArray(invoicesInput) ? invoicesInput : [];
  const ownerUsernameKey = resolvePreferredAccountsOwnerUsernameKey();

  return safeMembers
    .filter((member) => {
      if (!member || typeof member !== 'object') {
        return false;
      }
      if (!isPreferredAccountsMemberCandidate(member)) {
        return false;
      }
      if (!ownerUsernameKey) {
        return true;
      }
      const sponsorUsernameKey = normalizeCredentialValue(
        safeText(member?.sponsorUsername || member?.sponsor_username).replace(/^@+/, ''),
      );
      if (!sponsorUsernameKey) {
        return false;
      }
      return sponsorUsernameKey === ownerUsernameKey;
    })
    .map((member) => {
      const memberId = safeText(
        member?.id
        || member?.userId
        || member?.memberUsername
        || member?.username
        || member?.email,
      );
      if (!memberId) {
        return null;
      }

      const matchedInvoices = safeInvoices.filter((invoice) => doesInvoiceMatchPreferredAccountsMember(invoice, member));
      const totals = matchedInvoices.reduce((accumulator, invoice) => {
        accumulator.totalSpend += Math.max(0, safeNumber(invoice?.amount, 0));
        accumulator.totalBv += Math.max(0, Math.floor(safeNumber(invoice?.bp, 0)));
        const invoiceCreatedAtMs = Date.parse(safeText(invoice?.createdAt));
        if (Number.isFinite(invoiceCreatedAtMs) && invoiceCreatedAtMs > accumulator.lastPurchaseAtMs) {
          accumulator.lastPurchaseAtMs = invoiceCreatedAtMs;
          accumulator.lastPurchaseAt = safeText(invoice?.createdAt);
        }
        return accumulator;
      }, {
        totalSpend: 0,
        totalBv: 0,
        lastPurchaseAtMs: 0,
        lastPurchaseAt: '',
      });

      const createdAt = safeText(member?.createdAt);
      const createdAtMs = Date.parse(createdAt);
      const avatarSeed = safeText(
        member?.id
        || member?.userId
        || member?.memberUsername
        || member?.username
        || member?.email
        || memberId,
      );
      const avatarPalette = resolveNodeAvatarPalette(`preferred-accounts:${avatarSeed}`, {
        node: member,
        variant: 'ocean',
      });

      return {
        memberId,
        member,
        displayName: resolvePreferredAccountsDisplayName(member),
        totalSpend: Math.round((totals.totalSpend + Number.EPSILON) * 100) / 100,
        totalBv: Math.max(0, Math.floor(totals.totalBv)),
        preferredSince: createdAt,
        originLabel: resolvePreferredAccountsOriginLabel(member),
        placementOption: resolvePreferredPlacementOptionFromMember(member),
        avatarPalette,
        avatarSeed,
        createdAtMs: Number.isFinite(createdAtMs) ? createdAtMs : 0,
        lastPurchaseAt: totals.lastPurchaseAt,
        lastPurchaseAtMs: totals.lastPurchaseAtMs,
      };
    })
    .filter(Boolean)
    .sort((left, right) => {
      if (right.lastPurchaseAtMs !== left.lastPurchaseAtMs) {
        return right.lastPurchaseAtMs - left.lastPurchaseAtMs;
      }
      return right.createdAtMs - left.createdAtMs;
    });
}

function resolvePreferredAccountsRowsSignature(rowsInput = []) {
  const rows = Array.isArray(rowsInput) ? rowsInput : [];
  return rows.map((row) => [
    safeText(row?.memberId),
    safeText(row?.displayName),
    Number.isFinite(Number(row?.totalSpend)) ? Number(row.totalSpend).toFixed(2) : '0.00',
    formatInteger(row?.totalBv, 0),
    safeText(row?.preferredSince),
    safeText(row?.originLabel),
    safeText(row?.placementOption),
    safeText(row?.lastPurchaseAt),
  ].join('|')).join('~');
}

async function fetchPreferredAccountsStoreInvoices() {
  const response = await fetch(STORE_INVOICES_API, {
    method: 'GET',
    cache: 'no-store',
    credentials: 'same-origin',
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMessage = safeText(payload?.error) || `Unable to load store invoices (${response.status}).`;
    throw new Error(errorMessage);
  }
  return Array.isArray(payload?.invoices) ? payload.invoices : [];
}

function resolvePreferredAccountsSelectedRow() {
  return preferredAccountsRows.find((row) => row.memberId === preferredAccountsSelectedMemberId) || null;
}

function clearPreferredAccountsFeedbackTimer() {
  const timerId = Math.floor(safeNumber(preferredAccountsFeedbackTimerId, 0));
  if (timerId > 0) {
    window.clearTimeout(timerId);
  }
  preferredAccountsFeedbackTimerId = 0;
}

function setPreferredAccountsFeedback(message = '', options = {}) {
  if (!(preferredAccountsFeedbackElement instanceof HTMLElement)) {
    return;
  }

  clearPreferredAccountsFeedbackTimer();
  const safeMessage = safeText(message);
  preferredAccountsFeedbackElement.textContent = safeMessage;
  preferredAccountsFeedbackElement.classList.remove('is-visible', 'is-error', 'is-success');

  if (!safeMessage) {
    return;
  }

  if (options?.isError) {
    preferredAccountsFeedbackElement.classList.add('is-error');
  } else if (options?.isSuccess) {
    preferredAccountsFeedbackElement.classList.add('is-success');
  }
  preferredAccountsFeedbackElement.classList.add('is-visible');
  if (options?.persist !== true) {
    preferredAccountsFeedbackTimerId = window.setTimeout(() => {
      preferredAccountsFeedbackTimerId = 0;
      preferredAccountsFeedbackElement.classList.remove('is-visible', 'is-error', 'is-success');
      preferredAccountsFeedbackElement.textContent = '';
    }, 4200);
  }
}

function syncPreferredAccountsPanelPosition(layoutInput = state.layout) {
  if (!isPreferredAccountsPanelAvailable()) {
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

  preferredAccountsPanelElement.style.setProperty('--tree-next-preferred-accounts-left', `${clampedLeft}px`);
  preferredAccountsPanelElement.style.setProperty('--tree-next-preferred-accounts-top', `${clampedTop}px`);
  preferredAccountsPanelElement.style.setProperty('--tree-next-preferred-accounts-width', `${panelWidth}px`);
  preferredAccountsPanelElement.style.setProperty('--tree-next-preferred-accounts-height', `${clampedHeight}px`);
  preferredAccountsPanelElement.classList.remove('is-positioning');
}

function syncPreferredAccountsPanelVisuals() {
  if (!isPreferredAccountsPanelAvailable()) {
    return;
  }

  if (state.ui?.preferredAccountsVisible) {
    maybeRefreshPreferredAccountsSnapshot();
  }

  const selectedRow = resolvePreferredAccountsSelectedRow();
  const hasSelection = Boolean(selectedRow);
  const rowsSignature = preferredAccountsRows.map((row) => [
    row.memberId,
    row.displayName,
    row.totalSpend,
    row.totalBv,
    row.preferredSince,
    row.originLabel,
    row.placementOption,
    row.lastPurchaseAt,
  ].join('|')).join('~');
  const renderSignature = [
    preferredAccountsDataVersion,
    preferredAccountsSelectedMemberId,
    rowsSignature,
    state.ui?.preferredAccountsSaving ? '1' : '0',
  ].join('::');
  if (renderSignature === preferredAccountsLastRenderSignature) {
    return;
  }
  preferredAccountsLastRenderSignature = renderSignature;

  if (preferredAccountsNameElement instanceof HTMLElement) {
    preferredAccountsNameElement.textContent = hasSelection
      ? selectedRow.displayName
      : 'No preferred customer selected';
  }
  if (preferredAccountsTotalSpendElement instanceof HTMLElement) {
    preferredAccountsTotalSpendElement.textContent = hasSelection
      ? formatEnrollCurrency(selectedRow.totalSpend)
      : formatEnrollCurrency(0);
  }
  if (preferredAccountsTotalBvElement instanceof HTMLElement) {
    preferredAccountsTotalBvElement.textContent = hasSelection
      ? `${formatInteger(selectedRow.totalBv)} BV`
      : '0 BV';
  }
  if (preferredAccountsSinceElement instanceof HTMLElement) {
    preferredAccountsSinceElement.textContent = hasSelection
      ? formatPreferredAccountsDate(selectedRow.preferredSince)
      : '--';
  }
  if (preferredAccountsOriginElement instanceof HTMLElement) {
    preferredAccountsOriginElement.textContent = hasSelection
      ? selectedRow.originLabel
      : '--';
  }
  if (preferredAccountsAvatarElement instanceof HTMLElement) {
    if (hasSelection) {
      preferredAccountsAvatarElement.style.backgroundImage = resolveCssGradientFromPalette(selectedRow.avatarPalette);
    } else {
      preferredAccountsAvatarElement.style.backgroundImage = resolveCssGradientFromPalette(
        resolveNodeAvatarPalette('preferred-accounts:empty', { variant: 'neutral' }),
      );
    }
  }
  if (preferredAccountsAvatarInitialsElement instanceof HTMLElement) {
    preferredAccountsAvatarInitialsElement.textContent = hasSelection
      ? resolveInitials(selectedRow.displayName)
      : 'PA';
  }

  if (preferredAccountsPlacementPlanInput instanceof HTMLSelectElement) {
    preferredAccountsPlacementPlanInput.disabled = !hasSelection || Boolean(state.ui?.preferredAccountsSaving);
    preferredAccountsPlacementPlanInput.value = hasSelection
      ? normalizePreferredPlacementOptionValue(selectedRow.placementOption)
      : PLACEMENT_OPTION_LEFT;
  }

  if (preferredAccountsSaveButtonElement instanceof HTMLButtonElement) {
    const isSaving = Boolean(state.ui?.preferredAccountsSaving);
    preferredAccountsSaveButtonElement.disabled = !hasSelection || isSaving;
    preferredAccountsSaveButtonElement.classList.toggle('is-loading', isSaving);
    preferredAccountsSaveButtonElement.setAttribute('aria-busy', isSaving ? 'true' : 'false');
    preferredAccountsSaveButtonElement.textContent = isSaving ? 'Saving Plan' : 'Save Profile Plan';
  }

  if (preferredAccountsEmptyElement instanceof HTMLElement) {
    preferredAccountsEmptyElement.style.display = preferredAccountsRows.length > 0 ? 'none' : '';
  }

  if (preferredAccountsListElement instanceof HTMLElement) {
    preferredAccountsListElement.innerHTML = '';
    const rowsFragment = document.createDocumentFragment();
    for (const row of preferredAccountsRows) {
      const rowButton = document.createElement('button');
      rowButton.type = 'button';
      rowButton.className = `tree-next-preferred-accounts-list-item${row.memberId === preferredAccountsSelectedMemberId ? ' is-active' : ''}`;
      rowButton.dataset.preferredAccountsMemberId = row.memberId;

      const rowContent = document.createElement('div');
      rowContent.className = 'tree-next-preferred-accounts-list-row';

      const avatarDot = document.createElement('span');
      avatarDot.className = 'tree-next-preferred-accounts-list-avatar';
      avatarDot.style.backgroundImage = resolveCssGradientFromPalette(row.avatarPalette);
      avatarDot.textContent = resolveInitials(row.displayName);

      const rowCopy = document.createElement('div');
      rowCopy.className = 'tree-next-preferred-accounts-list-copy';

      const rowName = document.createElement('p');
      rowName.className = 'tree-next-preferred-accounts-list-name';
      rowName.textContent = row.displayName;
      rowCopy.append(rowName);
      rowContent.append(avatarDot, rowCopy);
      rowButton.append(rowContent);
      rowsFragment.append(rowButton);
    }
    preferredAccountsListElement.append(rowsFragment);
  }
}

function syncPreferredAccountsPanelVisibility() {
  if (!isPreferredAccountsPanelAvailable()) {
    return;
  }

  const isVisible = Boolean(state.ui?.preferredAccountsVisible);
  preferredAccountsPanelElement.classList.toggle('is-hidden', !isVisible);
  preferredAccountsPanelElement.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
}

function setPreferredAccountsPanelVisible(isVisible) {
  const nextVisible = Boolean(isVisible);
  state.ui.preferredAccountsVisible = nextVisible;
  if (nextVisible) {
    state.ui.preferredAccountsSaving = false;
    state.ui.accountOverviewVisible = false;
    state.ui.infinityBuilderVisible = false;
    state.ui.rankAdvancementVisible = false;
    state.ui.myStoreVisible = false;
    syncAccountOverviewPanelVisibility();
    syncInfinityBuilderPanelVisibility();
    syncRankAdvancementPanelVisibility();
    syncMyStorePanelVisibility();
    preferredAccountsLastRenderSignature = '';
    setPreferredAccountsFeedback('');
    void refreshPreferredAccountsSnapshot({ force: true });
  }
  syncPreferredAccountsPanelVisibility();
}

async function refreshPreferredAccountsSnapshot(options = {}) {
  if (!isPreferredAccountsPanelAvailable()) {
    return null;
  }
  if (preferredAccountsSyncInFlight) {
    return preferredAccountsSyncPromise;
  }

  const force = options?.force === true;
  if (!force) {
    const referenceMs = preferredAccountsLastSyncedAtMs || preferredAccountsLastRequestAtMs;
    const refreshIntervalMs = preferredAccountsLastSyncedAtMs > 0
      ? resolvePreferredAccountsSyncIntervalMs()
      : resolvePreferredAccountsSyncIntervalMs({ forRetry: true });
    if (referenceMs > 0 && (Date.now() - referenceMs) < refreshIntervalMs) {
      return preferredAccountsRows;
    }
  }

  preferredAccountsSyncInFlight = true;
  preferredAccountsLastRequestAtMs = Date.now();
  preferredAccountsSyncPromise = (async () => {
    const members = await fetchTreeNextLiveRegisteredMembers();
    let invoices = [];
    try {
      invoices = await fetchPreferredAccountsStoreInvoices();
    } catch (error) {
      console.warn('[TreeNext] Preferred accounts invoice fetch failed:', error);
      invoices = [];
    }
    const nextRows = buildPreferredAccountsRowsFromData(members, invoices);
    const nextRowsSignature = resolvePreferredAccountsRowsSignature(nextRows);
    const rowsChanged = nextRowsSignature !== preferredAccountsRowsDataSignature;
    preferredAccountsInvoices = invoices;
    if (rowsChanged) {
      preferredAccountsRows = nextRows;
      preferredAccountsRowsDataSignature = nextRowsSignature;
      preferredAccountsDataVersion += 1;
    }
    preferredAccountsLastSyncedAtMs = Date.now();

    const hasSelectedMember = preferredAccountsRows.some((row) => row.memberId === preferredAccountsSelectedMemberId);
    if (!hasSelectedMember) {
      preferredAccountsSelectedMemberId = preferredAccountsRows[0]?.memberId || '';
      preferredAccountsLastRenderSignature = '';
    }
    syncPreferredAccountsPanelVisuals();
    return preferredAccountsRows;
  })().finally(() => {
    preferredAccountsSyncPromise = null;
    preferredAccountsSyncInFlight = false;
  });

  return preferredAccountsSyncPromise;
}

function maybeRefreshPreferredAccountsSnapshot(options = {}) {
  if (!isPreferredAccountsPanelAvailable()) {
    return;
  }
  if (!Boolean(state.ui?.preferredAccountsVisible) && options?.force !== true) {
    return;
  }
  void refreshPreferredAccountsSnapshot(options);
}

async function submitPreferredAccountsPlacementPlan() {
  if (!(preferredAccountsPlacementPlanInput instanceof HTMLSelectElement)) {
    return;
  }
  if (Boolean(state.ui?.preferredAccountsSaving)) {
    return;
  }

  const selectedRow = resolvePreferredAccountsSelectedRow();
  if (!selectedRow) {
    setPreferredAccountsFeedback('Select a preferred customer first.', { isError: true });
    return;
  }

  const selectedPlacementOption = normalizePreferredPlacementOptionValue(
    preferredAccountsPlacementPlanInput.value,
    selectedRow.placementOption,
  );
  const placementPayload = resolvePreferredPlacementPayloadFromOption(selectedPlacementOption);
  const sponsorUsername = safeText(selectedRow.member?.sponsorUsername || selectedRow.member?.sponsor_username);

  state.ui.preferredAccountsSaving = true;
  syncPreferredAccountsPanelVisuals();
  setPreferredAccountsFeedback('Saving profile plan...', { persist: true });

  try {
    const response = await fetch(
      `${resolveEnrollRegisteredMembersApi()}/${encodeURIComponent(selectedRow.memberId)}/placement`,
      {
        method: 'PATCH',
        headers: buildTreeNextEnrollRequestHeaders({
          'Content-Type': 'application/json',
        }),
        credentials: 'same-origin',
        body: JSON.stringify({
          sponsorUsername,
          placementLeg: placementPayload.placementLeg,
          spilloverPlacementSide: placementPayload.spilloverPlacementSide,
          spilloverParentMode: 'auto',
          spilloverParentReference: '',
        }),
      },
    );

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const errorMessage = safeText(payload?.error) || `Unable to save placement plan (${response.status}).`;
      throw new Error(errorMessage);
    }

    selectedRow.placementOption = selectedPlacementOption;
    if (selectedRow.member && typeof selectedRow.member === 'object') {
      selectedRow.member.placementLeg = placementPayload.placementLeg;
      selectedRow.member.spilloverPlacementSide = placementPayload.spilloverPlacementSide;
    }
    preferredAccountsRowsDataSignature = resolvePreferredAccountsRowsSignature(preferredAccountsRows);
    preferredAccountsDataVersion += 1;
    preferredAccountsLastRenderSignature = '';
    setPreferredAccountsFeedback('Profile plan saved successfully.', { isSuccess: true });
    void refreshPreferredAccountsSnapshot({ force: true }).catch((error) => {
      console.warn('[TreeNext] Preferred accounts refresh after placement save failed:', error);
    });
    void syncTreeNextLiveNodes({ force: true, silent: true, reason: 'preferred-accounts-placement' });
  } catch (error) {
    const message = error instanceof Error && error.message
      ? error.message
      : 'Unable to save preferred account placement plan.';
    setPreferredAccountsFeedback(message, { isError: true, persist: true });
  } finally {
    state.ui.preferredAccountsSaving = false;
    syncPreferredAccountsPanelVisuals();
  }
}

function initPreferredAccountsPanel() {
  if (!isPreferredAccountsPanelAvailable()) {
    return;
  }

  syncPreferredAccountsPanelPosition();
  syncPreferredAccountsPanelVisuals();
  syncPreferredAccountsPanelVisibility();
  void refreshPreferredAccountsSnapshot({ force: true });

  if (preferredAccountsCloseButtonElement instanceof HTMLButtonElement) {
    preferredAccountsCloseButtonElement.addEventListener('click', () => {
      setPreferredAccountsPanelVisible(false);
    });
  }

  if (preferredAccountsPlacementPlanInput instanceof HTMLSelectElement) {
    preferredAccountsPlacementPlanInput.addEventListener('change', () => {
      setPreferredAccountsFeedback('');
    });
  }

  if (preferredAccountsSaveButtonElement instanceof HTMLButtonElement) {
    preferredAccountsSaveButtonElement.addEventListener('click', () => {
      void submitPreferredAccountsPlacementPlan();
    });
  }

  if (preferredAccountsListElement instanceof HTMLElement) {
    preferredAccountsListElement.addEventListener('click', (event) => {
      const targetElement = event.target instanceof HTMLElement
        ? event.target
        : null;
      const rowButton = targetElement?.closest('[data-preferred-accounts-member-id]');
      if (!(rowButton instanceof HTMLElement)) {
        return;
      }
      const memberId = safeText(rowButton.dataset.preferredAccountsMemberId);
      if (!memberId || memberId === preferredAccountsSelectedMemberId) {
        return;
      }
      preferredAccountsSelectedMemberId = memberId;
      preferredAccountsLastRenderSignature = '';
      setPreferredAccountsFeedback('');
      syncPreferredAccountsPanelVisuals();
    });
  }
}

function isMyStorePanelAvailable() {
  return myStorePanelElement instanceof HTMLElement;
}

function resolveMyStorePackageKeyFromValue(value) {
  const normalizedValue = normalizeCredentialValue(value);
  if (!normalizedValue) {
    return '';
  }
  if (MY_STORE_PACKAGE_DISPLAY_META[normalizedValue]) {
    return normalizedValue;
  }
  if (normalizedValue.includes('preferred') || normalizedValue.includes('free')) {
    return 'preferred-customer-pack';
  }
  if (normalizedValue.includes('legacy')) {
    return 'legacy-builder-pack';
  }
  if (normalizedValue.includes('infinity') || normalizedValue.includes('achiever')) {
    return 'infinity-builder-pack';
  }
  if (normalizedValue.includes('business')) {
    return 'business-builder-pack';
  }
  if (normalizedValue.includes('personal')) {
    return 'personal-builder-pack';
  }
  return '';
}

function resolveMyStoreCurrentPackageKey(homeNode = null) {
  const safeHomeNode = homeNode && typeof homeNode === 'object' ? homeNode : null;
  const session = state.session && typeof state.session === 'object' ? state.session : null;
  const candidates = [
    safeHomeNode?.enrollmentPackage,
    safeHomeNode?.enrollment_package,
    safeHomeNode?.accountPackage,
    safeHomeNode?.account_package,
    session?.enrollmentPackage,
    session?.enrollment_package,
    session?.accountPackage,
    session?.account_package,
    session?.package,
    session?.subscriptionPackage,
    session?.subscription_package,
    safeHomeNode?.rank,
    session?.rank,
  ];
  for (const candidate of candidates) {
    const packageKey = resolveMyStorePackageKeyFromValue(candidate);
    if (packageKey) {
      return packageKey;
    }
  }
  return 'preferred-customer-pack';
}

function resolveMyStoreUpgradePackageKeys(packageKey) {
  const normalizedPackageKey = resolveMyStorePackageKeyFromValue(packageKey);
  const upgradeKeys = MY_STORE_UPGRADE_PACKAGE_KEYS_BY_PACKAGE[normalizedPackageKey];
  return Array.isArray(upgradeKeys) ? [...upgradeKeys] : [];
}

function resolveMyStoreUpgradePackageLabel(packageKey) {
  const normalizedPackageKey = resolveMyStorePackageKeyFromValue(packageKey);
  const explicitLabel = safeText(MY_STORE_PACKAGE_DISPLAY_META[normalizedPackageKey]?.label);
  if (explicitLabel) {
    return explicitLabel;
  }
  const fallbackLabel = safeText(resolveEnrollPackageMeta(normalizedPackageKey)?.label);
  return fallbackLabel || 'Package Upgrade';
}

function resolveMyStoreUpgradeProductMeta(productKey = '') {
  const normalizedProductKey = normalizeCredentialValue(productKey);
  if (normalizedProductKey && MY_STORE_UPGRADE_PRODUCT_META[normalizedProductKey]) {
    return MY_STORE_UPGRADE_PRODUCT_META[normalizedProductKey];
  }
  return MY_STORE_UPGRADE_PRODUCT_META[MY_STORE_UPGRADE_DEFAULT_PRODUCT_KEY];
}

function resolveMyStorePackageSelectableProductCount(packageKey) {
  const packageMeta = resolveEnrollPackageMeta(packageKey);
  return Math.max(0, Math.floor(safeNumber(packageMeta?.selectableProducts, 0)));
}

function resolveMyStoreUpgradeDelta(currentPackageKey, targetPackageKey) {
  const normalizedCurrentPackage = resolveMyStorePackageKeyFromValue(currentPackageKey) || 'preferred-customer-pack';
  const normalizedTargetPackage = resolveMyStorePackageKeyFromValue(targetPackageKey);
  const currentPackageProducts = resolveMyStorePackageSelectableProductCount(normalizedCurrentPackage);
  const targetPackageProducts = resolveMyStorePackageSelectableProductCount(normalizedTargetPackage);
  const productGain = Math.max(0, targetPackageProducts - currentPackageProducts);
  const unitProductPrice = Math.max(0, safeNumber(MY_STORE_FEATURED_PRODUCT.price, 0));
  const unitProductBv = Math.max(0, Math.round(safeNumber(MY_STORE_UPGRADE_PRODUCT_UNIT_BV, 50)));
  const priceDue = Math.round((productGain * unitProductPrice) * 100) / 100;
  const bvGain = Math.max(0, Math.round(productGain * unitProductBv));
  return {
    currentPackageKey: normalizedCurrentPackage,
    targetPackageKey: normalizedTargetPackage,
    productGain,
    priceDue,
    bvGain,
  };
}

function resolveMyStoreStoreCode(homeNode = null) {
  const safeHomeNode = homeNode && typeof homeNode === 'object' ? homeNode : null;
  const session = state.session && typeof state.session === 'object' ? state.session : null;
  const candidates = [
    session?.publicStoreCode,
    session?.public_store_code,
    session?.storeCode,
    session?.store_code,
    session?.memberStoreCode,
    session?.member_store_code,
    safeHomeNode?.publicStoreCode,
    safeHomeNode?.public_store_code,
    safeHomeNode?.storeCode,
    safeHomeNode?.store_code,
  ];
  for (const candidate of candidates) {
    const storeCode = safeText(candidate).replace(/\s+/g, '');
    if (storeCode && storeCode.toLowerCase() !== 'none') {
      return storeCode;
    }
  }
  return '';
}

function resolveMyStoreShareLink(homeNode = null) {
  const fallbackPath = '/store.html';
  try {
    const shareUrl = new URL(fallbackPath, window.location.origin);
    const storeCode = resolveMyStoreStoreCode(homeNode);
    if (storeCode) {
      shareUrl.searchParams.set('store', storeCode);
    }
    return shareUrl.toString();
  } catch {
    return fallbackPath;
  }
}

function resolveMyStoreStep(stepValue = '') {
  const normalizedStep = normalizeCredentialValue(stepValue);
  return MY_STORE_VALID_STEPS.has(normalizedStep) ? normalizedStep : MY_STORE_STEP_CATALOG;
}

function buildMyStoreSelection(action, packageKey = '', currentPackageKey = '') {
  const normalizedAction = normalizeCredentialValue(action);
  const normalizedPackageKey = resolveMyStorePackageKeyFromValue(packageKey);
  const baseQuantity = Math.max(1, Math.round(safeNumber(MY_STORE_FEATURED_PRODUCT.quantity, 1)));
  const baseSelection = {
    action: 'featured',
    productKey: safeText(MY_STORE_FEATURED_PRODUCT.productKey || 'metacharge') || 'metacharge',
    packageKey: '',
    label: safeText(MY_STORE_FEATURED_PRODUCT.label) || 'MetaCharge',
    imageUrl: safeText(MY_STORE_FEATURED_PRODUCT.imageUrl),
    unitPrice: Math.max(0, safeNumber(MY_STORE_FEATURED_PRODUCT.price, 0)),
    unitBv: Math.max(0, Math.round(safeNumber(MY_STORE_FEATURED_PRODUCT.bv, 0))),
    quantity: baseQuantity,
    upgradeProductKey: '',
    upgradeProductLabel: '',
    upgradeProductImageUrl: '',
    upgradeProductQuantity: 0,
    upgradeProductUnitPrice: 0,
    upgradeProductUnitBv: 0,
  };
  if (normalizedAction !== 'upgrade' || !normalizedPackageKey) {
    return baseSelection;
  }
  const upgradeDelta = resolveMyStoreUpgradeDelta(currentPackageKey, normalizedPackageKey);
  const upgradeProduct = resolveMyStoreUpgradeProductMeta(MY_STORE_UPGRADE_DEFAULT_PRODUCT_KEY);
  const upgradeProductQuantity = Math.max(0, Math.round(safeNumber(upgradeDelta.productGain, 0)));
  const upgradeProductUnitPrice = Math.max(0, safeNumber(upgradeProduct.unitPrice, 0));
  const upgradeProductUnitBv = Math.max(0, Math.round(safeNumber(upgradeProduct.unitBv, 0)));
  const upgradeSubtotal = Math.round((upgradeProductQuantity * upgradeProductUnitPrice) * 100) / 100;
  const upgradeTotalBv = Math.max(0, Math.round(upgradeProductQuantity * upgradeProductUnitBv));
  return {
    ...baseSelection,
    action: 'upgrade',
    productKey: upgradeProduct.productKey,
    packageKey: normalizedPackageKey,
    label: resolveMyStoreUpgradePackageLabel(normalizedPackageKey),
    imageUrl: safeText(upgradeProduct.imageUrl) || baseSelection.imageUrl,
    unitPrice: Math.max(0, safeNumber(upgradeSubtotal, 0)),
    unitBv: Math.max(0, Math.round(safeNumber(upgradeTotalBv, 0))),
    quantity: 1,
    upgradeProductKey: upgradeProduct.productKey,
    upgradeProductLabel: safeText(upgradeProduct.label) || 'Upgrade Product',
    upgradeProductImageUrl: safeText(upgradeProduct.imageUrl),
    upgradeProductQuantity,
    upgradeProductUnitPrice,
    upgradeProductUnitBv,
  };
}

function resolveMyStoreSelection(currentPackageKey = '') {
  const selectionInput = state.ui?.myStoreSelection;
  const normalizedCurrentPackage = resolveMyStorePackageKeyFromValue(currentPackageKey) || 'preferred-customer-pack';
  if (!selectionInput || typeof selectionInput !== 'object') {
    return buildMyStoreSelection('featured', '', normalizedCurrentPackage);
  }
  const normalizedAction = normalizeCredentialValue(selectionInput.action);
  const normalizedPackageKey = resolveMyStorePackageKeyFromValue(selectionInput.packageKey);
  const isUpgrade = normalizedAction === 'upgrade' && Boolean(normalizedPackageKey);
  const fallbackSelection = isUpgrade
    ? buildMyStoreSelection('upgrade', normalizedPackageKey, normalizedCurrentPackage)
    : buildMyStoreSelection('featured', '', normalizedCurrentPackage);
  const quantityValue = Math.max(1, Math.round(safeNumber(selectionInput.quantity, fallbackSelection.quantity)));
  const quantity = isUpgrade ? 1 : quantityValue;
  let productKey = safeText(selectionInput.productKey || fallbackSelection.productKey) || fallbackSelection.productKey;
  let imageUrl = safeText(selectionInput.imageUrl || fallbackSelection.imageUrl) || fallbackSelection.imageUrl;
  let unitPrice = Math.max(0, safeNumber(selectionInput.unitPrice, fallbackSelection.unitPrice));
  let unitBv = Math.max(0, Math.round(safeNumber(selectionInput.unitBv, fallbackSelection.unitBv)));
  let upgradeProductKey = '';
  let upgradeProductLabel = '';
  let upgradeProductImageUrl = '';
  let upgradeProductQuantity = 0;
  let upgradeProductUnitPrice = 0;
  let upgradeProductUnitBv = 0;
  if (isUpgrade) {
    const upgradeDelta = resolveMyStoreUpgradeDelta(normalizedCurrentPackage, normalizedPackageKey);
    const selectedUpgradeProduct = resolveMyStoreUpgradeProductMeta(
      safeText(selectionInput.upgradeProductKey || selectionInput.productKey || fallbackSelection.upgradeProductKey),
    );
    upgradeProductQuantity = Math.max(0, Math.round(safeNumber(upgradeDelta.productGain, 0)));
    upgradeProductUnitPrice = Math.max(0, safeNumber(selectedUpgradeProduct.unitPrice, 0));
    upgradeProductUnitBv = Math.max(0, Math.round(safeNumber(selectedUpgradeProduct.unitBv, 0)));
    unitPrice = Math.round((upgradeProductQuantity * upgradeProductUnitPrice) * 100) / 100;
    unitBv = Math.max(0, Math.round(upgradeProductQuantity * upgradeProductUnitBv));
    productKey = selectedUpgradeProduct.productKey;
    imageUrl = safeText(selectedUpgradeProduct.imageUrl) || fallbackSelection.imageUrl;
    upgradeProductKey = selectedUpgradeProduct.productKey;
    upgradeProductLabel = safeText(selectedUpgradeProduct.label) || 'Upgrade Product';
    upgradeProductImageUrl = safeText(selectedUpgradeProduct.imageUrl);
  }
  return {
    action: isUpgrade ? 'upgrade' : 'featured',
    productKey,
    packageKey: isUpgrade ? normalizedPackageKey : '',
    label: safeText(selectionInput.label || fallbackSelection.label) || fallbackSelection.label,
    imageUrl,
    unitPrice,
    unitBv,
    quantity,
    upgradeProductKey,
    upgradeProductLabel,
    upgradeProductImageUrl,
    upgradeProductQuantity,
    upgradeProductUnitPrice,
    upgradeProductUnitBv,
  };
}

function resolveMyStoreCheckoutAmounts(selectionInput, currentPackageKey) {
  const selection = selectionInput && typeof selectionInput === 'object'
    ? selectionInput
    : buildMyStoreSelection('featured', '', currentPackageKey);
  const isUpgradeSelection = normalizeCredentialValue(selection.action) === 'upgrade'
    && Boolean(resolveMyStorePackageKeyFromValue(selection.packageKey));
  const quantity = isUpgradeSelection
    ? 1
    : Math.max(1, Math.round(safeNumber(selection.quantity, 1)));
  const subtotal = Math.round(Math.max(0, safeNumber(selection.unitPrice, 0) * quantity) * 100) / 100;
  const normalizedCurrentPackage = resolveMyStorePackageKeyFromValue(currentPackageKey);
  const discountRate = !isUpgradeSelection && normalizedCurrentPackage === 'preferred-customer-pack' ? 0.15 : 0;
  const discount = Math.round((subtotal * discountRate) * 100) / 100;
  const taxableTotal = Math.max(0, subtotal - discount);
  const tax = 0;
  const total = Math.round(taxableTotal * 100) / 100;
  const totalBv = Math.max(0, Math.round(safeNumber(selection.unitBv, 0) * quantity));
  return {
    isUpgradeSelection,
    quantity,
    subtotal,
    discount,
    tax,
    total,
    totalBv,
  };
}

function renderMyStoreBreadcrumbs(stepValue = MY_STORE_STEP_CATALOG, options = {}) {
  if (!(myStoreBreadcrumbsElement instanceof HTMLElement)) {
    return;
  }
  const step = resolveMyStoreStep(stepValue);
  const isUpgradeReview = Boolean(options?.isUpgradeReview);
  const reviewLabel = isUpgradeReview ? 'Review Upgrade' : 'Review Purchase';
  if (step === MY_STORE_STEP_THANK_YOU) {
    myStoreBreadcrumbsElement.innerHTML = `
      <button type="button" class="tree-next-my-store-breadcrumb-link" data-my-store-nav-step="${MY_STORE_STEP_CATALOG}">My Store</button>
      <span class="tree-next-my-store-breadcrumb-separator" aria-hidden="true">&gt;</span>
      <button type="button" class="tree-next-my-store-breadcrumb-link" data-my-store-nav-step="${MY_STORE_STEP_REVIEW}">${reviewLabel}</button>
      <span class="tree-next-my-store-breadcrumb-separator" aria-hidden="true">&gt;</span>
      <span class="tree-next-my-store-breadcrumb-current" aria-current="page">Thank You</span>
    `;
    return;
  }
  if (step === MY_STORE_STEP_CHECKOUT) {
    myStoreBreadcrumbsElement.innerHTML = `
      <button type="button" class="tree-next-my-store-breadcrumb-link" data-my-store-nav-step="${MY_STORE_STEP_CATALOG}">My Store</button>
      <span class="tree-next-my-store-breadcrumb-separator" aria-hidden="true">&gt;</span>
      <button type="button" class="tree-next-my-store-breadcrumb-link" data-my-store-nav-step="${MY_STORE_STEP_REVIEW}">${reviewLabel}</button>
      <span class="tree-next-my-store-breadcrumb-separator" aria-hidden="true">&gt;</span>
      <span class="tree-next-my-store-breadcrumb-current" aria-current="page">Checkout</span>
    `;
    return;
  }
  if (step === MY_STORE_STEP_REVIEW) {
    myStoreBreadcrumbsElement.innerHTML = `
      <button type="button" class="tree-next-my-store-breadcrumb-link" data-my-store-nav-step="${MY_STORE_STEP_CATALOG}">My Store</button>
      <span class="tree-next-my-store-breadcrumb-separator" aria-hidden="true">&gt;</span>
      <span class="tree-next-my-store-breadcrumb-current" aria-current="page">${reviewLabel}</span>
    `;
    return;
  }
  myStoreBreadcrumbsElement.innerHTML = '<span class="tree-next-my-store-breadcrumb-current" aria-current="page">My Store</span>';
}

function setMyStoreCheckoutFeedback(message = '', options = {}) {
  if (!(myStoreCheckoutFeedbackElement instanceof HTMLElement)) {
    return;
  }
  const safeMessage = safeText(message);
  const isError = Boolean(options?.isError);
  myStoreCheckoutFeedbackElement.textContent = safeMessage;
  myStoreCheckoutFeedbackElement.classList.toggle('is-visible', Boolean(safeMessage));
  myStoreCheckoutFeedbackElement.classList.toggle('is-error', Boolean(safeMessage) && isError);
}

function setMyStoreCheckoutSubmitting(isSubmitting, submitLabel = '') {
  const nextSubmitting = Boolean(isSubmitting);
  state.ui.myStoreCheckoutSubmitting = nextSubmitting;
  if (myStoreCheckoutPayButtonElement instanceof HTMLButtonElement) {
    myStoreCheckoutPayButtonElement.disabled = nextSubmitting;
    myStoreCheckoutPayButtonElement.textContent = nextSubmitting
      ? (safeText(submitLabel) || 'Processing...')
      : 'Continue to Stripe';
  }
  if (myStoreCheckoutPreviousButtonElement instanceof HTMLButtonElement) {
    myStoreCheckoutPreviousButtonElement.disabled = nextSubmitting;
  }
}

function formatMyStoreCheckoutDate(value) {
  const normalizedValue = safeText(value);
  if (!normalizedValue) {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date());
  }
  const parsedValue = new Date(normalizedValue);
  if (Number.isNaN(parsedValue.getTime())) {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date());
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsedValue);
}

function resolveMyStoreCheckoutCompletionSummary() {
  const completion = state.ui?.myStoreCheckoutCompletion;
  if (!completion || typeof completion !== 'object') {
    return {
      message: 'Payment received and your order is now processing.',
      invoiceId: '--',
      status: 'Posted',
      amountPaid: 0,
      bv: 0,
      dateLabel: '--',
    };
  }
  return {
    message: safeText(completion.message) || 'Payment received and your order is now processing.',
    invoiceId: safeText(completion.invoiceId) || '--',
    status: safeText(completion.status) || 'Posted',
    amountPaid: Math.max(0, safeNumber(completion.amountPaid, 0)),
    bv: Math.max(0, Math.round(safeNumber(completion.bv, 0))),
    dateLabel: safeText(completion.dateLabel) || '--',
  };
}

function showMyStoreCheckoutThankYouStep(options = {}) {
  state.ui.myStoreCheckoutCompletion = {
    message: safeText(options?.message) || 'Payment received and your order is now processing.',
    invoiceId: safeText(options?.invoiceId) || '--',
    status: safeText(options?.status) || 'Posted',
    amountPaid: Math.max(0, safeNumber(options?.amountPaid, 0)),
    bv: Math.max(0, Math.round(safeNumber(options?.bv, 0))),
    dateLabel: safeText(options?.dateLabel) || formatMyStoreCheckoutDate(options?.createdAt),
  };
  setMyStoreStep(MY_STORE_STEP_THANK_YOU, {
    clearCheckoutFeedback: true,
    preserveCheckoutCompletion: true,
  });
}

function showMyStoreCheckoutPendingThankYouStep(options = {}) {
  const completionSummary = resolveMyStoreCheckoutCompletionSummary();
  const fallbackDateLabel = formatMyStoreCheckoutDate(new Date().toISOString());
  showMyStoreCheckoutThankYouStep({
    message: safeText(options?.message) || 'Payment successful. Receipt is syncing now.',
    invoiceId: safeText(options?.invoiceId) || completionSummary.invoiceId || 'Generating...',
    status: safeText(options?.status) || 'Pending',
    amountPaid: Math.max(0, safeNumber(options?.amountPaid, completionSummary.amountPaid || 0)),
    bv: Math.max(0, Math.round(safeNumber(options?.bv, completionSummary.bv || 0))),
    dateLabel: safeText(options?.dateLabel) || completionSummary.dateLabel || fallbackDateLabel,
  });
}

function resolveMyStorePendingCheckoutSummary(sessionId = '') {
  const pendingCheckoutState = readTreeNextPendingCheckoutState(TREE_NEXT_PENDING_CHECKOUT_MY_STORE_KEY);
  if (!pendingCheckoutState || typeof pendingCheckoutState !== 'object') {
    return null;
  }
  const safeSessionId = safeText(sessionId);
  const pendingSessionId = safeText(pendingCheckoutState.sessionId);
  if (safeSessionId && pendingSessionId && pendingSessionId !== safeSessionId) {
    return null;
  }
  return {
    invoiceId: safeText(pendingCheckoutState.invoiceId),
    amountPaid: Math.max(0, safeNumber(pendingCheckoutState.amountPaid, 0)),
    bv: Math.max(0, Math.round(safeNumber(pendingCheckoutState.bv, 0))),
    productLabel: safeText(pendingCheckoutState.productLabel),
    quantity: Math.max(1, Math.round(safeNumber(pendingCheckoutState.quantity, 1))),
    dateLabel: safeText(pendingCheckoutState.dateLabel) || formatMyStoreCheckoutDate(new Date().toISOString()),
  };
}

function setMyStoreStep(stepValue, options = {}) {
  const nextStep = resolveMyStoreStep(stepValue);
  state.ui.myStoreStep = nextStep;
  if (
    nextStep !== MY_STORE_STEP_THANK_YOU
    && options?.preserveCheckoutCompletion !== true
  ) {
    state.ui.myStoreCheckoutCompletion = null;
  }
  if (Boolean(options?.clearCheckoutFeedback)) {
    setMyStoreCheckoutFeedback('');
  }
  if (options?.sync !== false) {
    syncMyStorePanelVisuals();
  }
}

function resetMyStoreCheckoutForm() {
  if (myStoreCheckoutFormElement instanceof HTMLFormElement) {
    myStoreCheckoutFormElement.reset();
  }
  setMyStoreCheckoutSubmitting(false);
  clearMyStoreStripeCardInput();
  if (myStoreCheckoutBillingCountrySelect instanceof HTMLSelectElement) {
    myStoreCheckoutBillingCountrySelect.value = ENROLL_DEFAULT_BILLING_COUNTRY_CODE;
    syncTreeNextEnrollCustomSelectById(myStoreCheckoutBillingCountrySelect.id);
  }
  setMyStoreCheckoutFeedback('');
}

function navigateToMyStoreProduct(action, packageKey = '') {
  const homeNodeId = resolvePreferredGlobalHomeNodeId();
  const homeNode = resolveNodeById(homeNodeId) || resolveNodeById('root');
  const currentPackageKey = resolveMyStoreCurrentPackageKey(homeNode);
  state.ui.myStoreSelection = buildMyStoreSelection(action, packageKey, currentPackageKey);
  setMyStoreStep(MY_STORE_STEP_REVIEW, { clearCheckoutFeedback: true, sync: false });
  syncMyStorePanelVisuals();
}

function setMyStoreSelectionQuantity(quantityValue) {
  const homeNodeId = resolvePreferredGlobalHomeNodeId();
  const homeNode = resolveNodeById(homeNodeId) || resolveNodeById('root');
  const currentPackageKey = resolveMyStoreCurrentPackageKey(homeNode);
  const currentSelection = resolveMyStoreSelection(currentPackageKey);
  if (normalizeCredentialValue(currentSelection.action) === 'upgrade') {
    return;
  }
  const nextQuantity = clamp(Math.round(safeNumber(quantityValue, currentSelection.quantity)), 1, 99);
  if (nextQuantity === currentSelection.quantity) {
    return;
  }
  state.ui.myStoreSelection = {
    ...currentSelection,
    quantity: nextQuantity,
  };
  syncMyStorePanelVisuals();
}

function setMyStoreUpgradeSelectionProduct(productKey = '') {
  const homeNodeId = resolvePreferredGlobalHomeNodeId();
  const homeNode = resolveNodeById(homeNodeId) || resolveNodeById('root');
  const currentPackageKey = resolveMyStoreCurrentPackageKey(homeNode);
  const currentSelection = resolveMyStoreSelection(currentPackageKey);
  if (normalizeCredentialValue(currentSelection.action) !== 'upgrade') {
    return;
  }
  const selectedUpgradeProduct = resolveMyStoreUpgradeProductMeta(productKey);
  if (safeText(currentSelection.upgradeProductKey) === selectedUpgradeProduct.productKey) {
    return;
  }
  state.ui.myStoreSelection = {
    ...currentSelection,
    upgradeProductKey: selectedUpgradeProduct.productKey,
  };
  syncMyStorePanelVisuals();
}

function resolveMyStoreCheckoutFieldList() {
  return [
    myStoreCheckoutNameInputElement,
    myStoreCheckoutBillingAddressInputElement,
    myStoreCheckoutBillingCityInputElement,
    myStoreCheckoutBillingStateInputElement,
    myStoreCheckoutBillingPostalInputElement,
  ].filter((element) => element instanceof HTMLInputElement);
}

async function refreshMyStorePostCheckoutUpgrade(accountUpgradeInput = null) {
  const accountUpgrade = accountUpgradeInput && typeof accountUpgradeInput === 'object'
    ? accountUpgradeInput
    : null;
  const upgradedUser = accountUpgrade?.user && typeof accountUpgrade.user === 'object'
    ? accountUpgrade.user
    : null;
  if (upgradedUser) {
    applyAccountUpgradeUserToLocalState(upgradedUser);
  }

  await refreshAuthenticatedMemberSessionSnapshot({ skipAccountOverviewReset: true });
  await syncTreeNextLiveNodes({ force: true, silent: true, reason: 'my-store-upgrade' });

  resetAccountOverviewRemoteSnapshot();
  resetRankAdvancementSnapshot();
  const overviewContext = resolveAccountOverviewPanelContext();
  const homeNode = overviewContext?.homeNode || resolveNodeById('root');
  await refreshAccountOverviewRemoteSnapshot({
    force: true,
    homeNode,
    scope: overviewContext?.scope,
    preferHomeNodeIdentity: overviewContext?.preferHomeNodeIdentity,
  });
  await refreshRankAdvancementSnapshot({
    force: true,
    homeNode,
  });
  await refreshPreferredAccountsSnapshot({ force: true });
  syncAccountOverviewPanelVisuals();
  syncRankAdvancementPanelVisuals();
  syncPreferredAccountsPanelVisuals();
  syncMyStorePanelVisuals();
}

async function createMyStoreCheckoutSession(payload = {}) {
  const response = await fetch(MY_STORE_CHECKOUT_SESSION_API, {
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
      : 'Unable to start My Store Stripe checkout.';
    throw new Error(failureMessage);
  }

  const sessionId = safeText(responsePayload?.sessionId);
  const sessionUrl = safeText(responsePayload?.sessionUrl);
  if (!sessionId || !sessionUrl) {
    throw new Error('My Store checkout response is missing Stripe session details.');
  }

  return {
    sessionId,
    sessionUrl,
    checkout: responsePayload?.checkout && typeof responsePayload.checkout === 'object'
      ? responsePayload.checkout
      : {},
  };
}

async function completeMyStoreCheckoutSession(sessionId) {
  const safeSessionId = safeText(sessionId);
  if (!safeSessionId) {
    throw new Error('Checkout session ID is required to finalize My Store checkout.');
  }

  const response = await fetch(MY_STORE_CHECKOUT_SESSION_COMPLETE_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
    body: JSON.stringify({
      sessionId: safeSessionId,
    }),
  });

  const responsePayload = await response.json().catch(() => null);
  if (!response.ok) {
    const failureMessage = typeof responsePayload?.error === 'string'
      ? responsePayload.error
      : 'Unable to finalize My Store checkout.';
    throw new Error(failureMessage);
  }

  return {
    completed: responsePayload?.completed === true,
    alreadyProcessed: responsePayload?.alreadyProcessed === true,
    invoice: responsePayload?.invoice && typeof responsePayload.invoice === 'object'
      ? responsePayload.invoice
      : null,
    accountUpgrade: responsePayload?.accountUpgrade && typeof responsePayload.accountUpgrade === 'object'
      ? responsePayload.accountUpgrade
      : null,
    preferredCustomer: responsePayload?.preferredCustomer && typeof responsePayload.preferredCustomer === 'object'
      ? responsePayload.preferredCustomer
      : null,
    paymentIntent: responsePayload?.paymentIntent && typeof responsePayload.paymentIntent === 'object'
      ? responsePayload.paymentIntent
      : null,
    checkoutSession: responsePayload?.checkoutSession && typeof responsePayload.checkoutSession === 'object'
      ? responsePayload.checkoutSession
      : null,
  };
}

function openTreeNextStripeCheckoutWindow() {
  const checkoutWindow = window.open(
    'about:blank',
    '_blank',
    'popup=yes,width=520,height=760,resizable=yes,scrollbars=yes',
  );
  if (!checkoutWindow || checkoutWindow.closed) {
    return null;
  }
  return checkoutWindow;
}

function isLikelyFetchNetworkError(error) {
  const message = safeText(error instanceof Error ? error.message : String(error)).toLowerCase();
  return (
    message === 'failed to fetch'
    || message.includes('networkerror')
    || message.includes('network request failed')
    || message.includes('load failed')
  );
}

function clearMyStoreCheckoutRetryTracking(sessionId) {
  const safeSessionId = safeText(sessionId);
  if (!safeSessionId) {
    return;
  }
  myStoreCheckoutRetryAttemptBySession.delete(safeSessionId);
  const timeoutId = myStoreCheckoutRetryTimeoutBySession.get(safeSessionId);
  if (safeNumber(timeoutId, 0) > 0) {
    window.clearTimeout(timeoutId);
  }
  myStoreCheckoutRetryTimeoutBySession.delete(safeSessionId);
}

function scheduleMyStoreCheckoutNetworkRetry(sessionId) {
  const safeSessionId = safeText(sessionId);
  if (!safeSessionId) {
    return false;
  }
  const existingTimeoutId = safeNumber(myStoreCheckoutRetryTimeoutBySession.get(safeSessionId), 0);
  if (existingTimeoutId > 0) {
    return true;
  }
  const currentAttempt = Math.max(0, Math.floor(safeNumber(
    myStoreCheckoutRetryAttemptBySession.get(safeSessionId),
    0,
  )));
  if (currentAttempt >= MY_STORE_CHECKOUT_NETWORK_RETRY_LIMIT) {
    return false;
  }
  const nextAttempt = currentAttempt + 1;
  myStoreCheckoutRetryAttemptBySession.set(safeSessionId, nextAttempt);
  const timeoutId = window.setTimeout(() => {
    myStoreCheckoutRetryTimeoutBySession.delete(safeSessionId);
    void finalizeMyStoreCheckoutSessionFromStripeReturn(safeSessionId, {
      preserveCurrentStep: true,
      ensurePanelVisible: true,
      maxAttempts: 50,
      pollDelayMs: 700,
    });
  }, MY_STORE_CHECKOUT_NETWORK_RETRY_DELAY_MS);
  myStoreCheckoutRetryTimeoutBySession.set(safeSessionId, timeoutId);
  return true;
}

async function finalizeMyStoreCheckoutSessionFromStripeReturn(sessionId, options = {}) {
  const safeSessionId = safeText(sessionId);
  if (!safeSessionId) {
    return;
  }
  if (myStoreCheckoutFinalizationInFlightSessionIds.has(safeSessionId)) {
    return;
  }
  myStoreCheckoutFinalizationInFlightSessionIds.add(safeSessionId);
  const checkoutWindow = options?.checkoutWindow;
  const preserveCurrentStep = Boolean(options?.preserveCurrentStep);
  const submitLabel = myStoreCheckoutPayButtonElement instanceof HTMLButtonElement
    ? myStoreCheckoutPayButtonElement.textContent || 'Continue to Stripe'
    : 'Continue to Stripe';
  const requestedMaxAttempts = Math.floor(Number(options?.maxAttempts));
  const requestedPollDelayMs = Math.floor(Number(options?.pollDelayMs));
  const maxAttempts = Number.isFinite(requestedMaxAttempts) && requestedMaxAttempts > 0
    ? requestedMaxAttempts
    : (checkoutWindow ? 240 : 5);
  const pollDelayMs = Number.isFinite(requestedPollDelayMs) && requestedPollDelayMs >= 250
    ? requestedPollDelayMs
    : (checkoutWindow ? 1200 : 700);

  try {
    if (options?.ensurePanelVisible !== false && !Boolean(state.ui?.myStoreVisible)) {
      setMyStorePanelVisible(true);
    }
    if (!preserveCurrentStep) {
      setMyStoreStep(MY_STORE_STEP_CHECKOUT, { clearCheckoutFeedback: true });
    }
    setMyStoreCheckoutSubmitting(true, 'Finalizing...');

    setMyStoreCheckoutFeedback('Finalizing your order...');
    let completionResult = await completeMyStoreCheckoutSession(safeSessionId);
    let completionAttempts = 0;
    while (!completionResult.completed && completionAttempts < maxAttempts) {
      if (checkoutWindow?.closed) {
        completionResult = await completeMyStoreCheckoutSession(safeSessionId);
        if (!completionResult.completed) {
          throw new Error('Stripe checkout window was closed before payment completed.');
        }
        break;
      }
      await new Promise((resolve) => window.setTimeout(resolve, pollDelayMs));
      completionAttempts += 1;
      completionResult = await completeMyStoreCheckoutSession(safeSessionId);
    }
    if (!completionResult.completed) {
      throw new Error('Payment captured, but order is still processing. Please retry shortly.');
    }
    if (checkoutWindow && !checkoutWindow.closed) {
      checkoutWindow.close();
    }

    const accountUpgrade = completionResult.accountUpgrade && typeof completionResult.accountUpgrade === 'object'
      ? completionResult.accountUpgrade
      : null;
    let accountUpgradeWarning = '';
    if (accountUpgrade) {
      if (accountUpgrade?.ok === true) {
        await refreshMyStorePostCheckoutUpgrade(accountUpgrade);
      } else {
        accountUpgradeWarning = safeText(accountUpgrade?.message)
          || 'Payment confirmed, but account upgrade is still processing.';
      }
    }

    const invoice = completionResult.invoice && typeof completionResult.invoice === 'object'
      ? completionResult.invoice
      : null;
    const invoiceId = safeText(invoice?.id);
    const invoiceStatus = safeText(invoice?.status) || 'Posted';
    const invoiceAmount = Math.max(0, safeNumber(invoice?.amount, 0));
    const invoiceBv = Math.max(0, Math.round(safeNumber(invoice?.bp, 0)));
    const invoiceDateLabel = formatMyStoreCheckoutDate(invoice?.createdAt);
    const paymentSuccessMessage = completionResult.alreadyProcessed
      ? 'Payment was already confirmed and linked to your order.'
      : 'Payment confirmed successfully. Your order is complete.';
    const successMessage = accountUpgradeWarning
      ? `${paymentSuccessMessage} ${accountUpgradeWarning}`
      : paymentSuccessMessage;

    resetMyStoreCheckoutForm();
    showMyStoreCheckoutThankYouStep({
      message: successMessage,
      invoiceId,
      status: invoiceStatus,
      amountPaid: invoiceAmount,
      bv: invoiceBv,
      dateLabel: invoiceDateLabel,
    });
    clearTreeNextPendingCheckoutState(TREE_NEXT_PENDING_CHECKOUT_MY_STORE_KEY);
    clearMyStoreCheckoutRetryTracking(safeSessionId);
  } catch (error) {
    const isNetworkError = isLikelyFetchNetworkError(error);
    const retryScheduled = isNetworkError
      ? scheduleMyStoreCheckoutNetworkRetry(safeSessionId)
      : false;
    const retryAttempt = Math.max(1, Math.floor(safeNumber(
      myStoreCheckoutRetryAttemptBySession.get(safeSessionId),
      1,
    )));
    const fallbackMessage = isNetworkError
      ? (
        retryScheduled
          ? `Payment succeeded. Syncing your order details now (retry ${retryAttempt}/${MY_STORE_CHECKOUT_NETWORK_RETRY_LIMIT})...`
          : 'Payment succeeded, but we still cannot reach the server. Keep this tab open and refresh shortly to load invoice details.'
      )
      : (
        error instanceof Error
          ? error.message
          : 'Unable to finalize checkout right now.'
      );
    if (resolveMyStoreStep(state.ui?.myStoreStep) === MY_STORE_STEP_THANK_YOU) {
      showMyStoreCheckoutPendingThankYouStep({
        message: fallbackMessage,
      });
    }
    setMyStoreCheckoutFeedback(fallbackMessage, { isError: true });
    setMyStoreCopyFeedback(fallbackMessage, { isError: true });
  } finally {
    setMyStoreCheckoutSubmitting(false, submitLabel);
    myStoreCheckoutFinalizationInFlightSessionIds.delete(safeSessionId);
  }
}

async function submitMyStoreCheckout() {
  if (state.ui?.myStoreCheckoutSubmitting) {
    return;
  }
  setMyStoreCheckoutFeedback('');
  clearMyStoreCheckoutCardError();

  const homeNodeId = resolvePreferredGlobalHomeNodeId();
  const homeNode = resolveNodeById(homeNodeId) || resolveNodeById('root');
  const currentPackageKey = resolveMyStoreCurrentPackageKey(homeNode);
  const selection = resolveMyStoreSelection(currentPackageKey);
  const checkoutAmounts = resolveMyStoreCheckoutAmounts(selection, currentPackageKey);
  const checkoutProductId = safeText(selection.productKey || selection.upgradeProductKey || MY_STORE_FEATURED_PRODUCT.productKey);
  const checkoutQuantity = checkoutAmounts.isUpgradeSelection
    ? Math.max(1, Math.round(safeNumber(selection.upgradeProductQuantity, 1)))
    : Math.max(1, Math.round(safeNumber(checkoutAmounts.quantity, 1)));
  if (!checkoutProductId || checkoutQuantity <= 0) {
    setMyStoreCheckoutFeedback('Unable to build cart selection for checkout.', { isError: true });
    return;
  }

  const session = state.session && typeof state.session === 'object' ? state.session : null;
  const buyerEmail = safeText(
    session?.email
    || session?.userEmail
    || session?.user_email
    || '',
  );
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerEmail)) {
    setMyStoreCheckoutFeedback('A valid account email is required before checkout.', { isError: true });
    return;
  }

  const buyerUserId = safeText(
    session?.id
    || session?.userId
    || session?.user_id
    || session?.memberId
    || session?.member_id
    || '',
  );
  const buyerUsername = safeText(
    session?.username
    || session?.memberUsername
    || session?.member_username
    || '',
  ).replace(/^@+/, '');
  const checkoutSource = state.source === 'member' ? 'member-dashboard' : 'binary-tree-next';
  const discountPercent = (!checkoutAmounts.isUpgradeSelection
    && resolveMyStorePackageKeyFromValue(currentPackageKey) === 'preferred-customer-pack')
    ? 15
    : 0;
  const cardholderName = safeText(myStoreCheckoutNameInputElement?.value) || resolveSessionDisplayName();
  const shippingAddress = safeText(myStoreCheckoutBillingAddressInputElement?.value) || 'Collected in Stripe Checkout';
  const storeCode = resolveMyStoreStoreCode(homeNode);
  const memberStoreLink = resolveMyStoreShareLink(homeNode);
  const accountUpgradeTargetPackage = checkoutAmounts.isUpgradeSelection
    ? resolveMyStorePackageKeyFromValue(selection.packageKey)
    : '';
  const checkoutWindow = openTreeNextStripeCheckoutWindow();
  if (!checkoutWindow) {
    const popupMessage = 'Pop-up blocked. Please allow pop-ups to continue with Stripe checkout.';
    setMyStoreCheckoutFeedback(popupMessage, { isError: true });
    setMyStoreCopyFeedback(popupMessage, { isError: true });
    return;
  }

  const submitLabel = myStoreCheckoutPayButtonElement instanceof HTMLButtonElement
    ? myStoreCheckoutPayButtonElement.textContent || 'Continue to Stripe'
    : 'Continue to Stripe';
  setMyStoreCheckoutSubmitting(true, 'Preparing payment...');

  try {
    setMyStoreCheckoutFeedback('Preparing secure payment...');
    const checkoutSessionResult = await createMyStoreCheckoutSession({
      cartLines: [
        {
          productId: checkoutProductId,
          quantity: checkoutQuantity,
        },
      ],
      storeCode,
      buyerName: cardholderName || resolveSessionDisplayName(),
      buyerEmail,
      shippingAddress,
      shippingMode: 'Standard Shipping',
      source: checkoutSource,
      memberStoreLink,
      discountPercent,
      checkoutMode: 'guest',
      buyerUserId,
      buyerUsername,
      accountUpgradeTargetPackage,
      returnPath: buildTreeNextStripeReturnPath(TREE_NEXT_STRIPE_RETURN_FLOW_MY_STORE),
    });
    persistTreeNextPendingCheckoutState(TREE_NEXT_PENDING_CHECKOUT_MY_STORE_KEY, {
      sessionId: checkoutSessionResult.sessionId,
      invoiceId: safeText(checkoutSessionResult.checkout?.invoiceId),
      amountPaid: checkoutAmounts.total,
      bv: checkoutAmounts.totalBv,
      productLabel: checkoutAmounts.isUpgradeSelection
        ? `Upgrade: ${safeText(selection.label) || 'Package Upgrade'}`
        : (safeText(selection.label) || safeText(myStoreCheckoutProductLabelElement?.textContent) || 'Product'),
      quantity: checkoutQuantity,
      dateLabel: formatMyStoreCheckoutDate(new Date().toISOString()),
      submittedAt: new Date().toISOString(),
    });
    setMyStoreCheckoutFeedback('Stripe checkout opened in a new window. Complete payment, then return to this tab.');
    checkoutWindow.location.replace(checkoutSessionResult.sessionUrl);
    checkoutWindow.focus();
  } catch (error) {
    const fallbackMessage = error instanceof Error
      ? error.message
      : 'Unable to complete checkout right now.';
    setMyStoreCheckoutFeedback(fallbackMessage, { isError: true });
    setMyStoreCopyFeedback(fallbackMessage, { isError: true });
  } finally {
    setMyStoreCheckoutSubmitting(false, submitLabel);
  }
}

function removeMyStoreSelection() {
  state.ui.myStoreSelection = null;
  setMyStoreStep(MY_STORE_STEP_CATALOG, { clearCheckoutFeedback: true, sync: false });
  resetMyStoreCheckoutForm();
  syncMyStorePanelVisuals();
}

function openMyStoreCheckoutStep() {
  setMyStoreStep(MY_STORE_STEP_CHECKOUT, { clearCheckoutFeedback: true });
  setMyStoreCheckoutSubmitting(false);
  void hydrateTreeNextEnrollBillingCountryOptions();
  if (myStoreCheckoutBillingCountrySelect instanceof HTMLSelectElement) {
    syncTreeNextEnrollCustomSelectById(myStoreCheckoutBillingCountrySelect.id);
  }
}

function returnToMyStoreReviewStep() {
  setMyStoreStep(MY_STORE_STEP_REVIEW, { clearCheckoutFeedback: true });
}

function setMyStoreCopyFeedback(message, options = {}) {
  if (!(myStoreCopyFeedbackElement instanceof HTMLElement)) {
    return;
  }
  const safeMessage = safeText(message);
  const isError = Boolean(options?.isError);
  myStoreCopyFeedbackElement.textContent = safeMessage;
  myStoreCopyFeedbackElement.classList.toggle('is-visible', Boolean(safeMessage));
  myStoreCopyFeedbackElement.classList.toggle('is-error', Boolean(safeMessage) && isError);
}

async function copyMyStoreShareLink() {
  const fallbackLink = resolveMyStoreShareLink();
  const shareLink = safeText(myStoreCopyLinkButtonElement?.dataset?.shareLink || fallbackLink);
  if (!shareLink) {
    setMyStoreCopyFeedback('Store link unavailable.', { isError: true });
    return;
  }

  let copied = false;
  if (navigator.clipboard && window.isSecureContext) {
    copied = await navigator.clipboard.writeText(shareLink)
      .then(() => true)
      .catch(() => false);
  }

  if (!copied) {
    const helperInput = document.createElement('textarea');
    helperInput.value = shareLink;
    helperInput.setAttribute('readonly', 'true');
    helperInput.style.position = 'absolute';
    helperInput.style.left = '-9999px';
    helperInput.style.opacity = '0';
    document.body.appendChild(helperInput);
    helperInput.select();
    helperInput.setSelectionRange(0, helperInput.value.length);
    try {
      copied = document.execCommand('copy');
    } catch {
      copied = false;
    }
    document.body.removeChild(helperInput);
  }

  setMyStoreCopyFeedback(
    copied ? 'Store link copied.' : 'Unable to copy link. Please copy manually.',
    { isError: !copied },
  );
}

function syncMyStorePanelPosition(layoutInput = state.layout) {
  if (!isMyStorePanelAvailable()) {
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
  const panelWidth = clamp(Math.round(Math.min(820, maxUsableWidth)), 360, maxUsableWidth);

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
  let clampedHeight = clamp(
    panelHeight,
    320,
    Math.max(320, viewportHeight - (panelEdgePadding * 2)),
  );

  const currentMyStoreStep = resolveMyStoreStep(state.ui?.myStoreStep);
  if (
    myStoreScrollElement instanceof HTMLElement
    && myStoreHeaderElement instanceof HTMLElement
  ) {
    const scrollComputedStyle = window.getComputedStyle(myStoreScrollElement);
    const scrollPaddingTop = Math.max(0, safeNumber(Number.parseFloat(scrollComputedStyle.paddingTop), 0));
    const scrollPaddingBottom = Math.max(0, safeNumber(Number.parseFloat(scrollComputedStyle.paddingBottom), 0));
    const headerHeight = Math.max(0, safeNumber(myStoreHeaderElement.getBoundingClientRect().height, 0));
    if (
      currentMyStoreStep === MY_STORE_STEP_CHECKOUT
      && myStoreCheckoutViewElement instanceof HTMLElement
    ) {
      const checkoutContentHeight = Math.max(0, safeNumber(myStoreCheckoutViewElement.scrollHeight, 0));
      const checkoutTargetHeight = Math.ceil(
        headerHeight
        + scrollPaddingTop
        + checkoutContentHeight
        + scrollPaddingBottom
        + 96,
      );
      clampedHeight = clamp(
        checkoutTargetHeight,
        460,
        Math.max(320, viewportHeight - (panelEdgePadding * 2)),
      );
    } else if (
      currentMyStoreStep === MY_STORE_STEP_THANK_YOU
      && myStoreThankYouViewElement instanceof HTMLElement
    ) {
      const thankYouContentHeight = Math.max(0, safeNumber(myStoreThankYouViewElement.scrollHeight, 0));
      const thankYouTargetHeight = Math.ceil(
        headerHeight
        + scrollPaddingTop
        + thankYouContentHeight
        + scrollPaddingBottom
        + 60,
      );
      clampedHeight = clamp(
        thankYouTargetHeight,
        420,
        Math.max(320, viewportHeight - (panelEdgePadding * 2)),
      );
    } else if (
      currentMyStoreStep === MY_STORE_STEP_REVIEW
      && myStoreReviewViewElement instanceof HTMLElement
    ) {
      const reviewContentHeight = Math.max(0, safeNumber(myStoreReviewViewElement.scrollHeight, 0));
      const includeShareSection = myStoreShareViewElement instanceof HTMLElement
        && window.getComputedStyle(myStoreShareViewElement).display !== 'none';
      const shareContentHeight = includeShareSection
        ? Math.max(0, safeNumber(myStoreShareViewElement.scrollHeight, 0))
        : 0;
      const reviewTargetHeight = Math.ceil(
        headerHeight
        + scrollPaddingTop
        + reviewContentHeight
        + shareContentHeight
        + scrollPaddingBottom
        + 44,
      );
      clampedHeight = clamp(
        reviewTargetHeight,
        420,
        Math.max(320, viewportHeight - (panelEdgePadding * 2)),
      );
    } else if (
      currentMyStoreStep === MY_STORE_STEP_CATALOG
      && myStoreCatalogViewElement instanceof HTMLElement
    ) {
      const homeNodeId = resolvePreferredGlobalHomeNodeId();
      const homeNode = resolveNodeById(homeNodeId) || resolveNodeById('root');
      const currentPackageKey = resolveMyStoreCurrentPackageKey(homeNode);
      const hasUpgradeablePackages = resolveMyStoreUpgradePackageKeys(currentPackageKey).length > 0;
      if (!hasUpgradeablePackages) {
        const catalogContentHeight = Math.max(0, safeNumber(myStoreCatalogViewElement.scrollHeight, 0));
        const includeShareSection = myStoreShareViewElement instanceof HTMLElement
          && window.getComputedStyle(myStoreShareViewElement).display !== 'none';
        const shareContentHeight = includeShareSection
          ? Math.max(0, safeNumber(myStoreShareViewElement.scrollHeight, 0))
          : 0;
        const catalogTargetHeight = Math.ceil(
          headerHeight
          + scrollPaddingTop
          + catalogContentHeight
          + shareContentHeight
          + scrollPaddingBottom
          + 44,
        );
        clampedHeight = clamp(
          catalogTargetHeight,
          420,
          Math.max(320, viewportHeight - (panelEdgePadding * 2)),
        );
      }
    }
  }

  myStorePanelElement.style.setProperty('--tree-next-my-store-left', `${clampedLeft}px`);
  myStorePanelElement.style.setProperty('--tree-next-my-store-top', `${clampedTop}px`);
  myStorePanelElement.style.setProperty('--tree-next-my-store-width', `${panelWidth}px`);
  myStorePanelElement.style.setProperty('--tree-next-my-store-height', `${clampedHeight}px`);
  myStorePanelElement.classList.remove('is-positioning');
}

function syncMyStorePanelVisuals() {
  if (!isMyStorePanelAvailable()) {
    return;
  }

  const homeNodeId = resolvePreferredGlobalHomeNodeId();
  const homeNode = resolveNodeById(homeNodeId) || resolveNodeById('root');
  const currentPackageKey = resolveMyStoreCurrentPackageKey(homeNode);
  const currentStep = resolveMyStoreStep(state.ui?.myStoreStep);
  const selection = resolveMyStoreSelection(currentPackageKey);
  const checkoutAmounts = resolveMyStoreCheckoutAmounts(selection, currentPackageKey);
  const upgradeKeys = resolveMyStoreUpgradePackageKeys(currentPackageKey);
  const shareLink = resolveMyStoreShareLink(homeNode);
  const completionSummary = resolveMyStoreCheckoutCompletionSummary();
  const renderSignature = [
    currentStep,
    selection.action,
    selection.packageKey,
    selection.upgradeProductKey,
    selection.upgradeProductQuantity,
    selection.label,
    selection.unitPrice,
    selection.unitBv,
    selection.quantity,
    currentPackageKey,
    upgradeKeys.join('|'),
    shareLink,
    completionSummary.message,
    completionSummary.invoiceId,
    completionSummary.status,
    completionSummary.amountPaid,
    completionSummary.bv,
    completionSummary.dateLabel,
    state.ui?.myStoreCheckoutSubmitting ? '1' : '0',
  ].join('::');
  if (renderSignature === myStoreLastRenderSignature) {
    return;
  }
  myStoreLastRenderSignature = renderSignature;

  if (myStoreFeaturedLabelElement instanceof HTMLElement) {
    myStoreFeaturedLabelElement.textContent = MY_STORE_FEATURED_PRODUCT.label;
  }
  if (myStoreFeaturedImageElement instanceof HTMLImageElement) {
    myStoreFeaturedImageElement.src = MY_STORE_FEATURED_PRODUCT.imageUrl;
    myStoreFeaturedImageElement.alt = MY_STORE_FEATURED_PRODUCT.label;
  }

  myStorePanelElement.setAttribute('data-my-store-step', currentStep);
  renderMyStoreBreadcrumbs(currentStep, { isUpgradeReview: checkoutAmounts.isUpgradeSelection });
  if (myStoreReviewTitleElement instanceof HTMLElement) {
    myStoreReviewTitleElement.textContent = checkoutAmounts.isUpgradeSelection
      ? 'Review Upgrade'
      : 'Review Purchase';
  }

  if (myStoreReviewImageElement instanceof HTMLImageElement) {
    myStoreReviewImageElement.src = selection.imageUrl || MY_STORE_FEATURED_PRODUCT.imageUrl;
    myStoreReviewImageElement.alt = checkoutAmounts.isUpgradeSelection
      ? (safeText(selection.upgradeProductLabel) || selection.label)
      : selection.label;
  }
  if (myStoreReviewNameElement instanceof HTMLElement) {
    myStoreReviewNameElement.textContent = selection.label;
  }
  if (myStoreReviewQuantityElement instanceof HTMLElement) {
    if (checkoutAmounts.isUpgradeSelection) {
      const upgradeProductLabel = safeText(selection.upgradeProductLabel)
        || resolveMyStoreUpgradeProductMeta(selection.upgradeProductKey).label;
      const upgradeProductQuantity = Math.max(0, Math.round(safeNumber(selection.upgradeProductQuantity, 0)));
      myStoreReviewQuantityElement.textContent = `${upgradeProductLabel} ${formatInteger(upgradeProductQuantity)}x`;
    } else {
      myStoreReviewQuantityElement.textContent = `${checkoutAmounts.quantity}x`;
    }
  }
  const isQuantityEditable = !checkoutAmounts.isUpgradeSelection;
  if (myStoreReviewQuantityControlElement instanceof HTMLElement) {
    myStoreReviewQuantityControlElement.classList.toggle('is-readonly', !isQuantityEditable);
  }
  if (myStoreReviewUpgradeProductSelectorElement instanceof HTMLElement) {
    myStoreReviewUpgradeProductSelectorElement.classList.toggle('is-hidden', !checkoutAmounts.isUpgradeSelection);
  }
  for (const buttonElement of myStoreReviewUpgradeProductButtons) {
    if (!(buttonElement instanceof HTMLButtonElement)) {
      continue;
    }
    const buttonProductKey = normalizeCredentialValue(buttonElement.dataset.myStoreUpgradeProductKey);
    const isSelected = checkoutAmounts.isUpgradeSelection
      && buttonProductKey
      && buttonProductKey === normalizeCredentialValue(selection.upgradeProductKey);
    buttonElement.classList.toggle('is-selected', Boolean(isSelected));
    buttonElement.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
  }
  if (myStoreReviewQuantityDecreaseButtonElement instanceof HTMLButtonElement) {
    myStoreReviewQuantityDecreaseButtonElement.disabled = !isQuantityEditable || checkoutAmounts.quantity <= 1;
  }
  if (myStoreReviewQuantityIncreaseButtonElement instanceof HTMLButtonElement) {
    myStoreReviewQuantityIncreaseButtonElement.disabled = !isQuantityEditable || checkoutAmounts.quantity >= 99;
  }
  if (myStoreReviewPriceElement instanceof HTMLElement) {
    myStoreReviewPriceElement.textContent = formatEnrollCurrency(checkoutAmounts.subtotal);
  }
  if (myStoreReviewBvElement instanceof HTMLElement) {
    myStoreReviewBvElement.textContent = `${formatInteger(checkoutAmounts.totalBv)} BV`;
  }

  if (myStoreUpgradesSectionElement instanceof HTMLElement) {
    const shouldShowUpgrades = upgradeKeys.length > 0;
    myStoreUpgradesSectionElement.classList.toggle('is-empty', !shouldShowUpgrades);
  }

  if (myStoreUpgradesGridElement instanceof HTMLElement) {
    if (!upgradeKeys.length) {
      myStoreUpgradesGridElement.innerHTML = '';
    } else {
      myStoreUpgradesGridElement.innerHTML = upgradeKeys.map((packageKey) => {
        const packageLabel = resolveMyStoreUpgradePackageLabel(packageKey);
        return `
          <button
            class="tree-next-my-store-upgrade-card tree-next-my-store-product-button"
            type="button"
            data-my-store-product-action="upgrade"
            data-my-store-package-key="${packageKey}"
          >
            <div class="tree-next-my-store-product-image-shell is-upgrade">
              <img src="${MY_STORE_FEATURED_PRODUCT.imageUrl}" alt="${packageLabel}" />
            </div>
            <p class="tree-next-my-store-upgrade-label">${packageLabel}</p>
          </button>
        `;
      }).join('');
    }
  }

  if (myStoreCheckoutProductLabelElement instanceof HTMLElement) {
    if (checkoutAmounts.isUpgradeSelection) {
      const upgradeProductLabel = safeText(selection.upgradeProductLabel)
        || resolveMyStoreUpgradeProductMeta(selection.upgradeProductKey).label;
      const upgradeProductQuantity = Math.max(0, Math.round(safeNumber(selection.upgradeProductQuantity, 0)));
      myStoreCheckoutProductLabelElement.textContent = `${selection.label} - ${upgradeProductLabel} x${formatInteger(upgradeProductQuantity)}`;
    } else {
      myStoreCheckoutProductLabelElement.textContent = selection.label;
    }
  }
  if (myStoreCheckoutSubtotalElement instanceof HTMLElement) {
    myStoreCheckoutSubtotalElement.textContent = formatEnrollCurrency(checkoutAmounts.subtotal);
  }
  if (myStoreCheckoutDiscountElement instanceof HTMLElement) {
    myStoreCheckoutDiscountElement.textContent = formatEnrollCurrency(checkoutAmounts.discount);
  }
  if (myStoreCheckoutTaxElement instanceof HTMLElement) {
    myStoreCheckoutTaxElement.textContent = formatEnrollCurrency(checkoutAmounts.tax);
  }
  if (myStoreCheckoutTotalElement instanceof HTMLElement) {
    myStoreCheckoutTotalElement.textContent = formatEnrollCurrency(checkoutAmounts.total);
  }
  if (myStoreThankYouMessageElement instanceof HTMLElement) {
    myStoreThankYouMessageElement.textContent = completionSummary.message;
  }
  if (myStoreThankYouInvoiceElement instanceof HTMLElement) {
    myStoreThankYouInvoiceElement.textContent = completionSummary.invoiceId;
  }
  if (myStoreThankYouStatusElement instanceof HTMLElement) {
    myStoreThankYouStatusElement.textContent = completionSummary.status;
  }
  if (myStoreThankYouAmountElement instanceof HTMLElement) {
    myStoreThankYouAmountElement.textContent = formatEnrollCurrency(completionSummary.amountPaid);
  }
  if (myStoreThankYouBvElement instanceof HTMLElement) {
    myStoreThankYouBvElement.textContent = `${formatInteger(completionSummary.bv)} BV`;
  }
  if (myStoreThankYouDateElement instanceof HTMLElement) {
    myStoreThankYouDateElement.textContent = completionSummary.dateLabel;
  }
  if (myStoreCheckoutPayButtonElement instanceof HTMLButtonElement) {
    const isSubmitting = Boolean(state.ui?.myStoreCheckoutSubmitting);
    myStoreCheckoutPayButtonElement.disabled = isSubmitting;
    if (!isSubmitting) {
      myStoreCheckoutPayButtonElement.textContent = 'Continue to Stripe';
    }
  }
  if (myStoreCheckoutPreviousButtonElement instanceof HTMLButtonElement) {
    myStoreCheckoutPreviousButtonElement.disabled = Boolean(state.ui?.myStoreCheckoutSubmitting);
  }

  if (myStoreCopyLinkButtonElement instanceof HTMLButtonElement) {
    myStoreCopyLinkButtonElement.dataset.shareLink = shareLink;
    myStoreCopyLinkButtonElement.setAttribute('title', shareLink);
  }
}

function syncMyStorePanelVisibility() {
  if (!isMyStorePanelAvailable()) {
    return;
  }

  const isVisible = Boolean(state.ui?.myStoreVisible);
  myStorePanelElement.classList.toggle('is-hidden', !isVisible);
  myStorePanelElement.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
}

function setMyStorePanelVisible(isVisible) {
  const nextVisible = Boolean(isVisible);
  state.ui.myStoreVisible = nextVisible;
  if (nextVisible) {
    state.ui.accountOverviewVisible = false;
    state.ui.infinityBuilderVisible = false;
    state.ui.rankAdvancementVisible = false;
    state.ui.preferredAccountsVisible = false;
    syncAccountOverviewPanelVisibility();
    syncInfinityBuilderPanelVisibility();
    syncRankAdvancementPanelVisibility();
    syncPreferredAccountsPanelVisibility();
    state.ui.myStoreStep = MY_STORE_STEP_CATALOG;
    state.ui.myStoreCheckoutCompletion = null;
    state.ui.myStoreCheckoutSubmitting = false;
    if (!state.ui.myStoreSelection || typeof state.ui.myStoreSelection !== 'object') {
      state.ui.myStoreSelection = buildMyStoreSelection('featured');
    }
    setMyStoreCopyFeedback('');
    resetMyStoreCheckoutForm();
    myStoreLastRenderSignature = '';
    syncMyStorePanelVisuals();
  } else {
    setMyStoreCheckoutFeedback('');
  }
  syncMyStorePanelVisibility();
}

function initMyStorePanel() {
  if (!isMyStorePanelAvailable()) {
    return;
  }

  syncMyStorePanelPosition();
  syncMyStorePanelVisuals();
  syncMyStorePanelVisibility();
  setMyStoreCopyFeedback('');
  setMyStoreCheckoutFeedback('');

  if (myStoreCloseButtonElement instanceof HTMLButtonElement) {
    myStoreCloseButtonElement.addEventListener('click', () => {
      setMyStorePanelVisible(false);
    });
  }

  if (myStoreCopyLinkButtonElement instanceof HTMLButtonElement) {
    myStoreCopyLinkButtonElement.addEventListener('click', () => {
      void copyMyStoreShareLink();
    });
  }

  if (myStoreReviewRemoveButtonElement instanceof HTMLButtonElement) {
    myStoreReviewRemoveButtonElement.addEventListener('click', () => {
      removeMyStoreSelection();
    });
  }

  if (myStoreReviewCheckoutButtonElement instanceof HTMLButtonElement) {
    myStoreReviewCheckoutButtonElement.addEventListener('click', () => {
      void submitMyStoreCheckout();
    });
  }

  if (myStoreReviewQuantityDecreaseButtonElement instanceof HTMLButtonElement) {
    myStoreReviewQuantityDecreaseButtonElement.addEventListener('click', () => {
      const homeNodeId = resolvePreferredGlobalHomeNodeId();
      const homeNode = resolveNodeById(homeNodeId) || resolveNodeById('root');
      const currentPackageKey = resolveMyStoreCurrentPackageKey(homeNode);
      const currentSelection = resolveMyStoreSelection(currentPackageKey);
      setMyStoreSelectionQuantity(currentSelection.quantity - 1);
    });
  }

  if (myStoreReviewQuantityIncreaseButtonElement instanceof HTMLButtonElement) {
    myStoreReviewQuantityIncreaseButtonElement.addEventListener('click', () => {
      const homeNodeId = resolvePreferredGlobalHomeNodeId();
      const homeNode = resolveNodeById(homeNodeId) || resolveNodeById('root');
      const currentPackageKey = resolveMyStoreCurrentPackageKey(homeNode);
      const currentSelection = resolveMyStoreSelection(currentPackageKey);
      setMyStoreSelectionQuantity(currentSelection.quantity + 1);
    });
  }

  if (myStoreCheckoutPreviousButtonElement instanceof HTMLButtonElement) {
    myStoreCheckoutPreviousButtonElement.addEventListener('click', () => {
      returnToMyStoreReviewStep();
    });
  }

  if (myStoreThankYouDoneButtonElement instanceof HTMLButtonElement) {
    myStoreThankYouDoneButtonElement.addEventListener('click', () => {
      removeMyStoreSelection();
    });
  }

  if (myStoreCheckoutPayButtonElement instanceof HTMLButtonElement) {
    myStoreCheckoutPayButtonElement.addEventListener('click', () => {
      void submitMyStoreCheckout();
    });
  }

  if (myStoreCheckoutFormElement instanceof HTMLFormElement) {
    myStoreCheckoutFormElement.addEventListener('submit', (event) => {
      event.preventDefault();
      void submitMyStoreCheckout();
    });
  }

  if (myStoreCheckoutBillingCountrySelect instanceof HTMLSelectElement) {
    myStoreCheckoutBillingCountrySelect.value = ENROLL_DEFAULT_BILLING_COUNTRY_CODE;
    myStoreCheckoutBillingCountrySelect.addEventListener('change', () => {
      setMyStoreCheckoutFeedback('');
      clearMyStoreCheckoutCardError();
    });
  }

  myStorePanelElement.addEventListener('click', (event) => {
    const targetElement = event.target instanceof Element ? event.target : null;
    if (!targetElement) {
      return;
    }
    const navStepButton = targetElement.closest('[data-my-store-nav-step]');
    if (navStepButton instanceof HTMLButtonElement) {
      if (state.ui?.myStoreCheckoutSubmitting) {
        return;
      }
      const nextStep = safeText(navStepButton.dataset.myStoreNavStep);
      setMyStoreStep(nextStep, { clearCheckoutFeedback: true });
      return;
    }
    const upgradeProductButton = targetElement.closest('[data-my-store-upgrade-product-key]');
    if (upgradeProductButton instanceof HTMLButtonElement) {
      const upgradeProductKey = safeText(upgradeProductButton.dataset.myStoreUpgradeProductKey);
      setMyStoreUpgradeSelectionProduct(upgradeProductKey);
      return;
    }
    const productActionButton = targetElement.closest('[data-my-store-product-action]');
    if (!(productActionButton instanceof HTMLButtonElement)) {
      return;
    }
    const productAction = safeText(productActionButton.dataset.myStoreProductAction);
    const packageKey = safeText(productActionButton.dataset.myStorePackageKey);
    navigateToMyStoreProduct(productAction, packageKey);
  });
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
    requestDetail?.parentUsername
    || requestDetail?.parentMemberCode
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

function buildTreeNextEnrollRequestHeaders(baseHeaders = {}) {
  const headers = {
    ...baseHeaders,
  };

  if (state.source !== 'member') {
    return headers;
  }

  const authToken = safeText(state.session?.authToken);
  if (!authToken) {
    throw new Error('Missing member auth token. Sign in again before enrolling.');
  }

  return {
    ...headers,
    Authorization: `Bearer ${authToken}`,
  };
}

async function submitTreeNextEnrollmentRequest(payload = {}) {
  const response = await fetch(resolveEnrollRegisteredMembersApi(), {
    method: 'POST',
    headers: buildTreeNextEnrollRequestHeaders({
      'Content-Type': 'application/json',
    }),
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

async function createTreeNextEnrollmentCheckoutSession(payload = {}) {
  const response = await fetch(resolveEnrollRegisteredMembersSessionApi(), {
    method: 'POST',
    headers: buildTreeNextEnrollRequestHeaders({
      'Content-Type': 'application/json',
    }),
    credentials: 'same-origin',
    body: JSON.stringify(payload),
  });

  const responsePayload = await response.json().catch(() => null);
  if (!response.ok) {
    const failureMessage = typeof responsePayload?.error === 'string'
      ? responsePayload.error
      : 'Unable to create Stripe checkout session for enrollment.';
    throw new Error(failureMessage);
  }

  const sessionId = safeText(responsePayload?.sessionId);
  const sessionUrl = safeText(responsePayload?.sessionUrl);
  if (!sessionId || !sessionUrl) {
    throw new Error('Enrollment checkout response is missing Stripe session details.');
  }

  return {
    sessionId,
    sessionUrl,
    checkout: responsePayload?.checkout && typeof responsePayload.checkout === 'object'
      ? responsePayload.checkout
      : {},
  };
}

async function completeTreeNextEnrollmentCheckoutSession(sessionId) {
  const safeSessionId = safeText(sessionId);
  if (!safeSessionId) {
    throw new Error('Checkout session ID is required to finalize enrollment.');
  }

  const response = await fetch(resolveEnrollRegisteredMembersSessionCompleteApi(), {
    method: 'POST',
    headers: buildTreeNextEnrollRequestHeaders({
      'Content-Type': 'application/json',
    }),
    credentials: 'same-origin',
    body: JSON.stringify({
      sessionId: safeSessionId,
    }),
  });

  const responsePayload = await response.json().catch(() => null);
  if (!response.ok) {
    const failureMessage = typeof responsePayload?.error === 'string'
      ? responsePayload.error
      : 'Unable to finalize enrollment checkout.';
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
    checkoutSession: responsePayload?.checkoutSession && typeof responsePayload.checkoutSession === 'object'
      ? responsePayload.checkoutSession
      : null,
    paymentIntent: responsePayload?.paymentIntent && typeof responsePayload.paymentIntent === 'object'
      ? responsePayload.paymentIntent
      : null,
  };
}

async function finalizeTreeNextEnrollmentCheckoutSessionFromStripeReturn(sessionId, options = {}) {
  const safeSessionId = safeText(sessionId);
  if (!safeSessionId) {
    return;
  }
  if (enrollCheckoutFinalizationInFlightSessionIds.has(safeSessionId)) {
    return;
  }
  enrollCheckoutFinalizationInFlightSessionIds.add(safeSessionId);
  const submitLabel = treeNextEnrollModalSubmitButton instanceof HTMLButtonElement
    ? treeNextEnrollModalSubmitButton.textContent || 'Register and Pay'
    : 'Register and Pay';

  try {
    const checkoutWindow = options?.checkoutWindow;
    const preserveCurrentStep = Boolean(options?.preserveCurrentStep);
    const pendingCheckoutState = readTreeNextPendingCheckoutState(TREE_NEXT_PENDING_CHECKOUT_ENROLL_KEY);
    const pendingPlacementLock = (
      pendingCheckoutState?.placementLock && typeof pendingCheckoutState.placementLock === 'object'
    )
      ? pendingCheckoutState.placementLock
      : null;
    const pendingPackageKey = resolveTreeNextEnrollPackageKey(
      pendingCheckoutState?.packageKey || ENROLL_DEFAULT_PACKAGE_KEY,
    );
    const pendingTierKey = normalizeCredentialValue(
      pendingCheckoutState?.tierKey || resolveEnrollFastTrackTierFromPackage(pendingPackageKey),
    );
    const pendingSpilloverSide = normalizeBinarySide(pendingCheckoutState?.spilloverPlacementSide) === 'right'
      ? 'right'
      : 'left';
    const pendingSpilloverMode = Boolean(pendingCheckoutState?.isSpilloverPlacement);

    if (pendingPlacementLock && typeof pendingPlacementLock === 'object') {
      state.enroll.placementLock = {
        ...pendingPlacementLock,
      };
    }

    setTreeNextEnrollModalOpen(true);
    if (!preserveCurrentStep) {
      setTreeNextEnrollStep(3, { focusField: false });
    }
    state.enroll.submitting = true;
    if (treeNextEnrollModalSubmitButton instanceof HTMLButtonElement) {
      treeNextEnrollModalSubmitButton.disabled = true;
      treeNextEnrollModalSubmitButton.textContent = 'Finalizing enrollment...';
    }
    setTreeNextEnrollFeedback('Finalizing enrollment...', 'neutral', { loading: true });

    const maxAttempts = checkoutWindow ? 240 : 5;
    const pollDelayMs = checkoutWindow ? 1200 : 700;
    let completionResult = await completeTreeNextEnrollmentCheckoutSession(safeSessionId);
    let completionAttempts = 0;
    while (!completionResult.completed && completionAttempts < maxAttempts) {
      if (checkoutWindow?.closed) {
        completionResult = await completeTreeNextEnrollmentCheckoutSession(safeSessionId);
        if (!completionResult.completed) {
          throw new Error('Stripe checkout window was closed before payment completed.');
        }
        break;
      }
      await new Promise((resolve) => window.setTimeout(resolve, pollDelayMs));
      completionAttempts += 1;
      completionResult = await completeTreeNextEnrollmentCheckoutSession(safeSessionId);
    }
    if (!completionResult.completed || !completionResult.member) {
      throw new Error('Payment captured, but enrollment is still processing. Please retry in a moment.');
    }
    if (checkoutWindow && !checkoutWindow.closed) {
      checkoutWindow.close();
    }

    const createdMember = completionResult.member;
    const enrolledName = safeText(createdMember?.fullName || createdMember?.name) || 'Member';
    const packageLabel = safeText(
      createdMember?.enrollmentPackageLabel
      || resolveEnrollPackageMeta(pendingPackageKey)?.label
      || 'Legacy Builder Package',
    ) || 'Legacy Builder Package';
    const effectiveTier = normalizeCredentialValue(createdMember?.fastTrackTier || pendingTierKey);
    const fallbackBonus = resolveEnrollFastTrackBonusAmount(pendingPackageKey, effectiveTier);
    const commissionAmount = Math.max(0, safeNumber(createdMember?.fastTrackBonusAmount, fallbackBonus));

    const placementLock = pendingPlacementLock && typeof pendingPlacementLock === 'object'
      ? pendingPlacementLock
      : null;
    const placementSide = normalizeBinarySide(placementLock?.placementLeg) || pendingSpilloverSide;
    const placementSideLabel = (placementSide === 'right' ? 'RIGHT' : 'LEFT');
    const isSpilloverPlacement = pendingSpilloverMode || normalizeCredentialValue(placementLock?.placementLeg) === 'spillover';
    const placementSummary = isSpilloverPlacement
      ? `SPILLOVER ${placementSideLabel}`
      : `${placementSideLabel} leg`;
    const spilloverParentReference = safeText(
      createdMember?.spilloverParentReference
      || createdMember?.spillover_parent_reference,
    );
    const hasManualSpilloverParent = isSpilloverPlacement && Boolean(spilloverParentReference);
    const parentLabel = safeText(placementLock?.parentName || placementLock?.parentId || 'selected sponsor');
    const successFeedback = (isSpilloverPlacement && !hasManualSpilloverParent)
      ? `${enrolledName} enrolled on ${placementSummary}. Receiving parent will auto-assign after live sync.`
      : `${enrolledName} enrolled on ${placementSummary} under ${parentLabel}.`;
    const finalFeedback = completionResult.warning
      ? `${successFeedback} ${completionResult.warning}`
      : successFeedback;

    if (placementLock) {
      state.enroll.pendingPlacement = {
        createdMember,
        placementLock: {
          ...placementLock,
        },
        packageKey: pendingPackageKey,
      };
    } else {
      state.enroll.pendingPlacement = null;
    }

    // Keep the tree slot reserved until the user confirms via Done.
    // Forced live sync here can pre-place the node and cause duplicate placement errors.
    if (!state.enroll.pendingPlacement) {
      await syncTreeNextLiveNodes({ force: true, silent: true, reason: 'enroll-hosted-checkout' });
    }

    void (async () => {
      try {
        if (state.source === 'member') {
          await refreshAuthenticatedMemberSessionSnapshot({ skipAccountOverviewReset: true });
        }
        resetAccountOverviewRemoteSnapshot();
        resetRankAdvancementSnapshot();
        const overviewContext = resolveAccountOverviewPanelContext();
        const homeNode = overviewContext?.homeNode || resolveNodeById('root');
        await refreshAccountOverviewRemoteSnapshot({
          force: true,
          homeNode,
          scope: overviewContext?.scope,
          preferHomeNodeIdentity: overviewContext?.preferHomeNodeIdentity,
        });
        await refreshRankAdvancementSnapshot({
          force: true,
          homeNode,
        });
        syncAccountOverviewPanelVisuals();
        syncRankAdvancementPanelVisuals();
      } catch {
        // Enrollment success should not fail when account-overview refresh has transient network issues.
      }
    })();

    setTreeNextEnrollFeedback(finalFeedback, true);
    showTreeNextEnrollThankYouStep({
      enrolledName,
      packageLabel,
      commissionAmount,
      passwordSetupLink: createdMember?.passwordSetupLink,
    });
    clearTreeNextPendingCheckoutState(TREE_NEXT_PENDING_CHECKOUT_ENROLL_KEY);
  } catch (error) {
    const fallbackMessage = error instanceof Error
      ? error.message
      : 'Unable to finalize enrollment right now.';
    setTreeNextEnrollFeedback(fallbackMessage, false);
  } finally {
    state.enroll.submitting = false;
    if (treeNextEnrollModalSubmitButton instanceof HTMLButtonElement) {
      treeNextEnrollModalSubmitButton.disabled = false;
      treeNextEnrollModalSubmitButton.textContent = submitLabel;
    }
    enrollCheckoutFinalizationInFlightSessionIds.delete(safeSessionId);
  }
}

function normalizeTreeNextStripeReturnPayload(payload = {}) {
  const source = payload && typeof payload === 'object'
    ? payload
    : {};
  const checkoutStatus = normalizeCredentialValue(
    source.checkoutStatus || source.status,
  );
  const flow = normalizeCredentialValue(source.flow);
  const sessionId = safeText(source.sessionId);
  const signalId = safeText(source.signalId || source.id);
  const emittedAtRaw = safeText(source.emittedAt);
  const emittedAtMs = emittedAtRaw
    ? Date.parse(emittedAtRaw)
    : Number.NaN;
  if (!checkoutStatus || !flow) {
    return null;
  }
  if (checkoutStatus === 'success' && !sessionId) {
    return null;
  }
  return {
    checkoutStatus,
    flow,
    sessionId,
    signalId,
    emittedAtMs: Number.isFinite(emittedAtMs) ? emittedAtMs : 0,
  };
}

function buildTreeNextStripeReturnSignalKey(payload = {}) {
  const normalizedPayload = normalizeTreeNextStripeReturnPayload(payload);
  if (!normalizedPayload) {
    return '';
  }
  if (normalizedPayload.signalId) {
    return normalizedPayload.signalId;
  }
  return `${normalizedPayload.flow}:${normalizedPayload.checkoutStatus}:${normalizedPayload.sessionId || 'none'}`;
}

async function processTreeNextStripeCheckoutReturnPayload(payload = {}, options = {}) {
  const normalizedPayload = normalizeTreeNextStripeReturnPayload(payload);
  if (!normalizedPayload) {
    return false;
  }
  const checkoutStatus = normalizedPayload.checkoutStatus;
  const flow = normalizedPayload.flow;
  const sessionId = normalizedPayload.sessionId;
  const preserveCurrentStep = Boolean(options?.preserveCurrentStep);

  if (flow === TREE_NEXT_STRIPE_RETURN_FLOW_MY_STORE) {
    if (checkoutStatus === 'cancel') {
      setMyStorePanelVisible(true);
      if (!preserveCurrentStep) {
        setMyStoreStep(MY_STORE_STEP_CHECKOUT, { clearCheckoutFeedback: true });
      }
      setMyStoreCheckoutFeedback('Checkout was canceled. You can review your details and try again.', {
        isError: true,
      });
      clearTreeNextPendingCheckoutState(TREE_NEXT_PENDING_CHECKOUT_MY_STORE_KEY);
      return true;
    }
    if (checkoutStatus === 'success') {
      if (options?.showPendingThankYou !== false) {
        const pendingSummary = resolveMyStorePendingCheckoutSummary(sessionId);
        setMyStorePanelVisible(true);
        showMyStoreCheckoutPendingThankYouStep({
          message: pendingSummary
            ? 'Payment successful. Order confirmed instantly.'
            : 'Payment successful. Receipt is syncing now.',
          amountPaid: pendingSummary?.amountPaid,
          bv: pendingSummary?.bv,
          status: 'Pending',
          invoiceId: pendingSummary?.invoiceId || 'Generating...',
          dateLabel: pendingSummary?.dateLabel,
        });
      }
      await finalizeMyStoreCheckoutSessionFromStripeReturn(sessionId, {
        preserveCurrentStep: options?.showPendingThankYou !== false
          ? true
          : preserveCurrentStep,
        ensurePanelVisible: options?.ensureMyStorePanelVisible !== false,
        maxAttempts: options?.maxAttempts,
        pollDelayMs: options?.pollDelayMs,
      });
      return true;
    }
    return true;
  }

  if (flow === TREE_NEXT_STRIPE_RETURN_FLOW_ENROLL) {
    if (checkoutStatus === 'cancel') {
      setTreeNextEnrollModalOpen(true);
      if (!preserveCurrentStep) {
        setTreeNextEnrollStep(1, { focusField: false });
      }
      setTreeNextEnrollFeedback('Checkout was canceled. Enrollment details were not submitted.', false);
      clearTreeNextPendingCheckoutState(TREE_NEXT_PENDING_CHECKOUT_ENROLL_KEY);
      return true;
    }
    if (checkoutStatus === 'success') {
      await finalizeTreeNextEnrollmentCheckoutSessionFromStripeReturn(sessionId, {
        preserveCurrentStep,
      });
      return true;
    }
    return true;
  }

  return false;
}

function resolveTreeNextStripeReturnSignalPayload(rawValue) {
  const parsed = parseSessionPayload(rawValue);
  return normalizeTreeNextStripeReturnPayload(parsed || {});
}

async function processTreeNextStripeReturnSignalPayload(payload = {}, options = {}) {
  const normalizedPayload = normalizeTreeNextStripeReturnPayload(payload);
  if (!normalizedPayload) {
    return false;
  }
  if (
    normalizedPayload.emittedAtMs > 0
    && (Date.now() - normalizedPayload.emittedAtMs) > TREE_NEXT_STRIPE_RETURN_SIGNAL_MAX_AGE_MS
  ) {
    return false;
  }
  const signalKey = buildTreeNextStripeReturnSignalKey(normalizedPayload);
  if (signalKey && treeNextStripeReturnSignalHandledKeys.has(signalKey)) {
    return false;
  }
  if (signalKey) {
    treeNextStripeReturnSignalHandledKeys.add(signalKey);
  }
  try {
    const handled = await processTreeNextStripeCheckoutReturnPayload(normalizedPayload, {
      preserveCurrentStep: true,
      ensureMyStorePanelVisible: true,
      showPendingThankYou: true,
      maxAttempts: 90,
      pollDelayMs: 700,
      ...options,
    });
    if (handled && options?.consumeSignal !== false) {
      safeStorageRemove(window.localStorage, TREE_NEXT_STRIPE_RETURN_SIGNAL_STORAGE_KEY);
    }
    return handled;
  } finally {
    if (signalKey) {
      treeNextStripeReturnSignalHandledKeys.delete(signalKey);
    }
  }
}

async function processTreeNextStripeReturnSignalFromStorage(options = {}) {
  const signalPayload = resolveTreeNextStripeReturnSignalPayload(
    safeStorageGet(window.localStorage, TREE_NEXT_STRIPE_RETURN_SIGNAL_STORAGE_KEY),
  );
  if (!signalPayload) {
    return false;
  }
  return processTreeNextStripeReturnSignalPayload(signalPayload, options);
}

function onTreeNextStripeReturnMessage(event) {
  if (!event || safeText(event.origin) !== window.location.origin) {
    return;
  }
  const data = event.data && typeof event.data === 'object'
    ? event.data
    : null;
  if (!data) {
    return;
  }
  if (safeText(data.type) !== TREE_NEXT_STRIPE_RETURN_MESSAGE_TYPE) {
    return;
  }
  const payload = data.payload && typeof data.payload === 'object'
    ? data.payload
    : data;
  void processTreeNextStripeReturnSignalPayload(payload, {
    preserveCurrentStep: true,
  });
}

async function processTreeNextStripeCheckoutReturn() {
  const returnDetails = resolveTreeNextStripeReturnDetails();
  const hasReturnParams = Boolean(
    returnDetails.checkoutStatus
    || returnDetails.flow
    || returnDetails.sessionId,
  );
  if (!hasReturnParams) {
    return;
  }
  await processTreeNextStripeCheckoutReturnPayload(returnDetails, {
    preserveCurrentStep: false,
    ensureMyStorePanelVisible: true,
    showPendingThankYou: true,
    maxAttempts: 90,
    pollDelayMs: 700,
  });
  clearTreeNextStripeReturnQueryParameters();
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

function shouldSkipTreeNextPendingPlacementApply(pendingPlacement = null) {
  const createdMember = pendingPlacement?.createdMember;
  if (!createdMember || typeof createdMember !== 'object') {
    return false;
  }

  const placementLegKey = normalizeCredentialValue(createdMember?.placementLeg);
  const isSpilloverPlacement = Boolean(createdMember?.isSpillover) || SPILLOVER_PLACEMENT_KEY_SET.has(placementLegKey);
  if (!isSpilloverPlacement) {
    return false;
  }

  const spilloverParentReference = safeText(
    createdMember?.spilloverParentReference
    || createdMember?.spillover_parent_reference,
  );
  return !spilloverParentReference;
}

function buildTreeNextPlacementIdentityLookupSet(record = null) {
  const source = record && typeof record === 'object' ? record : null;
  const lookup = new Set();
  if (!source) {
    return lookup;
  }

  const register = (value) => {
    const safeValue = safeText(value).replace(/^@+/, '');
    const key = normalizeTreeNextLiveLookupKey(safeValue);
    if (key) {
      lookup.add(key);
    }
  };

  register(source?.id);
  register(source?.userId);
  register(source?.user_id);
  register(source?.memberId);
  register(source?.member_id);
  register(source?.memberUsername);
  register(source?.member_username);
  register(source?.username);
  register(source?.memberCode);
  register(source?.member_code);
  register(source?.email);

  return lookup;
}

function resolveExistingTreeNextPendingPlacementNode(pendingPlacement = null) {
  const pending = pendingPlacement && typeof pendingPlacement === 'object'
    ? pendingPlacement
    : null;
  const createdMember = pending?.createdMember && typeof pending.createdMember === 'object'
    ? pending.createdMember
    : null;
  if (!createdMember) {
    return null;
  }

  const memberLookup = buildTreeNextPlacementIdentityLookupSet(createdMember);
  if (!memberLookup.size) {
    return null;
  }

  const expectedParentId = safeText(pending?.placementLock?.parentId);
  const expectedPlacementLeg = normalizeBinarySide(pending?.placementLock?.placementLeg) === 'right'
    ? 'right'
    : 'left';

  let fallbackMatch = null;
  for (const rawNode of state.nodes) {
    const node = rawNode && typeof rawNode === 'object' ? rawNode : null;
    if (!node) {
      continue;
    }
    const nodeId = safeText(node?.id);
    if (!nodeId || nodeId === 'root') {
      continue;
    }

    const nodeLookup = buildTreeNextPlacementIdentityLookupSet({
      id: nodeId,
      userId: node?.userId,
      user_id: node?.user_id,
      memberId: node?.memberId,
      member_id: node?.member_id,
      memberUsername: node?.memberUsername || node?.username,
      username: node?.username,
      memberCode: node?.memberCode,
      member_code: node?.member_code,
      email: node?.email,
    });
    if (!nodeLookup.size) {
      continue;
    }

    let matchedIdentity = false;
    for (const key of nodeLookup) {
      if (memberLookup.has(key)) {
        matchedIdentity = true;
        break;
      }
    }
    if (!matchedIdentity) {
      continue;
    }

    const nodeParentId = safeText(node?.parent || node?.parentId);
    const nodePlacementLegRaw = normalizeBinarySide(node?.side || node?.placementSide || node?.sponsorLeg);
    const nodePlacementLeg = nodePlacementLegRaw === 'right'
      ? 'right'
      : (nodePlacementLegRaw === 'left' ? 'left' : expectedPlacementLeg);
    const strictPlacementMatch = expectedParentId
      ? (nodeParentId === expectedParentId && nodePlacementLeg === expectedPlacementLeg)
      : true;
    const matchResult = {
      nodeId,
      parentId: nodeParentId || expectedParentId,
      placementLeg: nodePlacementLeg || expectedPlacementLeg,
    };

    if (strictPlacementMatch) {
      return matchResult;
    }
    if (!fallbackMatch) {
      fallbackMatch = matchResult;
    }
  }

  return fallbackMatch;
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
  if (shouldSkipTreeNextPendingPlacementApply(pendingPlacement)) {
    state.enroll.pendingPlacement = null;
    return {
      success: false,
      skipped: true,
      reason: 'spillover-auto-placement',
    };
  }

  const existingPlacement = resolveExistingTreeNextPendingPlacementNode(pendingPlacement);
  if (existingPlacement?.nodeId) {
    state.enroll.pendingPlacement = null;
    return {
      success: true,
      nodeId: existingPlacement.nodeId,
      parentId: existingPlacement.parentId,
      placementLeg: normalizeBinarySide(existingPlacement.placementLeg) === 'right' ? 'right' : 'left',
      alreadyPlaced: true,
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

async function handleTreeNextEnrollModalSubmit(event = null) {
  if (event && typeof event.preventDefault === 'function') {
    event.preventDefault();
  }
  clearTreeNextEnrollFeedback();

  const currentStep = resolveTreeNextEnrollStep();
  if (currentStep < 2) {
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
  // Always forward the anticipation parent as a server-side spillover anchor.
  // If server policy forces spillover (first level fully occupied), this prevents
  // fallback queue placement from drifting away from the selected anticipation node.
  const spilloverParentReference = safeText(placementLock.parentReference || placementLock.parentId);
  const spilloverParentMode = spilloverParentReference ? 'manual' : 'auto';

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
  const actionButton = currentStep === 2
    ? treeNextEnrollStepTwoNextButton
    : treeNextEnrollModalSubmitButton;
  const submitLabel = actionButton instanceof HTMLButtonElement
    ? actionButton.textContent || 'Continue to Stripe'
    : 'Continue to Stripe';
  const checkoutWindow = openTreeNextStripeCheckoutWindow();
  if (!checkoutWindow) {
    setTreeNextEnrollFeedback('Pop-up blocked. Please allow pop-ups to continue with Stripe checkout.', false);
    return;
  }

  state.enroll.submitting = true;
  if (actionButton instanceof HTMLButtonElement) {
    actionButton.disabled = true;
    actionButton.textContent = 'Opening Stripe...';
  }

  try {
    state.enroll.pendingPlacement = null;
    setTreeNextEnrollFeedback('Preparing secure payment...', 'neutral', { loading: true });
    const checkoutSessionResult = await createTreeNextEnrollmentCheckoutSession({
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
      billingAddress: '',
      billingCity: '',
      billingState: '',
      billingPostalCode: '',
      billingCountry: '',
      billingCountryCode: '',
      returnPath: buildTreeNextStripeReturnPath(TREE_NEXT_STRIPE_RETURN_FLOW_ENROLL),
    });
    persistTreeNextPendingCheckoutState(TREE_NEXT_PENDING_CHECKOUT_ENROLL_KEY, {
      packageKey,
      tierKey,
      isSpilloverPlacement,
      spilloverPlacementSide,
      placementLock: {
        ...placementLock,
      },
      submittedAt: new Date().toISOString(),
    });
    setTreeNextEnrollFeedback('Stripe checkout opened in a new window. Complete payment to continue...', 'neutral', { loading: true });
    checkoutWindow.location.replace(checkoutSessionResult.sessionUrl);
    checkoutWindow.focus();
    await finalizeTreeNextEnrollmentCheckoutSessionFromStripeReturn(checkoutSessionResult.sessionId, {
      checkoutWindow,
      preserveCurrentStep: true,
    });
  } catch (error) {
    const fallbackMessage = error instanceof Error
      ? error.message
      : 'Unable to register member right now.';
    setTreeNextEnrollFeedback(fallbackMessage, false);
  } finally {
    state.enroll.submitting = false;
    if (actionButton instanceof HTMLButtonElement) {
      actionButton.disabled = false;
      actionButton.textContent = submitLabel;
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
      if (applyResult.skipped) {
        void syncTreeNextLiveNodes({
          force: true,
          silent: true,
          reason: 'enroll-done-skip-pending-placement',
        });
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
    treeNextEnrollStepTwoNextButton.addEventListener('click', () => {
      void handleTreeNextEnrollModalSubmit();
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
      void handleTreeNextEnrollModalSubmit();
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
  const identity = resolveTreeNextNodePublicIdentity(node, { fallbackName: fallback });
  const name = safeText(identity.name || node.name || node.id) || fallback;
  if (!identity.isMasked && identity.username) {
    const username = safeText(identity.username || '');
    return `${name} (@${username})`;
  }
  return name;
}

function resolveNodeLegVolumes(nodeId) {
  const globalMeta = resolveGlobalNodeMetrics(nodeId);
  const selectedNode = globalMeta?.node || null;
  const personalVolume = Math.max(0, Math.floor(resolveNodeCurrentPersonalBvForActivity(selectedNode)));
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

function resolveSideNavMemberStatusSnapshot(targetNodeInput = null) {
  const targetNode = targetNodeInput && typeof targetNodeInput === 'object'
    ? targetNodeInput
    : (resolveNodeById(resolvePreferredGlobalHomeNodeId()) || resolveNodeById('root') || null);
  const targetNodeId = safeText(targetNode?.id || resolvePreferredGlobalHomeNodeId() || 'root') || 'root';
  const snapshotHash = safeText(state.liveSync?.lastAppliedHash || '');
  const cacheSignature = `${targetNodeId}::${snapshotHash}`;

  if (
    cacheSignature
    && cacheSignature === sideNavMemberStatusCachedSignature
    && sideNavMemberStatusCachedSnapshot
  ) {
    return sideNavMemberStatusCachedSnapshot;
  }

  const fallbackSnapshot = {
    targetNodeId,
    totalMembers: 0,
    totalActiveMembers: 0,
    leftActiveMembers: 0,
    rightActiveMembers: 0,
    leftDirectSponsors: 0,
    rightDirectSponsors: 0,
    totalDirectSponsors: 0,
  };
  let nextSnapshot = fallbackSnapshot;

  try {
    const safeNodes = Array.isArray(state.nodes) ? state.nodes : [];
    if (!safeNodes.length) {
      sideNavMemberStatusCachedSignature = cacheSignature;
      sideNavMemberStatusCachedSnapshot = fallbackSnapshot;
      return fallbackSnapshot;
    }

    const targetGlobalMeta = resolveGlobalNodeMetrics(targetNodeId);
    const targetNodeIdKey = normalizeCredentialValue(targetNodeId);
    const targetPath = safeText(targetGlobalMeta?.globalPath).toUpperCase();
    const targetIsRootScope = (
      targetNodeIdKey === 'root'
      || targetNodeIdKey === normalizeCredentialValue(LIVE_TREE_GLOBAL_ROOT_ID)
      || targetNodeIdKey === normalizeCredentialValue(ADMIN_ROOT_USERNAME)
    );
    if (!targetGlobalMeta || (!targetPath && !targetIsRootScope)) {
      sideNavMemberStatusCachedSignature = cacheSignature;
      sideNavMemberStatusCachedSnapshot = fallbackSnapshot;
      return fallbackSnapshot;
    }

    const leftPrefix = `${targetPath}L`;
    const rightPrefix = `${targetPath}R`;
    const rootKey = normalizeCredentialValue(LIVE_TREE_GLOBAL_ROOT_ID);
    const adminKey = normalizeCredentialValue(ADMIN_ROOT_USERNAME);
    const targetUsernameKey = normalizeCredentialValue(
      safeText(targetNode?.username || targetNode?.memberCode || '').replace(/^@+/, ''),
    );
    const resolvedGlobalNodes = state.adapter.resolveVisibleNodes(getGlobalUniverseOptions());
    const globalNodes = Array.isArray(resolvedGlobalNodes) ? resolvedGlobalNodes : [];
    const nodePathById = new Map();
    for (const globalNode of globalNodes) {
      const nodeId = safeText(globalNode?.id);
      if (!nodeId) {
        continue;
      }
      const nodePath = safeText(globalNode?.path).toUpperCase();
      if (nodePath) {
        nodePathById.set(nodeId, nodePath);
      }
    }

    let totalMembers = 0;
    let totalActiveMembers = 0;
    let leftActiveMembers = 0;
    let rightActiveMembers = 0;
    let leftDirectSponsors = 0;
    let rightDirectSponsors = 0;
    let totalDirectSponsors = 0;

    for (const nodeInput of safeNodes) {
      const node = nodeInput && typeof nodeInput === 'object' ? nodeInput : null;
      if (!node || isInfinityBuilderPlaceholderNode(node)) {
        continue;
      }
      const nodeId = safeText(node?.id);
      const nodeIdKey = normalizeCredentialValue(nodeId);
      if (
        !nodeIdKey
        || nodeIdKey === 'root'
        || nodeIdKey === rootKey
        || nodeIdKey === adminKey
        || (targetNodeIdKey && nodeIdKey === targetNodeIdKey)
      ) {
        continue;
      }

      const nodePath = safeText(nodePathById.get(nodeId)).toUpperCase();
      const isLeftMember = Boolean(leftPrefix && nodePath.startsWith(leftPrefix));
      const isRightMember = Boolean(rightPrefix && nodePath.startsWith(rightPrefix));
      if (!isLeftMember && !isRightMember) {
        continue;
      }

      totalMembers += 1;
      if (resolveNodeActivityState(node)) {
        totalActiveMembers += 1;
        if (isLeftMember) {
          leftActiveMembers += 1;
        } else if (isRightMember) {
          rightActiveMembers += 1;
        }
      }

      const sponsorNodeIdKey = normalizeCredentialValue(
        safeText(node?.sponsorId || node?.globalSponsorId || node?.sourceSponsorId || node?.source_sponsor_id || ''),
      );
      const sponsorUsernameKey = normalizeCredentialValue(
        safeText(node?.sponsorUsername || node?.sponsor_username || '').replace(/^@+/, ''),
      );
      const isDirectBySponsorId = Boolean(
        targetNodeIdKey
        && sponsorNodeIdKey
        && sponsorNodeIdKey === targetNodeIdKey,
      );
      const isDirectBySponsorUsername = Boolean(
        targetUsernameKey
        && sponsorUsernameKey
        && sponsorUsernameKey === targetUsernameKey,
      );
      if (!isDirectBySponsorId && !isDirectBySponsorUsername) {
        continue;
      }
      totalDirectSponsors += 1;
      if (isLeftMember) {
        leftDirectSponsors += 1;
      } else if (isRightMember) {
        rightDirectSponsors += 1;
      }
    }

    nextSnapshot = {
      targetNodeId,
      totalMembers,
      totalActiveMembers,
      leftActiveMembers,
      rightActiveMembers,
      leftDirectSponsors,
      rightDirectSponsors,
      totalDirectSponsors,
    };
  } catch {
    nextSnapshot = fallbackSnapshot;
  }

  sideNavMemberStatusCachedSignature = cacheSignature;
  sideNavMemberStatusCachedSnapshot = nextSnapshot;
  return nextSnapshot;
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
    const identity = resolveTreeNextNodePublicIdentity(node, { fallbackName: nodeId });
    const volumes = resolveNodeLegVolumes(nodeId);
    return {
      key: nodeId,
      nodeId,
      label: truncateText(safeText(identity.name || node?.name || nodeId), 18),
      initials: safeText(identity.initials || resolveInitials(safeText(node?.name || nodeId))),
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
  if (state.source === 'admin') {
    return ADMIN_ROOT_DISPLAY_NAME;
  }

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
  return 'Member';
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

function isGrayRgbTriplet(rgbTriplet, channelDeltaThreshold = 14) {
  if (!Array.isArray(rgbTriplet) || rgbTriplet.length < 3) {
    return false;
  }
  const [red, green, blue] = normalizeRgbTriplet(rgbTriplet[0], rgbTriplet[1], rgbTriplet[2]);
  const maxChannel = Math.max(red, green, blue);
  const minChannel = Math.min(red, green, blue);
  return (maxChannel - minChannel) <= Math.max(0, Math.floor(safeNumber(channelDeltaThreshold, 14)));
}

function isGrayAvatarPalette(palette, channelDeltaThreshold = 14) {
  if (!isAvatarPaletteRecord(palette)) {
    return false;
  }
  return (
    isGrayRgbTriplet(palette.light, channelDeltaThreshold)
    && isGrayRgbTriplet(palette.mid, channelDeltaThreshold)
    && isGrayRgbTriplet(palette.dark, channelDeltaThreshold)
  );
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
  if (explicitPalette && !isGrayAvatarPalette(explicitPalette)) {
    return explicitPalette;
  }

  const colorTriplet = resolveSessionAvatarColorTriplet(sessionInput);
  if (colorTriplet && !isGrayRgbTriplet(colorTriplet)) {
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
  const shouldMaskIdentity = shouldApplyTreeNextNodePrivacyMask(nodeRecord);
  const shouldDisablePhoto = disablePhoto || shouldMaskIdentity;
  const photoUrl = resolveNodeAvatarPhotoUrl(nodeRecord);
  if (!shouldDisablePhoto && photoUrl && drawImageAvatarCircle(cx, cy, radius, photoUrl)) {
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
    disablePhoto: shouldDisablePhoto,
    ignoreSourcePalette: shouldMaskIdentity ? true : options?.ignoreSourcePalette,
    variant: shouldMaskIdentity ? 'inactive' : options?.variant,
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

function resolveLegacyTierCanvasSelectedBinaryNodeId(nodeIdInput = state.selectedId) {
  if (!isLegacyTierCanvasViewActive()) {
    return '';
  }
  const selectedId = safeText(nodeIdInput);
  if (!selectedId) {
    return '';
  }
  const projectedNodes = Array.isArray(state.frameResult?.projectedNodes)
    ? state.frameResult.projectedNodes
    : [];
  const selectedProjectedNode = projectedNodes.find((node) => safeText(node?.id) === selectedId) || null;
  const selectedNodeRecord = selectedProjectedNode?.node && typeof selectedProjectedNode.node === 'object'
    ? selectedProjectedNode.node
    : null;
  const isEmptySlot = Boolean(
    selectedProjectedNode?.isLegacyTierEmptySlot
    || selectedNodeRecord?.isLegacyTierEmptySlot
    || selectedNodeRecord?.isLegacyTierViewPlaceholder,
  );
  if (isEmptySlot) {
    return '';
  }

  const candidates = [];
  const pushCandidate = (candidateInput = '') => {
    const candidate = safeText(candidateInput);
    if (!candidate) {
      return;
    }
    candidates.push(candidate);
    const duplicateIndex = candidate.indexOf('::');
    if (duplicateIndex > 0) {
      const baseCandidate = safeText(candidate.slice(0, duplicateIndex));
      if (baseCandidate) {
        candidates.push(baseCandidate);
      }
    }
  };
  pushCandidate(selectedProjectedNode?.avatarSeedId);
  pushCandidate(selectedNodeRecord?.avatarSeedId);
  pushCandidate(selectedNodeRecord?.avatarSeed);
  pushCandidate(selectedNodeRecord?.id);
  pushCandidate(selectedId);

  for (const candidateId of candidates) {
    if (resolveNodeById(candidateId)) {
      return candidateId;
    }
  }

  const username = safeText(
    selectedNodeRecord?.username
    || selectedNodeRecord?.memberCode
    || selectedNodeRecord?.member_code
    || '',
  ).replace(/^@+/, '');
  if (!username) {
    return '';
  }
  return safeText(resolveNodeIdByUsername(username));
}

function enterSelectedUniverseNodeFromCurrentView() {
  if (isLegacyTierCanvasViewActive()) {
    const targetNodeId = resolveLegacyTierCanvasSelectedBinaryNodeId(state.selectedId);
    if (!targetNodeId) {
      return false;
    }
    closeLegacyTierCanvasView({ preserveSelection: false });
    setSelectedNode(targetNodeId, { animate: false });
    return enterNodeUniverseWithZoomHint(targetNodeId);
  }
  return enterNodeUniverseWithZoomHint(state.selectedId);
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

function safeStorageSet(storage, key, value) {
  try {
    if (!storage) {
      return false;
    }
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function safeStorageRemove(storage, key) {
  try {
    if (!storage) {
      return false;
    }
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function persistTreeNextPendingCheckoutState(storageKey, payload = {}) {
  if (!storageKey) {
    return false;
  }

  const serialized = JSON.stringify(payload || {});
  const wroteSession = safeStorageSet(window.sessionStorage, storageKey, serialized);
  const wroteLocal = safeStorageSet(window.localStorage, storageKey, serialized);
  return wroteSession || wroteLocal;
}

function readTreeNextPendingCheckoutState(storageKey) {
  if (!storageKey) {
    return null;
  }
  const raw = safeStorageGet(window.sessionStorage, storageKey)
    || safeStorageGet(window.localStorage, storageKey);
  return parseSessionPayload(raw);
}

function clearTreeNextPendingCheckoutState(storageKey) {
  if (!storageKey) {
    return;
  }
  safeStorageRemove(window.sessionStorage, storageKey);
  safeStorageRemove(window.localStorage, storageKey);
}

function resolveTreeNextStripeReturnDetails() {
  const query = new URLSearchParams(window.location.search || '');
  return {
    checkoutStatus: normalizeCredentialValue(query.get('checkout')),
    sessionId: safeText(query.get('session_id')),
    flow: normalizeCredentialValue(query.get(TREE_NEXT_STRIPE_RETURN_FLOW_QUERY_KEY)),
  };
}

function resolveTreeNextStripeReturnTargetPath() {
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.delete('checkout');
  currentUrl.searchParams.delete('session_id');
  currentUrl.searchParams.delete(TREE_NEXT_STRIPE_RETURN_FLOW_QUERY_KEY);
  currentUrl.searchParams.delete(TREE_NEXT_STRIPE_RETURN_TARGET_QUERY_KEY);
  return `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`;
}

function buildTreeNextStripeReturnPath(flow) {
  const flowKey = normalizeCredentialValue(flow);
  const returnUrl = new URL('/stripe-checkout-return.html', window.location.origin);
  const targetPath = resolveTreeNextStripeReturnTargetPath();
  if (flowKey) {
    returnUrl.searchParams.set(TREE_NEXT_STRIPE_RETURN_FLOW_QUERY_KEY, flowKey);
  }
  if (targetPath) {
    returnUrl.searchParams.set(TREE_NEXT_STRIPE_RETURN_TARGET_QUERY_KEY, targetPath);
  }

  return `${returnUrl.pathname}${returnUrl.search}${returnUrl.hash}`;
}

function clearTreeNextStripeReturnQueryParameters() {
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.delete('checkout');
  currentUrl.searchParams.delete('session_id');
  currentUrl.searchParams.delete(TREE_NEXT_STRIPE_RETURN_FLOW_QUERY_KEY);
  currentUrl.searchParams.delete(TREE_NEXT_STRIPE_RETURN_TARGET_QUERY_KEY);
  const nextPath = `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`;
  window.history.replaceState(window.history.state || {}, '', nextPath);
}

function writeCookieValue(key, value) {
  try {
    document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}; path=/; SameSite=Lax`;
    return true;
  } catch {
    return false;
  }
}

function persistSessionSnapshot(storageKey, cookieKey, sessionValue) {
  if (!storageKey || !cookieKey || !sessionValue || typeof sessionValue !== 'object') {
    return false;
  }
  const serializedSession = JSON.stringify(sessionValue);
  const wroteLocal = safeStorageSet(window.localStorage, storageKey, serializedSession);
  const wroteSession = safeStorageSet(window.sessionStorage, storageKey, serializedSession);
  const wroteCookie = writeCookieValue(cookieKey, serializedSession);
  return wroteLocal || wroteSession || wroteCookie;
}

function persistCurrentSourceSessionSnapshot(sessionValue = state.session) {
  if (!sessionValue || typeof sessionValue !== 'object') {
    return false;
  }
  const storageKey = state.source === 'admin'
    ? ADMIN_AUTH_STORAGE_KEY
    : MEMBER_AUTH_STORAGE_KEY;
  const cookieKey = state.source === 'admin'
    ? ADMIN_AUTH_COOKIE_KEY
    : MEMBER_AUTH_COOKIE_KEY;
  return persistSessionSnapshot(storageKey, cookieKey, sessionValue);
}

async function refreshAuthenticatedMemberSessionSnapshot(options = {}) {
  if (state.source !== 'member') {
    return {
      ok: false,
      reason: 'non-member-source',
    };
  }

  const currentSession = state.session && typeof state.session === 'object' ? state.session : null;
  const authToken = safeText(currentSession?.authToken);
  if (!authToken) {
    return {
      ok: false,
      reason: 'missing-auth-token',
    };
  }

  try {
    const response = await fetch(MEMBER_AUTH_SESSION_API, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      cache: 'no-store',
    });
    if (!response.ok) {
      return {
        ok: false,
        reason: `http-${response.status}`,
      };
    }

    const payload = await response.json().catch(() => ({}));
    const refreshedUser = payload?.user && typeof payload.user === 'object'
      ? payload.user
      : null;
    if (!refreshedUser) {
      return {
        ok: false,
        reason: 'missing-user',
      };
    }

    const nextSession = {
      ...(currentSession && typeof currentSession === 'object' ? currentSession : {}),
      ...refreshedUser,
      authToken,
      authTokenExpiresAt: safeText(currentSession?.authTokenExpiresAt),
    };
    state.session = nextSession;
    persistCurrentSourceSessionSnapshot(nextSession);
    if (options?.skipAccountOverviewReset !== true) {
      resetAccountOverviewRemoteSnapshot();
      resetRankAdvancementSnapshot();
    }
    return {
      ok: true,
      session: nextSession,
      checkedAt: safeText(payload?.checkedAt),
    };
  } catch {
    return {
      ok: false,
      reason: 'network-fallback',
    };
  }
}

function applyAccountUpgradeUserToLocalState(userInput = null) {
  const upgradedUser = userInput && typeof userInput === 'object' ? userInput : null;
  if (!upgradedUser) {
    return;
  }

  const currentSession = state.session && typeof state.session === 'object' ? state.session : {};
  const nextSession = {
    ...currentSession,
    ...upgradedUser,
    authToken: safeText(currentSession.authToken),
    authTokenExpiresAt: safeText(currentSession.authTokenExpiresAt),
  };
  state.session = nextSession;
  persistCurrentSourceSessionSnapshot(nextSession);

  if (!Array.isArray(state.nodes) || !state.nodes.length) {
    return;
  }

  const upgradedUsername = normalizeCredentialValue(upgradedUser.username);
  const upgradedEmail = normalizeCredentialValue(upgradedUser.email);
  let didMutateNodes = false;
  state.nodes = state.nodes.map((node) => {
    const safeNode = node && typeof node === 'object' ? node : null;
    if (!safeNode) {
      return node;
    }
    const nodeUsername = normalizeCredentialValue(safeNode.username || safeNode.memberCode);
    const nodeEmail = normalizeCredentialValue(safeNode.email);
    const matchesIdentity = (
      (upgradedUsername && nodeUsername && upgradedUsername === nodeUsername)
      || (upgradedEmail && nodeEmail && upgradedEmail === nodeEmail)
    );
    const matchesMemberRootNode = safeText(safeNode.id) === 'root' && state.source === 'member';
    if (!matchesIdentity && !matchesMemberRootNode) {
      return node;
    }

    didMutateNodes = true;
    return {
      ...safeNode,
      rank: safeText(upgradedUser.accountRank || upgradedUser.rank || safeNode.rank),
      accountRank: safeText(upgradedUser.accountRank || upgradedUser.rank || safeNode.accountRank),
      enrollmentPackage: safeText(upgradedUser.enrollmentPackage || safeNode.enrollmentPackage),
      enrollmentPackageLabel: safeText(upgradedUser.enrollmentPackageLabel || safeNode.enrollmentPackageLabel),
      packageBv: Math.max(0, Math.round(safeNumber(
        upgradedUser.enrollmentPackageBv,
        safeNode.packageBv,
      ))),
      starterPersonalPv: Math.max(0, Math.round(safeNumber(
        upgradedUser.starterPersonalPv,
        safeNode.starterPersonalPv,
      ))),
      currentPersonalPvBv: Math.max(0, Math.round(safeNumber(
        upgradedUser.currentPersonalPvBv,
        safeNode.currentPersonalPvBv,
      ))),
      accountStatus: safeText(upgradedUser.accountStatus || safeNode.accountStatus || safeNode.status),
      status: safeText(upgradedUser.accountStatus || safeNode.status || safeNode.accountStatus),
      activityActiveUntilAt: safeText(upgradedUser.activityActiveUntilAt || safeNode.activityActiveUntilAt),
      lastProductPurchaseAt: safeText(upgradedUser.lastProductPurchaseAt || safeNode.lastProductPurchaseAt),
      lastPurchaseAt: safeText(upgradedUser.lastPurchaseAt || safeNode.lastPurchaseAt),
      lastAccountUpgradeAt: safeText(upgradedUser.lastAccountUpgradeAt || safeNode.lastAccountUpgradeAt),
      lastAccountUpgradeFromPackage: safeText(
        upgradedUser.lastAccountUpgradeFromPackage || safeNode.lastAccountUpgradeFromPackage,
      ),
      lastAccountUpgradeToPackage: safeText(
        upgradedUser.lastAccountUpgradeToPackage || safeNode.lastAccountUpgradeToPackage,
      ),
      lastAccountUpgradePvGain: Math.max(0, Math.round(safeNumber(
        upgradedUser.lastAccountUpgradePvGain,
        safeNode.lastAccountUpgradePvGain,
      ))),
    };
  });

  if (didMutateNodes) {
    state.adapter.setNodes(state.nodes);
    rebuildNodeChildLegIndex();
    updateTreeNextLiveSnapshotHash(state.nodes);
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
    infinityBuilderTierSortDirection: 'asc',
    legacyLeadershipTierSortDirection: 'asc',
    tierSortDirectionsUpdatedAt: '',
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
    infinityBuilderTierSortDirection: normalizeInfinityBuilderTierSortDirection(
      payload?.infinityBuilderTierSortDirection,
    ),
    legacyLeadershipTierSortDirection: normalizeInfinityBuilderTierSortDirection(
      payload?.legacyLeadershipTierSortDirection,
    ),
    tierSortDirectionsUpdatedAt: safeText(payload?.tierSortDirectionsUpdatedAt),
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

function canSyncInfinityBuilderTierSortDirectionsToServer() {
  return state.source === 'member' && Boolean(safeText(state.session?.authToken));
}

function resolveInfinityBuilderTierSortDirectionsPayloadFromState() {
  return {
    infinityBuilderTierSortDirection: resolveInfinityBuilderTierSortDirectionForMode(
      INFINITY_BUILDER_PANEL_MODE_INFINITY,
    ),
    legacyLeadershipTierSortDirection: resolveInfinityBuilderTierSortDirectionForMode(
      INFINITY_BUILDER_PANEL_MODE_LEGACY_LEADERSHIP,
    ),
  };
}

async function fetchMemberBinaryTreeTierSortDirections(memberSession = state.session) {
  const authToken = safeText(memberSession?.authToken);
  if (!authToken) {
    return {
      success: false,
      status: 401,
      reason: 'missing-auth-token',
    };
  }

  try {
    const response = await fetch(MEMBER_BINARY_TREE_TIER_SORT_DIRECTIONS_API, {
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
      infinityBuilderTierSortDirection: normalizeInfinityBuilderTierSortDirection(
        payload?.infinityBuilderTierSortDirection,
      ),
      legacyLeadershipTierSortDirection: normalizeInfinityBuilderTierSortDirection(
        payload?.legacyLeadershipTierSortDirection,
      ),
      tierSortDirectionsUpdatedAt: safeText(payload?.tierSortDirectionsUpdatedAt),
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

async function flushInfinityBuilderTierSortDirectionsServerSync() {
  if (!canSyncInfinityBuilderTierSortDirectionsToServer()) {
    return;
  }

  if (infinityBuilderTierSortDirectionsSyncInFlight) {
    infinityBuilderTierSortDirectionsSyncQueued = true;
    return;
  }

  const authToken = safeText(state.session?.authToken);
  if (!authToken) {
    return;
  }

  const currentDirections = resolveInfinityBuilderTierSortDirectionsPayloadFromState();
  const currentSyncKey = resolveInfinityBuilderTierSortDirectionsSyncKey();
  if (currentSyncKey === infinityBuilderTierSortDirectionsLastSyncedKey) {
    infinityBuilderTierSortDirectionsLocalDirty = false;
    return;
  }

  infinityBuilderTierSortDirectionsSyncInFlight = true;
  try {
    const response = await fetch(MEMBER_BINARY_TREE_TIER_SORT_DIRECTIONS_API, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(currentDirections),
      cache: 'no-store',
    });

    if (!response.ok) {
      return;
    }

    const payload = await response.json().catch(() => ({}));
    const serverDirections = {
      infinityBuilderTierSortDirection: normalizeInfinityBuilderTierSortDirection(
        payload?.infinityBuilderTierSortDirection,
      ),
      legacyLeadershipTierSortDirection: normalizeInfinityBuilderTierSortDirection(
        payload?.legacyLeadershipTierSortDirection,
      ),
      tierSortDirectionsUpdatedAt: safeText(payload?.tierSortDirectionsUpdatedAt),
    };
    applyInfinityBuilderTierSortDirections(serverDirections, {
      syncServer: false,
    });
    infinityBuilderTierSortDirectionsLocalDirty = false;
    infinityBuilderTierSortDirectionsLastSyncedKey = resolveInfinityBuilderTierSortDirectionsSyncKey();
    infinityBuilderTierSortDirectionsUpdatedAt = safeText(
      payload?.tierSortDirectionsUpdatedAt || infinityBuilderTierSortDirectionsUpdatedAt,
    );
    if (state.launchState && typeof state.launchState === 'object') {
      state.launchState.infinityBuilderTierSortDirection = resolveInfinityBuilderTierSortDirectionForMode(
        INFINITY_BUILDER_PANEL_MODE_INFINITY,
      );
      state.launchState.legacyLeadershipTierSortDirection = resolveInfinityBuilderTierSortDirectionForMode(
        INFINITY_BUILDER_PANEL_MODE_LEGACY_LEADERSHIP,
      );
      state.launchState.tierSortDirectionsUpdatedAt = infinityBuilderTierSortDirectionsUpdatedAt;
    }
  } catch {
    // Ignore network errors; the next interaction can retry sync.
  } finally {
    infinityBuilderTierSortDirectionsSyncInFlight = false;
    if (infinityBuilderTierSortDirectionsSyncQueued) {
      infinityBuilderTierSortDirectionsSyncQueued = false;
      void flushInfinityBuilderTierSortDirectionsServerSync();
    }
  }
}

function requestInfinityBuilderTierSortDirectionsServerSync() {
  if (!canSyncInfinityBuilderTierSortDirectionsToServer()) {
    return;
  }
  void flushInfinityBuilderTierSortDirectionsServerSync();
}

async function syncInfinityBuilderTierSortDirectionsFromServer(reason = 'manual') {
  if (state.source !== 'member') {
    return { success: false, skipped: true, reason: 'non-member-source' };
  }
  if (!canSyncInfinityBuilderTierSortDirectionsToServer()) {
    return { success: false, skipped: true, reason: 'missing-auth-token' };
  }
  if (infinityBuilderTierSortDirectionsLocalDirty) {
    requestInfinityBuilderTierSortDirectionsServerSync();
    return { success: false, skipped: true, reason: 'local-sync-pending' };
  }
  if (infinityBuilderTierSortDirectionsSyncInFlight) {
    return { success: false, skipped: true, reason: 'local-sync-pending' };
  }

  const remoteState = await fetchMemberBinaryTreeTierSortDirections(state.session);
  if (!remoteState.success) {
    return {
      success: false,
      skipped: false,
      reason: remoteState.reason || 'remote-fetch-failed',
    };
  }

  applyInfinityBuilderTierSortDirections({
    infinityBuilderTierSortDirection: remoteState.infinityBuilderTierSortDirection,
    legacyLeadershipTierSortDirection: remoteState.legacyLeadershipTierSortDirection,
    tierSortDirectionsUpdatedAt: remoteState.tierSortDirectionsUpdatedAt,
  }, {
    syncServer: false,
  });
  infinityBuilderTierSortDirectionsLastSyncedKey = resolveInfinityBuilderTierSortDirectionsSyncKey();
  infinityBuilderTierSortDirectionsLocalDirty = false;
  infinityBuilderTierSortDirectionsUpdatedAt = safeText(
    remoteState.tierSortDirectionsUpdatedAt || infinityBuilderTierSortDirectionsUpdatedAt,
  );
  if (state.launchState && typeof state.launchState === 'object') {
    state.launchState.infinityBuilderTierSortDirection = resolveInfinityBuilderTierSortDirectionForMode(
      INFINITY_BUILDER_PANEL_MODE_INFINITY,
    );
    state.launchState.legacyLeadershipTierSortDirection = resolveInfinityBuilderTierSortDirectionForMode(
      INFINITY_BUILDER_PANEL_MODE_LEGACY_LEADERSHIP,
    );
    state.launchState.tierSortDirectionsUpdatedAt = infinityBuilderTierSortDirectionsUpdatedAt;
  }

  return {
    success: true,
    skipped: false,
    reason,
  };
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

function resolveInitialPanelKeyFromQuery() {
  const params = new URLSearchParams(window.location.search || '');
  const panelKey = normalizeCredentialValue(safeText(params.get('panel') || params.get('openPanel')));
  if (panelKey === 'account-overview' || panelKey === 'accountoverview') {
    return 'account-overview';
  }
  if (panelKey === 'infinity-builder' || panelKey === 'infinitybuilder') {
    return 'infinity-builder';
  }
  if (
    panelKey === 'legacy-leadership'
    || panelKey === 'legacyleadership'
    || panelKey === 'legacy-builder'
    || panelKey === 'legacybuilder'
  ) {
    return 'legacy-leadership';
  }
  if (panelKey === 'rank-advancement' || panelKey === 'rankadvancement') {
    return 'rank-advancement';
  }
  if (panelKey === 'preferred-accounts' || panelKey === 'preferredaccounts') {
    return 'preferred-accounts';
  }
  if (panelKey === 'my-store' || panelKey === 'mystore') {
    return 'my-store';
  }
  return '';
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
  applyInfinityBuilderTierSortDirectionsFromLaunchState(state.launchState, {
    syncServer: false,
    markSynced: true,
  });
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
  const explicitCurrentPersonalPvBv = safeNumber(
    member?.currentPersonalPvBv
    ?? member?.current_personal_pv_bv
    ?? member?.monthlyPersonalBv
    ?? member?.monthly_personal_bv
    ?? member?.currentWeekPersonalPv
    ?? member?.current_week_personal_pv,
    Number.NaN,
  );
  const derivedCurrentPersonalPvBv = Math.max(0, starterPersonalPv - baselineStarterPersonalPv);
  const currentPersonalPvBv = Number.isFinite(explicitCurrentPersonalPvBv)
    ? Math.max(0, Math.floor(explicitCurrentPersonalPvBv))
    : derivedCurrentPersonalPvBv;
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
  const isAdminSource = state.source === 'admin';
  const sessionDisplayName = safeText(resolveSessionDisplayName());
  const sourceDisplayName = safeText(source?.name);
  const sourceUsername = safeText(source?.username || source?.memberCode).replace(/^@+/, '');
  const sessionUsername = safeText(
    session?.username
    || session?.memberUsername
    || session?.email
    || '',
  ).replace(/^@+/, '');
  const displayName = isAdminSource
    ? ADMIN_ROOT_DISPLAY_NAME
    : (sourceDisplayName || sessionDisplayName || 'Member');
  const username = isAdminSource
    ? ADMIN_ROOT_USERNAME
    : (sourceUsername || sessionUsername || 'member');
  const rank = isAdminSource
    ? ADMIN_ROOT_DISPLAY_NAME
    : (safeText(
      source?.rank
      || source?.accountRank
      || source?.account_rank
      || session?.accountRank
      || session?.account_rank
      || session?.rank
      || 'Legacy',
    ) || 'Legacy');
  const accountStatus = safeText(source?.accountStatus || source?.status || 'Active') || 'Active';
  const fallbackTitle = `${rank} Builder`;
  const sourceTitle = resolveNodePrimaryTitleLabel(source);
  const sessionTitle = resolveNodePrimaryTitleLabel(session);
  const sessionTitleIsFallback = isTreeNextRankBuilderFallbackTitle(sessionTitle, rank);
  const sourceTitleIsFallback = isTreeNextRankBuilderFallbackTitle(sourceTitle, rank);
  let title = fallbackTitle;
  if (isAdminSource) {
    title = ADMIN_ROOT_TITLE;
  } else if (state.source === 'member') {
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
  const badges = isAdminSource
    ? [ADMIN_ROOT_DISPLAY_NAME]
    : (sourceBadges.length ? sourceBadges : [rank]);
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
    userId: safeText(
      source?.userId
      || source?.memberUserId
      || session?.id
      || session?.userId
      || session?.user_id
      || '',
    ),
    email: safeText(source?.email || session?.email || ''),
    memberCode: username,
    name: displayName,
    username,
    role: isAdminSource
      ? ADMIN_ROOT_ROLE
      : (safeText(source?.role || 'Network Head') || 'Network Head'),
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
    packagePrice: Math.max(0, safeNumber(source?.packagePrice ?? session?.packagePrice, 0)),
    fastTrackBonusAmount: Math.max(0, safeNumber(
      source?.fastTrackBonusAmount
      ?? source?.fast_track_bonus_amount
      ?? session?.fastTrackBonusAmount
      ?? session?.fast_track_bonus_amount,
      0,
    )),
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
  if (state.source === 'admin') {
    return LIVE_TREE_GLOBAL_ROOT_ID;
  }

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

  const registerLookup = (rawValue, nodeId, options = {}) => {
    const preserveExisting = options?.preserveExisting === true;
    const lookupKey = normalizeTreeNextLiveLookupKey(rawValue);
    if (!lookupKey || !nodeId) {
      return;
    }
    if (preserveExisting && lookupToNodeId.has(lookupKey)) {
      return;
    }
    lookupToNodeId.set(lookupKey, nodeId);
  };

  const globalRootNode = {
    id: LIVE_TREE_GLOBAL_ROOT_ID,
    parent: '',
    side: '',
    userId: ADMIN_ROOT_USERNAME,
    email: safeText(state.session?.email || ''),
    memberCode: ADMIN_ROOT_USERNAME,
    name: ADMIN_ROOT_DISPLAY_NAME,
    username: ADMIN_ROOT_USERNAME,
    role: ADMIN_ROOT_ROLE,
    status: 'active',
    accountStatus: 'Active',
    rank: ADMIN_ROOT_DISPLAY_NAME,
    accountRank: ADMIN_ROOT_DISPLAY_NAME,
    title: ADMIN_ROOT_TITLE,
    badges: [ADMIN_ROOT_DISPLAY_NAME],
    volume: 0,
    starterPersonalPv: 0,
    serverCutoffBaselineStarterPersonalPv: 0,
    currentPersonalPvBv: 0,
    monthlyPersonalBv: 0,
    packagePrice: 0,
    fastTrackBonusAmount: 0,
    sponsorId: '',
    globalSponsorId: '',
    sponsorUsername: '',
    sponsorLeg: '',
    isSpillover: false,
  };
  nodeById.set(LIVE_TREE_GLOBAL_ROOT_ID, globalRootNode);
  registerLookup(LIVE_TREE_GLOBAL_ROOT_ID, LIVE_TREE_GLOBAL_ROOT_ID);
  registerLookup(ADMIN_ROOT_USERNAME, LIVE_TREE_GLOBAL_ROOT_ID);
  registerLookup('company-root', LIVE_TREE_GLOBAL_ROOT_ID);
  registerLookup('admin', LIVE_TREE_GLOBAL_ROOT_ID);
  registerLookup('administrator', LIVE_TREE_GLOBAL_ROOT_ID);

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
      userId: safeText(member?.userId || member?.id || ''),
      email: safeText(member?.email || ''),
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
      packagePrice: Math.max(0, safeNumber(member?.packagePrice, 0)),
      packageBv: personalVolumeSnapshot.packageBv,
      fastTrackTier: normalizeCredentialValue(member?.fastTrackTier),
      fastTrackBonusAmount: Math.max(0, safeNumber(
        member?.fastTrackBonusAmount ?? member?.fast_track_bonus_amount,
        0,
      )),
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
    registerLookup(member?.memberCode, nodeId, { preserveExisting: true });
    registerLookup(member?.fullName, nodeId, { preserveExisting: true });
    registerLookup(member?.name, nodeId, { preserveExisting: true });
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

  // Track sponsor-graph ownership (direct + downline by sponsor), independent from placement subtree.
  const sponsoredChildrenBySponsorId = new Map();
  for (const [candidateNodeId, candidateNodeInput] of nodeById.entries()) {
    const candidateNode = candidateNodeInput && typeof candidateNodeInput === 'object'
      ? candidateNodeInput
      : null;
    if (!candidateNode) {
      continue;
    }
    const candidateSponsorId = safeText(candidateNode?.sponsorId);
    if (!candidateSponsorId || candidateSponsorId === candidateNodeId || !nodeById.has(candidateSponsorId)) {
      continue;
    }
    if (!sponsoredChildrenBySponsorId.has(candidateSponsorId)) {
      sponsoredChildrenBySponsorId.set(candidateSponsorId, []);
    }
    sponsoredChildrenBySponsorId.get(candidateSponsorId).push(candidateNodeId);
  }

  const viewerSponsoredOrganizationNodeIds = new Set();
  const sponsorQueue = [viewerNodeId];
  while (sponsorQueue.length > 0) {
    const nextSponsorId = safeText(sponsorQueue.shift());
    if (!nextSponsorId) {
      continue;
    }
    const sponsoredChildIds = sponsoredChildrenBySponsorId.get(nextSponsorId) || [];
    for (const sponsoredChildIdInput of sponsoredChildIds) {
      const sponsoredChildId = safeText(sponsoredChildIdInput);
      if (!sponsoredChildId || viewerSponsoredOrganizationNodeIds.has(sponsoredChildId) || !nodeById.has(sponsoredChildId)) {
        continue;
      }
      viewerSponsoredOrganizationNodeIds.add(sponsoredChildId);
      sponsorQueue.push(sponsoredChildId);
    }
  }

  const sourceRootNode = nodeById.get(viewerNodeId) || nodeById.get(LIVE_TREE_GLOBAL_ROOT_ID) || null;
  const scopedNodeById = new Map();
  scopedNodeById.set('root', createTreeNextLiveScopedRootNode(sourceRootNode));
  const externalSpilloverSourceNodeIds = new Set();

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
    const sourceWasSpillover = Boolean(
      sourceNode?.isSpillover
      || sourceNode?.is_spillover
      || sourceNode?.placementLeg === 'spillover'
      || sourceNode?.placement_leg === 'spillover'
      || sourceNode?.sponsorLeg === 'spillover'
      || sourceNode?.sponsor_leg === 'spillover',
    );
    const isViewerOwnedSponsorBranchNode = viewerSponsoredOrganizationNodeIds.has(includedNodeId);
    let mappedSponsorId = '';
    if (sourceSponsorId === viewerNodeId) {
      mappedSponsorId = 'root';
    } else if (sourceSponsorId && includedNodeIds.has(sourceSponsorId)) {
      mappedSponsorId = sourceSponsorId;
    } else if (sourceWasSpillover) {
      mappedSponsorId = '';
    } else {
      mappedSponsorId = mappedParentId || 'root';
    }

    const scopedNode = {
      ...sourceNode,
      parent: mappedParentId,
      placementParentId: mappedParentId,
      placementSide: normalizeBinarySide(sourceNode?.side || sourceNode?.placementSide),
      sponsorId: mappedSponsorId,
      globalSponsorId: mappedSponsorId,
      sourceSponsorId,
      isViewerOwnedSponsorBranchNode,
    };
    scopedNode.sponsorLeg = scopedNode.sponsorId === scopedNode.parent
      ? normalizeBinarySide(scopedNode.side)
      : '';
    scopedNode.isSpillover = sourceWasSpillover || Boolean(
      scopedNode.sponsorId
      && scopedNode.parent
      && scopedNode.sponsorId !== scopedNode.parent,
    );
    if (
      resolveTreeNextSpilloverOutsideScopedOrganizationSource(sourceNode, viewerNodeId, includedNodeIds)
      && !isViewerOwnedSponsorBranchNode
    ) {
      externalSpilloverSourceNodeIds.add(includedNodeId);
    }
    scopedNodeById.set(includedNodeId, scopedNode);
  }

  const spilloverRootNodeIds = Array.from(externalSpilloverSourceNodeIds)
    .filter((nodeId) => {
      const node = scopedNodeById.get(nodeId);
      if (!node) {
        return false;
      }
      const parentId = safeText(node?.placementParentId || node?.parent || '');
      return !parentId || !externalSpilloverSourceNodeIds.has(parentId);
    });
  const anonymizedNodeIdSet = new Set();
  const anonymizedQueue = spilloverRootNodeIds.slice();
  while (anonymizedQueue.length > 0) {
    const nextNodeId = safeText(anonymizedQueue.shift());
    if (!nextNodeId || anonymizedNodeIdSet.has(nextNodeId) || !scopedNodeById.has(nextNodeId)) {
      continue;
    }
    const nextNode = scopedNodeById.get(nextNodeId);
    if (!Boolean(nextNode?.isViewerOwnedSponsorBranchNode)) {
      anonymizedNodeIdSet.add(nextNodeId);
    }
    const leftChildId = safeText(nextNode?.leftChildId);
    const rightChildId = safeText(nextNode?.rightChildId);
    if (leftChildId && scopedNodeById.has(leftChildId)) {
      anonymizedQueue.push(leftChildId);
    }
    if (rightChildId && scopedNodeById.has(rightChildId)) {
      anonymizedQueue.push(rightChildId);
    }
  }

  const anonymizedNodeIds = Array.from(anonymizedNodeIdSet)
    .sort((leftNodeId, rightNodeId) => {
      const leftAddedAt = resolveInfinityBuilderNodeAddedAtMs(scopedNodeById.get(leftNodeId));
      const rightAddedAt = resolveInfinityBuilderNodeAddedAtMs(scopedNodeById.get(rightNodeId));
      if (leftAddedAt !== rightAddedAt) {
        return leftAddedAt - rightAddedAt;
      }
      return leftNodeId.localeCompare(rightNodeId);
    });
  let spilloverDirectCount = 0;
  let spilloverNetworkCount = 0;
  for (const anonymizedNodeId of anonymizedNodeIds) {
    const anonymizedNode = scopedNodeById.get(anonymizedNodeId);
    if (!anonymizedNode) {
      continue;
    }
    const isDirectPlacement = safeText(anonymizedNode?.placementParentId || anonymizedNode?.parent || '') === 'root';
    if (isDirectPlacement) {
      spilloverDirectCount += 1;
      anonymizedNode.name = `Spillover Direct ${spilloverDirectCount}`;
      anonymizedNode.memberCode = `spillover-${String(spilloverDirectCount).padStart(3, '0')}`;
    } else {
      spilloverNetworkCount += 1;
      anonymizedNode.name = `Spillover Network ${spilloverNetworkCount}`;
      anonymizedNode.memberCode = `spillover-network-${String(spilloverNetworkCount).padStart(3, '0')}`;
    }
    anonymizedNode.countryFlag = '';
  }

  const normalizedScopedNodes = rebuildTreeNextLiveChildReferences(Array.from(scopedNodeById.values()));
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
    Math.floor(safeNumber(
      safeNode.currentPersonalPvBv
      ?? safeNode.current_personal_pv_bv
      ?? safeNode.monthlyPersonalBv
      ?? safeNode.monthly_personal_bv,
      0,
    )),
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
  const overviewContext = resolveAccountOverviewPanelContext();
  const homeNode = overviewContext?.homeNode || resolveNodeById('root');
  maybeRefreshAccountOverviewRemoteSnapshot(homeNode, {
    scope: overviewContext?.scope,
    preferHomeNodeIdentity: overviewContext?.preferHomeNodeIdentity,
  });
  maybeRefreshRankAdvancementSnapshot({ homeNode });

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
    void processTreeNextStripeReturnSignalFromStorage({
      preserveCurrentStep: true,
      consumeSignal: true,
    });
    void syncInfinityBuilderTierSortDirectionsFromServer('visibility');
    void syncTreeNextLiveNodes({ force: true, silent: true, reason: 'visibility' });
  }
  scheduleTreeNextLiveSync(resolveTreeNextLiveSyncIntervalMs());
}

function onTreeNextLiveSyncWindowFocus() {
  if (!state.liveSync?.started) {
    return;
  }
  void processTreeNextStripeReturnSignalFromStorage({
    preserveCurrentStep: true,
    consumeSignal: true,
  });
  void syncInfinityBuilderTierSortDirectionsFromServer('focus');
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
  const allowGraySourcePalette = options?.allowGraySourcePalette === true;
  if (!ignoreSourcePalette) {
    const sourcePalette = resolveAvatarPaletteFromRecord(sourceNode);
    if (sourcePalette && (allowGraySourcePalette || !isGrayAvatarPalette(sourcePalette))) {
      return sourcePalette;
    }
    const sourceColorTriplet = resolveAvatarColorTripletFromRecord(sourceNode);
    if (sourceColorTriplet && (allowGraySourcePalette || !isGrayRgbTriplet(sourceColorTriplet))) {
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
  const identity = resolveTreeNextNodePublicIdentity(nodeRecord, { fallbackName: safeNodeId || 'Member' });

  const avatarRender = drawResolvedAvatarCircle(cx, cy, iconRadius, safeNodeId, {
    node: nodeRecord,
    variant: 'auto',
    disablePhoto: identity.isMasked,
    ignoreSourcePalette: identity.isMasked,
    alpha: 0.98,
    sheenAlpha: hovered ? 0.22 : 0.18,
  });

  if (!avatarRender.usedPhoto) {
    const displayInitials = safeText(identity.initials || initials || '?');
    drawText(displayInitials, cx, cy + 0.5, {
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
  if (shouldApplyTreeNextNodePrivacyMask(nodeRecord)) {
    return {
      image: resolveNodeAvatarCssGradient(`masked-${safeNodeId || 'member'}`),
      isPhoto: false,
    };
  }
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
    const identity = resolveTreeNextNodePublicIdentity(candidate, { fallbackName: nodeId });
    if (identity.isMasked) {
      const maskedNodeSearchKey = normalizeCredentialValue(nodeId);
      const maskedVisibleKey = normalizeCredentialValue(TREE_NEXT_PRIVACY_ANONYMOUS_LABEL);
      if (!maskedNodeSearchKey.includes(queryLower) && !maskedVisibleKey.includes(queryLower)) {
        continue;
      }
    }
    const name = safeText(identity.name || candidate?.name || nodeId) || nodeId;
    const username = identity.isMasked ? '' : safeText(identity.username || candidate?.username || '');
    const rank = identity.isMasked ? '' : safeText(candidate?.rank);
    const title = identity.isMasked ? '' : safeText(candidate?.title);
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
      subtitleParts.push(identity.isMasked ? 'Spillover node (private)' : `ID: ${nodeId}`);
    }
    ranked.push({
      id: nodeId,
      name,
      initials: safeText(identity.initials || resolveInitials(name)),
      username,
      rank,
      title,
      isMasked: identity.isMasked,
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
    const avatarBackground = entry.isMasked
      ? {
        image: resolveNodeAvatarCssGradient(`masked-${safeText(entry.id) || 'member'}`),
        isPhoto: false,
      }
      : resolveAvatarCssBackgroundForNode(entry.id);
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
    const titleText = entry.isMasked
      ? TREE_NEXT_PRIVACY_ANONYMOUS_LABEL
      : (entry.username
        ? `${truncateText(entry.name, 22)} (@${truncateText(entry.username, 18)})`
        : truncateText(entry.name, 28));
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
  const identity = resolveTreeNextNodePublicIdentity(globalMeta?.node, { fallbackName: safeNodeId });
  const resolvedName = safeText(identity.name || globalMeta?.node?.name);
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
    const memberStatusCardHeight = 124;

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
    const memberStatusCardY = panel.y + panel.height - topPadding - memberStatusCardHeight;
    const detailsCardHeight = Math.max(120, memberStatusCardY - y - gap);
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
      const selectedIdentity = resolveTreeNextNodePublicIdentity(selectedNode, {
        fallbackName: safeText(selectedNode.id || selectedNodeId || 'Member'),
      });
      const shouldMaskSelectedNodeDetails = selectedIdentity.isMasked;
      const displayName = truncateText(
        safeText(selectedIdentity.name || selectedNode.name || selectedNode.id),
        24,
      );
      const usernameHandle = truncateText(
        safeText(
          shouldMaskSelectedNodeDetails
            ? TREE_NEXT_PRIVACY_HIDDEN_LABEL
            : (selectedIdentity.username || selectedNode.username || selectedNode.id),
        ),
        24,
      );
      const usernameLine = shouldMaskSelectedNodeDetails
        ? TREE_NEXT_PRIVACY_HIDDEN_LABEL
        : `@${usernameHandle}`;
      const nodeInitials = safeText(
        selectedIdentity.initials || resolveInitials(safeText(selectedNode.name || selectedNode.id)),
      );
      const selectedAvatarNodeId = safeText(selectedNode.id || selectedNodeId);
      const selectedBaseAvatarVariant = isSessionAvatarNodeId(selectedAvatarNodeId)
        ? 'auto'
        : (selectedAvatarNodeId.toLowerCase() === 'root' ? 'root' : 'auto');
      const isDirectSponsorNode = isNodePersonallyEnrolledBySession(selectedNode);
      const selectedAvatarVariant = isDirectSponsorNode ? 'direct' : selectedBaseAvatarVariant;
      const rankValue = shouldMaskSelectedNodeDetails
        ? '-'
        : (truncateText(safeText(selectedNode.rank || '-'), 16) || '-');
      const isActiveAccount = resolveNodeActivityState(selectedNode);
      const activityDotColor = isActiveAccount ? '#30C655' : '#B5B5B5';
      const selectedAvatarRenderOptions = isActiveAccount
        ? (isDirectSponsorNode
          ? {
            variant: selectedAvatarVariant,
            disablePhoto: true,
            ignoreSourcePalette: true,
          }
          : {
            variant: selectedAvatarVariant,
          })
        : {
          variant: isDirectSponsorNode ? 'directInactive' : 'inactive',
          disablePhoto: true,
          ignoreSourcePalette: true,
        };
      const rankAndTitleIconPaths = shouldMaskSelectedNodeDetails
        ? []
        : resolveNodeDetailRankAndTitleIcons(selectedNode).slice(0, 2);

      const avatarRadius = Math.round(34 + (20 * detailVerticalScale));
      // Keep head space under "Details", but compress aggressively on shorter laptop heights.
      const compactHeaderToAvatarTopGap = 12;
      const preferredHeaderToAvatarTopGap = 64;
      const headerToAvatarTopGap = Math.round(
        compactHeaderToAvatarTopGap
        + ((preferredHeaderToAvatarTopGap - compactHeaderToAvatarTopGap) * detailVerticalScale),
      );
      const avatarCenterY = detailsHeadingY + headerToAvatarTopGap + avatarRadius;
      const nodePhotoUrl = (selectedAvatarRenderOptions.disablePhoto === true || shouldMaskSelectedNodeDetails)
        ? ''
        : resolveNodeAvatarPhotoUrl(selectedNode);
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
          ...selectedAvatarRenderOptions,
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
      drawText(usernameLine, detailCenterX, usernameY, {
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
        { label: 'Total Organizational BV', value: formatExactVolumeValue(volumeMetrics.totalVolume) },
        { label: 'Personal BV', value: formatExactVolumeValue(volumeMetrics.personalVolume) },
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
        const relationIdentity = resolveTreeNextNodePublicIdentity(relationNode, { fallbackName: nodeId || '-' });
        const relationLabelMasked = shouldMaskSelectedNodeDetails || relationIdentity.isMasked;
        const buttonEnabled = Boolean(nodeId) && !relationLabelMasked;
        const customLabel = safeText(entry.label);
        const buttonLabel = relationLabelMasked
          ? (nodeId ? TREE_NEXT_PRIVACY_ANONYMOUS_LABEL : '-')
          : (customLabel || (buttonEnabled
            ? truncateText(safeText(relationIdentity.name || relationNode?.name || relationNode?.id || nodeId), 24)
            : '-'));
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
        const buttonAction = buttonEnabled
          ? (safeText(entry.action) || (nodeId ? `node:focus:${nodeId}` : ''))
          : '';
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

    fillRoundedRect(context, slotX, memberStatusCardY, slotWidth, memberStatusCardHeight, 18, '#FFFFFF');
    strokeRoundedRect(context, slotX + 0.5, memberStatusCardY + 0.5, slotWidth - 1, memberStatusCardHeight - 1, 18, '#E4E7ED');
    const selectedNodeForStatus = selectedNode && typeof selectedNode === 'object'
      ? selectedNode
      : null;
    const defaultNodeForStatus = resolveNodeById(resolvePreferredGlobalHomeNodeId()) || resolveNodeById('root') || null;
    const statusNode = selectedNodeForStatus || defaultNodeForStatus;
    const memberStatusSnapshot = resolveSideNavMemberStatusSnapshot(statusNode);
    const memberStatusLabelX = slotX + 14;
    const memberStatusValueX = slotX + slotWidth - 14;

    drawText('Organization Members', memberStatusLabelX, memberStatusCardY + 24, {
      size: 10,
      weight: 600,
      color: '#70798B',
    });
    drawText(formatInteger(memberStatusSnapshot.totalMembers, 0), memberStatusValueX, memberStatusCardY + 24, {
      size: 12,
      weight: 700,
      color: '#2F3645',
      align: 'right',
    });
    line(
      context,
      memberStatusLabelX,
      memberStatusCardY + 32,
      slotX + slotWidth - 14,
      memberStatusCardY + 32,
      '#E1E4EA',
      1,
    );

    drawText('Active Members', memberStatusLabelX, memberStatusCardY + 51, {
      size: 10,
      weight: 600,
      color: '#70798B',
    });
    drawText(
      `L ${formatInteger(memberStatusSnapshot.leftActiveMembers, 0)} | R ${formatInteger(memberStatusSnapshot.rightActiveMembers, 0)}`,
      memberStatusValueX,
      memberStatusCardY + 51,
      {
        size: 11,
        weight: 600,
        color: '#3E4658',
        align: 'right',
      },
    );

    drawText('Direct Sponsors', memberStatusLabelX, memberStatusCardY + 74, {
      size: 10,
      weight: 600,
      color: '#70798B',
    });
    drawText(
      `L ${formatInteger(memberStatusSnapshot.leftDirectSponsors, 0)} | R ${formatInteger(memberStatusSnapshot.rightDirectSponsors, 0)}`,
      memberStatusValueX,
      memberStatusCardY + 74,
      {
        size: 11,
        weight: 600,
        color: '#3E4658',
        align: 'right',
      },
    );

    drawText(
      `Total Direct Sponsors: ${formatInteger(memberStatusSnapshot.totalDirectSponsors, 0)}`,
      memberStatusLabelX,
      memberStatusCardY + 97,
      {
        size: 10,
        weight: 600,
        color: '#70798B',
        maxWidth: slotWidth - 28,
      },
    );
    drawText(
      `Total Active Members: ${formatInteger(memberStatusSnapshot.totalActiveMembers, 0)}`,
      memberStatusValueX,
      memberStatusCardY + 97,
      {
        size: 10,
        weight: 600,
        color: '#70798B',
        align: 'right',
        maxWidth: slotWidth - 28,
      },
    );

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
      iconGlyph: String.fromCodePoint(0xE8D0),
      iconLigature: 'workspace_premium',
      action: 'panel:rank-advancement:toggle',
    },
    {
      id: 'profile-left-dock-preferred-accounts',
      iconGlyph: String.fromCodePoint(0xE7FD),
      iconLigature: 'person_add',
      action: 'panel:preferred-accounts:toggle',
    },
    {
      id: 'profile-left-dock-legacy-trinary',
      iconGlyph: 'T',
      iconLigature: 'hub',
      action: 'legacy-tier:view:toggle',
    },
  ];
  const profileLeftDockButtonSize = 40;
  const profileLeftDockGap = 8;
  let profileLeftDockCursorRight = profileX - profileLeftDockGap;
  for (let index = 0; index < profileLeftDockButtons.length; index += 1) {
    const button = profileLeftDockButtons[index];
    const hovered = state.hoveredButtonId === button.id;
    const isAccountOverviewToggle = button.action === 'panel:account-overview:toggle';
    const isRankAdvancementToggle = button.action === 'panel:rank-advancement:toggle';
    const isPreferredAccountsToggle = button.action === 'panel:preferred-accounts:toggle';
    const isLegacyTierViewButton = button.action === 'legacy-tier:view:toggle';
    const active = (
      (isAccountOverviewToggle && Boolean(state.ui?.accountOverviewVisible))
      || (isRankAdvancementToggle && Boolean(state.ui?.rankAdvancementVisible))
      || (isPreferredAccountsToggle && Boolean(state.ui?.preferredAccountsVisible))
      || (isLegacyTierViewButton && isLegacyTierCanvasViewActive())
    );
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
    const isRankAdvancementToggle = button.action === 'panel:rank-advancement:toggle';
    const isPreferredAccountsToggle = button.action === 'panel:preferred-accounts:toggle';
    const active = (
      (isAccountOverviewToggle && Boolean(state.ui?.accountOverviewVisible))
      || (isRankAdvancementToggle && Boolean(state.ui?.rankAdvancementVisible))
      || (isPreferredAccountsToggle && Boolean(state.ui?.preferredAccountsVisible))
    );
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
  const nodeIdentity = resolveTreeNextNodePublicIdentity(nodeRecord, {
    fallbackName: safeText(node?.id || sourceNode?.id || 'Member'),
  });
  const shouldMaskNodeIdentity = nodeIdentity.isMasked;
  const isLegacyTierEmptySlot = Boolean(
    node?.isLegacyTierEmptySlot
    || sourceNode?.isLegacyTierEmptySlot
    || sourceNode?.isLegacyTierViewPlaceholder,
  );
  const avatarSeedId = safeText(
    node?.avatarSeedId
    || sourceNode?.avatarSeedId
    || sourceNode?.avatarSeed
    || nodeId,
  ) || nodeId;
  const isActiveAccount = isLegacyTierEmptySlot ? false : resolveNodeActivityState(nodeRecord);
  const isPersonallyEnrolledNode = isLegacyTierEmptySlot ? false : isNodePersonallyEnrolledBySession(nodeRecord);
  const baseNodeVariant = isSessionAvatarNodeId(avatarSeedId)
    ? 'auto'
    : (avatarSeedId.toLowerCase() === 'root' ? 'root' : 'auto');
  const nodeVariant = isLegacyTierEmptySlot
    ? 'inactive'
    : (isPersonallyEnrolledNode ? 'direct' : baseNodeVariant);
  const avatarRenderOptions = (isLegacyTierEmptySlot || shouldMaskNodeIdentity)
    ? {
      variant: 'inactive',
      disablePhoto: true,
      ignoreSourcePalette: true,
    }
    : isActiveAccount
    ? (isPersonallyEnrolledNode
      ? {
        variant: nodeVariant,
        disablePhoto: true,
        ignoreSourcePalette: true,
      }
      : {})
    : {
      variant: isPersonallyEnrolledNode ? 'directInactive' : 'inactive',
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

      drawResolvedAvatarCircle(node.x, node.y, innerR, avatarSeedId, {
        node: sourceNode,
        variant: nodeVariant,
        alpha: 0.98,
        sheenAlpha: 0.15,
        ...avatarRenderOptions,
      });
      return;
    }

    drawResolvedAvatarCircle(node.x, node.y, r, avatarSeedId, {
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

  const baseAvatarRender = drawResolvedAvatarCircle(node.x, node.y, innerR, avatarSeedId, {
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
  if (hideDeepLevelLabel || renderedRadius < 9 || usedPhotoAvatar || isLegacyTierEmptySlot) {
    return;
  }

  drawText(safeText(nodeIdentity.initials || resolveInitials(node.node?.name)), node.x, node.y + 0.5, {
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

function resolveUniverseBreadcrumbChipNode(crumbId = '') {
  const safeCrumbId = safeText(crumbId);
  if (!safeCrumbId) {
    return null;
  }
  const globalMeta = state.adapter.resolveNodeMetrics(safeCrumbId, getGlobalUniverseOptions());
  const nodeFromMeta = globalMeta?.node && typeof globalMeta.node === 'object'
    ? globalMeta.node
    : null;
  const nodeFromState = resolveNodeById(safeCrumbId);
  const nodeRecord = nodeFromMeta || nodeFromState || null;
  if (!nodeRecord) {
    return {
      id: safeCrumbId,
      node: { id: safeCrumbId, name: safeCrumbId, username: '' },
      username: '',
      usernameLabel: truncateText(safeCrumbId, 12),
      initials: resolveInitials(safeCrumbId),
    };
  }
  const identity = resolveTreeNextNodePublicIdentity(nodeRecord, { fallbackName: safeCrumbId });
  const usernameRaw = safeText(identity.username || '').replace(/^@+/, '');
  const fallbackName = safeText(identity.name || safeCrumbId);
  const usernameLabel = identity.isMasked
    ? TREE_NEXT_PRIVACY_ANONYMOUS_LABEL
    : (usernameRaw
      ? `@${truncateText(usernameRaw, 14)}`
      : truncateText(fallbackName, 14));
  return {
    id: safeCrumbId,
    node: nodeRecord,
    username: usernameRaw,
    usernameLabel,
    initials: safeText(identity.initials || resolveInitials(fallbackName)),
  };
}

function drawUniverseBreadcrumbNodeChips(startX, startY, maxWidth, containerHeightInput = 0) {
  const historyTrail = resolveUniverseHistoryTrailNodeIds();
  if (!historyTrail.length || maxWidth <= 0) {
    return;
  }

  const avatarRadius = 13;
  const arrowGap = 11;
  const chipColumnMinWidth = 42;
  const chipColumnMaxWidth = 84;
  const labelGap = 5;
  const labelFontSize = 10;
  const contentHeight = (avatarRadius * 2) + labelGap + labelFontSize;
  const containerHeight = Math.max(
    contentHeight,
    Math.floor(safeNumber(containerHeightInput, contentHeight)),
  );
  const contentTopY = startY + Math.floor((containerHeight - contentHeight) * 0.5);
  const circleCenterY = contentTopY + avatarRadius;
  const labelY = contentTopY + (avatarRadius * 2) + labelGap;
  const chipHeight = containerHeight;

  const chips = historyTrail.map((crumbIdInput, index) => {
    const crumbId = safeText(crumbIdInput);
    const crumbNode = resolveUniverseBreadcrumbChipNode(crumbId);
    const usernameLabel = safeText(crumbNode?.usernameLabel || resolveUniverseCrumbLabel(crumbId));
    const columnWidth = clamp(
      Math.round(Math.max((avatarRadius * 2) + 8, (usernameLabel.length * 5.2) + 8)),
      chipColumnMinWidth,
      chipColumnMaxWidth,
    );
    return {
      crumbId,
      crumbNode,
      usernameLabel,
      index,
      active: index === (historyTrail.length - 1),
      columnWidth,
    };
  });

  const computeTotalWidth = (entries) => (
    entries.reduce((sum, item) => sum + item.columnWidth, 0)
    + (Math.max(0, entries.length - 1) * arrowGap)
  );

  let visibleChips = chips.slice();
  while (visibleChips.length > 1 && computeTotalWidth(visibleChips) > maxWidth) {
    visibleChips = visibleChips.slice(1);
  }
  if (!visibleChips.length) {
    return;
  }

  const totalVisibleWidth = computeTotalWidth(visibleChips);
  let cursorX = Math.round(startX + ((maxWidth - totalVisibleWidth) * 0.5));
  cursorX = clamp(cursorX, startX, startX + Math.max(0, maxWidth - totalVisibleWidth));
  const endX = startX + maxWidth;

  for (let localIndex = 0; localIndex < visibleChips.length; localIndex += 1) {
    const chip = visibleChips[localIndex];
    const {
      crumbId,
      crumbNode,
      usernameLabel,
      index,
      active,
      columnWidth,
    } = chip;
    if (cursorX + columnWidth > endX) {
      break;
    }

    const buttonId = `top-universe-crumb-${index}-${crumbId}`;
    const hovered = safeText(state.hoveredButtonId) === buttonId;

    const centerX = cursorX + (columnWidth * 0.5);
    const nodeRecord = crumbNode?.node && typeof crumbNode.node === 'object'
      ? crumbNode.node
      : null;
    const isActiveAccount = resolveNodeActivityState(nodeRecord);
    const isDirectNode = isNodePersonallyEnrolledBySession(nodeRecord);
    const variant = safeText(crumbId).toLowerCase() === 'root'
      ? 'root'
      : (!isActiveAccount
        ? (isDirectNode ? 'directInactive' : 'inactive')
        : (isDirectNode ? 'direct' : 'auto'));
    drawResolvedAvatarCircle(centerX, circleCenterY, avatarRadius, crumbId, {
      node: nodeRecord,
      variant,
      disablePhoto: true,
      ignoreSourcePalette: (!isActiveAccount || isDirectNode),
      alpha: 0.98,
      sheenAlpha: 0.15,
    });
    context.beginPath();
    context.arc(centerX, circleCenterY, avatarRadius, 0, Math.PI * 2);
    context.lineWidth = active ? 1.2 : (hovered ? 1.05 : 0.9);
    context.strokeStyle = active
      ? 'rgba(36, 49, 70, 0.48)'
      : (hovered ? 'rgba(53, 72, 102, 0.35)' : 'rgba(56, 73, 101, 0.18)');
    context.stroke();
    drawText(safeText(crumbNode?.initials || ''), centerX, circleCenterY + 0.5, {
      size: 9,
      weight: 700,
      color: '#FFFFFF',
      align: 'center',
      baseline: 'middle',
      maxWidth: Math.max(10, (avatarRadius * 1.5)),
    });
    drawText(usernameLabel, centerX, labelY, {
      size: labelFontSize,
      weight: active ? 700 : 600,
      color: active ? '#1B2434' : '#303849',
      align: 'center',
      baseline: 'top',
      maxWidth: columnWidth - 6,
    });

    if (!active) {
      registerButton({
        id: buttonId,
        x: cursorX,
        y: startY,
        width: columnWidth,
        height: chipHeight,
        action: `universe:history:goto:${index}`,
      });
    }

    cursorX += columnWidth;
    if (localIndex < visibleChips.length - 1) {
      if (cursorX + arrowGap > endX) {
        break;
      }
      drawText('>', cursorX + (arrowGap * 0.5), circleCenterY, {
        size: 10,
        weight: 600,
        color: '#2E3542',
        align: 'center',
        baseline: 'middle',
      });
      cursorX += arrowGap;
    }
  }
}

function resolveLegacyTierCanvasFrame(layout) {
  if (!isLegacyTierCanvasViewActive()) {
    return null;
  }
  const model = legacyTierCanvasViewState.model && typeof legacyTierCanvasViewState.model === 'object'
    ? legacyTierCanvasViewState.model
    : null;
  const workspace = layout?.workspace || null;
  const viewport = layout?.viewport || null;
  if (!model || !workspace || !viewport) {
    return null;
  }
  const anchorView = legacyTierCanvasViewState.anchorView && typeof legacyTierCanvasViewState.anchorView === 'object'
    ? legacyTierCanvasViewState.anchorView
    : captureLegacyTierCanvasAnchorView({ preferTarget: true });
  const anchorScale = clamp(safeNumber(anchorView.scale, DEFAULT_HOME_SCALE), MIN_SCALE, MAX_SCALE);
  const anchorProjectionScale = Math.max(0.0001, resolveProjectionScale(anchorScale));
  const cameraView = state.camera?.view && typeof state.camera.view === 'object'
    ? state.camera.view
    : anchorView;
  const currentScale = clamp(safeNumber(cameraView.scale, anchorScale), MIN_SCALE, MAX_SCALE);
  const currentProjectionScale = Math.max(0.0001, resolveProjectionScale(currentScale));
  const currentViewX = safeNumber(cameraView.x, safeNumber(anchorView.x, 0));
  const currentViewY = safeNumber(cameraView.y, safeNumber(anchorView.y, 0));

  const sidePadding = Math.max(30, Math.round(workspace.width * 0.035));
  const topPadding = Math.max(66, Math.round(workspace.height * 0.11));
  const bottomPadding = Math.max(40, Math.round(workspace.height * 0.10));
  const minX = workspace.x + sidePadding;
  const maxX = (workspace.x + workspace.width) - sidePadding;
  const minY = workspace.y + topPadding;
  const maxY = (workspace.y + workspace.height) - bottomPadding;
  const usableWidth = Math.max(140, maxX - minX);
  const levelCount = LEGACY_TIER_CANVAS_NODE_COUNTS_BY_DEPTH.length;
  const availableHeight = Math.max(180, maxY - minY);
  const depthYRatioTemplate = [0.04, 0.20, 0.33, 0.45];
  const depthYRatioByLevel = Array.from(
    { length: levelCount },
    (_, depthIndex) => {
      if (Number.isFinite(depthYRatioTemplate[depthIndex])) {
        return clamp(depthYRatioTemplate[depthIndex], 0, 1);
      }
      const depthProgress = levelCount <= 1 ? 0 : (depthIndex / Math.max(1, levelCount - 1));
      return clamp(0.04 + (depthProgress * 0.69), 0, 1);
    },
  );
  const trinaryBranchFanout = Math.max(2, INFINITY_BUILDER_TIER_NODE_REQUIREMENT);
  const trinaryStepDecay = 1 / trinaryBranchFanout;
  const trinaryDepthTransitions = Math.max(1, levelCount - 1);
  let trinarySeriesTotal = 0;
  for (let depthOffset = 0; depthOffset < trinaryDepthTransitions; depthOffset += 1) {
    trinarySeriesTotal += Math.pow(trinaryStepDecay, depthOffset);
  }
  const trinaryBaseStep = (usableWidth * 0.92) / Math.max(0.0001, 2 * trinarySeriesTotal);
  const centerX = minX + (usableWidth * 0.5);
  const descriptorPathById = new Map();
  const rootId = safeText(model.rootId);
  if (rootId) {
    descriptorPathById.set(rootId, '');
  }
  const resolveTrinaryPathOffset = (pathInput = '') => {
    const safePath = safeText(pathInput);
    if (!safePath) {
      return 0;
    }
    let offset = 0;
    for (let index = 0; index < safePath.length; index += 1) {
      const branchKey = safePath.charAt(index);
      const branchDirection = branchKey === '0'
        ? -1
        : (branchKey === '2' ? 1 : 0);
      const branchStep = trinaryBaseStep * Math.pow(trinaryStepDecay, index);
      offset += branchDirection * branchStep;
    }
    return offset;
  };
  const radiusByDepth = Array.from(
    { length: levelCount },
    (_, depthIndex) => {
      const safeDepth = Math.max(0, Math.floor(safeNumber(depthIndex, 0)));
      const binaryDepthRadius = Math.max(
        LEGACY_TIER_CANVAS_WORLD_RADIUS_MIN,
        NODE_RADIUS_BASE * Math.pow(LEGACY_TIER_CANVAS_RADIUS_DEPTH_DECAY, safeDepth),
      );
      const slotCountAtDepth = LEGACY_TIER_CANVAS_NODE_COUNTS_BY_DEPTH[safeDepth] || 1;
      const slotStepAtDepth = usableWidth / Math.max(1, slotCountAtDepth + 1);
      const depthRadiusLimit = safeDepth === 0
        ? Math.max(18, usableWidth * 0.14)
        : Math.max(2.8, slotStepAtDepth * 0.38);
      return Math.max(2.2, Math.min(binaryDepthRadius, depthRadiusLimit));
    },
  );

  const projectedNodes = [];
  for (let depthIndex = 0; depthIndex < LEGACY_TIER_CANVAS_NODE_COUNTS_BY_DEPTH.length; depthIndex += 1) {
    const slotCount = LEGACY_TIER_CANVAS_NODE_COUNTS_BY_DEPTH[depthIndex];
    const slotStep = usableWidth / Math.max(1, slotCount + 1);
    const depthY = minY + (availableHeight * depthYRatioByLevel[depthIndex]);
    const depthRadius = radiusByDepth[depthIndex] || radiusByDepth[radiusByDepth.length - 1] || 2.2;
    const depthDescriptors = Array.isArray(model.nodesByDepth?.[depthIndex])
      ? model.nodesByDepth[depthIndex]
      : [];
    const siblingCursorByParent = new Map();
    for (let slotIndex = 0; slotIndex < slotCount; slotIndex += 1) {
      const descriptor = depthDescriptors[slotIndex] && typeof depthDescriptors[slotIndex] === 'object'
        ? depthDescriptors[slotIndex]
        : null;
      const fallbackNodeId = `${LEGACY_TIER_CANVAS_PLACEHOLDER_ID_PREFIX}:tier-${model.tierNumber}:depth-${depthIndex}:slot-${slotIndex}`;
      const descriptorNode = descriptor?.node && typeof descriptor.node === 'object'
        ? descriptor.node
        : null;
      const nodeId = safeText(descriptor?.id || descriptorNode?.id || fallbackNodeId) || fallbackNodeId;
      const parentId = safeText(descriptor?.parentId || descriptorNode?.parent || '');
      const isEmpty = Boolean(descriptor?.isEmpty || descriptorNode?.isLegacyTierEmptySlot);
      const avatarSeedId = safeText(
        descriptor?.avatarSeedId
        || descriptorNode?.avatarSeedId
        || descriptorNode?.avatarSeed
        || nodeId,
      ) || nodeId;
      const nodeRecord = descriptorNode
        ? {
          ...descriptorNode,
          id: nodeId,
          parent: parentId,
          depth: depthIndex,
          path: safeText(descriptorNode?.path),
          isLegacyTierEmptySlot: isEmpty,
          avatarSeedId,
        }
        : createLegacyTierCanvasPlaceholderNode(
          nodeId,
          parentId,
          model.tierNumber,
          depthIndex,
          slotIndex,
        );
      let trinaryPath = '';
      if (depthIndex > 0) {
        const parentPath = descriptorPathById.get(parentId) || '';
        const siblingCursor = Math.max(
          0,
          Math.floor(safeNumber(siblingCursorByParent.get(parentId), 0)),
        );
        siblingCursorByParent.set(parentId, siblingCursor + 1);
        const siblingSlot = Math.min(trinaryBranchFanout - 1, siblingCursor);
        const branchDigit = siblingSlot <= 0
          ? '0'
          : (siblingSlot >= trinaryBranchFanout - 1 ? '2' : '1');
        trinaryPath = `${parentPath}${branchDigit}`;
      }
      descriptorPathById.set(nodeId, trinaryPath);
      const baseX = clamp(
        centerX + resolveTrinaryPathOffset(trinaryPath),
        minX,
        maxX,
      );
      const baseY = depthY;
      const worldX = (baseX - viewport.centerX - safeNumber(anchorView.x, 0)) / anchorProjectionScale;
      const worldY = (baseY - viewport.baseY - safeNumber(anchorView.y, 0)) / anchorProjectionScale;
      const worldRadius = depthRadius / anchorProjectionScale;
      const projectedX = viewport.centerX + currentViewX + (worldX * currentProjectionScale);
      const projectedY = viewport.baseY + currentViewY + (worldY * currentProjectionScale);
      const projectedRadius = Math.max(0.2, worldRadius * currentProjectionScale);
      const lodTier = projectedRadius >= 14
        ? 'full'
        : (projectedRadius >= 6.5 ? 'medium' : 'dot');
      projectedNodes.push({
        id: nodeId,
        node: nodeRecord,
        worldX,
        worldY,
        worldRadius,
        localDepth: depthIndex,
        localPath: trinaryPath || `T${model.tierNumber}-D${depthIndex}-S${slotIndex}`,
        globalDepth: depthIndex,
        globalPath: `legacy-tier-${model.tierNumber}-depth-${depthIndex}-slot-${slotIndex}`,
        x: projectedX,
        y: projectedY,
        r: projectedRadius,
        lodTier,
        isSelected: false,
        isFocusPathNode: false,
        isLegacyTierEmptySlot: isEmpty,
        avatarSeedId,
      });
    }
  }

  const projectedById = new Map();
  for (const projectedNode of projectedNodes) {
    projectedById.set(projectedNode.id, projectedNode);
  }
  const selectedId = safeText(state.selectedId);
  let selectedProjected = selectedId ? projectedById.get(selectedId) || null : null;
  if (!selectedProjected && model.rootId && projectedById.has(model.rootId)) {
    selectedProjected = projectedById.get(model.rootId);
  }

  if (selectedProjected) {
    let cursorId = selectedProjected.id;
    let safety = 0;
    while (cursorId && safety < projectedNodes.length + 4) {
      safety += 1;
      const projectedNode = projectedById.get(cursorId);
      if (!projectedNode) {
        break;
      }
      projectedNode.isFocusPathNode = true;
      cursorId = safeText(projectedNode?.node?.parent);
    }
  }

  const lodCounts = {
    full: 0,
    medium: 0,
    dot: 0,
    hidden: 0,
    culled: 0,
    total: projectedNodes.length,
  };
  for (const projectedNode of projectedNodes) {
    if (projectedNode.lodTier === 'full') {
      lodCounts.full += 1;
    } else if (projectedNode.lodTier === 'medium') {
      lodCounts.medium += 1;
    } else if (projectedNode.lodTier === 'dot') {
      lodCounts.dot += 1;
    }
  }
  const connectorCount = projectedNodes.reduce((count, projectedNode) => {
    const parentId = safeText(projectedNode?.node?.parent);
    if (parentId && projectedById.has(parentId)) {
      return count + 1;
    }
    return count;
  }, 0);

  return {
    visibleNodes: projectedNodes.map((projectedNode) => projectedNode.node),
    projectedNodes,
    connectors: [],
    stats: {
      ...lodCounts,
      visible: projectedNodes.length,
      connectors: connectorCount,
      fullDepthMax: null,
      visibleDepthMax: null,
      universeRootId: model.rootId,
      universeDepthCap: LEGACY_TIER_CANVAS_NODE_COUNTS_BY_DEPTH.length - 1,
    },
    selectedProjected,
  };
}

function drawLegacyTierCanvasViewHeader(layout, frameInput = null) {
  if (!isLegacyTierCanvasViewActive()) {
    return;
  }
  const model = legacyTierCanvasViewState.model && typeof legacyTierCanvasViewState.model === 'object'
    ? legacyTierCanvasViewState.model
    : null;
  const workspace = layout?.workspace || null;
  if (!model || !workspace) {
    return;
  }
  const cardWidth = clamp(Math.round(workspace.width * 0.40), 300, 500);
  const cardHeight = 72;
  const sideNavOpen = Boolean(state.ui?.sideNavOpen);
  const sideNav = layout?.sideNav && typeof layout.sideNav === 'object'
    ? layout.sideNav
    : null;
  const layoutLeftBound = sideNavOpen && sideNav
    ? Math.round(sideNav.x + sideNav.width + 12)
    : workspace.x;
  const layoutRightBound = Math.round(workspace.x + workspace.width);
  const availableCenterX = sideNavOpen
    ? (layoutLeftBound + layoutRightBound) * 0.5
    : (workspace.x + (workspace.width * 0.5));
  const cardX = clamp(
    Math.round(availableCenterX - (cardWidth * 0.5)),
    workspace.x + 10,
    (workspace.x + workspace.width) - cardWidth - 10,
  );
  const cardY = workspace.y + 14;
  const headerButtonId = 'legacy-tier-canvas-header-toggle-panel';
  const dropdownButtonId = 'legacy-tier-canvas-header-tier-dropdown-toggle';
  const panelVisible = Boolean(state.ui?.infinityBuilderVisible);
  const hoveredButtonId = safeText(state.hoveredButtonId);
  const isHovered = hoveredButtonId === headerButtonId;
  const tierEntriesInput = Array.isArray(legacyTierCanvasViewState.tierEntries)
    ? legacyTierCanvasViewState.tierEntries
    : [];
  const selectedTierNumber = Math.max(
    1,
    Math.floor(safeNumber(
      infinityBuilderSelectedTierNumber,
      safeNumber(model?.tierNumber, 1),
    )),
  );
  const tierEntries = tierEntriesInput.length
    ? tierEntriesInput
    : [{
      tierNumber: selectedTierNumber,
      label: `Legacy Tier ${selectedTierNumber}`,
      isSelected: true,
    }];
  const dropdownEnabled = tierEntries.length > 1;
  const dropdownOpen = dropdownEnabled && Boolean(legacyTierCanvasViewState.dropdownOpen);
  const fillColor = panelVisible
    ? (isHovered ? 'rgba(25, 39, 58, 0.90)' : 'rgba(22, 35, 53, 0.86)')
    : (isHovered ? 'rgba(27, 43, 63, 0.84)' : 'rgba(19, 28, 41, 0.74)');
  registerButton({
    id: headerButtonId,
    x: cardX,
    y: cardY,
    width: cardWidth,
    height: cardHeight,
    action: 'legacy-tier:panel:toggle',
    rounded: true,
  });
  fillRoundedRect(
    context,
    cardX,
    cardY,
    cardWidth,
    cardHeight,
    16,
    fillColor,
  );
  strokeRoundedRect(
    context,
    cardX,
    cardY,
    cardWidth,
    cardHeight,
    16,
    panelVisible
      ? (isHovered ? 'rgba(186, 209, 244, 0.72)' : 'rgba(162, 192, 234, 0.62)')
      : (isHovered ? 'rgba(165, 196, 236, 0.62)' : 'rgba(139, 171, 214, 0.44)'),
    isHovered ? 1.35 : 1,
  );
  const headerTitle = `Legacy Tier ${selectedTierNumber} Tree View`;
  drawText(headerTitle, cardX + (cardWidth * 0.5), cardY + 14, {
    size: 11,
    weight: 700,
    color: '#EEF6FF',
    align: 'center',
    baseline: 'middle',
    maxWidth: cardWidth - 18,
  });
  const panelHint = panelVisible
    ? 'Tap to hide Legacy Leadership panel'
    : 'Tap to show Legacy Leadership panel';
  drawText(panelHint, cardX + (cardWidth * 0.5), cardY + 28, {
    size: 9,
    weight: 600,
    color: 'rgba(187, 210, 238, 0.92)',
    align: 'center',
    baseline: 'middle',
    maxWidth: cardWidth - 18,
  });
  const dropdownWidth = clamp(Math.round(cardWidth * 0.43), 130, 210);
  const dropdownHeight = 22;
  const dropdownX = Math.round(cardX + ((cardWidth - dropdownWidth) * 0.5));
  const dropdownY = cardY + cardHeight - dropdownHeight - 7;
  const dropdownHovered = hoveredButtonId === dropdownButtonId;

  registerButton({
    id: dropdownButtonId,
    x: dropdownX,
    y: dropdownY,
    width: dropdownWidth,
    height: dropdownHeight,
    action: dropdownEnabled ? 'legacy-tier:dropdown:toggle' : 'noop',
    rounded: true,
  });

  fillRoundedRect(
    context,
    dropdownX,
    dropdownY,
    dropdownWidth,
    dropdownHeight,
    11,
    dropdownHovered
      ? 'rgba(240, 247, 255, 0.24)'
      : 'rgba(229, 239, 252, 0.16)',
  );
  strokeRoundedRect(
    context,
    dropdownX + 0.5,
    dropdownY + 0.5,
    dropdownWidth - 1,
    dropdownHeight - 1,
    11,
    dropdownHovered
      ? 'rgba(198, 217, 242, 0.74)'
      : 'rgba(180, 203, 235, 0.56)',
    dropdownHovered ? 1.2 : 1,
  );
  const selectedTierLabel = `Legacy Tier ${selectedTierNumber}`;
  drawText(selectedTierLabel, dropdownX + 12, dropdownY + (dropdownHeight * 0.5), {
    size: 9,
    weight: 700,
    color: '#EAF4FF',
    align: 'left',
    baseline: 'middle',
    maxWidth: dropdownWidth - 36,
  });
  drawText(
    dropdownEnabled
      ? (dropdownOpen ? '^' : 'v')
      : '-',
    dropdownX + dropdownWidth - 12,
    dropdownY + (dropdownHeight * 0.5),
    {
      size: 9,
      weight: 700,
      color: 'rgba(218, 232, 249, 0.96)',
      align: 'center',
      baseline: 'middle',
    },
  );

  if (dropdownOpen) {
    const menuPadding = 4;
    const optionHeight = 20;
    const menuWidth = dropdownWidth;
    const menuHeight = (menuPadding * 2) + (optionHeight * tierEntries.length);
    const menuX = dropdownX;
    const menuY = dropdownY + dropdownHeight + 6;

    fillRoundedRect(
      context,
      menuX,
      menuY,
      menuWidth,
      menuHeight,
      10,
      'rgba(17, 26, 39, 0.94)',
    );
    strokeRoundedRect(
      context,
      menuX + 0.5,
      menuY + 0.5,
      menuWidth - 1,
      menuHeight - 1,
      10,
      'rgba(157, 186, 223, 0.52)',
      1,
    );

    for (let index = 0; index < tierEntries.length; index += 1) {
      const entry = tierEntries[index];
      const tierNumber = Math.max(1, Math.floor(safeNumber(entry?.tierNumber, 0)));
      const optionY = menuY + menuPadding + (index * optionHeight);
      const optionButtonId = `legacy-tier-canvas-header-tier-option-${tierNumber}`;
      const optionHovered = hoveredButtonId === optionButtonId;
      const optionActive = tierNumber === selectedTierNumber;
      registerButton({
        id: optionButtonId,
        x: menuX + 4,
        y: optionY,
        width: menuWidth - 8,
        height: optionHeight,
        action: `legacy-tier:select:${tierNumber}`,
        rounded: true,
      });

      if (optionHovered || optionActive) {
        fillRoundedRect(
          context,
          menuX + 4,
          optionY + 1,
          menuWidth - 8,
          optionHeight - 2,
          8,
          optionActive
            ? 'rgba(104, 142, 188, 0.36)'
            : 'rgba(86, 116, 157, 0.26)',
        );
      }

      drawText(`Legacy Tier ${tierNumber}`, menuX + 14, optionY + (optionHeight * 0.5), {
        size: 9,
        weight: optionActive ? 700 : 600,
        color: optionActive ? '#EEF6FF' : 'rgba(207, 221, 241, 0.96)',
        align: 'left',
        baseline: 'middle',
        maxWidth: menuWidth - 34,
      });
      if (optionActive) {
        drawText('*', menuX + menuWidth - 14, optionY + (optionHeight * 0.5), {
          size: 9,
          weight: 700,
          color: '#EAF4FF',
          align: 'center',
          baseline: 'middle',
        });
      }
    }
  }

}

function shouldDrawUniverseLocalBreadcrumbHeader() {
  if (isLegacyTierCanvasViewActive()) {
    return false;
  }
  const historyTrail = resolveUniverseHistoryTrailNodeIds();
  if (historyTrail.length <= 1) {
    return false;
  }
  const currentRootId = normalizeCredentialValue(getUniverseRootId());
  const preferredHomeId = normalizeCredentialValue(resolvePreferredGlobalHomeNodeId() || 'root');
  return Boolean(currentRootId && currentRootId !== preferredHomeId);
}

function resolveUniverseHistoryTrailNodeIds() {
  const safeHistory = Array.isArray(state.universe?.history)
    ? state.universe.history
    : [];
  const trail = [];
  for (const snapshot of safeHistory) {
    const rootId = safeText(snapshot?.rootId);
    if (rootId) {
      trail.push(rootId);
    }
  }
  const currentRootId = safeText(getUniverseRootId()) || 'root';
  trail.push(currentRootId);
  return trail.length ? trail : ['root'];
}

function gotoUniverseFromHistoryIndex(targetIndexInput, animated = true) {
  const targetIndex = Math.floor(safeNumber(targetIndexInput, NaN));
  const trail = resolveUniverseHistoryTrailNodeIds();
  if (!Number.isFinite(targetIndex) || targetIndex < 0 || targetIndex >= trail.length) {
    return false;
  }
  const currentIndex = trail.length - 1;
  if (targetIndex === currentIndex) {
    return focusUniverseRoot(animated);
  }
  const targetRootId = safeText(trail[targetIndex]);
  if (!targetRootId) {
    return false;
  }

  const currentRootId = getUniverseRootId();
  if (targetRootId === currentRootId) {
    return focusUniverseRoot(animated);
  }

  const safeHistory = Array.isArray(state.universe.history)
    ? state.universe.history
    : [];
  const targetSnapshot = safeHistory[targetIndex] || null;

  rememberUniverseCamera(currentRootId);
  state.universe.history = safeHistory.slice(0, targetIndex);
  state.universe.rootId = targetRootId;
  refreshUniverseBreadcrumb(targetRootId);
  state.query = safeText(targetSnapshot?.query || '');
  state.depthFilter = safeText(targetSnapshot?.depthFilter || 'all') || 'all';
  setSelectedNode(safeText(targetSnapshot?.selectedId || targetRootId), { animate: false });

  if (restoreUniverseCamera(targetRootId, animated)) {
    return true;
  }

  if (focusNode(state.selectedId || targetRootId, 30, animated)) {
    return true;
  }
  return focusUniverseRoot(animated);
}

function drawUniverseLocalBreadcrumbHeader(layout) {
  if (!shouldDrawUniverseLocalBreadcrumbHeader()) {
    return;
  }
  const workspace = layout?.workspace || null;
  if (!workspace) {
    return;
  }

  const cardWidth = clamp(Math.round(workspace.width * 0.34), 260, 480);
  const cardHeight = 58;
  const sideNavOpen = Boolean(state.ui?.sideNavOpen);
  const sideNav = layout?.sideNav && typeof layout.sideNav === 'object'
    ? layout.sideNav
    : null;
  const layoutLeftBound = sideNavOpen && sideNav
    ? Math.round(sideNav.x + sideNav.width + 12)
    : workspace.x;
  const layoutRightBound = Math.round(workspace.x + workspace.width);
  const availableCenterX = sideNavOpen
    ? (layoutLeftBound + layoutRightBound) * 0.5
    : (workspace.x + (workspace.width * 0.5));
  const cardX = clamp(
    Math.round(availableCenterX - (cardWidth * 0.5)),
    workspace.x + 10,
    (workspace.x + workspace.width) - cardWidth - 10,
  );
  const cardY = workspace.y + 14;

  fillRoundedRect(
    context,
    cardX,
    cardY,
    cardWidth,
    cardHeight,
    26,
    '#FFFFFF',
  );
  drawUniverseBreadcrumbNodeChips(cardX + 12, cardY, cardWidth - 24, cardHeight);
}

function drawTreeViewport(layout) {
  const viewport = layout.viewport;
  const legacyTierFrame = resolveLegacyTierCanvasFrame(layout);
  const legacyViewActive = Boolean(legacyTierFrame);
  let frame = legacyTierFrame;
  let anticipationSlots = [];
  if (!legacyViewActive) {
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
    frame = state.adapter.computeFrame(frameOptions);
    anticipationSlots = resolveAnticipationSlots(frame, frameOptions);
  }

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
  if (!legacyViewActive) {
    drawAnticipationConnectors(anticipationSlots, projectedNodes);
  }
  const selectedNode = projectedNodes.find((node) => node.id === state.selectedId)
    || (frame?.selectedProjected || null);

  for (const node of projectedNodes) {
    if (selectedNode && node.id === selectedNode.id) {
      continue;
    }
    drawNode(node);
  }
  if (selectedNode) {
    drawNode(selectedNode);
  }
  if (legacyViewActive) {
    drawLegacyTierCanvasViewHeader(layout, frame);
  } else {
    drawAnticipationSlots(anticipationSlots);
    drawUniverseLocalBreadcrumbHeader(layout);
  }

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
  syncInfinityBuilderPanelPosition(state.layout);
  syncInfinityBuilderPanelVisuals();
  syncInfinityBuilderPanelVisibility();
  syncRankAdvancementPanelPosition(state.layout);
  syncRankAdvancementPanelVisuals();
  syncRankAdvancementPanelVisibility();
  try {
    syncPreferredAccountsPanelPosition(state.layout);
    syncPreferredAccountsPanelVisuals();
    syncPreferredAccountsPanelVisibility();
  } catch (error) {
    const nowMs = performance.now();
    if ((nowMs - preferredAccountsRenderErrorLoggedAtMs) >= 1000) {
      preferredAccountsRenderErrorLoggedAtMs = nowMs;
      console.error('[TreeNext] Preferred accounts panel sync failed during render:', error);
    }
  }
  syncMyStorePanelPosition(state.layout);
  syncMyStorePanelVisuals();
  syncMyStorePanelVisibility();
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
  if (state.source === 'admin') {
    return 'root';
  }

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
  if (safeAction === 'panel:rank-advancement:toggle') {
    setRankAdvancementPanelVisible(!Boolean(state.ui?.rankAdvancementVisible));
    return;
  }
  if (safeAction === 'panel:preferred-accounts:toggle') {
    setPreferredAccountsPanelVisible(!Boolean(state.ui?.preferredAccountsVisible));
    return;
  }
  if (safeAction === 'legacy-tier:panel:toggle') {
    toggleLegacyTierCanvasPanelVisibility();
    return;
  }
  if (safeAction === 'legacy-tier:view:toggle' || safeAction === 'legacy-tier:view:tier-1') {
    toggleLegacyTierQuickAccessView();
    return;
  }
  if (safeAction === 'legacy-tier:dropdown:toggle') {
    if (!isLegacyTierCanvasViewActive()) {
      return;
    }
    const tierEntries = Array.isArray(legacyTierCanvasViewState.tierEntries)
      ? legacyTierCanvasViewState.tierEntries
      : [];
    if (tierEntries.length <= 1) {
      legacyTierCanvasViewState.dropdownOpen = false;
      return;
    }
    legacyTierCanvasViewState.dropdownOpen = !Boolean(legacyTierCanvasViewState.dropdownOpen);
    return;
  }
  if (safeAction.startsWith('legacy-tier:select:')) {
    const tierNumber = Math.floor(safeNumber(
      safeAction.slice('legacy-tier:select:'.length),
      NaN,
    ));
    selectLegacyTierCanvasTier(tierNumber);
    return;
  }
  if (safeAction.startsWith('brand-menu:page:')) {
    const targetPage = safeAction.slice('brand-menu:page:'.length);
    state.ui.sideNavBrandMenuOpen = false;
    if (targetPage === 'my-store') {
      setMyStorePanelVisible(true);
      return;
    }
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
    if (exitLegacyTierCanvasToBinaryDefault(true)) {
      return;
    }
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
  if (safeAction.startsWith('universe:history:goto:')) {
    const targetIndex = Math.floor(safeNumber(
      safeAction.slice('universe:history:goto:'.length),
      NaN,
    ));
    if (Number.isFinite(targetIndex)) {
      gotoUniverseFromHistoryIndex(targetIndex, true);
    }
    return;
  }
  if (safeAction === 'universe:enter') {
    enterSelectedUniverseNodeFromCurrentView();
    return;
  }
  if (safeAction === 'universe:back') {
    if (exitLegacyTierCanvasToBinaryDefault(true)) {
      return;
    }
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
    setRankAdvancementPanelVisible(!Boolean(state.ui?.rankAdvancementVisible));
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
  const buttonAction = safeText(button?.action);
  const interactingWithLegacyTierDropdown = (
    buttonAction === 'legacy-tier:dropdown:toggle'
    || buttonAction.startsWith('legacy-tier:select:')
  );
  if (legacyTierCanvasViewState.dropdownOpen && !interactingWithLegacyTierDropdown) {
    legacyTierCanvasViewState.dropdownOpen = false;
  }
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
    enterSelectedUniverseNodeFromCurrentView();
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
  const changedKey = safeText(event?.key);
  if (changedKey === TREE_NEXT_STRIPE_RETURN_SIGNAL_STORAGE_KEY) {
    const signalPayload = resolveTreeNextStripeReturnSignalPayload(event?.newValue);
    if (signalPayload) {
      void processTreeNextStripeReturnSignalPayload(signalPayload, {
        preserveCurrentStep: true,
        consumeSignal: true,
      });
    }
    return;
  }

  const expectedStorageKey = state.source === 'admin'
    ? ADMIN_AUTH_STORAGE_KEY
    : MEMBER_AUTH_STORAGE_KEY;
  const expectedCookieKey = state.source === 'admin'
    ? ADMIN_AUTH_COOKIE_KEY
    : MEMBER_AUTH_COOKIE_KEY;
  if (changedKey && changedKey !== expectedStorageKey) {
    return;
  }
  const nextSession = readSessionSnapshot(expectedStorageKey, expectedCookieKey);
  if (!nextSession) {
    return;
  }
  state.session = nextSession;
  resetAccountOverviewRemoteSnapshot();
  resetRankAdvancementSnapshot();
  resetInfinityBuilderPanelState();
  pinnedNodeIdsLastSyncedKey = '';
  pinnedNodeIdsLocalDirty = false;
  const overviewContext = resolveAccountOverviewPanelContext();
  const homeNode = overviewContext?.homeNode || null;
  void refreshAccountOverviewRemoteSnapshot({
    force: true,
    homeNode,
    scope: overviewContext?.scope,
    preferHomeNodeIdentity: overviewContext?.preferHomeNodeIdentity,
  });
  void refreshRankAdvancementSnapshot({
    force: true,
    homeNode,
  });
  if (state.source === 'member') {
    void fetchMemberBinaryTreeLaunchState(nextSession)
      .then((launchState) => {
        if (!launchState || typeof launchState !== 'object') {
          return;
        }
        state.launchState = launchState;
        applyInfinityBuilderTierSortDirectionsFromLaunchState(launchState, {
          syncServer: false,
          markSynced: true,
        });
      })
      .catch(() => {});
    schedulePinnedNodeIdsServerSync({ immediate: true });
  }
}

function bindEvents() {
  window.addEventListener('resize', updateCanvasSize);
  window.addEventListener('keydown', onKeyDown, { passive: false });
  window.addEventListener('storage', onSessionStorageChange);
  window.addEventListener('message', onTreeNextStripeReturnMessage);
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
  try {
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
  } catch (error) {
    const nowMs = performance.now();
    if ((nowMs - renderLoopErrorLoggedAtMs) >= 1000) {
      renderLoopErrorLoggedAtMs = nowMs;
      console.error('[TreeNext] Render loop recovered from frame error:', error);
    }
  } finally {
    window.requestAnimationFrame(tickFrame);
  }
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
  initInfinityBuilderPanel();
  initRankAdvancementPanel();
  initPreferredAccountsPanel();
  initMyStorePanel();
  const initialPanelKey = resolveInitialPanelKeyFromQuery();
  if (initialPanelKey === 'account-overview') {
    setAccountOverviewPanelVisible(true);
  } else if (initialPanelKey === 'infinity-builder') {
    setInfinityBuilderPanelMode(INFINITY_BUILDER_PANEL_MODE_INFINITY);
    setInfinityBuilderPanelVisible(true);
  } else if (initialPanelKey === 'legacy-leadership') {
    setInfinityBuilderPanelMode(INFINITY_BUILDER_PANEL_MODE_LEGACY_LEADERSHIP);
    setInfinityBuilderPanelVisible(true);
  } else if (initialPanelKey === 'rank-advancement') {
    setRankAdvancementPanelVisible(true);
  } else if (initialPanelKey === 'preferred-accounts') {
    setPreferredAccountsPanelVisible(true);
  } else if (initialPanelKey === 'my-store') {
    setMyStorePanelVisible(true);
  }
  await processTreeNextStripeCheckoutReturn();
  await processTreeNextStripeReturnSignalFromStorage({
    preserveCurrentStep: true,
    consumeSignal: true,
  });
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



