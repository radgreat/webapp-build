import pool from '../db/db.js';

function normalizeText(value) {
  return String(value || '').trim();
}

function dedupeRowsById(rows = [], resolveId) {
  const rowsById = new Map();
  for (const row of Array.isArray(rows) ? rows : []) {
    const resolvedId = normalizeText(typeof resolveId === 'function' ? resolveId(row) : '');
    if (!resolvedId) {
      continue;
    }
    rowsById.set(resolvedId, row);
  }
  return Array.from(rowsById.values());
}

function toIsoStringOrEmpty(value) {
  if (!value) {
    return '';
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString();
}

function mapDbBinaryMetricToApp(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    userId: row.user_id || '',
    username: row.username || '',
    email: row.email || '',
    accountRank: row.account_rank || 'Legacy',
    accountPersonalPv: Number(row.account_personal_pv || 0),
    leftLegBv: Number(row.left_leg_bv || 0),
    rightLegBv: Number(row.right_leg_bv || 0),
    totalAccumulatedBv: Number(row.total_accumulated_bv || 0),
    totalCycles: Number(row.total_cycles || 0),
    cycleLowerBv: Number(row.cycle_lower_bv || 500),
    cycleHigherBv: Number(row.cycle_higher_bv || 1000),
    createdAt: toIsoStringOrEmpty(row.created_at),
    updatedAt: toIsoStringOrEmpty(row.updated_at),
  };
}

function mapAppBinaryMetricToDb(snapshot) {
  return {
    id: snapshot?.id || '',
    user_id: snapshot?.userId || null,
    username: snapshot?.username || null,
    email: snapshot?.email || null,
    account_rank: snapshot?.accountRank || 'Legacy',
    account_personal_pv: Number(snapshot?.accountPersonalPv || 0),
    left_leg_bv: Number(snapshot?.leftLegBv || 0),
    right_leg_bv: Number(snapshot?.rightLegBv || 0),
    total_accumulated_bv: Number(snapshot?.totalAccumulatedBv || 0),
    total_cycles: Number(snapshot?.totalCycles || 0),
    cycle_lower_bv: Number(snapshot?.cycleLowerBv || 500),
    cycle_higher_bv: Number(snapshot?.cycleHigherBv || 1000),
    created_at: snapshot?.createdAt || new Date().toISOString(),
    updated_at: snapshot?.updatedAt || new Date().toISOString(),
  };
}

function mapDbSalesCommissionToApp(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    userId: row.user_id || '',
    username: row.username || '',
    email: row.email || '',
    accountPackageKey: row.account_package_key || 'personal-builder-pack',
    cycleMultiplier: Number(row.cycle_multiplier || 0),
    perCycleAmount: Number(row.per_cycle_amount || 0),
    weeklyCapCycles: Number(row.weekly_cap_cycles || 0),
    totalCycles: Number(row.total_cycles || 0),
    cappedCycles: Number(row.capped_cycles || 0),
    overflowCycles: Number(row.overflow_cycles || 0),
    grossCommissionAmount: Number(row.gross_commission_amount || 0),
    payoutOffsetAmount: Number(row.payout_offset_amount || 0),
    netCommissionAmount: Number(row.net_commission_amount || 0),
    currencyCode: row.currency_code || 'USD',
    createdAt: toIsoStringOrEmpty(row.created_at),
    updatedAt: toIsoStringOrEmpty(row.updated_at),
  };
}

function mapAppSalesCommissionToDb(commission) {
  return {
    id: commission?.id || '',
    user_id: commission?.userId || null,
    username: commission?.username || null,
    email: commission?.email || null,
    account_package_key: commission?.accountPackageKey || 'personal-builder-pack',
    cycle_multiplier: Number(commission?.cycleMultiplier || 0),
    per_cycle_amount: Number(commission?.perCycleAmount || 0),
    weekly_cap_cycles: Number(commission?.weeklyCapCycles || 0),
    total_cycles: Number(commission?.totalCycles || 0),
    capped_cycles: Number(commission?.cappedCycles || 0),
    overflow_cycles: Number(commission?.overflowCycles || 0),
    gross_commission_amount: Number(commission?.grossCommissionAmount || 0),
    payout_offset_amount: Number(commission?.payoutOffsetAmount || 0),
    net_commission_amount: Number(commission?.netCommissionAmount || 0),
    currency_code: commission?.currencyCode || 'USD',
    created_at: commission?.createdAt || new Date().toISOString(),
    updated_at: commission?.updatedAt || new Date().toISOString(),
  };
}

function compareMetricsByUpdatedDesc(left, right) {
  const leftMs = Date.parse(String(left?.updatedAt || left?.createdAt || ''));
  const rightMs = Date.parse(String(right?.updatedAt || right?.createdAt || ''));
  return (Number.isFinite(rightMs) ? rightMs : 0) - (Number.isFinite(leftMs) ? leftMs : 0);
}

export async function readMockBinaryTreeMetricsStore() {
  const result = await pool.query(`
    SELECT
      id, user_id, username, email, account_rank, account_personal_pv,
      left_leg_bv, right_leg_bv, total_accumulated_bv, total_cycles,
      cycle_lower_bv, cycle_higher_bv, created_at, updated_at
    FROM charge.binary_tree_metrics_snapshots
    ORDER BY updated_at DESC
  `);

  return result.rows.map(mapDbBinaryMetricToApp).sort(compareMetricsByUpdatedDesc);
}

export async function writeMockBinaryTreeMetricsStore(snapshots) {
  const binaryRows = dedupeRowsById(
    (Array.isArray(snapshots) ? snapshots : []).map(mapAppBinaryMetricToDb),
    (row) => row?.id,
  );
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query('LOCK TABLE charge.binary_tree_metrics_snapshots IN EXCLUSIVE MODE');
    await client.query('DELETE FROM charge.binary_tree_metrics_snapshots');

    for (const row of binaryRows) {
      await client.query(`
        INSERT INTO charge.binary_tree_metrics_snapshots (
          id, user_id, username, email, account_rank, account_personal_pv,
          left_leg_bv, right_leg_bv, total_accumulated_bv, total_cycles,
          cycle_lower_bv, cycle_higher_bv, created_at, updated_at
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14
        )
        ON CONFLICT (id) DO UPDATE
        SET
          user_id = EXCLUDED.user_id,
          username = EXCLUDED.username,
          email = EXCLUDED.email,
          account_rank = EXCLUDED.account_rank,
          account_personal_pv = EXCLUDED.account_personal_pv,
          left_leg_bv = EXCLUDED.left_leg_bv,
          right_leg_bv = EXCLUDED.right_leg_bv,
          total_accumulated_bv = EXCLUDED.total_accumulated_bv,
          total_cycles = EXCLUDED.total_cycles,
          cycle_lower_bv = EXCLUDED.cycle_lower_bv,
          cycle_higher_bv = EXCLUDED.cycle_higher_bv,
          created_at = EXCLUDED.created_at,
          updated_at = EXCLUDED.updated_at
      `, [
        row.id,
        row.user_id,
        row.username,
        row.email,
        row.account_rank,
        row.account_personal_pv,
        row.left_leg_bv,
        row.right_leg_bv,
        row.total_accumulated_bv,
        row.total_cycles,
        row.cycle_lower_bv,
        row.cycle_higher_bv,
        row.created_at,
        row.updated_at,
      ]);
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function readMockSalesTeamCommissionsStore() {
  const result = await pool.query(`
    SELECT
      id, user_id, username, email, account_package_key, cycle_multiplier,
      per_cycle_amount, weekly_cap_cycles, total_cycles, capped_cycles,
      overflow_cycles, gross_commission_amount, payout_offset_amount,
      net_commission_amount, currency_code, created_at, updated_at
    FROM charge.sales_team_commission_snapshots
    ORDER BY updated_at DESC
  `);

  return result.rows.map(mapDbSalesCommissionToApp).sort(compareMetricsByUpdatedDesc);
}

export async function writeMockSalesTeamCommissionsStore(commissions) {
  const commissionRows = dedupeRowsById(
    (Array.isArray(commissions) ? commissions : []).map(mapAppSalesCommissionToDb),
    (row) => row?.id,
  );
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query('LOCK TABLE charge.sales_team_commission_snapshots IN EXCLUSIVE MODE');
    await client.query('DELETE FROM charge.sales_team_commission_snapshots');

    for (const row of commissionRows) {
      await client.query(`
        INSERT INTO charge.sales_team_commission_snapshots (
          id, user_id, username, email, account_package_key, cycle_multiplier,
          per_cycle_amount, weekly_cap_cycles, total_cycles, capped_cycles,
          overflow_cycles, gross_commission_amount, payout_offset_amount,
          net_commission_amount, currency_code, created_at, updated_at
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17
        )
        ON CONFLICT (id) DO UPDATE
        SET
          user_id = EXCLUDED.user_id,
          username = EXCLUDED.username,
          email = EXCLUDED.email,
          account_package_key = EXCLUDED.account_package_key,
          cycle_multiplier = EXCLUDED.cycle_multiplier,
          per_cycle_amount = EXCLUDED.per_cycle_amount,
          weekly_cap_cycles = EXCLUDED.weekly_cap_cycles,
          total_cycles = EXCLUDED.total_cycles,
          capped_cycles = EXCLUDED.capped_cycles,
          overflow_cycles = EXCLUDED.overflow_cycles,
          gross_commission_amount = EXCLUDED.gross_commission_amount,
          payout_offset_amount = EXCLUDED.payout_offset_amount,
          net_commission_amount = EXCLUDED.net_commission_amount,
          currency_code = EXCLUDED.currency_code,
          created_at = EXCLUDED.created_at,
          updated_at = EXCLUDED.updated_at
      `, [
        row.id,
        row.user_id,
        row.username,
        row.email,
        row.account_package_key,
        row.cycle_multiplier,
        row.per_cycle_amount,
        row.weekly_cap_cycles,
        row.total_cycles,
        row.capped_cycles,
        row.overflow_cycles,
        row.gross_commission_amount,
        row.payout_offset_amount,
        row.net_commission_amount,
        row.currency_code,
        row.created_at,
        row.updated_at,
      ]);
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
