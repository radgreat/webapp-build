import { Router } from 'express';
import {
  listPublicStoreProducts,
  listAdminStoreProducts,
  putAdminStoreProducts,
  postAdminStoreProductImageUpload,
} from '../controllers/store-product.controller.js';

const router = Router();

router.get('/store-products', listPublicStoreProducts);
router.get('/admin/store-products', listAdminStoreProducts);
router.put('/admin/store-products', putAdminStoreProducts);
router.post('/admin/store-products/upload-image', postAdminStoreProductImageUpload);

export default router;
