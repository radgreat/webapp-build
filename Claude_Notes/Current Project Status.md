# Current Project Status

Last Updated: 2026-04-03

## Purpose

- Living status tracker for active scope, roadmap, and development gates.
- Updated continuously as work progresses.

## Recent Update (2026-04-03) - Global Claimable Title Catalog Added

- Added server-wide claimable title storage for achievement rewards.
- New table/store:
  - `charge.member_title_catalog`
  - file: `backend/stores/member-title-catalog.store.js`
- Achievement service now seeds and reads the global catalog, and validates title reward claims against active catalog entries.
- Catalog is now separate from per-user awards:
  - `member_title_catalog` = global claimable definitions
  - `member_title_awards` = user-level claimed titles
- Seeded active title:
  - `presidential-ambassador` (`Presidential Ambassador`)
- Files updated:
  - `backend/stores/member-title-catalog.store.js`
  - `backend/services/member-achievement.service.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation status:
  - `node --check backend/services/member-achievement.service.js` passed
  - `node --check backend/stores/member-title-catalog.store.js` passed
  - DB check confirms `charge.member_title_catalog` exists and seeded row is present

## Recent Update (2026-04-03) - Time-Limited Event Text Cleanup

- Removed event-card lines from Profile Achievements UI:
  - `Prerequisites: Legacy Builder Leadership Program`
  - `Account-bound title reward`
- Backend logic for event windows and claim eligibility is unchanged.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation status:
  - inline script parse passed for `index.html` (`Parsed 2 inline scripts successfully.`)

## Recent Update (2026-04-03) - Achievement Center Time-Limited Event + Account-Bound Title Storage

- Added new top-tab order in Profile Achievement Center:
  - `Time-Limited Event`
  - `Premiere Life`
- Added `Legacy Builder Leadership Program` category under `Time-Limited Event`.
- Added event achievement:
  - `1st Matrix Completion`
  - requirement: `Enroll 3 Legacy Package`
  - reward: `Title: Presidential Ambassador`
- Implemented server-side account title persistence for event rewards:
  - new DB-backed `member_title_awards` store/table
  - deduplicated by account + title slug
  - linked to source achievement claim metadata
- Added achievement payload support for server-awarded titles (`accountTitles`) and profile title fallback usage from awarded title records.
- Files updated:
  - `index.html`
  - `backend/services/member-achievement.service.js`
  - `backend/stores/member-title-award.store.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation status:
  - `node --check backend/services/member-achievement.service.js` passed
  - `node --check backend/stores/member-title-award.store.js` passed
  - inline script parse passed for `index.html` (`Parsed 2 inline scripts successfully.`)

## Recent Update (2026-04-03) - Hovered Username Badge Size Increased

- Increased badge chip size effect on hover/focus for stronger interaction feedback.
- Hover transform updated from `1.08` to `1.14`.
- Added hover/focus scaling for inner badge icon.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation screenshot:
  - `temporary screenshots/screenshot-6-profile-badge-hover-size-up.png`

## Recent Update (2026-04-03) - Circle Badge Icon Size Increased

- Increased profile username badge icon size inside circular chips for clearer visual weight.
- Updated icon dimension from `1.15rem` to `1.3rem`.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation screenshot:
  - `temporary screenshots/screenshot-5-profile-badge-icon-bigger.png`

## Recent Update (2026-04-03) - Badge Hover Card Rolled Back to Original V1 Styling

- Reverted profile username badge hover card back to the first approved visual version.
- Removed the added orange/green top-left circles from hover card UI.
- Restored the earlier compact hover card dimensions/spacing while retaining circular badge chips.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation screenshot:
  - `temporary screenshots/screenshot-4-profile-badge-hover-v1-restored.png`

## Recent Update (2026-04-03) - Profile Header Badge Icons + Discord-Style Hover + Edit Controls

- Profile header `@username` now supports ordered badge icons:
  - `Rank`
  - `Title`
  - `Extra`
- Added Discord-inspired badge hover card behavior:
  - large floating dark card
  - icon-focused hero area
  - title/subtitle text treatment
  - hover/focus-triggered reveal with pointer notch
- Added editable profile controls for badge system:
  - `Account Title` input
  - show/hide toggles for rank/title/extra badges
- Badge rendering is now re-synced when:
  - profile state changes
  - Good Life/achievement payloads refresh
  - theme changes
  - account rank snapshot updates
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation status:
  - inline script parse check passed for `index.html`
  - visual pass done in 2 rounds:
    - `temporary screenshots/screenshot-1-profile-badge-round1.png`
    - `temporary screenshots/screenshot-2-profile-badge-round2.png`

## Recent Update (2026-04-03) - Good Life Bound to Rank Advancement Monthly Run (Not Persistent Account Rank)

- Implemented monthly rank-run high watermark tracking for Rank Advancement in backend:
  - added DB-backed monthly progress table for rank run (`user_id + period_key`)
  - records highest rank milestone reached in the month and carries it forward until month reset
- Updated Rank Advancement evaluation behavior:
  - rank reward eligibility can now remain unlocked for the month if the member already hit the milestone earlier in the same month
  - monthly reset behavior remains period-key based (`YYYY-MM`)
- Updated Good Life monthly progression source:
  - Good Life no longer derives from persistent `accountRank`/title
  - Good Life now derives from Rank Advancement monthly run high watermark
- Account rank/title persistence behavior remains unchanged:
  - account rank can stay on the account record independent of monthly bonus loops
- Files updated:
  - `backend/services/member-achievement.service.js`
  - `backend/services/member-good-life.service.js`
  - `backend/stores/member-rank-advancement.store.js`

## Recent Update (2026-04-03) - Direct Sponsor Requirement Interpretation Applied

- Requirement numbers are now interpreted as **left/right pair counts**:
  - `1:1`, `2:2`, `3:3` ... through the rank tiers.
- `Direct Sponsor` is now enforced as **personally enrolled users** (users sponsored directly by the current account).
- Rank achievement validation now requires matched left/right direct sponsor counts plus existing cycle/activity/verification checks.
- Profile Achievement UI now shows:
  - direct sponsor pair progress (`Left X / Y | Right X / Y`)
  - header summary with direct pair snapshot (`Direct L:x R:y`)
- Files updated:
  - `backend/services/member-achievement.service.js`
  - `index.html`

## Recent Update (2026-04-03) - Rank Advancement Rules Wired into Profile Achievement Component

- Implemented rank advancement milestones from `brand_assets/MLM Business Logic.md` section `# 5️⃣ Rank Advancement Bonus`.
- Added profile achievement entries for Ruby through Royal Crown with cycle thresholds and payout values.
- Added server-side prerequisite checks for rank advancement claims:
  - cycle requirement
  - active-account requirement
  - system verification status
- Profile achievement UI now surfaces:
  - requirement summary
  - prerequisite summary
  - cycle progress
  - lock reason
  - monthly payout note after verification
- Updated profile status strip to show:
  - current rank
  - current cycles
  - current activity state
- Files updated:
  - `backend/services/member-achievement.service.js`
  - `index.html`
- Current status:
  - Rank tab is now functional and no longer placeholder-only.
  - Good Life and Rank Advancement tracks now coexist under the same profile achievement center.

## Recent Update (2026-04-03) - Draft Achievement Icon Pack Generated

- Created an initial SVG icon pack for profile Good Life achievements so icon placement can start immediately.
- Generated assets:
  - `diamond.svg`
  - `blue-diamond.svg`
  - `black-diamond.svg`
  - `crown.svg`
  - `double-crown.svg`
  - `royal-crown.svg`
- Location:
  - `brand_assets/Icons/Achievements/`
- Added asset note:
  - `brand_assets/Icons/Achievements/README.md`
- Status:
  - Icon assets are ready for UI hookup in achievement list rows.

## Recent Update (2026-04-03) - Profile Achievements Moved Server-Side (Authenticated Claims)

- Added a new profile achievement system in member app profile page:
  - top tabs: `Premiere Life`, `Rank`
  - left category rail
  - right achievement list with claim action state
  - claimed achievements display claim date
- Implemented `Good Life` category under `Premiere Life` using `MLM Business Logic.md` Good Life bonus values:
  - Diamond (`$500`)
  - Blue Diamond (`$1,000`)
  - Black Diamond (`$2,000`)
  - Crown (`$4,000`)
  - Double Crown (`$8,000`)
  - Royal Crown (`$12,500`)
- Added backend authenticated achievement APIs (no client-only claim persistence):
  - `GET /api/member-auth/achievements`
  - `POST /api/member-auth/achievements/:achievementId/claim`
- Added server-side auth session issuance on login:
  - login now returns `authToken` + `authTokenExpiresAt`
  - new protected endpoints require `Authorization: Bearer <token>`
- Added new PostgreSQL-backed schema installers/stores for:
  - `charge.member_auth_sessions`
  - `charge.member_achievement_claims`
- Added runtime DB install fallback:
  - if admin DB credentials fail, table install retries with service-role connection.
- Updated member login session persistence in:
  - `login.html`
  - `store-login.html`
  so auth token is retained client-side for authenticated API calls.

## Recent Update (2026-04-03) - Achievement Category Label Simplification

- Profile achievement left category item was refined to remove subtitle/caption text.
- Category now displays only the category label (`Good Life`) as requested.
- File updated:
  - `index.html`

## Recent Update (2026-04-03) - Good Life List Template Alignment

- Refined Good Life achievement rows to follow template copy/structure:
  - `Diamond`
  - `Reach Diamond Rank`
  - reward format `= $500` with claim/locked button on the right
- Applied same naming format to all Good Life items (`Blue Diamond`, `Black Diamond`, `Crown`, `Double Crown`, `Royal Crown`).
- Added frontend fallback Good Life item list so entries are visible in category view even before authenticated API hydration finishes.
- Files updated:
  - `index.html`
  - `backend/services/member-achievement.service.js`

## Recent Update (2026-04-03) - Good Life Row Copy Tightening

- Removed redundant locked-state helper subtext from Good Life rows (e.g., `Reach Royal Crown to claim this reward.`).
- Kept claim-date text only for already-claimed achievements.
- Removed leading `=` character from right-side reward amounts.
- File updated:
  - `index.html`

## Recent Update (2026-03-27) - Header Checkout Button Switched to Icon

- Header `Cart / Checkout` action was converted from text CTA to icon-based cart button.
- Cart count remains visible as a badge on the icon, preserving live count behavior.
- Applied to:
  - `store.html`
  - `store-product.html`
  - `store-support.html`

## Recent Update (2026-03-27) - Store Header Logo Switched to PNG

- Storefront header logo source was switched from the cropped SVG file to cropped PNG file.
- Current store header logo source:
  - `/brand_assets/Logos/L&D Logo_Cropped.png`

## Recent Update (2026-03-27) - Store Header Logo Swapped to L&D Cropped Asset

- Store header logo asset was switched to the requested logo file:
  - `brand_assets/Logos/L&D Logo_Cropped.svg`
- Applied across all storefront pages for consistent brand rendering.

## Recent Update (2026-03-27) - Store Headers Switched to Logo-Only Branding

- Store header branding now uses the provided Premiere Life logo as the sole brand mark (no extra brand text block).
- This matches the requested member-side branding style where logo is the full identity signal.
- Applied across all store-facing pages (store, product, support, checkout, login, password setup, dashboard, register).

## Recent Update (2026-03-27) - Provided Logo Applied in Store Headers

- Replaced the header `PL` badge mark with the provided Premiere Life logo asset on store pages.
- Asset used:
  - `brand_assets/Logos/Premiere Life Logo_Transparent.svg`
- Applied consistently to:
  - `store.html`
  - `store-product.html`
  - `store-support.html`
  - `store-checkout.html`
  - `store-login.html`
  - `store-password-setup.html`
  - `store-dashboard.html`
  - `store-register.html`

## Recent Update (2026-03-27) - Brand Naming Correction Applied

- Visible `Charge` brand text was corrected to `Premiere Life` in storefront and remaining audited app UI spots.
- Store pages now use `Premiere Life Store` titles and `Premiere Life` header branding with `PL` badge initials.
- Additional corrected labels:
  - `admin.html` brand wordmark
  - `index.html` wallet workspace label
- Internal storage keys using `charge-` prefix were intentionally left unchanged for compatibility and to avoid local-storage/session migration risk.

## Recent Update (2026-03-27) - Dedicated Registration Page Introduced

- `Register now` now routes to a dedicated registration page (`store-register.html`) instead of relying on immediate checkout modal entry.
- New route alias is active:
  - `/store/register`
- Registration page captures free-account details and hands them off to checkout via draft storage + route flags.
- Checkout now consumes registration draft data when present and allows direct `Register and Pay` flow without forcing modal re-entry.
- Registration modal remains available as fallback when required free-account data is missing.
- Store attribution continuity remains intact via register-link URL building and draft-based recovery when needed.

## Recent Update (2026-03-27) - Onboarding Note Removed from Registration UI

- Removed optional onboarding-note input from registration user experience.
- Applied to both dedicated register page and checkout fallback registration modal.
- Registration payload compatibility remains intact with empty-note handling.

## Recent Update (2026-03-27) - Login Modal: Register CTA Reusing Checkout Free-Account Flow

- Storefront login modals now include:
  - `Don't have an account? Register now to get 15% discount on your checkout.`
- `Register now` routes users to checkout using the existing free-account flow (reused, not duplicated), with URL state:
  - `mode=free-account`
  - `register=1`
- Checkout now honors that route state:
  - preselects free-account checkout mode
  - opens existing free-account registration modal when cart has items
  - if cart is empty, provides guidance to add products first and continue with `Register and Pay`
- Attribution behavior remains aligned:
  - no-attribution entry works without forcing store code
  - when browsing already has referral/store attribution, the same checkout registration path keeps that attribution in place

## Recent Update (2026-03-27) - Registration CTA UX Follow-Up

- `Register now` path now opens the free-account registration modal directly (modal-first behavior) on checkout entry.
- In this entry path, modal primary action label is now `Register`.
- Cart-aware completion logic:
  - with cart items: continues to payment flow
  - without cart items: saves registration details and prompts user to add products before final checkout

## Recent Update (2026-03-27) - Storefront Header UX: Single Login + Account-Type Modal

- Storefront header auth UX now uses one `Login` button instead of separate `Member Login` and `Free Member Login` buttons.
- Clicking `Login` opens an account-type modal with two clear paths:
  - `Member Login`
  - `Preferred Account Login`
- Session-aware destination behavior is preserved:
  - member sessions surface `Member Dashboard` in modal option routing.
  - free-account sessions surface `My Dashboard` on preferred option routing.
- Cart/checkout action was moved into the header action area (adjacent to Login) for faster and more intuitive checkout access.
- Applied on public storefront pages:
  - `store.html`
  - `store-product.html`
  - `store-support.html`
  - `store-checkout.html`

## Recent Update (2026-03-27) - Checkout No-Referral Flow + Guest/Free Dynamic Pricing

- Checkout now supports direct traffic without `?store=...` referral links.
- `Member Store Code` lock field is hidden when no referral/store code is present.
- Storefront + checkout now use URL-based referral detection for this flow, preventing stale stored store-code attribution on direct non-referral visits.
- Checkout mode pricing is now dynamic and enforced end-to-end:
  - `Guest` mode: no preferred discount (regular price).
  - `Free Account` mode: preferred discount enabled (`15%`).
- Free-account checkout hint copy now includes an e-commerce caption: `Enjoy 15% discount.`
- Checkout UI cleanup applied:
  - removed top-page discount badge
  - summary line now reads `Discount`
  - discount line is hidden in guest mode
  - guest CTA now reads `Pay Now`
- Backend attribution behavior now branches for no-referral checkouts:
  - `Guest` no-referral: remains non-attributed path.
  - `Free Account` no-referral: routes attribution to authorized fallback sponsor account (configurable), enabling preferred-customer account creation.
- Operational/configuration note:
  - fallback sponsor can be set via:
    - `CHECKOUT_FALLBACK_SPONSOR_USERNAME`
    - `STORE_CHECKOUT_FALLBACK_SPONSOR_USERNAME`
    - `PREFERRED_CUSTOMER_FALLBACK_SPONSOR_USERNAME`
  - if no eligible fallback sponsor exists, free-account no-referral checkout returns `503`.
- Tax handling status:
  - tax remains pending/not yet implemented; this update handles discount and attribution behavior only.

## Recent Update (2026-03-27) - Placement Strategy Controls Expanded (Preferred Customer + Enrollment)

- Placement controls now follow six explicit modes:
  - `Left`
  - `Right`
  - `Spill Over Left`
  - `Spill Over Right`
  - `Spillover Extreme Left`
  - `Spillover Extreme Right`
- Direct-leg controls (`Left`/`Right`) are treated as level-1 intent controls in enroll/planner validation.
- Spillover parent assignment controls remain active only for spillover-side modes.
- Preferred Customer manual `Assigned Parent` now supports free typing (username/member ID) with suggestion list retained.
- Binary tree placement interpretation now supports side-specific spillover options plus far-edge extreme strategies.
- Backend normalization now accepts side-specific spillover aliases for compatibility.
- Current state:
  - placement controls now match the requested planning language used by sponsor workflows.

## Recent Update (2026-03-26) - All User Store-Code Validation + Legacy Alias Recovery

- Checkout error for `CHG-7X42` is now addressed with compatibility mapping:
  - `CHG-7X42 -> CHG-ZERO`
- Dashboard/store defaults aligned to `CHG-ZERO` to avoid stale copied public links/codes.
- Validation run completed across all current users:
  - all user `storeCode/publicStoreCode/attributionStoreCode` paths resolve.
  - no unresolved attribution references found.
  - legacy `CHG-7X42` now resolves to current owner path (`zeroone` via `CHG-ZERO`).
- Checkout routing validation across all user codes:
  - store-code lookup failures are resolved.
  - current test result now proceeds to Stripe API validation layer (expected `Invalid API Key` in validation run using placeholder key).

## Recent Update (2026-03-26) - Stripe Checkout Transition Implemented

- Storefront checkout is now routed through Stripe-hosted Checkout Sessions.
- New backend checkout APIs are active:
  - `POST /api/store-checkout/session`
  - `POST /api/store-checkout/complete`
- Store checkout page now:
  - collects buyer/shipping context
  - redirects to Stripe for payment
  - verifies session on return (`checkout=success`) and finalizes invoice + owner BV credit.
- Invoice finalization now supports idempotent invoice IDs from checkout metadata to prevent duplicate completion.
- Operational note:
  - if `STRIPE_SECRET_KEY` is missing, checkout session creation returns `503` with configuration guidance.
- Current phase state:
  - Stripe transition for public storefront checkout flow is implemented and wired.
  - next optional phase is expanding Stripe session flow into the in-app member store checkout experience if desired.

## Recent Update (2026-03-26) - Preferred Customer Auto-Enrollment on Successful Store Checkout

- Debug fix for reported issue where paid checkout buyers were not appearing in the store owner `Preferred Customers` page.
- Checkout finalization now attempts auto-enrollment for the buyer as `Free Account` (`preferred-customer-pack`) under the attributed store owner sponsor line.
- Auto-enrollment runs before invoice finalization and is idempotent:
  - existing buyer account email -> reuses account identity
  - new buyer email -> creates pending free account + registered member record
  - race conflict (`409`) -> resolves buyer identity after conflict and continues
- Invoice finalization now stores resolved buyer identity fields when available (`buyerUserId`, `buyerUsername`, `buyerEmail`) to improve planner matching reliability.
- Owner BV credit behavior remains unchanged (credited to attributed store owner; free buyer does not receive BV).
- Added one-time backfill utility for historical invoices created before the fix:
  - `backend/scripts/backfill-preferred-customers-from-invoices.mjs`
  - npm script: `backfill:preferred-customers`
- Validation run in current dev dataset:
  - created `1` preferred-customer member from unmatched invoice (`INV-240930`)
  - unmatched invoice count reduced to `0`
  - re-run confirms idempotency (`createdCount: 0`, `skipped: already-matched`)

## Recent Update (2026-03-26) - Guest vs Free Checkout Mode + Attribution Locking

- Public checkout now has an explicit checkout mode choice:
  - `Guest Checkout` (purchase only; no account creation)
  - `Free Account` (creates pending preferred customer account and sends password setup email)
- Preferred customer auto-enrollment now runs only when checkout mode is `Free Account`.
- Guest mode keeps invoice attribution and owner BV crediting, but skips account auto-creation.
- Public checkout store code field is now read-only (link-locked UX).
- Backend now enforces referrer store-code lock:
  - if posted store code does not match checkout page store code, checkout request is rejected.

## Recent Update (2026-03-26) - Checkout Thank-You Invoice Modal + Store-Themed Preferred Login

- Public checkout now shows a post-payment thank-you modal with invoice details:
  - invoice id
  - status
  - amount
  - discount
  - BV
  - purchase timestamp
- Thank-you modal includes quick actions:
  - `Preferred Login` (store-themed free account login)
  - `Back to products`
- Added dedicated store-themed preferred customer login page:
  - `/store-login.html`
  - pretty route alias: `/store/login`
- Store page headers (`store.html`, `store-product.html`, `store-support.html`, `store-checkout.html`) now point `Free Member Login` to `/store-login.html`.
- Pending password-setup login behavior now generates/returns a setup link when missing, so login can always surface a clickable setup link in development mode.

## Recent Update (2026-03-26) - Strategic Direction Locked (Planning Only, No Code Changes)

- Product direction was aligned to a custom commerce stack owned inside this app:
  - custom storefront
  - internal product management and catalog ownership
  - internal inventory ownership
  - Stripe Checkout as the primary checkout/payment flow
  - shipping integration (USPS and additional carriers/providers as needed)
  - tax-rate/tax-calculation integration
- Explicit session decision:
  - no implementation patching in this step
  - no backend/frontend behavior changes applied
  - planning mode only until architecture and rollout sequence are finalized
- Attribution/BV requirements remain in scope:
  - store-code attribution remains a required field in checkout/order flows
  - BV point accounting remains app-owned as part of the binary-tree/commission domain
- Next planning deliverables:
  - phase-by-phase architecture plan
  - data model and event flow for attribution/BV ledgering
  - provider integration contracts (Stripe, shipping, tax)
  - risk and rollout checklist before first implementation patch

## Recent Update (2026-03-25) - My Store Sidebar Removal (Top Command Bar)

- Per feedback, removed the left-side `Store Console` rail/sidebar from `My Store`.
- Replaced with a top command-bar layout:
  - header strip + status chips
  - horizontal workspace navigation cards (`Product Management`, `Analytics`, `Store Setup`)
  - inline workspace context panel below nav
- Product Management list -> editor flow remains intact; only container/navigation composition changed.
- Validation completed:
  - `admin.html` inline script parse check passed.

## Recent Update (2026-03-25) - Product Management Flow Redesign (Shopify-Style List -> Product Editor)

- Rebuilt admin `My Store` product management into a dedicated management flow:
  - `Products list view` (catalog-style listing)
  - `Product editor view` (single-product management page)
- Core UX changes in `admin.html`:
  - replaced old side-by-side form/list layout.
  - added product list table-like rows with:
    - product summary
    - status
    - price
    - inventory + BV
    - updated date
    - quick actions (`Manage`, `Archive/Unarchive`)
  - added dedicated editor workspace with:
    - back-to-list control
    - editor header/status badge
    - title, description, media, pricing, inventory, BV, status sections
    - archive/delete actions for existing products
    - persistent save/discard controls.
- Interaction behavior:
  - `Add Product` opens new-product editor page.
  - `Manage` opens selected product editor page.
  - save keeps user in product editor (Shopify-like single-product flow).
  - delete returns to list with list-level feedback.
- Technical updates:
  - added view state helpers for list/editor workspace switching.
  - moved product actions from list-level inline edit/delete into dedicated editor workflow.
  - kept existing product API contracts unchanged.
- Validation completed:
  - `admin.html` inline script parse check passed.

## Recent Update (2026-03-25) - My Store Navigation Redesign (Fresh Layout Footprint)

- Second-pass redesign completed after feedback that prior update still felt same-footprint.
- `My Store` area in `admin.html` now uses a materially different structure:
  - left persistent commerce rail (`Store Console`) with stacked nav cards
  - right workspace canvas for active tab content
  - context module moved into side rail for always-visible workspace state
- Interaction model preserved:
  - existing tab keys (`storefront`, `analytics`, `setup`) unchanged
  - existing `setStoreTab(...)` behavior continues to power view switching
  - active badges and context state still update from tab metadata
- Visual direction:
  - denser, app-shell style admin feel vs prior top hero + horizontal tabs
  - closer to commerce admin console layout conventions.
- Validation completed:
  - `admin.html` inline script parse check passed.

## Recent Update (2026-03-25) - My Store Nav Redesign (Shopify-Inspired Admin UX)

- Redesigned the `My Store` workspace navigation in `admin.html` to feel more polished, interactive, and commerce-admin oriented.
- Replaced the previous basic 3-button strip with a richer control-surface layout:
  - branded workspace header
  - status chips (`Live Catalog`, `Attribution Locked`)
  - elevated tab cards for `Product Management`, `Analytics`, `Store Setup`
  - live “Current Workspace” context panel that updates as tabs change
- Enhanced tab interaction behavior:
  - clearer active state (ring + border + shadow treatment)
  - inline active badge on selected tab card
  - context title/description/pill now update from tab metadata in `setStoreTab(...)`
- Existing tab/view logic preserved:
  - no route contract changes
  - no store view key changes (`storefront`, `analytics`, `setup`)
  - state persistence remains unchanged.
- Validation completed:
  - `admin.html` inline script parse check passed.

## Recent Update (2026-03-25) - Product Page Description Container Alignment

- Fixed product page layout issue where part of description text rendered outside the `Description` field container.
- `store-product.html` now renders all description paragraphs inside `#product-description-body` (inside the Description card).
- Removed separate lead-description node that lived outside the description container.
- Validation completed:
  - `store-product.html` inline script parse check passed.

## Recent Update (2026-03-25) - Product Management Form Simplification

- Removed `Product Details (one detail per line)` from admin Product Management form in `admin.html`.
- Cleaned related form bindings so create/edit flows no longer reference that removed input.
- Managed products card list no longer shows detail-preview text in Product Management view.
- Validation completed:
  - `admin.html` inline script parse check passed.

## Recent Update (2026-03-25) - Product Description Parity Fix (Admin vs Product Page)

- Fixed mismatch where product detail page narrative text did not match the admin-entered product description.
- `store-product.html` now renders description directly from `product.description` without auto-generated rewrite text.
- Multi-line admin descriptions are preserved as paragraph breaks on the product page.
- Validation completed:
  - `store-product.html` inline script parse check passed.

## Recent Update (2026-03-25) - Store Product Images (`Browse` Upload + Gallery)

- Admin Product Management now supports local image upload via `Browse...` button:
  - uploads to `POST /api/admin/store-products/upload-image`
  - accepted formats: JPG / PNG / WEBP / GIF
  - max file size: `5 MB`
  - upload response auto-fills primary image URL in form.
- Product schema/persistence now supports gallery image arrays:
  - primary image: `image` / DB `image_url`
  - gallery images: `images[]` / DB `image_urls jsonb`
- DB compatibility handling added:
  - startup checks for `image_urls` column
  - runs admin-role migration/backfill only when column is missing
  - avoids service-role ownership errors on existing tables.
- Public product page now supports multi-image storefront display:
  - hero image + thumbnail selector in `store-product.html`
  - single-image products remain fully supported.
- Validation completed:
  - backend module parse checks passed for updated store product modules
  - inline script parse checks passed for admin/storefront pages
  - local endpoint smoke test passed:
    - `GET /api/admin/store-products` -> `200`
    - `POST /api/admin/store-products/upload-image` -> `200`

## Recent Update (2026-03-25) - Preferred Customer Free Account Flow (Phase 1)

- Implemented new package/rank foundation:
  - package key: `preferred-customer-pack`
  - enrollment label: `Free Account`
  - starting rank: `Preferred Customer`
- Added preferred-customer management entry point:
  - side nav route: `/PreferredCustomer`
  - page key: `preferred-customer`
  - view now runs as a dedicated purchaser planning page (not enrollment form).
- Preferred customer planner page now shows:
  - purchasers attributed to current store owner
  - total purchased amount, BP, invoice count, and last purchase date per customer
  - click-to-edit placement planning before upgrade (`left/right/spillover + parent mode`)
- Added placement-plan save endpoint:
  - `PATCH /api/registered-members/:memberId/placement`
- Enrollment and pending logic now supports pre-placement:
  - parent can set `left/right/spillover` placement before upgrade.
  - spillover placement now supports:
    - `Auto Assign Parent`
    - `Assign Specific Parent` (manual direct-child reference)
  - placement selector now auto-detects filled direct legs and moves to spillover when both left/right direct slots are occupied.
  - pending preferred members are excluded from Binary Tree render until upgraded.
  - after upgrade to paid package, stored placement metadata is used for auto-placement.
- Access controls for Free Accounts:
  - free users are now restricted to `My Store` and `Profile` page access.
- Store and attribution logic updates:
  - Free Account discount set to `15%`.
  - Free Account buyer receives no BV/PV credit.
  - BV credit is redirected to attributed store owner/upline identity.
  - owner BV credit is applied once checkout payment succeeds.
  - invoice API now validates `memberStoreCode` vs `memberStoreLink` store-code mismatch.
- Validation completed:
  - backend parse checks passed for modified services/helpers.
  - inline script parse checks passed for `index.html` and `login.html`.

## Recent Update (2026-03-16) - Dashboard Reload Commission Offset Regression Fix

- Completed fix for dashboard commission cards/buttons reappearing as transferable after reload.
- Root cause:
  - net-balance resolver mutated loaded offset state during early startup render passes.
  - temporary `gross=0` passes collapsed offset state to `0`, causing previously transferred amounts to reappear.
- Frontend fix:
  - `index.html`: `resolveNetCommissionBalance(...)` now computes effective offsets without mutating stored offset state.
- Validation:
  - browser repro for `zeroone` now stays stable across reload:
    - `Fast Track` and `Infinity Builder` remain `$0.00` after transfer history is loaded.
    - transfer buttons remain disabled after reload.
  - offset API values still load normally (`/api/e-wallet/commission-offsets` unchanged).

## Recent Update (2026-03-16) - E-Wallet Dedicated Table Path Restored

- Completed post-privilege rewire of E-Wallet backend to dedicated tables in schema `charge`.
- DB provisioning ran under admin role:
  - ensured `charge.ewallet_accounts` and `charge.ewallet_peer_transfers` exist
  - ensured E-Wallet indexes exist
  - granted service-role DML to both tables
- Backend store now uses dedicated E-Wallet tables again (`backend/stores/wallet.store.js`).
- Temporary compatibility path (using `charge.payout_requests` for E-Wallet ledger persistence) has been removed.
- Validation:
  - `GET /api/e-wallet` returns `200` on live backend (`localhost:3000`)
  - wallet backend module parse checks passed
  - test P2P transfer path validated on temp server and rolled back.

## Recent Update (2026-03-16) - E-Wallet API Recovery (DB-Only)

- Resolved E-Wallet timeline load failure (`Unable to load E-Wallet details.`) in backend runtime.
- Confirmed active DB role constraints:
  - `CREATE TABLE` denied in schema `charge` (`42501`), including current admin-role credentials from `.env`.
- Implemented DB-only compatibility path in `backend/stores/wallet.store.js`:
  - E-Wallet profile/identity reads from `charge.member_users`
  - E-Wallet transfer history + persistence uses `charge.payout_requests` with E-Wallet-specific source metadata
  - no local file/JSON storage fallback
- Updated transfer payload mapping in `backend/services/wallet.service.js` to persist sender-name metadata for write completeness.
- Runtime verification:
  - `node --check` passed for wallet backend modules
  - `GET /api/e-wallet` now returns `200` on live server (`localhost:3000`) with wallet/timeline payload.
- Current status:
  - E-Wallet page can load timeline data again without requiring new table creation privileges.

## Recent Update (2026-03-16) - E-Wallet Layout Redesign (Distinct from Dashboard)

- Completed a visual/layout refactor of member-side E-Wallet in `index.html` to remove repetitive dashboard KPI-card styling.
- New page structure now uses:
  - wallet command center hero with large balance focus
  - directional flow rail rows for sent/received/count metrics
  - transfer composer panel
  - timeline-style ledger stream with marker-based entries
- Compatibility guard:
  - retained all existing E-Wallet DOM IDs required by current JS module bindings (`renderEWalletSummary`, transfer submit flow, and history refresh/render functions).
- Rendering update:
  - transfer history list items now render as timeline events (with directional markers and signed amount emphasis) instead of individual card blocks.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - inline script parse check passed for `index.html`
  - presence checks passed for all required `ewallet-*` IDs

## Recent Update (2026-03-16) - Full E-Wallet Page + Peer-to-Peer Transfer

- Implemented a dedicated member-side `E-Wallet` page in `index.html`:
  - sidebar route/nav now opens `E-Wallet` (`/EWallet`)
  - new page view includes:
    - live available balance card
    - total sent / total received / transfer count metrics
    - peer transfer form (recipient + amount + note)
    - transfer history feed with refresh action
- Frontend integration:
  - added E-Wallet page routing in `pageMeta` and `pagePathByPage`
  - wired API calls for:
    - load wallet snapshot + transfer history
    - post peer transfer and update UI immediately
  - dashboard total balance now syncs from wallet snapshot when wallet data is loaded
  - transfer events are now pushed into Recent Activity (`kind: transfer`)
- Backend/API implementation:
  - added wallet routes:
    - `GET /api/e-wallet`
    - `POST /api/e-wallet/peer-transfer`
  - added transactional transfer service with balance validation:
    - sender/recipient account upsert
    - account row locking (`FOR UPDATE`)
    - insufficient-balance guard
    - atomic debit/credit + transfer record insert
  - added wallet persistence store with schema bootstrap (`CREATE TABLE IF NOT EXISTS`):
    - `charge.ewallet_accounts`
    - `charge.ewallet_peer_transfers`
    - supporting indexes
- Files added:
  - `backend/stores/wallet.store.js`
  - `backend/services/wallet.service.js`
  - `backend/controllers/wallet.controller.js`
  - `backend/routes/wallet.routes.js`
- Files updated:
  - `backend/app.js`
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check` passed for all new wallet backend modules and `backend/app.js`
  - inline script parse check passed for `index.html` and `admin.html`

## Recent Update (2026-03-16) - Binary Tree Sidebar Auto-Fullscreen

- Requested behavior implemented:
  - clicking the `Binary Tree` item in the sidebar now opens the Binary Tree page directly in fullscreen mode.
- Files updated:
  - `index.html`
  - `admin.html`
- Implementation details:
  - `setPage(pageName, options)` now reads `options.autoEnterBinaryTreeFullscreen`.
  - Binary Tree page load flow now triggers `controller.enterFullscreen()` when that flag is true.
  - sidebar nav click handlers now pass:
    - `autoEnterBinaryTreeFullscreen: requestedPage === 'binary-tree'`
- Scope guard:
  - auto-fullscreen is tied specifically to sidebar Binary Tree clicks.
  - other entry paths to Binary Tree (e.g. route restore/popstate or settings deep-links) remain unchanged.
- Validation:
  - no-op safe check retained (`enterFullscreen` only runs when available; existing fullscreen state is already guarded in controller).

## Recent Update (2026-03-15) - Legacy Tier Node Count Starts at 1/40

- Confirmed requested rule:
  - Legacy tier node count includes the account owner/root.
  - Tier cards should start at `1/40`, not `0/40`.
- Implementation:
  - updated Legacy tier snapshot config to include root node when no seed directs are present:
    - `includeRootNodeWithoutSeeds: true`
  - retained sequential unlock behavior:
    - Tier 2 still appears only after Tier 1 reaches `3/3` directs.
- Validation:
  - `0 directs` -> Tier 1 shows `1/40`.
  - `3 directs` -> Tier 1 shows `4/40`, Tier 2 appears at `1/40`.
- Data hygiene:
  - temporary validation members removed.
  - DB returned to fresh-start state after validation.

## Recent Update (2026-03-15) - Legacy Leadership Tier Progression Fix (Sequential Unlock)

- Addressed user-side dashboard issue where Tier 1 and Tier 2 appeared to mirror each other too early.
- Required behavior implemented:
  - Tier 1 is the only visible starter card.
  - Tier 2 appears only after Tier 1 reaches `3/3` direct Legacy sponsorships.
  - Tier claim still requires full tier completion (`40` nodes).
  - After first 3 directs are complete, the next tier becomes available for building.
- Frontend logic updates in `index.html`:
  - Enhanced shared tier snapshot builder with per-bonus options:
    - `baseVisibleTierCount`
    - `previewLockedTierCount`
    - `unlockByDirectRequirement`
    - `includeRootNodeWithoutSeeds`
  - Legacy Leadership now uses:
    - `baseVisibleTierCount: 1`
    - `previewLockedTierCount: 0`
    - `unlockByDirectRequirement: true`
    - `includeRootNodeWithoutSeeds: false`
  - Result: no premature Tier 2 display, and new unlocked tier starts at `0/40`.
- Validation:
  - `0` directs -> only Tier 1 visible (`0/40`).
  - `2` directs -> only Tier 1 visible (`2/3` progress, Tier 2 hidden).
  - `3` directs -> Tier 1 and Tier 2 visible; Tier 2 starts building from `0/40`.
- Data hygiene:
  - temporary validation seed members were removed.
  - DB returned to fresh-start state after verification.

## Recent Update (2026-03-15) - Fresh Start Data Reset (User Request)

- Per latest request, removed restored legacy dataset and returned DB to fresh-start state.
- Executed full app-data reset and verified post-reset counts are zero for member/business tables:
  - `member_users`
  - `registered_members`
  - `password_setup_tokens`
  - `email_outbox`
  - `store_invoices`
  - `payout_requests`
  - `binary_tree_metrics_snapshots`
  - `sales_team_commission_snapshots`
  - `member_server_cutoff_states`
  - `force_server_cutoff_history`
- Preserved required bootstrap/system rows:
  - `admin_users`: `1`
  - `runtime_settings`: `1`
- Runtime settings were normalized to clean defaults:
  - `dashboardMockupModeEnabled = false`
  - `tierClaimMockModeEnabled = false`

## Recent Update (2026-03-15) - DB User Data Restore From Web-Dev JSON

- Restored app data into PostgreSQL from source JSON stores found at:
  - `/Users/seth/Documents/Web-Dev`
- Restore source files used:
  - `mock-users.json`
  - `registered-members.json`
  - `password-setup-tokens.json`
  - `mock-email-outbox.json`
  - `mock-store-invoices.json`
  - `mock-payout-requests.json`
  - `mock-binary-tree-metrics.json`
  - `mock-sales-team-commissions.json`
  - `mock-member-server-cutoff-state.json`
  - `mock-force-server-cutoff-history.json`
  - `mock-runtime-settings.json`
  - `mock-admin-users.json`
- Resulting restored row counts:
  - `member_users`: `22`
  - `registered_members`: `22`
  - `password_setup_tokens`: `22`
  - `email_outbox`: `22`
  - `store_invoices`: `5`
  - `payout_requests`: `12`
  - `binary_tree_metrics_snapshots`: `13`
  - `sales_team_commission_snapshots`: `13`
  - `member_server_cutoff_states`: `15`
  - `force_server_cutoff_history`: `17`
  - `admin_users`: `1`
  - `runtime_settings`: `1`
- Note:
  - Original restored seed set did not include username `zeroone`, so a legacy `zeroone` account was recreated with active login state.

## Recent Update (2026-03-15) - Legacy Leadership Founder Unlock Fix (User Dashboard)

- Investigated user report:
  - logged in as legacy package account (`zeroone`) but Legacy Leadership card stayed locked.
- Root cause:
  - `index.html` `resolveLegacyLeadershipEligibilityFromRankAndSponsor(...)` required both:
    - Legacy rank
    - 3 direct legacy enrollments
  - This blocked Legacy Founder access and prevented tier cards from rendering.
- Fix applied:
  - Updated Legacy Leadership eligibility gate so access unlocks with Legacy rank/package (Founder requirement).
  - Direct legacy enrollments remain required for tier progress/completion (inside tier snapshot/progress logic), not for top-level access.
  - Updated locked subtitle/footnote messaging to use generalized requirement builder when rank access is missing.
- Files updated:
  - `index.html`
- Validation:
  - Legacy session user (`Legacy` rank, `legacy-builder-pack`, 0 directs):
    - no locked gate card
    - Tier 1 renders
    - status shows `Building`.
  - Non-legacy session user remains correctly locked.

## Recent Update (2026-03-15) - PostgreSQL Deadlock Fix (Enrollment + Force Cutoff)

- Fixed intermittent `500` errors on:
  - `POST /api/registered-members`
  - `POST /api/admin/force-server-cutoff`
- Root cause:
  - concurrent write transactions against related tables (`charge.member_users`, `charge.registered_members`, and dependent snapshots/states) could deadlock (`40P01`) under DB-backed flows.
  - `resetAllMockData` also issued parallel count queries on a single PG client, causing deprecated/unsafe client concurrency.
- Backend fixes implemented:
  - `backend/services/admin.service.js`
    - `resetAllMockData(...)` now counts rows sequentially on the same transaction client.
    - `forceServerCutoff(...)` now writes in deterministic sequence:
      - users -> members -> binary snapshots -> sales-team commissions -> member cutoff states -> force-cutoff history.
  - `backend/services/member.service.js`
    - `createRegisteredMember(...)` writes are now sequential:
      - users -> members -> password tokens -> email outbox.
    - `upgradeMemberAccount(...)` writes are now sequential:
      - users -> members.
  - `backend/controllers/admin.controller.js` and `backend/controllers/member.controller.js`
    - hardened error logs to include stack/message context for faster DB failure diagnosis.
- Validation completed:
  - direct service repro passed:
    - reset -> register -> save binary metrics -> force cutoff (all success).
  - API repro passed on fresh server process:
    - `POST /api/admin/force-server-cutoff` returned `200` after registration + metrics snapshot.
  - smoke checks passed for key member/admin GET/POST endpoints.

## Recent Update (2026-03-15) - Fast Track Enrollment Commission Regression Fix

- Fixed a regression where newly enrolled members always saved `fastTrackBonusAmount = 0`.
- Root cause:
  - DB-backed `backend/services/member.service.js` had Fast Track package/tier metadata but did not include bonus-matrix payout logic from legacy `serve.mjs`.
- Backend fix implemented:
  - Added `resolveFastTrackBonusAmount(...)` helper and persisted computed bonus for non-admin enrollments.
  - Preserved admin behavior: admin-route enrollments continue to save `0` Fast Track bonus.
- Route/context fix:
  - `backend/controllers/member.controller.js` now detects `/admin/*` enrollment route and passes:
    - `isAdminPlacement: true`
    - `enrollmentContext: 'admin'`
  - Member route enrollments remain `member` context and are eligible for Fast Track credit.
- Result:
  - Member enrollments now generate commission values again from package+tier data.
  - Admin placements remain no-credit by design.
  - One-time DB repair executed: updated 4 existing non-admin `charge.registered_members` rows from `0.00` to mapped Fast Track bonus values; remaining affected rows = `0`.

## Recent Update (2026-03-15) - Fast Track Matrix Orientation Correction

- Clarified rule interpretation for `brand_assets/MLM Business Logic.md` line 45:
  - matrix row (left) = sponsor/parent Fast Track tier (based on sponsor package/rank)
  - matrix column = newly enrolled member package
- Example validated:
  - sponsor tier `Infinity` enrolling `Legacy Builder Pack` must credit `120.00` (`12.5% of 960`).
- Backend updates:
  - `backend/services/member.service.js` now computes Fast Track bonus as:
    - sponsor-tier rate (`7.5% | 10% | 12.5% | 20%`) × enrolled package price
  - sponsor tier is now derived from sponsor account package/rank when available (fallback to payload tier).
- Frontend parity updates:
  - `index.html` and `admin.html` `getFastTrackBonusAmount(...)` now use the same sponsor-tier-rate × package-price calculation for preview/fallback messaging.
- Data repair executed:
  - recalculated historical non-admin rows to the corrected orientation.
  - corrected rows included:
    - `demouser2 -> demouser3` (Legacy enrollment under Infinity tier): `112.00 -> 120.00`
    - `demouser1 -> demouser2` (Infinity enrollment under Legacy tier): `120.00 -> 112.00`
    - `admin -> zeroone` (Legacy enrollment under Personal tier): `38.40 -> 72.00`

## Recent Update (2026-03-08) - Binary Tree Full Sweep + Additional Cutoff/Tier Fixes

- Completed full binary-tree investigation before reset planning:
  - placement graph and ancestry checks
  - snapshot parity checks
  - cutoff-state age checks against account creation timestamps
- Confirmed:
  - `juan` is in `hues` ancestry path (`juan -> bond -> hues -> ...`)
  - `sethfozz` computed left/right leg BV aligns with saved snapshot (`1920 / 2880`)
- Added cutoff stale-state protection in `serve.mjs`:
  - `/api/member/server-cutoff-metrics` now invalidates per-account cutoff baselines when account `createdAt` is newer than `lastAppliedCutoffUtcMs`.
  - prevents “instant reset to 0” behavior caused by stale inherited state.
- Added stale-baseline protection for session bootstrap:
  - `serve.mjs` auth response sanitizer
  - `index.html` starter dashboard metric resolver
- Fixed locked tier-card progress behavior in `index.html`:
  - Infinity Builder + Legacy Leadership locked cards now render progress bars from direct enrollment progress (`qualified / required`) instead of hardcoded `0%`.
- Validation:
  - `serve.mjs` syntax check passed
  - `index.html` inline script parse passed
  - cutoff endpoint probe for `juan`/`love` confirmed stale cutoff-state normalization.

## Recent Update (2026-03-08) - Binary Tree Downline BV Guard

- Fixed binary-tree BV suppression case where newly enrolled members could show `0` weekly BV if stale baseline values existed from a cutoff timestamp earlier than member creation.
- Applied a createdAt-vs-baselineSetAt guard in:
  - frontend binary volume resolver (`index.html`)
  - member cutoff metrics API path (`serve.mjs`)
- Expected result:
  - downline rollups now credit newly enrolled members correctly in ancestor legs.
- Validation:
  - syntax/parse checks passed for updated files.
  - recompute check confirmed `juan` contributes `960` and appears in `hues` branch rollup.

## Recent Update (2026-03-08) - Profile Modal Media Preview

- `Edit Profile` modal now includes live visual preview for:
  - cover photo
  - profile photo
- Modal media preview now mirrors profile-header look (cover + overlapping avatar) for WYSIWYG editing.
- Upload controls remain modal-only and are integrated in the preview block.
- Validation:
  - inline script parse passed for updated `index.html`.

## Recent Update (2026-03-08) - Profile Photo/Cover Edit Gate

- Profile photo and cover actions are now gated to `Edit Profile` modal only.
- Removed direct media edit controls from the profile page header area.
- Added `Profile Media` section inside modal with change buttons for avatar and cover.
- Existing upload behavior is preserved; only entry point changed.
- Validation:
  - inline script parse passed for updated `index.html`.

## Recent Update (2026-03-08) - Profile Location Display

- Profile header now includes a human-readable location line under `@username`.
- Format now follows requested style:
  - `Country, State/Region` (example: `United States, California`)
- Profile edit modal now includes `State / Region` input and persists it with profile customization state.
- Country code is resolved to country name during render (not raw code text).
- Validation:
  - inline script parse passed for updated `index.html`.

## Recent Update (2026-03-08) - Profile Edit Modal UX

- Profile edit panel is now modal-only instead of always visible on the Profile page.
- Added `Edit Profile` button directly under bio text to open modal.
- Modal behavior now includes:
  - dismiss button close
  - outside/backdrop click close
  - Escape-key close
  - auto-close when navigating away from Profile route.
- Existing profile form ids and save/reset logic were preserved inside modal.
- Validation:
  - inline script parse passed for updated `index.html`.

## Recent Update (2026-03-08) - Profile Navigation + Lifetime Milestones

- Confirmed and aligned dashboard wording with cutoff behavior:
  - `Weekly Total Organization BV`
  - `Weekly Personal Organization BV`
- Completed member profile-page runtime wiring in `index.html`:
  - top header name/avatar button now routes to `Profile`.
  - profile module now initializes on page load.
  - lifetime milestone cards now refresh from binary-tree summary updates (not weekly reset values).
- Profile capabilities now active:
  - edit display name and country
  - edit bio with live counter
  - upload profile avatar
  - upload cover image
  - local persistence + session sync for profile data.
- Tier-card UX hardening:
  - when progress is above zero, bars now enforce a minimum visible width so `1/3` direct sponsor progress is visibly reflected.
- Validation:
  - inline script parse succeeded for updated `index.html`.

## Recent Update (2026-03-08)

- Fixed tier-card progress bar mismatch with direct sponsorship text.
- Root cause:
  - bar was tied to node-completion ratio while label was tied to direct-sponsor ratio (`x/3`).
- Patch in `index.html`:
  - Infinity Builder and Legacy Leadership active-tier bars now use direct-sponsor progress (`directChildLitCount / 3`) so bar movement matches `x/3` text.
- Validation:
  - inline script parse passed
  - direct-sponsor states now render expected visual progression (`1/3`, `2/3`, `3/3`).

- Investigated user-reported issues on dashboard KPI flow, Server Cut-Off card behavior, and Binary Tree fullscreen enrollment.
- Applied cutoff-behavior hardening in `serve.mjs`:
  - member metrics GET route no longer auto-applies scheduled/forced cutoff baselines during read hydration
  - cycle estimate now uses lower/higher leg ordering for `500 / 1000` split logic
- Applied fullscreen enroll UX fix in `index.html`:
  - added dedicated auth/password setup link inside fullscreen enroll modal
  - modal now shows success + auth link without auto-closing immediately
- Expected behavioral outcome:
  - enrolling members no longer triggers surprise Server Cut-Off left/right snap-to-zero from passive metrics reads
  - fullscreen enroll users can access setup/auth link in-context without navigating to the main Enroll Member page
- Validation:
  - `serve.mjs` syntax check passed
  - API probes confirmed current-week leg BV remains stable on read and cycle calculation aligns with lower/higher split interpretation
- Note:
  - weekly cutoff baseline advancement should come from explicit cutoff execution flow (not passive member metrics fetch).

## Recent Update (2026-03-04)

- Added Binary Fullscreen lifetime accumulation cards on both member and admin shells:
  - `Lifetime Total Organization BV`
  - `Lifetime Personal Organization BV`
- Lifetime cards now read non-reset lifetime BV (`starterPersonalPv`-based), separate from cut-off weekly BV.
- Binary-tree node payloads now include `lifetimePersonalPv` so fullscreen totals can stay stable through cut-off resets.
- Weekly cut-off behavior remains unchanged for existing cards (Server Cut-Off + Personal Volume still reset to cycle baseline).
- Validation:
  - inline script parse passed for `index.html` and `admin.html`.

- Fixed login account-switching friction when already authenticated.
- `login.html` no longer force-redirects to dashboard when a session exists.
- Current behavior:
  - login page remains available
  - shows contextual banner with current signed-in user
  - allows direct sign-in as another member (session overwrite) without requiring manual logout first
- Validation:
  - headless checks confirmed successful login for `eagleone`
  - successful immediate switch to `eaglethree`
  - login page remains accessible while authenticated.

- Fixed upline BV propagation gap after store purchases.
- Root cause:
  - binary tree leg volume aggregation used static member `packageBv` only.
  - purchase sync writes to `starterPersonalPv`, so new purchase volume was not reflected in upline legs.
- Patch in `index.html`:
  - added `resolveMemberBinaryVolume(member)` using `starterPersonalPv` with `packageBv` fallback.
  - binary tree node `leftPersonalPv` and organization BV rollups now use that dynamic member volume.
- Result:
  - downline purchases now increase upline left/right leg BV,
  - and member Server Cut-Off panel now reflects those updates.
- Validation:
  - `index.html` inline script parse passed
  - headless login check (`sethfozz`) showed non-zero Server Cut-Off left leg after downline purchase (`left=384`, `right=0`)
  - server endpoint `GET /api/member/server-cutoff-metrics?username=sethfozz` returned matching current-week values.

- Fixed member login dead-end for pending-password-setup accounts (`passwordSetupRequired=true`) when old setup tokens were expired.
- Login API (`POST /api/member-auth/login`) now auto-issues and persists a fresh setup token if no open valid token exists, then returns `setupLink` with `PASSWORD_SETUP_REQUIRED`.
- Login page (`login.html`) now renders `PASSWORD_SETUP_REQUIRED` with a clickable `Open setup link` action when setup link is present.
- Validation completed:
  - `serve.mjs` syntax check passed
  - `login.html` inline script parse passed
  - active member auth remained successful (`sethfozz`, `fozz`, `hues`)

- Refined My Store discount model to remove product-level discount conflicts with retail flow.
- User storefront (`index.html`) now applies discount strictly by current account rank percent:
  - `Personal 20%`
  - `Business 25%`
  - `Infinity 30%`
  - `Legacy 40%`
- User flow labels were updated to surface rank-based discount in:
  - storefront badge
  - product page summary
  - cart/checkout totals
- Admin Product Management (`admin.html`) no longer includes product discount fields:
  - create/edit form discount input removed
  - discount parsing/validation removed
  - managed product cards no longer display per-product discount stats
- Existing rank-driven discount behavior for checkout totals was preserved and clarified (no custom per-product discount overrides).
- Validation completed:
  - no remaining `discountPercent`/legacy per-product discount references in user/admin store code paths
  - inline script syntax checks passed for both files
  - headless runtime load passed for both files (non-blocking `favicon.ico` 404 observed)

- Migrated member Server Cut-Off panel to server-authoritative state.
- Added backend store + API:
  - `mock-member-server-cutoff-state.json`
  - `GET /api/member/server-cutoff-metrics`
- Member panel (`index.html`) no longer relies on localStorage cutoff baseline math.
- Server now computes and returns:
  - current-week Left/Right BV
  - baseline and latest applied cutoff state
  - scheduled cutoff metadata and cycle rule values
- Admin force cut-off now updates member cutoff-state baselines server-side at run time.
- Admin flush-all now clears member cutoff-state store and reports its cleared count.
- Regression validation completed:
  - scenario reproduced (non-zero -> force -> reset)
  - post-force panel held `0/0` over timed observation with no snap-back.

- Investigated member-side Server Cut-Off force-run mismatch and reproduced with browser automation.
- Root cause confirmed:
  - force timestamp could be applied before member BV totals were fully hydrated,
  - leaving cutoff baseline at `0/0` while `lastAppliedCutoffUtcMs` advanced.
- Implemented member-side hydration-safe force cutoff handling in `index.html`:
  - tracks latest forced event timestamp from `/api/server-cutoff-events`
  - supports safe equal-timestamp re-apply path for hydration backfill
  - backfills baseline once when real BV totals arrive after a very recent force event
- Validation status:
  - automated test now confirms post-force member panel resets Left/Right BV to `0/0` after reload.
  - local storage cutoff baseline now persists hydrated BV baseline correctly.

- Implemented dedicated JSON persistence for Binary Tree and Sales Team Commission systems to prepare for database migration.
- New stores:
  - `mock-binary-tree-metrics.json`
  - `mock-sales-team-commissions.json`
- New API surfaces:
  - `GET/POST /api/binary-tree-metrics`
  - `GET/POST /api/sales-team-commissions`
- Member dashboard (`index.html`) now writes synchronized snapshots from:
  - Binary summary computation loop.
  - Sales Team Commission card computation loop.
- Reset path alignment:
  - `POST /api/admin/reset-all-data` now also clears both new stores.
  - Admin Settings flush notice now includes both files.
- Migration intent preserved:
  - Money fields persisted as numeric values.
  - Snapshot rows include identity columns and ISO timestamps for direct PostgreSQL table mapping.
- Expanded migration prep to full app scope:
  - Added full PostgreSQL schema script at `migrations/20260304_001_full_app_postgres_schema.sql`.
  - Covers all JSON-backed systems (users, admin users, members, setup tokens, email outbox, invoices, payout queue, runtime settings, binary metrics, sales commission snapshots).
  - Includes constraints/indexes/triggers for migration-ready relational structure.
- Added database access-control migration:
  - `migrations/20260304_002_full_app_access_control.sql`
  - Defines role model (`charge_admin_role`, `charge_service_role`, `charge_member_role`).
  - Applies grants + row-level security policies for admin/service full access and member self-scoped visibility.
- Added admin-only launch seed migration:
  - `migrations/20260304_003_admin_seed.sql`
  - Seeds only `charge.admin_users` for fresh-start deployment.
  - Leaves all user/member/business datasets empty.
- Added backend documentation hub:
  - `Claude_Notes/BackEnd-Notes.md`
  - Tracks DB schema/access/seed migrations, run order, and production follow-ups.
- Implemented Server Cut-Off weekly BV reset behavior:
  - Applied to both member and admin dashboards.
  - Left/Right Leg BV now resets to `0` once per closed cutoff and re-accumulates for the new week.
  - Cutoff baseline/last-applied state persisted per user/config in local storage.

## Owner Scope Gate (Priority Rule)

- **Priority instruction from owner (2026-02-22):** Do not get ahead of approved scope when implementing MLM earning systems.
- **Current active systems:** `2. Fast Track Bonus`, `3. Infinity Builder Bonus`, and `4. Sales Team Commission`.
- **Do not start yet:** any compensation systems after section `4` of `brand_assets/MLM Business Logic.md` unless explicitly approved by owner in chat.
- **Execution policy:** implement only owner-approved compensation sections and keep all other sections gated until explicit go-ahead.
- **Context allowance:** Work on previous systems/tasks is allowed when needed for context, dependencies, or validation of current work.
- **Advance trigger (owner-controlled):** Only introduce a new system/logic after explicit owner confirmation in chat (example: "Okay lets move to the next system or task").

## User/Admin Update Decision Gate (Owner Rule - 2026-02-22)

- For every new **user-side** update request, pause and ask whether the same change should also be applied to **admin-side**.
- Admin-side patching is now owner-decision based per request.
- Default behavior:
  - implement requested change on user side first
  - ask: "Apply this update to admin side too?"
  - proceed on admin only after explicit owner confirmation

## Owner Roadmap Alignment (2026-02-22)

- **What changed:** Captured owner decisions about sequencing and backend timing.
- **Source blueprint:** `brand_assets/MLM Business Logic.md`
- **Decisions recorded:**
  - Keep data mock-driven (JSON/static state) while required systems/components are built.
  - Treat `brand_assets/MLM Business Logic.md` as the business blueprint for compensation behavior.
  - Defer database-backed auth/session migration until later implementation phase.

## Proposed Delivery Plan (Mock First -> Database Later)

### Phase 1 - Rule engine foundation (frontend-only logic modules)

- Convert business rules in `brand_assets/MLM Business Logic.md` into deterministic JS modules (no UI dependency).
- Start with highest-impact calculations:
  - Fast Track bonus by package/rank.
  - Rank advancement checks and one-time payout flags (when owner unlocks later systems).
  - Sales Team cycle logic (when owner unlocks later systems).
- Add fixture-based tests for each rule path (happy path + edge cases).
- **Exit criteria:** Calculations are centralized, tested, and no longer hardcoded in UI strings.

### Phase 2 - Data contracts and mock domain models

- Define canonical data contracts for: User, Member Tree Node, Enrollment Package, Invoice, Commission Ledger, Rank History, Payout Request.
- Align existing mock files and UI state to those contracts.
- Add versioned mock seed format so features can evolve without ad-hoc object changes.
- **Exit criteria:** All modules read from stable contracts instead of page-specific ad-hoc objects.

### Phase 3 - Member app completion (still mock backend)

- Wire currently static widgets/actions to rule-engine outputs (example: Fast Track bonus value and payout request flow).
- Replace duplicate inline business constants in `index.html` with imports/shared config.
- Complete remaining member sidebar modules using the same data contracts.
- **Exit criteria:** Member dashboard behavior is driven by shared rule/data modules.

### Phase 4 - Admin operations completion (still mock backend)

- Build admin workflows around managed entities (members, products, invoices, payout approvals, audit trails).
- Add operator-safe guardrails in UI (state validation, reason codes, and confirmation flows for payout-impact actions).
- Add report views that reconcile tree volume, cycles, and payout line items.
- **Exit criteria:** Admin flows can validate and audit member-facing numbers using shared logic.

### Phase 5 - Backend + database migration

- Introduce API and database schema based on Phase 2 contracts (minimal schema drift).
- Move authoritative business calculations to backend services.
- Switch mock fetches to API endpoints and persist domain entities in DB.
- **Exit criteria:** Data and payout math are server authoritative, UI consumes API only.

### Phase 6 - Auth and security hardening

- Replace mock credential files with backend auth (hashed passwords, token/session lifecycle, role checks).
- Enforce server-side authorization for admin/member operations.
- Close known security gaps identified during review (including static-server path traversal and client-tamperable auth state).
- **Exit criteria:** AuthN/AuthZ and sensitive operations are enforced server-side.

## Immediate Next Build Sequence (Current Scope)

1. **Completed (2026-02-22):** Implemented `Enroll Member` sidebar module with full registration form flow in `index.html`.
2. **Completed (2026-02-22):** Added Fast Track package/tier matrix computation during enrollment and bound `#fast-track-bonus-value` to computed accrued values (base + enrolled-member credits).
3. **Completed (2026-02-22):** Added JSON-backed mock persistence for newly registered members via local API (`GET/POST /api/registered-members`) writing to `registered-members.json`.
4. **Completed (2026-02-22):** Polished Enroll Member behavior:
   - Fast Track tier is now auto-applied from current account rank.
   - Placement includes `Spillover` option with required receiving parent reference.
   - Spillover target field supports type-ahead suggestions sourced from existing direct child references.
   - Spillover now captures side explicitly (`Spillover Left` / `Spillover Right`) and uses a custom in-app results list (not browser-native datalist) for receiving parent lookup.
   - Custom receiving-parent results list now shows all matches (removed prior 12-item cap).
   - Member onboarding now generates a random temporary password at registration and issues a password-setup email link (mock outbox), requiring members to set their own password before login.
5. **In Progress:** Add Fast Track payout request flow (mock state) and validation rules.
6. Keep all other compensation systems unchanged until owner unlocks next scope.

## Current Test Baseline (2026-02-22)

- Mock stores were reset for first-run enrollment testing:
  - `registered-members.json` -> empty `members` array
  - `mock-users.json` -> empty `users` array
  - `password-setup-tokens.json` -> empty `tokens` array
  - `mock-email-outbox.json` -> empty `emails` array
- Binary tree initialization is intentionally root-only right now (`targetNodes = 1`) in both:
  - `index.html` member dashboard
  - `admin.html` admin dashboard
- Resulting behavior for this baseline:
  - Enroll flow starts with zero persisted members.
  - Binary tree starts at root (no pre-seeded child nodes).

## Recent Update (2026-03-08)

- Drafted a planning prompt for a member-side theme system expansion.
- Scope classification:
  - falls under **Phase 3 - Member app completion**
  - visual system enhancement only, not roadmap expansion into new compensation logic
- Approved planning direction captured:
  - preserve the existing layout exactly
  - allow large visual changes across themes (not color-only swaps)
  - visual references should lean toward Apple and Shopify polish
- Structural freeze for prompt execution:
  - do not change sidebar/topbar/main-panel layout
  - do not change card counts, page section ordering, or responsive grid structure
  - do not change Binary Tree feature layout or control placement
- Implementation expectation for later Codex execution:
  - introduce semantic theme tokens and multiple selectable themes
  - retain existing IDs, behaviors, navigation flow, and data bindings
  - route theme selection through `Settings > Themes` inside the existing settings UI pattern
  - prefer extending current runtime theme support instead of adding a disconnected switcher
- Pending owner decision:
  - user-side theme planning is ready
  - admin-side parity is still blocked until owner confirms

## Admin Parity Update (2026-02-22)

- `admin.html` is now synced to the latest client app shell for these pages:
  - Dashboard
  - Enroll Member
  - Binary Tree
- Admin now has the same enroll-member runtime flow (including `/api/registered-members` integration) and binary summary initialization as the client shell.
- Admin auth/login shell remains in place (`mock-admin-users.json`-based sign-in).
- Admin route mapping is scoped to `/admin/...` paths so refreshed routes stay on the admin shell.

## Admin Enrollment Policy Update (2026-02-22)

- Admin enrollments are now **placement-only** for company/root tree setup.
- Admin does **not** receive Fast Track bonus credit when enrolling members.
- Admin flow now uses admin-gated endpoint:
  - `GET/POST /api/admin/registered-members`
- Admin placement allows manual spillover reference entry (no client-side direct-child restriction enforcement).

## Login UI Cleanup (2026-02-22)

- Member login page no longer shows hardcoded demo credentials.
- `login.html` keeps only the mock auth source helper line for context.
- Member identifier placeholder is now generic and cleaner:
  - `Enter your username or email`

## Admin Enrollment Error Hardening (2026-02-22)

- Unknown `/api/*` paths now return JSON `404` errors instead of HTML fallback pages.
- Admin enroll flow now surfaces clearer guidance when the server returns unexpected non-JSON content.
- This reduces false `response payload is invalid` UX when a stale server instance is running.

## Dashboard Starter-Metric Flush + BV Preview (2026-02-22)

- Enroll preview now surfaces both package economics values:
  - `Package Price`
  - `Package BV`
- Member and admin package metadata now includes `bv` to keep preview and seed metrics aligned.
- Dashboard summary hydration now checks session starter fields (`enrollmentPackageBv`, `starterPersonalPv`, `starterTotalCycles`):
  - `Personal Volume` now stays personal-only and is set from starter PV profile data.
  - Binary-driven values remain organization-side metrics (cycles, network growth, and cut-off leg volumes).
  - Account overview organization metric is now shown as `Total Organization BV` using left + right leg BV.
- Login now includes a starter-profile hydration fallback:
  - If auth payload misses starter package fields, login resolves matching member data from registered-members store and seeds package BV/PV session fields.
- Outcome targeted: newly enrolled members open with PV baseline from enrollment package, while BV remains tied to binary organization computation.

## Admin Binary Enrollment Sync (2026-02-22)

- Admin binary tree now syncs directly from `registered-members` records instead of staying on root-only mock data.
- Enrolled members are converted into live tree nodes with:
  - placement leg (`left` / `right`)
  - spillover target + side support
  - package BV mapped into node personal volume input for binary propagation
- Sync now runs:
  - after admin `GET /api/admin/registered-members` load
  - immediately after successful admin enrollment submit
- Outcome: newly enrolled members appear connected in admin Binary Tree without requiring full restart/manual data reseed.

## Admin Settings Flush-All Control (2026-02-22)

- Added a dedicated `Settings` page in `admin.html` with an admin-only `Flush All Data` button.
- Added protected backend endpoint:
  - `POST /api/admin/reset-all-data`
- Flush action clears mock stores:
  - `registered-members.json`
  - `mock-users.json`
  - `password-setup-tokens.json`
  - `mock-email-outbox.json`
- After flush, admin UI now resets key dashboard metrics to zero baseline:
  - Top cards: `Total Balance`, `Personal Volume`, `Cycles`
  - Server Cut-Off: `Left Leg BV`, `Right Leg BV`
  - Account Overview: `Total Organization BV`, `New Members`, `Total Direct Sponsors`

## User-Side Flush + Fast Track Dynamic Baseline (2026-02-22)

- Clarified scope: flush must also impact **user-side browser state** on this device.
- Admin flush flow now clears member-side storage keys:
  - `vault-auth-user`
  - `vault-auth-user-cookie`
  - `charge-dashboard-view-state`
  - `charge-binary-tree-ui-state-v1`
- User dashboard Fast Track card is now baseline-dynamic (not hardcoded static):
  - Initial card value updated to `$0.00`.
  - Runtime base now derives from session value (if present) or `0`, then adds accrued enrollment bonus from live records.

## User Dashboard Total Balance Baseline (2026-02-22)

- Updated user-side dashboard `Total Balance` card display baseline to `$0.00` for current phase.
- Intent alignment: keep balance starting at zero until full commission-to-wallet wiring is introduced.

## User Account Rank + Activity Badge (2026-02-22)

- User-side `Account Rank` card now resolves rank dynamically from authenticated user profile/session fields.
- Added 30-day purchase-activity state on the rank card badge:
  - `Active` if last product purchase is within 30 days
  - `Inactive` if no purchase date exists or purchase is older than 30 days
- Auth payload/session model now includes rank and purchase recency fields:
  - `rank` / `accountRank`
  - `lastProductPurchaseAt` / `lastPurchaseAt`

## Membership Activity Window Rule (2026-02-22)

- New enrollment behavior now marks each newly enrolled member as active for 30 days:
  - `activityActiveUntilAt = createdAt + 30 days`
- Added server endpoint for product-purchase activity updates:
  - `POST /api/member-auth/record-purchase`
- Purchase behavior now extends member activity window by 30 days from current expiry when still active:
  - if current active-until is in the future -> add 30 days from that timestamp
  - otherwise -> starts a new 30-day window from purchase time
- User-side My Store checkout now syncs this activity update and refreshes session + dashboard badge state immediately after successful invoice creation.
- Login/session payload now includes:
  - `createdAt`
  - `activityActiveUntilAt`

## User Sidebar Navigation Hotfix (2026-02-22)

- Fixed a user-side runtime regression in `index.html` that blocked sidebar navigation.
- Cause: activity badge render was called before badge element constants were initialized.
- Resolution: moved initial `renderAccountRankActivityBadge(currentSessionUser)` call to run only after badge setup code is declared.

## User Binary Tree Enrollment Sync Fix (2026-02-22)

- User-side binary tree now rebuilds from `registered-members` records instead of remaining on root-only mock seed.
- Added user-shell tree sync path in `index.html`:
  - build binary node graph from current sponsor’s enrolled members
  - apply controller `setData(...)` when tree is initialized
  - refresh summary/fallback when tree module is not yet mounted
- Sync triggers now run:
  - after member records load
  - immediately after successful member enrollment submit
- Outcome targeted: members enrolled by `Seth Fozz Aguilar` on left/right are visible in user Binary Tree without requiring relogin or manual refresh loops.

## User Cycle Rule Update (2026-02-22)

- Updated user-side cycle rule implementation to:
  - `500 BV` on one leg + `1,000 BV` on the other leg = `1 cycle`
  - leg direction is flexible (`either leg` can satisfy the 500/1000 requirement)
- User-side areas updated:
  - Server Cut-Off `Estimated Cycles` formula and helper text
  - Dashboard `Cycles` card computation
  - User binary tree init cycle thresholds
- Admin parity decision gate:
  - owner confirmed admin parity update
  - admin-side cycle rule update is now applied

## Admin Cycle Rule Parity Update (2026-02-22)

- Applied user-approved parity update to admin side for cycle logic:
  - `500 BV` + `1,000 BV` (either leg orientation) = `1 cycle`
- Admin-side areas updated:
  - Server Cut-Off `Estimated Cycles` formula and helper text
  - Dashboard `Cycles` card computation
  - Admin binary tree init cycle thresholds

## User + Admin Account Overview Trend Percentages (2026-02-22)

- User-side and admin-side `Account Overview` `%` chips are now data-driven from previous-vs-current values.
- Metrics now tracked for trend output:
  - `Total Organization BV`
  - `New Members`
  - `Total Direct Sponsors`
- Trend state is persisted in browser storage and scoped by signed-in identity:
  - user key: `charge-account-overview-trend-v1`
  - admin key: `charge-admin-account-overview-trend-v1`
- Badge state now reflects real movement:
  - positive growth (success)
  - negative growth (danger)
  - no change (info)
- Directional icon support is now applied on both shells:
  - up-right arrow for uptrend
  - down-left arrow for downtrend
  - right arrow for flat/no-change trend

## User + Admin Account Overview Metric Scope Fix (2026-02-22)

- Fixed double-counting on both shells for:
  - `New Members`
  - `Total Direct Sponsors`
- Root cause:
  - rollup logic was adding binary-summary counts and direct-member list counts together.
- Updated behavior:
  - when binary summary is available, cards now use summary-driven values directly.
  - before summary is ready, cards fall back to direct sponsor count only.
- Organization scoping update:
  - binary tree hydration now builds from each account's sponsor network (direct sponsors + their downline), not just direct-only list on member shell.
  - this aligns `Total Organization BV` with the requested scope: personally sponsored network volume.

## User Binary Placement + Root Node UX Rules (2026-02-22)

- User-side Binary Tree root node now uses member context wording:
  - root display name is `You`
  - root username is shown as subtitle on the root node
- User-side Selected Node panel now shows `Account Rank` in place of the previous cycle value slot.
- User-side tree renderer now runs in rank-secondary mode:
  - node secondary line and search-result secondary tag display `Rank ...` instead of `Cycles ...`
- Placement rule hardening for member enrollments:
  - spillover is blocked unless the enrolling user already has at least one direct child
  - spillover target must match one of the enrolling user's own direct child references
  - reverse placement to uplines/foreign branches is rejected
- Server-side guardrails were added to mirror the same non-admin rule path (API-level validation), so bypassing the form UI cannot create invalid reverse placements.

## Admin Binary UX Parity Update (2026-02-22)

- Owner-approved parity applied to admin binary presentation:
  - root node now shows `You` with admin username as subtitle
  - selected-node secondary metric label now shows `Account Rank`
  - admin binary renderer now uses rank-secondary mode (`Rank ...`) in node visuals, search results, and selected-node value
- Admin placement authority remains unchanged:
  - admin still retains unrestricted placement capability for company-root operations
  - no new admin spillover restriction was introduced in this parity patch

## Binary Load Reliability Hotfix (2026-02-22)

- Fixed intermittent Binary Tree load failure on routed pages (notably admin routes) after flush/reload.
- Root cause:
  - dynamic module import used relative path (`./binary-tree.mjs`) which could resolve to route-scoped URLs such as `/admin/binary-tree.mjs`.
- Update applied:
  - switched runtime binary module import to absolute path: `/binary-tree.mjs`
  - applied on both user shell and admin shell for route-safe loading.
  - switched Pixi asset script to absolute path: `/vendor/pixi.min.js`
  - applied on both user shell and admin shell to prevent route-relative `/admin/vendor/...` 404s.

## Binary Sponsor Placement Fix (2026-02-22)

- Fixed tree rebuild placement behavior where non-spillover enrollments could be attached from root instead of from their actual sponsor/upline node.
- Root cause:
  - placement fallback parent defaulted to `root` when `placementLeg` was not spillover.
- Updated behavior:
  - default placement parent now resolves to sponsor node (`sponsorUsername`) for standard left/right enrollments.
  - spillover still respects explicit `spilloverParentReference`; if missing/unresolved, it falls back to sponsor node (not root).
- Result for reported scenario:
  - admin root keeps only directly enrolled member (`sethfozz`) on left leg
  - Seth's own enrollees (`seth`, `fozz`) remain under Seth's left/right legs instead of leaking into admin root right leg.

## Binary Rank Source Correction (2026-02-22)

- Removed `Unranked`/placeholder behavior for binary node rank display.
- Rank resolution now follows package-bound starting ranks from business logic:
  - Personal Builder Pack -> Personal Pack
  - Business Builder Pack -> Business Pack
  - Infinity Builder Pack -> Infinity Pack
  - Legacy Builder Pack -> Legacy Pack
- Tree node rank source order (both user/admin):
  - explicit account rank (`accountRank` / `rank`) from user store
  - fallback to package-bound starting rank
- Added rank lookup API for shell sync:
  - `GET /api/member-ranks` (minimal rank-safe projection from `mock-users.json`)
- New enrollments now persist package-bound starting rank server-side on both:
  - user record (`mock-users.json`)
  - registration record (`registered-members.json`)

## Fast Track Tier Naming Update (2026-02-22)

- Renamed visible tier/rank label from `Achievers Pack` to `Infinity Pack`.
- Applied on both shells and API-backed rank projection:
  - `index.html`
  - `admin.html`
  - `serve.mjs`
- Compatibility note:
  - legacy `Achievers Pack` rank values are normalized to `Infinity Pack` for display.

## Binary Node Content + Country Flag Field (2026-02-22)

- Applied on both user and admin sides:
  - Node card content standardized to:
    - display name
    - `@username`
    - `Active/Inactive`
    - `L` and `R` BV
    - `Account Rank`
    - `Country Flag`
- Removed `Building` wording from binary node/search state labels.
- Added `Country Flag` as a required field in `Enroll Member` forms (user + admin).
- Enrollment API now persists `countryFlag` and activity-window fields into member/user records.
- Purchase activity sync now updates `registered-members.json` activity timestamps so child-node active state can stay aligned.

## Binary Flag Label Position Tweak (2026-02-22)

- Updated binary node flag display on both user/admin trees:
  - removed `Flag` text label, icon-only output is now rendered
  - moved flag icon to bottom-right slot (previous eligibility/building position)

## Flag Icons Package + Node UI Optimization (2026-02-22)

- Integrated `flag-icons` package into runtime:
  - added dependency via npm
  - linked stylesheet into both dashboards:
    - `index.html`
    - `admin.html`
- Country flag values are now standardized as ISO country codes (`us`, `ph`, etc.) with backward emoji mapping for older records.
- Enroll Member country select now submits ISO codes on both shells.
- Binary node UI was optimized for readability and spacing:
  - larger card footprint
  - cleaner row spacing and typography balance
  - subtle divider for structured sections
  - flag rendered from `flag-icons` SVG asset in bottom-right slot
- Binary search rows now also render `flag-icons` visual markers.

## Binary Node Font Size Increase (2026-02-22)

- Increased binary node typography on both user/admin trees for better readability:
  - name/title text enlarged
  - detail rows (`@username`, leg BV, account rank) enlarged
  - status chip text slightly enlarged
- Adjusted node row Y-spacing so larger type does not overlap.

## Binary Username Row Spacing Fix (2026-02-22)

- Fixed cramped username-to-divider spacing in node cards (user + admin trees):
  - moved separator line lower
  - aligned horizontal padding to node text gutters
  - rebalanced BV/rank row offsets to preserve clean spacing under the divider

## Binary Rank Label Trim (2026-02-22)

- Updated node secondary metric text (user + admin trees):
  - removed `Account Rank:` prefix on node cards/search rows
  - now shows rank value only (for tighter layout spacing)

## Root Rank Binding Fix (2026-02-22)

- Root node rank source is now explicitly tied to authenticated account rank fields first (`rank` / `accountRank`), not only UI fallback text.
- Applied on both user and admin shells for tree root hydration:
  - seeds `currentAccountRank` from session rank when available
  - root node rank now resolves from session rank -> current rank -> fallback

## Selected Node Country Code Field (2026-02-22)

- Added `Country Code` field in the Selected Node panel on both user and admin tree views.
- Field is dynamically populated from the selected node’s country value and displayed as uppercase ISO code (example: `US`, `PH`).

## Node L/R Label Format + Gap Tuning (2026-02-22)

- Updated node L/R volume text format to include colons:
  - `L: <value> BV`
  - `R: <value> BV`
- Increased visual separation between L and R on node cards by using balanced left/right anchors on the same row.
- Applied the same colon format to binary search result chips for consistency.

## Binary Fullscreen Desktop Sheet UX Parity (2026-02-22)

- Fullscreen mode on desktop now follows the mobile binary-tree sheet interaction model.
- Applied on both user and admin shells:
  - `index.html`
  - `admin.html`
  - `binary-tree.mjs` controller behavior
- Updated fullscreen UX behavior:
  - Search opens as a bottom slide-up sheet from the floating `Search members` pill.
  - Node tap opens the Selected Node panel as a bottom sheet; dismiss/backdrop closes it.
  - Floating furthest-left/right and root-focus controls now sit above the search pill.
  - Minimap and the legacy fullscreen tool strip are hidden in fullscreen sheet mode.
- Scope note:
  - Change is fullscreen-only; standard non-fullscreen desktop tree layout remains unchanged.
- Validation:
  - `node --check binary-tree.mjs`
  - Inline script parse for `index.html` and `admin.html` passed.

## Desktop Fullscreen Minimap Toggle (2026-02-22)

- Added desktop fullscreen minimap toggle beside Home in the floating quick controls.
- Applied on both user/admin shells:
  - `index.html`
  - `admin.html`
  - `binary-tree.mjs`
- Behavior:
  - Minimap appears at bottom-left in desktop fullscreen.
  - Toggle button controls show/hide state and persists in tree UI local storage.
  - Mobile fullscreen remains unchanged (minimap still hidden there).
- Validation:
  - `node --check binary-tree.mjs`
  - Inline script parse for `index.html` and `admin.html` passed.

## Desktop Minimap Settings Presets (2026-02-22)

- Added minimap settings gear in desktop fullscreen minimap panel.
- Added selectable minimap size presets:
  - Small (default)
  - Medium
  - Large
- Applied on both user/admin shells:
  - `index.html`
  - `admin.html`
  - `binary-tree.mjs`
- Behavior:
  - Selected minimap size persists in tree UI local storage.
  - Preset controls update minimap panel width and canvas height.
  - Settings menu closes on outside tap and Escape key.
- Validation:
  - `node --check binary-tree.mjs`
  - Inline script parse for `index.html` and `admin.html` passed.

## Desktop Minimap Height Increase (2026-02-22)

- Increased desktop fullscreen minimap height presets to reduce the stretched-rectangle look.
- Applied on both user/admin shells:
  - `index.html`
  - `admin.html`
- Updated preset heights:
  - Small: `11.5rem`
  - Medium: `13.75rem`
  - Large: `16rem`
- Validation:
  - Inline script parse for `index.html` and `admin.html` passed.

## Fullscreen Header Time/Cut-Off Component (2026-02-22)

- Fullscreen binary-tree header now uses a live `Server Time / Cut-Off` chip instead of the static `Binary Tree` title block.
- Applied on both user/admin shells:
  - `index.html`
  - `admin.html`
  - `binary-tree.mjs`
- Scope:
  - Desktop fullscreen: enabled
  - Mobile fullscreen: enabled
  - Non-fullscreen: unchanged (title remains)
- Validation:
  - `node --check binary-tree.mjs`
  - Inline script parse for `index.html` and `admin.html` passed.

## Fullscreen Header Top Anchor Alignment (2026-02-22)

- Refined fullscreen header so top-left time chip and top-right fullscreen action align on the same top anchor.
- Applied on both user/admin shells:
  - `index.html`
  - `admin.html`
- Implementation notes:
  - Introduced `#tree-header-actions` wrapper.
  - Fullscreen header uses top-aligned flex behavior to improve visual balance.
- Validation:
  - Inline script parse for `index.html` and `admin.html` passed.

## Binary Tree Non-Fullscreen Summary Redesign (2026-02-22)

- Replaced generic non-fullscreen Binary Tree top area with dashboard-style summary cards.
- Added live binary KPI cards on both user/admin shells:
  - Network Members
  - Estimated Cycles
  - Left Leg BV
  - Right Leg BV
  - plus live submetrics (new members, direct sponsors, cycle rule, rank)
- Added `View Fullscreen` button in the new summary area to keep fullscreen entry accessible.
- Hid legacy `tree-header-bar` and `tree-tools-dock` in non-fullscreen mode only.
- Fullscreen behavior remains intact (existing fullscreen header/tools/minimap stack still used).
- Applied files:
  - `index.html`
  - `admin.html`
- Validation:
  - Inline script parse for `index.html` and `admin.html` passed.

## Binary Tree Non-Fullscreen Cards + Canvas Fullscreen CTA Refinement (2026-02-22)

- Moved Binary Tree summary cards outside `#binary-tree-panel` so they read as page-level KPIs.
- Removed the extra in-component header/title (`Binary Tree Summary`) to avoid duplicate heading hierarchy.
- Redesigned cards with icon-led visual styling to reduce generic appearance.
- Moved non-fullscreen fullscreen action into the tree render area (top-right overlay on canvas shell).
- Fullscreen overlay button now auto-hides while in fullscreen mode.
- Applied on both shells:
  - `index.html`
  - `admin.html`
- Validation:
  - Inline script parse for `index.html` and `admin.html` passed.

## Account Overview Rank-From-Package Polish (2026-02-22)

- Polished Account Overview `Account Rank` behavior so rank is package-driven and consistently normalized.
- Canonical starting ranks are now:
  - `Personal`, `Business`, `Infinity`, `Legacy`
- Applied across:
  - `index.html`
  - `admin.html`
  - `serve.mjs`
- Dashboard card polish:
  - Account Rank card now shows source package label (`Assigned from package: ...`).
- Enrollment feedback polish:
  - Submit success now includes assigned rank for the enrolled member.
- Compatibility handling:
  - Older `Starter`/legacy rank values now fall back to package-derived rank in session/member-rank responses.
- Validation:
  - `node --check serve.mjs`
  - Inline script parse for `index.html` and `admin.html` passed.

## Account Rank Upgrade CTA + API (2026-02-22)

- Dashboard `Account Rank` card copy updated to:
  - `Complete your Task to Rank up! Next rank: Ruby`
- Removed package-source label rendering in the card.
- Added conditional upgrade action for members below Legacy:
  - In-card upgrade button + hint + inline feedback.
  - Hidden automatically when member is already at Legacy package tier.
- Added backend account upgrade endpoint:
  - `POST /api/member-auth/upgrade-account`
  - Enforces one-way tier progression only (no downgrades):
    - Personal -> Business -> Infinity -> Legacy
  - Updates user + registered member records with upgraded package/rank values.
  - Carries PV/BV upgrade gain into binary/upline rollups via `packageBv` update.
- Applied files:
  - `index.html`
  - `serve.mjs`
- Validation:
  - `node --check serve.mjs`
  - Inline script parse for `index.html` passed.

## Account Rank Card Selectable Upgrade + Dynamic Helper Text (2026-02-22)

- Upgraded Account Rank card UX on dashboard:
  - Users below Legacy can now choose any higher package tier from a selector.
  - Upgrade is no longer limited to only the immediate next package in UI.
- Dynamic helper copy rules are now enforced:
  - Legacy rank: `Complete your Task to Rank up! Next rank: Ruby`
  - Below Legacy: `Upgrade your account to maximize your commission`
- Backend upgrade API enhancement:
  - `POST /api/member-auth/upgrade-account` accepts `targetPackage`.
  - Same-tier/downgrade requests are blocked; only higher tiers are allowed.
  - If `targetPackage` is missing, API still defaults to next tier (backward compatibility).
- Applied files:
  - `index.html`
  - `serve.mjs`
- Validation:
  - `node --check serve.mjs`
  - Inline script parse for `index.html` passed.

## Dashboard Sales Team Commissions Card (2026-02-22)

- Replaced top-row Dashboard card:
  - Removed `Account Status` (`Active`)
  - Added `Sales Team Commissions`
- Card now shows commission-through-cycles using package-specific cycle multiplier profile (per business logic section 4 / line 81+, multiplier table line 103):
  - Personal: 5% / $25 / 50-cycle cap
  - Business: 7.5% / $37.5 / 250-cycle cap
  - Infinity: 10% / $50 / 500-cycle cap
  - Legacy: 12.5% / $62.5 / 1000-cycle cap
- Card outputs:
  - Current cycle commission amount
  - Multiplier badge (%)
  - Per-cycle value
  - Monthly cap value
  - Cap usage summary + progress bar
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed.

## User Dashboard Infinity Builder Card (2026-02-22)

- Replaced Dashboard `Month vs Month` with `Infinity Builder` on user side.
- Node model is now explicit ternary-per-tier:
  - `1 parent`
  - `3 children`
  - `9 grandchildren`
  - `27 great-grandchildren`
  - total `4` nodes per tier card (1 sponsor + 3 downline, reduced from 40 per owner request 2026-02-22).
- Data source is sponsor graph from the existing Binary Tree runtime (`binaryTreeMockData`) in a unilevel perspective.
- Sponsor interpretation now matches owner clarification:
  - spillover members with `sponsorId === root` are treated as direct sponsors for tier seeding.
- Tier logic now:
  - direct sponsors are grouped into batches of `3` (`Tier 1`, `Tier 2`, ...),
  - each tier traverses sponsor descendants from those 3 seeds,
  - lit-node cap is `4` per tier (3 excluding user),
  - completed tier marks bonus-ready at `$150`.
- New user dashboard bindings:
  - `#infinity-builder-direct-sponsors`
  - `#infinity-builder-active-tiers`
  - `#infinity-builder-completed-tiers`
  - `#infinity-builder-claimable-bonus`
  - `#infinity-builder-tier-cards`
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed.

## User Infinity Builder Swipe Layout Refinement (2026-02-22)

- Infinity Builder tier container is now swipe-oriented and card-based (horizontal snap carousel) for mobile portrait support.
- Default experience now supports 2 tier groups immediately in the carousel.
- Progression behavior:
  - Tier 1 and Tier 2 are visible by default.
  - higher tiers unlock as preceding tier completion requirements are met.
- Added tier carousel navigation controls:
  - previous/next buttons
  - pagination dots
  - swipe/scroll-snap alignment with active-card state.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed.

## User Infinity Builder Seed/Node Visual Upgrade (2026-02-22)

- Redesigned tier node area to emphasize the first seed structure:
  - `1 Parent + 3 Child` now has a dedicated highlighted blueprint with connector lines.
- Optimized remaining node visualization:
  - split into `9 + 27` grouped blocks (`Level 3 Cluster`, `Level 4 Network`) instead of generic uniform node rows.
- Increased node-area/card footprint for readability on mobile and desktop:
  - larger tier card width profile and taller minimum height.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed.

## User Infinity Builder Fit + Connector Style Refinement (2026-02-22)

- Refined Infinity Builder tier-card/carousel sizing to reduce wide-card feel and prevent visible horizontal bar clutter on the parent shell.
- Added carousel scrollbar hiding + containment behavior for cleaner swipe UX.
- Adjusted seed connector lines to a curved branch style and binary-tree link tone for better visual consistency with Binary Tree.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed.

## User Infinity Builder Full Usability Redesign (2026-02-22)

- Replaced the previous multi-card swipe layout with a simpler tier-tab workflow:
  - top tier tabs
  - single focused tier detail panel
  - previous/next tier navigation buttons.
- New selected-tier panel is step-based and user-friendly:
  - Step 1 (`1 Parent + 3 Children`)
  - Step 2 (`9 + 27 expansion nodes`)
  - clear progress bars and status labels.
- Connector visuals were aligned to binary-tree footprint using curved branch lines and matching link-tone styling.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed.

## User Infinity Builder Simplification (2026-02-22)

- Simplified selected-tier content to reuse main dashboard-style metric cards.
- Step model is now minimal and clearer:
  - Step 1: `3` direct child indicators that light up as the tier seeds.
  - Step 2: one progress bar for all remaining nodes (`36`) needed to complete the tier.
- Removed detailed `9 + 27` dot-cluster visuals and connector-heavy rendering from the tier panel.
- Retained:
  - tier tabs + prev/next controls
  - total tier progress bar
  - seed sponsor chips/status messaging.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed.

## User Dashboard Rollback to Budget Progress (2026-02-22)

- Scrapped the full bottom-left `Infinity Builder` container UI.
- Replaced it with a `Budget Progress` module based on `screenshot-desktop-win-like.png`:
  - category budget cards with progress bars
  - `Month vs Month` comparison side panel
  - month label (`February 2026`) in the section header.
- Infinity Builder JS logic remains in runtime codebase but is inert on the dashboard because its target DOM ids were removed.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed.

## User Infinity Builder Tier Cards (Budget-Style Layout) (2026-02-22)

- Clarified direction and reworked Infinity Builder to keep system behavior while adopting the visual layout style of Budget Progress.
- Tier groups now render as budget-like cards:
  - each card = one tier group
  - card shows tier progress (`lit/40`), progress strip, and short tier-state caption
  - selected tier card expands to full row emphasis on `sm+` breakpoints.
- Right panel now acts as tier snapshot:
  - status badge
  - seed progress (`0-3`)
  - remaining node progress (`0-36`)
  - total tier completion (`0-40`)
  - seed sponsor handles.
- Infinity Builder controls retained:
  - click tier card to focus
  - previous/next buttons for sequential navigation.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed.
  - `temporary screenshots/screenshot-37-infinity-tier-cards-layout.png` captured after auth.

## User Infinity Builder Card Simplification (3 Seed Lights) (2026-02-22)

- Finalized user-requested visual direction:
  - keep budget-card look
  - remove side snapshot complexity
  - show only tier cards with `3` seed nodes that light up.
- Current Infinity Builder card behavior:
  - `Tier N` label + accent dot
  - `lit / 40` primary value
  - progress bar for total tier completion
  - helper line for lock/remaining/completed state
  - `3` seed-node lights (`0-3` lit) per card.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed.
  - `temporary screenshots/screenshot-38-infinity-tier-cards-3nodes.png` captured after auth.

## User Infinity Builder Eligibility Gate (Infinity and Above) (2026-02-22)

- Enforced MLM rule on dashboard: only `Infinity` and `Legacy` ranks can participate in Infinity Builder.
- Non-eligible ranks (e.g., `Personal`, `Business`) now see:
  - locked-state Infinity Builder card
  - current rank label
  - participation requirement message (`Infinity and above`).
- Eligible ranks continue to see the simplified budget-style tier cards with 3 seed lights.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed.
  - Locked-state visual check captured: `temporary screenshots/screenshot-39-infinity-eligibility-locked.png`.

## Legacy Leadership Bonus Naming Alignment (2026-02-22)

- Polished naming across the new tier-card component:
  - `Infinity Builder` (UI copy) renamed to `Legacy Leadership Bonus`.
  - Locked-state title and eligibility copy now reference `Legacy Leadership Bonus`.
- Kept existing runtime ids/functions for stability; this change is user-facing copy alignment.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed.
  - Authenticated UI screenshot: `temporary screenshots/screenshot-41-legacy-leadership-bonus-dashboard.png`.

## Infinity Builder Bonus Naming Correction (2026-02-22)

- Final naming correction applied:
  - `Legacy Leadership Bonus` -> `Infinity Builder Bonus`
- Updated dashboard copy:
  - section title
  - locked-state title
  - eligibility sentence.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed.

## Infinity Builder Bonus Anticipation Card (Locked Tier Preview) (2026-02-22)

- Added a default locked preview card for the next tier (anticipation state).
- Tier list now shows one additional future tier card by default:
  - example: `Tier 3` appears locked even before unlock.
- Locked preview card copy:
  - `Complete the requirements to unlock Tier 3.`
- Locked preview visuals:
  - `Locked` badge
  - `0 / 40`
  - unlit 3-seed indicators.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed.
  - Authenticated screenshot captured: `temporary screenshots/screenshot-43-tier3-anticipation-visible.png`.

## Infinity Builder Bonus 10-Tier Server Mockup (2026-02-22)

- Applied a temporary live mockup so owner can inspect high-card-count behavior directly on server.
- Mock mode is currently enabled and renders 10 cards:
  - Tier 1 complete
  - Tier 2 in progress
  - Tier 3 partially seeded
  - Tier 4 to Tier 10 locked anticipation.
- This is intentionally reversible via one toggle:
  - `INFINITY_BUILDER_MOCKUP_MODE_ENABLED`
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed.
  - Authenticated screenshot: `temporary screenshots/screenshot-48-tier10-server-mockup-live.png`.

## Infinity Builder Bonus Claim + Archive + Paging (2026-02-22)

- Added component-level workflow controls:
  - `View` dropdown with `Active` and `Completed`
  - claimable commission text (`Unclaimed Commission`)
  - pagination controls (6 cards per page).
- Active rules:
  - shows only non-claimed tier cards
  - completed but unclaimed tiers remain visible and claimable.
- Completed rules:
  - shows claimed-tier archive only
  - includes `Date Started` and `Date Claimed` per tier entry.
- Claim action:
  - `Claim Infinity Builder Commission` button marks tier as claimed
  - claimed tiers are hidden from Active and appear in Completed archive
  - claim records are stored in local storage by user key.
- Button placement refinement:
  - claim button is now middle-right, above seed/progress area.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed.
  - Screenshots:
    - Active page 1: `temporary screenshots/screenshot-53-claim-archive-active-page1-clean.png`
    - Active page 2: `temporary screenshots/screenshot-54-claim-archive-active-page2-clean.png`
    - Completed archive: `temporary screenshots/screenshot-55-claim-archive-completed-with-record.png`
    - Middle-right claim button placement: `temporary screenshots/screenshot-56-claim-button-middle-right.png`

## Dashboard Stretch Fix for 10-Tier Mockup (2026-02-22)

- Fixed top-row stretch issue affecting:
  - `Account Overview`
  - `Quick Actions` stack
- Cause:
  - equal-height desktop row template (`lg:grid-rows-2`) forced row 1 to match row 2 height.
- Resolution:
  - removed `lg:grid-rows-2` so rows auto-size to content.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed.
  - Authenticated screenshot: `temporary screenshots/screenshot-49-tier10-grid-stretch-fix.png`.

## Infinity Builder Mock Reset for Claimed Tier Recovery (2026-02-22)

- Addressed accidental Tier 1 claim in mock mode where claim CTA disappeared from Active view.
- Added mock-only auto-reset behavior so tier-card mockup restarts clean on reload:
  - clears Infinity Builder claim records for current user
  - runs once per page load
  - leaves non-mock claim persistence unchanged.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed (`Parsed 1 inline script block(s) successfully.`).

## Infinity Builder Active Page Height Stabilization (2026-02-22)

- Resolved pagination UX issue where Infinity Builder Bonus card area shrank on page 2 when fewer than 6 active tiers were rendered.
- Active-view pagination now pads short pages with invisible non-interactive filler cards so the component keeps page-1 height.
- Completed/archive view remains unchanged (no filler padding).
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed (`Parsed 1 inline script block(s) successfully.`).

## Infinity Builder Completed Archive Detail + View Filter Theme Match (2026-02-22)

- Expanded `Completed` tier cards with additional archive context:
  - completed nodes summary (`Completed Nodes`)
  - first 3 direct sponsors/child nodes as handle chips
  - existing started/claimed dates retained.
- Enhanced claim record payload so completed archive keeps sponsor/node snapshot fidelity:
  - stores `completedNodeCount`
  - stores first `3` `seedHandles` at claim time.
- Restyled `View` selector (`Active`/`Completed`) to match dashboard theme and avoid mismatched native webkit look:
  - `appearance-none` styled select
  - custom chevron icon
  - matched border/elevation/focus states.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed (`Parsed 1 inline script block(s) successfully.`).

## Infinity Builder Seed Row Sponsor Tags (2026-02-22)

- Updated active tier cards to replace plain 3-dot seed indicators with sponsor identity tags:
  - structure now follows `[colored dot + direct sponsor username]`
  - supports 3 slots per tier with `Open Slot` placeholders for unfilled seeds.
- Preserved `X/3 seed lit` status text.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed (`Parsed 1 inline script block(s) successfully.`).

## Infinity Builder Completed Empty-State Height Fix (2026-02-22)

- Resolved remaining layout issue where `Completed` view collapsed when no claimed tier cards existed.
- Added an empty-state card plus hidden filler cards so component height remains aligned to 6-card page footprint.
- Extended filler padding behavior to both `Active` and `Completed` paginated renders for consistent container sizing.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed (`Parsed 1 inline script block(s) successfully.`).

## Infinity Builder Theme-Matched Unique Tier Palettes (2026-02-22)

- Added deterministic per-tier palette mapping so each tier card has a unique accent while staying within current dashboard brand family (teal/cyan/blue tones).
- Palette now drives:
  - tier header dot
  - progress bar fill
  - sponsor seed tags and chip accents
  - completed archive badge/amount highlights
  - claim CTA tint for completed tiers.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed (`Parsed 1 inline script block(s) successfully.`).

## Infinity Builder Mobile Stretch Fix (2026-02-22)

- Fixed mobile stretch behavior in Infinity Builder Bonus component.
- Root adjustments:
  - hidden filler cards are now desktop-only (`hidden sm:block`) to avoid oversized empty vertical space on small screens.
  - sponsor/tag text now truncates with max widths to prevent layout expansion on narrow devices.
  - claim CTA got mobile width/text-size constraints to prevent overflow pressure.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed (`Parsed 1 inline script block(s) successfully.`).
  - Mobile viewport screenshot captured:
    - `temporary screenshots/screenshot-60-mobile-infinity-responsive-fix.png`

## Infinity Builder View Label Update (2026-02-22)

- Updated Infinity Builder view-mode naming in UI:
  - `Active` -> `Building`.
- Aligned related user-facing copy:
  - `active tiers` -> `building tiers`
  - `No active tiers available` -> `No building tiers available`
  - empty-state helper copy now references `Building tier groups`.
- Internal value key remains `active` for compatibility with existing logic.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed (`Parsed 1 inline script block(s) successfully.`).

## Infinity Builders Bonus Summary Card Inside Component (2026-02-22)

- Added a Fast Track-style summary card directly inside the Infinity Builder Bonus component (below component header).
- Card now displays Infinity Builder commission balance/state using the existing unclaimed commission computation.
- Status behavior:
  - `Locked` when not eligible
  - `Building` when eligible but no unclaimed commission
  - `Available` when claimable commission exists.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed (`Parsed 1 inline script block(s) successfully.`).
  - Authenticated screenshot:
    - `temporary screenshots/screenshot-61-infinity-component-copied-card.png`

## Infinity Builders Bonus Claim-Transfer Logic Fix (2026-02-22)

- Adjusted summary card commission source to match expected flow:
  - claiming a completed tier now transfers value into `Infinity Builders Bonus` card balance.
- Current split:
  - `Unclaimed Commission` (component header): still tracks completed but unclaimed tiers.
  - `Infinity Builders Bonus` summary card: now tracks claimed commission balance.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed (`Parsed 1 inline script block(s) successfully.`).

## Infinity Builder Terminology Adjustment (2026-02-22)

- Updated tier-card copy to use `Direct Sponsorship slot` language instead of `seed` language.
- Applied to:
  - slot-left helper text
  - `X/3 ... lit` labels
  - placeholder/filler-card label
  - component subtitle text.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed (`Parsed 1 inline script block(s) successfully.`).

## Infinity Builder Metric Label Copy Update (2026-02-22)

- Updated tier metric copy:
  - `3/3 Direct Sponsorship slots lit` -> `3/3 Direct Sponsorships Requirements`
- Applied to both active tier cards and filler/placeholder cards for consistency.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed (`Parsed 1 inline script block(s) successfully.`).

## Infinity Builder Locked-Tier Copy Rule Update (2026-02-22)

- Locked tier helper copy now references the tier immediately before it.
- New pattern:
  - `Complete the requirements of Tier N to Unlock Tier N+1`
- Example:
  - Tier 4 locked -> `Complete the requirements of Tier 3 to Unlock Tier 4.`
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed (`Parsed 1 inline script block(s) successfully.`).

## Infinity Builder Header/Card Layout Polish (2026-02-22)

- Removed the old component header text block (title + subtitle + unclaimed line).
- Infinity Builders summary card now serves as the top/header presentation inside the component.
- Moved `View` dropdown controls down below the summary card and above the tier-card grid.
- Updated default summary-card footnote copy to match claim-transfer behavior.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed (`Parsed 1 inline script block(s) successfully.`).

## Infinity Builder View Controls as Radio Buttons (2026-02-22)

- Replaced `View` dropdown with dedicated mode buttons in a radio group:
  - `Building`
  - `Completed`
- Updated interaction logic to use radio `change` events and render-time checked-state syncing.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed (`Parsed 1 inline script block(s) successfully.`).

## Infinity Builder Data Source Reverted (2026-02-22)

- Reverted Infinity Builder from mock snapshot mode back to original data source.
- Updated toggles:
  - `INFINITY_BUILDER_MOCKUP_MODE_ENABLED = false`
  - `INFINITY_BUILDER_MOCKUP_RESET_CLAIMS_ON_LOAD = false`
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed (`Parsed 1 inline script block(s) successfully.`).

## Infinity Builder Claim State Reconciliation (2026-02-22)

- Added automatic cleanup for stale claimed-tier records when live tier completion no longer matches stored claims.
- Current behavior:
  - keeps claim records only for tiers that are currently completed in live/original data
  - removes invalid claim records automatically during Infinity Builder render.
- This resets inflated/leftover claimed bonus cases from mock/testing state transitions.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed (`Parsed 1 inline script block(s) successfully.`).

## User Dashboard: Legacy Leadership Bonus UI Duplicate Added (2026-02-22)

- User-side dashboard now includes a second bonus component directly under Infinity Builder Bonus.
- The new component is labeled:
  - `Legacy Leadership Bonus`
- Layout/sizing was matched to the Infinity Builder component by reusing the same card structure/classes.
- Collision safety:
  - duplicated element ids/input names were renamed with `legacy-leadership-*` prefixes.
- Current scope:
  - UI duplication only; no separate Legacy Leadership business/data binding has been added yet.
- Applied file:
  - `index.html`

## User Dashboard: Legacy Leadership Bonus Logic Wiring + Package Gate (2026-02-22)

- Legacy Leadership Bonus is now fully wired with the same runtime behavior model as Infinity Builder Bonus:
  - Building/Completed mode switching
  - pagination
  - claim/archive records
  - summary-card status/value updates.
- Legacy Leadership now has isolated claim persistence:
  - `charge-legacy-leadership-claims-v1`
- Tier-population rule added for Legacy Leadership:
  - seed/direct sponsorship slots count only members enrolled with `legacy-builder-pack`.
- Supporting data update:
  - binary tree node records now carry normalized `enrollmentPackage` metadata used by bonus snapshot filtering.
- Sync behavior:
  - both bonus components rerender together on initial load, tree sync, and enrollment-derived recalculations.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed (`Parsed 2 inline script block(s) successfully.`).

## User Dashboard: Bonus Container Size Trim (2026-02-22)

- Addressed oversized stacked height on:
  - `Infinity Builder Bonus`
  - `Legacy Leadership Bonus`
- Removed hidden filler-card padding from both component render paths (empty and paginated states).
- Both containers are now content-height driven and no longer force a large fixed card footprint.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed (`Parsed 2 inline script block(s) successfully.`).

## User Dashboard: Bonus Span Correction Pass 2 (2026-02-22)

- Post-screenshot correction applied to resolve remaining vertical span/stretch in stacked bonus containers.
- Layout updates:
  - stacked wrapper now uses `self-start`
  - removed `h-full` from Infinity and Legacy bonus outer shells.
- Screenshot validation:
  - `temporary screenshots/screenshot-64-dashboard-span-fix-2.png`
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed (`Parsed 2 inline script block(s) successfully.`).

## User Dashboard: Infinity Builder Rule Update + Weekly 1% Override (2026-02-22)

- Scope confirmed by owner:
  - **user-side only** for this update.
- Infinity Builder eligibility now requires both:
  - `Infinity/Legacy` rank gate
  - `3` direct enrollments to Infinity Pack and above (`infinity-builder-pack` / `legacy-builder-pack`).
- Infinity Builder tier seeding now uses Infinity+ direct package filter.
- Added weekly override commission to Infinity Builder balance:
  - direct enrolled users only
  - direct user must also be Infinity Builder eligible/completed
  - payout base = direct user organization BV events (`packageBv`)
  - rate = `1%`
  - cycle timing = weekly cutoff (server cutoff config)
  - payout mode = auto-added (no manual claim)
  - retroactive historical closed-cycle volumes included.
- Legacy Leadership card **no longer shares** Infinity Builder eligibility — has its own independent eligibility system:
  - `LEGACY_LEADERSHIP_ELIGIBLE_RANKS = new Set(['legacy'])` — only Legacy rank qualifies (not Infinity)
  - `LEGACY_LEADERSHIP_DIRECT_ENROLLMENT_REQUIREMENT = 3` — counts Legacy Package enrollments only
  - Separate functions: `resolveLegacyLeadershipEligibility()`, `getLegacyLeadershipQualifiedDirectEnrollmentsForSponsor()`, `buildLegacyLeadershipEligibilityRequirementMessage()`
  - Infinity Pack users now correctly see Legacy Leadership as **Locked**
- Screenshot validation:
  - `temporary screenshots/screenshot-65-infinity-weekly-override.png`
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed (`Parsed 2 inline script block(s) successfully.`).

## User Dashboard: Infinity Builder Active Tier Card — Per-Node Eligibility Indicators (2026-02-22)

- Active (claimed) tier cards now show per-sponsor eligibility indicators:
  - **Green/lit** sponsor chip = sponsor has met their 3-enrollment requirement = user is earning 1% weekly override from them
  - **Gray/dim** sponsor chip = sponsor hasn't met requirement = not earning 1%
- New utility: `findRegisteredMemberByHandle()` looks up member objects from handle strings
- New constants: `SPONSOR_NODE_ELIGIBLE_PALETTE` (green), `SPONSOR_NODE_INELIGIBLE_PALETTE` (gray)
- Hover tooltip on each chip shows status: "Active — earning 1%" or "Inactive — not earning 1%"
- Small legend row below sponsor chips for at-a-glance reference
- **Legacy Leadership Bonus:** excluded from this change per owner instruction
- Applied file: `index.html`
- Validation: Parsed 4 inline script block(s) successfully.

## Binary Tree Sync + Spillover Privacy/Cycle Update (2026-02-23)

- User and admin binary tree builders were aligned to placement-driven graph construction.
- User-side binary tree now scopes by receiving-parent placement subtree, so spillover-received nodes are visible in the receiver tree even when sponsor/upline differs.
- User-side node identity privacy now applies in binary tree views:
  - node labels are anonymized (`Spillover Direct`, `Direct Sponsor`, `Network Member`)
  - personal names/usernames are hidden in node/search/selected-panel outputs
  - rank + left/right BV remain visible.
- Cycle-volume propagation engine in `binary-tree.mjs` now counts placement subtrees for leg totals:
  - spillover-received volume contributes to receiver cycle pairing as intended.
  - sponsor-only spillover reference fields remain available but are excluded from cycle-leg totals to avoid double-counting.
- Admin binary tree now builds from full global placement graph (company root scope), improving sync with user-side network progression.
- Applied files:
  - `index.html`
  - `admin.html`
  - `binary-tree.mjs`
- Validation:
  - `index.html` inline scripts parsed successfully (`2` blocks)
  - `admin.html` inline scripts parsed successfully (`2` blocks)

## User Binary Privacy Refinement: Spillover Branch-Only Masking (2026-02-23)

- User-side Binary Tree privacy masking was narrowed from global node anonymization to spillover-branch-only anonymization.
- Current behavior:
  - root spillover direct branches (received from upline) are anonymized
  - personally enrolled direct branches remain visible.
- Masking scope logic:
  - detect root spillover direct node(s)
  - anonymize only those node(s) and all descendants in their placement subtree.
- Display labels in masked area:
  - `Spillover Direct N`
  - `Spillover Network N`
- Cycle/BV behavior unchanged by this refinement:
  - spillover branch BV still participates in placement-leg cycle matching.
- Applied files:
  - `index.html`
- Validation:
  - `index.html` inline scripts parsed successfully (`2` blocks)

## Binary Tree Fullscreen Selected Node Spillover Privacy Update (2026-02-23)

- Selected-node panel now masks spillover sponsor identity:
  - `Direct Sponsor` shows `Anonymous` for spillover nodes and navigation is disabled.
- Placement parent display now includes a UI fallback resolver:
  - prefers `placementParentId`
  - falls back to detected parent from left/right child linkage for spillover consistency.
- Binary node metadata visibility tightened:
  - rank hidden for spillover/anonymized nodes in rank mode
  - country hidden for spillover/anonymized nodes in node cards, search rows, and selected panel.
- Applied file:
  - `binary-tree.mjs`
- Validation:
  - `node --check binary-tree.mjs` passed.

## Binary Tree Spillover Sponsor Display Bug Fix (2026-02-23)

- Fixed user-tree normalization so spillover nodes with hidden/out-of-scope sponsors are not remapped to the viewer/root as sponsor.
- This prevents Selected Node from incorrectly showing `Direct Sponsor: You (@...)` for spillover nodes.
- Spillover flag is now preserved through normalization even when sponsor identity is unresolved in scoped trees.
- Applied file:
  - `binary-tree.mjs`
- Validation:
  - `node --check binary-tree.mjs` passed.

## Binary Tree Spillover Node Violet Highlight (2026-02-23)

- Spillover nodes now render with violet styling for immediate visual distinction.
- Applied in shared node-card renderer:
  - violet spillover border
  - violet spillover background tint
  - brighter violet selected state for spillover nodes.
- Scope:
  - affects user/admin binary tree views, including fullscreen mode.
- Applied file:
  - `binary-tree.mjs`
- Validation:
  - `node --check binary-tree.mjs` passed.

## Binary Tree Spillover Color Scope Tuning (2026-02-23)

- Spillover node violet styling was toned down to a more subtle shade.
- Highlight scope is now perspective-aware:
  - user tree uses `received-only` spillover highlighting
  - admin tree disables spillover highlight.
- User-perspective behavior now matches expected flow:
  - sender account tree: spillover nodes render as regular nodes
  - receiver account tree: received spillover nodes render with violet distinction.
- Applied files:
  - `binary-tree.mjs`
  - `index.html`
  - `admin.html`
- Validation:
  - `node --check binary-tree.mjs` passed.

## Binary Tree Anonymous Scope Correction (2026-02-23)

- User-side anonymous mode now applies only to spillovers sourced from outside the current organization scope.
- Internal spillovers (sponsored by the user or downline within the same scoped tree) are no longer anonymized.
- Implemented via external-source spillover detection in `index.html` tree-scoping logic.
- Example alignment:
  - `sethfozz` perspective: internal spillover nodes remain visible.
  - receiver perspective (e.g., `seth`): outside-source spillover branches remain anonymized.
- Applied file:
  - `index.html`
- Validation:
  - `Parsed 2 inline script block(s) successfully.`
  - local data simulation confirmed `sethfozz` anonymized node count is `0`.

## Binary Tree Select Node Sync Update (2026-02-23)

- Select Node privacy rules are now synchronized with Binary Tree anonymization scope.
- Internal spillover nodes in the same organization are no longer forced to `Direct Sponsor: Anonymous`.
- Outside-org spillover nodes remain anonymized in Select Node.
- Applied file:
  - `binary-tree.mjs`
- Validation:
  - `node --check binary-tree.mjs` passed.

## Binary Tree Anonymous Mode: Viewer-Owned Downline Visibility (2026-02-23)

- Anonymous masking now supports owner-visibility exception on user side.
- In outside-source spillover branches, nodes enrolled by the logged-in user (and sponsor-downline descendants) remain visible.
- Outside-source nodes not owned by the viewer remain anonymous.
- Applied file:
  - `index.html`
- Validation:
  - `Parsed 2 inline script block(s) successfully.`
  - dataset simulation confirms `eaglethree` can see own enrolled node under anonymous branch.

## Binary Tree Fullscreen Header KPI Reuse (2026-02-23)

- Fullscreen Binary Tree header now includes compact KPI chips reusing page summary metrics:
  - Network Members
  - Account Rank
  - Estimated Cycles
  - Leg Volumes.
- Chips are timer-component sized and styled as header utilities.
- Mobile fullscreen keeps chips hidden for readability.
- Implemented on both user/admin shells with shared summary data wiring.
- Applied files:
  - `index.html`
  - `admin.html`
- Validation:
  - `index.html` inline scripts parsed successfully (`2` blocks)
  - `admin.html` inline scripts parsed successfully (`2` blocks)

## Fullscreen Header Metrics Swipe UX (2026-02-23)

- Server Time and fullscreen KPI chips are now grouped in one horizontal header rail.
- Added metric icons for faster scanability.
- Mobile fullscreen now supports horizontal swipe across chips in the server-time header zone.
- Implemented on both user/admin pages.
- Applied files:
  - `index.html`
  - `admin.html`
- Validation:
  - inline scripts parsed successfully on both files (`2` blocks each).

## Fullscreen Header Stacked Metric Cards (2026-02-23)

- Fullscreen Binary Tree header metrics were switched from a free horizontal rail to a single-card deck.
- UX now shows one metric card at a time with:
  - previous/next controls
  - touch swipe advancing one card per gesture
  - keyboard left/right support on focused deck container.
- Styled cards were updated to mirror dashboard card feel (icon tile, compact label/value hierarchy, accent glow).
- Implemented on both user and admin views for parity.
- Applied files:
  - `index.html`
  - `admin.html`
  - `binary-tree.mjs`
- Validation:
  - `node --check binary-tree.mjs` passed
  - inline script syntax checks passed on `index.html` and `admin.html` (`4` blocks each)

## Fullscreen Metrics: PC All-Cards + Mobile Dots (2026-02-23)

- Desktop fullscreen now renders all metric cards simultaneously in the header.
- Mobile fullscreen now uses:
  - stacked single-card view
  - swipe navigation
  - dot paginator below the card stack
  - no arrow buttons in layout.
- Header spacing was tuned so mobile cards gain width while keeping header actions intact.
- Applied files:
  - `binary-tree.mjs`
  - `index.html`
  - `admin.html`
- Validation:
  - `node --check binary-tree.mjs` passed
  - inline scripts parsed successfully on both HTML files (`4` blocks each)

## Binary Tree Summary Cards: Mobile Deck (Outside Fullscreen) (2026-02-23)

- Non-fullscreen Binary Tree summary cards now use mobile deck behavior:
  - one card visible at a time
  - swipe navigation
  - dot paginator below cards.
- Desktop/tablet retains the existing multi-card grid.
- Implemented on both user and admin pages.
- Applied files:
  - `index.html`
  - `admin.html`
- Validation:
  - inline scripts parsed successfully on both HTML files (`4` blocks each)

## Infinity Builder Tier-Claim Consistency Fix (2026-02-23)

- User issue addressed for `sethfozz` dashboard case:
  - Tier 2 showed `Open Slot 3` but could still be claimed.
- What changed (`index.html`):
  - Tier completion now strictly requires all 3 direct sponsorship seeds before `isCompleted` can become true.
  - Tier node progress is capped while direct requirement is incomplete to prevent false full-progress states.
  - Active-tier slot indicators now use actual direct `seedCount` (not inferred lit-node count), so open slots remain correctly unlit.
  - Same slot-indicator consistency patch applied to Legacy Leadership cards for parity.
- Expected outcome:
  - Infinity Builder Tier 2 remains non-claimable until all 3 direct slots are filled in the user-scoped binary tree.
  - Existing invalid claims are pruned by the existing claim reconciliation pass once tier completion no longer qualifies.
- Validation:
  - `index.html` inline scripts parsed successfully (`Parsed 1 inline script block(s) successfully.`).

## Infinity Builder Claimed-Tier Card UX Update (2026-02-23)

- User-requested Infinity Builder card customization implemented on user dashboard (`index.html`):
  - removed fixed tier amount display (`$150.00`) from claimed-tier cards
  - removed `Completed Nodes` section
  - relabeled sponsor section title to `Infinity Builder Bonus`
  - added per-seeded-direct-sponsor mini snippets showing running organization BV and projected `1%` by cutoff.
- Added cutoff-aware per-direct helper for override projections:
  - `resolveInfinityBuilderDirectMemberRunningOverrideBreakdown(...)`
  - used in claimed-tier rendering and reused by the weekly override aggregate function for logic consistency.
- Expected outcome:
  - users can see per-seed projected earnings to the next cutoff directly inside each claimed tier card.
- Validation:
  - `index.html` inline scripts parsed successfully (`Parsed 1 inline script block(s) successfully.`).

## Infinity Builder Label/CTA Copy Tweak (2026-02-23)

- Updated Infinity Builder tier card copy (`index.html`):
  - claim button now reads `Claim $150.00 Commission`
  - archive/claimed state badge text now reads `Active` (was `Claimed`)
- Purpose:
  - align tier card wording with requested active-state terminology and explicit claim amount.
- Validation:
  - `index.html` inline scripts parsed successfully (`Parsed 1 inline script block(s) successfully.`).

## Tier Completed Copy Adjustment (2026-02-23)

- Updated completed-tier helper copy in `index.html`:
  - `Tier complete. $150.00 bonus ready.` -> `Tier Complete.`
- Applied to both Infinity Builder and Legacy Leadership tier card helper lines.
- Validation:
  - `index.html` inline scripts parsed successfully (`Parsed 1 inline script block(s) successfully.`).

## Tier Claim CTA Visual Parity Update (2026-02-23)

- Tier-card claim buttons were updated to use primary brand styling like `Request Payout` buttons.
- Applied on user-side `index.html` for:
  - Infinity Builder claim CTA
  - Legacy Leadership claim CTA
- Result:
  - claim CTAs now render in primary green with glow/hover/focus parity instead of per-tier accent tint.
- Validation:
  - `index.html` inline scripts parsed successfully (`Parsed 1 inline script block(s) successfully.`).

## Tier Date Completed Invoice Hook (2026-02-23)

- Added `Invoice` link placeholders next to `Date Completed:` in tier archive cards.
- Implemented on user-side `index.html` for:
  - Infinity Builder archive cards
  - Legacy Leadership archive cards
- Added future-component data hooks on each link:
  - invoice source (`infinity-builder` / `legacy-leadership`)
  - tier number
  - completed-at timestamp
- Validation:
  - `index.html` inline scripts parsed successfully (`Parsed 1 inline script block(s) successfully.`).

## Claim Action Auto-Navigation (2026-02-23)

- Claim action now auto-navigates users to the `Active` tier list after successful claim.
- Implemented in `index.html` for:
  - Infinity Builder claim handler
  - Legacy Leadership claim handler
- Navigation behavior:
  - switches mode to archive/active (`completed` value)
  - jumps to the last archive page to show newly claimed card immediately.
- Validation:
  - `index.html` inline scripts parsed successfully (`Parsed 1 inline script block(s) successfully.`).

## Account Overview BV Scope Separation (2026-02-23)

- Added `Personal Organization BV` as a dedicated subtext line under the `Total Organization BV` card in user `index.html`.
- Scope split now visible in-card:
  - `Total Organization BV` -> binary leg total (`left + right`)
  - `Personal Organization BV` -> sponsor-organization aggregate (from current sponsor tree traversal).
- Implementation:
  - new element id: `account-overview-personal-organization-bv`
  - populated in `renderOrganizationSummaryRollups()` using `getOrganizationMembersForCurrentSponsor()`.
- Validation:
  - `index.html` inline scripts parsed successfully (`Parsed 1 inline script block(s) successfully.`).

## Total Organization BV Helper Text Removed (2026-02-23)

- Removed the `Total Organization BV` helper copy line:
  - `Binary organization volume (left + right leg)`
- `Personal Organization BV` subtext remains visible as the context label.
- Validation:
  - `index.html` inline scripts parsed successfully (`Parsed 1 inline script block(s) successfully.`).

## Binary Tree Fullscreen Enroll Mode Restoration (2026-02-26)

- Restored fullscreen enroll-mode implementation after rollback.
- Current state:
  - `Enroll Member` toggle is in the fullscreen top control row (furthest controls cluster).
  - Anticipation nodes render only on parents with available child slots.
  - Anticipation spacing is expanded in enroll mode to reduce overlap.
  - Entire anticipation node cards are clickable (full hitbox).
  - Clicking anticipation nodes opens an in-fullscreen centered enroll modal (no route navigation).
  - Modal layout is responsive with constrained height + internal scroll for smaller heights.
  - Bottom search anchor/tools are suppressed while modal is open for cleaner spacing.
  - Toggle label text is normalized to `Enroll Member`.
- Files touched:
  - `binary-tree.mjs`
  - `index.html`
- Validation:
  - `binary-tree.mjs` syntax check passed.
  - `index.html` inline script parse passed.

## Binary Tree Progress Reapplied After Backtrack (2026-02-26)

- Reapplied Binary Tree UI/function updates after rollback:
  - `Total Direct Sponsor` KPI card restored in both dashboard summary and fullscreen metrics.
  - Advanced Search `Direct Sponsors` filter toggle restored (`directOnly` state + persistence).
  - top-row mobile/fullscreen direct toggle restored and wired to same filter action.
  - direct-toggle icons now use Material Symbols state icons:
    - off: `face`
    - on: `face_retouching_off`
  - direct-sponsor node icon and conditional Active badge placement restored:
    - with direct icon -> Active badge under icon
    - without direct icon -> Active badge top-right
  - Legacy Leadership tier helper copy restored to:
    - `Legacy Direct Sponsor(s) remaining`.
- Mobile control state re-applied:
  - minimap toggle hidden in mobile fullscreen
  - direct toggle anchored in right-side action cluster with Home
- Files touched:
  - `index.html`
  - `binary-tree.mjs`
- Validation:
  - `node --check binary-tree.mjs` passed.
  - `index.html` inline scripts parsed successfully (`Parsed 2 inline script block(s) successfully.`).

## Binary Tree Interaction + Settings Recovery (2026-02-26)

- Recovered rolled-back Binary Tree interaction updates and settings UI.
- Reapplied in `binary-tree.mjs`:
  - trackpad pan and pinch support in both fullscreen and standard Binary Tree view
  - mouse pan mode gated by `Space` hold + drag
  - mouse wheel zoom modifiers:
    - macOS: `Cmd + Wheel`
    - Windows/Linux: `Ctrl + Wheel`
  - fullscreen keyboard exit changed to long-press `Esc` (`700ms`)
  - interaction settings persistence + API:
    - `reverseTrackpadMovement`
    - `trackpadZoomSensitivity` (default `0.30`)
    - `getInteractionSettings()` / `updateInteractionSettings(...)`
  - emits `binary-tree-fullscreen-changed` on enter/exit for shell coordination.
- Reapplied in `index.html`:
  - added Binary Tree settings toggles (control bar + mobile fullscreen row)
  - added settings panel with:
    - Account Overview
    - Accessibility controls (reverse movement toggle, zoom strength slider)
    - Logout button
  - updated Material Symbols import to include `settings` icon
  - Esc capture behavior now closes settings panel first and blocks fullscreen exit while settings are open.
- Validation:
  - `node --check binary-tree.mjs` passed.
  - `index.html` inline script syntax check passed.

## Tier Claim Mode Toggle + Persistence Stability (2026-03-03)

- Added Admin Settings control for tier-claim behavior:
  - `Tier Claim Mode` toggle (Live vs Mock reset-on-reload).
- Added server-backed runtime settings support (`/api/runtime-settings`, `/api/admin/runtime-settings`) with persisted config file.
- Updated member dashboard to consume runtime setting and apply claim reset only when mock mode is enabled.
- Added hydration-aware claim reconciliation guard to prevent accidental claim pruning before registered-member/tree data has loaded.
- Current expected behavior:
  - Live mode: claim state persists across reload.
  - Mock mode: claim state clears on reload for UI/button testing.
- Next checks recommended in QA:
  - Toggle mode in Admin Settings and verify member dashboard behavior flips after reload.
  - Verify Infinity and Legacy claim cards both honor mode.
  - Verify mode remains persisted after server restart.

## Tier Claim Mode Robustness Update (2026-03-03)

- Added client fallback behavior for Tier Claim Mode runtime setting.
- If `/api/runtime-settings` is unavailable, admin and member pages now use shared localStorage key `charge-runtime-settings-v1`.
- Admin toggle no longer hard-reverts when API is missing; it can persist local mode state and continue testing.
- Member dashboard now reads fallback mode when API cannot be reached.
- Residual limitation:
  - fallback settings are browser+origin scoped (e.g., `localhost` and `127.0.0.1` are separate stores).

## User Dashboard KPI + Personal Volume Purchase Sync (2026-03-03)

- Completed the pending user-side dashboard KPI wiring follow-up for `Total Balance`:
  - card now has runtime binding (`#dashboard-total-balance-value`)
  - resolves from session wallet fields when present
  - otherwise falls back to live aggregate of current commission balances.
- Fixed user-reported `Personal Volume` issue:
  - store purchases now pass `pvGain` to purchase-activity API
  - backend now persists `starterPersonalPv` growth on purchase
  - dashboard rebind now runs immediately after session patch so `Personal Volume` updates right after checkout.
- Files touched for this fix:
  - `index.html`
  - `serve.mjs`

## Personal Volume Existing Purchase Backfill Guard (2026-03-03)

- Added a second-layer PV safety check on user My Store init:
  - scans existing invoice rows that belong to the logged-in user
  - compares invoice BP total vs already-credited purchase PV in session model
  - backfills only the missing delta to prevent undercount while avoiding double-credit.
- Ownership guard added:
  - legacy buyer-name matching now requires invoice `createdAt`, which blocks demo seed invoice rows from accidental PV backfill.
- New invoice rows now include buyer identity fields (`buyerUserId`, `buyerUsername`, `buyerEmail`) for stronger future reconciliation.
- Scope note:
  - backfill depends on purchases present in available invoice data for the user.

## Personal Volume Strict Server Sync (2026-03-03)

- Security direction confirmed by owner:
  - user-side Personal Volume must be server-authoritative only.
- Applied change:
  - removed local fallback that patched `starterPersonalPv` in browser when purchase activity API was unavailable.
- Current expected behavior:
  - PV KPI updates only from successful `POST /api/member-auth/record-purchase` responses.
  - if purchase sync API is unreachable or errors, no local PV mutation is applied.

## Dashboard Mockup Mode Cleanup (2026-03-03)

- Added unified runtime control `dashboardMockupModeEnabled` and connected it to admin settings as the master mockup switch.
- Admin settings now drives both:
  - `dashboardMockupModeEnabled`
  - `tierClaimMockModeEnabled`
- User dashboard behavior now under one mockup switch:
  - KPI cards (`Total Balance`, `Personal Volume`, `Cycles`) switch between seeded mock preview and live JSON-backed values.
  - Infinity/Legacy tier preview mode follows dashboard mockup state.
  - Recent Activity no longer shows seeded “before-state” store activity when mockup mode is OFF.
  - Mock-seeded store invoices are added in mock mode and removed in live mode.
- Security alignment retained:
  - Personal Volume purchase sync remains server-authoritative only.

## Legacy Tier Card Regression Fix (2026-03-03)

- Fixed a dashboard mockup-mode regression where Legacy Leadership cards could show Infinity-style mock tier data.
- Applied:
  - separated Legacy and Infinity mock snapshot builders in user dashboard tier pipeline.
  - shared snapshot resolver now accepts per-program mock snapshot builder input.
- Expected behavior:
  - Legacy and Infinity tier cards render from their own program-specific mock snapshots.

## Infinity Mock Tier State Alignment (2026-03-03)

- Adjusted Infinity Builder mockup tier snapshot to match live state semantics.
- Removed contradictory mock state where a tier could appear fully progressed yet remain non-completed.
- Current mock Infinity progression:
  - Tier 1 completed
  - Tier 2 building (`2/3` direct requirement)
  - Tier 3 locked preview

## Legacy Mock Tier State Alignment (2026-03-03)

- Applied matching state alignment for Legacy mock tier progression.
- Current mock Legacy progression:
  - Tier 1 completed
  - Tier 2 building (`2/3` direct requirement)
  - Tier 3 locked preview

## Legacy Tier Live-Match Enforcement (2026-03-03)

- Applied owner correction:
  - Legacy tier cards should mirror live Legacy computation even when dashboard mockup mode is enabled.
- Change:
  - disabled mock snapshot override for Legacy tier pipeline.
- Expected behavior:
  - Legacy cards now always reflect live Legacy tier logic from current tree/member data.

## Purchase PV Sync Failure Visibility (2026-03-03)

- Added client-side integrity check for purchase activity sync response.
- Behavior:
  - if invoice is created but server response does not actually increase `starterPersonalPv` by purchase `pvGain`, checkout now shows explicit PV-sync failure message.
  - guidance message points to backend restart requirement when stale server process is detected.
- Goal:
  - prevent silent mismatch between Store invoice success and Personal Volume KPI updates.

## Binary Tree BV Clarity Update (2026-03-03)

- Completed: Receiving-parent BV display is now clearer in Binary Tree views.
- Current behavior:
  - Leg values are labeled as Team BV (`L Team` / `R Team`) in cards and search rows.
  - Selected node now shows Team BV with Direct/Downline split per leg.
- Scope:
  - UX and labeling only; underlying placement and BV aggregation math remains unchanged.
- Affected files:
  - `binary-tree.mjs`
  - `admin.html`

## Anonymous Node BV Display Update (2026-03-03)

- Completed: anonymous/privacy-masked nodes now expose true Self BV and Team BV in Binary Tree views.
- Current behavior:
  - Anonymous node card/search line items: `Self BV` + `Team BV`.
  - Anonymous selected-node panel: left value shows `Self`, right value shows `Team`.
  - Non-anonymous nodes still use left/right team leg display with direct/downline detail.
- Scope:
  - Display logic only; underlying BV/placement/cycle calculations remain unchanged.
- Affected file:
  - `binary-tree.mjs`

## Anonymous BV Rule Finalized (2026-03-03)

- Completed: anonymous node BV now follows placement-side add rule.
- Current behavior for anonymous/privacy-masked nodes:
  - display remains Left/Right Team BV.
  - node personal BV is added to the displayed leg corresponding to node placement side.
  - opposite leg remains as computed downline/team value.
- Affected file:
  - `binary-tree.mjs`

## Selected Node Rank + Base BV (2026-03-03)

- Completed: Selected Node `Account Rank` field now includes Base BV.
- Current format:
  - `<Rank> | Base BV: <value> BV`
- Example:
  - `Personal | Base BV: 192 BV`
- Affected file:
  - `binary-tree.mjs`

## Selected Node Base BV Package Coverage (2026-03-03)

- Completed: selected-node Account Rank Base BV now supports all package/rank tiers.
- Current fallback mapping:
  - Personal/Starter = 192
  - Business = 360
  - Infinity/Achievers = 560
  - Legacy = 960
- Affected file:
  - `binary-tree.mjs`

## Direct vs Downline Label Logic Fixed (2026-03-03)

- Completed: Select Node left/right breakdown now uses sponsor-based direct BV.
- Current behavior:
  - `Direct` = personally enrolled user BV on that leg.
  - `Downline` = remaining team BV on that leg.
- Affected file:
  - `binary-tree.mjs`

## Anonymous Rank Display Update (2026-03-03)

- Completed: anonymous/privacy-masked nodes now show rank values in Binary Tree rank mode.
- Scope:
  - rank visibility enabled for node/search/selected rank text paths.
  - country masking remains in place.
- Affected file:
  - `binary-tree.mjs`

## Store Invoice JSON Persistence + Recent Activity Reload Fix (2026-03-03)

- Added a dedicated JSON-backed invoice store to support live runtime persistence:
  - `mock-store-invoices.json`
  - API endpoint: `GET/POST /api/store-invoices`
- User-side My Store flow now loads invoices from API on initialization and creates invoices through API POST.
- Recent Activity now remains stable after reload in live mode because purchase entries are rebuilt from persisted invoice rows.
- Admin `Flush All Data` now also clears persisted store invoices.
- Affected files:
  - `serve.mjs`
  - `index.html`
  - `mock-store-invoices.json`
- Known limitation:
  - Store invoice endpoint currently follows the existing mock-backend trust model (no additional server-side auth gate yet).

## Recent Activity User-Scope Fix (2026-03-03)

- Fixed user report where `Recent Activity` purchase items were shared across accounts.
- Updated user dashboard activity build path to include only invoices owned by the currently authenticated user.
- Current behavior:
  - purchase activity cards now render from `storeInvoices` filtered by `isInvoiceOwnedByCurrentUser(...)`.
  - other users no longer see each other's purchase activity entries.
- Affected file:
  - `index.html`

## Request Payout Mock/Live Wiring Update (2026-03-03)

- Investigated payout-button behavior and confirmed it was running as in-memory client simulation only.
- User-side payout requests are now wired to dashboard mockup mode:
  - Live mode (`dashboardMockupModeEnabled = false`): payout offsets persist per user in local storage.
  - Mock mode (`dashboardMockupModeEnabled = true`): payout offsets reset to runtime mock state and do not persist.
- Added per-user payout offset storage key:
  - `charge-commission-payout-offsets-v1`
- Admin settings/UX now explicitly includes payout-request behavior in mode descriptions and success feedback.
- Admin quick-action `Request Payout` button is now mode-aware:
  - enabled in mock mode preview
  - disabled in live mode
- Affected files:
  - `index.html`
  - `admin.html`

## Payout Recent Activity Reload Persistence Fix (2026-03-03)

- Fixed user report: payout-request entries showing as pending then disappearing after reload.
- Root cause:
  - payout events were only appended to in-memory runtime activity list.
- Update applied:
  - added user-scoped payout activity persistence store in browser local storage:
    - `charge-commission-payout-activity-v1`
  - live mode now persists payout request activity entries per signed-in user.
  - Recent Activity now rebuilds payout request rows from persisted payout activity in live mode.
  - mock mode keeps payout activity non-persistent behavior.
- Affected file:
  - `index.html`

## Payout Request Server Queue + Admin Fulfillment Wiring (2026-03-03)

- Converted payout requests from browser-only persistence to JSON-backed shared queue flow.
- Added new payout request store file:
  - `mock-payout-requests.json`
- Backend additions in `serve.mjs`:
  - `GET /api/payout-requests` (member-scoped by user identity params)
  - `POST /api/payout-requests` (member submits payout request)
  - `GET /api/admin/payout-requests` (admin queue view)
  - `POST /api/admin/payout-requests/fulfill` (admin marks request fulfilled)
  - `POST /api/admin/reset-all-data` now also clears payout requests and returns `cleared.payoutRequests`.
- User dashboard (`index.html`) payout flow update:
  - live mode now submits payout requests to API before applying local payout offset deduction.
  - Recent Activity payout entries are now hydrated from server payout requests (still user-scoped).
  - payout status rendering supports `Pending` and `Fulfilled` states.
- Admin settings (`admin.html`) update:
  - added `Payout Request Queue` card with refresh + `Mark Fulfilled` actions.
  - queue reloads in Settings page and after actions.
  - flush summary now includes invoice + payout request clear counts.
- Result:
  - payout requests persist after reload,
  - remain per-user on member side,
  - and are now fulfillable through admin panel with shared state.

## Sales Team Request Payout Fallback Hotfix (2026-03-03)

- Investigated report: Sales Team `Request Payout` click sometimes had no visible effect.
- Root behavior found:
  - live-mode request errors were only logged to console and surfaced no UI change.
- Patch applied in `index.html`:
  - when live API payout create fails, request now falls back to local persisted payout activity,
  - payout offset deduction still applies,
  - Recent Activity still updates immediately,
  - button busy state still resets normally.
- Result:
  - Sales Team payout action no longer appears dead during temporary API unavailability.

## Sales Team Payout Persistence + Activity De-dup Refinement (2026-03-03)

- Follow-up patch for report: Sales Team payout looked mock-like after reload and payout activity could appear duplicated.
- Updated member payout logic in `index.html`:
  - Live-mode payout offsets now re-sync from server payout-request entries after payout request load.
  - Recent Activity payout source now prioritizes server-backed payout entries; legacy local entries are only used as fallback when no server entries exist.
  - Removed live-mode local success fallback on API failure to prevent mock-like local-only payout writes.
- Result:
  - payout state in live mode now tracks server request data on reload,
  - and duplicate payout activity rows are reduced by avoiding mixed local+server rendering in normal live flow.
- Added cleanup on successful server payout load:
  - legacy local payout activity entries for current user are cleared once server-backed entries exist.

## Commission Order Page + Fulfillment Form Upgrade (2026-03-03)

- Admin payout fulfillment has been moved from **Settings** into a routed sidebar page: **Commissions**.
- Fulfillment workspace is now labeled **Commission Order**.
- Pending orders now require admin-entered fulfillment details before completion:
  - mode of transfer (required)
  - bank details (required)
  - transfer reference (optional)
  - general info (optional)
- Backend now validates and persists fulfillment details when admin completes an order.

### Scope/impact

- UI routing + navigation updates for Commissions page in `admin.html`.
- API validation/storage updates in `serve.mjs` for `/api/admin/payout-requests/fulfill`.
- Settings page now references Commissions as the fulfillment workspace.

### Active follow-up opportunities

- Add fulfilled-order detail editing / correction flow for admin mistakes.
- Add structured bank fields (bank name/account name/account number) once payout schema is finalized.

## Commission Order Shopify-Style UI Pass (2026-03-03)

- `Commissions > Commission Order` now uses a Shopify-like admin order-management layout instead of stacked cards.
- New structure includes:
  - KPI summary strip
  - search + filters + refresh toolbar
  - order table as primary browsing surface
  - dedicated right/secondary detail panel pattern (rendered below table in current layout)
- Fulfillment action now happens from the selected order’s detail panel form.

### Current impact

- Commission fulfillment operations are now easier to scan and triage at list level before opening order details.
- UI now better supports scaling to larger order volumes versus card feed layout.

## Commission Order Flow Update: Dedicated Detail Page (2026-03-03)

- Order list and order details are now split into separate pages/views.
- Current admin behavior:
  - browse/filter in `Commissions` list view
  - click an order to navigate into `Commission Order Details` page
  - complete fulfillment from that detail page
  - return via back action to list

### Result

- Matches requested workflow expectation of "next page" for per-order review and fulfillment.
- Preserves Shopify-like list ergonomics while reducing visual clutter during fulfillment.

## Commission Fulfillment Gateway Routing (2026-03-03)

- Gateway-specific fulfillment routes are now prepared in admin payout flow.
- Stripe is wired as primary gateway route; Bank Transfer and Zelle routes are also ready.

### Current behavior

- Admin `Mode of Transfer` selection drives API target route automatically.
- Fulfilled order details now expose gateway metadata (status/reference/route/message).
- Unsupported gateway routes are blocked server-side.

### Ready routes

- `POST /api/admin/payout-requests/fulfill/stripe`
- `POST /api/admin/payout-requests/fulfill/bank-transfer`
- `POST /api/admin/payout-requests/fulfill/zelle`
- fallback generic: `POST /api/admin/payout-requests/fulfill`

## Commission Order Status Override Option (Default-Preserving) (2026-03-03)

- Added a new status-change control in `Commission Order Details` so admins can explicitly update order status when needed.
- Default behavior is intentionally unchanged:
  - status selector defaults to `No status change (default)`
  - existing fulfillment flow remains the primary path for pending requests

### New admin behavior

- Detail page now shows a dedicated `Order Status` card with:
  - current status badge
  - status selector (`No status change`, `Set to Pending`, `Set to Fulfilled`)
  - `Apply Status` action button
- Status changes call:
  - `POST /api/admin/payout-requests/status`
- When setting status to `Fulfilled` from a pending order, fulfillment form values (transfer mode, bank details, reference, general info) are reused in the status payload.
- Fulfilled orders can now be reopened to `Pending` from the detail page.

### Scope/impact

- Frontend: `admin.html` now supports manual status override while preserving prior default UX.
- Backend: `serve.mjs` status endpoint is now actively used by the Commission Order detail page.

### Known limitation

- The pending-order fulfillment form still requires bank details in the UI even when transfer mode is Stripe (server allows Stripe without bank details).

## Admin Settings App Tools Update (2026-03-04)

- Added a new Settings app-tool action: **Force Server Cut-Off**.
- New backend route is live:
  - `POST /api/admin/force-server-cutoff`
- Action now force-runs cut-off processing and applies:
  - binary-tree cycle recalculation from stored leg BV snapshots
  - sales-team commission recalculation (cap, gross, payout offset, net)
- Admin settings now show immediate run feedback and update the local Server Cut-Off card baseline right after a successful forced run.

## Force Cut-Off Execution History (2026-03-04)

- Added persistent execution history storage for force cut-off runs:
  - `mock-force-server-cutoff-history.json`
- Backend now supports:
  - `GET /api/admin/force-server-cutoff` (history fetch)
  - `POST /api/admin/force-server-cutoff` now returns/saves history entries.
- Settings UI now includes an `Execution History` panel with refresh + latest run summaries.

## Member-Side Forced Cut-Off Sync Fix (2026-03-04)

- Resolved gap where admin force cut-off did not reset member Server Cut-Off card immediately.
- Added new public event endpoint:
  - `GET /api/server-cutoff-events`
- Member cutoff panel now syncs forced cutoff timestamp and applies baseline reset when newer force-run is detected.
- Expected behavior now:
  - after force-run, member Left/Right BV resets to `0`
  - accumulation resumes from that forced cut-off point.

## Admin Scope Correction (2026-03-04)

- Removed admin-local cutoff-application behavior from force-run flow.
- Admin now remains control-only:
  - trigger force cut-off
  - view history
  - no admin earnings/cutoff participation logic applied in force action.

## Store Workflow + Product Management Parity (2026-03-04)

- Applied full store refresh across both shells as requested:
  - user-side My Store now follows:
    - Product Grid -> Product Page -> Checkout
  - admin-side My Store now uses:
    - Product Management (no storefront cart grid)

### User-side status

- Product Grid added as step 1 with active catalog rendering.
- Product Page added as step 2 with full description/details and quantity controls.
- Checkout added as step 3 with:
  - card details
  - billing address
  - shipping mode
  - order summary + editable cart lines
- Shared catalog storage enabled:
  - localStorage key: `charge-store-product-catalog-v1`
- Inventory decrements on successful checkout and persists to same catalog store.
- Sponsor/rank discount logic preserved (existing `uplineDiscountRate` formula remains intact).

### Admin-side status

- Replaced old Storefront cart/product grid with Product Management UI.
- Admin can:
  - create products
  - edit products
  - set image, price, title, description, stock count, BV points, product discount
  - archive/unarchive products
  - delete products
- Archived products are hidden from user storefront; deleted products are removed.

### Validation

- Inline script parse passed:
  - `index.html` (2 blocks)
  - `admin.html` (2 blocks)
- Headless load checks completed for both root member/admin URLs without page runtime exceptions.

## Binary Tree Node Cut-Off Baseline Reset (2026-03-04)

- Completed: server cut-off now propagates into binary-tree node BV values (user + admin), not only Server Cut-Off panel math.

### What is now in place

- `serve.mjs`
  - `POST /api/admin/force-server-cutoff` stamps:
    - `serverCutoffBaselineStarterPersonalPv`
    - `serverCutoffBaselineSetAt`
  - Baseline stamping is applied across user/member datasets used by tree generation.

- `index.html` (user shell)
  - Added baseline-aware BV helpers:
    - `resolveMemberServerCutoffBaselineVolume(...)`
    - `resolveMemberBinaryVolume(...)`
  - Tree node `leftPersonalPv` now uses post-cut-off delta BV.

- `admin.html` (admin shell)
  - Added the same baseline-aware BV helper path.
  - Admin binary tree node generation now uses post-cut-off delta BV.

### Expected runtime behavior

- After force cut-off: existing binary-tree node BV returns to `0`.
- As new purchases/activity happen: node BV increments from zero for the current cycle window.

### Validation snapshot

- `serve.mjs` syntax check passed.
- Force cut-off baseline fields written successfully.
- Post-cutoff member-volume delta check returned `0` for existing records until new activity.

## Personal Volume Card Cut-Off Reset (2026-03-04)

- Completed: Dashboard Personal Volume now uses current-cycle PV and resets to `0` at cut-off.

### Implementation highlights

- `serve.mjs`
  - `GET /api/member/server-cutoff-metrics` now returns:
    - `totalPersonalPv`
    - `baselinePersonalPv`
    - `currentWeekPersonalPv`
  - Personal baseline now advances on cut-off application and persists to user/member records.
  - Auth response now includes cutoff baseline fields for session-side hydration.

- `index.html`
  - Starter dashboard metrics now compute `currentWeekPersonalPv`.
  - Personal Volume card now renders cycle PV (`currentWeekPersonalPv`) instead of lifetime starter PV.
  - Server cut-off sync updates local session baseline and Personal Volume card in place.

- `admin.html`
  - Personal Volume display switched to baseline-aware current-week PV.

### Validation snapshot

- `serve.mjs` syntax check passed.
- Inline script parse passed for user/admin shells.
- API flow confirmed:
  - purchase increments `currentWeekPersonalPv`
  - force cut-off resets `currentWeekPersonalPv` back to `0`.

## Theme Logo Integration Update (2026-03-07)

- Completed: Sidebar branding in the member shell now uses Premiere Life logo assets from `brand_assets/Logos` and switches by theme.
- Mapping now in place:
  - default -> `Premiere Life Logo_White_Purple`
  - apple -> `Premiere Life Logo_Transparent`
  - shopify -> `Premiere Life Logo_Mono White`
- File updated: `index.html`.

## Sidebar Logo Sizing Adjustment (2026-03-07)

- Completed: Increased sidebar logo visual size in `index.html` by adding a clipping shell and vertical scale compensation for padded SVGs.
- Theme mapping remains unchanged; only presentation/sizing was adjusted.

## Sidebar Logo Screenshot Validation (2026-03-07)

- Completed: Screenshot-based logo sizing validation and fit correction for all three themes in `index.html`.
- Final result: larger logo presentation with full wordmark visible (no horizontal clipping).

## Sidebar Logo Final Fit (2026-03-07)

- Completed: Switched to cropped sidebar-specific logo SVGs and medium-width rendering in `index.html`.
- Result: no clipping in default/apple/shopify themes and stable medium visual size.

## Logo Asset Compliance Pass (2026-03-07)

- Completed: Sidebar logo now uses only the original provided SVG assets (default/apple/shopify mappings) with no stretch distortion.
- Temporary generated sidebar logo files were removed.

## Login/Auth Brand Rename (2026-03-08)

- Completed: Updated login-facing brand copy to `Premiere Life`.
- Files updated:
  - `login.html`
  - `admin.html`
  - `password-setup.html`
- Scope:
  - Member login title and hero brand label updated.
  - Admin login shell title and hero brand label updated.
  - Password setup page title updated for authentication flow consistency.

## Admin Login: PostgreSQL-Backed Auth (2026-03-15)

- Completed: Admin login no longer reads `mock-admin-users.json` from the browser.
- New behavior:
  - Admin login posts to `POST /api/admin-auth/login`
  - Credentials are validated from `charge.admin_users` in PostgreSQL
  - Existing admin session storage behavior in `admin.html` remains intact
- Backend additions:
  - `backend/routes/admin-auth.routes.js`
  - `backend/controllers/admin-auth.controller.js`
  - `backend/services/admin-auth.service.js`
  - `backend/stores/admin-user.store.js`
  - `backend/app.js` route registration for `/api/admin-auth`
- Frontend update:
  - `admin.html` login flow switched from mock JSON lookup to API auth call
  - login helper text updated to reflect DB auth source

## Admin Enrollment API Route Parity (2026-03-15)

- Completed: fixed admin enrollment `API endpoint not found` issue.
- Root cause:
  - Admin UI posts to `/api/admin/registered-members`
  - Backend only exposed `/api/registered-members`
- Fix implemented:
  - Added route aliases in `backend/routes/member.routes.js`:
    - `GET /admin/registered-members`
    - `POST /admin/registered-members`
  - Aliases reuse existing registered-member controllers/service logic.
- Result:
  - Admin enroll calls now hit backend logic instead of 404.

## Admin Flash/Reload Loop Stabilization (2026-03-15)

- Completed: fixed rapid flashing/reload behavior on admin-side routes.
- Root cause:
  - Admin shell uses SPA-style paths under `/admin/*` (example: `/admin/dashboard`)
  - Backend fallback previously served `index.html` for unknown non-API paths
  - Reloading/opening `/admin/*` could mount the wrong app shell and trigger repeated redirects
- Fix implemented in `backend/app.js`:
  - non-API fallback now serves `admin.html` for:
    - `/admin`
    - `/admin/`
    - `/admin.html`
    - any path starting with `/admin/`
  - other non-API routes continue to serve `index.html`
- Result:
  - Admin namespace URLs now remain stable (no rapid reload loop).

## Flush Action DB Permissions (Same Database) (2026-03-15)

- Completed: implemented role-based privilege split for destructive admin flush on the same `lnd_premiere_app` database.
- New model:
  - normal app traffic uses `charge_app_service` (mapped to `charge_service_role`)
  - privileged flush path uses `charge_app_admin` (mapped to `charge_admin_role`)
- Permission hardening:
  - `TRUNCATE` granted to admin role path
  - `TRUNCATE` explicitly unavailable to service role path
- Backend updates:
  - Added admin DB pool: `backend/db/admin-db.js`
  - Updated `resetAllMockData` to use admin pool + transactional truncate in `backend/services/admin.service.js`
- Environment updates:
  - `.env` now includes `DB_ADMIN_USER` and `DB_ADMIN_PASSWORD`
  - `.env` primary app DB user switched to `charge_app_service`
- Result:
  - app still runs with least-privileged service login for normal endpoints
  - flush action can be isolated to admin DB credentials within the same DB instance.

## Binary Tree BV Upstream Regression Fix (2026-03-15)

- Completed: fixed missing upstream BV accumulation after member enrollments.
- Root cause:
  - enrolled `registered_members` rows were persisted with `starter_personal_pv = 0`
  - tree rollup helpers depend on starter PV to propagate left/right leg BV
- Fix implemented:
  - `backend/services/member.service.js`
    - `createRegisteredMember` now writes `starterPersonalPv: packageBv`
  - `admin.html` and `index.html`
    - BV resolvers now safely fallback to package BV when starter PV is zero/missing
- Data repair executed on active DB (`lnd_premiere_app`):
  - backfilled `charge.registered_members.starter_personal_pv` from `package_bv` where needed
  - backfilled `charge.member_users.starter_personal_pv` from `enrollment_package_bv` where needed
- Result:
  - binary-tree upstream leg volumes now populate correctly for existing and newly enrolled members.

## Binary Tree Right-Leg Tree-Enroll Persistence Fix (2026-03-15)

- Completed: fixed right-leg enrollments from anticipated-node/tree-enroll flow being stored as left placement.
- Root cause:
  - backend enrollment normalization coerced `placementLeg='spillover'` into `'left'`.
  - tree-enroll lock path uses spillover mode to target selected anticipated slots, so right-side intent was lost in persistence.
- Fix implemented:
  - `backend/services/member.service.js` now preserves spillover placement mode and persists:
    - `placementLeg`
    - `spilloverPlacementSide`
    - `spilloverParentReference`
    - `isSpillover`
  - added server validation requiring spillover parent reference.
- Validation:
  - service-level create flow verified `placement_leg='spillover'` + `spillover_placement_side='right'` now persists correctly in `charge.registered_members`.

## Admin Force Cut-Off History Route Parity (2026-03-16)

- Completed: fixed admin Settings `API endpoint not found` error for force cut-off history.
- Root cause:
  - frontend calls `GET /api/admin/force-server-cutoff` to render execution history
  - backend only had `POST /api/admin/force-server-cutoff`
- Fix implemented:
  - added `getForceServerCutoffHistory(query)` service in `backend/services/admin.service.js`
  - added `listForceServerCutoffHistory` controller in `backend/controllers/admin.controller.js`
  - registered `GET /api/admin/force-server-cutoff` in `backend/routes/admin.routes.js`
  - preserved existing force-run `POST` route behavior
- Validation:
  - syntax checks passed for all touched backend files
  - temp-server smoke check:
    - `GET /api/admin/force-server-cutoff` now returns `200` (no API fallback 404)

## Admin Force Cut-Off Check Constraint Guard (2026-03-16)

- Completed: fixed force cut-off crash from DB constraint `sales_team_commission_snapshots_check3`.
- Root cause:
  - force-run commission recompute could set `payout_offset_amount` greater than `gross_commission_amount`
  - DB check constraint rejects rows where gross is smaller than payout offset
- Fix implemented:
  - `backend/services/admin.service.js`
    - in `forceServerCutoff`, clamp payout offset to gross before persisting:
      - `payoutOffsetAmount = min(grossCommissionAmount, payoutOffsetAmountRaw)`
    - net amount continues to compute from clamped offset
- Validation:
  - `node --check backend/services/admin.service.js` passed
  - temp-server `POST /api/admin/force-server-cutoff` returned `200` successfully (no constraint violation)

## Sales Team Commission Endpoint Constraint Hardening (2026-03-16)

- Completed: fixed `POST /api/sales-team-commissions` malformed payload path causing DB constraint-driven `500`.
- Root cause:
  - metrics service sanitized only non-negative values and did not enforce constraint relationships before write.
  - invalid combinations (for example `gross < payoutOffset`, `capped > total`) reached PostgreSQL and failed.
- Fix implemented:
  - `backend/services/metrics.service.js`
    - added relational normalization in `sanitizeSalesTeamCommissionRecord(...)`:
      - `cappedCycles = min(totalCycles, cappedCyclesRaw)`
      - `overflowCycles = max(0, totalCycles - cappedCycles)`
      - `payoutOffsetAmount = min(grossCommissionAmount, payoutOffsetAmountRaw)`
      - `netCommissionAmount = grossCommissionAmount - payoutOffsetAmount`
      - uppercased `currencyCode`
    - added `roundCurrencyAmount(...)` helper for commission amount precision.
- Validation:
  - `node --check backend/services/metrics.service.js` passed
  - repro payload previously returning `500` now returns `200` with normalized commission payload and no DB constraint error.

## Dashboard Commission Containers: DB-Backed Persistence (2026-03-16)

- Completed: implemented server-backed commission container persistence for dashboard transfer/claim flows in live mode.
- Root cause addressed:
  - Infinity/Legacy tier claim maps were client-local, so refresh/session drift could re-open already-claimed tiers and inflate dashboard balances.
- Backend added:
  - `GET /api/commission-containers`
  - `POST /api/commission-containers`
  - files:
    - `backend/stores/commission-container.store.js`
    - `backend/services/commission-container.service.js`
    - `backend/controllers/commission-container.controller.js`
    - `backend/routes/commission-container.routes.js`
    - route registration in `backend/app.js`
- Frontend updated:
  - `index.html` now hydrates commission containers from API on startup and when returning to live mode.
  - Live mode claim-map access now uses server snapshot for:
    - Infinity Builder Bonus
    - Legacy Leadership Bonus
  - Added debounced server sync for commission container balances and claim maps.
  - Added immediate (awaited) server persistence after tier-claim clicks to avoid rapid-refresh race conditions.
  - Added guard to block claim/transfer actions until commission container hydration completes in live mode.
- DB requirement:
  - `charge.member_commission_containers` is auto-provisioned on first API access via `adminPool` (`DB_ADMIN_*` or fallback `DB_*`) when that role has schema-create privileges.
  - fallback: create the same table manually if admin auto-provision is unavailable.
  - API now supports fallback synthetic identity keys when a member row cannot be resolved, preventing false 404s for commission container persistence.
- Validation:
  - `node --check` passed for all new backend files and `backend/app.js`.
  - Extracted dashboard inline JS from `index.html` and passed `node --check`.

## User Store Link Backfill (2026-03-25)

- Completed:
  - added one-time/reusable backfill script to populate missing user store-link fields.
  - added npm task: `backfill:store-links`.
  - executed backfill on current DB data.
- Results:
  - users scanned: `7`
  - users updated: `7`
  - missing store-link fields after run: `0`
- Current state:
  - existing users now have `storeCode`, `publicStoreCode`, and `attributionStoreCode`.
  - new user registration path already generates these fields by default in `createRegisteredMember`.

## My Store No-Link Attribution QA Flow (2026-03-25)

- Completed:
  - added checkout UI field for optional manual member store code routing (dev testing).
  - manual code flow now works without public links or terminal calls.
  - backend now rejects invalid provided member store codes with a clear `404` validation message.
- Current state:
  - QA can test store attribution from `My Store > Checkout` by entering `Member Store Code` (e.g. `CHG-ZERO`).
  - if blank, checkout uses existing mapped attribution behavior.

## Public Store + Admin Shared Catalog (2026-03-25)

- Completed:
  - added new public store route/page at `/store`.
  - added DB-backed shared store product catalog APIs.
  - moved admin product management from localStorage to backend API persistence.
  - updated member My Store product loading to consume shared backend catalog.
- API additions:
  - `GET /api/store-products`
  - `GET /api/admin/store-products`
  - `PUT /api/admin/store-products`
- Current state:
  - admin controls the shared store catalog used by both member store and public store.
  - public store checkout supports store-code attribution without requiring login.

## Public Store UX: Browse-First Flow Split (2026-03-25)

- Completed:
  - split public store into three dedicated pages:
    - `/store` (product grid browse)
    - `/store/product` (single-product details)
    - `/store/checkout` (checkout only)
  - added shared navbar on store pages with `Home`, `Products`, `Support (Contact Us)`, `Member Login`, and `Free Member Login`.
  - removed public BV display from storefront cards and checkout visual totals.
  - moved checkout interaction off storefront landing page.
  - added shared script `storefront-shared.js` for cart/state/checkout consistency.
- Backend routing:
  - `backend/app.js` now serves:
    - `/store/product` -> `store-product.html`
    - `/store/checkout` -> `store-checkout.html`
- Validation:
  - syntax checks passed for `backend/app.js`, `storefront-shared.js`, and all inline scripts in new store pages.
  - isolated runtime smoke test on port `3131` returned `200` for `/store`, `/store/product`, and `/store/checkout`.
- Current state:
  - public shoppers can browse products first, drill into product details, then checkout on a separate page.

## Public Store Routing Hardening (2026-03-25)

- Completed:
  - hardened storefront link targets to direct HTML pages (`store.html`, `store-product.html`, `store-checkout.html`).
- Why:
  - avoids route-fallback mismatch behavior when backend route updates are not yet restarted.
- Validation:
  - headless click flow now shows stable two-step navigation (`store.html` -> `store-product.html?...`) with no loop.

## Public Store Refinements (2026-03-25)

- Completed:
  - removed member store code controls from storefront product-grid page.
  - moved support to dedicated `store-support.html` page and updated nav labels to `Support`.
  - removed `You might also like` from product page for current single-product phase.
  - converted product description/details area from list layout to paragraph narrative layout.
  - filtered BV references from product page descriptive display.
- Backend:
  - added `/store/support` route alias to serve support page.
- Validation:
  - syntax checks + inline script checks passed.
  - runtime smoke test passed for store, product, checkout, and support routes.

## Public Store Custom Stripe Checkout (2026-03-25)

- Completed:
  - implemented embedded Stripe Elements checkout UI on `/store/checkout` (no forced redirect to Stripe-hosted page).
  - added backend payment-intent endpoints and checkout-config endpoint.
  - preserved existing hosted checkout endpoints for backwards compatibility.
  - hardened backend checkout validation (buyer name/email/shipping/store code).
  - kept invoice finalization + owner BV credit idempotent across session and intent flows.
- API now available:
  - `GET /api/store-checkout/config`
  - `POST /api/store-checkout/intent`
  - `POST /api/store-checkout/intent/complete`
- Required env:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_PUBLISHABLE_KEY`
  - `PUBLIC_APP_ORIGIN`
- Validation:
  - syntax checks passed for updated backend/frontend files.
  - inline script parse check passed for `store-checkout.html`.
  - service-level execution confirmed expected validation errors and successful payment-intent creation payload shape.

## Public Store Free Account Registration Parity (2026-03-25)

- Completed:
  - upgraded Free Account checkout flow to use enrollment-style registration fields before payment.
  - changed Free Account submit CTA to `Register and Pay`.
  - added conditional spillover controls (placement side, parent mode, manual parent reference).
  - extended checkout payload + validation to carry free-account registration fields end-to-end.
  - persisted free-account fields in Stripe metadata and re-used them during payment finalization member creation.
- Backend safeguards:
  - added server validation for free-account username format.
  - added manual spillover parent-reference requirement when applicable.
- Current state:
  - Free Account checkout now captures and applies user-entered registration details during auto-enrollment instead of defaulting to email-derived/fallback values.
  - both embedded Payment Intent and hosted Checkout Session metadata paths now carry free-account registration context.
- Validation:
  - syntax checks passed for `backend/services/store-checkout.service.js` and `storefront-shared.js`.
  - inline script parse check passed for `store-checkout.html`.

## Public Store Free Account Flow Correction (2026-03-25)

- Completed:
  - removed Free Account leg/spillover selection from storefront buyer flow.
  - added modal-first registration step triggered by `Register and Pay`.
  - modal now captures required registration fields before payment and then continues to checkout.
- Current flow now:
  - select Free Account
  - click `Register and Pay`
  - complete registration modal
  - proceed with payment checkout
  - show thank-you modal with setup link
- Placement authority:
  - storefront buyer no longer controls leg placement;
  - placement is handled via store-owner-side logic/defaults.
- Validation:
  - syntax checks passed for `storefront-shared.js` and `backend/services/store-checkout.service.js`.
  - inline script parse check passed for `store-checkout.html`.

## Password Setup Invalid-Link Recovery Fix (2026-03-25)

- Completed:
  - added setup-link recovery path for invalid/unknown token cases.
  - setup links now include optional `email` query context for recovery.
  - password setup page auto-refreshes to a regenerated valid link when backend recovery response is available.
- Current behavior:
  - invalid token no longer hard-dead-ends when email fallback can resolve a pending account;
  - user is redirected to a fresh working setup link.
- Validation:
  - backend syntax checks passed.
  - password-setup inline script parse passed.
  - runtime fallback simulation confirmed regenerated token validates.

## Split Auth + Free Account Dashboard (2026-03-26)

- Completed:
  - enforced two account-specific login paths:
    - paid members stay on `login.html`
    - free accounts stay on `store-login.html`
  - blocked cross-login attempts:
    - free account on paid login now shows redirect to Free Member Login
    - paid account on free login now shows redirect to Member Login
  - changed free-login success destination to dedicated storefront shell:
    - `/store-dashboard.html` (and route alias `/store/dashboard`)
  - added dedicated free-account password setup page:
    - `/store-password-setup.html` (and route alias `/store/password-setup`)
  - setup-link generation is now account-aware:
    - paid accounts receive `/password-setup.html?...`
    - free accounts receive `/store-password-setup.html?...`
  - removed preferred/free page-gating behavior from `index.html` (no nav/page hiding gate).

- Current state:
  - free accounts now complete sign-in + password setup through free-account screens only.
  - paid members keep existing member login + setup path.
  - free accounts get a storefront-style dashboard with:
    - purchase activity (member-owned invoice filter)
    - profile form (local persisted)
    - saved address form (local persisted)

- Backend routing updates:
  - `GET /store/dashboard` + aliases -> `store-dashboard.html`
  - `GET /store/password-setup` + aliases -> `store-password-setup.html`

- Validation:
  - `node --check` passed for all touched backend files.
  - inline script parse checks passed for:
    - `login.html`
    - `store-login.html`
    - `password-setup.html`
    - `store-password-setup.html`
    - `store-dashboard.html`
    - `store-checkout.html`
    - `index.html`
  - runtime route smoke check (port `3137`) returned `200` for new + updated auth/store paths.

## Storefront Session UX + Free Account Upgrade CTA (2026-03-26)

- Completed:
  - made storefront headers session-aware so free-account sessions remain visibly recognized while browsing:
    - `Free Member Login` now switches to `My Dashboard` when a free session exists.
    - paid member sessions now switch `Member Login` to `Member Dashboard`.
  - added reusable storefront auth/session helpers in `storefront-shared.js`:
    - `readUserSession`
    - `isFreeAccountUser`
    - `buildFreeLoginUrl`
    - `buildDashboardUrl`
  - applied header auth-link sync behavior across:
    - `store.html`
    - `store-product.html`
    - `store-support.html`
    - `store-checkout.html`
  - added free-dashboard account upgrade controls in `store-dashboard.html`:
    - package selector (`personal`, `business`, `infinity`, `legacy`)
    - `Upgrade Account` button
    - inline upgrade feedback state
  - wired upgrade action to existing API:
    - `POST /api/member-auth/upgrade-account`
  - after successful upgrade:
    - session snapshot is updated and persisted
    - user is redirected from free dashboard to paid member dashboard (`/index.html`).

- Current state:
  - free accounts can browse product and support pages without appearing logged out due to static header links.
  - free dashboard now supports self-service upgrade into paid packages.

- Validation:
  - `node --check storefront-shared.js` passed.
  - inline script parse checks passed for:
    - `store.html`
    - `store-product.html`
    - `store-support.html`
    - `store-checkout.html`
    - `store-dashboard.html`
    - `store-login.html`
  - runtime route smoke check (port `3138`) returned `200` for:
    - `/store.html`
    - `/store-product.html`
    - `/store-support.html`
    - `/store-checkout.html`
    - `/store-dashboard.html`
    - `/store/login`
    - `/store/dashboard`

## Store Header Action Alignment (2026-03-27)

- Completed:
  - aligned storefront header action controls with nav items (not logo row) for clearer scan/read order.
  - kept logo isolated in top row and moved action controls into nav right edge.
  - applied consistency update on checkout page by moving `Login` into nav row as well.

- Files updated:
  - `store.html`
  - `store-product.html`
  - `store-support.html`
  - `store-checkout.html`

- Validation:
  - inline script parse check passed for `store-checkout.html`.

## Store Register UX Copy + Terms Gate (2026-03-27)

- Completed:
  - updated register page primary CTA text from `Continue to Checkout` to `Register`.
  - updated helper copy to match register-first flow language.
  - added required `Terms and Agreements` checkbox in the registration form.
  - added explicit submit validation message when terms are not accepted.

- File updated:
  - `store-register.html`

- Validation:
  - inline script parse check passed for `store-register.html`.

## Store Checkout Registration Modal Terms Gate (2026-03-27)

- Completed:
  - added `Terms and Agreements` checkbox to the checkout free-account registration modal.
  - modal submission now requires checkbox acceptance before continuing.
  - validation message added for unchecked terms state.

- File updated:
  - `store-checkout.html`

- Validation:
  - inline script parse check passed for `store-checkout.html`.

## Admin Settings Legal Documents (2026-03-27)

- Completed:
  - added new `Settings -> Legal` section in Admin with editable fields:
    - Terms of Service
    - Agreement
    - Shipping Policy
    - Refund Policy
  - added load/save behavior tied to runtime settings API.
  - extended runtime settings backend payload to include `settings.legal` and update via `payload.legal`.
  - updated storefront register and checkout registration flows to display admin-managed legal document text near terms consent controls.

- Files updated:
  - `admin.html`
  - `backend/stores/runtime.store.js`
  - `backend/services/runtime.service.js`
  - `storefront-shared.js`
  - `store-register.html`
  - `store-checkout.html`

- Validation:
  - `node --check` passed:
    - `backend/stores/runtime.store.js`
    - `backend/services/runtime.service.js`
  - inline script parse checks passed:
    - `admin.html`
    - `store-register.html`
    - `store-checkout.html`

## Admin Settings UX Follow-Up: Legal Flow Restructure (2026-03-27)

- Completed:
  - changed legal management UX from inline side-by-side fields to a hierarchical settings flow:
    - `Settings > Category > Legal > Specific > Edit`
  - added legal category list with per-document preview and `Edit` actions.
  - added dedicated single-document editor screen with breadcrumb context and save action.
  - save returns to legal category view and preserves runtime settings persistence behavior.

- File updated:
  - `admin.html`

- Validation:
  - inline script parse check passed for `admin.html`.

## Admin Settings Responsiveness + Rich Text Legal Editing (2026-03-27)

- Completed:
  - fixed settings width behavior on larger screens by removing fixed-width constraint in settings content shell.
  - replaced legal textarea with rich text editing experience in legal-specific editor flow.
  - added formatting controls (bold/italic/underline/lists/link/clear).
  - added legal HTML sanitization and safe storefront rendering for admin-authored legal content.

- Files updated:
  - `admin.html`
  - `storefront-shared.js`
  - `store-register.html`
  - `store-checkout.html`

- Validation:
  - `node --check` passed:
    - `backend/stores/runtime.store.js`
    - `backend/services/runtime.service.js`
    - `storefront-shared.js`
  - inline script parse checks passed:
    - `admin.html`
    - `store-register.html`
    - `store-checkout.html`

## Legal Editor Toolbar Reliability Fix (2026-03-27)

- Completed:
  - fixed toolbar controls that were failing due to lost text selection during button clicks.
  - added selection capture/restore handling around legal rich-text commands.
  - added mousedown guard on toolbar buttons to keep current selection intact.
  - improved link + clear command fallback behavior.

- File updated:
  - `admin.html`

- Validation:
  - inline script parse check passed for `admin.html`.

## Legal Editor Runtime Fix: Quill Migration (2026-03-27)

- Completed:
  - migrated admin legal editor from custom contenteditable command handling to Quill rich-text editor.
  - enabled native active-state behavior and standardized toolbar interactions for bold/italic/underline/list/link/clear.
  - preserved safe legal-content rendering path via existing sanitization layer.

- File updated:
  - `admin.html`

- Validation:
  - inline script parse check passed for `admin.html`.

## Legal Editor Toolbar Enhancement (2026-03-27)

- Completed:
  - added text-structure controls:
    - `Body`
    - `Heading 1` to `Heading 5`
  - improved hyperlink UI theming in editor and link tooltip controls to match admin design system.

- File updated:
  - `admin.html`

- Validation:
  - inline script parse check passed for `admin.html`.

## Admin Binary Tree Parity Sync (2026-04-03)

- Completed:
  - ported user-side binary-tree placement/scoping logic into admin tree builder.
  - added support for newer placement variants in admin tree parsing:
    - `spillover-left`, `spillover-right`
    - `extreme-left`, `extreme-right`
    - plus legacy `spillover` compatibility.
  - aligned cutoff baseline handling with user-side behavior for members created after cutoff baseline timestamps.
  - aligned admin tree node scoping/anonymized spillover behavior with user-side subtree ownership logic.
  - excluded preferred/free-account members from admin binary-tree node construction (parity with member tree eligibility rules).

- Files updated:
  - `admin.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - inline script parse check passed for `admin.html` (`2` inline blocks parsed).

- Notes / limitations:
  - admin enrollment form UI still shows legacy placement options only; tree parser now supports newer placement values when present in stored member records.

### Follow-up (same day)

- Completed:
  - replaced legacy admin placement select (`left/right/spillover`) with full user-side placement options:
    - `left`, `right`, `spillover-left`, `spillover-right`, `extreme-left`, `extreme-right`.
  - added `Spillover Parent Assignment` mode (`auto` / `manual`) to admin enroll form.
  - aligned admin spillover suggestion visibility/validation with user-side flow (manual-only parent selection).
  - aligned admin enrollment submit placement parsing/validation with user-side:
    - direct slot availability checks
    - normalized spillover side resolution
    - manual parent reference validation
  - aligned enrolled-member placement badges with user-side normalized placement labels.
  - aligned admin binary-tree renderer spillover highlight mode to user-side (`received-only`).

- Updated limitation:
  - legacy placement-option limitation is now resolved; admin enroll placement flow now matches user-side placement behavior.

## Recent Update (2026-04-03) - Admin Binary Tree UI Control Parity (User-Side 1:1)

- Admin binary-tree page now mirrors user-side binary-tree controls/overlays and interaction behavior.
- Added missing parity UI elements:
  - tree settings button + settings window
  - tree direct-sponsor search toggle
  - mobile right-actions cluster (enroll/direct/minimap/root/settings)
  - tree enroll modal overlay/form with placement lock summary.
- Added user-side cursor/pan visual parity:
  - spacebar-pan mode now shows grab/grabbing cursor classes via CSS (`tree-pan-mode-active`, `tree-pan-mode-dragging`).
- Added tree settings/enroll JS lifecycle parity:
  - settings open/close, interaction control sync, reverse trackpad + zoom-strength updates
  - enroll modal open/close from tree events (`binary-tree-enroll-member-request`, `binary-tree-enroll-mode-changed`)
  - Escape-key close handling for tree overlays
  - tree enroll submit wired through admin enrollment API path and tree refresh flow.
- Added summary metric parity IDs/UI:
  - `tree-summary-total-direct-sponsor`
  - `tree-fullscreen-summary-total-direct-sponsor`
- Validation completed:
  - extracted inline admin script passes `node --check`
  - binary-tree section diffed against user-side and now matches structure 1:1.

### Active Scope Notes

- Admin-side enrollment business logic remains intentionally admin-specific:
  - submission path still uses admin registered-member endpoint
  - success messaging keeps admin no-fast-track-credit wording.
- Current priority status:
  - binary-tree UI/control parity request is implemented.

## Recent Update (2026-04-03) - Admin Tree Icon Bug Fix (`face` / `settings`)

- Resolved icon rendering bug where tree control buttons showed text fallback instead of glyph icons.
- Fix applied in `admin.html`:
  - added Material Symbols font import.
  - added base `.material-symbols-outlined` style mapping so icon spans resolve correctly.
- Result:
  - `Settings` and `Direct Sponsors` controls now render icons like user-side tree.

## Recent Update (2026-04-03) - Achievement Rank Icons (Draft Pack)

- Completed:
  - created a new icon asset set for profile achievement row left-side visuals.
  - generated six SVG icons aligned to rank contexts (`diamond`, `blue-diamond`, `black-diamond`, `crown`, `double-crown`, `royal-crown`).
  - added icon pack README for quick mapping/use.

- Files updated:
  - `brand_assets/Icons/Achievements/README.md`
  - `brand_assets/Icons/Achievements/diamond.svg`
  - `brand_assets/Icons/Achievements/blue-diamond.svg`
  - `brand_assets/Icons/Achievements/black-diamond.svg`
  - `brand_assets/Icons/Achievements/crown.svg`
  - `brand_assets/Icons/Achievements/double-crown.svg`
  - `brand_assets/Icons/Achievements/royal-crown.svg`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Active limitations:
  - this limitation was resolved in follow-up update `Achievement Icons Wired in Profile List` (same day).

- Next suggested integration step:
  - completed in follow-up: icon mapping is now server-side (`iconPath`) and rendered in profile achievement rows.

## Recent Update (2026-04-03) - Achievement Icons Wired in Profile List

- Completed:
  - added server-side icon mapping to Good Life achievements payload (`iconPath` per rank milestone).
  - wired profile achievement rows to render left-side icons next to achievement text.
  - kept fallback icon map in `index.html` for safe local/default rendering.
  - added path-validation guard for achievement icon URLs before rendering.

- Files updated:
  - `backend/services/member-achievement.service.js`
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - backend service syntax check passed.
  - `index.html` inline scripts parse check passed.

- Current limitation:
  - only current Good Life achievement set is icon-mapped; future categories/rank tracks need icon metadata added as they are introduced.

## Recent Update (2026-04-03) - Achievement Light Icons + Theme-Aware Swap

- Completed:
  - generated light-mode variants for all Good Life achievement icons.
  - added server-side `iconLightPath` metadata to the achievement payload.
  - updated profile achievement icon resolver to use light icons in light theme and dark icons otherwise.
  - added achievement list re-render on theme change so icon swap is immediate.

- Files updated:
  - `brand_assets/Icons/Achievements/diamond-light.svg`
  - `brand_assets/Icons/Achievements/blue-diamond-light.svg`
  - `brand_assets/Icons/Achievements/black-diamond-light.svg`
  - `brand_assets/Icons/Achievements/crown-light.svg`
  - `brand_assets/Icons/Achievements/double-crown-light.svg`
  - `brand_assets/Icons/Achievements/royal-crown-light.svg`
  - `brand_assets/Icons/Achievements/README.md`
  - `backend/services/member-achievement.service.js`
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - backend service syntax check passed.
  - `index.html` inline script parse check passed.

- Current limitation:
  - icon mappings are defined for the current Good Life set; future achievement categories must add both dark and light icon metadata when introduced.

## Recent Update (2026-04-03) - User Settings Sidebar Route Fix + Dedicated Settings Page

- Completed:
  - fixed user-side sidebar `Settings` action that previously routed to `Binary Tree`.
  - converted sidebar Settings into standard nav routing (`data-page="settings"`, route `/Settings`).
  - added a dedicated user settings page (`page-settings`) with:
    - account summary (name/username/rank)
    - theme selector
    - profile shortcut button
    - logout button.
  - added page metadata + route mapping for `settings`.
  - removed legacy custom click handler that forced Binary Tree settings modal open.
  - synced theme state across both selectors (`#theme-switcher` and `#settings-theme-switcher`).

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `index.html` inline scripts parse check passed.

- Current limitation:
  - Binary Tree interaction-specific controls remain in the Binary Tree settings modal by design; sidebar Settings is now a separate workspace page.

## Recent Update (2026-04-03) - Rank Advancement Moved to Dedicated Success Ladder Component

- Completed:
  - moved Rank Advancement UI out of the generic achievement-tab surface into a dedicated profile component (`Success Ladder`).
  - kept `Premiere Life` in the existing achievement center while handling rank progression in its own section.
  - wired the new ladder rendering + claim interaction end-to-end.
  - ensured ladder requirements read from server payload prerequisites/requirements (cycles, direct sponsor pair, active, system verification).
  - preserved explicit left/right pair semantics (`1:1`, `2:2`, etc.) and personal-enrollment wording for direct sponsors.

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - backend syntax check passed (`node --check backend/services/member-achievement.service.js`).
  - `index.html` inline script parse check passed (`index-inline-script:ok`).
  - two localhost QA screenshots captured:
    - `temporary screenshots/screenshot-1-ladder-pass1.png`
    - `temporary screenshots/screenshot-1-ladder-pass2.png`

- Current limitation:
  - screenshot captures in this pass landed on the login screen (profile view is auth-gated), so direct visual verification of the ladder section still needs an authenticated capture pass.

## Recent Update (2026-04-03) - Rank Advancement Success Ladder Converted to Carousel

- Completed:
  - converted Rank Advancement view from list/timeline to carousel card flow.
  - added Previous/Next controls plus dot navigation for quick rung switching.
  - kept rank claim action available directly on each carousel slide.
  - retained all existing requirement/prerequisite progress labels (left/right direct pair, cycles, active, verified).

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - backend syntax check passed (`node --check backend/services/member-achievement.service.js`).
  - `index.html` inline script parse check passed (`index-inline-script:ok`).

## Recent Update (2026-04-03) - Rank Advancement UI Redesign (Carousel)

- Completed:
  - fully redesigned Rank Advancement visuals while retaining carousel behavior.
  - upgraded slide layout with milestone chip, status chip, progress bars, and dedicated claim panel.
  - redesigned navigation controls (prev/next circle buttons + numbered jump pills + step counter).
  - added rank milestone fallback data path so carousel still appears when server rank payload is empty.

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - backend syntax check passed (`node --check backend/services/member-achievement.service.js`).
  - `index.html` inline script parse check passed (`index-inline-script:ok`).
  - authenticated profile screenshot QA confirms redesigned carousel rendering.

## Recent Update (2026-04-03) - Achievement Icon Size Increase

- Completed:
  - increased Rank Advancement carousel icon size for stronger visual emphasis.
  - increased Profile Achievement list icon size for consistency with the redesigned carousel.

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - backend syntax check passed (`node --check backend/services/member-achievement.service.js`).
  - `index.html` inline script parse check passed (`index-inline-script:ok`).
  - authenticated profile screenshot QA completed.

## Recent Update (2026-04-03) - Rank Advancement Converted to Monthly Running System

- Completed:
  - changed rank rewards from lifetime milestone claims to monthly-run claims.
  - implemented monthly rank claim periods (`YYYY-MM`) with reset behavior each month.
  - enforced one rank claim per month (server + database enforcement).
  - enforced highest-eligible-rank-only claim rule for monthly rank rewards.
  - kept non-rank achievements as one-time/lifetime claims.
  - updated profile rank carousel copy to monthly run guidance.

- Files updated:
  - `backend/stores/member-achievement.store.js`
  - `backend/services/member-achievement.service.js`
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `node --check backend/stores/member-achievement.store.js` passed.
  - `node --check backend/services/member-achievement.service.js` passed.
  - `index.html` inline script parse check passed (`index-inline-script:ok`).
  - authenticated profile screenshot QA completed (2 passes).

## Recent Update (2026-04-03) - Rank Carousel Moved Above Achievements + Name Labels

- Completed:
  - moved Rank carousel component above the Achievement component in Profile layout.
  - replaced numeric rank indicators (`1..9`) with rank name labels in carousel navigation and display helper text.

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - backend syntax checks passed.
  - `index.html` inline script parse check passed (`index-inline-script:ok`).
  - authenticated profile screenshot QA completed (2 passes).

## Recent Update (2026-04-03) - Rank Carousel Container Reduction

- Completed:
  - simplified rank carousel markup by reducing extra nested wrappers/containers.
  - retained existing carousel controls, claim behavior, and progress visuals.
  - improved semantic structure with cleaner `section/header/article/aside` and list usage.

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `index.html` inline script parse check passed (`index-inline-script:ok`).

## Recent Update (2026-04-03) - Rank Header Renamed + Tag to Caption

- Completed:
  - changed profile rank section title from `Success Ladder Carousel` to `Rank Advancement Bonus`.
  - adjusted the small label style to a caption presentation (removed uppercase tag-like treatment).

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `index.html` inline script parse check passed (`index-inline-script:ok`).

## Recent Update (2026-04-03) - Rank Advancement Bonus Component Restored

- Completed:
  - rebuilt the profile rank component as `Rank Advancement Bonus` after accidental Good Life overwrite.
  - restored rank carousel rendering from rank achievements data (requirements/prerequisites/claim states).
  - restored rank claim button binding and channel-specific feedback routing for rank-ladder claim actions.
  - confirmed New Good Life component was not modified during this restoration.

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `index.html` inline script parse check passed (`index-inline-script:ok`).

## Recent Update (2026-04-03) - Standalone Good Life Monthly Progression (Above Achievements)

- Completed:
  - restored Good Life as a standalone monthly progression section above `Profile Achievements`.
  - kept `Rank Advancement Bonus` behavior and renderer untouched.
  - rewired Good Life load/claim to its own panel state and feedback channel (no rank-ladder coupling).
  - added monthly Good Life claim click binding in profile module initialization.
  - added Good Life refresh when member rank changes and on theme switch for dark/light icons.
  - retained server-side authenticated API + DB-backed monthly progression/claim flow.

- Files updated:
  - `index.html`
  - `backend/app.js`
  - `backend/routes/member-good-life.routes.js`
  - `backend/controllers/member-good-life.controller.js`
  - `backend/services/member-good-life.service.js`
  - `backend/stores/member-good-life.store.js`
  - `backend/services/member-achievement.service.js`
  - `backend/stores/member-achievement.store.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - backend syntax checks passed (`node --check` on updated backend files).
  - `index.html` inline script parse check passed (`Inline scripts parse OK: 4`).
  - screenshot workflow executed (2 passes), but captures remained on login route; authenticated profile visual verification is pending in an authenticated browser session.

## Recent Update (2026-04-03) - Achievement Panel Switched Back to Premiere Life

- Completed:
  - removed rank from the visible Achievement component tab flow.
  - restored `Premiere Life` tab and `Premiere Journey` category.
  - added server-side `Enroll a Member` achievement with merch claim labeling.
  - wired requirement to total personal enrollments (`requiredDirectSponsorsTotal: 1`).
  - updated achievement card UI to support non-cash reward labels and show `Claim merch` when eligible.
  - retained rank achievements in payload for the standalone Rank Advancement Bonus component compatibility.

- Files updated:
  - `index.html`
  - `backend/services/member-achievement.service.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `node --check backend/services/member-achievement.service.js` passed.
  - `index.html` inline script parse check passed (`Inline scripts parse OK: 2`).

## Recent Update (2026-04-03) - Achievement List Reduced to Two Text Lines

- Completed:
  - list cards now render only:
    - achievement title
    - one detail line (requirement text or fallback description)
  - removed additional list text lines (prerequisites, progress lines, lock/status/payout text, reward label text chip).
  - kept claim button logic unchanged.

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `index.html` inline script parse check passed (`Inline scripts parse OK: 2`).

## Recent Update (2026-04-03) - Reward Text Re-added to Achievement List

- Completed:
  - restored reward text chip in achievement list cards.
  - retained simplified left content structure.

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `index.html` inline script parse check passed (`Inline scripts parse OK: 2`).

## Recent Update (2026-04-03) - Legacy Director "0/3" Text Removed

- Completed:
  - removed the Legacy Director text line that displayed `...Legacy Builder Package members 0/3`.
  - suppressed the same message from lock-reason rendering for Legacy Director.
  - kept eligibility logic intact; this is display/copy cleanup.

- Files updated:
  - `backend/services/member-achievement.service.js`
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `node --check backend/services/member-achievement.service.js` passed.
  - `index.html` inline script parse check passed (`Inline scripts parse OK: 2`).

## Recent Update (2026-04-03) - Requirements Label Removal Follow-Up

- Completed:
  - removed replacement label (`Checklist`) and kept plain requirement text only.
  - adjusted bonus completion copy to avoid introducing a new replacement label phrase.

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `index.html` inline script parse check passed (`Inline scripts parse OK: 2`).

## Recent Update (2026-04-03) - Legacy Director Text Simplified

- Completed:
  - removed `Personally enroll ...` wording for Legacy Director text and replaced with `Enroll ...`.
  - updated backend and fallback copy so the same phrase is consistent across UI and lock messages.
  - no achievement logic changes.

- Files updated:
  - `backend/services/member-achievement.service.js`
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `node --check backend/services/member-achievement.service.js` passed.
  - `index.html` inline script parse check passed (`Inline scripts parse OK: 2`).

## Recent Update (2026-04-03) - Duplicate Middle Text Removed in Achievement Card

- Completed:
  - removed duplicated middle text line from achievement card body.
  - removed unused `requirementSummary` computation.
  - retained progress lines and all claim/eligibility behavior.

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `index.html` inline script parse check passed (`Inline scripts parse OK: 2`).

## Recent Update (2026-04-03) - Rank Icon Expansion (Ruby/Emerald/Sapphire + Light Variants)

- Completed:
  - added new rank icon assets for early Rank Advancement milestones:
    - `ruby.svg` / `ruby-light.svg`
    - `emerald.svg` / `emerald-light.svg`
    - `sapphire.svg` / `sapphire-light.svg`
  - replaced Ruby/Emerald/Sapphire icon mapping so these ranks no longer point to Diamond artwork.
  - updated both backend achievement payload mappings and frontend fallback/icon lookup mappings.
  - updated icon pack README to include the new files.

- Files updated:
  - `brand_assets/Icons/Achievements/ruby.svg`
  - `brand_assets/Icons/Achievements/ruby-light.svg`
  - `brand_assets/Icons/Achievements/emerald.svg`
  - `brand_assets/Icons/Achievements/emerald-light.svg`
  - `brand_assets/Icons/Achievements/sapphire.svg`
  - `brand_assets/Icons/Achievements/sapphire-light.svg`
  - `brand_assets/Icons/Achievements/README.md`
  - `backend/services/member-achievement.service.js`
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `node --check backend/services/member-achievement.service.js` passed.
  - `index.html` inline script parse check passed (`Inline scripts parse OK: 2`).

## Recent Update (2026-04-03) - Icon Sharpness Pass (Ruby/Emerald/Sapphire)

- Completed:
  - refined Ruby/Emerald/Sapphire achievement icons (dark + light) to render cleaner in small UI containers.
  - removed tiny decorative details that caused soft/jagged output at reduced sizes.
  - increased primary edge definition and added geometric rendering hints in SVG files.
  - added shared `.achievement-icon-image` render class and applied it to profile achievement icon image paths (rank ladder, Good Life, achievement list).

- Files updated:
  - `brand_assets/Icons/Achievements/ruby.svg`
  - `brand_assets/Icons/Achievements/ruby-light.svg`
  - `brand_assets/Icons/Achievements/emerald.svg`
  - `brand_assets/Icons/Achievements/emerald-light.svg`
  - `brand_assets/Icons/Achievements/sapphire.svg`
  - `brand_assets/Icons/Achievements/sapphire-light.svg`
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `node --check backend/services/member-achievement.service.js` passed.
  - `index.html` inline script parse check passed (`Inline scripts parse OK: 2`).

## Recent Update (2026-04-03) - Icon Sharpness Pass Rolled Back per Design Feedback

- Completed:
  - rolled back Ruby/Emerald/Sapphire icon artwork (dark + light) to the previous style.
  - retained existing icon wiring/mapping behavior in UI and payload.

- Files updated:
  - `brand_assets/Icons/Achievements/ruby.svg`
  - `brand_assets/Icons/Achievements/ruby-light.svg`
  - `brand_assets/Icons/Achievements/emerald.svg`
  - `brand_assets/Icons/Achievements/emerald-light.svg`
  - `brand_assets/Icons/Achievements/sapphire.svg`
  - `brand_assets/Icons/Achievements/sapphire-light.svg`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `index.html` inline script parse check passed (`Inline scripts parse OK: 2`).

## Recent Update (2026-04-03) - Profile Text Cleanup (Remove Bracket Markers + System Verified)

- Completed:
  - removed `[x]` / `[ ]` symbols from profile requirement and prerequisite display strings.
  - removed `System Verified` from rank advancement checklist display.
  - filtered out system-verification prerequisite labels from visible prerequisite text in profile achievements.
  - preserved existing eligibility logic and component structure for:
    - `Rank Advancement Bonus`
    - `Good Life Monthly Progression`
    - `Profile Achievements`

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `index.html` inline script parse check passed (`Inline scripts parse OK: 2`).

## Recent Update (2026-04-03) - Placeholder Icon Added for Premiere Journey Achievement

- Completed:
  - added placeholder icon assets (`dark` + `light`) for achievement use.
  - replaced the visible Premiere Journey achievement (`Enroll a Member`) icon from Diamond to Placeholder.
  - kept rank Diamond icon mappings unchanged.

- Files updated:
  - `brand_assets/Icons/Achievements/placeholder.svg`
  - `brand_assets/Icons/Achievements/placeholder-light.svg`
  - `brand_assets/Icons/Achievements/README.md`
  - `backend/services/member-achievement.service.js`
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `node --check backend/services/member-achievement.service.js` passed.
  - `index.html` inline script parse check passed (`Inline scripts parse OK: 2`).

## Recent Update (2026-04-03) - Good Life Copy Text Removed

- Completed:
  - removed `Battlepass-style monthly progression.` text from the Good Life Monthly Progression panel.
  - retained the remaining claim-guidance sentence.

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - not run (text-only copy change).

## Recent Update (2026-04-03) - Rank Balance Message Copy Clarified

- Completed:
  - changed rank lock-reason copy from `Direct sponsors this month must be balanced...` to `Direct sponsors for this rank must be balanced...`.
  - preserved all requirement logic and progress values.

- Files updated:
  - `backend/services/member-achievement.service.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `node --check backend/services/member-achievement.service.js` passed.

## Recent Update (2026-04-03) - Rank Direct Requirement Groups Fixed

- Completed:
  - fixed rank direct sponsor pair requirements to the correct grouped logic:
    - Ruby/Emerald/Sapphire = `1:1`
    - Diamond/Blue Diamond/Black Diamond = `2:2`
    - Crown/Double Crown/Royal Crown = `3:3`
  - applied the fix in both backend achievement definitions and frontend fallback rank definitions.

- Files updated:
  - `backend/services/member-achievement.service.js`
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `node --check backend/services/member-achievement.service.js` passed.
  - `index.html` inline script parse check passed (`index-inline-script:ok`).

## Recent Update (2026-04-03) - Pack Rank Icons Added (Personal/Business/Infinity/Legacy)

- Completed:
  - added icon set (dark + light) for pack ranks:
    - Personal (`Bronze`)
    - Business (`Silver`)
    - Infinity (`Gold`)
    - Legacy (`Platinum`)
  - added new rank icon ids to profile icon map:
    - `rank-personal`, `rank-business`, `rank-infinity`, `rank-legacy`
  - extended profile badge rank matching so these ranks now resolve to their own icons.
  - updated achievements icon README to include new icon files and metal mapping labels.

- Files updated:
  - `brand_assets/Icons/Achievements/personal.svg`
  - `brand_assets/Icons/Achievements/personal-light.svg`
  - `brand_assets/Icons/Achievements/business.svg`
  - `brand_assets/Icons/Achievements/business-light.svg`
  - `brand_assets/Icons/Achievements/infinity.svg`
  - `brand_assets/Icons/Achievements/infinity-light.svg`
  - `brand_assets/Icons/Achievements/legacy.svg`
  - `brand_assets/Icons/Achievements/legacy-light.svg`
  - `brand_assets/Icons/Achievements/README.md`
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `index.html` inline script parse check passed (`Inline scripts parse OK: 2`).

## Recent Update (2026-04-03) - Pack Icons Redesigned (No Background Box)

- Completed:
  - redesigned pack rank icon set for:
    - Personal (Bronze)
    - Business (Silver)
    - Infinity (Gold)
    - Legacy (Platinum)
  - removed square/tile background from these icons (transparent outer canvas).
  - kept dark + light variants and existing filenames so mappings continue to work without code changes.

- Files updated:
  - `brand_assets/Icons/Achievements/personal.svg`
  - `brand_assets/Icons/Achievements/personal-light.svg`
  - `brand_assets/Icons/Achievements/business.svg`
  - `brand_assets/Icons/Achievements/business-light.svg`
  - `brand_assets/Icons/Achievements/infinity.svg`
  - `brand_assets/Icons/Achievements/infinity-light.svg`
  - `brand_assets/Icons/Achievements/legacy.svg`
  - `brand_assets/Icons/Achievements/legacy-light.svg`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - verified no outer background box layers in redesigned pack icons.
  - `index.html` inline script parse check passed (`Inline scripts parse OK: 2`).

## Recent Update (2026-04-03) - Time-Limited Event Title Ladder + Catalog Cleanup

- Completed:
  - finalized Time-Limited Event to 4 claimable title rewards:
    - Foundation Level: `Legacy Founder`
    - Level 2: `Legacy Director`
    - Level 3: `Legacy Ambassador`
    - Top Level: `Presidential Circle`
  - updated fallback achievement snapshot in `index.html` to match backend ids/copy and removed old `Presidential Ambassador` legacy fallback item.
  - added seed-sync cleanup logic so stale system-seeded event titles are auto-deactivated from `member_title_catalog`.
  - verified catalog now returns the intended active claimable titles only.

- Files updated:
  - `backend/services/member-achievement.service.js`
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `node --check backend/services/member-achievement.service.js` passed.
  - `node --check backend/stores/member-title-catalog.store.js` passed.
  - `index.html` inline script parse check passed (`Inline scripts parse OK: 2`).
  - DB check confirmed:
    - active: `legacy-founder`, `legacy-director`, `legacy-ambassador`, `presidential-circle`
    - old `presidential-ambassador` is inactive.

## Recent Update (2026-04-03) - Removed "Requirements" Wording from UI Copy

- Completed:
  - replaced visible `Requirements:` label with `Checklist:` in profile achievements.
  - removed `Requirements` wording from direct sponsorship and tier unlock helper text.
  - changed bonus completion text from `requirements met` to `conditions met`.
  - changed backend fallback error message to `Current progress does not meet ...`.
  - preserved all achievement logic/data shape (text-only update).

- Files updated:
  - `index.html`
  - `backend/services/member-achievement.service.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `node --check backend/services/member-achievement.service.js` passed.
  - `index.html` inline script parse check passed (`Inline scripts parse OK: 2`).
