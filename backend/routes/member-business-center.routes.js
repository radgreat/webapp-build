import { Router } from 'express';
import {
  listMemberBusinessCenters,
  syncMemberBusinessCenterProgress,
  activateMemberBusinessCenter,
  listMemberBusinessCenterEarnings,
  listMemberBusinessCenterWalletSummary,
} from '../controllers/member-business-center.controller.js';
import { requireMemberAuthSession } from '../middleware/member-auth.middleware.js';

const router = Router();

router.get('/business-centers', requireMemberAuthSession, listMemberBusinessCenters);
router.get('/business-centers/earnings', requireMemberAuthSession, listMemberBusinessCenterEarnings);
router.get('/business-centers/wallet-summary', requireMemberAuthSession, listMemberBusinessCenterWalletSummary);
router.post('/business-centers/progress', requireMemberAuthSession, syncMemberBusinessCenterProgress);
router.post('/business-centers/activate', requireMemberAuthSession, activateMemberBusinessCenter);

export default router;
