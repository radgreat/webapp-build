# Back End Database Notes

Date: 2026-03-04  
Updated: 2026-03-04

## Scope

This document tracks backend/database migration preparation from JSON mock storage to PostgreSQL.

## Migration Files Added

| Order | File | Purpose | Status |
|---|---|---|---|
| 1 | `/Users/seth/Documents/Web-Dev/migrations/20260304_001_full_app_postgres_schema.sql` | Full app schema bootstrap (tables, constraints, indexes, updated_at triggers) | Prepared, not executed |
| 2 | `/Users/seth/Documents/Web-Dev/migrations/20260304_002_full_app_access_control.sql` | Roles, grants, and row-level security policies | Prepared, not executed |
| 3 | `/Users/seth/Documents/Web-Dev/migrations/20260304_003_admin_seed.sql` | Fresh-start admin-only seed data | Prepared, not executed |

## Source Stores Mapped

The PostgreSQL schema was modeled from these JSON stores:

- `registered-members.json`
- `mock-users.json`
- `mock-admin-users.json`
- `password-setup-tokens.json`
- `mock-email-outbox.json`
- `mock-store-invoices.json`
- `mock-payout-requests.json`
- `mock-runtime-settings.json`
- `mock-binary-tree-metrics.json`
- `mock-sales-team-commissions.json`

## Tables Created in Migration 001

Schema: `charge`

- `charge.member_users`
- `charge.admin_users`
- `charge.registered_members`
- `charge.password_setup_tokens`
- `charge.email_outbox`
- `charge.store_invoices`
- `charge.payout_requests`
- `charge.runtime_settings` (singleton row `id = 1`)
- `charge.binary_tree_metrics_snapshots`
- `charge.sales_team_commission_snapshots`

## Data/Type Decisions

- Money and amounts are numeric database types (`NUMERIC(...)`), not text.
- Volumes/cycles/counters are integer types with non-negative checks.
- Timestamps use `TIMESTAMPTZ`.
- Identity lookups were indexed with case-insensitive patterns (`LOWER(...)` where applicable).
- Update triggers were added for `updated_at` consistency.

## Access Control Added in Migration 002

### Roles

- `charge_admin_role` (no login role)
- `charge_service_role` (no login role)
- `charge_member_role` (no login role)

### Policy Model

- Admin/service roles: full read/write access on app tables.
- Member role: self-scoped RLS access where applicable (profile-linked tables).
- RLS enabled on all `charge` tables.

### RLS Identity Helpers

Policies rely on these request/session settings:

- `app.current_user_id`
- `app.current_username`
- `app.current_email`

Helper functions added:

- `charge.current_member_user_id()`
- `charge.current_member_username()`
- `charge.current_member_email()`
- `charge.is_owned_identity(...)`

## Admin Seed Added in Migration 003

Fresh-start bootstrap seeds only admin accounts:

- Inserts/upserts `charge.admin_users` row:
  - `id = adm_001`
  - `username = admin`
  - `email = admin@charge.com`

No member/business rows are seeded.

## Planned Run Order (Launch Time)

1. `20260304_001_full_app_postgres_schema.sql`
2. `20260304_002_full_app_access_control.sql`
3. `20260304_003_admin_seed.sql`

## Current State

- Migration files are ready.
- No migration has been executed yet.
- App backend (`serve.mjs`) is still JSON-based and will need API/query migration for production Postgres usage.

## Production Follow-Ups

- Replace plain admin password flow with hashed password verification.
- Wire backend API layer to Postgres queries.
- Remove JSON read/write dependencies from production path.

## Addendum (2026-04-25) - Upgrade Fast Track Entry-Plan Eligibility

### What Changed

- In `backend/services/member.service.js` (`upgradeMemberAccount`):
  - first-paid-upgrade Fast Track eligibility now includes both entry plans:
    - `preferred-customer-pack`
    - `membership-placement-reservation`
  - paid-to-paid upgrades still do not trigger Fast Track.

### Validation

- `node --check backend/services/member.service.js` passed.

## Follow-up Addendum (2026-04-25) - Upgrade Fast Track Sponsor Resolution

### What Changed

- Added attribution-owner fallback logic to `upgradeMemberAccount` in `backend/services/member.service.js` when direct sponsor username is unavailable.

### Validation

- `node --check backend/services/member.service.js` passed.

## Addendum (2026-04-25) - Account Upgrade Split Product Allocation Metadata + Response

### What Changed

- `backend/services/store-checkout.service.js`
  - added checkout metadata persistence for `account_upgrade_selected_product_key`.
  - upgrade finalization now reads selected split product key from metadata and forwards to `upgradeMemberAccount`.

- `backend/services/member.service.js`
  - added split allocation resolver for account upgrades (`selected` + `carryover`).
  - `upgradeMemberAccount(...)` now accepts split selected-product input and returns `upgrade.productAllocation` with:
    - selected product key/label/quantity
    - carryover product key/label/quantity
    - split label summary.

### Validation

- `node --check backend/services/store-checkout.service.js` passed.
- `node --check backend/services/member.service.js` passed.

## Addendum (2026-04-25) - Account Upgrade Product Mode Support

### What Changed

- `backend/services/store-checkout.service.js`
  - added upgrade mode normalization/resolution for checkout metadata.
  - persisted `account_upgrade_product_mode` in Stripe metadata for both checkout flows.
  - account-upgrade finalization now forwards both:
    - selected product key
    - selected product mode

- `backend/services/member.service.js`
  - account-upgrade allocation resolver is now mode-aware:
    - `all-metacharge`
    - `all-metaroast`
    - `split`
  - `upgradeMemberAccount(...)` now accepts normalized mode aliases and returns mode in `upgrade.productAllocation`.

### Compatibility

- If legacy checkout payloads provide selected product key but no mode, backend infers `split` to preserve legacy forced-split behavior for in-flight sessions.

### Validation

- `node --check backend/services/store-checkout.service.js` passed.
- `node --check backend/services/member.service.js` passed.
