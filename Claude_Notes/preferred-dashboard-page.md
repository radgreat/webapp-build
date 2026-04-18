# Preferred Dashboard Page

## Update (2026-04-15) - Dashboard Rebuild to Match New Preferred Store Style

### What Was Changed

- Rebuilt `store-dashboard.html` visual structure to align with the updated preferred storefront and registration pages:
  - white canvas, soft border cards, Inter typography
  - neutral gray input surfaces (`#E2E2E2`)
  - primary CTA color (`#077AFF`).
- Kept all key dashboard logic operational:
  - preferred-account session guard
  - store-code scoped navigation links
  - purchase activity loading/filtering by current identity
  - account package upgrade API submission
  - profile save to scoped local storage
  - address save to scoped local storage
  - logout session clear + redirect.

### Files Affected

- `store-dashboard.html`
- `Claude_Notes/preferred-dashboard-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Design Decisions

- Matched store/register tone rather than introducing a separate dashboard visual language.
- Preserved existing backend endpoints and payload formats to avoid breaking current backend behavior.

### Validation

- Inline script parse check passed for `store-dashboard.html`.

### Known Limitations

- Purchase history still depends on invoice identity fields (`buyerUserId`, `buyerUsername`, `buyerEmail`) matching session identity.

## Update (2026-04-15) - BV Removed from Dashboard Purchase Views

### What Was Changed

- Updated `store-dashboard.html` purchase activity presentation:
  - removed top-level Total BV metric card
  - removed BV row in each purchase record.

### Files Affected

- `store-dashboard.html`
- `Claude_Notes/preferred-dashboard-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Validation

- Search scan confirmed no `BV` labels remain in `store-dashboard.html`.
- Inline script parse check passed for `store-dashboard.html`.

## Update (2026-04-15) - Dashboard Hero Metadata Removal + Logout Reliability

### Changes

- Removed hero chip row from preferred dashboard header area:
  - `Username`
  - `Email`
  - `Store Link`
- Preserved dashboard core actions and forms (upgrade, purchases, profile, address).
- Updated logout action to shared auth clear utility with login redirect markers for clean session reset.

### Files

- `store-dashboard.html`
- `storefront-shared.js`
- `login.html`

### Validation

- inline non-module script parse check passed for `store-dashboard.html`.

## Update (2026-04-15) - Upgrade Account Selector Refresh

### Scope
- Preferred account dashboard (`store-dashboard.html`) upgrade module.

### Implementation
- Removed dropdown-based package selection.
- Added package card list with:
- package tier labels
- short package descriptions
- benefit bullets focused on paid-member outcomes.
- Added client-side selected state management and busy-state disabling.

### Result
- Cleaner package discovery and easier upgrade decision flow inside dashboard.

## Update (2026-04-15) - Upgrade Section Carousel Refresh

### Scope
- Preferred dashboard upgrade selector in `store-dashboard.html`.

### UI
- Replaced vertical package cards with horizontal carousel interaction.
- Added package icon imagery per package tier.
- Added nav arrows and dot indicators for slide position.

### Logic
- Carousel active slide and selected package state are synchronized.
- Upgrade submission continues using existing backend target package payload.

### Assets Used
- `brand_assets/Icons/Achievements/personal.svg`
- `brand_assets/Icons/Achievements/business.svg`
- `brand_assets/Icons/Achievements/infinity.svg`
- `brand_assets/Icons/Achievements/legacy.svg`

## Update (2026-04-15) - Preferred Dashboard Upgrade Carousel Rebuild

### Scope
- `store-dashboard.html` (Upgrade Account module only).

### Visual Direction
- Replaced rough first carousel implementation with polished slide-card presentation.
- Enhanced hierarchy: media hero, package badge icon, tighter card spacing, cleaner controls.
- Added per-package accent/glow treatment while staying on existing Inter + white theme.

### Interaction
- Transform-based slide switching with eased transitions.
- Card click, arrows, and dot controls all map to package selection.
- Mobile swipe gesture support added.

### Assets Used
- `brand_assets/Product Images/MetaCharge Blue Bottle - NOBG.png`
- `brand_assets/Icons/Achievements/personal.svg`
- `brand_assets/Icons/Achievements/business.svg`
- `brand_assets/Icons/Achievements/infinity.svg`
- `brand_assets/Icons/Achievements/legacy.svg`

## Update (2026-04-15) - Preferred Dashboard Upgrade Layout Switched to Pricing Table

### Scope
- `store-dashboard.html` upgrade module.

### UI
- Carousel implementation removed.
- New pricing-table/card layout inspired by provided design reference.
- Four package cards with per-package price logic and benefits.

### Behavior
- Card click sets active upgrade package.
- Active package visual state + selected label preserved.
- Existing upgrade API request flow remains intact.

### Product Rules Embedded
- Personal: 150 BV, 50 cap, $4 retail, $75 fast track, both leadership bonuses locked.
- Business: 300 BV, 250 cap, $8 retail, $100 fast track, both leadership bonuses locked.
- Infinity: 500 BV, 500 cap, $12 retail, $100 fast track, Infinity unlocked, Legacy locked.
- Legacy: 1000 BV, 1000 cap, $20 retail, $200 fast track, Infinity + Legacy unlocked.

## Update (2026-04-15) - Upgrade Pricing Grid Polish

### Scope
- Preferred dashboard upgrade pricing card section.

### Cleanup
- Removed `Price & Logic` detail rows from all 4 packages.
- Increased internal spacing and list readability.
- Fixed list marker rendering issue that produced escaped symbol artifacts.

### Result
- Cleaner pricing cards with better readability and no overlapping bullet text.

## Update (2026-04-15) - Pricing Header Simplification

### Scope
- Preferred dashboard package pricing cards.

### Changes
- Price row now displays only amount.
- Added dedicated BV line under each amount.
- Removed discount badges from non-starter cards.

### Result
- Cleaner price hierarchy with less noise and clearer BV visibility.

## Update (2026-04-15) - Selected Footer UI Fix

### Scope
- Preferred dashboard pricing cards (`store-dashboard.html`).

### Fixes
- Removed footer visual seam/strip on selected card.
- Improved selected-state footer visual consistency.
- Added explicit selected label text in card footer.

### Result
- Cleaner bottom card edge and clearer selected card state.

## Update (2026-04-15) - BV-first Card Header

### Scope
- Preferred dashboard pricing cards.

### Changes
- Starter badge removed.
- Card numeric hierarchy changed to BV-first, price-second.

## Update (2026-04-15) - BV-first Header Styling

### Scope
- Preferred dashboard package cards.

### UI change
- BV promoted to large primary value.
- Price reduced to secondary supporting value.

## Update (2026-04-15) - Package Metadata Line Added

### Scope
- Preferred dashboard package card headers.

### Changes
- Added `Selectable Products` line below price for each package (3/6/10/20).
- Added supporting text style for the new line.

## Update (2026-04-15) - Contextual Icon Lock-in

### Scope
- Preferred dashboard package benefit lists.

### Changes
- Added explicit `data-icon` on each benefit item by context:
- cycle cap -> `cap`
- commission / bonus -> `money`
- locked state -> `lock`
- unlocked state -> `unlock`

### Result
- Contextual icons render deterministically instead of default marker fallback.

## Update (2026-04-15) - Locked Benefit Tone

### Scope
- Preferred dashboard package benefit list locked rows.

### Changes
- Styled locked benefit text (`data-icon='lock'`) in light gray for clearer disabled-state hierarchy.
- Matched lock icon stroke color to the same gray for consistent locked-row semantics.

### Result
- Locked lines now visually separate from active benefit lines without reducing readability.
## Update (2026-04-15) - Fast Track Bonus Final Adjustment

### Scope
- Preferred dashboard package cards (`store-dashboard.html`).

### Changes
- Business Builder Pack Fast Track set to `Earn up to $100`.
- Infinity Builder Pack Fast Track set to `Earn up to $125`.

### Result
- Package payout copy now reflects latest approved values.
## Update (2026-04-15) - Infinity Unlock Icon Revision

### Scope
- Preferred dashboard upgrade benefit icons.

### Changes
- Replaced the previous Infinity unlock icon variant with a cleaner infinity-loop glyph.
- Kept `Infinity Tier Commission Unlocked` mapped to `data-icon="infinity-unlock"`.

### Result
- Infinity unlocked benefits now read more clearly and feel more consistent with the icon set.
## Update (2026-04-15) - Legacy Unlock Dedicated Icon

### Scope
- Preferred dashboard upgrade benefit icon system.

### Changes
- Added `legacy-unlock` icon key + crown-style SVG icon treatment.
- Updated benefit-item mapping so `Legacy Leadership Bonus Unlocked` resolves to `legacy-unlock`.

### Result
- Infinity and Legacy unlocked benefits now both have dedicated contextual icons.
## Update (2026-04-15) - Removed Selected Package Label

### Scope
- Preferred dashboard upgrade action row.

### Changes
- Deleted `Selected package: Personal Builder Pack` label from UI.
- Kept `Upgrade Account` button as the only action element in the row.
- Removed corresponding JS DOM lookup + dynamic label text update block.

### Result
- Cleaner upgrade action area with less UI clutter.
## Update (2026-04-15) - Invitation-First Builder Upgrade UX

### Scope
- Preferred dashboard upgrade discovery + presentation layer (`store-dashboard.html`).

### Changes
- Added a new dashboard teaser section (`Business Invitation`) with short compensation-plan preview copy.
- Moved full builder package cards into a popup modal opened by `Explore Builder Packages`.
- Preserved all existing package values, contextual benefit icons, and upgrade submission logic.
- Added modal lifecycle interactions:
  - explicit close button
  - click outside to close
  - Escape key close
  - body scroll lock while modal open
  - focus return to opener.

### Result
- Preferred customers are no longer immediately exposed to the full business pricing wall.
- Builder opportunity is now presented as an optional invitation/sneak peek with intentional opt-in.
## Update (2026-04-15) - Payment-Gated Builder Upgrade Checkout

### Scope
- Preferred dashboard builder invitation modal + upgrade submit flow.

### Changes
- Replaced direct upgrade API submit with Stripe checkout session submit.
- Added per-upgrade product choice controls:
  - `MetaCharge™`
  - `MetaRoast™`
- Added checkout preview rows (product, quantity, total) to mirror My Store checkout intent.
- Added checkout-return finalization logic to this page so completed Stripe sessions finalize and trigger backend account upgrade.

### Result
- Preferred users can no longer be upgraded without payment.
- Upgrade path now follows: package select -> product select -> Stripe -> finalize -> member dashboard.
## Update (2026-04-15) - Upgrade Modal Summary Removed

### Scope
- Preferred dashboard builder-upgrade modal.

### Changes
- Deleted checkout summary rows (`Product`, `Quantity`, `Total`) from modal UI.
- Removed related element bindings from the JS `el` map.
- Preserved Stripe checkout-submit logic and selected package/product behavior.

### Result
- Cleaner modal with less pre-checkout clutter.

## Update (2026-04-15) - Centered Product Selector + Upgrade CTA Label

### Scope
- Preferred dashboard upgrade modal checkout action area.

### Changes
- Set product selector container alignment to center.
- Centered Select your product helper label.
- Centered action row containing the primary submit button.
- Renamed CTA display from Continue to Stripe to Upgrade Account.
- Updated loading-reset label to return to Upgrade Account after submit lifecycle.

### Result
- Checkout action area now reads as a single centered decision point with clearer naming for account-upgrade intent.

## Update (2026-04-15) - Product Selector Copy Stack + Breathing Room

### Scope
- Preferred dashboard builder-upgrade modal (`store-dashboard.html`).

### Changes
- Increased top gap below package cards before the selector/action area.
- Increased internal spacing in the checkout action stack.
- Replaced single selector label with a two-line copy stack:
  - heading (`upgrade-product-picker-title`)
  - caption (`upgrade-product-picker-caption`)
- Preserved centered alignment for selector controls and the `Upgrade Account` CTA row.

### Result
- Product selection and submit action now feel visually separated from pricing cards and easier to scan.

## Update (2026-04-15) - Upgrade Checkout Return Performance Alignment

### Scope
- Preferred dashboard upgrade flow (`store-dashboard.html`) post-Stripe return handling.

### Changes
- Reworked `handleUpgradeCheckoutReturn()` to stop blocking UI on completion polling.
- Return flow now:
  - immediately displays thank-you/payment-success feedback
  - closes modal context
  - clears return query params promptly
  - finalizes checkout session/account-upgrade asynchronously.
- Added local pending checkout snapshot before Stripe redirect.
- Added retry maps + timeout scheduling for transient network failures during finalization.
- Kept final redirect to `/index.html` only after backend confirms successful account-upgrade completion.

### Result
- Stripe return now feels instant to the user while preserving reliable backend completion behavior.

## Update (2026-04-15) - Dedicated Thank-You Modal for Upgrade Checkout Return

### Scope
- Preferred dashboard upgrade flow (`store-dashboard.html`) after Stripe hosted checkout.

### Changes
- Added new UI layer:
  - `#upgrade-thankyou-backdrop`
  - `#upgrade-thankyou-message`
  - `#upgrade-thankyou-status`
  - `#upgrade-thankyou-dashboard-button`
- Replaced return success text-only behavior with immediate modal presentation.
- Finalization status is now surfaced inside this modal and updated in-place.
- Dashboard transition button remains disabled until backend confirms upgrade completion.
- Increased finalization responsiveness:
  - initial return pass uses shorter polling interval + more attempts
  - retry timer reduced and retry pass attempts increased.

### Result
- Users now see a dedicated thank-you confirmation instantly after Stripe return, while account-upgrade completion continues more aggressively in the background.

## Update (2026-04-15) - Preferred Upgrade Finalization Optimization (Isolated)

### Scope
- Preferred dashboard upgrade checkout return/finalization backend path only.

### Changes
- Added Preferred-origin checkout marker in frontend payload:
  - `checkoutClient: 'preferred-dashboard-upgrade'`.
- Persisted this marker into Stripe checkout metadata as `checkout_client`.
- Added backend persistence-mode resolver keyed by metadata origin.
- For this scoped Preferred origin:
  - `recordMemberPurchase` uses targeted upsert persistence.
  - `upgradeMemberAccount` uses targeted upsert persistence.
- For all non-Preferred origins (including Binary Tree Next):
  - existing rewrite persistence path remains unchanged.

### Result
- Preferred upgrade completion path avoids expensive full-table rewrites and finalizes faster.
- Binary Tree Next checkout logic/behavior remains on its original path.

## Update (2026-04-15) - Upgrade Finalization Loading Notice

### Scope
- Preferred dashboard Stripe return thank-you modal.

### Changes
- Added spinner-driven loading indicator in `#upgrade-thankyou-status` while backend finalization is pending.
- Added progress warning note:
  - `Do not close or exit this browser while your upgrade is in progress.`
- Added temporary browser leave warning (`beforeunload`) only during active finalization.
- Warning/loading state now toggles directly from `setUpgradeThankYouState(...)`.

### Result
- Users now get a clear in-progress signal and explicit safety warning during upgrade finalization.
## Update (2026-04-16) - Preferred Upgrade Fast Track Credit

### Scope
- Preferred account upgrade backend behavior (backend/services/member.service.js).

### Changes
- Fast Track commission on upgrade now applies only when source package is preferred-customer-pack.
- Paid-to-paid upgrades remain Fast Track disabled for sponsor credit.
- Eligible preferred upgrades now attempt sponsor Fast Track wallet credit and return explicit upgrade metadata fields for audit/debug.

### Validation
- node --check backend/services/member.service.js passed.

