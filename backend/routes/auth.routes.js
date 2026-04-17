import { Router } from 'express';
import {
  loginMember,
  getMemberSession,
  getSetupPassword,
  postSetupPassword,
  getMemberEmailVerificationStatus,
  getMemberBinaryTreeLaunchState,
  getMemberBinaryTreePinnedNodes,
  putMemberBinaryTreePinnedNodes,
  getMemberBinaryTreeTierSortDirections,
  putMemberBinaryTreeTierSortDirections,
  deleteMemberBinaryTreeLaunchState,
  postMemberBinaryTreeLaunchStateReset,
  postMemberEmailVerificationRequest,
  getVerifyMemberEmail,
} from '../controllers/auth.controller.js';
import { requireMemberAuthSession } from '../middleware/member-auth.middleware.js';

const router = Router();

router.post('/login', loginMember);
router.get('/session', requireMemberAuthSession, getMemberSession);
router.get('/setup-password', getSetupPassword);
router.post('/setup-password', postSetupPassword);
router.get('/email-verification-status', requireMemberAuthSession, getMemberEmailVerificationStatus);
router.get('/binary-tree-next/launch-state', requireMemberAuthSession, getMemberBinaryTreeLaunchState);
router.get('/binary-tree-next/pinned-nodes', requireMemberAuthSession, getMemberBinaryTreePinnedNodes);
router.put('/binary-tree-next/pinned-nodes', requireMemberAuthSession, putMemberBinaryTreePinnedNodes);
router.get('/binary-tree-next/tier-sort-directions', requireMemberAuthSession, getMemberBinaryTreeTierSortDirections);
router.put('/binary-tree-next/tier-sort-directions', requireMemberAuthSession, putMemberBinaryTreeTierSortDirections);
router.delete('/binary-tree-next/launch-state', requireMemberAuthSession, deleteMemberBinaryTreeLaunchState);
router.post('/binary-tree-next/launch-state/reset', requireMemberAuthSession, postMemberBinaryTreeLaunchStateReset);
router.post('/email-verification/request', requireMemberAuthSession, postMemberEmailVerificationRequest);
router.get('/verify-email', getVerifyMemberEmail);

export default router;
