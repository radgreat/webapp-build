/**
 * @typedef {Object} CycleRule
 * @property {number} leftPvThreshold
 * @property {number} rightPvThreshold
 */

/**
 * @typedef {Object} BinaryTreeNode
 * @property {string} id
 * @property {string} memberCode
 * @property {'active' | 'inactive'} status
 * @property {string} name
 * @property {number} leftPersonalPv
 * @property {number} rightPersonalPv
 * @property {number} leftPv
 * @property {number} rightPv
 * @property {number} cycles
 * @property {number} addedAt
 * @property {number} spilloverLeftPv
 * @property {number} spilloverRightPv
 * @property {string=} rank
 * @property {string=} countryFlag
 * @property {string=} profileCoverUrl
 * @property {string=} profileAccountTitle
 * @property {string=} profileAccountTitleSecondary
 * @property {{rank: boolean, title: boolean, extra: boolean}=} profileBadgeVisibility
 * @property {string=} profileBadgeRankIconPath
 * @property {string=} profileBadgeTitleIconPath
 * @property {string=} profileBadgeExtraIconPath
 * @property {string=} profileBadgeRankSubtitle
 * @property {string=} profileBadgeTitleSubtitle
 * @property {string=} profileBadgeExtraSubtitle
 * @property {string=} leftChildId
 * @property {string=} rightChildId
 * @property {string=} sponsorId
 * @property {'left' | 'right'=} sponsorLeg
 * @property {string=} placementParentId
 * @property {'left' | 'right'=} placementSide
 * @property {boolean=} isSpillover
 * @property {'main_center' | 'business_center' | 'staff_admin' | 'legacy_placeholder'=} businessCenterNodeType
 * @property {number=} businessCenterIndex
 * @property {boolean=} isBusinessCenterPlaceholder
 */

/**
 * @typedef {Object} BinaryTreeData
 * @property {string} rootId
 * @property {Record<string, BinaryTreeNode>} nodes
 * @property {CycleRule} cycleRule
 */

const DEFAULT_CYCLE_RULE = Object.freeze({
  leftPvThreshold: 100,
  rightPvThreshold: 200,
});
const DEFAULT_COUNTRY_FLAG_CODE = 'un';
const COUNTRY_FLAG_CODE_BY_EMOJI = Object.freeze({
  '🇺🇸': 'us',
  '🇵🇭': 'ph',
  '🇨🇦': 'ca',
  '🇲🇽': 'mx',
  '🇬🇧': 'gb',
  '🇦🇺': 'au',
  '🇳🇿': 'nz',
  '🇸🇬': 'sg',
  '🇲🇾': 'my',
  '🇮🇩': 'id',
  '🇹🇭': 'th',
  '🇻🇳': 'vn',
  '🇯🇵': 'jp',
  '🇰🇷': 'kr',
  '🇦🇪': 'ae',
  '🏳️': 'un',
  '🏳': 'un',
});
const PROFILE_EVENT_TITLE_ICON_BASE_PATH_BY_KEY = Object.freeze({
  'legacy founder': '/brand_assets/Icons/Title-Icons/legacy-founder-star',
  'legacy director': '/brand_assets/Icons/Title-Icons/legacy-director-star',
  'legacy ambassador': '/brand_assets/Icons/Title-Icons/legacy-ambassador-star',
  'presidential circle': '/brand_assets/Icons/Title-Icons/presidential-circle-star',
});
const PROFILE_ICON_PATH_PATTERN = /^\/brand_assets\/Icons\/(?:Achievements|Title-Icons)\/[a-z0-9-]+(?:-light)?\.svg$/i;

const NODE_WIDTH = 228;
const NODE_HEIGHT = 138;
const TREE_SIMPLE_NODE_RADIUS = 28;
const TREE_SIMPLE_NODE_LINK_WIDTH = 1.55;
const TREE_DEEP_X_SPACING_START_DEPTH = 3;
const TREE_DEEP_X_SPACING_PER_DEPTH = 18;
const TREE_DEEP_X_SPACING_GROWTH = 4;
const ENROLL_ANTICIPATED_NODE_RADIUS = TREE_SIMPLE_NODE_RADIUS;
const ENROLL_ANTICIPATED_NODE_LABEL_OFFSET = 10;
const ENROLL_ANTICIPATED_NODE_LABEL_HEIGHT = 14;
const ENROLL_LAYOUT_SLOT_WIDTH_BOOST = 72;
const ENROLL_LAYOUT_DEPTH_CAP_BOOST = 2;
const ENROLL_ANTICIPATED_BASE_GAP = (ENROLL_ANTICIPATED_NODE_RADIUS * 2) + 34;
const ENROLL_MIDDLE_GAP = 178;
const ENROLL_MIDDLE_GAP_PER_DEPTH = 24;
const ENROLL_MIDDLE_GAP_MAX_EXTRA = 220;
const ENROLL_SELECTED_SLOT_HORIZONTAL_OFFSET = 138;
const ENROLL_SELECTED_SLOT_VERTICAL_RATIO = 0.72;
const ENROLL_SELECTED_SLOT_VERTICAL_STEP = 44;
const ENROLL_SELECTED_SLOT_MAX_VERTICAL_STEPS = 8;
const ENROLL_SELECTED_SLOT_COLLISION_PADDING = 14;
const NODE_POPUP_WIDTH = 404;
const NODE_POPUP_HEIGHT = 368;
const NODE_POPUP_POINTER_HEIGHT = 10;
const NODE_POPUP_TOP_MARGIN = 10;
const NODE_POPUP_SCREEN_MARGIN = 14;
const NODE_POPUP_ANCHOR_OFFSET_Y = 8;
const NODE_POPUP_COVER_HEIGHT = 104;
const NODE_POPUP_AVATAR_RADIUS = 28;
const NODE_POPUP_BADGE_HOVER_HIDE_DELAY_MS = 90;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 2.5;
const WHEEL_STEP_ZOOM_IN_FACTOR = 1.12;
const WHEEL_STEP_ZOOM_OUT_FACTOR = 0.9;
const DEFAULT_TRACKPAD_ZOOM_SENSITIVITY = 0.3;
const MIN_TRACKPAD_ZOOM_SENSITIVITY = 0.05;
const MAX_TRACKPAD_ZOOM_SENSITIVITY = 1;
const ESC_FULLSCREEN_EXIT_HOLD_MS = 700;
const NAVIGATION_FOCUS_MIN_ZOOM = 0.72;
const MOBILE_NAVIGATION_FOCUS_VIEWPORT_Y_RATIO = 0.34;
const NAVIGATION_CAMERA_ANIMATION_DURATION_MS = 420;
const MAX_LAYOUT_DEPTH_FOR_WIDTH = 11;
const SPILLOVER_LINE_WIDTH = 1.5;
const SPILLOVER_LINE_ALPHA = 0.3;
const MINIMAP_SPILLOVER_LINE_WIDTH = 0.9;
const TREE_UI_STATE_STORAGE_KEY = 'charge-binary-tree-ui-state-v1';
const DESKTOP_MINIMAP_SIZES = Object.freeze(['small', 'medium', 'large']);
const SPILLOVER_HIGHLIGHT_MODES = Object.freeze(['all', 'received-only', 'none']);
const WEEKDAY_LABELS = Object.freeze(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
const TREE_LOD_MODE_FAR = 'far';
const TREE_LOD_MODE_MID = 'mid';
const TREE_LOD_MODE_NEAR = 'near';
const TREE_LOD_FAR_ENTER_ZOOM = 0.48;
const TREE_LOD_FAR_EXIT_ZOOM = 0.58;
const TREE_LOD_NEAR_ENTER_ZOOM = 0.72;
const TREE_LOD_NEAR_EXIT_ZOOM = 0.64;
const TREE_LOD_DEPTH_LIMIT_BY_MODE = Object.freeze({
  [TREE_LOD_MODE_FAR]: 4,
  [TREE_LOD_MODE_MID]: 6,
  [TREE_LOD_MODE_NEAR]: Number.POSITIVE_INFINITY,
});
const TREE_WORLD_LAYOUT_WIDTH_DEPTH_CAP = 4;
const TREE_WORLD_SLOT_WIDTH = 184;
const TREE_MAP_HOME_ZOOM = 0.6;
const TREE_MAP_HOME_VIEWPORT_Y_RATIO = 0.42;

const TREE_THEME_PALETTES = Object.freeze({
  dark: {
    backgroundActive: 0x111920,
    backgroundInactive: 0x1a2530,
    backgroundSpilloverActive: 0x181c28,
    backgroundSpilloverInactive: 0x1f2430,
    borderDefault: 0x3a4e62,
    borderEligible: 0x10e4a0,
    borderSelected: 0x0fd4a4,
    borderSpillover: 0x7b6ba3,
    borderSpilloverSelected: 0x9888c4,
    link: 0x2a3a4a,
    linkSpillover: 0x2ecf74,
    textPrimary: 0xf0f4f8,
    textSecondary: 0xa0b4c8,
    textMuted: 0x6b8299,
    statusActive: 0x10e4a0,
    statusInactive: 0xf5b731,
    statusChipFillActive: 0x10392e,
    statusChipFillInactive: 0x3b2a15,
    directSponsorIconBorder: 0xe3a63f,
    directSponsorIconFill: 0x2f2212,
    directSponsorIconGlyph: 0xffc766,
    minimapBackground: 'rgba(8, 12, 16, 0.94)',
    minimapEmptyText: 'rgba(160, 180, 200, 0.9)',
    minimapLink: 'rgba(58, 78, 98, 0.55)',
    minimapSpillover: `rgba(46, 207, 116, ${SPILLOVER_LINE_ALPHA})`,
    minimapNodeActive: '16,228,160',
    minimapNodeInactive: '245,183,49',
    minimapSelectedNodeStroke: 'rgba(240, 244, 248, 0.95)',
    minimapViewportFill: 'rgba(15, 212, 164, 0.16)',
    minimapViewportStroke: 'rgba(15, 212, 164, 0.95)',
  },
  light: {
    backgroundActive: 0xf7fbff,
    backgroundInactive: 0xf0f6fd,
    backgroundSpilloverActive: 0xf2f7ff,
    backgroundSpilloverInactive: 0xe9f2fc,
    borderDefault: 0xb8c8df,
    borderEligible: 0x7353df,
    borderSelected: 0x8a63f3,
    borderSpillover: 0x8a82d9,
    borderSpilloverSelected: 0x6e63d6,
    link: 0x99aec9,
    linkSpillover: 0x8b68ef,
    textPrimary: 0x182334,
    textSecondary: 0x4c5d74,
    textMuted: 0x708399,
    statusActive: 0x7353df,
    statusInactive: 0xbb7a23,
    statusChipFillActive: 0xeee8ff,
    statusChipFillInactive: 0xf8eedf,
    directSponsorIconBorder: 0xcc8c2d,
    directSponsorIconFill: 0xfff4df,
    directSponsorIconGlyph: 0xb8741c,
    minimapBackground: 'rgba(244, 249, 255, 0.96)',
    minimapEmptyText: 'rgba(76, 93, 116, 0.9)',
    minimapLink: 'rgba(137, 157, 182, 0.72)',
    minimapSpillover: `rgba(139, 104, 239, ${SPILLOVER_LINE_ALPHA})`,
    minimapNodeActive: '115,83,223',
    minimapNodeInactive: '187,122,35',
    minimapSelectedNodeStroke: 'rgba(24, 35, 52, 0.82)',
    minimapViewportFill: 'rgba(138, 99, 243, 0.16)',
    minimapViewportStroke: 'rgba(138, 99, 243, 0.92)',
  },
});

const COLORS = { ...TREE_THEME_PALETTES.dark };

function normalizeTreeThemeName(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'light' || normalized === 'apple') {
    return 'light';
  }
  if (normalized === 'dark' || normalized === 'default' || normalized === 'shopify') {
    return 'dark';
  }
  return 'dark';
}

function resolveRuntimeThemeKey() {
  const runtimeTheme = typeof document !== 'undefined'
    ? document.documentElement?.dataset?.theme
    : 'dark';
  return normalizeTreeThemeName(runtimeTheme || 'dark');
}

function applyTreeThemePalette(themeName = resolveRuntimeThemeKey()) {
  const normalizedThemeName = normalizeTreeThemeName(themeName);
  const nextPalette = TREE_THEME_PALETTES[normalizedThemeName] || TREE_THEME_PALETTES.dark;
  Object.assign(COLORS, nextPalette);
  return normalizedThemeName;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function easeInOutSine(progress) {
  const t = clamp(progress, 0, 1);
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

function resolveTreeLodModeForScale(scale, currentModeKey, options = {}) {
  if (options.disable) {
    return {
      key: TREE_LOD_MODE_NEAR,
      maxDepth: TREE_LOD_DEPTH_LIMIT_BY_MODE[TREE_LOD_MODE_NEAR],
    };
  }

  const safeScale = clamp(Number(scale) || 1, MIN_ZOOM, MAX_ZOOM);
  const currentKey = (
    currentModeKey === TREE_LOD_MODE_FAR
    || currentModeKey === TREE_LOD_MODE_MID
    || currentModeKey === TREE_LOD_MODE_NEAR
  )
    ? currentModeKey
    : TREE_LOD_MODE_NEAR;

  let nextKey = currentKey;

  if (currentKey === TREE_LOD_MODE_FAR) {
    if (safeScale >= TREE_LOD_NEAR_ENTER_ZOOM) {
      nextKey = TREE_LOD_MODE_NEAR;
    } else if (safeScale >= TREE_LOD_FAR_EXIT_ZOOM) {
      nextKey = TREE_LOD_MODE_MID;
    }
  } else if (currentKey === TREE_LOD_MODE_MID) {
    if (safeScale < TREE_LOD_FAR_ENTER_ZOOM) {
      nextKey = TREE_LOD_MODE_FAR;
    } else if (safeScale >= TREE_LOD_NEAR_ENTER_ZOOM) {
      nextKey = TREE_LOD_MODE_NEAR;
    }
  } else {
    if (safeScale < TREE_LOD_FAR_ENTER_ZOOM) {
      nextKey = TREE_LOD_MODE_FAR;
    } else if (safeScale < TREE_LOD_NEAR_EXIT_ZOOM) {
      nextKey = TREE_LOD_MODE_MID;
    }
  }

  return {
    key: nextKey,
    maxDepth: TREE_LOD_DEPTH_LIMIT_BY_MODE[nextKey] ?? TREE_LOD_DEPTH_LIMIT_BY_MODE[TREE_LOD_MODE_NEAR],
  };
}

function hashString(value) {
  const input = String(value ?? '');
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function getSpilloverDashPattern(nodeId, useMinimapScale = false) {
  const hash = hashString(nodeId);
  const dashLength = 7 + (hash % 8);
  const gapLength = 4 + ((hash >>> 3) % 7);
  if (!useMinimapScale) {
    return { dashLength, gapLength };
  }
  return {
    dashLength: Math.max(2, Math.round(dashLength * 0.55)),
    gapLength: Math.max(2, Math.round(gapLength * 0.55)),
  };
}

function cubicBezierPoint(startX, startY, control1X, control1Y, control2X, control2Y, endX, endY, t) {
  const inverseT = 1 - t;
  const a = inverseT ** 3;
  const b = 3 * (inverseT ** 2) * t;
  const c = 3 * inverseT * (t ** 2);
  const d = t ** 3;
  return {
    x: a * startX + b * control1X + c * control2X + d * endX,
    y: a * startY + b * control1Y + c * control2Y + d * endY,
  };
}

function buildBezierPolyline(startX, startY, control1X, control1Y, control2X, control2Y, endX, endY) {
  const approximateLength = Math.hypot(control1X - startX, control1Y - startY)
    + Math.hypot(control2X - control1X, control2Y - control1Y)
    + Math.hypot(endX - control2X, endY - control2Y);
  const segments = Math.max(18, Math.min(120, Math.ceil(approximateLength / 18)));
  const points = [{ x: startX, y: startY }];
  for (let index = 1; index <= segments; index += 1) {
    const t = index / segments;
    points.push(cubicBezierPoint(startX, startY, control1X, control1Y, control2X, control2Y, endX, endY, t));
  }
  return points;
}

function buildSpilloverBezierPolyline(startX, startY, control1X, control1Y, control2X, control2Y, endX, endY) {
  const approximateLength = Math.hypot(control1X - startX, control1Y - startY)
    + Math.hypot(control2X - control1X, control2Y - control1Y)
    + Math.hypot(endX - control2X, endY - control2Y);
  const segments = Math.max(10, Math.min(56, Math.ceil(approximateLength / 34)));
  const points = [{ x: startX, y: startY }];
  for (let index = 1; index <= segments; index += 1) {
    const t = index / segments;
    points.push(cubicBezierPoint(startX, startY, control1X, control1Y, control2X, control2Y, endX, endY, t));
  }
  return points;
}

function resolveEdgeAnchoredLineSegment(startX, startY, endX, endY, startRadius = TREE_SIMPLE_NODE_RADIUS, endRadius = TREE_SIMPLE_NODE_RADIUS) {
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  const distance = Math.hypot(deltaX, deltaY);
  if (distance <= 0.0001) {
    return null;
  }
  const unitX = deltaX / distance;
  const unitY = deltaY / distance;
  return {
    startX: startX + unitX * Math.max(0, startRadius),
    startY: startY + unitY * Math.max(0, startRadius),
    endX: endX - unitX * Math.max(0, endRadius),
    endY: endY - unitY * Math.max(0, endRadius),
  };
}

function drawDashedPolyline(graphics, points, dashLength, gapLength) {
  if (!graphics || !Array.isArray(points) || points.length < 2) {
    return;
  }

  const safeDashLength = Math.max(1, dashLength);
  const safeGapLength = Math.max(1, gapLength);
  let isDrawingDash = true;
  let remaining = safeDashLength;
  graphics.moveTo(points[0].x, points[0].y);

  for (let index = 1; index < points.length; index += 1) {
    let segmentStartX = points[index - 1].x;
    let segmentStartY = points[index - 1].y;
    const segmentEndX = points[index].x;
    const segmentEndY = points[index].y;

    let dx = segmentEndX - segmentStartX;
    let dy = segmentEndY - segmentStartY;
    let segmentLength = Math.hypot(dx, dy);

    while (segmentLength > 0.0001) {
      const step = Math.min(remaining, segmentLength);
      const ratio = step / segmentLength;
      const nextX = segmentStartX + dx * ratio;
      const nextY = segmentStartY + dy * ratio;

      if (isDrawingDash) {
        graphics.lineTo(nextX, nextY);
      } else {
        graphics.moveTo(nextX, nextY);
      }

      segmentStartX = nextX;
      segmentStartY = nextY;
      dx = segmentEndX - segmentStartX;
      dy = segmentEndY - segmentStartY;
      segmentLength = Math.hypot(dx, dy);

      if (step >= remaining - 0.0001) {
        isDrawingDash = !isDrawingDash;
        remaining = isDrawingDash ? safeDashLength : safeGapLength;
      } else {
        remaining -= step;
      }
    }
  }
}

function isValidNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function sanitizeCycleRule(rule) {
  const left = isValidNumber(rule?.leftPvThreshold) ? Math.max(1, Math.floor(rule.leftPvThreshold)) : DEFAULT_CYCLE_RULE.leftPvThreshold;
  const right = isValidNumber(rule?.rightPvThreshold) ? Math.max(1, Math.floor(rule.rightPvThreshold)) : DEFAULT_CYCLE_RULE.rightPvThreshold;
  return { leftPvThreshold: left, rightPvThreshold: right };
}

function createDefaultSearchState() {
  return {
    query: '',
    minCycles: null,
    status: 'all',
    sort: 'latest',
    directOnly: false,
  };
}

function sanitizeSearchState(search) {
  const defaultSearch = createDefaultSearchState();
  if (!search || typeof search !== 'object') {
    return defaultSearch;
  }

  const minCyclesRaw = isValidNumber(search.minCycles) ? Math.floor(search.minCycles) : null;
  const minCycles = minCyclesRaw !== null && minCyclesRaw >= 0 ? minCyclesRaw : null;
  const status = search.status === 'active' || search.status === 'inactive' ? search.status : defaultSearch.status;
  const sort = search.sort === 'oldest' ? 'oldest' : defaultSearch.sort;
  const directOnly = Boolean(search.directOnly);

  return {
    query: typeof search.query === 'string' ? search.query : defaultSearch.query,
    minCycles,
    status,
    sort,
    directOnly,
  };
}

function sanitizeDesktopMinimapSize(value) {
  const normalizedValue = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return DESKTOP_MINIMAP_SIZES.includes(normalizedValue) ? normalizedValue : 'small';
}

function sanitizeSpilloverHighlightMode(value) {
  const normalizedValue = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return SPILLOVER_HIGHLIGHT_MODES.includes(normalizedValue) ? normalizedValue : 'all';
}

function sanitizeTrackpadZoomSensitivity(value) {
  if (!isValidNumber(value)) {
    return DEFAULT_TRACKPAD_ZOOM_SENSITIVITY;
  }
  return clamp(value, MIN_TRACKPAD_ZOOM_SENSITIVITY, MAX_TRACKPAD_ZOOM_SENSITIVITY);
}

function isMacLikePlatform() {
  if (typeof navigator === 'undefined') {
    return false;
  }

  const uaDataPlatform = typeof navigator.userAgentData?.platform === 'string'
    ? navigator.userAgentData.platform
    : '';
  const fallbackPlatform = typeof navigator.platform === 'string' ? navigator.platform : '';
  const normalizedPlatform = `${uaDataPlatform} ${fallbackPlatform}`.toLowerCase();
  return normalizedPlatform.includes('mac')
    || normalizedPlatform.includes('iphone')
    || normalizedPlatform.includes('ipad')
    || normalizedPlatform.includes('ipod');
}

function sanitizePersistedTreeUiState(raw) {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const hiddenSpilloverNodeIds = Array.isArray(raw.hiddenSpilloverNodeIds)
    ? raw.hiddenSpilloverNodeIds.filter((id) => typeof id === 'string').slice(0, 10000)
    : [];

  const hasValidCamera = raw.camera
    && typeof raw.camera === 'object'
    && isValidNumber(raw.camera.x)
    && isValidNumber(raw.camera.y)
    && isValidNumber(raw.camera.scale);

  return {
    cycleRule: raw.cycleRule ? sanitizeCycleRule(raw.cycleRule) : null,
    search: sanitizeSearchState(raw.search),
    selectedNodeId: typeof raw.selectedNodeId === 'string' ? raw.selectedNodeId : null,
    hiddenSpilloverNodeIds,
    isFullscreen: Boolean(raw.isFullscreen),
    isSearchToolsOpen: Boolean(raw.isSearchToolsOpen),
    isToolsVisible: raw.isToolsVisible === false ? false : true,
    isDetailsVisible: raw.isDetailsVisible === false ? false : true,
    isDesktopMinimapVisible: raw.isDesktopMinimapVisible === false ? false : true,
    desktopMinimapSize: sanitizeDesktopMinimapSize(raw.desktopMinimapSize),
    isMobileSelectedOpen: Boolean(raw.isMobileSelectedOpen),
    reverseTrackpadMovement: Boolean(raw.reverseTrackpadMovement),
    trackpadZoomSensitivity: sanitizeTrackpadZoomSensitivity(raw.trackpadZoomSensitivity),
    camera: hasValidCamera
      ? {
        x: raw.camera.x,
        y: raw.camera.y,
        scale: clamp(raw.camera.scale, MIN_ZOOM, MAX_ZOOM),
      }
      : null,
  };
}

function readPersistedTreeUiState(storageKey) {
  if (!storageKey) {
    return null;
  }
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    return sanitizePersistedTreeUiState(parsed);
  } catch {
    return null;
  }
}

function normalizeAddedAt(value) {
  if (isValidNumber(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return NaN;
}

function escapeHtml(input) {
  return String(input)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatAddedAt(value) {
  const safe = isValidNumber(value) ? value : Date.now();
  return new Date(safe).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function createNoopController() {
  return {
    setData() {},
    setCycleRule() {},
    getDashboardSummary() {
      return null;
    },
    getInteractionSettings() {
      return {
        reverseTrackpadMovement: false,
        trackpadZoomSensitivity: DEFAULT_TRACKPAD_ZOOM_SENSITIVITY,
      };
    },
    updateInteractionSettings() {
      return {
        reverseTrackpadMovement: false,
        trackpadZoomSensitivity: DEFAULT_TRACKPAD_ZOOM_SENSITIVITY,
      };
    },
    fitToView() {},
    resetView() {},
    enterFullscreen() {},
    exitFullscreen() {},
    destroy() {},
  };
}

function isCycleEligible(node, rule) {
  return node.leftPv >= rule.leftPvThreshold && node.rightPv >= rule.rightPvThreshold;
}

function formatStatus(status) {
  return status === 'active' ? 'Active' : 'Inactive';
}

function formatMemberHandle(memberCode) {
  const normalizedCode = String(memberCode || '').trim().replace(/^@+/, '');
  return normalizedCode ? `@${normalizedCode}` : '@unknown';
}

function normalizeNodePopupKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');
}

function sanitizeNodePopupBadgeVisibility(value) {
  const safeValue = value && typeof value === 'object' ? value : {};
  const normalizeFlag = (rawValue, fallbackValue) => {
    if (typeof rawValue === 'boolean') {
      return rawValue;
    }
    if (typeof rawValue === 'string') {
      const normalized = normalizeNodePopupKey(rawValue);
      if (normalized === 'false' || normalized === '0' || normalized === 'no') {
        return false;
      }
      if (normalized === 'true' || normalized === '1' || normalized === 'yes') {
        return true;
      }
    }
    if (typeof rawValue === 'number') {
      if (rawValue === 0) {
        return false;
      }
      if (rawValue === 1) {
        return true;
      }
    }
    return fallbackValue;
  };

  return {
    rank: normalizeFlag(safeValue.rank, true),
    title: normalizeFlag(safeValue.title, true),
    extra: normalizeFlag(safeValue.extra, true),
  };
}

function sanitizeNodePopupIconPath(value) {
  const candidatePath = String(value || '').trim();
  return PROFILE_ICON_PATH_PATTERN.test(candidatePath) ? candidatePath : '';
}

function sanitizeNodePopupHoverSubtitle(value) {
  const candidateSubtitle = String(value ?? '').replace(/\r/g, '').trim();
  return candidateSubtitle;
}

function resolveNodePopupTitleIconPath(titleLabel, rankLabel, isLightTheme) {
  const normalizedTitleKey = normalizeNodePopupKey(titleLabel);
  if (!normalizedTitleKey) {
    return '';
  }

  if (Object.prototype.hasOwnProperty.call(PROFILE_EVENT_TITLE_ICON_BASE_PATH_BY_KEY, normalizedTitleKey)) {
    const basePath = PROFILE_EVENT_TITLE_ICON_BASE_PATH_BY_KEY[normalizedTitleKey];
    return `${basePath}${isLightTheme ? '-light' : ''}.svg`;
  }

  const fallbackIconKey = resolveAchievementIconKeyFromRankLabel(titleLabel || rankLabel);
  if (!fallbackIconKey || fallbackIconKey === 'placeholder') {
    return '';
  }
  return getNodeRankAchievementIconPath(titleLabel || rankLabel, isLightTheme);
}

function resolveNodePopupHeaderIconEntries(node, isLightTheme) {
  if (!node || shouldHideNodeRankAndCountry(node)) {
    return [];
  }

  const entries = [];
  const badgeVisibility = sanitizeNodePopupBadgeVisibility(node?.profileBadgeVisibility);
  const rankLabel = getNodeRankLabel(node);
  const rankHoverSubtitle = sanitizeNodePopupHoverSubtitle(
    node?.profileBadgeRankSubtitle || node?.profileRankSubtitle || '',
  ) || (
    isValidNumber(node?.addedAt)
      ? `Subscriber since ${formatAddedAt(node.addedAt)}`
      : 'Subscriber since --'
  );

  if (badgeVisibility.rank) {
    const explicitRankIconPath = sanitizeNodePopupIconPath(
      node?.profileBadgeRankIconPath || node?.profileRankIconPath || '',
    );
    if (explicitRankIconPath) {
      entries.push({
        key: 'rank',
        iconPath: explicitRankIconPath,
        hoverTitle: rankLabel || 'Unranked',
        hoverSubtitle: rankHoverSubtitle,
      });
    } else {
      const rankIconKey = resolveAchievementIconKeyFromRankLabel(rankLabel);
      if (rankIconKey && rankIconKey !== 'placeholder') {
        entries.push({
          key: 'rank',
          iconPath: getNodeRankAchievementIconPath(rankLabel, isLightTheme),
          hoverTitle: rankLabel || 'Unranked',
          hoverSubtitle: rankHoverSubtitle,
        });
      }
    }
  }

  const primaryTitleLabel = String(
    node?.profileAccountTitle || node?.accountTitle || node?.title || node?.profileTitle1 || '',
  ).trim();
  const primaryTitleHoverSubtitle = sanitizeNodePopupHoverSubtitle(
    node?.profileBadgeTitleSubtitle || node?.profileTitleSubtitle || node?.profileTitle1Subtitle || '',
  ) || 'Title 1';
  if (badgeVisibility.title && primaryTitleLabel) {
    const explicitTitleIconPath = sanitizeNodePopupIconPath(
      node?.profileBadgeTitleIconPath || node?.profileTitleIconPath || node?.profileTitle1IconPath || '',
    );
    if (explicitTitleIconPath) {
      entries.push({
        key: 'title',
        iconPath: explicitTitleIconPath,
        hoverTitle: primaryTitleLabel,
        hoverSubtitle: primaryTitleHoverSubtitle,
      });
    } else {
      const resolvedPrimaryTitleIconPath = resolveNodePopupTitleIconPath(
        primaryTitleLabel,
        rankLabel,
        isLightTheme,
      );
      if (resolvedPrimaryTitleIconPath) {
        entries.push({
          key: 'title',
          iconPath: resolvedPrimaryTitleIconPath,
          hoverTitle: primaryTitleLabel,
          hoverSubtitle: primaryTitleHoverSubtitle,
        });
      }
    }
  }

  const secondaryTitleLabel = String(
    node?.profileAccountTitleSecondary || node?.accountTitleSecondary || node?.profileTitle2 || '',
  ).trim();
  const secondaryTitleHoverSubtitle = sanitizeNodePopupHoverSubtitle(
    node?.profileBadgeExtraSubtitle || node?.profileExtraSubtitle || node?.profileTitle2Subtitle || '',
  ) || 'Title 2';
  if (badgeVisibility.extra && secondaryTitleLabel) {
    const explicitSecondaryTitleIconPath = sanitizeNodePopupIconPath(
      node?.profileBadgeExtraIconPath || node?.profileExtraIconPath || node?.profileTitle2IconPath || '',
    );
    if (explicitSecondaryTitleIconPath) {
      entries.push({
        key: 'extra',
        iconPath: explicitSecondaryTitleIconPath,
        hoverTitle: secondaryTitleLabel,
        hoverSubtitle: secondaryTitleHoverSubtitle,
      });
    } else {
      const resolvedSecondaryTitleIconPath = resolveNodePopupTitleIconPath(
        secondaryTitleLabel,
        rankLabel,
        isLightTheme,
      );
      if (resolvedSecondaryTitleIconPath) {
        entries.push({
          key: 'extra',
          iconPath: resolvedSecondaryTitleIconPath,
          hoverTitle: secondaryTitleLabel,
          hoverSubtitle: secondaryTitleHoverSubtitle,
        });
      }
    }
  }

  return entries;
}

function isNodeAnonymized(node) {
  const normalizedName = String(node?.name || '').trim().toLowerCase();
  const normalizedMemberCode = String(node?.memberCode || '').trim().toLowerCase();

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

function isOutsideOrganizationSpilloverNode(node) {
  // In scoped user trees, outside-source spillovers typically lose a resolvable sponsor id.
  return Boolean(node?.isSpillover && node?.placementParentId && !node?.sponsorId);
}

function shouldApplyNodePrivacyMask(node) {
  if (!node) {
    return false;
  }
  return isNodeAnonymized(node) || isOutsideOrganizationSpilloverNode(node);
}

function shouldHideNodeRankAndCountry(node) {
  if (!node) {
    return false;
  }
  return shouldApplyNodePrivacyMask(node);
}

function truncateNodeLabel(value, maxLength = 22) {
  const text = String(value || '').trim();
  if (!text) {
    return '';
  }
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, Math.max(1, maxLength - 3))}...`;
}

function resolveNodePopupDisplayName(node, maxLength = 28) {
  const rawName = String(node?.name || '').trim();
  let candidate = rawName;

  if (!candidate || candidate.toLowerCase() === 'you') {
    candidate = String(node?.memberCode || node?.id || 'Member').trim().replace(/^@+/, '');
  }

  if (!candidate) {
    return 'Member';
  }

  if (candidate.length > maxLength) {
    const [firstName] = candidate.split(/\s+/).filter(Boolean);
    if (firstName && firstName.length <= maxLength) {
      candidate = firstName;
    }
  }

  return truncateNodeLabel(candidate, maxLength);
}

function getNodeInitials(value) {
  const text = String(value || '').trim();
  if (!text) {
    return '?';
  }

  const parts = text
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return text.slice(0, 2).toUpperCase();
}

function normalizeCountryFlag(value) {
  const rawValue = String(value || '').trim();
  if (!rawValue) {
    return DEFAULT_COUNTRY_FLAG_CODE;
  }

  if (COUNTRY_FLAG_CODE_BY_EMOJI[rawValue]) {
    return COUNTRY_FLAG_CODE_BY_EMOJI[rawValue];
  }

  const normalizedValue = rawValue.toLowerCase();
  if (/^[a-z]{2}$/.test(normalizedValue)) {
    return normalizedValue;
  }
  if (/^fi-[a-z]{2}$/.test(normalizedValue)) {
    return normalizedValue.slice(3);
  }
  if (/^[a-z]{2}\.svg$/.test(normalizedValue)) {
    return normalizedValue.slice(0, 2);
  }

  return DEFAULT_COUNTRY_FLAG_CODE;
}

function getCountryFlagCssClass(countryCode) {
  const normalizedCountryCode = normalizeCountryFlag(countryCode);
  return `fi fi-${normalizedCountryCode}`;
}

function getCountryFlagSvgAssetPath(countryCode) {
  return `/node_modules/flag-icons/flags/4x3/${normalizeCountryFlag(countryCode)}.svg`;
}

function getCountryCodeDisplay(countryCode) {
  return normalizeCountryFlag(countryCode).toUpperCase();
}

function getNodeRankLabel(node) {
  const rank = typeof node?.rank === 'string' ? node.rank.trim() : '';
  if (!rank || rank.toLowerCase() === 'starter') {
    return 'Personal Pack';
  }
  return rank;
}

function resolveAchievementIconKeyFromRankLabel(rankLabel) {
  const normalizedRank = String(rankLabel || '').trim().toLowerCase();
  if (!normalizedRank || normalizedRank === 'private') {
    return 'placeholder';
  }
  if (normalizedRank.includes('black diamond')) {
    return 'black-diamond';
  }
  if (normalizedRank.includes('blue diamond')) {
    return 'blue-diamond';
  }
  if (normalizedRank.includes('diamond')) {
    return 'diamond';
  }
  if (normalizedRank.includes('double crown')) {
    return 'double-crown';
  }
  if (normalizedRank.includes('royal crown')) {
    return 'royal-crown';
  }
  if (normalizedRank.includes('crown')) {
    return 'crown';
  }
  if (normalizedRank.includes('emerald')) {
    return 'emerald';
  }
  if (normalizedRank.includes('sapphire')) {
    return 'sapphire';
  }
  if (normalizedRank.includes('ruby')) {
    return 'ruby';
  }
  if (normalizedRank.includes('legacy')) {
    return 'legacy';
  }
  if (normalizedRank.includes('infinity') || normalizedRank.includes('achiever')) {
    return 'infinity';
  }
  if (normalizedRank.includes('business')) {
    return 'business';
  }
  if (normalizedRank.includes('personal') || normalizedRank.includes('starter')) {
    return 'personal';
  }
  return 'placeholder';
}

function getNodeRankAchievementIconPath(rankLabel, isLightTheme) {
  const iconKey = resolveAchievementIconKeyFromRankLabel(rankLabel);
  const iconSuffix = isLightTheme ? '-light' : '';
  return `/brand_assets/Icons/Achievements/${iconKey}${iconSuffix}.svg`;
}

function resolveBaseBvFromRankLabel(rankLabel) {
  const normalizedRankLabel = String(rankLabel || '').trim().toLowerCase();
  if (!normalizedRankLabel) {
    return 0;
  }
  if (normalizedRankLabel.includes('legacy')) {
    return 960;
  }
  if (normalizedRankLabel.includes('infinity') || normalizedRankLabel.includes('achiever')) {
    return 560;
  }
  if (normalizedRankLabel.includes('business')) {
    return 360;
  }
  if (normalizedRankLabel.includes('personal') || normalizedRankLabel.includes('starter')) {
    return 192;
  }
  return 0;
}

function getNodeBaseBv(node) {
  const personalBv = getNodePersonalBv(node);
  if (personalBv > 0) {
    return personalBv;
  }
  return resolveBaseBvFromRankLabel(getNodeRankLabel(node));
}

function formatSecondaryMetricText(node, mode) {
  if (mode === 'rank') {
    return getNodeRankLabel(node);
  }
  return `Cycles ${node.cycles}`;
}

function resolveSelectedSecondaryMetricValue(node, mode) {
  if (!node) {
    return '-';
  }
  if (mode === 'rank') {
    const rankLabel = getNodeRankLabel(node);
    const baseBv = getNodeBaseBv(node);
    return `${rankLabel} | Base BV: ${baseBv.toLocaleString()} BV`;
  }
  return `${node.cycles}`;
}

function formatNodeReference(node) {
  if (!node) {
    return '-';
  }
  return `${node.name} (${formatMemberHandle(node.memberCode)})`;
}

function sanitizeVolume(value) {
  return isValidNumber(value) ? Math.max(0, Math.floor(value)) : 0;
}

function normalizeSide(value) {
  return value === 'left' || value === 'right' ? value : undefined;
}

function normalizeBusinessCenterNodeType(value) {
  const normalizedNodeType = String(value || '').trim().toLowerCase();
  if (normalizedNodeType === 'business_center' || normalizedNodeType === 'business-center') {
    return 'business_center';
  }
  if (normalizedNodeType === 'staff_admin' || normalizedNodeType === 'staff-admin') {
    return 'staff_admin';
  }
  if (
    normalizedNodeType === 'legacy_placeholder'
    || normalizedNodeType === 'legacy-placeholder'
    || normalizedNodeType === 'placeholder'
  ) {
    return 'legacy_placeholder';
  }
  return 'main_center';
}

function getNodePersonalBv(node) {
  if (!node || typeof node !== 'object') {
    return 0;
  }
  return sanitizeVolume(node.leftPersonalPv) + sanitizeVolume(node.rightPersonalPv);
}

function getDirectLegBv(node, side, nodes) {
  if (!node || typeof node !== 'object' || !nodes || typeof nodes !== 'object') {
    return 0;
  }

  const sponsorId = String(node.id || '').trim();
  if (!sponsorId) {
    return 0;
  }

  const normalizedSide = side === 'right' ? 'right' : 'left';
  let totalDirectPersonalBv = 0;

  for (const candidateNode of Object.values(nodes)) {
    if (!candidateNode || candidateNode.id === sponsorId) {
      continue;
    }
    if (candidateNode.sponsorId !== sponsorId) {
      continue;
    }

    let candidateSponsorLeg = candidateNode.sponsorLeg;
    if (candidateSponsorLeg !== 'left' && candidateSponsorLeg !== 'right') {
      // Fallback: infer leg from placement path when sponsor leg is missing.
      let currentNode = candidateNode;
      const visited = new Set();
      while (currentNode && currentNode.placementParentId && !visited.has(currentNode.id)) {
        visited.add(currentNode.id);
        if (currentNode.placementParentId === sponsorId) {
          candidateSponsorLeg = currentNode.placementSide === 'right' ? 'right' : 'left';
          break;
        }
        currentNode = nodes[currentNode.placementParentId];
      }
    }

    if (candidateSponsorLeg !== normalizedSide) {
      continue;
    }

    totalDirectPersonalBv += getNodePersonalBv(candidateNode);
  }

  return sanitizeVolume(totalDirectPersonalBv);
}

function getLegBvBreakdown(node, side, nodes) {
  const teamBv = side === 'right' ? sanitizeVolume(node?.rightPv) : sanitizeVolume(node?.leftPv);
  const directBv = getDirectLegBv(node, side, nodes);
  const downlineBv = Math.max(0, teamBv - directBv);
  return {
    teamBv,
    directBv,
    downlineBv,
  };
}

function getNodeDisplayLegVolumes(node) {
  const leftBv = sanitizeVolume(node?.leftPv);
  const rightBv = sanitizeVolume(node?.rightPv);
  if (!shouldApplyNodePrivacyMask(node)) {
    return { leftBv, rightBv };
  }

  const personalBv = getNodePersonalBv(node);
  const placementSide = node?.placementSide === 'right' ? 'right' : 'left';
  return {
    leftBv: leftBv + (placementSide === 'left' ? personalBv : 0),
    rightBv: rightBv + (placementSide === 'right' ? personalBv : 0),
  };
}

function normalizeNode(id, node) {
  const leftPersonalPv = sanitizeVolume(
    node?.leftPersonalPv ?? node?.leftPersonalVolume ?? node?.leftPv,
  );
  const rightPersonalPv = sanitizeVolume(
    node?.rightPersonalPv ?? node?.rightPersonalVolume ?? node?.rightPv,
  );
  const businessCenterNodeType = normalizeBusinessCenterNodeType(node?.businessCenterNodeType);
  const businessCenterIndex = sanitizeVolume(node?.businessCenterIndex);
  const isBusinessCenterPlaceholder = Boolean(node?.isBusinessCenterPlaceholder)
    || businessCenterNodeType === 'legacy_placeholder';
  const profileBadgeVisibility = node?.profileBadgeVisibility && typeof node.profileBadgeVisibility === 'object'
    ? sanitizeNodePopupBadgeVisibility(node.profileBadgeVisibility)
    : undefined;
  const profileBadgeRankIconPath = sanitizeNodePopupIconPath(
    node?.profileBadgeRankIconPath || node?.profileRankIconPath || '',
  );
  const profileBadgeTitleIconPath = sanitizeNodePopupIconPath(
    node?.profileBadgeTitleIconPath || node?.profileTitleIconPath || node?.profileTitle1IconPath || '',
  );
  const profileBadgeExtraIconPath = sanitizeNodePopupIconPath(
    node?.profileBadgeExtraIconPath || node?.profileExtraIconPath || node?.profileTitle2IconPath || '',
  );
  const profileCoverUrl = String(
    node?.profileCoverUrl || node?.coverUrl || node?.coverDataUrl || '',
  ).trim();
  const profileBadgeRankSubtitle = sanitizeNodePopupHoverSubtitle(
    node?.profileBadgeRankSubtitle || node?.profileRankSubtitle || '',
  );
  const profileBadgeTitleSubtitle = sanitizeNodePopupHoverSubtitle(
    node?.profileBadgeTitleSubtitle || node?.profileTitleSubtitle || node?.profileTitle1Subtitle || '',
  );
  const profileBadgeExtraSubtitle = sanitizeNodePopupHoverSubtitle(
    node?.profileBadgeExtraSubtitle || node?.profileExtraSubtitle || node?.profileTitle2Subtitle || '',
  );

  return {
    id: String(node?.id || id),
    memberCode: String(node?.memberCode || `MEM-${id}`),
    status: node?.status === 'inactive' ? 'inactive' : 'active',
    name: String(node?.name || node?.memberCode || `Member ${id}`),
    leftPersonalPv,
    rightPersonalPv,
    leftPv: 0,
    rightPv: 0,
    cycles: 0,
    addedAt: normalizeAddedAt(node?.addedAt),
    spilloverLeftPv: 0,
    spilloverRightPv: 0,
    rank: typeof node?.rank === 'string' ? node.rank : undefined,
    countryFlag: normalizeCountryFlag(node?.countryFlag),
    profileCoverUrl,
    profileAccountTitle: typeof node?.profileAccountTitle === 'string'
      ? node.profileAccountTitle
      : (typeof node?.accountTitle === 'string' ? node.accountTitle : undefined),
    profileAccountTitleSecondary: typeof node?.profileAccountTitleSecondary === 'string'
      ? node.profileAccountTitleSecondary
      : (typeof node?.accountTitleSecondary === 'string' ? node.accountTitleSecondary : undefined),
    profileBadgeVisibility,
    profileBadgeRankIconPath,
    profileBadgeTitleIconPath,
    profileBadgeExtraIconPath,
    profileBadgeRankSubtitle,
    profileBadgeTitleSubtitle,
    profileBadgeExtraSubtitle,
    leftChildId: typeof node?.leftChildId === 'string' ? node.leftChildId : undefined,
    rightChildId: typeof node?.rightChildId === 'string' ? node.rightChildId : undefined,
    sponsorId: typeof node?.sponsorId === 'string' ? node.sponsorId : undefined,
    sponsorLeg: normalizeSide(node?.sponsorLeg),
    placementParentId: typeof node?.placementParentId === 'string' ? node.placementParentId : undefined,
    placementSide: normalizeSide(node?.placementSide),
    isSpillover: Boolean(node?.isSpillover),
    businessCenterNodeType,
    businessCenterIndex,
    isBusinessCenterPlaceholder,
  };
}

function isBusinessCenterPlaceholderNode(node = {}) {
  return Boolean(node?.isBusinessCenterPlaceholder)
    || normalizeBusinessCenterNodeType(node?.businessCenterNodeType) === 'legacy_placeholder';
}

function isBusinessCenterAuxiliaryNode(node = {}) {
  const nodeType = normalizeBusinessCenterNodeType(node?.businessCenterNodeType);
  const centerIndex = sanitizeVolume(node?.businessCenterIndex);
  return nodeType === 'business_center' || centerIndex > 0;
}

function isBusinessCenterKpiExcludedNode(node = {}) {
  const nodeType = normalizeBusinessCenterNodeType(node?.businessCenterNodeType);
  return (
    nodeType === 'staff_admin'
    || isBusinessCenterPlaceholderNode(node)
    || isBusinessCenterAuxiliaryNode(node)
  );
}

function resolveSponsorLeg(nodeId, sponsorId, nodes, placementByChild) {
  if (!nodeId || !sponsorId || !nodes[nodeId] || !nodes[sponsorId]) {
    return undefined;
  }

  let currentId = nodeId;
  const visited = new Set([currentId]);
  while (true) {
    const placement = placementByChild.get(currentId);
    if (!placement) {
      return undefined;
    }
    if (placement.parentId === sponsorId) {
      return placement.side;
    }
    if (visited.has(placement.parentId)) {
      return undefined;
    }
    visited.add(placement.parentId);
    currentId = placement.parentId;
  }
}

function deriveBusinessVolumes(nodes, rootId, cycleRule) {
  const nodeIds = Object.keys(nodes);
  const propagatedCache = new Map();
  const visiting = new Set();
  const placementLegCredits = new Map();
  const sponsorOnlyLegCredits = new Map();

  for (const nodeId of nodeIds) {
    placementLegCredits.set(nodeId, { left: 0, right: 0 });
    sponsorOnlyLegCredits.set(nodeId, { left: 0, right: 0 });
    const node = nodes[nodeId];
    node.leftPv = 0;
    node.rightPv = 0;
    node.cycles = 0;
    node.spilloverLeftPv = 0;
    node.spilloverRightPv = 0;
  }

  function computePropagatingSubtreeVolume(nodeId) {
    if (!nodeId || !nodes[nodeId]) {
      return 0;
    }
    if (propagatedCache.has(nodeId)) {
      return propagatedCache.get(nodeId);
    }
    if (visiting.has(nodeId)) {
      return 0;
    }

    visiting.add(nodeId);
    const node = nodes[nodeId];
    let subtotal = node.leftPersonalPv + node.rightPersonalPv;

    const legs = [
      { side: 'left', childId: node.leftChildId },
      { side: 'right', childId: node.rightChildId },
    ];

    for (const leg of legs) {
      const childId = leg.childId;
      if (!childId || !nodes[childId]) {
        continue;
      }

      const childVolume = computePropagatingSubtreeVolume(childId);
      const credits = placementLegCredits.get(nodeId);
      credits[leg.side] += childVolume;
      subtotal += childVolume;
    }

    propagatedCache.set(nodeId, subtotal);
    visiting.delete(nodeId);
    return subtotal;
  }

  computePropagatingSubtreeVolume(rootId);
  for (const nodeId of nodeIds) {
    computePropagatingSubtreeVolume(nodeId);
  }

  for (const nodeId of nodeIds) {
    const node = nodes[nodeId];
    if (!node.isSpillover || !node.sponsorId || !nodes[node.sponsorId]) {
      continue;
    }

    const sponsorCredits = sponsorOnlyLegCredits.get(node.sponsorId);
    const sponsorLeg = node.sponsorLeg === 'right' ? 'right' : 'left';
    sponsorCredits[sponsorLeg] += propagatedCache.get(nodeId) || 0;
  }

  for (const nodeId of nodeIds) {
    const node = nodes[nodeId];
    const placementCredits = placementLegCredits.get(nodeId);
    const sponsorOnlyCredits = sponsorOnlyLegCredits.get(nodeId);
    node.spilloverLeftPv = sponsorOnlyCredits.left;
    node.spilloverRightPv = sponsorOnlyCredits.right;
    node.leftPv = placementCredits.left;
    node.rightPv = placementCredits.right;
    node.cycles = Math.floor(Math.min(
      node.leftPv / cycleRule.leftPvThreshold,
      node.rightPv / cycleRule.rightPvThreshold,
    ));
  }
}

function normalizeData(data, fallbackRule) {
  if (!data || typeof data !== 'object' || !data.nodes || typeof data.nodes !== 'object') {
    return null;
  }

  /** @type {Record<string, BinaryTreeNode>} */
  const nodes = {};
  for (const [id, node] of Object.entries(data.nodes)) {
    nodes[id] = normalizeNode(id, node);
  }

  const nodeIds = Object.keys(nodes);
  if (!nodeIds.length) {
    return null;
  }

  // Ensure every node has a stable sortable timestamp for latest/oldest search mode.
  let fallbackTimestamp = Date.now() - nodeIds.length * 3600000;
  for (const nodeId of nodeIds) {
    if (!isValidNumber(nodes[nodeId].addedAt)) {
      nodes[nodeId].addedAt = fallbackTimestamp;
      fallbackTimestamp += 3600000;
    }
  }

  const placementByChild = new Map();
  for (const [parentId, node] of Object.entries(nodes)) {
    for (const leg of [
      { side: 'left', key: 'leftChildId' },
      { side: 'right', key: 'rightChildId' },
    ]) {
      const childId = node[leg.key];
      if (!childId || !nodes[childId] || childId === parentId) {
        node[leg.key] = undefined;
        continue;
      }
      if (placementByChild.has(childId)) {
        node[leg.key] = undefined;
        continue;
      }
      placementByChild.set(childId, { parentId, side: leg.side });
    }
  }

  const rootId = typeof data.rootId === 'string' && nodes[data.rootId] ? data.rootId : nodeIds[0];
  const rootPlacement = placementByChild.get(rootId);
  if (rootPlacement) {
    const rootParent = nodes[rootPlacement.parentId];
    if (rootParent) {
      if (rootPlacement.side === 'left') {
        rootParent.leftChildId = undefined;
      } else {
        rootParent.rightChildId = undefined;
      }
    }
    placementByChild.delete(rootId);
  }

  for (const nodeId of nodeIds) {
    const node = nodes[nodeId];
    const placement = placementByChild.get(nodeId);
    node.placementParentId = placement?.parentId;
    node.placementSide = placement?.side;
  }

  for (const nodeId of nodeIds) {
    const node = nodes[nodeId];
    if (nodeId === rootId) {
      node.sponsorId = undefined;
      node.sponsorLeg = undefined;
      node.isSpillover = false;
      continue;
    }

    const hadExplicitSpillover = Boolean(node.isSpillover);
    const hasResolvedSponsor = Boolean(node.sponsorId && nodes[node.sponsorId] && node.sponsorId !== nodeId);

    // Keep spillover identity when sponsor is intentionally out-of-scope (privacy-scoped user trees).
    if (!hasResolvedSponsor) {
      if (hadExplicitSpillover) {
        node.sponsorId = undefined;
      } else {
        node.sponsorId = node.placementParentId;
      }
    }

    const inferredLeg = node.sponsorId
      ? resolveSponsorLeg(nodeId, node.sponsorId, nodes, placementByChild)
      : undefined;
    if (node.sponsorId === node.placementParentId) {
      node.sponsorLeg = node.placementSide || inferredLeg || node.sponsorLeg;
    } else if (node.sponsorId) {
      node.sponsorLeg = node.sponsorLeg || inferredLeg || node.placementSide || 'left';
    } else {
      node.sponsorLeg = node.sponsorLeg || node.placementSide;
    }
    node.isSpillover = hadExplicitSpillover || Boolean(
      node.sponsorId
      && node.placementParentId
      && node.sponsorId !== node.placementParentId,
    );
  }

  const cycleRule = sanitizeCycleRule(data.cycleRule || fallbackRule);
  deriveBusinessVolumes(nodes, rootId, cycleRule);

  return {
    rootId,
    nodes,
    cycleRule,
  };
}

function buildDashboardSummary(data) {
  if (!data || typeof data !== 'object' || !data.nodes || !data.rootId) {
    return null;
  }

  const rootNode = data.nodes[data.rootId];
  if (!rootNode) {
    return null;
  }

  const nodeValues = Object.values(data.nodes);
  const kpiNodeValues = nodeValues.filter((node) => !isBusinessCenterKpiExcludedNode(node));
  const kpiDownlineNodeValues = kpiNodeValues.filter((node) => node.id !== data.rootId);
  const totalPersonalVolume = nodeValues.reduce(
    (sum, node) => sum + (node.leftPersonalPv + node.rightPersonalPv),
    0,
  );
  const totalOrganizationCycles = nodeValues.reduce(
    (sum, node) => sum + node.cycles,
    0,
  );
  const newMembersJoined = kpiDownlineNodeValues.length;
  const totalDirectSponsors = kpiDownlineNodeValues.reduce(
    (count, node) => count + (node.sponsorId === data.rootId ? 1 : 0),
    0,
  );
  const accountRank = typeof rootNode.rank === 'string' && rootNode.rank.trim()
    ? rootNode.rank.trim()
    : 'Legacy';

  return {
    rootId: data.rootId,
    nodeCount: kpiNodeValues.length,
    accountRank,
    accountPersonalVolume: rootNode.leftPersonalPv + rootNode.rightPersonalPv,
    leftLegBv: rootNode.leftPv,
    rightLegBv: rootNode.rightPv,
    accountTotalCycles: rootNode.cycles,
    totalAccumulatedPv: totalPersonalVolume,
    newMembersJoined,
    totalDirectSponsors,
    totalPersonalVolume,
    totalOrganizationCycles,
    cycleRule: { ...data.cycleRule },
  };
}

/**
 * @param {BinaryTreeData} data
 * @param {CycleRule=} fallbackRule
 * @returns {null | {
 * rootId: string,
 * nodeCount: number,
 * accountRank: string,
 * accountPersonalVolume: number,
 * leftLegBv: number,
 * rightLegBv: number,
 * accountTotalCycles: number,
 * totalAccumulatedPv: number,
 * newMembersJoined: number,
 * totalDirectSponsors: number,
 * totalPersonalVolume: number,
 * totalOrganizationCycles: number,
 * cycleRule: CycleRule,
 * }}
 */
export function summarizeBinaryTreeData(data, fallbackRule = DEFAULT_CYCLE_RULE) {
  const normalized = normalizeData(data, fallbackRule);
  return buildDashboardSummary(normalized);
}

function computeLayout(data, options = {}) {
  const queue = [{ id: data.rootId, depth: 0, slot: 0 }];
  const seen = new Set();
  const meta = new Map();
  const reserveMissingChildDepth = options.reserveMissingChildDepth === true;
  const requestedWidthDepthCap = Number(options.widthDepthCap);
  const widthDepthCap = Number.isFinite(requestedWidthDepthCap)
    ? Math.max(0, Math.floor(requestedWidthDepthCap))
    : null;
  const requestedSlotWidth = Number(options.slotWidth);
  const slotWidth = Number.isFinite(requestedSlotWidth)
    ? clamp(Math.round(requestedSlotWidth), 136, 360)
    : 192;
  const originY = 60;
  const levelGap = 188;
  const depthCap = MAX_LAYOUT_DEPTH_FOR_WIDTH;
  const shouldPreventOverlap = options.preventOverlap !== false && !reserveMissingChildDepth;
  let maxDepth = 0;

  while (queue.length) {
    const current = queue.shift();
    if (seen.has(current.id)) {
      continue;
    }

    const node = data.nodes[current.id];
    if (!node) {
      continue;
    }

    seen.add(current.id);
    meta.set(current.id, { depth: current.depth, slot: current.slot });
    maxDepth = Math.max(maxDepth, current.depth);

    if (node.leftChildId) {
      queue.push({ id: node.leftChildId, depth: current.depth + 1, slot: current.slot * 2 });
    }
    if (node.rightChildId) {
      queue.push({ id: node.rightChildId, depth: current.depth + 1, slot: current.slot * 2 + 1 });
    }
  }

  if (!meta.size) {
    return {
      positions: new Map(),
      meta,
      bounds: { minX: 0, minY: 0, maxX: 1, maxY: 1 },
      nodeIds: [],
      layoutWidth: 1,
      levelGap,
      originY,
      depthCap,
    };
  }

  if (reserveMissingChildDepth) {
    for (const [nodeId, point] of meta.entries()) {
      const node = data.nodes[nodeId];
      if (!node) {
        continue;
      }

      const hasLeftChild = Boolean(node.leftChildId && data.nodes[node.leftChildId]);
      const hasRightChild = Boolean(node.rightChildId && data.nodes[node.rightChildId]);
      if (!hasLeftChild || !hasRightChild) {
        maxDepth = Math.max(maxDepth, point.depth + 1);
      }
    }
  }

  const effectiveMaxDepth = Math.min(maxDepth, depthCap);
  const effectiveMaxDepthForWidth = (
    !reserveMissingChildDepth
    && Number.isFinite(widthDepthCap)
  )
    ? Math.min(effectiveMaxDepth, widthDepthCap)
    : effectiveMaxDepth;
  const layoutWidth = Math.max(980, (2 ** Math.max(effectiveMaxDepthForWidth, 1)) * slotWidth);
  const positions = new Map();
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const [id, point] of meta.entries()) {
    const effectiveDepth = Math.min(point.depth, depthCap);
    const slotsOnLevel = 2 ** effectiveDepth;
    const overflowDepth = point.depth - effectiveDepth;
    const compressedSlot = overflowDepth > 0
      ? Math.floor(point.slot / (2 ** overflowDepth))
      : point.slot;
    const boundedSlot = clamp(compressedSlot, 0, Math.max(0, slotsOnLevel - 1));
    const x = ((boundedSlot + 0.5) / slotsOnLevel) * layoutWidth;
    const y = originY + point.depth * levelGap;
    positions.set(id, { x, y });
    minX = Math.min(minX, x - NODE_WIDTH / 2);
    minY = Math.min(minY, y - NODE_HEIGHT / 2);
    maxX = Math.max(maxX, x + NODE_WIDTH / 2);
    maxY = Math.max(maxY, y + NODE_HEIGHT / 2);
  }

  if (shouldPreventOverlap && positions.size > 1) {
    const baseMinHorizontalGap = (TREE_SIMPLE_NODE_RADIUS * 2) + 8;
    /** @type {Map<number, Array<{id: string, originalX: number, adjustedX: number}>>} */
    const depthBuckets = new Map();

    for (const [id, point] of meta.entries()) {
      const position = positions.get(id);
      if (!position) {
        continue;
      }
      const depth = Number.isFinite(point?.depth) ? point.depth : 0;
      const bucket = depthBuckets.get(depth) || [];
      bucket.push({ id, originalX: position.x, adjustedX: position.x });
      depthBuckets.set(depth, bucket);
    }

    for (const [bucketDepth, bucket] of depthBuckets.entries()) {
      if (bucket.length < 2) {
        continue;
      }
      const deepDepthDelta = Math.max(0, bucketDepth - TREE_DEEP_X_SPACING_START_DEPTH);
      const growthSteps = (deepDepthDelta * (deepDepthDelta + 1)) / 2;
      const depthExtraSpacing = (deepDepthDelta * TREE_DEEP_X_SPACING_PER_DEPTH)
        + (growthSteps * TREE_DEEP_X_SPACING_GROWTH);
      const minHorizontalGap = clamp(
        baseMinHorizontalGap + depthExtraSpacing,
        baseMinHorizontalGap,
        baseMinHorizontalGap + 220,
      );
      bucket.sort((left, right) => {
        if (left.originalX !== right.originalX) {
          return left.originalX - right.originalX;
        }
        return left.id.localeCompare(right.id);
      });

      let previousX = Number.NEGATIVE_INFINITY;
      for (const entry of bucket) {
        const nextX = Math.max(entry.originalX, previousX + minHorizontalGap);
        entry.adjustedX = nextX;
        previousX = nextX;
      }

      const originalCenter = (bucket[0].originalX + bucket[bucket.length - 1].originalX) / 2;
      const adjustedCenter = (bucket[0].adjustedX + bucket[bucket.length - 1].adjustedX) / 2;
      const centerOffset = originalCenter - adjustedCenter;

      for (const entry of bucket) {
        const position = positions.get(entry.id);
        if (!position) {
          continue;
        }
        position.x = entry.adjustedX + centerOffset;
      }
    }

    minX = Number.POSITIVE_INFINITY;
    minY = Number.POSITIVE_INFINITY;
    maxX = Number.NEGATIVE_INFINITY;
    maxY = Number.NEGATIVE_INFINITY;
    for (const position of positions.values()) {
      minX = Math.min(minX, position.x - NODE_WIDTH / 2);
      minY = Math.min(minY, position.y - NODE_HEIGHT / 2);
      maxX = Math.max(maxX, position.x + NODE_WIDTH / 2);
      maxY = Math.max(maxY, position.y + NODE_HEIGHT / 2);
    }
  }

  return {
    positions,
    meta,
    bounds: { minX, minY, maxX, maxY },
    nodeIds: Array.from(meta.keys()),
    layoutWidth,
    levelGap,
    originY,
    depthCap,
  };
}

function createSyntheticNode(depth, index) {
  const seed = depth * 97 + index * 53;
  const leftPersonalPv = 8 + ((seed * 11) % 46);
  const rightPersonalPv = 6 + ((seed * 13) % 44);
  return {
    leftPersonalPv,
    rightPersonalPv,
    status: (depth >= 3 && index % 5 === 0) ? 'inactive' : 'active',
  };
}

function createMockMemberName(depth, index) {
  const firstNames = ['Avery', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Skyler', 'Riley', 'Quinn', 'Drew', 'Parker'];
  const lastNames = ['Stone', 'Reed', 'Brooks', 'Hayes', 'Mills', 'Shaw', 'Knight', 'Cole', 'Blake', 'Foster'];
  const first = firstNames[(depth * 5 + index) % firstNames.length];
  const last = lastNames[(depth * 3 + index * 2) % lastNames.length];
  return `${first} ${last}`;
}

function getSponsorLegFromOrdinal(nodeOrdinal, sponsorOrdinal) {
  if (!isValidNumber(nodeOrdinal) || !isValidNumber(sponsorOrdinal) || nodeOrdinal <= 0 || sponsorOrdinal < 0) {
    return undefined;
  }

  let current = nodeOrdinal;
  while (current > 0) {
    const parent = Math.floor((current - 1) / 2);
    if (parent === sponsorOrdinal) {
      return current === sponsorOrdinal * 2 + 1 ? 'left' : 'right';
    }
    current = parent;
  }
  return undefined;
}

/**
 * @param {{ targetNodes?: number, maxDepth?: number }=} options
 * @returns {BinaryTreeData}
 */
export function createMockBinaryTreeData(options = {}) {
  const now = Date.now();
  const hasTargetNodes = isValidNumber(options.targetNodes);
  const targetNodeCount = hasTargetNodes ? Math.max(1, Math.floor(options.targetNodes)) : null;
  const maxDepth = isValidNumber(options.maxDepth) ? Math.max(0, Math.floor(options.maxDepth)) : 5;
  const totalNodes = targetNodeCount || (2 ** (maxDepth + 1) - 1);
  let createdIndex = 0;
  /** @type {Record<string, BinaryTreeNode>} */
  const nodes = {};

  const idsByOrdinal = [];

  for (let ordinal = 0; ordinal < totalNodes; ordinal += 1) {
    const depth = Math.floor(Math.log2(ordinal + 1));
    const index = ordinal - (2 ** depth - 1);
    const id = depth === 0 ? 'root' : `n-${depth}-${index}`;
    idsByOrdinal.push(id);

    const synthetic = createSyntheticNode(depth, index);
    nodes[id] = {
      id,
      memberCode: depth === 0 ? 'M-ROOT' : `M-${depth}${String(index).padStart(2, '0')}`,
      name: depth === 0 ? 'Root Leader' : createMockMemberName(depth, index),
      status: synthetic.status,
      leftPersonalPv: synthetic.leftPersonalPv,
      rightPersonalPv: synthetic.rightPersonalPv,
      addedAt: now - (totalNodes - createdIndex) * 3600000,
    };
    createdIndex += 1;
  }

  for (let ordinal = 0; ordinal < totalNodes; ordinal += 1) {
    const parentId = idsByOrdinal[ordinal];
    const parent = nodes[parentId];
    const leftOrdinal = ordinal * 2 + 1;
    const rightOrdinal = ordinal * 2 + 2;

    if (leftOrdinal < totalNodes) {
      parent.leftChildId = idsByOrdinal[leftOrdinal];
    }
    if (rightOrdinal < totalNodes) {
      parent.rightChildId = idsByOrdinal[rightOrdinal];
    }
  }

  for (let ordinal = 1; ordinal < totalNodes; ordinal += 1) {
    const node = nodes[idsByOrdinal[ordinal]];
    const parentOrdinal = Math.floor((ordinal - 1) / 2);
    const depth = Math.floor(Math.log2(ordinal + 1));
    let sponsorOrdinal = parentOrdinal;

    // Create deterministic spillover sponsorship while keeping balanced placement.
    if (depth >= 3 && ordinal % 7 === 0) {
      sponsorOrdinal = 0;
    } else if (depth >= 4 && ordinal % 11 === 0) {
      sponsorOrdinal = Math.floor((parentOrdinal - 1) / 2);
    } else if (depth >= 5 && ordinal % 13 === 0) {
      sponsorOrdinal = Math.floor((Math.floor((parentOrdinal - 1) / 2) - 1) / 2);
    }

    sponsorOrdinal = clamp(sponsorOrdinal, 0, parentOrdinal);
    const sponsorId = idsByOrdinal[sponsorOrdinal];
    const sponsorLeg = getSponsorLegFromOrdinal(ordinal, sponsorOrdinal);
    node.sponsorId = sponsorId;
    node.sponsorLeg = sponsorLeg;
    node.isSpillover = sponsorOrdinal !== parentOrdinal;
  }

  return {
    rootId: 'root',
    nodes,
    cycleRule: { ...DEFAULT_CYCLE_RULE },
  };
}

/**
 * @param {Object=} options
 * @returns {{
 * setData: (data: BinaryTreeData) => void,
 * setCycleRule: (rule: CycleRule) => void,
 * getDashboardSummary: () => null | {
 *   rootId: string,
 *   nodeCount: number,
 *   accountRank: string,
 *   accountPersonalVolume: number,
 *   leftLegBv: number,
 *   rightLegBv: number,
 *   accountTotalCycles: number,
 *   totalAccumulatedPv: number,
 *   newMembersJoined: number,
 *   totalDirectSponsors: number,
 *   totalPersonalVolume: number,
 *   totalOrganizationCycles: number,
 *   cycleRule: CycleRule,
 * },
 * getInteractionSettings: () => {
 *   reverseTrackpadMovement: boolean,
 *   trackpadZoomSensitivity: number,
 * },
 * updateInteractionSettings: (settings?: {
 *   reverseTrackpadMovement?: boolean,
 *   trackpadZoomSensitivity?: number,
 * }) => {
 *   reverseTrackpadMovement: boolean,
 *   trackpadZoomSensitivity: number,
 * },
 * fitToView: () => void,
 * resetView: () => void,
 * enterFullscreen: () => void,
 * exitFullscreen: () => void,
 * destroy: () => void,
 * }}
 */
export function initBinaryTree(options = {}) {
  applyTreeThemePalette(resolveRuntimeThemeKey());

  const config = {
    panelId: 'binary-tree-panel',
    headerBarId: 'tree-header-bar',
    detailPanelsId: 'tree-detail-panels',
    canvasId: 'binary-tree-canvas',
    minimapPanelId: 'tree-minimap-panel',
    minimapCanvasId: 'tree-minimap-canvas',
    minimapSettingsWrapId: 'tree-minimap-settings-wrap',
    minimapSettingsToggleId: 'tree-minimap-settings-toggle',
    minimapSizeMenuId: 'tree-minimap-size-menu',
    minimapSizeSmallId: 'tree-minimap-size-small',
    minimapSizeMediumId: 'tree-minimap-size-medium',
    minimapSizeLargeId: 'tree-minimap-size-large',
    zoomInId: 'tree-zoom-in',
    zoomOutId: 'tree-zoom-out',
    fitId: 'tree-fit',
    resetId: 'tree-reset',
    fullscreenId: 'tree-fullscreen',
    fullscreenLabelId: 'tree-fullscreen-label',
    fullscreenServerTimeId: 'tree-fullscreen-server-time',
    fullscreenCutoffTimeId: 'tree-fullscreen-cutoff-time',
    fullscreenMetricsStackId: 'tree-fullscreen-metrics-stack',
    fullscreenMetricsDeckId: 'tree-fullscreen-metrics-deck',
    fullscreenMetricsPrevId: 'tree-fullscreen-metrics-prev',
    fullscreenMetricsNextId: 'tree-fullscreen-metrics-next',
    fullscreenMetricsDotsId: 'tree-fullscreen-metrics-dots',
    fullscreenCloseId: 'tree-fullscreen-close',
    fullscreenOverlayId: 'tree-fullscreen-overlay',
    fullscreenShellId: 'tree-fullscreen-shell',
    cycleRuleId: 'tree-cycle-rule',
    cycleSummaryId: 'tree-cycle-summary',
    searchNameId: 'tree-search-name',
    searchCycleId: 'tree-search-cycle',
    searchStatusId: 'tree-search-status',
    searchSortId: 'tree-search-sort',
    searchDirectToggleId: 'tree-search-direct-toggle',
    searchDirectToggleIconId: 'tree-search-direct-toggle-icon',
    searchDirectToggleLabelId: 'tree-search-direct-toggle-label',
    searchClearId: 'tree-search-clear',
    searchMobileCloseId: 'tree-search-mobile-close',
    searchToggleId: 'tree-search-toggle',
    searchToggleLabelId: 'tree-search-toggle-label',
    mobileSearchPillId: 'tree-mobile-search-pill',
    mobileEnrollToggleId: 'tree-mobile-enroll-toggle',
    mobileRootFocusId: 'tree-mobile-root-focus',
    mobileMinimapToggleId: 'tree-mobile-minimap-toggle',
    mobileDirectToggleId: 'tree-mobile-direct-toggle',
    mobileDirectToggleIconId: 'tree-mobile-direct-toggle-icon',
    mobileNavFurthestLeftId: 'tree-mobile-nav-furthest-left',
    mobileNavFurthestRightId: 'tree-mobile-nav-furthest-right',
    navFurthestLeftId: 'tree-nav-furthest-left',
    navFurthestRightId: 'tree-nav-furthest-right',
    toolsVisibilityToggleId: 'tree-tools-visibility-toggle',
    toolsVisibilityLabelId: 'tree-tools-visibility-label',
    detailsVisibilityToggleId: 'tree-details-visibility-toggle',
    detailsVisibilityLabelId: 'tree-details-visibility-label',
    searchResultsId: 'tree-search-results',
    searchResultsCountId: 'tree-search-results-count',
    selectedMemberId: 'tree-selected-member',
    selectedStatusId: 'tree-selected-status',
    selectedDirectSponsorCountId: 'tree-selected-direct-sponsor-count',
    selectedSponsorId: 'tree-selected-sponsor',
    selectedPlacementParentId: 'tree-selected-placement-parent',
    selectedSpilloverId: 'tree-selected-spillover',
    selectedCountryCodeId: 'tree-selected-country-code',
    selectedSpilloverLineToggleId: 'tree-selected-spillover-line-toggle',
    selectedMobileCloseId: 'tree-selected-mobile-close',
    selectedLeftId: 'tree-selected-left',
    selectedRightId: 'tree-selected-right',
    selectedCyclesId: 'tree-selected-cycles',
    selectedEligibleId: 'tree-selected-eligible',
    orgTotalPeopleId: 'tree-org-total-people',
    orgTotalBvId: 'tree-org-total-bv',
    fallbackId: 'tree-fallback-message',
    uiStateStorageKey: TREE_UI_STATE_STORAGE_KEY,
    cycleRule: DEFAULT_CYCLE_RULE,
    secondaryMetricMode: 'cycles',
    spilloverHighlightMode: 'all',
    ...options,
  };
  const secondaryMetricMode = config.secondaryMetricMode === 'rank' ? 'rank' : 'cycles';
  const spilloverHighlightMode = sanitizeSpilloverHighlightMode(config.spilloverHighlightMode);
  const isMacPlatform = isMacLikePlatform();

  const panelEl = document.getElementById(config.panelId);
  const headerBarEl = document.getElementById(config.headerBarId);
  const detailPanelsEl = document.getElementById(config.detailPanelsId);
  const canvasHostEl = document.getElementById(config.canvasId);
  if (!panelEl || !canvasHostEl) {
    return createNoopController();
  }

  const fallbackEl = document.getElementById(config.fallbackId);
  const minimapPanelEl = document.getElementById(config.minimapPanelId);
  const minimapCanvasEl = document.getElementById(config.minimapCanvasId);
  const minimapSettingsWrapEl = document.getElementById(config.minimapSettingsWrapId);
  const minimapSettingsToggleEl = document.getElementById(config.minimapSettingsToggleId);
  const minimapSizeMenuEl = document.getElementById(config.minimapSizeMenuId);
  const minimapSizeSmallEl = document.getElementById(config.minimapSizeSmallId);
  const minimapSizeMediumEl = document.getElementById(config.minimapSizeMediumId);
  const minimapSizeLargeEl = document.getElementById(config.minimapSizeLargeId);
  const overlayEl = document.getElementById(config.fullscreenOverlayId);
  const fullscreenShellEl = document.getElementById(config.fullscreenShellId);
  const overlayOriginalParent = overlayEl ? overlayEl.parentElement : null;
  const overlayOriginalNextSibling = overlayEl ? overlayEl.nextSibling : null;
  if (overlayEl && document.body && overlayEl.parentElement !== document.body) {
    // Keep fullscreen overlay rooted at <body> to avoid parent stacking/viewport clipping.
    document.body.appendChild(overlayEl);
  }
  const fullscreenBtnEl = document.getElementById(config.fullscreenId);
  const fullscreenLabelEl = document.getElementById(config.fullscreenLabelId);
  const fullscreenServerTimeEl = document.getElementById(config.fullscreenServerTimeId);
  const fullscreenCutoffTimeEl = document.getElementById(config.fullscreenCutoffTimeId);
  const fullscreenMetricsStackEl = document.getElementById(config.fullscreenMetricsStackId);
  const fullscreenMetricsDeckEl = document.getElementById(config.fullscreenMetricsDeckId);
  const fullscreenMetricsPrevEl = document.getElementById(config.fullscreenMetricsPrevId);
  const fullscreenMetricsNextEl = document.getElementById(config.fullscreenMetricsNextId);
  const fullscreenMetricsDotsEl = document.getElementById(config.fullscreenMetricsDotsId);
  const fullscreenMetricCardEls = fullscreenMetricsDeckEl
    ? Array.from(fullscreenMetricsDeckEl.querySelectorAll('[data-tree-fullscreen-metric-card]'))
    : [];
  const fullscreenCloseEl = document.getElementById(config.fullscreenCloseId);
  const zoomInBtnEl = document.getElementById(config.zoomInId);
  const zoomOutBtnEl = document.getElementById(config.zoomOutId);
  const fitBtnEl = document.getElementById(config.fitId);
  const resetBtnEl = document.getElementById(config.resetId);
  const cycleRuleEl = document.getElementById(config.cycleRuleId);
  const cycleSummaryEl = document.getElementById(config.cycleSummaryId);
  const searchNameEl = document.getElementById(config.searchNameId);
  const searchCycleEl = document.getElementById(config.searchCycleId);
  const searchStatusEl = document.getElementById(config.searchStatusId);
  const searchSortEl = document.getElementById(config.searchSortId);
  const searchDirectToggleEl = document.getElementById(config.searchDirectToggleId);
  const searchDirectToggleIconEl = document.getElementById(config.searchDirectToggleIconId);
  const searchDirectToggleLabelEl = document.getElementById(config.searchDirectToggleLabelId);
  const searchClearEl = document.getElementById(config.searchClearId);
  const searchMobileCloseEl = document.getElementById(config.searchMobileCloseId);
  const toolsDockEl = document.getElementById('tree-tools-dock');
  const searchToggleEl = document.getElementById(config.searchToggleId);
  const searchToggleLabelEl = document.getElementById(config.searchToggleLabelId);
  const mobileSearchPillEl = document.getElementById(config.mobileSearchPillId);
  const mobileEnrollToggleEl = document.getElementById(config.mobileEnrollToggleId);
  const mobileRootFocusEl = document.getElementById(config.mobileRootFocusId);
  const mobileMinimapToggleEl = document.getElementById(config.mobileMinimapToggleId);
  const mobileDirectToggleEl = document.getElementById(config.mobileDirectToggleId);
  const mobileDirectToggleIconEl = document.getElementById(config.mobileDirectToggleIconId);
  const mobileNavFurthestLeftEl = document.getElementById(config.mobileNavFurthestLeftId);
  const mobileNavFurthestRightEl = document.getElementById(config.mobileNavFurthestRightId);
  const navFurthestLeftEl = document.getElementById(config.navFurthestLeftId);
  const navFurthestRightEl = document.getElementById(config.navFurthestRightId);
  const toolsVisibilityToggleEl = document.getElementById(config.toolsVisibilityToggleId);
  const toolsVisibilityLabelEl = document.getElementById(config.toolsVisibilityLabelId);
  const detailsVisibilityToggleEl = document.getElementById(config.detailsVisibilityToggleId);
  const detailsVisibilityLabelEl = document.getElementById(config.detailsVisibilityLabelId);
  const searchResultsEl = document.getElementById(config.searchResultsId);
  const searchResultsCountEl = document.getElementById(config.searchResultsCountId);
  const selectedMemberEl = document.getElementById(config.selectedMemberId);
  const selectedStatusEl = document.getElementById(config.selectedStatusId);
  const selectedDirectSponsorCountEl = document.getElementById(config.selectedDirectSponsorCountId);
  const selectedSponsorEl = document.getElementById(config.selectedSponsorId);
  const selectedPlacementParentEl = document.getElementById(config.selectedPlacementParentId);
  const selectedSpilloverEl = document.getElementById(config.selectedSpilloverId);
  const selectedCountryCodeEl = document.getElementById(config.selectedCountryCodeId);
  const selectedSpilloverLineToggleEl = document.getElementById(config.selectedSpilloverLineToggleId);
  const selectedMobileCloseEl = document.getElementById(config.selectedMobileCloseId);
  const selectedPanelEl = document.getElementById('tree-selected-panel');
  const selectedLeftEl = document.getElementById(config.selectedLeftId);
  const selectedRightEl = document.getElementById(config.selectedRightId);
  const selectedCyclesEl = document.getElementById(config.selectedCyclesId);
  const selectedEligibleEl = document.getElementById(config.selectedEligibleId);
  const orgTotalPeopleEl = document.getElementById(config.orgTotalPeopleId);
  const orgTotalBvEl = document.getElementById(config.orgTotalBvId);

  const PIXI = window.PIXI;
  if (!PIXI) {
    if (fallbackEl) {
      fallbackEl.textContent = 'Unable to initialize tree renderer.';
      fallbackEl.classList.remove('hidden');
    }
    return createNoopController();
  }

  let app;
  try {
    app = new PIXI.Application({
      antialias: true,
      backgroundAlpha: 0,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
    });
  } catch (error) {
    console.error('Binary tree init failed:', error);
    if (fallbackEl) {
      fallbackEl.textContent = 'Unable to initialize tree renderer.';
      fallbackEl.classList.remove('hidden');
    }
    return createNoopController();
  }

  canvasHostEl.appendChild(app.view);
  app.view.style.touchAction = 'none';
  app.view.style.userSelect = 'none';
  app.view.style.webkitUserSelect = 'none';
  app.view.style.webkitTapHighlightColor = 'transparent';

  const world = new PIXI.Container();
  const spilloverLinksLayer = new PIXI.Graphics();
  const linksLayer = new PIXI.Graphics();
  const nodesLayer = new PIXI.Container();
  const selectedNodePopupLayer = new PIXI.Container();
  world.addChild(spilloverLinksLayer);
  world.addChild(linksLayer);
  world.addChild(nodesLayer);
  app.stage.addChild(world);
  app.stage.addChild(selectedNodePopupLayer);

  const simpleNodeInitialStyle = new PIXI.TextStyle({
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '700',
    fill: COLORS.textPrimary,
    align: 'center',
  });

  const enrollAnticipatedGlyphStyle = new PIXI.TextStyle({
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: '700',
    fill: COLORS.statusActive,
    align: 'center',
  });

  const enrollAnticipatedSideStyle = new PIXI.TextStyle({
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '600',
    fill: COLORS.textSecondary,
    letterSpacing: 0.65,
    align: 'center',
  });

  const nodePopupNameStyle = new PIXI.TextStyle({
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '700',
    fill: COLORS.textPrimary,
    align: 'left',
  });

  const nodePopupHandleStyle = new PIXI.TextStyle({
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '500',
    fill: COLORS.textSecondary,
    align: 'left',
  });

  const nodePopupMetricLabelStyle = new PIXI.TextStyle({
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    fill: COLORS.textSecondary,
    align: 'left',
  });

  const nodePopupMetricValueStyle = new PIXI.TextStyle({
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '700',
    fill: COLORS.textPrimary,
    align: 'left',
  });

  const nodePopupAvatarInitialStyle = new PIXI.TextStyle({
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '700',
    fill: COLORS.textPrimary,
    align: 'center',
  });

  const nodePopupSectionLabelStyle = new PIXI.TextStyle({
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '700',
    fill: COLORS.textSecondary,
    letterSpacing: 0.8,
    align: 'left',
  });

  const persistedUiState = readPersistedTreeUiState(config.uiStateStorageKey);
  const initialSearchState = persistedUiState?.search || createDefaultSearchState();
  const initialCycleRule = persistedUiState?.cycleRule
    ? sanitizeCycleRule(persistedUiState.cycleRule)
    : sanitizeCycleRule(config.cycleRule);

  const state = {
    data: null,
    cycleRule: initialCycleRule,
    nodeVisuals: new Map(),
    nodePositions: new Map(),
    spilloverLinkCache: [],
    bounds: { minX: 0, minY: 0, maxX: 1, maxY: 1 },
    selectedNodeId: persistedUiState?.selectedNodeId || null,
    hiddenSpilloverNodeIds: new Set(persistedUiState?.hiddenSpilloverNodeIds || []),
    searchMatches: [],
    search: { ...initialSearchState },
    initialTransform: null,
    isFullscreen: false,
    isEnrollMode: false,
    isSearchToolsOpen: persistedUiState?.isSearchToolsOpen || false,
    isToolsVisible: persistedUiState?.isToolsVisible !== false,
    isDetailsVisible: persistedUiState?.isDetailsVisible !== false,
    isDesktopMinimapVisible: persistedUiState?.isDesktopMinimapVisible !== false,
    desktopMinimapSize: sanitizeDesktopMinimapSize(persistedUiState?.desktopMinimapSize),
    isDesktopMinimapSettingsOpen: false,
    isMobileSelectedOpen: Boolean(persistedUiState?.isMobileSelectedOpen),
    reverseTrackpadMovement: Boolean(persistedUiState?.reverseTrackpadMovement),
    trackpadZoomSensitivity: sanitizeTrackpadZoomSensitivity(persistedUiState?.trackpadZoomSensitivity),
    isSpacePanModeActive: false,
    suppressTapUntil: 0,
    destroyed: false,
    emptyText: null,
    selectedNodePopup: null,
    activeLodModeKey: TREE_LOD_MODE_NEAR,
    pendingRestoreUiState: persistedUiState,
  };

  const originalParent = panelEl.parentElement;
  const originalNextSibling = panelEl.nextSibling;

  const activePointers = new Map();
  let pinchStartDistance = 0;
  let pinchStartScale = 1;
  let minimapPointerId = null;
  let minimapRenderQueued = false;
  let persistStateTimerId = null;
  let cameraAnimationFrameId = null;
  let fullscreenTimeTickerId = null;
  let fullscreenMetricCardIndex = 0;
  let fullscreenMetricTouchStartX = null;
  let fullscreenPreviousBodyOverflow = '';
  let mousePanPointerId = null;
  let isMousePanDragging = false;
  let escFullscreenExitTimerId = null;
  let activeThemeKey = resolveRuntimeThemeKey();
  let themeMutationObserver = null;
  let nodePopupBadgeHoverHideTimerId = null;
  let activeNodePopupBadgeAnchorRect = null;
  let nodePopupBadgeHovercardRefs = null;

  const listeners = [];

  function syncThemeTextStyles() {
    simpleNodeInitialStyle.fill = COLORS.textPrimary;
    enrollAnticipatedGlyphStyle.fill = COLORS.statusActive;
    enrollAnticipatedSideStyle.fill = COLORS.textSecondary;
    nodePopupNameStyle.fill = COLORS.textPrimary;
    nodePopupHandleStyle.fill = COLORS.textSecondary;
    nodePopupMetricLabelStyle.fill = COLORS.textSecondary;
    nodePopupMetricValueStyle.fill = COLORS.textPrimary;
    nodePopupAvatarInitialStyle.fill = COLORS.textPrimary;
    nodePopupSectionLabelStyle.fill = COLORS.textSecondary;
    if (state.emptyText) {
      state.emptyText.style.fill = COLORS.textMuted;
    }
  }

  function refreshThemeRendering(force = false) {
    const nextThemeKey = applyTreeThemePalette(resolveRuntimeThemeKey());
    const didThemeChange = nextThemeKey !== activeThemeKey;
    activeThemeKey = nextThemeKey;
    syncThemeTextStyles();
    if (!force && !didThemeChange) {
      updateSelectedNodePopup();
      return;
    }
    if (state.nodeVisuals.size) {
      renderTree();
      return;
    }
    updateSelectedNodePopup();
    scheduleMinimapRender();
  }

  if (typeof MutationObserver === 'function' && document?.documentElement) {
    themeMutationObserver = new MutationObserver((entries) => {
      for (const entry of entries) {
        if (entry.type === 'attributes' && entry.attributeName === 'data-theme') {
          refreshThemeRendering();
          break;
        }
      }
    });
    themeMutationObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  function addListener(target, eventName, handler, optionsForListener) {
    if (!target) {
      return;
    }
    target.addEventListener(eventName, handler, optionsForListener);
    listeners.push(() => target.removeEventListener(eventName, handler, optionsForListener));
  }

  function clearNodePopupBadgeHoverHideTimer() {
    if (!nodePopupBadgeHoverHideTimerId) {
      return;
    }
    window.clearTimeout(nodePopupBadgeHoverHideTimerId);
    nodePopupBadgeHoverHideTimerId = null;
  }

  function ensureNodePopupBadgeHovercardDom() {
    if (typeof document === 'undefined' || !document.body) {
      return null;
    }

    const styleId = 'tree-node-popup-kpi-badge-hovercard-style';
    if (!document.getElementById(styleId)) {
      const styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.textContent = `
        .tree-node-kpi-badge-hovercard {
          position: fixed;
          left: -9999px;
          top: -9999px;
          width: min(18.5rem, calc(100vw - 1rem));
          padding: 0.85rem 0.9rem;
          border-radius: 1rem;
          border: 1px solid rgb(87 129 176 / 58%);
          background:
            radial-gradient(130% 150% at 0% 0%, rgb(74 165 232) 0%, rgb(29 42 65) 54%),
            linear-gradient(145deg, rgb(42 57 82) 0%, rgb(29 42 65) 55%, rgb(21 33 53) 100%);
          box-shadow:
            0 18px 32px rgb(4 10 17 / 56%),
            inset 0 1px 0 rgb(189 220 255 / 20%);
          display: grid;
          grid-template-columns: auto 1fr;
          grid-template-areas:
            "icon title"
            "icon subtitle";
          align-items: center;
          column-gap: 0.8rem;
          row-gap: 0.2rem;
          opacity: 0;
          transform: translateY(12px) scale(0.96);
          transform-origin: center top;
          pointer-events: none;
          transition:
            opacity 180ms ease,
            transform 210ms cubic-bezier(0.22, 1, 0.36, 1);
          z-index: 1400;
        }
        .tree-node-kpi-badge-hovercard.is-visible {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: auto;
        }
        .tree-node-kpi-badge-hovercard[data-placement="bottom"] {
          transform-origin: center bottom;
        }
        .tree-node-kpi-badge-hovercard-icon-shell {
          width: 2.72rem;
          height: 2.72rem;
          margin: 0;
          border-radius: 0.82rem;
          border: 1px solid rgb(114 170 223 / 60%);
          display: flex;
          align-items: center;
          justify-content: center;
          grid-area: icon;
          background:
            radial-gradient(circle at 26% 20%, rgb(88 197 255 / 24%) 0%, rgb(24 48 78 / 0) 60%),
            linear-gradient(160deg, rgb(41 73 113 / 72%) 0%, rgb(24 43 69 / 88%) 100%);
          box-shadow:
            0 8px 18px rgb(3 8 15 / 35%),
            inset 0 1px 0 rgb(197 231 255 / 24%);
        }
        .tree-node-kpi-badge-hovercard-icon {
          width: 2.08rem;
          height: 2.08rem;
          object-fit: contain;
          filter: none;
        }
        .tree-node-kpi-badge-hovercard-title {
          margin: 0;
          grid-area: title;
          font-family: Inter, system-ui, sans-serif;
          font-size: 0.98rem;
          font-weight: 700;
          line-height: 1.15;
          letter-spacing: 0.03em;
          text-align: left;
          color: rgb(245 249 255 / 98%);
          text-transform: none;
          text-shadow: none;
        }
        .tree-node-kpi-badge-hovercard-subtitle {
          margin: 0;
          grid-area: subtitle;
          font-family: Inter, system-ui, sans-serif;
          font-size: 0.82rem;
          line-height: 1.35;
          text-align: left;
          color: rgb(210 224 242 / 88%);
          text-transform: none;
          white-space: pre-line;
        }
        @media (max-width: 640px) {
          .tree-node-kpi-badge-hovercard {
            width: min(17rem, calc(100vw - 0.9rem));
            padding: 0.78rem 0.82rem;
            column-gap: 0.72rem;
          }
          .tree-node-kpi-badge-hovercard-icon-shell {
            width: 2.56rem;
            height: 2.56rem;
          }
          .tree-node-kpi-badge-hovercard-icon {
            width: 1.92rem;
            height: 1.92rem;
          }
          .tree-node-kpi-badge-hovercard-title {
            font-size: 0.92rem;
          }
          .tree-node-kpi-badge-hovercard-subtitle {
            font-size: 0.78rem;
          }
        }
      `;
      document.head.appendChild(styleElement);
    }

    let cardElement = document.getElementById('tree-node-popup-kpi-badge-hovercard');
    if (!cardElement) {
      cardElement = document.createElement('div');
      cardElement.id = 'tree-node-popup-kpi-badge-hovercard';
      cardElement.className = 'tree-node-kpi-badge-hovercard';
      cardElement.setAttribute('role', 'tooltip');
      cardElement.setAttribute('aria-hidden', 'true');
      cardElement.setAttribute('data-placement', 'top');
      cardElement.innerHTML = `
        <div class="tree-node-kpi-badge-hovercard-icon-shell">
          <img
            data-tree-node-kpi-hover-icon
            src="/brand_assets/Icons/Achievements/placeholder.svg"
            alt=""
            class="tree-node-kpi-badge-hovercard-icon"
            loading="lazy"
            decoding="async"
          />
        </div>
        <p data-tree-node-kpi-hover-title class="tree-node-kpi-badge-hovercard-title">Badge</p>
        <p data-tree-node-kpi-hover-subtitle class="tree-node-kpi-badge-hovercard-subtitle">--</p>
      `;
      document.body.appendChild(cardElement);
    }

    const iconElement = cardElement.querySelector('[data-tree-node-kpi-hover-icon]');
    const titleElement = cardElement.querySelector('[data-tree-node-kpi-hover-title]');
    const subtitleElement = cardElement.querySelector('[data-tree-node-kpi-hover-subtitle]');

    if (cardElement.dataset.bound !== 'true') {
      cardElement.dataset.bound = 'true';
      addListener(cardElement, 'mouseenter', () => {
        clearNodePopupBadgeHoverHideTimer();
      });
      addListener(cardElement, 'pointerdown', () => {
        clearNodePopupBadgeHoverHideTimer();
      });
      addListener(cardElement, 'mouseleave', () => {
        scheduleNodePopupBadgeHovercardHide();
      });
      addListener(cardElement, 'focusin', () => {
        clearNodePopupBadgeHoverHideTimer();
      });
      addListener(cardElement, 'focusout', (event) => {
        const relatedTarget = event.relatedTarget instanceof Element ? event.relatedTarget : null;
        if (relatedTarget && cardElement.contains(relatedTarget)) {
          return;
        }
        scheduleNodePopupBadgeHovercardHide();
      });
      addListener(document, 'pointerdown', (event) => {
        const target = event.target instanceof Element ? event.target : null;
        if (target && cardElement.contains(target)) {
          return;
        }
        hideNodePopupBadgeHovercard({ immediate: true });
      });
      addListener(window, 'resize', () => {
        hideNodePopupBadgeHovercard({ immediate: true });
      });
      addListener(window, 'scroll', () => {
        hideNodePopupBadgeHovercard({ immediate: true });
      }, true);
    }

    nodePopupBadgeHovercardRefs = {
      card: cardElement,
      icon: iconElement,
      title: titleElement,
      subtitle: subtitleElement,
    };
    return nodePopupBadgeHovercardRefs;
  }

  function hideNodePopupBadgeHovercard(options = {}) {
    const immediate = options.immediate === true;
    clearNodePopupBadgeHoverHideTimer();
    const refs = nodePopupBadgeHovercardRefs || ensureNodePopupBadgeHovercardDom();
    if (!refs?.card) {
      return;
    }

    refs.card.classList.remove('is-visible');
    refs.card.setAttribute('aria-hidden', 'true');
    activeNodePopupBadgeAnchorRect = null;

    const resetCardPosition = () => {
      if (!refs.card.classList.contains('is-visible')) {
        refs.card.style.left = '-9999px';
        refs.card.style.top = '-9999px';
      }
    };

    if (immediate) {
      resetCardPosition();
      return;
    }
    window.setTimeout(resetCardPosition, 220);
  }

  function scheduleNodePopupBadgeHovercardHide() {
    clearNodePopupBadgeHoverHideTimer();
    nodePopupBadgeHoverHideTimerId = window.setTimeout(() => {
      hideNodePopupBadgeHovercard();
    }, NODE_POPUP_BADGE_HOVER_HIDE_DELAY_MS);
  }

  function shouldKeepNodePopupBadgeHovercardOpen() {
    const refs = nodePopupBadgeHovercardRefs || ensureNodePopupBadgeHovercardDom();
    if (!refs?.card || !refs.card.classList.contains('is-visible')) {
      return false;
    }
    const activeElement = document.activeElement;
    if (activeElement instanceof Element && refs.card.contains(activeElement)) {
      return true;
    }
    return refs.card.matches(':hover');
  }

  function positionNodePopupBadgeHovercard(anchorRect) {
    const refs = nodePopupBadgeHovercardRefs || ensureNodePopupBadgeHovercardDom();
    if (!refs?.card || !anchorRect) {
      return;
    }

    const cardRect = refs.card.getBoundingClientRect();
    if (!cardRect.width || !cardRect.height) {
      return;
    }

    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    const viewportPadding = 12;
    const anchorGap = 14;
    let left = anchorRect.left + (anchorRect.width / 2) - (cardRect.width / 2);
    left = Math.max(viewportPadding, Math.min(left, Math.max(viewportPadding, viewportWidth - cardRect.width - viewportPadding)));

    let top = anchorRect.top - cardRect.height - anchorGap;
    let placement = 'top';
    if (top < viewportPadding) {
      top = Math.min(
        Math.max(viewportPadding, viewportHeight - cardRect.height - viewportPadding),
        anchorRect.bottom + anchorGap,
      );
      placement = 'bottom';
    }

    refs.card.dataset.placement = placement;
    refs.card.style.left = `${Math.round(left)}px`;
    refs.card.style.top = `${Math.round(top)}px`;
  }

  function showNodePopupBadgeHovercard(iconEntry, anchorRect) {
    const refs = nodePopupBadgeHovercardRefs || ensureNodePopupBadgeHovercardDom();
    if (!refs?.card || !iconEntry || !anchorRect) {
      return;
    }

    clearNodePopupBadgeHoverHideTimer();
    activeNodePopupBadgeAnchorRect = { ...anchorRect };

    if (refs.icon) {
      refs.icon.src = String(iconEntry.iconPath || '/brand_assets/Icons/Achievements/placeholder.svg');
      refs.icon.alt = `${String(iconEntry.hoverTitle || iconEntry.hoverSubtitle || 'Badge')} icon`;
    }
    if (refs.title) {
      refs.title.textContent = String(iconEntry.hoverTitle || iconEntry.hoverSubtitle || 'Badge');
    }
    if (refs.subtitle) {
      refs.subtitle.textContent = String(iconEntry.hoverSubtitle || '');
    }

    refs.card.classList.add('is-visible');
    refs.card.setAttribute('aria-hidden', 'false');
    refs.card.style.left = '-9999px';
    refs.card.style.top = '-9999px';
    window.requestAnimationFrame(() => {
      if (!activeNodePopupBadgeAnchorRect) {
        return;
      }
      positionNodePopupBadgeHovercard(activeNodePopupBadgeAnchorRect);
    });
  }

  function getPersistedUiStateSnapshot() {
    return {
      cycleRule: { ...state.cycleRule },
      search: {
        query: state.search.query,
        minCycles: state.search.minCycles,
        status: state.search.status,
        sort: state.search.sort,
        directOnly: Boolean(state.search.directOnly),
      },
      selectedNodeId: state.selectedNodeId || null,
      hiddenSpilloverNodeIds: Array.from(state.hiddenSpilloverNodeIds),
      isFullscreen: state.isFullscreen,
      isSearchToolsOpen: state.isSearchToolsOpen,
      isToolsVisible: state.isToolsVisible,
      isDetailsVisible: state.isDetailsVisible,
      isDesktopMinimapVisible: state.isDesktopMinimapVisible,
      desktopMinimapSize: state.desktopMinimapSize,
      isMobileSelectedOpen: state.isMobileSelectedOpen,
      reverseTrackpadMovement: Boolean(state.reverseTrackpadMovement),
      trackpadZoomSensitivity: sanitizeTrackpadZoomSensitivity(state.trackpadZoomSensitivity),
      camera: {
        x: world.position.x,
        y: world.position.y,
        scale: clamp(world.scale.x, MIN_ZOOM, MAX_ZOOM),
      },
    };
  }

  function persistUiStateNow() {
    if (!config.uiStateStorageKey) {
      return;
    }
    try {
      localStorage.setItem(config.uiStateStorageKey, JSON.stringify(getPersistedUiStateSnapshot()));
    } catch {
      // Ignore storage failures (private mode, quota, policy).
    }
  }

  function schedulePersistUiState() {
    if (!config.uiStateStorageKey || state.destroyed) {
      return;
    }
    if (persistStateTimerId !== null) {
      clearTimeout(persistStateTimerId);
    }
    persistStateTimerId = setTimeout(() => {
      persistStateTimerId = null;
      persistUiStateNow();
    }, 140);
  }

  function stopCameraAnimation() {
    if (cameraAnimationFrameId !== null) {
      cancelAnimationFrame(cameraAnimationFrameId);
      cameraAnimationFrameId = null;
    }
  }

  function isLikelyTrackpadWheelEvent(event) {
    if (!event || event.deltaMode !== WheelEvent.DOM_DELTA_PIXEL) {
      return false;
    }

    const absDeltaX = Math.abs(event.deltaX);
    const absDeltaY = Math.abs(event.deltaY);

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
      return event.metaKey && !event.ctrlKey;
    }
    return event.ctrlKey;
  }

  function shouldIgnorePanHotkeyEvent(event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return false;
    }

    if (target.isContentEditable) {
      return true;
    }

    if (target.closest('[contenteditable="true"]')) {
      return true;
    }

    const tagName = target.tagName;
    return tagName === 'INPUT'
      || tagName === 'TEXTAREA'
      || tagName === 'SELECT';
  }

  function isTreePanelVisibleForHotkeys() {
    if (!panelEl || state.destroyed) {
      return false;
    }
    if (state.isFullscreen) {
      return true;
    }
    return panelEl.getClientRects().length > 0;
  }

  function isEventWithinTreePanel(event) {
    const target = event.target;
    return target instanceof Node && panelEl.contains(target);
  }

  function blurActiveTreeButtonForPanMode() {
    const activeElement = document.activeElement;
    if (!(activeElement instanceof HTMLElement) || !panelEl.contains(activeElement)) {
      return;
    }
    if (activeElement.tagName === 'BUTTON' || activeElement.getAttribute('role') === 'button') {
      activeElement.blur();
    }
  }

  function clearEscapeFullscreenExitTimer() {
    if (escFullscreenExitTimerId === null) {
      return;
    }
    clearTimeout(escFullscreenExitTimerId);
    escFullscreenExitTimerId = null;
  }

  function syncPanModeUiState() {
    const isPanModeActive = Boolean(state.isSpacePanModeActive);
    panelEl.classList.toggle('tree-pan-mode-active', isPanModeActive);
    panelEl.classList.toggle('tree-pan-mode-dragging', isPanModeActive && isMousePanDragging);
  }

  function clearMousePanInteraction() {
    if (mousePanPointerId !== null) {
      activePointers.delete(mousePanPointerId);
      mousePanPointerId = null;
    }
    isMousePanDragging = false;
    if (activePointers.size < 2) {
      pinchStartDistance = 0;
    }
    syncPanModeUiState();
  }

  function getServerCutoffConfig() {
    const cutoffCardEl = document.getElementById('server-cutoff-card');
    const cutoffTimeZone = cutoffCardEl?.dataset?.cutoffTimezone || 'America/Los_Angeles';
    const cutoffWeekdayRaw = Number.parseInt(cutoffCardEl?.dataset?.cutoffWeekday || '6', 10);
    const cutoffHourRaw = Number.parseInt(cutoffCardEl?.dataset?.cutoffHour || '23', 10);
    const cutoffMinuteRaw = Number.parseInt(cutoffCardEl?.dataset?.cutoffMinute || '59', 10);

    return {
      timeZone: cutoffTimeZone,
      weekday: clamp(Number.isFinite(cutoffWeekdayRaw) ? cutoffWeekdayRaw : 6, 0, 6),
      hour: clamp(Number.isFinite(cutoffHourRaw) ? cutoffHourRaw : 23, 0, 23),
      minute: clamp(Number.isFinite(cutoffMinuteRaw) ? cutoffMinuteRaw : 59, 0, 59),
    };
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

  function renderFullscreenHeaderTimeChip() {
    if (!fullscreenServerTimeEl && !fullscreenCutoffTimeEl) {
      return;
    }

    const cutoffConfig = getServerCutoffConfig();
    const now = new Date();
    const timeZoneShortLabel = getTimeZoneShortLabel(cutoffConfig.timeZone);
    const weekdayLabel = WEEKDAY_LABELS[cutoffConfig.weekday] || WEEKDAY_LABELS[6];
    const cutoffTimeLabel = formatCutoffHourMinute(cutoffConfig.hour, cutoffConfig.minute);

    if (fullscreenServerTimeEl) {
      try {
        const serverTimeLabel = new Intl.DateTimeFormat('en-US', {
          timeZone: cutoffConfig.timeZone,
          weekday: 'short',
          month: 'short',
          day: '2-digit',
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
          timeZoneName: 'short',
        }).format(now);
        fullscreenServerTimeEl.textContent = serverTimeLabel;
      } catch {
        fullscreenServerTimeEl.textContent = now.toLocaleString();
      }
    }

    if (fullscreenCutoffTimeEl) {
      fullscreenCutoffTimeEl.textContent = `Cut-off ${weekdayLabel} ${cutoffTimeLabel} ${timeZoneShortLabel}`;
    }
  }

  function startFullscreenHeaderTimeTicker() {
    if (fullscreenTimeTickerId !== null) {
      return;
    }
    renderFullscreenHeaderTimeChip();
    fullscreenTimeTickerId = setInterval(() => {
      renderFullscreenHeaderTimeChip();
    }, 1000);
  }

  function stopFullscreenHeaderTimeTicker() {
    if (fullscreenTimeTickerId === null) {
      return;
    }
    clearInterval(fullscreenTimeTickerId);
    fullscreenTimeTickerId = null;
  }

  function isCompactFullscreenMetricsLayout() {
    return state.isFullscreen && isMobileFullscreenViewport();
  }

  function syncFullscreenMetricsDotsUi(totalCards, activeIndex, shouldShowDots) {
    if (!fullscreenMetricsDotsEl) {
      return;
    }

    const shouldRenderDots = shouldShowDots && totalCards > 1;
    if (!shouldRenderDots) {
      fullscreenMetricsDotsEl.replaceChildren();
      fullscreenMetricsDotsEl.setAttribute('aria-hidden', 'true');
      return;
    }

    if (fullscreenMetricsDotsEl.childElementCount !== totalCards) {
      const dotsFragment = document.createDocumentFragment();
      for (let index = 0; index < totalCards; index += 1) {
        const dotButtonEl = document.createElement('button');
        dotButtonEl.type = 'button';
        dotButtonEl.className = 'tree-fullscreen-metrics-dot';
        dotButtonEl.setAttribute('data-tree-fullscreen-metric-dot-index', String(index));
        dotButtonEl.setAttribute('aria-label', `Show metric card ${index + 1}`);
        dotsFragment.appendChild(dotButtonEl);
      }
      fullscreenMetricsDotsEl.replaceChildren(dotsFragment);
    }

    const dotButtonEls = fullscreenMetricsDotsEl.querySelectorAll('[data-tree-fullscreen-metric-dot-index]');
    for (const dotButtonEl of dotButtonEls) {
      const dotIndex = Number.parseInt(dotButtonEl.getAttribute('data-tree-fullscreen-metric-dot-index') || '', 10);
      const isActive = dotIndex === activeIndex;
      dotButtonEl.classList.toggle('is-active', isActive);
      dotButtonEl.setAttribute('aria-current', isActive ? 'true' : 'false');
    }
    fullscreenMetricsDotsEl.setAttribute('aria-hidden', 'false');
  }

  function syncFullscreenMetricsDeckUi() {
    if (!fullscreenMetricCardEls.length) {
      if (fullscreenMetricsPrevEl) {
        fullscreenMetricsPrevEl.disabled = true;
      }
      if (fullscreenMetricsNextEl) {
        fullscreenMetricsNextEl.disabled = true;
      }
      syncFullscreenMetricsDotsUi(0, 0, false);
      return;
    }

    const totalCards = fullscreenMetricCardEls.length;
    const isCompactLayout = isCompactFullscreenMetricsLayout();

    if (!isCompactLayout) {
      for (let index = 0; index < totalCards; index += 1) {
        const cardEl = fullscreenMetricCardEls[index];
        cardEl.classList.add('is-active');
        cardEl.setAttribute('aria-hidden', 'false');
      }
      if (fullscreenMetricsPrevEl) {
        fullscreenMetricsPrevEl.disabled = true;
        fullscreenMetricsPrevEl.setAttribute('aria-disabled', 'true');
      }
      if (fullscreenMetricsNextEl) {
        fullscreenMetricsNextEl.disabled = true;
        fullscreenMetricsNextEl.setAttribute('aria-disabled', 'true');
      }
      syncFullscreenMetricsDotsUi(totalCards, 0, false);
      return;
    }

    const wrappedIndex = ((fullscreenMetricCardIndex % totalCards) + totalCards) % totalCards;
    fullscreenMetricCardIndex = wrappedIndex;

    for (let index = 0; index < totalCards; index += 1) {
      const cardEl = fullscreenMetricCardEls[index];
      const isActive = index === fullscreenMetricCardIndex;
      cardEl.classList.toggle('is-active', isActive);
      cardEl.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    }

    const canNavigate = totalCards > 1;
    if (fullscreenMetricsPrevEl) {
      fullscreenMetricsPrevEl.disabled = !canNavigate;
      fullscreenMetricsPrevEl.setAttribute('aria-disabled', canNavigate ? 'false' : 'true');
    }
    if (fullscreenMetricsNextEl) {
      fullscreenMetricsNextEl.disabled = !canNavigate;
      fullscreenMetricsNextEl.setAttribute('aria-disabled', canNavigate ? 'false' : 'true');
    }
    syncFullscreenMetricsDotsUi(totalCards, fullscreenMetricCardIndex, canNavigate);
  }

  function shiftFullscreenMetricsDeck(step) {
    if (!fullscreenMetricCardEls.length || !isCompactFullscreenMetricsLayout()) {
      return;
    }
    fullscreenMetricCardIndex += Number.isFinite(step) ? step : 0;
    syncFullscreenMetricsDeckUi();
  }

  function onFullscreenMetricsTouchStart(event) {
    if (!isCompactFullscreenMetricsLayout()) {
      fullscreenMetricTouchStartX = null;
      return;
    }
    const touch = event.changedTouches && event.changedTouches.length ? event.changedTouches[0] : null;
    if (!touch) {
      fullscreenMetricTouchStartX = null;
      return;
    }
    fullscreenMetricTouchStartX = touch.clientX;
  }

  function onFullscreenMetricsTouchEnd(event) {
    if (!isCompactFullscreenMetricsLayout()) {
      fullscreenMetricTouchStartX = null;
      return;
    }
    if (!Number.isFinite(fullscreenMetricTouchStartX)) {
      fullscreenMetricTouchStartX = null;
      return;
    }

    const touch = event.changedTouches && event.changedTouches.length ? event.changedTouches[0] : null;
    const endX = touch ? touch.clientX : NaN;
    if (!Number.isFinite(endX)) {
      fullscreenMetricTouchStartX = null;
      return;
    }

    const deltaX = endX - fullscreenMetricTouchStartX;
    fullscreenMetricTouchStartX = null;
    if (Math.abs(deltaX) < 28) {
      return;
    }
    shiftFullscreenMetricsDeck(deltaX > 0 ? -1 : 1);
  }

  function syncSearchDirectToggleUi() {
    const isDirectOnlyEnabled = Boolean(state.search.directOnly);
    const directToggleIconName = isDirectOnlyEnabled ? 'face_retouching_off' : 'face';
    if (searchDirectToggleEl) {
      searchDirectToggleEl.setAttribute('aria-pressed', isDirectOnlyEnabled ? 'true' : 'false');
      searchDirectToggleEl.classList.toggle('bg-brand-500/15', isDirectOnlyEnabled);
      searchDirectToggleEl.classList.toggle('border-brand-500/35', isDirectOnlyEnabled);
      searchDirectToggleEl.classList.toggle('text-brand-300', isDirectOnlyEnabled);
      searchDirectToggleEl.classList.toggle('bg-surface-base', !isDirectOnlyEnabled);
      searchDirectToggleEl.classList.toggle('border-surface-border', !isDirectOnlyEnabled);
      searchDirectToggleEl.classList.toggle('text-text-secondary', !isDirectOnlyEnabled);
      if (searchDirectToggleIconEl) {
        searchDirectToggleIconEl.textContent = directToggleIconName;
      }
      if (searchDirectToggleLabelEl) {
        searchDirectToggleLabelEl.textContent = isDirectOnlyEnabled ? 'Direct Sponsors: On' : 'Direct Sponsors';
      } else {
        searchDirectToggleEl.textContent = isDirectOnlyEnabled ? 'Direct Sponsors: On' : 'Direct Sponsors';
      }
    }

    if (mobileDirectToggleEl) {
      mobileDirectToggleEl.setAttribute('aria-pressed', isDirectOnlyEnabled ? 'true' : 'false');
      const actionLabel = isDirectOnlyEnabled
        ? 'Disable direct sponsors filter'
        : 'Enable direct sponsors filter';
      mobileDirectToggleEl.setAttribute('aria-label', actionLabel);
      mobileDirectToggleEl.title = actionLabel;
      if (mobileDirectToggleIconEl) {
        mobileDirectToggleIconEl.textContent = directToggleIconName;
      }
    }
  }

  function syncSearchInputsFromState() {
    if (searchNameEl) {
      searchNameEl.value = state.search.query;
    }
    if (searchCycleEl) {
      searchCycleEl.value = state.search.minCycles === null ? '' : String(state.search.minCycles);
    }
    if (searchStatusEl) {
      searchStatusEl.value = state.search.status;
    }
    if (searchSortEl) {
      searchSortEl.value = state.search.sort;
    }
    syncSearchDirectToggleUi();
  }

  function showFallback(message) {
    if (fallbackEl) {
      fallbackEl.textContent = message;
      fallbackEl.classList.remove('hidden');
    }
  }

  function hideFallback() {
    if (fallbackEl) {
      fallbackEl.classList.add('hidden');
    }
  }

  function updateFullscreenLabel() {
    if (fullscreenLabelEl) {
      fullscreenLabelEl.textContent = state.isFullscreen ? 'Exit Fullscreen' : 'Fullscreen';
    }
  }

  function emitFullscreenState() {
    if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') {
      return;
    }

    window.dispatchEvent(new CustomEvent('binary-tree-fullscreen-changed', {
      detail: {
        fullscreen: state.isFullscreen,
      },
    }));
  }

  function emitEnrollModeState() {
    if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') {
      return;
    }

    window.dispatchEvent(new CustomEvent('binary-tree-enroll-mode-changed', {
      detail: {
        active: state.isEnrollMode,
        fullscreen: state.isFullscreen,
      },
    }));
  }

  function getInteractionSettings() {
    return {
      reverseTrackpadMovement: Boolean(state.reverseTrackpadMovement),
      trackpadZoomSensitivity: sanitizeTrackpadZoomSensitivity(state.trackpadZoomSensitivity),
    };
  }

  function updateInteractionSettings(settings = {}) {
    if (!settings || typeof settings !== 'object') {
      return getInteractionSettings();
    }

    let hasChanges = false;

    if (Object.prototype.hasOwnProperty.call(settings, 'reverseTrackpadMovement')) {
      const nextReverseTrackpadMovement = Boolean(settings.reverseTrackpadMovement);
      if (nextReverseTrackpadMovement !== state.reverseTrackpadMovement) {
        state.reverseTrackpadMovement = nextReverseTrackpadMovement;
        hasChanges = true;
      }
    }

    if (Object.prototype.hasOwnProperty.call(settings, 'trackpadZoomSensitivity')) {
      const nextTrackpadZoomSensitivity = sanitizeTrackpadZoomSensitivity(settings.trackpadZoomSensitivity);
      if (Math.abs(nextTrackpadZoomSensitivity - state.trackpadZoomSensitivity) > 0.000001) {
        state.trackpadZoomSensitivity = nextTrackpadZoomSensitivity;
        hasChanges = true;
      }
    }

    if (hasChanges) {
      schedulePersistUiState();
    }

    return getInteractionSettings();
  }

  function syncEnrollModeToggleUi() {
    const isActive = state.isFullscreen;
    state.isEnrollMode = isActive;
    panelEl.classList.toggle('tree-enroll-mode-active', isActive);

    if (!mobileEnrollToggleEl) {
      return;
    }

    mobileEnrollToggleEl.hidden = true;
    mobileEnrollToggleEl.style.display = 'none';
    mobileEnrollToggleEl.setAttribute('aria-hidden', 'true');
    mobileEnrollToggleEl.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    mobileEnrollToggleEl.classList.toggle('is-active', isActive);
    const actionLabel = 'Enroll slots always visible in fullscreen';
    const buttonLabel = 'Enroll Member';
    mobileEnrollToggleEl.setAttribute('aria-label', actionLabel);
    mobileEnrollToggleEl.title = actionLabel;
    mobileEnrollToggleEl.textContent = buttonLabel;
  }

  function setEnrollMode(isEnabled, options = {}) {
    void isEnabled;
    const nextValue = state.isFullscreen;
    const changed = nextValue !== state.isEnrollMode;
    state.isEnrollMode = nextValue;
    syncEnrollModeToggleUi();

    if (state.data) {
      renderTree();
    }

    if (changed || options.forceEmit) {
      emitEnrollModeState();
    }
  }

  function requestEnrollMemberFromTree(parentNode, side) {
    if (!parentNode || (side !== 'left' && side !== 'right')) {
      return;
    }

    if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') {
      return;
    }

    window.dispatchEvent(new CustomEvent('binary-tree-enroll-member-request', {
      detail: {
        parentId: parentNode.id,
        parentName: parentNode.name,
        parentMemberCode: parentNode.memberCode,
        placementLeg: side,
      },
    }));
  }

  function isMobileFullscreenViewport() {
    return window.matchMedia('(max-width: 640px)').matches;
  }

  function isDesktopFullscreenViewport() {
    return state.isFullscreen && !isMobileFullscreenViewport();
  }

  function isFullscreenSheetLayout() {
    return state.isFullscreen;
  }

  function isMinimapVisibleInCurrentViewport() {
    return isDesktopFullscreenViewport() && state.isDesktopMinimapVisible;
  }

  function syncMobileFullscreenSheetState() {
    const isSheetFullscreen = isFullscreenSheetLayout();
    panelEl.classList.toggle(
      'tree-mobile-search-sheet-open',
      isSheetFullscreen && state.isToolsVisible && state.isSearchToolsOpen,
    );
    panelEl.classList.toggle(
      'tree-mobile-selected-open',
      isSheetFullscreen
      && state.isDetailsVisible
      && !state.isSearchToolsOpen
      && state.isMobileSelectedOpen
      && Boolean(state.data && state.selectedNodeId && state.data.nodes[state.selectedNodeId]),
    );
  }

  function syncDesktopMinimapSizeState() {
    const nextSize = sanitizeDesktopMinimapSize(state.desktopMinimapSize);
    state.desktopMinimapSize = nextSize;

    panelEl.classList.remove(
      'tree-desktop-minimap-size-small',
      'tree-desktop-minimap-size-medium',
      'tree-desktop-minimap-size-large',
    );
    panelEl.classList.add(`tree-desktop-minimap-size-${nextSize}`);

    const sizeOptionByKey = {
      small: minimapSizeSmallEl,
      medium: minimapSizeMediumEl,
      large: minimapSizeLargeEl,
    };

    for (const [key, optionEl] of Object.entries(sizeOptionByKey)) {
      if (!optionEl) {
        continue;
      }
      const isActive = key === nextSize;
      optionEl.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    }
  }

  function setDesktopMinimapSettingsOpen(isOpen) {
    const nextOpen = Boolean(isOpen) && isDesktopFullscreenViewport() && state.isDesktopMinimapVisible;
    state.isDesktopMinimapSettingsOpen = nextOpen;
    panelEl.classList.toggle('tree-desktop-minimap-settings-open', nextOpen);
    if (minimapSettingsToggleEl) {
      minimapSettingsToggleEl.setAttribute('aria-expanded', nextOpen ? 'true' : 'false');
    }
    if (minimapSizeMenuEl) {
      minimapSizeMenuEl.classList.toggle('hidden', !nextOpen);
    }
  }

  function setDesktopMinimapSize(nextSize, options = {}) {
    state.desktopMinimapSize = sanitizeDesktopMinimapSize(nextSize);
    syncDesktopMinimapSizeState();
    scheduleMinimapRender();

    if (options.closeMenu !== false) {
      setDesktopMinimapSettingsOpen(false);
    }

    if (options.persist !== false) {
      schedulePersistUiState();
    }
  }

  function syncDesktopMinimapVisibilityState() {
    const shouldShowDesktopMinimap = isMinimapVisibleInCurrentViewport();
    panelEl.classList.toggle('tree-desktop-minimap-hidden', !shouldShowDesktopMinimap);
    if (!shouldShowDesktopMinimap) {
      minimapPointerId = null;
      setDesktopMinimapSettingsOpen(false);
    }

    if (mobileMinimapToggleEl) {
      const isVisible = state.isDesktopMinimapVisible;
      mobileMinimapToggleEl.setAttribute('aria-pressed', isVisible ? 'true' : 'false');
      const actionLabel = isVisible ? 'Hide minimap' : 'Show minimap';
      mobileMinimapToggleEl.setAttribute('aria-label', actionLabel);
      mobileMinimapToggleEl.title = actionLabel;
    }

    if (minimapSettingsToggleEl) {
      const canConfigure = shouldShowDesktopMinimap;
      minimapSettingsToggleEl.disabled = !canConfigure;
      minimapSettingsToggleEl.setAttribute('aria-disabled', canConfigure ? 'false' : 'true');
    }
  }

  function setDesktopMinimapVisible(isVisible, options = {}) {
    state.isDesktopMinimapVisible = Boolean(isVisible);
    syncDesktopMinimapVisibilityState();
    scheduleMinimapRender();
    if (options.persist !== false) {
      schedulePersistUiState();
    }
  }

  function updateFullscreenOverlayOffsets() {
    if (!state.isFullscreen || !headerBarEl) {
      panelEl.style.removeProperty('--tree-header-bottom');
      panelEl.style.removeProperty('--tree-minimap-bottom');
      return;
    }

    const panelRect = panelEl.getBoundingClientRect();
    const headerRect = headerBarEl.getBoundingClientRect();
    const headerBottom = Math.max(64, Math.round(headerRect.bottom - panelRect.top));
    panelEl.style.setProperty('--tree-header-bottom', `${headerBottom}px`);

    let minimapBottom = 16;
    if (state.isDetailsVisible && detailPanelsEl) {
      const detailsRect = detailPanelsEl.getBoundingClientRect();
      if (detailsRect.height > 0) {
        const detailsOffsetFromBottom = Math.max(0, panelRect.bottom - detailsRect.top);
        minimapBottom = Math.round(detailsOffsetFromBottom + 12);
      }
    }

    if (minimapPanelEl) {
      const minimapRect = minimapPanelEl.getBoundingClientRect();
      const minimapHeight = minimapRect.height > 0 ? minimapRect.height : 180;
      const maxBottom = Math.max(16, Math.floor(panelRect.height - minimapHeight - 16));
      minimapBottom = clamp(minimapBottom, 16, maxBottom);
    }

    panelEl.style.setProperty('--tree-minimap-bottom', `${minimapBottom}px`);
  }

  function updateOverlayVisibilityLabels() {
    if (toolsVisibilityLabelEl) {
      toolsVisibilityLabelEl.textContent = state.isToolsVisible ? 'Hide Tools' : 'Show Tools';
    }
    if (detailsVisibilityLabelEl) {
      detailsVisibilityLabelEl.textContent = state.isDetailsVisible ? 'Hide Details' : 'Show Details';
    }
  }

  function applyOverlayVisibilityState() {
    panelEl.classList.toggle('tree-tools-hidden', !state.isToolsVisible);
    panelEl.classList.toggle('tree-details-hidden', !state.isDetailsVisible);
    updateOverlayVisibilityLabels();
    syncMobileFullscreenSheetState();
    syncDesktopMinimapVisibilityState();
    updateFullscreenOverlayOffsets();
    scheduleMinimapRender();
  }

  function setToolsVisible(isVisible) {
    state.isToolsVisible = Boolean(isVisible);
    applyOverlayVisibilityState();
    schedulePersistUiState();
  }

  function setDetailsVisible(isVisible) {
    state.isDetailsVisible = Boolean(isVisible);
    applyOverlayVisibilityState();
    schedulePersistUiState();
  }

  function setSearchToolsOpen(isOpen, options = {}) {
    const nextOpen = Boolean(isOpen);
    state.isSearchToolsOpen = nextOpen;
    panelEl.classList.toggle('tree-search-open', nextOpen);

    if (nextOpen && isFullscreenSheetLayout()) {
      state.isMobileSelectedOpen = false;
    }

    if (searchToggleLabelEl) {
      searchToggleLabelEl.textContent = nextOpen ? 'Hide Search' : 'Show Search';
    }

    if (searchToggleEl) {
      searchToggleEl.setAttribute('aria-expanded', nextOpen ? 'true' : 'false');
    }

    const shouldFocusInput = nextOpen
      && options.focusInput
      && searchNameEl
      && !isFullscreenSheetLayout();
    if (shouldFocusInput) {
      searchNameEl.focus();
    }

    syncMobileFullscreenSheetState();
    scheduleMinimapRender();
    schedulePersistUiState();
  }

  function setMobileSelectedOpen(isOpen, options = {}) {
    state.isMobileSelectedOpen = Boolean(isOpen);
    syncMobileFullscreenSheetState();
    if (options.persist !== false) {
      schedulePersistUiState();
    }
  }

  function resizeRenderer() {
    const rect = canvasHostEl.getBoundingClientRect();
    const width = Math.max(280, Math.floor(rect.width));
    const height = Math.max(220, Math.floor(rect.height));
    app.renderer.resize(width, height);
    if (state.emptyText) {
      state.emptyText.position.set(width / 2, height / 2);
    }
    updateSelectedNodePopup();
    updateFullscreenOverlayOffsets();
    scheduleMinimapRender();
  }

  function getViewportSize() {
    return {
      width: app.screen.width,
      height: app.screen.height,
    };
  }

  function scheduleMinimapRender() {
    if (!minimapPanelEl || !minimapCanvasEl || !isMinimapVisibleInCurrentViewport() || minimapRenderQueued || state.destroyed) {
      return;
    }
    minimapRenderQueued = true;
    requestAnimationFrame(() => {
      minimapRenderQueued = false;
      renderMinimap();
    });
  }

  function getViewportWorldBounds() {
    const scale = Math.max(world.scale.x, 0.0001);
    const viewport = getViewportSize();
    return {
      minX: -world.position.x / scale,
      minY: -world.position.y / scale,
      maxX: (viewport.width - world.position.x) / scale,
      maxY: (viewport.height - world.position.y) / scale,
    };
  }

  function getMinimapProjection(width, height) {
    if (width <= 0 || height <= 0) {
      return null;
    }

    const baseBounds = state.bounds;
    const contentWidth = Math.max(1, baseBounds.maxX - baseBounds.minX);
    const contentHeight = Math.max(1, baseBounds.maxY - baseBounds.minY);
    const xPadding = Math.max(NODE_WIDTH * 0.8, contentWidth * 0.06);
    const yPadding = Math.max(NODE_HEIGHT * 0.8, contentHeight * 0.08);
    const worldBounds = {
      minX: baseBounds.minX - xPadding,
      minY: baseBounds.minY - yPadding,
      maxX: baseBounds.maxX + xPadding,
      maxY: baseBounds.maxY + yPadding,
    };

    const worldWidth = Math.max(1, worldBounds.maxX - worldBounds.minX);
    const worldHeight = Math.max(1, worldBounds.maxY - worldBounds.minY);
    const padding = 6;
    const scale = Math.min((width - padding * 2) / worldWidth, (height - padding * 2) / worldHeight);
    if (!Number.isFinite(scale) || scale <= 0) {
      return null;
    }

    const scaledWidth = worldWidth * scale;
    const scaledHeight = worldHeight * scale;
    const offsetX = (width - scaledWidth) / 2 - worldBounds.minX * scale;
    const offsetY = (height - scaledHeight) / 2 - worldBounds.minY * scale;
    return { scale, offsetX, offsetY, worldBounds };
  }

  function renderMinimap() {
    if (!minimapCanvasEl || !isMinimapVisibleInCurrentViewport()) {
      return;
    }

    const context = minimapCanvasEl.getContext('2d');
    if (!context) {
      return;
    }

    const rect = minimapCanvasEl.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const targetWidth = Math.max(1, Math.round(width * dpr));
    const targetHeight = Math.max(1, Math.round(height * dpr));
    if (minimapCanvasEl.width !== targetWidth || minimapCanvasEl.height !== targetHeight) {
      minimapCanvasEl.width = targetWidth;
      minimapCanvasEl.height = targetHeight;
    }

    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, width, height);
    context.fillStyle = COLORS.minimapBackground;
    context.fillRect(0, 0, width, height);

    if (!state.data || !state.nodePositions.size) {
      context.fillStyle = COLORS.minimapEmptyText;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.font = '11px Inter, sans-serif';
      context.fillText('No tree data', width / 2, height / 2);
      return;
    }

    const projection = getMinimapProjection(width, height);
    if (!projection) {
      return;
    }

    context.lineWidth = 1;
    context.strokeStyle = COLORS.minimapLink;
    context.beginPath();
    for (const [nodeId, node] of Object.entries(state.data.nodes)) {
      const nodePosition = state.nodePositions.get(nodeId);
      if (!nodePosition) {
        continue;
      }

      for (const childId of [node.leftChildId, node.rightChildId]) {
        if (!childId) {
          continue;
        }
        const childPosition = state.nodePositions.get(childId);
        if (!childPosition) {
          continue;
        }

        context.moveTo(
          nodePosition.x * projection.scale + projection.offsetX,
          nodePosition.y * projection.scale + projection.offsetY,
        );
        context.lineTo(
          childPosition.x * projection.scale + projection.offsetX,
          childPosition.y * projection.scale + projection.offsetY,
        );
      }
    }
    context.stroke();

    context.strokeStyle = COLORS.minimapSpillover;
    context.lineWidth = MINIMAP_SPILLOVER_LINE_WIDTH;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    for (const [nodeId, node] of Object.entries(state.data.nodes)) {
      if (!node?.isSpillover || !node.sponsorId || !isSpilloverLineVisible(nodeId)) {
        continue;
      }

      const sponsorPosition = state.nodePositions.get(node.sponsorId);
      const nodePosition = state.nodePositions.get(nodeId);
      if (!sponsorPosition || !nodePosition) {
        continue;
      }

      const dashPattern = getSpilloverDashPattern(nodeId, true);
      context.setLineDash([dashPattern.dashLength, dashPattern.gapLength]);
      context.beginPath();
      context.moveTo(
        sponsorPosition.x * projection.scale + projection.offsetX,
        sponsorPosition.y * projection.scale + projection.offsetY,
      );
      context.lineTo(
        nodePosition.x * projection.scale + projection.offsetX,
        nodePosition.y * projection.scale + projection.offsetY,
      );
      context.stroke();
    }
    context.setLineDash([]);
    context.lineCap = 'butt';
    context.lineJoin = 'miter';

    const matchSet = hasActiveSearchFilters() ? new Set(state.searchMatches) : null;
    for (const [nodeId, point] of state.nodePositions.entries()) {
      const node = state.data.nodes[nodeId];
      if (!node) {
        continue;
      }

      const x = point.x * projection.scale + projection.offsetX;
      const y = point.y * projection.scale + projection.offsetY;
      const isSelected = state.selectedNodeId === nodeId;
      const isDimmed = Boolean(matchSet && !matchSet.has(nodeId));
      const size = isSelected ? 4.8 : 2.6;
      const baseColor = node.status === 'active' ? COLORS.minimapNodeActive : COLORS.minimapNodeInactive;
      const alpha = isDimmed ? 0.28 : 0.9;

      context.fillStyle = `rgba(${baseColor}, ${alpha})`;
      context.fillRect(x - size / 2, y - size / 2, size, size);

      if (isSelected) {
        context.strokeStyle = COLORS.minimapSelectedNodeStroke;
        context.lineWidth = 1.2;
        context.strokeRect(x - size, y - size, size * 2, size * 2);
      }
    }

    const viewportBounds = getViewportWorldBounds();
    const worldMinX = clamp(viewportBounds.minX, projection.worldBounds.minX, projection.worldBounds.maxX);
    const worldMinY = clamp(viewportBounds.minY, projection.worldBounds.minY, projection.worldBounds.maxY);
    const worldMaxX = clamp(viewportBounds.maxX, projection.worldBounds.minX, projection.worldBounds.maxX);
    const worldMaxY = clamp(viewportBounds.maxY, projection.worldBounds.minY, projection.worldBounds.maxY);

    let left = worldMinX * projection.scale + projection.offsetX;
    let right = worldMaxX * projection.scale + projection.offsetX;
    let top = worldMinY * projection.scale + projection.offsetY;
    let bottom = worldMaxY * projection.scale + projection.offsetY;

    left = clamp(left, 0, width);
    right = clamp(right, 0, width);
    top = clamp(top, 0, height);
    bottom = clamp(bottom, 0, height);

    let viewportWidth = Math.max(8, right - left);
    let viewportHeight = Math.max(8, bottom - top);
    left = clamp(left, 0, Math.max(0, width - viewportWidth));
    top = clamp(top, 0, Math.max(0, height - viewportHeight));
    viewportWidth = Math.min(viewportWidth, width);
    viewportHeight = Math.min(viewportHeight, height);

    context.fillStyle = COLORS.minimapViewportFill;
    context.strokeStyle = COLORS.minimapViewportStroke;
    context.lineWidth = 1.5;
    context.fillRect(left, top, viewportWidth, viewportHeight);
    context.strokeRect(
      left + 0.5,
      top + 0.5,
      Math.max(0, viewportWidth - 1),
      Math.max(0, viewportHeight - 1),
    );
  }

  function centerViewOnWorldPoint(worldX, worldY, options = {}) {
    const targetScale = clamp(
      isValidNumber(options.scale) ? options.scale : world.scale.x,
      MIN_ZOOM,
      MAX_ZOOM,
    );
    const viewport = getViewportSize();
    const viewportXRatio = clamp(
      isValidNumber(options.viewportXRatio) ? options.viewportXRatio : 0.5,
      0,
      1,
    );
    const viewportYRatio = clamp(
      isValidNumber(options.viewportYRatio) ? options.viewportYRatio : 0.5,
      0,
      1,
    );
    const targetX = viewport.width * viewportXRatio - worldX * targetScale;
    const targetY = viewport.height * viewportYRatio - worldY * targetScale;

    if (options.animate) {
      const startX = world.position.x;
      const startY = world.position.y;
      const startScale = world.scale.x;
      const scaleDelta = Math.abs(targetScale - startScale);
      const xDelta = Math.abs(targetX - startX);
      const yDelta = Math.abs(targetY - startY);
      if (scaleDelta < 0.0001 && xDelta < 0.5 && yDelta < 0.5) {
        stopCameraAnimation();
        world.scale.set(targetScale);
        world.position.set(targetX, targetY);
        refreshLodAfterCameraChange();
        updateSelectedNodePopup();
        scheduleMinimapRender();
        schedulePersistUiState();
        return;
      }

      stopCameraAnimation();
      const startedAt = performance.now();
      const duration = Math.max(180, Math.round(NAVIGATION_CAMERA_ANIMATION_DURATION_MS));
      const tick = (now) => {
        if (state.destroyed) {
          stopCameraAnimation();
          return;
        }
        const progress = clamp((now - startedAt) / duration, 0, 1);
        const eased = easeInOutSine(progress);

        world.scale.set(startScale + (targetScale - startScale) * eased);
        world.position.set(
          startX + (targetX - startX) * eased,
          startY + (targetY - startY) * eased,
        );
        refreshLodAfterCameraChange();
        updateSelectedNodePopup();
        scheduleMinimapRender();

        if (progress >= 1) {
          cameraAnimationFrameId = null;
          world.scale.set(targetScale);
          world.position.set(targetX, targetY);
          refreshLodAfterCameraChange();
          updateSelectedNodePopup();
          scheduleMinimapRender();
          schedulePersistUiState();
          return;
        }
        cameraAnimationFrameId = requestAnimationFrame(tick);
      };
      cameraAnimationFrameId = requestAnimationFrame(tick);
      return;
    }

    stopCameraAnimation();
    world.scale.set(targetScale);
    world.position.set(targetX, targetY);
    refreshLodAfterCameraChange();
    updateSelectedNodePopup();
    scheduleMinimapRender();
    schedulePersistUiState();
  }

  function getNavigationFocusViewportRatios() {
    if (isFullscreenSheetLayout()) {
      return {
        x: 0.5,
        y: MOBILE_NAVIGATION_FOCUS_VIEWPORT_Y_RATIO,
      };
    }
    return {
      x: 0.5,
      y: 0.5,
    };
  }

  function getMinimapWorldPointFromEvent(event) {
    if (!minimapCanvasEl || !state.data || !state.nodePositions.size) {
      return null;
    }

    const rect = minimapCanvasEl.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      return null;
    }

    const projection = getMinimapProjection(rect.width, rect.height);
    if (!projection) {
      return null;
    }

    const localX = clamp(event.clientX - rect.left, 0, rect.width);
    const localY = clamp(event.clientY - rect.top, 0, rect.height);
    const worldX = clamp(
      (localX - projection.offsetX) / projection.scale,
      projection.worldBounds.minX,
      projection.worldBounds.maxX,
    );
    const worldY = clamp(
      (localY - projection.offsetY) / projection.scale,
      projection.worldBounds.minY,
      projection.worldBounds.maxY,
    );
    return { x: worldX, y: worldY };
  }

  function updateCycleRuleText() {
    if (cycleRuleEl) {
      cycleRuleEl.textContent = `Left ${state.cycleRule.leftPvThreshold} BV / Right ${state.cycleRule.rightPvThreshold} BV`;
    }
  }

  function updateCycleSummary() {
    if (!cycleSummaryEl) {
      return;
    }

    const nodeIds = Array.from(state.nodePositions.keys());
    if (!state.data || !nodeIds.length) {
      cycleSummaryEl.textContent = '0 of 0 members qualify for current cycle rule.';
      return;
    }

    const eligibleCount = nodeIds.reduce((count, nodeId) => {
      const node = state.data.nodes[nodeId];
      return count + (node && isCycleEligible(node, state.cycleRule) ? 1 : 0);
    }, 0);

    cycleSummaryEl.textContent = `${eligibleCount} of ${nodeIds.length} members qualify for current cycle rule.`;
  }

  function hasActiveSearchFilters() {
    return Boolean(state.search.query)
      || state.search.minCycles !== null
      || state.search.status !== 'all'
      || Boolean(state.search.directOnly);
  }

  function collectSearchMatches() {
    if (!state.data) {
      return [];
    }

    const query = state.search.query.trim().toLowerCase();
    const minCycles = state.search.minCycles;
    const status = state.search.status;
    const sort = state.search.sort;
    const directOnly = Boolean(state.search.directOnly);
    const rootNodeId = state.data.rootId;

    const nodes = Object.values(state.data.nodes).filter((node) => {
      const nameMatch = !query
        || node.name.toLowerCase().includes(query)
        || node.memberCode.toLowerCase().includes(query)
        || node.id.toLowerCase().includes(query);

      const cycleMatch = minCycles === null || node.cycles >= minCycles;
      const statusMatch = status === 'all' || node.status === status;
      const directSponsorMatch = !directOnly || node.id === rootNodeId || node.sponsorId === rootNodeId;
      return nameMatch && cycleMatch && statusMatch && directSponsorMatch;
    });

    nodes.sort((a, b) => {
      const diff = a.addedAt - b.addedAt;
      if (sort === 'oldest') {
        return diff !== 0 ? diff : a.memberCode.localeCompare(b.memberCode);
      }
      return diff !== 0 ? -diff : a.memberCode.localeCompare(b.memberCode);
    });

    return nodes.map((node) => node.id);
  }

  function focusNode(nodeId, options = {}) {
    const point = state.nodePositions.get(nodeId);
    if (!point) {
      return;
    }

    const nextScale = options.ensureZoom
      ? clamp(Math.max(world.scale.x, NAVIGATION_FOCUS_MIN_ZOOM), MIN_ZOOM, MAX_ZOOM)
      : world.scale.x;
    const shouldAnimate = options.animate !== false;

    const focusViewportRatios = getNavigationFocusViewportRatios();
    centerViewOnWorldPoint(point.x, point.y, {
      scale: nextScale,
      animate: shouldAnimate,
      viewportXRatio: focusViewportRatios.x,
      viewportYRatio: focusViewportRatios.y,
    });
  }

  function resetSelectedPanelScrollPosition() {
    if (!selectedPanelEl) {
      return;
    }
    selectedPanelEl.scrollTop = 0;
  }

  function selectNode(nodeId, shouldFocus = false, focusOptions = {}) {
    if (!state.data || !state.data.nodes[nodeId]) {
      return;
    }
    stopCameraAnimation();
    const shouldRevealMobileSelected = focusOptions.revealMobileSelected !== false;
    state.selectedNodeId = nodeId;
    if (!state.nodePositions.has(nodeId)) {
      renderTree();
    }
    if (shouldFocus) {
      focusNode(nodeId, focusOptions);
    }
    if (isFullscreenSheetLayout() && shouldRevealMobileSelected) {
      if (state.isSearchToolsOpen) {
        setSearchToolsOpen(false);
      }
      setMobileSelectedOpen(true, { persist: false });
    }
    resetSelectedPanelScrollPosition();
    if (state.isFullscreen) {
      renderTree();
    } else {
      refreshNodeVisuals();
    }
    schedulePersistUiState();
  }

  function clearSelectedNode() {
    state.selectedNodeId = null;
    setMobileSelectedOpen(false, { persist: false });
    if (state.isFullscreen) {
      renderTree();
    } else {
      refreshNodeVisuals();
    }
    schedulePersistUiState();
  }

  function findFurthestDescendant(startNodeId, direction) {
    if (!state.data || !startNodeId || !state.data.nodes[startNodeId]) {
      return null;
    }

    let currentId = startNodeId;
    const visited = new Set([currentId]);
    while (true) {
      const currentNode = state.data.nodes[currentId];
      const nextId = direction === 'left' ? currentNode.leftChildId : currentNode.rightChildId;
      if (!nextId || !state.data.nodes[nextId] || visited.has(nextId)) {
        return currentId;
      }
      currentId = nextId;
      visited.add(currentId);
    }
  }

  function navigateToFurthest(direction, options = {}) {
    const startNodeId = state.data?.rootId;
    if (!startNodeId) {
      return;
    }
    const furthestNodeId = findFurthestDescendant(startNodeId, direction);
    if (!furthestNodeId) {
      return;
    }
    selectNode(furthestNodeId, true, {
      ensureZoom: true,
      revealMobileSelected: options.revealMobileSelected,
    });
  }

  function isSpilloverLineVisible(nodeId) {
    if (!nodeId) {
      return true;
    }
    return !state.hiddenSpilloverNodeIds.has(nodeId);
  }

  function getSpilloverRelationNodeIds(nodeId) {
    if (!state.data || !nodeId || !state.data.nodes[nodeId]) {
      return [];
    }

    const relatedSpilloverNodeIds = [];
    for (const [candidateId, candidateNode] of Object.entries(state.data.nodes)) {
      if (!candidateNode?.isSpillover || !candidateNode.sponsorId) {
        continue;
      }

      if (candidateId === nodeId || candidateNode.sponsorId === nodeId) {
        relatedSpilloverNodeIds.push(candidateId);
      }
    }
    return relatedSpilloverNodeIds;
  }

  function setSelectedSpilloverLineVisibility(isVisible) {
    if (!state.data || !state.selectedNodeId) {
      return;
    }

    const relatedSpilloverNodeIds = getSpilloverRelationNodeIds(state.selectedNodeId);
    if (!relatedSpilloverNodeIds.length) {
      return;
    }

    for (const spilloverNodeId of relatedSpilloverNodeIds) {
      if (isVisible) {
        state.hiddenSpilloverNodeIds.delete(spilloverNodeId);
      } else {
        state.hiddenSpilloverNodeIds.add(spilloverNodeId);
      }
    }
    renderTree();
    schedulePersistUiState();
  }

  function getDirectSponsorCount(nodeId) {
    if (!state.data || !nodeId) {
      return 0;
    }
    return Object.values(state.data.nodes).reduce((count, node) => (
      node.sponsorId === nodeId ? count + 1 : count
    ), 0);
  }

  function destroySelectedNodePopup() {
    hideNodePopupBadgeHovercard({ immediate: true });
    if (!state.selectedNodePopup) {
      return;
    }

    const popupContainer = state.selectedNodePopup.container;
    if (popupContainer?.parent) {
      popupContainer.parent.removeChild(popupContainer);
    }
    popupContainer?.destroy({ children: true });
    state.selectedNodePopup = null;
  }

  function buildSelectedNodePopup(node) {
    if (!node || !state.data) {
      destroySelectedNodePopup();
      return;
    }

    destroySelectedNodePopup();

    const popupContainer = new PIXI.Container();
    popupContainer.visible = false;
    popupContainer.interactive = true;
    popupContainer.interactiveChildren = true;
    try {
      popupContainer.eventMode = 'static';
    } catch {
      // Keep backwards compatibility for PIXI runtimes without eventMode.
    }

    const isLightTheme = activeThemeKey === 'light';
    const cardLeft = -NODE_POPUP_WIDTH / 2;
    const cardRight = NODE_POPUP_WIDTH / 2;
    const popupSurfaceColor = isLightTheme ? 0xffffff : 0x0f1a2a;
    const popupBorderColor = isLightTheme ? 0xb7cae1 : 0x35506a;
    const coverColor = node.status === 'active'
      ? (isLightTheme ? 0xe5f1ff : 0x1d3d5a)
      : (isLightTheme ? 0xf7efe3 : 0x3b3022);
    const coverAccentColor = node.status === 'active'
      ? (isLightTheme ? 0xb7d6ff : 0x2d5f8f)
      : (isLightTheme ? 0xe7d2af : 0x6f5230);
    const popupCoverImageUrl = String(
      node?.profileCoverUrl || node?.coverDataUrl || node?.coverUrl || '',
    ).trim();
    const hasPopupCoverImage = Boolean(popupCoverImageUrl);
    const coverBounds = {
      x: cardLeft + 1,
      y: 1,
      width: NODE_POPUP_WIDTH - 2,
      height: NODE_POPUP_COVER_HEIGHT,
    };

    const popupShadow = new PIXI.Graphics();
    popupShadow.beginFill(0x000000, isLightTheme ? 0.12 : 0.24);
    popupShadow.drawRoundedRect(
      cardLeft + 3,
      5,
      NODE_POPUP_WIDTH,
      NODE_POPUP_HEIGHT,
      18,
    );
    popupShadow.endFill();
    popupContainer.addChild(popupShadow);

    const pointerShadowGraphic = new PIXI.Graphics();
    popupContainer.addChild(pointerShadowGraphic);

    const pointerGraphic = new PIXI.Graphics();
    popupContainer.addChild(pointerGraphic);

    const popupSurface = new PIXI.Graphics();
    popupSurface.lineStyle(1.2, popupBorderColor, 0.95);
    popupSurface.beginFill(popupSurfaceColor, 0.99);
    popupSurface.drawRoundedRect(cardLeft, 0, NODE_POPUP_WIDTH, NODE_POPUP_HEIGHT, 16);
    popupSurface.endFill();
    popupContainer.addChild(popupSurface);

    const coverImageLayer = new PIXI.Container();
    popupContainer.addChild(coverImageLayer);
    const coverImageMask = new PIXI.Graphics();
    const coverMaskRadius = 16;
    coverImageMask.beginFill(0xffffff, 1);
    coverImageMask.moveTo(coverBounds.x, coverBounds.y + coverBounds.height);
    coverImageMask.lineTo(coverBounds.x, coverBounds.y + coverMaskRadius);
    coverImageMask.quadraticCurveTo(
      coverBounds.x,
      coverBounds.y,
      coverBounds.x + coverMaskRadius,
      coverBounds.y,
    );
    coverImageMask.lineTo(
      coverBounds.x + coverBounds.width - coverMaskRadius,
      coverBounds.y,
    );
    coverImageMask.quadraticCurveTo(
      coverBounds.x + coverBounds.width,
      coverBounds.y,
      coverBounds.x + coverBounds.width,
      coverBounds.y + coverMaskRadius,
    );
    coverImageMask.lineTo(
      coverBounds.x + coverBounds.width,
      coverBounds.y + coverBounds.height,
    );
    coverImageMask.lineTo(coverBounds.x, coverBounds.y + coverBounds.height);
    coverImageMask.closePath();
    coverImageMask.endFill();
    // PIXI masks should remain visible in scene graph transforms; disable render output instead.
    coverImageMask.renderable = false;
    popupContainer.addChild(coverImageMask);
    // Clip cover artwork to only the top cover strip so the body/container style stays unchanged.
    coverImageLayer.mask = coverImageMask;

    const normalizePopupCoverTexture = (candidateTexture) => {
      if (!candidateTexture || typeof candidateTexture !== 'object') {
        return null;
      }
      if (candidateTexture.baseTexture) {
        return candidateTexture;
      }
      if (candidateTexture.texture && candidateTexture.texture.baseTexture) {
        return candidateTexture.texture;
      }
      return null;
    };

    const isPopupCoverTextureReady = (candidateTexture) => {
      const texture = normalizePopupCoverTexture(candidateTexture);
      if (!texture) {
        return false;
      }
      const baseTexture = texture.baseTexture;
      if (!baseTexture || typeof baseTexture !== 'object') {
        return true;
      }
      const resourceSource = baseTexture.resource && baseTexture.resource.source
        ? baseTexture.resource.source
        : null;
      const sourceLooksReady = Boolean(
        resourceSource
        && typeof resourceSource.naturalWidth === 'number'
        && resourceSource.naturalWidth > 0
        && resourceSource.complete,
      );
      return Boolean(baseTexture.valid || sourceLooksReady);
    };

    const waitForPopupCoverTextureReady = async (candidateTexture) => {
      const texture = normalizePopupCoverTexture(candidateTexture);
      if (!texture) {
        return null;
      }

      const baseTexture = texture.baseTexture;
      if (!baseTexture || typeof baseTexture !== 'object') {
        return texture;
      }

      if (isPopupCoverTextureReady(texture)) {
        return texture;
      }

      return new Promise((resolve) => {
        let settled = false;
        let timeoutId = null;
        const settle = (nextTexture) => {
          if (settled) {
            return;
          }
          settled = true;
          if (timeoutId !== null) {
            clearTimeout(timeoutId);
          }
          if (typeof baseTexture.off === 'function') {
            baseTexture.off('loaded', handleLoaded);
            baseTexture.off('update', handleLoaded);
            baseTexture.off('error', handleError);
          }
          resolve(nextTexture);
        };

        const handleLoaded = () => {
          settle(texture);
        };
        const handleError = () => {
          settle(null);
        };

        if (typeof baseTexture.on === 'function') {
          baseTexture.on('loaded', handleLoaded);
          baseTexture.on('update', handleLoaded);
          baseTexture.on('error', handleError);
        }

        timeoutId = setTimeout(() => {
          // Return the texture even if not fully ready yet; sprite resources
          // can continue resolving in-place and we keep fallback overlay until ready.
          settle(texture);
        }, 2200);
      });
    };

    const loadPopupCoverTexture = async (coverImagePath) => {
      if (!coverImagePath) {
        return null;
      }

      const loadTextureFromImageElement = async () => {
        if (typeof Image !== 'function') {
          return null;
        }

        return new Promise((resolve) => {
          const image = new Image();
          image.decoding = 'async';
          image.crossOrigin = 'anonymous';
          image.onload = () => {
            try {
              resolve(PIXI.Texture.from(image));
            } catch {
              resolve(null);
            }
          };
          image.onerror = () => {
            resolve(null);
          };
          image.src = coverImagePath;
        });
      };

      // Data URLs commonly used by profile uploads are more reliable through
      // an Image element decode path than direct PIXI texture string loaders.
      if (/^data:image\//i.test(coverImagePath)) {
        const imageTexture = await loadTextureFromImageElement();
        const readyImageTexture = await waitForPopupCoverTextureReady(imageTexture);
        if (readyImageTexture) {
          return readyImageTexture;
        }
      }

      if (PIXI?.Assets && typeof PIXI.Assets.load === 'function') {
        try {
          const loadedTexture = await PIXI.Assets.load(coverImagePath);
          const readyAssetTexture = await waitForPopupCoverTextureReady(loadedTexture);
          if (readyAssetTexture) {
            return readyAssetTexture;
          }
        } catch {
          // Fall through to legacy texture loader.
        }
      }

      try {
        const directTexture = PIXI.Texture.from(coverImagePath);
        const readyDirectTexture = await waitForPopupCoverTextureReady(directTexture);
        if (readyDirectTexture) {
          return readyDirectTexture;
        }
      } catch {
        // Fall through to image decode fallback.
      }

      try {
        const imageTexture = await loadTextureFromImageElement();
        return await waitForPopupCoverTextureReady(imageTexture);
      } catch {
        return null;
      }
    };

    const cover = new PIXI.Graphics();
    const drawCoverOverlay = (imageLoaded = false) => {
      const coverBaseAlpha = imageLoaded
        ? (isLightTheme ? 0.08 : 0.12)
        : 0.98;
      const coverAccentAlpha = imageLoaded
        ? 0
        : (isLightTheme ? 0.24 : 0.26);
      const coverGlowAlpha = imageLoaded
        ? 0
        : (isLightTheme ? 0.2 : 0.12);

      // Keep popup readable while avoiding decorative blockers over a real loaded cover.
      cover.clear();
      cover.beginFill(coverColor, coverBaseAlpha);
      cover.drawRoundedRect(
        coverBounds.x,
        coverBounds.y,
        coverBounds.width,
        coverBounds.height,
        16,
      );
      cover.endFill();
      if (coverAccentAlpha > 0) {
        cover.beginFill(coverAccentColor, coverAccentAlpha);
        cover.drawRoundedRect(
          cardLeft + 1,
          1,
          (NODE_POPUP_WIDTH - 2) * 0.68,
          NODE_POPUP_COVER_HEIGHT,
          16,
        );
        cover.endFill();
      }
      if (coverGlowAlpha > 0) {
        cover.beginFill(isLightTheme ? 0xffffff : 0x78a9d8, coverGlowAlpha);
        cover.drawCircle(cardRight - 34, NODE_POPUP_COVER_HEIGHT - 20, 34);
        cover.endFill();
      }
      cover.lineStyle(1, popupBorderColor, 0.42);
      cover.moveTo(cardLeft + 1, NODE_POPUP_COVER_HEIGHT + 1);
      cover.lineTo(cardRight - 1, NODE_POPUP_COVER_HEIGHT + 1);
    };

    drawCoverOverlay(false);
    popupContainer.addChild(cover);

    if (hasPopupCoverImage) {
      Promise.resolve(loadPopupCoverTexture(popupCoverImageUrl))
        .then((resolvedTexture) => {
          if (!resolvedTexture || !coverImageLayer || coverImageLayer.destroyed || popupContainer.destroyed) {
            return;
          }

          let coverSprite = null;
          try {
            coverSprite = new PIXI.Sprite(resolvedTexture);
          } catch {
            return;
          }
          coverSprite.position.set(coverBounds.x, coverBounds.y);
          coverSprite.width = coverBounds.width;
          coverSprite.height = coverBounds.height;
          coverSprite.alpha = 0.96;
          coverImageLayer.addChild(coverSprite);

          if (isPopupCoverTextureReady(resolvedTexture)) {
            drawCoverOverlay(true);
            return;
          }

          const baseTexture = resolvedTexture.baseTexture;
          if (!baseTexture || typeof baseTexture.on !== 'function') {
            return;
          }

          const applyLoadedOverlay = () => {
            if (
              !popupContainer
              || popupContainer.destroyed
              || !coverImageLayer
              || coverImageLayer.destroyed
            ) {
              return;
            }
            if (typeof baseTexture.off === 'function') {
              baseTexture.off('loaded', applyLoadedOverlay);
              baseTexture.off('update', applyLoadedOverlay);
              baseTexture.off('error', removeTextureListeners);
            }
            drawCoverOverlay(true);
          };

          const removeTextureListeners = () => {
            if (typeof baseTexture.off === 'function') {
              baseTexture.off('loaded', applyLoadedOverlay);
              baseTexture.off('update', applyLoadedOverlay);
              baseTexture.off('error', removeTextureListeners);
            }
          };

          baseTexture.on('loaded', applyLoadedOverlay);
          baseTexture.on('update', applyLoadedOverlay);
          baseTexture.on('error', removeTextureListeners);
        })
        .catch(() => {
          // Keep procedural fallback overlay when image texture fails.
        });
    }

    const profileName = resolveNodePopupDisplayName(node, 30);
    const popupHeaderIconEntries = resolveNodePopupHeaderIconEntries(node, isLightTheme);
    const profileHandleMaxLength = popupHeaderIconEntries.length >= 3
      ? 14
      : (popupHeaderIconEntries.length === 2 ? 18 : (popupHeaderIconEntries.length === 1 ? 24 : 34));
    const profileHandle = truncateNodeLabel(formatMemberHandle(node.memberCode), profileHandleMaxLength);

    const avatarCenterX = cardLeft + NODE_POPUP_AVATAR_RADIUS + 24;
    const avatarCenterY = NODE_POPUP_COVER_HEIGHT + 2;
    const avatarRing = new PIXI.Graphics();
    avatarRing.lineStyle(2.4, popupSurfaceColor, 1);
    avatarRing.beginFill(isLightTheme ? 0xf2f7ff : 0x1a2d45, 1);
    avatarRing.drawCircle(avatarCenterX, avatarCenterY, NODE_POPUP_AVATAR_RADIUS);
    avatarRing.endFill();
    popupContainer.addChild(avatarRing);

    const avatarInitials = new PIXI.Text(
      getNodeInitials(profileName),
      nodePopupAvatarInitialStyle,
    );
    avatarInitials.anchor.set(0.5);
    avatarInitials.position.set(avatarCenterX, avatarCenterY);
    popupContainer.addChild(avatarInitials);

    const nameX = cardLeft + 16;
    const nameY = avatarCenterY + NODE_POPUP_AVATAR_RADIUS + 8;

    const profileNameText = new PIXI.Text(profileName, nodePopupNameStyle);
    profileNameText.position.set(nameX, nameY);
    popupContainer.addChild(profileNameText);

    const handleText = new PIXI.Text(profileHandle, nodePopupHandleStyle);
    handleText.position.set(nameX, nameY + profileNameText.height + 1);
    popupContainer.addChild(handleText);

    const popupHeaderIconSize = 18;
    const popupHeaderIconGap = 2;
    const popupHeaderIconTotalWidth = (
      popupHeaderIconEntries.length * popupHeaderIconSize
    ) + ((Math.max(0, popupHeaderIconEntries.length - 1)) * popupHeaderIconGap);
    const popupHeaderIconsStartX = clamp(
      handleText.position.x + handleText.width + 8,
      handleText.position.x + 8,
      cardRight - popupHeaderIconTotalWidth - 14,
    );
    const popupHeaderIconY = handleText.position.y - 1;
    if (popupHeaderIconEntries.length > 0) {
      const resolveCanvasScaleMetrics = () => {
        const canvasRect = app.view.getBoundingClientRect();
        const rendererWidth = Math.max(1, Number(app.renderer?.width) || 1);
        const rendererHeight = Math.max(1, Number(app.renderer?.height) || 1);
        return {
          canvasRect,
          canvasScaleX: canvasRect.width / rendererWidth,
          canvasScaleY: canvasRect.height / rendererHeight,
        };
      };

      const loadPopupHeaderIconTexture = async (iconPath) => {
        if (!iconPath) {
          return null;
        }

        if (PIXI?.Assets && typeof PIXI.Assets.load === 'function') {
          try {
            const loadedTexture = await PIXI.Assets.load(iconPath);
            if (loadedTexture) {
              return loadedTexture;
            }
          } catch {
            // Fall through to legacy texture loader.
          }
        }

        try {
          return PIXI.Texture.from(iconPath);
        } catch {
          return null;
        }
      };

      popupHeaderIconEntries.forEach((iconEntry, index) => {
        const iconBaseX = popupHeaderIconsStartX + index * (popupHeaderIconSize + popupHeaderIconGap);
        const iconBaseY = popupHeaderIconY;

        Promise.resolve(loadPopupHeaderIconTexture(iconEntry.iconPath))
          .then((resolvedTexture) => {
            if (
              !resolvedTexture
              || !popupContainer
              || popupContainer.destroyed
              || !state.selectedNodePopup
              || state.selectedNodePopup.container !== popupContainer
            ) {
              return;
            }

            let headerIcon = null;
            try {
              headerIcon = new PIXI.Sprite(resolvedTexture);
            } catch {
              return;
            }

            headerIcon.width = popupHeaderIconSize;
            headerIcon.height = popupHeaderIconSize;
            headerIcon.position.set(iconBaseX, iconBaseY);
            headerIcon.alpha = 0.98;
            headerIcon.tint = 0xFFFFFF;

            const toAnchorRect = () => {
              const { canvasRect, canvasScaleX, canvasScaleY } = resolveCanvasScaleMetrics();
              const topLeft = popupContainer.toGlobal(new PIXI.Point(iconBaseX, iconBaseY));
              const bottomRight = popupContainer.toGlobal(new PIXI.Point(
                iconBaseX + popupHeaderIconSize,
                iconBaseY + popupHeaderIconSize,
              ));

              const left = canvasRect.left + (Math.min(topLeft.x, bottomRight.x) * canvasScaleX);
              const top = canvasRect.top + (Math.min(topLeft.y, bottomRight.y) * canvasScaleY);
              const right = canvasRect.left + (Math.max(topLeft.x, bottomRight.x) * canvasScaleX);
              const bottom = canvasRect.top + (Math.max(topLeft.y, bottomRight.y) * canvasScaleY);
              return {
                left,
                top,
                right,
                bottom,
                width: Math.max(1, right - left),
                height: Math.max(1, bottom - top),
              };
            };

            try {
              headerIcon.interactive = true;
              headerIcon.buttonMode = true;
              headerIcon.cursor = 'pointer';
              headerIcon.eventMode = 'static';
              const resetIconPose = () => {
                if (!headerIcon || headerIcon.destroyed) {
                  return;
                }
                headerIcon.scale.set(1);
                headerIcon.width = popupHeaderIconSize;
                headerIcon.height = popupHeaderIconSize;
                headerIcon.position.set(iconBaseX, iconBaseY);
                headerIcon.alpha = 0.98;
                headerIcon.tint = 0xFFFFFF;
              };
              const hoverIconPose = () => {
                if (!headerIcon || headerIcon.destroyed) {
                  return;
                }
                headerIcon.scale.set(1);
                headerIcon.width = popupHeaderIconSize;
                headerIcon.height = popupHeaderIconSize;
                headerIcon.position.set(iconBaseX, iconBaseY);
                headerIcon.alpha = 1;
                headerIcon.tint = isLightTheme ? 0xF3FAFF : 0xFFFFFF;
              };
              headerIcon
                .on('pointerover', () => {
                  hoverIconPose();
                  showNodePopupBadgeHovercard(iconEntry, toAnchorRect());
                })
                .on('pointerout', () => {
                  resetIconPose();
                  scheduleNodePopupBadgeHovercardHide();
                })
                .on('pointerupoutside', () => {
                  resetIconPose();
                  scheduleNodePopupBadgeHovercardHide();
                })
                .on('pointerdown', () => {
                  clearNodePopupBadgeHoverHideTimer();
                  headerIcon.scale.set(1);
                  headerIcon.width = popupHeaderIconSize;
                  headerIcon.height = popupHeaderIconSize;
                  headerIcon.position.set(iconBaseX, iconBaseY);
                  headerIcon.alpha = 0.94;
                  headerIcon.tint = 0xFFFFFF;
                })
                .on('pointerup', () => {
                  resetIconPose();
                  if (shouldKeepNodePopupBadgeHovercardOpen()) {
                    clearNodePopupBadgeHoverHideTimer();
                    return;
                  }
                  scheduleNodePopupBadgeHovercardHide();
                });
            } catch {
              // Keep icons non-interactive when runtime event APIs differ across PIXI versions.
            }

            popupContainer.addChild(headerIcon);
          })
          .catch(() => {
            // Keep the handle row stable even when icon textures fail to load.
          });
      });
    }

    const popupHeaderContentBottomY = popupHeaderIconEntries.length > 0
      ? Math.max(handleText.position.y + handleText.height, popupHeaderIconY + popupHeaderIconSize)
      : (handleText.position.y + handleText.height);
    const dividerY = clamp(
      popupHeaderContentBottomY + 18,
      NODE_POPUP_COVER_HEIGHT + 74,
      NODE_POPUP_HEIGHT - 150,
    );
    const metricsPanelTop = dividerY + 36;
    const popupBottomPadding = 28;
    const popupMinMetricsPanelHeight = 132;
    const popupHeight = Math.max(
      NODE_POPUP_HEIGHT,
      metricsPanelTop + popupMinMetricsPanelHeight + popupBottomPadding,
    );

    if (popupHeight !== NODE_POPUP_HEIGHT) {
      popupShadow.clear();
      popupShadow.beginFill(0x000000, isLightTheme ? 0.12 : 0.24);
      popupShadow.drawRoundedRect(
        cardLeft + 3,
        5,
        NODE_POPUP_WIDTH,
        popupHeight,
        18,
      );
      popupShadow.endFill();

      popupSurface.clear();
      popupSurface.lineStyle(1.2, popupBorderColor, 0.95);
      popupSurface.beginFill(popupSurfaceColor, 0.99);
      popupSurface.drawRoundedRect(cardLeft, 0, NODE_POPUP_WIDTH, popupHeight, 16);
      popupSurface.endFill();
    }

    const binaryDataLabel = new PIXI.Text('BINARY TREE DATA', nodePopupSectionLabelStyle);
    binaryDataLabel.position.set(cardLeft + 14, dividerY + 8);
    popupContainer.addChild(binaryDataLabel);

    const divider = new PIXI.Graphics();
    divider.lineStyle(1, popupBorderColor, 0.34);
    divider.moveTo(cardLeft + 14, dividerY);
    divider.lineTo(cardRight - 14, dividerY);
    popupContainer.addChild(divider);

    const metricsPanelHeight = popupHeight - metricsPanelTop - popupBottomPadding;
    const metricsPanel = new PIXI.Graphics();
    metricsPanel.lineStyle(1, popupBorderColor, 0.22);
    metricsPanel.beginFill(isLightTheme ? 0xf5f9ff : 0x0b1422, 0.86);
    metricsPanel.drawRoundedRect(
      cardLeft + 12,
      metricsPanelTop,
      NODE_POPUP_WIDTH - 24,
      metricsPanelHeight,
      11,
    );
    metricsPanel.endFill();
    popupContainer.addChild(metricsPanel);

    const displayLegVolumes = getNodeDisplayLegVolumes(node);
    const metrics = [
      { label: 'Left Team', value: `${displayLegVolumes.leftBv.toLocaleString()} BV`, column: 0, row: 0 },
      { label: 'Right Team', value: `${displayLegVolumes.rightBv.toLocaleString()} BV`, column: 1, row: 0 },
      { label: 'Cycles', value: `${sanitizeVolume(node.cycles).toLocaleString()}`, column: 0, row: 1 },
      { label: 'Direct', value: `${getDirectSponsorCount(node.id).toLocaleString()}`, column: 1, row: 1 },
    ];

    const metricsStartX = cardLeft + 30;
    const metricsStartY = metricsPanelTop + 16;
    const metricsInnerWidth = NODE_POPUP_WIDTH - 60;
    const metricColumnGap = 20;
    const metricColumnWidth = (metricsInnerWidth - metricColumnGap) / 2;
    const metricRowGap = 52;

    const metricVerticalDivider = new PIXI.Graphics();
    metricVerticalDivider.lineStyle(1, popupBorderColor, 0.24);
    metricVerticalDivider.moveTo(
      metricsStartX + metricColumnWidth + (metricColumnGap / 2),
      metricsStartY,
    );
    metricVerticalDivider.lineTo(
      metricsStartX + metricColumnWidth + (metricColumnGap / 2),
      metricsStartY + (metricRowGap * 2) - 16,
    );
    popupContainer.addChild(metricVerticalDivider);

    const metricHorizontalDivider = new PIXI.Graphics();
    metricHorizontalDivider.lineStyle(1, popupBorderColor, 0.18);
    metricHorizontalDivider.moveTo(metricsStartX, metricsStartY + metricRowGap - 8);
    metricHorizontalDivider.lineTo(metricsStartX + metricsInnerWidth, metricsStartY + metricRowGap - 8);
    popupContainer.addChild(metricHorizontalDivider);

    for (const metric of metrics) {
      const metricX = metricsStartX + (metric.column * (metricColumnWidth + metricColumnGap));
      const metricY = metricsStartY + (metric.row * metricRowGap);

      const metricLabelText = new PIXI.Text(metric.label, nodePopupMetricLabelStyle);
      metricLabelText.position.set(metricX, metricY);
      popupContainer.addChild(metricLabelText);

      const metricValueText = new PIXI.Text(metric.value, nodePopupMetricValueStyle);
      metricValueText.position.set(metricX, metricY + 16);
      popupContainer.addChild(metricValueText);
    }

    const isEligibleForCycle = isCycleEligible(node, state.cycleRule);
    const eligibilityText = new PIXI.Text(
      isEligibleForCycle ? 'Cycle Status: Eligible' : 'Cycle Status: Not Eligible',
      {
        fontFamily: 'Inter',
        fontSize: 11,
        fontWeight: '600',
        fill: isEligibleForCycle
          ? (isLightTheme ? 0x295bb6 : 0x89b2ea)
          : COLORS.textSecondary,
        align: 'center',
      },
    );
    eligibilityText.anchor.set(0.5, 0);
    eligibilityText.position.set(0, popupHeight - 24);
    popupContainer.addChild(eligibilityText);

    selectedNodePopupLayer.addChild(popupContainer);
    state.selectedNodePopup = {
      nodeId: node.id,
      container: popupContainer,
      pointerGraphic,
      pointerShadowGraphic,
      popupSurfaceColor,
      popupBorderColor,
      popupHeight,
    };
  }

  function positionSelectedNodePopup(nodePosition) {
    if (!state.selectedNodePopup || !nodePosition) {
      hideNodePopupBadgeHovercard({ immediate: true });
      return;
    }

    const anchorPoint = world.toGlobal(new PIXI.Point(
      nodePosition.x,
      nodePosition.y - TREE_SIMPLE_NODE_RADIUS - NODE_POPUP_ANCHOR_OFFSET_Y,
    ));

    if (!isValidNumber(anchorPoint?.x) || !isValidNumber(anchorPoint?.y)) {
      hideNodePopupBadgeHovercard({ immediate: true });
      state.selectedNodePopup.container.visible = false;
      return;
    }

    const viewport = getViewportSize();
    const popupHalfWidth = NODE_POPUP_WIDTH / 2;
    const minCenterX = NODE_POPUP_SCREEN_MARGIN + popupHalfWidth;
    const maxCenterX = Math.max(minCenterX, viewport.width - NODE_POPUP_SCREEN_MARGIN - popupHalfWidth);
    const popupCenterX = clamp(anchorPoint.x, minCenterX, maxCenterX);

    const popupHeight = Math.max(
      1,
      Number(state.selectedNodePopup.popupHeight) || NODE_POPUP_HEIGHT,
    );
    const viewportMaxTop = Math.max(
      NODE_POPUP_TOP_MARGIN,
      viewport.height - popupHeight - NODE_POPUP_SCREEN_MARGIN,
    );
    const naturalTopAbove = anchorPoint.y - NODE_POPUP_POINTER_HEIGHT - popupHeight;
    const canPlaceAbove = naturalTopAbove >= NODE_POPUP_TOP_MARGIN;
    const isPlacedBelow = !canPlaceAbove;
    const popupTop = canPlaceAbove
      ? clamp(naturalTopAbove, NODE_POPUP_TOP_MARGIN, viewportMaxTop)
      : clamp(
        anchorPoint.y + NODE_POPUP_POINTER_HEIGHT + 2,
        NODE_POPUP_TOP_MARGIN,
        viewportMaxTop,
      );
    const popupBottom = popupTop + popupHeight;

    const pointerLength = isPlacedBelow
      ? clamp(popupTop - anchorPoint.y, 2, NODE_POPUP_POINTER_HEIGHT)
      : clamp(anchorPoint.y - popupBottom, 2, NODE_POPUP_POINTER_HEIGHT);
    const pointerHalfWidth = 11;
    const pointerX = clamp(
      anchorPoint.x - popupCenterX,
      -popupHalfWidth + pointerHalfWidth + 6,
      popupHalfWidth - pointerHalfWidth - 6,
    );
    const pointerBaseY = isPlacedBelow ? 0.5 : (popupHeight - 0.5);

    const pointerGraphic = state.selectedNodePopup.pointerGraphic;
    pointerGraphic.clear();
    pointerGraphic.lineStyle(1.2, state.selectedNodePopup.popupBorderColor, 0.9);
    pointerGraphic.beginFill(state.selectedNodePopup.popupSurfaceColor, 0.985);
    pointerGraphic.moveTo(pointerX - pointerHalfWidth, pointerBaseY);
    pointerGraphic.lineTo(pointerX + pointerHalfWidth, pointerBaseY);
    pointerGraphic.lineTo(pointerX, pointerBaseY + (isPlacedBelow ? -pointerLength : pointerLength));
    pointerGraphic.closePath();
    pointerGraphic.endFill();

    const pointerShadowGraphic = state.selectedNodePopup.pointerShadowGraphic;
    pointerShadowGraphic.clear();
    pointerShadowGraphic.beginFill(0x000000, activeThemeKey === 'light' ? 0.1 : 0.2);
    pointerShadowGraphic.moveTo(pointerX - pointerHalfWidth + 1.5, pointerBaseY + 1.5);
    pointerShadowGraphic.lineTo(pointerX + pointerHalfWidth + 1.5, pointerBaseY + 1.5);
    pointerShadowGraphic.lineTo(
      pointerX + 1.5,
      pointerBaseY + (isPlacedBelow ? -pointerLength : pointerLength) + 1.5,
    );
    pointerShadowGraphic.closePath();
    pointerShadowGraphic.endFill();

    state.selectedNodePopup.container.position.set(popupCenterX, popupTop);
    state.selectedNodePopup.container.visible = true;
  }

  function updateSelectedNodePopup(options = {}) {
    const shouldRebuild = options.rebuild === true;
    if (!state.data || !state.selectedNodeId || !state.data.nodes[state.selectedNodeId]) {
      destroySelectedNodePopup();
      return;
    }

    const selectedNode = state.data.nodes[state.selectedNodeId];
    const selectedNodePosition = state.nodePositions.get(state.selectedNodeId);
    if (!selectedNodePosition) {
      destroySelectedNodePopup();
      return;
    }

    if (
      shouldRebuild
      || !state.selectedNodePopup
      || state.selectedNodePopup.nodeId !== selectedNode.id
    ) {
      buildSelectedNodePopup(selectedNode);
    }

    positionSelectedNodePopup(selectedNodePosition);
  }

  function resolvePlacementParentNode(node) {
    if (!state.data || !node?.id) {
      return null;
    }

    if (node.placementParentId && state.data.nodes[node.placementParentId]) {
      return state.data.nodes[node.placementParentId];
    }

    // Fallback from actual rendered child linkage when placement metadata is partial.
    for (const candidateNode of Object.values(state.data.nodes)) {
      if (!candidateNode) {
        continue;
      }
      if (candidateNode.leftChildId === node.id || candidateNode.rightChildId === node.id) {
        return candidateNode;
      }
    }

    return null;
  }

  function setRelationNavButton(buttonEl, label, targetNodeId) {
    if (!buttonEl) {
      return;
    }
    buttonEl.textContent = label || '-';
    buttonEl.dataset.targetNodeId = targetNodeId || '';
    const canNavigate = Boolean(targetNodeId && state.data && state.data.nodes[targetNodeId]);
    buttonEl.disabled = !canNavigate;
    buttonEl.setAttribute('aria-disabled', canNavigate ? 'false' : 'true');
  }

  function renderSearchResults() {
    if (!searchResultsEl || !searchResultsCountEl) {
      return;
    }

    const total = state.data ? Object.keys(state.data.nodes).length : 0;
    const matches = state.searchMatches;
    searchResultsCountEl.textContent = `Showing ${matches.length} of ${total} nodes.`;

    searchResultsEl.innerHTML = '';

    if (!state.data || !matches.length) {
      const empty = document.createElement('p');
      empty.className = 'text-caption text-text-tertiary px-1 py-1';
      empty.textContent = 'No nodes match the current filters.';
      searchResultsEl.appendChild(empty);
      return;
    }

    const visible = matches.slice(0, 40);
    for (const nodeId of visible) {
      const node = state.data.nodes[nodeId];
      if (!node) {
        continue;
      }
      const statusClass = node.status === 'active' ? 'text-semantic-success' : 'text-semantic-warning';
      const eligibleLabel = isCycleEligible(node, state.cycleRule) ? 'Eligible' : 'Not Eligible';
      const sponsorTypeLabel = node.isSpillover ? 'Spillover' : 'Direct';
      const secondaryMetricText = formatSecondaryMetricText(node, secondaryMetricMode);
      const displayLegVolumes = getNodeDisplayLegVolumes(node);
      const showCountryFlag = !shouldHideNodeRankAndCountry(node);
      const countryFlagClass = showCountryFlag ? getCountryFlagCssClass(node.countryFlag) : '';
      const countryFlagMarkup = showCountryFlag
        ? `<span class="inline-flex items-center"><span class="${countryFlagClass}" aria-hidden="true"></span></span>`
        : '';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'w-full text-left rounded-lg border border-surface-border bg-surface-raised px-2 py-1.5 hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 active:scale-[0.99] transition-transform duration-150 ease-spring';
      button.innerHTML = `
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <p class="text-body-sm text-text-primary truncate">${escapeHtml(node.name)}</p>
            <p class="text-caption text-text-tertiary truncate">${escapeHtml(formatMemberHandle(node.memberCode))} | ${escapeHtml(formatAddedAt(node.addedAt))}</p>
          </div>
          <p class="text-caption ${statusClass}">${escapeHtml(formatStatus(node.status))}</p>
        </div>
        <div class="flex flex-wrap gap-2 mt-1 text-caption text-text-secondary">
          <span>${escapeHtml(secondaryMetricText)}</span>
          <span>L Team: ${displayLegVolumes.leftBv.toLocaleString()} BV</span>
          <span>R Team: ${displayLegVolumes.rightBv.toLocaleString()} BV</span>
          ${countryFlagMarkup}
          <span>${eligibleLabel}</span>
          <span>${sponsorTypeLabel}</span>
        </div>
      `;
      button.addEventListener('click', () => selectNode(nodeId, true, { ensureZoom: true }));
      searchResultsEl.appendChild(button);
    }

    if (matches.length > visible.length) {
      const more = document.createElement('p');
      more.className = 'text-caption text-text-tertiary px-1 py-1';
      more.textContent = `+${matches.length - visible.length} more results`;
      searchResultsEl.appendChild(more);
    }
  }

  function applySearchState() {
    state.searchMatches = collectSearchMatches();
    renderSearchResults();
    refreshNodeVisuals();
  }

  function syncSearchFromInputs() {
    state.search.query = searchNameEl ? searchNameEl.value.trim() : '';

    const parsedMinCycles = searchCycleEl && searchCycleEl.value.trim() !== ''
      ? Number.parseInt(searchCycleEl.value, 10)
      : NaN;
    state.search.minCycles = Number.isFinite(parsedMinCycles) && parsedMinCycles >= 0 ? parsedMinCycles : null;

    const status = searchStatusEl ? searchStatusEl.value : 'all';
    state.search.status = status === 'active' || status === 'inactive' ? status : 'all';

    const sort = searchSortEl ? searchSortEl.value : 'latest';
    state.search.sort = sort === 'oldest' ? 'oldest' : 'latest';
    state.search.directOnly = Boolean(state.search.directOnly);

    applySearchState();
    schedulePersistUiState();
  }

  function toggleDirectSponsorFilter() {
    state.search.directOnly = !Boolean(state.search.directOnly);
    syncSearchDirectToggleUi();
    applySearchState();
    schedulePersistUiState();
  }

  function clearSearch() {
    state.search = createDefaultSearchState();
    if (searchNameEl) {
      searchNameEl.value = '';
    }
    if (searchCycleEl) {
      searchCycleEl.value = '';
    }
    if (searchStatusEl) {
      searchStatusEl.value = 'all';
    }
    if (searchSortEl) {
      searchSortEl.value = 'latest';
    }
    syncSearchDirectToggleUi();
    applySearchState();
    schedulePersistUiState();
  }

  function updateSelectedNodePanel() {
    if (!selectedMemberEl || !selectedStatusEl || !selectedLeftEl || !selectedRightEl || !selectedCyclesEl || !selectedEligibleEl) {
      return;
    }

    if (!state.data || !state.selectedNodeId || !state.data.nodes[state.selectedNodeId]) {
      selectedMemberEl.textContent = 'Tap a node to inspect details.';
      selectedStatusEl.textContent = '-';
      if (selectedDirectSponsorCountEl) {
        selectedDirectSponsorCountEl.textContent = '-';
      }
      if (selectedSponsorEl) {
        setRelationNavButton(selectedSponsorEl, '-', null);
      }
      if (selectedPlacementParentEl) {
        setRelationNavButton(selectedPlacementParentEl, '-', null);
      }
      if (selectedSpilloverEl) {
        selectedSpilloverEl.textContent = '-';
      }
      if (selectedCountryCodeEl) {
        selectedCountryCodeEl.textContent = '-';
      }
      if (selectedSpilloverLineToggleEl) {
        selectedSpilloverLineToggleEl.checked = true;
        selectedSpilloverLineToggleEl.indeterminate = false;
        selectedSpilloverLineToggleEl.disabled = true;
        selectedSpilloverLineToggleEl.setAttribute('aria-disabled', 'true');
      }
      selectedLeftEl.textContent = '-';
      selectedRightEl.textContent = '-';
      selectedCyclesEl.textContent = resolveSelectedSecondaryMetricValue(null, secondaryMetricMode);
      selectedEligibleEl.textContent = '-';
      return;
    }

    const selectedNode = state.data.nodes[state.selectedNodeId];
    selectedMemberEl.textContent = `${selectedNode.name} (${formatMemberHandle(selectedNode.memberCode)})`;
    selectedStatusEl.textContent = formatStatus(selectedNode.status);
    if (selectedDirectSponsorCountEl) {
      selectedDirectSponsorCountEl.textContent = `${getDirectSponsorCount(selectedNode.id)}`;
    }
    if (selectedSponsorEl) {
      if (shouldApplyNodePrivacyMask(selectedNode)) {
        setRelationNavButton(selectedSponsorEl, 'Anonymous', null);
      } else {
        const sponsorNode = selectedNode.sponsorId ? state.data.nodes[selectedNode.sponsorId] : null;
        setRelationNavButton(selectedSponsorEl, formatNodeReference(sponsorNode), sponsorNode?.id || null);
      }
    }
    if (selectedPlacementParentEl) {
      const placementParentNode = resolvePlacementParentNode(selectedNode);
      setRelationNavButton(selectedPlacementParentEl, formatNodeReference(placementParentNode), placementParentNode?.id || null);
    }
    if (selectedSpilloverEl) {
      selectedSpilloverEl.textContent = selectedNode.isSpillover ? 'Yes' : 'No';
    }
    if (selectedCountryCodeEl) {
      selectedCountryCodeEl.textContent = shouldHideNodeRankAndCountry(selectedNode)
        ? '-'
        : getCountryCodeDisplay(selectedNode.countryFlag);
    }
    if (selectedSpilloverLineToggleEl) {
      const relatedSpilloverNodeIds = getSpilloverRelationNodeIds(selectedNode.id);
      const canToggleSpilloverLine = relatedSpilloverNodeIds.length > 0;
      const visibleCount = relatedSpilloverNodeIds.reduce(
        (count, spilloverNodeId) => count + (isSpilloverLineVisible(spilloverNodeId) ? 1 : 0),
        0,
      );
      const allVisible = canToggleSpilloverLine && visibleCount === relatedSpilloverNodeIds.length;
      const noneVisible = !visibleCount;
      selectedSpilloverLineToggleEl.checked = canToggleSpilloverLine ? allVisible : true;
      selectedSpilloverLineToggleEl.indeterminate = canToggleSpilloverLine && !allVisible && !noneVisible;
      selectedSpilloverLineToggleEl.disabled = !canToggleSpilloverLine;
      selectedSpilloverLineToggleEl.setAttribute('aria-disabled', canToggleSpilloverLine ? 'false' : 'true');
    }
    const leftLegBreakdown = getLegBvBreakdown(selectedNode, 'left', state.data.nodes);
    const rightLegBreakdown = getLegBvBreakdown(selectedNode, 'right', state.data.nodes);
    if (shouldApplyNodePrivacyMask(selectedNode)) {
      const displayLegVolumes = getNodeDisplayLegVolumes(selectedNode);
      selectedLeftEl.textContent = `${displayLegVolumes.leftBv.toLocaleString()} BV`;
      selectedRightEl.textContent = `${displayLegVolumes.rightBv.toLocaleString()} BV`;
    } else {
      selectedLeftEl.textContent = `${leftLegBreakdown.teamBv.toLocaleString()} BV (Direct ${leftLegBreakdown.directBv.toLocaleString()} | Downline ${leftLegBreakdown.downlineBv.toLocaleString()})`;
      selectedRightEl.textContent = `${rightLegBreakdown.teamBv.toLocaleString()} BV (Direct ${rightLegBreakdown.directBv.toLocaleString()} | Downline ${rightLegBreakdown.downlineBv.toLocaleString()})`;
    }
    selectedCyclesEl.textContent = resolveSelectedSecondaryMetricValue(selectedNode, secondaryMetricMode);
    selectedEligibleEl.textContent = isCycleEligible(selectedNode, state.cycleRule) ? 'Yes' : 'No';
  }

  function updateOrganizationSummary() {
    if (!orgTotalPeopleEl || !orgTotalBvEl) {
      return;
    }

    if (!state.data) {
      orgTotalPeopleEl.textContent = '-';
      orgTotalBvEl.textContent = '-';
      return;
    }

    const totalPeople = Object.keys(state.data.nodes).length;
    const totalProducedBv = Object.values(state.data.nodes).reduce(
      (sum, node) => sum + (node.leftPersonalPv + node.rightPersonalPv),
      0,
    );

    orgTotalPeopleEl.textContent = totalPeople.toLocaleString();
    orgTotalBvEl.textContent = `${totalProducedBv.toLocaleString()} BV`;
  }

  function shouldUseSpilloverNodeHighlight(node) {
    if (!node?.isSpillover) {
      return false;
    }
    if (spilloverHighlightMode === 'none') {
      return false;
    }
    if (spilloverHighlightMode === 'all') {
      return true;
    }

    const rootNodeId = state.data?.rootId;
    if (!rootNodeId) {
      return false;
    }

    // "received-only": highlight spillover nodes received from outside the viewer root.
    return node.sponsorId !== rootNodeId;
  }

  function drawNodeCard(graphics, node, selected, lodModeKey = state.activeLodModeKey) {
    const eligible = isCycleEligible(node, state.cycleRule);
    const isSpilloverNode = shouldUseSpilloverNodeHighlight(node);
    const borderColor = selected
      ? (isSpilloverNode ? COLORS.borderSpilloverSelected : COLORS.borderSelected)
      : (isSpilloverNode ? COLORS.borderSpillover : (eligible ? COLORS.borderEligible : COLORS.borderDefault));
    const fillColor = isSpilloverNode
      ? (node.status === 'active' ? COLORS.backgroundSpilloverActive : COLORS.backgroundSpilloverInactive)
      : (node.status === 'active' ? COLORS.backgroundActive : COLORS.backgroundInactive);

    graphics.clear();
    graphics.lineStyle(selected ? 3 : 1.8, borderColor, 1);
    graphics.beginFill(fillColor, lodModeKey === TREE_LOD_MODE_FAR ? 0.9 : 1);
    graphics.drawCircle(0, 0, TREE_SIMPLE_NODE_RADIUS);
    graphics.endFill();
  }

  function rebuildSpilloverLinkCache(layout, options = {}) {
    state.spilloverLinkCache = [];
    if (!state.data || !layout?.nodeIds?.length) {
      return;
    }

    const visibleNodeIds = options?.visibleNodeIds instanceof Set
      ? options.visibleNodeIds
      : null;

    for (const nodeId of layout.nodeIds) {
      const node = state.data.nodes[nodeId];
      if (!node?.isSpillover || !node.sponsorId) {
        continue;
      }
      if (visibleNodeIds && (!visibleNodeIds.has(nodeId) || !visibleNodeIds.has(node.sponsorId))) {
        continue;
      }

      const sponsorPos = layout.positions.get(node.sponsorId);
      const nodePos = layout.positions.get(nodeId);
      if (!sponsorPos || !nodePos) {
        continue;
      }

      const anchoredSegment = resolveEdgeAnchoredLineSegment(
        sponsorPos.x,
        sponsorPos.y,
        nodePos.x,
        nodePos.y,
      );
      if (!anchoredSegment) {
        continue;
      }
      const startX = anchoredSegment.startX;
      const startY = anchoredSegment.startY;
      const endX = anchoredSegment.endX;
      const endY = anchoredSegment.endY;
      const bendY = startY + (endY - startY) * 0.33;

      const polyline = buildSpilloverBezierPolyline(startX, startY, startX, bendY, endX, bendY, endX, endY);
      const dashPattern = getSpilloverDashPattern(nodeId);
      state.spilloverLinkCache.push({
        nodeId,
        polyline,
        dashLength: dashPattern.dashLength,
        gapLength: dashPattern.gapLength,
      });
    }
  }

  function renderSpilloverLinks() {
    spilloverLinksLayer.clear();
    if (!state.spilloverLinkCache.length) {
      return;
    }

    spilloverLinksLayer.lineStyle({
      width: SPILLOVER_LINE_WIDTH,
      color: COLORS.linkSpillover,
      alpha: SPILLOVER_LINE_ALPHA,
      cap: 'round',
      join: 'round',
    });

    for (const entry of state.spilloverLinkCache) {
      if (!isSpilloverLineVisible(entry.nodeId)) {
        continue;
      }
      drawDashedPolyline(
        spilloverLinksLayer,
        entry.polyline,
        entry.dashLength,
        entry.gapLength,
      );
    }
  }

  function clearNodes() {
    destroySelectedNodePopup();
    state.nodeVisuals.clear();
    state.nodePositions.clear();
    state.spilloverLinkCache = [];
    state.searchMatches = [];
    spilloverLinksLayer.clear();
    linksLayer.clear();
    nodesLayer.removeChildren().forEach((child) => child.destroy({ children: true }));
    state.emptyText = null;
  }

  function renderEmptyState(message) {
    clearNodes();
    const text = new PIXI.Text(message, {
      fontFamily: 'Inter',
      fontSize: 15,
      fill: COLORS.textMuted,
      fontWeight: '500',
    });
    text.anchor.set(0.5);
    const viewport = getViewportSize();
    text.position.set(viewport.width / 2, viewport.height / 2);
    nodesLayer.addChild(text);
    state.emptyText = text;
    renderSearchResults();
    updateCycleSummary();
    updateSelectedNodePanel();
    updateOrganizationSummary();
    scheduleMinimapRender();
  }

  function refreshNodeVisuals() {
    const activeFilter = hasActiveSearchFilters();
    const matchSet = new Set(state.searchMatches);

    for (const [nodeId, visual] of state.nodeVisuals.entries()) {
      drawNodeCard(visual.background, visual.node, state.selectedNodeId === nodeId, state.activeLodModeKey);
      if (visual.initialsText) {
        visual.initialsText.style.fill = COLORS.textPrimary;
      }
      if (state.selectedNodeId === nodeId) {
        visual.container.alpha = 1;
      } else if (activeFilter) {
        visual.container.alpha = matchSet.has(nodeId) ? 1 : 0.2;
      } else {
        visual.container.alpha = 1;
      }
    }
    updateSelectedNodePanel();
    updateCycleSummary();
    updateOrganizationSummary();
    updateSelectedNodePopup({ rebuild: true });
    scheduleMinimapRender();
  }

  function getLayoutPositionForDepthSlot(depth, slot, layout) {
    const depthCap = Number.isFinite(layout?.depthCap) ? layout.depthCap : MAX_LAYOUT_DEPTH_FOR_WIDTH;
    const layoutWidth = Number.isFinite(layout?.layoutWidth) ? layout.layoutWidth : 1;
    const levelGap = Number.isFinite(layout?.levelGap) ? layout.levelGap : 188;
    const originY = Number.isFinite(layout?.originY) ? layout.originY : 60;
    const effectiveDepth = Math.min(depth, depthCap);
    const slotsOnLevel = 2 ** effectiveDepth;
    const overflowDepth = depth - effectiveDepth;
    const compressedSlot = overflowDepth > 0
      ? Math.floor(slot / (2 ** overflowDepth))
      : slot;
    const boundedSlot = clamp(compressedSlot, 0, Math.max(0, slotsOnLevel - 1));
    const x = ((boundedSlot + 0.5) / slotsOnLevel) * layoutWidth;
    const y = originY + depth * levelGap;
    return { x, y };
  }

  function applyEnrollMiddleGapX(x, depth, layout) {
    if (!isValidNumber(x)) {
      return x;
    }
    if (!layout || !isValidNumber(layout.layoutWidth) || layout.layoutWidth <= 0) {
      return x;
    }
    if (!Number.isFinite(depth) || depth <= 0) {
      return x;
    }

    const centerX = layout.layoutWidth / 2;
    const depthDelta = Math.max(0, depth - 1);
    const dynamicGap = ENROLL_MIDDLE_GAP + Math.min(ENROLL_MIDDLE_GAP_MAX_EXTRA, depthDelta * ENROLL_MIDDLE_GAP_PER_DEPTH);
    const halfGap = dynamicGap / 2;
    if (x < centerX - 0.5) {
      return x - halfGap;
    }
    if (x > centerX + 0.5) {
      return x + halfGap;
    }
    return x;
  }

  function applyEnrollMiddleGapToLayout(layout) {
    if (!layout || !(layout.positions instanceof Map) || !layout.positions.size) {
      return;
    }

    const layoutMeta = layout.meta instanceof Map ? layout.meta : new Map();
    for (const [nodeId, position] of layout.positions.entries()) {
      if (!position || !isValidNumber(position.x)) {
        continue;
      }
      const point = layoutMeta.get(nodeId);
      const depth = Number.isFinite(point?.depth) ? point.depth : 0;
      position.x = applyEnrollMiddleGapX(position.x, depth, layout);
    }
  }

  function isPointInsideWorldBounds(point, bounds) {
    if (!point || !bounds) {
      return false;
    }
    return point.x >= bounds.minX
      && point.x <= bounds.maxX
      && point.y >= bounds.minY
      && point.y <= bounds.maxY;
  }

  function expandWorldBounds(bounds, paddingX, paddingY) {
    return {
      minX: bounds.minX - Math.max(0, paddingX),
      minY: bounds.minY - Math.max(0, paddingY),
      maxX: bounds.maxX + Math.max(0, paddingX),
      maxY: bounds.maxY + Math.max(0, paddingY),
    };
  }

  function buildParentByChildMap(layout) {
    const parentByChild = new Map();
    if (!state.data || !Array.isArray(layout?.nodeIds)) {
      return parentByChild;
    }

    for (const nodeId of layout.nodeIds) {
      const node = state.data.nodes[nodeId];
      if (!node) {
        continue;
      }
      for (const childId of [node.leftChildId, node.rightChildId]) {
        if (!childId || !state.data.nodes[childId] || parentByChild.has(childId)) {
          continue;
        }
        parentByChild.set(childId, nodeId);
      }
    }
    return parentByChild;
  }

  function addNodeAndAncestors(nodeId, parentByChild, visibleNodeIdSet) {
    let currentId = nodeId;
    const visited = new Set();
    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);
      visibleNodeIdSet.add(currentId);
      currentId = parentByChild.get(currentId);
    }
  }

  function addSubtreeWithinDepth(rootId, maxDepth, layout, visibleNodeIdSet) {
    if (!rootId || !state.data?.nodes[rootId]) {
      return;
    }

    const queue = [rootId];
    const visited = new Set();
    while (queue.length) {
      const nodeId = queue.shift();
      if (!nodeId || visited.has(nodeId)) {
        continue;
      }
      visited.add(nodeId);
      const point = layout?.meta?.get(nodeId);
      if (!point || point.depth > maxDepth) {
        continue;
      }

      visibleNodeIdSet.add(nodeId);
      const node = state.data.nodes[nodeId];
      if (!node) {
        continue;
      }
      if (node.leftChildId && state.data.nodes[node.leftChildId]) {
        queue.push(node.leftChildId);
      }
      if (node.rightChildId && state.data.nodes[node.rightChildId]) {
        queue.push(node.rightChildId);
      }
    }
  }

  function resolveCascadeVisibleNodeIds(layout, lodMode) {
    if (!state.data || !Array.isArray(layout?.nodeIds) || !layout.nodeIds.length) {
      return [];
    }

    if (!state.isFullscreen || hasActiveSearchFilters()) {
      return layout.nodeIds.slice();
    }

    const meta = layout.meta instanceof Map ? layout.meta : new Map();
    const positions = layout.positions instanceof Map ? layout.positions : new Map();
    const visibleNodeIdSet = new Set();
    const baseDepthLimit = TREE_LOD_DEPTH_LIMIT_BY_MODE[TREE_LOD_MODE_FAR] ?? 4;
    const focusDepthLimit = Number.isFinite(lodMode?.maxDepth)
      ? lodMode.maxDepth
      : Number.POSITIVE_INFINITY;

    for (const nodeId of layout.nodeIds) {
      const point = meta.get(nodeId);
      if (point && point.depth <= baseDepthLimit) {
        visibleNodeIdSet.add(nodeId);
      }
    }

    if (focusDepthLimit > baseDepthLimit) {
      const viewportBounds = getViewportWorldBounds();
      const viewportWidth = Math.max(1, viewportBounds.maxX - viewportBounds.minX);
      const viewportHeight = Math.max(1, viewportBounds.maxY - viewportBounds.minY);
      const expandedViewportBounds = expandWorldBounds(
        viewportBounds,
        Math.max(TREE_SIMPLE_NODE_RADIUS * 2.2, viewportWidth * 0.14),
        Math.max(TREE_SIMPLE_NODE_RADIUS * 2.2, viewportHeight * 0.14),
      );

      const focusedCascadeRootIds = [];
      for (const nodeId of layout.nodeIds) {
        const point = meta.get(nodeId);
        if (!point || point.depth !== baseDepthLimit) {
          continue;
        }
        const position = positions.get(nodeId);
        if (!position || !isPointInsideWorldBounds(position, expandedViewportBounds)) {
          continue;
        }
        focusedCascadeRootIds.push(nodeId);
      }

      if (!focusedCascadeRootIds.length) {
        const viewportCenterX = (viewportBounds.minX + viewportBounds.maxX) / 2;
        const viewportCenterY = (viewportBounds.minY + viewportBounds.maxY) / 2;
        let fallbackId = null;
        let fallbackDistance = Number.POSITIVE_INFINITY;
        for (const nodeId of layout.nodeIds) {
          const point = meta.get(nodeId);
          if (!point || point.depth !== baseDepthLimit) {
            continue;
          }
          const position = positions.get(nodeId);
          if (!position) {
            continue;
          }
          const distance = Math.hypot(position.x - viewportCenterX, position.y - viewportCenterY);
          if (distance < fallbackDistance) {
            fallbackDistance = distance;
            fallbackId = nodeId;
          }
        }
        if (fallbackId) {
          focusedCascadeRootIds.push(fallbackId);
        }
      }

      for (const rootId of focusedCascadeRootIds) {
        addSubtreeWithinDepth(rootId, focusDepthLimit, layout, visibleNodeIdSet);
      }
    }

    const parentByChild = buildParentByChildMap(layout);
    if (state.selectedNodeId && state.data.nodes[state.selectedNodeId]) {
      addNodeAndAncestors(state.selectedNodeId, parentByChild, visibleNodeIdSet);
      if (focusDepthLimit > baseDepthLimit) {
        addSubtreeWithinDepth(state.selectedNodeId, focusDepthLimit, layout, visibleNodeIdSet);
      }
    }

    const orderedVisibleNodeIds = layout.nodeIds.filter((nodeId) => visibleNodeIdSet.has(nodeId));
    if (orderedVisibleNodeIds.length) {
      return orderedVisibleNodeIds;
    }
    return layout.nodeIds.slice(0, 1);
  }

  function resolveEnrollAnticipationPositions(anticipationSlots, layout) {
    const positionByKey = new Map();
    if (!Array.isArray(anticipationSlots) || !anticipationSlots.length) {
      return positionByKey;
    }

    const slotParentIds = new Set(
      anticipationSlots
        .map((slotEntry) => slotEntry.parentNodeId)
        .filter(Boolean),
    );

    // Selected-node anticipation mode (1 parent): keep both sides close and visually symmetric
    // so users do not misread far-shifted placeholders as different branch positions.
    if (slotParentIds.size === 1) {
      const parentNodeId = Array.from(slotParentIds)[0];
      const parentPosition = layout?.positions?.get(parentNodeId);
      if (parentPosition) {
        const levelGap = Number.isFinite(layout?.levelGap) ? layout.levelGap : 188;
        const horizontalOffset = Math.max(
          ENROLL_SELECTED_SLOT_HORIZONTAL_OFFSET,
          (ENROLL_ANTICIPATED_NODE_RADIUS * 2) + 18,
        );
        const baseY = parentPosition.y + (levelGap * ENROLL_SELECTED_SLOT_VERTICAL_RATIO);
        const collisionDistance = (ENROLL_ANTICIPATED_NODE_RADIUS * 2) + ENROLL_SELECTED_SLOT_COLLISION_PADDING;

        const occupiedPoints = [];
        if (layout?.positions instanceof Map) {
          for (const position of layout.positions.values()) {
            if (!position || !isValidNumber(position.x) || !isValidNumber(position.y)) {
              continue;
            }
            occupiedPoints.push({ x: position.x, y: position.y });
          }
        }

        const hasCollision = (x, y, localPlacements) => {
          for (const point of occupiedPoints) {
            if (Math.hypot(point.x - x, point.y - y) < collisionDistance) {
              return true;
            }
          }
          for (const point of localPlacements) {
            if (Math.hypot(point.x - x, point.y - y) < collisionDistance) {
              return true;
            }
          }
          return false;
        };

        const orderedSlots = anticipationSlots.slice().sort((left, right) => {
          const leftOrder = left.side === 'left' ? 0 : 1;
          const rightOrder = right.side === 'left' ? 0 : 1;
          return leftOrder - rightOrder;
        });
        const localPlacements = [];

        for (const slotEntry of orderedSlots) {
          const key = `${slotEntry.parentNodeId}:${slotEntry.side}`;
          const sideDirection = slotEntry.side === 'left' ? -1 : 1;
          let candidateX = parentPosition.x + (sideDirection * horizontalOffset);
          let candidateY = baseY;

          let attempt = 0;
          while (attempt < ENROLL_SELECTED_SLOT_MAX_VERTICAL_STEPS && hasCollision(candidateX, candidateY, localPlacements)) {
            candidateY += ENROLL_SELECTED_SLOT_VERTICAL_STEP;
            attempt += 1;
          }

          if (hasCollision(candidateX, candidateY, localPlacements)) {
            candidateX += sideDirection * (ENROLL_ANTICIPATED_NODE_RADIUS * 1.6);
          }

          const resolvedPoint = { x: candidateX, y: candidateY };
          localPlacements.push(resolvedPoint);
          positionByKey.set(key, resolvedPoint);
        }

        if (positionByKey.size === anticipationSlots.length) {
          return positionByKey;
        }
      }
    }

    const depthBuckets = new Map();
    const layoutMeta = layout?.meta instanceof Map ? layout.meta : new Map();

    for (const slotEntry of anticipationSlots) {
      const key = `${slotEntry.parentNodeId}:${slotEntry.side}`;
      const point = getLayoutPositionForDepthSlot(slotEntry.depth, slotEntry.slot, layout);
      const shiftedX = applyEnrollMiddleGapX(point.x, slotEntry.depth, layout);
      const item = {
        key,
        parentNodeId: slotEntry.parentNodeId,
        side: slotEntry.side,
        depth: slotEntry.depth,
        x: shiftedX,
        y: point.y,
      };
      const bucket = depthBuckets.get(item.depth) || [];
      bucket.push(item);
      depthBuckets.set(item.depth, bucket);
      positionByKey.set(key, { x: shiftedX, y: point.y });
    }

    const resolveNonOverlappingX = (baseX, direction, occupiedX, minHorizontalGap) => {
      let candidateX = baseX;
      let step = Math.max(8, minHorizontalGap * 0.32);
      const resolveDirection = direction === -1 ? -1 : 1;
      for (let attempt = 0; attempt < 220; attempt += 1) {
        const hasCollision = occupiedX.some((occupiedValue) => Math.abs(candidateX - occupiedValue) < minHorizontalGap);
        if (!hasCollision) {
          return candidateX;
        }
        candidateX += resolveDirection * step;
        step = Math.min(step * 1.06, minHorizontalGap * 2.5);
      }
      return candidateX;
    };

    const applyDepthEntries = (entries, direction, occupiedX, minHorizontalGap, minimumSideOffset) => {
      for (const entry of entries) {
        const parentPosition = layout?.positions?.get(entry.parentNodeId);
        let candidateX = entry.x;

        if (parentPosition) {
          if (direction < 0) {
            candidateX = Math.min(candidateX, parentPosition.x - minimumSideOffset);
          } else {
            candidateX = Math.max(candidateX, parentPosition.x + minimumSideOffset);
          }
        }

        candidateX = resolveNonOverlappingX(candidateX, direction, occupiedX, minHorizontalGap);
        occupiedX.push(candidateX);
        const resolvedPoint = { x: candidateX, y: entry.y };
        positionByKey.set(entry.key, resolvedPoint);
      }
    };

    for (const [depth, bucket] of depthBuckets.entries()) {
      const occupiedX = [];
      for (const [nodeId, point] of layoutMeta.entries()) {
        if (!point || point.depth !== depth) {
          continue;
        }
        const nodePosition = layout?.positions?.get(nodeId);
        if (nodePosition) {
          occupiedX.push(nodePosition.x);
        }
      }

      const deepDepthDelta = Math.max(0, depth - TREE_DEEP_X_SPACING_START_DEPTH);
      const growthSteps = (deepDepthDelta * (deepDepthDelta + 1)) / 2;
      const depthExtraSpacing = (deepDepthDelta * TREE_DEEP_X_SPACING_PER_DEPTH)
        + (growthSteps * TREE_DEEP_X_SPACING_GROWTH);
      const minHorizontalGap = clamp(
        ENROLL_ANTICIPATED_BASE_GAP + (depthExtraSpacing * 0.92),
        ENROLL_ANTICIPATED_BASE_GAP,
        ENROLL_ANTICIPATED_BASE_GAP + 320,
      );
      const minimumSideOffset = Math.max(minHorizontalGap * 1.14, ENROLL_ANTICIPATED_NODE_RADIUS * 2.8);

      const leftEntries = bucket
        .filter((entry) => entry.side === 'left')
        .sort((left, right) => {
          if (left.x !== right.x) {
            return right.x - left.x;
          }
          return left.key.localeCompare(right.key);
        });
      const rightEntries = bucket
        .filter((entry) => entry.side === 'right')
        .sort((left, right) => {
          if (left.x !== right.x) {
            return left.x - right.x;
          }
          return left.key.localeCompare(right.key);
        });
      const otherEntries = bucket
        .filter((entry) => entry.side !== 'left' && entry.side !== 'right')
        .sort((left, right) => {
          if (left.x !== right.x) {
            return left.x - right.x;
          }
          return left.key.localeCompare(right.key);
        });

      applyDepthEntries(leftEntries, -1, occupiedX, minHorizontalGap, minimumSideOffset);
      applyDepthEntries(rightEntries, 1, occupiedX, minHorizontalGap, minimumSideOffset);
      applyDepthEntries(otherEntries, 1, occupiedX, minHorizontalGap, minimumSideOffset);
    }

    return positionByKey;
  }

  function collectEnrollAnticipationSlots(layout, options = {}) {
    if (!state.data || !state.isFullscreen || !layout?.nodeIds?.length) {
      return [];
    }

    const slots = [];
    const layoutMeta = layout.meta instanceof Map ? layout.meta : new Map();
    const visibleNodeIds = options?.visibleNodeIds instanceof Set
      ? options.visibleNodeIds
      : null;

    const selectedNodeId = state.selectedNodeId;
    if (!selectedNodeId || !state.data.nodes[selectedNodeId]) {
      return slots;
    }
    if (visibleNodeIds && !visibleNodeIds.has(selectedNodeId)) {
      return slots;
    }

    const selectedNode = state.data.nodes[selectedNodeId];
    const selectedPoint = layoutMeta.get(selectedNodeId);
    if (!selectedNode || !selectedPoint) {
      return slots;
    }

    const hasLeftChild = Boolean(selectedNode.leftChildId && state.data.nodes[selectedNode.leftChildId]);
    const hasRightChild = Boolean(selectedNode.rightChildId && state.data.nodes[selectedNode.rightChildId]);

    // Requested UX: show anticipated nodes whenever the selected node has available slots.
    if (!hasLeftChild) {
      slots.push({
        parentNodeId: selectedNodeId,
        side: 'left',
        depth: selectedPoint.depth + 1,
        slot: selectedPoint.slot * 2,
      });
    }
    if (!hasRightChild) {
      slots.push({
        parentNodeId: selectedNodeId,
        side: 'right',
        depth: selectedPoint.depth + 1,
        slot: selectedPoint.slot * 2 + 1,
      });
    }

    return slots;
  }

  function renderTree() {
    if (!state.data) {
      renderEmptyState('No binary data available.');
      return;
    }

    clearNodes();

    const shouldRenderEnrollAnticipation = state.isFullscreen;
    const lodMode = resolveTreeLodModeForScale(world.scale.x, state.activeLodModeKey);
    state.activeLodModeKey = lodMode.key;

    const layoutSlotWidth = shouldRenderEnrollAnticipation
      ? TREE_WORLD_SLOT_WIDTH + ENROLL_LAYOUT_SLOT_WIDTH_BOOST
      : TREE_WORLD_SLOT_WIDTH;
    const layoutDepthCap = shouldRenderEnrollAnticipation
      ? Math.min(MAX_LAYOUT_DEPTH_FOR_WIDTH, TREE_WORLD_LAYOUT_WIDTH_DEPTH_CAP + ENROLL_LAYOUT_DEPTH_CAP_BOOST)
      : TREE_WORLD_LAYOUT_WIDTH_DEPTH_CAP;

    const layout = computeLayout(state.data, {
      // Keep tree geometry stable when toggling enroll mode; anticipation nodes should overlay
      // the current compact layout instead of switching to legacy full-slot spacing.
      // Enroll mode uses a controlled width boost so the whole binary shifts wider for slot clarity.
      reserveMissingChildDepth: false,
      slotWidth: layoutSlotWidth,
      widthDepthCap: layoutDepthCap,
    });
    if (!layout.nodeIds.length) {
      renderEmptyState('No binary data available.');
      return;
    }

    if (shouldRenderEnrollAnticipation) {
      applyEnrollMiddleGapToLayout(layout);
    }

    const renderNodeIds = resolveCascadeVisibleNodeIds(layout, lodMode);
    const renderNodeIdSet = new Set(renderNodeIds);
    const visiblePositions = new Map();
    for (const nodeId of renderNodeIds) {
      const position = layout.positions.get(nodeId);
      if (position) {
        visiblePositions.set(nodeId, position);
      }
    }
    state.nodePositions = visiblePositions;
    const anticipationSlots = collectEnrollAnticipationSlots(layout, {
      visibleNodeIds: renderNodeIdSet,
    });
    const anticipationPositionByKey = resolveEnrollAnticipationPositions(anticipationSlots, layout);
    let boundsMinX = Number.POSITIVE_INFINITY;
    let boundsMinY = Number.POSITIVE_INFINITY;
    let boundsMaxX = Number.NEGATIVE_INFINITY;
    let boundsMaxY = Number.NEGATIVE_INFINITY;

    for (const point of state.nodePositions.values()) {
      boundsMinX = Math.min(boundsMinX, point.x - TREE_SIMPLE_NODE_RADIUS);
      boundsMinY = Math.min(boundsMinY, point.y - TREE_SIMPLE_NODE_RADIUS);
      boundsMaxX = Math.max(boundsMaxX, point.x + TREE_SIMPLE_NODE_RADIUS);
      boundsMaxY = Math.max(boundsMaxY, point.y + TREE_SIMPLE_NODE_RADIUS);
    }

    const nextBounds = Number.isFinite(boundsMinX)
      ? {
        minX: boundsMinX,
        minY: boundsMinY,
        maxX: boundsMaxX,
        maxY: boundsMaxY,
      }
      : {
        minX: layout.bounds.minX,
        minY: layout.bounds.minY,
        maxX: layout.bounds.maxX,
        maxY: layout.bounds.maxY,
      };

    for (const slotEntry of anticipationSlots) {
      const position = anticipationPositionByKey.get(`${slotEntry.parentNodeId}:${slotEntry.side}`);
      if (!position) {
        continue;
      }
      nextBounds.minX = Math.min(nextBounds.minX, position.x - ENROLL_ANTICIPATED_NODE_RADIUS);
      nextBounds.minY = Math.min(nextBounds.minY, position.y - ENROLL_ANTICIPATED_NODE_RADIUS);
      nextBounds.maxX = Math.max(nextBounds.maxX, position.x + ENROLL_ANTICIPATED_NODE_RADIUS);
      nextBounds.maxY = Math.max(
        nextBounds.maxY,
        position.y + ENROLL_ANTICIPATED_NODE_RADIUS + ENROLL_ANTICIPATED_NODE_LABEL_OFFSET + ENROLL_ANTICIPATED_NODE_LABEL_HEIGHT,
      );
    }

    state.bounds = nextBounds;

    spilloverLinksLayer.clear();
    linksLayer.clear();
    linksLayer.lineStyle({
      width: TREE_SIMPLE_NODE_LINK_WIDTH,
      color: COLORS.link,
      alpha: 0.88,
      cap: 'round',
      join: 'round',
    });

    for (const nodeId of renderNodeIds) {
      const node = state.data.nodes[nodeId];
      const nodePosition = layout.positions.get(nodeId);
      if (!node || !nodePosition) {
        continue;
      }

      const childBranches = [];
      if (node.leftChildId) {
        const leftChildPos = layout.positions.get(node.leftChildId);
        if (leftChildPos && renderNodeIdSet.has(node.leftChildId)) {
          childBranches.push({ side: 'left', position: leftChildPos });
        }
      }
      if (node.rightChildId) {
        const rightChildPos = layout.positions.get(node.rightChildId);
        if (rightChildPos && renderNodeIdSet.has(node.rightChildId)) {
          childBranches.push({ side: 'right', position: rightChildPos });
        }
      }
      if (!childBranches.length) {
        continue;
      }

      const parentBottomX = nodePosition.x;
      const parentBottomY = nodePosition.y + TREE_SIMPLE_NODE_RADIUS;
      const childAnchors = childBranches.map((branch) => ({
        side: branch.side,
        x: branch.position.x,
        y: branch.position.y - TREE_SIMPLE_NODE_RADIUS,
      }));
      const minChildAnchorY = Math.min(...childAnchors.map((anchor) => anchor.y));
      const availableVerticalGap = minChildAnchorY - parentBottomY;
      const branchDrop = clamp(
        availableVerticalGap * 0.34,
        TREE_SIMPLE_NODE_RADIUS * 0.45,
        TREE_SIMPLE_NODE_RADIUS * 1.55,
      );
      const branchY = availableVerticalGap > 0
        ? parentBottomY + branchDrop
        : parentBottomY;

      if (branchY > parentBottomY + 0.5) {
        linksLayer.moveTo(parentBottomX, parentBottomY);
        linksLayer.lineTo(parentBottomX, branchY);
      }

      if (childAnchors.length === 1) {
        const onlyChild = childAnchors[0];
        let targetX = onlyChild.x;
        if (Math.abs(targetX - parentBottomX) < TREE_SIMPLE_NODE_RADIUS * 0.4) {
          const sideDirection = onlyChild.side === 'right' ? 1 : -1;
          targetX = parentBottomX + (TREE_SIMPLE_NODE_RADIUS * 0.92 * sideDirection);
        }

        if (Math.abs(targetX - parentBottomX) > 0.5) {
          linksLayer.moveTo(parentBottomX, branchY);
          linksLayer.lineTo(targetX, branchY);
        }

        linksLayer.moveTo(targetX, branchY);
        linksLayer.lineTo(targetX, onlyChild.y);

        if (Math.abs(onlyChild.x - targetX) > 0.5) {
          linksLayer.moveTo(targetX, onlyChild.y);
          linksLayer.lineTo(onlyChild.x, onlyChild.y);
        }
        continue;
      }

      const sortedChildAnchors = childAnchors.slice().sort((left, right) => left.x - right.x);
      const horizontalLeftX = Math.min(parentBottomX, sortedChildAnchors[0].x);
      const horizontalRightX = Math.max(parentBottomX, sortedChildAnchors[sortedChildAnchors.length - 1].x);
      linksLayer.moveTo(horizontalLeftX, branchY);
      linksLayer.lineTo(horizontalRightX, branchY);

      for (const anchor of sortedChildAnchors) {
        linksLayer.moveTo(anchor.x, branchY);
        linksLayer.lineTo(anchor.x, anchor.y);
      }
    }

    if (anticipationSlots.length) {
      linksLayer.lineStyle({
        width: 1.35,
        color: COLORS.linkSpillover,
        alpha: 0.52,
        cap: 'round',
        join: 'round',
      });

      for (const slotEntry of anticipationSlots) {
        const parentPosition = layout.positions.get(slotEntry.parentNodeId);
        const placeholderPosition = anticipationPositionByKey.get(`${slotEntry.parentNodeId}:${slotEntry.side}`);
        if (!parentPosition || !placeholderPosition) {
          continue;
        }

        const startX = parentPosition.x;
        const startY = parentPosition.y + TREE_SIMPLE_NODE_RADIUS;
        const endX = placeholderPosition.x;
        const endY = placeholderPosition.y - ENROLL_ANTICIPATED_NODE_RADIUS;
        const availableVerticalGap = endY - startY;
        const branchDrop = clamp(
          availableVerticalGap * 0.34,
          TREE_SIMPLE_NODE_RADIUS * 0.45,
          TREE_SIMPLE_NODE_RADIUS * 1.55,
        );
        const branchY = availableVerticalGap > 0
          ? startY + branchDrop
          : startY;

        let targetX = endX;
        if (Math.abs(targetX - startX) < TREE_SIMPLE_NODE_RADIUS * 0.4) {
          const sideDirection = slotEntry.side === 'right' ? 1 : -1;
          targetX = startX + (TREE_SIMPLE_NODE_RADIUS * 0.92 * sideDirection);
        }

        const anticipationPath = [{ x: startX, y: startY }];
        if (branchY > startY + 0.5) {
          anticipationPath.push({ x: startX, y: branchY });
        }
        if (Math.abs(targetX - startX) > 0.5) {
          anticipationPath.push({ x: targetX, y: branchY });
        }
        anticipationPath.push({ x: targetX, y: endY });
        if (Math.abs(endX - targetX) > 0.5) {
          anticipationPath.push({ x: endX, y: endY });
        }

        drawDashedPolyline(linksLayer, anticipationPath, 8, 5);
      }
    }

    rebuildSpilloverLinkCache(layout, { visibleNodeIds: renderNodeIdSet });
    renderSpilloverLinks();

    for (const nodeId of renderNodeIds) {
      const node = state.data.nodes[nodeId];
      const nodePosition = layout.positions.get(nodeId);
      if (!node || !nodePosition) {
        continue;
      }

      const nodeContainer = new PIXI.Container();
      nodeContainer.position.set(nodePosition.x, nodePosition.y);
      nodeContainer.interactive = true;
      nodeContainer.cursor = 'pointer';

      const background = new PIXI.Graphics();
      nodeContainer.addChild(background);

      const initialsText = new PIXI.Text(
        getNodeInitials(node.name || node.memberCode || node.id),
        simpleNodeInitialStyle,
      );
      initialsText.anchor.set(0.5);
      initialsText.position.set(0, 0);
      nodeContainer.addChild(initialsText);

      nodeContainer.on('pointertap', () => {
        if (performance.now() < state.suppressTapUntil) {
          return;
        }
        if (isFullscreenSheetLayout() && state.selectedNodeId === nodeId && state.isMobileSelectedOpen) {
          clearSelectedNode();
          return;
        }
        selectNode(nodeId, false);
      });

      nodesLayer.addChild(nodeContainer);
      state.nodeVisuals.set(nodeId, {
        node,
        background,
        container: nodeContainer,
        initialsText,
      });
    }

    for (const slotEntry of anticipationSlots) {
      const parentNode = state.data.nodes[slotEntry.parentNodeId];
      const position = anticipationPositionByKey.get(`${slotEntry.parentNodeId}:${slotEntry.side}`);
      if (!parentNode || !position) {
        continue;
      }

      const placeholderContainer = new PIXI.Container();
      placeholderContainer.position.set(position.x, position.y);
      placeholderContainer.interactive = true;
      placeholderContainer.interactiveChildren = false;
      placeholderContainer.cursor = 'pointer';
      placeholderContainer.hitArea = new PIXI.Circle(0, 0, ENROLL_ANTICIPATED_NODE_RADIUS + 7);

      const placeholderBackground = new PIXI.Graphics();
      placeholderBackground.lineStyle(2, COLORS.statusActive, 0.9);
      placeholderBackground.beginFill(COLORS.statusActive, 0.12);
      placeholderBackground.drawCircle(0, 0, ENROLL_ANTICIPATED_NODE_RADIUS);
      placeholderBackground.endFill();
      placeholderBackground.lineStyle(1, COLORS.statusActive, 0.28);
      placeholderBackground.drawCircle(0, 0, ENROLL_ANTICIPATED_NODE_RADIUS + 4);
      placeholderContainer.addChild(placeholderBackground);

      const plusText = new PIXI.Text('+', enrollAnticipatedGlyphStyle);
      plusText.anchor.set(0.5);
      plusText.position.set(0, 0);
      placeholderContainer.addChild(plusText);

      const sideLabel = slotEntry.side === 'right' ? 'RIGHT' : 'LEFT';
      const sideText = new PIXI.Text(sideLabel, enrollAnticipatedSideStyle);
      sideText.anchor.set(0.5, 0);
      sideText.position.set(0, ENROLL_ANTICIPATED_NODE_RADIUS + ENROLL_ANTICIPATED_NODE_LABEL_OFFSET);
      placeholderContainer.addChild(sideText);

      placeholderContainer.on('pointertap', () => {
        if (performance.now() < state.suppressTapUntil) {
          return;
        }
        requestEnrollMemberFromTree(parentNode, slotEntry.side);
      });

      nodesLayer.addChild(placeholderContainer);
    }

    if (!state.selectedNodeId || !state.data.nodes[state.selectedNodeId]) {
      state.selectedNodeId = state.data.rootId;
    }
    applySearchState();
  }

  function refreshLodAfterCameraChange(options = {}) {
    if (!state.data || state.destroyed) {
      return;
    }

    const nextLodMode = resolveTreeLodModeForScale(world.scale.x, state.activeLodModeKey);

    const didModeChange = nextLodMode.key !== state.activeLodModeKey;
    if (didModeChange) {
      state.activeLodModeKey = nextLodMode.key;
    }

    if (options.force === true || didModeChange) {
      if (state.nodeVisuals.size) {
        refreshNodeVisuals();
      } else {
        renderTree();
      }
    }
  }

  function zoomAtPoint(nextScale, screenX, screenY) {
    stopCameraAnimation();
    const currentScale = world.scale.x;
    const clampedScale = clamp(nextScale, MIN_ZOOM, MAX_ZOOM);
    if (Math.abs(clampedScale - currentScale) < 0.0001) {
      return;
    }

    const worldX = (screenX - world.position.x) / currentScale;
    const worldY = (screenY - world.position.y) / currentScale;
    world.scale.set(clampedScale);
    world.position.set(
      screenX - worldX * clampedScale,
      screenY - worldY * clampedScale,
    );
    refreshLodAfterCameraChange();
    updateSelectedNodePopup();
    scheduleMinimapRender();
    schedulePersistUiState();
  }

  function panBy(deltaX, deltaY) {
    stopCameraAnimation();
    world.position.x += deltaX;
    world.position.y += deltaY;
    updateSelectedNodePopup();
    scheduleMinimapRender();
    schedulePersistUiState();
  }

  function fitToView() {
    stopCameraAnimation();
    const bounds = state.bounds;
    const contentWidth = Math.max(1, bounds.maxX - bounds.minX);
    const contentHeight = Math.max(1, bounds.maxY - bounds.minY);
    const viewport = getViewportSize();
    const viewportWidth = viewport.width;
    const viewportHeight = viewport.height;
    const padding = 64;
    const nextScale = clamp(
      Math.min((viewportWidth - padding * 2) / contentWidth, (viewportHeight - padding * 2) / contentHeight),
      MIN_ZOOM,
      MAX_ZOOM,
    );

    world.scale.set(nextScale);
    world.position.set(
      (viewportWidth - contentWidth * nextScale) / 2 - bounds.minX * nextScale,
      (viewportHeight - contentHeight * nextScale) / 2 - bounds.minY * nextScale,
    );
    refreshLodAfterCameraChange();
    updateSelectedNodePopup();
    scheduleMinimapRender();
    schedulePersistUiState();
  }

  function applyMapHomeView(options = {}) {
    stopCameraAnimation();
    const rootNodeId = state.data?.rootId;
    const rootPoint = rootNodeId ? state.nodePositions.get(rootNodeId) : null;
    if (!rootPoint) {
      fitToView();
      return;
    }

    const viewport = getViewportSize();
    const viewportYRatio = clamp(
      isValidNumber(options.viewportYRatio) ? options.viewportYRatio : TREE_MAP_HOME_VIEWPORT_Y_RATIO,
      0,
      1,
    );
    const homeScale = clamp(
      isValidNumber(options.scale) ? options.scale : TREE_MAP_HOME_ZOOM,
      MIN_ZOOM,
      MAX_ZOOM,
    );

    world.scale.set(homeScale);
    world.position.set(
      viewport.width * 0.5 - rootPoint.x * homeScale,
      viewport.height * viewportYRatio - rootPoint.y * homeScale,
    );

    refreshLodAfterCameraChange({ force: true });
    updateSelectedNodePopup();
    scheduleMinimapRender();
    if (options.persist !== false) {
      schedulePersistUiState();
    }
  }

  function resetView() {
    stopCameraAnimation();
    if (state.initialTransform) {
      world.scale.set(state.initialTransform.scale);
      world.position.set(state.initialTransform.x, state.initialTransform.y);
      refreshLodAfterCameraChange();
      updateSelectedNodePopup();
      scheduleMinimapRender();
      schedulePersistUiState();
      return;
    }
    fitToView();
  }

  function enterFullscreen() {
    if (state.isFullscreen || !overlayEl || !fullscreenShellEl || !originalParent) {
      return;
    }

    setSearchToolsOpen(false);
    overlayEl.classList.remove('hidden');
    panelEl.classList.add('tree-fullscreen-mode');
    fullscreenShellEl.appendChild(panelEl);
    if (document.body) {
      fullscreenPreviousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      document.body.classList.add('tree-fullscreen-active');
    }
    state.isFullscreen = true;
    emitFullscreenState();
    syncEnrollModeToggleUi();
    if (isFullscreenSheetLayout()) {
      setToolsVisible(true);
      setDetailsVisible(true);
      setMobileSelectedOpen(false, { persist: false });
    } else {
      setToolsVisible(true);
      setDetailsVisible(true);
    }
    renderFullscreenHeaderTimeChip();
    syncDesktopMinimapVisibilityState();
    updateFullscreenLabel();
    emitEnrollModeState();
    if (state.isEnrollMode && state.data) {
      renderTree();
    }
    syncFullscreenMetricsDeckUi();
    resizeRenderer();
    requestAnimationFrame(() => {
      updateFullscreenOverlayOffsets();
      scheduleMinimapRender();
    });
    schedulePersistUiState();
  }

  function exitFullscreen() {
    if (!state.isFullscreen || !overlayEl || !originalParent) {
      return;
    }

    clearEscapeFullscreenExitTimer();
    setSearchToolsOpen(false);
    setMobileSelectedOpen(false, { persist: false });
    minimapPointerId = null;
    clearMousePanInteraction();
    state.isSpacePanModeActive = false;
    syncPanModeUiState();
    panelEl.classList.remove('tree-fullscreen-mode');

    if (originalNextSibling && originalNextSibling.parentNode === originalParent) {
      originalParent.insertBefore(panelEl, originalNextSibling);
    } else {
      originalParent.appendChild(panelEl);
    }

    overlayEl.classList.add('hidden');
    if (document.body) {
      document.body.style.overflow = fullscreenPreviousBodyOverflow;
      document.body.classList.remove('tree-fullscreen-active');
    }
    const wasEnrollMode = state.isEnrollMode;
    state.isFullscreen = false;
    emitFullscreenState();
    if (wasEnrollMode) {
      state.isEnrollMode = false;
    }
    syncEnrollModeToggleUi();
    syncDesktopMinimapVisibilityState();
    setToolsVisible(true);
    setDetailsVisible(true);
    if (wasEnrollMode && state.data) {
      renderTree();
      emitEnrollModeState();
    }
    updateFullscreenLabel();
    syncFullscreenMetricsDeckUi();
    resizeRenderer();
    scheduleMinimapRender();
    schedulePersistUiState();
  }

  function getDashboardSummary() {
    return buildDashboardSummary(state.data);
  }

  function emitDashboardSummary() {
    const summary = getDashboardSummary();
    if (!summary || typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') {
      return;
    }

    window.dispatchEvent(new CustomEvent('binary-tree-summary-updated', { detail: summary }));
  }

  function setCycleRule(rule) {
    state.cycleRule = sanitizeCycleRule(rule);
    if (state.data) {
      state.data.cycleRule = { ...state.cycleRule };
      deriveBusinessVolumes(state.data.nodes, state.data.rootId, state.cycleRule);
    }
    updateCycleRuleText();
    applySearchState();
    schedulePersistUiState();
    emitDashboardSummary();
  }

  function applyCameraSnapshot(cameraSnapshot) {
    if (!cameraSnapshot || !isValidNumber(cameraSnapshot.x) || !isValidNumber(cameraSnapshot.y) || !isValidNumber(cameraSnapshot.scale)) {
      return false;
    }

    stopCameraAnimation();
    world.scale.set(clamp(cameraSnapshot.scale, MIN_ZOOM, MAX_ZOOM));
    world.position.set(cameraSnapshot.x, cameraSnapshot.y);
    refreshLodAfterCameraChange();
    updateSelectedNodePopup();
    scheduleMinimapRender();
    return true;
  }

  function setData(data) {
    const normalized = normalizeData(data, state.cycleRule);
    if (!normalized) {
      state.data = null;
      state.selectedNodeId = null;
      renderEmptyState('No binary data available.');
      schedulePersistUiState();
      return;
    }

    state.data = normalized;
    state.cycleRule = sanitizeCycleRule(normalized.cycleRule);
    updateCycleRuleText();

    const pendingRestore = state.pendingRestoreUiState;
    if (pendingRestore?.selectedNodeId && normalized.nodes[pendingRestore.selectedNodeId]) {
      state.selectedNodeId = pendingRestore.selectedNodeId;
    } else if (!state.selectedNodeId || !normalized.nodes[state.selectedNodeId]) {
      state.selectedNodeId = normalized.rootId;
    }

    const sourceHiddenIds = pendingRestore?.hiddenSpilloverNodeIds || Array.from(state.hiddenSpilloverNodeIds);
    const nextHiddenSpilloverNodeIds = new Set();
    for (const nodeId of sourceHiddenIds) {
      if (normalized.nodes[nodeId]) {
        nextHiddenSpilloverNodeIds.add(nodeId);
      }
    }
    state.hiddenSpilloverNodeIds = nextHiddenSpilloverNodeIds;

    renderTree();
    applyMapHomeView({ persist: false });
    state.initialTransform = {
      x: world.position.x,
      y: world.position.y,
      scale: world.scale.x,
    };

    if (pendingRestore?.isFullscreen) {
      enterFullscreen();
      if (isFullscreenSheetLayout()) {
        setToolsVisible(true);
        setDetailsVisible(true);
      } else {
        setToolsVisible(pendingRestore.isToolsVisible !== false);
        setDetailsVisible(pendingRestore.isDetailsVisible !== false);
      }
      setSearchToolsOpen(Boolean(pendingRestore.isSearchToolsOpen));
      setMobileSelectedOpen(Boolean(pendingRestore.isMobileSelectedOpen), { persist: false });
    }

    applyCameraSnapshot(pendingRestore?.camera);

    applySearchState();
    state.pendingRestoreUiState = null;
    schedulePersistUiState();
    emitDashboardSummary();
  }

  function onWheel(event) {
    const isTrackpadEvent = isLikelyTrackpadWheelEvent(event);
    const isTrackpadPinchZoom = isTrackpadEvent && event.ctrlKey && !event.metaKey;
    const isManualZoom = isManualWheelZoomModifierPressed(event);

    if (!isTrackpadEvent && !isManualZoom) {
      return;
    }

    const rect = app.view.getBoundingClientRect();
    const localX = event.clientX - rect.left;
    const localY = event.clientY - rect.top;

    if (isTrackpadPinchZoom) {
      event.preventDefault();
      const zoomFactor = Math.exp((-event.deltaY / 100) * state.trackpadZoomSensitivity);
      zoomAtPoint(world.scale.x * zoomFactor, localX, localY);
      return;
    }

    if (isManualZoom) {
      event.preventDefault();
      const factor = event.deltaY < 0 ? WHEEL_STEP_ZOOM_IN_FACTOR : WHEEL_STEP_ZOOM_OUT_FACTOR;
      zoomAtPoint(world.scale.x * factor, localX, localY);
      return;
    }

    if (!isTrackpadEvent) {
      return;
    }

    event.preventDefault();
    const panDirection = state.reverseTrackpadMovement ? 1 : -1;
    const deltaX = event.deltaX * panDirection;
    const deltaY = event.deltaY * panDirection;
    if (deltaX === 0 && deltaY === 0) {
      return;
    }
    panBy(deltaX, deltaY);
    state.suppressTapUntil = performance.now() + 120;
  }

  function getLocalPointer(event) {
    const rect = app.view.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function pointerDistance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function onMinimapPointerDown(event) {
    if (!isMinimapVisibleInCurrentViewport() || !minimapCanvasEl) {
      return;
    }

    minimapPointerId = event.pointerId;
    if (typeof minimapCanvasEl.setPointerCapture === 'function') {
      try {
        minimapCanvasEl.setPointerCapture(event.pointerId);
      } catch {
        // Ignore capture errors on unsupported/edge pointer states.
      }
    }

    const worldPoint = getMinimapWorldPointFromEvent(event);
    if (worldPoint) {
      centerViewOnWorldPoint(worldPoint.x, worldPoint.y);
      state.suppressTapUntil = performance.now() + 120;
    }
    event.preventDefault();
    event.stopPropagation();
  }

  function onMinimapPointerMove(event) {
    if (!isMinimapVisibleInCurrentViewport()) {
      return;
    }
    if (minimapPointerId !== event.pointerId) {
      return;
    }

    const worldPoint = getMinimapWorldPointFromEvent(event);
    if (worldPoint) {
      centerViewOnWorldPoint(worldPoint.x, worldPoint.y);
      state.suppressTapUntil = performance.now() + 120;
    }
    event.preventDefault();
  }

  function onMinimapPointerUp(event) {
    if (!isMinimapVisibleInCurrentViewport()) {
      return;
    }
    if (minimapPointerId !== event.pointerId) {
      return;
    }
    minimapPointerId = null;
    if (minimapCanvasEl && typeof minimapCanvasEl.releasePointerCapture === 'function') {
      try {
        minimapCanvasEl.releasePointerCapture(event.pointerId);
      } catch {
        // Ignore capture release errors on unsupported/edge pointer states.
      }
    }
    event.preventDefault();
  }

  function onPointerDown(event) {
    stopCameraAnimation();
    if (event.pointerType === 'mouse') {
      if (event.button !== 0 || !state.isSpacePanModeActive) {
        return;
      }
      mousePanPointerId = event.pointerId;
      isMousePanDragging = true;
      state.suppressTapUntil = performance.now() + 120;
      syncPanModeUiState();
    }

    const point = getLocalPointer(event);
    activePointers.set(event.pointerId, point);
    if (activePointers.size === 2) {
      const [first, second] = Array.from(activePointers.values());
      pinchStartDistance = pointerDistance(first, second);
      pinchStartScale = world.scale.x;
    }

    if (event.pointerType !== 'mouse' || state.isSpacePanModeActive) {
      event.preventDefault();
    }
  }

  function onPointerMove(event) {
    const previous = activePointers.get(event.pointerId);
    if (!previous) {
      return;
    }

    const nextPoint = getLocalPointer(event);
    activePointers.set(event.pointerId, nextPoint);

    if (activePointers.size === 1) {
      if (event.pointerType === 'mouse') {
        if (mousePanPointerId !== event.pointerId) {
          return;
        }
        if (!state.isSpacePanModeActive || (event.buttons & 1) === 0) {
          clearMousePanInteraction();
          return;
        }
      }
      const deltaX = nextPoint.x - previous.x;
      const deltaY = nextPoint.y - previous.y;
      if (deltaX !== 0 || deltaY !== 0) {
        panBy(deltaX, deltaY);
        state.suppressTapUntil = performance.now() + 120;
      }
      return;
    }

    if (activePointers.size === 2) {
      const [first, second] = Array.from(activePointers.values());
      const currentDistance = pointerDistance(first, second);
      if (pinchStartDistance > 0) {
        const zoomRatio = currentDistance / pinchStartDistance;
        const targetScale = pinchStartScale * zoomRatio;
        const centerX = (first.x + second.x) / 2;
        const centerY = (first.y + second.y) / 2;
        zoomAtPoint(targetScale, centerX, centerY);
        state.suppressTapUntil = performance.now() + 120;
      }
    }

    if (event.pointerType !== 'mouse') {
      event.preventDefault();
    }
  }

  function onPointerUp(event) {
    activePointers.delete(event.pointerId);
    if (event.pointerId === mousePanPointerId) {
      mousePanPointerId = null;
      isMousePanDragging = false;
      syncPanModeUiState();
    }
    if (activePointers.size < 2) {
      pinchStartDistance = 0;
    }
  }

  function onCanvasTouchGesture(event) {
    if (!state.isFullscreen || !isMobileFullscreenViewport()) {
      return;
    }
    const touchCount = typeof event.touches?.length === 'number' ? event.touches.length : 0;
    if (event.type === 'touchmove' || touchCount > 1) {
      event.preventDefault();
    }
  }

  function isPointerOnAnyNode(event) {
    if (!state.data || !state.nodePositions.size) {
      return false;
    }
    if (!isValidNumber(event.clientX) || !isValidNumber(event.clientY)) {
      return false;
    }

    const rect = app.view.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      return false;
    }

    const localX = event.clientX - rect.left;
    const localY = event.clientY - rect.top;
    if (localX < 0 || localY < 0 || localX > rect.width || localY > rect.height) {
      return false;
    }

    const scale = Math.max(world.scale.x, 0.0001);
    const worldX = (localX - world.position.x) / scale;
    const worldY = (localY - world.position.y) / scale;

    for (const nodePosition of state.nodePositions.values()) {
      const distance = Math.hypot(worldX - nodePosition.x, worldY - nodePosition.y);
      if (distance <= TREE_SIMPLE_NODE_RADIUS + 8) {
        return true;
      }
    }
    return false;
  }

  function onPanelPointerDown(event) {
    if (!isFullscreenSheetLayout()) {
      return;
    }

    const target = event.target;
    const isNodeTarget = target instanceof Node;

    if (state.isDesktopMinimapSettingsOpen) {
      if (minimapSettingsWrapEl && isNodeTarget && minimapSettingsWrapEl.contains(target)) {
        return;
      }
      setDesktopMinimapSettingsOpen(false);
    }

    if (state.isSearchToolsOpen) {
      if (toolsDockEl && isNodeTarget && toolsDockEl.contains(target)) {
        return;
      }
      setSearchToolsOpen(false);
      state.suppressTapUntil = performance.now() + 180;
      return;
    }

    if (state.isMobileSelectedOpen && state.selectedNodeId) {
      if (isPointerOnAnyNode(event)) {
        return;
      }
      if (selectedPanelEl && isNodeTarget && selectedPanelEl.contains(target)) {
        return;
      }
      clearSelectedNode();
      state.suppressTapUntil = performance.now() + 180;
    }
  }

  function onResize() {
    if (state.isFullscreen && !isFullscreenSheetLayout()) {
      if (!state.isToolsVisible) {
        setToolsVisible(true);
      }
      if (!state.isDetailsVisible) {
        setDetailsVisible(true);
      }
    }
    syncDesktopMinimapVisibilityState();
    syncMobileFullscreenSheetState();
    syncFullscreenMetricsDeckUi();
    resizeRenderer();
  }

  function onDocumentKeyDown(event) {
    if (event.key === 'Escape') {
      if (state.isDesktopMinimapSettingsOpen) {
        event.preventDefault();
        clearEscapeFullscreenExitTimer();
        setDesktopMinimapSettingsOpen(false);
        return;
      }

      if (!state.isFullscreen || panelEl.classList.contains('tree-settings-open')) {
        clearEscapeFullscreenExitTimer();
        return;
      }

      if (event.repeat) {
        event.preventDefault();
        return;
      }

      clearEscapeFullscreenExitTimer();
      escFullscreenExitTimerId = setTimeout(() => {
        escFullscreenExitTimerId = null;
        if (state.isFullscreen && !panelEl.classList.contains('tree-settings-open')) {
          exitFullscreen();
        }
      }, ESC_FULLSCREEN_EXIT_HOLD_MS);
      event.preventDefault();
      return;
    }

    if (event.code !== 'Space' && event.key !== ' ') {
      return;
    }
    if (!isTreePanelVisibleForHotkeys()) {
      return;
    }
    if (!state.isFullscreen && !isEventWithinTreePanel(event) && !panelEl.contains(document.activeElement)) {
      return;
    }
    if (shouldIgnorePanHotkeyEvent(event)) {
      return;
    }

    blurActiveTreeButtonForPanMode();
    if (!state.isSpacePanModeActive) {
      state.isSpacePanModeActive = true;
      syncPanModeUiState();
    }
    event.preventDefault();
  }

  function onDocumentKeyUp(event) {
    if (event.key === 'Escape') {
      clearEscapeFullscreenExitTimer();
      return;
    }

    if (event.code !== 'Space' && event.key !== ' ') {
      return;
    }
    if (!isTreePanelVisibleForHotkeys()) {
      return;
    }
    if (!state.isFullscreen && !isEventWithinTreePanel(event) && !panelEl.contains(document.activeElement)) {
      return;
    }

    if (state.isSpacePanModeActive) {
      state.isSpacePanModeActive = false;
      clearMousePanInteraction();
      syncPanModeUiState();
    }
    event.preventDefault();
  }

  function onWindowBlur() {
    clearEscapeFullscreenExitTimer();
    if (!state.isSpacePanModeActive) {
      return;
    }
    state.isSpacePanModeActive = false;
    clearMousePanInteraction();
    syncPanModeUiState();
  }

  function onVisibilityChange() {
    if (!document.hidden) {
      return;
    }
    onWindowBlur();
  }

  addListener(app.view, 'wheel', onWheel, { passive: false });
  addListener(app.view, 'pointerdown', onPointerDown);
  addListener(app.view, 'pointermove', onPointerMove);
  addListener(app.view, 'pointerup', onPointerUp);
  addListener(app.view, 'pointercancel', onPointerUp);
  addListener(app.view, 'touchstart', onCanvasTouchGesture, { passive: false });
  addListener(app.view, 'touchmove', onCanvasTouchGesture, { passive: false });
  addListener(app.view, 'touchend', onCanvasTouchGesture, { passive: false });
  addListener(app.view, 'touchcancel', onCanvasTouchGesture, { passive: false });
  addListener(panelEl, 'pointerdown', onPanelPointerDown);
  addListener(minimapCanvasEl, 'pointerdown', onMinimapPointerDown);
  addListener(minimapCanvasEl, 'pointermove', onMinimapPointerMove);
  addListener(minimapCanvasEl, 'pointerup', onMinimapPointerUp);
  addListener(minimapCanvasEl, 'pointercancel', onMinimapPointerUp);
  addListener(window, 'resize', onResize);
  addListener(window, 'blur', onWindowBlur);
  addListener(document, 'visibilitychange', onVisibilityChange);
  addListener(window, 'beforeunload', () => persistUiStateNow());
  addListener(document, 'keydown', onDocumentKeyDown);
  addListener(document, 'keyup', onDocumentKeyUp);

  addListener(zoomInBtnEl, 'click', () => {
    const viewport = getViewportSize();
    zoomAtPoint(world.scale.x * WHEEL_STEP_ZOOM_IN_FACTOR, viewport.width / 2, viewport.height / 2);
  });
  addListener(zoomOutBtnEl, 'click', () => {
    const viewport = getViewportSize();
    zoomAtPoint(world.scale.x * WHEEL_STEP_ZOOM_OUT_FACTOR, viewport.width / 2, viewport.height / 2);
  });
  addListener(fitBtnEl, 'click', () => fitToView());
  addListener(resetBtnEl, 'click', () => resetView());
  addListener(fullscreenBtnEl, 'click', () => (state.isFullscreen ? exitFullscreen() : enterFullscreen()));
  addListener(fullscreenCloseEl, 'click', () => exitFullscreen());
  addListener(fullscreenMetricsPrevEl, 'click', () => shiftFullscreenMetricsDeck(-1));
  addListener(fullscreenMetricsNextEl, 'click', () => shiftFullscreenMetricsDeck(1));
  addListener(fullscreenMetricsDeckEl, 'touchstart', onFullscreenMetricsTouchStart, { passive: true });
  addListener(fullscreenMetricsDeckEl, 'touchend', onFullscreenMetricsTouchEnd, { passive: true });
  addListener(fullscreenMetricsDeckEl, 'touchcancel', () => {
    fullscreenMetricTouchStartX = null;
  });
  addListener(fullscreenMetricsDotsEl, 'click', (event) => {
    if (!isCompactFullscreenMetricsLayout()) {
      return;
    }
    const eventTarget = event.target;
    if (!(eventTarget instanceof Element)) {
      return;
    }
    const dotButtonEl = eventTarget.closest('[data-tree-fullscreen-metric-dot-index]');
    if (!dotButtonEl || (fullscreenMetricsDotsEl && !fullscreenMetricsDotsEl.contains(dotButtonEl))) {
      return;
    }
    const nextIndex = Number.parseInt(dotButtonEl.getAttribute('data-tree-fullscreen-metric-dot-index') || '', 10);
    if (!Number.isFinite(nextIndex)) {
      return;
    }
    fullscreenMetricCardIndex = nextIndex;
    syncFullscreenMetricsDeckUi();
  });
  addListener(fullscreenMetricsStackEl, 'keydown', (event) => {
    if (!isCompactFullscreenMetricsLayout()) {
      return;
    }
    if (event.key === 'ArrowLeft') {
      shiftFullscreenMetricsDeck(-1);
      return;
    }
    if (event.key === 'ArrowRight') {
      shiftFullscreenMetricsDeck(1);
    }
  });
  addListener(searchNameEl, 'input', () => syncSearchFromInputs());
  addListener(searchCycleEl, 'input', () => syncSearchFromInputs());
  addListener(searchStatusEl, 'change', () => syncSearchFromInputs());
  addListener(searchSortEl, 'change', () => syncSearchFromInputs());
  addListener(searchDirectToggleEl, 'click', () => toggleDirectSponsorFilter());
  addListener(searchClearEl, 'click', () => clearSearch());
  addListener(searchMobileCloseEl, 'click', () => {
    if (!isFullscreenSheetLayout()) {
      return;
    }
    setSearchToolsOpen(false);
  });
  addListener(mobileSearchPillEl, 'click', () => {
    if (!isFullscreenSheetLayout()) {
      return;
    }
    setToolsVisible(true);
    setSearchToolsOpen(true, { focusInput: false });
  });
  addListener(mobileEnrollToggleEl, 'click', () => {
    if (!state.isFullscreen) {
      return;
    }
    setEnrollMode(!state.isEnrollMode);
  });
  addListener(mobileRootFocusEl, 'click', () => {
    const rootId = state.data?.rootId;
    if (!rootId || !state.data?.nodes[rootId]) {
      return;
    }
    selectNode(rootId, true, { ensureZoom: true, revealMobileSelected: false });
  });
  addListener(mobileMinimapToggleEl, 'click', () => {
    if (!isDesktopFullscreenViewport()) {
      return;
    }
    setDesktopMinimapVisible(!state.isDesktopMinimapVisible);
  });
  addListener(mobileDirectToggleEl, 'click', () => {
    if (!isFullscreenSheetLayout()) {
      return;
    }
    toggleDirectSponsorFilter();
  });
  addListener(minimapSettingsToggleEl, 'click', () => {
    if (!isDesktopFullscreenViewport() || !state.isDesktopMinimapVisible) {
      return;
    }
    setDesktopMinimapSettingsOpen(!state.isDesktopMinimapSettingsOpen);
  });
  addListener(minimapSizeSmallEl, 'click', () => setDesktopMinimapSize('small'));
  addListener(minimapSizeMediumEl, 'click', () => setDesktopMinimapSize('medium'));
  addListener(minimapSizeLargeEl, 'click', () => setDesktopMinimapSize('large'));
  addListener(mobileNavFurthestLeftEl, 'click', () => {
    navigateToFurthest('left', { revealMobileSelected: false });
  });
  addListener(mobileNavFurthestRightEl, 'click', () => {
    navigateToFurthest('right', { revealMobileSelected: false });
  });
  addListener(selectedSponsorEl, 'click', () => {
    if (!state.data) {
      return;
    }
    const targetNodeId = selectedSponsorEl?.dataset.targetNodeId;
    if (!targetNodeId || !state.data.nodes[targetNodeId]) {
      return;
    }
    selectNode(targetNodeId, true, { ensureZoom: true });
  });
  addListener(selectedPlacementParentEl, 'click', () => {
    if (!state.data) {
      return;
    }
    const targetNodeId = selectedPlacementParentEl?.dataset.targetNodeId;
    if (!targetNodeId || !state.data.nodes[targetNodeId]) {
      return;
    }
    selectNode(targetNodeId, true, { ensureZoom: true });
  });
  addListener(selectedSpilloverLineToggleEl, 'change', () => {
    if (!selectedSpilloverLineToggleEl) {
      return;
    }
    setSelectedSpilloverLineVisibility(selectedSpilloverLineToggleEl.checked);
  });
  addListener(selectedMobileCloseEl, 'click', () => {
    if (!isFullscreenSheetLayout()) {
      return;
    }
    clearSelectedNode();
  });
  addListener(navFurthestLeftEl, 'click', () => navigateToFurthest('left'));
  addListener(navFurthestRightEl, 'click', () => navigateToFurthest('right'));
  addListener(searchToggleEl, 'click', () => {
    if (!state.isFullscreen) {
      return;
    }
    const shouldFocusInput = !isFullscreenSheetLayout();
    setSearchToolsOpen(!state.isSearchToolsOpen, { focusInput: shouldFocusInput });
  });
  addListener(toolsVisibilityToggleEl, 'click', () => {
    if (!state.isFullscreen) {
      return;
    }
    setToolsVisible(!state.isToolsVisible);
  });
  addListener(detailsVisibilityToggleEl, 'click', () => {
    if (!state.isFullscreen) {
      return;
    }
    setDetailsVisible(!state.isDetailsVisible);
  });

  syncSearchInputsFromState();
  refreshThemeRendering(true);
  hideFallback();
  applyOverlayVisibilityState();
  startFullscreenHeaderTimeTicker();
  updateCycleRuleText();
  updateCycleSummary();
  updateSelectedNodePanel();
  updateOrganizationSummary();
  syncDesktopMinimapSizeState();
  syncDesktopMinimapVisibilityState();
  setSearchToolsOpen(state.isSearchToolsOpen);
  syncEnrollModeToggleUi();
  emitEnrollModeState();
  syncPanModeUiState();
  updateFullscreenLabel();
  syncFullscreenMetricsDeckUi();
  renderSearchResults();
  resizeRenderer();
  schedulePersistUiState();

  return {
    setData,
    setCycleRule,
    getDashboardSummary,
    getInteractionSettings,
    updateInteractionSettings,
    fitToView,
    resetView,
    enterFullscreen,
    exitFullscreen,
    destroy() {
      if (state.destroyed) {
        return;
      }
      persistUiStateNow();
      state.destroyed = true;
      clearEscapeFullscreenExitTimer();
      state.isSpacePanModeActive = false;
      clearMousePanInteraction();
      syncPanModeUiState();
      stopCameraAnimation();
      stopFullscreenHeaderTimeTicker();
      if (persistStateTimerId !== null) {
        clearTimeout(persistStateTimerId);
        persistStateTimerId = null;
      }
      clearNodePopupBadgeHoverHideTimer();
      hideNodePopupBadgeHovercard({ immediate: true });
      if (nodePopupBadgeHovercardRefs?.card?.parentNode) {
        nodePopupBadgeHovercardRefs.card.parentNode.removeChild(nodePopupBadgeHovercardRefs.card);
      }
      nodePopupBadgeHovercardRefs = null;
      activeNodePopupBadgeAnchorRect = null;
      exitFullscreen();
      if (overlayEl && overlayOriginalParent && overlayEl.parentNode !== overlayOriginalParent) {
        if (overlayOriginalNextSibling && overlayOriginalNextSibling.parentNode === overlayOriginalParent) {
          overlayOriginalParent.insertBefore(overlayEl, overlayOriginalNextSibling);
        } else {
          overlayOriginalParent.appendChild(overlayEl);
        }
      }
      listeners.forEach((cleanup) => cleanup());
      listeners.length = 0;
      if (themeMutationObserver) {
        themeMutationObserver.disconnect();
        themeMutationObserver = null;
      }
      clearNodes();
      app.destroy(true, { children: true, texture: false, baseTexture: false });
    },
  };
}
