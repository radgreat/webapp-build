import { Router } from 'express';
import {
  listMemberProfileAchievements,
  claimMemberProfileAchievement,
  equipMemberProfileAchievementBadge,
} from '../controllers/member-achievement.controller.js';
import { requireMemberAuthSession } from '../middleware/member-auth.middleware.js';

const router = Router();

router.get('/achievements', requireMemberAuthSession, listMemberProfileAchievements);
router.post('/achievements/:achievementId/claim', requireMemberAuthSession, claimMemberProfileAchievement);
router.post('/achievements/:achievementId/equip', requireMemberAuthSession, equipMemberProfileAchievementBadge);

export default router;
