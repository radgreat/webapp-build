import { Router } from 'express';
import { listMockEmailOutbox } from '../controllers/email.controller.js';

const router = Router();

router.get('/mock-email-outbox', listMockEmailOutbox);

export default router;