import { Router } from 'express';
import {
  listStoreInvoices,
  postStoreInvoice,
} from '../controllers/invoice.controller.js';

const router = Router();

router.get('/store-invoices', listStoreInvoices);
router.post('/store-invoices', postStoreInvoice);

export default router;