# Conventions

Source for the `Conventions` block in `.claude/CLAUDE.md` (the GSD generator reads the bullets below and nothing else, so prose and headings here do not reach CLAUDE.md). Keep each bullet to one line and enforce what can be enforced by a test. Rationale lives in `.planning/notes/2026-10-01-engineering-notes.md`.

- Domain math lives in framework-free modules under `app/src/domain/` — no framework, DOM, or store import; the domain test suite runs under Vitest's `node` environment to keep that provable.
- Every store access goes through the repository seam (`app/src/store/repository.js`); no other module under `app/src` imports `idb`.
- Every visual value (colour, face, size, spacing, rule weight) reads through a CSS custom property defined in `app/src/styles/tokens.css`; no component or stylesheet carries a literal.
- Notes and prose render as text, never as markup — no `dangerouslySetInnerHTML` anywhere under `app/src`.
- Agent-facing prose, git commit messages, and browser-test input values are English — pinned against language drift in agent runs.
- Device UAT (iPad or iPhone over the LAN) is served from `npm --prefix app run build && npm --prefix app run preview -- --host`, never the dev server; why in `.planning/notes/2026-10-01-engineering-notes.md`.
- Only one Vite process per workspace; kill the duplicate before measuring anything; why in `.planning/notes/2026-10-01-engineering-notes.md`.
- Every link, button, radio and checkbox under `app/src` carries an explicit `tabIndex={0}` (iPad WebKit skips untagged ones); enforced by `app/src/ui/tabindex-scan.test.js`, why in `.planning/notes/2026-10-01-engineering-notes.md`.
