import test from 'node:test';
import assert from 'node:assert/strict';
import {
  __resetLeadershipMatchingServiceDependenciesForTests,
  __setLeadershipMatchingServiceDependenciesForTests,
  processLeadershipMatchingBonusFromSalesTeamCommission,
} from '../services/leadership-matching.service.js';

function withLeadershipMatchingDependencies(overrides = {}) {
  __setLeadershipMatchingServiceDependenciesForTests({
    readRegisteredMembersStore: async () => [],
    createLeadershipMatchingBonusLedgerEntry: async () => ({
      entry: null,
      idempotent: false,
      skipped: true,
    }),
    ...overrides,
  });
}

function restoreLeadershipMatchingDependencies() {
  __resetLeadershipMatchingServiceDependenciesForTests();
}

function buildLinearSponsorTree(rankLabel = 'Ruby', depth = 12) {
  const members = [{
    userId: 'earner-1',
    memberUsername: 'earner',
    sponsorUsername: 'sponsor-1',
    accountRank: 'Legacy',
    businessCenterNodeType: 'main_center',
  }];

  for (let level = 1; level <= depth; level += 1) {
    members.push({
      userId: `upline-${level}`,
      memberUsername: `sponsor-${level}`,
      sponsorUsername: level < depth ? `sponsor-${level + 1}` : '',
      accountRank: rankLabel,
      businessCenterNodeType: 'main_center',
    });
  }

  return members;
}

function buildSalesTeamSourcePayload(overrides = {}) {
  return {
    sourceType: 'sales_team_commission',
    sourceSalesTeamCommissionId: 'sales-ledger-1001',
    sourceCycleId: 'cycle-1001',
    sourceCycleBatchId: 'cutoff-1001',
    sourceCycleCutoffId: 'cutoff-1001',
    sourceEarnerUserId: 'earner-1',
    sourceEarnerUsername: 'earner',
    sourceEarnerEmail: 'earner@example.com',
    baseSalesTeamCommissionAmount: 100,
    status: 'posted',
    ...overrides,
  };
}

test('Matching Bonus is created only from finalized Sales Team Commission records.', async () => {
  const insertedPayloads = [];
  withLeadershipMatchingDependencies({
    readRegisteredMembersStore: async () => buildLinearSponsorTree('Ruby', 2),
    createLeadershipMatchingBonusLedgerEntry: async (payload) => {
      insertedPayloads.push(payload);
      return { entry: { id: `mb-${insertedPayloads.length}`, ...payload }, idempotent: false, skipped: false };
    },
  });

  try {
    const pendingResult = await processLeadershipMatchingBonusFromSalesTeamCommission(buildSalesTeamSourcePayload({
      status: 'pending',
    }));
    const postedResult = await processLeadershipMatchingBonusFromSalesTeamCommission(buildSalesTeamSourcePayload({
      status: 'posted',
    }));

    assert.equal(pendingResult?.data?.skipped, true);
    assert.equal(postedResult?.data?.createdCount, 1);
    assert.equal(insertedPayloads.length, 1);
  } finally {
    restoreLeadershipMatchingDependencies();
  }
});

test('Matching Bonus is not created from Retail Profit.', async () => {
  const insertedPayloads = [];
  withLeadershipMatchingDependencies({
    readRegisteredMembersStore: async () => buildLinearSponsorTree('Royal Crown', 9),
    createLeadershipMatchingBonusLedgerEntry: async (payload) => {
      insertedPayloads.push(payload);
      return { entry: { id: 'mb-retail-1', ...payload }, idempotent: false, skipped: false };
    },
  });

  try {
    const result = await processLeadershipMatchingBonusFromSalesTeamCommission(buildSalesTeamSourcePayload({
      sourceType: 'retail_profit',
    }));
    assert.equal(result?.data?.skipped, true);
    assert.equal(insertedPayloads.length, 0);
  } finally {
    restoreLeadershipMatchingDependencies();
  }
});

test('Matching Bonus is not created from Fast Track Commission.', async () => {
  const insertedPayloads = [];
  withLeadershipMatchingDependencies({
    readRegisteredMembersStore: async () => buildLinearSponsorTree('Royal Crown', 9),
    createLeadershipMatchingBonusLedgerEntry: async (payload) => {
      insertedPayloads.push(payload);
      return { entry: { id: 'mb-fasttrack-1', ...payload }, idempotent: false, skipped: false };
    },
  });

  try {
    const result = await processLeadershipMatchingBonusFromSalesTeamCommission(buildSalesTeamSourcePayload({
      sourceType: 'fast_track_commission',
    }));
    assert.equal(result?.data?.skipped, true);
    assert.equal(insertedPayloads.length, 0);
  } finally {
    restoreLeadershipMatchingDependencies();
  }
});

test('Matching Bonus is not created from raw BV.', async () => {
  const insertedPayloads = [];
  withLeadershipMatchingDependencies({
    readRegisteredMembersStore: async () => buildLinearSponsorTree('Royal Crown', 9),
    createLeadershipMatchingBonusLedgerEntry: async (payload) => {
      insertedPayloads.push(payload);
      return { entry: { id: 'mb-rawbv-1', ...payload }, idempotent: false, skipped: false };
    },
  });

  try {
    const result = await processLeadershipMatchingBonusFromSalesTeamCommission(buildSalesTeamSourcePayload({
      sourceType: 'raw_bv',
    }));
    assert.equal(result?.data?.skipped, true);
    assert.equal(insertedPayloads.length, 0);
  } finally {
    restoreLeadershipMatchingDependencies();
  }
});

test('Matching Bonus is not created from carry-over BV.', async () => {
  const insertedPayloads = [];
  withLeadershipMatchingDependencies({
    readRegisteredMembersStore: async () => buildLinearSponsorTree('Royal Crown', 9),
    createLeadershipMatchingBonusLedgerEntry: async (payload) => {
      insertedPayloads.push(payload);
      return { entry: { id: 'mb-carry-over-1', ...payload }, idempotent: false, skipped: false };
    },
  });

  try {
    const result = await processLeadershipMatchingBonusFromSalesTeamCommission(buildSalesTeamSourcePayload({
      sourceType: 'carry_over_bv',
    }));
    assert.equal(result?.data?.skipped, true);
    assert.equal(insertedPayloads.length, 0);
  } finally {
    restoreLeadershipMatchingDependencies();
  }
});

const rankDepthExpectations = [
  { rank: 'Ruby', maxLevel: 1, percentages: [5] },
  { rank: 'Emerald', maxLevel: 2, percentages: [5, 5] },
  { rank: 'Sapphire', maxLevel: 3, percentages: [5, 5, 5] },
  { rank: 'Diamond', maxLevel: 4, percentages: [10, 7, 5, 5] },
  { rank: 'Blue Diamond', maxLevel: 5, percentages: [10, 7, 5, 5, 5] },
  { rank: 'Black Diamond', maxLevel: 6, percentages: [10, 7, 5, 5, 5, 5] },
  { rank: 'Crown', maxLevel: 7, percentages: [15, 10, 7, 5, 5, 5, 5] },
  { rank: 'Double Crown', maxLevel: 8, percentages: [15, 10, 7, 5, 5, 5, 5, 5] },
  { rank: 'Royal Crown', maxLevel: 9, percentages: [15, 10, 7, 5, 5, 5, 5, 5, 5] },
];

for (const expectation of rankDepthExpectations) {
  const label = expectation.maxLevel === 1
    ? `${expectation.rank} receives Level 1 only.`
    : `${expectation.rank} receives Levels 1-${expectation.maxLevel}.`;
  test(label, async () => {
    const insertedPayloads = [];
    withLeadershipMatchingDependencies({
      readRegisteredMembersStore: async () => buildLinearSponsorTree(expectation.rank, 10),
      createLeadershipMatchingBonusLedgerEntry: async (payload) => {
        insertedPayloads.push(payload);
        return { entry: { id: `mb-${expectation.rank}-${insertedPayloads.length}`, ...payload }, idempotent: false, skipped: false };
      },
    });

    try {
      const result = await processLeadershipMatchingBonusFromSalesTeamCommission(buildSalesTeamSourcePayload());
      const levels = insertedPayloads.map((entry) => Number(entry?.sponsorLevel || 0));
      assert.deepEqual(levels, Array.from({ length: expectation.maxLevel }, (_, index) => index + 1));

      expectation.percentages.forEach((percentage, index) => {
        const level = index + 1;
        const entry = insertedPayloads.find((item) => Number(item?.sponsorLevel || 0) === level);
        assert.ok(entry, `missing level ${level} for ${expectation.rank}`);
        assert.equal(Number(entry?.matchPercentage || 0), percentage);
      });

      assert.equal(result?.data?.createdCount, expectation.maxLevel);
    } finally {
      restoreLeadershipMatchingDependencies();
    }
  });
}

test('Sponsor traversal stops at Level 9.', async () => {
  const insertedPayloads = [];
  withLeadershipMatchingDependencies({
    readRegisteredMembersStore: async () => buildLinearSponsorTree('Royal Crown', 15),
    createLeadershipMatchingBonusLedgerEntry: async (payload) => {
      insertedPayloads.push(payload);
      return { entry: { id: `mb-level-${insertedPayloads.length}`, ...payload }, idempotent: false, skipped: false };
    },
  });

  try {
    const result = await processLeadershipMatchingBonusFromSalesTeamCommission(buildSalesTeamSourcePayload());
    assert.equal(result?.data?.traversedLevels, 9);
    assert.equal(insertedPayloads.length, 9);
    assert.deepEqual(
      insertedPayloads.map((entry) => Number(entry?.sponsorLevel || 0)),
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
    );
  } finally {
    restoreLeadershipMatchingDependencies();
  }
});

test('Missing sponsor records stop traversal safely.', async () => {
  const insertedPayloads = [];
  const members = buildLinearSponsorTree('Royal Crown', 9).filter((member) => member.memberUsername !== 'sponsor-2');
  withLeadershipMatchingDependencies({
    readRegisteredMembersStore: async () => members,
    createLeadershipMatchingBonusLedgerEntry: async (payload) => {
      insertedPayloads.push(payload);
      return { entry: { id: 'mb-missing-1', ...payload }, idempotent: false, skipped: false };
    },
  });

  try {
    const result = await processLeadershipMatchingBonusFromSalesTeamCommission(buildSalesTeamSourcePayload());
    assert.equal(result?.data?.traversedLevels, 1);
    assert.equal(insertedPayloads.length, 1);
    assert.equal(Number(insertedPayloads[0]?.sponsorLevel || 0), 1);
  } finally {
    restoreLeadershipMatchingDependencies();
  }
});

test('Duplicate processing does not create duplicate Matching Bonus records.', async () => {
  const insertedByIdempotency = new Map();
  withLeadershipMatchingDependencies({
    readRegisteredMembersStore: async () => buildLinearSponsorTree('Royal Crown', 9),
    createLeadershipMatchingBonusLedgerEntry: async (payload) => {
      const key = String(payload?.idempotencyKey || '').trim();
      if (insertedByIdempotency.has(key)) {
        return {
          entry: insertedByIdempotency.get(key),
          idempotent: true,
          skipped: false,
        };
      }
      const entry = { id: `mb-dedupe-${insertedByIdempotency.size + 1}`, ...payload };
      insertedByIdempotency.set(key, entry);
      return {
        entry,
        idempotent: false,
        skipped: false,
      };
    },
  });

  try {
    const first = await processLeadershipMatchingBonusFromSalesTeamCommission(buildSalesTeamSourcePayload());
    const second = await processLeadershipMatchingBonusFromSalesTeamCommission(buildSalesTeamSourcePayload());

    assert.equal(first?.data?.createdCount, 9);
    assert.equal(second?.data?.idempotentCount, 9);
    assert.equal(insertedByIdempotency.size, 9);
  } finally {
    restoreLeadershipMatchingDependencies();
  }
});

test('Matching Bonus earning creates the correct ledger payload fields.', async () => {
  const insertedPayloads = [];
  withLeadershipMatchingDependencies({
    readRegisteredMembersStore: async () => buildLinearSponsorTree('Diamond', 9),
    createLeadershipMatchingBonusLedgerEntry: async (payload) => {
      insertedPayloads.push(payload);
      return {
        entry: { id: `mb-payload-${insertedPayloads.length}`, ...payload },
        idempotent: false,
        skipped: false,
      };
    },
  });

  try {
    const result = await processLeadershipMatchingBonusFromSalesTeamCommission(buildSalesTeamSourcePayload({
      sourceSalesTeamCommissionId: 'sales-ledger-9001',
      sourceCycleCutoffId: 'cutoff-2026-04-28',
      baseSalesTeamCommissionAmount: 250,
    }));
    assert.equal(result?.data?.createdCount, 4);

    const levelOne = insertedPayloads.find((entry) => Number(entry?.sponsorLevel || 0) === 1);
    assert.ok(levelOne);
    assert.equal(levelOne?.sourceSalesTeamCommissionId, 'sales-ledger-9001');
    assert.equal(levelOne?.sourceCycleCutoffId, 'cutoff-2026-04-28');
    assert.equal(levelOne?.sourceEarnerUserId, 'earner-1');
    assert.equal(levelOne?.recipientUserId, 'upline-1');
    assert.equal(levelOne?.recipientRank, 'Diamond');
    assert.equal(levelOne?.matchPercentage, 10);
    assert.equal(levelOne?.baseSalesTeamCommissionAmount, 250);
    assert.equal(levelOne?.amountUsd, 25);
    assert.equal(levelOne?.status, 'posted');
  } finally {
    restoreLeadershipMatchingDependencies();
  }
});
