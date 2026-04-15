# Preferred Accounts - Shopify Link

Last Updated: 2026-04-15
Status: In Progress (Phase 2 endpoints implemented)
Owner: Core Webapp Team

## Goal

Move public storefront UX to Shopify-hosted pages while keeping registration, attribution, checkout, BV crediting, and commission logic fully inside our own system.

## Shared Understanding (Agreed Logic)

Preferred Accounts are registered customers who:
- Buy products at a 15% discount.
- Do not participate in Binary Tree placement until they upgrade.
- Still generate business value events (BV + retail commission effects) tied to attribution.

Attribution routes:
1. Attribution Link Route (member store code)
- Preferred account is tied to that member/store owner.
- Store owner receives credit rules (BV + retail commission by package rules).
- If preferred user upgrades later, sponsor/placement flow is available (left/right/spillover logic).

2. No Attribution Route (direct website entry)
- Preferred account is parked under admin/unattributed bucket.
- Admin later assigns/transfers to a target member/sponsor path.

## Target Platform Split

Shopify responsibilities:
- Marketing storefront pages, product presentation, CTA entrypoints.
- Traffic source and campaign routing only.

Our app responsibilities:
- Attribution claim validation and lock.
- Preferred registration.
- Stripe checkout and order finalization.
- Invoice/BV/commission posting.
- Admin parking + reassignment tools.

## End-to-End Flow (Future State)

1. User lands on Shopify storefront page.
2. Shopify CTA sends user to our domain with signed attribution token.
3. Backend validates token and creates a server-side attribution claim.
4. User completes Preferred registration on our page.
5. Registration stores immutable attribution snapshot on user.
6. User proceeds to checkout in our system.
7. Checkout/session creation pulls attribution from server-side user record only.
8. Stripe success webhook/return finalizes invoice and credits BV/commission using locked attribution.
9. If no attribution, user remains in admin parking queue until assigned.

## Backend Plan (Implementation Phases)

## Phase 1 - Data Model and Attribution Lock

Create/extend persistence:
- `attribution_claims`
  - `id`, `nonce`, `source`, `owner_user_id`, `owner_store_code`, `campaign`, `product_id`, `issued_at`, `expires_at`, `consumed_at`, `status`, `raw_payload`
- `preferred_accounts` (or existing user/member table extension)
  - `attribution_mode` (`member_link` | `admin_parking`)
  - `attribution_owner_user_id` (nullable)
  - `attribution_store_code` (nullable)
  - `attribution_claim_id` (nullable)
  - `attribution_locked_at`
- `store_invoices` / checkout snapshot extension
  - immutable `attribution_snapshot_json`
  - immutable `settlement_profile_json` (who gets BV/commission and why)

Rules:
- Attribution is written once at registration completion.
- Checkout cannot override attribution from request payload.
- Invoice uses snapshot from locked user attribution at time of checkout.

## Phase 2 - Claim and Redirect Endpoints

Implement endpoints:
- `GET /go/preferred-register`
  - accepts signed token (`at`)
  - validates signature, expiry, nonce
  - resolves owner/store or no-attribution fallback
  - writes claim record
  - sets httpOnly claim/session cookie
  - redirects to `/store-register` (or new `/preferred/register`)

- `GET /api/preferred/claim`
  - returns sanitized claim summary for UI display
  - no sensitive verification payload returned

Security:
- Signed token (HMAC/JWT)
- Short expiration (15-30 min)
- One-time nonce replay protection
- Origin/source tagging for audit

## Phase 3 - Registration Integration

Registration backend changes:
- On submit, read claim from server session/cookie (not query params).
- Persist locked attribution fields to new preferred user.
- If claim missing/expired:
  - fallback to `admin_parking` mode (or reject, based on policy toggle).

Validation:
- Never trust frontend `storeCode` for attribution writes.
- Log every attribution decision path.

## Phase 4 - Checkout and Settlement Enforcement

Checkout session creation:
- Require authenticated preferred user.
- Resolve attribution from user record only.
- Ignore client-supplied attribution fields.
- Build Stripe metadata from locked attribution snapshot.

Checkout completion:
- Resolve settlement profile:
  - `member_link`: credit linked owner per package rules
  - `admin_parking`: credit admin holding account or queue for reassignment rules
- Persist invoice attribution snapshot.
- Post BV and retail commission idempotently.

## Phase 5 - Admin Parking and Reassignment Controls

Admin tools:
- Queue view for unattributed preferred accounts.
- Transfer action to assign owner/sponsor.
- Audit trail table for transfer history (`from`, `to`, `reason`, `actor`, `timestamp`).

Post-transfer policy decision (required):
- Option A: historical invoices stay with original attribution snapshot (recommended).
- Option B: future purchases use reassigned attribution; historical remains immutable.

## Phase 6 - Decommission Current Public Store UI

After backend is stable:
- Keep compatibility routes only (`/store`, `/store-checkout` redirects as needed).
- Remove legacy guest checkout/public storefront logic from active user path.
- Keep minimal fallback pages for direct traffic.

## Commission/BV Rule Mapping Checklist

Define and lock these backend rules before go-live:
- Preferred purchase discount rate (15%).
- BV calculation source and rounding rules.
- Retail commission by member package mapping.
- No-attribution (admin parking) settlement destination.
- Upgrade transition behavior (preferred -> builder/package) and binary-tree eligibility trigger.

## Required Safeguards

- Idempotency keys for checkout creation/finalization.
- Replay-safe claim consumption.
- Immutable attribution snapshot per invoice.
- Structured audit logs for attribution decisions.
- Backfill/migration scripts for existing preferred users and invoices.

## Delivery Sequence (Recommended)

1. Build attribution claims + lock model.
2. Wire `/go/preferred-register` + claim validation.
3. Wire registration to locked claim.
4. Wire checkout to locked user attribution only.
5. Add admin parking transfer tools.
6. Migrate traffic from current public store to Shopify CTAs.
7. Remove/deprecate old public store checkout paths.

## Acceptance Criteria

- Attribution-link registrations always lock to correct member owner.
- Direct registrations always park under admin flow.
- Checkout cannot be forced to another store owner via URL/body tampering.
- Invoice/BV/commission outputs match locked attribution snapshot.
- Admin transfer affects only allowed future behavior per policy.
- Full audit trail exists for claim creation, registration lock, checkout settlement, and transfer events.

## Open Decisions Needed

- Expired/missing claim behavior: block registration vs auto-admin parking fallback.
- Admin parking settlement: immediate admin credit vs pending queue-only until manual assignment.
- Transfer policy for future purchases (and whether cooldown/approval is needed).
- URL/token format standard for Shopify CTA links.

## Phase 1 Progress (Implemented 2026-04-15)

Completed backend foundation:
- Added new store module: `backend/stores/preferred-attribution.store.js`
  - schema warmup for:
    - `charge.preferred_attribution_claims`
    - `charge.preferred_account_attribution_locks`
  - claim helpers:
    - create
    - find by nonce/id
    - consume (single-use guard)
  - lock helpers:
    - upsert by user id
    - find by user id.
- Wired startup warmup in `backend/app.js` via `warmPreferredAttributionStoreSchema`.
- Extended `charge.store_invoices` schema support in `backend/stores/invoice.store.js`:
  - `attribution_snapshot_json` (jsonb)
  - `settlement_profile_json` (jsonb)
  - mapping + sanitize/read/write support.
- Updated invoice creation paths to pass snapshot data:
  - `backend/services/invoice.service.js`
  - `backend/services/store-checkout.service.js`.

Validation completed:
- `node --check backend/stores/preferred-attribution.store.js`
- `node --check backend/stores/invoice.store.js`
- `node --check backend/services/invoice.service.js`
- `node --check backend/services/store-checkout.service.js`
- `node --check backend/app.js`

## Phase 2 Progress (Implemented 2026-04-15)

Completed endpoint and token infrastructure:
- Added new preferred attribution service/controller/route modules:
  - `backend/services/preferred-attribution.service.js`
  - `backend/controllers/preferred-attribution.controller.js`
  - `backend/routes/preferred-attribution.routes.js`
- Wired route registration in `backend/app.js`.

Implemented endpoints:
- `GET /go/preferred-register`
  - validates signed attribution token (`at`)
  - validates nonce + expiry + signature
  - resolves owner by user id / store code
  - writes `preferred_attribution_claims` row
  - sets signed httpOnly claim cookie
  - redirects to `/store-register.html` (with `?store=` when attributed).
- `GET /api/preferred/claim`
  - reads signed claim cookie
  - returns sanitized claim summary only
  - clears stale/invalid/expired claim cookies.
- `GET /api/member-auth/preferred/attribution-link`
  - requires authenticated member bearer token
  - generates signed redirect URL/token for sharing
  - resolves member store code from user profile codes.

Security behavior implemented:
- HMAC-SHA256 signed tokens (`PREFERRED_ATTRIBUTION_SIGNING_SECRET`).
- Short-lived token expiry support (default 30 minutes).
- Nonce replay protection (`find claim by nonce` before create + duplicate guard).
- Signed claim cookie integrity check before claim lookup.

Domain and link-generation configuration notes:
- To issue production links on your primary domain, set:
  - `PREFERRED_ATTRIBUTION_LINK_ORIGIN=https://ldpremiere.com`
- Keep app origin aligned for frontend route resolution:
  - `PUBLIC_APP_ORIGIN=https://ldpremiere.com` (or your active web origin).
- Required for token signing:
  - `PREFERRED_ATTRIBUTION_SIGNING_SECRET=<strong-random-secret>`
- Optional overrides:
  - `PREFERRED_REGISTER_REDIRECT_PATH=/store-register.html`
  - `PREFERRED_ATTRIBUTION_TOKEN_TTL_SECONDS=1800`
  - `PREFERRED_ATTRIBUTION_COOKIE_NAME=charge_preferred_claim`.

Current member link-generation state:
- Existing frontend share links are still plain `?store=` URLs in UI code.
- Phase 2 backend now exposes signed link generation endpoint so UI can migrate to tokenized share links in the next pass.

Validation completed:
- `node --check backend/services/preferred-attribution.service.js`
- `node --check backend/controllers/preferred-attribution.controller.js`
- `node --check backend/routes/preferred-attribution.routes.js`
- `node --check backend/app.js`

### Phase 2 Follow-up (2026-04-15) - One Static CTA Compatibility

- `/go/preferred-register` now supports a missing `at` token by redirecting to the preferred registration route as unattributed flow.
- This allows Shopify to use a single static CTA URL while still supporting attributed flow when tokenized links are present.

### Domain Note (2026-04-15)

- Active testing host configured as `https://test.ldpremiere.com` for preferred attribution link generation and redirect origin.

### Phase 2 Follow-up (2026-04-15) - Permanent Member Share Link Mode

- Member-generated preferred attribution links are now reusable (no single-use nonce rejection on token reuse).
- Claim ingestion still creates per-visit claim records for audit, but token itself remains valid for repeated use.
- Long-lived member link TTL is now env-driven via `PREFERRED_ATTRIBUTION_PERMANENT_LINK_TTL_SECONDS` (set to 10 years in `.env`).

### Phase 2 Follow-up (2026-04-15) - Legacy Store-Link Naming Removed

- Backend member store-code generation no longer emits prefixed formats like `CHG-*` or `M-*`.
- New and regenerated store codes are random uppercase alphanumeric values (letters + numbers).
- Existing user records were refreshed with full rotation:
  - command run: `node backend/scripts/backfill-user-store-links.mjs --refresh-all`
  - rotated fields: `storeCode`, `publicStoreCode`, and `attributionStoreCode` (attribution remapped to sponsor’s refreshed code).
- Verification confirmed no remaining legacy-prefixed values in member code fields.

Operational note:
- Because all legacy codes were rotated, older previously shared prefixed store links should be considered stale and replaced with newly generated links.
