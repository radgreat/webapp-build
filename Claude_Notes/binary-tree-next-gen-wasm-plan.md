# Binary Tree Next-Gen (WASM) - Planning & Layout

Last Updated: 2026-04-10
Status: In Progress (Phase A Complete, Phase B Shell/Adapter Active)
Owner: Binary Tree Next Implementation Track

## 1) Executive Summary

This plan defines a **new Binary Tree implementation track** that runs in parallel with the current production tree.

Primary direction:
- Keep the current Binary Tree in place for live testing and operations.
- Build a new Binary Tree as a separate app/page, opened in a new window.
- Use a next-gen rendering core (C++ -> WebAssembly), with optional React shell for UI controls.
- Migrate only after quality/performance gates are met.

## 2) Why This Direction

Current constraints in the existing tree:
- Current tree runtime is a large, single-module implementation (`binary-tree.mjs`) with rich UX and many coupled concerns.
- Fullscreen selection and visibility updates can trigger broad tree re-renders.
- We need a safer path to engine-level performance experiments without risking existing workflows.

Desired outcomes:
- Smoother pan/zoom and node navigation (Figma-like responsiveness).
- Clear separation between render core and surrounding product UI.
- Controlled migration path with rollback safety.

## 3) Product Strategy (Dual-Run)

### Keep Existing Tree (Now)

- Existing Binary Tree remains active and unchanged for current members/admin usage.
- Existing page and APIs remain the source of truth during development.

### Build New Tree (Parallel)

- New Binary Tree will be built as a separate destination/page.
- Launch behavior: clicking a dedicated link/button opens a **new window** for the new tree app.
- This isolates performance experiments and avoids destabilizing current tree flows.

### Shift Later (When Ready)

- After acceptance criteria are met, progressively route users to the new tree.
- Old tree remains as fallback until deprecation is approved.

## 4) New App Surface & Routing Layout

Proposed route/page structure:
- New page key: `binary-tree-next`
- New route: `/binary-tree-next` (name can be revised)
- Open pattern: `window.open('/binary-tree-next', '_blank', 'noopener,noreferrer')`

App layout (new window):
1. Header rail (session identity + quick actions)
2. Main render viewport (canvas/WebGL pipeline)
3. Left tool dock (search/filter/navigation controls)
4. Right detail panel (selected node metrics, sponsor/placement details)
5. Optional bottom diagnostics strip (FPS/render stats in dev mode)

## 5) Session, Auth, and Token Continuity

Goal: new window opens with existing authenticated context.

Plan:
- Keep same-origin route so existing auth storage/cookies remain accessible.
- Reuse existing auth/session parsing utilities where possible.
- Add boot-time session validation in new app shell:
  - If session is valid -> initialize tree.
  - If session missing/expired -> redirect to login flow.

Notes:
- No cross-domain auth bridging is planned for phase 1.
- If security policy hardening is introduced later (COOP/COEP/CSP), re-validate session boot behavior.

## 6) Technical Architecture (Target)

### Layered Architecture

1. UI Shell Layer (TypeScript + optional React)
- Window chrome: search, filters, summary cards, node details, settings.
- Does not own heavy layout math.

2. Tree Engine Adapter (TS bridge)
- Marshals typed data to/from Wasm module.
- Maintains camera state and interaction model contracts.

3. Render Core (C++ -> Wasm)
- Tree layout generation
- Visibility/Lod selection
- Connector/path geometry generation
- Hit-test support data

4. Renderer Backend
- Canvas GPU path (WebGL-first).
- Optionally evaluate WebGPU later (non-blocking to first release).

## 7) Engine Scope (What Goes to Wasm First)

Phase-1 Wasm candidates:
- Compute layout positions from normalized tree graph.
- Compute visibility subsets by zoom/depth/focus rules.
- Generate connector geometry buffers for fast draw.
- Return stable, reusable typed arrays.

Stays in JS/TS initially:
- DOM/UI controls and panel interactions.
- Keyboard/mouse/touch event orchestration.
- API fetching and data normalization.
- Popup/detail panel rendering.

## 8) Data Contract (Draft)

Input to engine:
- Node list (id, parent/left/right/sponsor, status, rank/tags, metrics)
- View options (zoom level, fullscreen mode, filter flags)
- Layout options (slot width, depth cap, spacing profile)

Output from engine:
- Node positions buffer
- Visible node id buffer
- Parent/child connector polyline buffers
- Spillover connector buffers
- Bounds and minimap projection hints

## 9) Implementation Phases

### Phase A - Foundation (No Cutover)
- Create `binary-tree-next` page scaffold.
- Add launcher action from existing dashboard tree area.
- Add session bootstrap and protected route checks.
- Add mock data render harness in isolated window.

### Phase B - UI Shell + Renderer Skeleton
- Build viewport and panel layout.
- Implement camera controls (pan/zoom/fit/reset).
- Wire selection and details panel with placeholder data.

### Phase C - Wasm Layout Core (C++ MVP)
- Build C++ module for layout + visibility + path generation.
- Compile to Wasm and integrate via adapter.
- Validate deterministic output parity vs current tree rules.

### Phase D - Feature Parity Pass
- Search/filter behavior
- Spillover highlighting and toggles
- Minimap
- Fullscreen/compact behavior parity
- Selected node popup/details parity

### Phase E - Performance & Stability Gates
- Stress test large graphs and rapid interaction loops.
- Compare FPS, frame time, GC pressure, and interaction latency.
- Fix regressions and confirm production-readiness checklist.

### Phase F - Migration Rollout
- Internal flag rollout.
- Limited user cohort rollout.
- Full rollout after signoff.
- Keep old tree fallback until final deprecation approval.

## 10) Acceptance Criteria

Functional:
- New window app loads with active user session.
- Core interactions (pan/zoom/select/search/filter) are fully operational.
- Data parity with existing tree (node count, metrics, relations) is validated.

Performance:
- Noticeably smoother camera/navigation behavior under realistic graph sizes.
- No major input lag spikes during rapid pan/zoom.
- Stable memory profile under prolonged usage.

Operational:
- Old tree remains available throughout rollout.
- Feature flag allows immediate rollback to old tree path.

## 11) Risk Register

1. Wasm integration complexity
- Mitigation: keep first Wasm scope narrow (layout + geometry only).

2. Auth/session mismatch in new window
- Mitigation: same-origin route and explicit bootstrap checks.

3. Rendering backend incompatibility across devices
- Mitigation: WebGL-first baseline; WebGPU optional and gated.

4. Parity drift with existing logic
- Mitigation: deterministic fixture tests and side-by-side comparisons.

## 12) Non-Goals (Initial Milestone)

- Replacing every surrounding dashboard component with the new stack.
- Immediate deletion of the old Binary Tree implementation.
- Full backend schema redesign in phase 1.

## 13) Rollout Plan Summary

1. Build new tree in parallel.
2. Keep old tree as default.
3. Validate parity + performance.
4. Shift traffic gradually.
5. Retire old tree only after sustained stability.

## 14) Decision Snapshot

Your plan is valid and recommended:
- Yes to a separate new-window Binary Tree app.
- Yes to keeping old tree for live safety during development.
- Yes to C++/Wasm engine path with optional React shell.
- Yes to delayed migration until measurable readiness.

## 15) Implementation Update (2026-04-10)

Phase A delivered items:
- `binary-tree-next` standalone app scaffold added:
  - `binary-tree-next.html`
- Backend route mount added:
  - `/binary-tree-next`
  - `/binary-tree-next/`
  - `/binary-tree-next.html`
- Launchers from legacy tree surfaces added:
  - member tree header (`index.html`)
  - admin tree header (`admin.html`)
- New-window source-aware open paths:
  - member -> `/binary-tree-next?source=member`
  - admin -> `/binary-tree-next?source=admin`
- Session boot + protected route checks added in new shell:
  - member mode validates bearer auth against `GET /api/member-auth/email-verification-status`
  - missing/invalid member session redirects to `/login.html`
  - admin source requires admin session snapshot and redirects to `/admin-login.html` if unavailable
- Isolated mock render harness added:
  - left tool dock, center interactive canvas, right details panel, bottom diagnostics strip.

Known follow-up for next phase:
- Replace mock-tree data source with real normalized payload contract from existing tree pipeline.
- Begin adapter split for future Wasm layout core integration.

## 16) Implementation Follow-Up (2026-04-10, Later Pass)

Phase B shell enhancements delivered:
- moved next app runtime from inline script to module entrypoint:
  - `binary-tree-next-app.mjs`
  - `binary-tree-next-engine-adapter.mjs`
- added shell-level camera controls:
  - zoom in/out, fit-to-view, reset
  - keyboard shortcuts for pan/zoom/reset/fit
- added viewport toggles:
  - connector visibility
  - guide grid visibility
  - high-volume node highlighting
- added explicit compute adapter seam:
  - node filtering, layout projection, connector generation, world-bounds fit inputs
  - runtime engine-mode probe (`mock-js` vs `wasm-bridge-pending`) with diagnostics output

Implication:
- UI shell and compute contracts are now separated enough to begin plugging in Wasm-backed layout logic in Phase C without rewriting window controls and interaction bindings.

## 17) UI Redesign Follow-Up (2026-04-10, Figma-Style Canvas Pass)

Delivered:
- replaced prior mixed DOM shell with full-canvas UI composition for `binary-tree-next`
- rendered requested side chrome directly in canvas:
  - left navigation panel
  - right properties panel
  - center top status/action strip
  - bottom-center floating tool panel
- kept tree render viewport centered between side chrome with workspace clipping
- preserved interaction model:
  - pan / zoom / select
  - fit action and keyboard controls
- extended adapter projection options so compute results can target non-fullscreen viewport anchors.

Why this matters for next phases:
- aligns with requested Figma-like UX framing now, while retaining the modular adapter path needed for upcoming C++/Wasm compute integration.


## 18) Implementation Follow-Up (2026-04-10, Semantic Zoom + Deep Focus Runtime)

Delivered in this pass:

- Reconstructed `binary-tree-next-app.mjs` after module-loss state and restored the runtime shell.
- Kept the Figma-style shell composition fully canvas-rendered:
  - left panel
  - right panel
  - center top action strip
  - bottom center tool strip.
- Wired semantic-zoom behavior to adapter compute output:
  - depth-based node sizing profile (larger near root, smaller with depth)
  - LOD tier rendering (`full`, `medium`, `dot`)
  - hidden/culled paths for tiny/offscreen nodes.
- Added deep-node navigation controls for high-depth camera workflows:
  - cursor-anchored zoom
  - drag pan
  - fit/home/root/deep focus actions
  - deep focus jumps to deepest node id from adapter and zooms for full-detail readability.
- Preserved source-aware session boot checks and runtime engine-mode diagnostics.

Why this matters:

- This is the first complete runtime pass that directly validates the proposed spacing/performance strategy (semantic zoom + conditional render density) while maintaining the modular seam required for the future C++/Wasm compute swap.

Next recommended step:

- Replace mock tree payload generation with normalized data from the existing binary-tree pipeline, then benchmark LOD/culling behavior under real-world member graph distributions.

## 19) Implementation Correction (2026-04-10, Reference-Match Layout Pass)

Delivered:

- Removed the default zigzag deep-chain mock generator in `binary-tree-next-app.mjs`.
- Kept balanced level-by-level binary generation to match requested tree silhouette.
- Replaced diagonal connector drawing with orthogonal T-style branch routing in app render stage.
- Retuned layout spacing constants in adapter:
  - larger vertical row step
  - horizontal step now halves by depth (`divisor = 2`) for predictable level spacing.

Result:

- Next-gen tree now aligns to the requested structural direction (T-lines and clean per-level spacing) while preserving semantic zoom/LOD behavior.

## 20) Implementation Tuning (2026-04-10, Core Node Scaling + Connector Vertical Compression)

Delivered:

- Updated adapter core geometry model:
  - node world radius now uses exponential depth decay for stronger level-to-level size drop
  - world Y spacing now uses a decaying step function by depth rather than a flat increment.
- Updated app render behavior:
  - tuned T-branch split placement closer to parent
  - reduced connector line weights slightly
  - adjusted LOD thresholds so deep nodes remain visible as dots and become detailed on zoom-in.

Result:

- Node sizing now behaves as a clearer hierarchy (large root -> smaller deeper nodes), and vertical connector spans are reduced, moving render structure closer to the reference design intent.

## 21) Implementation Tuning (2026-04-10, Additional Vertical Connector Compression)

Delivered:

- Further compressed world Y step progression constants in adapter for tighter level spacing.

Result:

- Parent-child vertical connector lengths are shorter across the tree, aligning more closely with the requested visual reference.

## 22) Implementation Tuning (2026-04-10, Deepest-Level Vertical Compression)

Delivered:

- Added depth-selective Y-step compression controls in adapter:
  - deep-level extra decay starts at depth 6
  - reduced minimum Y-step floor.

Result:

- Deepest tree levels now pack more tightly vertically, shortening lower-level connector lines as requested.

## 23) Implementation Tuning (2026-04-10, Default Camera Scale Increase)

Delivered:

- Added explicit default camera constants in app runtime and increased home/start baseline scale.
- Aligned root-focus default target radius with updated baseline to avoid scale discontinuity between bootstrap and home/reset actions.

Result:

- Next-gen tree opens slightly larger while retaining zoom-out room for larger generated graphs.

## 24) Implementation Tuning (2026-04-10, Home Scale 0.025 + Semantic Depth Reveal)

Delivered:

- Home/start raw camera scale set to `0.025`.
- Added app-side projection normalization to keep scene render usable at low raw-scale values.
- Added adapter semantic-depth policy:
  - `baseFullDepth = 5`
  - `baseVisibleDepth = 5`
  - progressive deeper reveal by zoom octave.

Result:

- At default/home scale, root through depth 5 are full detail and deeper nodes remain hidden until zoom-in, matching requested behavior.

## 25) Implementation Tuning (2026-04-10, 1000-Node Mock Stress Graph)

Delivered:

- Added explicit mock graph target (`1000` nodes) in next-gen app runtime.
- Replaced fixed-depth generator with level-order expansion until target count is met.

Result:

- Next-gen tree now boots a larger balanced stress graph for evaluating semantic zoom, culling, and spacing at higher node counts.

## 26) Implementation Tuning (2026-04-10, 2000-Node Mock Stress Graph)

Delivered:

- Updated next-gen mock graph target constant to 2000 nodes.

Result:

- Next-gen app now boots a heavier stress dataset for camera/LOD/spacing evaluation.

## 27) Implementation Tuning (2026-04-10, 20-Level Mock Depth Mode)

Delivered:

- Switched next-gen mock builder from total-node target to explicit depth target mode:
  - max depth = 20
  - level cap = 128 for runtime safety.

Result:

- Next-gen app now stress-tests deep-tree interaction/LOD behavior at 20 levels while avoiding full-depth node explosion.

## 28) Implementation Tuning (2026-04-10, Zoom-Reactive X-Axis Spacing)

Delivered:

- Added adapter projection transform for depth/zoom-dependent horizontal spacing.
- Added app runtime config to enable and tune deep-level X expansion behavior.

Result:

- Binary tree now expands/contracts in X axis with zoom, reducing deep-level spacing collapse and aligning with proposed spacing strategy.

## 29) Implementation Tuning (2026-04-10, Whole-Tree X Shift Behavior)

Delivered:

- Updated adapter X-spacing transform to include a global zoom multiplier applied to all nodes.
- Disabled depth-only bias in runtime config for pure whole-tree horizontal expansion/contraction.

Result:

- Binary tree now shifts in X as a whole with zoom, matching user-requested spacing behavior.

## 30) Implementation Tuning (2026-04-10, Zoom Anchor Lock With Dynamic X Spacing)

Delivered:

- Added dynamic-X-aware camera anchor math in app runtime.
- Updated zoom, fit, and node-focus calculations to account for global X multiplier changes between old/new scales.

Result:

- Whole-tree X expansion remains active, but zooming into a region no longer drifts the target off-screen.

## 31) Implementation Tuning (2026-04-10, Stronger Global X Shift + Telemetry)

Delivered:

- Increased runtime global X shift zoom gain.
- Added in-app diagnostics for current X spread multiplier.

Result:

- Whole-tree horizontal expansion/contraction is more visible and directly measurable during zoom.

## 32) Implementation Tuning (2026-04-10, Base Horizontal Decay Rebalance)

Delivered:

- Rebalanced core horizontal layout constants in adapter (base step + divisor) to reduce deep-level compaction.

Result:

- Spacing consistency across tree areas improved, with lower levels receiving more natural horizontal breathing room.

## 33) Bug Fix (2026-04-10, Neighbor Node Overlap)

Delivered:

- Added adapter-side depth-row collision resolution after projection.
- Added app config to enable overlap prevention and set edge gap.

Result:

- Nodes no longer overlap their side-by-side neighbors under dynamic spacing and zoom transforms.

## 34) Bug Fix (2026-04-10, Root Leg Corridor + Inner Crowd Prevention)

Delivered:

- Added root L/R first-leg corridor enforcement in adapter projection stage.
- Increased overlap prevention edge gap and surfaced root split diagnostics in app shell.

Result:

- Inner middle-region subtree nodes receive explicit spacing budget from root-level branch split, reducing crowding and overlap risk.

## 35) Bug Fix (2026-04-10, Generalized Branch Corridor Spacing)

Delivered:

- Replaced root-level-only split with generalized per-parent L/R subtree corridor enforcement.
- Increased branch spacing parameters and overlap guard to reduce persistent deep-node overlap.

Result:

- Spacing behavior now applies across the full tree structure, not just first-level legs.

## 36) Implementation Tuning (2026-04-10, Reference-Matched Proportional Tree Rebaseline)

Delivered:

- Removed dynamic global X expansion and branch corridor post-shifting systems.
- Reverted zoom/focus/fit camera math to direct world-space projection without spread multipliers.
- Re-tuned core geometry constants (X step attenuation, Y step attenuation, node radius decay).
- Updated connector branch placement to use radius-proportional trunk/min-clearance rules for shorter deep-level T-lines.

Result:

- Tree layout now follows reference-style self-similar decay more closely: as nodes get smaller by depth, connector T-lines also shrink, supporting consistent POV while zooming into deeper nodes.
- Follow-up tuning: introduced horizontal step floor and lower vertical step floor for deep-level clarity without reintroducing branch push systems.

## 37) Implementation Tuning (2026-04-10, Deep Reveal + Proportional Deep Connector Scaling)

Delivered:

- Reduced semantic depth reveal slope to avoid abrupt deep-level visibility jumps.
- Lowered deep-node minimum radius floor and tightened depth decay to preserve scaling contrast past level 7.
- Reworked connector drawing minima/width to remain proportional at deep levels.

Result:

- Deep sections now preserve small-node/small-T-line behavior longer and reveal more progressively during zoom.

## 38) Revert (2026-04-10, Back To Preferred Baseline)

Delivered:

- Reverted latest deep-reveal/deep-shrink adjustments in app + adapter.
- Restored previous semantic reveal and connector sizing behavior.

Result:

- Returned to the prior tree view that user explicitly preferred.

## 39) Bug Fix (2026-04-10, Deep Node Size Floor + Deep Connector Floor)

Delivered:

- Reduced deep node radius floor and deep Y-step floor.
- Lowered deep connector minimum trunk/clearance floors.
- Reduced dot rendering floor and made connector width scale by branch radius.

Result:

- Post-level-7+ nodes no longer plateau at one rendered size; deep T-lines remain proportional.

## 40) Bug Fix (2026-04-10, Depth-11 Geometry Plateau)

Delivered:

- Dropped deep-level X/Y/radius floors to prevent plateauing at depth 11+.
- Lowered deep connector minima and dot floor to maintain proportional tiny-node rendering.

Result:

- Deeper levels retain the same self-similar spacing/size feel as upper levels.

## 41) Implementation Tuning (2026-04-10, Depth-20 Zoom Headroom)

Delivered:

- Raised app camera max scale from 220 to 1200.

Result:

- Much greater zoom-in headroom for inspecting deepest nodes without changing tree geometry.

## 42) Implementation Tuning (2026-04-10, Unlimited Zoom-In)

Delivered:

- Set app camera `MAX_SCALE` to `Number.MAX_VALUE`.

Result:

- Effectively unlimited zoom-in headroom for deep-node inspection.

## 43) Feature (2026-04-10, Enter Node Universe)

Delivered:

- Added universe-rooted traversal model with local depth cap (20).
- Adapter now supports universe-scoped compute/focus/bounds/metrics and returns local+global depth metadata.
- App now supports Enter/Back universe controls, breadcrumb pathing, and per-universe camera restoration.

Result:

- Practical depth exploration can continue indefinitely via re-rooted 20-depth windows while preserving layout readability and interaction quality.
