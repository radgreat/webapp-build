import { Router } from 'express';
import { requireMemberAuthSession } from '../middleware/member-auth.middleware.js';
import {
  getAutoShipStatus,
  postAutoShipCancel,
  postAutoShipChangeProduct,
  postAutoShipCheckoutSession,
} from '../controllers/auto-ship.controller.js';

const router = Router();

router.get('/autoship', requireMemberAuthSession, getAutoShipStatus);
router.post('/autoship/checkout-session', requireMemberAuthSession, postAutoShipCheckoutSession);
router.post('/autoship/cancel', requireMemberAuthSession, postAutoShipCancel);
router.post('/autoship/change-product', requireMemberAuthSession, postAutoShipChangeProduct);

export default router;
