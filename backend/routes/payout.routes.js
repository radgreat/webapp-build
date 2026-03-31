import { Router } from 'express';
import {
  listPayoutRequests,
  postPayoutRequest,
  listAdminPayoutRequests,
  postAdminPayoutRequestStatus,
  postAdminPayoutRequestFulfill,
} from '../controllers/payout.controller.js';

const router = Router();

router.get('/payout-requests', listPayoutRequests);
router.post('/payout-requests', postPayoutRequest);
router.get('/admin/payout-requests', listAdminPayoutRequests);
router.post('/admin/payout-requests/status', postAdminPayoutRequestStatus);
router.post('/admin/payout-requests/fulfill', postAdminPayoutRequestFulfill);

export default router;