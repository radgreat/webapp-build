(function initializeStorefrontSharedScope() {
  const STORE_PRODUCTS_API = '/api/store-products';
  const STORE_CHECKOUT_CONFIG_API = '/api/store-checkout/config';
  const STORE_CHECKOUT_SESSION_API = '/api/store-checkout/session';
  const STORE_CHECKOUT_COMPLETE_API = '/api/store-checkout/complete';
  const STORE_CHECKOUT_INTENT_API = '/api/store-checkout/intent';
  const STORE_CHECKOUT_INTENT_COMPLETE_API = '/api/store-checkout/intent/complete';
  const RUNTIME_SETTINGS_API = '/api/runtime-settings';
  const LEGACY_STORE_CODE_ALIASES = Object.freeze({
    'CHG-7X42': 'CHG-ZERO',
  });
  const PUBLIC_DISCOUNT_PERCENT = 15;
  const PUBLIC_DISCOUNT_RATE = PUBLIC_DISCOUNT_PERCENT / 100;
  const MAX_CHECKOUT_DISCOUNT_PERCENT = 60;
  const DEFAULT_PRODUCT_IMAGE = 'https://placehold.co/960x560?text=Product';
  const CHECKOUT_MODE_GUEST = 'guest';
  const CHECKOUT_MODE_FREE_ACCOUNT = 'free-account';
  const AUTH_STORAGE_KEY = 'vault-auth-user';
  const AUTH_COOKIE_KEY = 'vault-auth-user-cookie';
  const FREE_ACCOUNT_PACKAGE_KEY = 'preferred-customer-pack';
  const FREE_ACCOUNT_RANK_KEY_SET = new Set(['preferred customer', 'free account', 'free']);

  const STORAGE_KEYS = Object.freeze({
    cart: 'charge-public-store-cart-v2',
    storeCode: 'charge-public-store-code-v2',
  });

  function normalizeText(value) {
    return String(value || '').trim();
  }

  function normalizeStoreCode(value) {
    const normalizedValue = normalizeText(value).toUpperCase().replace(/[^A-Z0-9-]/g, '');
    return LEGACY_STORE_CODE_ALIASES[normalizedValue] || normalizedValue;
  }

  function normalizeEmail(value) {
    const normalizedValue = normalizeText(value).toLowerCase();
    if (!normalizedValue) {
      return '';
    }
    return normalizedValue.includes('@') ? normalizedValue : '';
  }

  function normalizeMemberKey(value) {
    return normalizeText(value).toLowerCase();
  }

  function normalizeLegalDocuments(value = {}) {
    const source = value && typeof value === 'object' ? value : {};
    return {
      termsOfService: normalizeText(source.termsOfService),
      agreement: normalizeText(source.agreement),
      shippingPolicy: normalizeText(source.shippingPolicy),
      refundPolicy: normalizeText(source.refundPolicy),
    };
  }

  function toWholeNumber(value, fallback = 0) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
      return fallback;
    }
    return Math.max(0, Math.floor(numericValue));
  }

  function roundCurrency(value) {
    return Math.round((Math.max(0, Number(value) || 0) + Number.EPSILON) * 100) / 100;
  }

  function normalizeDiscountPercent(value, fallbackPercent = PUBLIC_DISCOUNT_PERCENT) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
      return Math.max(0, Math.min(MAX_CHECKOUT_DISCOUNT_PERCENT, Number(fallbackPercent) || 0));
    }

    return Math.max(0, Math.min(MAX_CHECKOUT_DISCOUNT_PERCENT, Math.round(numericValue * 100) / 100));
  }

  function resolveCheckoutDiscountPercent(checkoutMode, requestedDiscountPercent) {
    if (checkoutMode !== CHECKOUT_MODE_FREE_ACCOUNT) {
      return 0;
    }
    return normalizeDiscountPercent(requestedDiscountPercent, PUBLIC_DISCOUNT_PERCENT);
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.max(0, Number(value) || 0));
  }

  function formatInteger(value) {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(
      Math.max(0, Number(value) || 0),
    );
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function isSafeLegalHref(hrefValue) {
    const normalizedHref = normalizeText(hrefValue).toLowerCase();
    if (!normalizedHref) {
      return false;
    }
    return (
      normalizedHref.startsWith('http://')
      || normalizedHref.startsWith('https://')
      || normalizedHref.startsWith('mailto:')
      || normalizedHref.startsWith('tel:')
      || normalizedHref.startsWith('/')
      || normalizedHref.startsWith('#')
    );
  }

  function sanitizeLegalHtml(value) {
    const rawValue = String(value || '').trim();
    if (!rawValue) {
      return '';
    }

    const hasHtmlTag = /<\/?[a-z][\s\S]*>/i.test(rawValue);
    const sourceHtml = hasHtmlTag
      ? rawValue
      : escapeHtml(rawValue).replace(/\r?\n/g, '<br>');
    const parser = new DOMParser();
    const parsedDocument = parser.parseFromString(`<div>${sourceHtml}</div>`, 'text/html');
    const wrapper = parsedDocument.body.firstElementChild;
    if (!wrapper) {
      return '';
    }

    const allowedTags = new Set(['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote']);

    function sanitizeNode(node) {
      const childNodes = Array.from(node.childNodes || []);
      childNodes.forEach((childNode) => {
        if (childNode.nodeType === Node.COMMENT_NODE) {
          childNode.remove();
          return;
        }

        if (childNode.nodeType !== Node.ELEMENT_NODE) {
          return;
        }

        const tagName = String(childNode.tagName || '').toLowerCase();
        if (!allowedTags.has(tagName)) {
          const replacementTextNode = parsedDocument.createTextNode(childNode.textContent || '');
          childNode.replaceWith(replacementTextNode);
          return;
        }

        const hrefValue = tagName === 'a'
          ? String(childNode.getAttribute('href') || '').trim()
          : '';

        Array.from(childNode.attributes || []).forEach((attributeNode) => {
          childNode.removeAttribute(attributeNode.name);
        });

        if (tagName === 'a') {
          if (!isSafeLegalHref(hrefValue)) {
            const anchorReplacementNode = parsedDocument.createTextNode(childNode.textContent || '');
            childNode.replaceWith(anchorReplacementNode);
            return;
          }
          childNode.setAttribute('href', hrefValue);
          childNode.setAttribute('target', '_blank');
          childNode.setAttribute('rel', 'noopener noreferrer');
        }

        sanitizeNode(childNode);
      });
    }

    sanitizeNode(wrapper);
    return String(wrapper.innerHTML || '').trim();
  }

  function safeStorageGet(storage, key) {
    try {
      if (!storage) {
        return null;
      }
      return storage.getItem(key);
    } catch {
      return null;
    }
  }

  function safeStorageSet(storage, key, value) {
    try {
      if (!storage) {
        return false;
      }
      storage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  function safeStorageRemove(storage, key) {
    try {
      if (!storage) {
        return false;
      }
      storage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }

  function parseJsonOrFallback(rawValue, fallbackValue) {
    if (typeof rawValue !== 'string' || !rawValue.trim()) {
      return fallbackValue;
    }

    try {
      return JSON.parse(rawValue);
    } catch {
      return fallbackValue;
    }
  }

  function parseSessionPayload(rawValue) {
    if (!rawValue) {
      return null;
    }

    try {
      const parsed = JSON.parse(rawValue);
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch {
      return null;
    }
  }

  function readCookieValue(key) {
    const source = document.cookie || '';
    const encodedKey = `${encodeURIComponent(key)}=`;
    const pairs = source.split(';');

    for (const pair of pairs) {
      const trimmedPair = pair.trim();
      if (!trimmedPair.startsWith(encodedKey)) {
        continue;
      }
      return decodeURIComponent(trimmedPair.slice(encodedKey.length));
    }

    return null;
  }

  function readUserSession() {
    const localSession = parseSessionPayload(safeStorageGet(window.localStorage, AUTH_STORAGE_KEY));
    if (localSession) {
      return localSession;
    }

    const tabSession = parseSessionPayload(safeStorageGet(window.sessionStorage, AUTH_STORAGE_KEY));
    if (tabSession) {
      return tabSession;
    }

    return parseSessionPayload(readCookieValue(AUTH_COOKIE_KEY));
  }

  function isFreeAccountUser(user) {
    if (!user || typeof user !== 'object') {
      return false;
    }

    const packageKey = normalizeMemberKey(user?.enrollmentPackage);
    if (packageKey === FREE_ACCOUNT_PACKAGE_KEY) {
      return true;
    }

    const rankKey = normalizeMemberKey(user?.accountRank || user?.rank);
    return FREE_ACCOUNT_RANK_KEY_SET.has(rankKey);
  }

  function normalizeProductImages(imagesValue = [], fallbackImage = '') {
    const collectedImages = [];
    if (Array.isArray(imagesValue)) {
      imagesValue.forEach((imageValue) => {
        collectedImages.push(normalizeText(imageValue));
      });
    } else if (typeof imagesValue === 'string') {
      imagesValue
        .split(/\r?\n|,/)
        .forEach((imageValue) => {
          collectedImages.push(normalizeText(imageValue));
        });
    }

    const normalizedFallback = normalizeText(fallbackImage);
    if (normalizedFallback) {
      collectedImages.unshift(normalizedFallback);
    }

    const uniqueImages = [];
    const seenImages = new Set();
    collectedImages.forEach((imageValue) => {
      if (!imageValue || seenImages.has(imageValue)) {
        return;
      }
      seenImages.add(imageValue);
      uniqueImages.push(imageValue);
    });

    if (uniqueImages.length === 0) {
      uniqueImages.push(DEFAULT_PRODUCT_IMAGE);
    }

    return uniqueImages.slice(0, 12);
  }

  function normalizeProduct(rawProduct, index = 0) {
    const title = normalizeText(rawProduct?.title || rawProduct?.name || `Product ${index + 1}`) || `Product ${index + 1}`;
    const id = normalizeText(rawProduct?.id || rawProduct?.slug || `product-${index + 1}`) || `product-${index + 1}`;
    const description = normalizeText(rawProduct?.description || `${title} description.`);
    const details = Array.isArray(rawProduct?.details)
      ? rawProduct.details.map((detail) => normalizeText(detail)).filter(Boolean)
      : [];
    const image = normalizeText(rawProduct?.image || rawProduct?.imageUrl || DEFAULT_PRODUCT_IMAGE);
    const images = normalizeProductImages(rawProduct?.images, image);
    const price = roundCurrency(rawProduct?.price);
    const bp = toWholeNumber(rawProduct?.bp, 0);
    const stock = toWholeNumber(rawProduct?.stock, 0);

    return {
      id,
      title,
      description,
      details,
      image: images[0] || DEFAULT_PRODUCT_IMAGE,
      images,
      price,
      bp,
      stock,
    };
  }

  function mapProductsById(products) {
    return new Map(
      (Array.isArray(products) ? products : []).map((product) => [product.id, product]),
    );
  }

  function normalizeCartLines(lines) {
    const safeLines = Array.isArray(lines) ? lines : [];
    const quantityByProduct = new Map();

    safeLines.forEach((line) => {
      const productId = normalizeText(line?.productId);
      if (!productId) {
        return;
      }

      const quantity = Math.max(0, toWholeNumber(line?.quantity, 0));
      if (quantity <= 0) {
        return;
      }

      quantityByProduct.set(productId, (quantityByProduct.get(productId) || 0) + quantity);
    });

    return Array.from(quantityByProduct.entries()).map(([productId, quantity]) => ({
      productId,
      quantity,
    }));
  }

  function readCart() {
    const rawCart = safeStorageGet(window.localStorage, STORAGE_KEYS.cart);
    const parsedCart = parseJsonOrFallback(rawCart, []);
    return normalizeCartLines(parsedCart);
  }

  function writeCart(lines) {
    const normalizedLines = normalizeCartLines(lines);
    safeStorageSet(window.localStorage, STORAGE_KEYS.cart, JSON.stringify(normalizedLines));
    return normalizedLines;
  }

  function clearCart() {
    safeStorageRemove(window.localStorage, STORAGE_KEYS.cart);
  }

  function sanitizeCartAgainstProducts(lines, products) {
    const productById = mapProductsById(products);
    const sanitizedLines = [];

    normalizeCartLines(lines).forEach((line) => {
      const product = productById.get(line.productId);
      if (!product || product.stock <= 0) {
        return;
      }

      const clampedQuantity = Math.min(product.stock, Math.max(1, line.quantity));
      if (clampedQuantity <= 0) {
        return;
      }

      sanitizedLines.push({
        productId: line.productId,
        quantity: clampedQuantity,
      });
    });

    return sanitizedLines;
  }

  function getCart(products = []) {
    const currentLines = readCart();
    if (!Array.isArray(products) || products.length === 0) {
      return currentLines;
    }

    const sanitizedLines = sanitizeCartAgainstProducts(currentLines, products);
    const serializedCurrent = JSON.stringify(normalizeCartLines(currentLines));
    const serializedSanitized = JSON.stringify(normalizeCartLines(sanitizedLines));

    if (serializedCurrent !== serializedSanitized) {
      writeCart(sanitizedLines);
    }

    return sanitizedLines;
  }

  function addToCart(productId, quantity = 1, products = []) {
    const normalizedProductId = normalizeText(productId);
    if (!normalizedProductId) {
      return {
        ok: false,
        message: 'Product is unavailable.',
        lines: getCart(products),
      };
    }

    const productById = mapProductsById(products);
    const product = productById.get(normalizedProductId);
    if (!product) {
      return {
        ok: false,
        message: 'Product is unavailable.',
        lines: getCart(products),
      };
    }

    if (product.stock <= 0) {
      return {
        ok: false,
        message: 'Product is out of stock.',
        lines: getCart(products),
      };
    }

    const requestedQuantity = Math.max(1, toWholeNumber(quantity, 1));
    const currentLines = getCart(products);
    const nextLines = currentLines.map((line) => ({ ...line }));

    const targetLine = nextLines.find((line) => line.productId === normalizedProductId);
    if (targetLine) {
      targetLine.quantity = Math.min(product.stock, targetLine.quantity + requestedQuantity);
    } else {
      nextLines.push({
        productId: normalizedProductId,
        quantity: Math.min(product.stock, requestedQuantity),
      });
    }

    const sanitizedLines = sanitizeCartAgainstProducts(nextLines, products);
    writeCart(sanitizedLines);

    return {
      ok: true,
      message: `${product.title} added to cart.`,
      lines: sanitizedLines,
    };
  }

  function updateCartQuantity(productId, quantity, products = []) {
    const normalizedProductId = normalizeText(productId);
    if (!normalizedProductId) {
      return getCart(products);
    }

    const nextQuantity = toWholeNumber(quantity, 0);
    const currentLines = getCart(products);
    let nextLines = currentLines
      .map((line) => ({ ...line }))
      .filter((line) => line.productId !== normalizedProductId);

    if (nextQuantity > 0) {
      nextLines.push({
        productId: normalizedProductId,
        quantity: nextQuantity,
      });
    }

    nextLines = sanitizeCartAgainstProducts(nextLines, products);
    writeCart(nextLines);
    return nextLines;
  }

  function removeFromCart(productId, products = []) {
    return updateCartQuantity(productId, 0, products);
  }

  function getActiveStoreCode() {
    const params = new URLSearchParams(window.location.search);
    const routeStoreCode = normalizeStoreCode(params.get('store'));
    if (routeStoreCode) {
      safeStorageSet(window.localStorage, STORAGE_KEYS.storeCode, routeStoreCode);
      return routeStoreCode;
    }

    return normalizeStoreCode(safeStorageGet(window.localStorage, STORAGE_KEYS.storeCode));
  }

  function setActiveStoreCode(storeCode) {
    const normalizedStoreCode = normalizeStoreCode(storeCode);
    if (!normalizedStoreCode) {
      safeStorageRemove(window.localStorage, STORAGE_KEYS.storeCode);
      return '';
    }

    safeStorageSet(window.localStorage, STORAGE_KEYS.storeCode, normalizedStoreCode);
    return normalizedStoreCode;
  }

  function buildStorefrontUrl(storeCode) {
    const normalizedStoreCode = normalizeStoreCode(storeCode);
    const url = new URL('/store.html', window.location.origin);
    if (normalizedStoreCode) {
      url.searchParams.set('store', normalizedStoreCode);
    }

    return `${url.pathname}${url.search}`;
  }

  function buildProductUrl(productId, storeCode) {
    const normalizedProductId = normalizeText(productId);
    const normalizedStoreCode = normalizeStoreCode(storeCode);
    const url = new URL('/store-product.html', window.location.origin);
    if (normalizedProductId) {
      url.searchParams.set('product', normalizedProductId);
    }
    if (normalizedStoreCode) {
      url.searchParams.set('store', normalizedStoreCode);
    }

    return `${url.pathname}${url.search}`;
  }

  function buildCheckoutUrl(storeCode) {
    const normalizedStoreCode = normalizeStoreCode(storeCode);
    const url = new URL('/store-checkout.html', window.location.origin);
    if (normalizedStoreCode) {
      url.searchParams.set('store', normalizedStoreCode);
    }

    return `${url.pathname}${url.search}`;
  }

  function buildSupportUrl(storeCode) {
    const normalizedStoreCode = normalizeStoreCode(storeCode);
    const url = new URL('/store-support.html', window.location.origin);
    if (normalizedStoreCode) {
      url.searchParams.set('store', normalizedStoreCode);
    }

    return `${url.pathname}${url.search}`;
  }

  function buildRegisterUrl(storeCode) {
    const normalizedStoreCode = normalizeStoreCode(storeCode);
    const url = new URL('/store-register.html', window.location.origin);
    if (normalizedStoreCode) {
      url.searchParams.set('store', normalizedStoreCode);
    }
    return `${url.pathname}${url.search}`;
  }

  function buildFreeLoginUrl(storeCode) {
    const normalizedStoreCode = normalizeStoreCode(storeCode);
    const url = new URL('/store-login.html', window.location.origin);
    if (normalizedStoreCode) {
      url.searchParams.set('store', normalizedStoreCode);
    }
    return `${url.pathname}${url.search}`;
  }

  function buildDashboardUrl(storeCode) {
    const normalizedStoreCode = normalizeStoreCode(storeCode);
    const url = new URL('/store-dashboard.html', window.location.origin);
    if (normalizedStoreCode) {
      url.searchParams.set('store', normalizedStoreCode);
    }
    return `${url.pathname}${url.search}`;
  }

  function buildContactUrl() {
    return 'mailto:support@premierelife.com?subject=Store%20Support';
  }

  function buildPublicStoreLink(storeCode) {
    const normalizedStoreCode = normalizeStoreCode(storeCode);
    const baseUrl = `${window.location.origin}/store.html`;
    if (!normalizedStoreCode) {
      return baseUrl;
    }
    return `${baseUrl}?store=${encodeURIComponent(normalizedStoreCode)}`;
  }

  function resolveCartSummary(lines, products, options = {}) {
    const safeLines = normalizeCartLines(lines);
    const productById = mapProductsById(products);
    const discountPercent = normalizeDiscountPercent(
      options?.discountPercent,
      PUBLIC_DISCOUNT_PERCENT,
    );
    const discountRate = discountPercent / 100;

    const subtotal = roundCurrency(safeLines.reduce((sum, line) => {
      const product = productById.get(line.productId);
      if (!product) {
        return sum;
      }
      return sum + (product.price * line.quantity);
    }, 0));

    const bp = safeLines.reduce((sum, line) => {
      const product = productById.get(line.productId);
      if (!product) {
        return sum;
      }
      return sum + (product.bp * line.quantity);
    }, 0);

    const discount = roundCurrency(subtotal * discountRate);
    const total = roundCurrency(subtotal - discount);

    return {
      itemCount: safeLines.reduce((sum, line) => sum + line.quantity, 0),
      subtotal,
      discount,
      total,
      discountPercent,
      bp: toWholeNumber(bp, 0),
    };
  }

  function resolveProductById(products, productId) {
    return (Array.isArray(products) ? products : []).find((product) => product.id === productId) || null;
  }

  async function fetchProducts() {
    const response = await fetch(STORE_PRODUCTS_API, {
      method: 'GET',
      cache: 'no-store',
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = typeof payload?.error === 'string' && payload.error.trim()
        ? payload.error.trim()
        : `Unable to load products (${response.status}).`;
      throw new Error(message);
    }

    const rawProducts = Array.isArray(payload?.products) ? payload.products : [];
    return rawProducts
      .map((product, index) => normalizeProduct(product, index))
      .filter((product) => product.stock > 0);
  }

  async function fetchLegalDocuments() {
    try {
      const response = await fetch(RUNTIME_SETTINGS_API, {
        method: 'GET',
        cache: 'no-store',
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = typeof payload?.error === 'string' && payload.error.trim()
          ? payload.error.trim()
          : `Unable to load runtime settings (${response.status}).`;
        throw new Error(message);
      }

      return {
        ok: true,
        legal: normalizeLegalDocuments(payload?.settings?.legal),
        payload,
      };
    } catch (error) {
      const message = error instanceof Error && error.message
        ? error.message
        : 'Unable to load legal documents.';
      return {
        ok: false,
        message,
        legal: normalizeLegalDocuments({}),
      };
    }
  }

  function validateCheckoutFields(fields, checkoutMode = CHECKOUT_MODE_GUEST) {
    const safeFields = fields && typeof fields === 'object' ? fields : {};
    const requiredFields = [
      ['buyerName', 'Buyer name'],
      ['buyerEmail', 'Buyer email'],
      ['shippingAddress', 'Shipping address'],
    ];

    for (const [fieldName, label] of requiredFields) {
      const value = normalizeText(safeFields[fieldName]);
      if (!value) {
        return {
          ok: false,
          message: `${label} is required.`,
        };
      }
    }

    const buyerEmail = normalizeEmail(safeFields.buyerEmail);
    if (!buyerEmail) {
      return {
        ok: false,
        message: 'Buyer email is invalid.',
      };
    }

    const freeAccountMemberUsername = normalizeText(safeFields.freeAccountMemberUsername);
    const freeAccountPhone = normalizeText(safeFields.freeAccountPhone);
    const freeAccountCountryFlag = normalizeText(safeFields.freeAccountCountryFlag).toLowerCase() || 'us';
    const freeAccountNotes = normalizeText(safeFields.freeAccountNotes);

    if (checkoutMode === CHECKOUT_MODE_FREE_ACCOUNT) {
      if (!freeAccountMemberUsername) {
        return {
          ok: false,
          message: 'Username is required for Free Account registration.',
        };
      }

      if (!/^[a-zA-Z0-9._-]{3,24}$/.test(freeAccountMemberUsername)) {
        return {
          ok: false,
          message: 'Username must be 3-24 characters and can include letters, numbers, dot, underscore, and dash.',
        };
      }

    }

    return {
      ok: true,
      fields: {
        buyerName: normalizeText(safeFields.buyerName),
        buyerEmail,
        shippingAddress: normalizeText(safeFields.shippingAddress),
        shippingMode: normalizeText(safeFields.shippingMode) || 'Standard Shipping',
        freeAccountMemberUsername,
        freeAccountPhone,
        freeAccountCountryFlag,
        freeAccountNotes,
      },
    };
  }

  function resolveCheckoutStartState(options = {}) {
    const products = Array.isArray(options.products) ? options.products : [];
    const requestedStoreCode = normalizeStoreCode(options.storeCode || getActiveStoreCode());

    const cartLines = getCart(products);
    if (cartLines.length === 0) {
      return {
        ok: false,
        message: 'Cart is empty. Add products before checkout.',
      };
    }

    const checkoutModeRaw = normalizeText(options.checkoutMode).toLowerCase();
    const checkoutMode = checkoutModeRaw === CHECKOUT_MODE_FREE_ACCOUNT
      ? CHECKOUT_MODE_FREE_ACCOUNT
      : CHECKOUT_MODE_GUEST;
    const discountPercent = resolveCheckoutDiscountPercent(
      checkoutMode,
      options.discountPercent,
    );

    const validation = validateCheckoutFields(options.checkoutFields, checkoutMode);
    if (!validation.ok) {
      return {
        ok: false,
        message: validation.message,
      };
    }

    const summary = resolveCartSummary(cartLines, products, { discountPercent });
    if (summary.total <= 0) {
      return {
        ok: false,
        message: 'Unable to create checkout for empty selection.',
      };
    }

    return {
      ok: true,
      products,
      requestedStoreCode,
      cartLines,
      validation,
      summary,
      checkoutMode,
      discountPercent,
    };
  }

  function buildCheckoutRequestPayload(state) {
    return {
      cartLines: state.cartLines,
      storeCode: state.requestedStoreCode,
      buyerName: state.validation.fields.buyerName,
      buyerEmail: state.validation.fields.buyerEmail,
      shippingAddress: state.validation.fields.shippingAddress,
      shippingMode: state.validation.fields.shippingMode,
      source: 'public-storefront',
      returnPath: buildCheckoutUrl(state.requestedStoreCode),
      memberStoreLink: buildPublicStoreLink(state.requestedStoreCode),
      discountPercent: state.discountPercent,
      checkoutMode: state.checkoutMode,
      freeAccountMemberUsername: state.validation.fields.freeAccountMemberUsername,
      freeAccountPhone: state.validation.fields.freeAccountPhone,
      freeAccountCountryFlag: state.validation.fields.freeAccountCountryFlag,
      freeAccountNotes: state.validation.fields.freeAccountNotes,
    };
  }

  async function fetchCheckoutConfig() {
    try {
      const response = await fetch(STORE_CHECKOUT_CONFIG_API, {
        method: 'GET',
        cache: 'no-store',
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = typeof payload?.error === 'string' && payload.error.trim()
          ? payload.error.trim()
          : `Unable to load Stripe checkout config (${response.status}).`;
        throw new Error(message);
      }

      const publishableKey = normalizeText(payload?.publishableKey);
      if (!publishableKey) {
        throw new Error('Stripe publishable key was not returned.');
      }

      return {
        ok: true,
        publishableKey,
        payload,
      };
    } catch (error) {
      const message = error instanceof Error && error.message
        ? error.message
        : 'Unable to load Stripe checkout config.';
      return {
        ok: false,
        message,
      };
    }
  }

  async function submitCheckout(options = {}) {
    const checkoutState = resolveCheckoutStartState(options);
    if (!checkoutState.ok) {
      return {
        ok: false,
        message: checkoutState.message,
      };
    }

    try {
      const response = await fetch(STORE_CHECKOUT_SESSION_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildCheckoutRequestPayload(checkoutState)),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = typeof payload?.error === 'string' && payload.error.trim()
          ? payload.error.trim()
          : `Unable to create Stripe checkout session (${response.status}).`;
        throw new Error(message);
      }

      const sessionUrl = normalizeText(payload?.sessionUrl);
      if (!sessionUrl) {
        throw new Error('Stripe checkout session was created without a redirect URL.');
      }

      return {
        ok: true,
        message: 'Redirecting to secure Stripe checkout...',
        redirectUrl: sessionUrl,
        sessionId: normalizeText(payload?.sessionId),
        payload,
        summary: checkoutState.summary,
      };
    } catch (error) {
      const message = error instanceof Error && error.message
        ? error.message
        : 'Unable to start Stripe checkout.';
      return {
        ok: false,
        message,
      };
    }
  }

  async function createCheckoutPaymentIntent(options = {}) {
    const checkoutState = resolveCheckoutStartState(options);
    if (!checkoutState.ok) {
      return {
        ok: false,
        message: checkoutState.message,
      };
    }

    try {
      const response = await fetch(STORE_CHECKOUT_INTENT_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildCheckoutRequestPayload(checkoutState)),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = typeof payload?.error === 'string' && payload.error.trim()
          ? payload.error.trim()
          : `Unable to create Stripe payment intent (${response.status}).`;
        throw new Error(message);
      }

      const clientSecret = normalizeText(payload?.clientSecret);
      const paymentIntentId = normalizeText(payload?.paymentIntentId);
      if (!clientSecret || !paymentIntentId) {
        throw new Error('Stripe payment intent did not return the required client secret.');
      }

      return {
        ok: true,
        message: 'Stripe payment is ready.',
        clientSecret,
        paymentIntentId,
        payload,
        summary: checkoutState.summary,
      };
    } catch (error) {
      const message = error instanceof Error && error.message
        ? error.message
        : 'Unable to start Stripe payment.';
      return {
        ok: false,
        message,
      };
    }
  }

  async function completeCheckoutSession(sessionId) {
    const normalizedSessionId = normalizeText(sessionId);
    if (!normalizedSessionId) {
      return {
        ok: false,
        completed: false,
        message: 'Checkout session ID is missing.',
      };
    }

    try {
      const response = await fetch(STORE_CHECKOUT_COMPLETE_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: normalizedSessionId,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = typeof payload?.error === 'string' && payload.error.trim()
          ? payload.error.trim()
          : `Unable to confirm checkout session (${response.status}).`;
        throw new Error(message);
      }

      const completed = payload?.completed === true;
      const alreadyProcessed = payload?.alreadyProcessed === true;
      if (completed) {
        clearCart();
      }

      if (!completed) {
        return {
          ok: true,
          completed: false,
          alreadyProcessed: false,
          message: 'Payment confirmation is still processing. Please refresh shortly.',
          payload,
        };
      }

      const invoiceLabel = normalizeText(payload?.invoice?.id) || 'Invoice';
      return {
        ok: true,
        completed: true,
        alreadyProcessed,
        invoice: payload?.invoice || null,
        message: alreadyProcessed
          ? `${invoiceLabel} was already confirmed.`
          : `${invoiceLabel} confirmed successfully.`,
        payload,
      };
    } catch (error) {
      const message = error instanceof Error && error.message
        ? error.message
        : 'Unable to confirm completed checkout.';
      return {
        ok: false,
        completed: false,
        message,
      };
    }
  }

  async function completeCheckoutPaymentIntent(paymentIntentId) {
    const normalizedPaymentIntentId = normalizeText(paymentIntentId);
    if (!normalizedPaymentIntentId) {
      return {
        ok: false,
        completed: false,
        message: 'Payment intent ID is missing.',
      };
    }

    try {
      const response = await fetch(STORE_CHECKOUT_INTENT_COMPLETE_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId: normalizedPaymentIntentId,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = typeof payload?.error === 'string' && payload.error.trim()
          ? payload.error.trim()
          : `Unable to confirm payment intent (${response.status}).`;
        throw new Error(message);
      }

      const completed = payload?.completed === true;
      const alreadyProcessed = payload?.alreadyProcessed === true;
      if (completed) {
        clearCart();
      }

      if (!completed) {
        return {
          ok: true,
          completed: false,
          alreadyProcessed: false,
          message: 'Payment confirmation is still processing. Please refresh shortly.',
          payload,
        };
      }

      const invoiceLabel = normalizeText(payload?.invoice?.id) || 'Invoice';
      return {
        ok: true,
        completed: true,
        alreadyProcessed,
        invoice: payload?.invoice || null,
        message: alreadyProcessed
          ? `${invoiceLabel} was already confirmed.`
          : `${invoiceLabel} confirmed successfully.`,
        payload,
      };
    } catch (error) {
      const message = error instanceof Error && error.message
        ? error.message
        : 'Unable to confirm completed payment.';
      return {
        ok: false,
        completed: false,
        message,
      };
    }
  }

  window.StorefrontShared = {
    STORAGE_KEYS,
    PUBLIC_DISCOUNT_PERCENT,
    PUBLIC_DISCOUNT_RATE,
    CHECKOUT_MODE_GUEST,
    CHECKOUT_MODE_FREE_ACCOUNT,
    normalizeText,
    normalizeStoreCode,
    normalizeLegalDocuments,
    sanitizeLegalHtml,
    toWholeNumber,
    roundCurrency,
    formatCurrency,
    formatInteger,
    escapeHtml,
    fetchProducts,
    fetchLegalDocuments,
    mapProductsById,
    resolveProductById,
    getActiveStoreCode,
    setActiveStoreCode,
    buildStorefrontUrl,
    buildProductUrl,
    buildCheckoutUrl,
    buildSupportUrl,
    buildRegisterUrl,
    buildFreeLoginUrl,
    buildDashboardUrl,
    buildContactUrl,
    readUserSession,
    isFreeAccountUser,
    readCart,
    writeCart,
    getCart,
    clearCart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    resolveCartSummary,
    fetchCheckoutConfig,
    submitCheckout,
    completeCheckoutSession,
    createCheckoutPaymentIntent,
    completeCheckoutPaymentIntent,
  };
})();
