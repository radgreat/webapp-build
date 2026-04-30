import {
  readForceServerCutoffHistoryStore,
  readMemberServerCutoffStateStore,
} from '../stores/cutoff.store.js';
import { readMockBinaryTreeMetricsStore } from '../stores/metrics.store.js';
import { readMockUsersStore } from '../stores/user.store.js';
import { readRegisteredMembersStore } from '../stores/member.store.js';
import {
  BINARY_CYCLE_STRONG_LEG_BV,
  BINARY_CYCLE_WEAK_LEG_BV,
  resolveBinaryCycleComputation,
} from '../utils/binary-cycle.helpers.js';

const SERVER_CUTOFF_TIME_ZONE = 'America/Los_Angeles';
const SERVER_CUTOFF_WEEKDAY = 6;
const SERVER_CUTOFF_HOUR = 23;
const SERVER_CUTOFF_MINUTE = 59;
const SERVER_CUTOFF_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;
const CYCLE_RULE_STRONGER_BV = BINARY_CYCLE_STRONG_LEG_BV;
const CYCLE_RULE_WEAKER_BV = BINARY_CYCLE_WEAK_LEG_BV;

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeCredential(value) {
  return normalizeText(value).toLowerCase();
}

function toWholeNumber(value, fallback = 0) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return fallback;
  }
  return Math.max(0, Math.floor(numericValue));
}

function toFirstWholeNumber(candidates = [], fallback = 0) {
  const safeCandidates = Array.isArray(candidates) ? candidates : [];
  for (const candidate of safeCandidates) {
    const parsed = Number(candidate);
    if (Number.isFinite(parsed)) {
      return Math.max(0, Math.floor(parsed));
    }
  }
  return toWholeNumber(fallback, 0);
}

function getCutoffZoneOffsetMs(atDate, timeZone) {
  const offsetParts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'shortOffset',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(atDate);
  const offsetLabel = offsetParts.find((part) => part.type === 'timeZoneName')?.value || 'GMT+0';
  const match = offsetLabel.replace('UTC', 'GMT').match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/i);
  if (!match) {
    return 0;
  }
  const sign = match[1] === '-' ? -1 : 1;
  const hours = Number.parseInt(match[2], 10) || 0;
  const minutes = Number.parseInt(match[3] || '0', 10) || 0;
  return sign * ((hours * 60) + minutes) * 60000;
}

function getCutoffZoneParts(atDate, timeZone) {
  const weekdayByLabel = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(atDate);

  const partMap = {};
  for (const part of parts) {
    partMap[part.type] = part.value;
  }

  return {
    weekday: weekdayByLabel[partMap.weekday] ?? 0,
    year: Number.parseInt(partMap.year, 10),
    month: Number.parseInt(partMap.month, 10),
    day: Number.parseInt(partMap.day, 10),
    hour: Number.parseInt(partMap.hour, 10),
    minute: Number.parseInt(partMap.minute, 10),
    second: Number.parseInt(partMap.second, 10),
  };
}

function shiftCutoffYmdByDays(year, month, day, deltaDays) {
  const shifted = new Date(Date.UTC(year, month - 1, day + deltaDays));
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  };
}

function cutoffZonedDateTimeToUtcMs(year, month, day, hour, minute, second, timeZone) {
  let utcGuess = Date.UTC(year, month - 1, day, hour, minute, second, 0);
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const offsetMs = getCutoffZoneOffsetMs(new Date(utcGuess), timeZone);
    const nextGuess = Date.UTC(year, month - 1, day, hour, minute, second, 0) - offsetMs;
    if (nextGuess === utcGuess) {
      break;
    }
    utcGuess = nextGuess;
  }
  return utcGuess;
}

function resolveServerCutoffWindow(nowDate = new Date()) {
  const now = nowDate instanceof Date ? nowDate : new Date(nowDate);
  const nowMs = now.getTime();
  if (Number.isNaN(nowMs)) {
    return {
      nextCutoffUtcMs: 0,
      lastClosedCutoffUtcMs: 0,
    };
  }

  const zoneParts = getCutoffZoneParts(now, SERVER_CUTOFF_TIME_ZONE);
  const currentMinuteOfDay = (zoneParts.hour * 60) + zoneParts.minute;
  const targetMinuteOfDay = (SERVER_CUTOFF_HOUR * 60) + SERVER_CUTOFF_MINUTE;

  let dayOffset = (SERVER_CUTOFF_WEEKDAY - zoneParts.weekday + 7) % 7;
  const isPastCutoffToday = dayOffset === 0 && currentMinuteOfDay >= targetMinuteOfDay;
  if (isPastCutoffToday) {
    dayOffset = 7;
  }

  const targetDate = shiftCutoffYmdByDays(zoneParts.year, zoneParts.month, zoneParts.day, dayOffset);
  const nextCutoffUtcMs = cutoffZonedDateTimeToUtcMs(
    targetDate.year,
    targetDate.month,
    targetDate.day,
    SERVER_CUTOFF_HOUR,
    SERVER_CUTOFF_MINUTE,
    0,
    SERVER_CUTOFF_TIME_ZONE,
  );

  return {
    nextCutoffUtcMs,
    lastClosedCutoffUtcMs: Math.max(0, nextCutoffUtcMs - SERVER_CUTOFF_INTERVAL_MS),
  };
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
  const normalizedUsername = normalizeText(identityPayload?.username).replace(/^@+/, '');
  appendKey(identityPayload?.username);
  appendKey(normalizedUsername);
  appendKey(identityPayload?.email);
  return keys;
}

function doesMetricsRecordBelongToIdentity(record, identityKeys) {
  if (!(identityKeys instanceof Set) || identityKeys.size === 0) {
    return false;
  }

  const rawUsername = normalizeText(record?.username);
  const normalizedUsername = rawUsername.replace(/^@+/, '');
  const candidates = [
    record?.userId,
    rawUsername,
    normalizedUsername,
    record?.email,
  ];

  return candidates.some((candidate) => {
    const normalized = normalizeCredential(candidate);
    return normalized ? identityKeys.has(normalized) : false;
  });
}

export async function getServerCutoffEvents() {
  const history = await readForceServerCutoffHistoryStore();
  const latestEntry = history[0] || null;

  return {
    success: true,
    status: 200,
    data: {
      latestForcedCutoffAt: normalizeText(latestEntry?.forcedAt),
      latestForcedBy: normalizeText(latestEntry?.forcedBy),
    },
  };
}

export async function getMemberServerCutoffMetrics(query = {}) {
  const identityPayload = {
    userId: query?.userId,
    username: query?.username,
    email: query?.email,
  };

  const identityKeys = resolveMetricsIdentityKeys(identityPayload);

  if (identityKeys.size === 0) {
    return {
      success: false,
      status: 400,
      error: 'A member identifier is required to load server cut-off metrics.',
    };
  }

  const [snapshots, history, stateEntries, users, members] = await Promise.all([
    readMockBinaryTreeMetricsStore(),
    readForceServerCutoffHistoryStore(),
    readMemberServerCutoffStateStore(),
    readMockUsersStore(),
    readRegisteredMembersStore(),
  ]);

  const matchedSnapshot = snapshots.find((entry) => doesMetricsRecordBelongToIdentity(entry, identityKeys)) || null;
  const matchedState = stateEntries.find((entry) => doesMetricsRecordBelongToIdentity(entry, identityKeys)) || null;
  const matchedUser = users.find((entry) => doesMetricsRecordBelongToIdentity(entry, identityKeys)) || null;
  const matchedMember = members.find((entry) => {
    return doesMetricsRecordBelongToIdentity({
      userId: entry?.userId || entry?.id,
      username: entry?.memberUsername || entry?.username,
      email: entry?.email,
    }, identityKeys);
  }) || null;

  const totalLeftLegBv = Math.max(0, toWholeNumber(matchedSnapshot?.leftLegBv, 0));
  const totalRightLegBv = Math.max(0, toWholeNumber(matchedSnapshot?.rightLegBv, 0));
  const cycleLowerBv = CYCLE_RULE_STRONGER_BV;
  const cycleHigherBv = CYCLE_RULE_WEAKER_BV;
  const totalPersonalPv = toFirstWholeNumber([
    matchedUser?.currentPersonalPvBv,
    matchedUser?.current_personal_pv_bv,
    matchedUser?.monthlyPersonalBv,
    matchedUser?.monthly_personal_bv,
    matchedUser?.starterPersonalPv,
    matchedUser?.starter_personal_pv,
    matchedUser?.enrollmentPackageBv,
    matchedUser?.enrollment_package_bv,
    matchedMember?.currentPersonalPvBv,
    matchedMember?.current_personal_pv_bv,
    matchedMember?.monthlyPersonalBv,
    matchedMember?.monthly_personal_bv,
    matchedMember?.starterPersonalPv,
    matchedMember?.starter_personal_pv,
    matchedMember?.packageBv,
    matchedMember?.package_bv,
  ], 0);

  const baselineLeftLegBv = Math.max(0, toWholeNumber(matchedState?.baselineLeftLegBv, 0));
  const baselineRightLegBv = Math.max(0, toWholeNumber(matchedState?.baselineRightLegBv, 0));
  const baselinePersonalPv = 0;
  const lastAppliedCutoffUtcMs = Math.max(0, Math.floor(Number(matchedState?.lastAppliedCutoffUtcMs) || 0));

  const currentWeekLeftLegBv = Math.max(0, totalLeftLegBv - baselineLeftLegBv);
  const currentWeekRightLegBv = Math.max(0, totalRightLegBv - baselineRightLegBv);
  const currentWeekPersonalPv = Math.max(0, totalPersonalPv - baselinePersonalPv);
  const estimatedCycleComputation = resolveBinaryCycleComputation({
    leftVolume: currentWeekLeftLegBv,
    rightVolume: currentWeekRightLegBv,
    strongLegCycleBv: cycleLowerBv,
    weakLegCycleBv: cycleHigherBv,
  });
  const estimatedCycles = estimatedCycleComputation.cycleCount;

  const latestForcedCutoffAt = normalizeText(history[0]?.forcedAt);
  const { nextCutoffUtcMs, lastClosedCutoffUtcMs } = resolveServerCutoffWindow(new Date());

  return {
    success: true,
    status: 200,
    data: {
      cutoff: {
        timezone: SERVER_CUTOFF_TIME_ZONE,
        weekday: SERVER_CUTOFF_WEEKDAY,
        hour: SERVER_CUTOFF_HOUR,
        minute: SERVER_CUTOFF_MINUTE,
        nextCutoffAt: nextCutoffUtcMs > 0 ? new Date(nextCutoffUtcMs).toISOString() : '',
        lastClosedCutoffAt: lastClosedCutoffUtcMs > 0 ? new Date(lastClosedCutoffUtcMs).toISOString() : '',
        latestForcedCutoffAt: latestForcedCutoffAt || '',
        lastAppliedCutoffAt: lastAppliedCutoffUtcMs > 0 ? new Date(lastAppliedCutoffUtcMs).toISOString() : '',
      },
      metrics: {
        totalLeftLegBv,
        totalRightLegBv,
        totalPersonalPv,
        baselineLeftLegBv,
        baselineRightLegBv,
        baselinePersonalPv,
        currentWeekLeftLegBv,
        currentWeekRightLegBv,
        currentWeekPersonalPv,
        cycleLowerBv,
        cycleHigherBv,
        estimatedCycles,
      },
    },
  };
}
