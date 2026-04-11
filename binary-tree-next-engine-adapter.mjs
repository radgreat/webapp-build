const ROOT_WORLD_Y = 0;
const ROW_WORLD_Y_BASE_STEP = 124;
const ROW_WORLD_Y_DECAY = 0.6;
const ROW_WORLD_Y_MIN_STEP = 0.0004;
const HORIZONTAL_STEP_BASE = 420;
const HORIZONTAL_STEP_DIVISOR = 2.08;
const HORIZONTAL_STEP_MIN = 0.0001;
const NODE_WORLD_RADIUS_BASE = 34;
const NODE_RADIUS_DEPTH_DECAY = 0.56;
const NODE_WORLD_RADIUS_MIN = 0.0002;
const VIEWPORT_MARGIN = 220;

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeDepthFilter(value) {
  const raw = normalizeText(value).toLowerCase();
  if (!raw || raw === 'all') {
    return 'all';
  }
  const parsedDepth = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsedDepth) || parsedDepth < 0) {
    return 'all';
  }
  return String(parsedDepth);
}

function toSearchableValue(node) {
  const badges = Array.isArray(node?.badges) ? node.badges.join(' ') : '';
  return [
    normalizeText(node?.name),
    normalizeText(node?.username),
    normalizeText(node?.role),
    normalizeText(node?.rank),
    normalizeText(node?.title),
    normalizeText(node?.accountStatus),
    normalizeText(node?.id),
    normalizeText(badges),
  ].join(' ').toLowerCase();
}

function buildPathFromParent(parentPath, side) {
  const safeParentPath = normalizeText(parentPath);
  const safeSide = normalizeText(side).toLowerCase();
  if (safeSide === 'left') {
    return `${safeParentPath}L`;
  }
  if (safeSide === 'right') {
    return `${safeParentPath}R`;
  }
  return safeParentPath;
}

function resolveWorldYFromDepth(depth) {
  const safeDepth = Number.isFinite(depth) ? Math.max(0, Math.floor(depth)) : 0;
  if (safeDepth <= 0) {
    return ROOT_WORLD_Y;
  }
  let worldY = ROOT_WORLD_Y;
  for (let level = 1; level <= safeDepth; level += 1) {
    const levelStep = Math.max(
      ROW_WORLD_Y_MIN_STEP,
      ROW_WORLD_Y_BASE_STEP * Math.pow(ROW_WORLD_Y_DECAY, level - 1),
    );
    worldY += levelStep;
  }
  return worldY;
}

function resolveWorldPositionFromPath(path) {
  const safePath = normalizeText(path).toUpperCase();
  let worldX = 0;
  let step = HORIZONTAL_STEP_BASE;
  for (const direction of safePath) {
    if (direction === 'L') {
      worldX -= step;
    } else if (direction === 'R') {
      worldX += step;
    }
    step = Math.max(HORIZONTAL_STEP_MIN, step / HORIZONTAL_STEP_DIVISOR);
  }
  return {
    worldX,
    worldY: resolveWorldYFromDepth(safePath.length),
  };
}

function resolveWorldRadius(depth) {
  const safeDepth = Number.isFinite(depth) ? Math.max(0, depth) : 0;
  return Math.max(
    NODE_WORLD_RADIUS_MIN,
    NODE_WORLD_RADIUS_BASE * Math.pow(NODE_RADIUS_DEPTH_DECAY, safeDepth),
  );
}

export async function detectBinaryTreeNextEngineMode() {
  if (typeof WebAssembly !== 'object') {
    return {
      mode: 'mock-js',
      reason: 'WebAssembly unavailable in this browser runtime.',
      wasmSupported: false,
      wasmArtifactDetected: false,
    };
  }

  try {
    const response = await fetch('/binary-tree-next.wasm', {
      method: 'HEAD',
      cache: 'no-store',
    });
    if (response.ok) {
      return {
        mode: 'wasm-bridge-pending',
        reason: 'binary-tree-next.wasm artifact detected. Bridge integration still pending.',
        wasmSupported: true,
        wasmArtifactDetected: true,
      };
    }
  } catch {
    // Keep mock mode when artifact probing fails.
  }

  return {
    mode: 'mock-js',
    reason: 'No binary-tree-next.wasm artifact detected. Using mock JS adapter.',
    wasmSupported: true,
    wasmArtifactDetected: false,
  };
}

export function createBinaryTreeNextEngineAdapter() {
  let metas = [];
  let metaById = new Map();
  let childrenByParent = new Map();
  let deepestNodeId = '';

  function setNodes(nodesInput) {
    const sourceNodes = Array.isArray(nodesInput)
      ? nodesInput.filter((node) => node && typeof node === 'object')
      : [];

    metaById = new Map();
    childrenByParent = new Map();
    metas = [];
    deepestNodeId = '';

    sourceNodes.forEach((node, index) => {
      const id = normalizeText(node.id) || `node-${index}`;
      const parentId = normalizeText(node.parent);
      if (!childrenByParent.has(parentId)) {
        childrenByParent.set(parentId, []);
      }
      const childIndex = childrenByParent.get(parentId).length;
      const candidateSide = normalizeText(node.side).toLowerCase();
      const side = candidateSide === 'left' || candidateSide === 'right'
        ? candidateSide
        : (childIndex % 2 === 0 ? 'left' : 'right');
      childrenByParent.get(parentId).push(id);

      const declaredPath = normalizeText(node.path).toUpperCase();
      const declaredDepth = Number.parseInt(node.depth, 10);
      const depth = Number.isFinite(declaredDepth) && declaredDepth >= 0
        ? declaredDepth
        : (declaredPath ? declaredPath.length : 0);
      metaById.set(id, {
        id,
        index,
        parentId,
        side,
        depth,
        path: declaredPath,
        node: {
          ...node,
          id,
          parent: parentId,
          side,
          depth,
          path: declaredPath,
        },
      });
    });

    // Resolve final path/depth values in parent-before-child order.
    const pendingIds = new Set(metaById.keys());
    let safety = 0;
    while (pendingIds.size > 0 && safety < sourceNodes.length * 3 + 16) {
      safety += 1;
      let progressed = false;
      for (const id of Array.from(pendingIds)) {
        const meta = metaById.get(id);
        if (!meta) {
          pendingIds.delete(id);
          continue;
        }
        if (!meta.parentId) {
          if (!meta.path) {
            meta.path = '';
          }
          meta.depth = meta.path.length;
          progressed = true;
          pendingIds.delete(id);
          continue;
        }
        const parentMeta = metaById.get(meta.parentId);
        if (!parentMeta || pendingIds.has(parentMeta.id)) {
          continue;
        }
        if (!meta.path) {
          meta.path = buildPathFromParent(parentMeta.path, meta.side);
        }
        meta.depth = meta.path.length;
        progressed = true;
        pendingIds.delete(id);
      }
      if (!progressed) {
        break;
      }
    }

    // Fallback unresolved entries.
    for (const id of pendingIds) {
      const meta = metaById.get(id);
      if (!meta) {
        continue;
      }
      meta.path = meta.path || '';
      meta.depth = meta.path.length;
    }

    metas = Array.from(metaById.values())
      .map((meta) => {
        const { worldX, worldY } = resolveWorldPositionFromPath(meta.path);
        const worldRadius = resolveWorldRadius(meta.depth);
        const nextNode = {
          ...meta.node,
          depth: meta.depth,
          path: meta.path,
        };
        return {
          ...meta,
          node: nextNode,
          worldX,
          worldY,
          worldRadius,
        };
      })
      .sort((a, b) => a.depth - b.depth || a.index - b.index);

    metas.forEach((meta) => {
      if (!deepestNodeId || meta.depth > (metaById.get(deepestNodeId)?.depth ?? -1)) {
        deepestNodeId = meta.id;
      }
      metaById.set(meta.id, meta);
    });
  }

  function resolveUniverseRootMeta(options = {}) {
    const requestedRootId = normalizeText(options.universeRootId);
    if (requestedRootId && metaById.has(requestedRootId)) {
      return metaById.get(requestedRootId);
    }
    if (metaById.has('root')) {
      return metaById.get('root');
    }
    return metas[0] || null;
  }

  function resolveUniverseEntries(options = {}) {
    const rootMeta = resolveUniverseRootMeta(options);
    if (!rootMeta) {
      return {
        universe: {
          rootId: '',
          rootMeta: null,
          rootPath: '',
          depthCap: 0,
        },
        entries: [],
        entryById: new Map(),
      };
    }

    const rawDepthCap = Number.isFinite(options.universeDepthCap)
      ? Math.max(0, Math.floor(options.universeDepthCap))
      : Number.MAX_SAFE_INTEGER;
    const rootPath = normalizeText(rootMeta.path).toUpperCase();
    const rootPathLength = rootPath.length;

    const entries = [];
    const entryById = new Map();

    metas.forEach((meta) => {
      const path = normalizeText(meta.path).toUpperCase();
      if (rootPath && !path.startsWith(rootPath)) {
        return;
      }
      const localPath = path.slice(rootPathLength);
      const localDepth = localPath.length;
      if (localDepth > rawDepthCap) {
        return;
      }
      const localWorld = resolveWorldPositionFromPath(localPath);
      const localWorldRadius = resolveWorldRadius(localDepth);
      const entry = {
        id: meta.id,
        meta,
        localPath,
        localDepth,
        localWorldX: localWorld.worldX,
        localWorldY: localWorld.worldY,
        localWorldRadius,
      };
      entries.push(entry);
      entryById.set(meta.id, entry);
    });

    entries.sort((left, right) => left.localDepth - right.localDepth || left.meta.index - right.meta.index);
    return {
      universe: {
        rootId: rootMeta.id,
        rootMeta,
        rootPath,
        depthCap: rawDepthCap,
      },
      entries,
      entryById,
    };
  }

  function resolveFilteredUniverseEntries(options = {}) {
    const query = normalizeText(options.query).toLowerCase();
    const depthFilter = normalizeDepthFilter(options.depth);
    const universeSet = resolveUniverseEntries(options);
    const filteredEntries = universeSet.entries.filter((entry) => {
      if (depthFilter !== 'all' && String(entry.localDepth) !== depthFilter) {
        return false;
      }
      if (!query) {
        return true;
      }
      return toSearchableValue(entry.meta.node).includes(query);
    });
    return {
      ...universeSet,
      filteredEntries,
    };
  }

  function resolveVisibleNodes(options = {}) {
    const { filteredEntries } = resolveFilteredUniverseEntries(options);
    return filteredEntries.map((entry) => entry.meta.node);
  }

  function resolveWorldBounds(options = {}) {
    const { filteredEntries, universe } = resolveFilteredUniverseEntries(options);
    if (!filteredEntries.length) {
      return null;
    }
    const xs = filteredEntries.map((entry) => entry.localWorldX);
    const ys = filteredEntries.map((entry) => entry.localWorldY);
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
      width: Math.max(1, Math.max(...xs) - Math.min(...xs)),
      height: Math.max(1, Math.max(...ys) - Math.min(...ys)),
      nodeCount: filteredEntries.length,
      universeRootId: universe.rootId,
      universeDepthCap: universe.depthCap,
    };
  }

  function resolveFocusPathIds(targetNodeId, stopAtId = '') {
    const ids = new Set();
    const safeStopAtId = normalizeText(stopAtId);
    let cursor = normalizeText(targetNodeId);
    let safety = 0;
    while (cursor && safety < metas.length + 4) {
      safety += 1;
      ids.add(cursor);
      if (safeStopAtId && cursor === safeStopAtId) {
        break;
      }
      const parentId = normalizeText(metaById.get(cursor)?.parentId);
      cursor = parentId;
    }
    return ids;
  }

  function resolveAncestorChain(nodeId) {
    const targetId = normalizeText(nodeId);
    if (!targetId || !metaById.has(targetId)) {
      return [];
    }
    const chain = [];
    let cursor = targetId;
    let safety = 0;
    while (cursor && safety < metas.length + 4) {
      safety += 1;
      chain.push(cursor);
      const parentId = normalizeText(metaById.get(cursor)?.parentId);
      cursor = parentId;
    }
    return chain.reverse();
  }

  function resolveNodeMetrics(nodeId, options = {}) {
    const targetId = normalizeText(nodeId);
    if (!targetId) {
      return null;
    }
    const { universe, entryById } = resolveUniverseEntries(options);
    const entry = entryById.get(targetId);
    if (!entry) {
      return null;
    }
    const { meta } = entry;
    return {
      id: meta.id,
      depth: entry.localDepth,
      path: entry.localPath,
      localDepth: entry.localDepth,
      localPath: entry.localPath,
      globalDepth: meta.depth,
      globalPath: meta.path,
      worldX: entry.localWorldX,
      worldY: entry.localWorldY,
      worldRadius: entry.localWorldRadius,
      universeRootId: universe.rootId,
      universeDepthCap: universe.depthCap,
      node: meta.node,
    };
  }

  function resolveDeepestNodeId(options = {}) {
    const { filteredEntries } = resolveFilteredUniverseEntries(options);
    if (!filteredEntries.length) {
      return '';
    }
    const deepestEntry = filteredEntries.reduce((best, entry) => {
      if (!best) {
        return entry;
      }
      if (entry.localDepth > best.localDepth) {
        return entry;
      }
      if (entry.localDepth === best.localDepth && entry.meta.index > best.meta.index) {
        return entry;
      }
      return best;
    }, null);
    return normalizeText(deepestEntry?.id);
  }

  function computeFrame(options = {}) {
    const {
      universe,
      filteredEntries,
    } = resolveFilteredUniverseEntries(options);
    const filteredIds = new Set(filteredEntries.map((entry) => normalizeText(entry.id)));

    const view = options.view && typeof options.view === 'object'
      ? options.view
      : { x: 0, y: 0, scale: 1 };
    const viewScale = Number.isFinite(view.scale) && view.scale > 0 ? view.scale : 1;
    const viewX = Number.isFinite(view.x) ? view.x : 0;
    const viewY = Number.isFinite(view.y) ? view.y : 0;
    const dpr = Number.isFinite(options.devicePixelRatio) && options.devicePixelRatio > 0
      ? options.devicePixelRatio
      : 1;
    const viewport = options.viewport && typeof options.viewport === 'object'
      ? options.viewport
      : {};
    const viewportX = Number.isFinite(viewport.x) ? viewport.x : 0;
    const viewportY = Number.isFinite(viewport.y) ? viewport.y : 0;
    const viewportWidth = Number.isFinite(viewport.width) ? viewport.width : Number.MAX_SAFE_INTEGER;
    const viewportHeight = Number.isFinite(viewport.height) ? viewport.height : Number.MAX_SAFE_INTEGER;
    const viewportCenterX = Number.isFinite(viewport.centerX) ? viewport.centerX : (viewportX + (viewportWidth / 2));
    const baseY = Number.isFinite(viewport.baseY) ? viewport.baseY : (80 * dpr);
    const cullMargin = Number.isFinite(options.cullMargin) && options.cullMargin >= 0
      ? options.cullMargin
      : Math.max(
        VIEWPORT_MARGIN,
        Math.round(Math.min(viewportWidth, viewportHeight) * 0.34),
      );
    const nodeRadiusBase = Number.isFinite(options.nodeRadiusBase) && options.nodeRadiusBase > 0
      ? options.nodeRadiusBase
      : 20;

    const thresholds = options.lodThresholds && typeof options.lodThresholds === 'object'
      ? options.lodThresholds
      : {};
    const fullThreshold = Number.isFinite(thresholds.full) ? thresholds.full : (14 * dpr);
    const mediumThreshold = Number.isFinite(thresholds.medium) ? thresholds.medium : (8 * dpr);
    const dotThreshold = Number.isFinite(thresholds.dot) ? thresholds.dot : (3.2 * dpr);
    const minVisibleRadius = Number.isFinite(thresholds.min) ? thresholds.min : (1.2 * dpr);

    const selectedId = normalizeText(options.selectedId);
    const focusPathIds = selectedId
      ? resolveFocusPathIds(selectedId, universe.rootId)
      : new Set();
    const semanticDepth = options.semanticDepth && typeof options.semanticDepth === 'object'
      ? options.semanticDepth
      : null;
    const semanticDepthEnabled = Boolean(semanticDepth?.enabled);
    const semanticBaseScale = Number.isFinite(semanticDepth?.baseScale) && semanticDepth.baseScale > 0
      ? semanticDepth.baseScale
      : viewScale;
    const semanticBaseFullDepth = Number.isFinite(semanticDepth?.baseFullDepth)
      ? Math.max(0, semanticDepth.baseFullDepth)
      : 5;
    const semanticBaseVisibleDepth = Number.isFinite(semanticDepth?.baseVisibleDepth)
      ? Math.max(semanticBaseFullDepth, semanticDepth.baseVisibleDepth)
      : semanticBaseFullDepth;
    const semanticFullDepthPerOctave = Number.isFinite(semanticDepth?.fullDepthPerOctave)
      ? Math.max(0, semanticDepth.fullDepthPerOctave)
      : 1;
    const semanticVisibleDepthPerOctave = Number.isFinite(semanticDepth?.visibleDepthPerOctave)
      ? Math.max(semanticFullDepthPerOctave, semanticDepth.visibleDepthPerOctave)
      : semanticFullDepthPerOctave;
    const semanticScaleRatio = semanticDepthEnabled
      ? Math.max(viewScale / semanticBaseScale, 0.000001)
      : 1;
    const semanticOctaves = semanticDepthEnabled
      ? Math.max(0, Math.log2(semanticScaleRatio))
      : 0;
    const semanticFullDepthMax = semanticDepthEnabled
      ? Math.max(0, Math.floor(semanticBaseFullDepth + (semanticOctaves * semanticFullDepthPerOctave)))
      : Number.MAX_SAFE_INTEGER;
    const semanticVisibleDepthMax = semanticDepthEnabled
      ? Math.max(
        semanticFullDepthMax,
        Math.floor(semanticBaseVisibleDepth + (semanticOctaves * semanticVisibleDepthPerOctave)),
      )
      : Number.MAX_SAFE_INTEGER;

    const projectedById = new Map();
    const projectedNodes = [];
    const lodCounts = {
      full: 0,
      medium: 0,
      dot: 0,
      hidden: 0,
      culled: 0,
      total: filteredEntries.length,
    };

    filteredEntries.forEach((entry) => {
      const { meta } = entry;
      const radiusScale = entry.localWorldRadius / NODE_WORLD_RADIUS_BASE;
      const screenR = nodeRadiusBase * radiusScale * viewScale;
      const screenX = (entry.localWorldX * viewScale) + viewportCenterX + viewX;
      const screenY = (entry.localWorldY * viewScale) + baseY + viewY;
      const isSelected = normalizeText(meta.id) === selectedId;
      const isFocusPathNode = focusPathIds.has(meta.id);

      if (
        semanticDepthEnabled
        && entry.localDepth > semanticVisibleDepthMax
        && !isSelected
        && !isFocusPathNode
      ) {
        lodCounts.hidden += 1;
        return;
      }

      const outOfViewport = (
        screenX + screenR < viewportX - cullMargin
        || screenX - screenR > viewportX + viewportWidth + cullMargin
        || screenY + screenR < viewportY - cullMargin
        || screenY - screenR > viewportY + viewportHeight + cullMargin
      );
      if (outOfViewport) {
        lodCounts.culled += 1;
        return;
      }

      let lodTier = 'hidden';
      if (semanticDepthEnabled && entry.localDepth <= semanticFullDepthMax) {
        lodTier = 'full';
      } else if (screenR >= fullThreshold) {
        lodTier = 'full';
      } else if (screenR >= mediumThreshold) {
        lodTier = 'medium';
      } else if (screenR >= dotThreshold) {
        lodTier = 'dot';
      }

      if (lodTier === 'hidden' && screenR >= minVisibleRadius && (isSelected || isFocusPathNode)) {
        lodTier = isSelected ? 'medium' : 'dot';
      }

      if (lodTier === 'hidden') {
        lodCounts.hidden += 1;
        return;
      }

      lodCounts[lodTier] += 1;
      const projected = {
        id: meta.id,
        node: meta.node,
        worldX: entry.localWorldX,
        worldY: entry.localWorldY,
        worldRadius: entry.localWorldRadius,
        localDepth: entry.localDepth,
        localPath: entry.localPath,
        globalDepth: meta.depth,
        globalPath: meta.path,
        x: screenX,
        y: screenY,
        r: screenR,
        lodTier,
        isSelected,
        isFocusPathNode,
      };
      projectedById.set(meta.id, projected);
      projectedNodes.push(projected);
    });

    const showConnectors = options.showConnectors !== false;
    const connectors = showConnectors
      ? filteredEntries.reduce((accumulator, entry) => {
        const { meta } = entry;
        const nodeId = normalizeText(meta.id);
        const parentId = normalizeText(meta.parentId);
        if (!nodeId || !parentId || !filteredIds.has(parentId)) {
          return accumulator;
        }
        const childProjected = projectedById.get(nodeId);
        const parentProjected = projectedById.get(parentId);
        if (!childProjected || !parentProjected) {
          return accumulator;
        }
        if (childProjected.lodTier === 'hidden' || parentProjected.lodTier === 'hidden') {
          return accumulator;
        }
        accumulator.push({
          fromX: parentProjected.x,
          fromY: parentProjected.y + (parentProjected.r * 0.65),
          toX: childProjected.x,
          toY: childProjected.y - (childProjected.r * 0.65),
          strength: childProjected.lodTier === 'full' || parentProjected.lodTier === 'full'
            ? 'strong'
            : 'light',
        });
        return accumulator;
      }, [])
      : [];

    return {
      visibleNodes: projectedNodes.map((entry) => entry.node),
      projectedNodes,
      connectors,
      stats: {
        ...lodCounts,
        visible: projectedNodes.length,
        connectors: connectors.length,
        fullDepthMax: semanticDepthEnabled ? semanticFullDepthMax : null,
        visibleDepthMax: semanticDepthEnabled ? semanticVisibleDepthMax : null,
        universeRootId: universe.rootId,
        universeDepthCap: universe.depthCap,
      },
      selectedProjected: selectedId ? projectedById.get(selectedId) || null : null,
    };
  }

  return {
    setNodes,
    resolveVisibleNodes,
    resolveWorldBounds,
    resolveNodeMetrics,
    resolveDeepestNodeId,
    resolveAncestorChain,
    computeFrame,
  };
}
