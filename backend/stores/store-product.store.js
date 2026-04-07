import pool from '../db/db.js';
import adminPool from '../db/admin-db.js';

const DEFAULT_PRODUCT_IMAGE = 'https://placehold.co/1000x1250?text=Product';

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeStoreProductStatus(value) {
  const normalizedValue = normalizeText(value).toLowerCase();
  return normalizedValue === 'archived' ? 'archived' : 'active';
}

function toWholeNumber(value, fallback = 0) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return fallback;
  }
  return Math.max(0, Math.floor(numericValue));
}

function roundCurrencyAmount(value) {
  return Math.round((Math.max(0, Number(value) || 0)) * 100) / 100;
}

function toIsoStringOrEmpty(value) {
  if (!value) {
    return '';
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  const parsedValue = new Date(value);
  return Number.isNaN(parsedValue.getTime()) ? '' : parsedValue.toISOString();
}

function quoteIdentifier(value) {
  return `"${String(value || '').replace(/"/g, '""')}"`;
}

function normalizeProductDetails(detailsValue = []) {
  if (!Array.isArray(detailsValue)) {
    return [];
  }

  return detailsValue
    .map((detail) => normalizeText(detail))
    .filter(Boolean)
    .slice(0, 16);
}

function normalizeProductImages(imagesValue = [], fallbackImage = '') {
  const rawImages = [];

  if (Array.isArray(imagesValue)) {
    imagesValue.forEach((imageValue) => {
      rawImages.push(normalizeText(imageValue));
    });
  } else if (typeof imagesValue === 'string') {
    rawImages.push(normalizeText(imagesValue));
  }

  const normalizedFallback = normalizeText(fallbackImage);
  if (normalizedFallback) {
    rawImages.unshift(normalizedFallback);
  }

  const dedupedImages = [];
  const seenImages = new Set();
  rawImages.forEach((image) => {
    if (!image || seenImages.has(image)) {
      return;
    }
    seenImages.add(image);
    dedupedImages.push(image);
  });

  if (dedupedImages.length === 0) {
    dedupedImages.push(DEFAULT_PRODUCT_IMAGE);
  }

  return dedupedImages.slice(0, 12);
}

function mapDbStoreProductToAppProduct(row) {
  if (!row) {
    return null;
  }

  const images = normalizeProductImages(row.image_urls, row.image_url);
  const primaryImage = images[0] || DEFAULT_PRODUCT_IMAGE;

  return {
    id: normalizeText(row.product_id),
    title: normalizeText(row.title),
    description: normalizeText(row.description),
    details: normalizeProductDetails(row.details),
    image: primaryImage,
    images,
    price: roundCurrencyAmount(row.price_amount),
    bp: toWholeNumber(row.bp_value, 0),
    stock: toWholeNumber(row.stock_count, 0),
    status: normalizeStoreProductStatus(row.status),
    createdAt: toIsoStringOrEmpty(row.created_at),
    updatedAt: toIsoStringOrEmpty(row.updated_at),
  };
}

function mapAppStoreProductToDbStoreProduct(product, sortOrder = 0) {
  const images = normalizeProductImages(product?.images, product?.image);
  const primaryImage = images[0] || DEFAULT_PRODUCT_IMAGE;

  return {
    product_id: normalizeText(product?.id),
    title: normalizeText(product?.title),
    description: normalizeText(product?.description),
    details: normalizeProductDetails(product?.details),
    image_url: primaryImage,
    image_urls: images,
    price_amount: roundCurrencyAmount(product?.price),
    bp_value: toWholeNumber(product?.bp, 0),
    stock_count: toWholeNumber(product?.stock, 0),
    status: normalizeStoreProductStatus(product?.status),
    sort_order: Math.max(0, toWholeNumber(sortOrder, 0)),
  };
}

let storeProductSchemaReady = false;
let storeProductSchemaPromise = null;

async function installStoreProductsTableViaAdmin() {
  const client = await adminPool.connect();
  let transactionClosed = false;

  try {
    await client.query('BEGIN');
    await client.query(`
      CREATE TABLE IF NOT EXISTS charge.store_products (
        product_id text PRIMARY KEY,
        title text NOT NULL DEFAULT '',
        description text NOT NULL DEFAULT '',
        details jsonb NOT NULL DEFAULT '[]'::jsonb,
        image_url text NOT NULL DEFAULT '',
        image_urls jsonb NOT NULL DEFAULT '[]'::jsonb,
        price_amount numeric(12,2) NOT NULL DEFAULT 0,
        bp_value integer NOT NULL DEFAULT 0,
        stock_count integer NOT NULL DEFAULT 0,
        status text NOT NULL DEFAULT 'active',
        sort_order integer NOT NULL DEFAULT 0,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW(),
        CONSTRAINT store_products_price_amount_check CHECK (price_amount >= 0),
        CONSTRAINT store_products_bp_value_check CHECK (bp_value >= 0),
        CONSTRAINT store_products_stock_count_check CHECK (stock_count >= 0),
        CONSTRAINT store_products_status_check CHECK (status IN ('active', 'archived'))
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS store_products_sort_order_idx
      ON charge.store_products (sort_order ASC)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS store_products_status_idx
      ON charge.store_products (status)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS store_products_title_lower_idx
      ON charge.store_products (LOWER(title))
    `);

    const serviceRole = normalizeText(process.env.DB_USER);
    if (serviceRole) {
      const quotedServiceRole = quoteIdentifier(serviceRole);
      await client.query(`GRANT USAGE ON SCHEMA charge TO ${quotedServiceRole}`);
      await client.query(`
        GRANT SELECT, INSERT, UPDATE, DELETE
        ON TABLE charge.store_products
        TO ${quotedServiceRole}
      `);
    }

    await client.query('COMMIT');
    transactionClosed = true;
  } catch (error) {
    if (!transactionClosed) {
      await client.query('ROLLBACK').catch(() => {});
    }
    throw error;
  } finally {
    client.release();
  }
}

async function ensureStoreProductImageGalleryColumnsViaAdmin() {
  const client = await adminPool.connect();
  let transactionClosed = false;

  try {
    await client.query('BEGIN');
    await client.query(`
      ALTER TABLE charge.store_products
      ADD COLUMN IF NOT EXISTS image_urls jsonb NOT NULL DEFAULT '[]'::jsonb
    `);
    await client.query(`
      UPDATE charge.store_products
      SET image_urls = CASE
        WHEN jsonb_typeof(image_urls) = 'array' AND jsonb_array_length(image_urls) > 0 THEN image_urls
        WHEN NULLIF(TRIM(image_url), '') IS NULL THEN '[]'::jsonb
        ELSE jsonb_build_array(TRIM(image_url))
      END
    `);
    await client.query('COMMIT');
    transactionClosed = true;
  } catch (error) {
    if (!transactionClosed) {
      await client.query('ROLLBACK').catch(() => {});
    }
    throw error;
  } finally {
    client.release();
  }
}

export async function ensureStoreProductTables() {
  if (storeProductSchemaReady) {
    return;
  }

  if (storeProductSchemaPromise) {
    return storeProductSchemaPromise;
  }

  storeProductSchemaPromise = (async () => {
    const probe = await pool.query(`
      SELECT to_regclass('charge.store_products') AS table_name
    `);

    let tableName = probe.rows?.[0]?.table_name || null;
    if (!tableName) {
      await installStoreProductsTableViaAdmin();

      const recheck = await pool.query(`
        SELECT to_regclass('charge.store_products') AS table_name
      `);
      tableName = recheck.rows?.[0]?.table_name || null;
      if (!tableName) {
        throw new Error(
          'Store products table is not installed in schema "charge". Install "charge.store_products" first.',
        );
      }
    }

    await pool.query('SELECT 1 FROM charge.store_products LIMIT 1');
    const imageColumnProbe = await pool.query(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'charge'
          AND table_name = 'store_products'
          AND column_name = 'image_urls'
      ) AS has_image_urls
    `);
    const hasImageUrlsColumn = imageColumnProbe.rows?.[0]?.has_image_urls === true;
    if (!hasImageUrlsColumn) {
      await ensureStoreProductImageGalleryColumnsViaAdmin();
    }
    storeProductSchemaReady = true;
  })().catch((error) => {
    storeProductSchemaReady = false;
    throw error;
  }).finally(() => {
    if (!storeProductSchemaReady) {
      storeProductSchemaPromise = null;
    }
  });

  return storeProductSchemaPromise;
}

export async function readStoreProductsStore(options = {}) {
  await ensureStoreProductTables();

  const includeArchived = options?.includeArchived === true;
  const whereClause = includeArchived
    ? ''
    : `WHERE status = 'active'`;

  const result = await pool.query(`
    SELECT
      product_id,
      title,
      description,
      details,
      image_url,
      image_urls,
      price_amount,
      bp_value,
      stock_count,
      status,
      sort_order,
      created_at,
      updated_at
    FROM charge.store_products
    ${whereClause}
    ORDER BY sort_order ASC, LOWER(title) ASC, created_at ASC
  `);

  return result.rows
    .map(mapDbStoreProductToAppProduct)
    .filter(Boolean);
}

export async function writeStoreProductsStore(products = []) {
  await ensureStoreProductTables();

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM charge.store_products');

    const safeProducts = Array.isArray(products) ? products : [];
    for (let index = 0; index < safeProducts.length; index += 1) {
      const row = mapAppStoreProductToDbStoreProduct(safeProducts[index], index);
      if (!row.product_id || !row.title) {
        continue;
      }

      await client.query(`
        INSERT INTO charge.store_products (
          product_id,
          title,
          description,
          details,
          image_url,
          image_urls,
          price_amount,
          bp_value,
          stock_count,
          status,
          sort_order
        )
        VALUES (
          $1, $2, $3, $4::jsonb, $5, $6::jsonb, $7, $8, $9, $10, $11
        )
      `, [
        row.product_id,
        row.title,
        row.description,
        JSON.stringify(row.details),
        row.image_url,
        JSON.stringify(row.image_urls),
        row.price_amount,
        row.bp_value,
        row.stock_count,
        row.status,
        row.sort_order,
      ]);
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }

  return readStoreProductsStore({ includeArchived: true });
}
