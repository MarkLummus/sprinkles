# Walking Skeleton — Sprinkles

**Phase:** 1
**Generated:** 2026-09-05

## Capability Proven End-to-End

A maker opens Sprinkles, sees the churned olive oil recipe in a list, clicks through to its page, and reads its twelve ingredient rows with the grams the sheet printed — served from browser IndexedDB through the repository seam, with the batch mass computed by a framework-free domain module.

That single path touches every layer Phase 1 will modify: build → router → store seam → seed → domain math → screen.

## Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | React 19.2.8 + JSX, no TypeScript | `CLAUDE.md` locks React + JSX; TypeScript explicitly not adopted. Ratified on this phase's real code. |
| Build tooling | Vite 8.2.2 + `@vitejs/plugin-react` 6.1.1 | `CLAUDE.md` "JSX toolchain: Vite". Plugin requires `vite ^8.0.0` — the two move together. |
| Routing | `react-router` 8.3.1 (unified package; DOM exports from `react-router/dom`) | D-14: URL-addressable routes now so Phase 2's batch route and Phase 4's print route are additions, not a retrofit. `react-router-dom` no longer exists at v8. |
| Data layer | Browser IndexedDB via `idb` 8.0.3, behind `createRepository()` | D-06. The seam is the architecture; `idb` is a thin promise wrapper, not an abstraction layer. D-16 keeps the backend open — a later adapter replaces `db.js` without touching domain or UI. |
| Domain math | Framework-free ES modules under `app/src/domain/` — no React, no DOM, no store imports | `CLAUDE.md` "domain math lives in framework-free modules". Runs in Vitest's `node` environment with no DOM available at all. |
| Record model | A version record embeds a full copy of every row's ingredient coefficients and basis | D-05. A version is self-contained and immutable; Phase 2's batch snapshot is the version plus as-made values. Closes the coefficient-drift hazard recorded in `.planning/PROJECT.md`. |
| Target bands | Authored per recipe, stored on the version record | D-09. Style presets are a later concern; nothing is inferred for a figure the recipe gave no band. |
| Auth | None | Single local user, no server, no accounts in milestone 1. |
| Deployment target | `npm --prefix app run dev` serving locally | No hosted deployment is in scope for milestone 1. "Dev environment" here means the local Vite dev server. |
| Directory layout | `app/` subfolder of the repo; `domain/`, `data/`, `store/`, `ui/`, `styles/` under `app/src/` | D-16 keeps code apart from the requirements packet, mockups, and log photos at the repo root. |
| Test runner | Vitest 5.0.0, default `environment: 'node'` | D-15. Component tests opt into jsdom per-file via a docblock, so the domain suite stays provably DOM-free. |

## Stack Touched in Phase 1

- [ ] Project scaffold — `app/` with Vite, React, JSX, Vitest, `npm --prefix app run build` and `npm --prefix app test` both green
- [ ] Routing — `/` (recipe list) and `/recipe/:id` (recipe page), both URL-addressable
- [ ] Database — IndexedDB `sprinkles` / object store `versions`: one real write (seed-on-empty-store) and one real read (recipe page loads the version by id)
- [ ] UI — the recipe list item is clickable and navigates to the recipe page, which renders data read from the store
- [ ] Deployment — `npm --prefix app run dev` serves the full stack locally; documented in the root `CLAUDE.md`

## Out of Scope (Deferred to Later Slices)

Explicit, so later phases do not re-litigate Phase 1's minimalism:

- Recording a batch, as-made values, observations (Phase 2)
- Creating or editing versions, lineage, the comparison overlay (Phase 3)
- The bench sheet, print CSS, the human-readable short code (Phase 4)
- Derived structural advisories — sub-scale amounts, ultra-pasteurised mass, gum hydration temperature (Phase 3, FORM2-02). Phase 1 may render the margin slot empty.
- The 103-row ingredient seed database and the ingredient library surface (ING-01, later milestone)
- Style presets for target bands, weighable-gram rounding, the freezing curve, the Ice Ed import converter
- Any server, sync, or account concept — D-16 stays open
- Scaling the batch away from 800 g

## Subsequent Slice Plan

Each later phase adds one vertical slice on top of this skeleton without altering its architectural decisions:

- **Phase 2:** the maker records the 2 Aug batch against the churned version, snapshotted, and reopens it unchanged — a `batches` object store added by an IndexedDB version bump, a `/recipe/:id/batch` route, the same repository seam.
- **Phase 3:** the maker creates version 2 from the churned version, edits it, and sees what changed — a second record in the same `versions` store carrying `parentVersionId`, plus the comparison overlay over the same page.
- **Phase 4:** the maker prints the new version as a bench sheet — a `/print/recipe-sheet/:id` route reusing the same component tree with print CSS.
