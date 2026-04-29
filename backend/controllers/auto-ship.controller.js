import {
  cancelMemberAutoShip,
  createMemberAutoShipCheckoutSession,
  getMemberAutoShipStatus,
  updateMemberAutoShipProduct,
} from '../services/auto-ship.service.js';

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

export async function getAutoShipStatus(req, res) {
  try {
    const result = await getMemberAutoShipStatus(req.authenticatedMember || {});
    if (!result.success) {
      return res.status(result.status).json({
        error: result.error || 'Unable to load Auto Ship status.',
      });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to load Auto Ship status.',
    });
  }
}

export async function postAutoShipCheckoutSession(req, res) {
  try {
    const result = await createMemberAutoShipCheckoutSession(
      req.authenticatedMember || {},
      req.body || {},
      {
        origin: resolveRequestOrigin(req),
      },
    );

    if (!result.success) {
      return res.status(result.status).json({
        error: result.error || 'Unable to start Auto Ship checkout.',
        ...(result.data ? result.data : {}),
      });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to start Auto Ship checkout.',
    });
  }
}

export async function postAutoShipCancel(req, res) {
  try {
    const result = await cancelMemberAutoShip(
      req.authenticatedMember || {},
      req.body || {},
    );

    if (!result.success) {
      return res.status(result.status).json({
        error: result.error || 'Unable to cancel Auto Ship.',
        ...(result.data ? result.data : {}),
      });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to cancel Auto Ship.',
    });
  }
}

export async function postAutoShipChangeProduct(req, res) {
  try {
    const result = await updateMemberAutoShipProduct(
      req.authenticatedMember || {},
      req.body || {},
    );

    if (!result.success) {
      return res.status(result.status).json({
        error: result.error || 'Unable to change Auto Ship product.',
        ...(result.data ? result.data : {}),
      });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to change Auto Ship product.',
    });
  }
}
