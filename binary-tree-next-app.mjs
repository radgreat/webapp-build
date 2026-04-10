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

const canvas = document.getElementById('figma-tree-canvas');
const bootErrorElement = document.getElementById('boot-error');

if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error('Missing #figma-tree-canvas');
}

const context = canvas.getContext('2d', { alpha: false });
if (!context) {
  throw new Error('Unable to initialize 2D canvas context.');
}

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
  renderSize: {
    width: 1,
    height: 1,
    dpr: 1,
  },
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function safeText(value) {
  return String(value || '').trim();
}

function safeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
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
  state.selectedId = targetNodeId;

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
  state.selectedId = safeText(targetSnapshot?.selectedId || safeTargetRootId);

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
  state.selectedId = safeText(previousPov?.selectedId || parentRootId);

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

  context.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function resolveLayout(width, height) {
  const edgePad = 12;
  const leftWidth = clamp(Math.round(width * 0.19), 228, 302);
  const rightWidth = clamp(Math.round(width * 0.19), 248, 314);
  const centerGap = 12;

  const workspaceX = edgePad + leftWidth + centerGap;
  const workspaceY = edgePad;
  const workspaceWidth = Math.max(
    360,
    width - (edgePad * 2) - leftWidth - rightWidth - (centerGap * 2),
  );
  const workspaceHeight = Math.max(280, height - (edgePad * 2));

  const leftPanel = {
    x: edgePad,
    y: edgePad,
    width: leftWidth,
    height: height - (edgePad * 2),
  };
  const rightPanel = {
    x: width - edgePad - rightWidth,
    y: edgePad,
    width: rightWidth,
    height: height - (edgePad * 2),
  };
  const workspace = {
    x: workspaceX,
    y: workspaceY,
    width: workspaceWidth,
    height: workspaceHeight,
  };
  const topBar = {
    width: clamp(Math.round(workspaceWidth * 0.66), 420, 720),
    height: 44,
  };
  topBar.x = workspace.x + Math.round((workspace.width - topBar.width) / 2);
  topBar.y = workspace.y + 18;

  const bottomBar = {
    width: clamp(Math.round(workspaceWidth * 0.3), 260, 360),
    height: 40,
  };
  bottomBar.x = workspace.x + Math.round((workspace.width - bottomBar.width) / 2);
  bottomBar.y = workspace.y + workspace.height - bottomBar.height - 16;

  const viewport = {
    x: workspace.x + 8,
    y: workspace.y + 8,
    width: workspace.width - 16,
    height: workspace.height - 16,
    centerX: workspace.x + (workspace.width / 2),
    baseY: workspace.y + 88,
  };

  return {
    leftPanel,
    rightPanel,
    workspace,
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
  const gradient = context.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#1f2024');
  gradient.addColorStop(0.55, '#1b1c20');
  gradient.addColorStop(1, '#17181b');
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
}

function drawWorkspaceBackdrop(workspace) {
  fillRoundedRect(context, workspace.x, workspace.y, workspace.width, workspace.height, 12, '#1c1d22');
  strokeRoundedRect(context, workspace.x + 0.5, workspace.y + 0.5, workspace.width - 1, workspace.height - 1, 12, 'rgba(255,255,255,0.06)');

  context.save();
  roundedRectPath(context, workspace.x, workspace.y, workspace.width, workspace.height, 12);
  context.clip();

  const innerGradient = context.createRadialGradient(
    workspace.x + workspace.width * 0.52,
    workspace.y + workspace.height * 0.42,
    20,
    workspace.x + workspace.width * 0.52,
    workspace.y + workspace.height * 0.42,
    Math.max(workspace.width, workspace.height) * 0.65,
  );
  innerGradient.addColorStop(0, 'rgba(43, 47, 57, 0.25)');
  innerGradient.addColorStop(1, 'rgba(20, 21, 24, 0.1)');
  context.fillStyle = innerGradient;
  context.fillRect(workspace.x, workspace.y, workspace.width, workspace.height);

  const gridStep = 32;
  context.strokeStyle = 'rgba(210,216,232,0.05)';
  context.lineWidth = 1;
  for (let x = workspace.x + (state.camera.view.x % gridStep); x <= workspace.x + workspace.width; x += gridStep) {
    line(context, x, workspace.y, x, workspace.y + workspace.height, 'rgba(210,216,232,0.03)');
  }
  for (let y = workspace.y + (state.camera.view.y % gridStep); y <= workspace.y + workspace.height; y += gridStep) {
    line(context, workspace.x, y, workspace.x + workspace.width, y, 'rgba(210,216,232,0.03)');
  }

  context.restore();
}
function drawPanelChrome(panel, tone = 'left') {
  const baseColor = tone === 'left' ? '#25262b' : '#26272c';
  fillRoundedRect(context, panel.x, panel.y, panel.width, panel.height, 10, baseColor);
  strokeRoundedRect(context, panel.x + 0.5, panel.y + 0.5, panel.width - 1, panel.height - 1, 10, 'rgba(255,255,255,0.07)');
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
  let fill = '#2f3138';
  let stroke = 'rgba(255,255,255,0.08)';
  let textColor = '#d2d7e4';

  if (active) {
    fill = '#1f5fce';
    stroke = 'rgba(132, 182, 255, 0.86)';
    textColor = '#f7fbff';
  } else if (hovered) {
    fill = '#3a3d46';
    stroke = 'rgba(255,255,255,0.22)';
  }

  fillRoundedRect(context, x, y, width, height, 6, fill);
  strokeRoundedRect(context, x + 0.5, y + 0.5, width - 1, height - 1, 6, stroke);
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
        color: '#8f9ab1',
        align: 'right',
      });
      break;
    }

    const fill = active ? '#1f5fce' : '#2f3138';
    const stroke = active ? 'rgba(132, 182, 255, 0.86)' : 'rgba(255,255,255,0.12)';
    const textColor = active ? '#f7fbff' : '#d2d7e4';
    fillRoundedRect(context, cursorX, startY, crumbWidth, height, 6, fill);
    strokeRoundedRect(context, cursorX + 0.5, startY + 0.5, crumbWidth - 1, height - 1, 6, stroke);
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
        color: '#8f9ab1',
        align: 'center',
      });
      cursorX += 14;
    }
  }
}

function drawLeftPanel(layout) {
  const panel = layout.leftPanel;
  drawPanelChrome(panel, 'left');

  drawText('Untitled', panel.x + 16, panel.y + 22, {
    size: 13,
    weight: 600,
    color: '#eff3ff',
  });
  drawText('Tree Project', panel.x + 16, panel.y + 40, {
    size: 11,
    weight: 500,
    color: '#9ea8bd',
  });

  drawSmallButton({
    id: 'query-all',
    x: panel.x + 14,
    y: panel.y + 58,
    width: 58,
    height: 24,
    label: 'All',
    action: 'query:all',
    active: state.query === '',
  });
  drawSmallButton({
    id: 'query-deep',
    x: panel.x + 78,
    y: panel.y + 58,
    width: 62,
    height: 24,
    label: 'Deep',
    action: 'query:deep',
    active: state.query === 'deep',
  });
  drawSmallButton({
    id: 'query-load',
    x: panel.x + 146,
    y: panel.y + 58,
    width: 78,
    height: 24,
    label: 'High Vol',
    action: 'query:high',
    active: state.query === 'high',
  });

  drawText('Local Depth Filter', panel.x + 16, panel.y + 106, {
    size: 11,
    weight: 600,
    color: '#aeb7cb',
  });

  const depthButtons = ['all', '0', '1', '2', '3', '4', '5', '8', '12', '16', '20'];
  const depthButtonWidth = 40;
  const depthButtonHeight = 22;
  let depthRow = 0;
  let depthColumn = 0;
  for (const depthLabel of depthButtons) {
    const buttonX = panel.x + 14 + (depthColumn * (depthButtonWidth + 6));
    const buttonY = panel.y + 118 + (depthRow * (depthButtonHeight + 6));
    drawSmallButton({
      id: `depth-${depthLabel}`,
      x: buttonX,
      y: buttonY,
      width: depthButtonWidth,
      height: depthButtonHeight,
      label: depthLabel.toUpperCase(),
      action: `depth:${depthLabel}`,
      active: state.depthFilter === depthLabel,
    });
    depthColumn += 1;
    if (depthColumn >= 5) {
      depthColumn = 0;
      depthRow += 1;
    }
  }

  const panelInfoY = panel.y + 230;
  drawText('Source', panel.x + 16, panelInfoY, {
    size: 10,
    weight: 600,
    color: '#8f99ae',
  });
  drawText(state.source === 'admin' ? 'ADMIN SESSION' : 'MEMBER SESSION', panel.x + 16, panelInfoY + 18, {
    size: 12,
    weight: 600,
    color: '#d7deef',
  });

  const identity = safeText(state.session?.name || state.session?.username || 'Unknown User');
  drawText(truncateText(identity, 24), panel.x + 16, panelInfoY + 40, {
    size: 11,
    weight: 500,
    color: '#9ba5bb',
  });

  drawText('Semantic Zoom', panel.x + 16, panel.y + panel.height - 88, {
    size: 11,
    weight: 600,
    color: '#b9c2d6',
  });
  drawText('Zoom in for full node details.', panel.x + 16, panel.y + panel.height - 68, {
    size: 10,
    weight: 500,
    color: '#8f9bb2',
  });
  drawText('Zoom out to cull tiny nodes.', panel.x + 16, panel.y + panel.height - 52, {
    size: 10,
    weight: 500,
    color: '#8f9bb2',
  });
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
  fillRoundedRect(context, panel.x + 12, panel.y + 40, panel.width - 24, 222, 8, '#202127');
  strokeRoundedRect(context, panel.x + 12.5, panel.y + 40.5, panel.width - 25, 221, 8, 'rgba(255,255,255,0.07)');

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
  fillRoundedRect(context, panel.x + 12, panel.y + 264, panel.width - 24, 182, 8, '#202127');
  strokeRoundedRect(context, panel.x + 12.5, panel.y + 264.5, panel.width - 25, 181, 8, 'rgba(255,255,255,0.07)');

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

  fillRoundedRect(context, panel.x + 12, panel.y + panel.height - 126, panel.width - 24, 114, 8, '#202127');
  strokeRoundedRect(context, panel.x + 12.5, panel.y + panel.height - 125.5, panel.width - 25, 113, 8, 'rgba(255,255,255,0.07)');
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
  const bar = layout.topBar;
  fillRoundedRect(context, bar.x, bar.y, bar.width, bar.height, 9, '#2a2b31');
  strokeRoundedRect(context, bar.x + 0.5, bar.y + 0.5, bar.width - 1, bar.height - 1, 9, 'rgba(255,255,255,0.1)');

  const controls = [
    { id: 'cam-home', label: 'Home', action: 'camera:home' },
    { id: 'cam-fit', label: 'Fit', action: 'camera:fit' },
    { id: 'cam-deep', label: 'Deep', action: 'camera:deep' },
    { id: 'cam-root', label: 'U Root', action: 'camera:root' },
    { id: 'universe-enter', label: 'Enter', action: 'universe:enter' },
    { id: 'universe-back', label: 'Back', action: 'universe:back' },
    { id: 'toggle-links', label: state.showConnectors ? 'Links On' : 'Links Off', action: 'toggle:connectors' },
  ];

  const buttonHeight = 28;
  const buttonY = bar.y + 8;
  let cursorX = bar.x + 10;
  for (const control of controls) {
    const width = clamp(40 + (control.label.length * 5), 56, 88);
    drawSmallButton({
      id: control.id,
      x: cursorX,
      y: buttonY,
      width,
      height: buttonHeight,
      label: control.label,
      action: control.action,
      active: control.action === 'toggle:connectors' ? state.showConnectors : false,
    });
    cursorX += width + 8;
  }
}

function drawBottomToolBar(layout) {
  const bar = layout.bottomBar;
  fillRoundedRect(context, bar.x, bar.y, bar.width, bar.height, 10, '#2a2b31');
  strokeRoundedRect(context, bar.x + 0.5, bar.y + 0.5, bar.width - 1, bar.height - 1, 10, 'rgba(255,255,255,0.09)');

  const tools = [
    { id: 'tool-select', label: 'Select' },
    { id: 'tool-pan', label: 'Pan' },
    { id: 'tool-zoom', label: 'Zoom' },
    { id: 'tool-focus', label: 'Focus' },
  ];

  const segmentWidth = Math.floor((bar.width - 18) / tools.length);
  let x = bar.x + 9;
  for (const tool of tools) {
    const hovered = state.hoveredButtonId === tool.id;
    const active = tool.id === 'tool-select';
    const fill = active ? '#2163d5' : (hovered ? '#393c46' : '#31343d');
    fillRoundedRect(context, x, bar.y + 6, segmentWidth - 6, 28, 7, fill);
    drawText(tool.label, x + ((segmentWidth - 6) / 2), bar.y + 20, {
      size: 11,
      weight: active ? 600 : 500,
      color: '#eff3ff',
      align: 'center',
    });
    registerButton({
      id: tool.id,
      x,
      y: bar.y + 6,
      width: segmentWidth - 6,
      height: 28,
      action: 'noop',
    });
    x += segmentWidth;
  }
}

function drawConnectors(projectedNodes) {
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
    const stroke = strong ? 'rgba(214,221,236,0.62)' : 'rgba(179,187,204,0.34)';
    const branchRadius = Math.max(0.08, Math.min(parent.r, ...children.map((child) => child.r)));
    const lineWidth = strong
      ? clamp(branchRadius * 0.09, 0.08, 1.4)
      : clamp(branchRadius * 0.07, 0.06, 1.0);

    line(context, parent.x, parentBottom, parent.x, branchY, stroke, lineWidth);

    if (children.length === 1) {
      const child = children[0];
      line(context, parent.x, branchY, child.x, branchY, stroke, lineWidth);
      line(context, child.x, branchY, child.x, resolveChildTop(child), stroke, lineWidth);
      continue;
    }

    const minX = children[0].x;
    const maxX = children[children.length - 1].x;
    line(context, minX, branchY, maxX, branchY, stroke, lineWidth);

    for (const child of children) {
      line(context, child.x, branchY, child.x, resolveChildTop(child), stroke, lineWidth);
    }
  }
}

function drawNode(node) {
  const isSelected = node.id === state.selectedId;
  const isFocusPathNode = Boolean(node.isFocusPathNode);

  if (node.lodTier === 'dot') {
    const r = Math.max(node.r, 0.3);
    context.beginPath();
    context.arc(node.x, node.y, r, 0, Math.PI * 2);
    context.fillStyle = isSelected ? '#7fb4ff' : '#d2d8e4';
    context.fill();
    return;
  }

  if (isFocusPathNode && !isSelected) {
    context.beginPath();
    context.arc(node.x, node.y, node.r + 3.5, 0, Math.PI * 2);
    context.strokeStyle = 'rgba(94, 157, 255, 0.75)';
    context.lineWidth = 1.5;
    context.stroke();
  }

  const gradient = context.createRadialGradient(
    node.x - (node.r * 0.36),
    node.y - (node.r * 0.4),
    Math.max(1, node.r * 0.15),
    node.x,
    node.y,
    Math.max(1, node.r),
  );
  gradient.addColorStop(0, isSelected ? '#f6f8ff' : '#eceef5');
  gradient.addColorStop(1, isSelected ? '#9bbfff' : '#c7ccd6');

  context.beginPath();
  context.arc(node.x, node.y, node.r, 0, Math.PI * 2);
  context.fillStyle = gradient;
  context.fill();
  context.lineWidth = isSelected ? 2.2 : 1.2;
  context.strokeStyle = isSelected ? '#2f74ea' : 'rgba(255,255,255,0.22)';
  context.stroke();

  if (isSelected) {
    context.beginPath();
    context.arc(node.x, node.y, node.r + 5.2, 0, Math.PI * 2);
    context.strokeStyle = 'rgba(103, 164, 255, 0.66)';
    context.lineWidth = 2;
    context.stroke();
  }

  if (node.lodTier === 'medium') {
    drawText(resolveInitials(node.node.name), node.x, node.y + 0.5, {
      size: Math.max(9, Math.floor(node.r * 0.72)),
      weight: 700,
      color: '#20242f',
      align: 'center',
    });
    return;
  }

  const nameFontSize = clamp(Math.floor(node.r * 0.54), 10, 14);
  const subFontSize = clamp(Math.floor(node.r * 0.35), 8, 11);
  drawText(truncateText(node.node.name, 18), node.x, node.y - (node.r * 0.14), {
    size: nameFontSize,
    weight: 700,
    color: '#1f2430',
    align: 'center',
  });

  const localDepth = safeNumber(node.localDepth, safeNumber(node.node.depth, 0));
  const globalDepth = safeNumber(node.globalDepth, safeNumber(node.node.depth, 0));
  const depthLabel = localDepth === globalDepth
    ? `d${globalDepth}`
    : `u${localDepth} g${globalDepth}`;
  const detail = `${depthLabel}  v${safeNumber(node.node.volume, 0)}`;
  drawText(detail, node.x, node.y + (node.r * 0.34), {
    size: subFontSize,
    weight: 600,
    color: 'rgba(35,42,52,0.84)',
    align: 'center',
  });
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
    devicePixelRatio: 1,
  });
  state.frameResult = frame;
  state.viewport = viewport;
  const projectedNodes = Array.isArray(frame.projectedNodes) ? frame.projectedNodes : [];

  context.save();
  roundedRectPath(context, layout.workspace.x + 1, layout.workspace.y + 1, layout.workspace.width - 2, layout.workspace.height - 2, 12);
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
  drawLeftPanel(state.layout);
  drawRightPanel(state.layout);
  drawTopCenterBar(state.layout);
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
  if (!viewport) {
    return {
      x: 0,
      y: 0,
      scale: DEFAULT_HOME_SCALE,
    };
  }
  return {
    x: 0,
    y: 0,
    scale: DEFAULT_HOME_SCALE,
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

  state.selectedId = targetNodeId;
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
  const button = buttonUnderPointer(event.clientX, event.clientY);
  if (button) {
    triggerAction(button.action);
    return;
  }

  if (!pointInsideRect(event.clientX, event.clientY, state.layout?.workspace)) {
    return;
  }

  const hitNode = findProjectedNodeAt(event.clientX, event.clientY);
  if (hitNode) {
    state.selectedId = hitNode.id;
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
  event.preventDefault();
  const zoomMultiplier = Math.exp(-event.deltaY * 0.0016);
  const nextScale = state.camera.view.scale * zoomMultiplier;
  applyZoomAtPoint(event.clientX, event.clientY, nextScale);
}

function onKeyDown(event) {
  const key = safeText(event.key).toLowerCase();
  const panStep = 34;

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

  state.selectedId = 'root';
  updateCanvasSize();
  bindEvents();

  setCameraTarget(computeHomeView(), false);
  rememberUniverseCamera('root');

  window.requestAnimationFrame(tickFrame);
}

bootstrap().catch((error) => {
  showBootError(error instanceof Error ? error.message : String(error));
});
