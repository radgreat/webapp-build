# Public Store Experience (store.html, store-product.html, store-checkout.html)

## Overview

- Refactored the public storefront into a browse-first, Shopify-style flow with three pages:
  - `/store` for product grid browsing only
  - `/store/product` for individual product details
  - `/store/checkout` for checkout only
- Removed upfront checkout UI from the storefront landing page.
- Kept the existing green/slate color direction while adding a reusable top navbar and cleaner page hierarchy.

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
