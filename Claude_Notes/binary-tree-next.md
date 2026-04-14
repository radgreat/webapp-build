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
