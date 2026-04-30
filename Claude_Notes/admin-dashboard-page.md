# Admin Dashboard Page

## Update Log

### 2026-04-28 - Admin Ledger Explorer (Global Audit + Manual Adjustments + Reversal Actions)

| Area | Change |
|---|---|
| Ledger Explorer UI | Added a dedicated ledger explorer block inside `admin.html` Commissions page with summary cards, count pill, filters, table, and metadata drill-down. |
| Filtering | Added user search + text search + type/status/source/date filters wired to `/api/admin/ledger` and `/api/admin/ledger/summary`. |
| Manual Financial Action | Added manual ledger adjustment form wired to `POST /api/admin/ledger/adjustments` (credit/debit + amount + optional BV + description). |
| Reversal Flow | Added per-row reverse action wired to `POST /api/admin/ledger/:entryId/reverse` with audit reason prompt. |
| Routing Integration | Added Commissions-page lifecycle refresh hook so admin ledger reloads when navigating into `Commissions`. |

#### Files Updated This Pass
- `admin.html`
- `backend/routes/ledger.routes.js`
- `backend/controllers/ledger.controller.js`
- `backend/services/ledger.service.js`
- `Claude_Notes/admin-dashboard-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

#### Notes
- Existing payout-request fulfillment UI remains intact and now co-exists with the dedicated ledger explorer.
- Reversal actions are designed for immutable-ledger behavior (new reversing entries instead of overwriting original amounts).

### 2026-04-17 - Admin Dashboard Modernization to User-Dashboard Theme System

| Area | Change |
|---|---|
| Theme Model | Migrated admin Tailwind token sources from fixed hex palette to CSS-variable tokens (same pattern used by `index.html`). |
| Color Modes | Enabled `light dark` color-scheme metadata and set `data-theme="light"` at document root for parity with user dashboard defaults. |
| Surface/Brand Tokens | Added full root token map for brand, surfaces, text, semantic colors, shadows, overlay gradients, minimap styling, and scrollbar tokens. |
| Light Theme Overrides | Added `html[data-theme='light']` variable overrides to mirror modern user-dashboard visual language. |
| Shell Layout | Updated top bar and content spacing to align with current user dashboard shell rhythm (`h-[65px]`, updated paddings). |
| Dashboard Cards | Updated first-row dashboard card containers to modern card primitives (rounded-2xl, elevated depth, consistent min height and surface layering). |

## Files Affected
- `admin.html`

## Design Decisions
- Preserved all existing admin data IDs and behavior hooks to avoid breaking existing dashboard logic and settings workflows.
- Focused this pass on structural/theme parity first, then visual-card modernization for critical dashboard KPI row.
- Kept admin-specific content (placement controls, server cut-off, admin-only payout messaging) intact.

## Known Limitations
- Puppeteer screenshot validation could not run in-session due sandbox launch restrictions (`spawn EPERM`) and escalated screenshot permission was not granted.
- Additional deeper dashboard-module parity (full skeleton/live-content architecture transplant from user dashboard) can be done in a follow-up pass if requested.

### 2026-04-17 - Sidebar Refresh + Card Stability Fix

| Area | Change |
|---|---|
| Sidebar Structure | Rebuilt admin sidebar into the updated grouped format (`General`, `Build`, `Records`) with modern spacing and icon alignment. |
| Branding Block | Replaced legacy emblem-only header with brand logo + `Admin Console` descriptor for parity with updated nav presentation. |
| Nav Coverage | Preserved admin routes and `data-nav-link` wiring for Dashboard, My Store, Commissions, Commission Order, Binary Tree, Enroll Member, Preferred Customers, and Settings. |
| Icon System | Updated Material Symbols import to full icon set (removed restrictive `icon_names` subset) so new sidebar icons render correctly. |
| Card Repair | Reverted first-row KPI card containers to stable legacy card wrappers after the prior styling pass caused visual breakage. |

#### Files Updated This Fix
- `admin.html`

#### Notes
- Sidebar update intentionally kept existing JS toggle/routing IDs unchanged (`#sidebar`, `#menu-toggle`, `[data-nav-link]`, `#page-title`) to avoid regressions.
- Full visual screenshot validation remains pending due Puppeteer sandbox restrictions in-session.

### 2026-04-17 - Sidebar Brand Parity + Commissions Nav Simplification

| Area | Change |
|---|---|
| Sidebar Branding | Replaced the admin sidebar top block with the same brand-logo shell pattern used in the user dashboard sidebar (`sidebar-brand-button`, dual light/dark logo assets, chevron, dropdown shell). |
| Sidebar Controls | Added admin wiring for brand dropdown open/close behavior and desktop collapse/re-open behavior (`data-sidebar-collapsed`). |
| Commissions Navigation | Removed the standalone `Commission Order` sidebar link so only `Commissions` is used in admin navigation. |
| Copy Consistency | Updated key admin UI labels from `Commission Order` wording to `Commissions` where user-facing page headers/context text needed alignment. |

#### Files Updated This Pass
- `admin.html`

#### Notes
- Commission detail view structure remains in place for order-level fulfillment flow, but entry navigation is now centered on `Commissions` only.
- Brand dropdown profile values now hydrate from current admin session (`name`/`email` fallbacks included).

### 2026-04-17 - Sidebar Logo Exact Parity Adjustment

| Area | Change |
|---|---|
| Logo Sizing | Updated admin sidebar logo shell and logo image dimensions to exactly match `index.html` (`max-width: 7.6rem`, `min-height: 1.9rem`, logo `max-height: 1.92rem`). |
| Logo Rendering | Added matching `transform: translateY(0)` and shell display behavior from user sidebar. |
| Top Brand Menu | Aligned top brand dropdown item structure/text to user sidebar baseline (`Profile`, `Home`, `My Store`, `Settings`, `Log out`). |

#### Files Updated This Pass
- `admin.html`

### 2026-04-17 - Removed Legacy Binary Tree Nav Entry

| Area | Change |
|---|---|
| Build Navigation | Removed the `Binary Tree (Old)` link from the admin sidebar Build group. |
| Next-Gen Path | Kept `Binary Tree (Next Gen)` as the only Binary Tree navigation entry in admin sidebar. |

#### Files Updated This Pass
- `admin.html`

#### Notes
- Legacy route mappings were not removed; this pass only updates what appears in the sidebar nav.

### 2026-04-17 - Legacy Binary Tree Route Retirement + Official Naming

| Area | Change |
|---|---|
| Build Navigation | Renamed sidebar label from `Binary Tree (Next Gen)` to `Binary Tree`. |
| Legacy Route Access | Removed legacy `/admin/BinaryTree` page mapping from admin dashboard router state map. |
| Route Guard | Added explicit legacy route fallback guard (`/admin/binarytree`, `/admin/binary-tree`, `/binarytree`, `/binary-tree`) to force dashboard instead of loading legacy tree view state. |

#### Files Updated This Pass
- `admin.html`

#### Notes
- Legacy admin binary tree panel markup remains in file, but route/nav access is now retired from admin dashboard routing and sidebar navigation.

## Update (2026-04-27) - Admin Cutoff Card + Force Cutoff Rule Alignment

### What Changed

- `admin.html`
  - updated admin cycle constants to `1000/1000`.
  - aligned admin cutoff-card estimated cycle formula with weak/high and strong/low threshold division.
- `backend/services/admin.service.js`
  - force-cutoff now settles cycles from current-week leg volumes.
  - removed personal BV baseline rewrites from force-cutoff execution.

### Validation

- inline script parse check passed for `admin.html`.
- `node --check backend/services/admin.service.js` passed.

## Update (2026-04-27) - My Store Package Earnings UI Rule Alignment

### Changes
- Product Management > Package Earnings now supports:
  - Preferred Personal (Retail + BV)
  - Preferred Business (Retail + BV)
  - Preferred Infinity (Retail + BV)
  - Preferred Legacy (Retail + BV)
  - Paid Member (BV only)
- Paid Member retail commission input removed by design.

### Behavior
- Form save enforces `paid-member-pack.retailCommission = 0`.
- Preferred tiers persist as separate package-key earnings entries.

## Patch Update (2026-04-30) - Admin Binary Tree Reservation BV Guard

### Summary
- Added reservation-package guard for admin binary tree volume resolvers.
- `membership-placement-reservation` nodes now contribute `0 BV` in both current and lifetime volume calculations.

### Files Updated
- `admin.html`

### Validation
- Inline script parse check passed (`INLINE_SCRIPT_PARSE_OK admin.html blocks=2`).

## Patch Update (2026-04-30) - Flush All Data Scope Alignment (Users + User Data Only)

### Summary
- Updated admin flush behavior to clear users/members and their related records comprehensively while preserving products and admin/global configuration data.

### Admin UI Changes
- Updated Danger Zone copy and confirmation dialog text in `admin.html` to reflect:
  - preserved: admin account, runtime settings, title catalog, store products.
  - cleared: users/members and linked sessions/tokens/invoices/payouts/metrics/attribution/notifications/wallet/ledger/business-center/auto-ship/webhook history.
- Updated flush result summary mappings to include new backend clear counters (badge selection, auto-ship, ledger, business-center, webhook).

### Backend Flush Mapping Updates
- `backend/services/admin.service.js`
  - added truncation targets:
    - `member_profile_badge_selection`
    - `user_auto_ship_settings`
    - `user_auto_ship_events`
    - `ledger_entries`
    - `wallet_ledger_entries`
    - `business_center_owner_progress`
    - `business_center_activation_audit`
    - `business_center_cycle_states`
    - `business_center_commission_events`
    - `stripe_webhook_events`
  - removed truncation/reset behavior for:
    - `member_title_catalog`
    - `runtime_settings`

### Validation
- `node --check backend/services/admin.service.js` passed.
- Backend tests passed:
  - `backend/tests/binary-cycle-cutoff.test.js`
  - `backend/tests/ledger.service.test.js`
  - `backend/tests/leadership-matching.service.test.js`
  - `backend/tests/member-business-center.service.test.js`
