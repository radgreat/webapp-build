# Binary Tree Business Center Notes

Last Updated: 2026-04-08

## Scope

- Feature: Business Center placeholder nodes in binary tree.
- Area: Member-auth backend APIs, registered member storage model, binary tree summary logic, and dashboard activation UI.

## What Changed

- 2026-04-08 follow-up (stability + reset hygiene):
  - reverted Business Center activation test data for `zeroone` by restoring original primary node and removing the generated replacement row
  - restored affected downline sponsor linkage from placeholder username back to `zeroone`
  - hardened admin flush browser cleanup to remove additional member cache keys tied to Business Center-era UI/runtime state
  - updated admin flush feedback to include binary-tree snapshot and sales-team commission clear totals.
- Added authenticated Business Center APIs:
  - `GET /api/member-auth/business-centers`
  - `POST /api/member-auth/business-centers/progress`
  - `POST /api/member-auth/business-centers/activate`
- Mounted Business Center routes in backend app (`backend/app.js`).
- Implemented Business Center controller bridge (`backend/controllers/member-business-center.controller.js`).
- Added Business Center route module (`backend/routes/member-business-center.routes.js`).
- Extended Business Center service behavior:
  - manual side-pinned activation
  - one-by-one activation
  - placeholder creation and active-node insertion
  - staff/admin exclusion handling
  - progress ledger sync from completed legacy tiers
  - fixed placeholder sponsor rewire edge case
  - zeroed placeholder personal-volume fields to prevent duplication.
- Integrated Business Center panel in `index.html`:
  - status chip, cap/pending/overflow summary
  - side select (`left`/`right`)
  - activate button + inline feedback
  - automatic progress sync from Legacy Leadership completed tiers.
- Updated tree-level KPI logic to exclude Business Center placeholders from member KPIs while keeping placeholders visible.

## Files Updated

- `admin.html`
- `backend/app.js`
- `backend/controllers/member-business-center.controller.js`
- `backend/routes/member-business-center.routes.js`
- `backend/services/member-business-center.service.js`
- `backend/services/member.service.js`
- `backend/stores/member.store.js`
- `binary-tree.mjs`
- `index.html`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`
- `Claude_Notes/binary-tree-business-center.md`

## Design Decisions

- Storage model: reuse `registered_members` rows for Business Center placeholders.
- Progress source: canonical completed tier counter (`completedLegacyTierCount`) synchronized server-side.
- Activation model: manual, one-per-click, user-selected pin side.
- KPI policy: Business Center placeholders remain visible in tree but are excluded from member KPI counts.

## Known Limitations

- Requires valid member auth bearer token to access/activate Business Centers.
- Existing running server process must be restarted to pick up new mounted routes.
- Staff/admin lockout depends on `isStaffTreeAccount` flag being set on target accounts.

## Validation

- `node --check backend/services/member-business-center.service.js`
- `node --check backend/controllers/member-business-center.controller.js`
- `node --check backend/routes/member-business-center.routes.js`
- `node --check backend/app.js`
- Extracted `index.html` inline script passed `node --check`.
