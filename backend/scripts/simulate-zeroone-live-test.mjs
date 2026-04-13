import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

import pool from '../db/db.js';
import {
  createRegisteredMember,
} from '../services/member.service.js';
import {
  saveBinaryTreeMetrics,
  getSalesTeamCommissions,
} from '../services/metrics.service.js';
import { forceServerCutoff } from '../services/admin.service.js';
import { listProfileAchievementsForMember } from '../services/member-achievement.service.js';
import { getMemberServerCutoffMetrics } from '../services/cutoff.service.js';
import { readMockUsersStore, writeMockUsersStore } from '../stores/user.store.js';
import { readRegisteredMembersStore, writeRegisteredMembersStore } from '../stores/member.store.js';
import { summarizeBinaryTreeData } from '../../binary-tree.mjs';

dotenv.config();

const TARGET_USERNAME_DEFAULT = 'zeroone';
const TARGET_NODES_DEFAULT = 50;
const CYCLE_RULE_LOWER_BV = 500;
const CYCLE_RULE_HIGHER_BV = 1000;

const FREE_ACCOUNT_PACKAGE_KEY = 'preferred-customer-pack';
const PERSONAL_PACKAGE_KEY = 'personal-builder-pack';
const BUSINESS_PACKAGE_KEY = 'business-builder-pack';
const INFINITY_PACKAGE_KEY = 'infinity-builder-pack';
const LEGACY_PACKAGE_KEY = 'legacy-builder-pack';

const ROOT_ALIAS_ID = 'root';
const GLOBAL_ROOT_ID = '__global-root__';

const PLACEMENT_LEG_LEFT = 'left';
const PLACEMENT_LEG_RIGHT = 'right';
const PLACEMENT_LEG_SPILLOVER = 'spillover';
const PLACEMENT_OPTION_SPILLOVER_LEFT = 'spillover-left';
const PLACEMENT_OPTION_SPILLOVER_RIGHT = 'spillover-right';
const PLACEMENT_LEG_EXTREME_LEFT = 'extreme-left';
const PLACEMENT_LEG_EXTREME_RIGHT = 'extreme-right';

const ACCOUNT_PACKAGE_ORDER = [
  PERSONAL_PACKAGE_KEY,
  BUSINESS_PACKAGE_KEY,
  INFINITY_PACKAGE_KEY,
  LEGACY_PACKAGE_KEY,
];

const FAST_TRACK_PACKAGE_META = Object.freeze({
  [PERSONAL_PACKAGE_KEY]: { label: 'Personal Builder Pack', price: 192, bv: 192, rank: 'Personal' },
  [BUSINESS_PACKAGE_KEY]: { label: 'Business Builder Pack', price: 384, bv: 300, rank: 'Business' },
  [INFINITY_PACKAGE_KEY]: { label: 'Infinity Builder Pack', price: 640, bv: 500, rank: 'Infinity' },
  [LEGACY_PACKAGE_KEY]: { label: 'Legacy Builder Pack', price: 1280, bv: 1000, rank: 'Legacy' },
});

const INFINITY_BUILDER_DIRECT_SPONSORS_PER_TIER = 3;
const INFINITY_BUILDER_TOTAL_NODES_PER_TIER = 4;
const INFINITY_BUILDER_BASE_TIER_COUNT = 2;
const INFINITY_BUILDER_PREVIEW_LOCKED_TIER_COUNT = 1;
const INFINITY_BUILDER_QUALIFYING_PACKAGE_KEYS = new Set([
  INFINITY_PACKAGE_KEY,
  LEGACY_PACKAGE_KEY,
]);

const LEGACY_LEADERSHIP_TOTAL_NODES_PER_TIER = 40;
const LEGACY_LEADERSHIP_BASE_TIER_COUNT = 1;
const LEGACY_LEADERSHIP_PREVIEW_LOCKED_TIER_COUNT = 0;

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeKey(value) {
  return normalizeText(value).toLowerCase();
}

function toWholeNumber(value, fallback = 0) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return Math.max(0, Math.floor(Number(fallback) || 0));
  }
  return Math.max(0, Math.floor(numeric));
}

function parseArgs(argv = process.argv.slice(2)) {
  const parsed = {
    targetUsername: TARGET_USERNAME_DEFAULT,
    nodeCount: TARGET_NODES_DEFAULT,
    resetOnly: false,
    skipReset: false,
    directMin: 2,
    directMax: 10,
  };

  for (const rawArg of argv) {
    const arg = normalizeText(rawArg);
    if (!arg) {
      continue;
    }
    if (arg.startsWith('--target=')) {
      parsed.targetUsername = normalizeText(arg.slice('--target='.length)) || TARGET_USERNAME_DEFAULT;
      continue;
    }
    if (arg.startsWith('--nodes=')) {
      parsed.nodeCount = Math.max(1, toWholeNumber(arg.slice('--nodes='.length), TARGET_NODES_DEFAULT));
      continue;
    }
    if (arg.startsWith('--direct-min=')) {
      parsed.directMin = Math.max(1, toWholeNumber(arg.slice('--direct-min='.length), 2));
      continue;
    }
    if (arg.startsWith('--direct-max=')) {
      parsed.directMax = Math.max(1, toWholeNumber(arg.slice('--direct-max='.length), 10));
      continue;
    }
    if (arg === '--reset-only') {
      parsed.resetOnly = true;
      continue;
    }
    if (arg === '--skip-reset') {
      parsed.skipReset = true;
    }
  }

  if (parsed.directMax < parsed.directMin) {
    parsed.directMax = parsed.directMin;
  }

  return parsed;
}

function randomIntBetween(minInclusive, maxInclusive) {
  const min = Math.floor(Math.min(minInclusive, maxInclusive));
  const max = Math.floor(Math.max(minInclusive, maxInclusive));
  return min + Math.floor(Math.random() * (max - min + 1));
}

function chooseRandom(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }
  return items[randomIntBetween(0, items.length - 1)] || null;
}

function chooseWeighted(options = []) {
  const normalizedOptions = (Array.isArray(options) ? options : [])
    .map((entry) => ({
      value: entry?.value,
      weight: Math.max(0, Number(entry?.weight) || 0),
    }))
    .filter((entry) => entry.weight > 0);

  if (!normalizedOptions.length) {
    return null;
  }

  const total = normalizedOptions.reduce((sum, entry) => sum + entry.weight, 0);
  let cursor = Math.random() * total;

  for (const entry of normalizedOptions) {
    cursor -= entry.weight;
    if (cursor <= 0) {
      return entry.value;
    }
  }

  return normalizedOptions[normalizedOptions.length - 1].value;
}

function isPreferredCustomerPackage(packageKey) {
  return normalizeKey(packageKey) === FREE_ACCOUNT_PACKAGE_KEY;
}

function normalizeBusinessCenterNodeType(value) {
  return normalizeKey(value) === 'placeholder' ? 'placeholder' : 'primary';
}

function isBusinessCenterPlaceholderMember(member = {}) {
  return normalizeBusinessCenterNodeType(member?.businessCenterNodeType) === 'placeholder';
}

function getFastTrackPackageBv(packageKey) {
  return toWholeNumber(FAST_TRACK_PACKAGE_META[normalizeKey(packageKey)]?.bv, 0);
}

function resolveMemberServerCutoffBaselineVolume(member, fallbackValue = 0) {
  const baselineValue = Math.max(0, toWholeNumber(member?.serverCutoffBaselineStarterPersonalPv, fallbackValue));
  const baselineSetAtMs = Date.parse(normalizeText(member?.serverCutoffBaselineSetAt));
  const createdAtMs = Date.parse(normalizeText(member?.createdAt || member?.enrolledAt));

  if (
    baselineValue > 0
    && Number.isFinite(baselineSetAtMs)
    && Number.isFinite(createdAtMs)
    && createdAtMs > baselineSetAtMs
  ) {
    return 0;
  }

  return baselineValue;
}

function resolveMemberBinaryVolume(member) {
  if (isBusinessCenterPlaceholderMember(member)) {
    return 0;
  }

  const packageBv = toWholeNumber(member?.packageBv, getFastTrackPackageBv(member?.enrollmentPackage));
  const starterPersonalPvRaw = toWholeNumber(member?.starterPersonalPv, 0);
  const starterPersonalPv = starterPersonalPvRaw > 0 ? starterPersonalPvRaw : packageBv;
  const cutoffBaselinePv = resolveMemberServerCutoffBaselineVolume(member, 0);
  return Math.max(0, starterPersonalPv - cutoffBaselinePv);
}

function resolveMemberLifetimeBinaryVolume(member) {
  if (isBusinessCenterPlaceholderMember(member)) {
    return 0;
  }

  const packageBv = toWholeNumber(member?.packageBv, getFastTrackPackageBv(member?.enrollmentPackage));
  const starterPersonalPvRaw = toWholeNumber(member?.starterPersonalPv, 0);
  return Math.max(0, starterPersonalPvRaw > 0 ? starterPersonalPvRaw : packageBv);
}

function isBinaryTreeEligibleMember(member) {
  if (!member || typeof member !== 'object') {
    return false;
  }
  if (isBusinessCenterPlaceholderMember(member)) {
    return false;
  }
  return !isPreferredCustomerPackage(member?.enrollmentPackage);
}

function normalizePlacementLegValue(value, options = {}) {
  const allowSpillover = options.allowSpillover !== false;
  const fallback = typeof options.fallback === 'string' ? options.fallback : PLACEMENT_LEG_LEFT;
  const normalizedValue = normalizeKey(value);
  const defaultSpilloverSide = normalizeKey(options.defaultSpilloverSide) === PLACEMENT_LEG_RIGHT
    ? PLACEMENT_LEG_RIGHT
    : PLACEMENT_LEG_LEFT;

  if (normalizedValue === PLACEMENT_LEG_LEFT) {
    return PLACEMENT_LEG_LEFT;
  }
  if (normalizedValue === PLACEMENT_LEG_RIGHT) {
    return PLACEMENT_LEG_RIGHT;
  }

  if (
    allowSpillover
    && (
      normalizedValue === PLACEMENT_OPTION_SPILLOVER_LEFT
      || normalizedValue === 'spillover_left'
      || normalizedValue === 'spillover left'
    )
  ) {
    return PLACEMENT_OPTION_SPILLOVER_LEFT;
  }

  if (
    allowSpillover
    && (
      normalizedValue === PLACEMENT_OPTION_SPILLOVER_RIGHT
      || normalizedValue === 'spillover_right'
      || normalizedValue === 'spillover right'
    )
  ) {
    return PLACEMENT_OPTION_SPILLOVER_RIGHT;
  }

  if (
    normalizedValue === PLACEMENT_LEG_EXTREME_LEFT
    || normalizedValue === 'extremeleft'
    || normalizedValue === 'extreme_left'
    || normalizedValue === 'extreme left'
  ) {
    return PLACEMENT_LEG_EXTREME_LEFT;
  }

  if (
    normalizedValue === PLACEMENT_LEG_EXTREME_RIGHT
    || normalizedValue === 'extremeright'
    || normalizedValue === 'extreme_right'
    || normalizedValue === 'extreme right'
  ) {
    return PLACEMENT_LEG_EXTREME_RIGHT;
  }

  if (allowSpillover && normalizedValue === PLACEMENT_LEG_SPILLOVER) {
    return defaultSpilloverSide === PLACEMENT_LEG_RIGHT
      ? PLACEMENT_OPTION_SPILLOVER_RIGHT
      : PLACEMENT_OPTION_SPILLOVER_LEFT;
  }

  return fallback;
}

function resolvePlacementOptionFromMember(member = {}) {
  const normalizedLeg = normalizeKey(member?.placementLeg);
  if (normalizedLeg === PLACEMENT_LEG_SPILLOVER) {
    return normalizeKey(member?.spilloverPlacementSide) === PLACEMENT_LEG_RIGHT
      ? PLACEMENT_OPTION_SPILLOVER_RIGHT
      : PLACEMENT_OPTION_SPILLOVER_LEFT;
  }

  return normalizePlacementLegValue(normalizedLeg, {
    allowSpillover: true,
    fallback: PLACEMENT_LEG_LEFT,
  });
}

function createBinaryTreeMemberNodeId(member, fallbackIndex, usedNodeIds) {
  const preferredRaw = member?.memberUsername || member?.id || member?.email || `member-${fallbackIndex + 1}`;
  const normalizedBase = normalizeKey(preferredRaw).replace(/[^a-z0-9._-]/g, '-') || `member-${fallbackIndex + 1}`;
  let nextId = normalizedBase;
  let suffix = 2;

  while (usedNodeIds.has(nextId)) {
    nextId = `${normalizedBase}-${suffix}`;
    suffix += 1;
  }

  usedNodeIds.add(nextId);
  return nextId;
}

function createBinaryTreeDataForSponsor(registeredMembers, sponsorUsernameInput) {
  const now = Date.now();
  const sponsorUsername = normalizeKey(sponsorUsernameInput);
  const nodes = {};
  const usedNodeIds = new Set([GLOBAL_ROOT_ID]);
  const memberNodeIdByIndex = new Map();
  const lookupToNodeId = new Map();

  const registerLookup = (rawValue, nodeId) => {
    const key = normalizeKey(rawValue);
    if (!key || !nodeId) {
      return;
    }
    lookupToNodeId.set(key, nodeId);
  };

  const sortedMembers = (Array.isArray(registeredMembers) ? registeredMembers : [])
    .filter((member) => isBinaryTreeEligibleMember(member))
    .slice()
    .sort((left, right) => {
      const leftMs = Date.parse(normalizeText(left?.createdAt));
      const rightMs = Date.parse(normalizeText(right?.createdAt));
      const safeLeft = Number.isFinite(leftMs) ? leftMs : 0;
      const safeRight = Number.isFinite(rightMs) ? rightMs : 0;
      return safeLeft - safeRight;
    });

  nodes[GLOBAL_ROOT_ID] = {
    id: GLOBAL_ROOT_ID,
    memberCode: 'company-root',
    name: 'Company Root',
    status: 'active',
    leftPersonalPv: 0,
    rightPersonalPv: 0,
    lifetimePersonalPv: 0,
    rank: 'Legacy',
    enrollmentPackage: LEGACY_PACKAGE_KEY,
    countryFlag: 'un',
    addedAt: now,
    businessCenterNodeType: 'primary',
    isBusinessCenterPlaceholder: false,
  };

  registerLookup(GLOBAL_ROOT_ID, GLOBAL_ROOT_ID);
  registerLookup('company-root', GLOBAL_ROOT_ID);
  registerLookup('admin', GLOBAL_ROOT_ID);

  sortedMembers.forEach((member, index) => {
    const nodeId = createBinaryTreeMemberNodeId(member, index, usedNodeIds);
    memberNodeIdByIndex.set(index, nodeId);

    const memberBinaryVolume = resolveMemberBinaryVolume(member);
    const memberLifetimeBinaryVolume = resolveMemberLifetimeBinaryVolume(member);
    const createdAtMsRaw = Date.parse(normalizeText(member?.createdAt));
    const createdAtMs = Number.isFinite(createdAtMsRaw)
      ? createdAtMsRaw
      : (now - (sortedMembers.length - index) * 60000);

    const businessCenterNodeType = normalizeBusinessCenterNodeType(member?.businessCenterNodeType);
    const isBusinessCenterPlaceholder = businessCenterNodeType === 'placeholder';

    nodes[nodeId] = {
      id: nodeId,
      memberCode: normalizeText(member?.memberUsername || `member-${index + 1}`),
      name: normalizeText(member?.fullName || member?.memberUsername || member?.email || `Member ${index + 1}`),
      status: 'active',
      leftPersonalPv: memberBinaryVolume,
      rightPersonalPv: 0,
      lifetimePersonalPv: memberLifetimeBinaryVolume,
      rank: normalizeText(member?.accountRank || member?.rank || 'Legacy'),
      enrollmentPackage: normalizeKey(member?.enrollmentPackage),
      countryFlag: normalizeText(member?.countryFlag || 'un'),
      addedAt: createdAtMs,
      businessCenterNodeType,
      isBusinessCenterPlaceholder,
      businessCentersCount: toWholeNumber(member?.businessCentersCount, 0),
    };

    registerLookup(member?.id, nodeId);
    registerLookup(member?.memberUsername, nodeId);
    registerLookup(member?.email, nodeId);
  });

  const findOpenPlacement = (startingParentId, preferredSide) => {
    const normalizedPreferred = preferredSide === PLACEMENT_LEG_RIGHT ? PLACEMENT_LEG_RIGHT : PLACEMENT_LEG_LEFT;
    const primaryKey = normalizedPreferred === PLACEMENT_LEG_RIGHT ? 'rightChildId' : 'leftChildId';
    const secondaryKey = normalizedPreferred === PLACEMENT_LEG_RIGHT ? 'leftChildId' : 'rightChildId';
    const queue = [];
    const visited = new Set();
    const resolvedStartParentId = nodes[startingParentId] ? startingParentId : GLOBAL_ROOT_ID;
    const startParentNode = nodes[resolvedStartParentId];

    if (!startParentNode[primaryKey]) {
      return { parentId: resolvedStartParentId, side: normalizedPreferred };
    }

    if (startParentNode[primaryKey] && nodes[startParentNode[primaryKey]]) {
      queue.push(startParentNode[primaryKey]);
    }

    while (queue.length > 0) {
      const parentId = queue.shift();
      if (!parentId || visited.has(parentId) || !nodes[parentId]) {
        continue;
      }

      visited.add(parentId);
      const parentNode = nodes[parentId];

      if (!parentNode[primaryKey]) {
        return { parentId, side: normalizedPreferred };
      }
      if (!parentNode[secondaryKey]) {
        return {
          parentId,
          side: normalizedPreferred === PLACEMENT_LEG_RIGHT ? PLACEMENT_LEG_LEFT : PLACEMENT_LEG_RIGHT,
        };
      }

      const primaryChildId = parentNode[primaryKey];
      const secondaryChildId = parentNode[secondaryKey];
      if (primaryChildId && nodes[primaryChildId]) {
        queue.push(primaryChildId);
      }
      if (secondaryChildId && nodes[secondaryChildId]) {
        queue.push(secondaryChildId);
      }
    }

    return null;
  };

  const findExtremePlacement = (startingParentId, preferredSide) => {
    const normalizedPreferred = preferredSide === PLACEMENT_LEG_RIGHT ? PLACEMENT_LEG_RIGHT : PLACEMENT_LEG_LEFT;
    const childKey = normalizedPreferred === PLACEMENT_LEG_RIGHT ? 'rightChildId' : 'leftChildId';
    const resolvedStartParentId = nodes[startingParentId] ? startingParentId : GLOBAL_ROOT_ID;
    let currentParentId = resolvedStartParentId;
    const visited = new Set();

    while (currentParentId && nodes[currentParentId] && !visited.has(currentParentId)) {
      visited.add(currentParentId);
      const currentNode = nodes[currentParentId];
      const nextChildId = currentNode[childKey];
      if (!nextChildId || !nodes[nextChildId]) {
        return { parentId: currentParentId, side: normalizedPreferred };
      }
      currentParentId = nextChildId;
    }

    return null;
  };

  sortedMembers.forEach((member, index) => {
    const nodeId = memberNodeIdByIndex.get(index);
    const node = nodes[nodeId];
    if (!node) {
      return;
    }

    const normalizedSponsorUsername = normalizeKey(member?.sponsorUsername);
    const sponsorNodeId = lookupToNodeId.get(normalizedSponsorUsername) || GLOBAL_ROOT_ID;

    const placementLeg = resolvePlacementOptionFromMember(member);
    const isSpilloverPlacement = (
      placementLeg === PLACEMENT_OPTION_SPILLOVER_LEFT
      || placementLeg === PLACEMENT_OPTION_SPILLOVER_RIGHT
    );

    const preferredSide = (
      placementLeg === PLACEMENT_LEG_RIGHT
      || placementLeg === PLACEMENT_LEG_EXTREME_RIGHT
      || placementLeg === PLACEMENT_OPTION_SPILLOVER_RIGHT
    )
      ? PLACEMENT_LEG_RIGHT
      : PLACEMENT_LEG_LEFT;

    const placementMode = (
      placementLeg === PLACEMENT_LEG_EXTREME_LEFT
      || placementLeg === PLACEMENT_LEG_EXTREME_RIGHT
    )
      ? 'extreme'
      : 'auto';

    const requestedParentLookup = isSpilloverPlacement
      ? normalizeKey(member?.spilloverParentReference)
      : '';

    const requestedParentId = requestedParentLookup && lookupToNodeId.has(requestedParentLookup)
      ? lookupToNodeId.get(requestedParentLookup)
      : sponsorNodeId;

    const placement = placementMode === 'extreme'
      ? findExtremePlacement(requestedParentId, preferredSide)
      : findOpenPlacement(requestedParentId, preferredSide);

    if (!placement || !nodes[placement.parentId]) {
      return;
    }

    const parentNode = nodes[placement.parentId];
    if (placement.side === PLACEMENT_LEG_RIGHT) {
      parentNode.rightChildId = nodeId;
    } else {
      parentNode.leftChildId = nodeId;
    }

    node.placementParentId = placement.parentId;
    node.placementSide = placement.side;
    node.sponsorId = sponsorNodeId === nodeId ? GLOBAL_ROOT_ID : sponsorNodeId;
    node.isSpillover = node.sponsorId !== node.placementParentId;
    if (node.sponsorId === node.placementParentId) {
      node.sponsorLeg = node.placementSide;
    }
  });

  const viewerNodeId = lookupToNodeId.get(sponsorUsername);
  if (!viewerNodeId || !nodes[viewerNodeId]) {
    throw new Error(`Unable to resolve target sponsor node in tree: ${sponsorUsernameInput}`);
  }

  const includedNodeIds = new Set();
  const queue = [viewerNodeId];
  while (queue.length > 0) {
    const nextNodeId = queue.shift();
    if (!nextNodeId || includedNodeIds.has(nextNodeId) || !nodes[nextNodeId]) {
      continue;
    }

    includedNodeIds.add(nextNodeId);
    const nextNode = nodes[nextNodeId];

    if (nextNode.leftChildId && nodes[nextNode.leftChildId]) {
      queue.push(nextNode.leftChildId);
    }
    if (nextNode.rightChildId && nodes[nextNode.rightChildId]) {
      queue.push(nextNode.rightChildId);
    }
  }

  const scopedNodes = {};
  const sourceRootNode = nodes[viewerNodeId];

  scopedNodes[ROOT_ALIAS_ID] = {
    id: ROOT_ALIAS_ID,
    memberCode: normalizeText(sourceRootNode?.memberCode || sponsorUsernameInput),
    name: normalizeText(sourceRootNode?.name || 'You'),
    status: normalizeText(sourceRootNode?.status || 'active'),
    leftPersonalPv: 0,
    rightPersonalPv: 0,
    lifetimePersonalPv: 0,
    rank: normalizeText(sourceRootNode?.rank || 'Legacy'),
    enrollmentPackage: normalizeKey(sourceRootNode?.enrollmentPackage),
    countryFlag: normalizeText(sourceRootNode?.countryFlag || 'un'),
    addedAt: toWholeNumber(sourceRootNode?.addedAt, Date.now()),
    businessCenterNodeType: 'primary',
    isBusinessCenterPlaceholder: false,
  };

  const sourceRootLeftId = sourceRootNode?.leftChildId;
  if (sourceRootLeftId && includedNodeIds.has(sourceRootLeftId) && sourceRootLeftId !== viewerNodeId) {
    scopedNodes[ROOT_ALIAS_ID].leftChildId = sourceRootLeftId;
  }

  const sourceRootRightId = sourceRootNode?.rightChildId;
  if (sourceRootRightId && includedNodeIds.has(sourceRootRightId) && sourceRootRightId !== viewerNodeId) {
    scopedNodes[ROOT_ALIAS_ID].rightChildId = sourceRootRightId;
  }

  for (const nodeId of includedNodeIds) {
    if (nodeId === viewerNodeId || !nodes[nodeId]) {
      continue;
    }

    const sourceNode = nodes[nodeId];
    const scopedNode = { ...sourceNode };

    const mappedLeftChildId = sourceNode.leftChildId;
    scopedNode.leftChildId = mappedLeftChildId && includedNodeIds.has(mappedLeftChildId) && mappedLeftChildId !== viewerNodeId
      ? mappedLeftChildId
      : undefined;

    const mappedRightChildId = sourceNode.rightChildId;
    scopedNode.rightChildId = mappedRightChildId && includedNodeIds.has(mappedRightChildId) && mappedRightChildId !== viewerNodeId
      ? mappedRightChildId
      : undefined;

    const sourcePlacementParentId = sourceNode.placementParentId;
    scopedNode.placementParentId = sourcePlacementParentId === viewerNodeId
      ? ROOT_ALIAS_ID
      : (sourcePlacementParentId && includedNodeIds.has(sourcePlacementParentId) ? sourcePlacementParentId : undefined);

    const sourceSponsorId = sourceNode.sponsorId;
    scopedNode.sponsorId = sourceSponsorId === viewerNodeId
      ? ROOT_ALIAS_ID
      : (sourceSponsorId && includedNodeIds.has(sourceSponsorId) ? sourceSponsorId : undefined);

    const sourceWasSpillover = Boolean(sourceNode.isSpillover);
    scopedNode.sponsorLeg = sourceNode.sponsorLeg;
    if (scopedNode.sponsorId === scopedNode.placementParentId && scopedNode.placementSide) {
      scopedNode.sponsorLeg = scopedNode.placementSide;
    }

    scopedNode.isSpillover = sourceWasSpillover || Boolean(
      scopedNode.sponsorId
      && scopedNode.placementParentId
      && scopedNode.sponsorId !== scopedNode.placementParentId
    );

    scopedNodes[nodeId] = scopedNode;
  }

  return {
    rootId: ROOT_ALIAS_ID,
    nodes: scopedNodes,
    cycleRule: {
      leftPvThreshold: CYCLE_RULE_LOWER_BV,
      rightPvThreshold: CYCLE_RULE_HIGHER_BV,
    },
  };
}

function getNodeAddedAt(node) {
  const directAddedAt = Number(node?.addedAt);
  if (Number.isFinite(directAddedAt)) {
    return directAddedAt;
  }
  const parsedAddedAt = Date.parse(normalizeText(node?.addedAt));
  return Number.isFinite(parsedAddedAt) ? parsedAddedAt : 0;
}

function isBusinessCenterPlaceholderNode(node = {}) {
  return Boolean(node?.isBusinessCenterPlaceholder)
    || normalizeBusinessCenterNodeType(node?.businessCenterNodeType) === 'placeholder';
}

function buildTierSnapshots(treeData, options = {}) {
  if (!treeData || typeof treeData !== 'object' || !treeData.nodes || !treeData.rootId) {
    return {
      directSponsorCount: 0,
      activeTierCount: 0,
      completedTierCount: 0,
      tiers: [],
    };
  }

  const seedNodeQualifier = typeof options.seedNodeQualifier === 'function'
    ? options.seedNodeQualifier
    : (() => true);

  const totalNodesPerTier = Number.isFinite(options?.totalNodesPerTier) && options.totalNodesPerTier > 0
    ? options.totalNodesPerTier
    : INFINITY_BUILDER_TOTAL_NODES_PER_TIER;

  const baseVisibleTierCount = Number.isFinite(options?.baseVisibleTierCount) && options.baseVisibleTierCount >= 1
    ? Math.max(1, toWholeNumber(options.baseVisibleTierCount, INFINITY_BUILDER_BASE_TIER_COUNT))
    : INFINITY_BUILDER_BASE_TIER_COUNT;

  const previewLockedTierCount = Number.isFinite(options?.previewLockedTierCount) && options.previewLockedTierCount >= 0
    ? Math.max(0, toWholeNumber(options.previewLockedTierCount, INFINITY_BUILDER_PREVIEW_LOCKED_TIER_COUNT))
    : INFINITY_BUILDER_PREVIEW_LOCKED_TIER_COUNT;

  const unlockByDirectRequirement = Boolean(options?.unlockByDirectRequirement);
  const includeRootNodeWithoutSeeds = options?.includeRootNodeWithoutSeeds !== false;
  const downlineNodeCap = totalNodesPerTier - 1;

  const rootNodeId = normalizeKey(treeData.rootId);
  const nodeById = new Map();
  const nodeIdsBySponsorId = new Map();

  for (const rawNode of Object.values(treeData.nodes)) {
    const node = rawNode && typeof rawNode === 'object' ? rawNode : null;
    const nodeId = normalizeKey(node?.id);
    if (!nodeId || nodeId === rootNodeId) {
      continue;
    }

    nodeById.set(nodeId, node);

    const sponsorNodeId = normalizeKey(node?.sponsorId);
    if (!nodeIdsBySponsorId.has(sponsorNodeId)) {
      nodeIdsBySponsorId.set(sponsorNodeId, []);
    }
    nodeIdsBySponsorId.get(sponsorNodeId).push(nodeId);
  }

  const sortNodeIdsByAddedAt = (leftNodeId, rightNodeId) => {
    const leftNode = nodeById.get(leftNodeId);
    const rightNode = nodeById.get(rightNodeId);
    const leftAddedAt = getNodeAddedAt(leftNode);
    const rightAddedAt = getNodeAddedAt(rightNode);
    if (leftAddedAt !== rightAddedAt) {
      return leftAddedAt - rightAddedAt;
    }
    return leftNodeId.localeCompare(rightNodeId);
  };

  for (const [sponsorId, childNodeIds] of nodeIdsBySponsorId.entries()) {
    nodeIdsBySponsorId.set(sponsorId, childNodeIds.slice().sort(sortNodeIdsByAddedAt));
  }

  const directSponsorNodeIds = (nodeIdsBySponsorId.get(rootNodeId) || [])
    .filter((nodeId) => {
      const node = nodeById.get(nodeId);
      return !isBusinessCenterPlaceholderNode(node) && seedNodeQualifier(node, nodeId);
    })
    .slice()
    .sort(sortNodeIdsByAddedAt);

  const fullySeededTierCount = Math.floor(directSponsorNodeIds.length / INFINITY_BUILDER_DIRECT_SPONSORS_PER_TIER);
  const tierCount = Math.max(
    baseVisibleTierCount + previewLockedTierCount,
    fullySeededTierCount + 1 + previewLockedTierCount,
  );

  const countTierDownlineNodes = (seedNodeIds) => {
    if (!Array.isArray(seedNodeIds) || seedNodeIds.length === 0) {
      return 0;
    }

    const queue = seedNodeIds.slice();
    const visitedNodeIds = new Set();
    let qualifyingNodeCount = 0;

    while (queue.length > 0) {
      const nextNodeId = normalizeKey(queue.shift());
      if (!nextNodeId || visitedNodeIds.has(nextNodeId) || !nodeById.has(nextNodeId)) {
        continue;
      }

      visitedNodeIds.add(nextNodeId);
      const nextNode = nodeById.get(nextNodeId);
      if (!isBusinessCenterPlaceholderNode(nextNode)) {
        qualifyingNodeCount += 1;
      }

      const childNodeIds = nodeIdsBySponsorId.get(nextNodeId) || [];
      for (const childNodeId of childNodeIds) {
        if (!visitedNodeIds.has(childNodeId)) {
          queue.push(childNodeId);
        }
      }
    }

    return qualifyingNodeCount;
  };

  const tiers = [];
  for (let tierIndex = 0; tierIndex < tierCount; tierIndex += 1) {
    const startIndex = tierIndex * INFINITY_BUILDER_DIRECT_SPONSORS_PER_TIER;
    const endIndex = startIndex + INFINITY_BUILDER_DIRECT_SPONSORS_PER_TIER;
    const tierSeedNodeIds = directSponsorNodeIds.slice(startIndex, endIndex);

    const seedCount = tierSeedNodeIds.length;
    const directRequirementMet = seedCount >= INFINITY_BUILDER_DIRECT_SPONSORS_PER_TIER;
    const rawDownlineCount = countTierDownlineNodes(tierSeedNodeIds);
    const downlineCount = Math.min(downlineNodeCap, rawDownlineCount);
    const effectiveDownlineCount = directRequirementMet
      ? downlineCount
      : Math.min(downlineCount, seedCount);
    const rootNodeCount = seedCount > 0 || includeRootNodeWithoutSeeds ? 1 : 0;
    const litNodeCount = Math.min(totalNodesPerTier, rootNodeCount + effectiveDownlineCount);
    const remainingSeedSlots = Math.max(0, INFINITY_BUILDER_DIRECT_SPONSORS_PER_TIER - seedCount);
    const isCompleted = directRequirementMet && litNodeCount >= totalNodesPerTier;

    tiers.push({
      tierNumber: tierIndex + 1,
      seedCount,
      directRequirementMet,
      remainingSeedSlots,
      litNodeCount,
      isCompleted,
      isUnlocked: false,
    });
  }

  for (let tierIndex = 0; tierIndex < tiers.length; tierIndex += 1) {
    const isBaseVisibleTier = tierIndex < baseVisibleTierCount;
    if (tierIndex === 0) {
      tiers[tierIndex].isUnlocked = true;
      continue;
    }

    const previousTier = tiers[tierIndex - 1];
    const unlockedByProgress = unlockByDirectRequirement
      ? Boolean(previousTier?.isUnlocked && previousTier?.directRequirementMet)
      : Boolean(previousTier?.isUnlocked && previousTier?.isCompleted);

    tiers[tierIndex].isUnlocked = isBaseVisibleTier || unlockedByProgress;
  }

  const completedTierCount = tiers.reduce((count, tier) => count + (tier.isCompleted ? 1 : 0), 0);
  const activeTierCount = tiers.reduce((count, tier) => count + (tier.isUnlocked ? 1 : 0), 0);

  return {
    directSponsorCount: directSponsorNodeIds.length,
    activeTierCount,
    completedTierCount,
    tiers,
  };
}

function buildInfinityBuilderTierSnapshots(treeData) {
  return buildTierSnapshots(treeData, {
    seedNodeQualifier: (node) => INFINITY_BUILDER_QUALIFYING_PACKAGE_KEYS.has(normalizeKey(node?.enrollmentPackage)),
    totalNodesPerTier: INFINITY_BUILDER_TOTAL_NODES_PER_TIER,
    baseVisibleTierCount: INFINITY_BUILDER_BASE_TIER_COUNT,
    previewLockedTierCount: INFINITY_BUILDER_PREVIEW_LOCKED_TIER_COUNT,
    unlockByDirectRequirement: false,
    includeRootNodeWithoutSeeds: true,
  });
}

function buildLegacyLeadershipTierSnapshots(treeData) {
  return buildTierSnapshots(treeData, {
    seedNodeQualifier: (node) => normalizeKey(node?.enrollmentPackage) === LEGACY_PACKAGE_KEY,
    totalNodesPerTier: LEGACY_LEADERSHIP_TOTAL_NODES_PER_TIER,
    baseVisibleTierCount: LEGACY_LEADERSHIP_BASE_TIER_COUNT,
    previewLockedTierCount: LEGACY_LEADERSHIP_PREVIEW_LOCKED_TIER_COUNT,
    unlockByDirectRequirement: true,
    includeRootNodeWithoutSeeds: true,
  });
}

function toPackageDistribution(rows = []) {
  return rows.reduce((distribution, row) => {
    const packageKey = normalizeKey(row?.enrollmentPackage || row?.packageKey || 'unknown');
    distribution[packageKey] = (distribution[packageKey] || 0) + 1;
    return distribution;
  }, {});
}

function findUserByUsername(users, username) {
  const usernameKey = normalizeKey(username);
  return (Array.isArray(users) ? users : []).find((user) => normalizeKey(user?.username) === usernameKey) || null;
}

function findMemberByUsername(members, username) {
  const usernameKey = normalizeKey(username);
  return (Array.isArray(members) ? members : []).find((member) => normalizeKey(member?.memberUsername) === usernameKey) || null;
}

function chooseEnrollmentPackage() {
  return chooseWeighted([
    { value: PERSONAL_PACKAGE_KEY, weight: 30 },
    { value: BUSINESS_PACKAGE_KEY, weight: 32 },
    { value: INFINITY_PACKAGE_KEY, weight: 23 },
    { value: LEGACY_PACKAGE_KEY, weight: 15 },
  ]) || BUSINESS_PACKAGE_KEY;
}

function choosePlacementPreference() {
  const value = chooseWeighted([
    { value: PLACEMENT_LEG_LEFT, weight: 42 },
    { value: PLACEMENT_LEG_RIGHT, weight: 42 },
    { value: PLACEMENT_LEG_SPILLOVER, weight: 16 },
  ]) || PLACEMENT_LEG_LEFT;

  if (value === PLACEMENT_LEG_SPILLOVER) {
    const spilloverSide = Math.random() < 0.5 ? PLACEMENT_LEG_LEFT : PLACEMENT_LEG_RIGHT;
    return {
      placementLeg: PLACEMENT_LEG_SPILLOVER,
      spilloverPlacementSide: spilloverSide,
      requestedDirection: spilloverSide === PLACEMENT_LEG_RIGHT ? 'right' : 'left',
    };
  }

  return {
    placementLeg: value,
    spilloverPlacementSide: PLACEMENT_LEG_LEFT,
    requestedDirection: value === PLACEMENT_LEG_RIGHT ? 'right' : 'left',
  };
}

function choosePurchaseGainByPackage(packageKey) {
  const normalizedPackage = normalizeKey(packageKey);
  if (normalizedPackage === PERSONAL_PACKAGE_KEY) {
    return randomIntBetween(160, 360);
  }
  if (normalizedPackage === BUSINESS_PACKAGE_KEY) {
    return randomIntBetween(300, 580);
  }
  if (normalizedPackage === INFINITY_PACKAGE_KEY) {
    return randomIntBetween(520, 920);
  }
  if (normalizedPackage === LEGACY_PACKAGE_KEY) {
    return randomIntBetween(820, 1320);
  }
  return randomIntBetween(100, 220);
}

function resolveUpgradeableTargetPackage(currentPackageKey) {
  const normalizedCurrent = normalizeKey(currentPackageKey);
  const currentIndex = ACCOUNT_PACKAGE_ORDER.indexOf(normalizedCurrent);
  if (currentIndex < 0 || currentIndex >= ACCOUNT_PACKAGE_ORDER.length - 1) {
    return '';
  }

  if (Math.random() >= 0.3) {
    return '';
  }

  const nextIndex = randomIntBetween(currentIndex + 1, ACCOUNT_PACKAGE_ORDER.length - 1);
  return ACCOUNT_PACKAGE_ORDER[nextIndex] || '';
}

function resolveFastTrackCommissionFromDirectMembers(allMembers, sponsorUsername) {
  const sponsorKey = normalizeKey(sponsorUsername);
  return (Array.isArray(allMembers) ? allMembers : []).reduce((sum, member) => {
    if (normalizeKey(member?.sponsorUsername) !== sponsorKey) {
      return sum;
    }
    if (isBusinessCenterPlaceholderMember(member)) {
      return sum;
    }
    const bonus = Math.max(0, Number(member?.fastTrackBonusAmount) || 0);
    return sum + bonus;
  }, 0);
}

function summarizeAchievementProgress(achievementPayload = {}) {
  const achievements = Array.isArray(achievementPayload?.achievements) ? achievementPayload.achievements : [];

  const eligibleAchievements = achievements
    .filter((entry) => Boolean(entry?.eligible) && normalizeKey(entry?.status) === 'eligible');
  const claimedAchievements = achievements
    .filter((entry) => normalizeKey(entry?.status) === 'claimed');

  const eligibleRankRewards = eligibleAchievements
    .filter((entry) => normalizeKey(entry?.tabId) === 'rank')
    .slice()
    .sort((left, right) => toWholeNumber(right?.requiredCycles, 0) - toWholeNumber(left?.requiredCycles, 0));

  return {
    currentRank: normalizeText(achievementPayload?.currentRank),
    currentCycles: toWholeNumber(achievementPayload?.currentCycles, 0),
    leftDirectSponsors: toWholeNumber(achievementPayload?.leftDirectSponsors, 0),
    rightDirectSponsors: toWholeNumber(achievementPayload?.rightDirectSponsors, 0),
    totalDirectSponsors: toWholeNumber(achievementPayload?.totalDirectSponsors, 0),
    eligibleCount: eligibleAchievements.length,
    claimedCount: claimedAchievements.length,
    highestEligibleRankReward: eligibleRankRewards[0]
      ? {
        id: normalizeText(eligibleRankRewards[0].id),
        title: normalizeText(eligibleRankRewards[0].title),
        requiredCycles: toWholeNumber(eligibleRankRewards[0].requiredCycles, 0),
      }
      : null,
  };
}

async function resetSimulationData(targetUsername) {
  const targetPrefix = `${normalizeKey(targetUsername)}-sim-%`;
  const targetIdentity = normalizeKey(targetUsername);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const usernamesResult = await client.query(
      `
      SELECT member_username AS username
      FROM charge.registered_members
      WHERE LOWER(member_username) LIKE $1
         OR LOWER(notes) LIKE $2
      `,
      [targetPrefix, `scenario ${targetIdentity}:%`],
    );

    const usernames = usernamesResult.rows
      .map((row) => normalizeText(row?.username))
      .filter(Boolean);

    let deletedMembers = 0;
    let deletedUsers = 0;
    let deletedCutoffStates = 0;
    let deletedTokens = 0;
    let deletedTargetBinarySnapshots = 0;
    let deletedTargetSalesCommissions = 0;
    let deletedTargetCutoffStates = 0;

    if (usernames.length > 0) {
      const userIdsResult = await client.query(
        `SELECT id FROM charge.member_users WHERE LOWER(username) = ANY($1::text[])`,
        [usernames.map((value) => normalizeKey(value))],
      );
      const userIds = userIdsResult.rows.map((row) => normalizeText(row?.id)).filter(Boolean);

      if (userIds.length > 0) {
        deletedCutoffStates = (await client.query(
          `DELETE FROM charge.member_server_cutoff_states WHERE user_id = ANY($1::text[])`,
          [userIds],
        )).rowCount;

        deletedTokens = (await client.query(
          `DELETE FROM charge.password_setup_tokens WHERE user_id = ANY($1::text[])`,
          [userIds],
        )).rowCount;
      }

      deletedMembers = (await client.query(
        `DELETE FROM charge.registered_members WHERE LOWER(member_username) = ANY($1::text[])`,
        [usernames.map((value) => normalizeKey(value))],
      )).rowCount;

      deletedUsers = (await client.query(
        `DELETE FROM charge.member_users WHERE LOWER(username) = ANY($1::text[])`,
        [usernames.map((value) => normalizeKey(value))],
      )).rowCount;
    }

    deletedTargetBinarySnapshots = (await client.query(
      `
      DELETE FROM charge.binary_tree_metrics_snapshots
      WHERE LOWER(username) = $1
      `,
      [targetIdentity],
    )).rowCount;

    deletedTargetSalesCommissions = (await client.query(
      `
      DELETE FROM charge.sales_team_commission_snapshots
      WHERE LOWER(username) = $1
      `,
      [targetIdentity],
    )).rowCount;

    deletedTargetCutoffStates = (await client.query(
      `
      DELETE FROM charge.member_server_cutoff_states
      WHERE LOWER(username) = $1
      `,
      [targetIdentity],
    )).rowCount;

    await client.query('COMMIT');

    return {
      targetUsername,
      deletedUsers,
      deletedMembers,
      deletedCutoffStates,
      deletedTokens,
      deletedTargetBinarySnapshots,
      deletedTargetSalesCommissions,
      deletedTargetCutoffStates,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function run() {
  const startedAt = new Date();
  const { targetUsername, nodeCount, resetOnly, skipReset, directMin, directMax } = parseArgs();
  const runId = `${targetUsername}:${startedAt.toISOString().replace(/[-:.TZ]/g, '')}-${Math.random().toString(36).slice(2, 8)}`;

  let resetSummary = null;
  if (!skipReset || resetOnly) {
    resetSummary = await resetSimulationData(targetUsername);
    console.log('[reset]', JSON.stringify(resetSummary));
  }

  if (resetOnly) {
    console.log('Reset completed only. No simulation run requested.');
    return;
  }

  const initialUsers = await readMockUsersStore();
  const initialMembers = await readRegisteredMembersStore();

  const targetUser = findUserByUsername(initialUsers, targetUsername);
  const targetMember = findMemberByUsername(initialMembers, targetUsername);

  if (!targetUser) {
    throw new Error(`Target user not found: ${targetUsername}`);
  }
  if (!targetMember) {
    throw new Error(`Target registered member not found: ${targetUsername}`);
  }

  const targetDirectGoal = Math.min(
    nodeCount,
    randomIntBetween(
      Math.max(1, Math.min(directMin, nodeCount)),
      Math.max(1, Math.min(directMax, nodeCount)),
    ),
  );

  const createdMembers = [];
  const creationRecords = [];
  let directCreatedCount = 0;
  let leftRequestedCount = 0;
  let rightRequestedCount = 0;

  for (let index = 0; index < nodeCount; index += 1) {
    const sequence = String(index + 1).padStart(3, '0');
    const username = `${normalizeKey(targetUsername)}-sim-${startedAt.toISOString().replace(/[-:.TZ]/g, '')}-${sequence}`;
    const email = `${normalizeKey(targetUsername)}.sim.${startedAt.getTime()}.${sequence}@ldp-test.local`;
    const packageKey = chooseEnrollmentPackage();
    const placementChoice = choosePlacementPreference();
    const nodesRemaining = nodeCount - index;
    const directsRemainingNeeded = targetDirectGoal - directCreatedCount;

    let sponsorRef = null;
    let shouldForceDirect = false;

    if (createdMembers.length === 0) {
      shouldForceDirect = true;
    } else if (directsRemainingNeeded >= nodesRemaining) {
      shouldForceDirect = true;
    } else if (directCreatedCount < targetDirectGoal && Math.random() < 0.2) {
      shouldForceDirect = true;
    }

    if (shouldForceDirect) {
      sponsorRef = {
        memberUsername: normalizeText(targetMember?.memberUsername || targetUsername),
        fullName: normalizeText(targetMember?.fullName || targetMember?.memberUsername || targetUsername),
        isTarget: true,
      };
    } else {
      const randomExisting = chooseRandom(createdMembers);
      sponsorRef = {
        memberUsername: normalizeText(randomExisting?.memberUsername),
        fullName: normalizeText(randomExisting?.fullName || randomExisting?.memberUsername || ''),
        isTarget: false,
      };
    }

    if (!sponsorRef?.memberUsername) {
      throw new Error(`Unable to resolve sponsor reference for node ${index + 1}.`);
    }

    const payload = {
      fullName: `Sim Member ${sequence}`,
      email,
      memberUsername: username,
      phone: `555${String(randomIntBetween(1000000, 9999999))}`,
      notes: `Scenario ${runId} (n${index + 1})`,
      countryFlag: 'us',
      sponsorUsername: sponsorRef.memberUsername,
      sponsorName: sponsorRef.fullName || sponsorRef.memberUsername,
      enrollmentPackage: packageKey,
      placementLeg: placementChoice.placementLeg,
      spilloverPlacementSide: placementChoice.spilloverPlacementSide,
      spilloverParentMode: 'auto',
      spilloverParentReference: '',
    };

    const created = await createRegisteredMember(payload);
    if (!created?.success || !created?.member) {
      throw new Error(`Enrollment failed at node ${index + 1}: ${normalizeText(created?.error) || 'unknown error'}`);
    }

    const createdMember = created.member;
    createdMembers.push(createdMember);

    if (sponsorRef.isTarget) {
      directCreatedCount += 1;
      if (placementChoice.requestedDirection === 'left') {
        leftRequestedCount += 1;
      } else {
        rightRequestedCount += 1;
      }
    }

    creationRecords.push({
      key: `n${index + 1}`,
      memberUsername: normalizeText(createdMember?.memberUsername),
      userId: normalizeText(createdMember?.userId),
      sponsorUsername: sponsorRef.memberUsername,
      sponsorIsTarget: sponsorRef.isTarget,
      enrollmentPackage: normalizeKey(createdMember?.enrollmentPackage || packageKey),
      requestedPlacementLeg: placementChoice.placementLeg,
      requestedDirection: placementChoice.requestedDirection,
    });

    if ((index + 1) % 5 === 0 || index === nodeCount - 1) {
      console.log(`[progress] created ${index + 1}/${nodeCount} nodes`);
    }
  }

  console.log('[progress] applying randomized purchases/upgrades in bulk');
  const usersAfterCreation = await readMockUsersStore();
  const membersAfterCreation = await readRegisteredMembersStore();

  const generatedUsernameSet = new Set(creationRecords.map((record) => normalizeKey(record.memberUsername)));
  const usersByUsername = new Map(usersAfterCreation.map((user) => [normalizeKey(user?.username), user]));
  const membersByUsername = new Map(membersAfterCreation.map((member) => [normalizeKey(member?.memberUsername), member]));

  const nowIso = new Date().toISOString();
  const upgradesApplied = [];
  const purchaseRecords = [];

  for (const usernameKey of generatedUsernameSet) {
    const user = usersByUsername.get(usernameKey);
    const member = membersByUsername.get(usernameKey);
    if (!user || !member) {
      continue;
    }

    const currentPackageKey = normalizeKey(user?.enrollmentPackage || member?.enrollmentPackage);
    const targetUpgradePackage = resolveUpgradeableTargetPackage(currentPackageKey);
    const packageAfterUpgrade = targetUpgradePackage || currentPackageKey;

    const currentPackageMeta = FAST_TRACK_PACKAGE_META[currentPackageKey] || FAST_TRACK_PACKAGE_META[PERSONAL_PACKAGE_KEY];
    const nextPackageMeta = FAST_TRACK_PACKAGE_META[packageAfterUpgrade] || currentPackageMeta;

    const currentBv = Math.max(0, toWholeNumber(user?.enrollmentPackageBv, currentPackageMeta?.bv || 0));
    const nextBv = Math.max(currentBv, toWholeNumber(nextPackageMeta?.bv, currentBv));
    const pvGainFromUpgrade = Math.max(0, nextBv - currentBv);
    const purchasePvGain = choosePurchaseGainByPackage(packageAfterUpgrade);
    const totalPvGain = pvGainFromUpgrade + purchasePvGain;

    const existingStarterPv = Math.max(0, toWholeNumber(user?.starterPersonalPv, currentBv));
    const nextStarterPv = existingStarterPv + totalPvGain;

    const existingActivityMs = Date.parse(normalizeText(user?.activityActiveUntilAt));
    const baseMs = Number.isFinite(existingActivityMs) && existingActivityMs > Date.now()
      ? existingActivityMs
      : Date.now();
    const nextActivityUntilAt = new Date(baseMs + (30 * 24 * 60 * 60 * 1000)).toISOString();

    const nextRank = normalizeText(nextPackageMeta?.rank || user?.accountRank || user?.rank || 'Personal');

    const nextUser = {
      ...user,
      enrollmentPackage: packageAfterUpgrade,
      enrollmentPackageLabel: normalizeText(nextPackageMeta?.label || user?.enrollmentPackageLabel),
      enrollmentPackagePrice: Number(nextPackageMeta?.price || user?.enrollmentPackagePrice || 0),
      enrollmentPackageBv: nextBv,
      starterPersonalPv: nextStarterPv,
      rank: nextRank,
      accountRank: nextRank,
      activityActiveUntilAt: nextActivityUntilAt,
      lastProductPurchaseAt: nowIso,
      lastPurchaseAt: nowIso,
    };

    if (targetUpgradePackage) {
      nextUser.lastAccountUpgradeAt = nowIso;
      nextUser.lastAccountUpgradeFromPackage = currentPackageKey;
      nextUser.lastAccountUpgradeToPackage = packageAfterUpgrade;
      nextUser.lastAccountUpgradePvGain = pvGainFromUpgrade;
      upgradesApplied.push({
        memberUsername: normalizeText(nextUser.username),
        fromPackage: currentPackageKey,
        toPackage: packageAfterUpgrade,
        pvGain: pvGainFromUpgrade,
      });
    }

    const nextMember = {
      ...member,
      enrollmentPackage: packageAfterUpgrade,
      enrollmentPackageLabel: normalizeText(nextPackageMeta?.label || member?.enrollmentPackageLabel),
      packagePrice: Number(nextPackageMeta?.price || member?.packagePrice || 0),
      packageBv: nextBv,
      starterPersonalPv: nextStarterPv,
      rank: nextRank,
      accountRank: nextRank,
      activityActiveUntilAt: nextActivityUntilAt,
      lastProductPurchaseAt: nowIso,
      lastPurchaseAt: nowIso,
    };

    if (targetUpgradePackage) {
      nextMember.lastAccountUpgradeAt = nowIso;
      nextMember.lastAccountUpgradeFromPackage = currentPackageKey;
      nextMember.lastAccountUpgradeToPackage = packageAfterUpgrade;
      nextMember.lastAccountUpgradePvGain = pvGainFromUpgrade;
    }

    usersByUsername.set(usernameKey, nextUser);
    membersByUsername.set(usernameKey, nextMember);
    purchaseRecords.push({
      memberUsername: normalizeText(nextUser.username),
      packageKey: packageAfterUpgrade,
      pvGain: purchasePvGain,
    });
  }

  const targetUserKey = normalizeKey(targetUsername);
  const targetUserRef = usersByUsername.get(targetUserKey);
  const targetMemberRef = membersByUsername.get(targetUserKey);
  if (targetUserRef && targetMemberRef) {
    const targetPurchasePv = randomIntBetween(280, 540);
    const currentTargetStarterPv = Math.max(
      0,
      toWholeNumber(targetUserRef?.starterPersonalPv, toWholeNumber(targetUserRef?.enrollmentPackageBv, 0)),
    );
    const nextTargetStarterPv = currentTargetStarterPv + targetPurchasePv;

    const nextTargetUser = {
      ...targetUserRef,
      starterPersonalPv: nextTargetStarterPv,
      lastProductPurchaseAt: nowIso,
      lastPurchaseAt: nowIso,
    };
    const nextTargetMember = {
      ...targetMemberRef,
      starterPersonalPv: nextTargetStarterPv,
      lastProductPurchaseAt: nowIso,
      lastPurchaseAt: nowIso,
    };

    usersByUsername.set(targetUserKey, nextTargetUser);
    membersByUsername.set(targetUserKey, nextTargetMember);
  }

  const mergedUsers = usersAfterCreation.map((user) => usersByUsername.get(normalizeKey(user?.username)) || user);
  const mergedMembers = membersAfterCreation.map((member) => (
    membersByUsername.get(normalizeKey(member?.memberUsername)) || member
  ));

  await writeMockUsersStore(mergedUsers);
  await writeRegisteredMembersStore(mergedMembers);

  const finalUsers = await readMockUsersStore();
  const finalMembers = await readRegisteredMembersStore();

  const refreshedTargetUser = findUserByUsername(finalUsers, targetUsername);
  const refreshedTargetMember = findMemberByUsername(finalMembers, targetUsername);

  if (!refreshedTargetUser || !refreshedTargetMember) {
    throw new Error('Target user/member not found after simulation writes.');
  }

  console.log('[progress] building binary tree metrics and applying cutoff');
  const treeData = createBinaryTreeDataForSponsor(finalMembers, targetUsername);
  const treeSummary = summarizeBinaryTreeData(treeData, {
    leftPvThreshold: CYCLE_RULE_LOWER_BV,
    rightPvThreshold: CYCLE_RULE_HIGHER_BV,
  });

  if (!treeSummary) {
    throw new Error('Unable to build binary tree summary for target account.');
  }

  const binarySnapshot = await saveBinaryTreeMetrics({
    userId: normalizeText(refreshedTargetUser.id),
    username: normalizeText(refreshedTargetUser.username),
    email: normalizeText(refreshedTargetUser.email),
    accountRank: normalizeText(refreshedTargetUser.accountRank || refreshedTargetUser.rank || treeSummary.accountRank || 'Legacy'),
    accountPersonalPv: toWholeNumber(refreshedTargetUser.starterPersonalPv, 0),
    leftLegBv: toWholeNumber(treeSummary.leftLegBv, 0),
    rightLegBv: toWholeNumber(treeSummary.rightLegBv, 0),
    totalAccumulatedBv: toWholeNumber(treeSummary.totalAccumulatedPv, 0),
    totalCycles: toWholeNumber(treeSummary.accountTotalCycles, 0),
    cycleLowerBv: CYCLE_RULE_LOWER_BV,
    cycleHigherBv: CYCLE_RULE_HIGHER_BV,
    snapshotAt: new Date().toISOString(),
  });

  if (!binarySnapshot?.success) {
    throw new Error(`Unable to persist binary snapshot: ${normalizeText(binarySnapshot?.error) || 'unknown error'}`);
  }

  const cutoffResult = await forceServerCutoff({
    updatedBy: `simulation-${normalizeText(runId)}`,
  });

  const salesTeamResult = await getSalesTeamCommissions({
    username: targetUsername,
  });

  const cutoffMetricsResult = await getMemberServerCutoffMetrics({
    username: targetUsername,
  });

  const achievementResult = await listProfileAchievementsForMember(refreshedTargetUser);
  if (!achievementResult?.success) {
    throw new Error(`Unable to load achievement summary: ${normalizeText(achievementResult?.error) || 'unknown error'}`);
  }

  const infinityTierSnapshot = buildInfinityBuilderTierSnapshots(treeData);
  const legacyTierSnapshot = buildLegacyLeadershipTierSnapshots(treeData);
  const generatedMembers = finalMembers.filter((member) => generatedUsernameSet.has(normalizeKey(member?.memberUsername)));
  const generatedUsers = finalUsers.filter((user) => generatedUsernameSet.has(normalizeKey(user?.username)));
  const packageDistribution = toPackageDistribution(generatedUsers.map((user) => ({
    enrollmentPackage: normalizeKey(user?.enrollmentPackage),
  })));
  const achievementSummary = summarizeAchievementProgress(achievementResult?.data || {});

  const report = {
    runId,
    startedAt: startedAt.toISOString(),
    finishedAt: new Date().toISOString(),
    targetUsername,
    targetUserId: normalizeText(refreshedTargetUser.id),
    config: {
      requestedNodes: nodeCount,
      targetDirectGoal,
      randomizedSponsorSelection: true,
      excludedPackages: [FREE_ACCOUNT_PACKAGE_KEY],
      cycleRule: {
        lower: CYCLE_RULE_LOWER_BV,
        higher: CYCLE_RULE_HIGHER_BV,
      },
      resetSummary,
    },
    generatedNodes: {
      created: creationRecords.length,
      directSponsors: directCreatedCount,
      indirectSponsors: Math.max(0, creationRecords.length - directCreatedCount),
      requestedLeftDirect: leftRequestedCount,
      requestedRightDirect: rightRequestedCount,
      byPackage: packageDistribution,
    },
    actions: {
      purchasesApplied: purchaseRecords.length,
      upgradesApplied: upgradesApplied.length,
    },
    zeroone: {
      accountRank: normalizeText(refreshedTargetUser.accountRank || refreshedTargetUser.rank),
      fastTrackCommissionFromDirectEnrollments: Number(resolveFastTrackCommissionFromDirectMembers(finalMembers, targetUsername).toFixed(2)),
      binaryTree: {
        nodeCount: toWholeNumber(treeSummary.nodeCount, 0),
        newMembersJoined: toWholeNumber(treeSummary.newMembersJoined, 0),
        totalDirectSponsors: toWholeNumber(treeSummary.totalDirectSponsors, 0),
        leftLegBv: toWholeNumber(treeSummary.leftLegBv, 0),
        rightLegBv: toWholeNumber(treeSummary.rightLegBv, 0),
        accountTotalCycles: toWholeNumber(treeSummary.accountTotalCycles, 0),
        totalAccumulatedPv: toWholeNumber(treeSummary.totalAccumulatedPv, 0),
        cycleRule: treeSummary.cycleRule,
      },
      cutoffMetrics: cutoffMetricsResult?.success
        ? cutoffMetricsResult.data
        : { error: normalizeText(cutoffMetricsResult?.error || '') },
      salesTeamCommission: salesTeamResult?.data?.commission || null,
      forceServerCutoff: cutoffResult?.data || null,
      achievements: achievementSummary,
      tierCards: {
        infinityBuilder: {
          directSponsorCount: toWholeNumber(infinityTierSnapshot.directSponsorCount, 0),
          activeTierCount: toWholeNumber(infinityTierSnapshot.activeTierCount, 0),
          completedTierCount: toWholeNumber(infinityTierSnapshot.completedTierCount, 0),
          tier1: infinityTierSnapshot.tiers?.[0] || null,
        },
        legacyLeadership: {
          directSponsorCount: toWholeNumber(legacyTierSnapshot.directSponsorCount, 0),
          activeTierCount: toWholeNumber(legacyTierSnapshot.activeTierCount, 0),
          completedTierCount: toWholeNumber(legacyTierSnapshot.completedTierCount, 0),
          tier1: legacyTierSnapshot.tiers?.[0] || null,
        },
      },
    },
    sampleGeneratedMembers: creationRecords.slice(0, 12),
    upgradeSamples: upgradesApplied.slice(0, 12),
    purchaseSamples: purchaseRecords.slice(0, 12),
  };

  const reportDir = path.resolve('backend/scripts/reports');
  fs.mkdirSync(reportDir, { recursive: true });
  const safeRunId = runId.replace(/[^a-z0-9:-]/gi, '').replace(/[:]/g, '-');
  const reportPath = path.join(reportDir, `zeroone-live-test-${safeRunId}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  console.log(`Simulation complete for ${targetUsername}.`);
  console.log(`Created nodes: ${creationRecords.length}`);
  console.log(`Report: ${reportPath}`);
  console.log(JSON.stringify({
    runId,
    targetUsername,
    createdNodes: creationRecords.length,
    directSponsors: directCreatedCount,
    requestedDirectSplit: {
      left: leftRequestedCount,
      right: rightRequestedCount,
    },
    binaryTree: report.zeroone.binaryTree,
    salesTeamCommission: report.zeroone.salesTeamCommission,
    achievements: report.zeroone.achievements,
    tierCards: report.zeroone.tierCards,
  }, null, 2));
}

run()
  .catch((error) => {
    console.error(error?.stack || error?.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await pool.end();
    } catch (_error) {
      // no-op
    }
  });
