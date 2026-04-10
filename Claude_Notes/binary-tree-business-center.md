# Binary Tree Business Center Notes

Last Updated: 2026-04-10

## Scope

- Feature: Business Center placeholder nodes in binary tree.
- Area: Member-auth backend APIs, registered member storage model, binary tree summary logic, and dashboard activation UI.

## What Changed

- 2026-04-10 follow-up (next-gen figma-style canvas redesign pass):
  - replaced prior mixed DOM chrome in `binary-tree-next` with full-canvas UI composition
  - left panel, right panel, center strip, and bottom tool panel now render directly in canvas layer
  - updated center workspace clipping + pan/zoom/select interactions to operate within canvas-rendered shell bounds
  - preserved source-aware session bootstrap checks (`member`/`admin`)
  - extended adapter projection options for workspace-anchored render placement.
- 2026-04-10 follow-up (next-gen phase B shell controls + module split):
  - moved `binary-tree-next` runtime from inline script to module entry architecture:
    - `binary-tree-next-app.mjs`
    - `binary-tree-next-engine-adapter.mjs`
  - added camera and viewport shell controls in next app:
    - zoom in/out, fit-to-view, reset
    - connector/grid/highlight toggles
    - keyboard pan/zoom/reset/fit shortcuts
  - added explicit compute adapter contract and runtime mode diagnostics:
    - adapter now handles filtering/layout projection/connector-frame output
    - mode probe reports mock-js vs wasm-bridge-pending to diagnostics
  - outcome: next app now has clear shell/compute separation prior to C++/Wasm engine swap-in.
- 2026-04-10 follow-up (next-gen phase A foundation implementation):
  - implemented the first runtime delivery for the next Binary Tree track:
    - new isolated app page: `binary-tree-next.html`
    - backend route mounts for `/binary-tree-next` and `/binary-tree-next.html`
  - added launch controls from live tree surfaces:
    - member `index.html` tree header `Next-Gen` button
    - admin `admin.html` tree header `Next-Gen` button
  - launch flow now opens isolated next app with source context:
    - member -> `/binary-tree-next?source=member`
    - admin -> `/binary-tree-next?source=admin`
  - added new-window boot-time session checks:
    - member token validation via `GET /api/member-auth/email-verification-status`
    - invalid member sessions redirect to `/login.html`
    - missing admin session redirects to `/admin-login.html`
  - added mock render harness in new app window (header rail, tool dock, viewport canvas, details panel, diagnostics strip) for safe parallel iteration prior to Wasm integration.
- 2026-04-09 follow-up (next-gen architecture planning pass):
  - added dedicated next implementation planning file:
    - `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
  - captured approved strategy to keep existing Binary Tree live while building a separate new-window Binary Tree app in parallel
  - documented target next-gen stack direction:
    - C++ -> WebAssembly for tree engine core
    - TypeScript/optional React shell for UI and controls
  - documented migration flow:
    - no immediate cutover
    - shift only after parity + performance gates.
- 2026-04-08 follow-up (next implementation note for popup cover rollout):
  - added dedicated planning note: `Claude_Notes/binary-tree-popup-cover-next-implementation.md`
  - documented exact routes and code touchpoints for next phase:
    - `/Profile`, `/BinaryTree`
    - `/api/registered-members`, `/api/admin/registered-members`
    - `index.html`, `admin.html`, `binary-tree.mjs`, backend member route/store files
  - captured recent bug recap: popup cover appeared removed because top strip was clipped when above-node placement exceeded viewport.
- 2026-04-08 follow-up (cover-only revision, preserve prior popup container style):
  - narrowed cleanup scope to cover strip only (no broader popup container styling changes)
  - replaced cover clip with dedicated top-strip mask (top-radius clip + straight bottom) to remove edge bleed
  - retained suppression of blocking accent overlays for nodes with real cover images.
- 2026-04-08 follow-up (popup cover cleanup pass from visual QA screenshot):
  - disabled blocking decorative cover overlays whenever a node has a real cover image
  - clipped popup cover image layer to popup card frame so cover respects rounded border radius
  - retained subtle tint overlay only for text/foreground readability.
- 2026-04-08 follow-up (binary-tree popup cover renderer fix):
  - reproduced popup cover non-render behavior even with populated node `profileCoverUrl`
  - removed cover mask dependency in popup cover sprite path
  - added explicit `Image` decode fallback in cover texture loader for uploaded `data:image/...` profile covers
  - validated popup cover render with both local-asset and data-url node cover sources.
- 2026-04-08 follow-up (cover investigation + render-layer fix):
  - diagnosed missing popup cover visibility as layered-render conflict (custom cover image under near-opaque procedural tint)
  - diagnosed stale in-session sync path: profile cover changes updated profile UI but tree node payloads were not immediately rebuilt
  - patched profile save/upload flows to trigger `syncBinaryTreeFromRegisteredMembers()` for immediate popup refresh
  - reduced tint opacity and increased cover-image alpha in selected-node popup rendering (`binary-tree.mjs`)
  - added member cover fallback hydration from local profile customization store in:
    - `index.html` tree member node builder
    - `admin.html` tree member node builder
  - known limitation: backend registered-member API still does not persist/serve profile cover fields globally for all members.
- 2026-04-08 follow-up (node-wide cover-photo sync):
  - wired selected-node popup cover to use per-node `profileCoverUrl` when present
  - propagated `profileCoverUrl` from member/root tree payload builders in both `index.html` and `admin.html`
  - behavior now applies to any node with configured profile cover, not only the active user profile.
- 2026-04-08 follow-up (dynamic popup height for metrics capacity):
  - replaced fixed popup-height dependency with runtime computed popup height for selected-node card
  - ensured minimum metrics panel capacity when header spacing increases
  - updated popup positioning/pointer math to use stored computed height.
- 2026-04-08 follow-up (popup metrics panel recovery after spacing pass):
  - corrected lower-row (`Cycles` / `Direct`) layout drift by increasing metrics panel usable height
  - retained the requested section order (`BINARY TREE DATA` below separator) and added header/data breathing room.
- 2026-04-08 follow-up (popup username/data spacing relief):
  - reduced visual crowding between popup `@username` row and `BINARY TREE DATA` heading
  - adjusted header text/section-label vertical offsets only (no metrics container resize)
  - preserved left-avatar header alignment and inline username+icon row behavior from prior pass.
- 2026-04-08 follow-up (popup header left-anchor restore):
  - restored popup avatar position to left-side header placement (removed centered-avatar variant)
  - moved member name to a row below the avatar while keeping text left-anchored
  - kept `@username` and badge icons inline on the same row with compact spacing
  - retained previously added badge subtitle/date synchronization logic for hovercard metadata.
- 2026-04-08 follow-up (popup icon/date sync + centered identity stack):
  - moved selected-node popup identity stack to centered avatar-first layout (name + `@username` directly under profile photo)
  - tightened popup badge icon rhythm (`18px` icon size, `2px` icon gap) so badges render as a compact row
  - synced badge hover popup subtitles with profile badge description/date metadata by consuming:
    - `profileBadgeRankSubtitle`
    - `profileBadgeTitleSubtitle`
    - `profileBadgeExtraSubtitle`
  - added rank subtitle fallback to `Subscriber since <addedAt>` when explicit subtitle metadata is not present
  - propagated subtitle fields from `index.html` and `admin.html` node payload builders into `binary-tree.mjs` normalization.
- 2026-04-08 follow-up (popup spacious-container expansion):
  - expanded popup frame dimensions to reduce cramped text/metrics
  - enlarged cover, avatar, and typography sizing for better legibility
  - increased badge and metric panel spacing to give binary data more breathing room
  - preserved existing popup data fields and privacy behavior.
- 2026-04-08 follow-up (popup full cleanup + tighter grid):
  - rewrote popup layout with a consistent spacing/grid system for cleaner visual rhythm
  - increased card dimensions and redistributed identity/metrics spacing to prevent cramped text
  - retained minimal component stack and removed online/status icon completely
  - added subtle center divider for clearer left/right metric grouping.
- 2026-04-08 follow-up (popup sizing + icon removal):
  - increased popup card canvas and internal spacing to reduce cramped text/metrics
  - increased cover and avatar sizing to match larger card proportions
  - removed avatar online/status icon from popup UI
  - kept simplified low-container popup structure.
- 2026-04-08 follow-up (popup simplification pass):
  - reduced popup complexity per UX feedback ("too much containers")
  - removed bubble/badge/panel-heavy structures and decorative layering
  - kept a minimal popup hierarchy: cover, avatar/status, identity text, rank line, compact 2x2 binary metrics.
- 2026-04-08 follow-up (discord-inspired popup restyle):
  - restyled selected-node popup into a richer profile-card presentation while keeping existing binary data semantics
  - added layered banner treatment, bio bubble row, larger avatar with status dot, and badge strip
  - introduced elevated `BINARY SNAPSHOT` panel for left/right/cycles/direct metrics
  - increased popup dimensions and retuned internal spacing to avoid section clipping.
- 2026-04-08 follow-up (selected-node popup profile card):
  - added click popup anchored above selected node in `binary-tree.mjs`
  - popup now presents quick profile context: cover header, initials avatar, rank, status
  - included binary summary metrics in popup body (`Left Team`, `Right Team`, `Cycles`, `Direct`) and cycle eligibility text
  - integrated popup position updates with pan/zoom/camera animations/minimap navigation
  - added popup cleanup/rebuild paths during tree clear, empty state, and renderer lifecycle.
- 2026-04-08 follow-up (deep anticipation consistency fix):
  - added selected-parent local anticipation placement mode to keep left/right placeholders near parent context
  - introduced fixed side offsets + vertical-step collision resolution before any large horizontal displacement
  - reduced depth-level long/short anticipation connector variance that could imply wrong slot placement.
- 2026-04-08 follow-up (selected-node open-slot anticipation):
  - replaced leaf-only anticipation gating with available-slot gating
  - selected node now renders anticipation for each missing side independently (`left`, `right`, or both).
- 2026-04-08 follow-up (selected-leaf anticipation behavior):
  - changed anticipated-slot rendering from broad fullscreen visibility to selected-node trigger
  - anticipated slots now render only when selected node is a leaf (no left/right child)
  - fullscreen select/clear actions now force tree re-render so anticipation visibility updates immediately.
- 2026-04-08 follow-up (zoom cascade chunk reveal):
  - implemented fullscreen cascade visibility with depth-4 baseline + zoom-depth chunk expansion
  - focused viewport chunk roots (depth 4) now control deeper child reveal
  - selected-node ancestor path is retained for continuity
  - render pipeline now filters links/nodes/spillover/anticipation by resolved visible-node subset.
- 2026-04-08 follow-up (aggressive spacing retune):
  - increased fullscreen whole-tree width boost and width-depth-cap boost for placement readability
  - made center-gap split depth-aware so deeper rows open wider around the middle lane
  - increased anticipated-slot base collision gap, depth-growth multiplier, and side-offset strength.
- 2026-04-08 follow-up (middle spacing expansion):
  - added explicit center-gap transform for fullscreen anticipation layout (`ENROLL_MIDDLE_GAP`)
  - left/right halves are pushed away from center while root stays centered
  - applied same center-gap mapping to anticipated-slot seeds before overlap resolution.
- 2026-04-08 follow-up (always-on anticipation mode):
  - switched anticipation-slot visibility from enroll-toggle-driven to fullscreen-always-on
  - `collectEnrollAnticipationSlots` now keys on fullscreen/data/layout only
  - render path uses fullscreen anticipation state for LOD/spacing consistency
  - mobile Enroll toggle control is hidden; fullscreen anticipation is now default behavior.
- 2026-04-08 follow-up (enroll whole-tree shift request):
  - enabled controlled global width shift when Enroll mode is active (slot-width + depth-cap boost)
  - keeps modern compact layout path while widening world geometry for enrollment clarity
  - tightened anticipated-node spacing constants to reduce residual overlap in dense/deep rows.
- 2026-04-08 follow-up (enroll anticipation visual/spacing hardening):
  - replaced enroll anticipation connector routing from curved Bezier paths to orthogonal elbow paths
  - connector behavior now matches the active T/inverted-T connector direction language used by normal child edges
  - added `resolveEnrollAnticipationPositions(...)` to prevent anticipated-slot overlap by depth bucket
  - anticipation spacing now resolves collisions against both real nodes and other anticipation nodes while preserving left/right side intent.
- 2026-04-08 follow-up (enroll layout stability fix):
  - removed enroll-mode switch to legacy full-slot geometry in render path
  - enroll mode now reuses the same compact layout options as standard tree view
  - anticipated enrollment nodes remain enabled in enroll mode, now overlaid without shifting base layout
  - supersedes prior note that enroll mode intentionally used full-slot spacing.
- 2026-04-08 follow-up (enroll toggle naming correction):
  - reverted fullscreen toggle visible label back to `Enroll Member`
  - removed `Show Anticipated` / `Hide Anticipated` button copy
  - kept anticipated-slot rendering behavior tied to enroll mode (behavior unchanged).
- 2026-04-08 follow-up (anticipated-node visibility + visual alignment):
  - updated fullscreen enroll toggle copy/state to `Show Anticipated` / `Hide Anticipated`
  - adjusted aria/title labels to describe anticipated-node visibility directly
  - replaced enroll anticipation rectangle cards with compact circular placeholders
  - anticipated slot visuals now use center `+` glyph and explicit `LEFT`/`RIGHT` leg label
  - updated anticipation bounds + connector target math for circle-node geometry.
- 2026-04-08 follow-up (deep-node X-axis spacing correction):
  - reverted the prior deep-level Y-axis spacing expansion
  - added depth-aware horizontal spacing growth for deeper rows in collision/overlap handling
  - preserves compact top levels while expanding bottom-row side-to-side spacing.
- 2026-04-08 follow-up (deep-node vertical spacing expansion):
  - added progressive depth-based Y spacing so deeper levels gain more vertical gap
  - synced placeholder slot Y resolution to the same depth spacing function to keep alignments consistent.
- 2026-04-08 follow-up (T / inverted-T branch connectors):
  - changed parent-child connector rendering to orthogonal branch routing
  - two-child nodes now render an inverted-T branch bar
  - single-child nodes now render elbow-style left/right branches to avoid center ambiguity.
- 2026-04-08 follow-up (single-child branch-side line anchor):
  - updated parent-child connector routing to be side-aware (`left` or `right`)
  - single-child nodes now draw from the correct side anchor instead of appearing center-attached.
- 2026-04-08 follow-up (edge-anchored circle connectors):
  - changed normal child connectors from center-to-center to edge-to-edge line anchors
  - prevents lines from passing through circle initials and reduces visual ambiguity
  - applied matching edge anchors for spillover connector geometry.
- 2026-04-08 follow-up (circle-node overlap positioning fix):
  - added per-depth collision-avoidance pass for normal tree layout
  - enforces minimum horizontal spacing so compressed rows no longer stack circles at the same x
  - recenters each adjusted depth row and recalculates bounds after spread.
- 2026-04-08 follow-up (baseline simplified node rendering):
  - simplified binary tree node visuals to circle nodes with initials only
  - replaced card detail blocks with a single centered initials label per node
  - switched normal parent-child connectors to simple straight lines
  - updated node bounds/hit testing for circular interaction areas
  - compressed normal layout spacing further by lowering base slot width and minimum layout width
  - kept enroll placeholder rendering intact for enrollment mode.
- 2026-04-08 follow-up (map-world zoom behavior + compact global spacing):
  - switched normal binary-tree browsing to keep the full graph rendered in one stable world (no depth-cull node hiding)
  - changed semantic zoom to control detail density only:
    - far: minimal node card details
    - mid: primary identity/status details
    - near: full node details
  - removed hidden-descendant `+N more` chips tied to visibility-pruned LOD
  - added map-home camera defaults (`TREE_MAP_HOME_ZOOM`, `TREE_MAP_HOME_VIEWPORT_Y_RATIO`) for initial view/reset baseline
  - tightened horizontal spread in normal mode with a capped world width depth (`TREE_WORLD_LAYOUT_WIDTH_DEPTH_CAP`) and compact slot width
  - kept enroll anticipation mode uncapped to preserve placeholder placement clarity.
- 2026-04-08 follow-up (map-style semantic zoom / LOD):
  - implemented depth-based semantic zoom for tree usability:
    - far depth `<= 3`
    - mid depth `<= 5`
    - near full depth
  - added zoom hysteresis to stabilize mode transitions while zooming
  - added `+N more` chips on frontier nodes to indicate hidden descendants
  - updated camera hooks (zoom/focus/fit/reset/restore) to refresh LOD automatically
  - filtered link + spillover rendering to visible-node set
  - updated fit bounds to visible LOD scope for better starting readability.
- 2026-04-08 follow-up (LOD width compression pass):
  - added layout `widthDepthCap` option so tree width scales to active LOD depth
  - render flow now resolves LOD before layout, then applies capped width depth in far/mid modes
  - keeps geometry direction stable while compressing horizontal spacing.
- 2026-04-08 follow-up (tree usability compaction):
  - updated `binary-tree.mjs` layout strategy to reduce horizontal over-expansion in normal tree browsing mode
  - rolled back structural compaction variants and kept original slot-based geometry
  - added adaptive x-axis-only compression for sparse trees so direction is preserved while spread is reduced
  - preserved legacy full-slot spacing only when enroll anticipation placeholders are active.
- 2026-04-08 follow-up (simulation retune for live-testing):
  - recreated missing script `backend/scripts/simulate-zeroone-live-test.mjs`
  - added reset-first flow for `zeroone` simulation artifacts
  - changed simulation behavior to generate exactly 50 total nodes with randomized sponsor graph (not 50 direct sponsors)
  - enforced paid-only generated packages (preferred customers excluded)
  - added report outputs for binary BV/cycles, sales team commissions, achievements, and tier cards
  - validated run output via report: `backend/scripts/reports/zeroone-live-test-zeroone-20260408012540525-tstltn.json`.
- 2026-04-08 follow-up (stability + reset hygiene):
  - reverted Business Center activation test data for `zeroone` by restoring original primary node and removing the generated replacement row
  - restored affected downline sponsor linkage from placeholder username back to `zeroone`
  - hardened admin flush browser cleanup to remove additional member cache keys tied to Business Center-era UI/runtime state
  - updated admin flush feedback to include binary-tree snapshot and sales-team commission clear totals.
- Added authenticated Business Center APIs:
  - `GET /api/member-auth/business-centers`
  - `POST /api/member-auth/business-centers/progress`
  - `POST /api/member-auth/business-centers/activate`
- Mounted Business Center routes in backend app (`backend/app.js`).
- Implemented Business Center controller bridge (`backend/controllers/member-business-center.controller.js`).
- Added Business Center route module (`backend/routes/member-business-center.routes.js`).
- Extended Business Center service behavior:
  - manual side-pinned activation
  - one-by-one activation
  - placeholder creation and active-node insertion
  - staff/admin exclusion handling
  - progress ledger sync from completed legacy tiers
  - fixed placeholder sponsor rewire edge case
  - zeroed placeholder personal-volume fields to prevent duplication.
- Integrated Business Center panel in `index.html`:
  - status chip, cap/pending/overflow summary
  - side select (`left`/`right`)
  - activate button + inline feedback
  - automatic progress sync from Legacy Leadership completed tiers.
- Updated tree-level KPI logic to exclude Business Center placeholders from member KPIs while keeping placeholders visible.
- 2026-04-08 follow-up (node popup icon hovercard + sticky-hover fix):
  - switched popup icon resolver output to structured icon entries with hover metadata
  - added per-icon hover popup window for rank/title1/title2 icon rows
  - removed scale-up hover animation that could visually remain enlarged after interaction
  - added explicit hover reset/hide handlers (`pointerout`, `pointerup`, `pointerupoutside`) for consistent icon state.
- 2026-04-08 follow-up (KPI hovercard parity + icon placement alignment):
  - replaced in-canvas icon hover window with DOM hovercard flow modeled after dashboard Account Status KPI badge behavior
  - added viewport-aware top/bottom hovercard placement and delayed hide lifecycle
  - adjusted popup icon row vertical anchoring to keep icons aligned with the `@username` text row
  - added hovercard/timer cleanup during popup and controller teardown.
- 2026-04-08 follow-up (popup icon hit-box + hover visibility repair):
  - fixed popup header icon sprite sizing drift by loading textures before sprite mount and enforcing fixed icon bounds
  - switched selected-node popup container to stable static event mode for consistent pointer interactions
  - updated popup icon anchor mapping with live canvas metrics for accurate hovercard placement
  - matched KPI hovercard style tokens and raised hovercard stack order so the tooltip stays visible above binary-tree canvas layers.
- 2026-04-08 follow-up (popup cover reliability recovery):
  - fixed selected-node cover strip logic to only enter image-overlay mode after confirmed texture readiness
  - added popup cover source fallback support for `profileCoverUrl`, `coverDataUrl`, and `coverUrl`
  - kept procedural fallback cover styling when image load fails or times out, preventing "cover removed" regressions in node popups.
- 2026-04-08 follow-up (popup cover clipping/placement fix):
  - locally reproduced node-popup cover disappearance and confirmed the visible issue was top-strip clipping on near-top node selections
  - updated selected-node popup placement to support below-node fallback when above-node placement cannot fit viewport bounds
  - added upward pointer rendering for below placement while preserving downward pointer rendering for above placement
  - result: popup cover strip remains inside visible canvas card area instead of being clipped out.

## Files Updated

- `admin.html`
- `backend/app.js`
- `backend/controllers/member-business-center.controller.js`
- `backend/routes/member-business-center.routes.js`
- `backend/services/member-business-center.service.js`
- `backend/services/member.service.js`
- `backend/stores/member.store.js`
- `backend/scripts/simulate-zeroone-live-test.mjs`
- `binary-tree-next-app.mjs`
- `binary-tree-next-engine-adapter.mjs`
- `binary-tree-next.html`
- `binary-tree.mjs`
- `index.html`
- `Claude_Notes/charge-documentation.md`
- `Claude_Notes/Current Project Status.md`
- `Claude_Notes/binary-tree-next-gen-wasm-plan.md`
- `Claude_Notes/binary-tree-business-center.md`

## Design Decisions

- Storage model: reuse `registered_members` rows for Business Center placeholders.
- Progress source: canonical completed tier counter (`completedLegacyTierCount`) synchronized server-side.
- Activation model: manual, one-per-click, user-selected pin side.
- KPI policy: Business Center placeholders remain visible in tree but are excluded from member KPI counts.

## Known Limitations

- Requires valid member auth bearer token to access/activate Business Centers.
- Existing running server process must be restarted to pick up new mounted routes.
- Staff/admin lockout depends on `isStaffTreeAccount` flag being set on target accounts.
- Simulation runtime remains slow at scale because member enrollment currently performs full-store rewrite operations per creation.
- LOD currently controls card-detail visibility only; it does not yet cluster deep subtrees into aggregate map tiles.
- Selected-node popup is currently informational only (no inline actions/edit controls yet).
- In headless screenshot captures, node-popup hovercards can be visually subtle on dark surfaces; subtitle correctness was additionally validated via DOM state/text reads.

## Validation

- `node --check backend/services/member-business-center.service.js`
- `node --check backend/controllers/member-business-center.controller.js`
- `node --check backend/routes/member-business-center.routes.js`
- `node --check backend/app.js`
- `node --check backend/scripts/simulate-zeroone-live-test.mjs`
- `node --check binary-tree.mjs`
- `node backend/scripts/simulate-zeroone-live-test.mjs --target=zeroone --reset-only`
- Extracted `index.html` inline script passed `node --check`.
- Visual verification (admin binary tree popup):
  - `temporary screenshots/screenshot-157-popup-layout-pass3.png`
  - `temporary screenshots/screenshot-161-popup-hovercard-pass7.png`

## 2026-04-10 Follow-Up (Next-Gen Semantic Zoom + Deep Focus Pass)

- Rebuilt `binary-tree-next-app.mjs` runtime and restored a full working next-gen canvas app.
- Kept side chrome fully canvas-rendered (left/right panels + center/bottom bars).
- Implemented adapter-driven semantic zoom tiers:
  - depth-based node size reduction
  - `full` / `medium` / `dot` detail tiers
  - hidden/culled node behavior when too small or outside viewport.
- Added deep navigation controls to validate extreme depth workflows:
  - cursor-anchored wheel zoom
  - pan drag
  - focus actions: `Home`, `Fit`, `Deep`, `Root`
  - keyboard shortcuts for pan/zoom/focus.
- Preserved source-aware auth bootstrap (member token verification + admin session snapshot gate).
- Validation:
  - `node --check binary-tree-next-app.mjs`
  - `node --check binary-tree-next-engine-adapter.mjs`
  - `/binary-tree-next` route smoke returned 200 with module reference present.

## 2026-04-10 Follow-Up (Reference Correction: T-Branch Lines + No Zigzag)

- Corrected next-gen render structure after reference feedback:
  - removed forced zigzag deep-branch generator from app mock data
  - retained balanced level generation only in default graph
  - replaced diagonal link drawing with orthogonal T/elbow branch connectors.
- Updated adapter spacing constants so row and per-depth horizontal offsets read as level-consistent tree spacing.
- Validation:
  - `node --check binary-tree-next-app.mjs`
  - `node --check binary-tree-next-engine-adapter.mjs`
  - `/binary-tree-next` route smoke returned 200.

## 2026-04-10 Follow-Up (Core Spacing/Scaling Adjustment)

- Applied core geometry refinements in next-gen runtime:
  - stronger depth-driven node-size decay
  - decaying vertical depth-step model (shorter lower vertical connector lengths)
  - tighter T-branch connector split ratio and lighter line widths.
- Updated app constants and LOD thresholds to keep deep nodes visible as tiny dots at far zoom while restoring details when zooming in.
- Validation:
  - `node --check binary-tree-next-engine-adapter.mjs`
  - `node --check binary-tree-next-app.mjs`
  - `/binary-tree-next` route smoke status 200.

## 2026-04-10 Follow-Up (Extra Y-Line Shortening)

- Reduced vertical depth-step constants in next-gen adapter to shorten parent-child Y connector spans while preserving hierarchy.
- Validation:
  - `node --check binary-tree-next-engine-adapter.mjs`
  - `node --check binary-tree-next-app.mjs`
  - `/binary-tree-next` route smoke returned 200.

## 2026-04-10 Follow-Up (Deepest Y-Line Shortening)

- Added deep-only vertical step compression in next-gen adapter (`deep start + extra decay`) and lowered minimum row step floor.
- Result: deepest-level parent-child vertical connectors are shorter while upper hierarchy spacing remains readable.
- Validation:
  - `node --check binary-tree-next-engine-adapter.mjs`
  - `node --check binary-tree-next-app.mjs`
  - `/binary-tree-next` route smoke status 200.

## 2026-04-10 Follow-Up (Default Scale Baseline Adjustment)

- Increased next-gen default starting/home zoom baseline and aligned root-focus radius constant to keep camera reset behavior consistent.
- Validation:
  - `node --check binary-tree-next-app.mjs`
  - `node --check binary-tree-next-engine-adapter.mjs`
  - `/binary-tree-next` route smoke status 200.

## 2026-04-10 Follow-Up (Scale Semantics + Depth Reveal Policy)

- Set next-gen home/start scale to raw `0.025`.
- Added projection normalization helpers in app runtime so visual framing remains practical while preserving raw camera-scale semantics.
- Added semantic depth reveal gate in adapter:
  - base scale shows full detail to depth 5
  - deeper nodes reveal as zoom increases.
- Validation:
  - `node --check binary-tree-next-app.mjs`
  - `node --check binary-tree-next-engine-adapter.mjs`
  - `/binary-tree-next` route smoke status 200.

## 2026-04-10 Follow-Up (1000-Node Simulation Pass)

- Updated next-gen mock builder to generate exactly 1000 nodes.
- Switched mock generation approach to balanced level-order queue expansion (instead of fixed-depth layer loop).
- Validation:
  - `node --check binary-tree-next-app.mjs`
  - `node --check binary-tree-next-engine-adapter.mjs`
  - `/binary-tree-next` route smoke status 200.

## 2026-04-10 Follow-Up (2000-Node Simulation)

- Increased next-gen mock tree target to 2000 nodes for heavier stress testing.
- Validation:
  - `node --check binary-tree-next-app.mjs`
  - `node --check binary-tree-next-engine-adapter.mjs`
  - `/binary-tree-next` route smoke status 200.

## 2026-04-10 Follow-Up (20-Level Mock Tree Mode)

- Replaced fixed count mock generation with depth-target mode (`20` levels) plus per-level cap safety guard.
- Validation:
  - `node --check binary-tree-next-app.mjs`
  - `node --check binary-tree-next-engine-adapter.mjs`
  - `/binary-tree-next` route smoke status 200.

## 2026-04-10 Follow-Up (Dynamic X Spacing Strategy)

- Implemented zoom-reactive deep-level X spacing in next-gen adapter projection path.
- Deeper branches now receive progressive horizontal expansion during zoom-in and contract when zooming out.
- Validation:
  - `node --check binary-tree-next-engine-adapter.mjs`
  - `node --check binary-tree-next-app.mjs`
  - `/binary-tree-next` route smoke status 200.

## 2026-04-10 Follow-Up (Dynamic X Spacing Whole-Tree Correction)

- Corrected next-gen dynamic X spacing so whole tree shifts by zoom (global multiplier), not deep-level-only bias.
- Validation:
  - `node --check binary-tree-next-engine-adapter.mjs`
  - `node --check binary-tree-next-app.mjs`
  - `/binary-tree-next` route smoke status 200.

## 2026-04-10 Follow-Up (Zoom Anchor Stabilization For Dynamic X Shift)

- Added app-side global X multiplier resolver and integrated it into zoom/focus/fit camera math.
- Region-under-cursor is now preserved during zoom despite whole-tree dynamic X spacing.
- Validation:
  - `node --check binary-tree-next-app.mjs`
  - `node --check binary-tree-next-engine-adapter.mjs`
  - `/binary-tree-next` route smoke status 200.

## 2026-04-10 Follow-Up (X Shift Visibility + Diagnostic)

- Increased global X shift zoom gain in next-gen app runtime.
- Added live right-panel `X spread` multiplier display for debugging/validation.
- Validation:
  - `node --check binary-tree-next-app.mjs`
  - `node --check binary-tree-next-engine-adapter.mjs`
  - `/binary-tree-next` route smoke status 200.

## 2026-04-10 Follow-Up (Core X-Decay Ratio Adjustment)

- Updated next-gen adapter horizontal spacing constants to preserve deeper-level spacing better:
  - base step 512
  - divisor 1.6.
- Validation:
  - `node --check binary-tree-next-engine-adapter.mjs`
  - `node --check binary-tree-next-app.mjs`
  - `/binary-tree-next` route smoke status 200.

## 2026-04-10 Follow-Up (Overlap Prevention)

- Added row-wise projected node collision resolver in next-gen adapter and enabled it from app runtime config.
- Enforced min center gap (`r1 + r2 + edgeGap`) to prevent neighbor overlap while preserving row centering.
- Validation:
  - `node --check binary-tree-next-engine-adapter.mjs`
  - `node --check binary-tree-next-app.mjs`
  - `/binary-tree-next` route smoke status 200.

## 2026-04-10 Follow-Up (Root Leg Non-Overlap Corridor)

- Implemented explicit root L/R subtree spacing enforcement with zoom-scaled desired center gap.
- Increased row collision edge gap and added root-split telemetry in right panel.
- Validation:
  - `node --check binary-tree-next-engine-adapter.mjs`
  - `node --check binary-tree-next-app.mjs`
  - `/binary-tree-next` route smoke status 200.

## 2026-04-10 Follow-Up (General L/R Subtree Spread)

- Generalized branch spacing rule from root-only to all visible parent branches in adapter projection path.
- Updated runtime config to stronger branch corridor settings and tighter overlap guard.
- Validation:
  - `node --check binary-tree-next-engine-adapter.mjs`
  - `node --check binary-tree-next-app.mjs`
  - `/binary-tree-next` route smoke status 200.

## 2026-04-10 Follow-Up (Reference-Style Proportional Geometry Reset)

- Removed forced spacing systems that were introducing non-reference behavior:
  - dynamic whole-tree X spread
  - per-branch corridor side-shift pass
  - row overlap post-shift solver.
- Rebalanced core adapter geometry constants for natural hierarchical decay:
  - faster horizontal attenuation by depth
  - faster vertical attenuation by depth
  - deeper progressive node radius reduction.
- Updated connector branch placement rules in app renderer so deep-node T-lines shorten with node scale.
- Validation:
  - `node --check binary-tree-next-engine-adapter.mjs`
  - `node --check binary-tree-next-app.mjs`
  - `/binary-tree-next` route smoke status 200.
- Follow-up tuning: added horizontal step floor and reduced vertical step floor for deep-level spacing stability.

## 2026-04-10 Follow-Up (Post-Level-7 Scaling Correction)

- Tuned semantic reveal pace and deep geometry floors to correct sudden deep-level reveal + uniform tiny-node appearance after level 7.
- Added radius-responsive connector line width and shorter deep T-line minima.
- Validation:
  - `node --check binary-tree-next-engine-adapter.mjs`
  - `node --check binary-tree-next-app.mjs`
  - `/binary-tree-next` route smoke status 200.

## 2026-04-10 Follow-Up (Revert to Preferred Baseline)

- Reverted latest deep-level reveal/size experiment and restored prior preferred tree behavior.
- Validation:
  - `node --check binary-tree-next-engine-adapter.mjs`
  - `node --check binary-tree-next-app.mjs`
  - `/binary-tree-next` route smoke status 200.

## 2026-04-10 Follow-Up (Deep Node Uniformity Bug)

- Fixed deep-level visual flattening by lowering radius floors and connector minima.
- Added depth-responsive connector stroke width for small-node levels.
- Validation:
  - `node --check binary-tree-next-engine-adapter.mjs`
  - `node --check binary-tree-next-app.mjs`
  - `/binary-tree-next` route smoke status 200.

## 2026-04-10 Follow-Up (Depth 11 Vibe Mismatch)

- Fixed deep-level plateau behavior by lowering geometric floors and tiny-node rendering minima.
- Validation:
  - `node --check binary-tree-next-engine-adapter.mjs`
  - `node --check binary-tree-next-app.mjs`
  - `/binary-tree-next` route smoke status 200.

## 2026-04-10 Follow-Up (Depth-20 Zoom Range)

- Increased max camera zoom cap to improve depth-20 inspection.
- Validation:
  - `node --check binary-tree-next-app.mjs`
  - `node --check binary-tree-next-engine-adapter.mjs`
  - `/binary-tree-next` route smoke status 200.

## 2026-04-10 Follow-Up (Unlimited Zoom-In)

- Updated camera max scale to `Number.MAX_VALUE` to remove practical zoom-in cap.
- Validation:
  - `node --check binary-tree-next-app.mjs`
  - `node --check binary-tree-next-engine-adapter.mjs`
  - `/binary-tree-next` route smoke status 200.

## 2026-04-10 Follow-Up (Enter Node Universe)

- Implemented node-universe re-rooting with local 20-depth rendering window.
- Added Enter/Back universe controls, local/global depth-path diagnostics, and per-universe camera memory.
- Validation:
  - `node --check binary-tree-next-engine-adapter.mjs`
  - `node --check binary-tree-next-app.mjs`
  - `/binary-tree-next` route smoke status 200.
