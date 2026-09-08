<!-- GSD:project-start source:PROJECT.md -->

## Project

**Sprinkles**

Sprinkles is a recipe app for home ice cream makers who want to create better recipes, repeat successful batches, and understand what to change when a result disappoints them. It connects what was planned (the recipe), what was actually done (the batch), and how the result was experienced (observations), so each attempt can inform the next. Mark is the first user and is inside the target persona.

Product truth lives in `product-requirements/` (read `README.md` first). This file is GSD's delivery record: it points at that packet and records delivery state, milestone scope, and implementation decisions. It is not a second product definition.

**Core Value:** Make something you like, understand how it turned out, and know what to keep or change next time. If everything else fails, a maker must still be able to develop a recipe, make it from a printed sheet, and get back a record of what happened that the next version can cite.

### Constraints

- **Product authority**: The decision register governs; Mark approves scope and design. Neither framework may resolve an open decision by running first.
- **Tech stack (ratified)**: React with JSX, bundled by Vite, as recorded in `CLAUDE.md` — ratified in Phase 1 on real code. TypeScript is not adopted. Domain math lives in framework-free modules.
- **Persistence (provisional)**: A local store behind a small repository seam, labeled provisional, so D16 stays open and the backend can be replaced without touching the domain.
- **Ingredient data**: The seed dataset is undecided; it is chosen in phase planning after the recipe data model is designed. Batches snapshot coefficients regardless.
- **Codebase mapping**: Deferred until real code lands in this repo; the JSX mockups are not a codebase.
- **Privacy**: No external model calls or network import without a stated policy (TRUST-01, IMP-01).
- **Design**: Impeccable owns design decisions and design QA; GSD phases consume approved surface briefs. Existing mockups and the old-sprinkles visual world are evidence until Mark confirms their authority (D13).
- **Language**: Familiar words by default, technical depth available (D11); open labels stay open (D12).
- **Working agreement**: Small reviewable steps; surface structural choices (routing, state, testing framework) rather than assuming them.
- **Impeccable and GSD in sync**: Impeccable evaluates and decides (`shape`, `critique`, `audit`, `document`, `init` write `.impeccable/`, `DESIGN.md`, `PRODUCT.md`); every edit under `app/` goes through a GSD command. Impeccable's refine, enhance and fix commands describe work for `/gsd-quick`, `/gsd-quick-batch` or a phase plan and never edit `app/` directly. The loop is critique → brief revision → GSD plan/execute → re-critique; a critique snapshot self-closes when its target file changes.

<!-- GSD:project-end -->

<!-- GSD:stack-start source:STACK.md -->

## Technology Stack

React 19.2.8 + Vite 8.2.2 (JSX), bundled with `@vitejs/plugin-react` 6.1.1; react-router 8.3.1 for routing; `idb` 8.0.3 over IndexedDB for persistence; Vitest 5.0.0 for tests. Ratified in Phase 1 on real code — no longer provisional. TypeScript is not adopted.

The workspace lives in `app/`. Commands: `npm --prefix app run dev`, `npm --prefix app run build`, `npm --prefix app test`.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

- Domain math lives in framework-free modules under `app/src/domain/` — no framework, DOM, or store import; the domain test suite runs under Vitest's `node` environment to keep that provable.
- Every store access goes through the repository seam (`app/src/store/repository.js`); no other module under `app/src` imports `idb`.
- Every visual value (colour, face, size, spacing, rule weight) reads through a CSS custom property defined in `app/src/styles/tokens.css`; no component or stylesheet carries a literal.
- Notes and prose render as text, never as markup — no `dangerouslySetInnerHTML` anywhere under `app/src`.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

`app/src/main.jsx` bootstraps the app, seeds the store on an empty database (`app/src/store/seed.js`), and mounts the router (`app/src/router.jsx`). Routed components (`app/src/ui/`) read through the repository seam (`app/src/store/repository.js`), the sole path to IndexedDB (`app/src/store/db.js`). Domain modules (`app/src/domain/`) compute balance figures from a version's rows and never touch the store or the DOM.

A version record embeds its own ingredient rows' coefficients and basis — a `structuredClone` of the shared library entry, taken at authoring time — so a later edit to the shared library never moves an already-stored version's computed figures.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
