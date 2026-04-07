import {
  listMemberNotificationCenterForMember,
  markMemberNotificationAsReadForMember,
  markAllMemberNotificationsAsReadForMember,
} from '../services/member-notification.service.js';

export async function listMemberNotificationCenter(req, res) {
  try {
    const result = await listMemberNotificationCenterForMember(req.authenticatedMember || {});
    if (!result.success) {
      return res.status(result.status).json({
        error: result.error || 'Unable to load member notifications.',
      });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to load member notifications.',
    });
  }
}

export async function postMemberNotificationRead(req, res) {
  try {
    const result = await markMemberNotificationAsReadForMember(
      req.authenticatedMember || {},
      req.params?.notificationId,
    );
    if (!result.success) {
      return res.status(result.status).json({
        error: result.error || 'Unable to mark notification as read.',
      });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to mark notification as read.',
    });
  }
}

export async function postMemberNotificationsMarkAllRead(req, res) {
  try {
    const result = await markAllMemberNotificationsAsReadForMember(
      req.authenticatedMember || {},
      req.body || {},
    );
    if (!result.success) {
      return res.status(result.status).json({
        error: result.error || 'Unable to mark notifications as read.',
      });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to mark notifications as read.',
    });
  }
}
