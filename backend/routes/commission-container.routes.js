import { Router } from 'express';
import {
  listCommissionContainers,
  postCommissionContainers,
} from '../controllers/commission-container.controller.js';

const router = Router();

router.get('/commission-containers', listCommissionContainers);
router.post('/commission-containers', postCommissionContainers);

export default router;
