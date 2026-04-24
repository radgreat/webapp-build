import { createHmac, randomUUID, timingSafeEqual } from 'crypto';

import {
  createPreferredAttributionClaim,
  findPreferredAttributionClaimById,
} from '../stores/preferred-attribution.store.js';
import {
  findUserById,
  readMockUsersStore,
} from '../stores/user.store.js';

const DEFAULT_COOKIE_NAME = 'charge_preferred_claim';
const DEFAULT_REGISTER_REDIRECT_PATH = '/store-register.html';
const DEFAULT_TOKEN_TTL_SECONDS = 30 * 60;
const DEFAULT_MIN_TOKEN_TTL_SECONDS = 60;
const DEFAULT_MAX_TOKEN_TTL_SECONDS = 10 * 365 * 24 * 60 * 60;
const DEFAULT_PERMANENT_MEMBER_LINK_TTL_SECONDS = 5 * 365 * 24 * 60 * 60;
const TOKEN_HEADER = Object.freeze({
  alg: 'HS256',
  typ: 'charge-preferred-attribution',
});

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeStoreCode(value) {
  return normalizeText(value)
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '');
}

function normalizeTokenSource(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9._:/-]/g, '')
    .slice(0, 80);
}

function normalizeShortValue(value, maxLength = 120) {
  return normalizeText(value)
    .replace(/[^\w\s./:-]/g, '')
    .slice(0, maxLength);
}

function toIsoStringOrEmpty(value) {
  if (!value) {
    return '';
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString();
}

function parseInteger(value, fallback = 0) {
  const parsed = Number.parseInt(String(value || ''), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clampWholeNumber(value, min, max, fallback) {
  const parsed = parseInteger(value, fallback);
  return Math.min(max, Math.max(min, parsed));
}

function encodeJsonToBase64Url(value) {
  return Buffer.from(JSON.stringify(value), 'utf8').toString('base64url');
}

function decodeJsonFromBase64Url(value) {
  const rawJson = Buffer.from(String(value || ''), 'base64url').toString('utf8');
  const parsed = JSON.parse(rawJson);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Decoded token JSON payload is invalid.');
  }
  return parsed;
}

function signHmacSha256(value, secret) {
  return createHmac('sha256', secret)
    .update(String(value || ''), 'utf8')
    .digest('base64url');
}

function secureCompareString(leftValue, rightValue) {
  const left = String(leftValue || '');
  const right = String(rightValue || '');
  const leftBuffer = Buffer.from(left, 'utf8');
  const rightBuffer = Buffer.from(right, 'utf8');
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }
  if (leftBuffer.length === 0) {
    return false;
  }
  return timingSafeEqual(leftBuffer, rightBuffer);
}

function resolvePreferredAttributionSigningSecret() {
  const secret = normalizeText(
    process.env.PREFERRED_ATTRIBUTION_SIGNING_SECRET
    || process.env.PREFERRED_LINK_SIGNING_SECRET
    || process.env.ATTRIBUTION_SIGNING_SECRET,
  );
  if (!secret) {
    return {
      ok: false,
      status: 503,
      error: 'Preferred attribution token signing secret is not configured.',
    };
  }
  return {
    ok: true,
    secret,
  };
}

function resolvePreferredAttributionCookieName() {
  return normalizeText(process.env.PREFERRED_ATTRIBUTION_COOKIE_NAME) || DEFAULT_COOKIE_NAME;
}

function resolvePreferredRegisterRedirectPath() {
  const configuredPath = normalizeText(process.env.PREFERRED_REGISTER_REDIRECT_PATH);
  if (configuredPath && configuredPath.startsWith('/')) {
    return configuredPath;
  }
  return DEFAULT_REGISTER_REDIRECT_PATH;
}

function resolveOriginCandidate(originInput) {
  const normalizedOrigin = normalizeText(originInput);
  if (!normalizedOrigin) {
    return '';
  }
  try {
    const parsed = new URL(normalizedOrigin);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.origin;
    }
  } catch {
    return '';
  }
  return '';
}

function resolvePreferredAttributionLinkOrigin(context = {}) {
  const contextOrigin = resolveOriginCandidate(context?.origin);
  if (contextOrigin) {
    return contextOrigin;
  }

  const envOrigin = resolveOriginCandidate(
    process.env.PREFERRED_ATTRIBUTION_LINK_ORIGIN
    || process.env.PUBLIC_APP_ORIGIN,
  );
  if (envOrigin) {
    return envOrigin;
  }

  const fallbackPort = Number.parseInt(process.env.PORT || '3000', 10) || 3000;
  return `http://localhost:${fallbackPort}`;
}

function resolvePreferredPermanentMemberLinkTtlSeconds() {
  return clampWholeNumber(
    process.env.PREFERRED_ATTRIBUTION_PERMANENT_LINK_TTL_SECONDS,
    DEFAULT_MIN_TOKEN_TTL_SECONDS,
    DEFAULT_MAX_TOKEN_TTL_SECONDS,
    DEFAULT_PERMANENT_MEMBER_LINK_TTL_SECONDS,
  );
}

function normalizeTokenClaims(rawClaims = {}) {
  const safeClaims = rawClaims && typeof rawClaims === 'object' ? rawClaims : {};
  const normalizedNonce = normalizeText(safeClaims.nonce)
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, 120);
  const ownerUserId = normalizeText(safeClaims.ownerUserId || safeClaims.owner_user_id).slice(0, 120);
  const ownerStoreCode = normalizeStoreCode(safeClaims.ownerStoreCode || safeClaims.owner_store_code);
  const source = normalizeTokenSource(safeClaims.source) || 'preferred-link';
  const campaign = normalizeShortValue(safeClaims.campaign, 120);
  const productId = normalizeShortValue(safeClaims.productId || safeClaims.product_id, 120);
  const issuedAt = parseInteger(safeClaims.iat, 0);
  const expiresAt = parseInteger(safeClaims.exp, 0);

  return {
    nonce: normalizedNonce,
    ownerUserId,
    ownerStoreCode,
    source,
    campaign,
    productId,
    iat: issuedAt,
    exp: expiresAt,
  };
}

function validateNormalizedTokenClaims(claims = {}) {
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (!claims.nonce) {
    return {
      ok: false,
      status: 400,
      error: 'Attribution token nonce is missing.',
    };
  }

  if (!Number.isFinite(claims.iat) || claims.iat <= 0) {
    return {
      ok: false,
      status: 400,
      error: 'Attribution token issued-at timestamp is invalid.',
    };
  }

  if (!Number.isFinite(claims.exp) || claims.exp <= 0) {
    return {
      ok: false,
      status: 400,
      error: 'Attribution token expiry timestamp is invalid.',
    };
  }

  if (claims.exp <= claims.iat) {
    return {
      ok: false,
      status: 400,
      error: 'Attribution token expiry must be after issued-at.',
    };
  }

  if (claims.exp <= nowSeconds) {
    return {
      ok: false,
      status: 401,
      error: 'Attribution token has expired.',
    };
  }

  if (claims.iat > (nowSeconds + 5 * 60)) {
    return {
      ok: false,
      status: 401,
      error: 'Attribution token issued-at timestamp is in the future.',
    };
  }

  return {
    ok: true,
  };
}

function issueSignedToken(payloadInput = {}, options = {}) {
  const secretResolution = resolvePreferredAttributionSigningSecret();
  if (!secretResolution.ok) {
    return secretResolution;
  }

  const ttlFromPayload = payloadInput.ttlSeconds || payloadInput.ttl_seconds;
  const ttlFromOptions = options?.ttlSeconds || options?.ttl_seconds;
  const configuredDefaultTtl = clampWholeNumber(
    process.env.PREFERRED_ATTRIBUTION_TOKEN_TTL_SECONDS,
    DEFAULT_MIN_TOKEN_TTL_SECONDS,
    DEFAULT_MAX_TOKEN_TTL_SECONDS,
    DEFAULT_TOKEN_TTL_SECONDS,
  );
  const ttlSeconds = clampWholeNumber(
    ttlFromPayload || ttlFromOptions,
    DEFAULT_MIN_TOKEN_TTL_SECONDS,
    DEFAULT_MAX_TOKEN_TTL_SECONDS,
    configuredDefaultTtl,
  );

  const nowSeconds = Math.floor(Date.now() / 1000);
  const expiresAtSeconds = nowSeconds + ttlSeconds;
  const tokenPayload = normalizeTokenClaims({
    nonce: payloadInput.nonce || randomUUID().replace(/-/g, ''),
    source: payloadInput.source || 'member-store-link',
    ownerUserId: payloadInput.ownerUserId || payloadInput.owner_user_id,
    ownerStoreCode: payloadInput.ownerStoreCode || payloadInput.owner_store_code,
    campaign: payloadInput.campaign,
    productId: payloadInput.productId || payloadInput.product_id,
    iat: nowSeconds,
    exp: expiresAtSeconds,
  });

  const validation = validateNormalizedTokenClaims(tokenPayload);
  if (!validation.ok) {
    return validation;
  }

  const encodedHeader = encodeJsonToBase64Url(TOKEN_HEADER);
  const encodedPayload = encodeJsonToBase64Url(tokenPayload);
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const signature = signHmacSha256(unsignedToken, secretResolution.secret);

  return {
    ok: true,
    token: `${unsignedToken}.${signature}`,
    payload: tokenPayload,
    expiresAt: toIsoStringOrEmpty(tokenPayload.exp * 1000),
  };
}

function verifySignedToken(tokenInput) {
  const token = normalizeText(tokenInput);
  if (!token) {
    return {
      ok: false,
      status: 400,
      error: 'Preferred attribution token is required.',
    };
  }

  const secretResolution = resolvePreferredAttributionSigningSecret();
  if (!secretResolution.ok) {
    return secretResolution;
  }

  const tokenSegments = token.split('.');
  if (tokenSegments.length !== 3) {
    return {
      ok: false,
      status: 400,
      error: 'Preferred attribution token format is invalid.',
    };
  }

  const [encodedHeader, encodedPayload, signature] = tokenSegments;
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = signHmacSha256(unsignedToken, secretResolution.secret);
  if (!secureCompareString(signature, expectedSignature)) {
    return {
      ok: false,
      status: 401,
      error: 'Preferred attribution token signature is invalid.',
    };
  }

  let decodedHeader = null;
  let decodedPayload = null;
  try {
    decodedHeader = decodeJsonFromBase64Url(encodedHeader);
    decodedPayload = decodeJsonFromBase64Url(encodedPayload);
  } catch {
    return {
      ok: false,
      status: 400,
      error: 'Preferred attribution token payload is malformed.',
    };
  }

  if (
    normalizeText(decodedHeader?.alg).toUpperCase() !== TOKEN_HEADER.alg
    || normalizeText(decodedHeader?.typ).toLowerCase() !== TOKEN_HEADER.typ
  ) {
    return {
      ok: false,
      status: 400,
      error: 'Preferred attribution token header is invalid.',
    };
  }

  const claims = normalizeTokenClaims(decodedPayload);
  const claimsValidation = validateNormalizedTokenClaims(claims);
  if (!claimsValidation.ok) {
    return claimsValidation;
  }

  return {
    ok: true,
    claims,
  };
}

function resolveStoreOwnerByCode(users = [], storeCodeInput = '') {
  const normalizedStoreCode = normalizeStoreCode(storeCodeInput);
  if (!normalizedStoreCode) {
    return null;
  }

  return (Array.isArray(users) ? users : []).find((user) => {
    const candidateCodes = [
      user?.storeCode,
      user?.publicStoreCode,
      user?.attributionStoreCode,
    ].map((candidateCode) => normalizeStoreCode(candidateCode));
    return candidateCodes.includes(normalizedStoreCode);
  }) || null;
}

async function resolveClaimOwnerFromClaims(claims = {}) {
  const users = await readMockUsersStore();
  const ownerUserId = normalizeText(claims.ownerUserId);
  const ownerStoreCode = normalizeStoreCode(claims.ownerStoreCode);

  const ownerByStoreCode = ownerStoreCode
    ? resolveStoreOwnerByCode(users, ownerStoreCode)
    : null;
  const ownerByUserId = ownerUserId
    ? (Array.isArray(users) ? users : []).find((user) => normalizeText(user?.id) === ownerUserId) || null
    : null;

  if (ownerUserId && !ownerByUserId) {
    return {
      ok: false,
      status: 404,
      error: 'Attribution token owner user could not be found.',
    };
  }

  if (ownerStoreCode && !ownerByStoreCode) {
    return {
      ok: false,
      status: 404,
      error: 'Attribution token store code could not be found.',
    };
  }

  if (
    ownerByUserId
    && ownerByStoreCode
    && normalizeText(ownerByUserId?.id) !== normalizeText(ownerByStoreCode?.id)
  ) {
    return {
      ok: false,
      status: 409,
      error: 'Attribution token owner and store code do not resolve to the same member.',
    };
  }

  const owner = ownerByUserId || ownerByStoreCode || null;
  const resolvedStoreCode = normalizeStoreCode(
    ownerStoreCode
    || owner?.publicStoreCode
    || owner?.storeCode
    || owner?.attributionStoreCode,
  );

  return {
    ok: true,
    owner,
    ownerStoreCode: resolvedStoreCode,
  };
}

function buildClaimCookieValue(claimIdInput) {
  const claimId = normalizeText(claimIdInput);
  if (!claimId) {
    return {
      ok: false,
      status: 500,
      error: 'Cannot issue preferred attribution cookie without a claim id.',
    };
  }

  const secretResolution = resolvePreferredAttributionSigningSecret();
  if (!secretResolution.ok) {
    return secretResolution;
  }

  const payload = encodeJsonToBase64Url({
    claimId,
    issuedAt: new Date().toISOString(),
  });
  const signature = signHmacSha256(payload, secretResolution.secret);

  return {
    ok: true,
    cookieValue: `${payload}.${signature}`,
  };
}

function parseClaimCookieValue(cookieValueInput) {
  const cookieValue = normalizeText(cookieValueInput);
  if (!cookieValue) {
    return {
      ok: false,
      status: 400,
      error: 'Preferred attribution claim cookie is missing.',
    };
  }

  const secretResolution = resolvePreferredAttributionSigningSecret();
  if (!secretResolution.ok) {
    return secretResolution;
  }

  const segments = cookieValue.split('.');
  if (segments.length !== 2) {
    return {
      ok: false,
      status: 400,
      error: 'Preferred attribution claim cookie format is invalid.',
    };
  }

  const [encodedPayload, signature] = segments;
  const expectedSignature = signHmacSha256(encodedPayload, secretResolution.secret);
  if (!secureCompareString(signature, expectedSignature)) {
    return {
      ok: false,
      status: 401,
      error: 'Preferred attribution claim cookie signature is invalid.',
    };
  }

  let decodedPayload = null;
  try {
    decodedPayload = decodeJsonFromBase64Url(encodedPayload);
  } catch {
    return {
      ok: false,
      status: 400,
      error: 'Preferred attribution claim cookie payload is malformed.',
    };
  }

  const claimId = normalizeText(decodedPayload?.claimId);
  if (!claimId) {
    return {
      ok: false,
      status: 400,
      error: 'Preferred attribution claim cookie does not include a claim id.',
    };
  }

  return {
    ok: true,
    claimId,
  };
}

function parseCookies(cookieHeaderInput) {
  const rawCookieHeader = String(cookieHeaderInput || '').trim();
  if (!rawCookieHeader) {
    return {};
  }

  const parsedCookies = {};
  const cookiePairs = rawCookieHeader.split(';');
  cookiePairs.forEach((pair) => {
    const delimiterIndex = pair.indexOf('=');
    if (delimiterIndex < 0) {
      return;
    }
    let key = '';
    let value = '';
    try {
      key = decodeURIComponent(pair.slice(0, delimiterIndex).trim());
      value = decodeURIComponent(pair.slice(delimiterIndex + 1).trim());
    } catch {
      return;
    }
    if (!key) {
      return;
    }
    parsedCookies[key] = value;
  });

  return parsedCookies;
}

function toClaimSummary(claim = {}, owner = null) {
  if (!claim || typeof claim !== 'object') {
    return null;
  }

  const ownerDisplayName = normalizeText(owner?.name || owner?.username);
  const ownerUsername = normalizeText(owner?.username);

  return {
    id: normalizeText(claim.id),
    attributionMode: normalizeText(claim.ownerUserId || claim.ownerStoreCode)
      ? 'member_link'
      : 'admin_parking',
    ownerUserId: normalizeText(claim.ownerUserId),
    ownerStoreCode: normalizeStoreCode(claim.ownerStoreCode),
    ownerDisplayName,
    ownerUsername,
    source: normalizeText(claim.source),
    campaign: normalizeText(claim.campaign),
    productId: normalizeText(claim.productId),
    status: normalizeText(claim.status) || 'active',
    issuedAt: toIsoStringOrEmpty(claim.issuedAt),
    expiresAt: toIsoStringOrEmpty(claim.expiresAt),
    consumedAt: toIsoStringOrEmpty(claim.consumedAt),
  };
}

function buildPreferredRegisterRedirectPath(options = {}) {
  const basePath = resolvePreferredRegisterRedirectPath();
  const url = new URL(basePath, 'http://localhost');

  const ownerStoreCode = normalizeStoreCode(options.ownerStoreCode);
  if (ownerStoreCode) {
    url.searchParams.set('store', ownerStoreCode);
  }

  return `${url.pathname}${url.search}`;
}

export function getPreferredAttributionCookieName() {
  return resolvePreferredAttributionCookieName();
}

export async function createPreferredAttributionRedirectClaim(rawToken, context = {}) {
  const normalizedRawToken = normalizeText(rawToken);
  if (!normalizedRawToken) {
    const origin = resolvePreferredAttributionLinkOrigin(context);
    const redirectPath = buildPreferredRegisterRedirectPath();
    const redirectUrl = new URL(redirectPath, origin).toString();

    return {
      success: true,
      status: 302,
      data: {
        redirectPath,
        redirectUrl,
        claim: null,
        cookie: null,
        unattributedFallback: true,
      },
    };
  }

  const verification = verifySignedToken(normalizedRawToken);
  if (!verification.ok) {
    return {
      success: false,
      status: verification.status,
      error: verification.error,
    };
  }

  const claims = verification.claims;

  const ownerResolution = await resolveClaimOwnerFromClaims(claims);
  if (!ownerResolution.ok) {
    return {
      success: false,
      status: ownerResolution.status,
      error: ownerResolution.error,
    };
  }

  const issuedAtIso = toIsoStringOrEmpty(claims.iat * 1000);
  const expiresAtIso = toIsoStringOrEmpty(claims.exp * 1000);
  const claimNonce = randomUUID().replace(/-/g, '');
  const attributionClaimInput = {
    nonce: claimNonce,
    source: claims.source,
    ownerUserId: normalizeText(ownerResolution.owner?.id),
    ownerStoreCode: ownerResolution.ownerStoreCode,
    campaign: claims.campaign,
    productId: claims.productId,
    issuedAt: issuedAtIso,
    expiresAt: expiresAtIso,
    status: 'active',
    rawPayload: {
      tokenClaims: claims,
      tokenNonce: normalizeText(claims.nonce),
      requestContext: {
        ip: normalizeText(context?.ip),
        userAgent: normalizeText(context?.userAgent),
        requestOrigin: normalizeText(context?.origin),
      },
    },
  };

  let createdClaim = null;
  try {
    createdClaim = await createPreferredAttributionClaim(attributionClaimInput);
  } catch (error) {
    if (error?.code === '23505') {
      return {
        success: false,
        status: 409,
        error: 'Attribution token has already been used.',
      };
    }
    throw error;
  }

  const cookieResolution = buildClaimCookieValue(createdClaim?.id);
  if (!cookieResolution.ok) {
    return {
      success: false,
      status: cookieResolution.status,
      error: cookieResolution.error,
    };
  }

  const origin = resolvePreferredAttributionLinkOrigin(context);
  const redirectPath = buildPreferredRegisterRedirectPath({
    ownerStoreCode: ownerResolution.ownerStoreCode,
  });
  const redirectUrl = new URL(redirectPath, origin).toString();
  const expiresAtMs = Date.parse(expiresAtIso);
  const fallbackCookieMaxAgeMs = clampWholeNumber(
    process.env.PREFERRED_ATTRIBUTION_COOKIE_TTL_SECONDS,
    DEFAULT_MIN_TOKEN_TTL_SECONDS,
    DEFAULT_MAX_TOKEN_TTL_SECONDS,
    DEFAULT_TOKEN_TTL_SECONDS,
  ) * 1000;
  const cookieMaxAgeMs = Number.isFinite(expiresAtMs)
    ? Math.max(60 * 1000, expiresAtMs - Date.now())
    : fallbackCookieMaxAgeMs;
  const owner = ownerResolution.owner
    || (createdClaim?.ownerUserId ? await findUserById(createdClaim.ownerUserId) : null);

  return {
    success: true,
    status: 302,
    data: {
      redirectPath,
      redirectUrl,
      claim: toClaimSummary(createdClaim, owner),
      cookie: {
        name: resolvePreferredAttributionCookieName(),
        value: cookieResolution.cookieValue,
        maxAgeMs: cookieMaxAgeMs,
      },
    },
  };
}

export async function resolvePreferredAttributionClaimSummary(cookieHeader, context = {}) {
  const cookies = parseCookies(cookieHeader);
  const cookieName = resolvePreferredAttributionCookieName();
  const cookieValue = normalizeText(cookies[cookieName]);

  if (!cookieValue) {
    return {
      success: true,
      status: 200,
      data: {
        success: true,
        hasClaim: false,
        attributionMode: 'admin_parking',
        claim: null,
        checkedAt: new Date().toISOString(),
      },
      cookie: {
        clear: false,
        name: cookieName,
      },
    };
  }

  const cookieResolution = parseClaimCookieValue(cookieValue);
  if (!cookieResolution.ok) {
    return {
      success: true,
      status: 200,
      data: {
        success: true,
        hasClaim: false,
        attributionMode: 'admin_parking',
        claim: null,
        checkedAt: new Date().toISOString(),
      },
      cookie: {
        clear: true,
        name: cookieName,
      },
    };
  }

  const claim = await findPreferredAttributionClaimById(cookieResolution.claimId);
  if (!claim) {
    return {
      success: true,
      status: 200,
      data: {
        success: true,
        hasClaim: false,
        attributionMode: 'admin_parking',
        claim: null,
        checkedAt: new Date().toISOString(),
      },
      cookie: {
        clear: true,
        name: cookieName,
      },
    };
  }

  const claimSummary = toClaimSummary(
    claim,
    claim?.ownerUserId ? await findUserById(claim.ownerUserId) : null,
  );
  const expiresAtMs = Date.parse(claimSummary?.expiresAt || '');
  const isExpired = Number.isFinite(expiresAtMs) && expiresAtMs <= Date.now();
  const isConsumed = Boolean(normalizeText(claimSummary?.consumedAt));
  if (isExpired || isConsumed) {
    return {
      success: true,
      status: 200,
      data: {
        success: true,
        hasClaim: false,
        attributionMode: 'admin_parking',
        claim: null,
        checkedAt: new Date().toISOString(),
      },
      cookie: {
        clear: true,
        name: cookieName,
      },
    };
  }

  return {
    success: true,
    status: 200,
    data: {
      success: true,
      hasClaim: true,
      attributionMode: claimSummary.attributionMode,
      claim: claimSummary,
      requestOrigin: normalizeText(context?.origin),
      checkedAt: new Date().toISOString(),
    },
    cookie: {
      clear: false,
      name: cookieName,
    },
  };
}

export async function createMemberPreferredAttributionLink(
  authenticatedMemberInput = {},
  payload = {},
  context = {},
) {
  const authenticatedMemberId = normalizeText(authenticatedMemberInput?.id || authenticatedMemberInput?.userId);
  if (!authenticatedMemberId) {
    return {
      success: false,
      status: 401,
      error: 'Member authentication is required to generate attribution links.',
    };
  }

  const authenticatedMember = await findUserById(authenticatedMemberId);
  if (!authenticatedMember) {
    return {
      success: false,
      status: 404,
      error: 'Member account was not found for attribution link generation.',
    };
  }

  const ownerStoreCode = normalizeStoreCode(
    payload.storeCode
    || payload.ownerStoreCode
    || authenticatedMember.publicStoreCode
    || authenticatedMember.storeCode
    || authenticatedMember.attributionStoreCode,
  );
  if (!ownerStoreCode) {
    return {
      success: false,
      status: 409,
      error: 'No member store code is available for this account.',
    };
  }

  const tokenIssueResult = issueSignedToken({
    ownerUserId: authenticatedMember.id,
    ownerStoreCode,
    source: payload.source || 'member-store-link',
    campaign: payload.campaign,
    productId: payload.productId,
    ttlSeconds: payload.ttlSeconds
      || payload.expiresInSeconds
      || payload.expiresInMinutes * 60
      || resolvePreferredPermanentMemberLinkTtlSeconds(),
  });
  if (!tokenIssueResult.ok) {
    return {
      success: false,
      status: tokenIssueResult.status,
      error: tokenIssueResult.error,
    };
  }

  const redirectPath = `/go/preferred-register?at=${encodeURIComponent(tokenIssueResult.token)}`;
  const origin = resolvePreferredAttributionLinkOrigin(context);
  const redirectUrl = new URL(redirectPath, origin).toString();

  return {
    success: true,
    status: 200,
    data: {
      success: true,
      ownerUserId: normalizeText(authenticatedMember.id),
      ownerUsername: normalizeText(authenticatedMember.username),
      ownerStoreCode,
      source: normalizeTokenSource(payload.source || 'member-store-link') || 'member-store-link',
      campaign: normalizeShortValue(payload.campaign),
      productId: normalizeShortValue(payload.productId),
      token: tokenIssueResult.token,
      redirectPath,
      redirectUrl,
      expiresAt: tokenIssueResult.expiresAt,
      suggestedShopifyRegisterUrl: redirectUrl,
      reusable: true,
      checkedAt: new Date().toISOString(),
    },
  };
}
