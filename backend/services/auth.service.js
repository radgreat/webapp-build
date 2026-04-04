import { createHash, randomUUID } from 'crypto';

import {
  findUserByIdentifier,
  findUserById,
  updateUserById,
  readUserEmailVerificationStatusById,
  updateUserEmailAddressById,
  updateUserEmailVerificationStateById,
} from '../stores/user.store.js';

import {
  readPasswordSetupTokensStore,
  writePasswordSetupTokensStore,
  markAllOpenTokensUsedByUserId,
} from '../stores/token.store.js';
import {
  ensureEmailVerificationSchema,
  revokeOpenEmailVerificationTokensByUserId,
  createEmailVerificationTokenRecord,
  readEmailVerificationTokenByHash,
  readActiveEmailVerificationTokenByHash,
  markEmailVerificationTokenUsedById,
} from '../stores/email-verification.store.js';
import {
  readMockEmailOutboxStore,
  writeMockEmailOutboxStore,
} from '../stores/email.store.js';

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

const EMAIL_VERIFICATION_TOKEN_TTL_MS = 48 * 60 * 60 * 1000;

function isValidEmailAddress(emailInput) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(emailInput || '').trim());
}

function hashEmailVerificationToken(rawTokenInput) {
  return createHash('sha256').update(String(rawTokenInput || '')).digest('hex');
}

function issueRawEmailVerificationToken() {
  return `${randomUUID().replace(/-/g, '')}${randomUUID().replace(/-/g, '')}`;
}

function buildEmailVerificationLink(rawTokenInput) {
  const token = normalizeText(rawTokenInput);
  if (!token) {
    return '';
  }

  const verifyUrl = new URL('/api/member-auth/verify-email', 'http://localhost');
  verifyUrl.searchParams.set('token', token);
  return `${verifyUrl.pathname}${verifyUrl.search}`;
}

function normalizeEmailAddress(value) {
  return normalizeCredential(value || '');
}

function isEmailVerificationOutboxRecord(record = {}, targetEmailInput = '') {
  const targetEmail = normalizeEmailAddress(targetEmailInput);
  if (!targetEmail) {
    return false;
  }

  const recipientEmail = normalizeEmailAddress(record?.to);
  if (recipientEmail !== targetEmail) {
    return false;
  }

  const subject = normalizeText(record?.subject).toLowerCase();
  const link = normalizeText(record?.setupLink);
  return subject.includes('verify your charge account email')
    && link.startsWith('/api/member-auth/verify-email?token=');
}

async function resolveLatestMockEmailVerificationLinkForEmail(emailInput) {
  const targetEmail = normalizeEmailAddress(emailInput);
  if (!targetEmail) {
    return '';
  }

  const outbox = await readMockEmailOutboxStore();
  for (const record of outbox) {
    if (!isEmailVerificationOutboxRecord(record, targetEmail)) {
      continue;
    }

    const setupLink = normalizeText(record?.setupLink);
    if (!setupLink) {
      continue;
    }

    let token = '';
    try {
      const parsedUrl = new URL(setupLink, 'http://localhost');
      token = normalizeText(parsedUrl.searchParams.get('token'));
    } catch {
      token = '';
    }

    if (!token) {
      continue;
    }

    const activeTokenRecord = await readActiveEmailVerificationTokenByHash(hashEmailVerificationToken(token));
    if (!activeTokenRecord) {
      continue;
    }

    if (normalizeEmailAddress(activeTokenRecord.email) !== targetEmail) {
      continue;
    }

    return setupLink;
  }

  return '';
}

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

export async function resolveMemberEmailVerificationStatus(memberUserInput = {}) {
  const userId = normalizeText(memberUserInput?.id);
  if (!userId) {
    return {
      success: false,
      status: 400,
      error: 'Missing authenticated member id.',
    };
  }

  await ensureEmailVerificationSchema();
  const verificationStatus = await readUserEmailVerificationStatusById(userId);
  if (!verificationStatus) {
    return {
      success: false,
      status: 404,
      error: 'Member account was not found for verification status.',
    };
  }

  const normalizedEmail = normalizeEmailAddress(memberUserInput?.email);
  const verificationLink = verificationStatus.verified === true
    ? ''
    : await resolveLatestMockEmailVerificationLinkForEmail(normalizedEmail);

  return {
    success: true,
    status: 200,
    data: {
      authenticated: true,
      userId,
      email: normalizedEmail,
      verified: verificationStatus.verified === true,
      verifiedAt: normalizeText(verificationStatus.verifiedAt),
      verificationSupported: verificationStatus.supported === true,
      verificationSource: normalizeText(verificationStatus.source),
      verificationLink,
      verificationLinkSource: verificationLink ? 'mock-email-outbox' : '',
      checkedAt: new Date().toISOString(),
    },
  };
}

export async function requestMemberEmailVerification(memberUserInput = {}, emailInput = '') {
  const userId = normalizeText(memberUserInput?.id);
  if (!userId) {
    return {
      success: false,
      status: 400,
      error: 'Missing authenticated member id.',
    };
  }

  await ensureEmailVerificationSchema();

  const matchedUser = await findUserById(userId);
  if (!matchedUser) {
    return {
      success: false,
      status: 404,
      error: 'Member account was not found for verification request.',
    };
  }

  const requestedEmail = normalizeCredential(emailInput || matchedUser.email);
  if (!requestedEmail || !isValidEmailAddress(requestedEmail)) {
    return {
      success: false,
      status: 400,
      error: 'A valid email is required to request verification.',
    };
  }

  const verificationStatus = await readUserEmailVerificationStatusById(userId);
  const isAlreadyVerified = verificationStatus?.supported === true
    && verificationStatus?.verified === true
    && normalizeCredential(matchedUser.email) === requestedEmail;

  if (isAlreadyVerified) {
    return {
      success: true,
      status: 200,
      data: {
        email: requestedEmail,
        verified: true,
        verifiedAt: normalizeText(verificationStatus?.verifiedAt),
        verificationRequested: false,
        alreadyVerified: true,
        verificationSupported: verificationStatus?.supported === true,
        verificationSource: normalizeText(verificationStatus?.source),
      },
    };
  }

  const nowIso = new Date().toISOString();
  await updateUserEmailAddressById(userId, requestedEmail, {
    emailVerified: false,
    verifiedAt: null,
  });
  await updateUserEmailVerificationStateById(userId, {
    emailVerified: false,
    verifiedAt: null,
  });

  await revokeOpenEmailVerificationTokensByUserId(userId);

  const rawToken = issueRawEmailVerificationToken();
  const tokenHash = hashEmailVerificationToken(rawToken);
  const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_TTL_MS).toISOString();
  const tokenRecord = await createEmailVerificationTokenRecord({
    tokenId: `evt_${Date.now()}_${randomUUID().slice(0, 8)}`,
    userId,
    email: requestedEmail,
    tokenHash,
    createdAt: nowIso,
    expiresAt,
  });

  if (!tokenRecord) {
    return {
      success: false,
      status: 500,
      error: 'Unable to create email verification token.',
    };
  }

  const verificationLink = buildEmailVerificationLink(rawToken);
  const outbox = await readMockEmailOutboxStore();
  outbox.unshift({
    id: `mail_${Date.now()}_${randomUUID().slice(0, 8)}`,
    to: requestedEmail,
    subject: 'Verify your Charge account email',
    body: `Use this verification link to verify your email address: ${verificationLink}`,
    setupLink: verificationLink,
    createdAt: nowIso,
    status: 'queued',
  });
  await writeMockEmailOutboxStore(outbox);

  return {
    success: true,
    status: 200,
    data: {
      email: requestedEmail,
      verified: false,
      verifiedAt: '',
      verificationRequested: true,
      alreadyVerified: false,
      verificationLink,
      verificationTokenExpiresAt: expiresAt,
      verificationDelivery: 'mock-email-outbox',
      checkedAt: nowIso,
    },
  };
}

export async function verifyMemberEmailByToken(tokenInput) {
  const rawToken = normalizeText(tokenInput);
  if (!rawToken) {
    return {
      success: false,
      status: 400,
      error: 'Verification token is required.',
    };
  }

  await ensureEmailVerificationSchema();

  const tokenHash = hashEmailVerificationToken(rawToken);
  const activeTokenRecord = await readActiveEmailVerificationTokenByHash(tokenHash);
  if (!activeTokenRecord) {
    const anyTokenRecord = await readEmailVerificationTokenByHash(tokenHash);
    if (anyTokenRecord?.usedAt) {
      return {
        success: false,
        status: 409,
        error: 'This verification link has already been used.',
      };
    }
    if (anyTokenRecord?.revokedAt) {
      return {
        success: false,
        status: 409,
        error: 'This verification link is no longer active.',
      };
    }
    if (anyTokenRecord?.expiresAt && Date.parse(anyTokenRecord.expiresAt) <= Date.now()) {
      return {
        success: false,
        status: 410,
        error: 'This verification link has expired.',
      };
    }
    return {
      success: false,
      status: 404,
      error: 'Invalid verification token.',
    };
  }

  const matchedUser = await findUserById(activeTokenRecord.userId);
  if (!matchedUser) {
    return {
      success: false,
      status: 404,
      error: 'Member account was not found for this verification token.',
    };
  }

  const currentUserEmail = normalizeCredential(matchedUser.email);
  const tokenEmail = normalizeCredential(activeTokenRecord.email);
  if (!currentUserEmail || currentUserEmail !== tokenEmail) {
    return {
      success: false,
      status: 409,
      error: 'Verification token email does not match current account email.',
    };
  }

  const verifiedAt = new Date().toISOString();
  await updateUserEmailVerificationStateById(activeTokenRecord.userId, {
    emailVerified: true,
    verifiedAt,
  });
  await markEmailVerificationTokenUsedById(activeTokenRecord.tokenId, verifiedAt);

  return {
    success: true,
    status: 200,
    data: {
      verified: true,
      email: tokenEmail,
      verifiedAt,
      message: 'Email verified successfully.',
    },
  };
}
