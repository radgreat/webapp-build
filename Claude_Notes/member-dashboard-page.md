# Member Dashboard Page Notes

Last Updated: 2026-04-18

## Scope

- Page: `index.html`
- Purpose: Primary authenticated member dashboard shell and module host.

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
