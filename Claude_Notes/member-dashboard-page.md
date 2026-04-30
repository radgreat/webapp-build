# Member Dashboard Page Notes

Last Updated: 2026-04-29

## Scope

- Page: `index.html`
- Purpose: Primary authenticated member dashboard shell and module host.

## Patch Update (2026-04-29) - Auto Ship Mid-Cycle Enablement With Delayed First Charge

### What Was Changed

- Updated backend Auto Ship checkout flow in `backend/services/auto-ship.service.js` to align first recurring charge with member activity-window expiry for active accounts.
- Added scheduled anchor logic:
  - if member has future `activityActiveUntilAt`, system schedules first Auto Ship billing for `activityActiveUntilAt + 1 day`.
  - checkout session now uses Stripe subscription anchor controls for deferred first billing.
- Added status/trace fields for UI/API consumers:
  - `billingBehavior`
  - `scheduledBillingAnchorAt`
  - `nextBillingDate` fallback to scheduled anchor when period dates are not yet present.

### Outcome

- Members who enable Auto Ship in the middle of an active window are not charged immediately; first charge is deferred to renewal timing.

### Files Affected

- `backend/services/auto-ship.service.js`
- `index.html`
- `Claude_Notes/member-dashboard-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Validation

- Auto Ship checkout creation test returned scheduled anchor metadata and valid checkout URL.

## Patch Update (2026-04-29) - Auto Ship Checkout Tax Enablement

### What Was Changed

- Updated backend Auto Ship checkout session creation in `backend/services/auto-ship.service.js` to apply Stripe tax behavior:
  - `automatic_tax.enabled = true`
  - `billing_address_collection = required`
  - `customer_update` enabled for address/shipping/name.

### Outcome

- Auto Ship recurring checkout now collects required address data and applies Stripe Tax to eligible transactions/invoices.

### Files Affected

- `backend/services/auto-ship.service.js`
- `Claude_Notes/member-dashboard-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Validation

- Auto Ship checkout creation test succeeded and returned a valid Stripe-hosted checkout URL.

## Patch Update (2026-04-29) - Auto Ship Paid Invoice Surface In Member Records

### What Was Changed

- Extended backend Auto Ship reconciliation so successful Stripe subscription setup/payment can be surfaced in member-facing records even when webhook timing lags.
- Auto Ship paid invoice processing now ensures:
  - invoice/order record creation (`store_invoices`)
  - activity event write (`user_auto_ship_events`)
  - ledger audit row write (`ledger_entries`) with idempotent keying and `bv_amount=50`.
- Added idempotent backfill behavior for existing invoice rows:
  - if a Stripe invoice is already present locally, missing Auto Ship activity/ledger rows can still be created safely without duplicate invoice or BV credit.

### Files Affected

- `backend/services/auto-ship.service.js`
- `backend/stores/auto-ship.store.js`
- `index.html`
- `Claude_Notes/member-dashboard-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Validation

- Verified local records now include Auto Ship invoice + ledger + activity event for the paid Auto Ship invoice.
- Verified replay/idempotency behavior prevents duplicate rows.

## Patch Update (2026-04-29) - Auto Ship Status Badge Recovery After Stripe Checkout

### What Was Changed

- Added backend reconciliation logic in `backend/services/auto-ship.service.js` so member Settings can display correct Auto Ship status even when webhook delivery is delayed.
- `GET /api/member-auth/autoship` now attempts Stripe fallback sync using:
  - local `latestCheckoutSessionId` -> Stripe Checkout Session -> subscription sync
  - Stripe customer subscription lookup for Auto Ship candidates.
- Added checkout preflight duplicate guard in `createMemberAutoShipCheckoutSession(...)` to prevent creating a second active Auto Ship subscription when local state is stale.
- Updated Auto Ship period parsing to support Stripe subscription item period fields; next billing date now renders correctly when top-level period fields are absent.

### Files Affected

- `backend/services/auto-ship.service.js`
- `index.html`
- `Claude_Notes/member-dashboard-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Validation

- Status endpoint verification showed:
  - `status: active`
  - `stripeSubscriptionId` present
  - `currentPeriodStart/currentPeriodEnd/nextBillingDate` populated.

## Patch Update (2026-04-29) - Auto Ship Controls Unlocked After Status Refresh

### What Was Changed

- Fixed a Settings > Payment and Billing interaction issue in `index.html`.
- In `refreshSettingsAutoShipStatus(...)`, added an explicit busy-state reset on successful status load:
  - `setSettingsAutoShipActionState(false);`
  - then `renderSettingsAutoShip(...)`.

### Root Cause

- Auto Ship status refresh set action state to busy while loading.
- Success branch did not clear that state, so buttons and selector remained disabled.

### Files Affected

- `index.html`
- `Claude_Notes/member-dashboard-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Validation

- Reviewed action/loading state transitions; success path now re-enables controls after data load.

## Patch Update (2026-04-29) - Settings Payment & Billing: Auto Ship Subscription Module

### What Was Changed

- Added a new **Auto Ship** card inside `Settings > Payment and Billing` in `index.html`.
- Added member controls and status UI for recurring subscription management:
  - product selector: `MetaCharge™` / `MetaRoast™`
  - status badge: Active / Inactive / Past Due / Canceled
  - details rows:
    - selected product
    - personal BV per shipment (`50 BV`)
    - next billing date
    - monthly price
    - payment method managed by Stripe
  - action buttons:
    - `Enable Auto Ship`
    - `Change Product`
    - `Manage Billing`
    - `Cancel Auto Ship`
- Added lazy-loading flow:
  - Auto Ship status fetch now runs when the Payment category is opened (not during full dashboard initial boot).
- Added checkout-return handling from Stripe:
  - query-state detection for `autoship=success|cancel`
  - feedback messaging
  - forced status refresh
  - URL query cleanup after handling.
- Added frontend API bindings for new backend endpoints:
  - `GET /api/member-auth/autoship`
  - `POST /api/member-auth/autoship/checkout-session`
  - `POST /api/member-auth/autoship/change-product`
  - `POST /api/member-auth/autoship/cancel`
- Billing portal action reuse:
  - Auto Ship `Manage Billing` and sidebar `Invoice` action both route through existing Stripe billing portal session flow.

### Files Affected

- `index.html`
- `backend/services/auto-ship.service.js`
- `backend/controllers/auto-ship.controller.js`
- `backend/routes/auto-ship.routes.js`
- `backend/services/stripe-webhook.service.js`
- `backend/app.js`
- `Claude_Notes/member-dashboard-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Design Decisions

- Preserved existing Payment/Billing design language (no new visual system introduced).
- Kept Auto Ship logic isolated from account/billing address save flow.
- Reused existing auth token and billing portal helper patterns for consistency and lower regression risk.

### Known Limitations

- End-to-end Stripe hosted checkout and webhook replay behavior still requires environment-integrated test execution.

### Validation

- Extracted `index.html` inline script syntax check passed (`node --check` on extracted inline JS).

## Patch Update (2026-04-28) - KPI Row Update: Retail Profit Replaces E-Wallet Card

### What Was Changed

- Updated Dashboard KPI card row in `index.html`:
  - replaced `E-Wallet Balance` overview card with `Retail Profit`.
  - added Retail Profit `Transfer to Wallet` button on the card.
- Added Retail Profit transfer source support to runtime + backend integration:
  - frontend commission payout mappings include `retailprofit`.
  - backend wallet commission-transfer source map supports `retailprofit`.
  - wallet commission offsets now track `retailprofit` so available transfer amount is net-aware.
- Retail Profit value source behavior:
  - resolves from member ledger summary (`retail_commission` type net amount)
  - applies commission transfer offsets to avoid overstating transferable value.

### Files Affected

- `index.html`
- `backend/services/wallet.service.js`
- `backend/stores/wallet.store.js`
- `Claude_Notes/member-dashboard-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Validation

- `node --check backend/services/wallet.service.js` passed.
- `node --check backend/stores/wallet.store.js` passed.
- `npm.cmd run test:ledger` passed (`6/6`).
- inline script parse check passed for `index.html` (`Parsed inline scripts: 3`).

## Recent Update (2026-04-28) - Dedicated Commissions Ledger Page + Recent Activity Ledger Source

### What Was Changed

- Added a dedicated Commissions page view in `index.html` (`data-page="commissions"`):
  - summary cards:
    - Total Earned
    - Pending
    - Posted
    - Available
    - Paid Out
  - filter controls:
    - search text
    - type
    - status
    - from/to date
  - full ledger table with:
    - commission type
    - amount + direction
    - BV
    - status badge
    - source reference/source id
    - description
    - created/posted/reversed timestamps
    - metadata details expander for audit/debugging
- Added member-ledger API integration:
  - `GET /api/member-auth/ledger`
  - `GET /api/member-auth/ledger/summary`
- Updated recent activity feed construction so ledger entries become the primary source when available.

### Files Affected

- `index.html`
- `backend/routes/ledger.routes.js`
- `backend/controllers/ledger.controller.js`
- `backend/services/ledger.service.js`
- `Claude_Notes/member-dashboard-page.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Design Decisions

- Preserved existing activity fallback sources to avoid blank UX if ledger data is temporarily unavailable.
- Kept ledger rendering read-only on member side; adjustments/reversals remain admin-controlled.

### Known Limitations

- Recent Activity still supports legacy fallback entries in scenarios where ledger has no records.

### Validation

- Inline script parse check passed for `index.html`.
- Member ledger refresh/render path executes without syntax/runtime parse errors in current build checks.

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

## Update (2026-04-28) - Weekly Total Organization BV Mirrors Weekly Tree Loop Metrics

### What Changed
- `index.html`
  - Dashboard Account Overview `Weekly Total Organization BV` now resolves from `resolveDashboardLoopDisplayMetrics(...)` outputs so the card stays aligned with weekly binary-tree leg volume calculations.
  - Cutoff payload handling now refreshes the same KPI, BV comparison graph, and trend badge immediately when live weekly cutoff metrics are received.

### Why
- Previous logic relied on raw summary leg values, which could remain stale relative to live cutoff-driven weekly leg totals.
- This patch keeps the user dashboard KPI behavior consistent with the binary-tree weekly generated-volume metric path.

### Validation
- Targeted code-path inspection completed for:
  - `applyBinaryTreeDashboardSummary(...)`
  - `applyServerCutoffMetricsPayload(...)`
- Inline script syntax check passed for `index.html` (3 inline script blocks).

## Patch Update (2026-04-28) - Dashboard Weekly BV Uses Tree-Consistent Volume Inputs

### What Changed
- `index.html`
  - Updated `resolveMemberBinaryVolume(...)` to use non-baseline-subtracted starter/package volume, matching Binary Tree Details generated-volume semantics.
  - Updated `resolveDashboardLoopDisplayMetrics(...)` to keep non-zero raw tree summary legs/cycles when cutoff payload legs/cycles are zero.

### Why
- Prevented cutoff payload zeros from flattening dashboard totals when tree-side data already has weekly/generated BV signal.

### Validation
- Inline script syntax check passed for `index.html` (3 inline script blocks).

## Patch Update (2026-04-28) - Dashboard BV Graph Formula Update

### What Changed
- `index.html`
  - Updated dashboard BV graph feeds so:
    - `Total BV` = team-generated + personal
    - `Personal BV` = team-generated (without adding personal)
  - Updated fallback handling so server cutoff leg tiles and graph values remain non-zero when summary data is non-zero but cutoff payload returns zeros.

### Validation
- Inline script syntax check passed for `index.html` (3 inline script blocks).

## Patch Update (2026-04-28) - Server Cutoff Seed Values Neutralized

### What Changed
- `index.html`
  - Neutralized server-cutoff card seed data attributes for left/right BV and cycle defaults.
  - Server-cutoff left/right runtime state now starts from `0` instead of preloaded legacy values.

### Impact
- Dashboard Server Cutoff leg values now track live tree/cutoff values instead of stale seeded numbers.

### Validation
- Inline script syntax check passed for `index.html` (3 inline script blocks).

## Update (2026-04-28) - Home Dashboard Component Reorder (Requested Layout)

### Request Applied
- Swap panel positions so `Fast Track Bonus` becomes the wide panel where `Business Centers` previously rendered.
- Place `Matching Bonus` beside `Fast Track Bonus` on desktop.
- Move `Business Centers` below, then place `Recent Activity` beside it.

### Implementation
- `index.html`
  - Converted row-2 arrangement into independent grid items to control row pairing.
  - Desktop layout now resolves to:
    - Row A: `Fast Track Bonus` (`lg:col-span-2`) + `Matching Bonus` (`lg:col-span-1`)
    - Row B: `Business Centers` (`lg:col-span-2`) + `Recent Activity` (`lg:col-span-1`)
  - Preserved all existing IDs (`fast-track-*`, `matching-bonus-*`, `business-center-*`, `recent-activity-*`) so existing JS hooks remain intact.

### Files Affected
- `index.html`

### Known Limitations
- Automated screenshot captured login state (authenticated dashboard not visible in headless session), so visual confirmation was done through direct markup inspection.

## Patch Update (2026-04-28) - Home Dashboard Panel Scroll Behavior (Fast Track + Recent Activity)

### Request Applied
- Ensure list-heavy dashboard components scroll internally so page does not become excessively long.

### Implementation
- `index.html`
  - `#fast-track-bonus-card` now includes `max-h-[34rem] overflow-hidden`.
  - `#recent-activity-panel` now includes `max-h-[34rem]`.
  - Existing list areas (`#fast-track-commission-audit-list`, `#recent-activity-feed`) remain `overflow-y-auto` so records scroll inside the cards.

### Files Affected
- `index.html`

### Notes
- Layout/order from previous panel-swap update is preserved; this patch only adds scroll containment.

## Update (2026-04-28) - Business Center Component Rebuild (BC #1 + BC #2 Card Model)

### Request Applied
- Remove unified-wallet view and aggregate earnings list from Business Center component.
- Show only dedicated BC cards for #1 and #2 with per-card earnings and action button.
- Place Business Center directly under Matching Bonus in right column.
- Keep Recent Activity below Fast Track Bonus in left/wide area.

### Implementation
- `index.html`
  - Reworked row-2 layout so right side stacks `Matching Bonus` + redesigned `Business Centers`.
  - Moved `Recent Activity` under Fast Track (wide/left track).
  - Replaced old Business Center activation+wallet summary UI with two center cards.
  - Added center-specific controls/IDs for:
    - earnings value
    - status chip/detail
    - activate button
    - transfer button.
- Transfer logic
  - Added center transfer helper to call existing commission transfer endpoint using source key `businesscenter` and center-tagged notes.
  - Card availability now subtracts prior tagged transfer totals from center earnings.
- Backend
  - Added `businesscenter` source metadata + sender/source mapping for wallet commission transfers.

### Files Affected
- `index.html`
- `backend/services/wallet.service.js`
- `backend/stores/wallet.store.js`

### Notes
- Center transfer history attribution depends on transfer note tag format (`Business Center #N`).

## Patch Update (2026-04-28) - Home Layout Polish: Match Vertical Flow

### Request Applied
- Clean up home layout spacing so the left side does not leave a large empty gap before `Recent Activity`.

### Implementation
- `index.html`
  - Converted left side into a single stacked column (`Fast Track` + `Recent Activity`) within one `lg:col-span-2` wrapper.
  - Kept right side as stacked `Matching Bonus` + `Business Centers`.

### Result
- `Recent Activity` now follows `Fast Track` directly with consistent spacing and no dead area.

## Patch Update (2026-04-28) - Fast Track Specific Height Applied

### Request Applied
- Added a specific fixed height to Fast Track Bonus so future list growth does not expand the card.

### Implementation
- `index.html`
  - `#fast-track-bonus-card` now uses `h-[34rem]` with existing `overflow-hidden` and internal audit-list scroll.

## Patch Update (2026-04-28) - Fast Track Height Target Changed To Business Center

### Request Applied
- Match Fast Track Bonus height to Business Center panel height.

### Implementation
- `index.html`
  - Fast Track height sync function now measures `#business-center-panel`.
  - Resize observer now watches Business Center panel.
  - Fast Track base class changed from fixed height to `h-auto`.

## Patch Update (2026-04-28) - Fast Track Bottom Aligned To Business Center Section Bottom

### Request Applied
- Align Fast Track bottom to Business Centers section bottom (including matching card above it).

### Implementation
- `index.html`
  - Added `id="dashboard-right-bonus-stack"`.
  - Fast Track height sync now measures this wrapper for desktop alignment.

## Patch Update (2026-04-28) - Business Center Summary Caption Renamed

### Request Applied
- Changed unlock caption to:
  - `Complete Legacy Tier 4 and Tier 5 to unlock Business Centers.`

### File Affected
- `index.html`

## Patch Update (2026-04-29) - Settings Auto Ship Next Billing Date

### Request Applied
- Make Auto Ship Next Billing Date in Settings match billing schedule accurately.

### Implementation
- `index.html`
  - Expanded `normalizeSettingsAutoShipSnapshot(...)` to resolve date from API + metadata fallback fields.
  - Updated `formatSettingsAutoShipDateLabel(...)` to prevent timestamp timezone drift from showing an incorrect calendar date.

### Result
- Members now see the accurate expected billing date in Payment and Billing even when data arrives from different sync stages.

## Patch Update (2026-04-29) - Settings Auto Ship False Canceled State Recovery

### Request Applied
- Fix case where member completed Stripe Auto Ship setup but Settings still displayed canceled state.

### Implementation
- `backend/services/auto-ship.service.js`
  - During status refresh, Stripe customer subscriptions are re-evaluated even when a local subscription id already exists.
  - If a different, healthier Auto Ship subscription exists in Stripe, local setting is synced to that subscription.

### Result
- Payment and Billing now reflects the real Stripe Auto Ship status and next billing schedule more reliably.

## Patch Update (2026-04-29) - Removed Card/Billing Components From Payment Settings

### Request Applied
- Remove Card Details and Billing Address components from `Settings > Payment and Billing`.

### Implementation
- `index.html`
  - Deleted Card Details UI section.
  - Deleted Billing Address UI section and address inputs.
  - Removed billing save button from payment settings.
  - Updated payment tab subtitle to match Stripe-managed billing flow.
  - Added safeguard so account/profile save does not erase billing snapshot when billing inputs are absent.

### Result
- Payment settings now focus on Auto Ship + Stripe-managed billing without redundant local card/address forms.
## Patch Update (2026-04-29) - Profile Page Uses Binary Tree Account Overview Hero

### Request Applied
- Rebuild `My Profile` so the page keeps achievements and uses the Binary Tree account-overview style section as the profile header/details block.
- Ensure avatar presentation matches Binary Tree (gradient initials style + active indicator).

### Implementation
- `index.html`
  - Profile page content updated to:
    - keep `Achievement` section
    - add `#profile-account-overview-panel` above achievements
    - remove prior visible profile-only blocks from the profile page layout.
  - Reused account-overview data points (rank/title, active window, direct sponsors, BV totals) and sync hooks.
  - Updated hero avatar CSS to Binary Tree parity values:
    - 140px circular gradient avatar
    - 36px active-status dot with white ring
    - no overflow clipping so active indicator renders fully.
  - Added local initials resolver for profile account overview and bound initials output to the hero avatar.
  - Updated node label candidate priority to prefer member/node identifiers.

### Files Affected
- `index.html`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`
- `Claude_Notes/member-dashboard-page.md`

### Known Limitation
- Screenshot automation currently lands on login unless an authenticated dashboard session is active in the capture context.

## Patch Update (2026-04-29) - Profile Hero Joined Date Display

### Request Applied
- Replace the profile hero subtext under username so it shows joined date (not node id).

### Implementation
- `index.html`
  - Updated profile hero markup id to `#profile-account-overview-joined`.
  - Replaced node-label resolver with `resolveProfileAccountOverviewJoinedLabel(...)`.
  - Joined label now reads from `createdAt`, `enrolledAt`, or `registeredAt` (including snake_case variants), formatted through existing date formatter.

### Result
- Subtext now shows `Joined <date>` and no longer exposes internal node/member id string.

## Patch Update (2026-04-29) - Profile Hero Separator Width

### Request Applied
- Make the divider under joined date reach the card borders.

### Implementation
- `index.html`
  - Updated `.profile-account-overview-hero` to use full-width layout on desktop (`width: 100%`) instead of capped max width.
  - Retained centered hero content using existing grid centering behavior.

### Result
- Divider line now spans the full account-overview panel width (inside panel padding) instead of appearing short.

## Patch Update (2026-04-29) - Profile Sales and Business Volume Cards (Exact 6)

### Request Applied
- Use the exact account-overview card set in profile `Sales and Business Volumes`:
  1. Account Active Until
  2. Total Organization BV
  3. Personal BV
  4. Weekly Cycle Cap
  5. Direct Sponsors
  6. E-Wallet

### Implementation
- `index.html`
  - Replaced previous 4-card profile list with 6-card markup and new value ids.
  - Updated profile account-overview grid to 3 desktop columns for clean 2-row rendering.
  - Extended profile card renderer to populate:
    - BV totals
    - weekly cycle cap (`current capped cycles / weekly cap cycles`)
    - direct sponsors
    - E-Wallet balance.
  - Added profile card refresh call from E-Wallet summary render so E-Wallet value stays synced.

### Result
- Profile page now shows the exact requested 6-card set and keeps values updated with current dashboard/E-Wallet data.

## Patch Update (2026-04-29) - Profile BV Flicker To Zero Fix

### Request Applied
- Fix profile volume cards where `Total Organization BV` and `Personal BV` showed correctly, then reset to `0`.

### Implementation
- `index.html`
  - Removed `renderProfileLifetimeCards({ eWalletBalance: ... })` from `renderEWalletSummary(...)`.
  - Replaced it with a direct update of the E-Wallet tile value element.

### Result
- Profile BV cards remain stable after load; E-Wallet still refreshes live without overwriting BV metrics.

## Patch Update (2026-04-29) - Removed Profile Header Copy

### Request Applied
- Remove profile panel texts:
  - `Account Overview`
  - `My Profile`
  - `Binary Tree summary profile`

### Implementation
- `index.html`
  - Deleted the header wrapper above the profile hero section.

### Result
- Those labels are no longer shown in the Profile page account overview block.

## Patch Update (2026-04-29) - Legacy Title Label Fix

### Request Applied
- Fix incorrect profile title label (`Legacy Leader`) and align with backend title storage.

### Implementation
- `index.html`
  - changed legacy rank fallback title to `Legacy Founder`.
  - added compatibility alias so any stale `Legacy Leader` explicit title resolves to `Legacy Founder`.
  - updated title->achievement mapping alias for `legacy leader` to point to legacy-founder achievement id.

### Result
- `Legacy Leader` is no longer shown in profile title badge; legacy title output now aligns to supported backend catalog naming.

## Patch Update (2026-04-29) - Profile Rank/Title Hover Popup Support

### Request Applied
- Add hover popup details for Profile page rank/title badges, matching dashboard KPI hover behavior.

### Implementation
- `index.html`
  - attached hover/focus/touch listeners to profile hero rank/title badge shells.
  - reused existing profile hovercard show/hide/position logic.
  - synced hovercard badge-entry payloads from dynamic hero rank/title values.

### Result
- Hovering Profile rank or title badge now opens the detail popup window with corresponding badge icon/title/subtitle details.

## Patch Update (2026-04-29) - Profile Badge Hover Popup Not Showing (Resolved)

### Request Applied
- Fix profile rank/title hover popups not appearing.

### Implementation
- `index.html`
  - reintroduced `#profile-handle-badge-hovercard` markup near root overlays.

### Result
- Profile rank/title hover popup is now able to show because the tooltip container exists again.

## Patch Update (2026-04-29) - Legacy Founder Popup Acquired Date

### Request Applied
- Fix `Legacy Founder` popup subtitle showing `Acquired --`.

### Implementation
- `index.html`
  - in `resolveProfileTitleBadgeSubtitle(...)`, if title-award acquired date is missing, use session date fallback (`createdAt/enrolledAt/registeredAt`).

### Result
- Legacy Founder popup now displays a date in the acquired line when direct award date is absent.

## Patch Update (2026-04-30) - Profile Title/Badge Inventory Equip System

### Request Applied
- Add a profile stash/inventory opened from the right-side profile badge so members can equip earned title/badge entries and persist the selected active badge.

### Implementation
- `index.html`
  - Added interactive behavior on `#profile-account-overview-title-badge-shell` to open inventory.
  - Added inventory overlay + mobile bottom-sheet panel:
    - `#profile-badge-inventory-overlay`
    - `#profile-badge-inventory-panel`
    - `#profile-badge-inventory-list`
    - `#profile-badge-inventory-feedback`
  - Added inventory render system with status/action states and equipped-highlight behavior.
  - Added equip API action integration:
    - `POST /api/member-auth/achievements/:achievementId/equip`
  - Added payload/session sync for:
    - `equippedProfileBadgeId`
    - `earnedAchievementIds`
    - `earnedAchievementClaims`
  - Added escape/overlay close handling and `aria-expanded` sync for accessibility.

- Backend wiring for inventory persistence:
  - `backend/stores/member-profile-badge-selection.store.js` (new)
  - `backend/services/member-achievement.service.js`
  - `backend/controllers/member-achievement.controller.js`
  - `backend/routes/member-achievement.routes.js`

### Result
- Profile right-side badge now acts as the inventory entry point.
- Members can equip earned badge/title entries and see immediate header update.
- Equipped badge persists via backend and is returned in achievement payload.

## Patch Update (2026-04-30) - Inventory Filter Change (Earned Only + Rank Exclusions)

### Request Applied
- Exclude rank achievements (`Ruby` to `Royal Crown`) from Title/Badge Inventory.
- Show only acquired/earned entries.

### Implementation
- `index.html`
  - Inventory entry resolver now filters out non-earned achievements.
  - Added explicit exclusion set for:
    - `rank-ruby`
    - `rank-emerald`
    - `rank-sapphire`
    - `rank-diamond`
    - `rank-blue-diamond`
    - `rank-black-diamond`
    - `rank-crown`
    - `rank-double-crown`
    - `rank-royal-crown`
  - Updated empty state to earned-only wording.

### Result
- Inventory now displays only acquired title/badge entries and no longer shows rank ladder cards from Ruby through Royal Crown.

## Patch Update (2026-04-30) - Inventory Title Rename + Binary Tree Amber Styling

### Request Applied
- Rename inventory heading from `Title / Badge Inventory` to `Badge Inventory`.
- Align modal and Equipped badge visual colors to Binary Tree design.

### Implementation
- `index.html`
  - changed inventory header title string to `Badge Inventory`.
  - updated inventory modal panel/header styling to amber gradient tones based on Binary Tree legacy-founder palette.
  - updated Equipped visual state styles:
    - card shell
    - top-right Equipped status chip
    - Equipped action button
  - all Equipped accents now use amber-family gradients instead of blue-brand accents.

### Result
- Inventory naming now matches requested label.
- Modal and Equipped badge visuals now follow Binary Tree amber color direction.

## Patch Update (2026-04-30) - Inventory Text Color Readability

### Request Applied
- Make Badge Inventory text white because current text colors are hard to read.

### Implementation
- `index.html`
  - changed Badge Inventory header, description, and close-button label to white text variants.
  - changed inventory card textual content to white variants.
  - changed status chip text to white (Equipped/Earned).
  - changed action button text to white (including Equipped state).
  - changed empty-state and default feedback text to white variants.

### Result
- Badge Inventory text is now high-contrast and readable against the amber/dark modal backgrounds.

## Patch Update (2026-04-30) - Inventory Icon Container Amber Alignment

### Request Applied
- Match the small badge icon container color to the amber inventory palette (remove gray/off-tone look).

### Implementation
- `index.html`
  - added `iconShellClasses` in Badge Inventory card renderer.
  - equipped cards now use a stronger amber gradient icon-shell background/border.
  - earned cards use a softer amber gradient icon-shell background/border.
  - replaced previous `bg-surface-elevated` icon container styling.

### Result
- The icon container now visually matches the amber modal/card theme and no longer appears out of place.

## Patch Update (2026-04-30) - Profile Achievement Title System Update (25 Catalog Entries)

### Request Applied
- Update Profile `Achievements` data model/titles to the new Premiere Life + Time Limited Event definitions, including rank-aware leadership tracks and total catalog expansion.

### Implementation
- `backend/services/member-achievement.service.js`
  - Reworked seeded claimable titles to new names:
    - Founding Ambassador
    - Infinity Builder
    - Legacy Builder
    - Leadership Race (Club/Squad/Commander)
    - Executive/Regional/National/Global Ambassador
    - Presidential Ambassador Sovereign / Round Table / Elite / Presidential Grand Ambassador Royale
  - Reworked achievement categories:
    - `premiere-life-milestones` (new)
    - `leadership-race` (new)
    - `legacy-matrix-builder` (new)
    - plus existing `legacy-builder-leadership-program`, `premiere-journey`
  - Expanded and updated `PROFILE_ACHIEVEMENTS` to 25 entries total:
    - 16 non-rank
    - 9 rank (`Ruby` to `Royal Crown`)
  - Added eligibility support for:
    - package ownership sets (`requiredAnyOwnedPackageKeys`)
    - rank ranges (`requiredRankMin` / `requiredRankMax`)
    - completed legacy-tier count (`requiredLegacyLeadershipCompletedTierCount`)
  - Extended progress context to include:
    - `lastUpgradedEnrollmentPackageKey`
    - `legacyLeadershipCompletedTierCount`

- `index.html`
  - Updated profile achievement icon map and title-to-achievement id aliases for new names.
  - Replaced achievement fallback snapshot with a matching 25-entry catalog.
  - Updated profile title static fallback label to `Founding Ambassador`.
  - Updated legacy-title subtitle classification list to include new ambassador naming.

### Design Decisions
- Preserved existing time-limited event achievement ids for leadership-program progression so existing claims remain aligned by id while labels/rules are upgraded.
- Added a second Premiere Journey fallback milestone (`Build Your First 3 Members`) to satisfy requested 25 total without changing rank payout track behavior.

### Known Limitations
- Matrix Builder milestones use available completed-tier progress fields rather than explicit per-tier node counters in this patch.

### Validation
- `node --check backend/services/member-achievement.service.js` passed.

## Patch Update (2026-04-30) - Profile Achievement Category Stability

### Issue
- After profile reload, achievement categories initially rendered then disappeared, preventing category switching and preview.

### Root Cause
- `applyProfileAchievementPayload` accepted empty `tabs` and `categories` arrays from subsequent API responses and replaced the in-memory snapshot catalog with those empty arrays.

### Fix
- Added defensive catalog merge logic in `index.html`:
  - prefer non-empty payload arrays
  - fallback to previous snapshot arrays
  - fallback to static catalog snapshot as last resort
- Added fallback in category and active achievement item resolvers when runtime snapshot arrays are empty.
- Preserved `claimableTitles` and `accountTitles` from previous snapshot when omitted in payload.

### Files Updated
- `index.html`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`
- `Claude_Notes/member-dashboard-page.md`

### Validation
- Inline script parse check passed (`Parsed 3 inline script blocks successfully.`).

## Patch Update (2026-04-30) - Legacy-Aware Backfill + Uniform Non-Rank Medal

### Request
- Use Founding Ambassador medal for all non-rank achievements.
- Ensure legacy members can backfill-claim eligible package-based rewards.

### Root Cause
- Achievement evaluation could run with partial auth session member data (missing package fields), which incorrectly locked package-dependent non-rank rewards for existing legacy users.

### Fix
- Backend (`backend/services/member-achievement.service.js`):
  - added `resolveMemberProgressSource(...)` to hydrate member context from `charge.member_users` by `userId`.
  - integrated hydration into list/build/claim run paths for achievements.
  - enhanced legacy package ownership evaluation to backfill `legacy-builder-pack` into owned package checks when legacy ownership is detected.
  - normalized all non-rank achievement/title catalog icons to Founding Ambassador icon path.
- Frontend (`index.html`):
  - normalized non-rank fallback achievement and claimable-title icons to Founding Ambassador icon path.
  - updated icon resolver fallback so non-rank achievements default to Founding Ambassador icon.

### Result
- Legacy members now resolve as eligible for package-based non-rank achievements in backfill scenarios.
- Non-rank achievements now render one consistent medal icon family.

### Validation
- `node --check backend/services/member-achievement.service.js` passed.
- Inline script parse check passed (`Parsed 3 inline script blocks successfully.`).
- Live service verification for legacy account showed:
  - `premiere-life-founding-ambassador`: eligible
  - `premiere-life-infinity-builder`: eligible
  - `premiere-life-legacy-builder`: eligible
  - all with Founding Ambassador icon path.

## Patch Update (2026-04-30) - Legacy Builder Leadership Program Runtime Normalization

### Issue
- Profile Achievement Center still displayed legacy title names and reduced category coverage after full load, despite catalog updates in source.

### Root Cause
- Live payload could contain legacy/static achievement definitions that overrode current UI definitions at runtime.
- Partial payload category coverage caused category list to collapse to stale subset.

### Fix
- In `index.html`, updated `applyProfileAchievementPayload` to:
  - normalize/sanitize payload achievement entries by `id`
  - merge live progress/claim state with canonical fallback definitions
  - force definition fields to current catalog values (title/description/tab/category/reward/icon/event metadata)
  - append missing catalog entries from fallback snapshot
  - use fallback tabs/categories as canonical track/category structure
- Updated claim success messaging to read title from normalized snapshot entry.

### Result
- `Time-Limited Event` -> `Legacy Builder Leadership Program` now reflects updated titles:
  - Executive Ambassador
  - Regional Ambassador
  - National Ambassador
  - Global Ambassador
- Missing categories/achievements are restored even when the server payload is stale or partial.

### Files Updated
- `index.html`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`
- `Claude_Notes/member-dashboard-page.md`

### Validation
- Inline script parse check passed (`Parsed 3 inline script blocks successfully.`).

## Patch Update (2026-04-30) - Profile Header Badge Equip Render Correction

### Summary
- Fixed profile header right-side badge so it reflects the currently equipped achievement badge instead of falling back to `Legacy Builder` account title.
- Unified non-rank achievement icon resolution to Founding Ambassador medal icon family.

### Files Updated
- `index.html`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`
- `Claude_Notes/member-dashboard-page.md`

### Validation
- Inline script parse check passed (`Parsed 3 inline script blocks successfully.`).

## Patch Update (2026-04-30) - Profile Header Title Badge Sync on Equip

### Summary
- Fixed profile header title badge not updating after equip by routing achievement payload application through header identity sync.

### File Updated
- `index.html`

### Validation
- Inline script parse check passed (`Parsed 3 inline script blocks successfully.`).

## Patch Update (2026-04-30) - Title Badge Label Wrapping

### Summary
- Updated profile header title badge label style to prevent clipping and ellipsis on longer titles.

### File Updated
- `index.html`

### Validation
- Inline script parse check passed (`Parsed 3 inline script blocks successfully.`).

## Patch Update (2026-04-30) - KPI Badge Count Alignment

### Summary
- Updated dashboard KPI badge resolver to exclude `extra` title badge so only rank + primary title/equipped badge are shown.

### File Updated
- `index.html`

### Validation
- Inline script parse check passed (`Parsed 3 inline script blocks successfully.`).

## Patch Update (2026-04-30) - Binary Tree Overview Title Badge Follow Equip

### Summary
- Updated Binary Tree account overview title badge resolution to follow equipped profile title selection.
- Added equipped-title resolution from achievements payload and applied it to title label/icon selection.

### Files Updated
- `binary-tree-next-app.mjs`
- `index.html`

### Validation
- `node --check binary-tree-next-app.mjs` passed.
- Inline script parse check passed (`Parsed 3 inline script blocks successfully.`).

## Patch Update (2026-04-30) - Binary Tree Account Overview Title Label Wrap Fix

### Summary
- Fixed text clipping on the Binary Tree `Account Overview` title badge label.
- Removed single-line ellipsis behavior so equipped title names (for example, `Founding Ambassador`) render fully.

### Files Updated
- `binary-tree-next.html`

### Style Changes
- Updated `.tree-next-account-overview-badge-label` to:
  - allow multiline wrapping (`white-space: normal`)
  - break long words safely (`word-break: break-word`, `overflow-wrap: anywhere`)
  - disable ellipsis truncation (`text-overflow: clip`)

### Validation
- Manual code review of account overview badge label styles completed.

## Patch Update (2026-04-30) - Membership Placement Nodes No Longer Add BV

### Summary
- Updated member tree volume resolvers so `membership-placement-reservation` accounts always contribute `0 BV`.
- Prevents stale starter PV from inflating leg totals for placement-only accounts.

### Files Updated
- `index.html`
- `binary-tree-next-app.mjs`

### Validation
- `node --check binary-tree-next-app.mjs` passed.
- Inline script parse check passed (`INLINE_SCRIPT_PARSE_OK index.html blocks=3`).

### Follow-up
- Updated Binary Tree Next details metrics resolvers for reservation accounts so `Available Left/Right Leg BV` uses subtree-computed values and no longer pulls stale cutoff leg snapshots.

## Patch Update (2026-04-30) - Achievement Header Meta Text Removed

### Summary
- Removed the `Enrolled members: X | Active` status text from the Profile Achievement section header.
- The status element is now hidden in markup and stays hidden during runtime rendering.

### Files Updated
- `index.html`

### Validation
- Verified no remaining `Enrolled members:` text in `index.html`.
- Inline script parse check passed (`Parsed 3 inline script blocks successfully.`).

## Patch Update (2026-04-30) - Preferred Customers BV Label Terminology Fix

### Summary
- Updated Preferred Customers dashboard user-facing labels from `BP` to `BV`.
- This is a display terminology patch only; underlying data fields and calculations remain unchanged.

### Files Updated
- `index.html`

### Updated UI Copy
- Preferred Customer planner selected summary: `0 BP` -> `0 BV`
- Preferred Customer planner list chips: `... BP` -> `... BV`
- Store owner KPI card text: `... BP` -> `... BV`
- Store analytics/support copy and sample invoice lines: `BP` -> `BV`
- Settlement labels: `Posted BP`/`Pending BP` -> `Posted BV`/`Pending BV`

### Validation
- Verified no remaining standalone `BP` labels in `index.html`.
- Inline script parse check passed (`Parsed 3 inline script blocks successfully.`).

## Patch Update (2026-04-30) - Enroll Member Dashboard Page Removed (Binary Tree Enrollment Only)

### Summary
- Removed the standalone `Enroll Member` page from the user dashboard experience.
- Enrollment flow now routes to Binary Tree only.

### Changes Implemented
- `index.html`
  - removed sidebar nav link for `Enroll Member`.
  - removed the full `page-enroll-member` section markup from dashboard page views.
  - removed `enroll-member` page metadata and route mapping (`/EnrollMember`) from SPA page routing tables.
  - updated quick action enroll behavior to open Binary Tree page directly:
    - `window.location.href = '/binary-tree-next.html'`.
  - added legacy-path redirect guard:
    - visiting `/EnrollMember` or `/enroll-member` now redirects to `/binary-tree-next.html`.
  - removed remaining `setPage` branch handling for `enroll-member` page view.

### Validation
- Verified no remaining active `enroll-member` page-view/nav-route hooks in `index.html`.
- Inline script parse check passed (`Parsed 3 inline script blocks successfully.`).

## Patch Update (2026-04-30) - Personal BV KPI Graph Footer Uses Date Window

### Summary
- Updated the Personal BV KPI graph footer on the User Dashboard.
- Removed footer text that summed/compared 30-day PV values and replaced it with a date range caption.

### File Updated
- `index.html`

### New Footer Behavior
- Caption now renders as `From <Month Day, Year> to <Month Day, Year>` using the chart start/end timestamps.
- Prevents confusion where users interpreted graph-total text as their actual current Personal BV.

### Validation
- Manual logic review completed for zero/invalid series fallback and normal 30-day rendering path.

## Update (2026-04-30) - Pre-Creation Trend Date Guard

- Added account-createdAt date floor in index.html trend rendering pipeline so dashboard charts do not render points older than the signed-in account creation date.
- Applied to Personal Volume, E-wallet, and Weekly Total Organization BV trend-entry sanitization plus observedAt fallback paths.
- Validation: inline script parse check passed for index.html.
