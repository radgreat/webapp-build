import { Router } from 'express';
import {
  loginMember,
  getSetupPassword,
  postSetupPassword,
} from '../controllers/auth.controller.js';

const router = Router();

router.post('/login', loginMember);
router.get('/setup-password', getSetupPassword);
router.post('/setup-password', postSetupPassword);

export default router;