# Current Project Status

Last Updated: 2026-04-29

## Purpose

- Living status tracker for active scope, roadmap, and development gates.
- Updated continuously as work progresses.

## Patch Update (2026-04-29) - Auto Ship Delayed First Billing Anchor (Active Accounts)

- Completed:
  - added active-window-aware Auto Ship first billing schedule in `backend/services/auto-ship.service.js`.
  - when member is currently active with future `activity_active_until_at`, checkout now schedules first subscription charge at `active_until + 1 day` using:
    - `subscription_data.billing_cycle_anchor`
    - `subscription_data.proration_behavior = none`
  - preserved immediate billing fallback when no valid future anchor exists.
  - added API/session metadata output for observability:
    - `billingBehavior`
    - `scheduledBillingAnchorAt`
  - response payload now supports scheduled anchor as `nextBillingDate` fallback.
- Outcome:
  - Auto Ship can be enabled mid-cycle without immediate recurring charge for already-active members.
  - first charge aligns with account renewal timing (day after active-window end).
- Files updated:
  - `backend/services/auto-ship.service.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`
- Validation:
  - `node --check backend/services/auto-ship.service.js` passed.
  - checkout session smoke test returned `billingBehavior=anchor-after-active-window` with scheduled anchor timestamp.

## Patch Update (2026-04-29) - Auto Ship Tax Applied To Recurring Checkout

- Completed:
  - enabled Stripe Automatic Tax on Auto Ship subscription checkout flow.
  - required billing address collection for tax calculation.
  - enabled Stripe customer updates for address/shipping/name during Auto Ship checkout.
- Outcome:
  - new Auto Ship setup/checkouts now include tax calculation and recurring invoice tax behavior per Stripe Tax/account setup.
- Files updated:
  - `backend/services/auto-ship.service.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`
- Validation:
  - `node --check backend/services/auto-ship.service.js` passed.
  - checkout session creation smoke test returned a valid Stripe checkout URL.

## Patch Update (2026-04-29) - Auto Ship Invoice + Recent Activity + Ledger Posting

- Completed:
  - added paid-invoice reconciliation fallback in Auto Ship status flow so missed webhook processing no longer blocks local credit posting.
  - Auto Ship paid invoice path now ensures local records across:
    - `charge.store_invoices` (invoice/order record)
    - `charge.user_auto_ship_events` (recent activity source)
    - `charge.ledger_entries` (auditable ledger row)
  - fixed Auto Ship event insert idempotency in `backend/stores/auto-ship.store.js`:
    - deterministic event IDs
    - `ON CONFLICT (id)` dedupe
    - removed failing conflict target behavior tied to partial index inference.
  - added idempotent backfill logic for already-existing Stripe invoice records so missing ledger/activity rows can be restored safely.
- Outcome:
  - a completed/paid Auto Ship setup now appears in invoice history, activity trail, and ledger, while still crediting 50 BV exactly once.
  - duplicate replay safety preserved for webhook retries and manual status-reconcile calls.
- Files updated:
  - `backend/services/auto-ship.service.js`
  - `backend/stores/auto-ship.store.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`
- Validation:
  - `node --check backend/services/auto-ship.service.js` passed.
  - `node --check backend/stores/auto-ship.store.js` passed.
  - idempotent paid-invoice replay confirmed no duplicate invoice/ledger/activity rows.

## Patch Update (2026-04-29) - Auto Ship Activation Indicator Recovery

- Completed:
  - added Stripe fallback reconciliation in `backend/services/auto-ship.service.js` so Auto Ship status can recover without waiting on webhook delivery.
  - `getMemberAutoShipStatus(...)` now:
    - syncs from stored checkout session (`latest_checkout_session_id`) when local subscription id is empty
    - falls back to Stripe customer subscription lookup for Auto Ship products.
  - added duplicate-protection preflight in `createMemberAutoShipCheckoutSession(...)`:
    - syncs remote Auto Ship subscription first
    - blocks second active setup if subscription already exists in Stripe.
  - improved billing-period derivation logic to use subscription item period fields when top-level Stripe period fields are missing.
- Outcome:
  - members who completed Stripe checkout now get visible `Active` Auto Ship status in Settings even if webhook sync was delayed/missed.
  - accidental duplicate Auto Ship subscription setup is prevented in stale-local-state scenarios.
- Files updated:
  - `backend/services/auto-ship.service.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`
- Validation:
  - `node --check backend/services/auto-ship.service.js` passed.
  - live service verification confirmed local row sync to:
    - `status=active`
    - populated `stripe_subscription_id`
    - populated `nextBillingDate/currentPeriod` fields.

## Patch Update (2026-04-29) - Auto Ship Settings UI Unlock Fix

- Completed:
  - fixed Auto Ship settings action-state bug in `index.html` where controls stayed disabled after successful status load.
  - added explicit success-path reset in `refreshSettingsAutoShipStatus(...)`:
    - `setSettingsAutoShipActionState(false);` before `renderSettingsAutoShip(...)`.
- Root cause:
  - status refresh set Auto Ship to busy mode, but the success branch did not clear `settingsAutoShipActionLoading`.
  - this left `Enable Auto Ship` and related controls non-interactive.
- Outcome:
  - Auto Ship controls are clickable again after status loads in `Settings > Payment and Billing`.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - reviewed state flow and confirmed success branch now unlocks controls.

## Patch Update (2026-04-29) - Auto Ship (Stripe Subscription + Monthly 50 BV Active Maintenance)

- Completed:
  - added member-facing Auto Ship module under `Settings > Payment and Billing` in `index.html`.
  - added new member-auth Auto Ship API routes:
    - `GET /api/member-auth/autoship`
    - `POST /api/member-auth/autoship/checkout-session`
    - `POST /api/member-auth/autoship/change-product`
    - `POST /api/member-auth/autoship/cancel`
  - added backend service/controller/route implementation for Auto Ship orchestration.
  - added persistent Auto Ship storage/audit tables:
    - `charge.user_auto_ship_settings`
    - `charge.user_auto_ship_events`
  - added persistent Stripe webhook event idempotency tracking:
    - `charge.stripe_webhook_events`
  - extended webhook dispatcher to process Auto Ship subscription lifecycle and billing outcomes:
    - `checkout.session.completed`
    - `customer.subscription.created/updated/deleted`
    - `invoice.payment_succeeded`
    - `invoice.payment_failed`
  - successful Auto Ship invoice path now:
    - creates store invoice/order-style record
    - credits 50 Personal BV once
    - reuses existing active-window logic via `recordMemberPurchase(...)`.
- Outcome:
  - members can securely enable Stripe-managed recurring monthly qualifying purchases to maintain active-window requirements.
  - duplicate active subscriptions are blocked in member enable flow.
  - Payment & Billing avoids dashboard bootstrap slowdown by lazy-loading Auto Ship only when payment settings tab opens.
- Files updated:
  - `backend/services/auto-ship.service.js` (new)
  - `backend/controllers/auto-ship.controller.js` (new)
  - `backend/routes/auto-ship.routes.js` (new)
  - `backend/stores/auto-ship.store.js` (new)
  - `backend/stores/stripe-webhook-event.store.js` (new)
  - `backend/services/stripe-webhook.service.js`
  - `backend/app.js`
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`
- Validation:
  - `node --check backend/services/auto-ship.service.js` passed.
  - `node --check backend/services/stripe-webhook.service.js` passed.
  - `node --check backend/controllers/auto-ship.controller.js` passed.
  - `node --check backend/routes/auto-ship.routes.js` passed.
  - extracted `index.html` inline-script syntax check passed.

## Patch Update (2026-04-28) - Dashboard KPI Card Swap (E-Wallet -> Retail Profit) + Retail Transfer Action

- Completed:
  - replaced the User Dashboard KPI `E-Wallet Balance` card with a `Retail Profit` card in `index.html`.
  - added `Transfer to Wallet` action button directly on the new Retail Profit KPI card.
  - wired the Retail Profit KPI amount to member ledger summary (`retail_commission` net amount) with wallet-offset aware availability.
  - extended commission-transfer source support for `retailprofit` across:
    - frontend payout source mapping
    - wallet service source validation
    - wallet transfer sender-id mapping and commission offset calculations
- Outcome:
  - KPI row now focuses on commission earnings instead of duplicating wallet page purpose.
  - members can transfer Retail Profit to E-Wallet from the dashboard card, matching existing transfer behavior patterns.
- Files updated:
  - `index.html`
  - `backend/services/wallet.service.js`
  - `backend/stores/wallet.store.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`
- Validation:
  - `node --check backend/services/wallet.service.js` passed.
  - `node --check backend/stores/wallet.store.js` passed.
  - inline script parse check passed for `index.html` (`Parsed inline scripts: 3`).
  - `npm.cmd run test:ledger` passed (`6/6`).

## Patch Update (2026-04-28) - Track Commissions Retail Profit Auth Fetch Fix

- Completed:
  - fixed Binary Tree Next Account Overview remote fetch helper so member-auth endpoints include member bearer token headers.
  - specifically updated `fetchAccountOverviewEndpoint(...)` in `binary-tree-next-app.mjs` to apply `Authorization: Bearer <memberToken>` for member source contexts.
- Root cause:
  - `Track Commissions` cards were fetching member-auth ledger summary without auth headers, causing summary payload fallback to null and Retail Profit showing `0`.
- Outcome:
  - `/api/member-auth/ledger/summary` can now resolve for signed-in members from Account Overview sync path.
  - Retail Profit card can render ledger-backed values instead of stale zero fallback.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Patch Update (2026-04-28) - Binary Tree Account Overview Live Metrics Refresh Fix

- Completed:
  - updated Binary Tree Next Account Overview metric precedence in `binary-tree-next-app.mjs` for:
    - `Total Organization BV`
    - `Personal BV`
    - `Retail Profit`
    - `Sales Team Commission`
  - moved Account Overview to favor live node/tree and ledger-backed values before older snapshot/container fallbacks.
  - updated `resolveAccountOverviewTotalOrganizationBv(...)` to prioritize live subtree leg totals from in-memory tree state.
  - updated `resolveAccountOverviewPersonalBv(...)` to prioritize current PV (`currentPersonalPvBv` / monthly PV) and local activity resolver before cutoff/snapshot fallback values.
  - updated sales-team commission card resolution ordering to prefer ledger `byType.sales_team_commission.netAmount` before stale commission-container fallbacks.
  - updated backend cutoff personal metric sourcing in `backend/services/cutoff.service.js` so `totalPersonalPv` uses current/live PV fields first (instead of starter-only baseline values).
- Outcome:
  - Account Overview cards no longer pin to older starter/snapshot-only values when fresher live data exists.
  - `Personal BV` now tracks current personal PV logic consistently across cutoff + dashboard paths.
  - `Retail Profit` and `Sales Team Commission` cards use ledger-first behavior aligned with the new ledger source-of-truth model.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `backend/services/cutoff.service.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - `node --check backend/services/cutoff.service.js` passed.
  - `npm.cmd run test:binary-cycle` passed (`11/11`).
  - `npm.cmd run test:ledger` passed (`6/6`).

## Patch Update (2026-04-28) - Member Ledger Metadata Visibility Reduced

- Completed:
  - removed member-facing metadata panel from `User Dashboard > Commissions` ledger rows.
  - metadata remains persisted in backend ledger entries for internal audit/debug use.
- Outcome:
  - cleaner member ledger view with less low-level technical payload exposure.
  - no change to ledger creation logic, storage schema, or summary calculations.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - inline script parse check passed for `index.html` (`Parsed inline scripts: 3`).

## Patch Update (2026-04-28) - Ledger Historical Backfill Completed For `zeroone`

- Completed:
  - added `backend/scripts/backfill-ledger-entries.mjs` and npm command `backfill:ledger`.
  - executed targeted ledger backfill for `username=zeroone` after dry-run validation.
  - validated idempotency by re-running the same live command (no duplicate inserts).
- Backfill results (live):
  - total new ledger rows: `9`
  - retail commission: `1`
  - fast-track commission: `3`
  - payout entries: `5` (`2 paid`, `3 failed`)
  - sales-team commission: `0` (no positive historical snapshot rows)
- Outcome:
  - member ledger summary for `zeroone` now loads with historical data.
  - historical commission/payout visibility is now available on ledger-driven screens.
  - rerun safety confirmed via idempotency-key behavior.
- Files updated:
  - `backend/scripts/backfill-ledger-entries.mjs`
  - `package.json`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/BackEnd-Notes.md`
- Validation:
  - `node --check backend/scripts/backfill-ledger-entries.mjs` passed.
  - `npm.cmd run backfill:ledger -- --dry-run --username=zeroone` passed.
  - `npm.cmd run backfill:ledger -- --username=zeroone` passed.
  - second live run returned idempotent results for all eligible events.
  - `npm.cmd run test:ledger` passed (`6/6`).

## Recent Update (2026-04-28) - Dedicated Ledger System Completed (Member + Admin + Backend)

- Completed:
  - introduced dedicated backend ledger modules and routing:
    - `backend/utils/ledger.helpers.js`
    - `backend/stores/ledger.store.js`
    - `backend/services/ledger.service.js`
    - `backend/controllers/ledger.controller.js`
    - `backend/routes/ledger.routes.js`
  - mounted ledger routes in app bootstrap and integrated commission-event ledger writes for:
    - retail commission
    - fast-track commission
    - sales-team commission
    - payout debit on payout fulfillment
  - added member Commissions page ledger UI in `index.html` with:
    - summary cards
    - filter controls
    - ledger table/details
    - recent activity sourcing from ledger entries
  - added admin ledger explorer in `admin.html` with:
    - global filters/search
    - summary cards
    - adjustment creation
    - reversal action support
  - added ledger unit tests (`backend/tests/ledger.service.test.js`) and npm script (`test:ledger`).
- Outcome:
  - ledger is now a structured, auditable source-of-truth layer for user earnings and payout-linked debits.
  - member/admin UIs are aligned to the same ledger data model and status vocabulary.
  - duplicate posting risk is reduced by idempotency-key handling at write time.
- Files updated:
  - `backend/app.js`
  - `backend/routes/ledger.routes.js`
  - `backend/controllers/ledger.controller.js`
  - `backend/services/ledger.service.js`
  - `backend/stores/ledger.store.js`
  - `backend/utils/ledger.helpers.js`
  - `backend/services/store-checkout.service.js`
  - `backend/services/member.service.js`
  - `backend/services/member-business-center.service.js`
  - `backend/services/payout.service.js`
  - `backend/tests/ledger.service.test.js`
  - `package.json`
  - `index.html`
  - `admin.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`
  - `Claude_Notes/admin-dashboard-page.md`
  - `Claude_Notes/BackEnd-Notes.md`
- Validation:
  - `node --check` passed for touched backend ledger files.
  - inline script parse checks passed for `index.html` and `admin.html`.
  - `npm.cmd run test:ledger` passed (`6/6`).
  - `npm.cmd run test:binary-cycle` passed (`11/11`).

## Patch Update (2026-04-28) - Zeroone Ledger Summary Bootstrap Failure Fixed

- Completed:
  - patched ledger table bootstrap fallback in `backend/stores/ledger.store.js` to:
    - attempt install with primary DB pool first
    - use admin pool only as fallback when admin credentials are configured
    - return clearer combined install error details when both paths fail.
- Outcome:
  - member ledger summary load is no longer blocked by admin-credential auth failures during table bootstrap.
  - direct `zeroone` summary service call now returns success (`200`).
- Files updated:
  - `backend/stores/ledger.store.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/BackEnd-Notes.md`
- Validation:
  - `node --check backend/stores/ledger.store.js` passed.
  - `npm.cmd run test:ledger` passed (`6/6`).
  - `npm.cmd run test:binary-cycle` passed (`11/11`).

## Recent Update (2026-04-26) - Dashboard Cutoff Identity Sync Fix + Backend Identity Normalization

- Completed:
  - fixed `index.html` cutoff identity query construction to resolve identity dynamically on each sync instead of capturing a stale one-time snapshot.
  - expanded dashboard cutoff identity fallbacks to include:
    - `id/userId/memberId`
    - `username/memberUsername`
    - `email/userEmail/login`
  - normalized dashboard cutoff usernames by stripping leading `@`.
  - triggered immediate cutoff-metrics refresh after async session hydration completes.
  - updated `backend/services/cutoff.service.js` identity matching to treat `@username` and `username` as equivalent.
- Outcome:
  - prevents server cutoff panel from sticking at `0 / 0` when session identity arrives after initial card init or carries `@`-prefixed usernames.
  - member cutoff metrics endpoint now resolves identities robustly across normalized username variants.
- Files updated:
  - `index.html`
  - `backend/services/cutoff.service.js`
  - `Claude_Notes/member-dashboard-page.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check backend/services/cutoff.service.js` passed.
  - inline script parse check for `index.html` passed (`INLINE_SCRIPT_PARSE_OK blocks=3`).
  - `getMemberServerCutoffMetrics({ username: '@zeroone' })` resolved expected metrics successfully.

## Recent Update (2026-04-26) - Business Center Dynamic Cycle Direction Aligned

- Completed:
  - updated `backend/services/member-business-center.service.js` cycle settlement computation to enforce dynamic consumption direction:
    - weaker leg consumes `cycleHigherBv` (default `1000 BV`)
    - stronger leg consumes `cycleLowerBv` (default `500 BV`)
  - removed the previous balancing heuristic that could consume the lower threshold on the weaker leg in some scenarios.
  - kept admin display logic unchanged by request (admin is management-only and non-reward-critical).
- Outcome:
  - Business Center cycle carry/consumption behavior now matches member-side cutoff cycle rule direction.
  - reversed-leg scenarios now behave symmetrically (carry remains on the stronger side after one cycle).
- Files updated:
  - `backend/services/member-business-center.service.js`
  - `Claude_Notes/binary-tree-business-center.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check backend/services/member-business-center.service.js` passed.
  - scenario checks:
    - `L=1000`, `R=1192` => `cycles=1`, carry `L=0`, `R=692`
    - `L=1192`, `R=1000` => `cycles=1`, carry `L=692`, `R=0`

## Recent Update (2026-04-26) - Monthly Active Window + 7-Day Renewal Warning Window

- Completed:
  - upgraded activity resolution in `backend/utils/member-activity.helpers.js` to keep accounts `active` for 7 days after monthly due date, then auto-transition to `inactive` if 50 BV is still unmet.
  - kept status output as `active`/`inactive` only, and added warning metadata instead of introducing a public `grace` status.
  - updated purchase + upgrade mutation paths in `backend/services/member.service.js` so `activityActiveUntilAt` extends only when current-cycle qualification is achieved.
  - exposed warning payload fields through user/member/auth sanitization in:
    - `backend/stores/user.store.js`
    - `backend/stores/member.store.js`
    - `backend/utils/auth.helpers.js`.
- Outcome:
  - members keep eligibility during the 1-week renewal window.
  - non-qualifying low-BV updates no longer create monthly extension loopholes.
- Files updated:
  - `backend/utils/member-activity.helpers.js`
  - `backend/services/member.service.js`
  - `backend/stores/user.store.js`
  - `backend/stores/member.store.js`
  - `backend/utils/auth.helpers.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check backend/utils/member-activity.helpers.js` passed.
  - `node --check backend/services/member.service.js` passed.
  - `node --check backend/stores/user.store.js` passed.
  - `node --check backend/stores/member.store.js` passed.
  - `node --check backend/utils/auth.helpers.js` passed.

## Recent Update (2026-04-26) - Inactive Earnings Enforcement (Sales Team + Rank/Good Life)

- Completed:
  - enforced inactive-state earning suppression during server cutoff in `backend/services/admin.service.js` by zeroing inactive cycle/commission credit outputs.
  - preserved BV consumption/carry-forward baseline mechanics at cutoff so remaining BV still rolls forward correctly.
  - blocked Sales Team commission transfer to E-Wallet while inactive in `backend/services/wallet.service.js`.
  - updated rank progression cycle resolution in `backend/services/member-achievement.service.js` so inactive accounts contribute `0` cycles and cannot bypass active requirement for rank reward eligibility.
  - updated Good Life monthly claimability in `backend/services/member-good-life.service.js` so inactive accounts cannot claim rewards.
- Outcome:
  - inactive accounts are now excluded from Sales Team payout/cycle credit and related reward claims, while BV carry-forward behavior remains intact.
- Files updated:
  - `backend/services/admin.service.js`
  - `backend/services/wallet.service.js`
  - `backend/services/member-achievement.service.js`
  - `backend/services/member-good-life.service.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check backend/services/admin.service.js` passed.
  - `node --check backend/services/wallet.service.js` passed.
  - `node --check backend/services/member-achievement.service.js` passed.
  - `node --check backend/services/member-good-life.service.js` passed.

## Recent Update (2026-04-26) - Server Cutoff Carry-Forward Baseline Fix

- Completed:
  - updated cutoff-state baseline write logic in `backend/services/admin.service.js` so cutoff no longer zeroes weekly carry-forward by setting baselines to full leg totals.
  - added carry-forward baseline resolver using:
    - existing cutoff baselines
    - current week BV delta (total minus baseline)
    - cycle rule thresholds (`cycleLowerBv` / `cycleHigherBv`)
    - consumed BV from current-week cycles.
  - wired `forceServerCutoff(...)` to persist computed baselines for `baselineLeftLegBv` and `baselineRightLegBv`.
- Outcome:
  - leftover BV from the non-consumed side now carries into the following weekly cutoff window instead of being wiped on cutoff.
- Files updated:
  - `backend/services/admin.service.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check backend/services/admin.service.js` passed.

## Recent Update (2026-04-26) - Enrollment Split Option + Personal Split Restriction + Product Naming Alignment

- Completed:
  - updated Binary Tree enrollment product field to include exact product naming:
    - `MetaCharge™`
    - `MetaRoast™`
  - added `Split Products` as an explicit third enrollment product option.
  - implemented enrollment split gating so split is only available for Business/Infinity/Legacy packages (not Personal).
  - updated Binary Tree enrollment dropdown behavior to hide split option for Personal/non-eligible packages (not only disable).
  - updated enrollment checkout summary product row to show dynamic split allocation text when split is selected.
  - preserved upgrade product mode options (`All MetaCharge™`, `All MetaRoast™`, `Split Products`) and enforced split eligibility for Business+ target packages.
  - updated Binary Tree upgrade review selector to hide split button for personal-target upgrades.
  - aligned backend normalization in `member.service.js` for:
    - split-aware enrollment product handling by package
    - split-aware upgrade mode gating by target package
    - persisted `currentPackageProductKey` split-state tracking for future upgrade continuity.
- Outcome:
  - split is now an interactive, controlled option instead of a forced/default behavior.
  - Personal package flows keep single-product choices only, while Business+ supports valid split allocation paths.
  - split option is no longer visible in Binary Tree for Personal package contexts.
- Files updated:
  - `binary-tree-next.html`
  - `binary-tree-next-app.mjs`
  - `backend/services/member.service.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - inline script parse check for `index.html`: `All inline scripts parsed successfully. Blocks: 3`.

## Recent Update (2026-04-26) - Dynamic Weaker/Stronger Cycle Cut + Sales Team KPI Fix

- Completed:
  - switched cycle math to dynamic cut direction:
    - weaker leg consumes `1000 BV`
    - stronger leg consumes `500 BV`
  - applied dynamic rule in backend cutoff consumption, cutoff metrics estimation, dashboard loop formulas, and binary tree loop formulas.
  - fixed Sales Team KPI behavior so previously earned Sales Team balance from commission container is not erased when current loop cycles drop/reset after cutoff.
  - added sync guard to avoid posting downgraded sales-team snapshot values that can wipe existing earned KPI state.

- Outcome:
  - carry-forward logic now aligns with expected scenario (`L=1000`, `R=1192` => `R` carry `692` after one cycle).
  - Sales Team KPI card preserves earned balance/cycle context instead of unexpectedly dropping to zero during loop refresh.

- Files updated:
  - `backend/services/admin.service.js`
  - `backend/services/cutoff.service.js`
  - `index.html`
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `node --check backend/services/admin.service.js` passed.
  - `node --check backend/services/cutoff.service.js` passed.
  - `node --check binary-tree-next-app.mjs` passed.
  - inline script parse check for `index.html`: `All inline scripts parsed successfully. Blocks: 3`.
  - `node --check backend/services/member.service.js` passed.

## Recent Update (2026-04-24) - Search Overlay Clipping Fix While Mobile Panel Scrolls

- Completed:
  - fixed the mobile search-field overlay mismatch where input text/placeholder could render above the handle area during panel content scroll.
  - introduced `sideNavSearchInputClipRect` and synced it from `drawSideNav(...)` for closed and expanded states.
  - added clip-path logic in `syncSideNavSearchInput()` so the DOM input is clipped to the panel content viewport.
  - added visibility gating so search dropdown only appears when the search field is fully visible.
  - updated gesture hit-testing to use clipped search-input bounds, preventing hidden input areas from intercepting drag/scroll interactions.
- Outcome:
  - search text now scrolls/clips with the panel content instead of visually floating above the handle region.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-24) - Desktop Profile Icon Placement Scoped Correctly

- Completed:
  - restricted in-panel search-row profile icon rendering to mobile only.
  - removed desktop in-panel profile icon from the left panel search row.
  - restored desktop floating profile icon on the right side and wired it as the profile-menu anchor.
- Outcome:
  - desktop now keeps profile access on the right side of the screen.
  - mobile keeps the Apple Maps style in-panel profile icon behavior.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-24) - Profile Menu Logout Action Wired

- Completed:
  - fixed profile menu logout action in `binary-tree-next-app.mjs` so it performs real sign-out.
  - added shell-level session clear helpers for current source storage and cookie cleanup.
  - mapped source-aware logout redirect paths:
    - member -> `/login.html`
    - admin -> `/admin-login.html`.
- Outcome:
  - tapping `Log out` in Binary Tree Next profile menu now clears auth state and exits to login, instead of only dismissing the menu.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-24) - Outside Mobile Button Groups Smooth Fade During Half -> Full

- Completed:
  - updated mobile outside button groups in `binary-tree-next-app.mjs` to animate continuously as the center panel transitions from half to full.
  - replaced hard full-stage visibility cutoff with expansion-progress-driven reveal math.
  - added alpha + subtle offset animation support for outside controls:
    - top-right shortcut group
    - external navigation row
    - top-controls show/hide toggle.
  - removed old full-stage border-radius morph for the outside top button group so shape stays rounded and only animation behavior changes.
  - added interaction gating so controls stop receiving taps while nearly invisible.
- Outcome:
  - transition from half to full now feels smoother and aligned with the inside panel animation language, with no abrupt outside button pop/disappear.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-24) - Mobile Side Panel Density Pass (Larger Details + Bottom Edge Cleanup)

- Completed:
  - reworked mobile side-panel density in `binary-tree-next-app.mjs` so Details receives more vertical space:
    - reduced mobile favorites block baseline height
    - removed reserved mobile bottom status card slot (`memberStatusCardHeight = 0` on mobile)
    - expanded details card minimum height on mobile and rebalanced bottom-limit math.
  - updated mobile panel chrome rendering:
    - added top-only rounded panel path
    - removed visible bottom corner/border artifacts by extending panel chrome off-screen bottom.
- Outcome:
  - mobile Details area now has significantly more usable space and tracks closer to desktop content density.
  - bottom border/corner artifacts at the screen edge are no longer rendered for the mobile sheet.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-24) - Binary Tree Next Mobile Sheet UX + Touch Navigation Hardening

- Completed:
  - converted Binary Tree Next left panel mobile behavior into a three-stage Apple Maps style sheet:
    - `closed` (~92% translated)
    - `half` (50% translated)
    - `full` (0% translated)
  - added mobile panel handle interaction with continuous drag-follow behavior
  - added velocity-projected snap calculation + spring settle animation for release behavior
  - kept left panel open as mobile primary control surface
  - moved profile icon back beside search bar in left-panel search row
  - added touch gesture support improvements:
    - two-finger pinch zoom
    - center-aware touch pan while pinching
    - safer touch pointer cleanup across up/cancel/leave
  - added edge-swipe browser navigation guard + active-gesture `touchmove` prevent-default protection (`passive: false`) to reduce accidental browser back/forward gestures on mobile
  - added stage-aware scroll lock behavior:
    - `FULL`: internal panel content scroll enabled
    - `HALF/CLOSED`: scroll locked so drag controls sheet state
  - centered major Binary Tree overlay panels for mobile rendering:
    - Account Overview
    - Enroll Member
    - My Store
    - Infinity Tier Commission
    - Legacy/Rank Advancement panel
    - Preferred Accounts.
- Outcome:
  - mobile UX now behaves like a native-feeling snap sheet with closed/half/full states, velocity-aware snapping, and spring motion.
  - key overlays now render in a centered mobile frame instead of desktop-only side anchoring behavior.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `binary-tree-next.html`
  - `Claude_Notes/binary-tree-next.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - localhost screenshot sanity pass executed for mobile viewport via `screenshot.mjs`.

## Recent Update (2026-04-23) - Business Center Production Redesign In Progress

- Completed:
  - replaced legacy Business Center backend logic with owner-node architecture and max 3 center model
  - added configurable tier unlock rules + owner progress tracking (unlocked/activated/pending)
  - added manual activation idempotency flow and activation audit records
  - added source-attributed commission events + owner wallet ledger entries (single-wallet credit model)
  - added member endpoints for per-center earnings and wallet summary
  - updated member dashboard Business Center panel to show:
    - unlock/activation status
    - unified wallet summary
    - per-center earnings breakdown
  - updated tree/KPI filtering to exclude placeholder, auxiliary center, and staff/admin nodes where applicable.
- Outcome:
  - Business Centers are now modeled as independent earning positions with owner-level wallet aggregation and audit-safe source attribution.
- Files updated:
  - `backend/services/member-business-center.service.js`
  - `backend/controllers/member-business-center.controller.js`
  - `backend/routes/member-business-center.routes.js`
  - `backend/stores/member.store.js`
  - `index.html`
  - `binary-tree.mjs`
  - `Claude_Notes/binary-tree-business-center.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check backend/services/member-business-center.service.js` passed.
  - `node --check backend/controllers/member-business-center.controller.js` passed.
  - `node --check backend/routes/member-business-center.routes.js` passed.
  - `node --check backend/stores/member.store.js` passed.
  - `node --check binary-tree.mjs` passed.
  - inline script syntax parse for `index.html` last script block passed.

### Addendum (2026-04-23) - Left-Only Activation + Standalone Panel Layout

- Completed:
  - locked Business Center activation to LEFT side in backend service validation/normalization path
  - removed side selector from dashboard activation controls
  - moved Business Center activation/earnings UI out of Legacy Leadership panel into a standalone panel card.
- Outcome:
  - activation behavior now matches strict business rule (Business Centers always pinned left)
  - Business Center controls are visually isolated from Legacy Leadership tier UI for clearer ownership and maintenance.
- Validation:
  - `node --check backend/services/member-business-center.service.js` passed
  - `index.html` inline script syntax parse passed (last script block).

### Addendum (2026-04-23) - Infinity/Legacy Dashboard Panels Removed

- Completed:
  - removed Infinity Tier Commission dashboard panel from member dashboard layout
  - removed Legacy Leadership Bonus dashboard panel from member dashboard layout
  - retained standalone Business Center panel as the dashboard-facing activation/earnings surface.
- Outcome:
  - user dashboard no longer duplicates Infinity/Legacy tier-card UI that is already represented in Binary Tree views
  - Business Center panel remains isolated and visible as its own component.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-business-center.md`
- Validation:
  - `index.html` inline script syntax parse passed (2 inline script blocks).

## Recent Update (2026-04-18) - Member Dashboard Session Validation Gate Tightened

- Completed:
  - added local session usability checks in index.html (requires session payload + authToken, and rejects locally expired token snapshots)
  - added startup server session preflight (validateMemberAuthSessionWithServer) before dashboard module initialization
  - wrapped dashboard startup sequence in bootstrapMemberDashboardApp so core member modules only boot after validation
  - added invalid-session redirect behavior (clearUserSession() + window.location.replace('./login.html')) for explicit auth-denied responses (401/403).
- Outcome:
  - stale browser sessions no longer keep users on member dashboard after backend session invalidation/flush
  - root/member entry now falls back to login when there is no valid server-backed member session.
- Files updated:
  - index.html
  - Claude_Notes/member-dashboard-page.md
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Validation:
  - inline script parse check passed for index.html (2 blocks).

### Addendum (2026-04-18) - No Dashboard Prepaint Before Invalid-Session Redirect

- Applied head-level auth boot visibility gate on member dashboard page.
- Body stays hidden until server session validation confirms auth state.
- Invalid/expired sessions now redirect to login without visible dashboard skeleton flash.
- Updated bootstrap release point to mark auth boot ready only after validation pass.
- Validation: inline script parse check passed for index.html (3 blocks).

### Addendum (2026-04-18) - Login Text Field Intro Animation Restored

- Updated login intro flow by removing early input autofocus that was interfering with text field reveal visuals.
- Kept intro scheduler + BFCache replay behavior unchanged.
- Outcome: login text fields now present with the expected intro animation appearance.
- Files updated:
  - login.html
  - Claude_Notes/member-login-page.md
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Validation: visual screenshot checks captured on localhost login route.

## Recent Update (2026-04-16) - Setup Password Pages Updated to Store/Register Theme

- Completed:
  - redesigned member setup page (`password-setup.html`) to match new white store/register visual direction
  - redesigned preferred setup page (`store-password-setup.html`) to the same style system
  - retained existing setup logic (token validation, audience redirect, preferred email recovery, store-scoped links).
- Outcome:
  - both new-member and preferred-account password setup flows now feel consistent with current storefront design language.
- Files updated:
  - `password-setup.html`
  - `store-password-setup.html`
  - `Claude_Notes/member-login-page.md`
  - `Claude_Notes/preferred-customer-page.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - inline script parse checks passed:
    - `password-setup.html` (`1` block)
    - `store-password-setup.html` (`1` block)

## Recent Update (2026-04-16) - Default Theme Set to Light Across Member App + New Registrations

- Completed:
  - changed member dashboard document boot theme from dark to light (`index.html`)
  - changed runtime `appTheme` boot default and unknown-theme fallback normalization to light
  - changed theme switcher and Stripe appearance fallback branches to light-safe defaults
  - added registration-success theme seed in `store-register.html` to persist `appTheme: 'light'` for newly created accounts.
- Outcome:
  - app now boots in Light mode by default
  - newly registered accounts are explicitly seeded to Light mode in browser runtime settings
  - existing explicit dark-mode user choices remain supported through normal theme toggles.
- Files updated:
  - `index.html`
  - `store-register.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/preferred-customer-page.md`
- Validation:
  - inline script parse checks passed:
    - `index.html` (`2` blocks)
    - `store-register.html` (`1` block)

## Recent Update (2026-04-16) - Preferred Unattributed Fallback Sponsor Now Configurable

- Completed:
  - added backend runtime setting `unattributedFreeAccountFallbackSponsorUsername` for unattributed Preferred routing
  - wired checkout Preferred identity flow to read runtime fallback first, then env fallback, then `admin`
  - added admin runtime settings GET compatibility route (`GET /api/admin/runtime-settings`)
  - added Admin Settings UI card to choose/save fallback sponsor from current member/admin identities
  - updated preferred-customer parked-state logic to respect configured fallback sponsor (not only admin).
- Outcome:
  - unattributed Preferred registrations/upgrades can now be parked under an admin-selected holding sponsor and transferred later without changing Binary Tree Next checkout behavior.
- Files updated:
  - `backend/stores/runtime.store.js`
  - `backend/services/runtime.service.js`
  - `backend/services/store-checkout.service.js`
  - `backend/routes/runtime.routes.js`
  - `admin.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/preferred-customer-page.md`
- Validation:
  - `node --check backend/stores/runtime.store.js` passed.
  - `node --check backend/services/runtime.service.js` passed.
  - `node --check backend/services/store-checkout.service.js` passed.
  - `node --check backend/routes/runtime.routes.js` passed.

## Recent Update (2026-04-14) - Hero Badge Colors Tuned (Legacy Teal/Navy + Founder Amber/Gold)

- Completed:
  - set legacy rank circle to dark teal/navy gradient colors
  - set title-1/legacy-founder circle to dark amber/gold gradient colors
  - kept gradients on the existing shared formula path used by account overview visuals
  - restored icon-only drop shadow for badge icons while keeping circle container shadows disabled.
- Outcome:
  - hero badge colors now match requested rank/title tone targets while preserving Binary Tree Next gradient logic consistency.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `binary-tree-next.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-14) - Hero Glow Effects Removed

- Completed:
  - removed remaining hero glow/shadow from badge circles, avatar, and status dot
  - removed runtime sheen overlay logic and runtime badge shadow assignments
  - enforced icon filter reset with `filter: none !important`.
- Outcome:
  - hero circles now render flatter/cleaner without glow effects.
- Files updated:
  - `binary-tree-next.html`
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-14) - Hero Top Section Center-Anchored, Icon Shadows Removed

- Completed:
  - centered Account Overview hero trio layout in the panel
  - removed drop shadow from rank/title icons inside the badge circles.
  - cleaned duplicate hero mobile CSS declaration (`justify-items`) from the media block.
- Outcome:
  - top hero row now sits anchored in the middle of the panel and icon shadows no longer compete with the gradient circles.
- Files updated:
  - `binary-tree-next.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`

## Recent Update (2026-04-14) - Direct Sponsors Card Added to Account Overview

- Completed:
  - added missing `Direct Sponsors` card to Sales and Business Volumes section
  - updated arrangement to requested 6-card sequence
  - wired Direct Sponsors value to live direct-enrollment count from tree/session data.
- Outcome:
  - Sales and Business Volumes now includes the direct enrollment KPI and matches requested order.
- Files updated:
  - `binary-tree-next.html`
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-14) - Sales and Business Volumes Arrangement Matched to Requested Order

- Completed:
  - reordered Sales and Business Volumes cards to exact requested sequence
  - changed Weekly Cycle Cap card presentation to:
    - value: `1 / 1,000`
    - label: `Weekly Cycle Cap`.
- Outcome:
  - section card flow now mirrors the requested dashboard structure.
- Files updated:
  - `binary-tree-next.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`

## Recent Update (2026-04-14) - Account Overview Cards Set to Borderless

- Completed:
  - removed outline borders from both card groups in Account Overview panel
  - removed commission hover border color override to keep cards visually identical and borderless.
- Outcome:
  - Sales/Business cards and Track Commissions cards now share the same borderless card surface style.
- Files updated:
  - `binary-tree-next.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`

## Recent Update (2026-04-14) - Account Overview Card Radius Tightened

- Completed:
  - reduced both dashboard card groups from `24px` to `18px` corner radius.
- Outcome:
  - cards now feel less rounded while preserving consistent styling across Sales/Business and Track Commissions sections.
- Files updated:
  - `binary-tree-next.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`

## Recent Update (2026-04-14) - Track Commissions Cards Unified with Volume Card Style

- Completed:
  - matched Track Commissions card geometry/spacing to Sales and Business Volumes cards
  - removed extra-bold typography emphasis from KPI values
  - aligned commission label typography with volume label styling.
- Outcome:
  - both dashboard card groups now render with one consistent visual token system and lighter text weight.
- Files updated:
  - `binary-tree-next.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`

## Recent Update (2026-04-14) - Account Overview Volume Cards Adjusted to 5-Item Set

- Completed:
  - set Account Overview card background token to `#F2F2F6`
  - reduced card radius to `24px` so cards remain slightly less curved than outer panel (`36px`)
  - removed Sales Team Commission tile from Sales and Business Volumes
  - set Sales and Business Volumes to requested 5-card list
  - updated default cycle label to `Weekly Cycle Cap | 1 / 1,000`.
- Outcome:
  - card geometry and tone now align with requested panel token refinements
  - Sales and Business Volumes section now matches requested structure without extra KPI cards.
- Files updated:
  - `binary-tree-next.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`

## Recent Update (2026-04-14) - Binary Tree Next Account Overview Visual Language Alignment

- Completed:
  - tuned Account Overview shell geometry to match Binary Tree Next left panel style language:
    - `36px` outer radius
    - shell-border tones aligned to existing panel chrome
    - white main background retained by design request
  - updated internal tile/button radii to follow existing rounded-card geometry (`28px`)
  - added hero badge wrapper hooks and wired node-formula gradient rendering for hero circles
  - added visual sync routine so profile avatar, status dot, rank/title labels, and badge/icon skin stay tied to current session/home node data.
- Outcome:
  - Account Overview panel now reads as part of the same BT-Next UI family while preserving requested white dashboard surface.
  - gradient circles now follow the same palette/math family used by tree node avatars instead of static one-off gradients.
- Files updated:
  - `binary-tree-next.html`
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - screenshot comparison skipped per user instruction.

## Recent Update (2026-04-14) - Binary Tree Next Account Overview Panel Toggle Wiring

- Completed:
  - added right-rail canvas dock action to show/hide Account Overview panel (`panel:account-overview:toggle`)
  - added `accountOverviewVisible` state flag to Binary Tree Next UI state
  - wired panel position and visibility sync helpers to align panel with current side-nav layout behavior
  - connected Account Overview header close button to hide panel behavior.
- Outcome:
  - Account Overview panel can now be hidden/shown from the right-side button rail while preserving Binary Tree Next???s hybrid rendering pattern (canvas shell + DOM panel).
  - panel positioning now tracks current layout calculations instead of remaining static.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `binary-tree-next.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - screenshot validation skipped per user instruction.

## Recent Update (2026-04-14) - Preferred Customer Page Runtime Render Fix

- Completed:
  - fixed `ReferenceError: normalizeText is not defined` in `index.html` Preferred Customer invoice classifier (`isEnrollmentGeneratedInvoice`).
  - replaced undefined helper call with inline safe normalization for invoice IDs.
- Outcome:
  - Preferred Customer page now renders sponsor-linked preferred members and guest-attributed invoice cards again for `zeroone`.
  - validated render state:
    - `2 customers`
    - `3 guest invoices`
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/preferred-customer-page.md`
- Validation:
  - browser automation snapshot on `/PreferredCustomer` confirmed:
    - planner cards: `2`
    - guest cards: `3`

## Recent Update (2026-04-13) - Duplicate-Key Write Crash Fix + Guest Identity Server Guard

- Completed:
  - hardened snapshot writers in `backend/stores/metrics.store.js` and `backend/stores/member.store.js` with row dedupe + transactional table locks
  - added `ON CONFLICT (id) DO UPDATE` protection for metrics snapshot inserts
  - added source-aware server guard in `backend/services/store-checkout.service.js` so public `guest/free-account` checkout metadata no longer persists session-linked buyer identity fields.
  - added store-product migration fallback in `backend/stores/store-product.store.js` so admin-pool auth failures fall back to service-pool schema migration path.
- Outcome:
  - backend no longer throws repeated `23505` duplicate-key errors for:
    - `binary_tree_metrics_snapshots_pkey`
    - `sales_team_commission_snapshots_pkey`
    - `registered_members_pkey`
  - guest checkout capture is now enforced server-side even with stale frontend payload behavior.
- Files updated:
  - `backend/stores/metrics.store.js`
  - `backend/stores/member.store.js`
  - `backend/services/store-checkout.service.js`
  - `backend/stores/store-product.store.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check backend/stores/metrics.store.js` passed.
  - `node --check backend/stores/member.store.js` passed.
  - `node --check backend/services/store-checkout.service.js` passed.
  - `node --check backend/stores/store-product.store.js` passed.
  - parallel/concurrent write smoke tests completed without duplicate-key failures.

## Recent Update (2026-04-13) - Preferred Customer Invoice Visibility + Guest Checkout Capture Hardening

- Completed:
  - patched preferred-customer planner invoice matching in `index.html` so preferred-member invoices are counted when member identity matches, even for legacy/default-attributed records
  - expanded owner attribution-code resolver to include `attributionStoreCode` and internal/public code aliases (`M-*` <-> `CHG-*`)
  - updated public checkout payload builder in `storefront-shared.js` so `guest` / `free-account` modes no longer attach session `buyerUserId` / `buyerUsername`.
- Outcome:
  - preferred-member invoice rows no longer disappear when invoice attribution fell back to legacy/default code paths
  - guest checkout invoices are less likely to be misclassified as linked-member purchases due to residual browser session identity.
- Files updated:
  - `index.html`
  - `storefront-shared.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/preferred-customer-page.md`
  - `Claude_Notes/public-store-page.md`
- Validation:
  - `node --check storefront-shared.js` passed.
  - inline script parse checks passed:
    - `Parsed inline scripts in index.html: 1`
    - `Parsed inline scripts in store-checkout.html: 1`.

## Recent Update (2026-04-13) - Active Status and Dashboard PV Source Aligned

- Completed:
  - investigated inactive-state mismatch where dashboard displayed a large PV value but activity status remained inactive
  - removed stale legacy inactive-string hard override behavior in shared backend activity helper
  - aligned dashboard Personal Volume KPI to monthly `currentPersonalPvBv` (same metric used by active/inactive gate)
  - updated dashboard fallback/update paths to stop using `currentWeekPersonalPv` for account-activity PV display
  - preserved weekly cutoff/cycle metrics for cutoff views only.
- Outcome:
  - account activity status and Personal Volume card now use the same monthly Personal BV source of truth, preventing false high-PV/inactive mismatches caused by legacy weekly baseline values.
- Files updated:
  - `backend/utils/member-activity.helpers.js`
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check backend/utils/member-activity.helpers.js` passed.
  - inline script parse check for `index.html`: `All inline scripts parsed successfully. Blocks: 5`.

## Recent Update (2026-04-13) - Binary Tree Next Favorites Live Cross-Session Sync

- Completed:
  - added authenticated read endpoint for pinned favorites:
    - `GET /api/member-auth/binary-tree-next/pinned-nodes`
  - wired pinned-favorites pull sync into the existing Binary Tree Next live-sync loop so active sessions poll and apply remote favorite changes without reload
  - added merge/guard logic to avoid overwriting local pending pin changes while a local write sync is in-flight or queued
  - added write-retry behavior for transient pinned-favorites sync failures (excluding auth-denied statuses).
- Outcome:
  - when the same account is open in multiple browsers/devices, pinning/unpinning a node in one session now propagates to the other active session automatically on live-sync intervals/focus refresh.
- Files updated:
  - `backend/services/auth.service.js`
  - `backend/controllers/auth.controller.js`
  - `backend/routes/auth.routes.js`
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check backend/services/auth.service.js` passed.
  - `node --check backend/controllers/auth.controller.js` passed.
  - `node --check backend/routes/auth.routes.js` passed.
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-13) - Binary Tree Next Favorites Persisted Server-Side Across Devices

- Completed:
  - added authenticated member API endpoint to save pinned favorites:
    - `PUT /api/member-auth/binary-tree-next/pinned-nodes`
  - extended Binary Tree launch-state response to include:
    - `pinnedNodeIds`
    - `pinnedNodeIdsUpdatedAt`
  - extended `charge.member_binary_tree_intro_state` persistence to include pinned favorites storage:
    - `pinned_node_ids text[]`
    - `pinned_node_ids_updated_at timestamptz`
  - updated `binary-tree-next-app.mjs` bootstrap to hydrate pinned favorites from server launch-state payload
  - added debounced member-session sync so pin/unpin actions write server-side immediately after local cache update
  - added safe backfill behavior for legacy local-only favorites when server has never recorded pinned favorites yet.
- Outcome:
  - pinned favorites in Binary Tree Next now persist by authenticated member account, so users can sign in on a different device/session and see the same favorites.
- Files updated:
  - `backend/stores/member-binary-tree-intro.store.js`
  - `backend/services/auth.service.js`
  - `backend/controllers/auth.controller.js`
  - `backend/routes/auth.routes.js`
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check backend/stores/member-binary-tree-intro.store.js` passed.
  - `node --check backend/services/auth.service.js` passed.
  - `node --check backend/controllers/auth.controller.js` passed.
  - `node --check backend/routes/auth.routes.js` passed.
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-13) - MLM Rule Refresh (Packages, Fast Track, Upgrades, Rank BV Gates)

- Completed:
  - updated package pricing/BV constants across backend and frontend:
    - Personal `192/192`
    - Business `384/300`
    - Infinity `640/500`
    - Legacy `1280/1000`
  - switched Fast Track bonus computations to commissionable BV base (backend + dashboard/admin/tree-next logic)
  - updated account-upgrade API + dashboard UI to use upgrade deltas (`priceDue`, `productCount`, `bvGain`) and explicitly enforce no Fast Track on upgrade
  - updated rank-advancement logic with new personal-volume qualification gates:
    - Ruby to Sapphire: self `50 BV`, side `1:1` with `50 BV` each
    - Diamond to Black Diamond: self `100 BV`, side `2:2` with `50 BV` each
    - Crown to Royal Crown: self `200 BV`, side `3:3` with `50 BV` each
  - updated tree-next package metadata (price/BV/selectable-products) to match revised package chart
  - aligned store rank discount map with refreshed discount structure (`15%` preferred/free, `20%` paid ranks).
- Outcome:
  - account package values, Fast Track payouts, upgrade math, and rank-advancement gating now follow the latest MLM business logic document.
- Files updated:
  - `backend/services/member.service.js`
  - `backend/services/admin.service.js`
  - `backend/services/member-achievement.service.js`
  - `backend/scripts/simulate-zeroone-live-test.mjs`
  - `index.html`
  - `admin.html`
  - `login.html`
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check backend/services/member.service.js` passed.
  - `node --check backend/services/admin.service.js` passed.
  - `node --check backend/services/member-achievement.service.js` passed.
  - `node --check backend/scripts/simulate-zeroone-live-test.mjs` passed.
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-13) - Small-Screen Height Trigger Updated to 1065

- Completed:
  - changed Step-3 compact CSS breakpoint from `max-height: 980px` to `max-height: 1065px`
  - changed Step-3 compact JS logic thresholds from `949/980` usage to `1065` where small-screen sizing/edge-padding behavior is determined
- Outcome:
  - small-screen compatibility behavior now consistently activates at the requested `1065px` height condition.
- Files updated:
  - `binary-tree-next.html`
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-13) - Step-3 Spacing Tweak (Summary to Name-on-Card Gap)

- Completed:
  - increased top spacing before Step-3 payment field stack in compact mode so `Name on Card` no longer hugs the checkout summary panel
- Outcome:
  - visual separation between summary panel and card-entry section is improved while keeping existing layout structure.
- Files updated:
  - `binary-tree-next.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

## Recent Update (2026-04-13) - Step-3 Captions/Dots Restored Per Layout Preservation Request

- Completed:
  - restored Step-3 subtitle/caption visibility in compact mode
  - restored Step-3 pagination dots visibility in compact mode
  - restored Step-3 feedback row visibility in compact mode
  - retained no-scroll enforcement (no internal Step-3 scroll region) and balanced compact sizing
- Outcome:
  - original layout elements are back while the panel remains compatible on small screens.
- Files updated:
  - `binary-tree-next.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - headless check at `1440x949`: subtitle visible, dots visible, feedback visible, submit button visible, field stack overflow mode `visible`.

## Recent Update (2026-04-13) - Enroll Step-3 No-Scroll Enforcement (Rebalanced Pass)

- Completed:
  - removed Step-3 internal scroll behavior from payment field region
  - removed sticky-position action-row behavior tied to Step-3 compact mode
  - kept balanced compact sizing (panel width tiers + tuned field/button sizes) so CTA remains visible without introducing panel scrolling
- Outcome:
  - Enroll Step-3 remains compact but no longer uses any panel/inner scrolling behavior.
- Files updated:
  - `binary-tree-next.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - headless check at `1440x949`: submit button visible; Step-3 field stack overflow mode `visible` (not `auto/scroll`).

## Recent Update (2026-04-13) - Enroll Panel Rebalanced (Less Cramped, Still Small-Screen Safe)

- Completed:
  - removed overly broad shell compaction that made all enroll steps feel too tight
  - re-tuned Step-3 compact mode to a balanced profile:
    - larger title/field/button sizing than prior cramped pass
    - moderate spacing restored across summary, form rows, and actions
    - kept scrollable Step-3 field region + sticky action row so buttons remain visible
  - widened compact panel-width tiers in JS:
    - short-height tiers now resolve to larger widths (`550/540/500`) instead of overly narrow values
    - compact viewport trigger narrowed to more appropriate bounds
- Outcome:
  - Enroll panel remains responsive on smaller screens while no longer feeling overly compressed.
- Files updated:
  - `binary-tree-next.html`
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - headless check at `1440x949`: panel width `540px`, card-name input height `44px`, submit button visible.

## Recent Update (2026-04-13) - Enroll Panel Shell Reduced for Small Screens

- Completed:
  - reduced enroll panel shell size on smaller viewports using dynamic sizing logic:
    - compact viewport detection now includes short-height or narrow-width contexts
    - panel max-width now scales down by height tier (`520`, `500`, `460`) instead of staying at full desktop width
    - panel anchor gap from side shell is tightened in compact mode
  - added global small-height enroll-shell styling (`max-height: 1100px`):
    - reduced header/title/subtitle scale
    - reduced body padding and control/button heights
    - slightly smaller corner radius
- Outcome:
  - Enroll Member panel now renders as a smaller shell on small screens, improving fit before Step-3 specific compact behavior applies.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `binary-tree-next.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-13) - MacBook 1440x949 Compact Threshold Alignment

- Completed:
  - updated Step-3 compact breakpoint trigger from `max-height: 900px` to `max-height: 949px` (with `max-width: 1440px`) to align with requested MacBook profile baseline
  - updated Step-3 short-height panel-sizing logic in JS to use the same `<= 949` threshold when assigning compact vertical edge padding
- Outcome:
  - compact payment-panel behavior now activates on the specified `1440x949` class more reliably.
- Files updated:
  - `binary-tree-next.html`
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-13) - Enroll Step-3 Small-Screen Render Fix (Sticky Actions + Scroll Region)

- Completed:
  - added compact Step-3 structural layout for small laptop heights:
    - Step 3 now uses a constrained grid shell in compact mode (`summary` + `content region` + `actions`)
    - payment field region is scrollable (`overflow-y: auto`) while panel chrome remains stable
  - pinned Step-3 action row in compact mode:
    - dual buttons now use sticky bottom anchoring so CTA controls stay visible
    - added subtle footer gradient backing to keep contrast/readability over scrolling fields
  - removed compact Step-3 feedback-row footprint to reclaim vertical space in short viewports
  - kept previous Step-3 density reductions (smaller title/summary/field/button sizing)
- Outcome:
  - on smaller laptop screens, page-3 payment actions are no longer clipped and remain reachable while preserving non-scrolling panel body behavior.
- Files updated:
  - `binary-tree-next.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-13) - Enroll Step-3 Compact Small-Laptop Layout Pass

- Completed:
  - added step-aware modal state attribute wiring (`data-enroll-current-step`) in enrollment step controller
  - now re-syncs panel dimensions immediately on step change so compact Step-3 sizing applies as soon as page 3 opens
  - introduced Step-3-specific compact breakpoint rules for smaller laptop viewports (`max-width: 1440px` + `max-height: 900px`)
  - tightened Step-3 vertical density:
    - reduced header/title spacing and hid Step-3 subtitle for compact laptop-height viewports
    - reduced checkout summary padding/margins and typography scale
    - reduced input/select/Stripe field heights and internal spacing
    - reduced card/billing grid gaps and action-area top padding/button height
    - hid Step-3 progress dots in compact mode to preserve button visibility
  - adjusted Step-3 short-height panel max-height budget in positioning logic (reduced vertical edge padding) so bottom actions stay in frame more reliably
  - added extra-tight fallback (`max-height: 820px`) to hide Step-3 subtitle and recover additional vertical space
- Outcome:
  - Enroll Member page 3 is significantly tighter on short-height laptop screens, with improved bottom-button visibility while keeping panel scroll disabled.
- Files updated:
  - `binary-tree-next.html`
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-13) - Enrollment Stripe UI Adjusted to Inline Link-in-Card Pattern

- Completed:
  - removed standalone Stripe Link authentication row from Step 3
  - shifted Step-3 secure card block back to inline card-number visual pattern with `Secure Card (Stripe)` label
  - removed external custom card icon chrome so Stripe-native card/link presentation is not competing
  - retained `disableLink: false` on card-number Stripe element to allow Stripe inline Link/autofill affordance when eligible
  - preserved no-panel-scroll requirement (`#tree-next-enroll-modal-body` remains `overflow: hidden`)
- Outcome:
  - Step 3 now follows the requested inline Link-in-card style direction more closely while keeping no side-scroll behavior.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `binary-tree-next.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-13) - Enrollment Panel Scroll Removed + Floating Dropdown + Stripe Link Visibility

- Completed:
  - removed enroll-panel side scroll behavior by setting modal body overflow to hidden
  - added visible Stripe Link Authentication field in enrollment Step 3 for explicit Link/autofill entry
  - upgraded enrollment custom-select runtime to floating menu mode (portal-like to body) so dropdowns no longer clip inside the panel
  - updated select open/close + outside-click handling to support floating menu interaction safely
- Outcome:
  - Step 3 no longer shows panel-side scroll behavior, and the country dropdown is no longer clipped by panel bounds while retaining themed style.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `binary-tree-next.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-13) - Enrollment Billing Country Full List + Stripe Link Autofill Enablement

- Completed:
  - converted enrollment Step-3 Billing Country field from text input to themed custom select (matching Enrollment panel dropdown style)
  - wired billing-country option hydration from `/node_modules/flag-icons/country.json` to provide a full ISO country list for Stripe-compatible country selection
  - added large-list dropdown usability support (`max-height` + internal scroll) so country options remain usable inside the panel
  - updated Step-3 submit flow to consume selected billing-country ISO code for Stripe billing details
  - enabled Stripe Link/autofill parity setting on enrollment card-number element config (`disableLink: false`)
- Outcome:
  - enrollment checkout now has a proper styled country picker with broad country coverage and improved parity with Stripe autofill behavior from customer checkout.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `binary-tree-next.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-13) - Profile Popup Home Routing + Enrollment Card/Billing Field Parity

- Completed:
  - changed user-profile popup `Home` action in Binary Tree Next so it redirects to dashboard home page (member -> `/index.html`, admin -> `/admin.html`)
  - kept camera-reset `Home` control behavior untouched to preserve in-canvas navigation workflow
  - updated Enroll Member Step 3 card section to include full card entry scope:
    - card number (Stripe)
    - expiration (Stripe)
    - CVC (Stripe)
  - added billing-address capture fields:
    - billing address line
    - city
    - state
    - ZIP/postal code
    - country
  - added submit-time Stripe payment-method creation using entered card + billing details before member registration API request
  - updated validation to block submit unless card details and billing address are fully completed
- Outcome:
  - profile popup `Home` now returns users to dashboard home page, and enrollment Step 3 now matches Store checkout field expectations more closely.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `binary-tree-next.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.


## Recent Update (2026-04-12) - Enroll Container Changed from Modal to Center-Side Panel

- Completed:
  - converted Binary Tree Next enroll UI from full-screen modal behavior into a floating panel container
  - panel now appears beside the left panel area and is vertically centered on screen
  - removed blocking backdrop interaction so tree canvas remains visible while enroll panel is open
  - added dynamic panel positioning logic tied to layout state:
    - anchors beside expanded left panel
    - follows collapsed state with clamped viewport-safe positioning
  - retained existing enrollment form submission flow and tree update behavior
  - updated panel semantics to region-style container instead of dialog-modal behavior
- Outcome:
  - enrollment form now lives in a dedicated center-side panel, matching requested left-panel style direction and placement.
- Files updated:
  - `binary-tree-next.html`
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.


## Recent Update (2026-04-12) - Binary Tree Next Enroll Member Modal Flow Implemented

- Completed:
  - added Apple-style enrollment modal overlay to `binary-tree-next.html` with light glass look aligned to left-panel visual language
  - added full modal form fields for tree enrollment context (`fullName`, `email`, `memberUsername`, `phone`, `countryFlag`, `enrollmentPackage`, `notes`)
  - wired package-to-tier syncing in `binary-tree-next-app.mjs` using package/tier mapping metadata
  - connected anticipation slot click event (`binary-tree-enroll-member-request`) to open modal with locked placement summary (`LEFT/RIGHT` + parent)
  - implemented modal lifecycle controls:
    - dismiss/cancel buttons
    - outside-click close
    - Escape close
    - keyboard shortcut suppression while modal is open
  - implemented enroll submit request flow:
    - posts to `/api/registered-members` (member source) or `/api/admin/registered-members` (admin source)
    - sends sponsor identity, placement leg, package, and tier payload
    - surfaces success/error feedback in-modal
  - implemented immediate in-tree update on successful enrollment:
    - appends new child node directly under locked parent/side
    - refreshes adapter + child-leg occupancy index
    - keeps anticipation-slot availability in sync with newly filled leg
- Outcome:
  - Binary Tree Next now has a working enrollment modal flow launched from anticipation nodes, with live tree updates after successful registration.
- Files updated:
  - `binary-tree-next.html`
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - `node --check binary-tree-next-engine-adapter.mjs` passed.


## Recent Update (2026-04-12) - Binary Tree Next Node Anticipation Slots Restored

- Completed:
  - restored selected-node anticipation slots in `binary-tree-next-app.mjs`
  - implemented missing-leg logic:
    - selected node with no children -> show `left` and `right` anticipation nodes
    - selected node with one child -> show anticipation only on the missing leg
    - selected node with both children -> no anticipation nodes
  - added max-depth guard so anticipation does not render beyond global depth `20`
  - rendered anticipation nodes as fixed-slot overlays using deterministic path projection (no tree-structure shifting)
  - added dashed anticipation connector rendering from selected parent to each anticipation slot
  - wired anticipation slot click action to emit `binary-tree-enroll-member-request` with parent/leg context for upcoming enrollment flow
  - added `projectLocalPath(...)` helper on `binary-tree-next-engine-adapter.mjs` so anticipated child positions use the same projection math as real nodes
  - added child-leg occupancy indexing (`rebuildNodeChildLegIndex`) so hidden/depth-filtered existing children still suppress anticipation slots correctly
- Outcome:
  - Binary Tree Next now visually supports registration intent slots exactly on the binary positions without modifying current layout geometry.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `binary-tree-next-engine-adapter.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - `node --check binary-tree-next-engine-adapter.mjs` passed.


## Recent Update (2026-04-10) - First-Time Binary Tree Launch Gate

- Completed:
  - added member-auth launch-state endpoint `GET /api/member-auth/binary-tree-next/launch-state`
  - added backend first-open persistence via `charge.member_binary_tree_intro_state`
  - wired next-gen frontend bootstrap to fetch launch-state using existing member bearer token
  - added first-time-only welcome splash gate (`Welcome` + `Press the screen to continue.`)
  - first-time flow now waits for tap/click (or Enter/Space) before intro animation starts
  - non-first-time flow remains unchanged (normal startup)
- Outcome:
  - new members get a one-time intro gate after load, while returning users keep fast regular boot.
- Files updated:
  - `backend/stores/member-binary-tree-intro.store.js`
  - `backend/services/auth.service.js`
  - `backend/controllers/auth.controller.js`
  - `backend/routes/auth.routes.js`
  - `binary-tree-next-app.mjs`
  - `binary-tree-next.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check backend/stores/member-binary-tree-intro.store.js` passed.
  - `node --check backend/services/auth.service.js` passed.
  - `node --check backend/controllers/auth.controller.js` passed.
  - `node --check backend/routes/auth.routes.js` passed.
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-10) - Collapse Button Exact Icon + Motion Parity

- Completed:
  - switched left-shell collapse control from custom chevrons to exact dashboard Material Symbols icon glyphs
  - used `keyboard_double_arrow_left` for open-state collapse and `keyboard_double_arrow_right` for collapsed-state reopen
  - added icon subset links in `binary-tree-next.html` for guaranteed font availability
  - added 150ms dashboard-style spring hover animation behavior (smooth scale + subtle lift + icon tone transition)
- Outcome:
  - collapse control now matches dashboard icon language and interaction feel more closely.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `binary-tree-next.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-10) - Left Shell Collapse Arrow Added Beside Logo

- Completed:
  - added dedicated collapse-arrow button beside the brand logo/dropdown in the left-shell top row
  - updated top-row geometry so logo dropdown and collapse control are separate side-by-side controls
  - wired collapse button to `toggle:side-nav`
  - ensured compact reopen button remains visible when sidebar is collapsed
- Outcome:
  - left-shell top field now matches dashboard interaction pattern more closely (logo dropdown + neighboring collapse control).
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-10) - Left Shell Logo Jaggy-Edge Fix

- Completed:
  - upgraded canvas logo render path to high-quality smoothing
  - added DPR-aligned destination positioning/sizing for brand logo draw
- Outcome:
  - left-shell brand logo now renders cleaner and closer to dashboard DOM quality.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-10) - Left Shell Color Tokens Updated

- Completed:
  - changed left shell container color token to white (`#FFFFFF`)
  - changed inner skeleton placeholder card color token to `#EDEDED`
- Outcome:
  - left shell now matches the requested light-mode token split: white panel container + `#EDEDED` internal placeholder surfaces.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-10) - Left Shell Brand Logo Dropdown Added

- Completed:
  - converted the first top placeholder in the left shell into a real brand dropdown control
  - integrated dashboard brand logo asset (`/brand_assets/Logos/L%26D%20Logo_Cropped.png`) into the new top field
  - added dropdown menu structure with profile block + items (`Profile`, `Home`, `My Store`, `Settings`, `Log out`)
  - wired interaction behavior for open/close, outside click close, Escape close, and auto-close when side nav closes
  - mapped dropdown `Home` item to tree home recenter action (`camera:home`)
- Outcome:
  - the most important left-shell top field now behaves like a dashboard-style brand selector instead of a static skeleton block.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-10) - Next-Gen Binary Tree #F5F5F7 Background + Gray Panel Pass

- Completed:
  - changed main background back to `#F5F5F7` (canvas + HTML fallback)
  - rethemed panel chrome to neutral gray glass colors
  - removed remaining blue tint from panel controls, breadcrumbs, and toolbar active states
  - updated side-panel details card styling to gray glass tones
- Outcome:
  - UI now matches requested light-mode direction: Apple-like neutral background with gray glass panels.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `binary-tree-next.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - `node --check binary-tree-next-engine-adapter.mjs` passed.

## Recent Update (2026-04-10) - Next-Gen Binary Tree Background Tint Update

- Completed:
  - changed background from `#F5F5F7` to `#F8F8FF` (canvas + HTML fallback)
  - preserved no-grid clean background behavior
- Outcome:
  - background now uses the lighter cool gray/lavender Apple-like tint you requested.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `binary-tree-next.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - `node --check binary-tree-next-engine-adapter.mjs` passed.

## Recent Update (2026-04-10) - Next-Gen Binary Tree Background Simplification

- Completed:
  - switched canvas background to Apple gray `#F5F5F7`
  - removed workspace grid-line drawing
  - removed extra background glow/gradient layers for a cleaner flat base
  - aligned HTML fallback background to the same gray
- Outcome:
  - background now matches requested Apple-style neutral canvas with no grid visual noise.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `binary-tree-next.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - `node --check binary-tree-next-engine-adapter.mjs` passed.

## Recent Update (2026-04-10) - Next-Gen Binary Tree Select Animation Fix

- Completed:
  - fixed select animation initialization so it starts from zero emphasis
  - preserved deselect animation behavior
  - both select and deselect now animate consistently
- Outcome:
  - tap interactions now feel correct in both directions.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - `node --check binary-tree-next-engine-adapter.mjs` passed.

## Recent Update (2026-04-10) - Next-Gen Binary Tree Tap Animation (Select/Deselect)

- Completed:
  - added Apple-style tap animation for node select and deselect
  - implemented animated ring pop-in on select and smooth ring release on deselect
  - wired per-frame animation updates into render tick
  - preserved white selected ring and gray ancestor ring behavior
- Outcome:
  - node taps now feel more polished and responsive while preserving current visual hierarchy.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - `node --check binary-tree-next-engine-adapter.mjs` passed.

## Recent Update (2026-04-10) - Next-Gen Binary Tree Ring Logic Fix (Selected + Ancestor)

- Completed:
  - restored white outline ring on selected node
  - preserved gray outline ring on ancestor path nodes
  - aligned dot and full node rendering with same ring behavior
- Outcome:
  - selection and ancestry cues now both visible with correct color roles.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - `node --check binary-tree-next-engine-adapter.mjs` passed.

## Recent Update (2026-04-10) - Next-Gen Binary Tree Ring Behavior Correction

- Completed:
  - removed selected-node outline ring
  - preserved gray outline ring on ancestor/focus-path nodes only
  - aligned dot-node ring behavior with the same rule set
- Outcome:
  - visual state now keeps ancestry indicator while eliminating selected-node outline.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - `node --check binary-tree-next-engine-adapter.mjs` passed.

## Recent Update (2026-04-10) - Next-Gen Binary Tree Ancestor Outline Removed

- Completed:
  - removed ancestor/focus-path outline ring on non-selected nodes
  - kept selected-node outline behavior intact
- Outcome:
  - only selected nodes now show outline treatment.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - `node --check binary-tree-next-engine-adapter.mjs` passed.

## Recent Update (2026-04-10) - Next-Gen Binary Tree Ancestor Ring Alignment

- Completed:
  - changed ancestor/focus-path ring to use same geometry as selected ring
  - kept selected node ring white
  - changed ancestor ring color to gray
  - removed old thin-offset ancestor ring logic
- Outcome:
  - ancestor ring now clearly indicates path lineage while matching selected-node ring style language.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - `node --check binary-tree-next-engine-adapter.mjs` passed.

## Recent Update (2026-04-10) - Next-Gen Binary Tree Thin Path-Ring Tuning

- Completed:
  - customized only the ancestor thin circular outline (focus-path ring)
  - exposed ring radius/width/color controls as top-level constants
  - refined ring rendering to subtle dual-stroke style for clean readability
- Outcome:
  - the ???selected comes from this node??? thin outline is now isolated and easy to iterate without affecting selected-node styling.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - `node --check binary-tree-next-engine-adapter.mjs` passed.

## Recent Update (2026-04-10) - Next-Gen Binary Tree Trail Revert (Outline-Only)

- Completed:
  - removed custom ancestry trail line rendering
  - kept only thin circular outline indicators on focus-path ancestors
  - refined outline thickness/offset/color for cleaner presentation
- Outcome:
  - trail now matches intended behavior: subtle circular path indicators before selected node, without extra path graphics.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - `node --check binary-tree-next-engine-adapter.mjs` passed.

## Recent Update (2026-04-10) - Next-Gen Binary Tree Trail Visual Cleanup

- Completed:
  - simplified ancestry trail rendering to a single subtle line style
  - removed extra marker dots and heavy layered strokes
  - preserved path context while reducing visual noise
- Outcome:
  - trail now reads cleaner and less intrusive in light mode.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - `node --check binary-tree-next-engine-adapter.mjs` passed.

## Recent Update (2026-04-10) - Next-Gen Binary Tree Ancestor Trail Styling

- Completed:
  - introduced explicit selected-node ancestry trail rendering pass
  - styled trail separately from selection ring to avoid second-select ambiguity
  - added subtle ancestor waypoint markers for path readability
  - integrated trail layering between base connectors and node icon pass
- Outcome:
  - selected node now has clear ???where it came from??? context without blue active selector behavior.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - `node --check binary-tree-next-engine-adapter.mjs` passed.

## Recent Update (2026-04-10) - Next-Gen Binary Tree Selection Ring Correction

- Completed:
  - changed node ring behavior so thick white ring applies only to selected node
  - removed blue selected-node active halo/selector
  - aligned dot-tier selection behavior with same rule
- Outcome:
  - selection styling now matches requested Apple-like interaction intent in light mode.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - `node --check binary-tree-next-engine-adapter.mjs` passed.

## Recent Update (2026-04-10) - Next-Gen Binary Tree Apple-Style Node Icon Pass

- Completed:
  - switched main node icons to Apple-contact style ring composition
  - added thick white outer ring + inset gradient inner circle for full/medium nodes
  - kept initials centered inside inner icon circle
  - aligned dot-tier nodes with mini white-ring treatment
- Outcome:
  - node icon styling now better matches requested Apple-like light-mode appearance.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - `node --check binary-tree-next-engine-adapter.mjs` passed.

## Recent Update (2026-04-10) - Next-Gen Binary Tree Light-Mode + Blur Pass

- Completed:
  - prioritized light mode across next-gen shell colors and controls
  - moved hide/show panel control into the side panel header while open
  - replaced old circular toggle with rectangular glass button treatment
  - applied backdrop-blur style glass rendering to panel surfaces (side panel, top bar, bottom bar, detail card)
  - added deep-node label gating so depth 4+ initials stay hidden until zoomed in enough
- Outcome:
  - UI now aligns with requested light glassmorphism direction and avoids overflowed initials at default depth.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `binary-tree-next.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - `node --check binary-tree-next-engine-adapter.mjs` passed.

## Recent Update (2026-04-10) - Next-Gen Binary Tree Fullscreen Glass Shell Pass

- Completed:
  - switched next-gen tree layout from center workspace framing to fullscreen canvas viewport
  - replaced static left/right shell framing with a single in-canvas side nav overlay and runtime hide/show toggle
  - restyled shell surfaces to dark gray glassmorphism visuals for side nav, top bar, and bottom bar
  - changed node rendering to circular initials-only contact avatars (no name/detail text on node bodies)
  - added side-nav input shielding so pointer/wheel interactions inside the panel do not pan/select the tree
  - expanded adapter culling tolerance using configurable `cullMargin` and viewport-scaled margin input
- Outcome:
  - shell now matches requested fullscreen + glass feel, while reducing edge-pop culling artifacts during camera movement.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `binary-tree-next-engine-adapter.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - `node --check binary-tree-next-engine-adapter.mjs` passed.

## Recent Update (2026-04-10) - Next-Gen Binary Tree Figma-Style Canvas Shell Applied

- Completed:
  - replaced previous DOM-heavy next-gen shell with a full-canvas UI composition
  - rendered left panel, right panel, center status strip, and bottom tool panel directly in canvas
  - kept center workspace as interactive tree viewport (pan/zoom/select)
  - preserved session bootstrap checks for member/admin source routing
  - preserved modular compute boundary via `binary-tree-next-engine-adapter.mjs`
  - extended adapter projection options for workspace-anchored rendering (`viewport.centerX`, `viewport.baseY`, `nodeRadiusBase`)
- Outcome:
  - next-gen route now visually aligns with requested Figma-style workspace framing, including canvas-rendered side chrome and center tool panel behavior.
- Files updated:
  - `binary-tree-next.html`
  - `binary-tree-next-app.mjs`
  - `binary-tree-next-engine-adapter.mjs`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
  - `Claude_Notes/binary-tree-business-center.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - `node --check binary-tree-next-engine-adapter.mjs` passed.
  - route smoke: `/binary-tree-next` returned HTTP 200.

## Recent Update (2026-04-10) - Next-Gen Binary Tree Phase B Shell Controls + Adapter Layer Started

- Completed:
  - migrated `binary-tree-next` runtime from inline page script to ES module entry:
    - `binary-tree-next-app.mjs`
    - `binary-tree-next-engine-adapter.mjs`
  - added camera + viewport controls in the new app shell:
    - zoom in/out
    - fit-to-view
    - connector/grid/highlight toggles
    - keyboard pan/zoom/reset/fit shortcuts
  - added initial engine adapter boundary + diagnostics:
    - mock JS compute path isolated behind adapter API
    - runtime capability/artifact probe for future wasm bridge
    - engine mode surfaced in diagnostics strip
  - preserved protected-route/session bootstrap behavior from Phase A.
- Outcome:
  - project has a cleaner architecture seam between UI shell and compute layer, enabling next-step wasm-core integration without reworking core UI interactions.
- Files updated:
  - `binary-tree-next.html`
  - `binary-tree-next-app.mjs`
  - `binary-tree-next-engine-adapter.mjs`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
  - `Claude_Notes/binary-tree-business-center.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - `node --check binary-tree-next-engine-adapter.mjs` passed.
  - route smoke: `/binary-tree-next` returned HTTP 200 with module entry present.

## Recent Update (2026-04-10) - Next-Gen Binary Tree Phase A Foundation Shipped

- Completed:
  - created a new isolated next-gen Binary Tree page scaffold:
    - `binary-tree-next.html`
  - mounted dedicated route targets in backend app:
    - `/binary-tree-next`
    - `/binary-tree-next/`
    - `/binary-tree-next.html`
  - added launcher buttons in both active Binary Tree surfaces:
    - member `index.html` tree header `Next-Gen` action
    - admin `admin.html` tree header `Next-Gen` action
  - implemented boot-time session checks in new window app shell:
    - member source validates bearer session (`/api/member-auth/email-verification-status`)
    - invalid sessions redirect to `/login.html`
    - admin source requires admin session snapshot and redirects to `/admin-login.html` when absent
  - added mock render harness in new app viewport:
    - canvas node render + select + pan + zoom
    - left control dock + right detail panel + bottom diagnostics strip.
- Outcome:
  - dual-run strategy is now active at the route/shell level: legacy Binary Tree remains default while `binary-tree-next` runs in parallel in a separate window.
- Files updated:
  - `backend/app.js`
  - `binary-tree-next.html`
  - `index.html`
  - `admin.html`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
  - `Claude_Notes/binary-tree-business-center.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check backend/app.js` passed.

## Recent Update (2026-04-09) - Next-Gen Binary Tree (WASM) Planning Document Added

- Completed:
  - created a dedicated implementation plan for the next Binary Tree architecture:
    - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
  - documented dual-run strategy:
    - keep existing Binary Tree active for live usage/testing
    - build new Binary Tree in a separate app/page opened in a new window.
  - documented engine direction and stack plan:
    - C++ core compiled to WebAssembly for layout/geometry work
    - optional React/TypeScript shell for controls and surrounding UI.
  - documented phased rollout and migration gates:
    - no immediate cutover
    - performance/parity validation before traffic shift.
- Outcome:
  - project now has a reusable, model-friendly context file with architecture, phases, risks, and acceptance criteria for next implementation.
- Files updated:
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/binary-tree-business-center.md`
- Validation:
  - documentation-only update completed; no runtime code paths changed.

## Recent Update (2026-04-08) - Next Popup-Cover Implementation Note Prepared

- Completed:
  - created `Claude_Notes/binary-tree-popup-cover-next-implementation.md` for the next execution phase.
  - documented all required routes to inspect:
    - frontend pages: `/Profile`, `/BinaryTree`
    - APIs: `/api/registered-members`, `/api/admin/registered-members`, placement patch routes.
  - documented exact code touchpoints for follow-up implementation:
    - cover data flow in `index.html` and `admin.html`
    - popup render + placement logic in `binary-tree.mjs`
    - backend member route/store references for persistence gap tracking.
  - recorded recent bug recap for context:
    - cover looked missing because popup top strip was clipped when near-top nodes forced above placement.
- Outcome:
  - next implementation has a single actionable note with route map, file map, scope, acceptance criteria, and QA checklist.
- Files updated:
  - `Claude_Notes/binary-tree-popup-cover-next-implementation.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-business-center.md`
- Validation:
  - reviewed note content for route coverage + bug summary + implementation checklist completeness.

## Recent Update (2026-04-08) - Popup Cover Clipping Fix (Locally Reproduced)

- Completed:
  - reproduced the ????????????????cover removed??????????????? behavior on local branch with scripted Binary Tree popup interactions.
  - traced root cause to popup placement: top cover section was being clipped when popup tried to stay above near-top nodes.
  - updated popup placement logic in `binary-tree.mjs` to support below-node fallback when above placement cannot fit.
  - added bidirectional pointer rendering for selected-node popup so anchoring remains visually correct in both placements.
  - retained top-strip cover mask and loader readiness flow after placement fix.
- Outcome:
  - cover strip now remains visible in popup window during top-node selections, and cover images render in the visible card area instead of appearing removed.
- Files updated:
  - `binary-tree.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-business-center.md`
- Validation:
  - `node --check binary-tree.mjs` passed.
  - local branch screenshots confirm repro + fix:
    - `temporary screenshots/screenshot-188-cover-check-local-image.png`
    - `temporary screenshots/screenshot-192-cover-check-yellow-canvas.png`.

## Recent Update (2026-04-08) - Popup Cover Display Reliability (Node Panel)

- Completed:
  - hardened popup cover loader in `binary-tree.mjs` to wait for real texture readiness before switching to "image loaded" overlay styling.
  - added popup source fallback keys (`profileCoverUrl`, `coverDataUrl`, `coverUrl`) so mixed node payload formats still render cover images.
  - preserved procedural fallback visuals when texture load fails or times out, preventing blank/washed cover strip states.
- Outcome:
  - node popup cover no longer drops into a false loaded state where overlays change but the image is not actually rendered.
- Files updated:
  - `binary-tree.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-business-center.md`
- Validation:
  - `node --check binary-tree.mjs` passed.

## Recent Update (2026-04-08) - Cover-Only Revision (Container Style Preserved)

- Adjusted popup cleanup implementation to preserve previous container/body styling and touch only the cover strip behavior.
- Updated cover clip strategy in `binary-tree.mjs`:
  - replaced full-card cover clipping with dedicated cover-strip mask (rounded top corners only)
  - prevents cover bleed while keeping original popup container presentation.
- Kept decorative blocking overlay suppression for real cover images.
- Files updated:
  - `binary-tree.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-business-center.md`
- Validation:
  - `node --check binary-tree.mjs` passed.

## Recent Update (2026-04-08) - Popup Cover Cleaned To Match UI Feedback

- Cleaned selected-node popup cover presentation in `binary-tree.mjs` based on screenshot feedback:
  - removed blocking decorative cover overlays when a real cover image is present
  - clipped cover image layer to popup rounded frame to prevent cover bleed across card radius/border.
- Maintains subtle readability tint while allowing cover image to remain visible.
- Files updated:
  - `binary-tree.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-business-center.md`
- Validation:
  - `node --check binary-tree.mjs` passed.
  - visual verification screenshot: `temporary screenshots/screenshot-180-popup-cover-clean-check.png`.

## Recent Update (2026-04-08) - Binary Tree Popup Cover Renderer Fixed

- Investigated popup cover mismatch directly in binary-tree context and reproduced the renderer issue with known node cover URLs.
- Applied renderer-level fixes in `binary-tree.mjs`:
  - removed popup cover mask dependency that was blocking cover image visibility in current runtime
  - added robust image decode fallback path for `data:image/...` cover URLs before/after PIXI loader attempts.
- Result: node popup cover region now renders when valid cover source is present.
- Files updated:
  - `binary-tree.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-business-center.md`
- Validation:
  - `node --check binary-tree.mjs` passed.
  - verified with local popup cover harness screenshots (`screenshot-174`, `screenshot-178`, `screenshot-179`).

## Recent Update (2026-04-08) - Popup Cover Visibility Investigation + Fallback Hydration

- Investigated "changes not visible" report for node popup cover updates.
- Root cause findings:
  - popup cover image was layered under an almost-opaque procedural cover tint in `binary-tree.mjs`
  - non-root member nodes often do not receive cover fields from backend registered-member payloads.
  - profile cover updates from Profile page did not immediately rebuild binary-tree node payloads (stale in-session tree data).
- Implemented fix in `binary-tree.mjs`:
  - lowered cover tint opacity when custom image exists
  - increased custom cover sprite opacity for clear visibility.
- Implemented live-sync fix in `index.html`:
  - profile image upload/save flows now call `syncBinaryTreeFromRegisteredMembers()` so popup cover updates without reload.
- Added node-cover fallback hydration:
  - `index.html` and `admin.html` now resolve cover from local profile customization store (`charge-member-profile-customizations-v1`) when member payload is missing cover data.
- Files updated:
  - `binary-tree.mjs`
  - `index.html`
  - `admin.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-business-center.md`
- Validation:
  - `node --check binary-tree.mjs` passed.
  - screenshot script could not load `http://127.0.0.1:5500` in this environment (`ERR_EMPTY_RESPONSE`); active local server validation was done on `http://127.0.0.1:3000`.

## Recent Update (2026-04-08) - Node Cover Photos Now Sync From Profile Data

- Updated binary-tree popup cover behavior so node cards can display saved profile cover images.
- Applied to all eligible nodes with configured cover photos, not just the viewer/root profile node.
- Data flow updates were added in both user and admin tree builders:
  - member nodes now include `profileCoverUrl`
  - root node payload includes effective profile cover.
- Files updated:
  - `binary-tree.mjs`
  - `index.html`
  - `admin.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-business-center.md`
- Validation:
  - `node --check binary-tree.mjs` passed.

## Recent Update (2026-04-08) - More Space Above Metrics Container

- Increased the vertical gap between `BINARY TREE DATA` and the metrics panel border in `binary-tree.mjs`.
- Kept dynamic popup height enabled so this extra spacing does not squeeze lower metric rows.
- Files updated:
  - `binary-tree.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-business-center.md`
- Validation:
  - `node --check binary-tree.mjs` passed.
  - screenshot pass skipped in this quick spacing-only update.

## Recent Update (2026-04-08) - Popup Height Made Dynamic For Metrics Space

- Addressed concern about fixed panel constraints by moving selected-node popup height to a computed runtime value in `binary-tree.mjs`.
- Popup now expands to guarantee minimum metrics-panel capacity when header/section spacing pushes content downward.
- Updated pointer + viewport anchoring logic to respect dynamic popup height.
- Files updated:
  - `binary-tree.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-business-center.md`
- Validation:
  - `node --check binary-tree.mjs` passed.
  - screenshot pass deferred in this iteration.

## Recent Update (2026-04-08) - Popup Metrics Container Restored

- Fixed regression where `Cycles` and `Direct` appeared out of place after the large spacing pass.
- Updated metrics panel top/bottom geometry in `binary-tree.mjs` to restore container height and row alignment.
- Preserved requested hierarchy/spacing:
  - `BINARY TREE DATA` remains below the separator line
  - extra spacing from username/header area remains.
- Files updated:
  - `binary-tree.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-business-center.md`
- Validation:
  - `node --check binary-tree.mjs` passed.
  - screenshot pass skipped per user request.

## Recent Update (2026-04-08) - Popup Cramped Spacing Reduced (Username vs Data Section)

- Applied a small spacing refinement in `binary-tree.mjs` to reduce crowding between:
  - username row
  - `BINARY TREE DATA` heading.
- Implementation details:
  - username baseline shifted slightly upward
  - section label shifted slightly downward
  - no metrics panel resize changes (to avoid layout regressions).
- Visual verification completed:
  - `temporary screenshots/screenshot-164-popup-spacing-pass1.png`
  - `temporary screenshots/screenshot-165-popup-spacing-pass2.png`
- Files updated:
  - `binary-tree.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-business-center.md`
- Validation:
  - `node --check binary-tree.mjs` passed.

## Recent Update (2026-04-08) - Popup Header Layout Reverted To Left-Anchor Pattern

- Applied requested popup-header adjustment in `binary-tree.mjs`:
  - profile avatar is no longer centered
  - member name now renders under the profile icon
  - name remains left-anchored
  - username and badge icons remain inline/adjacent on the same row.
- Maintained compact badge row spacing and prior subtitle/date sync behavior.
- Visual verification completed:
  - `temporary screenshots/screenshot-162-popup-layout-revert-pass1.png`
  - `temporary screenshots/screenshot-163-popup-layout-revert-pass2.png`
- Files updated:
  - `binary-tree.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-business-center.md`
- Validation:
  - `node --check binary-tree.mjs` passed.

## Recent Update (2026-04-08) - Popup Identity Stack + Badge Subtitle Sync

- Implemented the requested node-popup panel refinements in `binary-tree.mjs`:
  - name + username now render directly under the profile photo
  - badge icons moved into a compact row under the username
  - icon spacing tightened (smaller icon size + reduced gap).
- Synced node-popup badge hover descriptions with date-aware profile metadata:
  - popup resolver now uses `profileBadgeRankSubtitle`, `profileBadgeTitleSubtitle`, `profileBadgeExtraSubtitle`
  - rank fallback now reads `Subscriber since <addedAt>` when explicit subtitle data is unavailable.
- Wired subtitle metadata through node payload creation:
  - member/root builders in `index.html` and `admin.html`
  - normalized fields in `binary-tree.mjs` node adapter.
- Visual verification completed with iterative screenshot passes:
  - `temporary screenshots/screenshot-157-popup-layout-pass3.png`
  - `temporary screenshots/screenshot-161-popup-hovercard-pass7.png`
- Files updated:
  - `binary-tree.mjs`
  - `index.html`
  - `admin.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-business-center.md`
- Validation:
  - `node --check binary-tree.mjs` passed.

## Recent Update (2026-04-08) - Popup Expanded For Spacious Readability

- Applied explicit spacing-first expansion in `binary-tree.mjs` for node popup readability.
- Increased popup frame and section dimensions:
  - width/height increased
  - cover and avatar enlarged
  - identity, badges, and metric text scaled up.
- Increased internal spacing for data comfort:
  - larger badge pills and row offsets
  - larger binary metrics panel padding
  - larger metric row/column rhythm.
- Visual check completed with updated screenshot:
  - `temporary screenshots/screenshot-136-popup-spacious-pass.png`
- Files updated:
  - `binary-tree.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-business-center.md`
- Validation:
  - `node --check binary-tree.mjs` passed.

## Recent Update (2026-04-08) - Popup Refactor For Node Detail Clarity

- Completed requested popup redesign pass in `binary-tree.mjs` focused on node-click details.
- Popup now presents requested hierarchy:
  - icon slot + cover
  - username/handle/rank
  - badge row (status, sponsor type, cycle eligibility, country when visible)
  - binary tree metric data grid.
- Added rank-to-brand-icon mapping for achievement icon assets in `brand_assets/Icons/Achievements`.
- Increased popup dimensions and rebalanced spacing to avoid overlap between identity and badge rows.
- Final visual verification included two iterative comparison rounds:
  - `screenshot-132-popup-before-scripted.png`
  - `screenshot-133-popup-after-pass1.png`
  - `screenshot-134-popup-after-pass2.png`
- Files updated:
  - `binary-tree.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-business-center.md`
- Validation:
  - `node --check binary-tree.mjs` passed.

## Recent Update (2026-04-08) - Popup Layout Tightened End-to-End

- Completed full popup layout cleanup in `binary-tree.mjs` to address "clean it up / tighten it up" feedback.
- Implemented a structured layout grid instead of ad-hoc spacing:
  - cleaner identity row alignment
  - cleaner 2-column metric section
  - reduced visual noise while increasing readability.
- Increased popup canvas and spacing without reintroducing container-heavy styling.
- Online/status icon remains removed.
- Files updated:
  - `binary-tree.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-business-center.md`
- Validation:
  - `node --check binary-tree.mjs` passed.

## Recent Update (2026-04-08) - Popup Layout Expanded (No Online Icon)

- Applied requested popup sizing adjustment in `binary-tree.mjs`:
  - increased popup width/height
  - increased cover and avatar sizing
  - increased spacing between identity, divider, and metric rows.
- Removed the online/status icon dot from the popup avatar block.
- Kept simplified/minimal popup structure from the previous cleanup pass.
- Files updated:
  - `binary-tree.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-business-center.md`
- Validation:
  - `node --check binary-tree.mjs` passed.

## Recent Update (2026-04-08) - Popup Simplified (Less Containers)

- Applied requested cleanup pass for node popup visuals in `binary-tree.mjs`.
- Removed high-density layout pieces introduced in prior pass:
  - removed bubble row
  - removed badge-strip container set
  - removed elevated stats panel shell and decorative effects.
- Current popup is intentionally minimal:
  - cover + avatar/status
  - name/handle/rank
  - compact 2x2 binary metrics
  - cycle eligibility line.
- Adjusted popup size constants to reduce visual bulk and improve readability.
- Files updated:
  - `binary-tree.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-business-center.md`
- Validation:
  - `node --check binary-tree.mjs` passed.

## Recent Update (2026-04-08) - Discord-Inspired Popup Styling Pass

- Redesigned selected-node popup visuals in `binary-tree.mjs` to follow the requested Discord-inspired direction while keeping project branding:
  - wider/taller profile-card shell
  - stylized cover/header composition
  - header bio bubble
  - larger avatar + status dot
  - badge strip for rank/country/source context
  - upgraded binary metrics panel (`BINARY SNAPSHOT`).
- Adjusted spacing and panel metrics to avoid popup overflow/clipping after the redesign.
- Existing behavior preserved:
  - popup remains anchored above selected node
  - camera pan/zoom/focus/minimap/resize syncing still active.
- Files updated:
  - `binary-tree.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-business-center.md`
- Validation:
  - `node --check binary-tree.mjs` passed.

## Recent Update (2026-04-08) - Node Popup Above Selected Binary Node

- Implemented selected-node popup UI in `binary-tree.mjs` to show:
  - profile cover + initials avatar
  - rank and status chips
  - binary data summary (`Left Team`, `Right Team`, `Cycles`, `Direct`) + cycle eligibility.
- Popup now remains anchored above the selected node during:
  - pan/zoom
  - animated node focus transitions
  - minimap viewport moves
  - renderer resize/fullscreen layout changes.
- Added popup lifecycle safeguards:
  - rebuild on selection/visual refresh
  - auto-destroy on clear/empty/destroy paths
  - theme-aware text restyling + popup refresh support.
- Files updated:
  - `binary-tree.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-business-center.md`
- Validation:
  - `node --check binary-tree.mjs` passed.

## Recent Update (2026-04-08) - Deep Anticipation Line-Length Normalization

- Addressed depth-6/7 anticipation inconsistency where some slot connectors appeared very long while others were short.
- Implemented selected-parent local anticipation placement:
  - left/right placeholders now anchor around selected parent with fixed offsets
  - avoids misleading far-horizontal displacement that looked like wrong branch position.
- Added local collision resolution strategy:
  - resolve by vertical stepping first
  - minimal horizontal side nudge only as fallback.
- Files updated:
  - `binary-tree.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-business-center.md`
- Validation:
  - `node --check binary-tree.mjs` passed.

## Recent Update (2026-04-08) - Selected Node Now Shows Any Open Slot

- Adjusted selected-node anticipation logic:
  - anticipated node(s) now render when selected node has any available child slot.
- Behavior:
  - one open side -> only that side shows
  - two open sides -> both show.
- This replaces previous leaf-only restriction while keeping click-selection trigger model.
- Files updated:
  - `binary-tree.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-business-center.md`
- Validation:
  - `node --check binary-tree.mjs` passed.

## Recent Update (2026-04-08) - Anticipation Slots Now On Selected Leaf Only

- Implemented requested interaction model:
  - clicking/selecting a node now controls anticipation visibility
  - anticipated slots only render when selected node has no children.
- Fullscreen selection flow now re-renders tree on select/clear:
  - slot visibility updates immediately with each node click
  - avoids stale anticipation layout from prior selection state.
- `collectEnrollAnticipationSlots(...)` now enforces selected-leaf-only criteria.
- Files updated:
  - `binary-tree.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-business-center.md`
- Validation:
  - `node --check binary-tree.mjs` passed.

## Recent Update (2026-04-08) - Zoom Cascade Chunk Rendering Enabled

- Implemented requested cascading behavior in fullscreen binary tree:
  - global baseline shows depth `<= 4`
  - deeper descendants appear when zooming into a viewport chunk.
- New cascade resolver now:
  - identifies focused depth-4 chunk roots in viewport area
  - expands only those subtrees to current zoom depth limit (`mid`/`near`).
- Added render safety and continuity:
  - selected node ancestry is retained in visible set
  - selecting a hidden node triggers re-render before focus.
- Render pipeline now uses visible-node subset for links, nodes, spillover, and anticipation parents.
- Files updated:
  - `binary-tree.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-business-center.md`
- Validation:
  - `node --check binary-tree.mjs` passed.

## Recent Update (2026-04-08) - Additional Whole-Tree Spacing For Placement Clarity

- Applied stronger spacing pass after continued overlap feedback (`LEFT LEFT` / `RIGHT RIGHT` crowding).
- Updated `binary-tree.mjs` fullscreen anticipation geometry:
  - larger global width boost for whole tree
  - larger depth-cap boost for effective horizontal distribution
  - middle corridor split now scales by depth.
- Updated anticipation collision thresholds:
  - higher base min-gap
  - steeper depth amplification
  - stronger side-offset enforcement from parent node anchor.
- Files updated:
  - `binary-tree.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-business-center.md`
- Validation:
  - `node --check binary-tree.mjs` passed.

## Recent Update (2026-04-08) - Increased Middle Spacing For Fullscreen Binary

- Added a dedicated center-lane spacing expansion in `binary-tree.mjs` for fullscreen anticipation rendering.
- New behavior widens the middle corridor:
  - left-side nodes shift further left
  - right-side nodes shift further right
  - root remains centered.
- Applied center-gap mapping to both base node geometry and anticipated-slot seed coordinates to keep alignment consistent.
- Files updated:
  - `binary-tree.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-business-center.md`
- Validation:
  - `node --check binary-tree.mjs` passed.

## Recent Update (2026-04-08) - Anticipation Nodes Always Active In Fullscreen

- Implemented requested approach: anticipation nodes are now always active/visible in fullscreen mode.
- Tree no longer depends on Enroll toggle state for anticipation visibility and spacing behavior.
- Binary tree render path now uses fullscreen-based anticipation guards:
  - anticipation slot collection runs whenever fullscreen is active
  - LOD-disable path follows fullscreen anticipation state directly.
- Enroll toggle control in fullscreen top row is now hidden via JS state sync, since anticipation is always on.
- Files updated:
  - `binary-tree.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-business-center.md`
- Validation:
  - `node --check binary-tree.mjs` passed.

## Recent Update (2026-04-08) - Enroll Mode Whole-Tree Shift Enabled

- Applied requested behavior so Enroll Member mode shifts the full binary layout wider, not only anticipation nodes.
- `binary-tree.mjs` render path now increases layout width while enroll mode is active:
  - slot-width boost
  - one-step width-depth-cap boost.
- Added stronger anticipated-node anti-overlap spacing:
  - larger base gap
  - depth-progressive gap growth
  - stronger side offset from parent to maintain left/right readability.
- Files updated:
  - `binary-tree.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-business-center.md`
- Validation:
  - `node --check binary-tree.mjs` passed.

## Recent Update (2026-04-08) - Enroll Mode T-Line Consistency + Anticipation Spacing Fix

- Investigated reported Enroll Member mode regressions:
  - anticipation connectors were still using curved legacy-style routing
  - anticipated nodes could overlap with nearby nodes in compact layout.
- Applied render fixes in `binary-tree.mjs`:
  - switched anticipation connector path generation to orthogonal elbow routing (T-line language)
  - added `resolveEnrollAnticipationPositions(...)` overlap pass for anticipated nodes by depth bucket
  - enforced side-aware spacing offsets and min-gap collision resolution against existing + anticipated nodes.
- Expected behavior now:
  - Enroll mode connector visuals stay consistent with T/inverted-T tree style
  - anticipated nodes no longer stack/collide in dense rows.
- Files updated:
  - `binary-tree.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-business-center.md`
- Validation:
  - `node --check binary-tree.mjs` passed.

## Recent Update (2026-04-08) - Enroll Mode No Longer Reverts To Legacy Layout

- Investigated and fixed Enroll Member mode layout shift in `binary-tree.mjs`.
- Issue source:
  - enroll render used legacy full-slot layout options, making the tree jump to old spacing when toggled on.
- Current behavior:
  - Enroll mode keeps the same compact tree geometry as normal mode.
  - Anticipated nodes render on top of that stable layout (no layout mode swap).
- Files updated:
  - `binary-tree.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-business-center.md`
- Validation:
  - `node --check binary-tree.mjs` passed.

## Recent Update (2026-04-08) - Enroll Button Label Correction

- Reverted fullscreen tree enroll toggle label from `Show Anticipated` back to `Enroll Member`.
- Restored control semantics for assistive labels/title to enroll-mode wording (`Enable/Disable enroll mode`).
- Anticipated node rendering behavior remains unchanged and still appears in enroll mode.
- Files updated:
  - `binary-tree.mjs`
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-business-center.md`
- Validation:
  - `node --check binary-tree.mjs` passed.

## Recent Update (2026-04-08) - Enroll Toggle Now Controls Anticipated Nodes + Visual Match

- Updated fullscreen tree top-row toggle semantics:
  - button copy now reads `Show Anticipated` / `Hide Anticipated`
  - aria/title copy now explicitly references anticipated-node visibility.
- Replaced anticipated slot cards with circle-based placeholders in `binary-tree.mjs`:
  - circular node shell
  - center `+` glyph
  - side badge text (`LEFT` / `RIGHT`) under node.
- Synced anticipation geometry to the new visuals:
  - bounds now account for circular node radius + side label clearance
  - dashed preview connector now lands at anticipated circle edge.
- Files updated:
  - `binary-tree.mjs`
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-business-center.md`
- Validation:
  - `node --check binary-tree.mjs` passed.

## Recent Update (2026-04-08) - Binary Tree Map-Style Semantic Zoom (LOD)

- Implemented a map-style tree browsing pass in `binary-tree.mjs`:
  - stable node coordinates retained
  - semantic zoom visibility levels:
    - far: depth `<= 3`
    - mid: depth `<= 5`
    - near: full depth.
- Added hysteresis thresholds to reduce LOD mode flicker:
  - far enter/exit: `0.48 / 0.58`
  - near enter/exit: `0.72 / 0.64`.
- Added `+N more` chips on visible frontier nodes to indicate collapsed descendants.
- Camera hooks now trigger LOD refresh on zoom/fit/reset/focus/restore.
- Visibility-aware rendering updates:
  - links/spillover lines only for visible nodes
  - fit bounds computed from visible set for better initial readability.
- Files updated:
  - `binary-tree.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-business-center.md`
- Validation:
  - `node --check binary-tree.mjs` passed.

## Recent Update (2026-04-08) - Binary Tree Width Compression Aligned To LOD

- Follow-up compression tuning applied in `binary-tree.mjs`:
  - layout width now respects active semantic-zoom depth cap (`widthDepthCap`)
  - render pipeline now resolves LOD first, then computes layout with bounded width depth
  - preserves binary direction while reducing wide spacing in far/mid views.
- Files updated:
  - `binary-tree.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-business-center.md`
- Validation:
  - `node --check binary-tree.mjs` passed.

## Recent Update (2026-04-08) - Binary Tree Layout Compaction (Usability)

- Addressed reported usability issue where a 50-node tree appeared excessively spread out horizontally.
- Updated `binary-tree.mjs` layout pipeline:
  - rolled back structural compaction variants due visual quality issues
  - default render now keeps original geometry and applies adaptive horizontal compression only
  - enroll anticipation mode keeps prior full-slot spacing to protect placeholder-slot accuracy.
- Expected outcome:
  - denser default tree view
  - less horizontal dead space
  - improved usability for moderate-size trees.
- Files updated:
  - `binary-tree.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-business-center.md`
- Validation:
  - `node --check binary-tree.mjs` passed.

## Recent Update (2026-04-08) - Zeroone Binary Tree Simulation Retuned (50 Total Nodes, Random Sponsors)

- Reintroduced simulation runner script at:
  - `backend/scripts/simulate-zeroone-live-test.mjs`
- Updated simulation logic to align with requested QA mode:
  - fixed interpretation from "50 direct sponsors" to "50 total generated nodes"
  - randomized sponsor routing so direct counts vary naturally
  - randomized direct left/right spread
  - excluded preferred customers from generated nodes.
- Added integrated reset path before each run:
  - clears prior `zeroone-sim-*` test users/members
  - clears target binary/sales snapshot rows for clean metrics.
- Added end-to-end report output (`backend/scripts/reports/...json`) including:
  - BV volumes and cycles
  - sales team commissions
  - rewards/rank progression
  - Infinity + Legacy tier-card snapshots.
- Latest run result:
  - Run ID: `zeroone:20260408012540525-tstltn`
  - Created nodes: `50`
  - Direct sponsors under `zeroone`: `3` (requested split left `1`, right `2`)
  - Binary: left BV `20,426`, right BV `45,334`, cycles `40`
  - Sales team net commission: `$2,500`
  - Report path:
    - `backend/scripts/reports/zeroone-live-test-zeroone-20260408012540525-tstltn.json`
- Files updated:
  - `backend/scripts/simulate-zeroone-live-test.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-business-center.md`

## Recent Update (2026-04-08) - Business Center Data Revert + Flush Settings Hardening

- Reverted test activation data for `zeroone` in production-like member records:
  - restored original primary member row
  - removed generated replacement primary row
  - restored rewired downline sponsor reference(s) from `zeroone-bc-1` to `zeroone`.
- Confirmed admin flush behavior still clears Business Center DB fields via full `registered_members` table truncate.
- Updated admin flush UX/cleanup in `admin.html`:
  - expanded member-side browser cache clearing list for newly used localStorage keys
  - updated flush confirmation text to include binary-tree/sales-team snapshots
  - extended success feedback with `binaryTreeSnapshots` and `salesTeamCommissions` cleared counts.
- Files updated:
  - `admin.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-business-center.md`
- Validation:
  - DB post-check confirms `zeroone` is primary again and downline sponsor linkage is restored
  - admin flush script now reports binary + sales-team snapshot clear totals.

## Recent Update (2026-04-08) - Business Center Feature Integrated Into Binary Tree

- Completed Business Center backend API surface for authenticated members:
  - `GET /api/member-auth/business-centers`
  - `POST /api/member-auth/business-centers/progress`
  - `POST /api/member-auth/business-centers/activate`
- Wired new Business Center route module into backend app startup.
- Extended member storage/service implementation for Business Center ownership, node metadata, and progress counters.
- Added dashboard activation UI in `index.html`:
  - status/cap/pending/overflow summary
  - side selector (left/right pin)
  - manual activate CTA + feedback state.
- Synced Legacy Leadership completed-tier totals into Business Center progress endpoint.
- Updated tree summary KPI behavior to exclude Business Center placeholders from:
  - member count
  - new members
  - direct sponsors.
- Kept placeholder nodes visible in tree structure but non-qualifying for tier/direct-member counting and personal BV rollups.
- Files updated:
  - `backend/app.js`
  - `backend/routes/member-business-center.routes.js`
  - `backend/controllers/member-business-center.controller.js`
  - `backend/services/member-business-center.service.js`
  - `backend/services/member.service.js`
  - `backend/stores/member.store.js`
  - `binary-tree.mjs`
  - `index.html`
  - `Claude_Notes/binary-tree-business-center.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check` passed for updated backend JS files
  - extracted inline script from `index.html` passed `node --check`
  - unauthenticated endpoint smoke test returns expected `401 AUTH_REQUIRED`.

## Recent Update (2026-04-07) - Login Button Loading Animation

- Added inline loading animation on `login.html` submit CTA.
- Login button now displays:
  - animated spinner icon
  - `Logging In...` label while auth request is pending.
- Busy-state handling now also sets `aria-busy` and wait cursor on the button.
- Files updated:
  - `login.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-login-page.md`
- Validation:
  - non-module inline script parse checks passed for edited HTML files.

## Recent Update (2026-04-07) - Unified Login for Member + Free Account

- Merged login audiences into one entry page:
  - both paid members and preferred/free customers now sign in at `login.html`.
- Updated role-based post-login routing:
  - paid/member accounts -> `/index.html`
  - free/preferred accounts -> `/store-dashboard.html` (store code preserved when available).
- Replaced split-login storefront references by moving shared free-login URL generation to `/login.html`.
- Kept `/store-login.html` as a compatibility redirect so old bookmarks and legacy links still work.
- Updated password-setup login return links to use unified `/login.html`.
- Files updated:
  - `login.html`
  - `storefront-shared.js`
  - `store-login.html`
  - `store-dashboard.html`
  - `store.html`
  - `store-product.html`
  - `store-support.html`
  - `store-checkout.html`
  - `store-register.html`
  - `store-password-setup.html`
  - `password-setup.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-login-page.md`
  - `Claude_Notes/preferred-customer-page.md`
- Validation:
  - `node --check storefront-shared.js` passed
  - non-module inline script parse checks passed for edited HTML files.

## Recent Update (2026-04-07) - Login Input Field Colors Corrected

- Refined login input field palette in `login.html` to match the current glassmorphism panel style.
- Input updates applied to both fields:
  - translucent glass background
  - softer frosted border color
  - theme-consistent placeholder tone
  - cohesive hover/focus tint changes.
- Files updated:
  - `login.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-login-page.md`
- Validation:
  - inline script syntax check passed
  - no screenshots taken in this pass (per instruction).

## Recent Update (2026-04-07) - Login Panel Recolored (Glass + No Purple, No Button Glow)

- Recolored login panel in `login.html` from purple accents to cyan/ice tones.
- Kept and refined glassmorphism style:
  - translucent dark glass surface
  - frosted highlight gradient
  - softer neutral depth shadowing.
- Removed login button glow effect by dropping custom glow shadows and keeping clean border/background hover states.
- Updated input borders/placeholders/focus accent colors to match new non-purple palette.
- Files updated:
  - `login.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-login-page.md`
- Validation:
  - inline script syntax check passed
  - no screenshots taken in this pass (per instruction).

## Recent Update (2026-04-07) - Background Resize Behavior Locked

- Updated `login.html` background renderer to avoid stretch/squeeze when resizing viewport.
- Strategy:
  - lock shader render space to fixed `1920x1080`
  - present canvas with `object-fit: cover` so viewport changes crop/scale framing instead of re-distorting shader space.
- Removed viewport-resize shader remap behavior from previous passes.
- Kept pointer interaction responsive by using current viewport dimensions only for cursor normalization.
- Files updated:
  - `login.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-login-page.md`
- Validation:
  - inline script syntax check passed
  - no screenshots taken in this pass (per instruction).

## Recent Update (2026-04-07) - Mobile Background Squeeze Fix v2 (Viewport-Fixed)

- Applied follow-up correction for mobile squeeze in `login.html`:
  - moved ColorBends background host to viewport-fixed positioning (`fixed inset-0`)
  - detached background sizing from page content height growth.
- Upgraded resize logic to viewport-aware handling:
  - `visualViewport` dimensions now drive shader canvas sizing
  - resize/orientation/viewport-scroll listeners keep canvas synchronized on mobile browser UI changes.
- Pointer coordinate normalization now uses the same viewport dimensions for interaction alignment.
- Files updated:
  - `login.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-login-page.md`
- Validation:
  - inline script syntax check passed
  - no screenshots taken in this pass (per instruction).

## Recent Update (2026-04-07) - Mobile Background Aspect Correction

- Fixed mobile portrait background squeeze in `login.html` ColorBends shader.
- Updated shader UV/aspect transform to use conditional cover-style scaling:
  - desktop/wide: x-axis scale
  - mobile/tall: y-axis inverse scale
- Result:
  - avoids compressed background look in mobile-sized viewports.
- Files updated:
  - `login.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-login-page.md`
- Validation:
  - inline script syntax check passed
  - no screenshots taken in this pass (per instruction).

## Recent Update (2026-04-07) - Rotating Heading No-Shift Refinement

- Shortened long rotating phrase in login heading to avoid wide-line stress:
  - now uses `Next Level Starts Now.`
- Locked heading row height in `login.html` (`#login-inspiration-heading`) so phrase swaps no longer alter panel height.
- Added no-wrap behavior for heading text in the panel context.
- Files updated:
  - `login.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-login-page.md`
- Validation:
  - inline script syntax check passed
  - no screenshots taken in this pass (per instruction).

## Recent Update (2026-04-07) - Login Panel Height Jump Removed For Error States

- Stabilized login panel height in `login.html` so showing error messages no longer expands/snaps the container.
- Implemented reserved error slot strategy:
  - fixed space wrapper (`min-h-[4.25rem]`)
  - opacity-based reveal/hide instead of display toggling.
- Updated error helpers (`showLoginError`, password setup error, free account redirect error) to use shared reveal classes.
- Files updated:
  - `login.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-login-page.md`
- Validation:
  - inline script syntax check passed
  - no screenshots taken in this pass (per instruction).

## Recent Update (2026-04-07) - Login Panel Content Updated Per UX Request

- Updated `login.html` login panel with requested copy/branding changes:
  - logo switched to `/brand_assets/Logos/L&D White Icon.png`
  - heading switched from static title to rotating inspirational phrases (4200ms interval)
  - heading font changes per phrase using Inter/Space Grotesk/Display classes
  - label text updated to `Username or Email`
  - CTA text updated to `Login` (busy state now `Logging In...`)
  - removed legacy auth-source info block.
- Auth functionality and form IDs remain intact; this is a UI/copy-only panel refresh.
- Files updated:
  - `login.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-login-page.md`
- Validation:
  - inline script syntax check passed
  - no screenshots taken for this pass (per user instruction).

## Recent Update (2026-04-07) - Login ColorBends Exact Settings Applied

- Set `login.html` ColorBends config to the exact values requested by user:
  - `rotation 0`, `speed 0.15`, `colors ["#ff0000","#00ff00","#0000ff"]`, `transparent true`, `autoRotate 0.3`, `scale 1.8`, `frequency 1`, `warpStrength 1`, `mouseInfluence 0.1`, `parallax 0.1`, `noise 0.05`.
- No auth-logic changes; this update is visual/background-parameter only.
- Files updated:
  - `login.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-login-page.md`
- Validation:
  - screenshots: `screenshot-125-login-exact-settings-pass1.png`, `screenshot-126-login-exact-settings-pass2.png`.

## Recent Update (2026-04-07) - Login Background Stack Simplified

- Cleaned up extra background layers in `login.html` that were causing a visible ????????????????second background behind??????????????? effect.
- Removed additional fallback gradient stack and extra radial overlay behind the Color Bends canvas.
- Retained only the single base black fallback plus live shader background render.
- Files updated:
  - `login.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-login-page.md`
- Validation:
  - screenshot: `temporary screenshots/screenshot-124-login-background-cleanup-pass1.png`.

## Recent Update (2026-04-07) - Login Color Match Pass + Global Hover Pointer Tracking

- Refined `login.html` Color Bends palette and fallback blend to better align with the black reference look (cyan/pink/green bend tones).
- Aligned config values to Usage-style tuning in-page (`colors`, `noise`, `mouseInfluence`) for easier direct edits.
- Fixed hover interaction reliability by binding pointer updates at window scope instead of the background element only.
- Kept background implementation JS/CSS-only and removed all video usage.
- Files updated:
  - `login.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-login-page.md`
- Validation:
  - screenshot comparison passes: `screenshot-120` through `screenshot-123`.

## Recent Update (2026-04-07) - Login Color Bends Switched to Pure JS/CSS (No Video)

- Removed video-backed Color Bends layer from `login.html` after review feedback.
- Background is now generated without media playback:
  - Three.js shader-driven Color Bends (custom JS)
  - CSS fallback bend gradients for non-WebGL/headless rendering consistency.
- Installed `three` package and moved runtime import to local module path to ensure shader actually boots in-page.
- Added `colorBendsConfig` in `login.html` so the page can be customized using the same fields as the provided Usage snippet.
- Kept black background visual direction and dark glass login card treatment.
- Preserved auth form behavior and IDs (UI-only/theme/background adjustments).
- Files updated:
  - `login.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-login-page.md`
- Validation:
  - inline script syntax check passed
  - screenshot passes completed (`screenshot-115`, `screenshot-116`).

## Recent Update (2026-04-07) - Member Login Screen Shifted to Light Glassmorph + Color Bends

- Updated `login.html` to a light-mode-first default (removed dark-mode default metadata and dark token usage).
- Implemented ReactBits-style `Color Bends` background treatment behind the login UI:
  - live shader layer (Three.js) inspired by Color Bends behavior
  - fallback video layer using official Color Bends media assets.
- Refined login panel to a glassmorphism surface:
  - translucent card shell, layered purple-tinted shadows, and backdrop blur
  - retained original form IDs and auth behavior to avoid regression in login flow.
- Files updated:
  - `login.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-login-page.md`
- Validation:
  - inline script syntax check passed
  - multi-pass screenshot checks completed (`pass1`, `pass2`, `pass3`).

## Recent Update (2026-04-07) - Home Skeleton Layout Synced to Current Dashboard

- Updated `#dashboard-initial-skeleton` in `index.html` to match the current Home dashboard structure and spacing.
- Replaced older condensed skeleton pattern with a full-layout loading shell:
  - KPI row placeholders (4 cards)
  - Weekly Total + Server Cut-Off top row placeholders
  - Infinity/Legacy left stack + Fast Track/Recent Activity right stack placeholders.
- Result:
  - reload skeleton now aligns with the actual Home page composition instead of appearing like a centered/older layout.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - inline script syntax check passed.

## Recent Update (2026-04-07) - Recent Activity Header Cleanup + Working View All Toggle

- Removed the extra helper subtitle line under `Recent Activity` in `index.html` for a cleaner header.
- Fixed `View All` behavior:
  - replaced dead anchor with an actual button (`#recent-activity-view-all-button`)
  - button now toggles feed display between capped (`12`) and full list
  - button auto-hides when the entry count does not exceed the capped limit.
- Added one-time control binding with `initializeRecentActivityPanelControls()` and connected it to existing Recent Activity render updates.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - inline script syntax check passed.

## Recent Update (2026-04-07) - Recent Activity Restyled + Synced to Legacy Panel Height

- Cleaned up `Recent Activity` presentation in `index.html` while preserving the same activity data list content.
- Redesign scope:
  - updated panel shell styling to current dashboard component language
  - compact header/title treatment
  - kept `#recent-activity-feed` list behavior and item output unchanged.
- Added height matching on desktop:
  - `#recent-activity-panel` now syncs to `#legacy-leadership-bonus-panel`
  - uses `ResizeObserver`, resize listeners, breakpoint listeners, and render-time sync requests.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - inline script syntax check passed.

## Recent Update (2026-04-07) - Fast Track Extra Wrapper Removed

- Removed the outer Fast Track panel wrapper in `index.html` to simplify nested containers.
- `#fast-track-bonus-card` is now the single visible Fast Track container.
- Kept layout behavior stable by repointing height-sync logic to `#fast-track-bonus-card`.
- Result:
  - no right-column layout conflict
  - cleaner Fast Track component structure.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - inline script syntax check passed.

## Recent Update (2026-04-07) - Fast Track Audit Now Bonus-Only

- Fixed Fast Track audit feed in `index.html` so regular enrollments without Fast Track bonus are no longer listed.
- Enrollment records are now shown only when actual Fast Track commission amount is greater than 0.
- Result:
  - audit list now represents true Fast Track bonus commission records only.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - inline script syntax check passed.

## Recent Update (2026-04-07) - Fast Track Audit Records Added + Height Synced to Infinity Builder

- Expanded `Fast Track Bonus` component in `index.html` with an embedded commission audit list.
- Audit feed now displays Fast Track commission records as an internal ledger:
  - enrollment credit records
  - Fast Track transfer/payout records.
- Added audit-specific UI bindings:
  - `#fast-track-commission-audit-count`
  - `#fast-track-commission-audit-empty`
  - `#fast-track-commission-audit-list`.
- Added deterministic desktop height matching:
  - Fast Track panel (`#fast-track-bonus-panel`) now syncs its height to Infinity Builder panel (`#infinity-builder-bonus-panel`)
  - uses `ResizeObserver`, breakpoint listeners, and resize listeners.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - inline script syntax check passed.

## Recent Update (2026-04-07) - Component Placement Reordered (Fast Track Right Column)

- Reordered Dashboard Row 2 layout in `index.html` to match latest composition request.
- Left lane (`lg:col-span-2`):
  - `Weekly Total Organization BV` at top
  - `Infinity Tier Commission` + `Legacy Leadership Bonus` directly below.
- Right lane (`lg:col-span-1`):
  - `Server Cut-Off` (top)
  - `Fast Track Bonus` (above Recent Activity)
  - `Recent Activity` (below Fast Track).
- Fast Track block was moved intact (same IDs, same actions) from under Account Overview to the right column stack.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - inline script syntax check passed.

## Recent Update (2026-04-07) - Server Cut-Off Style Matched to Weekly Total Panel

- Updated `Server Cut-Off` styling in `index.html` to align directly with the cleaner `Weekly Total Organization BV` component language.
- Visual refactor details:
  - removed nested boxed timer/stat containers
  - moved to a single panel surface with divider-based sections
  - aligned typography scale and caption treatment with Weekly Total panel
  - kept compact status badge and primary countdown emphasis.
- Data bindings preserved (`countdown`, `left/right leg BV`, `estimated cycles`, `cycle split rule`).
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - inline script syntax check passed.

## Recent Update (2026-04-07) - Server Cut-Off Hidden-Height Issue Resolved

- Fixed the Server Cut-Off panel mismatch caused by stretch behavior in Dashboard row layout.
- Implemented two-part correction in `index.html`:
  - layout fix:
    - changed Server Cut-Off grid item to `lg:self-start`
    - removed forced full-height behavior from the card
    - removed auto-push spacing that amplified hidden/empty vertical area
  - deterministic height match:
    - added desktop height sync from `#account-overview-card` (Weekly Total Organization BV component) to `#server-cutoff-card`
    - sync runs on init, metrics refresh, resize, breakpoint change, and `ResizeObserver` updates.
- Result:
  - Server Cut-Off now matches the actual Weekly Total component area height instead of inheriting oversized row stretch.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - inline script syntax check passed.

## Recent Update (2026-04-07) - Server Cut-Off Panel Matched + Timer Tightened

- Updated the Dashboard `Server Cut-Off` panel in `index.html` to better match the height/layout rhythm of the `Weekly Total Organization BV` primary board.
- Applied visual tightening:
  - elevated rounded shell with internal compact spacing
  - denser two-column BV stat cards
  - cleaner cycles row.
- Timer area cleanup:
  - removed `#cutoff-next-target` line
  - label now reads `Cut-Off Timer`
  - countdown output now shows time-only shorthand (`Xd Xh Xm` style), no ????????????????remaining??????????????? copy.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - inline script syntax check passed.

## Recent Update (2026-04-07) - Quick Actions Panel Removed; Server Cut-Off Promoted

- Removed the Dashboard `Quick Actions` panel component from `index.html`.
- Promoted `Server Cut-Off` card to occupy that top-right layout position directly.
- Layout effect:
  - right column now shows only `Server Cut-Off` in that slot
  - no stacked `Quick Actions + Server Cut-Off` block.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - inline script syntax check passed.

## Recent Update (2026-04-07) - Weekly Separator Lines Added to Account Overview BV Graph

- Updated the 30-day dual-series comparison graph in the main `Weekly Total Organization BV` panel.
- Added vertical weekly separation lines so each week boundary is easier to identify at a glance.
- Week boundary alignment:
  - separators render on Sunday start-of-week points
  - chosen to match existing dashboard logic where weekly cutoff is Saturday night.
- Implementation detail:
  - chart renderer now marks week-boundary columns and injects a subtle vertical divider line.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - inline script syntax check passed.

## Recent Update (2026-04-07) - Account Overview Main Panel Graph (Total vs Personal BV)

- Enhanced the left/main Account Overview panel (`Weekly Total Organization BV`) with a comparison graph.
- Added a 30-day dual-series mini chart using Personal Volume graph behavior patterns:
  - two bars per day:
    - darker tone = `Total BV`
    - lighter tone = `Personal BV`
  - hover/focus tooltip with:
    - date
    - total value
    - personal value
  - caption summary for 30-day change across both series.
- Added local trend persistence for Account Overview BV comparison:
  - storage key: `charge-account-overview-bv-trend-v1`
  - per-user trend partitioning
  - one entry per day bucket (latest timestamp wins).
- Data wiring:
  - graph updates from existing dashboard summary pipeline using:
    - `totalAccumulatedPv` (weekly total organization BV)
    - `organizationRollups.personalOrganizationBv` (weekly personal organization BV).
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - inline script syntax check passed.

## Recent Update (2026-04-07) - Account Overview Header Cleanup (Aligned with Quick Actions)

- Removed the top header row inside Dashboard `Account Overview` in `index.html` for a cleaner visual start.
- Removed these elements from the component:
  - `Account Overview` title text
  - `Your Organization Summary` subtitle
  - `Live Stats` badge
- Result:
  - Account Overview metric layout now starts immediately at the top
  - cleaner alignment/visual rhythm with neighboring `Quick Actions` panel.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - inline script syntax check passed.

## Recent Update (2026-04-07) - Account Overview Style Pivot (Asymmetric Command Board)

- Reworked `Account Overview` again in `index.html` after additional feedback.
- New style direction:
  - asymmetric command-board layout
  - large primary panel for `Weekly Total Organization BV`
  - compact secondary stats cluster for:
    - `New Members`
    - `Direct Sponsors`
    - `Cycles`
- This removes the prior ????????????????uniform rail??????????????? feel and creates a stronger visual hierarchy.
- Preserved all existing IDs and trend/value bindings.
- `Fast Track Bonus` stays as a separate container below.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - inline script syntax check passed.

## Recent Update (2026-04-07) - Account Overview Style Pivot (Unified Metric Rail)

- Reworked Dashboard `Account Overview` style again in `index.html` based on latest feedback.
- Replaced the prior ledger-row layout with a single unified metric rail:
  - one shared overview strip
  - 4 equal metric segments with divider lines
  - no nested mini-card look.
- Preserved existing metric bindings/IDs and content:
  - `Weekly Total Organization BV`
  - `New Members Joined`
  - `Total Direct Sponsors`
  - `Cycles`
- `Fast Track Bonus` remains a separate container below Account Overview.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - inline script syntax check passed.

## Recent Update (2026-04-07) - Account Overview Style Redesign (Non-Card Ledger)

- Follow-up redesign applied to Dashboard `Account Overview` in `index.html`:
  - replaced the 4-card stat grid style with a non-card ledger/list style.
  - stats now render as four structured rows inside one shared overview surface with divider lines.
- Preserved requested metric content and bindings:
  - `Weekly Total Organization BV`
  - `New Members Joined Your Network`
  - `Total Direct Sponsors`
  - `Cycles`
  - all existing metric IDs remain intact for runtime updates.
- Fast Track Bonus remains separated in its own container below the overview component.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - inline script syntax check passed after layout changes.

## Recent Update (2026-04-07) - Account Overview Restructure (Rank Removed + Cycles Added)

- Updated Dashboard `Account Overview` in `index.html` to match latest component scope:
  - removed the `Account Rank` card from the Account Overview surface
  - kept:
    - `Weekly Total Organization BV`
    - `New Members Joined Your Network`
    - `Total Direct Sponsors`
  - added one more stat card: `Cycles` (`#dashboard-total-cycles-value`).
- Separated `Fast Track Bonus` into its own container:
  - moved out of the Account Overview card
  - now rendered as a separate sibling container directly below Account Overview in the same left column.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - inline script syntax check passed after layout changes.

## Recent Update (2026-04-07) - E-Wallet KPI: Single CTA + 30-Day Balance Graph

- Updated the Home `E-Wallet Balance` KPI card in `index.html` per current dashboard request:
  - removed dual actions (`Send`, `Transfer`)
  - added one action only: `Go to E-Wallet`
  - action now routes directly to the `e-wallet` dashboard page.
- Added a 30-day E-Wallet balance mini-graph inside the KPI card:
  - bar strip mirrors Personal Volume interaction style
  - hover/focus tooltip shows `date + balance`
  - caption summarizes 30-day change/current balance state.
- Added local trend persistence for daily E-Wallet balance snapshots:
  - storage key: `charge-dashboard-ewallet-trend-v1`
  - trend is stored per member key and deduplicated by day bucket.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Known limitation:
  - Historical days populate as new server-confirmed wallet snapshots are observed; prior-day backfill is not reconstructed from transfer history in this pass.

## Recent Update (2026-04-07) - KPI Badge Shell Shadows Removed (Rank/Title Icons)

- Clarified and completed shadow removal for the `Account Active Until` KPI icon row in `index.html`.
- Removed badge shell shadows from:
  - `.dashboard-account-kpi-badge` (`box-shadow` removed)
- Combined with previous change, KPI icon row now has:
  - no shell `box-shadow`
  - no icon `drop-shadow` filter
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

## Recent Update (2026-04-07) - Account Active Until KPI Icon Shadow Removed

- Removed drop shadow from the new KPI icon row in `index.html`.
- Updated class:
  - `.dashboard-account-kpi-badge-icon` no longer uses `filter: drop-shadow(...)`.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

## Recent Update (2026-04-07) - Account Active Until KPI Filled with Profile Badge Icons

- Added a badge icon row to the bottom of the `Account Active Until` KPI card in `index.html`.
- New KPI icon strip now shows 3 slots:
  - Rank icon
  - Title 1 icon
  - Title 2 icon
- Implementation reuses existing profile badge resolution logic to keep icon sources synchronized with Profile page state.
- Added fallback placeholders for unavailable title badges so the card remains visually complete.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation status:
  - headless check confirms KPI strip renders 3 icons and sources map correctly.

## Recent Update (2026-04-07) - Account Status Tooltip Copy Paraphrased

- Updated `Account Active Until` tooltip text in `index.html` to the new paraphrased sentence.
- Synced the same copy across:
  - visible tooltip content
  - badge `aria-label` in markup
  - badge `aria-label` set in render logic
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

## Recent Update (2026-04-07) - Duplicate WebKit Tooltip Removed (Account Status Badge)

- Fixed double-tooltip issue on the `Account Active Until` badge in `index.html`.
- Cause:
  - native browser tooltip from `title` + custom tooltip were both rendering on hover.
- Fix:
  - removed `title` usage from badge
  - switched to `aria-label` (markup + render logic) for accessibility text
- Result:
  - only the custom tooltip now appears on hover/focus.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

## Recent Update (2026-04-07) - Account Status Tooltip Size Reduced (Compact)

- Adjusted the `Account Active Until` tooltip to a smaller tooltip-appropriate size in `index.html`.
- Updated typography classes:
  - from `text-sm font-medium leading-5`
  - to `text-xs leading-4`
- Kept white text color.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

## Recent Update (2026-04-07) - Account Status Tooltip Text Set to White + Medium

- Updated the `Account Active Until` tooltip typography in `index.html`:
  - changed text color to white
  - increased text size to medium (`text-sm`)
  - applied medium text weight (`font-medium`)
  - increased line-height for readability (`leading-5`)
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

## Recent Update (2026-04-07) - Account Status Tooltip Background Matched to Logo Popup

- Updated the `Account Active Until` KPI badge tooltip background to match the logo popup background exactly.
- Implemented class in `index.html`:
  - `.dashboard-account-status-tooltip { background: rgb(20 22 28 / 0.96); }`
- This now aligns with the `#sidebar-brand-menu` popup surface color for consistent dark overlay styling.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation status:
  - confirmed both tooltip and logo popup reference the same background value.

## Recent Update (2026-04-07) - Account Status KPI Copy + Tooltip Request Applied

- Updated Home `Account Status` KPI card in `index.html` per latest UX request:
  - caption changed to `Account Active Until`
  - heading timer now displays duration-only text (no explanatory words)
  - support note now reads: `Account must be active to enjoy earning commissions.`
- Added hover/focus tooltip on `Active/Inactive` badge with exact message:
  - `To remain active, you must purchase a product every month`
- Rendering behavior adjusted for timer presentation:
  - no activity window -> `--`
  - active window -> duration string only
  - expired window -> `0m`
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation status:
  - headless DOM checks confirmed updated caption/note/tooltip text and timer-only heading output.

## Recent Update (2026-04-07) - Sidebar Overlap Fix for User Pages + Reload Persistence

- Resolved sidebar overlap regression affecting user-side pages:
  - `My Store`
  - `Enroll Member`
  - `Preferred Customers`
- Root cause identified in `index.html`:
  - extra closing `</div>` after the `E-Wallet` modal block pushed several page sections outside the shared `main` wrapper (`lg:ml-64` offset no longer applied).
- Fix implemented:
  - removed stray closing container
  - restored all affected page views under the same main layout wrapper
- Sidebar reload persistence added:
  - extended `charge-dashboard-view-state` to include `sidebarCollapsed`
  - desktop sidebar open/closed (collapsed) state now restores after refresh
  - state updates when using collapse/open controls
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation status:
  - DOM checks confirm all page views are again inside `main` wrapper
  - reload checks confirm collapsed/open desktop sidebar state persists correctly
- Known limitation:
  - mobile sidebar overlay open state is unchanged and not persisted in this pass.

## Recent Update (2026-04-07) - KPI Follow-Up Tuning (Spacing + Position + Label)

- Applied follow-up KPI refinements in `index.html`:
  - KPI grid now uses `items-start` to remove stretched extra bottom space
  - `Sales Team Commissions` moved to 2nd KPI position
  - `Personal Volume` moved to 3rd KPI position
  - Sales Team transfer button restyled to match active sidebar/nav color treatment
  - KPI title changed from `Account Overview` to `Account Status`
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation status:
  - authenticated full screenshot + KPI crop screenshot captured
- Known limitation:
  - no dedicated light-mode visual check in this specific follow-up pass.

## Recent Update (2026-04-07) - KPI Prioritization Pass (E-Wallet + Account Overview)

- Executed requested KPI-first redesign refinements in `index.html`.
- KPI strip changes delivered:
  - `Total Balance` reframed to `E-Wallet Balance`
  - `Personal Volume` kept
  - `Cycles` KPI removed
  - `Sales Team Commissions` moved into former cycles slot
  - visible `Per cycle` + `Weekly cap` text row removed from Sales Team card
  - new `Account Overview` KPI added with:
    - activity status (Active/Inactive)
    - activity time window (remaining/expired)
    - current rank
- Logic/render updates:
  - added account-overview KPI DOM bindings and render helper
  - linked KPI refresh to existing account activity/rank render flow so it stays in sync as session/rank data changes
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation status:
  - authenticated screenshot pass + follow-up crop pass completed
- Known limitation:
  - dark-mode verified in this pass; light-mode KPI verification remains optional follow-up.

## Recent Update (2026-04-07) - Home KPI + Account Overview Redesign (Declutter Pass)

- Implemented a focused Home-page redesign in `index.html` for user-side dashboard readability, prioritizing KPI cards first, then Account Overview.
- KPI card area changes:
  - rebuilt top KPI surfaces for cleaner hierarchy and reduced visual noise
  - preserved all existing KPI value/action IDs for JS compatibility
  - adjusted responsive behavior so desktop defaults to 2 columns and only switches to 4 columns on very wide screens (`2xl`)
- Account Overview changes:
  - converted from multiple nested mini-cards into a calmer two-pane structure
  - retained rank/status/upgrade controls and all metric/trend IDs (`total BV`, `new members`, `direct sponsors`)
- Logic-sensitive sections intentionally left intact:
  - Fast Track Bonus
  - Infinity Tier Commission
  - Legacy Leadership Bonus
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation status:
  - authenticated screenshot pass 1 + pass 2 captured
  - crop verification captured for KPI/overview readability check
- Known limitation:
  - this pass does not yet include full right-column module redesign or dedicated light-mode visual QA sweep.

## Recent Update (2026-04-06) - Sidebar Light Mode Fix + Logo Clipping Fix

- Resolved reported issue where left sidebar stayed dark in light mode after previous shell pass.
- Implemented theme-aware sidebar background selectors in `index.html`:
  - dark/default/shopify keep dark sidebar styling
  - light/apple now use light surface-based sidebar styling
- Resolved clipped logo at top of sidebar:
  - increased logo shell dimensions
  - removed clipping (`overflow: visible`)
  - constrained logo with `max-height` + contain fit for stable rendering
  - switched light-mode logo source to cropped brand asset for cleaner small-size display
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation status:
  - light-mode screenshot captured and reviewed
  - sidebar now renders light, logo no longer clipped
- Known limitation:
  - additional micro-polish (spacing/typography parity) may still be needed for final visual perfection.

## Recent Update (2026-04-06) - 21st.dev Home-Inspired Dashboard Shell Pass

- Restyled dashboard shell in `index.html` to match the visual feel of `https://21st.dev/home`.
- Core updates delivered:
  - dark token system switched to near-black neutrals + subtle borders + muted cool-blue accents
  - sidebar navigation restructured with search row (`????????????? K`), section labels, tighter spacing, and neutral active-state treatment
  - dashboard nav label changed from `Dashboard` to `Home` (also reflected in page meta title)
  - top header density simplified and centered-title behavior tuned
  - top search hidden for cleaner 21st-style top-bar composition
  - dashboard cards/containers tuned to flatter, less-glow-heavy visual depth
  - mono-white logo variant used in dark mode for a cleaner left-rail look
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation status:
  - live reference screenshot captured from `https://21st.dev/home`
  - confirmed token/layout/sidebar changes in `index.html`
- Known limitation:
  - this pass matches style feel and hierarchy, not a strict one-to-one copy of every homepage content module.

## Recent Update (2026-04-06) - Light Mode Converted To Apple-Inspired Visual System

- Fully replaced light-mode color tokens in `index.html` to deliver an Apple-like look and feel.
- Light-mode direction now emphasizes:
  - cool neutral page/surface layers (`#F5F5F7` family)
  - white elevated cards
  - graphite text hierarchy
  - clean action blue accent ramp centered on `#0071E3`
- Token groups updated in the `html[data-theme='light']` block:
  - `--brand-50..950`
  - `--surface-*`
  - `--text-*`
  - `--semantic-*`
  - `--shadow-*`
  - overlay/minimap/selection/scrollbar/page-gradient light tokens
- Readability correction included:
  - `--text-inverse` reverted to white in light mode so blue CTA buttons keep high legibility.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation status:
  - confirmed full replacement of light token block
  - quick contrast checks run for primary text and button text combinations
- Known limitation:
  - this pass is token-driven; module-level visual fine-tuning can follow after focused light-mode walkthrough.

## Recent Update (2026-04-06) - Light Mode Palette Realignment (Brand-Consistent)

- Light-mode color system in `index.html` was reworked to match brand direction more closely.
- Primary shift completed:
  - replaced lavender-forward light palette with an emerald-led brand ramp
  - anchored palette to logo green (`#67B392`)
  - preserved logo purple (`#7853A2`) as an accent semantic/info tone
- Updated light-theme tokens include:
  - `--brand-50..950`
  - `--surface-*`
  - `--text-*`
  - `--semantic-*`
  - minimap/overlay/selection/scrollbar light tokens
- Readability adjustment:
  - set light-mode `--text-inverse` to dark ink for better contrast on lighter brand buttons.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation status:
  - confirmed full replacement of the `html[data-theme='light']` token block.
- Known limitation:
  - this pass updates global tokens only; component-level visual polish in light mode can be tuned in a follow-up review.

## Recent Update (2026-04-06) - Notification Center Mobile Sheet + Header Spacing Fix

- Addressed mobile usability issues in notification center and top-bar controls.
- Mobile-specific improvements:
  - notification center now opens as a fixed, viewport-safe sheet
  - panel/list max-height adapted for phone viewport
  - body scroll locks while sheet is open on mobile
  - reduced top-bar crowding with tighter spacing and smaller profile-button padding
  - top-right logout button hidden on mobile (`sm+` only) to reduce header compression
- Desktop notification behavior/layout preserved via `sm:` overrides.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation status:
  - inline scripts parse passed (`inline_scripts_checked=2`)

## Recent Update (2026-04-06) - Notification Center Opacity Removed For Clearer Visuals

- Updated notification center to use solid backgrounds (removed translucent panel/list accents in this module).
- Opaque refinements completed:
  - panel background made solid
  - segmented tab container made solid
  - list divider opacity removed
  - notification row/indicator read opacity fades removed
  - CTA button background made solid
  - row hover state changed to solid elevated background
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation status:
  - inline scripts parse passed (`inline_scripts_checked=2`)

## Recent Update (2026-04-06) - Notification Center UI Simplified (Apple-Inspired)

- Simplified the member header notification center visual structure in `index.html`.
- Replaced card-heavy list blocks with lighter divider-based rows and reduced surface nesting.
- Updated panel styling toward a cleaner frosted/segmented look with softer hierarchy and less visual clutter.
- Kept all behaviors unchanged:
  - notifications + announcements tabs
  - unread badges
  - mark read / mark all read
  - CTA routing
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation status:
  - inline scripts parse passed (`inline_scripts_checked=2`)

## Recent Update (2026-04-06) - Member Notification Center + Announcements (Member Auth)

- Implemented an authenticated member notification center with announcement support.
- Backend additions:
  - `GET /api/member-auth/notifications`
  - `POST /api/member-auth/notifications/:notificationId/read`
  - `POST /api/member-auth/notifications/mark-all-read`
  - server-side notification/announcement seed + member read-state persistence
- Frontend additions:
  - header notification center panel in `index.html`
  - Notifications/Announcements tab switching
  - unread count badges
  - mark-read and mark-all-read actions
  - CTA routing from notification items
- Files updated:
  - `index.html`
  - `backend/app.js`
  - `backend/routes/member-notification.routes.js`
  - `backend/controllers/member-notification.controller.js`
  - `backend/services/member-notification.service.js`
  - `backend/stores/member-notification.store.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation status:
  - backend syntax checks passed for all new notification modules + `backend/app.js`
  - local smoke checks passed:
    - `/api/health` returned `200`
    - new notification endpoints returned `401 AUTH_REQUIRED` without bearer token (expected auth gate behavior)
  - served `index.html` includes notification center IDs and announcement tab controls
- Current limitation:
  - no admin announcement management UI in this pass (seed-based feed only)

## Recent Update (2026-04-06) - Stripe Card Is Now Theme-Aware (Dark/Light)

- Updated dashboard `My Store` Stripe card styling to follow app theme mode.
- Dark mode now uses Stripe night appearance with light text/placeholder colors.
- Light mode now uses Stripe light appearance with dark text for readability.
- Added live theme-sync for Stripe Elements when user switches theme in app settings.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/public-store-page.md`
- Validation status:
  - frontend inline script parse passed (`All inline scripts parsed successfully.`)

## Recent Update (2026-04-06) - User My Store Checkout Now Supports Stripe (In-Dashboard)

- Implemented Stripe payment inside user dashboard `My Store` checkout flow.
- Checkout remains in-system (`index.html`) and no public-store checkout redirect is used.
- UI updates:
  - embedded Stripe card element field in checkout form
  - retained cardholder/email + billing/shipping data capture
  - checkout CTA updated to Stripe payment action label
- Behavior updates:
  - load Stripe config from `/api/store-checkout/config`
  - create payment intent from `/api/store-checkout/intent`
  - confirm card via `stripe.confirmCardPayment(...)`
  - after Stripe success, continue existing internal invoice/BV processing pipeline
- Backend support:
  - updated store-checkout discount resolver so `member-dashboard` sourced intents can honor member discount percent when buyer identity fields are present.
- Files updated:
  - `index.html`
  - `backend/services/store-checkout.service.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/public-store-page.md`
- Validation status:
  - frontend inline script parse passed (`All inline scripts parsed successfully.`)
  - backend syntax checks passed for updated Stripe checkout service/routes/controllers
  - API smoke checks for `/api/store-checkout/config` and `/api/store-checkout/intent` returned success payloads
- Notes:
  - backend process restart is required for live runtime to pick up the new discount resolver behavior if server was already running.

## Recent Update (2026-04-06) - User My Store Flow Correction (Internal Checkout Restored)

- Corrected member `My Store` behavior to keep checkout inside dashboard system flow.
- Restored internal checkout step and wiring:
  - checkout view section (`#store-flow-checkout-view`)
  - checkout form (`#store-checkout-form`)
  - order summary/cart IDs required by existing cart renderer
- Reverted user-facing actions from public-store redirects back to internal cart flow:
  - product card action: `Add To Cart`
  - product detail actions: `Add To Cart`, `Go To Checkout`
  - storefront action: `Go To Checkout`
- Removed temporary public-store redirect helper/action branches from member flow.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/public-store-page.md`
- Validation status:
  - `Inline scripts parse OK.`
- Notes:
  - this correction supersedes the prior dashboard pass that temporarily removed in-app checkout from member `My Store`.

## Recent Update (2026-04-06) - User My Store Redesign (Checkout Removed In Dashboard View)

- Completed a full member-side `My Store` storefront redesign in `index.html` with cleaner, browse-first UX.
- Removed checkout/cart UI from the user dashboard store page:
  - checkout form panel removed
  - order/cart summary board removed
  - checkout-target buttons removed from grid and product detail actions
- Added refreshed storefront composition:
  - `My Storefront` hero with share-link focus
  - modernized product cards (`Quick View` + `Open Store`)
  - simplified product detail pane with `Price`, `Stock`, `Member Savings`, and `Business Volume`
  - detail actions now: `Open Live Store` and `Copy Store Link`
- Updated storefront interaction logic:
  - store flow is now `grid` and `product` in member dashboard UI
  - no checkout step navigation exposed in this page
  - added `openLiveStorefront()` helper for opening generated public store link
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/public-store-page.md`
- Validation status:
  - inline script parse check passed (`All inline scripts parsed successfully.`)
  - render smoke screenshot captured (unauthenticated shell):
    - `temporary screenshots/screenshot-47-my-store-redesign-pass1.png`
- Notes:
  - checkout/invoice backend code paths were intentionally left intact for compatibility with other purchase flows; this pass removes checkout from the member dashboard `My Store` UI only.

## Recent Update (2026-04-06) - Admin My Store Mobile Product List Simplified

- Simplified Admin `My Store` mobile product rows to a normal compact list view.
- Removed mobile segmented metric-container blocks and replaced with:
  - compact header row (image + name + status)
  - single metadata line (`Price`, `Stock`, `BV`, `Updated`)
  - compact 2-button action row
- Desktop product table/grid layout preserved.
- Product list remains name-only (description preview still removed).
- Files updated:
  - `admin.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/public-store-page.md`
- Validation status:
  - `admin.html` inline script parse passed (`Inline scripts parse OK: 2`).

## Recent Update (2026-04-06) - Admin My Store Product List (Name-Only) + Mobile Row Optimization

- Admin `My Store` product list no longer shows description previews in table/list rows.
- Product identity block now emphasizes:
  - product image
  - product name
  - product ID
- Mobile row layout optimized for small screens:
  - improved thumbnail sizing/framing
  - labeled mobile metric blocks (`Price`, `Inventory`, `Updated`)
  - mobile status badge surfaced in product header area
  - action buttons switched to 2-column grid for touch-friendly controls
- Desktop table structure remains intact.
- Files updated:
  - `admin.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/public-store-page.md`
- Validation status:
  - `admin.html` inline script parse passed (`Inline scripts parse OK: 2`).
- Notes:
  - Puppeteer screenshot flow to `127.0.0.1:5500` still returned `ERR_CONNECTION_REFUSED` in this environment.

## Recent Update (2026-04-06) - Product Media Drag/Highlight Disabled

- Applied product-media interaction lock so storefront/admin product images are not draggable and do not support selection/highlight behavior.
- Added on product media elements:
  - `draggable="false"`
  - `select-none`
  - `style="-webkit-user-drag: none;"`
- Coverage includes:
  - public store grid (`store.html`)
  - public product page hero + thumbnails (`store-product.html`)
  - dashboard store grid + selected product image (`index.html`)
  - admin product preview + product list thumbnail (`admin.html`)
- Files updated:
  - `store.html`
  - `store-product.html`
  - `index.html`
  - `admin.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/public-store-page.md`

## Recent Update (2026-04-06) - Product Media Ratio Updated To 4:5

- Product image framing is now standardized to `4:5` across:
  - public store grid (`store.html`)
  - public product detail/gallery (`store-product.html`)
  - member dashboard store grid + selected product view (`index.html`)
  - admin product preview/list thumbnails (`admin.html`)
- Product fallback/default media was updated to `https://placehold.co/1000x1250?text=Product` in shared frontend and backend normalization paths.
- Admin product media recommendation now explicitly states:
  - `1600x2000 (4:5)`
- Files updated:
  - `store.html`
  - `store-product.html`
  - `index.html`
  - `admin.html`
  - `storefront-shared.js`
  - `backend/services/store-product.service.js`
  - `backend/stores/store-product.store.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/public-store-page.md`
- Validation status:
  - `node --check storefront-shared.js` passed
  - `node --check backend/services/store-product.service.js` passed
  - `node --check backend/stores/store-product.store.js` passed

## Recent Update (2026-04-06) - Preferred Customer Transfer Button Alignment Corrected

- Fixed Sponsor-transfer control alignment issue on Admin Preferred Customer detail page.
- Moved sponsor helper text (`Select a sponsor from the list below the field.`) below the control row so it no longer offsets action-button alignment.
- Adjusted row alignment so the `Transfer/Update` button aligns with the sponsor input field consistently.
- Files updated:
  - `admin.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/preferred-customer-page.md`
- Validation status:
  - `admin.html` inline script parse passed (`Inline scripts parse OK: 2`).

## Recent Update (2026-04-06) - Preferred Customer Button Sizes Unified

- Standardized button dimensions in Admin `Preferred Customers` flow for visual consistency.
- Applied uniform button scale to:
  - `Refresh`
  - `Back to List`
  - `Transfer` / `Update`
  - table row `Open`
- Updated label text in detail page actions to fit uniform dimensions without wrapping.
- Files updated:
  - `admin.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/preferred-customer-page.md`
- Validation status:
  - `admin.html` inline script parse passed (`Inline scripts parse OK: 2`).

## Recent Update (2026-04-06) - Preferred Customer Table View + Status Labels + Custom Sponsor Picker

- Converted Admin `Preferred Customers` list into a full table layout with operation-friendly columns:
  - preferred customer
  - sponsor
  - created
  - updated
  - status
  - action
- Added explicit status labels for transfer workflow visibility:
  - `Pending`
  - `Transferred`
  - `Updated`
- Replaced native browser sponsor `datalist` behavior with custom in-app suggestion dropdown:
  - type search by username/name/email
  - clickable result selection
  - no webkit-native dropdown dependency
- Detail-page transfer still uses:
  - `PATCH /api/admin/registered-members/:memberId/placement`
- Files updated:
  - `admin.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/preferred-customer-page.md`
- Validation status:
  - `admin.html` inline script parse passed (`Inline scripts parse OK: 2`).
- Notes:
  - screenshot automation to `127.0.0.1:5500` was not reachable from this runtime (`ERR_CONNECTION_REFUSED`).

## Recent Update (2026-04-06) - Preferred Customer Sponsor Dropdown + UI Cleanup

- Simplified Admin `Preferred Customers` layout to reduce container density on both:
  - list page
  - detail page (`/admin/PreferredCustomers/Detail`)
- Sponsor transfer control on detail page now supports type-to-select username selection using a dropdown suggestion list.
- Sponsor selection now validates against assignable member accounts before transfer submit.
- Transfer behavior remains sponsor-only (no placement controls added back).
- Assignment endpoint remains:
  - `PATCH /api/admin/registered-members/:memberId/placement`
- Files updated:
  - `admin.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/preferred-customer-page.md`
- Validation status:
  - `admin.html` inline script parse passed (`Inline scripts parse OK: 2`).

## Recent Update (2026-04-06) - Admin Preferred Customers Assignment Controls

- Admin `Preferred Customers` now uses a page-based detail flow.
- Clicking a preferred-customer row opens dedicated detail route:
  - `/admin/PreferredCustomers/Detail`
- Assignment controls are shown only in that detail page.
- Admin can now transfer preferred-customer records by entering sponsor username in the detail page.
- Assignment actions now call:
  - `PATCH /api/admin/registered-members/:memberId/placement`
- Placement controls were removed from this transfer flow; existing placement metadata stays unchanged unless edited elsewhere.
- Added backend safety guard so invalid sponsor usernames return an error instead of silently saving.
- Files updated:
  - `admin.html`
  - `backend/services/member.service.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/preferred-customer-page.md`
- Validation status:
  - `node --check backend/services/member.service.js` passed
  - `admin.html` inline script parse passed.

## Recent Update (2026-04-06) - User Store Shareable Link Visible in Storefront

- Member dashboard `My Store` now shows a visible `Shareable Store Link` block in the default storefront view.
- Users can copy their store URL directly from the storefront header area without needing the hidden setup tab/view.
- Hidden setup link controls were moved to setup-scoped IDs to avoid duplicate IDs, and runtime hydration/copy logic now supports both storefront and setup link nodes.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation status:
  - share-link DOM ID checks passed
  - `index.html` inline script parse passed (`Inline scripts parse OK: 2`).

## Recent Update (2026-04-06) - Store Product Parity Fix + My Store UI Cleanup

- Product catalog source is now unified to admin/server data only:
  - removed backend sample-product auto-seeding
  - removed admin and dashboard sample fallback loaders
- Legacy sample product IDs are now excluded from store product API responses so old demo products no longer appear on user-facing pages.
- Dashboard `My Store` page simplified:
  - removed `My Store Workspace` board/tabs
  - removed `Storefront Flow` visual step board
  - kept a cleaner product-first layout while preserving cart + checkout interaction logic.
- Files updated:
  - `backend/services/store-product.service.js`
  - `admin.html`
  - `index.html`
  - `Claude_Notes/public-store-page.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation status:
  - backend syntax checks passed
  - inline script parse checks passed (`index.html`, `admin.html`)
  - fresh-process runtime API checks (`PORT=3131`) confirm sample products are excluded
  - screenshot QA pass complete:
    - `temporary screenshots/screenshot-42-pass1-store-after-fix.png`
    - `temporary screenshots/screenshot-43-pass2-store-after-fix.png`

## Recent Update (2026-04-06) - MetaCharge Product Restored

- Restored `MetaCharge` into live catalog using admin product API persistence.
- Current store catalog now returns one active product:
  - `MetaCharge` (`metacharge`)
- Existing uploaded MetaCharge bottle images are attached as product media.
- Validation:
  - `/api/admin/store-products` -> `1` product (`MetaCharge`)
  - `/api/store-products` -> `1` product (`MetaCharge`)
  - storefront screenshot:
    - `temporary screenshots/screenshot-44-metacharge-restored.png`

## Recent Update (2026-04-06) - Removed Manual Store Attribution Override from User Checkout

- Removed `Store Attribution (Dev Testing)` UI block from `My Store` checkout on member dashboard.
- Removed `storeAttributionCode` form field parsing/validation and manual store-code override path.
- Checkout now always routes attribution via mapped user/upline store identity.
- This keeps BV attribution consistent upstream without user-side rerouting options.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `index.html` inline script parse passed.
  - code search confirms `storeAttributionCode` and dev attribution block are removed.

## Recent Update (2026-04-04) - Added `Verify Email` Button + Manual Link Row; Account Reset to Unverified

- Reset account verification state for active member account (`zeroone`) to unverified.
- Settings Account email row now includes:
  - `Verify Email` button (shown for unverified email states)
  - manual verification link section directly under email status text.
- Verification link behavior:
  - generated from `POST /api/member-auth/email-verification/request`
  - surfaced in UI under email field for manual click verification
  - hidden automatically when account is verified.
- Backend status API enhancement:
  - `GET /api/member-auth/email-verification-status` now returns `verificationLink` only when link token is currently active (not expired/used/revoked).
  - avoids stale link exposure from historical outbox rows.
- Files updated:
  - `backend/services/auth.service.js`
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation status:
  - backend syntax checks passed for auth/store/controller/routes touched in email-verification flow.
  - inline app script parse passed (`Inline scripts parse OK: 2`).
  - API checks confirm:
    - before request: unverified + no link
    - after request: unverified + active verification link available.

## Recent Update (2026-04-04) - Real Server-Side Email Verification Added

- Implemented real server-side email verification for Settings Account email status (not display-only).
- Added backend routes:
  - `GET /api/member-auth/email-verification-status` (auth required)
  - `POST /api/member-auth/email-verification/request` (auth required)
  - `GET /api/member-auth/verify-email?token=...` (token verify)
- Added schema/token storage support:
  - `member_users.email_verified`
  - `member_users.email_verified_at`
  - `member_email_verification_tokens` table with active/expiry indexes.
- Added token lifecycle rules:
  - hash token storage
  - revoke prior active tokens on re-request
  - 48-hour expiry
  - mark token used on successful verification.
- Settings page integration now:
  - requests verification on account save/email update
  - refreshes server-authenticated verification status text (`Verified by server` / `Not verified by server`).
- Files updated:
  - `backend/routes/auth.routes.js`
  - `backend/controllers/auth.controller.js`
  - `backend/services/auth.service.js`
  - `backend/stores/user.store.js`
  - `backend/stores/email-verification.store.js` (new)
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation status:
  - node syntax checks passed for all touched backend auth/store files.
  - inline app script parse passed (`Inline scripts parse OK: 2`).
  - end-to-end API flow passed on fresh run:
    - login -> request verification -> verify link token -> status `verified: true`.

## Recent Update (2026-04-04) - Title Hover Card Adds Acquisition Date Line

- Enhanced title hover-card subtitle content to include acquisition timing.
- Subtitle now renders as two lines for title badges:
  - `Exclusive {Event Name}`
  - `Acquired MM/DD/YYYY`
- Added acquisition timestamp propagation in claimed title entries:
  - reads `awardedAt` first, then falls back to claim/metadata date fields.
- Added graceful fallback:
  - when no date exists, subtitle shows `Acquired --`.
- Updated hover-card subtitle style to support visible line breaks (`white-space: pre-line`).
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation status:
  - inline app script parse passed (`node --check /tmp/index-inline-app.js`)
  - code checks confirm title entries now include `acquiredAt` and subtitle builder appends acquisition date line.

## Recent Update (2026-04-04) - Edit Profile Now Supports `Title 1` + `Title 2` Claimed Title Badges

- Replaced the placeholder extra icon path with a second claimed-title slot.
- Updated profile edit labels:
  - `Title 1`
  - `Title 2`
  - `Show Title 1 Icon`
  - `Show Title 2 Icon`
- Added secondary-title selection rules:
  - `Title 2` options are derived from claimed titles excluding selected `Title 1`.
  - both selected titles persist in profile customization state on save.
- Updated profile handle badge slot mapping:
  - title slot renders as `Title 1`
  - extra slot now renders as `Title 2`
- Added title inventory guards for toggles:
  - no claimed titles: `Show Title 1 Icon` disabled + unchecked
  - fewer than two claimed titles: `Show Title 2 Icon` disabled + unchecked
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation status:
  - inline app script parse passed (`node --check /tmp/index-inline-app.js`)
  - authenticated screenshots:
    - `temporary screenshots/screenshot-15-title1-title2-pass1.png`
    - `temporary screenshots/screenshot-16-title1-title2-pass2.png`
  - runtime checks confirmed:
    - empty-state pass: both title toggles disabled
    - two-title pass: both title toggles enabled and `Title 2` excludes selected `Title 1`

## Recent Update (2026-04-04) - Native WebKit Hover Tooltip Removed from Profile Badge Chips

- Removed browser-native tooltip trigger on profile handle badges by deleting the `title` attribute assignment in badge button creation.
- Kept custom hover card behavior and accessibility label (`aria-label`) intact.
- Outcome:
  - long-hover no longer surfaces WebKit default tooltip overlay on profile badge icons.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation status:
  - inline app script parse passed (`node --check /tmp/index-inline-app.js`)
  - authenticated DOM check confirms:
    - `.profile-handle-badge-button` has `title` attribute count of `0`

## Recent Update (2026-04-04) - Title Hover Subtitle Bound to Event (No Subscriber Since)

- Updated profile title hover card behavior:
  - removed `Subscriber since ...` from `Title` badge subtitle.
  - title subtitle now binds to title-event metadata and renders as `Exclusive {Event Name}`.
- Added title fallback binding for legacy event titles when metadata is missing:
  - `Legacy Founder`, `Legacy Director`, `Legacy Ambassador`, `Presidential Circle`
  - fallback output: `Exclusive Legacy Builder Leadership Program`.
- Kept rank badge subtitle behavior unchanged (`Subscriber since ...` remains on rank card only).
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation status:
  - inline app script parse passed (`node --check /tmp/index-inline-app.js`)
  - authenticated hover-card screenshots:
    - `temporary screenshots/screenshot-13-title-hover-event-bound-pass1.png`
    - `temporary screenshots/screenshot-14-title-hover-event-bound-pass2.png`
  - subtitle verification output:
    - `Exclusive Legacy Builder Leadership Program` in both metadata and fallback scenarios.

## Recent Update (2026-04-04) - Time-Limited Event Legacy Founder Backfill + Eligibility Context Fix

- Backfilled the authenticated Legacy account (`zeroone`) for:
  - Time-Limited Event claim: `time-limited-event-legacy-founder`
  - Linked account title award: `legacy-founder`
- Fixed achievement catalog eligibility context wiring in backend:
  - `buildAchievementCatalogForMember(...)` now passes full member progress context into `evaluateAchievementEligibility(...)` instead of a narrowed subset.
  - This preserves event-specific fields (for example: legacy package ownership and legacy builder depth counts) during list rendering.
- Result:
  - Legacy package accounts now correctly reflect `hasLegacyPackageOwnership` in the Time-Limited Event list payload.
  - Legacy Founder no longer appears incorrectly locked due to dropped context.
- Files updated:
  - `backend/services/member-achievement.service.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation status:
  - `node --check backend/services/member-achievement.service.js` passed.
  - DB verification confirms backfill rows exist:
    - `charge.member_achievement_claims` includes `time-limited-event-legacy-founder` for `zeroone`.
    - `charge.member_title_awards` includes `legacy-founder` for `zeroone`.
  - Service verification confirms Time-Limited event payload now reports `hasLegacyPackageOwnership: true` for Legacy account context.

## Recent Update (2026-04-03) - Title Select Arrow Position + No-Title Badge Toggle Disable

- Refined `Title` dropdown caret alignment in `Edit Profile`:
  - replaced default browser caret with custom chevron icon
  - applied `appearance-none` + right-side caret spacing for consistent placement.
- Added claimed-title gating for badge controls:
  - `Show Title Icon` is now disabled/unchecked when no claimed titles exist
  - `Show Extra Icon` is now disabled/unchecked when no claimed titles exist (placeholder flow)
- Added matching render guard:
  - `Title` and `Extra` profile-handle badges no longer render when title inventory is empty.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation status:
  - inline app script parse passed (`node --check /tmp/index-inline-app.js`)
  - authenticated screenshots:
    - `temporary screenshots/screenshot-11-profile-edit-arrow-badge-pass1.png`
    - `temporary screenshots/screenshot-12-profile-edit-arrow-badge-pass2.png`
  - runtime checks confirmed:
    - custom arrow exists with ~`12px` right inset
    - title/extra toggles disabled + unchecked when no claimed titles

## Recent Update (2026-04-03) - Profile Edit Title Dropdown + Badge Label/Order Alignment

- Changed `Edit Profile` field label:
  - `Account Title` -> `Title`
- Converted title field from free-text input to claimed-title dropdown (`select`).
- Added title preview row (icon + label) so selected title and icon stay synchronized.
- Renamed badge section legend:
  - `Username Badges` -> `Badge`
- Reordered profile edit form:
  - `Title` now appears directly above `Badge`.
- Updated profile title badge icon resolution:
  - title badge now resolves title-specific icon mapping/claimed-title icon instead of rank icon reuse.
- Added payload wiring for `claimableTitles` to strengthen icon matching.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation status:
  - inline app script parse passed (`node --check /tmp/index-inline-app.js`)
  - screenshot passes on required URL:
    - `temporary screenshots/screenshot-7-profile-edit-pass1.png`
    - `temporary screenshots/screenshot-8-profile-edit-pass2.png`
  - authenticated modal QA screenshots:
    - `temporary screenshots/screenshot-9-profile-edit-auth-check.png`
    - `temporary screenshots/screenshot-10-profile-edit-auth-check-pass2.png`
  - runtime DOM assertions confirmed:
    - title field renders as `SELECT`
    - label text is `Title`
    - legend text is `Badge`
    - title block position is above badge block
- Known constraints:
  - `127.0.0.1:5500` login API path returned `501`, so authenticated QA ran on `127.0.0.1:3000`.
  - active test member has no claimed titles, so dropdown showed empty-state placeholder in this run.

## Recent Update (2026-04-03) - Limited-Time Title Icons Moved to Dedicated `Title-Icons` Folder

- Added new limited-time title reward icon set (gold star style, dark/light variants):
  - `Legacy Founder`
  - `Legacy Director`
  - `Legacy Ambassador`
  - `Presidential Circle`
- Created and adopted new folder:
  - `brand_assets/Icons/Title-Icons/`
- Updated backend title catalog + achievement icon paths to point to `Title-Icons`.
- Updated frontend icon map and fallback snapshot to use the new `Title-Icons` paths.
- Added folder-level README:
  - `brand_assets/Icons/Title-Icons/README.md`
- Files updated:
  - `backend/services/member-achievement.service.js`
  - `index.html`
  - `brand_assets/Icons/Title-Icons/README.md`
  - `brand_assets/Icons/Achievements/README.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation status:
  - `node --check backend/services/member-achievement.service.js` passed
  - inline script parse passed for `index.html` (`Inline scripts parse OK: 2`)

## Recent Update (2026-04-03) - Limited-Time Event Achievement Icons No Longer Falling Back to Diamond

- Root cause fixed: frontend icon path validator accepted only `brand_assets/Icons/Achievements/*.svg`, causing new title icon paths in `brand_assets/Icons/Title-Icons/*.svg` to be rejected and replaced by diamond fallback.
- Updated icon validator to accept both folders:
  - `Icons/Achievements`
  - `Icons/Title-Icons`
- Limited-time event rows now resolve to the configured title star icons.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation status:
  - inline script parse passed for `index.html` (`Inline scripts parse OK: 2`)

## Recent Update (2026-04-03) - Global Claimable Title Catalog Added

- Added server-wide claimable title storage for achievement rewards.
- New table/store:
  - `charge.member_title_catalog`
  - file: `backend/stores/member-title-catalog.store.js`
- Achievement service now seeds and reads the global catalog, and validates title reward claims against active catalog entries.
- Catalog is now separate from per-user awards:
  - `member_title_catalog` = global claimable definitions
  - `member_title_awards` = user-level claimed titles
- Seeded active title:
  - `presidential-ambassador` (`Presidential Ambassador`)
- Files updated:
  - `backend/stores/member-title-catalog.store.js`
  - `backend/services/member-achievement.service.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation status:
  - `node --check backend/services/member-achievement.service.js` passed
  - `node --check backend/stores/member-title-catalog.store.js` passed
  - DB check confirms `charge.member_title_catalog` exists and seeded row is present

## Recent Update (2026-04-03) - Time-Limited Event Text Cleanup

- Removed event-card lines from Profile Achievements UI:
  - `Prerequisites: Legacy Builder Leadership Program`
  - `Account-bound title reward`
- Backend logic for event windows and claim eligibility is unchanged.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation status:
  - inline script parse passed for `index.html` (`Parsed 2 inline scripts successfully.`)

## Recent Update (2026-04-03) - Achievement Center Time-Limited Event + Account-Bound Title Storage

- Added new top-tab order in Profile Achievement Center:
  - `Time-Limited Event`
  - `Premiere Life`
- Added `Legacy Builder Leadership Program` category under `Time-Limited Event`.
- Added event achievement:
  - `1st Matrix Completion`
  - requirement: `Enroll 3 Legacy Package`
  - reward: `Title: Presidential Ambassador`
- Implemented server-side account title persistence for event rewards:
  - new DB-backed `member_title_awards` store/table
  - deduplicated by account + title slug
  - linked to source achievement claim metadata
- Added achievement payload support for server-awarded titles (`accountTitles`) and profile title fallback usage from awarded title records.
- Files updated:
  - `index.html`
  - `backend/services/member-achievement.service.js`
  - `backend/stores/member-title-award.store.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation status:
  - `node --check backend/services/member-achievement.service.js` passed
  - `node --check backend/stores/member-title-award.store.js` passed
  - inline script parse passed for `index.html` (`Parsed 2 inline scripts successfully.`)

## Recent Update (2026-04-03) - Hovered Username Badge Size Increased

- Increased badge chip size effect on hover/focus for stronger interaction feedback.
- Hover transform updated from `1.08` to `1.14`.
- Added hover/focus scaling for inner badge icon.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation screenshot:
  - `temporary screenshots/screenshot-6-profile-badge-hover-size-up.png`

## Recent Update (2026-04-03) - Circle Badge Icon Size Increased

- Increased profile username badge icon size inside circular chips for clearer visual weight.
- Updated icon dimension from `1.15rem` to `1.3rem`.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation screenshot:
  - `temporary screenshots/screenshot-5-profile-badge-icon-bigger.png`

## Recent Update (2026-04-03) - Badge Hover Card Rolled Back to Original V1 Styling

- Reverted profile username badge hover card back to the first approved visual version.
- Removed the added orange/green top-left circles from hover card UI.
- Restored the earlier compact hover card dimensions/spacing while retaining circular badge chips.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation screenshot:
  - `temporary screenshots/screenshot-4-profile-badge-hover-v1-restored.png`

## Recent Update (2026-04-03) - Profile Header Badge Icons + Discord-Style Hover + Edit Controls

- Profile header `@username` now supports ordered badge icons:
  - `Rank`
  - `Title`
  - `Extra`
- Added Discord-inspired badge hover card behavior:
  - large floating dark card
  - icon-focused hero area
  - title/subtitle text treatment
  - hover/focus-triggered reveal with pointer notch
- Added editable profile controls for badge system:
  - `Account Title` input
  - show/hide toggles for rank/title/extra badges
- Badge rendering is now re-synced when:
  - profile state changes
  - Good Life/achievement payloads refresh
  - theme changes
  - account rank snapshot updates
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation status:
  - inline script parse check passed for `index.html`
  - visual pass done in 2 rounds:
    - `temporary screenshots/screenshot-1-profile-badge-round1.png`
    - `temporary screenshots/screenshot-2-profile-badge-round2.png`

## Recent Update (2026-04-03) - Good Life Bound to Rank Advancement Monthly Run (Not Persistent Account Rank)

- Implemented monthly rank-run high watermark tracking for Rank Advancement in backend:
  - added DB-backed monthly progress table for rank run (`user_id + period_key`)
  - records highest rank milestone reached in the month and carries it forward until month reset
- Updated Rank Advancement evaluation behavior:
  - rank reward eligibility can now remain unlocked for the month if the member already hit the milestone earlier in the same month
  - monthly reset behavior remains period-key based (`YYYY-MM`)
- Updated Good Life monthly progression source:
  - Good Life no longer derives from persistent `accountRank`/title
  - Good Life now derives from Rank Advancement monthly run high watermark
- Account rank/title persistence behavior remains unchanged:
  - account rank can stay on the account record independent of monthly bonus loops
- Files updated:
  - `backend/services/member-achievement.service.js`
  - `backend/services/member-good-life.service.js`
  - `backend/stores/member-rank-advancement.store.js`

## Recent Update (2026-04-03) - Direct Sponsor Requirement Interpretation Applied

- Requirement numbers are now interpreted as **left/right pair counts**:
  - `1:1`, `2:2`, `3:3` ... through the rank tiers.
- `Direct Sponsor` is now enforced as **personally enrolled users** (users sponsored directly by the current account).
- Rank achievement validation now requires matched left/right direct sponsor counts plus existing cycle/activity/verification checks.
- Profile Achievement UI now shows:
  - direct sponsor pair progress (`Left X / Y | Right X / Y`)
  - header summary with direct pair snapshot (`Direct L:x R:y`)
- Files updated:
  - `backend/services/member-achievement.service.js`
  - `index.html`

## Recent Update (2026-04-03) - Rank Advancement Rules Wired into Profile Achievement Component

- Implemented rank advancement milestones from `brand_assets/MLM Business Logic.md` section `# 5????????????????????????? Rank Advancement Bonus`.
- Added profile achievement entries for Ruby through Royal Crown with cycle thresholds and payout values.
- Added server-side prerequisite checks for rank advancement claims:
  - cycle requirement
  - active-account requirement
  - system verification status
- Profile achievement UI now surfaces:
  - requirement summary
  - prerequisite summary
  - cycle progress
  - lock reason
  - monthly payout note after verification
- Updated profile status strip to show:
  - current rank
  - current cycles
  - current activity state
- Files updated:
  - `backend/services/member-achievement.service.js`
  - `index.html`
- Current status:
  - Rank tab is now functional and no longer placeholder-only.
  - Good Life and Rank Advancement tracks now coexist under the same profile achievement center.

## Recent Update (2026-04-03) - Draft Achievement Icon Pack Generated

- Created an initial SVG icon pack for profile Good Life achievements so icon placement can start immediately.
- Generated assets:
  - `diamond.svg`
  - `blue-diamond.svg`
  - `black-diamond.svg`
  - `crown.svg`
  - `double-crown.svg`
  - `royal-crown.svg`
- Location:
  - `brand_assets/Icons/Achievements/`
- Added asset note:
  - `brand_assets/Icons/Achievements/README.md`
- Status:
  - Icon assets are ready for UI hookup in achievement list rows.

## Recent Update (2026-04-03) - Profile Achievements Moved Server-Side (Authenticated Claims)

- Added a new profile achievement system in member app profile page:
  - top tabs: `Premiere Life`, `Rank`
  - left category rail
  - right achievement list with claim action state
  - claimed achievements display claim date
- Implemented `Good Life` category under `Premiere Life` using `MLM Business Logic.md` Good Life bonus values:
  - Diamond (`$500`)
  - Blue Diamond (`$1,000`)
  - Black Diamond (`$2,000`)
  - Crown (`$4,000`)
  - Double Crown (`$8,000`)
  - Royal Crown (`$12,500`)
- Added backend authenticated achievement APIs (no client-only claim persistence):
  - `GET /api/member-auth/achievements`
  - `POST /api/member-auth/achievements/:achievementId/claim`
- Added server-side auth session issuance on login:
  - login now returns `authToken` + `authTokenExpiresAt`
  - new protected endpoints require `Authorization: Bearer <token>`
- Added new PostgreSQL-backed schema installers/stores for:
  - `charge.member_auth_sessions`
  - `charge.member_achievement_claims`
- Added runtime DB install fallback:
  - if admin DB credentials fail, table install retries with service-role connection.
- Updated member login session persistence in:
  - `login.html`
  - `store-login.html`
  so auth token is retained client-side for authenticated API calls.

## Recent Update (2026-04-03) - Achievement Category Label Simplification

- Profile achievement left category item was refined to remove subtitle/caption text.
- Category now displays only the category label (`Good Life`) as requested.
- File updated:
  - `index.html`

## Recent Update (2026-04-03) - Good Life List Template Alignment

- Refined Good Life achievement rows to follow template copy/structure:
  - `Diamond`
  - `Reach Diamond Rank`
  - reward format `= $500` with claim/locked button on the right
- Applied same naming format to all Good Life items (`Blue Diamond`, `Black Diamond`, `Crown`, `Double Crown`, `Royal Crown`).
- Added frontend fallback Good Life item list so entries are visible in category view even before authenticated API hydration finishes.
- Files updated:
  - `index.html`
  - `backend/services/member-achievement.service.js`

## Recent Update (2026-04-03) - Good Life Row Copy Tightening

- Removed redundant locked-state helper subtext from Good Life rows (e.g., `Reach Royal Crown to claim this reward.`).
- Kept claim-date text only for already-claimed achievements.
- Removed leading `=` character from right-side reward amounts.
- File updated:
  - `index.html`

## Recent Update (2026-03-27) - Header Checkout Button Switched to Icon

- Header `Cart / Checkout` action was converted from text CTA to icon-based cart button.
- Cart count remains visible as a badge on the icon, preserving live count behavior.
- Applied to:
  - `store.html`
  - `store-product.html`
  - `store-support.html`

## Recent Update (2026-03-27) - Store Header Logo Switched to PNG

- Storefront header logo source was switched from the cropped SVG file to cropped PNG file.
- Current store header logo source:
  - `/brand_assets/Logos/L&D Logo_Cropped.png`

## Recent Update (2026-03-27) - Store Header Logo Swapped to L&D Cropped Asset

- Store header logo asset was switched to the requested logo file:
  - `brand_assets/Logos/L&D Logo_Cropped.svg`
- Applied across all storefront pages for consistent brand rendering.

## Recent Update (2026-03-27) - Store Headers Switched to Logo-Only Branding

- Store header branding now uses the provided Premiere Life logo as the sole brand mark (no extra brand text block).
- This matches the requested member-side branding style where logo is the full identity signal.
- Applied across all store-facing pages (store, product, support, checkout, login, password setup, dashboard, register).

## Recent Update (2026-03-27) - Provided Logo Applied in Store Headers

- Replaced the header `PL` badge mark with the provided Premiere Life logo asset on store pages.
- Asset used:
  - `brand_assets/Logos/Premiere Life Logo_Transparent.svg`
- Applied consistently to:
  - `store.html`
  - `store-product.html`
  - `store-support.html`
  - `store-checkout.html`
  - `store-login.html`
  - `store-password-setup.html`
  - `store-dashboard.html`
  - `store-register.html`

## Recent Update (2026-03-27) - Brand Naming Correction Applied

- Visible `Charge` brand text was corrected to `Premiere Life` in storefront and remaining audited app UI spots.
- Store pages now use `Premiere Life Store` titles and `Premiere Life` header branding with `PL` badge initials.
- Additional corrected labels:
  - `admin.html` brand wordmark
  - `index.html` wallet workspace label
- Internal storage keys using `charge-` prefix were intentionally left unchanged for compatibility and to avoid local-storage/session migration risk.

## Recent Update (2026-03-27) - Dedicated Registration Page Introduced

- `Register now` now routes to a dedicated registration page (`store-register.html`) instead of relying on immediate checkout modal entry.
- New route alias is active:
  - `/store/register`
- Registration page captures free-account details and hands them off to checkout via draft storage + route flags.
- Checkout now consumes registration draft data when present and allows direct `Register and Pay` flow without forcing modal re-entry.
- Registration modal remains available as fallback when required free-account data is missing.
- Store attribution continuity remains intact via register-link URL building and draft-based recovery when needed.

## Recent Update (2026-03-27) - Onboarding Note Removed from Registration UI

- Removed optional onboarding-note input from registration user experience.
- Applied to both dedicated register page and checkout fallback registration modal.
- Registration payload compatibility remains intact with empty-note handling.

## Recent Update (2026-03-27) - Login Modal: Register CTA Reusing Checkout Free-Account Flow

- Storefront login modals now include:
  - `Don't have an account? Register now to get 15% discount on your checkout.`
- `Register now` routes users to checkout using the existing free-account flow (reused, not duplicated), with URL state:
  - `mode=free-account`
  - `register=1`
- Checkout now honors that route state:
  - preselects free-account checkout mode
  - opens existing free-account registration modal when cart has items
  - if cart is empty, provides guidance to add products first and continue with `Register and Pay`
- Attribution behavior remains aligned:
  - no-attribution entry works without forcing store code
  - when browsing already has referral/store attribution, the same checkout registration path keeps that attribution in place

## Recent Update (2026-03-27) - Registration CTA UX Follow-Up

- `Register now` path now opens the free-account registration modal directly (modal-first behavior) on checkout entry.
- In this entry path, modal primary action label is now `Register`.
- Cart-aware completion logic:
  - with cart items: continues to payment flow
  - without cart items: saves registration details and prompts user to add products before final checkout

## Recent Update (2026-03-27) - Storefront Header UX: Single Login + Account-Type Modal

- Storefront header auth UX now uses one `Login` button instead of separate `Member Login` and `Free Member Login` buttons.
- Clicking `Login` opens an account-type modal with two clear paths:
  - `Member Login`
  - `Preferred Account Login`
- Session-aware destination behavior is preserved:
  - member sessions surface `Member Dashboard` in modal option routing.
  - free-account sessions surface `My Dashboard` on preferred option routing.
- Cart/checkout action was moved into the header action area (adjacent to Login) for faster and more intuitive checkout access.
- Applied on public storefront pages:
  - `store.html`
  - `store-product.html`
  - `store-support.html`
  - `store-checkout.html`

## Recent Update (2026-03-27) - Checkout No-Referral Flow + Guest/Free Dynamic Pricing

- Checkout now supports direct traffic without `?store=...` referral links.
- `Member Store Code` lock field is hidden when no referral/store code is present.
- Storefront + checkout now use URL-based referral detection for this flow, preventing stale stored store-code attribution on direct non-referral visits.
- Checkout mode pricing is now dynamic and enforced end-to-end:
  - `Guest` mode: no preferred discount (regular price).
  - `Free Account` mode: preferred discount enabled (`15%`).
- Free-account checkout hint copy now includes an e-commerce caption: `Enjoy 15% discount.`
- Checkout UI cleanup applied:
  - removed top-page discount badge
  - summary line now reads `Discount`
  - discount line is hidden in guest mode
  - guest CTA now reads `Pay Now`
- Backend attribution behavior now branches for no-referral checkouts:
  - `Guest` no-referral: remains non-attributed path.
  - `Free Account` no-referral: routes attribution to authorized fallback sponsor account (configurable), enabling preferred-customer account creation.
- Operational/configuration note:
  - fallback sponsor can be set via:
    - `CHECKOUT_FALLBACK_SPONSOR_USERNAME`
    - `STORE_CHECKOUT_FALLBACK_SPONSOR_USERNAME`
    - `PREFERRED_CUSTOMER_FALLBACK_SPONSOR_USERNAME`
  - if no eligible fallback sponsor exists, free-account no-referral checkout returns `503`.
- Tax handling status:
  - tax remains pending/not yet implemented; this update handles discount and attribution behavior only.

## Recent Update (2026-03-27) - Placement Strategy Controls Expanded (Preferred Customer + Enrollment)

- Placement controls now follow six explicit modes:
  - `Left`
  - `Right`
  - `Spill Over Left`
  - `Spill Over Right`
  - `Spillover Extreme Left`
  - `Spillover Extreme Right`
- Direct-leg controls (`Left`/`Right`) are treated as level-1 intent controls in enroll/planner validation.
- Spillover parent assignment controls remain active only for spillover-side modes.
- Preferred Customer manual `Assigned Parent` now supports free typing (username/member ID) with suggestion list retained.
- Binary tree placement interpretation now supports side-specific spillover options plus far-edge extreme strategies.
- Backend normalization now accepts side-specific spillover aliases for compatibility.
- Current state:
  - placement controls now match the requested planning language used by sponsor workflows.

## Recent Update (2026-03-26) - All User Store-Code Validation + Legacy Alias Recovery

- Checkout error for `CHG-7X42` is now addressed with compatibility mapping:
  - `CHG-7X42 -> CHG-ZERO`
- Dashboard/store defaults aligned to `CHG-ZERO` to avoid stale copied public links/codes.
- Validation run completed across all current users:
  - all user `storeCode/publicStoreCode/attributionStoreCode` paths resolve.
  - no unresolved attribution references found.
  - legacy `CHG-7X42` now resolves to current owner path (`zeroone` via `CHG-ZERO`).
- Checkout routing validation across all user codes:
  - store-code lookup failures are resolved.
  - current test result now proceeds to Stripe API validation layer (expected `Invalid API Key` in validation run using placeholder key).

## Recent Update (2026-03-26) - Stripe Checkout Transition Implemented

- Storefront checkout is now routed through Stripe-hosted Checkout Sessions.
- New backend checkout APIs are active:
  - `POST /api/store-checkout/session`
  - `POST /api/store-checkout/complete`
- Store checkout page now:
  - collects buyer/shipping context
  - redirects to Stripe for payment
  - verifies session on return (`checkout=success`) and finalizes invoice + owner BV credit.
- Invoice finalization now supports idempotent invoice IDs from checkout metadata to prevent duplicate completion.
- Operational note:
  - if `STRIPE_SECRET_KEY` is missing, checkout session creation returns `503` with configuration guidance.
- Current phase state:
  - Stripe transition for public storefront checkout flow is implemented and wired.
  - next optional phase is expanding Stripe session flow into the in-app member store checkout experience if desired.

## Recent Update (2026-03-26) - Preferred Customer Auto-Enrollment on Successful Store Checkout

- Debug fix for reported issue where paid checkout buyers were not appearing in the store owner `Preferred Customers` page.
- Checkout finalization now attempts auto-enrollment for the buyer as `Free Account` (`preferred-customer-pack`) under the attributed store owner sponsor line.
- Auto-enrollment runs before invoice finalization and is idempotent:
  - existing buyer account email -> reuses account identity
  - new buyer email -> creates pending free account + registered member record
  - race conflict (`409`) -> resolves buyer identity after conflict and continues
- Invoice finalization now stores resolved buyer identity fields when available (`buyerUserId`, `buyerUsername`, `buyerEmail`) to improve planner matching reliability.
- Owner BV credit behavior remains unchanged (credited to attributed store owner; free buyer does not receive BV).
- Added one-time backfill utility for historical invoices created before the fix:
  - `backend/scripts/backfill-preferred-customers-from-invoices.mjs`
  - npm script: `backfill:preferred-customers`
- Validation run in current dev dataset:
  - created `1` preferred-customer member from unmatched invoice (`INV-240930`)
  - unmatched invoice count reduced to `0`
  - re-run confirms idempotency (`createdCount: 0`, `skipped: already-matched`)

## Recent Update (2026-03-26) - Guest vs Free Checkout Mode + Attribution Locking

- Public checkout now has an explicit checkout mode choice:
  - `Guest Checkout` (purchase only; no account creation)
  - `Free Account` (creates pending preferred customer account and sends password setup email)
- Preferred customer auto-enrollment now runs only when checkout mode is `Free Account`.
- Guest mode keeps invoice attribution and owner BV crediting, but skips account auto-creation.
- Public checkout store code field is now read-only (link-locked UX).
- Backend now enforces referrer store-code lock:
  - if posted store code does not match checkout page store code, checkout request is rejected.

## Recent Update (2026-03-26) - Checkout Thank-You Invoice Modal + Store-Themed Preferred Login

- Public checkout now shows a post-payment thank-you modal with invoice details:
  - invoice id
  - status
  - amount
  - discount
  - BV
  - purchase timestamp
- Thank-you modal includes quick actions:
  - `Preferred Login` (store-themed free account login)
  - `Back to products`
- Added dedicated store-themed preferred customer login page:
  - `/store-login.html`
  - pretty route alias: `/store/login`
- Store page headers (`store.html`, `store-product.html`, `store-support.html`, `store-checkout.html`) now point `Free Member Login` to `/store-login.html`.
- Pending password-setup login behavior now generates/returns a setup link when missing, so login can always surface a clickable setup link in development mode.

## Recent Update (2026-03-26) - Strategic Direction Locked (Planning Only, No Code Changes)

- Product direction was aligned to a custom commerce stack owned inside this app:
  - custom storefront
  - internal product management and catalog ownership
  - internal inventory ownership
  - Stripe Checkout as the primary checkout/payment flow
  - shipping integration (USPS and additional carriers/providers as needed)
  - tax-rate/tax-calculation integration
- Explicit session decision:
  - no implementation patching in this step
  - no backend/frontend behavior changes applied
  - planning mode only until architecture and rollout sequence are finalized
- Attribution/BV requirements remain in scope:
  - store-code attribution remains a required field in checkout/order flows
  - BV point accounting remains app-owned as part of the binary-tree/commission domain
- Next planning deliverables:
  - phase-by-phase architecture plan
  - data model and event flow for attribution/BV ledgering
  - provider integration contracts (Stripe, shipping, tax)
  - risk and rollout checklist before first implementation patch

## Recent Update (2026-03-25) - My Store Sidebar Removal (Top Command Bar)

- Per feedback, removed the left-side `Store Console` rail/sidebar from `My Store`.
- Replaced with a top command-bar layout:
  - header strip + status chips
  - horizontal workspace navigation cards (`Product Management`, `Analytics`, `Store Setup`)
  - inline workspace context panel below nav
- Product Management list -> editor flow remains intact; only container/navigation composition changed.
- Validation completed:
  - `admin.html` inline script parse check passed.

## Recent Update (2026-03-25) - Product Management Flow Redesign (Shopify-Style List -> Product Editor)

- Rebuilt admin `My Store` product management into a dedicated management flow:
  - `Products list view` (catalog-style listing)
  - `Product editor view` (single-product management page)
- Core UX changes in `admin.html`:
  - replaced old side-by-side form/list layout.
  - added product list table-like rows with:
    - product summary
    - status
    - price
    - inventory + BV
    - updated date
    - quick actions (`Manage`, `Archive/Unarchive`)
  - added dedicated editor workspace with:
    - back-to-list control
    - editor header/status badge
    - title, description, media, pricing, inventory, BV, status sections
    - archive/delete actions for existing products
    - persistent save/discard controls.
- Interaction behavior:
  - `Add Product` opens new-product editor page.
  - `Manage` opens selected product editor page.
  - save keeps user in product editor (Shopify-like single-product flow).
  - delete returns to list with list-level feedback.
- Technical updates:
  - added view state helpers for list/editor workspace switching.
  - moved product actions from list-level inline edit/delete into dedicated editor workflow.
  - kept existing product API contracts unchanged.
- Validation completed:
  - `admin.html` inline script parse check passed.

## Recent Update (2026-03-25) - My Store Navigation Redesign (Fresh Layout Footprint)

- Second-pass redesign completed after feedback that prior update still felt same-footprint.
- `My Store` area in `admin.html` now uses a materially different structure:
  - left persistent commerce rail (`Store Console`) with stacked nav cards
  - right workspace canvas for active tab content
  - context module moved into side rail for always-visible workspace state
- Interaction model preserved:
  - existing tab keys (`storefront`, `analytics`, `setup`) unchanged
  - existing `setStoreTab(...)` behavior continues to power view switching
  - active badges and context state still update from tab metadata
- Visual direction:
  - denser, app-shell style admin feel vs prior top hero + horizontal tabs
  - closer to commerce admin console layout conventions.
- Validation completed:
  - `admin.html` inline script parse check passed.

## Recent Update (2026-03-25) - My Store Nav Redesign (Shopify-Inspired Admin UX)

- Redesigned the `My Store` workspace navigation in `admin.html` to feel more polished, interactive, and commerce-admin oriented.
- Replaced the previous basic 3-button strip with a richer control-surface layout:
  - branded workspace header
  - status chips (`Live Catalog`, `Attribution Locked`)
  - elevated tab cards for `Product Management`, `Analytics`, `Store Setup`
  - live ????????????????Current Workspace??????????????? context panel that updates as tabs change
- Enhanced tab interaction behavior:
  - clearer active state (ring + border + shadow treatment)
  - inline active badge on selected tab card
  - context title/description/pill now update from tab metadata in `setStoreTab(...)`
- Existing tab/view logic preserved:
  - no route contract changes
  - no store view key changes (`storefront`, `analytics`, `setup`)
  - state persistence remains unchanged.
- Validation completed:
  - `admin.html` inline script parse check passed.

## Recent Update (2026-03-25) - Product Page Description Container Alignment

- Fixed product page layout issue where part of description text rendered outside the `Description` field container.
- `store-product.html` now renders all description paragraphs inside `#product-description-body` (inside the Description card).
- Removed separate lead-description node that lived outside the description container.
- Validation completed:
  - `store-product.html` inline script parse check passed.

## Recent Update (2026-03-25) - Product Management Form Simplification

- Removed `Product Details (one detail per line)` from admin Product Management form in `admin.html`.
- Cleaned related form bindings so create/edit flows no longer reference that removed input.
- Managed products card list no longer shows detail-preview text in Product Management view.
- Validation completed:
  - `admin.html` inline script parse check passed.

## Recent Update (2026-03-25) - Product Description Parity Fix (Admin vs Product Page)

- Fixed mismatch where product detail page narrative text did not match the admin-entered product description.
- `store-product.html` now renders description directly from `product.description` without auto-generated rewrite text.
- Multi-line admin descriptions are preserved as paragraph breaks on the product page.
- Validation completed:
  - `store-product.html` inline script parse check passed.

## Recent Update (2026-03-25) - Store Product Images (`Browse` Upload + Gallery)

- Admin Product Management now supports local image upload via `Browse...` button:
  - uploads to `POST /api/admin/store-products/upload-image`
  - accepted formats: JPG / PNG / WEBP / GIF
  - max file size: `5 MB`
  - upload response auto-fills primary image URL in form.
- Product schema/persistence now supports gallery image arrays:
  - primary image: `image` / DB `image_url`
  - gallery images: `images[]` / DB `image_urls jsonb`
- DB compatibility handling added:
  - startup checks for `image_urls` column
  - runs admin-role migration/backfill only when column is missing
  - avoids service-role ownership errors on existing tables.
- Public product page now supports multi-image storefront display:
  - hero image + thumbnail selector in `store-product.html`
  - single-image products remain fully supported.
- Validation completed:
  - backend module parse checks passed for updated store product modules
  - inline script parse checks passed for admin/storefront pages
  - local endpoint smoke test passed:
    - `GET /api/admin/store-products` -> `200`
    - `POST /api/admin/store-products/upload-image` -> `200`

## Recent Update (2026-03-25) - Preferred Customer Free Account Flow (Phase 1)

- Implemented new package/rank foundation:
  - package key: `preferred-customer-pack`
  - enrollment label: `Free Account`
  - starting rank: `Preferred Customer`
- Added preferred-customer management entry point:
  - side nav route: `/PreferredCustomer`
  - page key: `preferred-customer`
  - view now runs as a dedicated purchaser planning page (not enrollment form).
- Preferred customer planner page now shows:
  - purchasers attributed to current store owner
  - total purchased amount, BP, invoice count, and last purchase date per customer
  - click-to-edit placement planning before upgrade (`left/right/spillover + parent mode`)
- Added placement-plan save endpoint:
  - `PATCH /api/registered-members/:memberId/placement`
- Enrollment and pending logic now supports pre-placement:
  - parent can set `left/right/spillover` placement before upgrade.
  - spillover placement now supports:
    - `Auto Assign Parent`
    - `Assign Specific Parent` (manual direct-child reference)
  - placement selector now auto-detects filled direct legs and moves to spillover when both left/right direct slots are occupied.
  - pending preferred members are excluded from Binary Tree render until upgraded.
  - after upgrade to paid package, stored placement metadata is used for auto-placement.
- Access controls for Free Accounts:
  - free users are now restricted to `My Store` and `Profile` page access.
- Store and attribution logic updates:
  - Free Account discount set to `15%`.
  - Free Account buyer receives no BV/PV credit.
  - BV credit is redirected to attributed store owner/upline identity.
  - owner BV credit is applied once checkout payment succeeds.
  - invoice API now validates `memberStoreCode` vs `memberStoreLink` store-code mismatch.
- Validation completed:
  - backend parse checks passed for modified services/helpers.
  - inline script parse checks passed for `index.html` and `login.html`.

## Recent Update (2026-03-16) - Dashboard Reload Commission Offset Regression Fix

- Completed fix for dashboard commission cards/buttons reappearing as transferable after reload.
- Root cause:
  - net-balance resolver mutated loaded offset state during early startup render passes.
  - temporary `gross=0` passes collapsed offset state to `0`, causing previously transferred amounts to reappear.
- Frontend fix:
  - `index.html`: `resolveNetCommissionBalance(...)` now computes effective offsets without mutating stored offset state.
- Validation:
  - browser repro for `zeroone` now stays stable across reload:
    - `Fast Track` and `Infinity Builder` remain `$0.00` after transfer history is loaded.
    - transfer buttons remain disabled after reload.
  - offset API values still load normally (`/api/e-wallet/commission-offsets` unchanged).

## Recent Update (2026-03-16) - E-Wallet Dedicated Table Path Restored

- Completed post-privilege rewire of E-Wallet backend to dedicated tables in schema `charge`.
- DB provisioning ran under admin role:
  - ensured `charge.ewallet_accounts` and `charge.ewallet_peer_transfers` exist
  - ensured E-Wallet indexes exist
  - granted service-role DML to both tables
- Backend store now uses dedicated E-Wallet tables again (`backend/stores/wallet.store.js`).
- Temporary compatibility path (using `charge.payout_requests` for E-Wallet ledger persistence) has been removed.
- Validation:
  - `GET /api/e-wallet` returns `200` on live backend (`localhost:3000`)
  - wallet backend module parse checks passed
  - test P2P transfer path validated on temp server and rolled back.

## Recent Update (2026-03-16) - E-Wallet API Recovery (DB-Only)

- Resolved E-Wallet timeline load failure (`Unable to load E-Wallet details.`) in backend runtime.
- Confirmed active DB role constraints:
  - `CREATE TABLE` denied in schema `charge` (`42501`), including current admin-role credentials from `.env`.
- Implemented DB-only compatibility path in `backend/stores/wallet.store.js`:
  - E-Wallet profile/identity reads from `charge.member_users`
  - E-Wallet transfer history + persistence uses `charge.payout_requests` with E-Wallet-specific source metadata
  - no local file/JSON storage fallback
- Updated transfer payload mapping in `backend/services/wallet.service.js` to persist sender-name metadata for write completeness.
- Runtime verification:
  - `node --check` passed for wallet backend modules
  - `GET /api/e-wallet` now returns `200` on live server (`localhost:3000`) with wallet/timeline payload.
- Current status:
  - E-Wallet page can load timeline data again without requiring new table creation privileges.

## Recent Update (2026-03-16) - E-Wallet Layout Redesign (Distinct from Dashboard)

- Completed a visual/layout refactor of member-side E-Wallet in `index.html` to remove repetitive dashboard KPI-card styling.
- New page structure now uses:
  - wallet command center hero with large balance focus
  - directional flow rail rows for sent/received/count metrics
  - transfer composer panel
  - timeline-style ledger stream with marker-based entries
- Compatibility guard:
  - retained all existing E-Wallet DOM IDs required by current JS module bindings (`renderEWalletSummary`, transfer submit flow, and history refresh/render functions).
- Rendering update:
  - transfer history list items now render as timeline events (with directional markers and signed amount emphasis) instead of individual card blocks.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - inline script parse check passed for `index.html`
  - presence checks passed for all required `ewallet-*` IDs

## Recent Update (2026-03-16) - Full E-Wallet Page + Peer-to-Peer Transfer

- Implemented a dedicated member-side `E-Wallet` page in `index.html`:
  - sidebar route/nav now opens `E-Wallet` (`/EWallet`)
  - new page view includes:
    - live available balance card
    - total sent / total received / transfer count metrics
    - peer transfer form (recipient + amount + note)
    - transfer history feed with refresh action
- Frontend integration:
  - added E-Wallet page routing in `pageMeta` and `pagePathByPage`
  - wired API calls for:
    - load wallet snapshot + transfer history
    - post peer transfer and update UI immediately
  - dashboard total balance now syncs from wallet snapshot when wallet data is loaded
  - transfer events are now pushed into Recent Activity (`kind: transfer`)
- Backend/API implementation:
  - added wallet routes:
    - `GET /api/e-wallet`
    - `POST /api/e-wallet/peer-transfer`
  - added transactional transfer service with balance validation:
    - sender/recipient account upsert
    - account row locking (`FOR UPDATE`)
    - insufficient-balance guard
    - atomic debit/credit + transfer record insert
  - added wallet persistence store with schema bootstrap (`CREATE TABLE IF NOT EXISTS`):
    - `charge.ewallet_accounts`
    - `charge.ewallet_peer_transfers`
    - supporting indexes
- Files added:
  - `backend/stores/wallet.store.js`
  - `backend/services/wallet.service.js`
  - `backend/controllers/wallet.controller.js`
  - `backend/routes/wallet.routes.js`
- Files updated:
  - `backend/app.js`
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check` passed for all new wallet backend modules and `backend/app.js`
  - inline script parse check passed for `index.html` and `admin.html`

## Recent Update (2026-03-16) - Binary Tree Sidebar Auto-Fullscreen

- Requested behavior implemented:
  - clicking the `Binary Tree` item in the sidebar now opens the Binary Tree page directly in fullscreen mode.
- Files updated:
  - `index.html`
  - `admin.html`
- Implementation details:
  - `setPage(pageName, options)` now reads `options.autoEnterBinaryTreeFullscreen`.
  - Binary Tree page load flow now triggers `controller.enterFullscreen()` when that flag is true.
  - sidebar nav click handlers now pass:
    - `autoEnterBinaryTreeFullscreen: requestedPage === 'binary-tree'`
- Scope guard:
  - auto-fullscreen is tied specifically to sidebar Binary Tree clicks.
  - other entry paths to Binary Tree (e.g. route restore/popstate or settings deep-links) remain unchanged.
- Validation:
  - no-op safe check retained (`enterFullscreen` only runs when available; existing fullscreen state is already guarded in controller).

## Recent Update (2026-03-15) - Legacy Tier Node Count Starts at 1/40

- Confirmed requested rule:
  - Legacy tier node count includes the account owner/root.
  - Tier cards should start at `1/40`, not `0/40`.
- Implementation:
  - updated Legacy tier snapshot config to include root node when no seed directs are present:
    - `includeRootNodeWithoutSeeds: true`
  - retained sequential unlock behavior:
    - Tier 2 still appears only after Tier 1 reaches `3/3` directs.
- Validation:
  - `0 directs` -> Tier 1 shows `1/40`.
  - `3 directs` -> Tier 1 shows `4/40`, Tier 2 appears at `1/40`.
- Data hygiene:
  - temporary validation members removed.
  - DB returned to fresh-start state after validation.

## Recent Update (2026-03-15) - Legacy Leadership Tier Progression Fix (Sequential Unlock)

- Addressed user-side dashboard issue where Tier 1 and Tier 2 appeared to mirror each other too early.
- Required behavior implemented:
  - Tier 1 is the only visible starter card.
  - Tier 2 appears only after Tier 1 reaches `3/3` direct Legacy sponsorships.
  - Tier claim still requires full tier completion (`40` nodes).
  - After first 3 directs are complete, the next tier becomes available for building.
- Frontend logic updates in `index.html`:
  - Enhanced shared tier snapshot builder with per-bonus options:
    - `baseVisibleTierCount`
    - `previewLockedTierCount`
    - `unlockByDirectRequirement`
    - `includeRootNodeWithoutSeeds`
  - Legacy Leadership now uses:
    - `baseVisibleTierCount: 1`
    - `previewLockedTierCount: 0`
    - `unlockByDirectRequirement: true`
    - `includeRootNodeWithoutSeeds: false`
  - Result: no premature Tier 2 display, and new unlocked tier starts at `0/40`.
- Validation:
  - `0` directs -> only Tier 1 visible (`0/40`).
  - `2` directs -> only Tier 1 visible (`2/3` progress, Tier 2 hidden).
  - `3` directs -> Tier 1 and Tier 2 visible; Tier 2 starts building from `0/40`.
- Data hygiene:
  - temporary validation seed members were removed.
  - DB returned to fresh-start state after verification.

## Recent Update (2026-03-15) - Fresh Start Data Reset (User Request)

- Per latest request, removed restored legacy dataset and returned DB to fresh-start state.
- Executed full app-data reset and verified post-reset counts are zero for member/business tables:
  - `member_users`
  - `registered_members`
  - `password_setup_tokens`
  - `email_outbox`
  - `store_invoices`
  - `payout_requests`
  - `binary_tree_metrics_snapshots`
  - `sales_team_commission_snapshots`
  - `member_server_cutoff_states`
  - `force_server_cutoff_history`
- Preserved required bootstrap/system rows:
  - `admin_users`: `1`
  - `runtime_settings`: `1`
- Runtime settings were normalized to clean defaults:
  - `dashboardMockupModeEnabled = false`
  - `tierClaimMockModeEnabled = false`

## Recent Update (2026-03-15) - DB User Data Restore From Web-Dev JSON

- Restored app data into PostgreSQL from source JSON stores found at:
  - `/Users/seth/Documents/Web-Dev`
- Restore source files used:
  - `mock-users.json`
  - `registered-members.json`
  - `password-setup-tokens.json`
  - `mock-email-outbox.json`
  - `mock-store-invoices.json`
  - `mock-payout-requests.json`
  - `mock-binary-tree-metrics.json`
  - `mock-sales-team-commissions.json`
  - `mock-member-server-cutoff-state.json`
  - `mock-force-server-cutoff-history.json`
  - `mock-runtime-settings.json`
  - `mock-admin-users.json`
- Resulting restored row counts:
  - `member_users`: `22`
  - `registered_members`: `22`
  - `password_setup_tokens`: `22`
  - `email_outbox`: `22`
  - `store_invoices`: `5`
  - `payout_requests`: `12`
  - `binary_tree_metrics_snapshots`: `13`
  - `sales_team_commission_snapshots`: `13`
  - `member_server_cutoff_states`: `15`
  - `force_server_cutoff_history`: `17`
  - `admin_users`: `1`
  - `runtime_settings`: `1`
- Note:
  - Original restored seed set did not include username `zeroone`, so a legacy `zeroone` account was recreated with active login state.

## Recent Update (2026-03-15) - Legacy Leadership Founder Unlock Fix (User Dashboard)

- Investigated user report:
  - logged in as legacy package account (`zeroone`) but Legacy Leadership card stayed locked.
- Root cause:
  - `index.html` `resolveLegacyLeadershipEligibilityFromRankAndSponsor(...)` required both:
    - Legacy rank
    - 3 direct legacy enrollments
  - This blocked Legacy Founder access and prevented tier cards from rendering.
- Fix applied:
  - Updated Legacy Leadership eligibility gate so access unlocks with Legacy rank/package (Founder requirement).
  - Direct legacy enrollments remain required for tier progress/completion (inside tier snapshot/progress logic), not for top-level access.
  - Updated locked subtitle/footnote messaging to use generalized requirement builder when rank access is missing.
- Files updated:
  - `index.html`
- Validation:
  - Legacy session user (`Legacy` rank, `legacy-builder-pack`, 0 directs):
    - no locked gate card
    - Tier 1 renders
    - status shows `Building`.
  - Non-legacy session user remains correctly locked.

## Recent Update (2026-03-15) - PostgreSQL Deadlock Fix (Enrollment + Force Cutoff)

- Fixed intermittent `500` errors on:
  - `POST /api/registered-members`
  - `POST /api/admin/force-server-cutoff`
- Root cause:
  - concurrent write transactions against related tables (`charge.member_users`, `charge.registered_members`, and dependent snapshots/states) could deadlock (`40P01`) under DB-backed flows.
  - `resetAllMockData` also issued parallel count queries on a single PG client, causing deprecated/unsafe client concurrency.
- Backend fixes implemented:
  - `backend/services/admin.service.js`
    - `resetAllMockData(...)` now counts rows sequentially on the same transaction client.
    - `forceServerCutoff(...)` now writes in deterministic sequence:
      - users -> members -> binary snapshots -> sales-team commissions -> member cutoff states -> force-cutoff history.
  - `backend/services/member.service.js`
    - `createRegisteredMember(...)` writes are now sequential:
      - users -> members -> password tokens -> email outbox.
    - `upgradeMemberAccount(...)` writes are now sequential:
      - users -> members.
  - `backend/controllers/admin.controller.js` and `backend/controllers/member.controller.js`
    - hardened error logs to include stack/message context for faster DB failure diagnosis.
- Validation completed:
  - direct service repro passed:
    - reset -> register -> save binary metrics -> force cutoff (all success).
  - API repro passed on fresh server process:
    - `POST /api/admin/force-server-cutoff` returned `200` after registration + metrics snapshot.
  - smoke checks passed for key member/admin GET/POST endpoints.

## Recent Update (2026-03-15) - Fast Track Enrollment Commission Regression Fix

- Fixed a regression where newly enrolled members always saved `fastTrackBonusAmount = 0`.
- Root cause:
  - DB-backed `backend/services/member.service.js` had Fast Track package/tier metadata but did not include bonus-matrix payout logic from legacy `serve.mjs`.
- Backend fix implemented:
  - Added `resolveFastTrackBonusAmount(...)` helper and persisted computed bonus for non-admin enrollments.
  - Preserved admin behavior: admin-route enrollments continue to save `0` Fast Track bonus.
- Route/context fix:
  - `backend/controllers/member.controller.js` now detects `/admin/*` enrollment route and passes:
    - `isAdminPlacement: true`
    - `enrollmentContext: 'admin'`
  - Member route enrollments remain `member` context and are eligible for Fast Track credit.
- Result:
  - Member enrollments now generate commission values again from package+tier data.
  - Admin placements remain no-credit by design.
  - One-time DB repair executed: updated 4 existing non-admin `charge.registered_members` rows from `0.00` to mapped Fast Track bonus values; remaining affected rows = `0`.

## Recent Update (2026-03-15) - Fast Track Matrix Orientation Correction

- Clarified rule interpretation for `brand_assets/MLM Business Logic.md` line 45:
  - matrix row (left) = sponsor/parent Fast Track tier (based on sponsor package/rank)
  - matrix column = newly enrolled member package
- Example validated:
  - sponsor tier `Infinity` enrolling `Legacy Builder Pack` must credit `120.00` (`12.5% of 960`).
- Backend updates:
  - `backend/services/member.service.js` now computes Fast Track bonus as:
    - sponsor-tier rate (`7.5% | 10% | 12.5% | 20%`) ???????????? enrolled package price
  - sponsor tier is now derived from sponsor account package/rank when available (fallback to payload tier).
- Frontend parity updates:
  - `index.html` and `admin.html` `getFastTrackBonusAmount(...)` now use the same sponsor-tier-rate ???????????? package-price calculation for preview/fallback messaging.
- Data repair executed:
  - recalculated historical non-admin rows to the corrected orientation.
  - corrected rows included:
    - `demouser2 -> demouser3` (Legacy enrollment under Infinity tier): `112.00 -> 120.00`
    - `demouser1 -> demouser2` (Infinity enrollment under Legacy tier): `120.00 -> 112.00`
    - `admin -> zeroone` (Legacy enrollment under Personal tier): `38.40 -> 72.00`

## Recent Update (2026-03-08) - Binary Tree Full Sweep + Additional Cutoff/Tier Fixes

- Completed full binary-tree investigation before reset planning:
  - placement graph and ancestry checks
  - snapshot parity checks
  - cutoff-state age checks against account creation timestamps
- Confirmed:
  - `juan` is in `hues` ancestry path (`juan -> bond -> hues -> ...`)
  - `sethfozz` computed left/right leg BV aligns with saved snapshot (`1920 / 2880`)
- Added cutoff stale-state protection in `serve.mjs`:
  - `/api/member/server-cutoff-metrics` now invalidates per-account cutoff baselines when account `createdAt` is newer than `lastAppliedCutoffUtcMs`.
  - prevents ????????????????instant reset to 0??????????????? behavior caused by stale inherited state.
- Added stale-baseline protection for session bootstrap:
  - `serve.mjs` auth response sanitizer
  - `index.html` starter dashboard metric resolver
- Fixed locked tier-card progress behavior in `index.html`:
  - Infinity Builder + Legacy Leadership locked cards now render progress bars from direct enrollment progress (`qualified / required`) instead of hardcoded `0%`.
- Validation:
  - `serve.mjs` syntax check passed
  - `index.html` inline script parse passed
  - cutoff endpoint probe for `juan`/`love` confirmed stale cutoff-state normalization.

## Recent Update (2026-03-08) - Binary Tree Downline BV Guard

- Fixed binary-tree BV suppression case where newly enrolled members could show `0` weekly BV if stale baseline values existed from a cutoff timestamp earlier than member creation.
- Applied a createdAt-vs-baselineSetAt guard in:
  - frontend binary volume resolver (`index.html`)
  - member cutoff metrics API path (`serve.mjs`)
- Expected result:
  - downline rollups now credit newly enrolled members correctly in ancestor legs.
- Validation:
  - syntax/parse checks passed for updated files.
  - recompute check confirmed `juan` contributes `960` and appears in `hues` branch rollup.

## Recent Update (2026-03-08) - Profile Modal Media Preview

- `Edit Profile` modal now includes live visual preview for:
  - cover photo
  - profile photo
- Modal media preview now mirrors profile-header look (cover + overlapping avatar) for WYSIWYG editing.
- Upload controls remain modal-only and are integrated in the preview block.
- Validation:
  - inline script parse passed for updated `index.html`.

## Recent Update (2026-03-08) - Profile Photo/Cover Edit Gate

- Profile photo and cover actions are now gated to `Edit Profile` modal only.
- Removed direct media edit controls from the profile page header area.
- Added `Profile Media` section inside modal with change buttons for avatar and cover.
- Existing upload behavior is preserved; only entry point changed.
- Validation:
  - inline script parse passed for updated `index.html`.

## Recent Update (2026-03-08) - Profile Location Display

- Profile header now includes a human-readable location line under `@username`.
- Format now follows requested style:
  - `Country, State/Region` (example: `United States, California`)
- Profile edit modal now includes `State / Region` input and persists it with profile customization state.
- Country code is resolved to country name during render (not raw code text).
- Validation:
  - inline script parse passed for updated `index.html`.

## Recent Update (2026-03-08) - Profile Edit Modal UX

- Profile edit panel is now modal-only instead of always visible on the Profile page.
- Added `Edit Profile` button directly under bio text to open modal.
- Modal behavior now includes:
  - dismiss button close
  - outside/backdrop click close
  - Escape-key close
  - auto-close when navigating away from Profile route.
- Existing profile form ids and save/reset logic were preserved inside modal.
- Validation:
  - inline script parse passed for updated `index.html`.

## Recent Update (2026-03-08) - Profile Navigation + Lifetime Milestones

- Confirmed and aligned dashboard wording with cutoff behavior:
  - `Weekly Total Organization BV`
  - `Weekly Personal Organization BV`
- Completed member profile-page runtime wiring in `index.html`:
  - top header name/avatar button now routes to `Profile`.
  - profile module now initializes on page load.
  - lifetime milestone cards now refresh from binary-tree summary updates (not weekly reset values).
- Profile capabilities now active:
  - edit display name and country
  - edit bio with live counter
  - upload profile avatar
  - upload cover image
  - local persistence + session sync for profile data.
- Tier-card UX hardening:
  - when progress is above zero, bars now enforce a minimum visible width so `1/3` direct sponsor progress is visibly reflected.
- Validation:
  - inline script parse succeeded for updated `index.html`.

## Recent Update (2026-03-08)

- Fixed tier-card progress bar mismatch with direct sponsorship text.
- Root cause:
  - bar was tied to node-completion ratio while label was tied to direct-sponsor ratio (`x/3`).
- Patch in `index.html`:
  - Infinity Builder and Legacy Leadership active-tier bars now use direct-sponsor progress (`directChildLitCount / 3`) so bar movement matches `x/3` text.
- Validation:
  - inline script parse passed
  - direct-sponsor states now render expected visual progression (`1/3`, `2/3`, `3/3`).

- Investigated user-reported issues on dashboard KPI flow, Server Cut-Off card behavior, and Binary Tree fullscreen enrollment.
- Applied cutoff-behavior hardening in `serve.mjs`:
  - member metrics GET route no longer auto-applies scheduled/forced cutoff baselines during read hydration
  - cycle estimate now uses lower/higher leg ordering for `500 / 1000` split logic
- Applied fullscreen enroll UX fix in `index.html`:
  - added dedicated auth/password setup link inside fullscreen enroll modal
  - modal now shows success + auth link without auto-closing immediately
- Expected behavioral outcome:
  - enrolling members no longer triggers surprise Server Cut-Off left/right snap-to-zero from passive metrics reads
  - fullscreen enroll users can access setup/auth link in-context without navigating to the main Enroll Member page
- Validation:
  - `serve.mjs` syntax check passed
  - API probes confirmed current-week leg BV remains stable on read and cycle calculation aligns with lower/higher split interpretation
- Note:
  - weekly cutoff baseline advancement should come from explicit cutoff execution flow (not passive member metrics fetch).

## Recent Update (2026-03-04)

- Added Binary Fullscreen lifetime accumulation cards on both member and admin shells:
  - `Lifetime Total Organization BV`
  - `Lifetime Personal Organization BV`
- Lifetime cards now read non-reset lifetime BV (`starterPersonalPv`-based), separate from cut-off weekly BV.
- Binary-tree node payloads now include `lifetimePersonalPv` so fullscreen totals can stay stable through cut-off resets.
- Weekly cut-off behavior remains unchanged for existing cards (Server Cut-Off + Personal Volume still reset to cycle baseline).
- Validation:
  - inline script parse passed for `index.html` and `admin.html`.

- Fixed login account-switching friction when already authenticated.
- `login.html` no longer force-redirects to dashboard when a session exists.
- Current behavior:
  - login page remains available
  - shows contextual banner with current signed-in user
  - allows direct sign-in as another member (session overwrite) without requiring manual logout first
- Validation:
  - headless checks confirmed successful login for `eagleone`
  - successful immediate switch to `eaglethree`
  - login page remains accessible while authenticated.

- Fixed upline BV propagation gap after store purchases.
- Root cause:
  - binary tree leg volume aggregation used static member `packageBv` only.
  - purchase sync writes to `starterPersonalPv`, so new purchase volume was not reflected in upline legs.
- Patch in `index.html`:
  - added `resolveMemberBinaryVolume(member)` using `starterPersonalPv` with `packageBv` fallback.
  - binary tree node `leftPersonalPv` and organization BV rollups now use that dynamic member volume.
- Result:
  - downline purchases now increase upline left/right leg BV,
  - and member Server Cut-Off panel now reflects those updates.
- Validation:
  - `index.html` inline script parse passed
  - headless login check (`sethfozz`) showed non-zero Server Cut-Off left leg after downline purchase (`left=384`, `right=0`)
  - server endpoint `GET /api/member/server-cutoff-metrics?username=sethfozz` returned matching current-week values.

- Fixed member login dead-end for pending-password-setup accounts (`passwordSetupRequired=true`) when old setup tokens were expired.
- Login API (`POST /api/member-auth/login`) now auto-issues and persists a fresh setup token if no open valid token exists, then returns `setupLink` with `PASSWORD_SETUP_REQUIRED`.
- Login page (`login.html`) now renders `PASSWORD_SETUP_REQUIRED` with a clickable `Open setup link` action when setup link is present.
- Validation completed:
  - `serve.mjs` syntax check passed
  - `login.html` inline script parse passed
  - active member auth remained successful (`sethfozz`, `fozz`, `hues`)

- Refined My Store discount model to remove product-level discount conflicts with retail flow.
- User storefront (`index.html`) now applies discount strictly by current account rank percent:
  - `Personal 20%`
  - `Business 25%`
  - `Infinity 30%`
  - `Legacy 40%`
- User flow labels were updated to surface rank-based discount in:
  - storefront badge
  - product page summary
  - cart/checkout totals
- Admin Product Management (`admin.html`) no longer includes product discount fields:
  - create/edit form discount input removed
  - discount parsing/validation removed
  - managed product cards no longer display per-product discount stats
- Existing rank-driven discount behavior for checkout totals was preserved and clarified (no custom per-product discount overrides).
- Validation completed:
  - no remaining `discountPercent`/legacy per-product discount references in user/admin store code paths
  - inline script syntax checks passed for both files
  - headless runtime load passed for both files (non-blocking `favicon.ico` 404 observed)

- Migrated member Server Cut-Off panel to server-authoritative state.
- Added backend store + API:
  - `mock-member-server-cutoff-state.json`
  - `GET /api/member/server-cutoff-metrics`
- Member panel (`index.html`) no longer relies on localStorage cutoff baseline math.
- Server now computes and returns:
  - current-week Left/Right BV
  - baseline and latest applied cutoff state
  - scheduled cutoff metadata and cycle rule values
- Admin force cut-off now updates member cutoff-state baselines server-side at run time.
- Admin flush-all now clears member cutoff-state store and reports its cleared count.
- Regression validation completed:
  - scenario reproduced (non-zero -> force -> reset)
  - post-force panel held `0/0` over timed observation with no snap-back.

- Investigated member-side Server Cut-Off force-run mismatch and reproduced with browser automation.
- Root cause confirmed:
  - force timestamp could be applied before member BV totals were fully hydrated,
  - leaving cutoff baseline at `0/0` while `lastAppliedCutoffUtcMs` advanced.
- Implemented member-side hydration-safe force cutoff handling in `index.html`:
  - tracks latest forced event timestamp from `/api/server-cutoff-events`
  - supports safe equal-timestamp re-apply path for hydration backfill
  - backfills baseline once when real BV totals arrive after a very recent force event
- Validation status:
  - automated test now confirms post-force member panel resets Left/Right BV to `0/0` after reload.
  - local storage cutoff baseline now persists hydrated BV baseline correctly.

- Implemented dedicated JSON persistence for Binary Tree and Sales Team Commission systems to prepare for database migration.
- New stores:
  - `mock-binary-tree-metrics.json`
  - `mock-sales-team-commissions.json`
- New API surfaces:
  - `GET/POST /api/binary-tree-metrics`
  - `GET/POST /api/sales-team-commissions`
- Member dashboard (`index.html`) now writes synchronized snapshots from:
  - Binary summary computation loop.
  - Sales Team Commission card computation loop.
- Reset path alignment:
  - `POST /api/admin/reset-all-data` now also clears both new stores.
  - Admin Settings flush notice now includes both files.
- Migration intent preserved:
  - Money fields persisted as numeric values.
  - Snapshot rows include identity columns and ISO timestamps for direct PostgreSQL table mapping.
- Expanded migration prep to full app scope:
  - Added full PostgreSQL schema script at `migrations/20260304_001_full_app_postgres_schema.sql`.
  - Covers all JSON-backed systems (users, admin users, members, setup tokens, email outbox, invoices, payout queue, runtime settings, binary metrics, sales commission snapshots).
  - Includes constraints/indexes/triggers for migration-ready relational structure.
- Added database access-control migration:
  - `migrations/20260304_002_full_app_access_control.sql`
  - Defines role model (`charge_admin_role`, `charge_service_role`, `charge_member_role`).
  - Applies grants + row-level security policies for admin/service full access and member self-scoped visibility.
- Added admin-only launch seed migration:
  - `migrations/20260304_003_admin_seed.sql`
  - Seeds only `charge.admin_users` for fresh-start deployment.
  - Leaves all user/member/business datasets empty.
- Added backend documentation hub:
  - `Claude_Notes/BackEnd-Notes.md`
  - Tracks DB schema/access/seed migrations, run order, and production follow-ups.
- Implemented Server Cut-Off weekly BV reset behavior:
  - Applied to both member and admin dashboards.
  - Left/Right Leg BV now resets to `0` once per closed cutoff and re-accumulates for the new week.
  - Cutoff baseline/last-applied state persisted per user/config in local storage.

## Owner Scope Gate (Priority Rule)

- **Priority instruction from owner (2026-02-22):** Do not get ahead of approved scope when implementing MLM earning systems.
- **Current active systems:** `2. Fast Track Bonus`, `3. Infinity Tier Commission`, and `4. Sales Team Commission`.
- **Do not start yet:** any compensation systems after section `4` of `brand_assets/MLM Business Logic.md` unless explicitly approved by owner in chat.
- **Execution policy:** implement only owner-approved compensation sections and keep all other sections gated until explicit go-ahead.
- **Context allowance:** Work on previous systems/tasks is allowed when needed for context, dependencies, or validation of current work.
- **Advance trigger (owner-controlled):** Only introduce a new system/logic after explicit owner confirmation in chat (example: "Okay lets move to the next system or task").

## User/Admin Update Decision Gate (Owner Rule - 2026-02-22)

- For every new **user-side** update request, pause and ask whether the same change should also be applied to **admin-side**.
- Admin-side patching is now owner-decision based per request.
- Default behavior:
  - implement requested change on user side first
  - ask: "Apply this update to admin side too?"
  - proceed on admin only after explicit owner confirmation

## Owner Roadmap Alignment (2026-02-22)

- **What changed:** Captured owner decisions about sequencing and backend timing.
- **Source blueprint:** `brand_assets/MLM Business Logic.md`
- **Decisions recorded:**
  - Keep data mock-driven (JSON/static state) while required systems/components are built.
  - Treat `brand_assets/MLM Business Logic.md` as the business blueprint for compensation behavior.
  - Defer database-backed auth/session migration until later implementation phase.

## Proposed Delivery Plan (Mock First -> Database Later)

### Phase 1 - Rule engine foundation (frontend-only logic modules)

- Convert business rules in `brand_assets/MLM Business Logic.md` into deterministic JS modules (no UI dependency).
- Start with highest-impact calculations:
  - Fast Track bonus by package/rank.
  - Rank advancement checks and one-time payout flags (when owner unlocks later systems).
  - Sales Team cycle logic (when owner unlocks later systems).
- Add fixture-based tests for each rule path (happy path + edge cases).
- **Exit criteria:** Calculations are centralized, tested, and no longer hardcoded in UI strings.

### Phase 2 - Data contracts and mock domain models

- Define canonical data contracts for: User, Member Tree Node, Enrollment Package, Invoice, Commission Ledger, Rank History, Payout Request.
- Align existing mock files and UI state to those contracts.
- Add versioned mock seed format so features can evolve without ad-hoc object changes.
- **Exit criteria:** All modules read from stable contracts instead of page-specific ad-hoc objects.

### Phase 3 - Member app completion (still mock backend)

- Wire currently static widgets/actions to rule-engine outputs (example: Fast Track bonus value and payout request flow).
- Replace duplicate inline business constants in `index.html` with imports/shared config.
- Complete remaining member sidebar modules using the same data contracts.
- **Exit criteria:** Member dashboard behavior is driven by shared rule/data modules.

### Phase 4 - Admin operations completion (still mock backend)

- Build admin workflows around managed entities (members, products, invoices, payout approvals, audit trails).
- Add operator-safe guardrails in UI (state validation, reason codes, and confirmation flows for payout-impact actions).
- Add report views that reconcile tree volume, cycles, and payout line items.
- **Exit criteria:** Admin flows can validate and audit member-facing numbers using shared logic.

### Phase 5 - Backend + database migration

- Introduce API and database schema based on Phase 2 contracts (minimal schema drift).
- Move authoritative business calculations to backend services.
- Switch mock fetches to API endpoints and persist domain entities in DB.
- **Exit criteria:** Data and payout math are server authoritative, UI consumes API only.

### Phase 6 - Auth and security hardening

- Replace mock credential files with backend auth (hashed passwords, token/session lifecycle, role checks).
- Enforce server-side authorization for admin/member operations.
- Close known security gaps identified during review (including static-server path traversal and client-tamperable auth state).
- **Exit criteria:** AuthN/AuthZ and sensitive operations are enforced server-side.

## Immediate Next Build Sequence (Current Scope)

1. **Completed (2026-02-22):** Implemented `Enroll Member` sidebar module with full registration form flow in `index.html`.
2. **Completed (2026-02-22):** Added Fast Track package/tier matrix computation during enrollment and bound `#fast-track-bonus-value` to computed accrued values (base + enrolled-member credits).
3. **Completed (2026-02-22):** Added JSON-backed mock persistence for newly registered members via local API (`GET/POST /api/registered-members`) writing to `registered-members.json`.
4. **Completed (2026-02-22):** Polished Enroll Member behavior:
   - Fast Track tier is now auto-applied from current account rank.
   - Placement includes `Spillover` option with required receiving parent reference.
   - Spillover target field supports type-ahead suggestions sourced from existing direct child references.
   - Spillover now captures side explicitly (`Spillover Left` / `Spillover Right`) and uses a custom in-app results list (not browser-native datalist) for receiving parent lookup.
   - Custom receiving-parent results list now shows all matches (removed prior 12-item cap).
   - Member onboarding now generates a random temporary password at registration and issues a password-setup email link (mock outbox), requiring members to set their own password before login.
5. **In Progress:** Add Fast Track payout request flow (mock state) and validation rules.
6. Keep all other compensation systems unchanged until owner unlocks next scope.

## Current Test Baseline (2026-02-22)

- Mock stores were reset for first-run enrollment testing:
  - `registered-members.json` -> empty `members` array
  - `mock-users.json` -> empty `users` array
  - `password-setup-tokens.json` -> empty `tokens` array
  - `mock-email-outbox.json` -> empty `emails` array
- Binary tree initialization is intentionally root-only right now (`targetNodes = 1`) in both:
  - `index.html` member dashboard
  - `admin.html` admin dashboard
- Resulting behavior for this baseline:
  - Enroll flow starts with zero persisted members.
  - Binary tree starts at root (no pre-seeded child nodes).

## Recent Update (2026-03-08)

- Drafted a planning prompt for a member-side theme system expansion.
- Scope classification:
  - falls under **Phase 3 - Member app completion**
  - visual system enhancement only, not roadmap expansion into new compensation logic
- Approved planning direction captured:
  - preserve the existing layout exactly
  - allow large visual changes across themes (not color-only swaps)
  - visual references should lean toward Apple and Shopify polish
- Structural freeze for prompt execution:
  - do not change sidebar/topbar/main-panel layout
  - do not change card counts, page section ordering, or responsive grid structure
  - do not change Binary Tree feature layout or control placement
- Implementation expectation for later Codex execution:
  - introduce semantic theme tokens and multiple selectable themes
  - retain existing IDs, behaviors, navigation flow, and data bindings
  - route theme selection through `Settings > Themes` inside the existing settings UI pattern
  - prefer extending current runtime theme support instead of adding a disconnected switcher
- Pending owner decision:
  - user-side theme planning is ready
  - admin-side parity is still blocked until owner confirms

## Admin Parity Update (2026-02-22)

- `admin.html` is now synced to the latest client app shell for these pages:
  - Dashboard
  - Enroll Member
  - Binary Tree
- Admin now has the same enroll-member runtime flow (including `/api/registered-members` integration) and binary summary initialization as the client shell.
- Admin auth/login shell remains in place (`mock-admin-users.json`-based sign-in).
- Admin route mapping is scoped to `/admin/...` paths so refreshed routes stay on the admin shell.

## Admin Enrollment Policy Update (2026-02-22)

- Admin enrollments are now **placement-only** for company/root tree setup.
- Admin does **not** receive Fast Track bonus credit when enrolling members.
- Admin flow now uses admin-gated endpoint:
  - `GET/POST /api/admin/registered-members`
- Admin placement allows manual spillover reference entry (no client-side direct-child restriction enforcement).

## Login UI Cleanup (2026-02-22)

- Member login page no longer shows hardcoded demo credentials.
- `login.html` keeps only the mock auth source helper line for context.
- Member identifier placeholder is now generic and cleaner:
  - `Enter your username or email`

## Admin Enrollment Error Hardening (2026-02-22)

- Unknown `/api/*` paths now return JSON `404` errors instead of HTML fallback pages.
- Admin enroll flow now surfaces clearer guidance when the server returns unexpected non-JSON content.
- This reduces false `response payload is invalid` UX when a stale server instance is running.

## Dashboard Starter-Metric Flush + BV Preview (2026-02-22)

- Enroll preview now surfaces both package economics values:
  - `Package Price`
  - `Package BV`
- Member and admin package metadata now includes `bv` to keep preview and seed metrics aligned.
- Dashboard summary hydration now checks session starter fields (`enrollmentPackageBv`, `starterPersonalPv`, `starterTotalCycles`):
  - `Personal Volume` now stays personal-only and is set from starter PV profile data.
  - Binary-driven values remain organization-side metrics (cycles, network growth, and cut-off leg volumes).
  - Account overview organization metric is now shown as `Total Organization BV` using left + right leg BV.
- Login now includes a starter-profile hydration fallback:
  - If auth payload misses starter package fields, login resolves matching member data from registered-members store and seeds package BV/PV session fields.
- Outcome targeted: newly enrolled members open with PV baseline from enrollment package, while BV remains tied to binary organization computation.

## Admin Binary Enrollment Sync (2026-02-22)

- Admin binary tree now syncs directly from `registered-members` records instead of staying on root-only mock data.
- Enrolled members are converted into live tree nodes with:
  - placement leg (`left` / `right`)
  - spillover target + side support
  - package BV mapped into node personal volume input for binary propagation
- Sync now runs:
  - after admin `GET /api/admin/registered-members` load
  - immediately after successful admin enrollment submit
- Outcome: newly enrolled members appear connected in admin Binary Tree without requiring full restart/manual data reseed.

## Admin Settings Flush-All Control (2026-02-22)

- Added a dedicated `Settings` page in `admin.html` with an admin-only `Flush All Data` button.
- Added protected backend endpoint:
  - `POST /api/admin/reset-all-data`
- Flush action clears mock stores:
  - `registered-members.json`
  - `mock-users.json`
  - `password-setup-tokens.json`
  - `mock-email-outbox.json`
- After flush, admin UI now resets key dashboard metrics to zero baseline:
  - Top cards: `Total Balance`, `Personal Volume`, `Cycles`
  - Server Cut-Off: `Left Leg BV`, `Right Leg BV`
  - Account Overview: `Total Organization BV`, `New Members`, `Total Direct Sponsors`

## User-Side Flush + Fast Track Dynamic Baseline (2026-02-22)

- Clarified scope: flush must also impact **user-side browser state** on this device.
- Admin flush flow now clears member-side storage keys:
  - `vault-auth-user`
  - `vault-auth-user-cookie`
  - `charge-dashboard-view-state`
  - `charge-binary-tree-ui-state-v1`
- User dashboard Fast Track card is now baseline-dynamic (not hardcoded static):
  - Initial card value updated to `$0.00`.
  - Runtime base now derives from session value (if present) or `0`, then adds accrued enrollment bonus from live records.

## User Dashboard Total Balance Baseline (2026-02-22)

- Updated user-side dashboard `Total Balance` card display baseline to `$0.00` for current phase.
- Intent alignment: keep balance starting at zero until full commission-to-wallet wiring is introduced.

## User Account Rank + Activity Badge (2026-02-22)

- User-side `Account Rank` card now resolves rank dynamically from authenticated user profile/session fields.
- Added 30-day purchase-activity state on the rank card badge:
  - `Active` if last product purchase is within 30 days
  - `Inactive` if no purchase date exists or purchase is older than 30 days
- Auth payload/session model now includes rank and purchase recency fields:
  - `rank` / `accountRank`
  - `lastProductPurchaseAt` / `lastPurchaseAt`

## Membership Activity Window Rule (2026-02-22)

- New enrollment behavior now marks each newly enrolled member as active for 30 days:
  - `activityActiveUntilAt = createdAt + 30 days`
- Added server endpoint for product-purchase activity updates:
  - `POST /api/member-auth/record-purchase`
- Purchase behavior now extends member activity window by 30 days from current expiry when still active:
  - if current active-until is in the future -> add 30 days from that timestamp
  - otherwise -> starts a new 30-day window from purchase time
- User-side My Store checkout now syncs this activity update and refreshes session + dashboard badge state immediately after successful invoice creation.
- Login/session payload now includes:
  - `createdAt`
  - `activityActiveUntilAt`

## User Sidebar Navigation Hotfix (2026-02-22)

- Fixed a user-side runtime regression in `index.html` that blocked sidebar navigation.
- Cause: activity badge render was called before badge element constants were initialized.
- Resolution: moved initial `renderAccountRankActivityBadge(currentSessionUser)` call to run only after badge setup code is declared.

## User Binary Tree Enrollment Sync Fix (2026-02-22)

- User-side binary tree now rebuilds from `registered-members` records instead of remaining on root-only mock seed.
- Added user-shell tree sync path in `index.html`:
  - build binary node graph from current sponsor??????????????????s enrolled members
  - apply controller `setData(...)` when tree is initialized
  - refresh summary/fallback when tree module is not yet mounted
- Sync triggers now run:
  - after member records load
  - immediately after successful member enrollment submit
- Outcome targeted: members enrolled by `Seth Fozz Aguilar` on left/right are visible in user Binary Tree without requiring relogin or manual refresh loops.

## User Cycle Rule Update (2026-02-22)

- Updated user-side cycle rule implementation to:
  - `500 BV` on one leg + `1,000 BV` on the other leg = `1 cycle`
  - leg direction is flexible (`either leg` can satisfy the 500/1000 requirement)
- User-side areas updated:
  - Server Cut-Off `Estimated Cycles` formula and helper text
  - Dashboard `Cycles` card computation
  - User binary tree init cycle thresholds
- Admin parity decision gate:
  - owner confirmed admin parity update
  - admin-side cycle rule update is now applied

## Admin Cycle Rule Parity Update (2026-02-22)

- Applied user-approved parity update to admin side for cycle logic:
  - `500 BV` + `1,000 BV` (either leg orientation) = `1 cycle`
- Admin-side areas updated:
  - Server Cut-Off `Estimated Cycles` formula and helper text
  - Dashboard `Cycles` card computation
  - Admin binary tree init cycle thresholds

## User + Admin Account Overview Trend Percentages (2026-02-22)

- User-side and admin-side `Account Overview` `%` chips are now data-driven from previous-vs-current values.
- Metrics now tracked for trend output:
  - `Total Organization BV`
  - `New Members`
  - `Total Direct Sponsors`
- Trend state is persisted in browser storage and scoped by signed-in identity:
  - user key: `charge-account-overview-trend-v1`
  - admin key: `charge-admin-account-overview-trend-v1`
- Badge state now reflects real movement:
  - positive growth (success)
  - negative growth (danger)
  - no change (info)
- Directional icon support is now applied on both shells:
  - up-right arrow for uptrend
  - down-left arrow for downtrend
  - right arrow for flat/no-change trend

## User + Admin Account Overview Metric Scope Fix (2026-02-22)

- Fixed double-counting on both shells for:
  - `New Members`
  - `Total Direct Sponsors`
- Root cause:
  - rollup logic was adding binary-summary counts and direct-member list counts together.
- Updated behavior:
  - when binary summary is available, cards now use summary-driven values directly.
  - before summary is ready, cards fall back to direct sponsor count only.
- Organization scoping update:
  - binary tree hydration now builds from each account's sponsor network (direct sponsors + their downline), not just direct-only list on member shell.
  - this aligns `Total Organization BV` with the requested scope: personally sponsored network volume.

## User Binary Placement + Root Node UX Rules (2026-02-22)

- User-side Binary Tree root node now uses member context wording:
  - root display name is `You`
  - root username is shown as subtitle on the root node
- User-side Selected Node panel now shows `Account Rank` in place of the previous cycle value slot.
- User-side tree renderer now runs in rank-secondary mode:
  - node secondary line and search-result secondary tag display `Rank ...` instead of `Cycles ...`
- Placement rule hardening for member enrollments:
  - spillover is blocked unless the enrolling user already has at least one direct child
  - spillover target must match one of the enrolling user's own direct child references
  - reverse placement to uplines/foreign branches is rejected
- Server-side guardrails were added to mirror the same non-admin rule path (API-level validation), so bypassing the form UI cannot create invalid reverse placements.

## Admin Binary UX Parity Update (2026-02-22)

- Owner-approved parity applied to admin binary presentation:
  - root node now shows `You` with admin username as subtitle
  - selected-node secondary metric label now shows `Account Rank`
  - admin binary renderer now uses rank-secondary mode (`Rank ...`) in node visuals, search results, and selected-node value
- Admin placement authority remains unchanged:
  - admin still retains unrestricted placement capability for company-root operations
  - no new admin spillover restriction was introduced in this parity patch

## Binary Load Reliability Hotfix (2026-02-22)

- Fixed intermittent Binary Tree load failure on routed pages (notably admin routes) after flush/reload.
- Root cause:
  - dynamic module import used relative path (`./binary-tree.mjs`) which could resolve to route-scoped URLs such as `/admin/binary-tree.mjs`.
- Update applied:
  - switched runtime binary module import to absolute path: `/binary-tree.mjs`
  - applied on both user shell and admin shell for route-safe loading.
  - switched Pixi asset script to absolute path: `/vendor/pixi.min.js`
  - applied on both user shell and admin shell to prevent route-relative `/admin/vendor/...` 404s.

## Binary Sponsor Placement Fix (2026-02-22)

- Fixed tree rebuild placement behavior where non-spillover enrollments could be attached from root instead of from their actual sponsor/upline node.
- Root cause:
  - placement fallback parent defaulted to `root` when `placementLeg` was not spillover.
- Updated behavior:
  - default placement parent now resolves to sponsor node (`sponsorUsername`) for standard left/right enrollments.
  - spillover still respects explicit `spilloverParentReference`; if missing/unresolved, it falls back to sponsor node (not root).
- Result for reported scenario:
  - admin root keeps only directly enrolled member (`sethfozz`) on left leg
  - Seth's own enrollees (`seth`, `fozz`) remain under Seth's left/right legs instead of leaking into admin root right leg.

## Binary Rank Source Correction (2026-02-22)

- Removed `Unranked`/placeholder behavior for binary node rank display.
- Rank resolution now follows package-bound starting ranks from business logic:
  - Personal Builder Pack -> Personal Pack
  - Business Builder Pack -> Business Pack
  - Infinity Builder Pack -> Infinity Pack
  - Legacy Builder Pack -> Legacy Pack
- Tree node rank source order (both user/admin):
  - explicit account rank (`accountRank` / `rank`) from user store
  - fallback to package-bound starting rank
- Added rank lookup API for shell sync:
  - `GET /api/member-ranks` (minimal rank-safe projection from `mock-users.json`)
- New enrollments now persist package-bound starting rank server-side on both:
  - user record (`mock-users.json`)
  - registration record (`registered-members.json`)

## Fast Track Tier Naming Update (2026-02-22)

- Renamed visible tier/rank label from `Achievers Pack` to `Infinity Pack`.
- Applied on both shells and API-backed rank projection:
  - `index.html`
  - `admin.html`
  - `serve.mjs`
- Compatibility note:
  - legacy `Achievers Pack` rank values are normalized to `Infinity Pack` for display.

## Binary Node Content + Country Flag Field (2026-02-22)

- Applied on both user and admin sides:
  - Node card content standardized to:
    - display name
    - `@username`
    - `Active/Inactive`
    - `L` and `R` BV
    - `Account Rank`
    - `Country Flag`
- Removed `Building` wording from binary node/search state labels.
- Added `Country Flag` as a required field in `Enroll Member` forms (user + admin).
- Enrollment API now persists `countryFlag` and activity-window fields into member/user records.
- Purchase activity sync now updates `registered-members.json` activity timestamps so child-node active state can stay aligned.

## Binary Flag Label Position Tweak (2026-02-22)

- Updated binary node flag display on both user/admin trees:
  - removed `Flag` text label, icon-only output is now rendered
  - moved flag icon to bottom-right slot (previous eligibility/building position)

## Flag Icons Package + Node UI Optimization (2026-02-22)

- Integrated `flag-icons` package into runtime:
  - added dependency via npm
  - linked stylesheet into both dashboards:
    - `index.html`
    - `admin.html`
- Country flag values are now standardized as ISO country codes (`us`, `ph`, etc.) with backward emoji mapping for older records.
- Enroll Member country select now submits ISO codes on both shells.
- Binary node UI was optimized for readability and spacing:
  - larger card footprint
  - cleaner row spacing and typography balance
  - subtle divider for structured sections
  - flag rendered from `flag-icons` SVG asset in bottom-right slot
- Binary search rows now also render `flag-icons` visual markers.

## Binary Node Font Size Increase (2026-02-22)

- Increased binary node typography on both user/admin trees for better readability:
  - name/title text enlarged
  - detail rows (`@username`, leg BV, account rank) enlarged
  - status chip text slightly enlarged
- Adjusted node row Y-spacing so larger type does not overlap.

## Binary Username Row Spacing Fix (2026-02-22)

- Fixed cramped username-to-divider spacing in node cards (user + admin trees):
  - moved separator line lower
  - aligned horizontal padding to node text gutters
  - rebalanced BV/rank row offsets to preserve clean spacing under the divider

## Binary Rank Label Trim (2026-02-22)

- Updated node secondary metric text (user + admin trees):
  - removed `Account Rank:` prefix on node cards/search rows
  - now shows rank value only (for tighter layout spacing)

## Root Rank Binding Fix (2026-02-22)

- Root node rank source is now explicitly tied to authenticated account rank fields first (`rank` / `accountRank`), not only UI fallback text.
- Applied on both user and admin shells for tree root hydration:
  - seeds `currentAccountRank` from session rank when available
  - root node rank now resolves from session rank -> current rank -> fallback

## Selected Node Country Code Field (2026-02-22)

- Added `Country Code` field in the Selected Node panel on both user and admin tree views.
- Field is dynamically populated from the selected node??????????????????s country value and displayed as uppercase ISO code (example: `US`, `PH`).

## Node L/R Label Format + Gap Tuning (2026-02-22)

- Updated node L/R volume text format to include colons:
  - `L: <value> BV`
  - `R: <value> BV`
- Increased visual separation between L and R on node cards by using balanced left/right anchors on the same row.
- Applied the same colon format to binary search result chips for consistency.

## Binary Fullscreen Desktop Sheet UX Parity (2026-02-22)

- Fullscreen mode on desktop now follows the mobile binary-tree sheet interaction model.
- Applied on both user and admin shells:
  - `index.html`
  - `admin.html`
  - `binary-tree.mjs` controller behavior
- Updated fullscreen UX behavior:
  - Search opens as a bottom slide-up sheet from the floating `Search members` pill.
  - Node tap opens the Selected Node panel as a bottom sheet; dismiss/backdrop closes it.
  - Floating furthest-left/right and root-focus controls now sit above the search pill.
  - Minimap and the legacy fullscreen tool strip are hidden in fullscreen sheet mode.
- Scope note:
  - Change is fullscreen-only; standard non-fullscreen desktop tree layout remains unchanged.
- Validation:
  - `node --check binary-tree.mjs`
  - Inline script parse for `index.html` and `admin.html` passed.

## Desktop Fullscreen Minimap Toggle (2026-02-22)

- Added desktop fullscreen minimap toggle beside Home in the floating quick controls.
- Applied on both user/admin shells:
  - `index.html`
  - `admin.html`
  - `binary-tree.mjs`
- Behavior:
  - Minimap appears at bottom-left in desktop fullscreen.
  - Toggle button controls show/hide state and persists in tree UI local storage.
  - Mobile fullscreen remains unchanged (minimap still hidden there).
- Validation:
  - `node --check binary-tree.mjs`
  - Inline script parse for `index.html` and `admin.html` passed.

## Desktop Minimap Settings Presets (2026-02-22)

- Added minimap settings gear in desktop fullscreen minimap panel.
- Added selectable minimap size presets:
  - Small (default)
  - Medium
  - Large
- Applied on both user/admin shells:
  - `index.html`
  - `admin.html`
  - `binary-tree.mjs`
- Behavior:
  - Selected minimap size persists in tree UI local storage.
  - Preset controls update minimap panel width and canvas height.
  - Settings menu closes on outside tap and Escape key.
- Validation:
  - `node --check binary-tree.mjs`
  - Inline script parse for `index.html` and `admin.html` passed.

## Desktop Minimap Height Increase (2026-02-22)

- Increased desktop fullscreen minimap height presets to reduce the stretched-rectangle look.
- Applied on both user/admin shells:
  - `index.html`
  - `admin.html`
- Updated preset heights:
  - Small: `11.5rem`
  - Medium: `13.75rem`
  - Large: `16rem`
- Validation:
  - Inline script parse for `index.html` and `admin.html` passed.

## Fullscreen Header Time/Cut-Off Component (2026-02-22)

- Fullscreen binary-tree header now uses a live `Server Time / Cut-Off` chip instead of the static `Binary Tree` title block.
- Applied on both user/admin shells:
  - `index.html`
  - `admin.html`
  - `binary-tree.mjs`
- Scope:
  - Desktop fullscreen: enabled
  - Mobile fullscreen: enabled
  - Non-fullscreen: unchanged (title remains)
- Validation:
  - `node --check binary-tree.mjs`
  - Inline script parse for `index.html` and `admin.html` passed.

## Fullscreen Header Top Anchor Alignment (2026-02-22)

- Refined fullscreen header so top-left time chip and top-right fullscreen action align on the same top anchor.
- Applied on both user/admin shells:
  - `index.html`
  - `admin.html`
- Implementation notes:
  - Introduced `#tree-header-actions` wrapper.
  - Fullscreen header uses top-aligned flex behavior to improve visual balance.
- Validation:
  - Inline script parse for `index.html` and `admin.html` passed.

## Binary Tree Non-Fullscreen Summary Redesign (2026-02-22)

- Replaced generic non-fullscreen Binary Tree top area with dashboard-style summary cards.
- Added live binary KPI cards on both user/admin shells:
  - Network Members
  - Estimated Cycles
  - Left Leg BV
  - Right Leg BV
  - plus live submetrics (new members, direct sponsors, cycle rule, rank)
- Added `View Fullscreen` button in the new summary area to keep fullscreen entry accessible.
- Hid legacy `tree-header-bar` and `tree-tools-dock` in non-fullscreen mode only.
- Fullscreen behavior remains intact (existing fullscreen header/tools/minimap stack still used).
- Applied files:
  - `index.html`
  - `admin.html`
- Validation:
  - Inline script parse for `index.html` and `admin.html` passed.

## Binary Tree Non-Fullscreen Cards + Canvas Fullscreen CTA Refinement (2026-02-22)

- Moved Binary Tree summary cards outside `#binary-tree-panel` so they read as page-level KPIs.
- Removed the extra in-component header/title (`Binary Tree Summary`) to avoid duplicate heading hierarchy.
- Redesigned cards with icon-led visual styling to reduce generic appearance.
- Moved non-fullscreen fullscreen action into the tree render area (top-right overlay on canvas shell).
- Fullscreen overlay button now auto-hides while in fullscreen mode.
- Applied on both shells:
  - `index.html`
  - `admin.html`
- Validation:
  - Inline script parse for `index.html` and `admin.html` passed.

## Account Overview Rank-From-Package Polish (2026-02-22)

- Polished Account Overview `Account Rank` behavior so rank is package-driven and consistently normalized.
- Canonical starting ranks are now:
  - `Personal`, `Business`, `Infinity`, `Legacy`
- Applied across:
  - `index.html`
  - `admin.html`
  - `serve.mjs`
- Dashboard card polish:
  - Account Rank card now shows source package label (`Assigned from package: ...`).
- Enrollment feedback polish:
  - Submit success now includes assigned rank for the enrolled member.
- Compatibility handling:
  - Older `Starter`/legacy rank values now fall back to package-derived rank in session/member-rank responses.
- Validation:
  - `node --check serve.mjs`
  - Inline script parse for `index.html` and `admin.html` passed.

## Account Rank Upgrade CTA + API (2026-02-22)

- Dashboard `Account Rank` card copy updated to:
  - `Complete your Task to Rank up! Next rank: Ruby`
- Removed package-source label rendering in the card.
- Added conditional upgrade action for members below Legacy:
  - In-card upgrade button + hint + inline feedback.
  - Hidden automatically when member is already at Legacy package tier.
- Added backend account upgrade endpoint:
  - `POST /api/member-auth/upgrade-account`
  - Enforces one-way tier progression only (no downgrades):
    - Personal -> Business -> Infinity -> Legacy
  - Updates user + registered member records with upgraded package/rank values.
  - Carries PV/BV upgrade gain into binary/upline rollups via `packageBv` update.
- Applied files:
  - `index.html`
  - `serve.mjs`
- Validation:
  - `node --check serve.mjs`
  - Inline script parse for `index.html` passed.

## Account Rank Card Selectable Upgrade + Dynamic Helper Text (2026-02-22)

- Upgraded Account Rank card UX on dashboard:
  - Users below Legacy can now choose any higher package tier from a selector.
  - Upgrade is no longer limited to only the immediate next package in UI.
- Dynamic helper copy rules are now enforced:
  - Legacy rank: `Complete your Task to Rank up! Next rank: Ruby`
  - Below Legacy: `Upgrade your account to maximize your commission`
- Backend upgrade API enhancement:
  - `POST /api/member-auth/upgrade-account` accepts `targetPackage`.
  - Same-tier/downgrade requests are blocked; only higher tiers are allowed.
  - If `targetPackage` is missing, API still defaults to next tier (backward compatibility).
- Applied files:
  - `index.html`
  - `serve.mjs`
- Validation:
  - `node --check serve.mjs`
  - Inline script parse for `index.html` passed.

## Dashboard Sales Team Commissions Card (2026-02-22)

- Replaced top-row Dashboard card:
  - Removed `Account Status` (`Active`)
  - Added `Sales Team Commissions`
- Card now shows commission-through-cycles using package-specific cycle multiplier profile (per business logic section 4 / line 81+, multiplier table line 103):
  - Personal: 5% / $25 / 50-cycle cap
  - Business: 7.5% / $37.5 / 250-cycle cap
  - Infinity: 10% / $50 / 500-cycle cap
  - Legacy: 12.5% / $62.5 / 1000-cycle cap
- Card outputs:
  - Current cycle commission amount
  - Multiplier badge (%)
  - Per-cycle value
  - Monthly cap value
  - Cap usage summary + progress bar
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed.

## User Dashboard Infinity Builder Card (2026-02-22)

- Replaced Dashboard `Month vs Month` with `Infinity Builder` on user side.
- Node model is now explicit ternary-per-tier:
  - `1 parent`
  - `3 children`
  - `9 grandchildren`
  - `27 great-grandchildren`
  - total `4` nodes per tier card (1 sponsor + 3 downline, reduced from 40 per owner request 2026-02-22).
- Data source is sponsor graph from the existing Binary Tree runtime (`binaryTreeMockData`) in a unilevel perspective.
- Sponsor interpretation now matches owner clarification:
  - spillover members with `sponsorId === root` are treated as direct sponsors for tier seeding.
- Tier logic now:
  - direct sponsors are grouped into batches of `3` (`Tier 1`, `Tier 2`, ...),
  - each tier traverses sponsor descendants from those 3 seeds,
  - lit-node cap is `4` per tier (3 excluding user),
  - completed tier marks bonus-ready at `$150`.
- New user dashboard bindings:
  - `#infinity-builder-direct-sponsors`
  - `#infinity-builder-active-tiers`
  - `#infinity-builder-completed-tiers`
  - `#infinity-builder-claimable-bonus`
  - `#infinity-builder-tier-cards`
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed.

## User Infinity Builder Swipe Layout Refinement (2026-02-22)

- Infinity Builder tier container is now swipe-oriented and card-based (horizontal snap carousel) for mobile portrait support.
- Default experience now supports 2 tier groups immediately in the carousel.
- Progression behavior:
  - Tier 1 and Tier 2 are visible by default.
  - higher tiers unlock as preceding tier completion requirements are met.
- Added tier carousel navigation controls:
  - previous/next buttons
  - pagination dots
  - swipe/scroll-snap alignment with active-card state.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed.

## User Infinity Builder Seed/Node Visual Upgrade (2026-02-22)

- Redesigned tier node area to emphasize the first seed structure:
  - `1 Parent + 3 Child` now has a dedicated highlighted blueprint with connector lines.
- Optimized remaining node visualization:
  - split into `9 + 27` grouped blocks (`Level 3 Cluster`, `Level 4 Network`) instead of generic uniform node rows.
- Increased node-area/card footprint for readability on mobile and desktop:
  - larger tier card width profile and taller minimum height.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed.

## User Infinity Builder Fit + Connector Style Refinement (2026-02-22)

- Refined Infinity Builder tier-card/carousel sizing to reduce wide-card feel and prevent visible horizontal bar clutter on the parent shell.
- Added carousel scrollbar hiding + containment behavior for cleaner swipe UX.
- Adjusted seed connector lines to a curved branch style and binary-tree link tone for better visual consistency with Binary Tree.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed.

## User Infinity Builder Full Usability Redesign (2026-02-22)

- Replaced the previous multi-card swipe layout with a simpler tier-tab workflow:
  - top tier tabs
  - single focused tier detail panel
  - previous/next tier navigation buttons.
- New selected-tier panel is step-based and user-friendly:
  - Step 1 (`1 Parent + 3 Children`)
  - Step 2 (`9 + 27 expansion nodes`)
  - clear progress bars and status labels.
- Connector visuals were aligned to binary-tree footprint using curved branch lines and matching link-tone styling.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed.

## User Infinity Builder Simplification (2026-02-22)

- Simplified selected-tier content to reuse main dashboard-style metric cards.
- Step model is now minimal and clearer:
  - Step 1: `3` direct child indicators that light up as the tier seeds.
  - Step 2: one progress bar for all remaining nodes (`36`) needed to complete the tier.
- Removed detailed `9 + 27` dot-cluster visuals and connector-heavy rendering from the tier panel.
- Retained:
  - tier tabs + prev/next controls
  - total tier progress bar
  - seed sponsor chips/status messaging.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed.

## User Dashboard Rollback to Budget Progress (2026-02-22)

- Scrapped the full bottom-left `Infinity Builder` container UI.
- Replaced it with a `Budget Progress` module based on `screenshot-desktop-win-like.png`:
  - category budget cards with progress bars
  - `Month vs Month` comparison side panel
  - month label (`February 2026`) in the section header.
- Infinity Builder JS logic remains in runtime codebase but is inert on the dashboard because its target DOM ids were removed.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed.

## User Infinity Builder Tier Cards (Budget-Style Layout) (2026-02-22)

- Clarified direction and reworked Infinity Builder to keep system behavior while adopting the visual layout style of Budget Progress.
- Tier groups now render as budget-like cards:
  - each card = one tier group
  - card shows tier progress (`lit/40`), progress strip, and short tier-state caption
  - selected tier card expands to full row emphasis on `sm+` breakpoints.
- Right panel now acts as tier snapshot:
  - status badge
  - seed progress (`0-3`)
  - remaining node progress (`0-36`)
  - total tier completion (`0-40`)
  - seed sponsor handles.
- Infinity Builder controls retained:
  - click tier card to focus
  - previous/next buttons for sequential navigation.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed.
  - `temporary screenshots/screenshot-37-infinity-tier-cards-layout.png` captured after auth.

## User Infinity Builder Card Simplification (3 Seed Lights) (2026-02-22)

- Finalized user-requested visual direction:
  - keep budget-card look
  - remove side snapshot complexity
  - show only tier cards with `3` seed nodes that light up.
- Current Infinity Builder card behavior:
  - `Tier N` label + accent dot
  - `lit / 40` primary value
  - progress bar for total tier completion
  - helper line for lock/remaining/completed state
  - `3` seed-node lights (`0-3` lit) per card.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed.
  - `temporary screenshots/screenshot-38-infinity-tier-cards-3nodes.png` captured after auth.

## User Infinity Builder Eligibility Gate (Infinity and Above) (2026-02-22)

- Enforced MLM rule on dashboard: only `Infinity` and `Legacy` ranks can participate in Infinity Builder.
- Non-eligible ranks (e.g., `Personal`, `Business`) now see:
  - locked-state Infinity Builder card
  - current rank label
  - participation requirement message (`Infinity and above`).
- Eligible ranks continue to see the simplified budget-style tier cards with 3 seed lights.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed.
  - Locked-state visual check captured: `temporary screenshots/screenshot-39-infinity-eligibility-locked.png`.

## Legacy Leadership Bonus Naming Alignment (2026-02-22)

- Polished naming across the new tier-card component:
  - `Infinity Builder` (UI copy) renamed to `Legacy Leadership Bonus`.
  - Locked-state title and eligibility copy now reference `Legacy Leadership Bonus`.
- Kept existing runtime ids/functions for stability; this change is user-facing copy alignment.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed.
  - Authenticated UI screenshot: `temporary screenshots/screenshot-41-legacy-leadership-bonus-dashboard.png`.

## Infinity Tier Commission Naming Correction (2026-02-22)

- Final naming correction applied:
  - `Legacy Leadership Bonus` -> `Infinity Tier Commission`
- Updated dashboard copy:
  - section title
  - locked-state title
  - eligibility sentence.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed.

## Infinity Tier Commission Anticipation Card (Locked Tier Preview) (2026-02-22)

- Added a default locked preview card for the next tier (anticipation state).
- Tier list now shows one additional future tier card by default:
  - example: `Tier 3` appears locked even before unlock.
- Locked preview card copy:
  - `Complete the requirements to unlock Tier 3.`
- Locked preview visuals:
  - `Locked` badge
  - `0 / 40`
  - unlit 3-seed indicators.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed.
  - Authenticated screenshot captured: `temporary screenshots/screenshot-43-tier3-anticipation-visible.png`.

## Infinity Tier Commission 10-Tier Server Mockup (2026-02-22)

- Applied a temporary live mockup so owner can inspect high-card-count behavior directly on server.
- Mock mode is currently enabled and renders 10 cards:
  - Tier 1 complete
  - Tier 2 in progress
  - Tier 3 partially seeded
  - Tier 4 to Tier 10 locked anticipation.
- This is intentionally reversible via one toggle:
  - `INFINITY_BUILDER_MOCKUP_MODE_ENABLED`
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed.
  - Authenticated screenshot: `temporary screenshots/screenshot-48-tier10-server-mockup-live.png`.

## Infinity Tier Commission Claim + Archive + Paging (2026-02-22)

- Added component-level workflow controls:
  - `View` dropdown with `Active` and `Completed`
  - claimable commission text (`Unclaimed Commission`)
  - pagination controls (6 cards per page).
- Active rules:
  - shows only non-claimed tier cards
  - completed but unclaimed tiers remain visible and claimable.
- Completed rules:
  - shows claimed-tier archive only
  - includes `Date Started` and `Date Claimed` per tier entry.
- Claim action:
  - `Claim Infinity Builder Commission` button marks tier as claimed
  - claimed tiers are hidden from Active and appear in Completed archive
  - claim records are stored in local storage by user key.
- Button placement refinement:
  - claim button is now middle-right, above seed/progress area.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed.
  - Screenshots:
    - Active page 1: `temporary screenshots/screenshot-53-claim-archive-active-page1-clean.png`
    - Active page 2: `temporary screenshots/screenshot-54-claim-archive-active-page2-clean.png`
    - Completed archive: `temporary screenshots/screenshot-55-claim-archive-completed-with-record.png`
    - Middle-right claim button placement: `temporary screenshots/screenshot-56-claim-button-middle-right.png`

## Dashboard Stretch Fix for 10-Tier Mockup (2026-02-22)

- Fixed top-row stretch issue affecting:
  - `Account Overview`
  - `Quick Actions` stack
- Cause:
  - equal-height desktop row template (`lg:grid-rows-2`) forced row 1 to match row 2 height.
- Resolution:
  - removed `lg:grid-rows-2` so rows auto-size to content.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed.
  - Authenticated screenshot: `temporary screenshots/screenshot-49-tier10-grid-stretch-fix.png`.

## Infinity Builder Mock Reset for Claimed Tier Recovery (2026-02-22)

- Addressed accidental Tier 1 claim in mock mode where claim CTA disappeared from Active view.
- Added mock-only auto-reset behavior so tier-card mockup restarts clean on reload:
  - clears Infinity Builder claim records for current user
  - runs once per page load
  - leaves non-mock claim persistence unchanged.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed (`Parsed 1 inline script block(s) successfully.`).

## Infinity Builder Active Page Height Stabilization (2026-02-22)

- Resolved pagination UX issue where Infinity Tier Commission card area shrank on page 2 when fewer than 6 active tiers were rendered.
- Active-view pagination now pads short pages with invisible non-interactive filler cards so the component keeps page-1 height.
- Completed/archive view remains unchanged (no filler padding).
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed (`Parsed 1 inline script block(s) successfully.`).

## Infinity Builder Completed Archive Detail + View Filter Theme Match (2026-02-22)

- Expanded `Completed` tier cards with additional archive context:
  - completed nodes summary (`Completed Nodes`)
  - first 3 direct sponsors/child nodes as handle chips
  - existing started/claimed dates retained.
- Enhanced claim record payload so completed archive keeps sponsor/node snapshot fidelity:
  - stores `completedNodeCount`
  - stores first `3` `seedHandles` at claim time.
- Restyled `View` selector (`Active`/`Completed`) to match dashboard theme and avoid mismatched native webkit look:
  - `appearance-none` styled select
  - custom chevron icon
  - matched border/elevation/focus states.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed (`Parsed 1 inline script block(s) successfully.`).

## Infinity Builder Seed Row Sponsor Tags (2026-02-22)

- Updated active tier cards to replace plain 3-dot seed indicators with sponsor identity tags:
  - structure now follows `[colored dot + direct sponsor username]`
  - supports 3 slots per tier with `Open Slot` placeholders for unfilled seeds.
- Preserved `X/3 seed lit` status text.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed (`Parsed 1 inline script block(s) successfully.`).

## Infinity Builder Completed Empty-State Height Fix (2026-02-22)

- Resolved remaining layout issue where `Completed` view collapsed when no claimed tier cards existed.
- Added an empty-state card plus hidden filler cards so component height remains aligned to 6-card page footprint.
- Extended filler padding behavior to both `Active` and `Completed` paginated renders for consistent container sizing.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed (`Parsed 1 inline script block(s) successfully.`).

## Infinity Builder Theme-Matched Unique Tier Palettes (2026-02-22)

- Added deterministic per-tier palette mapping so each tier card has a unique accent while staying within current dashboard brand family (teal/cyan/blue tones).
- Palette now drives:
  - tier header dot
  - progress bar fill
  - sponsor seed tags and chip accents
  - completed archive badge/amount highlights
  - claim CTA tint for completed tiers.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed (`Parsed 1 inline script block(s) successfully.`).

## Infinity Builder Mobile Stretch Fix (2026-02-22)

- Fixed mobile stretch behavior in Infinity Tier Commission component.
- Root adjustments:
  - hidden filler cards are now desktop-only (`hidden sm:block`) to avoid oversized empty vertical space on small screens.
  - sponsor/tag text now truncates with max widths to prevent layout expansion on narrow devices.
  - claim CTA got mobile width/text-size constraints to prevent overflow pressure.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed (`Parsed 1 inline script block(s) successfully.`).
  - Mobile viewport screenshot captured:
    - `temporary screenshots/screenshot-60-mobile-infinity-responsive-fix.png`

## Infinity Builder View Label Update (2026-02-22)

- Updated Infinity Builder view-mode naming in UI:
  - `Active` -> `Building`.
- Aligned related user-facing copy:
  - `active tiers` -> `building tiers`
  - `No active tiers available` -> `No building tiers available`
  - empty-state helper copy now references `Building tier groups`.
- Internal value key remains `active` for compatibility with existing logic.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed (`Parsed 1 inline script block(s) successfully.`).

## Infinity Tier Commission Summary Card Inside Component (2026-02-22)

- Added a Fast Track-style summary card directly inside the Infinity Tier Commission component (below component header).
- Card now displays Infinity Builder commission balance/state using the existing unclaimed commission computation.
- Status behavior:
  - `Locked` when not eligible
  - `Building` when eligible but no unclaimed commission
  - `Available` when claimable commission exists.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed (`Parsed 1 inline script block(s) successfully.`).
  - Authenticated screenshot:
    - `temporary screenshots/screenshot-61-infinity-component-copied-card.png`

## Infinity Tier Commission Claim-Transfer Logic Fix (2026-02-22)

- Adjusted summary card commission source to match expected flow:
  - claiming a completed tier now transfers value into `Infinity Tier Commission` card balance.
- Current split:
  - `Unclaimed Commission` (component header): still tracks completed but unclaimed tiers.
  - `Infinity Tier Commission` summary card: now tracks claimed commission balance.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed (`Parsed 1 inline script block(s) successfully.`).

## Infinity Builder Terminology Adjustment (2026-02-22)

- Updated tier-card copy to use `Direct Sponsorship slot` language instead of `seed` language.
- Applied to:
  - slot-left helper text
  - `X/3 ... lit` labels
  - placeholder/filler-card label
  - component subtitle text.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed (`Parsed 1 inline script block(s) successfully.`).

## Infinity Builder Metric Label Copy Update (2026-02-22)

- Updated tier metric copy:
  - `3/3 Direct Sponsorship slots lit` -> `3/3 Direct Sponsorships Requirements`
- Applied to both active tier cards and filler/placeholder cards for consistency.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed (`Parsed 1 inline script block(s) successfully.`).

## Infinity Builder Locked-Tier Copy Rule Update (2026-02-22)

- Locked tier helper copy now references the tier immediately before it.
- New pattern:
  - `Complete the requirements of Tier N to Unlock Tier N+1`
- Example:
  - Tier 4 locked -> `Complete the requirements of Tier 3 to Unlock Tier 4.`
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed (`Parsed 1 inline script block(s) successfully.`).

## Infinity Builder Header/Card Layout Polish (2026-02-22)

- Removed the old component header text block (title + subtitle + unclaimed line).
- Infinity Builders summary card now serves as the top/header presentation inside the component.
- Moved `View` dropdown controls down below the summary card and above the tier-card grid.
- Updated default summary-card footnote copy to match claim-transfer behavior.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed (`Parsed 1 inline script block(s) successfully.`).

## Infinity Builder View Controls as Radio Buttons (2026-02-22)

- Replaced `View` dropdown with dedicated mode buttons in a radio group:
  - `Building`
  - `Completed`
- Updated interaction logic to use radio `change` events and render-time checked-state syncing.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed (`Parsed 1 inline script block(s) successfully.`).

## Infinity Builder Data Source Reverted (2026-02-22)

- Reverted Infinity Builder from mock snapshot mode back to original data source.
- Updated toggles:
  - `INFINITY_BUILDER_MOCKUP_MODE_ENABLED = false`
  - `INFINITY_BUILDER_MOCKUP_RESET_CLAIMS_ON_LOAD = false`
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed (`Parsed 1 inline script block(s) successfully.`).

## Infinity Builder Claim State Reconciliation (2026-02-22)

- Added automatic cleanup for stale claimed-tier records when live tier completion no longer matches stored claims.
- Current behavior:
  - keeps claim records only for tiers that are currently completed in live/original data
  - removes invalid claim records automatically during Infinity Builder render.
- This resets inflated/leftover claimed bonus cases from mock/testing state transitions.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed (`Parsed 1 inline script block(s) successfully.`).

## User Dashboard: Legacy Leadership Bonus UI Duplicate Added (2026-02-22)

- User-side dashboard now includes a second bonus component directly under Infinity Tier Commission.
- The new component is labeled:
  - `Legacy Leadership Bonus`
- Layout/sizing was matched to the Infinity Builder component by reusing the same card structure/classes.
- Collision safety:
  - duplicated element ids/input names were renamed with `legacy-leadership-*` prefixes.
- Current scope:
  - UI duplication only; no separate Legacy Leadership business/data binding has been added yet.
- Applied file:
  - `index.html`

## User Dashboard: Legacy Leadership Bonus Logic Wiring + Package Gate (2026-02-22)

- Legacy Leadership Bonus is now fully wired with the same runtime behavior model as Infinity Tier Commission:
  - Building/Completed mode switching
  - pagination
  - claim/archive records
  - summary-card status/value updates.
- Legacy Leadership now has isolated claim persistence:
  - `charge-legacy-leadership-claims-v1`
- Tier-population rule added for Legacy Leadership:
  - seed/direct sponsorship slots count only members enrolled with `legacy-builder-pack`.
- Supporting data update:
  - binary tree node records now carry normalized `enrollmentPackage` metadata used by bonus snapshot filtering.
- Sync behavior:
  - both bonus components rerender together on initial load, tree sync, and enrollment-derived recalculations.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed (`Parsed 2 inline script block(s) successfully.`).

## User Dashboard: Bonus Container Size Trim (2026-02-22)

- Addressed oversized stacked height on:
  - `Infinity Tier Commission`
  - `Legacy Leadership Bonus`
- Removed hidden filler-card padding from both component render paths (empty and paginated states).
- Both containers are now content-height driven and no longer force a large fixed card footprint.
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed (`Parsed 2 inline script block(s) successfully.`).

## User Dashboard: Bonus Span Correction Pass 2 (2026-02-22)

- Post-screenshot correction applied to resolve remaining vertical span/stretch in stacked bonus containers.
- Layout updates:
  - stacked wrapper now uses `self-start`
  - removed `h-full` from Infinity and Legacy bonus outer shells.
- Screenshot validation:
  - `temporary screenshots/screenshot-64-dashboard-span-fix-2.png`
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed (`Parsed 2 inline script block(s) successfully.`).

## User Dashboard: Infinity Builder Rule Update + Weekly 1% Override (2026-02-22)

- Scope confirmed by owner:
  - **user-side only** for this update.
- Infinity Builder eligibility now requires both:
  - `Infinity/Legacy` rank gate
  - `3` direct enrollments to Infinity Pack and above (`infinity-builder-pack` / `legacy-builder-pack`).
- Infinity Builder tier seeding now uses Infinity+ direct package filter.
- Added weekly override commission to Infinity Builder balance:
  - direct enrolled users only
  - direct user must also be Infinity Builder eligible/completed
  - payout base = direct user organization BV events (`packageBv`)
  - rate = `1%`
  - cycle timing = weekly cutoff (server cutoff config)
  - payout mode = auto-added (no manual claim)
  - retroactive historical closed-cycle volumes included.
- Legacy Leadership card **no longer shares** Infinity Builder eligibility ?????????????????? has its own independent eligibility system:
  - `LEGACY_LEADERSHIP_ELIGIBLE_RANKS = new Set(['legacy'])` ?????????????????? only Legacy rank qualifies (not Infinity)
  - `LEGACY_LEADERSHIP_DIRECT_ENROLLMENT_REQUIREMENT = 3` ?????????????????? counts Legacy Package enrollments only
  - Separate functions: `resolveLegacyLeadershipEligibility()`, `getLegacyLeadershipQualifiedDirectEnrollmentsForSponsor()`, `buildLegacyLeadershipEligibilityRequirementMessage()`
  - Infinity Pack users now correctly see Legacy Leadership as **Locked**
- Screenshot validation:
  - `temporary screenshots/screenshot-65-infinity-weekly-override.png`
- Applied file:
  - `index.html`
- Validation:
  - Inline script parse for `index.html` passed (`Parsed 2 inline script block(s) successfully.`).

## User Dashboard: Infinity Builder Active Tier Card ?????????????????? Per-Node Eligibility Indicators (2026-02-22)

- Active (claimed) tier cards now show per-sponsor eligibility indicators:
  - **Green/lit** sponsor chip = sponsor has met their 3-enrollment requirement = user is earning 1% weekly override from them
  - **Gray/dim** sponsor chip = sponsor hasn't met requirement = not earning 1%
- New utility: `findRegisteredMemberByHandle()` looks up member objects from handle strings
- New constants: `SPONSOR_NODE_ELIGIBLE_PALETTE` (green), `SPONSOR_NODE_INELIGIBLE_PALETTE` (gray)
- Hover tooltip on each chip shows status: "Active ?????????????????? earning 1%" or "Inactive ?????????????????? not earning 1%"
- Small legend row below sponsor chips for at-a-glance reference
- **Legacy Leadership Bonus:** excluded from this change per owner instruction
- Applied file: `index.html`
- Validation: Parsed 4 inline script block(s) successfully.

## Binary Tree Sync + Spillover Privacy/Cycle Update (2026-02-23)

- User and admin binary tree builders were aligned to placement-driven graph construction.
- User-side binary tree now scopes by receiving-parent placement subtree, so spillover-received nodes are visible in the receiver tree even when sponsor/upline differs.
- User-side node identity privacy now applies in binary tree views:
  - node labels are anonymized (`Spillover Direct`, `Direct Sponsor`, `Network Member`)
  - personal names/usernames are hidden in node/search/selected-panel outputs
  - rank + left/right BV remain visible.
- Cycle-volume propagation engine in `binary-tree.mjs` now counts placement subtrees for leg totals:
  - spillover-received volume contributes to receiver cycle pairing as intended.
  - sponsor-only spillover reference fields remain available but are excluded from cycle-leg totals to avoid double-counting.
- Admin binary tree now builds from full global placement graph (company root scope), improving sync with user-side network progression.
- Applied files:
  - `index.html`
  - `admin.html`
  - `binary-tree.mjs`
- Validation:
  - `index.html` inline scripts parsed successfully (`2` blocks)
  - `admin.html` inline scripts parsed successfully (`2` blocks)

## User Binary Privacy Refinement: Spillover Branch-Only Masking (2026-02-23)

- User-side Binary Tree privacy masking was narrowed from global node anonymization to spillover-branch-only anonymization.
- Current behavior:
  - root spillover direct branches (received from upline) are anonymized
  - personally enrolled direct branches remain visible.
- Masking scope logic:
  - detect root spillover direct node(s)
  - anonymize only those node(s) and all descendants in their placement subtree.
- Display labels in masked area:
  - `Spillover Direct N`
  - `Spillover Network N`
- Cycle/BV behavior unchanged by this refinement:
  - spillover branch BV still participates in placement-leg cycle matching.
- Applied files:
  - `index.html`
- Validation:
  - `index.html` inline scripts parsed successfully (`2` blocks)

## Binary Tree Fullscreen Selected Node Spillover Privacy Update (2026-02-23)

- Selected-node panel now masks spillover sponsor identity:
  - `Direct Sponsor` shows `Anonymous` for spillover nodes and navigation is disabled.
- Placement parent display now includes a UI fallback resolver:
  - prefers `placementParentId`
  - falls back to detected parent from left/right child linkage for spillover consistency.
- Binary node metadata visibility tightened:
  - rank hidden for spillover/anonymized nodes in rank mode
  - country hidden for spillover/anonymized nodes in node cards, search rows, and selected panel.
- Applied file:
  - `binary-tree.mjs`
- Validation:
  - `node --check binary-tree.mjs` passed.

## Binary Tree Spillover Sponsor Display Bug Fix (2026-02-23)

- Fixed user-tree normalization so spillover nodes with hidden/out-of-scope sponsors are not remapped to the viewer/root as sponsor.
- This prevents Selected Node from incorrectly showing `Direct Sponsor: You (@...)` for spillover nodes.
- Spillover flag is now preserved through normalization even when sponsor identity is unresolved in scoped trees.
- Applied file:
  - `binary-tree.mjs`
- Validation:
  - `node --check binary-tree.mjs` passed.

## Binary Tree Spillover Node Violet Highlight (2026-02-23)

- Spillover nodes now render with violet styling for immediate visual distinction.
- Applied in shared node-card renderer:
  - violet spillover border
  - violet spillover background tint
  - brighter violet selected state for spillover nodes.
- Scope:
  - affects user/admin binary tree views, including fullscreen mode.
- Applied file:
  - `binary-tree.mjs`
- Validation:
  - `node --check binary-tree.mjs` passed.

## Binary Tree Spillover Color Scope Tuning (2026-02-23)

- Spillover node violet styling was toned down to a more subtle shade.
- Highlight scope is now perspective-aware:
  - user tree uses `received-only` spillover highlighting
  - admin tree disables spillover highlight.
- User-perspective behavior now matches expected flow:
  - sender account tree: spillover nodes render as regular nodes
  - receiver account tree: received spillover nodes render with violet distinction.
- Applied files:
  - `binary-tree.mjs`
  - `index.html`
  - `admin.html`
- Validation:
  - `node --check binary-tree.mjs` passed.

## Binary Tree Anonymous Scope Correction (2026-02-23)

- User-side anonymous mode now applies only to spillovers sourced from outside the current organization scope.
- Internal spillovers (sponsored by the user or downline within the same scoped tree) are no longer anonymized.
- Implemented via external-source spillover detection in `index.html` tree-scoping logic.
- Example alignment:
  - `sethfozz` perspective: internal spillover nodes remain visible.
  - receiver perspective (e.g., `seth`): outside-source spillover branches remain anonymized.
- Applied file:
  - `index.html`
- Validation:
  - `Parsed 2 inline script block(s) successfully.`
  - local data simulation confirmed `sethfozz` anonymized node count is `0`.

## Binary Tree Select Node Sync Update (2026-02-23)

- Select Node privacy rules are now synchronized with Binary Tree anonymization scope.
- Internal spillover nodes in the same organization are no longer forced to `Direct Sponsor: Anonymous`.
- Outside-org spillover nodes remain anonymized in Select Node.
- Applied file:
  - `binary-tree.mjs`
- Validation:
  - `node --check binary-tree.mjs` passed.

## Binary Tree Anonymous Mode: Viewer-Owned Downline Visibility (2026-02-23)

- Anonymous masking now supports owner-visibility exception on user side.
- In outside-source spillover branches, nodes enrolled by the logged-in user (and sponsor-downline descendants) remain visible.
- Outside-source nodes not owned by the viewer remain anonymous.
- Applied file:
  - `index.html`
- Validation:
  - `Parsed 2 inline script block(s) successfully.`
  - dataset simulation confirms `eaglethree` can see own enrolled node under anonymous branch.

## Binary Tree Fullscreen Header KPI Reuse (2026-02-23)

- Fullscreen Binary Tree header now includes compact KPI chips reusing page summary metrics:
  - Network Members
  - Account Rank
  - Estimated Cycles
  - Leg Volumes.
- Chips are timer-component sized and styled as header utilities.
- Mobile fullscreen keeps chips hidden for readability.
- Implemented on both user/admin shells with shared summary data wiring.
- Applied files:
  - `index.html`
  - `admin.html`
- Validation:
  - `index.html` inline scripts parsed successfully (`2` blocks)
  - `admin.html` inline scripts parsed successfully (`2` blocks)

## Fullscreen Header Metrics Swipe UX (2026-02-23)

- Server Time and fullscreen KPI chips are now grouped in one horizontal header rail.
- Added metric icons for faster scanability.
- Mobile fullscreen now supports horizontal swipe across chips in the server-time header zone.
- Implemented on both user/admin pages.
- Applied files:
  - `index.html`
  - `admin.html`
- Validation:
  - inline scripts parsed successfully on both files (`2` blocks each).

## Fullscreen Header Stacked Metric Cards (2026-02-23)

- Fullscreen Binary Tree header metrics were switched from a free horizontal rail to a single-card deck.
- UX now shows one metric card at a time with:
  - previous/next controls
  - touch swipe advancing one card per gesture
  - keyboard left/right support on focused deck container.
- Styled cards were updated to mirror dashboard card feel (icon tile, compact label/value hierarchy, accent glow).
- Implemented on both user and admin views for parity.
- Applied files:
  - `index.html`
  - `admin.html`
  - `binary-tree.mjs`
- Validation:
  - `node --check binary-tree.mjs` passed
  - inline script syntax checks passed on `index.html` and `admin.html` (`4` blocks each)

## Fullscreen Metrics: PC All-Cards + Mobile Dots (2026-02-23)

- Desktop fullscreen now renders all metric cards simultaneously in the header.
- Mobile fullscreen now uses:
  - stacked single-card view
  - swipe navigation
  - dot paginator below the card stack
  - no arrow buttons in layout.
- Header spacing was tuned so mobile cards gain width while keeping header actions intact.
- Applied files:
  - `binary-tree.mjs`
  - `index.html`
  - `admin.html`
- Validation:
  - `node --check binary-tree.mjs` passed
  - inline scripts parsed successfully on both HTML files (`4` blocks each)

## Binary Tree Summary Cards: Mobile Deck (Outside Fullscreen) (2026-02-23)

- Non-fullscreen Binary Tree summary cards now use mobile deck behavior:
  - one card visible at a time
  - swipe navigation
  - dot paginator below cards.
- Desktop/tablet retains the existing multi-card grid.
- Implemented on both user and admin pages.
- Applied files:
  - `index.html`
  - `admin.html`
- Validation:
  - inline scripts parsed successfully on both HTML files (`4` blocks each)

## Infinity Builder Tier-Claim Consistency Fix (2026-02-23)

- User issue addressed for `sethfozz` dashboard case:
  - Tier 2 showed `Open Slot 3` but could still be claimed.
- What changed (`index.html`):
  - Tier completion now strictly requires all 3 direct sponsorship seeds before `isCompleted` can become true.
  - Tier node progress is capped while direct requirement is incomplete to prevent false full-progress states.
  - Active-tier slot indicators now use actual direct `seedCount` (not inferred lit-node count), so open slots remain correctly unlit.
  - Same slot-indicator consistency patch applied to Legacy Leadership cards for parity.
- Expected outcome:
  - Infinity Builder Tier 2 remains non-claimable until all 3 direct slots are filled in the user-scoped binary tree.
  - Existing invalid claims are pruned by the existing claim reconciliation pass once tier completion no longer qualifies.
- Validation:
  - `index.html` inline scripts parsed successfully (`Parsed 1 inline script block(s) successfully.`).

## Infinity Builder Claimed-Tier Card UX Update (2026-02-23)

- User-requested Infinity Builder card customization implemented on user dashboard (`index.html`):
  - removed fixed tier amount display (`$150.00`) from claimed-tier cards
  - removed `Completed Nodes` section
  - relabeled sponsor section title to `Infinity Tier Commission`
  - added per-seeded-direct-sponsor mini snippets showing running organization BV and projected `1%` by cutoff.
- Added cutoff-aware per-direct helper for override projections:
  - `resolveInfinityBuilderDirectMemberRunningOverrideBreakdown(...)`
  - used in claimed-tier rendering and reused by the weekly override aggregate function for logic consistency.
- Expected outcome:
  - users can see per-seed projected earnings to the next cutoff directly inside each claimed tier card.
- Validation:
  - `index.html` inline scripts parsed successfully (`Parsed 1 inline script block(s) successfully.`).

## Infinity Builder Label/CTA Copy Tweak (2026-02-23)

- Updated Infinity Builder tier card copy (`index.html`):
  - claim button now reads `Claim $150.00 Commission`
  - archive/claimed state badge text now reads `Active` (was `Claimed`)
- Purpose:
  - align tier card wording with requested active-state terminology and explicit claim amount.
- Validation:
  - `index.html` inline scripts parsed successfully (`Parsed 1 inline script block(s) successfully.`).

## Tier Completed Copy Adjustment (2026-02-23)

- Updated completed-tier helper copy in `index.html`:
  - `Tier complete. $150.00 bonus ready.` -> `Tier Complete.`
- Applied to both Infinity Builder and Legacy Leadership tier card helper lines.
- Validation:
  - `index.html` inline scripts parsed successfully (`Parsed 1 inline script block(s) successfully.`).

## Tier Claim CTA Visual Parity Update (2026-02-23)

- Tier-card claim buttons were updated to use primary brand styling like `Request Payout` buttons.
- Applied on user-side `index.html` for:
  - Infinity Builder claim CTA
  - Legacy Leadership claim CTA
- Result:
  - claim CTAs now render in primary green with glow/hover/focus parity instead of per-tier accent tint.
- Validation:
  - `index.html` inline scripts parsed successfully (`Parsed 1 inline script block(s) successfully.`).

## Tier Date Completed Invoice Hook (2026-02-23)

- Added `Invoice` link placeholders next to `Date Completed:` in tier archive cards.
- Implemented on user-side `index.html` for:
  - Infinity Builder archive cards
  - Legacy Leadership archive cards
- Added future-component data hooks on each link:
  - invoice source (`infinity-builder` / `legacy-leadership`)
  - tier number
  - completed-at timestamp
- Validation:
  - `index.html` inline scripts parsed successfully (`Parsed 1 inline script block(s) successfully.`).

## Claim Action Auto-Navigation (2026-02-23)

- Claim action now auto-navigates users to the `Active` tier list after successful claim.
- Implemented in `index.html` for:
  - Infinity Builder claim handler
  - Legacy Leadership claim handler
- Navigation behavior:
  - switches mode to archive/active (`completed` value)
  - jumps to the last archive page to show newly claimed card immediately.
- Validation:
  - `index.html` inline scripts parsed successfully (`Parsed 1 inline script block(s) successfully.`).

## Account Overview BV Scope Separation (2026-02-23)

- Added `Personal Organization BV` as a dedicated subtext line under the `Total Organization BV` card in user `index.html`.
- Scope split now visible in-card:
  - `Total Organization BV` -> binary leg total (`left + right`)
  - `Personal Organization BV` -> sponsor-organization aggregate (from current sponsor tree traversal).
- Implementation:
  - new element id: `account-overview-personal-organization-bv`
  - populated in `renderOrganizationSummaryRollups()` using `getOrganizationMembersForCurrentSponsor()`.
- Validation:
  - `index.html` inline scripts parsed successfully (`Parsed 1 inline script block(s) successfully.`).

## Total Organization BV Helper Text Removed (2026-02-23)

- Removed the `Total Organization BV` helper copy line:
  - `Binary organization volume (left + right leg)`
- `Personal Organization BV` subtext remains visible as the context label.
- Validation:
  - `index.html` inline scripts parsed successfully (`Parsed 1 inline script block(s) successfully.`).

## Binary Tree Fullscreen Enroll Mode Restoration (2026-02-26)

- Restored fullscreen enroll-mode implementation after rollback.
- Current state:
  - `Enroll Member` toggle is in the fullscreen top control row (furthest controls cluster).
  - Anticipation nodes render only on parents with available child slots.
  - Anticipation spacing is expanded in enroll mode to reduce overlap.
  - Entire anticipation node cards are clickable (full hitbox).
  - Clicking anticipation nodes opens an in-fullscreen centered enroll modal (no route navigation).
  - Modal layout is responsive with constrained height + internal scroll for smaller heights.
  - Bottom search anchor/tools are suppressed while modal is open for cleaner spacing.
  - Toggle label text is normalized to `Enroll Member`.
- Files touched:
  - `binary-tree.mjs`
  - `index.html`
- Validation:
  - `binary-tree.mjs` syntax check passed.
  - `index.html` inline script parse passed.

## Binary Tree Progress Reapplied After Backtrack (2026-02-26)

- Reapplied Binary Tree UI/function updates after rollback:
  - `Total Direct Sponsor` KPI card restored in both dashboard summary and fullscreen metrics.
  - Advanced Search `Direct Sponsors` filter toggle restored (`directOnly` state + persistence).
  - top-row mobile/fullscreen direct toggle restored and wired to same filter action.
  - direct-toggle icons now use Material Symbols state icons:
    - off: `face`
    - on: `face_retouching_off`
  - direct-sponsor node icon and conditional Active badge placement restored:
    - with direct icon -> Active badge under icon
    - without direct icon -> Active badge top-right
  - Legacy Leadership tier helper copy restored to:
    - `Legacy Direct Sponsor(s) remaining`.
- Mobile control state re-applied:
  - minimap toggle hidden in mobile fullscreen
  - direct toggle anchored in right-side action cluster with Home
- Files touched:
  - `index.html`
  - `binary-tree.mjs`
- Validation:
  - `node --check binary-tree.mjs` passed.
  - `index.html` inline scripts parsed successfully (`Parsed 2 inline script block(s) successfully.`).

## Binary Tree Interaction + Settings Recovery (2026-02-26)

- Recovered rolled-back Binary Tree interaction updates and settings UI.
- Reapplied in `binary-tree.mjs`:
  - trackpad pan and pinch support in both fullscreen and standard Binary Tree view
  - mouse pan mode gated by `Space` hold + drag
  - mouse wheel zoom modifiers:
    - macOS: `Cmd + Wheel`
    - Windows/Linux: `Ctrl + Wheel`
  - fullscreen keyboard exit changed to long-press `Esc` (`700ms`)
  - interaction settings persistence + API:
    - `reverseTrackpadMovement`
    - `trackpadZoomSensitivity` (default `0.30`)
    - `getInteractionSettings()` / `updateInteractionSettings(...)`
  - emits `binary-tree-fullscreen-changed` on enter/exit for shell coordination.
- Reapplied in `index.html`:
  - added Binary Tree settings toggles (control bar + mobile fullscreen row)
  - added settings panel with:
    - Account Overview
    - Accessibility controls (reverse movement toggle, zoom strength slider)
    - Logout button
  - updated Material Symbols import to include `settings` icon
  - Esc capture behavior now closes settings panel first and blocks fullscreen exit while settings are open.
- Validation:
  - `node --check binary-tree.mjs` passed.
  - `index.html` inline script syntax check passed.

## Tier Claim Mode Toggle + Persistence Stability (2026-03-03)

- Added Admin Settings control for tier-claim behavior:
  - `Tier Claim Mode` toggle (Live vs Mock reset-on-reload).
- Added server-backed runtime settings support (`/api/runtime-settings`, `/api/admin/runtime-settings`) with persisted config file.
- Updated member dashboard to consume runtime setting and apply claim reset only when mock mode is enabled.
- Added hydration-aware claim reconciliation guard to prevent accidental claim pruning before registered-member/tree data has loaded.
- Current expected behavior:
  - Live mode: claim state persists across reload.
  - Mock mode: claim state clears on reload for UI/button testing.
- Next checks recommended in QA:
  - Toggle mode in Admin Settings and verify member dashboard behavior flips after reload.
  - Verify Infinity and Legacy claim cards both honor mode.
  - Verify mode remains persisted after server restart.

## Tier Claim Mode Robustness Update (2026-03-03)

- Added client fallback behavior for Tier Claim Mode runtime setting.
- If `/api/runtime-settings` is unavailable, admin and member pages now use shared localStorage key `charge-runtime-settings-v1`.
- Admin toggle no longer hard-reverts when API is missing; it can persist local mode state and continue testing.
- Member dashboard now reads fallback mode when API cannot be reached.
- Residual limitation:
  - fallback settings are browser+origin scoped (e.g., `localhost` and `127.0.0.1` are separate stores).

## User Dashboard KPI + Personal Volume Purchase Sync (2026-03-03)

- Completed the pending user-side dashboard KPI wiring follow-up for `Total Balance`:
  - card now has runtime binding (`#dashboard-total-balance-value`)
  - resolves from session wallet fields when present
  - otherwise falls back to live aggregate of current commission balances.
- Fixed user-reported `Personal Volume` issue:
  - store purchases now pass `pvGain` to purchase-activity API
  - backend now persists `starterPersonalPv` growth on purchase
  - dashboard rebind now runs immediately after session patch so `Personal Volume` updates right after checkout.
- Files touched for this fix:
  - `index.html`
  - `serve.mjs`

## Personal Volume Existing Purchase Backfill Guard (2026-03-03)

- Added a second-layer PV safety check on user My Store init:
  - scans existing invoice rows that belong to the logged-in user
  - compares invoice BP total vs already-credited purchase PV in session model
  - backfills only the missing delta to prevent undercount while avoiding double-credit.
- Ownership guard added:
  - legacy buyer-name matching now requires invoice `createdAt`, which blocks demo seed invoice rows from accidental PV backfill.
- New invoice rows now include buyer identity fields (`buyerUserId`, `buyerUsername`, `buyerEmail`) for stronger future reconciliation.
- Scope note:
  - backfill depends on purchases present in available invoice data for the user.

## Personal Volume Strict Server Sync (2026-03-03)

- Security direction confirmed by owner:
  - user-side Personal Volume must be server-authoritative only.
- Applied change:
  - removed local fallback that patched `starterPersonalPv` in browser when purchase activity API was unavailable.
- Current expected behavior:
  - PV KPI updates only from successful `POST /api/member-auth/record-purchase` responses.
  - if purchase sync API is unreachable or errors, no local PV mutation is applied.

## Dashboard Mockup Mode Cleanup (2026-03-03)

- Added unified runtime control `dashboardMockupModeEnabled` and connected it to admin settings as the master mockup switch.
- Admin settings now drives both:
  - `dashboardMockupModeEnabled`
  - `tierClaimMockModeEnabled`
- User dashboard behavior now under one mockup switch:
  - KPI cards (`Total Balance`, `Personal Volume`, `Cycles`) switch between seeded mock preview and live JSON-backed values.
  - Infinity/Legacy tier preview mode follows dashboard mockup state.
  - Recent Activity no longer shows seeded ????????????????before-state??????????????? store activity when mockup mode is OFF.
  - Mock-seeded store invoices are added in mock mode and removed in live mode.
- Security alignment retained:
  - Personal Volume purchase sync remains server-authoritative only.

## Legacy Tier Card Regression Fix (2026-03-03)

- Fixed a dashboard mockup-mode regression where Legacy Leadership cards could show Infinity-style mock tier data.
- Applied:
  - separated Legacy and Infinity mock snapshot builders in user dashboard tier pipeline.
  - shared snapshot resolver now accepts per-program mock snapshot builder input.
- Expected behavior:
  - Legacy and Infinity tier cards render from their own program-specific mock snapshots.

## Infinity Mock Tier State Alignment (2026-03-03)

- Adjusted Infinity Builder mockup tier snapshot to match live state semantics.
- Removed contradictory mock state where a tier could appear fully progressed yet remain non-completed.
- Current mock Infinity progression:
  - Tier 1 completed
  - Tier 2 building (`2/3` direct requirement)
  - Tier 3 locked preview

## Legacy Mock Tier State Alignment (2026-03-03)

- Applied matching state alignment for Legacy mock tier progression.
- Current mock Legacy progression:
  - Tier 1 completed
  - Tier 2 building (`2/3` direct requirement)
  - Tier 3 locked preview

## Legacy Tier Live-Match Enforcement (2026-03-03)

- Applied owner correction:
  - Legacy tier cards should mirror live Legacy computation even when dashboard mockup mode is enabled.
- Change:
  - disabled mock snapshot override for Legacy tier pipeline.
- Expected behavior:
  - Legacy cards now always reflect live Legacy tier logic from current tree/member data.

## Purchase PV Sync Failure Visibility (2026-03-03)

- Added client-side integrity check for purchase activity sync response.
- Behavior:
  - if invoice is created but server response does not actually increase `starterPersonalPv` by purchase `pvGain`, checkout now shows explicit PV-sync failure message.
  - guidance message points to backend restart requirement when stale server process is detected.
- Goal:
  - prevent silent mismatch between Store invoice success and Personal Volume KPI updates.

## Binary Tree BV Clarity Update (2026-03-03)

- Completed: Receiving-parent BV display is now clearer in Binary Tree views.
- Current behavior:
  - Leg values are labeled as Team BV (`L Team` / `R Team`) in cards and search rows.
  - Selected node now shows Team BV with Direct/Downline split per leg.
- Scope:
  - UX and labeling only; underlying placement and BV aggregation math remains unchanged.
- Affected files:
  - `binary-tree.mjs`
  - `admin.html`

## Anonymous Node BV Display Update (2026-03-03)

- Completed: anonymous/privacy-masked nodes now expose true Self BV and Team BV in Binary Tree views.
- Current behavior:
  - Anonymous node card/search line items: `Self BV` + `Team BV`.
  - Anonymous selected-node panel: left value shows `Self`, right value shows `Team`.
  - Non-anonymous nodes still use left/right team leg display with direct/downline detail.
- Scope:
  - Display logic only; underlying BV/placement/cycle calculations remain unchanged.
- Affected file:
  - `binary-tree.mjs`

## Anonymous BV Rule Finalized (2026-03-03)

- Completed: anonymous node BV now follows placement-side add rule.
- Current behavior for anonymous/privacy-masked nodes:
  - display remains Left/Right Team BV.
  - node personal BV is added to the displayed leg corresponding to node placement side.
  - opposite leg remains as computed downline/team value.
- Affected file:
  - `binary-tree.mjs`

## Selected Node Rank + Base BV (2026-03-03)

- Completed: Selected Node `Account Rank` field now includes Base BV.
- Current format:
  - `<Rank> | Base BV: <value> BV`
- Example:
  - `Personal | Base BV: 192 BV`
- Affected file:
  - `binary-tree.mjs`

## Selected Node Base BV Package Coverage (2026-03-03)

- Completed: selected-node Account Rank Base BV now supports all package/rank tiers.
- Current fallback mapping:
  - Personal/Starter = 192
  - Business = 360
  - Infinity/Achievers = 560
  - Legacy = 960
- Affected file:
  - `binary-tree.mjs`

## Direct vs Downline Label Logic Fixed (2026-03-03)

- Completed: Select Node left/right breakdown now uses sponsor-based direct BV.
- Current behavior:
  - `Direct` = personally enrolled user BV on that leg.
  - `Downline` = remaining team BV on that leg.
- Affected file:
  - `binary-tree.mjs`

## Anonymous Rank Display Update (2026-03-03)

- Completed: anonymous/privacy-masked nodes now show rank values in Binary Tree rank mode.
- Scope:
  - rank visibility enabled for node/search/selected rank text paths.
  - country masking remains in place.
- Affected file:
  - `binary-tree.mjs`

## Store Invoice JSON Persistence + Recent Activity Reload Fix (2026-03-03)

- Added a dedicated JSON-backed invoice store to support live runtime persistence:
  - `mock-store-invoices.json`
  - API endpoint: `GET/POST /api/store-invoices`
- User-side My Store flow now loads invoices from API on initialization and creates invoices through API POST.
- Recent Activity now remains stable after reload in live mode because purchase entries are rebuilt from persisted invoice rows.
- Admin `Flush All Data` now also clears persisted store invoices.
- Affected files:
  - `serve.mjs`
  - `index.html`
  - `mock-store-invoices.json`
- Known limitation:
  - Store invoice endpoint currently follows the existing mock-backend trust model (no additional server-side auth gate yet).

## Recent Activity User-Scope Fix (2026-03-03)

- Fixed user report where `Recent Activity` purchase items were shared across accounts.
- Updated user dashboard activity build path to include only invoices owned by the currently authenticated user.
- Current behavior:
  - purchase activity cards now render from `storeInvoices` filtered by `isInvoiceOwnedByCurrentUser(...)`.
  - other users no longer see each other's purchase activity entries.
- Affected file:
  - `index.html`

## Request Payout Mock/Live Wiring Update (2026-03-03)

- Investigated payout-button behavior and confirmed it was running as in-memory client simulation only.
- User-side payout requests are now wired to dashboard mockup mode:
  - Live mode (`dashboardMockupModeEnabled = false`): payout offsets persist per user in local storage.
  - Mock mode (`dashboardMockupModeEnabled = true`): payout offsets reset to runtime mock state and do not persist.
- Added per-user payout offset storage key:
  - `charge-commission-payout-offsets-v1`
- Admin settings/UX now explicitly includes payout-request behavior in mode descriptions and success feedback.
- Admin quick-action `Request Payout` button is now mode-aware:
  - enabled in mock mode preview
  - disabled in live mode
- Affected files:
  - `index.html`
  - `admin.html`

## Payout Recent Activity Reload Persistence Fix (2026-03-03)

- Fixed user report: payout-request entries showing as pending then disappearing after reload.
- Root cause:
  - payout events were only appended to in-memory runtime activity list.
- Update applied:
  - added user-scoped payout activity persistence store in browser local storage:
    - `charge-commission-payout-activity-v1`
  - live mode now persists payout request activity entries per signed-in user.
  - Recent Activity now rebuilds payout request rows from persisted payout activity in live mode.
  - mock mode keeps payout activity non-persistent behavior.
- Affected file:
  - `index.html`

## Payout Request Server Queue + Admin Fulfillment Wiring (2026-03-03)

- Converted payout requests from browser-only persistence to JSON-backed shared queue flow.
- Added new payout request store file:
  - `mock-payout-requests.json`
- Backend additions in `serve.mjs`:
  - `GET /api/payout-requests` (member-scoped by user identity params)
  - `POST /api/payout-requests` (member submits payout request)
  - `GET /api/admin/payout-requests` (admin queue view)
  - `POST /api/admin/payout-requests/fulfill` (admin marks request fulfilled)
  - `POST /api/admin/reset-all-data` now also clears payout requests and returns `cleared.payoutRequests`.
- User dashboard (`index.html`) payout flow update:
  - live mode now submits payout requests to API before applying local payout offset deduction.
  - Recent Activity payout entries are now hydrated from server payout requests (still user-scoped).
  - payout status rendering supports `Pending` and `Fulfilled` states.
- Admin settings (`admin.html`) update:
  - added `Payout Request Queue` card with refresh + `Mark Fulfilled` actions.
  - queue reloads in Settings page and after actions.
  - flush summary now includes invoice + payout request clear counts.
- Result:
  - payout requests persist after reload,
  - remain per-user on member side,
  - and are now fulfillable through admin panel with shared state.

## Sales Team Request Payout Fallback Hotfix (2026-03-03)

- Investigated report: Sales Team `Request Payout` click sometimes had no visible effect.
- Root behavior found:
  - live-mode request errors were only logged to console and surfaced no UI change.
- Patch applied in `index.html`:
  - when live API payout create fails, request now falls back to local persisted payout activity,
  - payout offset deduction still applies,
  - Recent Activity still updates immediately,
  - button busy state still resets normally.
- Result:
  - Sales Team payout action no longer appears dead during temporary API unavailability.

## Sales Team Payout Persistence + Activity De-dup Refinement (2026-03-03)

- Follow-up patch for report: Sales Team payout looked mock-like after reload and payout activity could appear duplicated.
- Updated member payout logic in `index.html`:
  - Live-mode payout offsets now re-sync from server payout-request entries after payout request load.
  - Recent Activity payout source now prioritizes server-backed payout entries; legacy local entries are only used as fallback when no server entries exist.
  - Removed live-mode local success fallback on API failure to prevent mock-like local-only payout writes.
- Result:
  - payout state in live mode now tracks server request data on reload,
  - and duplicate payout activity rows are reduced by avoiding mixed local+server rendering in normal live flow.
- Added cleanup on successful server payout load:
  - legacy local payout activity entries for current user are cleared once server-backed entries exist.

## Commission Order Page + Fulfillment Form Upgrade (2026-03-03)

- Admin payout fulfillment has been moved from **Settings** into a routed sidebar page: **Commissions**.
- Fulfillment workspace is now labeled **Commission Order**.
- Pending orders now require admin-entered fulfillment details before completion:
  - mode of transfer (required)
  - bank details (required)
  - transfer reference (optional)
  - general info (optional)
- Backend now validates and persists fulfillment details when admin completes an order.

### Scope/impact

- UI routing + navigation updates for Commissions page in `admin.html`.
- API validation/storage updates in `serve.mjs` for `/api/admin/payout-requests/fulfill`.
- Settings page now references Commissions as the fulfillment workspace.

### Active follow-up opportunities

- Add fulfilled-order detail editing / correction flow for admin mistakes.
- Add structured bank fields (bank name/account name/account number) once payout schema is finalized.

## Commission Order Shopify-Style UI Pass (2026-03-03)

- `Commissions > Commission Order` now uses a Shopify-like admin order-management layout instead of stacked cards.
- New structure includes:
  - KPI summary strip
  - search + filters + refresh toolbar
  - order table as primary browsing surface
  - dedicated right/secondary detail panel pattern (rendered below table in current layout)
- Fulfillment action now happens from the selected order??????????????????s detail panel form.

### Current impact

- Commission fulfillment operations are now easier to scan and triage at list level before opening order details.
- UI now better supports scaling to larger order volumes versus card feed layout.

## Commission Order Flow Update: Dedicated Detail Page (2026-03-03)

- Order list and order details are now split into separate pages/views.
- Current admin behavior:
  - browse/filter in `Commissions` list view
  - click an order to navigate into `Commission Order Details` page
  - complete fulfillment from that detail page
  - return via back action to list

### Result

- Matches requested workflow expectation of "next page" for per-order review and fulfillment.
- Preserves Shopify-like list ergonomics while reducing visual clutter during fulfillment.

## Commission Fulfillment Gateway Routing (2026-03-03)

- Gateway-specific fulfillment routes are now prepared in admin payout flow.
- Stripe is wired as primary gateway route; Bank Transfer and Zelle routes are also ready.

### Current behavior

- Admin `Mode of Transfer` selection drives API target route automatically.
- Fulfilled order details now expose gateway metadata (status/reference/route/message).
- Unsupported gateway routes are blocked server-side.

### Ready routes

- `POST /api/admin/payout-requests/fulfill/stripe`
- `POST /api/admin/payout-requests/fulfill/bank-transfer`
- `POST /api/admin/payout-requests/fulfill/zelle`
- fallback generic: `POST /api/admin/payout-requests/fulfill`

## Commission Order Status Override Option (Default-Preserving) (2026-03-03)

- Added a new status-change control in `Commission Order Details` so admins can explicitly update order status when needed.
- Default behavior is intentionally unchanged:
  - status selector defaults to `No status change (default)`
  - existing fulfillment flow remains the primary path for pending requests

### New admin behavior

- Detail page now shows a dedicated `Order Status` card with:
  - current status badge
  - status selector (`No status change`, `Set to Pending`, `Set to Fulfilled`)
  - `Apply Status` action button
- Status changes call:
  - `POST /api/admin/payout-requests/status`
- When setting status to `Fulfilled` from a pending order, fulfillment form values (transfer mode, bank details, reference, general info) are reused in the status payload.
- Fulfilled orders can now be reopened to `Pending` from the detail page.

### Scope/impact

- Frontend: `admin.html` now supports manual status override while preserving prior default UX.
- Backend: `serve.mjs` status endpoint is now actively used by the Commission Order detail page.

### Known limitation

- The pending-order fulfillment form still requires bank details in the UI even when transfer mode is Stripe (server allows Stripe without bank details).

## Admin Settings App Tools Update (2026-03-04)

- Added a new Settings app-tool action: **Force Server Cut-Off**.
- New backend route is live:
  - `POST /api/admin/force-server-cutoff`
- Action now force-runs cut-off processing and applies:
  - binary-tree cycle recalculation from stored leg BV snapshots
  - sales-team commission recalculation (cap, gross, payout offset, net)
- Admin settings now show immediate run feedback and update the local Server Cut-Off card baseline right after a successful forced run.

## Force Cut-Off Execution History (2026-03-04)

- Added persistent execution history storage for force cut-off runs:
  - `mock-force-server-cutoff-history.json`
- Backend now supports:
  - `GET /api/admin/force-server-cutoff` (history fetch)
  - `POST /api/admin/force-server-cutoff` now returns/saves history entries.
- Settings UI now includes an `Execution History` panel with refresh + latest run summaries.

## Member-Side Forced Cut-Off Sync Fix (2026-03-04)

- Resolved gap where admin force cut-off did not reset member Server Cut-Off card immediately.
- Added new public event endpoint:
  - `GET /api/server-cutoff-events`
- Member cutoff panel now syncs forced cutoff timestamp and applies baseline reset when newer force-run is detected.
- Expected behavior now:
  - after force-run, member Left/Right BV resets to `0`
  - accumulation resumes from that forced cut-off point.

## Admin Scope Correction (2026-03-04)

- Removed admin-local cutoff-application behavior from force-run flow.
- Admin now remains control-only:
  - trigger force cut-off
  - view history
  - no admin earnings/cutoff participation logic applied in force action.

## Store Workflow + Product Management Parity (2026-03-04)

- Applied full store refresh across both shells as requested:
  - user-side My Store now follows:
    - Product Grid -> Product Page -> Checkout
  - admin-side My Store now uses:
    - Product Management (no storefront cart grid)

### User-side status

- Product Grid added as step 1 with active catalog rendering.
- Product Page added as step 2 with full description/details and quantity controls.
- Checkout added as step 3 with:
  - card details
  - billing address
  - shipping mode
  - order summary + editable cart lines
- Shared catalog storage enabled:
  - localStorage key: `charge-store-product-catalog-v1`
- Inventory decrements on successful checkout and persists to same catalog store.
- Sponsor/rank discount logic preserved (existing `uplineDiscountRate` formula remains intact).

### Admin-side status

- Replaced old Storefront cart/product grid with Product Management UI.
- Admin can:
  - create products
  - edit products
  - set image, price, title, description, stock count, BV points, product discount
  - archive/unarchive products
  - delete products
- Archived products are hidden from user storefront; deleted products are removed.

### Validation

- Inline script parse passed:
  - `index.html` (2 blocks)
  - `admin.html` (2 blocks)
- Headless load checks completed for both root member/admin URLs without page runtime exceptions.

## Binary Tree Node Cut-Off Baseline Reset (2026-03-04)

- Completed: server cut-off now propagates into binary-tree node BV values (user + admin), not only Server Cut-Off panel math.

### What is now in place

- `serve.mjs`
  - `POST /api/admin/force-server-cutoff` stamps:
    - `serverCutoffBaselineStarterPersonalPv`
    - `serverCutoffBaselineSetAt`
  - Baseline stamping is applied across user/member datasets used by tree generation.

- `index.html` (user shell)
  - Added baseline-aware BV helpers:
    - `resolveMemberServerCutoffBaselineVolume(...)`
    - `resolveMemberBinaryVolume(...)`
  - Tree node `leftPersonalPv` now uses post-cut-off delta BV.

- `admin.html` (admin shell)
  - Added the same baseline-aware BV helper path.
  - Admin binary tree node generation now uses post-cut-off delta BV.

### Expected runtime behavior

- After force cut-off: existing binary-tree node BV returns to `0`.
- As new purchases/activity happen: node BV increments from zero for the current cycle window.

### Validation snapshot

- `serve.mjs` syntax check passed.
- Force cut-off baseline fields written successfully.
- Post-cutoff member-volume delta check returned `0` for existing records until new activity.

## Personal Volume Card Cut-Off Reset (2026-03-04)

- Completed: Dashboard Personal Volume now uses current-cycle PV and resets to `0` at cut-off.

### Implementation highlights

- `serve.mjs`
  - `GET /api/member/server-cutoff-metrics` now returns:
    - `totalPersonalPv`
    - `baselinePersonalPv`
    - `currentWeekPersonalPv`
  - Personal baseline now advances on cut-off application and persists to user/member records.
  - Auth response now includes cutoff baseline fields for session-side hydration.

- `index.html`
  - Starter dashboard metrics now compute `currentWeekPersonalPv`.
  - Personal Volume card now renders cycle PV (`currentWeekPersonalPv`) instead of lifetime starter PV.
  - Server cut-off sync updates local session baseline and Personal Volume card in place.

- `admin.html`
  - Personal Volume display switched to baseline-aware current-week PV.

### Validation snapshot

- `serve.mjs` syntax check passed.
- Inline script parse passed for user/admin shells.
- API flow confirmed:
  - purchase increments `currentWeekPersonalPv`
  - force cut-off resets `currentWeekPersonalPv` back to `0`.

## Theme Logo Integration Update (2026-03-07)

- Completed: Sidebar branding in the member shell now uses Premiere Life logo assets from `brand_assets/Logos` and switches by theme.
- Mapping now in place:
  - default -> `Premiere Life Logo_White_Purple`
  - apple -> `Premiere Life Logo_Transparent`
  - shopify -> `Premiere Life Logo_Mono White`
- File updated: `index.html`.

## Sidebar Logo Sizing Adjustment (2026-03-07)

- Completed: Increased sidebar logo visual size in `index.html` by adding a clipping shell and vertical scale compensation for padded SVGs.
- Theme mapping remains unchanged; only presentation/sizing was adjusted.

## Sidebar Logo Screenshot Validation (2026-03-07)

- Completed: Screenshot-based logo sizing validation and fit correction for all three themes in `index.html`.
- Final result: larger logo presentation with full wordmark visible (no horizontal clipping).

## Sidebar Logo Final Fit (2026-03-07)

- Completed: Switched to cropped sidebar-specific logo SVGs and medium-width rendering in `index.html`.
- Result: no clipping in default/apple/shopify themes and stable medium visual size.

## Logo Asset Compliance Pass (2026-03-07)

- Completed: Sidebar logo now uses only the original provided SVG assets (default/apple/shopify mappings) with no stretch distortion.
- Temporary generated sidebar logo files were removed.

## Login/Auth Brand Rename (2026-03-08)

- Completed: Updated login-facing brand copy to `Premiere Life`.
- Files updated:
  - `login.html`
  - `admin.html`
  - `password-setup.html`
- Scope:
  - Member login title and hero brand label updated.
  - Admin login shell title and hero brand label updated.
  - Password setup page title updated for authentication flow consistency.

## Admin Login: PostgreSQL-Backed Auth (2026-03-15)

- Completed: Admin login no longer reads `mock-admin-users.json` from the browser.
- New behavior:
  - Admin login posts to `POST /api/admin-auth/login`
  - Credentials are validated from `charge.admin_users` in PostgreSQL
  - Existing admin session storage behavior in `admin.html` remains intact
- Backend additions:
  - `backend/routes/admin-auth.routes.js`
  - `backend/controllers/admin-auth.controller.js`
  - `backend/services/admin-auth.service.js`
  - `backend/stores/admin-user.store.js`
  - `backend/app.js` route registration for `/api/admin-auth`
- Frontend update:
  - `admin.html` login flow switched from mock JSON lookup to API auth call
  - login helper text updated to reflect DB auth source

## Admin Enrollment API Route Parity (2026-03-15)

- Completed: fixed admin enrollment `API endpoint not found` issue.
- Root cause:
  - Admin UI posts to `/api/admin/registered-members`
  - Backend only exposed `/api/registered-members`
- Fix implemented:
  - Added route aliases in `backend/routes/member.routes.js`:
    - `GET /admin/registered-members`
    - `POST /admin/registered-members`
  - Aliases reuse existing registered-member controllers/service logic.
- Result:
  - Admin enroll calls now hit backend logic instead of 404.

## Admin Flash/Reload Loop Stabilization (2026-03-15)

- Completed: fixed rapid flashing/reload behavior on admin-side routes.
- Root cause:
  - Admin shell uses SPA-style paths under `/admin/*` (example: `/admin/dashboard`)
  - Backend fallback previously served `index.html` for unknown non-API paths
  - Reloading/opening `/admin/*` could mount the wrong app shell and trigger repeated redirects
- Fix implemented in `backend/app.js`:
  - non-API fallback now serves `admin.html` for:
    - `/admin`
    - `/admin/`
    - `/admin.html`
    - any path starting with `/admin/`
  - other non-API routes continue to serve `index.html`
- Result:
  - Admin namespace URLs now remain stable (no rapid reload loop).

## Flush Action DB Permissions (Same Database) (2026-03-15)

- Completed: implemented role-based privilege split for destructive admin flush on the same `lnd_premiere_app` database.
- New model:
  - normal app traffic uses `charge_app_service` (mapped to `charge_service_role`)
  - privileged flush path uses `charge_app_admin` (mapped to `charge_admin_role`)
- Permission hardening:
  - `TRUNCATE` granted to admin role path
  - `TRUNCATE` explicitly unavailable to service role path
- Backend updates:
  - Added admin DB pool: `backend/db/admin-db.js`
  - Updated `resetAllMockData` to use admin pool + transactional truncate in `backend/services/admin.service.js`
- Environment updates:
  - `.env` now includes `DB_ADMIN_USER` and `DB_ADMIN_PASSWORD`
  - `.env` primary app DB user switched to `charge_app_service`
- Result:
  - app still runs with least-privileged service login for normal endpoints
  - flush action can be isolated to admin DB credentials within the same DB instance.

## Binary Tree BV Upstream Regression Fix (2026-03-15)

- Completed: fixed missing upstream BV accumulation after member enrollments.
- Root cause:
  - enrolled `registered_members` rows were persisted with `starter_personal_pv = 0`
  - tree rollup helpers depend on starter PV to propagate left/right leg BV
- Fix implemented:
  - `backend/services/member.service.js`
    - `createRegisteredMember` now writes `starterPersonalPv: packageBv`
  - `admin.html` and `index.html`
    - BV resolvers now safely fallback to package BV when starter PV is zero/missing
- Data repair executed on active DB (`lnd_premiere_app`):
  - backfilled `charge.registered_members.starter_personal_pv` from `package_bv` where needed
  - backfilled `charge.member_users.starter_personal_pv` from `enrollment_package_bv` where needed
- Result:
  - binary-tree upstream leg volumes now populate correctly for existing and newly enrolled members.

## Binary Tree Right-Leg Tree-Enroll Persistence Fix (2026-03-15)

- Completed: fixed right-leg enrollments from anticipated-node/tree-enroll flow being stored as left placement.
- Root cause:
  - backend enrollment normalization coerced `placementLeg='spillover'` into `'left'`.
  - tree-enroll lock path uses spillover mode to target selected anticipated slots, so right-side intent was lost in persistence.
- Fix implemented:
  - `backend/services/member.service.js` now preserves spillover placement mode and persists:
    - `placementLeg`
    - `spilloverPlacementSide`
    - `spilloverParentReference`
    - `isSpillover`
  - added server validation requiring spillover parent reference.
- Validation:
  - service-level create flow verified `placement_leg='spillover'` + `spillover_placement_side='right'` now persists correctly in `charge.registered_members`.

## Admin Force Cut-Off History Route Parity (2026-03-16)

- Completed: fixed admin Settings `API endpoint not found` error for force cut-off history.
- Root cause:
  - frontend calls `GET /api/admin/force-server-cutoff` to render execution history
  - backend only had `POST /api/admin/force-server-cutoff`
- Fix implemented:
  - added `getForceServerCutoffHistory(query)` service in `backend/services/admin.service.js`
  - added `listForceServerCutoffHistory` controller in `backend/controllers/admin.controller.js`
  - registered `GET /api/admin/force-server-cutoff` in `backend/routes/admin.routes.js`
  - preserved existing force-run `POST` route behavior
- Validation:
  - syntax checks passed for all touched backend files
  - temp-server smoke check:
    - `GET /api/admin/force-server-cutoff` now returns `200` (no API fallback 404)

## Admin Force Cut-Off Check Constraint Guard (2026-03-16)

- Completed: fixed force cut-off crash from DB constraint `sales_team_commission_snapshots_check3`.
- Root cause:
  - force-run commission recompute could set `payout_offset_amount` greater than `gross_commission_amount`
  - DB check constraint rejects rows where gross is smaller than payout offset
- Fix implemented:
  - `backend/services/admin.service.js`
    - in `forceServerCutoff`, clamp payout offset to gross before persisting:
      - `payoutOffsetAmount = min(grossCommissionAmount, payoutOffsetAmountRaw)`
    - net amount continues to compute from clamped offset
- Validation:
  - `node --check backend/services/admin.service.js` passed
  - temp-server `POST /api/admin/force-server-cutoff` returned `200` successfully (no constraint violation)

## Sales Team Commission Endpoint Constraint Hardening (2026-03-16)

- Completed: fixed `POST /api/sales-team-commissions` malformed payload path causing DB constraint-driven `500`.
- Root cause:
  - metrics service sanitized only non-negative values and did not enforce constraint relationships before write.
  - invalid combinations (for example `gross < payoutOffset`, `capped > total`) reached PostgreSQL and failed.
- Fix implemented:
  - `backend/services/metrics.service.js`
    - added relational normalization in `sanitizeSalesTeamCommissionRecord(...)`:
      - `cappedCycles = min(totalCycles, cappedCyclesRaw)`
      - `overflowCycles = max(0, totalCycles - cappedCycles)`
      - `payoutOffsetAmount = min(grossCommissionAmount, payoutOffsetAmountRaw)`
      - `netCommissionAmount = grossCommissionAmount - payoutOffsetAmount`
      - uppercased `currencyCode`
    - added `roundCurrencyAmount(...)` helper for commission amount precision.
- Validation:
  - `node --check backend/services/metrics.service.js` passed
  - repro payload previously returning `500` now returns `200` with normalized commission payload and no DB constraint error.

## Dashboard Commission Containers: DB-Backed Persistence (2026-03-16)

- Completed: implemented server-backed commission container persistence for dashboard transfer/claim flows in live mode.
- Root cause addressed:
  - Infinity/Legacy tier claim maps were client-local, so refresh/session drift could re-open already-claimed tiers and inflate dashboard balances.
- Backend added:
  - `GET /api/commission-containers`
  - `POST /api/commission-containers`
  - files:
    - `backend/stores/commission-container.store.js`
    - `backend/services/commission-container.service.js`
    - `backend/controllers/commission-container.controller.js`
    - `backend/routes/commission-container.routes.js`
    - route registration in `backend/app.js`
- Frontend updated:
  - `index.html` now hydrates commission containers from API on startup and when returning to live mode.
  - Live mode claim-map access now uses server snapshot for:
    - Infinity Tier Commission
    - Legacy Leadership Bonus
  - Added debounced server sync for commission container balances and claim maps.
  - Added immediate (awaited) server persistence after tier-claim clicks to avoid rapid-refresh race conditions.
  - Added guard to block claim/transfer actions until commission container hydration completes in live mode.
- DB requirement:
  - `charge.member_commission_containers` is auto-provisioned on first API access via `adminPool` (`DB_ADMIN_*` or fallback `DB_*`) when that role has schema-create privileges.
  - fallback: create the same table manually if admin auto-provision is unavailable.
  - API now supports fallback synthetic identity keys when a member row cannot be resolved, preventing false 404s for commission container persistence.
- Validation:
  - `node --check` passed for all new backend files and `backend/app.js`.
  - Extracted dashboard inline JS from `index.html` and passed `node --check`.

## User Store Link Backfill (2026-03-25)

- Completed:
  - added one-time/reusable backfill script to populate missing user store-link fields.
  - added npm task: `backfill:store-links`.
  - executed backfill on current DB data.
- Results:
  - users scanned: `7`
  - users updated: `7`
  - missing store-link fields after run: `0`
- Current state:
  - existing users now have `storeCode`, `publicStoreCode`, and `attributionStoreCode`.
  - new user registration path already generates these fields by default in `createRegisteredMember`.

## My Store No-Link Attribution QA Flow (2026-03-25)

- Completed:
  - added checkout UI field for optional manual member store code routing (dev testing).
  - manual code flow now works without public links or terminal calls.
  - backend now rejects invalid provided member store codes with a clear `404` validation message.
- Current state:
  - QA can test store attribution from `My Store > Checkout` by entering `Member Store Code` (e.g. `CHG-ZERO`).
  - if blank, checkout uses existing mapped attribution behavior.

## Public Store + Admin Shared Catalog (2026-03-25)

- Completed:
  - added new public store route/page at `/store`.
  - added DB-backed shared store product catalog APIs.
  - moved admin product management from localStorage to backend API persistence.
  - updated member My Store product loading to consume shared backend catalog.
- API additions:
  - `GET /api/store-products`
  - `GET /api/admin/store-products`
  - `PUT /api/admin/store-products`
- Current state:
  - admin controls the shared store catalog used by both member store and public store.
  - public store checkout supports store-code attribution without requiring login.

## Public Store UX: Browse-First Flow Split (2026-03-25)

- Completed:
  - split public store into three dedicated pages:
    - `/store` (product grid browse)
    - `/store/product` (single-product details)
    - `/store/checkout` (checkout only)
  - added shared navbar on store pages with `Home`, `Products`, `Support (Contact Us)`, `Member Login`, and `Free Member Login`.
  - removed public BV display from storefront cards and checkout visual totals.
  - moved checkout interaction off storefront landing page.
  - added shared script `storefront-shared.js` for cart/state/checkout consistency.
- Backend routing:
  - `backend/app.js` now serves:
    - `/store/product` -> `store-product.html`
    - `/store/checkout` -> `store-checkout.html`
- Validation:
  - syntax checks passed for `backend/app.js`, `storefront-shared.js`, and all inline scripts in new store pages.
  - isolated runtime smoke test on port `3131` returned `200` for `/store`, `/store/product`, and `/store/checkout`.
- Current state:
  - public shoppers can browse products first, drill into product details, then checkout on a separate page.

## Public Store Routing Hardening (2026-03-25)

- Completed:
  - hardened storefront link targets to direct HTML pages (`store.html`, `store-product.html`, `store-checkout.html`).
- Why:
  - avoids route-fallback mismatch behavior when backend route updates are not yet restarted.
- Validation:
  - headless click flow now shows stable two-step navigation (`store.html` -> `store-product.html?...`) with no loop.

## Public Store Refinements (2026-03-25)

- Completed:
  - removed member store code controls from storefront product-grid page.
  - moved support to dedicated `store-support.html` page and updated nav labels to `Support`.
  - removed `You might also like` from product page for current single-product phase.
  - converted product description/details area from list layout to paragraph narrative layout.
  - filtered BV references from product page descriptive display.
- Backend:
  - added `/store/support` route alias to serve support page.
- Validation:
  - syntax checks + inline script checks passed.
  - runtime smoke test passed for store, product, checkout, and support routes.

## Public Store Custom Stripe Checkout (2026-03-25)

- Completed:
  - implemented embedded Stripe Elements checkout UI on `/store/checkout` (no forced redirect to Stripe-hosted page).
  - added backend payment-intent endpoints and checkout-config endpoint.
  - preserved existing hosted checkout endpoints for backwards compatibility.
  - hardened backend checkout validation (buyer name/email/shipping/store code).
  - kept invoice finalization + owner BV credit idempotent across session and intent flows.
- API now available:
  - `GET /api/store-checkout/config`
  - `POST /api/store-checkout/intent`
  - `POST /api/store-checkout/intent/complete`
- Required env:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_PUBLISHABLE_KEY`
  - `PUBLIC_APP_ORIGIN`
- Validation:
  - syntax checks passed for updated backend/frontend files.
  - inline script parse check passed for `store-checkout.html`.
  - service-level execution confirmed expected validation errors and successful payment-intent creation payload shape.

## Public Store Free Account Registration Parity (2026-03-25)

- Completed:
  - upgraded Free Account checkout flow to use enrollment-style registration fields before payment.
  - changed Free Account submit CTA to `Register and Pay`.
  - added conditional spillover controls (placement side, parent mode, manual parent reference).
  - extended checkout payload + validation to carry free-account registration fields end-to-end.
  - persisted free-account fields in Stripe metadata and re-used them during payment finalization member creation.
- Backend safeguards:
  - added server validation for free-account username format.
  - added manual spillover parent-reference requirement when applicable.
- Current state:
  - Free Account checkout now captures and applies user-entered registration details during auto-enrollment instead of defaulting to email-derived/fallback values.
  - both embedded Payment Intent and hosted Checkout Session metadata paths now carry free-account registration context.
- Validation:
  - syntax checks passed for `backend/services/store-checkout.service.js` and `storefront-shared.js`.
  - inline script parse check passed for `store-checkout.html`.

## Public Store Free Account Flow Correction (2026-03-25)

- Completed:
  - removed Free Account leg/spillover selection from storefront buyer flow.
  - added modal-first registration step triggered by `Register and Pay`.
  - modal now captures required registration fields before payment and then continues to checkout.
- Current flow now:
  - select Free Account
  - click `Register and Pay`
  - complete registration modal
  - proceed with payment checkout
  - show thank-you modal with setup link
- Placement authority:
  - storefront buyer no longer controls leg placement;
  - placement is handled via store-owner-side logic/defaults.
- Validation:
  - syntax checks passed for `storefront-shared.js` and `backend/services/store-checkout.service.js`.
  - inline script parse check passed for `store-checkout.html`.

## Password Setup Invalid-Link Recovery Fix (2026-03-25)

- Completed:
  - added setup-link recovery path for invalid/unknown token cases.
  - setup links now include optional `email` query context for recovery.
  - password setup page auto-refreshes to a regenerated valid link when backend recovery response is available.
- Current behavior:
  - invalid token no longer hard-dead-ends when email fallback can resolve a pending account;
  - user is redirected to a fresh working setup link.
- Validation:
  - backend syntax checks passed.
  - password-setup inline script parse passed.
  - runtime fallback simulation confirmed regenerated token validates.

## Split Auth + Free Account Dashboard (2026-03-26)

- Completed:
  - enforced two account-specific login paths:
    - paid members stay on `login.html`
    - free accounts stay on `store-login.html`
  - blocked cross-login attempts:
    - free account on paid login now shows redirect to Free Member Login
    - paid account on free login now shows redirect to Member Login
  - changed free-login success destination to dedicated storefront shell:
    - `/store-dashboard.html` (and route alias `/store/dashboard`)
  - added dedicated free-account password setup page:
    - `/store-password-setup.html` (and route alias `/store/password-setup`)
  - setup-link generation is now account-aware:
    - paid accounts receive `/password-setup.html?...`
    - free accounts receive `/store-password-setup.html?...`
  - removed preferred/free page-gating behavior from `index.html` (no nav/page hiding gate).

- Current state:
  - free accounts now complete sign-in + password setup through free-account screens only.
  - paid members keep existing member login + setup path.
  - free accounts get a storefront-style dashboard with:
    - purchase activity (member-owned invoice filter)
    - profile form (local persisted)
    - saved address form (local persisted)

- Backend routing updates:
  - `GET /store/dashboard` + aliases -> `store-dashboard.html`
  - `GET /store/password-setup` + aliases -> `store-password-setup.html`

- Validation:
  - `node --check` passed for all touched backend files.
  - inline script parse checks passed for:
    - `login.html`
    - `store-login.html`
    - `password-setup.html`
    - `store-password-setup.html`
    - `store-dashboard.html`
    - `store-checkout.html`
    - `index.html`
  - runtime route smoke check (port `3137`) returned `200` for new + updated auth/store paths.

## Storefront Session UX + Free Account Upgrade CTA (2026-03-26)

- Completed:
  - made storefront headers session-aware so free-account sessions remain visibly recognized while browsing:
    - `Free Member Login` now switches to `My Dashboard` when a free session exists.
    - paid member sessions now switch `Member Login` to `Member Dashboard`.
  - added reusable storefront auth/session helpers in `storefront-shared.js`:
    - `readUserSession`
    - `isFreeAccountUser`
    - `buildFreeLoginUrl`
    - `buildDashboardUrl`
  - applied header auth-link sync behavior across:
    - `store.html`
    - `store-product.html`
    - `store-support.html`
    - `store-checkout.html`
  - added free-dashboard account upgrade controls in `store-dashboard.html`:
    - package selector (`personal`, `business`, `infinity`, `legacy`)
    - `Upgrade Account` button
    - inline upgrade feedback state
  - wired upgrade action to existing API:
    - `POST /api/member-auth/upgrade-account`
  - after successful upgrade:
    - session snapshot is updated and persisted
    - user is redirected from free dashboard to paid member dashboard (`/index.html`).

- Current state:
  - free accounts can browse product and support pages without appearing logged out due to static header links.
  - free dashboard now supports self-service upgrade into paid packages.

- Validation:
  - `node --check storefront-shared.js` passed.
  - inline script parse checks passed for:
    - `store.html`
    - `store-product.html`
    - `store-support.html`
    - `store-checkout.html`
    - `store-dashboard.html`
    - `store-login.html`
  - runtime route smoke check (port `3138`) returned `200` for:
    - `/store.html`
    - `/store-product.html`
    - `/store-support.html`
    - `/store-checkout.html`
    - `/store-dashboard.html`
    - `/store/login`
    - `/store/dashboard`

## Store Header Action Alignment (2026-03-27)

- Completed:
  - aligned storefront header action controls with nav items (not logo row) for clearer scan/read order.
  - kept logo isolated in top row and moved action controls into nav right edge.
  - applied consistency update on checkout page by moving `Login` into nav row as well.

- Files updated:
  - `store.html`
  - `store-product.html`
  - `store-support.html`
  - `store-checkout.html`

- Validation:
  - inline script parse check passed for `store-checkout.html`.

## Store Register UX Copy + Terms Gate (2026-03-27)

- Completed:
  - updated register page primary CTA text from `Continue to Checkout` to `Register`.
  - updated helper copy to match register-first flow language.
  - added required `Terms and Agreements` checkbox in the registration form.
  - added explicit submit validation message when terms are not accepted.

- File updated:
  - `store-register.html`

- Validation:
  - inline script parse check passed for `store-register.html`.

## Store Checkout Registration Modal Terms Gate (2026-03-27)

- Completed:
  - added `Terms and Agreements` checkbox to the checkout free-account registration modal.
  - modal submission now requires checkbox acceptance before continuing.
  - validation message added for unchecked terms state.

- File updated:
  - `store-checkout.html`

- Validation:
  - inline script parse check passed for `store-checkout.html`.

## Admin Settings Legal Documents (2026-03-27)

- Completed:
  - added new `Settings -> Legal` section in Admin with editable fields:
    - Terms of Service
    - Agreement
    - Shipping Policy
    - Refund Policy
  - added load/save behavior tied to runtime settings API.
  - extended runtime settings backend payload to include `settings.legal` and update via `payload.legal`.
  - updated storefront register and checkout registration flows to display admin-managed legal document text near terms consent controls.

- Files updated:
  - `admin.html`
  - `backend/stores/runtime.store.js`
  - `backend/services/runtime.service.js`
  - `storefront-shared.js`
  - `store-register.html`
  - `store-checkout.html`

- Validation:
  - `node --check` passed:
    - `backend/stores/runtime.store.js`
    - `backend/services/runtime.service.js`
  - inline script parse checks passed:
    - `admin.html`
    - `store-register.html`
    - `store-checkout.html`

## Admin Settings UX Follow-Up: Legal Flow Restructure (2026-03-27)

- Completed:
  - changed legal management UX from inline side-by-side fields to a hierarchical settings flow:
    - `Settings > Category > Legal > Specific > Edit`
  - added legal category list with per-document preview and `Edit` actions.
  - added dedicated single-document editor screen with breadcrumb context and save action.
  - save returns to legal category view and preserves runtime settings persistence behavior.

- File updated:
  - `admin.html`

- Validation:
  - inline script parse check passed for `admin.html`.

## Admin Settings Responsiveness + Rich Text Legal Editing (2026-03-27)

- Completed:
  - fixed settings width behavior on larger screens by removing fixed-width constraint in settings content shell.
  - replaced legal textarea with rich text editing experience in legal-specific editor flow.
  - added formatting controls (bold/italic/underline/lists/link/clear).
  - added legal HTML sanitization and safe storefront rendering for admin-authored legal content.

- Files updated:
  - `admin.html`
  - `storefront-shared.js`
  - `store-register.html`
  - `store-checkout.html`

- Validation:
  - `node --check` passed:
    - `backend/stores/runtime.store.js`
    - `backend/services/runtime.service.js`
    - `storefront-shared.js`
  - inline script parse checks passed:
    - `admin.html`
    - `store-register.html`
    - `store-checkout.html`

## Legal Editor Toolbar Reliability Fix (2026-03-27)

- Completed:
  - fixed toolbar controls that were failing due to lost text selection during button clicks.
  - added selection capture/restore handling around legal rich-text commands.
  - added mousedown guard on toolbar buttons to keep current selection intact.
  - improved link + clear command fallback behavior.

- File updated:
  - `admin.html`

- Validation:
  - inline script parse check passed for `admin.html`.

## Legal Editor Runtime Fix: Quill Migration (2026-03-27)

- Completed:
  - migrated admin legal editor from custom contenteditable command handling to Quill rich-text editor.
  - enabled native active-state behavior and standardized toolbar interactions for bold/italic/underline/list/link/clear.
  - preserved safe legal-content rendering path via existing sanitization layer.

- File updated:
  - `admin.html`

- Validation:
  - inline script parse check passed for `admin.html`.

## Legal Editor Toolbar Enhancement (2026-03-27)

- Completed:
  - added text-structure controls:
    - `Body`
    - `Heading 1` to `Heading 5`
  - improved hyperlink UI theming in editor and link tooltip controls to match admin design system.

- File updated:
  - `admin.html`

- Validation:
  - inline script parse check passed for `admin.html`.

## Admin Binary Tree Parity Sync (2026-04-03)

- Completed:
  - ported user-side binary-tree placement/scoping logic into admin tree builder.
  - added support for newer placement variants in admin tree parsing:
    - `spillover-left`, `spillover-right`
    - `extreme-left`, `extreme-right`
    - plus legacy `spillover` compatibility.
  - aligned cutoff baseline handling with user-side behavior for members created after cutoff baseline timestamps.
  - aligned admin tree node scoping/anonymized spillover behavior with user-side subtree ownership logic.
  - excluded preferred/free-account members from admin binary-tree node construction (parity with member tree eligibility rules).

- Files updated:
  - `admin.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - inline script parse check passed for `admin.html` (`2` inline blocks parsed).

- Notes / limitations:
  - admin enrollment form UI still shows legacy placement options only; tree parser now supports newer placement values when present in stored member records.

### Follow-up (same day)

- Completed:
  - replaced legacy admin placement select (`left/right/spillover`) with full user-side placement options:
    - `left`, `right`, `spillover-left`, `spillover-right`, `extreme-left`, `extreme-right`.
  - added `Spillover Parent Assignment` mode (`auto` / `manual`) to admin enroll form.
  - aligned admin spillover suggestion visibility/validation with user-side flow (manual-only parent selection).
  - aligned admin enrollment submit placement parsing/validation with user-side:
    - direct slot availability checks
    - normalized spillover side resolution
    - manual parent reference validation
  - aligned enrolled-member placement badges with user-side normalized placement labels.
  - aligned admin binary-tree renderer spillover highlight mode to user-side (`received-only`).

- Updated limitation:
  - legacy placement-option limitation is now resolved; admin enroll placement flow now matches user-side placement behavior.

## Recent Update (2026-04-03) - Admin Binary Tree UI Control Parity (User-Side 1:1)

- Admin binary-tree page now mirrors user-side binary-tree controls/overlays and interaction behavior.
- Added missing parity UI elements:
  - tree settings button + settings window
  - tree direct-sponsor search toggle
  - mobile right-actions cluster (enroll/direct/minimap/root/settings)
  - tree enroll modal overlay/form with placement lock summary.
- Added user-side cursor/pan visual parity:
  - spacebar-pan mode now shows grab/grabbing cursor classes via CSS (`tree-pan-mode-active`, `tree-pan-mode-dragging`).
- Added tree settings/enroll JS lifecycle parity:
  - settings open/close, interaction control sync, reverse trackpad + zoom-strength updates
  - enroll modal open/close from tree events (`binary-tree-enroll-member-request`, `binary-tree-enroll-mode-changed`)
  - Escape-key close handling for tree overlays
  - tree enroll submit wired through admin enrollment API path and tree refresh flow.
- Added summary metric parity IDs/UI:
  - `tree-summary-total-direct-sponsor`
  - `tree-fullscreen-summary-total-direct-sponsor`
- Validation completed:
  - extracted inline admin script passes `node --check`
  - binary-tree section diffed against user-side and now matches structure 1:1.

### Active Scope Notes

- Admin-side enrollment business logic remains intentionally admin-specific:
  - submission path still uses admin registered-member endpoint
  - success messaging keeps admin no-fast-track-credit wording.
- Current priority status:
  - binary-tree UI/control parity request is implemented.

## Recent Update (2026-04-03) - Admin Tree Icon Bug Fix (`face` / `settings`)

- Resolved icon rendering bug where tree control buttons showed text fallback instead of glyph icons.
- Fix applied in `admin.html`:
  - added Material Symbols font import.
  - added base `.material-symbols-outlined` style mapping so icon spans resolve correctly.
- Result:
  - `Settings` and `Direct Sponsors` controls now render icons like user-side tree.

## Recent Update (2026-04-03) - Achievement Rank Icons (Draft Pack)

- Completed:
  - created a new icon asset set for profile achievement row left-side visuals.
  - generated six SVG icons aligned to rank contexts (`diamond`, `blue-diamond`, `black-diamond`, `crown`, `double-crown`, `royal-crown`).
  - added icon pack README for quick mapping/use.

- Files updated:
  - `brand_assets/Icons/Achievements/README.md`
  - `brand_assets/Icons/Achievements/diamond.svg`
  - `brand_assets/Icons/Achievements/blue-diamond.svg`
  - `brand_assets/Icons/Achievements/black-diamond.svg`
  - `brand_assets/Icons/Achievements/crown.svg`
  - `brand_assets/Icons/Achievements/double-crown.svg`
  - `brand_assets/Icons/Achievements/royal-crown.svg`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Active limitations:
  - this limitation was resolved in follow-up update `Achievement Icons Wired in Profile List` (same day).

- Next suggested integration step:
  - completed in follow-up: icon mapping is now server-side (`iconPath`) and rendered in profile achievement rows.

## Recent Update (2026-04-03) - Achievement Icons Wired in Profile List

- Completed:
  - added server-side icon mapping to Good Life achievements payload (`iconPath` per rank milestone).
  - wired profile achievement rows to render left-side icons next to achievement text.
  - kept fallback icon map in `index.html` for safe local/default rendering.
  - added path-validation guard for achievement icon URLs before rendering.

- Files updated:
  - `backend/services/member-achievement.service.js`
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - backend service syntax check passed.
  - `index.html` inline scripts parse check passed.

- Current limitation:
  - only current Good Life achievement set is icon-mapped; future categories/rank tracks need icon metadata added as they are introduced.

## Recent Update (2026-04-03) - Achievement Light Icons + Theme-Aware Swap

- Completed:
  - generated light-mode variants for all Good Life achievement icons.
  - added server-side `iconLightPath` metadata to the achievement payload.
  - updated profile achievement icon resolver to use light icons in light theme and dark icons otherwise.
  - added achievement list re-render on theme change so icon swap is immediate.

- Files updated:
  - `brand_assets/Icons/Achievements/diamond-light.svg`
  - `brand_assets/Icons/Achievements/blue-diamond-light.svg`
  - `brand_assets/Icons/Achievements/black-diamond-light.svg`
  - `brand_assets/Icons/Achievements/crown-light.svg`
  - `brand_assets/Icons/Achievements/double-crown-light.svg`
  - `brand_assets/Icons/Achievements/royal-crown-light.svg`
  - `brand_assets/Icons/Achievements/README.md`
  - `backend/services/member-achievement.service.js`
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - backend service syntax check passed.
  - `index.html` inline script parse check passed.

- Current limitation:
  - icon mappings are defined for the current Good Life set; future achievement categories must add both dark and light icon metadata when introduced.

## Recent Update (2026-04-03) - User Settings Sidebar Route Fix + Dedicated Settings Page

- Completed:
  - fixed user-side sidebar `Settings` action that previously routed to `Binary Tree`.
  - converted sidebar Settings into standard nav routing (`data-page="settings"`, route `/Settings`).
  - added a dedicated user settings page (`page-settings`) with:
    - account summary (name/username/rank)
    - theme selector
    - profile shortcut button
    - logout button.
  - added page metadata + route mapping for `settings`.
  - removed legacy custom click handler that forced Binary Tree settings modal open.
  - synced theme state across both selectors (`#theme-switcher` and `#settings-theme-switcher`).

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `index.html` inline scripts parse check passed.

- Current limitation:
  - Binary Tree interaction-specific controls remain in the Binary Tree settings modal by design; sidebar Settings is now a separate workspace page.

## Recent Update (2026-04-03) - Rank Advancement Moved to Dedicated Success Ladder Component

- Completed:
  - moved Rank Advancement UI out of the generic achievement-tab surface into a dedicated profile component (`Success Ladder`).
  - kept `Premiere Life` in the existing achievement center while handling rank progression in its own section.
  - wired the new ladder rendering + claim interaction end-to-end.
  - ensured ladder requirements read from server payload prerequisites/requirements (cycles, direct sponsor pair, active, system verification).
  - preserved explicit left/right pair semantics (`1:1`, `2:2`, etc.) and personal-enrollment wording for direct sponsors.

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - backend syntax check passed (`node --check backend/services/member-achievement.service.js`).
  - `index.html` inline script parse check passed (`index-inline-script:ok`).
  - two localhost QA screenshots captured:
    - `temporary screenshots/screenshot-1-ladder-pass1.png`
    - `temporary screenshots/screenshot-1-ladder-pass2.png`

- Current limitation:
  - screenshot captures in this pass landed on the login screen (profile view is auth-gated), so direct visual verification of the ladder section still needs an authenticated capture pass.

## Recent Update (2026-04-03) - Rank Advancement Success Ladder Converted to Carousel

- Completed:
  - converted Rank Advancement view from list/timeline to carousel card flow.
  - added Previous/Next controls plus dot navigation for quick rung switching.
  - kept rank claim action available directly on each carousel slide.
  - retained all existing requirement/prerequisite progress labels (left/right direct pair, cycles, active, verified).

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - backend syntax check passed (`node --check backend/services/member-achievement.service.js`).
  - `index.html` inline script parse check passed (`index-inline-script:ok`).

## Recent Update (2026-04-03) - Rank Advancement UI Redesign (Carousel)

- Completed:
  - fully redesigned Rank Advancement visuals while retaining carousel behavior.
  - upgraded slide layout with milestone chip, status chip, progress bars, and dedicated claim panel.
  - redesigned navigation controls (prev/next circle buttons + numbered jump pills + step counter).
  - added rank milestone fallback data path so carousel still appears when server rank payload is empty.

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - backend syntax check passed (`node --check backend/services/member-achievement.service.js`).
  - `index.html` inline script parse check passed (`index-inline-script:ok`).
  - authenticated profile screenshot QA confirms redesigned carousel rendering.

## Recent Update (2026-04-03) - Achievement Icon Size Increase

- Completed:
  - increased Rank Advancement carousel icon size for stronger visual emphasis.
  - increased Profile Achievement list icon size for consistency with the redesigned carousel.

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - backend syntax check passed (`node --check backend/services/member-achievement.service.js`).
  - `index.html` inline script parse check passed (`index-inline-script:ok`).
  - authenticated profile screenshot QA completed.

## Recent Update (2026-04-03) - Rank Advancement Converted to Monthly Running System

- Completed:
  - changed rank rewards from lifetime milestone claims to monthly-run claims.
  - implemented monthly rank claim periods (`YYYY-MM`) with reset behavior each month.
  - enforced one rank claim per month (server + database enforcement).
  - enforced highest-eligible-rank-only claim rule for monthly rank rewards.
  - kept non-rank achievements as one-time/lifetime claims.
  - updated profile rank carousel copy to monthly run guidance.

- Files updated:
  - `backend/stores/member-achievement.store.js`
  - `backend/services/member-achievement.service.js`
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `node --check backend/stores/member-achievement.store.js` passed.
  - `node --check backend/services/member-achievement.service.js` passed.
  - `index.html` inline script parse check passed (`index-inline-script:ok`).
  - authenticated profile screenshot QA completed (2 passes).

## Recent Update (2026-04-03) - Rank Carousel Moved Above Achievements + Name Labels

- Completed:
  - moved Rank carousel component above the Achievement component in Profile layout.
  - replaced numeric rank indicators (`1..9`) with rank name labels in carousel navigation and display helper text.

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - backend syntax checks passed.
  - `index.html` inline script parse check passed (`index-inline-script:ok`).
  - authenticated profile screenshot QA completed (2 passes).

## Recent Update (2026-04-03) - Rank Carousel Container Reduction

- Completed:
  - simplified rank carousel markup by reducing extra nested wrappers/containers.
  - retained existing carousel controls, claim behavior, and progress visuals.
  - improved semantic structure with cleaner `section/header/article/aside` and list usage.

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `index.html` inline script parse check passed (`index-inline-script:ok`).

## Recent Update (2026-04-03) - Rank Header Renamed + Tag to Caption

- Completed:
  - changed profile rank section title from `Success Ladder Carousel` to `Rank Advancement Bonus`.
  - adjusted the small label style to a caption presentation (removed uppercase tag-like treatment).

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `index.html` inline script parse check passed (`index-inline-script:ok`).

## Recent Update (2026-04-03) - Rank Advancement Bonus Component Restored

- Completed:
  - rebuilt the profile rank component as `Rank Advancement Bonus` after accidental Good Life overwrite.
  - restored rank carousel rendering from rank achievements data (requirements/prerequisites/claim states).
  - restored rank claim button binding and channel-specific feedback routing for rank-ladder claim actions.
  - confirmed New Good Life component was not modified during this restoration.

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `index.html` inline script parse check passed (`index-inline-script:ok`).

## Recent Update (2026-04-03) - Standalone Good Life Monthly Progression (Above Achievements)

- Completed:
  - restored Good Life as a standalone monthly progression section above `Profile Achievements`.
  - kept `Rank Advancement Bonus` behavior and renderer untouched.
  - rewired Good Life load/claim to its own panel state and feedback channel (no rank-ladder coupling).
  - added monthly Good Life claim click binding in profile module initialization.
  - added Good Life refresh when member rank changes and on theme switch for dark/light icons.
  - retained server-side authenticated API + DB-backed monthly progression/claim flow.

- Files updated:
  - `index.html`
  - `backend/app.js`
  - `backend/routes/member-good-life.routes.js`
  - `backend/controllers/member-good-life.controller.js`
  - `backend/services/member-good-life.service.js`
  - `backend/stores/member-good-life.store.js`
  - `backend/services/member-achievement.service.js`
  - `backend/stores/member-achievement.store.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - backend syntax checks passed (`node --check` on updated backend files).
  - `index.html` inline script parse check passed (`Inline scripts parse OK: 4`).
  - screenshot workflow executed (2 passes), but captures remained on login route; authenticated profile visual verification is pending in an authenticated browser session.

## Recent Update (2026-04-03) - Achievement Panel Switched Back to Premiere Life

- Completed:
  - removed rank from the visible Achievement component tab flow.
  - restored `Premiere Life` tab and `Premiere Journey` category.
  - added server-side `Enroll a Member` achievement with merch claim labeling.
  - wired requirement to total personal enrollments (`requiredDirectSponsorsTotal: 1`).
  - updated achievement card UI to support non-cash reward labels and show `Claim merch` when eligible.
  - retained rank achievements in payload for the standalone Rank Advancement Bonus component compatibility.

- Files updated:
  - `index.html`
  - `backend/services/member-achievement.service.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `node --check backend/services/member-achievement.service.js` passed.
  - `index.html` inline script parse check passed (`Inline scripts parse OK: 2`).

## Recent Update (2026-04-03) - Achievement List Reduced to Two Text Lines

- Completed:
  - list cards now render only:
    - achievement title
    - one detail line (requirement text or fallback description)
  - removed additional list text lines (prerequisites, progress lines, lock/status/payout text, reward label text chip).
  - kept claim button logic unchanged.

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `index.html` inline script parse check passed (`Inline scripts parse OK: 2`).

## Recent Update (2026-04-03) - Reward Text Re-added to Achievement List

- Completed:
  - restored reward text chip in achievement list cards.
  - retained simplified left content structure.

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `index.html` inline script parse check passed (`Inline scripts parse OK: 2`).

## Recent Update (2026-04-03) - Legacy Director "0/3" Text Removed

- Completed:
  - removed the Legacy Director text line that displayed `...Legacy Builder Package members 0/3`.
  - suppressed the same message from lock-reason rendering for Legacy Director.
  - kept eligibility logic intact; this is display/copy cleanup.

- Files updated:
  - `backend/services/member-achievement.service.js`
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `node --check backend/services/member-achievement.service.js` passed.
  - `index.html` inline script parse check passed (`Inline scripts parse OK: 2`).

## Recent Update (2026-04-03) - Requirements Label Removal Follow-Up

- Completed:
  - removed replacement label (`Checklist`) and kept plain requirement text only.
  - adjusted bonus completion copy to avoid introducing a new replacement label phrase.

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `index.html` inline script parse check passed (`Inline scripts parse OK: 2`).

## Recent Update (2026-04-03) - Legacy Director Text Simplified

- Completed:
  - removed `Personally enroll ...` wording for Legacy Director text and replaced with `Enroll ...`.
  - updated backend and fallback copy so the same phrase is consistent across UI and lock messages.
  - no achievement logic changes.

- Files updated:
  - `backend/services/member-achievement.service.js`
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `node --check backend/services/member-achievement.service.js` passed.
  - `index.html` inline script parse check passed (`Inline scripts parse OK: 2`).

## Recent Update (2026-04-03) - Duplicate Middle Text Removed in Achievement Card

- Completed:
  - removed duplicated middle text line from achievement card body.
  - removed unused `requirementSummary` computation.
  - retained progress lines and all claim/eligibility behavior.

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `index.html` inline script parse check passed (`Inline scripts parse OK: 2`).

## Recent Update (2026-04-03) - Rank Icon Expansion (Ruby/Emerald/Sapphire + Light Variants)

- Completed:
  - added new rank icon assets for early Rank Advancement milestones:
    - `ruby.svg` / `ruby-light.svg`
    - `emerald.svg` / `emerald-light.svg`
    - `sapphire.svg` / `sapphire-light.svg`
  - replaced Ruby/Emerald/Sapphire icon mapping so these ranks no longer point to Diamond artwork.
  - updated both backend achievement payload mappings and frontend fallback/icon lookup mappings.
  - updated icon pack README to include the new files.

- Files updated:
  - `brand_assets/Icons/Achievements/ruby.svg`
  - `brand_assets/Icons/Achievements/ruby-light.svg`
  - `brand_assets/Icons/Achievements/emerald.svg`
  - `brand_assets/Icons/Achievements/emerald-light.svg`
  - `brand_assets/Icons/Achievements/sapphire.svg`
  - `brand_assets/Icons/Achievements/sapphire-light.svg`
  - `brand_assets/Icons/Achievements/README.md`
  - `backend/services/member-achievement.service.js`
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `node --check backend/services/member-achievement.service.js` passed.
  - `index.html` inline script parse check passed (`Inline scripts parse OK: 2`).

## Recent Update (2026-04-03) - Icon Sharpness Pass (Ruby/Emerald/Sapphire)

- Completed:
  - refined Ruby/Emerald/Sapphire achievement icons (dark + light) to render cleaner in small UI containers.
  - removed tiny decorative details that caused soft/jagged output at reduced sizes.
  - increased primary edge definition and added geometric rendering hints in SVG files.
  - added shared `.achievement-icon-image` render class and applied it to profile achievement icon image paths (rank ladder, Good Life, achievement list).

- Files updated:
  - `brand_assets/Icons/Achievements/ruby.svg`
  - `brand_assets/Icons/Achievements/ruby-light.svg`
  - `brand_assets/Icons/Achievements/emerald.svg`
  - `brand_assets/Icons/Achievements/emerald-light.svg`
  - `brand_assets/Icons/Achievements/sapphire.svg`
  - `brand_assets/Icons/Achievements/sapphire-light.svg`
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `node --check backend/services/member-achievement.service.js` passed.
  - `index.html` inline script parse check passed (`Inline scripts parse OK: 2`).

## Recent Update (2026-04-03) - Icon Sharpness Pass Rolled Back per Design Feedback

- Completed:
  - rolled back Ruby/Emerald/Sapphire icon artwork (dark + light) to the previous style.
  - retained existing icon wiring/mapping behavior in UI and payload.

- Files updated:
  - `brand_assets/Icons/Achievements/ruby.svg`
  - `brand_assets/Icons/Achievements/ruby-light.svg`
  - `brand_assets/Icons/Achievements/emerald.svg`
  - `brand_assets/Icons/Achievements/emerald-light.svg`
  - `brand_assets/Icons/Achievements/sapphire.svg`
  - `brand_assets/Icons/Achievements/sapphire-light.svg`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `index.html` inline script parse check passed (`Inline scripts parse OK: 2`).

## Recent Update (2026-04-03) - Profile Text Cleanup (Remove Bracket Markers + System Verified)

- Completed:
  - removed `[x]` / `[ ]` symbols from profile requirement and prerequisite display strings.
  - removed `System Verified` from rank advancement checklist display.
  - filtered out system-verification prerequisite labels from visible prerequisite text in profile achievements.
  - preserved existing eligibility logic and component structure for:
    - `Rank Advancement Bonus`
    - `Good Life Monthly Progression`
    - `Profile Achievements`

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `index.html` inline script parse check passed (`Inline scripts parse OK: 2`).

## Recent Update (2026-04-03) - Placeholder Icon Added for Premiere Journey Achievement

- Completed:
  - added placeholder icon assets (`dark` + `light`) for achievement use.
  - replaced the visible Premiere Journey achievement (`Enroll a Member`) icon from Diamond to Placeholder.
  - kept rank Diamond icon mappings unchanged.

- Files updated:
  - `brand_assets/Icons/Achievements/placeholder.svg`
  - `brand_assets/Icons/Achievements/placeholder-light.svg`
  - `brand_assets/Icons/Achievements/README.md`
  - `backend/services/member-achievement.service.js`
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `node --check backend/services/member-achievement.service.js` passed.
  - `index.html` inline script parse check passed (`Inline scripts parse OK: 2`).

## Recent Update (2026-04-03) - Good Life Copy Text Removed

- Completed:
  - removed `Battlepass-style monthly progression.` text from the Good Life Monthly Progression panel.
  - retained the remaining claim-guidance sentence.

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - not run (text-only copy change).

## Recent Update (2026-04-03) - Rank Balance Message Copy Clarified

- Completed:
  - changed rank lock-reason copy from `Direct sponsors this month must be balanced...` to `Direct sponsors for this rank must be balanced...`.
  - preserved all requirement logic and progress values.

- Files updated:
  - `backend/services/member-achievement.service.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `node --check backend/services/member-achievement.service.js` passed.

## Recent Update (2026-04-03) - Rank Direct Requirement Groups Fixed

- Completed:
  - fixed rank direct sponsor pair requirements to the correct grouped logic:
    - Ruby/Emerald/Sapphire = `1:1`
    - Diamond/Blue Diamond/Black Diamond = `2:2`
    - Crown/Double Crown/Royal Crown = `3:3`
  - applied the fix in both backend achievement definitions and frontend fallback rank definitions.

- Files updated:
  - `backend/services/member-achievement.service.js`
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `node --check backend/services/member-achievement.service.js` passed.
  - `index.html` inline script parse check passed (`index-inline-script:ok`).

## Recent Update (2026-04-03) - Pack Rank Icons Added (Personal/Business/Infinity/Legacy)

- Completed:
  - added icon set (dark + light) for pack ranks:
    - Personal (`Bronze`)
    - Business (`Silver`)
    - Infinity (`Gold`)
    - Legacy (`Platinum`)
  - added new rank icon ids to profile icon map:
    - `rank-personal`, `rank-business`, `rank-infinity`, `rank-legacy`
  - extended profile badge rank matching so these ranks now resolve to their own icons.
  - updated achievements icon README to include new icon files and metal mapping labels.

- Files updated:
  - `brand_assets/Icons/Achievements/personal.svg`
  - `brand_assets/Icons/Achievements/personal-light.svg`
  - `brand_assets/Icons/Achievements/business.svg`
  - `brand_assets/Icons/Achievements/business-light.svg`
  - `brand_assets/Icons/Achievements/infinity.svg`
  - `brand_assets/Icons/Achievements/infinity-light.svg`
  - `brand_assets/Icons/Achievements/legacy.svg`
  - `brand_assets/Icons/Achievements/legacy-light.svg`
  - `brand_assets/Icons/Achievements/README.md`
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `index.html` inline script parse check passed (`Inline scripts parse OK: 2`).

## Recent Update (2026-04-03) - Pack Icons Redesigned (No Background Box)

- Completed:
  - redesigned pack rank icon set for:
    - Personal (Bronze)
    - Business (Silver)
    - Infinity (Gold)
    - Legacy (Platinum)
  - removed square/tile background from these icons (transparent outer canvas).
  - kept dark + light variants and existing filenames so mappings continue to work without code changes.

- Files updated:
  - `brand_assets/Icons/Achievements/personal.svg`
  - `brand_assets/Icons/Achievements/personal-light.svg`
  - `brand_assets/Icons/Achievements/business.svg`
  - `brand_assets/Icons/Achievements/business-light.svg`
  - `brand_assets/Icons/Achievements/infinity.svg`
  - `brand_assets/Icons/Achievements/infinity-light.svg`
  - `brand_assets/Icons/Achievements/legacy.svg`
  - `brand_assets/Icons/Achievements/legacy-light.svg`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - verified no outer background box layers in redesigned pack icons.
  - `index.html` inline script parse check passed (`Inline scripts parse OK: 2`).

## Recent Update (2026-04-03) - Time-Limited Event Title Ladder + Catalog Cleanup

- Completed:
  - finalized Time-Limited Event to 4 claimable title rewards:
    - Foundation Level: `Legacy Founder`
    - Level 2: `Legacy Director`
    - Level 3: `Legacy Ambassador`
    - Top Level: `Presidential Circle`
  - updated fallback achievement snapshot in `index.html` to match backend ids/copy and removed old `Presidential Ambassador` legacy fallback item.
  - added seed-sync cleanup logic so stale system-seeded event titles are auto-deactivated from `member_title_catalog`.
  - verified catalog now returns the intended active claimable titles only.

- Files updated:
  - `backend/services/member-achievement.service.js`
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `node --check backend/services/member-achievement.service.js` passed.
  - `node --check backend/stores/member-title-catalog.store.js` passed.
  - `index.html` inline script parse check passed (`Inline scripts parse OK: 2`).
  - DB check confirmed:
    - active: `legacy-founder`, `legacy-director`, `legacy-ambassador`, `presidential-circle`
    - old `presidential-ambassador` is inactive.

## Recent Update (2026-04-03) - Removed "Requirements" Wording from UI Copy

- Completed:
  - replaced visible `Requirements:` label with `Checklist:` in profile achievements.
  - removed `Requirements` wording from direct sponsorship and tier unlock helper text.
  - changed bonus completion text from `requirements met` to `conditions met`.
  - changed backend fallback error message to `Current progress does not meet ...`.
  - preserved all achievement logic/data shape (text-only update).

- Files updated:
  - `index.html`
  - `backend/services/member-achievement.service.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `node --check backend/services/member-achievement.service.js` passed.
  - `index.html` inline script parse check passed (`Inline scripts parse OK: 2`).

## Recent Update (2026-04-03) - User Dashboard Account Rank Card Uses Rank Icon

- Completed:
  - replaced the Account Overview -> Account Rank card??????????????????s static star icon with a rank badge image element.
  - added `renderAccountRankIcon()` so the icon tracks the current account rank dynamically.
  - hooked icon refresh into:
    - initial load
    - binary tree summary rank updates
    - theme changes (dark/light icon variants)

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - screenshot command against `http://127.0.0.1:5500` failed (`ERR_EMPTY_RESPONSE`).
  - executed two screenshot passes on `http://localhost:3000`:
    - `temporary screenshots/screenshot-17-rank-icon-pass1.png`
    - `temporary screenshots/screenshot-18-rank-icon-pass2.png`
  - verified code wiring for icon updates across initialization, rank refresh, and theme switch paths.

## Recent Update (2026-04-03) - Settings Page Redesigned to Category + List UI

- Completed:
  - redesigned `Settings` page from dual cards to a category-first list layout.
  - added a left category rail and right-side list sections:
    - Account & Identity
    - Appearance
    - Session & Security
  - retained all existing settings page behavior IDs to avoid JS regressions.
  - adjusted helper text sizing in setting rows for improved mobile readability.

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `Inline scripts parse OK: 2`.
  - authenticated desktop pass:
    - `temporary screenshots/screenshot-22-settings-redesign-pass2-desktop-final.png`
  - authenticated mobile pass:
    - `temporary screenshots/screenshot-23-settings-redesign-pass3-mobile-final.png`
  - note: required `127.0.0.1:5500` screenshot target returned `ERR_EMPTY_RESPONSE`; verification used active localhost app on `3000`.

## Recent Update (2026-04-03) - Settings Categories Now Use Active Side-Nav Switching

- Completed:
  - converted Settings category list into side-nav buttons:
    - Account
    - Appearance
    - Security
  - implemented active category state and one-panel visibility behavior.
  - only the selected category panel is shown at a time.
  - expanded Security panel rows for:
    - Forgot Password
    - Change Password
    - Logout All Sessions
  - added security feedback messaging for non-wired password actions.

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `Inline scripts parse OK: 2`.
  - desktop switch flow:
    - `temporary screenshots/screenshot-24-settings-cats-pass1-account.png`
    - `temporary screenshots/screenshot-25-settings-cats-pass1-appearance.png`
    - `temporary screenshots/screenshot-26-settings-cats-pass1-security.png`
  - mobile switch flow:
    - `temporary screenshots/screenshot-27-settings-cats-pass2-mobile-account.png`
    - `temporary screenshots/screenshot-28-settings-cats-pass2-mobile-security.png`

## Recent Update (2026-04-04) - Settings Personal Details + Payment/Billing Categories Finalized

- Completed:
  - finalized Settings side-nav categories to:
    - Account
    - Payment and Billing
    - Security
    - Appearance
  - removed numeric-looking category labels from Settings side-nav text.
  - expanded Account category with editable personal/profile fields:
    - Display Name, Email
    - read-only Username
    - Personal Information (name, birthdate, gender, address, city, region, zip, country)
  - removed Current Rank from Settings Account form scope as requested.
  - added Payment and Billing category panel with:
    - card details mount placeholder
    - Stripe billing/address documentation links
    - billing address fields
    - `Same as address` toggle linked to personal address inputs
  - retained Security + Appearance categories under active one-panel-at-a-time switching.

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `Inline scripts parse OK: 1`.
  - screenshot pass (unauthenticated gate):
    - `temporary screenshots/screenshot-33-settings-redesign-pass1.png`
  - authenticated Settings pass (Account active):
    - `temporary screenshots/screenshot-34-settings-redesign-pass2-auth.png`
  - authenticated Settings pass (Payment active, Account hidden):
    - `temporary screenshots/screenshot-35-settings-redesign-pass3-payment-auth.png`

## Recent Update (2026-04-04) - Account Details Now Matches Security Layout + Change Email Button

- Completed:
  - refactored Settings -> Account -> Account Details into Security-style row/list layout.
  - removed direct inline email input from Account Details.
  - added `Change Email` action button (button-first interaction).
  - added `Edit Display Name` action button to keep Account Details interaction style consistent.
  - kept Username read-only with a visible `Not editable` status badge.
  - retained existing `Save Account Details` persistence flow using hidden account fields as state carriers.

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `Inline scripts parse OK: 1`.
  - account layout pass:
    - `temporary screenshots/screenshot-36-settings-account-security-layout-pass1-auth.png`
  - security layout reference pass:
    - `temporary screenshots/screenshot-37-settings-security-layout-pass2-auth.png`
  - account action flow check:
    - `No console/page errors detected in Account Details button flow.`

## Recent Update (2026-04-04) - Email Verification Label Is Now Server-Authenticated

- Completed:
  - added new authenticated endpoint `GET /api/member-auth/email-verification-status`.
  - endpoint now returns server-derived email verification state and metadata.
  - wired Settings Account email row to show server-authenticated verification status text.
  - added mismatch detection when local email differs from server email.
  - status refresh now runs when opening Settings and after email/account updates.

- Files updated:
  - `backend/stores/user.store.js`
  - `backend/services/auth.service.js`
  - `backend/controllers/auth.controller.js`
  - `backend/routes/auth.routes.js`
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - backend `node --check` passed for all changed auth/store files.
  - `Inline scripts parse OK: 1`.
  - API smoke check:
    - login `200`
    - email verification status `200`
  - screenshot pass 1 (server-authenticated status):
    - `temporary screenshots/screenshot-38-settings-email-verification-pass1-auth.png`
  - screenshot pass 2 (local email mismatch state):
    - `temporary screenshots/screenshot-39-settings-email-verification-pass2-local-mismatch.png`

## Recent Update (2026-04-06) - Tab Titles Finalized for Premiere Life + Visible Charge Label Cleanup

- Completed:
  - finalized member login title to `Login to Premiere Life`.
  - finalized dashboard titles to `Dashboard - Premiere Life` on:
    - member dashboard (`index.html`)
    - admin dashboard (`admin.html`)
    - store dashboard (`store-dashboard.html`)
  - normalized remaining app/store tab titles to the `Page - Premiere Life` style.
  - removed remaining visible `charge` labels from page UI copy:
    - `charge.admin_users` -> `admin_users` in admin login helper text
    - `shop.charge.com?...` -> `shop.premierelife.com?...` fallback display text

- Files updated:
  - `login.html`
  - `index.html`
  - `admin.html`
  - `admin-login.html`
  - `password-setup.html`
  - `store.html`
  - `store-login.html`
  - `store-dashboard.html`
  - `store-register.html`
  - `store-password-setup.html`
  - `store-product.html`
  - `store-checkout.html`
  - `store-support.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - all page titles confirmed from source scan:
    - `rg -n "document\\.title|<title>" -S *.html`
  - no remaining visible HTML text containing `charge`:
    - `rg -n "(?i)>[^<]*charge[^<]*<" -S --pcre2 *.html`
  - no `shop.charge.com` or `charge.admin_users` in HTML:
    - `rg -n "shop\\.charge\\.com|charge\\.admin_users" -S *.html`

- Follow-up:
  - adjusted login wording in `login.html` to exact requested phrase:
    - tab title: `Premiere Life Login`
    - login heading: `Premiere Life Login`

## Recent Update (2026-04-06) - Unattributed Free Accounts Park Under Admin Holding + Admin Can Reassign Sponsor

- Completed:
  - changed public storefront free-account checkout behavior for no-attribution flow:
    - no referral link no longer forces fallback sponsor attribution.
    - checkout intent now returns empty `attributionKey` when no `store` attribution is present.
  - implemented admin-holding enrollment path for unattributed free-account creation:
    - auto-enrollment now uses configurable holding sponsor username (default `admin`).
  - implemented admin sponsor reassignment support on registered-member placement API:
    - admin route now flags placement update as admin context.
    - admin can change `sponsorUsername` during placement update.
    - linked member user's `attributionStoreCode` now syncs to reassigned sponsor attribution code.

- Files updated:
  - `backend/services/store-checkout.service.js`
  - `backend/services/member.service.js`
  - `backend/controllers/member.controller.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/public-store-page.md`

- Validation:
  - `node --check backend/services/store-checkout.service.js`
  - `node --check backend/services/member.service.js`
  - `node --check backend/controllers/member.controller.js`
  - fresh backend validation on `PORT=3132`:
    - no-attribution free-account intent -> `checkout.attributionKey: ""`
    - attributed (`storeCode=CHG-ZERO`) free-account intent -> `checkout.attributionKey: "CHG-ZERO"`
  - admin sponsor reassignment API validated with rollback to original test state.

- Notes:
  - no dedicated admin UI control for reassignment added in this pass; backend support is now available for admin-driven assignment workflows.

## Recent Update (2026-04-06) - Admin Preferred Customers Page Added for Parked Free Accounts

- Completed:
  - converted Admin sidebar `Preferred Customers` item from placeholder to routed nav link:
    - `/admin/PreferredCustomers`
  - added new Admin page view for Preferred Customers with:
    - total preferred count
    - parked (admin holding) count
    - assigned count
    - detailed preferred-customer list (sponsor + created timestamp)
  - wired route/page metadata + page switching logic for `preferred-customers`.
  - implemented preferred-customer renderer backed by `registeredMembers` state.
  - tagged parked records under admin-holding sponsor identity so unattributed free accounts are visible in this page.
  - added refresh action for live reload of preferred-customer records.

- Files updated:
  - `admin.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - inline script parse check passed (`Inline scripts parse OK: 5`).
  - source checks confirmed preferred-customers nav/route/page bindings.
  - `GET /admin/PreferredCustomers` serves admin shell with preferred-customers page section.

- Notes:
  - this update focuses on parked preferred-customer visibility in Admin.
  - transfer/reassignment action buttons are not yet embedded in this page UI (backend reassignment support is already available).

## Recent Update (2026-04-06) - User Dashboard Stripe Card Text Now Dark/Light Theme-Aware

- Completed:
  - hardened dashboard checkout Stripe card field styling so typed text/placeholder colors adapt to app theme.
  - added dedicated card style resolver for dark/light tokens (`resolveStoreStripeCardStyle`).
  - updated theme-sync flow to refresh both Stripe Elements appearance and the mounted Card Element style.
  - updated initial Card Element mount config to include theme-aware style at creation time.

- File updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/public-store-page.md`

- Validation:
  - inline script parse check passed:
    - `All inline scripts parsed successfully. Blocks: 2`

## Recent Update (2026-04-06) - User Preferred Customer List Now Shows Admin-Transferred Accounts

- Completed:
  - fixed user-side `Preferred Customer` planner visibility so assigned/transferred preferred members appear even with zero purchases.
  - removed invoice-only visibility gate that previously filtered out transferred records lacking matched invoice history.
  - preserved invoice aggregation metrics for members with purchases.
  - updated empty-state copy to assignment-based wording.

- File updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/preferred-customer-page.md`

- Validation:
  - inline script parse check passed:
    - `All inline scripts parsed successfully. Blocks: 2`

## Recent Update (2026-04-07) - Light Mode Sidebar Polish, Nav Reorder, Material Icons, Premiere Logo Enforcement

- Completed:
  - removed sidebar/header search UI from dashboard shell.
  - applied exact requested sidebar nav structure:
    - `Explore > General`: Home, My Store, E-Wallet
    - `Build`: Binary Tree, Enroll Member, Preferred Customers
    - `Records`: Purchases, Commissions, Library
  - migrated sidebar navigation icons to official Google Material Symbols and fixed icon text-fallback issue by broadening font import.
  - tuned light-mode sidebar surface and interaction states for cleaner Apple/21st-style feel.
  - enforced Premiere Life-only logo usage in sidebar (removed non-Premiere light variant in active markup).
  - increased logo shell/image sizing to avoid clipped/undersized logo in light mode.

- File updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - light-mode screenshot verification completed across multiple passes:
    - `temporary screenshots/screenshot-48-light-sidebar-check-pass1.png`
    - `temporary screenshots/screenshot-49-light-sidebar-check-pass2.png`
    - `temporary screenshots/screenshot-50-light-sidebar-check-pass3.png`
    - `temporary screenshots/screenshot-51-light-sidebar-premiere-only.png`

## Recent Update (2026-04-07) - Sidebar Header Updated To New L&D Icon

- Completed:
  - replaced sidebar top logo image with new icon asset:
    - `/brand_assets/Logos/L&D Icon.svg`
  - removed theme-dependent sidebar logo swapping and switched to one icon-only header treatment.
  - tuned icon shell/image sizing so the icon sits cleanly and consistently in the sidebar header.

- File updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - screenshot verification completed in both themes:
    - `temporary screenshots/screenshot-52-sidebar-icon-light.png`
    - `temporary screenshots/screenshot-53-sidebar-icon-dark.png`

## Recent Update (2026-04-07) - Sidebar Header Switched To L&D Logo_Cropped

- Completed:
  - replaced sidebar top logo asset with:
    - `/brand_assets/Logos/L&D Logo_Cropped.svg`
  - adjusted logo shell/image sizing for horizontal wordmark display instead of icon-only display.

- File updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - screenshot verification completed in both themes:
    - `temporary screenshots/screenshot-54-sidebar-cropped-logo-light.png`
    - `temporary screenshots/screenshot-55-sidebar-cropped-logo-dark.png`

## Recent Update (2026-04-07) - Sidebar Logo Made Smaller + Clickable Dropdown (21st-Style)

- Completed:
  - converted sidebar top brand area into a clickable dropdown trigger.
  - reduced logo wordmark size for a smaller top-left presence.
  - added brand dropdown menu with quick actions:
    - Home
    - My Store
    - Settings
  - implemented interaction behavior:
    - toggle on button click
    - close on outside click
    - close on `Esc`
    - close after selecting destination
    - route updates through existing SPA page switch logic

- File updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - screenshot comparison rounds completed:
    - `temporary screenshots/screenshot-56-brand-dropdown-light-pass1.png`
    - `temporary screenshots/screenshot-57-brand-dropdown-dark-pass1.png`
    - `temporary screenshots/screenshot-58-brand-dropdown-open-dark-pass1.png`
    - `temporary screenshots/screenshot-59-brand-dropdown-light-pass2.png`
    - `temporary screenshots/screenshot-60-brand-dropdown-open-dark-pass2.png`
  - interaction check:
    - dropdown `Settings` action routes to `/Settings`, updates header title, and closes menu.

## Recent Update (2026-04-07) - General Label + Sidebar/Header Alignment + Smaller Logo

- Completed:
  - changed sidebar section label from `Explore > General` to `General`.
  - corrected sidebar/header vertical alignment by matching sidebar brand row height to header height.
  - reduced top-left logo size again while keeping brand dropdown behavior intact.

- File updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - measured alignment confirms exact match:
    - `headerHeight: 65`
    - `sidebarTopHeight: 65`
    - `deltaBottom: 0`
  - screenshot comparison rounds:
    - `temporary screenshots/screenshot-61-nav-align-light-pass1.png`
    - `temporary screenshots/screenshot-62-nav-align-dark-open-pass1.png`
    - `temporary screenshots/screenshot-63-nav-align-light-pass2.png`
    - `temporary screenshots/screenshot-64-nav-align-dark-open-pass2.png`

## Recent Update (2026-04-07) - Logo Bumped To Medium Size

- Completed:
  - increased top-left sidebar logo from small to medium.
  - switched logo source from cropped SVG to cropped PNG for consistent visible size rendering.
  - kept dropdown trigger behavior and top-row alignment unchanged.

- File updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - screenshot comparison rounds:
    - `temporary screenshots/screenshot-65-logo-medium-light-pass1.png`
    - `temporary screenshots/screenshot-66-logo-medium-dark-open-pass1.png`
    - `temporary screenshots/screenshot-67-logo-medium-light-pass2.png`
    - `temporary screenshots/screenshot-68-logo-medium-dark-open-pass2.png`
  - alignment metrics remain exact:
    - `headerHeight: 65`
    - `sidebarTopHeight: 65`
    - `deltaBottom: 0`

## Recent Update (2026-04-07) - Sidebar Logo Switched Back To SVG (White Background Removal)

- Completed:
  - replaced sidebar brand logo source with SVG asset to remove white-background artifact on light mode:
    - `/brand_assets/Logos/L&D Logo_Cropped.svg`
  - increased SVG logo shell/image constraints to keep medium readable size:
    - `.sidebar-brand-logo-shell` max-width `9.5rem`
    - `.sidebar-brand-logo` max-height `2.05rem`
  - kept brand dropdown behavior and sidebar/header top-row alignment unchanged.

- File updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - screenshot comparison rounds:
    - `temporary screenshots/screenshot-69-logo-svg-light-pass1.png`
    - `temporary screenshots/screenshot-70-logo-svg-dark-open-pass1.png`
    - `temporary screenshots/screenshot-71-logo-svg-medium-light-pass2.png`
    - `temporary screenshots/screenshot-72-logo-svg-medium-dark-open-pass2.png`
  - measured alignment still exact:
    - `headerHeight: 65`
    - `sidebarTopHeight: 65`
    - `deltaBottom: 0`

## Recent Update (2026-04-07) - Sidebar Logo Reverted To Earlier Medium Size

- Completed:
  - reverted sidebar top logo back to earlier medium setup requested by user.
  - switched logo source from SVG back to PNG:
    - `/brand_assets/Logos/L&D Logo_Cropped.png`
  - restored earlier medium sizing values:
    - `.sidebar-brand-logo-shell` max-width `7.6rem`
    - `.sidebar-brand-logo` max-height `1.92rem`
  - retained brand dropdown behavior and existing sidebar/header alignment.

- File updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

## Recent Update (2026-04-07) - White Sidebar Logo Added For Dark Mode

- Completed:
  - mapped sidebar logo by theme so dark-mode surfaces use the new white logo asset.
  - preserved earlier medium-size logo setup for light mode.
  - implemented CSS theme selectors:
    - `light`/`apple` -> `L&D Logo_Cropped.png`
    - `default`/`dark`/`shopify` -> `L&D Logo_Cropped_White.png`

- File updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

## Recent Update (2026-04-07) - Sidebar Footer Theme Toggle Beside Settings

- Completed:
  - added a dedicated light/dark toggle button beside the sidebar `Settings` button.
  - wired toggle click to existing app theme flow (`applyAppTheme`) so it persists and updates all theme-bound UI.
  - added `syncSidebarThemeToggle()` so icon/action text updates automatically when theme is changed from any control.
  - preserved current navigation order and medium logo treatment.

- File updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - inline script parse check passed:
    - `All inline scripts parsed successfully. Blocks: 2`

## Recent Update (2026-04-07) - Sidebar Logo Container Background Removed

- Completed:
  - removed the gray container background from the top-left sidebar logo trigger so it matches the sidebar surface.
  - set default/hover/open states of `#sidebar-brand-button` background to transparent.
  - kept logo sizing, dropdown interaction, and focus ring behavior unchanged.

- File updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

## Recent Update (2026-04-07) - Sidebar Logo Hover State Restored

- Completed:
  - kept the sidebar logo trigger base background transparent.
  - restored hover and expanded/open background state for visible interaction feedback.
  - preserved dropdown behavior and focus ring.

- File updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

## Recent Update (2026-04-07) - Sidebar Brand Dropdown Dark Popup Theme

- Completed:
  - changed sidebar brand dropdown popup to a black/gray background.
  - switched popup text and icon colors to white for stronger contrast.
  - tuned menu hover styling for white-on-dark readability and clear interaction.

- File updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - inline script parse check passed:
    - `All inline scripts parsed successfully. Blocks: 2`

## Recent Update (2026-04-07) - Sidebar Brand Popup Account Menu + Smaller Typography

- Completed:
  - removed `Quick Switch` label from sidebar brand popup.
  - moved `Profile` action into popup and removed top-header profile button.
  - moved logout into popup as last action and removed top-header logout button.
  - added top profile header inside popup:
    - avatar/icon
    - display name
    - email line under name
  - reduced popup typography sizes to better match requested visual density:
    - profile name/email and menu item text/icon slightly smaller.

- File updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - inline script parse check passed:
    - `All inline scripts parsed successfully. Blocks: 2`
  - dropdown visual verification screenshots:
    - `temporary screenshots/screenshot-73-brand-popup-profile-layout.png`
    - `temporary screenshots/screenshot-74-brand-popup-fonts-smaller.png`

## Recent Update (2026-04-07) - Sidebar Brand Popup Typography Rebalanced (Less Small, More Tight)

- Completed:
  - increased popup text slightly from the previous pass to restore readability.
  - tightened spacing/padding and icon-text gaps so the menu feels compact.
  - preserved the new account-menu structure (profile header, actions, logout at bottom).

- File updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - inline script parse check passed:
    - `All inline scripts parsed successfully. Blocks: 2`
  - screenshot:
    - `temporary screenshots/screenshot-75-brand-popup-fonts-medium-tight.png`

## Recent Update (2026-04-07) - Sidebar/Header Re-Alignment + Desktop Collapse Toggle

- Completed:
  - re-aligned top separator line by matching header height to sidebar top row (`65px` each).
  - added desktop sidebar hide control in sidebar header with Material icon:
    - `keyboard_double_arrow_left`
  - added desktop reopen behavior:
    - when sidebar is hidden, burger icon appears on left side of top bar
    - clicking burger reopens sidebar
  - preserved mobile sidebar behavior and overlay interaction.

- File updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - inline script parse check passed:
    - `All inline scripts parsed successfully. Blocks: 2`
  - measured alignment:
    - `headerHeight: 65`
    - `sidebarTopHeight: 65`
    - `deltaBottom: 0`
  - screenshot verification:
    - `temporary screenshots/screenshot-79-align-icon-before-collapse.png`
    - `temporary screenshots/screenshot-80-collapsed-burger-visible.png`
    - `temporary screenshots/screenshot-81-reopened-via-burger.png`

## Recent Update (2026-04-07) - Sidebar Collapse Transition Sync Polish

- Completed:
  - synchronized desktop hide/show animation timing between:
    - sidebar transform
    - main content left offset
  - changed both to:
    - `0.38s`
    - `cubic-bezier(0.22, 1, 0.36, 1)`
  - removed `!important` overrides on collapsed-state transform/margin to keep animation interpolation smooth.

- File updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - transition sampling logs show both moving layers use the same duration/easing.
  - screenshot verification:
    - `temporary screenshots/screenshot-82-transition-sync-collapsed.png`
    - `temporary screenshots/screenshot-83-transition-sync-reopened.png`

## Recent Update (2026-04-07) - Records Group Font Size Matched To Upper Nav

- Completed:
  - applied the same sidebar nav typography rules to the `Records` links (`Purchases`, `Commissions`, `Library`).
  - introduced `data-nav-static` on those links and mapped it into shared sidebar nav selectors.
  - ensured icon size + text size + line-height match upper nav groups.

- File updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - inline script parse check passed:
    - `All inline scripts parsed successfully. Blocks: 2`
  - measured style match:
    - top font `14.08px`, records font `14.08px`
    - top line-height `18.4px`, records line-height `18.4px`
  - screenshot:
    - `temporary screenshots/screenshot-84-records-font-match.png`

## Recent Update (2026-04-07) - KPI Uniform Height + Personal Volume Date-Bar Graph

- Completed:
  - enforced uniform KPI card sizing across the first dashboard row (`h-full` + `min-h` + stretch grid behavior).
  - updated E-Wallet KPI structure to keep primary balance data first and place `Send`/`Transfer` CTAs in-card.
  - connected E-Wallet KPI CTA buttons to functional wallet modals.
  - preserved Account Status emphasis on timer headline and normalized rank display format (`Rank: ...`).
  - replaced Personal Volume line sparkline with Apple Screen Time-style rectangular bars with date labels.

- Graph behavior now:
  - 7-day daily PV bars with date labels (`M/D`).
  - today bar highlight.
  - persistent trend entries saved in local storage (`charge-dashboard-pv-trend-v1`).
  - backward compatibility with prior legacy point-array trend data.

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - screenshot pass 1:
    - `temporary screenshots/screenshot-99-kpi-bars-dates-pass1.png`
  - screenshot pass 2:
    - `temporary screenshots/screenshot-100-kpi-bars-dates-pass2.png`

## Recent Update (2026-04-07) - Personal Volume Graph Interaction Upgrade

- Completed:
  - tightened PV graph footprint for denser KPI presentation.
  - added interactive per-bar hover/focus tooltip showing:
    - date
    - PV value
  - added subtle bar motion:
    - staged load reveal
    - hover lift feedback

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - static chart screenshot:
    - `temporary screenshots/screenshot-101-kpi-bars-hover-pass1.png`
  - hover tooltip screenshot:
    - `temporary screenshots/screenshot-102-kpi-bars-hover-pass2-tooltip.png`

## Recent Update (2026-04-07) - Personal Volume Graph Tightness (No Frame)

- Completed:
  - removed graph outline/frame treatment for Personal Volume KPI chart area.
  - tightened graph strip spacing and baseline rhythm.
  - kept hover/focus tooltip detail (date + PV) and motion behavior.
  - shifted bars to cleaner monochrome styling, with today still emphasized.

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - clean no-frame chart screenshot:
    - `temporary screenshots/screenshot-104-kpi-bars-clean-noframe-pass1.png`
  - no-frame chart + hover tooltip screenshot:
    - `temporary screenshots/screenshot-105-kpi-bars-clean-noframe-pass2-hover.png`

## Recent Update (2026-04-07) - Personal Volume Graph: No Dates + 1-Month Duration

- Completed:
  - removed bottom date label row from Personal Volume KPI graph.
  - tightened graph vertical spacing and bar density.
  - switched chart duration from 7 days to 30 days (one month).
  - retained hover/focus tooltip showing date + PV details.

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - no-date month chart screenshot:
    - `temporary screenshots/screenshot-106-kpi-bars-month-tight-pass1.png`
  - no-date month chart + hover screenshot:
    - `temporary screenshots/screenshot-107-kpi-bars-month-tight-pass2-hover.png`

## Recent Update (2026-04-07) - Personal Volume Date Accuracy (Server-Timestamp Only)

- Completed:
  - fixed PV graph date attribution so entries are no longer inferred from client clock.
  - chart trend entries now require server-derived observed timestamps.
  - legacy/local inferred trend points are ignored for accuracy.
  - updated PV KPI call paths to pass server-observed timestamps.

- Outcome:
  - resolves issue where PV appeared under the current date (April 7) even if server purchase date differed.
  - tooltip date now reflects server-observed activity date where available.

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - server-date baseline screenshot:
    - `temporary screenshots/screenshot-108-pv-server-date-pass1.png`
  - server-date tooltip screenshot:
    - `temporary screenshots/screenshot-109-pv-server-date-pass2-hover.png`

## Recent Update (2026-04-07) - PV Loading Wait Extended

- Completed:
  - extended Personal Volume graph loading wait duration from `1.4s` to `3.0s` before fallback render.

- File updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - screenshot step skipped per user request.

## Recent Update (2026-04-07) - PV Loading Animation (Less Repetitive)

- Completed:
  - replaced repetitive loading pulse pattern with non-repeating animated loading bars.
  - added custom keyframes and varied per-bar timing/height for organic motion.
  - updated loading caption to `Syncing monthly PV from server...`.

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - no screenshot run for this pass.

## Recent Update (2026-04-07) - PV Data Animation + Right Feather Rolloff

- Completed:
  - upgraded real-data PV bars to smooth keyframe reveal animation.
  - replaced basic JS transform/opacity stagger loop with per-bar CSS animation timing.
  - added right-side feather fade/roll-off effect during data reveal.
  - ensured feather overlay is reset/hidden in loading-state renders.

- Outcome:
  - Personal Volume chart reveal feels smoother and more premium.
  - right-edge opacity roll-off adds the requested feathered finish during animation.

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - no screenshot run for this pass.

## Recent Update (2026-04-07) - PV Animation Pace Slowed

- Completed:
  - slowed down Personal Volume data-bar reveal timing.
  - slowed down right-side feather roll-off to match.

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - no screenshot run for this micro-tuning pass.

## Recent Update (2026-04-07) - PV Bar Reveal Straightened

- Completed:
  - removed translation/blur from real-data PV bar reveal animation.
  - switched to cleaner vertical-only scale reveal.
  - simplified stagger timing to linear progression for more uniform motion.

- Outcome:
  - bars no longer appear visually crooked/slanted while animating.

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - no screenshot run for this micro-fix pass.

## Recent Update (2026-04-07) - E-Wallet KPI Layout Aligned

- Completed:
  - aligned E-Wallet card internal layout to match other KPI cards.
  - normalized E-Wallet CTA sizing and spacing.

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - no screenshot run for this micro-fix pass.

## Recent Update (2026-04-07) - KPI Uniform Layout + Dashboard Skeleton Loading

- Completed:
  - normalized KPI card layout/spacing rhythm across E-Wallet, Sales Team Commissions, Personal Volume, and Account Status.
  - added dashboard-level skeleton shell for initial loading.
  - wrapped live dashboard content behind loading gate.
  - wired skeleton completion to core hydration steps:
    - binary summary
    - server cutoff metrics
    - E-Wallet snapshot
  - added fail-safe auto-stop timeout for skeleton loading state.

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - no screenshot run in this pass.

## Recent Update (2026-04-07) - Dashboard KPI Badge Hovercard Unclipped

- Completed:
  - removed inline Account Status KPI badge tooltip rendering.
  - wired KPI rank/title badge hovers to a shared floating hovercard rendered outside the dashboard card.
  - added hover/focus/touch open behavior and delayed hide behavior matching profile badge interactions.
  - added outside-click close and resize/scroll reposition handling for KPI hovercard.

- Outcome:
  - KPI badge hover content no longer renders inside/clips within the Account Status card bounds.
  - interaction now matches the profile page ????????????????hover window??????????????? behavior.

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - no screenshot run for this pass (per user instruction).

## Recent Update (2026-04-07) - KPI Badge Logic Mirrors Profile

- Completed:
  - switched KPI badge data source to mirror Profile badge selections directly.
  - removed fixed 3-slot placeholder behavior that showed extra placeholder badges.
  - added empty-state handling to hide KPI badge strip if no profile badges are active.

- Outcome:
  - KPI now shows only the badges the user actually enabled/unlocked on Profile.

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - no screenshot run for this pass (per user instruction).

## Recent Update (2026-04-07) - KPI Badge Refresh Synced With Profile

- Completed:
  - added shared badge refresh helper to keep Profile and KPI badge strips in sync.
  - updated profile/achievement/theme/rank refresh paths to call shared badge sync instead of profile-only badge render.

- Outcome:
  - KPI badges now refresh together with Profile badges, preventing stale rank-only KPI state when title badges are available.

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - no screenshot run for this pass (per user instruction).

## Recent Update (2026-04-07) - Badge Hover Window Redesign

- Completed:
  - redesigned badge hover window visuals for Profile and KPI badges.
  - removed large circular icon shell look and replaced with compact rounded-square icon tile.
  - updated popup layout to compact icon + text columns.
  - reduced popup visual bulk (size, shadow, title styling, arrow scale).

- Outcome:
  - hover popup appears less generic and cleaner while keeping existing behavior.

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - no screenshot run for this pass (per user instruction).

## Recent Update (2026-04-07) - Hover Window Background Matched Tooltip

- Completed:
  - matched badge hover window background to tooltip color.
  - matched hover pointer arrow background and border to the same tooltip style.

- Outcome:
  - badge hover popup now uses the same background treatment as existing tooltips/popups.

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - no screenshot run for this pass (per user instruction).

## Recent Update (2026-04-07) - Hover Window Pointer Removed

- Completed:
  - removed the diamond pointer/arrow from badge hover windows.

- Outcome:
  - hover popup now renders as a clean floating panel with no pointer shape.

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - no screenshot run for this pass (per user instruction).

## Recent Update (2026-04-07) - Hover Window Background Reverted + Click Shift Fixed

- Completed:
  - reverted hover popup to original gradient background style with no translucent fill.
  - removed click/focus transform movement on badge anchors that caused popup position shift.
  - added same-anchor hovercard show guard to avoid re-open position reset flicker/jump.

- Outcome:
  - popup uses original look without semi-transparent background.
  - clicking badges no longer nudges the popup upward.

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - no screenshot run for this pass (per user instruction).

## Recent Update (2026-04-07) - Hover Jump Hard Fix

- Completed:
  - prevented redundant same-anchor hovercard re-open on click/focus.
  - removed badge hover transform motion to keep anchor position stable.

- Outcome:
  - clicking an icon after hover no longer repositions/jumps the popup.

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - no screenshot run for this pass (per user instruction).

## Recent Update (2026-04-07) - Hover Popup Stays Open For Text Selection

- Completed:
  - prevented popup from closing when clicking/selecting text inside hover window.
  - added inside-popup interaction guards for blur/hide timing.

- Outcome:
  - users can click, drag, and highlight text inside the hover popup without immediate dismissal.

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - no screenshot run for this pass (per user instruction).

## Recent Update (2026-04-07) - Member Login White CTA

- Completed:
  - changed the member login submit button to a solid white visual style.
  - preserved readable dark label color and clean interaction states.

- Outcome:
  - the `Login` CTA now matches the requested white-button treatment on the glass panel.

- Files updated:
  - `login.html`
  - `Claude_Notes/member-login-page.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - no screenshot run for this pass (per user instruction).

## Recent Update (2026-04-07) - Member Login Labels To White

- Completed:
  - changed static form labels `Username or Email` and `Password` to pure white.

- Outcome:
  - label text now matches requested white styling and improves contrast on the glass panel.

- Files updated:
  - `login.html`
  - `Claude_Notes/member-login-page.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - no screenshot run for this pass (per user instruction).

## Recent Update (2026-04-07) - Member Login Placeholder Tone

- Completed:
  - changed placeholder text color for identifier and password inputs to grayish-white (`text-white/60`).

- Outcome:
  - placeholder text now appears soft white/gray and aligns with the glassmorphism palette.

- Files updated:
  - `login.html`
  - `Claude_Notes/member-login-page.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - no screenshot run for this pass (per user instruction).

## Recent Update (2026-04-07) - Member Login Footer Legal Copy

- Completed:
  - added bottom-center footer legal text on the login page.
  - added underlined hyperlinks for `Terms of Service` and `Privacy Policy`.
  - kept copyright line as `????????? 2026 LD Premiere`.

- Outcome:
  - login page now includes required legal footer copy in the requested location.

- Files updated:
  - `login.html`
  - `Claude_Notes/member-login-page.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - no screenshot run for this pass (per user instruction).

## Recent Update (2026-04-07) - Member Login Subtitle To White

- Completed:
  - changed subtitle `Sign in to access your dashboard` to pure white.

- Outcome:
  - subtitle now matches the requested white text treatment.

- Files updated:
  - `login.html`
  - `Claude_Notes/member-login-page.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - no screenshot run for this pass (per user instruction).

## Recent Update (2026-04-07) - Member Login First-Load Motion

- Completed:
  - added first-load page blur/fade intro animation.
  - added staggered upward blur/fade reveal animation for login card, header block, form, and footer.
  - added reduced-motion fallback to disable entrance effects when requested by OS settings.

- Outcome:
  - login page now has the requested Apple-style entrance sequence with smoother perceived loading.

- Files updated:
  - `login.html`
  - `Claude_Notes/member-login-page.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - no screenshot run for this pass (per user instruction).

## Recent Update (2026-04-07) - Member Login Intro Reliability

- Completed:
  - changed intro motion trigger to JS-controlled `intro-run` class.
  - added BFCache (`pageshow`) replay handling for reliable first-screen animation visibility.

- Outcome:
  - entrance effect now consistently appears on true page loads and cached page restores.

- Files updated:
  - `login.html`
  - `Claude_Notes/member-login-page.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - no screenshot run for this pass (per user instruction).

## Recent Update (2026-04-07) - Background Reveal + ColorBends Parameter Ramp

- Completed:
  - added black-first background reveal that fades into ColorBends as the panel intro starts.
  - added shader intro interpolation so ColorBends parameters transition smoothly into final config values.

- Outcome:
  - the login screen intro now feels more cinematic and cohesive, with the background evolving during panel entrance instead of appearing abruptly.

- Files updated:
  - `login.html`
  - `Claude_Notes/member-login-page.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - no screenshot run for this pass (per user instruction).

## Recent Update (2026-04-07) - Intro Scale Starts At 5

- Completed:
  - updated ColorBends intro ramp to start with `scale: 5` and animate back to the normal configured scale.

- Outcome:
  - background now opens with a stronger zoomed look before settling into its original state.

- Files updated:
  - `login.html`
  - `Claude_Notes/member-login-page.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - no screenshot run for this pass (per user instruction).

## Recent Update (2026-04-07) - Shader Intro Trigger Sync

- Completed:
  - synced ColorBends parameter ramp start to the same runtime intro trigger as the panel.
  - hooked `runLoginIntroAnimation()` to call `window.startColorBendsIntro()`.

- Outcome:
  - background scale transition is now aligned with visible intro timing and easier to perceive.

- Files updated:
  - `login.html`
  - `Claude_Notes/member-login-page.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - no screenshot run for this pass (per user instruction).

## Recent Update (2026-04-08) - Binary Tree Map-World Navigation

- Completed:
  - changed binary tree to keep full graph rendered in one global world during normal navigation.
  - shifted semantic zoom from node pruning to detail-density control (far/mid/near).
  - added map-home camera defaults centered on root.
  - tightened baseline horizontal spread with capped world width depth and compact slot width.

- Outcome:
  - panning/zooming now behaves closer to map navigation, with node details progressively appearing by zoom level.
  - default view is less horizontally stretched for medium-sized trees.

- Files updated:
  - `binary-tree.mjs`
  - `Claude_Notes/binary-tree-business-center.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `node --check binary-tree.mjs`
  - no screenshot run for this pass.

## Recent Update (2026-04-08) - Binary Tree Circle Baseline

- Completed:
  - simplified node visuals to circles with initials only.
  - switched branch connectors to straight line links.
  - updated interaction hit testing and viewport bounds to circle-based geometry.
  - reduced baseline horizontal spread with tighter layout width defaults.

- Outcome:
  - tree is now intentionally minimal to evaluate readability/spacing before re-introducing details.

- Files updated:
  - `binary-tree.mjs`
  - `Claude_Notes/binary-tree-business-center.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `node --check binary-tree.mjs`
  - no screenshot run for this pass.

## Recent Update (2026-04-08) - Circle Node Overlap Fix

- Completed:
  - added collision-avoidance spacing per depth row in tree layout.
  - enforced minimum horizontal gap between nodes in the same depth.
  - recentered each adjusted row and refreshed layout bounds after spreading.

- Outcome:
  - overlapping circle nodes are separated for clearer readability in compressed layouts.

- Files updated:
  - `binary-tree.mjs`
  - `Claude_Notes/binary-tree-business-center.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `node --check binary-tree.mjs`
  - no screenshot run for this pass.

## Recent Update (2026-04-08) - Non-Centered Child Connectors

- Completed:
  - replaced center-based node connectors with edge-anchored line segments.
  - adjusted spillover links to start/end on circle boundaries as well.

- Outcome:
  - child connectors no longer run through node centers, reducing visual confusion.

- Files updated:
  - `binary-tree.mjs`
  - `Claude_Notes/binary-tree-business-center.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `node --check binary-tree.mjs`
  - no screenshot run for this pass.

## Recent Update (2026-04-08) - Single-Child Side Branch Clarification

- Completed:
  - made child connectors explicitly branch-side anchored.
  - left and right child lines now originate from distinct parent-side anchors.

- Outcome:
  - nodes with only one child no longer appear center-connected, improving left/right placement readability.

- Files updated:
  - `binary-tree.mjs`
  - `Claude_Notes/binary-tree-business-center.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `node --check binary-tree.mjs`
  - no screenshot run for this pass.

## Recent Update (2026-04-08) - T / Inverted-T Connector Layout

- Completed:
  - converted tree connectors to orthogonal branch routing.
  - implemented inverted-T branch bars for two-child parents.
  - implemented elbow routing for one-child parents while preserving left/right direction.

- Outcome:
  - branch direction is easier to parse visually, especially for parents with a single child.

- Files updated:
  - `binary-tree.mjs`
  - `Claude_Notes/binary-tree-business-center.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `node --check binary-tree.mjs`
  - no screenshot run for this pass.

## Recent Update (2026-04-08) - More Space For Deep Nodes

- Completed:
  - added progressive depth-based vertical spacing to layout Y positioning.
  - kept upper levels compact while increasing row gaps on deeper levels.
  - synced placeholder slot Y positioning to the same spacing model.

- Outcome:
  - bottom/deep node regions now have more breathing room where crowding was most visible.

- Files updated:
  - `binary-tree.mjs`
  - `Claude_Notes/binary-tree-business-center.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `node --check binary-tree.mjs`
  - no screenshot run for this pass.

## Recent Update (2026-04-08) - Deep Nodes X-Axis Spacing Fix

- Completed:
  - removed depth-driven Y-axis expansion from layout.
  - added depth-driven X-axis spacing expansion in overlap prevention per row.
  - tuned deep-row horizontal spacing growth while keeping top rows compact.

- Outcome:
  - deep nodes now have more side-to-side spacing where crowding occurs, without stretching vertical gaps further.

- Files updated:
  - `binary-tree.mjs`
  - `Claude_Notes/binary-tree-business-center.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `node --check binary-tree.mjs`
  - no screenshot run for this pass.

## Recent Update (2026-04-08) - Popup Icon Sync + Hover/Spacing Pass

- Completed:
  - synced popup handle-row icons to profile-selected rank/title1/title2 sources.
  - forwarded profile badge/title metadata into tree node data from `index.html` and `admin.html`.
  - expanded popup icon resolver support in `binary-tree.mjs` for explicit profile icon paths and title-based fallback mappings.
  - reduced icon gap spacing for tighter alignment.
  - added hover/press interaction feedback to popup icons (lift/scale/press state), matching KPI-card interaction feel.

- Outcome:
  - popup icons now follow user profile badge/title selections more closely and feel less static/cluttered.
  - icon row appears denser and more intentional beside `@username`.

- Files updated:
  - `binary-tree.mjs`
  - `index.html`
  - `admin.html`
  - `Claude_Notes/binary-tree-business-center.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `node --check binary-tree.mjs`
  - screenshot capture ran, but popup-state visual verification was blocked because available captured routes resolved to unauthenticated/login views in this pass.

## Recent Update (2026-04-08) - Popup Icon Hovercard + Stuck-Hover Fix

- Completed:
  - changed popup icon resolver output to structured entries with hover metadata.
  - implemented a per-icon hover popup window (title/subtitle) for rank/title1/title2 icons.
  - removed scale-up hover behavior that could remain visually stuck.
  - added explicit reset/hide handlers on `pointerout`, `pointerup`, and `pointerupoutside`.

- Outcome:
  - icon hover now surfaces a real info popup window, closer to KPI/profile badge interaction expectations.
  - icons no longer remain enlarged after hover interactions.

- Files updated:
  - `binary-tree.mjs`
  - `Claude_Notes/binary-tree-business-center.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `node --check binary-tree.mjs`

## Recent Update (2026-04-08) - KPI Hovercard Style Match + Icon Placement Stabilization

- Completed:
  - removed in-canvas popup hover panel for icon row.
  - implemented DOM hovercard flow aligned with Account Status KPI hovercard behavior.
  - added viewport-aware hovercard positioning and delayed hide semantics.
  - updated icon-row hover events to use the shared hovercard flow.
  - corrected icon vertical anchoring to keep icons aligned to the `@username` row.
  - added cleanup for hovercard timers/elements during popup/controller teardown.

- Outcome:
  - icon hover behavior now uses a true popup window pattern rather than sprite-only effects.
  - icon placement is more stable and consistent with the handle row.

- Files updated:
  - `binary-tree.mjs`
  - `Claude_Notes/binary-tree-business-center.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `node --check binary-tree.mjs`

## Recent Update (2026-04-08) - Popup Icon Hit-Box + Hovercard Visibility Repair

- Completed:
  - fixed popup icon sprite sizing instability by loading icon textures before render and enforcing fixed icon bounds.
  - switched popup container to stable pointer event mode so hover targets resolve reliably.
  - updated icon anchor-to-DOM mapping for hovercard placement against live canvas metrics.
  - aligned hovercard style tokens to KPI card behavior and raised hovercard stacking layer to ensure it appears above tree canvas surfaces.

- Outcome:
  - popup icons no longer render as oversized/offset artifacts.
  - hover popup now appears reliably when hovering rank/title icons in the selected-node card.

- Files updated:
  - `binary-tree.mjs`
  - `Claude_Notes/binary-tree-business-center.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `node --check binary-tree.mjs`
  - authenticated `/BinaryTree` hover repro via Puppeteer (popup click + icon hover).

## Recent Update (2026-04-10) - Next-Gen Binary Tree Semantic Zoom + Deep Focus Runtime Implemented

- Completed:
  - rebuilt `binary-tree-next-app.mjs` to restore a complete working next-gen runtime
  - retained full canvas-rendered Figma-style shell (left panel, right panel, center strip, bottom strip)
  - wired semantic zoom LOD rendering from adapter output (`full`, `medium`, `dot`, hidden/culled)
  - applied depth-based node scaling so deeper levels are smaller at baseline
  - added cursor-anchored zoom + pan and deep focus controls (`Home`, `Fit`, `Deep`, `Root`)
  - preserved member/admin source session bootstrap checks.
- Outcome:
  - the next-gen shell now demonstrates the requested dynamic-tree performance pattern: deeper nodes remain navigable while detail visibility scales with zoom, and tiny/offscreen nodes are hidden or culled for render efficiency.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-business-center.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - `node --check binary-tree-next-engine-adapter.mjs` passed.
  - route smoke: `/binary-tree-next` returned HTTP 200 and module entry was detected.

## Recent Update (2026-04-10) - Next-Gen Tree Reference Correction (Removed Zigzag, Added T-Lines)

- Completed:
  - removed forced deep zigzag chain in next-gen mock graph builder
  - switched to balanced per-level tree generation for default view
  - replaced diagonal connectors with orthogonal T/elbow branch routing
  - retuned adapter spacing constants for stable level-based horizontal/vertical spacing.
- Outcome:
  - tree now follows the requested structure direction from reference: clear level spacing and T-branch connectors.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `binary-tree-next-engine-adapter.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-business-center.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - `node --check binary-tree-next-engine-adapter.mjs` passed.
  - route smoke: `/binary-tree-next` returned HTTP 200.

## Recent Update (2026-04-10) - Next-Gen Core Geometry Tuning (Node Size Cascade + Shorter Vertical Lines)

- Completed:
  - strengthened depth-based radius decay so root-to-deep node size differences are visibly hierarchical
  - switched adapter vertical depth spacing from fixed step to decaying step model
  - retuned T-connector split geometry so vertical trunks are shorter and branch bars read closer to reference
  - adjusted LOD thresholds to keep tiny deep nodes visible as dots while still culling when extremely small/offscreen
  - aligned app world-radius baseline constant to adapter.
- Outcome:
  - tree now reads as a true size cascade per level and connector verticals are noticeably shorter, improving match to provided reference direction.
- Files updated:
  - `binary-tree-next-engine-adapter.mjs`
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-business-center.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check binary-tree-next-engine-adapter.mjs` passed.
  - `node --check binary-tree-next-app.mjs` passed.
  - `/binary-tree-next` returned HTTP 200.

## Recent Update (2026-04-10) - Next-Gen Vertical Gap Reduced Again

- Completed:
  - compressed adapter per-depth Y spacing constants for shorter parent-child vertical links.
- Outcome:
  - tree vertical lines render tighter and closer to the target reference rhythm.
- Files updated:
  - `binary-tree-next-engine-adapter.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-business-center.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check binary-tree-next-engine-adapter.mjs` passed.
  - `node --check binary-tree-next-app.mjs` passed.
  - `/binary-tree-next` returned HTTP 200.

## Recent Update (2026-04-10) - Deepest-Level Vertical Lines Compressed

- Completed:
  - added extra deep-only Y-step decay starting at depth level 6
  - lowered minimum Y step floor to allow deeper rows to pack tighter.
- Outcome:
  - deepest tree levels now have shorter vertical links while upper levels keep clearer separation.
- Files updated:
  - `binary-tree-next-engine-adapter.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-business-center.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check binary-tree-next-engine-adapter.mjs` passed.
  - `node --check binary-tree-next-app.mjs` passed.
  - `/binary-tree-next` returned HTTP 200.

## Recent Update (2026-04-10) - Next-Gen Default Scale Increased

- Completed:
  - increased default home/initial scale baseline for next-gen tree
  - aligned root-focus default radius with new baseline to avoid home/start mismatch.
- Outcome:
  - tree now starts slightly larger while retaining more zoom-out room as node count grows.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-business-center.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - `node --check binary-tree-next-engine-adapter.mjs` passed.
  - `/binary-tree-next` returned HTTP 200.

## Recent Update (2026-04-10) - Next-Gen Default Scale Locked To 0.025 With Depth-5 Full Detail

- Completed:
  - set default/home camera scale to `0.025`
  - added internal projection normalization so this low raw scale remains visually usable
  - added semantic depth gate in adapter:
    - depth `0..5` full detail at home scale
    - deeper levels hidden until zoom-in
    - deeper levels progressively reveal as zoom increases.
- Outcome:
  - startup/home now follows requested scale semantics and reveal behavior directly.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `binary-tree-next-engine-adapter.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-business-center.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - `node --check binary-tree-next-engine-adapter.mjs` passed.
  - `/binary-tree-next` returned HTTP 200.

## Recent Update (2026-04-10) - Next-Gen Mock Tree Now Simulates 1000 Nodes

- Completed:
  - increased next-gen mock graph size target to exactly `1000` nodes
  - replaced fixed-depth generation with level-order queue expansion to keep structure balanced while scaling.
- Outcome:
  - route now boots a larger, stress-oriented binary tree simulation suitable for validating LOD/culling/spacing behavior at higher volume.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-business-center.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - `node --check binary-tree-next-engine-adapter.mjs` passed.
  - `/binary-tree-next` returned HTTP 200.

## Recent Update (2026-04-10) - Next-Gen Mock Tree Target Raised to 2000 Nodes

- Completed:
  - updated next-gen mock target constant from 1000 to 2000 nodes.
- Outcome:
  - larger stress graph now boots for high-volume layout/LOD checks.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - `node --check binary-tree-next-engine-adapter.mjs` passed.
  - `/binary-tree-next` returned HTTP 200.

## Recent Update (2026-04-10) - Next-Gen Mock Generator Now Targets 20 Levels

- Completed:
  - switched mock generation from fixed total-node target to explicit depth target (`20` levels)
  - added per-level node cap (`128`) for stability.
- Outcome:
  - next-gen graph now guarantees deep-level behavior testing at depth 20 while keeping runtime responsive.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - `node --check binary-tree-next-engine-adapter.mjs` passed.
  - `/binary-tree-next` returned HTTP 200.

## Recent Update (2026-04-10) - Zoom-Driven X-Axis Expansion/Contraction Added

- Completed:
  - added dynamic X spacing model in adapter projection
  - deep levels now expand horizontally as zoom increases and contract as zoom decreases
  - runtime config tuned to start deep-level expansion near depth 7+.
- Outcome:
  - spacing loss around deeper levels is reduced because lower branches gain horizontal room during zoom-in.
- Validation:
  - `node --check binary-tree-next-engine-adapter.mjs` passed.
  - `node --check binary-tree-next-app.mjs` passed.
  - `/binary-tree-next` returned HTTP 200.

## Recent Update (2026-04-10) - Whole-Tree X Shift Applied (Not Deep-Only)

- Completed:
  - changed dynamic X spacing from deep-focused behavior to global whole-tree zoom transform.
  - disabled depth bias in runtime config (`depthGain = 0`).
- Outcome:
  - every tree level now expands/contracts horizontally together when zooming.
- Validation:
  - `node --check binary-tree-next-engine-adapter.mjs` passed.
  - `node --check binary-tree-next-app.mjs` passed.
  - `/binary-tree-next` returned HTTP 200.

## Recent Update (2026-04-10) - Zoom-In Region Lock Improved With Whole-Tree X Shift

- Completed:
  - added multiplier-aware zoom anchor math so cursor target remains stable during dynamic X expansion/contraction.
  - propagated multiplier-aware math to focus and fit camera operations.
- Outcome:
  - user no longer needs to chase nodes while zooming into a target region.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - `node --check binary-tree-next-engine-adapter.mjs` passed.
  - `/binary-tree-next` returned HTTP 200.

## Recent Update (2026-04-10) - Dynamic X Shift Made More Visible

- Completed:
  - increased whole-tree X-shift zoom gain
  - added right-panel `X spread` diagnostic to confirm live multiplier changes.
- Outcome:
  - spacing shift is easier to observe, and behavior can be verified numerically while zooming.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - `node --check binary-tree-next-engine-adapter.mjs` passed.
  - `/binary-tree-next` returned HTTP 200.

## Recent Update (2026-04-10) - Core Horizontal Decay Tuned For Lower-Level Breathing Room

- Completed:
  - reduced horizontal decay aggressiveness in adapter (`divisor 2 -> 1.6`)
  - retuned base horizontal step (`640 -> 512`) to keep upper-level framing controlled while widening deeper levels.
- Outcome:
  - lower levels preserve more spacing and subtree perspective is more uniform while navigating different areas.
- Validation:
  - `node --check binary-tree-next-engine-adapter.mjs` passed.
  - `node --check binary-tree-next-app.mjs` passed.
  - `/binary-tree-next` returned HTTP 200.

## Recent Update (2026-04-10) - Node Overlap Bug Fixed With Per-Row Collision Pass

- Completed:
  - added adapter projection collision resolution per depth row
  - enforced minimum center spacing based on node radii + edge gap
  - kept row center stable after spacing adjustments.
- Outcome:
  - side-by-side node overlaps are prevented during zoom/spacing transforms.
- Validation:
  - `node --check binary-tree-next-engine-adapter.mjs` passed.
  - `node --check binary-tree-next-app.mjs` passed.
  - `/binary-tree-next` returned HTTP 200.

## Recent Update (2026-04-10) - Root L/R Leg Split Rule Added

- Completed:
  - added root-level subtree corridor enforcement in adapter projection
  - left and right 1st-level branches now push apart when center gap is insufficient
  - increased overlap edge gap and added `Root split` diagnostics line.
- Outcome:
  - middle-region crowding is reduced because inner subtrees receive guaranteed space from root legs.
- Validation:
  - `node --check binary-tree-next-engine-adapter.mjs` passed.
  - `node --check binary-tree-next-app.mjs` passed.
  - `/binary-tree-next` returned HTTP 200.

## Recent Update (2026-04-10) - General Branch L/R Spread Enabled (Not Root-Only)

- Completed:
  - replaced root-only split with generalized per-parent L/R subtree spacing enforcement
  - increased branch spacing strength and overlap edge gap.
- Outcome:
  - deep/internal nodes get broader subtree corridors and reduced overlap risk across the tree.
- Validation:
  - `node --check binary-tree-next-engine-adapter.mjs` passed.
  - `node --check binary-tree-next-app.mjs` passed.
  - `/binary-tree-next` returned HTTP 200.

## Recent Update (2026-04-10) - Reference-Style Proportional Tree Geometry Restored

- Completed:
  - removed dynamic X spread / branch corridor spacing / overlap post-shift systems
  - simplified camera zoom/focus math back to direct world projection
  - rebalanced node + X/Y depth decay constants so deeper nodes and T-lines shrink proportionally.
- Outcome:
  - tree behavior now tracks the reference direction more closely: smaller lower-level nodes naturally get shorter connector segments.
- Residual Risk:
  - extreme depths may still need a final pass of constant tuning after visual QA.
- Validation:
  - `node --check binary-tree-next-engine-adapter.mjs` passed.
  - `node --check binary-tree-next-app.mjs` passed.
  - `/binary-tree-next` returned HTTP 200.
- Added horizontal min-step floor + lower vertical min-step floor for deep zoom stability and proportional connector shortening.

## Recent Update (2026-04-10) - Fixed Post-Level-7 Reveal Jump and Deep-Level Uniformity

- Completed:
  - slowed semantic depth reveal rate for smoother level-by-level disclosure
  - reduced deep-node and deep-connector floor effects so lower levels keep shrinking
  - switched connector widths to radius-based scaling.
- Outcome:
  - deeper levels no longer flatten visually as early, and T-lines keep shrinking with depth.
- Validation:
  - `node --check binary-tree-next-engine-adapter.mjs` passed.
  - `node --check binary-tree-next-app.mjs` passed.
  - `/binary-tree-next` returned HTTP 200.

## Recent Update (2026-04-10) - Reverted to Prior Preferred Visual Version

- Completed:
  - rolled back the latest deep-level reveal/sizing experiment
  - restored previous connector, node floor, and semantic reveal settings.
- Outcome:
  - tree behavior now matches the version user preferred immediately before the latest tuning.
- Validation:
  - `node --check binary-tree-next-engine-adapter.mjs` passed.
  - `node --check binary-tree-next-app.mjs` passed.
  - `/binary-tree-next` returned HTTP 200.

## Recent Update (2026-04-10) - Fixed Deep-Level Size Flattening (Depth 10+)

- Completed:
  - lowered deep node/world radius floor and deep connector minimums
  - reduced dot render floor
  - made connector width depth-responsive.
- Outcome:
  - deep nodes and deep T-lines now keep shrinking instead of collapsing into one visual size.
- Validation:
  - `node --check binary-tree-next-engine-adapter.mjs` passed.
  - `node --check binary-tree-next-app.mjs` passed.
  - `/binary-tree-next` returned HTTP 200.

## Recent Update (2026-04-10) - Depth 11 Falloff Fixed (Plateau Removal)

- Completed:
  - removed deep-level geometry plateaus by lowering X/Y/radius floors
  - lowered connector and dot minima so tiny-depth visuals keep scaling.
- Outcome:
  - depth 11+ now follows the same proportional visual language as upper levels.
- Validation:
  - `node --check binary-tree-next-engine-adapter.mjs` passed.
  - `node --check binary-tree-next-app.mjs` passed.
  - `/binary-tree-next` returned HTTP 200.

## Recent Update (2026-04-10) - Deeper Zoom Ceiling Enabled

- Completed:
  - increased camera max zoom cap from 220 to 1200.
- Outcome:
  - depth-20 nodes can be zoomed in significantly further.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - `node --check binary-tree-next-engine-adapter.mjs` passed.
  - `/binary-tree-next` returned HTTP 200.

## Recent Update (2026-04-10) - Unlimited Zoom-In Enabled

- Completed:
  - removed practical max-zoom ceiling by setting `MAX_SCALE` to `Number.MAX_VALUE`.
- Outcome:
  - users can continue zooming in for deep-node inspection without hitting a cap.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - `node --check binary-tree-next-engine-adapter.mjs` passed.
  - `/binary-tree-next` returned HTTP 200.

## Recent Update (2026-04-10) - Enter Node Universe Navigation Added

- Completed:
  - implemented universe re-rooting at selected node with local 20-depth cap
  - added universe Enter/Back controls and `U`/`B` shortcuts
  - added local/global depth/path display in right panel
  - made fit/focus/deep/render pipeline universe-aware
  - added per-universe camera memory to preserve orientation.
- Outcome:
  - users can continue traversing deeper hierarchies in stable 20-depth windows without sacrificing spacing/UX.
- Validation:
  - `node --check binary-tree-next-engine-adapter.mjs` passed.
  - `node --check binary-tree-next-app.mjs` passed.
  - `/binary-tree-next` returned HTTP 200.

## Recent Update (2026-04-10) - Back Button POV-History Behavior

- Completed:
  - changed Back from parent-node traversal to previous POV restoration using history stack.
  - Back now restores prior universe root + selection/filter state + camera context.
- Outcome:
  - Enter-from-root then Back returns to root perspective as expected.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - `node --check binary-tree-next-engine-adapter.mjs` passed.
  - `/binary-tree-next` returned HTTP 200.

## Recent Update (2026-04-10) - Breadcrumb Link Buttons for Universe Jump

- Completed:
  - replaced breadcrumb text with clickable breadcrumb link chips
  - added `universe:goto:<id>` navigation and history-aware universe restore logic.
- Outcome:
  - users can click any breadcrumb ancestor to jump directly to that universe POV.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - `node --check binary-tree-next-engine-adapter.mjs` passed.
  - `/binary-tree-next` returned HTTP 200.

## Recent Update (2026-04-10) - Fullscreen Glass Canvas UI Pass

- Completed:
  - switched shell to fullscreen canvas workspace with in-canvas hideable left/right overlay panels
  - applied dark gray glassmorphism styling across panels/bars/buttons
  - changed nodes to initials-only circular badges (contacts-style)
  - relaxed camera culling margin so connectors do not disappear too aggressively while panning.
- Outcome:
  - UI matches desired direction for shell polishing before live tree logic integration.
- Validation:
  - `node --check binary-tree-next-engine-adapter.mjs` passed.
  - `node --check binary-tree-next-app.mjs` passed.
  - `/binary-tree-next` returned HTTP 200.
## Recent Update (2026-04-10) - Apple-Style Panel Radius Polish

- Completed:
  - increased corner radii for panel chrome, panel cards, top/bottom bars, toolbar segments, and chip/buttons.
  - converted `binary-tree-next-app.mjs` encoding from UTF-16 LE to UTF-8 for parser compatibility.
- Outcome:
  - shell reads softer and more Apple-like while preserving current layout and interaction model.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - `node --check binary-tree-next-engine-adapter.mjs` passed.
  - `/binary-tree-next` returned HTTP `200`.

## Recent Update (2026-04-10) - Light Mode Palette + Clean Glass Blur Pass

- Completed:
  - changed Binary Tree Next base surface to `#E9EAEE`
  - shifted glass panel surfaces to white-family styling (`#FFFFFF`-based)
  - replaced recursive live-canvas blur sampling with clean offscreen backdrop sampling
  - reduced blur filter complexity for cleaner Apple-style frosted panels.
- Outcome:
  - frosted glass appears cleaner and less muddy, with light mode now aligned to requested palette direction.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - completed visual round 1 via localhost screenshot workflow.
  - completed visual round 2 via localhost screenshot workflow.

## Recent Update (2026-04-10) - Reference Skeleton UI Matched

- Completed:
  - reworked shell to match provided skeletal design reference
  - replaced left-panel internals with 5 structural placeholder regions
  - replaced bottom toolbar controls with centered 5-slot placeholder dock
  - shifted shell palette to reference-matching neutral tones (`#CFD0D6`, `#ECECEE`, `#C2C2C6`)
  - temporarily disabled tree draw pass for skeleton-only presentation.
- Outcome:
  - canvas now mirrors the intended skeletal layout for component placement.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - completed iterative screenshot comparison rounds and refined spacing/color alignment.

## Recent Update (2026-04-10) - Dock Buttons Added

- Completed:
  - replaced bottom 5-slot placeholder dock with labeled controls
  - wired actions: `Back`, `Home`, `Enter`, `Deep`
  - added 5th placeholder control (`Soon`) as no-op.
- Outcome:
  - dock now functions as the primary universe/camera control strip layout.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-10) - Nodes Restored

- Completed:
  - re-enabled tree viewport rendering after the skeleton-shell phase.
- Outcome:
  - nodes/connectors are visible again while dock and shell placeholders remain active.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-10) - Dock Icons Added

- Completed:
  - added Material Symbols icons to all 5 bottom dock buttons
  - mapped icons to Back/Home/Enter/Deep/Coming Soon as requested
  - kept text labels under each icon.
- Outcome:
  - dock buttons now read as icon-first controls while preserving the skeleton styling direction.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-10) - Dock Icons Text Fallback Fixed

- Completed:
  - replaced dock icon ligature strings with Material Symbols codepoint glyphs.
- Outcome:
  - dock icons now render as actual symbols instead of text.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-10) - Dock Converted To Icon-Only Apple Style

- Completed:
  - removed text labels under dock icons
  - set dock button borders to `#EDEDED`
  - set icon color to black (`#111111`)
  - kept Back/Home/Enter/Deep/Placeholder action mapping intact.
- Outcome:
  - dock now visually matches the requested Apple-style icon-button direction.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-10) - Dock Tile Color/Size Corrected

- Completed:
  - reduced dock icon size from 34 to 28
  - corrected dock tile fill from `#CECFD4` to exact `#EDEDED`.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-10) - Main Background Set To #E9EAEE

- Completed:
  - changed runtime canvas background to `#E9EAEE`
  - changed HTML first-paint background to `#E9EAEE`.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-10) - Dock Shell Color Corrected

- Completed:
  - set outer dock shell to `#FFFFFF`
  - kept inner icon container fill at `#EDEDED`.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-10) - Dock Icon Scale/Tone Adjusted

- Completed:
  - reduced dock icon size from 28 to 24
  - changed icon color from `#111111` to `#303030`.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-10) - Dock Hover Effect Added

- Completed:
  - added dock button hover state with shade shift, subtle shadow, and icon darkening.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-10) - Startup Home State + Tree Intro Animation

- Completed:
  - startup camera now initializes via Home-equivalent root focus
  - added startup tree reveal animation (bottom-up motion + blur-to-sharp).
- Outcome:
  - reload/open now lands in Home-style tree framing with polished intro transition.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-10) - Startup/Home Camera Unified

- Completed:
  - changed dock Home to use `camera:home`
  - centered `computeHomeView()` around root metrics + viewport center
  - initialized layout/viewport before startup camera assignment.
- Outcome:
  - startup reload position now matches centered Home framing.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-10) - Per-Depth Startup Animation Enabled

- Completed:
  - converted startup reveal from global tree animation to depth-staggered reveal
  - animated nodes and connector branches using depth-aware timing.
- Outcome:
  - startup now feels dynamic by level instead of moving as a single block.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-10) - Loading Screen Before Tree Intro

- Completed:
  - added full-page loading overlay/card for Binary Tree entry/reload
  - delayed intro animation start until loading overlay minimum display + fade-out complete
  - added bootstrap error fallback to hide loading overlay immediately.
- Outcome:
  - user now sees a dedicated loading phase before the tree starts animating.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-10) - Pre-Animation Tree Flash Fixed

- Completed:
  - changed pre-intro reveal state to hidden when intro timer is not started.
- Outcome:
  - tree no longer appears before intro animation after loading screen.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-10) - Startup Panel Reveal Added

- Completed:
  - added startup animation to left panel and bottom dock
  - staggered panel timings so dock enters slightly after side panel
  - maintained dock click-hit alignment while panels are translating.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-10) - Startup Animation Cross-Platform Performance Pass

- Completed:
  - added adaptive startup reveal profiles (`full` vs `lite`) using reduced-motion, pixel-load, CPU-core, and memory hints
  - added startup frame-budget sampling with automatic downgrade to `adaptive-lite` when intro frame time is over budget
  - disabled expensive startup blur in lite/adaptive modes and skipped dot-node/connector reveal effects in heavy paths
  - centralized reveal application with visual thresholds to avoid near-zero filter/transform overhead.
- Outcome:
  - startup animation keeps the same motion style but avoids initial lag spikes on high-DPI/constrained devices, including the reported MacBook Pro scenarios.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-10) - Startup Connector Animation Restored (Cohesive Intro)

- Completed:
  - restored startup connector animation path (lines no longer remain static while nodes animate)
  - added connector reveal modes (`full` / `lite`) so constrained devices still animate lines with cheaper alpha+offset motion
  - removed prior lite-mode connector disable behavior and switched frame-budget downgrade to lightweight connector animation.
- Outcome:
  - startup visuals are cohesive again while preserving cross-platform startup performance safeguards.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-10) - Binary Tree Next macOS Trackpad Input Added

- Completed:
  - ported trackpad wheel classification from main Binary Tree logic
  - added native trackpad pan (two-finger scroll) and pinch zoom handling
  - added macOS Command+wheel manual zoom modifier handling parity
  - preserved fallback mouse-wheel smooth zoom.
- Outcome:
  - Binary Tree Next interaction now feels consistent with macOS trackpad behavior expected from the main tree implementation.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-10) - Trackpad Pinch Zoom Sensitivity Increased

- Completed:
  - increased Binary Tree Next default trackpad pinch sensitivity from `0.3` to `0.5`.
- Outcome:
  - pinch in/out now feels stronger and faster for trackpad users.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-10) - Trackpad Pinch Zoom Cap Bug Fixed + Gain Increased

- Completed:
  - raised trackpad sensitivity max clamp from `1` to `6`
  - increased pinch zoom gain by changing delta base from `100` to `60`.
- Outcome:
  - sensitivity values above `1` now apply correctly, and pinch in/out feels much stronger.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-10) - Windows End-of-Startup Hitch Smoothing

- Completed:
  - added deterministic deep-layer reveal jitter for nodes/connectors
  - phased out startup blur earlier in the tail end of reveal progress
  - extended reveal timing API to support per-entity extra delay.
- Outcome:
  - reduced end-of-intro frame spike risk on Windows while preserving cohesive startup motion.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-10) - Mouse Wheel Zoom Easing Added

- Completed:
  - added smooth camera-target interpolation for mouse wheel zoom
  - added wheel-specific camera damping and target-reason routing
  - updated wheel zoom to accumulate from active wheel target scale for continuous scrolling.
- Outcome:
  - mouse wheel zoom now feels smooth instead of snapping.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-10) - Binary Tree Next Left Panel Shell Functionalized

- Completed:
  - replaced left-shell skeleton cards with functional modules (search, pinned/favorites, node details, server timer)
  - added live search input for username/name/rank/title filtering
  - added node pinning with local persistence and quick focus/remove actions
  - added selected node detail rendering for volume metrics and lineage (`parent`, `sponsor`)
  - added profile metadata render (`rank`, `title`, `badges`, `account status`)
  - extended next-gen mock node shape and adapter search indexing to support new panel data.
- Outcome:
  - left panel is now a usable control/data shell for Binary Tree Next instead of placeholder-only UI.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `binary-tree-next-engine-adapter.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - `node --check binary-tree-next-engine-adapter.mjs` passed.
  - screenshot rounds captured at:
    - `temporary screenshots/screenshot-194-binary-next-left-panel-pass2.png`
    - `temporary screenshots/screenshot-195-binary-next-left-panel-pass3.png`
    - `temporary screenshots/screenshot-196-binary-next-left-panel-pass4.png`

## Recent Update (2026-04-10) - Pinned Nodes Apple Maps Carousel Restyle

- Completed:
  - converted pinned list rows into an Apple Maps-style horizontal places carousel
  - added circular gradient chips with custom white work/home/bank glyphs
  - updated heading treatment to `Places >`
  - kept `Pin/Unpin` action and node-focus behavior wired to real pinned node data
  - added sample place cards for empty-pinned-state visual continuity.
- Outcome:
  - pinned section now has the intended Apple Maps look while preserving Binary Tree interaction wiring.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-10) - Favorites Logic Cleanup (Real Node Pins + Horizontal Scroll/Grab)

- Completed:
  - switched favorites row to real pinned-node data only (no sample places/icons)
  - favorites title now `Favorites` (removed `Places >`)
  - removed gray favorites container so chips sit directly in the shell surface
  - added wheel-to-horizontal-scroll inside favorites viewport
  - added grab/drag horizontal scrolling
  - preserved tap behavior on favorite chips to focus the pinned node when gesture is a click.
- Outcome:
  - favorites now behaves like a true pinned-node carousel and supports both browsing (scroll/drag) and quick node focus.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - `node --check binary-tree-next-engine-adapter.mjs` passed.

## Recent Update (2026-04-10) - Node Color System Unified To Favorites Gradient

- Completed:
  - added shared `createNodeAvatarGradient(...)` helper
  - switched Favorites and all tree nodes to the same gradient recipe
  - applied to full, medium, and dot LOD node fills.
- Outcome:
  - node colors now match the pinned Favorites circle style, removing the previous gradient mismatch in the tree.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-10) - Apple Maps Gradient Container Applied To Nodes

- Completed:
  - replaced random hue-based node gradients with Apple Maps-style fixed circle palette system
  - added brown/cyan/slate palette tokens and directional gradient blending
  - added subtle top-left sheen layer on circle fills
  - applied this shared circle style to both Favorites chips and all tree nodes (full/medium/dot).
- Outcome:
  - node containers now visually match the requested Apple Maps gradient style more closely.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - `node --check binary-tree-next-engine-adapter.mjs` passed.

## Recent Update (2026-04-10) - Node Colors Varied (Gradient Style Preserved)

- Completed:
  - kept existing Apple Maps-style circle gradient/shading unchanged
  - restored multi-color variety for non-selected nodes using deterministic palette rotation
  - added additional palette families: `ocean`, `mint`, `amber`, `rose`
  - kept root brown and selected node cyan behavior.
- Outcome:
  - the tree now has color variety again while preserving the exact gradient container style you approved.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-10) - Apple Maps-Style Search Row + Profile Icon

- Completed:
  - removed old search card container block from left shell
  - added standalone rounded search pill with magnifier icon
  - added right-side circular user profile icon beside the search pill
  - restyled DOM search input to transparent/no-border so it sits inside the pill cleanly.
- Outcome:
  - search section now follows requested Apple Maps row pattern (search bar + profile icon only).
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - `node --check binary-tree-next-engine-adapter.mjs` passed.

## Recent Update (2026-04-10) - Search Profile Icon Shadow Removed

- Completed:
  - removed drop shadow from the profile icon next to the left-shell search bar
  - preserved icon visuals and interaction behavior otherwise
  - removed now-unused hover variable in that draw block.
- Outcome:
  - profile icon appears flatter/cleaner beside the search pill as requested.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-10) - Search Pill Set to White + Drop Shadow

- Completed:
  - changed search pill fill to white
  - added soft drop shadow under search pill
  - preserved search/profile row structure and behavior.
- Outcome:
  - search bar now appears brighter with separation depth, matching requested styling.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-10) - Search Pill Color Changed to #DFDFDF

- Completed:
  - changed search bar pill fill to `#DFDFDF`
  - left all other search row styling/behavior untouched.
- Outcome:
  - search bar now matches requested neutral gray fill.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-10) - Shell Color Tokens Updated (#F2F2F6 / #FFFFFF)

- Completed:
  - set panel and dock container color to `#F2F2F6`
  - set dock icon-slot containers to `#FFFFFF`
  - set search bar fill to `#FFFFFF`
  - set node-details card background to `#FFFFFF`.
- Outcome:
  - shell now follows the updated light token set exactly.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-10) - Search Bar Shadow Reduced

- Completed:
  - reduced search pill shadow opacity, blur, and Y offset for a softer depth effect.
- Outcome:
  - search bar shadow is more subtle while preserving the same overall style.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-10) - Search Icon/Font Refinement (Material + SF/Inter)

- Completed:
  - switched search icon to Material Symbols `search` glyph
  - added `icon_names=search` font link in next-gen HTML head
  - updated app text/search-input/page font stacks to prefer SF Sans with Inter fallback.
- Outcome:
  - search row now uses the requested icon source and Apple-like typography direction.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `binary-tree-next.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-10) - Search Icon Enlarged + Re-Spaced

- Completed:
  - increased search icon size and improved icon centering inside pill
  - shifted search input start position to align with the larger icon.
- Outcome:
  - search icon now better matches the scale of the search bar and overall row composition.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-10) - Search Input Now Follows Startup Animation

- Completed:
  - bound search input opacity to panel reveal alpha
  - bound search input Y position to panel reveal translate offset
  - hid search input when reveal progress/opacity is effectively zero.
- Outcome:
  - search placeholder/input now appears cohesively with panel startup animation on reload instead of popping in early.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-10) - Startup Timing Changed (Tree First)

- Completed:
  - delayed side panel reveal to `1200ms`
  - delayed dock reveal to `1450ms`.
- Outcome:
  - tree animation now leads startup, with shell UI entering later for clearer tree-first focus.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - `node --check binary-tree-next-engine-adapter.mjs` passed.

## Recent Update (2026-04-10) - Startup Overlap Timing Tune

- Completed:
  - reduced side-panel startup delay from 1200ms to 540ms
  - reduced dock startup delay from 1450ms to 700ms
- Outcome:
  - panel and dock startup now overlap with tree reveal instead of waiting until after it ends.
- Files updated:
  - binary-tree-next-app.mjs
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
  - Claude_Notes/binary-tree-next-gen-wasm-plan.md
- Validation:
  - node --check binary-tree-next-app.mjs passed.
## Recent Update (2026-04-10) - Mock First-Time Trigger Enabled

- Completed:
  - added one-time first-time override for current member user when Binary Tree Next runs in `mock-js` engine mode
  - scoped override to member source and non-first-time launch-state only
  - persisted consume marker in localStorage per user id to avoid repeated forced prompts
- Outcome:
  - current mock-session user can trigger welcome splash without manual DB reset.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
## Recent Update (2026-04-10) - Welcome Splash Apple Motion Style

- Completed:
  - redesigned first-time Welcome overlay to Apple-like frosted style
  - added ambient orb drift animation behind splash content
  - added staged entrance for title/subtitle and subtle subtitle pulse
  - added prefers-reduced-motion coverage for splash animation layers
  - updated splash visibility timing to trigger transitions consistently on show
- Outcome:
  - welcome prompt now feels more premium and cohesive with startup sequence.
- Files updated:
  - binary-tree-next.html
  - binary-tree-next-app.mjs
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
  - Claude_Notes/binary-tree-next-gen-wasm-plan.md
- Validation:
  - node --check binary-tree-next-app.mjs passed.
## Recent Update (2026-04-10) - Dock Asterisk Reset Action Wired To Server

- Completed:
  - added member-auth DELETE endpoint for Binary Tree launch-state reset
  - added intro-state delete query in member-binary-tree-intro store
  - wired dock asterisk action to call reset endpoint using current member auth token
  - on successful reset, app clears local mock override marker for current user and reloads
- Outcome:
  - you can press the dock asterisk to wipe first-time intro state and re-trigger welcome animation on next boot.
- Files updated:
  - backend/stores/member-binary-tree-intro.store.js
  - backend/services/auth.service.js
  - backend/controllers/auth.controller.js
  - backend/routes/auth.routes.js
  - binary-tree-next-app.mjs
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
  - Claude_Notes/binary-tree-next-gen-wasm-plan.md
- Validation:
  - node --check backend/stores/member-binary-tree-intro.store.js passed.
  - node --check backend/services/auth.service.js passed.
  - node --check backend/controllers/auth.controller.js passed.
  - node --check backend/routes/auth.routes.js passed.
  - node --check binary-tree-next-app.mjs passed.
## Recent Update (2026-04-10) - Binary Tree Reset 404 Resolved

- Completed:
  - added POST fallback reset endpoint for intro-state reset
  - updated dock reset flow to fall back from DELETE to POST on 404/405
  - restarted backend runtime so new routes are loaded
- Outcome:
  - asterisk reset no longer depends on DELETE-only path and is now resilient across route/method constraints.
- Validation:
  - GET /api/member-auth/binary-tree-next/launch-state returns 401 without auth
  - DELETE /api/member-auth/binary-tree-next/launch-state returns 401 without auth
  - POST /api/member-auth/binary-tree-next/launch-state/reset returns 401 without auth
## Recent Update (2026-04-10) - Binary Tree Welcome Splash Redesign Pass

- Completed:
  - rebuilt the first-open splash with a brand-based gradient atmosphere and clearer depth layering
  - added a branded badge using the L&D white icon asset
  - updated message hierarchy and continue instruction for better first-touch clarity
  - added focus-visible, hover, and active interaction states for the splash entry affordance
  - aligned splash close timeout from `180ms` to `260ms`
- Outcome:
  - welcome gate now has stronger visual identity and cleaner interaction cues.
- Files updated:
  - `binary-tree-next.html`
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Known limitations:
  - no screenshot/reference comparison loop was run in this pass.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-10) - Removed Left Panel Top Logo + Side-Nav Hide/Show Button

- Completed:
  - removed top logo/header block from left panel
  - removed collapse/expand side-nav button UI and related action flow
  - kept side-nav locked open so panel cannot be hidden by the removed controls
  - moved search row to occupy the top area
  - retained account menu via the search-row profile avatar
- Outcome:
  - left panel opens directly into search/favorites/details with no top logo strip and no hide/show control.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Known limitations:
  - screenshot comparison pass intentionally skipped.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-11) - Search Dropdown + No Search-Driven Tree Reflow

- Completed:
  - converted search to dropdown-results interaction instead of query-filtering tree layout
  - added ranked search results overlay under search bar
  - added keyboard navigation (up/down/enter/escape)
  - selecting a search result now focuses camera to that node only
  - removed `query` from frame draw + bounds fit pipelines so typing no longer shifts tree layout
- Outcome:
  - search is now selection-focused and stable; typing does not move/restructure the tree.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Known limitations:
  - screenshot comparison not run this pass.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-11) - Search Result Rows Now Show Node Icons

- Completed:
  - added node avatar/icon to each search dropdown result
  - styled avatar with node-gradient palette + initials
  - kept camera-focus-on-select behavior unchanged
- Outcome:
  - search results are easier to scan visually and now map directly to node identity style.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-11) - Search Dropdown Shows More Items + List Separators

- Completed:
  - increased search result count limit from 10 to 18
  - added thin divider lines between result rows
- Outcome:
  - dropdown now shows more candidates and is easier to visually scan.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-11) - Search Rows Made Uniform + Icon White Borders Removed

- Completed:
  - normalized search dropdown row heights for consistent list rhythm
  - forced title/subtitle to single-line ellipsis to prevent uneven row heights
  - removed white outer ring on search-result icons
  - removed white outer border on Favorites icons
- Outcome:
  - list now stays visually uniform regardless of name length, and icons match gradient style without white shells.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-11) - Selected Icon Color Lock (No Blue Accent)

- Completed:
  - removed selected-state blue/accent color swap
  - selected icons now keep their original gradient palette
  - applied white-border-only active indication for selected icons in Favorites and search dropdown
- Outcome:
  - selected visuals now match requested behavior: no blue swap, white border for active.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-11) - Profile Icon Dropdown Converted to Search-Style Panel

- Completed:
  - replaced the old canvas brand/profile popup with a DOM overlay panel anchored to the profile icon
  - reused search-dropdown visual shell (radius/border/shadow/blur) for consistency
  - added Apple Maps-style profile header (avatar, name, email, close affordance)
  - rendered uniform action rows with icons, chevrons, and thin separators
  - wired rows to existing profile/home/store/settings/logout actions
  - prevented search-result dropdown from competing while profile menu is open
- Outcome:
  - profile menu now opens as a stable dropdown container without canvas layout coupling.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Known limitations:
  - row icons are placeholder letter badges for now
  - screenshot pass skipped (per request)
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-11) - Profile Dropdown Uses Icon-Side Width + Compact Sizing

- Completed:
  - expanded profile dropdown width to use the extra right-side space through the profile-icon area
  - reduced heading and subheading sizes in profile header
  - reduced action row, icon, and chevron sizing for a more compact list
- Outcome:
  - profile panel now uses available horizontal space better and reads less oversized.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-11) - Profile Avatar Shadow Removed

- Completed:
  - removed drop shadow on the profile avatar shown in the profile dropdown container header.
- Outcome:
  - profile icon now renders flat (no halo/shadow) inside the profile panel.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-11) - Profile Container Headspace Increased

- Completed:
  - added more top headspace above the profile avatar in the profile dropdown header.
- Outcome:
  - profile icon now sits lower with clearer breathing room at the top of the profile container.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-11) - Profile Close Icon Switched to Material Symbol + More Headspace

- Completed:
  - added Material Symbols `close` font link in the HTML head
  - changed profile menu close control from text `x` to Material Symbols `close`
  - increased profile container top headspace again above the avatar
- Outcome:
  - close icon now matches icon system styling, and header has more breathing room.
- Files updated:
  - `binary-tree-next.html`
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-11) - Search Icon Restored + Smaller Profile Close Icon (`close_small`)

- Completed:
  - fixed search icon from showing as a word by switching search glyph render to Material Symbols codepoint
  - changed profile close icon import and glyph to `close_small`
  - reduced close button/icon sizing for better scale
- Outcome:
  - search icon now renders correctly again
  - profile close control is visually smaller and cleaner.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `binary-tree-next.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-11) - User Avatar Consistency + Profile List Material Icons

- Completed:
  - unified session avatar rendering (photo/gradient) across profile icon, profile panel header, tree session node rendering, and relevant search row avatars
  - added canvas image-avatar rendering with safe fallback to gradient + initials
  - linked session/root avatar palette resolution so profile-dependent visuals stay consistent
  - switched profile panel list icons to Material Symbols (`account_circle`, `home`, `local_mall`, `settings`, `logout`)
  - updated list icon style to white filled symbols over gradient circular containers
  - added requested Material Symbols imports in `binary-tree-next.html`
- Outcome:
  - user identity icon now stays visually aligned across profile surfaces, and profile menu rows now use the requested icon set/style.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `binary-tree-next.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-11) - Profile List Icons No Longer Render as Words

- Completed:
  - added a combined Material Symbols import covering all in-use icon names.
- Outcome:
  - profile menu list icons now resolve as proper symbols instead of literal words.
- Files updated:
  - `binary-tree-next.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-11) - Profile List Icons Forced to Symbols + Requested Color Mapping

- Completed:
  - hard-fixed profile menu list icons from word rendering by using symbol glyph codepoints
  - added full Material Symbols stylesheet import as fallback safety
  - mapped icon-circle gradients exactly per request:
    - Profile = Blue
    - Home = Green
    - My Store = Purple
    - Settings = Gray
    - Logout = Red
- Outcome:
  - profile container list icons now render as icons reliably and match the requested color scheme.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `binary-tree-next.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-11) - Binary Tree Next Node Details Weekly-BV Style Draft

- Completed:
  - redesigned left-panel `Node Details` container to mirror the "Weekly Total Organization BV" visual pattern
  - introduced KPI-first hierarchy (header pill, total BV headline, personal BV subline, legend + mini bars)
  - grouped metadata into compact tiles and retained relationship jump actions
  - kept badges rendering with wrap + overflow guards
- Outcome:
  - Node Details now reads like a dashboard metric module instead of a plain text list, while preserving existing interactions.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
- Note:
  - screenshot verification was skipped this pass per user request.

## Recent Update (2026-04-11) - Note Context Routing Added (Category-Based Intake)

- Completed:
  - created `Claude_Notes/Context-Router.md` as a first-stop note index for AI/Codex sessions
  - grouped note usage into practical categories (`BT-UI`, `BT-BIZ`, `AUTH`, `STORE`, `DB-BE`, `GLOBAL`, `RULES`)
  - documented read-first vs deep-dive paths per category
  - added task shortcuts so sessions can load only relevant context
- Outcome:
  - future tasks can avoid full-note scans and target only needed files, reducing context-window usage and prompt overhead.
- Files updated:
  - `Claude_Notes/Context-Router.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Note:
  - this is a logical split (routing/index); physical folder migration can be done later if desired.

## Recent Update (2026-04-11) - Node Panel Simplified (No Chart / No Live Badge / No Gradient)

- Completed:
  - simplified `Weekly Node Organization BV` panel in Binary Tree Next left side
  - removed chart section, removed `Live` badge, removed gradient/glow background treatment
  - retained only requested fields: Name, Username, Rank, Account Status, Total Organizational BV, Left Leg, Right Leg
- Outcome:
  - panel now matches the preferred cleaner style direction and is easier to scan.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-11) - Node Details Panel Rebuilt to Match Provided Mock

- Completed:
  - renamed panel heading to `Details`
  - rebuilt node card to mock-style centered layout
  - added avatar account-state dot (active/inactive indicator)
  - added rank row with two icon slots (rank + title icon)
  - replaced metric area with simple rows + separators (`#E2E2E2`)
  - restyled bottom Parent/Sponsor pills to requested palette (`#D0E6FF` + `#077AFF`)
  - wired button icons to `family_history` and `person_add` with fallback rendering
- Outcome:
  - panel now follows the intended visual language and data hierarchy from the provided reference.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `binary-tree-next.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-11) - Details Panel Typographic + Data Corrections

- Completed:
  - changed node details card background to white (`#FFFFFF`)
  - aligned panel typography to Inter weight mapping requested
  - added missing `Cycles` row
  - upgraded profile avatar rendering to prefer actual node/user photo fields with placeholder fallback
  - preserved active/inactive status dot behavior
- Outcome:
  - panel now better matches requested baseline style/spec while keeping dynamic node data rendering.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `binary-tree-next.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-11) - Node Avatar Visibility Fix (Details Panel)

- Completed:
  - corrected Details avatar draw order
  - ensured fallback initials render when no node photo exists
- Outcome:
  - node icon now appears consistently as actual photo or initials placeholder.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-11) - Details Card Spacing/Rhythm Tuning

- Completed:
  - increased details-card inner horizontal inset
  - tuned avatar-to-metrics visual rhythm
  - made metric row heights adaptive to preserve `Cycles` + both action buttons
  - clamped relation-button block placement for stable bottom padding
- Outcome:
  - closer vertical rhythm to the mock and more resilient layout fit.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-11) - Details Panel Readability/Icon Corrections

- Completed:
  - enlarged avatar initials
  - resized rank row text to username scale
  - switched Parent/Sponsor icon draw path to filled style and increased button label size
- Outcome:
  - closer to requested visual treatment and better readability.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-11) - Button Icons Fixed (Filled + Larger)

- Completed:
  - fixed Parent/Sponsor button icons to use filled style
  - increased action icon size for readability
  - added filled icon font import for `family_history` and `person_add`
- Outcome:
  - bottom action icons now align closer to requested icon style and size.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `binary-tree-next.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-11) - Details Action Icons Switched to Fixed SVGs

- Completed:
  - created local filled SVG assets for Parent/Sponsor actions
  - wired button icon draw to local SVG-first rendering path
  - increased icon size for clearer visibility
- Outcome:
  - button icons are now stable and consistent (not dependent on font-ligature rendering).
- Files updated:
  - `brand_assets/Icons/UI/family_history-filled.svg`
  - `brand_assets/Icons/UI/person_add-filled.svg`
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-11) - Details Parent/Sponsor Icons Switched to New Blue Assets

- Completed:
  - switched light-mode Parent/Sponsor button icons to new `UI` folder blue PNG files
  - added mode-aware icon-path resolver (light=blue, dark=white)
- Outcome:
  - action icons now use the exact provided asset set for light mode consistency.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-11) - Parent/Sponsor Label Font Locked to Inter Medium

- Completed:
  - enforced explicit label typography constants for Details relation buttons
  - set button label to `Inter` with `500` medium weight for both Parent and Sponsor
- Outcome:
  - consistent medium-weight Inter text treatment on both bottom action buttons.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-11) - Button Label Weight Increased

- Completed:
  - bumped Details Parent/Sponsor button label weight to `600`
- Outcome:
  - relation button labels now read visually bolder and closer to requested emphasis.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-11) - Node Details Avatar Now Syncs With Tree Colors

- Completed:
  - replaced hard-coded Details avatar `ocean` variant with tree-aligned variant selection (`auto` / `root`)
  - increased Details avatar initials font size to `32`
- Outcome:
  - selected-node avatar color treatment in Details now matches the tree node palette behavior.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-11) - Left Panel Width + Padding Refinement

- Completed:
  - increased overall left panel width slightly
  - reduced inner shell-to-content spacing (horizontal + top)
  - tightened Details card internal side padding
- Outcome:
  - panel feels wider while inner content sits closer to the container edges, matching requested tighter gap.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-11) - Side Panel Uses Mobile-Style Column Width

- Completed:
  - changed left panel width model from percentage scaling to a fixed mobile-like target width
  - set target to `390px` with responsive clamp (`320px` min and viewport-safe max)
- Outcome:
  - left panel now presents as a stable phone-width column while remaining safe on smaller screens.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-11) - Details Typography Bumped For New Panel Width

- Completed:
  - increased all core Details-card typography sizes (heading, name, username, rank, metric rows, relation button labels)
  - slightly increased rank icon size for visual balance with new text scale
- Outcome:
  - Details panel text now reads larger and more proportional within the widened mobile-style panel.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-11) - Details Header-to-Avatar Gap Increased

- Completed:
  - moved Details avatar block lower to create additional empty space under the `Details` header
- Outcome:
  - cleaner separation between heading and avatar.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-11) - Details Avatar Gap Increased (Offset 170)

- Completed:
  - set Details avatar center Y offset to `170` as requested
- Outcome:
  - significantly larger blank space between Details header and avatar block.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-11) - Avatar/Text Block Sync Fix in Details Card

- Completed:
  - linked name/username/rank Y positions to avatar Y anchor so they move together
  - adjusted metrics/block placement math to stay stable after larger avatar offset
- Outcome:
  - moving the avatar now correctly carries the text block beneath it instead of leaving text behind.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-11) - New Outlined Perspective Button Added

- Completed:
  - inserted a third Details action button under Parent/Sponsor
  - applied outline style (`#077AFF` border + text)
  - used provided blue light-mode icon from `brand_assets/Icons/UI`
  - connected button action to existing dock Enter behavior (`universe:enter`)
- Outcome:
  - Details action section now includes direct "Enter User Perspective" control in the requested outlined visual treatment.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-11) - Details Button Icons Smoothed

- Completed:
  - improved canvas icon rendering to reduce jagged appearance
  - added integer pixel snapping + high-quality image smoothing in shared image draw helper
- Outcome:
  - Parent/Sponsor/Enter User Perspective icons should render cleaner and less jagged.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-11) - Dock Enter Uses `send_money` Icon

- Completed:
  - swapped dock Enter icon to Material Symbols `send_money`
  - added explicit icon font import for `send_money`
  - kept fallback to old Enter glyph for resilience
- Outcome:
  - bottom dock Enter control now matches requested icon reference.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `binary-tree-next.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-12) - Details Header/Icon Gap Now Responsive

- Completed:
  - replaced fixed Details avatar Y offset with height-responsive gap logic
  - anchored avatar spacing to `detailsHeadingY`
- Outcome:
  - keeps clean head space on large displays while staying compatible on smaller laptop heights.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-12) - Details Panel Now Height-Adaptive (Tight Mode)

- Completed:
  - added aggressive responsive compression for Details panel vertical layout
  - scaled avatar/gaps/text/buttons/metrics from available Details card height
  - made metric row text + divider positions dynamic to avoid collisions
  - scaled relation button icons with button height in compact mode
- Outcome:
  - preserves head space under `Details` while preventing overlap on smaller laptop-sized screens.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-12) - Header/Icon Gap Tightened

- Completed:
  - reduced responsive `Details` header-to-avatar gap range for a tighter look
- Outcome:
  - less empty space between heading and profile icon while keeping small-screen adaptive behavior.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-12) - Favorites/Details Gap Reduced

- Completed:
  - tightened vertical spacing between Favorites area and Details container
  - used a dedicated `favoritesToDetailsGap` value (`12`) for targeted control
- Outcome:
  - Details card now sits slightly closer to Favorites while preserving the rest of the panel rhythm.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-12) - Favorites/Details Spacing Now Shrinks Properly

- Completed:
  - made Favorites section height and handoff gap responsive to panel height
  - adjusted Favorites viewport top/bottom insets and dynamic viewport height
- Outcome:
  - Details container now moves closer as expected on smaller screens; spacing changes are visibly effective.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-12) - Profile Moved to Right Screen Edge + Sidebar Toggle Added

- Completed:
  - replaced in-panel profile slot with `side_navigation` sidebar toggle control
  - implemented `side-nav:toggle` action for hide/show behavior
  - moved user profile trigger to right side of screen (same vertical level as left-panel top controls)
  - adjusted profile-menu width/anchor logic for right-edge placement
  - added `side_navigation` font import
- Outcome:
  - cleaner top-left panel controls and correct profile placement on the right edge as requested.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `binary-tree-next.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-12) - Enter Button Removed, Parent/Sponsor Pinned to Bottom

- Completed:
  - removed Details-section Enter action button
  - kept Parent + Sponsor only
  - pinned the two remaining action buttons to the bottom of the Details container
- Outcome:
  - extra vertical breathing room is now available for Details content above the action buttons.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

- Cleanup:
  - removed unused relation placement variable from Details action layout block.

## Recent Update (2026-04-12) - Right Profile Shadow Removed

- Completed:
  - removed drop shadow from right-side floating user profile icon
- Outcome:
  - profile icon now renders flat (no shadow), matching request.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-12) - Right Profile White Border Removed

- Completed:
  - removed outer white border/ring from right-side floating profile icon
  - made avatar fill full circular button area
- Outcome:
  - profile icon now renders without white border, matching request.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-12) - Right Profile Border Reintroduced (Subtle)

- Completed:
  - added back a thin white ring around the right-side floating profile icon
- Outcome:
  - slight border is visible without the heavy outlined look.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-12) - Profile Popup Shifted to Left of Right-Side Icon

- Completed:
  - changed popup anchor behavior so the right-side profile menu appears on the icon's left side
  - added a small anchor gap for cleaner spacing
- Outcome:
  - profile popup now opens in the expected side position relative to the right-edge profile control.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-12) - Right Profile Uses Shadow Instead of Border

- Completed:
  - removed thin white border from right-side profile icon
  - added slight drop shadow to the avatar render
- Outcome:
  - profile trigger has subtle depth with no white border outline.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-12) - Profile Popup Now Side-Aligned Left

- Completed:
  - changed right-side profile popup Y anchor to icon level (not below)
  - reduced popup/icon horizontal gap slightly for tighter side-by-side alignment
- Outcome:
  - popup now appears directly to the left of the profile icon with a small spacing gap.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-12) - Profile Popup Shadow Reduced

- Completed:
  - tuned down profile popup drop shadow strength and spread
- Outcome:
  - popup now has a softer, less dominant shadow.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-12) - Search Bar Shadow Removed

- Completed:
  - removed drop shadow styling from left-panel search bar
- Outcome:
  - search bar now has a flatter, cleaner appearance.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-12) - Sidebar Toggle Hover/Shadow Removed

- Completed:
  - removed hover visual effect from sidebar toggle icon button
  - removed drop shadow from sidebar toggle icon button
- Outcome:
  - icon button remains visually consistent and static on hover.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-12) - Sidebar Toggle Now Icon-Only With Hover Darken

- Completed:
  - removed sidebar toggle background and border visuals
  - added slight hover darken on icon color
- Outcome:
  - cleaner icon-only toggle with subtle interactive feedback.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-12) - Sidebar Toggle Hover Darkening Expanded

- Completed:
  - added subtle container back for sidebar toggle icon
  - applied hover darkening to both container and icon
- Outcome:
  - clearer hover feedback while preserving the minimal control style.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-12) - Sidebar Toggle Seamless Base + Slight Dark Hover

- Completed:
  - set sidebar toggle container to match left panel background in default state
  - added subtle darker hover treatment (container + icon)
- Outcome:
  - control blends into panel at rest and still provides gentle hover feedback.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-12) - Sidebar Icon Color Set to Requested Values

- Completed:
  - set sidebar toggle icon default color to `#888888`
  - set sidebar toggle icon hover color to `#444444`
- Outcome:
  - icon color now follows exact requested idle/hover values.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-12) - Favorites Carousel Lag Reduction

- Completed:
  - added caching for computed Favorites list entries
  - invalidated cache on pinned-node updates
  - eliminated repeated heavy summary calculations during every draw frame
- Outcome:
  - smoother left/right Favorites interaction with less lag during drag/scroll.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-12) - Favorites Selected White Ring Removed

- Completed:
  - removed white selected border/ring from Favorites avatars
- Outcome:
  - pinned item selection no longer shows white ring in Favorites.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-12) - Favorites Avatar Shadow Removed

- Completed:
  - removed favorites avatar drop shadow in idle and hover states
- Outcome:
  - favorites area avatars now render flat (no shadow), matching request.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-12) - Left Panel Subtle Glassmorphism Applied

- Completed:
  - applied faint glassmorphism to left shell panel only (low blur + light translucent fill)
  - added soft edge/rim treatment while keeping overall panel brightness
  - preserved non-left panel chrome behavior unchanged
- Outcome:
  - left panel now has a subtle glass layer blur where background is barely visible, while retaining a light appearance.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
## Recent Update (2026-04-12) - Left Panel Glass Effect Reverted

- Completed:
  - removed the newly added glassmorphism layer from the left panel shell
  - restored the earlier flat panel appearance
- Outcome:
  - left panel now matches the pre-glass version as requested.
- Files updated:
  - binary-tree-next-app.mjs
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Validation:
  - node --check binary-tree-next-app.mjs passed.
## Recent Update (2026-04-12) - Left Panel Height + Right Profile Size Increased

- Completed:
  - aligned floating right profile icon to left panel container top level (no longer tied to search row Y)
  - increased right profile icon size to 44
  - increased left panel usable vertical size by reducing top and bottom panel inset
- Outcome:
  - profile control now visually matches left panel top alignment, and both panel and profile make better use of available vertical space.
- Files updated:
  - binary-tree-next-app.mjs
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Validation:
  - node --check binary-tree-next-app.mjs passed.
## Recent Update (2026-04-12) - Dock Converted to Right-Side Vertical Circular Buttons

- Completed:
  - moved dock controls from bottom horizontal bar to right-side vertical stack
  - changed dock button shapes to circular controls to match floating profile style
  - applied requested vertical order: Asterisk, Deep, Enter, Home, Back
- Outcome:
  - dock now visually follows the right-side floating control system and uses the requested top-to-bottom sequence.
- Files updated:
  - binary-tree-next-app.mjs
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Validation:
  - node --check binary-tree-next-app.mjs passed.
## Recent Update (2026-04-12) - Dock Button Shape Corrected to Perfect Circles

- Completed:
  - replaced rounded-rect button rendering with true arc-based circular rendering on right-side dock
- Outcome:
  - dock controls now render as exact circles instead of rounded-square approximations.
- Files updated:
  - binary-tree-next-app.mjs
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Validation:
  - node --check binary-tree-next-app.mjs passed.
## Recent Update (2026-04-12) - Right Dock Icons Slightly Smaller

- Completed:
  - reduced right-side dock icon size (23 -> 20)
- Outcome:
  - icons now sit with a little more breathing room inside the circular buttons.
- Files updated:
  - binary-tree-next-app.mjs
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Validation:
  - node --check binary-tree-next-app.mjs passed.
## Recent Update (2026-04-12) - Right Dock Hover Unified With Sidebar Toggle

- Completed:
  - matched right dock hover colors to left sidebar toggle values
  - removed dock hover shadow for behavior consistency
- Outcome:
  - dock buttons now follow the same hover visual language as the sidebar icon control.
- Files updated:
  - binary-tree-next-app.mjs
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Validation:
  - node --check binary-tree-next-app.mjs passed.
## Recent Update (2026-04-12) - Right Dock Icon Hover Simplified

- Completed:
  - set right dock icon color to constant `#444444` in idle and hover
  - kept hover effect only on circular container color
- Outcome:
  - icon no longer changes color on hover; only the button circle changes.
- Files updated:
  - binary-tree-next-app.mjs
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Validation:
  - node --check binary-tree-next-app.mjs passed.
## Recent Update (2026-04-12) - Right Dock Hover Container Color Adjusted

- Completed:
  - changed right dock hover circle fill to `#DEDEDE`
- Outcome:
  - hover container now uses the exact requested gray tone.
- Files updated:
  - binary-tree-next-app.mjs
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Validation:
  - node --check binary-tree-next-app.mjs passed.
## Recent Update (2026-04-12) - Home Now Returns to Global Root/User Node

- Completed:
  - implemented global-home resolver to prioritize session-linked node ids and fallback to `root`
  - added global-home routine that exits nested perspectives and clears universe history
  - wired dock Home and keyboard `h/0` to use global-home routine
- Outcome:
  - Home now always returns from nested perspective to global view and focuses/selects root or user-linked node.
- Files updated:
  - binary-tree-next-app.mjs
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Validation:
  - node --check binary-tree-next-app.mjs passed.
## Recent Update (2026-04-12) - Enter Now Has Zoom-In Perspective Transition

- Completed:
  - added two-stage Enter flow (pre-zoom then perspective enter)
  - routed dock Enter and keyboard `u` to the new transition function
  - added cancellation guards to avoid delayed accidental enter on other interactions
- Outcome:
  - entering a node now visually feels like diving into the node before switching perspective.
- Files updated:
  - binary-tree-next-app.mjs
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Validation:
  - node --check binary-tree-next-app.mjs passed.
## Recent Update (2026-04-12) - Enter Animation Slowed and Made More Natural

- Completed:
  - changed Enter to stronger node zoom-in before perspective switch
  - delayed perspective switch slightly so transition is readable
  - made local perspective open from zoomed-out and ease into default local root focus
  - slowed enter camera easing for less abrupt motion
- Outcome:
  - Enter now feels like moving into a node rather than snapping/recentering between views.
- Files updated:
  - binary-tree-next-app.mjs
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Validation:
  - node --check binary-tree-next-app.mjs passed.
## Recent Update (2026-04-12) - Enter Transition Made Slower and More Natural

- Completed:
  - increased Enter pre-zoom strength and duration
  - replaced fixed delay with camera-progress-aware handoff before local switch
  - made local start scale smaller (`0.45`) before easing to default local view
  - slowed Enter camera damping (`4.8`) for smoother movement
- Outcome:
  - Enter now behaves as a true transition: zoom in globally, then continue into local view without abrupt snap timing.
- Files updated:
  - binary-tree-next-app.mjs
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Validation:
  - node --check binary-tree-next-app.mjs passed.
## Recent Update (2026-04-12) - Local View Enter Transition Clarified

- Completed:
  - made local perspective start slightly zoomed out on enter
  - then animate/settle into normal default local view
  - enabled transition-only lower render scale floor to make zoom-out phase visible
- Outcome:
  - local view now clearly participates in the enter transition instead of appearing at final scale immediately.
- Files updated:
  - binary-tree-next-app.mjs
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Validation:
  - node --check binary-tree-next-app.mjs passed.
## Recent Update (2026-04-12) - Enter Transition Now Uses Crossfade With Immediate Cut

- Completed:
  - removed Enter end-of-zoom pause by switching at fixed transition timing
  - added global fade-out during zoom-in phase
  - added local fade-in during zoom-out/settle-to-default local phase
  - kept local enter start zoomed out, then eased into default local view
- Outcome:
  - Enter now feels like a continuous transition: global zoom+fade out, immediate cut, then local fade in while settling.
- Files updated:
  - binary-tree-next-app.mjs
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Validation:
  - node --check binary-tree-next-app.mjs passed.
## Recent Update (2026-04-12) - Back Transition Now Mirrors Enter in Reverse

- Completed:
  - added cinematic Back flow as reverse of Enter
  - local view now zooms out + fades out before cut
  - parent/global view now fades in while easing from zoomed-in start to default view
  - wired dock Back and keyboard `b` to transition-backed exit routine
  - added cancellation safety for both Enter and Back transition pipelines
- Outcome:
  - Back now feels like a true return transition rather than an immediate perspective snap.
- Files updated:
  - binary-tree-next-app.mjs
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Validation:
  - node --check binary-tree-next-app.mjs passed.
## Recent Update (2026-04-12) - Back Local Fade-Out Start Delayed

- Completed:
  - delayed Back local fade-out start by `150ms` while local zoom-out begins immediately
  - kept overall back cut timing and parent fade-in behavior unchanged
- Outcome:
  - local back transition now looks smoother and less laggy at the start of fade-out.
- Files updated:
  - binary-tree-next-app.mjs
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Validation:
  - node --check binary-tree-next-app.mjs passed.

## Recent Update (2026-04-12) - Multi-Step Enrollment Panel Implemented (Apple-Inspired)

- Completed:
  - replaced enroll modal contents with a 4-step flow container docked beside the left panel UI
  - implemented required page copy for steps 1-3 and added a thank-you + Fast Track commission step
  - integrated Stripe Card Number element in step 3 using /api/store-checkout/config
  - preserved enroll submit API + in-canvas node insertion behavior after successful registration
  - added step validation, package/BV/checkout summary sync, and previous/next step navigation.
- Outcome:
  - Binary Tree Next now has a guided enrollment UX matching provided visual direction and color tokens, with secure Stripe-hosted card-number input.
- Files updated:
  - binary-tree-next.html
  - binary-tree-next-app.mjs
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
  - Claude_Notes/binary-tree-next-gen-wasm-plan.md
- Validation:
  - node --check binary-tree-next-app.mjs passed.
## Recent Update (2026-04-12) - Enrollment Panel Cleanup Pass (Layout Tightening)

- Completed:
  - tightened enroll panel spacing and vertical rhythm to better match the provided design
  - removed white horizontal divider artifacts caused by section margin bleed
  - cleaned close icon/button styling for a simpler, cleaner look.
- Outcome:
  - panel now renders more compactly and the visual split lines in the upper/middle areas are removed.
- Files updated:
  - binary-tree-next.html
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Validation:
  - node --check binary-tree-next-app.mjs passed.

## Recent Update (2026-04-12) - Enrollment Container Overflow Fix

- Completed:
  - fixed enroll panel clipping/overflow behavior by forcing border-box sizing in the panel subtree
  - removed horizontal bottom scrollbar by switching panel body to vertical-only scrolling
  - normalized form/step wrapper widths (`width: 100%`, `min-width: 0`) so fields stay inside margins.
- Outcome:
  - no horizontal scroll bleed at panel bottom and fields now sit correctly within container margins.
- Files updated:
  - binary-tree-next.html
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Validation:
  - node --check binary-tree-next-app.mjs passed.

## Recent Update (2026-04-12) - Enrollment Refinement (Header/Close/Step2/Expiry)

- Completed:
  - centered enroll title/caption in header layout
  - replaced close icon styling to match profile popup style and set it to absolute top-right
  - forced Step 2 detail text rendering to black
  - added Stripe expiry field and validation requirement in checkout step.
- Outcome:
  - enrollment panel now matches intended header alignment and close-control behavior, and payment section includes expiry data entry.
- Files updated:
  - binary-tree-next.html
  - binary-tree-next-app.mjs
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Validation:
  - node --check binary-tree-next-app.mjs passed.

## Recent Update (2026-04-12) - Enrollment Downscale + Spillover Toggle + Card Icon

- Completed:
  - reduced enrollment action button sizing for a tighter form footprint
  - retained Inter-first typography on text fields and updated Stripe card element style to Inter-first
  - restored `credit_card` icon inside the card-number field shell
  - added Step 2 `Spillover: Yes/No` selector
  - wired submission logic to switch payload between direct (`left/right`) and spillover (`placementLeg: spillover`) modes
  - synced Step 2 leg-position text to reflect spillover selection.
- Outcome:
  - panel content is now slightly downscaled, card field visual parity is restored, and enrollment can explicitly choose spillover behavior per registration.
- Files updated:
  - binary-tree-next.html
  - binary-tree-next-app.mjs
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Validation:
  - node --check binary-tree-next-app.mjs passed.

## Recent Update (2026-04-12) - Enrollment Header Centering + Step2 Reorder + Spillover Sponsor Behavior

- Completed:
  - enforced stronger visual centering for enrollment header title/caption
  - added visible Step 2 static labels and rearranged fields to:
    - Account Package
    - Leg Position
    - Spill Over
    - Parent
    - Sponsor
  - reduced bottom step pagination indicator size for a tighter footer
  - normalized step/form container structure for more consistent page-to-page layout
  - updated spillover sponsor logic:
    - `Spillover: Yes` now uses session-user sponsor identity in UI/payload
    - `Spillover: No` keeps direct placement sponsor behavior.
- Outcome:
  - enrollment flow now aligns more closely with requested copy/layout order while keeping spillover semantics clearer and more predictable.
- Files updated:
  - binary-tree-next.html
  - binary-tree-next-app.mjs
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Validation:
  - node --check binary-tree-next-app.mjs passed.

## Recent Update (2026-04-12) - Enrollment Text Contrast + Stripe Placeholder Sizing + Tax Calculation

- Completed:
  - set enrollment placeholders to `#888888` while typed/selected values render `#000000`
  - normalized readonly field value color to black for consistent answer-state contrast
  - resized Stripe card field typography to match enrollment input scale
  - implemented checkout tax math at `9.75%` (subtotal/discount/tax/total with cent rounding).
- Outcome:
  - field readability now follows placeholder-vs-answer contrast expectations, Stripe fields visually match the rest of the form, and checkout totals include tax accurately.
- Files updated:
  - binary-tree-next.html
  - binary-tree-next-app.mjs
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Validation:
  - node --check binary-tree-next-app.mjs passed.

## Recent Update (2026-04-12) - Spillover Sponsor Fix + Enrollment Speedup

- Completed:
  - fixed spillover sponsor mapping for newly enrolled nodes in `binary-tree-next-app.mjs` so sponsor relation resolves to actual sponsor identity (and falls back to preferred home/root for spillover when username mapping is unavailable)
  - hardened left-panel sponsor relation fallback to avoid unresolved sponsor-id display gaps
  - removed enrollment full-table rewrite bottleneck by switching `createRegisteredMember` persistence to transactional row-level writes
  - introduced row-level store helpers for `member_users`, `registered_members`, `password_setup_tokens`, and `email_outbox`.
- Outcome:
  - newly enrolled spillover members now show correct sponsor behavior in relation UI
  - enrollment registration path no longer performs O(N) delete/reinsert across four tables, reducing time-to-thank-you under larger datasets.
- Files updated:
  - binary-tree-next-app.mjs
  - backend/services/member.service.js
  - backend/stores/user.store.js
  - backend/stores/member.store.js
  - backend/stores/token.store.js
  - backend/stores/email.store.js
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Validation:
  - node --check binary-tree-next-app.mjs passed.
  - node --check backend/services/member.service.js passed.
  - node --check backend/stores/user.store.js passed.
  - node --check backend/stores/member.store.js passed.
  - node --check backend/stores/token.store.js passed.
  - node --check backend/stores/email.store.js passed.

## Recent Update (2026-04-12) - Depth-20 Anticipation Behavior (View Cap vs Enrollment Cap)

- Completed:
  - removed global-depth anticipation gating from `binary-tree-next-app.mjs` (`nextGlobalDepth > 20` check removed)
  - kept anticipation slot visibility constrained by active universe/local depth cap (still max 20 levels rendered in view)
  - documented behavior inline so future updates preserve this rule.
- Outcome:
  - depth-20 limit now behaves as a rendering cap only
  - users can continue enrolling deeper generations by entering local view, while anticipation remains hidden when the active view itself reaches its local 20-level cap.
- Files updated:
  - binary-tree-next-app.mjs
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Validation:
  - node --check binary-tree-next-app.mjs passed.

## Recent Update (2026-04-12) - Binary Tree Next Switched to Live Registered-Members DB

- Completed:
  - removed Binary Tree Next bootstrap dependency on mock-node generation
  - wired boot hydration to live registered-members APIs (`/api/registered-members` and `/api/admin/registered-members`)
  - implemented live placement reconstruction (open/extreme/spillover logic) from persisted member placement metadata
  - preserved scoped synthetic `root` view contract while rendering real descendant nodes from DB
  - added resilient fallback to root-only render when live fetch fails (with boot-error notice).
- Outcome:
  - Binary Tree Next now renders from actual DB-backed enrollment records instead of generated mock data.
- Files updated:
  - binary-tree-next-app.mjs
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Validation:
  - node --check binary-tree-next-app.mjs passed.

## Recent Update (2026-04-12) - Enrollment Package Selector Now Paid-Only

- Completed:
  - removed `Free Account` from Binary Tree Next enrollment package dropdown
  - added paid-only package enforcement in enrollment step validation and submit guard
  - normalized package-preview/tier sync to coerce non-paid values back to default paid package.
- Outcome:
  - Enrollment panel now supports paid members/packages only for package selection and registration payload.
- Files updated:
  - binary-tree-next.html
  - binary-tree-next-app.mjs
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Validation:
  - node --check binary-tree-next-app.mjs passed.

## Recent Update (2026-04-12) - Enrollment Dropdowns Switched To Custom Styled Menus

- Completed:
  - replaced Step 2 native-looking dropdown controls with custom menu triggers (`Account Package`, `Spill Over`)
  - aligned dropdown appearance with enrollment panel field style (radius, spacing, typography, focus, chevron behavior)
  - implemented JS custom-select sync layer to keep hidden native select values and displayed labels aligned
  - added outside-click and `Esc` close behavior for open menus.
- Outcome:
  - enrollment dropdowns no longer depend on default WebKit/native select rendering and now visually match the panel component.
- Files updated:
  - binary-tree-next.html
  - binary-tree-next-app.mjs
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Validation:
  - node --check binary-tree-next-app.mjs passed.

## Recent Update (2026-04-12) - Enrollment Registration Latency Reduction (Backend)

- Completed:
  - removed enrollment full-user-table read from `createRegisteredMember`
  - switched sponsor/email/username checks to targeted DB lookups
  - replaced username/store-code uniqueness generation with incremental lookup-based reservation
  - added startup warmup for registered-member schema prep and member-user lookup indexes
  - added DB pool timeout/size settings for faster failure on blocked connections.
- Outcome:
  - enrollment registration path now performs constant-time lookups instead of loading all users, reducing request latency and improving time-to-thank-you under larger datasets.
- Files updated:
  - `backend/services/member.service.js`
  - `backend/stores/user.store.js`
  - `backend/stores/member.store.js`
  - `backend/app.js`
  - `backend/db/db.js`
  - `backend/db/admin-db.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Design decisions:
  - kept API response shape stable to avoid frontend regressions while optimizing backend internals.
  - made startup warmups best-effort so server boot is resilient in environments without DDL/index privileges.
- Known limitations:
  - thank-you UI still waits for synchronous enroll API completion.
  - Stripe payment-intent confirmation flow is not part of this performance patch.
- Validation:
  - `node --check backend/services/member.service.js` passed.
  - `node --check backend/stores/user.store.js` passed.
  - `node --check backend/stores/member.store.js` passed.
  - `node --check backend/app.js` passed.
  - `node --check backend/db/db.js` passed.
  - `node --check backend/db/admin-db.js` passed.

## Recent Update (2026-04-12) - Enrollment Delay Mitigation Pass 2

- Completed:
  - switched registration flow to shared DB client usage across lookup + write stages
  - added insert-first write optimization (`preferInsert`) across member/user/token/email persistence helpers
  - made store-code conflict query index-compatible
  - changed enroll submit UX to render thank-you before deferred tree relayout work
  - restarted backend process to load new runtime patch.
- Outcome:
  - enrollment path now does fewer write round-trips and the thank-you panel no longer waits for synchronous in-thread tree relayout paint.
- Files updated:
  - `backend/services/member.service.js`
  - `backend/stores/user.store.js`
  - `backend/stores/member.store.js`
  - `backend/stores/token.store.js`
  - `backend/stores/email.store.js`
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check backend/services/member.service.js` passed.
  - `node --check backend/stores/user.store.js` passed.
  - `node --check backend/stores/member.store.js` passed.
  - `node --check backend/stores/token.store.js` passed.
  - `node --check backend/stores/email.store.js` passed.
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-12) - Placement-On-Done + Shrink Animation

- Completed:
  - deferred enroll node insertion until Thank You `Done` action
  - staged successful enroll response in pending placement state
  - added node placement shrink animation track (`1.34 -> 1.0`) for new node render
  - triggered animation when pending placement is finalized by Done.
- Outcome:
  - enrollment now confirms visually with a shrink-into-place animation at the chosen placement leg, starting only after Done is pressed.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-12) - Placement Animation Slowed + Grow Direction

- Completed:
  - switched new-node placement animation to grow-in (`0.68 -> 1.0`) instead of oversize shrink.
  - increased placement animation duration from `320ms` to `620ms` for a slower reveal.
  - renamed animation starter helper to `startPlacementGrowAnimation(...)` for behavior clarity.
- Outcome:
  - after enrollment `Done`, newly placed nodes now appear with a slower small-to-full-size animation.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-12) - Enrollment Done Camera Follow To New Node

- Completed:
  - changed Thank You `Done` sequence to close enrollment panel first, then run placement reveal.
  - added combined reveal helper (`playEnrollmentPlacementReveal`) to trigger node grow-in plus camera focus.
  - added centered enroll focus helper (`focusNodeForEnrollmentPlacement`) so camera recenters directly on the created node.
  - enforced a minimum `+7%` camera scale bump during this focus so transition consistently zooms in.
  - added enroll-specific camera damping profile (`targetReason: enroll-placement`) for a smoother zoom/center motion.
- Outcome:
  - pressing `Done` now dismisses the panel and immediately transitions camera to the newly placed node while it animates in.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-12) - Camera-First Node Reveal + Slow Overshoot Settle

- Completed:
  - changed placement reveal order to center/zoom camera first, then start node scale animation.
  - added pending placement reveal queue to wait for enroll camera settle before node animation.
  - changed placement scale animation to staged exaggeration: `small -> slight overshoot -> settle`.
  - slowed reveal timing and tuned constants (`980ms`, start `0.66`, peak `1.10`, settle `1.0`).
- Outcome:
  - after pressing `Done`, users now see camera center first and then a slower, more expressive node-entry animation.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-12) - Node Pre-Reveal Flash Bug Fix

- Completed:
  - fixed issue where newly created node appeared in-place before reveal animation started.
  - added pending-reveal hidden-state checks across draw and hit-test paths.
  - excluded hidden pending node from connector rendering until reveal begins.
  - removed extra `requestAnimationFrame` delay in Done handler to avoid pre-reveal frame flash.
- Outcome:
  - on `Done`, node remains hidden while camera centers, then appears only when staged grow/overshoot animation starts.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-12) - Anticipation Flash Removal + Connector Draw-In

- Completed:
  - removed anticipation slot rendering while pending placement reveal is queued or active.
  - extended pending reveal state to include placement reservation metadata (`parentId`, `placementLeg`).
  - added animated connector draw-in from parent to the new node during placement animation.
  - wired Done reveal payload to pass node + placement reservation context.
- Outcome:
  - after `Done`, anticipation nodes no longer pop in during reveal, and the connection line to the new node now animates in with the node entry.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-12) - Default Selection Removed (Startup + Enrollment Create)

- Completed:
  - removed startup default root selection.
  - removed auto-selection on enrollment placement apply.
  - removed auto-selection from enrollment camera-focus helper.
  - kept camera centering/zoom behavior unchanged.
- Outcome:
  - Binary Tree opens with no selected node by default, and newly created node is no longer auto-selected after `Done`.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-12) - Node Active Badge Synced To Account Records

- Completed:
  - enriched `/registered-members` store reads with linked `member_users` account status fields.
  - mapped effective account status/password-setup/activity fields in member-store DTO mapping.
  - expanded frontend status resolver to consume linked status keys and boolean active flags.
- Outcome:
  - Binary Tree node activity badge/dot logic now reflects actual account status (from account record) instead of defaulting to Active for most members.
- Files updated:
  - `backend/stores/member.store.js`
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check backend/stores/member.store.js` passed.
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-12) - Thank You Password Setup Link Added

- Completed:
  - added password-setup link container under enrollment Thank You section.
  - added `Open Link` and `Copy Link` actions with inline feedback states.
  - wired link source to enrollment response (`createdMember.passwordSetupLink`).
  - added reset/clear behavior for subsequent enrollment sessions.
- Outcome:
  - onboarding can continue without email delivery by using the in-panel password setup link directly after enrollment.
- Files updated:
  - `binary-tree-next.html`
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-12) - Binary Tree Live Sync Without Reload

- Completed:
  - added live-sync polling state/scheduler to Binary Tree Next (`900ms` initial, `2800ms` visible, `12000ms` hidden)
  - added hash-based snapshot comparison to skip no-change reapply
  - added visibility/focus forced sync hooks for faster catch-up
  - guarded polling during enrollment submit and placement reveal animation windows
  - updated local placement path to refresh snapshot hash immediately after node apply.
- Outcome:
  - global tree now refreshes newly enrolled nodes and account-status changes automatically without manual page reload, while preserving enrollment reveal animation stability.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-12) - Live Sync New-Node Animation Added

- Completed:
  - added live diff helper to detect node IDs newly introduced by polling updates
  - wired live apply path to start existing placement grow/overshoot animation tracks for newly added nodes
  - enabled live animation option in sync apply flow (`animateNewNodes: true`)
  - added animation burst cap (`24`) for frame-stability protection.
- Outcome:
  - realtime-enrolled nodes no longer pop in instantly; they now enter using the same placement animation style as enroll-driven node creation.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-12) - Root-Based Spillover Gate + Step 2 Field Reorder

- Completed:
  - added root readiness gate for Spill Over availability in enrollment panel (`root` must have both left and right children)
  - disabled `Spillover: Yes` option when root is not ready and auto-fallback to direct mode
  - synced availability on modal open, step-2 validation, and live tree refresh while panel is open
  - swapped Step 2 field order to `Spill Over` then `Leg Position`.
- Outcome:
  - root users without both legs filled can no longer choose spillover yet, and page-2 field sequence now matches requested order.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `binary-tree-next.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-12) - Enrollment Panel Tightened For Small Laptop Screens

- Completed:
  - converted enroll modal shell/body to adaptive flex layout (removed rigid fixed body height)
  - unified modal/header/body surface layering to remove header-content separation seam
  - tightened step-2 vertical spacing (package card, field gaps, action spacing)
  - added `max-height: 860px` responsive compact mode for short-height screens (smaller headers/controls/buttons).
- Outcome:
  - step-2 enrollment view is more compact on MacBook-like heights and no longer shows the prior visual split between header and content.
- Files updated:
  - `binary-tree-next.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-12) - Step 2 Package Card Updated With Fast Track Bonus Row

- Completed:
  - added Step 2 package-card divider + `Fast Track Bonus` row in enrollment panel
  - added dynamic bonus value element (`#tree-next-enroll-package-fast-track-bonus`)
  - wired bonus value updates in package preview sync using existing bonus resolver and effective package tier
  - added responsive style tuning for new row in compact-height mode.
- Outcome:
  - Step 2 package card now follows requested layout direction with visible Fast Track Bonus value below products.
- Files updated:
  - `binary-tree-next.html`
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-12) - Avatar Gradient Sync (Profile <-> Node <-> Live Tree)

- Completed:
  - removed hardcoded blue (`ocean`) session fallback and switched to deterministic auto-seed avatar palette fallback
  - unified avatar color parsing with shared record helpers (supports multiple color/palette payload key shapes)
  - updated node avatar rendering and CSS background logic to consume node-level avatar color/palette/photo data when present
  - extended live member->node mapping to carry avatar metadata (`avatarSeed`, `avatarColor`, `avatarColorRgb`, `avatarPalette`, `avatarUrl`)
  - updated live snapshot signature to include avatar fields so color/photo changes can sync in realtime.
- Outcome:
  - root/profile avatar is no longer always forced blue when no explicit color exists
  - profile/avatar gradients now stay consistent with binary-tree node color logic.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-12) - Favorites Text Overflow Fix

- Completed:
  - implemented width-based truncation helper for canvas text (`truncateTextToWidth`)
  - updated Favorites carousel label/subtitle rendering to truncate by pixel width and respect slot max width
  - removed the long-name overlap behavior between adjacent pinned favorites.
- Outcome:
  - long favorite names no longer spill into neighboring pinned nodes in the left panel.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-12) - Sidebar Build Split: Binary Tree Old + Next Gen

- Completed:
  - renamed existing sidebar binary tree entries to `Binary Tree (Old)`
  - added `Binary Tree (Next Gen)` links in member/admin dashboard sidebars
  - wired Next Gen entries to `/binary-tree-next.html` as direct navigation links.
- Outcome:
  - Build area now clearly shows both old and next-gen binary tree options.
- Files updated:
  - `index.html`
  - `admin.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

## Recent Update (2026-04-12) - Dashboard Stripe Checkout Country Code Normalization

- Completed:
  - patched dashboard `My Store` Stripe confirmation flow to normalize billing country inputs into ISO 3166-1 alpha-2 codes before calling `stripe.confirmCardPayment(...)`
  - added name-to-code resolution for known app country labels and common aliases (for example `United States` -> `US`, `USA` -> `US`, `UK` -> `GB`)
  - added checkout validation guard that blocks submit with a clear message when billing country cannot be resolved to a valid 2-letter code.
- Outcome:
  - checkout no longer fails with Stripe error `Country 'United States' is unknown` when users enter full country names.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/public-store-page.md`
- Validation:
  - `All inline scripts parsed successfully. Blocks: 2`

## Recent Update (2026-04-12) - Enrollment Payment Capture Fix (Do Fix First Before Invoice UI)

- Completed:
  - replaced direct registration-after-card-entry behavior with backend PaymentIntent enrollment flow
  - added enrollment intent endpoints for member/admin paths:
    - `POST /api/registered-members/intent`
    - `POST /api/registered-members/intent/complete`
  - finalized member creation only when Stripe payment intent is confirmed as `succeeded`
  - added completion-time invoice creation from captured payment metadata
  - updated Step 3 submit UX states (`Confirming card...`, `Finalizing enrollment...`) and completion retry loop to reduce long perceived waits.
- Outcome:
  - enrollment now ties node/member registration to actual Stripe payment confirmation rather than local payment-method creation only
  - fix-first scope is complete; expanded invoice design/presentation is queued next.
- Files updated:
  - `backend/services/member.service.js`
  - `backend/controllers/member.controller.js`
  - `backend/routes/member.routes.js`
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check backend/services/member.service.js` passed.
  - `node --check backend/controllers/member.controller.js` passed.
  - `node --check backend/routes/member.routes.js` passed.
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-12) - Enrollment Processing Copy Is Neutral + Loader Animation

- Completed:
  - changed enrollment modal in-progress payment statuses from error-style red to neutral gray feedback
  - added inline spinner animation for loading feedback states in the modal
  - upgraded `setTreeNextEnrollFeedback(...)` to support variant/loading options while staying compatible with existing boolean callers
  - applied loading feedback to key Step 3 async states:
    - `Preparing secure payment...`
    - `Confirming your payment with Stripe...`
    - `Finalizing enrollment...`
- Outcome:
  - registration/payment progress now reads as in-progress (neutral) rather than failure (red), with visible loading motion.
- Files updated:
  - `binary-tree-next.html`
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-12) - Spill Over Field Removed For Member Flow (Admin Retained)

- Completed:
  - removed member-facing Spill Over selector from enrollment Step 2 (hidden by source mode)
  - member enrollment now resolves spillover mode automatically:
    - root first-level full => spillover
    - otherwise => direct
  - member submit path now always sends `spilloverParentMode = auto` (no manual parent reference)
  - admin source keeps spillover selector and manual spillover parent behavior
  - added backend enforcement so non-admin requests cannot force manual spillover parent mode.
- Outcome:
  - user/root side can no longer assign specific spillover receiving parent from enrollment panel
  - admin side still has full spillover toggle control for operational placement.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `backend/services/member.service.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - `node --check backend/services/member.service.js` passed.

## Recent Update (2026-04-12) - Hotfix: Member Spill Over Field Visibility Lock

- Completed:
  - added hard CSS visibility lock to hide Step-2 spillover field in member source mode
  - added dedicated field-group id for spillover container targeting
  - set `data-tree-next-source` on `html/body` during bootstrap for deterministic source-aware UI rendering.
- Outcome:
  - member side no longer intermittently shows Spill Over field even when JS visibility toggle timing/state drifts.
- Files updated:
  - `binary-tree-next.html`
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-13) - Hotfix: False Slot-Conflict During Enroll on Valid Anticipation Nodes

- Completed:
  - fixed `openTreeNextEnrollModal(...)` placement lock to use selected anticipation parent id instead of forcing member mode parent to `root`
  - preserved member/admin spillover behavior split from previous update.
- Outcome:
  - enrollment no longer shows false `This slot is no longer available` errors for legitimately empty anticipation slots.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
## Recent Update (2026-04-13) - Enrollment BV Re-credit Investigation + Reconciliation Hotfix

- Completed:
  - traced duplicate post-enrollment BV/PV writes to My Store boot-time reconciliation in `index.html`
  - removed buyer-name fallback from invoice ownership matching (explicit identity fields only)
  - excluded enrollment-generated invoice ids from PV reconciliation
  - added one-time/in-flight guards to prevent repeated reconciliation writes per session
  - verified cutoff/backfill history timing: forced server cutoff baseline is dated 2026-04-08 (simulation entry), while April 7 entries are invoice records.
- Outcome:
  - new enrollments no longer receive unintended follow-up BV/PV reconciliation credits seconds after account creation.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check backend/services/member.service.js` passed.
  - `node --check backend/services/store-checkout.service.js` passed.
  - `node --check backend/services/invoice.service.js` passed.

## Recent Update (2026-04-13) - Direct Sponsor Indicator Switched To Purple Gradient Nodes

- Completed:
  - removed purple direct-sponsor mini badge rendering from Binary Tree canvas nodes
  - added dedicated `direct` node avatar palette (purple gradient family)
  - updated draw pipeline so direct-sponsor nodes use the purple gradient treatment
  - preserved inactive-node override to neutral gray
  - kept left-panel icon activity dot behavior unchanged.
- Outcome:
  - direct sponsors are now identified by node fill style (purple gradient) instead of a separate badge, reducing indicator overlap on-node.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-13) - Backend-Wide Active Rule Standardized (50 Personal BV) + Dashboard Synced

- Completed:
  - added shared backend activity helper for canonical active-state resolution:
    - active only when current monthly Personal BV is `>= 50`
  - wired helper into backend mapping/response paths:
    - `user.store` mapped users now derive `accountStatus`/`isActive` from Personal BV
    - `member.store` mapped registered members now derive `accountStatus`/`isActive` from Personal BV
    - auth sanitizer now returns `accountStatus`, `isActive`, and monthly/current Personal BV fields
    - password setup completion now persists status derived from the same rule
    - achievements activity requirement path now uses Personal BV-based active state (not active-until window).
  - updated member dashboard (`index.html`) activity display logic:
    - replaced active-window time gating with Personal BV threshold gating
    - changed account-status tooltip/copy to the `50 Personal BV/month` rule
    - account-status KPI now shows monthly progress as `current / 50 BV`.
- Outcome:
  - backend and user dashboard now use the same active/inactive rule, eliminating mismatch between node rendering and dashboard status behavior.
- Files updated:
  - `backend/utils/member-activity.helpers.js`
  - `backend/stores/user.store.js`
  - `backend/stores/member.store.js`
  - `backend/utils/auth.helpers.js`
  - `backend/services/auth.service.js`
  - `backend/services/member-achievement.service.js`
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check backend/utils/member-activity.helpers.js` passed.
  - `node --check backend/stores/user.store.js` passed.
  - `node --check backend/stores/member.store.js` passed.
  - `node --check backend/utils/auth.helpers.js` passed.
  - `node --check backend/services/auth.service.js` passed.
  - `node --check backend/services/member-achievement.service.js` passed.
  - `node --check binary-tree-next-app.mjs` passed.
  - Inline script parse check for `index.html`: `All inline scripts parsed successfully. Blocks: 2`.

## Recent Update (2026-04-13) - Active/Inactive Node Rule Aligned To 50 Personal BV

- Completed:
  - switched Binary Tree activity gating from status-text-only checks to Personal BV threshold checks
  - enforced `50` Personal BV minimum for active state resolution in Binary Tree rendering
  - added current-period personal BV normalization with cutoff-baseline support (`serverCutoffBaselineStarterPersonalPv`)
  - propagated personal-volume snapshot fields through:
    - live member -> node mapping
    - scoped root node projection
    - new enrollment in-session node insertion path.
- Outcome:
  - active/inactive node visuals now align with the stated rule: members below 50 Personal BV resolve as inactive for node rendering.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-13) - Inactive Direct Nodes Now Use Darker Gray

- Completed:
  - added `directInactive` Binary Tree avatar palette (deeper gray)
  - updated node rendering logic so direct + inactive nodes use `directInactive`
  - retained existing behavior for:
    - active directs (`direct` purple gradient)
    - inactive non-directs (`neutral` gray)
    - left panel activity-dot UI.
- Outcome:
  - inactive direct sponsors are visually distinct from other inactive nodes via a darker gray node treatment.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-13) - Personal BV Anchored Monthly Cutoff Model Implemented

- Completed:
  - replaced rolling activity-window behavior with join-day anchored monthly cutoff logic in shared helper layer
  - updated enrollment/purchase/upgrade backend writes to keep `currentPersonalPvBv` as the current-window BV balance
  - made `member_users.current_personal_pv_bv` a persisted/guarded field across read/write/upsert/update paths
  - updated registered-member linked hydration to read linked current personal BV + timing metadata
  - removed `pending` as hard inactive override for tree/dashboard activity checks
  - added cutoff-expiry zeroing on frontend activity BV resolvers (dashboard + binary tree).
- Outcome:
  - activity now reflects the required rule shape: Personal BV resets by anchored monthly window instead of rolling extension, and password-setup state no longer suppresses BV-based activity by itself.
- Files updated:
  - `backend/utils/member-activity.helpers.js`
  - `backend/services/member.service.js`
  - `backend/stores/user.store.js`
  - `backend/stores/member.store.js`
  - `backend/utils/auth.helpers.js`
  - `backend/services/member-achievement.service.js`
  - `binary-tree-next-app.mjs`
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check backend/utils/member-activity.helpers.js` passed.
  - `node --check backend/stores/user.store.js` passed.
  - `node --check backend/stores/member.store.js` passed.
  - `node --check backend/services/member.service.js` passed.
  - `node --check backend/services/member-achievement.service.js` passed.
  - `node --check backend/utils/auth.helpers.js` passed.
  - `node --check binary-tree-next-app.mjs` passed.
  - Inline script parse check for `index.html`: `All inline scripts parsed successfully. Blocks: 5`.

## Recent Update (2026-04-13) - Account Status Timer UI Restored

- Completed:
  - reverted Account Status card label to `Account Active Until`
  - replaced BV counter display in account status card with timer countdown display
  - preserved Personal Volume card behavior unchanged.
- Outcome:
  - dashboard now shows the expected monthly timer in Account Status while keeping PV/BV information in its own card.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - Inline script parse check for `index.html`: `All inline scripts parsed successfully. Blocks: 5`.

## Recent Update (2026-04-13) - Account Timer Corrected (No Multi-Month Drift)

- Completed:
  - fixed account status timer source to compute next cutoff from join-date monthly anchor
  - retained fallback to stored `activityActiveUntilAt` only when anchor date is missing.
- Outcome:
  - account timer no longer shows inflated multi-month durations from stale legacy activity timestamps.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - Inline script parse check for `index.html`: `All inline scripts parsed successfully. Blocks: 5`.

## Recent Update (2026-04-13) - Session Fields Now Strictly Server-Hydrated On Dashboard Boot

- Completed:
  - added authenticated `GET /api/member-auth/session` endpoint
  - added strict frontend bootstrap hydration using bearer token session
  - app boot now fails closed to login if server hydration fails.
- Outcome:
  - session-critical fields (including account activity timer inputs) are now server-authoritative at startup, not stale cache-driven.
- Files updated:
  - `backend/services/auth.service.js`
  - `backend/controllers/auth.controller.js`
  - `backend/routes/auth.routes.js`
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check backend/services/auth.service.js` passed.
  - `node --check backend/controllers/auth.controller.js` passed.
  - `node --check backend/routes/auth.routes.js` passed.
  - Inline script parse check for `index.html`: `All inline scripts parsed successfully. Blocks: 5`.


## Recent Update (2026-04-13) - Package-Specific Product BV + Retail Commission Applied End-to-End

- Completed:
  - upgraded product model from single BV field to package-earnings model (retail + BV by package)
  - implemented server-side buyer package resolution at checkout intent/session creation
  - enforced server-side buyer BV + retail commission metadata and invoice persistence
  - updated invoice storage with `buyer_package_key` and `retail_commission` columns (auto-ensured)
  - switched member dashboard stripe flow to finalize orders via `/api/store-checkout/intent/complete` (server-authoritative invoice/BV/retail)
  - updated Admin Product Management UI to edit package-specific retail/BV values
  - updated store owner revenue metrics/feed to use retail commission values.
- Outcome:
  - Legacy buyer scenario now resolves correctly under package rules (e.g., Legacy package buyer -> `38 BV`, upline retail -> `$20`) using server-side checkout calculations.
- Files updated:
  - `backend/utils/store-product-earnings.helpers.js`
  - `backend/stores/store-product.store.js`
  - `backend/services/store-product.service.js`
  - `backend/services/store-checkout.service.js`
  - `backend/stores/invoice.store.js`
  - `backend/services/invoice.service.js`
  - `storefront-shared.js`
  - `admin.html`
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check backend/utils/store-product-earnings.helpers.js` passed.
  - `node --check backend/stores/store-product.store.js` passed.
  - `node --check backend/services/store-product.service.js` passed.
  - `node --check backend/services/store-checkout.service.js` passed.
  - `node --check backend/stores/invoice.store.js` passed.
  - `node --check backend/services/invoice.service.js` passed.
  - `node --check storefront-shared.js` passed.

## Recent Update (2026-04-13) - One-Time Invoice Backfill Completed (Zeroone / INV-240934)

- Completed:
  - manually backfilled `charge.store_invoices` row `INV-240934` buyer identity to `zeroone` only.
  - no batch logic and no recurring backfill task added.
- Outcome:
  - invoice now resolves to `zeroone` personal identity in dashboard identity matching paths.
- Scope:
  - single-row DB update only (`affectedRows = 1`).
- Validation:
  - before/after row snapshot confirmed.
  - store-layer read confirms:
    - `buyerUserId = usr_1775181494655_698b390a`
    - `buyerUsername = zeroone`
    - `buyerEmail = sethfozzaguilar@gmail.com`.

## Recent Update (2026-04-13) - Admin Product Loader Resilience (MetaCharge Visibility)

- Completed:
  - confirmed `MetaCharge???` exists and is active in `charge.store_products`.
  - patched store product storage layer to avoid hard failure when admin migration credentials fail.
  - enabled dynamic read/write fallback when optional columns (`image_urls`, `package_earnings`) are absent.
- Outcome:
  - admin product list APIs now return products (including `MetaCharge???`) instead of failing on admin migration auth.
- Files updated:
  - `backend/stores/store-product.store.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check backend/stores/store-product.store.js` passed.
  - `getStoreProducts({ includeArchived: true })` returned `MetaCharge???` successfully.

## Recent Update (2026-04-13) - Dashboard Store Discount Copy Clarified

- Completed:
  - changed discount wording to audience-aware labels.
  - preferred-customer sessions now show `Preferred Customer Discount`.
  - member sessions now show `Member Discount`.
- Outcome:
  - avoids confusion where member accounts (0%) were shown under ???Preferred??? wording.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - inline script parse check for `index.html` passed.

## Recent Update (2026-04-13) - Owner Feed Reroute for Guest Attributed Sales

- Completed:
  - added a new `Guest Attributed Purchases` block on the Preferred Customer page.
  - rerouted attributed guest/unlinked checkout records away from owner-side invoice and recent activity feeds.
  - kept matched preferred-member invoices in the existing preferred planner cards, and prevented duplicate guest-card display when already matched.
- Outcome:
  - owner-side operational invoice widgets focus on linked/member attribution.
  - guest-attributed sales remain visible in Preferred Customer view for follow-up.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - inline script parse check for `index.html` passed (`Parsed inline scripts in index.html: 2`).

## Recent Update (2026-04-13) - Guest Attribution Visibility Follow-Up Fix

- Completed:
  - validated missing-entry report against DB and confirmed newest guest invoice existed with `CHG-*` attribution.
  - patched owner attribution-code resolution to support `M-*` and `CHG-*` code variants.
  - updated public store code resolver to derive `CHG-*` from `M-*` when session `publicStoreCode` is absent.
- Outcome:
  - preferred guest-attributed purchase list can resolve attributed guest invoices even when session store-code payload arrives in internal-code form.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - inline script parse check for `index.html` passed (`Parsed inline scripts in index.html: 2`).

## Recent Update (2026-04-13) - Guest Identity Matching Rule Tightened

- Completed:
  - updated preferred planner invoice identity matching to stop using `buyerEmail` as member-link identity.
  - retained only `buyerUserId` and `buyerUsername` for member-linked invoice matching.
- Outcome:
  - guest checkouts that submit only full name + email remain in `Guest Attributed Purchases` and are not auto-classified as member-linked planner invoices.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - inline script parse check for `index.html` passed (`Parsed inline scripts in index.html: 2`).

## Recent Update (2026-04-13) - Code Alias Normalization Hardening

- Completed:
  - extended owner attribution code alias handling to support compact and dashed formats (`MZERO`/`M-ZERO`, `CHGZERO`/`CHG-ZERO`).
  - updated public code derivation from internal code to support no-dash internal format.
- Outcome:
  - guest-attributed invoice ownership matching is more resilient across legacy stored/session code formats.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - inline script parse check for `index.html` passed (`Parsed inline scripts in index.html: 2`).

## Recent Update (2026-04-13) - Preferred Guest Sales Fallback Added

- Completed:
  - added fallback guest-invoice rendering path in Preferred Customer planner when owner-attribution match path returns empty.
  - fallback includes only guest-identity rows with non-default attribution and excludes preferred-member matched invoices.
- Outcome:
  - prevents silent empty Guest Attributed Purchases section for valid guest checkout invoices under runtime code-variant/session mismatch cases.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - inline script parse check for `index.html` passed (`Parsed inline scripts in index.html: 2`).

## Recent Update (2026-04-14) - Binary Tree Next Account Overview Full Data Wiring

- Completed:
  - wired Account Overview panel field values to live/runtime data from top-to-bottom (rank/title/user/status through commissions).
  - added API snapshot hydration for:
    - binary tree metrics
    - sales team commissions
    - commission containers
    - e-wallet
  - added polling guardrails (interval + retry cadence) and session-change reset/refetch behavior for panel data.
  - added fallback resolvers for active window, BV totals, cycle cap, wallet, and commission values.
- Outcome:
  - Account Overview panel now reflects live app data instead of static placeholders for the requested KPI/commission cards.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-14) - Account Overview Hero Alignment Centered

- Completed:
  - adjusted Account Overview hero row alignment from bottom-anchored to center-aligned.
- Outcome:
  - left rank badge, center avatar/user block, and right title badge now align on center as requested.
- Files updated:
  - `binary-tree-next.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`
- Validation:
  - CSS-only layout update.

## Recent Update (2026-04-14) - Binary Tree Next Title Sync With Actual Profile Titles

- Completed:
  - patched Account Overview title resolution to prioritize profile-aware title fields over stale fallback labels.
  - for member mode, set non-fallback session profile title as top priority so panel/root title follows the user???s actual selected title.
  - added shared title/icon resolver helpers and applied them to panel visuals + tree node icon resolution.
  - updated root/member live node builders so normalized title + icon metadata is preserved across tree refreshes.
- Outcome:
  - BT Next titles now stay aligned with actual selected profile titles instead of drifting to `"{rank} Builder"` fallbacks.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-14) - Legacy Founder Icon Corrected in Binary Tree Next

- Completed:
  - fixed title-icon fallback mapping so `Legacy Founder` resolves to Title-Icons assets, not the generic legacy rank icon.
  - added title-event icon routing for legacy founder/director/ambassador/presidential-circle keys and achievement ids.
- Outcome:
  - Account Overview title badge now displays the proper Legacy Founder icon.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-14) - Legacy Founder Icon Forced to `legacy-founder-star-light`

- Completed:
  - added forced title-icon resolution from title labels before fallback icon-path fields.
  - wired `Legacy Founder` to always resolve to `/brand_assets/Icons/Title-Icons/legacy-founder-star-light.svg`.
- Outcome:
  - Account Overview title icon now consistently shows the requested Legacy Founder icon even when older title-icon fields are stale.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-14) - Right-Side Profile-Left Buttons Added

- Completed:
  - moved `Account Overview` toggle to a new top-right button group positioned left of the profile avatar.
  - added `Rank Advancement` button as placeholder in the same profile-left group.
  - left existing vertical rail navigation controls in place.
  - added explicit placeholder action handler (`panel:rank-advancement:placeholder`) with inert behavior until panel build.
- Outcome:
  - right-side controls now match the requested layout direction, with primary panel actions grouped beside the profile avatar.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-14) - Account Overview No Longer Opens on Boot

- Completed:
  - changed Binary Tree Next boot UI default so `Account Overview` starts hidden.
- Outcome:
  - panel stays closed on startup and only opens when the new profile-left `Account Overview` button is pressed.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-14) - Account Overview Live Data (No Reload Needed)

- Completed:
  - aligned Account Overview remote sync intervals with Binary Tree Next live sync cadence.
  - added dynamic polling interval resolver based on panel visibility + page visibility.
  - connected Account Overview refresh to tree live apply pipeline so panel updates with incoming live node synces.
  - forced immediate remote refresh when opening Account Overview from the button.
- Outcome:
  - Account Overview now updates live in-session without page reload, following the same real-time behavior pattern as Binary Tree Next.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-14) - Binary Tree Next My Store Panel Added

- Completed:
  - added a new `My Store` right-side panel in `binary-tree-next.html` with Account Overview-aligned shell styling.
  - implemented panel lifecycle in `binary-tree-next-app.mjs` (init, position sync, visibility sync, close/copy interactions).
  - wired `brand-menu:page:my-store` to open the new panel.
  - added package-based upgrade rendering rules:
    - Preferred -> Personal / Business / Infinity / Legacy
    - Personal -> Business / Infinity / Legacy
    - Business -> Infinity / Legacy
    - Infinity -> Legacy
    - Legacy -> no upgrade cards
  - enforced panel exclusivity so `My Store` and `Account Overview` do not stay open together.
- Outcome:
  - Binary Tree Next now includes an in-context My Store panel with dynamic upgrade visibility based on member package level.
- Files updated:
  - `binary-tree-next.html`
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/binary-tree-next.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
- QA note:
  - screenshot pass skipped this session per explicit user instruction.

## Recent Update (2026-04-14) - My Store Uses New Transparent `NOBG` Bottle Image

- Completed:
  - switched My Store image source to `brand_assets/Product Images/MetaCharge Blue Bottle - NOBG.png`.
  - applied update in both JS runtime source constant and HTML fallback image `src`.
- Outcome:
  - featured and upgrade-card product visuals now use the new transparent bottle image.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `binary-tree-next.html`
  - `Claude_Notes/binary-tree-next.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-14) - My Store Featured Cards Refined (Clickable + Centered Image)

- Completed:
  - increased product-card shell size in featured and upgrade sections.
  - split typography sizing so `Featured` heading and product title are visibly different.
  - converted featured and upgrade cards to clickable product buttons.
  - added My Store product click routing for featured and package-upgrade cards.
  - centered transparent bottle art inside gray cards with explicit image-shell centering and contain-fit rules.
- Outcome:
  - My Store now has larger, clearer product cards that behave as store actions and keep bottle placement centered in card surfaces.
- Files updated:
  - `binary-tree-next.html`
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/binary-tree-next.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-14) - My Store Gray Product Shell Enlarged With Corner Gap

- Completed:
  - enlarged featured gray product shell and raised corner radius.
  - enlarged upgrade gray product shells and increased minimum shell height.
  - increased inner shell padding.
  - added per-shell image max-size caps to preserve stronger gap from shell corners.
  - adjusted mobile featured-shell width to keep the same spacing intent on smaller viewports.
- Outcome:
  - product art now sits with clearer breathing room inside gray cards, closer to the requested reference spacing.
- Files updated:
  - `binary-tree-next.html`
  - `Claude_Notes/binary-tree-next.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-14) - My Store Checkout Flow Stays Inside Binary Tree

- Completed:
  - replaced external My Store product redirects with an internal multi-step panel flow.
  - added breadcrumb navigation states:
    - `My Store`
    - `My Store < Review Purchase`
    - `My Store < Review Purchase < Checkout`
  - added a new in-panel review-purchase layout with product image/title, quantity, price, BV, remove action, and checkout CTA.
  - added a new in-panel checkout layout with large summary card + billing/payment fields + previous/pay actions.
  - wired step navigation and state rendering in `binary-tree-next-app.mjs`.
  - added checkout field validation + in-panel success/error feedback (no page redirect).
- Outcome:
  - users can begin purchase, review, and proceed to checkout entirely within Binary Tree Next panel UI.
- Files updated:
  - `binary-tree-next.html`
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/binary-tree-next.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-14) - My Store Review Text Scaled Down

- Completed:
  - reduced breadcrumb heading size in My Store review/checkout flow.
  - reduced Review Purchase text sizes for product title, quantity, price, and BV.
  - reduced checkout-button label size inside Review Purchase.
  - tightened mobile clamp ranges to prevent text crowding.
- Outcome:
  - Review Purchase content now fits cleanly without scrambled-looking oversized text.
- Files updated:
  - `binary-tree-next.html`
  - `Claude_Notes/binary-tree-next.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - CSS-only typography update.

## Recent Update (2026-04-14) - My Store Font Scale Synced to Account Overview

- Completed:
  - aligned My Store breadcrumb typography to Account Overview sizing style.
  - aligned Review Purchase text proportions (name/quantity/price/BV/remove/checkout CTA) to Account Overview-like scale.
  - aligned Checkout heading/summary/input/action typography to same baseline.
  - tuned responsive typography overrides to preserve those ratios on tablet/mobile.
- Outcome:
  - My Store review/checkout text now follows the same sizing language as Account Overview and avoids oversized, scrambled presentation.
- Files updated:
  - `binary-tree-next.html`
  - `Claude_Notes/binary-tree-next.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - CSS-only typography update.

## Recent Update (2026-04-14) - My Store Checkout Rewired to Enroll Step-3 Component Classes

- Completed:
  - replaced My Store checkout card/form/button internals with Enroll step-3 checkout classes.
  - preserved My Store runtime IDs so existing JS data/interaction wiring remains intact.
  - enabled class-based reuse of enroll summary-card container styles.
- Outcome:
  - My Store checkout now uses the same checkout component family as Enroll Member step 3, reducing style drift and oversized custom variants.
- Files updated:
  - `binary-tree-next.html`
  - `Claude_Notes/binary-tree-next.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-14) - My Store Checkout Now Includes Stripe + Country Customization

- Completed:
  - replaced My Store plain card inputs with Stripe Elements (number/expiry/CVC) like Enroll step 3.
  - added My Store Stripe lifecycle (init, completeness tracking, reset, card-error handling).
  - replaced My Store country text field with Enroll-style custom country select UI.
  - expanded billing-country hydration/apply logic to update both Enroll and My Store country selects from same catalog.
  - updated My Store submit validation for complete Stripe fields and valid billing country selection.
- Outcome:
  - My Store checkout now contains the same advanced internals expected from Enroll step-3 checkout, not just a visual approximation.
- Files updated:
  - `binary-tree-next.html`
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/binary-tree-next.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-14) - My Store Checkout Scroll Length Reduced

- Completed:
  - added checkout-step-specific compact spacing rules so My Store checkout no longer feels overly tall.
  - reduced vertical spacing in checkout mode for:
    - panel scroll padding
    - header bottom spacing
    - checkout section top padding
    - summary card margin/padding
    - form top margin and field stack gaps
    - checkout action stack spacing
  - compacted Enroll-reused checkout internals within My Store checkout:
    - summary heading/row/total sizing
    - card + billing field min-heights and corner radii
    - billing/card row gaps
    - action button min-heights
  - added extra compact behavior for shorter viewports (`max-height: 1065px` and `max-height: 820px`) to further prevent excessive scrolling.
- Outcome:
  - checkout now uses a tighter vertical rhythm and significantly shorter scroll distance while preserving Enroll step-3 internals/custom UI.
- Files updated:
  - `binary-tree-next.html`
  - `Claude_Notes/binary-tree-next.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - CSS-only layout/spacing update.

## Recent Update (2026-04-14) - My Store Checkout Empty Bottom Space Tightened Further

- Completed:
  - applied a second checkout-only spacing pass focused on removing excessive lower empty space.
  - reduced checkout scroll bottom padding and overall vertical rhythm in default checkout mode.
  - tightened summary, form, billing row, and action-stack spacing.
  - reduced field/button min-heights for checkout mode only.
  - strengthened compact behavior in both `max-height: 1065px` and `max-height: 820px` ranges.
- Outcome:
  - checkout now has noticeably less dead space under the form/actions and a shorter overall scroll path.
- Files updated:
  - `binary-tree-next.html`
  - `Claude_Notes/binary-tree-next.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - CSS-only spacing refinement.

## Recent Update (2026-04-14) - My Store Review Quantity Selector + MLM BV/Upgrade Delta Logic

- Completed:
  - converted Review Purchase `1x` from static text to an interactive quantity selector (`- / +`) for product purchases.
  - added quantity control behaviors:
    - minimum `1`, maximum `99`
    - live subtotal/tax/total/BV recalculation on each quantity change
    - auto-readonly quantity display for package-upgrade selections (no multi-qty upgrades)
  - aligned package-upgrade pricing/BV with MLM upgrade-delta logic:
    - `priceDue` computed from product-count delta between current and target package
    - `bvGain` computed as target-package BV minus current-package BV
    - removed Preferred Customer retail discount from package upgrades (discount stays for product purchase path)
  - aligned My Store tax math with Enroll checkout style (cent-rounded tax + total calculations).
- Outcome:
  - Review Purchase now supports real quantity interaction and checkout totals/BV reflect correct business logic per account package and upgrade path.
- Files updated:
  - `binary-tree-next.html`
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/binary-tree-next.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - duplicate-ID check on `binary-tree-next.html` passed.

## Recent Update (2026-04-14) - Checkout Step Scroll Investigation + Space Collapse Fix

- Investigation findings:
  - checkout was reserving vertical space even when no message existed via:
    - `#tree-next-my-store-card-error` min-height
    - `#tree-next-my-store-checkout-feedback` min-height
  - checkout layout also had cumulative vertical padding/gaps (scroll padding, section top spacing, form/action spacing) causing extra scroll depth.
- Fix applied:
  - added checkout-step-scoped empty-state collapse rules so both card-error and checkout-feedback rows are removed from layout when empty.
  - tightened checkout-only spacing further:
    - reduced checkout scroll bottom padding
    - reduced checkout section top spacing
    - reduced summary/form/action vertical spacing and row gaps
    - reduced checkout action button min-height
  - kept catalog/review/store-list scrolling behavior intact.
- Files updated:
  - `binary-tree-next.html`
  - `Claude_Notes/binary-tree-next.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - CSS-only patch; no runtime logic change.

## Recent Update (2026-04-14) - Checkout Layout Decramped + Dynamic Step Height (Scroll Tail Fix)

- Completed:
  - adjusted checkout-only typography/spacing upward slightly to avoid over-cramped appearance (summary rows, field height, action button height, section/form/action spacing).
  - lowered aggressive compact-mode breakpoint from `max-height: 1065px` to `max-height: 920px` so normal desktop/laptop heights keep readable sizing.
  - implemented dynamic My Store panel height behavior for checkout step in runtime:
    - when step is `checkout`, panel height now targets actual checkout content height (+padding/header buffer) instead of always inheriting full side-nav height.
  - preserved existing behavior for `catalog` and `review` steps (full-height side panel remains intact).
- Outcome:
  - checkout no longer appears overly cramped, and the large empty area/tail under checkout content is removed on normal screens.
  - unnecessary checkout scroll caused by oversized panel height context is significantly reduced.
- Files updated:
  - `binary-tree-next.html`
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/binary-tree-next.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-14) - Real Checkout Space Fix (Auto-Height Panel in Checkout Step)

- Completed:
  - implemented structural checkout-step sizing fix in CSS:
    - `#tree-next-my-store-panel[data-my-store-step="checkout"] { height: auto; max-height: ... }`
  - desktop max-height: `calc(100vh - 36px)`
  - tablet/mobile max-height: `calc(100vh - 96px)`
- Why this is the real fix:
  - checkout no longer forcibly inherits full side-panel height, which was creating large blank space under the form.
  - panel now shrink-wraps checkout content and only scrolls when content exceeds viewport cap.
- Files updated:
  - `binary-tree-next.html`
  - `Claude_Notes/binary-tree-next.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - CSS-only layout fix.

## Recent Update (2026-04-14) - Checkout Decramped + Scroll Disabled (Checkout Step)

- Completed:
  - increased checkout readability/spacing so fields and text are no longer overly compressed.
  - reverted overly aggressive tightness in checkout-only base sizing:
    - larger summary text/total
    - larger field and action button heights
    - increased vertical gaps around form/actions
  - disabled checkout-step scrolling explicitly:
    - `#tree-next-my-store-panel[data-my-store-step="checkout"] .tree-next-my-store-scroll { overflow-y: hidden; }`
  - pushed compact-height breakpoints down so aggressive compact rules only apply on very short viewports:
    - `max-height: 760px`
    - `max-height: 680px`
- Outcome:
  - checkout now has breathing room again and does not scroll in normal viewport heights.
- Files updated:
  - `binary-tree-next.html`
  - `Claude_Notes/binary-tree-next.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - CSS-only checkout layout refinement.

## Recent Update (2026-04-14) - Store Checkout Now Matches Enroll Step 3 Layout + Real Height Fix

- Completed:
  - fixed a misplaced runtime patch: checkout auto-height logic had been applied inside syncAccountOverviewPanelPosition(...) and is now correctly applied in syncMyStorePanelPosition(...).
  - My Store checkout panel height now shrink-wraps checkout content (header + content + padding buffer) during checkout step, eliminating the large empty white tail.
  - kept checkout-step scrolling disabled while ensuring content gets proper breathing room.
  - aligned Store checkout spacing/layout with Enroll step-3 checkout rhythm:
    - summary card spacing/typography
    - field stack and billing/card row gaps
    - input/select/card-shell sizing
    - action stack/button spacing and sizing
  - updated My Store checkout markup to mirror Enroll step-3 billing structure by wrapping billing controls in .tree-next-enroll-billing-fields and adding matching screen-reader labels.
- Outcome:
  - Checkout is no longer overly cramped and no longer leaves a large blank area under the form.
  - Store checkout now follows the same clean/tight layout behavior expected from Enroll step 3.
- Files updated:
  - binary-tree-next.html
  - binary-tree-next-app.mjs
  - Claude_Notes/binary-tree-next.md
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Validation:
  - node --check binary-tree-next-app.mjs passed.



## Recent Update (2026-04-14) - My Store Checkout Height Increased + Spacing Expanded

- Completed:
  - increased checkout panel runtime height allowance in syncMyStorePanelPosition(...) by raising the checkout padding buffer and using a taller minimum target for checkout mode.
  - expanded checkout internal spacing so content feels less cramped:
    - larger scroll padding
    - larger header-to-content spacing
    - larger summary card margin/padding
    - larger field stack gaps and billing/card row gaps
    - slightly taller inputs and action buttons
    - increased action stack spacing
  - applied matching relaxed spacing adjustments in compact-height checkout media rules so the denser layouts still keep breathing room.
- Outcome:
  - My Store checkout panel is visibly taller, and form/summary/action elements are spread more evenly.
  - checkout remains non-scroll in checkout mode while avoiding the cramped look.
- Files updated:
  - binary-tree-next.html
  - binary-tree-next-app.mjs
  - Claude_Notes/binary-tree-next.md
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Validation:
  - node --check binary-tree-next-app.mjs passed.

## Recent Update (2026-04-14) - My Store Checkout Made Taller + Extra Bottom Button Gap

- Completed:
  - increased checkout panel target height again in `syncMyStorePanelPosition(...)`:
    - checkout extra height buffer increased to `+96`
    - checkout minimum target height increased to `460`
  - increased checkout vertical spacing in My Store checkout mode:
    - larger scroll top/bottom padding
    - larger header-to-body spacing
    - larger section bottom padding to create visible space below action buttons
    - slightly larger action stack spacing and button height
  - propagated bottom-spacing/taller feel into compact-height checkout media rules so the button area still has breathing room on shorter screens.
- Outcome:
  - checkout panel renders taller overall.
  - there is now intentional space below the checkout buttons before the container ends.
- Files updated:
  - binary-tree-next.html
  - binary-tree-next-app.mjs
  - Claude_Notes/binary-tree-next.md
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Validation:
  - node --check binary-tree-next-app.mjs passed.

## Recent Update (2026-04-14) - My Store Checkout/Review Spacing + Breadcrumb Direction + Button Glow Cleanup

- Completed:
  - checkout typography spacing refinements:
    - increased top spacing above `Complete Checkout`
    - increased gap between checkout caption text and subtotal summary card
  - removed glow-style shadows from My Store action buttons:
    - review checkout button
    - checkout action buttons (`Previous` / `Pay Now`) within My Store panel
    - `Copy Store Link` button
  - fixed breadcrumb separator direction from `<` to `>` in review and checkout breadcrumb states.
  - lowered `Share and Earn` on review page with step-specific spacing so it sits lower/closer to mid-panel.
  - review typography alignment tweaks requested:
    - product name weight aligned to match price presentation
    - quantity selector value weight aligned with BV field emphasis
    - small-screen review name size aligned with price size
- Outcome:
  - checkout spacing reads cleaner at the top and between caption/summary.
  - button glow is removed across My Store actions.
  - breadcrumbs now flow left-to-right (`>`).
  - review panel balance is improved with lower Share and Earn placement.
  - product/price and quantity/BV visual hierarchy now match more closely.
- Files updated:
  - binary-tree-next.html
  - binary-tree-next-app.mjs
  - Claude_Notes/binary-tree-next.md
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Validation:
  - node --check binary-tree-next-app.mjs passed.

## Recent Update (2026-04-14) - Review Row Pairing Fix (Name?Price, Qty Selector?BV)

- Completed:
  - reworked My Store review details layout from inline-flex wrapping to a 2-row grid so left-side content pairs correctly with right-side pricing rows:
    - row 1: Product Name aligns with Price
    - row 2: Quantity Selector aligns with BV
  - reduced quantity selector control height and internal button size so its visual height better matches the BV row.
  - kept responsive behavior centered on tablet/mobile while preserving the same row pairing intent.
- Outcome:
  - product name and price now match row hierarchy more closely.
  - quantity selector no longer looks oversized versus the BV line.
- Files updated:
  - binary-tree-next.html
  - Claude_Notes/binary-tree-next.md
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Validation:
  - CSS-only review-layout refinement.

## Recent Update (2026-04-14) - Review Row Height Alignment Tightened Again

- Completed:
  - adjusted review details block upward to align row heights with right-side pricing block on desktop.
  - tightened quantity selector vertical size and button size further so selector height visually matches BV row height.
  - increased row-gap consistency between left/right review stacks.
  - maintained centered mobile/tablet behavior by resetting desktop offset in compact layout.
- Outcome:
  - product name row is now aligned closer to price row.
  - quantity selector row now aligns closer to BV row with less height mismatch.
- Files updated:
  - binary-tree-next.html
  - Claude_Notes/binary-tree-next.md
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Validation:
  - CSS-only review-layout adjustment.

## Recent Update (2026-04-14) - My Store Review Name/Price Vertical Anchor Fix

- Completed:
  - removed the desktop offset on .tree-next-my-store-review-details (margin-top: -34px -> margin-top: 0).
  - changed review layout alignment from centered to top-anchored:
    - .tree-next-my-store-review-card { align-items: start; }
    - .tree-next-my-store-review-main { align-items: start; }
    - .tree-next-my-store-review-details { align-content: start; }
- Outcome:
  - product name and price now share the same vertical anchor in My Store > Review Purchase.
  - quantity selector and BV rows keep their current pairing while removing the previous row-offset mismatch.
- Files updated:
  - binary-tree-next.html
  - Claude_Notes/binary-tree-next.md
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Design decision:
  - replaced pixel-offset balancing with structural top anchoring so alignment remains stable as copy/values change.
- Known limitations:
  - CSS-only layout adjustment; no runtime logic, data flow, or checkout calculations were changed.
- Validation:
  - CSS-only review alignment fix.

## Recent Update (2026-04-14) - My Store Review Panel Bottom Space Reduced (Dynamic Review Height)

- Completed:
  - added review-step runtime panel sizing in syncMyStorePanelPosition(...) for MY_STORE_STEP_REVIEW.
  - introduced review/share view references for height measurement:
    - myStoreReviewViewElement
    - myStoreShareViewElement
  - for review step, panel height now derives from actual visible content instead of full side-nav height:
    - header height
    - scroll padding
    - review section content height
    - share section height when visible
    - small fixed buffer
  - retained viewport clamping so larger future carts can still scroll instead of overflowing.
- Outcome:
  - the Review Purchase container no longer leaves an oversized empty bottom area for short carts.
  - behavior still scales for longer/multi-item cart content by respecting viewport max height.
- Files updated:
  - binary-tree-next-app.mjs
  - Claude_Notes/binary-tree-next.md
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Design decision:
  - used content-driven runtime sizing for review step (instead of hardcoded static height) to keep layout balanced across variable cart content sizes.
- Known limitations:
  - sizing is recalculated on render frames; minor 1-frame settling may occur immediately after rapid content changes.
- Validation:
  - node --check binary-tree-next-app.mjs passed.

## Recent Update (2026-04-14) - My Store Catalog Uses Compact Height When No Upgrades Exist

- Completed:
  - extended syncMyStorePanelPosition(...) to apply content-driven panel sizing in MY_STORE_STEP_CATALOG when no account packages are upgradeable.
  - added catalog-view DOM reference for measurement:
    - myStoreCatalogViewElement
  - for catalog step with zero upgrade keys, panel height now uses measured visible content (matching the compact pattern used for Review):
    - header height
    - scroll padding
    - catalog content height
    - share block height (when visible)
    - fixed buffer
  - kept viewport clamping so larger content can still scroll safely.
- Outcome:
  - My Store no longer shows an oversized bottom tail on catalog view when the member has no upgradeable account packages.
  - catalog height behavior now matches the tighter review-style sizing in that no-upgrade state.
- Files updated:
  - binary-tree-next-app.mjs
  - Claude_Notes/binary-tree-next.md
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Design decision:
  - conditioned compact catalog sizing on upgrade availability (upgradeKeys.length === 0) so accounts with upgrade cards keep the full panel canvas.
- Known limitations:
  - compact catalog sizing is not applied when upgrade cards exist, by design.
- Validation:
  - node --check binary-tree-next-app.mjs passed.

## Recent Update (2026-04-14) - My Store Checkout Field Spacing Polish Pass

- Completed:
  - rebalanced My Store checkout spacing tokens in inary-tree-next.html for cleaner, more polished form rhythm.
  - increased desktop checkout breathing room:
    - larger checkout scroll padding and section spacing
    - larger summary card margin/padding and row rhythm
    - increased form stack/row gaps
    - increased input/card/select control heights and internal horizontal padding
    - increased billing label/help text sizing for readability
    - increased action-row spacing and button height
  - relaxed compact-height rules (both max-height: 760px and max-height: 680px) so they remain compact but no longer feel cramped.
- Outcome:
  - checkout fields now have clear separation and more comfortable visual spacing.
  - overall checkout panel reads cleaner and more intentional while preserving existing structure and flow.
- Files updated:
  - binary-tree-next.html
  - Claude_Notes/binary-tree-next.md
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Design decision:
  - used a consistent spacing scale across desktop and compact-height states instead of ad-hoc tight values.
- Known limitations:
  - checkout step still uses existing no-scroll behavior by design (overflow-y: hidden) and relies on runtime panel sizing.
- Validation:
  - node --check binary-tree-next-app.mjs passed.

## Recent Update (2026-04-14) - Upgrade Product Choice + MLM-Aligned BV Logic in My Store

- Completed:
  - implemented upgrade-product selection flow in My Store Review for account upgrades:
    - after choosing an upgrade package, review now shows Select your product options (MetaCharge?, MetaRoast?)
    - selection is interactive and persisted in state.ui.myStoreSelection
  - aligned upgrade BV logic to MLM product-count rule:
    - BV now derives from upgrade product count x per-product upgrade BV (50 BV each)
    - example path now resolves correctly: 17 products => 850 BV
  - aligned upgrade price logic to product-count rule:
    - upgrade subtotal remains product-count delta x unit price ($64)
  - corrected package meta mismatch impacting upgrade delta math:
    - personal-builder-pack BV corrected from 192 to 150 in ENROLL_PACKAGE_META
  - updated review/checkpoint display behavior for upgrades:
    - breadcrumb label switches to Review Upgrade when selection is an upgrade
    - review row shows selected product + computed upgrade quantity (e.g., MetaCharge? 17x)
    - checkout summary line includes upgrade product selection context
- Outcome:
  - upgrade users now explicitly choose which product to receive for their package-delta products.
  - BV and amount calculations now match MLM account-upgrade rules based on product deltas.
  - Personal -> Legacy upgrade now computes expected 17 products and 850 BV.
- Files updated:
  - binary-tree-next-app.mjs
  - binary-tree-next.html
  - Claude_Notes/binary-tree-next.md
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Design decisions:
  - upgrade calculations were anchored to product-count deltas (selectableProducts) and fixed per-upgrade product BV (50) to enforce "BV follows products".
  - product choice is currently single-selection per upgrade transaction (all delta products assigned to one chosen product type).
- Known limitations:
  - MetaRoast? currently reuses the available MetaCharge product image asset until a dedicated MetaRoast asset is added in rand_assets/Product Images/.
  - split-product allocation (e.g., mix of MetaCharge + MetaRoast counts in one upgrade) is not yet implemented.
- Validation:
  - node --check binary-tree-next-app.mjs passed.

## Recent Update (2026-04-14) - Review Upgrade Selector Moved Below Product Row

- Completed:
  - moved the Select your product upgrade selector block in My Store > Review Upgrade to render below the product row content (after the quantity/product line), instead of above it.
- Outcome:
  - review layout now follows requested order with selector positioned below product information.
- Files updated:
  - binary-tree-next.html
  - Claude_Notes/binary-tree-next.md
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
- Validation:
  - node --check binary-tree-next-app.mjs passed.

## Recent Update (2026-04-14) - My Store Stripe Checkout Completion + Thank-You Step

- Completed:
  - replaced the My Store placeholder submit message with a real Stripe payment flow in `binary-tree-next-app.mjs`.
  - My Store now performs full intent flow:
    - `POST /api/store-checkout/intent`
    - `confirmCardPayment(...)`
    - `POST /api/store-checkout/intent/complete` with retry polling.
  - added My Store success state and UI:
    - new `thank-you` panel step (`MY_STORE_STEP_THANK_YOU`)
    - success card now shows invoice, status, amount paid, BV, and date
    - `Done` button returns user to catalog flow.
  - improved checkout submit UX:
    - added submit/confirm/finalizing button states
    - disabled previous/pay actions while checkout is in-flight
    - upgraded feedback messaging for Stripe/init/finalization failures.
  - aligned My Store checkout totals with backend storefront-intent pricing by setting My Store tax to `0` in local checkout amount calculation so displayed total matches Stripe/invoice settlement.
- Outcome:
  - checkout in Binary Tree My Store is now actually processed through Stripe instead of stopping at a static "processing" message.
  - successful payments land on a clean confirmation page similar to Enroll Member completion flow.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `binary-tree-next.html`
  - `Claude_Notes/binary-tree-next.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Design decisions:
  - reused existing store-checkout backend intent endpoints to keep invoice attribution/BV settlement logic centralized.
  - kept My Store in-panel (non-redirect) payment UX using Stripe Elements already mounted in Binary Tree.
- Known limitations:
  - checkout requires a valid member session email; if missing/invalid, submission is blocked with guidance.
  - no automated browser e2e was run in this pass; syntax validation was completed.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-14) - My Store Upgrade Checkout Now Applies Package and Rank + UI Sync

- Completed:
  - Added upgrade metadata propagation from Binary Tree My Store checkout to Stripe intent payload (`accountUpgradeTargetPackage`) for upgrade selections.
  - Updated checkout completion parsing in `binary-tree-next-app.mjs` to consume backend `accountUpgrade` results.
  - Added member session persistence/refresh helpers in Binary Tree:
    - safe storage/cookie writers
    - member session refresh via `/api/member-auth/session`
    - local node/session patching for immediate package/rank reflection.
  - Added post-upgrade refresh routine in Binary Tree:
    - forces tree live sync
    - refreshes account overview remote snapshot
    - re-syncs Account Overview + My Store UI panels.
  - Updated backend `store-checkout.service.js` finalization pipeline:
    - detects account-upgrade checkouts via metadata
    - skips generic buyer BV credit on upgrade checkouts (prevents duplicate PV credit path)
    - applies `upgradeMemberAccount(...)` during checkout finalization
    - returns `accountUpgrade` object in completion responses (including already-processed invoice paths).
  - Updated hosted checkout session metadata to also carry upgrade fields for parity.
- Outcome:
  - Successful paid account-upgrade checkouts now apply package/rank server-side and feed a deterministic upgrade result back to Binary Tree.
  - Left panel/account overview rank now updates immediately after paid upgrade completion (no manual relog/reload required in normal flow).
- Current focus impact:
  - resolves the active blocker where upgraded members (example: `demosf`) did not see rank/package reflected in Binary Tree side panels after checkout completion.
- Known limitations:
  - Previously processed historical upgrade payments (before this fix) may still need manual reconciliation if package/rank was not applied at the time.
  - No browser e2e/Stripe live flow replay was executed in this pass; syntax and data-path checks were performed.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - `node --check backend/services/store-checkout.service.js` passed.

## Recent Update (2026-04-14) - Hosted Stripe Checkout Migration (Binary Tree + Storefront)

- Completed:
  - Migrated Binary Tree enrollment checkout from Stripe PaymentIntent + in-page card confirmation to hosted Stripe Checkout Session flow.
  - Migrated Binary Tree My Store checkout from PaymentIntent + `confirmCardPayment(...)` to hosted Stripe Checkout Session redirect flow.
  - Added Stripe return handling in Binary Tree:
    - detects `checkout=success|cancel`, `session_id`, and `bt_checkout_flow` query params
    - finalizes the correct flow (`/registered-members/session/complete` for enroll, `/store-checkout/complete` for My Store)
    - opens the appropriate UI state (enroll modal or My Store panel), shows result messaging, and clears return query params.
  - Added backend enrollment hosted-session endpoints:
    - `POST /api/registered-members/session`
    - `POST /api/registered-members/session/complete`
    - admin variants under `/api/admin/...`
    - retains existing intent endpoints for compatibility.
  - Added enrollment Stripe session services in backend:
    - `createRegisteredMemberCheckoutSession(...)`
    - `completeRegisteredMemberCheckoutSession(...)` (delegates finalization to existing PaymentIntent completion path after resolving session payment intent).
  - Migrated public `store-checkout.html` page to hosted session flow:
    - now uses `StorefrontShared.submitCheckout(...)`
    - finalizes return via `StorefrontShared.completeCheckoutSession(...)` with retry polling
    - removed in-page card confirmation dependency for submit path.
  - Migrated member dashboard store checkout in `index.html` to hosted session redirect:
    - added session create/complete helpers
    - added return finalization handler on load
    - checkout button no longer blocks on Stripe card element readiness.

- Files updated:
  - backend/controllers/member.controller.js
  - backend/routes/member.routes.js
  - backend/services/member.service.js
  - binary-tree-next-app.mjs
  - store-checkout.html
  - index.html
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
  - Claude_Notes/binary-tree-next.md

- Design decisions:
  - Kept final order/enrollment reconciliation in backend completion endpoints so business rules remain centralized and consistent.
  - Used flow query tagging (`bt_checkout_flow`) in Binary Tree return URLs to disambiguate My Store vs Enroll completion after Stripe redirect.
  - Preserved existing intent endpoints during migration for backward compatibility and lower risk rollout.

- Known limitations:
  - Legacy Stripe card-element initialization code remains in some places (mostly unused after migration) and can be removed in a cleanup pass.
  - No full browser E2E replay against live Stripe was executed in this pass; syntax and flow wiring were validated locally.

- Validation:
  - node --check backend/services/member.service.js passed.
  - node --check backend/controllers/member.controller.js passed.
  - node --check backend/routes/member.routes.js passed.
  - node --check binary-tree-next-app.mjs passed.
  - inline script syntax checks for index.html and store-checkout.html passed via extracted-script `node --check`.

## Recent Update (2026-04-14) - Binary Tree Popup Checkout (No Page Reload) + Step-3 Bypass

- Completed:
  - Updated Binary Tree Enroll Member flow so step 2 (package selection) now launches Stripe hosted checkout in a new popup window instead of advancing to step 3 card/billing entry.
  - Updated Binary Tree My Store flow so review checkout opens Stripe hosted checkout in a popup window (no full-page redirect/reload).
  - Added popup-aware completion polling in Binary Tree for both flows:
    - continuously calls completion endpoints using `sessionId`
    - closes popup automatically on successful payment
    - shows in-panel thank-you states after successful finalization.
  - Kept Binary Tree session/tree context in-place (no browser navigation reload in parent window).
  - Fixed Stripe `{CHECKOUT_SESSION_ID}` placeholder handling in backend return URL builders by ensuring the placeholder is emitted unescaped (`%7B...%7D` -> `{...}`), resolving `No such checkout.session: {CHECKOUT_SESSION_ID}` issues.

- Files updated:
  - `binary-tree-next-app.mjs`
  - `backend/services/member.service.js`
  - `backend/services/store-checkout.service.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`

- Design decisions:
  - Popup window + server-side session polling was chosen to avoid parent-page reload while preserving secure Stripe-hosted collection.
  - Enrollment step-3 UI was bypassed behaviorally (not required to proceed) to avoid duplicate billing/card entry before Stripe.

- Known limitations:
  - If popup blockers are enabled, checkout will not open until popups are allowed.
  - Legacy step-3 markup still exists in HTML, but checkout no longer depends on it in normal path.

- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - `node --check backend/services/member.service.js` passed.
  - `node --check backend/services/store-checkout.service.js` passed.

## Recent Update (2026-04-14) - Stripe Popup Return Page + Original Tab Thank-You Sync

- Completed:
  - Added dedicated Stripe popup return page: `stripe-checkout-return.html`.
  - Updated Binary Tree Stripe return-path builder to send Stripe back to the new return page instead of `binary-tree-next.html`.
  - Added return payload target path query support so the popup page can provide a direct "Back to Binary Tree" action.
  - Added cross-tab return signaling from popup return page to Binary Tree app using:
    - `localStorage` signal key: `binary-tree-next-stripe-return-signal-v1`
    - `postMessage` signal type: `binary-tree-next-stripe-return`
  - Added Binary Tree listeners to consume Stripe success/cancel signals and immediately apply the correct UI state in the original tab:
    - My Store: finalizes checkout + shows Thank You panel
    - Enroll: finalizes enrollment + shows Thank You modal
  - Added in-flight finalization guards for both My Store and Enroll session finalization to avoid duplicate finalize races.

- Files updated:
  - `binary-tree-next-app.mjs`
  - `stripe-checkout-return.html`

- Design decisions:
  - Kept Stripe redirect destination lightweight and purpose-built (status + return guidance) to avoid spawning a second full Binary Tree runtime in the popup.
  - Used both storage and postMessage signaling for resilient cross-tab sync.
  - Preserved existing query-based return handling in Binary Tree for backward compatibility.

- Known limitations:
  - Popup blockers still prevent checkout popup launch.
  - If browser storage is disabled, popup signal propagation may fall back to postMessage only.

- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Follow-up Update (2026-04-14) - Immediate Thank-You on Old Tab After Stripe Success

- Completed:
  - Removed long blocking finalization wait from My Store submit path after popup launch.
  - On Stripe success signal, old tab now immediately switches to a Thank You state (`Processing`) before backend completion finishes.
  - Kept backend finalization running in background with extended retries (up to ~63s) so invoice details can hydrate once available.
  - Added pending My Store checkout state persistence for the launched hosted-session id.
  - Added auto-close attempt on popup return page after broadcasting success/cancel back to opener.

- Files updated:
  - `binary-tree-next-app.mjs`
  - `stripe-checkout-return.html`

- Known limitations:
  - If Stripe/session finalization is delayed, Thank You appears immediately but detailed invoice values may populate a bit later.

- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - inline script syntax check for `stripe-checkout-return.html` passed via extracted script and `node --check`.

## Follow-up Update (2026-04-14) - Failed-to-Fetch Recovery for Stripe Return Finalization

- Completed:
  - Added transient network failure detection for My Store Stripe completion (`Failed to fetch`, network/load failures).
  - Added auto-retry scheduler for My Store checkout finalization (up to 12 retries, 1.8s interval) instead of hard-failing immediately.
  - Preserved immediate Thank You state while retries run in background.
  - Added retry tracking cleanup when completion succeeds.
  - Added stripe-return-signal re-check on window focus and visibility restoration to handle missed storage events.

- Files updated:
  - `binary-tree-next-app.mjs`

- Known limitations:
  - If backend is unreachable for an extended period, invoice details may remain in processing state until connectivity is restored.

- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Follow-up Update (2026-04-14) - Instant Paid Amount/BV on Thank-You (No Waiting UX)

- Completed:
  - Persisted My Store checkout snapshot at session creation (`amountPaid`, `bv`, `productLabel`, `quantity`, `dateLabel`).
  - On Stripe success signal, Thank You now renders instantly with paid amount + BV from the snapshot.
  - Thank You pending state now defaults to "Paid" and "Generating..." receipt id instead of generic processing placeholders.
  - Kept backend finalization running in background so authoritative invoice metadata can replace placeholders when ready.

- Files updated:
  - `binary-tree-next-app.mjs`

- Known limitations:
  - Invoice id/date/status details may still hydrate a few seconds later depending on backend/Stripe consistency timing.

- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Follow-up Update (2026-04-14) - Immediate Thank-You Status Set to Pending

- Completed:
  - Updated instant My Store thank-you shell status from `Paid` to `Pending`.
  - Applied the same `Pending` label in Stripe-success signal handling before backend invoice hydration completes.

- Files updated:
  - `binary-tree-next-app.mjs`

- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Follow-up Update (2026-04-14) - Thank-You Breadcrumb Simplification

- Completed:
  - Removed `> Checkout >` from My Store Thank-You breadcrumb trail.
  - Thank-You path now reads: `My Store > Review Purchase > Thank You` (or `Review Upgrade` variant).

- Files updated:
  - `binary-tree-next-app.mjs`

- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Follow-up Update (2026-04-15) - Enrollment Parent-Jump Hotfix (Auto-Spillover Pending Placement + Parent Reference Stability)

- Completed:
  - Added `parentUsername` to the anticipation-node enrollment request payload so lock metadata keeps a stable identity key.
  - Updated enrollment modal parent-reference resolution to prefer username over display/member-code text.
  - Extended live tree lookup hydration with compatibility keys (`memberCode`, `fullName`, `name`) using preserve-existing semantics for weaker identity keys.
  - Added `shouldSkipTreeNextPendingPlacementApply(...)` and skip handling so auto-spillover enrollments without a manual parent reference are no longer optimistically forced onto the selected lock parent.
  - Added Done-button fallback forced sync when pending placement apply is skipped.
  - Updated success copy for auto-spillover enrollments to avoid asserting a fixed receiving parent before live sync resolves final placement.

- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`

- Design decisions:
  - Preserved the existing member-side policy split (member flow auto-spillover; admin keeps manual parent controls).
  - Removed speculative local placement only for auto-spillover/no-manual-parent cases to prevent perceived re-parenting after sync.
  - Added backward-compatible lookup expansion so historic/manual references that used member labels can still resolve when possible.

- Known limitations:
  - Auto-spillover enrollments still resolve final receiving parent via live tree reconstruction rules and may differ from the initially selected anticipation parent by design.
  - Name-based fallback lookups can be ambiguous if duplicate member names exist; username/id references remain the authoritative path.

- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Follow-up Update (2026-04-15) - Server-Enforced Binary Enrollment Placement + Authenticated Member Writes

- Completed:
  - Enforced member write routes with `requireMemberAuthSession` for:
    - `POST /api/registered-members`
    - `POST /api/registered-members/session`
    - `POST /api/registered-members/session/complete`
    - `POST /api/registered-members/intent`
    - `POST /api/registered-members/intent/complete`
    - `PATCH /api/registered-members/:memberId/placement`
  - Wired controller layer to pass `authenticatedMember` into enrollment/session/payment/placement service calls.
  - Fully wired server-side placement policy resolution via `resolveServerEnforcedEnrollmentPlacement(...)` in:
    - `createRegisteredMember(...)`
    - `createRegisteredMemberPaymentIntent(...)`
    - `createRegisteredMemberCheckoutSession(...)`
  - Updated completion flows to preserve authenticated identity:
    - `completeRegisteredMemberPaymentIntent(...)` now forwards `authenticatedMember` into final registration and uses created-member sponsor for invoice attribution fallback.
    - `completeRegisteredMemberCheckoutSession(...)` now forwards `authenticatedMember` into payment-intent completion.
  - Updated non-admin placement-update guardrails in `updateRegisteredMemberPlacement(...)`:
    - Requires authenticated member identity.
    - Blocks sponsor reassignment attempts by member users.
    - Blocks updates outside the authenticated sponsor line.
  - Added bearer token headers to member-side write calls in frontend:
    - `binary-tree-next-app.mjs` enrollment register/session/session-complete calls.
    - `index.html` registered-member create and placement-plan patch calls.

- Files updated:
  - `backend/routes/member.routes.js`
  - `backend/controllers/member.controller.js`
  - `backend/services/member.service.js`
  - `binary-tree-next-app.mjs`
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`

- Design decisions:
  - Member enrollment placement is now server-authoritative and derived from authenticated actor identity.
  - For member context, direct sponsor stays the authenticated member; spillover only activates after first-level left and right are occupied.
  - Admin endpoints keep existing flexibility for manual sponsor/placement control.

- Known limitations:
  - Existing legacy records with missing/ambiguous sponsor identities may still require manual admin cleanup.
  - Client-side prechecks still run for UX, but final placement truth now comes from server policy.

- Validation:
  - `node --check backend/services/member.service.js` passed.
  - `node --check backend/controllers/member.controller.js` passed.
  - `node --check backend/routes/member.routes.js` passed.
  - `node --check binary-tree-next-app.mjs` passed.

## Follow-up Update (2026-04-15) - Spillover Anchor Lock For Member Enrollment (Anticipation Parent Preservation)

- Completed:
  - Updated member-side Binary Tree enrollment submit payload to always send spillover anchor parent from anticipation lock when spillover is active.
  - Updated server spillover policy to preserve requested spillover parent reference for member enrollments when spillover is enabled.
  - Kept sponsor inheritance rule unchanged: member enrollments still resolve sponsor to authenticated member.

- Why:
  - Without a spillover parent reference, live tree rebuild used sponsor-root spillover queue and could reassign receiving parent (for example to older nodes like Perf Test entries) after pressing Done.
  - With anchor lock, receiving parent stays aligned with anticipation-node context while sponsor remains direct.

- Files updated:
  - `binary-tree-next-app.mjs`
  - `backend/services/member.service.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`

- Validation:
  - `node --check backend/services/member.service.js` passed.
  - `node --check binary-tree-next-app.mjs` passed.

## Follow-up Update (2026-04-15) - Always Forward Anticipation Parent As Spillover Anchor

- Completed:
  - Hardened Tree Next enrollment submit payload so `spilloverParentReference` is always sent from anticipation lock (`parentReference` / `parentId`).
  - Set `spilloverParentMode` from anchor presence (`manual` when anchor exists, otherwise `auto`) regardless of UI spillover toggle state.

- Why:
  - Prevents server/client timing mismatches from dropping the selected anticipation parent when server enforces spillover after first-level occupancy checks.
  - Keeps member sponsor behavior unchanged (`direct sponsor = authenticated enroller`) while preserving selected receiving parent context.

- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`

- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Follow-up Update (2026-04-15) - Enrollment Timing Guard (Place-On-Done + Idempotent Done)

- Completed:
  - Adjusted hosted-checkout finalize flow to avoid forced live-tree sync when `state.enroll.pendingPlacement` exists.
  - Added idempotent pending-placement resolution on `Done`: if the member node is already present in tree (via live sync), treat it as success instead of throwing slot-filled errors.

- Why:
  - The previous forced sync could pre-place the new node before user confirmation, so pressing `Done` attempted a second placement and failed with `Left slot is already filled for this parent`.
  - New guard preserves the UX contract: placement confirmation remains tied to `Done`, and race conditions no longer produce duplicate-placement errors.

- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`

- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Follow-up Update (2026-04-15) - Account Overview Fast Track Live Sync (Server-Side Credit on Enrollment)

- Completed:
  - Added server-side Fast Track crediting for sponsor during successful member enrollment.
  - Enrollment transaction now increments sponsor `member_commission_containers.fasttrack_balance` using the same DB client transaction scope.
  - Added non-blocking Account Overview forced refresh after enrollment finalize in Binary Tree Next so commission cards reflect newest backend values faster.

- Why:
  - Account Overview Fast Track card reads from commission containers, but enrollments previously did not write Fast Track earnings into that source.
  - Result: enrolling nodes increased member records but Fast Track commission card stayed stale.

- Files updated:
  - `backend/services/member.service.js`
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`

- Design decisions:
  - Kept source of truth server-side by writing sponsor Fast Track credits at enrollment time.
  - Wrapped commission-container credit in safe error handling so enrollment does not fail if commission container storage is temporarily unavailable.
  - Triggered account-overview refresh as best-effort (non-blocking) to avoid impacting enrollment completion UX.

- Validation:
  - `node --check backend/services/member.service.js` passed.
  - `node --check binary-tree-next-app.mjs` passed.

## Follow-up Update (2026-04-15) - Admin Binary Tree Root Fix + Administrator Labeling

- Completed:
  - Forced admin tree viewer root resolution to global admin root (`LIVE_TREE_GLOBAL_ROOT_ID`) so admin mode cannot scope into a member node by session identity collision.
  - Forced admin global home node resolution to scoped `root` in admin mode.
  - Updated admin/global root node labels in live tree mapping to `Administrator` (name, username, title, role, rank badge).
  - Updated scoped root node generation for admin mode to always render admin identity as `Administrator`.
  - Updated session display name helper to return `Administrator` for admin source, preventing legacy `Charge Admin` naming from leaking into tree UI labels.

- Why:
  - Admin tree could appear broken when viewer identity resolved to a regular member node instead of admin root.
  - Label mismatch required the admin root identity to display as `Administrator` consistently.

- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`

- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Follow-up Update (2026-04-15) - Admin Binary Tree Mode Routing + Root Ownership

- Completed:
  - Updated admin dashboard navigation link to open Binary Tree with explicit admin source context: `/binary-tree-next.html?source=admin`.
  - Hardened Binary Tree Next admin source handling so admin mode always resolves to admin root and cannot bind viewer root to member identity fields.
  - Standardized admin root identity naming in tree UI to `Administrator`.

- Why:
  - Admin link previously omitted `source=admin`, which could boot member-mode logic and produce wrong root scoping and node identity.
  - Explicit routing + forced admin root resolution ensures admin node is always shown as top/root.

- Files updated:
  - `admin.html`
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`

- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Follow-up Update (2026-04-15) - Administrator Account Overview Modes (Selected Member vs System Totals)

- Completed:
  - Admin Account Overview now switches modes correctly:
    - Selected member node => show selected member account overview.
    - No selection or admin/root selection => show system totals overview.
  - Administrator is treated as activity-exempt in Account Overview mode.
  - System-mode labels now reflect company-wide monitoring intent (revenue/members/commission generated).
  - Remote account-overview sync now supports scoped fetch behavior (`identity` and `system`) with selected-node identity precedence for admin member inspection.

- Impact:
  - Fixes mismatch where admin panel stayed bound to admin identity instead of selected member.
  - Aligns panel behavior with business rule: admin does not earn commissions and serves as a system monitor.

- Files touched:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`

- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

- Remaining follow-up option:
  - Add dedicated backend consolidated system-financial summary endpoint for exact all-source commission/wallet rollups.

## Recent Update (2026-04-14) - Preferred Customer Store Aligned to Binary Tree Next My Store Flow

- Completed:
  - rebuilt `store.html` into a full-page Binary Tree Next My Store-style flow (`catalog -> review -> checkout -> thank-you`)
  - added Preferred-account-only checkout gating and removed guest checkout path from the storefront page UI
  - preserved hosted Stripe checkout session start + return finalization
  - converted `store-checkout.html` into a compatibility redirect to `store.html`.
- Outcome:
  - Preferred Customer store now uses one consistent full-page flow that matches Binary Tree Next interaction model while enforcing preferred-only purchase access.
- Files updated:
  - `store.html`
  - `store-checkout.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/public-store-page.md`
- Validation:
  - inline script parse checks passed for `store.html` and `store-checkout.html`.
- Note:
  - screenshot comparison intentionally skipped per user direction.

## Recent Update (2026-04-15) - Preferred Accounts Shopify-Link Backend Plan Added

- Completed:
  - created a dedicated implementation plan note: `Claude_Notes/Preferred Accounts - Shopify Link.md`
  - documented agreed preferred-account routing logic:
    - attribution-link -> member-tied preferred account
    - no-attribution -> admin parking flow
  - documented backend-first delivery phases for claims, registration lock, checkout enforcement, settlement snapshots, and admin reassignment controls.
- Outcome:
  - project now has a concrete shared blueprint for replacing public storefront traffic with Shopify CTA entry while preserving internal attribution integrity.
- Files updated:
  - `Claude_Notes/Preferred Accounts - Shopify Link.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - documentation-only update (no runtime code modified).

## Recent Update (2026-04-15) - Preferred Attribution Phase 1 Backend Completed

- Completed:
  - added Phase 1 attribution persistence foundation (`preferred_attribution_claims` + `preferred_account_attribution_locks`) via new store module
  - wired startup schema warmup for preferred attribution tables
  - extended store invoice schema support with immutable attribution and settlement snapshot JSON fields
  - updated invoice creation paths to include attribution/settlement snapshot payloads.
- Outcome:
  - backend now has the required data model foundation for Shopify-to-registration attribution lock flow.
- Files updated:
  - `backend/stores/preferred-attribution.store.js`
  - `backend/stores/invoice.store.js`
  - `backend/services/invoice.service.js`
  - `backend/services/store-checkout.service.js`
  - `backend/app.js`
  - `Claude_Notes/Preferred Accounts - Shopify Link.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check` passed for all modified backend JS files.

## Recent Update (2026-04-15) - Preferred Attribution Phase 2 Endpoints Implemented

- Completed:
  - added Phase 2 preferred attribution route stack (`service/controller/routes`) and mounted in `backend/app.js`
  - implemented `GET /go/preferred-register` for signed token validation -> claim creation -> cookie set -> register redirect
  - implemented `GET /api/preferred/claim` for sanitized claim summary retrieval from signed cookie
  - implemented `GET /api/member-auth/preferred/attribution-link` for authenticated member signed share-link generation.
- Link generation/domain notes:
  - added env-driven host support for signed links via `PREFERRED_ATTRIBUTION_LINK_ORIGIN`
  - production target domain should be set to `https://ldpremiere.com`.
- Outcome:
  - backend now supports secure attribution ingest from external/public entrypoints (Shopify-compatible redirect model)
  - member share links can now be generated as signed redirect links instead of plain store-code URLs.
- Files updated:
  - `backend/services/preferred-attribution.service.js`
  - `backend/controllers/preferred-attribution.controller.js`
  - `backend/routes/preferred-attribution.routes.js`
  - `backend/app.js`
  - `Claude_Notes/Preferred Accounts - Shopify Link.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check backend/services/preferred-attribution.service.js` passed
  - `node --check backend/controllers/preferred-attribution.controller.js` passed
  - `node --check backend/routes/preferred-attribution.routes.js` passed
  - `node --check backend/app.js` passed

## Recent Update (2026-04-15) - Env Setup for Shopify -> App Attribution Links

- Completed:
  - set `PUBLIC_APP_ORIGIN` to `https://ldpremiere.com`
  - added `PREFERRED_ATTRIBUTION_LINK_ORIGIN=https://ldpremiere.com`
  - added `PREFERRED_ATTRIBUTION_SIGNING_SECRET` (generated secret) in `.env`.
- Outcome:
  - generated preferred attribution links now target the production domain host configuration.
- Note:
  - backend process restart required to apply new environment values.

## Recent Update (2026-04-15) - One-CTA Backend Fallback Enabled

- Completed:
  - enabled unattributed fallback on `GET /go/preferred-register` when `at` is missing.
- Outcome:
  - Shopify can use one static CTA URL (`/go/preferred-register`) for both attributed and direct flows.
- Validation:
  - `node --check backend/services/preferred-attribution.service.js` passed.

## Recent Update (2026-04-15) - Testing Host Config Applied

- Completed:
  - switched attribution/app origin env values to `https://test.ldpremiere.com` for current testing.
- Outcome:
  - generated preferred links and redirects now align with testing domain host.
- Note:
  - restart backend process to load updated env values.

## Recent Update (2026-04-15) - Permanent/Re-Usable Member Attribution Links Enabled

- Completed:
  - made preferred attribution member links reusable (removed one-time token rejection behavior).
  - switched member link generation to long-lived default TTL and set env to 10 years (`315360000`).
- Outcome:
  - shared member links can be used repeatedly by many visitors without link rotation.
- Files updated:
  - `backend/services/preferred-attribution.service.js`
  - `.env`
  - notes files.
- Validation:
  - `node --check` passed for preferred attribution service/controller/routes and app.

## Recent Update (2026-04-15) - Store Link Refresh Completed (Random Codes, Legacy Prefix Removed)

- Completed:
  - switched backend store-code generation to random alphanumeric output (no `CHG-*` or `M-*` format)
  - updated store-link backfill script to support full rotation mode and dry-run mode
  - executed full refresh on current dataset via:
    - `node backend/scripts/backfill-user-store-links.mjs --refresh-all`.
- Outcome:
  - all member link codes now use random letters/numbers only
  - legacy-prefixed store/public/attribution codes were rotated and replaced
  - preferred attribution links generated moving forward no longer expose old naming.
- Files updated:
  - `backend/services/member.service.js`
  - `backend/scripts/backfill-user-store-links.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/Preferred Accounts - Shopify Link.md`
- Validation:
  - `node --check backend/services/member.service.js` passed
  - `node --check backend/scripts/backfill-user-store-links.mjs` passed
  - dry-run refresh command passed
  - post-refresh verification showed `0` legacy-prefixed codes across store/public/attribution fields.

## Recent Update (2026-04-15) - Preferred Registration Page Refreshed

- Completed:
  - rebuilt `store-register.html` into a full-page Preferred registration layout that visually matches the updated store frontend style
  - wired registration page attribution status to `GET /api/preferred/claim` (claim-aware display)
  - removed old legacy naming from page copy/flow and used a neutral draft key (`ldp-preferred-registration-draft-v1`)
  - kept next-step routing to checkout entry path with preferred mode query params.
- Outcome:
  - registration page now clearly communicates attribution state (member-linked vs direct/admin parking)
  - page now provides a cleaner handoff into purchase flow while preserving registration draft data
  - aligns registration UX with current Preferred storefront design direction.
- Files updated:
  - `store-register.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/preferred-customer-page.md`
- Validation:
  - inline script parse check passed for `store-register.html`
  - legacy naming scan in `store-register.html` for `Charge` / `CHG-` returned no matches.

## Recent Update (2026-04-15) - Registration Page Replaced with Reference-Matched Minimal Flow

- Completed:
  - replaced `store-register.html` layout to match provided reference images exactly:
    - black top nav with logo + `Store`, `About Us`, `Support`, `Login`
    - centered registration view (`You made it!`) with four rounded gray inputs and blue `Join Now` button
    - centered thank-you confirmation view (`Thank you for Joining!`) shown after successful submit.
- Outcome:
  - previous complex registration design was fully removed
  - page now follows the requested minimalist visual style and two-step screen behavior.
- Files updated:
  - `store-register.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/preferred-customer-page.md`
- Validation:
  - inline script parse check passed for `store-register.html`.

## Recent Update (2026-04-15) - Registration Visual Polish (Apple-Style Spec Pass)

- Completed:
  - revised `store-register.html` styling to match updated direction:
    - page background `#FFFFFF`
    - typography set to Inter medium (`500`)
    - input background `#E2E2E2`
    - placeholder color `#444444`
    - CTA color `#077AFF`
  - improved spacing rhythm and typographic scale for cleaner Apple-style layout.
- Outcome:
  - registration view now feels lighter and less dense
  - thank-you state remains in-page after successful submit
  - existing draft persistence behavior remains intact.
- Files updated:
  - `store-register.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/preferred-customer-page.md`
- Validation:
  - inline script parse check passed for `store-register.html`
  - selector scan confirmed target visual tokens are present.

## Recent Update (2026-04-15) - Registration Input Typography Tuning

- Completed:
  - reduced registration input text sizes across breakpoints for better readability balance.
- Outcome:
  - form fields now feel less oversized while keeping the same layout and spacing structure.
- Files updated:
  - `store-register.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/preferred-customer-page.md`
- Validation:
  - inline script parse check passed for `store-register.html`.

## Recent Update (2026-04-15) - Input Text Weight Adjusted to Regular

- Completed:
  - changed registration input and placeholder text weights from medium to regular.
- Outcome:
  - typed values and placeholder copy now appear lighter and cleaner in-field.
- Files updated:
  - `store-register.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/preferred-customer-page.md`
- Validation:
  - inline script parse check passed for `store-register.html`.

## Recent Update (2026-04-15) - Store Page Restyled to Match Registration Look & Feel

- Completed:
  - rebuilt `store.html` visual system to match the refined registration style:
    - white canvas (`#FFFFFF`)
    - Inter typography
    - soft border surfaces
    - shared input tokens (`#E2E2E2` fields / `#444444` placeholders)
    - primary action color `#077AFF`
  - retained functional store flow:
    - product loading from storefront API
    - add/remove/quantity cart behavior
    - preferred-only checkout gating
    - Stripe checkout session handoff
    - checkout return finalization (`?checkout=success&session_id=`).
- Outcome:
  - store and registration pages now feel part of one design language
  - checkout behavior remains operational while using the new visual direction.
- Files updated:
  - `store.html`
  - `Claude_Notes/public-store-page.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - inline script parse check passed for `store.html`
  - CSS token scan confirmed required color/typography tokens.

## Recent Update (2026-04-15) - Preferred Store Gate Tightening + Dashboard Refresh

- Completed:
  - converted `store.html` to products + cart flow only with one CTA to Stripe (`Continue to Stripe`)
  - removed embedded checkout form from store page
  - enforced hard preferred-account gating for add/edit cart and Stripe handoff
  - rebuilt `store-dashboard.html` in the same visual system as updated store/register pages while retaining existing account logic.
- Outcome:
  - anonymous visitors can browse but cannot purchase
  - preferred users get cleaner cart-to-Stripe flow
  - dashboard now visually aligns with storefront experience.
- Files updated:
  - `store.html`
  - `store-dashboard.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/public-store-page.md`
  - `Claude_Notes/preferred-dashboard-page.md`
- Validation:
  - inline script parse check passed for `store.html`
  - inline script parse check passed for `store-dashboard.html`.

## Recent Update (2026-04-15) - BV Hidden from Preferred Store + Dashboard + Checkout Surfaces

- Completed:
  - removed BV labels from preferred `store.html` product cards, cart summary, and checkout success metadata
  - removed BV metric and per-order BV row from `store-dashboard.html` purchase activity
  - verified `store-checkout.html` and `stripe-checkout-return.html` do not display BV labels.
- Outcome:
  - preferred account shopping UI and checkout-facing surfaces no longer expose BV values.
- Files updated:
  - `store.html`
  - `store-dashboard.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/public-store-page.md`
  - `Claude_Notes/preferred-dashboard-page.md`
- Validation:
  - inline script parse checks passed for store/dashboard/checkout return pages.

## Recent Update (2026-04-15) - Registration Password Setup Link (No Email Sender Fallback)

- Completed:
  - added a direct `Set Password Now` CTA on registration thank-you screen
  - wired fallback setup URL and tokenized setup-link fetch attempt by email.
- Outcome:
  - users can continue password setup immediately even while email sender is not implemented.
- Files updated:
  - `store-register.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/preferred-customer-page.md`
- Validation:
  - inline script parse check passed for `store-register.html`.

## Recent Update (2026-04-15) - Password Setup Missing-Token Recovery Added

- Completed:
  - patched preferred setup page to auto-recover tokenized setup links by email when token is missing.
  - preserved `store` attribution query during setup-link redirect.
- Outcome:
  - direct setup links are now more resilient while email sender is not yet implemented.
- Files updated:
  - `store-password-setup.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/preferred-customer-page.md`
- Validation:
  - inline script parse check passed for `store-password-setup.html`.

## Recent Update (2026-04-15) - Preferred Registration Now Creates Account Immediately

- Completed:
  - added backend registration endpoint for preferred storefront flow (`/api/store-checkout/preferred-register`)
  - updated `store-register.html` to register account server-side on submit and show immediate setup password link.
- Outcome:
  - removed waiting/retry dependency for setup token on registration thank-you flow
  - registration now follows normal account-setup pattern (account created first, setup link returned instantly).
- Files updated:
  - `backend/services/store-checkout.service.js`
  - `backend/controllers/store-checkout.controller.js`
  - `backend/routes/store-checkout.routes.js`
  - `store-register.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/preferred-customer-page.md`
- Validation:
  - backend `node --check` passed for updated files
  - inline script parse check passed for `store-register.html`.

## Recent Update (2026-04-15) - Preferred Store Is Now Login-First with Account-Scoped Purchase

- Completed:
  - `store.html` now shows a preferred login/join gate for guest visitors.
  - store/cart purchase UI now renders only for authenticated preferred users.
  - logged-in header pattern standardized to `Dashboard | Store | Support` with `Logout` on the right.
  - dashboard and support pages aligned to the same auth header behavior.
- Outcome:
  - public storefront no longer acts like open shopping; purchase is account-gated.
  - navigation is consistent across preferred authenticated pages.
- Files updated:
  - `store.html`
  - `store-dashboard.html`
  - `store-support.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/public-store-page.md`
- Validation:
  - inline script parse check passed for updated HTML files.

## Recent Update (2026-04-15) - Preferred Label Cleanup + One-Account Browser Session Enforcement

- Completed:
  - removed preferred-facing username/email/store-link chips and logged-in store attribution pills.
  - replaced logout handling with shared session clear utility that removes auth state across storage + domain cookie scopes.
  - login now honors `?logout=1` and clears prior auth state before new sign-in persistence.
  - added storage-event sync so tabs refresh when auth changes.
- Outcome:
  - preferred pages are cleaner with less account/debug metadata.
  - logout and account switching are now more reliable (single active account state per browser origin).
- Files updated:
  - `store.html`
  - `store-dashboard.html`
  - `store-support.html`
  - `storefront-shared.js`
  - `login.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/public-store-page.md`
- Validation:
  - `node --check storefront-shared.js` passed.
  - inline non-module script parse check passed for updated pages.

## Recent Update (2026-04-15) - MetaCharge NOBG Product Image Enforcement

- Completed:
  - implemented backend product-image override for MetaCharge so storefront uses the NOBG bottle asset.
  - mapped on both product read and write normalization paths.
- Outcome:
  - older uploaded JPG bottle images no longer win for MetaCharge rendering.
  - preferred/public store product cards now consistently show transparent NOBG artwork.
- Files updated:
  - `backend/stores/store-product.store.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/public-store-page.md`
- Validation:
  - `node --check backend/stores/store-product.store.js` passed.

## Recent Update (2026-04-15) - Store Image Hotfix (MetaCharge NOBG)

- Added cache-busted shared script reference on `store.html` (`/storefront-shared.js?v=20260415a`).
- Added page-level MetaCharge image override in `store.html` renderer to force brand NOBG asset.
- This ensures storefront product cards do not continue showing legacy uploaded JPG bottle images when client cache/API payload is stale.

## Recent Update (2026-04-15) - Preferred Dashboard Package Selector Redesign

- Replaced Upgrade Account dropdown with a dedicated package-list card UI.
- Removed "Target Package" field from dashboard.
- Added explanatory package details/benefits so Preferred users understand value before upgrading.
- Kept backend upgrade API contract (`targetPackage`) unchanged; only selector UX/JS changed.

## Recent Update (2026-04-15) - Upgrade Packages Carousel + Images

- Converted Preferred Dashboard Upgrade Account area to a carousel selector.
- Added package visuals from `brand_assets/Icons/Achievements` for each package tier.
- Added prev/next controls and dot indicators.
- Selected carousel slide now drives `targetPackage` used by account upgrade API.

## Recent Update (2026-04-15) - Upgrade Carousel Visual/Interaction Overhaul

- Rebuilt upgrade package selector into a polished transform-based carousel.
- Added product-image-driven cards with package icon overlays and per-tier accent colors.
- Added touch swipe + clickable dot navigation + improved arrow controls.
- Kept backend upgrade behavior stable (`targetPackage` unchanged).

## Recent Update (2026-04-15) - Upgrade Pricing Cards (No Carousel)

- Replaced upgrade carousel UI with reference-style pricing card grid.
- Added exact builder package pricing/logic + benefit details supplied by product owner.
- Kept account-upgrade backend behavior unchanged (`targetPackage` selection + submit).
- Removed all carousel navigation/touch/dot logic from dashboard script.

## Recent Update (2026-04-15) - Upgrade Cards Visual Cleanup

- Removed price-logic text rows from upgrade cards per request.
- Cleaned spacing/typography to reduce crowding and overlap in card content.
- Fixed malformed benefit bullets by switching to stable dot markers.

## Recent Update (2026-04-15) - Upgrade Card Labels Simplified

- Removed one-time label from package prices.
- Added BV line directly below each price.
- Removed 20% Discount badges from package cards.

## Recent Update (2026-04-15) - Upgrade Card Selected-State Polish

- Fixed selected card footer artifact at the bottom edge.
- Improved selected footer bar styling and spacing.
- Added dynamic CTA label swap (`Selected Plan` vs `Select Plan`) per selected card.

## Recent Update (2026-04-15) - Upgrade Card Header Simplification

- Removed starter badge chip.
- Reordered values so BV is displayed above package price on all cards.

## Recent Update (2026-04-15) - BV/Price Visual Hierarchy Swap

- Upgrade card header now emphasizes BV as the dominant value.
- Price is now secondary and smaller below BV.

## Recent Update (2026-04-15) - Selectable Product Count Added

- Added package-level `Selectable Products` line under price on all upgrade cards.
- Kept BV primary, price secondary, product-count tertiary hierarchy.

## Recent Update (2026-04-15) - Business Builder Fast Track Value

- Changed Business Builder package Fast Track Bonus display to `Earn up to $75`.

## Recent Update (2026-04-15) - Contextual Benefit Icons Hardcoded

- Benefit list items now carry explicit contextual icon keys (`cap`, `money`, `lock`, `unlock`).
- This prevents fallback generic markers and keeps icon meaning consistent by benefit type.

## Recent Update (2026-04-15) - Locked Benefit Rows Gray Styling

- Styled locked benefit descriptions in Preferred dashboard upgrade cards with a light gray tone.
- Updated lock icon stroke color to the same gray so locked rows read as disabled at a glance.
- File updated:
  - `store-dashboard.html`
## Recent Update (2026-04-15) - Fast Track Bonus Final Adjustment

- Business Builder Pack Fast Track set to `Earn up to $100`.
- Infinity Builder Pack Fast Track updated to `Earn up to $125`.
- File updated: `store-dashboard.html`
## Recent Update (2026-04-15) - Infinity Unlock Icon Revision

- Updated `Infinity Tier Commission Unlocked` to use a cleaner dedicated infinity icon.
- Preserved separate icon semantics between locked, generic unlocked, and infinity-unlocked rows.
- File updated: `store-dashboard.html`
## Recent Update (2026-04-15) - Legacy Unlock Dedicated Icon

- Added dedicated `legacy-unlock` icon rendering for `Legacy Leadership Bonus Unlocked` rows.
- Added logic mapping for legacy unlocked text to avoid generic unlock icon fallback.
- File updated: `store-dashboard.html`
## Recent Update (2026-04-15) - Removed Selected Package Label

- Removed `Selected package: ...` text from Preferred dashboard upgrade actions.
- Kept only `Upgrade Account` CTA and aligned it to the right.
- Removed now-unused JS label binding/update logic.
- File updated: `store-dashboard.html`
## Recent Update (2026-04-15) - Upgrade Section Hidden Behind Invitation Modal

- Replaced visible upgrade pricing section with a business-invitation teaser card.
- Added `Explore Builder Packages` modal flow so Preferred users only see business packages on intent.
- Kept package selection + upgrade API submission behavior intact (`targetPackage` unchanged).
- Added modal UX controls (open/close, backdrop close, Esc close, body scroll lock, focus restore).
- Added post-upgrade modal auto-close before redirect to `/index.html`.
- File updated: `store-dashboard.html`
## Recent Update (2026-04-15) - Upgrade Flow Gated by Stripe Checkout

- Removed direct non-payment account-upgrade path from Preferred dashboard.
- Upgrade modal now includes product selection (`MetaCharge/MetaRoast`) and checkout summary.
- `Continue to Stripe` now creates hosted checkout session with `accountUpgradeTargetPackage` metadata.
- Added Stripe return finalization handling on dashboard (`checkout` + `session_id`).
- Successful paid upgrade now redirects user to member dashboard (`/index.html`).
- File updated: `store-dashboard.html`
## Recent Update (2026-04-15) - Removed Upgrade Summary Lines

- Removed `Product / Quantity / Total` summary UI from upgrade modal.
- Kept package selection, product selection, and Stripe checkout CTA behavior unchanged.
- File updated: `store-dashboard.html`

## Recent Update (2026-04-15) - Upgrade Selector Spacing + Product Copy

- Added more vertical spacing after builder package cards in the upgrade modal.
- Added heading + caption above product options in the selector area.
- Kept product selector and `Upgrade Account` CTA centered for a cleaner checkout action flow.
- Updated file: `store-dashboard.html`

## Recent Update (2026-04-15) - Stripe Return UX Performance (Preferred Upgrade)

- Preferred upgrade checkout now shows immediate thank-you success state after Stripe return.
- Removed user-facing wait-before-success behavior from return handler.
- Checkout completion + account-upgrade finalization now continue in background with retries.
- Added pending checkout snapshot persistence to support instant contextual messaging.
- Updated file: `store-dashboard.html`

## Recent Update (2026-04-15) - Preferred Upgrade Thank-You Modal

- Added a dedicated post-payment thank-you modal for Preferred upgrade return from Stripe.
- Modal now owns upgrade status messaging instead of inline dashboard feedback text.
- Added gated `Go To Member Dashboard` button enabled only after upgrade finalization confirms.
- Made backend finalization checks more aggressive/faster on return and on retries.
- Updated file: `store-dashboard.html`

## Recent Update (2026-04-15) - Preferred Upgrade Backend Fast Path (Scoped)

- Added Preferred-only checkout client marker: `preferred-dashboard-upgrade`.
- Backend now routes only that marker to `upsert` persistence mode during checkout finalization.
- `recordMemberPurchase` / `upgradeMemberAccount` gained scoped upsert mode to avoid full-table rewrite for this flow.
- Binary Tree Next checkout path remains on existing rewrite mode (untouched behavior path).
- Updated files:
  - `store-dashboard.html`
  - `backend/services/store-checkout.service.js`
  - `backend/services/member.service.js`

## Recent Update (2026-04-15) - Upgrade In-Progress Loading + Exit Warning

- Added an in-modal loading spinner during Preferred account upgrade finalization after Stripe return.
- Added explicit warning text telling users not to close or exit browser while finalization is in progress.
- Added `beforeunload` guard only while upgrade finalization is active.
- File updated: `store-dashboard.html`

## Recent Update (2026-04-15) - No-Attribution URL Cleanup

- Implemented frontend guard so `REGISTRATIONLOCKED` / `REGISTRATION-LOCKED` are treated as no-attribution codes.
- Store URL builders now omit `?store=` when this default no-attribution token appears.
- No-attribution flow continues to work with plain links (no `?store=` query).
- Updated files:
  - `storefront-shared.js`
  - `login.html`
  - `store-register.html`
  - `store-password-setup.html`
  - `store-login.html`










## Recent Update (2026-04-16) - Login Page Added Preferred Account Registration Link

- Completed:
  - added a new CTA below the login panel in `login.html`:
    - `Don't have an account? Register as a Preferred Account`
    - target route: `/store-register.html`
  - added runtime link sync to pass normalized `?store=` attribution from login to registration when available.
- Outcome:
  - users who do not yet have an account now have a clear preferred-registration path directly on the login screen
  - existing store attribution continuity is maintained into registration flow.
- Files updated:
  - `login.html`
  - `Claude_Notes/member-login-page.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - parsed plain inline scripts in `login.html` (`2` blocks).

## Recent Update (2026-04-16) - Preferred Upgrade Fast Track Rule Applied

- Completed:
  - scoped Fast Track sponsor credit to Preferred -> paid upgrades only
  - kept paid-to-paid upgrades at no sponsor Fast Track (BV/PV only to upgrading account)
  - added sponsor-credit metadata in upgrade response payload for visibility.
- Outcome:
  - store-link and fallback-sponsored Preferred upgrades now can credit Fast Track to the current sponsor,
    while existing paid member upgrades stay commission-neutral for sponsor Fast Track.
- Files updated:
  - backend/services/member.service.js
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
  - Claude_Notes/preferred-dashboard-page.md
- Validation:
  - node --check backend/services/member.service.js passed.


## Recent Update (2026-04-16) - Store Header Simplification

- Completed:
  - removed `About Us` from the guest navigation in `store.html`.
- Outcome:
  - guest header now follows the simplified store flow navigation only.
- Files updated:
  - store.html
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
  - Claude_Notes/public-store-page.md

## Recent Update (2026-04-16) - Store Header Cleanup Applied to Register + Support

- Completed:
  - removed `About Us` from `store-register.html` guest header.
  - removed `About Us` from `store-support.html` guest header.
- Outcome:
  - guest store pages now consistently use `Store`, `Support`, and `Login` only.
- Files updated:
  - store-register.html
  - store-support.html
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
  - Claude_Notes/preferred-customer-page.md
  - Claude_Notes/public-store-page.md

## Recent Update (2026-04-16) - Dashboard Startup Hiccup/Reload Cleanup

- Completed:
  - added early auth preflight in `index.html` head so no-session visits redirect before dashboard paint
  - removed synchronous auth hydration request from dashboard boot path
  - switched to async background session sync via `fetch`
  - kept login redirect only for explicit unauthorized status (`401`/`403`)
  - added one-shot redirect guard to avoid duplicate redirect triggers during startup.
- Outcome:
  - reduced first-load dashboard flash and startup hitching
  - eliminated intermittent fast bounce behavior caused by transient sync-check failures at boot.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - parsed plain inline scripts in `index.html` (`3` blocks).


## Recent Update (2026-04-16) - Login Redirect Animation Hiccup Removed

- Completed:
  - stabilized `login.html` intro trigger flow for store-to-login navigation
  - removed delayed kickoff that allowed pre-intro panel flash
  - added one-shot intro scheduler to prevent duplicate first-load execution
  - gated `pageshow` reruns to BFCache restore events only.
- Outcome:
  - login panel no longer flashes then restarts intro animation on normal redirect
  - transition now plays once and appears smoother.
- Files updated:
  - `login.html`
  - `Claude_Notes/member-login-page.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - parsed plain inline scripts in `login.html` (`2` blocks).


## Recent Update (2026-04-16) - Login Background Animation Restored

- Completed:
  - fixed module/classic script startup race affecting login ColorBends intro
  - added pending intro flag handoff so shader intro still starts when module registers slightly after page intro trigger.
- Outcome:
  - login background animation now initializes reliably again without reintroducing the panel intro hiccup.
- Files updated:
  - `login.html`
  - `Claude_Notes/member-login-page.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - parsed plain inline scripts in `login.html` (`2` blocks).


## Recent Update (2026-04-16) - Preferred Customer Side Page Cleanup (No Guest Checkout)

- Completed:
  - removed `Guest Attributed Purchases` panel from the Preferred Customer dashboard view.
  - removed related guest-attribution render logic and element hooks in `index.html`.
  - updated stale helper copy to align with linked preferred-customer purchase flow only.
- Outcome:
  - Preferred Customer page now matches the current no-guest-checkout direction.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/preferred-customer-page.md`



## Recent Update (2026-04-16) - Binary Tree Next Personal BV Added Under Total Organizational BV (Live)

- Completed:
  - added Personal BV row below Total Organizational BV in the Binary Tree Next side metrics list
  - switched side-metric Personal BV source to activity-aware current personal BV resolution
  - updated live-node signature hashing to include personal BV fields so server-side Personal BV changes apply immediately during live sync
  - corrected Account Overview total-BV default label copy to Total Organization BV.
- Outcome:
  - Personal BV now appears in the requested position and updates in step with live server sync behavior.
- Files updated:
  - binary-tree-next-app.mjs
  - binary-tree-next.html
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
  - Claude_Notes/binary-tree-next.md
- Validation:
  - node --check binary-tree-next-app.mjs passed.


## Recent Update (2026-04-16) - Binary Tree Node Color Rules Hardened (Inactive Gray Reserved)

- Completed:
  - enforced inactive account nodes to gray-only palette
  - enforced inactive direct-sponsor nodes to darker gray palette
  - preserved direct-sponsor active purple theming
  - treated stabilizing status as inactive for node color policy
  - filtered gray source profile palettes/colors from active avatar palette resolution
  - removed gray from auto-generated active profile color rotation
  - aligned selected-node details avatar with the same inactive/direct color rules.
- Outcome:
  - inactive accounts no longer inherit normal colorful profile palettes in Binary Tree node rendering.
  - gray theme now behaves as reserved visual state for inactive nodes.
- Files updated:
  - binary-tree-next-app.mjs
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
  - Claude_Notes/binary-tree-next.md
- Validation:
  - node --check binary-tree-next-app.mjs passed.

## [2026-04-16 01:49:19] Active Workstream Update - Binary Tree Next Preferred Accounts

### Scope
- Implemented Preferred Accounts planner panel in Binary Tree Next, replacing placeholder dock behavior with real panel functionality.

### Progress
- UI shell: complete.
- Data binding from DB-backed endpoints: complete.
- Placement save action: complete.
- Real-time refresh behavior: complete.
- Notes synchronization: complete.

### Current priorities
- Validate with live account data for sponsor-specific preferred customer populations.
- Confirm origin labeling against any future backend explicit-origin fields.
### Documentation Correction
- Previous note had escaped-character artifacts; this update confirms the Preferred Accounts workstream summary is valid and complete.

## Recent Update (2026-04-16) - Preferred Customers UI Polish Pass

- Completed:
  - aligned Preferred Customers typography with Account Overview sizing/feel
  - reduced selected header text scale and subtitle prominence
  - improved field spacing for cleaner breathing room
  - converted Current list avatars to gradient + initials
  - removed Current list meta/subtext so list is name-only
  - removed selected-profile icon artifact above initials
  - centered Save Profile Plan button and kept centered action layout
  - adjusted Current row hover/active treatment to mirror left search dropdown interaction style.
- Outcome:
  - Preferred Customers panel now feels visually consistent with Account Overview and less cramped.
- Files updated:
  - binary-tree-next.html
  - binary-tree-next-app.mjs
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
  - Claude_Notes/binary-tree-next.md
- Validation:
  - node --check binary-tree-next-app.mjs passed.


## Recent Update (2026-04-16) - Preferred Panel Resize Crash Guard

- Completed:
  - wrapped Preferred panel render-sync path in a guarded `try/catch` block
  - added throttled error logging to avoid log spam while preserving diagnostics.
- Outcome:
  - resize-related Preferred panel sync exceptions no longer halt the Binary Tree canvas render loop.
- Files updated:
  - binary-tree-next-app.mjs
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
  - Claude_Notes/binary-tree-next.md
- Validation:
  - node --check binary-tree-next-app.mjs passed.

## Recent Update (2026-04-16) - Preferred Panel Open/Close Drag Freeze Resolved

- Completed:
  - fixed undefined `options` reference in account-overview visual sync path triggered only while Preferred panel is visible
  - added RAF render-loop recovery wrapper so frame errors no longer permanently stop canvas rendering.
- Outcome:
  - opening/closing Preferred panel no longer disables canvas drag due render-loop termination.
- Files updated:
  - binary-tree-next-app.mjs
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
  - Claude_Notes/binary-tree-next.md
- Validation:
  - node --check binary-tree-next-app.mjs passed.

## Recent Update (2026-04-16) - Preferred Placement Save Faster Feedback + Loading Animation

- Completed:
  - switched post-save Preferred refresh to background (non-blocking)
  - added in-flight save note: `Saving profile plan...`
  - added save-button loading spinner animation
  - added explicit success note: `Profile plan saved successfully.`
  - added dedicated success feedback styling.
- Outcome:
  - placement save now feels faster and provides clearer user feedback through loading and success states.
- Files updated:
  - binary-tree-next-app.mjs
  - binary-tree-next.html
  - Claude_Notes/charge-documentation.md
  - Claude_Notes/Current Project Status.md
  - Claude_Notes/binary-tree-next.md
- Validation:
  - node --check binary-tree-next-app.mjs passed.

## Recent Update (2026-04-16) - User Dashboard My Store Now Reuses Latest `store.html`

- Completed:
  - replaced the visible legacy `My Store` storefront panel in `index.html` with an embedded latest-store shell
  - added iframe integration to load `/store.html?embedded=1`
  - added iframe source sync so active store code is forwarded via `store=...` query
  - kept legacy dashboard storefront markup hidden for rollback safety.
- Outcome:
  - dashboard `My Store` now follows the newest public store flow without duplicating UI logic
  - active user store code stays aligned between dashboard embed and full store page.
- Files updated:
  - `index.html`
  - `store.html`
  - `Claude_Notes/member-dashboard-page.md`
  - `Claude_Notes/public-store-page.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - inline script parse checks passed:
    - `index.html` (`3` blocks)
    - `store.html` (`2` blocks)

## Recent Update (2026-04-16) - My Store Sidebar Uses Native Store+Cart Components (No Embed)

- Completed:
  - removed dashboard My Store iframe/embed approach
  - replaced storefront content with native Store panel + Cart panel + Continue to Stripe CTA
  - styled product and cart components to match latest store component direction
  - wired Continue to Stripe from storefront cart CTA using hosted checkout path
  - removed temporary embedded-mode behavior from `store.html`.
- Outcome:
  - My Store sidebar now uses the requested direct components instead of embedding `store.html`
  - existing PV/BV credit and attribution checkout logic remains intact.
- Files updated:
  - `index.html`
  - `store.html`
  - `Claude_Notes/member-dashboard-page.md`
  - `Claude_Notes/public-store-page.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - inline script parse checks passed:
    - `index.html` (`3` blocks)
    - `store.html` (`1` block)

## Recent Update (2026-04-16) - My Store Containers Reduced + Share and Earn Moved to Bottom

- Completed:
  - removed My Store top wrapper/share-link cards
  - kept only Store + Cart in main storefront area
  - added bottom Share and Earn section with Copy Store Link action only
  - resized storefront components to match store-page sizing proportions.
- Outcome:
  - My Store now follows requested minimal structure with less visual container nesting.
  - copy-link workflow moved to Share and Earn section while preserving logic.
- Files updated:
  - `index.html`
  - `Claude_Notes/member-dashboard-page.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - inline script parse check passed: `index.html` (`3` blocks).

## Recent Update (2026-04-16) - My Store Initial Render Jitter Reduced

- Completed:
  - stabilized root scrollbar gutter to reduce first-open width shifts
  - changed storefront responsive collapse threshold to `1040px` (aligned to store page behavior)
  - fixed discount badge minimum width to reduce post-hydration header text reflow.
- Outcome:
  - reduced first-load ?stretch then settle? effect in My Store storefront view.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`
- Validation:
  - inline script parse check passed (`index.html`: `3` blocks).

## Recent Update (2026-04-16) - Warm-Loaded My Store While on Home Page

- Completed:
  - started My Store initialization earlier in app startup to warm-load while user is still on Home
  - added storefront image warm-preload routine with bounded wait for first-open stability
  - added fixed initial Store grid loading placeholder + minimum height to reduce first-render stretch.
- Outcome:
  - reduced visible first-open ?stretch then settle? effect in My Store product panel.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`
- Validation:
  - inline script parse check passed (`index.html`: `3` blocks).

## Recent Update (2026-04-16) - My Store Image Stretch Follow-Up (Deeper Warmload)

- Completed:
  - switched My Store background warmload to full completion while user is on non-My-Store pages
  - added per-image timeout-safe preload resolution
  - added explicit image attributes + stability CSS for first paint.
- Outcome:
  - further reduced first-open image stretch/snap behavior in Store product cards.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`
- Validation:
  - inline script parse check passed (`index.html`: `3` blocks).

## Recent Update (2026-04-16) - My Store Product Image Decode Reveal Guard

- Completed:
  - added image-ready reveal guard so Store card images fade in only after load/settle
  - prevents visible stretch/snap during first decode.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`
- Validation:
  - inline script parse check passed (`index.html`: `3` blocks).

## Recent Update (2026-04-16) - Binary Tree Next Rank Advancement Panel (Rank + Good Life Unified)

- Completed:
  - implemented full Rank Advancement panel UI in `binary-tree-next.html`
  - merged Rank Advancement and Good Life data rendering into one Binary Tree Next panel module
  - wired live fetch from `member-auth/achievements` and `member-auth/good-life/monthly`
  - added rank claim action wiring
  - added panel toggle in profile-left dock (`panel:rank-advancement:toggle`)
  - added panel interop/exclusivity with Account Overview, Preferred Accounts, and My Store
  - added refresh/reset hooks for session change, live tree updates, enrollment completion, and post-upgrade refresh.

- Current outcome:
  - panel now shows monthly loop target, milestone icon track, current reward summary, Good Life bonus amount, monthly analysis values, and claim-state handling.

- Files updated:
  - `binary-tree-next.html`
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`

- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

- Remaining follow-up:
  - visual screenshot comparison pass intentionally skipped per latest user direction.

## Recent Update (2026-04-16) - Rank Advancement Follow-up Corrections

- Completed:
  - fixed Claim button flicker by decoupling claim-in-flight UI state from passive sync refresh state
  - aligned reward summary rank resolution with reached cycle progression to prevent over-advancing display rank
  - corrected rank requirement mapping (`Black Diamond` now requires `1 Blue Diamond Member`)
  - updated direct sponsor requirement copy to include `50 Personal BV each`
  - removed extra black container behind the center reward icon and kept enlarged icon-only presentation
  - enforced Good Life bonus visibility logic for Diamond and above only.

- Files updated:
  - `binary-tree-next-app.mjs`
  - `binary-tree-next.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`

- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

- Addendum:
  - persisted successful claim payloads into Rank Advancement cache to prevent post-claim UI regressions during partial sync failures.

## Recent Update (2026-04-16) - Rank Advancement Monthly Reward + Icon Selection Fixes

- Completed:
  - corrected Rank Advancement Monthly Rewards to reflect highest reached rank **this month** (earned state), not next target rank
  - added no-earned fallback state: `Wait next month for details`
  - made rank ladder icons selectable to inspect rank-specific requirements/work remaining
  - updated requirement rows to show current vs required + remaining values
  - adjusted progress-fill threshold behavior so it clears dashed milestones only when requirements are met
  - hid Good Life block for Ruby/Emerald/Sapphire; display starts at Diamond+.

- Files updated:
  - `binary-tree-next-app.mjs`
  - `binary-tree-next.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`

- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

- Addendum:
  - enforced member-rank prerequisite gating in Rank Advancement progression and earned-state display
  - removed verbose requirement suffix text and switched to green + checkmark met indicators
  - fixed milestone click latency by rebuilding snapshot instantly on rank icon click.

- Addendum:
  - renamed selected-rank heading to `Rank Preview`
  - preview mode now forces neutral gray requirement rows with no checkmarks
  - non-preview passed-rank visual behavior remains unchanged.

## Recent Update (2026-04-16) - Rank Preview Passed-Rank Indicators (Green + Identifier)

- Completed:
  - updated Rank Preview requirement rendering so ranks already passed now show met-state identifiers
  - passed-rank preview rows now use green text with checkmark markers
  - unpassed preview ranks remain neutral gray with no checkmarks.
- Outcome:
  - Rank Preview now visually distinguishes already-achieved ranks from future targets more clearly.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-16) - Rank Ladder Selection Clarity + Passed-Rank Acquired-Since

- Completed:
  - improved rank-icon selection visibility with a stronger yellow selector state and selected badge
  - added `Acquired since <date>` line in Rank Preview when selected rank is already passed.
- Outcome:
  - selected rank is now clearly identifiable at a glance
  - passed-rank previews now communicate acquisition timing directly.
- Files updated:
  - `binary-tree-next.html`
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - `node --check backend/services/member-achievement.service.js` passed.

### Addendum (2026-04-16)

- Rank Advancement selected-icon label now shows the rank name instead of generic `Selected`.

Files updated:
- `binary-tree-next.html`
- `binary-tree-next-app.mjs`

Validation:
- `node --check binary-tree-next-app.mjs` passed.

### Addendum (2026-04-16)

- Rank Advancement now shows `You are here` on the current rank icon while keeping selected preview rank highlighting separate.

Files updated:
- `binary-tree-next-app.mjs`
- `binary-tree-next.html`

Validation:
- `node --check binary-tree-next-app.mjs` passed.

### Addendum (2026-04-16)

- Added per-rank payout preview in Rank Advancement icon selection:
  - Reward Preview
  - Good Life Bonus Preview (Diamond+)

Files updated:
- `binary-tree-next.html`
- `binary-tree-next-app.mjs`

Validation:
- `node --check binary-tree-next-app.mjs` passed.

### Addendum (2026-04-16)

- Rank Preview payout label renamed to `Rank Bonus`.

Files updated:
- `binary-tree-next.html`
- `binary-tree-next-app.mjs`

Validation:
- `node --check binary-tree-next-app.mjs` passed.

### Addendum (2026-04-16)

- Rank Advancement Good Life label text updated to `Good life Bonus`.

Files updated:
- `binary-tree-next.html`
- `binary-tree-next-app.mjs`

Validation:
- `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-16) - Binary Tree Next Infinity Tier Commission Panel (Account Overview Style + Trinary View)

- Completed:
  - implemented a new `Infinity Tier Commission` panel in Binary Tree Next (`binary-tree-next.html`)
  - added full panel runtime wiring (`binary-tree-next-app.mjs`): positioning, visibility, rendering, init, and close behavior
  - connected Account Overview `Infinity Tier Commission` commission card to open the new panel
  - added panel exclusivity with Account Overview / Rank Advancement / Preferred Accounts / My Store
  - added query-open support (`?panel=infinity-builder`) for direct panel QA access.

- Data/UI behavior delivered:
  - real-data Infinity seed node extraction from live tree data (Infinity/Legacy package gate)
  - `Current` section tier rows sorted oldest to new and selectable
  - selected-tier trinary visual (3 seed nodes, each with 3 child nodes)
  - initials displayed on user profile nodes
  - active/inactive node coloring tied to existing Binary Tree Next activity gate logic
  - per-seed 1% node override estimate (from node organization BV)
  - tier completion state + `$150` tier reward presentation
  - commission claim-map read support for tier claimed state.

- Outcome:
  - Binary Tree Next now has a dedicated Infinity Builder UI panel that follows Account Overview visual language while reflecting the requested Infinity tier/trinary workflow.

- Files updated:
  - `binary-tree-next.html`
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`

- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - visual QA captures:
    - `temporary screenshots/screenshot-201-infinity-auth-pass1.png`
    - `temporary screenshots/screenshot-202-infinity-auth-pass2.png`

### Addendum (2026-04-16)

- Infinity Builder panel refinement completed:
  - UI scale reduced (headings, node cards, tier rows, seed avatars)
  - connector lines standardized for consistent trinary branch visuals
  - payout text updated to monthly
  - payout scope clarified to each seed's personal organization BV only.

Files updated:
- `binary-tree-next.html`
- `binary-tree-next-app.mjs`

Validation:
- `node --check binary-tree-next-app.mjs` passed.
- Screenshot round skipped per user instruction.

### Addendum (2026-04-16)

- Infinity Builder tier logic corrected to match business rule:
  - tier completion = 3 direct Infinity/Legacy seed enrollments
  - next tier unlock depends on prior tier seed completion
  - 1% monthly payout remains per-seed and requires that seed to duplicate to 3 active direct children.
- UI wording aligned to remove previous-tier ambiguity and to clarify personal-organization-BV payout basis.

Files updated:
- `binary-tree-next-app.mjs`
- `binary-tree-next.html`

Validation:
- `node --check binary-tree-next-app.mjs` passed.

### Addendum (2026-04-16)

- Infinity Builder panel UX refinement shipped:
  - user-facing copy cleaned up (removed developer terms)
  - breadcrumb-style back control added to return to Account Overview
  - tier reward claim button + feedback added and wired
  - `Current` list is now the scroll container instead of full panel.

Files updated:
- `binary-tree-next.html`
- `binary-tree-next-app.mjs`

Validation:
- `node --check binary-tree-next-app.mjs` passed.
- Screenshot pass skipped per user instruction.

### Addendum (2026-04-16)

- Infinity panel breadcrumb now uses requested format:
  - `Account Overview > Infinity Tier Commission`
- `Account Overview` breadcrumb control still navigates back to Account Overview.

Files updated:
- `binary-tree-next.html`

Validation:
- `node --check binary-tree-next-app.mjs` passed.

### Addendum (2026-04-17)

- Infinity Builder panel now supports the requested node behavior polish:
  - member-specific node color sync for active/inactive state
  - connected trinary line geometry (parent/branch/child contact)
  - click node avatar to focus the same member in Binary Tree view
  - visible usernames on node visuals (tier + current list).
- Interaction refinement:
  - avatar clicks in Current no longer accidentally switch tiers before focus
  - tier-grid avatars are keyboard-focusable for accessibility.

Files updated:
- binary-tree-next-app.mjs
- binary-tree-next.html

Validation:
- node --check binary-tree-next-app.mjs passed.

### Addendum (2026-04-17)

- Infinity Builder small child-node usernames were removed from visible labels to reduce visual crowding.
- Child-node focus interaction remains active.

Files updated:
- binary-tree-next-app.mjs

Validation:
- node --check binary-tree-next-app.mjs passed.

### Addendum (2026-04-17)

- Infinity panel connector lines were cleaned up:
  - removed extra branch overhang around small nodes
  - adjusted small-node stem length for cleaner visual joins.

Files updated:
- binary-tree-next.html

### Addendum (2026-04-17)

- Improved Infinity node click hit-area so users can click the profile area reliably, not just initials.
- Wrapper-level focus dataset mapping and cursor affordance added.
- Focus resolution now supports username fallback when node id is absent.

Files updated:
- binary-tree-next-app.mjs
- binary-tree-next.html

Validation:
- node --check binary-tree-next-app.mjs passed.

### Addendum (2026-04-17) - Legacy Leadership Bonus Panel (Binary Tree Next)

Current scope update:
- Legacy Leadership panel behavior is now implemented in Binary Tree Next using the Infinity panel shell with mode-aware logic.

Progress made:
- Added panel mode switching from Account Overview commission tiles:
  - Infinity tile -> Infinity mode
  - Legacy tile -> Legacy Leadership mode
- Added Legacy-only tier snapshot modeling:
  - seed qualification locked to `legacy-builder-pack`
  - 3 seeds per tier
  - depth mapping support through level 3 (0-3 model)
  - 40-node tier target and one-time claim behavior
- Added Legacy claim-map storage compatibility with commission containers (`legacyleadership` + fallback read support).
- Added Legacy descendant dot rendering rows (depth-2 and depth-3) while preserving click-to-focus.
- Added initial query routing support for `panel=legacy-leadership`.

Files touched this pass:
- `binary-tree-next-app.mjs`
- `binary-tree-next.html`

Validation state:
- `node --check binary-tree-next-app.mjs` passed.
- Screenshot verification intentionally skipped per user instruction.

Active priorities / next checks:
- Run authenticated in-app visual pass with real session data to confirm final Legacy panel spacing/content against design reference.
- Confirm backend claim persistence behavior in live flow for multiple Legacy tiers.

### Addendum (2026-04-17) - Legacy Leadership Reward + Node Presentation Sync (Binary Tree Next)

- Legacy panel reward handling updated in `binary-tree-next-app.mjs`:
  - Legacy mode no longer uses Infinity's fixed `$150` fallback.
  - Legacy tier fallback reward now uses one-time `$2,000`.
  - Tier reward totals now aggregate per-tier values directly.
- Legacy node presentation updated to match reference intent:
  - removed text labels under Legacy node cards in the tier visual area
  - removed visible seed handles in Legacy `Current` row node chips
  - removed synthetic fallback initials when node identity text is missing.

Files updated:
- `binary-tree-next-app.mjs`

Validation:
- `node --check binary-tree-next-app.mjs` passed.
- Screenshot pass skipped per user instruction.

### Addendum (2026-04-17) - Legacy Node Lines / Structure Alignment (Binary Tree Next)

- Legacy panel now preserves and renders mapped structure per depth group:
  - depth 2: 3 parent groups x 3 nodes
  - depth 3: 9 parent groups x 3 nodes
- Replaced flat descendant-row rendering with grouped branch-grid rendering and connector lines.
- Added Legacy-only CSS hooks for structured branch visuals and mobile-safe layout overrides.

Files updated:
- `binary-tree-next-app.mjs`
- `binary-tree-next.html`

Validation:
- `node --check binary-tree-next-app.mjs` passed.
- Screenshot pass skipped per user instruction.

### Addendum (2026-04-17) - Legacy Depth-3 Clickable Initials + More Space

- Legacy tier visual spacing increased so mapped depth structure has more horizontal room.
- 4th-level nodes (depth 3) now render initials and remain clickable/focusable.
- Depth-3 group arrangement changed to a less compressed grouped matrix for readability.

Files updated:
- `binary-tree-next-app.mjs`
- `binary-tree-next.html`

Validation:
- `node --check binary-tree-next-app.mjs` passed.

### Addendum (2026-04-17) - Legacy Layout Restore + Compact Depth-3 Initials

Current scope update:
- Restored the Legacy Leadership panel to the prior mapped-node layout after the expanded spacing pass shifted composition.

Progress made:
- Reverted Legacy branch and depth-grid widths to previous values (desktop/mobile).
- Restored depth-3 mapped strip to compact 9-column structure.
- Kept depth-3 node initials + click/focus support, now compact to preserve layout.
- Added minimal breathing room only (small depth-3 spacing tune) without moving the whole panel.

Files touched this pass:
- `binary-tree-next-app.mjs`
- `binary-tree-next.html`

Validation state:
- `node --check binary-tree-next-app.mjs` passed.
- Screenshot verification skipped per user instruction.

### Addendum (2026-04-17) - Legacy 1st-to-4th Level Spacing Pass

Current scope update:
- Applied a direct spacing expansion across Legacy levels 1-4 to address cramped 4th-level nodes.

Progress made:
- Increased Legacy branch/children/depth-grid widths (desktop + compact breakpoint).
- Increased depth-2/depth-3 connector spacing and node-item breathing room.
- Enlarged depth-3 node sizing slightly so initials remain legible while clickable.

Files touched this pass:
- `binary-tree-next.html`

Validation state:
- Screenshot verification skipped per user instruction.

### Addendum (2026-04-17) - Legacy Spacing Pass (Stronger)

Current scope update:
- Applied a significantly stronger spacing expansion from Legacy level 1 to level 4 after prior pass remained too tight.

Progress made:
- Expanded desktop width envelope to `172px` for branch, child row, and mapped depth grids.
- Expanded compact breakpoint width envelope to `132px`.
- Increased depth spacing, connector stem length, and node size for clearer mapped hierarchy.

Files touched this pass:
- `binary-tree-next.html`

Validation state:
- Screenshot verification skipped per user instruction.

### Addendum (2026-04-17) - Legacy Spacing + Size Hierarchy Stabilization

Current scope update:
- Locked Legacy mapped tree into explicit level-based sizing (L1 > L2 > lower levels) with stronger spacing control.

Progress made:
- Seed/root node increased.
- Child nodes set to medium size.
- Lower mapped nodes reduced to maintain hierarchy clarity.
- Branch + mapped depth grids widened and vertically spaced for clearer legibility.
- Depth-3 group rendering switched to a roomier mapped-grid arrangement.

Files touched this pass:
- `binary-tree-next.html`

Validation state:
- `node --check binary-tree-next-app.mjs` passed.
- Screenshot verification skipped per user instruction.

### Addendum (2026-04-17) - Legacy/Infinity Panel Logic Sync Pass

Current scope update:
- Implemented requested panel behavior changes for Legacy and Infinity in Binary Tree Next bonus panel.

Progress made:
- Removed Legacy tier-card depth grid visuals.
- Added visible initials on tier-card node circles and Current-row node chips.
- Added right-side Current-row progress totals (`x/40` Legacy, `x/3` Infinity).
- Enforced no-spillover counting for both modes so only own-organization nodes qualify.
- Synced gradient sourcing to Binary Tree palette resolver path used for node backgrounds.

Files touched this pass:
- `binary-tree-next-app.mjs`
- `binary-tree-next.html`

Validation state:
- `node --check binary-tree-next-app.mjs` passed.
- Screenshot verification skipped per user instruction.

### Addendum (2026-04-17) - Corrective UI Pass (Current List + Infinity Revert)

Current scope update:
- Applied corrective pass after list stretching and unintended Infinity-side behavior changes.

Progress made:
- Prevented single-row Current list cards from stretching to fill remaining container height.
- Reverted Infinity qualification behavior to previous logic (no Legacy-only spillover rule leaking into Infinity).
- Kept right-side row counters only for Legacy mode.
- Reduced Legacy tier-card/node sizing back to compact baseline.

Files touched this pass:
- `binary-tree-next-app.mjs`
- `binary-tree-next.html`

Validation state:
- `node --check binary-tree-next-app.mjs` passed.
- Screenshot verification skipped per user instruction.

### Addendum (2026-04-17) - Binary Tree Next Legacy/Infinity Direct-Ownership Fix

Current scope update:
- Clarified and enforced direct qualification rule for bonus panels: qualification follows personal sponsorship, not placement location alone.

Progress made:
- Removed blanket Legacy spillover exclusion from panel qualification helpers.
- Added package-key fallback normalization in qualification checks.
- Updated direct-seed ownership detection to prioritize original sourceSponsorId so external spillovers are not counted as personal directs.
- Preserved qualification for personally sponsored enrollments even if they were placed via spillover.

Files touched this pass:
- binary-tree-next-app.mjs

Validation state:
- node --check binary-tree-next-app.mjs passed.

### Addendum (2026-04-17) - Node Color Consistency Pass (Bonus Panels)

Current scope update:
- Applied requested consistency pass so node colors stay synchronized across Binary Tree Next and bonus panel surfaces.

Progress made:
- Reworked bonus-panel node color resolver to use the same per-user/direct/inactive palette logic as Binary Tree Next nodes.
- Forced empty tier slots (new tiers / no node assigned) to gray placeholders.
- Updated CSS empty-state fallbacks for core nodes, child nodes, descendants, and current-list seed chips.

Files touched this pass:
- binary-tree-next-app.mjs
- binary-tree-next.html

Validation state:
- node --check binary-tree-next-app.mjs passed.
### Addendum (2026-04-17) - Panel Line Geometry Fix (Connector Cleanup)

Current scope update:
- Applied a focused connector-line cleanup pass for the bonus panel node tree.

Progress made:
- Replaced fixed horizontal connector offsets with proportional (1/6 width) alignment.
- Tightened branch-to-child stem join by shifting child stem start up by 1px.
- Preserved existing node sizing and hierarchy; only connector geometry changed.

Files touched this pass:
- binary-tree-next.html

Validation state:
- Visual screenshot validation pending (screenshot execution requires elevated permission, not granted).
### Addendum (2026-04-17) - Legacy Panel Header Copy Cleanup

Current scope update:
- Removed requested mapped-node subtitle text from above the Legacy tier panel.

Progress made:
- Cleared Legacy subtitle output branch for the direct-requirement-met, not-yet-complete state.
- Left other states/messages unchanged.

Files touched this pass:
- binary-tree-next-app.mjs

Validation state:
- node --check binary-tree-next-app.mjs passed.
### Addendum (2026-04-17) - Legacy Tier Canvas View (40 Nodes)

Current scope alignment:
- Implemented approved scope only: Legacy Leadership per-tier canvas view with fixed 40-node trinary structure.

Completed this pass:
- Added `View Tree` / `Hide Tree` button flow in Legacy panel.
- Added selected-tier canvas render mode (`1 + 3 + 9 + 27`).
- Added gray placeholder nodes for all empty slots.
- Synced non-empty node color identity to existing Binary Tree node identity rules.
- Added in-canvas tier header badge for operator clarity.
- Disabled blank-canvas drag/wheel movement during tier-map mode to preserve fixed map readability.

Files touched:
- `binary-tree-next-app.mjs`
- `binary-tree-next.html`
- `Claude_Notes/binary-tree-next.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

Validation state:
- `node --check binary-tree-next-app.mjs` passed.
- Visual screenshot validation blocked in sandbox (`spawn EPERM`).

Active follow-up priority:
- User visual QA on node spacing/placement in the new tier canvas view.

### Addendum (2026-04-17) - Legacy Tree Action Follow-Up

Current scope update:
- Applied user-requested correction: `View Tree` is now action-only (not toggle) and opens via the animated entry path.

Progress made:
- Updated panel sync text/state to keep button label fixed at `View Tree`.
- Corrected click handler wiring to use `viewLegacyTierCanvasTree()`.
- Retained per-tier 40-node trinary render behavior after the transition.

Files touched this pass:
- `binary-tree-next-app.mjs`

Validation state:
- `node --check binary-tree-next-app.mjs` passed.

### Addendum (2026-04-17) - Legacy View Tree Activation Stabilization

Current scope update:
- Stabilized Legacy panel `View Tree` behavior for immediate usability and visible canvas transition.

Progress made:
- Added immediate Legacy `View Tree` button-state sync on panel mode/visibility updates.
- Added resilient selected-tier context resolution for tree-open action.
- Hardened tree-open callback path with safety handling and forced post-open render refresh.
- Removed potential temporary pointer lock by clearing Infinity panel `is-positioning` state on open.

Files touched this pass:
- `binary-tree-next-app.mjs`

Validation state:
- `node --check binary-tree-next-app.mjs` passed.

### Addendum (2026-04-17) - Legacy View Switch Interactivity Restored

Current scope update:
- Restored Legacy `View Tree` click-through reliability by fixing hidden-panel overlay interception.

Progress made:
- Added descendant-level pointer-event suppression for hidden/positioning panel states.
- Verified that `View Tree` pointer hit-testing now targets the intended button.
- Verified that clicking `View Tree` now triggers canvas switch to Legacy trinary mapping view.

Files touched this pass:
- `binary-tree-next.html`

Validation state:
- `node --check binary-tree-next-app.mjs` passed.
- Logged-in browser repro validated click-target and render-switch behavior.

### Addendum (2026-04-17) - Legacy Map UX Continuity Update

Current scope update:
- Legacy tier map now persists as the active Binary Tree canvas view when Legacy panel is closed.

Progress made:
- Preserved Legacy map state on panel close.
- Re-enabled standard canvas navigation behavior (pan/zoom) in Legacy map mode.
- Moved the Legacy map badge to top-right safe area for visibility.

Files touched this pass:
- `binary-tree-next-app.mjs`

Validation state:
- `node --check binary-tree-next-app.mjs` passed.
- Logged-in repro validated Legacy map persistence after panel close.

### Addendum (2026-04-17) - Legacy Trinary Render Parity Pass (Depth Sizing)

Current scope update:
- Applied Binary-style depth sizing to Legacy trinary canvas nodes so the tier map no longer renders with generic near-uniform circle sizes.

Progress made:
- Added Legacy trinary depth-decay constants aligned to Binary radius scaling behavior.
- Replaced fixed trinary radius ladder in `resolveLegacyTierCanvasFrame(...)` with depth-decay projection sizing.
- Added viewport-aware per-depth radius caps so 1-3-9-27 map stays readable on smaller canvases while keeping depth hierarchy clear.
- Preserved existing world-space camera projection path (pan/zoom continuity remains intact).

Files touched this pass:
- `binary-tree-next-app.mjs`

Validation state:
- `node --check binary-tree-next-app.mjs` passed.
- Interactive visual QA pending (non-approved elevated Puppeteer interaction needed for automated click/drag flow).

### Addendum (2026-04-17) - Legacy Trinary Line-Centering Correction

Current scope update:
- Corrected Legacy trinary connector alignment so left/right branches anchor to the true parent center.

Progress made:
- Replaced row-slot X mapping with parent-centered trinary branch positioning in `resolveLegacyTierCanvasFrame(...)`.
- Added deterministic local trinary path generation per node from sibling order under each parent.
- Added geometric branch-step decay so depth groups stay symmetrical while fitting workspace width.
- Tightened depth Y distribution to reduce overlong connector segments.

Files touched this pass:
- `binary-tree-next-app.mjs`

Validation state:
- `node --check binary-tree-next-app.mjs` passed.
- Awaiting user visual QA for final preference tuning on connector length.

### Addendum (2026-04-17) - Legacy Trinary UX Control Pass (Shorter Lines + Header Toggle + Exit Controls)

Current scope update:
- Completed requested UX adjustments for Legacy trinary mode controls and connector compactness.

Progress made:
- Compressed trinary vertical depth layout further (`[0.04, 0.20, 0.33, 0.45]`) to shorten connectors by roughly 40% from previous pass.
- Moved Legacy Tier header to centered top placement and centered all header text lines.
- Added canvas-header click interaction to toggle Legacy Leadership panel visibility while staying in trinary view.
- Updated Home/Back control actions so pressing either while in trinary view exits to default Binary home view.

Files touched this pass:
- `binary-tree-next-app.mjs`

Validation state:
- `node --check binary-tree-next-app.mjs` passed.
- Pending user visual confirmation for exact preferred line-length tightness.

### Addendum (2026-04-17) - Header Placement Balance Fix (Left Panel Aware)

Current scope update:
- Adjusted Legacy top header placement to avoid off-center feel when left panel UI is open.

Progress made:
- Added dual-center behavior for Legacy header:
  - true center when side panel is hidden,
  - shifted-right visual center when side panel is shown (center of usable tree region).
- Preserved centered typography and existing toggle interaction.

Files touched this pass:
- `binary-tree-next-app.mjs`

Validation state:
- `node --check binary-tree-next-app.mjs` passed.

### Addendum (2026-04-17) - Legacy Header Breadcrumb Scope Refinement

Current scope update:
- Refined top Legacy header so breadcrumb text appears only when entering deeper nodes.

Progress made:
- Removed the static `40 nodes (1-3-9-27)` subtitle from the header.
- Added depth-gated breadcrumb behavior:
  - root selection (`depth 0`) shows panel hint,
  - entered node path (`depth > 0`) shows breadcrumb chain (`Root > ... > Selected`).
- Updated header styling radius to better match existing rounded theme surfaces.
- Wired header renderer to consume active legacy frame context for breadcrumb path resolution.

Files touched this pass:
- `binary-tree-next-app.mjs`

Validation state:
- `node --check binary-tree-next-app.mjs` passed.

### Addendum (2026-04-17) - Clarified Header UX Contract Implemented

Current scope update:
- Implemented explicit split behavior for top header by active view context.

Progress made:
- Trinary view header remains panel-toggle control only.
- Binary local/universe mode now renders top breadcrumb panel with clickable links for universe root hops.
- Breadcrumb header only appears when actually in local/universe scope (`root != global root`), avoiding clutter in default global binary view.

Files touched this pass:
- `binary-tree-next-app.mjs`

Validation state:
- `node --check binary-tree-next-app.mjs` passed.

### Addendum (2026-04-17) - Binary Breadcrumb History Model + Node-Chip Visuals

Current scope update:
- Shifted Binary local breadcrumb behavior from ancestor/depth chain rendering to entered-navigation history rendering.

Progress made:
- Added history trail resolver from `state.universe.history` + current root.
- Added history-index navigation handler for chip clicks (`universe:history:goto:<index>`).
- Converted top breadcrumb from text links to node chips:
  - node-colored avatar circles,
  - initials overlays,
  - username captions below each chip.
- Expanded local breadcrumb header height and updated label to `Navigation History`.

Files touched this pass:
- `binary-tree-next-app.mjs`

Validation state:
- `node --check binary-tree-next-app.mjs` passed.

### Addendum (2026-04-17) - Breadcrumb Visual Spec Pass (White Mock)

Current scope update:
- Applied user-provided breadcrumb visual direction to Binary local/universe breadcrumb panel.

Progress made:
- Replaced dark header card with a white pill container and removed header title text.
- Updated chip layout to match reference structure: circular node -> > -> circular node, with usernames below each node.
- Retained history-index navigation behavior for backtracking to prior entered views.

Files touched this pass:
- binary-tree-next-app.mjs

Validation state:
- node --check binary-tree-next-app.mjs passed.



### Addendum (2026-04-17) - Breadcrumb Compact Sizing + Centered Chip Start

Current scope update:
- Refined Binary breadcrumb header sizing and alignment after overlap feedback.

Progress made:
- Shrunk the breadcrumb panel and internal chip visuals.
- Centered the breadcrumb chip sequence inside the panel instead of left-starting the row.
- Preserved history-driven breadcrumb click behavior.

Files touched this pass:
- binary-tree-next-app.mjs

Validation state:
- node --check binary-tree-next-app.mjs passed.

### Addendum (2026-04-17) - Breadcrumb Size Reduction Follow-up

Current scope update:
- Completed a second compact sizing pass for the Binary breadcrumb header.

Progress made:
- Shrunk container and internal chip/text sizing further.
- Kept centered history-row behavior and history click navigation.

Files touched this pass:
- binary-tree-next-app.mjs

Validation state:
- node --check binary-tree-next-app.mjs passed.

### Addendum (2026-04-17) - Breadcrumb Content Y-Center Alignment

Current scope update:
- Adjusted Binary breadcrumb internals for vertical centering and balanced spacing.

Progress made:
- Breadcrumb chip stack now centers on Y-axis inside the panel.
- Username spacing under nodes tightened to remove excess bottom gap.

Files touched this pass:
- binary-tree-next-app.mjs

Validation state:
- node --check binary-tree-next-app.mjs passed.

### Addendum (2026-04-17) - Breadcrumb Typography Readability Pass

Current scope update:
- Improved readability of compact Binary breadcrumb text.

Progress made:
- Increased username/initial/separator text sizes.
- Adjusted chip width budget to avoid over-truncation after typography increase.

Files touched this pass:
- binary-tree-next-app.mjs

Validation state:
- node --check binary-tree-next-app.mjs passed.

### Addendum (2026-04-17) - Trinary Enter Flow Fixed

Current scope update:
- Legacy Trinary Enter action now transitions to Local Binary for the selected real node.

Progress made:
- Added Trinary-selected-node id resolver for real binary node targets.
- Wired both dock Enter and keyboard `U` to shared enter helper.
- Empty Trinary placeholders are safely ignored (no invalid enter attempt).

Files touched this pass:
- binary-tree-next-app.mjs

Validation state:
- node --check binary-tree-next-app.mjs passed.

### Addendum (2026-04-17) - Trinary Header Quick Tier Switching

Current scope update:
- Added quick tier switching dropdown to Legacy Trinary top header while keeping panel toggle behavior.

Progress made:
- Header now supports two interactions:
  - panel show/hide toggle,
  - Legacy tier selection dropdown.
- Dropdown options are sourced from available Legacy tier entries and update current Trinary map view.
- Dropdown auto-closes when interacting outside dropdown controls.

Files touched this pass:
- binary-tree-next-app.mjs

Validation state:
- node --check binary-tree-next-app.mjs passed.

### Addendum (2026-04-17) - Compact Trinary Header + Animated Tier Switching

Current scope update:
- Refined Legacy Trinary top header to be less tall and added tier-switch transitions.

Progress made:
- Reduced Trinary header vertical footprint and dropdown/menu sizing.
- Implemented fade transition between Legacy tiers when switching from header dropdown.
- Added in-flight guard so panel refresh does not cancel/skip the transition.

Files touched this pass:
- binary-tree-next-app.mjs

Validation state:
- node --check binary-tree-next-app.mjs passed.

### Addendum (2026-04-17) - Transition Reset Safety

Current scope update:
- Hardened Legacy tier transition cancellation paths.

Progress made:
- Ensured pending tier-switch fade is reset on close/non-animated cancel paths.

Files touched this pass:
- binary-tree-next-app.mjs

Validation state:
- node --check binary-tree-next-app.mjs passed.

### Addendum (2026-04-17) - Tier Transition Speed Tuning

Current scope update:
- Reduced transition speed for Legacy tier switching in Trinary view.

Progress made:
- Increased fade-out and fade-in durations for calmer motion.

Files touched this pass:
- binary-tree-next-app.mjs

Validation state:
- node --check binary-tree-next-app.mjs passed.

### Addendum (2026-04-17) - Trinary Shortcut Button + Slower Tier Fade

Current scope update:
- Added direct Trinary Tier 1 entry button near top-right Preferred Customer controls.
- Further slowed tier-switch animation pacing.

Progress made:
- New top-right button now jumps to Legacy Tier 1 Trinary view immediately.
- Legacy tier fade transition duration increased for smoother perception.

Files touched this pass:
- binary-tree-next-app.mjs

Validation state:
- node --check binary-tree-next-app.mjs passed.

### Addendum (2026-04-17) - Trinary Quick-Access Toggle UX

Current scope update:
- Updated Trinary quick-access button behavior to toggle on/off between Trinary and Binary default views.

Progress made:
- Top-right quick-access now behaves as a state toggle (not one-way open).
- Updated icon to network-style visual (`hub`) for better user mental model.
- Slowed tier switch fade timing further.

Files touched this pass:
- binary-tree-next-app.mjs

Validation state:
- node --check binary-tree-next-app.mjs passed.

### Addendum (2026-04-17) - Legacy Tier Counter Alignment (Canvas vs Panel)

Current scope update:
- Corrected Legacy tier progress counter to align with Trinary map node counting.

Progress made:
- Updated `x/40` computation to include the root/home node.
- Resolved off-by-one mismatch (example: 7 shown vs 8 counted including self).

Files touched this pass:
- binary-tree-next-app.mjs

Validation state:
- node --check binary-tree-next-app.mjs passed.

### Addendum (2026-04-17) - Infinity/Legacy Sort Direction Control

Current scope update:
- Activated the tier sort control in both Infinity Tier Commission and Legacy Leadership Bonus panel modes.

Progress made:
- Sort now toggles between `Ascending` and `Descending` only.
- Tier rows in the Current list re-order immediately when sort is pressed.
- Added sort state reset to `Ascending` during panel state reset.

Files touched this pass:
- binary-tree-next-app.mjs

Validation state:
- node --check binary-tree-next-app.mjs passed.

### Addendum (2026-04-17) - Tier Sort Preferences Are Now Account-Persistent

Current scope update:
- Infinity Builder and Legacy Leadership sort direction is now persisted per authenticated user account.

Progress made:
- Added backend storage + API for mode-specific tier sort directions (`asc` / `desc`).
- Launch-state payload now includes persisted sort directions.
- Frontend now maintains independent sort direction per panel mode and syncs changes to server.
- Session bootstrap and session-change flows now rehydrate sort preferences from server state.

Files touched this pass:
- backend/stores/member-binary-tree-intro.store.js
- backend/services/auth.service.js
- backend/controllers/auth.controller.js
- backend/routes/auth.routes.js
- binary-tree-next-app.mjs

Validation state:
- node --check backend/stores/member-binary-tree-intro.store.js passed.
- node --check backend/services/auth.service.js passed.
- node --check backend/controllers/auth.controller.js passed.
- node --check backend/routes/auth.routes.js passed.
- node --check binary-tree-next-app.mjs passed.

### Addendum (2026-04-17) - Left Panel Member Status Swap (Server Time Removed)

Current scope update:
- Left panel bottom card is now dedicated to Member Status metrics for the organization.

Progress made:
- Replaced Server Timer card content with Member Status rows.
- Added organization-side metric resolver for:
  - total members
  - active members on left/right
  - direct sponsors on left/right
  - total active/direct counts.
- Removed server-time display from the left panel per follow-up request.

Files touched this pass:
- binary-tree-next-app.mjs

Validation state:
- node --check binary-tree-next-app.mjs passed.

### Addendum (2026-04-17) - Member Status Card UX Follow-up Applied

Current scope update:
- Left-panel member-status card now follows selected-node context and visual updates requested.

Progress made:
- Removed card title text (Member Status).
- Changed card container to #FFFFFF.
- Wired card data context to selected node so values refresh on node click, aligned with Details panel behavior.

Files touched this pass:
- binary-tree-next-app.mjs

Validation state:
- node --check binary-tree-next-app.mjs passed.
### Addendum (2026-04-17) - Selected Self Node Member Status Zero-Fix

Current scope update:
- Resolved member-status card returning all zeros when clicking the viewer/self node.

Progress made:
- Root-scope path is now accepted as valid in resolver logic.
- Fallback-to-zero now only triggers for truly invalid node metrics, not root context.

Files touched this pass:
- binary-tree-next-app.mjs

Validation state:
- node --check binary-tree-next-app.mjs passed.
### Addendum (2026-04-17) - Spillover Identity Privacy Gate Applied (Binary Tree Next)

Current scope update:
- Applied legacy spillover anonymity behavior to Binary Tree Next so spillover nodes no longer expose identity details in left-panel and navigation surfaces.

Progress made:
- Added shared privacy helper layer for spillover/anonymized node masking.
- Updated Details card identity fields to anonymize masked nodes (`Anonymous` / `Hidden`).
- Updated relation labels (Parent/Sponsor) to anonymize masked nodes and suppress masked relation jump actions.
- Updated favorites/search/breadcrumb identity labels and initials to anonymized outputs for masked spillover nodes.
- Disabled photo-avatar exposure for masked spillover nodes in canvas/detail/favorites/search rendering paths.

Files touched this pass:
- `binary-tree-next-app.mjs`
- `Claude_Notes/binary-tree-next.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

Validation state:
- `node --check binary-tree-next-app.mjs` passed.
### Addendum (2026-04-17) - Spillover Privacy Rule Correction (Use Legacy Logic)

Current scope update:
- Spillover anonymous gate in Binary Tree Next now follows the exact legacy rule behavior.

Progress made:
- Reverted privacy detection to legacy outside-source spillover condition.
- Adjusted scoped sponsor mapping so out-of-scope spillovers have unresolved mapped sponsor id (required by legacy gate).
- Kept spillover status preserved even when sponsor is out-of-scope.

Files touched this pass:
- `binary-tree-next-app.mjs`

Validation state:
- `node --check binary-tree-next-app.mjs` passed.


### Addendum (2026-04-17) - Spillover Privacy Ownership Correction (Root View)

Current scope update:
- Binary Tree Next privacy gate now respects root/owner-sponsored branch visibility.

Progress made:
- Added ownership traversal by sponsor graph to distinguish viewer-owned vs outside-source spillovers.
- Limited anonymization to outside-source spillover branches only.
- Preserved details for viewer-owned spillover branches, while retaining privacy for member-scoped outside-source branches.

Files touched this pass:
- `binary-tree-next-app.mjs`

Validation state:
- `node --check binary-tree-next-app.mjs` passed.

### Addendum (2026-04-17) - Infinity Builder Tier Logic Update (Per-Node Rewards + Qualification Gates)

- Implemented requested Infinity Builder rule set in runtime logic:
- Tier completion now requires all 3 nodes completed.
- Completed node rule uses active seed + 3 active directs.
- Direct activity qualification now checks all qualifying directs under each node.
- Tier 1 strict monthly rule added: monthly 1% only activates after full Tier 1 completion.
- Tier 2+ relaxed monthly rule added: per-node 1% can activate before full tier completion.
- Locked tiers no longer activate monthly 1%.
- Infinity tier rewards are now package-dependent per node:
- Infinity node = 50 USD
- Legacy node = 75 USD
- Mixed tier totals are computed dynamically.
- Infinity total/claimable tier reward totals now aggregate per-tier computed amounts.
- Updated Infinity panel copy/subtitle/node status text to reflect the new rules.

Files updated:
- `binary-tree-next-app.mjs`
- `Claude_Notes/binary-tree-next.md`

Validation:
- `node --check binary-tree-next-app.mjs` passed.

### Addendum (2026-04-17) - Infinity Claim Button Hardcoded 150 Fallback Removed

- Resolved residual static 150 USD claim label in Infinity panel defaults.
- Updated HTML default claim and bonus copy to non-fixed fallback text.
- Added runtime guard for empty/unresolved tier snapshots so stale hardcoded values are never shown.

Files updated:
- `binary-tree-next.html`
- `binary-tree-next-app.mjs`
- `Claude_Notes/binary-tree-next.md`

Validation:
- `node --check binary-tree-next-app.mjs` passed.

### Addendum (2026-04-17) - Infinity Locked Tier Amount Display Adjustment

- Removed dollar amount from locked/incomplete Infinity claim-state labels to avoid fixed-looking `150.00` display before claim eligibility.
- Locked tier bonus line now uses lock guidance text.
- Claim CTA only includes amount when tier is completed and claimable.

Files updated:
- `binary-tree-next-app.mjs`
- `Claude_Notes/binary-tree-next.md`

Validation:
- `node --check binary-tree-next-app.mjs` passed.

### Addendum (2026-04-17) - Infinity Tier Commission Rename Applied

- Standardized user-facing naming from `Infinity Builder Bonus` to `Infinity Tier Commission` across member/admin surfaces.
- Kept internal payout map keys unchanged to avoid regressions in existing claim/history data.
- Updated Binary Tree Next panel labels/copy, account overview labels, payout source labels, and upgrade unlock wording.

Files updated:
- `binary-tree-next.html`
- `binary-tree-next-app.mjs`
- `index.html`
- `admin.html`
- `store-dashboard.html`
- `backend/services/wallet.service.js`
- `backend/stores/payout.store.js`

Validation:
- repo-wide text scan shows no remaining `Infinity Builder Bonus` user-facing label entries.

### Addendum (2026-04-17) - Admin Flush Hardening for Clean Test Resets

Current scope update:
- Admin flush now clears expanded user-linked backend data while preserving admin and store-product catalog data.

Progress made:
- Extended reset coverage in `backend/services/admin.service.js` to include newer tables (sessions, verification tokens, intro state, commission containers, notifications, rank progress, achievements/titles, preferred attribution, and e-wallet records).
- Added missing-table detection so reset remains resilient across partially migrated environments.
- Added runtime settings baseline reset in flush flow to remove prior system customization state.
- Updated `admin.html` flush confirmation/feedback copy to match new scope and to explicitly state store products are preserved.

Files touched this pass:
- `backend/services/admin.service.js`
- `admin.html`

Validation state:
- `node --check backend/services/admin.service.js` passed.

Known limitations:
- `store_products` and uploaded product images are intentionally preserved by flush.
- Missing tables are skipped and returned in the API payload as `missingTables`.

### Addendum (2026-04-17) - Flush Endpoint Recovery (Admin Credential Failure Path)

Current scope update:
- Resolved admin flush 500 failure path caused by admin DB credential authentication rejection.

Progress made:
- Added reset-client connection fallback in `backend/services/admin.service.js` from admin pool -> service pool on Postgres auth errors.
- Removed strict early exit requiring admin-credential config for reset operation.
- Added API response warning metadata (`warnings`, `connectionRole`) to surface fallback usage.
- Updated `admin.html` flush success message to include warning text returned by backend.
- Verified reset succeeds through direct invocation and returns cleared counts.

Files touched this pass:
- `backend/services/admin.service.js`
- `admin.html`

Validation state:
- `node --check backend/services/admin.service.js` passed.
- direct reset invocation succeeded and returned `connectionRole: service` when admin auth failed.

Known limitations:
- Running server process must be restarted after this patch for the UI button to pick up changes.

### Addendum (2026-04-17) - Admin Tree Next Centered Anticipation Slot

Current scope update:
- Admin Binary Tree Next anticipation structure now renders as a single centered add slot instead of separate left/right anticipation markers.

Progress made:
- Added admin-only centered anticipation slot generation in `resolveAnticipationSlots(...)`.
- Preserved placement integrity by still resolving and passing concrete binary leg (`left`/`right`) under the hood.
- Updated admin enrollment modal leg-position text to `Auto Placement` / `Spillover Auto Placement`.
- Added slot-label suppression support in anticipation rendering so admin no longer sees left/right slot labels.

Files touched this pass:
- `binary-tree-next-app.mjs`

Validation state:
- `node --check binary-tree-next-app.mjs` passed.

Known limitations:
- Centered anticipation is a visual structure update only; backend placement model remains binary.
- Acting-root behavior intentionally unchanged in this pass.

### Addendum (2026-04-17) - Admin Dashboard Modernization (User Dashboard Theme Parity Pass)

Current scope update:
- Admin dashboard is now aligned with the updated user-dashboard theming system and shell spacing baseline.

Progress made:
- Migrated admin Tailwind color/shadow config to CSS variable tokens.
- Added dark/light-capable root token sets with active light theme override.
- Updated admin shell top bar/main spacing to match current dashboard rhythm.
- Updated first-row admin KPI card containers to the newer dashboard card treatment.
- Preserved existing admin metric IDs and data-binding behavior.

Files touched this pass:
- `admin.html`
- `Claude_Notes/admin-dashboard-page.md`

Validation state:
- Code diff verification complete.
- Puppeteer screenshot validation blocked by sandbox browser-launch permission limits in this session.

Known limitations:
- Full section-by-section dashboard module transplant from user dashboard was not completed in this pass.
- Visual verification screenshot pass is pending if browser-launch permission is granted in a follow-up run.

### Addendum (2026-04-17) - Admin Sidebar Updated + Dashboard Cards Stabilized

Current scope update:
- Admin sidebar now reflects updated grouped navigation styling, and dashboard KPI cards are restored from broken state.

Progress made:
- Replaced old sidebar nav with sectioned modern layout while keeping admin route wiring intact.
- Updated icon font import to support the full sidebar icon set.
- Added sidebar section label utility style.
- Reverted first-row dashboard card wrappers to stable classes to resolve visual breakage.

Files touched this pass:
- `admin.html`
- `Claude_Notes/admin-dashboard-page.md`

Validation state:
- In-file structure validation complete.
- Screenshot automation remains pending due sandbox launch restrictions.

Known limitations:
- Visual screenshot comparison pass not completed in-session.

### Addendum (2026-04-17) - Admin Sidebar Branding Match + Commissions Nav Cleanup

Current scope update:
- Admin sidebar now uses user-dashboard brand-logo treatment at the top and no longer shows a separate `Commission Order` nav item.

Progress made:
- Swapped admin sidebar top branding block to the same logo-shell structure and interaction model as user sidebar.
- Added brand dropdown/collapse supporting CSS + JS hooks in admin.
- Removed `Commission Order` from sidebar nav so only `Commissions` is presented.
- Updated key visible headings/text to align around `Commissions` naming.

Files touched this pass:
- `admin.html`
- `Claude_Notes/admin-dashboard-page.md`

Validation state:
- selector/hook verification complete for sidebar/nav (`#sidebar-brand-button`, `#sidebar-brand-menu`, `#sidebar-collapse-button`, `[data-nav-link]`).
- visual screenshot validation still pending due browser-launch restrictions in this environment.

Known limitations:
- commission request detail subview remains in code for operational fulfillment; navigation entry is now unified under `Commissions`.

### Addendum (2026-04-17) - Logo Parity Hotfix (Admin Sidebar)

Current scope update:
- Admin sidebar top logo now matches user dashboard sidebar logo dimensions exactly.

Progress made:
- Replaced reduced admin logo-shell sizing with exact user-sidebar values.
- Synced logo image max-height/transform values to user-sidebar baseline.
- Aligned top brand dropdown labels/options to user-sidebar structure.

Files touched this pass:
- `admin.html`
- `Claude_Notes/admin-dashboard-page.md`

Validation state:
- direct selector/value comparison completed against `index.html`.
- screenshot validation still pending due local browser-launch restrictions.

### Addendum (2026-04-17) - Sidebar Nav Cleanup: Binary Tree (Old) Removed

Current scope update:
- Both Admin and Member sidebars now show only `Binary Tree (Next Gen)` under Build.

Progress made:
- Removed legacy Binary Tree sidebar links from `admin.html` and `index.html`.
- Kept existing route/state mappings untouched to avoid functional regressions outside nav visibility.

Files touched this pass:
- `admin.html`
- `index.html`
- `Claude_Notes/admin-dashboard-page.md`
- `Claude_Notes/member-dashboard-page.md`

Validation state:
- Confirmed no `Binary Tree (Old)` string remains in admin/member dashboard HTML files.

### Addendum (2026-04-17) - Route Cleanup: Legacy Binary Tree Paths Retired

Current scope update:
- Legacy old-tree dashboard routes are retired from both Admin and Member SPA route maps.
- `Binary Tree (Next Gen)` is now labeled `Binary Tree` in both sidebars.

Progress made:
- Removed `/admin/BinaryTree` and `/BinaryTree` from dashboard route-map objects.
- Removed `binary-tree` entries from page metadata maps to prevent legacy page-state activation through persisted route state.
- Added explicit route guards for `/binarytree`, `/binary-tree`, `/admin/binarytree`, `/admin/binary-tree` to route users to dashboard.

Files touched this pass:
- `admin.html`
- `index.html`
- `Claude_Notes/admin-dashboard-page.md`
- `Claude_Notes/member-dashboard-page.md`

Validation state:
- Verified no legacy old-tree route-map entries remain in admin/member dashboard HTML.
- Verified official sidebar label now reads `Binary Tree`.

### Addendum (2026-04-17) - Binary Tree Boot Loading Copy Refresh

Current scope update:
- Binary Tree Next boot loading text now uses motivational language instead of technical camera/node-state wording.

Progress made:
- Updated loading subtitle copy in `binary-tree-next.html`.
- Removed `Preparing nodes and camera state...` from the boot overlay.

Files touched this pass:
- `binary-tree-next.html`
- `Claude_Notes/binary-tree-next.md`

Validation state:
- In-file text verification complete for loading subtitle replacement.

Known limitations:
- Copy-only update; loading behavior, transitions, and timing remain unchanged.

### Addendum (2026-04-21) - Billing System Migration Progress: Stripe-Hosted Portal + Invoice Sync

Current scope update:
- Billing architecture is now in hybrid state by design:
- Internal DB invoice/activity history remains first-party in app.
- Stripe now handles hosted billing management, payment methods, and hosted invoice artifacts (invoice pages/PDF links).

Progress made this pass:
- Completed audit-first implementation pass across billing/order/invoice/Stripe stack.
- Added reliable user->Stripe customer mapping persistence in `charge.member_users` (runtime schema extension + lookup/update helpers).
- Added Stripe billing portal API for authenticated members and wired settings UI launch action.
- Enabled Checkout Session invoice creation in both:
- storefront checkout
- member enrollment checkout
- Added Stripe webhook endpoint with signature verification and event sync delegation.
- Added invoice Stripe-reference synchronization pipeline to keep internal activity/order records up to date from Stripe lifecycle events.
- Refactored existing completion logic incrementally (did not discard existing invoice creation/activity credit flows).

Files touched this pass:
- `backend/app.js`
- `backend/controllers/auth.controller.js`
- `backend/controllers/stripe-webhook.controller.js`
- `backend/routes/auth.routes.js`
- `backend/routes/stripe-webhook.routes.js`
- `backend/services/auth.service.js`
- `backend/services/invoice.service.js`
- `backend/services/member.service.js`
- `backend/services/store-checkout.service.js`
- `backend/services/stripe-client.service.js`
- `backend/services/stripe-webhook.service.js`
- `backend/stores/invoice.store.js`
- `backend/stores/user.store.js`
- `index.html`

Validation state:
- `node --check` passed for all modified backend JS files.
- Internal invoice table reuse preserved; no new billing table added.
- Existing app-side Recent Activity and invoice feed paths remain intact and continue to read internal DB invoice records.

Operational notes:
- New required env: `STRIPE_WEBHOOK_SECRET`.
- Webhook route is mounted before JSON middleware to preserve raw body for Stripe signature verification.

Known limitations:
- No separate processed-webhook-event ledger table yet; idempotency is currently enforced via existing invoice/session/payment-intent identifiers and update semantics.
- Final production behavior of portal features depends on Stripe Dashboard billing portal configuration.

### Addendum (2026-04-21) - Member Sidebar Billing Access Move (Invoice)

Current scope update:
- Member dashboard billing-portal entry now lives in left sidebar Records section as `Invoice` (replacing the empty `Purchases` nav item).

Progress made:
- Replaced sidebar label/icon and added dedicated click target id (`sidebar-invoice-portal-link`).
- Removed duplicate Settings Payment portal-launch button.
- Rebound Stripe portal launch listener to the new sidebar entry using existing billing portal API helper.

Files touched this pass:
- `index.html`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`
- `Claude_Notes/member-dashboard-page.md`

Validation state:
- Confirmed no remaining `settings-billing-portal-button` DOM id or JS listener references in `index.html`.
- Confirmed sidebar nav now shows `Invoice` with `open_in_new` icon.

## Update (2026-04-21) - Stripe Connect Payout Pipeline Added (App-Owned Ledger + $20 Rule)

- Completed:
  - extended payout backend from legacy `Pending/Fulfilled` to app-owned states (`Requested`, `Processing`, `Paid`, `Failed`, `Cancelled`) while preserving legacy compatibility.
  - enforced centralized backend payout validation:
    - minimum request amount = `$20` (configurable via env)
    - request amount cannot exceed requestable balance (`wallet - open requests`)
    - Stripe Connect onboarding + payouts-enabled checks required before request creation.
  - refactored E-Wallet payout request flow to use centralized payout service logic.
  - integrated Stripe Connect transfer execution for payout fulfillment and mode route compatibility (`/api/admin/payout-requests/fulfill/:mode`).
  - extended Stripe webhook sync with `account.updated` and `transfer.reversed` handling.
  - added E-Wallet member UI for payout account status, onboarding action, requestable-balance visibility, payout request history, and `$20` request messaging.
- Outcome:
  - app/database remains source-of-truth for earnings, request lifecycle, and payout history.
  - Stripe is used for recipient onboarding/account infrastructure and payout transfer execution.
- Files updated:
  - `backend/services/payout.service.js`
  - `backend/services/wallet.service.js`
  - `backend/services/stripe-client.service.js`
  - `backend/services/stripe-webhook.service.js`
  - `backend/controllers/payout.controller.js`
  - `backend/routes/payout.routes.js`
  - `backend/services/admin.service.js`
  - `index.html`
  - `admin.html`
  - `Claude_Notes/member-dashboard-page.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check` passed for updated backend modules/routes/controllers.
  - inline script parse checks passed for `index.html` and `admin.html`.

### Addendum (2026-04-21) - Payout Stripe Availability Error-Handling Hardening

Current scope update:
- Payout validation now handles Stripe unavailability/configuration failures with explicit service responses rather than generic server errors.

Progress made:
- Added guard in `backend/services/payout.service.js` around Stripe Connect status resolution for payout eligibility checks.
- Failure path now returns structured `503` payout response with explicit error message.

Files touched this pass:
- `backend/services/payout.service.js`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`
- `Claude_Notes/member-dashboard-page.md`

Validation state:
- `node --check backend/services/payout.service.js` passed.

### Addendum (2026-04-21) - Payout Request Endpoint Auth Hardening

Current scope update:
- Payout submission endpoint now enforces authenticated member identity server-side.

Progress made:
- Added `requireMemberAuthSession` on `POST /api/e-wallet/request-payout`.
- Updated payout-request controller to bind identity fields from `req.authenticatedMember`.

Files touched this pass:
- `backend/routes/wallet.routes.js`
- `backend/controllers/wallet.controller.js`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`
- `Claude_Notes/member-dashboard-page.md`

Validation state:
- `node --check` passed for modified wallet route/controller files.

### Addendum (2026-04-21) - Payout History Endpoint Auth Binding

Current scope update:
- Payout-history read path now enforces authenticated member scope.

Progress made:
- Added `requireMemberAuthSession` on `GET /api/payout-requests`.
- Updated payout controller read logic to prioritize authenticated member identity over query identity fields.
- Updated member dashboard payout-history fetch to send bearer token.

Files touched this pass:
- `backend/routes/payout.routes.js`
- `backend/controllers/payout.controller.js`
- `index.html`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`
- `Claude_Notes/member-dashboard-page.md`

Validation state:
- `node --check` passed for updated payout route/controller.
- `index.html` inline script parse check passed.

### Addendum (2026-04-21) - Direct Payout Create Route Auth Binding

Current scope update:
- Direct payout-request creation endpoint now enforces member auth scope.

Progress made:
- Added `requireMemberAuthSession` on `POST /api/payout-requests`.
- Updated payout-create controller to derive identity fields from authenticated member context.

Files touched this pass:
- `backend/routes/payout.routes.js`
- `backend/controllers/payout.controller.js`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`
- `Claude_Notes/member-dashboard-page.md`

Validation state:
- `node --check` passed for updated payout route/controller.

### Addendum (2026-04-21) - Instant Stripe Payout Fulfillment Enabled

Current scope update:
- Stripe payout requests now process in instant mode by default after backend validation.

Progress made:
- Added immediate auto-fulfillment call in payout-request creation service path.
- Added config gate `PAYOUT_AUTO_FULFILL_ENABLED` (default ON).
- Removed required bank-details validation blocker in admin fulfillment form for Stripe workflows.
- Updated member payout success/activity UX to display paid/processed state when instant Stripe fulfillment succeeds.

Files touched this pass:
- `backend/services/payout.service.js`
- `admin.html`
- `index.html`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`
- `Claude_Notes/member-dashboard-page.md`

Validation state:
- `node --check backend/services/payout.service.js` passed.
- Inline script parse checks passed (`index.html`, `admin.html`).

### Addendum (2026-04-21) - Stripe Payout Auto-Retry Activation

Current scope update:
- Stripe-mode payout fulfillments now auto-retry on temporary insufficient-funds failures, without backend restarts.

Progress made:
- Added retry sweep service in backend/services/payout.service.js with capped attempts, exponential backoff, and retry metadata in payout status history.
- Added startup interval worker in backend/app.js using resolvePayoutAutoRetryIntervalMs() and retryEligibleFailedStripePayoutRequests().
- Added webhook acceleration path in backend/services/stripe-webhook.service.js so balance.available triggers an immediate forced retry sweep.

Files touched this pass:
- backend/services/payout.service.js
- backend/app.js
- backend/services/stripe-webhook.service.js
- Claude_Notes/charge-documentation.md
- Claude_Notes/Current Project Status.md
- Claude_Notes/member-dashboard-page.md

Validation state:
- node --check backend/services/payout.service.js passed.
- node --check backend/app.js passed.
- node --check backend/services/stripe-webhook.service.js passed.
### Addendum (2026-04-21) - Stripe Dashboard Access from E-Wallet

Current scope update:
- Added direct Stripe Express dashboard access from the member E-Wallet payout account panel.

Progress made:
- Added backend member-auth endpoint for Stripe dashboard login-link issuance.
- Added Stripe Connect dashboard login-link service path using Express `createLoginLink`.
- Added E-Wallet `Stripe Dashboard` button with authenticated API call and status-aware enable/disable behavior.
- Kept existing onboarding action and payout-account status flow intact.

Files touched this pass:
- `backend/services/stripe-client.service.js`
- `backend/services/auth.service.js`
- `backend/controllers/auth.controller.js`
- `backend/routes/auth.routes.js`
- `index.html`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`
- `Claude_Notes/member-dashboard-page.md`

Validation state:
- `node --check backend/services/stripe-client.service.js` passed.
- `node --check backend/services/auth.service.js` passed.
- `node --check backend/controllers/auth.controller.js` passed.
- `node --check backend/routes/auth.routes.js` passed.
- `index.html` inline script parse checks passed.
### Addendum (2026-04-21) - Stripe Dashboard Open Path UX Correction

Current scope update:
- Corrected E-Wallet Stripe management action so connected/ready accounts open Stripe dashboard directly.

Progress made:
- Changed ready-state payout-account action label to `Manage Stripe`.
- Updated ready-state primary action handler to open Stripe dashboard instead of status refresh.
- Removed silent status refresh on dashboard-open failure to avoid misleading `checking status` behavior.

Files touched this pass:
- `index.html`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`
- `Claude_Notes/member-dashboard-page.md`

Validation state:
- `index.html` inline script parse checks passed.
### Addendum (2026-04-21) - Stripe Transfer + Payout Fulfillment Path

Current scope update:
- Stripe-mode admin/auto fulfillment now creates a connected-account payout after transfer creation to better align payout request amounts with bank payout records.

Progress made:
- Added connected-account payout creation helper in Stripe client service.
- Updated payout execution flow to support configurable payout creation and payout method (`instant` default).
- Added payout webhook synchronization (`payout.paid`, `payout.failed`, `payout.canceled`) and wallet restoration on failed paid requests.
- Added payout-request lookup by transfer reference for stronger Stripe event correlation.

Files touched this pass:
- `backend/services/stripe-client.service.js`
- `backend/services/payout.service.js`
- `backend/stores/payout.store.js`
- `backend/services/stripe-webhook.service.js`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`
- `Claude_Notes/member-dashboard-page.md`

Validation state:
- `node --check backend/services/stripe-client.service.js` passed.
- `node --check backend/services/payout.service.js` passed.
- `node --check backend/stores/payout.store.js` passed.
- `node --check backend/services/stripe-webhook.service.js` passed.

### Addendum (2026-04-21) - Member Payout Method Picker Enabled

Current scope update:
- Members can now choose payout speed (`Instant` or `Standard`) directly in the E-Wallet payout request modal.

Progress made:
- Added payout method selector to the modal UI without introducing fee arithmetic.
- Wired selected `payoutMethod` from frontend payload to backend E-Wallet payout request handling.
- Passed selected method into payout auto-fulfillment so Stripe payout execution honors member selection.

Files touched this pass:
- `index.html`
- `backend/services/wallet.service.js`
- `backend/services/payout.service.js`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`
- `Claude_Notes/member-dashboard-page.md`

Validation state:
- `node --check backend/services/wallet.service.js` passed.
- `node --check backend/services/payout.service.js` passed.
- `index.html` inline script parse check passed.

## Recent Update (2026-04-22) - Stripe Tax Manager Cutover for Checkout Flows

- Completed:
  - removed hardcoded enrollment tax-rate logic from backend and Binary Tree enrollment preview.
  - enabled Stripe automatic tax on hosted Checkout Sessions for:
    - member enrollment checkout
    - storefront/public checkout.
  - upgraded enrollment PaymentIntent flow to use Stripe Tax Calculations + PaymentIntent tax hooks.
  - updated checkout/cart UI labels to present pre-tax totals as estimates and tax as Stripe-calculated at checkout.
- Outcome:
  - tax collection source moved from app hardcode to Stripe Tax manager for active checkout paths.
  - final tax/total is now determined by Stripe using customer billing/shipping context.
- Files updated:
  - `backend/services/member.service.js`
  - `backend/services/store-checkout.service.js`
  - `binary-tree-next-app.mjs`
  - `binary-tree-next.html`
  - `store.html`
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`
  - `Claude_Notes/public-store-page.md`
- Validation:
  - `node --check backend/services/member.service.js` passed.
  - `node --check backend/services/store-checkout.service.js` passed.
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-22) - Member Store BV Credit Regression Fixed

- Completed:
  - fixed known-member guest checkout settlement classification in `backend/services/store-checkout.service.js` by wiring `hasKnownBuyerIdentity` into settlement profile resolution.
  - added checkout-finalization fallback to recover buyer BV from `invoice_bv` when legacy metadata carries `buyer_bv=0` despite known buyer identity.
  - executed one-time recovery completion for paid session of `zeroone`.
- Outcome:
  - Personal BV credit now applies for member-dashboard store purchases in guest checkout mode when buyer identity is known.
  - `zeroone` corrected from `1000` to `1038` Personal BV and missing invoice `INV-240930` is recorded.
- Files updated:
  - `backend/services/store-checkout.service.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`
- Validation:
  - `node --check backend/services/store-checkout.service.js` passed.
  - DB and checkout completion verification passed for recovered session.

## Recent Update (2026-04-22) - Store Checkout Return Finalization Race Fixed

- Completed:
  - fixed checkout-return timing race in `index.html` by invoking hosted checkout return finalization at the start of `initMyStore()`.
  - removed delayed duplicate return handling that ran after multiple async store initialization calls.
  - backfilled latest missed paid session for `zeroone` (`INV-240931`) to restore BV credit.
- Outcome:
  - checkout return params are now consumed before route-sync replace removes URL query data.
  - paid My Store checkouts reliably finalize and apply BV.
  - `zeroone` Personal BV now `1076` (includes two recovered +38 store purchases).
- Files updated:
  - `index.html`
  - `backend/services/store-checkout.service.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`
- Validation:
  - completion API path returned successful buyer credit for session `cs_test_a1SrK24VGJdlzv9ziDE7TPPQFUTkFSXWT4yo1XhvAU60mdodWcpSIbozOW`.
  - DB verification passed for updated BV and invoice rows.

## Recent Update (2026-04-22) - Duplicate Store BV Credit Race Fixed

- Completed:
  - added DB advisory lock in `backend/services/store-checkout.service.js` for per-invoice checkout settlement (`store-checkout:${invoiceId}`).
  - serialized concurrent webhook/return completion paths to prevent duplicate `recordMemberPurchase` crediting.
  - corrected overcredited `zeroone` PV/BV by reverting one extra `+38` from `INV-240932`.
- Outcome:
  - one paid checkout now applies BV once even when multiple completion triggers fire.
  - `zeroone` corrected to expected `1114` Personal BV.
- Files updated:
  - `backend/services/store-checkout.service.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`
- Validation:
  - `node --check backend/services/store-checkout.service.js` passed.
  - DB verification confirmed corrected `zeroone` BV state.

## Recent Update (2026-04-22) - Residual BV Reconciliation Completed

- Completed:
  - audited posted invoice BV totals for `zeroone` after new paid checkout `INV-240933`.
  - reconciled residual historical over-credit (`+38`) so account totals match posted invoices.
  - updated both member records to synchronized BV values.
- Outcome:
  - `zeroone` now matches posted invoice sum exactly at `1152` Personal BV.
  - current settlement path remains protected by per-invoice advisory lock and no new profile-based double-credit was found.
- Files/records updated:
  - `charge.member_users` (`current_personal_pv_bv`, `starter_personal_pv`)
  - `charge.registered_members` (`starter_personal_pv`)
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - posted `store_invoices.bp` total for `zeroone`: `1152`
  - verified:
    - `member_users.current_personal_pv_bv=1152`
    - `member_users.starter_personal_pv=1152`
    - `registered_members.starter_personal_pv=1152`

## Recent Update (2026-04-22) - My Store Client PV Reconcile Path Disabled

- Completed:
  - traced new `+76` jump (`1152 -> 1228`) to client-side reconciliation logic in `index.html`.
  - removed `initMyStore()` invocation of `reconcileExistingStorePurchasePv()` that was issuing `/api/member-auth/record-purchase` after invoice load.
  - reconciled `zeroone` BV values back to posted-invoice truth.
- Outcome:
  - My Store checkout BV credits are now backend-settlement-only (single authority).
  - stale frontend session snapshots can no longer trigger an extra PV top-up after Stripe return.
  - `zeroone` is now aligned with posted invoices at `1190` Personal BV.
- Files/records updated:
  - `index.html`
  - `charge.member_users`
  - `charge.registered_members`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`
- Validation:
  - latest posted invoice: `INV-240934` (`bp=38`, paid)
  - posted invoice BV sum for `zeroone`: `1190`
  - verified:
    - `member_users.current_personal_pv_bv=1190`
    - `member_users.starter_personal_pv=1190`
    - `registered_members.starter_personal_pv=1190`

## Recent Update (2026-04-22) - Personal BV Card Live Refresh Fixed

- Completed:
  - added post-checkout session sync in `index.html` via `syncSessionAfterStoreCheckoutCompletion(...)`.
  - wired hosted checkout success flow to refresh session from `/api/member-auth/session` and reapply UI patching.
- Outcome:
  - Personal BV card updates immediately after successful store checkout return.
  - manual page reload is no longer required to see the updated value.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`
- Validation:
  - checkout return handler now executes session sync and `applySessionUserPatch(...)` after invoice refresh.

## Recent Update (2026-04-22) - Preferred Account Owner BV Credit Routing Fixed

- Completed:
  - patched store owner resolver to prioritize `storeCode/publicStoreCode` over shared `attributionStoreCode`.
  - applied same owner-resolution rules in:
    - `backend/services/store-checkout.service.js`
    - `backend/services/invoice.service.js`
  - corrected miscomputed preferred-purchase invoice `INV-240937` and applied missing owner BV recovery.
- Outcome:
  - preferred customer purchases now settle using the actual store owner package (legacy owner now gets `38 BV`, not `50` from wrong package mapping).
  - owner BV credit is applied to the correct account instead of being absorbed by a preferred/downline attribution match.
  - `zeroone` updated to `1304` Personal BV after one-time recovery.
- Files/records updated:
  - `backend/services/store-checkout.service.js`
  - `backend/services/invoice.service.js`
  - `charge.store_invoices` (`INV-240937`)
  - `charge.member_users` / `charge.registered_members` (owner recovery credit)
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`
  - `Claude_Notes/public-store-page.md`
- Validation:
  - simulated preferred checkout now returns `ownerBv=38` and `settlementPackageKey=legacy-builder-pack`.
  - `node --check` passed for both patched backend services.

## Recent Update (2026-04-22) - Preferred Customer Dashboard Data Linkage Fixed

- Completed:
  - patched preferred planner invoice matcher in `index.html` to include email-based identity linkage for preferred guest checkouts.
  - retained stable ID/username matching while gating email fallback to preferred-buyer invoices.
- Outcome:
  - Preferred Customer planner now surfaces valid preferred purchase invoices that were previously omitted.
  - corrected invoice `INV-240937` now links to preferred member `usertesting` in planner data.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`
- Validation:
  - inline script syntax checks passed for `index.html`.
  - live-data match simulation confirms `usertesting -> INV-240937`.

## Recent Update (2026-04-22) - Retail Attribution + Checkout Refresh Finalization

- Completed:
  - hardened checkout attribution for Preferred-buyer dashboard purchases when `storeCode` is omitted.
  - updated My Store checkout payload to always send routed attribution store code.
  - extended post-checkout sync to reload registered members so dashboard/tree cards refresh immediately.
- Outcome:
  - Preferred discounted purchases now consistently resolve owner settlement context (BV/retail routing).
  - checkout success updates session + member-tree dependent cards without manual reload.
- Files updated:
  - `backend/services/store-checkout.service.js`
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`
  - `Claude_Notes/public-store-page.md`
- Validation:
  - `node --check backend/services/store-checkout.service.js` passed.
  - inline script parse check passed for `index.html`.

## Recent Update (2026-04-24) - Mobile Main Panel Surface Drag Enabled

- Completed:
  - enabled mobile side-sheet stage drag from panel surface (in addition to the handle)
  - preserved normal button taps by skipping surface-drag capture over actionable controls
  - added drag-source handling so surface taps do not accidentally trigger snap-state toggles
  - added FULL-stage top-region drag gate for controlled collapse gestures.
- Outcome:
  - mobile vertical swipe gestures on the main panel now move sheet stage naturally (up to expand, down to collapse), closer to native maps-style interaction.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-24) - Mobile Main Panel Scroll Reachability (Details -> Member Status)

- Completed:
  - restored Member Status block below Details in mobile side panel
  - added vertical content scrolling in FULL stage for main panel content stack
  - added drag handoff: if content is at top and user drags down, gesture transitions to sheet collapse behavior
  - integrated content-scroll drag state into pointer/touch gesture lifecycle.
- Outcome:
  - users can now scroll down in FULL mobile panel to reach Member Status and lower content areas.
  - collapse gestures still feel native when dragging down from top-of-content state.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-24) - Mobile Scroll Region Includes Search Row + Full Top-Right Edge Flush

- Completed:
  - moved mobile content-scroll start to Search row (search -> favorites -> details -> member status now scroll together)
  - ensured search input overlay rect follows scroll offset
  - removed top-right radius in FULL mobile sheet stage.
- Outcome:
  - user can scroll the entire main panel stack from Search section downward.
  - FULL stage now has flush top-right edge (no rounded corner).
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-24) - Mobile Scroll Covers Entire Control Stack

- Completed:
  - included mobile action button rows in full-stage content scroll stack
  - kept handle as stage-control anchor while all rows below it scroll together
  - removed top border radius on both left/right corners during FULL stage.
- Outcome:
  - mobile vertical scroll now moves the full panel control/content stack (buttons + search + favorites + details + member status).
  - full-stage top edge is now square.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-24) - Mobile Shortcut Button Placement Reverted to External Top-Right

- Completed:
  - removed panel shortcut row (Account/Rank/Preferred/Legacy) from mobile center sheet
  - restored those shortcuts as external top-right floating cluster
  - added full-stage suppression so the external cluster is not visible when sheet is `FULL`
  - corrected favorites section vertical anchor math to align with search-row baseline.
- Outcome:
  - center sheet now keeps navigation/search/favorites/details/member-status layout without embedded panel shortcut row.
  - panel shortcut controls return to top-right external position and hide in FULL stage.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-24) - Mobile Shortcut Press Forces FULL Stage

- Completed:
  - wired mobile top-right shortcut actions (Account/Rank/Preferred/Legacy) to auto-force center panel `FULL` stage before panel toggle/view action executes.
- Outcome:
  - users can immediately scroll content after pressing shortcut buttons without manually expanding sheet.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-24) - Legacy Shortcut Kept Distinct + Full-Stage Square Buttons

- Completed:
  - removed Legacy Leadership shortcut from mobile auto-expand-to-`FULL` action guard
  - kept auto-`FULL` behavior for Account Overview, Rank Advancement, and Preferred Accounts
  - applied mobile `FULL` square-corner styling to center-panel action controls (toggle/nav/pin)
  - aligned top-right shortcut render logic so non-legacy buttons follow no-radius full-stage style intent while legacy remains distinct.
- Outcome:
  - Legacy button behavior is now separated from the other shortcut actions.
  - full-stage mobile action controls visually match the center panel's square-edge treatment.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-24) - Full-Stage Overlay Corners Removed for Account/Rank/Preferred

- Completed:
  - added sheet-stage-scoped CSS override so `Account Overview`, `Rank Advancement`, and `Preferred Accounts` panel shells render with `border-radius: 0` in `FULL` stage.
- Outcome:
  - requested mobile full-stage panel look now matches square-edge center panel style for these three overlays.
- Files updated:
  - `binary-tree-next.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`
- Validation:
  - selector block verified in stylesheet under `data-tree-next-sheet-stage="full"`.

## Recent Update (2026-04-24) - Account/Rank/Preferred Overlays Now Fullscreen in Mobile FULL Stage

- Completed:
  - introduced fullscreen frame mode in mobile overlay resolver for `FULL` stage.
  - enabled fullscreen mode for Account Overview, Rank Advancement, and Preferred Accounts panel sync paths.
  - removed card chrome in full-stage CSS for those three overlays (`border`, `radius`, `shadow`).
- Outcome:
  - these overlays now occupy the full mobile viewport in `FULL` stage, preventing the underlying center panel from showing around them.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `binary-tree-next.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-24) - Mobile Center Nav Buttons Externalized + Pin Rounding Restored

- Completed:
  - removed in-panel mobile action row (back/home/enter/deep) from center sheet.
  - added those actions as a top-right external horizontal button row in mobile toolbar.
  - restored `Pin` button border radius (rounded style) in center panel.
- Outcome:
  - center panel is less crowded and starts with search content.
  - navigation actions now live outside the panel at top-right as requested.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-24) - Mobile Nav Row Now Tracks Center Panel Top In Lowered/Hidden States

- Completed:
  - repositioned external mobile nav row (`Back/Home/Enter/Deep`) from global top area to panel-top anchor behavior.
  - nav row now follows the center panel vertical position and shows only while sheet stage is non-`FULL`.
- Outcome:
  - nav buttons are no longer alongside top shortcut buttons.
  - nav controls now appear at the top of the lowered/hidden center panel as requested.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-24) - Hidden Center Panel Now Includes Search + Profile

- Completed:
  - added closed-stage external search bar and user profile icon for mobile center panel.
  - wired closed-stage search row to existing search input/dropdown rect sync.
  - removed closed-stage per-frame forced close/reset that blocked profile/search interactions.
- Outcome:
  - when center panel is hidden, users can still access search and profile controls directly.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-24) - Closed Mobile Search/Profile Now Render Inside Center Panel

- Completed:
  - relocated hidden/closed-stage search bar + profile icon into center panel draw path.
  - removed toolbar-level outside search/profile rendering for closed stage.
- Outcome:
  - closed panel now follows Apple Maps-style top strip inside the panel surface.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-24) - Mobile Closed Stage No Longer Clips Behind Browser Controls

- Completed:
  - replaced fixed closed-stage translate progress with dynamic closed-progress calculation.
  - incorporated visual viewport occlusion handling for mobile browser bottom controls.
  - applied dynamic upper-bound to snap/drag/spring/layout/backdrop paths.
- Outcome:
  - closed center panel now sits higher and remains visible above native browser chrome.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-24) - Mobile Top Toolbar Dock Show/Hide + Auto-Hide Defaults

- Completed:
  - added `Show/Hide` toggle for mobile top toolbar controls.
  - hidden mode now slides top rows toward/off the right edge to clear the canvas top area.
  - added context default hide for:
    - Legacy/Trinary canvas view
    - Node Universe (non-root).
  - preserved manual override so users can show controls again in those contexts.
- Outcome:
  - top area stays cleaner in deeper/alternate views while keeping controls quickly recoverable.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-24) - Mobile Toolbar Follow-up Scope Fix

- Completed:
  - fixed empty spacer/gap beside the lower `Back` row by correcting anchor logic.
  - limited `Show/Hide` behavior to top shortcut buttons only.
- Outcome:
  - lower nav row remains fully aligned and always visible.
  - toggle now affects only the intended top group.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-24) - Mobile Top Group Hide Behavior Finalized

- Completed:
  - converted top-group show/hide from positional shift to true visibility hide.
  - hidden top group is now fully removed from draw + interaction pass.
  - lower nav row remains unaffected and visible.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-24) - Mobile Favorites Section Clipping Resolved

- Completed:
  - introduced compact mobile-only favorites carousel sizing.
  - adjusted mobile favorites viewport insets/min-height for better fit.
  - preserved desktop favorites sizing/behavior.
- Outcome:
  - favorites avatar/label/subtitle stack no longer clips in mobile center panel.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-24) - Search Field Typography/Color Refinement

- Completed:
  - changed side-nav search input text weight to regular (400).
  - aligned placeholder styling and search icon tint with the same neutral text color.
- Outcome:
  - search bar now looks less bold and visually balanced with icon/text consistency.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

- Follow-up: ensured search-input style injection runs even when input element already exists.

## Recent Update (2026-04-24) - Mobile Search Typing Auto-Expands To FULL

- Completed:
  - wired mobile search `input` typing to auto-snap center panel to `FULL` stage.
- Outcome:
  - users can begin typing in search from lowered states and immediately get full panel space.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-24) - Search Focus Expansion Timing Corrected

- Completed:
  - mobile search now expands panel to `FULL` on press/focus, not on first typed character.
- Outcome:
  - panel expands before keyboard shift, matching expected native-style behavior.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-24) - Mobile Search Keyboard Reflow Stabilization

- Completed:
  - introduced viewport lock during search focus on mobile.
  - prevented keyboard-driven `innerHeight` shrink from reflowing canvas/panel layout upward.
  - released lock on search blur and refreshed canvas sizing.
- Outcome:
  - iPhone search interaction now feels more native/stable with reduced layout jump.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-24) - Closed-State Interaction Sequencing (Search/Profile)

- Completed:
  - mobile closed-state search tap now promotes panel to `FULL` before typing flow continues.
  - mobile closed-state profile icon tap now promotes panel to `FULL` before popup opens.
- Outcome:
  - interaction order now matches Apple Maps-style expectation in collapsed mode.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-24) - Search Tap Animation Refinement

- Completed:
  - changed closed-state search tap to animated `FULL` promotion with delayed focus handoff.
- Outcome:
  - removed instant jump; expansion now reads as intentional motion before typing.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-24) - Mobile Half/Full Continuity Improvements

- Completed:
  - aligned mobile `HALF`/`FULL` details sizing against full-stage reference height.
  - added mobile content viewport clipping for stable visual containment.
  - changed center panel top corners to progressive rounded->square morph during expansion.
- Outcome:
  - reduced noticeable layout jump in Details section while transitioning to `FULL`.
  - smoother panel transition aesthetics.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-24) - Center Panel Content Crossfade (Closed/Half)

- Completed:
  - implemented content crossfade between closed-strip and expanded panel content on mobile closed<->half transitions.
  - removed abrupt instant render/snap effect for inner content.
- Outcome:
  - transition now feels smoother and more native while preserving existing panel drag/snap behavior.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-24) - Favorites vs Panel Gesture Conflict Resolved

- Completed:
  - implemented favorites axis-intent lock and vertical handoff to panel gestures.
  - added favorites-region bypass options for drag/scroll starter functions during handoff.
- Outcome:
  - horizontal favorites carousel remains intact.
  - vertical panel grabbing/scrolling over favorites area is no longer disrupted.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-24) - Mobile Enroll Panel Stabilization

- Completed:
  - fixed mobile Enroll panel left anchoring to frame-left coordinates.
  - set explicit mobile enroll panel `height`/`maxHeight` from overlay frame for stable sizing.
  - forced mobile sheet to `FULL` stage before enroll modal opens.
- Outcome:
  - Enroll Member panel now opens with stable/fixed placement in mobile view.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - screenshot automation blocked by sandbox browser launch restriction (`spawn EPERM`).

## Recent Update (2026-04-24) - Overlay Close -> HALF Stage Consistency (Mobile)

- Completed:
  - added shared helper to restore mobile center panel to `HALF`.
  - wired Account Overview close path to restore `HALF`.
  - wired Preferred Accounts close path to restore `HALF`.
  - wired Enroll Member close path to restore `HALF`.
- Outcome:
  - default/home center-sheet state after these closes is now consistently `HALF`.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-24) - Mobile Canvas Touch Momentum Enabled

- Completed:
  - implemented touch velocity sampling for canvas pan drags.
  - added release inertia with friction-decay update in the frame loop.
  - added safe cancellation of inertia on new/competing interactions.
- Outcome:
  - mobile canvas swipe no longer stops instantly; it now glides and eases out.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-24) - Mobile Canvas Glide Strength Increased

- Completed:
  - lowered touch-inertia start threshold and stop threshold.
  - reduced damping for longer momentum tail.
  - switched launch velocity selection to include latest instant swipe sample.
  - added `pointercancel` release coverage.
- Outcome:
  - touch release glide is now much more apparent and map-like.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-24) - Rank Advancement Close Added To Mobile HALF Restore

- Completed:
  - wired Rank Advancement close transition to restore center sheet `HALF` state.
- Outcome:
  - all targeted overlays now share consistent close behavior in mobile.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-24) - Mobile Glide Release-Path Bug Fixed

- Completed:
  - narrowed inertia clear logic in `onPointerUp(...)` to active canvas-pan releases only.
  - guarded `onPointerLeave(...)` inertia clear so post-release momentum is not canceled.
- Outcome:
  - touch swipe glide now persists after release as intended.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-24) - Mobile Runtime FPS Governor + Frame Workload Cut

- Completed:
  - implemented adaptive mobile DPR governor with FPS-based tuning.
  - switched mobile canvas DPR selection to runtime-governed path.
  - removed hidden overlay panel visuals/position sync from per-frame render pass.
- Outcome:
  - lower mobile pixel workload and lower per-frame DOM/sync overhead.
  - improved path toward stable high-refresh rendering on capable phones.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-24) - Mobile FPS Phase 2 (Adaptive Frame Quality + DOM Sync Cost Reduction)

- Completed:
  - added mobile frame-quality profile resolver for adaptive LOD/depth/cull/connectors.
  - wired adaptive frame profile into `drawTreeViewport(...)` for non-legacy render path.
  - enabled `desynchronized: true` on main + offscreen canvas contexts.
  - reduced side-nav floating UI sync overhead via visibility/layout-key no-op guards.
- Outcome:
  - lower per-frame CPU/GPU pressure during mobile interaction and panning.
  - improved probability of maintaining high-refresh frame rates on capable devices.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-24) - Rolled Back Latest Mobile FPS Phase 2 Experiment

- Completed:
  - reverted latest Phase 2 FPS changes and restored prior behavior.
- Outcome:
  - project returned to earlier stable mobile interaction baseline before the latest experimental pass.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-24) - Mobile Canvas Sharpness Restored

- Completed:
  - added quality floor bounds to mobile DPR governor and tuned adaptation thresholds.
- Outcome:
  - reduced blurry/soft rendering of nodes and iconography on mobile.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-24) - User Enroll Member Package List Set To Paid Options Only

- Completed:
  - removed `Free Account - $0` from user dashboard Enroll Member package dropdown (`#enroll-member-package`).
  - removed `Free Account - $0` from tree enroll modal package dropdown (`#tree-enroll-package`).
- Outcome:
  - user-side enrollment package UI now offers paid builder packages only.
- Files updated:
  - `index.html`
  - `Claude_Notes/member-dashboard-page.md`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Design decision:
  - retained free-account package metadata/logic for compatibility with existing records and non-UI flows.
- Known limitation:
  - this update does not remove backend support for preferred/free account package keys; it only removes the user-facing selection option.
- Validation:
  - verified no `Free Account - $0` option remains in the two user-side enrollment package selectors in `index.html`.

## Recent Update (2026-04-25) - Membership Placement Reservation + Pending State Rollout

- Completed:
  - implemented new package `membership-placement-reservation` (`$49.99`) across user enrollment UI and tree-next enrollment flows.
  - added `Pending` account behavior for reservation members with dashboard/tree visibility preserved.
  - added centralized backend capability checks and blocked pending/reservation users from:
    - member enrollment/sponsorship mutations
    - store attribution + preferred attribution ownership
    - commission transfer and payout request flows
    - business center sync/activation mutations
  - enforced server responses with `403` + `Account upgrade required.` for restricted actions.
  - enabled clear pending upgrade prompts in dashboard/tree/store/business-center UI paths.
  - added reservation option to `binary-tree-next.html` package select.
  - fixed upgrade edge case where a reservation account could remain `pending` after paid package upgrade.
- Outcome:
  - reservation members can hold tree position and access view surfaces without participating in earnings/growth until upgrade.
  - active/inactive behavior for existing paid packages remains intact.
- Files updated:
  - `backend/utils/member-capability.helpers.js`
  - `backend/utils/member-activity.helpers.js`
  - `backend/services/member.service.js`
  - `backend/services/store-checkout.service.js`
  - `backend/services/invoice.service.js`
  - `backend/services/preferred-attribution.service.js`
  - `backend/services/payout.service.js`
  - `backend/services/wallet.service.js`
  - `backend/services/member-business-center.service.js`
  - `index.html`
  - `binary-tree-next-app.mjs`
  - `binary-tree-next.html`
- Validation:
  - backend service/helper syntax checks passed via `node --check`.
  - `node --check binary-tree-next-app.mjs` passed.
- Known limitation:
  - broader admin-only package catalogs were not expanded in this pass; scope remained member/dashboard/tree/store/commission runtime paths.

## Recent Update (2026-04-25) - Pending Reservation: Dashboard Rank Hidden + Upgrade Toast On Enroll/Preferred Clicks

- Completed:
  - pending reservation users now show `Rank: --` in the dashboard `Account Active Until` card.
  - added a compact toast system for upgrade-required actions.
  - pending click attempts to `Enroll Member` / `Preferred Customers` now show toast `Account Upgrade Required.` while preserving redirect-to-dashboard guard.
  - nav click path now passes explicit toast-intent flag so auto-route guards do not trigger unnecessary toast noise.
- Outcome:
  - reservation/pending UX now matches expected behavior: no paid-rank display in that KPI and clear toast feedback on restricted growth actions.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`
- Validation:
  - inline script parse/compile check passed for `index.html`.

## Recent Update (2026-04-25) - Pending Upgrade Toast Repositioned + Warning Theme

- Completed:
  - moved upgrade-required toast from top-right to bottom-center/below-center layout.
  - updated toast visual treatment to red warning style for stronger restricted-action feedback.
- Outcome:
  - pending users now receive centered, high-visibility warning toast when blocked from enrollment-related pages.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`
- Validation:
  - inline script parse/compile check passed for `index.html`.

## Recent Update (2026-04-25) - Upgrade Toast Font Color Set To White

- Completed:
  - changed pending upgrade-required toast text color to white.
- Outcome:
  - improved toast contrast/readability against red warning background.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`
- Validation:
  - inline script parse/compile check passed for `index.html`.

## Recent Update (2026-04-25) - Upgrade Toast Display Time Extended

- Completed:
  - extended pending upgrade-required toast display duration from `2200ms` to `3200ms`.
- Outcome:
  - toast remains visible slightly longer for readability before fade.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`
- Validation:
  - inline script parse/compile check passed for `index.html`.

## Recent Update (2026-04-25) - Pending Restricted Nav Keeps Current Page

- Completed:
  - fixed restricted-nav flow so pending users are no longer forced back to Home when clicking `Enroll Member` or `Preferred Customers`.
  - nav clicks now preserve the current page and only show the upgrade-required toast.
  - quick-action restricted branch no longer performs dashboard redirect.
- Outcome:
  - cleaner UX: warning toast appears in-place on current screen.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`
- Validation:
  - inline script parse/compile check passed for `index.html`.

## Recent Update (2026-04-25) - Pending Reservation Hides Account-Until Badge Strip

- Completed:
  - badge strip under Dashboard `Account Active Until` now hides for reservation/pending users.
  - hovercard is also closed/disabled for this state.
- Outcome:
  - reservation users see cleaner account-until KPI without status badge row.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`
- Validation:
  - inline script parse/compile check passed for `index.html`.

## Recent Update (2026-04-25) - Reservation Dashboard Hides Business Centers + Fast Track Panel

- Completed:
  - added reservation-state dashboard panel visibility toggle.
  - pending users now hide:
    - Business Centers panel
    - Fast Track Bonus panel
- Outcome:
  - dashboard for reservation users is simplified and aligns with non-earning/non-participation state.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`
- Validation:
  - inline script parse/compile check passed for `index.html`.

## Recent Update (2026-04-25) - Upgrade Route Fast Track Logic Corrected For Reservation Path

- Completed:
  - audited the three upgrade routes (preferred->paid, reservation->paid, paid->paid).
  - fixed backend Fast Track condition so reservation->paid first upgrade now credits sponsor Fast Track.
  - kept paid->paid Fast Track disabled.
  - normalized upgrade response messages to `First paid upgrade...` wording.
- Outcome:
  - Fast Track behavior now matches route-policy requirements across all three upgrade paths.
- Files updated:
  - `backend/services/member.service.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check backend/services/member.service.js` passed.

## Follow-up Update (2026-04-25) - Upgrade Fast Track Attribution Fallback Added

- Completed:
  - added fallback sponsor resolution for first paid upgrade Fast Track credit.
  - if direct sponsor is missing, backend now resolves attribution owner by store code and uses that username as Fast Track recipient.
- Outcome:
  - upgrade Fast Track routing now supports direct sponsor or attributed owner.
- Files updated:
  - `backend/services/member.service.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
- Validation:
  - `node --check backend/services/member.service.js` passed.

## Recent Update (2026-04-25) - Upgrade Product Split Allocation Across Preferred Dashboard, Member Dashboard, and Binary Tree My Store

- Completed:
  - implemented split-product allocation for account upgrade gains (`MetaCharge` + `MetaRoast`) in upgrade checkout flows.
  - Binary Tree My Store and Preferred Dashboard upgrade checkouts now submit split `cartLines` instead of a single product line.
  - checkout metadata now carries `account_upgrade_selected_product_key` and backend upgrade finalization reads it.
  - `upgradeMemberAccount` now returns structured `upgrade.productAllocation` with selected/carryover quantities + split label.
  - member dashboard (`index.html`) upgrade success message now shows split summary when returned by backend.

- Split behavior implemented:
  - carryover product gets the quantity needed to reach half of the target package product total.
  - selected split product gets the remainder of the upgrade gain.
  - example: `3 -> 20` yields `+17` as `7 + 10` split.

- Files updated:
  - `binary-tree-next-app.mjs`
  - `binary-tree-next.html`
  - `store-dashboard.html`
  - `backend/services/store-checkout.service.js`
  - `backend/services/member.service.js`
  - `index.html`
  - docs updated in:
    - `Claude_Notes/charge-documentation.md`
    - `Claude_Notes/Current Project Status.md`
    - `Claude_Notes/binary-tree-next.md`
    - `Claude_Notes/preferred-dashboard-page.md`
    - `Claude_Notes/member-dashboard-page.md`
    - `Claude_Notes/BackEnd-Notes.md`

- Validation:
  - `node --check backend/services/member.service.js` passed.
  - `node --check backend/services/store-checkout.service.js` passed.
  - `node --check binary-tree-next-app.mjs` passed.
  - inline script parse checks passed for `store-dashboard.html` and `index.html`.

## Recent Update (2026-04-25) - Reservation My Store Checkout Enabled + Personal BV Credit

- Completed:
  - enabled `My Store` checkout for reservation/pending users on dashboard store flow.
  - enabled buyer personal BV credit for reservation users on successful store checkout.
  - preserved reservation account status as `Pending` after buyer BV credit writes.
  - kept reservation store-link copy/link-use restrictions unchanged.

- Outcome:
  - reservation users can buy products for personal consumption and receive personal BV credit without unlocking enrollment/sponsor/commission features.

- Files updated:
  - `index.html`
  - `backend/services/member.service.js`
  - `backend/services/store-checkout.service.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`
  - `Claude_Notes/public-store-page.md`

- Validation:
  - `node --check backend/services/member.service.js` passed.
  - `node --check backend/services/store-checkout.service.js` passed.
  - inline script parse check passed for `index.html`.

## Recent Update (2026-04-25) - Upgrade Product Modes (All MetaCharge / All MetaRoast / Split)

- Completed:
  - replaced forced split behavior with explicit 3-mode selection in upgrade flows.
  - Binary Tree My Store + Preferred Dashboard upgrade checkouts now support:
    - `All MetaCharge`
    - `All MetaRoast`
    - `Split Products`
  - checkout payloads now include `accountUpgradeProductMode` in addition to selected product key.
  - backend metadata + account-upgrade finalization now process and persist product mode.
  - member dashboard upgrade success feedback now uses neutral `Product allocation` wording.

- Outcome:
  - users can explicitly choose full single-product allocation or split allocation without losing existing split capability.

- Files updated:
  - `binary-tree-next.html`
  - `binary-tree-next-app.mjs`
  - `store-dashboard.html`
  - `backend/services/store-checkout.service.js`
  - `backend/services/member.service.js`
  - `index.html`
  - docs updated in:
    - `Claude_Notes/charge-documentation.md`
    - `Claude_Notes/Current Project Status.md`
    - `Claude_Notes/binary-tree-next.md`
    - `Claude_Notes/preferred-dashboard-page.md`
    - `Claude_Notes/member-dashboard-page.md`
    - `Claude_Notes/BackEnd-Notes.md`

- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - `node --check backend/services/store-checkout.service.js` passed.
  - `node --check backend/services/member.service.js` passed.
  - inline script parse checks passed for `store-dashboard.html` and `index.html`.

## Recent Update (2026-04-26) - Split Allocation Ownership Fix + Binary Tree Enrollment Product Capture

- Completed:
  - added explicit enrollment product selector in Binary Tree checkout flow (Step 2).
  - checkout summary now states selected product in Step 3.
  - enrollment payload + Stripe metadata now include `enrollmentProductKey`.
  - persisted `currentPackageProductKey` across user/member records.
  - account-upgrade split now uses stored owned product key for lesser/carryover quantity.

- Outcome:
  - split behavior now matches ownership scenario:
    - example: existing `3 MetaCharge` upgrading to Legacy and choosing split now yields `+7 MetaCharge +10 MetaRoast`.
  - all-single options (`All MetaCharge` / `All MetaRoast`) remain available.

- Files updated:
  - `binary-tree-next.html`
  - `binary-tree-next-app.mjs`
  - `backend/services/member.service.js`
  - `backend/stores/user.store.js`
  - `backend/stores/member.store.js`
  - `backend/utils/auth.helpers.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - `node --check backend/services/member.service.js` passed.
  - `node --check backend/stores/user.store.js` passed.
  - `node --check backend/stores/member.store.js` passed.
  - `node --check backend/utils/auth.helpers.js` passed.

## Recent Update (2026-04-26) - Binary Tree Review Layout Collision Cleanup

- Completed:
  - fixed My Store review card overlap between upgrade option buttons and `Checkout` button in Binary Tree panel.
  - replaced rigid two-column review layout with wrap-safe composition based on available panel width.
  - ensured side actions (price/BV/remove/checkout) move to a clean next row when horizontal room is not enough.

- Outcome:
  - review UI now keeps controls readable and non-overlapping across narrow desktop modal widths and mobile-sized panels.
  - checkout and product-option controls remain fully clickable without visual collisions.

- Files updated:
  - `binary-tree-next.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`

- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-26) - User Dashboard My Store Account Upgrades Added

- Completed:
  - added an `Account Upgrades` section in User Dashboard `My Store`.
  - implemented package selection UI for available upgrade tiers above current account package.
  - implemented product mode controls with exact naming:
    - `All MetaCharge™`
    - `All MetaRoast™`
    - `Split Products`
  - enforced split visibility/availability by target package:
    - split hidden for Personal target upgrades
    - split available for Business/Infinity/Legacy upgrades.
  - added ownership-aware split allocation preview labels in My Store upgrade summary.
  - wired dedicated Stripe checkout for upgrades from My Store using account-upgrade metadata fields.
  - updated hosted checkout post-finalization sync to apply returned upgraded user payload to dashboard session.

- Outcome:
  - members can now process account upgrades directly from My Store in `index.html`, consistent with other upgrade-enabled surfaces.
  - upgrade selection and allocation behavior now supports all/single product options plus split mode with current ownership rules.

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`

- Validation:
  - inline script parse check passed for `index.html`.

## Recent Update (2026-04-26) - Weekly Cutoff Loop Metrics Aligned in UI

- Completed:
  - switched member dashboard loop displays (cycles + left/right BV summary cards) to cutoff-consumed current-week values.
  - integrated Binary Tree Next account overview sync with `/api/member/server-cutoff-metrics`.
  - updated Binary Tree selected-node detail panel (`Left Leg`, `Right Leg`, `Cycles`) to show cutoff-consumed values for the signed-in member node.
  - preserved historical/lifetime metrics displays and raw snapshot persistence behavior to avoid backend carry-forward regression.

- Outcome:
  - users no longer see raw lifetime leg totals in loop-facing areas right after cutoff consumption.
  - loop displays now match expected post-cutoff consumed state (including valid carry-forward remainders).

- Files updated:
  - `index.html`
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-26) - Account Activity + Payout Eligibility Hardening

- Completed:
  - replaced month-anchored account activity window logic with strict rolling `30-day` windows in activity helpers.
  - enforced inactive-account blocking in payout request and payout fulfillment workflows.
  - aligned capability gating so `pending-password-setup` is treated as pending.

- Outcome:
  - account activity duration no longer drifts by calendar month length.
  - inactive members cannot submit/fulfill payout flows until active again.
  - status labeling and pending-capability gates are now consistent.

- Files updated:
  - `backend/utils/member-activity.helpers.js`
  - `backend/services/payout.service.js`
  - `backend/utils/member-capability.helpers.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `node --check backend/utils/member-activity.helpers.js` passed.
  - `node --check backend/services/payout.service.js` passed.
  - `node --check backend/utils/member-capability.helpers.js` passed.

## Recent Update (2026-04-26) - Sales Team Rewards Gated to Post-Cutoff Settlement

- Completed:
  - switched Sales Team commission card to render from settled snapshot data only.
  - gated Sales Team reward visibility by `lastAppliedCutoffAt` from server cutoff metrics.
  - blocked member-side pre-cutoff Sales Team snapshot persistence (member runtime no longer POSTs live cycle estimates).
  - refreshed settled Sales Team snapshot when cutoff settlement changes and when current session identity updates.
  - unified dashboard bootstrap commission init through `initializeCommissionRuntimeState(...)`.

- Outcome:
  - users no longer see/claim Sales Team cycle rewards before cutoff settlement.
  - Sales Team payout button now remains disabled pre-cutoff because available commission stays `0` until settlement exists.

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`

- Validation:
  - inline script parse check passed for `index.html` (`INLINE_SCRIPT_PARSE_OK blocks=3`).

## Recent Update (2026-04-26) - Sales Team KPI UI Simplified, Cycle Cap Moved to Server Cutoff

- Completed:
  - removed Sales Team KPI card cycle-progress bar.
  - removed Sales Team KPI waiting-state text (`Awaiting server cutoff...`).
  - moved weekly cycle-cap display into Server Cutoff card under `Estimated Cycles`.
  - rewired render output so cycle-cap usage (`X / Y`) is shown in Server Cutoff panel.

- Outcome:
  - Sales Team KPI card is cleaner and focused on commission value + transfer action.
  - cycle-cap context remains visible but now sits with cutoff/cycle data where it belongs.

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`

- Validation:
  - inline script parse check passed for `index.html` (`INLINE_SCRIPT_PARSE_OK blocks=3`).

## Recent Update (2026-04-26) - Server Cutoff Panel First-Load Sync Performance Fix

- Completed:
  - added a post-persistence cutoff refresh trigger after binary metrics snapshot save succeeds.
  - reduced cutoff post-summary refresh delay from `700ms` to `200ms`.

- Outcome:
  - Server Cutoff left/right volumes now hydrate on initial load without requiring manual page reload in the common race path.
  - cutoff panel refreshes faster after binary summary updates.

- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`

- Validation:
  - inline script parse check passed for `index.html` (`INLINE_SCRIPT_PARSE_OK blocks=3`).

## Recent Update (2026-04-27) - Binary Tree Details Switched to Cutoff Carry-Over Metrics

- Completed:
  - verified Binary Tree Details panel was showing lifetime-style totals for non-home selections.
  - added per-selected-node cutoff metrics fetch/cache so `Left Leg`, `Right Leg`, and `Cycles` follow post-cutoff carry-over values.
  - removed lifetime Details row `Total Organizational BV` for now.

- Outcome:
  - Binary Tree Details panel now behaves like cutoff-driven loop logic for selected member/business-center nodes instead of presenting static lifetime left/right values.
  - lifetime organizational total is no longer displayed in the panel.

- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`

- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Recent Update (2026-04-27) - Weekly Cutoff/Commission Logic Realigned + Personal BV Reset Guard

- Completed:
  - removed force-cutoff behavior that reset personal BV baseline fields on user/member records.
  - updated cycle rule across dashboard/admin/backend/tree/business-center paths to `1000/1000` consumption.
  - updated force-cutoff commission settlement to use current-week leg volumes (baseline-aware), not lifetime totals.
  - restored Binary Tree left Details row `Total Organizational BV`.

- Outcome:
  - Personal BV no longer gets flushed by weekly force-cutoff runs; account status personal BV remains duration-driven.
  - cycle carry/consumption now follows strong-leg `1000` behavior, yielding `192` carry for `1000/1192` scenario.
  - repeated cutoff runs without new volume now settle `0` additional cycles.

- Files updated:
  - `backend/services/admin.service.js`
  - `backend/services/cutoff.service.js`
  - `backend/services/metrics.service.js`
  - `backend/services/member-business-center.service.js`
  - `index.html`
  - `admin.html`
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`
  - `Claude_Notes/member-dashboard-page.md`
  - `Claude_Notes/admin-dashboard-page.md`
  - `Claude_Notes/BackEnd-Notes.md`

- Validation:
  - `node --check backend/services/admin.service.js` passed.
  - `node --check backend/services/cutoff.service.js` passed.
  - `node --check backend/services/metrics.service.js` passed.
  - `node --check backend/services/member-business-center.service.js` passed.
  - `node --check binary-tree-next-app.mjs` passed.
  - inline script parse checks passed for `index.html` and `admin.html`.

### Patch Note (2026-04-27)
- Added force-cutoff baseline safety guard: when a member has no matching binary snapshot, cutoff baseline state now keeps existing baseline values instead of resetting to `0`.
- File: `backend/services/admin.service.js`
- Validation: `node --check backend/services/admin.service.js` passed.

## Recent Update (2026-04-27) - Binary Cutoff Carry Forward / Flush Logic Realigned (Strong=1000, Weak=500)

- Completed:
  - centralized binary cycle math with deterministic strong-leg handling and left-side tie-breaker.
  - updated force-cutoff settlement to:
    - consume strong leg `1000` + weak leg `500` per cycle,
    - carry forward unused weekly BV only when active at cutoff,
    - flush carry-forward to `0/0` when inactive at cutoff.
  - added cutoff audit logs for carry-forward, cycle consumption, and inactivity flush events.
  - aligned cutoff metrics and persisted cycle-threshold normalization with the new fixed rule.
  - added automated tests for carry-forward, flush, tie-breaker, idempotency, and no-double-count regressions.

- Outcome:
  - weekly cutoff behavior is deterministic and idempotent under repeated runs.
  - inactivity now clears carry-forward only at cutoff processing time (not immediate account-state transition).
  - cycle settlement and carry-forward math now matches business rules with explicit tie behavior.

- Files updated:
  - `backend/utils/binary-cycle.helpers.js`
  - `backend/services/admin.service.js`
  - `backend/services/cutoff.service.js`
  - `backend/services/metrics.service.js`
  - `backend/stores/metrics.store.js`
  - `backend/services/member-business-center.service.js`
  - `backend/tests/binary-cycle-cutoff.test.js`
  - `package.json`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/BackEnd-Notes.md`

- Validation:
  - `node --check` passed for all touched backend JS files.
  - `npm.cmd run test:binary-cycle` passed (`11` tests).

## Recent Update (2026-04-27) - Personal BV Display Restoration (Zeroone)

- Completed:
  - removed Personal BV fallback dependence on `serverCutoffBaselineStarterPersonalPv` for activity/current-PV calculations.
  - updated member dashboard resolver to fallback to `starterPersonalPv` (not starter-baseline delta) when explicit current fields are absent.
  - updated Binary Tree resolvers (member nodes + root + immediate enrollment node hydration) to use explicit current PV first, then starter PV fallback.
  - updated backend activity helper fallback so baseline snapshots cannot zero-out valid Personal BV.

- Outcome:
  - baseline-equals-starter scenarios no longer force Personal BV to render as `0`.
  - `zeroone` remains verifiably at `1304` Personal BV across user/store/session/service paths.
  - activity-expiry behavior remains intact for true 30-day window expiration.

- Files updated:
  - `backend/utils/member-activity.helpers.js`
  - `index.html`
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`

- Validation:
  - `node --check backend/utils/member-activity.helpers.js` passed.
  - `node --check binary-tree-next-app.mjs` passed.
  - service snapshot check confirms `currentPersonalPvBv: 1304` for `zeroone`.

## Recent Update (2026-04-27) - Binary Tree Details Monthly Weekly Carousel (Commission UX)

- Completed:
  - replaced Details card internals with monthly weekly carousel UI while preserving side-panel shell/search/favorites/member-status blocks.
  - wired week tabs, month arrows, and swipe navigation with mobile gesture handoff (horizontal card swipe vs vertical panel scroll).
  - mapped Details metrics to explicit BV terminology (`Available Left/Right Leg BV`, `Consumed BV`, `Carry Forward BV`, `Team Generated BV`).
  - added helper text clarifying available vs consumed BV semantics.

- Data behavior:
  - current week defaults on node select.
  - carry-forward continuity is preserved in week-to-week projection, including month transitions.
  - no backend cycle-settlement logic rewrite performed.

- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`

- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Patch Update (2026-04-27) - Details Carousel Consistency Pass

- Updated Details carousel fallback weak-leg cycle threshold from `500` to `1000` to match active binary cycle rule.
- Updated week tabs to display `Week 1..Week N` labels (instead of `W1..`) for UI requirement compliance.
- Validation: `node --check binary-tree-next-app.mjs` passed.

## Patch Update (2026-04-27) - Details UX Cleanup + Week Tab Spacing Fix

- Simplified Details card visual density and restored cleaner scan pattern.
- Fixed week-tab spacing and centering issues by using equal-width tabs with calculated start offset.
- Kept monthly/week carousel mechanics and swipe behavior unchanged.
- Validation: `node --check binary-tree-next-app.mjs` passed.

## Patch Update (2026-04-27) - Reference-Match Details UI Pass

- Updated Details card to match shared reference composition (avatar header, centered month/date, clean week pills, BV tiles, compact rows, blue relation buttons).
- Week-button spacing issue addressed with centered equal-width tab layout logic.
- Validation: `node --check binary-tree-next-app.mjs` passed.

## Patch Update (2026-04-27) - Bottom Buttons Rolled Back To Original Design Style

- Details bottom parent/sponsor buttons now use the previous/original color and typography treatment.
- No backend or carousel logic changed.
- Validation: `node --check binary-tree-next-app.mjs` passed.

## Patch Update (2026-04-27) - User Profile Style Reverted

- Restored older user profile header style in Details card (gradient avatar + dot + centered identity text).
- No commission logic or carousel interaction changes.
- Validation: `node --check binary-tree-next-app.mjs` passed.

## Patch Update (2026-04-27) - User Profile Node Reverted (Initials Back)

- Reverted user profile node render to previous style logic and restored initials fallback.
- Kept profile block positioning from current layout.
- Validation: `node --check binary-tree-next-app.mjs` passed.

## Patch Update (2026-04-27) - Available BV Tiles Zero Bug Fix

- Updated Details snapshot fallback to avoid stale cutoff `0/0` values overriding positive loop/tree BV.
- Available Left/Right containers now use fallback source when cutoff looks stale.
- Validation: `node --check binary-tree-next-app.mjs` passed.

## Patch Update (2026-04-27) - Available BV Data Reliability Follow-up

### What Changed
- `binary-tree-next-app.mjs`
  - `resolveNodeLoopDisplayMetrics(...)` now treats cutoff `0/0` as stale when subtree fallback has BV, preventing cutoff zeros from overriding real leg volumes.
  - `resolveDetailsCarouselSnapshot(...)` now uses the stronger fallback floor of `max(loop leg volume, subtree leg volume)` before resolving available BV.

### Impact
- Details tiles (`Available Left Leg BV`, `Available Right Leg BV`) now reflect subtree BV even when node-level cutoff payloads lag/reset to zero.
- Target regression case addressed: `zerofour` expected left-leg `192 BV` no longer forced to `0 BV` by stale cutoff values.

### Validation
- `node --check binary-tree-next-app.mjs` passed.

## Patch Update (2026-04-27) - Details Available BV Tile Alignment

### What Changed
- `binary-tree-next-app.mjs`
  - updated tile typography placement for `Available Left/Right Leg BV` cards to center-based vertical math.
  - removed fixed bottom-heavy value offset that made BV appear too low.

### Validation
- `node --check binary-tree-next-app.mjs` passed.

## Patch Update (2026-04-27) - Details Carousel Week Count Locked To 4

### What Changed
- `binary-tree-next-app.mjs`
  - fixed month week-count to 4.
  - adjusted week-range builder so Week 4 absorbs remaining month days.

### Validation
- `node --check binary-tree-next-app.mjs` passed.

## Patch Update (2026-04-27) - Details Historical Accuracy (Pre-Join Weeks)

### What Changed
- `binary-tree-next-app.mjs`
  - introduced join-date gating in Details snapshot resolver so weeks fully before node creation show zeroed commission metrics.

### Validation
- `node --check binary-tree-next-app.mjs` passed.

## Patch Update (2026-04-27) - Zeroone Root Week Gating Fix

### What Changed
- `binary-tree-next-app.mjs`
  - scoped root node now includes creation/join date metadata so pre-join week filtering works for the currently logged-in root member.

### Validation
- `node --check binary-tree-next-app.mjs` passed.

## Patch Update (2026-04-27) - Details Header Joined Date Line

### What Changed
- `binary-tree-next-app.mjs`
  - displays `Joined <date>` beneath `@username` in Details profile header.
  - rebalanced header-to-month navigation spacing to keep layout clean.

### Validation
- `node --check binary-tree-next-app.mjs` passed.

## Patch Update (2026-04-27) - Details Header Breathing + Active Week Persistence

### What Changed
- `binary-tree-next-app.mjs`
  - adjusted Details profile header spacing to reduce cramped appearance.
  - implemented dual-state week tabs:
    - active week remains highlighted (green) even if another week is selected.
    - selected non-active week uses gray preview color.

### Validation
- `node --check binary-tree-next-app.mjs` passed.

## Patch Update (2026-04-27) - Details Weeks Switched To Cutoff-Cycle Basis

### What Changed
- `binary-tree-next-app.mjs`
  - week model now uses server cutoff windows (not static 1-7/8-14 buckets).
  - active week detection now anchors to next server cutoff.

### Validation
- `node --check binary-tree-next-app.mjs` passed.

## Patch Update (2026-04-27) - Week Tab Marker Simplification

### What Changed
- `binary-tree-next-app.mjs`
  - removed active-week dot indicator from tabs for cleaner UI.
  - kept active-vs-selected color behavior unchanged.

### Validation
- `node --check binary-tree-next-app.mjs` passed.

## Patch Update (2026-04-27) - Details Week Transition Animation (In Progress UX Polish)

### What Changed
- `binary-tree-next-app.mjs`
  - implemented fade + horizontal slide transition when previewing another week (tab click, prev/next, swipe-triggered navigation).
  - introduced transition lifecycle state in the Details carousel UI store and animation-aware week/month selection helpers.
  - preserved existing commission and cutoff logic; animation is render-only and does not alter BV/cycle calculations.

### Validation
- `node --check binary-tree-next-app.mjs` passed.

## Patch Update (2026-04-27) - Details Carousel Animation Reduced Motion

### What Changed
- `binary-tree-next-app.mjs`
  - switched weekly transition from slide+fade to fade-only.
  - preserved existing interaction triggers (week tabs, prev/next, swipe release).

### Validation
- `node --check binary-tree-next-app.mjs` passed.

## Patch Update (2026-04-27) - Details Fade Timing Tweak

### What Changed
- `binary-tree-next-app.mjs`
  - adjusted Details week transition duration to `300ms` for gentler crossfade pacing.

### Validation
- `node --check binary-tree-next-app.mjs` passed.

## Patch Update (2026-04-27) - Account Package BV Alignment (Personal 150)

### Scope
- Enrollment package BV definitions were inconsistent between Binary Tree Next and other system surfaces.
- Personal package BV now aligned to the updated value (`150`) across member dashboard, admin enrollment, auth package metadata, backend enrollment service, and simulation fixtures.

### Files Updated
- `index.html`
- `admin.html`
- `login.html`
- `backend/services/member.service.js`
- `backend/scripts/simulate-zeroone-live-test.mjs`

### Validation
- Repo scan confirms no remaining legacy Personal package mapping of `bv: 192` / `192 BV` in code.
- `cmd /c npm run test:binary-cycle` passed (`11/11`).

### Active Follow-Up
- If desired, run a one-time backfill for already-created Personal accounts that still store legacy `192` enrollment/package BV.

## Data Fix (2026-04-27) - Zerofive Personal BV Normalized

### Scope
- Completed targeted production-data correction for `zerofive` to replace legacy Personal BV (`192`) with the updated value (`150`).

### Records Updated
- `charge.member_users`: `enrollment_package_bv`, `starter_personal_pv`, `current_personal_pv_bv`
- `charge.registered_members`: `package_bv`, `starter_personal_pv`

### Validation
- Immediate post-transaction readback confirms all target fields now reflect `150`.

## Patch Update (2026-04-27) - Store BV Rules Aligned To Preferred vs Paid

### Scope Completed
- Admin My Store package-earning panel now has two earning buckets only:
  - Preferred Account
  - Paid Member
- Store product BV/earning resolution now uses the same two-bucket model across admin + storefront logic.
- Paid-member buyer settlement now resolves from a single paid bucket (default 50 BV unless overridden in panel).

### Files Updated (This Scope)
- `admin.html`
- `index.html`
- `storefront-shared.js`
- `backend/utils/store-product-earnings.helpers.js`
- `backend/services/store-checkout.service.js`
- `backend/services/store-product.service.js`

### Current Behavior Baseline
- Preferred/Free account purchase: uses Preferred package-earning bucket.
- Paid member purchase: uses Paid package-earning bucket regardless of paid tier.
- Legacy keys remain supported via alias/backward-compatible mapping.

### Validation Snapshot
- `index.html` inline-script syntax check: passed.
- `admin.html` inline-script syntax check: passed.
- Backend store helper/service syntax checks: passed.

## Patch Update (2026-04-27) - Store Earnings Model Adjusted Per Clarification

### Scope Completed
- Preferred store checkout now uses package-tier matrix again (Personal/Business/Infinity/Legacy).
- Paid-member checkout now uses one paid BV bucket and no retail commission.
- Admin My Store Product Management panel now matches this model:
  - 4 Preferred tier rows (Retail + BV)
  - 1 Paid Member row (BV only)

### Checkout Rule Baseline
- Preferred buyer purchase: settlement package key resolves from store owner package tier.
- Paid member purchase: settlement package key resolves to `paid-member-pack` only.
- Retail commission is only included for preferred-buyer settlement path.

### Validation Snapshot
- Backend syntax checks passed (`store-checkout`, `store-product-earnings.helpers`, `storefront-shared`).
- `admin.html` and `index.html` inline script syntax checks passed.

## Update (2026-04-27) - My Store Checkout Code Mismatch Fix + Binary Tree Paid BV Sync

### Completed
- Patched user dashboard My Store checkout routing so storeCode and memberStoreLink are generated from one canonical store code.
- Patched Stripe checkout payloads (cart + upgrade) to use canonical storeCode instead of mixed attribution/public code paths.
- Binary Tree My Store featured BV now resolves via product package earnings with paid-member bucket priority.
- Binary Tree fallback review BV updated to 50 BV.

### Why This Matters
- Prevents post-Stripe invoice rejection caused by store-code/link mismatch.
- Removes stale legacy 38 BV display for paid members in Binary Tree My Store.

### Validation
- 
ode --check binary-tree-next-app.mjs passed.
- 
ode --check storefront-shared.js passed.
- 
ode --check backend/utils/store-product-earnings.helpers.js passed.
- 
ode --check backend/services/store-checkout.service.js passed.

## Update (2026-04-28) - Dashboard My Store Stripe Popup Checkout Flow

### Completed
- `index.html`
  - My Store cart and account-upgrade checkout now open Stripe in a popup window, preserving the current dashboard tab.
  - Added popup return signal bridge (`postMessage` + storage signal) so the original tab finalizes checkout after Stripe return.
  - Added receipt modal on My Store with invoice summary after successful completion.
  - Added dedupe handling for hosted-checkout return signals to avoid duplicate finalization.

### Validation
- Inline script parse check passed for `index.html`.
- `node --check storefront-shared.js` passed.
- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-28) - My Store Checkout Return Loading UX

### Completed
- `index.html`
  - Receipt modal now appears immediately after Stripe return with an explicit loading state (`Processing`) while checkout completion is finalized.
  - Modal swaps to confirmed receipt details once completion succeeds.
  - Modal now surfaces a non-loading attention state if completion fails.

### Validation
- Inline script parse check passed for `index.html`.

## Patch Update (2026-04-27) - Details Cycle Rule Alignment (Strong 1000 / Weak 500)

### What Changed
- `binary-tree-next-app.mjs`
  - updated Details/front-end cycle defaults to `1000/500`.
  - removed weak-threshold upcast logic so week preview math matches backend cycle semantics.

### Validation
- `node --check binary-tree-next-app.mjs` passed.

## Update (2026-04-28) - Leadership Matching Bonus Delivered (Non-KPI Placement)

### Done
- Leadership Matching Bonus backend flow is implemented from finalized Sales Team commission records only.
- Sponsor/enrollment upline traversal is implemented to max 9 levels with rank-based percentage matrix.
- Earning idempotency is implemented per:
  - source sales-team commission id
  - recipient user id
  - sponsor level
  - bonus type.
- Matching Bonus transfer-to-wallet is integrated into existing commission transfer endpoint/flow.
- Matching Bonus transfer now writes ledger entries with before/after source+wallet balances.
- Dashboard now shows Matching Bonus in right-column bonus panels (not top KPI grid, per user direction).
- Admin/member ledger filters now include:
  - Leadership Matching Bonus
  - Matching Bonus Transfer to Wallet
  - Commission Transfer source type.

### Files Updated In This Scope
- `backend/services/leadership-matching.service.js` (new)
- `backend/services/member-business-center.service.js`
- `backend/services/ledger.service.js`
- `backend/services/wallet.service.js`
- `backend/stores/ledger.store.js`
- `backend/stores/wallet.store.js`
- `backend/utils/ledger.helpers.js`
- `backend/tests/leadership-matching.service.test.js` (new)
- `backend/tests/ledger.service.test.js`
- `index.html`
- `admin.html`
- `package.json`

### Verification Snapshot
- `cmd /c npm run test:ledger` passed.
- `cmd /c npm run test:matching-bonus` passed.
- `cmd /c npm run test:binary-cycle` passed.
- Inline script parse checks passed for `index.html` and `admin.html`.

### Active Follow-Up / Risks
- Existing legacy commission sources (fasttrack/infinity/legacy/salesteam/retailprofit) keep prior transfer validation behavior; only matching-bonus source now performs explicit server-side available-balance validation before wallet credit.

## Update (2026-04-28) - Weekly Total Organization BV Live Sync Fix

### Scope
- User Dashboard account overview metric alignment (`index.html`).

### Progress
- Completed wiring so `Weekly Total Organization BV` is now driven by resolved weekly loop metrics (same leg-volume basis used for binary-tree weekly generated volume behavior).
- Added cutoff-payload refresh for KPI + BV graph + trend badge so values update when live weekly cutoff data arrives.

### Active Notes
- No UI layout changes were made; this is data-flow correction only.
- Snapshot sync payload now uses resolved loop leg values to match rendered dashboard state.

### Validation
- Inline script syntax check passed for `index.html` (3 inline script blocks).

## Patch Update (2026-04-28) - Weekly BV Zero Override Fix

### Completed
- Updated dashboard loop metric resolution to prevent zero cutoff payloads from overriding non-zero tree summary legs/cycles.
- Aligned member binary volume source with Binary Tree Details `Team Generated BV` basis (starter/package volume, non-baseline-subtracted).

### Impact
- `Weekly Total Organization BV` now reflects non-zero tree data when available.
- Server cutoff/dashboard KPI paths now remain consistent with tree-side generated volume semantics.

### Validation
- Inline script syntax check passed for `index.html` (3 inline script blocks).

## Patch Update (2026-04-28) - BV Comparison Semantic Alignment

### Completed
- Updated Account Overview comparison series to use:
  - `Total BV = Team Generated BV + Personal BV`
  - `Personal BV = Team Generated BV (without personal add-on)`
- Added non-zero fallback behavior so cutoff zero payloads do not flatten server-cutoff leg display or dashboard comparison values.

### Validation
- Inline script syntax check passed for `index.html` (3 inline script blocks).
- Local data check confirms non-zero split metrics are produced.

## Patch Update (2026-04-28) - Server Cutoff Left/Right Drift Correction

### Completed
- Removed stale server-cutoff seed leg values from HTML defaults.
- Changed server-cutoff left/right runtime bootstrap to start at `0` so live summary/cutoff payload values drive display.

### Why
- Prevents large legacy seed values from surviving fallback math and overriding correct current-user leg values.

### Validation
- Inline script syntax check passed for `index.html` (3 inline script blocks).

## Update (2026-04-28) - Business Center Rule Set Migrated to 2-Center Model

### Completed
- Business Center rule model is now enforced as max 2 centers per owner.
- Unlock progression moved to:
  - Tier 4 -> BC #1
  - Tier 5 -> BC #2
- Tier 3 unlock removed.
- Business Center #3 is deprecated in runtime and UI paths.

### Files Updated In This Scope
- `backend/services/member-business-center.service.js`
- `backend/tests/member-business-center.service.test.js` (new)
- `index.html`
- `package.json`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`

### Verification Snapshot
- `cmd /c npm run test:business-centers` passed.
- `cmd /c npm run test:binary-cycle` passed.
- `cmd /c npm run test:ledger` passed.
- `cmd /c npm run test:matching-bonus` passed.
- `node --check backend/services/member-business-center.service.js` passed.

### Active Notes / Priority
- Historical BC index-3 ledger/commission rows are preserved for audit continuity.
- New writes and activations are constrained to max 2 centers and Tier 4/5 unlock only.
- Dashboard/tree labels no longer expose `Business Center #3`; legacy over-cap rows display as `Legacy Center #N`.

## Update (2026-04-28) - User Dashboard Home Panel Order Updated

### Completed
- Reordered dashboard row-2 panel layout in `index.html` to requested arrangement:
  - `Fast Track Bonus` now occupies the wide (`lg:col-span-2`) position.
  - `Matching Bonus` now sits to the right of Fast Track.
  - `Business Centers` moved to the next row as the wide panel.
  - `Recent Activity` now sits to the right of Business Centers.

### Scope
- UI layout order only (no data-flow or business-logic changes).
- Preserved existing component IDs and action bindings.

### Validation
- Markup structure audit completed in `index.html` row-2 grid block.
- Screenshot command executed, but runtime opened login view due auth session, so dashboard layout was verified via source-order/class review.

## Patch Update (2026-04-28) - Dashboard Long-List Scroll Containment

### Completed
- Constrained two dashboard panels to prevent page-length growth from long lists:
  - `Fast Track Bonus` card now capped at `max-h-[34rem]` with internal overflow clipping.
  - `Recent Activity` panel now capped at `max-h-[34rem]`.
- Existing item-list containers continue to handle vertical scrolling internally.

### Scope
- UI-only class updates in `index.html`.
- No data, API, or ledger logic changes.

### Validation
- Verified updated class strings for `#fast-track-bonus-card` and `#recent-activity-panel` in source.

## Update (2026-04-28) - Dashboard Reflow + Business Center Two-Card Redesign

### Completed
- Home panel arrangement updated to:
  - Left/wide: `Fast Track Bonus` then `Recent Activity`
  - Right stack: `Matching Bonus` then `Business Centers`
- Business Center panel rebuilt to center-specific card format (BC #1 and BC #2 only).
- Removed Unified Wallet/aggregate breakdown sub-containers from Business Center UI.
- Added per-card action model:
  - non-activated center: `Activate Business Center`
  - activated center: `Transfer to Wallet`

### Backend/Runtime Support
- Added `businesscenter` commission-transfer source support in wallet transfer source maps.
- Frontend transfer payload now supports optional `note` so center-specific transfers can be tagged (`Business Center #N`).
- Business Center card available balance now resolves as:
  - center earnings total
  - minus tagged prior transfers for that center.

### Validation
- Syntax checks passed:
  - `backend/services/wallet.service.js`
  - `backend/stores/wallet.store.js`
  - `index.html` inline script blocks.

## Patch Update (2026-04-28) - Dashboard Column Alignment Cleanup

### Completed
- Eliminated layout gap under `Fast Track Bonus` by moving `Recent Activity` into the same left stacked column container.
- Right stacked column (`Matching Bonus` + `Business Centers`) is unchanged.

### Scope
- Layout-only update in `index.html`.
- No business logic/API behavior changes.

### Validation
- Inline script syntax check passed for `index.html`.

## Patch Update (2026-04-28) - Fast Track Fixed Vertical Size

### Completed
- Set Fast Track bonus panel to fixed height (`h-[34rem]`) instead of max-height.
- Preserved internal scroll containment for long commission-audit lists.

### Scope
- Single-class layout adjustment in `index.html`.

## Patch Update (2026-04-28) - Dynamic Fast Track/Business Center Height Match

### Completed
- Fast Track height matching logic now follows Business Center panel height on desktop.
- Removed fixed Fast Track height class so sync can be true panel-to-panel match.
- Added re-sync call after Business Center UI render updates.

### Scope
- Frontend layout behavior update in `index.html` only.

## Patch Update (2026-04-28) - Fast Track Height Matches Right Stack Depth

### Completed
- Fast Track height sync now uses full right stack container height (Matching + Business Centers), not Business Center card-only height.

### Scope
- `index.html` layout sync target update only.

## Patch Update (2026-04-28) - Binary Tree Track Commissions Matching Bonus Card

### Completed
- Added `Matching Bonus` to Binary Tree Next `Account Overview > Track Commissions`.
- Positioned the new card next to `Infinity Tier Commission` in the existing commission-card row.
- Wired card value rendering from Account Overview balance resolver via:
  - ledger summary (`leadership_matching_bonus`)
  - wallet transfer offsets (`matchingbonus` / `matchingBonus`)
  - existing container/session fallback values
- Included `matchingBonus` in the Account Overview commission aggregate + render update signature.

### Scope
- `binary-tree-next.html`
- `binary-tree-next-app.mjs`

### Validation
- `node --check binary-tree-next-app.mjs` passed.
## Patch Update (2026-04-29) - Profile Page Account Overview + Avatar/Initials Parity Fix

- Completed:
  - profile page now keeps achievements and uses the Binary Tree-style `Account Overview` hero above it.
  - profile avatar style now matches Binary Tree values for gradient, size, and typography.
  - fixed active-status green dot clipping by removing avatar overflow clipping in profile hero CSS.
  - fixed profile hero initials rendering by adding a dedicated initials resolver and syncing initials from display name.
  - tightened node label resolution order to prioritize member/node identity fields.
- Outcome:
  - profile hero now visually matches Binary Tree account overview behavior more closely, including readable initials and unclipped active indicator.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`
- Validation:
  - inline script parse check passed for `index.html` (3 script blocks).

## Patch Update (2026-04-29) - Profile Joined Label Fix

- Completed:
  - replaced profile hero subtext `Node: <id>` with `Joined <date>`.
  - joined value now resolves from member session date fields (`createdAt/enrolledAt/registeredAt` with snake_case fallbacks).
- Outcome:
  - profile page now shows the expected joined date under username instead of an internal node id.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`
- Validation:
  - inline script parse check passed for `index.html`.

## Patch Update (2026-04-29) - Profile Divider Full-Width Adjustment

- Completed:
  - removed desktop max-width constraint from profile account-overview hero.
  - kept hero content centered via grid `justify-content` while allowing divider line to span full panel width.
- Outcome:
  - separator under joined date now reaches the account-overview card borders.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`

## Patch Update (2026-04-29) - Profile Volume Cards Standardized To 6-Card Account Overview Set

- Completed:
  - profile `Sales and Business Volumes` now uses the exact six cards requested:
    - Account Active Until
    - Total Organization BV
    - Personal BV
    - Weekly Cycle Cap
    - Direct Sponsors
    - E-Wallet
  - upgraded profile card data rendering to include weekly cycle-cap and E-Wallet value updates.
  - connected E-Wallet summary refresh path so profile card E-Wallet value stays in sync.
- Outcome:
  - profile section now mirrors the expected account-overview card set and ordering with live values.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`
- Validation:
  - inline script parse check passed for `index.html`.

## Patch Update (2026-04-28) - Business Center Caption Copy Update

### Completed
- Replaced Business Center summary helper sentence with requested copy:
  - `Complete Legacy Tier 4 and Tier 5 to unlock Business Centers.`

### Scope
- UI text update in `index.html` only.

## Patch Update (2026-04-29) - Auto Ship Billing Date Display Alignment

### Completed
- Payment and Billing > Auto Ship now shows Next Billing Date from normalized fallback fields (`nextBillingDate`, snake_case variants, period end, scheduled anchor metadata).
- Date rendering now avoids timezone day-shift for timestamp-based Stripe values.

### Scope
- Frontend-only update in `index.html`.

### Validation
- Manual code-path verification completed for Auto Ship snapshot normalization + render pipeline.

## Patch Update (2026-04-29) - Auto Ship Canceled/Active Mismatch Fix

### Completed
- Auto Ship member status sync now prefers the healthiest/current Stripe Auto Ship subscription instead of blindly trusting a stale stored canceled subscription id.
- Customer-level Stripe subscription reconciliation now runs during status refresh and can promote local status back to active/past_due when appropriate.

### Scope
- Backend sync logic update in `backend/services/auto-ship.service.js`.

### Validation
- `node --check backend/services/auto-ship.service.js` passed.

## Patch Update (2026-04-29) - Payment Settings Simplified To Stripe-Managed Flow

### Completed
- Removed in-page `Card Details` and `Billing Address` components from member `Settings > Payment and Billing`.
- Kept Auto Ship controls and billing feedback area intact.
- Protected account-save behavior so hidden/removed billing fields no longer clear stored billing values.

### Scope
- Frontend-only updates in `index.html`.

### Validation
- `index.html` inline script parse check passed.
## Patch Update (2026-04-29) - Binary Tree Track Commissions Transfer Buttons

### Completed
- Added `Transfer to E-Wallet` button to every commission container in `Binary Tree Next > Account Overview > Track Commissions`.
- Preserved existing commission-card click behavior for panel navigation (Infinity/Legacy detail flow remains intact).
- Wired each transfer button to redirect to `/EWallet` with source metadata:
  - `source=binary-tree-next`
  - `transferSource=<commission-key>`

### Scope
- `binary-tree-next.html`
- `binary-tree-next-app.mjs`

### Validation
- `node --check binary-tree-next-app.mjs` passed.

### Current Limitation
- Transfer action currently hands off to E-Wallet page (no direct in-panel transfer execution yet).
## Patch Update (2026-04-29) - Binary Tree Commission Transfers Unified With Dashboard Flow

### Completed
- Binary Tree `Transfer to E-Wallet` buttons now execute the same commission-transfer API flow as Dashboard, instead of redirect-only navigation.
- Added source-key busy lock + offset-aware available amount checks to reduce duplicate transfers per commission system.
- Added post-transfer snapshot refresh so balances sync between Binary Tree and User Dashboard views.

### Scope
- `binary-tree-next-app.mjs`
- `binary-tree-next.html`

### Validation
- `node --check binary-tree-next-app.mjs` passed.

### Note
- Transfers are disabled in system-totals/admin-style context and remain member-session only.
## Patch Update (2026-04-29) - Binary Tree Transfer UX Hotfix (Source Key + Fast Track)

### Completed
- Fixed Binary Tree transfer button source-key matching for hyphenated commission keys.
- Fixed Binary Tree fast-track display fallback priority to reduce stale underreported values.
- Kept direct transfer API flow and source-level busy lock in place.

### Scope
- `binary-tree-next-app.mjs`

### Validation
- `node --check binary-tree-next-app.mjs` passed.
## Patch Update (2026-04-29) - Binary Tree Fast Track Amount Parity Fix

### Completed
- Added dashboard-parity fast-track gross computation in Binary Tree Account Overview.
- Member fast-track card in `Track Commissions` now considers:
  - session/home fast-track base
  - direct-sponsor fast-track accrual from current tree node data

### Scope
- `binary-tree-next-app.mjs`

### Validation
- `node --check binary-tree-next-app.mjs` passed.
## Patch Update (2026-04-29) - Binary Tree Fast Track 38.40 Underreport Fix (Dashboard Parity)

### Completed
- Fast-track computation in Binary Tree Account Overview now aligns with dashboard source-of-truth:
  - base from member/session fast-track balance
  - direct-sponsor accrual from full registered-member dataset
  - fallback to node-scoped accrual only when needed
- Live sync signature now includes fast-track amount so unchanged structure updates still apply when commission amounts move.
- Account Overview value signature now tracks registered-members snapshot updates, improving refresh consistency while panel is open.

### Scope
- `binary-tree-next-app.mjs`

### Validation
- `node --check binary-tree-next-app.mjs` passed.

### Current Limitation
- Transfer buttons remain intentionally disabled in system-totals/admin context; member-session context remains the transfer path.
## Patch Update (2026-04-29) - Binary Tree Matching Bonus Offset Parity

### Completed
- Fixed Matching Bonus calculation path in Binary Tree Account Overview to prevent double subtraction of transferred offsets.
- Matching Bonus card now aligns with dashboard-style net availability logic (single offset application).

### Scope
- `binary-tree-next-app.mjs`

### Validation
- `node --check binary-tree-next-app.mjs` passed.
## Patch Update (2026-04-29) - Binary Tree My Store Product Catalog Visibility

### Completed
- Confirmed and fixed Binary Tree `Profile > My Store` product visibility gap where only a single featured product was shown.
- My Store catalog in Binary Tree now renders live products from `/api/store-products` (active-first) and includes newly added admin products.
- Product selection now persists by product key through in-panel Review and Checkout states.
- Updated My Store catalog panel markup/styling for multi-product responsive card layout.

### Scope
- `binary-tree-next-app.mjs`
- `binary-tree-next.html`

### Validation
- `node --check binary-tree-next-app.mjs` passed.

## Patch Update (2026-04-29) - Profile BV Reset Regression Fix

- Completed:
  - removed the E-Wallet-triggered profile full-card render that was overwriting BV fields.
  - E-Wallet refresh now updates only the E-Wallet card value in profile account overview.
- Outcome:
  - `Total Organization BV` and `Personal BV` keep their correct values and no longer drop to `0` after E-Wallet sync.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`

## Patch Update (2026-04-29) - Profile Header Labels Removed

- Completed:
  - removed `Account Overview`, `My Profile`, and `Binary Tree summary profile` text from the profile account overview panel.
- Outcome:
  - profile panel now starts directly with the hero section.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`

## Patch Update (2026-04-29) - Profile Title Correctness (No Legacy Leader)

- Completed:
  - removed `Legacy Leader` as a generated profile title fallback.
  - legacy rank fallback now uses `Legacy Founder`.
  - added compatibility conversion so stale explicit `Legacy Leader` values render as `Legacy Founder`.
- Outcome:
  - profile title badge is aligned with backend title storage/catalog for legacy-level titles.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`

## Patch Update (2026-04-29) - Profile Badge Hover Detail Parity

- Completed:
  - enabled hover detail popup interactions on Profile hero rank/title badges.
  - reused existing profile hovercard system (same behavior class as dashboard KPI hover details).
  - added keyboard focus support and touch/pen trigger support for profile hero badge popups.
- Outcome:
  - Profile rank/title badges now show detail popups on hover like dashboard KPI badges.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`

## Patch Update (2026-04-29) - Profile Hover Popup Visibility Fix

- Completed:
  - restored missing profile hovercard DOM node used by rank/title hover handlers.
- Outcome:
  - profile rank/title badge hover popups now have a render target and can display.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`

## Patch Update (2026-04-29) - Title Popup Date Fallback Fix

- Completed:
  - added fallback acquired-date resolution in profile title subtitle logic.
- Outcome:
  - legacy founder title popup now shows a real acquired date fallback instead of `--` when award timestamp is unavailable.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`

## Patch Update (2026-04-30) - Binary Tree Account Overview Title/Hover Parity

- Completed:
  - removed hardcoded `Legacy Founder` visual fallback in Binary Tree Account Overview hero title badge.
  - switched title badge default to neutral `Member Title` + placeholder icon until live title data resolves.
  - enabled hover detail popup behavior on Binary Tree Account Overview rank/title badges.
  - added title popup acquired-date fallback logic so legacy-program badges do not show missing-date copy when claim timestamp is absent.
- Outcome:
  - Binary Tree Account Overview now follows profile/dashboard behavior for rank/title badge details and no longer defaults to stale founder text.
- Files updated:
  - `binary-tree-next.html`
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Patch Update (2026-04-30) - Binary Tree Title Badge Color Preference

- Completed:
  - applied user-requested amber/orange theme for Binary Tree Account Overview title badge.
  - restored runtime amber palette mapping for founder/title labels.
- Files updated:
  - `binary-tree-next.html`
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Patch Update (2026-04-30) - Binary Tree Title Badge Amber Enforcement

- Completed:
  - forced Binary Tree Account Overview title badge runtime palette to amber/orange in all title-label states.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Patch Update (2026-04-30) - Binary Tree Title Icon Aligned To Backend Title Storage

- Completed:
  - verified backend title storage does not define `Legacy Builder` as a title.
  - updated Binary Tree Account Overview title/icon resolution to prefer backend title awards + title catalog icon paths.
  - added compatibility normalization from `Legacy Builder` fallback text to backend title `Legacy Founder` for title badge/icon rendering.
- Files updated:
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/binary-tree-next.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## Patch Update (2026-04-30) - Profile Title/Badge Inventory (Equip + Persistence)

- Completed:
  - added right-profile-badge inventory overlay/drawer for title/badge equip flow.
  - added backend equipped-badge persistence and equip endpoint:
    - `POST /api/member-auth/achievements/:achievementId/equip`
    - per-user equipped badge storage in `charge.member_profile_badge_selection`.
  - profile header now updates instantly after equip and keeps equipped badge across refresh/login via server payload sync.
  - inventory now shows earned/acquired entries only.
  - excluded rank achievements `Ruby` through `Royal Crown` from inventory display.
- Files updated:
  - `index.html`
  - `backend/stores/member-profile-badge-selection.store.js`
  - `backend/services/member-achievement.service.js`
  - `backend/controllers/member-achievement.controller.js`
  - `backend/routes/member-achievement.routes.js`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`
- Validation:
  - `node --check backend/stores/member-profile-badge-selection.store.js` passed.
  - `node --check backend/services/member-achievement.service.js` passed.
  - `node --check backend/controllers/member-achievement.controller.js` passed.
  - `node --check backend/routes/member-achievement.routes.js` passed.
  - inline script parse check passed (`Parsed 3 inline script blocks successfully.`).

## Patch Update (2026-04-30) - Badge Inventory Name + Amber Theme Parity

- Completed:
  - changed profile stash title label to `Badge Inventory`.
  - aligned inventory modal to Binary Tree amber theme palette.
  - corrected Equipped card/chip/button colors to amber gradient styling (replacing prior blue accent mismatch).
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`
- Validation:
  - inline script parse check passed (`Parsed 3 inline script blocks successfully.`).

## Patch Update (2026-04-30) - Legacy Backfill Eligibility + Icon Uniformity

- Completed:
  - made all non-rank achievement/title icons use the Founding Ambassador medal visual.
  - added backend achievement-context hydration from DB user records so legacy package/rank checks are evaluated with full member data even when auth session payload is partial.
  - added legacy-aware ownership backfill handling in eligibility checks to include `legacy-builder-pack` when legacy ownership is resolved.
- Outcome:
  - Legacy users are now correctly eligible for package-based non-rank rewards (Founding Ambassador, Infinity Builder, Legacy Builder) without requiring fresh package writes in session payload.
  - Non-rank achievement cards and title badges use a single consistent icon family (Founding Ambassador icon).
- Files updated:
  - `backend/services/member-achievement.service.js`
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`
- Validation:
  - `node --check backend/services/member-achievement.service.js` passed.
  - inline script parse check passed (`Parsed 3 inline script blocks successfully.`).

## Patch Update (2026-04-30) - Legacy Achievement Labels Forced To Updated Catalog

- Completed:
  - added profile achievement payload normalization so stale server labels are remapped by `achievementId` to updated catalog definitions.
  - enforced updated tabs/categories from fallback catalog to keep `Time-Limited Event` and `Premiere Life` structure stable.
  - appended missing achievements from fallback catalog when payload is partial.
  - updated claim feedback to read normalized snapshot titles.
- Outcome:
  - Legacy Builder Leadership Program now renders updated title names:
    - Executive Ambassador
    - Regional Ambassador
    - National Ambassador
    - Global Ambassador
  - Missing categories/achievements caused by stale or partial payload are restored in UI.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`
- Validation:
  - inline script parse check passed (`Parsed 3 inline script blocks successfully.`).

## Patch Update (2026-04-30) - Badge Inventory Text Readability Fix

- Completed:
  - switched Badge Inventory modal and card text treatment to white for higher contrast/readability.
  - updated Equipped/Earned status chip and action button text to white.
  - updated inventory feedback and empty-state text to white variants.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`
- Validation:
  - inline script parse check passed (`Parsed 3 inline script blocks successfully.`).

## Patch Update (2026-04-30) - Badge Inventory Icon Container Color Fix

- Completed:
  - changed the Badge Inventory icon container background from gray to amber gradient.
  - matched icon-shell styling to the Binary Tree amber visual family, including a stronger equipped variant.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`
- Validation:
  - inline script parse check passed (`Parsed 3 inline script blocks successfully.`).

## Patch Update (2026-04-30) - Title/Achievement Catalog Expanded To 25

- Completed:
  - rebuilt profile achievement catalog model to 25 achievements total.
  - applied new title tracks and rules:
    - Premiere Life: Founding Ambassador, Infinity Builder, Legacy Builder
    - Premiere Life / Leadership Race: Club, Squad, Commander
    - Time-Limited Event / Legacy Builder Leadership Program: Executive, Regional, National, Global Ambassador
    - Time-Limited Event / Legacy Matrix Builder: Sovereign, Round Table, Elite, Presidential Grand Ambassador Royale
  - retained and aligned rank rewards (`Ruby` -> `Royal Crown`) with existing monthly claim logic.
  - added two Premiere Journey milestones in fallback/server model to satisfy requested total count.
  - updated profile fallback snapshot + title mapping/icon lookup to the new naming set.
- Outcome:
  - Profile Achievement payload now exposes a 25-entry catalog with updated title semantics and eligibility.
  - Badge Inventory and profile title resolution can now consume the new title labels without stale legacy naming drift.
- Files updated:
  - `backend/services/member-achievement.service.js`
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`
- Validation:
  - `node --check backend/services/member-achievement.service.js` passed.

## Patch Update (2026-04-30) - Achievement Categories No Longer Disappear

- Completed:
  - fixed profile achievement payload apply logic so empty `tabs/categories/achievements` arrays do not clear the active UI catalog after refresh.
  - added category/item resolver fallback to static achievement snapshot when live snapshot arrays are empty.
  - retained previously loaded `claimableTitles` and `accountTitles` when the API payload omits those arrays.
- Outcome:
  - On profile reload, achievement categories remain visible and accessible instead of disappearing after silent refresh.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`
- Validation:
  - inline script parse check passed (`Parsed 3 inline script blocks successfully.`).

## Patch Update (2026-04-30) - Header Equipped Badge Display Fix

- Completed:
  - forced profile header title badge to use equipped badge entry first (title, icon, subtitle).
  - forced non-rank icon resolver to Founding Ambassador medal for consistency.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`
- Validation:
  - inline script parse check passed (`Parsed 3 inline script blocks successfully.`).

## Patch Update (2026-04-30) - Equip Title Immediate Header Refresh

- Completed:
  - switched profile achievement payload apply flow to run full header sync after equip/load.
  - header title badge now refreshes immediately when equipping non-Legacy titles.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`
- Validation:
  - inline script parse check passed (`Parsed 3 inline script blocks successfully.`).

## Patch Update (2026-04-30) - Profile Title Clipping Fix

- Completed:
  - fixed profile header title badge text clipping by allowing wrapped multi-line labels for title badges.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`
- Validation:
  - inline script parse check passed (`Parsed 3 inline script blocks successfully.`).

## Patch Update (2026-04-30) - KPI Card 3rd Badge Removed

- Completed:
  - dashboard KPI badge strip now renders only rank and title badge entries.
  - removed Title 2/extra badge from Account Active Until card.
- Files updated:
  - `index.html`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`
- Validation:
  - inline script parse check passed (`Parsed 3 inline script blocks successfully.`).

## Patch Update (2026-04-30) - Binary Tree Account Overview Equipped Title Sync

- Completed:
  - binary tree account overview now prioritizes equipped title data from achievements payload.
  - root node payload now maps profile account title fields from active badge entries.
  - removed legacy title coercion (`Legacy Builder` -> `Legacy Founder`) in binary tree overview title logic.
- Files updated:
  - `index.html`
  - `binary-tree-next-app.mjs`
  - `Claude_Notes/charge-documentation.md`
  - `Claude_Notes/Current Project Status.md`
  - `Claude_Notes/member-dashboard-page.md`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
  - inline script parse check passed (`Parsed 3 inline script blocks successfully.`).

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
