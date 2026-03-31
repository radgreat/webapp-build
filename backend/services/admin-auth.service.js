import { findAdminUserByIdentifier } from '../stores/admin-user.store.js';

function normalizeCredential(value) {
  return String(value || '').trim().toLowerCase();
}

function sanitizeAdminForAuthResponse(admin) {
  return {
    id: admin?.id || null,
    name: admin?.name || admin?.username || 'Admin',
    username: admin?.username || '',
    email: admin?.email || '',
    countryFlag: '',
  };
}

export async function authenticateAdmin(identifierInput, passwordInput) {
  const identifier = normalizeCredential(identifierInput);
  const password = String(passwordInput || '');

  if (!identifier || !password) {
    return { code: 'INVALID_CREDENTIALS' };
  }

  const matchedAdmin = await findAdminUserByIdentifier(identifier);
  if (!matchedAdmin) {
    return { code: 'INVALID_CREDENTIALS' };
  }

  if (String(matchedAdmin.password || '') !== password) {
    return { code: 'INVALID_CREDENTIALS' };
  }

  return {
    code: 'SUCCESS',
    admin: sanitizeAdminForAuthResponse(matchedAdmin),
  };
}
