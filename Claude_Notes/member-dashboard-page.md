# Member Dashboard Page Notes

Last Updated: 2026-04-16

## Scope

- Page: `index.html`
- Purpose: Primary authenticated member dashboard shell and module host.

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
