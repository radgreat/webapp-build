# Binary Tree Next-Gen (WASM) - Planning & Layout

Last Updated: 2026-04-10
Status: In Progress (Phase A Complete, Phase B Shell/Adapter Active)
Owner: Binary Tree Next Implementation Track

## 0) Latest Implementation Update (2026-04-10)

- Completed a shell customization pass ahead of live tree-logic migration:
  - restored fullscreen viewport rendering in `binary-tree-next-app.mjs`
  - replaced dual fixed panel framing with an in-canvas toggleable side nav
  - applied dark glassmorphism shell styling
  - converted node visuals to circular initials-only contact avatars
  - widened culling behavior through adapter-level dynamic `cullMargin` support.
- Why this matters for wasm track:
  - UI presentation and interaction shell are now stabilized before wiring current live binary logic.
  - culling behavior is less aggressive near viewport edges, reducing perceived render pop and improving camera feel.
- Current known limitation:
  - legacy right-panel draw function remains in source but is inactive and not rendered.

## 0.1) Refinement Update (2026-04-10)

- Completed visual refinement pass on active shell:
  - shifted overall shell to light-mode glass direction
  - replaced circular panel toggle with rectangular in-panel control
  - applied stronger backdrop blur treatment for frosted panel look
  - gated deep-level initials until sufficient zoom/radius to avoid text overflow.
- Relevance to wasm plan:
  - visual shell is now more stable for upcoming live-tree logic migration and wasm adapter integration.

## 0.2) Launch-State Intro Gate Update (2026-04-10)

- Delivered first-open awareness for Binary Tree Next member sessions:
  - introduced persisted first-open tracking store (member_binary_tree_intro_state)
  - added member endpoint GET /api/member-auth/binary-tree-next/launch-state behind existing session middleware
  - wired next-gen app bootstrap to request launch-state before intro sequence.
- Delivered first-time UX gate:
  - after loading finishes, first-time members now see a welcome splash (Welcome, Press the screen to continue.)
  - intro animation starts only after user interaction (tap/click or Enter/Space)
  - returning users skip this gate and continue with normal startup.
- Relevance to wasm/next-gen track:
  - formalizes a server-driven boot-state contract for next-gen startup sequencing
  - provides a reusable pattern for future phase gates/tutorials without hardcoding client-only first-open logic.

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

## 44) Refinement (2026-04-10, Back = Previous POV)

Delivered:

- Replaced parent-chain back behavior with explicit previous-POV history stack restoration.
- Back now restores prior universe root, selection/filter context, and camera viewpoint.

Result:

- POV navigation now matches user mental model and no longer jumps to merely the upper node.

## 45) Refinement (2026-04-10, Breadcrumb Universe Link Navigation)

Delivered:

- Added clickable breadcrumb chips (`Root > Node ...`) in right panel.
- Implemented direct breadcrumb ancestor jump action (`universe:goto:<id>`).
- Added history-consistent POV restoration/truncation on breadcrumb jumps.

Result:

- Users can jump directly to prior universe POVs from breadcrumb trail, with Back behavior remaining intuitive.

## 46) UI Refinement (2026-04-10, Fullscreen Glass Shell)

Delivered:

- Refactored shell layout to fullscreen canvas with in-canvas hideable overlay panels.
- Applied dark gray glassmorphism theme for panels, bars, and controls.
- Switched node rendering to initials-only circular badges.
- Increased viewport culling margin to reduce premature connector disappearance while panning.

Result:

- Shell now aligns with requested visual direction and interaction model before integrating live binary-tree runtime logic.

## 47) UI Refinement (2026-04-10, Light-Mode Glass Cleanup + White Panels)

Delivered:

- Updated New Binary Tree Next Gen light-mode base background to `#E9EAEE` (HTML + canvas draw layer).
- Cleaned frosted blur pipeline by introducing an offscreen backdrop snapshot and blurring that clean layer instead of repeatedly blurring the active UI render.
- Removed extra blur color processing (`saturate/contrast`) to reduce muddy glass artifacts.
- Retuned glass panel cards/bars to neutral white (`#FFFFFF` family) with stronger rim/edge contrast for readability on light gray.

Result:

- Frosted glass now reads cleaner and more controlled (closer to login-page layer-blur feel) while preserving depth.
- Light mode is now clearly anchored to requested palette: background `#E9EAEE`, white panel surfaces.

Validation:

- `node --check binary-tree-next-app.mjs` passed.
- Completed screenshot pass 1 via localhost workflow.
- Completed screenshot pass 2 via localhost workflow.

## 48) UI Refinement (2026-04-10, Reference Skeleton Shell Match)

Delivered:

- Rebuilt shell layout to match provided reference wireframe:
  - tall left rail with top line + 4 placeholder cards
  - centered bottom dock with 5 placeholder slots
  - no visible top control strip in active shell.
- Updated core palette to neutral reference tones:
  - background `#CFD0D6`
  - shell surfaces `#ECECEE`
  - placeholder fills `#C2C2C6`.
- Disabled main tree rendering in `renderFrame()` for strict skeleton-phase presentation.

Result:

- Interface now behaves as a clean structural scaffold where future components can be inserted directly.
- Layout proportions and spacing are visually aligned to the supplied image.

Validation:

- `node --check binary-tree-next-app.mjs` passed.
- Completed iterative screenshot comparison rounds against supplied design reference.

## 49) UI Refinement (2026-04-10, Bottom Dock Controls)

Delivered:

- Converted bottom skeleton dock placeholders into clickable dock controls.
- Added button mapping:
  - `Back` -> universe back navigation
  - `Home` -> recenter/focus root node
  - `Enter` -> enter selected node universe
  - `Deep` -> jump to deepest node
  - `Soon` -> placeholder no-op button.
- Added hover feedback while keeping skeleton visual tone.

Result:

- The bottom center dock is now componentized and behavior-wired, ready for iterative UX tuning.

Validation:

- `node --check binary-tree-next-app.mjs` passed.

## 50) Hotfix (2026-04-10, Node Visibility Restored)

Delivered:

- Re-added `drawTreeViewport(state.layout)` to the render pipeline.

Result:

- Tree nodes/connectors are visible again while preserving current skeleton shell layout and dock controls.

Validation:

- `node --check binary-tree-next-app.mjs` passed.

## 51) UI Refinement (2026-04-10, Dock Iconography)

Delivered:

- Added Material Symbols font links in HTML head for requested icon names.
- Added icon ligatures to dock button definitions and rendered them in-canvas.
- Dock now renders icon + label per slot while keeping action mapping unchanged.

Result:

- Bottom center dock has recognizable visual icon controls aligned with requested symbols.

Validation:

- `node --check binary-tree-next-app.mjs` passed.

## 52) Hotfix (2026-04-10, Dock Icon Glyph Rendering)

Delivered:

- Replaced Material Symbol ligature text rendering with direct codepoint glyph rendering for all dock icons.

Result:

- Bottom dock icons render reliably as symbols in the canvas context.

Validation:

- `node --check binary-tree-next-app.mjs` passed.

## 53) UI Refinement (2026-04-10, Dock Apple-Style Icon Buttons)

Delivered:

- Removed dock text captions and switched to icon-only rendering.
- Applied exact border color `#EDEDED` to dock slots.
- Set icon color to black (`#111111`) and increased icon prominence.
- Preserved all existing dock actions.

Result:

- Bottom dock now follows an Apple-like icon-button visual language aligned with the supplied reference.

Validation:

- `node --check binary-tree-next-app.mjs` passed.

## 54) UI Refinement (2026-04-10, Dock Color + Icon Scale Correction)

Delivered:

- Updated dock button fill to exact `#EDEDED`.
- Reduced dock icon size from 34 to 28 for cleaner Apple-like proportion.

Validation:

- `node --check binary-tree-next-app.mjs` passed.

## 55) UI Refinement (2026-04-10, Main Background Color)

Delivered:

- Set main canvas and first-paint page background to `#E9EAEE`.

Validation:

- `node --check binary-tree-next-app.mjs` passed.

## 56) UI Refinement (2026-04-10, Dock White Shell Correction)

Delivered:

- Set bottom dock outer shell to `#FFFFFF`.
- Preserved icon tile container fill as `#EDEDED`.

Validation:

- `node --check binary-tree-next-app.mjs` passed.

## 57) UI Refinement (2026-04-10, Dock Icon Scale + Color)

Delivered:

- Reduced dock icon size from 28 to 24.
- Updated dock icon color to `#303030`.

Validation:

- `node --check binary-tree-next-app.mjs` passed.

## 58) UI Refinement (2026-04-10, Dock Hover Interaction)

Delivered:

- Added hover feedback to dock icon tiles:
  - lighter/darker tile transition
  - subtle shadow lift
  - darker icon on hover.

Validation:

- `node --check binary-tree-next-app.mjs` passed.

## 59) UX Refinement (2026-04-10, Startup Home + Bottom-Up Tree Reveal)

Delivered:

- Changed initial camera boot behavior to use root Home focus logic.
- Added startup tree intro animation with:
  - vertical rise from below
  - blur easing from soft to sharp
  - opacity ramp-in.

Result:

- Page open/reload now presents a Home-framed tree with a login-style reveal feel.

Validation:

- `node --check binary-tree-next-app.mjs` passed.

## 60) Hotfix (2026-04-10, Startup Camera Center/Home Match)

Delivered:

- Unified startup and Home button camera logic via centered `computeHomeView()`.
- Ensured viewport/layout are ready before startup camera set.
- Mapped dock Home action to `camera:home`.

Result:

- Page load/reload now lands at the same centered frame as Home.

Validation:

- `node --check binary-tree-next-app.mjs` passed.

## 61) UX Refinement (2026-04-10, Depth-Staggered Startup Tree Reveal)

Delivered:

- Replaced single-block intro animation with per-depth reveal logic.
- Added depth stagger timing and applied reveal transforms per connector branch and per node.
- Removed global intro transform from viewport render path.

Result:

- Tree intro now reveals progressively by depth with dynamic upward + blur-resolve motion.

Validation:

- `node --check binary-tree-next-app.mjs` passed.

## 62) Feature (2026-04-10, Binary Tree Loading Screen + Deferred Intro)

Delivered:

- Implemented full-screen loading overlay with progress card.
- Added minimum loading display timing and fade-out behavior.
- Reordered bootstrap so intro animation starts only after loading overlay completes.
- Added immediate loading overlay dismissal on bootstrap failure.

Result:

- Load experience is now staged: loading screen first, then startup tree reveal animation.

Validation:

- `node --check binary-tree-next-app.mjs` passed.

## 63) Hotfix (2026-04-10, Loading-to-Intro Visibility Sequence)

Delivered:

- Fixed reveal fallback so tree remains hidden until intro timer starts.

Result:

- No more visible final tree state before startup intro animation.

Validation:

- `node --check binary-tree-next-app.mjs` passed.

## 64) UX Refinement (2026-04-10, Panel Intro Animation)

Delivered:

- Added startup reveal animation for skeleton side panel and bottom dock.
- Added panel-specific delay/offset/blur timing and stagger.
- Kept dock button interaction hitboxes aligned during animated translation.

Result:

- Startup sequence now animates both tree and panels in a coordinated, dynamic intro.

Validation:

- `node --check binary-tree-next-app.mjs` passed.

## 65) UI Refinement (2026-04-10, Left Shell Brand Dropdown First Field)

Delivered:

- Replaced the top-left shell placeholder with an interactive brand dropdown in canvas.
- Added logo rendering using existing dashboard brand asset:
  - `/brand_assets/Logos/L%26D%20Logo_Cropped.png`
- Implemented dropdown behavior parity for shell-level interaction:
  - toggle from brand row
  - close on outside click
  - close on `Escape`
  - close when side nav is closed.
- Added initial dropdown menu structure:
  - profile summary block (initials avatar + session name/email)
  - menu rows (`Profile`, `Home`, `My Store`, `Settings`, `Log out`).
- Wired `Home` row to `camera:home`; kept remaining rows as close-only placeholders pending route/action mapping.

Result:

- The left shell now starts migration from skeleton blocks into real dashboard-like components, beginning with the brand/logo dropdown field requested as highest priority.

Validation:

- `node --check binary-tree-next-app.mjs` passed.

## 66) UI Refinement (2026-04-10, Left Shell Color Token Correction)

Delivered:

- Updated left shell container token in canvas shell:
  - `SHELL_PANEL_COLOR` -> `#FFFFFF`
- Updated left shell placeholder slot token:
  - `SKELETON_SLOT_COLOR` -> `#EDEDED`
- Kept structure and interaction behavior unchanged (visual token pass only).

Result:

- Left shell now follows the requested palette split exactly:
  - panel container is white
  - placeholder cards use `#EDEDED`.

Validation:

- `node --check binary-tree-next-app.mjs` passed.

## 67) UI Refinement (2026-04-10, Left Shell Logo Canvas Quality)

Delivered:

- Improved canvas logo rendering for left-shell brand field:
  - enabled high-quality image smoothing during logo draw
  - aligned draw rect to DPR pixel increments before raster scaling.

Result:

- Brand logo edges render cleaner and more consistent with dashboard DOM image quality.

Validation:

- `node --check binary-tree-next-app.mjs` passed.

## 68) UI Refinement (2026-04-10, Left Shell Collapse Button Parity)

Delivered:

- Added dedicated collapse-arrow control beside brand logo in left-shell top row.
- Split brand row into two controls:
  - brand dropdown button
  - separate sidebar collapse button (`toggle:side-nav`).
- Added canvas double-chevron horizontal icon helper and used it for:
  - collapse arrow in open sidebar state
  - compact reopen toggle when sidebar is collapsed.

Result:

- Left-shell top interaction now matches dashboard pattern more closely (logo dropdown + adjacent collapse arrow), while preserving a clear reopen affordance.

Validation:

- `node --check binary-tree-next-app.mjs` passed.

## 69) UI Refinement (2026-04-10, Exact Collapse Icon + Hover Motion Parity)

Delivered:

- Replaced custom canvas chevron icon for side-nav collapse control with exact dashboard Material Symbols glyphs:
  - `keyboard_double_arrow_left` (`0xEAC3`)
  - `keyboard_double_arrow_right` (`0xEAC9`)
- Added icon subset font links in `binary-tree-next.html` for these glyphs.
- Added motion refinement for the control to mirror dashboard feel:
  - 150ms hover timing
  - eased spring-like scale
  - subtle hover lift/shadow and icon tone/size transition.

Result:

- Side-nav collapse/reopen control now aligns with dashboard iconography and interaction language while staying canvas-native.

Validation:

- `node --check binary-tree-next-app.mjs` passed.

## 70) Performance Hardening (2026-04-10, Cross-Platform Startup Smoothness)

Delivered:

- Added adaptive startup reveal profile selection (`full`/`lite`) based on reduced-motion, pixel workload, CPU cores, and device memory.
- Added early-startup frame-budget monitoring and automatic downgrade to `adaptive-lite` when startup frame pacing falls below target.
- Refactored intro reveal application behind shared helpers with thresholds to skip negligible blur/translate/alpha work.
- Disabled startup reveal effects for dot-tier nodes and skipped connector reveal animation in lite/adaptive modes.
- Made panel intro blur adaptive via intro state (`panelBlurPx`) instead of static-only values.

Result:

- Startup behavior remains visually consistent while reducing first-seconds lag risk on high-DPI or constrained GPU/CPU paths.

Validation:

- `node --check binary-tree-next-app.mjs` passed.

## 71) UX/Performance Balance (2026-04-10, Connector Intro Cohesion)

Delivered:

- Restored startup connector (line) animation to align with node intro motion.
- Added `connectorRevealMode` startup state (`full` / `lite`).
- Updated lite/adaptive behavior to keep connector animation enabled using lightweight reveal (alpha + Y offset) without blur/filter overhead.
- Kept full reveal path for strong environments.

Result:

- Intro now feels cohesive (nodes + connectors animate together) while still protecting startup frame pacing on constrained/high-DPI devices.

Validation:

- `node --check binary-tree-next-app.mjs` passed.

## 72) Input Parity (2026-04-10, Native macOS Trackpad Support in Next)

Delivered:

- Implemented trackpad wheel event detection parity from `binary-tree.mjs`.
- Added platform-aware manual wheel-zoom modifier mapping (macOS Command, non-macOS Ctrl).
- Added trackpad pinch-to-zoom path and two-finger pan path for Binary Tree Next canvas.
- Added runtime state for reverse movement and zoom sensitivity with sane defaults/sanitization.
- Preserved legacy smooth wheel zoom fallback for non-trackpad wheel input.

Result:

- Binary Tree Next now supports native-feeling macOS trackpad interactions while retaining compatibility for mouse wheel users.

Validation:

- `node --check binary-tree-next-app.mjs` passed.

## 73) Input Tuning (2026-04-10, Stronger Trackpad Pinch Zoom)

Delivered:

- Increased `DEFAULT_TRACKPAD_ZOOM_SENSITIVITY` from `0.3` to `0.5` in Binary Tree Next.

Result:

- Trackpad pinch interactions now produce more pronounced zoom response.

Validation:

- `node --check binary-tree-next-app.mjs` passed.

## 74) Input Bugfix/Tuning (2026-04-10, Strong Trackpad Pinch Behavior)

Delivered:

- Fixed sensitivity clamp ceiling that capped trackpad zoom to `1`.
- Increased `MAX_TRACKPAD_ZOOM_SENSITIVITY` to `6`.
- Added `TRACKPAD_PINCH_DELTA_BASE = 60` and updated pinch exponential formula for stronger response.

Result:

- Higher configured sensitivity values now function, and pinch zoom strength is materially increased.

Validation:

- `node --check binary-tree-next-app.mjs` passed.

## 75) Perf Smoothing (2026-04-10, Windows Intro Tail Stability)

Delivered:

- Added deterministic per-entity reveal jitter for deeper startup layers.
- Added tail-phase blur fade acceleration (`STARTUP_REVEAL_END_FILTER_PROGRESS = 0.82`).
- Extended depth reveal resolver with optional extra delay to avoid synchronized deep-layer bursts.

Result:

- Startup tail now distributes work more evenly and reduces end-phase frame drop spikes.

Validation:

- `node --check binary-tree-next-app.mjs` passed.

## 76) UX Input Polish (2026-04-10, Eased Mouse Wheel Zoom)

Delivered:

- Added wheel-zoom easing via animated camera targets instead of instant scale jumps.
- Added wheel-specific damping profile and target reason tracking.
- Added wheel-target scale accumulation so continuous wheel scrolling remains responsive while easing is active.
- Kept trackpad pinch/pan behavior unchanged.

Result:

- Mouse wheel zoom transitions are now smoother and less abrupt.

Validation:

- `node --check binary-tree-next-app.mjs` passed.

## 77) Implementation Update (2026-04-10, Left Panel Shell Data/Control Pass)

Delivered:

- Replaced next-gen left-shell placeholders with functional canvas modules:
  - search section
  - pinned/favorites section
  - selected-node details section
  - server timer/cutoff section.
- Added synchronized DOM search input overlay (positioned to canvas side-nav slot) for natural text entry.
- Added action routing for pin/focus/remove and relation navigation (`parent`/`sponsor`).
- Added local persistence for pinned nodes (`binary-tree-next-pinned-node-ids-v1`).
- Expanded mock node payload shape with profile/business fields:
  - `username`, `title`, `badges`, `accountStatus`, `sponsorId`, `sponsorLeg`, `isSpillover`.
- Expanded adapter-side search indexing to include profile fields and badges.

Result:

- Binary Tree Next now has a functional left shell that can drive search and node context workflows, enabling future backend/live-tree data contract hookup without reworking the shell UI.

Known limitation:

- This pass still uses mock next-gen data; live backend contract integration remains the next major step.

Validation:

- `node --check binary-tree-next-app.mjs` passed.
- `node --check binary-tree-next-engine-adapter.mjs` passed.
- Visual verification passes captured in `temporary screenshots/` (`pass2`/`pass3`/`pass4`).

## 78) UI Refinement (2026-04-10, Pinned Places Carousel Style Pass)

Delivered:

- Reworked the left-shell pinned section into an Apple Maps-inspired "Places" carousel.
- Added circular destination tiles with custom icon rendering (work/home/bank) in canvas.
- Added two-line place labels and horizontal overflow clipping for carousel behavior.
- Preserved interaction contract:
  - real pinned nodes still focus on click
  - selected-node pin toggle remains available (`Pin` / `Unpin`).
- Added fallback sample places when no pinned nodes exist so the new visual structure remains stable.

Result:

- Pinned panel now matches requested Apple Maps visual language while remaining compatible with next-gen pinning/focus data flow.

Validation:

- `node --check binary-tree-next-app.mjs` passed.

## 79) UX Refinement (2026-04-10, Favorites = Real Node Pins + Horizontal Scroll/Grab)

Delivered:

- Reworked favorites data source to use only real pinned node ids (removed sample place fallback cards and custom place-icon semantics).
- Updated favorites heading text to `Favorites` and removed the gray section container treatment.
- Kept favorite chip identity tied to node data (initials/name/volume summary).
- Added carousel interaction behavior in side nav:
  - wheel inside favorites viewport maps to horizontal row scroll
  - pointer drag supports grab-style horizontal scrolling.
- Added tap-vs-drag release logic so favorite chips still trigger node focus on click but not while actively dragging.

Result:

- Favorites now functions as a true binary-tree pin browser, with expected horizontal browse interaction and reliable click-to-focus behavior.

Validation:

- `node --check binary-tree-next-app.mjs` passed.
- `node --check binary-tree-next-engine-adapter.mjs` passed.

## 80) UI Refinement (2026-04-10, Tree Node Gradient Unified With Favorites)

Delivered:

- Added shared avatar gradient builder (`createNodeAvatarGradient`) in next-gen app shell.
- Refactored Favorites avatar chips and tree node rendering to consume the same gradient profile.
- Applied unified gradient across all node LOD tiers (including dot mode).

Result:

- Visual color language is now consistent between pinned favorites and the tree itself.

Validation:

- `node --check binary-tree-next-app.mjs` passed.

## 81) UI Refinement (2026-04-10, Apple Maps Circle Gradient Container Match)

Delivered:

- Replaced node/favorites fill model from per-id random HSL gradients to fixed Apple Maps-style palettes (`root`, `accent`, `neutral`).
- Added directional gradient blend and subtle sheen overlay to mirror the reference circle container treatment.
- Applied shared fill path to all node LOD tiers and favorites circles for consistency.

Result:

- Circle containers now follow the requested Apple Maps gradient character (brown/cyan/slate families with smooth shaded depth).

Validation:

- `node --check binary-tree-next-app.mjs` passed.
- `node --check binary-tree-next-engine-adapter.mjs` passed.

## 82) UI Refinement (2026-04-10, Multi-Color Node Mapping With Apple Gradient)

Delivered:

- Preserved Apple Maps-style circle container gradient + sheen treatment.
- Added deterministic multi-color mapping for non-selected nodes using palette rotation (`neutral`, `ocean`, `mint`, `amber`, `rose`).
- Kept root and selected color priorities (`root` brown, `accent` cyan).

Result:

- Tree nodes now have varied colors while retaining the approved gradient character.

Validation:

- `node --check binary-tree-next-app.mjs` passed.

## 83) UI Refinement (2026-04-10, Containerless Apple Maps Search Row)

Delivered:

- Removed legacy search card container from left-side shell search section.
- Added Apple Maps-style search row composition:
  - rounded search pill
  - magnifier icon inside pill
  - adjacent circular profile icon button.
- Restyled overlay input to transparent/no-border to align with the pill-only composition.

Result:

- Search area now visually matches requested reference scope (search bar + profile icon, without extra surrounding container).

Validation:

- `node --check binary-tree-next-app.mjs` passed.
- `node --check binary-tree-next-engine-adapter.mjs` passed.

## 84) UI Refinement (2026-04-10, Search Profile Icon Shadow Removal)

Delivered:

- Removed drop-shadow rendering from the profile icon adjacent to the containerless search bar.
- Kept icon fill/ring geometry and action wiring intact.

Result:

- Search row avatar now matches the requested flat treatment.

Validation:

- `node --check binary-tree-next-app.mjs` passed.

## 85) UI Refinement (2026-04-10, White Search Pill + Soft Drop Shadow)

Delivered:

- Changed containerless search pill fill to `#FFFFFF`.
- Added subtle shadow treatment for search pill depth.

Result:

- Search row now has brighter contrast while preserving Apple Maps-like composition.

Validation:

- `node --check binary-tree-next-app.mjs` passed.

## 86) UI Refinement (2026-04-10, Search Pill Fill #DFDFDF)

Delivered:

- Updated containerless search pill fill color to `#DFDFDF`.
- Preserved existing shadow and search-row structure.

Result:

- Search bar now uses the requested gray tone.

Validation:

- `node --check binary-tree-next-app.mjs` passed.

## 87) UI Refinement (2026-04-10, Updated Shell Color Tokens)

Delivered:

- Updated color tokens to requested values:
  - panel + dock container = `#F2F2F6`
  - dock icon containers = `#FFFFFF`
  - search bar = `#FFFFFF`
  - node-details background = `#FFFFFF`.

Result:

- Next-gen shell now reflects the latest panel/dock/search/details palette direction.

Validation:

- `node --check binary-tree-next-app.mjs` passed.

## 88) UI Refinement (2026-04-10, Softer Search Pill Shadow)

Delivered:

- Lowered search pill shadow intensity by reducing opacity, blur radius, and vertical offset.

Result:

- Search row keeps depth but with a less pronounced shadow.

Validation:

- `node --check binary-tree-next-app.mjs` passed.

## 89) UI Refinement (2026-04-10, Material Search Icon + SF/Inter Typography)

Delivered:

- Replaced search icon draw logic with Material Symbols `search` glyph in canvas.
- Added explicit `icon_names=search` stylesheet import in page head.
- Updated typography stack to SF Sans-first with Inter fallback for page base, canvas text defaults, and search input.

Result:

- Search row aligns with requested icon source and typography preference.

Validation:

- `node --check binary-tree-next-app.mjs` passed.

## 90) UI Refinement (2026-04-10, Search Icon Scale/Alignment)

Delivered:

- Increased search icon scale and tuned icon alignment inside the search pill.
- Adjusted input insets to keep spacing consistent with the larger icon.

Result:

- Search icon now feels proportionate to the search bar.

Validation:

- `node --check binary-tree-next-app.mjs` passed.

## 91) UX Bugfix (2026-04-10, Search Input Startup Reveal Cohesion)

Delivered:

- Added side-nav search input opacity state driven by panel reveal alpha.
- Updated search input sync logic to hide at near-zero opacity and apply reveal opacity each frame.
- Applied panel reveal translation offset to search input rect Y so the DOM input tracks animated panel movement.

Result:

- Search input now participates in startup reveal timing/position and no longer appears detached from panel animation.

Validation:

- `node --check binary-tree-next-app.mjs` passed.

## 92) UX Refinement (2026-04-10, Tree-First Startup Reveal Order)

Delivered:

- Increased panel/dock reveal delays so main tree animation is presented first.
- New delays:
  - side panel: `1200ms`
  - dock: `1450ms`.

Result:

- Startup sequence now prioritizes tree visibility before UI chrome enters.

Validation:

- `node --check binary-tree-next-app.mjs` passed.
- `node --check binary-tree-next-engine-adapter.mjs` passed.

## 0.3) Startup Overlap Timing Tune (2026-04-10)

- Adjusted startup timing so shell chrome appears before tree intro fully completes.
- Updated delays in binary-tree-next-app.mjs:
  - side panel delay: 1200ms -> 540ms
  - dock delay: 1450ms -> 700ms
- Effect:
  - startup sequence keeps tree-first emphasis but now overlaps panel/dock motion for a tighter perceived load experience.
## 0.4) Mock First-Time Trigger Override (2026-04-10)

- Added a client-side one-time override for mock runtime testing of launch intro gate.
- Scope:
  - active only in `mock-js` mode
  - member source only
  - only when server launch-state is not already first-time.
- Uses per-user local marker key:
  - `binary-tree-next-mock-first-time-override-v1:<userId>`
- Effect:
  - lets current mock user re-trigger Welcome splash without backend row resets while preserving normal behavior afterward.
## 0.5) Welcome Splash Apple Motion Pass (2026-04-10)

- Refined first-open welcome gate UI with Apple-like motion language and frosted card treatment.
- Added layered animation system:
  - animated ambient background orbs
  - spring-like card entrance
  - delayed title/subtitle reveal
  - gentle prompt breathe cycle.
- Added reduced-motion handling for accessibility.
- Updated splash show timing to apply visible class on next animation frame for reliable transition playback.
## 0.6) Dock Asterisk Intro-State Reset (2026-04-10)

- Added member-side server reset API for first-open intro tracking.
- Endpoint:
  - DELETE /api/member-auth/binary-tree-next/launch-state
- Dock integration:
  - asterisk button now invokes reset endpoint for authenticated member
  - on success, clears local mock-first-time consume marker and reloads app.
- Effect:
  - enables repeatable welcome-gate testing without manual database intervention.
## 0.7) Intro Reset Route Compatibility Fix (2026-04-10)

- Added reset endpoint alias for method compatibility:
  - POST /api/member-auth/binary-tree-next/launch-state/reset
- Dock reset flow now attempts DELETE first, then POST fallback on 404/405.
- Backend runtime was restarted to load updated route mappings.
- Result:
  - reset workflow is now stable even when DELETE path is unavailable in current runtime routing.
## 0.8) Welcome Splash Visual Refresh (2026-04-10)

- Delivered:
  - redesigned first-open splash visuals in `binary-tree-next.html` with brand-led layered gradients and texture
  - introduced branded badge using `/brand_assets/Logos/L&D White Icon.png`
  - updated copy hierarchy to "Welcome to Binary Tree" with a clearer continue cue
  - added focus-visible, hover, and active interaction states for splash affordances
  - synchronized dismiss timing by changing `FIRST_OPEN_SPLASH_FADE_MS` from `180` to `260`
- Design choices:
  - preserved launch-state gating behavior in `binary-tree-next-app.mjs` to avoid first-time flow regressions
  - used existing logo palette colors (`#67B392`, `#7853A2`, `#8E68AD`) for consistency
- Known limitations:
  - no screenshot comparison loop was executed in this pass
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## 0.9) Left Panel Header Cleanup (2026-04-10)

- Delivered:
  - removed top logo/header row from left panel in `binary-tree-next-app.mjs`
  - removed side-nav collapse/expand button and related hover/render helpers
  - removed `toggle:side-nav` action branch so side nav remains open
  - shifted top layout so search row becomes the new first row
  - preserved profile menu access through search-row avatar (`brand-menu:toggle`)
- Design choices:
  - retained all non-requested panel functionality (search, favorites, details, server timer)
  - removed only the specific top-header/collapse UI requested
- Known limitations:
  - no screenshot pass for this change (per request)
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## 1.0) Search UX Decoupled From Layout (2026-04-11)

- Delivered:
  - added dedicated search dropdown overlay anchored to the left-panel search pill
  - implemented ranked node search results (name/username/rank/title/id)
  - added keyboard interactions (`ArrowUp`, `ArrowDown`, `Enter`, `Escape`)
  - clicking or confirming a result now triggers camera focus to that node only
  - removed query dependency from tree frame rendering and filtered-bounds fitting
- Design choices:
  - retained existing left-panel search shell and integrated dropdown as an overlay to minimize UI churn
  - kept `state.query` as input state while preventing it from driving tree visibility/layout
- Known limitations:
  - no screenshot pass for this change
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## 1.1) Search Dropdown Node Icons (2026-04-11)

- Delivered:
  - added node icon/avatar visuals to each search dropdown result row
  - reused node palette logic for gradient consistency with tree/favorites
  - added initials display inside avatar core
- Design choices:
  - kept avatar DOM-based (overlay layer) for lightweight integration with existing dropdown
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## 1.2) Search Dropdown Capacity + Dividers (2026-04-11)

- Delivered:
  - increased search dropdown max results to 18
  - added thin line separators between result rows
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## 1.3) Search List Uniformity + Icon Shell Cleanup (2026-04-11)

- Delivered:
  - made search dropdown rows uniform in height
  - added overflow-ellipsis text behavior to keep row heights fixed
  - removed white outer icon shell from search results and favorites avatars
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## 1.4) Selected Icon Accent Removed (2026-04-11)

- Delivered:
  - removed selected-to-blue accent palette switching across icon contexts
  - selected state now uses white border/ring emphasis only
  - applied white border for active icons in Favorites and search dropdown
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## 1.5) Profile Icon Menu Refactor to DOM Dropdown (2026-04-11)

- Delivered:
  - added `SIDE_NAV_PROFILE_MENU_ID` and new DOM profile-menu overlay lifecycle:
    - `ensureSideNavProfileMenu()`
    - `renderSideNavProfileMenu(...)`
    - `syncSideNavProfileMenu()`
  - anchored profile menu to the search-row profile icon via `state.ui.sideNavBrandMenuAnchorRect`
  - replaced prior canvas menu rendering block with DOM-driven menu content
  - preserved existing brand-menu actions (`profile`, `dashboard`, `my-store`, `settings`, `logout`)
  - implemented uniform rows, thin separators, and per-row icon badges
  - added menu/header close affordance and search/menu mutual exclusion behavior
- Design choices:
  - reused search-dropdown shell properties for visual coherence
  - kept actions unchanged to reduce regression risk during UI architecture shift
- Known limitations:
  - icons are temporary letter badges pending final profile icon set
  - no screenshot diff cycle performed this pass (per request)
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## 1.6) Profile Dropdown Density Pass (2026-04-11)

- Delivered:
  - expanded DOM profile menu width logic to span through the profile icon area
  - tightened panel spacing and top gap
  - reduced profile header element scale (avatar/title/subtitle/close control)
  - reduced list row and icon sizing for better density
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## 1.7) Profile Avatar Shadow Removal (2026-04-11)

- Delivered:
  - removed header avatar drop shadow inside the DOM profile dropdown menu.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## 1.8) Profile Header Top Headspace (2026-04-11)

- Delivered:
  - increased profile menu header top padding to create more space above the avatar.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## 1.9) Profile Close Icon Font + Header Headspace Increase (2026-04-11)

- Delivered:
  - added Material Symbols `close` stylesheet import to `binary-tree-next.html`
  - switched profile menu close button glyph to Material Symbols `close`
  - increased profile header top padding for additional headspace
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## 2.0) Icon Regression + `close_small` Update (2026-04-11)

- Delivered:
  - fixed search bar icon regression by rendering search via Material Symbols codepoint
  - replaced profile close icon import/glyph with `close_small`
  - scaled down close control dimensions and optical size
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## 2.1) Session Avatar Sync + Profile Row Icon System (2026-04-11)

- Delivered:
  - introduced session-avatar resolution pipeline (photo/color/palette fallback)
  - wired session avatar rendering into tree nodes, profile icon by search, profile panel header, and session-linked search rows
  - added canvas circular image draw fallback logic for profile-photo mode
  - replaced profile panel list icon badges with Material Symbols and white-filled glyph styling on gradient circles
  - added Material Symbols imports for `account_circle`, `local_mall`, `settings`, and `logout`
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## 2.2) Material Symbols Consolidation for Profile Menu Icons (2026-04-11)

- Delivered:
  - added combined Material Symbols stylesheet link including all icons used by UI + profile menu list.
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## 2.3) Profile List Icon Rendering + Explicit Color Set (2026-04-11)

- Delivered:
  - replaced profile row icon ligature text with explicit Material Symbols codepoint glyphs
  - added full Material Symbols font import for robustness
  - mapped profile row icon-circle gradient colors to requested Blue/Green/Purple/Gray/Red set
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## 2.4) Left Panel Node Details Container Redesign Draft (Weekly BV Card Style) (2026-04-11)

- Delivered:
  - replaced the previous `Node Details` flat white card block with a Weekly-BV-inspired canvas module
  - added dashboard-style visual hierarchy:
    - metric header label + status pill
    - large tree-total BV value
    - personal BV secondary line
    - legend + compact bar-comparison strip
  - refactored metadata into 2x2 tiles (Status, Rank, Left Leg, Right Leg)
  - preserved relation focus actions (Parent/Sponsor) with refreshed row styling
  - kept badge chip rendering and added boundary-aware clipping behavior
- Design choices:
  - retained all existing data sources and interaction hooks to avoid behavioral regressions
  - mirrored dashboard composition while staying within current canvas-render architecture
- Known limitations:
  - screenshot pass intentionally skipped in this session per user request
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## 2.5) Node Details Container Simplification Draft (2026-04-11)

- Delivered:
  - removed Node Details chart strip and chart-related rendering logic
  - removed top-right `Live` status badge
  - removed gradient and glow background styling from Node Details container
  - reduced content to requested data only:
    - Name + Username
    - Rank + Account Status
    - Total Organizational BV
    - Left Leg + Right Leg
- Design direction:
  - kept dashboard-like Weekly BV card hierarchy while simplifying decoration and reducing visual noise
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## 2.6) Details Panel 1:1 Mock Refactor + Parent/Sponsor Action Styling (2026-04-11)

- Delivered:
  - replaced simplified node panel composition with provided mock-aligned `Details` layout
  - added centered avatar section with active/inactive status indicator
  - implemented rank row with dynamic two-icon rendering (rank + title)
  - replaced card-grid metrics with row-style metrics and fixed separator color `#E2E2E2`
  - implemented bottom action pills for Parent/Sponsor using requested colors:
    - fill `#D0E6FF`
    - text/icon `#077AFF`
  - connected requested Material Symbols icon names:
    - `family_history` (Parent)
    - `person_add` (Sponsor)
- Technical notes:
  - added ligature render fallback for button icons to prevent word-render regressions
  - added icon-path fallback mapping for rank/title icon slots when explicit icon fields are absent
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.

## 2.7) Details Panel Corrections - White Shell, Inter Weights, Cycles, Avatar Source Fallback (2026-04-11)

- Delivered:
  - set details container fill to `#FFFFFF`
  - applied Inter family/weight mapping for heading/name/username/labels/values/buttons
  - added `Cycles` row to metrics block
  - added node-avatar photo URL resolver and integrated photo-first render path with placeholder fallback
  - kept account-state indicator dot bound to active/inactive state
- Validation:
  - `node --check binary-tree-next-app.mjs` passed.
