import { Router } from 'express';
import {
  listRuntimeSettings,
  postAdminRuntimeSettings,
} from '../controllers/runtime.controller.js';

const router = Router();

router.get('/runtime-settings', listRuntimeSettings);
router.get('/admin/runtime-settings', listRuntimeSettings);
router.post('/admin/runtime-settings', postAdminRuntimeSettings);

export default router;
