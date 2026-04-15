import {
  createPreferredAttributionRedirectClaim,
  resolvePreferredAttributionClaimSummary,
  createMemberPreferredAttributionLink,
} from '../services/preferred-attribution.service.js';

function normalizeText(value) {
  return String(value || '').trim();
}

function resolveRequestOrigin(req) {
  const originHeader = normalizeText(req.get('origin'));
  if (originHeader) {
    return originHeader;
  }

  const hostHeader = normalizeText(req.get('host'));
  if (!hostHeader) {
    return '';
  }

  const protocol = req.protocol === 'https' ? 'https' : 'http';
  return `${protocol}://${hostHeader}`;
}

function isSecureRequest(req) {
  if (req.secure === true) {
    return true;
  }
  const forwardedProto = normalizeText(req.get('x-forwarded-proto')).toLowerCase();
  if (!forwardedProto) {
    return false;
  }
  return forwardedProto.split(',').map((part) => part.trim()).includes('https');
}

function setPreferredClaimCookie(res, cookiePayload = {}, options = {}) {
  const cookieName = normalizeText(cookiePayload?.name);
  const cookieValue = normalizeText(cookiePayload?.value);
  if (!cookieName || !cookieValue) {
    return;
  }

  const maxAgeMs = Number.isFinite(Number(cookiePayload?.maxAgeMs))
    ? Math.max(60 * 1000, Math.floor(Number(cookiePayload.maxAgeMs)))
    : undefined;

  res.cookie(cookieName, cookieValue, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: options?.secure === true,
    ...(maxAgeMs ? { maxAge: maxAgeMs } : {}),
  });
}

function clearPreferredClaimCookie(res, cookieNameInput, options = {}) {
  const cookieName = normalizeText(cookieNameInput);
  if (!cookieName) {
    return;
  }

  res.clearCookie(cookieName, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: options?.secure === true,
  });
}

export async function getPreferredRegisterRedirectController(req, res) {
  try {
    const result = await createPreferredAttributionRedirectClaim(req.query?.at, {
      ip: req.ip,
      userAgent: normalizeText(req.get('user-agent')),
      origin: resolveRequestOrigin(req),
    });

    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    }

    const secureRequest = isSecureRequest(req);
    setPreferredClaimCookie(res, result.data?.cookie, { secure: secureRequest });

    const responseFormat = normalizeText(req.query?.format).toLowerCase();
    if (responseFormat === 'json') {
      return res.status(200).json({
        success: true,
        redirectPath: result.data?.redirectPath || '',
        redirectUrl: result.data?.redirectUrl || '',
        claim: result.data?.claim || null,
      });
    }

    return res.redirect(302, result.data?.redirectPath || '/store-register.html');
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to process preferred attribution redirect.',
    });
  }
}

export async function getPreferredAttributionClaimController(req, res) {
  try {
    const result = await resolvePreferredAttributionClaimSummary(req.headers?.cookie, {
      origin: resolveRequestOrigin(req),
    });
    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    }

    const secureRequest = isSecureRequest(req);
    if (result.cookie?.clear === true) {
      clearPreferredClaimCookie(res, result.cookie?.name, { secure: secureRequest });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to load preferred attribution claim.',
    });
  }
}

export async function getMemberPreferredAttributionLinkController(req, res) {
  try {
    const result = await createMemberPreferredAttributionLink(
      req.authenticatedMember || {},
      req.query || {},
      {
        origin: resolveRequestOrigin(req),
      },
    );

    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to generate preferred attribution link.',
    });
  }
}
