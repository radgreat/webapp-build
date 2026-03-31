import pool from '../db/db.js';

function normalizeText(value) {
  return String(value || '').trim();
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

function normalizeIsoTimestamp(value, fallbackMs = Date.now()) {
  const parsedMs = Date.parse(normalizeText(value));
  const safeMs = Number.isFinite(parsedMs) ? parsedMs : fallbackMs;
  return new Date(safeMs).toISOString();
}

function mapDbCutoffHistoryToApp(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    forcedAt: toIsoStringOrEmpty(row.forced_at),
    forcedBy: row.forced_by || 'admin',
    applied: {
      snapshotsUpdated: Number(row.snapshots_updated || 0),
      commissionsUpdated: Number(row.commissions_updated || 0),
      commissionsUnchanged: Number(row.commissions_unchanged || 0),
      memberServerCutoffStatesTargeted: Number(row.member_server_cutoff_states_targeted || 0),
      memberServerCutoffStatesUpdated: Number(row.member_server_cutoff_states_updated || 0),
      totalCyclesApplied: Number(row.total_cycles_applied || 0),
      totalCappedCycles: Number(row.total_capped_cycles || 0),
      totalOverflowCycles: Number(row.total_overflow_cycles || 0),
      totalGrossCommissionAmount: Number(row.total_gross_commission_amount || 0),
      totalPayoutOffsetAmount: Number(row.total_payout_offset_amount || 0),
      totalNetCommissionAmount: Number(row.total_net_commission_amount || 0),
    },
    createdAt: toIsoStringOrEmpty(row.created_at),
    updatedAt: toIsoStringOrEmpty(row.updated_at),
  };
}

function mapAppCutoffHistoryToDb(entry) {
  const applied = entry?.applied && typeof entry.applied === 'object' ? entry.applied : {};

  return {
    id: entry?.id || '',
    forced_at: entry?.forcedAt || new Date().toISOString(),
    forced_by: entry?.forcedBy || 'admin',
    snapshots_updated: Number(applied.snapshotsUpdated || 0),
    commissions_updated: Number(applied.commissionsUpdated || 0),
    commissions_unchanged: Number(applied.commissionsUnchanged || 0),
    member_server_cutoff_states_targeted: Number(applied.memberServerCutoffStatesTargeted || 0),
    member_server_cutoff_states_updated: Number(applied.memberServerCutoffStatesUpdated || 0),
    total_cycles_applied: Number(applied.totalCyclesApplied || 0),
    total_capped_cycles: Number(applied.totalCappedCycles || 0),
    total_overflow_cycles: Number(applied.totalOverflowCycles || 0),
    total_gross_commission_amount: Number(applied.totalGrossCommissionAmount || 0),
    total_payout_offset_amount: Number(applied.totalPayoutOffsetAmount || 0),
    total_net_commission_amount: Number(applied.totalNetCommissionAmount || 0),
    created_at: entry?.createdAt || new Date().toISOString(),
    updated_at: entry?.updatedAt || new Date().toISOString(),
  };
}

function mapDbMemberCutoffStateToApp(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    userId: row.user_id || '',
    username: row.username || '',
    email: row.email || '',
    baselineLeftLegBv: Number(row.baseline_left_leg_bv || 0),
    baselineRightLegBv: Number(row.baseline_right_leg_bv || 0),
    lastAppliedCutoffUtcMs: Number(row.last_applied_cutoff_utc_ms || 0),
    createdAt: toIsoStringOrEmpty(row.created_at),
    updatedAt: toIsoStringOrEmpty(row.updated_at),
  };
}

function mapAppMemberCutoffStateToDb(entry) {
  return {
    id: entry?.id || '',
    user_id: entry?.userId || null,
    username: entry?.username || null,
    email: entry?.email || null,
    baseline_left_leg_bv: Number(entry?.baselineLeftLegBv || 0),
    baseline_right_leg_bv: Number(entry?.baselineRightLegBv || 0),
    last_applied_cutoff_utc_ms: Number(entry?.lastAppliedCutoffUtcMs || 0),
    created_at: entry?.createdAt || new Date().toISOString(),
    updated_at: entry?.updatedAt || new Date().toISOString(),
  };
}

function compareForceServerCutoffHistoryByDateDesc(left, right) {
  const leftMs = Date.parse(String(left?.forcedAt || ''));
  const rightMs = Date.parse(String(right?.forcedAt || ''));
  return (Number.isFinite(rightMs) ? rightMs : 0) - (Number.isFinite(leftMs) ? leftMs : 0);
}

function compareMetricsByUpdatedDesc(left, right) {
  const leftMs = Date.parse(String(left?.updatedAt || left?.createdAt || ''));
  const rightMs = Date.parse(String(right?.updatedAt || right?.createdAt || ''));
  return (Number.isFinite(rightMs) ? rightMs : 0) - (Number.isFinite(leftMs) ? leftMs : 0);
}

export async function readForceServerCutoffHistoryStore() {
  const result = await pool.query(`
    SELECT
      id,
      forced_at,
      forced_by,
      snapshots_updated,
      commissions_updated,
      commissions_unchanged,
      member_server_cutoff_states_targeted,
      member_server_cutoff_states_updated,
      total_cycles_applied,
      total_capped_cycles,
      total_overflow_cycles,
      total_gross_commission_amount,
      total_payout_offset_amount,
      total_net_commission_amount,
      created_at,
      updated_at
    FROM charge.force_server_cutoff_history
    ORDER BY forced_at DESC
  `);

  return result.rows.map(mapDbCutoffHistoryToApp).sort(compareForceServerCutoffHistoryByDateDesc);
}

export async function writeForceServerCutoffHistoryStore(entries) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM charge.force_server_cutoff_history');

    for (const entry of Array.isArray(entries) ? entries : []) {
      const row = mapAppCutoffHistoryToDb(entry);

      await client.query(`
        INSERT INTO charge.force_server_cutoff_history (
          id,
          forced_at,
          forced_by,
          snapshots_updated,
          commissions_updated,
          commissions_unchanged,
          member_server_cutoff_states_targeted,
          member_server_cutoff_states_updated,
          total_cycles_applied,
          total_capped_cycles,
          total_overflow_cycles,
          total_gross_commission_amount,
          total_payout_offset_amount,
          total_net_commission_amount,
          created_at,
          updated_at
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16
        )
      `, [
        row.id,
        row.forced_at,
        row.forced_by,
        row.snapshots_updated,
        row.commissions_updated,
        row.commissions_unchanged,
        row.member_server_cutoff_states_targeted,
        row.member_server_cutoff_states_updated,
        row.total_cycles_applied,
        row.total_capped_cycles,
        row.total_overflow_cycles,
        row.total_gross_commission_amount,
        row.total_payout_offset_amount,
        row.total_net_commission_amount,
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

export async function readMemberServerCutoffStateStore() {
  const result = await pool.query(`
    SELECT
      id,
      user_id,
      username,
      email,
      baseline_left_leg_bv,
      baseline_right_leg_bv,
      last_applied_cutoff_utc_ms,
      created_at,
      updated_at
    FROM charge.member_server_cutoff_states
    ORDER BY updated_at DESC
  `);

  return result.rows.map(mapDbMemberCutoffStateToApp).sort(compareMetricsByUpdatedDesc);
}

export async function writeMemberServerCutoffStateStore(states) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM charge.member_server_cutoff_states');

    for (const state of Array.isArray(states) ? states : []) {
      const row = mapAppMemberCutoffStateToDb(state);

      await client.query(`
        INSERT INTO charge.member_server_cutoff_states (
          id,
          user_id,
          username,
          email,
          baseline_left_leg_bv,
          baseline_right_leg_bv,
          last_applied_cutoff_utc_ms,
          created_at,
          updated_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      `, [
        row.id,
        row.user_id,
        row.username,
        row.email,
        row.baseline_left_leg_bv,
        row.baseline_right_leg_bv,
        row.last_applied_cutoff_utc_ms,
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