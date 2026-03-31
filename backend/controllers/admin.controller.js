import {
  resetAllMockData,
  forceServerCutoff,
  getForceServerCutoffHistory,
} from '../services/admin.service.js';

export async function postResetAllData(req, res) {
  try {
    const result = await resetAllMockData(req.body || {});
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to flush admin mock data.',
    });
  }
}

export async function postForceServerCutoff(req, res) {
  try {
    const result = await forceServerCutoff(req.body || {});
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error('postForceServerCutoff failed:', error?.stack || error?.message || error);
    return res.status(500).json({
      error: 'Unable to force server cut-off right now.',
    });
  }
}

export async function listForceServerCutoffHistory(req, res) {
  try {
    const result = await getForceServerCutoffHistory(req.query || {});
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error('listForceServerCutoffHistory failed:', error?.stack || error?.message || error);
    return res.status(500).json({
      error: 'Unable to load force server cut-off history.',
    });
  }
}
