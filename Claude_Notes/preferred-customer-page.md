# Preferred Customer Page Notes

Last Updated: 2026-04-06
Status: In Progress (Phase 1 foundation complete)

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
