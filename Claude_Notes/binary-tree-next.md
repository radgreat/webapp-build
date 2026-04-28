# Binary Tree Next Notes

## Update (2026-04-24) - Profile Menu Logout Action Wired

### What Changed

- Fixed profile-menu logout action in binary-tree-next-app.mjs so it performs full sign-out.
- Added helpers to clear current-source auth storage + cookie and resolve source login path.
- Updated triggerAction for brand-menu:action:logout to:
  - close menu/dropdowns
  - clear current auth snapshot
  - clear in-memory session
  - redirect to /login.html (member) or /admin-login.html (admin).

### Files Affected

- binary-tree-next-app.mjs

### Validation

- node --check binary-tree-next-app.mjs passed.

## Update (2026-04-24) - Desktop Profile Icon Placement Scoped Correctly

### What Changed

- Updated drawSideNav so the search-row profile icon renders only on mobile.
- Desktop search row no longer places the profile icon inside the left panel.
- Added desktop floating profile avatar button rendering in drawBottomToolBar on the right side of the screen.
- Wired desktop floating profile avatar as the profile menu anchor while preserving mobile in-panel profile behavior.

### Files Affected

- binary-tree-next-app.mjs

### Validation

- node --check binary-tree-next-app.mjs passed.

## Update (2026-04-24) - Search Overlay Clipping Fix While Mobile Panel Scrolls

### What Changed

- Fixed a mobile mismatch where the DOM search input text could remain visible above the handle area while the canvas search bar scrolled under it.
- Added sideNavSearchInputClipRect state and synchronized it from drawSideNav for hidden, closed, and expanded states.
- Updated syncSideNavSearchInput to clip the fixed DOM input against the visible panel content viewport.
- Added dropdown visibility gating so results only render when the search field is fully visible.

### Files Affected

- binary-tree-next-app.mjs

### Validation

- node --check binary-tree-next-app.mjs passed.

## Update (2026-04-24) - Outside Mobile Controls Animated for Half -> Full Transition

### What Changed

- Updated drawBottomToolBar(...) in binary-tree-next-app.mjs to animate outside mobile controls during center sheet expansion.
- Replaced hard full-stage hide checks with expansion-progress-based reveal:
  - controls now fade smoothly as sheet moves from half to full.
- Added row animation options to outside control drawer:
  - alpha fade
  - slight vertical offset during hide.
- Applied animation to all outside mobile control groups:
  - top-right shortcut row
  - external navigation row
  - top-controls show/hide toggle.
- Removed full-stage square-corner morph on the outside top button row so border radius stays consistently rounded while fading.
- Added alpha-threshold hitbox gating so nearly hidden controls are not still tappable.

### Files Affected

- binary-tree-next-app.mjs

### Validation

- node --check binary-tree-next-app.mjs passed.

## Update (2026-04-24) - Mobile Apple Maps UX Pass (Closed/Half/Full Sheet + Touch Controls)

### What Changed

- Added mobile viewport sheet architecture in `binary-tree-next-app.mjs` for the left panel:
  - upgraded to `closed` + `half` + `full` snap stages
  - exact snap translate progress:
    - full `0`
    - half `0.5`
    - closed `~0.92`
  - mobile handle control now supports continuous drag-follow + tap transitions
  - release snapping now uses velocity projection + nearest snap resolution
  - spring physics settle animation for non-linear iOS-like motion
  - mobile side panel forced open as primary center sheet surface
  - full stage expands to near full-screen width/height with safe insets.
- Moved profile action/avatar back into the search row (next to search) and removed floating top-right profile placement.
- Added touch interaction support:
  - multi-touch tracking
  - two-finger pinch zoom and center pan behavior
  - touch cleanup guards for pointer up/cancel/leave.
- Added accidental browser navigation mitigation on touch devices:
  - edge-origin horizontal-swipe suppression via `bindTouchNavigationGuard()`
  - active-gesture `touchmove` prevent-default guard (`passive: false`) while sheet/canvas gestures are active
  - `overscroll-behavior` and touch-scroll CSS adjustments in `binary-tree-next.html`.
- Added sheet-expansion dim backdrop behavior:
  - dim strength increases as sheet moves from closed -> half -> full.
- Updated mobile positioning logic so overlay panels center correctly on mobile:
  - Enroll Member panel
  - Account Overview panel
  - Infinity Tier Commission panel
  - Rank Advancement / Legacy panel surface
  - Preferred Accounts panel
  - My Store panel.

### Files Affected

- `binary-tree-next-app.mjs`
- `binary-tree-next.html`

### Validation

- `node --check binary-tree-next-app.mjs` passed.
- mobile screenshot sanity pass captured on localhost (`screenshot.mjs`) in this repo.

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
    - infinity tier commission
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

## Follow-up Update (2026-04-16) - Rank Advancement and Good Life Unified Panel

### What changed

- Added new Rank Advancement panel markup/CSS in `binary-tree-next.html` to match the existing Account Overview panel visual system.
- Implemented Rank Advancement runtime in `binary-tree-next-app.mjs`:
  - rank milestone extraction and fallback model
  - milestone icon ladder rendering with Brand Assets icons
  - run target vs current earned reward modeling
  - Good Life monthly bonus merge into the same panel
  - rank-claim handling via achievements claim endpoint.
- Added panel lifecycle integration:
  - position/visibility/visual sync in render loop
  - initialization during bootstrap
  - panel toggle action and dock button active state.
- Added cross-panel behavior:
  - opening Rank Advancement closes other right-side panels
  - opening Preferred/My Store closes Rank Advancement.
- Added snapshot reset/refresh hooks for session/storage changes and upgrade/enrollment refresh flows.

### Files updated

- `binary-tree-next.html`
- `binary-tree-next-app.mjs`

### Design decisions

- Maintained Account Overview visual language for consistency.
- Kept rank run target (next milestone) separate from earned reward card (highest reached run rank), matching requested behavior.

### Known limitations

- Member requirement line uses rank-based display mapping when backend payload does not include explicit member-count requirement fields.
- Screenshot comparison loop skipped for this update per user instruction.

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Follow-up Update (2026-04-16) - Rank Advancement Bug Fix Pass

### What changed

- Fixed claim button state flicker by introducing dedicated claim-in-flight handling and removing sync-driven button text/color toggling.
- Added payload-cache based snapshot refresh behavior so transient API misses do not temporarily degrade panel state.
- Adjusted run-rank resolver to prevent reward rank from advancing beyond cycle-reached milestone when eligibility payload is ahead of cycle progress.
- Updated requirement label mapping:
  - Black Diamond -> `1 Blue Diamond Member`
  - direct sponsor line now includes `50 Personal BV each`.
- Removed extra reward-icon backdrop container in the monthly rewards card and kept icon-only enlarged rendering.
- Enforced Good Life bonus fallback values only for Diamond+ ranks.

### Files updated

- `binary-tree-next-app.mjs`
- `binary-tree-next.html`

### Validation

- `node --check binary-tree-next-app.mjs` passed.

### Addendum (2026-04-16)

- Post-claim cache synchronization added: successful claim and good-life responses now refresh local Rank Advancement caches before UI snapshot rebuild.

## Follow-up Update (2026-04-16) - Rank Advancement Requirement-Selection and Reward-State Alignment

### What changed

- Added rank milestone icon selection behavior in the Rank Advancement panel.
  - Clicking any rank icon now switches the upper requirement summary to that selected rank.
- Reworked monthly reward-summary source logic:
  - reward card now reflects highest reached rank for the current month
  - if no rank reached yet, card shows pending/wait-next-month messaging.
- Updated progress-fill computation:
  - moved from cycles-only interpolation to requirement-checkpoint aware progression
  - fill only crosses milestone threshold once that milestone is considered met.
- Good Life block visibility updated:
  - hidden for Ruby/Emerald/Sapphire
  - shown for Diamond and above.

### Files updated

- `binary-tree-next-app.mjs`
- `binary-tree-next.html`

### Validation

- `node --check binary-tree-next-app.mjs` passed.

### Addendum (2026-04-16)

- Member-rank prerequisite logic is now enforced in the Rank Advancement panel progression model.
- Highest reached rank display no longer advances if required prerequisite member ranks are missing in-network.
- Rank icon selection now updates instantly via immediate cached-snapshot rebuild.
- Requirement rows now use concise labels and met-state indicators (green + checkmark).

Validation:
- `node --check binary-tree-next-app.mjs` passed.

### Addendum (2026-04-16)

- Rank selection heading updated to `Rank Preview`.
- Requirement rows in preview mode now intentionally render neutral (gray, no checkmarks).
- Standard progression mode still uses met-state indicators (green + checkmark).

Validation:
- `node --check binary-tree-next-app.mjs` passed.

### Addendum (2026-04-16)

- Rank Preview now preserves met-state visuals for already passed ranks.
- Passed-rank previews show requirement rows in green with checkmark identifiers.
- Unpassed rank previews remain neutral gray without checkmarks.

Validation:
- `node --check binary-tree-next-app.mjs` passed.

### Addendum (2026-04-16)

- Improved selected-rank UI on the Rank Advancement ladder:
  - higher-contrast yellow selector ring
  - yellow selected stem
  - `Selected` marker chip for the active rank icon.
- Added `Acquired since <date>` to Rank Preview for already passed selected ranks.
- Acquired date source order:
  - milestone `claimedAt` first
  - fallback to rank-run period month start when timestamp is unavailable.

Validation:
- `node --check binary-tree-next-app.mjs` passed.
- `node --check backend/services/member-achievement.service.js` passed.

### Addendum (2026-04-16)

- Rank ladder selected badge now shows the selected rank name (for example `Emerald`, `Diamond`) instead of the generic `Selected` text.

Files updated:
- `binary-tree-next.html`
- `binary-tree-next-app.mjs`

Validation:
- `node --check binary-tree-next-app.mjs` passed.

### Addendum (2026-04-16)

- Added rank-ladder `You are here` marker to identify the member's current rank independently from selected preview rank.

Files updated:
- `binary-tree-next-app.mjs`
- `binary-tree-next.html`

Validation:
- `node --check binary-tree-next-app.mjs` passed.

### Addendum (2026-04-16)

- Rank Preview now includes payout previews per selected rank:
  - rank reward amount
  - Good Life bonus amount (Diamond+ only).

Files updated:
- `binary-tree-next.html`
- `binary-tree-next-app.mjs`

Validation:
- `node --check binary-tree-next-app.mjs` passed.

### Addendum (2026-04-16)

- Updated Rank Advancement rank-preview payout label text: `Reward Preview` -> `Rank Bonus`.

Files updated:
- `binary-tree-next.html`
- `binary-tree-next-app.mjs`

Validation:
- `node --check binary-tree-next-app.mjs` passed.

### Addendum (2026-04-16)

- Updated Good Life label copy to `Good life Bonus` (requested casing) in Rank Advancement preview and reward card.

Files updated:
- `binary-tree-next.html`
- `binary-tree-next-app.mjs`

Validation:
- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-16) - Infinity Tier Commission Panel Added to Binary Tree Next

### What Changed

- Added a new Infinity Tier Commission panel in `binary-tree-next.html`.
- Added panel runtime wiring in `binary-tree-next-app.mjs`:
  - DOM refs
  - state integration (`infinityBuilderVisible`)
  - panel position + visibility + visual sync
  - initialization and close behavior.
- Connected Account Overview Track Commissions action:
  - clicking `Infinity Tier Commission` card opens the new Infinity panel.
- Added panel interop/exclusivity:
  - opening Infinity panel closes Account Overview, Rank Advancement, Preferred Accounts, and My Store
  - opening those panels closes Infinity panel.
- Added optional query opener support:
  - `?panel=infinity-builder`.

### Infinity Panel Data/UX Behavior

- Uses live Binary Tree Next data (`state.nodes`) instead of placeholder-only nodes.
- Seeds are grouped by Infinity-qualified direct enrollments (Infinity/Legacy package).
- `Current` list renders tier rows oldest-to-new and supports tier selection.
- Selected tier renders a trinary node section:
  - 3 seed nodes
  - each seed shows 3 child nodes
  - initials shown on profile circles.
- Node color state follows existing active/inactive gate logic (`resolveNodeActivityState(...)`).
- Per-seed 1% override estimate is shown from node organization BV.
- Tier completion and `$150` tier reward status are rendered.
- Tier claimed state reads from commission-container Infinity claim map when available.

### Files Affected

- `binary-tree-next.html`
- `binary-tree-next-app.mjs`

### Validation

- `node --check binary-tree-next-app.mjs` passed.
- screenshot comparison iterations:
  - `temporary screenshots/screenshot-201-infinity-auth-pass1.png`
  - `temporary screenshots/screenshot-202-infinity-auth-pass2.png`

### Addendum (2026-04-16) - Infinity Builder UI Refinement (Scale + Connector Consistency + Monthly Copy)

- Reduced Infinity panel visual scale to better match requested compactness:
  - smaller tier/current headings
  - smaller node cores/children
  - smaller BV + payout text sizing
  - reduced current-list row/seed sizing and padding.
- Reworked node connector styling to fix inconsistent line appearance:
  - unified branch stroke to crisp 1px lines
  - consistent center stem, horizontal branch, and child stems.
- Corrected payout wording and scope in Infinity UI:
  - 1% override is now labeled as **monthly**
  - payout labels now include `/ month`
  - copy clarifies payout uses each seed member's personal organization BV only (not whole-tree shared totals).

Files updated:
- `binary-tree-next.html`
- `binary-tree-next-app.mjs`

Validation:
- `node --check binary-tree-next-app.mjs` passed.
- Visual screenshot pass was skipped on request.

### Addendum (2026-04-16) - Infinity Tier Card Conflict Resolution

- Resolved the tier-card conflict in Infinity Builder UI logic:
  - changed tier completion from `3 completed seed overrides` to `3 enrolled Infinity/Legacy seeds`.
  - tier progression/unlock now follows seed enrollment completion per tier.
- Retained and clarified the override condition:
  - seed-level 1% monthly activates only when that specific seed duplicates to 3 active direct child enrollments.
  - base remains that seed's personal organization BV (not whole-tree shared BV).
- Updated panel messaging and tier subtitle/bonus text to reflect this split rule (tier completion vs override activation).

Files updated:
- `binary-tree-next-app.mjs`
- `binary-tree-next.html`

Validation:
- `node --check binary-tree-next-app.mjs` passed.

### Addendum (2026-04-16) - Infinity Panel UX Corrections Requested

- Applied requested user-facing text cleanup:
  - removed dev terminology in Infinity tier messaging where surfaced to users
  - removed empty-slot message `Awaiting Infinity-qualified enrollment`.
- Added missing panel navigation control:
  - `Back to Account Overview` control in Infinity header
  - action now returns user to Account Overview panel.
- Added missing tier-card claim action:
  - claim button and live feedback under tier summary
  - claim state now reflects locked/claimable/claimed/in-flight states
  - claim updates persisted via commission-container claim-map write path.
- Adjusted scroll model for scale:
  - only `Current` section list scrolls
  - panel header and selected tier card section stay fixed for context.

Files updated:
- `binary-tree-next.html`
- `binary-tree-next-app.mjs`

Validation:
- `node --check binary-tree-next-app.mjs` passed.
- Visual screenshot iteration skipped as requested.

### Addendum (2026-04-16) - Breadcrumb Formatting Update

- Replaced Infinity header back label with explicit breadcrumb presentation:
  - `Account Overview > Infinity Tier Commission`
- Preserved clickable back behavior on `Account Overview` crumb.

Files updated:
- `binary-tree-next.html`

Validation:
- `node --check binary-tree-next-app.mjs` passed.

### Addendum (2026-04-17) - Infinity Node UX Consistency Pass

- Completed requested Infinity panel consistency upgrades:
  - node gradients now stay member-synced (active + muted inactive variant)
  - connector lines now render as a continuous branch path touching node points
  - panel node click now calls tree focus behavior for that exact member node
  - username labels are visible in tier cards and Current list node entries.
- Added keyboard activation for focusable tier node avatars.
- Added guard so Current row tier selection does not hijack direct node-focus clicks.

Files updated:
- binary-tree-next-app.mjs
- binary-tree-next.html

Validation:
- node --check binary-tree-next-app.mjs passed.

### Addendum (2026-04-17) - Infinity Child Node Username Density

- Removed rendered username handles from small trinary child nodes in the Infinity panel to avoid cramped spacing.
- Preserved child-node focus target behavior and hover title.

Files updated:
- binary-tree-next-app.mjs

Validation:
- node --check binary-tree-next-app.mjs passed.

### Addendum (2026-04-17) - Infinity Small-Node Line Tidy

- Cleaned Infinity child connector rendering by trimming branch width to child-node center points and reducing child stem length.
- Result: fewer excess line tails around the small node row.

Files updated:
- binary-tree-next.html

### Addendum (2026-04-17) - Infinity Avatar Click Reliability

- Fixed avatar click reliability issue by broadening focus-target wrappers and using robust event-target element resolution.
- Added fallback focus-id resolution via username lookup when direct node id is unavailable.
- Result: clicking around the avatar/profile region now consistently triggers tree focus.

Files updated:
- binary-tree-next-app.mjs
- binary-tree-next.html

Validation:
- node --check binary-tree-next-app.mjs passed.

### Addendum (2026-04-17) - Legacy Leadership Panel Mode Added

What changed:
- Extended Binary Tree Next bonus panel to support a second mode for `Legacy Leadership Bonus`.
- Added mode routing from Account Overview commission buttons:
  - Infinity opens Infinity Builder mode
  - Legacy opens Legacy Leadership mode
- Added mode-specific title/breadcrumb/description rendering for the shared panel shell.
- Implemented Legacy snapshot builder logic:
  - Legacy-only nodes (`legacy-builder-pack`)
  - tier grouping by 3 direct seeds
  - mapped descendant support through depth 3 (0-3 hierarchy)
  - tier progression target of 40 nodes
  - one-time reward claim flow (no monthly 1% text/logic in Legacy mode)
- Added Legacy claim-map container support:
  - read: `legacyleadership` + `legacyLeadership`
  - write: `legacyleadership`
- Added Legacy descendant visual rows (depth-2 and depth-3 dot rows) below seed cards.
- Added panel deep-link support for query param `panel=legacy-leadership`.

Files updated:
- `binary-tree-next-app.mjs`
- `binary-tree-next.html`

Design/logic decisions:
- Reused the existing Infinity panel framework to keep UX parity and reduce duplicated UI wiring.
- Kept claim/reward amount parity with existing tier reward constant while switching Legacy messaging to one-time reward language.
- Preserved node focus interactions across all rendered node dots.

Known limitations:
- Screenshot matching cycle was skipped in-session per user instruction.
- Final visual parity still depends on authenticated data-state validation in the running app.

Validation:
- `node --check binary-tree-next-app.mjs` passed.

### Addendum (2026-04-17) - Legacy Reward + Real-Node Rendering Alignment

What changed:
- Updated Binary Tree Next Legacy panel reward logic so it no longer reuses Infinity's fixed `$150` tier amount.
- Legacy tier reward fallback is now set to one-time `2000 USD` (Legacy mode only), while Infinity remains `150 USD`.
- Legacy tier totals now sum per-tier reward values directly from tier snapshots (supports claim-map amount overrides).
- Removed non-reference text under Legacy tier nodes in the top panel card (no node-count/username/status lines under each node card).
- Removed visible username handles from Legacy `Current` row node dots.
- Prevented synthetic fallback initials for Legacy snapshots when node identity text is missing.

Files updated:
- `binary-tree-next-app.mjs`

Validation:
- `node --check binary-tree-next-app.mjs` passed.

Known limitations:
- Screenshot parity pass skipped per user instruction.

### Addendum (2026-04-17) - Legacy Node Line Structure (Depth-Mapped Branches)

What changed:
- Reworked Legacy snapshot grouping so depth nodes preserve parent-based structure instead of flat-only arrays.
- Added grouped snapshot fields for Legacy rendering:
  - `depthTwoGroupSnapshots` (3 groups x 3 nodes)
  - `depthThreeGroupSnapshots` (9 groups x 3 nodes)
- Updated Legacy tier renderer to draw grouped branch grids with connector lines for depth 2 and depth 3.
- Kept fallback chunking so older snapshots without grouped fields still render.
- Legacy cards now carry `is-legacy-mode` styling hook for branch-layout specific CSS.

Files updated:
- `binary-tree-next-app.mjs`
- `binary-tree-next.html`

Validation:
- `node --check binary-tree-next-app.mjs` passed.

Known limitations:
- Screenshot verification intentionally skipped per user instruction.

### Addendum (2026-04-17) - Legacy 4th-Level Initials + Spacing Expansion

What changed:
- Expanded Legacy branch canvas width so deeper mapped structure has more room.
- Reworked depth-3 grid spacing to 3-column grouped layout with row spacing (instead of ultra-compressed 9-column group strip).
- Enabled initials rendering on depth-3 (4th-level) nodes.
- Preserved click-to-focus behavior for depth-3 nodes by keeping focus dataset wiring and keyboard focusability.

Files updated:
- `binary-tree-next-app.mjs`
- `binary-tree-next.html`

Validation:
- `node --check binary-tree-next-app.mjs` passed.

### Addendum (2026-04-17) - Legacy Layout Rollback + Compact 4th-Level Node Pass

What changed:
- Rolled back the last Legacy spacing expansion that widened the full node-card structure.
- Restored prior Legacy mapped layout geometry:
  - branch width back to compact baseline
  - children/depth grids back to compact baseline
  - depth-3 rendered as mapped 9-column strip per grouped branch model.
- Preserved depth-3 node clickability and focus behavior.
- Depth-3 now shows compact initials (up to 2 chars) with minimal visual expansion to avoid layout shift.

Files updated:
- `binary-tree-next-app.mjs`
- `binary-tree-next.html`

Validation:
- `node --check binary-tree-next-app.mjs` passed.

Known limitations:
- Screenshot parity pass skipped per user instruction.

### Addendum (2026-04-17) - Legacy Node Breathing Room Expansion (Level 1-4)

What changed:
- Expanded Legacy layout spacing from root (level 1) through 4th-level mapped nodes:
  - branch width and height increased
  - child row width increased
  - depth-grid width increased
  - depth-2/depth-3 gaps increased
  - connector stems and top offsets increased for clearer structure.
- Increased depth-2/depth-3 mapped node dot size slightly to reduce visual crowding and improve initials visibility.
- Kept 4th-level node click/focus behavior intact.

Files updated:
- `binary-tree-next.html`

Known limitations:
- Screenshot parity pass skipped per user instruction.

### Addendum (2026-04-17) - Legacy Breathing Room Expansion v2

What changed:
- Increased Legacy level-1 to level-4 structure width substantially (desktop + compact).
- Expanded mapped depth grid spacing and connector spacing so 4th-level nodes no longer sit tightly packed.
- Slightly increased depth node sizing to improve initials legibility without removing mapped structure.

Files updated:
- `binary-tree-next.html`

Known limitations:
- Screenshot parity pass skipped per user instruction.

### Addendum (2026-04-17) - Legacy Visual Hierarchy Fix (Simple 3-Tier Sizing)

What changed:
- Implemented explicit Legacy node hierarchy sizing to match intent:
  - largest: root node
  - smaller: second-level nodes
  - smallest: deeper mapped nodes.
- Increased spacing rails and connector spacing through depth to prevent cramped stacking.
- Updated deeper mapped-group layout to provide breathing room while preserving mapped structure and node interactivity.

Files updated:
- `binary-tree-next.html`

Known limitations:
- Screenshot parity pass skipped per user instruction.

### Addendum (2026-04-17) - User Requested Simplification Pass (No Grid)

What changed:
- Removed Legacy depth-grid rendering from tier cards per updated direction.
- Added user initials rendering consistently on panel node circles.
- Added Current-list right-side progress counters:
  - Legacy tiers now show mapped progress against `40` node requirement.
  - Infinity tiers now show direct fill progress against `3` seed requirement.
- Updated qualification logic to exclude spillovers in both Legacy and Infinity bonus calculations.
- Updated Legacy progress math to avoid extra +1 baseline, aligning displayed counts with mapped-node fill intent.
- Preserved click-to-focus behavior and gradient background assignment from Binary Tree node palettes.

Files updated:
- `binary-tree-next-app.mjs`
- `binary-tree-next.html`

Known limitations:
- Screenshot parity pass skipped per user instruction.

### Addendum (2026-04-17) - User-Requested Rollback Corrections

What changed:
- Fixed Current-list stretch regression causing oversized list item height when only one row is present.
- Reverted unintended Infinity Builder changes from previous pass:
  - Infinity no longer inherits Legacy-only no-spillover filter behavior.
  - Infinity Current rows no longer show right-side `x/y` progress.
- Reduced Legacy tier-card geometry (root/child span and node sizing) to undo oversizing.

Files updated:
- `binary-tree-next-app.mjs`
- `binary-tree-next.html`

Known limitations:
- Screenshot parity pass skipped per user instruction.

### Addendum (2026-04-17) - Legacy/Infinity Sponsor Qualification Parity Fix

What changed:
- Aligned Binary Tree Next tier qualification behavior with User Dashboard sponsor semantics.
- Legacy mode no longer excludes all spillover nodes by default.
- Qualification now uses sponsor ownership:
  - personally sponsored enrollments qualify (even when placement is spillover),
  - externally sponsored spillover placements do not qualify as your directs.
- Hardened package-key reads for qualification checks using:
  - enrollmentPackage
  - enrollment_package
  - packageKey
  - package_key
- Updated direct-seed sponsor matching to prefer preserved sourceSponsorId when available so scoped-tree remaps do not misattribute direct ownership.

Files updated:
- binary-tree-next-app.mjs

Known limitations:
- No screenshot pass was run in this logic-focused update.

### Addendum (2026-04-17) - Bonus Panel Node Color Sync + Gray Empty Slots

What changed:
- Synced Infinity/Legacy bonus panel node colors to Binary Tree Next avatar-color rules so the same user keeps the same color identity across views.
- Updated panel node background resolver to follow Binary Tree variant behavior:
  - direct personally enrolled nodes use direct/directInactive tones,
  - inactive nodes use inactive tones,
  - regular nodes use standard per-user palette resolution.
- Enforced empty/new-tier node slots as gray placeholders.

Files updated:
- binary-tree-next-app.mjs
- binary-tree-next.html

Known limitations:
- No screenshot comparison pass was run in this logic/style consistency update.
### Addendum (2026-04-17) - Infinity/Legacy Connector Line Alignment Cleanup

What changed:
- Cleaned connector-line alignment in the bonus panel node tree by switching the horizontal connector math from fixed pixel offsets to proportional width-based offsets.
- Updated horizontal branch connector to use left/right equal to one-sixth of container width so endpoints align with first/third child node centers across both normal and legacy widths.
- Adjusted child vertical stem start offset by -1px so vertical stems connect cleanly to the branch line.

Files updated:
- binary-tree-next.html

Known limitations:
- Screenshot verification could not be completed because the screenshot process required elevated execution and permission was not granted.
### Addendum (2026-04-17) - Legacy Subtitle Text Removal Above Tier Panel

What changed:
- Removed the Legacy mapped-progress subtitle string from the panel header area when direct requirement is met.
- The sentence "3/40 mapped Legacy nodes completed (depth 0-3). 37 nodes remaining." no longer renders above the panel.

Files updated:
- binary-tree-next-app.mjs

Known limitations:
- No screenshot validation run in this pass.
### Addendum (2026-04-17) - Legacy Tier `View Tree` Canvas Mode (Per-Tier 40 Nodes)

What changed:
- Added a Legacy-only `View Tree` action button inside the Legacy Leadership tier panel actions.
- Added a dedicated Legacy Tier canvas render mode that projects one selected Legacy tier at a time.
- Implemented fixed per-tier trinary structure on canvas: `1 + 3 + 9 + 27 = 40` nodes.
- Mapped canvas levels directly from selected-tier snapshot data:
  - depth 0: account/home root
  - depth 1: selected tier seed nodes (3)
  - depth 2: seed child nodes (9)
  - depth 3: grouped next-level nodes (27)
- Added placeholder slot generation so missing nodes still render in structure.
- Empty slots now render as gray inactive placeholders in canvas for consistency with panel behavior.
- Added a lightweight canvas header badge showing the active tier and `40 nodes (1-3-9-27)`.

Interaction/behavior decisions:
- `View Tree` toggles to `Hide Tree` while active.
- Tree view follows the currently selected Legacy tier.
- Node click selection remains enabled in the tier canvas view.
- Blank-canvas drag and wheel zoom/pan are suppressed while tier view is active to keep the fixed 40-node layout stable.

Files updated:
- `binary-tree-next-app.mjs`
- `binary-tree-next.html`

Validation:
- `node --check binary-tree-next-app.mjs` passed.
- Screenshot validation blocked in sandbox (`spawn EPERM`).

### Addendum (2026-04-17) - Legacy `View Tree` Action Wiring Fix (No Toggle)

What changed:
- Removed toggle semantics from the Legacy panel `View Tree` control.
- Updated panel action button behavior to remain a one-way `View Tree` label in Legacy mode.
- Rewired the button click handler from stale `toggleLegacyTierCanvasView()` to `viewLegacyTierCanvasTree()`.
- Preserved the animated enter-view flow before rendering the selected tier's 40-node trinary canvas map.

Files updated:
- `binary-tree-next-app.mjs`

Known limitations:
- No screenshot validation in this follow-up pass.

### Addendum (2026-04-17) - Legacy Panel `View Tree` Responsiveness Hardening

What changed:
- Hardened Legacy `View Tree` action flow to avoid dead-click behavior during early panel data timing.
- Added shared `syncInfinityBuilderViewTreeButtonState(...)` helper and wired it into mode/visibility/visual sync paths so button state is immediately consistent in Legacy mode.
- Added `resolveInfinityBuilderSelectedTierFromSnapshot(...)` helper to keep selected-tier resolution consistent and resilient.
- Updated `viewLegacyTierCanvasTree()`:
  - forces Legacy mode if needed,
  - retries context resolution using cached panel snapshot + visual sync fallback,
  - wraps delayed open callback in error-safe handling,
  - schedules immediate render refresh after successful open.
- Updated Legacy panel visibility open path to remove lingering `is-positioning` class immediately, preventing temporary non-clickable behavior.
- Updated `View Tree` click listener to prevent bubbling conflicts and retry panel visual sync if open preconditions are temporarily unavailable.

Files updated:
- `binary-tree-next-app.mjs`

Known limitations:
- No screenshot validation in this follow-up pass.

### Addendum (2026-04-17) - Legacy `View Tree` Click Interception Root-Cause Fix

What changed:
- Identified root cause: hidden side panels (Rank Advancement / Preferred Accounts / My Store / Account Overview variants) were still intercepting pointer hit-tests through descendants while visually hidden.
- Added a shared CSS guard so any panel in `.is-hidden` or `.is-positioning` forces `pointer-events: none !important` on all descendants.
- This unblocks true pointer interaction with visible Infinity/Legacy panel controls, including `View Tree`.

Verification performed:
- Logged-in browser repro with user-provided test account.
- Confirmed pre-fix hit target at `View Tree` center was a hidden Rank Advancement milestone element.
- Confirmed post-fix hit target is the actual `#tree-next-infinity-builder-view-tree` button.
- Confirmed click handler invocation increments and canvas switches to the Legacy trinary map view after click.

Files updated:
- `binary-tree-next.html`

Known limitations:
- This pass focuses on interaction layer correctness; no visual restyling changes were made.

### Addendum (2026-04-17) - Legacy View Persistence + Canvas Control Restore

What changed:
- Updated Legacy Leadership close behavior so closing the Legacy Bonus panel no longer exits the Legacy tier canvas map view.
- Removed Legacy-view interaction guardrails that blocked blank-canvas drag and wheel interactions.
- Legacy tier map now supports normal canvas navigation controls (pan/zoom) while active, even after panel close.
- Repositioned the Legacy map context badge from top-left to top-right safe area to avoid being hidden under left panel UI.

Files updated:
- `binary-tree-next-app.mjs`

Known limitations:
- This pass focuses on interaction/positioning behavior; no tier math changes were made.

### Addendum (2026-04-17) - Legacy Trinary Node Depth-Size Upgrade

What changed:
- Updated Legacy trinary canvas node sizing to follow Binary Tree depth-decay logic rather than a generic fixed-size ladder.
- Added dedicated Legacy trinary depth-scale constants:
  - `LEGACY_TIER_CANVAS_RADIUS_DEPTH_DECAY = 0.56`
  - `LEGACY_TIER_CANVAS_WORLD_RADIUS_MIN = 0.0002`
- Refactored `resolveLegacyTierCanvasFrame(...)` radius calculation:
  - base size per depth now derives from `NODE_RADIUS_BASE * decay^depth`,
  - per-depth slot-width caps prevent overlap on narrower screens,
  - world projection remains camera-relative so zoom/pan scaling behavior stays consistent with Binary Tree controls.

Files updated:
- `binary-tree-next-app.mjs`

Known limitations:
- Automated interactive screenshot validation for click-into-View-Tree + pan/zoom flow is pending due sandbox elevation denial for custom Puppeteer scripts.

### Addendum (2026-04-17) - Legacy Trinary Connector Geometry Realignment

What changed:
- Fixed trinary branch centering issue by switching Legacy node X layout from global row slots to parent-relative trinary branch offsets.
- Children now resolve as explicit `left / middle / right` around each parent, which keeps connector trunks centered.
- Shortened connector appearance by compressing Legacy depth Y positions using fixed depth ratios instead of full-height equal spacing.
- Kept the existing connector draw function; line quality improvement comes from corrected node coordinate math.

Files updated:
- `binary-tree-next-app.mjs`

Known limitations:
- Final visual preference for exact connector length may still need one tuning pass after user QA.

### Addendum (2026-04-17) - Legacy Trinary Compact-Line + Header Interaction + Exit-to-Binary Controls

What changed:
- Reduced Legacy trinary vertical level spread again to make connector lines substantially shorter.
- Updated level Y mapping to `[0.04, 0.20, 0.33, 0.45]` for a compact tree presentation.
- Repositioned Legacy trinary info control card to center-top of the workspace.
- Center-aligned header title/subtitle content.
- Made center-top header card clickable to toggle Legacy Leadership panel show/hide.
- Updated control routing so Home and Back actions exit trinary mode and return to Binary default/home view when trinary is active.

Files updated:
- `binary-tree-next-app.mjs`

Known limitations:
- Visual tuning may still need one minor pass if even shorter connector lengths are preferred after in-app review.

### Addendum (2026-04-17) - Legacy Header Visual Centering Adjustment

What changed:
- Updated Legacy top header placement to account for side panel visibility:
  - side panel hidden: true center placement,
  - side panel open: header center shifts right to the visible tree workspace center.
- This removes the perceived “off-center” feel caused by static centering against full canvas width.

Files updated:
- `binary-tree-next-app.mjs`

Known limitations:
- Final micro-alignment preference may still require a tiny offset tweak after live UX validation.

### Addendum (2026-04-17) - Legacy Header Breadcrumb-Only-On-Enter Behavior

What changed:
- Removed the `40 nodes (1-3-9-27)` subtitle from the Legacy top header.
- Header subtitle now behaves by node depth:
  - at root: shows panel toggle hint,
  - when deeper node is entered/selected: shows breadcrumb path (`Root > User 1 > User 2` style).
- Header corner radius updated from `12` to `18` to better match the rounded UI theme.
- Header render path now uses active Legacy frame context so breadcrumb reflects current selected node chain.

Files updated:
- `binary-tree-next-app.mjs`

Known limitations:
- Breadcrumb is selection-driven in Legacy mode; if selection is forced back to root, subtitle returns to hint mode.

### Addendum (2026-04-17) - Top Header Mode Split (Per Clarified UX)

What changed:
- Reconciled header behavior to match clarified requirement:
  - Legacy Trinary View: top header is only for toggling Legacy Leadership panel visibility.
  - Binary Local/Universe View: top header is breadcrumb surface with clickable crumb links.
- Added local-universe detection and conditional breadcrumb header rendering in non-legacy mode.
- Reused existing universe breadcrumb link renderer so crumb click actions route through standard `universe:goto:<id>` behavior.
- Removed legacy subtitle breadcrumb substitution so trinary header remains functionally focused on panel toggle.

Files updated:
- `binary-tree-next-app.mjs`

Known limitations:
- Breadcrumb panel title text is currently static (`Node Universe Breadcrumb`) and can be renamed to your preferred copy.

### Addendum (2026-04-17) - Binary Breadcrumb Converted to History Node Chips

What changed:
- Upgraded Binary local breadcrumb to render real node chips instead of generic text crumbs.
- Each breadcrumb chip now shows:
  - the node avatar (color-driven, photo disabled for color consistency),
  - initials overlay,
  - username label under the avatar.
- Navigation logic now follows entered-history order from `state.universe.history` rather than ancestor depth derivation.
- Added history-index click action routing:
  - `universe:history:goto:<index>` -> `gotoUniverseFromHistoryIndex(...)`.
- Updated header card to fit chip layout (`cardHeight` increased) and relabeled to `Navigation History`.

Files updated:
- `binary-tree-next-app.mjs`

Known limitations:
- Username labels are truncated for long handles to keep chip spacing readable.

### Addendum (2026-04-17) - Binary History Breadcrumb Restyled to User Mock

What changed:
- Restyled Binary local breadcrumb surface to a clean white capsule container with no drop-shadow treatment.
- Removed the previous Navigation History heading from the panel.
- Adjusted breadcrumb chip rendering to align with the provided mock:
  - larger circular node avatars,
  - username labels beneath each avatar,
  - simple > separators.
- Updated chip text and outline palette to dark tones for contrast on white.
- Preserved clickable history navigation using existing universe:history:goto:<index> actions.

Files updated:
- binary-tree-next-app.mjs

Known limitations:
- Exact pixel-perfect spacing may still need one live visual pass in the authenticated canvas context.



### Addendum (2026-04-17) - Compact Breadcrumb Pass (Non-Overlapping + Centered History)

What changed:
- Reduced Binary breadcrumb container size to prevent top-right UI collisions.
- Reduced chip/avatar/text sizing for a cleaner compact header.
- Updated history chip layout so visible crumbs are horizontally centered as a group.
- Kept overflow trimming behavior and history index navigation actions.

Files updated:
- binary-tree-next-app.mjs

Known limitations:
- Final spacing may still need micro-tuning after live in-app QA with longer history trails.

### Addendum (2026-04-17) - Compact Breadcrumb v2

What changed:
- Reduced Binary breadcrumb panel to a smaller footprint.
- Reduced node chip/avatar/text dimensions for lighter visual weight.
- Preserved center-aligned history row and index-based breadcrumb navigation.

Files updated:
- binary-tree-next-app.mjs

Known limitations:
- May still require one final micro-tune depending on personal readability preference.

### Addendum (2026-04-17) - Breadcrumb Y-Axis Centering Pass

What changed:
- Vertically centered breadcrumb node+label content block in the Binary breadcrumb card.
- Refined label baseline handling to reduce perceived gap after usernames.
- Preserved compact sizing and centered history-row behavior.

Files updated:
- binary-tree-next-app.mjs

Known limitations:
- Final typography micro-alignment may still vary slightly by browser text rendering.

### Addendum (2026-04-17) - Breadcrumb Text Legibility Tune

What changed:
- Increased text sizes in compact breadcrumb chips for easier reading.
- Expanded chip width constraints to support larger username text.
- Preserved compact panel dimensions and centered history layout behavior.

Files updated:
- binary-tree-next-app.mjs

Known limitations:
- Long usernames may still truncate when many breadcrumbs are visible simultaneously.

### Addendum (2026-04-17) - Legacy Trinary Enter -> Local Binary

What changed:
- Implemented Trinary view Enter behavior so selected real nodes enter Local Binary view.
- Added resolver to map selected Trinary projected nodes to valid binary node ids.
- Updated Enter routes (dock + keyboard) to use new shared view-aware helper.

Files updated:
- binary-tree-next-app.mjs

Known limitations:
- Enter is intentionally ignored for empty/placeholder Trinary slots.

### Addendum (2026-04-17) - Legacy Trinary Header Dropdown (Tier Switch)

What changed:
- Added canvas-rendered Legacy tier dropdown to the Trinary header panel.
- Kept existing header tap action for showing/hiding the Legacy Leadership panel.
- Implemented tier selection actions to immediately switch Trinary tier view mapping.
- Added dropdown open/close state and outside-click closing behavior.

Files updated:
- binary-tree-next-app.mjs

Known limitations:
- Dropdown currently lists available/unlocked-or-selected tiers; if only one tier is available, dropdown is shown as non-expandable.

### Addendum (2026-04-17) - Trinary Header Vertical Compact + Tier Fade Transition

What changed:
- Reduced Legacy Trinary header height, typography scale, dropdown size, and menu row height.
- Removed extra external hover hint text to keep top panel visually compact.
- Added animated tier switching (fade-out -> tier model swap -> fade-in) for Legacy tier dropdown changes.
- Added transition lifecycle state/cleanup to avoid conflicts with existing universe enter/back transitions.

Files updated:
- binary-tree-next-app.mjs

Known limitations:
- Transition currently applies as a full tree viewport fade (intentional for consistency with existing binary enter/back fade behavior).

### Addendum (2026-04-17) - Tier Switch Fade Interrupt Guard

What changed:
- Prevented potential stuck-opacity state when tier switch transition is interrupted.
- Close and non-animated sync paths now clear pending tier-switch fade state safely.

Files updated:
- binary-tree-next-app.mjs

### Addendum (2026-04-17) - Slower Tier-Switch Fade

What changed:
- Slowed Trinary Legacy tier-switch animation timing.
- Fade-out/fade-in now runs longer for smoother readability during tier changes.

Files updated:
- binary-tree-next-app.mjs

### Addendum (2026-04-17) - Dedicated Trinary Entry Control

What changed:
- Added a dedicated top-right dock button for Trinary view access.
- Button action opens Legacy Tier 1 Trinary view immediately.
- Added active-state styling for button when Trinary view is active.
- Slowed tier switch fade timing again to reduce perceived speed.

Files updated:
- binary-tree-next-app.mjs

### Addendum (2026-04-17) - Trinary Button Toggle + Network Icon

What changed:
- Converted dedicated Trinary button to toggle behavior:
  - ON: open Legacy Tier 1 Trinary,
  - OFF: return to Binary default view.
- Replaced icon ligature from `account_tree` to `hub` to represent network rather than binary tree structure.
- Further increased tier-switch fade timing for slower transition perception.

Files updated:
- binary-tree-next-app.mjs

### Addendum (2026-04-17) - Legacy Tier Count Includes Root Node

What changed:
- Legacy tier progress now includes the root/home node in `tierProgressCount`.
- This aligns list progress (`x/40`) with Trinary map visual count (`1 + 3 + 9 + 27`).

Files updated:
- binary-tree-next-app.mjs

### Addendum (2026-04-17) - Infinity + Legacy Tier List Sort Activated

What changed:
- Connected the Current-list sort control so it now works in both Infinity Builder and Legacy Leadership modes.
- Sorting behavior is constrained to two options only: `Ascending` and `Descending`.
- Sort label, aria metadata, and list order now stay synchronized after each press.
- Reset behavior returns sort direction to `Ascending` when panel state is reset.

Files updated:
- binary-tree-next-app.mjs

### Addendum (2026-04-17) - Per-User Sort Persistence for Infinity + Legacy Panel Modes

What changed:
- Implemented server-persisted sort preferences for the shared Infinity Builder / Legacy Leadership panel.
- Sort preference is now separated by mode:
  - Infinity mode keeps its own sort direction.
  - Legacy mode keeps its own sort direction.
- Sort values are loaded from member launch-state during bootstrap and saved through authenticated API updates.
- Added backend support for storing/retrieving these preferences in Binary Tree intro-state records.

Files updated:
- backend/stores/member-binary-tree-intro.store.js
- backend/services/auth.service.js
- backend/controllers/auth.controller.js
- backend/routes/auth.routes.js
- binary-tree-next-app.mjs

### Addendum (2026-04-17) - Left Panel Member Status Card (Server Time Removed)

What changed:
- Replaced the left panel bottom Server Timer card with a new Member Status card.
- Added a cached member-status resolver scoped to the current home organization that reports:
  - total organization members
  - active members on left and right
  - direct sponsors on left and right
  - total active members and total direct sponsors.
- Removed server-time rendering from the left panel after follow-up direction.

Files updated:
- binary-tree-next-app.mjs

Known limitations:
- Member counts reflect the currently applied global tree snapshot and update when live-sync snapshots refresh.

### Addendum (2026-04-17) - Member Status Card Follow-up (Selected Node Live Data + White Surface)

What changed:
- Removed the Member Status heading text from the bottom-left card.
- Updated the card container fill to #FFFFFF.
- Bound member-status metrics to the currently selected node context (with home/root fallback when no node is selected).

Behavior:
- Clicking a node now updates the card values using that node's left/right organization branches, matching the contextual behavior of the Details card above.

Files updated:
- binary-tree-next-app.mjs
### Addendum (2026-04-17) - Member Status Root Scope Fix (Self Node Zero Data)

What changed:
- Fixed member-status resolver behavior when selected node is the root/self scope.
- Root path (`globalPath = ''`) is now treated as valid context instead of invalid fallback.

Impact:
- Clicking your own node (for example, username `zeroone`) now resolves real organization metrics instead of showing zeros.

Files updated:
- binary-tree-next-app.mjs
### Addendum (2026-04-17) - Binary Tree Next Spillover Anonymous Gate (Legacy Privacy Parity)

What changed:
- Added shared Binary Tree Next privacy helpers to detect anonymized identities and spillover privacy conditions.
- Enforced spillover privacy mask on left-panel detail identity fields:
  - name now shows `Anonymous`
  - handle now shows `Hidden`
  - rank/title icon row is suppressed for masked nodes.
- Enforced privacy-safe relation buttons in Details card:
  - parent/sponsor labels render `Anonymous` when masked
  - masked relation buttons do not expose focus actions.
- Enforced privacy-safe rendering in favorites/search/breadcrumb surfaces:
  - favorites labels/initials now anonymize masked spillover nodes
  - search result labels/subtitles now anonymize masked spillover nodes and block name-based discovery for masked identities
  - breadcrumb labels/chips now anonymize masked spillover nodes.
- Enforced avatar privacy for masked spillover nodes:
  - photo avatars are disabled in canvas/detail/favorites/search avatar paths
  - initials are derived from anonymous identity for masked nodes.

Files updated:
- `binary-tree-next-app.mjs`

Validation:
- `node --check binary-tree-next-app.mjs` passed.
### Addendum (2026-04-17) - Spillover Privacy Logic Reverted to Legacy Rule

What changed:
- Replaced the Binary Tree Next spillover privacy gate with the same legacy rule used in `binary-tree.mjs`.
- `isTreeNextOutsideOrganizationSpilloverNode(...)` now follows the legacy condition:
  - spillover node
  - has placement parent context
  - has no resolvable `sponsorId`.
- Removed the newer viewer-context spillover masking helpers that were over-masking viewer-sponsored nodes.
- Updated scoped live-tree sponsor mapping so outside-source spillovers intentionally lose mapped `sponsorId` (empty), matching legacy privacy semantics.
- Preserved spillover identity when sponsor is intentionally out-of-scope so masking still applies correctly.

Files updated:
- `binary-tree-next-app.mjs`

Validation:
- `node --check binary-tree-next-app.mjs` passed.


### Addendum (2026-04-17) - Spillover Ownership Gate Parity (Root-Owned Sponsor Branches Visible)

What changed:
- Ported the ownership-aware spillover anonymization flow from the old tree builder logic.
- Added sponsor-graph ownership resolution (`viewerSponsoredOrganizationNodeIds`) in live scoped-tree construction.
- Added outside-source spillover detection based on original source sponsor context before scoped remap.
- Added scoped-node flag `isViewerOwnedSponsorBranchNode` to preserve visibility for owner-sponsored branches.
- Applied anonymized labels only to true outside-source branches (`Spillover Direct N` / `Spillover Network N`).
- Updated outside-organization privacy check to skip viewer-owned sponsor branches even when mapped sponsor id is unresolved.

Files updated:
- `binary-tree-next-app.mjs`

Validation:
- `node --check binary-tree-next-app.mjs` passed.

### Addendum (2026-04-17) - Infinity Builder Logic Update (Per-Node Reward + Tier Qualification)

What changed:
- Updated Infinity tier completion logic to require all 3 tier nodes to be completed (not just enrolled).
- A completed Infinity node now means the seed account is active and has at least 3 active direct enrollments.
- Updated monthly 1% qualification to evaluate all qualifying directs under a node (not only the first 3 rendered slots).
- Added Tier 1 strict gate for monthly 1%:
  - Tier 1 monthly 1% only activates after Tier 1 itself is fully completed (all 3 nodes completed).
- Added Tier 2+ relaxed gate for monthly 1%:
  - Tier 2 and higher can activate 1% per qualified node even before the tier card is fully completed.
- Locked-tier protection:
  - Monthly 1% does not activate on locked tiers.
- Updated Infinity tier reward calculation to be package-based per node:
  - Infinity node = 50 USD
  - Legacy node = 75 USD
  - Tier reward now sums the 3 node rewards (mixed tiers supported, e.g., 150/175/200/225).
- Updated Infinity total/claimable reward aggregation to sum actual per-tier reward values instead of fixed 150 USD multiples.
- Updated Infinity panel copy/subtitle/status messaging to match the new rules.

Files updated:
- `binary-tree-next-app.mjs`

Validation:
- `node --check binary-tree-next-app.mjs` passed.

Known limitations:
- Tier completion is still computed from live node state; if node activity drops below requirements later, completion state can recalculate based on current data.

### Addendum (2026-04-17) - Removed Hardcoded 150 USD Infinity Claim Fallback

What changed:
- Removed static hardcoded `Claim $150.00 Tier Reward` default text in Infinity panel HTML.
- Replaced static tier bonus placeholder copy that referenced a fixed amount.
- Added runtime fallback behavior when tier data is unavailable:
- claim button is disabled and shows generic `Claim Tier Reward`
- tier bonus line shows dynamic-rule guidance text.

Files updated:
- `binary-tree-next.html`
- `binary-tree-next-app.mjs`

Validation:
- `node --check binary-tree-next-app.mjs` passed.

### Addendum (2026-04-17) - Locked/Incomplete Infinity Claim Labels No Longer Show Dollar Amount

What changed:
- Updated Infinity panel locked/incomplete render behavior so fixed-looking amount text is not shown before a tier is claimable.
- Tier bonus line for locked Infinity/Legacy tiers now shows lock-state guidance text (no dollar amount).
- Claim button now shows generic `Claim Tier Reward` when tier is locked or incomplete.
- Claim button only shows dollar amount when tier is completed and claimable.

Files updated:
- `binary-tree-next-app.mjs`

Validation:
- `node --check binary-tree-next-app.mjs` passed.

### Addendum (2026-04-17) - Infinity Panel Naming Standardized to Infinity Tier Commission

What changed:
- Updated Binary Tree Next Infinity panel user-facing label/copy from `Infinity Builder Bonus` to `Infinity Tier Commission`.
- Updated panel breadcrumb/title, account overview commission card label, and descriptive paragraph text.
- Kept claim behavior unchanged (tier reward label remains dynamic at runtime when claimable).

Files updated:
- `binary-tree-next.html`
- `binary-tree-next-app.mjs`

Validation:
- repo text scan confirms legacy display label removed from Binary Tree Next files.

### Addendum (2026-04-17) - Admin Anticipation Structure (Single Center Slot)

What changed:
- Reworked admin anticipation rendering so only one centered anticipation node is shown for enrollment.
- Removed admin-facing left/right anticipation label split for slot visuals.
- Kept binary placement and acting-root logic unchanged.

Implementation details:
- `resolveAnticipationSlots(...)` now branches for admin source and returns one centered slot with internal leg resolution.
- `drawAnticipationSlots(...)` now supports `hideSideLabel` for slot metadata.
- `syncTreeNextEnrollLegPositionField(...)` now shows admin-friendly auto-placement copy.

Files updated:
- `binary-tree-next-app.mjs`

Validation:
- `node --check binary-tree-next-app.mjs` passed.

### Addendum (2026-04-17) - Binary Tree Boot Loading Copy (Motivational)

What changed:
- Updated the Binary Tree boot loading subtitle to remove technical wording about node/camera state.
- Replaced subtitle copy with motivational text:
- `Building your future one connection at a time...`

Files updated:
- `binary-tree-next.html`

Validation:
- In-file copy check confirms `Preparing nodes and camera state...` no longer exists in Binary Tree Next loading markup.

Known limitations:
- Copy-only update; loading sequence timing, animations, and boot logic are unchanged.
## Update (2026-04-22) - Enrollment Tax Source Migrated to Stripe Tax

### What Changed

- Removed fixed enrollment tax-rate preview math from the Binary Tree enrollment checkout preview.
- Enrollment summary tax row now shows Stripe-calculated behavior (`Calculated at Stripe checkout`) instead of fixed local currency tax.
- Enrollment checkout label changed to estimated due wording to reflect Stripe-finalized tax.
- Backend enrollment checkout now enables Stripe automatic tax for hosted sessions and links Stripe Tax calculations for PaymentIntent enrollment flow.

### Files Affected

- `binary-tree-next-app.mjs`
- `binary-tree-next.html`
- `backend/services/member.service.js`

### Notes

- Enrollment subtotal/discount previews remain in-app estimates.
- Final tax and charged total come from Stripe-confirmed checkout/payment intent lifecycle.

## Update (2026-04-24) - Mobile Panel Density + Bottom Edge Visual Cleanup

### What Changed

- Rebalanced mobile left-sheet layout to expand the Details card:
  - reduced mobile favorites card baseline height
  - removed mobile-only reserved bottom status card block
  - updated details card bottom-limit calculation so more vertical space is allocated to node details content.
- Cleaned up mobile sheet chrome rendering:
  - added a top-only rounded panel path for mobile side sheet drawing
  - removed visible bottom corner/border artifacts at the viewport edge by extending panel chrome below the fold.

### Files Affected

- `binary-tree-next-app.mjs`

### Validation

- `node --check binary-tree-next-app.mjs` passed.

### Known Limitations

- Left-sheet main content remains canvas-rendered (non-DOM), so additional continuous in-sheet scroll behavior is still bounded by existing sheet-stage interaction model.

## Update (2026-04-24) - Mobile Main Panel Surface Gesture Drag

### What Changed

- Added mobile drag-start support from the side-sheet surface area, not only the handle.
- Kept button interactions stable by not starting surface drag when touch begins on non-handle actionable controls.
- Added drag-source-aware finalize behavior:
  - handle taps retain tap-based stage transition
  - surface taps no longer trigger stage change unless user actually drags/flicks.
- Added FULL-stage top-region surface-drag gate for cleaner collapse gesture behavior.

### Files Affected

- `binary-tree-next-app.mjs`

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-24) - Mobile Main Panel Content Scroll + Member Status Reachability

### What Changed

- Restored Member Status card below Details on mobile side panel.
- Added FULL-stage vertical content scroll for main side-panel content sections (Favorites, Details, Member Status).
- Added touch gesture handoff from content drag to sheet-stage drag when content is already at top and user pulls downward.
- Updated pointer lifecycle integration so content drag, sheet drag, and favorites drag no longer conflict.

### Files Affected

- `binary-tree-next-app.mjs`

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-24) - Mobile Search-Down Scroll Stack + Full Stage Top-Right Radius

### What Changed

- Shifted mobile vertical scroll stack start to Search row so everything from Search down scrolls together.
- Kept action rows above Search fixed.
- In FULL stage, removed top-right panel corner radius for a flush right edge.

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-24) - Mobile Full-Stack Scroll + Full-Stage Square Top Edge

### What Changed

- Mobile scroll stack now starts at action rows (below handle), not at search row.
- Action rows, search row, favorites, details, and member status now move together on full-stage scroll.
- Full-stage panel chrome now uses zero top-left and top-right radius.

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-24) - External Top-Right Panel Shortcuts (Mobile) + Favorites Anchor Correction

### What Changed

- Moved mobile panel shortcuts (Account/Rank/Preferred/Legacy) out of center sheet and into top-right external cluster.
- In FULL stage, external shortcut cluster is not rendered.
- Corrected favorites section anchor so it follows search-row baseline consistently.
- Kept full-stage square top edge (no top corner radii).

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-24) - Mobile Shortcut Actions Auto-Expand to FULL

### What Changed

- Added mobile shortcut action guard so pressing Account/Rank/Preferred/Legacy shortcuts auto-expands center panel to `FULL`.
- Applied in `triggerAction(...)` before panel toggle/view handlers execute.

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-24) - Legacy Leadership Exception + Full-Stage Button Corner Cleanup

### What Changed

- Kept Legacy Leadership shortcut as separate behavior:
  - removed `legacy-tier:view:toggle` from `shouldForceMobilePanelFullForShortcutAction(...)`.
- Retained auto-full shortcut expansion only for:
  - Account Overview
  - Rank Advancement
  - Preferred Accounts
- Updated mobile `FULL` stage button chrome in center panel:
  - side-nav toggle button corners set to square (`radius: 0`)
  - mobile nav action buttons (back/home/enter/deep) corners set to square
  - pin toggle corners set to square.
- Updated mobile top-right shortcut drawing path:
  - non-legacy buttons configured with no-radius style in `FULL`
  - legacy button remains rounded as a distinct control type.

### Files Affected

- `binary-tree-next-app.mjs`

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-24) - Mobile FULL Mode Panel Radius Removal (Account/Rank/Preferred)

### What Changed

- Added a mobile full-stage CSS override in `binary-tree-next.html`:
  - when `data-tree-next-sheet-stage="full"` is active on `html`/`body`, set:
    - `#tree-next-account-overview-panel { border-radius: 0; }`
    - `#tree-next-rank-advancement-panel { border-radius: 0; }`
    - `#tree-next-preferred-accounts-panel { border-radius: 0; }`
- Scope is limited to `FULL` stage only; non-full stages retain prior rounding.

### Files Affected

- `binary-tree-next.html`

### Validation

- Verified selector block is present and stage-scoped.

## Update (2026-04-24) - Fullscreen Mobile FULL Mode for Account/Rank/Preferred Panels

### What Changed

- Added `fullScreenInFullStage` support in `resolveTreeNextMobileOverlayPanelFrame(...)`.
- When sheet stage is `FULL` and option is enabled, frame now resolves to entire viewport (`0,0,width,height`).
- Enabled this mode for:
  - `syncAccountOverviewPanelPosition(...)`
  - `syncRankAdvancementPanelPosition(...)`
  - `syncPreferredAccountsPanelPosition(...)`
- Updated full-stage CSS for these overlays in `binary-tree-next.html`:
  - removed rounding, border, and shadow so full-screen mode no longer appears as a floating card.

### Files Affected

- `binary-tree-next-app.mjs`
- `binary-tree-next.html`

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-24) - External Top-Right Row for Mobile Nav Actions + Pin Radius Reverted

### What Changed

- In `drawSideNav(...)`:
  - removed mobile in-sheet nav action row and its layout offset.
  - search row now anchors the content scroll stack directly.
- In `drawBottomToolBar(...)` mobile path:
  - added external top-right horizontal row for:
    - Back
    - Home
    - Enter
    - Deep
- Restored `Pin` button radius in side panel by setting `pinToggleRadius` back to `11`.

### Files Affected

- `binary-tree-next-app.mjs`

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-24) - Mobile Nav Row Anchored To Center Panel Top (Non-Full)

### What Changed

- Adjusted mobile toolbar nav row placement for `mobile-sheet-back/home/enter/deep`:
  - anchor now uses side panel frame (`layout.sideNav`) instead of global top offset.
  - nav row Y = `panelTopY - buttonSize - 8`.
  - row renders only in non-`FULL` stages.
- This separates nav buttons from the top shortcut cluster and keeps them attached to lowered/hidden center panel position.

### Files Affected

- `binary-tree-next-app.mjs`

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-24) - Closed-Stage Search + Profile Controls Added

### What Changed

- In mobile toolbar rendering (`drawBottomToolBar(...)`):
  - added closed-stage row containing search pill and profile avatar.
  - connected row to existing `brand-menu:toggle` and search input/dropdown rect state.
- In closed-stage side-nav render path (`drawSideNav(...)`):
  - removed forced per-frame dropdown/menu reset that prevented interaction continuity.

### Files Affected

- `binary-tree-next-app.mjs`

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-24) - Apple Maps Closed Strip Placement Correction

### What Changed

- Search/profile controls for mobile `closed` stage were moved into `drawSideNav(...)` so they render on the center panel surface.
- External duplicate search/profile row was removed from `drawBottomToolBar(...)`.

### Files Affected

- `binary-tree-next-app.mjs`

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-24) - Dynamic Closed-Stage Offset For Mobile Browser UI

### What Changed

- Added dynamic closed-stage progress calculation based on viewport height and visual viewport bottom occlusion.
- Replaced fixed closed snap bound usage in:
  - `resolveTreeNextMobileSidePanelSnapProgress(...)`
  - `resolveTreeNextMobileSidePanelStageFromProgress(...)`
  - `resolveTreeNextMobileSidePanelProgress(...)`
  - `updateTreeNextMobileSidePanelSpring(...)`
  - drag update/finalize handlers
  - `resolveTreeNextMobileSidePanelFrame(...)`
  - `drawTreeNextMobileSheetBackdrop(...)`.

### Files Affected

- `binary-tree-next-app.mjs`

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-24) - Mobile Top Buttons Show/Hide + Legacy/Universe Default Hidden

### What Changed

- Added new mobile top-controls toggle (`mobile-top-controls-toggle`) in `drawBottomToolBar(...)`.
- Added row slide-to-right behavior for top toolbar rows when hidden.
- Added context-aware default hide logic:
  - Legacy/Trinary canvas view active -> hidden by default
  - Node Universe (root != `root`) -> hidden by default.
- Added new UI state and action wiring:
  - `mobileTopControlsHidden`
  - `mobileTopControlsReveal`
  - `mobileTopControlsAutoHideContextToken`
  - `mobile:top-controls:toggle` in `triggerAction(...)`.

### Design Notes

- Default hide is applied on context-entry token changes to prevent repeated forced hiding after manual re-show.
- Top-row button hit registration is suppressed when mostly hidden to reduce accidental interaction on off-screen controls.

### Known Limitation

- Controls remain in the last chosen hide/show state when exiting an auto-hide context.

### Files Affected

- `binary-tree-next-app.mjs`

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-24) - Mobile Top Toggle Scope Corrected

### What Changed

- Lower mobile nav row now uses full right anchor again (no reserved toggle slot gap).
- Top-controls hide/show offset is now applied only to top shortcut buttons.

### Files Affected

- `binary-tree-next-app.mjs`

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-24) - True Hide Applied To Top Shortcut Group

### What Changed

- In mobile toolbar rendering, the top shortcut row is now conditionally rendered only when `mobileTopControlsHidden` is false.
- Removed row-shift based hiding for this group and replaced it with hard visibility gating.

### Files Affected

- `binary-tree-next-app.mjs`

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-24) - Mobile Favorites Layout Compact Sizing (No Clipping)

### What Changed

- Added compact mobile favorites layout branch in side-nav favorites render.
- Reduced mobile item radius/slot width and adjusted text offsets/font sizes.
- Added mobile-specific favorites viewport top/bottom inset and minimum height.

### Files Affected

- `binary-tree-next-app.mjs`

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-24) - Search Placeholder/Text Weight + Icon Color Match

### What Changed

- Added `SIDE_NAV_SEARCH_TEXT_COLOR` constant and applied it to side-nav search text/caret/icon rendering.
- Added `ensureSideNavSearchInputStyle()` to enforce regular placeholder weight and matching placeholder color.
- Search input now uses regular font weight (400).

### Files Affected

- `binary-tree-next-app.mjs`

### Validation

- `node --check binary-tree-next-app.mjs` passed.

- Follow-up: search input now always ensures placeholder style injection before early return.

## Update (2026-04-24) - Search Input Typing Forces Mobile FULL Stage

### What Changed

- In side-nav search input handler, non-empty typed input on mobile now forces panel stage to `FULL` (animated).

### Files Affected

- `binary-tree-next-app.mjs`

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-24) - Mobile Search Expand Trigger Moved To Press/Focus

### What Changed

- Added immediate mobile panel expansion trigger for search input `pointerdown`/`focus`.
- Removed full-stage trigger from search `input` typing path.

### Files Affected

- `binary-tree-next-app.mjs`

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-24) - Mobile Search Viewport Lock Against Keyboard Resize

### What Changed

- Added `mobileSearchViewportLock` and helper functions for lock activation/resolution.
- `updateCanvasSize()` now resolves viewport size through lock-aware path.
- Search input events now toggle lock on focus lifecycle.

### Files Affected

- `binary-tree-next-app.mjs`

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-24) - Closed -> FULL First For Search/Profile

### What Changed

- Search focus expansion now applies instant `FULL` promotion from `CLOSED` stage.
- `brand-menu:toggle` now applies instant `FULL` promotion before opening menu when stage is `CLOSED`.

### Files Affected

- `binary-tree-next-app.mjs`

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-24) - Animated Search Expansion + Deferred Focus

### What Changed

- Added delayed-focus timer path for search press in closed mobile stage.
- Search press now animates side panel to `FULL` before applying focus.

### Files Affected

- `binary-tree-next-app.mjs`

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-24) - Details Reflow Smoothing + Border Radius Interpolation

### What Changed

- Mobile side-nav content sizing now references full-stage height baseline for expanded stages.
- Details card baseline height and panel height scale now use that reference.
- Added `shouldClipContentViewport` path for clipping mobile content viewport consistently.
- Center panel top radius now interpolates with expansion progress (rounded in `HALF`, square by `FULL`).

### Files Affected

- `binary-tree-next-app.mjs`

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-24) - Mobile Closed/Half Content Fade-In-Out

### What Changed

- Added expansion-based alpha mapping in `drawSideNav(...)`:
  - `expandedContentReveal` for expanded content block.
  - `collapsedContentReveal` for closed-strip content.
- Applied context alpha layers for both branches during overlap transitions.
- Kept hard return only when expanded reveal is effectively zero in closed stage.

### Files Affected

- `binary-tree-next-app.mjs`

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-24) - Favorites Gesture Intent Lock + Vertical Handoff

### What Changed

- Added `dragAxis` tracking (`pending` -> `horizontal`/handoff) for favorites drag.
- Favorites now captures only clear horizontal swipes.
- Clear vertical intent on touch hands off to:
  - side-nav content scroll (first), or
  - side-nav stage drag (fallback).
- Added optional bypass flags for favorites/button guards in mobile drag/scroll start helpers.

### Files Affected

- `binary-tree-next-app.mjs`

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-24) - Mobile Enroll Panel Fixed Position + Full-Stage Open

### What Changed

- Fixed mobile Enroll modal horizontal positioning in `syncTreeNextEnrollPanelPosition(...)` by anchoring to the overlay frame left edge.
- Locked mobile Enroll modal panel size while open by applying explicit `height` + `maxHeight` from the resolved mobile overlay frame.
- Updated mobile enroll open flow to force the center sheet into `FULL` stage (`animate: false`) before opening, so the enroll panel stays stable.

### Files Affected

- `binary-tree-next-app.mjs`

### Validation

- `node --check binary-tree-next-app.mjs` passed.
- Screenshot validation could not run in this environment because Puppeteer browser launch is sandbox-blocked (`spawn EPERM`).

## Update (2026-04-24) - Close Overlay Returns Mobile Center Sheet To HALF

### What Changed

- Added `restoreTreeNextMobileCenterPanelHalfStage(...)` helper to normalize mobile center panel stage on overlay exit.
- Wired close->HALF behavior for:
  - `setAccountOverviewPanelVisible(false)` (only when transitioning visible -> hidden)
  - `setPreferredAccountsPanelVisible(false)` (only when transitioning visible -> hidden)
  - `closeTreeNextEnrollModal(...)`
- All three now restore center panel to `HALF` stage on mobile after close.

### Files Affected

- `binary-tree-next-app.mjs`

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-24) - Mobile Touch Pan Inertia (Native Glide)

### What Changed

- Added touch pan inertia constants and state for mobile canvas navigation.
- Captured touch drag velocity during canvas pan moves.
- Added release momentum on `pointerup` so mobile swipe continues briefly with friction decay.
- Inertia auto-cancels on new interactions (new pointer down, wheel, keyboard navigation, pinch/other active drags).

### Files Affected

- `binary-tree-next-app.mjs`

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-24) - Touch Glide Tuning Pass (Stronger Momentum)

### What Changed

- Reduced inertia launch threshold so lighter swipes still glide.
- Slowed inertia damping for longer deceleration tail.
- Added instant-velocity sampling and release selection (uses stronger of smoothed vs latest swipe sample).
- Allowed inertia start on both `pointerup` and `pointercancel` touch release paths.

### Files Affected

- `binary-tree-next-app.mjs`

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-24) - Rank Advancement Close Restores HALF Stage

### What Changed

- Updated `setRankAdvancementPanelVisible(...)` to mirror other overlay close behavior on mobile.
- When Rank Advancement transitions `visible -> hidden`, center sheet is restored to `HALF` via `restoreTreeNextMobileCenterPanelHalfStage(...)`.

### Files Affected

- `binary-tree-next-app.mjs`

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-24) - Touch Momentum Cancellation Bug Fix

### What Changed

- Fixed a release-path bug where momentum could be cleared immediately by follow-up pointer events.
- `onPointerUp(...)` now clears inertia only when the event was ending an active canvas pan drag.
- `onPointerLeave(...)` now cancels inertia only while an active gesture is still in progress.

### Files Affected

- `binary-tree-next-app.mjs`

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-24) - Mobile FPS Optimization Pass (Adaptive DPR + Hidden Panel Sync Reduction)

### What Changed

- Added adaptive mobile DPR governor targeting high-refresh rendering:
  - new mobile performance constants and runtime state (`mobileRuntimeDpr`, `mobileDprLastAdjustAtMs`)
  - `resolveCanvasDprForViewport(...)` now chooses mobile render DPR from runtime governor instead of fixed `devicePixelRatio` clamp
  - `updateMobileRuntimeDprForPerf(...)` adjusts DPR during runtime based on measured FPS and cooldown windows
- Kept desktop DPR behavior unchanged (still full fidelity path).
- Reduced per-frame mobile overhead by skipping expensive overlay panel `position + visuals` sync when panels are hidden.
  - visibility sync remains active so close/open state still applies correctly.
- Hooked adaptive DPR updates into frame loop after FPS sampling.

### Files Affected

- `binary-tree-next-app.mjs`

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-24) - Mobile FPS Optimization Phase 2 (Adaptive Frame Quality + DOM Sync Guards)

### What Changed

- Added mobile frame-quality profiling (`resolveMobileFramePerfProfile(...)`) to dynamically tune render workload based on mobile FPS, runtime DPR, and active gestures.
- In `drawTreeViewport(...)` for non-legacy view, the renderer now applies profile-driven values for:
  - LOD thresholds
  - semantic depth limits
  - cull margin
  - temporary connector suppression during high-pressure mobile motion
- Added `desynchronized: true` on both main 2D canvas context and offscreen glass context to reduce input-to-render latency where supported.
- Optimized side-nav overlay DOM sync to avoid repeated style writes when layout has not changed:
  - `syncSideNavSearchInput()` now uses visibility/layout keys and guarded clip updates.
  - `syncSideNavProfileMenu()` now uses visibility/layout keys and skips no-op frame writes.

### Files Affected

- `binary-tree-next-app.mjs`

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-24) - Revert: Mobile FPS Optimization Phase 2

### What Changed

- Reverted the latest Phase 2 mobile FPS experiment in `binary-tree-next-app.mjs`.
- Restored previous behavior for:
  - mobile frame rendering path in `drawTreeViewport(...)`
  - side-nav profile menu sync logic
  - side-nav search input/dropdown sync logic
  - canvas context options (`desynchronized` hint removed)
- Kept earlier working optimizations (including adaptive mobile DPR governor and hidden-panel frame sync reductions).

### Files Affected

- `binary-tree-next-app.mjs`

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-24) - Mobile DPR Quality Floor (Prevent Soft/Blurry Canvas)

### What Changed

- Tuned mobile DPR governor to prioritize visual sharpness:
  - raised base floor to `1.22`
  - added device-relative floor ratio `MOBILE_PERF_DPR_MIN_DEVICE_RATIO = 0.72`
  - adjusted adapt rates/hysteresis to reduce aggressive downscaling (`step down`, `step up`, lower/upper FPS thresholds, cooldown)
- Added `resolveMobileRuntimeDprBounds(...)` and applied it in:
  - `resolveCanvasDprForViewport(...)`
  - `updateMobileRuntimeDprForPerf(...)`
- Result: mobile runtime DPR can no longer fall to the previous low-blur range.

### Files Affected

- `binary-tree-next-app.mjs`

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-25) - Reservation Plan Gating In Tree Next

### What Changed

- Added reservation package constants/metadata to tree-next runtime.
- Added pending/reservation account detection helpers used by tree-next actions.
- Enrollment package selection validation now accepts the reservation package in the tree-next modal.
- Added pending account guards so tree-next enrollment mutation paths are blocked with upgrade-required messaging:
  - `requestEnrollMemberFromTree(...)`
  - `openTreeNextEnrollModal(...)`
  - `handleTreeNextEnrollModalSubmit(...)`
- Tree anticipation slots are now suppressed for pending/reservation accounts.
- Tree-next My Store controls now enforce pending restrictions:
  - share-link copy disabled/hidden
  - checkout action disabled and relabeled to `Upgrade Required`
- Added `Membership Placement Reservation - $49.99` option to `#tree-next-enroll-package` in `binary-tree-next.html`.

### Files Affected

- `binary-tree-next-app.mjs`
- `binary-tree-next.html`

### Design Decisions

- Preserved visual tree participation while gating mutation/control actions for pending members.
- Used a single user-facing restriction message to keep UX consistent with dashboard/store gates.

### Known Limitations

- This pass focused on runtime guardrails and selector availability; no separate admin-only tree-next package-management UI was introduced.

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-25) - My Store Upgrade Split Product Checkout

### What Changed

- Added split allocation logic for My Store package upgrades in `binary-tree-next-app.mjs`.
- Upgrade checkout now sends split product lines (`carryover + selected`) instead of a single product line.
- Added checkout payload field `accountUpgradeSelectedProductKey` for backend upgrade finalization metadata.
- Updated review and checkout labels to display both product quantities (e.g., `MetaCharge 7x + MetaRoast 10x`).
- Updated copy in `binary-tree-next.html` to reflect split-product selection.

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-25) - My Store Upgrade Modes (All / All / Split)

### What Changed

- `binary-tree-next.html`
  - upgrade selector now presents 3 explicit options:
    - `All MetaCharge`
    - `All MetaRoast`
    - `Split Products`
  - checkout subtitle copy updated to neutral `product allocation` language.

- `binary-tree-next-app.mjs`
  - added mode-based upgrade allocation state:
    - `all-metacharge`
    - `all-metaroast`
    - `split`
  - replaced forced split allocation helper with mode-aware allocation resolver.
  - selector click handling now sets mode + key together.
  - checkout payload now includes `accountUpgradeProductMode` and selected product key metadata.
  - UI selected-state logic now follows selected mode.

### Design Decisions

- Preserved split allocation math for split mode (carryover-to-half + remainder).
- Kept selected product key as split anchor so split direction remains configurable.

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-26) - My Store Review Button Overlap Layout Fix

### What Changed

- `binary-tree-next.html`
  - converted `.tree-next-my-store-review-card` from fixed grid columns to a wrap-safe flex layout.
  - made `.tree-next-my-store-review-main` the flexible primary content region.
  - constrained `.tree-next-my-store-review-side` as an action column that wraps below content when needed.
  - adjusted checkout button minimum width handling to avoid overflow in tight widths.
  - updated container/media behavior so wrapped side actions center and remain visually clean.

### Design Decisions

- Solved the issue with layout mechanics (flow/wrap) instead of increasing breakpoints only, because the panel can be narrow even on wide viewports.
- Kept the same desktop visual intent while preventing the review controls from overlapping.

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-27) - Details Panel Loop Metrics Now Node-Scoped (Cutoff Carry-Over)

### What Changed

- `binary-tree-next-app.mjs`
  - added node-scoped cutoff metrics lookup for selected nodes via `/api/member/server-cutoff-metrics`.
  - added cache/in-flight dedupe so repeated selection/render does not spam endpoint calls.
  - `resolveNodeLoopDisplayMetrics(...)` now resolves `Left Leg` / `Right Leg` / `Cycles` from cutoff metrics per selected node when identity can be resolved.
  - removed Details row `Total Organizational BV` (lifetime total hidden for now).

### Design Decisions

- Preserved fallback to branch totals whenever node identity is unavailable or cutoff API response is missing.
- Excluded root/admin/system nodes from cutoff lookup to keep admin reward-exception behavior intact.

### Known Limitations

- Newly selected nodes can show fallback values briefly until first cutoff response completes.

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-27) - Details Panel Total BV Restored + Tree Cycle Rule 1000/1000

### What Changed

- `binary-tree-next-app.mjs`
  - added Tree Next cycle constants and normalized loop computations to `1000/1000` thresholds.
  - updated node fallback cycle computation from `1000/500` to `1000/1000`.
  - normalized cutoff-derived cycle threshold parsing to enforce minimum `1000` values.
  - restored left Details metric row `Total Organizational BV`.

### Design Decisions

- Kept weak/strong role detection by lower/higher current leg volume while applying equal thresholds (`1000` each).

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-27) - Details Card Refactor to Monthly Weekly Carousel (Commission-Based UI)

### What Changed

- Replaced the previous Details-card identity/row layout in `binary-tree-next-app.mjs` with a month/week commission carousel presentation.
- Added carousel state + gesture handling:
  - week tabs
  - month arrows
  - horizontal swipe on Details card
  - vertical handoff back to side-panel content scroll for touch
- Updated Details card rows to explicit BV labels:
  - `Available Left Leg BV`
  - `Available Right Leg BV`
  - cycle result (`Cycles Earned`, `Strong Leg`, consumed rows)
  - carry-forward (`Left/Right Carry Forward BV`, `Preserved` / `Flushed`)
  - personal activity and `Team Generated BV`
- Added helper text clarifying available vs consumed BV usage.

### Data / Logic Notes

- Uses existing cutoff + tree metrics data paths (no backend settlement rewrite).
- Extends cutoff metrics parsing to include total/baseline/current-week fields when available.
- Weekly snapshots are generated in UI from current cutoff metrics + deterministic carry-forward projection when historical weekly records are not present.
- Current week auto-selection resets on node change.

### Known Limitations

- Historical weekly values are estimated continuity views when per-week persisted snapshot history is unavailable from API.

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Patch Update (2026-04-27) - Monthly Weekly Carousel Follow-up

### What Changed

- `binary-tree-next-app.mjs`
  - normalized Details-carousel fallback weak-leg threshold to `1000` so fallback cycle math is consistent with tree-wide `1000/1000` configuration.
  - week tabs now render explicit labels (`Week 1`, `Week 2`, etc.) to match monthly reset UX language.

### Validation

- `node --check binary-tree-next-app.mjs` passed.

## Patch Update (2026-04-27) - Details Card Clean Layout Pass

### What Changed
- `binary-tree-next-app.mjs`
  - redesigned Details card renderer for cleaner readability and reduced clutter.
  - week tabs now use centered equal-width spacing logic to remove visible gap inconsistency.
  - promoted Available BV to two primary cards and compacted the remaining commission fields into a concise row list.

### Keep / Remove Decisions
- Kept:
  - month navigation, week tabs, weekly status chip, swipe behavior
  - Available BV, cycle result, carry-forward, activity, team volume labels
  - helper explanation text for Available vs Consumed BV
- Removed from card body:
  - selected username line (extra visual noise)
  - duplicated split consumed/carry rows as separate lines (now compact left/right combined rows)

### Validation
- `node --check binary-tree-next-app.mjs` passed.

## Patch Update (2026-04-27) - Details Card Visual Reference Alignment

### What Changed
- `binary-tree-next-app.mjs`
  - replaced Details card interior layout to visually align with provided design reference.
  - restored avatar-centered identity header and bottom relation buttons.
  - simplified commission rows to a clean, compact table-style list.
  - updated week-tab spacing/centering algorithm to remove visible gap inconsistency.

### Keep / Remove Decisions (This Pass)
- Kept:
  - month/week carousel interactions and swipe logic
  - explicit BV labeling
  - parent/sponsor focus buttons
- Removed:
  - extra header/status chip clutter
  - helper text block in final visual card body

### Validation
- `node --check binary-tree-next-app.mjs` passed.

## Patch Update (2026-04-27) - Relation Buttons Style Reverted

### What Changed
- `binary-tree-next-app.mjs`
  - reverted only the two bottom Details relation buttons to the old/original design style (fills, text colors, icon balance, centered label treatment).

### Scope
- No changes to carousel behavior, metrics computation, swipe handling, or panel structure.

### Validation
- `node --check binary-tree-next-app.mjs` passed.

## Patch Update (2026-04-27) - Details User Profile Header Revert

### What Changed
- `binary-tree-next-app.mjs`
  - reverted user profile header visuals to older design style:
    - blue gradient avatar circle
    - activity status dot
    - centered name and username text styling/spacing

### Scope
- Limited to profile-header visuals only.
- Bottom relation buttons and carousel behavior remain as previously adjusted.

### Validation
- `node --check binary-tree-next-app.mjs` passed.

## Patch Update (2026-04-27) - Profile Node Legacy Render Logic Re-Applied

### What Changed
- `binary-tree-next-app.mjs`
  - restored old profile node header render behavior:
    - uses `drawResolvedAvatarCircle(...)`
    - initials are shown again when avatar photo is unavailable

### Scope
- Visual rollback limited to profile node rendering logic.
- Positioning from current weekly-layout pass retained.

### Validation
- `node --check binary-tree-next-app.mjs` passed.

## Patch Update (2026-04-27) - Available BV Source Reliability Guard

### What Changed
- `binary-tree-next-app.mjs`
  - enhanced `resolveDetailsCarouselSnapshot(...)` with stale-cutoff guard and resilient source selection for available BV fields.
  - total BV clamping bounds now include both cutoff and fallback sources to prevent accidental zeroing.

### Why
- Some selected-node cutoff payloads can return `0/0` while loop/tree metrics still have positive BV, causing tiles to incorrectly render `0 BV`.

### Validation
- `node --check binary-tree-next-app.mjs` passed.

## Patch Update (2026-04-27) - Stale Cutoff Override Guard (Available BV)

### What Changed
- `binary-tree-next-app.mjs`
  - updated `resolveNodeLoopDisplayMetrics(...)` to preserve subtree fallback leg volumes when cutoff returns stale `currentWeekLeftLegBv=0` and `currentWeekRightLegBv=0`.
  - updated `resolveDetailsCarouselSnapshot(...)` fallback source selection so available BV cannot be zeroed when subtree leg volume is present.

### Why
- Real-world case showed node cutoff payloads at `0/0` while subtree leg volume remained positive (`zerofour` left leg `192 BV`).

### Validation
- `node --check binary-tree-next-app.mjs` passed.

## Patch Update (2026-04-27) - Primary BV Card Typography Alignment

### What Changed
- `binary-tree-next-app.mjs`
  - adjusted `drawPrimaryVolumeCard(...)` to use centered X alignment and balanced Y offsets for label/value stack.
  - improved inner spacing consistency between left and right BV cards.

### Validation
- `node --check binary-tree-next-app.mjs` passed.

## Patch Update (2026-04-27) - Weekly Tabs Simplified To 4 Weeks

### What Changed
- `binary-tree-next-app.mjs`
  - removed variable 5-week month generation.
  - enforced a fixed 4-week tab model and merged end-of-month overflow days into Week 4.

### Validation
- `node --check binary-tree-next-app.mjs` passed.

## Patch Update (2026-04-27) - Details Snapshot Pre-Join Zeroing

### What Changed
- `binary-tree-next-app.mjs`
  - added node join timestamp resolver for Details carousel.
  - pre-join weeks now return zero available/consumed/carry/team/personal values to avoid false early-week volume display.

### Validation
- `node --check binary-tree-next-app.mjs` passed.

## Patch Update (2026-04-27) - Scoped Root Timestamp Mapping

### What Changed
- `binary-tree-next-app.mjs`
  - added created/joined/enrolled timestamps to `createTreeNextLiveScopedRootNode(...)` output.
  - ensures Details pre-join week zeroing logic applies to root (`id: root`) user selections.

### Validation
- `node --check binary-tree-next-app.mjs` passed.

## Patch Update (2026-04-27) - Joined Date Display In Details Profile Header

### What Changed
- `binary-tree-next-app.mjs`
  - injected joined-date text row under username in `drawSideNavDetailsCarouselCard(...)`.
  - used node join/create timestamp resolver to keep date source aligned with pre-join week gating logic.

### Validation
- `node --check binary-tree-next-app.mjs` passed.

## Patch Update (2026-04-27) - Active Week Marker + Week Preview Color State

### What Changed
- `binary-tree-next-app.mjs`
  - week tabs now support independent active-vs-selected styling.
  - added active dot marker and green active state while preserving gray preview state for selected historical/future week.
  - increased profile-header vertical spacing under joined-date row.

### Validation
- `node --check binary-tree-next-app.mjs` passed.

## Patch Update (2026-04-27) - Server Cutoff Week Window Mapping

### What Changed
- `binary-tree-next-app.mjs`
  - added cutoff-date month resolver for Details week tabs.
  - week rows now correspond to cutoff-cycle windows and current-week anchor is tied to next cutoff date.

### Validation
- `node --check binary-tree-next-app.mjs` passed.

## Patch Update (2026-04-27) - Active Dot Removed From Week Tabs

### What Changed
- `binary-tree-next-app.mjs`
  - removed active week dot rendering block inside week tab loop.
  - active week remains identifiable via tab fill/text color state only.

### Validation
- `node --check binary-tree-next-app.mjs` passed.

## Patch Update (2026-04-27) - Details Carousel Fade/Slide Week Transition

### What Changed
- `binary-tree-next-app.mjs`
  - added Details carousel transition state fields and helper functions for animated selection changes.
  - updated week/month selection actions to use transition-aware navigation.
  - refactored `drawSideNavDetailsCarouselCard(...)` content rendering to draw outgoing + incoming snapshots during animation.
  - animation behavior:
    - outgoing snapshot fades/slides out
    - incoming snapshot fades/slides in
    - swipe drag remains direct and does not stack transition interpolation while finger drag is active.

### Validation
- `node --check binary-tree-next-app.mjs` passed.

## Patch Update (2026-04-27) - Weekly Transition Changed To Fade-Only

### What Changed
- `binary-tree-next-app.mjs`
  - removed x-axis slide interpolation in `drawSideNavDetailsCarouselCard(...)` transition path.
  - retained crossfade blending and all existing week navigation logic.

### Validation
- `node --check binary-tree-next-app.mjs` passed.

## Patch Update (2026-04-27) - Fade Duration Increased

### What Changed
- `binary-tree-next-app.mjs`
  - updated Details weekly crossfade constant from `220ms` to `300ms`.

### Validation
- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-27) - Binary Tree My Store Paid BV Resolution

### What Changed
- inary-tree-next-app.mjs
  - Added My Store package-earning alias map with paid-member compatibility fallback.
  - Added /api/store-products hydration for featured-product metadata.
  - Featured selection now resolves BV by buyer type:
    - paid account -> paid-member bucket
    - preferred/reservation -> preferred-personal bucket fallback
  - Removed hard dependency on legacy static featured BV during selection/render.
- inary-tree-next.html
  - Updated review card fallback text from 38 BV to 50 BV.

### Validation
- 
ode --check binary-tree-next-app.mjs passed.

## Patch Update (2026-04-27) - Consumed/Carry Forward Rule Correction (1000/500)

### What Changed
- `binary-tree-next-app.mjs`
  - fixed weak-leg fallback from `1000` to `500`.
  - removed `cycleHigherBv` coercion to `>= cycleLowerBv` in frontend cutoff parsing.
  - resulting Details cycle math now follows strong-leg `1000` and weak-leg `500` expectations.

### Validation
- `node --check binary-tree-next-app.mjs` passed.
