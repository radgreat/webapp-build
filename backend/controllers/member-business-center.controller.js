import {
  listBusinessCentersForMember,
  syncBusinessCenterProgressForMember,
  activateBusinessCenterForMember,
} from '../services/member-business-center.service.js';

export async function listMemberBusinessCenters(req, res) {
  try {
    const result = await listBusinessCentersForMember(req.authenticatedMember || {});

    if (!result.success) {
      return res.status(result.status).json({
        error: result.error,
        ...(result.data ? result.data : {}),
      });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to load Business Center status.',
    });
  }
}

export async function syncMemberBusinessCenterProgress(req, res) {
  try {
    const result = await syncBusinessCenterProgressForMember(
      req.authenticatedMember || {},
      req.body || {},
    );

    if (!result.success) {
      return res.status(result.status).json({
        error: result.error,
        ...(result.data ? result.data : {}),
      });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to sync Business Center progress.',
    });
  }
}

export async function activateMemberBusinessCenter(req, res) {
  try {
    const result = await activateBusinessCenterForMember(
      req.authenticatedMember || {},
      req.body || {},
    );

    if (!result.success) {
      return res.status(result.status).json({
        error: result.error,
        ...(result.data ? result.data : {}),
      });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to activate Business Center.',
    });
  }
}
