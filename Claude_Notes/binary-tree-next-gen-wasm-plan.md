# Binary Tree Next-Gen (WASM) - Planning & Layout

Last Updated: 2026-04-09
Status: Planning (No Runtime Code Changes Applied)
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

