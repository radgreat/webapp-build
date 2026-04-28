export const BINARY_CYCLE_STRONG_LEG_BV = 1000;
export const BINARY_CYCLE_WEAK_LEG_BV = 500;
export const BINARY_CYCLE_SIDE_LEFT = 'left';
export const BINARY_CYCLE_SIDE_RIGHT = 'right';

function toWholeNumber(value, fallback = 0) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return Math.max(0, Math.floor(Number(fallback) || 0));
  }
  return Math.max(0, Math.floor(numeric));
}

export function resolveBinaryCycleStrongLegBv(value, fallback = BINARY_CYCLE_STRONG_LEG_BV) {
  return Math.max(1, toWholeNumber(value, fallback));
}

export function resolveBinaryCycleWeakLegBv(value, fallback = BINARY_CYCLE_WEAK_LEG_BV) {
  return Math.max(1, toWholeNumber(value, fallback));
}

export function resolveBinaryCycleStrongLegSide(leftVolume, rightVolume) {
  const safeLeftVolume = Math.max(0, toWholeNumber(leftVolume, 0));
  const safeRightVolume = Math.max(0, toWholeNumber(rightVolume, 0));
  // Tie-breaker rule: Left leg is always treated as strong when equal.
  return safeLeftVolume >= safeRightVolume ? BINARY_CYCLE_SIDE_LEFT : BINARY_CYCLE_SIDE_RIGHT;
}

export function resolveBinaryCycleComputation(payload = {}) {
  const leftVolume = Math.max(0, toWholeNumber(payload?.leftVolume, 0));
  const rightVolume = Math.max(0, toWholeNumber(payload?.rightVolume, 0));
  const strongLegCycleBv = resolveBinaryCycleStrongLegBv(payload?.strongLegCycleBv);
  const weakLegCycleBv = resolveBinaryCycleWeakLegBv(payload?.weakLegCycleBv);

  const strongLegSide = resolveBinaryCycleStrongLegSide(leftVolume, rightVolume);
  const weakLegSide = strongLegSide === BINARY_CYCLE_SIDE_LEFT
    ? BINARY_CYCLE_SIDE_RIGHT
    : BINARY_CYCLE_SIDE_LEFT;
  const strongLegVolume = strongLegSide === BINARY_CYCLE_SIDE_LEFT ? leftVolume : rightVolume;
  const weakLegVolume = weakLegSide === BINARY_CYCLE_SIDE_LEFT ? leftVolume : rightVolume;

  const cycleCount = Math.max(0, Math.floor(Math.min(
    strongLegVolume / strongLegCycleBv,
    weakLegVolume / weakLegCycleBv,
  )));

  const consumedStrongLegVolume = Math.min(strongLegVolume, cycleCount * strongLegCycleBv);
  const consumedWeakLegVolume = Math.min(weakLegVolume, cycleCount * weakLegCycleBv);
  const consumedLeftVolume = strongLegSide === BINARY_CYCLE_SIDE_LEFT
    ? consumedStrongLegVolume
    : consumedWeakLegVolume;
  const consumedRightVolume = strongLegSide === BINARY_CYCLE_SIDE_RIGHT
    ? consumedStrongLegVolume
    : consumedWeakLegVolume;
  const remainingLeftVolume = Math.max(0, leftVolume - consumedLeftVolume);
  const remainingRightVolume = Math.max(0, rightVolume - consumedRightVolume);

  return {
    cycleCount,
    strongLegSide,
    weakLegSide,
    strongLegCycleBv,
    weakLegCycleBv,
    strongLegVolume,
    weakLegVolume,
    consumedStrongLegVolume,
    consumedWeakLegVolume,
    consumedLeftVolume,
    consumedRightVolume,
    remainingLeftVolume,
    remainingRightVolume,
  };
}

export function resolveServerCutoffCarryForwardState(payload = {}) {
  const totalLeftLegBv = Math.max(0, toWholeNumber(payload?.totalLeftLegBv, 0));
  const totalRightLegBv = Math.max(0, toWholeNumber(payload?.totalRightLegBv, 0));
  const baselineLeftLegBv = Math.min(
    totalLeftLegBv,
    Math.max(0, toWholeNumber(payload?.baselineLeftLegBv, 0)),
  );
  const baselineRightLegBv = Math.min(
    totalRightLegBv,
    Math.max(0, toWholeNumber(payload?.baselineRightLegBv, 0)),
  );
  const isActiveAtCutoff = payload?.isActiveAtCutoff !== false;
  const currentWeekLeftLegBv = Math.max(0, totalLeftLegBv - baselineLeftLegBv);
  const currentWeekRightLegBv = Math.max(0, totalRightLegBv - baselineRightLegBv);
  const cycleComputation = resolveBinaryCycleComputation({
    leftVolume: currentWeekLeftLegBv,
    rightVolume: currentWeekRightLegBv,
    strongLegCycleBv: payload?.strongLegCycleBv,
    weakLegCycleBv: payload?.weakLegCycleBv,
  });
  const consumedLeftLegBv = isActiveAtCutoff ? cycleComputation.consumedLeftVolume : 0;
  const consumedRightLegBv = isActiveAtCutoff ? cycleComputation.consumedRightVolume : 0;
  const nextBaselineLeftLegBv = isActiveAtCutoff
    ? Math.min(totalLeftLegBv, baselineLeftLegBv + consumedLeftLegBv)
    : totalLeftLegBv;
  const nextBaselineRightLegBv = isActiveAtCutoff
    ? Math.min(totalRightLegBv, baselineRightLegBv + consumedRightLegBv)
    : totalRightLegBv;

  return {
    baselineLeftLegBv: nextBaselineLeftLegBv,
    baselineRightLegBv: nextBaselineRightLegBv,
    currentWeekLeftLegBv,
    currentWeekRightLegBv,
    consumedLeftLegBv,
    consumedRightLegBv,
    carryForwardLeftLegBv: isActiveAtCutoff ? cycleComputation.remainingLeftVolume : 0,
    carryForwardRightLegBv: isActiveAtCutoff ? cycleComputation.remainingRightVolume : 0,
    cyclesToApply: isActiveAtCutoff ? cycleComputation.cycleCount : 0,
    wasFlushedForInactivity: !isActiveAtCutoff && (currentWeekLeftLegBv > 0 || currentWeekRightLegBv > 0),
    strongLegSide: cycleComputation.strongLegSide,
  };
}
