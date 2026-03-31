import { authenticateAdmin } from '../services/admin-auth.service.js';

export async function loginAdmin(req, res) {
  try {
    const { identifier, password } = req.body || {};

    if (!String(identifier || '').trim() || !String(password || '')) {
      return res.status(400).json({
        error: 'Username/email and password are required.',
      });
    }

    const result = await authenticateAdmin(identifier, password);

    if (result.code === 'INVALID_CREDENTIALS') {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    return res.status(200).json({ admin: result.admin });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to process admin login.',
    });
  }
}
