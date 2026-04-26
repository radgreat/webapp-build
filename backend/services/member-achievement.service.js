import { randomUUID } from 'crypto';
import {
  listMemberAchievementClaimsByUserId,
  findMemberAchievementClaimByUserIdAndAchievementId,
  findMemberAchievementClaimByUserIdAndAchievementIdAndPeriod,
  insertMemberAchievementClaim,
} from '../stores/member-achievement.store.js';
import {
  upsertMemberRankAdvancementMonthlyHighest,
  readMemberRankAdvancementMonthlyProgress,
} from '../stores/member-rank-advancement.store.js';
import {
  listActiveMemberTitleAwardsByUserId,
  findActiveMemberTitleAwardByUserIdAndSlug,
  insertMemberTitleAward,
} from '../stores/member-title-award.store.js';
import {
  listActiveMemberTitleCatalogEntries,
  findActiveMemberTitleCatalogEntryBySlug,
  upsertMemberTitleCatalogEntry,
} from '../stores/member-title-catalog.store.js';
import { getBinaryTreeMetrics } from './metrics.service.js';
import {
  readRegisteredMembersStore,
  upsertRegisteredMemberRecord,
} from '../stores/member.store.js';
import { updateUserById } from '../stores/user.store.js';
import {
  resolveMemberActivityStateByPersonalBv,
  resolveMemberCurrentPersonalBv,
} from '../utils/member-activity.helpers.js';

const LEGACY_BUILDER_EVENT_ID = 'legacy-builder-leadership-program-q2-2026';
const LEGACY_BUILDER_EVENT_START_AT = '2026-04-01T00:00:00.000Z';
const LEGACY_BUILDER_EVENT_END_AT = '2026-06-30T23:59:59.999Z';
const LEGACY_BUILDER_PACKAGE_KEY_SET = new Set([
  'legacy-builder-pack',
  'legacy-builder-package',
  'legacy-pack',
  'legacy-package',
]);
const DEFAULT_MEMBER_TITLE_CATALOG_SEED = Object.freeze([
  Object.freeze({
    titleSlug: 'legacy-founder',
    title: 'Legacy Founder',
    description: 'Foundation title rewarded for enrolling or upgrading to Legacy Package.',
    iconPath: '/brand_assets/Icons/Title-Icons/legacy-founder-star.svg',
    sourceAchievementId: 'time-limited-event-legacy-founder',
    sourceEventId: LEGACY_BUILDER_EVENT_ID,
    claimRule: 'achievement',
    isActive: true,
    metadata: Object.freeze({
      eventName: 'Legacy Builder Leadership Program',
      rewardType: 'title',
      level: 1,
      managedBy: 'system-seed',
    }),
  }),
  Object.freeze({
    titleSlug: 'legacy-director',
    title: 'Legacy Director',
    description: 'Level 2 title rewarded for enrolling 3 Legacy Builder Package members.',
    iconPath: '/brand_assets/Icons/Title-Icons/legacy-director-star.svg',
    sourceAchievementId: 'time-limited-event-legacy-director',
    sourceEventId: LEGACY_BUILDER_EVENT_ID,
    claimRule: 'achievement',
    isActive: true,
    metadata: Object.freeze({
      eventName: 'Legacy Builder Leadership Program',
      rewardType: 'title',
      level: 2,
      managedBy: 'system-seed',
    }),
  }),
  Object.freeze({
    titleSlug: 'legacy-ambassador',
    title: 'Legacy Ambassador',
    description: 'Level 3 title rewarded for building 9 second-level Legacy Package members.',
    iconPath: '/brand_assets/Icons/Title-Icons/legacy-ambassador-star.svg',
    sourceAchievementId: 'time-limited-event-legacy-ambassador',
    sourceEventId: LEGACY_BUILDER_EVENT_ID,
    claimRule: 'achievement',
    isActive: true,
    metadata: Object.freeze({
      eventName: 'Legacy Builder Leadership Program',
      rewardType: 'title',
      level: 3,
      managedBy: 'system-seed',
    }),
  }),
  Object.freeze({
    titleSlug: 'presidential-circle',
    title: 'Presidential Circle',
    description: 'Top title rewarded for completing the Legacy Leadership Tier Card or building 27 third-level Legacy Package members.',
    iconPath: '/brand_assets/Icons/Title-Icons/presidential-circle-star.svg',
    sourceAchievementId: 'time-limited-event-presidential-circle',
    sourceEventId: LEGACY_BUILDER_EVENT_ID,
    claimRule: 'achievement',
    isActive: true,
    metadata: Object.freeze({
      eventName: 'Legacy Builder Leadership Program',
      rewardType: 'title',
      level: 4,
      managedBy: 'system-seed',
    }),
  }),
]);

const PROFILE_ACHIEVEMENT_TABS = Object.freeze([
  Object.freeze({ id: 'time-limited-event', label: 'Time-Limited Event' }),
  Object.freeze({ id: 'premiere-life', label: 'Premiere Life' }),
]);

const PROFILE_ACHIEVEMENT_CATEGORIES = Object.freeze([
  Object.freeze({
    id: 'legacy-builder-leadership-program',
    tabId: 'time-limited-event',
    label: 'Legacy Builder Leadership Program',
    description: 'Limited-time account title reward track.',
  }),
  Object.freeze({
    id: 'premiere-journey',
    tabId: 'premiere-life',
    label: 'Premiere Journey',
    description: 'Foundational achievements for your member journey.',
  }),
]);

const PROFILE_ACHIEVEMENTS = Object.freeze([
  Object.freeze({
    id: 'time-limited-event-legacy-founder',
    tabId: 'time-limited-event',
    categoryId: 'legacy-builder-leadership-program',
    title: 'Foundation Level: Legacy Founder',
    description: 'Enroll or upgrade to Legacy Package',
    requiresLegacyPackageOwnership: true,
    rewardUsd: 0,
    rewardType: 'title',
    rewardTitleSlug: 'legacy-founder',
    rewardTitle: 'Legacy Founder',
    rewardLabel: 'Title: Legacy Founder',
    requiresActive: false,
    requiresSystemVerification: false,
    eventId: LEGACY_BUILDER_EVENT_ID,
    eventName: 'Legacy Builder Leadership Program',
    eventStartAt: LEGACY_BUILDER_EVENT_START_AT,
    eventEndAt: LEGACY_BUILDER_EVENT_END_AT,
    iconPath: '/brand_assets/Icons/Title-Icons/legacy-founder-star.svg',
    iconLightPath: '/brand_assets/Icons/Title-Icons/legacy-founder-star-light.svg',
  }),
  Object.freeze({
    id: 'time-limited-event-legacy-director',
    tabId: 'time-limited-event',
    categoryId: 'legacy-builder-leadership-program',
    title: 'Level 2: Legacy Director',
    description: 'Enroll 3 Legacy Builder Package members',
    requiredLegacyBuilderDirectEnrollments: 3,
    rewardUsd: 0,
    rewardType: 'title',
    rewardTitleSlug: 'legacy-director',
    rewardTitle: 'Legacy Director',
    rewardLabel: 'Title: Legacy Director',
    requiresActive: false,
    requiresSystemVerification: false,
    eventId: LEGACY_BUILDER_EVENT_ID,
    eventName: 'Legacy Builder Leadership Program',
    eventStartAt: LEGACY_BUILDER_EVENT_START_AT,
    eventEndAt: LEGACY_BUILDER_EVENT_END_AT,
    iconPath: '/brand_assets/Icons/Title-Icons/legacy-director-star.svg',
    iconLightPath: '/brand_assets/Icons/Title-Icons/legacy-director-star-light.svg',
  }),
  Object.freeze({
    id: 'time-limited-event-legacy-ambassador',
    tabId: 'time-limited-event',
    categoryId: 'legacy-builder-leadership-program',
    title: 'Level 3: Legacy Ambassador',
    description: 'Build 9 second-level Legacy Package members (3 personally enrolled Legacy Builder members each enroll 3 Legacy Package members).',
    requiredLegacyBuilderSecondLevelEnrollments: 9,
    rewardUsd: 0,
    rewardType: 'title',
    rewardTitleSlug: 'legacy-ambassador',
    rewardTitle: 'Legacy Ambassador',
    rewardLabel: 'Title: Legacy Ambassador',
    requiresActive: false,
    requiresSystemVerification: false,
    eventId: LEGACY_BUILDER_EVENT_ID,
    eventName: 'Legacy Builder Leadership Program',
    eventStartAt: LEGACY_BUILDER_EVENT_START_AT,
    eventEndAt: LEGACY_BUILDER_EVENT_END_AT,
    iconPath: '/brand_assets/Icons/Title-Icons/legacy-ambassador-star.svg',
    iconLightPath: '/brand_assets/Icons/Title-Icons/legacy-ambassador-star-light.svg',
  }),
  Object.freeze({
    id: 'time-limited-event-presidential-circle',
    tabId: 'time-limited-event',
    categoryId: 'legacy-builder-leadership-program',
    title: 'Top Level: Presidential Circle',
    description: 'Complete the Legacy Leadership Tier Card or build 27 third-level Legacy Package members (9x3 structure).',
    requiredLegacyBuilderThirdLevelEnrollments: 27,
    allowLegacyLeadershipTierCardCompletion: true,
    rewardUsd: 0,
    rewardType: 'title',
    rewardTitleSlug: 'presidential-circle',
    rewardTitle: 'Presidential Circle',
    rewardLabel: 'Title: Presidential Circle',
    requiresActive: false,
    requiresSystemVerification: false,
    eventId: LEGACY_BUILDER_EVENT_ID,
    eventName: 'Legacy Builder Leadership Program',
    eventStartAt: LEGACY_BUILDER_EVENT_START_AT,
    eventEndAt: LEGACY_BUILDER_EVENT_END_AT,
    iconPath: '/brand_assets/Icons/Title-Icons/presidential-circle-star.svg',
    iconLightPath: '/brand_assets/Icons/Title-Icons/presidential-circle-star-light.svg',
  }),
  Object.freeze({
    id: 'premiere-journey-enroll-member',
    tabId: 'premiere-life',
    categoryId: 'premiere-journey',
    title: 'Enroll a Member',
    description: 'Enroll 1 member',
    requiredDirectSponsorsTotal: 1,
    rewardUsd: 0,
    rewardLabel: 'Merch',
    payoutSchedule: 'Claim merch',
    requiresActive: false,
    requiresSystemVerification: false,
    iconPath: '/brand_assets/Icons/Achievements/placeholder.svg',
    iconLightPath: '/brand_assets/Icons/Achievements/placeholder-light.svg',
  }),
  Object.freeze({
    id: 'rank-ruby',
    tabId: 'rank',
    categoryId: 'rank-track',
    title: 'Ruby',
    description: 'Monthly rank run reward',
    requiredRank: 'Ruby',
    requiresRank: false,
    requiredDirectSponsorsPerSide: 1,
    requiredPersonalPvBv: 50,
    requiredLegPersonalPvBv: 50,
    requiredCycles: 5,
    rewardUsd: 62.5,
    deductionPerBottleUsd: 0.40,
    requiresActive: true,
    requiresSystemVerification: true,
    payoutSchedule: 'Paid monthly after verification',
    iconPath: '/brand_assets/Icons/Achievements/ruby.svg',
    iconLightPath: '/brand_assets/Icons/Achievements/ruby-light.svg',
  }),
  Object.freeze({
    id: 'rank-emerald',
    tabId: 'rank',
    categoryId: 'rank-track',
    title: 'Emerald',
    description: 'Monthly rank run reward',
    requiredRank: 'Emerald',
    requiresRank: false,
    requiredDirectSponsorsPerSide: 1,
    requiredPersonalPvBv: 50,
    requiredLegPersonalPvBv: 50,
    requiredCycles: 10,
    rewardUsd: 125,
    deductionPerBottleUsd: 0.40,
    requiresActive: true,
    requiresSystemVerification: true,
    payoutSchedule: 'Paid monthly after verification',
    iconPath: '/brand_assets/Icons/Achievements/emerald.svg',
    iconLightPath: '/brand_assets/Icons/Achievements/emerald-light.svg',
  }),
  Object.freeze({
    id: 'rank-sapphire',
    tabId: 'rank',
    categoryId: 'rank-track',
    title: 'Sapphire',
    description: 'Monthly rank run reward',
    requiredRank: 'Sapphire',
    requiresRank: false,
    requiredDirectSponsorsPerSide: 1,
    requiredPersonalPvBv: 50,
    requiredLegPersonalPvBv: 50,
    requiredCycles: 20,
    rewardUsd: 250,
    deductionPerBottleUsd: 0.40,
    requiresActive: true,
    requiresSystemVerification: true,
    payoutSchedule: 'Paid monthly after verification',
    iconPath: '/brand_assets/Icons/Achievements/sapphire.svg',
    iconLightPath: '/brand_assets/Icons/Achievements/sapphire-light.svg',
  }),
  Object.freeze({
    id: 'rank-diamond',
    tabId: 'rank',
    categoryId: 'rank-track',
    title: 'Diamond',
    description: 'Monthly rank run reward',
    requiredRank: 'Diamond',
    requiresRank: false,
    requiredDirectSponsorsPerSide: 2,
    requiredPersonalPvBv: 100,
    requiredLegPersonalPvBv: 50,
    requiredCycles: 40,
    rewardUsd: 500,
    deductionPerBottleUsd: 0.40,
    requiresActive: true,
    requiresSystemVerification: true,
    payoutSchedule: 'Paid monthly after verification',
    iconPath: '/brand_assets/Icons/Achievements/diamond.svg',
    iconLightPath: '/brand_assets/Icons/Achievements/diamond-light.svg',
  }),
  Object.freeze({
    id: 'rank-blue-diamond',
    tabId: 'rank',
    categoryId: 'rank-track',
    title: 'Blue Diamond',
    description: 'Monthly rank run reward',
    requiredRank: 'Blue Diamond',
    requiresRank: false,
    requiredDirectSponsorsPerSide: 2,
    requiredPersonalPvBv: 100,
    requiredLegPersonalPvBv: 50,
    requiredCycles: 80,
    rewardUsd: 1000,
    deductionPerBottleUsd: 0.40,
    requiresActive: true,
    requiresSystemVerification: true,
    payoutSchedule: 'Paid monthly after verification',
    iconPath: '/brand_assets/Icons/Achievements/blue-diamond.svg',
    iconLightPath: '/brand_assets/Icons/Achievements/blue-diamond-light.svg',
  }),
  Object.freeze({
    id: 'rank-black-diamond',
    tabId: 'rank',
    categoryId: 'rank-track',
    title: 'Black Diamond',
    description: 'Monthly rank run reward',
    requiredRank: 'Black Diamond',
    requiresRank: false,
    requiredDirectSponsorsPerSide: 2,
    requiredPersonalPvBv: 100,
    requiredLegPersonalPvBv: 50,
    requiredCycles: 160,
    rewardUsd: 2000,
    deductionPerBottleUsd: 0.40,
    requiresActive: true,
    requiresSystemVerification: true,
    payoutSchedule: 'Paid monthly after verification',
    iconPath: '/brand_assets/Icons/Achievements/black-diamond.svg',
    iconLightPath: '/brand_assets/Icons/Achievements/black-diamond-light.svg',
  }),
  Object.freeze({
    id: 'rank-crown',
    tabId: 'rank',
    categoryId: 'rank-track',
    title: 'Crown',
    description: 'Monthly rank run reward',
    requiredRank: 'Crown',
    requiresRank: false,
    requiredDirectSponsorsPerSide: 3,
    requiredPersonalPvBv: 200,
    requiredLegPersonalPvBv: 50,
    requiredCycles: 320,
    rewardUsd: 4000,
    deductionPerBottleUsd: 0.40,
    requiresActive: true,
    requiresSystemVerification: true,
    payoutSchedule: 'Paid monthly after verification',
    iconPath: '/brand_assets/Icons/Achievements/crown.svg',
    iconLightPath: '/brand_assets/Icons/Achievements/crown-light.svg',
  }),
  Object.freeze({
    id: 'rank-double-crown',
    tabId: 'rank',
    categoryId: 'rank-track',
    title: 'Double Crown',
    description: 'Monthly rank run reward',
    requiredRank: 'Double Crown',
    requiresRank: false,
    requiredDirectSponsorsPerSide: 3,
    requiredPersonalPvBv: 200,
    requiredLegPersonalPvBv: 50,
    requiredCycles: 640,
    rewardUsd: 8000,
    deductionPerBottleUsd: 0.40,
    requiresActive: true,
    requiresSystemVerification: true,
    payoutSchedule: 'Paid monthly after verification',
    iconPath: '/brand_assets/Icons/Achievements/double-crown.svg',
    iconLightPath: '/brand_assets/Icons/Achievements/double-crown-light.svg',
  }),
  Object.freeze({
    id: 'rank-royal-crown',
    tabId: 'rank',
    categoryId: 'rank-track',
    title: 'Royal Crown',
    description: 'Monthly rank run reward',
    requiredRank: 'Royal Crown',
    requiresRank: false,
    requiredDirectSponsorsPerSide: 3,
    requiredPersonalPvBv: 200,
    requiredLegPersonalPvBv: 50,
    requiredCycles: 1000,
    rewardUsd: 12500,
    deductionPerBottleUsd: 0.40,
    requiresActive: true,
    requiresSystemVerification: true,
    payoutSchedule: 'Paid monthly after verification',
    iconPath: '/brand_assets/Icons/Achievements/royal-crown.svg',
    iconLightPath: '/brand_assets/Icons/Achievements/royal-crown-light.svg',
  }),
]);

const PROFILE_ACHIEVEMENT_BY_ID = new Map(
  PROFILE_ACHIEVEMENTS.map((achievement) => [achievement.id, achievement]),
);

const RANK_TRACK_ACHIEVEMENTS = Object.freeze(
  PROFILE_ACHIEVEMENTS
    .filter((achievement) => normalizeCredential(achievement?.tabId) === 'rank')
    .slice()
    .sort((left, right) => {
      const leftPair = toWholeNumber(left?.requiredDirectSponsorsPerSide, 0);
      const rightPair = toWholeNumber(right?.requiredDirectSponsorsPerSide, 0);
      if (leftPair !== rightPair) {
        return leftPair - rightPair;
      }
      const leftCycles = toWholeNumber(left?.requiredCycles, 0);
      const rightCycles = toWholeNumber(right?.requiredCycles, 0);
      if (leftCycles !== rightCycles) {
        return leftCycles - rightCycles;
      }
      return normalizeText(left?.title).localeCompare(normalizeText(right?.title));
    }),
);

const RANK_TRACK_ACHIEVEMENT_BY_ID = new Map(
  RANK_TRACK_ACHIEVEMENTS.map((achievement) => [normalizeText(achievement?.id), achievement]),
);

const RANK_PROGRESSION = Object.freeze([
  'Preferred Customer',
  'Personal',
  'Business',
  'Infinity',
  'Legacy',
  'Ruby',
  'Emerald',
  'Sapphire',
  'Diamond',
  'Blue Diamond',
  'Black Diamond',
  'Crown',
  'Double Crown',
  'Royal Crown',
]);

const RANK_INDEX_BY_KEY = new Map(
  RANK_PROGRESSION.map((label, index) => [String(label).toLowerCase(), index]),
);
const RANK_CLAIM_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
let memberTitleCatalogSeedReady = false;
let memberTitleCatalogSeedPromise = null;

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeCredential(value) {
  return normalizeText(value).toLowerCase();
}

function toWholeNumber(value, fallback = 0) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }
  return Math.max(0, Math.floor(numeric));
}

function roundCurrencyAmount(value) {
  return Math.round((Math.max(0, Number(value) || 0)) * 100) / 100;
}

function normalizePackageKey(value) {
  const normalizedPackageKey = normalizeCredential(value).replace(/[_\s]+/g, '-');
  if (LEGACY_BUILDER_PACKAGE_KEY_SET.has(normalizedPackageKey)) {
    return 'legacy-builder-pack';
  }
  return normalizedPackageKey;
}

function normalizeTitleSlug(value) {
  const normalized = normalizeCredential(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return normalized || 'untitled';
}

function formatEventDateLabel(value) {
  const parsedMs = Date.parse(normalizeText(value));
  if (!Number.isFinite(parsedMs)) {
    return '';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsedMs);
}

function resolveAchievementEventWindowState(achievement = {}, nowMs = Date.now()) {
  const eventId = normalizeText(achievement?.eventId);
  const eventName = normalizeText(achievement?.eventName);
  const eventStartAt = formatDateIso(achievement?.eventStartAt);
  const eventEndAt = formatDateIso(achievement?.eventEndAt);
  const eventStartMs = Date.parse(eventStartAt);
  const eventEndMs = Date.parse(eventEndAt);
  const hasStart = Number.isFinite(eventStartMs);
  const hasEnd = Number.isFinite(eventEndMs);
  const hasWindow = hasStart || hasEnd;

  if (!hasWindow) {
    return {
      eventId,
      eventName,
      eventStartAt: '',
      eventEndAt: '',
      hasWindow: false,
      isOpen: true,
      lockReason: '',
    };
  }

  if (hasStart && nowMs < eventStartMs) {
    return {
      eventId,
      eventName,
      eventStartAt,
      eventEndAt,
      hasWindow: true,
      isOpen: false,
      lockReason: `This event starts on ${formatEventDateLabel(eventStartAt) || 'the scheduled start date'}.`,
    };
  }

  if (hasEnd && nowMs > eventEndMs) {
    return {
      eventId,
      eventName,
      eventStartAt,
      eventEndAt,
      hasWindow: true,
      isOpen: false,
      lockReason: `This event ended on ${formatEventDateLabel(eventEndAt) || 'the scheduled end date'}.`,
    };
  }

  return {
    eventId,
    eventName,
    eventStartAt,
    eventEndAt,
    hasWindow: true,
    isOpen: true,
    lockReason: '',
  };
}

function toSignedWholeNumber(value, fallback = -1) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }
  return Math.floor(numeric);
}

function formatDateIso(value) {
  const normalized = normalizeText(value);
  if (!normalized) {
    return '';
  }

  const parsed = Date.parse(normalized);
  if (!Number.isFinite(parsed)) {
    return '';
  }

  return new Date(parsed).toISOString();
}

function isRankAdvancementAchievement(achievement = {}) {
  return normalizeCredential(achievement?.tabId) === 'rank';
}

function isTitleRewardAchievement(achievement = {}) {
  return (
    normalizeCredential(achievement?.rewardType) === 'title'
    && Boolean(normalizeText(achievement?.rewardTitle))
  );
}

function resolveAchievementRewardTitleSlug(achievement = {}) {
  return normalizeTitleSlug(achievement?.rewardTitleSlug || achievement?.rewardTitle);
}

async function ensureMemberTitleCatalogSeed() {
  if (memberTitleCatalogSeedReady) {
    return;
  }

  if (memberTitleCatalogSeedPromise) {
    return memberTitleCatalogSeedPromise;
  }

  memberTitleCatalogSeedPromise = (async () => {
    const seededTitleSlugs = new Set();
    for (const entry of DEFAULT_MEMBER_TITLE_CATALOG_SEED) {
      const titleSlug = normalizeTitleSlug(entry?.titleSlug || entry?.title);
      const title = normalizeText(entry?.title);
      if (!titleSlug || !title) {
        continue;
      }
      seededTitleSlugs.add(titleSlug);

      await upsertMemberTitleCatalogEntry({
        titleId: `ttlcat_${titleSlug}`,
        titleSlug,
        title,
        description: normalizeText(entry?.description),
        iconPath: normalizeText(entry?.iconPath),
        sourceAchievementId: normalizeText(entry?.sourceAchievementId),
        sourceEventId: normalizeText(entry?.sourceEventId),
        claimRule: normalizeText(entry?.claimRule) || 'achievement',
        isActive: entry?.isActive !== false,
        metadata: entry?.metadata && typeof entry.metadata === 'object' ? entry.metadata : {},
      });
    }

    const activeCatalogEntries = await listActiveMemberTitleCatalogEntries();
    for (const catalogEntry of activeCatalogEntries) {
      const titleSlug = normalizeTitleSlug(catalogEntry?.titleSlug || catalogEntry?.title);
      if (!titleSlug || seededTitleSlugs.has(titleSlug)) {
        continue;
      }

      const sourceEventId = normalizeText(catalogEntry?.sourceEventId);
      const managedBy = normalizeText(catalogEntry?.metadata?.managedBy).toLowerCase();
      if (sourceEventId !== LEGACY_BUILDER_EVENT_ID || managedBy !== 'system-seed') {
        continue;
      }

      await upsertMemberTitleCatalogEntry({
        titleId: normalizeText(catalogEntry?.titleId) || `ttlcat_${titleSlug}`,
        titleSlug,
        title: normalizeText(catalogEntry?.title) || titleSlug,
        description: normalizeText(catalogEntry?.description),
        iconPath: normalizeText(catalogEntry?.iconPath),
        sourceAchievementId: normalizeText(catalogEntry?.sourceAchievementId),
        sourceEventId,
        claimRule: normalizeText(catalogEntry?.claimRule) || 'achievement',
        isActive: false,
        metadata: catalogEntry?.metadata && typeof catalogEntry.metadata === 'object'
          ? catalogEntry.metadata
          : {},
      });
    }

    memberTitleCatalogSeedReady = true;
  })().catch((error) => {
    memberTitleCatalogSeedReady = false;
    throw error;
  }).finally(() => {
    if (!memberTitleCatalogSeedReady) {
      memberTitleCatalogSeedPromise = null;
    }
  });

  return memberTitleCatalogSeedPromise;
}

function resolveClaimPeriodKeyFromDate(value = Date.now()) {
  const parsedMs = typeof value === 'number'
    ? value
    : Date.parse(normalizeText(value));
  if (!Number.isFinite(parsedMs)) {
    return '';
  }

  const atDate = new Date(parsedMs);
  const year = atDate.getUTCFullYear();
  const month = atDate.getUTCMonth() + 1;
  return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}`;
}

function resolveClaimPeriodStartUtcMs(periodKeyInput = '') {
  const periodKey = normalizeText(periodKeyInput);
  const match = periodKey.match(/^(\d{4})-(\d{2})$/);
  if (!match) {
    return 0;
  }

  const year = Number.parseInt(match[1], 10);
  const monthIndex = Number.parseInt(match[2], 10) - 1;
  if (!Number.isFinite(year) || !Number.isFinite(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    return 0;
  }

  return Date.UTC(year, monthIndex, 1, 0, 0, 0, 0);
}

function resolveRankClaimWindowContext(nowInput = Date.now()) {
  const parsedMs = typeof nowInput === 'number'
    ? nowInput
    : Date.parse(normalizeText(nowInput));
  const nowMs = Number.isFinite(parsedMs) ? parsedMs : Date.now();
  const currentRunPeriodKey = resolveClaimPeriodKeyFromDate(nowMs);
  const currentRunPeriodStartMs = resolveClaimPeriodStartUtcMs(currentRunPeriodKey) || nowMs;
  const claimPeriodKey = resolveClaimPeriodKeyFromDate(Math.max(0, currentRunPeriodStartMs - 1));
  const claimWindowOpensAtMs = currentRunPeriodStartMs;
  const claimWindowExpiresAtMs = claimWindowOpensAtMs + RANK_CLAIM_WINDOW_MS;
  const claimWindowIsOpen = nowMs >= claimWindowOpensAtMs && nowMs < claimWindowExpiresAtMs;
  const claimWindowExpired = nowMs >= claimWindowExpiresAtMs;
  const claimWindowSecondsRemaining = claimWindowExpired
    ? 0
    : Math.max(0, Math.floor((claimWindowExpiresAtMs - nowMs) / 1000));

  return {
    nowMs,
    currentRunPeriodKey,
    currentRunPeriodLabel: formatClaimPeriodLabel(currentRunPeriodKey),
    claimPeriodKey,
    claimPeriodLabel: formatClaimPeriodLabel(claimPeriodKey),
    claimWindowOpensAt: claimWindowOpensAtMs > 0 ? new Date(claimWindowOpensAtMs).toISOString() : '',
    claimWindowExpiresAt: claimWindowExpiresAtMs > 0 ? new Date(claimWindowExpiresAtMs).toISOString() : '',
    claimWindowIsOpen,
    claimWindowExpired,
    claimWindowSecondsRemaining,
  };
}

function formatClaimPeriodLabel(periodKeyInput = '') {
  const periodKey = normalizeText(periodKeyInput);
  const match = periodKey.match(/^(\d{4})-(\d{2})$/);
  if (!match) {
    return '';
  }

  const year = Number.parseInt(match[1], 10);
  const monthIndex = Number.parseInt(match[2], 10) - 1;
  if (!Number.isFinite(year) || !Number.isFinite(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    return '';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, monthIndex, 1)));
}

function resolveClaimPeriodFromClaim(claim = {}) {
  const explicitClaimPeriod = normalizeText(claim?.claimPeriod);
  if (explicitClaimPeriod) {
    return explicitClaimPeriod;
  }

  if (normalizeCredential(claim?.tabId) === 'rank') {
    return resolveClaimPeriodKeyFromDate(claim?.claimedAt);
  }

  return 'lifetime';
}

function resolveAchievementClaimPeriod(achievement = {}, nowInput = Date.now()) {
  if (isRankAdvancementAchievement(achievement)) {
    return resolveClaimPeriodKeyFromDate(nowInput);
  }
  return 'lifetime';
}

function normalizeRankLabelForAchievement(value) {
  const rankLabel = normalizeText(value);
  if (!rankLabel) {
    return '';
  }

  const normalizedRank = normalizeCredential(rankLabel).replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');
  if (
    normalizedRank === 'preferred customer'
    || normalizedRank === 'preferred'
    || normalizedRank === 'free account'
    || normalizedRank === 'free'
  ) {
    return 'Preferred Customer';
  }
  if (
    normalizedRank === 'personal'
    || normalizedRank === 'personal pack'
    || normalizedRank === 'personal rank'
  ) {
    return 'Personal';
  }
  if (
    normalizedRank === 'business'
    || normalizedRank === 'business pack'
    || normalizedRank === 'business rank'
  ) {
    return 'Business';
  }
  if (
    normalizedRank === 'achievers pack'
    || normalizedRank === 'infinity'
    || normalizedRank === 'infinity pack'
    || normalizedRank === 'infinity rank'
  ) {
    return 'Infinity';
  }
  if (
    normalizedRank === 'legacy'
    || normalizedRank === 'legacy pack'
    || normalizedRank === 'legacy rank'
  ) {
    return 'Legacy';
  }
  if (normalizedRank === 'blue diamond') {
    return 'Blue Diamond';
  }
  if (normalizedRank === 'black diamond') {
    return 'Black Diamond';
  }
  if (normalizedRank === 'double crown') {
    return 'Double Crown';
  }
  if (normalizedRank === 'royal crown') {
    return 'Royal Crown';
  }
  if (normalizedRank === 'diamond') {
    return 'Diamond';
  }
  if (normalizedRank === 'crown') {
    return 'Crown';
  }
  if (normalizedRank === 'ruby') {
    return 'Ruby';
  }
  if (normalizedRank === 'emerald') {
    return 'Emerald';
  }
  if (normalizedRank === 'sapphire') {
    return 'Sapphire';
  }

  return rankLabel;
}

function resolveRankIndex(rankValue) {
  const normalizedLabel = normalizeRankLabelForAchievement(rankValue);
  if (!normalizedLabel) {
    return -1;
  }
  const lookupKey = normalizeCredential(normalizedLabel);
  return RANK_INDEX_BY_KEY.has(lookupKey) ? RANK_INDEX_BY_KEY.get(lookupKey) : -1;
}

function isRankEligibleForAchievement(currentRank, requiredRank) {
  const currentRankIndex = resolveRankIndex(currentRank);
  const requiredRankIndex = resolveRankIndex(requiredRank);
  if (currentRankIndex < 0 || requiredRankIndex < 0) {
    return false;
  }

  return currentRankIndex >= requiredRankIndex;
}

function resolveCurrentMemberRank(member = {}) {
  const rawRank = normalizeText(member?.accountRank || member?.rank);
  return normalizeRankLabelForAchievement(rawRank) || 'Unranked';
}

function resolveMemberActivityState(member = {}) {
  const activityState = resolveMemberActivityStateByPersonalBv(member);
  return {
    isActive: Boolean(activityState?.isActive),
    label: normalizeText(activityState?.label) || 'Inactive',
    activeUntilAt: normalizeText(activityState?.activeUntilAt),
  };
}

function normalizePlacementSideFromMember(member = {}) {
  const placementLeg = normalizeCredential(member?.placementLeg);
  if (
    placementLeg === 'right'
    || placementLeg === 'extreme-right'
    || placementLeg === 'extreme_right'
    || placementLeg === 'extreme right'
    || placementLeg === 'spillover-right'
    || placementLeg === 'spillover_right'
    || placementLeg === 'spillover right'
  ) {
    return 'right';
  }

  if (placementLeg === 'spillover') {
    const spilloverSide = normalizeCredential(member?.spilloverPlacementSide);
    return spilloverSide === 'right' ? 'right' : 'left';
  }

  return 'left';
}

function resolveMemberPersonalVolumeBv(member = {}) {
  return Math.max(0, toWholeNumber(resolveMemberCurrentPersonalBv(member), 0));
}

async function resolveCurrentMemberDirectSponsorSummary(member = {}) {
  const sponsorUsername = normalizeCredential(member?.username || member?.memberUsername);
  if (!sponsorUsername) {
    return {
      leftDirectSponsors: 0,
      rightDirectSponsors: 0,
      totalDirectSponsors: 0,
      leftDirectSponsorPersonalPvBv: [],
      rightDirectSponsorPersonalPvBv: [],
      packageEnrollmentsByKey: {},
      directLegacyBuilderEnrollments: 0,
      secondLevelLegacyBuilderEnrollments: 0,
      thirdLevelLegacyBuilderEnrollments: 0,
    };
  }

  try {
    const registeredMembers = await readRegisteredMembersStore();
    let leftDirectSponsors = 0;
    let rightDirectSponsors = 0;
    const leftDirectSponsorPersonalPvBv = [];
    const rightDirectSponsorPersonalPvBv = [];
    const packageEnrollmentsByKey = {};
    const sponsoredMembersBySponsorKey = new Map();

    (Array.isArray(registeredMembers) ? registeredMembers : []).forEach((entry) => {
      const entrySponsorUsername = normalizeCredential(entry?.sponsorUsername);
      if (entrySponsorUsername) {
        const bucket = sponsoredMembersBySponsorKey.get(entrySponsorUsername) || [];
        bucket.push(entry);
        sponsoredMembersBySponsorKey.set(entrySponsorUsername, bucket);
      }
      if (!entrySponsorUsername || entrySponsorUsername !== sponsorUsername) {
        return;
      }

      const placementSide = normalizePlacementSideFromMember(entry);
      const directSponsorPersonalPvBv = resolveMemberPersonalVolumeBv(entry);
      if (placementSide === 'right') {
        rightDirectSponsors += 1;
        rightDirectSponsorPersonalPvBv.push(directSponsorPersonalPvBv);
      } else {
        leftDirectSponsors += 1;
        leftDirectSponsorPersonalPvBv.push(directSponsorPersonalPvBv);
      }

      const normalizedPackageKey = normalizePackageKey(entry?.enrollmentPackage);
      if (normalizedPackageKey) {
        packageEnrollmentsByKey[normalizedPackageKey] = toWholeNumber(
          packageEnrollmentsByKey[normalizedPackageKey],
          0,
        ) + 1;
      }
    });

    const directLegacyBuilderEnrollments = Object.entries(packageEnrollmentsByKey).reduce((count, [packageKey, total]) => {
      if (!LEGACY_BUILDER_PACKAGE_KEY_SET.has(packageKey)) {
        return count;
      }
      return count + toWholeNumber(total, 0);
    }, 0);
    const countLegacyBuilderMembersAtDepth = (depthInput = 1) => {
      const depth = Math.max(1, toWholeNumber(depthInput, 1));
      let layerSponsorKeys = [sponsorUsername];
      let layerMembers = [];

      for (let level = 1; level <= depth; level += 1) {
        layerMembers = [];
        const nextLayerSponsorKeys = [];

        layerSponsorKeys.forEach((sponsorKey) => {
          const sponsoredMembers = sponsoredMembersBySponsorKey.get(sponsorKey) || [];
          sponsoredMembers.forEach((sponsoredMember) => {
            layerMembers.push(sponsoredMember);
            const sponsoredUsername = normalizeCredential(
              sponsoredMember?.memberUsername || sponsoredMember?.username,
            );
            if (sponsoredUsername) {
              nextLayerSponsorKeys.push(sponsoredUsername);
            }
          });
        });

        if (level < depth) {
          layerSponsorKeys = nextLayerSponsorKeys;
        }
      }

      return layerMembers.reduce((count, entry) => {
        const packageKey = normalizePackageKey(entry?.enrollmentPackage);
        if (!LEGACY_BUILDER_PACKAGE_KEY_SET.has(packageKey)) {
          return count;
        }
        return count + 1;
      }, 0);
    };
    const secondLevelLegacyBuilderEnrollments = countLegacyBuilderMembersAtDepth(2);
    const thirdLevelLegacyBuilderEnrollments = countLegacyBuilderMembersAtDepth(3);

    return {
      leftDirectSponsors,
      rightDirectSponsors,
      totalDirectSponsors: leftDirectSponsors + rightDirectSponsors,
      leftDirectSponsorPersonalPvBv,
      rightDirectSponsorPersonalPvBv,
      packageEnrollmentsByKey,
      directLegacyBuilderEnrollments,
      secondLevelLegacyBuilderEnrollments,
      thirdLevelLegacyBuilderEnrollments,
    };
  } catch {
    return {
      leftDirectSponsors: 0,
      rightDirectSponsors: 0,
      totalDirectSponsors: 0,
      leftDirectSponsorPersonalPvBv: [],
      rightDirectSponsorPersonalPvBv: [],
      packageEnrollmentsByKey: {},
      directLegacyBuilderEnrollments: 0,
      secondLevelLegacyBuilderEnrollments: 0,
      thirdLevelLegacyBuilderEnrollments: 0,
    };
  }
}

async function resolveCurrentMemberCycleCount(member = {}) {
  const activityState = resolveMemberActivityState(member);
  if (!activityState.isActive) {
    return 0;
  }

  const fallbackCycles = toWholeNumber(member?.starterTotalCycles, 0);

  const userId = normalizeText(member?.id);
  const username = normalizeText(member?.username);
  const email = normalizeText(member?.email);
  if (!userId && !username && !email) {
    return fallbackCycles;
  }

  try {
    const metricsResult = await getBinaryTreeMetrics({ userId, username, email });
    const snapshotCycles = toWholeNumber(metricsResult?.data?.snapshot?.totalCycles, 0);
    return Math.max(fallbackCycles, snapshotCycles);
  } catch {
    return fallbackCycles;
  }
}

async function resolveCurrentMemberProgressContext(member = {}) {
  const currentRank = resolveCurrentMemberRank(member);
  const [currentCycles, directSponsorSummary] = await Promise.all([
    resolveCurrentMemberCycleCount(member),
    resolveCurrentMemberDirectSponsorSummary(member),
  ]);
  const activityState = resolveMemberActivityState(member);
  const currentPersonalPvBv = resolveMemberPersonalVolumeBv(member);
  const currentEnrollmentPackageKey = normalizePackageKey(
    member?.enrollmentPackage
    || member?.enrollmentPackageKey
    || member?.accountPackage,
  );
  const upgradedToLegacyPackageKey = normalizePackageKey(member?.lastAccountUpgradeToPackage);
  const hasLegacyPackageOwnership = (
    LEGACY_BUILDER_PACKAGE_KEY_SET.has(currentEnrollmentPackageKey)
    || LEGACY_BUILDER_PACKAGE_KEY_SET.has(upgradedToLegacyPackageKey)
  );
  const legacyLeadershipTierCardCompleted = Boolean(
    member?.legacyLeadershipTierCardCompleted
    || member?.legacyLeadershipTierCompleted
    || normalizeCredential(member?.legacyLeadershipTierCardStatus) === 'completed'
    || normalizeCredential(member?.legacyLeadershipTierStatus) === 'completed',
  );

  return {
    currentRank,
    currentCycles,
    currentPersonalPvBv,
    ...directSponsorSummary,
    currentEnrollmentPackageKey,
    hasLegacyPackageOwnership,
    legacyLeadershipTierCardCompleted,
    activityState,
  };
}

function mapClaimsByAchievementId(claims = [], options = {}) {
  const rankClaimPeriod = normalizeText(options?.rankClaimPeriod);
  const claimMap = new Map();

  (Array.isArray(claims) ? claims : []).forEach((claim) => {
    const achievementId = normalizeText(claim?.achievementId);
    const claimTabId = normalizeCredential(claim?.tabId);
    const claimPeriod = resolveClaimPeriodFromClaim(claim);
    if (
      claimTabId === 'rank'
      && rankClaimPeriod
      && claimPeriod !== rankClaimPeriod
    ) {
      return;
    }
    if (!achievementId || claimMap.has(achievementId)) {
      return;
    }

    claimMap.set(achievementId, {
      claimId: normalizeText(claim?.claimId),
      claimPeriod,
      claimedAt: formatDateIso(claim?.claimedAt),
      rewardAmount: roundCurrencyAmount(claim?.rewardAmount),
    });
  });

  return claimMap;
}

function resolveCurrentPeriodRankClaim(claims = [], rankClaimPeriod = '') {
  const safeRankClaimPeriod = normalizeText(rankClaimPeriod);
  if (!safeRankClaimPeriod) {
    return null;
  }

  return (Array.isArray(claims) ? claims : []).find((claim) => (
    normalizeCredential(claim?.tabId) === 'rank'
    && resolveClaimPeriodFromClaim(claim) === safeRankClaimPeriod
  )) || null;
}

function resolveHighestRankAchievementByRankIndex(rankIndexInput = -1) {
  const rankIndex = Math.max(-1, toSignedWholeNumber(rankIndexInput, -1));
  let highestRankAchievement = null;

  RANK_TRACK_ACHIEVEMENTS.forEach((achievement) => {
    const achievementRankIndex = resolveRankIndex(achievement?.title || achievement?.requiredRank);
    if (achievementRankIndex >= 0 && rankIndex >= achievementRankIndex) {
      highestRankAchievement = achievement;
    }
  });

  return highestRankAchievement;
}

function resolveHighestEligibleRankAchievement(progressContext = {}) {
  let highestEligibleAchievement = null;

  RANK_TRACK_ACHIEVEMENTS.forEach((achievement) => {
    const eligibility = evaluateAchievementEligibility(achievement, progressContext, null, {
      rankMonthlyContext: {
        currentPeriodLabel: '',
        highestEligibleRankAchievementId: '',
        highestEligibleRankTitle: '',
        claimedRankClaim: null,
      },
    });
    if (eligibility.eligible) {
      highestEligibleAchievement = achievement;
    }
  });

  return highestEligibleAchievement;
}

async function resolveRankMonthlyRunProgress(member = {}, progressContext = {}, rankClaimPeriod = '') {
  const safeRankClaimPeriod = normalizeText(rankClaimPeriod) || resolveClaimPeriodKeyFromDate(Date.now());
  const userId = normalizeText(member?.id);
  const currentHighestEligibleRankAchievement = resolveHighestEligibleRankAchievement(progressContext);
  const currentHighestEligibleRankIndex = resolveRankIndex(
    currentHighestEligibleRankAchievement?.title || currentHighestEligibleRankAchievement?.requiredRank,
  );

  let persistedProgress = null;
  if (userId && safeRankClaimPeriod) {
    try {
      persistedProgress = await upsertMemberRankAdvancementMonthlyHighest({
        userId,
        periodKey: safeRankClaimPeriod,
        highestRank: normalizeText(
          currentHighestEligibleRankAchievement?.title
          || currentHighestEligibleRankAchievement?.requiredRank,
        ),
        highestRankIndex: currentHighestEligibleRankIndex,
        highestRankAchievementId: normalizeText(currentHighestEligibleRankAchievement?.id),
        highestRequiredCycles: toWholeNumber(currentHighestEligibleRankAchievement?.requiredCycles, 0),
      });
    } catch {
      persistedProgress = null;
    }
  }

  const persistedHighestRankIndex = Math.max(
    -1,
    toSignedWholeNumber(persistedProgress?.highestRankIndex, currentHighestEligibleRankIndex),
  );
  const persistedHighestAchievementId = normalizeText(persistedProgress?.highestRankAchievementId);
  const persistedHighestRankLabel = normalizeRankLabelForAchievement(persistedProgress?.highestRank);

  let highestRecordedRankAchievement = persistedHighestAchievementId
    ? (RANK_TRACK_ACHIEVEMENT_BY_ID.get(persistedHighestAchievementId) || null)
    : null;

  if (!highestRecordedRankAchievement && persistedHighestRankLabel) {
    highestRecordedRankAchievement = RANK_TRACK_ACHIEVEMENTS.find((achievement) => {
      const achievementRankLabel = normalizeRankLabelForAchievement(
        achievement?.title || achievement?.requiredRank,
      );
      return achievementRankLabel && achievementRankLabel === persistedHighestRankLabel;
    }) || null;
  }

  if (!highestRecordedRankAchievement) {
    highestRecordedRankAchievement = resolveHighestRankAchievementByRankIndex(persistedHighestRankIndex);
  }

  if (!highestRecordedRankAchievement && currentHighestEligibleRankAchievement) {
    highestRecordedRankAchievement = currentHighestEligibleRankAchievement;
  }

  const highestRecordedRankIndex = highestRecordedRankAchievement
    ? resolveRankIndex(highestRecordedRankAchievement?.title || highestRecordedRankAchievement?.requiredRank)
    : persistedHighestRankIndex;

  return {
    rankClaimPeriod: safeRankClaimPeriod,
    currentHighestEligibleRankAchievementId: normalizeText(currentHighestEligibleRankAchievement?.id),
    currentHighestEligibleRankTitle: normalizeText(currentHighestEligibleRankAchievement?.title),
    currentHighestEligibleRankIndex,
    highestRecordedRankAchievementId: normalizeText(highestRecordedRankAchievement?.id),
    highestRecordedRankTitle: normalizeText(
      highestRecordedRankAchievement?.title || highestRecordedRankAchievement?.requiredRank,
    ),
    highestRecordedRankIndex,
    highestRecordedRequiredCycles: toWholeNumber(highestRecordedRankAchievement?.requiredCycles, 0),
    highestRecordedAt: formatDateIso(persistedProgress?.highestAchievedAt),
  };
}

async function resolveRankClaimProgressForPeriod(userIdInput = '', rankClaimPeriod = '') {
  const userId = normalizeText(userIdInput);
  const safeRankClaimPeriod = normalizeText(rankClaimPeriod);
  if (!userId || !safeRankClaimPeriod) {
    return {
      rankClaimPeriod: safeRankClaimPeriod,
      highestRecordedRankAchievementId: '',
      highestRecordedRankTitle: '',
      highestRecordedRankIndex: -1,
      highestRecordedRequiredCycles: 0,
      highestRecordedAt: '',
    };
  }

  let persistedProgress = null;
  try {
    persistedProgress = await readMemberRankAdvancementMonthlyProgress(userId, safeRankClaimPeriod);
  } catch {
    persistedProgress = null;
  }

  const persistedHighestRankIndex = Math.max(
    -1,
    toSignedWholeNumber(persistedProgress?.highestRankIndex, -1),
  );
  const persistedHighestAchievementId = normalizeText(persistedProgress?.highestRankAchievementId);
  const persistedHighestRankLabel = normalizeRankLabelForAchievement(persistedProgress?.highestRank);

  let highestRecordedRankAchievement = persistedHighestAchievementId
    ? (RANK_TRACK_ACHIEVEMENT_BY_ID.get(persistedHighestAchievementId) || null)
    : null;

  if (!highestRecordedRankAchievement && persistedHighestRankLabel) {
    highestRecordedRankAchievement = RANK_TRACK_ACHIEVEMENTS.find((achievement) => {
      const achievementRankLabel = normalizeRankLabelForAchievement(
        achievement?.title || achievement?.requiredRank,
      );
      return achievementRankLabel && achievementRankLabel === persistedHighestRankLabel;
    }) || null;
  }

  if (!highestRecordedRankAchievement && persistedHighestRankIndex >= 0) {
    highestRecordedRankAchievement = resolveHighestRankAchievementByRankIndex(persistedHighestRankIndex);
  }

  const highestRecordedRankIndex = highestRecordedRankAchievement
    ? resolveRankIndex(highestRecordedRankAchievement?.title || highestRecordedRankAchievement?.requiredRank)
    : persistedHighestRankIndex;

  return {
    rankClaimPeriod: safeRankClaimPeriod,
    highestRecordedRankAchievementId: normalizeText(highestRecordedRankAchievement?.id),
    highestRecordedRankTitle: normalizeText(
      highestRecordedRankAchievement?.title || highestRecordedRankAchievement?.requiredRank,
    ),
    highestRecordedRankIndex,
    highestRecordedRequiredCycles: toWholeNumber(highestRecordedRankAchievement?.requiredCycles, 0),
    highestRecordedAt: formatDateIso(persistedProgress?.highestAchievedAt),
  };
}

async function maybeApplyMonthlyRankPromotion(member = {}, options = {}) {
  const userId = normalizeText(member?.id);
  if (!userId) {
    return member;
  }

  const rankClaimWindow = resolveRankClaimWindowContext(options?.nowMs ?? Date.now());
  const promotionPeriodKey = normalizeText(rankClaimWindow?.claimPeriodKey);
  if (!promotionPeriodKey) {
    return member;
  }

  const promotionProgress = await resolveRankClaimProgressForPeriod(userId, promotionPeriodKey);
  const promotedRank = normalizeRankLabelForAchievement(promotionProgress?.highestRecordedRankTitle);
  const promotedRankIndex = resolveRankIndex(promotedRank);
  if (promotedRankIndex < 0) {
    return member;
  }

  const currentRank = resolveCurrentMemberRank(member);
  const currentRankIndex = resolveRankIndex(currentRank);
  if (currentRankIndex >= promotedRankIndex) {
    return member;
  }

  let updatedMember = null;
  try {
    updatedMember = await updateUserById(userId, (existingUser = {}) => ({
      ...existingUser,
      rank: promotedRank,
      accountRank: promotedRank,
    }));
  } catch {
    updatedMember = null;
  }

  const effectiveMember = updatedMember && typeof updatedMember === 'object'
    ? updatedMember
    : {
      ...member,
      rank: promotedRank,
      accountRank: promotedRank,
    };
  const identityUsername = normalizeCredential(effectiveMember?.username || member?.username);
  const identityEmail = normalizeCredential(effectiveMember?.email || member?.email);

  try {
    const registeredMembers = await readRegisteredMembersStore();
    const matchedMembers = registeredMembers.filter((entry) => {
      const entryUserId = normalizeText(entry?.userId || entry?.id);
      if (entryUserId && entryUserId === userId) {
        return true;
      }

      const entryUsername = normalizeCredential(entry?.memberUsername || entry?.username);
      if (identityUsername && entryUsername && entryUsername === identityUsername) {
        return true;
      }

      const entryEmail = normalizeCredential(entry?.email);
      return Boolean(identityEmail && entryEmail && entryEmail === identityEmail);
    });

    for (const matchedMember of matchedMembers) {
      await upsertRegisteredMemberRecord({
        ...matchedMember,
        rank: promotedRank,
        accountRank: promotedRank,
      });
    }
  } catch {
    // Keep rank promotion resilient even if tree mirror sync fails.
  }

  return effectiveMember;
}

function resolveRankMonthlyClaimContext(
  progressContext = {},
  claims = [],
  rankClaimPeriod = '',
  options = {},
) {
  const safeRankClaimPeriod = normalizeText(rankClaimPeriod);
  const currentPeriodLabel = formatClaimPeriodLabel(safeRankClaimPeriod) || 'the previous month';
  const claimedRankClaim = resolveCurrentPeriodRankClaim(claims, safeRankClaimPeriod);
  const rankClaimProgress = options?.rankClaimProgress && typeof options.rankClaimProgress === 'object'
    ? options.rankClaimProgress
    : {};
  const rankClaimWindow = options?.rankClaimWindow && typeof options.rankClaimWindow === 'object'
    ? options.rankClaimWindow
    : resolveRankClaimWindowContext(Date.now());
  const rankRunProgress = options?.rankRunProgress && typeof options.rankRunProgress === 'object'
    ? options.rankRunProgress
    : {};
  const highestRecordedRankAchievementId = normalizeText(
    rankClaimProgress?.highestRecordedRankAchievementId
    || rankRunProgress?.highestRecordedRankAchievementId,
  );
  const highestRecordedRankTitle = normalizeText(
    rankClaimProgress?.highestRecordedRankTitle
    || rankRunProgress?.highestRecordedRankTitle,
  );
  const highestRecordedRankIndex = Math.max(
    -1,
    toSignedWholeNumber(
      rankClaimProgress?.highestRecordedRankIndex,
      toSignedWholeNumber(rankRunProgress?.highestRecordedRankIndex, -1),
    ),
  );
  const claimWindowOpensAt = normalizeText(rankClaimWindow?.claimWindowOpensAt);
  const claimWindowExpiresAt = normalizeText(rankClaimWindow?.claimWindowExpiresAt);
  const claimWindowExpired = Boolean(rankClaimWindow?.claimWindowExpired);
  const claimWindowIsOpen = Boolean(rankClaimWindow?.claimWindowIsOpen) && !claimWindowExpired;
  const claimWindowSecondsRemaining = claimWindowExpired
    ? 0
    : Math.max(0, toWholeNumber(rankClaimWindow?.claimWindowSecondsRemaining, 0));

  return {
    rankClaimPeriod: safeRankClaimPeriod,
    currentPeriodLabel,
    claimedRankClaim,
    highestEligibleRankAchievementId: highestRecordedRankAchievementId,
    highestEligibleRankTitle: highestRecordedRankTitle,
    highestRecordedRankIndex,
    claimWindowIsOpen,
    claimWindowExpired,
    claimWindowOpensAt,
    claimWindowExpiresAt,
    claimWindowSecondsRemaining,
    claimWindowPeriodKey: normalizeText(rankClaimWindow?.claimPeriodKey),
    claimWindowPeriodLabel: normalizeText(rankClaimWindow?.claimPeriodLabel),
  };
}

function evaluateAchievementEligibility(achievement = {}, progressContext = {}, claim = null, options = {}) {
  const requiredRank = normalizeRankLabelForAchievement(achievement?.requiredRank);
  const requiresRank = Boolean(requiredRank) && achievement?.requiresRank !== false;
  const requiredDirectSponsorsTotal = toWholeNumber(achievement?.requiredDirectSponsorsTotal, 0);
  const requiredDirectSponsorsPerSide = toWholeNumber(achievement?.requiredDirectSponsorsPerSide, 0);
  const requiredCycles = toWholeNumber(achievement?.requiredCycles, 0);
  const requiredPersonalPvBv = toWholeNumber(achievement?.requiredPersonalPvBv, 0);
  const requiredLegPersonalPvBv = toWholeNumber(achievement?.requiredLegPersonalPvBv, 0);
  const requiresLegacyPackageOwnership = achievement?.requiresLegacyPackageOwnership === true;
  const requiredLegacyBuilderDirectEnrollments = toWholeNumber(
    achievement?.requiredLegacyBuilderDirectEnrollments,
    0,
  );
  const requiredLegacyBuilderSecondLevelEnrollments = toWholeNumber(
    achievement?.requiredLegacyBuilderSecondLevelEnrollments,
    0,
  );
  const requiredLegacyBuilderThirdLevelEnrollments = toWholeNumber(
    achievement?.requiredLegacyBuilderThirdLevelEnrollments,
    0,
  );
  const allowLegacyLeadershipTierCardCompletion = achievement?.allowLegacyLeadershipTierCardCompletion === true;
  const requiredPackageEnrollments = (Array.isArray(achievement?.requiredPackageEnrollments)
    ? achievement.requiredPackageEnrollments
    : [])
    .map((entry) => {
      const packageKey = normalizePackageKey(entry?.packageKey || entry?.id);
      const required = Math.max(0, toWholeNumber(entry?.required, 0));
      const packageLabel = normalizeText(entry?.label || entry?.packageLabel || packageKey || 'Package');
      return {
        packageKey,
        packageLabel,
        required,
      };
    })
    .filter((entry) => entry.packageKey && entry.required > 0);
  const requiresActive = achievement?.requiresActive === true;
  const requiresSystemVerification = achievement?.requiresSystemVerification === true;
  const isRankTrack = isRankAdvancementAchievement(achievement);
  const eventWindowState = resolveAchievementEventWindowState(achievement);
  const rankMonthlyContext = options?.rankMonthlyContext && typeof options.rankMonthlyContext === 'object'
    ? options.rankMonthlyContext
    : {};
  const currentPeriodLabel = normalizeText(rankMonthlyContext?.currentPeriodLabel) || 'this month';
  const highestEligibleRankAchievementId = normalizeText(rankMonthlyContext?.highestEligibleRankAchievementId);
  const highestEligibleRankTitle = normalizeText(rankMonthlyContext?.highestEligibleRankTitle);
  const highestRecordedRankIndex = Math.max(
    -1,
    toSignedWholeNumber(rankMonthlyContext?.highestRecordedRankIndex, -1),
  );
  const claimedRankClaim = rankMonthlyContext?.claimedRankClaim && typeof rankMonthlyContext.claimedRankClaim === 'object'
    ? rankMonthlyContext.claimedRankClaim
    : null;
  const claimWindowIsOpen = rankMonthlyContext?.claimWindowIsOpen !== false;
  const claimWindowExpired = Boolean(rankMonthlyContext?.claimWindowExpired);
  const claimWindowOpensAt = normalizeText(rankMonthlyContext?.claimWindowOpensAt);
  const claimWindowExpiresAt = normalizeText(rankMonthlyContext?.claimWindowExpiresAt);
  const claimWindowSecondsRemaining = claimWindowExpired
    ? 0
    : Math.max(0, toWholeNumber(rankMonthlyContext?.claimWindowSecondsRemaining, 0));

  const currentRank = normalizeRankLabelForAchievement(progressContext?.currentRank) || 'Unranked';
  const currentLeftDirectSponsors = toWholeNumber(progressContext?.leftDirectSponsors, 0);
  const currentRightDirectSponsors = toWholeNumber(progressContext?.rightDirectSponsors, 0);
  const currentDirectSponsorsTotal = toWholeNumber(
    progressContext?.totalDirectSponsors,
    currentLeftDirectSponsors + currentRightDirectSponsors,
  );
  const currentCycles = toWholeNumber(progressContext?.currentCycles, 0);
  const currentPersonalPvBv = Math.max(
    0,
    toWholeNumber(progressContext?.currentPersonalPvBv, 0),
  );
  const leftDirectSponsorPersonalPvBv = Array.isArray(progressContext?.leftDirectSponsorPersonalPvBv)
    ? progressContext.leftDirectSponsorPersonalPvBv.map((value) => Math.max(0, toWholeNumber(value, 0)))
    : [];
  const rightDirectSponsorPersonalPvBv = Array.isArray(progressContext?.rightDirectSponsorPersonalPvBv)
    ? progressContext.rightDirectSponsorPersonalPvBv.map((value) => Math.max(0, toWholeNumber(value, 0)))
    : [];
  const currentLeftQualifiedPersonalPvSponsors = requiredLegPersonalPvBv > 0
    ? leftDirectSponsorPersonalPvBv.filter((value) => value >= requiredLegPersonalPvBv).length
    : leftDirectSponsorPersonalPvBv.length;
  const currentRightQualifiedPersonalPvSponsors = requiredLegPersonalPvBv > 0
    ? rightDirectSponsorPersonalPvBv.filter((value) => value >= requiredLegPersonalPvBv).length
    : rightDirectSponsorPersonalPvBv.length;
  const activityState = progressContext?.activityState && typeof progressContext.activityState === 'object'
    ? progressContext.activityState
    : { isActive: false, label: 'Inactive', activeUntilAt: '' };
  const packageEnrollmentsByKey = progressContext?.packageEnrollmentsByKey && typeof progressContext.packageEnrollmentsByKey === 'object'
    ? progressContext.packageEnrollmentsByKey
    : {};
  const hasLegacyPackageOwnership = (
    Boolean(progressContext?.hasLegacyPackageOwnership)
    || LEGACY_BUILDER_PACKAGE_KEY_SET.has(normalizePackageKey(progressContext?.currentEnrollmentPackageKey))
  );
  const currentLegacyBuilderDirectEnrollments = Math.max(
    0,
    toWholeNumber(
      progressContext?.directLegacyBuilderEnrollments,
      packageEnrollmentsByKey['legacy-builder-pack'],
    ),
  );
  const currentLegacyBuilderSecondLevelEnrollments = Math.max(
    0,
    toWholeNumber(progressContext?.secondLevelLegacyBuilderEnrollments, 0),
  );
  const currentLegacyBuilderThirdLevelEnrollments = Math.max(
    0,
    toWholeNumber(progressContext?.thirdLevelLegacyBuilderEnrollments, 0),
  );
  const legacyLeadershipTierCardCompleted = Boolean(progressContext?.legacyLeadershipTierCardCompleted);
  const achievementRankIndex = resolveRankIndex(achievement?.title || achievement?.requiredRank);
  const meetsMonthlyRecordedRankRun = (
    isRankTrack
    && achievementRankIndex >= 0
    && highestRecordedRankIndex >= achievementRankIndex
  );

  const alreadyClaimed = Boolean(claim?.claimedAt);
  const meetsRankRequirement = requiresRank
    ? isRankEligibleForAchievement(currentRank, requiredRank)
    : true;
  const meetsDirectSponsorTotalRequirementNow = requiredDirectSponsorsTotal > 0
    ? currentDirectSponsorsTotal >= requiredDirectSponsorsTotal
    : true;
  const meetsDirectSponsorRequirementNow = requiredDirectSponsorsPerSide > 0
    ? (
      currentLeftDirectSponsors >= requiredDirectSponsorsPerSide
      && currentRightDirectSponsors >= requiredDirectSponsorsPerSide
    )
    : true;
  const meetsCycleRequirementNow = requiredCycles > 0
    ? currentCycles >= requiredCycles
    : true;
  const meetsPersonalPvRequirementNow = requiredPersonalPvBv > 0
    ? currentPersonalPvBv >= requiredPersonalPvBv
    : true;
  const meetsLegPersonalPvRequirementNow = requiredLegPersonalPvBv > 0
    ? (
      currentLeftQualifiedPersonalPvSponsors >= requiredDirectSponsorsPerSide
      && currentRightQualifiedPersonalPvSponsors >= requiredDirectSponsorsPerSide
    )
    : true;
  const packageEnrollmentSnapshot = requiredPackageEnrollments.map((entry) => {
    const current = Math.max(0, toWholeNumber(packageEnrollmentsByKey[entry.packageKey], 0));
    return {
      packageKey: entry.packageKey,
      packageLabel: entry.packageLabel,
      required: entry.required,
      current,
      met: current >= entry.required,
    };
  });
  const meetsPackageEnrollmentRequirementNow = packageEnrollmentSnapshot.every((entry) => entry.met);
  const meetsLegacyPackageOwnershipRequirementNow = requiresLegacyPackageOwnership
    ? hasLegacyPackageOwnership
    : true;
  const meetsLegacyBuilderDirectRequirementNow = requiredLegacyBuilderDirectEnrollments > 0
    ? currentLegacyBuilderDirectEnrollments >= requiredLegacyBuilderDirectEnrollments
    : true;
  const meetsLegacyBuilderSecondLevelRequirementNow = requiredLegacyBuilderSecondLevelEnrollments > 0
    ? currentLegacyBuilderSecondLevelEnrollments >= requiredLegacyBuilderSecondLevelEnrollments
    : true;
  const meetsLegacyBuilderThirdThresholdNow = requiredLegacyBuilderThirdLevelEnrollments > 0
    ? currentLegacyBuilderThirdLevelEnrollments >= requiredLegacyBuilderThirdLevelEnrollments
    : true;
  const meetsLegacyBuilderThirdLevelRequirementNow = requiredLegacyBuilderThirdLevelEnrollments > 0
    ? (
      allowLegacyLeadershipTierCardCompletion
        ? (legacyLeadershipTierCardCompleted || meetsLegacyBuilderThirdThresholdNow)
        : meetsLegacyBuilderThirdThresholdNow
    )
    : true;
  const meetsActiveRequirementNow = requiresActive
    ? Boolean(activityState.isActive)
    : true;
  const meetsDirectSponsorTotalRequirement = meetsMonthlyRecordedRankRun
    ? true
    : meetsDirectSponsorTotalRequirementNow;
  const meetsDirectSponsorRequirement = meetsMonthlyRecordedRankRun
    ? true
    : meetsDirectSponsorRequirementNow;
  const meetsCycleRequirement = meetsMonthlyRecordedRankRun
    ? true
    : meetsCycleRequirementNow;
  const meetsPersonalPvRequirement = meetsMonthlyRecordedRankRun
    ? true
    : meetsPersonalPvRequirementNow;
  const meetsLegPersonalPvRequirement = meetsMonthlyRecordedRankRun
    ? true
    : meetsLegPersonalPvRequirementNow;
  const meetsPackageEnrollmentRequirement = meetsMonthlyRecordedRankRun
    ? true
    : meetsPackageEnrollmentRequirementNow;
  const meetsLegacyPackageOwnershipRequirement = meetsMonthlyRecordedRankRun
    ? true
    : meetsLegacyPackageOwnershipRequirementNow;
  const meetsLegacyBuilderDirectRequirement = meetsMonthlyRecordedRankRun
    ? true
    : meetsLegacyBuilderDirectRequirementNow;
  const meetsLegacyBuilderSecondLevelRequirement = meetsMonthlyRecordedRankRun
    ? true
    : meetsLegacyBuilderSecondLevelRequirementNow;
  const meetsLegacyBuilderThirdLevelRequirement = meetsMonthlyRecordedRankRun
    ? true
    : meetsLegacyBuilderThirdLevelRequirementNow;
  const meetsActiveRequirement = meetsActiveRequirementNow;

  const baseRequirementsMet = (
    meetsRankRequirement
    && meetsDirectSponsorTotalRequirement
    && meetsDirectSponsorRequirement
    && meetsCycleRequirement
    && meetsPersonalPvRequirement
    && meetsLegPersonalPvRequirement
    && meetsPackageEnrollmentRequirement
    && meetsLegacyPackageOwnershipRequirement
    && meetsLegacyBuilderDirectRequirement
    && meetsLegacyBuilderSecondLevelRequirement
    && meetsLegacyBuilderThirdLevelRequirement
    && meetsActiveRequirement
  );
  const systemVerified = alreadyClaimed
    ? true
    : (requiresSystemVerification ? baseRequirementsMet : true);
  let eligible = alreadyClaimed
    ? true
    : (baseRequirementsMet && systemVerified && eventWindowState.isOpen);
  let status = alreadyClaimed
    ? 'claimed'
    : (eligible ? 'eligible' : 'locked');
  if (!alreadyClaimed && isRankTrack && (!claimWindowIsOpen || claimWindowExpired)) {
    eligible = false;
    status = 'locked';
  }

  const requirements = [];
  if (requiresRank) {
    requirements.push({
      id: 'rank',
      label: `Reach ${requiredRank} rank`,
      met: meetsRankRequirement,
      current: currentRank,
      required: requiredRank,
    });
  }
  if (requiredDirectSponsorsPerSide > 0) {
    requirements.push({
      id: 'direct-sponsor-pairs',
      label: `Enroll ${requiredDirectSponsorsPerSide.toLocaleString()} direct sponsors on Left and ${requiredDirectSponsorsPerSide.toLocaleString()} direct sponsors on Right`,
      met: meetsDirectSponsorRequirement,
      current: {
        left: currentLeftDirectSponsors,
        right: currentRightDirectSponsors,
        total: currentDirectSponsorsTotal,
      },
      required: {
        left: requiredDirectSponsorsPerSide,
        right: requiredDirectSponsorsPerSide,
      },
    });
  }
  if (requiredDirectSponsorsTotal > 0) {
    requirements.push({
      id: 'direct-sponsors-total',
      label: `Enroll ${requiredDirectSponsorsTotal.toLocaleString()} member${requiredDirectSponsorsTotal === 1 ? '' : 's'}`,
      met: meetsDirectSponsorTotalRequirement,
      current: currentDirectSponsorsTotal,
      required: requiredDirectSponsorsTotal,
    });
  }
  if (requiredCycles > 0) {
    requirements.push({
      id: 'cycles',
      label: `Complete ${requiredCycles.toLocaleString()} cycles`,
      met: meetsCycleRequirement,
      current: currentCycles,
      required: requiredCycles,
    });
  }
  if (requiredPersonalPvBv > 0) {
    requirements.push({
      id: 'personal-pv-bv',
      label: `Maintain at least ${requiredPersonalPvBv.toLocaleString()} BV personal volume`,
      met: meetsPersonalPvRequirement,
      current: currentPersonalPvBv,
      required: requiredPersonalPvBv,
    });
  }
  if (requiredLegPersonalPvBv > 0) {
    requirements.push({
      id: 'leg-personal-pv-bv',
      label: `Maintain ${requiredDirectSponsorsPerSide.toLocaleString()} qualified direct sponsor${requiredDirectSponsorsPerSide === 1 ? '' : 's'} per side at ${requiredLegPersonalPvBv.toLocaleString()} BV personal volume`,
      met: meetsLegPersonalPvRequirement,
      current: {
        leftQualified: currentLeftQualifiedPersonalPvSponsors,
        rightQualified: currentRightQualifiedPersonalPvSponsors,
      },
      required: {
        perSide: requiredDirectSponsorsPerSide,
        minPersonalPvBv: requiredLegPersonalPvBv,
      },
    });
  }
  packageEnrollmentSnapshot.forEach((entry) => {
    requirements.push({
      id: `package-enrollment-${entry.packageKey}`,
      label: `Enroll ${entry.required.toLocaleString()} ${entry.packageLabel}`,
      met: entry.met,
      packageKey: entry.packageKey,
      current: entry.current,
      required: entry.required,
    });
  });
  if (requiresLegacyPackageOwnership) {
    requirements.push({
      id: 'legacy-package-self',
      label: 'Enroll or upgrade to Legacy Package',
      met: meetsLegacyPackageOwnershipRequirement,
      current: hasLegacyPackageOwnership ? 'Legacy Package' : 'Not Legacy Package',
      required: 'Legacy Package',
    });
  }
  if (requiredLegacyBuilderDirectEnrollments > 0) {
    requirements.push({
      id: 'legacy-builder-direct',
      label: `Enroll ${requiredLegacyBuilderDirectEnrollments.toLocaleString()} Legacy Builder Package member${requiredLegacyBuilderDirectEnrollments === 1 ? '' : 's'}`,
      met: meetsLegacyBuilderDirectRequirement,
      current: currentLegacyBuilderDirectEnrollments,
      required: requiredLegacyBuilderDirectEnrollments,
    });
  }
  if (requiredLegacyBuilderSecondLevelEnrollments > 0) {
    requirements.push({
      id: 'legacy-builder-second-level',
      label: `Build ${requiredLegacyBuilderSecondLevelEnrollments.toLocaleString()} second-level Legacy Package members (3 personally enrolled Legacy Builder members each enroll 3 Legacy Package members).`,
      met: meetsLegacyBuilderSecondLevelRequirement,
      current: currentLegacyBuilderSecondLevelEnrollments,
      required: requiredLegacyBuilderSecondLevelEnrollments,
    });
  }
  if (requiredLegacyBuilderThirdLevelEnrollments > 0) {
    requirements.push({
      id: 'legacy-builder-third-level',
      label: allowLegacyLeadershipTierCardCompletion
        ? `Complete Legacy Leadership Tier Card or build ${requiredLegacyBuilderThirdLevelEnrollments.toLocaleString()} third-level Legacy Package members (9x3 structure).`
        : `Build ${requiredLegacyBuilderThirdLevelEnrollments.toLocaleString()} third-level Legacy Package members.`,
      met: meetsLegacyBuilderThirdLevelRequirement,
      current: currentLegacyBuilderThirdLevelEnrollments,
      required: requiredLegacyBuilderThirdLevelEnrollments,
      alternateMet: allowLegacyLeadershipTierCardCompletion ? legacyLeadershipTierCardCompleted : false,
    });
  }

  const prerequisites = [];
  if (requiresActive) {
    prerequisites.push({
      id: 'active',
      label: 'Must be Active',
      met: meetsActiveRequirement,
    });
  }
  if (requiresSystemVerification) {
    prerequisites.push({
      id: 'system-verification',
      label: 'Verified by system',
      met: systemVerified,
    });
  }
  if (eventWindowState.hasWindow) {
    prerequisites.push({
      id: 'event-window',
      label: normalizeText(eventWindowState.eventName) || 'Time-Limited Event',
      met: eventWindowState.isOpen,
      startsAt: eventWindowState.eventStartAt,
      endsAt: eventWindowState.eventEndAt,
    });
  }
  if (isRankTrack && claimWindowExpiresAt) {
    prerequisites.push({
      id: 'rank-claim-window',
      label: 'Claim window (30 days after monthly cutoff)',
      met: claimWindowIsOpen && !claimWindowExpired,
      startsAt: claimWindowOpensAt,
      endsAt: claimWindowExpiresAt,
      remainingSeconds: claimWindowSecondsRemaining,
    });
  }

  let lockReason = '';
  const unmetPackageRequirement = packageEnrollmentSnapshot.find((entry) => !entry.met) || null;
  if (!alreadyClaimed && !eventWindowState.isOpen) {
    lockReason = eventWindowState.lockReason || 'This event is not currently open.';
  } else if (!alreadyClaimed && isRankTrack && !claimWindowIsOpen) {
    lockReason = 'Rank rewards can be claimed only after monthly cutoff.';
  } else if (!alreadyClaimed && isRankTrack && claimWindowExpired) {
    lockReason = `Rank reward claim window expired for ${currentPeriodLabel}.`;
  } else if (!alreadyClaimed && requiresRank && !meetsRankRequirement) {
    lockReason = `Reach ${requiredRank} rank to unlock this bonus.`;
  } else if (!alreadyClaimed && requiredDirectSponsorsTotal > 0 && !meetsDirectSponsorTotalRequirement) {
    lockReason = `Enroll ${requiredDirectSponsorsTotal.toLocaleString()} member${requiredDirectSponsorsTotal === 1 ? '' : 's'} (${currentDirectSponsorsTotal.toLocaleString()}/${requiredDirectSponsorsTotal.toLocaleString()}).`;
  } else if (!alreadyClaimed && requiredDirectSponsorsPerSide > 0 && !meetsDirectSponsorRequirement) {
    lockReason = isRankTrack
      ? `Direct sponsors for this rank must be balanced at ${requiredDirectSponsorsPerSide.toLocaleString()}:${requiredDirectSponsorsPerSide.toLocaleString()} (Left ${currentLeftDirectSponsors.toLocaleString()}, Right ${currentRightDirectSponsors.toLocaleString()}).`
      : `Direct sponsors must be balanced at ${requiredDirectSponsorsPerSide.toLocaleString()}:${requiredDirectSponsorsPerSide.toLocaleString()} (Left ${currentLeftDirectSponsors.toLocaleString()}, Right ${currentRightDirectSponsors.toLocaleString()}).`;
  } else if (!alreadyClaimed && requiredCycles > 0 && !meetsCycleRequirement) {
    lockReason = isRankTrack
      ? `Complete ${requiredCycles.toLocaleString()} cycles this month (${currentCycles.toLocaleString()} completed).`
      : `Complete ${requiredCycles.toLocaleString()} cycles (${currentCycles.toLocaleString()} completed).`;
  } else if (!alreadyClaimed && requiredPersonalPvBv > 0 && !meetsPersonalPvRequirement) {
    lockReason = `Maintain at least ${requiredPersonalPvBv.toLocaleString()} BV personal volume (${currentPersonalPvBv.toLocaleString()}/${requiredPersonalPvBv.toLocaleString()}).`;
  } else if (!alreadyClaimed && requiredLegPersonalPvBv > 0 && !meetsLegPersonalPvRequirement) {
    lockReason = `Maintain ${requiredDirectSponsorsPerSide.toLocaleString()} qualified direct sponsor${requiredDirectSponsorsPerSide === 1 ? '' : 's'} per side with at least ${requiredLegPersonalPvBv.toLocaleString()} BV personal volume (Left ${currentLeftQualifiedPersonalPvSponsors.toLocaleString()}/${requiredDirectSponsorsPerSide.toLocaleString()}, Right ${currentRightQualifiedPersonalPvSponsors.toLocaleString()}/${requiredDirectSponsorsPerSide.toLocaleString()}).`;
  } else if (!alreadyClaimed && requiresLegacyPackageOwnership && !meetsLegacyPackageOwnershipRequirement) {
    lockReason = 'Enroll or upgrade to Legacy Package to unlock this title.';
  } else if (!alreadyClaimed && requiredLegacyBuilderDirectEnrollments > 0 && !meetsLegacyBuilderDirectRequirement) {
    lockReason = normalizeText(achievement?.id) === 'time-limited-event-legacy-director'
      ? ''
      : `Enroll ${requiredLegacyBuilderDirectEnrollments.toLocaleString()} Legacy Builder Package member${requiredLegacyBuilderDirectEnrollments === 1 ? '' : 's'} (${currentLegacyBuilderDirectEnrollments.toLocaleString()}/${requiredLegacyBuilderDirectEnrollments.toLocaleString()}).`;
  } else if (!alreadyClaimed && requiredLegacyBuilderSecondLevelEnrollments > 0 && !meetsLegacyBuilderSecondLevelRequirement) {
    lockReason = `Build ${requiredLegacyBuilderSecondLevelEnrollments.toLocaleString()} second-level Legacy Package members (${currentLegacyBuilderSecondLevelEnrollments.toLocaleString()}/${requiredLegacyBuilderSecondLevelEnrollments.toLocaleString()}).`;
  } else if (!alreadyClaimed && requiredLegacyBuilderThirdLevelEnrollments > 0 && !meetsLegacyBuilderThirdLevelRequirement) {
    lockReason = allowLegacyLeadershipTierCardCompletion
      ? `Complete Legacy Leadership Tier Card or build ${requiredLegacyBuilderThirdLevelEnrollments.toLocaleString()} third-level Legacy Package members (${currentLegacyBuilderThirdLevelEnrollments.toLocaleString()}/${requiredLegacyBuilderThirdLevelEnrollments.toLocaleString()}).`
      : `Build ${requiredLegacyBuilderThirdLevelEnrollments.toLocaleString()} third-level Legacy Package members (${currentLegacyBuilderThirdLevelEnrollments.toLocaleString()}/${requiredLegacyBuilderThirdLevelEnrollments.toLocaleString()}).`;
  } else if (!alreadyClaimed && unmetPackageRequirement) {
    lockReason = `Enroll ${unmetPackageRequirement.required.toLocaleString()} ${unmetPackageRequirement.packageLabel} (${unmetPackageRequirement.current.toLocaleString()}/${unmetPackageRequirement.required.toLocaleString()}).`;
  } else if (!alreadyClaimed && requiresActive && !meetsActiveRequirement) {
    lockReason = isRankTrack
      ? 'Account must be Active this month to claim this rank reward.'
      : 'Account must be Active to claim this bonus.';
  } else if (!alreadyClaimed && requiresSystemVerification && !systemVerified) {
    lockReason = 'Waiting for system verification.';
  }

  if (!alreadyClaimed && isRankTrack) {
    const claimedRankTitle = normalizeText(
      claimedRankClaim?.title
      || claimedRankClaim?.requiredRank,
    ) || 'another rank';

    if (!claimWindowIsOpen) {
      eligible = false;
      status = 'locked';
      lockReason = 'Rank rewards can be claimed only after monthly cutoff.';
    } else if (claimWindowExpired) {
      eligible = false;
      status = 'locked';
      lockReason = `Rank reward claim window expired for ${currentPeriodLabel}.`;
    } else if (claimedRankClaim) {
      eligible = false;
      status = 'locked';
      lockReason = `Rank reward already claimed for ${currentPeriodLabel} (${claimedRankTitle}).`;
    } else if (
      eligible
      && highestEligibleRankAchievementId
      && normalizeText(achievement?.id) !== highestEligibleRankAchievementId
    ) {
      eligible = false;
      status = 'locked';
      lockReason = `Only the highest eligible rank can be claimed for ${currentPeriodLabel} (${highestEligibleRankTitle || 'top eligible rank'}).`;
    }
  }

  return {
    eligible,
    status,
    lockReason,
    requiredDirectSponsorsTotal,
    requiredDirectSponsorsPerSide,
    currentLeftDirectSponsors,
    currentRightDirectSponsors,
    currentDirectSponsorsTotal,
    requiredCycles,
    currentCycles,
    requiredPersonalPvBv,
    currentPersonalPvBv,
    requiredLegPersonalPvBv,
    currentLeftQualifiedPersonalPvSponsors,
    currentRightQualifiedPersonalPvSponsors,
    requiresLegacyPackageOwnership,
    hasLegacyPackageOwnership,
    requiredLegacyBuilderDirectEnrollments,
    currentLegacyBuilderDirectEnrollments,
    requiredLegacyBuilderSecondLevelEnrollments,
    currentLegacyBuilderSecondLevelEnrollments,
    requiredLegacyBuilderThirdLevelEnrollments,
    currentLegacyBuilderThirdLevelEnrollments,
    allowLegacyLeadershipTierCardCompletion,
    legacyLeadershipTierCardCompleted,
    requiredPackageEnrollments: packageEnrollmentSnapshot,
    packageEnrollmentsByKey,
    requiresActive,
    requiresSystemVerification,
    systemVerified,
    verificationStatus: systemVerified ? 'verified' : 'pending',
    eventId: eventWindowState.eventId,
    eventName: eventWindowState.eventName,
    eventStartAt: eventWindowState.eventStartAt,
    eventEndAt: eventWindowState.eventEndAt,
    eventIsOpen: eventWindowState.isOpen,
    claimWindowIsOpen,
    claimWindowExpired,
    claimWindowOpensAt,
    claimWindowExpiresAt,
    claimWindowSecondsRemaining,
    requirements,
    prerequisites,
  };
}

function buildAchievementCatalogForMember(member, claims = [], progressContext = {}, options = {}) {
  const rankClaimPeriod = normalizeText(options?.rankClaimPeriod)
    || resolveClaimPeriodKeyFromDate(Date.now());
  const rankRunProgress = options?.rankRunProgress && typeof options.rankRunProgress === 'object'
    ? options.rankRunProgress
    : {};
  const rankClaimProgress = options?.rankClaimProgress && typeof options.rankClaimProgress === 'object'
    ? options.rankClaimProgress
    : {};
  const rankClaimWindow = options?.rankClaimWindow && typeof options.rankClaimWindow === 'object'
    ? options.rankClaimWindow
    : resolveRankClaimWindowContext(Date.now());
  const titleAwards = Array.isArray(options?.titleAwards)
    ? options.titleAwards
    : [];
  const titleCatalog = Array.isArray(options?.titleCatalog)
    ? options.titleCatalog
    : [];
  const titleCatalogBySlug = new Map(
    titleCatalog.map((entry) => [
      normalizeTitleSlug(entry?.titleSlug || entry?.title),
      entry,
    ]),
  );
  const currentRank = normalizeRankLabelForAchievement(progressContext?.currentRank)
    || resolveCurrentMemberRank(member);
  const currentLeftDirectSponsors = toWholeNumber(progressContext?.leftDirectSponsors, 0);
  const currentRightDirectSponsors = toWholeNumber(progressContext?.rightDirectSponsors, 0);
  const currentDirectSponsorsTotal = toWholeNumber(
    progressContext?.totalDirectSponsors,
    currentLeftDirectSponsors + currentRightDirectSponsors,
  );
  const currentCycles = toWholeNumber(progressContext?.currentCycles, 0);
  const currentPersonalPvBv = Math.max(
    0,
    toWholeNumber(progressContext?.currentPersonalPvBv, resolveMemberPersonalVolumeBv(member)),
  );
  const leftDirectSponsorPersonalPvBv = Array.isArray(progressContext?.leftDirectSponsorPersonalPvBv)
    ? progressContext.leftDirectSponsorPersonalPvBv.map((value) => Math.max(0, toWholeNumber(value, 0)))
    : [];
  const rightDirectSponsorPersonalPvBv = Array.isArray(progressContext?.rightDirectSponsorPersonalPvBv)
    ? progressContext.rightDirectSponsorPersonalPvBv.map((value) => Math.max(0, toWholeNumber(value, 0)))
    : [];
  const packageEnrollmentsByKey = progressContext?.packageEnrollmentsByKey && typeof progressContext.packageEnrollmentsByKey === 'object'
    ? progressContext.packageEnrollmentsByKey
    : {};
  const directLegacyBuilderEnrollments = Math.max(
    0,
    toWholeNumber(progressContext?.directLegacyBuilderEnrollments, packageEnrollmentsByKey['legacy-builder-pack']),
  );
  const activityState = progressContext?.activityState && typeof progressContext.activityState === 'object'
    ? progressContext.activityState
    : resolveMemberActivityState(member);
  const rankMonthlyContext = resolveRankMonthlyClaimContext({
    currentRank,
    leftDirectSponsors: currentLeftDirectSponsors,
    rightDirectSponsors: currentRightDirectSponsors,
    totalDirectSponsors: currentDirectSponsorsTotal,
    currentCycles,
    currentPersonalPvBv,
    leftDirectSponsorPersonalPvBv,
    rightDirectSponsorPersonalPvBv,
    activityState,
  }, claims, rankClaimPeriod, {
    rankRunProgress,
    rankClaimProgress,
    rankClaimWindow,
  });
  const claimMap = mapClaimsByAchievementId(claims, { rankClaimPeriod });
  const achievementProgressContext = {
    ...progressContext,
    currentRank,
    leftDirectSponsors: currentLeftDirectSponsors,
    rightDirectSponsors: currentRightDirectSponsors,
    totalDirectSponsors: currentDirectSponsorsTotal,
    currentCycles,
    currentPersonalPvBv,
    leftDirectSponsorPersonalPvBv,
    rightDirectSponsorPersonalPvBv,
    packageEnrollmentsByKey,
    directLegacyBuilderEnrollments,
    activityState,
  };

  const achievements = PROFILE_ACHIEVEMENTS.map((achievement) => {
    const claim = claimMap.get(achievement.id) || null;
    const rewardTitleSlug = resolveAchievementRewardTitleSlug(achievement);
    const catalogTitleEntry = isTitleRewardAchievement(achievement)
      ? (titleCatalogBySlug.get(rewardTitleSlug) || null)
      : null;
    const resolvedRewardTitle = normalizeText(catalogTitleEntry?.title || achievement?.rewardTitle);
    const resolvedRewardLabel = isTitleRewardAchievement(achievement)
      ? (resolvedRewardTitle ? `Title: ${resolvedRewardTitle}` : '')
      : normalizeText(achievement.rewardLabel);
    const eligibility = evaluateAchievementEligibility(achievement, achievementProgressContext, claim, {
      rankMonthlyContext,
    });

    return {
      id: achievement.id,
      tabId: achievement.tabId,
      categoryId: achievement.categoryId,
      title: achievement.title,
      description: achievement.description,
      requiredRank: normalizeRankLabelForAchievement(achievement.requiredRank),
      requiresRank: achievement?.requiresRank !== false,
      requiredDirectSponsorsTotal: eligibility.requiredDirectSponsorsTotal,
      requiredDirectSponsorsPerSide: eligibility.requiredDirectSponsorsPerSide,
      currentLeftDirectSponsors: eligibility.currentLeftDirectSponsors,
      currentRightDirectSponsors: eligibility.currentRightDirectSponsors,
      currentDirectSponsorsTotal: eligibility.currentDirectSponsorsTotal,
      requiredCycles: eligibility.requiredCycles,
      requiredPersonalPvBv: eligibility.requiredPersonalPvBv,
      currentPersonalPvBv: eligibility.currentPersonalPvBv,
      requiredLegPersonalPvBv: eligibility.requiredLegPersonalPvBv,
      currentLeftQualifiedPersonalPvSponsors: eligibility.currentLeftQualifiedPersonalPvSponsors,
      currentRightQualifiedPersonalPvSponsors: eligibility.currentRightQualifiedPersonalPvSponsors,
      requiresLegacyPackageOwnership: eligibility.requiresLegacyPackageOwnership,
      hasLegacyPackageOwnership: eligibility.hasLegacyPackageOwnership,
      requiredLegacyBuilderDirectEnrollments: eligibility.requiredLegacyBuilderDirectEnrollments,
      currentLegacyBuilderDirectEnrollments: eligibility.currentLegacyBuilderDirectEnrollments,
      requiredLegacyBuilderSecondLevelEnrollments: eligibility.requiredLegacyBuilderSecondLevelEnrollments,
      currentLegacyBuilderSecondLevelEnrollments: eligibility.currentLegacyBuilderSecondLevelEnrollments,
      requiredLegacyBuilderThirdLevelEnrollments: eligibility.requiredLegacyBuilderThirdLevelEnrollments,
      currentLegacyBuilderThirdLevelEnrollments: eligibility.currentLegacyBuilderThirdLevelEnrollments,
      allowLegacyLeadershipTierCardCompletion: eligibility.allowLegacyLeadershipTierCardCompletion,
      legacyLeadershipTierCardCompleted: eligibility.legacyLeadershipTierCardCompleted,
      requiredPackageEnrollments: eligibility.requiredPackageEnrollments,
      rewardUsd: roundCurrencyAmount(achievement.rewardUsd),
      rewardType: normalizeText(achievement.rewardType),
      rewardTitleSlug,
      rewardTitle: resolvedRewardTitle,
      rewardLabel: resolvedRewardLabel,
      deductionPerBottleUsd: roundCurrencyAmount(achievement.deductionPerBottleUsd),
      payoutSchedule: normalizeText(achievement.payoutSchedule),
      iconPath: normalizeText(achievement.iconPath),
      iconLightPath: normalizeText(achievement.iconLightPath),
      eligible: eligibility.eligible,
      status: eligibility.status,
      lockReason: eligibility.lockReason,
      requiresActive: eligibility.requiresActive,
      requiresSystemVerification: eligibility.requiresSystemVerification,
      systemVerified: eligibility.systemVerified,
      verificationStatus: eligibility.verificationStatus,
      eventId: eligibility.eventId,
      eventName: eligibility.eventName,
      eventStartAt: eligibility.eventStartAt,
      eventEndAt: eligibility.eventEndAt,
      eventIsOpen: eligibility.eventIsOpen,
      requirements: eligibility.requirements,
      prerequisites: eligibility.prerequisites,
      claimId: claim?.claimId || '',
      claimPeriod: claim?.claimPeriod || '',
      claimedAt: claim?.claimedAt || '',
    };
  });

  return {
    tabs: PROFILE_ACHIEVEMENT_TABS,
    categories: PROFILE_ACHIEVEMENT_CATEGORIES,
    achievements,
    currentRank,
    leftDirectSponsors: currentLeftDirectSponsors,
    rightDirectSponsors: currentRightDirectSponsors,
    totalDirectSponsors: currentDirectSponsorsTotal,
    currentCycles,
    currentPersonalPvBv,
    directLegacyBuilderEnrollments,
    packageEnrollmentsByKey,
    accountTitles: titleAwards,
    claimableTitles: titleCatalog,
    rankClaimPeriod,
    rankClaimPeriodLabel: rankMonthlyContext.currentPeriodLabel,
    rankRunPeriod: normalizeText(rankClaimWindow?.currentRunPeriodKey),
    rankRunPeriodLabel: normalizeText(rankClaimWindow?.currentRunPeriodLabel),
    rankClaimWindowOpensAt: normalizeText(rankMonthlyContext?.claimWindowOpensAt),
    rankClaimWindowExpiresAt: normalizeText(rankMonthlyContext?.claimWindowExpiresAt),
    rankClaimWindowIsOpen: Boolean(rankMonthlyContext?.claimWindowIsOpen),
    rankClaimWindowExpired: Boolean(rankMonthlyContext?.claimWindowExpired),
    rankClaimWindowSecondsRemaining: Math.max(
      0,
      toWholeNumber(rankMonthlyContext?.claimWindowSecondsRemaining, 0),
    ),
    rankClaimedAchievementId: normalizeText(rankMonthlyContext?.claimedRankClaim?.achievementId),
    rankClaimedAchievementTitle: normalizeText(
      rankMonthlyContext?.claimedRankClaim?.title
      || rankMonthlyContext?.claimedRankClaim?.requiredRank,
    ),
    isActive: Boolean(activityState?.isActive),
    activityStatus: normalizeText(activityState?.label) || 'Inactive',
    activityActiveUntilAt: normalizeText(activityState?.activeUntilAt),
  };
}

async function buildCatalogForMemberWithLatestState(member = {}, userId = '', options = {}) {
  const nowMs = Number.isFinite(Number(options?.nowMs))
    ? Math.floor(Number(options.nowMs))
    : Date.now();
  const effectiveMember = await maybeApplyMonthlyRankPromotion(member, { nowMs });
  const rankClaimWindow = resolveRankClaimWindowContext(nowMs);
  const rankRunPeriod = normalizeText(options?.rankRunPeriod)
    || normalizeText(rankClaimWindow?.currentRunPeriodKey)
    || resolveClaimPeriodKeyFromDate(nowMs);
  const rankClaimPeriod = normalizeText(options?.rankClaimPeriod)
    || normalizeText(rankClaimWindow?.claimPeriodKey);
  await ensureMemberTitleCatalogSeed();
  const [claims, progressContext, titleAwards, titleCatalog] = await Promise.all([
    listMemberAchievementClaimsByUserId(userId),
    resolveCurrentMemberProgressContext(effectiveMember),
    listActiveMemberTitleAwardsByUserId(userId),
    listActiveMemberTitleCatalogEntries(),
  ]);
  const [rankRunProgress, rankClaimProgress] = await Promise.all([
    resolveRankMonthlyRunProgress(effectiveMember, progressContext, rankRunPeriod),
    resolveRankClaimProgressForPeriod(userId, rankClaimPeriod),
  ]);

  return buildAchievementCatalogForMember(effectiveMember, claims, progressContext, {
    rankClaimPeriod,
    rankRunProgress,
    rankClaimProgress,
    rankClaimWindow,
    titleAwards,
    titleCatalog,
  });
}

export async function resolveRankAdvancementRunSnapshotForMember(member = {}) {
  const nowMs = Date.now();
  const effectiveMember = await maybeApplyMonthlyRankPromotion(member, { nowMs });
  const progressContext = await resolveCurrentMemberProgressContext(effectiveMember);
  const rankClaimWindow = resolveRankClaimWindowContext(nowMs);
  const rankRunPeriod = normalizeText(rankClaimWindow?.currentRunPeriodKey)
    || resolveClaimPeriodKeyFromDate(nowMs);
  const rankRunProgress = await resolveRankMonthlyRunProgress(effectiveMember, progressContext, rankRunPeriod);
  const leftDirectSponsors = toWholeNumber(progressContext?.leftDirectSponsors, 0);
  const rightDirectSponsors = toWholeNumber(progressContext?.rightDirectSponsors, 0);
  const totalDirectSponsors = toWholeNumber(
    progressContext?.totalDirectSponsors,
    leftDirectSponsors + rightDirectSponsors,
  );

  return {
    rankClaimPeriod: rankRunPeriod,
    rankClaimPeriodLabel: formatClaimPeriodLabel(rankRunPeriod) || 'this month',
    currentRank: normalizeRankLabelForAchievement(progressContext?.currentRank) || 'Unranked',
    currentCycles: toWholeNumber(progressContext?.currentCycles, 0),
    currentPersonalPvBv: toWholeNumber(progressContext?.currentPersonalPvBv, 0),
    leftDirectSponsors,
    rightDirectSponsors,
    totalDirectSponsors,
    isActive: Boolean(progressContext?.activityState?.isActive),
    runRankAchievementId: normalizeText(rankRunProgress?.highestRecordedRankAchievementId),
    runRankTitle: normalizeText(rankRunProgress?.highestRecordedRankTitle),
    runRankRequiredCycles: toWholeNumber(rankRunProgress?.highestRecordedRequiredCycles, 0),
    runRankRecordedAt: formatDateIso(rankRunProgress?.highestRecordedAt),
  };
}

export async function listProfileAchievementsForMember(member = {}) {
  const userId = normalizeText(member?.id);
  if (!userId) {
    return {
      success: false,
      status: 400,
      error: 'Authenticated member user id is required.',
    };
  }

  const catalog = await buildCatalogForMemberWithLatestState(member, userId);

  return {
    success: true,
    status: 200,
    data: {
      success: true,
      ...catalog,
    },
  };
}

export async function claimProfileAchievementForMember(member = {}, achievementIdInput = '') {
  const userId = normalizeText(member?.id);
  if (!userId) {
    return {
      success: false,
      status: 400,
      error: 'Authenticated member user id is required.',
    };
  }

  const achievementId = normalizeText(achievementIdInput);
  const achievement = PROFILE_ACHIEVEMENT_BY_ID.get(achievementId) || null;
  if (!achievement) {
    return {
      success: false,
      status: 404,
      error: 'Achievement was not found.',
    };
  }

  await ensureMemberTitleCatalogSeed();

  const claimAttemptMs = Date.now();
  const effectiveMember = await maybeApplyMonthlyRankPromotion(member, { nowMs: claimAttemptMs });
  const rankClaimWindow = resolveRankClaimWindowContext(claimAttemptMs);
  const rankRunPeriod = normalizeText(rankClaimWindow?.currentRunPeriodKey)
    || resolveClaimPeriodKeyFromDate(claimAttemptMs);
  const rankClaimPeriod = normalizeText(rankClaimWindow?.claimPeriodKey);
  const claimPeriod = isRankAdvancementAchievement(achievement)
    ? rankClaimPeriod
    : resolveAchievementClaimPeriod(achievement, claimAttemptMs);

  if (isRankAdvancementAchievement(achievement) && !rankClaimWindow.claimWindowIsOpen) {
    const catalog = await buildCatalogForMemberWithLatestState(effectiveMember, userId, {
      nowMs: claimAttemptMs,
      rankRunPeriod,
      rankClaimPeriod,
    });
    return {
      success: false,
      status: 403,
      error: 'Rank rewards can be claimed only after monthly cutoff.',
      data: {
        success: false,
        ...catalog,
      },
    };
  }

  if (isRankAdvancementAchievement(achievement) && rankClaimWindow.claimWindowExpired) {
    const catalog = await buildCatalogForMemberWithLatestState(effectiveMember, userId, {
      nowMs: claimAttemptMs,
      rankRunPeriod,
      rankClaimPeriod,
    });
    return {
      success: false,
      status: 403,
      error: `Rank reward claim window expired for ${formatClaimPeriodLabel(rankClaimPeriod) || 'the previous month'}.`,
      data: {
        success: false,
        ...catalog,
      },
    };
  }

  let existingClaim = null;
  if (isRankAdvancementAchievement(achievement)) {
    existingClaim = await findMemberAchievementClaimByUserIdAndAchievementIdAndPeriod(
      userId,
      achievement.id,
      claimPeriod,
    );
  } else {
    existingClaim = await findMemberAchievementClaimByUserIdAndAchievementId(userId, achievement.id);
  }

  if (existingClaim) {
    const periodLabel = formatClaimPeriodLabel(claimPeriod);
    const duplicateMessage = isRankAdvancementAchievement(achievement)
      ? `Rank reward has already been claimed for ${periodLabel || 'the previous month'}.`
      : 'Achievement has already been claimed.';
    const catalog = await buildCatalogForMemberWithLatestState(effectiveMember, userId, {
      nowMs: claimAttemptMs,
      rankRunPeriod,
      rankClaimPeriod,
    });
    return {
      success: false,
      status: 409,
      error: duplicateMessage,
      data: {
        success: false,
        claim: existingClaim,
        ...catalog,
      },
    };
  }

  const [allClaims, progressContext, titleAwards, titleCatalog] = await Promise.all([
    listMemberAchievementClaimsByUserId(userId),
    resolveCurrentMemberProgressContext(effectiveMember),
    listActiveMemberTitleAwardsByUserId(userId),
    listActiveMemberTitleCatalogEntries(),
  ]);
  const [rankRunProgress, rankClaimProgress] = await Promise.all([
    resolveRankMonthlyRunProgress(effectiveMember, progressContext, rankRunPeriod),
    resolveRankClaimProgressForPeriod(userId, rankClaimPeriod),
  ]);
  const rankMonthlyContext = resolveRankMonthlyClaimContext(
    progressContext,
    allClaims,
    rankClaimPeriod,
    {
      rankRunProgress,
      rankClaimProgress,
      rankClaimWindow,
    },
  );
  const buildLiveCatalog = () => buildAchievementCatalogForMember(
    effectiveMember,
    allClaims,
    progressContext,
    {
      rankClaimPeriod,
      rankRunProgress,
      rankClaimProgress,
      rankClaimWindow,
      titleAwards,
      titleCatalog,
    },
  );
  const rewardTitleSlug = resolveAchievementRewardTitleSlug(achievement);
  const rewardTitleCatalogEntry = isTitleRewardAchievement(achievement)
    ? (await findActiveMemberTitleCatalogEntryBySlug(rewardTitleSlug))
    : null;
  const rewardTitleForAward = normalizeText(
    rewardTitleCatalogEntry?.title || achievement?.rewardTitle,
  );

  if (isRankAdvancementAchievement(achievement) && rankMonthlyContext?.claimedRankClaim) {
    const claimedRankTitle = normalizeText(
      rankMonthlyContext.claimedRankClaim?.title
      || rankMonthlyContext.claimedRankClaim?.requiredRank,
    ) || 'another rank';
    const catalog = buildLiveCatalog();
    return {
      success: false,
      status: 409,
      error: `Rank reward already claimed for ${rankMonthlyContext.currentPeriodLabel || 'the previous month'} (${claimedRankTitle}).`,
      data: {
        success: false,
        claim: rankMonthlyContext.claimedRankClaim,
        ...catalog,
      },
    };
  }

  const achievementEligibility = evaluateAchievementEligibility(achievement, progressContext, null, {
    rankMonthlyContext,
  });
  if (isTitleRewardAchievement(achievement) && !rewardTitleCatalogEntry) {
    const catalog = buildLiveCatalog();
    return {
      success: false,
      status: 409,
      error: 'This title reward is not currently configured as claimable on the server.',
      data: {
        success: false,
        ...catalog,
      },
    };
  }
  if (isTitleRewardAchievement(achievement)) {
    const existingTitleAward = await findActiveMemberTitleAwardByUserIdAndSlug(
      userId,
      rewardTitleSlug,
    );
    if (existingTitleAward) {
      const catalog = buildLiveCatalog();
      return {
        success: false,
        status: 409,
        error: `${rewardTitleForAward || 'This account title'} is already awarded on this account.`,
        data: {
          success: false,
          ...catalog,
        },
      };
    }
  }
  if (!achievementEligibility.eligible) {
    const catalog = buildLiveCatalog();
      return {
        success: false,
        status: 403,
        error: achievementEligibility.lockReason || `Current progress does not meet ${achievement.title}.`,
        data: {
          success: false,
          ...catalog,
      },
    };
  }

  let claimRecord = null;
  try {
    claimRecord = await insertMemberAchievementClaim({
      claimId: `achv_${Date.now()}_${randomUUID().slice(0, 8)}`,
      userId,
      achievementId: achievement.id,
      claimPeriod,
      tabId: achievement.tabId,
      categoryId: achievement.categoryId,
      title: achievement.title,
      description: achievement.description,
      requiredRank: achievement.requiredRank,
      rewardAmount: achievement.rewardUsd,
      claimedAt: new Date().toISOString(),
    });
  } catch (error) {
    if (error?.code === '23505') {
      let conflictClaim = null;
      if (isRankAdvancementAchievement(achievement)) {
        conflictClaim = await findMemberAchievementClaimByUserIdAndAchievementIdAndPeriod(
          userId,
          achievement.id,
          claimPeriod,
        );
        if (!conflictClaim) {
          const refreshedClaims = await listMemberAchievementClaimsByUserId(userId);
          conflictClaim = resolveCurrentPeriodRankClaim(refreshedClaims, rankClaimPeriod);
        }
      } else {
        conflictClaim = await findMemberAchievementClaimByUserIdAndAchievementId(userId, achievement.id);
      }

      const conflictMessage = isRankAdvancementAchievement(achievement)
        ? `Rank reward already claimed for ${formatClaimPeriodLabel(rankClaimPeriod) || 'the previous month'}.`
        : 'Achievement has already been claimed.';
      const catalog = await buildCatalogForMemberWithLatestState(effectiveMember, userId, {
        nowMs: claimAttemptMs,
        rankRunPeriod,
        rankClaimPeriod,
      });
      return {
        success: false,
        status: 409,
        error: conflictMessage,
        data: {
          success: false,
          claim: conflictClaim,
          ...catalog,
        },
      };
    }

    throw error;
  }

  if (claimRecord && isTitleRewardAchievement(achievement)) {
    const existingTitleAward = await findActiveMemberTitleAwardByUserIdAndSlug(userId, rewardTitleSlug);
    if (!existingTitleAward) {
      try {
        await insertMemberTitleAward({
          awardId: `ttl_${Date.now()}_${randomUUID().slice(0, 8)}`,
          userId,
          titleSlug: rewardTitleSlug,
          title: rewardTitleForAward,
          titleDescription: normalizeText(achievement?.description),
          sourceAchievementId: normalizeText(achievement?.id),
          sourceClaimId: normalizeText(claimRecord?.claimId),
          eventId: normalizeText(achievement?.eventId),
          awardedAt: new Date().toISOString(),
          metadata: {
            achievementId: normalizeText(achievement?.id),
            achievementTitle: normalizeText(achievement?.title),
            eventId: normalizeText(achievement?.eventId),
            eventName: normalizeText(achievement?.eventName),
            rewardType: 'title',
          },
        });
      } catch (error) {
        if (error?.code !== '23505') {
          throw error;
        }
      }
    }
  }

  const catalog = await buildCatalogForMemberWithLatestState(effectiveMember, userId, {
    nowMs: claimAttemptMs,
    rankRunPeriod,
    rankClaimPeriod,
  });

  return {
    success: true,
    status: 201,
    data: {
      success: true,
      claim: claimRecord,
      ...catalog,
    },
  };
}
