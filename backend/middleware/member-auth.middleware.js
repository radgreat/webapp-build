import { resolveMemberAuthSessionFromToken } from '../services/member-auth-session.service.js';

function extractBearerTokenFromHeader(authorizationHeader) {
  const value = String(authorizationHeader || '').trim();
  if (!value) {
    return '';
  }

  const match = value.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return '';
  }

  return String(match[1] || '').trim();
}

export async function requireMemberAuthSession(req, res, next) {
  try {
    const token = extractBearerTokenFromHeader(req.headers?.authorization);
    if (!token) {
      return res.status(401).json({
        error: 'Authorization bearer token is required.',
        code: 'AUTH_REQUIRED',
      });
    }

    const sessionResult = await resolveMemberAuthSessionFromToken(token);
    if (!sessionResult.success) {
      return res.status(sessionResult.status).json({
        error: sessionResult.error,
        code: 'AUTH_INVALID',
      });
    }

    req.authenticatedMember = sessionResult.user;
    req.authSession = sessionResult.session;
    return next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to validate member auth session.',
    });
  }
}
