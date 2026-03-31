import { Router } from 'express';
import {
  listServerCutoffEvents,
  listMemberServerCutoffMetrics,
} from '../controllers/cutoff.controller.js';

const router = Router();

router.get('/server-cutoff-events', listServerCutoffEvents);
router.get('/member/server-cutoff-metrics', listMemberServerCutoffMetrics);

export default router;