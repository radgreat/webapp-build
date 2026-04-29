import test from 'node:test';
import assert from 'node:assert/strict';
import {
  __deriveBusinessCenterProgressForTests,
  __getBusinessCenterRuleConfigForTests,
} from '../services/member-business-center.service.js';

test('business center config uses max 2 with Tier 4/5 unlock mapping', () => {
  const config = __getBusinessCenterRuleConfigForTests();

  assert.equal(config.maxBusinessCenterCount, 2);
  assert.deepEqual(
    config.defaultUnlockRules.map((rule) => ({
      index: rule.businessCenterIndex,
      tier: rule.requiredTier,
      label: rule.centerLabel,
    })),
    [
      { index: 1, tier: 4, label: 'Business Center #1' },
      { index: 2, tier: 5, label: 'Business Center #2' },
    ],
  );
});

test('Tier 3 no longer unlocks any Business Center', () => {
  const progress = __deriveBusinessCenterProgressForTests({
    completedLegacyTierCount: 3,
    activeCenterIndexes: [],
  });

  assert.deepEqual(progress.unlockedCenterIndexes, []);
  assert.deepEqual(progress.pendingCenterIndexes, []);
  assert.equal(progress.unlockedCount, 0);
  assert.equal(progress.pendingCount, 0);
});

test('Tier 4 unlocks Business Center #1 only', () => {
  const progress = __deriveBusinessCenterProgressForTests({
    completedLegacyTierCount: 4,
    activeCenterIndexes: [],
  });

  assert.deepEqual(progress.unlockedCenterIndexes, [1]);
  assert.deepEqual(progress.pendingCenterIndexes, [1]);
  assert.equal(progress.unlockedCount, 1);
  assert.equal(progress.pendingCount, 1);
  assert.equal(progress.sourceQualificationTier, 4);
});

test('Tier 5 unlocks Business Centers #1 and #2 only', () => {
  const progress = __deriveBusinessCenterProgressForTests({
    completedLegacyTierCount: 5,
    activeCenterIndexes: [],
  });

  assert.deepEqual(progress.unlockedCenterIndexes, [1, 2]);
  assert.deepEqual(progress.pendingCenterIndexes, [1, 2]);
  assert.equal(progress.unlockedCount, 2);
  assert.equal(progress.pendingCount, 2);
  assert.equal(progress.sourceQualificationTier, 5);
});

test('legacy index 3 is dropped from active/unlocked progress snapshots', () => {
  const progress = __deriveBusinessCenterProgressForTests({
    completedLegacyTierCount: 5,
    activeCenterIndexes: [1, 2, 3],
  });

  assert.deepEqual(progress.activatedCenterIndexes, [1, 2]);
  assert.deepEqual(progress.unlockedCenterIndexes, [1, 2]);
  assert.deepEqual(progress.pendingCenterIndexes, []);
  assert.equal(progress.activatedCount, 2);
  assert.equal(progress.unlockedCount, 2);
  assert.equal(progress.pendingCount, 0);
});
