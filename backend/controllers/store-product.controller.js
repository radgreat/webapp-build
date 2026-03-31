import {
  getStoreProducts,
  replaceStoreProducts,
  uploadAdminStoreProductImage,
} from '../services/store-product.service.js';

export async function listPublicStoreProducts(req, res) {
  try {
    const result = await getStoreProducts({ includeArchived: false });
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to load store products.',
    });
  }
}

export async function listAdminStoreProducts(req, res) {
  try {
    const result = await getStoreProducts({ includeArchived: true });
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to load admin store products.',
    });
  }
}

export async function putAdminStoreProducts(req, res) {
  try {
    const result = await replaceStoreProducts(req.body || {});
    if (!result.success) {
      return res.status(result.status).json({
        error: result.error,
      });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to update store products.',
    });
  }
}

export async function postAdminStoreProductImageUpload(req, res) {
  try {
    const result = await uploadAdminStoreProductImage(req.body || {});
    if (!result.success) {
      return res.status(result.status).json({
        error: result.error,
      });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to upload store product image.',
    });
  }
}
