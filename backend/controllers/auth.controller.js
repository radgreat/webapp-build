import {
  authenticateUser,
  resolveAuthenticatedMemberSession,
  validatePasswordSetupToken,
  updatePasswordFromSetupToken,
  resolveMemberEmailVerificationStatus,
  resolveMemberBinaryTreeLaunchState,
  updateMemberBinaryTreePinnedNodes,
  resolveMemberBinaryTreePinnedNodes,
  updateMemberBinaryTreeTierSortDirections,
  resolveMemberBinaryTreeTierSortDirections,
  resetMemberBinaryTreeLaunchState,
  requestMemberEmailVerification,
  verifyMemberEmailByToken,
} from '../services/auth.service.js';
import { issueMemberAuthSessionForUser } from '../services/member-auth-session.service.js';

export async function loginMember(req, res) {
  try {
    const { identifier, password } = req.body || {};

    if (!String(identifier || '').trim() || !String(password || '')) {
      return res.status(400).json({
        error: 'Username/email and password are required.',
      });
    }

    const result = await authenticateUser(identifier, password);

    if (result.code === 'INVALID_CREDENTIALS') {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    if (result.code === 'PASSWORD_SETUP_REQUIRED') {
      return res.status(403).json({
        error: 'Password setup required. Check your email for your setup link.',
        code: 'PASSWORD_SETUP_REQUIRED',
        setupLink: result.setupLink || '',
      });
    }

    const sessionResult = await issueMemberAuthSessionForUser(result.user);
    if (!sessionResult.success) {
      return res.status(sessionResult.status).json({
        error: sessionResult.error || 'Unable to establish member auth session.',
      });
    }

    return res.status(200).json({
      user: {
        ...result.user,
        authToken: sessionResult.authToken,
        authTokenExpiresAt: sessionResult.authTokenExpiresAt,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to process login.',
    });
  }
}

export async function getSetupPassword(req, res) {
  try {
    const { token, email } = req.query;
    const result = await validatePasswordSetupToken(token, email);

    if (!result.valid) {
      return res.status(result.status).json({
        error: result.error,
        setupLink: result.setupLink || '',
      });
    }

    return res.status(200).json(result.payload);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to validate setup link.',
    });
  }
}

export async function postSetupPassword(req, res) {
  try {
    const { token, newPassword, confirmPassword } = req.body || {};

    const result = await updatePasswordFromSetupToken(
      token,
      newPassword,
      confirmPassword
    );

    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to set password.',
    });
  }
}

export async function getMemberEmailVerificationStatus(req, res) {
  try {
    const result = await resolveMemberEmailVerificationStatus(req.authenticatedMember || {});
    if (!result.success) {
      return res.status(result.status).json({
        error: result.error || 'Unable to resolve email verification status.',
      });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to load email verification status.',
    });
  }
}

export async function getMemberBinaryTreeLaunchState(req, res) {
  try {
    const result = await resolveMemberBinaryTreeLaunchState(req.authenticatedMember || {});
    if (!result.success) {
      return res.status(result.status).json({
        error: result.error || 'Unable to resolve Binary Tree launch state.',
      });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to load Binary Tree launch state.',
    });
  }
}

export async function getMemberSession(req, res) {
  try {
    const result = await resolveAuthenticatedMemberSession(req.authenticatedMember || {});
    if (!result.success) {
      return res.status(result.status).json({
        error: result.error || 'Unable to resolve member auth session.',
      });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to load authenticated member session.',
    });
  }
}

export async function putMemberBinaryTreePinnedNodes(req, res) {
  try {
    const result = await updateMemberBinaryTreePinnedNodes(
      req.authenticatedMember || {},
      req.body || {},
    );
    if (!result.success) {
      return res.status(result.status).json({
        error: result.error || 'Unable to update Binary Tree pinned nodes.',
      });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to update Binary Tree pinned nodes.',
    });
  }
}

export async function getMemberBinaryTreePinnedNodes(req, res) {
  try {
    const result = await resolveMemberBinaryTreePinnedNodes(req.authenticatedMember || {});
    if (!result.success) {
      return res.status(result.status).json({
        error: result.error || 'Unable to load Binary Tree pinned nodes.',
      });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to load Binary Tree pinned nodes.',
    });
  }
}

export async function putMemberBinaryTreeTierSortDirections(req, res) {
  try {
    const result = await updateMemberBinaryTreeTierSortDirections(
      req.authenticatedMember || {},
      req.body || {},
    );
    if (!result.success) {
      return res.status(result.status).json({
        error: result.error || 'Unable to update Binary Tree tier sort directions.',
      });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to update Binary Tree tier sort directions.',
    });
  }
}

export async function getMemberBinaryTreeTierSortDirections(req, res) {
  try {
    const result = await resolveMemberBinaryTreeTierSortDirections(req.authenticatedMember || {});
    if (!result.success) {
      return res.status(result.status).json({
        error: result.error || 'Unable to load Binary Tree tier sort directions.',
      });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to load Binary Tree tier sort directions.',
    });
  }
}

export async function deleteMemberBinaryTreeLaunchState(req, res) {
  try {
    const result = await resetMemberBinaryTreeLaunchState(req.authenticatedMember || {});
    if (!result.success) {
      return res.status(result.status).json({
        error: result.error || 'Unable to reset Binary Tree launch state.',
      });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to reset Binary Tree launch state.',
    });
  }
}

export async function postMemberBinaryTreeLaunchStateReset(req, res) {
  return deleteMemberBinaryTreeLaunchState(req, res);
}

export async function postMemberEmailVerificationRequest(req, res) {
  try {
    const nextEmail = req.body?.email;
    const result = await requestMemberEmailVerification(req.authenticatedMember || {}, nextEmail);
    if (!result.success) {
      return res.status(result.status).json({
        error: result.error || 'Unable to request email verification.',
      });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to request email verification.',
    });
  }
}

export async function getVerifyMemberEmail(req, res) {
  try {
    const result = await verifyMemberEmailByToken(req.query?.token);
    if (!result.success) {
      return res.status(result.status).json({
        error: result.error || 'Unable to verify email token.',
      });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to verify email token.',
    });
  }
}
