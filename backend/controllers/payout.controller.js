import {
  getPayoutRequests,
  createPayoutRequest,
  getAdminPayoutRequests,
  updateAdminPayoutRequestStatus,
  fulfillAdminPayoutRequest,
} from '../services/payout.service.js';

export async function listPayoutRequests(req, res) {
  try {
    const authenticatedMember = req.authenticatedMember && typeof req.authenticatedMember === 'object'
      ? req.authenticatedMember
      : {};
    const query = {
      ...(req.query || {}),
      userId: String(authenticatedMember.id || '').trim() || String(req.query?.userId || '').trim(),
      username: String(authenticatedMember.username || '').trim() || String(req.query?.username || '').trim(),
      email: String(authenticatedMember.email || '').trim() || String(req.query?.email || '').trim(),
    };
    const result = await getPayoutRequests(query);

    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to load payout requests.',
    });
  }
}

export async function postPayoutRequest(req, res) {
  try {
    const authenticatedMember = req.authenticatedMember && typeof req.authenticatedMember === 'object'
      ? req.authenticatedMember
      : {};
    const payload = {
      ...(req.body || {}),
      userId: String(authenticatedMember.id || '').trim() || String(req.body?.userId || '').trim(),
      username: String(authenticatedMember.username || '').trim() || String(req.body?.username || '').trim(),
      email: String(authenticatedMember.email || '').trim() || String(req.body?.email || '').trim(),
      requestedByName: String(req.body?.requestedByName || authenticatedMember.name || authenticatedMember.username || '').trim(),
    };
    const result = await createPayoutRequest(payload);

    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to create payout request.',
    });
  }
}

export async function listAdminPayoutRequests(req, res) {
  try {
    const result = await getAdminPayoutRequests();
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to load payout requests.',
    });
  }
}

export async function postAdminPayoutRequestStatus(req, res) {
  try {
    const result = await updateAdminPayoutRequestStatus(req.body || {});

    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to update payout request status.',
    });
  }
}

export async function postAdminPayoutRequestFulfill(req, res) {
  try {
    const result = await fulfillAdminPayoutRequest({
      ...(req.body || {}),
      mode: req?.params?.mode || '',
    });

    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to fulfill payout request.',
    });
  }
}
