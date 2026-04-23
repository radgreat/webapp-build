import { Router } from 'express';
import {
  listPayoutRequests,
  postPayoutRequest,
  listAdminPayoutRequests,
  postAdminPayoutRequestStatus,
  postAdminPayoutRequestFulfill,
} from '../controllers/payout.controller.js';
import { requireMemberAuthSession } from '../middleware/member-auth.middleware.js';

const router = Router();

router.get('/payout-requests', requireMemberAuthSession, listPayoutRequests);
router.post('/payout-requests', requireMemberAuthSession, postPayoutRequest);
router.get('/admin/payout-requests', listAdminPayoutRequests);
router.post('/admin/payout-requests/status', postAdminPayoutRequestStatus);
router.post('/admin/payout-requests/fulfill', postAdminPayoutRequestFulfill);
router.post('/admin/payout-requests/fulfill/:mode', postAdminPayoutRequestFulfill);

export default router;
