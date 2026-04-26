# Public Store Experience (store.html, store-product.html, store-checkout.html)

## Overview

- Refactored the public storefront into a browse-first, Shopify-style flow with three pages:
  - `/store` for product grid browsing only
  - `/store/product` for individual product details
  - `/store/checkout` for checkout only
- Removed upfront checkout UI from the storefront landing page.
- Kept the existing green/slate color direction while adding a reusable top navbar and cleaner page hierarchy.

## Update (2026-04-13) - Guest/Free Checkout Payload Identity Isolation

### What Was Changed

- Updated public checkout payload builder in `storefront-shared.js` so checkout requests in:
  - `guest`
  - `free-account`
  modes no longer forward session-linked `buyerUserId` / `buyerUsername`.

### Why

- Public guest/free checkout should persist as guest/unlinked identity unless backend free-account registration explicitly links a created member.
- Session-linked identity leakage could cause guest checkouts to be stored as linked-member invoices and disappear from guest-attribution follow-up views.

### Files Affected

- `storefront-shared.js`
- `Claude_Notes/public-store-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Validation

- `node --check storefront-shared.js` passed.

## Update (2026-04-06) - User Dashboard My Store Redesign (No Checkout In Dashboard Store View)

### What Was Changed

- Redesigned member dashboard `My Store` storefront section in `index.html` to a cleaner product-browse experience.
- Removed dashboard-store checkout/cart UI blocks from user side:
  - removed checkout form section from `My Store` view
  - removed order summary/cart board from `My Store` view
  - removed checkout-focused CTAs in storefront/product detail area
- Added a new visual hierarchy for user-side store management:
  - `My Storefront` hero with shareable-link emphasis
  - refreshed product card treatment (image-first, BV + stock badges, concise details)
  - simplified product details layout with focused commerce metadata
  - actions now prioritize link-sharing and opening the live/public store

### Files Affected

- `index.html`
- `Claude_Notes/public-store-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Design Decisions

- Kept the member dashboard experience lightweight: browse + details + share/open live store.
- Preserved backend/admin catalog connection and product rendering pipeline so user-side cards still reflect current admin product setup.
- Left checkout/invoice logic in code for compatibility with existing flows outside this dashboard UI path.

### Validation

- Inline scripts parse check passed:
  - `All inline scripts parsed successfully.`
- Local render smoke screenshot:
  - `temporary screenshots/screenshot-47-my-store-redesign-pass1.png`

### Known Limitations

- Screenshot pass in this run captured unauthenticated shell/login state only; authenticated `My Store` screenshot requires session automation context.

## Update (2026-04-06) - User Dashboard My Store Flow Correction (Keep Checkout In-System)

### What Was Changed

- Corrected the member dashboard store flow so checkout stays inside `index.html` My Store flow.
- Restored checkout/cart UI blocks in user dashboard store area:
  - checkout step view
  - checkout form
  - cart/order summary panel
- Reverted user-side store actions to internal cart flow:
  - product cards now use `Add To Cart`
  - product details now use `Add To Cart` and `Go To Checkout`
  - storefront header actions now include in-dashboard `Go To Checkout`
- Removed temporary public-store redirection action wiring from dashboard My Store.

### Files Affected

- `index.html`
- `Claude_Notes/public-store-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Design Decisions

- Kept the refreshed visual design language from the redesign pass while restoring the correct internal purchase path.
- Reused existing checkout validation + invoice/cart handlers to avoid backend side-effects.

### Validation

- Inline scripts parse check passed:
  - `Inline scripts parse OK.`

### Known Limitations

- Authenticated screenshot verification for the exact dashboard `My Store` checkout step was not executed in this pass (session automation context required).

## Update (2026-04-06) - User Dashboard My Store Stripe Checkout (In-System)

### What Was Changed

- Added Stripe payment support directly in member dashboard checkout (`index.html`), keeping the user in the same internal store flow.
- Added Stripe.js in dashboard shell and embedded Stripe Card Element in checkout form.
- Replaced manual card number/expiry/cvv form controls with Stripe-managed secure card input.
- Checkout action now:
  - creates Stripe payment intent via `/api/store-checkout/intent`
  - confirms card with Stripe Elements
  - then records order through existing internal invoice/BV logic in dashboard store flow

### Backend Support

- Updated `backend/services/store-checkout.service.js` discount resolver so payment intents from `member-dashboard` source can honor member discount percent (when buyer identity is present), while preserving existing guest/public behavior.

### Files Affected

- `index.html`
- `backend/services/store-checkout.service.js`
- `Claude_Notes/public-store-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Design Decisions

- Preserved existing dashboard invoice/BV pipeline to avoid regression in compensation logic while adding Stripe payment confirmation.
- Kept flow strictly in-system for member-side checkout.

### Validation

- Frontend inline scripts parse passed.
- Backend syntax checks passed for updated store-checkout service and related controller/route.
- API smoke checks:
  - `GET /api/store-checkout/config`
  - `POST /api/store-checkout/intent`

### Known Limitations

- Live backend restart is required to activate updated discount-resolution behavior if existing server process was already running.

## Update (2026-04-06) - User Dashboard Stripe Card Theme Awareness (Dark/Light)

### What Was Changed

- Updated `index.html` member dashboard Stripe card rendering so card text/input colors follow app theme mode.
- Added Stripe appearance resolver:
  - dark theme -> `night` appearance with high-contrast light text
  - light theme -> `stripe` appearance with dark text
- Added live appearance sync so Stripe card updates when user switches theme in dashboard settings.

### Files Affected

- `index.html`
- `Claude_Notes/public-store-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Design Decisions

- Used Stripe Elements appearance update API instead of remounting to avoid flicker and preserve current field focus/state.

### Validation

- Frontend inline scripts parse passed:
  - `All inline scripts parsed successfully.`

### Known Limitations

- Visual confirmation requires an authenticated dashboard session where checkout view is open while toggling theme.

## Update (2026-04-06) - Admin My Store Mobile Rows Simplified (Normal List Style)

### What Was Changed

- Simplified Admin `My Store` mobile product row UI to a normal list style.
- Removed mobile segmented metric containers and replaced with a compact row structure:
  - image + product name/id + status
  - one metadata line (`Price`, `Stock`, `BV`, `Updated`)
  - compact action button row
- Desktop grid/table mode remains unchanged.
- Product description preview remains hidden in admin list rows.

### Files Affected

- `admin.html`
- `Claude_Notes/public-store-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Design Decisions

- Aligned to user preference for a simpler mobile list presentation with fewer visual containers and reduced row height.
- Preserved all management actions and status logic.

### Validation

- Inline script parse check passed:
  - `admin.html` inline scripts parse OK (`2` script blocks)

### Known Limitations

- Screenshot automation attempts remain blocked in this environment (`ERR_CONNECTION_REFUSED` to `127.0.0.1:5500`).

## Update (2026-04-06) - Admin My Store Product List Mobile Optimization + Description Removal

### What Was Changed

- Removed product description preview text from Admin `My Store` product list rows.
- Admin product list now displays name + product ID only in the identity block.
- Optimized admin product list rows for mobile:
  - larger, better-framed product thumbnails on mobile
  - labeled metric rows for `Price`, `Inventory`, and `Updated`
  - mobile status badge shown within product identity row
  - action buttons arranged as a 2-column mobile action grid

### Files Affected

- `admin.html`
- `Claude_Notes/public-store-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Design Decisions

- Kept desktop table parity while enhancing mobile scanability and touch-target clarity.
- Product description remains available in product editor; removed only from list preview display.

### Validation

- Inline script parse check passed:
  - `admin.html` inline scripts parse OK (`2` script blocks)
- Render audit confirms product description is no longer emitted in admin list row markup.

### Known Limitations

- Screenshot automation attempts to `http://127.0.0.1:5500/admin.html` still failed with `ERR_CONNECTION_REFUSED` in this runtime environment.

## Update (2026-04-06) - Product Media Interaction Rule (No Drag / No Highlight)

### What Was Changed

- Added interaction locks on product media to prevent drag and selection/highlight behavior.
- Applied rules to product images in:
  - public store product cards
  - public product page hero image
  - public product page thumbnail gallery
  - dashboard store product grid
  - dashboard selected product image
  - admin product preview/list thumbnails

### Files Affected

- `store.html`
- `store-product.html`
- `index.html`
- `admin.html`
- `Claude_Notes/public-store-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Design Decisions

- Used element-level attributes/classes to keep behavior explicit on product media only:
  - `draggable="false"`
  - `select-none`
  - `-webkit-user-drag: none;`
- Avoided global image rules to reduce unintended side effects on unrelated UI icons/media.

### Validation

- Product media render paths verified to include non-drag/non-select attributes in all affected storefront/admin product views.

### Known Limitations

- Non-product media across the rest of the app remains unchanged by design.

## Update (2026-04-06) - Product Media Ratio Standardization (4:5)

### What Was Changed

- Updated storefront product media presentation to `4:5` portrait ratio across:
  - public store product cards (`store.html`)
  - public product detail hero + thumbnail gallery (`store-product.html`)
  - dashboard `My Store` product grid + selected product image (`index.html`)
- Updated fallback product placeholder defaults to a `4:5` image source:
  - `https://placehold.co/1000x1250?text=Product`

### Files Affected

- `store.html`
- `store-product.html`
- `index.html`
- `storefront-shared.js`
- `admin.html`
- `backend/services/store-product.service.js`
- `backend/stores/store-product.store.js`
- `Claude_Notes/public-store-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Design Decisions

- Used `aspect-[4/5]` on product media elements so ratio is enforced consistently without hardcoded height utilities.
- Kept `object-cover` behavior to preserve visual consistency for existing uploaded images.
- Matched admin guidance text and admin thumbnail previews to the same ratio to keep upload expectations aligned with storefront rendering.

### Validation

- Syntax checks passed:
  - `node --check storefront-shared.js`
  - `node --check backend/services/store-product.service.js`
  - `node --check backend/stores/store-product.store.js`
- Ratio/default audit passed:
  - no remaining `960x560` product placeholder references in active source files.

### Known Limitations

- Non-`4:5` source images still rely on crop behavior via `object-cover`.

## Update (2026-04-06) - Dashboard My Store Shareable Link Visibility

### What Was Changed

- Added a visible `Shareable Store Link` panel to the member dashboard `My Store` storefront view (`index.html`) so users can access and copy their store URL in the default store experience.
- Kept hidden setup-view link controls available with setup-scoped IDs and updated runtime link hydration/copy handlers to support both storefront and setup contexts.

### Files Affected

- `index.html`
- `Claude_Notes/public-store-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Design Decisions

- Prioritized the primary user path (storefront-first) for share-link visibility rather than requiring setup-tab navigation.
- Reused existing runtime store-link generation logic to avoid parallel link-building code paths.

### Validation

- Share-link element IDs verified for uniqueness in the storefront-visible implementation.
- Inline script parsing in `index.html` passed:
  - `Inline scripts parse OK: 2`

### Known Limitations

- Link output remains tied to session-resolved store identity (`storePublicCode`) and reflects current runtime user data.

## Update (2026-04-06) - Admin/Product Source Parity + Legacy Sample Product Removal

### What Was Changed

- Store product data is now strictly API-driven from persisted admin/server catalog data.
- Removed all sample-product fallback logic from:
  - backend product service seeding
  - `admin.html` product loader fallback
  - `index.html` dashboard store loader fallback
- Added legacy sample product filtering at API response layer so old demo SKUs are no longer returned:
  - `hydration-stack`
  - `daily-energy`
  - `recover-pack`
  - `immune-core`
  - `focus-nootropics`
  - `night-reset`
- Simplified dashboard `My Store` UI by removing high-noise scaffolding cards:
  - removed `My Store Workspace` board/tab switcher
  - removed `Storefront Flow` step indicator board
  - retained product/cart/checkout functional flow while presenting a cleaner product-first header.

### Files Affected

- `backend/services/store-product.service.js`
- `admin.html`
- `index.html`

### Design Decisions

- Prioritized single-source-of-truth behavior so user-facing store pages and admin views read the same canonical catalog.
- Prevented re-seeding/re-hydrating demo data to stop product drift between admin setup and user storefront.
- Kept existing cart/checkout logic intact while reducing visual complexity in dashboard store workspace.

### Validation

- Syntax checks passed:
  - `node --check backend/services/store-product.service.js`
  - `node --check backend/stores/store-product.store.js`
- Inline parse checks passed:
  - `index.html` inline scripts
  - `admin.html` inline scripts
- Runtime API check on fresh process (`PORT=3131`) confirms sample products are excluded:
  - `GET /api/store-products` -> `0` products with current sample-only DB state
  - `GET /api/admin/store-products` -> `0` products with current sample-only DB state
- Screenshot passes completed:
  - `temporary screenshots/screenshot-42-pass1-store-after-fix.png`
  - `temporary screenshots/screenshot-43-pass2-store-after-fix.png`

### Known Limitations

- If the catalog currently contains only legacy sample products and no custom products (for example `Metacharge`), storefront will show an empty-state message until a real product is saved from admin product management.

## Update (2026-04-06) - MetaCharge Product Restored

### What Was Changed

- Restored `MetaCharge` into the live store product catalog through admin API persistence.
- Catalog now contains exactly one active product:
  - `metacharge` (`MetaCharge`)
- Assigned existing uploaded media from `uploads/store-products/` to the product image gallery.

### Validation

- `GET /api/admin/store-products` returns:
  - `count: 1`
  - `MetaCharge:metacharge`
- `GET /api/store-products` returns:
  - `count: 1`
  - `MetaCharge:metacharge`
- Storefront visual confirmation:
  - `temporary screenshots/screenshot-44-metacharge-restored.png`

### Notes

- Because the previous catalog only contained legacy sample product IDs (now excluded from API output), the storefront appeared empty until `MetaCharge` was re-added.

## Files Added / Updated

- Added:
  - `store-product.html`
  - `store-checkout.html`
  - `storefront-shared.js`
- Updated:
  - `store.html`
  - `backend/app.js`

## Navigation and UX Structure

- Added a top navbar on all public store pages with:
  - `Home`
  - `Products`
  - `Support (Contact Us)`
  - `Member Login`
  - `Free Member Login`
- Storefront (`/store`) now focuses on browsing and pricing visibility only.
- Product detail (`/store/product`) now carries title, description, details list, price, quantity, and add-to-cart action.
- Checkout (`/store/checkout`) now hosts cart management and payment form in a dedicated page.

## Product Card / Pricing Changes

- Removed BV display from public product cards and public checkout visual summaries.
- Product cards now emphasize:
  - image
  - title
  - short description
  - price
  - “View Product” CTA

## Checkout Separation

- Checkout is no longer shown on `/store`.
- Cart and payment form are only rendered at `/store/checkout`.
- Public storefront now supports natural browse -> product -> checkout progression.

## Shared Frontend Logic

- Added `storefront-shared.js` to centralize:
  - product fetch (`GET /api/store-products`)
  - store-code normalization/persistence
  - cart state persistence and quantity controls
  - pricing/discount summary math
  - checkout submission (`POST /api/store-invoices`)
  - post-checkout BV credit sync (`POST /api/member-auth/record-purchase`)

## Backend Routing Changes

- Added route handlers in `backend/app.js`:
  - `GET /store/product`, `/store/product/`, `/store-product.html` -> `store-product.html`
  - `GET /store/checkout`, `/store/checkout/`, `/store-checkout.html` -> `store-checkout.html`
- Existing store route remains:
  - `GET /store`, `/store/`, `/store.html` -> `store.html`

## Validation

- `node --check` passed:
  - `backend/app.js`
  - `storefront-shared.js`
- Inline script syntax checks passed for:
  - `store.html`
  - `store-product.html`
  - `store-checkout.html`
- Local route smoke test (port `3131`) passed:
  - `/store` -> `200`
  - `/store/product?...` -> `200`
  - `/store/checkout?...` -> `200`

## Known Limitations

- Product stock reduction remains frontend-session-local after checkout.
- Support page copy is intentionally placeholder content and will be finalized later.

## Routing Hardening Update (2026-03-25)

- Updated shared navigation URL builders to use direct HTML targets:
  - `/store.html`
  - `/store-product.html`
  - `/store-checkout.html`
- This keeps product/checkout navigation stable even if the backend process has not been restarted after route changes.

## Refinement Update (2026-03-25)

- Storefront page updates:
  - removed visible member store code input block from product-grid page.
- Support updates:
  - changed nav label to `Support` and moved support content to dedicated page `store-support.html`.
- Product page updates:
  - removed `You might also like` section.
  - replaced list-based detail presentation with paragraph-style narrative description.
  - filtered BV references from product description display.
- Added route support:
  - `/store/support` aliases to `store-support.html` in backend route mapping.

## Product Image Update (2026-03-25)

- Added multi-image product support for storefront product detail pages:
  - `store-product.html` now renders a thumbnail strip when `product.images` includes more than one image.
  - clicking a thumbnail switches the main product image.
  - fallback remains fully compatible with products that only have a single `image` URL.
- Shared product normalization now supports:
  - `image` (primary)
  - `images[]` (gallery)
- Admin Product Management now supports direct local uploads:
  - new `Browse...` button uploads local image files.
  - upload endpoint:
    - `POST /api/admin/store-products/upload-image`
  - uploaded files are stored under:
    - `uploads/store-products/`
  - form auto-fills returned URL into `Primary Image URL`.
- Added optional admin field:
  - `Additional Image URLs (one per line)` for gallery-style product display.

## Description Parity Fix (2026-03-25)

- Product description rendering in `store-product.html` now mirrors admin content exactly.
- Removed auto-generated narrative synthesis that previously altered description text.
- Multi-line descriptions entered in admin now display as paragraph-separated text blocks on product page.

## Header Auth + Cart UX Update (2026-03-27)

- Replaced dual auth buttons in storefront headers with one consolidated `Login` CTA.
- Added a shared header login modal across storefront pages so users explicitly choose account type:
  - `Member Login`
  - `Preferred Account Login`
- Preserved session-aware navigation:
  - member sessions route to `Member Dashboard`
  - free-account sessions route to `My Dashboard` on preferred option
- Moved cart/checkout access to the header action area on the storefront flow for clearer, faster access.
- Updated pages:
  - `store.html`
  - `store-product.html`
  - `store-support.html`
  - `store-checkout.html`

## Login Modal Registration CTA Update (2026-03-27)

- Added a registration prompt in the header login modal:
  - `Don't have an account? Register now to get 15% discount on your checkout.`
- CTA now reuses checkout free-account registration behavior instead of introducing a separate registration page/process.
- Register CTA builds checkout links with:
  - existing store attribution when present
  - `mode=free-account`
  - `register=1`
- `store-checkout.html` now consumes these params to:
  - preselect free-account mode
  - auto-open existing free-account registration modal when cart contains items
  - show add-to-cart guidance first when cart is empty

## Registration CTA Modal UX Follow-Up (2026-03-27)

- Updated checkout registration-entry behavior so the free-account registration modal opens directly for `Register now` entry.
- In registration-entry mode, modal action text is now `Register` for clearer intent.
- If cart is empty, modal submit saves entered registration details and checkout displays next-step guidance to add products before payment completion.

## Dedicated Register Page Update (2026-03-27)

- Replaced `Register now` modal-entry flow with a dedicated registration page:
  - `store-register.html`
- Added route alias support:
  - `/store/register`
- Added shared navigation helper:
  - `buildRegisterUrl(storeCode)` in `storefront-shared.js`
- Header login modal `Register now` links now target the register page across storefront pages.
- Registration page captures free-account details and stores a registration draft payload for checkout handoff.
- Checkout now reads this draft and preloads free-account fields, allowing direct checkout continuation without requiring modal re-entry when data is already complete.

## Registration Note Field Removal (2026-03-27)

- Removed optional onboarding note field from:
  - `store-register.html`
  - free-account fallback modal in `store-checkout.html`
- This keeps registration UI focused on required account fields only.

## Store Branding Correction (2026-03-27)

- Corrected storefront-visible brand naming from `Charge` to `Premiere Life`.
- Updated storefront page titles to `Premiere Life Store - ...`.
- Updated storefront header brand label to `Premiere Life`.
- Updated storefront header badge initials from `CH` to `PL`.
- Applied to:
  - `store.html`
  - `store-product.html`
  - `store-support.html`
  - `store-checkout.html`
  - `store-login.html`
  - `store-password-setup.html`
  - `store-dashboard.html`
  - `store-register.html`

## Store Logo Asset Integration (2026-03-27)

- Replaced textual `PL` header badge markers with provided Premiere Life logo asset.
- Logo path used:
  - `/brand_assets/Logos/Premiere Life Logo_Transparent.svg`
- Applied across all storefront-facing pages for consistent top-bar branding.

## Logo-Only Header Branding (2026-03-27)

- Refined store header brand treatment to be logo-only:
  - removed adjacent `Premiere Life` text label and secondary header sublabel next to logo.
- Store headers now mirror the member-side branding direction where logo carries full brand identity.

## Header Logo Asset Swap to L&D Cropped (2026-03-27)

- Replaced store header logo source with:
  - `/brand_assets/Logos/L&D Logo_Cropped.svg`
- Implemented URL-encoded source in markup:
  - `/brand_assets/Logos/L%26D%20Logo_Cropped.svg`
- Updated header logo alt text to `L&D logo`.

## Header Logo Format Change to PNG (2026-03-27)

- Updated store header logo path from cropped SVG to cropped PNG:
  - `/brand_assets/Logos/L%26D%20Logo_Cropped.png`
- This change was applied across all storefront pages for consistent rendering.

## Header Checkout Icon Update (2026-03-27)

- Updated header checkout action from text button to icon button (cart icon) on storefront browse/support pages.
- Cart quantity remains visible via numeric badge attached to the icon button.

## Header Action/Nav Alignment Update (2026-03-27)

- Updated storefront header layout so action controls align with nav items rather than the logo row.
- Browse/support pages now keep:
  - logo in top row
  - nav links + right-aligned action controls (`Checkout` icon + `Login`) in nav row
- Checkout page header updated for consistency:
  - moved `Login` button from logo row into nav row alignment.
- Files updated:
  - `store.html`
  - `store-product.html`
  - `store-support.html`
  - `store-checkout.html`

## Register Page CTA + Terms Checkbox Update (2026-03-27)

- Updated register-page primary action label:
  - `Continue to Checkout` -> `Register`
- Updated top helper copy to align with register-first intent.
- Added terms consent control to the registration form:
  - checkbox text: `I have read and agree to the Terms and Agreements.`
  - registration submit now requires checkbox acceptance before proceeding.
- File updated:
  - `store-register.html`

## Checkout Registration Modal Terms Checkbox (2026-03-27)

- Added required terms consent checkbox to the free-account registration modal in checkout.
- Checkbox text matches register page:
  - `I have read and agree to the Terms and Agreements.`
- Modal now blocks submit and shows validation feedback until terms are accepted.
- File updated:
  - `store-checkout.html`

## Admin-Managed Legal Documents Integration (2026-03-27)

- Added shared storefront legal-doc fetch support via runtime settings API.
- Register page and checkout registration modal now render legal content managed from Admin `Settings -> Legal`.
- Documents supported:
  - Terms of Service
  - Agreement
  - Shipping Policy
  - Refund Policy
- Files updated:
  - `storefront-shared.js`
  - `store-register.html`
  - `store-checkout.html`

## Admin Legal Settings UX Restructure (2026-03-27)

- Updated admin legal authoring flow to a nested settings experience:
  - `Settings > Category > Legal > Specific > Edit`
- Removed inline side-by-side legal field layout from main Settings view.
- Added legal document category list + single-document editor flow.
- File updated:
  - `admin.html`

## Legal Content Rendering Upgrade (2026-03-27)

- Store legal document display now supports admin-authored rich text formatting.
- Added safe HTML sanitization before rendering legal content in storefront surfaces.
- Updated legal content blocks in:
  - `store-register.html`
  - `store-checkout.html`
- Shared sanitization utility updated in:
  - `storefront-shared.js`

## Admin Legal Rich-Text Toolbar Stability (2026-03-27)

- Improved admin legal rich-text toolbar reliability by preserving selection state across toolbar interactions.
- Link and clear actions now include fallback handling when browser command behavior is inconsistent.
- File updated:
  - `admin.html`

## Admin Legal Editor Engine Update (2026-03-27)

- Replaced custom legal rich-text command implementation with Quill editor for more reliable formatting behavior.
- Toolbar now uses native Quill controls with active-state handling.
- Admin styling updated so Quill toolbar/editor match current dark dashboard visual system.
- File updated:
  - `admin.html`

## Admin Legal Editor Formatting Controls Expansion (2026-03-27)

- Added heading controls in legal editor toolbar:
  - Body
  - Heading 1-5
- Improved link color + link tooltip theming to match admin visual style.
- File updated:
  - `admin.html`

## Unattributed Free Account Holding Behavior (2026-04-06)

- Updated public checkout attribution behavior for Free Account mode when no `store` query code is present.
- New behavior:
  - checkout intent proceeds with empty `attributionKey` (no forced fallback sponsor attribution).
  - successful free-account completion parks new account under admin holding sponsor routing (default `admin`, env-configurable).
  - this keeps no-attribution signups reassignable by admin without automatically crediting fallback upline ownership from missing referral links.

### Backend support added

- Admin placement API now supports sponsor reassignment in admin context:
  - route: `PATCH /api/admin/registered-members/:memberId/placement`
  - allows updating `sponsorUsername` and syncs linked member user `attributionStoreCode` to the reassigned sponsor.

### Files updated

- `backend/services/store-checkout.service.js`
- `backend/services/member.service.js`
- `backend/controllers/member.controller.js`

### Validation notes

- Fresh backend test on `PORT=3132` confirmed:
  - no-attribution free-account intent returns `checkout.attributionKey: ""`
  - attributed (`CHG-ZERO`) flow still returns `checkout.attributionKey: "CHG-ZERO"`
- Admin sponsor reassignment API test confirmed member sponsor + user attribution sync, with rollback applied.

## Dashboard Store Checkout Stripe Card Theme Fix (2026-04-06)

- Updated user dashboard (`index.html`) Stripe card field to avoid black text in dark mode.
- Added explicit theme-based Card Element style resolver and live theme-sync update hooks.
- Theme updates now refresh both:
  - Stripe appearance tokens
  - Card Element text/placeholder/icon colors
- Validation:
  - inline script parse passed:
    - `All inline scripts parsed successfully. Blocks: 2`

## Dashboard My Store Stripe Billing Country ISO Normalization (2026-04-12)

- Updated dashboard checkout Stripe billing payload in `index.html` to always send a 2-letter ISO country code.
- Added country normalization helper pipeline for billing country input:
  - full country label support (`United States` -> `US`)
  - common alias support (`USA`, `U.S.A.`, `UK`)
  - pass-through for already valid 2-letter codes.
- Added checkout validation guard:
  - blocks submit with a clear message when country cannot be resolved to valid Stripe code format.
- Outcome:
  - fixes Stripe confirm-card errors caused by full country names in billing country field.
- File updated:
  - `index.html`

## Update (2026-04-14) - Preferred Customer Store Front Redesign (Binary Tree Next My Store Match)

### What Was Changed

- Replaced `store.html` browse-only layout with a full-page Binary Tree Next My Store-inspired flow:
  - Catalog (featured + upgrade cards)
  - Review (single-selection quantity controls)
  - Checkout (summary + shipping/contact capture)
  - Thank-you (invoice status/details from completed Stripe session)
- Enforced Preferred-only checkout flow on storefront:
  - non-preferred sessions are blocked from checkout progression
  - explicit gate prompts login/registration
  - guest checkout UX removed from store page.
- Preserved hosted Stripe checkout session behavior and return completion polling.
- Replaced legacy `store-checkout.html` content with a redirect to `store.html` to preserve old links.

### Files Affected

- `store.html`
- `store-checkout.html`
- `Claude_Notes/public-store-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Design Decisions

- Kept the class naming and step progression close to Binary Tree Next My Store to reduce visual/interaction drift.
- Maintained API compatibility by retaining hosted checkout request shape while blocking non-preferred storefront purchases at the UI layer.

### Validation

- Inline script parse checks passed:
  - `store.html: parsed 1 inline script block(s)`
  - `store-checkout.html: parsed 1 inline script block(s)`

### Known Limitations

- Legacy `/store-checkout.html` is now a redirect-only path.
- Screenshot pass intentionally skipped per user direction.

## Update (2026-04-15) - Store Page Redesign to Match Registration Visual Language

### What Was Changed

- Replaced `store.html` visual structure with a cleaner, registration-aligned style system.
- New store surface now uses:
  - white background (`#FFFFFF`)
  - Inter typography
  - gray input/field surfaces (`#E2E2E2`)
  - placeholder color (`#444444`)
  - primary CTA color (`#077AFF`).
- Kept real storefront behavior in the redesigned layout:
  - loads products through shared storefront API
  - supports add/remove/update cart quantity
  - enforces preferred-account gate before checkout
  - submits checkout to Stripe via shared checkout helper
  - finalizes successful return sessions with checkout completion polling.

### Files Affected

- `store.html`
- `Claude_Notes/public-store-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Design Decisions

- Prioritized consistency with the newly refined registration page so both pages feel like one product flow.
- Preserved checkout and cart logic while replacing only UI structure and interaction presentation.

### Validation

- Inline script parse check passed for `store.html`.
- Required visual tokens verified in CSS (`#FFFFFF`, `#E2E2E2`, `#444444`, `#077AFF`, Inter).

## Update (2026-04-15) - Store Flow Shift to Cart-Only Stripe Checkout

### What Was Changed

- Reworked `store.html` flow to remove embedded checkout form.
- Store now supports:
  - product browsing
  - cart management
  - single CTA to Stripe (`Continue to Stripe`).
- Added stricter purchase gate for non-members:
  - `Join us to purchase` callout is shown when no preferred session is present
  - add-to-cart and cart quantity/remove controls are disabled
  - Stripe CTA is disabled until preferred login exists.

### Files Affected

- `store.html`
- `Claude_Notes/public-store-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Design Decisions

- Removed checkout form duplication from storefront UI and kept payment flow centralized through Stripe.
- Preserved cart summary visibility (subtotal/discount/BV/total) even when purchase actions are locked.

### Validation

- Inline script parse check passed for `store.html`.

### Known Limitations

- Buyer and shipping fields are currently resolved from preferred session + saved profile/address fallbacks before Stripe redirect.

## Update (2026-04-15) - BV Removed from Preferred Store UI

### What Was Changed

- Removed BV display from `store.html` surfaces:
  - product card BV text removed
  - cart summary Business Volume line removed
  - post-checkout invoice meta no longer includes BV.

### Files Affected

- `store.html`
- `Claude_Notes/public-store-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Validation

- Search scan confirmed no `BV` labels remain in `store.html`.
- Inline script parse check passed for `store.html`.

## Update (2026-04-15) - Login-First Preferred Store and Auth Header Consistency

### Summary

- Converted `store.html` from mixed guest/storefront behavior into login-first flow:
  - guest view now prompts Preferred login/join.
  - authenticated preferred view contains store + cart + Stripe continue flow.
- Standardized authenticated store header expectations:
  - left: `Dashboard`, `Store`, `Support`
  - right: `Logout`
- Aligned header/nav behavior with scoped `?store=` attribution links on:
  - `store.html`
  - `store-dashboard.html`
  - `store-support.html`

### Files Updated

- `store.html`
- `store-dashboard.html`
- `store-support.html`

### Notes

- Existing Stripe continuation logic remains active from cart.
- Guest purchase path is now gated out at the storefront layer.

### Validation

- Inline script parse check passed for all updated pages.

## Update (2026-04-15) - UI Metadata Cleanup + Session Clear Hardening

### Summary

- Removed preferred-facing metadata clutter:
  - dashboard hero chips (`Username`, `Email`, `Store Link`) removed.
  - logged-in store meta pills (`Store Link`, `Preferred account purchase flow`) removed.
- Strengthened logout/account switching:
  - introduced shared `clearUserSession()` in `storefront-shared.js`.
  - clears session from local/session storage and cookie across host + parent domain candidates.
  - logout now redirects with `?logout=1&t=...` and login consumes it to force clean state.
  - added auth-change storage listeners on store pages for cross-tab session consistency.

### Files Updated

- `store.html`
- `store-dashboard.html`
- `store-support.html`
- `storefront-shared.js`
- `login.html`

### Validation

- `node --check storefront-shared.js` passed.
- inline non-module script parse check passed for updated html pages.

## Update (2026-04-15) - MetaCharge Product Image Source Switched to NOBG Asset

### Summary

- Enforced MetaCharge bottle imagery to use brand asset:
  - `/brand_assets/Product%20Images/MetaCharge%20Blue%20Bottle%20-%20NOBG.png`
- Added backend-level override in store product mapping so legacy/uploaded JPG paths do not override storefront rendering for MetaCharge.

### File Updated

- `backend/stores/store-product.store.js`

### Validation

- `node --check backend/stores/store-product.store.js` passed.

## Update (2026-04-15) - Store Product Card Image Hotfix

### Scope
- `store.html` rendering path only.

### Changes
- Added `resolveProductImage(product)` helper in store page script.
- MetaCharge id/title matches now force:
- `/brand_assets/Product%20Images/MetaCharge%20Blue%20Bottle%20-%20NOBG.png?v=20260415a`
- Added script cache-bust query to shared loader in `store.html`.

### Notes
- This is a storefront fail-safe while backend/API product image payloads are refreshed/restarted.

## Update (2026-04-16) - Header Navigation Trim

### Scope
- Public Preferred store page (`store.html`).

### Changes
- Removed guest `About Us` link from the top navigation.
- Guest header now shows:
  - Store
  - Support
  - Login

### Result
- Header is cleaner and aligned with the account-gated purchase journey.

## Update (2026-04-16) - Support Header Navigation Trim

### Scope
- Public store support page (`store-support.html`).

### Changes
- Removed guest `About Us` link from the top navigation.
- Guest support header now shows:
  - Store
  - Support
  - Login

### Result
- Support page header now matches the simplified store navigation flow.

## Update (2026-04-16) - Embedded Mode Added for Dashboard My Store Reuse

### What Was Changed

- Added embedded mode detection in `store.html` using `embedded=1` query parameter.
- Added embedded CSS adjustments to support in-dashboard rendering:
  - hide top nav in embedded mode
  - tighten page and hero spacing for panel embedding
  - mobile embedded width/padding overrides.
- Dashboard `index.html` now loads `store.html` in `My Store` via iframe and passes active store code.

### Files Affected

- `store.html`
- `index.html`
- `Claude_Notes/public-store-page.md`
- `Claude_Notes/member-dashboard-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Design Decisions

- Reused the latest public-store implementation as the source of truth for dashboard storefront UX.
- Kept full-page `store.html` behavior unchanged when not in embedded mode.

### Known Limitations

- Frame height is static in dashboard embed and may require follow-up auto-resize handling.

### Validation

- Inline script parse checks passed:
  - `store.html` (`2` blocks)
  - `index.html` (`3` blocks)

## Update (2026-04-16) - Embedded Mode Rollback After Dashboard Native Component Migration

### What Was Changed

- Removed temporary embedded-mode hooks added earlier in `store.html` (`embedded=1` handling and related CSS overrides).
- Dashboard now uses native in-page Store/Cart components in `index.html`, so public store page no longer needs embed-specific branch behavior.

### Files Affected

- `store.html`
- `index.html`
- `Claude_Notes/public-store-page.md`
- `Claude_Notes/member-dashboard-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Validation

- Inline script parse checks passed:
  - `store.html` (`1` block)
  - `index.html` (`3` blocks)

## Update (2026-04-22) - Storefront Checkout Tax Source Set to Stripe Tax

### What Changed

- Enabled `automatic_tax` on store Checkout Session creation in backend checkout service.
- Updated storefront cart summary copy to show total as pre-tax estimate before redirecting to Stripe.
- Updated member dashboard storefront cart summary copy to the same estimate language.

### Files Affected

- `backend/services/store-checkout.service.js`
- `store.html`
- `index.html`

### Notes

- Stripe now computes final tax at checkout using customer location/address details.
- In-app totals before redirect are estimates and can differ from Stripe final totals.

## Update (2026-04-22) - Preferred Customer Owner Settlement Routing Fix

### What Changed

- Fixed storefront owner resolution so checkout settlement targets actual store owner identity first.
- Resolver now matches in this order:
  1. `storeCode`
  2. `publicStoreCode`
  3. `attributionStoreCode` (only when uniquely matched)
- Applied same resolver behavior in both:
  - `backend/services/store-checkout.service.js`
  - `backend/services/invoice.service.js`

### Why

- Shared attribution codes on downline/preferred accounts could hijack owner mapping, causing:
  - wrong settlement package key
  - wrong owner BV math
  - missing effective owner BV credit.

### Recovery

- Corrected impacted preferred purchase invoice `INV-240937` to owner BV `38`.
- Applied one-time missing owner BV credit to `zeroone`.

### Files Affected

- `backend/services/store-checkout.service.js`
- `backend/services/invoice.service.js`
- `Claude_Notes/public-store-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`
- `Claude_Notes/member-dashboard-page.md`

## Update (2026-04-22) - Preferred Dashboard Checkout Attribution Fallback

### What Changed

- Added backend fallback owner attribution for Preferred-buyer checkouts when direct store link code is missing.
- Resolution now can infer owner from buyer-linked store codes (`attributionStoreCode` first, then `storeCode/publicStoreCode`) for Preferred flows.
- My Store dashboard checkout now includes routed `storeCode` in payload to avoid ambiguous attribution.

### Why

- Preferred checkout discount could apply, but owner BV/retail settlement depended on attribution context.
- Missing `storeCode` made owner routing brittle in dashboard-origin purchases.

### Files Affected

- `backend/services/store-checkout.service.js`
- `index.html`
- `Claude_Notes/public-store-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Validation

- `node --check backend/services/store-checkout.service.js` passed.
- `index.html` inline script parsing passed.

## Update (2026-04-25) - Reservation Buyer Checkout BV Credit Support

### What Changed

- In `backend/services/store-checkout.service.js`:
  - buyer BV credit write now opts into reservation-safe purchase credit (`allowPendingPersonalBvCredit: true`).
- In `backend/services/member.service.js`:
  - `recordMemberPurchase(...)` supports scoped reservation buyer BV write path.
  - reservation accounts receiving buyer BV remain `pending`.

### Why

- Reservation users need to purchase products and receive personal BV from dashboard store purchases without unlocking earning/enrollment capabilities.

### Files Affected

- `backend/services/store-checkout.service.js`
- `backend/services/member.service.js`
- `index.html`
- `Claude_Notes/public-store-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`
- `Claude_Notes/member-dashboard-page.md`

### Validation

- `node --check backend/services/member.service.js` passed.
- `node --check backend/services/store-checkout.service.js` passed.
- `index.html` inline script parse check passed.
