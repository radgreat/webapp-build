import { readMockEmailOutboxStore } from '../stores/email.store.js';

export async function listMockEmailOutbox(req, res) {
  try {
    const emails = await readMockEmailOutboxStore();

    return res.status(200).json({ emails });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to load mock email outbox.',
    });
  }
}