import {
  resolveStripeClient,
  resolveStripeWebhookSecret,
} from '../services/stripe-client.service.js';
import { handleStripeWebhookEvent } from '../services/stripe-webhook.service.js';

function normalizeText(value) {
  return String(value || '').trim();
}

export async function postStripeWebhook(req, res) {
  let stripe = null;
  try {
    stripe = resolveStripeClient();
  } catch (error) {
    return res.status(503).json({
      error: error instanceof Error ? error.message : 'Stripe is unavailable.',
    });
  }

  const webhookSecret = resolveStripeWebhookSecret();
  if (!webhookSecret) {
    return res.status(503).json({
      error: 'Stripe webhook secret is not configured. Set STRIPE_WEBHOOK_SECRET.',
    });
  }

  const signatureHeader = normalizeText(req.get('stripe-signature'));
  if (!signatureHeader) {
    return res.status(400).json({
      error: 'Missing Stripe signature header.',
    });
  }

  const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || '');
  let event = null;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signatureHeader, webhookSecret);
  } catch (error) {
    return res.status(400).json({
      error: `Webhook signature verification failed: ${error instanceof Error ? error.message : 'Invalid payload.'}`,
    });
  }

  try {
    await handleStripeWebhookEvent(event);
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('stripe webhook handling failed:', error?.stack || error?.message || error);
    return res.status(500).json({
      error: 'Stripe webhook handling failed.',
    });
  }
}
