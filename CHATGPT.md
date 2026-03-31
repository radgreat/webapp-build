CHATGPT.md — Prompting & Planning Rules

Always Do First
	•	Invoke the prompt‑design skill before drafting any prompts or planning tasks.  Use it at the start of every session to gather requirements, confirm the current scope, and align with the latest project status.

Reference Documents
	•	Always review the relevant project documents before planning or writing prompts.  Key references include:
	•	charge‑documentation.md – major updates, design system details, API endpoints and high‑level technical changes.
	•	Current Project Status.md – the living status tracker for scope, roadmap, decision gates and immediate tasks.
	•	BackEnd‑Notes.md – migration preparation, database schema decisions, access control roles and run order.
	•	Extract key requirements and constraints from these documents.  Do not assume missing information; ask clarifying questions only when something blocks a task.

Planning Workflow
	•	Break each user request into clear, small steps with expected outcomes and dependencies.
	•	Use tables or bullet lists to outline tasks, deadlines and responsible parties.  Each task should include a short description, inputs, outputs and status (e.g. “To Do”, “In Progress”, “Blocked”).
	•	When planning a new feature or update:
	•	Identify which phase of the current roadmap it belongs to (Phase 1–6 as described in Current Project Status.md).
	•	Check the Owner Scope Gate and other gating rules (see Hard Rules below).  Do not plan beyond the approved scope.
	•	Identify whether the change affects the user side, admin side, or both.  After outlining user‑side changes, always pause and ask: “Apply this update to admin side too?” per the owner’s rule.
	•	Produce prompts that clearly instruct the model to perform actions in the given context.  Include necessary parameters, constraints and expected outputs.  Avoid ambiguity.
	•	Use the project’s naming conventions and design tokens (e.g. color names, typography sizes, component labels) from the Design System section in charge‑documentation.md when crafting design‑related prompts.

Output Defaults
	•	All plans and prompts should be delivered in Markdown.
	•	Use headings (##) to structure sections, tables for summarised data, and bullet lists for step‑by‑step tasks.  Keep prose outside of tables; tables should hold concise labels, dates or numeric values.
	•	For prompts that generate code or command snippets, wrap them in triple backticks (```) with language annotations when applicable.

Project Assets
	•	Consult the brand_assets/ folder when planning any front‑end changes to ensure correct logos, colours and style guides are used.
	•	Use documented colour tokens, typography rules and depth system from charge‑documentation.md when creating design prompts or specifying UI elements.

Anti‑Generic Guardrails
	•	Scope adherence: Do not invent new features or compensation systems beyond those approved.  At present, only Fast Track Bonus, Infinity Builder Bonus and Sales Team Commission are active.  Anything after section 4 of brand_assets/MLM Business Logic.md must remain gated until the owner explicitly unlocks it.
	•	Design fidelity: Do not propose using default Tailwind colours or generic UI patterns when a brand palette and design system are defined.
	•	Prompt clarity: Avoid vague prompts.  Be explicit about metrics, units, constraints and success criteria.  For example, specify currency, percentage or timestamp formats when relevant.
	•	Backend awareness: When planning backend work, prefer typed database fields (numeric for money, non‑negative integers for counters), and ensure roles and row‑level security policies are respected as defined in BackEnd‑Notes.md.

Documentation — ChatGPT Notes
	•	After every planning session or prompt draft, update or create notes in the Claude_Notes/ folder:
	•	Append details to charge‑documentation.md for major technical or design changes.
	•	Update Current Project Status.md to reflect scope progress, roadmap alignment, gating decisions and next steps.
	•	Update BackEnd‑Notes.md for any database or backend‑related considerations.
	•	Notes must include:
	•	What was planned or changed and why.
	•	Which files or documents were referenced.
	•	Any pending questions for the owner or other stakeholders.
	•	Known limitations or risks.
	•	Keep notes detailed but scannable.  Use clear headers and tables to organise information.

Hard Rules
	•	Respect scope gates: Do not plan or prompt beyond the approved scope.  Follow the Owner Scope Gate and User/Admin Update Decision Gate from Current Project Status.md.  If a task would introduce new compensation systems or unapproved features, explicitly note that owner approval is required.
	•	Ask about admin parity: After planning a user‑side change, always ask whether the same change should apply to the admin side.  Do not proceed on admin updates without explicit confirmation from the owner.
	•	Stay in role: Do not generate code or design assets unless explicitly asked.  Focus on prompt creation and planning.
	•	Update notes every session: No session should end without updating the relevant Claude_Notes/ documents.  This is non‑negotiable.