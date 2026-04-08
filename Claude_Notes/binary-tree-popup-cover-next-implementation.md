# Binary Tree Popup Cover - Next Implementation Plan

Last Updated: 2026-04-08

## Objective

- Extend popup-cover behavior so it works consistently for:
  - the current user node
  - all other member nodes
  - any node without a saved cover (placeholder fallback).

## Recent Bug Recap (Fixed)

- Bug observed:
  - popup appeared to "remove" cover image on some node clicks.
- Root cause:
  - popup placement stayed above near-top nodes, which pushed popup top negative and clipped the cover strip out of the visible canvas.
- Fix location:
  - `binary-tree.mjs` -> `positionSelectedNodePopup(...)`
  - added below-node fallback + pointer orientation handling so cover strip remains visible.

## Routes To Check

### App Page Routes (Frontend Navigation)

- `/BinaryTree` -> open node popup, verify cover rendering per node.
- `/Profile` -> upload/save cover image, then return to Binary Tree and verify sync.
- `/dashboard` -> baseline route used before navigating to Binary Tree (sanity check state/session flow).

### API Routes (Data Source For Node Payloads)

- `GET /api/registered-members` (member app source list)
- `GET /api/admin/registered-members` (admin app source list)
- `PATCH /api/registered-members/:memberId/placement` (tree placement updates can trigger tree re-renders)
- `PATCH /api/admin/registered-members/:memberId/placement`

## File/Function Map (Where To Look)

- `index.html`
  - Page route map: `pagePathByPage` (`/Profile`, `/BinaryTree`, etc.).
  - Profile local customization store:
    - `readMemberProfileCustomizationStore()`
    - `resolveEffectiveMemberProfile()`
    - `persistEffectiveMemberProfile(...)`
  - Cover upload and in-session sync:
    - `handleProfileImageSelection(...)`
    - `syncBinaryTreeFromRegisteredMembers(...)`
  - Node payload cover assignment:
    - `resolveMemberNodeCoverFromProfileStore(...)`
    - `createBinaryTreeDataFromRegisteredMembers(...)` (`profileCoverUrl` on member/root nodes)

- `admin.html`
  - Admin node-cover fallback from local store:
    - `resolveMemberNodeCoverFromProfileStore(...)`
  - Admin tree payload cover assignment:
    - `createBinaryTreeDataFromRegisteredMembers(...)` (`profileCoverUrl`)
  - Tree refresh:
    - `syncBinaryTreeFromRegisteredMembers(...)`

- `binary-tree.mjs`
  - Node model normalization:
    - `normalizeNode(...)` (`profileCoverUrl || coverUrl || coverDataUrl`)
  - Popup cover rendering:
    - `buildSelectedNodePopup(...)`
    - `loadPopupCoverTexture(...)`
  - Popup placement/visibility (recent bug area):
    - `positionSelectedNodePopup(...)`

- `backend/routes/member.routes.js`
  - Route definitions feeding frontend member/admin registered-member fetches.

- `backend/stores/member.store.js`
  - Current persisted member shape (does not yet include profile cover fields).

## Current Limitation To Address Next

- Cover sync for non-root users still depends heavily on browser-local customization fallback.
- Backend registered-member store payload currently does not persist/return dedicated profile cover fields for every member.

## Next Implementation Scope

1. Finalize all-node cover sync behavior
- Ensure every node uses the same deterministic source order for popup cover:
  - `profileCoverUrl`
  - `coverDataUrl`
  - `coverUrl`
  - fallback placeholder asset/style.

2. Add explicit placeholder cover behavior
- If no valid cover source exists, render a clean placeholder cover (no blocking decorative artifacts).
- Placeholder must still respect popup top-strip mask and border radius.

3. Standardize fallback between member/admin pages
- Keep identical cover resolution behavior in both `index.html` and `admin.html` builders.

4. Define backend persistence follow-up (optional phase)
- Add profile cover field support in registered-member persistence so all nodes can sync across sessions/devices without relying only on local storage.

## Acceptance Criteria

- Clicking any node in `/BinaryTree` shows:
  - real cover image when available
  - placeholder cover when unavailable
  - no cover clipping at top viewport edges.
- Uploading a new cover in `/Profile` updates that node popup without full page reload.
- Behavior matches in both member and admin binary tree views.
- No bleed over popup rounded corners and no blocking cover overlays over real images.

## QA Checklist (Next Pass)

- Test root node with cover.
- Test non-root node with cover.
- Test non-root node without cover.
- Test node near top edge (placement fallback).
- Test node near left/right edge (popup X clamp).
- Test member page and admin page parity.

