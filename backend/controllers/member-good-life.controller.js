import {
  listGoodLifeMonthlyForMember,
  claimGoodLifeMonthlyForMember,
} from '../services/member-good-life.service.js';

export async function getMemberGoodLifeMonthlyStatus(req, res) {
  try {
    const result = await listGoodLifeMonthlyForMember(req.authenticatedMember || {});
    if (!result.success) {
      return res.status(result.status).json({
        error: result.error,
      });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to load Good Life monthly status.',
    });
  }
}

export async function claimMemberGoodLifeMonthlyReward(req, res) {
  try {
    const result = await claimGoodLifeMonthlyForMember(req.authenticatedMember || {});
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
      error: 'Unable to claim Good Life monthly reward.',
    });
  }
}
