# Preferred Customer Page Notes

Last Updated: 2026-04-14
Status: In Progress (Phase 1 foundation complete)

## Recent Update (2026-04-14) - Page Render Fix (`normalizeText` ReferenceError)

- Fixed `index.html` Preferred Customer runtime error:
  - `isEnrollmentGeneratedInvoice(...)` referenced `normalizeText(...)` (undefined in this file scope).
  - replaced with `String(invoice?.id || '').trim().toUpperCase()`.
- Impact:
  - removed runtime exception that interrupted planner and guest sales rendering.
  - Preferred Customer page now correctly shows sponsor-linked preferred rows and guest-attributed invoices for `zeroone`.
- Validation:
  - `/PreferredCustomer` snapshot values after fix:
    - planner: `2 customers` / `2 cards`
    - guest-attributed sales: `3 invoices` / `3 cards`

## Recent Update (2026-04-13) - Preferred Planner Invoice Visibility Fix + Legacy Attribution Fallback

- Updated member-side preferred planner invoice matching in `index.html`:
  - planner now matches preferred-member invoices against all non-enrollment store invoices (identity-first via `buyerUserId` / `buyerUsername`)
  - keeps owner-attribution guard, but now also accepts legacy/default-attributed invoice rows (`REGISTRATION_LOCKED` or blank attribution path) when member identity matches.
- Updated owner attribution code resolver used by preferred view:
  - includes session `attributionStoreCode`
  - includes derived public aliases from internal `M-*` codes
  - avoids default public fallback (`CHG-ZERO`) from becoming the only owner-filter key when explicit code context is missing.
- Outcome:
  - preferred-member invoices that previously showed `0 invoices` due attribution fallback mismatch now render correctly in the planner cards.

## Recent Update (2026-04-07) - Preferred/Free Login Merged Into Unified Login

- Updated preferred/free account auth entry points to use unified `login.html` instead of a separate active login page.
- `store-login.html` is now a compatibility redirect that forwards to `/login.html` and keeps `?store=` query context.
- Updated storefront references previously labeled as separate preferred/free login to point to unified login routing.
- Store password setup return links now send users to `/login.html`.
- Free/preferred accounts still route to `/store-dashboard.html` after successful sign-in.

## Recent Update (2026-04-06) - Sponsor Action Row Alignment Fix

- Corrected misalignment in detail-page sponsor action row.
- Sponsor hint text now renders below the action row instead of inside the same alignment row.
- `Transfer/Update` button now aligns with the sponsor input field cleanly and no longer appears crooked.
- Visual alignment update only; transfer logic remains unchanged.

## Recent Update (2026-04-06) - Preferred Customer Action Buttons Standardized

- Standardized Admin Preferred Customer action buttons to a unified size and type scale.
- Updated button labels to fit uniform button widths cleanly:
  - `Back to List`
  - `Transfer`
  - `Update`
- Uniform sizing now applies to:
  - list refresh action
  - detail page back/transfer/update actions
  - table row open action
- This change is visual-only and does not alter transfer/business logic.

## Recent Update (2026-04-06) - Admin Preferred Customers Table + Pending/Transferred/Updated Status + Custom Sponsor Suggestions

- Replaced preferred-customer list card layout with a structured table in Admin page.
- Added explicit transfer-state statuses in admin transfer workflow:
  - `Pending`
  - `Transferred`
  - `Updated`
- Detail-page sponsor selector now uses custom suggestion panel instead of browser-native datalist UI:
  - searchable by username, name, or email
  - click-to-select sponsor username
  - avoids webkit dropdown rendering inconsistency
- Transfer validation now checks selected sponsor against assignable sponsor records sourced by suggestion logic.
- Transfer endpoint unchanged:
  - `PATCH /api/admin/registered-members/:memberId/placement`

## Recent Update (2026-04-06) - Sponsor Typeahead Dropdown + Cleaner Transfer UI

- Reduced visual clutter in Admin `Preferred Customers` screens:
  - simplified list row structure
  - simplified detail page wrappers/panels
- Updated transfer control on detail page:
  - sponsor input now supports type-and-select dropdown suggestions (`datalist`)
  - suggestions are populated from assignable non-preferred member usernames
- Transfer submit now validates that selected sponsor exists in assignable member list before calling API.
- Transfer flow remains sponsor reassignment only; no placement controls are included.
- Endpoint unchanged:
  - `PATCH /api/admin/registered-members/:memberId/placement`

## Recent Update (2026-04-06) - Admin Preferred Customers Assignment Actions

- Updated Admin `Preferred Customers` to a list -> detail-page assignment flow:
  - click a preferred-customer row in the list
  - app routes to `/admin/PreferredCustomers/Detail`
- Detail page controls include:
  - `Sponsor Username` input
  - `Transfer/Update Transfer` button
- Preferred-customer reassignment now runs from the detail page using:
  - `PATCH /api/admin/registered-members/:memberId/placement`
- Placement controls are intentionally removed from this transfer screen; existing placement values are preserved.
- Added backend validation in `updateRegisteredMemberPlacement(...)`:
  - sponsor username must exist in member users store
  - invalid sponsor now returns `404` with message: `Sponsor username was not found.`
- This unblocks Admin workflow for parked free accounts by letting Admin transfer ownership immediately from the parking list.

## Recent Update (2026-03-27) - Placement Control Expansion

- Updated planner/enroll control language to six explicit options:
  - `left`
  - `right`
  - `spillover-left`
  - `spillover-right`
  - `extreme-left` (UI label: `Spillover Extreme Left`)
  - `extreme-right` (UI label: `Spillover Extreme Right`)
- Preferred Customer planner now supports:
  - direct-level controls (`left`, `right`)
  - spillover side controls (`spillover-left`, `spillover-right`)
  - far-edge strategies (`extreme-left`, `extreme-right`)
- Placement strategy behavior:
  - `left/right`: direct slot intent.
  - `spillover-left/right`: spillover auto-placement by side.
  - `extreme-left/right`: far-edge placement by side.
- `left/right` direct-slot availability is validated in planner/enroll submit flows.
- Backend now accepts side-specific spillover aliases and keeps compatibility with prior placement values.
- Placement badges now render readable labels for the new control names.

## Scope

- Introduced a new free package flow under the label `Free Account`.
- Added a dedicated side-nav route/page for preferred-customer management.
- Implemented pending-member behavior so placement can be pre-assigned before upgrade.

## Implemented Behavior

### Plan + Rank

- New package key: `preferred-customer-pack`.
- Label shown in enrollment: `Free Account`.
- Starting rank for this package: `Preferred Customer`.
- Upgrade order now supports:
  - `Free Account -> Personal -> Business -> Infinity -> Legacy`

### Preferred Customer Page

- Added side-nav route:
  - `/PreferredCustomer`
- Added page key:
  - `preferred-customer`
- Preferred page is now a dedicated purchaser planning interface (not an enrollment page).
- Preferred page list is sourced from owner-attributed store purchasers (preferred/free members with purchases).
- Clicking a purchaser opens editable placement planning controls.

### Purchaser Planner

- Shows per-customer:
  - total purchased amount
  - total BP
  - invoice count
  - last purchase timestamp
- Planner editor allows:
  - placement leg (`left`, `right`, `spillover-left`, `spillover-right`, `extreme-left`, `extreme-right`)
  - spillover parent assignment mode (`auto` or `manual`)
  - assigned parent reference (manual mode) via typeable username/member ID input with suggestion list
- Save path:
  - `PATCH /api/registered-members/:memberId/placement`

### Pending + Binary Tree Placement

- Parents can pre-select placement (`left`, `right`, `spillover-left`, `spillover-right`, `extreme-left`, `extreme-right`) during enrollment.
- When both direct legs are occupied, enrollment can still target non-direct strategies (`spillover-left`, `spillover-right`, `extreme-left`, `extreme-right`).
- Spillover now supports two assignment modes:
  - `Auto Assign Parent` (system picks next available slot on selected spillover side)
  - `Assign Specific Parent` (manual parent reference from direct-child suggestions)
- Preferred/free members are excluded from binary-tree rendering while pending.
- Placement metadata is preserved on the member record.
- After upgrade to paid package, member becomes tree-eligible and is auto-placed using saved placement info.

### Store + Attribution Rules

- Preferred/Free account discount: `15%`.
- Preferred/Free account buyer does not receive BV/PV from checkout.
- BV/PV is credited to attributed store owner/upline identity.
- Owner BV credit is applied after successful checkout payment.
- Fail-safe attribution check added in invoice creation:
  - accepts both `memberStoreCode` and `memberStoreLink`
  - rejects mismatched code/link combinations

## Files Touched

- `index.html`
- `login.html`
- `backend/services/member.service.js`
- `backend/controllers/member.controller.js`
- `backend/routes/member.routes.js`
- `backend/services/invoice.service.js`
- `backend/services/admin.service.js`
- `backend/utils/auth.helpers.js`

## Known Limitations / Follow-ups

- Guest checkout auto-registration (capture details + email password issuance) still needs a complete end-to-end flow on public store landing pages.
- Current preferred flow is implemented inside the app store experience while external store landing page is still pending.
- Final rules for member store code/link authentication flow can be expanded once product direction is finalized.

## Validation

- `node --check backend/services/member.service.js`
- `node --check backend/services/invoice.service.js`
- `node --check backend/services/admin.service.js`
- `node --check backend/utils/auth.helpers.js`
- Inline script parse check passed:
  - `index.html` (2 script blocks)
  - `login.html` (2 script blocks)

## Recent Update (2026-04-06) - User Preferred Customer Visibility After Admin Transfer

- Fixed member-side `Preferred Customer` list rendering in `index.html` so admin-transferred preferred accounts are visible even when they have no invoice history yet.
- Previous behavior:
  - planner filtered preferred members under sponsor, then removed rows when `matchedInvoices.length === 0`.
  - transferred preferred accounts could disappear from user view if invoice attribution/history did not match owner filters.
- New behavior:
  - assigned preferred members now remain visible with zeroed totals until purchases exist.
  - purchase metrics still aggregate when matching invoices are present.
  - list sort now falls back to member `createdAt` when purchase timestamps are absent.
- UI copy update:
  - empty-state text changed from purchase-centric wording to assignment-centric wording.

### Files updated

- `index.html`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`
- `Claude_Notes/preferred-customer-page.md`

### Validation

- `index.html` inline scripts parse OK:
  - `All inline scripts parsed successfully. Blocks: 2`

## Recent Update (2026-04-15) - Preferred Registration Page UX Refresh

### What Changed

- Reworked `store-register.html` into a full-page registration experience consistent with the updated Preferred storefront visual language.
- Added attribution-aware status card behavior by calling `GET /api/preferred/claim`:
  - member-linked claim -> displays owner/store attribution context
  - direct traffic/no claim -> displays admin-parking default context.
- Updated registration draft handling:
  - new storage key: `ldp-preferred-registration-draft-v1`
  - persists buyer/account fields for downstream checkout step.
- Continued handoff behavior:
  - submit -> validates fields -> persists draft -> routes to checkout entry URL with `mode=free-account&register=1`.

### Files Updated

- `store-register.html`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`
- `Claude_Notes/preferred-customer-page.md`

### Design Decisions

- Kept registration and attribution messaging explicit to reduce confusion between attributed and direct registrations.
- Preserved existing backend handoff contract instead of introducing a new registration API in this pass.
- Removed legacy UI naming references from the page content.

### Validation

- Inline script parse for `store-register.html` passed.
- Search for legacy text markers (`Charge`, `CHG-`) in `store-register.html` returned no matches.

## Recent Update (2026-04-15) - Reference-Matched Registration Redesign

### What Changed

- Replaced `store-register.html` with a strict reference-match redesign:
  - top black navigation bar
  - centered `You made it!` registration form screen
  - post-submit `Thank you for Joining!` confirmation screen.
- Simplified visible UI by removing prior side panels, attribution card, legal blocks, and extra CTA controls.
- Kept submission behavior simple:
  - validates email/username/first/last name
  - persists registration draft
  - toggles into thank-you view.

### Files Updated

- `store-register.html`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`
- `Claude_Notes/preferred-customer-page.md`

### Design Decisions

- Prioritized visual parity with provided screenshots over previous enhanced layout structure.
- Implemented two on-page states (form -> thank-you) to mirror both reference images in one route.

### Validation

- Inline script parse for `store-register.html` passed.

## Recent Update (2026-04-15) - Registration Design Refinement (Apple-Style Tokens)

### What Changed

- Applied a targeted visual refinement pass to `store-register.html` based on updated UI tokens:
  - background set to `#FFFFFF`
  - font set to Inter at medium weight (`500`)
  - input surfaces set to `#E2E2E2`
  - placeholder text set to `#444444`
  - join button color set to `#077AFF`.
- Improved vertical spacing and proportion balance across:
  - top navigation
  - hero heading/subtext
  - input stack and CTA spacing
  - thank-you follow-up content.

### Files Updated

- `store-register.html`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`
- `Claude_Notes/preferred-customer-page.md`

### Validation

- Inline script parse for `store-register.html` passed.
- Visual token scan confirmed updated color and typography values in CSS.

## Recent Update (2026-04-15) - Field Text Weight Correction

### What Changed

- Updated `store-register.html` input typography:
  - input text weight changed to regular (`400`)
  - placeholder weight changed to regular (`400`).

### Files Updated

- `store-register.html`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`
- `Claude_Notes/preferred-customer-page.md`

### Validation

- Inline script parse for `store-register.html` passed.

## Recent Update (2026-04-15) - Direct Setup Password Link Added on Registration Thank-You

### What Changed

- Added a `Set Password Now` action to `store-register.html` thank-you state.
- CTA behavior now:
  - starts with direct fallback setup URL (`/store-password-setup.html` with audience/email/store context)
  - attempts backend token-link recovery through `/api/member-auth/setup-password?email=...`
  - upgrades CTA to tokenized setup link when available.
- Added setup status helper text below CTA.

### Files Updated

- `store-register.html`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`
- `Claude_Notes/preferred-customer-page.md`

### Validation

- Inline script parse check passed for `store-register.html`.

## Recent Update (2026-04-15) - Store Password Setup Link Recovery

### What Changed

- Updated `store-password-setup.html` missing-token behavior:
  - when `token` is absent but `email` is present, page now attempts setup-link recovery using `/api/member-auth/setup-password?email=...`
  - redirects automatically to returned tokenized setup link when available
  - keeps `store` attribution in redirect query.
- Added clearer status messaging for cases where setup token is not yet issued.

### Files Updated

- `store-password-setup.html`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`
- `Claude_Notes/preferred-customer-page.md`

### Validation

- Inline script parse check passed for `store-password-setup.html`.

## Recent Update (2026-04-15) - Registration Now Returns Immediate Setup Password Link

### What Changed

- `store-register.html` now submits directly to backend preferred registration endpoint:
  - `POST /api/store-checkout/preferred-register`
- On successful registration, thank-you screen now gets immediate setup response and shows:
  - `Set Password Now` with returned tokenized setup link
  - no retry/waiting message dependency.
- Existing-account fallback:
  - if account already has password setup, thank-you CTA switches to login continuation.

### Files Updated

- `store-register.html`
- `backend/services/store-checkout.service.js`
- `backend/controllers/store-checkout.controller.js`
- `backend/routes/store-checkout.routes.js`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`
- `Claude_Notes/preferred-customer-page.md`

### Validation

- Backend syntax checks passed for updated route/controller/service files.
- Inline script parse for `store-register.html` passed.
