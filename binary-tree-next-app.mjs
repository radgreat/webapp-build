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
const NODE_RADIUS_BASE = 40;
const WORLD_RADIUS_BASE = 34;
const DEFAULT_HOME_SCALE = 0.025;
const PROJECTION_BASE_SCALE = 0.92;
const DEFAULT_ROOT_FOCUS_RADIUS = 38;
const MOCK_TREE_MAX_DEPTH = 20;
const MOCK_LEVEL_NODE_CAP = 128;
const UNIVERSE_DEPTH_CAP = 20;
const SELECTION_POP_MS = 320;
const SELECTION_RELEASE_MS = 220;
const SELECTION_MAX_EMPHASIS = 1.22;
const MAIN_BACKGROUND_COLOR = '#E9EAEE';
const SHELL_PANEL_COLOR = '#FFFFFF';
const SHELL_PANEL_BORDER_COLOR = '#E7E7EA';
const SKELETON_SLOT_COLOR = '#EDEDED';
const STARTUP_REVEAL_MS = 860;
const STARTUP_REVEAL_OFFSET_Y = 86;
const STARTUP_REVEAL_BLUR_PX = 14;
const STARTUP_REVEAL_STAGGER_MS = 52;
const STARTUP_PANEL_REVEAL_MS = 620;
const STARTUP_PANEL_OFFSET_Y = 40;
const STARTUP_PANEL_BLUR_PX = 10;
const STARTUP_SIDE_PANEL_DELAY_MS = 64;
const STARTUP_DOCK_DELAY_MS = 138;
const LOADING_MIN_MS = 460;
const LOADING_FADE_MS = 260;
const SIDE_NAV_BRAND_LOGO_SRC = '/brand_assets/Logos/L%26D%20Logo_Cropped.png';
const SIDE_NAV_BRAND_TOGGLE_BUTTON_ID = 'side-nav-brand-toggle';
const SIDE_NAV_COLLAPSE_BUTTON_ID = 'side-nav-collapse-button';
const SIDE_NAV_COLLAPSE_ICON_LEFT_GLYPH = String.fromCodePoint(0xEAC3);
const SIDE_NAV_COLLAPSE_ICON_RIGHT_GLYPH = String.fromCodePoint(0xEAC9);
const SIDE_NAV_COLLAPSE_HOVER_MS = 150;
const SIDE_NAV_BRAND_ITEM_BUTTON_PREFIX = 'side-nav-brand-item-';
const SIDE_NAV_BRAND_MENU_ITEMS = [
  { id: 'profile', label: 'Profile', action: 'brand-menu:page:profile' },
  { id: 'dashboard', label: 'Home', action: 'brand-menu:page:dashboard' },
  { id: 'my-store', label: 'My Store', action: 'brand-menu:page:my-store' },
  { id: 'settings', label: 'Settings', action: 'brand-menu:page:settings' },
];
const SIDE_NAV_BRAND_LOGOUT_ITEM = { id: 'logout', label: 'Log out', action: 'brand-menu:action:logout' };

const canvas = document.getElementById('figma-tree-canvas');
const bootErrorElement = document.getElementById('boot-error');
const loadingScreenElement = document.getElementById('binary-tree-loading');

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
const sideNavBrandLogoImage = new Image();
sideNavBrandLogoImage.decoding = 'async';
sideNavBrandLogoImage.src = SIDE_NAV_BRAND_LOGO_SRC;

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
  universe: {
    rootId: 'root',
    depthCap: UNIVERSE_DEPTH_CAP,
    breadcrumb: ['root'],
    cameraByRoot: Object.create(null),
    history: [],
  },
  ui: {
    sideNavOpen: true,
    sideNavBrandMenuOpen: false,
    sideNavCollapseHoverFx: {
      value: 0,
      from: 0,
      to: 0,
      startedAtMs: performance.now(),
    },
  },
  layout: null,
  viewport: null,
  frameResult: null,
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
  camera: {
    view: {
      x: 0,
      y: 0,
      scale: DEFAULT_HOME_SCALE,
    },
    target: null,
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
  },
  loading: {
    startedAtMs: performance.now(),
    minMs: LOADING_MIN_MS,
    fadeMs: LOADING_FADE_MS,
  },
  timeMs: performance.now(),
  selectionFxTracks: Object.create(null),
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

function hideLoadingScreenImmediately() {
  if (!(loadingScreenElement instanceof HTMLElement)) {
    return;
  }
  loadingScreenElement.style.display = 'none';
  loadingScreenElement.classList.remove('is-leaving');
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

function resolveProjectionScale(rawScale) {
  const safeRawScale = clamp(safeNumber(rawScale, DEFAULT_HOME_SCALE), MIN_SCALE, MAX_SCALE);
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

function createPovSnapshot(rootId = getUniverseRootId()) {
  const safeRootId = safeText(rootId) || 'root';
  return {
    rootId: safeRootId,
    selectedId: safeText(state.selectedId) || safeRootId,
    query: safeText(state.query),
    depthFilter: safeText(state.depthFilter || 'all') || 'all',
  };
}

function enterNodeUniverse(nodeId = state.selectedId, animated = true) {
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

  if (restoreUniverseCamera(targetNodeId, animated)) {
    return true;
  }

  setCameraTarget(computeHomeView(), false);
  return focusUniverseRoot(animated);
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

function exitNodeUniverse(animated = true) {
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

  if (restoreUniverseCamera(parentRootId, animated)) {
    return true;
  }

  if (focusNode(state.selectedId || parentRootId, 30, animated)) {
    return true;
  }
  return focusUniverseRoot(animated);
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
  return true;
}

function truncateText(text, maxLength) {
  const safe = safeText(text);
  if (!safe || safe.length <= maxLength) {
    return safe;
  }
  return `${safe.slice(0, maxLength - 1)}...`;
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

function buildMockNodes() {
  const firstNames = [
    'Avery',
    'Logan',
    'Jordan',
    'Skyler',
    'Reese',
    'Morgan',
    'Harper',
    'Hayden',
    'Rowan',
    'Dakota',
    'Parker',
    'Riley',
    'Casey',
    'Alex',
    'Bailey',
    'Sawyer',
    'Phoenix',
    'Cameron',
    'Quinn',
    'Taylor',
  ];

  const lastNames = [
    'Stone',
    'Rivera',
    'Mason',
    'Lane',
    'Keller',
    'Monroe',
    'Pierce',
    'Cross',
    'Bennett',
    'Hale',
    'Frost',
    'Walsh',
    'Griffin',
    'Nash',
    'Reed',
    'Hayes',
    'Park',
    'West',
    'Blake',
    'Hunt',
  ];

  function nameFromIndex(index) {
    const first = firstNames[index % firstNames.length];
    const last = lastNames[Math.floor(index / firstNames.length) % lastNames.length];
    return `${first} ${last}`;
  }

  const nodes = [];
  let nextId = 1;

  const rootId = 'root';
  nodes.push({
    id: rootId,
    parent: '',
    side: '',
    name: 'Root Sponsor',
    role: 'Network Head',
    status: 'active',
    rank: 'Legacy',
    volume: 48220,
  });

  let currentLayer = [{ id: rootId, depth: 0 }];
  for (let depth = 1; depth <= MOCK_TREE_MAX_DEPTH; depth += 1) {
    if (!currentLayer.length) {
      break;
    }

    const maxChildrenAtDepth = Math.min(
      MOCK_LEVEL_NODE_CAP,
      currentLayer.length * 2,
    );
    let remainingAtDepth = maxChildrenAtDepth;
    const nextLayer = [];

    for (const parentMeta of currentLayer) {
      if (remainingAtDepth <= 0) {
        break;
      }

      const baseVolume = Math.max(10, Math.round(2200 / (depth + 0.4)));
      const childSides = ['left', 'right'];
      for (const side of childSides) {
        if (remainingAtDepth <= 0) {
          break;
        }

        const id = `n-${nextId}`;
        nextId += 1;
        const seed = nextId + (depth * (side === 'left' ? 2 : 3));

        nodes.push({
          id,
          parent: parentMeta.id,
          side,
          name: nameFromIndex(seed),
          role: depth <= 2 ? 'Leader' : (depth <= 6 ? 'Distributor' : 'Branch'),
          status: depth % 5 === 0 ? 'stabilizing' : 'active',
          rank: depth <= 1 ? 'Diamond' : (depth <= 3 ? 'Platinum' : (depth <= 5 ? 'Gold' : 'Builder')),
          volume: baseVolume + (depth * (side === 'left' ? 18 : 13)),
        });

        nextLayer.push({ id, depth });
        remainingAtDepth -= 1;
      }
    }

    currentLayer = nextLayer;
  }

  return nodes;
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
  const sideNavWidth = clamp(Math.round(width * 0.235), 300, 360);

  const workspace = {
    x: 0,
    y: 0,
    width,
    height,
  };
  const sideNav = {
    x: edgePad,
    y: edgePad,
    width: sideNavWidth,
    height: height - (edgePad * 2),
  };
  const sideNavToggle = {
    x: edgePad,
    y: edgePad,
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
    family = 'Inter, Segoe UI, sans-serif',
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

function resolveSideNavCollapseHoverProgress(isHovered, nowMs = getNowMs()) {
  if (!state.ui || typeof state.ui !== 'object') {
    state.ui = {};
  }
  const existing = state.ui.sideNavCollapseHoverFx && typeof state.ui.sideNavCollapseHoverFx === 'object'
    ? state.ui.sideNavCollapseHoverFx
    : {
      value: 0,
      from: 0,
      to: 0,
      startedAtMs: nowMs,
    };
  const nextTarget = isHovered ? 1 : 0;
  if (existing.to !== nextTarget) {
    existing.from = safeNumber(existing.value, 0);
    existing.to = nextTarget;
    existing.startedAtMs = nowMs;
  }

  const durationMs = Math.max(1, SIDE_NAV_COLLAPSE_HOVER_MS);
  const t = clamp((nowMs - safeNumber(existing.startedAtMs, nowMs)) / durationMs, 0, 1);
  const entering = safeNumber(existing.to, 0) > safeNumber(existing.from, 0);
  const eased = entering ? easeOutBack(t) : easeOutCubic(t);
  existing.value = safeNumber(existing.from, 0) + ((safeNumber(existing.to, 0) - safeNumber(existing.from, 0)) * eased);
  if (t >= 1) {
    existing.value = safeNumber(existing.to, 0);
  }
  state.ui.sideNavCollapseHoverFx = existing;
  return clamp(existing.value, 0, 1.08);
}

function drawSideNavCollapseButton({
  x,
  y,
  width,
  height,
  hovered = false,
  direction = 'left',
}) {
  const hoverProgress = resolveSideNavCollapseHoverProgress(hovered);
  const scale = 1 + (hoverProgress * 0.045);
  const centerX = x + (width / 2);
  const centerY = y + (height / 2);

  context.save();
  context.translate(centerX, centerY);
  context.scale(scale, scale);
  context.translate(-centerX, -centerY);

  context.save();
  if (hoverProgress > 0.001) {
    context.shadowColor = `rgba(92, 101, 119, ${(0.08 + (hoverProgress * 0.13)).toFixed(3)})`;
    context.shadowBlur = 8 + (hoverProgress * 8);
    context.shadowOffsetY = 2 + (hoverProgress * 2);
  }
  fillRoundedRect(context, x, y, width, height, 14, '#FFFFFF');
  context.restore();
  if (hoverProgress > 0.001) {
    context.save();
    context.globalAlpha = Math.min(1, hoverProgress * 0.9);
    fillRoundedRect(context, x, y, width, height, 14, '#F3F4F6');
    context.restore();
  }

  const strokeColor = hoverProgress > 0.28 ? '#DCDDE2' : '#E2E4E8';
  strokeRoundedRect(context, x + 0.5, y + 0.5, width - 1, height - 1, 14, strokeColor, 1);

  const iconGlyph = direction === 'right' ? SIDE_NAV_COLLAPSE_ICON_RIGHT_GLYPH : SIDE_NAV_COLLAPSE_ICON_LEFT_GLYPH;
  const iconColor = hoverProgress > 0.24 ? '#3E4554' : '#596172';
  drawText(iconGlyph, centerX, centerY + 0.5, {
    size: Math.floor(17 + (hoverProgress * 1.6)),
    weight: 500,
    family: '"Material Symbols Outlined", "Segoe UI Symbol", sans-serif',
    color: iconColor,
    align: 'center',
  });

  context.restore();
}

function drawSideNavBrandLogo(x, y, width, height) {
  const imageReady = (
    sideNavBrandLogoImage instanceof HTMLImageElement
    && sideNavBrandLogoImage.complete
    && sideNavBrandLogoImage.naturalWidth > 0
    && sideNavBrandLogoImage.naturalHeight > 0
  );
  if (!imageReady) {
    drawText('Premiere Life', x, y + (height / 2) + 0.5, {
      size: 14,
      weight: 600,
      color: '#2f3441',
    });
    return;
  }

  const sourceRatio = sideNavBrandLogoImage.naturalWidth / sideNavBrandLogoImage.naturalHeight;
  const targetRatio = width / Math.max(1, height);
  let drawWidth = width;
  let drawHeight = height;
  if (targetRatio > sourceRatio) {
    drawHeight = height;
    drawWidth = drawHeight * sourceRatio;
  } else {
    drawWidth = width;
    drawHeight = drawWidth / sourceRatio;
  }

  const drawX = x;
  const drawY = y + ((height - drawHeight) * 0.5);
  const dpr = Math.max(1, safeNumber(state.renderSize?.dpr, 1));
  const alignedX = Math.round(drawX * dpr) / dpr;
  const alignedY = Math.round(drawY * dpr) / dpr;
  const alignedWidth = Math.max(1 / dpr, Math.round(drawWidth * dpr) / dpr);
  const alignedHeight = Math.max(1 / dpr, Math.round(drawHeight * dpr) / dpr);

  context.save();
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(sideNavBrandLogoImage, alignedX, alignedY, alignedWidth, alignedHeight);
  context.restore();
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

function findProjectedNodeAt(pointX, pointY) {
  const projectedNodes = Array.isArray(state.frameResult?.projectedNodes)
    ? state.frameResult.projectedNodes
    : [];
  let best = null;
  for (let index = projectedNodes.length - 1; index >= 0; index -= 1) {
    const node = projectedNodes[index];
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

function drawSideNavToggle(layout) {
  if (state.ui.sideNavOpen) {
    return;
  }
  const toggle = layout.sideNavToggle;
  const buttonId = SIDE_NAV_COLLAPSE_BUTTON_ID;
  const hovered = state.hoveredButtonId === buttonId;
  const width = 44;
  const height = 34;
  const x = toggle.x;
  const y = toggle.y + 4;

  drawSideNavCollapseButton({
    x,
    y,
    width,
    height,
    hovered,
    direction: 'right',
  });

  registerButton({
    id: buttonId,
    x,
    y,
    width,
    height,
    action: 'toggle:side-nav',
  });
}

function drawSideNav(layout) {
  if (!state.ui.sideNavOpen) {
    drawSideNavToggle(layout);
    return;
  }

  const panelReveal = resolveStartupRevealForPanel(STARTUP_SIDE_PANEL_DELAY_MS);
  if (panelReveal.progress <= 0) {
    return;
  }
  const applyPanelReveal = panelReveal.active;
  if (applyPanelReveal) {
    context.save();
    context.translate(0, panelReveal.translateY);
    context.globalAlpha *= panelReveal.alpha;
    context.filter = `blur(${panelReveal.blurPx.toFixed(2)}px)`;
  }

  try {
    const panel = layout.sideNav;
    const buttonYOffset = applyPanelReveal ? panelReveal.translateY : 0;
    drawPanelChrome(panel, 'left');

    const insetX = 22;
    const slotX = panel.x + insetX;
    const slotWidth = panel.width - (insetX * 2);
    const topRowGap = 8;
    const collapseButtonWidth = 38;
    const topPadding = 24;
    const gap = 20;
    const brandButtonHeight = 50;
    const brandButtonWidth = Math.max(160, slotWidth - collapseButtonWidth - topRowGap);
    const collapseButtonX = slotX + brandButtonWidth + topRowGap;
    const smallCardHeight = 150;
    const bottomCardHeight = 150;
    const minMiddleHeight = 220;
    const fixedHeight = (
      topPadding
      + brandButtonHeight
      + gap
      + smallCardHeight
      + gap
      + smallCardHeight
      + gap
      + bottomCardHeight
      + gap
      + topPadding
    );
    const middleCardHeight = Math.max(minMiddleHeight, panel.height - fixedHeight);

    let y = panel.y + topPadding;
    const brandButtonY = y;
    const brandMenuOpen = Boolean(state.ui.sideNavBrandMenuOpen);
    const brandButtonHovered = state.hoveredButtonId === SIDE_NAV_BRAND_TOGGLE_BUTTON_ID;
    const brandButtonFill = brandMenuOpen
      ? '#EFF0F3'
      : (brandButtonHovered ? '#F3F4F6' : '#F6F7F9');
    const brandButtonStroke = brandMenuOpen
      ? '#D8DAE0'
      : (brandButtonHovered ? '#DCDDE2' : '#E2E4E8');
    fillRoundedRect(context, slotX, brandButtonY, brandButtonWidth, brandButtonHeight, 14, brandButtonFill);
    strokeRoundedRect(
      context,
      slotX + 0.5,
      brandButtonY + 0.5,
      brandButtonWidth - 1,
      brandButtonHeight - 1,
      14,
      brandButtonStroke,
      1,
    );

    const logoInsetX = 13;
    const logoInsetY = 9;
    const logoAreaX = slotX + logoInsetX;
    const logoAreaY = brandButtonY + logoInsetY;
    const logoAreaWidth = brandButtonWidth - 44;
    const logoAreaHeight = brandButtonHeight - (logoInsetY * 2);
    drawSideNavBrandLogo(logoAreaX, logoAreaY, logoAreaWidth, logoAreaHeight);
    drawChevronGlyph(slotX + brandButtonWidth - 17, brandButtonY + (brandButtonHeight / 2), {
      color: brandMenuOpen ? '#505665' : '#6a7080',
      expanded: brandMenuOpen,
      size: 7,
      lineWidth: 1.8,
    });

    registerButton({
      id: SIDE_NAV_BRAND_TOGGLE_BUTTON_ID,
      x: slotX,
      y: brandButtonY + buttonYOffset,
      width: brandButtonWidth,
      height: brandButtonHeight,
      action: 'brand-menu:toggle',
    });

    const collapseButtonHovered = state.hoveredButtonId === SIDE_NAV_COLLAPSE_BUTTON_ID;
    drawSideNavCollapseButton({
      x: collapseButtonX,
      y: brandButtonY,
      width: collapseButtonWidth,
      height: brandButtonHeight,
      hovered: collapseButtonHovered,
      direction: 'left',
    });
    registerButton({
      id: SIDE_NAV_COLLAPSE_BUTTON_ID,
      x: collapseButtonX,
      y: brandButtonY + buttonYOffset,
      width: collapseButtonWidth,
      height: brandButtonHeight,
      action: 'toggle:side-nav',
    });

    y += brandButtonHeight + gap;
    drawSkeletonSlot(slotX, y, slotWidth, smallCardHeight, 20);
    y += smallCardHeight + gap;
    drawSkeletonSlot(slotX, y, slotWidth, smallCardHeight, 20);
    y += smallCardHeight + gap;
    drawSkeletonSlot(slotX, y, slotWidth, middleCardHeight, 20);
    y += middleCardHeight + gap;
    drawSkeletonSlot(slotX, y, slotWidth, bottomCardHeight, 20);

    if (brandMenuOpen) {
      const profileName = truncateText(resolveSessionDisplayName(), 22);
      const profileEmail = truncateText(resolveSessionDisplayEmail(), 28);
      const profileInitials = resolveInitials(profileName);
      const menuPadding = 8;
      const profileHeight = 50;
      const profileBottomGap = 8;
      const itemHeight = 34;
      const itemGap = 5;
      const dividerGap = 8;
      const dividerHeight = 1;
      const listHeight = (
        SIDE_NAV_BRAND_MENU_ITEMS.length * itemHeight
        + Math.max(0, SIDE_NAV_BRAND_MENU_ITEMS.length - 1) * itemGap
      );
      const menuHeight = (
        menuPadding
        + profileHeight
        + profileBottomGap
        + listHeight
        + dividerGap
        + dividerHeight
        + dividerGap
        + itemHeight
        + menuPadding
      );
      const menuX = slotX;
      const menuY = brandButtonY + brandButtonHeight + 10;
      const menuWidth = brandButtonWidth;

      fillRoundedRect(context, menuX, menuY, menuWidth, menuHeight, 16, '#FFFFFF');
      strokeRoundedRect(context, menuX + 0.5, menuY + 0.5, menuWidth - 1, menuHeight - 1, 16, '#DFE1E6');

      const profileX = menuX + menuPadding;
      const profileY = menuY + menuPadding;
      const profileWidth = menuWidth - (menuPadding * 2);
      fillRoundedRect(context, profileX, profileY, profileWidth, profileHeight, 12, '#F6F7F9');
      strokeRoundedRect(context, profileX + 0.5, profileY + 0.5, profileWidth - 1, profileHeight - 1, 12, '#EBEDF1');

      const avatarSize = 32;
      const avatarX = profileX + 8;
      const avatarY = profileY + ((profileHeight - avatarSize) / 2);
      fillRoundedRect(context, avatarX, avatarY, avatarSize, avatarSize, 9, '#D8DBE2');
      drawText(profileInitials, avatarX + (avatarSize / 2), avatarY + (avatarSize / 2) + 0.5, {
        size: 12,
        weight: 700,
        color: '#3b4251',
        align: 'center',
      });

      drawText(profileName, avatarX + avatarSize + 9, profileY + 18, {
        size: 12,
        weight: 600,
        color: '#303645',
      });
      drawText(profileEmail, avatarX + avatarSize + 9, profileY + 34, {
        size: 10,
        weight: 500,
        color: '#6f7584',
      });

      let itemY = profileY + profileHeight + profileBottomGap;
      const itemX = menuX + menuPadding;
      const itemWidth = menuWidth - (menuPadding * 2);
      for (const item of SIDE_NAV_BRAND_MENU_ITEMS) {
        const buttonId = `${SIDE_NAV_BRAND_ITEM_BUTTON_PREFIX}${item.id}`;
        const hovered = state.hoveredButtonId === buttonId;
        if (hovered) {
          fillRoundedRect(context, itemX, itemY, itemWidth, itemHeight, 10, '#F2F3F6');
          strokeRoundedRect(context, itemX + 0.5, itemY + 0.5, itemWidth - 1, itemHeight - 1, 10, '#E6E8EE');
        }
        drawText(item.label, itemX + 12, itemY + (itemHeight / 2) + 0.5, {
          size: 12,
          weight: 500,
          color: '#3b4353',
        });
        registerButton({
          id: buttonId,
          x: itemX,
          y: itemY + buttonYOffset,
          width: itemWidth,
          height: itemHeight,
          action: item.action,
        });
        itemY += itemHeight + itemGap;
      }

      const dividerY = itemY + dividerGap;
      line(context, itemX, dividerY + 0.5, itemX + itemWidth, dividerY + 0.5, '#E5E7EC', 1);
      itemY = dividerY + dividerGap;

      const logoutButtonId = `${SIDE_NAV_BRAND_ITEM_BUTTON_PREFIX}${SIDE_NAV_BRAND_LOGOUT_ITEM.id}`;
      const logoutHovered = state.hoveredButtonId === logoutButtonId;
      if (logoutHovered) {
        fillRoundedRect(context, itemX, itemY, itemWidth, itemHeight, 10, '#F8F1F2');
        strokeRoundedRect(context, itemX + 0.5, itemY + 0.5, itemWidth - 1, itemHeight - 1, 10, '#F1E2E5');
      }
      drawText(SIDE_NAV_BRAND_LOGOUT_ITEM.label, itemX + 12, itemY + (itemHeight / 2) + 0.5, {
        size: 12,
        weight: 600,
        color: '#6b3840',
      });
      registerButton({
        id: logoutButtonId,
        x: itemX,
        y: itemY + buttonYOffset,
        width: itemWidth,
        height: itemHeight,
        action: SIDE_NAV_BRAND_LOGOUT_ITEM.action,
      });
    }
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
  const applyPanelReveal = panelReveal.active;
  const buttonYOffset = applyPanelReveal ? panelReveal.translateY : 0;
  if (applyPanelReveal) {
    context.save();
    context.translate(0, panelReveal.translateY);
    context.globalAlpha *= panelReveal.alpha;
    context.filter = `blur(${panelReveal.blurPx.toFixed(2)}px)`;
  }

  try {
  const bar = layout.bottomBar;
  fillRoundedRect(context, bar.x, bar.y, bar.width, bar.height, 30, '#FFFFFF');
  strokeRoundedRect(context, bar.x + 0.5, bar.y + 0.5, bar.width - 1, bar.height - 1, 30, '#FFFFFF', 1);

  const dockButtons = [
    { id: 'dock-back', iconGlyph: String.fromCodePoint(0xEF7D), action: 'universe:back' },
    { id: 'dock-home', iconGlyph: String.fromCodePoint(0xE9B2), action: 'camera:home' },
    { id: 'dock-enter', iconGlyph: String.fromCodePoint(0xEA77), action: 'universe:enter' },
    { id: 'dock-deep', iconGlyph: String.fromCodePoint(0xE16D), action: 'camera:deep' },
    { id: 'dock-placeholder', iconGlyph: String.fromCodePoint(0xF525), action: 'dock:placeholder' },
  ];

  const slots = dockButtons.length;
  const gap = 16;
  const padX = 20;
  const padY = 16;
  const slotHeight = bar.height - (padY * 2);
  const slotWidth = Math.floor((bar.width - (padX * 2) - ((slots - 1) * gap)) / slots);

  let x = bar.x + padX;
  const y = bar.y + padY;
  for (const button of dockButtons) {
    const hovered = state.hoveredButtonId === button.id;
    const fill = hovered ? '#E3E3E3' : '#EDEDED';
    const stroke = hovered ? '#DDDDDD' : '#EDEDED';
    const iconColor = hovered ? '#171717' : '#303030';

    context.save();
    if (hovered) {
      context.shadowColor = 'rgba(48, 48, 48, 0.16)';
      context.shadowBlur = 12;
      context.shadowOffsetY = 4;
    }
    fillRoundedRect(context, x, y, slotWidth, slotHeight, 18, fill);
    context.restore();
    strokeRoundedRect(context, x + 0.5, y + 0.5, slotWidth - 1, slotHeight - 1, 18, stroke, 2);

    drawText(button.iconGlyph, x + (slotWidth / 2), y + (slotHeight / 2) + 1, {
      size: 24,
      weight: 400,
      family: '"Material Symbols Outlined", "Segoe UI Symbol", sans-serif',
      color: iconColor,
      align: 'center',
    });
    registerButton({
      id: button.id,
      x,
      y: y + buttonYOffset,
      width: slotWidth,
      height: slotHeight,
      action: button.action,
    });
    x += slotWidth + gap;
  }
  } finally {
    if (applyPanelReveal) {
      context.restore();
    }
  }
}

function resolveStartupRevealForDepth(depth = 0, nowMs = getNowMs()) {
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
  const delayMs = safeDepth * staggerMs;
  const elapsedMs = Math.max(0, nowMs - safeNumber(intro.startedAtMs, nowMs) - delayMs);
  const t = clamp(elapsedMs / durationMs, 0, 1);
  const eased = easeOutCubic(t);
  const inverse = 1 - eased;
  const depthDrift = 1 + Math.min(8, safeDepth) * 0.08;
  return {
    active: t < 1,
    progress: t,
    translateY: safeNumber(intro.offsetYPx, STARTUP_REVEAL_OFFSET_Y) * depthDrift * inverse,
    blurPx: safeNumber(intro.blurPx, STARTUP_REVEAL_BLUR_PX) * inverse,
    alpha: clamp(0.12 + (eased * 0.88), 0, 1),
  };
}

function resolveStartupRevealForPanel(delayMs = 0, nowMs = getNowMs()) {
  const intro = state.intro;
  const safeDelayMs = Math.max(0, safeNumber(delayMs, 0));
  if (!intro || !Number.isFinite(intro.startedAtMs)) {
    return {
      active: true,
      progress: 0,
      translateY: STARTUP_PANEL_OFFSET_Y,
      blurPx: STARTUP_PANEL_BLUR_PX,
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
    blurPx: STARTUP_PANEL_BLUR_PX * inverse,
    alpha: clamp(0.12 + (eased * 0.88), 0, 1),
  };
}

function drawConnectors(projectedNodes) {
  if (!state.showConnectors) {
    return;
  }
  const visibleNodes = Array.isArray(projectedNodes) ? projectedNodes : [];
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

  for (const [parentId, children] of childrenByParent.entries()) {
    const parent = nodeById.get(parentId);
    if (!parent || !children.length) {
      continue;
    }

    const parentDepth = safeNumber(parent.localDepth, safeNumber(parent.node?.depth, 0));
    const childDepth = Math.min(...children.map((child) => safeNumber(child.localDepth, parentDepth + 1)));
    const reveal = resolveStartupRevealForDepth(Math.max(parentDepth, childDepth));
    if (reveal.progress <= 0) {
      continue;
    }
    const applyReveal = reveal.active;
    if (applyReveal) {
      context.save();
      context.translate(0, reveal.translateY);
      context.globalAlpha *= reveal.alpha;
      context.filter = `blur(${reveal.blurPx.toFixed(2)}px)`;
    }

    children.sort((left, right) => left.x - right.x);

    const parentBottom = parent.y + (parent.r * 0.72);
    const minChildTop = Math.min(...children.map(resolveChildTop));
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
    const stroke = strong ? 'rgba(95,132,181,0.42)' : 'rgba(121,149,190,0.24)';
    const branchRadius = Math.max(0.08, Math.min(parent.r, ...children.map((child) => child.r)));
    const lineWidth = strong
      ? clamp(branchRadius * 0.09, 0.08, 1.4)
      : clamp(branchRadius * 0.07, 0.06, 1.0);

    line(context, parent.x, parentBottom, parent.x, branchY, stroke, lineWidth);

    if (children.length === 1) {
      const child = children[0];
      line(context, parent.x, branchY, child.x, branchY, stroke, lineWidth);
      line(context, child.x, branchY, child.x, resolveChildTop(child), stroke, lineWidth);
      if (applyReveal) {
        context.restore();
      }
      continue;
    }

    const minX = children[0].x;
    const maxX = children[children.length - 1].x;
    line(context, minX, branchY, maxX, branchY, stroke, lineWidth);

    for (const child of children) {
      line(context, child.x, branchY, child.x, resolveChildTop(child), stroke, lineWidth);
    }
    if (applyReveal) {
      context.restore();
    }
  }
}

function drawNode(node) {
  const localDepth = safeNumber(node.localDepth, safeNumber(node.node?.depth, 0));
  const reveal = resolveStartupRevealForDepth(localDepth);
  if (reveal.progress <= 0) {
    return;
  }
  const applyReveal = reveal.active;
  if (applyReveal) {
    context.save();
    context.translate(0, reveal.translateY);
    context.globalAlpha *= reveal.alpha;
    context.filter = `blur(${reveal.blurPx.toFixed(2)}px)`;
  }

  try {
  const isSelected = node.id === state.selectedId;
  const isFocusPathNode = Boolean(node.isFocusPathNode);
  const hasAncestorRing = isFocusPathNode && !isSelected;
  const selectionEmphasis = clamp(resolveSelectionEmphasis(node.id), 0, SELECTION_MAX_EMPHASIS);
  const activeRingStrength = clamp(selectionEmphasis, 0, 1);
  const activeRingPulse = Math.max(0, selectionEmphasis - 1);
  const hasActiveRing = activeRingStrength > 0.001;
  const activeRingAlpha = (0.34 + (activeRingStrength * 0.64)).toFixed(3);

  let hueSeed = 0;
  const id = safeText(node.id);
  for (let index = 0; index < id.length; index += 1) {
    hueSeed = (hueSeed * 31 + id.charCodeAt(index)) % 360;
  }
  const hue = (hueSeed + 205) % 360;

  if (node.lodTier === 'dot') {
    const r = Math.max(node.r, 0.3);
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

      const dotGradient = context.createRadialGradient(
        node.x - (innerR * 0.24),
        node.y - (innerR * 0.3),
        Math.max(1, innerR * 0.12),
        node.x,
        node.y,
        Math.max(1, innerR),
      );
      const dotBoost = hasActiveRing ? Math.round(3 + (activeRingStrength * 4)) : 0;
      dotGradient.addColorStop(0, `hsla(${hue}, 62%, ${66 + dotBoost}%, 0.96)`);
      dotGradient.addColorStop(1, `hsla(${(hue + 16) % 360}, 56%, ${48 + dotBoost}%, 0.96)`);

      context.beginPath();
      context.arc(node.x, node.y, innerR, 0, Math.PI * 2);
      context.fillStyle = dotGradient;
      context.fill();
      return;
    }

    context.beginPath();
    context.arc(node.x, node.y, r, 0, Math.PI * 2);
    context.fillStyle = `hsla(${hue}, 30%, 70%, 0.9)`;
    context.fill();
    return;
  }

  const ringWidth = clamp(node.r * 0.2, 2.4, 7.2);
  const pulseScale = 1 + (activeRingPulse * 0.06);
  const outerR = node.r * pulseScale;
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

  const emphasisBoost = hasActiveRing ? Math.round(3 + (activeRingStrength * 4)) : 0;
  const gradient = context.createRadialGradient(
    node.x - (innerR * 0.26),
    node.y - (innerR * 0.34),
    Math.max(1, innerR * 0.12),
    node.x,
    node.y,
    Math.max(1, innerR),
  );
  gradient.addColorStop(0, `hsla(${hue}, 68%, ${71 + emphasisBoost}%, 0.98)`);
  gradient.addColorStop(1, `hsla(${(hue + 16) % 360}, 63%, ${51 + emphasisBoost}%, 0.98)`);

  context.beginPath();
  context.arc(node.x, node.y, innerR, 0, Math.PI * 2);
  context.fillStyle = gradient;
  context.fill();
  context.lineWidth = (hasActiveRing || hasAncestorRing) ? 1.25 : 1;
  context.strokeStyle = hasActiveRing
    ? `rgba(255,255,255,${(0.28 + (activeRingStrength * 0.52)).toFixed(3)})`
    : (hasAncestorRing ? 'rgba(178,191,210,0.72)' : 'rgba(232,244,255,0.5)');
  context.stroke();

  const hideDeepLevelLabel = (
    localDepth >= 4
    && node.r < 16
    && !isSelected
  );
  if (hideDeepLevelLabel || node.r < 9) {
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

  const frame = state.adapter.computeFrame({
    ...getUniverseOptions(),
    query: state.query,
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
  });
  state.frameResult = frame;
  state.viewport = viewport;
  const projectedNodes = Array.isArray(frame.projectedNodes) ? frame.projectedNodes : [];

  context.save();
  context.beginPath();
  context.rect(layout.workspace.x, layout.workspace.y, layout.workspace.width, layout.workspace.height);
  context.clip();

  drawConnectors(projectedNodes);
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

  context.restore();
}

function renderFrame() {
  const width = state.renderSize.width;
  const height = state.renderSize.height;

  state.layout = resolveLayout(width, height);
  state.buttons = [];

  context.clearRect(0, 0, width, height);
  drawBackground(width, height);
  drawWorkspaceBackdrop(state.layout.workspace);
  drawTreeViewport(state.layout);
  drawSideNav(state.layout);
  drawBottomToolBar(state.layout);
}
function setCameraTarget(nextView, animated = true) {
  const targetView = {
    x: safeNumber(nextView?.x, state.camera.view.x),
    y: safeNumber(nextView?.y, state.camera.view.y),
    scale: clamp(safeNumber(nextView?.scale, state.camera.view.scale), MIN_SCALE, MAX_SCALE),
  };
  if (!animated) {
    state.camera.target = null;
    state.camera.view = targetView;
    return;
  }
  state.camera.target = targetView;
}

function animateCamera(deltaSeconds) {
  const target = state.camera.target;
  if (!target) {
    return;
  }
  const damping = 1 - Math.exp(-CAMERA_DAMPING * deltaSeconds);
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

function fitCameraToFilteredNodes(animated = true) {
  const viewport = state.viewport || state.layout?.viewport;
  if (!viewport) {
    return false;
  }
  const bounds = state.adapter.resolveWorldBounds({
    ...getUniverseOptions(),
    query: state.query,
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
  state.camera.view.scale = rawScale;
  state.camera.view.x = pointX - viewport.centerX - (worldX * projectionScale);
  state.camera.view.y = pointY - viewport.baseY - (worldY * projectionScale);
}

function triggerAction(action) {
  const safeAction = safeText(action);
  if (!safeAction || safeAction === 'noop') {
    return;
  }

  if (safeAction === 'brand-menu:toggle') {
    state.ui.sideNavBrandMenuOpen = !state.ui.sideNavBrandMenuOpen;
    return;
  }
  if (safeAction.startsWith('brand-menu:page:')) {
    const targetPage = safeAction.slice('brand-menu:page:'.length);
    state.ui.sideNavBrandMenuOpen = false;
    if (targetPage === 'dashboard') {
      setCameraTarget(computeHomeView(), true);
    }
    return;
  }
  if (safeAction === 'brand-menu:action:logout') {
    state.ui.sideNavBrandMenuOpen = false;
    return;
  }
  if (safeAction === 'camera:home') {
    setCameraTarget(computeHomeView(), true);
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
    enterNodeUniverse(state.selectedId, true);
    return;
  }
  if (safeAction === 'universe:back') {
    exitNodeUniverse(true);
    return;
  }
  if (safeAction === 'toggle:connectors') {
    state.showConnectors = !state.showConnectors;
    return;
  }
  if (safeAction === 'toggle:side-nav') {
    state.ui.sideNavOpen = !state.ui.sideNavOpen;
    if (!state.ui.sideNavOpen) {
      state.ui.sideNavBrandMenuOpen = false;
    }
    return;
  }
  if (safeAction === 'dock:placeholder') {
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
      state.query = '';
    } else if (mode === 'deep') {
      state.query = 'deep';
    } else if (mode === 'high') {
      state.query = 'leader';
    } else {
      state.query = mode;
    }
    fitCameraToFilteredNodes(true);
  }
}

function updateHoverState(pointX, pointY) {
  const button = buttonUnderPointer(pointX, pointY);
  state.hoveredButtonId = button?.id || '';
}

function onPointerDown(event) {
  state.pointer.x = event.clientX;
  state.pointer.y = event.clientY;

  updateHoverState(event.clientX, event.clientY);
  const brandMenuOpen = Boolean(state.ui.sideNavBrandMenuOpen);
  const button = buttonUnderPointer(event.clientX, event.clientY);
  if (button) {
    const isBrandButton = (
      button.id === SIDE_NAV_BRAND_TOGGLE_BUTTON_ID
      || button.id.startsWith(SIDE_NAV_BRAND_ITEM_BUTTON_PREFIX)
    );
    if (brandMenuOpen && !isBrandButton) {
      state.ui.sideNavBrandMenuOpen = false;
    }
    triggerAction(button.action);
    return;
  }

  if (brandMenuOpen) {
    state.ui.sideNavBrandMenuOpen = false;
    if (pointInsideActiveSideNav(event.clientX, event.clientY)) {
      return;
    }
  }

  if (!pointInsideRect(event.clientX, event.clientY, state.layout?.workspace)) {
    return;
  }
  if (pointInsideActiveSideNav(event.clientX, event.clientY)) {
    return;
  }

  const hitNode = findProjectedNodeAt(event.clientX, event.clientY);
  if (hitNode) {
    setSelectedNode(hitNode.id, { animate: true, toggleIfSame: true });
    return;
  }

  state.drag.active = true;
  state.drag.pointerId = event.pointerId;
  state.drag.lastX = event.clientX;
  state.drag.lastY = event.clientY;
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
  canvas.classList.remove('dragging');
}

function onPointerUp(event) {
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
  stopDragging(null);
}

function onWheel(event) {
  const layout = state.layout;
  if (!layout || !pointInsideRect(event.clientX, event.clientY, layout.workspace)) {
    return;
  }
  if (pointInsideActiveSideNav(event.clientX, event.clientY)) {
    return;
  }
  event.preventDefault();
  const zoomMultiplier = Math.exp(-event.deltaY * 0.0016);
  const nextScale = state.camera.view.scale * zoomMultiplier;
  applyZoomAtPoint(event.clientX, event.clientY, nextScale);
}

function onKeyDown(event) {
  const key = safeText(event.key).toLowerCase();
  const panStep = 34;

  if (key === 'escape' && state.ui.sideNavBrandMenuOpen) {
    state.ui.sideNavBrandMenuOpen = false;
    event.preventDefault();
    return;
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
    setCameraTarget(computeHomeView(), true);
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
    enterNodeUniverse(state.selectedId, true);
    event.preventDefault();
    return;
  }
  if (key === 'b') {
    exitNodeUniverse(true);
    event.preventDefault();
    return;
  }
  if (key === 'c') {
    state.showConnectors = !state.showConnectors;
    event.preventDefault();
  }
}

function bindEvents() {
  window.addEventListener('resize', updateCanvasSize);
  window.addEventListener('keydown', onKeyDown, { passive: false });
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

  const deltaSeconds = Math.max(0.0001, Math.min(0.08, (timestamp - lastTimestamp) / 1000));
  lastTimestamp = timestamp;

  animateCamera(deltaSeconds);
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
  if (loadingScreenElement instanceof HTMLElement) {
    loadingScreenElement.style.display = 'flex';
    loadingScreenElement.classList.remove('is-leaving');
  }

  const hasSession = await bootstrapSession();
  if (!hasSession) {
    return;
  }

  state.engineMode = await detectBinaryTreeNextEngineMode();

  state.nodes = buildMockNodes();
  state.adapter.setNodes(state.nodes);
  state.universe.rootId = 'root';
  state.universe.depthCap = UNIVERSE_DEPTH_CAP;
  state.universe.cameraByRoot = Object.create(null);
  state.universe.history = [];
  refreshUniverseBreadcrumb('root');

  setSelectedNode('root', { animate: false });
  updateCanvasSize();
  state.layout = resolveLayout(state.renderSize.width, state.renderSize.height);
  state.viewport = state.layout.viewport;
  bindEvents();

  setCameraTarget(computeHomeView(), false);
  rememberUniverseCamera('root');

  state.timeMs = performance.now();
  renderFrame();
  await completeLoadingScreen();
  state.intro.startedAtMs = performance.now();
  lastTimestamp = state.intro.startedAtMs;
  window.requestAnimationFrame(tickFrame);
}

bootstrap().catch((error) => {
  hideLoadingScreenImmediately();
  showBootError(error instanceof Error ? error.message : String(error));
});




