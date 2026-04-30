import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveBinaryCycleComputation,
  resolveServerCutoffCarryForwardState,
} from '../utils/binary-cycle.helpers.js';

test('active member carries forward when below 1000/500 cycle requirement', () => {
  const result = resolveServerCutoffCarryForwardState({
    totalLeftLegBv: 900,
    totalRightLegBv: 400,
    baselineLeftLegBv: 0,
    baselineRightLegBv: 0,
    isActiveAtCutoff: true,
  });

  assert.equal(result.cyclesToApply, 0);
  assert.equal(result.carryForwardLeftLegBv, 900);
  assert.equal(result.carryForwardRightLegBv, 400);
  assert.equal(result.baselineLeftLegBv, 0);
  assert.equal(result.baselineRightLegBv, 0);
});

test('active member with 1000/500 settles one cycle and no carry remains', () => {
  const result = resolveServerCutoffCarryForwardState({
    totalLeftLegBv: 1000,
    totalRightLegBv: 500,
    baselineLeftLegBv: 0,
    baselineRightLegBv: 0,
    isActiveAtCutoff: true,
  });

  assert.equal(result.cyclesToApply, 1);
  assert.equal(result.consumedLeftLegBv, 1000);
  assert.equal(result.consumedRightLegBv, 500);
  assert.equal(result.carryForwardLeftLegBv, 0);
  assert.equal(result.carryForwardRightLegBv, 0);
});

test('active member 2500/1200 settles two cycles with expected remainder', () => {
  const result = resolveServerCutoffCarryForwardState({
    totalLeftLegBv: 2500,
    totalRightLegBv: 1200,
    baselineLeftLegBv: 0,
    baselineRightLegBv: 0,
    isActiveAtCutoff: true,
  });

  assert.equal(result.cyclesToApply, 2);
  assert.equal(result.strongLegSide, 'left');
  assert.equal(result.carryForwardLeftLegBv, 500);
  assert.equal(result.carryForwardRightLegBv, 200);
});

test('active member mirrored 1200/2500 also settles two cycles with mirrored remainder', () => {
  const result = resolveServerCutoffCarryForwardState({
    totalLeftLegBv: 1200,
    totalRightLegBv: 2500,
    baselineLeftLegBv: 0,
    baselineRightLegBv: 0,
    isActiveAtCutoff: true,
  });

  assert.equal(result.cyclesToApply, 2);
  assert.equal(result.strongLegSide, 'right');
  assert.equal(result.carryForwardLeftLegBv, 200);
  assert.equal(result.carryForwardRightLegBv, 500);
});

test('tie-breaker enforces left leg as strong leg', () => {
  const result = resolveBinaryCycleComputation({
    leftVolume: 1500,
    rightVolume: 1500,
  });

  assert.equal(result.strongLegSide, 'left');
  assert.equal(result.cycleCount, 1);
  assert.equal(result.consumedLeftVolume, 1000);
  assert.equal(result.consumedRightVolume, 500);
  assert.equal(result.remainingLeftVolume, 500);
  assert.equal(result.remainingRightVolume, 1000);
});

test('inactive cutoff flushes carry-forward to 0/0 by consuming current-week BV', () => {
  const result = resolveServerCutoffCarryForwardState({
    totalLeftLegBv: 2500,
    totalRightLegBv: 1200,
    baselineLeftLegBv: 0,
    baselineRightLegBv: 0,
    isActiveAtCutoff: false,
  });

  assert.equal(result.cyclesToApply, 0);
  assert.equal(result.carryForwardLeftLegBv, 0);
  assert.equal(result.carryForwardRightLegBv, 0);
  assert.equal(result.baselineLeftLegBv, 2500);
  assert.equal(result.baselineRightLegBv, 1200);
  assert.equal(result.wasFlushedForInactivity, true);
});

test('inactive one-leg volume also flushes both legs to 0 carry-forward', () => {
  const result = resolveServerCutoffCarryForwardState({
    totalLeftLegBv: 1100,
    totalRightLegBv: 0,
    baselineLeftLegBv: 0,
    baselineRightLegBv: 0,
    isActiveAtCutoff: false,
  });

  assert.equal(result.carryForwardLeftLegBv, 0);
  assert.equal(result.carryForwardRightLegBv, 0);
  assert.equal(result.baselineLeftLegBv, 1100);
  assert.equal(result.baselineRightLegBv, 0);
});

test('reactivating after inactive flush does not restore previously flushed BV', () => {
  const afterInactiveFlush = resolveServerCutoffCarryForwardState({
    totalLeftLegBv: 1800,
    totalRightLegBv: 700,
    baselineLeftLegBv: 0,
    baselineRightLegBv: 0,
    isActiveAtCutoff: false,
  });
  const nextActiveCutoff = resolveServerCutoffCarryForwardState({
    totalLeftLegBv: 1800,
    totalRightLegBv: 700,
    baselineLeftLegBv: afterInactiveFlush.baselineLeftLegBv,
    baselineRightLegBv: afterInactiveFlush.baselineRightLegBv,
    isActiveAtCutoff: true,
  });

  assert.equal(nextActiveCutoff.currentWeekLeftLegBv, 0);
  assert.equal(nextActiveCutoff.currentWeekRightLegBv, 0);
  assert.equal(nextActiveCutoff.carryForwardLeftLegBv, 0);
  assert.equal(nextActiveCutoff.carryForwardRightLegBv, 0);
});

test('multiple cutoffs remain idempotent with no duplicate cycle consumption', () => {
  const firstCutoff = resolveServerCutoffCarryForwardState({
    totalLeftLegBv: 2500,
    totalRightLegBv: 1200,
    baselineLeftLegBv: 0,
    baselineRightLegBv: 0,
    isActiveAtCutoff: true,
  });
  const secondCutoff = resolveServerCutoffCarryForwardState({
    totalLeftLegBv: 2500,
    totalRightLegBv: 1200,
    baselineLeftLegBv: firstCutoff.baselineLeftLegBv,
    baselineRightLegBv: firstCutoff.baselineRightLegBv,
    isActiveAtCutoff: true,
  });

  assert.equal(firstCutoff.cyclesToApply, 2);
  assert.equal(secondCutoff.cyclesToApply, 0);
  assert.equal(secondCutoff.carryForwardLeftLegBv, 500);
  assert.equal(secondCutoff.carryForwardRightLegBv, 200);
});

test('new weekly BV is not double-counted against prior carry-forward', () => {
  const priorCutoff = resolveServerCutoffCarryForwardState({
    totalLeftLegBv: 2500,
    totalRightLegBv: 1200,
    baselineLeftLegBv: 0,
    baselineRightLegBv: 0,
    isActiveAtCutoff: true,
  });
  const nextWeekCutoff = resolveServerCutoffCarryForwardState({
    totalLeftLegBv: 3100,
    totalRightLegBv: 1500,
    baselineLeftLegBv: priorCutoff.baselineLeftLegBv,
    baselineRightLegBv: priorCutoff.baselineRightLegBv,
    isActiveAtCutoff: true,
  });

  assert.equal(nextWeekCutoff.currentWeekLeftLegBv, 1100);
  assert.equal(nextWeekCutoff.currentWeekRightLegBv, 500);
  assert.equal(nextWeekCutoff.cyclesToApply, 1);
  assert.equal(nextWeekCutoff.carryForwardLeftLegBv, 100);
  assert.equal(nextWeekCutoff.carryForwardRightLegBv, 0);
});

test('volume safeguards prevent negative carry or consumption values', () => {
  const result = resolveServerCutoffCarryForwardState({
    totalLeftLegBv: -20,
    totalRightLegBv: 10,
    baselineLeftLegBv: -100,
    baselineRightLegBv: -200,
    isActiveAtCutoff: true,
  });

  assert.equal(result.currentWeekLeftLegBv, 0);
  assert.equal(result.currentWeekRightLegBv, 10);
  assert.equal(result.consumedLeftLegBv, 0);
  assert.equal(result.consumedRightLegBv, 0);
  assert.equal(result.carryForwardLeftLegBv, 0);
  assert.equal(result.carryForwardRightLegBv, 10);
});
