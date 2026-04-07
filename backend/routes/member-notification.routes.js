import { Router } from 'express';
import {
  listMemberNotificationCenter,
  postMemberNotificationRead,
  postMemberNotificationsMarkAllRead,
} from '../controllers/member-notification.controller.js';
import { requireMemberAuthSession } from '../middleware/member-auth.middleware.js';

const router = Router();

router.get('/notifications', requireMemberAuthSession, listMemberNotificationCenter);
router.post('/notifications/mark-all-read', requireMemberAuthSession, postMemberNotificationsMarkAllRead);
router.post('/notifications/:notificationId/read', requireMemberAuthSession, postMemberNotificationRead);

export default router;
