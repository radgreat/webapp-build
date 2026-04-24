import {
  readStoreProductsStore,
  writeStoreProductsStore,
} from '../stores/store-product.store.js';
import {
  normalizeStoreProductPackageEarnings,
  resolveStoreProductLegacyBp,
} from '../utils/store-product-earnings.helpers.js';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const DEFAULT_PRODUCT_IMAGE = 'https://placehold.co/1000x1250?text=Product';
const MAX_PRODUCT_IMAGES = 12;
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const UPLOAD_ROUTE_BASE = '/uploads/store-products';
const ALLOWED_UPLOAD_MIME_TO_EXT = Object.freeze({
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
});
const LEGACY_SAMPLE_PRODUCT_ID_SET = new Set([
  'hydration-stack',
  'daily-energy',
  'recover-pack',
  'immune-core',
  'focus-nootropics',
  'night-reset',
]);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..', '..');
const productImageUploadDirectory = path.join(projectRoot, 'uploads', 'store-products');

function normalizeText(value) {
  return String(value || '').trim();
}

function roundCurrencyAmount(value) {
  return Math.round((Math.max(0, Number(value) || 0)) * 100) / 100;
}

function toWholeNumber(value, fallback = 0) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return fallback;
  }
  return Math.max(0, Math.floor(numericValue));
}

function normalizeStoreProductStatus(value) {
  const normalizedValue = normalizeText(value).toLowerCase();
  return normalizedValue === 'archived' ? 'archived' : 'active';
}

function normalizeStoreProductImages(imagesValue = [], fallbackImage = '') {
  const collectedImages = [];
  if (Array.isArray(imagesValue)) {
    imagesValue.forEach((image) => {
      collectedImages.push(normalizeText(image));
    });
  } else if (typeof imagesValue === 'string') {
    imagesValue
      .split(/\r?\n|,/)
      .forEach((image) => {
        collectedImages.push(normalizeText(image));
      });
  }

  const normalizedFallback = normalizeText(fallbackImage);
  if (normalizedFallback) {
    collectedImages.unshift(normalizedFallback);
  }

  const uniqueImages = [];
  const seenImages = new Set();
  collectedImages.forEach((image) => {
    if (!image || seenImages.has(image)) {
      return;
    }
    seenImages.add(image);
    uniqueImages.push(image);
  });

  if (uniqueImages.length === 0) {
    uniqueImages.push(DEFAULT_PRODUCT_IMAGE);
  }

  return uniqueImages.slice(0, MAX_PRODUCT_IMAGES);
}

function normalizeStoreProductId(value, fallbackId = 'product') {
  const normalizedValue = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (normalizedValue) {
    return normalizedValue;
  }

  const normalizedFallback = String(fallbackId || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return normalizedFallback || 'product';
}

function parseStoreProductDetails(detailsValue, fallbackBp = 0) {
  const details = [];
  if (Array.isArray(detailsValue)) {
    detailsValue.forEach((detail) => {
      const normalizedDetail = normalizeText(detail);
      if (normalizedDetail) {
        details.push(normalizedDetail);
      }
    });
  } else if (typeof detailsValue === 'string') {
    detailsValue.split(/\r?\n/).forEach((detail) => {
      const normalizedDetail = normalizeText(detail);
      if (normalizedDetail) {
        details.push(normalizedDetail);
      }
    });
  }

  if (details.length === 0) {
    details.push(`${toWholeNumber(fallbackBp, 0)} BV points per unit`);
  }

  return details.slice(0, 16);
}

function normalizeStoreProduct(rawProduct = {}, index = 0) {
  const fallbackTitle = `Product ${index + 1}`;
  const title = normalizeText(rawProduct?.title || rawProduct?.name || fallbackTitle) || fallbackTitle;
  const id = normalizeStoreProductId(rawProduct?.id || rawProduct?.slug || title, `product-${index + 1}`);
  const price = roundCurrencyAmount(rawProduct?.price);
  const bp = toWholeNumber(rawProduct?.bp ?? rawProduct?.bvPoints, 0);
  const packageEarnings = normalizeStoreProductPackageEarnings(rawProduct?.packageEarnings, {
    fallbackBp: bp,
  });
  const legacyBp = resolveStoreProductLegacyBp({
    packageEarnings,
    bp,
  });
  const detailFallbackBp = toWholeNumber(packageEarnings?.['personal-builder-pack']?.bv, legacyBp);
  const stock = toWholeNumber(rawProduct?.stock, 0);
  const description = normalizeText(rawProduct?.description || rawProduct?.summary || `${title} product description.`);
  const details = parseStoreProductDetails(rawProduct?.details, detailFallbackBp);
  const image = normalizeText(rawProduct?.image || rawProduct?.imageUrl || DEFAULT_PRODUCT_IMAGE);
  const images = normalizeStoreProductImages(rawProduct?.images, image);
  const status = normalizeStoreProductStatus(rawProduct?.status);

  return {
    id,
    title,
    description,
    details,
    image: images[0] || DEFAULT_PRODUCT_IMAGE,
    images,
    price,
    bp: legacyBp,
    packageEarnings,
    stock,
    status,
  };
}

function normalizeStoreProductCatalog(rawCatalog) {
  if (!Array.isArray(rawCatalog)) {
    return [];
  }

  const normalizedProducts = [];
  const seenIds = new Set();
  rawCatalog.forEach((rawProduct, index) => {
    if (!rawProduct || typeof rawProduct !== 'object') {
      return;
    }

    const normalizedProduct = normalizeStoreProduct(rawProduct, index);
    let nextId = normalizedProduct.id;
    let suffix = 2;
    while (seenIds.has(nextId)) {
      nextId = `${normalizedProduct.id}-${suffix}`;
      suffix += 1;
    }

    seenIds.add(nextId);
    normalizedProducts.push({
      ...normalizedProduct,
      id: nextId,
    });
  });

  return normalizedProducts;
}

export async function getStoreProducts(options = {}) {
  const includeArchived = options?.includeArchived === true;
  const products = await readStoreProductsStore({ includeArchived });
  const filteredProducts = products.filter((product) => !LEGACY_SAMPLE_PRODUCT_ID_SET.has(product?.id));

  return {
    success: true,
    status: 200,
    data: {
      products: filteredProducts,
    },
  };
}

export async function replaceStoreProducts(payload = {}) {
  const productsInput = Array.isArray(payload?.products) ? payload.products : null;
  if (!productsInput) {
    return {
      success: false,
      status: 400,
      error: 'Products array is required.',
    };
  }

  const normalizedProducts = normalizeStoreProductCatalog(productsInput);
  await writeStoreProductsStore(normalizedProducts);
  const products = await readStoreProductsStore({ includeArchived: true });

  return {
    success: true,
    status: 200,
    data: {
      success: true,
      products,
    },
  };
}

function extractUploadNameStem(fileName = '') {
  const normalizedName = normalizeText(fileName);
  if (!normalizedName) {
    return 'product-image';
  }

  const parsed = path.parse(normalizedName);
  const normalizedStem = normalizeStoreProductId(parsed.name || normalizedName, 'product-image');
  return normalizedStem || 'product-image';
}

function parseImageDataUrl(dataUrl) {
  const normalizedDataUrl = normalizeText(dataUrl);
  const match = normalizedDataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=\s]+)$/);
  if (!match) {
    return null;
  }

  const mimeType = String(match[1] || '').toLowerCase();
  const extension = ALLOWED_UPLOAD_MIME_TO_EXT[mimeType];
  if (!extension) {
    return null;
  }

  const base64Payload = String(match[2] || '').replace(/\s+/g, '');
  if (!base64Payload) {
    return null;
  }

  return {
    mimeType,
    extension,
    base64Payload,
  };
}

export async function uploadAdminStoreProductImage(payload = {}) {
  const parsedImage = parseImageDataUrl(payload?.dataUrl);
  if (!parsedImage) {
    return {
      success: false,
      status: 400,
      error: 'Provide an image data URL in PNG, JPG, WEBP, or GIF format.',
    };
  }

  let imageBuffer = null;
  try {
    imageBuffer = Buffer.from(parsedImage.base64Payload, 'base64');
  } catch {
    imageBuffer = null;
  }

  if (!imageBuffer || imageBuffer.length === 0) {
    return {
      success: false,
      status: 400,
      error: 'Image data could not be decoded.',
    };
  }

  if (imageBuffer.length > MAX_UPLOAD_BYTES) {
    return {
      success: false,
      status: 400,
      error: 'Image is too large. Limit is 5 MB.',
    };
  }

  await mkdir(productImageUploadDirectory, { recursive: true });

  const fileNameStem = extractUploadNameStem(payload?.fileName);
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
  const randomSuffix = Math.random().toString(36).slice(2, 8);
  const generatedFileName = `${timestamp}-${randomSuffix}-${fileNameStem}.${parsedImage.extension}`;
  const destinationPath = path.join(productImageUploadDirectory, generatedFileName);

  await writeFile(destinationPath, imageBuffer);

  return {
    success: true,
    status: 200,
    data: {
      imageUrl: `${UPLOAD_ROUTE_BASE}/${generatedFileName}`,
      bytes: imageBuffer.length,
      mimeType: parsedImage.mimeType,
    },
  };
}
