import { Router } from 'express';
import {
  loginMember,
  getSetupPassword,
  postSetupPassword,
  getMemberEmailVerificationStatus,
  postMemberEmailVerificationRequest,
  getVerifyMemberEmail,
} from '../controllers/auth.controller.js';
import { requireMemberAuthSession } from '../middleware/member-auth.middleware.js';

const router = Router();

router.post('/login', loginMember);
router.get('/setup-password', getSetupPassword);
router.post('/setup-password', postSetupPassword);
router.get('/email-verification-status', requireMemberAuthSession, getMemberEmailVerificationStatus);
router.post('/email-verification/request', requireMemberAuthSession, postMemberEmailVerificationRequest);
router.get('/verify-email', getVerifyMemberEmail);

export default router;
