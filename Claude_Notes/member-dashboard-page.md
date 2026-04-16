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
