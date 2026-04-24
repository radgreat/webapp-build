import { Router } from 'express';
import {
  getStoreCheckoutConfigController,
  postStoreCheckoutSession,
  postCompleteStoreCheckoutSession,
  postStoreCheckoutPaymentIntent,
  postCompleteStoreCheckoutPaymentIntent,
  postPreferredCustomerRegistration,
} from '../controllers/store-checkout.controller.js';

const router = Router();

router.get('/store-checkout/config', getStoreCheckoutConfigController);
router.post('/store-checkout/preferred-register', postPreferredCustomerRegistration);
router.post('/store-checkout/session', postStoreCheckoutSession);
router.post('/store-checkout/complete', postCompleteStoreCheckoutSession);
router.post('/store-checkout/intent', postStoreCheckoutPaymentIntent);
router.post('/store-checkout/intent/complete', postCompleteStoreCheckoutPaymentIntent);

export default router;
