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
 * @property {string=} leftChildId
 * @property {string=} rightChildId
 * @property {string=} sponsorId
 * @property {'left' | 'right'=} sponsorLeg
 * @property {string=} placementParentId
 * @property {'left' | 'right'=} placementSide
 * @property {boolean=} isSpillover
 * @property {'primary' | 'placeholder'=} businessCenterNodeType
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

const NODE_WIDTH = 228;
const NODE_HEIGHT = 138;
const ENROLL_PLACEHOLDER_WIDTH = 172;
const ENROLL_PLACEHOLDER_HEIGHT = 92;
const ENROLL_PLACEHOLDER_CORNER_RADIUS = 12;
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
  const businessCenterNodeTypeRaw = String(node?.businessCenterNodeType || '').trim().toLowerCase();
  const businessCenterNodeType = businessCenterNodeTypeRaw === 'placeholder'
    ? 'placeholder'
    : 'primary';
  const isBusinessCenterPlaceholder = Boolean(node?.isBusinessCenterPlaceholder)
    || businessCenterNodeType === 'placeholder';

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
    leftChildId: typeof node?.leftChildId === 'string' ? node.leftChildId : undefined,
    rightChildId: typeof node?.rightChildId === 'string' ? node.rightChildId : undefined,
    sponsorId: typeof node?.sponsorId === 'string' ? node.sponsorId : undefined,
    sponsorLeg: normalizeSide(node?.sponsorLeg),
    placementParentId: typeof node?.placementParentId === 'string' ? node.placementParentId : undefined,
    placementSide: normalizeSide(node?.placementSide),
    isSpillover: Boolean(node?.isSpillover),
    businessCenterNodeType,
    isBusinessCenterPlaceholder,
  };
}

function isBusinessCenterPlaceholderNode(node = {}) {
  return Boolean(node?.isBusinessCenterPlaceholder)
    || String(node?.businessCenterNodeType || '').trim().toLowerCase() === 'placeholder';
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
  const kpiNodeValues = nodeValues.filter((node) => !isBusinessCenterPlaceholderNode(node));
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
  const requestedSlotWidth = Number(options.slotWidth);
  const slotWidth = Number.isFinite(requestedSlotWidth)
    ? clamp(Math.round(requestedSlotWidth), 228, 360)
    : 248;
  const originY = 60;
  const levelGap = 188;
  const depthCap = MAX_LAYOUT_DEPTH_FOR_WIDTH;
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
  const layoutWidth = Math.max(1600, (2 ** Math.max(effectiveMaxDepth, 1)) * slotWidth);
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
  world.addChild(spilloverLinksLayer);
  world.addChild(linksLayer);
  world.addChild(nodesLayer);
  app.stage.addChild(world);

  const titleStyle = new PIXI.TextStyle({
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
    fill: COLORS.textPrimary,
  });

  const detailStyle = new PIXI.TextStyle({
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '500',
    fill: COLORS.textSecondary,
  });

  const chipStyle = new PIXI.TextStyle({
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '600',
  });

  const enrollPlaceholderTitleStyle = new PIXI.TextStyle({
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600',
    fill: COLORS.textPrimary,
  });

  const enrollPlaceholderSubtitleStyle = new PIXI.TextStyle({
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500',
    fill: COLORS.textSecondary,
  });

  const enrollPlaceholderPlusStyle = new PIXI.TextStyle({
    fontFamily: 'Inter',
    fontSize: 28,
    fontWeight: '600',
    fill: COLORS.statusActive,
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

  const listeners = [];

  function syncThemeTextStyles() {
    titleStyle.fill = COLORS.textPrimary;
    detailStyle.fill = COLORS.textSecondary;
    enrollPlaceholderTitleStyle.fill = COLORS.textPrimary;
    enrollPlaceholderSubtitleStyle.fill = COLORS.textSecondary;
    enrollPlaceholderPlusStyle.fill = COLORS.statusActive;
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
      return;
    }
    if (state.nodeVisuals.size) {
      renderTree();
      return;
    }
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
    const isActive = state.isEnrollMode && state.isFullscreen;
    panelEl.classList.toggle('tree-enroll-mode-active', isActive);

    if (!mobileEnrollToggleEl) {
      return;
    }

    mobileEnrollToggleEl.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    mobileEnrollToggleEl.classList.toggle('is-active', isActive);
    const actionLabel = isActive ? 'Disable enroll mode' : 'Enable enroll mode';
    mobileEnrollToggleEl.setAttribute('aria-label', actionLabel);
    mobileEnrollToggleEl.title = actionLabel;
  }

  function setEnrollMode(isEnabled, options = {}) {
    const nextValue = Boolean(isEnabled) && state.isFullscreen;
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
        scheduleMinimapRender();

        if (progress >= 1) {
          cameraAnimationFrameId = null;
          world.scale.set(targetScale);
          world.position.set(targetX, targetY);
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
    refreshNodeVisuals();
    schedulePersistUiState();
  }

  function clearSelectedNode() {
    state.selectedNodeId = null;
    setMobileSelectedOpen(false, { persist: false });
    refreshNodeVisuals();
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

  function drawNodeCard(graphics, node, selected) {
    const eligible = isCycleEligible(node, state.cycleRule);
    const isSpilloverNode = shouldUseSpilloverNodeHighlight(node);
    const isDirectSponsorNode = Boolean(state.data?.rootId && node?.sponsorId === state.data.rootId);
    const borderColor = selected
      ? (isSpilloverNode ? COLORS.borderSpilloverSelected : COLORS.borderSelected)
      : (isSpilloverNode ? COLORS.borderSpillover : (eligible ? COLORS.borderEligible : COLORS.borderDefault));
    const fillColor = isSpilloverNode
      ? (node.status === 'active' ? COLORS.backgroundSpilloverActive : COLORS.backgroundSpilloverInactive)
      : (node.status === 'active' ? COLORS.backgroundActive : COLORS.backgroundInactive);
    const contentLeftX = -NODE_WIDTH / 2 + 12;
    const contentRightX = NODE_WIDTH / 2 - 12;
    const dividerY = isDirectSponsorNode
      ? (-NODE_HEIGHT / 2 + 74)
      : (-NODE_HEIGHT / 2 + 66);

    graphics.clear();
    graphics.lineStyle(selected ? 2.5 : 1.5, borderColor, 1);
    graphics.beginFill(fillColor, 1);
    graphics.drawRoundedRect(-NODE_WIDTH / 2, -NODE_HEIGHT / 2, NODE_WIDTH, NODE_HEIGHT, 14);
    graphics.endFill();
    graphics.lineStyle(1, COLORS.borderDefault, 0.38);
    graphics.moveTo(contentLeftX, dividerY);
    graphics.lineTo(contentRightX, dividerY);
  }

  function createDirectSponsorNodeIcon() {
    const iconContainer = new PIXI.Container();

    const iconBackground = new PIXI.Graphics();
    iconBackground.lineStyle(1, COLORS.directSponsorIconBorder, 0.95);
    iconBackground.beginFill(COLORS.directSponsorIconFill, 0.94);
    iconBackground.drawRoundedRect(-11, -9, 22, 18, 5);
    iconBackground.endFill();
    iconContainer.addChild(iconBackground);

    const iconGlyph = new PIXI.Graphics();
    iconGlyph.lineStyle(1.4, COLORS.directSponsorIconGlyph, 1);
    iconGlyph.drawCircle(-2.8, -1.6, 2.2);
    iconGlyph.moveTo(-6.6, 4.5);
    iconGlyph.quadraticCurveTo(-2.8, 1.2, 1.0, 4.5);
    iconGlyph.moveTo(4.2, -0.9);
    iconGlyph.lineTo(8.2, -0.9);
    iconGlyph.moveTo(6.2, -2.9);
    iconGlyph.lineTo(6.2, 1.1);
    iconContainer.addChild(iconGlyph);

    return iconContainer;
  }

  function rebuildSpilloverLinkCache(layout) {
    state.spilloverLinkCache = [];
    if (!state.data || !layout?.nodeIds?.length) {
      return;
    }

    for (const nodeId of layout.nodeIds) {
      const node = state.data.nodes[nodeId];
      if (!node?.isSpillover || !node.sponsorId) {
        continue;
      }

      const sponsorPos = layout.positions.get(node.sponsorId);
      const nodePos = layout.positions.get(nodeId);
      if (!sponsorPos || !nodePos) {
        continue;
      }

      const startX = sponsorPos.x;
      const startY = sponsorPos.y + NODE_HEIGHT / 2;
      const endX = nodePos.x;
      const endY = nodePos.y - NODE_HEIGHT / 2;
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
      drawNodeCard(visual.background, visual.node, state.selectedNodeId === nodeId);
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

  function collectEnrollAnticipationSlots(layout) {
    if (!state.data || !state.isFullscreen || !state.isEnrollMode || !layout?.nodeIds?.length) {
      return [];
    }

    const slots = [];
    const layoutMeta = layout.meta instanceof Map ? layout.meta : new Map();

    for (const nodeId of layout.nodeIds) {
      const node = state.data.nodes[nodeId];
      const parentPoint = layoutMeta.get(nodeId);
      if (!node || !parentPoint) {
        continue;
      }

      const hasLeftChild = Boolean(node.leftChildId && state.data.nodes[node.leftChildId]);
      const hasRightChild = Boolean(node.rightChildId && state.data.nodes[node.rightChildId]);
      if (hasLeftChild && hasRightChild) {
        continue;
      }

      if (!hasLeftChild) {
        slots.push({
          parentNodeId: nodeId,
          side: 'left',
          depth: parentPoint.depth + 1,
          slot: parentPoint.slot * 2,
        });
      }
      if (!hasRightChild) {
        slots.push({
          parentNodeId: nodeId,
          side: 'right',
          depth: parentPoint.depth + 1,
          slot: parentPoint.slot * 2 + 1,
        });
      }
    }

    return slots;
  }

  function renderTree() {
    if (!state.data) {
      renderEmptyState('No binary data available.');
      return;
    }

    clearNodes();

    const shouldRenderEnrollAnticipation = state.isFullscreen && state.isEnrollMode;
    const layout = computeLayout(state.data, {
      reserveMissingChildDepth: shouldRenderEnrollAnticipation,
      slotWidth: shouldRenderEnrollAnticipation ? 296 : 248,
    });
    if (!layout.nodeIds.length) {
      renderEmptyState('No binary data available.');
      return;
    }

    state.nodePositions = layout.positions;
    const anticipationSlots = collectEnrollAnticipationSlots(layout);
    const anticipationPositionByKey = new Map();

    const nextBounds = {
      minX: layout.bounds.minX,
      minY: layout.bounds.minY,
      maxX: layout.bounds.maxX,
      maxY: layout.bounds.maxY,
    };

    for (const slotEntry of anticipationSlots) {
      const position = getLayoutPositionForDepthSlot(slotEntry.depth, slotEntry.slot, layout);
      anticipationPositionByKey.set(`${slotEntry.parentNodeId}:${slotEntry.side}`, position);
      nextBounds.minX = Math.min(nextBounds.minX, position.x - ENROLL_PLACEHOLDER_WIDTH / 2);
      nextBounds.minY = Math.min(nextBounds.minY, position.y - ENROLL_PLACEHOLDER_HEIGHT / 2);
      nextBounds.maxX = Math.max(nextBounds.maxX, position.x + ENROLL_PLACEHOLDER_WIDTH / 2);
      nextBounds.maxY = Math.max(nextBounds.maxY, position.y + ENROLL_PLACEHOLDER_HEIGHT / 2);
    }

    state.bounds = nextBounds;

    spilloverLinksLayer.clear();
    linksLayer.clear();

    for (const nodeId of layout.nodeIds) {
      const node = state.data.nodes[nodeId];
      const nodePosition = layout.positions.get(nodeId);
      if (!node || !nodePosition) {
        continue;
      }

      const children = [node.leftChildId, node.rightChildId];
      for (const childId of children) {
        if (!childId) {
          continue;
        }
        const childPos = layout.positions.get(childId);
        if (!childPos) {
          continue;
        }

        const startX = nodePosition.x;
        const startY = nodePosition.y + NODE_HEIGHT / 2;
        const endX = childPos.x;
        const endY = childPos.y - NODE_HEIGHT / 2;
        const bendY = startY + (endY - startY) * 0.4;

        linksLayer.lineStyle(2, COLORS.link, 0.9);
        linksLayer.moveTo(startX, startY);
        linksLayer.bezierCurveTo(startX, bendY, endX, bendY, endX, endY);
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
        const startY = parentPosition.y + NODE_HEIGHT / 2;
        const endX = placeholderPosition.x;
        const endY = placeholderPosition.y - ENROLL_PLACEHOLDER_HEIGHT / 2;
        const bendY = startY + (endY - startY) * 0.44;
        const anticipationPath = buildBezierPolyline(startX, startY, startX, bendY, endX, bendY, endX, endY);
        drawDashedPolyline(linksLayer, anticipationPath, 8, 5);
      }
    }

    rebuildSpilloverLinkCache(layout);
    renderSpilloverLinks();

    for (const nodeId of layout.nodeIds) {
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

      const memberText = new PIXI.Text(truncateNodeLabel(node.name, 30), titleStyle);
      memberText.position.set(-NODE_WIDTH / 2 + 12, -NODE_HEIGHT / 2 + 10);
      nodeContainer.addChild(memberText);

      const usernameText = new PIXI.Text(truncateNodeLabel(formatMemberHandle(node.memberCode), 30), detailStyle);
      usernameText.position.set(-NODE_WIDTH / 2 + 12, -NODE_HEIGHT / 2 + 31);
      nodeContainer.addChild(usernameText);

      const isDirectSponsorNode = node.sponsorId === state.data.rootId;
      if (isDirectSponsorNode) {
        const directSponsorIcon = createDirectSponsorNodeIcon();
        directSponsorIcon.position.set(NODE_WIDTH / 2 - 20, -NODE_HEIGHT / 2 + 18);
        nodeContainer.addChild(directSponsorIcon);
      }

      const statusLabel = formatStatus(node.status);
      const statusText = new PIXI.Text(statusLabel, chipStyle);
      statusText.style.fill = node.status === 'active' ? COLORS.statusActive : COLORS.statusInactive;
      statusText.anchor.set(0.5);
      const statusChipTextBounds = statusText.getLocalBounds();
      const statusChipPaddingX = 10;
      const statusChipHeight = 19;
      const statusChipWidth = Math.max(68, Math.ceil(statusChipTextBounds.width) + (statusChipPaddingX * 2));
      const statusChipContainer = new PIXI.Container();
      const statusChipX = NODE_WIDTH / 2 - 12 - statusChipWidth;
      const statusChipY = isDirectSponsorNode
        ? (-NODE_HEIGHT / 2 + 34)
        : (-NODE_HEIGHT / 2 + 10);
      statusChipContainer.position.set(statusChipX, statusChipY);
      const statusChipBackground = new PIXI.Graphics();
      const statusChipBorderColor = node.status === 'active' ? COLORS.statusActive : COLORS.statusInactive;
      const statusChipFillColor = node.status === 'active' ? COLORS.statusChipFillActive : COLORS.statusChipFillInactive;
      statusChipBackground.lineStyle(1, statusChipBorderColor, 0.6);
      statusChipBackground.beginFill(statusChipFillColor, 0.5);
      statusChipBackground.drawRoundedRect(0, 0, statusChipWidth, statusChipHeight, 9);
      statusChipBackground.endFill();
      statusText.position.set(statusChipWidth / 2, statusChipHeight / 2);
      statusChipContainer.addChild(statusChipBackground);
      statusChipContainer.addChild(statusText);
      nodeContainer.addChild(statusChipContainer);

      const displayLegVolumes = getNodeDisplayLegVolumes(node);
      const legLeftText = new PIXI.Text(`L Team: ${displayLegVolumes.leftBv.toLocaleString()} BV`, detailStyle);
      legLeftText.position.set(
        -NODE_WIDTH / 2 + 12,
        isDirectSponsorNode ? (-NODE_HEIGHT / 2 + 80) : (-NODE_HEIGHT / 2 + 72),
      );
      nodeContainer.addChild(legLeftText);

      const legRightText = new PIXI.Text(`R Team: ${displayLegVolumes.rightBv.toLocaleString()} BV`, detailStyle);
      legRightText.anchor.set(1, 0);
      legRightText.position.set(
        NODE_WIDTH / 2 - 12,
        isDirectSponsorNode ? (-NODE_HEIGHT / 2 + 80) : (-NODE_HEIGHT / 2 + 72),
      );
      nodeContainer.addChild(legRightText);

      const secondaryMetricText = new PIXI.Text(formatSecondaryMetricText(node, secondaryMetricMode), detailStyle);
      secondaryMetricText.position.set(
        -NODE_WIDTH / 2 + 12,
        isDirectSponsorNode ? (-NODE_HEIGHT / 2 + 102) : (-NODE_HEIGHT / 2 + 94),
      );
      nodeContainer.addChild(secondaryMetricText);

      if (!shouldHideNodeRankAndCountry(node)) {
        const flagSprite = new PIXI.Sprite(PIXI.Texture.from(getCountryFlagSvgAssetPath(node.countryFlag)));
        flagSprite.width = 20;
        flagSprite.height = 15;
        flagSprite.anchor.set(1, 0);
        flagSprite.position.set(NODE_WIDTH / 2 - 12, NODE_HEIGHT / 2 - 30);
        nodeContainer.addChild(flagSprite);
      }

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
      state.nodeVisuals.set(nodeId, { node, background, container: nodeContainer });
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
      placeholderContainer.hitArea = new PIXI.RoundedRectangle(
        -ENROLL_PLACEHOLDER_WIDTH / 2,
        -ENROLL_PLACEHOLDER_HEIGHT / 2,
        ENROLL_PLACEHOLDER_WIDTH,
        ENROLL_PLACEHOLDER_HEIGHT,
        ENROLL_PLACEHOLDER_CORNER_RADIUS,
      );

      const placeholderBackground = new PIXI.Graphics();
      placeholderBackground.lineStyle(1.6, COLORS.statusActive, 0.92);
      placeholderBackground.beginFill(COLORS.statusActive, 0.07);
      placeholderBackground.drawRoundedRect(
        -ENROLL_PLACEHOLDER_WIDTH / 2,
        -ENROLL_PLACEHOLDER_HEIGHT / 2,
        ENROLL_PLACEHOLDER_WIDTH,
        ENROLL_PLACEHOLDER_HEIGHT,
        ENROLL_PLACEHOLDER_CORNER_RADIUS,
      );
      placeholderBackground.endFill();
      placeholderContainer.addChild(placeholderBackground);

      const plusText = new PIXI.Text('+', enrollPlaceholderPlusStyle);
      plusText.anchor.set(0.5, 0);
      plusText.position.set(0, -ENROLL_PLACEHOLDER_HEIGHT / 2 + 8);
      placeholderContainer.addChild(plusText);

      const titleText = new PIXI.Text('Enroll Member', enrollPlaceholderTitleStyle);
      titleText.anchor.set(0.5, 0.5);
      titleText.position.set(0, -2);
      placeholderContainer.addChild(titleText);

      const sideLabel = slotEntry.side === 'right' ? 'Right Slot' : 'Left Slot';
      const subtitleText = new PIXI.Text(sideLabel, enrollPlaceholderSubtitleStyle);
      subtitleText.anchor.set(0.5, 1);
      subtitleText.position.set(0, ENROLL_PLACEHOLDER_HEIGHT / 2 - 8);
      placeholderContainer.addChild(subtitleText);

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
    scheduleMinimapRender();
    schedulePersistUiState();
  }

  function panBy(deltaX, deltaY) {
    stopCameraAnimation();
    world.position.x += deltaX;
    world.position.y += deltaY;
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
    scheduleMinimapRender();
    schedulePersistUiState();
  }

  function resetView() {
    stopCameraAnimation();
    if (state.initialTransform) {
      world.scale.set(state.initialTransform.scale);
      world.position.set(state.initialTransform.x, state.initialTransform.y);
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
    fitToView();
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

    if (!applyCameraSnapshot(pendingRestore?.camera)) {
      scheduleMinimapRender();
    }

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
    const halfWidth = NODE_WIDTH / 2;
    const halfHeight = NODE_HEIGHT / 2;

    for (const nodePosition of state.nodePositions.values()) {
      if (
        Math.abs(worldX - nodePosition.x) <= halfWidth
        && Math.abs(worldY - nodePosition.y) <= halfHeight
      ) {
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
