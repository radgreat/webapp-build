import { createHash, randomUUID } from 'crypto';
import { findUserById } from '../stores/user.store.js';
import {
  insertMemberAuthSession,
  readActiveMemberAuthSessionByTokenHash,
  touchMemberAuthSessionById,
  revokeMemberAuthSessionById,
} from '../stores/member-auth-session.store.js';

const MEMBER_AUTH_SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function normalizeText(value) {
  return String(value || '').trim();
}

function hashAuthToken(token) {
  return createHash('sha256').update(String(token || '')).digest('hex');
}

function issueRawAuthToken() {
  return `${randomUUID().replace(/-/g, '')}${randomUUID().replace(/-/g, '')}`;
}

function buildSessionId() {
  return `mas_${Date.now()}_${randomUUID().slice(0, 8)}`;
}

export async function issueMemberAuthSessionForUser(userInput = {}) {
  const userId = normalizeText(userInput?.id);
  if (!userId) {
    return {
      success: false,
      status: 400,
      error: 'Unable to issue auth session without a valid member user id.',
    };
  }

  const rawAuthToken = issueRawAuthToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + MEMBER_AUTH_SESSION_TTL_MS).toISOString();
  const sessionRecord = await insertMemberAuthSession({
    sessionId: buildSessionId(),
    userId,
    sessionTokenHash: hashAuthToken(rawAuthToken),
    issuedAt: now.toISOString(),
    expiresAt,
  });

  if (!sessionRecord) {
    return {
      success: false,
      status: 500,
      error: 'Unable to persist member auth session.',
    };
  }

  return {
    success: true,
    status: 200,
    authToken: rawAuthToken,
    authTokenExpiresAt: expiresAt,
    session: sessionRecord,
  };
}

export async function resolveMemberAuthSessionFromToken(rawTokenInput) {
  const rawToken = normalizeText(rawTokenInput);
  if (!rawToken) {
    return {
      success: false,
      status: 401,
      error: 'Missing member auth token.',
    };
  }

  const tokenHash = hashAuthToken(rawToken);
  const sessionRecord = await readActiveMemberAuthSessionByTokenHash(tokenHash);
  if (!sessionRecord) {
    return {
      success: false,
      status: 401,
      error: 'Session is invalid, expired, or revoked. Please sign in again.',
    };
  }

  const memberUser = await findUserById(sessionRecord.userId);
  if (!memberUser) {
    await revokeMemberAuthSessionById(sessionRecord.sessionId).catch(() => {});
    return {
      success: false,
      status: 401,
      error: 'Session is no longer valid for this account.',
    };
  }

  const touchedSession = await touchMemberAuthSessionById(sessionRecord.sessionId).catch(() => null);

  return {
    success: true,
    status: 200,
    session: touchedSession || sessionRecord,
    user: memberUser,
  };
}
