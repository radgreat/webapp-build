# Preferred Customer Page Notes

Last Updated: 2026-03-27
Status: In Progress (Phase 1 foundation complete)

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
