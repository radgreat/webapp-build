# Context Router (AI/Codex Note Intake)

Last Updated: 2026-04-11
Owner: Project Documentation Workflow

## Purpose

Use this file as the first stop before reading notes.  
Goal: load only task-relevant context to reduce context-window usage and avoid reading all logs end-to-end.

## Quick Intake Flow

1. Identify the task type.
2. Read only the category "Read First" notes.
3. Expand to "Deep Dive" notes only if blockers remain.
4. Use `charge-documentation.md` only for detailed chronology, edge cases, or regression tracing.

## Category Map

| Category ID | Task Signals | Read First | Deep Dive (If Needed) | Usually Skip Initially |
|---|---|---|---|---|
| `BT-UI` | Binary Tree Next UI, left/right panel, canvas layout, node detail visuals | `binary-tree-next-gen-wasm-plan.md` | `binary-tree-business-center.md`, latest `Current Project Status.md` update | `public-store-page.md`, `preferred-customer-page.md` |
| `BT-BIZ` | Binary tree business logic, activation/rank dependencies, business center tie-ins | `binary-tree-business-center.md` | `Current Project Status.md`, `charge-documentation.md` (search `binary-tree`) | Storefront notes |
| `BT-LEGACY` | Popup cover behavior, legacy binary-tree popup positioning | `binary-tree-popup-cover-next-implementation.md` | `charge-documentation.md` (search `popup` or `binary-tree.mjs`) | WASM/UI planning if not needed |
| `AUTH` | Login, session bootstrap, auth routes, auth redirects | `member-login-page.md` | `BackEnd-Notes.md`, `Current Project Status.md` | Storefront notes unless login-store coupling appears |
| `STORE` | Store pages, storefront UX, checkout/store routing, preferred customer flows | `public-store-page.md`, `preferred-customer-page.md` | `member-login-page.md`, `Current Project Status.md` | Binary tree notes |
| `DB-BE` | Database/storage migrations, backend schema/workflow setup | `BackEnd-Notes.md` | `charge-documentation.md`, backend-specific status updates in `Current Project Status.md` | UI-specific notes |
| `GLOBAL` | Cross-cutting timeline, audit trail, long-form implementation history | `Current Project Status.md` (tail/recent updates only) | `charge-documentation.md` (targeted keyword search) | Full-file read of all domain notes |
| `RULES` | Agent behavior rules for this repo | `AGENTS.MD` | N/A | Everything else until rules are known |

## Task-to-Notes Shortcuts

### Binary Tree Next visual task (most common)

1. `binary-tree-next-gen-wasm-plan.md` (latest section first)
2. `Current Project Status.md` (latest section first)
3. `binary-tree-business-center.md` (if data or business constraints are involved)

### Login/auth regression

1. `member-login-page.md`
2. `Current Project Status.md`
3. `BackEnd-Notes.md`

### Storefront behavior change

1. `public-store-page.md`
2. `preferred-customer-page.md`
3. `member-login-page.md` (only if routing/auth is involved)

## Read Strategy Guidelines

- Prefer section-level reading (`Recent Update`, `Latest Update`) before full-file reads.
- Use keyword-targeted search in `charge-documentation.md` instead of full scan.
- If task scope changes mid-session, return here and switch category before loading new notes.

