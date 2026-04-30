import { Router } from 'express';
import { requireMemberAuthSession } from '../middleware/member-auth.middleware.js';
import {
  getAdminLedgerSummaryView,
  getMemberLedgerSummary,
  listAdminLedgerEntries,
  listMemberLedgerEntries,
  postAdminLedgerAdjustment,
  postAdminLedgerReverse,
} from '../controllers/ledger.controller.js';

const router = Router();

router.get('/member-auth/ledger', requireMemberAuthSession, listMemberLedgerEntries);
router.get('/member-auth/ledger/summary', requireMemberAuthSession, getMemberLedgerSummary);
router.get('/admin/ledger', listAdminLedgerEntries);
router.get('/admin/ledger/summary', getAdminLedgerSummaryView);
router.post('/admin/ledger/adjustments', postAdminLedgerAdjustment);
router.post('/admin/ledger/:entryId/reverse', postAdminLedgerReverse);

export default router;
