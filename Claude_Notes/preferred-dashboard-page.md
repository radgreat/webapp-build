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
