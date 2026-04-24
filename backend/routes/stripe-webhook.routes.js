import express from 'express';
import { postStripeWebhook } from '../controllers/stripe-webhook.controller.js';

const router = express.Router();

router.post(
  '/stripe/webhooks',
  express.raw({ type: 'application/json' }),
  postStripeWebhook,
);

export default router;
