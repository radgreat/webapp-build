import { Router } from 'express';

import { requireMemberAuthSession } from '../middleware/member-auth.middleware.js';
import {
  getPreferredRegisterRedirectController,
  getPreferredAttributionClaimController,
  getMemberPreferredAttributionLinkController,
} from '../controllers/preferred-attribution.controller.js';

const router = Router();

router.get('/go/preferred-register', getPreferredRegisterRedirectController);
router.get('/api/preferred/claim', getPreferredAttributionClaimController);
router.get(
  '/api/member-auth/preferred/attribution-link',
  requireMemberAuthSession,
  getMemberPreferredAttributionLinkController,
);

export default router;
