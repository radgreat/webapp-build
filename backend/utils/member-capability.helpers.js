export const MEMBERSHIP_PLACEMENT_RESERVATION_PACKAGE_KEY = 'membership-placement-reservation';
export const MEMBERSHIP_PLACEMENT_RESERVATION_PACKAGE_LABEL = 'Membership Placement Reservation';
export const ACCOUNT_UPGRADE_REQUIRED_ERROR_MESSAGE = 'Account upgrade required.';

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeCredential(value) {
  return normalizeText(value).toLowerCase();
}

function resolveMemberAccountStatusKey(member = {}) {
  return normalizeCredential(
    member?.accountStatus
    || member?.status
    || member?.userAccountStatus
    || member?.user_account_status
    || member?.memberAccountStatus
    || member?.member_account_status,
  );
}

export function isMembershipPlacementReservationPackage(packageKeyInput = '') {
  return normalizeCredential(packageKeyInput) === MEMBERSHIP_PLACEMENT_RESERVATION_PACKAGE_KEY;
}

export function isPendingMemberAccount(member = {}) {
  const accountStatusKey = resolveMemberAccountStatusKey(member);
  return accountStatusKey === 'pending'
    || accountStatusKey === 'pending-password-setup'
    || accountStatusKey.startsWith('pending-')
    || accountStatusKey.startsWith('pending_');
}

export function isPendingOrReservationMember(member = {}) {
  return isPendingMemberAccount(member)
    || isMembershipPlacementReservationPackage(member?.enrollmentPackage);
}

export function buildAccountUpgradeRequiredResult(status = 403) {
  return {
    success: false,
    status,
    error: ACCOUNT_UPGRADE_REQUIRED_ERROR_MESSAGE,
  };
}
