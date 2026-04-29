import test from 'node:test';
import assert from 'node:assert/strict';
import {
  __resetLedgerServiceDependenciesForTests,
  __setLedgerServiceDependenciesForTests,
  createFastTrackCommissionLedgerEntry,
  createLeadershipMatchingBonusLedgerEntry,
  createMatchingBonusTransferToWalletLedgerEntry,
  createRetailCommissionLedgerEntry,
  createSalesTeamCommissionLedgerEntry,
  getUserLedgerSummary,
  reverseLedgerEntry,
} from '../services/ledger.service.js';

function withLedgerServiceDependencies(overrides = {}) {
  __setLedgerServiceDependenciesForTests({
    ensureLedgerTables: async () => {},
    ...overrides,
  });
}

function restoreLedgerServiceDependencies() {
  __resetLedgerServiceDependenciesForTests();
}

test('retail purchase creates one retail commission ledger entry', async () => {
  const insertedRows = [];
  withLedgerServiceDependencies({
    insertLedgerEntry: async (payload) => {
      insertedRows.push(payload);
      return {
        entry: { id: 'led-retail-1', ...payload },
        idempotent: false,
      };
    },
  });

  try {
    const result = await createRetailCommissionLedgerEntry({
      userId: 'user-retail-1',
      username: 'retail-owner',
      email: 'retail-owner@example.com',
      sourceId: 'order-1001',
      sourceRef: 'INV-1001',
      amountUsd: 20,
      bvAmount: 38,
      invoiceStatus: 'posted',
      buyerUserId: 'buyer-1',
      buyerUsername: 'preferred-buyer',
    });

    assert.equal(insertedRows.length, 1);
    assert.equal(result.idempotent, false);
    assert.equal(result.entry?.type, 'retail_commission');
    assert.equal(result.entry?.sourceType, 'order');
    assert.equal(result.entry?.amount, 20);
    assert.equal(result.entry?.bvAmount, 38);
    assert.equal(result.entry?.direction, 'credit');
    assert.equal(result.entry?.status, 'posted');
    assert.equal(result.entry?.idempotencyKey, 'retail_commission:order-1001:user-retail-1');
  } finally {
    restoreLedgerServiceDependencies();
  }
});

test('fast track enrollment creates one fast-track commission ledger entry', async () => {
  const insertedRows = [];
  withLedgerServiceDependencies({
    insertLedgerEntry: async (payload) => {
      insertedRows.push(payload);
      return {
        entry: { id: 'led-fast-track-1', ...payload },
        idempotent: false,
      };
    },
  });

  try {
    const result = await createFastTrackCommissionLedgerEntry({
      userId: 'sponsor-1',
      username: 'sponsor-user',
      email: 'sponsor@example.com',
      sourceId: 'enrollment-2001',
      sourceRef: 'ENR-2001',
      amountUsd: 200,
      packageKey: 'legacy-pack',
      enrolledUserId: 'new-member-1',
    });

    assert.equal(insertedRows.length, 1);
    assert.equal(result.idempotent, false);
    assert.equal(result.entry?.type, 'fast_track_commission');
    assert.equal(result.entry?.sourceType, 'enrollment');
    assert.equal(result.entry?.amount, 200);
    assert.equal(result.entry?.direction, 'credit');
    assert.equal(result.entry?.idempotencyKey, 'fast_track:enrollment-2001:sponsor-1');
  } finally {
    restoreLedgerServiceDependencies();
  }
});

test('sales team cycle creates one sales-team commission ledger entry', async () => {
  const insertedRows = [];
  withLedgerServiceDependencies({
    insertLedgerEntry: async (payload) => {
      insertedRows.push(payload);
      return {
        entry: { id: 'led-sales-team-1', ...payload },
        idempotent: false,
      };
    },
  });

  try {
    const result = await createSalesTeamCommissionLedgerEntry({
      userId: 'cycler-1',
      username: 'cycler-user',
      sourceId: 'cycle-3001',
      sourceRef: 'BATCH-3001',
      amountUsd: 120,
      bvAmount: 1500,
      leftBvUsed: 1000,
      rightBvUsed: 500,
    });

    assert.equal(insertedRows.length, 1);
    assert.equal(result.idempotent, false);
    assert.equal(result.entry?.type, 'sales_team_commission');
    assert.equal(result.entry?.sourceType, 'binary_cycle');
    assert.equal(result.entry?.amount, 120);
    assert.equal(result.entry?.bvAmount, 1500);
    assert.equal(result.entry?.idempotencyKey, 'sales_team_cycle:cycle-3001:cycler-1');
  } finally {
    restoreLedgerServiceDependencies();
  }
});

test('leadership matching bonus creates one matching-bonus ledger entry', async () => {
  const insertedRows = [];
  withLedgerServiceDependencies({
    insertLedgerEntry: async (payload) => {
      insertedRows.push(payload);
      return {
        entry: { id: 'led-match-1', ...payload },
        idempotent: false,
      };
    },
  });

  try {
    const result = await createLeadershipMatchingBonusLedgerEntry({
      userId: 'upline-1',
      username: 'upline-user',
      sourceSalesTeamCommissionId: 'sales-ledger-1',
      sourceCycleId: 'cycle-1',
      sourceEarnerUserId: 'earner-1',
      sponsorLevel: 2,
      matchPercentage: 5,
      baseSalesTeamCommissionAmount: 120,
      amountUsd: 6,
    });

    assert.equal(insertedRows.length, 1);
    assert.equal(result.idempotent, false);
    assert.equal(result.entry?.type, 'leadership_matching_bonus');
    assert.equal(result.entry?.sourceType, 'sales_team_commission');
    assert.equal(result.entry?.sourceId, 'sales-ledger-1');
    assert.equal(result.entry?.amount, 6);
    assert.equal(result.entry?.direction, 'credit');
    assert.equal(result.entry?.idempotencyKey, 'leadership_matching_bonus:sales-ledger-1:upline-1:level:2');
  } finally {
    restoreLedgerServiceDependencies();
  }
});

test('matching bonus transfer creates one transfer-to-wallet ledger entry', async () => {
  const insertedRows = [];
  withLedgerServiceDependencies({
    insertLedgerEntry: async (payload) => {
      insertedRows.push(payload);
      return {
        entry: { id: 'led-match-transfer-1', ...payload },
        idempotent: false,
      };
    },
  });

  try {
    const result = await createMatchingBonusTransferToWalletLedgerEntry({
      userId: 'upline-1',
      username: 'upline-user',
      sourceId: 'ewtx_1001',
      transferId: 'ewtx_1001',
      amountUsd: 16.5,
      previousMatchingBonusBalance: 20,
      newMatchingBonusBalance: 3.5,
      previousWalletBalance: 100,
      newWalletBalance: 116.5,
    });

    assert.equal(insertedRows.length, 1);
    assert.equal(result.idempotent, false);
    assert.equal(result.entry?.type, 'matching_bonus_transfer_to_wallet');
    assert.equal(result.entry?.sourceType, 'commission_transfer');
    assert.equal(result.entry?.sourceId, 'ewtx_1001');
    assert.equal(result.entry?.amount, 16.5);
    assert.equal(result.entry?.direction, 'debit');
    assert.equal(result.entry?.idempotencyKey, 'matching_bonus_transfer:ewtx_1001:upline-1');
  } finally {
    restoreLedgerServiceDependencies();
  }
});

test('duplicate source event does not create duplicate commission entries (idempotency)', async () => {
  const byIdempotencyKey = new Map();
  withLedgerServiceDependencies({
    insertLedgerEntry: async (payload) => {
      const key = String(payload?.idempotencyKey || '').trim();
      if (key && byIdempotencyKey.has(key)) {
        return {
          entry: byIdempotencyKey.get(key),
          idempotent: true,
        };
      }

      const entry = { id: `led-${byIdempotencyKey.size + 1}`, ...payload };
      if (key) {
        byIdempotencyKey.set(key, entry);
      }
      return {
        entry,
        idempotent: false,
      };
    },
  });

  try {
    const first = await createRetailCommissionLedgerEntry({
      userId: 'user-idempotent-1',
      sourceId: 'order-idempotent-1',
      amountUsd: 35,
      bvAmount: 20,
    });
    const second = await createRetailCommissionLedgerEntry({
      userId: 'user-idempotent-1',
      sourceId: 'order-idempotent-1',
      amountUsd: 35,
      bvAmount: 20,
    });

    assert.equal(first.idempotent, false);
    assert.equal(second.idempotent, true);
    assert.equal(first.entry?.id, second.entry?.id);
    assert.equal(byIdempotencyKey.size, 1);
  } finally {
    restoreLedgerServiceDependencies();
  }
});

test('pending amounts are excluded from available balance while posted/paid are included', async () => {
  withLedgerServiceDependencies({
    getLedgerSummary: async () => ({
      totalEarned: 330,
      pendingBalance: 120,
      postedBalance: 80,
      availableBalance: 110,
      paidOutAmount: 25,
      reversedAmount: 15,
      byStatus: {
        pending: 120,
        posted: 80,
        paid: 30,
        reversed: -15,
      },
      byType: {
        retail_commission: {
          count: 2,
          netAmount: 210,
        },
      },
    }),
  });

  try {
    const result = await getUserLedgerSummary({}, {
      id: 'summary-user-1',
      username: 'summary-user',
      email: 'summary@example.com',
    });

    assert.equal(result.success, true);
    assert.equal(result.status, 200);
    assert.equal(result.data?.summary?.pendingBalance, 120);
    assert.equal(result.data?.summary?.postedBalance, 80);
    assert.equal(result.data?.summary?.availableBalance, 110);
    assert.ok(result.data?.summary?.availableBalance > result.data?.summary?.postedBalance);
    assert.ok(result.data?.summary?.availableBalance < (result.data?.summary?.postedBalance + result.data?.summary?.pendingBalance));
  } finally {
    restoreLedgerServiceDependencies();
  }
});

test('reversal creates opposite-direction entry and marks original as reversed', async () => {
  const originalEntry = {
    id: 'ledger-original-1',
    userId: 'reverse-user-1',
    username: 'reverse-user',
    email: 'reverse-user@example.com',
    type: 'retail_commission',
    direction: 'credit',
    amount: 200,
    bvAmount: 38,
    status: 'posted',
    sourceType: 'order',
    sourceId: 'order-rev-1',
    sourceRef: 'INV-REV-1',
    description: 'Retail commission entry',
    metadata: {},
  };
  const insertedRows = [];
  const updatedRows = [];

  withLedgerServiceDependencies({
    readLedgerEntryById: async (entryId) => {
      if (String(entryId || '').trim() !== originalEntry.id) {
        return null;
      }
      return { ...originalEntry };
    },
    readLedgerEntryByIdempotencyKey: async () => null,
    insertLedgerEntry: async (payload) => {
      insertedRows.push(payload);
      return {
        entry: {
          id: 'ledger-reversal-1',
          ...payload,
        },
        idempotent: false,
      };
    },
    updateLedgerEntryStatusById: async (entryId, status, options = {}) => {
      const updated = {
        ...originalEntry,
        id: entryId,
        status,
        metadata: {
          ...(originalEntry.metadata || {}),
          ...(options?.metadata || {}),
        },
        relatedEntryId: String(options?.relatedEntryId || '').trim(),
      };
      updatedRows.push(updated);
      return updated;
    },
  });

  try {
    const result = await reverseLedgerEntry({
      entryId: originalEntry.id,
      reason: 'Order refunded by admin review.',
    });

    assert.equal(result.success, true);
    assert.equal(result.status, 200);
    assert.equal(insertedRows.length, 1);
    assert.equal(updatedRows.length, 1);

    const insertedReversal = insertedRows[0];
    assert.equal(insertedReversal.type, 'reversal');
    assert.equal(insertedReversal.direction, 'debit');
    assert.equal(insertedReversal.amount, 200);
    assert.equal(insertedReversal.relatedEntryId, originalEntry.id);
    assert.equal(result.data?.originalEntry?.status, 'reversed');
    assert.equal(result.data?.reversalEntry?.type, 'reversal');
    assert.equal(result.data?.reversalEntry?.direction, 'debit');
    assert.equal(result.data?.reversalEntry?.metadata?.originalEntryId, originalEntry.id);
  } finally {
    restoreLedgerServiceDependencies();
  }
});
