import {
  listVisibleMemberNotificationsForUser,
  findVisibleMemberNotificationById,
  markMemberNotificationRead,
  markAllVisibleMemberNotificationsRead,
} from '../stores/member-notification.store.js';

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeCredential(value) {
  return normalizeText(value).toLowerCase();
}

function normalizeScope(value) {
  const normalized = normalizeCredential(value);
  if (normalized === 'notification' || normalized === 'notifications') {
    return 'notifications';
  }
  if (normalized === 'announcement' || normalized === 'announcements') {
    return 'announcements';
  }
  return 'all';
}

function resolveStoreCategoryFromScope(scope) {
  if (scope === 'notifications') {
    return 'notification';
  }
  if (scope === 'announcements') {
    return 'announcement';
  }
  return '';
}

function resolveAuthenticatedMemberIdentity(memberInput = {}) {
  const userId = normalizeText(memberInput?.id || memberInput?.userId);
  const username = normalizeText(memberInput?.username);

  if (!userId) {
    return {
      valid: false,
      userId: '',
      username: '',
    };
  }

  return {
    valid: true,
    userId,
    username,
  };
}

function mapNotificationCenterEntry(entry = {}) {
  return {
    id: normalizeText(entry?.id),
    category: normalizeCredential(entry?.category) === 'announcement'
      ? 'announcement'
      : 'notification',
    audience: normalizeText(entry?.audience || 'all') || 'all',
    title: normalizeText(entry?.title),
    message: normalizeText(entry?.message),
    tone: normalizeCredential(entry?.tone) || 'info',
    ctaLabel: normalizeText(entry?.ctaLabel),
    ctaHref: normalizeText(entry?.ctaHref),
    metadata: entry?.metadata && typeof entry.metadata === 'object' && !Array.isArray(entry.metadata)
      ? entry.metadata
      : {},
    pinned: Boolean(entry?.pinned),
    read: Boolean(entry?.read),
    readAt: normalizeText(entry?.readAt),
    startAt: normalizeText(entry?.startAt),
    expiresAt: normalizeText(entry?.expiresAt),
    createdAt: normalizeText(entry?.createdAt),
    updatedAt: normalizeText(entry?.updatedAt),
  };
}

function summarizeUnreadCounts(entries = []) {
  const safeEntries = Array.isArray(entries) ? entries : [];
  const unreadNotifications = safeEntries.filter((entry) => !entry.read && entry.category === 'notification').length;
  const unreadAnnouncements = safeEntries.filter((entry) => !entry.read && entry.category === 'announcement').length;

  return {
    total: unreadNotifications + unreadAnnouncements,
    notifications: unreadNotifications,
    announcements: unreadAnnouncements,
  };
}

function buildNotificationCenterPayload(entries = []) {
  const safeEntries = (Array.isArray(entries) ? entries : [])
    .map(mapNotificationCenterEntry)
    .filter((entry) => entry.id);
  const notifications = safeEntries.filter((entry) => entry.category === 'notification');
  const announcements = safeEntries.filter((entry) => entry.category === 'announcement');
  const unreadCounts = summarizeUnreadCounts(safeEntries);

  return {
    notifications,
    announcements,
    unreadCounts,
    totalCount: safeEntries.length,
    fetchedAt: new Date().toISOString(),
  };
}

export async function listMemberNotificationCenterForMember(memberInput = {}, options = {}) {
  const memberIdentity = resolveAuthenticatedMemberIdentity(memberInput);
  if (!memberIdentity.valid) {
    return {
      success: false,
      status: 401,
      error: 'Member authentication session is missing.',
    };
  }

  const requestedLimit = Number.parseInt(String(options?.limit || '80'), 10);
  const limit = Number.isFinite(requestedLimit)
    ? Math.max(1, Math.min(200, requestedLimit))
    : 80;

  const entries = await listVisibleMemberNotificationsForUser(
    memberIdentity.userId,
    memberIdentity.username,
    { limit },
  );
  const payload = buildNotificationCenterPayload(entries);

  return {
    success: true,
    status: 200,
    data: payload,
  };
}

export async function markMemberNotificationAsReadForMember(memberInput = {}, notificationIdInput) {
  const memberIdentity = resolveAuthenticatedMemberIdentity(memberInput);
  if (!memberIdentity.valid) {
    return {
      success: false,
      status: 401,
      error: 'Member authentication session is missing.',
    };
  }

  const notificationId = normalizeText(notificationIdInput);
  if (!notificationId) {
    return {
      success: false,
      status: 400,
      error: 'Notification id is required.',
    };
  }

  const visibleNotification = await findVisibleMemberNotificationById(
    memberIdentity.userId,
    memberIdentity.username,
    notificationId,
  );
  if (!visibleNotification) {
    return {
      success: false,
      status: 404,
      error: 'Notification not found for this member.',
    };
  }

  const readRecord = await markMemberNotificationRead(memberIdentity.userId, notificationId);
  if (!readRecord) {
    return {
      success: false,
      status: 500,
      error: 'Unable to update notification read state.',
    };
  }

  const snapshotResult = await listMemberNotificationCenterForMember(memberInput);
  if (!snapshotResult.success) {
    return snapshotResult;
  }

  return {
    success: true,
    status: 200,
    data: {
      success: true,
      notificationId,
      readAt: readRecord.readAt,
      unreadCounts: snapshotResult.data.unreadCounts,
    },
  };
}

export async function markAllMemberNotificationsAsReadForMember(memberInput = {}, payload = {}) {
  const memberIdentity = resolveAuthenticatedMemberIdentity(memberInput);
  if (!memberIdentity.valid) {
    return {
      success: false,
      status: 401,
      error: 'Member authentication session is missing.',
    };
  }

  const scope = normalizeScope(payload?.scope);
  const category = resolveStoreCategoryFromScope(scope);

  const markResult = await markAllVisibleMemberNotificationsRead(
    memberIdentity.userId,
    memberIdentity.username,
    { category },
  );

  const snapshotResult = await listMemberNotificationCenterForMember(memberInput);
  if (!snapshotResult.success) {
    return snapshotResult;
  }

  return {
    success: true,
    status: 200,
    data: {
      success: true,
      scope,
      markedCount: Number(markResult?.markedCount || 0),
      unreadCounts: snapshotResult.data.unreadCounts,
    },
  };
}
