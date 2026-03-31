import {
  getBinaryTreeMetrics,
  saveBinaryTreeMetrics,
  getSalesTeamCommissions,
  saveSalesTeamCommissions,
} from '../services/metrics.service.js';

export async function listBinaryTreeMetrics(req, res) {
  try {
    const result = await getBinaryTreeMetrics(req.query || {});
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to load binary tree metrics.',
    });
  }
}

export async function postBinaryTreeMetrics(req, res) {
  try {
    const result = await saveBinaryTreeMetrics(req.body || {});

    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to save binary tree metrics.',
    });
  }
}

export async function listSalesTeamCommissions(req, res) {
  try {
    const result = await getSalesTeamCommissions(req.query || {});
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to load sales team commissions.',
    });
  }
}

export async function postSalesTeamCommissions(req, res) {
  try {
    const result = await saveSalesTeamCommissions(req.body || {});

    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to save sales team commissions.',
    });
  }
}