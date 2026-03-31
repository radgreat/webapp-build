import {
  findUserByIdentifier,
  findUserById,
  updateUserById,
} from '../stores/user.store.js';

import {
  readPasswordSetupTokensStore,
  writePasswordSetupTokensStore,
  markAllOpenTokensUsedByUserId,
} from '../stores/token.store.js';

import {
  normalizeText,
  normalizeCredential,
  isPasswordStrong,
  isSetupTokenExpired,
  issuePasswordSetupToken,
  buildPasswordSetupLink,
  resolveAuthAccountAudience,
  resolveSetupToken,
  sanitizeUserForAuthResponse,
  PASSWORD_MIN_LENGTH,
} from '../utils/auth.helpers.js';

async function ensureOpenSetupLinkForPendingUser(user = {}) {
  const matchedUserId = String(user?.id || '').trim();
  const matchedUserEmail = String(user?.email || '').trim();
  const accountAudience = resolveAuthAccountAudience(user);
  if (!matchedUserId) {
    return '';
  }

  const tokens = await readPasswordSetupTokensStore();
  let openToken = tokens.find((tokenRecord) => {
    if (String(tokenRecord?.userId || '') !== matchedUserId) {
      return false;
    }
    if (tokenRecord?.usedAt) {
      return false;
    }
    return !isSetupTokenExpired(tokenRecord);
  }) || null;

  if (!openToken) {
    openToken = issuePasswordSetupToken(matchedUserId, matchedUserEmail);
    tokens.unshift(openToken);
    await writePasswordSetupTokensStore(tokens);
  }

  return openToken?.token
    ? buildPasswordSetupLink(openToken.token, matchedUserEmail, { audience: accountAudience })
    : '';
}

export async function authenticateUser(identifierInput, passwordInput) {
  const identifier = normalizeCredential(identifierInput);
  const password = String(passwordInput || '');

  const matchedUser = await findUserByIdentifier(identifier);

  if (!matchedUser) {
    return { code: 'INVALID_CREDENTIALS' };
  }

  if (String(matchedUser.password || '') !== password) {
    return { code: 'INVALID_CREDENTIALS' };
  }

  if (matchedUser.passwordSetupRequired) {
    const setupLink = await ensureOpenSetupLinkForPendingUser(matchedUser);

    return {
      code: 'PASSWORD_SETUP_REQUIRED',
      setupLink,
    };
  }

  return {
    code: 'SUCCESS',
    user: sanitizeUserForAuthResponse(matchedUser),
  };
}

export async function validatePasswordSetupToken(tokenInput, emailInput = '') {
  const token = normalizeText(tokenInput);
  const tokens = await readPasswordSetupTokensStore();
  const resolution = resolveSetupToken(tokens, token);

  if (!resolution.record) {
    const normalizedEmail = normalizeCredential(emailInput);
    if (normalizedEmail) {
      const matchedUser = await findUserByIdentifier(normalizedEmail);
      if (matchedUser?.passwordSetupRequired) {
        const setupLink = await ensureOpenSetupLinkForPendingUser(matchedUser);

        return {
          valid: false,
          status: 409,
          error: 'Setup link expired or invalid. A fresh setup link has been generated.',
          setupLink,
        };
      }
    }

    return {
      valid: false,
      status: resolution.status,
      error: resolution.error,
    };
  }

  const matchedUser = await findUserById(resolution.record.userId);

  if (!matchedUser) {
    return {
      valid: false,
      status: 404,
      error: 'Member account was not found for this setup link.',
    };
  }

  return {
    valid: true,
    payload: {
      valid: true,
      accountName: matchedUser.name || matchedUser.username || 'Member',
      username: matchedUser.username || '',
      email: matchedUser.email || resolution.record.email || '',
      accountAudience: resolveAuthAccountAudience(matchedUser),
      expiresAt: resolution.record.expiresAt,
    },
  };
}

export async function updatePasswordFromSetupToken(tokenInput, newPasswordInput, confirmPasswordInput) {
  const token = normalizeText(tokenInput);
  const newPassword = String(newPasswordInput || '');
  const confirmPassword = String(confirmPasswordInput || '');

  if (!token || !newPassword) {
    return {
      success: false,
      status: 400,
      error: 'Token and new password are required.',
    };
  }

  if (confirmPassword && newPassword !== confirmPassword) {
    return {
      success: false,
      status: 400,
      error: 'Password confirmation does not match.',
    };
  }

  if (!isPasswordStrong(newPassword)) {
    return {
      success: false,
      status: 400,
      error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters and include uppercase, lowercase, number, and symbol.`,
    };
  }

  const tokens = await readPasswordSetupTokensStore();
  const resolution = resolveSetupToken(tokens, token);

  if (!resolution.record) {
    return {
      success: false,
      status: resolution.status,
      error: resolution.error,
    };
  }

  const matchedUser = await findUserById(resolution.record.userId);

  if (!matchedUser) {
    return {
      success: false,
      status: 404,
      error: 'Member account was not found for this setup link.',
    };
  }

  const nowIso = new Date().toISOString();

  await updateUserById(matchedUser.id, (existingUser) => ({
    ...existingUser,
    password: newPassword,
    passwordSetupRequired: false,
    accountStatus: 'active',
    passwordUpdatedAt: nowIso,
  }));

  await markAllOpenTokensUsedByUserId(matchedUser.id, nowIso);

  return {
    success: true,
    message: 'Password has been set. You can now sign in.',
  };
}
