import {
  getPayoutRequests,
  createPayoutRequest,
  getAdminPayoutRequests,
  updateAdminPayoutRequestStatus,
  fulfillAdminPayoutRequest,
} from '../services/payout.service.js';

export async function listPayoutRequests(req, res) {
  try {
    const result = await getPayoutRequests(req.query || {});

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
    const result = await createPayoutRequest(req.body || {});

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
    const result = await fulfillAdminPayoutRequest(req.body || {});

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