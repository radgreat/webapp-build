import { randomUUID } from 'crypto';
import {
  listMemberAchievementClaimsByUserId,
  findMemberAchievementClaimByUserIdAndAchievementId,
  findMemberAchievementClaimByUserIdAndAchievementIdAndPeriod,
  insertMemberAchievementClaim,
} from '../stores/member-achievement.store.js';
import { getBinaryTreeMetrics } from './metrics.service.js';
import { readRegisteredMembersStore } from '../stores/member.store.js';

const ACCOUNT_ACTIVITY_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

const PROFILE_ACHIEVEMENT_TABS = Object.freeze([
  Object.freeze({ id: 'premiere-life', label: 'Premiere Life' }),
]);

const PROFILE_ACHIEVEMENT_CATEGORIES = Object.freeze([
  Object.freeze({
    id: 'premiere-journey',
    tabId: 'premiere-life',
    label: 'Premiere Journey',
    description: 'Foundational achievements for your member journey.',
  }),
]);

const PROFILE_ACHIEVEMENTS = Object.freeze([
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
    requiredDirectSponsorsPerSide: 2,
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
    requiredDirectSponsorsPerSide: 3,
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
    requiredDirectSponsorsPerSide: 4,
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
    requiredDirectSponsorsPerSide: 5,
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
    requiredDirectSponsorsPerSide: 6,
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
    requiredDirectSponsorsPerSide: 7,
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
    requiredDirectSponsorsPerSide: 8,
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
    requiredDirectSponsorsPerSide: 9,
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

function resolveAccountActiveUntilMs(member = {}) {
  const explicitActiveUntilRaw = normalizeText(member?.activityActiveUntilAt || member?.activeUntilAt);
  const explicitActiveUntilMs = Date.parse(explicitActiveUntilRaw);
  if (Number.isFinite(explicitActiveUntilMs)) {
    return explicitActiveUntilMs;
  }

  const enrollmentDateRaw = normalizeText(member?.createdAt || member?.enrolledAt);
  const enrollmentDateMs = Date.parse(enrollmentDateRaw);
  if (Number.isFinite(enrollmentDateMs)) {
    return enrollmentDateMs + ACCOUNT_ACTIVITY_WINDOW_MS;
  }

  const purchaseDateRaw = normalizeText(member?.lastProductPurchaseAt || member?.lastPurchaseAt);
  const purchaseDateMs = Date.parse(purchaseDateRaw);
  if (Number.isFinite(purchaseDateMs)) {
    return purchaseDateMs + ACCOUNT_ACTIVITY_WINDOW_MS;
  }

  return NaN;
}

function resolveMemberActivityState(member = {}) {
  const activeUntilMs = resolveAccountActiveUntilMs(member);
  if (!Number.isFinite(activeUntilMs)) {
    return {
      isActive: false,
      label: 'Inactive',
      activeUntilAt: '',
    };
  }

  const isActive = Date.now() <= activeUntilMs;
  return {
    isActive,
    label: isActive ? 'Active' : 'Inactive',
    activeUntilAt: new Date(activeUntilMs).toISOString(),
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

async function resolveCurrentMemberDirectSponsorSummary(member = {}) {
  const sponsorUsername = normalizeCredential(member?.username || member?.memberUsername);
  if (!sponsorUsername) {
    return {
      leftDirectSponsors: 0,
      rightDirectSponsors: 0,
      totalDirectSponsors: 0,
    };
  }

  try {
    const registeredMembers = await readRegisteredMembersStore();
    let leftDirectSponsors = 0;
    let rightDirectSponsors = 0;

    (Array.isArray(registeredMembers) ? registeredMembers : []).forEach((entry) => {
      const entrySponsorUsername = normalizeCredential(entry?.sponsorUsername);
      if (!entrySponsorUsername || entrySponsorUsername !== sponsorUsername) {
        return;
      }

      const placementSide = normalizePlacementSideFromMember(entry);
      if (placementSide === 'right') {
        rightDirectSponsors += 1;
      } else {
        leftDirectSponsors += 1;
      }
    });

    return {
      leftDirectSponsors,
      rightDirectSponsors,
      totalDirectSponsors: leftDirectSponsors + rightDirectSponsors,
    };
  } catch {
    return {
      leftDirectSponsors: 0,
      rightDirectSponsors: 0,
      totalDirectSponsors: 0,
    };
  }
}

async function resolveCurrentMemberCycleCount(member = {}) {
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

  return {
    currentRank,
    currentCycles,
    ...directSponsorSummary,
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

function resolveRankMonthlyClaimContext(progressContext = {}, claims = [], rankClaimPeriod = '') {
  const safeRankClaimPeriod = normalizeText(rankClaimPeriod);
  const currentPeriodLabel = formatClaimPeriodLabel(safeRankClaimPeriod) || 'this month';
  const claimedRankClaim = resolveCurrentPeriodRankClaim(claims, safeRankClaimPeriod);
  const highestEligibleRankAchievement = resolveHighestEligibleRankAchievement(progressContext);

  return {
    rankClaimPeriod: safeRankClaimPeriod,
    currentPeriodLabel,
    claimedRankClaim,
    highestEligibleRankAchievementId: normalizeText(highestEligibleRankAchievement?.id),
    highestEligibleRankTitle: normalizeText(highestEligibleRankAchievement?.title),
  };
}

function evaluateAchievementEligibility(achievement = {}, progressContext = {}, claim = null, options = {}) {
  const requiredRank = normalizeRankLabelForAchievement(achievement?.requiredRank);
  const requiresRank = Boolean(requiredRank) && achievement?.requiresRank !== false;
  const requiredDirectSponsorsTotal = toWholeNumber(achievement?.requiredDirectSponsorsTotal, 0);
  const requiredDirectSponsorsPerSide = toWholeNumber(achievement?.requiredDirectSponsorsPerSide, 0);
  const requiredCycles = toWholeNumber(achievement?.requiredCycles, 0);
  const requiresActive = achievement?.requiresActive === true;
  const requiresSystemVerification = achievement?.requiresSystemVerification === true;
  const isRankTrack = isRankAdvancementAchievement(achievement);
  const rankMonthlyContext = options?.rankMonthlyContext && typeof options.rankMonthlyContext === 'object'
    ? options.rankMonthlyContext
    : {};
  const currentPeriodLabel = normalizeText(rankMonthlyContext?.currentPeriodLabel) || 'this month';
  const highestEligibleRankAchievementId = normalizeText(rankMonthlyContext?.highestEligibleRankAchievementId);
  const highestEligibleRankTitle = normalizeText(rankMonthlyContext?.highestEligibleRankTitle);
  const claimedRankClaim = rankMonthlyContext?.claimedRankClaim && typeof rankMonthlyContext.claimedRankClaim === 'object'
    ? rankMonthlyContext.claimedRankClaim
    : null;

  const currentRank = normalizeRankLabelForAchievement(progressContext?.currentRank) || 'Unranked';
  const currentLeftDirectSponsors = toWholeNumber(progressContext?.leftDirectSponsors, 0);
  const currentRightDirectSponsors = toWholeNumber(progressContext?.rightDirectSponsors, 0);
  const currentDirectSponsorsTotal = toWholeNumber(
    progressContext?.totalDirectSponsors,
    currentLeftDirectSponsors + currentRightDirectSponsors,
  );
  const currentCycles = toWholeNumber(progressContext?.currentCycles, 0);
  const activityState = progressContext?.activityState && typeof progressContext.activityState === 'object'
    ? progressContext.activityState
    : { isActive: false, label: 'Inactive', activeUntilAt: '' };

  const alreadyClaimed = Boolean(claim?.claimedAt);
  const meetsRankRequirement = requiresRank
    ? isRankEligibleForAchievement(currentRank, requiredRank)
    : true;
  const meetsDirectSponsorTotalRequirement = requiredDirectSponsorsTotal > 0
    ? currentDirectSponsorsTotal >= requiredDirectSponsorsTotal
    : true;
  const meetsDirectSponsorRequirement = requiredDirectSponsorsPerSide > 0
    ? (
      currentLeftDirectSponsors >= requiredDirectSponsorsPerSide
      && currentRightDirectSponsors >= requiredDirectSponsorsPerSide
    )
    : true;
  const meetsCycleRequirement = requiredCycles > 0
    ? currentCycles >= requiredCycles
    : true;
  const meetsActiveRequirement = requiresActive
    ? Boolean(activityState.isActive)
    : true;

  const baseRequirementsMet = (
    meetsRankRequirement
    && meetsDirectSponsorTotalRequirement
    && meetsDirectSponsorRequirement
    && meetsCycleRequirement
    && meetsActiveRequirement
  );
  const systemVerified = alreadyClaimed
    ? true
    : (requiresSystemVerification ? baseRequirementsMet : true);
  let eligible = alreadyClaimed
    ? true
    : (baseRequirementsMet && systemVerified);
  let status = alreadyClaimed
    ? 'claimed'
    : (eligible ? 'eligible' : 'locked');

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

  let lockReason = '';
  if (!alreadyClaimed && requiresRank && !meetsRankRequirement) {
    lockReason = `Reach ${requiredRank} rank to unlock this bonus.`;
  } else if (!alreadyClaimed && requiredDirectSponsorsTotal > 0 && !meetsDirectSponsorTotalRequirement) {
    lockReason = `Enroll ${requiredDirectSponsorsTotal.toLocaleString()} member${requiredDirectSponsorsTotal === 1 ? '' : 's'} (${currentDirectSponsorsTotal.toLocaleString()}/${requiredDirectSponsorsTotal.toLocaleString()}).`;
  } else if (!alreadyClaimed && requiredDirectSponsorsPerSide > 0 && !meetsDirectSponsorRequirement) {
    lockReason = isRankTrack
      ? `Direct sponsors this month must be balanced at ${requiredDirectSponsorsPerSide.toLocaleString()}:${requiredDirectSponsorsPerSide.toLocaleString()} (Left ${currentLeftDirectSponsors.toLocaleString()}, Right ${currentRightDirectSponsors.toLocaleString()}).`
      : `Direct sponsors must be balanced at ${requiredDirectSponsorsPerSide.toLocaleString()}:${requiredDirectSponsorsPerSide.toLocaleString()} (Left ${currentLeftDirectSponsors.toLocaleString()}, Right ${currentRightDirectSponsors.toLocaleString()}).`;
  } else if (!alreadyClaimed && requiredCycles > 0 && !meetsCycleRequirement) {
    lockReason = isRankTrack
      ? `Complete ${requiredCycles.toLocaleString()} cycles this month (${currentCycles.toLocaleString()} completed).`
      : `Complete ${requiredCycles.toLocaleString()} cycles (${currentCycles.toLocaleString()} completed).`;
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

    if (claimedRankClaim) {
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
      lockReason = `Only the highest eligible rank can be claimed this month (${highestEligibleRankTitle || 'top eligible rank'}).`;
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
    requiresActive,
    requiresSystemVerification,
    systemVerified,
    verificationStatus: systemVerified ? 'verified' : 'pending',
    requirements,
    prerequisites,
  };
}

function buildAchievementCatalogForMember(member, claims = [], progressContext = {}, options = {}) {
  const rankClaimPeriod = normalizeText(options?.rankClaimPeriod)
    || resolveClaimPeriodKeyFromDate(Date.now());
  const currentRank = normalizeRankLabelForAchievement(progressContext?.currentRank)
    || resolveCurrentMemberRank(member);
  const currentLeftDirectSponsors = toWholeNumber(progressContext?.leftDirectSponsors, 0);
  const currentRightDirectSponsors = toWholeNumber(progressContext?.rightDirectSponsors, 0);
  const currentDirectSponsorsTotal = toWholeNumber(
    progressContext?.totalDirectSponsors,
    currentLeftDirectSponsors + currentRightDirectSponsors,
  );
  const currentCycles = toWholeNumber(progressContext?.currentCycles, 0);
  const activityState = progressContext?.activityState && typeof progressContext.activityState === 'object'
    ? progressContext.activityState
    : resolveMemberActivityState(member);
  const rankMonthlyContext = resolveRankMonthlyClaimContext({
    currentRank,
    leftDirectSponsors: currentLeftDirectSponsors,
    rightDirectSponsors: currentRightDirectSponsors,
    totalDirectSponsors: currentDirectSponsorsTotal,
    currentCycles,
    activityState,
  }, claims, rankClaimPeriod);
  const claimMap = mapClaimsByAchievementId(claims, { rankClaimPeriod });

  const achievements = PROFILE_ACHIEVEMENTS.map((achievement) => {
    const claim = claimMap.get(achievement.id) || null;
    const eligibility = evaluateAchievementEligibility(achievement, {
      currentRank,
      leftDirectSponsors: currentLeftDirectSponsors,
      rightDirectSponsors: currentRightDirectSponsors,
      totalDirectSponsors: currentDirectSponsorsTotal,
      currentCycles,
      activityState,
    }, claim, {
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
      rewardUsd: roundCurrencyAmount(achievement.rewardUsd),
      rewardLabel: normalizeText(achievement.rewardLabel),
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
    rankClaimPeriod,
    rankClaimPeriodLabel: rankMonthlyContext.currentPeriodLabel,
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
  const rankClaimPeriod = normalizeText(options?.rankClaimPeriod)
    || resolveClaimPeriodKeyFromDate(Date.now());
  const [claims, progressContext] = await Promise.all([
    listMemberAchievementClaimsByUserId(userId),
    resolveCurrentMemberProgressContext(member),
  ]);

  return buildAchievementCatalogForMember(member, claims, progressContext, {
    rankClaimPeriod,
  });
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

  const claimAttemptMs = Date.now();
  const rankClaimPeriod = resolveClaimPeriodKeyFromDate(claimAttemptMs);
  const claimPeriod = resolveAchievementClaimPeriod(achievement, claimAttemptMs);

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
      ? `Rank reward has already been claimed for ${periodLabel || 'this month'}.`
      : 'Achievement has already been claimed.';
    const catalog = await buildCatalogForMemberWithLatestState(member, userId, { rankClaimPeriod });
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

  const [allClaims, progressContext] = await Promise.all([
    listMemberAchievementClaimsByUserId(userId),
    resolveCurrentMemberProgressContext(member),
  ]);
  const rankMonthlyContext = resolveRankMonthlyClaimContext(progressContext, allClaims, rankClaimPeriod);

  if (isRankAdvancementAchievement(achievement) && rankMonthlyContext?.claimedRankClaim) {
    const claimedRankTitle = normalizeText(
      rankMonthlyContext.claimedRankClaim?.title
      || rankMonthlyContext.claimedRankClaim?.requiredRank,
    ) || 'another rank';
    const catalog = buildAchievementCatalogForMember(member, allClaims, progressContext, {
      rankClaimPeriod,
    });
    return {
      success: false,
      status: 409,
      error: `Rank reward already claimed for ${rankMonthlyContext.currentPeriodLabel || 'this month'} (${claimedRankTitle}).`,
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
  if (!achievementEligibility.eligible) {
    const catalog = buildAchievementCatalogForMember(member, allClaims, progressContext, {
      rankClaimPeriod,
    });
    return {
      success: false,
      status: 403,
      error: achievementEligibility.lockReason || `Current requirements do not meet ${achievement.title}.`,
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
        ? `Rank reward already claimed for ${formatClaimPeriodLabel(rankClaimPeriod) || 'this month'}.`
        : 'Achievement has already been claimed.';
      const catalog = await buildCatalogForMemberWithLatestState(member, userId, { rankClaimPeriod });
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

  const catalog = await buildCatalogForMemberWithLatestState(member, userId, { rankClaimPeriod });

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
