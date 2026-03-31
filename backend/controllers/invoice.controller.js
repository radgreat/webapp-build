import {
  getStoreInvoices,
  createStoreInvoice,
} from '../services/invoice.service.js';

export async function listStoreInvoices(req, res) {
  try {
    const result = await getStoreInvoices();
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to load store invoices.',
    });
  }
}

export async function postStoreInvoice(req, res) {
  try {
    const result = await createStoreInvoice(req.body || {});

    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to create store invoice.',
    });
  }
}