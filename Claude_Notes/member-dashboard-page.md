# Member Dashboard Page Notes

Last Updated: 2026-04-26

## Scope

- Page: `index.html`
- Purpose: Primary authenticated member dashboard shell and module host.

## Recent Update (2026-04-26) - Server Cutoff Panel Identity Sync + `@username` Handling

### What Was Changed

- Updated cutoff metrics identity flow in `index.html`:
  - replaced static `cutoffIdentityPayload` capture with dynamic per-request identity resolution.
  - added fallback identity candidates from session:
    - `id/userId/memberId`
    - `username/memberUsername`
    - `email/userEmail/login`
  - normalized username for cutoff API queries by stripping leading `@`.
- Updated session hydration flow in `index.html`:
  - after successful `/api/member-auth/session` merge, triggers cutoff metrics refresh so server cutoff panel can update immediately.
- Updated backend `backend/services/cutoff.service.js`:
  - identity matching now considers both raw username and `@`-stripped username for query/record matching.

### Files Affected

- `index.html`
- `backend/services/cutoff.service.js`
- `Claude_Notes/member-dashboard-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Design Decisions

- Kept existing cutoff display math unchanged and focused patch scope on identity resolution and sync timing.
- Added normalization on both UI and API sides to avoid silent identity misses.

### Known Limitations

- In this environment snapshot, forced cutoff history/state tables are empty, so loop carry-forward will not appear consumed until a cutoff is actually applied.

### Validation

- `node --check backend/services/cutoff.service.js` passed.
- Inline script parse check for `index.html` passed (`INLINE_SCRIPT_PARSE_OK blocks=3`).
- Verified service behavior: `getMemberServerCutoffMetrics({ username: '@zeroone' })` resolves member metrics.

## Recent Update (2026-04-24) - Enroll Member Package Dropdown Removes Free Account Option

### What Was Changed

- Updated user dashboard Enroll Member package selectors in `index.html`:
  - removed `Free Account - $0` from `#enroll-member-package`
  - removed `Free Account - $0` from `#tree-enroll-package`
- Kept free-account package metadata/constants intact for existing account handling and historical records.

### Files Affected

- `index.html`
- `Claude_Notes/member-dashboard-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Design Decisions

- Limited this change to the member-facing Enrollment Package UI so paid packages remain selectable without altering backend package resolution behavior.

### Known Limitations

- Existing preferred/free account enrollments and related logic remain supported in code; this update only removes that option from user-facing enrollment dropdowns.

### Validation

- Verified both enrollment package dropdowns now list paid builder packages only.

## Recent Update (2026-04-18) - No Dashboard Flash Before Login Redirect

### What Was Changed

- Added a head-level auth boot visibility gate in `index.html`:
  - set `data-auth-boot='pending'` immediately during auth preflight
  - hide page body while auth boot is pending.
- Extended preflight check to reject expired local auth snapshots (`authTokenExpiresAt`) before render.
- Updated async startup bootstrap to set `data-auth-boot='ready'` only after server session validation succeeds.
- Resulting flow:
  - invalid/missing/expired session -> redirect to `login.html` without dashboard paint
  - valid session -> reveal page and continue dashboard bootstrap.

### Files Affected

- `index.html`
- `Claude_Notes/member-dashboard-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Design Decisions

- Kept the page hidden until server auth validation resolves to prevent any visible dashboard skeleton flash for invalid sessions.
- Used the existing boot script path to avoid introducing another auth bootstrap endpoint.

### Known Limitations

- If JavaScript is disabled, the member dashboard page stays hidden by design because auth boot gating is JS-driven.

### Validation

- Inline script parse check passed for `index.html` (`3` blocks).

## Recent Update (2026-04-18) - Strict Session Validation Before Dashboard Boot

### What Was Changed

- Added a local session usability gate in `index.html` so dashboard boot now requires:
  - a persisted session object
  - a non-empty `authToken`
  - a non-expired `authTokenExpiresAt` value (when provided).
- Added startup server-session validation (`validateMemberAuthSessionWithServer`) before member dashboard module initialization.
- Updated startup flow to clear browser session storage and redirect to `login.html` when server responds unauthorized (`401`/`403`) for the session token.
- Moved dashboard boot initialization calls under async bootstrap (`bootstrapMemberDashboardApp`) so protected modules load only after session validation.

### Files Affected

- `index.html`
- `Claude_Notes/member-dashboard-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Design Decisions

- Reused an existing authenticated endpoint (`/api/member-auth/email-verification-status`) as startup session validator to avoid introducing a new API route for this pass.
- Kept non-auth server failures non-blocking so temporary backend outages do not force unnecessary sign-outs.

### Known Limitations

- If server validation endpoint is temporarily unavailable (non-auth failure), dashboard still boots from local session snapshot in this pass.

### Validation

- Inline script parse check passed for `index.html` (`2` blocks).

## Recent Update (2026-04-16) - Startup Boot Stabilization

### What Was Changed

- Added an auth preflight script in `<head>` to check for a session token before dashboard render.
- Added guarded login redirect helper (`redirectToLogin`) to avoid duplicate redirect triggers.
- Replaced blocking synchronous boot hydration (`XMLHttpRequest` sync call) with non-blocking async session sync (`fetch`).
- Updated startup session handling so transient/non-auth failures no longer force immediate redirect.
- Preserved strict redirect behavior for explicit unauthorized responses (`401` / `403`).

### Files Affected

- `index.html`
- `Claude_Notes/member-dashboard-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Design Decisions

- Keep startup responsive by removing network work from the synchronous render-critical path.
- Maintain security for expired/invalid sessions while preventing false-positive login bounces caused by temporary backend interruptions.

### Known Limitations

- Dashboard can continue from local session snapshot when session sync endpoint is temporarily unavailable; hard invalidation still occurs on explicit unauthorized responses.

### Validation

- Parsed plain inline scripts successfully in `index.html` (`3` blocks).

## Recent Update (2026-04-16) - My Store Side Nav Migrated to Latest Store Flow

### What Was Changed

- Updated dashboard `My Store` storefront view in `index.html` to reuse `store.html` directly through an embedded iframe container.
- Added `syncStorefrontEmbedFrame(...)` to keep embed URL synced to the active store code.
- Triggered storefront iframe sync on My Store init and when switching back to storefront tab.
- Kept old storefront block hidden (`#storefront-legacy-flow`) as rollback fallback.

### Files Affected

- `index.html`
- `Claude_Notes/member-dashboard-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Design Decisions

- Avoided re-implementing the latest store UI in two places; dashboard now references a single canonical flow.

### Known Limitations

- Embedded frame currently uses fixed height; follow-up can add dynamic height sync for long/short product states.

### Validation

- Inline script parse checks passed:
  - `index.html` (`3` blocks)

## Recent Update (2026-04-16) - My Store Component Migration (Store + Cart + Continue to Stripe)

### What Was Changed

- Corrected My Store implementation to use direct dashboard components (not iframe embed).
- Replaced storefront area in `index.html` with:
  - Store product grid component
  - Cart component
  - Continue to Stripe button in cart panel.
- Updated renderers for product cards/cart rows to match latest store component style language.
- Checkout CTA now triggers hosted checkout directly from storefront cart panel.

### Logic Guardrails

- Preserved existing checkout attribution/PV-BV pathways (session creation/finalization + buyer attribution fields + PV reconcile path).

### Files Affected

- `index.html`
- `store.html`
- `Claude_Notes/member-dashboard-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Validation

- Inline script parse checks passed:
  - `index.html` (`3` blocks)

## Recent Update (2026-04-16) - My Store Final Structure Alignment (Store + Cart + Share and Earn)

### What Was Changed

- Removed extra top storefront containers and shareable-link presentation from My Store storefront view.
- Kept only the requested functional sections:
  - Store products panel
  - Cart panel + Continue to Stripe
  - Share and Earn footer section with Copy Store Link.
- Updated storefront sizing scale to align closer with `store.html` proportions.

### Logic Guardrail

- Retained existing store checkout and PV/BV attribution backend flow without functional changes.

### Files Affected

- `index.html`
- `Claude_Notes/member-dashboard-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Validation

- Inline script parse check passed (`index.html`: `3` blocks).

## Recent Update (2026-04-16) - My Store First Open Layout Stability Pass

### What Was Changed

- Added root scrollbar gutter stabilization and tuned storefront layout breakpoints to match store-page behavior.
- Added discount badge width stabilization to avoid small header reflow during first hydration update.

### Files Affected

- `index.html`
- `Claude_Notes/member-dashboard-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Validation

- Inline script parse check passed (`index.html`: `3` blocks).

## Recent Update (2026-04-16) - My Store Warm Init + Asset Preload

### What Was Changed

- Started `initMyStore()` earlier during dashboard boot so storefront data/assets warm-load while user is on Home.
- Added product-image warm-preload helper and integrated it into My Store initialization.
- Added stable Store loading placeholder and product-grid min-height to reduce first-open panel expansion/jitter.

### Files Affected

- `index.html`
- `Claude_Notes/member-dashboard-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Validation

- Inline script parse check passed (`index.html`: `3` blocks).

## Recent Update (2026-04-16) - My Store Product Image First-Paint Stability Tightening

### What Was Changed

- Extended My Store warm-load to complete in background before first My Store open when possible.
- Added timeout-safe image preload settle logic.
- Added explicit image attributes and first-paint rendering hints to reduce initial stretch artifacts.

### Files Affected

- `index.html`
- `Claude_Notes/member-dashboard-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Validation

- Inline script parse check passed (`index.html`: `3` blocks).

## Recent Update (2026-04-16) - Store Card Image Ready-State Reveal

### What Was Changed

- Added a storefront image-ready reveal helper so product images become visible only once image load/settle occurs.

### Validation

- Inline script parse check passed (`index.html`: `3` blocks).

## Recent Update (2026-04-17) - Removed Legacy Binary Tree Nav Entry

### What Was Changed

- Removed the `Binary Tree (Old)` sidebar link from the member dashboard Build section.
- Kept `Binary Tree (Next Gen)` in place as the single visible Binary Tree nav option.

### Files Affected

- `index.html`
- `Claude_Notes/member-dashboard-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Validation

- Verified no `Binary Tree (Old)` string remains in `index.html` or `admin.html`.

## Recent Update (2026-04-17) - Legacy Binary Tree Route Retirement + Official Naming

### What Was Changed

- Renamed member sidebar label from `Binary Tree (Next Gen)` to `Binary Tree`.
- Removed legacy `/BinaryTree` page mapping from member dashboard route map.
- Added explicit fallback handling for retired binary-tree route patterns so legacy typed paths resolve to dashboard.

### Files Affected

- `index.html`
- `Claude_Notes/member-dashboard-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Validation

- Verified no remaining `/BinaryTree` or `/admin/BinaryTree` route-map entries in `index.html`/`admin.html`.
- Verified no remaining `Binary Tree (Next Gen)` labels in dashboard HTML files.

## Recent Update (2026-04-21) - Sidebar Records: Purchases Replaced with Invoice Portal Action

### What Was Changed

- Replaced member sidebar `Purchases` nav item (Records section) with `Invoice`.
- Updated icon to `open_in_new` to indicate external Stripe-hosted billing destination.
- Removed the Settings Payment page button that previously launched Stripe portal.
- Bound the new sidebar `Invoice` entry to existing `requestSettingsBillingPortalSession()` flow.

### Design Decision

- Kept existing backend endpoint + helper (`POST /api/member-auth/billing/portal`) unchanged.
- Performed a UI trigger-location refactor only, minimizing regression risk.

### Files Affected

- `index.html`
- `Claude_Notes/member-dashboard-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Validation

- Verified no remaining `settings-billing-portal-button` references in `index.html`.
- Verified sidebar shows `Invoice` entry with `open_in_new` icon in Records group.

## Recent Update (2026-04-21) - E-Wallet Stripe Connect Payout UX + Request Lifecycle

### What Was Changed

- Added payout account readiness block inside E-Wallet with Stripe Connect status, onboarding action, and requirements messaging.
- Added payout request history rendering in the E-Wallet panel, including open-request totals and status chips.
- Updated payout request validation UX to enforce backend-aligned `$20` minimum with clear user-facing messaging.
- Updated payout request amount validation to use requestable balance (`wallet balance - open payout requests`) instead of raw wallet total.
- Kept commission-to-wallet transfer minimum (`$0.01`) separate from payout-withdrawal minimum to avoid changing existing transfer behavior.

### Files Affected

- `index.html`
- `Claude_Notes/member-dashboard-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Design Decisions

- Reused existing E-Wallet panel structure instead of introducing a new dashboard section.
- Preserved app-first ledger ownership and used Stripe only for connected-account readiness + payout infrastructure.

### Known Limitations

- Current member UI provides onboarding launch + request workflow, while final payout execution remains admin-fulfillment driven.

### Validation

- Inline script parse checks passed for `index.html`.
- Backend payout endpoints enforce the same minimum/balance rules server-side to prevent client-only bypass.

### Addendum (2026-04-21) - Backend Payout Eligibility Error Handling

- Added payout-service guard for Stripe Connect status resolution failures so member payout requests return clear service-unavailable style errors (`503`) instead of generic 500 responses.
- UX impact: member dashboard now surfaces backend error messaging more consistently during Stripe outages/misconfiguration.

### Addendum (2026-04-21) - E-Wallet Payout Submission Auth Binding

- Hardened payout submission path so authenticated member identity is enforced server-side.
- `POST /api/e-wallet/request-payout` now requires member auth and no longer trusts client-provided user identifiers for payout requests.

### Addendum (2026-04-21) - Member Payout History Auth Scope

- Hardened payout-history fetch path so member payout requests are loaded through authenticated scope instead of trusting query identifiers alone.
- Frontend now attaches member bearer token when requesting payout history.

### Addendum (2026-04-21) - Direct Payout Request API Auth Scope

- Applied member-auth requirement to direct payout request creation path (`POST /api/payout-requests`).
- Member identity for direct payout creation is now enforced server-side from authenticated session context.

### Addendum (2026-04-21) - Instant Stripe Fulfillment UX Alignment

- Member payout requests now complete through instant backend Stripe auto-fulfillment by default.
- E-Wallet payout feedback/activity messaging now reflects immediate processed/paid status when Stripe completion succeeds.
- Admin fulfillment form no longer hard-requires bank details, reducing friction for Stripe-mode operations.

### Addendum (2026-04-21) - Instant Stripe Payout Reliability (Auto-Retry)

- Backend now retries failed Stripe-mode payouts automatically when failures are retryable (insufficient available funds by default).
- No manual backend restart is required for balance-lag recovery; retry worker runs on interval in server process.
- Stripe balance.available webhook now triggers immediate retry attempt when available balance arrives.
- Payout lifecycle remains app-owned (Requested -> Processing -> Paid/Failed) and retry attempts are logged through payout status history metadata.
### Addendum (2026-04-21) - E-Wallet Stripe Dashboard Button

- Added a new `Stripe Dashboard` button in the E-Wallet payout-account panel.
- Button opens Stripe Express dashboard through a secure backend-issued login link.
- Button is disabled while payout-account status is loading and enabled when a connected Stripe account exists.
- Existing payout-account action button remains in place for connect/onboarding/refresh.
### Addendum (2026-04-21) - E-Wallet Stripe Management Action Fix

- Ready payout accounts now use a direct Stripe management path (`Manage Stripe`) instead of status refresh behavior.
- Stripe dashboard open errors now remain visible in payout feedback instead of immediately falling back to loading-status behavior.
### Addendum (2026-04-21) - Stripe Bank-Payout Synchronization

- Backend payout flow now creates Stripe connected-account payouts during Stripe fulfillment (transfer + payout sequence).
- This supports closer parity between member-requested payout amount and Stripe bank payout object amount.
- Added payout webhook synchronization for `payout.paid`, `payout.failed`, and `payout.canceled` events.
- Added wallet-balance restoration path when Stripe reports payout failure after app-side paid transition.

Files affected:
- `backend/services/stripe-client.service.js`
- `backend/services/payout.service.js`
- `backend/stores/payout.store.js`
- `backend/services/stripe-webhook.service.js`
- `Claude_Notes/member-dashboard-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

Known limitation:
- Actual bank arrival timing remains dependent on Stripe payout method and destination support.

### Addendum (2026-04-21) - Payout Speed Option in Member E-Wallet Modal

- Added `Payout Speed` selector in member E-Wallet payout modal with two values:
  - `Instant`
  - `Standard`
- Frontend now sends `payoutMethod` in payout request payload.
- Backend payout flow now carries selected payout method through E-Wallet request handling into Stripe fulfillment.
- No fee amount display/charge line was added in this pass.

Files affected:
- `index.html`
- `backend/services/wallet.service.js`
- `backend/services/payout.service.js`
- `Claude_Notes/member-dashboard-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

Known limitation:
- Fee messaging remains generic until Stripe fee model confirmation is finalized.

## Update (2026-04-22) - My Store Personal BV Credit Fix (Known Member Guest Checkout)

### What Was Changed

- Fixed checkout settlement in backend so member-dashboard store purchases made in guest checkout mode still treat known member buyers as buyer-credit eligible.
- Added finalize-time compatibility fallback so older/legacy sessions with `buyer_bv=0` but known buyer identity can still credit buyer BV using `invoice_bv`.
- Ran one-time completion for paid `zeroone` store session to recover missing BV and invoice.

### Files Affected

- `backend/services/store-checkout.service.js`
- `Claude_Notes/member-dashboard-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Result

- `zeroone` now reflects `1038` Personal BV after MetaCharge checkout recovery (`+38 BV`).
- Missing paid checkout record is now captured as invoice `INV-240930`.

### Validation

- `node --check backend/services/store-checkout.service.js` passed.
- Checkout completion output confirmed `buyerCredit.ok=true` with `pvGain=38`.
- DB verification confirmed updated BV and new invoice row.

## Addendum (2026-04-22) - My Store Checkout Return Timing Fix

### What Was Changed

- Updated `initMyStore()` in `index.html` to finalize hosted checkout return immediately on function entry.
- Removed delayed duplicate return handling near end of store initialization.

### Why

- Route replacement during app bootstrap could clear `checkout/session_id` before delayed handler executed.
- This caused paid Stripe sessions to be left unfinalized (no invoice + no BV update).

### Recovery Performed

- Finalized missed paid session for `zeroone` (`cs_test_a1SrK24VGJdlzv9ziDE7TPPQFUTkFSXWT4yo1XhvAU60mdodWcpSIbozOW`).
- Created invoice `INV-240931` and applied `+38 BV`.
- Confirmed `zeroone` now at `1076` Personal BV.

### Files Affected

- `index.html`
- `backend/services/store-checkout.service.js`
- `Claude_Notes/member-dashboard-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

## Addendum (2026-04-22) - My Store Duplicate BV Credit Prevention

### What Was Changed

- Added advisory-lock guard in backend store checkout settlement so the same invoice id cannot finalize concurrently across webhook + frontend return calls.
- Settlement lock key uses `store-checkout:${invoiceId}` and wraps invoice create + buyer/owner credit operations.

### Why

- Concurrent completion paths could credit BV twice before invoice dedupe became visible.

### Recovery

- Corrected `zeroone` from `1152` to expected `1114` Personal BV by reversing one duplicate `+38` credit.

### Files Affected

- `backend/services/store-checkout.service.js`
- `Claude_Notes/member-dashboard-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

## Addendum (2026-04-22) - My Store Frontend PV Reconcile Disabled (Post-Settlement Double Add)

### What Was Changed

- Removed the `initMyStore()` call to `reconcileExistingStorePurchasePv()` in `index.html`.
- This blocks client-initiated fallback PV top-ups after store invoice refresh.

### Why

- After Stripe success return, backend settlement already credited buyer BV.
- Client reconciliation compared invoice totals against a potentially stale session snapshot and could compute `missingPv=38`, then call `/api/member-auth/record-purchase` again.
- This created `+76` net movement for a single `+38` checkout.

### Recovery Performed

- Reconciled `zeroone` from `1228` back to invoice-backed `1190`.
- Updated:
  - `charge.member_users.current_personal_pv_bv`
  - `charge.member_users.starter_personal_pv`
  - `charge.registered_members.starter_personal_pv`

### Files Affected

- `index.html`
- `Claude_Notes/member-dashboard-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Validation

- Latest invoice `INV-240934` posted once with `bp=38`.
- `zeroone` now matches posted invoice sum at `1190` Personal BV.

## Addendum (2026-04-22) - My Store Personal BV Card Real-Time Refresh

### What Was Changed

- Added `syncSessionAfterStoreCheckoutCompletion(...)` to My Store checkout return flow in `index.html`.
- After successful hosted checkout completion, the flow now:
  - applies immediate session patch from completion payload (when provided)
  - fetches fresh member session state from backend
  - reapplies `applySessionUserPatch(...)` to refresh dashboard/store UI

### Why

- Backend BV credit was already correct, but frontend session data remained stale until reload.
- Personal BV card depended on session patch/re-render and therefore lagged one refresh cycle.

### Files Affected

- `index.html`
- `Claude_Notes/member-dashboard-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Validation

- Checkout success return now updates Personal BV card without manual browser reload.

## Addendum (2026-04-22) - Preferred Account Owner BV Settlement Correction

### What Was Changed

- Updated owner resolution in checkout/invoice backend paths to prefer direct owner codes:
  - `storeCode`
  - `publicStoreCode`
- `attributionStoreCode` now acts as a fallback only when it maps to one unique user.

### Why

- Shared attribution codes across downlines/preferred accounts could resolve the wrong owner in `created_at DESC` order.
- Wrong owner identity forced preferred settlement package math (`preferred-customer-pack`), which produced:
  - wrong owner BV target (`50` instead of expected `38`)
  - effective owner PV gain `0` (preferred account cannot accumulate purchase PV).

### Recovery Performed

- Corrected invoice `INV-240937` settlement fields:
  - `bp` set to `38`
  - `retail_commission` set to `20`
  - `settlement_profile_json.ownerBv` set to `38`
- Applied one-time missing owner credit to `zeroone` (`+38`), bringing account to `1304`.

### Files Affected

- `backend/services/store-checkout.service.js`
- `backend/services/invoice.service.js`
- `Claude_Notes/member-dashboard-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`
- `Claude_Notes/public-store-page.md`

### Validation

- Simulated preferred checkout now resolves `ownerBv=38` and `settlementPackageKey=legacy-builder-pack`.

## Addendum (2026-04-22) - Preferred Customer Planner Purchase Data Linkage

### What Was Changed

- Updated preferred planner invoice identity matcher in `index.html`:
  - continues matching on `buyerUserId` and `buyerUsername`
  - now also matches by `buyerEmail` for preferred-buyer checkouts

### Why

- Preferred customer public-store purchases can finalize as guest checkouts with email-only buyer identity.
- Planner previously ignored email-only invoices, so purchase totals/BV/invoice counts looked incorrect.

### Files Affected

- `index.html`
- `Claude_Notes/member-dashboard-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Validation

- Matching simulation confirms preferred member `usertesting` now links to invoice `INV-240937`.

## Addendum (2026-04-22) - My Store Preferred Attribution + Immediate Card Refresh

### What Was Changed

- My Store checkout payload now passes routed attribution code:
  - `storeCode: resolveCheckoutStoreRouting().attributionKey`
- Added stronger post-checkout sync path:
  - applies `buyerCredit.user` patch immediately when returned
  - applies `ownerCredit.user` patch when it matches current session identity
  - hydrates session user from backend
  - reloads registered members to refresh tree-dependent dashboard cards

### Why

- Preferred account purchases rely on owner settlement attribution.
- Empty `storeCode` in dashboard checkout could leave owner attribution unresolved.
- Some cards depended on registered member/tree data and stayed stale until reload.

### Files Affected

- `index.html`
- `backend/services/store-checkout.service.js`
- `Claude_Notes/member-dashboard-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Validation

- Checkout return flow now calls session+member refresh path in-place.
- `node --check backend/services/store-checkout.service.js` passed.
- `index.html` inline script parse check passed.

## Update (2026-04-25) - Membership Placement Reservation Dashboard/Store Restrictions

### What Changed

- Added reservation package option to dashboard enrollment selectors:
  - `#enroll-member-package`
  - `#tree-enroll-package`
- Added pending/reservation account helpers and a unified gate message in `index.html`.
- Dashboard account status rendering now supports explicit `Pending` state:
  - status badge class updates
  - pending-aware activity label/ARIA messaging
  - pending-specific upgrade CTA messaging
- Enrollment/sponsor-related dashboard actions now block pending users and show upgrade-required feedback.
- Preferred customer and tree-enroll submission flows now block pending users client-side before API call.
- Business center activation panel now enters `Upgrade Required` state for pending accounts and prevents activation/sync actions.
- My Store restrictions for pending users:
  - share/store links are masked as upgrade-required
  - copy link buttons are hidden/disabled
  - checkout actions are disabled with upgrade-required text
  - checkout/invoice creation paths are blocked with upgrade gate feedback

### Files Affected

- `index.html`

### Design Decisions

- Kept dashboard/tree/store pages accessible for reservation members, but converted all earning/enrollment controls to upgrade-gated actions.
- Added client-side guardrails as UX reinforcement while relying on backend checks for final enforcement.

### Known Limitations

- Final enforcement depends on backend APIs (implemented in this rollout); frontend guards are intentionally defensive and not standalone security controls.

### Validation

- Inline flow checks were updated and syntax-sensitive backend endpoints were validated with `node --check`.

## Update (2026-04-25) - Reservation User Dashboard Feedback Polish

### What Changed

- In `index.html` dashboard KPI rendering (`renderDashboardAccountOverviewKpi`):
  - pending reservation users now display `Rank: --` in the `Account Active Until` card instead of inherited package rank labels.
- Added upgrade-required toast helpers in `index.html`:
  - `ensureAccountUpgradeToastElement(...)`
  - `showAccountUpgradeRequiredToast(...)`
- Updated restricted navigation feedback for pending reservation users:
  - blocked `Enroll Member` / `Preferred Customers` route attempts now show toast `Account Upgrade Required.`
  - applies to sidebar nav clicks and quick-action Enroll Member click path.

### Files Affected

- `index.html`

### Design Decisions

- Kept existing pending restriction logic and route fallback behavior; added toast feedback as a UX enhancement.
- Limited rank suppression to the requested dashboard KPI section to avoid broad rank-state regressions.

### Validation

- Inline script parse check passed for `index.html`.

## Addendum (2026-04-26) - KPI UI Rework: Weekly Cycle Cap Moved to Server Cutoff Card

### What Changed

- In `index.html`:
  - removed Sales Team KPI card cycle summary line and progress bar.
  - added `#server-cutoff-cycle-cap-summary` under Server Cutoff `Estimated Cycles`.
  - updated `renderSalesTeamCommissionsCard(...)` to:
    - stop rendering `Awaiting server cutoff before cycles are credited.` on Sales Team card.
    - render `Weekly cycle cap: X / Y` (and overflow suffix when applicable) inside Server Cutoff panel.

### Design Decisions

- Kept Sales Team card focused on monetary KPI and payout CTA.
- Moved cycle-cap context to cutoff panel because it is cutoff/cycle operational data.

### Validation

- Inline script parse check passed for `index.html` (`INLINE_SCRIPT_PARSE_OK blocks=3`).

## Addendum (2026-04-26) - Server Cutoff First-Load Volume Hydration Fix

### What Changed

- In `index.html`:
  - updated `queueBinaryTreeMetricsSnapshotSync(...)` to call `updateServerCutoffMetrics()` after successful snapshot POST completion.
  - reduced `cutoffMetricsSyncDelayAfterSummaryMs` from `700` to `200` for faster first-load and post-summary cutoff panel updates.

### Design Decisions

- The cutoff card now refreshes after the snapshot write completes, preventing stale first-call reads that required manual reload before.

### Validation

- Inline script parse check passed for `index.html` (`INLINE_SCRIPT_PARSE_OK blocks=3`).

## Addendum (2026-04-26) - Sales Team Commission Card Uses Settled Post-Cutoff Data

### What Changed

- In `index.html`:
  - added settled Sales Team commission loader (`loadSettledSalesTeamCommissionSnapshotForCurrentUser`) using `GET /api/sales-team-commissions`.
  - updated `renderSalesTeamCommissionsCard(...)` to require cutoff settlement (`lastAppliedCutoffAt`) before showing cycles/commission.
  - card now displays waiting message pre-cutoff: `Awaiting server cutoff before cycles are credited.`
  - removed member runtime pre-cutoff Sales Team snapshot writes by no-oping `queueSalesTeamCommissionSnapshotSync(...)`.
  - tied settled Sales Team refresh to cutoff timestamp changes in `applyServerCutoffMetricsPayload(...)`.
  - bootstrap now initializes payout offsets + commission containers + settled Sales Team state via `initializeCommissionRuntimeState(...)`.
  - session user patch path now refreshes settled Sales Team snapshot to keep identity data aligned.

### Design Decisions

- Sales Team reward KPI is now settlement-driven, not live loop-estimate-driven.
- Payout eligibility follows settled balance only, so pre-cutoff loops cannot be transferred.

### Known Limitations

- If cutoff metrics payload is temporarily unavailable, Sales Team card remains conservative (0 + waiting state) until cutoff data is restored.

### Validation

- Inline script parse check passed for `index.html` (`INLINE_SCRIPT_PARSE_OK blocks=3`).

## Addendum (2026-04-26) - My Store Account Upgrades Checkout (Index)

### What Changed

- Added a new Account Upgrades block inside `My Store` in `index.html`:
  - upgrade package cards for available tiers above current package
  - product selection options:
    - `All MetaCharge™`
    - `All MetaRoast™`
    - `Split Products`
  - dynamic quote summary + product allocation preview
  - dedicated `Checkout Upgrade in Stripe` action
- Added frontend upgrade allocation logic in dashboard store runtime:
  - mode normalization for all/split selections
  - split eligibility gating by target package (Business and above only)
  - ownership-aware split distribution preview using current package product key
- Added upgrade checkout submission path using existing store checkout session API with account-upgrade metadata fields.
- Updated hosted checkout completion synchronization to patch session user from `accountUpgrade.user` when returned.

### Design Decisions

- Kept standard cart checkout and account upgrade checkout separate to keep user intent explicit.
- Used backend-compatible allocation math in frontend preview to avoid mismatch between quote and post-payment result.

### Known Limitations

- Upgrade checkout requires active/in-stock `MetaCharge` and `MetaRoast` items in product catalog; unavailable stock blocks upgrade checkout.

### Validation

- Inline script parse check passed for `index.html`.

## Addendum (2026-04-25) - Upgrade Toast Visual Positioning Tweak

### What Changed

- Updated `ensureAccountUpgradeToastElement(...)` in `index.html`:
  - moved toast anchor to bottom-center/below-center of viewport.
  - switched to red warning palette and centered message alignment.

### Validation

- Inline script parse check passed for `index.html`.

## Addendum (2026-04-25) - Toast Text Color Update

### What Changed

- Updated upgrade-required toast text class to `text-white` in `index.html` for better contrast.

### Validation

- Inline script parse check passed for `index.html`.

## Addendum (2026-04-25) - Toast Duration Tuning

### What Changed

- Updated upgrade-required toast visible duration to `3200ms` in `index.html`.

### Validation

- Inline script parse check passed for `index.html`.

## Addendum (2026-04-25) - In-Place Toast On Restricted Enroll/Preferred Navigation

### What Changed

- Adjusted `setPage(...)` restricted-page guard to support preserving current page during blocked nav attempts.
- Sidebar nav now requests in-place restriction handling and toast display.
- Removed forced dashboard redirect from quick-action enroll restricted path.

### Validation

- Inline script parse check passed for `index.html`.

## Addendum (2026-04-25) - Account Active Until Badge Strip Hidden For Reservation Users

### What Changed

- In `index.html`, `renderDashboardAccountKpiBadges(...)` now exits early for pending/reservation accounts and hides the badge strip.

### Validation

- Inline script parse check passed for `index.html`.

## Addendum (2026-04-25) - Reservation User Dashboard Panel Visibility

### What Changed

- In `index.html`, dashboard KPI render now toggles panel visibility for pending/reservation accounts:
  - hides `#business-center-panel`
  - hides `#fast-track-bonus-card`

### Validation

- Inline script parse check passed for `index.html`.

## Addendum (2026-04-25) - Upgrade Split Allocation Feedback

### What Changed

- Updated `handleAccountRankUpgrade()` success messaging in `index.html` to include backend split summary when available:
  - reads `payload.upgrade.productAllocation.splitLabel`
  - appends `Product split: ...` to upgrade confirmation.

### Validation

- Inline script parse check passed for `index.html`.

## Addendum (2026-04-25) - Reservation My Store Purchase + Personal BV

### What Changed

- In `index.html` store checkout flow:
  - removed reservation block from cart checkout state (`renderCart`).
  - removed reservation early-return gates in `checkoutCart()` and `createInvoiceFromLines(...)`.
  - restored attribution routing resolution for reservation users in `resolveRegisteredAttributionCode()` and `resolveCheckoutStoreRouting()`.
  - updated `shouldBuyerReceiveStorePurchaseBv(...)` to allow reservation buyers.

### Design Decisions

- Purchase access was enabled only for direct buyer checkout in dashboard `My Store`.
- Reservation restrictions for shareable store-link usage were intentionally left active.

### Known Limitations

- If attribution mapping is not resolvable for the account, checkout still blocks using existing attribution error path.

### Validation

- Inline script parse check passed for `index.html`.

## Addendum (2026-04-25) - Upgrade Feedback Copy: Product Allocation

### What Changed

- In `index.html` account-upgrade success feedback:
  - changed suffix label from `Product split: ...` to `Product allocation: ...`.

### Why

- Upgrade flows now support both all-product and split modes, so `allocation` is the correct neutral term.

### Validation

- Inline script parse check passed for `index.html`.

## Update (2026-04-27) - Dashboard Cycle Threshold Migration to 1000/1000

### What Changed

- `index.html`
  - updated cycle constants to `1000/1000`.
  - updated cutoff/dashboard cycle threshold normalization to enforce minimum `1000` values.
  - retained post-cutoff-only sales-team rendering behavior while reading updated settled cycle snapshots.

### Validation

- inline script parse check passed for `index.html`.

## Update (2026-04-27) - Store Checkout Earnings Rule Clarification Applied

### Changes
- Store package-earning resolution now supports preferred package-tier matrix (`50/48/44/38`) for preferred-buyer settlement.
- Paid-member settlement now always uses paid bucket BV and excludes retail commission.

### Notes
- Retail commission is now only included in preferred-buyer settlement path.
- Paid-member purchase flow remains BV-creditable but with zero retail commission.

## Update (2026-04-27) - My Store Stripe Store-Code Consistency

### What Changed
- index.html
  - esolveCheckoutStoreRouting() now returns a canonical checkout store code and uses that same value for storeLink generation.
  - Stripe checkout payloads for My Store cart and account-upgrade now use storeCode: checkoutStoreRouting.storeCode.

### Why
- Prevents backend invoice validation error when storeCode and memberStoreLink carry different normalized store codes.

### Validation
- Manual code-path audit confirms cart and upgrade Stripe payloads now share one store-code source.

## Update (2026-04-28) - My Store Popup Stripe Checkout + Receipt Modal

### What Changed
- `index.html`
  - My Store cart checkout now opens Stripe checkout in a new popup window instead of redirecting the current tab.
  - My Store account-upgrade checkout now uses the same popup behavior.
  - Added hosted-checkout return signal forwarding from popup tab back to opener tab.
  - Added My Store receipt modal summarizing checkout completion (invoice, status, amount, BV, date).
  - Added signal dedupe guard to avoid duplicate finalization when both storage and postMessage callbacks are received.

### Why
- Keeps users on `User Dashboard > My Store` while Stripe checkout happens externally.
- Prevents loss of in-page context and provides clear transaction confirmation after return.

### Validation
- Inline script parse check passed for `index.html`.

## Update (2026-04-28) - Receipt Modal Shows Processing State On Stripe Return

### What Changed
- `index.html`
  - Added receipt modal loading indicator (`store-checkout-receipt-loading`).
  - Checkout return finalization now opens receipt modal immediately with processing placeholders.
  - Receipt modal updates in-place to confirmed invoice values once finalize endpoint reports completion.
  - Failure path now clears loading and surfaces an attention status message in the modal.

### Why
- Prevents silent waiting after users return from Stripe and improves perceived responsiveness.

### Validation
- Inline script parse check passed for `index.html`.
