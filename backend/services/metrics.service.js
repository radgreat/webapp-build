import { randomUUID } from 'crypto';
import {
  readMockBinaryTreeMetricsStore,
  writeMockBinaryTreeMetricsStore,
  readMockSalesTeamCommissionsStore,
  writeMockSalesTeamCommissionsStore,
} from '../stores/metrics.store.js';

function normalizeText(value) {
  return String(value || '').trim();
}

function roundCurrencyAmount(value) {
  return Math.round((Math.max(0, Number(value) || 0)) * 100) / 100;
}

function normalizeCredential(value) {
  return normalizeText(value).toLowerCase();
}

function resolveMetricsIdentityKeys(identityPayload) {
  const keys = new Set();

  const appendKey = (value) => {
    const normalized = normalizeCredential(value);
    if (normalized) {
      keys.add(normalized);
    }
  };

  appendKey(identityPayload?.userId);
  appendKey(identityPayload?.username);
  appendKey(identityPayload?.email);

  return keys;
}

function doesMetricsRecordBelongToIdentity(record, identityKeys) {
  if (!(identityKeys instanceof Set) || identityKeys.size === 0) {
    return false;
  }

  const candidates = [
    record?.userId,
    record?.username,
    record?.email,
  ];

  return candidates.some((candidate) => {
    const normalized = normalizeCredential(candidate);
    return normalized ? identityKeys.has(normalized) : false;
  });
}

function sanitizeBinaryTreeMetricsRecord(record, fallbackId = '') {
  if (!record || typeof record !== 'object') {
    return null;
  }

  const leftLegBv = Math.max(0, Math.floor(Number(record.leftLegBv) || 0));
  const rightLegBv = Math.max(0, Math.floor(Number(record.rightLegBv) || 0));
  const cycleLowerBv = Math.max(1, Math.floor(Number(record.cycleLowerBv) || 500));
  const cycleHigherBv = Math.max(cycleLowerBv, Math.floor(Number(record.cycleHigherBv) || 1000));
  const fallbackTotalAccumulatedBv = leftLegBv + rightLegBv;
  const totalAccumulatedBv = Math.max(
    0,
    Math.floor(Number(record.totalAccumulatedBv) || fallbackTotalAccumulatedBv)
  );
  const nowIso = new Date().toISOString();

  return {
    id: normalizeText(record.id) || normalizeText(fallbackId) || `binary_metric_${Date.now()}_${randomUUID().slice(0, 8)}`,
    userId: normalizeText(record.userId),
    username: normalizeText(record.username),
    email: normalizeText(record.email),
    accountRank: normalizeText(record.accountRank) || 'Legacy',
    accountPersonalPv: Math.max(0, Math.floor(Number(record.accountPersonalPv) || 0)),
    leftLegBv,
    rightLegBv,
    totalAccumulatedBv,
    totalCycles: Math.max(0, Math.floor(Number(record.totalCycles) || 0)),
    cycleLowerBv,
    cycleHigherBv,
    createdAt: normalizeText(record.createdAt) || nowIso,
    updatedAt: normalizeText(record.updatedAt) || nowIso,
  };
}

function sanitizeSalesTeamCommissionRecord(record, fallbackId = '') {
  if (!record || typeof record !== 'object') {
    return null;
  }

  const totalCycles = Math.max(0, Math.floor(Number(record.totalCycles) || 0));
  const cappedCyclesRaw = Math.max(0, Math.floor(Number(record.cappedCycles) || 0));
  const cappedCycles = Math.min(totalCycles, cappedCyclesRaw);
  const overflowCycles = Math.max(0, totalCycles - cappedCycles);
  const grossCommissionAmount = roundCurrencyAmount(record.grossCommissionAmount);
  const payoutOffsetAmountRaw = roundCurrencyAmount(record.payoutOffsetAmount);
  const payoutOffsetAmount = roundCurrencyAmount(Math.min(grossCommissionAmount, payoutOffsetAmountRaw));
  const netCommissionAmount = roundCurrencyAmount(Math.max(0, grossCommissionAmount - payoutOffsetAmount));
  const nowIso = new Date().toISOString();

  return {
    id: normalizeText(record.id) || normalizeText(fallbackId) || `sales_team_commission_${Date.now()}_${randomUUID().slice(0, 8)}`,
    userId: normalizeText(record.userId),
    username: normalizeText(record.username),
    email: normalizeText(record.email),
    accountPackageKey: normalizeText(record.accountPackageKey) || 'personal-builder-pack',
    cycleMultiplier: Math.max(0, Number(record.cycleMultiplier) || 0),
    perCycleAmount: Math.max(0, Number(record.perCycleAmount) || 0),
    weeklyCapCycles: Math.max(0, Math.floor(Number(record.weeklyCapCycles) || 0)),
    totalCycles,
    cappedCycles,
    overflowCycles,
    grossCommissionAmount,
    payoutOffsetAmount,
    netCommissionAmount,
    currencyCode: (normalizeText(record.currencyCode) || 'USD').toUpperCase(),
    createdAt: normalizeText(record.createdAt) || nowIso,
    updatedAt: normalizeText(record.updatedAt) || nowIso,
  };
}

export async function getBinaryTreeMetrics(query = {}) {
  const snapshots = await readMockBinaryTreeMetricsStore();

  const identityKeys = resolveMetricsIdentityKeys({
    userId: query?.userId,
    username: query?.username,
    email: query?.email,
  });

  if (identityKeys.size === 0) {
    return {
      success: true,
      status: 200,
      data: { snapshots },
    };
  }

  const snapshot = snapshots.find((entry) => doesMetricsRecordBelongToIdentity(entry, identityKeys)) || null;

  return {
    success: true,
    status: 200,
    data: { snapshot },
  };
}

export async function saveBinaryTreeMetrics(payload = {}) {
  const identityKeys = resolveMetricsIdentityKeys({
    userId: payload?.userId,
    username: payload?.username,
    email: payload?.email,
  });

  if (identityKeys.size === 0) {
    return {
      success: false,
      status: 400,
      error: 'A userId, username, or email is required to save binary tree metrics.',
    };
  }

  const snapshots = await readMockBinaryTreeMetricsStore();
  const existingIndex = snapshots.findIndex((entry) => doesMetricsRecordBelongToIdentity(entry, identityKeys));
  const nowIso = new Date().toISOString();
  const existing = existingIndex >= 0 ? snapshots[existingIndex] : null;
  const fallbackId = existing?.id || `binary_metric_${Date.now()}_${randomUUID().slice(0, 8)}`;

  const nextSnapshot = sanitizeBinaryTreeMetricsRecord({
    ...(existing || {}),
    ...(payload && typeof payload === 'object' ? payload : {}),
    id: fallbackId,
    createdAt: existing?.createdAt || payload?.createdAt || payload?.snapshotAt || nowIso,
    updatedAt: payload?.updatedAt || payload?.snapshotAt || nowIso,
  }, fallbackId);

  if (!nextSnapshot) {
    return {
      success: false,
      status: 400,
      error: 'Unable to save binary tree metrics payload.',
    };
  }

  if (existingIndex >= 0) {
    snapshots[existingIndex] = nextSnapshot;
  } else {
    snapshots.unshift(nextSnapshot);
  }

  await writeMockBinaryTreeMetricsStore(snapshots);

  return {
    success: true,
    status: 200,
    data: {
      success: true,
      snapshot: nextSnapshot,
    },
  };
}

export async function getSalesTeamCommissions(query = {}) {
  const commissions = await readMockSalesTeamCommissionsStore();

  const identityKeys = resolveMetricsIdentityKeys({
    userId: query?.userId,
    username: query?.username,
    email: query?.email,
  });

  if (identityKeys.size === 0) {
    return {
      success: true,
      status: 200,
      data: { commissions },
    };
  }

  const commission = commissions.find((entry) => doesMetricsRecordBelongToIdentity(entry, identityKeys)) || null;

  return {
    success: true,
    status: 200,
    data: { commission },
  };
}

export async function saveSalesTeamCommissions(payload = {}) {
  const identityKeys = resolveMetricsIdentityKeys({
    userId: payload?.userId,
    username: payload?.username,
    email: payload?.email,
  });

  if (identityKeys.size === 0) {
    return {
      success: false,
      status: 400,
      error: 'A userId, username, or email is required to save sales team commissions.',
    };
  }

  const commissions = await readMockSalesTeamCommissionsStore();
  const existingIndex = commissions.findIndex((entry) => doesMetricsRecordBelongToIdentity(entry, identityKeys));
  const nowIso = new Date().toISOString();
  const existing = existingIndex >= 0 ? commissions[existingIndex] : null;
  const fallbackId = existing?.id || `sales_team_commission_${Date.now()}_${randomUUID().slice(0, 8)}`;

  const nextCommission = sanitizeSalesTeamCommissionRecord({
    ...(existing || {}),
    ...(payload && typeof payload === 'object' ? payload : {}),
    id: fallbackId,
    createdAt: existing?.createdAt || payload?.createdAt || payload?.snapshotAt || nowIso,
    updatedAt: payload?.updatedAt || payload?.snapshotAt || nowIso,
  }, fallbackId);

  if (!nextCommission) {
    return {
      success: false,
      status: 400,
      error: 'Unable to save sales team commissions payload.',
    };
  }

  if (existingIndex >= 0) {
    commissions[existingIndex] = nextCommission;
  } else {
    commissions.unshift(nextCommission);
  }

  await writeMockSalesTeamCommissionsStore(commissions);

  return {
    success: true,
    status: 200,
    data: {
      success: true,
      commission: nextCommission,
    },
  };
}
