import {
  getRuntimeSettings,
  updateRuntimeSettings,
} from '../services/runtime.service.js';

export async function listRuntimeSettings(req, res) {
  try {
    const result = await getRuntimeSettings();
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to load runtime settings.',
    });
  }
}

export async function postAdminRuntimeSettings(req, res) {
  try {
    const result = await updateRuntimeSettings(req.body || {});

    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to update runtime settings.',
    });
  }
}