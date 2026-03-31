import {
  getEWalletOverview,
  getEWalletCommissionOffsets,
  createEWalletPeerTransfer,
  createEWalletCommissionTransfer,
  createEWalletPayoutRequest,
} from '../services/wallet.service.js';

export async function listEWalletOverview(req, res) {
  try {
    const result = await getEWalletOverview(req.query || {});

    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to load E-Wallet details.',
    });
  }
}

export async function postEWalletPeerTransfer(req, res) {
  try {
    const result = await createEWalletPeerTransfer(req.body || {});

    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to process E-Wallet peer transfer.',
    });
  }
}

export async function listEWalletCommissionOffsets(req, res) {
  try {
    const result = await getEWalletCommissionOffsets(req.query || {});

    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to load E-Wallet commission offsets.',
    });
  }
}

export async function postEWalletCommissionTransfer(req, res) {
  try {
    const result = await createEWalletCommissionTransfer(req.body || {});

    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to transfer commission to E-Wallet.',
    });
  }
}

export async function postEWalletPayoutRequest(req, res) {
  try {
    const result = await createEWalletPayoutRequest(req.body || {});

    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to request E-Wallet payout.',
    });
  }
}
