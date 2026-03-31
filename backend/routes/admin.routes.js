import { Router } from 'express';
import {
  postResetAllData,
  postForceServerCutoff,
  listForceServerCutoffHistory,
} from '../controllers/admin.controller.js';

const router = Router();

router.post('/admin/reset-all-data', postResetAllData);
router.get('/admin/force-server-cutoff', listForceServerCutoffHistory);
router.post('/admin/force-server-cutoff', postForceServerCutoff);

export default router;
