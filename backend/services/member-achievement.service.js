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
import {
  readMemberProfileBadgeSelectionByUserId,
  upsertMemberProfileBadgeSelection,
} from '../stores/member-profile-badge-selection.store.js';
import { getBinaryTreeMetrics } from './metrics.service.js';
import {
  readRegisteredMembersStore,
  upsertRegisteredMemberRecord,
} from '../stores/member.store.js';
import { findUserById, updateUserById } from '../stores/user.store.js';
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
const FOUNDING_AMBASSADOR_PACKAGE_KEY_SET = new Set([
  'personal-builder-pack',
  'business-builder-pack',
  'infinity-builder-pack',
  'legacy-builder-pack',
]);
const FOUNDING_AMBASSADOR_ICON_PATH = '/brand_assets/Icons/Title-Icons/legacy-founder-star.svg';
const FOUNDING_AMBASSADOR_ICON_LIGHT_PATH = '/brand_assets/Icons/Title-Icons/legacy-founder-star-light.svg';
const DEFAULT_MEMBER_TITLE_CATALOG_SEED = Object.freeze([
  Object.freeze({
    titleSlug: 'founding-ambassador',
    title: 'Founding Ambassador',
    description: 'Awarded to members who purchase or upgrade to a package from Personal through Legacy.',
    iconPath: '/brand_assets/Icons/Title-Icons/legacy-founder-star.svg',
    sourceAchievementId: 'premiere-life-founding-ambassador',
    sourceEventId: '',
    claimRule: 'achievement',
    isActive: true,
    metadata: Object.freeze({
      eventName: 'Premiere Life',
      rewardType: 'title',
      level: 1,
      managedBy: 'system-seed',
    }),
  }),
  Object.freeze({
    titleSlug: 'infinity-builder',
    title: 'Infinity Builder',
    description: 'Awarded to members who purchase or upgrade to the Infinity Builder package.',
    iconPath: '/brand_assets/Icons/Achievements/infinity.svg',
    sourceAchievementId: 'premiere-life-infinity-builder',
    sourceEventId: '',
    claimRule: 'achievement',
    isActive: true,
    metadata: Object.freeze({
      eventName: 'Premiere Life',
      rewardType: 'title',
      level: 2,
      managedBy: 'system-seed',
    }),
  }),
  Object.freeze({
    titleSlug: 'legacy-builder',
    title: 'Legacy Builder',
    description: 'Awarded to members who purchase or upgrade to the Legacy Builder package.',
    iconPath: '/brand_assets/Icons/Achievements/legacy.svg',
    sourceAchievementId: 'premiere-life-legacy-builder',
    sourceEventId: '',
    claimRule: 'achievement',
    isActive: true,
    metadata: Object.freeze({
      eventName: 'Premiere Life',
      rewardType: 'title',
      level: 3,
      managedBy: 'system-seed',
    }),
  }),
  Object.freeze({
    titleSlug: 'leadership-race-club',
    title: 'Leadership Race - Club',
    description: 'Awarded when rank is within Ruby through Sapphire leagues.',
    iconPath: '/brand_assets/Icons/Achievements/ruby.svg',
    sourceAchievementId: 'premiere-life-leadership-race-club',
    sourceEventId: '',
    claimRule: 'achievement',
    isActive: true,
    metadata: Object.freeze({
      eventName: 'Leadership Race',
      rewardType: 'title',
      level: 4,
      managedBy: 'system-seed',
    }),
  }),
  Object.freeze({
    titleSlug: 'leadership-race-squad',
    title: 'Leadership Race - Squad',
    description: 'Awarded when rank is within Diamond through Black Diamond leagues.',
    iconPath: '/brand_assets/Icons/Achievements/diamond.svg',
    sourceAchievementId: 'premiere-life-leadership-race-squad',
    sourceEventId: '',
    claimRule: 'achievement',
    isActive: true,
    metadata: Object.freeze({
      eventName: 'Leadership Race',
      rewardType: 'title',
      level: 5,
      managedBy: 'system-seed',
    }),
  }),
  Object.freeze({
    titleSlug: 'leadership-race-commander',
    title: 'Leadership Race - Commander',
    description: 'Awarded when rank is within Crown through Royal Crown leagues.',
    iconPath: '/brand_assets/Icons/Achievements/crown.svg',
    sourceAchievementId: 'premiere-life-leadership-race-commander',
    sourceEventId: '',
    claimRule: 'achievement',
    isActive: true,
    metadata: Object.freeze({
      eventName: 'Leadership Race',
      rewardType: 'title',
      level: 6,
      managedBy: 'system-seed',
    }),
  }),
  Object.freeze({
    titleSlug: 'executive-ambassador',
    title: 'Executive Ambassador',
    description: 'Awarded when purchasing or upgrading to Legacy Builder package for Legacy Leadership bonus access.',
    iconPath: '/brand_assets/Icons/Title-Icons/legacy-founder-star.svg',
    sourceAchievementId: 'time-limited-event-legacy-founder',
    sourceEventId: LEGACY_BUILDER_EVENT_ID,
    claimRule: 'achievement',
    isActive: true,
    metadata: Object.freeze({
      eventName: 'Legacy Builder Leadership Program',
      rewardType: 'title',
      level: 7,
      managedBy: 'system-seed',
    }),
  }),
  Object.freeze({
    titleSlug: 'regional-ambassador',
    title: 'Regional Ambassador',
    description: 'Awarded when first three Legacy Tier 1 nodes are filled.',
    iconPath: '/brand_assets/Icons/Title-Icons/legacy-director-star.svg',
    sourceAchievementId: 'time-limited-event-legacy-director',
    sourceEventId: LEGACY_BUILDER_EVENT_ID,
    claimRule: 'achievement',
    isActive: true,
    metadata: Object.freeze({
      eventName: 'Legacy Builder Leadership Program',
      rewardType: 'title',
      level: 8,
      managedBy: 'system-seed',
    }),
  }),
  Object.freeze({
    titleSlug: 'national-ambassador',
    title: 'National Ambassador',
    description: 'Awarded when first-level three nodes each enroll three nodes (3x3 = 9).',
    iconPath: '/brand_assets/Icons/Title-Icons/legacy-ambassador-star.svg',
    sourceAchievementId: 'time-limited-event-legacy-ambassador',
    sourceEventId: LEGACY_BUILDER_EVENT_ID,
    claimRule: 'achievement',
    isActive: true,
    metadata: Object.freeze({
      eventName: 'Legacy Builder Leadership Program',
      rewardType: 'title',
      level: 9,
      managedBy: 'system-seed',
    }),
  }),
  Object.freeze({
    titleSlug: 'global-ambassador',
    title: 'Global Ambassador',
    description: 'Awarded when nine first-level nodes each enroll three nodes (9x3 = 27).',
    iconPath: '/brand_assets/Icons/Title-Icons/presidential-circle-star.svg',
    sourceAchievementId: 'time-limited-event-presidential-circle',
    sourceEventId: LEGACY_BUILDER_EVENT_ID,
    claimRule: 'achievement',
    isActive: true,
    metadata: Object.freeze({
      eventName: 'Legacy Builder Leadership Program',
      rewardType: 'title',
      level: 10,
      managedBy: 'system-seed',
    }),
  }),
  Object.freeze({
    titleSlug: 'presidential-ambassador-sovereign',
    title: 'Presidential Ambassador Sovereign',
    description: 'Awarded when Legacy Tier 1 is completed (40 nodes).',
    iconPath: '/brand_assets/Icons/Title-Icons/legacy-founder-star.svg',
    sourceAchievementId: 'time-limited-event-presidential-ambassador-sovereign',
    sourceEventId: LEGACY_BUILDER_EVENT_ID,
    claimRule: 'achievement',
    isActive: true,
    metadata: Object.freeze({
      eventName: 'Legacy Matrix Builder',
      rewardType: 'title',
      level: 11,
      managedBy: 'system-seed',
    }),
  }),
  Object.freeze({
    titleSlug: 'presidential-ambassador-round-table',
    title: 'Presidential Ambassador Round Table',
    description: 'Awarded when Legacy Tier 2 is completed (40 nodes).',
    iconPath: '/brand_assets/Icons/Title-Icons/legacy-director-star.svg',
    sourceAchievementId: 'time-limited-event-presidential-ambassador-round-table',
    sourceEventId: LEGACY_BUILDER_EVENT_ID,
    claimRule: 'achievement',
    isActive: true,
    metadata: Object.freeze({
      eventName: 'Legacy Matrix Builder',
      rewardType: 'title',
      level: 12,
      managedBy: 'system-seed',
    }),
  }),
  Object.freeze({
    titleSlug: 'presidential-ambassador-elite',
    title: 'Presidential Ambassador Elite',
    description: 'Awarded when Legacy Tier 3 is completed (40 nodes) and Business Center #1 unlocks.',
    iconPath: '/brand_assets/Icons/Title-Icons/legacy-ambassador-star.svg',
    sourceAchievementId: 'time-limited-event-presidential-ambassador-elite',
    sourceEventId: LEGACY_BUILDER_EVENT_ID,
    claimRule: 'achievement',
    isActive: true,
    metadata: Object.freeze({
      eventName: 'Legacy Matrix Builder',
      rewardType: 'title',
      level: 13,
      managedBy: 'system-seed',
    }),
  }),
  Object.freeze({
    titleSlug: 'presidential-grand-ambassador-royale',
    title: 'Presidential Grand Ambassador Royale',
    description: 'Awarded when Legacy Tier 4 is completed (40 nodes) and Business Center #2 unlocks.',
    iconPath: '/brand_assets/Icons/Title-Icons/presidential-circle-star.svg',
    sourceAchievementId: 'time-limited-event-presidential-grand-ambassador-royale',
    sourceEventId: LEGACY_BUILDER_EVENT_ID,
    claimRule: 'achievement',
    isActive: true,
    metadata: Object.freeze({
      eventName: 'Legacy Matrix Builder',
      rewardType: 'title',
      level: 14,
      managedBy: 'system-seed',
    }),
  }),
].map((entry) => Object.freeze({
  ...entry,
  iconPath: FOUNDING_AMBASSADOR_ICON_PATH,
})));

const PROFILE_ACHIEVEMENT_TABS = Object.freeze([
  Object.freeze({ id: 'time-limited-event', label: 'Time-Limited Event' }),
  Object.freeze({ id: 'premiere-life', label: 'Premiere Life' }),
]);

const PROFILE_ACHIEVEMENT_CATEGORIES = Object.freeze([
  Object.freeze({
    id: 'legacy-builder-leadership-program',
    tabId: 'time-limited-event',
    label: 'Legacy Builder Leadership Program',
    description: 'Limited-time ambassador progression track.',
  }),
  Object.freeze({
    id: 'legacy-matrix-builder',
    tabId: 'time-limited-event',
    label: 'Legacy Matrix Builder',
    description: 'Legacy Matrix tier-completion title progression.',
  }),
  Object.freeze({
    id: 'premiere-life-milestones',
    tabId: 'premiere-life',
    label: 'Premiere Life',
    description: 'Core package and account upgrade title milestones.',
  }),
  Object.freeze({
    id: 'leadership-race',
    tabId: 'premiere-life',
    label: 'Leadership Race',
    description: 'League titles unlocked by qualifying rank ranges.',
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
    id: 'premiere-life-founding-ambassador',
    tabId: 'premiere-life',
    categoryId: 'premiere-life-milestones',
    title: 'Founding Ambassador',
    description: 'Purchase or upgrade to any package from Personal through Legacy.',
    requiredAnyOwnedPackageKeys: Array.from(FOUNDING_AMBASSADOR_PACKAGE_KEY_SET).map((packageKey) => Object.freeze({
      packageKey,
      label: (
        packageKey === 'personal-builder-pack' ? 'Personal Builder Package'
          : packageKey === 'business-builder-pack' ? 'Business Builder Package'
            : packageKey === 'infinity-builder-pack' ? 'Infinity Builder Package'
              : 'Legacy Builder Package'
      ),
    })),
    rewardUsd: 0,
    rewardType: 'title',
    rewardTitleSlug: 'founding-ambassador',
    rewardTitle: 'Founding Ambassador',
    rewardLabel: 'Title: Founding Ambassador',
    requiresActive: false,
    requiresSystemVerification: false,
    iconPath: '/brand_assets/Icons/Title-Icons/legacy-founder-star.svg',
    iconLightPath: '/brand_assets/Icons/Title-Icons/legacy-founder-star-light.svg',
  }),
  Object.freeze({
    id: 'premiere-life-infinity-builder',
    tabId: 'premiere-life',
    categoryId: 'premiere-life-milestones',
    title: 'Infinity Builder',
    description: 'Purchase or upgrade to Infinity Builder package. Legacy Builder package owners are also eligible.',
    requiredAnyOwnedPackageKeys: [
      Object.freeze({
        packageKey: 'infinity-builder-pack',
        label: 'Infinity Builder Package',
      }),
      Object.freeze({
        packageKey: 'legacy-builder-pack',
        label: 'Legacy Builder Package',
      }),
    ],
    rewardUsd: 0,
    rewardType: 'title',
    rewardTitleSlug: 'infinity-builder',
    rewardTitle: 'Infinity Builder',
    rewardLabel: 'Title: Infinity Builder',
    requiresActive: false,
    requiresSystemVerification: false,
    iconPath: '/brand_assets/Icons/Achievements/infinity.svg',
    iconLightPath: '/brand_assets/Icons/Achievements/infinity-light.svg',
  }),
  Object.freeze({
    id: 'premiere-life-legacy-builder',
    tabId: 'premiere-life',
    categoryId: 'premiere-life-milestones',
    title: 'Legacy Builder',
    description: 'Purchase or upgrade to Legacy Builder package.',
    requiresLegacyPackageOwnership: true,
    rewardUsd: 0,
    rewardType: 'title',
    rewardTitleSlug: 'legacy-builder',
    rewardTitle: 'Legacy Builder',
    rewardLabel: 'Title: Legacy Builder',
    requiresActive: false,
    requiresSystemVerification: false,
    iconPath: '/brand_assets/Icons/Achievements/legacy.svg',
    iconLightPath: '/brand_assets/Icons/Achievements/legacy-light.svg',
  }),
  Object.freeze({
    id: 'premiere-life-leadership-race-club',
    tabId: 'premiere-life',
    categoryId: 'leadership-race',
    title: 'Leadership Race - Club',
    description: 'Unlocked for ranks Ruby through Sapphire.',
    requiredRankMin: 'Ruby',
    requiredRankMax: 'Sapphire',
    rewardUsd: 0,
    rewardType: 'title',
    rewardTitleSlug: 'leadership-race-club',
    rewardTitle: 'Leadership Race - Club',
    rewardLabel: 'Title: Leadership Race - Club',
    requiresActive: false,
    requiresSystemVerification: false,
    iconPath: '/brand_assets/Icons/Achievements/ruby.svg',
    iconLightPath: '/brand_assets/Icons/Achievements/ruby-light.svg',
  }),
  Object.freeze({
    id: 'premiere-life-leadership-race-squad',
    tabId: 'premiere-life',
    categoryId: 'leadership-race',
    title: 'Leadership Race - Squad',
    description: 'Unlocked for ranks Diamond through Black Diamond.',
    requiredRankMin: 'Diamond',
    requiredRankMax: 'Black Diamond',
    rewardUsd: 0,
    rewardType: 'title',
    rewardTitleSlug: 'leadership-race-squad',
    rewardTitle: 'Leadership Race - Squad',
    rewardLabel: 'Title: Leadership Race - Squad',
    requiresActive: false,
    requiresSystemVerification: false,
    iconPath: '/brand_assets/Icons/Achievements/diamond.svg',
    iconLightPath: '/brand_assets/Icons/Achievements/diamond-light.svg',
  }),
  Object.freeze({
    id: 'premiere-life-leadership-race-commander',
    tabId: 'premiere-life',
    categoryId: 'leadership-race',
    title: 'Leadership Race - Commander',
    description: 'Unlocked for ranks Crown through Royal Crown.',
    requiredRankMin: 'Crown',
    requiredRankMax: 'Royal Crown',
    rewardUsd: 0,
    rewardType: 'title',
    rewardTitleSlug: 'leadership-race-commander',
    rewardTitle: 'Leadership Race - Commander',
    rewardLabel: 'Title: Leadership Race - Commander',
    requiresActive: false,
    requiresSystemVerification: false,
    iconPath: '/brand_assets/Icons/Achievements/crown.svg',
    iconLightPath: '/brand_assets/Icons/Achievements/crown-light.svg',
  }),
  Object.freeze({
    id: 'time-limited-event-legacy-founder',
    tabId: 'time-limited-event',
    categoryId: 'legacy-builder-leadership-program',
    title: 'Executive Ambassador',
    description: 'Upgrade or purchase a Legacy Builder package to unlock the Legacy Leadership bonus.',
    requiresLegacyPackageOwnership: true,
    rewardUsd: 0,
    rewardType: 'title',
    rewardTitleSlug: 'executive-ambassador',
    rewardTitle: 'Executive Ambassador',
    rewardLabel: 'Title: Executive Ambassador',
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
    title: 'Regional Ambassador',
    description: 'Fill your first three nodes on Legacy Leadership Bonus Tier 1.',
    requiredLegacyBuilderDirectEnrollments: 3,
    rewardUsd: 0,
    rewardType: 'title',
    rewardTitleSlug: 'regional-ambassador',
    rewardTitle: 'Regional Ambassador',
    rewardLabel: 'Title: Regional Ambassador',
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
    title: 'National Ambassador',
    description: 'Have your first 3 Tier 1 nodes each enroll three nodes (3 x 3 = 9).',
    requiredLegacyBuilderSecondLevelEnrollments: 9,
    rewardUsd: 0,
    rewardType: 'title',
    rewardTitleSlug: 'national-ambassador',
    rewardTitle: 'National Ambassador',
    rewardLabel: 'Title: National Ambassador',
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
    title: 'Global Ambassador',
    description: 'Have your 9 Tier 1 nodes each enroll three nodes (9 x 3 = 27).',
    requiredLegacyBuilderThirdLevelEnrollments: 27,
    rewardUsd: 0,
    rewardType: 'title',
    rewardTitleSlug: 'global-ambassador',
    rewardTitle: 'Global Ambassador',
    rewardLabel: 'Title: Global Ambassador',
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
    id: 'time-limited-event-presidential-ambassador-sovereign',
    tabId: 'time-limited-event',
    categoryId: 'legacy-matrix-builder',
    title: 'Presidential Ambassador Sovereign',
    description: 'Complete Legacy Tier 1 (40 nodes).',
    requiredLegacyLeadershipCompletedTierCount: 1,
    rewardUsd: 0,
    rewardType: 'title',
    rewardTitleSlug: 'presidential-ambassador-sovereign',
    rewardTitle: 'Presidential Ambassador Sovereign',
    rewardLabel: 'Title: Presidential Ambassador Sovereign',
    requiresActive: false,
    requiresSystemVerification: false,
    eventId: LEGACY_BUILDER_EVENT_ID,
    eventName: 'Legacy Matrix Builder',
    eventStartAt: LEGACY_BUILDER_EVENT_START_AT,
    eventEndAt: LEGACY_BUILDER_EVENT_END_AT,
    iconPath: '/brand_assets/Icons/Title-Icons/legacy-founder-star.svg',
    iconLightPath: '/brand_assets/Icons/Title-Icons/legacy-founder-star-light.svg',
  }),
  Object.freeze({
    id: 'time-limited-event-presidential-ambassador-round-table',
    tabId: 'time-limited-event',
    categoryId: 'legacy-matrix-builder',
    title: 'Presidential Ambassador Round Table',
    description: 'Complete Legacy Tier 2 (40 nodes).',
    requiredLegacyLeadershipCompletedTierCount: 2,
    rewardUsd: 0,
    rewardType: 'title',
    rewardTitleSlug: 'presidential-ambassador-round-table',
    rewardTitle: 'Presidential Ambassador Round Table',
    rewardLabel: 'Title: Presidential Ambassador Round Table',
    requiresActive: false,
    requiresSystemVerification: false,
    eventId: LEGACY_BUILDER_EVENT_ID,
    eventName: 'Legacy Matrix Builder',
    eventStartAt: LEGACY_BUILDER_EVENT_START_AT,
    eventEndAt: LEGACY_BUILDER_EVENT_END_AT,
    iconPath: '/brand_assets/Icons/Title-Icons/legacy-director-star.svg',
    iconLightPath: '/brand_assets/Icons/Title-Icons/legacy-director-star-light.svg',
  }),
  Object.freeze({
    id: 'time-limited-event-presidential-ambassador-elite',
    tabId: 'time-limited-event',
    categoryId: 'legacy-matrix-builder',
    title: 'Presidential Ambassador Elite',
    description: 'Complete Legacy Tier 3 (40 nodes). Business Center #1 unlocks at completion.',
    requiredLegacyLeadershipCompletedTierCount: 3,
    rewardUsd: 0,
    rewardType: 'title',
    rewardTitleSlug: 'presidential-ambassador-elite',
    rewardTitle: 'Presidential Ambassador Elite',
    rewardLabel: 'Title: Presidential Ambassador Elite',
    requiresActive: false,
    requiresSystemVerification: false,
    eventId: LEGACY_BUILDER_EVENT_ID,
    eventName: 'Legacy Matrix Builder',
    eventStartAt: LEGACY_BUILDER_EVENT_START_AT,
    eventEndAt: LEGACY_BUILDER_EVENT_END_AT,
    iconPath: '/brand_assets/Icons/Title-Icons/legacy-ambassador-star.svg',
    iconLightPath: '/brand_assets/Icons/Title-Icons/legacy-ambassador-star-light.svg',
  }),
  Object.freeze({
    id: 'time-limited-event-presidential-grand-ambassador-royale',
    tabId: 'time-limited-event',
    categoryId: 'legacy-matrix-builder',
    title: 'Presidential Grand Ambassador Royale',
    description: 'Complete Legacy Tier 4 (40 nodes). Business Center #2 unlocks at completion.',
    requiredLegacyLeadershipCompletedTierCount: 4,
    rewardUsd: 0,
    rewardType: 'title',
    rewardTitleSlug: 'presidential-grand-ambassador-royale',
    rewardTitle: 'Presidential Grand Ambassador Royale',
    rewardLabel: 'Title: Presidential Grand Ambassador Royale',
    requiresActive: false,
    requiresSystemVerification: false,
    eventId: LEGACY_BUILDER_EVENT_ID,
    eventName: 'Legacy Matrix Builder',
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
    id: 'premiere-journey-enroll-three-members',
    tabId: 'premiere-life',
    categoryId: 'premiere-journey',
    title: 'Build Your First 3 Members',
    description: 'Enroll 3 members',
    requiredDirectSponsorsTotal: 3,
    rewardUsd: 0,
    rewardLabel: 'Milestone',
    payoutSchedule: 'Claim milestone',
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
].map((achievement) => {
  if (normalizeCredential(achievement?.tabId) === 'rank') {
    return Object.freeze(achievement);
  }
  return Object.freeze({
    ...achievement,
    iconPath: FOUNDING_AMBASSADOR_ICON_PATH,
    iconLightPath: FOUNDING_AMBASSADOR_ICON_LIGHT_PATH,
  });
}));

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

async function resolveMemberProgressSource(member = {}, userIdInput = '') {
  const userId = normalizeText(userIdInput || member?.id);
  const sourceMember = member && typeof member === 'object' ? member : {};
  if (!userId) {
    return sourceMember;
  }

  try {
    const storedMember = await findUserById(userId);
    if (!storedMember || typeof storedMember !== 'object') {
      return sourceMember;
    }
    return {
      ...sourceMember,
      ...storedMember,
      id: userId,
    };
  } catch {
    return sourceMember;
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
  const lastUpgradedEnrollmentPackageKey = normalizePackageKey(
    member?.lastAccountUpgradeToPackage
    || member?.last_upgrade_to_package
    || member?.upgradedToPackage,
  );
  const hasLegacyPackageOwnership = (
    LEGACY_BUILDER_PACKAGE_KEY_SET.has(currentEnrollmentPackageKey)
    || LEGACY_BUILDER_PACKAGE_KEY_SET.has(lastUpgradedEnrollmentPackageKey)
  );
  const legacyLeadershipTierCardCompleted = Boolean(
    member?.legacyLeadershipTierCardCompleted
    || member?.legacyLeadershipTierCompleted
    || normalizeCredential(member?.legacyLeadershipTierCardStatus) === 'completed'
    || normalizeCredential(member?.legacyLeadershipTierStatus) === 'completed',
  );
  const legacyLeadershipCompletedTierCount = Math.max(
    0,
    toWholeNumber(
      member?.legacyLeadershipCompletedTierCount
      ?? member?.legacy_leadership_completed_tier_count
      ?? member?.sourceQualificationTier
      ?? member?.source_qualification_tier
      ?? member?.legacyLeadershipTierCompletedCount,
      0,
    ),
  );

  return {
    currentRank,
    currentCycles,
    currentPersonalPvBv,
    ...directSponsorSummary,
    currentEnrollmentPackageKey,
    lastUpgradedEnrollmentPackageKey,
    hasLegacyPackageOwnership,
    legacyLeadershipTierCardCompleted,
    legacyLeadershipCompletedTierCount,
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

function resolvePreferredTitleAchievementIdFromAwards(titleAwards = [], claimMap = new Map()) {
  const sourceAwards = Array.isArray(titleAwards) ? titleAwards : [];
  for (const award of sourceAwards) {
    const sourceAchievementId = normalizeText(award?.sourceAchievementId);
    if (sourceAchievementId && claimMap.has(sourceAchievementId)) {
      return sourceAchievementId;
    }
  }
  return '';
}

function resolveDefaultEquippedProfileBadgeAchievementId(claims = [], titleAwards = []) {
  const claimMap = mapClaimsByAchievementId(claims);
  const preferredTitleAchievementId = resolvePreferredTitleAchievementIdFromAwards(titleAwards, claimMap);
  if (preferredTitleAchievementId) {
    return preferredTitleAchievementId;
  }

  const firstClaimWithAchievement = (Array.isArray(claims) ? claims : []).find((claim) => (
    Boolean(normalizeText(claim?.achievementId))
  ));
  return normalizeText(firstClaimWithAchievement?.achievementId);
}

function resolveEquippedProfileBadgeAchievementId(equippedIdInput = '', claims = [], titleAwards = []) {
  const equippedId = normalizeText(equippedIdInput);
  const claimMap = mapClaimsByAchievementId(claims);
  if (equippedId && claimMap.has(equippedId)) {
    return equippedId;
  }
  return resolveDefaultEquippedProfileBadgeAchievementId(claims, titleAwards);
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
  const requiredRankMin = normalizeRankLabelForAchievement(
    achievement?.requiredRankMin
    || achievement?.requiredRank,
  );
  const requiredRankMax = normalizeRankLabelForAchievement(achievement?.requiredRankMax);
  const hasRankRequirement = Boolean(requiredRankMin || requiredRankMax);
  const requiresRank = hasRankRequirement && achievement?.requiresRank !== false;
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
  const requiredAnyOwnedPackageKeys = (Array.isArray(achievement?.requiredAnyOwnedPackageKeys)
    ? achievement.requiredAnyOwnedPackageKeys
    : [])
    .map((entry) => {
      const packageKey = normalizePackageKey(entry?.packageKey || entry?.id || entry);
      const packageLabel = normalizeText(entry?.label || entry?.packageLabel || packageKey || 'Package');
      return {
        packageKey,
        packageLabel,
      };
    })
    .filter((entry) => entry.packageKey);
  const requiredLegacyLeadershipCompletedTierCount = toWholeNumber(
    achievement?.requiredLegacyLeadershipCompletedTierCount,
    0,
  );
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
  const currentEnrollmentPackageKey = normalizePackageKey(progressContext?.currentEnrollmentPackageKey);
  const lastUpgradedEnrollmentPackageKey = normalizePackageKey(progressContext?.lastUpgradedEnrollmentPackageKey);
  const currentRankKey = normalizeCredential(currentRank);
  const currentOwnedPackageKeys = new Set(
    [currentEnrollmentPackageKey, lastUpgradedEnrollmentPackageKey].filter(Boolean),
  );
  const hasLegacyPackageOwnership = (
    Boolean(progressContext?.hasLegacyPackageOwnership)
    || LEGACY_BUILDER_PACKAGE_KEY_SET.has(currentEnrollmentPackageKey)
    || LEGACY_BUILDER_PACKAGE_KEY_SET.has(lastUpgradedEnrollmentPackageKey)
    || currentRankKey === 'legacy'
  );
  if (hasLegacyPackageOwnership) {
    currentOwnedPackageKeys.add('legacy-builder-pack');
  }
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
  const currentLegacyLeadershipCompletedTierCount = Math.max(
    0,
    toWholeNumber(
      progressContext?.legacyLeadershipCompletedTierCount,
      progressContext?.sourceQualificationTier,
    ),
  );
  const achievementRankIndex = resolveRankIndex(achievement?.title || achievement?.requiredRank);
  const meetsMonthlyRecordedRankRun = (
    isRankTrack
    && achievementRankIndex >= 0
    && highestRecordedRankIndex >= achievementRankIndex
  );

  const alreadyClaimed = Boolean(claim?.claimedAt);
  const meetsRankRequirement = requiresRank
    ? (() => {
      const currentRankIndex = resolveRankIndex(currentRank);
      if (currentRankIndex < 0) {
        return false;
      }
      const minimumRankIndex = requiredRankMin ? resolveRankIndex(requiredRankMin) : -1;
      const maximumRankIndex = requiredRankMax ? resolveRankIndex(requiredRankMax) : -1;
      const meetsMinimum = minimumRankIndex >= 0 ? currentRankIndex >= minimumRankIndex : true;
      const meetsMaximum = maximumRankIndex >= 0 ? currentRankIndex <= maximumRankIndex : true;
      return meetsMinimum && meetsMaximum;
    })()
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
  const ownedPackageRequirementSnapshot = requiredAnyOwnedPackageKeys.map((entry) => ({
    packageKey: entry.packageKey,
    packageLabel: entry.packageLabel,
    met: currentOwnedPackageKeys.has(entry.packageKey),
  }));
  const meetsAnyOwnedPackageRequirementNow = ownedPackageRequirementSnapshot.length > 0
    ? ownedPackageRequirementSnapshot.some((entry) => entry.met)
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
  const meetsLegacyLeadershipCompletedTierRequirementNow = requiredLegacyLeadershipCompletedTierCount > 0
    ? currentLegacyLeadershipCompletedTierCount >= requiredLegacyLeadershipCompletedTierCount
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
  const meetsAnyOwnedPackageRequirement = meetsMonthlyRecordedRankRun
    ? true
    : meetsAnyOwnedPackageRequirementNow;
  const meetsLegacyLeadershipCompletedTierRequirement = meetsMonthlyRecordedRankRun
    ? true
    : meetsLegacyLeadershipCompletedTierRequirementNow;
  const meetsActiveRequirement = meetsActiveRequirementNow;

  const baseRequirementsMet = (
    meetsRankRequirement
    && meetsDirectSponsorTotalRequirement
    && meetsDirectSponsorRequirement
    && meetsCycleRequirement
    && meetsPersonalPvRequirement
    && meetsLegPersonalPvRequirement
    && meetsPackageEnrollmentRequirement
    && meetsAnyOwnedPackageRequirement
    && meetsLegacyPackageOwnershipRequirement
    && meetsLegacyBuilderDirectRequirement
    && meetsLegacyBuilderSecondLevelRequirement
    && meetsLegacyBuilderThirdLevelRequirement
    && meetsLegacyLeadershipCompletedTierRequirement
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
    const rankRequirementLabel = (requiredRankMin && requiredRankMax)
      ? `Reach ${requiredRankMin} to ${requiredRankMax} rank range`
      : (requiredRankMin
        ? `Reach ${requiredRankMin} rank`
        : `Reach up to ${requiredRankMax} rank`);
    requirements.push({
      id: 'rank',
      label: rankRequirementLabel,
      met: meetsRankRequirement,
      current: currentRank,
      required: {
        min: requiredRankMin,
        max: requiredRankMax,
      },
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
  if (ownedPackageRequirementSnapshot.length > 0) {
    const packageLabels = ownedPackageRequirementSnapshot.map((entry) => entry.packageLabel);
    const joinedPackageLabels = packageLabels.join(' / ');
    requirements.push({
      id: 'owned-package-any',
      label: `Own any package from: ${joinedPackageLabels}`,
      met: meetsAnyOwnedPackageRequirement,
      current: {
        currentEnrollmentPackageKey,
        lastUpgradedEnrollmentPackageKey,
      },
      required: ownedPackageRequirementSnapshot,
    });
  }
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
  if (requiredLegacyLeadershipCompletedTierCount > 0) {
    requirements.push({
      id: 'legacy-leadership-completed-tier',
      label: `Complete Legacy Tier ${requiredLegacyLeadershipCompletedTierCount.toLocaleString()} (40 nodes)`,
      met: meetsLegacyLeadershipCompletedTierRequirement,
      current: currentLegacyLeadershipCompletedTierCount,
      required: requiredLegacyLeadershipCompletedTierCount,
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
    if (requiredRankMin && requiredRankMax) {
      lockReason = `Reach a rank within ${requiredRankMin} to ${requiredRankMax} to unlock this bonus.`;
    } else if (requiredRankMin) {
      lockReason = `Reach ${requiredRankMin} rank to unlock this bonus.`;
    } else {
      lockReason = `Reach up to ${requiredRankMax} rank to unlock this bonus.`;
    }
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
    lockReason = `Enroll ${requiredLegacyBuilderDirectEnrollments.toLocaleString()} Legacy Builder Package member${requiredLegacyBuilderDirectEnrollments === 1 ? '' : 's'} (${currentLegacyBuilderDirectEnrollments.toLocaleString()}/${requiredLegacyBuilderDirectEnrollments.toLocaleString()}).`;
  } else if (!alreadyClaimed && requiredLegacyBuilderSecondLevelEnrollments > 0 && !meetsLegacyBuilderSecondLevelRequirement) {
    lockReason = `Build ${requiredLegacyBuilderSecondLevelEnrollments.toLocaleString()} second-level Legacy Package members (${currentLegacyBuilderSecondLevelEnrollments.toLocaleString()}/${requiredLegacyBuilderSecondLevelEnrollments.toLocaleString()}).`;
  } else if (!alreadyClaimed && requiredLegacyBuilderThirdLevelEnrollments > 0 && !meetsLegacyBuilderThirdLevelRequirement) {
    lockReason = allowLegacyLeadershipTierCardCompletion
      ? `Complete Legacy Leadership Tier Card or build ${requiredLegacyBuilderThirdLevelEnrollments.toLocaleString()} third-level Legacy Package members (${currentLegacyBuilderThirdLevelEnrollments.toLocaleString()}/${requiredLegacyBuilderThirdLevelEnrollments.toLocaleString()}).`
      : `Build ${requiredLegacyBuilderThirdLevelEnrollments.toLocaleString()} third-level Legacy Package members (${currentLegacyBuilderThirdLevelEnrollments.toLocaleString()}/${requiredLegacyBuilderThirdLevelEnrollments.toLocaleString()}).`;
  } else if (!alreadyClaimed && ownedPackageRequirementSnapshot.length > 0 && !meetsAnyOwnedPackageRequirement) {
    const packageLabelList = ownedPackageRequirementSnapshot
      .map((entry) => entry.packageLabel)
      .join(', ');
    lockReason = `Purchase or upgrade to any of these packages: ${packageLabelList}.`;
  } else if (!alreadyClaimed && requiredLegacyLeadershipCompletedTierCount > 0 && !meetsLegacyLeadershipCompletedTierRequirement) {
    lockReason = `Complete Legacy Tier ${requiredLegacyLeadershipCompletedTierCount.toLocaleString()} (40 nodes) (${currentLegacyLeadershipCompletedTierCount.toLocaleString()}/${requiredLegacyLeadershipCompletedTierCount.toLocaleString()}).`;
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
    requiredLegacyLeadershipCompletedTierCount,
    currentLegacyLeadershipCompletedTierCount,
    requiredAnyOwnedPackageKeys: ownedPackageRequirementSnapshot,
    currentEnrollmentPackageKey,
    lastUpgradedEnrollmentPackageKey,
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
  const claimMapAllPeriods = mapClaimsByAchievementId(claims);
  const equippedProfileBadgeId = resolveEquippedProfileBadgeAchievementId(
    options?.equippedProfileBadgeId,
    claims,
    titleAwards,
  );
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
      requiredRank: normalizeRankLabelForAchievement(
        achievement?.requiredRank
        || achievement?.requiredRankMin,
      ),
      requiredRankMin: normalizeRankLabelForAchievement(
        achievement?.requiredRankMin
        || achievement?.requiredRank,
      ),
      requiredRankMax: normalizeRankLabelForAchievement(achievement?.requiredRankMax),
      requiresRank: (
        achievement?.requiresRank !== false
        && Boolean(
          achievement?.requiredRank
          || achievement?.requiredRankMin
          || achievement?.requiredRankMax,
        )
      ),
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
      requiredLegacyLeadershipCompletedTierCount: eligibility.requiredLegacyLeadershipCompletedTierCount,
      currentLegacyLeadershipCompletedTierCount: eligibility.currentLegacyLeadershipCompletedTierCount,
      requiredAnyOwnedPackageKeys: eligibility.requiredAnyOwnedPackageKeys,
      currentEnrollmentPackageKey: eligibility.currentEnrollmentPackageKey,
      lastUpgradedEnrollmentPackageKey: eligibility.lastUpgradedEnrollmentPackageKey,
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
    equippedProfileBadgeId,
    earnedAchievementIds: Array.from(claimMapAllPeriods.keys()),
    earnedAchievementClaims: Object.fromEntries(claimMapAllPeriods.entries()),
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
  const sourceMember = await resolveMemberProgressSource(member, userId);
  const effectiveMember = await maybeApplyMonthlyRankPromotion(sourceMember, { nowMs });
  const rankClaimWindow = resolveRankClaimWindowContext(nowMs);
  const rankRunPeriod = normalizeText(options?.rankRunPeriod)
    || normalizeText(rankClaimWindow?.currentRunPeriodKey)
    || resolveClaimPeriodKeyFromDate(nowMs);
  const rankClaimPeriod = normalizeText(options?.rankClaimPeriod)
    || normalizeText(rankClaimWindow?.claimPeriodKey);
  await ensureMemberTitleCatalogSeed();
  const [claims, progressContext, titleAwards, titleCatalog, equippedSelection] = await Promise.all([
    listMemberAchievementClaimsByUserId(userId),
    resolveCurrentMemberProgressContext(effectiveMember),
    listActiveMemberTitleAwardsByUserId(userId),
    listActiveMemberTitleCatalogEntries(),
    readMemberProfileBadgeSelectionByUserId(userId),
  ]);
  const equippedProfileBadgeId = resolveEquippedProfileBadgeAchievementId(
    equippedSelection?.achievementId,
    claims,
    titleAwards,
  );
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
    equippedProfileBadgeId,
  });
}

export async function resolveRankAdvancementRunSnapshotForMember(member = {}) {
  const nowMs = Date.now();
  const sourceMember = await resolveMemberProgressSource(member, normalizeText(member?.id));
  const effectiveMember = await maybeApplyMonthlyRankPromotion(sourceMember, { nowMs });
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
  const sourceMember = await resolveMemberProgressSource(member, userId);
  const effectiveMember = await maybeApplyMonthlyRankPromotion(sourceMember, { nowMs: claimAttemptMs });
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

  const [allClaims, progressContext, titleAwards, titleCatalog, equippedSelection] = await Promise.all([
    listMemberAchievementClaimsByUserId(userId),
    resolveCurrentMemberProgressContext(effectiveMember),
    listActiveMemberTitleAwardsByUserId(userId),
    listActiveMemberTitleCatalogEntries(),
    readMemberProfileBadgeSelectionByUserId(userId),
  ]);
  const equippedProfileBadgeId = resolveEquippedProfileBadgeAchievementId(
    equippedSelection?.achievementId,
    allClaims,
    titleAwards,
  );
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
      equippedProfileBadgeId,
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

export async function equipProfileAchievementBadgeForMember(member = {}, achievementIdInput = '') {
  const userId = normalizeText(member?.id);
  if (!userId) {
    return {
      success: false,
      status: 400,
      error: 'Authenticated member user id is required.',
    };
  }

  const achievementId = normalizeText(achievementIdInput);
  if (!achievementId) {
    return {
      success: false,
      status: 400,
      error: 'Achievement id is required to equip a profile badge.',
    };
  }

  const achievement = PROFILE_ACHIEVEMENT_BY_ID.get(achievementId) || null;
  if (!achievement) {
    return {
      success: false,
      status: 404,
      error: 'Achievement was not found.',
    };
  }

  const claims = await listMemberAchievementClaimsByUserId(userId);
  const claimMap = mapClaimsByAchievementId(claims);
  if (!claimMap.has(achievementId)) {
    return {
      success: false,
      status: 403,
      error: 'Only earned badges can be equipped.',
    };
  }

  await upsertMemberProfileBadgeSelection({
    userId,
    achievementId,
  });

  const catalog = await buildCatalogForMemberWithLatestState(member, userId);
  return {
    success: true,
    status: 200,
    data: {
      success: true,
      equippedProfileBadgeId: normalizeText(catalog?.equippedProfileBadgeId),
      ...catalog,
    },
  };
}
