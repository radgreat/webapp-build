import { Router } from 'express';
import {
  listRegisteredMembers,
  registerMember,
  postRegisteredMemberPaymentIntent,
  postCompleteRegisteredMemberPaymentIntent,
  patchRegisteredMemberPlacement,
  listMemberRanks,
  postRecordMemberPurchase,
  postUpgradeMemberAccount,
} from '../controllers/member.controller.js';

const router = Router();

router.get('/registered-members', listRegisteredMembers);
router.post('/registered-members', registerMember);
router.post('/registered-members/intent', postRegisteredMemberPaymentIntent);
router.post('/registered-members/intent/complete', postCompleteRegisteredMemberPaymentIntent);
router.patch('/registered-members/:memberId/placement', patchRegisteredMemberPlacement);
router.get('/admin/registered-members', listRegisteredMembers);
router.post('/admin/registered-members', registerMember);
router.post('/admin/registered-members/intent', postRegisteredMemberPaymentIntent);
router.post('/admin/registered-members/intent/complete', postCompleteRegisteredMemberPaymentIntent);
router.patch('/admin/registered-members/:memberId/placement', patchRegisteredMemberPlacement);
router.get('/member-ranks', listMemberRanks);
router.post('/member-auth/record-purchase', postRecordMemberPurchase);
router.post('/member-auth/upgrade-account', postUpgradeMemberAccount);

export default router;
