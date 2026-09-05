<!-- GSD:project-start source:PROJECT.md -->

## Project

**Sprinkles**

Sprinkles is a recipe app for home ice cream makers who want to create better recipes, repeat successful batches, and understand what to change when a result disappoints them. It connects what was planned (the recipe), what was actually done (the batch), and how the result was experienced (observations), so each attempt can inform the next. Mark is the first user and is inside the target persona.

Product truth lives in `product-requirements/` (read `README.md` first). This file is GSD's delivery record: it points at that packet and records delivery state, milestone scope, and implementation decisions. It is not a second product definition.

**Core Value:** Make something you like, understand how it turned out, and know what to keep or change next time. If everything else fails, a maker must still be able to develop a recipe, make it from a printed sheet, and get back a record of what happened that the next version can cite.

### Constraints

- **Product authority**: The decision register governs; Mark approves scope and design. Neither framework may resolve an open decision by running first.
- **Tech stack (provisional)**: React with JSX, bundled by Vite, as recorded in `CLAUDE.md` — kept provisional through Phase 1 and ratified after it ships. TypeScript is not adopted. Domain math lives in framework-free modules.
- **Persistence (provisional)**: A local store behind a small repository seam, labeled provisional, so D16 stays open and the backend can be replaced without touching the domain.
- **Ingredient data**: The seed dataset is undecided; it is chosen in phase planning after the recipe data model is designed. Batches snapshot coefficients regardless.
- **Codebase mapping**: Deferred until real code lands in this repo; the JSX mockups are not a codebase.
- **Privacy**: No external model calls or network import without a stated policy (TRUST-01, IMP-01).
- **Design**: Impeccable owns design decisions and design QA; GSD phases consume approved surface briefs. Existing mockups and the old-sprinkles visual world are evidence until Mark confirms their authority (D13).
- **Language**: Familiar words by default, technical depth available (D11); open labels stay open (D12).
- **Working agreement**: Small reviewable steps; surface structural choices (routing, state, testing framework) rather than assuming them.

<!-- GSD:project-end -->

<!-- GSD:stack-start source:STACK.md -->

## Technology Stack

Technology stack not yet documented. Will populate after codebase mapping or first phase.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
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
