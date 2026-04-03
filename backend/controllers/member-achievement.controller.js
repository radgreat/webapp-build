import {
  listProfileAchievementsForMember,
  claimProfileAchievementForMember,
} from '../services/member-achievement.service.js';

export async function listMemberProfileAchievements(req, res) {
  try {
    const result = await listProfileAchievementsForMember(req.authenticatedMember || {});

    if (!result.success) {
      return res.status(result.status).json({
        error: result.error,
      });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to load member achievements.',
    });
  }
}

export async function claimMemberProfileAchievement(req, res) {
  try {
    const result = await claimProfileAchievementForMember(
      req.authenticatedMember || {},
      req.params?.achievementId,
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
      error: 'Unable to claim member achievement.',
    });
  }
}
