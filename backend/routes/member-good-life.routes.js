import { Router } from 'express';
import {
  getMemberGoodLifeMonthlyStatus,
  claimMemberGoodLifeMonthlyReward,
} from '../controllers/member-good-life.controller.js';
import { requireMemberAuthSession } from '../middleware/member-auth.middleware.js';

const router = Router();

router.get('/good-life/monthly', requireMemberAuthSession, getMemberGoodLifeMonthlyStatus);
router.post('/good-life/monthly/claim', requireMemberAuthSession, claimMemberGoodLifeMonthlyReward);

export default router;
