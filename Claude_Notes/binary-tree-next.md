# Binary Tree Next Notes

## Update (2026-04-14) - Legacy/Founder Badge Color Pass + Icon Shadow Placement

### What Changed

- Updated top hero badge circle colors:
  - legacy rank circle now uses dark teal/navy gradient tones
  - title-1 / legacy-founder circle now uses dark amber/gold gradient tones.
- Kept gradient generation on shared formula path through account-overview palette resolver.
- Added icon-only drop shadow back to badge icons (not circle containers).
- Added matching CSS fallback gradients for first paint.

### Files Affected

- `binary-tree-next-app.mjs`
- `binary-tree-next.html`

## Update (2026-04-14) - Hero Glow Removal Pass

### What Changed

- Removed remaining hero glow/shadow styling in `binary-tree-next.html`:
  - badge circle box-shadows removed
  - avatar box-shadow removed
  - status-dot shadow removed
  - icon filter explicitly set to `none !important`.
- Updated runtime hero visuals in `binary-tree-next-app.mjs`:
  - removed sheen overlay from `resolveAccountOverviewGradientBackground(...)`
  - set runtime badge `boxShadow` assignments to `none`.

### Files Affected

- `binary-tree-next.html`
- `binary-tree-next-app.mjs`

## Update (2026-04-14) - Hero Alignment and Icon Shadow Pass

### What Changed

- Center-anchored the top hero section group in `binary-tree-next.html`:
  - rank badge, profile avatar block, and title badge now align around the panel center with a bounded hero width.
- Removed icon-only drop shadow in badge icons:
  - `tree-next-account-overview-badge-icon img { filter: none; }`
- Kept circle container styling intact.
- Follow-up cleanup:
  - removed duplicate `justify-items` line in hero mobile media styles.

### Files Affected

- `binary-tree-next.html`

## Update (2026-04-14) - Direct Sponsors KPI Card Added

### What Changed

- Added `Direct Sponsors` card into Sales and Business Volumes layout in `binary-tree-next.html`.
- Section order now:
  1. Account Active Until
  2. Total Organization Personal BV
  3. Personal BV
  4. Weekly Cycle Cap (`1 / 1,000`)
  5. Direct Sponsors
  6. E-Wallet
- Added live KPI wiring in `binary-tree-next-app.mjs`:
  - `accountOverviewDirectSponsorsValueElement`
  - `resolveAccountOverviewDirectSponsorCount(...)`
  - value sync in `syncAccountOverviewPanelVisuals()`.

### Files Affected

- `binary-tree-next.html`
- `binary-tree-next-app.mjs`

## Update (2026-04-14) - Sales and Business Volumes Order Adjusted

### What Changed

- Reordered Sales and Business Volumes cards in `binary-tree-next.html` to:
  1. Account Active Until
  2. Total Organization Personal BV
  3. Personal BV
  4. Weekly Cycle Cap
  5. E-Wallet
- Updated Weekly Cycle Cap card text split to show:
  - value: `1 / 1,000`
  - label: `Weekly Cycle Cap`.

### Files Affected

- `binary-tree-next.html`

## Update (2026-04-14) - Card Borders Removed

### What Changed

- Removed card outlines from Account Overview cards in `binary-tree-next.html`:
  - volume cards: border removed
  - commission cards: border removed
- Removed commission hover border override to preserve same borderless style.

### Files Affected

- `binary-tree-next.html`

## Update (2026-04-14) - Card Radius Reduced to 18px

### What Changed

- Reduced Account Overview card corner radius in `binary-tree-next.html`:
  - volume cards: `18px`
  - commission cards: `18px`

### Files Affected

- `binary-tree-next.html`

## Update (2026-04-14) - Track Commissions Card Typography and Geometry Match

### What Changed

- Updated Track Commissions cards in `binary-tree-next.html` so they visually match Sales and Business Volumes cards:
  - same card height, internal spacing, and padding profile
  - same label sizing/profile.
- Reduced boldness:
  - KPI values now semibold instead of extra-bold.

### Files Affected

- `binary-tree-next.html`

## Update (2026-04-14) - Account Overview Card Tokens and 5-Card Volume Layout

### What Changed

- Updated Account Overview card style tokens in `binary-tree-next.html`:
  - card background: `#F2F2F6`
  - card radius: `24px` (slightly less curved than outer panel shell).
- Removed the Sales Team Commission tile from `Sales and Business Volumes`.
- Section now reflects requested 5-card set:
  - Account Active Until
  - Total Organization Personal BV
  - Personal BV
  - Weekly Cycle Cap
  - E-Wallet
- Updated default cycle label text to `Weekly Cycle Cap | 1 / 1,000`.

### Files Affected

- `binary-tree-next.html`

## Update (2026-04-14) - Account Overview Panel Style Optimization + Node Gradient Alignment

### Scope

- Account Overview panel shell styling and hero-circle visual system alignment.

### What Changed

- Updated panel shell geometry in `binary-tree-next.html` to match BT-Next panel language while preserving white container background:
  - outer radius `36px`
  - shell border tone aligned to `SHELL_PANEL` palette family
  - refined spacing and section rhythm.
- Updated tile and commission card geometry to rounded-card style (`28px`) to better match existing left-panel card language.
- Added badge wrapper IDs:
  - `tree-next-account-overview-rank-badge`
  - `tree-next-account-overview-title-badge`
- Added visual-sync layer in `binary-tree-next-app.mjs`:
  - `resolveAccountOverviewBadgePalette(...)`
  - `resolveAccountOverviewGradientBackground(...)`
  - `syncAccountOverviewPanelVisuals()`
- Hero circles now use node-style palette gradients (same formula family as node avatars) instead of static custom gradients.
- Hero identity fields now sync from session/home node context (name, handle, joined label, rank/title labels/icons, activity dot).

### Files Affected

- `binary-tree-next.html`
- `binary-tree-next-app.mjs`

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-14) - My Store Image Swapped to Transparent NOBG Asset

### Scope

- Replace My Store featured/upgrade bottle imagery with the new transparent `MetaCharge Blue Bottle - NOBG` image.

### What Changed

- Updated featured product image source constant:
  - `MY_STORE_FEATURED_PRODUCT.imageUrl` -> `/brand_assets/Product%20Images/MetaCharge%20Blue%20Bottle%20-%20NOBG.png`
- Updated My Store panel HTML fallback image `src` to the same transparent PNG.
- Upgrade cards automatically inherit this image because they render from `MY_STORE_FEATURED_PRODUCT.imageUrl`.

### Files Affected

- `binary-tree-next-app.mjs`
- `binary-tree-next.html`

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-14) - Account Overview Real-Time Refresh Alignment

### Scope

- Ensure Account Overview panel updates live without requiring page reload.

### What Changed

- Replaced static Account Overview polling cadence with Binary Tree Next live cadence:
  - visible: `TREE_NEXT_LIVE_SYNC_VISIBLE_INTERVAL_MS`
  - hidden: `TREE_NEXT_LIVE_SYNC_HIDDEN_INTERVAL_MS`
  - retry: `2800ms`
- Added `resolveAccountOverviewRemoteSyncIntervalMs(...)` to compute refresh interval from UI state.
- Updated `applyTreeNextLiveNodes(...)` to trigger `maybeRefreshAccountOverviewRemoteSnapshot(...)` after live node updates.
- Updated `setAccountOverviewPanelVisible(...)`:
  - opening panel now forces immediate remote snapshot refresh for up-to-date values.

### Files Affected

- `binary-tree-next-app.mjs`

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-14) - Boot Visibility Default: Account Overview Hidden

### Scope

- Prevent Account Overview panel from auto-opening during Binary Tree Next startup.

### What Changed

- Updated `state.ui.accountOverviewVisible` default in `binary-tree-next-app.mjs`:
  - `true` -> `false`.
- Panel remains toggleable via the new top-right profile-left `Account Overview` action button.

### Files Affected

- `binary-tree-next-app.mjs`

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-14) - Profile-Left Action Buttons (Top-Right)

### Scope

- Reposition right-side panel controls so Account Overview follows the new profile-adjacent action pattern.

### What Changed

- Updated `drawBottomToolBar(...)` in `binary-tree-next-app.mjs`:
  - added top-right profile-left circular button group:
    - Account Overview toggle
    - Rank Advancement placeholder
  - removed Account Overview from the vertical right rail list.
  - preserved existing vertical rail navigation controls.
- Updated action routing in `triggerAction(...)`:
  - added `panel:rank-advancement:placeholder` no-op handler for placeholder behavior.

### Files Affected

- `binary-tree-next-app.mjs`

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-14) - Legacy Founder Icon Preference Enforced

### Scope

- Ensure `Legacy Founder` title always uses the requested Title-Icons asset.

### What Changed

- Added `resolveForcedTitleIconPathFromLabels(...)` in `binary-tree-next-app.mjs`.
- Updated `resolveNodeDetailRankAndTitleIcons(...)` to prefer forced title-event icon mapping from title labels before fallback path/icon-key logic.
- `Legacy Founder` now resolves to:
  - `/brand_assets/Icons/Title-Icons/legacy-founder-star-light.svg`

### Files Affected

- `binary-tree-next-app.mjs`

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-14) - Legacy Founder Title Icon Resolution Fix

### Scope

- Correct wrong title icon rendered for `Legacy Founder` in Account Overview / node-detail title badge flows.

### What Changed

- Updated `resolveAchievementIconKeyFromLabel(...)` in `binary-tree-next-app.mjs`:
  - added ordered checks for title-event labels before generic legacy matching.
- Added title-icon resolution helpers:
  - `TITLE_ICON_BASE_NAME_BY_KEY`
  - `resolveTitleIconBaseName(...)`
  - `resolveTitleIconPathFromValue(...)`
- Updated `resolveNodeDetailsIconPath(...)`:
  - routes known title-event keys/ids to `/brand_assets/Icons/Title-Icons/*-light.svg`
  - preserves existing achievements fallback for rank-style icons.

### Files Affected

- `binary-tree-next-app.mjs`

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-14) - Title Sync Fix (Account Overview + Live Nodes)

### Scope

- Ensure Binary Tree Next title and title icon rendering uses actual profile title sources consistently.

### What Changed

- Added shared title/icon resolver helpers in `binary-tree-next-app.mjs`:
  - `resolveNodePrimaryTitleLabel(...)`
  - `resolveNodeSecondaryTitleLabel(...)`
  - `resolveNodeRankIconPathValue(...)`
  - `resolveNodeTitleIconPathValue(...)`
  - `isTreeNextRankBuilderFallbackTitle(...)`
- Updated `resolveNodeDetailRankAndTitleIcons(...)` to prefer profile badge icon fields before legacy/fallback icon keys.
- Updated `syncAccountOverviewPanelVisuals()` title selection logic:
  - avoids stale fallback `"{rank} Builder"` overriding profile/session title selections.
  - for member source mode, non-fallback session profile title now wins over node snapshot title fields.
  - merges icon source fields from node + session so badge icons stay synced.
- Updated live node builders:
  - `createTreeNextLiveScopedRootNode(...)`
  - `buildTreeNextNodesFromRegisteredMembers(...)`
  - now persist normalized title metadata (`accountTitle`, `profileAccountTitle`, secondary title fields) and rank/title icon path fields.

### Files Affected

- `binary-tree-next-app.mjs`

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-14) - Hero Row Center Alignment

### Scope

- Account Overview hero row alignment tuning.

### What Changed

- Updated `.tree-next-account-overview-hero` in `binary-tree-next.html`:
  - `align-items: end` -> `align-items: center`.
- This aligns the hero composition to center rather than bottom anchor.

### Files Affected

- `binary-tree-next.html`

### Validation

- CSS-only layout change.
- screenshot pass skipped per user instruction.

## Update (2026-04-14) - Account Overview Panel Toggle Integration

### Scope

- Binary Tree Next right-side controls and Account Overview panel behavior.

### What Changed

- Added a new right-side dock button in canvas render flow to toggle Account Overview visibility.
- Added `accountOverviewVisible` to Binary Tree Next UI state.
- Added panel sync functions in `binary-tree-next-app.mjs` for:
  - dynamic left/top/width/height based on current layout
  - hide/show class management and `aria-hidden` state
  - init binding for header `x` close action.
- Updated panel CSS in `binary-tree-next.html` with hidden-state transition (`.is-hidden`) and close-button semantics.

### Files Affected

- `binary-tree-next-app.mjs`
- `binary-tree-next.html`

### Design Notes

- Preserved hybrid rendering strategy:
  - canvas for shell controls (right rail buttons)
  - DOM for detailed scrollable panel content.
- Panel uses layout-aware placement so it follows side-nav positioning instead of fixed static placement.

### Known Limitations

- Account Overview panel currently uses placeholder/default field values for many metrics in this pass.
- Commission tile navigation targets are not wired yet (pending later design/data pass).
- Screenshot-diff QA was skipped in this session per user request.

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-14) - Account Overview KPI + Commission Data Wiring

### Scope

- Wire Account Overview panel values to live/runtime data sources from top to bottom.

### What Changed

- Added Account Overview remote snapshot sync in `binary-tree-next-app.mjs` with guarded polling and retry cadence:
  - `/api/binary-tree-metrics`
  - `/api/sales-team-commissions`
  - `/api/commission-containers`
  - `/api/e-wallet`
- Added session-aware reset/refetch flow for Account Overview remote data on storage/session updates.
- Implemented field resolvers and bindings for:
  - rank/title/user identity and active indicator
  - account active-until countdown (monthly anchored cutoff logic + fallback)
  - total organization personal BV
  - personal BV
  - weekly cycle cap
  - direct sponsors
  - e-wallet
  - track commissions cards:
    - retail profit
    - fast track commission
    - sales team commission
    - infinity builder bonus
    - legacy builder bonus
- Added cached leg-volume fallback metrics for total-organization BV when remote metrics are unavailable.

### Files Affected

- `binary-tree-next-app.mjs`

### Design Notes

- Preserved existing UI composition: DOM panel over canvas-rendered Binary Tree Next shell.
- Reused existing local formatting helpers (`formatVolumeValue`, `formatEnrollCurrency`, `formatInteger`) to match current number/currency language.
- Retail Profit is wired through available runtime sources and fallbacks; no new dedicated retail aggregation endpoint was introduced in this pass.

### Known Limitations

- Retail Profit may display `0.00` when no retail-commission source is present in currently available snapshot/session data.
- Commission-card click routing behavior is unchanged in this pass.

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-14) - My Store Panel Added (Binary Tree Next)

### Scope

- Add a new `My Store` right-side panel in Binary Tree Next using the same shell/theme approach as Account Overview.

### What Changed

- Added a new DOM panel in `binary-tree-next.html`:
  - `#tree-next-my-store-panel`
  - Featured product block (`MetaChargeâ„¢` + bottle image from `brand_assets/Product Images`)
  - Account Upgrades section
  - Share and Earn section with `Copy Store Link` action
- Added panel-specific styling in `binary-tree-next.html` to mirror Account Overview panel framing:
  - same fixed overlay shell behavior and transition language
  - section dividers, soft product-card surfaces, pill-style copy button
  - responsive rules for tablet/mobile panel widths and upgrade grid columns
- Added My Store panel logic in `binary-tree-next-app.mjs`:
  - DOM refs/state integration (`state.ui.myStoreVisible`)
  - dynamic panel position sync from Binary Tree layout
  - visibility lifecycle helpers + close button handling
  - dynamic Account Upgrades rendering by current account package
  - copy-link clipboard flow with fallback copy strategy
- Added brand menu routing for My Store:
  - `brand-menu:page:my-store` now opens the My Store panel
- Added panel exclusivity behavior:
  - opening My Store hides Account Overview
  - opening Account Overview hides My Store

### Package Upgrade Logic Used

- Preferred Customer -> Personal / Business / Infinity / Legacy
- Personal -> Business / Infinity / Legacy
- Business -> Infinity / Legacy
- Infinity -> Legacy
- Legacy -> no upgrade cards rendered

### Files Affected

- `binary-tree-next.html`
- `binary-tree-next-app.mjs`

### Known Limitations

- Store link generation uses session/home store code when available; otherwise falls back to `/store.html`.
- Screenshot comparison pass was skipped in this session per user instruction.

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-14) - My Store Featured Card Refinement

### Scope

- Refine My Store featured and upgrade product card presentation and interactions.

### What Changed

- Increased product image-shell sizing for featured and upgrade cards so product surfaces read larger.
- Differentiated typography scale between:
  - `Featured` section heading
  - featured product title (`MetaCharge(TM)`)
- Converted featured and upgrade product cards to clickable button cards.
- Added click handling to route product-card clicks to the store destination with product/upgrade query parameters.
- Tightened product-image centering in gray cards:
  - `display: grid` + `place-items: center` on image shells
  - explicit `object-fit: contain` and centered image alignment rules.

### Files Affected

- `binary-tree-next.html`
- `binary-tree-next-app.mjs`

### Design Notes

- Preserved Account Overview shell language while giving product cards stronger visual weight for store actions.
- Product-card interactions intentionally use button semantics for keyboard and pointer accessibility.

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-14) - My Store Product Shell Spacing Refinement

### Scope

- Enlarge gray product containers and enforce stronger inner spacing around bottle art.

### What Changed

- Increased featured product gray shell size and radius.
- Increased upgrade product gray shell size and minimum height.
- Increased shell padding so product art has clearer inset breathing room.
- Added explicit image size caps per shell type:
  - featured image cap tighter than base for stronger corner gap
  - upgrade image cap balanced for grid density.
- Adjusted small-screen featured shell width to preserve proportional spacing.

### Files Affected

- `binary-tree-next.html`

### Design Notes

- The sizing/padding balance now better matches the example visual direction where product art is centered and separated from shell corners.

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-14) - My Store In-Panel Review + Checkout Flow

### Scope

- Keep My Store purchases fully inside Binary Tree Next (no external store redirect).

### What Changed

- Added My Store multi-step views inside the same panel:
  - `catalog`
  - `review purchase`
  - `checkout`
- Added breadcrumb navigation in panel header:
  - `My Store < Review Purchase`
  - `My Store < Review Purchase < Checkout`
- Replaced external product redirect behavior with internal flow state:
  - clicking featured/upgrade cards now opens `Review Purchase` in-panel
- Added review-purchase layout:
  - product image, title, quantity, price, BV
  - `Remove` and `Checkout` actions
- Added checkout layout (large-screen style aligned with reference):
  - summary card (subtotal, discount, tax, pay today)
  - payment/billing form fields
  - `Previous` and `Pay Now` actions
- Added in-panel checkout validation + feedback (required fields/card format checks) without leaving Binary Tree.

### Files Affected

- `binary-tree-next.html`
- `binary-tree-next-app.mjs`

### Design Notes

- Share-and-earn block remains visible on catalog/review views and hides on checkout view.
- Existing My Store panel shell/theme from Account Overview was preserved.

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-14) - My Store Review Typography Scale-Down

### Scope

- Reduce oversized text in Review Purchase and breadcrumb heading row.

### What Changed

- Tuned down breadcrumb font sizes and separator size.
- Reduced Review Purchase text scales for:
  - product name
  - quantity
  - price
  - BV
- Reduced review `Checkout` button label font-size.
- Adjusted mobile typography clamps to avoid text crowding/scramble on narrow widths.

### Files Affected

- `binary-tree-next.html`

### Validation

- CSS-only typography update.

## Update (2026-04-14) - My Store Typography Aligned to Account Overview Scale

### Scope

- Align My Store review/checkout typography to Account Overview sizing rhythm.

### What Changed

- Rebased breadcrumb typography to Account Overview-like heading scale.
- Re-tuned Review Purchase text hierarchy using Account Overview value/title proportions:
  - product name / price / BV
  - quantity
  - remove link
  - checkout button label
- Re-tuned Checkout text hierarchy toward Account Overview-like sizing:
  - page heading + subtitle
  - summary card title/rows/total
  - input text
  - billing heading
  - action button labels
- Updated tablet/mobile overrides to keep the same relative scale system.

### Files Affected

- `binary-tree-next.html`

### Validation

- CSS-only typography update.

## Update (2026-04-14) - My Store Checkout Reused Enroll Step-3 Component Classes

### Scope

- Reuse the existing Enroll Member step-3 checkout component styles in My Store checkout.

### What Changed

- Replaced My Store checkout internals to use Enroll checkout classes:
  - summary card: `tree-next-enroll-checkout-summary`, `tree-next-enroll-checkout-heading`, `tree-next-enroll-checkout-row`, `tree-next-enroll-checkout-total`
  - form fields: `tree-next-enroll-form-input`, `tree-next-enroll-card-row`, `tree-next-enroll-billing-row`, `tree-next-enroll-billing-heading`
  - actions: `tree-next-enroll-action-btn` (`is-secondary` / `is-primary`)
- Added a shared selector so Enroll summary container styling also applies to class-based usage:
  - `#tree-next-enroll-checkout-summary, .tree-next-enroll-checkout-summary`
- Preserved My Store IDs for runtime data binding and interactions.

### Files Affected

- `binary-tree-next.html`

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-14) - My Store Checkout Added Enroll-Style Stripe + Country Customization

### Scope

- Bring full Enroll step-3 checkout internals into My Store checkout (not just visual shell classes).

### What Changed

- Replaced plain card text inputs with Stripe Elements mounts in My Store checkout:
  - card number
  - expiry
  - CVC
- Added My Store Stripe lifecycle in runtime:
  - initialization
  - completion-state tracking
  - clear/reset behavior
  - card-level error surface
- Replaced My Store country text input with Enroll custom-select structure:
  - native select + custom trigger/menu UI
  - country options hydrated from same billing-country catalog source
- Updated billing-country option application/hydration logic to support both:
  - Enroll checkout country select
  - My Store checkout country select
- Updated My Store submit validation to require:
  - billing address fields + billing country code
  - complete Stripe card/expiry/CVC state.

### Files Affected

- `binary-tree-next.html`
- `binary-tree-next-app.mjs`

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-14) - My Store Checkout Scroll Length Reduced

- Completed:
  - added checkout-step-specific compact spacing rules so My Store checkout no longer feels overly tall.
  - reduced vertical spacing in checkout mode for:
    - panel scroll padding
    - header bottom spacing
    - checkout section top padding
    - summary card margin/padding
    - form top margin and field stack gaps
    - checkout action stack spacing
  - compacted Enroll-reused checkout internals within My Store checkout:
    - summary heading/row/total sizing
    - card + billing field min-heights and corner radii
    - billing/card row gaps
    - action button min-heights
  - added extra compact behavior for shorter viewports (`max-height: 1065px` and `max-height: 820px`) to further prevent excessive scrolling.
- Outcome:
  - checkout now uses a tighter vertical rhythm and significantly shorter scroll distance while preserving Enroll step-3 internals/custom UI.
- Files updated:
  - `binary-tree-next.html`
  - `Claude_Notes/binary-tree-next.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - CSS-only layout/spacing update.

## Recent Update (2026-04-14) - My Store Checkout Empty Bottom Space Tightened Further

- Completed:
  - applied a second checkout-only spacing pass focused on removing excessive lower empty space.
  - reduced checkout scroll bottom padding and overall vertical rhythm in default checkout mode.
  - tightened summary, form, billing row, and action-stack spacing.
  - reduced field/button min-heights for checkout mode only.
  - strengthened compact behavior in both `max-height: 1065px` and `max-height: 820px` ranges.
- Outcome:
  - checkout now has noticeably less dead space under the form/actions and a shorter overall scroll path.
- Files updated:
  - `binary-tree-next.html`
  - `Claude_Notes/binary-tree-next.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - CSS-only spacing refinement.

## Recent Update (2026-04-14) - My Store Review Quantity Selector + MLM BV/Upgrade Delta Logic

- Completed:
  - converted Review Purchase `1x` from static text to an interactive quantity selector (`- / +`) for product purchases.
  - added quantity control behaviors:
    - minimum `1`, maximum `99`
    - live subtotal/tax/total/BV recalculation on each quantity change
    - auto-readonly quantity display for package-upgrade selections (no multi-qty upgrades)
  - aligned package-upgrade pricing/BV with MLM upgrade-delta logic:
    - `priceDue` computed from product-count delta between current and target package
    - `bvGain` computed as target-package BV minus current-package BV
    - removed Preferred Customer retail discount from package upgrades (discount stays for product purchase path)
  - aligned My Store tax math with Enroll checkout style (cent-rounded tax + total calculations).
- Outcome:
  - Review Purchase now supports real quantity interaction and checkout totals/BV reflect correct business logic per account package and upgrade path.
- Files updated:
  - `binary-tree-next.html`
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/binary-tree-next.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - duplicate-ID check on `binary-tree-next.html` passed.

## Recent Update (2026-04-14) - Checkout Step Scroll Investigation + Space Collapse Fix

- Investigation findings:
  - checkout was reserving vertical space even when no message existed via:
    - `#tree-next-my-store-card-error` min-height
    - `#tree-next-my-store-checkout-feedback` min-height
  - checkout layout also had cumulative vertical padding/gaps (scroll padding, section top spacing, form/action spacing) causing extra scroll depth.
- Fix applied:
  - added checkout-step-scoped empty-state collapse rules so both card-error and checkout-feedback rows are removed from layout when empty.
  - tightened checkout-only spacing further:
    - reduced checkout scroll bottom padding
    - reduced checkout section top spacing
    - reduced summary/form/action vertical spacing and row gaps
    - reduced checkout action button min-height
  - kept catalog/review/store-list scrolling behavior intact.
- Files updated:
  - `binary-tree-next.html`
  - `Claude_Notes/binary-tree-next.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - CSS-only patch; no runtime logic change.

## Recent Update (2026-04-14) - Checkout Layout Decramped + Dynamic Step Height (Scroll Tail Fix)

- Completed:
  - adjusted checkout-only typography/spacing upward slightly to avoid over-cramped appearance (summary rows, field height, action button height, section/form/action spacing).
  - lowered aggressive compact-mode breakpoint from `max-height: 1065px` to `max-height: 920px` so normal desktop/laptop heights keep readable sizing.
  - implemented dynamic My Store panel height behavior for checkout step in runtime:
    - when step is `checkout`, panel height now targets actual checkout content height (+padding/header buffer) instead of always inheriting full side-nav height.
  - preserved existing behavior for `catalog` and `review` steps (full-height side panel remains intact).
- Outcome:
  - checkout no longer appears overly cramped, and the large empty area/tail under checkout content is removed on normal screens.
  - unnecessary checkout scroll caused by oversized panel height context is significantly reduced.
- Files updated:
  - `binary-tree-next.html`
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/binary-tree-next.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-14) - Real Checkout Space Fix (Auto-Height Panel in Checkout Step)

- Completed:
  - implemented structural checkout-step sizing fix in CSS:
    - `#tree-next-my-store-panel[data-my-store-step="checkout"] { height: auto; max-height: ... }`
  - desktop max-height: `calc(100vh - 36px)`
  - tablet/mobile max-height: `calc(100vh - 96px)`
- Why this is the real fix:
  - checkout no longer forcibly inherits full side-panel height, which was creating large blank space under the form.
  - panel now shrink-wraps checkout content and only scrolls when content exceeds viewport cap.
- Files updated:
  - `binary-tree-next.html`
  - `Claude_Notes/binary-tree-next.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - CSS-only layout fix.

## Recent Update (2026-04-14) - Checkout Decramped + Scroll Disabled (Checkout Step)

- Completed:
  - increased checkout readability/spacing so fields and text are no longer overly compressed.
  - reverted overly aggressive tightness in checkout-only base sizing:
    - larger summary text/total
    - larger field and action button heights
    - increased vertical gaps around form/actions
  - disabled checkout-step scrolling explicitly:
    - `#tree-next-my-store-panel[data-my-store-step="checkout"] .tree-next-my-store-scroll { overflow-y: hidden; }`
  - pushed compact-height breakpoints down so aggressive compact rules only apply on very short viewports:
    - `max-height: 760px`
    - `max-height: 680px`
- Outcome:
  - checkout now has breathing room again and does not scroll in normal viewport heights.
- Files updated:
  - `binary-tree-next.html`
  - `Claude_Notes/binary-tree-next.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - CSS-only checkout layout refinement.

## Recent Update (2026-04-14) - Store Checkout Now Matches Enroll Step 3 Layout + Real Height Fix

- Completed:
  - fixed a misplaced runtime patch: checkout auto-height logic had been applied inside syncAccountOverviewPanelPosition(...) and is now correctly applied in syncMyStorePanelPosition(...).
  - My Store checkout panel height now shrink-wraps checkout content (header + content + padding buffer) during checkout step, eliminating the large empty white tail.
  - kept checkout-step scrolling disabled while ensuring content gets proper breathing room.
  - aligned Store checkout spacing/layout with Enroll step-3 checkout rhythm:
    - summary card spacing/typography
    - field stack and billing/card row gaps
    - input/select/card-shell sizing
    - action stack/button spacing and sizing
  - updated My Store checkout markup to mirror Enroll step-3 billing structure by wrapping billing controls in .tree-next-enroll-billing-fields and adding matching screen-reader labels.
- Outcome:
  - Checkout is no longer overly cramped and no longer leaves a large blank area under the form.
  - Store checkout now follows the same clean/tight layout behavior expected from Enroll step 3.
- Files updated:
  - binary-tree-next.html
  - binary-tree-next-app.mjs
  - Claude_Notes/binary-tree-next.md
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Validation:
  - node --check binary-tree-next-app.mjs passed.



## Recent Update (2026-04-14) - My Store Checkout Height Increased + Spacing Expanded

- Completed:
  - increased checkout panel runtime height allowance in syncMyStorePanelPosition(...) by raising the checkout padding buffer and using a taller minimum target for checkout mode.
  - expanded checkout internal spacing so content feels less cramped:
    - larger scroll padding
    - larger header-to-content spacing
    - larger summary card margin/padding
    - larger field stack gaps and billing/card row gaps
    - slightly taller inputs and action buttons
    - increased action stack spacing
  - applied matching relaxed spacing adjustments in compact-height checkout media rules so the denser layouts still keep breathing room.
- Outcome:
  - My Store checkout panel is visibly taller, and form/summary/action elements are spread more evenly.
  - checkout remains non-scroll in checkout mode while avoiding the cramped look.
- Files updated:
  - binary-tree-next.html
  - binary-tree-next-app.mjs
  - Claude_Notes/binary-tree-next.md
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Validation:
  - node --check binary-tree-next-app.mjs passed.

## Recent Update (2026-04-14) - My Store Checkout Made Taller + Extra Bottom Button Gap

- Completed:
  - increased checkout panel target height again in `syncMyStorePanelPosition(...)`:
    - checkout extra height buffer increased to `+96`
    - checkout minimum target height increased to `460`
  - increased checkout vertical spacing in My Store checkout mode:
    - larger scroll top/bottom padding
    - larger header-to-body spacing
    - larger section bottom padding to create visible space below action buttons
    - slightly larger action stack spacing and button height
  - propagated bottom-spacing/taller feel into compact-height checkout media rules so the button area still has breathing room on shorter screens.
- Outcome:
  - checkout panel renders taller overall.
  - there is now intentional space below the checkout buttons before the container ends.
- Files updated:
  - binary-tree-next.html
  - binary-tree-next-app.mjs
  - Claude_Notes/binary-tree-next.md
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Validation:
  - node --check binary-tree-next-app.mjs passed.

## Recent Update (2026-04-14) - My Store Checkout/Review Spacing + Breadcrumb Direction + Button Glow Cleanup

- Completed:
  - checkout typography spacing refinements:
    - increased top spacing above `Complete Checkout`
    - increased gap between checkout caption text and subtotal summary card
  - removed glow-style shadows from My Store action buttons:
    - review checkout button
    - checkout action buttons (`Previous` / `Pay Now`) within My Store panel
    - `Copy Store Link` button
  - fixed breadcrumb separator direction from `<` to `>` in review and checkout breadcrumb states.
  - lowered `Share and Earn` on review page with step-specific spacing so it sits lower/closer to mid-panel.
  - review typography alignment tweaks requested:
    - product name weight aligned to match price presentation
    - quantity selector value weight aligned with BV field emphasis
    - small-screen review name size aligned with price size
- Outcome:
  - checkout spacing reads cleaner at the top and between caption/summary.
  - button glow is removed across My Store actions.
  - breadcrumbs now flow left-to-right (`>`).
  - review panel balance is improved with lower Share and Earn placement.
  - product/price and quantity/BV visual hierarchy now match more closely.
- Files updated:
  - binary-tree-next.html
  - binary-tree-next-app.mjs
  - Claude_Notes/binary-tree-next.md
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Validation:
  - node --check binary-tree-next-app.mjs passed.

## Recent Update (2026-04-14) - Review Row Pairing Fix (Name?Price, Qty Selector?BV)

- Completed:
  - reworked My Store review details layout from inline-flex wrapping to a 2-row grid so left-side content pairs correctly with right-side pricing rows:
    - row 1: Product Name aligns with Price
    - row 2: Quantity Selector aligns with BV
  - reduced quantity selector control height and internal button size so its visual height better matches the BV row.
  - kept responsive behavior centered on tablet/mobile while preserving the same row pairing intent.
- Outcome:
  - product name and price now match row hierarchy more closely.
  - quantity selector no longer looks oversized versus the BV line.
- Files updated:
  - binary-tree-next.html
  - Claude_Notes/binary-tree-next.md
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Validation:
  - CSS-only review-layout refinement.

## Recent Update (2026-04-14) - Review Row Height Alignment Tightened Again

- Completed:
  - adjusted review details block upward to align row heights with right-side pricing block on desktop.
  - tightened quantity selector vertical size and button size further so selector height visually matches BV row height.
  - increased row-gap consistency between left/right review stacks.
  - maintained centered mobile/tablet behavior by resetting desktop offset in compact layout.
- Outcome:
  - product name row is now aligned closer to price row.
  - quantity selector row now aligns closer to BV row with less height mismatch.
- Files updated:
  - binary-tree-next.html
  - Claude_Notes/binary-tree-next.md
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Validation:
  - CSS-only review-layout adjustment.

## Recent Update (2026-04-14) - My Store Review Name/Price Vertical Anchor Fix

- Completed:
  - removed the desktop offset on .tree-next-my-store-review-details (margin-top: -34px -> margin-top: 0).
  - changed review layout alignment from centered to top-anchored:
    - .tree-next-my-store-review-card { align-items: start; }
    - .tree-next-my-store-review-main { align-items: start; }
    - .tree-next-my-store-review-details { align-content: start; }
- Outcome:
  - product name and price now share the same vertical anchor in My Store > Review Purchase.
  - quantity selector and BV rows keep their current pairing while removing the previous row-offset mismatch.
- Files updated:
  - binary-tree-next.html
  - Claude_Notes/binary-tree-next.md
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Design decision:
  - replaced pixel-offset balancing with structural top anchoring so alignment remains stable as copy/values change.
- Known limitations:
  - CSS-only layout adjustment; no runtime logic, data flow, or checkout calculations were changed.
- Validation:
  - CSS-only review alignment fix.

## Recent Update (2026-04-14) - My Store Review Panel Bottom Space Reduced (Dynamic Review Height)

- Completed:
  - added review-step runtime panel sizing in syncMyStorePanelPosition(...) for MY_STORE_STEP_REVIEW.
  - introduced review/share view references for height measurement:
    - myStoreReviewViewElement
    - myStoreShareViewElement
  - for review step, panel height now derives from actual visible content instead of full side-nav height:
    - header height
    - scroll padding
    - review section content height
    - share section height when visible
    - small fixed buffer
  - retained viewport clamping so larger future carts can still scroll instead of overflowing.
- Outcome:
  - the Review Purchase container no longer leaves an oversized empty bottom area for short carts.
  - behavior still scales for longer/multi-item cart content by respecting viewport max height.
- Files updated:
  - binary-tree-next-app.mjs
  - Claude_Notes/binary-tree-next.md
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Design decision:
  - used content-driven runtime sizing for review step (instead of hardcoded static height) to keep layout balanced across variable cart content sizes.
- Known limitations:
  - sizing is recalculated on render frames; minor 1-frame settling may occur immediately after rapid content changes.
- Validation:
  - node --check binary-tree-next-app.mjs passed.

## Recent Update (2026-04-14) - My Store Catalog Uses Compact Height When No Upgrades Exist

- Completed:
  - extended syncMyStorePanelPosition(...) to apply content-driven panel sizing in MY_STORE_STEP_CATALOG when no account packages are upgradeable.
  - added catalog-view DOM reference for measurement:
    - myStoreCatalogViewElement
  - for catalog step with zero upgrade keys, panel height now uses measured visible content (matching the compact pattern used for Review):
    - header height
    - scroll padding
    - catalog content height
    - share block height (when visible)
    - fixed buffer
  - kept viewport clamping so larger content can still scroll safely.
- Outcome:
  - My Store no longer shows an oversized bottom tail on catalog view when the member has no upgradeable account packages.
  - catalog height behavior now matches the tighter review-style sizing in that no-upgrade state.
- Files updated:
  - binary-tree-next-app.mjs
  - Claude_Notes/binary-tree-next.md
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Design decision:
  - conditioned compact catalog sizing on upgrade availability (upgradeKeys.length === 0) so accounts with upgrade cards keep the full panel canvas.
- Known limitations:
  - compact catalog sizing is not applied when upgrade cards exist, by design.
- Validation:
  - node --check binary-tree-next-app.mjs passed.

## Recent Update (2026-04-14) - My Store Checkout Field Spacing Polish Pass

- Completed:
  - rebalanced My Store checkout spacing tokens in inary-tree-next.html for cleaner, more polished form rhythm.
  - increased desktop checkout breathing room:
    - larger checkout scroll padding and section spacing
    - larger summary card margin/padding and row rhythm
    - increased form stack/row gaps
    - increased input/card/select control heights and internal horizontal padding
    - increased billing label/help text sizing for readability
    - increased action-row spacing and button height
  - relaxed compact-height rules (both max-height: 760px and max-height: 680px) so they remain compact but no longer feel cramped.
- Outcome:
  - checkout fields now have clear separation and more comfortable visual spacing.
  - overall checkout panel reads cleaner and more intentional while preserving existing structure and flow.
- Files updated:
  - binary-tree-next.html
  - Claude_Notes/binary-tree-next.md
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Design decision:
  - used a consistent spacing scale across desktop and compact-height states instead of ad-hoc tight values.
- Known limitations:
  - checkout step still uses existing no-scroll behavior by design (overflow-y: hidden) and relies on runtime panel sizing.
- Validation:
  - node --check binary-tree-next-app.mjs passed.

## Recent Update (2026-04-14) - Upgrade Product Choice + MLM-Aligned BV Logic in My Store

- Completed:
  - implemented upgrade-product selection flow in My Store Review for account upgrades:
    - after choosing an upgrade package, review now shows Select your product options (MetaCharge™, MetaRoast™)
    - selection is interactive and persisted in state.ui.myStoreSelection
  - aligned upgrade BV logic to MLM product-count rule:
    - BV now derives from upgrade product count x per-product upgrade BV (50 BV each)
    - example path now resolves correctly: 17 products => 850 BV
  - aligned upgrade price logic to product-count rule:
    - upgrade subtotal remains product-count delta x unit price ($64)
  - corrected package meta mismatch impacting upgrade delta math:
    - personal-builder-pack BV corrected from 192 to 150 in ENROLL_PACKAGE_META
  - updated review/checkpoint display behavior for upgrades:
    - breadcrumb label switches to Review Upgrade when selection is an upgrade
    - review row shows selected product + computed upgrade quantity (e.g., MetaCharge™ 17x)
    - checkout summary line includes upgrade product selection context
- Outcome:
  - upgrade users now explicitly choose which product to receive for their package-delta products.
  - BV and amount calculations now match MLM account-upgrade rules based on product deltas.
  - Personal -> Legacy upgrade now computes expected 17 products and 850 BV.
- Files updated:
  - binary-tree-next-app.mjs
  - binary-tree-next.html
  - Claude_Notes/binary-tree-next.md
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Design decisions:
  - upgrade calculations were anchored to product-count deltas (selectableProducts) and fixed per-upgrade product BV (50) to enforce "BV follows products".
  - product choice is currently single-selection per upgrade transaction (all delta products assigned to one chosen product type).
- Known limitations:
  - MetaRoast™ currently reuses the available MetaCharge product image asset until a dedicated MetaRoast asset is added in rand_assets/Product Images/.
  - split-product allocation (e.g., mix of MetaCharge + MetaRoast counts in one upgrade) is not yet implemented.
- Validation:
  - node --check binary-tree-next-app.mjs passed.

## Recent Update (2026-04-14) - Review Upgrade Selector Moved Below Product Row

- Completed:
  - moved the Select your product upgrade selector block in My Store > Review Upgrade to render below the product row content (after the quantity/product line), instead of above it.
- Outcome:
  - review layout now follows requested order with selector positioned below product information.
- Files updated:
  - binary-tree-next.html
  - Claude_Notes/binary-tree-next.md
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Validation:
  - node --check binary-tree-next-app.mjs passed.

## Recent Update (2026-04-14) - My Store Stripe Checkout Completion + Thank-You Step

- Completed:
  - replaced the My Store placeholder submit message with a real Stripe payment flow in `binary-tree-next-app.mjs`.
  - My Store now performs full intent flow:
    - `POST /api/store-checkout/intent`
    - `confirmCardPayment(...)`
    - `POST /api/store-checkout/intent/complete` with retry polling.
  - added My Store success state and UI:
    - new `thank-you` panel step (`MY_STORE_STEP_THANK_YOU`)
    - success card now shows invoice, status, amount paid, BV, and date
    - `Done` button returns user to catalog flow.
  - improved checkout submit UX:
    - added submit/confirm/finalizing button states
    - disabled previous/pay actions while checkout is in-flight
    - upgraded feedback messaging for Stripe/init/finalization failures.
  - aligned My Store checkout totals with backend storefront-intent pricing by setting My Store tax to `0` in local checkout amount calculation so displayed total matches Stripe/invoice settlement.
- Outcome:
  - checkout in Binary Tree My Store is now actually processed through Stripe instead of stopping at a static "processing" message.
  - successful payments land on a clean confirmation page similar to Enroll Member completion flow.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `binary-tree-next.html`
  - `Claude_Notes/binary-tree-next.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Design decisions:
  - reused existing store-checkout backend intent endpoints to keep invoice attribution/BV settlement logic centralized.
  - kept My Store in-panel (non-redirect) payment UX using Stripe Elements already mounted in Binary Tree.
- Known limitations:
  - checkout requires a valid member session email; if missing/invalid, submission is blocked with guidance.
  - no automated browser e2e was run in this pass; syntax validation was completed.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-14) - Account Upgrade Checkout Reconciliation and Rank Sync

- Completed:
  - Introduced account-upgrade metadata from My Store checkout into Stripe payment intent/session creation.
  - Updated checkout completion parsing to read backend `accountUpgrade` state.
  - Added local and remote session synchronization helpers so Binary Tree session + root node identity refreshes immediately after upgrade completion.
  - Added upgrade post-processing refresh hook:
    - member session refresh (`/api/member-auth/session`)
    - forced tree live sync
    - account overview remote refresh.
  - Updated store checkout finalization to:
    - skip generic buyer BV credit for upgrade-tagged checkouts
    - run `upgradeMemberAccount(...)` as part of payment finalization
    - return `accountUpgrade` details in completion payloads.
- Outcome:
  - paid account upgrades now update package/rank consistently and reflect in left-panel Binary Tree UI without waiting for manual relog.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `backend/services/store-checkout.service.js`
- Design decisions:
  - backend finalization owns upgrade application for stronger consistency with successful payment state.
  - upgrade-tagged checkout bypasses generic buyer-credit path to avoid duplicate PV/BV credit.
- Known limitations:
  - historical upgrades completed before this patch may still require manual one-time data reconciliation.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - `node --check backend/services/store-checkout.service.js` passed.

## Recent Update (2026-04-14) - Hosted Stripe Checkout Migration (Binary Tree + Storefront)

- Completed:
  - Migrated Binary Tree enrollment checkout from Stripe PaymentIntent + in-page card confirmation to hosted Stripe Checkout Session flow.
  - Migrated Binary Tree My Store checkout from PaymentIntent + `confirmCardPayment(...)` to hosted Stripe Checkout Session redirect flow.
  - Added Stripe return handling in Binary Tree:
    - detects `checkout=success|cancel`, `session_id`, and `bt_checkout_flow` query params
    - finalizes the correct flow (`/registered-members/session/complete` for enroll, `/store-checkout/complete` for My Store)
    - opens the appropriate UI state (enroll modal or My Store panel), shows result messaging, and clears return query params.
  - Added backend enrollment hosted-session endpoints:
    - `POST /api/registered-members/session`
    - `POST /api/registered-members/session/complete`
    - admin variants under `/api/admin/...`
    - retains existing intent endpoints for compatibility.
  - Added enrollment Stripe session services in backend:
    - `createRegisteredMemberCheckoutSession(...)`
    - `completeRegisteredMemberCheckoutSession(...)` (delegates finalization to existing PaymentIntent completion path after resolving session payment intent).
  - Migrated public `store-checkout.html` page to hosted session flow:
    - now uses `StorefrontShared.submitCheckout(...)`
    - finalizes return via `StorefrontShared.completeCheckoutSession(...)` with retry polling
    - removed in-page card confirmation dependency for submit path.
  - Migrated member dashboard store checkout in `index.html` to hosted session redirect:
    - added session create/complete helpers
    - added return finalization handler on load
    - checkout button no longer blocks on Stripe card element readiness.

- Files updated:
  - backend/controllers/member.controller.js
  - backend/routes/member.routes.js
  - backend/services/member.service.js
  - binary-tree-next-app.mjs
  - store-checkout.html
  - index.html
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
  - Claude_Notes/binary-tree-next.md

- Design decisions:
  - Kept final order/enrollment reconciliation in backend completion endpoints so business rules remain centralized and consistent.
  - Used flow query tagging (`bt_checkout_flow`) in Binary Tree return URLs to disambiguate My Store vs Enroll completion after Stripe redirect.
  - Preserved existing intent endpoints during migration for backward compatibility and lower risk rollout.

- Known limitations:
  - Legacy Stripe card-element initialization code remains in some places (mostly unused after migration) and can be removed in a cleanup pass.
  - No full browser E2E replay against live Stripe was executed in this pass; syntax and flow wiring were validated locally.

- Validation:
  - node --check backend/services/member.service.js passed.
  - node --check backend/controllers/member.controller.js passed.
  - node --check backend/routes/member.routes.js passed.
  - node --check binary-tree-next-app.mjs passed.
  - inline script syntax checks for index.html and store-checkout.html passed via extracted-script `node --check`.

## Recent Update (2026-04-14) - Binary Tree Popup Checkout (No Page Reload) + Step-3 Bypass

- Completed:
  - Updated Binary Tree Enroll Member flow so step 2 (package selection) now launches Stripe hosted checkout in a new popup window instead of advancing to step 3 card/billing entry.
  - Updated Binary Tree My Store flow so review checkout opens Stripe hosted checkout in a popup window (no full-page redirect/reload).
  - Added popup-aware completion polling in Binary Tree for both flows:
    - continuously calls completion endpoints using `sessionId`
    - closes popup automatically on successful payment
    - shows in-panel thank-you states after successful finalization.
  - Kept Binary Tree session/tree context in-place (no browser navigation reload in parent window).
  - Fixed Stripe `{CHECKOUT_SESSION_ID}` placeholder handling in backend return URL builders by ensuring the placeholder is emitted unescaped (`%7B...%7D` -> `{...}`), resolving `No such checkout.session: {CHECKOUT_SESSION_ID}` issues.

- Files updated:
  - `binary-tree-next-app.mjs`
  - `backend/services/member.service.js`
  - `backend/services/store-checkout.service.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`

- Design decisions:
  - Popup window + server-side session polling was chosen to avoid parent-page reload while preserving secure Stripe-hosted collection.
  - Enrollment step-3 UI was bypassed behaviorally (not required to proceed) to avoid duplicate billing/card entry before Stripe.

- Known limitations:
  - If popup blockers are enabled, checkout will not open until popups are allowed.
  - Legacy step-3 markup still exists in HTML, but checkout no longer depends on it in normal path.

- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - `node --check backend/services/member.service.js` passed.
  - `node --check backend/services/store-checkout.service.js` passed.

## Recent Update (2026-04-14) - Stripe Popup Return Page + Original Tab Thank-You Sync

- Completed:
  - Added dedicated Stripe popup return page: `stripe-checkout-return.html`.
  - Updated Binary Tree Stripe return-path builder to send Stripe back to the new return page instead of `binary-tree-next.html`.
  - Added return payload target path query support so the popup page can provide a direct "Back to Binary Tree" action.
  - Added cross-tab return signaling from popup return page to Binary Tree app using:
    - `localStorage` signal key: `binary-tree-next-stripe-return-signal-v1`
    - `postMessage` signal type: `binary-tree-next-stripe-return`
  - Added Binary Tree listeners to consume Stripe success/cancel signals and immediately apply the correct UI state in the original tab:
    - My Store: finalizes checkout + shows Thank You panel
    - Enroll: finalizes enrollment + shows Thank You modal
  - Added in-flight finalization guards for both My Store and Enroll session finalization to avoid duplicate finalize races.

- Files updated:
  - `binary-tree-next-app.mjs`
  - `stripe-checkout-return.html`

- Design decisions:
  - Kept Stripe redirect destination lightweight and purpose-built (status + return guidance) to avoid spawning a second full Binary Tree runtime in the popup.
  - Used both storage and postMessage signaling for resilient cross-tab sync.
  - Preserved existing query-based return handling in Binary Tree for backward compatibility.

- Known limitations:
  - Popup blockers still prevent checkout popup launch.
  - If browser storage is disabled, popup signal propagation may fall back to postMessage only.

- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Follow-up Update (2026-04-14) - Immediate Thank-You on Old Tab After Stripe Success

- Completed:
  - Removed long blocking finalization wait from My Store submit path after popup launch.
  - On Stripe success signal, old tab now immediately switches to a Thank You state (`Processing`) before backend completion finishes.
  - Kept backend finalization running in background with extended retries (up to ~63s) so invoice details can hydrate once available.
  - Added pending My Store checkout state persistence for the launched hosted-session id.
  - Added auto-close attempt on popup return page after broadcasting success/cancel back to opener.

- Files updated:
  - `binary-tree-next-app.mjs`
  - `stripe-checkout-return.html`

- Known limitations:
  - If Stripe/session finalization is delayed, Thank You appears immediately but detailed invoice values may populate a bit later.

- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - inline script syntax check for `stripe-checkout-return.html` passed via extracted script and `node --check`.

## Follow-up Update (2026-04-14) - Failed-to-Fetch Recovery for Stripe Return Finalization

- Completed:
  - Added transient network failure detection for My Store Stripe completion (`Failed to fetch`, network/load failures).
  - Added auto-retry scheduler for My Store checkout finalization (up to 12 retries, 1.8s interval) instead of hard-failing immediately.
  - Preserved immediate Thank You state while retries run in background.
  - Added retry tracking cleanup when completion succeeds.
  - Added stripe-return-signal re-check on window focus and visibility restoration to handle missed storage events.

- Files updated:
  - `binary-tree-next-app.mjs`

- Known limitations:
  - If backend is unreachable for an extended period, invoice details may remain in processing state until connectivity is restored.

- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Follow-up Update (2026-04-14) - Instant Paid Amount/BV on Thank-You (No Waiting UX)

- Completed:
  - Persisted My Store checkout snapshot at session creation (`amountPaid`, `bv`, `productLabel`, `quantity`, `dateLabel`).
  - On Stripe success signal, Thank You now renders instantly with paid amount + BV from the snapshot.
  - Thank You pending state now defaults to "Paid" and "Generating..." receipt id instead of generic processing placeholders.
  - Kept backend finalization running in background so authoritative invoice metadata can replace placeholders when ready.

- Files updated:
  - `binary-tree-next-app.mjs`

- Known limitations:
  - Invoice id/date/status details may still hydrate a few seconds later depending on backend/Stripe consistency timing.

- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Follow-up Update (2026-04-14) - Immediate Thank-You Status Set to Pending

- Completed:
  - Updated instant My Store thank-you shell status from `Paid` to `Pending`.
  - Applied the same `Pending` label in Stripe-success signal handling before backend invoice hydration completes.

- Files updated:
  - `binary-tree-next-app.mjs`

- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Follow-up Update (2026-04-14) - Thank-You Breadcrumb Simplification

- Completed:
  - Removed `> Checkout >` from My Store Thank-You breadcrumb trail.
  - Thank-You path now reads: `My Store > Review Purchase > Thank You` (or `Review Upgrade` variant).

- Files updated:
  - `binary-tree-next-app.mjs`

- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Follow-up Update (2026-04-15) - Enrollment Parent-Jump Hotfix (Auto-Spillover Pending Placement + Parent Reference Stability)

- Completed:
  - Added `parentUsername` to the anticipation-node enrollment request payload so lock metadata keeps a stable identity key.
  - Updated enrollment modal parent-reference resolution to prefer username over display/member-code text.
  - Extended live tree lookup hydration with compatibility keys (`memberCode`, `fullName`, `name`) using preserve-existing semantics for weaker identity keys.
  - Added `shouldSkipTreeNextPendingPlacementApply(...)` and skip handling so auto-spillover enrollments without a manual parent reference are no longer optimistically forced onto the selected lock parent.
  - Added Done-button fallback forced sync when pending placement apply is skipped.
  - Updated success copy for auto-spillover enrollments to avoid asserting a fixed receiving parent before live sync resolves final placement.

- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`

- Design decisions:
  - Preserved the existing member-side policy split (member flow auto-spillover; admin keeps manual parent controls).
  - Removed speculative local placement only for auto-spillover/no-manual-parent cases to prevent perceived re-parenting after sync.
  - Added backward-compatible lookup expansion so historic/manual references that used member labels can still resolve when possible.

- Known limitations:
  - Auto-spillover enrollments still resolve final receiving parent via live tree reconstruction rules and may differ from the initially selected anticipation parent by design.
  - Name-based fallback lookups can be ambiguous if duplicate member names exist; username/id references remain the authoritative path.

- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Follow-up Update (2026-04-15) - Server-Enforced Binary Enrollment Placement + Authenticated Member Writes

- Completed:
  - Enforced member write routes with `requireMemberAuthSession` for:
    - `POST /api/registered-members`
    - `POST /api/registered-members/session`
    - `POST /api/registered-members/session/complete`
    - `POST /api/registered-members/intent`
    - `POST /api/registered-members/intent/complete`
    - `PATCH /api/registered-members/:memberId/placement`
  - Wired controller layer to pass `authenticatedMember` into enrollment/session/payment/placement service calls.
  - Fully wired server-side placement policy resolution via `resolveServerEnforcedEnrollmentPlacement(...)` in:
    - `createRegisteredMember(...)`
    - `createRegisteredMemberPaymentIntent(...)`
    - `createRegisteredMemberCheckoutSession(...)`
  - Updated completion flows to preserve authenticated identity:
    - `completeRegisteredMemberPaymentIntent(...)` now forwards `authenticatedMember` into final registration and uses created-member sponsor for invoice attribution fallback.
    - `completeRegisteredMemberCheckoutSession(...)` now forwards `authenticatedMember` into payment-intent completion.
  - Updated non-admin placement-update guardrails in `updateRegisteredMemberPlacement(...)`:
    - Requires authenticated member identity.
    - Blocks sponsor reassignment attempts by member users.
    - Blocks updates outside the authenticated sponsor line.
  - Added bearer token headers to member-side write calls in frontend:
    - `binary-tree-next-app.mjs` enrollment register/session/session-complete calls.
    - `index.html` registered-member create and placement-plan patch calls.

- Files updated:
  - `backend/routes/member.routes.js`
  - `backend/controllers/member.controller.js`
  - `backend/services/member.service.js`
  - `binary-tree-next-app.mjs`
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`

- Design decisions:
  - Member enrollment placement is now server-authoritative and derived from authenticated actor identity.
  - For member context, direct sponsor stays the authenticated member; spillover only activates after first-level left and right are occupied.
  - Admin endpoints keep existing flexibility for manual sponsor/placement control.

- Known limitations:
  - Existing legacy records with missing/ambiguous sponsor identities may still require manual admin cleanup.
  - Client-side prechecks still run for UX, but final placement truth now comes from server policy.

- Validation:
  - `node --check backend/services/member.service.js` passed.
  - `node --check backend/controllers/member.controller.js` passed.
  - `node --check backend/routes/member.routes.js` passed.
  - `node --check binary-tree-next-app.mjs` passed.

## Follow-up Update (2026-04-15) - Spillover Anchor Lock For Member Enrollment (Anticipation Parent Preservation)

- Completed:
  - Updated member-side Binary Tree enrollment submit payload to always send spillover anchor parent from anticipation lock when spillover is active.
  - Updated server spillover policy to preserve requested spillover parent reference for member enrollments when spillover is enabled.
  - Kept sponsor inheritance rule unchanged: member enrollments still resolve sponsor to authenticated member.

- Why:
  - Without a spillover parent reference, live tree rebuild used sponsor-root spillover queue and could reassign receiving parent (for example to older nodes like Perf Test entries) after pressing Done.
  - With anchor lock, receiving parent stays aligned with anticipation-node context while sponsor remains direct.

- Files updated:
  - `binary-tree-next-app.mjs`
  - `backend/services/member.service.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`

- Validation:
  - `node --check backend/services/member.service.js` passed.
  - `node --check binary-tree-next-app.mjs` passed.

## Follow-up Update (2026-04-15) - Always Forward Anticipation Parent As Spillover Anchor

- Completed:
  - Hardened Tree Next enrollment submit payload so `spilloverParentReference` is always sent from anticipation lock (`parentReference` / `parentId`).
  - Set `spilloverParentMode` from anchor presence (`manual` when anchor exists, otherwise `auto`) regardless of UI spillover toggle state.

- Why:
  - Prevents server/client timing mismatches from dropping the selected anticipation parent when server enforces spillover after first-level occupancy checks.
  - Keeps member sponsor behavior unchanged (`direct sponsor = authenticated enroller`) while preserving selected receiving parent context.

- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`

- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Follow-up Update (2026-04-15) - Enrollment Timing Guard (Place-On-Done + Idempotent Done)

- Completed:
  - Adjusted hosted-checkout finalize flow to avoid forced live-tree sync when `state.enroll.pendingPlacement` exists.
  - Added idempotent pending-placement resolution on `Done`: if the member node is already present in tree (via live sync), treat it as success instead of throwing slot-filled errors.

- Why:
  - The previous forced sync could pre-place the new node before user confirmation, so pressing `Done` attempted a second placement and failed with `Left slot is already filled for this parent`.
  - New guard preserves the UX contract: placement confirmation remains tied to `Done`, and race conditions no longer produce duplicate-placement errors.

- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`

- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Follow-up Update (2026-04-15) - Account Overview Fast Track Live Sync (Server-Side Credit on Enrollment)

- Completed:
  - Added server-side Fast Track crediting for sponsor during successful member enrollment.
  - Enrollment transaction now increments sponsor `member_commission_containers.fasttrack_balance` using the same DB client transaction scope.
  - Added non-blocking Account Overview forced refresh after enrollment finalize in Binary Tree Next so commission cards reflect newest backend values faster.

- Why:
  - Account Overview Fast Track card reads from commission containers, but enrollments previously did not write Fast Track earnings into that source.
  - Result: enrolling nodes increased member records but Fast Track commission card stayed stale.

- Files updated:
  - `backend/services/member.service.js`
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`

- Design decisions:
  - Kept source of truth server-side by writing sponsor Fast Track credits at enrollment time.
  - Wrapped commission-container credit in safe error handling so enrollment does not fail if commission container storage is temporarily unavailable.
  - Triggered account-overview refresh as best-effort (non-blocking) to avoid impacting enrollment completion UX.

- Validation:
  - `node --check backend/services/member.service.js` passed.
  - `node --check binary-tree-next-app.mjs` passed.

## Follow-up Update (2026-04-15) - Admin Binary Tree Root Fix + Administrator Labeling

- Completed:
  - Forced admin tree viewer root resolution to global admin root (`LIVE_TREE_GLOBAL_ROOT_ID`) so admin mode cannot scope into a member node by session identity collision.
  - Forced admin global home node resolution to scoped `root` in admin mode.
  - Updated admin/global root node labels in live tree mapping to `Administrator` (name, username, title, role, rank badge).
  - Updated scoped root node generation for admin mode to always render admin identity as `Administrator`.
  - Updated session display name helper to return `Administrator` for admin source, preventing legacy `Charge Admin` naming from leaking into tree UI labels.

- Why:
  - Admin tree could appear broken when viewer identity resolved to a regular member node instead of admin root.
  - Label mismatch required the admin root identity to display as `Administrator` consistently.

- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`

- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Follow-up Update (2026-04-15) - Admin Binary Tree Mode Routing + Root Ownership

- Completed:
  - Updated admin dashboard navigation link to open Binary Tree with explicit admin source context: `/binary-tree-next.html?source=admin`.
  - Hardened Binary Tree Next admin source handling so admin mode always resolves to admin root and cannot bind viewer root to member identity fields.
  - Standardized admin root identity naming in tree UI to `Administrator`.

- Why:
  - Admin link previously omitted `source=admin`, which could boot member-mode logic and produce wrong root scoping and node identity.
  - Explicit routing + forced admin root resolution ensures admin node is always shown as top/root.

- Files updated:
  - `admin.html`
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`

- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Follow-up Update (2026-04-15) - Admin Account Overview Context Routing

### What changed
- Added a dedicated `resolveAccountOverviewPanelContext()` flow:
  - Admin + selected member node => account overview binds to selected node identity.
  - Admin + no selection/admin node/root => panel switches to system totals mode.
- Added scope-aware remote sync:
  - `identity` scope for member-specific snapshots.
  - `system` scope for aggregate snapshots from list endpoints.
- Added aggregate normalizers:
  - Binary Tree Metrics list -> single summary snapshot.
  - Sales Team Commissions list -> single summary snapshot.
- Added node mapping fields needed for selected-node identity fetches and totals display (`userId`, `email`, `packagePrice`, `fastTrackBonusAmount`).
- Updated Account Overview labels/values in system mode:
  - Active tile => `Administrator Mode` / `Exempt`.
  - Cycle tile => `Total Generated Revenue`.
  - Direct sponsors tile => `Total Members`.
  - E-wallet tile => `Total Commission Generated`.

### Business-rule alignment
- Administrator no longer appears as a normal commission-earning member in account-overview behavior.
- Admin panel now acts as monitor-first (system totals) unless explicitly inspecting a member node.

### Files updated
- `binary-tree-next-app.mjs`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`
- `Claude_Notes/binary-tree-next.md`

### Validation
- `node --check binary-tree-next-app.mjs` passed.

### Known limitation
- System commission total currently composes from available synced data in this page (sales-team aggregate + fast-track node totals + available remote balances). A single backend-wide consolidated financial summary endpoint is still optional follow-up.



## Update (2026-04-16) - Left Panel Personal BV + Real-Time Server Sync Refresh Trigger

### What Changed

- Added Personal BV directly below Total Organizational BV in the Binary Tree Next side metrics list.
- Updated Personal BV value source in side metrics to use current personal BV resolution instead of static node volume.
- Updated live member parsing to prefer explicit server-provided personal BV fields before fallback derivation.
- Extended live node signature hashing with personal BV fields so Personal BV server changes trigger immediate live-sync apply/re-render.
- Corrected Account Overview total-BV label copy to Total Organization BV.

### Files Affected

- binary-tree-next-app.mjs
- binary-tree-next.html

### Known Limitations

- Sync remains polling-based on the existing Binary Tree Next cadence (not websocket push).

### Validation

- node --check binary-tree-next-app.mjs passed.


## Update (2026-04-16) - Inactive/Dark-Gray Node Theme Enforcement + No Gray Active Profile Generation

### What Changed

- Added dedicated inactive gray palette and tightened directInactive to darker gray.
- Updated draw-path inactive branch to use inactive gray theme explicitly.
- Kept direct sponsors purple while active.
- Added activity-state hardening for color logic:
  - stabilizing status is treated as inactive
  - explicit isActive/active booleans are honored.
- Added gray-color filtering for active profile palette resolution:
  - source gray palette/color triplets are skipped for active palette generation
  - session avatar palette also skips gray profile colors.
- Removed gray from the active color rotation list so generated active profile colors no longer land on gray.
- Updated selected-details avatar rendering to follow same rule set (inactive gray/dark gray, no photo).

### Files Affected

- binary-tree-next-app.mjs

### Known Limitations

- This pass does not migrate stored profile-color values; it enforces runtime rendering behavior.

### Validation

- node --check binary-tree-next-app.mjs passed.

## [2026-04-16 01:49:19] Preferred Accounts Panel Integration (Binary Tree Next)

### Summary
- Added a dedicated Preferred Customers panel in Binary Tree Next with dynamic profile detail rendering and placement-plan saving.

### Implemented behavior
- New dock action panel:preferred-accounts:toggle.
- Panel visibility interoperability:
  - Opening Preferred panel closes Account Overview and My Store panels.
- Live data fetches:
  - Registered members (source-aware member/admin endpoint).
  - Store invoices for spend/BV aggregation.
- Current list selection updates profile detail section.
- Placement plan save persists server-side and refreshes panel data immediately.

### Data fields surfaced
- Total Spend (aggregated from matched invoices)
- Total BV Credited (aggregated invoice p)
- Preferred Subscriber Since (member created date)
- From (Direct Link / System Transfer)
- Placement Plan (Left/Right/Spillover/Extreme options)

### Follow-up checks
- Validate panel rows with accounts that have mixed invoice identity metadata.
- Validate admin-view behavior on datasets with large preferred-customer counts.
### Documentation Correction
- Corrected metrics wording: Total BV Credited is aggregated from invoice bp values.
- Corrected file naming references for Binary Tree Next implementation notes.

## Follow-up Update (2026-04-16) - Preferred Customers Visual Alignment + Current List Behavior

### What changed
- Matched Preferred Customers top profile text scale to Account Overview visual hierarchy.
- Reduced `Preferred Customer` subtitle size.
- Rebalanced profile field spacing and text sizing for improved legibility.
- Updated Current list to name-only rows (removed meta/spend line).
- Updated Current list avatars to render gradient + initials.
- Removed selected-profile icon output from render logic and panel markup flow.
- Kept Save Profile Plan centered.

### Files updated
- binary-tree-next.html
- binary-tree-next-app.mjs

### Validation
- node --check binary-tree-next-app.mjs passed.


## Follow-up Update (2026-04-16) - Preferred Panel Resize Render Guard

### What changed
- Added a protected Preferred panel sync block in `renderFrame()`:
  - `syncPreferredAccountsPanelPosition(state.layout)`
  - `syncPreferredAccountsPanelVisuals()`
  - `syncPreferredAccountsPanelVisibility()`
- Added throttled error logging for Preferred panel render-sync failures.

### Why
- Prevents Preferred-panel-only runtime errors during resize from breaking the overall frame loop and leaving a black tree canvas.

### Files updated
- binary-tree-next-app.mjs

### Validation
- node --check binary-tree-next-app.mjs passed.

## Follow-up Update (2026-04-16) - Preferred Panel Interaction Freeze Root-Cause Fix

### What changed
- Corrected Preferred-open path in `syncAccountOverviewPanelVisuals()` by removing invalid `options` scope usage.
- Added fail-safe protection in `tickFrame()` so render-loop exceptions are logged and recovered without stopping RAF.

### Why
- Prevents Preferred-panel visibility state from triggering frame-loop termination that made tree dragging appear broken.

### Files updated
- binary-tree-next-app.mjs

### Validation
- node --check binary-tree-next-app.mjs passed.

## Follow-up Update (2026-04-16) - Preferred Placement Save UX Improvements

### What changed
- Updated save flow to avoid blocking on full forced Preferred snapshot refresh.
- Added loading state animation on Save button (`is-loading` spinner).
- Added clearer save lifecycle notes:
  - saving note while request is in-flight
  - explicit success note after save.
- Added `is-success` feedback style.

### Why
- Improve save responsiveness and make save status clear to users.

### Files updated
- binary-tree-next-app.mjs
- binary-tree-next.html

### Validation
- node --check binary-tree-next-app.mjs passed.
