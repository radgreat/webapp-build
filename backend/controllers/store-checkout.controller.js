import {
  getStoreCheckoutConfig,
  createStoreCheckoutSession,
  completeStoreCheckoutSession,
  createStoreCheckoutPaymentIntent,
  completeStoreCheckoutPaymentIntent,
  registerPreferredCustomerWithoutCheckout,
} from '../services/store-checkout.service.js';

function resolveRequestOrigin(req) {
  const originHeader = String(req.get('origin') || '').trim();
  if (originHeader) {
    return originHeader;
  }

  const host = String(req.get('host') || '').trim();
  if (!host) {
    return '';
  }

  const protocol = req.protocol === 'https' ? 'https' : 'http';
  return `${protocol}://${host}`;
}

function resolveReferrerStoreCode(req) {
  const refererHeader = String(req.get('referer') || '').trim();
  if (!refererHeader) {
    return '';
  }

  const fallbackOrigin = resolveRequestOrigin(req) || 'http://localhost';
  try {
    const parsed = new URL(refererHeader, fallbackOrigin);
    return String(parsed.searchParams.get('store') || '').trim();
  } catch {
    return '';
  }
}

export async function postStoreCheckoutSession(req, res) {
  try {
    const result = await createStoreCheckoutSession(req.body || {}, {
      origin: resolveRequestOrigin(req),
      referrerStoreCode: resolveReferrerStoreCode(req),
    });

    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to create Stripe checkout session.',
    });
  }
}

export function getStoreCheckoutConfigController(req, res) {
  try {
    const result = getStoreCheckoutConfig();
    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    }
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to load Stripe checkout configuration.',
    });
  }
}

export async function postStoreCheckoutPaymentIntent(req, res) {
  try {
    const result = await createStoreCheckoutPaymentIntent(req.body || {}, {
      origin: resolveRequestOrigin(req),
      referrerStoreCode: resolveReferrerStoreCode(req),
    });

    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to create Stripe payment intent.',
    });
  }
}

export async function postPreferredCustomerRegistration(req, res) {
  try {
    const result = await registerPreferredCustomerWithoutCheckout(req.body || {}, {
      origin: resolveRequestOrigin(req),
      referrerStoreCode: resolveReferrerStoreCode(req),
    });

    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to register preferred customer.',
    });
  }
}

export async function postCompleteStoreCheckoutSession(req, res) {
  try {
    const result = await completeStoreCheckoutSession(req.body || {});

    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to finalize Stripe checkout session.',
    });
  }
}

export async function postCompleteStoreCheckoutPaymentIntent(req, res) {
  try {
    const result = await completeStoreCheckoutPaymentIntent(req.body || {});

    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to finalize Stripe payment intent.',
    });
  }
}
