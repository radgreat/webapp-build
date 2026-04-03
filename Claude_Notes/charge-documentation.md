# Vault Finance Dashboard â€” Build Notes

**Created:** 2026-02-20

**Status:** Pre-production (On going) -Lead developer

**Times Updated:** 168

## Overview

~~Built a dark, sleek finance/budgeting dashboard called **"Vault"** from scratch. Single-page application using Tailwind CSS via CDN, no frameworks. Designed from scratch with no reference image â€” high-craft approach following all CLAUDE.md guardrails.~~

## Major Update (Lead Devloper Notes)
Built a dark, sleek finance/budgeting dashboard called **"Charge"** from scratch. Single-page application using Tailwind CSS via CDN, no frameworks. Designed from scratch with no reference image â€” high-craft approach following all CLAUDE.md guardrails.

---

## Update (2026-04-03) - Requirement Semantics Clarified (Left/Right Pair + Personal Direct Sponsors)

### What Was Changed

- Updated rank-achievement requirement logic to treat requirement numbers as **paired left/right counts** (e.g., `1:1`, `2:2`, `3:3`, and so on).
- Added server-side direct sponsor pair validation based on **personally enrolled users only**:
  - direct sponsor identity is derived from `sponsorUsername === currentMember.username`
  - side assignment is derived from enrolled member placement (`left` / `right`, including spillover side normalization)
- Added rank milestone-side requirements per tier:
  - Ruby `1:1`
  - Emerald `2:2`
  - Sapphire `3:3`
  - Diamond `4:4`
  - Blue Diamond `5:5`
  - Black Diamond `6:6`
  - Crown `7:7`
  - Double Crown `8:8`
  - Royal Crown `9:9`
- Profile achievement cards now display direct sponsor pair progress as:
  - `Direct Sponsors (Personal Enrollments): Left X / Y | Right X / Y`
- Profile achievement status strip now includes live direct pair values (`Direct L:x R:y`).

### Files Affected

- `backend/services/member-achievement.service.js`
- `index.html`

### Design Decisions

- Direct sponsor counting is server-authoritative and read from `registered_members` data so claims cannot be bypassed in UI.
- Spillover placement is normalized to left/right buckets to keep pair counting deterministic.

### Known Limitations

- Direct sponsor requirement mapping currently follows linear pair progression (`1:1` to `9:9`) aligned to the nine rank milestones; if business policy changes these ratios, the per-rank constants should be updated.

---

## Update (2026-04-03) - Rank Advancement System Added to Profile Achievements

### What Was Changed

- Implemented Rank Advancement milestones in profile achievements using `MLM Business Logic.md` section `# 5️⃣ Rank Advancement Bonus` (line 114).
- Added rank achievement entries for:
  - Ruby (5 cycles, `$62.50`)
  - Emerald (10 cycles, `$125`)
  - Sapphire (20 cycles, `$250`)
  - Diamond (40 cycles, `$500`)
  - Blue Diamond (80 cycles, `$1,000`)
  - Black Diamond (160 cycles, `$2,000`)
  - Crown (320 cycles, `$4,000`)
  - Double Crown (640 cycles, `$8,000`)
  - Royal Crown (1000 cycles, `$12,500`)
- Added prerequisite and requirement enforcement for Rank Advancement claims:
  - cycle threshold required
  - account must be active
  - verified by system (server-side eligibility evaluation)
  - one-time claim behavior remains enforced by unique claim constraints
- Updated profile achievement UI rows to show:
  - requirements summary
  - prerequisites summary
  - cycle progress
  - lock reason when not claimable
  - payout schedule note (`Paid monthly after verification`)
- Updated profile achievement status header to include rank + cycles + activity status.

### Files Affected

- `backend/services/member-achievement.service.js`
- `index.html`

### Design Decisions

- Rank Advancement eligibility is server-authoritative and derived from authenticated member data + binary tree metrics snapshot cycles.
- `requiresRank` is disabled for rank-advancement milestones because the MLM table maps cycles to rank bonus milestones; cycles are the primary requirement.
- Active/inactive gating follows the same activity-window interpretation already used elsewhere in the app.

### Validation

- `node --check backend/services/member-achievement.service.js` passed.
- Inline script parse checks for `index.html` passed.

### Known Limitations

- Ruby/Emerald/Sapphire currently reuse existing diamond icon assets because dedicated icon files are not yet in `brand_assets/Icons/Achievements/`.
- System verification is currently represented by deterministic server-side rule evaluation; no separate manual review queue is implemented in this step.

---

## Update (2026-04-03) - Achievement Icon Drafts (SVG Pack)

### What Was Changed

- Generated a draft icon pack for profile achievement list left-side visuals.
- Icons created for current Good Life context:
  - Diamond
  - Blue Diamond
  - Black Diamond
  - Crown
  - Double Crown
  - Royal Crown
- Saved as standalone SVG assets for easy frontend integration.

### Files Affected

- `brand_assets/Icons/Achievements/diamond.svg`
- `brand_assets/Icons/Achievements/blue-diamond.svg`
- `brand_assets/Icons/Achievements/black-diamond.svg`
- `brand_assets/Icons/Achievements/crown.svg`
- `brand_assets/Icons/Achievements/double-crown.svg`
- `brand_assets/Icons/Achievements/royal-crown.svg`
- `brand_assets/Icons/Achievements/README.md`

### Design Decisions

- Used SVG format (not bitmap) to keep icons crisp at multiple sizes in list rows.
- Matched existing app tone with dark-surface backgrounds and brand-adjacent teal/gold accents.
- Kept each icon self-contained so they can be dropped directly into the profile component.

### Known Limitations

- These are draft visual assets only; list-row integration/mapping in `index.html` is not yet wired in this step.

---

## Update (2026-04-03) - Profile Achievement System (Server-Side Auth + DB Claims)

### What Was Changed

- Added a new achievement panel to member profile page (`index.html`) with:
  - top-right tabs: `Premiere Life`, `Rank`
  - left category sidebar
  - right achievement cards with claim state buttons
  - claim-date rendering when an achievement is claimed
- Added `Premiere Life -> Good Life` achievement track with rewards aligned to `brand_assets/MLM Business Logic.md`:
  - Diamond Rank -> `$500`
  - Blue Diamond Rank -> `$1,000`
  - Black Diamond Rank -> `$2,000`
  - Crown Rank -> `$4,000`
  - Double Crown Rank -> `$8,000`
  - Royal Crown Rank -> `$12,500`
- Replaced client-only claim persistence with authenticated server APIs:
  - `GET /api/member-auth/achievements`
  - `POST /api/member-auth/achievements/:achievementId/claim`
- Added member auth-session issuance during login:
  - `/api/member-auth/login` now returns `authToken` and `authTokenExpiresAt` inside the `user` payload.
- Added member bearer-auth middleware for protected achievement endpoints.
- Added DB-backed stores/services for:
  - member auth sessions
  - member achievement claim records
- Added DB schema installers with fallback strategy:
  - first attempt via admin DB connection
  - fallback attempt via service-role DB connection if admin credentials are unavailable.

### Files Affected

- Frontend:
  - `index.html`
  - `login.html`
  - `store-login.html`
- Backend:
  - `backend/app.js`
  - `backend/controllers/auth.controller.js`
  - `backend/controllers/member-achievement.controller.js`
  - `backend/routes/member-achievement.routes.js`
  - `backend/middleware/member-auth.middleware.js`
  - `backend/services/member-auth-session.service.js`
  - `backend/services/member-achievement.service.js`
  - `backend/stores/member-auth-session.store.js`
  - `backend/stores/member-achievement.store.js`
  - `backend/db/admin-db.js`

### Design Decisions

- Achievement eligibility is validated server-side from authenticated member rank, not trusted from client state.
- Claim records are authoritative in PostgreSQL (`charge.member_achievement_claims`) with unique `(user_id, achievement_id)` guard to prevent duplicate claims.
- Session auth uses server-issued bearer tokens persisted in DB (`charge.member_auth_sessions`) and required by achievements API middleware.
- Profile UI fetches and renders tabs/categories/achievement states from server payload to keep claims authoritative and auditable.

### Validation

- `node --check` passed for all new/updated backend JS modules.
- Inline script parse checks passed for:
  - `index.html`
  - `login.html`
  - `store-login.html`
- Runtime smoke checks on `http://localhost:5500`:
  - unauthenticated achievements request returns `401`.
  - login returns auth token.
  - authenticated achievements list returns server payload.
  - claim endpoint enforces rank eligibility server-side.
- Screenshot rounds completed:
  - `temporary screenshots/screenshot-3-round1c.png`
  - `temporary screenshots/screenshot-4-round2.png`

### Known Limitations

- Existing sessions created before this change do not include auth tokens; users on old sessions must sign in again for achievements API access.
- Current `Rank` tab is scaffolded for expansion but intentionally minimal in this pass.
- Good Life eligibility is rank-order based; if business policy changes rank hierarchy, rank map must be updated in backend service.

---

## Update (2026-04-03) - Achievement Category Caption Removed

### What Was Changed

- Simplified the profile achievement category rail item so it shows label-only text.
- Removed the category subtitle/caption under `Good Life`.

### Files Affected

- `index.html`

### Design Decision

- Kept the category panel visually cleaner and aligned with requested copy density by removing descriptive subtext from category items.

---

## Update (2026-04-03) - Good Life List Row Template Update

### What Was Changed

- Updated Good Life list rows to match requested template style:
  - title-only rank label (example: `Diamond`)
  - description line (`Reach Diamond Rank`)
  - right-side reward format (`= $500`) and claim/locked button
- Aligned backend achievement titles to label-only values:
  - `Diamond`, `Blue Diamond`, `Black Diamond`, `Crown`, `Double Crown`, `Royal Crown`
- Added frontend fallback Good Life list entries so category list remains visible while waiting for authenticated server response.

### Files Affected

- `index.html`
- `backend/services/member-achievement.service.js`

### Known Limitation

- Claim status remains server-authoritative; fallback entries are for UI continuity only until API payload loads.

---

## Update (2026-04-03) - Good Life Row Subtext/Reward Format Cleanup

### What Was Changed

- Removed redundant locked-state row subtext in Good Life cards (the `Reach ... to claim this reward` line).
- Preserved claimed-date messaging only when an achievement is already claimed.
- Removed the leading `=` marker from reward amounts in row action area.

### Files Affected

- `index.html`

---

## Update (2026-03-27) - Legal Editor Headings + Link Theme Refinement

- Added legal editor heading scale controls in toolbar:
  - `Body`, `Heading 1`, `Heading 2`, `Heading 3`, `Heading 4`, `Heading 5`.
- Improved link styling to match admin theme:
  - editor hyperlink color/hovers now use brand palette.
  - Quill link tooltip (URL input + actions) now uses dark admin styling for visual consistency.
- File updated:
  - `admin.html`
- Validation:
  - inline script parse check passed for `admin.html`.

---

## Update (2026-03-27) - Legal Rich Text Engine Migration (Quill)

- Replaced custom contenteditable command wiring with Quill rich-text editor for legal document editing.
- Toolbar now uses native rich-text controls with built-in active-state highlighting:
  - bold, italic, underline
  - bulleted list, numbered list
  - link
  - clear formatting
- Added dark-theme styling overrides for Quill toolbar/editor to match admin theme.
- Kept backend/storefront sanitization pipeline intact so saved rich text remains safe when rendered publicly.
- File updated:
  - `admin.html`
- Validation:
  - inline script parse check passed for `admin.html`.

---

## Update (2026-03-27) - Rich Text Toolbar Reliability Fixes

- Fixed legal rich-text toolbar behavior by preserving text selection while interacting with toolbar buttons.
- Added editor selection lifecycle handling:
  - capture selection on mouseup/keyup/focus/input
  - restore selection before executing formatting commands.
- Added toolbar interaction hardening:
  - `mousedown` prevent-default on toolbar buttons so selection is not lost before click handlers run.
- Improved command reliability/fallbacks:
  - link insertion now supports both selected text and no-selection insert flow.
  - clear action now includes explicit plain-text fallback for selected content.
- File updated:
  - `admin.html`
- Validation:
  - inline script parse check passed for `admin.html`.

---

## Update (2026-03-27) - Settings Responsiveness + Rich Text Legal Editor

- Responsive settings layout update:
  - removed fixed-width cap in settings container so layout scales with larger browser widths.
- Legal editor upgraded from plain textarea to rich text editor:
  - contenteditable editor surface
  - formatting controls: bold, italic, underline, bullets, numbers, link, clear format.
- Added HTML sanitization pipeline for legal docs:
  - admin-side sanitize before save
  - storefront-side sanitize before render
  - allows safe formatting while preventing unsafe markup.
- Storefront legal renderers now output sanitized rich content (instead of escaped plain text blocks).
- Files updated:
  - `admin.html`
  - `storefront-shared.js`
  - `store-register.html`
  - `store-checkout.html`
- Validation:
  - `node --check` passed for JS modules.
  - inline script parse checks passed for `admin.html`, `store-register.html`, `store-checkout.html`.

---

## Update (2026-03-27) - Settings Legal UX Restructure (Category -> Specific -> Edit)

- Refactored Admin Settings legal workflow to follow nested navigation:
  - `Settings > Category > Legal > Specific > Edit`
- Removed side-by-side legal textareas from the main settings panel.
- Added dedicated legal category workspace in settings with:
  - document list (Terms of Service, Agreement, Shipping Policy, Refund Policy)
  - per-document preview summary
  - `Edit` action for each document
- Added dedicated legal editor view with:
  - breadcrumb context
  - single document textarea
  - save action returning to legal category list after successful save
- Existing runtime-settings persistence remains the backend source of truth.
- File updated:
  - `admin.html`
- Validation:
  - inline script parse check passed for `admin.html`.

---

## Update (2026-03-27) - Admin-Managed Legal Documents (Settings -> Legal)

- Added a new `Legal` section under admin `Settings` with editable fields for:
  - Terms of Service
  - Agreement
  - Shipping Policy
  - Refund Policy
- Added save/load logic using existing runtime settings API:
  - `GET /api/runtime-settings`
  - `POST /api/admin/runtime-settings`
- Extended runtime settings backend to persist legal docs:
  - runtime store now reads/writes legal fields
  - runtime service now returns `settings.legal` and accepts `payload.legal`
  - runtime store includes `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` guard for legal columns.
- Storefront integration:
  - `store-register.html` and `store-checkout.html` now load legal docs from admin-managed runtime settings and render them near terms consent UI.
  - shared legal fetch utility added in `storefront-shared.js`.
- Files updated:
  - `admin.html`
  - `backend/stores/runtime.store.js`
  - `backend/services/runtime.service.js`
  - `storefront-shared.js`
  - `store-register.html`
  - `store-checkout.html`
- Validation:
  - `node --check` passed for runtime backend files.
  - inline script parse checks passed for `admin.html`, `store-register.html`, `store-checkout.html`.

---

## Update (2026-03-27) - Registration Modal Terms Checkbox

- Added required terms consent to the checkout registration modal (`Free Account Setup` modal).
- New checkbox copy:
  - `I have read and agree to the Terms and Agreements.`
- Modal submission now validates terms acceptance and blocks with feedback when unchecked.
- File updated:
  - `store-checkout.html`
- Validation:
  - inline script parse check passed for `store-checkout.html`.

---

## Update (2026-03-27) - Register Page CTA + Terms Agreement Gate

- Corrected register page primary-action wording:
  - changed submit button text from `Continue to Checkout` to `Register`.
  - updated intro helper copy to match register-first intent.
- Added required terms gate before registration submission:
  - new checkbox copy: `I have read and agree to the Terms and Agreements.`
  - form now blocks submit with validation feedback until checkbox is accepted.
- File updated:
  - `store-register.html`
- Validation:
  - inline script parse check passed for `store-register.html`.

---

## Update (2026-03-27) - Header Action Alignment with Nav Items

- Aligned storefront header action controls so they sit with nav items instead of the logo row.
- Updated structure:
  - logo stays on its own top row
  - `Checkout` icon + `Login` are right-aligned within nav (`ml-auto`) on browse pages
  - checkout page `Login` also moved into nav row for consistency
- Files updated:
  - `store.html`
  - `store-product.html`
  - `store-support.html`
  - `store-checkout.html`
- Validation:
  - inline script parse check passed for `store-checkout.html`.

---

## Update (2026-03-27) - Header Checkout CTA Converted to Icon Button

- Converted header checkout/cart CTA from text button to icon button (Google Material-style cart icon) on store-facing browse/support pages.
- Kept existing cart count functionality by preserving count span IDs and rendering the quantity as a badge on the icon.
- Added accessible label:
  - `aria-label="Cart and checkout"` + `sr-only` text.
- Files updated:
  - `store.html`
  - `store-product.html`
  - `store-support.html`
- Validation:
  - inline script parse checks passed for all updated pages.

---

## Update (2026-03-27) - Store Logo Format Change (SVG -> PNG)

- Updated storefront header logo asset from SVG to PNG per request:
  - from: `/brand_assets/Logos/L&D Logo_Cropped.svg`
  - to: `/brand_assets/Logos/L&D Logo_Cropped.png`
- Applied to:
  - `store.html`
  - `store-product.html`
  - `store-support.html`
  - `store-checkout.html`
  - `store-login.html`
  - `store-password-setup.html`
  - `store-dashboard.html`
  - `store-register.html`
- Validation:
  - inline script parse checks passed for all updated store pages.

---

## Update (2026-03-27) - Store Logo Asset Swap to L&D Logo_Cropped

- Replaced storefront header logo source with the requested file:
  - `/brand_assets/Logos/L&D Logo_Cropped.svg`
- Implemented URL-encoded asset path in HTML:
  - `/brand_assets/Logos/L%26D%20Logo_Cropped.svg`
- Updated logo alt text to:
  - `L&D logo`
- Applied to:
  - `store.html`
  - `store-product.html`
  - `store-support.html`
  - `store-checkout.html`
  - `store-login.html`
  - `store-password-setup.html`
  - `store-dashboard.html`
  - `store-register.html`
- Validation:
  - inline script parse checks passed for updated store pages.

---

## Update (2026-03-27) - Logo-Only Store Branding (Member-Side Pattern Match)

- Follow-up branding refinement:
  - converted store header brand treatment to logo-only presentation (no adjacent `Premiere Life` text block).
  - aligns with member-side pattern where logo carries the primary brand expression.
- Implementation details:
  - kept provided asset:
    - `/brand_assets/Logos/Premiere Life Logo_Transparent.svg`
  - removed prior header combo block (logo + brand text + sublabel) and replaced with single logo anchor.
- Applied files:
  - `store.html`
  - `store-product.html`
  - `store-support.html`
  - `store-checkout.html`
  - `store-login.html`
  - `store-password-setup.html`
  - `store-dashboard.html`
  - `store-register.html`
- Validation:
  - inline script parse checks passed for all updated store pages.

---

## Update (2026-03-27) - Store Header Logo Integration (Provided Brand Asset)

- Replaced storefront header text-badge mark (`PL` square) with provided logo asset:
  - `/brand_assets/Logos/Premiere Life Logo_Transparent.svg`
- Applied across store pages for consistent brand identity:
  - `store.html`
  - `store-product.html`
  - `store-support.html`
  - `store-checkout.html`
  - `store-login.html`
  - `store-password-setup.html`
  - `store-dashboard.html`
  - `store-register.html`
- Validation:
  - inline script parse checks passed for updated store pages.

---

## Update (2026-03-27) - Branding Correction (Charge -> Premiere Life)

- Scope delivered:
  - corrected visible UI branding from `Charge` to `Premiere Life` across storefront and remaining app locations found during audit.
- Storefront updates:
  - titles updated to `Premiere Life Store - ...` on store pages.
  - header brand text updated from `Charge` to `Premiere Life`.
  - header badge initials updated from `CH` to `PL`.
  - files updated:
    - `store.html`
    - `store-product.html`
    - `store-support.html`
    - `store-checkout.html`
    - `store-login.html`
    - `store-password-setup.html`
    - `store-dashboard.html`
    - `store-register.html`
- Additional app updates:
  - `admin.html` brand wordmark text corrected to `Premiere Life`.
  - `index.html` workspace label corrected to `Premiere Life Wallet Workspace`.
- Design/compatibility decision:
  - internal storage keys prefixed with `charge-` were intentionally not renamed in this patch to avoid local-data/session migration side effects.
- Validation:
  - no visible `Charge` string remains in root HTML pages (`*.html` search).
  - inline script parse checks passed for updated store pages.

---

## Update (2026-03-27) - Registration UI Cleanup (Onboarding Note Removed)

- Removed optional onboarding-note fields from user-facing free-account registration UI surfaces:
  - dedicated register page (`store-register.html`)
  - checkout free-account fallback modal (`store-checkout.html`)
- Kept payload compatibility by continuing to submit `freeAccountNotes` as an empty value when no note field is shown.
- Validation:
  - inline script parse checks passed for:
    - `store-register.html`
    - `store-checkout.html`

---

## Update (2026-03-27) - Dedicated Store Registration Page (Replaces Register Modal Entry)

- Scope delivered:
  - moved `Register now` to a dedicated storefront registration page instead of opening registration flow from checkout modal.
  - new page introduced: `store-register.html`.
- Routing updates:
  - added pretty-route alias support in backend:
    - `/store/register`
    - `/store/register/`
    - `/store-register.html`
  - file updated:
    - `backend/app.js`
- Shared URL contract:
  - added `buildRegisterUrl(storeCode)` helper in `storefront-shared.js`.
  - storefront header login modals now route register CTA to this helper in:
    - `store.html`
    - `store-product.html`
    - `store-support.html`
    - `store-checkout.html`
- Registration handoff behavior:
  - `store-register.html` captures free-account fields and stores a draft payload under:
    - `charge-free-account-registration-draft-v1`
  - redirects into checkout with:
    - `mode=free-account`
    - `register=1`
  - checkout now reads this draft and preloads registration details directly into checkout fields/hidden registration fields.
  - when draft exists, checkout no longer forces opening the registration modal before submit; users can proceed with `Register and Pay`.
  - registration modal remains as fallback when free-account details are missing.
- Attribution behavior:
  - register links preserve active store attribution through the new register URL helper.
  - when register flow enters checkout without explicit `store` param but draft carries attribution, checkout recovers the draft store code before link sync.
- Validation:
  - inline script parse checks passed:
    - `store.html`
    - `store-product.html`
    - `store-support.html`
    - `store-checkout.html`
    - `store-register.html`
  - `node --check` passed:
    - `storefront-shared.js`
    - `backend/app.js`

---

## Update (2026-03-27) - Registration CTA UX Follow-Up (Modal-First + Register Label)

- Follow-up UX refinement:
  - `Register now` from the login modal now opens the free-account registration modal directly on checkout entry path.
  - registration modal submit label switches to `Register` for this CTA path (instead of `Pay Checkout`).
- Reused flow retained:
  - same checkout free-account registration fields and validation.
  - if cart has items, flow continues into payment as before.
  - if cart is empty, registration details are captured and user receives guidance to add products, then continue with checkout.
- File updated:
  - `store-checkout.html`
- Validation:
  - `store-checkout.html` inline script parse check passed.

---

## Update (2026-03-27) - Login Modal Registration CTA + Reused Free-Account Checkout Flow

- Scope delivered:
  - added login-modal helper copy/CTA on storefront pages:
    - `Don't have an account? Register now to get 15% discount on your checkout.`
  - `Register now` now routes into the existing checkout free-account registration pipeline (no duplicate registration flow introduced).
- Frontend behavior:
  - login modal now includes `Register now` link on:
    - `store.html`
    - `store-product.html`
    - `store-support.html`
    - `store-checkout.html`
  - register link dynamically preserves active store attribution when present by building:
    - checkout URL with existing `store` code (if any)
    - `mode=free-account`
    - `register=1`
- Checkout reuse implementation:
  - `store-checkout.html` now parses route options and applies free-account mode when requested:
    - `mode=free-account` preselects free-account checkout mode
    - `register=1` triggers the existing free-account registration modal when cart has items
  - if `register=1` is used with an empty cart, checkout shows guidance to add products first, then continue with `Register and Pay`.
- Attribution handling:
  - no-attribution entry remains valid (no forced store code).
  - when attribution exists from browsing/referral links, registration continues through the same attributed checkout path.
- Validation:
  - inline script parse checks passed:
    - `store.html`
    - `store-product.html`
    - `store-support.html`
    - `store-checkout.html`

---

## Update (2026-03-27) - Storefront Header Login Consolidation + Cart Relocation

- Scope delivered:
  - replaced dual header auth CTAs (`Member Login` + `Free Member Login`) with a single `Login` button across storefront pages.
  - added a header login modal that lets users choose:
    - `Member Login`
    - `Preferred Account Login`
  - relocated `Cart / Checkout` to the header action cluster (next to `Login`) for clearer top-level access.
- Frontend files updated:
  - `store.html`
  - `store-product.html`
  - `store-support.html`
  - `store-checkout.html`
- UX behavior:
  - `Login` opens a modal selector instead of presenting two competing header buttons.
  - modal login destinations adapt to session state:
    - free-account session -> preferred option routes to dashboard (`My Dashboard` label)
    - member session -> member option routes to member dashboard (`Member Dashboard` label)
  - storefront header now surfaces cart/checkout in the same action area as login.
- Design decision:
  - kept checkout success modal copy/actions unchanged in this patch to avoid mixing post-checkout messaging scope with header UX refactor.
- Validation:
  - inline script parse checks passed:
    - `store.html`
    - `store-product.html`
    - `store-support.html`
    - `store-checkout.html`

---

## Update (2026-03-27) - Storefront Checkout: No-Referral Guest Flow + Mode-Based Discounting

- Scope delivered:
  - checkout can now proceed without a referral/store-code link.
  - `Member Store Code` lock block is hidden when checkout has no attributed store code.
  - checkout mode now controls discount behavior in both UI and backend pricing:
    - `Guest` -> `0%` discount (regular price)
    - `Free Account` -> `15%` discount
- Frontend implementation:
  - `store.html`
    - storefront now resolves referral attribution from URL (`?store=`) only for this session path.
    - direct storefront visits without referral links clear stale persisted store-code attribution.
  - `store-checkout.html`
    - added dynamic discount badge + line label updates by checkout mode.
    - cart summary now recalculates using mode-based discount percentage.
    - removed hard stop that previously blocked checkout without store attribution.
    - added conditional store-code block visibility (`store-code-lockup`) when `store` is absent.
    - success modal note now explains staff fallback attribution for free-account checkouts without referral links.
    - updated Free Account hint copy with e-commerce caption: `Enjoy 15% discount.`
    - removed top checkout discount badge per UX cleanup request.
    - discount summary row now uses label `Discount` and is hidden during guest mode.
    - guest checkout button label updated from `Pay Securely with Stripe` to `Pay Now`.
  - `storefront-shared.js`
    - `resolveCartSummary(...)` now supports optional `discountPercent`.
    - checkout start state no longer requires `storeCode`.
    - checkout payload now sends mode-driven `discountPercent` (guest `0`, free-account `15` by default).
- Backend implementation:
  - `backend/services/store-checkout.service.js`
    - removed mandatory store-code requirement for checkout request acceptance.
    - enforced server-side discount by checkout mode (`guest => 0`, `free-account => requested/default`).
    - added no-referral free-account fallback attribution resolution:
      - prefers configured fallback sponsor via env keys:
        - `CHECKOUT_FALLBACK_SPONSOR_USERNAME`
        - `STORE_CHECKOUT_FALLBACK_SPONSOR_USERNAME`
        - `PREFERRED_CUSTOMER_FALLBACK_SPONSOR_USERNAME`
      - falls back to heuristic authorized/staff-like account detection when no explicit env is provided.
      - returns `503` when free-account no-referral is selected and no eligible fallback sponsor exists.
    - metadata now distinguishes link attribution (`member_store_code`) from fallback attribution (`attribution_key`).
- Design decisions:
  - guest no-referral checkout remains non-attributed (`REGISTRATION_LOCKED` invoice path downstream), with no owner BV credit.
  - free-account no-referral checkout is attributed to authorized fallback sponsor so preferred-customer creation can proceed.
  - tax is still not implemented in this patch; discount behavior is prepared independently.
- Validation:
  - `node --check storefront-shared.js`
  - `node --check backend/services/store-checkout.service.js`
  - inline script parse check for `store-checkout.html` passed via `new Function(...)`.

---

## Update (2026-03-27) - Preferred Customer Placement Controls (6-Mode Placement Model)

- Scope delivered:
  - aligned placement controls to six explicit modes:
    - `Left`
    - `Right`
    - `Spill Over Left`
    - `Spill Over Right`
    - `Spillover Extreme Left`
    - `Spillover Extreme Right`
  - `Left` and `Right` now behave as direct (level-1) intent controls in planner/enroll validation.
- Placement behavior now:
  - `Left`: direct left slot intent.
  - `Right`: direct right slot intent.
  - `Spill Over Left/Right`: standard spillover auto-placement by side.
  - `Spillover Extreme Left/Right`: far-edge chain placement by side.
- Frontend implementation (`index.html`):
  - replaced previous mixed placement options with the six-mode control list in:
    - Enroll Member -> Placement Leg
    - Preferred Customer Upgrade Planner -> Placement Leg
  - updated Preferred Customer `Assigned Parent` manual field from select-only to typeable input with datalist suggestions:
    - users can type username/member ID directly
    - suggestion list from direct child references remains available
  - introduced shared normalization helpers so UI + planner + tree builder can interpret:
    - `spillover-left`
    - `spillover-right`
    - `extreme-left`
    - `extreme-right`
  - updated binary-tree node insertion logic:
    - spillover side options run through spillover placement paths
    - extreme options run through far-edge chain placement paths
  - updated placement badges/labels to render the new control names consistently.
- Backend implementation:
  - `backend/services/member.service.js`
    - expanded normalization support for side-specific spillover input aliases (`spillover-left` / `spillover-right`) while retaining extreme options.
  - `backend/services/store-checkout.service.js`
    - placement normalization now recognizes side-specific spillover aliases for compatibility.
- Design decisions:
  - spillover parent-mode/manual-parent controls remain available only for spillover-side options.
- Validation:
  - `node --check backend/services/member.service.js`
  - `node --check backend/services/store-checkout.service.js`
  - extracted inline JS from `index.html` and validated with `node --check /tmp/index-inline.js`

---

## Update (2026-03-26) - Legacy Store Code Compatibility + User Validation

- Follow-up checkout issue addressed:
  - public checkout rejected `CHG-7X42` with "Member store code was not found."
  - root cause: current live user dataset no longer contains `CHG-7X42`; active public code is `CHG-ZERO`.
- Compatibility fix implemented:
  - added legacy alias mapping across checkout/store normalization paths:
    - `CHG-7X42 -> CHG-ZERO`
  - updated dashboard/store setup defaults to `CHG-ZERO` to prevent new stale links/copies.
- Files updated:
  - `backend/services/store-checkout.service.js`
  - `backend/services/invoice.service.js`
  - `storefront-shared.js`
  - `index.html`
- Validation performed:
  - full user-code audit across all users (`storeCode`, `publicStoreCode`, `attributionStoreCode`) showed no unresolved attribution references.
  - legacy alias check confirms `CHG-7X42` now resolves to owner `zeroone` through `CHG-ZERO`.
  - per-user checkout-session route validation run for all user store/public codes + `CHG-7X42` returned Stripe-key errors (`502 Invalid API Key`) instead of store-code routing errors (`404`), confirming store-code resolution now passes.

---

## Update (2026-03-26) - Commerce Architecture Direction Note (Planning Session Only)

- Confirmed strategic direction for the next implementation track:
  - no Shopify dependency path for checkout/storefront in this phase
  - owned storefront, catalog, product management, and inventory stack inside app
  - Stripe Checkout selected as the primary checkout/payment mechanism
  - shipping and tax providers to be integrated directly (USPS and others as needed)
- Scope constraints captured for this session:
  - planning-only decision log
  - no functional code patches shipped
  - no route, API, schema, or UI behavior changed in this entry
- Core domain continuity:
  - store-code attribution remains required for downstream commission routing
  - BV/commission logic remains app-owned and will be designed as a deterministic ledger/event flow
- Planned next artifacts before coding:
  - implementation phases and sequence plan
  - provider integration surface contracts
  - order lifecycle and compensation reconciliation plan (purchase, refund, reversal)
  - operational checklist (retries, idempotency, audit trail, monitoring)

---

## Update (2026-03-26) - Stripe Checkout Transition (Implemented)

- Scope completed:
  - moved storefront checkout from local card-form simulation to Stripe-hosted Checkout Session redirect flow.
  - added backend session-creation and session-finalization APIs to support secure payment handoff and post-payment reconciliation.
  - made checkout finalization idempotent by pre-allocating `invoice_id` in Stripe metadata and reusing it during completion.
- Backend implementation:
  - added `POST /api/store-checkout/session`
    - validates cart lines/store attribution
    - computes checkout totals and discount
    - creates Stripe Checkout Session
  - added `POST /api/store-checkout/complete`
    - verifies paid Stripe session
    - creates store invoice once
    - applies owner BV credit via existing member purchase service
  - updated invoice service to accept optional caller-provided invoice IDs and reject duplicates.
- Frontend implementation:
  - `storefront-shared.js`
    - replaced invoice-direct checkout with Stripe session bootstrap
    - added checkout completion helper for post-redirect finalization
  - `store-checkout.html`
    - removed raw card inputs
    - updated form to customer + shipping details
    - redirects to Stripe checkout URL
    - handles `checkout=success/cancel` return states and confirms payment through backend completion API
- Configuration/setup:
  - added Stripe SDK dependency (`stripe`) in `package.json`.
  - added env placeholders for `STRIPE_SECRET_KEY` and `PUBLIC_APP_ORIGIN` in `.env`.
- Files changed:
  - `backend/app.js`
  - `backend/routes/store-checkout.routes.js` (new)
  - `backend/controllers/store-checkout.controller.js` (new)
  - `backend/services/store-checkout.service.js` (new)
  - `backend/services/invoice.service.js`
  - `storefront-shared.js`
  - `store-checkout.html`
  - `package.json`
  - `package-lock.json`
  - `.env`
- Validation:
  - parse checks passed:
    - `node --check backend/services/store-checkout.service.js`
    - `node --check backend/controllers/store-checkout.controller.js`
    - `node --check backend/routes/store-checkout.routes.js`
    - `node --check backend/services/invoice.service.js`
    - `node --check backend/app.js`
  - smoke check:
    - `POST /api/store-checkout/session` returns `503` with clear config message when `STRIPE_SECRET_KEY` is unset
    - `GET /store-checkout.html` returns `200` and renders Stripe transition copy/buttons

---

## Update (2026-03-25) - Admin My Store Container Revision (Sidebar Removed)

- Follow-up user feedback:
  - requested removal/update of the sidebar-style `Store Console` rail.
- Change applied in `admin.html`:
  - removed left persistent side rail.
  - replaced with top command-bar composition inside `My Store`:
    - top header
    - horizontal workspace nav cards
    - inline workspace context panel
- Preserved behavior:
  - existing `data-store-tab`/`setStoreTab` interaction contract unchanged.
  - product management list/editor flow from redesign V3 remains fully active.
- Validation:
  - `admin.html` inline script parse check passed.

## Update (2026-03-25) - Admin Product Management Redesign V3 (Shopify-Style Flow)

- User feedback:
  - prior redesigns still felt like layout-only changes and did not provide a true product-management flow.
- Full flow redesign implemented in `admin.html`:
  - replaced previous combined form/list block with:
    - `Products list view` (catalog rows for overview and quick actions)
    - `Product editor view` (dedicated single-product management page)
- List view behavior:
  - `Add Product` opens editor in create mode.
  - each row includes `Manage` action to open that product’s editor page.
  - `Archive/Unarchive` remains available as a quick list action.
  - list now surfaces status, price, inventory/BV, and updated date in a denser admin-table style.
- Editor view behavior:
  - dedicated editor shell with:
    - back navigation to product list
    - contextual editor title/subtitle/status
    - media section (primary upload + gallery URLs)
    - description section
    - pricing/inventory/BV section
    - product status selector (`active` / `archived`)
    - archive/delete actions (existing products only)
  - save keeps user in editor mode to continue managing the same product.
  - delete returns to list with list-level feedback.
- JS architecture updates:
  - added editor/list workspace routing helpers:
    - `setAdminProductWorkspaceView(...)`
    - `openAdminProductEditorForCreate(...)`
    - `openAdminProductEditorForProduct(...)`
    - `openAdminProductListView()`
  - added editor header/status sync behavior tied to current editing product.
  - maintained existing API endpoints and data persistence contract.
- Validation:
  - `admin.html` inline script parse check passed.

## Update (2026-03-25) - Admin My Store Redesign V2 (Fresh Footprint)

- Follow-up user feedback:
  - prior redesign still felt like the same footprint.
- V2 redesign implemented in `admin.html` with new structural composition:
  - replaced top-heavy header/nav pattern with a split app-shell:
    - left `Store Console` side rail (persistent nav + context)
    - right workspace canvas (active tab content blocks)
  - tab selectors now live as stacked side-rail cards instead of a top strip.
  - context indicators (`title`, `description`, `pill`) are anchored in side rail and remain visible while scrolling content.
- Compatibility and behavior:
  - reused existing `data-store-tab` and `data-store-view` contracts.
  - no API/backend changes.
  - no view routing/state storage contract changes.
- Validation:
  - `admin.html` inline script parse check passed.

## Update (2026-03-25) - Admin My Store Navigation Redesign (Shopify-Inspired)

- User request:
  - redesign the `My Store` nav/workspace area in admin because current interaction and visual quality felt flat/amateur.
- Scope completed in `admin.html`:
  - replaced the old simple tab row with a richer workspace shell:
    - improved header hierarchy
    - status chips
    - tab cards with title + micro-description
    - active-state badge per selected tab
    - right-side contextual panel that describes the active workspace
  - updated tab style state classes to provide a stronger active/inactive separation.
  - extended `storeTabMeta` with:
    - `title`
    - `description`
    - `pillLabel`
  - `setStoreTab(...)` now also syncs:
    - active indicator visibility on tab cards
    - context panel title
    - context panel description
    - context panel pill label
- Compatibility:
  - existing view keys (`storefront`, `analytics`, `setup`) and persistence behavior remain intact.
  - no API, route, or backend changes required.
- Validation:
  - `admin.html` inline script parse check passed.

## Update (2026-03-25) - Product Page Description Field Placement Fix

- User-reported issue:
  - description content appeared outside the visual `Description` field on `store-product.html`.
- Root cause:
  - one description segment (`product-description-lead`) was rendered in a separate paragraph above the Description card.
- Fix applied:
  - removed the separate lead paragraph outside the card.
  - unified rendering so all description paragraphs are injected into `#product-description-body` within the Description card.
  - added loading placeholder paragraph inside description body container.
- File changed:
  - `store-product.html`
- Validation:
  - `store-product.html` inline script parse check passed.

## Update (2026-03-25) - Admin Product Management Cleanup (Remove Product Details Field)

- User request:
  - remove `Product Details (one detail per line)` from admin Product Management.
- Changes applied in `admin.html`:
  - removed the details textarea from the Product Management form.
  - removed JS bindings and parse references for `admin-product-details-input`.
  - form submit payload now excludes manual details input from admin UI.
  - removed details-preview line from managed product cards to align with simplified form.
- Scope note:
  - existing product records may still contain `details` data in persistence, but admin UI no longer collects/edits that field.
- Validation:
  - `admin.html` inline script parse check passed.

## Update (2026-03-25) - Product Description Parity Fix (Admin -> Product Page)

- User-reported issue:
  - product descriptions shown on `store-product.html` did not match what was entered in admin product management.
- Root cause:
  - product page was auto-generating narrative text from `description + details` and filtering terms, which changed content.
- Fix applied:
  - removed narrative rewrite path from product page.
  - product page now renders the exact `product.description` text from API payload.
  - if description includes line breaks, they render as multiple paragraphs.
- File changed:
  - `store-product.html`
- Validation:
  - `store-product.html` inline script parse check passed.

## Update (2026-03-25) - Store Product Images (`Browse` Upload + Multi-Image Gallery Support)

- Scope completed:
  - added admin-side product image upload endpoint:
    - `POST /api/admin/store-products/upload-image`
  - added `Browse...` upload action in Product Management form (`admin.html`) so admins can upload local images directly.
  - retained manual URL entry for primary image while supporting both workflows.
  - added optional gallery field:
    - `Additional Image URLs (one per line)`
  - added public product-page thumbnail gallery support for products with multiple images.

- Backend image storage design:
  - uploaded files are stored on the app host filesystem under:
    - `uploads/store-products/`
  - API returns relative public URL path:
    - `/uploads/store-products/<generated-file-name>`
  - project static serving already exposes `/uploads/...` via existing `express.static(projectRoot)`.

- Store product data model updates:
  - preserved existing single-image compatibility:
    - `image` (primary image URL)
  - added gallery support:
    - `images` (array of image URLs, max 12)
  - DB table update:
    - added/uses `charge.store_products.image_urls jsonb`
    - existing `image_url` remains and is synchronized as primary image.
  - read/write mapping now includes both:
    - `image_url` (primary)
    - `image_urls` (gallery array)

- Database compatibility/migration behavior:
  - startup schema guard now checks if `image_urls` exists.
  - if missing, migration is executed through admin DB role (not service role) to avoid ownership permission failures.
  - migration backfills gallery arrays from existing `image_url` values.

- Admin UX updates (`admin.html`):
  - added hidden file input + `Browse...` button for local file selection.
  - added upload status feedback and image preview in form.
  - enforced upload guardrails:
    - accepted formats: JPG, PNG, WEBP, GIF
    - max upload file size: 5 MB
  - product form now persists:
    - `image` (primary)
    - `images` (gallery)
  - managed-product list now shows image count per product.

- Public storefront updates:
  - `storefront-shared.js` product normalization now supports `images[]`.
  - `store-product.html` now renders:
    - primary image
    - thumbnail strip when multiple images are available
    - click-to-switch gallery behavior
  - single-image products continue to render without gallery UI.

- Files changed:
  - `admin.html`
  - `store-product.html`
  - `storefront-shared.js`
  - `backend/app.js`
  - `backend/routes/store-product.routes.js`
  - `backend/controllers/store-product.controller.js`
  - `backend/services/store-product.service.js`
  - `backend/stores/store-product.store.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `node --check backend/app.js`
  - `node --check backend/controllers/store-product.controller.js`
  - `node --check backend/routes/store-product.routes.js`
  - `node --check backend/services/store-product.service.js`
  - `node --check backend/stores/store-product.store.js`
  - `node --check storefront-shared.js`
  - inline script parse checks passed:
    - `admin.html`
    - `store-product.html`
    - `store.html`
    - `store-checkout.html`
  - smoke check (local server):
    - `GET /api/admin/store-products` -> `200`
    - `POST /api/admin/store-products/upload-image` -> `200`

## Update (2026-03-25) - Preferred Customer (`Free Account`) Foundation + Pending Binary Placement

- Scope completed:
  - added new account package key `preferred-customer-pack` with label `Free Account`.
  - mapped starting rank to `Preferred Customer`.
  - added `Preferred Customers` side-nav route/page (`/PreferredCustomer`) as a dedicated planner view (not enrollment).
  - preferred page now lists purchasers from owner-attributed store invoices and opens placement planning per customer.
- Pending-flow behavior implemented:
  - enrolled Free Accounts are kept out of Binary Tree by eligibility filter.
  - placement metadata (`left/right/spillover + parent`) is still stored at enrollment time.
  - spillover now supports `Auto Assign Parent` or `Assign Specific Parent`.
  - manual parent assignment validates direct-child references; auto mode leaves parent empty and auto-resolves at placement time.
  - enrollment placement selector now marks filled direct legs and auto-switches to `Spillover` when both left and right direct slots are occupied.
  - once account upgrades to paid package, existing placement metadata is used for auto-placement in Binary Tree.
- Preferred page planning workflow:
  - click a purchaser row to edit planned placement:
    - `left`
    - `right`
    - `spillover` (with auto/manual parent assignment)
  - planner shows customer purchase totals, BP, invoice count, and last purchase date.
  - planner save writes placement plan through new API endpoint:
    - `PATCH /api/registered-members/:memberId/placement`
- Store and BV attribution updates:
  - Free Account discount configured to `15%`.
  - Free Account buyer does not receive PV/BV from store checkout.
  - owner/upline attribution path receives BV credit instead (with fallback owner resolution).
  - BV credit is triggered when checkout payment succeeds (no wait-state gating by invoice visual status).
  - invoice payload now supports fail-safe store attribution pair:
    - `memberStoreCode`
    - `memberStoreLink` (`?store=` code)
  - backend rejects mismatched store code/link pairs.
- Identity/store code plumbing:
  - member enrollment now assigns:
    - `storeCode`
    - `publicStoreCode`
    - `attributionStoreCode`
  - sponsor store codes are backfilled if missing during enrollment.
  - auth/login session payload now carries store-attribution fields for frontend logic.
- Files changed:
  - `index.html`
  - `login.html`
  - `backend/services/member.service.js`
  - `backend/controllers/member.controller.js`
  - `backend/routes/member.routes.js`
  - `backend/services/invoice.service.js`
  - `backend/services/admin.service.js`
  - `backend/utils/auth.helpers.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/preferred-customer-page.md`
- Validation:
  - `node --check backend/services/member.service.js`
  - `node --check backend/services/invoice.service.js`
  - `node --check backend/services/admin.service.js`
  - `node --check backend/utils/auth.helpers.js`
  - `index.html` inline script parse passed (`2` inline blocks).
  - `login.html` inline script parse passed (`2` inline blocks).

## Update (2026-03-16) - E-Wallet Dedicated Tables Restored (Post-Privilege Update)

- Follow-up request:
  - after pgAdmin privilege updates, switch E-Wallet back to dedicated DB tables.
- Privilege validation:
  - `charge_app_admin` can now create in `charge` schema.
  - `charge_app_service` still cannot create schema objects (expected), but can use granted table DML.
- Provisioning executed (admin role):
  - created/verified:
    - `charge.ewallet_accounts`
    - `charge.ewallet_peer_transfers`
  - created/verified indexes:
    - `ewallet_accounts_username_lower_idx`
    - `ewallet_accounts_email_lower_idx`
    - `ewallet_peer_transfers_sender_created_idx`
    - `ewallet_peer_transfers_recipient_created_idx`
    - `ewallet_peer_transfers_reference_code_idx`
  - granted service role access:
    - `GRANT USAGE ON SCHEMA charge`
    - `GRANT SELECT, INSERT, UPDATE, DELETE` on both E-Wallet tables.
- Backend refactor:
  - restored `backend/stores/wallet.store.js` to dedicated-table storage/query path.
  - removed temporary compatibility logic that routed E-Wallet transfer persistence through `charge.payout_requests`.
  - retained service-level E-Wallet API contract unchanged.
- Runtime validation:
  - `node --check` passed for wallet backend modules.
  - `GET /api/e-wallet` returns `200` on live backend (`localhost:3000`) with wallet payload.
  - `POST /api/e-wallet/peer-transfer` validated on temp server; test transfer was rolled back to avoid fixture drift.

## Update (2026-03-16) - E-Wallet API Recovery (Database-Only, No New Table DDL)

- User issue:
  - E-Wallet timeline failed with `Unable to load E-Wallet details.` after server restart.
- Root cause confirmed:
  - runtime DB roles in `.env` (`charge_app_service`, `charge_app_admin`) currently cannot create new tables in `charge` schema.
  - `CREATE TABLE IF NOT EXISTS charge.ewallet_*` path failed with PostgreSQL error:
    - `42501 permission denied for schema charge`
- Database-only fix implemented:
  - rewired `backend/stores/wallet.store.js` to use existing writable DB tables:
    - user identity/profile from `charge.member_users`
    - transfer ledger persisted in `charge.payout_requests` (with E-Wallet-specific source keys/fields)
  - kept E-Wallet API contract unchanged:
    - `GET /api/e-wallet`
    - `POST /api/e-wallet/peer-transfer`
  - no local JSON/file fallback used.
  - updated transfer writer metadata in `backend/services/wallet.service.js` to include sender name payload for DB row completeness.
- Files changed:
  - `backend/stores/wallet.store.js`
  - `backend/services/wallet.service.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

### Validation performed

- Permission repro checks:
  - service-role create probe in `charge` failed with `42501`
  - admin-role create probe in `charge` failed with `42501`
- Runtime checks:
  - `node --check` passed for wallet store/service/controller/routes
  - live endpoint on `http://localhost:3000` now returns `200`:
    - `GET /api/e-wallet?...` returns wallet + transfer payload (no 500)

### Known limitation

- This recovery path intentionally avoids schema DDL and depends on existing DB tables.
- If direct `charge.ewallet_*` tables are still preferred, schema `CREATE` privileges (or privileged migration execution) are required first.

## Update (2026-03-16) - E-Wallet Layout Redesign (Non-KPI Experience)

- User request:
  - redesign E-Wallet layout so it does not feel repetitive with dashboard KPI-card styling.
- Frontend redesign in `index.html`:
  - rebuilt `section#page-e-wallet` structure into a distinct layout:
    - hero-style wallet command center panel
    - flow rail metrics (Outgoing, Incoming, Transfer Events) using directional rows instead of KPI tiles
    - transfer composer panel (left)
    - transfer timeline stream (right) with persistent refresh action
  - removed KPI-card visual pattern from E-Wallet summary presentation while preserving all runtime IDs used by JS data bindings.
  - updated transfer history item renderer (`renderEWalletTransferHistory`) to timeline entries with directional markers and signed amount emphasis instead of repetitive mini-card blocks.
- Files affected:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

### Design decisions

- Kept existing E-Wallet element IDs unchanged so transfer loading/submission logic remains fully compatible.
- Shifted from dashboard-like “card grid metrics” toward an operational “command center + timeline” visual hierarchy.
- Preserved established theme tokens (`brand`, `surface`, `semantic`) to stay consistent with the existing design system while changing composition.

### Known limitations

- This pass is layout/presentation focused; no API/transfer business logic changes were required.
- Transfer timeline still relies on current local/API ordering as provided by backend snapshot payload.

### Validation performed

- Inline script parse check passed for all inline script blocks in `index.html`.
- Verified required E-Wallet DOM IDs still exist for:
  - summary values
  - transfer form controls
  - history panel controls and containers

## Update (2026-03-16) - Full E-Wallet Feature (Page + Backend + P2P Transfer)

- User request:
  - build complete E-Wallet from page to backend functions, including peer-to-peer transfer.
- Frontend implementation in `index.html`:
  - converted sidebar `E-Wallet` item into routed nav link:
    - `href="/EWallet"`
    - `data-nav-link`
    - `data-page="e-wallet"`
  - added new page section:
    - `section#page-e-wallet[data-page-view="e-wallet"]`
    - wallet summary cards (balance, sent, received, transfer count)
    - peer transfer form (recipient, amount, optional note)
    - transfer history panel + refresh button
  - added route metadata:
    - `pageMeta['e-wallet']`
    - `pagePathByPage['e-wallet'] = '/EWallet'`
  - added E-Wallet frontend module:
    - `loadEWalletSnapshotForCurrentUser(...)`
    - `submitEWalletPeerTransfer(...)`
    - `renderEWalletSummary()` / `renderEWalletTransferHistory()`
    - UI feedback handlers and form wiring
  - integration behavior:
    - opening E-Wallet page fetches live wallet snapshot/history from backend
    - transfer success updates wallet balance + history immediately
    - wallet snapshot syncs `dashboard total balance`
    - transfer events now appear in recent activity (`kind: transfer`)
- Backend implementation:
  - added wallet persistence layer with lazy schema bootstrap:
    - `backend/stores/wallet.store.js`
    - creates tables if missing:
      - `charge.ewallet_accounts`
      - `charge.ewallet_peer_transfers`
    - includes read/upsert/lock/update/insert/list helpers
  - added wallet business logic:
    - `backend/services/wallet.service.js`
    - account resolution via member identity
    - transactional peer transfer with:
      - account upsert
      - `FOR UPDATE` account locking
      - insufficient balance guard
      - atomic debit/credit and transfer record write
  - added wallet HTTP layer:
    - `backend/controllers/wallet.controller.js`
    - `backend/routes/wallet.routes.js`
    - wired into app via `backend/app.js`
  - API endpoints added:
    - `GET /api/e-wallet`
    - `POST /api/e-wallet/peer-transfer`
- Files changed:
  - `index.html`
  - `backend/app.js`
  - `backend/stores/wallet.store.js` (new)
  - `backend/services/wallet.service.js` (new)
  - `backend/controllers/wallet.controller.js` (new)
  - `backend/routes/wallet.routes.js` (new)
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - backend syntax checks passed:
    - `node --check backend/stores/wallet.store.js`
    - `node --check backend/services/wallet.service.js`
    - `node --check backend/controllers/wallet.controller.js`
    - `node --check backend/routes/wallet.routes.js`
    - `node --check backend/app.js`
  - frontend inline script parse passed for:
    - `index.html`
    - `admin.html`

---

## Update (2026-03-16) - Sidebar Binary Tree Auto-Fullscreen

- User request:
  - when clicking `Binary Tree` from the side navbar, open the Binary Tree page in fullscreen mode automatically.
- Files changed:
  - `index.html`
  - `admin.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Implementation:
  - extended `setPage(pageName, options)` Binary Tree branch to support:
    - `options.autoEnterBinaryTreeFullscreen`
  - after `ensureBinaryTreeReady()` resolves and layout refresh runs, call:
    - `controller.enterFullscreen()` when the flag is enabled.
  - updated sidebar nav click handlers to pass the flag only for Binary Tree page clicks:
    - `autoEnterBinaryTreeFullscreen: requestedPage === 'binary-tree'`
- Behavior notes:
  - This does not force fullscreen on every Binary Tree render path.
  - It is scoped to the sidebar Binary Tree click interaction, matching the request.
  - Existing fullscreen guards remain intact (`enterFullscreen` no-ops if already active).

---

## Update (2026-03-15) - Legacy Tier Base Count Adjusted to 1/40

- User clarification:
  - tier node total should include account owner/root.
  - expected base state is `1/40`.
- Patch:
  - in Legacy tier snapshot config, changed:
    - `includeRootNodeWithoutSeeds: false` -> `includeRootNodeWithoutSeeds: true`
  - file: `index.html` (`buildLegacyLeadershipTierSnapshots` configuration).
- Behavior after patch:
  - with `0` directs:
    - Tier 1 displays `1/40`.
  - with `3` directs:
    - Tier 1 displays `4/40` (root + first 3 directs).
    - Tier 2 appears and starts at `1/40`.
  - sequential unlock rule remains intact (Tier 2 appears only after Tier 1 gets `3/3` directs).
- Validation:
  - browser automation run passed for `0` and `3` direct scenarios.
  - temporary test data was reset after validation to preserve fresh-start DB state.

---

## Update (2026-03-15) - Legacy Leadership Tier 1 / Tier 2 Progression Correction

- Reported behavior:
  - Tier 1 and Tier 2 looked like they were reflecting the same state.
  - Tier 2 was effectively visible too early.
- Business-rule intent confirmed:
  - Next tier should appear only after current tier completes first `3` direct Legacy sponsorship requirements.
  - Tier bonus claim still requires full `40` node completion in that tier.
  - After `3/3` directs are complete, user should move to next tier and begin building there.
- Implementation in `index.html`:
  - Extended `buildInfinityBuilderTierSnapshots(options)` with configurable progression controls:
    - `baseVisibleTierCount`
    - `previewLockedTierCount`
    - `unlockByDirectRequirement`
    - `includeRootNodeWithoutSeeds`
  - Legacy Leadership snapshot config now uses:
    - `baseVisibleTierCount: 1`
    - `previewLockedTierCount: 0`
    - `unlockByDirectRequirement: true`
    - `includeRootNodeWithoutSeeds: false`
  - Unlock behavior:
    - Legacy tiers now unlock sequentially from direct requirement (`3/3`) instead of waiting for previous tier full completion.
  - Display behavior:
    - With zero seeds, visible tier starts at `0/40` (not `1/40`).
    - Prevents Tier 1/Tier 2 appearing like duplicates at initialization.
- Validation (browser automation):
  - `0 directs`:
    - Tier cards shown: `Tier 1` only
    - state: `0/40`, `0/3`.
  - `2 directs`:
    - Tier cards shown: `Tier 1` only
    - state: `2/3`, Tier 2 hidden.
  - `3 directs`:
    - Tier cards shown: `Tier 1`, `Tier 2`
    - Tier 1 progresses; Tier 2 starts at `0/40` and begins build phase.
- Data hygiene:
  - temporary test enrollments used for validation were removed via reset.
  - DB was returned to fresh-start dataset after test run.

---

## Update (2026-03-15) - Fresh Start Cleanup Applied (Legacy Restore Removed)

- User requested a fresh new dataset and explicitly rejected restored historical users.
- Action taken:
  - executed full app data reset to wipe restored legacy rows.
  - re-applied runtime defaults (`dashboardMockupModeEnabled=false`, `tierClaimMockModeEnabled=false`).
- Post-reset verification counts:
  - `member_users: 0`
  - `registered_members: 0`
  - `password_setup_tokens: 0`
  - `email_outbox: 0`
  - `store_invoices: 0`
  - `payout_requests: 0`
  - `binary_tree_metrics_snapshots: 0`
  - `sales_team_commission_snapshots: 0`
  - `member_server_cutoff_states: 0`
  - `force_server_cutoff_history: 0`
  - `admin_users: 1` (kept)
  - `runtime_settings: 1` (kept)
- Backend availability:
  - health check remains OK on `GET /api/health`.

---

## Update (2026-03-15) - PostgreSQL Data Recovery (Users Restored)

- Recovery action performed after accidental user-table clear during debug/reset flow.
- Data source:
  - `/Users/seth/Documents/Web-Dev` JSON stores (original mock-first dataset).
- Restore pipeline:
  - executed admin reset to clear partial/debug state.
  - re-imported DB-backed stores in dependency order:
    - users -> members -> tokens -> outbox
    - invoices/payouts
    - binary snapshots/commissions
    - member cutoff states/history
    - runtime settings
    - admin user upsert
- Restored counts:
  - `member_users: 22`
  - `registered_members: 22`
  - `password_setup_tokens: 22`
  - `email_outbox: 22`
  - `store_invoices: 5`
  - `payout_requests: 12`
  - `binary_tree_metrics_snapshots: 13`
  - `sales_team_commission_snapshots: 13`
  - `member_server_cutoff_states: 15`
  - `force_server_cutoff_history: 17`
  - `admin_users: 1`
  - `runtime_settings: 1`
- Verification:
  - backend dev server is running and health route returns OK.
  - restored seed did not contain `zeroone`, so the account was recreated as a legacy active-login user.

---

## Update (2026-03-15) - Legacy Leadership Bonus Locked-State Fix (ZeroOne Scenario)

- Reported issue:
  - user-side dashboard showed `Legacy Leadership Bonus Locked` for a logged-in Legacy package account (`zeroone`).
- Root cause:
  - Legacy Leadership top-level eligibility was gated by both rank and direct-enrollment count:
    - `isEligible: rankEligible && directRequirementMet`
  - This prevented Legacy Founder access (purchase Legacy package) and hid tier cards unless 3 direct legacy enrollments already existed.
- Patch in `index.html`:
  - `resolveLegacyLeadershipEligibilityFromRankAndSponsor(...)`
    - changed top-level gate to `isEligible: rankEligible`.
    - kept direct legacy enrollment count for tier progress/completion logic.
  - `renderLegacyLeadershipTopBonusCard(...)`
    - updated locked subtitle copy to `Legacy rank required`.
    - locked footnote now uses `buildLegacyLeadershipEligibilityRequirementMessage(...)` for consistent requirements text.
- Behavioral result:
  - Legacy-ranked users now enter Legacy Leadership in `Building` state and see Tier cards (including Tier 1) even with `0/3` directs.
  - Non-legacy users remain fully locked with requirement guidance.
- Validation:
  - Browser automation with injected Legacy session:
    - `Legacy Leadership Bonus Locked` gate no longer shown.
    - Tier 1 visible; top status `Building`.
  - Browser automation with Personal session:
    - locked gate still shown as expected.

---

## Update (2026-03-15) - DB Deadlock Elimination for Enrollment + Force Cutoff

- Investigated and fixed intermittent backend `500` failures after PostgreSQL initialization:
  - `POST /api/registered-members`
  - `POST /api/admin/force-server-cutoff`
- Root cause:
  - competing transactions writing related tables in parallel (`member_users`, `registered_members`, snapshots/cutoff state tables) could produce PostgreSQL deadlocks (`40P01`).
  - additional unsafe query fanout in reset flow used `Promise.all` on a single PG client.
- Code changes:
  - `backend/services/admin.service.js`
    - replaced parallel table-count queries in `resetAllMockData(...)` with sequential query loop on one client.
    - replaced parallel write fanout in `forceServerCutoff(...)` with ordered writes:
      - users -> members -> binary snapshots -> sales commissions -> member cutoff states -> cutoff history.
  - `backend/services/member.service.js`
    - `createRegisteredMember(...)` now persists sequentially:
      - users -> members -> tokens -> outbox.
    - `upgradeMemberAccount(...)` now persists sequentially:
      - users -> members.
  - `backend/controllers/admin.controller.js`
    - improved `postForceServerCutoff` catch logging to include stack/message context.
  - `backend/controllers/member.controller.js`
    - improved `registerMember` catch logging to include stack/message context.
- Validation:
  - direct service repro script passed:
    - reset -> register -> binary metrics save -> force cutoff.
  - API repro on fresh server passed:
    - force cutoff returns `200` with applied summary after seeded snapshot.
  - broad API smoke checks passed on member/admin endpoints with expected statuses.

---

## Update (2026-03-08) - Full Binary Tree Investigation + Cutoff/Tier Bugfixes

- Ran full binary-tree integrity sweep across:
  - placement path/build consistency from `registered-members.json`
  - sponsor/ancestor validation
  - snapshot parity against computed tree leg BV
  - member cutoff-state freshness vs account creation timestamp
- Confirmed current placement/snapshot parity for `sethfozz`:
  - computed legs `1920 / 2880` matched `mock-binary-tree-metrics.json`
  - `juan` ancestry path includes `hues` (`juan -> bond -> hues -> ...`)
- Found and fixed two overlooked issues:
  - **Stale cutoff state bleed for newer accounts**
    - in `serve.mjs` (`/api/member/server-cutoff-metrics`), baseline leg/personal state could still inherit a cutoff timestamp older than the account creation timestamp.
    - Added account-createdAt guard to invalidate stale `lastAppliedCutoffUtcMs` for that account and reset effective baselines to `0`.
  - **Locked tier cards progress bar stuck at `0%`**
    - in `index.html`, Infinity/Legacy locked cards displayed `x/3` direct counts but hardcoded progress width `0%`.
    - Updated locked-card bars to use direct progress ratio (`qualifiedDirectCount / requiredDirectCount`).
- Additional hardening:
  - `serve.mjs` auth payload sanitizer now ignores stale personal baseline values when `createdAt > baselineSetAt`.
  - `index.html` starter dashboard metrics now use stale-baseline-safe resolver, preventing false `0 PV` on session bootstrap.
- Runtime/data validation:
  - `serve.mjs` syntax check passed.
  - `index.html` inline script parse passed.
  - exercised member cutoff endpoint for `juan` and `love`; stale cutoff timestamps were normalized in stores (`lastAppliedCutoffUtcMs -> 0`, baseline setAt cleared) under patched logic.

---

## Update (2026-03-08) - Binary Tree BV Rollup Baseline-Date Guard

- Investigated report: enrolled `juan` did not add expected `960 BV` under `hues` in binary tree context.
- Findings:
  - Placement path is valid: `juan -> bond -> hues -> ...`, so `hues` should receive rollover BV from `juan`.
  - `juan` had stale baseline fields (`serverCutoffBaselineStarterPersonalPv=960`) with `serverCutoffBaselineSetAt` older than `juan.createdAt`, causing weekly BV to collapse to `0` in rollup math.
- Fixes applied:
  - Frontend tree math (`index.html`):
    - updated `resolveMemberServerCutoffBaselineVolume(...)` to ignore stale baseline when member `createdAt` is later than `serverCutoffBaselineSetAt`.
  - Member cutoff API (`serve.mjs`):
    - added equivalent personal-baseline guard (`resolveEffectiveServerCutoffPersonalBaselineForRecord`) in `/api/member/server-cutoff-metrics` path for server/client consistency.
- Validation:
  - `index.html` inline script parse passed.
  - `serve.mjs` syntax check passed.
  - local recompute confirmed:
    - `juan weekly volume: 960`
    - `hues` computed leg volumes now include that credit (`left: 960`, `right: 0`).

---

## Update (2026-03-08) - Modal Media Live Preview

- Enhanced `Edit Profile` modal so profile media section now shows live visual previews, not only action buttons.
- Added modal preview elements in `/Users/seth/Documents/Web-Dev/index.html`:
  - `#profile-edit-cover-preview-image`
  - `#profile-edit-avatar-preview-image`
- Updated media layout to mimic how profile appears in header:
  - cover strip with gradient treatment
  - overlapping avatar preview
  - change-photo/change-cover controls in the same preview block
- Runtime sync update:
  - `syncHeaderAndProfileImages(...)` now updates modal preview images together with header/profile page images.
- Validation:
  - inline script parse passed for `index.html`.

---

## Update (2026-03-08) - Profile Media Controls Moved To Edit Modal

- Updated profile UX so profile photo and cover changes are only available inside `Edit Profile` modal.
- Removed visible media-change controls from the profile header area.
- Added a dedicated `Profile Media` block inside the edit modal with:
  - `Change Profile Picture`
  - `Change Cover Photo`
- Reused existing upload ids so runtime handlers remain unchanged:
  - `#profile-avatar-upload-button`
  - `#profile-cover-upload-button`
  - `#profile-avatar-file-input`
  - `#profile-cover-file-input`
- File updated:
  - `/Users/seth/Documents/Web-Dev/index.html`
- Validation:
  - inline script parse passed for `index.html`.

---

## Update (2026-03-08) - Profile Location Line (LinkedIn-Style)

- Added visible profile location text directly under handle on Profile page:
  - `#profile-location-display`
- Added editable `State / Region` field in profile modal:
  - `#profile-region-input`
- Location render format now follows LinkedIn-style output:
  - `Country, State/Region` when both are present
  - falls back to available part when one is missing
  - default copy: `Set your location`
- Implemented country-code-to-name mapping and formatter in `index.html`:
  - `COUNTRY_NAME_BY_CODE`
  - `resolveCountryDisplayName(...)`
  - `formatProfileLocation(...)`
- Extended profile persistence/session sync to include region:
  - profile store now includes `region`
  - session mirror field uses `currentSessionUser.profileRegion`
- Validation:
  - inline script parse passed for `index.html` after location update.

---

## Update (2026-03-08) - Profile Edit Modal Conversion

- Converted profile editing UX from always-visible inline card to modal flow in `/Users/seth/Documents/Web-Dev/index.html`.
- UI changes:
  - Added `Edit Profile` trigger button below the bio text (`#profile-edit-open-button`).
  - Replaced inline editor block with modal overlay/dialog:
    - `#profile-edit-modal-overlay`
    - `#profile-edit-modal-close-button`
    - existing form ids preserved (`#profile-edit-form`, `#profile-display-name-input`, `#profile-bio-input`, etc.).
- Behavior changes:
  - open on `Edit Profile` button click.
  - close on `Dismiss`, outside-click on overlay backdrop, and `Escape`.
  - modal auto-closes when leaving the Profile page route.
  - focus restore implemented back to trigger button when modal closes.
- Validation:
  - inline script parse passed for `index.html` after modal conversion.

---

## Update (2026-03-08) - Dashboard Weekly BV Labels + Profile Page Wiring

- Confirmed dashboard organization BV cards are weekly-reset values.
- Updated dashboard labels in `/Users/seth/Documents/Web-Dev/index.html`:
  - `Total Organization BV` -> `Weekly Total Organization BV`
  - `Personal Organization BV` -> `Weekly Personal Organization BV`
- Completed profile-page integration already scaffolded in `index.html`:
  - wired top-header name/avatar button (`#header-profile-button`) to open the new `profile` page route.
  - initialized profile module on app startup (`initializeProfileModule()`).
  - ensured lifetime profile cards refresh from live tree summary updates via `renderProfileLifetimeCards(...)` in `applyBinaryTreeDashboardSummary(...)`.
- Profile feature set now active on member app:
  - Edit Profile (display name + country)
  - Edit Bio
  - Add Profile Picture
  - Add Cover image
  - Lifetime milestone cards (`Lifetime Total Organization BV`, `Lifetime Personal Organization BV`) independent from weekly cutoff reset values.
- Additional UI hardening for reported tier-card visibility issue:
  - kept direct-sponsor progress source (`x/3`) and added a minimum visible progress width when progress is above zero, for both Infinity Builder and Legacy Leadership tier cards.
- Validation:
  - inline script parse passed for `index.html` after the routing/profile/progress updates.

---

## Update (2026-03-08) - Tier Card Direct-Sponsor Progress Bar Alignment

- Investigated report: tier cards showed `x/3 Direct Sponsorships Requirements` updating, but progress bar appeared static.
- Root cause:
  - card progress bar width was bound to tier node completion (`litNodeCount / totalNodesPerTier`)
  - text below bar was bound to direct-sponsor seeding (`directChildLitCount / 3`)
  - for Legacy tiers (`40` total nodes), early direct progress looked near-zero visually even when `1/3` was already reached.
- Fix in `/Users/seth/Documents/Web-Dev/index.html`:
  - Updated active-tier progress bar math for both Infinity Builder and Legacy Leadership cards to follow direct-sponsor requirement progress:
    - `directChildLitCount / INFINITY_BUILDER_DIRECT_SPONSORS_PER_TIER`
- Validation:
  - inline script parse passed for `index.html`.
  - `1/3`, `2/3`, `3/3` now maps to visible bar progression (`33.3%`, `66.7%`, `100%`) consistent with displayed requirement text.

---

## Update (2026-03-08) - KPI / Server Cut-Off / Fullscreen Enroll Investigation + Fixes

- Investigated reported regressions in:
  - dashboard KPI consistency after member enrollment
  - Server Cut-Off left/right leg behavior unexpectedly snapping to `0`
  - Binary Tree fullscreen enroll flow not showing the auth/password setup link
- Root causes identified:
  - `GET /api/member/server-cutoff-metrics` was mutating cutoff baseline state during read hydration (scheduled/forced application path), which could zero out current-week BV mid-session.
  - Fullscreen enroll modal had no dedicated password setup link target and auto-closed immediately after success.
- Backend fix in `/Users/seth/Documents/Web-Dev/serve.mjs`:
  - Removed automatic cutoff baseline application from the member metrics GET path (no scheduled/forced baseline mutation during read).
  - Kept cutoff schedule metadata in response for countdown display.
  - Updated estimated cycle computation to use lower/higher leg ordering (`either leg` split interpretation) for `500 / 1000`.
- Frontend fix in `/Users/seth/Documents/Web-Dev/index.html`:
  - Added fullscreen modal auth link element: `#tree-enroll-password-setup-link`.
  - Added helper `setTreeEnrollPasswordSetupLink(...)` and integrated with feedback reset lifecycle.
  - Updated fullscreen enroll success flow to:
    - show success feedback in the modal
    - show password setup/auth link directly in fullscreen modal
    - keep modal open for immediate follow-up enrollments (form reset + focus return), instead of closing instantly.
- Validation performed:
  - `node --check serve.mjs` passed.
  - API probe validation against patched server confirmed:
    - current-week leg BV no longer auto-resets to `0` on metrics reads.
    - `estimatedCycles` now reflects lower/higher split rule correctly (`1200/600` => `1` cycle under `500/1000`).
- Known limitation:
  - Weekly cutoff rollover is no longer auto-applied in the member metrics read endpoint; cutoff baseline advancement should come from explicit cutoff execution flows.

---

## Update (2026-03-08) - Theme System Planning Prompt Draft

- Planned a multi-theme visual system for the current member web app without changing layout structure.
- Theme goal:
  - change the overall look and feel, not just accent colors
  - keep all existing layout decisions fixed
  - draw inspiration from Apple and Shopify visual polish
- Layout freeze was explicitly documented for prompt execution:
  - keep fixed left sidebar width and placement
  - keep sticky top bar structure
  - keep existing dashboard card grid counts, panel order, spacing relationships, and responsive breakpoints
  - keep Binary Tree panel, tools dock, minimap, search panel, and fullscreen workflow structure intact
- Prompt direction prepared for Codex:
  - refactor current hardcoded theme values into semantic design tokens
  - support multiple full visual themes from one layout
  - update typography, surfaces, shadows, borders, background atmospherics, icon treatments, and interactive states per theme
  - preserve all IDs, JS hooks, data attributes, and functional behavior
- Prompt refinement added:
  - theme selection must be accessed from `Settings > Themes`
  - Codex should reuse the app's existing settings architecture instead of inventing a floating or top-bar theme switcher
  - existing runtime theme plumbing (`html[data-theme]`, runtime settings sync, and theme normalization) should be extended rather than replaced
- Files/documents referenced during planning:
  - `/Users/seth/Documents/Web-Dev/index.html`
  - `/Users/seth/Documents/Web-Dev/Claude_Notes/charge-documentation.md`
  - `/Users/seth/Documents/Web-Dev/Claude_Notes/Current Project Status.md`
  - `/Users/seth/Documents/Web-Dev/brand_assets/MLM Business Logic.md`
- Design/system observations captured:
  - current app is single-file Tailwind via CDN with inline theme tokens in `tailwind.config`
  - current shell already uses custom palette, serif + sans pairing, and layered shadows
  - requested change is a broader presentation-system redesign while preserving structure
  - theme infrastructure already exists in `index.html` for `default`, `apple`, and `shopify`
  - current settings-related UI already includes a settings dialog (`#tree-settings-window`) and runtime theme logic
- Risks / limits:
  - admin-side parity is not yet approved and must be explicitly confirmed before mirroring theme work there
  - because the app is single-file HTML with inline Tailwind config, theme extraction must avoid breaking existing selectors and JS-bound elements

---

## Update (2026-03-04) - Server-Authoritative Member Server Cut-Off Panel

- Refactored the member `Server Cut-Off` panel to be server-authoritative instead of front-end local baseline storage.
- Added new server store:
  - `/Users/seth/Documents/Web-Dev/mock-member-server-cutoff-state.json`
- Added new member API endpoint:
  - `GET /api/member/server-cutoff-metrics`
  - Resolves user identity from query (`userId`, `username`, `email`)
  - Loads current binary totals from `mock-binary-tree-metrics.json`
  - Applies latest cut-off state from server store + latest forced cut-off event from history
  - Applies scheduled weekly cut-off boundary server-side
  - Returns current-week Left/Right BV, cycle rule values, and cutoff schedule metadata
- Backend files updated:
  - `/Users/seth/Documents/Web-Dev/serve.mjs`
    - Added member cutoff state read/write sanitizers
    - Added cutoff schedule/timezone utility functions
    - Added new API route `GET /api/member/server-cutoff-metrics`
    - Enhanced admin force cut-off flow to update member cutoff state baselines at force time
    - Extended admin reset-all-data to clear `mock-member-server-cutoff-state.json`
- Frontend files updated:
  - `/Users/seth/Documents/Web-Dev/index.html`
    - Replaced localStorage-based cutoff baseline logic inside `initializeServerCutoffCard()`
    - Panel now fetches from `/api/member/server-cutoff-metrics` and renders server-provided current-week BV
    - `updateServerCutoffMetrics(...)` now triggers a server refresh (after summary sync delay) instead of client-side baseline math
- Admin surface updates:
  - `/Users/seth/Documents/Web-Dev/admin.html`
    - Flush-all file list now includes `mock-member-server-cutoff-state.json`
    - Flush feedback now includes cleared count for member cutoff states
- Validation performed:
  - Script parse checks passed (`index.html`, `admin.html`)
  - `serve.mjs` syntax check passed
  - End-to-end browser timeline test:
    - before force: non-zero BV
    - after force: panel reset to `0/0`
    - observed 20 seconds: no snap-back to old values

---

## Update (2026-03-04) - Member Server Cut-Off Force Event Hydration Fix

- Investigated why member-side `Server Cut-Off` did not reset Left/Right BV after admin force cut-off.
- Reproduced issue with automated browser flow:
  - force cut-off API returned success and history updated
  - member panel still showed previous BV totals after reload
- Root cause:
  - force event timestamp was applied before BV totals finished hydrating in the member page runtime.
  - This persisted `lastAppliedCutoffUtcMs` with `baselineLeftLegBv = 0` and `baselineRightLegBv = 0`, so panel never reset visually.
- Fix implemented in `/Users/seth/Documents/Web-Dev/index.html`:
  - Tracked latest forced event timestamp from `/api/server-cutoff-events`.
  - Added safe `allowEqual` re-apply path to `applyForcedServerCutoff(...)`.
  - Added hydration backfill guard in `updateServerCutoffMetrics(...)`:
    - if a very recent forced event was applied with `0/0` baseline and real BV totals arrive,
    - re-apply the same forced timestamp once so baseline locks to hydrated totals.
- Validation:
  - Inline script parse check passed.
  - Automated Puppeteer verification now shows member panel resets to:
    - `Left Leg BV: 0`
    - `Right Leg BV: 0`
  - Local storage state now persists expected baseline values after force event.

---

## Update (2026-03-04) - Dedicated Binary + Sales Team JSON Stores

- Added two dedicated mock stores for migration-ready data boundaries:
  - `mock-binary-tree-metrics.json`
  - `mock-sales-team-commissions.json`
- Added API routes in `serve.mjs`:
  - `GET/POST /api/binary-tree-metrics`
  - `GET/POST /api/sales-team-commissions`
- Added numeric sanitization and upsert behavior for both stores (money fields remain numeric, not stringified).
- Wired `index.html` to persist snapshots automatically:
  - Binary Tree summary snapshots now sync to `/api/binary-tree-metrics`.
  - Sales Team Commission card snapshots now sync to `/api/sales-team-commissions`.
- Added debounce/signature guards to avoid duplicate writes from repeated UI renders.
- Extended Admin reset behavior and messaging:
  - `POST /api/admin/reset-all-data` now clears both new stores.
  - Settings UI in `admin.html` now lists both new JSON files in flush scope.
- Data shape was structured as table-ready rows (stable identity fields + typed numeric columns + ISO timestamps) to reduce schema drift for upcoming PostgreSQL migration.

---

## Update (2026-03-04) - Full App PostgreSQL Migration Script

- Replaced the narrow migration script with a full-app schema migration:
  - `/migrations/20260304_001_full_app_postgres_schema.sql`
- Scope now covers all JSON-backed stores used by the app server:
  - `mock-users.json`
  - `mock-admin-users.json`
  - `registered-members.json`
  - `password-setup-tokens.json`
  - `mock-email-outbox.json`
  - `mock-store-invoices.json`
  - `mock-payout-requests.json`
  - `mock-runtime-settings.json`
  - `mock-binary-tree-metrics.json`
  - `mock-sales-team-commissions.json`
- Migration includes:
  - dedicated PostgreSQL schema `charge`
  - table DDL for each system
  - numeric money/amount columns via `NUMERIC(...)`
  - non-negative and domain check constraints
  - case-insensitive identity indexes (`LOWER(...)`)
  - `updated_at` trigger function and per-table update triggers
  - runtime settings singleton seed row (`id = 1`)
- Script is prepared only and was **not executed** against any database.

---

## Update (2026-03-04) - Access Control Migration Script (Roles + RLS)

- Added second migration script for database access control:
  - `/migrations/20260304_002_full_app_access_control.sql`
- Scope:
  - Creates app roles (if missing): `charge_admin_role`, `charge_service_role`, `charge_member_role`
  - Sets schema/table grants for admin/service/member role boundaries
  - Enables RLS on all app tables in `charge` schema
  - Adds table policies for:
    - admin/service full access
    - member self-scoped access on member-visible tables
  - Adds helper SQL functions for identity-scoped policy checks:
    - `charge.current_member_user_id()`
    - `charge.current_member_username()`
    - `charge.current_member_email()`
    - `charge.is_owned_identity(...)`
- Policy model summary:
  - Admin/service: full read/write for operational tables.
  - Member: self-only rows for user/member-linked resources (profile, payouts, invoices, binary snapshots, sales snapshots), select access to runtime settings.
- Script includes usage notes for per-request session identity variables (`app.current_user_id`, `app.current_username`, `app.current_email`).
- Script is prepared only and was **not executed** against any database.

---

## Update (2026-03-04) - Admin-Only Seed Migration Script

- Added third migration script for fresh-start launch seeding:
  - `/migrations/20260304_003_admin_seed.sql`
- Scope:
  - Seeds **only** `charge.admin_users`
  - Does not seed any member/business tables
- Current seed payload mirrors existing mock admin bootstrap account:
  - `id: adm_001`
  - `username: admin`
  - `email: admin@charge.com`
- Behavior:
  - idempotent `INSERT ... ON CONFLICT (id) DO UPDATE`
  - safe to re-run during staging resets
- Security note included in script:
  - rotate password before production launch
  - move to hashed-password verification in production auth flow
- Script is prepared only and was **not executed** against any database.

---

## Update (2026-03-04) - BackEnd Notes Documentation File

- Populated backend-specific documentation note:
  - `/Users/seth/Documents/Web-Dev/Claude_Notes/BackEnd-Notes.md`
- Added comprehensive migration log for:
  - full schema migration (`001`)
  - access-control migration (`002`)
  - admin-only seed migration (`003`)
- Included:
  - source JSON store mapping
  - full table list
  - role and RLS summary
  - launch run order
  - production follow-up checklist
- Purpose: central backend/db reference separate from UI-focused change logs.

---

## Update (2026-03-04) - Server Cut-Off Weekly BV Reset (Dashboard + Admin)

- Implemented weekly cut-off reset behavior for the Server Cut-Off card in both:
  - `/Users/seth/Documents/Web-Dev/index.html`
  - `/Users/seth/Documents/Web-Dev/admin.html`
- Behavior now:
  - Left/Right Leg BV display resets to `0` once per closed cutoff window.
  - Displayed BV then re-accumulates as new team BV is added after the cutoff.
- Implementation details:
  - Added per-user/per-config local storage cutoff state:
    - last applied cutoff timestamp
    - baseline left/right total BV at cutoff
  - Added one-time cutoff detection in timer loop (`lastClosedCutoffUtcMs > lastAppliedCutoffUtcMs`) to prevent repeated resets.
  - Adjusted `updateServerCutoffMetrics(...)` to treat incoming BV as totals and render `total - baseline` as current-week BV.
  - Added baseline clamping safety so display does not go negative if totals are reduced/reset.
- Result:
  - Server Cut-Off panel now communicates weekly BV consumption correctly after cut-off execution.

---

## Files Created

| File | Purpose | Notes |
|------|---------|-------|
| `index.html` | Complete dashboard UI | Single file, ~480 lines, all components inline |
| `binary-tree.mjs` | Binary Tree renderer/controller | PixiJS hybrid WebGL + DOM module for MLM tree canvas |
| `serve.mjs` | Local dev server | Serves project root at `http://localhost:3000` |
| `screenshot.mjs` | Puppeteer screenshot tool | Saves to `./temporary screenshots/`, auto-increments filenames |
| `package.json` + `node_modules/` | Dependencies | Created automatically by `npm install puppeteer` |

---

## Design System â€” "Mint Vault"

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `brand-500` | `#0FD4A4` | Primary teal-green â€” CTAs, active states, sparklines |
| `brand-400` | `#1AFFB6` | Active nav text, icon accents |
| `surface-base` | `#0A0F14` | Page background (deepest dark) |
| `surface-raised` | `#111920` | Cards, sidebar, top bar |
| `surface-elevated` | `#1A2530` | Hover states, merchant icons |
| `surface-floating` | `#243240` | Dropdowns, modals (unused so far) |
| `surface-border` | `#2A3A4A` | Card borders, dividers |
| `surface-border-light` | `#3A4E62` | Hover/focus borders |
| `text-primary` | `#F0F4F8` | Headings, values |
| `text-secondary` | `#A0B4C8` | Labels, descriptions |
| `text-tertiary` | `#6B8299` | Placeholders, timestamps |
| `semantic-success` | `#10E4A0` | Income, positive trends |
| `semantic-warning` | `#F5B731` | Near-limit budgets, pending status |
| `semantic-danger` | `#F45B69` | Expenses, over-budget, negative trends |
| `semantic-info` | `#5BB8F4` | Transport category, informational |
| Violet (inline) | `#A78BFA` | Entertainment category |

### Typography

- **Headings:** Inter Medium (Google Fonts) via `font-body font-medium`
- **Body:** Inter (Google Fonts) â€” sans-serif, line-height `1.7`
- Custom font sizes defined in Tailwind config: `display-xl` through `caption`, plus `mono-data` for financial values

### Depth System (Brand-Tinted Shadows)

| Tier | Token | Usage |
|------|-------|-------|
| Resting | `shadow-depth-1` | Cards at rest, sidebar |
| Elevated | `shadow-depth-2` | Hovered cards |
| Floating | `shadow-depth-3` | Modals, dropdowns |
| Glow | `shadow-glow` | Primary CTA button |

All shadows include a subtle `rgba(15,212,164,...)` teal tint for brand coherence.

### Background Treatment

- 3 layered radial gradients: teal glow (top-left), blue glow (bottom-right), faint violet (center)
- SVG noise grain overlay at 3% opacity via `feTurbulence` filter + `mix-blend-mode: overlay`

### Animations

- Only `transform` and `opacity` â€” never `transition-all`
- Spring easing: `cubic-bezier(0.34, 1.56, 0.64, 1)`
- Expo ease-out: `cubic-bezier(0.16, 1, 0.3, 1)` (sidebar slide)
- Duration: 150ms (fast interactions)

---

## Layout Structure

```
+--------------------------------------------------+
|  Top Bar (sticky, glassmorphism backdrop-blur)    |
+--------+-----------------------------------------+
| Side   |  Main Content (scrollable)              |
| bar    |                                         |
| (w-64  |  [4 Overview Cards â€” grid]              |
|  fixed |  [Binary Tree 2/3 | Transactions 1/3]  |
|  left) |  [Budget Bars 2/3 | Actions+Compare 1/3]|
+--------+-----------------------------------------+
```

### Responsive Breakpoints

| Breakpoint | Behavior |
|-----------|----------|
| Mobile (default) | Single column, sidebar hidden (hamburger toggle), search hidden |
| `sm` (640px) | 2-col overview cards, search visible, quick actions 3-col |
| `lg` (1024px) | Sidebar visible, main offset `ml-64`, 2/3+1/3 content grids |
| `xl` (1280px) | 4-col overview cards |

---

## Dashboard Components

### 1. Sidebar
- Fixed left, w-64, `bg-surface-raised`
- Logo: "L&D Premiere" with shield SVG icon in `brand-500`
- 8 nav items: Dashboard (active), My Store, Enroll Member, Preferred Customers, Purchases, Commissions, E-Wallet, Library
- Active state: `bg-brand-500/10 text-brand-400 border border-brand-500/20`
- Bottom: Settings link
- Mobile: slides from left with dark overlay, toggled by hamburger button

### 2. Top Bar
- Sticky, glassmorphism: `bg-surface-raised/80 backdrop-blur-xl`
- Hamburger (mobile), "Dashboard" title (sm+), search input (sm+), notification bell with red dot, profile avatar + name

### 3. Overview Cards (4x)
- **Total Balance:** $48,295.80, +4.3% (success)
- **Personal Volume:** 500 PV, +2.1% (success)
- **Cycles:** 14, +2 (numeric cycle count; non-currency MLM metric)
- **Account Status:** Active (success)
- Each card: category icon, trend badge (colored pill), primary metric value, SVG sparkline with gradient fill
- Hover: `-translate-y-0.5`, `shadow-depth-2`, border lightens

### 4. Binary Tree Canvas (PixiJS + DOM Hybrid)
- Replaces prior spending chart area with MLM-focused binary network renderer
- PixiJS (WebGL/canvas) renders nodes and connecting links; DOM renders toolbar and detail UI
- Core controls: zoom in, zoom out, fit, reset, fullscreen
- Fullscreen mode uses in-app overlay with close button + `Esc` key exit
- Cycle rule legend: Left 100 PV / Right 200 PV (default configurable thresholds)
- Selected-node panel shows compact KPIs: status, cycles, left PV, right PV, cycle eligibility
- Advanced search supports: Name/member ID query, minimum cycle filter, Active/Inactive status filter, and sorting by Latest Added or Oldest Added
- Search result list supports quick-select focus to center matching nodes on the canvas

### 5. Recent Transactions List
- 7 transactions in scrollable list (max-height 520px)
- Each row: merchant initials (colored), name, timestamp, category tag (colored pill), amount (red for expense / green for income), status
- Data: Starbucks (-$5.40), Salary (+$4,200), Netflix (-$15.99), Uber (-$24.50), Amazon (-$67.30), Freelance (+$850 pending), Electric Bill (-$142)

### 6. Budget Progress Bars (5 categories)
- **Food & Dining:** $420/$600 (70%) â€” brand green bar
- **Transport:** $255/$300 (85%) â€” warning yellow bar, "almost at limit"
- **Entertainment:** $220/$200 (110%) â€” danger red bar, "$20 over budget"
- **Bills & Utilities:** $360/$600 (60%) â€” warning yellow bar
- **Shopping:** $135/$300 (45%) â€” info blue bar

### 7. Quick Actions Panel
- Primary: "Transfer Money" â€” `bg-brand-500`, `shadow-glow`
- Secondary: "Pay Bills", "Add Expense" â€” `bg-surface-elevated`, border

### 8. Monthly Comparison Widget
- Feb vs Jan 2026
- Income: $8,420 vs $8,100 (+$320, +4.0%)
- Expenses: $5,136 vs $4,726 (+$410, +8.7%)
- Savings: $3,284 vs $3,374 (-$90, -2.7%)
- Paired progress bars: current month full opacity, last month 40% opacity

---

## Interactive States (All Clickables)

| State | Effect |
|-------|--------|
| `hover` | Background shift + `-translate-y-0.5` lift (cards) or bg change (nav/rows) |
| `focus-visible` | `ring-2 ring-brand-500/50 outline-none` |
| `active` | `scale-[0.97]` (buttons/nav) or `scale-[0.99]` (rows) |
| Transition | `transition-transform duration-150 ease-spring` |

---

## Extra Polish

- Custom dark scrollbar: 6px width, `#2A3A4A` thumb, transparent track
- Scrollbar hover: `#3A4E62`
- Cross-browser: `-webkit-scrollbar` + `scrollbar-width: thin`

---

## QA Rounds

| Round | Screenshot | Notes |
|-------|-----------|-------|
| 1 | `screenshot-1-round1.png` | Initial build â€” all components rendering, layout correct |
| 2 | `screenshot-2-round2.png` | Added custom scrollbar styling, confirmed visual consistency |
| 3 | `screenshot-3-Codex screenshot.png` (`Codex screenshot.png`) | Codex screenshot pass captured from `http://localhost:3000`; visual output matches prior dashboard state |
| 4 | `screenshot-4-binary-tree-round1.png` | Initial Binary Tree module integration pass (Pixi canvas, controls, selected-node panel) |
| 5 | `screenshot-5-binary-tree-round2.png` | Post-fix validation pass after `.mjs` MIME update and fullscreen/control verification |
| 6 | `screenshot-12-layout-v3-round1.png` | Layout restructure: bento Budget Progress cards, proper Row 3 grid with Quick Actions + Month vs Month in 1/3 column |

---

## Post-v1 Updates

### 2026-02-20 - Header font adjustment (Codex)

- **What changed:** Updated key dashboard headers to use Inter medium instead of DM Serif Display.
- **Files affected:** `index.html`, `Claude_Notes/vault-dashboard.md`
- **Design decision:** Applied `font-body font-medium` while preserving existing size and spacing classes for visual continuity.
- **Known limitations:** Superseded by the global header font update below.

### 2026-02-20 - Global header font rule update (Codex)

- **What changed:** Extended the Inter-medium header rule across all remaining section headers (`Recent Transactions`, `Budget Progress`, `Month vs Month`) for full consistency.
- **Files affected:** `index.html`, `Claude_Notes/vault-dashboard.md`
- **Design decision:** Standardized all visible heading labels to `font-body font-medium` while keeping existing size and spacing scales.
- **Known limitations:** `font-display` is still defined in Tailwind config for potential future use but is no longer used by active header elements.

### 2026-02-20 - KPI card relabel for MLM direction (Codex)

- **What changed:** Updated the first KPI row labels to align with the next product direction: `Monthly Income` -> `Personal Volume`, `Monthly Expenses` -> `Cycles`, `Savings Rate` -> `Account Status`.
- **Files affected:** `index.html`, `Claude_Notes/vault-dashboard.md`
- **Design decision:** Preserved existing card structure/spacing and only changed naming semantics; `Account Status` value now displays `Active` with success color.
- **Known limitations:** Underlying figures and chart/transaction data are still finance-demo placeholders and not yet MLM-specific logic.

### 2026-02-20 - Cycles card metric semantics + icon update (Codex)

- **What changed:** Converted the `Cycles` card value from currency to numeric cycles (`14`) with numeric delta (`+2`), and replaced the icon with a circular arrows cycle symbol.
- **Files affected:** `index.html`, `Claude_Notes/vault-dashboard.md`
- **Design decision:** Shifted `Cycles` visual accent from danger red to info blue to indicate operational metric status rather than expense.
- **Known limitations:** Cycle logic is still static placeholder data; no live binary-leg PV calculation is implemented yet.

### 2026-02-20 - Personal Volume metric formatting update (Codex)

- **What changed:** Converted `Personal Volume` display from currency to points format (`500 PV`).
- **Files affected:** `index.html`, `Claude_Notes/vault-dashboard.md`
- **Design decision:** Kept existing card layout and trend badge styling while removing monetary notation from the core value.
- **Known limitations:** Trend badge for this card is still percentage-based placeholder (`+2.1%`) and not yet PV-delta based.

### 2026-02-20 - Binary Tree module migration (Codex)

- **What changed:** Replaced the former `Monthly Spending` chart panel with a `Binary Tree` panel using a hybrid rendering split: PixiJS (WebGL/canvas) for links/nodes and DOM for controls, legend, and selected-node details.
- **Files affected:** `index.html`, `binary-tree.mjs`, `Claude_Notes/vault-dashboard.md`
- **Design decision:** Implemented core controls (`zoom in`, `zoom out`, `fit`, `reset`, `fullscreen`) and in-app fullscreen overlay while keeping existing dashboard layout untouched.
- **Tech details:** Added exported module interfaces `initBinaryTree(options)` and `createMockBinaryTreeData()`, plus configurable cycle rule support (default `Left 100 PV / Right 200 PV`).
- **Known limitations:** Tree data is still mock JSON in phase 1; no backend/API integration or persisted user interactions yet.

### 2026-02-20 - Fullscreen canvas UX refinement (Codex)

- **What changed:** Updated fullscreen behavior so the binary tree canvas fills the entire overlay, and moved the header, controls, cycle rule, and selected-node details into in-canvas overlays.
- **Files affected:** `index.html`, `Claude_Notes/vault-dashboard.md`
- **Design decision:** Removed external fullscreen close row from overlay; users now exit fullscreen via the in-canvas fullscreen toggle or `Esc`.
- **Known limitations:** Overlay positions are currently static breakpoints; additional adaptive placement may be needed for very small landscape devices.

### 2026-02-20 - Binary tree advanced search (Codex)

- **What changed:** Added advanced search controls to the binary tree module with filters for Name/member ID, minimum Cycle value, Active/Inactive status, and sort modes for Latest Added / Oldest Added.
- **Files affected:** `index.html`, `binary-tree.mjs`, `Claude_Notes/vault-dashboard.md`
- **Design decision:** Implemented search as DOM controls + result list with click-to-focus behavior, while dimming non-matching nodes in the WebGL canvas to preserve context.
- **Tech details:** Added `name` and `addedAt` node metadata handling in normalization/mock data paths to support text search and chronological sorting.
- **Known limitations:** `addedAt` values are mock/fallback timestamps in phase 1 and should be replaced by real backend timestamps once API integration is available.

### 2026-02-20 — Layout restructure: bento Budget Progress + Row 3 grid (Claude)

- **What changed:** Restructured the dashboard grid into a proper 3-row bento layout. Fixed an HTML nesting bug where Quick Actions and Month vs Month were accidentally orphaned as direct grid children instead of being contained in their intended column. Budget Progress was converted from a single full-width card with stacked bars into individual bento-style cards in a 2-column sub-grid.
- **Files affected:** `index.html`, `Claude_Notes/vault-dashboard.md`
- **Layout now:**
  - Row 1: 4 KPI cards (unchanged)
  - Row 2: Binary Tree (2/3) | Quick Actions + Month vs Month (1/3, `flex flex-col gap-6`)
  - Row 3: Budget Progress bento cards (2/3, `sm:grid-cols-2` sub-grid) | Recent Transactions (1/3, `h-full` to match budget height)
- **Design decisions:**
  - Budget categories are now individual cards with hover lift, depth shadows, prominent `text-mono-data` dollar amounts, and progress bars
  - Shopping card spans full width (`sm:col-span-2`) at the bottom of the budget grid for visual balance
  - Entertainment card has a danger-tinted border (`border-semantic-danger/20`) to visually flag over-budget state
  - Transactions card uses `h-full` to stretch and match the Binary Tree height in its grid row
- **Known limitations:** The 5th budget card (Shopping) spans full width which works for an odd count; if more categories are added, the grid should rebalance.

### 2026-02-21 - Sidebar navigation relabel + icon alignment (Codex)

- **What changed:** Updated sidebar IA to MLM-oriented labels and refreshed nav icons so each icon matches its label intent (`My Store`, `Enroll Member`, `Preferred Customers`, `Purchases`, `Commissions`, `E-Wallet`, `Library`), while keeping `Dashboard` active and `Settings` in the bottom section.
- **Files affected:** `index.html`, `Claude_Notes/vault-dashboard.md`
- **Design decision:** Kept a consistent outline icon style/weight (`stroke-width="1.5"`) and existing spacing/state behaviors to preserve visual continuity.
- **Known limitations:** Icons are static SVGs with placeholder links (`href="#"`); no route-specific active states are wired yet.

### 2026-02-21 - My Store bento draft + sidebar page switching (Codex)

- **What changed:** Added the first dedicated sidebar page draft (`My Store`) as its own bento-style layout section and wired sidebar navigation switching between `Dashboard` and `My Store`.
- **Files affected:** `index.html`, `Claude_Notes/vault-dashboard.md`
- **Design decision:** Kept this as in-page view switching (`data-page-view`) to avoid introducing routing while preserving existing dashboard modules and visual system.
- **Tech details:** Added nav metadata hooks (`data-nav-link`, `data-page`), page sections (`page-dashboard`, `page-my-store`), top-bar title/search placeholder updates per active page, and active-nav class toggling.
- **Known limitations:** Only `Dashboard` and `My Store` are wired to switch views right now; remaining sidebar items are still placeholder links.

### 2026-02-21 - My Store binding-flow refactor (Codex)

- **What changed:** Refocused `My Store` from product/catalog framing to a binding-attribution workflow using store code + store link concepts.
- **Files affected:** `index.html`, `Claude_Notes/vault-dashboard.md`
- **Design decision:** Preserved the existing bento density for glanceability, but changed content blocks to owner attribution metrics, pipeline steps, store identity panel, invoice mapping cards, settlement snapshot, and rule notes.
- **Tech details:** Updated My Store top KPIs (`Store Code`, `Store Link Visits`, `Attributed Invoices`, `Owner Credit`), changed search placeholder to `Search store code, link, or invoice...`, and rewrote side cards to clarify that revenue/BP credits apply to code owner (not buyer).
- **Known limitations:** Attribution, invoice feed, and BP credits remain mock UI data in this phase; no backend binding logic is connected yet.

### 2026-02-21 - My Store product grid + buy flow (Codex)

- **What changed:** Added an actual storefront product grid with purchasable items in `My Store`, including `Add to Cart`, `Buy Now`, and `Checkout` actions.
- **Files affected:** `index.html`, `Claude_Notes/vault-dashboard.md`
- **Design decision:** Kept attribution-first context while introducing a practical purchase flow, so users can buy products and immediately see invoice/credit effects.
- **Tech details:** Implemented in-page store state (products, cart lines, invoices), cart quantity controls, checkout invoice creation, dynamic invoice feed rendering, auto-updating owner credit/BP KPIs, and settlement totals. Added copy-to-clipboard behavior for the store link.
- **Known limitations:** Purchase, invoice IDs, and settlement statuses are front-end mock logic only; no payment gateway or backend persistence is connected yet.

### 2026-02-21 - My Store UX categorization (Codex)

- **What changed:** Split `My Store` into three focused workspace tabs for usability: `Store Front`, `Analytics`, and `Store Setup`.
- **Files affected:** `index.html`, `Claude_Notes/vault-dashboard.md`
- **Design decision:** Kept all content in one page view (`my-store`) but separated responsibilities by tab to reduce cognitive load while preserving existing data wiring.
- **Tech details:** Added tab controls (`data-store-tab`) and view containers (`data-store-view`), tab-state JS (`setStoreTab`), and context-aware search placeholders per tab. Moved permanent store ID/link controls into `Store Setup` and kept purchase flow isolated in `Store Front`.
- **Known limitations:** Tabs are in-page state only (no URL/state persistence for selected tab on refresh).

### 2026-02-21 - Brand rename + logo refresh + header control order (Codex)

- **What changed:** Rebranded visible app title text from `L&D Premiere` to `Charge` on Login and Dashboard, replaced the prior shield-only mark with a shield + lightning bolt ("charge") icon in both locations, and swapped the top-bar right action order so profile appears before `Log Out`.
- **Files affected:** `login.html`, `index.html`, `Claude_Notes/vault-dashboard.md`
- **Design decision:** Kept existing spacing, sizing, and color tokens unchanged to preserve layout rhythm while updating brand identity and improving header action grouping (account context before session action).
- **Tech details:** Updated two inline SVG logo instances to matching stroke-based icons (`viewBox="0 0 32 32"`), retained existing `logout-button` id/class hooks to avoid JS regression, and only changed DOM order for the profile/logout controls.
- **Known limitations:** Browser tab title and legacy `Vault` wording in documentation/theme labels are still present where not explicitly requested for rename.

### 2026-02-21 - My Store upline attribution enforcement (Codex)

- **What changed:** Updated My Store checkout behavior so self-purchase cannot use the buyer's own store code for discount/attribution; checkout now requires a valid upline code, and invoices are recorded against that upline code.
- **Files affected:** `index.html`, `Claude_Notes/vault-dashboard.md`
- **Design decision:** Added an explicit Store Front control for `Checkout Upline Store Code` with immediate validation feedback, while keeping existing page structure and KPI wiring intact.
- **Tech details:** Added upline-code state management (`storeAppliedUplineCode`), self-code blocking validation against `store-code-value`, cart discount computation (`uplineDiscountRate`), disabled checkout when no valid upline code is applied, and invoice feed rendering that labels `Upline Code`. Updated related My Store copy in Analytics/Setup to reflect binary/upline attribution semantics.
- **Validation performed:** Headless browser flow confirmed: self code input shows blocked state, valid upline code re-enables checkout with cart items, and newly created invoice stores/displayed upline code.
- **Known limitations:** Upline code validation is currently format/self-check based only (no backend lineage verification), and discount rate is static in UI logic (`10%`) for this mock phase.

### 2026-02-21 - My Store hidden sponsor routing (Codex)

- **What changed:** Removed all member-facing store/upline code selection and visibility from My Store. Attribution is now fully hidden and auto-applied from registration mapping during checkout.
- **Files affected:** `index.html`, `Claude_Notes/vault-dashboard.md`
- **Design decision:** Preserved the existing My Store tab structure while replacing editable/visible code controls with locked-attribution messaging so members only see high-level sponsor behavior, not routing identifiers.
- **Tech details:** Deleted upline code input/chips/copy-link controls and related JS handlers, introduced registration-based internal routing resolution (`registrationAttributionByUser` + session override support), and kept invoice/cart logic using hidden mapping values while rendering only `Sponsor Line Applied` in UI.
- **Validation performed:** Headless browser check confirmed no visible `UPL-*` strings, no code input rendered, checkout still succeeds after adding products, and new invoice rows render with hidden-routing wording.
- **Known limitations:** Registration mapping is still mock client-side data in this phase; production should source this from backend membership records and secure APIs.

### 2026-02-21 - Store Setup public share identity restored (Codex)

- **What changed:** Restored member-facing `Store Code` and `Store Link` in `Store Setup` for sharing with anonymous/guest buyers, while keeping cart/checkout attribution routing hidden for logged-in members.
- **Files affected:** `index.html`, `Claude_Notes/vault-dashboard.md`
- **Design decision:** Separated public share identity (safe to expose/copy) from internal sponsor routing (hidden), so member UX supports guest sharing without exposing attribution internals.
- **Tech details:** Added setup UI fields (`store-code-value`, `store-link-value`) with dedicated copy actions/feedback, introduced public identity resolver (`publicStoreCodeByUser` + session override support), and retained cart copy/content with no visible routing code.
- **Validation performed:** Confirmed cart has no public/internal code text, setup renders copyable values, and both copy buttons show success feedback in runtime test.
- **Known limitations:** Public store code defaults are still mock values in client-side mapping and should be populated from backend member profile data.

### 2026-02-21 - Cart attribution panel removed (Codex)

- **What changed:** Removed the `Attribution Mode` informational panel from the My Store cart area.
- **Files affected:** `index.html`, `Claude_Notes/vault-dashboard.md`
- **Design decision:** Kept checkout UI focused on cart totals/actions only, since attribution details are not needed in member cart context.
- **Tech details:** Deleted the static cart-side attribution block and left all cart calculation/checkout logic unchanged.
- **Known limitations:** Attribution explanations still exist in Analytics/Setup sections where process context is intentionally documented.

### 2026-02-21 - Storefront badge removal (Codex)

- **What changed:** Removed the `Sponsor Line Locked` badge from the Store Front header.
- **Files affected:** `index.html`, `Claude_Notes/vault-dashboard.md`
- **Design decision:** Reduced non-essential status messaging in the product area so the header stays cleaner and more focused on shopping actions.
- **Tech details:** Deleted only the header badge element; no behavior, totals, or attribution logic was changed.

### 2026-02-21 - Page/tab refresh persistence (Codex)

- **What changed:** Updated dashboard navigation state so browser refresh restores the last active page (`Dashboard` or `My Store`) and the last selected `My Store` tab.
- **Files affected:** `index.html`, `Claude_Notes/vault-dashboard.md`
- **Design decision:** Implemented lightweight client-side persistence with graceful fallback to defaults (`dashboard`, `storefront`) when no saved state exists or storage is unavailable.
- **Tech details:** Added `charge-dashboard-view-state` localStorage handling (`readViewState`, `persistViewState`), persisted state updates from both `setPage` and `setStoreTab`, switched startup from hardcoded `setPage('dashboard')` to `setPage(activePage)`, and prevented initialization from overwriting saved tab state.
- **Validation performed:** Headless Puppeteer test confirmed navigation to `My Store` + `Analytics`, page reload, and successful state restoration (`my-store` visible, `analytics` active, persisted JSON present in localStorage).
- **Known limitations:** State persistence is browser-local only; it does not sync across devices or profiles.

### 2026-02-21 - Binary Tree sidebar page extraction (Codex)

- **What changed:** Added a dedicated `Binary Tree` item directly below `My Store` in the sidebar and moved the full Binary Tree component out of `Dashboard` into its own page view.
- **Files affected:** `index.html`, `Claude_Notes/vault-dashboard.md`
- **Design decision:** Kept the Binary Tree module markup and element IDs unchanged to preserve existing `binary-tree.mjs` bindings while only changing page placement and navigation.
- **Tech details:** Added new nav metadata (`data-nav-link`, `data-page="binary-tree"`), introduced `page-binary-tree` (`data-page-view="binary-tree"`), extended `pageMeta` with `Binary Tree` title/search placeholder, and removed the tree panel from dashboard row 2 so dashboard now focuses on its remaining modules.
- **Known limitations:** Navigation remains in-page state switching (no URL routes/deep links for `binary-tree` yet).

### 2026-02-21 - Binary Tree layout redesign + fullscreen tool dock (Codex)

- **What changed:** Removed the `Cycle Rule` and `Selected Node` information panels from the Binary Tree page and redesigned the module into a tool-dock + large-canvas layout.
- **Files affected:** `index.html`, `Claude_Notes/vault-dashboard.md`
- **Design decision:** Prioritized render space and interaction density by keeping search/controls together in a single top dock and dedicating most of the card height to the tree canvas.
- **Tech details:** Added a new `tree-tools-dock` container, increased canvas heights (`30rem` -> `46rem` responsive), and updated fullscreen CSS so header + all tools remain available in overlay mode (scrollable tool dock with preserved zoom/search/reset controls).
- **Validation performed:** Headless browser screenshots captured in normal and fullscreen states (`temporary screenshots/screenshot-binary-tree-layout-pass1.png`, `temporary screenshots/screenshot-binary-tree-layout-pass2-fullscreen.png`) confirming the larger render area and visible tools in fullscreen.
- **Known limitations:** Cycle thresholds still influence internal eligibility styling/search labeling in `binary-tree.mjs`; only the Cycle Rule/Selected Node UI panels were removed per request.

### 2026-02-21 - Fullscreen search dock compact mode (Codex)

- **What changed:** Reduced fullscreen UI footprint by collapsing `Advanced Search` by default and exposing it behind a `Show Search` toggle in the control row.
- **Files affected:** `index.html`, `binary-tree.mjs`, `Claude_Notes/vault-dashboard.md`
- **Design decision:** Kept all fullscreen tools available while prioritizing canvas visibility; search is now an on-demand panel instead of persistent overlay content.
- **Tech details:** Added `tree-search-toggle` / `tree-search-toggle-label`, fullscreen CSS states (`tree-search-open`), and controller state handling in `binary-tree.mjs` so entering/exiting fullscreen always resets to compact mode.
- **Validation performed:** Headless screenshots confirm compact fullscreen and expanded search states: `temporary screenshots/screenshot-binary-tree-fullscreen-compact-v2.png`, `temporary screenshots/screenshot-binary-tree-fullscreen-search-open-v2.png`.
- **Known limitations:** Expanded search still occupies significant vertical space by design; if needed, next iteration can split filters/results into separate collapsible sections.

### 2026-02-21 - Search tool fullscreen-only availability (Codex)

- **What changed:** Made `Advanced Search` unavailable in normal Binary Tree view and available only in fullscreen via the `Show Search` toggle.
- **Files affected:** `index.html`, `Claude_Notes/vault-dashboard.md`
- **Design decision:** Kept the default page focused on visualization/controls while gating high-density filtering UI to fullscreen context only.
- **Tech details:** `#tree-search-panel` is now hidden by default and only displayed under `.tree-fullscreen-mode.tree-search-open`; existing toggle behavior in `binary-tree.mjs` is reused.
- **Validation performed:** Captured normal view without search (`temporary screenshots/screenshot-binary-tree-normal-no-search.png`), fullscreen compact (`temporary screenshots/screenshot-binary-tree-fullscreen-search-hidden.png`), and fullscreen expanded (`temporary screenshots/screenshot-binary-tree-fullscreen-search-visible.png`).

### 2026-02-21 - Fullscreen search grid reduced to 2 columns on large screens (Codex)

- **What changed:** Updated fullscreen `Advanced Search` form layout so large screens use two columns (2x2 for four filters) instead of stretching all four fields across a single row.
- **Files affected:** `index.html`, `Claude_Notes/vault-dashboard.md`
- **Design decision:** Kept mobile/tablet behavior unchanged while improving readability and visual balance on wide desktops.
- **Tech details:** Removed `xl:grid-cols-4` from the search filter grid and retained `grid-cols-1 sm:grid-cols-2`.
- **Validation performed:** Captured fullscreen expanded screenshot with new 2-column layout: `temporary screenshots/screenshot-binary-tree-fullscreen-search-2col.png`.

### 2026-02-21 - Fullscreen search panel width constrained on desktop (Codex)

- **What changed:** Constrained fullscreen `Advanced Search` panel width on large screens so it no longer stretches across the full viewport.
- **Files affected:** `index.html`, `Claude_Notes/vault-dashboard.md`
- **Design decision:** Keep controls dock full width for utility access, but cap search panel readability and visual weight on desktop.
- **Tech details:** Added `xl:max-w-[52rem]` to `#tree-search-panel` while preserving the existing 2-column field grid and mobile behavior.
- **Validation performed:** Captured fullscreen expanded desktop state with constrained search width: `temporary screenshots/screenshot-binary-tree-fullscreen-search-2col-narrow.png`.

### 2026-02-21 - Fullscreen tools container width constraint correction (Codex)

- **What changed:** Moved the desktop width constraint from the inner search panel to the full fullscreen tools container so controls + search block are constrained together.
- **Files affected:** `index.html`, `Claude_Notes/vault-dashboard.md`
- **Design decision:** Constraining the parent dock preserves visual hierarchy and avoids an awkward full-width control bar over a narrow search panel.
- **Tech details:** Added an `@media (min-width: 1280px)` rule on `#binary-tree-panel.tree-fullscreen-mode #tree-tools-dock` with `width: min(58rem, calc(100% - 32px)); right: auto;` and removed the previous `xl:max-w` constraint from `#tree-search-panel`.
- **Validation performed:** Captured corrected fullscreen expanded state: `temporary screenshots/screenshot-binary-tree-fullscreen-toolsdock-constrained.png`.

### 2026-02-21 - Fullscreen search rows expanded (Codex)

- **What changed:** Increased visible result rows in fullscreen Advanced Search so more member entries are shown at once.
- **Files affected:** `index.html`, `binary-tree.mjs`, `Claude_Notes/vault-dashboard.md`
- **Design decision:** Keep compact fullscreen mode unchanged, but when search is opened allocate significantly more vertical room for results.
- **Tech details:** Raised fullscreen result container height (`#tree-search-results`), increased render cap from `20` to `40` entries in `renderSearchResults()`, and expanded `#tree-tools-dock` max-height specifically for `.tree-search-open`.
- **Validation performed:** Captured fullscreen expanded view with multiple visible rows: `temporary screenshots/screenshot-binary-tree-more-rows-v2.png`.

### 2026-02-21 - Fullscreen dock height increased again (Codex)

- **What changed:** Increased fullscreen-open tools dock height further on desktop and reduced dock-level scrolling pressure so more search result rows are visible at once.
- **Files affected:** `index.html`, `Claude_Notes/vault-dashboard.md`
- **Design decision:** Keep mobile behavior unchanged while giving desktop fullscreen more vertical real estate for filter/results content.
- **Tech details:** Added desktop-only (`min-width: 1024px`) overrides for `.tree-search-open` to raise dock max-height (`min(90vh, 760px)`), set dock overflow to visible in that state, and increase results panel height (`min(58vh, 560px)`).
- **Validation performed:** Captured updated fullscreen expanded state with additional visible rows: `temporary screenshots/screenshot-binary-tree-more-rows-v3.png`.

### 2026-02-21 - Fullscreen dock overflow containment cleanup (Codex)

- **What changed:** Cleaned up fullscreen search layout so content stays contained inside the dock instead of spilling past its visual container.
- **Files affected:** `index.html`, `Claude_Notes/vault-dashboard.md`
- **Design decision:** Keep a tight, efficient dock by using contained panel sizing and internal results scrolling only where needed.
- **Tech details:** Removed desktop `overflow-y: visible` from fullscreen-open dock, set dock to hidden overflow in that state, converted search panel to flex column with `min-height: 0`, and added `tree-search-results-shell` for stable internal sizing.
- **Validation performed:** Captured corrected fullscreen expanded layout with contained dock and clean edges: `temporary screenshots/screenshot-binary-tree-clean-tight-v1.png`.

### 2026-02-21 - Fullscreen dock + results scroll reliability fix (Codex)

- **What changed:** Fixed both containers in fullscreen advanced search: the outer tools dock now stays bounded/contained, and the inner results list scrolls reliably again.
- **Files affected:** `index.html`, `Claude_Notes/vault-dashboard.md`
- **Design decision:** Keep the parent dock visually stable (`overflow hidden`) and move scrolling responsibility to the results list (`overflow auto`) for tighter, predictable behavior.
- **Tech details:** Tuned `.tree-search-open #tree-tools-dock` max-height rules, enabled flex layout for dock/search panel in desktop fullscreen, and constrained `tree-search-results-shell` + `tree-search-results` with `min-height: 0`/`flex: 1`.
- **Validation performed:** Runtime metrics confirmed correct behavior (`dockClientHeight=718`, `dockScrollHeight=718`, `resultsClientHeight=389`, `resultsScrollHeight=3178`, `resultsCanScroll=true`) and screenshot captured: `temporary screenshots/screenshot-binary-tree-clean-tight-v2.png`.

### 2026-02-21 - Fullscreen-only selected node detail panel (Codex)

- **What changed:** Added selected-node details back to the Binary Tree module, but only as a fullscreen overlay component.
- **Files affected:** `index.html`, `Claude_Notes/vault-dashboard.md`
- **Design decision:** Keep normal page mode focused on canvas + controls, and reveal node inspection data only in fullscreen to avoid clutter.
- **Tech details:** Added a new `#tree-selected-panel` container with existing detail IDs (`tree-selected-member`, `tree-selected-status`, `tree-selected-left`, `tree-selected-right`, `tree-selected-cycles`, `tree-selected-eligible`) so current `binary-tree.mjs` click-selection logic updates it without JS changes. Added CSS rules to hide the panel by default and show/position it only under `.tree-fullscreen-mode` (desktop and mobile breakpoints).
- **Known limitations:** Selected-node state still updates internally even outside fullscreen; the detail UI is simply hidden until fullscreen is active.

### 2026-02-21 - Binary Tree BV propagation logic correction (Codex)

- **What changed:** Corrected Binary Tree leg-volume semantics so displayed left/right values are Business Volume (BV) propagated from child subtrees instead of directly using per-node mock leg values.
- **Files affected:** `binary-tree.mjs`, `index.html`, `Claude_Notes/vault-dashboard.md`
- **Design decision:** Keep existing config key names (`leftPvThreshold`, `rightPvThreshold`) for backward compatibility, but treat all rendered leg metrics as BV in UI copy.
- **Tech details:** Added personal-volume normalization fields (`leftPersonalPv`, `rightPersonalPv`) and a `deriveBusinessVolumes(...)` pass during data normalization. This pass recomputes each node’s displayed leg values as:
  - left BV = total personal volume of the left child subtree
  - right BV = total personal volume of the right child subtree
  - cycles = floor(min(left BV / left threshold, right BV / right threshold))
  Leaf nodes now always show `0 BV` on both legs, and uplines only gain BV when child subtree volume exists.
- **UI updates:** Updated Binary Tree copy from `PV` to `BV` in canvas node cards, search results entries, cycle-rule text, and selected-node detail panel labels/values.
- **Known limitations:** The internal option/property names still include `Pv` for compatibility (`leftPv`, `rightPv`, threshold keys), though displayed semantics are now BV.

### 2026-02-21 - Binary Tree 500-node stress-test dataset mode (Codex)

- **What changed:** Enabled stress-test loading for the Binary Tree page with a 500-node mock dataset.
- **Files affected:** `binary-tree.mjs`, `index.html`, `Claude_Notes/vault-dashboard.md`
- **Design decision:** Keep default behavior backward-compatible while allowing explicit dataset size control for performance testing.
- **Tech details:** `createMockBinaryTreeData()` now accepts options: `targetNodes` (exact node count) and optional `maxDepth` fallback. Node creation now uses breadth-first ordinal indexing so non-perfect trees (e.g., 500 nodes) still produce valid child links without missing references.
- **Runtime validation:** Verified via Node import run: `nodes=500`, `rootChildren=true,true`, `leafCount=250`, `brokenLinks=0`.
- **Current page config:** Binary Tree initialization now calls `createMockBinaryTreeData({ targetNodes: 500 })` in `index.html`.

### 2026-02-21 - Binary Tree organization summary component (Codex)

- **What changed:** Added a new Binary Tree detail component to show organization-wide totals: total people in the organization and total BV produced.
- **Files affected:** `index.html`, `binary-tree.mjs`, `Claude_Notes/vault-dashboard.md`
- **Design decision:** Co-located the new totals directly under the existing `Selected Node` panel so per-node inspection and org-wide context are visible together in fullscreen detail mode.
- **Tech details:** Added DOM targets `tree-org-total-people` and `tree-org-total-bv`, extended tree config bindings, and introduced `updateOrganizationSummary()` in `binary-tree.mjs`.
- **Metric definitions:**  
  - `Total People` = total node count in the current tree dataset  
  - `Total BV Produced` = sum of every node’s personal BV contribution (`leftPersonalPv + rightPersonalPv`) across the whole organization
- **Runtime validation:** Module import passed and new IDs/functions are wired (`binary-tree.mjs import ok`).

### 2026-02-21 - Detail cards split: Selected Node vs Organization Summary (Codex)

- **What changed:** Separated `Organization Summary` from `Selected Node` into two distinct fullscreen detail cards.
- **Files affected:** `index.html`, `Claude_Notes/vault-dashboard.md`
- **Design decision:** Keep node-specific inspection and org-wide totals as independent surfaces so both can be scanned quickly without nesting.
- **Tech details:** Added a wrapper `#tree-detail-panels` that controls fullscreen positioning and responsive layout for both cards. On wider screens cards render side-by-side; on smaller screens they stack vertically. Existing data IDs (`tree-selected-*`, `tree-org-*`) were preserved, so `binary-tree.mjs` logic remains unchanged.
- **Known limitations:** Both cards still follow fullscreen-only visibility because they are hosted inside the same fullscreen detail layer.

### 2026-02-21 - Binary Tree stress target increased to 1000 nodes (Codex)

- **What changed:** Increased active Binary Tree stress-test load from `500` to `1000` nodes.
- **Files affected:** `index.html`, `Claude_Notes/vault-dashboard.md`
- **Tech details:** Updated page initialization call to `createMockBinaryTreeData({ targetNodes: 1000 })`.
- **Known limitations:** At this scale, rendering and interaction responsiveness depend on device/browser GPU/CPU capacity.

### 2026-02-21 - Mobile fullscreen usability controls + search overlap fix (Codex)

- **What changed:** Improved Binary Tree fullscreen behavior on mobile by adding explicit show/hide toggles for overlay components and fixing Advanced Search overlap with header controls.
- **Files affected:** `index.html`, `binary-tree.mjs`, `Claude_Notes/vault-dashboard.md`
- **Design decision:** Prioritize canvas usability on small screens by starting fullscreen mobile in a clean state (tools/details hidden) while keeping quick toggles available in the header.
- **Tech details:** Added mobile-only fullscreen buttons (`Show/Hide Tools`, `Show/Hide Details`) and panel state classes (`tree-tools-hidden`, `tree-details-hidden`). Added dynamic fullscreen header measurement in controller logic and now positions the tools dock using a computed CSS variable (`--tree-header-bottom`) so wrapped header height on mobile does not collide with Advanced Search.
- **Behavior details:**  
  - On entering fullscreen mobile: tools/details are hidden by default.  
  - Users can toggle either section independently.  
  - On larger screens, both sections auto-show.  
  - Search/tools now anchor below actual header height, preventing overlap with `Binary Tree` title and `Exit Fullscreen`.

### 2026-02-21 - Advanced Search furthest-left/furthest-right navigation (Codex)

- **What changed:** Added two new Advanced Search navigation buttons: `Furthest Left` and `Furthest Right`.
- **Files affected:** `index.html`, `binary-tree.mjs`, `Claude_Notes/vault-dashboard.md`
- **Design decision:** Keep navigation controls inside Advanced Search so users handling large trees can quickly jump deeper without manual pan/zoom hunting.
- **Tech details:** Added buttons (`tree-nav-furthest-left`, `tree-nav-furthest-right`) and controller handlers that traverse from the active node (selected node, fallback root) down the chosen leg until the last available child, then select + focus that target node.
- **Behavior details:**  
  - `Furthest Left`: follows `leftChildId` repeatedly to deepest descendant.  
  - `Furthest Right`: follows `rightChildId` repeatedly to deepest descendant.  
  - Includes loop/invalid-link guards to prevent navigation failures.

### 2026-02-21 - Control-bar nav placement + root-based furthest traversal + centered search/nav focus (Codex)

- **What changed:** Moved `Furthest Left` and `Furthest Right` into the main control button group (with Zoom/Fit/Reset/Show Search), updated traversal to always start from root, and fixed focus behavior so search/nav actions center reliably with a slight zoom-in.
- **Files affected:** `index.html`, `binary-tree.mjs`, `Claude_Notes/vault-dashboard.md`
- **Design decision:** Keep high-frequency navigation actions in one control cluster and make jump behavior deterministic for large trees by anchoring furthest traversal at root.
- **Tech details:**  
  - Relocated furthest buttons into `#tree-control-bar` and removed them from inside the Advanced Search form.  
  - Updated `navigateToFurthest(...)` to start from `state.data.rootId` (no selected-node dependency).  
  - Added focus option handling with `NAVIGATION_FOCUS_MIN_ZOOM` so Advanced Search result clicks and furthest-nav jumps both apply center + minimum zoom.
- **Behavior details:**  
  - Users can press furthest buttons immediately without selecting any node first.  
  - Search result selection now always recenters node to viewport center and zooms in slightly (works on desktop and mobile).

### 2026-02-21 - Mobile centering precision fix for navigation focus (Codex)

- **What changed:** Corrected node-centering math used by furthest navigation and search-result focus on mobile/high-DPR screens.
- **Files affected:** `binary-tree.mjs`, `Claude_Notes/vault-dashboard.md`
- **Root cause:** Camera centering relied on `app.renderer.width/height` (device pixel dimensions), which can misalign focus coordinates on high-density displays.
- **Tech details:** Added a viewport helper based on `app.screen.width/height` (logical render coordinates) and switched focus/fit/empty-state/zoom-button center calculations to that coordinate space.
- **Expected result:** Furthest-left/right and search navigation now center selected nodes consistently on mobile and desktop.

### 2026-02-21 - Fullscreen minimap navigation overlay (Codex)

- **What changed:** Added a fullscreen-only `Minimap` overlay to the Binary Tree page as a navigation guide.
- **Files affected:** `index.html`, `binary-tree.mjs`, `Claude_Notes/vault-dashboard.md`
- **Design decision:** Keep normal mode unchanged and expose minimap only in fullscreen to preserve canvas focus while adding fast orientation/navigation for large trees.
- **Tech details:**  
  - Added `#tree-minimap-panel` + `#tree-minimap-canvas` inside the Binary Tree panel and styled it as a floating fullscreen overlay.
  - Implemented canvas-based minimap rendering in `binary-tree.mjs` with projected node/link positions and a live viewport rectangle.
  - Added minimap pointer interaction (click + drag) to re-center the main tree camera based on minimap position.
  - Synced minimap redraw with camera transforms (pan, zoom, fit, reset, search/nav focus) and fullscreen lifecycle.
  - Added dynamic fullscreen offset logic using `--tree-minimap-bottom` so minimap clears the detail cards area.
- **Validation performed:**  
  - Fullscreen minimap visible: `temporary screenshots/screenshot-binary-tree-minimap-fullscreen.png`
  - Interaction check (minimap click shifts viewport): `temporary screenshots/screenshot-binary-tree-minimap-before-click.png`, `temporary screenshots/screenshot-binary-tree-minimap-after-click.png`
- **Known limitations:** Minimap is currently hidden outside fullscreen by design; no dedicated zoom controls exist inside minimap itself (it controls viewport center only).

### 2026-02-21 - Binary tree spillover sponsorship support + direct-sponsor BV crediting (Codex)

- **What changed:** Added spillover-aware tree modeling so members can have unlimited direct sponsorships while retaining binary placement (`leftChildId` / `rightChildId`), and applied spillover BV only to the direct sponsor.
- **Files affected:** `binary-tree.mjs`, `index.html`, `Claude_Notes/vault-dashboard.md`
- **Design decision:** Keep binary placement hierarchy intact for layout/navigation while treating sponsorship as a separate relationship for BV credit logic.
- **Tech details:**  
  - Extended node normalization with sponsorship/placement metadata (`sponsorId`, `sponsorLeg`, `placementParentId`, `placementSide`, `isSpillover`).
  - Added placement-parent inference and sponsor-leg resolution during normalization.
  - Replaced subtree BV derivation with spillover-aware logic:
    - `placement leg credits` propagate only through non-spillover sponsor links.
    - `spillover credits` are added only to the direct sponsor leg.
    - Spillover BV is excluded from upward propagation above direct sponsor.
  - Added spillover counters on node state (`spilloverLeftPv`, `spilloverRightPv`) for inspection/debugging.
  - Updated main canvas links to color spillover placement edges green.
  - Updated minimap to render spillover edges with separate green stroke.
  - Extended selected-node panel with `Direct Sponsor`, `Placement Parent`, and `Spillover` fields.
  - Updated search result chips to show sponsorship type (`Direct` / `Spillover`).
  - Updated mock generator to produce mixed direct + spillover sponsorship patterns while preserving valid binary placement.
- **Validation performed:**  
  - Module import/generation check: `createMockBinaryTreeData({ targetNodes: 120 })` returns valid dataset with spillover nodes.
  - Browser runtime check confirms Binary Tree initializes and new selected-panel fields are present.
  - Scenario validation with custom 4-node dataset confirms spillover BV rule:
    - Spillover child under placement parent does **not** credit placement parent.
    - Same spillover child credits direct sponsor leg only.

### 2026-02-21 - Binary tree render regression fix after spillover rollout (Codex)

- **What changed:** Fixed Binary Tree appearing empty/line-only after spillover update by stabilizing mock placement depth and hardening layout width scaling.
- **Files affected:** `binary-tree.mjs`, `Claude_Notes/vault-dashboard.md`
- **Root cause:** A prior mock spillover generator could create deeper-than-expected placement depth, and the layout width formula (`2 ** depth`) over-expanded world coordinates, causing fit/viewport to land away from visible nodes.
- **Tech details:**  
  - Replaced mock spillover placement builder with balanced binary placement (ordinal parent/children) while still assigning deterministic spillover sponsorship metadata (`sponsorId`, `sponsorLeg`, `isSpillover`).  
  - Added layout hardening with `MAX_LAYOUT_DEPTH_FOR_WIDTH` so extremely deep structures are horizontally compressed rather than exploding coordinate scale.
- **Validation performed:**  
  - Headless screenshot check confirms nodes render again in Binary Tree view: `temporary screenshots/screenshot-23-binary-after-layout-hardening.png`.  
  - Module import passes (`binary-tree.mjs import ok`), and search/selection panels remain populated.

### 2026-02-21 - Spillover line endpoint update (direct sponsor linkage) (Codex)

- **What changed:** Updated spillover edge rendering so green lines connect directly from each spillover node to its direct sponsor (not to placement parent).
- **Files affected:** `binary-tree.mjs`, `Claude_Notes/vault-dashboard.md`
- **Tech details:**  
  - Main canvas: placement tree links now always use standard link color, and a second pass draws green sponsor-to-node Bezier links for spillover nodes.  
  - Minimap: gray lines now represent placement tree only, while green overlay lines represent sponsor-to-spillover relationships.
- **Validation performed:**  
  - Headless screenshot confirms green spillover lines are anchored to direct sponsor paths: `temporary screenshots/screenshot-24-spillover-sponsor-link.png`.

### 2026-02-21 - Selected node sponsorship fields enhancement (Codex)

- **What changed:** Enhanced `Selected Node` details with a new `Total Direct Sponsors` metric and made `Direct Sponsor` + `Placement Parent` values clickable for navigation.
- **Files affected:** `index.html`, `binary-tree.mjs`, `Claude_Notes/vault-dashboard.md`
- **UI updates:**  
  - Added `Total Direct Sponsors` directly above `Direct Sponsor`.  
  - Converted `Direct Sponsor` and `Placement Parent` values from static text to buttons with disabled state when unavailable.
- **Logic details:**  
  - `Total Direct Sponsors` now counts all nodes where `sponsorId === selectedNode.id`.  
  - Clicking `Direct Sponsor` or `Placement Parent` selects that related member and centers/zooms the canvas using the same focus behavior as search/navigation tools.
- **Behavior notes:** Buttons are inert/disabled when relation target is missing or invalid.

### 2026-02-21 - Selected-node spillover line visibility toggle + dashed styling (Codex)

- **What changed:** Added a per-node spillover visibility control in `Selected Node` and updated spillover links to render as thinner dashed green lines.
- **Files affected:** `index.html`, `binary-tree.mjs`, `Claude_Notes/vault-dashboard.md`
- **UI updates:**  
  - Added `Spillover Line` control with checkbox `tree-selected-spillover-line-toggle` in the selected-node detail card.  
  - Control is enabled only when the selected node has a spillover sponsor link; otherwise it is disabled.
- **Logic details:**  
  - Added per-node visibility state (`hiddenSpilloverNodeIds`) so toggling affects only that specific node’s spillover line.  
  - Visibility preference persists while navigating across nodes in the current dataset/session.  
  - State resets when a new dataset is loaded (`setData`).
- **Rendering details:**  
  - Main canvas spillover links now draw with dashed Bezier polylines at `1.5px` width.  
  - Minimap spillover links now use dashed strokes with thinner width (`0.9px`).  
  - Hidden spillover-node links are skipped in both main canvas and minimap rendering passes.
- **Validation performed:**  
  - Syntax check: `node --check binary-tree.mjs`  
  - Module load check: `binary-tree.mjs import ok`

### 2026-02-21 - Spillover dash variation + selected-node toggle behavior fix (Codex)

- **What changed:** Improved spillover line readability with per-line dash variation and fixed the selected-node spillover toggle so it works for both spillover children and sponsor nodes with spillover descendants.
- **Files affected:** `binary-tree.mjs`, `index.html`, `Claude_Notes/vault-dashboard.md`
- **Logic fixes:**  
  - Replaced toggle scope from "only selected spillover child" to "all spillover links related to selected node" (incoming spillover link if selected node is spillover, plus outgoing spillover links where selected node is sponsor).  
  - Added relation resolver `getSpilloverRelationNodeIds(...)` and updated checkbox state handling (`checked` + `indeterminate`) based on visible/hidden mix.
- **Rendering updates:**  
  - Added stable hash-based dash pattern generation per spillover line (`getSpilloverDashPattern(...)`) so each link has distinct dash/gap values without flicker.  
  - Main canvas keeps thin dashed spillover curves and now uses per-line dash variation.  
  - Minimap spillover overlays now draw per-link with their own dash pattern.
- **UI copy update:**  
  - Checkbox label changed to `Show green spillover lines for this node`.
- **Validation performed:**  
  - Scripted browser check with auth session confirmed toggle interaction: `checked true -> false` while enabled.  
  - Captured fullscreen verification screenshot: `temporary screenshots/screenshot-26-spillover-randomized-v2.png`.  
  - Syntax + module checks: `node --check binary-tree.mjs`, `binary-tree.mjs import ok`.

### 2026-02-21 - Spillover line depth + rounded stroke + 30% opacity (Codex)

- **What changed:** Adjusted spillover dashed lines to render with rounded stroke ends, reduced opacity to 30%, and placed them on the bottom-most render layer.
- **Files affected:** `binary-tree.mjs`, `Claude_Notes/vault-dashboard.md`
- **Rendering updates:**  
  - Added a dedicated `spilloverLinksLayer` beneath standard tree links and nodes to guarantee spillover lines stay visually behind all other tree geometry.  
  - Main-canvas spillover line style now uses rounded caps/joins with `alpha: 0.3`.  
  - Minimap spillover lines now also use `30%` opacity and rounded `lineCap`/`lineJoin`.
- **Validation performed:**  
  - Syntax check: `node --check binary-tree.mjs`  
  - Module load check: `binary-tree.mjs import ok`

### 2026-02-21 - Binary Tree reload persistence (fullscreen + UI state) (Codex)

- **What changed:** Added persisted Binary Tree UI/session state so refresh restores fullscreen mode and previous user configuration.
- **Files affected:** `binary-tree.mjs`, `Claude_Notes/vault-dashboard.md`
- **Persistence scope:**  
  - Fullscreen state (`isFullscreen`)  
  - Search panel open/closed state  
  - Tools/details overlay visibility toggles  
  - Search filters (`query`, `minCycles`, `status`, `sort`)  
  - Selected node  
  - Hidden spillover-line node IDs  
  - Camera transform (`x`, `y`, `scale`)  
  - Cycle rule thresholds
- **Tech details:**  
  - Added localStorage key: `charge-binary-tree-ui-state-v1`.  
  - Implemented read/sanitize/apply flow on init + `setData(...)` restore pass, including fullscreen restoration and camera restore after layout boot.  
  - Added debounced persistence scheduling across navigation, zoom/pan/minimap movement, search/filter edits, selection changes, spillover toggle edits, and fullscreen transitions.  
  - Added `beforeunload` + controller `destroy()` flush to avoid losing latest state on refresh/teardown.
- **Validation performed:**  
  - Syntax check: `node --check binary-tree.mjs`  
  - Module load check: `binary-tree.mjs import ok`  
  - Automated reload E2E check confirms state restored:
    - Before reload: fullscreen=true, search open=true, query=`M-60`, selected=`Parker Knight (M-609)`  
    - After reload: fullscreen=true, search open=true, query=`M-60`, selected=`Parker Knight (M-609)`  
  - Screenshot: `temporary screenshots/screenshot-28-fullscreen-persist-reload.png`

### 2026-02-21 - Mobile fullscreen touch UX optimization (Codex)

- **What changed:** Optimized Binary Tree fullscreen interaction on mobile with touch-first controls and reduced overlay clutter.
- **Files affected:** `index.html`, `binary-tree.mjs`, `Claude_Notes/vault-dashboard.md`
- **UX updates (mobile fullscreen only):**  
  - Hidden `Zoom In` and `Zoom Out` buttons (pinch + pan remain primary controls).  
  - Hidden minimap panel.  
  - Disabled accidental text highlighting, touch callout, and tap-flash on Binary Tree canvas/overlay surfaces while preserving input/select usability for search fields.
- **Touch support updates:**  
  - Added explicit mobile-fullscreen canvas touch gesture handling (`touchstart/move/end/cancel`, passive false), with `preventDefault` applied on touch-move and multi-touch to reduce browser gesture interference while preserving single-tap interactions.  
  - Added minimap visibility guard in renderer/interaction paths so minimap work is skipped when mobile fullscreen hides it.
- **Validation performed:**  
  - Syntax check: `node --check binary-tree.mjs`  
  - Mobile fullscreen verification script confirms:
    - `zoomInDisplay = none`
    - `zoomOutDisplay = none`
    - `minimapDisplay = none`
    - `fullscreen = true`
  - Screenshots: `temporary screenshots/screenshot-29-mobile-fullscreen-touch-v1.png`, `temporary screenshots/screenshot-30-mobile-fullscreen-touch-v2.png`

### 2026-02-21 - iOS browser chrome safe-area layout tuning (Codex)

- **What changed:** Tuned Binary Tree fullscreen mobile layout to better accommodate iOS Safari/Chrome browser UI and notch/home-indicator safe areas.
- **Files affected:** `index.html`, `Claude_Notes/vault-dashboard.md`
- **Tech details:**  
  - Updated viewport meta to `viewport-fit=cover` so safe-area environment values are available.  
  - Added safe-area CSS variables (`--safe-area-top/right/bottom/left`) and applied them to `#tree-fullscreen-overlay` padding.  
  - Forced fullscreen overlay sizing to dynamic viewport height (`height: 100dvh`) to better track mobile browser chrome expansion/collapse.  
  - Switched mobile fullscreen tool-dock max-height rules from `vh` to `dvh` to reduce clipping/overlap when iOS browser bars change visible viewport height.
- **Validation performed:**  
  - Mobile fullscreen screenshot check: `temporary screenshots/screenshot-31-mobile-safearea-v1.png`  
  - Computed style check in mobile viewport confirms updated fullscreen overlay and dock sizing rules are active (safe-area values are environment-dependent and may read `0px` outside real iOS hardware contexts).

### 2026-02-21 - Mobile fullscreen detail-panel size + stacking fix (Codex)

- **What changed:** Fixed mobile fullscreen where `Organization Summary` + `Selected Node` occupied too much space and could obscure top controls (`Hide Tools` / `Hide Details`).
- **Files affected:** `index.html`, `Claude_Notes/vault-dashboard.md`
- **Root cause:** Detail cards were unconstrained on mobile fullscreen and could grow upward into control space; overlay layers also shared similar stacking priority.
- **Layout fixes (mobile fullscreen):**  
  - Added explicit mobile caps for detail area and cards:
    - detail container: `max-height: min(44dvh, 360px)`  
    - selected panel: `max-height: min(30dvh, 250px)` + internal scroll  
    - org summary: `max-height: min(16dvh, 132px)` + internal scroll  
  - Anchored details using safe-area bottom inset (`bottom: calc(12px + var(--safe-area-bottom))`).
  - Adjusted header top offset to include safe area (`top: calc(10px + var(--safe-area-top))`).
  - Forced mobile detail layout to `justify-content: flex-end` with smaller gap.
- **Stacking fixes:**  
  - Header now renders above all overlays (`z-index: 14`), tools dock above details (`13`), detail panels below tools (`10`), minimap below details (`9`).
- **Validation performed:**  
  - Mobile fullscreen automated check confirms:
    - header z-index `14`, details z-index `10`  
    - `headerOverlapsDetails = false`  
    - tools/details toggle buttons remain visible  
  - Screenshot: `temporary screenshots/screenshot-32-mobile-details-compact-v1.png`

### 2026-02-21 - Apple Maps-style mobile Binary Tree controls + selected-sheet behavior (Codex)

- **What changed:** Added a dedicated mobile fullscreen interaction pattern inspired by Apple Maps: bottom-centered search pill, expandable search sheet, and auto-show selected-node sheet on node selection.
- **Files affected:** `index.html`, `binary-tree.mjs`, `Claude_Notes/vault-dashboard.md`
- **UI/UX changes (mobile fullscreen):**  
  - Added bottom `Search members` pill (`tree-mobile-search-pill`) as the default control entry point.  
  - Pressing the pill opens an upward sliding control/search sheet (existing tools + advanced search).  
  - Added mobile-only selected sheet dismiss button (`tree-selected-mobile-close`).  
  - Selected-node sheet now auto-opens when a node is selected (tap/search/nav) and can be dismissed to hide.
- **Behavior details:**  
  - Selecting a node on mobile fullscreen closes the search sheet and opens the selected-node sheet.  
  - Opening the search sheet automatically hides the selected-node sheet to avoid overlap.  
  - Dismissing selected-node sheet clears mobile selection state and hides the sheet.
- **Layout/style details:**  
  - Mobile tools dock now behaves as a bottom sheet with slide/opacity transitions (`tree-mobile-search-sheet-open`).  
  - Mobile selected panel now behaves as its own bottom sheet with slide/opacity transitions (`tree-mobile-selected-open`).  
  - `Organization Summary` is hidden in this mobile fullscreen mode to prioritize selected-node readability and map/canvas visibility.  
  - Search pill auto-hides while either search sheet or selected sheet is open.
- **State/persistence updates:**  
  - Added persisted UI flag `isMobileSelectedOpen` in Binary Tree local state snapshot (`charge-binary-tree-ui-state-v1`).
- **Validation performed:**  
  - Syntax check: `node --check binary-tree.mjs`  
  - Module load check: `binary-tree.mjs import ok`  
  - Mobile flow automation confirms:
    - baseline: search pill visible, both sheets closed  
    - pill tap: search sheet opens  
    - node select: search sheet closes, selected sheet opens  
    - dismiss tap: selected sheet closes  
  - Screenshots: `temporary screenshots/screenshot-33-mobile-applemaps-selected-open.png`, `temporary screenshots/screenshot-34-mobile-applemaps-selected-dismiss.png`, `temporary screenshots/screenshot-35-mobile-selected-no-pill-v1.png`

### 2026-02-21 - Cross-device rendering baseline + fullscreen overlay hardening (Codex)

- **What changed:** Added cross-device baseline rendering rules and fixed Binary Tree fullscreen overlay behavior on shorter desktop viewports (including MacBook-class heights).
- **Files affected:** `index.html`, `login.html`, `binary-tree.mjs`, `Claude_Notes/vault-dashboard.md`
- **Design/UX decisions:**  
  - Added a stable baseline for typography/rendering across devices (root font size, text-size-adjust, font smoothing, zero body margin, `100dvh` minimum height).  
  - Preserved existing visual direction while reducing fullscreen overlay crowding and minimap clipping risk.
- **Tech details:**  
  - Added `<meta name="color-scheme" content="dark">` to both `index.html` and `login.html`.  
  - Added shared base CSS in both pages for more consistent rendering across OS/browser combinations.  
  - In `index.html`, constrained fullscreen detail cards on desktop (`min-width: 961px`) with bounded panel height and per-card internal scrolling.  
  - Added short-height fullscreen minimap size adjustments (`max-height: 860px`) to keep overlays usable on smaller laptop windows.  
  - In `binary-tree.mjs`, clamped computed `--tree-minimap-bottom` against actual panel/minimap dimensions so minimap never gets pushed off-screen by tall detail content.
- **Validation performed:**  
  - Scripted Puppeteer checks across multiple viewport/DPR combinations (`1440x900@1`, `1512x982@2`, `1280x800@2`, `1100x760@2`) after entering Binary Tree fullscreen.  
  - Verified minimap remains within fullscreen bounds after clamping (previously reproduced negative `y` positions on shorter heights before fix).

### 2026-02-21 - Fullscreen Selected Node panel containment fix (Codex)

- **What changed:** Fixed the `Selected Node` card being visually broken under the minimap in Binary Tree fullscreen mode.
- **Files affected:** `index.html`, `Claude_Notes/vault-dashboard.md`
- **Root cause:** Desktop fullscreen detail container used a `max-height` cap while child cards kept intrinsic content height (~651px), so `Selected Node` overflowed above the intended detail region.
- **Tech details:**  
  - Changed desktop fullscreen detail container from `max-height` to explicit `height` (`min(38vh, 24rem)`).  
  - Set detail container `align-items: stretch` so both cards are sized by the container height.  
  - Set `#tree-selected-panel` and `#tree-org-summary-panel` to `height: 100%`, `max-height: none`, and internal `overflow-y: auto` for controlled scrolling.
- **Validation performed:**  
  - Scripted fullscreen checks with node selection on `1440x900@1`, `1512x982@2`, and `1280x800@2`.  
  - Verified `Selected Node` stays fully within detail container bounds (`selectedWithinDetails: true` in all tested cases), with internal scroll for overflow content.

### 2026-02-21 - Fullscreen Selected Node no-scroll height expansion (Codex)

- **What changed:** Reworked the previous containment patch to remove `Selected Node` scrolling and instead increase fullscreen detail-panel height so full card content is visible.
- **Files affected:** `index.html`, `Claude_Notes/vault-dashboard.md`
- **Tech details:**  
  - Desktop fullscreen detail container now uses `height: clamp(41rem, 72vh, 45rem)` with `align-items: stretch`.  
  - `#tree-selected-panel` and `#tree-org-summary-panel` now use `overflow-y: visible` (no internal scroll) while remaining height-bound by the expanded detail container.  
  - Short-height desktop minimap canvas was reduced from `6.75rem` to `5rem` to preserve top-right space when details are taller.
- **Validation performed:**  
  - Scripted fullscreen + node selection checks on `1440x900@1`, `1512x982@2`, and `1280x800@2`.  
  - Confirmed no internal selected-panel scrolling (`selectedOverflowY: visible`, `selectedScrollHeight <= selectedClientHeight`) and full card visibility across tested sizes.

### 2026-02-21 - Restore compact Organization Summary in fullscreen (Codex)

- **What changed:** Restored `Organization Summary` to the previous compact card size while keeping `Selected Node` expanded/no-scroll.
- **Files affected:** `index.html`, `Claude_Notes/vault-dashboard.md`
- **Tech details:**  
  - Desktop fullscreen detail container alignment switched back to `align-items: flex-end` so cards are bottom-aligned instead of both stretched.  
  - `#tree-selected-panel` remains expanded (`height: 100%`, `align-self: stretch`, `overflow-y: visible`).  
  - `#tree-org-summary-panel` now uses compact sizing again (`height: auto`, `align-self: flex-end`, `overflow-y: visible`).
- **Validation performed:**  
  - Scripted fullscreen + node selection checks on `1512x982@2` and `1280x800@2`.  
  - Confirmed compact org panel height (~`121px`) and full selected panel visibility with no selected-panel scroll.

### 2026-02-21 - Binary Tree first-load responsiveness fix (hidden init resize recovery) (Codex)

- **What changed:** Fixed intermittent Binary Tree first-load/unresponsive behavior that required manual refresh.
- **Files affected:** `index.html`, `Claude_Notes/vault-dashboard.md`
- **Root cause:** Binary Tree initialized while `Binary Tree` page was hidden, so Pixi renderer sized to fallback `280x220`; without a subsequent resize/fit pass on page reveal, canvas stayed undersized and interaction felt broken.
- **Tech details:**  
  - Added `refreshBinaryTreeLayout(...)` in dashboard navigation script to trigger a resize pass when switching to `binary-tree`.  
  - Added tiny-canvas detection (`<= 320x260`) and automatic `fitToView()` recovery for hidden-init cases.  
  - Added a `binary-tree-ready` event dispatch from module init and a listener in main script to recover layout if the user is already on Binary Tree before controller setup finishes.
- **Validation performed:**  
  - Reproduced prior state: before nav canvas backing store was `280x220` while page hidden.  
  - After fix, first navigation to Binary Tree now resizes immediately to full container (`908x736` in test viewport) with no manual refresh.  
  - Fast-navigation scenario (clicking Binary Tree immediately after load) also recovers correctly via ready-event path (`hasController: true`, full-size canvas, selected node populated).

### 2026-02-21 - Mobile login/index access hardening (Codex)

- **What changed:** Hardened auth persistence for mobile browsers and deferred Binary Tree initialization so dashboard landing loads are lighter and less failure-prone on phones.
- **Files affected:** `index.html`, `login.html`, `Claude_Notes/vault-dashboard.md`
- **Tech details:**  
  - Added auth session fallback chain in both login and index flows: `localStorage` -> `sessionStorage` -> cookie (`vault-auth-user-cookie`).  
  - Added safe storage helpers to prevent uncaught storage exceptions in restricted/private browsing modes.  
  - Updated login error handling to show a specific message when browser storage is unavailable.  
  - Removed eager Binary Tree module boot from page load and introduced `ensureBinaryTreeReady()` lazy loading when the `Binary Tree` page is opened.
- **Validation performed:**  
  - HTTP smoke check: `GET /login.html` and `GET /index.html` both return `200`.  
  - Puppeteer flow check: login with `alexm / Demo1234!` redirects to `http://127.0.0.1:3000/index.html`, dashboard view is present/visible, and `window.__vaultAuthUser` is set.
- **Known limitations:**  
  - If a browser blocks all storage mechanisms (local/session/cookie), session persistence still cannot be maintained and login will fail with a storage warning.

### 2026-02-21 - Binary Tree mobile/network load hardening (Codex)

- **What changed:** Made Binary Tree load independent of external Pixi CDN availability and reduced initial render load on phones/low-power devices.
- **Files affected:** `index.html`, `serve.mjs`, `vendor/pixi.min.js`, `Claude_Notes/vault-dashboard.md`
- **Tech details:**  
  - Replaced external Pixi script include with project-local asset: `./vendor/pixi.min.js` (served by local dev server).  
  - Added adaptive initial node sizing in `ensureBinaryTreeReady()`:
    - `160` nodes when `navigator.connection.saveData` is enabled  
    - `260` nodes on mobile/touch contexts  
    - `380` nodes on low-memory/low-core devices  
    - `1000` nodes on higher-capability desktop contexts  
  - Added explicit Binary Tree fallback messaging on init failures (`Binary Tree could not load on this device/network.`) instead of silent catch.
  - Added dev-server no-cache headers in `serve.mjs` (`Cache-Control: no-store`, `Pragma: no-cache`, `Expires: 0`) to prevent stale mobile cache from serving older `index.html`/JS.
- **Validation performed:**  
  - Local asset check: `GET /vendor/pixi.min.js` returns `200`.  
  - Mobile-emulated login + Binary Tree navigation confirms:
    - controller initialized  
    - fallback hidden  
    - org total people reflects reduced mobile dataset (`260`)  
    - `window.PIXI` present from local script.

### 2026-02-21 - Mobile Binary Tree controls refinement + upper-focus camera anchor (Codex)

- **What changed:** Refined mobile fullscreen Binary Tree controls and adjusted navigation focus camera target so selected/jump nodes land above screen center (to avoid overlap with bottom sheets).
- **Files affected:** `index.html`, `binary-tree.mjs`, `Claude_Notes/vault-dashboard.md`
- **UI/control updates (mobile fullscreen):**  
  - Advanced Search now has a mobile `Dismiss` action in-panel (`tree-search-mobile-close`) replacing reliance on toolbar `Hide Search`.  
  - `Fit` and `Reset` controls are hidden on mobile view.  
  - Bottom `Search members` control was widened and restructured into a dedicated mobile anchor container.  
  - Added root/home icon button (`tree-mobile-root-focus`) at top-right above Search Members.  
  - Replaced standalone mobile furthest controls with a segmented top-left control that looks like one unit but uses two buttons: `< | >` (`tree-mobile-nav-furthest-left` / `tree-mobile-nav-furthest-right`).  
  - Legacy toolbar `Furthest Left/Right` are hidden in mobile fullscreen (desktop unchanged).
- **Camera/navigation behavior updates:**  
  - Added mobile fullscreen navigation focus anchor at `34%` viewport height (`MOBILE_NAVIGATION_FOCUS_VIEWPORT_Y_RATIO = 0.34`).  
  - Node focus actions (search result jump, root/home jump, furthest left/right jump, sponsor/placement navigation) now center to this upper-middle target on mobile fullscreen.  
  - Manual camera interactions (pan/zoom and minimap centering) remain unchanged.
- **Mobile input/interaction polish carried in this pass:**  
  - Search sheet remains bottom-anchored with constrained height and internal scrolling.  
  - Prevented iOS auto-zoom behavior on search fields via mobile fullscreen input font-size floor (`16px`) and disabled mobile auto-focus on search-sheet open.
- **Validation performed:**  
  - Syntax check: `node --check binary-tree.mjs`

### 2026-02-21 - Login input focus zoom suppression (Codex)

- **What changed:** Updated both login text fields (`Username or email`, `Password`) to use a mobile font-size floor of `16px` with `sm:text-sm` override for larger screens.
- **Files affected:** `login.html`, `Claude_Notes/vault-dashboard.md`
- **Design decision:** Targeted iOS Safari's input focus auto-zoom trigger (font-size under `16px`) while preserving existing compact desktop form density.
- **Validation performed:**  
  - Verified the login input class tokens now include `text-[16px] sm:text-sm` on both fields.
- **Known limitations:**  
  - This change addresses browser auto-zoom on focused form fields; it does not disable normal browser pinch zoom behavior.

### 2026-02-21 - Sidebar URL routing + SPA path fallback (Codex)

- **What changed:** Wired URL-aware navigation for sidebar pages so in-app view switches also update clean paths (`/dashboard`, `/MyStore`, `/BinaryTree`) without adding new HTML files.
- **Files affected:** `index.html`, `serve.mjs`, `Claude_Notes/vault-dashboard.md`
- **Tech details:**  
  - Added route mapping for the three wired pages and synchronized navigation with History API (`pushState` / `replaceState`).  
  - Added route parsing on initial load so direct entry to `/dashboard`, `/MyStore`, or `/BinaryTree` opens the correct in-page view.  
  - Added `popstate` handling so browser back/forward updates visible page state correctly.  
  - Updated active sidebar link `href` values from `#` to route paths for semantic links and direct-open behavior.  
  - Updated `serve.mjs` with SPA fallback logic: non-file paths now serve `index.html` instead of `404`.
- **Validation performed:**  
  - `node --check serve.mjs`  
  - HTTP checks confirm `GET /dashboard`, `GET /MyStore`, and `GET /BinaryTree` each return `200` with HTML.  
  - Puppeteer flow confirms path transitions: `initial=/dashboard`, `myStore=/MyStore`, `binaryTree=/BinaryTree`, and browser `Back` returns to `/MyStore`.

### 2026-02-22 - Mobile fullscreen outside-tap dismiss for Selected Node (Codex)

- **What changed:** Added mobile fullscreen outside-tap dismiss behavior for Selected Node sheet.
- **Files affected:** `binary-tree.mjs`, `Claude_Notes/charge-documentation.md`
- **Behavior details:**  
  - While in mobile fullscreen with Selected Node sheet open, tapping anywhere outside `#tree-selected-panel` now clears selection and dismisses the sheet.  
  - Taps inside `#tree-selected-panel` do not dismiss, so panel controls remain usable.  
  - Added a short tap-suppression window (`180ms`) after outside dismiss to prevent the same touch from immediately re-selecting a node.
- **Tech details:**  
  - Added `selectedPanelEl` DOM ref in `initBinaryTree(...)`.  
  - Added `onPanelPointerDown(...)` and bound it to `panelEl` `pointerdown`, gated to mobile fullscreen + selected-sheet-open state.
- **Validation performed:**  
  - `node --check binary-tree.mjs`

### 2026-02-22 - Mobile fullscreen outside-tap dismiss for Search Members sheet (Codex)

- **What changed:** Applied the same outside-tap dismiss behavior to the Search Members (advanced search) sheet in mobile fullscreen.
- **Files affected:** `binary-tree.mjs`, `Claude_Notes/charge-documentation.md`
- **Behavior details:**  
  - While Search Members sheet is open on mobile fullscreen, tapping outside `#tree-tools-dock` now closes the sheet.  
  - Taps inside the search/tools sheet do not dismiss it, preserving full control interaction.  
  - Added the same short tap-suppression window (`180ms`) after outside dismiss to prevent immediate unintended node selection from the same touch.
- **Tech details:**  
  - Added `toolsDockEl` DOM ref.  
  - Extended `onPanelPointerDown(...)` logic to handle outside dismiss for both mobile search sheet and selected-node sheet in priority order.
- **Validation performed:**  
  - `node --check binary-tree.mjs`

### 2026-02-22 - Selected Node panel scroll reset on node change (Codex)

- **What changed:** Ensured Selected Node panel always resets to top when selecting a node, so content starts consistently from the first field.
- **Files affected:** `binary-tree.mjs`, `Claude_Notes/charge-documentation.md`
- **Behavior details:**  
  - Each successful `selectNode(...)` call now resets Selected Node panel scroll position to `0` before panel refresh.  
  - Fixes the mobile case where scrolling deep in one node then selecting another kept the previous scroll offset.
- **Tech details:**  
  - Added `resetSelectedPanelScrollPosition()` helper and invoked it inside `selectNode(...)`.
- **Validation performed:**  
  - `node --check binary-tree.mjs`

### 2026-02-22 - Mobile selected-sheet dismiss guard when tapping nodes (Codex)

- **What changed:** Updated mobile fullscreen outside-tap dismiss behavior so tapping a different node no longer closes the Selected Node sheet before node selection occurs.
- **Files affected:** `binary-tree.mjs`, `Claude_Notes/charge-documentation.md`
- **Behavior details:**  
  - When Selected Node sheet is open, taps on actual nodes are now treated as node interactions (switch selection) rather than outside dismiss events.  
  - Tapping empty canvas/background still dismisses as before.
- **Tech details:**  
  - Added `isPointerOnAnyNode(event)` world-space hit test (uses current camera transform + node bounds).  
  - `onPanelPointerDown(...)` now exits early for node hits before running outside-dismiss logic.
- **Validation performed:**  
  - `node --check binary-tree.mjs`

### 2026-02-22 - Smooth camera animation for jump navigation (Codex)

- **What changed:** Added smooth camera tweening for jump-style navigation actions (including Home/Root button focus).
- **Files affected:** `binary-tree.mjs`, `Claude_Notes/charge-documentation.md`
- **Behavior details:**  
  - Camera now animates position + scale when using focus/jump flows (`selectNode(..., shouldFocus=true)` paths), including:
    - Home/Root button
    - Furthest left/right navigation
    - Search-result node jumps
    - Direct Sponsor / Placement Parent navigation
  - Manual interactions (drag/pan/zoom/wheel) immediately cancel active camera animation to keep controls responsive.
- **Tech details:**  
  - Added `NAVIGATION_CAMERA_ANIMATION_DURATION_MS = 360`.  
  - Extended `centerViewOnWorldPoint(...)` with optional animated transition and scale target.  
  - Added `stopCameraAnimation()` cancellation helper and wired it into manual camera controls + destroy lifecycle.
- **Validation performed:**  
  - `node --check binary-tree.mjs`

### 2026-02-22 - Camera jump easing updated to ease-in-out (Codex)

- **What changed:** Updated jump camera tween to use an ease-in-out cubic curve (instead of ease-out only).
- **Files affected:** `binary-tree.mjs`, `Claude_Notes/charge-documentation.md`
- **Behavior details:**  
  - Camera now accelerates from rest and decelerates into target for smoother start and stop during jump navigation.
- **Tech details:**  
  - Added `easeInOutCubic(progress)` utility and replaced animation easing calculation in camera tween loop.
- **Validation performed:**  
  - `node --check binary-tree.mjs`

### 2026-02-22 - Camera jump settling updated to spring-damped stop (Codex)

- **What changed:** Replaced fixed-duration ease tween with spring-damped camera settling so jump animations glide into the target and ease out before full stop.
- **Files affected:** `binary-tree.mjs`, `Claude_Notes/charge-documentation.md`
- **Behavior details:**  
  - Jump camera movement now includes a soft settle phase at the end rather than a hard-feeling stop.  
  - Home/Root, furthest navigation, search-result jumps, and sponsor/placement jumps all use the updated movement model.
- **Tech details:**  
  - Replaced `NAVIGATION_CAMERA_ANIMATION_DURATION_MS` tween timing with spring constants:
    - `NAVIGATION_CAMERA_SETTLE_STIFFNESS = 0.18`
    - `NAVIGATION_CAMERA_SETTLE_DAMPING = 0.72`
    - `NAVIGATION_CAMERA_MAX_SETTLE_MS = 900`
  - Updated `centerViewOnWorldPoint(..., { animate: true })` animation loop to spring/velocity integration with settle thresholds.
- **Validation performed:**  
  - `node --check binary-tree.mjs`

### 2026-02-22 - Camera jump movement simplified (spring removed) (Codex)

- **What changed:** Removed spring-damped settling and reverted jump camera movement to a simple smooth ease tween (non-exaggerated).
- **Files affected:** `binary-tree.mjs`, `Claude_Notes/charge-documentation.md`
- **Behavior details:**  
  - Camera jumps now move cleanly from start to target with smooth ease-in/out and no spring-like tail.  
  - Applies to Home/Root and all jump-navigation paths.
- **Tech details:**  
  - Restored fixed-duration tween model with `NAVIGATION_CAMERA_ANIMATION_DURATION_MS = 420`.  
  - Added `easeInOutSine(progress)` easing and removed spring constants/velocity integration.
- **Validation performed:**  
  - `node --check binary-tree.mjs`

### 2026-02-22 - Animated spillover dashed lines with per-line tempo (Codex)

- **What changed:** Added forward-moving animation for green spillover dashed lines with deterministic per-line speed variation.
- **Files affected:** `binary-tree.mjs`, `Claude_Notes/charge-documentation.md`
- **Behavior details:**  
  - Green spillover dashes now appear to move from sponsor toward member.  
  - Movement is intentionally slow and capped to avoid fast/exaggerated motion.  
  - Each spillover line has its own tempo/speed, but all remain within a slow range.
- **Tech details:**  
  - Extended `drawDashedPolyline(...)` to support dash phase offset.  
  - Added deterministic speed generation per line (`getSpilloverDashSpeedPxPerSecond(nodeId)`).  
  - Added spillover line geometry cache + redraw loop:
    - `rebuildSpilloverLinkCache(layout)`
    - `renderSpilloverLinks()`
    - ticker update `onSpilloverDashAnimationTick(deltaFrames)` at `30 FPS` cap
  - Slow speed range configured by:
    - `SPILLOVER_DASH_MIN_SPEED_PX_PER_SEC = 6`
    - `SPILLOVER_DASH_MAX_SPEED_PX_PER_SEC = 14`
- **Validation performed:**  
  - `node --check binary-tree.mjs`

### 2026-02-22 - Spillover dash animation performance stabilization (Codex)

- **What changed:** Optimized animated green spillover dashes to remove major pan/zoom slowdown while preserving motion effect.
- **Files affected:** `binary-tree.mjs`, `Claude_Notes/charge-documentation.md`
- **Performance fixes applied:**  
  - Added viewport culling for animated spillover links (only redraw links near visible world bounds with margin).  
  - Added interaction-aware animation suspension:
    - pause dash animation during active drag/pinch and shortly after wheel/minimap/camera input  
    - prevents redraw contention while user navigates
  - Added adaptive animation FPS based on link count:
    - normal: `18 FPS`
    - dense trees: `12 FPS` when spillover link count is high
- **Tech details:**  
  - New constants:
    - `SPILLOVER_DASH_ANIMATION_FPS = 18`
    - `SPILLOVER_DASH_ANIMATION_FPS_DENSE = 12`
    - `SPILLOVER_DASH_DENSE_LINK_THRESHOLD = 140`
    - `SPILLOVER_DASH_VISIBLE_MARGIN_WORLD = 240`
    - `SPILLOVER_DASH_SUSPEND_MS_ON_INTERACTION = 180`
  - Added `getPolylineBounds(points)` and cached bounds per spillover entry for fast culling.
  - Added `suspendSpilloverDashAnimation(...)` and integrated it with zoom/pan/wheel/minimap/pointer-start paths.
- **Validation performed:**  
  - `node --check binary-tree.mjs`

### 2026-02-22 - Spillover dash animation keeps running during camera movement (Codex)

- **What changed:** Removed interaction-time animation stop behavior; spillover dashes now keep animating while the camera is moving.
- **Files affected:** `binary-tree.mjs`, `Claude_Notes/charge-documentation.md`
- **Behavior details:**  
  - During pan/zoom/minimap drag, dash animation no longer pauses.  
  - While interacting, redraw runs at a lower FPS and tighter culling margin to protect responsiveness.
- **Tech details:**  
  - Replaced stale suspend path with interaction-window tracking (`markSpilloverDashInteraction(...)`).  
  - Ticker now uses interaction-aware FPS selection:
    - interaction: `SPILLOVER_DASH_ANIMATION_FPS_INTERACTION = 8`
    - normal/dense fallback preserved (`18` / `12`).  
  - Ticker now renders with `renderSpilloverLinks({ isInteraction })` and keeps fractional frame remainder for smoother timing.
- **Validation performed:**  
  - `node --check binary-tree.mjs`

### 2026-02-22 - Spillover line animation reverted to static dashed lines (Codex)

- **What changed:** Rolled back only spillover-line movement animation due to mobile/interaction performance impact.
- **Files affected:** `binary-tree.mjs`, `Claude_Notes/charge-documentation.md`
- **Behavior details:**  
  - Green spillover lines remain dashed, rounded, thin, and low-opacity.  
  - Dash movement is removed; lines are now static at all times.  
  - Camera/navigation animations remain unchanged.
- **Tech details:**  
  - Removed spillover dash ticker loop and interaction throttling logic.  
  - Removed animated dash-offset/speed state and constants.  
  - Restored static `drawDashedPolyline(...)` rendering path.
- **Validation performed:**  
  - `node --check binary-tree.mjs`

### 2026-02-22 - Admin dashboard shell + dedicated admin auth flow (Codex)

- **What changed:** Added a dedicated admin-facing dashboard entry and separate admin login screen while preserving the existing member dashboard and visual language.
- **Files affected:** `admin.html`, `admin-login.html`, `mock-admin-users.json`, `serve.mjs`, `Claude_Notes/charge-documentation.md`
- **Admin dashboard details (`admin.html`):**
  - Cloned member dashboard styling/layout to keep visual parity.
  - Sidebar nav currently includes only:
    - `Dashboard`
    - `Product Management`
  - Routed admin navigation to admin namespace paths (`/admin/dashboard`, `/admin/ProductManagement`).
  - Wired admin page state/title metadata for `dashboard` and `product-management`.
  - Isolated admin state key: `charge-admin-dashboard-view-state`.
- **Admin auth boundary:**
  - Added dedicated admin login page: `admin-login.html`.
  - Added admin auth storage keys:
    - `vault-admin-auth-user`
    - `vault-admin-auth-user-cookie`
  - `admin.html` now requires admin session and redirects to `./admin-login.html` when unauthenticated.
  - Admin logout now redirects to `./admin-login.html`.
  - Added dedicated mock admin source: `mock-admin-users.json` with demo credential `admin / Admin1234!`.
- **Server routing details (`serve.mjs`):**
  - Added SPA fallback split:
    - `/admin*` -> `admin.html`
    - non-admin extensionless paths -> `index.html`
- **Validation performed:**
  - `node --check serve.mjs`
  - Verified admin URL path responds with `HTTP 200` on the running local server.

### 2026-02-22 - Admin login redirect + dashboard routing hardening (no-rewrite safe) (Codex)

- **What changed:** Reworked admin navigation/redirect flow to avoid rewrite-dependent URLs that can 404 on static servers.
- **Files affected:** `admin.html`, `admin-login.html`, `Claude_Notes/charge-documentation.md`
- **Issue addressed:** Logging in from `/admin-login.html` redirected to `/admin/dashboard`, which fails on environments without SPA rewrite support.
- **Implementation details:**
  - Switched admin in-app routing to hash-based routes:
    - `#dashboard`
    - `#product-management`
  - Updated admin sidebar hrefs to hash URLs instead of path URLs.
  - Added hash-aware route resolution (`resolvePageFromLocation`) with fallback support for older path/query forms.
  - Updated route sync logic to write hash routes via History API (`.../admin.html#...`) instead of rewrite-only paths.
  - Added canonical route normalization so legacy `/admin/dashboard` style entries are rewritten to `./admin.html#...`.
  - Added `hashchange` handling so manual hash edits and direct hash links update visible page state.
  - Updated `admin-login.html` success/auto-login redirect target to absolute `/admin.html#dashboard`.
  - Updated unauthenticated and logout redirects in `admin.html` to absolute `/admin-login.html` to avoid nested-path relative redirect issues.
- **Validation performed:**
  - Confirmed admin nav links now point to hash routes in `admin.html`.
  - Confirmed admin login redirects now target `/admin.html#dashboard` in `admin-login.html`.
  - Puppeteer flow check confirms:
    - unauthenticated `/admin/dashboard` resolves to `/admin-login.html`
    - successful admin sign-in resolves to `/admin.html#dashboard`

### 2026-02-22 - Admin auth unified into single page (`admin.html`) (Codex)

- **What changed:** Merged admin login and admin dashboard into one page so admin auth flow runs entirely inside `admin.html`.
- **Files affected:** `admin.html`, `admin-login.html`, `Claude_Notes/charge-documentation.md`
- **Implementation details:**
  - Added in-page login shell to `admin.html` (`#admin-login-shell`) using the same visual system.
  - Dashboard shell now lives in `#admin-dashboard-shell`; only one shell is visible at a time.
  - If no admin session exists, `admin.html` shows login shell and initializes login form handlers.
  - If admin session exists, `admin.html` shows dashboard shell and runs full admin dashboard boot logic.
  - Login success now persists admin session then reloads into dashboard hash route (`/admin.html#dashboard`).
  - Logout now clears admin session and reloads to clean login route (`/admin.html`).
  - `admin-login.html` is now a compatibility redirect to `/admin.html` so there is a single source of truth.
- **Validation performed:**
  - Puppeteer flow confirms:
    - `/admin.html` (unauthenticated) shows login
    - successful login shows dashboard at `/admin.html#dashboard`
    - logout returns to login at `/admin.html`
    - `/admin-login.html` redirects to `/admin.html`

### 2026-02-22 - Dashboard layout shift: Budget Progress moved above and expanded (Codex)

- **What changed:** Reworked dashboard module positioning so `Budget Progress` now sits above as the dominant block and occupies a desktop `2 columns x 2 rows` footprint.
- **Files affected:** `index.html`, `Claude_Notes/charge-documentation.md`
- **Layout details:**
  - Replaced the prior split row arrangement with a unified desktop grid: `lg:grid-cols-3 lg:grid-rows-2`.
  - Set `Budget Progress` container to `lg:col-span-2 lg:row-span-2`.
  - Moved `Quick Actions` to the top-right grid cell.
  - Moved `Recent Transactions` to the bottom-right grid cell.
  - Preserved `Month vs Month` as its own full-width row below the restructured grid to avoid dropping existing dashboard content.
- **Design decisions:**
  - Kept all existing card content and interaction styles unchanged; only structural layout placement was updated.
  - Maintained mobile-first behavior (`grid-cols-1` base) so cards still stack naturally on smaller screens.
- **Known limitation:** Grid row heights are content-driven; if right-column content changes significantly, visual row balance may need explicit row sizing utilities.

### 2026-02-22 - Budget Progress cohesive bento container redesign (Codex)

- **What changed:** Redesigned `Budget Progress` into a single unified container so the bento cards visually read as one cohesive module.
- **Files affected:** `index.html`, `Claude_Notes/charge-documentation.md`
- **Design details:**
  - Added an outer budget wrapper card (`bg-surface-raised`, bordered, rounded, padded, shadowed) around header + bento grid.
  - Updated inner bento cards to a distinct elevated surface (`bg-surface-elevated` with lighter borders) to create clear parent/child layering.
  - Preserved all budget values, labels, progress bars, and category structure; this is strictly a presentation/layout refinement.
- **Layout behavior:** Desktop placement remains unchanged (`lg:col-span-2 lg:row-span-2`), with mobile stacking behavior preserved.

### 2026-02-22 - Budget Progress no longer spans down to Recent Transactions (Codex)

- **What changed:** Updated dashboard grid placement so `Budget Progress` only occupies the top desktop row with `Quick Actions`, instead of extending into the second row.
- **Files affected:** `index.html`, `Claude_Notes/charge-documentation.md`
- **Implementation detail:** Removed `lg:row-span-2` from the Budget block (`lg:col-span-2` remains).
- **Result:** Budget now ends at the same row level as Quick Actions; Recent Transactions remains in the row below on the right.

### 2026-02-22 - Dashboard second-row rebalance (Codex)

- **What changed:** Rebalanced dashboard row usage by moving `Month vs Month` into the empty bottom-left area under `Budget Progress`.
- **Files affected:** `index.html`, `Claude_Notes/charge-documentation.md`
- **Layout result (desktop):**
  - Row 1: `Budget Progress` (left 2 columns) + `Quick Actions` (right column)
  - Row 2: `Month vs Month` (left 2 columns) + `Recent Transactions` (right column)
- **Implementation detail:** Removed the separate standalone `ROW 3: MONTH VS MONTH` section and placed that card directly inside the existing 2-row dashboard grid.

### 2026-02-22 - Quick Actions expansion + new accessibility card (Codex)

- **What changed:** Expanded `Quick Actions` to reduce empty space and added a new `Accessibility Controls` component directly below it in the top-right stack.
- **Files affected:** `index.html`, `Claude_Notes/charge-documentation.md`
- **Component updates:**
  - Converted the top-right area into a vertical stack (`flex flex-col gap-6 h-full`).
  - Expanded Quick Actions from 3 buttons to 6:
    - `Transfer Money`
    - `Pay Bills`
    - `Add Expense`
    - `Request Money`
    - `Schedule Pay`
    - `Add Beneficiary`
  - Added a new `Accessibility Controls` card with quick toggles:
    - `Larger Text`
    - `High Contrast`
    - `Reduce Motion`
    - `Focus Rings`
    - plus a full-width `Keyboard Shortcuts` action
- **Accessibility details:** Added explicit `aria-label` and `aria-pressed` semantics on control buttons for clearer assistive-tech behavior.

### 2026-02-22 - Server cut-off timer card with BV and cycle estimate (Codex)

- **What changed:** Replaced the temporary `Accessibility Controls` card under `Quick Actions` with a payout-focused `Server Cut-Off` component.
- **Files affected:** `index.html`, `Claude_Notes/charge-documentation.md`
- **Component details:**
  - Card header now shows `Server Cut-Off` and cadence `Every Saturday at 11:59 PM`.
  - Added live countdown in the format `X Day(s) Y Hour(s) Z Min(s) remaining`.
  - Added `Server now` and `Next` timestamp labels for context.
  - Added `Left Leg BV` and `Right Leg BV` value blocks.
  - Added `Estimated Cycles` calculated from lower leg BV divided by per-cycle BV.
- **Tech details:**
  - Added `initializeServerCutoffCard()` in the dashboard script.
  - Timer refreshes every `30s`.
  - Cut-off and BV values are configurable via `data-*` attributes on the card:
    - `data-cutoff-weekday="6"` (Saturday)
    - `data-cutoff-hour="23"`
    - `data-cutoff-minute="59"`
    - `data-left-leg-bv`, `data-right-leg-bv`, `data-cycle-bv`
- **Known limitation:** Timer is client-rendered UI logic and is not yet synchronized to backend server time.

### 2026-02-22 - Server cut-off timezone translation (California server time -> local) (Codex)

- **What changed:** Updated the cut-off timer so schedule logic is anchored to California server time and translated to each viewer's local timezone.
- **Files affected:** `index.html`, `Claude_Notes/charge-documentation.md`
- **Behavior details:**
  - Cut-off remains fixed to server timezone rule: Saturday 11:59 PM in `America/Los_Angeles`.
  - Card now displays:
    - `Server now` in server timezone.
    - `Server cut-off` in server timezone.
    - `Your local cut-off` translated to the user's browser timezone.
  - Countdown is computed against the server-time cutoff instant, then rendered live for all users.
- **Tech details:**
  - Added `data-cutoff-timezone="America/Los_Angeles"` on the cut-off card.
  - Reworked `initializeServerCutoffCard()` with timezone-aware next-cutoff computation using `Intl.DateTimeFormat` zone parsing and UTC conversion helpers.
- **Known limitation:** Translation relies on browser `Intl` timezone data; final payout authority should still come from backend server time.

### 2026-02-22 - Server cut-off card text cleanup (Codex)

- **What changed:** Simplified the cut-off timer subtext to avoid redundant timezone lines and keep the card visually cleaner.
- **Files affected:** `index.html`, `Claude_Notes/charge-documentation.md`
- **UI cleanup details:**
  - Removed the extra lines:
    - `Server now ...`
    - `Your local cut-off ...`
  - Kept only one concise subtext under the countdown:
    - `Next cut-off ...` (rendered in server timezone format)
- **Script cleanup:** Removed unused DOM bindings for deleted subtext elements and simplified timer render output accordingly.

### 2026-02-22 - Next cut-off line now includes date + time (Codex)

- **What changed:** Updated the single subtext line to show weekday + date + time for the next cut-off.
- **Files affected:** `index.html`, `Claude_Notes/charge-documentation.md`
- **Display format:** `Next cut-off Sat, Mar 07 at 11:59 PM PST` (example).
- **Tech details:** Replaced the generic timezone formatter with `formatCutoffTarget(...)` using `Intl.DateTimeFormat(...).formatToParts(...)` for explicit date/time string construction.

### 2026-02-22 - Quick Actions relabel + context icons update (Codex)

- **What changed:** Updated all six Quick Actions labels and matched each to a context-specific icon.
- **Files affected:** `index.html`, `Claude_Notes/charge-documentation.md`
- **New action mapping:**
  - `Transfer Money` -> `Quick Buy`
  - `Pay Bills` -> `Request Payout`
  - `Add Expense` -> `Enroll Member`
  - `Request Money` -> `Send Money`
  - `Schedule Pay` -> `Invoices`
  - `Add Beneficiary` -> `Rewards`
- **Accessibility detail:** Updated corresponding `aria-label` values to match the new action names.

### 2026-02-22 - Dashboard cards now consume Binary Tree summary metrics (Codex)

- **What changed:** Wired dashboard KPI values and server cut-off leg BV values to Binary Tree-derived metrics (mock data flow).
- **Files affected:** `index.html`, `binary-tree.mjs`, `Claude_Notes/charge-documentation.md`
- **Data mapping now in place:**
  - `Personal Volume` card -> root account personal volume (`leftPersonalPv + rightPersonalPv`).
  - `Cycles` card -> root account total cycles from start (`root.cycles`).
  - `Server Cut-Off` `Left Leg BV` / `Right Leg BV` -> root node `leftPv` / `rightPv`.
  - `Estimated Cycles` in the cut-off card remains derived from lower leg BV and configured cycle BV.
- **Tech details:**
  - Added exported helper `summarizeBinaryTreeData(...)` in `binary-tree.mjs`.
  - Added controller method `getDashboardSummary()` and event emit `binary-tree-summary-updated` on data/cycle updates.
  - Updated `index.html` to preload tree summary data, hydrate dashboard cards, and keep server cut-off BV values updateable via a dedicated updater function.
- **Validation performed:**
  - `node --check binary-tree.mjs`
  - `node --input-type=module -e "import('./binary-tree.mjs')...summarizeBinaryTreeData(...)"`

### 2026-02-22 - Budget Progress replaced with Account Overview / Organization Summary (Codex)

- **What changed:** Replaced the `Budget Progress` module with an `Account Overview` / `Your Organization Summary` component showing organization-first account stats.
- **Files affected:** `index.html`, `binary-tree.mjs`, `Claude_Notes/charge-documentation.md`
- **New summary stats in dashboard module:**
  - `Account Rank`
  - `Total Accumulated PV`
  - `New Members Joined Your Network/Organization`
  - `Total Direct Sponsors`
- **Data wiring updates:**
  - Extended Binary Tree summary payload to include:
    - `accountRank`
    - `totalAccumulatedPv`
    - `newMembersJoined`
    - `totalDirectSponsors`
  - Updated the existing dashboard summary binder in `index.html` to hydrate all four new stats from connected Binary Tree summary data.
- **Mock computation behavior (current phase):**
  - `Total Accumulated PV` = sum of personal PV across all normalized tree nodes.
  - `New Members Joined` = all non-root members currently loaded in the organization tree.
  - `Total Direct Sponsors` = count of members whose `sponsorId` equals the root account.
  - `Account Rank` = root node `rank` if present, otherwise fallback to `Legacy`.
- **Validation performed:**
  - `node --check binary-tree.mjs`

### 2026-02-22 - Account Overview card visual enhancement (icons + trend badges) (Codex)

- **What changed:** Enhanced all four `Account Overview` stat cards with contextual icons and trend-style badges (`+%` tags) to match KPI card language used across dashboard.
- **Files affected:** `index.html`, `Claude_Notes/charge-documentation.md`
- **UI enhancements added:**
  - Top-row icon chip per stat card.
  - Right-aligned trend badges (examples: `+2%`, `+3.4%`, `+12%`, `+5%`).
  - Short descriptive helper text under each stat value.
- **Design decision:** Kept existing stat IDs and data-binding hooks unchanged, so Binary Tree summary hydration continues to work without JS changes.

### 2026-02-22 - Account Overview action buttons added (Codex)

- **What changed:** Added two new action buttons inside the `Account Overview` component for performance-focused workflows.
- **Files affected:** `index.html`, `Claude_Notes/charge-documentation.md`
- **Buttons added:**
  - `Account Performance Graph` (`#account-performance-graph-button`)
  - `Improve Your Performance` (`#improve-performance-button`)
- **Content intent captured in UI copy:**
  - Performance graph emphasizes sales-first weighting plus direct sponsor and activity trend context.
  - Improve button focuses on tips/techniques to increase sales and overall performance.
- **Design details:** Buttons use existing motion, focus, hover, and border patterns for visual consistency with current dashboard controls.

### 2026-02-22 - Account Overview action buttons refined (neutral style + embedded graphs) (Codex)

- **What changed:** Refined both Account Overview action buttons to a neutral visual style and embedded compact preview graphs directly inside each button.
- **Files affected:** `index.html`, `Claude_Notes/charge-documentation.md`
- **Refinements applied:**
  - Removed brand-accent button treatment from both actions (no primary brand-fill CTA styling in these two controls).
  - Added miniature graph previews:
    - `Account Performance Graph`: mixed bar+line sales-weighted trend visual with summary footer (`Sales Focus`, `Weighted 72%`).
    - `Improve Your Performance`: rising trendline with milestone markers and summary footer (`Suggested Actions`, `4 priority tips`).
  - Replaced bright trend chips with neutral contextual tags (`Performance`, `Coaching`).
- **Design intent:** Make both actions feel analytic and advisory first, while keeping hierarchy, readability, and current interaction states.

### 2026-02-22 - Account Overview buttons replaced with Fast Track Bonus card (Codex)

- **What changed:** Removed the two Account Overview action buttons and replaced that area with a new `Fast Track Bonus` card.
- **Files affected:** `index.html`, `Claude_Notes/charge-documentation.md`
- **Card content added:**
  - Title: `Fast Track Bonus`
  - Value: `$100` (`#fast-track-bonus-value`)
  - Description: commission accumulation on member enrollment, with rank-based percentage from enrollment package checkout.
- **Implementation detail:** Added container `#fast-track-bonus-card` and removed:
  - `#account-performance-graph-button`
  - `#improve-performance-button`

### 2026-02-22 - Fast Track Bonus visual refresh + Request Payout action (Codex)

- **What changed:** Enhanced the new `Fast Track Bonus` card with richer visuals and added an in-card payout action button.
- **Files affected:** `index.html`, `Claude_Notes/charge-documentation.md`
- **UI updates:**
  - Added icon-led header treatment and upgraded card shell (gradient tint + stronger hierarchy).
  - Added status chip (`Available`) and larger value presentation for `$100`.
  - Added `Request Payout` button (`#fast-track-request-payout-button`) directly in the card.
- **Content preserved:** Existing fast-track logic description remains intact (rank-based enrollment commission percentage at checkout).
- **Copy tweak:** Updated subtitle text from `Rank-based enrollment commission pool` to `Rank-based enrollment commission`.

### 2026-02-22 - Enroll Member sidebar module + JSON registration persistence (Codex)

- **What changed:** Added a full `Enroll Member` sidebar page with registration form, Fast Track preview, and recent registration feed, then connected it to JSON-backed local persistence.
- **Files affected:** `index.html`, `serve.mjs`, `registered-members.json`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`
- **Routing and navigation updates:**
  - Wired sidebar `Enroll Member` into member page routing (`data-page="enroll-member"`, path `/EnrollMember`).
  - Added quick-action button navigation hook (`#quick-action-enroll-member`) to open the same page.
- **Fast Track logic updates:**
  - Implemented package/tier matrix mapping based on `brand_assets/MLM Business Logic.md` values:
    - Enrollment packages: Personal/Business/Infinity/Legacy Builder
    - Tiers: Personal/Business/Infinity/Legacy Pack
  - Added live preview panel for package price + projected Fast Track credit before submit.
  - On successful registration, the credited amount is added to `#fast-track-bonus-value` (base balance + accrued credits).
- **Persistence and API details:**
  - Added local API endpoint in `serve.mjs`:
    - `GET /api/registered-members`
    - `POST /api/registered-members`
  - Server-side POST computes canonical Fast Track credit from package+tier (does not trust client-calculated bonus).
  - New registrations are appended to `registered-members.json`.
  - Added `PORT` env override support in `serve.mjs` for local multi-instance testing (`process.env.PORT`).
- **Dashboard metric binding updates:**
  - `New Members Joined` and `Total Direct Sponsors` now include newly registered sponsor-line members from the enrollment JSON feed in addition to Binary Tree base summary values.
  - Added enrollment record feed rendering with date, package, tier, placement leg, and credited bonus amount.
- **Validation performed:**
  - `node --check serve.mjs`
  - Inline script syntax parse for `index.html` bottom script block using `vm.Script(...)`
  - Runtime API smoke check on isolated port (`PORT=3001`): GET returned `200`, POST returned `201`, Fast Track bonus value validated (`56` for Business Builder + Infinity Pack)

### 2026-02-22 - Enroll Member polish: auto-tier, spillover mode, and child type-ahead (Codex)

- **What changed:** Refined the Enroll Member workflow so Fast Track tier is rank-driven and spillover placements require a valid receiving parent reference from existing child records.
- **Files affected:** `index.html`, `serve.mjs`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`
- **Enroll form behavior updates:**
  - Replaced editable `Your Fast Track Tier` select with an auto-applied tier field + hidden value input.
  - Added rank-to-tier auto mapping logic and auto-sync:
    - `Legacy/Crown/Black Diamond` families -> `Legacy Pack`
    - `Diamond/Sapphire/Infinity` families -> `Infinity Pack`
    - `Ruby/Emerald/Business` families -> `Business Pack`
    - fallback -> `Personal Pack`
  - Added `Spillover` option in placement mode.
  - Added conditional spillover field: `Receiving Parent ID or Sponsor Username`.
- **Type-ahead and validation updates:**
  - Added `datalist` type-ahead suggestions for spillover target input.
  - Suggestions merge direct-child references from:
    - Binary Tree direct sponsor-line children (member code + node id)
    - Registered direct children from `registered-members.json` (username + registration id)
  - Client validation now blocks spillover submissions if target is empty or not found in known child references (when list is available).
- **Server/API updates:**
  - `POST /api/registered-members` now accepts and persists:
    - `placementLeg` including `spillover`
    - `spilloverParentReference`
    - `isSpillover` derived flag
  - Added server-side requirement: spillover submissions without receiving parent reference return `400`.
- **Rendering updates:**
  - Enrollment feed now displays spillover placement context as `Spillover -> {parentRef}`.
  - Direct-child suggestion list refreshes whenever Binary Tree summary or enrollment data updates.
- **Validation performed:**
  - `node --check serve.mjs`
  - Inline script syntax parse for `index.html` bottom script block using `vm.Script(...)`
  - API smoke checks on isolated port (`PORT=3001`):
    - invalid spillover (missing parent) -> `400`
    - valid spillover (with parent) -> `201`

### 2026-02-22 - Enroll Member polish v2: spillover side + custom parent picker UI (Codex)

- **What changed:** Extended spillover placement detail and replaced the browser datalist with a custom results component aligned with the app's advanced-search style.
- **Files affected:** `index.html`, `serve.mjs`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`
- **UI updates in enroll form:**
  - Added explicit spillover side control (`Spillover Left` / `Spillover Right`) shown only when `Placement Leg = Spillover`.
  - Replaced native datalist parent lookup with a custom suggestions shell:
    - result count line
    - scrollable result buttons
    - click-to-select parent reference
  - Custom suggestion panel now opens on focus/input and closes on blur/select.
- **Behavior updates:**
  - Spillover mode now requires both:
    - receiving parent reference
    - side selection (left/right; defaults to left)
  - Enrollment feed now displays spillover detail as:
    - `Spillover LEFT -> {parentRef}` or `Spillover RIGHT -> {parentRef}`
- **Server updates:**
  - `POST /api/registered-members` now persists `spilloverPlacementSide` when placement mode is spillover.
  - Existing spillover parent required validation remains server-enforced.
- **Validation performed:**
  - `node --check serve.mjs`
  - Inline script syntax parse for `index.html` bottom script block using `vm.Script(...)`
  - API smoke checks on isolated port (`PORT=3001`):
    - invalid spillover without parent -> `400`
    - valid spillover with parent + `spilloverPlacementSide: right` -> `201`

### 2026-02-22 - Enroll Member polish v3: show all receiving-parent matches (Codex)

- **What changed:** Removed the 12-result cap in the custom spillover receiving-parent results list.
- **Files affected:** `index.html`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`
- **Behavior update:**
  - The custom parent picker now renders all matching child references for the current query instead of truncating to 12.
- **Validation performed:**
  - Inline script syntax parse for `index.html` bottom script block using `vm.Script(...)`

### 2026-02-22 - Member onboarding auth flow: random password + setup-link activation (Codex)

- **What changed:** Added a mock onboarding auth lifecycle where newly enrolled members receive a one-time setup link and must create their own password before login.
- **Files affected:** `serve.mjs`, `index.html`, `login.html`, `password-setup.html`, `mock-users.json`, `password-setup-tokens.json`, `mock-email-outbox.json`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`
- **Enrollment/API behavior updates:**
  - `POST /api/registered-members` now also:
    - creates a member user account in `mock-users.json`
    - generates a random temporary password
    - sets `passwordSetupRequired: true`
    - issues a one-time setup token (TTL 48 hours)
    - queues a mock email record in `mock-email-outbox.json`
    - returns `passwordSetupLink` and related setup metadata in enrollment response
  - Added token store file `password-setup-tokens.json`.
- **New auth endpoints:**
  - `POST /api/member-auth/login`
    - returns `403` with `code: PASSWORD_SETUP_REQUIRED` when account setup is pending
  - `GET /api/member-auth/setup-password?token=...`
    - validates token status (missing/invalid/used/expired)
  - `POST /api/member-auth/setup-password`
    - enforces password rule (min 8 + upper/lower/number/symbol)
    - marks account active and consumes setup token(s)
  - `GET /api/mock-email-outbox`
    - exposes queued mock email entries for local testing
- **Frontend updates:**
  - `index.html` enroll success state now surfaces a mock setup link (`#enroll-member-password-setup-link`) for local verification.
  - `login.html` now authenticates against `/api/member-auth/login` instead of client-side matching from static JSON.
  - Added `password-setup.html` page where members open the tokenized link and create their own password.
- **Validation performed:**
  - `node --check serve.mjs`
  - Inline script syntax parse using `vm.Script(...)` for:
    - `index.html`
    - `login.html`
    - `password-setup.html`
  - End-to-end API smoke flow on isolated port (`PORT=3001`):
    - register member -> `201` (setup link generated)
    - login before setup -> `403 PASSWORD_SETUP_REQUIRED`
    - setup token validate -> `200`
    - setup password submit -> `200`
    - login after setup -> `200`
    - mock email outbox confirms queued message
  - Restored JSON seed files after verification.

### 2026-02-22 - Test baseline reset: binary root-only + data flush (Codex)

- **What changed:** Reset local mock persistence and binary tree initialization so testing can start from a zero-member baseline.
- **Files affected:** `index.html`, `admin.html`, `registered-members.json`, `mock-users.json`, `password-setup-tokens.json`, `mock-email-outbox.json`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`
- **Reset actions performed:**
  - Flushed member persistence stores:
    - `registered-members.json` -> `{ "members": [] }`
    - `mock-users.json` -> `{ "users": [] }`
    - `password-setup-tokens.json` -> `{ "tokens": [] }`
    - `mock-email-outbox.json` -> `{ "emails": [] }`
  - Updated both member and admin binary-tree initializers (`resolveInitialTreeNodeCount`) to return `1`, which renders only the root node and keeps base organization counters at `0` joined members.
- **Validation performed:**
  - Parsed all reset JSON files with Node to confirm valid JSON payloads.
  - Verified both `index.html` and `admin.html` contain the root-only node count return path.
- **Known limitation:** Browser-local state (for example local/session storage auth keys and view state) is client-side and not reset by these file updates.

### 2026-02-22 - Admin shell sync with client app pages (dashboard + enroll + binary) (Codex)

- **What changed:** Synced `admin.html` to the latest client-side app shell so admin now uses the updated Dashboard layout and includes the full `Enroll Member` and `Binary Tree` pages/logic in one place.
- **Files affected:** `admin.html`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`
- **Admin updates applied:**
  - Replaced admin dashboard wrapper content with current client wrapper content (including:
    - `page-dashboard`
    - `page-enroll-member`
    - `page-binary-tree`
    - `page-my-store`)
  - Ported the client runtime module block into the authenticated admin branch, including:
    - enroll-member API workflow (`/api/registered-members`)
    - binary-tree summary + page initialization
    - fast-track preview and registration feed behavior
  - Kept admin auth/session flow intact (`mock-admin-users.json` login shell + admin storage keys).
  - Scoped admin navigation routes to `/admin/...` paths so route refresh remains inside `admin.html`.
  - Preserved admin logout behavior as in-shell session clear + reload.
- **Validation performed:**
  - Parsed the final inline runtime script in `admin.html` with `vm.Script(...)`.
  - Verified key runtime hooks are present in `admin.html`:
    - `REGISTERED_MEMBERS_API`
    - `loadRegisteredMembers(...)`
    - `handleEnrollMemberSubmit(...)`
    - `initEnrollMemberModule(...)`
    - `ensureBinaryTreeSummaryReady(...)`
  - Verified admin-scoped route map entries:
    - `/admin/dashboard`
    - `/admin/MyStore`
    - `/admin/EnrollMember`
    - `/admin/BinaryTree`

### 2026-02-22 - Admin enrollment mode: placement-only, no Fast Track payout (Codex)

- **What changed:** Updated admin enrollment behavior so admin can place members for company/root tree setup without earning Fast Track credit.
- **Files affected:** `admin.html`, `serve.mjs`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`
- **Admin behavior updates:**
  - Admin enroll form now uses admin-only endpoint:
    - `REGISTERED_MEMBERS_API = '/api/admin/registered-members'`
  - Admin enroll success feedback no longer reports Fast Track credit.
  - Fast Track visuals in admin were updated to reflect placement-only mode:
    - dashboard card copy now states Fast Track is disabled for admin enrollments
    - base displayed value set to `$0.00`
    - enroll preview bonus renders `0` in admin mode
  - Spillover parent restriction to known direct-child suggestions is bypassed in admin mode (manual placement reference allowed).
- **Server/API updates:**
  - Added admin-only registration API route:
    - `GET /api/admin/registered-members`
    - `POST /api/admin/registered-members`
  - Added admin cookie/session gate for that route:
    - reads `vault-admin-auth-user-cookie`
    - verifies user against `mock-admin-users.json`
  - Admin-created member records are marked with:
    - `enrollmentContext: 'admin'`
    - `isAdminPlacement: true`
  - Admin enrollments force `fastTrackBonusAmount = 0`.
  - Existing member endpoint `/api/registered-members` remains unchanged for member-side bonus flow.
- **Validation performed:**
  - `node --check serve.mjs`
  - Inline runtime parse for `admin.html` via `vm.Script(...)`
  - Grep verification for admin endpoint wiring and no-credit logic in both files.

### 2026-02-22 - Member login UI cleanup: demo credentials removed (Codex)

- **What changed:** Removed the visible `Demo login` credential text from the member login page for a cleaner sign-in card.
- **Files affected:** `login.html`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`
- **UI update details:**
  - Removed line: `Demo login: alexm / Demo1234!`
  - Kept the `Mock auth source` info line in place.
- **Validation performed:**
  - Inline runtime parse for `login.html` via `vm.Script(...)`
  - Verified no `Demo login` text remains in `login.html`

### 2026-02-22 - Member login placeholder cleanup (Codex)

- **What changed:** Replaced the member identifier input placeholder with cleaner copy.
- **Files affected:** `login.html`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`
- **UI update details:**
  - `placeholder="alexm or alex@ldpremiere.com"` -> `placeholder="Enter your username or email"`
- **Validation performed:**
  - Inline runtime parse for `login.html` via `vm.Script(...)`
  - Verified updated placeholder string exists in `login.html`

### 2026-02-22 - Admin enroll payload error hardening (Codex)

- **What changed:** Fixed API fallback behavior and improved admin enroll error messaging to prevent misleading `response payload is invalid` failures.
- **Files affected:** `serve.mjs`, `admin.html`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`
- **Server fix applied:**
  - Unknown API routes now return JSON `404` instead of HTML page fallback.
  - Added guard in static fallback branch:
    - if path starts with `/api/` -> `sendJson(404, { error: 'API endpoint not found.' })`
- **Admin UI fix applied:**
  - In admin enroll submit flow, when a success response lacks `member`, the handler now checks response content type.
  - If API returns non-JSON content, admin now shows actionable error:
    - `Enrollment API returned a non-JSON response. Restart your local server and retry.`
- **Validation performed:**
  - `node --check serve.mjs`
  - Inline runtime parse for `admin.html` via `vm.Script(...)`
  - Runtime smoke test confirms unknown API returns `404` JSON payload (not HTML fallback).

### 2026-02-22 - Enrollment BV preview + starter dashboard metric flush (Codex)

- **What changed:** Added package BV to enroll preview and forced starter dashboard card values for newly enrolled accounts using session profile fields.
- **Files affected:** `index.html`, `admin.html`, `login.html`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`
- **UI/logic updates applied:**
  - Enroll preview now includes `Package BV` row in both member and admin shells.
  - Fast Track package metadata now carries `bv` alongside `price`.
  - Added `getFastTrackPackageBv(...)` helper and bound preview value to selected package.
  - Added login-time starter profile hydration fallback:
    - when `/api/member-auth/login` user payload lacks starter fields, login attempts to resolve the member from `registered-members` data and infers package BV/PV baseline.
  - Added starter session metric resolver:
    - `enrollmentPackageBv`
    - `starterPersonalPv`
    - `starterTotalCycles`
  - Dashboard metric binding now separates personal and organization logic:
    - `Personal Volume` remains personal-only and comes from starter PV profile data.
    - Organization summary remains binary/BV-driven (`cycles`, network counters, and cut-off leg computations).
    - Account overview metric label updated to `Total Organization BV` and value uses `leftLegBv + rightLegBv`.
- **Validation performed:**
  - `node --check serve.mjs`
  - Inline runtime parse for `index.html`, `admin.html`, and `login.html` via `vm.Script(...)`

### 2026-02-22 - Admin binary tree enrollment connectivity fix (Codex)

- **What changed:** Fixed admin binary view so enrolled members are actually injected into tree data and rendered as connected nodes.
- **Files affected:** `admin.html`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`
- **Fix details:**
  - Added a new admin-side tree data builder from `registeredMembers` records.
  - Added placement-aware insertion logic:
    - direct placement: left/right under root branch
    - spillover placement: resolves receiving parent reference + side and places into first available slot in that subtree
  - Added BV mapping for each enrolled member node from package metadata/record (`packageBv`) into personal volume seed used by binary propagation logic.
  - Added live tree sync hook:
    - on successful `loadRegisteredMembers()`
    - immediately after successful enrollment submit
  - Sync updates both dashboard summary metrics and rendered tree controller data (with optional fit refresh).
- **Validation performed:**
  - Inline runtime parse for `admin.html`, `index.html`, and `login.html` via `vm.Script(...)`
  - `node --check serve.mjs`

### 2026-02-22 - Admin settings flush-all data control (Codex)

- **What changed:** Added an admin settings page with a single button to flush all mock data and reset dashboard metric cards.
- **Files affected:** `admin.html`, `serve.mjs`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`
- **UI updates applied (`admin.html`):**
  - Added new routed page section:
    - `page-settings`
  - Converted sidebar `Settings` link into routed nav item:
    - `data-nav-link` + `data-page="settings"`
    - route `/admin/Settings`
  - Added `Danger Zone` action button:
    - `#settings-flush-all-data-button`
    - status feedback text `#settings-flush-all-data-feedback`
  - Added dashboard total-balance value id for scripted reset:
    - `#dashboard-total-balance-value`
  - Added flush workflow in runtime:
    - calls `POST /api/admin/reset-all-data`
    - resets local registered member state, tree state, cutoff metrics, and target dashboard cards to zero baseline
- **Server updates applied (`serve.mjs`):**
  - Added admin-protected endpoint:
    - `POST /api/admin/reset-all-data`
  - Endpoint requires valid admin cookie/session identity.
  - Endpoint clears all target mock stores and returns cleared record counts.
- **Validation performed:**
  - `node --check serve.mjs`
  - Inline runtime parse for `admin.html`, `index.html`, and `login.html` via `vm.Script(...)`

### 2026-02-22 - User-side flush coverage + dynamic Fast Track baseline (Codex)

- **What changed:** Extended admin flush behavior to clear user-side browser state on this device, and removed static Fast Track baseline behavior from member dashboard.
- **Files affected:** `admin.html`, `index.html`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`
- **User-side flush update (`admin.html`):**
  - Added member-state clearing utility in admin runtime:
    - local/session: `vault-auth-user`
    - cookie: `vault-auth-user-cookie`
    - local: `charge-dashboard-view-state`
    - local: `charge-binary-tree-ui-state-v1`
  - Flush confirmation UI copy now explicitly states member-side browser state clearing.
  - Flush success feedback now confirms user-side browser cache/session clear on current device.
- **Fast Track dynamic update (`index.html`):**
  - Updated card default display:
    - `#fast-track-bonus-value` from `$100` to `$0.00`
  - Updated runtime base-balance source:
    - now resolves from `currentSessionUser.fastTrackBonusBalance` when present, otherwise `0`
    - removes dependency on static DOM seed value
  - Existing accrued Fast Track computation remains data-driven from `registered-members` by current sponsor username.
- **Validation performed:**
  - `node --check serve.mjs`
  - Inline runtime parse for `admin.html`, `index.html`, and `login.html` via `vm.Script(...)`

### 2026-02-22 - User dashboard total balance baseline set to zero (Codex)

- **What changed:** Set user-side `Total Balance` card baseline display to `$0.00`.
- **Files affected:** `index.html`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`
- **Notes:**
  - This is a display baseline update only.
  - Full commission-to-total-balance wallet wiring can be layered next.
- **Validation performed:**
  - Inline runtime parse for `index.html`, `admin.html`, and `login.html` via `vm.Script(...)`

### 2026-02-22 - User account rank card dynamic + 30-day activity badge (Codex)

- **What changed:** Updated user-side Account Overview rank card to use dynamic rank and replaced static `+2%` badge with `Active/Inactive` purchase recency state.
- **Files affected:** `index.html`, `login.html`, `serve.mjs`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`
- **UI/runtime updates (`index.html`):**
  - Rank badge now uses element id:
    - `#account-rank-activity-badge`
  - Added session rank resolver:
    - `resolveSessionAccountRank(user)`
  - Added purchase-activity state resolver:
    - `resolveAccountRankActivityState(user)`
    - active window: `30 days`
  - Badge now renders:
    - `Active` (success styles) if purchase within 30 days
    - `Inactive` (danger styles) if no recent purchase
  - Account rank display now prioritizes authenticated user rank fields over mock tree fallback rank.
- **Auth/session payload updates:**
  - `serve.mjs` login sanitize response now includes:
    - `rank`, `accountRank`
    - `lastProductPurchaseAt`, `lastPurchaseAt`
  - New registered users now seed default rank metadata:
    - `rank: 'Starter'`, `accountRank: 'Starter'`
    - purchase timestamps default empty
  - `login.html` session persistence now stores these new fields for dashboard rendering.
- **Validation performed:**
  - `node --check serve.mjs`
  - Inline runtime parse for `index.html`, `login.html`, and `admin.html` via `vm.Script(...)`

### 2026-02-22 - Enrollment 30-day active window + purchase extension persistence (Codex)

- **What changed:** Implemented activity-window rules so new enrollees start active for 30 days and product purchases extend active duration by 30 days.
- **Files affected:** `serve.mjs`, `login.html`, `index.html`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`
- **Server updates (`serve.mjs`):**
  - Added `ACCOUNT_ACTIVITY_WINDOW_MS` constant (`30 days`).
  - Enrollment now seeds each new user with:
    - `activityActiveUntilAt = createdAt + 30 days`
  - Auth sanitize payload now includes:
    - `createdAt`
    - `activityActiveUntilAt`
  - Added purchase activity endpoint:
    - `POST /api/member-auth/record-purchase`
    - Resolves member by `userId`/`username`/`email`
    - Updates `lastProductPurchaseAt`, `lastPurchaseAt`
    - Extends `activityActiveUntilAt` by 30 days from the later of `now` or existing active-until timestamp
- **Login/session updates (`login.html`):**
  - Session persistence now stores:
    - `createdAt`
    - `activityActiveUntilAt`
- **User dashboard/store updates (`index.html`):**
  - Added `persistUserSessionSnapshot(...)` helper for in-place session refresh.
  - Activity badge resolver now uses:
    - `activityActiveUntilAt` first
    - fallback to enrollment/purchase timestamps for legacy records
  - My Store checkout flow now calls `POST /api/member-auth/record-purchase` after successful invoice creation.
  - Returned user payload is merged into current session and immediately re-renders `Active/Inactive` state.
- **Validation performed:**
  - `node --check serve.mjs`
  - Inline runtime parse for `index.html`, `login.html`, and `admin.html` via `vm.Script(...)`

### 2026-02-22 - User sidebar navigation runtime hotfix (Codex)

- **What changed:** Fixed a runtime ordering issue in the user dashboard script that prevented sidebar navigation from working.
- **Files affected:** `index.html`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`
- **Root cause:**
  - `renderAccountRankActivityBadge(currentSessionUser)` was executed before `accountRankActivityBadgeElement` was initialized.
  - This could throw a `ReferenceError` (TDZ on `const`) and stop subsequent nav event binding.
- **Fix applied (`index.html`):**
  - Removed the early badge render call near session bootstrap.
  - Re-ran the initial badge render only after activity badge element/constants/functions are initialized.
- **Validation performed:**
  - Inline script parse for `index.html` via `vm.Script(...)`
  - Verified `renderAccountRankActivityBadge(currentSessionUser)` now appears only in safe positions after badge setup.

### 2026-02-22 - User binary tree enrollment visibility sync fix (Codex)

- **What changed:** Wired user-side binary tree to sync from registered enrollment records so newly enrolled left/right members appear in the user tree immediately.
- **Files affected:** `index.html`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`
- **Root cause:**
  - User shell was still initializing binary data from root-only mock seed (`targetNodes = 1`) and did not rebuild tree from `registeredMembers`.
  - Result: enroll records existed in JSON but tree stayed root-only or stale.
- **Fix applied (`index.html`):**
  - Added member-side tree data builders:
    - `createBinaryTreeMemberNodeId(...)`
    - `createBinaryTreeDataFromRegisteredMembers(...)`
    - `syncBinaryTreeFromRegisteredMembers(...)`
  - Tree sync now runs:
    - after `loadRegisteredMembers()` success and fallback paths
    - immediately after successful enroll submit (`forceFit: true`)
  - Root is now the signed-in member context and placements are rebuilt from that sponsor’s enrolled member records.
- **Validation performed:**
  - Inline script parse for `index.html` via `vm.Script(...)`
  - `node --check serve.mjs`

### 2026-02-22 - Workflow rule: user-side changes require admin-side decision prompt (Codex)

- **What changed:** Added a standing workflow rule so every user-side update request must include an admin-side parity decision prompt.
- **Files affected:** `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`
- **Rule recorded:**
  - On user-side changes, ask owner if the same update should be applied to admin-side.
  - Apply admin-side changes only after explicit owner confirmation.
- **Operational effect:** prevents unintended admin-side drift or overreach and keeps parity changes owner-controlled per request.

### 2026-02-22 - User cycle rule update to 500/1000 BV split logic (Codex)

- **What changed:** Updated user-side cycle computation/display to use `500 BV` on one leg and `1,000 BV` on the other leg per cycle (either leg can be the 500 or 1,000 side).
- **Files affected:** `index.html`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`
- **User-side updates (`index.html`):**
  - Added cycle rule constants:
    - `CYCLE_RULE_LOWER_BV = 500`
    - `CYCLE_RULE_HIGHER_BV = 1000`
  - Updated Server Cut-Off Estimated Cycles formula:
    - now uses `min(lowerLeg/500, higherLeg/1000)` instead of lower-leg-only `/500`
  - Updated Server Cut-Off helper copy:
    - from lower-leg-only text to `500 / 1,000 BV split rule (either leg)`
  - Updated user dashboard `Cycles` card calculation to follow same 500/1000 split rule based on current left/right leg BV.
  - Updated user binary tree initialization payload cycle thresholds from old `100/200` to `500/1000`.
- **Validation performed:**
  - Inline script parse for `index.html` via `vm.Script(...)`
  - `node --check serve.mjs`

### 2026-02-22 - Admin parity applied: cycle rule update to 500/1000 BV split logic (Codex)

- **What changed:** Applied the same 500/1000 split-cycle rule update to admin-side dashboard and cut-off computation.
- **Files affected:** `admin.html`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`
- **Admin-side updates (`admin.html`):**
  - Added cycle rule constants:
    - `CYCLE_RULE_LOWER_BV = 500`
    - `CYCLE_RULE_HIGHER_BV = 1000`
  - Updated Server Cut-Off helper copy to `500 / 1,000 BV split rule (either leg)`.
  - Updated Server Cut-Off `Estimated Cycles` formula:
    - now uses `min(lowerLeg/500, higherLeg/1000)`
  - Updated dashboard `Cycles` card binding to use the same 500/1000 split-cycle calculation from current left/right leg BV.
  - Updated admin binary tree init + mock cycle thresholds from old `100/200` to `500/1000`.
- **Validation performed:**
  - Inline script parse for `admin.html`, `index.html`, and `login.html` via `vm.Script(...)`
  - `node --check serve.mjs`

### 2026-02-22 - User account overview percentage chips made dynamic (Codex)

- **What changed:** Replaced static Account Overview `%` chips with real previous-vs-current growth percentages.
- **Files affected:** `index.html`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`
- **User-side updates (`index.html`):**
  - Added trend badge ids:
    - `#account-overview-total-bv-trend`
    - `#account-overview-new-members-trend`
    - `#account-overview-direct-sponsors-trend`
  - Added persisted trend state storage:
    - key: `charge-account-overview-trend-v1`
    - scoped per current signed-in sponsor identity
  - Added runtime trend pipeline:
    - snapshot sanitize/parse/persist helpers
    - previous-vs-current percent computation
    - dynamic badge color state:
      - positive -> success
      - negative -> danger
      - zero -> info
  - Trend is rendered from live Account Overview values in `applyBinaryTreeDashboardSummary(...)` using:
    - `totalOrganizationBv`
    - `newMembers`
    - `totalDirectSponsors`
  - `renderOrganizationSummaryRollups()` now returns merged values so trend uses the exact displayed totals.
- **Validation performed:**
  - Inline script parse for `index.html` via `vm.Script(...)`
  - `node --check serve.mjs`

### 2026-02-22 - Trend direction arrows + admin parity for account overview chips (Codex)

- **What changed:** Added directional trend arrows for Account Overview percentage chips and applied the same dynamic trend system to admin-side.
- **Files affected:** `index.html`, `admin.html`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`
- **User-side update (`index.html`):**
  - Trend badge renderer now includes directional icon output:
    - up-right arrow for positive growth
    - down-left arrow for negative growth
    - right arrow for flat/no-change
  - Existing percentage and color logic is preserved.
- **Admin-side parity update (`admin.html`):**
  - Replaced static Account Overview `%` chips with dynamic trend badge ids:
    - `#account-overview-total-bv-trend`
    - `#account-overview-new-members-trend`
    - `#account-overview-direct-sponsors-trend`
  - Added admin trend state pipeline (snapshot sanitize/parse/persist, growth compute, color + icon render).
  - Added admin-scoped local storage key:
    - `charge-admin-account-overview-trend-v1`
  - `applyBinaryTreeDashboardSummary(...)` now renders trend badges using current organization summary totals.
  - `renderOrganizationSummaryRollups()` now returns merged metrics so displayed values and trend basis stay aligned.
- **Validation performed:**
  - Inline script parse for `index.html`, `admin.html`, and `login.html` via `vm.Script(...)`
  - `node --check serve.mjs`

### 2026-02-22 - Account Overview scope correction + double-count fix (Codex)

- **What changed:** Corrected Account Overview aggregation so counts are not doubled and organization scope follows sponsor hierarchy.
- **Files affected:** `index.html`, `admin.html`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`
- **Bug fix (`index.html`, `admin.html`):**
  - Fixed inflated counts on:
    - `New Members`
    - `Total Direct Sponsors`
  - Root cause was additive merge of:
    - binary summary counts
    - plus direct-member list count
  - Rollups now use summary values directly once summary is available, with a direct-count fallback only before summary is initialized.
- **Scope fix (`index.html`, `admin.html`):**
  - Added sponsor-network resolver:
    - `getOrganizationMembersForCurrentSponsor()`
  - Binary tree data hydration now uses sponsor hierarchy members (direct sponsors + their downline) instead of direct-only members on user shell and unscoped list on admin shell.
  - This aligns `Total Organization BV` and organization summary metrics with account-specific sponsor-network scope.
- **Validation performed:**
  - Inline script parse for `index.html`, `admin.html`, and `login.html` via `vm.Script(...)`
  - `node --check serve.mjs`

### 2026-02-22 - User binary root labeling + placement rule hardening (Codex)

- **What changed:** Updated user-side binary root presentation and replaced cycle slot with account-rank context, plus enforced non-admin spillover placement constraints at UI and API layers.
- **Files affected:** `index.html`, `binary-tree.mjs`, `serve.mjs`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`
- **User-side UI/runtime updates (`index.html`, `binary-tree.mjs`):**
  - Root node source data now sets:
    - `name: 'You'`
    - `memberCode: <current username>`
  - User binary init now opts into renderer mode:
    - `secondaryMetricMode: 'rank'`
  - Selected-node card label changed from `Cycles` to `Account Rank` (user shell).
  - Tree renderer mode support added:
    - `secondaryMetricMode: 'cycles' | 'rank'` (default remains `cycles`)
    - user mode renders `Rank ...` in node/search/selected secondary metric fields
    - cycle-based behavior remains default for shells not passing rank mode
  - Root-node visual treatment in rank mode now shows:
    - primary title: `You`
    - subtitle: `@<username>`
- **Placement rule hardening (`index.html`, `serve.mjs`):**
  - User enroll form now blocks spillover when no direct children exist.
  - User enroll form requires spillover target to match one of direct-child references.
  - Server now enforces for non-admin enrollments:
    - `sponsorUsername` is required
    - spillover target must match one of sponsor's existing direct children
    - reverse/upline spillover attempts are rejected with `400`
- **Validation performed:**
  - `node --check serve.mjs`
  - `node --check binary-tree.mjs`
  - Inline script parse for `index.html`, `admin.html`, and `login.html` via `vm.Script(...)`

### 2026-02-22 - Admin binary UX parity for root label and rank metric (Codex)

- **What changed:** Applied user-approved parity on admin binary presentation for root-node naming and secondary metric display.
- **Files affected:** `admin.html`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`
- **Admin-side updates (`admin.html`):**
  - Root binary node source data now sets:
    - `name: 'You'`
    - `memberCode: <current admin username>`
  - Added rank fallback on generated member nodes:
    - `rank: member.rank || member.accountRank || 'Starter'`
  - Selected-node detail card label changed from `Cycles` to `Account Rank`.
  - Admin binary init now passes:
    - `secondaryMetricMode: 'rank'`
  - Resulting renderer behavior on admin:
    - node/search/selected secondary metric now displays `Rank ...`
    - root node displays `You` with `@username` subtitle
- **Guardrail note:**
  - Admin placement permissions remain unrestricted by design (no new admin spillover lock was introduced).
- **Validation performed:**
  - `node --check serve.mjs`
  - `node --check binary-tree.mjs`
  - Inline script parse for `index.html`, `admin.html`, and `login.html` via `vm.Script(...)`

### 2026-02-22 - Route-safe binary module import hotfix (Codex)

- **What changed:** Fixed binary tree load failure on routed URLs by using absolute module import paths.
- **Files affected:** `admin.html`, `index.html`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`
- **Root cause:**
  - dynamic import used `./binary-tree.mjs`
  - on admin routes this can resolve as `/admin/binary-tree.mjs`, causing module load failure after cache/flush scenarios
- **Fix applied:**
  - updated binary module import to absolute path:
    - `import('/binary-tree.mjs')`
  - applied in both:
    - admin shell runtime
    - user shell runtime
- **Validation performed:**
  - `node --check serve.mjs`
  - `node --check binary-tree.mjs`
  - Inline script parse for `index.html`, `admin.html`, and `login.html` via `vm.Script(...)`

### 2026-02-22 - Route-safe Pixi asset load fix for binary renderer (Codex)

- **What changed:** Fixed renderer bootstrap failure caused by route-relative Pixi script path.
- **Files affected:** `admin.html`, `index.html`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`
- **Root cause:**
  - pages referenced Pixi as `./vendor/pixi.min.js`
  - on admin routed URLs, browser resolved this as `/admin/vendor/pixi.min.js` (missing), leaving `window.PIXI` undefined
  - binary module then showed `Unable to initialize tree renderer.`
- **Fix applied:**
  - updated Pixi script source to absolute path on both shells:
    - `/vendor/pixi.min.js`
- **Validation performed:**
  - `node --check serve.mjs`
  - `node --check binary-tree.mjs`
  - Inline script parse for `index.html`, `admin.html`, and `login.html` via `vm.Script(...)`

### 2026-02-22 - Sponsor-default binary placement correction (Codex)

- **What changed:** Corrected binary rebuild placement so standard member enrollments attach under sponsor/upline by default, not root.
- **Files affected:** `admin.html`, `index.html`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`
- **Root cause:**
  - in tree reconstruction, `requestedParentId` for non-spillover entries fell back to `rootId`.
  - this misattached second-level members to root in admin tree and flagged them as spillover incorrectly.
- **Fix applied (`admin.html`, `index.html`):**
  - compute `sponsorNodeId` before parent resolution in placement pass.
  - set default placement parent to `sponsorNodeId` for non-spillover.
  - keep explicit spillover parent when provided; if unresolved, fallback now uses `sponsorNodeId` (not root).
- **Validated against current dataset (`registered-members.json`):**
  - root keeps `sethfozz` as left direct
  - `seth` and `fozz` resolve as Seth's left/right children
  - admin root right leg no longer receives Seth downline by rebuild fallback
- **Validation performed:**
  - `node --check serve.mjs`
  - `node --check binary-tree.mjs`
  - Inline script parse for `index.html`, `admin.html`, and `login.html` via `vm.Script(...)`

### 2026-02-22 - Package-bound starting rank mapping for binary nodes (Codex)

- **What changed:** Replaced fallback rank placeholders with package-bound starting ranks and aligned binary node rank source to actual account data.
- **Files affected:** `serve.mjs`, `index.html`, `admin.html`, `binary-tree.mjs`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`
- **Business-rule alignment:**
  - Starting rank now binds to enrollment package:
    - `personal-builder-pack` -> `Personal Pack`
    - `business-builder-pack` -> `Business Pack`
    - `infinity-builder-pack` -> `Infinity Pack`
    - `legacy-builder-pack` -> `Legacy Pack`
- **Server updates (`serve.mjs`):**
  - Added `STARTING_RANK_BY_PACKAGE` mapping.
  - New enrollments now persist mapped starting rank into:
    - `mock-users.json` (`rank`, `accountRank`)
    - `registered-members.json` (`rank`, `accountRank`)
  - Added `GET /api/member-ranks` endpoint returning minimal rank-safe user projection for UI rank lookup.
- **User/admin runtime updates (`index.html`, `admin.html`):**
  - Added `MEMBER_RANKS_API = '/api/member-ranks'`.
  - Added rank lookup cache + loaders to resolve node rank from real account records.
  - Updated node rank resolution order:
    - explicit `accountRank`/`rank`
    - fallback to package-bound starting rank
  - Removed previous `Starter`/`Unranked` placeholder behavior for member nodes.
- **Renderer update (`binary-tree.mjs`):**
  - Rank label fallback is now `Personal Pack` (minimum package-bound start), not `Unranked`.
- **Validation performed:**
  - `node --check serve.mjs`
  - `node --check binary-tree.mjs`
  - Inline script parse for `index.html`, `admin.html`, and `login.html` via `vm.Script(...)`
  - Local data verification against current stores resolved:
    - `fozz -> Legacy Pack`
    - `seth -> Infinity Pack`
    - `sethfozz -> Legacy Pack`

### 2026-02-22 - Fast Track terminology rename to Infinity Pack (Codex)

- **What changed:** Replaced visible `Achievers Pack` terminology with `Infinity Pack` across member/admin flows and business-rule docs.
- **Files affected:** `serve.mjs`, `index.html`, `admin.html`, `brand_assets/MLM Business Logic.md`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`
- **Behavior notes:**
  - Fast Track tier UI label now shows `Infinity Pack`.
  - Package-bound starting rank mapping now resolves `infinity-builder-pack` to `Infinity Pack`.
  - Legacy stored rank values labeled `Achievers Pack` are normalized to `Infinity Pack` in API auth/rank responses and shell rank normalization.
- **Validation performed:**
  - `node --check serve.mjs`
  - Inline script parse for `index.html` and `admin.html` via `vm.Script(...)`

### 2026-02-22 - Binary node content standardization + country flag enrollment field (Codex)

- **What changed:** Updated binary node content layout across user/admin and added a required country flag field to enrollment.
- **Files affected:** `binary-tree.mjs`, `index.html`, `admin.html`, `serve.mjs`, `login.html`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`
- **Binary node display updates (`binary-tree.mjs`):**
  - Node card now presents:
    - display name
    - `@username`
    - `Active/Inactive`
    - `L` and `R` BV
    - `Account Rank`
    - `Country Flag`
  - Removed `Building` terminology from node/search labels (`Not Eligible` used instead).
  - Added `countryFlag` normalization in node model with default fallback flag.
- **Enrollment updates (`index.html`, `admin.html`, `serve.mjs`):**
  - Added required `Country Flag` select field to both enroll forms.
  - Enroll submit payload now sends `countryFlag`.
  - API validates and persists `countryFlag` to:
    - `mock-users.json`
    - `registered-members.json`
  - New records include `activityActiveUntilAt` and purchase fields in registration store for tree status rendering.
- **Activity sync update (`serve.mjs`):**
  - Purchase activity endpoint now updates both:
    - `mock-users.json`
    - matching `registered-members.json` records
  - Keeps child-node active/inactive status aligned with latest activity window.
- **Session update (`login.html`):**
  - Member auth session now retains `countryFlag` for root-node display.
- **Validation performed:**
  - `node --check serve.mjs`
  - `node --check binary-tree.mjs`
  - Inline script parse for `index.html`, `admin.html`, and `login.html` via `vm.Script(...)`

### 2026-02-22 - Node flag icon-only placement update (Codex)

- **What changed:** Adjusted binary node flag visual to icon-only and moved it to the bottom-right position (replacing the prior eligibility/building slot).
- **Files affected:** `binary-tree.mjs`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`
- **UI updates (`binary-tree.mjs`):**
  - Node card flag text changed from `Flag <icon>` to `<icon>` only.
  - Flag anchor/position moved to bottom-right corner area inside node card.
  - Search result chip flag text changed to icon-only.
- **Validation performed:**
  - `node --check binary-tree.mjs`
  - Inline script parse for `index.html` and `admin.html` via `vm.Script(...)`

### 2026-02-22 - flag-icons integration + binary node UI spacing optimization (Codex)

- **What changed:** Installed and integrated `flag-icons`, standardized country flag values to ISO codes, and optimized binary node spacing/layout for a cleaner, less cramped presentation.
- **Files affected:** `package.json`, `package-lock.json`, `index.html`, `admin.html`, `serve.mjs`, `binary-tree.mjs`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`
- **Package/runtime integration:**
  - Installed dependency: `flag-icons`.
  - Added stylesheet include on both shells:
    - `/node_modules/flag-icons/css/flag-icons.min.css`
- **Country flag data normalization:**
  - Country value now normalized to ISO alpha-2 code in server and shell mappers.
  - Backward compatibility mapping retained for previously stored emoji values.
  - Enroll Member country select options now submit ISO codes (`us`, `ph`, etc.).
- **Binary node UI optimization (`binary-tree.mjs`):**
  - Increased node dimensions and vertical spacing for better readability.
  - Increased layout depth spacing and horizontal width budget to reduce card collisions.
  - Added subtle card divider line for visual hierarchy.
  - Replaced text flag rendering with actual `flag-icons` SVG sprite in bottom-right node slot.
  - Search results now show flag icon using `fi fi-<code>` classes.
- **Validation performed:**
  - `node --check serve.mjs`
  - `node --check binary-tree.mjs`
  - Inline script parse for `index.html`, `admin.html`, and `login.html` via `vm.Script(...)`

### 2026-02-22 - Binary node font size increase (Codex)

- **What changed:** Increased node text sizes and adjusted vertical text spacing for clearer readability while keeping layout clean.
- **Files affected:** `binary-tree.mjs`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`
- **Renderer updates (`binary-tree.mjs`):**
  - `titleStyle.fontSize`: `13 -> 16`
  - `detailStyle.fontSize`: `10 -> 12`
  - `chipStyle.fontSize`: `10 -> 11`
  - Repositioned text rows to avoid overlap after size increase:
    - username row lowered
    - leg BV row lowered
    - account rank row lowered
- **Validation performed:**
  - `node --check binary-tree.mjs`

### 2026-02-22 - Username-to-divider spacing correction in node cards (Codex)

- **What changed:** Corrected node vertical spacing so the username row no longer touches the separator line.
- **Files affected:** `binary-tree.mjs`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`
- **Renderer updates (`binary-tree.mjs`):**
  - Divider Y-position moved lower to create clear breathing room under `@username`.
  - Divider left/right coordinates aligned with text content padding.
  - BV and Account Rank row offsets were adjusted to preserve balanced spacing after divider shift.
- **Validation performed:**
  - `node --check binary-tree.mjs`

### 2026-02-22 - Node rank text compacting (Codex)

- **What changed:** Removed `Account Rank:` prefix from node secondary text and kept rank value only to save node space.
- **Files affected:** `binary-tree.mjs`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`
- **Renderer update (`binary-tree.mjs`):**
  - In rank mode, secondary metric text now renders as:
    - `<rank>`
  - Previous format:
    - `Account Rank: <rank>`
- **Validation performed:**
  - `node --check binary-tree.mjs`

### 2026-02-22 - Root node rank binding correction (Codex)

- **What changed:** Root-node rank resolution was corrected to pull from authenticated rank fields before UI fallback values.
- **Files affected:** `index.html`, `admin.html`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`
- **Fix details:**
  - Added explicit root-rank resolver in both shells:
    - session `rank/accountRank` -> current in-memory rank -> fallback
  - Seeded `currentAccountRank` from session rank at initialization when available.
  - Root node creation now uses resolver output instead of raw `currentAccountRank || 'Legacy'`.
- **Validation performed:**
  - Inline script parse for `index.html` and `admin.html` via `vm.Script(...)`
  - `node --check binary-tree.mjs`
  - `node --check serve.mjs`

### 2026-02-22 - Selected node country-code field added (Codex)

- **What changed:** Added a `Country Code` field to the Selected Node panel and wired it to selected node data.
- **Files affected:** `index.html`, `admin.html`, `binary-tree.mjs`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`
- **UI updates (`index.html`, `admin.html`):**
  - Added panel element:
    - `#tree-selected-country-code`
- **Renderer/controller updates (`binary-tree.mjs`):**
  - Added config hook:
    - `selectedCountryCodeId`
  - Added selected-panel binding and reset behavior for country code.
  - Selected node now renders country code as uppercase ISO text using normalized node country data.
- **Validation performed:**
  - `node --check binary-tree.mjs`
  - Inline script parse for `index.html` and `admin.html` via `vm.Script(...)`

---

## Known Limitations / Future Work

- Sidebar toggle uses minimal vanilla JS (no framework)
- Binary tree currently uses mock JSON data and does not fetch from backend services
- Cycle rule thresholds are code-configurable but not yet user-editable in UI
- Advanced search sort depends on mock/fallback `addedAt` timestamps until real member creation dates are provided
- Member URL routing is currently wired for `Dashboard`, `My Store`, and `Binary Tree`; remaining member sidebar links are still placeholders
- Admin URL routing is currently wired for `Dashboard` and `Product Management` only; additional admin sidebar modules are pending
- My Store binding attribution states (store code capture, invoice linking, revenue/BP credits) are currently static mock values
- My Store checkout/cart and invoice creation are UI-state only (no server-side order, payment, inventory, or persistence)
- Admin login is mock-auth only (`mock-admin-users.json`) with no backend RBAC/token issuance yet
- Puppeteer path in CLAUDE.md references `C:/Users/nateh/` â€” may need updating for this machine
- `brand_assets/` folder does not exist yet â€” no brand materials provided
- Ongoing roadmap and owner scope-gate tracking moved to `Claude_Notes/Current Project Status.md` (2026-02-22).


### 2026-02-22 - Node L/R label formatting and spacing adjustment (Codex)

- **What changed:** Updated L/R BV labels to colon format and rebalanced row spacing for clearer separation.
- **Files affected:** `binary-tree.mjs`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`
- **Renderer updates (`binary-tree.mjs`):**
  - Node leg row now renders as:
    - `L: <value> BV`
    - `R: <value> BV`
  - L and R values are now rendered as separate left/right anchored text objects on the same row to maintain a clean, consistent gap.
  - Search-result chips now use matching colon format for L/R labels.
- **Validation performed:**
  - `node --check binary-tree.mjs`

### 2026-02-22 - Binary tree fullscreen desktop switched to mobile sheet UX (Codex)

- **What changed:** Fullscreen desktop now uses the same bottom-sheet interaction pattern as mobile for search + selected-node details.
- **Files affected:** `index.html`, `admin.html`, `binary-tree.mjs`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`
- **UI/behavior updates:**
  - Added desktop-only fullscreen CSS block (`@media (min-width: 641px)`) that mirrors the mobile fullscreen sheet layout:
    - bottom floating search anchor with furthest-left/right + root-focus controls
    - hidden minimap and hidden legacy fullscreen dock controls (`zoom`, `fit/reset`, `furthest`)
    - bottom slide-up search sheet and selected-node sheet
    - selected-node dismiss and search dismiss actions visible in fullscreen
  - Updated fullscreen interaction gating in `binary-tree.mjs`:
    - introduced `isFullscreenSheetLayout()` and applied sheet-state behavior across fullscreen viewports (not only <=640px)
    - node selection now opens/closes selected sheet in desktop fullscreen
    - backdrop taps close open search/selected sheets in desktop fullscreen
    - mobile search pill and dismiss buttons now work in desktop fullscreen
    - minimap interaction/rendering disabled for fullscreen sheet layout
- **Design decision:**
  - Preserved existing non-fullscreen desktop layout; desktop receives sheet UX only while fullscreen is active.
- **Validation performed:**
  - `node --check binary-tree.mjs`
  - Inline script parse for `index.html` and `admin.html` via `vm.Script(...)`
- **Known limitation:**
  - Minimap is intentionally hidden in fullscreen for parity with mobile sheet UX.

### 2026-02-22 - Desktop fullscreen minimap toggle + bottom-left minimap placement (Codex)

- **What changed:** Added a desktop fullscreen minimap toggle button beside the Home control and restored minimap visibility on desktop fullscreen with bottom-left placement.
- **Files affected:** `index.html`, `admin.html`, `binary-tree.mjs`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`
- **UI updates (`index.html`, `admin.html`):**
  - Added new button in the floating desktop fullscreen quick controls:
    - `#tree-mobile-minimap-toggle`
  - Desktop fullscreen top-row now keeps Home + Minimap buttons adjacent on the right.
  - Desktop fullscreen minimap panel is now anchored bottom-left:
    - `left: 20px; bottom: 20px;`
  - Added class-controlled hide state:
    - `.tree-desktop-minimap-hidden`
- **Controller updates (`binary-tree.mjs`):**
  - Added persistent UI state key:
    - `isDesktopMinimapVisible`
  - Added desktop fullscreen viewport helper and toggle behavior:
    - `isDesktopFullscreenViewport()`
    - `setDesktopMinimapVisible(...)`
    - `syncDesktopMinimapVisibilityState()`
  - Minimap rendering/interaction now runs only when desktop fullscreen is active and minimap is toggled on.
- **Validation performed:**
  - `node --check binary-tree.mjs`
  - Inline script parse for `index.html` and `admin.html` via `vm.Script(...)`

### 2026-02-22 - Desktop minimap settings menu with Small/Medium/Large presets (Codex)

- **What changed:** Added a dedicated minimap settings (gear) control in desktop fullscreen to configure minimap size presets.
- **Files affected:** `index.html`, `admin.html`, `binary-tree.mjs`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`
- **UI updates (`index.html`, `admin.html`):**
  - Minimap panel now includes a themed header with a settings gear button:
    - `#tree-minimap-settings-toggle`
  - Added selectable size menu:
    - `#tree-minimap-size-menu`
    - options: `Small`, `Medium`, `Large`
  - Updated minimap panel styling to better match app theme:
    - gradient surface treatment
    - stronger layered shadows
    - soft inset highlight
    - refined rounded corners/borders
- **Behavior updates (`binary-tree.mjs`):**
  - Added persistent minimap size state:
    - `desktopMinimapSize` (`small` | `medium` | `large`)
  - Added size helpers and controls:
    - `setDesktopMinimapSettingsOpen(...)`
    - `setDesktopMinimapSize(...)`
    - `syncDesktopMinimapSizeState()`
  - Default size is `Small` when no prior setting exists.
  - Size selection updates panel width + canvas height via fullscreen class toggles.
  - Settings menu closes on outside tap and on `Escape`.
- **Validation performed:**
  - `node --check binary-tree.mjs`
  - Inline script parse for `index.html` and `admin.html` via `vm.Script(...)`

### 2026-02-22 - Desktop minimap height increased toward square proportions (Codex)

- **What changed:** Increased desktop fullscreen minimap canvas heights so the minimap appears less rectangular and closer to square.
- **Files affected:** `index.html`, `admin.html`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`
- **CSS updates (desktop fullscreen size presets):**
  - `Small`: `5.25rem -> 11.5rem`
  - `Medium`: `6.5rem -> 13.75rem`
  - `Large`: `7.75rem -> 16rem`
- **Validation performed:**
  - Inline script parse for `index.html` and `admin.html` via `vm.Script(...)`

### 2026-02-22 - Fullscreen header title replaced with live Server Time / Cut-Off component (Codex)

- **What changed:** Removed the `Binary Tree` title block from fullscreen header and replaced that top-left area with a live `Server Time` + `Cut-Off` chip.
- **Files affected:** `index.html`, `admin.html`, `binary-tree.mjs`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`
- **UI updates (`index.html`, `admin.html`):**
  - Added fullscreen-only header component:
    - `#tree-fullscreen-time-chip`
    - `#tree-fullscreen-server-time`
    - `#tree-fullscreen-cutoff-time`
  - Existing title block is now hidden during fullscreen:
    - `#tree-header-title-block` hidden under `.tree-fullscreen-mode`
  - Added responsive chip sizing rules for both desktop and mobile fullscreen breakpoints.
- **Controller updates (`binary-tree.mjs`):**
  - Added time/cutoff bindings:
    - `fullscreenServerTimeId`
    - `fullscreenCutoffTimeId`
  - Added live ticker render logic:
    - `renderFullscreenHeaderTimeChip()`
    - `startFullscreenHeaderTimeTicker()`
    - `stopFullscreenHeaderTimeTicker()`
  - Source of cutoff context is aligned with existing server-cutoff card dataset (`cutoffTimezone`, weekday/hour/minute).
- **Behavior outcome:**
  - Mobile fullscreen and desktop fullscreen now show live server time + cutoff schedule in the top-left area.
  - Non-fullscreen tree view still shows the original `Binary Tree` title/description.
- **Validation performed:**
  - `node --check binary-tree.mjs`
  - Inline script parse for `index.html` and `admin.html` via `vm.Script(...)`

### 2026-02-22 - Fullscreen header top-anchor alignment for time chip + exit button (Codex)

- **What changed:** Aligned fullscreen header elements so the `Server Time / Cut-Off` chip and fullscreen action button share a clean top anchor.
- **Files affected:** `index.html`, `admin.html`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`
- **UI updates (`index.html`, `admin.html`):**
  - Added dedicated header actions wrapper:
    - `#tree-header-actions`
  - Fullscreen header now anchors to top-start alignment:
    - `#tree-header-bar` uses `align-items: flex-start` in fullscreen
  - Fullscreen action button now explicitly top-aligned:
    - `#tree-fullscreen { align-self: flex-start; }`
  - Action group in fullscreen is no-wrap with top alignment to prevent vertical drift.
- **Validation performed:**
  - Inline script parse for `index.html` and `admin.html` via `vm.Script(...)`

### 2026-02-22 - Non-fullscreen Binary Tree summary cards + hidden legacy top controls (Codex)

- **What changed:** Redesigned the Binary Tree page in non-fullscreen mode to remove the generic top header/tools and replace the top area with dashboard-style summary cards bound to live binary metrics.
- **Files affected:** `index.html`, `admin.html`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`
- **UI updates (`index.html`, `admin.html`):**
  - Added new non-fullscreen summary block:
    - `#tree-summary-overview`
    - rank chip: `#tree-summary-account-rank`
    - cards: `#tree-summary-member-count`, `#tree-summary-estimated-cycles`, `#tree-summary-left-leg-bv`, `#tree-summary-right-leg-bv`
    - secondary metrics: `#tree-summary-new-members`, `#tree-summary-direct-sponsors`, `#tree-summary-cycle-rule`
  - Added new non-fullscreen action button:
    - `#tree-open-fullscreen`
  - Hid the old top header and tool dock in non-fullscreen mode only:
    - `#tree-header-bar` and `#tree-tools-dock` now hidden when `#binary-tree-panel` is not in `.tree-fullscreen-mode`
  - Fullscreen mode still uses the existing fullscreen header/tools/minimap layout.
- **Binding updates (`index.html`, `admin.html` inline scripts):**
  - Extended `applyBinaryTreeDashboardSummary(summary)` to update all new Binary Tree summary card values from live summary data.
  - Added click handling for `#tree-open-fullscreen` to call `ensureBinaryTreeReady()` then `controller.enterFullscreen()`.
- **Design decision:**
  - Preserved fullscreen-only header/tools for advanced controls while keeping non-fullscreen view focused on account-level binary KPIs.
- **Validation performed:**
  - Inline script parse for `index.html` and `admin.html` via `vm.Script(...)`

### 2026-02-22 - Binary Tree non-fullscreen layout refinement: cards outside panel + canvas fullscreen trigger (Codex)

- **What changed:** Refined the non-fullscreen Binary Tree page layout per UX request.
- **Files affected:** `index.html`, `admin.html`, `Claude_Notes/charge-documentation.md`, `Claude_Notes/Current Project Status.md`
- **Layout updates (`index.html`, `admin.html`):**
  - Moved `#tree-summary-overview` outside `#binary-tree-panel` so cards are page-level content, not inside the tree component shell.
  - Removed the in-component summary header/title block (`Binary Tree Summary`) entirely.
  - Upgraded summary cards with visual treatment and icons:
    - icon chips
    - gradient glow accents
    - stronger card hierarchy matching existing theme
  - Kept existing live metric IDs, now distributed across improved cards:
    - `#tree-summary-member-count`
    - `#tree-summary-new-members`
    - `#tree-summary-account-rank`
    - `#tree-summary-direct-sponsors`
    - `#tree-summary-estimated-cycles`
    - `#tree-summary-cycle-rule`
    - `#tree-summary-left-leg-bv`
    - `#tree-summary-right-leg-bv`
- **Fullscreen button placement:**
  - Moved `#tree-open-fullscreen` into the binary tree render area (`.tree-canvas-shell`) as a top-right overlay action.
  - Added fullscreen-state CSS guard to hide this overlay button when the component is already in fullscreen mode.
- **Validation performed:**
  - Inline script parse for `index.html` and `admin.html` via `vm.Script(...)`

### 2026-02-22 - Account Overview rank polish: package-driven rank mapping and display (Codex)

- **What changed:** Polished dashboard Account Overview rank behavior so rank is consistently derived from enrollment package and displayed clearly.
- **Files affected:** `index.html`, `admin.html`, `serve.mjs`, `Claude_Notes/charge-documentation.md`, `Claude_Notes/Current Project Status.md`

- **Rank mapping updates (frontend + backend):**
  - Standardized package-to-rank mapping to canonical rank labels:
    - `personal-builder-pack -> Personal`
    - `business-builder-pack -> Business`
    - `infinity-builder-pack -> Infinity`
    - `legacy-builder-pack -> Legacy`
  - Updated both web shells and server logic so newly enrolled users are assigned rank from package consistently.

- **Account Overview UI polish (`index.html`, `admin.html`):**
  - Updated Account Rank card helper line to explicitly show package source:
    - Added `#account-rank-package-label`
    - Copy now reads: `Assigned from package: <package label>`
  - Added sync helper `syncAccountRankPackageLabel(...)` to keep package source text aligned with session data.

- **Session rank resolution polish (`index.html`, `admin.html`):**
  - `resolveSessionAccountRank(...)` now:
    1. prefers normalized `accountRank`/`rank`
    2. falls back to package-derived starting rank
  - `normalizeRankLabel(...)` now canonicalizes legacy labels/synonyms (e.g. `Legacy Pack` => `Legacy`, `Achievers Pack` => `Infinity`) and treats `Starter` as unset.

- **Enrollment UX polish (`index.html`, `admin.html`):**
  - Enrollment success feedback now includes assigned rank, e.g.:
    - `Assigned rank: Legacy`

- **Server-side consistency (`serve.mjs`):**
  - Canonical rank normalization implemented in `normalizeRankLabelForDisplay(...)`.
  - Added `resolveStartingRankFromEnrollmentPackage(...)` helper.
  - `sanitizeUserForAuthResponse(...)` now falls back to package-derived rank when stored rank/accountRank is missing/legacy starter data.
  - `/api/member-ranks` now returns canonical/fallback rank values the same way.

- **Validation performed:**
  - `node --check serve.mjs`
  - Inline script parse for `index.html` and `admin.html` via `vm.Script(...)`

### 2026-02-22 - Account Rank card copy update + package-tier upgrade flow (Codex)

- **What changed:** Updated Account Rank card messaging and added an in-card account upgrade action for members below Legacy.
- **Files affected:** `index.html`, `serve.mjs`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`

- **Dashboard Account Rank card updates (`index.html`):**
  - Replaced package source text:
    - Removed `Assigned from package: Legacy Builder Pack` display pattern.
    - New helper text now reads exactly: `Complete your Task to Rank up! Next rank: Ruby`.
  - Added conditional upgrade UI inside the Account Rank card:
    - `#account-rank-upgrade-wrap`
    - `#account-rank-upgrade-button`
    - `#account-rank-upgrade-button-label`
    - `#account-rank-upgrade-hint`
    - `#account-rank-upgrade-feedback`
  - Upgrade CTA is shown only when current package tier is below `legacy-builder-pack`.

- **Frontend upgrade behavior (`index.html` inline script):**
  - Added `MEMBER_ACCOUNT_UPGRADE_API` constant (`/api/member-auth/upgrade-account`).
  - Added package-order helpers to resolve current tier and next upgrade tier:
    - `ACCOUNT_UPGRADE_PACKAGE_ORDER`
    - `resolveCurrentAccountPackageKey(...)`
    - `resolveNextAccountUpgradePackageKey(...)`
  - Added CTA sync + feedback helpers:
    - `syncAccountRankUpgradeCta(...)`
    - `setAccountRankUpgradeFeedback(...)`
    - `clearAccountRankUpgradeFeedback()`
  - Added `handleAccountRankUpgrade()` click flow:
    - Calls upgrade API with current member identifiers.
    - Applies returned user patch to session.
    - Reloads registered members/tree summary.
    - Surfaces success/error feedback inline in the card.

- **Backend upgrade API (`serve.mjs`):**
  - Added new endpoint: `POST /api/member-auth/upgrade-account`.
  - Added package-tier upgrade rules:
    - Tier path is fixed: Personal -> Business -> Infinity -> Legacy.
    - No downgrade path exposed.
    - Legacy-tier users receive a conflict response (`409`) and cannot upgrade further.
  - Upgrade API updates user and matching registered member record:
    - `enrollmentPackage`, `enrollmentPackageLabel`, `enrollmentPackagePrice`, BV values.
    - `rank` and `accountRank` aligned with next package starting rank.
    - purchase/activity timestamps extended using existing purchase-window logic.
  - PV/BV propagation behavior:
    - Calculates upgrade PV gain from package BV difference.
    - Updates member `packageBv` to upgraded package BV so binary/upline rollups reflect the added volume under existing tree rules.

- **Validation performed:**
  - `node --check serve.mjs`
  - Inline script parse for `index.html` via `vm.Script(...)`

### 2026-02-22 - Account Overview rank card: selectable upgrade tier + dynamic subtext (Codex)

- **What changed:** Refined the Account Rank card so users below Legacy can choose any higher package (not just the next one), and rank-card helper text now changes by rank state.
- **Files affected:** `index.html`, `serve.mjs`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`

- **Account Rank card UX (`index.html`):**
  - Added package selector in upgrade controls:
    - `#account-rank-upgrade-package-select`
  - Upgrade action now works with selected package tier (higher-tier options only).
  - Dynamic helper copy behavior:
    - If account is `Legacy`: `Complete your Task to Rank up! Next rank: Ruby`
    - If account is below `Legacy`: `Upgrade your account to maximize your commission`
  - Upgrade hint now reflects selected package details and BV gain from current tier.

- **Frontend logic updates (`index.html` inline script):**
  - Added package-tier helpers:
    - `resolveAccountPackageTierIndex(...)`
    - `resolveAvailableAccountUpgradePackageKeys(...)`
    - `syncAccountRankUpgradeSelection(...)`
  - `syncAccountRankUpgradeCta(...)` now:
    - sets dynamic helper text
    - populates selectable higher-tier package options
    - hides upgrade controls when user is already at Legacy
  - Upgrade request payload now includes selected target tier:
    - `targetPackage`

- **Backend API updates (`serve.mjs`):**
  - `/api/member-auth/upgrade-account` now accepts optional `targetPackage`.
  - Validation rules:
    - Target must be a valid package tier.
    - Target must be strictly higher than current tier.
    - Same-tier and downgrade attempts are rejected with `409`.
  - Default behavior remains backward-compatible:
    - if `targetPackage` is omitted, server upgrades to the next tier.
  - Existing no-downgrade and PV/BV rollup update behavior remains intact.

- **Validation performed:**
  - `node --check serve.mjs`
  - Inline script parse for `index.html` via `vm.Script(...)`

### 2026-02-22 - Dashboard top card replacement: Sales Team Commissions (Codex)

- **What changed:** Replaced the top-row Dashboard `Account Status` card with a live `Sales Team Commissions` card driven by cycle count and package-based commission multipliers.
- **Reference applied:** `brand_assets/MLM Business Logic.md` section `4 Sales Team Commission` (line 81 onward), including `Builder Pack Cycle Multipliers` (line 103 table).
- **Files affected:** `index.html`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`

- **UI replacement (`index.html`):**
  - Removed:
    - `Account Status` / `Active` static card in dashboard top row.
  - Added:
    - `Sales Team Commissions` card with live bindings:
      - `#dashboard-sales-commission-value`
      - `#dashboard-sales-commission-rate-badge`
      - `#dashboard-sales-commission-cycle-summary`
      - `#dashboard-sales-commission-per-cycle`
      - `#dashboard-sales-commission-cap-value`
      - `#dashboard-sales-commission-cap-progress`

- **Commission logic (`index.html` inline script):**
  - Added `SALES_TEAM_CYCLE_COMMISSION_PLAN` using business-logic table values:
    - Personal: `5%`, `$25/cycle`, `50` monthly cap cycles
    - Business: `7.5%`, `$37.5/cycle`, `250` monthly cap cycles
    - Infinity: `10%`, `$50/cycle`, `500` monthly cap cycles
    - Legacy: `12.5%`, `$62.5/cycle`, `1000` monthly cap cycles
  - Added renderer helpers:
    - `resolveSalesTeamCycleCommissionProfile(...)`
    - `renderSalesTeamCommissionsCard(...)`
    - `formatSalesCycleMultiplier(...)`
  - Card now calculates:
    - effective cycles = `min(totalCycles, monthlyCapCycles)`
    - commission = `effectiveCycles * perCycle`
    - cap usage progress and overflow indicator
  - Cycle commission card refreshes when:
    - binary summary updates cycles
    - session package updates (e.g., account upgrade) via `applySessionUserPatch(...)`

- **Validation performed:**
  - Inline script parse for `index.html` via `vm.Script(...)`

### 2026-02-22 - Dashboard bottom-left replacement: Infinity Builder (Codex)

- **What changed:** Replaced `Month vs Month` in the user dashboard with a new `Infinity Builder` component that uses a simplified Binary Tree visual language and MLM tier progression.
- **Reference applied:** `brand_assets/MLM Business Logic.md` section `3 Infinity Builder Bonus` (line 56 onward), plus owner clarification in chat:
  - node structure is `1 parent -> 3 child`
  - tier card uses simplified layout of `3 nodes` per tier (updated from original 40-node ternary layout).
- **Files affected:** `index.html`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`

- **UI replacement (`index.html`):**
  - Removed:
    - `Month vs Month` comparison widget block.
  - Added:
    - `Infinity Builder` dashboard card with live summary stats and tier cards:
      - `#infinity-builder-direct-sponsors`
      - `#infinity-builder-active-tiers`
      - `#infinity-builder-completed-tiers`
      - `#infinity-builder-claimable-bonus`
      - `#infinity-builder-tier-cards`
  - Tier card node visualization now renders 3 micro-blocks per tier (updated from original 40-node layout).

- **Logic updates (`index.html` inline script):**
  - Added Infinity Builder constants:
    - `INFINITY_BUILDER_DIRECT_SPONSORS_PER_TIER`
    - `INFINITY_BUILDER_TOTAL_NODES_PER_TIER`
    - `INFINITY_BUILDER_DOWNLINE_NODE_CAP`
    - `INFINITY_BUILDER_TIER_BONUS`
    - `INFINITY_BUILDER_LEVEL_NODE_COUNTS`
  - Added unilevel sponsor-graph tier engine:
    - `buildInfinityBuilderTierSnapshots()`
    - `renderInfinityBuilderNodeMatrix(...)`
    - `renderInfinityBuilderDashboardCard()`
  - Data source for tier computation is existing Binary Tree runtime data (`binaryTreeMockData`) using `sponsorId` edges.
  - Spillover handling is included via sponsor graph interpretation:
    - nodes with `sponsorId === root` are treated as direct sponsors for tier seeding.
  - Tier seeding logic:
    - direct sponsors grouped by `3` into Tier 1 / Tier 2 / ...
    - each tier traverses descendants from its three seed sponsors
    - lit node count is capped to 3
    - completed tier marks `$150` bonus-ready.
  - Rerender hooks:
    - `syncBinaryTreeFromRegisteredMembers(...)`
    - `recalculateEnrollDerivedMetrics()`
    - initial dashboard boot render.

- **Known limitations:**
  - Bonus claim is currently visual/derived only (`completed tiers * $150`) and is not yet persisted to a payout ledger endpoint.
  - Admin-shell parity for this new dashboard card was not applied in this patch.

- **Validation performed:**
  - Inline script parse for `index.html` via `vm.Script(...)`

### 2026-02-22 - Infinity Builder layout refinement: portrait swipe cards + 2-tier default (Codex)

- **What changed:** Refined Infinity Builder tier presentation from a vertical stack to a swipe-style card carousel with portrait cards optimized for mobile.
- **Files affected:** `index.html`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`

- **UI updates (`index.html`):**
  - Replaced vertical tier list with horizontal snap carousel:
    - `#infinity-builder-tier-carousel`
    - `#infinity-builder-tier-cards`
  - Added carousel controls:
    - `#infinity-builder-prev-tier`
    - `#infinity-builder-next-tier`
    - `#infinity-builder-pagination` (dot indicators)
  - Tier cards now render as portrait cards with snap-center behavior and swipe-first interaction.

- **Behavior updates (`index.html` inline script):**
  - Added minimum tier-group visibility constant:
    - `INFINITY_BUILDER_BASE_TIER_COUNT = 2`
  - Tier snapshot logic now guarantees at least 2 tier groups in default view.
  - Added staged unlock behavior:
    - Tier 1 and Tier 2 are visible by default.
    - Tier 3+ cards unlock based on prior tier completion state.
  - Added carousel controller helpers:
    - `initializeInfinityBuilderCarouselControls()`
    - `scrollInfinityBuilderToTierCard(...)`
    - `syncInfinityBuilderCarouselControls()`
    - pagination/dot sync helpers
  - Auto-advance behavior:
    - when completed tier count increases, active card shifts to the next tier card.

- **Known limitations:**
  - Carousel is scroll-snap + swipe UX (native touch/trackpad), not a drag physics engine.
  - Admin-shell parity for this refinement is not included in this patch.

- **Validation performed:**
  - Inline script parse for `index.html` via `vm.Script(...)`

### 2026-02-22 - Infinity Builder node redesign: emphasized 1+3 seeds + enlarged node area (Codex)

- **What changed:** Redesigned Infinity Builder node visualization to strongly emphasize the seed structure (`1 Parent + 3 Child`) and optimized presentation of the remaining 36 nodes.
- **Files affected:** `index.html`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`

- **Node area redesign (`index.html`):**
  - Upgraded the node zone into a larger visual block per tier card.
  - Added `Seed Blueprint` section with:
    - highlighted parent (`Core Sponsor`) node
    - three child cards
    - connector lines in a tree-like footprint.
  - Added optimized `Remaining 36 Nodes` section split into:
    - `Level 3 Cluster` (`9` nodes)
    - `Level 4 Network` (`27` nodes)
  - Added remaining-36 progress strip with live `%` width.

- **Card sizing updates (`index.html`):**
  - Increased tier card footprint for better readability:
    - width: `w-[92%] sm:w-[80%] md:w-[62%] lg:w-[56%] xl:w-[52%]`
    - min height: `min-h-[38rem]`
  - Added dedicated seed chip container above the enlarged node map.

- **Design direction:**
  - Preserved Binary Tree visual language through:
    - dark surface layers
    - brand-tinted highlights for active nodes
    - structural connector lines for hierarchy cues.

- **Validation performed:**
  - Inline script parse for `index.html` via `vm.Script(...)`

### 2026-02-22 - Infinity Builder fit and line-style refinement (Codex)

- **What changed:** Tuned Infinity Builder carousel/card sizing to prevent the wider container feel and adjusted seed connector lines to better match Binary Tree link style.
- **Files affected:** `index.html`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`

- **Sizing/scroll polish (`index.html`):**
  - Added dedicated carousel scrollbar suppression and containment:
    - `#infinity-builder-tier-carousel` now hides native horizontal bar and uses x-overscroll containment.
    - `#infinity-builder-tier-cards` now anchors to `min-width: 100%` for safer layout fit.
  - Added local clip on the Infinity Builder carousel wrapper (`overflow-hidden`) to avoid spill beyond card shell.
  - Reduced tier card width profile:
    - from very wide portrait cards to tighter cards:
      - `w-[78%] sm:w-[62%] md:w-[52%] lg:w-[44%] xl:w-[38%]`
      - `max-w-[26rem]`
      - `min-h-[34rem]`

- **Line-style refinement (`index.html`):**
  - Replaced straight seed connectors with curved/cubic-like branches that better mirror binary-tree visual links.
  - Updated connector stroke tone to binary-tree link footprint color family:
    - `rgba(42,58,74,0.92)`
    - round caps and slightly stronger stroke width.

- **Validation performed:**
  - Inline script parse for `index.html` via `vm.Script(...)`

### 2026-02-22 - Infinity Builder full UX redesign (Codex)

- **What changed:** Reworked the Infinity Builder experience into a cleaner, easier flow focused on one selected tier at a time.
- **Files affected:** `index.html`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`

- **Layout simplification (`index.html`):**
  - Replaced horizontal multi-card carousel with:
    - tier tab strip (`#infinity-builder-tier-tabs`)
    - single focused detail panel (`#infinity-builder-tier-panel`)
    - prev/next tier controls for simple step navigation.
  - Removed carousel/pagination visual clutter from the component.

- **User-flow redesign (`index.html`):**
  - Tier panel now uses a two-step mental model:
    - `Step 1: Seed Group` (`1 Parent + 3 Direct Children`)
    - `Step 2: Expansion` (`9 + 27` nodes)
  - Added clear status messaging per selected tier:
    - Locked / In Progress / Completed
  - Added straightforward progress sections:
    - total tier progress
    - expansion-only progress
    - level-specific node counts.

- **Node/link visual alignment (`index.html`):**
  - Seed connector line style uses curved branch pattern and binary-tree tone family (`rgba(42,58,74,0.9)`).
  - Node rendering in the detail panel now uses circular markers with active/inactive state for improved readability.

- **Tech notes (`index.html`):**
  - `renderInfinityBuilderDashboardCard()` now drives:
    - tier tab rendering
    - selected-tier panel rendering
    - prev/next control state.
  - Legacy carousel helpers were removed from active runtime usage.

- **Validation performed:**
  - Inline script parse for `index.html` via `vm.Script(...)`

### 2026-02-22 - Infinity Builder simplification: dashboard-style cards + child lights (Codex)

- **What changed:** Simplified the selected-tier panel in Infinity Builder to reuse the main dashboard card language and reduce visual complexity.
- **Files affected:** `index.html`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`

- **UI simplification (`index.html`):**
  - Replaced dense node-cluster/connector visuals with two dashboard-style cards:
    - `Step 1` card for direct-child lighting
    - `Step 2` card for remaining-node completion progress.
  - Kept the existing tier tab + focused panel workflow, but simplified the tier internals for faster scanning.

- **Infinity Builder interaction updates (`index.html`):**
  - Added explicit `3 child` light-up indicators (`Child 1`, `Child 2`, `Child 3`) with lit/unlit states.
  - Added one progress bar dedicated to remaining nodes (`36` max after parent + 3 children).
  - Preserved total tier progress bar and seed-sponsor list, now in matching card shells.
  - Updated step guidance messaging to reflect:
    - direct sponsor fill requirement first
    - remaining-node completion second.

- **Code cleanup (`index.html`):**
  - Removed unused `renderInfinityBuilderNodeMatrix(...)` legacy renderer path.
  - Removed dot-cluster rendering logic no longer needed by the simplified UI.

- **Validation performed:**
  - Inline script parse for `index.html` via `vm.Script(...)`

### 2026-02-22 - Dashboard rollback: replaced Infinity Builder container with Budget Progress (Codex)

- **What changed:** Removed the full Infinity Builder UI container from the user dashboard and restored a `Budget Progress` section modeled after `temporary screenshots/screenshot-desktop-win-like.png`.
- **Files affected:** `index.html`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`

- **Layout update (`index.html`):**
  - Replaced the bottom-left `Infinity Builder` block with:
    - `Budget Progress` header + month badge (`February 2026`)
    - category spend cards (Food & Dining, Transport, Entertainment, Bills & Utilities, Shopping)
    - right-side `Month vs Month` summary panel.
  - Preserved existing dashboard card language (surface, border, progress strips) for visual consistency.

- **Behavior/runtime impact (`index.html`):**
  - Removed Infinity Builder DOM bindings (`#infinity-builder-*`) from the dashboard markup.
  - Infinity Builder script functions remain in code but are now inactive on this page because required elements are absent and guarded by existing binding checks.

- **Validation performed:**
  - Inline script parse for `index.html` via `vm.Script(...)`

### 2026-02-22 - Infinity Builder relayout: Budget-style tier group cards (Codex)

- **What changed:** Re-applied Infinity Builder in the dashboard, but using the `Budget Progress` visual pattern. Each card now represents a Tier Group instead of a budget category.
- **Files affected:** `index.html`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`

- **Layout changes (`index.html`):**
  - Replaced static budget categories with dynamic Infinity tier cards container:
    - `#infinity-builder-tier-group-cards`
  - Kept the budget-style card language (dot label, primary value, progress strip, short caption) and mapped it to tier data (`Tier 1`, `Tier 2`, ...).
  - Added a right-side detail panel (`Tier Snapshot`) with:
    - selected tier label/status
    - seed progress (`3 children`)
    - remaining nodes progress (`36`)
    - total tier completion (`40`)
    - seed sponsor chips
    - inline previous/next tier controls.

- **Runtime/render updates (`index.html`):**
  - Refactored `renderInfinityBuilderDashboardCard()` to render clickable tier cards (`data-infinity-tier-card-index`) and update the snapshot panel.
  - Preserved core Infinity logic:
    - tier snapshots and unlock states
    - completed-tier bonus derivation
    - auto-focus advancement on newly completed tiers.
  - Updated DOM bindings from old tab/panel ids to the new budget-layout ids.

- **Validation performed:**
  - Inline script parse for `index.html` via `vm.Script(...)`
  - Authenticated dashboard screenshot captured:
    - `temporary screenshots/screenshot-37-infinity-tier-cards-layout.png`

### 2026-02-22 - Infinity Builder card simplification: budget look + 3 seed lights only (Codex)

- **What changed:** Simplified the Infinity Builder UI again so each tier is just a budget-style card with a progress strip and exactly `3` seed nodes that light up.
- **Files affected:** `index.html`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`

- **Layout update (`index.html`):**
  - Removed the right-side snapshot/control panel from the Infinity Builder container.
  - Kept only the card grid (`#infinity-builder-tier-group-cards`) and a compact claimable-bonus pill.
  - Card anatomy now mirrors the reference style:
    - tier label with accent dot
    - large value (`lit / 40`)
    - horizontal progress bar
    - short helper line
    - `3` seed node indicators that light up by progress.

- **Render logic update (`index.html`):**
  - Reworked `renderInfinityBuilderDashboardCard()` to render only tier cards.
  - Removed dependencies on previous detail-panel bindings/controls.
  - Card tone still reflects tier state (`Locked`, `In Progress`, `Completed`) while preserving binary-derived counts.

- **Validation performed:**
  - Inline script parse for `index.html` via `vm.Script(...)`
  - Authenticated dashboard screenshot captured:
    - `temporary screenshots/screenshot-38-infinity-tier-cards-3nodes.png`

### 2026-02-22 - Infinity Builder eligibility gate: Infinity+ only (Codex)

- **What changed:** Enforced participation rule so only `Infinity` rank and above (`Infinity`, `Legacy`) can participate in Infinity Builder.
- **Files affected:** `index.html`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`

- **Runtime rule update (`index.html`):**
  - Added rank allowlist:
    - `INFINITY_BUILDER_ELIGIBLE_RANKS = { infinity, legacy }`
  - Added resolver:
    - `resolveInfinityBuilderEligibility(user)`
  - `renderInfinityBuilderDashboardCard()` now:
    - shows normal tier cards only when eligible
    - renders a locked-state card for non-eligible ranks with current-rank context
    - sets claimable bonus pill to `$0.00` while locked.

- **Validation performed:**
  - Inline script parse for `index.html` via `vm.Script(...)`
  - Forced non-eligible preview captured (Business rank simulation):
    - `temporary screenshots/screenshot-39-infinity-eligibility-locked.png`

### 2026-02-22 - Naming polish: Legacy Leadership Bonus (Codex)

- **What changed:** Renamed user-facing component/system copy from `Infinity Builder` to `Legacy Leadership Bonus` in the dashboard card.
- **Files affected:** `index.html`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`

- **Copy updates (`index.html`):**
  - Section title changed:
    - `Infinity Builder` -> `Legacy Leadership Bonus`
  - Locked state title changed:
    - `Infinity Builder Locked` -> `Legacy Leadership Bonus Locked`
  - Eligibility note now explicitly references the renamed system:
    - participation message ends with `can participate in Legacy Leadership Bonus.`
  - Internal ids/function names remain unchanged to avoid unnecessary runtime churn.

- **Validation performed:**
  - Inline script parse for `index.html` via `vm.Script(...)`
  - Authenticated dashboard screenshot captured:
    - `temporary screenshots/screenshot-41-legacy-leadership-bonus-dashboard.png`

### 2026-02-22 - Naming correction: Infinity Builder Bonus (Codex)

- **What changed:** Renamed the component/system UI copy from `Legacy Leadership Bonus` to `Infinity Builder Bonus`.
- **Files affected:** `index.html`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`

- **Copy updates (`index.html`):**
  - section title -> `Infinity Builder Bonus`
  - locked-state title -> `Infinity Builder Bonus Locked`
  - eligibility sentence now ends with `participate in Infinity Builder Bonus.`
  - component comment label updated accordingly.

- **Validation performed:**
  - Inline script parse for `index.html` via `vm.Script(...)`

### 2026-02-22 - Tier anticipation card: locked Tier 3 preview (Codex)

- **What changed:** Added an explicit locked anticipation tier card so the next tier (e.g., Tier 3) is visible before unlock requirements are met.
- **Files affected:** `index.html`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`

- **Infinity Builder Bonus behavior update (`index.html`):**
  - Added preview-tier constant:
    - `INFINITY_BUILDER_PREVIEW_LOCKED_TIER_COUNT = 1`
  - Tier count calculation now guarantees one extra locked preview tier beyond currently active/base progression.
  - Locked tier cards now use explicit CTA copy:
    - `Complete the requirements to unlock Tier X.`
  - Locked anticipation cards show:
    - `Locked` badge
    - hidden progress state (`0 / 40`)
    - unlit 3-seed indicators.

- **Validation performed:**
  - Inline script parse for `index.html` via `vm.Script(...)`
  - Runtime card-count check after auth confirmed `3` cards with locked Tier 3 preview.
  - Authenticated dashboard screenshot captured:
    - `temporary screenshots/screenshot-43-tier3-anticipation-visible.png`

### 2026-02-22 - Server mockup mode: 10-tier Infinity Builder Bonus preview (Codex)

- **What changed:** Applied a temporary server-side mockup for Infinity Builder Bonus so the dashboard renders `10` tier cards for layout review.
- **Files affected:** `index.html`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`

- **Implementation (`index.html`):**
  - Added toggle:
    - `INFINITY_BUILDER_MOCKUP_MODE_ENABLED = true`
  - Added mock snapshot builder:
    - `buildInfinityBuilderMockupSnapshot()`
  - `buildInfinityBuilderTierSnapshots()` now returns mock snapshot when toggle is enabled.
  - Mock profile currently renders:
    - Tier 1 completed (`40/40`)
    - Tier 2 in progress (`24/40`)
    - Tier 3 seeded/in progress (`3/40`)
    - Tier 4–10 locked anticipation cards.

- **Intent:**
  - Keep this mockup active for owner review.
  - Revert is a one-line toggle change when requested.

- **Validation performed:**
  - Inline script parse for `index.html` via `vm.Script(...)`
  - Authenticated live screenshot captured:
    - `temporary screenshots/screenshot-48-tier10-server-mockup-live.png`
  - Runtime check confirmed `tierCardCount: 10`.

### 2026-02-22 - Dashboard grid stretch fix (Account Overview + Quick Actions) (Codex)

- **What changed:** Fixed unintended vertical stretching of top-row cards when Infinity Builder Bonus renders many tiers.
- **Files affected:** `index.html`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`

- **Root cause:**
  - The dashboard wrapper used `lg:grid-rows-2`, which enforces equal-height rows on desktop.
  - With the 10-tier mockup increasing row 2 height, row 1 was forced to match and appeared stretched.

- **Fix (`index.html`):**
  - Updated dashboard grid wrapper:
    - from `grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-2 gap-6`
    - to `grid grid-cols-1 lg:grid-cols-3 gap-6`
  - Rows now auto-size by content instead of equal `1fr` heights.

- **Validation performed:**
  - Inline script parse for `index.html` via `vm.Script(...)`
  - Authenticated screenshot with 10-tier mockup:
    - `temporary screenshots/screenshot-49-tier10-grid-stretch-fix.png`

### 2026-02-22 - Infinity Builder Bonus claim flow + archive + 6-card paging (Codex)

- **What changed:** Implemented claim workflow and archive mode for Infinity Builder Bonus, plus pagination capped at 6 cards per page.
- **Files affected:** `index.html`, `Claude_Notes/Current Project Status.md`, `Claude_Notes/charge-documentation.md`

- **UI updates (`index.html`):**
  - Added top-right archive dropdown in component header:
    - `View: Active | Completed`
  - Moved claimable amount to title block as:
    - `Unclaimed Commission: $...`
  - Added pagination controls beneath cards:
    - prev/next buttons
    - page label (`1 / N`)
    - summary (`Showing X active/claimed tiers`)
  - Added claim CTA on completed/unclaimed active cards:
    - `Claim Infinity Builder Commission` (middle-right placement above seed row/progress zone)

- **Behavior updates (`index.html`):**
  - Active view:
    - shows non-claimed tiers only
    - displays up to 6 cards per page.
  - Completed view:
    - renders claimed tiers archive cards
    - includes `Date Started` and `Date Claimed`.
  - Claim action:
    - records tier claim to local storage (`charge-infinity-builder-claims-v1`)
    - hides claimed tier from Active view
    - reduces Unclaimed Commission balance accordingly.
  - Added claim-storage helpers:
    - owner-keyed records by session user
    - safe read/write with fallback on storage failures.
  - Added `tierStartedAtMs` to tier snapshots for archive timeline display.

- **Validation performed:**
  - Inline script parse for `index.html` via `vm.Script(...)`
  - Authenticated screenshots:
    - Active page 1 (6-card page + claim button): `temporary screenshots/screenshot-53-claim-archive-active-page1-clean.png`
    - Active page 2 (next 4 cards): `temporary screenshots/screenshot-54-claim-archive-active-page2-clean.png`
    - Completed archive after claiming Tier 1: `temporary screenshots/screenshot-55-claim-archive-completed-with-record.png`
  - Runtime metric check after claim/archive switch:
    - `currentView: completed`
    - `renderedCards: 1`
    - `claimable: $0.00`

### 2026-02-22 - Claim button position adjustment (middle-right) (Codex)

- **What changed:** Repositioned Infinity Builder claim button to match UX request:
  - middle-right alignment
  - above the `3/3 seed` row and progress bar.
- **Files affected:** `index.html`

- **Validation performed:**
  - Inline script parse for `index.html` via `vm.Script(...)`
  - Authenticated screenshot captured:
    - `temporary screenshots/screenshot-56-claim-button-middle-right.png`

### 2026-02-22 - Claim button header anchoring (top-right) (Codex)

- **What changed:** Re-anchored `Claim Infinity Builder Commission` to the card header area (top-right), aligned with Tier heading row.
- **Files affected:** `index.html`

- **Implementation detail (`index.html`):**
  - Claim CTA is now absolutely positioned inside each eligible completed card:
    - `absolute top-4 right-5`
  - Card container changed to `relative` to provide local positioning context.
  - Removed claim CTA from in-body position above seed/progress row.

- **Validation performed:**
  - Inline script parse for `index.html` via `vm.Script(...)`
  - Authenticated screenshot captured:
    - `temporary screenshots/screenshot-58-claim-button-header-anchored.png`

### 2026-02-22 - Mock tier-card reset for Infinity Builder claims (Codex)

- **What changed:** Added an automatic claim-reset step for Infinity Builder when mockup mode is enabled so accidentally claimed tiers return to the default mock layout on reload.
- **Files affected:** `index.html`, `Claude_Notes/charge-documentation.md`, `Claude_Notes/Current Project Status.md`

- **Implementation (`index.html`):**
  - Added toggle:
    - `INFINITY_BUILDER_MOCKUP_RESET_CLAIMS_ON_LOAD = true`
  - Added one-time session guard:
    - `infinityBuilderMockClaimsResetApplied`
  - Added helper:
    - `resetInfinityBuilderClaimsForCurrentUser()`
  - On first render in mock mode, the current user claim map is cleared before tier cards are rendered.

- **Design decision:**
  - Reset is constrained to mock mode only, preserving normal claim persistence for real/non-mock flows.
  - Reset runs once per page load to prevent interfering with in-session claim/archive interaction.

- **Known limitation:**
  - This intentionally wipes existing mock claim records for the current logged-in user after refresh while mock reset is enabled.

- **Validation performed:**
  - Inline script parse for `index.html` via `new Function(...)`
  - Result: `Parsed 1 inline script block(s) successfully.`

### 2026-02-22 - Stable Infinity Builder panel height across paginated active tiers (Codex)

- **What changed:** Prevented Infinity Builder Bonus container from shrinking on pages with fewer than 6 active cards.
- **Files affected:** `index.html`, `Claude_Notes/charge-documentation.md`, `Claude_Notes/Current Project Status.md`

- **Implementation (`index.html`):**
  - Kept existing paging behavior (`6` cards/page).
  - Updated active-view renderer to append invisible filler cards when a page has fewer than `INFINITY_BUILDER_CARDS_PER_PAGE` items.
  - Filler cards are non-interactive (`pointer-events-none`) and hidden (`invisible`) but preserve grid row height so page 2 keeps page-1 footprint.

- **Design decision:**
  - Applied only to `Active` view so archive view remains compact and focused on claimed records.

- **Validation performed:**
  - Inline script parse for `index.html` via `new Function(...)`
  - Result: `Parsed 1 inline script block(s) successfully.`

### 2026-02-22 - Completed tier archive detail expansion + themed View filter polish (Codex)

- **What changed:** Upgraded Infinity Builder `Completed` cards with richer archive context and restyled the `View` dropdown to match the dashboard visual language (including webkit/native-select consistency).
- **Files affected:** `index.html`, `Claude_Notes/charge-documentation.md`, `Claude_Notes/Current Project Status.md`

- **Implementation (`index.html`):**
  - **Completed tier archive cards:**
    - Added `Completed Nodes` detail block (shows completed count, anchored to tier completion threshold).
    - Added `First 3 Direct Sponsors (Child Nodes)` block using the first three direct sponsor handles.
    - Rendered sponsor handles as branded chips for quick scan.
    - Kept existing `Date Started` and `Date Claimed` timeline rows.
  - **Claim record persistence enhancement:**
    - On claim, stored `completedNodeCount` and `seedHandles` snapshot in the claim record.
    - Archive rendering now reads sponsor/node details from claim record first, then falls back to the current tier snapshot if needed (backward compatible with older claim entries).
  - **View filter styling (Active/Completed):**
    - Replaced plain native select appearance with themed control:
      - `appearance-none` custom select
      - bordered/elevated shell matching card chrome
      - custom chevron icon
      - hover/focus states aligned with existing brand ring/border treatment.

- **Design decision:**
  - Archive cards now prioritize post-claim traceability (what completed, who seeded, when started/claimed) while staying in the existing compact card system.

- **Validation performed:**
  - Inline script parse for `index.html` via `new Function(...)`
  - Result: `Parsed 1 inline script block(s) successfully.`

### 2026-02-22 - Tier seed indicators replaced with sponsor username tags (Codex)

- **What changed:** Replaced the 3-dot seed indicator row on active Infinity Builder tier cards with Discord-style sponsor tags:
  - `[colored status dot + direct sponsor username]` for each of the 3 seed slots.
- **Files affected:** `index.html`, `Claude_Notes/charge-documentation.md`, `Claude_Notes/Current Project Status.md`

- **Implementation (`index.html`):**
  - Removed `seedNodeLightsMarkup` (dot-only rendering).
  - Added `tierSeedHandles` normalization for each tier card.
  - Added `seedSponsorTagMarkup` generator for exactly 3 slots:
    - Filled slots show sponsor handle text with a colored dot.
    - Unfilled slots render `Open Slot 1/2/3` with muted styling.
  - Dot color remains tied to tier state (`brand/success/warning`) through existing accent color logic.
  - Preserved `X/3 seed lit` metric below the tag row.

- **Design decision:**
  - Kept a fixed 3-slot visual model for consistency across tiers while exposing sponsor identity immediately.

- **Validation performed:**
  - Inline script parse for `index.html` via `new Function(...)`
  - Result: `Parsed 1 inline script block(s) successfully.`

### 2026-02-22 - Completed empty-state container height stabilization (Codex)

- **What changed:** Fixed Infinity Builder Bonus shrinking when `Completed` view has zero cards.
- **Files affected:** `index.html`, `Claude_Notes/charge-documentation.md`, `Claude_Notes/Current Project Status.md`

- **Implementation (`index.html`):**
  - Added helper `buildInfinityBuilderHiddenFillerCards(cardCount)` to generate non-interactive invisible filler cards matching tier card structure.
  - Replaced zero-item early return text with a full empty-state card plus filler cards to preserve 6-card grid footprint.
  - Applied filler-card padding for paginated renders in both `Active` and `Completed` views so the panel height stays stable across view switches/pages.

- **Design decision:**
  - Keep a consistent panel footprint regardless of item count to avoid layout jumps and preserve surrounding dashboard rhythm.

- **Validation performed:**
  - Inline script parse for `index.html` via `new Function(...)`
  - Result: `Parsed 1 inline script block(s) successfully.`

### 2026-02-22 - Theme-matched unique tier color palettes (Codex)

- **What changed:** Added a unique but theme-aligned color palette per Infinity Builder tier card.
- **Files affected:** `index.html`, `Claude_Notes/charge-documentation.md`, `Claude_Notes/Current Project Status.md`

- **Implementation (`index.html`):**
  - Added `INFINITY_BUILDER_TIER_COLOR_PALETTES` (10 curated teal/cyan/blue family palettes aligned to dashboard brand tones).
  - Added `getInfinityBuilderTierColorPalette(tierNumber)` resolver to map each tier to a deterministic palette.
  - Applied palette styling to:
    - active tier header dot
    - progress bar fill
    - sponsor seed tags (`[dot + username]`)
    - helper/status text accents
    - claim CTA button tint for completed/unclaimed tiers.
  - Applied the same per-tier palette treatment in `Completed` archive cards:
    - tier dot
    - claimed badge
    - amount text
    - sponsor chips.

- **Design decision:**
  - Used only theme-compatible hues (no off-brand bright/random colors) to preserve visual cohesion while keeping tiers visually distinct.

- **Validation performed:**
  - Inline script parse for `index.html` via `new Function(...)`
  - Result: `Parsed 1 inline script block(s) successfully.`

### 2026-02-22 - Infinity Builder mobile responsiveness and stretch-control refinements (Codex)

- **What changed:** Improved Infinity Builder Bonus behavior on mobile and fixed stretch artifacts in narrow viewports.
- **Files affected:** `index.html`, `Claude_Notes/charge-documentation.md`, `Claude_Notes/Current Project Status.md`

- **Implementation (`index.html`):**
  - **Filler cards (height stabilizers):**
    - Updated hidden filler card markup to be desktop-only with `hidden sm:block`.
    - Prevents mobile pages from accumulating invisible card rows that create excessive vertical stretch.
  - **Sponsor tags/chips overflow control:**
    - Added `max-w` + `truncate` constraints on active-tier seed sponsor tags.
    - Added `max-w` + `truncate` constraints on completed-archive sponsor chips.
  - **Claim CTA mobile fit:**
    - Added mobile max-width and tighter typography/spacing to avoid overflow pressure in narrow card headers.

- **Design decision:**
  - Keep layout-stabilizing fillers for tablet/desktop consistency while prioritizing content-fit and natural card height on mobile.

- **Validation performed:**
  - Inline script parse for `index.html` via `new Function(...)`
  - Result: `Parsed 1 inline script block(s) successfully.`
  - Mobile viewport screenshot:
    - `temporary screenshots/screenshot-60-mobile-infinity-responsive-fix.png`

### 2026-02-22 - Infinity Builder terminology update: Active -> Building (Codex)

- **What changed:** Updated Infinity Builder view-mode terminology from `Active` to `Building`.
- **Files affected:** `index.html`, `Claude_Notes/charge-documentation.md`, `Claude_Notes/Current Project Status.md`

- **Implementation (`index.html`):**
  - Dropdown option label updated:
    - `value="active"` now displays `Building`.
  - Related UI copy aligned:
    - pagination summary label now uses `building tiers`
    - empty-state title now uses `No building tiers available`
    - empty-state helper copy now uses `Building tier groups ...`

- **Design decision:**
  - Kept internal mode key as `active` for stability while updating all relevant user-facing text to `Building`.

- **Validation performed:**
  - Inline script parse for `index.html` via `new Function(...)`
  - Result: `Parsed 1 inline script block(s) successfully.`

### 2026-02-22 - Fast Track-style Infinity Builders Bonus card embedded inside component (Codex)

- **What changed:** Added a copied Fast Track-style commission card inside the Infinity Builder Bonus component (under its header), and bound it to Infinity Builder unclaimed commission values.
- **Files affected:** `index.html`, `Claude_Notes/charge-documentation.md`, `Claude_Notes/Current Project Status.md`

- **Implementation (`index.html`):**
  - Added a new card inside Infinity Builder component (not global dashboard top):
    - title: `Infinity Builders Bonus`
    - same visual structure as Fast Track card (status pill, value, request payout button, footnote).
  - Added new bindings:
    - `infinity-builder-top-bonus-value`
    - `infinity-builder-top-bonus-status`
    - `infinity-builder-top-bonus-subtitle`
    - `infinity-builder-top-bonus-footnote`
  - Added `renderInfinityBuilderTopBonusCard(amountValue, eligibility)` helper.
  - Hooked helper into `renderInfinityBuilderDashboardCard()`:
    - ineligible: shows locked state and `$0.00`
    - eligible with commission: `Available`
    - eligible without commission: `Building`
  - Kept existing unclaimed commission source-of-truth from Infinity Builder tier logic.

- **Design decision:**
  - Card was moved into the Infinity Builder component to keep related commission context localized in one module.

- **Validation performed:**
  - Inline script parse for `index.html` via `new Function(...)`
  - Result: `Parsed 1 inline script block(s) successfully.`
  - Authenticated screenshot:
    - `temporary screenshots/screenshot-61-infinity-component-copied-card.png`

### 2026-02-22 - Claim-flow correction: tier claim now feeds Infinity Builders Bonus balance (Codex)

- **What changed:** Corrected Infinity Builders Bonus summary-card balance source so commissions are added only after tier claim action.
- **Files affected:** `index.html`, `Claude_Notes/charge-documentation.md`, `Claude_Notes/Current Project Status.md`

- **Implementation (`index.html`):**
  - Kept `Unclaimed Commission` header value based on unclaimed completed tiers.
  - Updated summary card (`Infinity Builders Bonus`) to use claimed-archive total:
    - `claimedBonusBalanceValue = sum(claimedArchiveEntries.amount)`
  - `renderInfinityBuilderTopBonusCard(...)` now receives claimed balance value (not unclaimed value).
  - Updated eligible-state footnote copy to clarify behavior:
    - balance increases when tier commissions are claimed.

- **Behavior result:**
  - Before claim: amount remains out of the summary balance.
  - After claim: commission moves into Infinity Builders Bonus balance card.

- **Validation performed:**
  - Inline script parse for `index.html` via `new Function(...)`
  - Result: `Parsed 1 inline script block(s) successfully.`

### 2026-02-22 - Tier-card terminology update: Seed -> Direct Sponsorship slot (Codex)

- **What changed:** Updated Infinity Builder tier-card wording from `seed` terminology to `Direct Sponsorship slot` terminology.
- **Files affected:** `index.html`, `Claude_Notes/charge-documentation.md`, `Claude_Notes/Current Project Status.md`

- **Implementation (`index.html`):**
  - Updated helper text:
    - from `1 seed node left to light up.`
    - to `1 Direct Sponsorship slot left.`
  - Updated progress/counter labels on tier cards:
    - `X/3 seed lit` -> `X/3 Direct Sponsorship slot(s) lit`
  - Updated filler-card placeholder label similarly (`0/3 Direct Sponsorship slots lit`).
  - Updated Infinity Builder section subtitle:
    - now references `3 direct sponsorship slots`.

- **Validation performed:**
  - Inline script parse for `index.html` via `new Function(...)`
  - Result: `Parsed 1 inline script block(s) successfully.`

### 2026-02-22 - Tier metric label wording update (Codex)

- **What changed:** Updated tier-card metric label wording per request:
  - from `X/3 Direct Sponsorship slots lit`
  - to `X/3 Direct Sponsorships Requirements`.
- **Files affected:** `index.html`, `Claude_Notes/charge-documentation.md`, `Claude_Notes/Current Project Status.md`

- **Implementation (`index.html`):**
  - Updated live tier-card metric text in active cards.
  - Updated placeholder/filler-card metric text to match.

- **Validation performed:**
  - Inline script parse for `index.html` via `new Function(...)`
  - Result: `Parsed 1 inline script block(s) successfully.`

### 2026-02-22 - Locked-tier helper text now references previous tier (Codex)

- **What changed:** Updated locked-tier helper sentence to reference the preceding tier requirement.
- **Files affected:** `index.html`, `Claude_Notes/charge-documentation.md`, `Claude_Notes/Current Project Status.md`

- **Implementation (`index.html`):**
  - Added `previousTierNumber = Math.max(1, tierNumber - 1)`.
  - Updated locked helper copy from:
    - `Complete the requirements to unlock Tier X.`
  - to:
    - `Complete the requirements of Tier Y to Unlock Tier X.`
  - Example behavior:
    - Tier 4 locked card now shows:
      - `Complete the requirements of Tier 3 to Unlock Tier 4.`

- **Validation performed:**
  - Inline script parse for `index.html` via `new Function(...)`
  - Result: `Parsed 1 inline script block(s) successfully.`

### 2026-02-22 - Infinity Builder header simplified; top summary card now acts as component header (Codex)

- **What changed:** Removed the old Infinity Builder text header block and promoted the Fast Track-style Infinity Builders card as the component’s top/header section.
- **Files affected:** `index.html`, `Claude_Notes/charge-documentation.md`, `Claude_Notes/Current Project Status.md`

- **Implementation (`index.html`):**
  - Removed old header content:
    - `Infinity Builder Bonus` title
    - descriptive subtitle line
    - `Unclaimed Commission` line.
  - Kept `Infinity Builders Bonus` summary card at the top of component as the visual header.
  - Moved `View` toggle control below the summary card and above tier cards.
  - Synced default summary-card footnote copy to current claim-flow behavior:
    - balance increases when tier commissions are claimed.

- **Design decision:**
  - Consolidates component identity + status into one top card to reduce duplicate headings and visual noise.

- **Validation performed:**
  - Inline script parse for `index.html` via `new Function(...)`
  - Result: `Parsed 1 inline script block(s) successfully.`

### 2026-02-22 - Infinity Builder view control updated to radio button group (Codex)

- **What changed:** Replaced the Infinity Builder `View` dropdown with dedicated button-style radio options (`Building`, `Completed`) for one-click switching.
- **Files affected:** `index.html`, `Claude_Notes/charge-documentation.md`, `Claude_Notes/Current Project Status.md`

- **Implementation (`index.html`):**
  - Replaced `<select id="infinity-builder-view-filter">` with a `radiogroup` fieldset using two radio inputs:
    - `name="infinity-builder-view-mode" value="active"` (label: `Building`)
    - `name="infinity-builder-view-mode" value="completed"` (label: `Completed`)
  - Added button-style visual states with `peer-checked` classes to match theme.
  - Updated JS references:
    - removed `infinityBuilderViewFilterElement`
    - added `infinityBuilderViewModeRadioElements`
    - changed event wiring from `select change` to radio `change`
    - added render-time checked-state sync for both radios.

- **Design decision:**
  - Radio buttons provide clearer mode switching semantics than a dropdown for two fixed views.

- **Validation performed:**
  - Inline script parse for `index.html` via `new Function(...)`
  - Result: `Parsed 1 inline script block(s) successfully.`

### 2026-02-22 - Infinity Builder mock data reverted to original source (Codex)

- **What changed:** Reverted Infinity Builder from mock snapshot data back to original/real data flow.
- **Files affected:** `index.html`, `Claude_Notes/charge-documentation.md`, `Claude_Notes/Current Project Status.md`

- **Implementation (`index.html`):**
  - Updated toggles:
    - `INFINITY_BUILDER_MOCKUP_MODE_ENABLED = false`
    - `INFINITY_BUILDER_MOCKUP_RESET_CLAIMS_ON_LOAD = false`
  - Result: `buildInfinityBuilderTierSnapshots()` now uses the non-mock branch and renders from original data again.

- **Validation performed:**
  - Inline script parse for `index.html` via `new Function(...)`
  - Result: `Parsed 1 inline script block(s) successfully.`

### 2026-02-22 - Infinity Builder claim reconciliation reset against real tier state (Codex)

- **What changed:** Added automatic claim reconciliation so stored claimed records are reset/removed if their tiers are not actually completed in current real data.
- **Files affected:** `index.html`, `Claude_Notes/charge-documentation.md`, `Claude_Notes/Current Project Status.md`

- **Implementation (`index.html`):**
  - Added helpers:
    - `replaceInfinityBuilderClaimMapForCurrentUser(nextClaimMap)`
    - `reconcileInfinityBuilderClaimMapWithTiers(claimMap, tiers)`
  - Reconciliation behavior:
    - builds set of currently completed tiers from live snapshot
    - keeps only claim records whose tier is still completed
    - writes back filtered claim map for current user if stale claims exist.
  - `renderInfinityBuilderDashboardCard()` now uses reconciled claim map before rendering.

- **Behavior result:**
  - If claimed bonus exists from old/mock state but current direct sponsorship data does not support completion, that claim is automatically cleared on render.

- **Validation performed:**
  - Inline script parse for `index.html` via `new Function(...)`
  - Result: `Parsed 1 inline script block(s) successfully.`

### 2026-02-22 - Added Legacy Leadership Bonus component under Infinity Builder on user dashboard (Codex)

- **What changed:** Reused the existing Infinity Builder Bonus component layout and added a second same-sized component directly below it on the user dashboard, named `Legacy Leadership Bonus`.
- **Files affected:** `index.html`, `Claude_Notes/charge-documentation.md`, `Claude_Notes/Current Project Status.md`

- **Implementation (`index.html`):**
  - Updated the left dashboard column wrapper from `lg:col-span-2` to `lg:col-span-2 space-y-6` to support stacked cards.
  - Kept the existing Infinity Builder Bonus component as the first card.
  - Added a second full component block under it with matching structure and size styling (`bg-surface-raised border border-surface-border rounded-xl p-6 shadow-depth-1 h-full`).
  - Updated user-facing title text in the new block to `Legacy Leadership Bonus`.
  - Assigned unique ids/names to all duplicated controls in the new block (`legacy-leadership-*`) to avoid DOM id collisions.

- **Design decision:**
  - Reused the exact Infinity Builder card structure and spacing so the new component visually matches size and footprint while staying safely isolated from existing Infinity Builder JS bindings.

- **Known limitation:**
  - The new Legacy Leadership component is currently a UI duplicate and is not yet wired to dedicated runtime/business logic.

### 2026-02-22 - Legacy Leadership Bonus runtime wired with Legacy-package seed filter (Codex)

- **What changed:** Wired both dashboard components as live modules and added package-gated population logic for Legacy Leadership Bonus.
- **Files affected:** `index.html`, `Claude_Notes/charge-documentation.md`, `Claude_Notes/Current Project Status.md`

- **Implementation (`index.html`):**
  - Added full runtime controller for the new `Legacy Leadership Bonus` card:
    - view-mode radios (`Building` / `Completed`)
    - pagination controls
    - tier card rendering
    - claim + archive flow with dedicated storage key.
  - Added separate claim storage for Legacy Leadership:
    - `LEGACY_LEADERSHIP_CLAIM_STORAGE_KEY = 'charge-legacy-leadership-claims-v1'`
  - Generalized claim-store helpers to accept a storage-key argument so Infinity and Legacy run independently.
  - Extended binary node records to include normalized package key:
    - `enrollmentPackage: normalizeMemberKey(member?.enrollmentPackage)`
  - Updated tier snapshot builder to support seed-node qualification via options.
  - Added Legacy snapshot source:
    - `buildLegacyLeadershipTierSnapshots()`
    - filters seed/direct sponsorship slots to members with `legacy-builder-pack` only.
  - Synced rerender triggers so both components update together after:
    - initial page render
    - binary tree sync
    - enrollment-derived metric recalculation.

- **Design decision:**
  - Legacy Leadership reuses Infinity logic/UX 1:1, with only one behavior gate:
    - Legacy Leadership tiers seed from Legacy package sponsorship only.

- **Validation performed:**
  - Inline script parse for `index.html` via `new Function(...)`
  - Result: `Parsed 2 inline script block(s) successfully.`

### 2026-02-22 - Infinity + Legacy bonus container height trim (removed filler stretch) (Codex)

- **What changed:** Reduced oversized vertical span for both stacked bonus components by removing hidden filler-card height padding.
- **Files affected:** `index.html`, `Claude_Notes/charge-documentation.md`, `Claude_Notes/Current Project Status.md`

- **Implementation (`index.html`):**
  - In both `renderInfinityBuilderDashboardCard()` and `renderLegacyLeadershipDashboardCard()`:
    - removed empty-state filler insertion (`INFINITY_BUILDER_CARDS_PER_PAGE - 1`)
    - removed paginated filler insertion (`INFINITY_BUILDER_CARDS_PER_PAGE - paginatedItems.length`)
  - Containers now render only actual visible cards/empty-state content.

- **Result:**
  - Both modules no longer appear over-tall when stacked.
  - Height is content-driven instead of fixed footprint-driven.

- **Validation performed:**
  - Inline script parse for `index.html` via `new Function(...)`
  - Result: `Parsed 2 inline script block(s) successfully.`

### 2026-02-22 - Bonus container span fix (grid stretch correction) (Codex)

- **What changed:** Fixed remaining span/oversize behavior in the stacked bonus area after screenshot validation.
- **Files affected:** `index.html`, `Claude_Notes/charge-documentation.md`, `Claude_Notes/Current Project Status.md`

- **Implementation (`index.html`):**
  - Added `self-start` to the stacked bonus grid item wrapper:
    - `lg:col-span-2 space-y-6 self-start`
  - Removed `h-full` from both stacked bonus card shells (Infinity + Legacy).
  - Result: cards no longer stretch vertically due grid row stretch behavior.

- **Validation performed:**
  - Authenticated dashboard screenshot:
    - `temporary screenshots/screenshot-64-dashboard-span-fix-2.png`
  - Inline script parse for `index.html` via `new Function(...)`
  - Result: `Parsed 2 inline script block(s) successfully.`

### 2026-02-22 - Infinity Builder eligibility rework + weekly 1% direct-team override (user-side) (Codex)

- **What changed:** Implemented the requested Infinity Builder system update on user side:
  - eligibility now requires `rank gate (Infinity/Legacy)` **and** `3 direct Infinity Pack and above enrollments`
  - added weekly `1%` commission override from direct enrolled users who are themselves Infinity Builder eligible/completed.
- **Files affected:** `index.html`, `Claude_Notes/charge-documentation.md`, `Claude_Notes/Current Project Status.md`

- **Implementation (`index.html`):**
  - Added Infinity qualifying package gate:
    - `infinity-builder-pack` and `legacy-builder-pack`
  - Added eligibility engine updates:
    - direct Infinity+ enrollment count
    - requirement milestone timestamp (`3rd qualifying enrollment`)
    - retained rank gating (`Infinity`, `Legacy`)
  - Updated Infinity tier seeding logic:
    - Infinity Builder tier snapshots now seed from Infinity+ package enrollees only.
  - Added weekly override commission computation:
    - source: direct enrolled users who are Infinity Builder eligible
    - base: each qualified direct user’s organization BV events (`packageBv`) in closed cutoff cycles
    - rate: `1%`
    - cutoff cadence: weekly server cutoff config (`Saturday 11:59 PM PT` by default, read from cutoff card config)
    - retroactive behavior: includes historical closed-cycle volume (using enrollment timestamps)
  - Applied override to Infinity Builders Bonus top-card balance:
    - total balance now includes claimed tier commissions + auto-added weekly 1% override commissions.
  - Updated locked-state messaging on Infinity/Legacy cards:
    - now shows rank + direct Infinity+ enrollment progress requirement.

- **Design decision:**
  - Weekly override is computed deterministically from stored member history + cutoff cycle boundaries, avoiding manual claim steps and enabling retroactive payout reconstruction.

- **Validation performed:**
  - Authenticated dashboard screenshot:
    - `temporary screenshots/screenshot-65-infinity-weekly-override.png`
  - Inline script parse for `index.html` via `new Function(...)`
  - Result: `Parsed 2 inline script block(s) successfully.`

---

### 2026-02-22 - Infinity Builder tier completion reduced from 40 nodes to 4

- **What changed:** Reduced `INFINITY_BUILDER_TOTAL_NODES_PER_TIER` from `40` to `4` per owner request.
- **Files affected:** `index.html`
- **Impact:**
  - Tier completion now requires 4 lit nodes (1 sponsor + 3 downline) instead of 40.
  - The requirement is 3 nodes **excluding** the user/sponsor node.
  - `INFINITY_BUILDER_DOWNLINE_NODE_CAP` automatically adjusts to `3` (derived constant).
  - All progress bars, completion checks, claim records, and display denominators reference the constant, so the change propagates everywhere.
- **Reason:** Owner decision to simplify tier completion requirements.

---

### 2026-02-22 - Infinity Builder / Legacy Leadership system separation + view label updates

- **What changed:**
  - Separated node-count constants: Infinity Builder uses `4` nodes per tier, Legacy Leadership retains `40` nodes per tier.
  - Added `LEGACY_LEADERSHIP_TOTAL_NODES_PER_TIER = 40` and `LEGACY_LEADERSHIP_DOWNLINE_NODE_CAP = 39` as separate constants.
  - Made `buildInfinityBuilderTierSnapshots()` accept `totalNodesPerTier` option so Legacy Leadership passes `40`.
  - Replaced all `INFINITY_BUILDER_TOTAL_NODES_PER_TIER` references in Legacy Leadership render code with `LEGACY_LEADERSHIP_TOTAL_NODES_PER_TIER`.
  - Renamed Infinity Builder "Completed" view button to "Active" (claimed tiers are now actively earning 1% commission).
  - Updated Infinity Builder empty-state and pagination copy from "claimed tiers" to "active tiers".
  - Legacy Leadership "Completed" button label kept unchanged (different system).
  - Updated Legacy Leadership locked-state messaging:
    - Now reads: "To Participate in Legacy Leadership Bonus, Enroll 3 Direct users to Legacy Package. 0/3"
    - Subtitle: "Legacy rank and 3 direct Legacy enrollments required"
    - No longer references "Infinity+" in Legacy Leadership context.
- **Files affected:** `index.html`
- **Validation:** Inline script parse passed.

---

### 2026-02-22 - Legacy Leadership eligibility fully separated from Infinity Builder

- **What changed:**
  - Legacy Leadership was incorrectly using the shared `resolveInfinityBuilderEligibility()` function, which considers both Infinity and Legacy ranks as eligible and counts Infinity+ package enrollments. This caused Infinity Pack users to be treated as "eligible" for Legacy Leadership, bypassing the locked card.
  - Created a fully independent eligibility system for Legacy Leadership.

- **New constants added (`index.html`):**
  - `LEGACY_LEADERSHIP_ELIGIBLE_RANKS = new Set(['legacy'])` — only Legacy rank qualifies
  - `LEGACY_LEADERSHIP_DIRECT_ENROLLMENT_REQUIREMENT = 3` — separate from Infinity Builder

- **New functions added (`index.html`):**
  - `getLegacyLeadershipQualifiedDirectEnrollmentsForSponsor()` — counts only Legacy Package enrollments (not Infinity+)
  - `resolveLegacyLeadershipEligibilityFromRankAndSponsor()` — checks Legacy-only rank set and Legacy enrollments
  - `resolveLegacyLeadershipEligibility()` — main entry point for Legacy Leadership eligibility
  - `buildLegacyLeadershipEligibilityRequirementMessage()` — generates requirement text referencing "Legacy rank" and "Legacy Package"

- **Functions updated (`index.html`):**
  - `renderLegacyLeadershipDashboardCard()` — now calls `resolveLegacyLeadershipEligibility()` instead of `resolveInfinityBuilderEligibility()`
  - `renderLegacyLeadershipTopBonusCard()` — fixed `safeEligibility` undefined variable bug; now properly declares it from the `eligibility` parameter; uses `LEGACY_LEADERSHIP_DIRECT_ENROLLMENT_REQUIREMENT` for fallbacks

- **Bug fixed:** `safeEligibility` was referenced in `renderLegacyLeadershipTopBonusCard()` footnote but never declared in that scope — variable was undefined, causing fallback values to always display.

- **Result for Infinity Pack user:**
  - Legacy Leadership now correctly shows as **Locked**
  - "Current rank: Infinity" (shows actual rank, not hardcoded "Legacy")
  - "Direct Legacy enrollments: 0 / 3" (counts Legacy package enrollments only)
  - "To Participate in Legacy Leadership Bonus, Enroll 3 Direct users to Legacy Package. 0/3"
  - Top card subtitle: "Legacy rank and 3 direct Legacy enrollments required"

- **Files affected:** `index.html`
- **Validation:** Parsed 4 inline script block(s) successfully.

---

### 2026-02-22 - Infinity Builder Active tier cards: per-node eligibility indicators

- **What changed:**
  - Active (claimed) tier cards in Infinity Builder now show per-sponsor eligibility indicators.
  - Each sponsor node displays green/lit if the sponsor has met their own 3-enrollment requirement (Active — earning 1%), or gray/dim if they haven't (Inactive — not earning 1%).
  - Hover tooltip on each chip shows eligibility status text.
  - Small legend row below the sponsor chips: "Active (earning 1%)" and "Inactive".
  - Legacy Leadership Bonus left unchanged per owner instruction.

- **New constants added (`index.html`):**
  - `SPONSOR_NODE_ELIGIBLE_PALETTE` — green palette (`#10E4A0`, semantic-success)
  - `SPONSOR_NODE_INELIGIBLE_PALETTE` — gray palette (`#6B8299`, text-tertiary)

- **New function added (`index.html`):**
  - `findRegisteredMemberByHandle(handleOrUsername)` — looks up a member from `registeredMembers` by handle string, strips `@` prefix, matches against `memberUsername`, `username`, `id`, `email`. Returns member or `null`.

- **Rendering changes (`index.html`):**
  - Infinity Builder archive card `sponsorChipMarkup` now calls `findRegisteredMemberByHandle()` + `resolveInfinityBuilderEligibilityForMember()` per sponsor.
  - Chip styling uses eligibility palette: green dot + tinted border/bg for eligible, gray dot (50% opacity) + gray tint for ineligible.
  - Added `sponsorLegendMarkup` with small dots and labels below the chips.
  - CSS-only hover tooltip via Tailwind `group-hover:opacity-100`.

- **Files affected:** `index.html`
- **Validation:** Parsed 4 inline script block(s) successfully.

---

### 2026-02-23 - Binary Tree sync + spillover privacy/cycle logic rework (Codex)

- **What changed:** Reworked Binary Tree data shaping so user/admin trees stay aligned with placement behavior, and spillover-received branches now participate in cycle calculations.
- **Files affected:** `binary-tree.mjs`, `index.html`, `admin.html`, `Claude_Notes/charge-documentation.md`, `Claude_Notes/Current Project Status.md`

- **Implementation (`binary-tree.mjs`):**
  - Updated `deriveBusinessVolumes()` placement propagation to include every placed child subtree, not only sponsor-matched children.
  - Updated cycle base values:
    - `leftPv = placementCredits.left`
    - `rightPv = placementCredits.right`
  - Retained `spilloverLeftPv`/`spilloverRightPv` as sponsor-side reference metrics, but removed them from cycle leg totals to prevent duplicate counting in cycle math.

- **Implementation (`index.html`):**
  - Rebuilt `createBinaryTreeDataFromRegisteredMembers()` around a two-stage model:
    - build global placement graph from all `registeredMembers`
    - scope to the signed-in member’s placement subtree (receiving-parent visibility)
  - This fixes missing spillover children under receiving parents when those nodes are sponsored by uplines.
  - Added user-side privacy masking for non-root binary nodes:
    - replaces personal names/usernames with anonymized labels (`Spillover Direct N`, `Direct Sponsor N`, `Network Member N`)
    - masks member handles to generated identifiers
    - hides per-node country marker (`DEFAULT_COUNTRY_FLAG`)
  - Rank and leg BV values remain visible so cycle-building decisions still work.

- **Implementation (`admin.html`):**
  - Rebuilt `createBinaryTreeDataFromRegisteredMembers()` to construct from the full global member placement graph and scope admin root to company/global root.
  - Admin tree now reads the same placement-built data basis as user tree and no longer depends on admin-only sponsor-chain filtering for binary rendering.

- **Behavior result:**
  - Receiving parents can now see spillover/direct nodes in their binary subtree without personal identity leakage.
  - Spillover-placed volume now contributes through placement legs, enabling intended cycle pairing behavior when the opposite leg is built.
  - Admin binary view stays synchronized to full network placement state.

- **Validation performed:**
  - Inline script parse:
    - `index.html`: `Parsed 2 inline script block(s) successfully.`
    - `admin.html`: `Parsed 2 inline script block(s) successfully.`

---

### 2026-02-23 - User binary privacy refinement: anonymize spillover branch only (Codex)

- **What changed:** Refined user-side Binary Tree privacy behavior so anonymization applies only to spillover branches received from upline, while personally enrolled branches remain visible.
- **Files affected:** `index.html`, `Claude_Notes/charge-documentation.md`, `Claude_Notes/Current Project Status.md`

- **Implementation (`index.html`):**
  - Updated subtree scoping metadata to preserve source spillover identity:
    - `scopedNode.isSpillover` now keeps source spillover signal even when sponsor is outside scoped subtree.
  - Replaced global anonymization logic with targeted branch masking:
    - detect root-level spillover direct children (`placementParentId === root` + `isSpillover`)
    - breadth-first traverse each spillover direct child subtree
    - anonymize only nodes in those spillover subtrees.
  - New label behavior in masked branches:
    - root spillover direct nodes -> `Spillover Direct N`
    - descendants in spillover branch -> `Spillover Network N`
  - Personally enrolled direct branches and their descendants now keep real display identity.

- **Behavior result:**
  - Example match:
    - Left leg received via upline spillover -> branch anonymized.
    - Right leg personally enrolled -> branch remains visible.
  - BV/cycle matching still uses placement-leg accumulation and remains active for both branches.

- **Validation performed:**
  - Inline script parse:
    - `index.html`: `Parsed 2 inline script block(s) successfully.`

## Binary Tree Fullscreen Selected Node Privacy + Spillover Parent Fix (2026-02-23)

- Updated selected-node behavior in `binary-tree.mjs` for spillover privacy:
  - `Direct Sponsor` now shows `Anonymous` and disables navigation when the selected node is spillover.
  - `Placement Parent` now resolves from explicit `placementParentId` first, then falls back to detected tree parent via child linkage when placement metadata is partial.
- Updated binary-node metadata visibility rules:
  - Added spillover/anonymized node detection helper.
  - Hidden rank display (rank-mode metric) for spillover or anonymized nodes across:
    - node cards
    - selected panel
    - search results
  - Hidden country display for spillover or anonymized nodes across:
    - node cards (flag icon suppressed)
    - selected panel (country code set to `-`)
    - search results (country flag chip suppressed)
- Design decision:
  - Used a fallback placement-parent resolver in UI to keep spillover parent display stable even when incoming data omits `placementParentId`.
- Known limitation:
  - Anonymous detection is pattern-based (`spillover-*`, `anonymous-*`, and known masked name prefixes). If future masking labels change, helper patterns must be updated.
- Applied files:
  - `binary-tree.mjs`
- Validation:
  - `node --check binary-tree.mjs` passed.

## Binary Tree Spillover Sponsor Identity Fix (2026-02-23)

- Fixed a normalization regression where spillover nodes with out-of-scope sponsors were reassigned to their placement parent sponsor during `normalizeData()`.
- Root cause:
  - when `sponsorId` was unresolved in scoped user trees, logic defaulted `sponsorId` to `placementParentId`.
  - this removed spillover classification and made Selected Node show `You (@viewer)` as Direct Sponsor.
- Updated behavior in `binary-tree.mjs`:
  - preserve explicit spillover state (`hadExplicitSpillover`) when sponsor identity is unresolved/out-of-scope.
  - do not force sponsor fallback to placement parent for explicitly flagged spillover nodes.
  - recompute `isSpillover` using preserved explicit spillover signal OR sponsor/placement mismatch.
- Result:
  - spillover nodes continue to be treated as spillover in selected-panel logic, so Direct Sponsor masking stays `Anonymous` instead of incorrectly showing `You`.
- Applied file:
  - `binary-tree.mjs`
- Validation:
  - `node --check binary-tree.mjs` passed.

## Binary Tree Spillover Violet Node Theme Update (2026-02-23)

- Updated spillover node visuals in `binary-tree.mjs` to use a violet theme for faster identification.
- Rendering changes:
  - spillover nodes now use violet-tinted backgrounds (active/inactive variants)
  - spillover node borders now use violet outlines
  - selected spillover nodes use a brighter violet selected border to preserve focus state while staying spillover-distinct
- Non-spillover node visuals remain unchanged.
- Design decision:
  - applied both border + fill tint so spillover organizations are visually obvious at a glance in fullscreen and standard tree views.
- Applied file:
  - `binary-tree.mjs`
- Validation:
  - `node --check binary-tree.mjs` passed.

## Binary Tree Spillover Highlight Fine-Tune: Received-Only User Perspective (2026-02-23)

- Refined spillover color behavior and toned down violet intensity in shared renderer (`binary-tree.mjs`).
- New renderer option added:
  - `spilloverHighlightMode: 'all' | 'received-only' | 'none'`
- New mode behavior:
  - `received-only`: highlight only spillover nodes whose sponsor is outside the current viewer root perspective (`node.sponsorId !== rootId`).
  - This keeps sender-root spillovers visually regular while still highlighting received spillovers.
- Applied runtime wiring:
  - User shell (`index.html`) now initializes binary tree with `spilloverHighlightMode: 'received-only'`.
  - Admin shell (`admin.html`) now initializes binary tree with `spilloverHighlightMode: 'none'`.
- Color tuning:
  - Spillover background + border palette shifted to subtler violet shades to reduce visual intensity.
- Result for requested scenario:
  - In `sethfozz` tree (sender), spillover nodes appear like regular nodes.
  - In `seth` tree (receiver), spillover nodes appear with violet differentiation.
- Applied files:
  - `binary-tree.mjs`
  - `index.html`
  - `admin.html`
- Validation:
  - `node --check binary-tree.mjs` passed.

## User Binary Anonymization Scope Fix: Outside-Org Spillover Only (2026-02-23)

- Fixed user-side anonymization selector in `createBinaryTreeDataFromRegisteredMembers()` (`index.html`).
- Previous issue:
  - anonymization started from any spillover branch root in scoped tree, which could mask spillovers sponsored by the same user/downline organization.
- New behavior:
  - marks a spillover node as anonymization-eligible only when its source sponsor exists globally but is outside the current scoped organization.
  - computes `externalSpilloverSourceNodeIds` using source-graph identity (`sourceNode.sponsorId` vs `includedNodeIds`).
  - anonymization BFS starts from top-most external-source spillover entry nodes only.
- Result:
  - in sender/upline-owned network views (e.g., `sethfozz`), internal spillovers remain fully visible.
  - in receiver views (outside-source spillover into org), anonymization still applies.
- Applied file:
  - `index.html`
- Validation:
  - `index.html` inline script parse passed (`Parsed 2 inline script block(s) successfully.`)
  - data simulation:
    - `sethfozz`: `anonymizedCount = 0`
    - `seth`: external-source spillover anonymization remains active.

## Binary Tree Select Node Privacy Sync Fix (2026-02-23)

- Updated `binary-tree.mjs` Select Node privacy gating so it matches user-tree anonymization scope.
- Previous mismatch:
  - Select Node masked `Direct Sponsor` for all spillover nodes (`isSpillover === true`).
  - Tree view anonymization was already narrowed to outside-organization spillover sources.
- New behavior:
  - Added `shouldApplyNodePrivacyMask(node)` used by Select Node + rank/country masking.
  - Privacy mask now triggers only when:
    - node is explicitly anonymized by label/handle pattern, OR
    - spillover source is outside scoped organization (spillover node with unresolved sponsor in scoped tree).
- Result:
  - Internal/downline spillover nodes in user org (e.g., `sethfozz` own network) now show actual Direct Sponsor in Select Node.
  - Outside-org spillover nodes remain masked as `Anonymous`.
- Applied file:
  - `binary-tree.mjs`
- Validation:
  - `node --check binary-tree.mjs` passed.

## User Binary Anonymous Ownership Exception (2026-02-23)

- Enhanced user-side anonymous masking logic in `index.html` to preserve visibility for viewer-owned sponsor branches, even inside outside-source spillover placement branches.
- New behavior:
  - still detects external-source spillover entry nodes for anonymization roots.
  - while traversing anonymization branch, skips masking nodes that belong to the viewer's sponsor organization (direct + sponsor-downline ownership graph).
- Implementation details:
  - added sponsor-graph ownership index (`sponsoredChildrenBySponsorId`)
  - derived `viewerSponsoredOrganizationNodeIds` from viewer identity in sponsor graph
  - anonymization BFS now applies mask per-node only when node is not viewer-owned
- Requested scenario alignment:
  - if `eagleone` spillovers into `eaglethree` branch, external node stays anonymous to `eaglethree`
  - if `eaglethree` enrolls/spillovers a node under that anonymous branch, that enrolled node remains visible to `eaglethree`
- Applied file:
  - `index.html`
- Validation:
  - inline script parse passed (`Parsed 2 inline script block(s) successfully.`)
  - local dataset simulation:
    - `eaglethree`: spillover `2`, anonymous `1` (viewer-owned direct remains visible)
    - `sethfozz`: anonymous `0`
    - `seth`: outside-source anonymization remains active.

## Binary Tree Fullscreen Header Summary Chips (2026-02-23)

- Added compact fullscreen header KPI chips that reuse existing Binary Tree summary metrics:
  - Network Members
  - Account Rank
  - Estimated Cycles
  - Leg Volumes (L | R)
- Design intent:
  - chips use timer-chip scale and visual treatment (compact pill/card size) so they fit as header utilities in fullscreen.
  - mobile fullscreen keeps chips hidden to avoid header crowding.
- User shell (`index.html`):
  - inserted `#tree-fullscreen-summary-strip` inside `#tree-header-bar`
  - added compact chip styles for fullscreen mode
  - wired values in `applyBinaryTreeDashboardSummary()` so chips mirror existing summary cards.
- Admin shell (`admin.html`):
  - mirrored the same markup, styles, and summary wiring for parity.
- Reuse model:
  - fullscreen chips are fed from the same summary computation path already used by page cards (`applyBinaryTreeDashboardSummary`).
- Applied files:
  - `index.html`
  - `admin.html`
- Validation:
  - `index.html`: `Parsed 2 inline script block(s) successfully.`
  - `admin.html`: `Parsed 2 inline script block(s) successfully.`

## Fullscreen Header Swipe Rail + KPI Icons (2026-02-23)

- Upgraded fullscreen header metrics presentation in both user/admin Binary Tree shells.
- Structural update:
  - Added `#tree-fullscreen-metrics-rail` as a horizontal metrics container.
  - Moved server time chip + KPI chips into the same rail so they sit next to each other.
- Visual update:
  - Added per-chip icons for:
    - Server Time
    - Network Members
    - Account Rank
    - Estimated Cycles
    - Leg Volumes
- Mobile interaction update:
  - In fullscreen mobile, metrics rail is now horizontally scrollable/swipeable (`overflow-x: auto`, touch pan-x).
  - This replaces single fixed server-time behavior with swipable chip sequence in the same header position.
- Desktop behavior:
  - chips remain inline next to server time with overflow-safe horizontal scroll fallback when constrained.
- Applied files:
  - `index.html`
  - `admin.html`
- Validation:
  - `index.html`: `Parsed 2 inline script block(s) successfully.`
  - `admin.html`: `Parsed 2 inline script block(s) successfully.`

## Fullscreen Header Stacked Metric Deck (2026-02-23)

- Replaced horizontal swipe rail with a stacked metric-card deck in fullscreen header.
- New interaction model:
  - one card shown at a time
  - prev/next controls cycle through cards
  - touch swipe still changes cards one step at a time (next/previous behavior, not free horizontal scrolling)
- Cards now use dashboard-like card treatment with icon tile + accent glow for each metric:
  - Server Time
  - Network Members
  - Account Rank
  - Estimated Cycles
  - Leg Volumes
- Applied parity update to both user and admin shells.
- Applied files:
  - `index.html`
  - `admin.html`
  - `binary-tree.mjs`
- Validation:
  - `node --check binary-tree.mjs` passed.
  - `index.html` inline scripts syntax check passed (`4` blocks).
  - `admin.html` inline scripts syntax check passed (`4` blocks).

## Fullscreen Metrics Responsive Layout Tuning (2026-02-23)

- Updated fullscreen metric cards behavior by viewport:
  - Desktop/PC: show all metric cards at once in the header (no single-card carousel).
  - Mobile: keep one-card stack with swipe navigation.
- Mobile header controls update:
  - arrow buttons removed from layout
  - added dot paginator under the stacked card for active-card indication and direct selection.
- Width/space optimization:
  - mobile stack width widened after removing arrow controls.
  - desktop deck uses a 5-column grid to keep all cards visible without shifting header action controls.
- Applied files:
  - `binary-tree.mjs`
  - `index.html`
  - `admin.html`
- Validation:
  - `node --check binary-tree.mjs` passed.
  - `index.html` inline scripts syntax check passed (`4` blocks).
  - `admin.html` inline scripts syntax check passed (`4` blocks).

## Mobile Binary Tree Summary Cards (Non-Fullscreen) (2026-02-23)

- Applied fullscreen-inspired card UX to the Binary Tree summary cards outside fullscreen on mobile.
- Mobile behavior (`#tree-summary-overview`):
  - single stacked card view
  - swipe left/right to move between cards
  - dot paginator below cards for navigation and active state.
- Desktop/tablet behavior remains grid-based (all summary cards visible at once).
- Existing summary metric IDs and data bindings were preserved.
- Applied files:
  - `index.html`
  - `admin.html`
- Validation:
  - `index.html` inline scripts syntax check passed (`4` blocks).
  - `admin.html` inline scripts syntax check passed (`4` blocks).

## Infinity Builder Tier Completion + Claim Gate Sync Fix (2026-02-23)

- Fixed a user-side Infinity Builder logic conflict where a tier could complete/claim even when one direct slot still displayed `Open Slot 3`.
- Root cause:
  - tier completion was based on `litNodeCount` from seeded-branch downline totals without enforcing all 3 direct sponsor slots.
  - UI direct-slot indicators were derived from node progress (`visibleLitNodeCount - 1`) instead of actual direct seed count.
- Updated behavior in `index.html`:
  - `buildInfinityBuilderTierSnapshots()` now requires full direct-seed requirement before completion:
    - added `directRequirementMet = seedCount >= 3`
    - `isCompleted` now requires `directRequirementMet && litNodeCount >= totalNodesPerTier`
    - when direct requirement is not met, effective lit progress is capped by direct seed count to prevent false completion states.
  - Infinity Builder active card renderer now drives direct-slot indicators from `tier.seedCount` (with `seedHandles` fallback), not from lit-node progress.
  - Legacy Leadership active card renderer received the same direct-slot indicator correction to keep both components consistent.
- Result:
  - Tier 2 no longer becomes claimable with `Open Slot 3`.
  - Claim state reconciliation can automatically drop previously-invalid claim records once a tier is no longer completed under corrected logic.
- Applied files:
  - `index.html`
- Validation:
  - Inline script parse check passed (`Parsed 1 inline script block(s) successfully.`).

## Infinity Builder Active/Claimed Tier Card Customization + Running 1% Snippets (2026-02-23)

- Updated Infinity Builder claimed-tier cards to remove fixed commission and completion-summary blocks.
- UI changes in `index.html` (Infinity Builder archive/active state cards):
  - removed displayed tier amount (`$150.00` card value block)
  - removed `Completed Nodes` block
  - renamed section heading:
    - `First 3 Direct Sponsors (Child Nodes)` -> `Infinity Builder Bonus`
  - replaced sponsor chips with compact per-seed snippets showing:
    - sponsor handle + active/inactive status
    - running organization BV
    - projected `1%` value by cutoff (`$` amount)
- New helper function:
  - `resolveInfinityBuilderDirectMemberRunningOverrideBreakdown(directMember, options)`
  - computes per-direct-sponsor:
    - `closedVolumeValue` / `closedCommissionValue`
    - `runningVolumeValue` / `runningCommissionValue`
  - uses same cutoff-calendar logic as weekly override flow for consistency.
- Weekly override aggregator refactor:
  - `resolveInfinityBuilderWeeklyOverrideCommissionBreakdown()` now reuses the new per-direct helper when summing closed-cycle commissions.
- Applied files:
  - `index.html`
- Validation:
  - Inline script parse check passed (`Parsed 1 inline script block(s) successfully.`).

## Infinity Builder Tier Card Label Copy Update (2026-02-23)

- Updated Infinity Builder tier card copy in `index.html`:
  - claim CTA text now shows amount explicitly:
    - `Claim $150.00 Commission` (rendered from `INFINITY_BUILDER_TIER_BONUS`)
  - claimed/archive tier status badge text changed:
    - `Claimed` -> `Active`
- Applied files:
  - `index.html`
- Validation:
  - Inline script parse check passed (`Parsed 1 inline script block(s) successfully.`).

## Tier Helper Text Copy Update (2026-02-23)

- Updated completed-tier helper text in `index.html`:
  - from: `Tier complete. $150.00 bonus ready.`
  - to: `Tier Complete.`
- Applied to both bonus card render paths sharing this helper pattern:
  - Infinity Builder tier cards
  - Legacy Leadership tier cards
- Applied files:
  - `index.html`
- Validation:
  - Inline script parse check passed (`Parsed 1 inline script block(s) successfully.`).

## Claim Button Primary Color Update (2026-02-23)

- Updated tier-card claim CTA styling in `index.html` to match the primary `Request Payout` button treatment.
- Applied to both tier claim buttons:
  - Infinity Builder claim button
  - Legacy Leadership claim button
- Style update summary:
  - switched to `bg-brand-500` + `text-text-inverse`
  - added `shadow-glow`
  - hover now uses `bg-brand-400` + slight lift
  - focus ring now uses primary payout-button style (`ring-brand-300` + offset)
  - removed tier-accent inline color styling so CTA remains consistently primary.
- Applied files:
  - `index.html`
- Validation:
  - Inline script parse check passed (`Parsed 1 inline script block(s) successfully.`).

## Date Completed Invoice Link Placeholder (2026-02-23)

- Added invoice link placeholders beside `Date Completed:` in archived/active tier cards for future invoice component integration.
- Updated in `index.html`:
  - Infinity Builder archive cards:
    - added `Invoice` link-style button next to completion date
    - metadata attributes added:
      - `data-invoice-link="infinity-builder"`
      - `data-invoice-tier`
      - `data-invoice-completed-at`
  - Legacy Leadership archive cards:
    - added matching `Invoice` link-style button
    - metadata attributes added:
      - `data-invoice-link="legacy-leadership"`
      - `data-invoice-tier`
      - `data-invoice-completed-at`
- Purpose:
  - provide a clean UI hook point for future invoice modal/page component wiring without changing current claim logic.
- Applied files:
  - `index.html`
- Validation:
  - Inline script parse check passed (`Parsed 1 inline script block(s) successfully.`).

## Auto-Switch To Active View After Claim (2026-02-23)

- Updated tier claim behavior in `index.html` so pressing claim auto-switches to the `Active` view tab (internally `completed` mode) where claimed cards are listed.
- Applied for both bonus components:
  - Infinity Builder claim flow
  - Legacy Leadership claim flow
- Behavior details:
  - after successful claim record save, view mode is set to archive/active mode
  - page index is moved to the last archive page so the newest claimed card is immediately visible.
- Applied files:
  - `index.html`
- Validation:
  - Inline script parse check passed (`Parsed 1 inline script block(s) successfully.`).

## Account Overview Total BV Card: Personal Organization BV Subtext (2026-02-23)

- Clarified BV scopes by adding a dedicated personal-organization subtext under `Total Organization BV` in the Account Overview card.
- `Total Organization BV` remains the binary-leg total (`left + right leg`) which can include spillover-influenced leg volume.
- Added new UI line in `index.html`:
  - `Personal Organization BV: ...`
  - element id: `account-overview-personal-organization-bv`
- Data wiring:
  - `renderOrganizationSummaryRollups()` now computes `personalOrganizationBv` from `getOrganizationMembersForCurrentSponsor()` and sums each member BV (`packageBv` fallback to package meta BV).
  - this value is rendered into the new subtext element and returned in rollup payload for future use.
- Applied files:
  - `index.html`
- Validation:
  - Inline script parse check passed (`Parsed 1 inline script block(s) successfully.`).

## Account Overview Total BV Helper Copy Removal (2026-02-23)

- Removed helper text under `Total Organization BV` card:
  - `Binary organization volume (left + right leg)`
- Kept the new `Personal Organization BV` subtext line as the supporting context line.
- Applied files:
  - `index.html`
- Validation:
  - Inline script parse check passed (`Parsed 1 inline script block(s) successfully.`).

## Binary Tree Fullscreen Enroll Re-Apply (2026-02-26)

- Re-applied fullscreen binary-tree enroll workflow and modal enrollment flow after rollback.
- Updated `binary-tree.mjs`:
  - Added enroll-mode toggle wiring (`tree-mobile-enroll-toggle`) and tree-level events:
    - `binary-tree-enroll-mode-changed`
    - `binary-tree-enroll-member-request`
  - Restored anticipation slot rendering in fullscreen enroll mode.
  - Anticipation is now restricted to nodes with missing children only (0 or 1 child).
  - Increased enroll-mode layout spacing by reserving missing-child depth and widening slot spacing to reduce overlap.
  - Anticipation nodes now use explicit rounded hit areas so the full card area is clickable.
  - Exiting fullscreen now safely clears enroll mode and re-renders normal tree state.
- Updated `index.html`:
  - Moved `Enroll Member` toggle into the fullscreen top-row control cluster beside furthest navigation/home/minimap row controls.
  - Added centered in-fullscreen enroll modal (`tree-enroll-modal`) with responsive max-height/scroll behavior for laptop and smaller screens.
  - Added modal-open state class handling (`tree-enroll-window-open`) to hide conflicting bottom search anchor/tools while modal is active.
  - Added locked-placement form flow driven by anticipation node click events.
  - Modal submit now posts enrollment without route/page navigation and keeps user inside fullscreen tree.
  - Placement is internally submitted as spillover with locked side/parent reference so the selected tree slot is honored.
- UX naming update:
  - Removed `Enroll Member Toggle: On` label pattern and standardized visible control text to `Enroll Member`.
- Validation:
  - `node --check binary-tree.mjs` passed.
  - `index.html` inline script syntax parse passed.

## Binary Tree Progress Reapply After Rollback (2026-02-26)

- Reapplied the Binary Tree enhancements that were previously completed and then rolled back:
  - added `Total Direct Sponsor` KPI card in Binary Tree summary deck.
  - added matching `Total Direct Sponsor` metric card in fullscreen metrics deck.
  - restored Advanced Search direct filter toggle (`Direct Sponsors`) with persisted `directOnly` state.
  - restored top-row mobile/fullscreen direct toggle with shared filter behavior.
  - restored direct-toggle icon states using Material Symbols:
    - off: `face`
    - on: `face_retouching_off`
  - restored node-card direct sponsor visual upgrade:
    - orange/yellow direct-sponsor icon in top-right for personally enrolled nodes.
    - `Active/Inactive` badge rule:
      - under icon for nodes that show direct icon
      - top-right for nodes without direct icon
    - kept rounded status-pill style for visual consistency.
  - restored legacy tier helper copy change:
    - `network nodes remaining` -> `Legacy Direct Sponsor(s) remaining` (Legacy Leadership tier cards only).
- Mobile layout state re-applied:
  - minimap toggle remains hidden on mobile fullscreen.
  - direct toggle is anchored on the right-side control cluster with Home.
- Files affected:
  - `index.html`
  - `binary-tree.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree.mjs` passed.
  - `index.html` inline scripts parsed successfully (`Parsed 2 inline script block(s) successfully.`).

## Binary Tree Trackpad + Settings Recovery (2026-02-26)

- Restored Binary Tree interaction and settings work after rollback in `binary-tree.mjs` and `index.html`.
- Interaction behavior now re-applied:
  - native trackpad panning support (fullscreen and non-fullscreen)
  - native trackpad pinch zoom support
  - mouse zoom modifiers:
    - macOS: `Cmd + Wheel`
    - Windows/Linux: `Ctrl + Wheel`
  - mouse pan mode requires holding `Space` while dragging; releasing `Space` exits pan mode and restores normal cursor.
  - fullscreen exit on keyboard now requires long-press `Esc` (`700ms`).
- Added persisted Binary Tree interaction settings in controller API:
  - `getInteractionSettings()`
  - `updateInteractionSettings(...)`
  - persisted fields:
    - `reverseTrackpadMovement`
    - `trackpadZoomSensitivity`
- Default trackpad zoom sensitivity is now `0.30`.
- Added Binary Tree settings UI in `index.html`:
  - settings toggle in control bar and mobile fullscreen action row
  - settings panel sections:
    - Account Overview
    - Accessibility (`Trackpad reverse movement`, `Zoom strength`)
    - Logout button
  - settings icon now uses Material Symbols `settings` glyph.
- Esc-key behavior wiring:
  - when settings panel is open, `Esc` closes settings and does not exit fullscreen
  - enroll modal still takes Esc priority when open
- Added fullscreen state event dispatch for shell coordination:
  - `binary-tree-fullscreen-changed`
- Validation:
  - `node --check binary-tree.mjs` passed.
  - `index.html` inline script syntax check passed.

## Admin Toggle For Tier Claim Mock Mode + Live Persistence Guard (2026-03-03)

- Added a persistent runtime setting to control tier-claim behavior:
  - `tierClaimMockModeEnabled`
- Added new runtime settings store file:
  - `mock-runtime-settings.json`
- Updated `serve.mjs`:
  - Added runtime settings read/write helpers.
  - Added public read endpoint: `GET /api/runtime-settings`.
  - Added admin update endpoint: `POST /api/admin/runtime-settings` (admin cookie required).
- Updated `admin.html` Settings page:
  - Added new **Tier Claim Mode** card with toggle:
    - OFF = live mode (claimed cards persist).
    - ON = mock mode (claimed cards reset after reload).
  - Added live/mock status pill and save/load feedback handling.
  - Wired toggle load/save against `/api/admin/runtime-settings`.
- Updated `index.html` member dashboard:
  - Reads runtime settings from `/api/runtime-settings`.
  - Applies toggle-controlled reset-on-load for Infinity Builder and Legacy Leadership claim maps.
  - Removed hard dependency on static mock reset flag for this behavior and now uses runtime setting.
  - Added claim reconciliation safety guard (`allowPrune`) so claims are not destructively pruned before member/tree hydration is complete.
  - Added hydration tracking (`hasRegisteredMembersHydrated`) and adjusted load flow so tree sync happens before destructive claim pruning is allowed.
- Result:
  - Live mode now supports persisted claim state across reload.
  - Mock mode can be turned on from Admin Settings anytime to force reset-on-reload behavior for testing claim buttons/cards.
- Files affected:
  - `serve.mjs`
  - `admin.html`
  - `index.html`
  - `mock-runtime-settings.json`
- Validation:
  - `node --check serve.mjs` passed.
  - Runtime endpoint smoke test on alternate port (`3011`) passed:
    - `GET /api/runtime-settings` returns settings payload.
    - `POST /api/admin/runtime-settings` rejects unauthenticated requests.
    - Authenticated admin POST updates and persists setting.

## Runtime Settings API Fallback For Tier Claim Toggle (2026-03-03)

- Follow-up fix for admin toggle reliability when backend runtime-settings endpoint is unavailable (`API endpoint not found`).
- Updated `admin.html`:
  - Added local fallback storage key: `charge-runtime-settings-v1`.
  - Tier Claim toggle now:
    - loads from API when available,
    - falls back to localStorage when API is missing,
    - saves locally if API save fails, so checkbox still toggles and persists in-browser.
  - Added user feedback message when fallback mode is active.
- Updated `index.html`:
  - Runtime settings load now falls back to `charge-runtime-settings-v1` localStorage when API fails.
  - Added `storage` event listener so mode updates can propagate between tabs/windows on same origin.
- Result:
  - Admin checkbox can toggle ON/OFF even without runtime-settings API route.
  - Member page can still honor the selected mode from local fallback on the same origin/browser.
- Validation:
  - `admin.html` inline scripts parsed successfully.
  - `index.html` inline scripts parsed successfully.

## User Dashboard KPI Wiring + Store Purchase PV Sync (2026-03-03)

- **What changed:** Completed dashboard KPI data wiring work and fixed Personal Volume not updating after user store purchases.
- **Files affected:** `index.html`, `serve.mjs`, `Claude_Notes/charge-documentation.md`, `Claude_Notes/Current Project Status.md`
- **Dashboard KPI updates (`index.html`):**
  - Added `#dashboard-total-balance-value` binding for the top `Total Balance` card.
  - Added runtime total-balance resolver:
    - uses wallet fields from session when present (`walletBalance`, `eWalletBalance`, `ewalletBalance`, `totalBalance`)
    - falls back to live aggregate of available balances (`Fast Track + Infinity Builder + Legacy Leadership + Sales Team`).
  - Added total-balance re-render hooks across commission/card update paths and session patch flow.
- **Personal Volume fix (`index.html` + `serve.mjs`):**
  - Checkout flow now sends `pvGain` (derived from purchased `BP`) to `POST /api/member-auth/record-purchase`.
  - Purchase API now increments and persists `starterPersonalPv` for the matched user record (and linked registered-member record).
  - Session patch flow now reapplies current binary summary snapshot so the dashboard `Personal Volume` card refreshes immediately after purchase sync.
- **Result:** User-side `Personal Volume` now updates after store purchases, and `Total Balance` is no longer hardcoded-only behavior.
- **Validation performed:**
  - `node --check serve.mjs`
  - `index.html` inline script parse: `Parsed 2 inline script block(s) successfully.`

## Personal Volume Existing-Purchase Reconciliation Guard (2026-03-03)

- **What changed:** Added an additional user-side PV reconciliation path so existing user purchases present in the current invoice data are backfilled if they were not previously credited to `starterPersonalPv`.
- **Files affected:** `index.html`, `Claude_Notes/charge-documentation.md`, `Claude_Notes/Current Project Status.md`
- **Implementation details (`index.html`):**
  - Added invoice ownership matching using current user identity fields (`id`, `username`, `email`, `name`) with support for legacy invoices missing explicit buyer IDs.
  - Added ownership hardening so buyer-name fallback applies only to invoices with real `createdAt` timestamps (prevents demo seed rows from being backfilled as user purchases).
  - Added a reconciliation function that computes:
    - invoice purchase BP total for the current user
    - already-credited purchase PV (`starterPersonalPv - enrollmentPackageBv`)
    - missing PV delta and one-time backfill call through existing purchase sync endpoint.
  - New invoices now include user identity fields:
    - `buyerUserId`
    - `buyerUsername`
    - `buyerEmail`
  - Reconciliation is executed during My Store initialization to catch existing invoice rows for the current user.
- **Validation performed:**
  - `node --check serve.mjs`
  - `index.html` inline script parse: `Parsed 2 inline script block(s) successfully.`

## Personal Volume KPI Fallback When Purchase API Is Unavailable (2026-03-03)

- Added a reliability fallback for user-side `Personal Volume` KPI updates when purchase sync API cannot be reached (e.g., static server/dev route mismatch).
- Updated `index.html`:
  - `applySessionUserPatch(...)` now directly refreshes `#dashboard-personal-volume-value` from session starter PV after patching user data.
  - Added `applyLocalPurchasePvFallback(pvGain)`:
    - increments `starterPersonalPv`
    - extends `activityActiveUntilAt`
    - updates `lastProductPurchaseAt`/`lastPurchaseAt`
    - persists patched session through existing patch flow.
  - Updated `syncMemberPurchaseActivityWindow(...)` catch handling:
    - detects network/404 API-unavailable failures
    - applies local fallback PV patch for the current browser session.
- Result:
  - purchase PV KPI can still update in-browser when `/api/member-auth/record-purchase` is unavailable.
  - server sync remains primary path when API is reachable.
- Validation:
  - `index.html` inline script parse passed (`Parsed 2 inline script block(s) successfully.`).

## Personal Volume Server-Authoritative Enforcement (2026-03-03)

- Owner-directed security hardening update:
  - removed client-side PV fallback mutation path from user dashboard purchase sync flow.
- Updated `index.html`:
  - removed `applyLocalPurchasePvFallback(pvGain)` function.
  - removed catch-block logic in `syncMemberPurchaseActivityWindow(...)` that previously patched `starterPersonalPv` locally on API/network failures.
- Result:
  - `Personal Volume` KPI now updates only when `POST /api/member-auth/record-purchase` succeeds and returns server-patched user data.
  - API/network failures no longer mutate PV in-browser.
- Security rationale:
  - prevents client-local state mutation from being used as a source of truth for KPI values.

## Unified Dashboard Mockup Toggle (KPI + Recent Activity + Tier Preview) (2026-03-03)

- Added a clean, single admin-facing master toggle:
  - `dashboardMockupModeEnabled`
- Runtime settings schema updated in backend:
  - `serve.mjs` now sanitizes/persists both:
    - `dashboardMockupModeEnabled`
    - `tierClaimMockModeEnabled`
  - backward compatibility retained (legacy tier-only payloads still map correctly).
- Updated `admin.html` settings UX:
  - renamed control to **Dashboard Mockup Mode**.
  - toggle now persists both runtime flags together to keep behavior predictable.
  - helper copy now explicitly includes KPI cards and Recent Activity behavior.
- Updated `index.html` runtime behavior:
  - runtime setting now reads `dashboardMockupModeEnabled` (with tier-claim fallback support).
  - Infinity/Legacy tier preview snapshot now uses dashboard mockup mode.
  - KPI cards now honor dashboard mockup mode:
    - `Total Balance`, `Personal Volume`, and `Cycles` switch to seeded preview values in mock mode.
    - live mode reverts to JSON-backed runtime/session/tree values.
  - My Store + Recent Activity cleanup:
    - added explicit seeded invoice rows tagged with `mockSeed: true`.
    - mock mode ON injects seeded invoices (for demo preview state).
    - mock mode OFF removes seeded invoices so before-state activity no longer appears.
    - Recent Activity ignores mock-seeded invoice items in live mode.
- Files affected:
  - `serve.mjs`
  - `mock-runtime-settings.json`
  - `admin.html`
  - `index.html`
- Validation:
  - `node --check serve.mjs` passed.
  - `index.html` inline script parse passed (`Parsed 4 inline script block(s) successfully.`).
  - `admin.html` inline script parse passed (`Parsed 4 inline script block(s) successfully.`).

## Legacy/Infinity Tier Mock Snapshot Separation Fix (2026-03-03)

- Fixed regression where Legacy Leadership tier cards could mirror Infinity mock tier cards.
- Root cause:
  - mockup-mode path in shared `buildInfinityBuilderTierSnapshots(...)` always returned Infinity mock snapshot, even when called by Legacy snapshot builder.
- Updated `index.html`:
  - added `buildLegacyLeadershipMockupSnapshot()` with Legacy-specific seeded tier shape.
  - extended shared tier snapshot builder to accept `mockupSnapshotBuilder`.
  - Legacy path now passes Legacy mock builder; Infinity path passes Infinity mock builder.
- Result:
  - Legacy cards no longer inherit Infinity mock tier data in dashboard mockup mode.
  - Infinity and Legacy mock previews now render independently with correct program identity.
- Validation:
  - `index.html` inline script parse passed (`Parsed 4 inline script block(s) successfully.`).

## Infinity Mock Tier Snapshot Coherency Fix (2026-03-03)

- Fixed Infinity Builder mockup card data to align with live tier progression rules.
- Root cause:
  - prior Infinity mock seed had inconsistent state (`4/4`-equivalent progress with `isCompleted: false`) which does not match live completion behavior.
- Updated `index.html`:
  - rebuilt `buildInfinityBuilderMockupSnapshot()` with coherent tiers:
    - Tier 1: completed (`3/3` directs, full tier progress)
    - Tier 2: in progress (`2/3` directs, partial progress)
    - Tier 3: locked preview tier
  - removed invalid over-cap progress seed that caused contradictory card states.
- Result:
  - Infinity mock cards now visually and logically match live tier-state semantics (completed vs building vs locked).
- Validation:
  - `index.html` inline script parse passed (`Parsed 4 inline script block(s) successfully.`).

## Legacy Mock Tier Snapshot Coherency Fix (2026-03-03)

- Applied the same coherency pass to Legacy Leadership mock tier data so it matches live state logic.
- Updated `buildLegacyLeadershipMockupSnapshot()` in `index.html`:
  - Tier 1: completed (`3/3` directs, full legacy-tier progress)
  - Tier 2: building (`2/3` directs, partial progress)
  - Tier 3: locked preview tier
- Removed inconsistent mock states that could conflict with live completion semantics.
- Result:
  - Legacy mock cards now follow the same completed/building/locked pattern as Infinity mock cards.
  - both programs now present consistent mock-tier progression behavior.
- Validation:
  - `index.html` inline script parse passed (`Parsed 4 inline script block(s) successfully.`).

## Legacy Tier Cards Forced To Live Snapshot Logic (2026-03-03)

- Owner clarification applied:
  - Legacy tier cards in mockup mode must match **live Legacy** card behavior, not a seeded mock snapshot.
- Updated `index.html` tier snapshot resolver:
  - added `enableMockupSnapshot` option in shared `buildInfinityBuilderTierSnapshots(...)`.
  - Legacy path (`buildLegacyLeadershipTierSnapshots`) now sets `enableMockupSnapshot: false`.
  - Result: Legacy always uses real Legacy computation path from current tree data, even while dashboard mockup mode is ON.
- Removed Legacy seeded mock snapshot function to prevent accidental reintroduction of Infinity-like mock states.
- Validation:
  - `index.html` inline script parse passed (`Parsed 4 inline script block(s) successfully.`).

## Store Purchase PV Sync Integrity Guard + Error Surfacing (2026-03-03)

- Investigated user report: purchases creating invoices but `Personal Volume` not increasing.
- Confirmed common failure mode:
  - stale backend process can return `200` on purchase sync while leaving `starterPersonalPv` unchanged.
- Updated `index.html`:
  - `syncMemberPurchaseActivityWindow(pvGain)` now validates server response by comparing:
    - previous `starterPersonalPv`
    - expected post-purchase PV (`previous + pvGain`)
  - if server response fails this check, it now returns a structured failure with clear restart guidance.
  - `createInvoiceFromLines(...)` now surfaces sync failure directly in checkout feedback:
    - invoice creation remains successful
    - PV sync failure shows explicit message instead of silent console-only failure.
- Result:
  - users immediately see when purchase PV credit did not apply server-side.
  - no silent “invoice created but PV unchanged” state.
- Validation:
  - `index.html` inline script parse passed (`Parsed 4 inline script block(s) successfully.`).

## Binary Tree BV Label Clarity For Receiving Parents (2026-03-03)

- Reworked Binary Tree leg-volume presentation to reduce confusion around spillover totals.
- Updated `binary-tree.mjs`:
  - Added helper breakdown utilities to compute each leg as:
    - Team BV (full subtree total)
    - Direct BV (immediate child package BV)
    - Downline BV (Team minus Direct)
  - Node cards now label leg metrics as `L Team` / `R Team`.
  - Search results now label leg metrics as `L Team` / `R Team`.
  - Selected-node panel now shows detailed value text:
    - `X BV (Direct Y | Downline Z)`
- Updated `admin.html` selected-node labels from `Left BV` / `Right BV` to `Left Team BV` / `Right Team BV`.
- No BV computation logic changed; this is a presentation/clarity update only.
- Validation:
  - `node --check binary-tree.mjs` passed.

## Anonymous Node BV Truth Display (2026-03-03)

- Adjusted Binary Tree BV display for privacy-masked (anonymous) nodes so they expose true node production context instead of only leg-downline figures.
- Updated `binary-tree.mjs`:
  - Added `getNodeTeamBv(node)` helper.
  - Added `getNodeVolumeSummaryText(node)` helper.
  - For anonymous nodes (`shouldApplyNodePrivacyMask(node) === true`):
    - Node/search labels now show:
      - `Self BV: <node personal package BV>`
      - `Team BV: <leftPv + rightPv>`
  - Selected-node panel now shows anonymous-node values as:
    - left field: `Self` BV
    - right field: `Team` BV
  - Non-anonymous nodes keep existing team-leg breakdown behavior.
- Purpose:
  - Prevent confusion where anonymous spillover nodes appeared to have only child/downline BV (example: 192) while their own package BV (example: 960) was hidden from the main node volume text.
- Validation:
  - `node --check binary-tree.mjs` passed.

## Anonymous Node BV Simplification (Placement-Side Add) (2026-03-03)

- Revised previous anonymous-node BV presentation per owner direction.
- New rule for privacy-masked/anonymous nodes:
  - keep displaying Left/Right Team BV fields
  - add the node's personal BV (`leftPersonalPv + rightPersonalPv`) to the leg matching the node's `placementSide`
  - leave the opposite leg unchanged
- Example behavior this enables:
  - anonymous node personal BV `960`, left-leg downline `192`, placement side `left`
  - displayed left leg becomes `1,152 BV`, right remains unchanged.
- Applied in `binary-tree.mjs`:
  - replaced Self/Team text mode with `getNodeDisplayLegVolumes(node)` helper.
  - helper logic augments displayed leg values only for masked nodes.
  - card labels/search rows/selected panel now all use augmented left/right display values for masked nodes.
- Validation:
  - `node --check binary-tree.mjs` passed.

## Selected Node Account Rank Base BV Display (2026-03-03)

- Updated selected-node metric text in `binary-tree.mjs`.
- When secondary metric mode is `rank`, selected node now shows:
  - `<Rank> | Base BV: <leftPersonalPv + rightPersonalPv> BV`
- Example output:
  - `Personal | Base BV: 192 BV`
- Scope:
  - selected-node Account Rank value only.
  - no changes to placement/BV math or cycle logic.
- Validation:
  - `node --check binary-tree.mjs` passed.

## Package-Wide Base BV Mapping In Selected Node Rank (2026-03-03)

- Expanded selected-node `Account Rank` Base BV logic to cover all package tiers consistently.
- Updated `binary-tree.mjs`:
  - Added `resolveBaseBvFromRankLabel(rankLabel)` mapping:
    - Personal/Starter: `192`
    - Business: `360`
    - Infinity/Achievers: `560`
    - Legacy: `960`
  - Added `getNodeBaseBv(node)`:
    - prefers node personal BV when available
    - falls back to rank-based mapping when personal BV is unavailable.
  - Selected-node rank line now uses mapped base BV via `getNodeBaseBv(node)`.
- Result:
  - `Account Rank` field now supports all package BV tiers, not just Personal examples.
- Validation:
  - `node --check binary-tree.mjs` passed.

## Select Node Direct/Downline Definition Fix (2026-03-03)

- Corrected selected-node leg breakdown semantics in `binary-tree.mjs`.
- Previous behavior issue:
  - `Direct` used immediate placement-child personal BV, which can invert meaning when user-sponsored members are placed deeper via spillover.
- New behavior:
  - `Direct` = sum of personal BV for users whose `sponsorId` equals the selected node and whose `sponsorLeg` matches that leg.
  - `Downline` = team leg BV minus direct BV.
  - Fallback leg inference added when `sponsorLeg` is missing by walking placement parent path.
- Result:
  - labels now match definition: direct means personally enrolled users; downline includes non-direct/spillover structure on that leg.
- Validation:
  - `node --check binary-tree.mjs` passed.
  - Scenario check (`eaglethree`): left team `1152`, direct `192`, downline `960`.

## Anonymous Nodes Rank Visibility Enabled (2026-03-03)

- Updated Binary Tree rank rendering so privacy-masked/anonymous nodes still display rank text.
- Changes in `binary-tree.mjs`:
  - Removed rank-hide guard from `formatSecondaryMetricText(...)` in rank mode.
  - Removed rank-hide guard from `resolveSelectedSecondaryMetricValue(...)` in rank mode.
- Current behavior:
  - Anonymous nodes now show rank (and selected-node rank + base BV text).
  - Country masking behavior remains unchanged.
- Validation:
  - `node --check binary-tree.mjs` passed.

## Store Invoice Persistence + Recent Activity Reload Stability (2026-03-03)

- **What changed:** Added JSON-backed invoice persistence so My Store purchases and Recent Activity purchase rows survive page reload in live mode.
- **Files affected:** `serve.mjs`, `index.html`, `mock-store-invoices.json`.
- **Backend updates (`serve.mjs`):**
  - Added invoice store file constant and helpers:
    - `readMockStoreInvoicesStore()`
    - `writeMockStoreInvoicesStore()`
    - invoice sanitization + status normalization helpers
  - Added new runtime API endpoint:
    - `GET /api/store-invoices` -> returns persisted invoices
    - `POST /api/store-invoices` -> validates payload, generates next `INV-<seed>` ID, persists invoice, returns created invoice
  - Extended admin reset endpoint (`POST /api/admin/reset-all-data`) to clear invoice store and return cleared invoice count.
- **Frontend updates (`index.html`):**
  - Added `STORE_INVOICES_API` binding.
  - Added `loadStoreInvoices()` during My Store init to hydrate invoice state from server.
  - Converted `createInvoiceFromLines(...)` to async API-backed creation flow.
  - Converted cart checkout flow to async and only clears cart after successful persisted invoice creation.
  - Updated Buy Now / Checkout handlers to call async invoice creation safely.
- **Behavior result:**
  - In live mode (`dashboardMockupModeEnabled = false`), purchase activity appears immediately and still appears after reload because invoice data is now persisted server-side.
  - Mock-seeded preview behavior remains controlled by runtime mockup mode and is still excluded in live-mode Recent Activity.
- **Validation performed:**
  - `node --check serve.mjs` passed.

## Recent Activity Per-User Visibility Fix (2026-03-03)

- **What changed:** Restricted Recent Activity purchase entries to the signed-in member so invoice-driven activity is no longer shared across all users.
- **File affected:** `index.html`.
- **Implementation detail:**
  - Updated `buildStoreInvoiceRecentActivityEntries()` to skip invoices that are not owned by the current session account by applying `isInvoiceOwnedByCurrentUser(invoice)` before entry mapping.
- **Behavior result:**
  - Recent Activity now shows purchase rows only for the logged-in user.
  - Cross-account purchase visibility in Recent Activity is removed.
- **Validation performed:**
  - `index.html` inline script parse passed (`Parsed 2 inline script block(s) successfully.`).

## Request Payout Buttons: Mock/Live Mode Wiring + Admin Toggle Integration (2026-03-03)

- **What changed:** Patched payout-button behavior so it no longer behaves like always-on mock state; it now follows the Admin `Dashboard Mockup Mode` switch.
- **Files affected:** `index.html`, `admin.html`.

- **User-side payout patch (`index.html`):**
  - Added payout offset persistence store:
    - key: `charge-commission-payout-offsets-v1`
    - owner scope: current authenticated user identity key.
  - Added payout offset helpers:
    - `readCommissionPayoutOffsetStore()`
    - `writeCommissionPayoutOffsetStore()`
    - `getCommissionPayoutOffsetMapForCurrentUser()`
    - `persistCommissionPayoutOffsetMapForCurrentUser(...)`
    - `syncCommissionPayoutOffsetsFromStore()`
    - `resetRuntimeCommissionPayoutOffsets()`
  - Updated runtime settings application path:
    - when mock mode is enabled, payout offsets reset to runtime mock state.
    - when live mode is enabled, payout offsets rehydrate from user-scoped persisted storage.
  - Updated payout request action:
    - in live mode: payout offset changes persist.
    - in mock mode: payout offset changes remain non-persistent mock behavior.

- **Admin-side mockup wiring (`admin.html`):**
  - Added mode-aware quick action payout button binding (`#quick-action-request-payout-button`).
  - Added `applyQuickActionRequestPayoutMode(isMockModeEnabled)`:
    - mock mode -> button enabled
    - live mode -> button disabled
  - Updated settings helper copy and save feedback messages to explicitly include payout-request behavior under mock/live mode.

- **Behavior result:**
  - Request Payout no longer behaves as always-mock.
  - Admin mockup toggle now governs payout-request mode expectations alongside KPI/recent-activity/tier-preview behavior.

- **Validation performed:**
  - `index.html` inline script parse passed (`index.html parsed inline script block(s): 2`).
  - `admin.html` inline script parse passed (`admin.html parsed inline script block(s): 2`).

## Payout Pending Activity Survives Reload (2026-03-03)

- **What changed:** Fixed payout-request `Pending` rows disappearing after reload by persisting payout activity for the current user in live mode.
- **File affected:** `index.html`.
- **Implementation details:**
  - Added new storage key:
    - `charge-commission-payout-activity-v1`
  - Added payout activity storage helpers:
    - read/write store
    - sanitize entry shape
    - get/persist entries for current user owner key
  - Added `buildPersistedCommissionPayoutRecentActivityEntries()` and merged it into Recent Activity composition.
  - Updated `requestCommissionPayout(...)`:
    - creates one normalized payout activity payload (`statusLabel: Pending`)
    - persists it in live mode
    - appends it to runtime feed immediately for instant UI feedback.
- **Behavior result:**
  - Live mode: payout `Pending` entries remain visible after reload.
  - Mock mode: payout activity remains preview/non-persistent behavior.
- **Validation performed:**
  - `index.html` inline script parse passed (`index.html parsed inline script block(s): 2`).

## Payout Request Queue: Member-to-Admin Fulfillment Integration (2026-03-03)

- **What changed:** Reworked payout requests from local-only Recent Activity entries into a shared JSON-backed request queue that admin can fulfill.
- **Files affected:** `serve.mjs`, `index.html`, `admin.html`, `mock-payout-requests.json`.

### Backend (`serve.mjs`)

- Added new payout request store:
  - file: `mock-payout-requests.json`
  - schema root: `{ "requests": [] }`
- Added payout request sanitize/read/write utilities.
- Added member-facing payout APIs:
  - `GET /api/payout-requests?userId=&username=&email=`
    - returns only requests belonging to the supplied identity keys.
  - `POST /api/payout-requests`
    - creates `Pending` payout request row with requester identity + source + amount.
- Added admin payout APIs (cookie-auth protected):
  - `GET /api/admin/payout-requests`
  - `POST /api/admin/payout-requests/fulfill` (`{ id }` -> status `Fulfilled`)
- Extended admin reset endpoint (`POST /api/admin/reset-all-data`):
  - now also clears payout request store
  - now returns `cleared.payoutRequests`.

### Member Dashboard (`index.html`)

- Added payout request API constant:
  - `PAYOUT_REQUESTS_API = '/api/payout-requests'`
- Added server-backed payout request helpers:
  - identity payload resolver
  - request submit (`createCommissionPayoutRequestForCurrentUser`)
  - request load (`loadCommissionPayoutRequestsForCurrentUser`)
  - server-entry sanitization for Recent Activity.
- Updated payout click flow (`requestCommissionPayout`):
  - live mode now submits to API first
  - only after successful API create, applies payout offset deduction and updates feed
  - request button now has in-flight busy lock via `data-request-busy`.
- Recent Activity payout rendering updates:
  - status tone now supports `success` / `warning` / `danger`
  - server-loaded payout entries are merged into payout Recent Activity builder
  - keeps per-user scope and persists through reload.

### Admin Dashboard (`admin.html`)

- Added Settings card: **Payout Request Queue**
  - refresh button
  - empty state
  - list feed
  - status-aware rows (`Pending` / `Fulfilled`)
  - `Mark Fulfilled` action per request.
- Added admin queue runtime functions:
  - load queue
  - render queue
  - fulfill request
  - feedback messaging for success/error.
- Settings flow integration:
  - queue loads during settings module init
  - queue reloads on Settings page navigation and manual refresh.
- Flush-all UI text/summary updated to include payout requests.

### Validation performed

- Syntax checks:
  - `node --check serve.mjs` passed.
  - inline script parse check passed for both `index.html` and `admin.html`.
- API smoke check on temp port (`PORT=3100`) passed:
  - member `POST /api/payout-requests` -> creates `Pending` request.
  - member `GET /api/payout-requests?...` -> returns user-scoped request list.
  - admin `GET /api/admin/payout-requests` without admin auth -> returns expected auth error.

### Known limitations

- Member payout request endpoints still follow current mock-trust model (identity supplied by client payload/query, no strict member session validation yet).
- Member UI reflects fulfill status on reload (or next payout-requests load), not via push/real-time subscription.

## Sales Team Request Payout: No-Change Click Fallback Fix (2026-03-03)

- **What changed:** Added a live-mode fallback path so payout clicks still produce visible state changes when payout API calls fail.
- **File affected:** `index.html`.
- **Issue addressed:**
  - `requestCommissionPayout(...)` previously caught live API errors and only `console.warn`ed.
  - From user perspective, click could look like "nothing happened".
- **Patch detail:**
  - In live mode catch block:
    - create a sanitized local fallback payout activity entry,
    - persist payout offset map,
    - persist payout activity for current user,
    - append runtime recent-activity row,
    - re-render derived commission metrics/cards.
- **Behavior result:**
  - Sales Team payout click now remains responsive even if API is temporarily unavailable.
  - Recent Activity gets a fallback entry with detail indicating local save + pending admin sync availability.
- **Validation:**
  - `index.html` inline script parse check passed.

## Sales Team Payout Reload + Recent Activity Duplication Follow-up (2026-03-03)

- **What changed:** Tightened live-mode payout persistence and payout activity composition to avoid mock-like behavior and duplicate payout rows.
- **File affected:** `index.html`.

### Key updates

- Added payout-offset derivation from server payout entries:
  - `resolveCommissionPayoutOffsetMapFromEntries(entries)`
  - `syncCommissionPayoutOffsetsFromRequestEntries(entries)`
- Applied this sync after successful live payout-request load:
  - `loadCommissionPayoutRequestsForCurrentUser(...)` now updates offset map from server-backed entries.
- Adjusted payout Recent Activity composition:
  - live flow now prioritizes `persistedCommissionPayoutRequestEntries`.
  - legacy local payout activity is used only as fallback when server-backed entries are empty.
- Removed prior live-mode local success fallback in payout request catch path:
  - API failures no longer write local-only pending payout entries that can mimic mock behavior.

### Behavior impact

- Live mode now reconstructs payout deduction state from server request history on reload.
- Recent Activity payout rows are less likely to duplicate from mixed local + server sources.
- If live API payout create fails, no local fake-success payout is written.

### Validation

- `index.html` inline script parse check passed.
- Added local-legacy cleanup helper:
  - `clearCommissionPayoutActivityEntriesForCurrentUser()`
  - invoked after successful server payout load when server entries are present, to retire duplicate legacy local payout rows.

## Commission Order Admin Workflow Migration + Fulfillment Details Form (2026-03-03)

- **What changed:** moved admin payout fulfillment out of `Settings` and into a dedicated admin sidebar page under `Commissions`, with queue title renamed to **Commission Order**.
- **Files affected:**
  - `admin.html`
  - `serve.mjs`

### Admin UI updates (`admin.html`)

- Added routed sidebar nav item for Commissions:
  - link path: `/admin/Commissions`
  - page key: `commissions`
- Added new page section:
  - `#page-commissions`
  - queue shell ids:
    - `commission-orders-refresh-button`
    - `commission-orders-feedback`
    - `commission-orders-empty-state`
    - `commission-orders-feed`
- Removed payout queue controls from Settings and replaced with an informational handoff card pointing admins to `Commissions > Commission Order`.
- Updated page routing metadata and browser-path mapping to include commissions.
- Updated quick action `Request Payout` to navigate to Commissions instead of Settings.

### Fulfillment flow redesign (`admin.html`)

- Replaced one-click `Mark Fulfilled` action with required fulfillment form per pending order.
- Pending order form now captures:
  - `Mode of Transfer` (required)
  - `Bank Details` (required)
  - `Transfer Reference` (optional)
  - `General Info` (optional)
- Added submit handling via delegated `submit` event for forms rendered inside the queue feed.
- Fulfilled records now render captured fulfillment details in the order card.

### Backend/API updates (`serve.mjs`)

- Extended payout-request record sanitizer to include fulfillment detail fields:
  - `transferMode`
  - `bankDetails`
  - `transferReference`
  - `generalInfo`
- Updated `POST /api/admin/payout-requests/fulfill`:
  - requires `transferMode`
  - requires `bankDetails`
  - persists all fulfillment detail fields on successful fulfillment.

### Design decisions

- Kept existing payout-request API endpoints and queue data model shape, extending records with fulfillment metadata instead of introducing a new endpoint.
- Implemented form-based fulfillment directly in each pending row to reduce extra modal/state complexity.
- Preserved existing `adminPayoutRequests` runtime store and feed rendering lifecycle for minimal disruption.

### Known limitations

- Legacy fulfilled records created before this update may show empty (`--`) fulfillment detail fields.
- No edit/reopen flow for already-fulfilled records yet; repeat fulfill attempts return existing fulfilled data.

### Validation performed

- `node --check serve.mjs` passed.
- `admin.html` inline script parse check passed via `new Function(...)` extraction test.

## Commission Order UI Redesign (Shopify-Style Orders View) (2026-03-03)

- **What changed:** Reworked the entire `Commission Order` admin interface to follow a Shopify-like orders workflow layout.
- **File affected:** `admin.html`.

### UI structure changes

- Replaced card-per-request feed with a structured orders workspace:
  - header and workspace context badge
  - summary KPI tiles (`All Orders`, `Pending`, `Fulfilled`, `Total Value`)
  - filter bar with search + status filter + source filter + refresh action
  - dense order table with status chips and row actions
  - dedicated `Order Details` panel for selected order
- New detail panel behavior:
  - if order is pending: renders fulfillment form
  - if order is fulfilled: renders fulfillment detail snapshot

### Interaction model updates

- Added table row selection state (`selectedCommissionOrderId`) and active-row highlighting.
- Added filter state:
  - `commissionOrdersSearchTerm`
  - `commissionOrdersStatusFilterValue`
  - `commissionOrdersSourceFilterValue`
- Added filtering/search across order id, customer label, and source.
- Added summary rendering from current loaded order set.
- Moved fulfillment submit handling into the detail panel form (instead of inline list cards).

### Notes on behavior continuity

- Existing fulfillment backend contract is unchanged from the prior workflow update:
  - fulfillment still requires transfer mode + bank details
  - fulfillment detail fields still persist and display on fulfilled orders.
- Quick action and page-routing behavior remain intact; this update is UI/UX-focused for commissions workspace.

### Validation performed

- `admin.html` inline script parse check passed.

## Commission Order Navigation Flow: List -> Dedicated Detail Page (2026-03-03)

- **What changed:** Commission order rows now open a separate in-app page for detail review and fulfillment, instead of rendering details within the list page.
- **File affected:** `admin.html`.

### UX flow update

- `Commissions` page is now list-focused (table + filters + summaries).
- Clicking a row (or `Review/View` action) navigates to a dedicated page view:
  - `data-page-view="commission-order"`
  - route: `/admin/Commissions/Order`
- Added `Back to Commission Orders` action on detail page.

### Routing/state wiring

- Added page meta/path entries for `commission-order`.
- Updated nav-active behavior so `Commissions` sidebar remains highlighted when on detail route.
- Detail page rendering now resolves by selected order id (`selectedCommissionOrderId`) against loaded order data.

### Fulfillment behavior

- Fulfillment form remains available on pending records, now exclusively in the dedicated detail page.
- Fulfilled records render saved transfer/bank/reference/general info on detail page.

### Validation performed

- `admin.html` inline script parse check passed after routing/event updates.

## Gateway-Specific Commission Fulfillment API Routes (Stripe Primary) (2026-03-03)

- **What changed:** Added gateway-aware fulfillment routing for commission payout orders with Stripe as primary, and prepared dedicated routes for Bank Transfer and Zelle.
- **Files affected:**
  - `serve.mjs`
  - `admin.html`

### API route preparation (`serve.mjs`)

- Existing generic fulfillment endpoint remains:
  - `POST /api/admin/payout-requests/fulfill`
- Added gateway route variants:
  - `POST /api/admin/payout-requests/fulfill/stripe`
  - `POST /api/admin/payout-requests/fulfill/bank-transfer`
  - `POST /api/admin/payout-requests/fulfill/zelle`
- Added route guard for unsupported gateway paths (returns 404).

### Gateway processing model

- Added gateway normalization and simulation helpers:
  - gateway key/label resolution
  - transfer-mode to gateway mapping
  - default transfer-mode per gateway route
  - mock gateway reference generation
  - mock gateway result/status/message payload
- Fulfilled payout records now persist gateway metadata:
  - `gatewayKey`
  - `gatewayLabel`
  - `gatewayRoute`
  - `gatewayStatus`
  - `gatewayReference`
  - `gatewayMessage`

### Admin UI integration (`admin.html`)

- `Mode of Transfer` options now include:
  - `Stripe`
  - `Bank Transfer`
  - `Zelle`
- Added front-end API route resolver:
  - selected transfer mode now determines which fulfillment endpoint is called.
- Fulfilled order detail view now surfaces gateway metadata (gateway, status, reference, route, note).

### Validation performed

- Syntax checks:
  - `node --check serve.mjs` passed.
  - `admin.html` inline script parse check passed.
- API smoke checks on temp server:
  - `/fulfill/stripe` accepted route shape and proceeded to request-id lookup.
  - `/fulfill/bank-transfer` enforces bank-detail requirement.
  - `/fulfill/zelle` accepted route shape and proceeded to request-id lookup.
  - unsupported gateway route (e.g. `/fulfill/paypal`) returns expected 404.

## Commission Order Status Change Control (Default-Preserving) (2026-03-03)

- **What changed:** Added an explicit status-change option on the `Commission Order Details` page while keeping existing behavior as default.
- **Files affected:**
  - `admin.html`
  - `serve.mjs` (status endpoint integration usage already in place; now consumed by UI)

### UI/interaction changes (`admin.html`)

- Added a new `Order Status` card in the order-detail page render:
  - current payout status badge
  - `Change Status` select input with options:
    - `No status change (default)`
    - `Set to Pending`
    - `Set to Fulfilled`
  - `Apply Status` submit button
- Added frontend list-state helper:
  - `upsertCommissionOrderRecord(updatedRequest)` for consistent in-memory update/sort after fulfill or status update.
- Added API mutation handler:
  - `updateCommissionOrderStatus(requestId, statusValue, statusDetails)`
  - posts to `POST /api/admin/payout-requests/status`
  - updates list + detail render and unified feedback banners.
- Extended detail submit-event delegation:
  - handles `data-commission-order-status-form` submissions
  - preserves existing fulfillment form submit path
  - if status is being set to `fulfilled`, it reuses fulfillment form values when available.

### Behavior decisions

- Default remains unchanged:
  - selecting the status form and leaving default option performs no mutation.
  - pending-order fulfillment still uses the existing `Submit Fulfillment` workflow.
- Added manual reopening path:
  - fulfilled orders can be explicitly set back to pending from detail view.

### Known limitation

- Frontend pending fulfillment form still marks `bankDetails` as required regardless of transfer mode, so Stripe still requires this field in UI even though backend allows Stripe without bank details.

### Validation performed

- `node --check serve.mjs` passed.
- `admin.html` inline script parse check passed via `new Function(...)` extraction.

## Admin Force Cut-Off Execution History (2026-03-04)

- **What changed:** Added execution history tracking + display for the Settings app tool `Force Server Cut-Off`.
- **Files affected:**
  - `serve.mjs`
  - `admin.html`
  - `mock-force-server-cutoff-history.json`

### Backend

- Extended `POST /api/admin/force-server-cutoff`:
  - now persists each run to `mock-force-server-cutoff-history.json`
  - returns `historyEntry` and a `history` preview in response.
- Added `GET /api/admin/force-server-cutoff`:
  - admin-auth protected
  - returns stored execution history for settings UI.

### Admin settings UI

- Added an `Execution History` panel under App Tools:
  - refresh button
  - empty state
  - recent run cards (timestamp, actor, snapshots/commissions/cycles, gross/net).
- History is loaded on Settings init and refreshed after each successful force-run.

### Validation performed

- `node --check serve.mjs` passed.
- `admin.html` inline script parse check passed via `new Function(...)` extraction.
- Local API smoke:
  - `POST /api/admin/force-server-cutoff` returned `200` with `historyEntry`.
  - `GET /api/admin/force-server-cutoff` returned persisted history payload.

## Member Sync Fix: Forced Server Cut-Off Now Resets User Panel (2026-03-04)

- **Issue addressed:** Admin force cut-off ran successfully, but member-side Server Cut-Off card did not reset Left/Right BV to `0` for the new cycle window.
- **Files affected:**
  - `serve.mjs`
  - `index.html`
  - `admin.html` (flush scope text/count update for history file)

### Backend changes

- Added public read endpoint:
  - `GET /api/server-cutoff-events`
  - returns latest forced cut-off timestamp from persisted force-cutoff history.
- Updated admin reset-all-data flow to also clear force-cutoff history store and include count in cleared payload.

### Member dashboard changes (`index.html`)

- `initializeServerCutoffCard()` now checks server force-cutoff events and applies forced reset when a newer forced timestamp is detected.
- Added force-cutoff event sync:
  - initial fetch on card init
  - periodic check (aligned to 30s timer window)
  - foreground refresh on tab visibility return
- Reset behavior now:
  - if server `latestForcedCutoffAt > lastAppliedCutoffUtcMs`, baseline is set to current totals
  - displayed Left/Right leg BV immediately returns to `0`
  - BV starts accumulating again from that new baseline window.

### Validation performed

- `node --check serve.mjs` passed.
- `index.html` inline script parse check passed via `new Function(...)` extraction.
- API smoke:
  - `GET /api/server-cutoff-events` returned latest forced cut-off timestamp.

## Force Cut-Off Role-Scope Correction (2026-03-04)

- Adjusted behavior to keep admin as control-only:
  - removed admin local `Server Cut-Off` baseline reset hook from force-run action.
- Current behavior:
  - admin tool triggers global force cut-off processing only
  - user/member side consumes force-cutoff events and resets its own Server Cut-Off panel to `0`, then re-accumulates.

## Admin App Tool: Force Server Cut-Off + Cycle/Commission Apply (2026-03-04)

- **What changed:** Added a new Settings app tool to manually force a server cut-off run and apply cycle/commission recalculation in one action.
- **Files affected:**
  - `admin.html`
  - `serve.mjs`

### Backend (`serve.mjs`)

- Added new admin-only endpoint:
  - `POST /api/admin/force-server-cutoff`
- Endpoint behavior:
  - requires admin auth (same cookie/session check pattern as other admin routes)
  - recomputes `totalCycles` per binary-tree snapshot from stored leg BV and cycle thresholds
  - recomputes sales-team commission snapshots using package cycle profiles and weekly caps
  - applies payout offsets from persisted payout requests (`sourceKey = salesteam`) before net commission
  - persists updated snapshots and returns an operation summary (counts + totals)

### Admin UI (`admin.html`)

- Added new Settings card:
  - **App Tools: Force Server Cut-Off**
  - includes action button, helper notes, confirmation modal, and status feedback.
- Added frontend wiring:
  - calls `POST /api/admin/force-server-cutoff`
  - handles loading/error/success states
  - shows summary feedback (snapshots, commissions, cycles, gross/net)
- Added local cut-off hook:
  - forcing from settings now immediately resets the admin Server Cut-Off card baseline in-browser so the current cut-off window visually starts fresh.

### Design decisions

- Kept force cut-off as an explicit manual operation under Settings App Tools (not automatic) to avoid surprise rewrites during active testing.
- Reused existing sales-team package commission profile values from member dashboard logic to keep backend/app calculations aligned.

### Validation performed

- `node --check serve.mjs` passed.
- `admin.html` inline script parse check passed via `new Function(...)` extraction.

## Storefront Workflow + Admin Product Management Refresh (2026-03-04)

- **What changed:** Reworked My Store user flow into a Shopify-style progression and replaced admin storefront cart/grid with full product management.
- **Files affected:**
  - `index.html`
  - `admin.html`

### User-side My Store (`index.html`)

- Replaced single-pane cart/grid with a 3-step workflow:
  - `Product Grid`
  - `Product Page`
  - `Checkout`
- Added flow sections and UI wiring:
  - product grid cards now open a dedicated product page with extended details
  - product page includes quantity selection, add-to-cart, and checkout handoff
  - checkout includes:
    - card details
    - billing address fields
    - shipping mode selection (standard/express/overnight)
    - order summary with quantity controls
- Added shared product-catalog loading via local storage:
  - key: `charge-store-product-catalog-v1`
  - normalized product schema supports title, image, price, description, details, stock, BV points, product discount, status
- Added inventory decrement on successful checkout and product-catalog persistence update.
- Preserved original sponsor/rank discount math:
  - checkout still applies `uplineDiscountRate` to subtotal for sponsor-line discount logic
  - no change to underlying rank discount rule path

### Admin-side My Store (`admin.html`)

- Replaced old storefront products/cart pane with **Product Management** workspace.
- Added full management form:
  - title
  - image URL
  - price
  - stock count
  - BV points
  - product discount percent
  - description
  - product details list
- Added product lifecycle actions in managed list:
  - edit
  - archive/unarchive
  - delete (confirmed)
- Added shared catalog persistence:
  - same local storage key used by user storefront (`charge-store-product-catalog-v1`)
  - archived products remain in catalog but are hidden from user product grid
  - deleted products are removed from catalog

### Validation performed

- Inline script parse checks passed:
  - `index.html parsed inline script block(s): 2`
  - `admin.html parsed inline script block(s): 2`
- Headless runtime load checks executed for:
  - `http://localhost:3000`
  - `http://localhost:3000/admin`

## Store Discount Model Refinement (Rank-Only) (2026-03-04)

- **What changed:** removed product-level discount settings from storefront/admin catalog management and aligned checkout discount to rank percentage only.
- **Files affected:**
  - `index.html`
  - `admin.html`

### User-side My Store (`index.html`)

- Replaced product-level discount presentation with rank-driven labels across flow:
  - storefront badge now shows rank + discount percent
  - grid summary label now shows `Rank Discount (<percent>%)`
  - checkout summary label now shows `Discount (Rank <percent>%)`
  - product page now displays current rank discount percent
- Added rank-discount map and sync wiring:
  - `personal: 20%`
  - `business: 25%`
  - `infinity: 30%`
  - `legacy: 40%`
- Cart and invoice discount math now computes from rank-discount rate only.
- Product unit price now resolves from base product price (no product markdown field).

### Admin-side Product Management (`admin.html`)

- Removed product discount input from create/edit form.
- Removed discount parsing/validation from product form submit path.
- Removed discount metric chip from managed product cards.
- Product schema now remains:
  - id, title, image, price, description, details, stock, BV points, status

### Validation performed

- Search validation:
  - no remaining references to `discountPercent`, `uplineDiscountRate`, or removed discount form input ids.
- Inline script parse checks passed:
  - `index.html` (2 inline blocks)
  - `admin.html` (2 inline blocks)
- Headless runtime checks:
  - `index.html` and `admin.html` loaded without page exceptions.
  - observed non-blocking resource noise:
    - `GET /favicon.ico` -> `404`
    - external font request aborted in headless mode

## Login Reliability Fix: Pending Setup Accounts (2026-03-04)

- **What changed:** fixed login dead-end for users with `passwordSetupRequired=true` when their original setup token had expired.
- **Files affected:**
  - `serve.mjs`
  - `login.html`

### Backend (`serve.mjs`)

- Added helper:
  - `ensureOpenPasswordSetupLinkForUser(user)`
- Login endpoint update:
  - `POST /api/member-auth/login` now ensures a valid setup token exists before returning `PASSWORD_SETUP_REQUIRED`.
  - If no open non-expired token exists, server now:
    - issues a new password-setup token
    - persists it to `password-setup-tokens.json`
    - queues a setup email record in `mock-email-outbox.json`
    - returns a non-empty `setupLink` in the login error payload

### Frontend (`login.html`)

- Added password-setup error rendering helper:
  - `showPasswordSetupRequiredError(message, setupLink)`
- `PASSWORD_SETUP_REQUIRED` errors now render a clickable `Open setup link` anchor when `setupLink` is provided, instead of plain text only.

### Validation performed

- `node --check serve.mjs` passed.
- `login.html` inline script parse passed (`2` inline blocks).
- Isolated temp-server verification:
  - pending account login (`bond`) now returns `setupLink` in response payload.
  - setup token and queued outbox record were created in temp store copy.
- Member auth smoke on active users remained successful:
  - `sethfozz`, `fozz`, `hues` -> `ok`.

## Binary Leg BV Purchase Propagation Fix (2026-03-04)

- **What changed:** fixed missing upline leg-BV updates after downline product purchases.
- **File affected:**
  - `index.html`

### Root cause

- Binary-tree node volume was sourced from static enrollment `packageBv` only.
- Purchase activity updates `starterPersonalPv`, but that value was not used in tree volume aggregation.
- Result: downline purchases did not increase upline left/right leg BV, so Server Cut-Off panel stayed unchanged.

### Fix applied

- Added helper:
  - `resolveMemberBinaryVolume(member)`
  - resolves member BV using `starterPersonalPv` with `packageBv` fallback.
- Updated binary-tree node construction:
  - node `leftPersonalPv` now uses `resolveMemberBinaryVolume(member)` instead of package-only BV.
- Updated organization BV rollup:
  - account overview personal organization total now uses the same dynamic member BV source for consistency.

### Validation performed

- `index.html` inline script parse passed (`2` inline blocks).
- Headless login verification (`sethfozz`) after existing downline purchases:
  - Server Cut-Off panel rendered non-zero left leg (`left=384`, `right=0`).
- Persisted binary snapshot verification:
  - `sethfozz` snapshot moved to `leftLegBv=8816`, `rightLegBv=1920`.
- API verification:
  - `GET /api/member/server-cutoff-metrics?username=sethfozz` returned
    - `currentWeekLeftLegBv: 384`
    - `currentWeekRightLegBv: 0`.

## Login UX Fix: Account Switching While Authenticated (2026-03-04)

- **What changed:** removed forced login-page redirect for already-authenticated sessions so users can switch accounts directly from `login.html`.
- **File affected:**
  - `login.html`

### Root cause

- Login page previously auto-redirected to dashboard whenever any session existed.
- This made switching users look like login failure because the form was inaccessible until manual logout.

### Fix applied

- Replaced auto-redirect behavior with a contextual notice:
  - if a session exists, login page now stays visible
  - displays: `Currently signed in as <name>. Sign in below to switch accounts.`
- Sign-in form continues to work and overwrites active session with new credentials.

### Validation performed

- `login.html` inline script parse passed (`2` inline blocks).
- Headless verification:
  - login as `eagleone` succeeded
  - switched directly to `eaglethree` from login page without logout
  - revisiting login while authenticated now remains on login page and shows switch-account banner.

## Force Server Cut-Off: Apply To All Users (2026-03-04)

- **What changed:** force cut-off now targets all member identities, not only users that already have binary snapshot rows.
- **File affected:**
  - `serve.mjs`

### Root cause

- `POST /api/admin/force-server-cutoff` previously wrote member cutoff state only for `nextSnapshots`.
- If only a subset of users had snapshot records, force cut-off was effectively applied to that subset.

### Backend fixes

- Expanded force-cutoff targeting:
  - builds cutoff targets from all users in `mock-users.json`
  - merges in any additional identities found in snapshot records
  - writes/updates cutoff state for each target identity
- Added force-cutoff state coverage telemetry in applied summary:
  - `memberServerCutoffStatesTargeted`
  - `memberServerCutoffStatesUpdated`
- Added server-side hydration backfill guard in `GET /api/member/server-cutoff-metrics`:
  - when a forced cutoff was recorded with `0/0` baseline before a member snapshot became available,
  - baseline is backfilled to current totals once snapshot totals appear,
  - preventing old pre-force BV from being counted as current-week BV.

### Validation performed

- `node --check serve.mjs` passed.
- Isolated temp-server force-run verification:
  - response applied summary returned full-user targeting (`memberServerCutoffStatesTargeted: 13`, `...Updated: 13`).
  - cutoff state store count matched full user coverage in test copy.
- Hydration backfill verification:
  - forced cutoff applied first with zero baseline for a no-snapshot user,
  - snapshot was then injected,
  - `GET /api/member/server-cutoff-metrics` returned baseline equal to snapshot totals and `currentWeekLeft/Right = 0`.

## Binary Tree Node Weekly Reset From Server Cut-Off Baseline (2026-03-04)

- **What changed:** binary-tree node BV now resets to zero after cut-off and accumulates only post-cut-off activity.
- **Files affected:**
  - `serve.mjs`
  - `index.html`
  - `admin.html`

### Backend changes (`serve.mjs`)

- Updated `POST /api/admin/force-server-cutoff` to stamp baseline fields for every member/user record:
  - `serverCutoffBaselineStarterPersonalPv`
  - `serverCutoffBaselineSetAt`
- Baseline value is captured from each record’s resolved `starterPersonalPv` at force-cutoff execution time.

### Frontend changes (`index.html`, `admin.html`)

- Added baseline-aware member BV resolution:
  - `resolveMemberServerCutoffBaselineVolume(member, fallbackValue = 0)`
  - `resolveMemberBinaryVolume(member)` now computes:
    - `max(0, starterPersonalPv - serverCutoffBaselineStarterPersonalPv)`
- Binary tree node construction now uses `resolveMemberBinaryVolume(member)` in both user and admin shells.

### Result

- Immediately after cut-off: binary tree member node BV is `0` for existing members.
- After new purchases/activity: node BV grows from `0` based on post-cut-off deltas.

### Validation performed

- `node --check serve.mjs` passed.
- Force cut-off run stamped baseline fields across all users/members.
- Post-cutoff delta check confirmed member weekly node BV is `0` across existing records, and post-purchase delta behavior computes correctly from baseline.

## Personal Volume Card Cut-Off Reset (2026-03-04)

- **What changed:** Dashboard `Personal Volume` now follows the same cut-off reset rule and returns to `0` every cut-off window.
- **Files affected:**
  - `serve.mjs`
  - `index.html`
  - `admin.html`

### Backend updates (`serve.mjs`)

- Extended `GET /api/member/server-cutoff-metrics` to include personal-volume cut-off metrics:
  - `totalPersonalPv`
  - `baselinePersonalPv`
  - `currentWeekPersonalPv`
- Added personal baseline persistence on cutoff application:
  - when scheduled or forced cut-off advances, server now updates:
    - `serverCutoffBaselineStarterPersonalPv`
    - `serverCutoffBaselineSetAt`
  - baseline persistence is applied to matched user/member records.
- Extended auth response payload (`sanitizeUserForAuthResponse`) to include cutoff baseline fields so session state can stay in sync client-side.

### Frontend updates

- `index.html`
  - `resolveStarterDashboardMetrics(...)` now computes `currentWeekPersonalPv`.
  - Dashboard Personal Volume binder now uses `currentWeekPersonalPv` instead of lifetime starter PV.
  - Server cut-off metrics sync now hydrates personal baseline/current-week PV and updates the Personal Volume card directly.
- `admin.html`
  - Starter-dashboard metrics now compute and display baseline-aware current-week personal PV.

### Validation performed

- `node --check serve.mjs` passed.
- Inline script parse passed for `index.html` and `admin.html`.
- End-to-end API verification:
  - before purchase: `currentWeekPersonalPv = 0`
  - after purchase (`pvGain: 42`): `currentWeekPersonalPv = 42`
  - after force cut-off: `currentWeekPersonalPv = 0`

## Binary Fullscreen Lifetime BV Cards (2026-03-04)

- **What changed:** Added lifetime BV tracking cards in Binary Fullscreen mode so users/admins can see non-reset historical BV accumulation.
- **Files affected:**
  - `index.html`
  - `admin.html`

### Frontend implementation details

- Added two fullscreen metric cards on both shells:
  - `Lifetime Total Organization BV`
  - `Lifetime Personal Organization BV`
- Added lifetime BV helper resolvers:
  - `resolveMemberLifetimeBinaryVolume(member)` uses lifetime `starterPersonalPv` with package fallback.
  - `resolveLifetimeTotalOrganizationBvFromTreeData(treeData)` aggregates lifetime BV across placement-tree scoped nodes.
- Extended binary tree node payloads to carry a non-reset field:
  - `lifetimePersonalPv`
- Extended rollups to include lifetime sponsor-line accumulation:
  - `lifetimePersonalOrganizationBv`
- Wired new values into `applyBinaryTreeDashboardSummary(...)` for live fullscreen updates.

### Design decisions

- Lifetime cards intentionally use lifetime source values and do **not** subtract cut-off baselines.
- Existing weekly/cutoff BV behavior and discount/rank logic were left unchanged.
- Existing Personal Volume and Server Cut-Off cards remain cycle-based (`currentWeek*`) as previously implemented.

### Known limitations

- Lifetime Total Organization BV reflects the current binary-tree scope loaded in the session.
- If fallback/mock tree data is active without explicit lifetime node fields, aggregation falls back to available node BV fields.

### Validation performed

- Inline script parse check passed:
  - `index.html` (`1` inline block)
  - `admin.html` (`1` inline block)

## Theme-Based Premiere Life Logo Rollout (2026-03-07)

- **What changed:** Replaced the sidebar shield+"Charge" mark with the new Premiere Life brand logos and mapped logo assets to each runtime theme.
- **Files affected:**
  - `index.html`

### Theme/logo mapping implemented

- `default` theme -> `/brand_assets/Logos/Premiere Life Logo_White_Purple.svg`
- `apple` theme -> `/brand_assets/Logos/Premiere Life Logo_Transparent.svg`
- `shopify` theme -> `/brand_assets/Logos/Premiere Life Logo_Mono White.svg`

### Implementation notes

- Added theme-aware sidebar logo CSS selectors tied to `html[data-theme]`.
- Updated sidebar logo markup to include one logo image per theme variant and let CSS control visibility.
- Kept existing theme switcher/app-theme persistence flow unchanged.

### Known limitations

- This rollout currently updates the main member dashboard shell (`index.html`) sidebar branding only.

## Sidebar Logo Size Calibration (2026-03-07)

- **What changed:** Increased perceived sidebar logo size by compensating for excess transparent vertical space in the provided SVG assets.
- **Files affected:**
  - `index.html`

### Implementation details

- Added `.sidebar-brand-logo-shell` with a fixed visible height and `overflow: hidden`.
- Switched logo image sizing to `width: 100%` and applied `transform: scaleY(2.18)` to enlarge the visible mark without widening it.
- Retained existing theme-to-logo mapping and selector logic.

### Reasoning

- Source logos use a `2000x1000` viewBox with significant top/bottom padding, causing the wordmark to render much smaller than expected when constrained by standard height rules.

## Sidebar Logo Fit Pass (2026-03-07)

- **What changed:** Ran screenshot verification and tuned sidebar logo scaling so the full Premiere Life wordmark is visible and larger without right-edge clipping.
- **Files affected:**
  - `index.html`

### Final sizing values

- `.sidebar-brand-logo-shell`: `max-width: 14rem; height: 3.05rem;`
- `.sidebar-brand-logo`: `transform: scale(1.1, 2.34); transform-origin: center;`

### Verification

- Captured and reviewed authenticated screenshots for `default`, `apple`, and `shopify` themes after the sizing pass.

## Sidebar Medium Size + No-Clipping Fix (2026-03-07)

- **What changed:** Reworked sidebar logo rendering to eliminate clipping and keep a medium size by using cropped logo SVG variants instead of transform/overflow scaling.
- **Files affected:**
  - `index.html`
  - `brand_assets/Logos/Premiere Life Logo_White_Purple_Sidebar.svg`
  - `brand_assets/Logos/Premiere Life Logo_Transparent_Sidebar.svg`
  - `brand_assets/Logos/Premiere Life Logo_Mono White_Sidebar.svg`

### Implementation details

- Added three `_Sidebar.svg` logo variants with a cropped viewBox:
  - `viewBox="0 330 2000 340"`
- Updated sidebar logo `<img>` sources to use the cropped variants.
- Simplified sidebar logo CSS to medium width (`max-width: 12.5rem`) and removed transform/overflow clipping behavior.

### Verification

- Captured and reviewed authenticated screenshots for `default`, `apple`, and `shopify` themes (`*-v4.png`), confirming no clipping.

## Original SVG-Only Logo Pass (2026-03-07)

- **What changed:** Removed stretch-based logo rendering and switched sidebar logo usage back to the original provided SVG files only.
- **Files affected:**
  - `index.html`
  - `brand_assets/Logos/Premiere Life Logo_White_Purple.svg`
  - `brand_assets/Logos/Premiere Life Logo_Transparent.svg`
  - `brand_assets/Logos/Premiere Life Logo_Mono White.svg`

### Implementation details

- Sidebar logo sources now point to the original three provided SVG assets.
- Removed non-uniform scaling (stretch) from sidebar logo CSS.
- Kept a vertical translate/crop-only positioning approach (`translateY`) to avoid distortion while keeping logo presence in the sidebar header.
- Deleted temporary generated `_Sidebar.svg` variants so only provided assets remain in active use.

### Verification

- Captured and reviewed `v6` screenshots for `default`, `apple`, and `shopify` themes; logo is rendered from provided assets without stretching.

## Login/Auth Branding Update to Premiere Life (2026-03-08)

- **What changed:** Renamed login/auth screen brand text to `Premiere Life` to match updated naming.
- **Files affected:**
  - `login.html`
  - `admin.html`
  - `password-setup.html`

### Implementation details

- Updated member login page tab title:
  - `Vault - Login` -> `Premiere Life - Login`
- Updated member login hero heading:
  - `Charge` -> `Premiere Life`
- Updated admin page tab title (covers admin login shell view):
  - `Charge - Admin Dashboard` -> `Premiere Life - Admin Dashboard`
- Updated admin login hero heading:
  - `Charge Admin` -> `Premiere Life Admin`
- Updated admin login identifier placeholder to remove old domain branding:
  - `admin or admin@charge.com` -> `admin username or email`
- Updated password setup page tab title:
  - `Charge - Set Password` -> `Premiere Life - Set Password`

### Notes

- No API/auth logic changes were made; this is a UI/labeling-only update.

## Admin Login DB Auth Migration (2026-03-15)

- **What changed:** Replaced admin client-side mock credential lookup with a backend API login flow backed by PostgreSQL `charge.admin_users`.
- **Files affected:**
  - `backend/app.js`
  - `backend/routes/admin-auth.routes.js`
  - `backend/controllers/admin-auth.controller.js`
  - `backend/services/admin-auth.service.js`
  - `backend/stores/admin-user.store.js`
  - `admin.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

### Implementation details

- Added new API route:
  - `POST /api/admin-auth/login`
- Added DB-backed lookup for admin credentials:
  - reads from `charge.admin_users`
  - matches by username/email (case-insensitive)
  - validates plaintext password against `password_value` (current app-compatible behavior)
- Updated `admin.html` login flow:
  - removed `mock-admin-users.json` fetch/match flow
  - now posts credentials to `/api/admin-auth/login`
  - preserves existing browser session persistence behavior after successful login
- Updated login helper text in admin shell to reflect new auth source:
  - `/api/admin-auth/login + charge.admin_users`

### Validation performed

- Node syntax checks passed:
  - `backend/app.js`
  - `backend/routes/admin-auth.routes.js`
  - `backend/controllers/admin-auth.controller.js`
  - `backend/services/admin-auth.service.js`
  - `backend/stores/admin-user.store.js`
- API verification on isolated local port:
  - `POST /api/admin-auth/login` with `admin / Admin1234!` -> `200` with admin payload
  - invalid password -> `401 Invalid credentials`
- Inline script parse check passed:
  - `admin.html` (`2` inline blocks)

## Admin Enrollment API Endpoint Alias Fix (2026-03-15)

- **What changed:** Added admin-scoped registered-member route aliases so the admin shell endpoint path matches backend routing.
- **Files affected:**
  - `backend/routes/member.routes.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

### Implementation details

- `admin.html` enroll flow uses:
  - `REGISTERED_MEMBERS_API = '/api/admin/registered-members'`
- Backend previously only exposed:
  - `GET/POST /api/registered-members`
- Added aliases:
  - `GET /api/admin/registered-members`
  - `POST /api/admin/registered-members`
  - both map to existing `listRegisteredMembers` / `registerMember` handlers.

### Validation performed

- `GET /api/admin/registered-members` -> `200` with member payload.
- `POST /api/admin/registered-members` now reaches controller logic (no 404); smoke payload returned expected validation error (`Sponsor username is required for member enrollment.`), confirming route wiring is active.

## Admin Route Reload Loop Fix (2026-03-15)

- **What changed:** Patched backend SPA fallback routing so admin namespace URLs resolve to `admin.html` instead of falling through to `index.html`.
- **Files affected:**
  - `backend/app.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

### Root cause

- Admin UI writes browser URL paths like `/admin/dashboard`.
- Server fallback previously served `index.html` for unknown non-API routes.
- Visiting/reloading `/admin/*` could therefore boot the wrong app shell, causing rapid redirect/reload behavior (visual flashing).

### Implementation details

- Updated non-API fallback in `backend/app.js`:
  - if path is `/admin`, `/admin/`, `/admin.html`, or starts with `/admin/`, serve `admin.html`
  - all other non-API routes still serve `index.html`

### Validation performed

- Headless browser probe (isolated local port) confirms no rapid navigation loop:
  - `GET /admin/dashboard` -> single stable navigation, title `Premiere Life - Admin Dashboard`
  - `GET /admin/login.html` -> single stable navigation, title `Premiere Life - Admin Dashboard`

## Same-DB Privilege Model for Flush Action (2026-03-15)

- **What changed:** Implemented role-based permissions on the same `lnd_premiere_app` database so destructive flush operations require admin DB credentials.
- **Files affected:**
  - `backend/db/admin-db.js`
  - `backend/services/admin.service.js`
  - `.env`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

### Database role setup (same DB, no separate admin DB)

- Created login roles in PostgreSQL:
  - `charge_app_service` (normal app role)
  - `charge_app_admin` (privileged admin-maintenance role)
- Role memberships:
  - `charge_app_service` -> `charge_service_role`
  - `charge_app_admin` -> `charge_admin_role`
- Privilege split for destructive action:
  - `TRUNCATE` granted to `charge_admin_role`
  - `TRUNCATE` revoked from `charge_service_role`

### Backend implementation details

- Added `backend/db/admin-db.js`:
  - dedicated admin pool using `DB_ADMIN_USER` / `DB_ADMIN_PASSWORD`
  - config guard via `isAdminDbConfigured()`
- Updated `resetAllMockData(...)` in `backend/services/admin.service.js`:
  - now runs via admin pool in a transaction
  - counts rows first
  - performs `TRUNCATE TABLE` on reset-managed `charge.*` tables
  - returns the same `cleared` summary structure used by admin UI

### Environment updates

- `.env` now uses:
  - `DB_USER=charge_app_service`
  - `DB_PASSWORD=<service-role-password>`
  - `DB_ADMIN_USER=charge_app_admin`
  - `DB_ADMIN_PASSWORD=<admin-role-password>`

### Validation performed

- Verified privilege model:
  - service role has DML on `charge.member_users`
  - service role does **not** have `TRUNCATE`
  - admin role has `TRUNCATE`
- Verified app runtime with new service role:
  - health endpoint OK
  - admin login endpoint OK
  - admin registered-members endpoint OK

## Binary Tree BV Upstream Fix (2026-03-15)

- **What changed:** Fixed binary-tree volume upstream regression where enrolled members were carrying `starter_personal_pv = 0`, resulting in zero propagated BV.
- **Files affected:**
  - `backend/services/member.service.js`
  - `admin.html`
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

### Root cause

- Enrollment service created `registered_members` records without `starterPersonalPv`.
- DB writer maps missing `starterPersonalPv` to `0`, which caused tree volume helpers to treat members as having no personal BV.
- Upstream left/right leg rollups therefore stayed at zero despite successful enrollments.

### Implementation details

- Backend fix:
  - Updated `createRegisteredMember(...)` to set `starterPersonalPv: packageBv` on newly created member records.
- Frontend hardening:
  - Updated member BV resolvers in both `admin.html` and `index.html`:
    - if `starterPersonalPv <= 0`, fallback to package BV (`packageBv`) before cut-off math
  - This preserves visibility for legacy rows created before the backend fix.
- Data backfill (same DB):
  - Ran one-time SQL updates on `lnd_premiere_app`:
    - `charge.registered_members`: set `starter_personal_pv = package_bv` where starter was `0` and package BV > 0
    - `charge.member_users`: set `starter_personal_pv = enrollment_package_bv` where starter was `0` and package BV > 0

### Validation performed

- Backfill result:
  - `registered_members_backfilled = 3`
  - `member_users_backfilled = 0`
- Post-fix headless admin verification:
  - Admin summary now reports non-zero upstream volume (`Left: 2,880 BV`, `Right: 0 BV`) for seeded/enrolled chain.
- Syntax/parse checks passed:
  - `backend/services/member.service.js`
  - `admin.html` inline script parse
  - `index.html` inline script parse

## Binary Tree Enroll Right-Leg Spillover Persistence Fix (2026-03-15)

- **What changed:** Fixed enrollment persistence so tree-enroll/anticipated-node submissions using spillover mode no longer get downgraded to left-leg placement.
- **Files affected:**
  - `backend/services/member.service.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

### Root cause

- Tree-enroll modal submits locked placements as:
  - `placementLeg: 'spillover'`
  - `spilloverPlacementSide: 'left'|'right'`
  - `spilloverParentReference: <selected parent>`
- Backend `createRegisteredMember(...)` normalized `placementLeg` using a binary branch (`right` else `left`), so `'spillover'` was coerced to `'left'`.
- As a result, right-leg anticipated enrollments were stored as left and rendered as spillover-left chains in binary tree views.

### Implementation details

- Updated `createRegisteredMember(...)` to:
  - preserve `placementLeg: 'spillover'`
  - persist `spilloverPlacementSide`
  - persist `spilloverParentReference`
  - persist `isSpillover` when placement mode is spillover
- Added backend validation:
  - spillover submissions now require `spilloverParentReference` (`400` when missing)

### Validation performed

- Module import/syntax check passed for `backend/services/member.service.js`.
- Service-level enrollment test (same code path used by API service layer):
  - submitted payload with `placementLeg: spillover`, `spilloverPlacementSide: right`, `spilloverParentReference: zeroone`
  - confirmed persisted row in `charge.registered_members`:
    - `placement_leg = spillover`
    - `is_spillover = true`
    - `spillover_placement_side = right`
    - `spillover_parent_reference = zeroone`
- Test row cleanup completed after validation.

## Admin Force Cut-Off History Endpoint Restore (2026-03-16)

- **What changed:** Restored the admin history endpoint used by the Settings force cut-off tool so it no longer returns `API endpoint not found`.
- **Files affected:**
  - `backend/services/admin.service.js`
  - `backend/controllers/admin.controller.js`
  - `backend/routes/admin.routes.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

### Root cause

- Admin UI requests force cut-off history using `GET /api/admin/force-server-cutoff`.
- Backend only exposed `POST /api/admin/force-server-cutoff`.
- The API fallback handler returned `404` with `API endpoint not found.`, which surfaced in admin settings.

### Implementation details

- Added `getForceServerCutoffHistory(query)` in `backend/services/admin.service.js`:
  - reads persisted history from the DB-backed cutoff store
  - supports optional `limit` with clamp `1..100` (default `25`)
  - returns `{ success, count, history }`
- Added `listForceServerCutoffHistory` controller in `backend/controllers/admin.controller.js`.
- Added route wiring in `backend/routes/admin.routes.js`:
  - `GET /api/admin/force-server-cutoff` (history)
  - existing `POST /api/admin/force-server-cutoff` remains unchanged

### Validation performed

- Syntax checks passed:
  - `node --check backend/services/admin.service.js`
  - `node --check backend/controllers/admin.controller.js`
  - `node --check backend/routes/admin.routes.js`
- Live smoke check on temporary server:
  - `GET /api/health` -> `200`
  - `GET /api/admin/force-server-cutoff` -> `200` with `{ "success": true, "count": 0, "history": [] }`

## Admin Force Cut-Off DB Constraint Fix (2026-03-16)

- **What changed:** Fixed `postForceServerCutoff` failure caused by PostgreSQL check constraint `sales_team_commission_snapshots_check3`.
- **Files affected:**
  - `backend/services/admin.service.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

### Root cause

- Table constraint `sales_team_commission_snapshots_check3` enforces:
  - `gross_commission_amount >= payout_offset_amount`
- In `forceServerCutoff(...)`, `payoutOffsetAmount` was derived from payout-request totals and could exceed newly computed cycle gross commission.
- This produced insert rows violating constraint check3 and aborted force cut-off writes.

### Implementation details

- Updated `backend/services/admin.service.js` inside `forceServerCutoff(...)`:
  - compute `payoutOffsetAmountRaw` from payout requests
  - clamp applied offset to current gross:
    - `payoutOffsetAmount = min(grossCommissionAmount, payoutOffsetAmountRaw)`
  - compute net from clamped offset:
    - `netCommissionAmount = max(0, grossCommissionAmount - payoutOffsetAmount)`
- This aligns backend force-run commission math with frontend net-commission behavior and satisfies DB constraints.

### Validation performed

- Syntax check passed:
  - `node --check backend/services/admin.service.js`
- Live force-run smoke check on temp server:
  - `POST /api/admin/force-server-cutoff` -> `200`
  - response returned successful applied summary and history entry; no check constraint error logged.

## Sales Team Commission API Constraint Hardening (2026-03-16)

- **What changed:** Hardened `POST /api/sales-team-commissions` payload sanitization so invalid commission combinations no longer produce DB constraint 500 errors.
- **Files affected:**
  - `backend/services/metrics.service.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

### Root cause

- `saveSalesTeamCommissions(...)` accepted user-supplied values for:
  - `cappedCycles`, `overflowCycles`
  - `grossCommissionAmount`, `payoutOffsetAmount`, `netCommissionAmount`
  - `currencyCode`
- These were only non-negative sanitized. Constraint-dependent relations were not normalized:
  - `capped_cycles <= total_cycles`
  - `overflow_cycles = GREATEST(total_cycles - capped_cycles, 0)`
  - `gross_commission_amount >= payout_offset_amount`
  - `net_commission_amount <= gross_commission_amount`
  - `currency_code` uppercase
- Result: malformed payloads triggered PostgreSQL constraint violations and surfaced as `500 Unable to save sales team commissions.`

### Implementation details

- Updated `sanitizeSalesTeamCommissionRecord(...)` in `backend/services/metrics.service.js` to normalize relational fields before persistence:
  - `cappedCycles = min(totalCycles, cappedCyclesRaw)`
  - `overflowCycles = max(0, totalCycles - cappedCycles)`
  - `payoutOffsetAmount = min(grossCommissionAmount, payoutOffsetAmountRaw)`
  - `netCommissionAmount = max(0, grossCommissionAmount - payoutOffsetAmount)`
  - `currencyCode = uppercase`
- Added `roundCurrencyAmount(...)` helper for stable currency precision.

### Validation performed

- Syntax check passed:
  - `node --check backend/services/metrics.service.js`
- API repro (previously failing shape):
  - `POST /api/sales-team-commissions` with `gross=10`, `offset=50`, `capped>total`, lowercase currency
  - now returns `200` with normalized values (`offset=10`, `net=0`, `capped=total`, `overflow=0`, `currency=USD`)
  - no PostgreSQL constraint error in server log.
- Post-test data consistency recovery:
  - executed `POST /api/admin/force-server-cutoff` to recalculate authoritative snapshot state
  - verified constraint check query returns `0` violations.

## Dashboard Commission Container Server Persistence (2026-03-16)

- **What changed:** moved live-mode Infinity/Legacy claim-state persistence from client-only storage into DB-backed API state, and added a server-backed commission container snapshot endpoint for the four dashboard commission containers.
- **Files affected:**
  - `backend/stores/commission-container.store.js` (new)
  - `backend/services/commission-container.service.js` (new)
  - `backend/controllers/commission-container.controller.js` (new)
  - `backend/routes/commission-container.routes.js` (new)
  - `backend/app.js`
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

### Root cause

- The dashboard used client-local claim maps (`localStorage`) for:
  - `charge-infinity-builder-claims-v1`
  - `charge-legacy-leadership-claims-v1`
- Those claim maps decide whether tier cards are already claimed.
- In live mode, this made claim-state non-authoritative and vulnerable to refresh/session storage drift, which allowed repeated tier claims and inflated total commission balance on dashboard cards.

### Backend implementation details

- Added `GET/POST /api/commission-containers` endpoints.
- Added new store with schema guard for required DB table:
  - `charge.member_commission_containers`
- Endpoint payload includes:
  - identity: `userId`, `username`, `email`
  - balances:
    - `fasttrack`
    - `infinitybuilder`
    - `legacyleadership`
    - `salesteam`
  - claim maps:
    - `infinitybuilder`
    - `legacyleadership`
- Service behavior:
  - resolves member identity through existing member users
  - returns default zero snapshot when no record exists
  - upserts record on POST with sanitized balances/claim maps

### Frontend implementation details

- Added `COMMISSION_CONTAINERS_API = '/api/commission-containers'`.
- Added live-mode hydration and sync lifecycle:
  - load snapshot on startup
  - load snapshot again when runtime mode switches back to live
  - debounce/persist runtime balance + claim-map snapshot updates to server
- Updated claim-map accessors:
  - live mode now reads/writes claim maps from the hydrated server snapshot
  - mock mode still uses local storage behavior
- Added claim/transfer action guards:
  - block claim/transfer actions until server commission containers are hydrated in live mode
- Follow-up hardening:
  - claim actions now force an immediate server persistence call (not only debounced sync), reducing “claim then instant refresh” race windows.
  - transfer action now attempts an immediate post-transfer commission-container persistence refresh.

### Required DB table

- Backend now attempts admin-role auto-provision on first access:
  - creates `charge.member_commission_containers` if missing (using `adminPool` credentials: `DB_ADMIN_*` or fallback `DB_*`)
  - grants DML access to service role from `DB_USER`
- Identity fallback behavior:
  - if no `member_users` match is found, API now persists against a deterministic synthetic identity key (derived from submitted username/email) instead of returning 404.
- If admin auto-provision is unavailable, the table still must exist manually with (minimum):
  - `user_id text primary key`
  - `username text`
  - `email text`
  - `currency_code text`
  - `fasttrack_balance numeric`
  - `infinitybuilder_balance numeric`
  - `legacyleadership_balance numeric`
  - `salesteam_balance numeric`
  - `infinitybuilder_claim_map jsonb`
  - `legacyleadership_claim_map jsonb`
  - `created_at timestamptz`
  - `updated_at timestamptz`

### Validation performed

- Syntax checks passed:
  - `node --check backend/stores/commission-container.store.js`
  - `node --check backend/services/commission-container.service.js`
  - `node --check backend/controllers/commission-container.controller.js`
  - `node --check backend/routes/commission-container.routes.js`
  - `node --check backend/app.js`
  - extracted inline script from `index.html` and verified via `node --check`

## Dashboard Reload Commission Offset Mutation Fix (2026-03-16)

- **What changed:** fixed dashboard commission balances and transfer button state reappearing after reload despite prior transfers to E-Wallet.
- **Files affected:**
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

### Root cause

- `resolveNetCommissionBalance(...)` was mutating `commissionPayoutOffsetBySource` by clamping stored offsets down to the current gross value.
- During startup, gross commission can temporarily evaluate to `0` before all dashboard snapshots hydrate.
- That transient `0` gross pass collapsed loaded offsets to `0`, so later renders treated commissions as available again.

### Implementation details

- Updated `resolveNetCommissionBalance(...)` in `index.html` to compute a clamped effective offset for display only, without mutating persistent runtime offset state.
- Retained existing positive-value sanitation through `resolveCommissionPayoutOffset(...)`.

### Validation performed

- Browser automation repro with user `zeroone` confirmed:
  - offset API still returns historical values (`fasttrack: 3841`, `infinitybuilder: 1350`).
  - dashboard now consistently renders `Fast Track = $0.00` and `Infinity Builder = $0.00`.
  - both transfer buttons stay disabled before and after reload.
- Additional probe validation:
  - `resolveNetCommissionBalance('infinityBuilder', 150)` returns `0` after hydration.
  - `resolveNetCommissionBalance('fastTrack', 768)` returns `0` after hydration.

## User Store Link Backfill + Registration Guarantee Verification (2026-03-25)

- **What changed:** added a reusable backfill script for user store-link fields and executed it against current DB users.
- **Files affected:**
  - `backend/scripts/backfill-user-store-links.mjs` (new)
  - `package.json`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

### Why this was needed

- Existing records in `charge.member_users` had blank:
  - `store_code`
  - `public_store_code`
  - `attribution_store_code`
- This blocked store-link testing for previously registered users.

### Implementation details

- Added script: `npm run backfill:store-links`
- Script behavior:
  - reads current users from `charge.member_users`
  - generates unique `M-XXXX` member store codes when missing
  - generates unique `CHG-XXXX` public store codes when missing
  - resolves attribution store code from sponsor relationship in `charge.registered_members`
  - falls back to `REGISTRATION_LOCKED` when no sponsor owner can be resolved
  - writes updates back via existing store write path

### Execution summary

- Backfill run completed successfully:
  - `totalUsers: 7`
  - `updatedUsers: 7`
  - `assignedStoreCodeCount: 7`
  - `assignedPublicStoreCodeCount: 7`
  - `assignedAttributionStoreCodeCount: 7`
- Post-run verification:
  - `missingCount: 0` for required store-link fields.

### Registration flow confirmation

- `createRegisteredMember(...)` in `backend/services/member.service.js` already generates:
  - `storeCode`
  - `publicStoreCode`
  - `attributionStoreCode`
- Result: new registrations already satisfy “store link/code generated upon registration”; backfill was needed only for older data.

## Store Checkout: No-Link Dev Attribution Flow (2026-03-25)

- **What changed:** added a no-link, no-terminal checkout flow in My Store so QA can test attribution by entering a store code directly in UI.
- **Files affected:**
  - `index.html`
  - `backend/services/invoice.service.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

### Frontend updates

- Added new checkout section:
  - `Store Attribution (Dev Testing)`
  - optional `Member Store Code` input (`storeAttributionCode`)
- Behavior:
  - if blank: existing mapped flow is used
  - if provided: checkout routes attribution using the entered store code, and UI feedback confirms target code
- Added handling logic:
  - `resolveCheckoutStoreRouting(...)`
  - `isStoreCodeOwnedByCurrentSessionUser(...)`
  - validation for store code format (`CHG-XXXX` style)
- BV handling for manual/external code:
  - when a paid user manually routes checkout to another member store code, owner BV-credit path is used (guest-style simulation), not buyer self-credit.

### Backend fail-safe update

- `createStoreInvoice(...)` now verifies that an explicitly provided member store code resolves to an existing user.
- Returns `404` with a clear message if the store code is invalid:
  - `"Member store code was not found. Please verify the store code."`

### Validation performed

- `node --check backend/services/invoice.service.js` passed.
- Parsed/validated main inline app script in `index.html` (syntax check passed).
- Service-level behavior check:
  - valid store code -> invoice create `201`
  - invalid store code -> `404` with validation error.

## Public Store Page + Shared Admin Product Catalog (2026-03-25)

- **What changed:** implemented a dedicated public store page and moved store product management to a DB-backed shared catalog controlled from admin.
- **Files affected:**
  - `store.html` (new)
  - `backend/stores/store-product.store.js` (new)
  - `backend/services/store-product.service.js` (new)
  - `backend/controllers/store-product.controller.js` (new)
  - `backend/routes/store-product.routes.js` (new)
  - `backend/app.js`
  - `index.html`
  - `admin.html`
  - `Claude_Notes/public-store-page.md` (new)
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

### Backend

- Added auto-provisioned table:
  - `charge.store_products`
- Added endpoints:
  - `GET /api/store-products` (active catalog for storefronts)
  - `GET /api/admin/store-products` (full catalog for admin page)
  - `PUT /api/admin/store-products` (replace catalog)
- Added route serving public page:
  - `GET /store`, `/store/`, `/store.html` -> `store.html`

### Admin store product management

- Replaced localStorage-based product persistence in `admin.html` with API-backed persistence.
- Admin create/edit/archive/delete actions now write to shared backend catalog.
- Added save-failure recovery by reloading catalog from backend if persistence fails.

### Member store integration

- Updated `index.html` My Store to load products from `GET /api/store-products`.
- Public store link generation now points to app route:
  - `${window.location.origin}/store?store=<code>`

### Public store page

- Added new public storefront in `store.html`.
- Supports:
  - product browse + selected-product panel
  - cart and checkout
  - store attribution via member store code (query param or manual input)
  - invoice creation through existing `/api/store-invoices`
  - BV credit forwarding to attribution owner through `/api/member-auth/record-purchase`
- Checkout applies 15% preferred discount.

### Validation performed

- `node --check` passed for:
  - `backend/app.js`
  - all new store-product backend files
  - updated invoice service
- Inline script parse checks passed for:
  - `index.html`
  - `admin.html`
  - `store.html`
- Runtime smoke test:
  - validated store-products service read/replace/restore behavior against DB and restored original product set.

## Public Store UX Refactor: Browse -> Product -> Checkout (2026-03-25)

- **What changed:** refactored the public store into a dedicated multi-page flow to keep checkout off the storefront landing page and align to a Shopify-style browsing journey.
- **Files affected:**
  - `store.html` (rewritten)
  - `store-product.html` (new)
  - `store-checkout.html` (new)
  - `storefront-shared.js` (new)
  - `backend/app.js`
  - `Claude_Notes/public-store-page.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

### UX changes requested and implemented

- Added top navbar across store pages with:
  - `Home`
  - `Products`
  - `Support (Contact Us)`
  - `Member Login`
  - `Free Member Login`
- Storefront (`/store`) now shows product grid browsing only.
- Removed public BV display from product cards and checkout summary visuals.
- Product detail page (`/store/product`) now contains:
  - product title
  - product description
  - detail bullets/headers
  - price
  - quantity + add-to-cart
- Checkout page (`/store/checkout`) now contains:
  - cart line items and quantity controls
  - preferred discount + totals
  - payment/shipping form
  - store-code attribution input

### Architecture updates

- Added shared frontend utility module: `storefront-shared.js`
  - product API loading
  - store code normalization + persistence
  - cart persistence/sanitization
  - cart summary calculations
  - checkout invoice submission
  - attribution BV sync call
- Added backend route mapping for new public store pages in `backend/app.js`:
  - `GET /store/product` + aliases -> `store-product.html`
  - `GET /store/checkout` + aliases -> `store-checkout.html`

### Validation performed

- `node --check backend/app.js` passed.
- `node --check storefront-shared.js` passed.
- Inline script parse checks passed for:
  - `store.html`
  - `store-product.html`
  - `store-checkout.html`
- Runtime smoke test on isolated port `3131` passed:
  - `/store` -> `200`
  - `/store/product?product=hydration-stack&store=CHG-ZERO` -> `200`
  - `/store/checkout?store=CHG-ZERO` -> `200`

## Public Store Product-Click Refresh Loop Hardening (2026-03-25)

- **What changed:** switched storefront navigation URLs to direct HTML page targets to prevent fallback/route mismatch loops when backend route changes are not yet restarted.
- **Files affected:**
  - `storefront-shared.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/public-store-page.md`

### Implementation detail

- Updated shared URL builders:
  - storefront URL -> `/store.html`
  - product URL -> `/store-product.html`
  - checkout URL -> `/store-checkout.html`
  - public store link base -> `/store.html`
- Result: product and checkout navigation no longer depend on pretty-route handlers to resolve correctly.

### Validation

- `node --check storefront-shared.js` passed.
- Inline script parse checks still pass for `store.html`, `store-product.html`, `store-checkout.html`.
- Headless navigation trace confirms stable transition:
  - `/store.html` -> `/store-product.html?product=...`
  - no repeated navigation loop detected.

## Public Store UX Refinement Pass (2026-03-25)

- **What changed:** applied storefront refinements based on live review feedback.
- **Files affected:**
  - `store.html`
  - `store-product.html`
  - `store-checkout.html`
  - `store-support.html` (new)
  - `storefront-shared.js`
  - `backend/app.js`
  - `Claude_Notes/public-store-page.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

### Refinements implemented

- Removed member store code UI from the product grid storefront page.
- Moved support into a dedicated page (`store-support.html`) and changed nav label to `Support`.
- Removed the product-page `You might also like` section (single-product phase).
- Redesigned product description presentation from list/bullets to paragraph-style narrative.
- Added filtering so BV references are not displayed on the product page description content.

### Routing and nav updates

- Added backend support route alias:
  - `GET /store/support`, `/store/support/`, `/store-support.html` -> `store-support.html`
- Added shared `buildSupportUrl(...)` helper in `storefront-shared.js`.
- Updated store/product/checkout nav support links to route to the dedicated support page.

### Validation

- `node --check` passed for:
  - `backend/app.js`
  - `storefront-shared.js`
- Inline script parse checks passed for:
  - `store.html`
  - `store-product.html`
  - `store-checkout.html`
  - `store-support.html`
- Runtime smoke test on isolated port `3135` passed:
  - `/store.html` -> `200`
  - `/store-product.html?...` -> `200`
  - `/store-checkout.html` -> `200`
  - `/store-support.html` -> `200`

## Public Store Custom Stripe Checkout (Embedded Elements) (2026-03-25)

- **What changed:** replaced public checkout redirect-only flow with an embedded Stripe Elements card experience while preserving existing hosted-checkout endpoints for compatibility.
- **Files affected:**
  - `backend/services/store-checkout.service.js`
  - `backend/controllers/store-checkout.controller.js`
  - `backend/routes/store-checkout.routes.js`
  - `storefront-shared.js`
  - `store-checkout.html`
  - `.env`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

### Backend updates

- Added checkout config endpoint support:
  - returns Stripe publishable key from `STRIPE_PUBLISHABLE_KEY`
  - returns `503` with clear config message when missing
- Added Payment Intent flow for custom checkout:
  - `POST /api/store-checkout/intent` creates payment intent with server-calculated totals
  - `POST /api/store-checkout/intent/complete` finalizes invoice after successful payment
- Preserved hosted checkout routes:
  - `POST /api/store-checkout/session`
  - `POST /api/store-checkout/complete`
- Added shared checkout finalization helper to keep invoice creation/BV crediting idempotent across both hosted session and payment-intent flows.
- Added stricter server-side validation for checkout payload:
  - buyer name required
  - buyer email required/validated
  - shipping address required
  - store code required/validated

### Frontend updates

- Added Stripe.js on `store-checkout.html` and mounted embedded Card Element in the checkout form.
- Reworked checkout submission path:
  - create payment intent from backend
  - confirm card payment client-side with Stripe Elements
  - call backend completion endpoint to create invoice + owner BV credit
- Added checkout config fetch helper and intent helpers in `storefront-shared.js`:
  - `fetchCheckoutConfig`
  - `createCheckoutPaymentIntent`
  - `completeCheckoutPaymentIntent`
- Kept existing hosted checkout helpers for compatibility (`submitCheckout`, `completeCheckoutSession`).

### Environment/config updates

- Added `STRIPE_PUBLISHABLE_KEY` to `.env` requirements.
- Existing `STRIPE_SECRET_KEY` and `PUBLIC_APP_ORIGIN` remain in use.

### Validation performed

- `node --check` passed:
  - `backend/services/store-checkout.service.js`
  - `backend/controllers/store-checkout.controller.js`
  - `backend/routes/store-checkout.routes.js`
  - `backend/app.js`
  - `storefront-shared.js`
- Extracted inline script parse check passed for `store-checkout.html`.
- Service-level runtime checks passed via Node execution:
  - missing publishable key -> `503` config error
  - invalid buyer email -> `400`
  - missing store code -> `400`
  - missing payment intent ID on completion -> `400`
  - valid intent creation path returns Stripe `paymentIntentId` + `clientSecret`
- Legacy store code alias validation confirmed in intent response:
  - input `CHG-7X42` resolves to attribution `CHG-ZERO`.

## Public Store Free Account Registration Parity + Register-and-Pay Flow (2026-03-25)

- **What changed:** aligned Free Account checkout registration with enrollment-style fields and ensured those values persist through Stripe metadata into post-payment member creation.
- **Files affected:**
  - `store-checkout.html`
  - `storefront-shared.js`
  - `backend/services/store-checkout.service.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

### Frontend updates

- Updated Free Account checkout section in `store-checkout.html` to include expanded enrollment-style fields:
  - username
  - phone
  - country flag (expanded option list)
  - placement leg (`left`, `right`, `spillover`)
  - spillover side
  - spillover parent mode (`auto`, `manual`)
  - manual spillover parent reference
  - notes
- Added conditional UI behavior:
  - spillover controls only shown when placement is `spillover`
  - parent reference only shown/required when spillover parent mode is `manual`
- Updated free-account submit CTA label from Stripe pay wording to:
  - `Register and Pay`

### Shared checkout payload updates

- Extended `storefront-shared.js` checkout validation and payload construction to include and validate new free-account fields.
- Added client-side guard for manual spillover mode:
  - requires `Assigned Parent ID or Username` before payment intent creation.

### Backend checkout + registration updates

- Added server-side normalization and validation for free-account checkout fields.
- Added free-account metadata persistence into Stripe checkout metadata for both flows:
  - embedded Payment Intent flow
  - hosted Checkout Session flow
- Added metadata re-hydration during checkout finalization so member creation uses submitted free-account fields instead of fallback defaults.
- Updated preferred-customer auto-registration to apply submitted values for:
  - `memberUsername`
  - `phone`
  - `countryFlag`
  - `placementLeg`
  - `spilloverPlacementSide`
  - `spilloverParentMode`
  - `spilloverParentReference`
  - `notes`
- Added server-side parity guard for manual spillover placement requiring a parent reference.

### Validation performed

- `node --check backend/services/store-checkout.service.js` passed.
- `node --check storefront-shared.js` passed.
- `store-checkout.html` inline script parse check passed.

## Public Store Free Account Flow Correction: Modal-First Registration (2026-03-25)

- **What changed:** corrected Free Account checkout flow to match UX requirement: buyer cannot choose placement leg, and registration details are collected in a modal after pressing `Register and Pay`.
- **Files affected:**
  - `store-checkout.html`
  - `storefront-shared.js`
  - `backend/services/store-checkout.service.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

### Frontend behavior changes

- Removed customer-facing leg/spillover controls from Free Account checkout.
- Added Free Account hint panel stating placement leg is managed by store owner.
- Added a dedicated `Free Account Setup` modal that opens when user presses `Register and Pay`.
- Modal captures important registration fields before payment:
  - full name
  - email
  - username (required)
  - phone (optional)
  - country
  - notes (optional)
- On modal submit:
  - values are synced into checkout hidden fields
  - modal closes
  - Stripe checkout flow proceeds (`Pay Checkout` path)
- Existing thank-you modal with setup link remains unchanged and continues to display post-payment.

### Shared validation/payload changes

- Removed free-account placement/spillover payload fields from shared storefront payload construction.
- Kept validation focused on required Free Account identity fields (not placement controls).

### Backend checkout changes

- Removed storefront acceptance/persistence of buyer-selected placement/spillover fields in checkout metadata.
- Preferred-customer auto-enrollment now uses registration identity fields (username/phone/country/notes), while placement is resolved from store-owner-side defaults/fallback logic (not shopper input).

### Validation performed

- `node --check backend/services/store-checkout.service.js` passed.
- `node --check storefront-shared.js` passed.
- `store-checkout.html` inline script parse check passed.

## Password Setup Link Recovery Hardening (2026-03-25)

- **What changed:** fixed setup-link dead-end by adding token recovery support when `/password-setup` receives an invalid/unknown token.
- **Files affected:**
  - `backend/utils/auth.helpers.js`
  - `backend/services/auth.service.js`
  - `backend/controllers/auth.controller.js`
  - `backend/services/member.service.js`
  - `backend/services/store-checkout.service.js`
  - `password-setup.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

### Backend changes

- `buildPasswordSetupLink(...)` now supports embedding normalized email in the setup URL query (`email=`) in addition to `token=`.
- Added shared helper in auth service to ensure a valid open setup token exists for pending users and return a current setup link.
- `validatePasswordSetupToken(token, email)` now supports fallback recovery:
  - if token is invalid/unknown and fallback email belongs to a `passwordSetupRequired` account,
  - backend issues/reuses a valid token,
  - returns `409` with `setupLink` for client-side redirect recovery.
- `GET /api/member-auth/setup-password` controller now forwards optional `email` query and includes `setupLink` in error payload when recovery is available.
- Updated setup-link creation callsites to include email in generated links:
  - member registration setup links
  - storefront checkout setup links
  - login `PASSWORD_SETUP_REQUIRED` setup links

### Frontend changes (`password-setup.html`)

- Setup page now reads both `token` and optional `email` query params.
- Validation request now includes email fallback when present.
- If backend returns a recovery `setupLink`, page auto-redirects to refreshed setup URL instead of hard-failing with dead-end error.

### Verification

- `node --check` passed for all touched backend files.
- Inline script parse check passed for `password-setup.html`.
- Recovery simulation passed:
  - invalid token + valid email returns `409` + regenerated `setupLink`
  - regenerated token validates successfully.

## Account-Specific Login/Setup Split + Free Dashboard Shell (2026-03-26)

- **What changed:** completed separation of paid-member vs free-account auth flows, introduced a dedicated free-account dashboard in storefront style, and removed the previous in-app preferred/free gate from the member shell.
- **Files affected:**
  - `backend/utils/auth.helpers.js`
  - `backend/services/auth.service.js`
  - `backend/services/member.service.js`
  - `backend/services/store-checkout.service.js`
  - `backend/app.js`
  - `login.html`
  - `store-login.html`
  - `password-setup.html`
  - `store-password-setup.html` (new)
  - `store-dashboard.html` (new)
  - `store-checkout.html`
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

### Backend auth/setup updates

- Added account-audience resolution in auth helpers:
  - `free` when package/rank resolves to Free Account (`preferred-customer-pack` / preferred/free rank labels)
  - `member` otherwise.
- Updated `buildPasswordSetupLink(...)` to generate audience-specific setup URLs:
  - free -> `/store-password-setup.html?token=...&email=...&audience=free`
  - member -> `/password-setup.html?token=...&email=...&audience=member`
- Updated auth/member/store-checkout setup-link callsites to pass audience context so links are consistently emitted to the correct setup page.
- `validatePasswordSetupToken(...)` now returns `accountAudience` in payload so frontend setup pages can route to the correct shell if an old/mismatched link is opened.

### Frontend auth-flow updates

- `login.html` (paid member login):
  - now blocks free-account logins and shows a redirect link to Free Member Login.
  - still supports `PASSWORD_SETUP_REQUIRED`, now accepting both setup link path variants.
- `store-login.html` (free login):
  - now blocks paid-member logins and shows a redirect link to Member Login.
  - successful free login now routes to `/store-dashboard.html` (store-scoped URL support).
  - still supports setup-required links for pending-password users.
- `password-setup.html` (member setup):
  - now accepts both setup path variants for recovery.
  - auto-redirects to `store-password-setup.html` when backend payload identifies the account as `free`.
- Added `store-password-setup.html`:
  - storefront-style setup experience for free accounts.
  - validates token via `/api/member-auth/setup-password` and posts password update to the same endpoint.
  - auto-redirects to member setup page if backend identifies account as `member`.

### Free account dashboard shell

- Added `store-dashboard.html` as dedicated free-account destination after free login.
- Dashboard scope intentionally limited to storefront-side needs:
  - purchase activity cards/list (filtered to current member identity from `/api/store-invoices`)
  - profile form (local persisted state)
  - saved address form (local persisted state)
  - direct links to Products and Support
- Added auth/session guard in dashboard page script:
  - no session -> redirect to free login
  - non-free session -> redirect to member login

### Routing updates

- Added static route aliases in `backend/app.js`:
  - `GET /store/dashboard`, `/store/dashboard/`, `/store-dashboard.html` -> `store-dashboard.html`
  - `GET /store/password-setup`, `/store/password-setup/`, `/store-password-setup.html` -> `store-password-setup.html`

### Other UX alignment updates

- `store-checkout.html` success modal text updated from `Preferred Login` to `Free Member Login`.
- setup-link validation in checkout success modal now supports both setup-page paths.

### Member-shell gate removal

- Removed preferred/free nav/page gate behavior in `index.html` by neutralizing preferred-customer page access restriction logic:
  - page resolution no longer forces free users to `my-store`
  - nav/settings/quick-action links are no longer hidden by account-type gate.

### Validation performed

- `node --check` passed:
  - `backend/utils/auth.helpers.js`
  - `backend/services/auth.service.js`
  - `backend/services/member.service.js`
  - `backend/services/store-checkout.service.js`
  - `backend/app.js`
- Inline script parse checks passed:
  - `login.html`
  - `store-login.html`
  - `password-setup.html`
  - `store-password-setup.html`
  - `store-dashboard.html`
  - `store-checkout.html`
  - `index.html`
- Runtime route smoke check on `PORT=3137` returned `200` for:
  - `/store.html`
  - `/store-login.html`
  - `/store-dashboard.html`
  - `/store-password-setup.html`
  - `/password-setup.html`
  - `/login.html`
  - `/store/checkout`
  - `/store/dashboard`
  - `/store/password-setup`

## Storefront Session Link Persistence + Free Dashboard Upgrade (2026-03-26)

- **What changed:** fixed storefront auth-link behavior so signed-in free users stay visibly recognized while navigating product/support/checkout pages, and added a direct account-upgrade action to the free dashboard.
- **Files affected:**
  - `storefront-shared.js`
  - `store.html`
  - `store-product.html`
  - `store-support.html`
  - `store-checkout.html`
  - `store-dashboard.html`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/charge-documentation.md`

### Storefront session UX updates

- Added shared session/auth helpers to `storefront-shared.js`:
  - `readUserSession()`
  - `isFreeAccountUser(user)`
  - `buildFreeLoginUrl(storeCode)`
  - `buildDashboardUrl(storeCode)`
- Updated storefront pages to sync top-nav auth CTA labels/targets at runtime:
  - free session -> `My Dashboard` -> `/store-dashboard.html?store=...`
  - paid session -> `Member Dashboard` -> `/index.html`
  - no session -> keep dedicated login CTAs.

### Free dashboard upgrade action

- Added an **Upgrade Account** card in `store-dashboard.html` with:
  - package selector
  - submit button
  - success/error feedback messaging
- Connected button action to:
  - `POST /api/member-auth/upgrade-account`
- Success behavior:
  - merges returned `user` payload into current session
  - persists refreshed session to storage/cookie
  - redirects to paid member dashboard (`/index.html`) after success.

### Verification

- `node --check storefront-shared.js` passed.
- Inline script parse checks passed:
  - `store.html`
  - `store-product.html`
  - `store-support.html`
  - `store-checkout.html`
  - `store-dashboard.html`
  - `store-login.html`
- Runtime route smoke check on `PORT=3138` returned `200` for:
  - `/store.html`
  - `/store-product.html`
  - `/store-support.html`
  - `/store-checkout.html`
  - `/store-dashboard.html`
  - `/store/login`
  - `/store/dashboard`

## Admin Binary Tree Parity Update From User-Side Tree Logic (2026-04-03)

- **What changed:** ported the latest user-side binary-tree placement/scoping behavior into admin so admin tree rendering now matches updated member-tree rules.
- **Files affected:**
  - `admin.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

### Admin tree logic updates (`admin.html`)

- Added placement normalization constants + helpers used by user-side tree builder:
  - supports legacy + newer placement values:
    - `left`, `right`, `spillover`
    - `spillover-left`, `spillover-right`
    - `extreme-left`, `extreme-right`
- Added member eligibility gate used by user-side tree rendering:
  - excludes free/preferred-customer members from binary-tree node construction.
- Updated member cutoff baseline handling:
  - if a member was created after the stored cutoff baseline timestamp, baseline volume is treated as `0` for that member (prevents incorrect negative/zero carryover on new post-cutoff enrollments).
- Updated `createBinaryTreeDataFromRegisteredMembers()` to match user-side behavior:
  - filters tree nodes to eligible binary-tree members.
  - supports spillover + extreme placement resolution.
  - stores normalized `enrollmentPackage` on node payload.
  - scopes rendered subtree from current viewer node (not only global root traversal).
  - preserves spillover identity and anonymizes outside-org spillover sponsor branches consistently with user-side behavior.
  - applies root-node status from current session state.

### Design decisions

- Kept admin fallback root identity label as `company-root` (admin-specific convention) while applying user-side tree traversal/placement behavior.
- Limited this update to binary-tree parity logic; no additional admin enrollment form UX expansion was introduced in this pass.

### Known limitations

- Admin enrollment form still exposes legacy placement UI options (`left`/`right`/`spillover`) rather than the full newer placement option set shown on user-side flows.
- Despite that UI limitation, admin tree rendering now correctly interprets newer placement values when they already exist in member records.

### Validation performed

- Inline script parse check passed for `admin.html` via `new Function(...)` extraction test (`2` inline script blocks parsed).

### Follow-up parity pass (same day)

- **What changed (follow-up):** completed the remaining user-side parity items that were still missing after the first pass.
- Added admin enroll UI parity for placement controls:
  - replaced legacy single `spillover` option with:
    - `spillover-left`
    - `spillover-right`
    - `extreme-left`
    - `extreme-right`
  - added spillover parent assignment mode selector (`auto` vs `manual`).
- Added missing placement helper parity in admin script:
  - `resolveSpilloverSideFromPlacementOption(...)`
  - `resolvePlacementLegLabel(...)`
  - `isManualSpilloverParentAssignment(...)`
  - `resolveCurrentSponsorDirectLegAvailability(...)`
  - `syncEnrollPlacementLegOptions(...)`
- Updated spillover parent suggestion behavior to match user-side:
  - suggestion list only shown for spillover + manual parent assignment.
  - hint/empty-state copy aligned with user-side behavior.
- Updated admin enrollment submit flow to user-side placement logic:
  - normalized placement control parsing for direct/spillover/extreme.
  - direct leg availability guard (`left`/`right` filled checks).
  - manual spillover parent validation against direct-child suggestions.
  - payload now includes normalized spillover parent mode + effective parent reference.
  - success placement summary now reflects `AUTO` parent when auto-assignment is used.
- Updated binary-tree renderer init options to match user-side spillover visibility behavior:
  - `spilloverHighlightMode: 'received-only'` (previously `none` on admin).
- Updated enrolled-member placement badges to user-side formatting:
  - uses normalized placement label resolution and spillover side resolution instead of legacy raw-string checks.

- **Validation (follow-up):**
  - re-ran inline script parse check for `admin.html` successfully.

## Admin Binary Tree UI Controls + Pan Cursor Parity (2026-04-03)

- Completed a full user-side binary-tree UI control parity pass on admin tree UI.
- Objective addressed:
  - make admin binary-tree controls and behavior match user-side tree behavior 1:1 (including cursor/pan interaction states and tree enroll/settings UX).

### Files affected

- `admin.html`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Admin binary-tree parity updates applied

- CSS parity added for user-side tree interaction classes:
  - `tree-pan-mode-active` cursor state (`grab`)
  - `tree-pan-mode-dragging` cursor state (`grabbing`)
  - focus suppression while pan-mode is active (matches user-side behavior).
- Added missing tree overlay/modal CSS and fullscreen states:
  - `#tree-settings-window` / `#tree-settings-panel`
  - `#tree-enroll-modal-overlay` / `#tree-enroll-modal`
  - fullscreen hide/show transitions for tools/search when settings/enroll overlays are open.
- Added missing mobile action control CSS parity:
  - `#tree-mobile-right-actions`
  - `#tree-mobile-enroll-toggle`
  - `#tree-mobile-direct-toggle`
  - `#tree-mobile-settings-toggle`
  - parity for small-screen and medium-screen fullscreen breakpoints.

### Markup parity applied

- Binary tree section now matches user-side structure for controls/modals:
  - added desktop settings button in tools bar (`tree-settings-toggle`)
  - added direct-sponsor search toggle (`tree-search-direct-toggle`)
  - added mobile right-actions cluster (`tree-mobile-right-actions`) with enroll/direct/minimap/root/settings buttons
  - added tree settings modal markup (`tree-settings-window`, account/accessibility/theme/logout controls)
  - added tree enroll modal markup (`tree-enroll-modal-overlay`, form fields, placement lock summary, preview, feedback, password setup link)
- Added user-side summary parity cards/metrics IDs:
  - `tree-summary-total-direct-sponsor`
  - `tree-fullscreen-summary-total-direct-sponsor`
- Binary-tree section diff check against user-side (`index.html`) now returns no section-level differences.

### Script parity applied

- Added missing admin bindings/state for new tree UI controls/modals.
- Added tree interaction settings support functions (matching user-side behavior):
  - `sanitizeTreeTrackpadZoomSensitivity`
  - `getTreeInteractionSettingsSnapshot`
  - `updateTreeInteractionSettings`
  - settings panel open/close/sync handlers.
- Added tree settings panel lifecycle handlers:
  - open/close state + aria sync
  - reverse trackpad toggle wiring
  - zoom-strength range wiring
  - overlay click + Escape close behavior
  - logout action wired to admin session clear + reload flow.
- Added tree enroll modal lifecycle handlers:
  - listens to `binary-tree-enroll-member-request`
  - listens to `binary-tree-enroll-mode-changed`
  - placement lock capture from tree anticipation-slot request
  - modal submit flow posts to admin member registration API (`REGISTERED_MEMBERS_API`), then refreshes tree data + feedback links.
- Updated admin enroll module init path to initialize both:
  - `initTreeEnrollModal()`
  - `initTreeSettingsPanel()`
- Updated summary sync to populate newly added total-direct-sponsor metric targets.

### Admin-specific decisions retained

- Enrollment request target remains admin path via existing `REGISTERED_MEMBERS_API` wiring.
- Admin enrollment success copy still reflects admin placement mode (no Fast Track payout credit), preserving admin-side business logic.

### Validation

- `node --check` passed on extracted inline admin script (`/tmp/admin-inline.js`).
- Binary-tree section structure diff (`index.html` vs `admin.html`) reported no differences for the section slice (`page-binary-tree` through `page-my-store`).

## Admin Binary Tree Icon Rendering Fix (2026-04-03)

- Fixed missing icon glyph rendering on newly ported admin tree controls (`face` / `settings`).
- Root cause:
  - `admin.html` did not include the Material Symbols font import used on user-side.
  - base `.material-symbols-outlined` class definition was also missing in admin CSS.
- Changes made:
  - added Google Fonts Material Symbols stylesheet link with required icon names.
  - added `.material-symbols-outlined` base style block (font family + variation settings) to admin stylesheet.
- Affected file:
  - `admin.html`
- Validation:
  - inline script syntax check still passes for `admin.html`.

## Achievement Icon Draft Set (2026-04-03)

### What changed

- Created a dedicated achievement icon asset folder for profile achievement rows:
  - `brand_assets/Icons/Achievements/`
- Added six SVG draft icons for context-based rank visuals:
  - `diamond.svg`
  - `blue-diamond.svg`
  - `black-diamond.svg`
  - `crown.svg`
  - `double-crown.svg`
  - `royal-crown.svg`
- Added icon set notes file:
  - `brand_assets/Icons/Achievements/README.md`

### Design decisions

- Kept a consistent 128x128 badge format across all icons for predictable sizing in left-side achievement list slots.
- Used dark-background framed badges with high-contrast center glyphs (diamond/crown motifs) so icons remain readable on current dark profile UI surfaces.
- Split icon motif by context:
  - diamond variants for diamond-family ranks
  - crown variants for crown-family ranks.

### Known limitations

- This pass started as asset generation only; icon wiring was completed later the same day (see `Profile Achievement Icon Wiring (2026-04-03)` below).
- No PNG exports included yet (SVG-only draft pack for immediate UI integration).

### Files affected

- `brand_assets/Icons/Achievements/README.md`
- `brand_assets/Icons/Achievements/diamond.svg`
- `brand_assets/Icons/Achievements/blue-diamond.svg`
- `brand_assets/Icons/Achievements/black-diamond.svg`
- `brand_assets/Icons/Achievements/crown.svg`
- `brand_assets/Icons/Achievements/double-crown.svg`
- `brand_assets/Icons/Achievements/royal-crown.svg`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

## Profile Achievement Icon Wiring (2026-04-03)

### What changed

- Wired achievement row icons into the profile achievement list UI (left side of title/description block).
- Updated server-side achievement catalog definitions to include icon metadata per achievement.
- Exposed icon path in the authenticated achievement payload so icon selection is server-authoritative.

### Server-side updates

- File: `backend/services/member-achievement.service.js`
- Added `iconPath` to each Good Life achievement definition:
  - Diamond → `/brand_assets/Icons/Achievements/diamond.svg`
  - Blue Diamond → `/brand_assets/Icons/Achievements/blue-diamond.svg`
  - Black Diamond → `/brand_assets/Icons/Achievements/black-diamond.svg`
  - Crown → `/brand_assets/Icons/Achievements/crown.svg`
  - Double Crown → `/brand_assets/Icons/Achievements/double-crown.svg`
  - Royal Crown → `/brand_assets/Icons/Achievements/royal-crown.svg`
- Included `iconPath` in `buildAchievementCatalogForMember()` return objects.

### Frontend updates

- File: `index.html`
- Added `PROFILE_ACHIEVEMENT_ICON_PATH_BY_ID` fallback map for local fallback snapshot consistency.
- Added `iconPath` to the achievement fallback snapshot entries.
- Added `resolveProfileAchievementIconPath()` with strict path validation (`/brand_assets/Icons/Achievements/*.svg`) to avoid unsafe image source values.
- Updated achievement list row markup to render a leading icon container with image, then title/description/status text.

### Design/implementation decisions

- Kept icon source primarily server-driven (`iconPath` from API), with client fallback mapping only as a resilience layer.
- Restricted rendered icon URLs to achievement asset path pattern to avoid arbitrary client-side `img src` injection.
- Preserved existing claim/locked/claimed state behavior and reward + button layout.

### Validation

- `node --check backend/services/member-achievement.service.js` passed.
- Inline script parse check for `index.html` passed (`Parsed 4 inline script block(s) successfully.`).

### Files affected

- `backend/services/member-achievement.service.js`
- `index.html`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

## Achievement Light Icon Set + Theme Swap (2026-04-03)

### What changed

- Created a full light-theme icon variant set for profile achievements.
- Added server-side light icon metadata (`iconLightPath`) for each Good Life achievement.
- Updated profile achievement icon resolver to pick light icons automatically when `appTheme` is `light`.
- Ensured icon swap happens immediately when theme is changed by re-rendering the achievement list in `applyAppTheme()`.

### Asset updates

Added files in `brand_assets/Icons/Achievements/`:
- `diamond-light.svg`
- `blue-diamond-light.svg`
- `black-diamond-light.svg`
- `crown-light.svg`
- `double-crown-light.svg`
- `royal-crown-light.svg`

Updated:
- `brand_assets/Icons/Achievements/README.md` with dark/light usage notes.

### Server-side updates

File: `backend/services/member-achievement.service.js`
- Added `iconLightPath` in each Good Life achievement definition.
- Included `iconLightPath` in achievement objects returned by `buildAchievementCatalogForMember()`.

### Frontend updates

File: `index.html`
- Replaced single-path fallback map with themed icon map (`dark`/`light` per achievement id).
- Added `iconLightPath` values in fallback achievement snapshot entries.
- Updated `resolveProfileAchievementIconPath()` to:
  - detect current app theme (`appTheme`),
  - prefer `iconLightPath` in light theme,
  - fallback safely through mapped/default asset paths,
  - keep strict achievement-asset path validation.
- Updated `applyAppTheme()` to call `renderProfileAchievementList()` so icons swap as soon as theme changes.

### Validation

- `node --check backend/services/member-achievement.service.js` passed.
- Inline script parse check for `index.html` passed (`Parsed 4 inline script block(s) successfully.`).

### Files affected

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

## Update (2026-04-03) - User Sidebar Settings Routed to Dedicated Settings Page

### What changed

- Fixed user-side sidebar `Settings` behavior so it no longer forces navigation to `Binary Tree`.
- Converted bottom sidebar `Settings` link into a routed app nav item:
  - `href="/Settings"`
  - `data-nav-link`
  - `data-page="settings"`
- Added a dedicated user settings page view in `index.html`:
  - `#page-settings` with account summary, theme selector, profile shortcut, and logout action.
- Added routing metadata for the new page:
  - `pageMeta.settings`
  - `pagePathByPage.settings = '/Settings'`
- Added `syncSettingsPageAccountOverview()` to populate settings page account values from the current session.
- Updated theme synchronization so both selectors stay aligned:
  - tree settings theme selector (`#theme-switcher`)
  - settings page theme selector (`#settings-theme-switcher`)
- Removed the old special sidebar settings click handler that opened Binary Tree settings modal directly.

### Design decisions

- Kept Binary Tree’s internal settings modal intact for tree interaction controls (reverse trackpad, zoom strength).
- Routed sidebar Settings to a separate page to match expected IA while preserving existing Binary Tree control surface.
- Reused existing `applyAppTheme()` flow so theme persistence behavior remains unchanged.

### Validation

- Inline script parse check for `index.html` passed (`Parsed 2 inline script block(s) successfully.`).

### Files affected

- `index.html`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

## Rank Advancement Ladder Component (2026-04-03)

### What changed

- File: `index.html`
- Created a dedicated profile component for rank progression:
  - `#profile-rank-ladder-panel`
  - `#profile-rank-ladder-overview`
  - `#profile-rank-ladder-list`
  - `#profile-rank-ladder-feedback`
- Moved rank-advancement presentation out of the achievement tab layout into this new ladder-focused section.
- Kept the existing achievement center focused on `Premiere Life` milestones; rank advancement now has its own rendering surface.

### Rank ladder logic wiring

- Added/finished rank ladder rendering pipeline:
  - `resolveRankAdvancementLadderItems()`
  - `renderProfileRankAdvancementLadder()`
- Ladder now consumes rank achievements (`tabId === 'rank'`) and sorts rungs by cycles and direct-pair requirement.
- Ladder cards now use server requirement/prerequisite payload values when present:
  - direct sponsor pair requirement (`direct-sponsor-pairs`)
  - cycle requirement (`cycles`)
  - activity prerequisite (`active`)
  - verification prerequisite (`system-verification`)
- Requirement copy explicitly preserves left/right pair semantics (e.g., `1:1`, `2:2`) and labels direct sponsors as personal enrollments.

### Claim + feedback behavior

- Added ladder claim button event delegation on `#profile-rank-ladder-list` using `data-profile-rank-ladder-claim-id`.
- Updated `claimProfileAchievementById()` to accept an options channel and route success/error feedback to either:
  - achievement feedback area, or
  - rank ladder feedback area.
- Updated achievement load flow to support both panels and keep feedback clearing/error display in sync.

### Additional UI/selection adjustments

- Added visible-tab guard logic so achievement tab selection cannot drift to hidden tabs.
- Simplified the achievement panel rank status line to rank + activity only; cycle/direct pair progression is now shown in the ladder component.

### Validation

- `node --check backend/services/member-achievement.service.js` passed.
- Inline script parse check for `index.html` passed (`index-inline-script:ok`).
- Captured two localhost QA screenshots:
  - `temporary screenshots/screenshot-1-ladder-pass1.png`
  - `temporary screenshots/screenshot-1-ladder-pass2.png`
  Note: these captures landed on the auth-gated login screen, so ladder visuals were not directly captured in this pass.

### Files affected

- `index.html`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

## Rank Advancement Carousel Update (2026-04-03)

### What changed

- File: `index.html`
- Replaced the Rank Advancement `Success Ladder` list/timeline layout with a carousel layout.
- Added carousel state tracking with `profileRankLadderSlideIndex`.
- Updated `renderProfileRankAdvancementLadder()` to render one milestone card per slide inside a horizontal track.
- Added in-component carousel controls:
  - Previous / Next buttons
  - dot indicators (jump to slide)
  - current step counter (`Step X of Y`)
- Kept claim behavior per slide using existing claim API flow and ladder feedback channel.

### Interaction wiring

- Updated rank ladder event delegation to support:
  - `data-profile-rank-ladder-nav="prev|next"`
  - `data-profile-rank-ladder-go-index`
  - existing `data-profile-rank-ladder-claim-id`
- Navigation is clamped between first and last milestone and remains stable across re-renders.

### Validation

- `node --check backend/services/member-achievement.service.js` passed.
- Inline script parse check for `index.html` passed (`index-inline-script:ok`).

### Files affected

- `index.html`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

## Rank Advancement Carousel Redesign (2026-04-03)

### What changed

- File: `index.html`
- Redesigned the Rank Advancement component into a richer carousel UI while preserving existing business logic and claim actions.
- Updated section shell styling for stronger visual hierarchy:
  - layered gradient glow background
  - updated heading to `Success Ladder Carousel`
  - clearer status summary copy.

### Carousel slide redesign

- Reworked each slide into a structured milestone card with:
  - milestone badge (`Milestone X of Y`)
  - status chip (`Locked`, `Ready to Claim`, `Claimed`)
  - rank icon + milestone title
  - direct sponsor and cycle progress copy
  - progress bars for Left direct, Right direct, and cycles
  - dedicated right-side `Claim Panel` with payout value and checklist rows.
- Navigation redesign:
  - circular previous/next controls
  - numbered pill indicators for direct milestone jumping
  - centered step counter (`Step X of Y`).

### Reliability fix included

- Added rank-carousel data fallback in `resolveRankAdvancementLadderItems()`:
  - if server payload has no rank achievements, it now falls back to `buildProfileAchievementFallbackSnapshot()` rank milestones.
- Result: carousel UI still renders for accounts where rank-track payload is currently missing.

### Validation and QA

- `node --check backend/services/member-achievement.service.js` passed.
- Inline script parse check for `index.html` passed (`index-inline-script:ok`).
- Authenticated visual QA screenshots captured on profile page (login + route to profile automated via Puppeteer):
  - `temporary screenshots/screenshot-4-profile-redesign-pass5.png`
  - `temporary screenshots/screenshot-5-profile-redesign-pass6.png`

### Files affected

- `index.html`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

## Icon Size Increase (2026-04-03)

### What changed

- File: `index.html`
- Enlarged achievement icon containers for better visual prominence:
  - Rank carousel milestone icon increased from `h-12 w-12` to `h-16 w-16` with larger padding and radius.
  - Profile achievement list icon increased from `h-11 w-11` to `h-12 w-12` with updated padding/radius.

### Validation

- `node --check backend/services/member-achievement.service.js` passed.
- Inline script parse check for `index.html` passed (`index-inline-script:ok`).
- Authenticated visual QA run completed with two screenshot passes on Profile page.

### Files affected

- `index.html`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

## Monthly Rank Claim Rules + Highest-Only Enforcement (2026-04-03)

### What changed

- Files: `backend/stores/member-achievement.store.js`, `backend/services/member-achievement.service.js`, `index.html`
- Converted Rank Advancement behavior from lifetime milestone claims to monthly claim windows.
- Implemented monthly claim period handling for rank rewards (`YYYY-MM`) and kept lifetime claim period for non-rank achievements (`lifetime`).

### Backend claim model updates

- Added `claim_period` support to achievement claims storage and app mapping.
- Added idempotent schema migration logic:
  - backfills `claim_period` for existing rows (rank rows -> claim month, others -> `lifetime`)
  - replaces old unique constraint `(user_id, achievement_id)` with `(user_id, achievement_id, claim_period)`
  - adds rank-month unique index so each user can only claim one rank reward per month.

### Business rules implemented

- Rank rewards now reset by month (new month = new claim period).
- Claiming rank rewards now enforces:
  - only one rank reward claim per month
  - only highest currently eligible rank can be claimed
  - lower ranks are blocked when a higher eligible rank exists
  - lower ranks are blocked once a monthly rank reward is already claimed.
- Non-rank achievements remain one-time claim behavior.

### Payload/UI support updates

- Achievement catalog now includes monthly rank context fields:
  - `rankClaimPeriod`
  - `rankClaimPeriodLabel`
  - `rankClaimedAchievementId`
  - `rankClaimedAchievementTitle`
- Rank lock reasons updated to monthly-run wording (e.g., cycle/direct sponsor checks reference this month).
- Profile rank carousel copy updated to monthly-run messaging and highest-only claim rule guidance.

### Validation / QA

- `node --check backend/stores/member-achievement.store.js` passed.
- `node --check backend/services/member-achievement.service.js` passed.
- Inline script parse check for `index.html` passed (`index-inline-script:ok`).
- Authenticated profile screenshot QA completed (2 passes) confirming monthly wording in rank carousel.

### Files affected

- `backend/stores/member-achievement.store.js`
- `backend/services/member-achievement.service.js`
- `index.html`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

## Rank Carousel Position + Name-Based Indicators (2026-04-03)

### What changed

- File: `index.html`
- Moved the `Success Ladder Carousel` component to render **before** the `Profile Achievements` component on the profile page.
- Replaced number-based rank indicator presentation (`1..9`) with rank-name-based labels in the carousel UI:
  - top target badge now uses rank name
  - center navigation chips now display rank names (`Ruby`, `Emerald`, etc.) instead of numbers
  - bottom helper line now shows `Viewing: <Rank Name>` instead of `Step X of Y`.

### Validation / QA

- `node --check backend/stores/member-achievement.store.js` passed.
- `node --check backend/services/member-achievement.service.js` passed.
- Inline script parse check for `index.html` passed (`index-inline-script:ok`).
- Authenticated profile screenshot QA completed (2 passes) confirming new component order and name-based rank indicators.

### Files affected

- `index.html`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

## Rank Carousel Markup Simplification (2026-04-03)

### What changed

- File: `index.html`
- Reduced container/wrapper nesting in the Profile Rank carousel component to make the structure cleaner and easier to maintain.
- Removed extra decorative wrapper layers and flattened slide structure while preserving:
  - carousel navigation behavior (prev/next + direct jump chips)
  - claim panel behavior and claim-state UI
  - progress bars and requirement checklist
  - mobile-friendly text handling added in prior update.

### Design decisions

- Kept semantic structure by using `section`, `header`, `article`, `aside`, and list (`ul/li`) elements where appropriate.
- Consolidated nested blocks without changing data bindings, status logic, or event selector attributes.

### Known limitations

- This refactor focuses on markup simplification only; no ranking business-rule changes were made.

### Validation / QA

- Inline script parse check for `index.html` passed (`index-inline-script:ok`).

### Files affected

- `index.html`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

## Rank Panel Header Copy + Caption Styling (2026-04-03)

### What changed

- File: `index.html`
- Updated profile rank panel heading text from `Success Ladder Carousel` to `Rank Advancement Bonus`.
- Changed the small header tag styling from uppercase/tag-like treatment to a simple caption style.

### Design decisions

- Kept the same information hierarchy while reducing visual noise in the header line.

### Known limitations

- Header/caption copy update only; no rank logic or interaction behavior was changed.

### Validation / QA

- Inline script parse check for `index.html` passed (`index-inline-script:ok`).

### Files affected

- `index.html`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

## Rank Advancement Bonus Component Recovery (2026-04-03)

### What changed

- File: `index.html`
- Rebuilt the Profile `Rank Advancement Bonus` component after an accidental overwrite with Good Life monthly progression content.
- Restored rank-carousel rendering to use rank achievements data (`profileAchievementsSnapshot`) and rank requirement progress (direct left/right + cycles), including monthly highest-eligible claim behavior messaging.
- Restored rank claim button selector wiring (`data-profile-rank-ladder-claim-id`) so rank claim actions route through the standard achievement claim endpoint again.
- Restored panel header copy:
  - caption: `Rank Advancement`
  - title: `Rank Advancement Bonus`

### Design decisions

- Kept the rank component isolated within `profile-rank-ladder-*` ids and rendering function (`renderProfileRankAdvancementLadder`) to avoid impacting the New Good Life area.
- Preserved mobile-friendly carousel chips and condensed progress labels from prior responsive work.

### Known limitations

- Legacy Good Life monthly helper functions/constants remain in code but are not used by the restored Rank Advancement Bonus renderer.

### Validation / QA

- Inline script parse check for `index.html` passed (`index-inline-script:ok`).

### Files affected

- `index.html`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

## Standalone Good Life Monthly Progression (2026-04-03)

### What changed

- File: `index.html`
- Kept `Rank Advancement Bonus` intact and added/rewired a separate `Good Life Monthly Progression` section to run independently above Achievements.
- Decoupled Good Life runtime from rank-ladder rendering/feedback:
  - `loadProfileGoodLifeMonthly()` now reads/writes only `profile-good-life-*` UI targets.
  - `claimProfileGoodLifeMonthlyReward()` now uses Good Life-specific feedback and rerender flow.
  - Added delegated claim click binding for `[data-profile-good-life-claim]` on `#profile-good-life-content`.
- Updated profile init flow to hydrate Good Life separately:
  - seed fallback snapshot,
  - initial render,
  - silent server fetch for monthly snapshot.
- Added rank-change refresh hook so Good Life monthly snapshot reloads when the member rank changes.
- Added theme refresh hook so Good Life icon paths switch correctly between dark/light variants.

- Files: `backend/app.js`, `backend/routes/member-good-life.routes.js`, `backend/controllers/member-good-life.controller.js`, `backend/services/member-good-life.service.js`, `backend/stores/member-good-life.store.js`
- Maintained server-side monthly Good Life progression module:
  - authenticated endpoints for monthly status + monthly claim,
  - database-backed monthly highest-rank tracking and one-claim-per-month enforcement,
  - milestone payload with claimable highest-rank-only behavior.

### Design decisions

- Preserved `Rank Advancement Bonus` event selectors/renderer (`profile-rank-ladder-*`) so existing rank logic is not affected.
- Kept Good Life outside the achievement tab/category data model to align with the monthly progression requirement.
- Reused achievement icon resolver to support dark/light icon variants without duplicating icon logic.

### Known limitations

- Automated screenshot verification via `screenshot.mjs` currently lands on the login view, so an authenticated profile-page visual diff for the Good Life section could not be captured in this pass.

### Validation / QA

- `node --check backend/app.js` passed.
- `node --check backend/controllers/member-good-life.controller.js` passed.
- `node --check backend/routes/member-good-life.routes.js` passed.
- `node --check backend/services/member-good-life.service.js` passed.
- `node --check backend/stores/member-good-life.store.js` passed.
- `node --check backend/services/member-achievement.service.js` passed.
- `node --check backend/stores/member-achievement.store.js` passed.
- `index.html` inline script parse check passed (`Inline scripts parse OK: 4`).
- Screenshot passes executed:
  - `temporary screenshots/screenshot-1-good-life-round1.png`
  - `temporary screenshots/screenshot-2-good-life-round2.png`

### Files affected

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

## Achievement Component - Premiere Life Restore (2026-04-03)

### What changed

- File: `index.html`
- Updated the Achievement panel to remove rank from the visible achievement tab flow:
  - restored tab button to `Premiere Life` (`data-profile-achievement-tab="premiere-life"`)
  - default active category label set to `Premiere Journey`
  - status text changed from rank-centric copy to enrolled-member progress copy.
- Added client fallback achievement for Premiere Journey:
  - `Enroll a Member`
  - reward label `Merch`
  - payout note `Claim merch`
  - claim unlock requirement based on enrolled member count.
- Added reward label support in achievement card rendering:
  - if `rewardLabel` exists, display label (e.g. `Merch`) instead of currency.
  - claim button now reads `Claim merch` for this achievement when eligible.
- Added direct-total enrollment progress support in rendering (`direct-sponsors-total`) so card can show `Enrolled Members: X / Y`.

- File: `backend/services/member-achievement.service.js`
- Restored achievement catalog to Premiere Life for the Achievement component while preserving rank achievement data for the separate Rank Advancement Bonus component:
  - tabs now return `Premiere Life`
  - categories now return `Premiere Journey`
  - added `premiere-journey-enroll-member` achievement (server-side)
- Added server-side eligibility support for total direct sponsor requirements:
  - new field: `requiredDirectSponsorsTotal`
  - requirement evaluation now supports total personal enrollments (`>= 1` for this achievement)
  - lock reason and requirement payload updated accordingly.
- Added `rewardLabel` and `requiredDirectSponsorsTotal` to returned achievement payload.

### Design decisions

- Kept rank achievements in the backend achievement list for compatibility with the standalone `Rank Advancement Bonus` component, while removing rank from the visible Achievement tab/category UI.
- Implemented `Enroll a Member` as a server-validated requirement (not client-only), using direct sponsor counts already resolved from registered members data.

### Known limitations

- `member_achievement_claims` persists numeric `reward_amount`; merch label is a catalog/render label and not a separate DB reward-type field yet.

### Validation / QA

- `node --check backend/services/member-achievement.service.js` passed.
- `index.html` inline script parse check passed (`Inline scripts parse OK: 2`).

### Files affected

- `index.html`
- `backend/services/member-achievement.service.js`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

## Rank Achievement Icon Expansion - Ruby to Sapphire (2026-04-03)

### What changed

- Added six new rank achievement SVG assets in `brand_assets/Icons/Achievements/`:
  - `ruby.svg`
  - `ruby-light.svg`
  - `emerald.svg`
  - `emerald-light.svg`
  - `sapphire.svg`
  - `sapphire-light.svg`
- Updated rank achievement icon mappings so Ruby/Emerald/Sapphire no longer reuse Diamond art.
- Wired the new icon paths in both server payload and client fallback data:
  - `backend/services/member-achievement.service.js`
  - `index.html`
- Updated icon pack documentation list:
  - `brand_assets/Icons/Achievements/README.md`

### Design decisions

- Kept the existing icon visual system (rounded tile + center gem + facet highlights) to match the current Achievement icon set.
- Added both dark and light variants for each rank so theme-based icon switching continues to work without extra logic changes.
- Left Diamond and above icons untouched to avoid regressions in existing mapped ranks.

### Known limitations

- New Ruby/Emerald/Sapphire icons were introduced as first-pass originals; final art polish can be refined later if brand-specific vector references are provided.

### Validation / QA

- `node --check backend/services/member-achievement.service.js` passed.
- `index.html` inline script parse check passed (`Inline scripts parse OK: 2`).

### Files affected

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

## Achievement Icon Sharpness Pass - Ruby/Emerald/Sapphire (2026-04-03)

### What changed

- Refined six rank icon SVGs to reduce perceived blur/jagged edges at small render sizes:
  - `ruby.svg`, `ruby-light.svg`
  - `emerald.svg`, `emerald-light.svg`
  - `sapphire.svg`, `sapphire-light.svg`
- Rebuilt these icons with cleaner geometry and less micro-detail:
  - removed soft halo circles and tiny sparkle paths,
  - removed thin `1.5px` line accents,
  - increased edge definition with thicker primary strokes,
  - added `shape-rendering="geometricPrecision"` and `vector-effect="non-scaling-stroke"` on key stroked shapes.
- Added a shared achievement icon rendering helper class in `index.html`:
  - `.achievement-icon-image`
  - used for rank ladder, Good Life featured icon, Good Life milestone icons, and achievement list icons.

### Design decisions

- Prioritized legibility at the smallest in-app icon slots over extra decorative facets.
- Kept color identity and rank differentiation intact while simplifying edges for cleaner rasterization in browser rendering.
- Scoped this pass to Ruby/Emerald/Sapphire to immediately fix the newly added lower-rank icons without altering Diamond/Crown assets yet.

### Known limitations

- Older Diamond/Crown family icons still use the previous detailed style and may still appear softer in very small icon slots compared with the new Ruby/Emerald/Sapphire set.

### Validation / QA

- `node --check backend/services/member-achievement.service.js` passed.
- `index.html` inline script parse check passed (`Inline scripts parse OK: 2`).

### Files affected

- `brand_assets/Icons/Achievements/ruby.svg`
- `brand_assets/Icons/Achievements/ruby-light.svg`
- `brand_assets/Icons/Achievements/emerald.svg`
- `brand_assets/Icons/Achievements/emerald-light.svg`
- `brand_assets/Icons/Achievements/sapphire.svg`
- `brand_assets/Icons/Achievements/sapphire-light.svg`
- `index.html`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

## Icon Sharpness Pass Rollback (2026-04-03)

### What changed

- Reverted Ruby/Emerald/Sapphire icon artwork (dark + light variants) back to the prior visual style after design feedback.
- Restored previous detailed gem treatment (halo/sparkle/facet detail) for:
  - `ruby.svg`, `ruby-light.svg`
  - `emerald.svg`, `emerald-light.svg`
  - `sapphire.svg`, `sapphire-light.svg`
- Left icon mapping paths and rendering hooks in place so no behavior/regression risk was introduced.

### Design decisions

- Prioritized preserving the earlier visual language you preferred over the sharper simplified style.

### Known limitations

- The previous detailed style can still appear softer at smaller icon sizes in some browser/device combinations.

### Validation / QA

- `index.html` inline script parse check passed (`Inline scripts parse OK: 2`).

### Files affected

- `brand_assets/Icons/Achievements/ruby.svg`
- `brand_assets/Icons/Achievements/ruby-light.svg`
- `brand_assets/Icons/Achievements/emerald.svg`
- `brand_assets/Icons/Achievements/emerald-light.svg`
- `brand_assets/Icons/Achievements/sapphire.svg`
- `brand_assets/Icons/Achievements/sapphire-light.svg`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

## Profile Text Cleanup - Rank/Good Life/Achievements (2026-04-03)

### What changed

- Cleaned profile-page achievement text output by removing checkbox marker symbols (`[x]` / `[ ]`) from displayed requirement and prerequisite copy.
- Removed the visible `System Verified` checklist row from the `Rank Advancement Bonus` claim panel.
- Removed `Verified by system` from fallback prerequisite rendering and added a guard filter so system-verification prerequisite labels are not shown in the UI.
- Kept requirement/prerequisite status color styling and layout intact; only text content was simplified.

### Design decisions

- Prioritized cleaner, less noisy text in the three requested profile areas without changing claim logic, reward amounts, or progression calculations.
- Scoped the change to presentation text only so existing achievement eligibility behavior remains stable.

### Known limitations

- Requirement/prerequisite summaries now present plain labels (no explicit checkbox glyphs), so completion state is conveyed primarily through existing color treatment.

### Validation / QA

- `index.html` inline script parse check passed (`Inline scripts parse OK: 2`).

### Files affected

- `index.html`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

## Achievement Placeholder Icon Added + Diamond Replaced for Premiere Journey (2026-04-03)

### What changed

- Added new placeholder achievement icons:
  - `brand_assets/Icons/Achievements/placeholder.svg`
  - `brand_assets/Icons/Achievements/placeholder-light.svg`
- Replaced the `premiere-journey-enroll-member` achievement icon from Diamond to Placeholder across payload + frontend fallback:
  - `backend/services/member-achievement.service.js`
  - `index.html`
- Updated icon pack README listing to include placeholder assets.

### Design decisions

- Scoped replacement only to the Premiere Journey achievement item (`Enroll a Member`) so rank-specific Diamond milestones remain unchanged.
- Added both dark and light variants so theme switching keeps parity with existing icon behavior.

### Known limitations

- Global fallback for unknown achievement ids still resolves to Diamond; this change only remaps the Premiere Journey achievement explicitly.

### Validation / QA

- `node --check backend/services/member-achievement.service.js` passed.
- `index.html` inline script parse check passed (`Inline scripts parse OK: 2`).

### Files affected

- `brand_assets/Icons/Achievements/placeholder.svg`
- `brand_assets/Icons/Achievements/placeholder-light.svg`
- `brand_assets/Icons/Achievements/README.md`
- `backend/services/member-achievement.service.js`
- `index.html`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

## Good Life Panel Copy Cleanup (2026-04-03)

### What changed

- Removed the phrase `Battlepass-style monthly progression.` from the Good Life profile panel subtitle copy.
- Kept the remaining explanatory sentence intact: `The highest rank you reach this month becomes your only claimable reward.`

### Design decisions

- Applied a minimal copy-only edit to match requested wording without changing layout or behavior.

### Known limitations

- None introduced (text-only change).

### Validation / QA

- Not run (text-only single-line copy update).

### Files affected

- `index.html`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`
