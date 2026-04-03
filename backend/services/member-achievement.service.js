import { randomUUID } from 'crypto';
import {
  listMemberAchievementClaimsByUserId,
  findMemberAchievementClaimByUserIdAndAchievementId,
  insertMemberAchievementClaim,
} from '../stores/member-achievement.store.js';

const PROFILE_ACHIEVEMENT_TABS = Object.freeze([
  Object.freeze({ id: 'premiere-life', label: 'Premiere Life' }),
  Object.freeze({ id: 'rank', label: 'Rank' }),
]);

const PROFILE_ACHIEVEMENT_CATEGORIES = Object.freeze([
  Object.freeze({
    id: 'good-life',
    tabId: 'premiere-life',
    label: 'Good Life',
    description: 'Good Life bonus milestones based on rank achievement.',
  }),
  Object.freeze({
    id: 'rank-track',
    tabId: 'rank',
    label: 'Rank',
    description: 'Additional rank achievement tracks will be added here.',
  }),
]);

const PROFILE_ACHIEVEMENTS = Object.freeze([
  Object.freeze({
    id: 'good-life-diamond',
    tabId: 'premiere-life',
    categoryId: 'good-life',
    title: 'Diamond',
    description: 'Reach Diamond Rank',
    requiredRank: 'Diamond',
    rewardUsd: 500,
    iconPath: '/brand_assets/Icons/Achievements/diamond.svg',
    iconLightPath: '/brand_assets/Icons/Achievements/diamond-light.svg',
  }),
  Object.freeze({
    id: 'good-life-blue-diamond',
    tabId: 'premiere-life',
    categoryId: 'good-life',
    title: 'Blue Diamond',
    description: 'Reach Blue Diamond Rank',
    requiredRank: 'Blue Diamond',
    rewardUsd: 1000,
    iconPath: '/brand_assets/Icons/Achievements/blue-diamond.svg',
    iconLightPath: '/brand_assets/Icons/Achievements/blue-diamond-light.svg',
  }),
  Object.freeze({
    id: 'good-life-black-diamond',
    tabId: 'premiere-life',
    categoryId: 'good-life',
    title: 'Black Diamond',
    description: 'Reach Black Diamond Rank',
    requiredRank: 'Black Diamond',
    rewardUsd: 2000,
    iconPath: '/brand_assets/Icons/Achievements/black-diamond.svg',
    iconLightPath: '/brand_assets/Icons/Achievements/black-diamond-light.svg',
  }),
  Object.freeze({
    id: 'good-life-crown',
    tabId: 'premiere-life',
    categoryId: 'good-life',
    title: 'Crown',
    description: 'Reach Crown Rank',
    requiredRank: 'Crown',
    rewardUsd: 4000,
    iconPath: '/brand_assets/Icons/Achievements/crown.svg',
    iconLightPath: '/brand_assets/Icons/Achievements/crown-light.svg',
  }),
  Object.freeze({
    id: 'good-life-double-crown',
    tabId: 'premiere-life',
    categoryId: 'good-life',
    title: 'Double Crown',
    description: 'Reach Double Crown Rank',
    requiredRank: 'Double Crown',
    rewardUsd: 8000,
    iconPath: '/brand_assets/Icons/Achievements/double-crown.svg',
    iconLightPath: '/brand_assets/Icons/Achievements/double-crown-light.svg',
  }),
  Object.freeze({
    id: 'good-life-royal-crown',
    tabId: 'premiere-life',
    categoryId: 'good-life',
    title: 'Royal Crown',
    description: 'Reach Royal Crown Rank',
    requiredRank: 'Royal Crown',
    rewardUsd: 12500,
    iconPath: '/brand_assets/Icons/Achievements/royal-crown.svg',
    iconLightPath: '/brand_assets/Icons/Achievements/royal-crown-light.svg',
  }),
]);

const PROFILE_ACHIEVEMENT_BY_ID = new Map(
  PROFILE_ACHIEVEMENTS.map((achievement) => [achievement.id, achievement]),
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

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeCredential(value) {
  return normalizeText(value).toLowerCase();
}

function roundCurrencyAmount(value) {
  return Math.round((Math.max(0, Number(value) || 0)) * 100) / 100;
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

function mapClaimsByAchievementId(claims = []) {
  const claimMap = new Map();

  (Array.isArray(claims) ? claims : []).forEach((claim) => {
    const achievementId = normalizeText(claim?.achievementId);
    if (!achievementId || claimMap.has(achievementId)) {
      return;
    }

    claimMap.set(achievementId, {
      claimId: normalizeText(claim?.claimId),
      claimedAt: formatDateIso(claim?.claimedAt),
      rewardAmount: roundCurrencyAmount(claim?.rewardAmount),
    });
  });

  return claimMap;
}

function buildAchievementCatalogForMember(member, claims = []) {
  const currentRank = resolveCurrentMemberRank(member);
  const claimMap = mapClaimsByAchievementId(claims);

  const achievements = PROFILE_ACHIEVEMENTS.map((achievement) => {
    const claim = claimMap.get(achievement.id) || null;
    const alreadyClaimed = Boolean(claim?.claimedAt);
    const eligible = alreadyClaimed
      ? true
      : isRankEligibleForAchievement(currentRank, achievement.requiredRank);
    const status = alreadyClaimed
      ? 'claimed'
      : (eligible ? 'eligible' : 'locked');

    return {
      id: achievement.id,
      tabId: achievement.tabId,
      categoryId: achievement.categoryId,
      title: achievement.title,
      description: achievement.description,
      requiredRank: achievement.requiredRank,
      rewardUsd: roundCurrencyAmount(achievement.rewardUsd),
      iconPath: normalizeText(achievement.iconPath),
      iconLightPath: normalizeText(achievement.iconLightPath),
      eligible,
      status,
      claimId: claim?.claimId || '',
      claimedAt: claim?.claimedAt || '',
    };
  });

  return {
    tabs: PROFILE_ACHIEVEMENT_TABS,
    categories: PROFILE_ACHIEVEMENT_CATEGORIES,
    achievements,
    currentRank,
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

  const claims = await listMemberAchievementClaimsByUserId(userId);
  const catalog = buildAchievementCatalogForMember(member, claims);

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

  const existingClaim = await findMemberAchievementClaimByUserIdAndAchievementId(userId, achievement.id);
  if (existingClaim) {
    const claims = await listMemberAchievementClaimsByUserId(userId);
    const catalog = buildAchievementCatalogForMember(member, claims);
    return {
      success: false,
      status: 409,
      error: 'Achievement has already been claimed.',
      data: {
        success: false,
        claim: existingClaim,
        ...catalog,
      },
    };
  }

  const currentRank = resolveCurrentMemberRank(member);
  if (!isRankEligibleForAchievement(currentRank, achievement.requiredRank)) {
    const claims = await listMemberAchievementClaimsByUserId(userId);
    const catalog = buildAchievementCatalogForMember(member, claims);
    return {
      success: false,
      status: 403,
      error: `Current rank does not meet the requirement for ${achievement.title}.`,
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
      const conflictClaim = await findMemberAchievementClaimByUserIdAndAchievementId(userId, achievement.id);
      const claims = await listMemberAchievementClaimsByUserId(userId);
      const catalog = buildAchievementCatalogForMember(member, claims);
      return {
        success: false,
        status: 409,
        error: 'Achievement has already been claimed.',
        data: {
          success: false,
          claim: conflictClaim,
          ...catalog,
        },
      };
    }

    throw error;
  }

  const claims = await listMemberAchievementClaimsByUserId(userId);
  const catalog = buildAchievementCatalogForMember(member, claims);

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
