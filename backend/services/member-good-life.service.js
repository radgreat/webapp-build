import {
  upsertMemberGoodLifeMonthlyHighest,
  markMemberGoodLifeMonthlyClaim,
} from '../stores/member-good-life.store.js';

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

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeCredential(value) {
  return normalizeText(value).toLowerCase();
}

function roundCurrencyAmount(value) {
  return Math.round((Math.max(0, Number(value) || 0)) * 100) / 100;
}

function normalizeRankLabelForGoodLife(value) {
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
  const normalizedLabel = normalizeRankLabelForGoodLife(rankValue);
  if (!normalizedLabel) {
    return -1;
  }
  const lookupKey = normalizeCredential(normalizedLabel);
  return RANK_INDEX_BY_KEY.has(lookupKey) ? RANK_INDEX_BY_KEY.get(lookupKey) : -1;
}

function resolveCurrentMemberRank(member = {}) {
  const rawRank = normalizeText(member?.accountRank || member?.rank);
  return normalizeRankLabelForGoodLife(rawRank) || 'Unranked';
}

function resolvePeriodKeyFromDate(value = Date.now()) {
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

function formatPeriodLabel(periodKeyInput = '') {
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

const GOOD_LIFE_MILESTONES = Object.freeze([
  Object.freeze({
    id: 'good-life-diamond',
    title: 'Diamond',
    requiredRank: 'Diamond',
    rewardUsd: 500,
    iconPath: '/brand_assets/Icons/Achievements/diamond.svg',
    iconLightPath: '/brand_assets/Icons/Achievements/diamond-light.svg',
  }),
  Object.freeze({
    id: 'good-life-blue-diamond',
    title: 'Blue Diamond',
    requiredRank: 'Blue Diamond',
    rewardUsd: 1000,
    iconPath: '/brand_assets/Icons/Achievements/blue-diamond.svg',
    iconLightPath: '/brand_assets/Icons/Achievements/blue-diamond-light.svg',
  }),
  Object.freeze({
    id: 'good-life-black-diamond',
    title: 'Black Diamond',
    requiredRank: 'Black Diamond',
    rewardUsd: 2000,
    iconPath: '/brand_assets/Icons/Achievements/black-diamond.svg',
    iconLightPath: '/brand_assets/Icons/Achievements/black-diamond-light.svg',
  }),
  Object.freeze({
    id: 'good-life-crown',
    title: 'Crown',
    requiredRank: 'Crown',
    rewardUsd: 4000,
    iconPath: '/brand_assets/Icons/Achievements/crown.svg',
    iconLightPath: '/brand_assets/Icons/Achievements/crown-light.svg',
  }),
  Object.freeze({
    id: 'good-life-double-crown',
    title: 'Double Crown',
    requiredRank: 'Double Crown',
    rewardUsd: 8000,
    iconPath: '/brand_assets/Icons/Achievements/double-crown.svg',
    iconLightPath: '/brand_assets/Icons/Achievements/double-crown-light.svg',
  }),
  Object.freeze({
    id: 'good-life-royal-crown',
    title: 'Royal Crown',
    requiredRank: 'Royal Crown',
    rewardUsd: 12500,
    iconPath: '/brand_assets/Icons/Achievements/royal-crown.svg',
    iconLightPath: '/brand_assets/Icons/Achievements/royal-crown-light.svg',
  }),
]).map((milestone) => Object.freeze({
  ...milestone,
  rankIndex: resolveRankIndex(milestone.requiredRank),
}));

const GOOD_LIFE_MILESTONE_BY_ID = new Map(
  GOOD_LIFE_MILESTONES.map((milestone) => [milestone.id, milestone]),
);

const GOOD_LIFE_FIRST_RANK_INDEX = GOOD_LIFE_MILESTONES.length > 0
  ? GOOD_LIFE_MILESTONES[0].rankIndex
  : -1;
const GOOD_LIFE_LAST_RANK_INDEX = GOOD_LIFE_MILESTONES.length > 0
  ? GOOD_LIFE_MILESTONES[GOOD_LIFE_MILESTONES.length - 1].rankIndex
  : -1;

function resolveHighestMilestoneForRankIndex(rankIndex) {
  let matchedMilestone = null;
  GOOD_LIFE_MILESTONES.forEach((milestone) => {
    if (rankIndex >= milestone.rankIndex) {
      matchedMilestone = milestone;
    }
  });
  return matchedMilestone;
}

function buildGoodLifeMilestoneList(progressRecord = {}, options = {}) {
  const highestRankIndex = Number.isFinite(Number(progressRecord?.highestRankIndex))
    ? Math.max(-1, Math.floor(Number(progressRecord.highestRankIndex)))
    : -1;
  const claimedAchievementId = normalizeText(progressRecord?.claimedAchievementId);
  const claimableAchievementId = normalizeText(options?.claimableAchievementId);

  return GOOD_LIFE_MILESTONES.map((milestone) => {
    const reached = highestRankIndex >= milestone.rankIndex;
    const passed = reached && milestone.id !== claimableAchievementId;
    const claimed = claimedAchievementId === milestone.id;
    const claimable = claimableAchievementId === milestone.id && !claimed;
    const status = claimed
      ? 'claimed'
      : (claimable ? 'claimable' : (passed ? 'passed' : (reached ? 'reached' : 'locked')));

    return {
      id: milestone.id,
      title: milestone.title,
      requiredRank: milestone.requiredRank,
      rankIndex: milestone.rankIndex,
      rewardUsd: roundCurrencyAmount(milestone.rewardUsd),
      iconPath: normalizeText(milestone.iconPath),
      iconLightPath: normalizeText(milestone.iconLightPath),
      reached,
      passed,
      claimed,
      claimable,
      status,
    };
  });
}

function resolveProgressPercent(highestRankIndex) {
  if (!Number.isFinite(Number(highestRankIndex)) || highestRankIndex < GOOD_LIFE_FIRST_RANK_INDEX) {
    return 0;
  }

  if (GOOD_LIFE_FIRST_RANK_INDEX < 0 || GOOD_LIFE_LAST_RANK_INDEX <= GOOD_LIFE_FIRST_RANK_INDEX) {
    return 0;
  }

  const normalized = Math.max(
    GOOD_LIFE_FIRST_RANK_INDEX,
    Math.min(GOOD_LIFE_LAST_RANK_INDEX, Math.floor(Number(highestRankIndex))),
  );
  const ratio = (normalized - GOOD_LIFE_FIRST_RANK_INDEX) / (GOOD_LIFE_LAST_RANK_INDEX - GOOD_LIFE_FIRST_RANK_INDEX);
  return Math.max(0, Math.min(100, Math.round(ratio * 100)));
}

async function buildGoodLifeMonthlySnapshot(member = {}) {
  const userId = normalizeText(member?.id);
  const periodKey = resolvePeriodKeyFromDate(Date.now());
  const periodLabel = formatPeriodLabel(periodKey) || 'This Month';

  const currentRank = resolveCurrentMemberRank(member);
  const currentRankIndex = resolveRankIndex(currentRank);
  const highestCurrentMilestone = resolveHighestMilestoneForRankIndex(currentRankIndex);

  const progressRecord = await upsertMemberGoodLifeMonthlyHighest({
    userId,
    periodKey,
    highestRank: highestCurrentMilestone?.requiredRank || '',
    highestRankIndex: Number.isFinite(highestCurrentMilestone?.rankIndex)
      ? highestCurrentMilestone.rankIndex
      : -1,
    highestAchievementId: highestCurrentMilestone?.id || '',
    highestRewardAmount: roundCurrencyAmount(highestCurrentMilestone?.rewardUsd),
  });

  const highestRecordedRankIndex = Number.isFinite(Number(progressRecord?.highestRankIndex))
    ? Math.max(-1, Math.floor(Number(progressRecord.highestRankIndex)))
    : -1;
  const highestRecordedMilestone = GOOD_LIFE_MILESTONE_BY_ID.get(
    normalizeText(progressRecord?.highestAchievementId),
  ) || resolveHighestMilestoneForRankIndex(highestRecordedRankIndex);
  const claimedMilestone = GOOD_LIFE_MILESTONE_BY_ID.get(
    normalizeText(progressRecord?.claimedAchievementId),
  ) || null;
  const canClaim = !normalizeText(progressRecord?.claimedAt) && Boolean(highestRecordedMilestone);
  const claimableAchievementId = canClaim ? normalizeText(highestRecordedMilestone?.id) : '';

  const milestones = buildGoodLifeMilestoneList(progressRecord, { claimableAchievementId });
  const featuredMilestone = claimedMilestone || highestRecordedMilestone || GOOD_LIFE_MILESTONES[0] || null;
  const progressPercent = resolveProgressPercent(highestRecordedRankIndex);

  return {
    periodKey,
    periodLabel,
    currentRank,
    currentRankIndex,
    highestRecordedRank: normalizeText(
      progressRecord?.highestRank || highestRecordedMilestone?.requiredRank,
    ),
    highestRecordedRankIndex,
    highestRecordedAchievementId: normalizeText(
      progressRecord?.highestAchievementId || highestRecordedMilestone?.id,
    ),
    highestRecordedRewardUsd: roundCurrencyAmount(
      progressRecord?.highestRewardAmount ?? highestRecordedMilestone?.rewardUsd,
    ),
    claimedAt: normalizeText(progressRecord?.claimedAt),
    claimedAchievementId: normalizeText(progressRecord?.claimedAchievementId),
    claimedRank: normalizeText(progressRecord?.claimedRank),
    claimedRewardUsd: roundCurrencyAmount(progressRecord?.claimedRewardAmount),
    canClaim,
    progressPercent,
    milestones,
    featuredMilestone: featuredMilestone
      ? {
        id: featuredMilestone.id,
        title: featuredMilestone.title,
        requiredRank: featuredMilestone.requiredRank,
        rewardUsd: roundCurrencyAmount(featuredMilestone.rewardUsd),
        iconPath: normalizeText(featuredMilestone.iconPath),
        iconLightPath: normalizeText(featuredMilestone.iconLightPath),
      }
      : null,
  };
}

export async function listGoodLifeMonthlyForMember(member = {}) {
  const userId = normalizeText(member?.id);
  if (!userId) {
    return {
      success: false,
      status: 400,
      error: 'Authenticated member user id is required.',
    };
  }

  const snapshot = await buildGoodLifeMonthlySnapshot(member);
  return {
    success: true,
    status: 200,
    data: {
      success: true,
      ...snapshot,
    },
  };
}

export async function claimGoodLifeMonthlyForMember(member = {}) {
  const userId = normalizeText(member?.id);
  if (!userId) {
    return {
      success: false,
      status: 400,
      error: 'Authenticated member user id is required.',
    };
  }

  const snapshot = await buildGoodLifeMonthlySnapshot(member);
  if (snapshot.claimedAt) {
    return {
      success: false,
      status: 409,
      error: `Good Life reward already claimed for ${snapshot.periodLabel || 'this month'}.`,
      data: {
        success: false,
        ...snapshot,
      },
    };
  }

  const claimableAchievementId = normalizeText(snapshot.highestRecordedAchievementId);
  const claimableMilestone = GOOD_LIFE_MILESTONE_BY_ID.get(claimableAchievementId) || null;
  if (!claimableMilestone || !snapshot.canClaim) {
    return {
      success: false,
      status: 403,
      error: 'No Good Life reward is eligible to claim yet for this month.',
      data: {
        success: false,
        ...snapshot,
      },
    };
  }

  const claimedAt = new Date().toISOString();
  const claimRecord = await markMemberGoodLifeMonthlyClaim({
    userId,
    periodKey: snapshot.periodKey,
    claimedAchievementId: claimableMilestone.id,
    claimedRank: claimableMilestone.requiredRank,
    claimedRewardAmount: claimableMilestone.rewardUsd,
    claimedAt,
  });

  if (!claimRecord) {
    const refreshedSnapshot = await buildGoodLifeMonthlySnapshot(member);
    return {
      success: false,
      status: 409,
      error: `Good Life reward already claimed for ${refreshedSnapshot.periodLabel || 'this month'}.`,
      data: {
        success: false,
        ...refreshedSnapshot,
      },
    };
  }

  const refreshedSnapshot = await buildGoodLifeMonthlySnapshot(member);
  return {
    success: true,
    status: 201,
    data: {
      success: true,
      claim: {
        achievementId: claimableMilestone.id,
        title: claimableMilestone.title,
        requiredRank: claimableMilestone.requiredRank,
        rewardUsd: roundCurrencyAmount(claimableMilestone.rewardUsd),
        claimedAt,
      },
      ...refreshedSnapshot,
    },
  };
}
