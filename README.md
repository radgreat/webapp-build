# Premiere Life Web App

Premiere Life is a mock-first web app for a member and admin ecosystem focused on enrollment, binary-tree operations, store activity, and compensation tracking.

## Overview

This repository currently runs as:
- Frontend: static HTML + Tailwind + vanilla JavaScript
- Backend: Node.js HTTP server (`serve.mjs`)
- Persistence: JSON stores (prepared for PostgreSQL migration)

## Project Goals

- Deliver a reliable member experience for enrollment, profile, store, and tree visibility.
- Provide an admin control plane for placement, payouts, and operational controls.
- Keep compensation calculations deterministic and auditable.
- Ship mock-first, then migrate to database-backed APIs.
- Harden auth and authorization before production.

## Current Approved Scope

Active compensation systems in this phase:
- `2. Fast Track Bonus`
- `3. Infinity Tier Commission`
- `4. Sales Team Commission`

All compensation systems after section 4 of `brand_assets/MLM Business Logic.md` remain gated until owner approval.

## Implemented Modules

### Member App (`index.html`)
- Dashboard KPIs and commission cards
- Profile page with edit modal (name, bio, location, avatar, cover)
- Enroll Member flow with spillover placement options
- Binary Tree view with fullscreen controls and metrics
- My Store flow with rank-based discounts
- Login and password setup flow

### Admin App (`admin.html`)
- Dashboard shell and admin routes
- Admin enrollment (placement-first behavior)
- Binary tree sync from registered members
- Commission queue and payout fulfillment flows
- Force server cut-off and data reset controls
- Runtime settings management

### Backend (`serve.mjs`)
- Member/admin enrollment endpoints
- Auth and password setup endpoints
- Invoice, payout request, and commission snapshot endpoints
- Server cut-off metrics and state endpoints
- JSON-backed persistence for active domains

## Tech Stack

- Node.js
- Vanilla JavaScript (ES modules)
- Tailwind CSS (CDN)
- PixiJS (`vendor/pixi.min.js`)
- Puppeteer (screenshot workflow)

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Start local server:

```bash
npm run dev
```

3. Open in browser:
- Member app: `http://localhost:3000/`
- Member login: `http://localhost:3000/login.html`
- Admin app: `http://localhost:3000/admin.html`

## Mock Data Stores

- `mock-users.json`
- `mock-admin-users.json`
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

## PostgreSQL Migration Prep

Prepared migrations:
- `migrations/20260304_001_full_app_postgres_schema.sql`
- `migrations/20260304_002_full_app_access_control.sql`
- `migrations/20260304_003_admin_seed.sql`
- `migrations/20260308_004_cutoff_state_and_baselines.sql`

## Roadmap

### Phase 1-2: Foundation and Contracts
- Centralize business rules in deterministic modules
- Standardize data contracts across member/admin surfaces

### Phase 3: Member Completion (Current)
- Continue moving UI logic to shared rule/data modules
- Reduce duplicated inline constants
- Expand theming through existing settings flow

### Phase 4: Admin Completion (Current)
- Strengthen payout, audit, and reconciliation workflows
- Maintain user/admin parity when explicitly approved

### Phase 5: Backend and Database Migration
- Move authoritative calculations server-side
- Replace JSON store flows with PostgreSQL-backed APIs

### Phase 6: Auth and Security Hardening
- Replace mock/plain auth model with secure password handling
- Enforce server-side authorization for sensitive operations

## Notes and References

- `claude.md`
- `Claude_Notes/Current Project Status.md`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/BackEnd-Notes.md`
