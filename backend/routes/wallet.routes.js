import { Router } from 'express';
import {
  listEWalletOverview,
  listEWalletCommissionOffsets,
  postEWalletPeerTransfer,
  postEWalletCommissionTransfer,
  postEWalletPayoutRequest,
} from '../controllers/wallet.controller.js';

const router = Router();

router.get('/e-wallet', listEWalletOverview);
router.get('/e-wallet/commission-offsets', listEWalletCommissionOffsets);
router.post('/e-wallet/peer-transfer', postEWalletPeerTransfer);
router.post('/e-wallet/commission-transfer', postEWalletCommissionTransfer);
router.post('/e-wallet/request-payout', postEWalletPayoutRequest);

export default router;
