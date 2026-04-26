export const ACTIVE_MEMBER_MONTHLY_PERSONAL_BV_MIN = 50;

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeCredential(value) {
  return normalizeText(value).toLowerCase();
}

function toWholeNumber(value, fallback = 0) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return Math.max(0, Math.floor(Number(fallback) || 0));
  }
  return Math.max(0, Math.floor(numeric));
}

function resolveFirstFiniteNumber(candidates = []) {
  const source = Array.isArray(candidates) ? candidates : [];
  for (const candidate of source) {
    const numeric = Number(candidate);
    if (Number.isFinite(numeric)) {
      return numeric;
    }
  }
  return NaN;
}

function parseDate(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? new Date(value.getTime()) : null;
  }

  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed : null;
}

function resolveActivityAnchorDate(member = {}, referenceDate = new Date()) {
  return parseDate(
    member?.createdAt
    || member?.created_at
    || member?.joinedAt
    || member?.joined_at
    || member?.enrolledAt
    || member?.enrolled_at,
  ) || parseDate(referenceDate) || new Date();
}

function buildAnchoredMonthlyDate(anchorDate, year, monthIndex) {
  const safeAnchor = parseDate(anchorDate) || new Date();
  const lastDayOfMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const anchoredDay = Math.min(safeAnchor.getUTCDate(), lastDayOfMonth);
  return new Date(Date.UTC(
    year,
    monthIndex,
    anchoredDay,
    safeAnchor.getUTCHours(),
    safeAnchor.getUTCMinutes(),
    safeAnchor.getUTCSeconds(),
    safeAnchor.getUTCMilliseconds(),
  ));
}

export function resolveMemberNextMonthlyCutoffDate(member = {}, options = {}) {
  const referenceDate = parseDate(options?.referenceDate) || new Date();
  const anchorDate = resolveActivityAnchorDate(member, referenceDate);

  let nextCutoffDate = buildAnchoredMonthlyDate(
    anchorDate,
    referenceDate.getUTCFullYear(),
    referenceDate.getUTCMonth(),
  );

  if (nextCutoffDate.getTime() <= referenceDate.getTime()) {
    const nextMonthIndex = referenceDate.getUTCMonth() + 1;
    const nextYear = referenceDate.getUTCFullYear() + Math.floor(nextMonthIndex / 12);
    const normalizedNextMonthIndex = ((nextMonthIndex % 12) + 12) % 12;
    nextCutoffDate = buildAnchoredMonthlyDate(anchorDate, nextYear, normalizedNextMonthIndex);
  }

  return nextCutoffDate;
}

export function resolveMemberNextMonthlyCutoffAt(member = {}, options = {}) {
  return resolveMemberNextMonthlyCutoffDate(member, options).toISOString();
}

function resolveMemberCurrentWindowStartDate(member = {}, options = {}) {
  const nextCutoffDate = resolveMemberNextMonthlyCutoffDate(member, options);
  const anchorDate = resolveActivityAnchorDate(member, parseDate(options?.referenceDate) || new Date());

  const previousMonthIndex = nextCutoffDate.getUTCMonth() - 1;
  const previousYear = nextCutoffDate.getUTCFullYear() + Math.floor(previousMonthIndex / 12);
  const normalizedPreviousMonthIndex = ((previousMonthIndex % 12) + 12) % 12;

  return buildAnchoredMonthlyDate(anchorDate, previousYear, normalizedPreviousMonthIndex);
}

function resolveLatestPersonalBvEventDate(member = {}) {
  const candidates = [
    parseDate(member?.lastProductPurchaseAt),
    parseDate(member?.last_product_purchase_at),
    parseDate(member?.lastAccountUpgradeAt),
    parseDate(member?.last_account_upgrade_at),
    parseDate(member?.lastPurchaseAt),
    parseDate(member?.last_purchase_at),
    parseDate(member?.createdAt),
    parseDate(member?.created_at),
  ]
    .filter(Boolean)
    .map((date) => date.getTime())
    .sort((left, right) => right - left);

  if (!candidates.length) {
    return null;
  }

  return new Date(candidates[0]);
}

function resolvePendingStatus(member = {}) {
  const explicitStatus = normalizeCredential(
    member?.accountStatus
    || member?.status
    || member?.userAccountStatus
    || member?.user_account_status
    || member?.memberAccountStatus
    || member?.member_account_status,
  );
  if (explicitStatus === 'pending') {
    return 'pending';
  }
  return member?.passwordSetupRequired === true ? 'pending-password-setup' : '';
}

function resolveInactiveStatusOverride(member = {}) {

  const explicitStatus = normalizeText(
    member?.accountStatus
    || member?.status
    || member?.userAccountStatus
    || member?.user_account_status
    || member?.memberAccountStatus
    || member?.member_account_status,
  );
  const normalizedStatus = normalizeCredential(explicitStatus);
  if (!normalizedStatus) {
    return '';
  }

  if (normalizedStatus.includes('review')) {
    return 'under-review';
  }
  if (normalizedStatus.includes('suspend')) {
    return 'suspended';
  }
  if (normalizedStatus.includes('disable')) {
    return 'disabled';
  }
  return '';
}

function resolveRawMemberCurrentPersonalBv(member = {}) {
  const explicitCurrentPersonalBv = resolveFirstFiniteNumber([
    member?.currentPersonalPvBv,
    member?.current_personal_pv_bv,
    member?.monthlyPersonalBv,
    member?.monthly_personal_bv,
    member?.currentWeekPersonalPv,
    member?.current_week_personal_pv,
  ]);
  if (Number.isFinite(explicitCurrentPersonalBv)) {
    return Math.max(0, Math.floor(explicitCurrentPersonalBv));
  }

  const enrollmentPackageBv = toWholeNumber(
    resolveFirstFiniteNumber([
      member?.enrollmentPackageBv,
      member?.enrollment_package_bv,
      member?.packageBv,
      member?.package_bv,
    ]),
    0,
  );
  const starterPersonalPv = toWholeNumber(
    resolveFirstFiniteNumber([
      member?.starterPersonalPv,
      member?.starter_personal_pv,
      member?.personalVolumeBv,
      member?.personal_volume_bv,
      member?.volume,
    ]),
    enrollmentPackageBv,
  );
  const baselineStarterPersonalPv = toWholeNumber(
    resolveFirstFiniteNumber([
      member?.serverCutoffBaselineStarterPersonalPv,
      member?.server_cutoff_baseline_starter_personal_pv,
      member?.personalVolumeBaselineBv,
      member?.personal_volume_baseline_bv,
    ]),
    0,
  );

  return Math.max(0, starterPersonalPv - baselineStarterPersonalPv);
}

export function resolveMemberPersonalBvSnapshot(member = {}, options = {}) {
  const referenceDate = parseDate(options?.referenceDate) || new Date();
  const nextCutoffDate = resolveMemberNextMonthlyCutoffDate(member, { referenceDate });
  const currentWindowStartDate = resolveMemberCurrentWindowStartDate(member, { referenceDate });
  const latestPersonalBvEventDate = resolveLatestPersonalBvEventDate(member);
  const rawCurrentPersonalPvBv = resolveRawMemberCurrentPersonalBv(member);

  const hasCurrentWindowEvent = latestPersonalBvEventDate
    ? latestPersonalBvEventDate.getTime() >= currentWindowStartDate.getTime()
    : resolveActivityAnchorDate(member, referenceDate).getTime() >= currentWindowStartDate.getTime();

  return {
    referenceAt: referenceDate.toISOString(),
    currentWindowStartAt: currentWindowStartDate.toISOString(),
    nextCutoffAt: nextCutoffDate.toISOString(),
    lastPersonalBvEventAt: latestPersonalBvEventDate ? latestPersonalBvEventDate.toISOString() : '',
    rawCurrentPersonalPvBv,
    currentPersonalPvBv: hasCurrentWindowEvent ? rawCurrentPersonalPvBv : 0,
    hasCurrentWindowEvent,
  };
}

export function resolveMemberCurrentPersonalBv(member = {}) {
  return resolveMemberPersonalBvSnapshot(member).currentPersonalPvBv;
}

export function resolveMemberActivityStateByPersonalBv(member = {}, options = {}) {
  const requiredPersonalBv = Math.max(
    1,
    toWholeNumber(options?.requiredPersonalBv, ACTIVE_MEMBER_MONTHLY_PERSONAL_BV_MIN),
  );
  const personalBvSnapshot = resolveMemberPersonalBvSnapshot(member, options);
  const currentPersonalPvBv = personalBvSnapshot.currentPersonalPvBv;
  const inactiveStatusOverride = resolveInactiveStatusOverride(member);

  if (inactiveStatusOverride) {
    return {
      isActive: false,
      label: 'Inactive',
      accountStatus: inactiveStatusOverride,
      currentPersonalPvBv,
      requiredPersonalBv,
      activeUntilAt: personalBvSnapshot.nextCutoffAt,
    };
  }

  const isActive = currentPersonalPvBv >= requiredPersonalBv;
  const pendingStatus = resolvePendingStatus(member);
  return {
    isActive,
    label: isActive ? 'Active' : 'Inactive',
    accountStatus: pendingStatus || (isActive ? 'active' : 'inactive'),
    currentPersonalPvBv,
    requiredPersonalBv,
    activeUntilAt: personalBvSnapshot.nextCutoffAt,
  };
}

export function resolveMemberAccountStatusByPersonalBv(member = {}, options = {}) {
  return resolveMemberActivityStateByPersonalBv(member, options).accountStatus;
}
