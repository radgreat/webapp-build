import {
  getCommissionContainers,
  saveCommissionContainers,
} from '../services/commission-container.service.js';

export async function listCommissionContainers(req, res) {
  try {
    const result = await getCommissionContainers(req.query || {});
    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to load commission containers.',
    });
  }
}

export async function postCommissionContainers(req, res) {
  try {
    const result = await saveCommissionContainers(req.body || {});
    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to save commission containers.',
    });
  }
}
