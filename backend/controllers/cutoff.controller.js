import {
  getServerCutoffEvents,
  getMemberServerCutoffMetrics,
} from '../services/cutoff.service.js';

export async function listServerCutoffEvents(req, res) {
  try {
    const result = await getServerCutoffEvents();
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to load server cut-off events.',
    });
  }
}

export async function listMemberServerCutoffMetrics(req, res) {
  try {
    const result = await getMemberServerCutoffMetrics(req.query || {});

    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to load member server cut-off metrics.',
    });
  }
}