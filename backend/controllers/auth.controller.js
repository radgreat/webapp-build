import {
  authenticateUser,
  validatePasswordSetupToken,
  updatePasswordFromSetupToken,
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
