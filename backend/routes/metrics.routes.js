import { Router } from 'express';
import {
  listBinaryTreeMetrics,
  postBinaryTreeMetrics,
  listSalesTeamCommissions,
  postSalesTeamCommissions,
} from '../controllers/metrics.controller.js';

const router = Router();

router.get('/binary-tree-metrics', listBinaryTreeMetrics);
router.post('/binary-tree-metrics', postBinaryTreeMetrics);
router.get('/sales-team-commissions', listSalesTeamCommissions);
router.post('/sales-team-commissions', postSalesTeamCommissions);

export default router;