---
phase: 01-read-the-churned-recipe
plan: 01
subsystem: recipe-read
tags: [react, vite, react-router, idb, vitest, indexeddb, domain-math]

requires: []
provides:
  - "The app/ workspace: React 19 + Vite 8 (JSX), react-router 8, idb 8, vitest 5, with dev/build/test scripts"
  - "The repository seam (createRepository) as the sole path to IndexedDB — enforced by a grep gate"
  - "Seed-on-empty-store (seedIfEmpty) writing the churned olive oil version exactly once, through the same saveVersion call every later write uses"
  - "The framework-free balance module (computeBalance, weakestBasis, COEFFICIENT_SET) reproducing all nine printed-sheet figures within tolerance, running under Vitest with no DOM"
  - "Router (/ and /recipe/:id) and the RecipeList/RecipePage/IngredientTable components rendering the twelve seeded rows in the printed sheet's authored order"
  - "The version-embedded ingredient row as the primary identity model — a version's figures are proven independent of the shared library"
affects: ["01-02", "01-03", "01-04", "phase-02-batch-record"]

actuals:
  tokens: 6816
  tasks: 3
  commits: 4

tech-stack:
  added: [react@19.2.8, react-dom@19.2.8, vite@8.2.2, "@vitejs/plugin-react@6.1.1", react-router@8.3.1, idb@8.0.3, vitest@5.0.0]
  patterns:
    - "Repository seam: every store access goes through createRepository(); nothing else imports 'idb' (grep-enforced)"
    - "Version-embedded coefficients: a version's rows carry a structuredClone of their ingredient record, so a later library edit cannot move an already-stored figure's math"
    - "Framework-free domain modules: composition.js has no framework, DOM, or store import, and the test suite runs under vitest environment:'node' to keep that provable"
    - "Seed-on-empty-store: seedIfEmpty(repository) takes the repository as a parameter so it is testable with a plain in-memory object"

key-files:
  created:
    - app/package.json
    - app/package-lock.json
    - app/index.html
    - app/vite.config.js
    - app/vitest.config.js
    - app/.gitignore
    - app/src/main.jsx
    - app/src/router.jsx
    - app/src/domain/composition.js
    - app/src/domain/composition.test.js
    - app/src/data/library.js
    - app/src/data/olive-oil.js
    - app/src/store/db.js
    - app/src/store/repository.js
    - app/src/store/seed.js
    - app/src/store/seed.test.js
    - app/src/ui/RecipeList.jsx
    - app/src/ui/RecipePage.jsx
    - app/src/ui/IngredientTable.jsx
    - app/src/styles/app.css
  modified: []

key-decisions:
  - "Version-embedded ingredient row promoted as the primary identity model (assumption-delta `promote`): a shared ingredient library becomes a source a version copies from at authoring time, never an authority read through at render time."
  - "Reused the old-sprinkles library.js/olive-oil.js transcription verbatim (read, not imported) rather than the competing 103-row seed database, per D-01 — dextrose PAC 190 and salt PAC 580 are this transcription's values."
  - "Domain math and its test suite are proven framework-free: vitest.config.js pins environment:'node' as the default so the balance module can never silently pick up a DOM dependency."
  - "Task 3 required no implementation change: the domain and store modules Task 2 wired already satisfied every printed-sheet figure and idempotency assertion Task 3 specified. See TDD Gate Compliance below."

patterns-established:
  - "Repository seam: app/src/store/repository.js is the only module under app/src importing the store library; enforced by grep -rl \"from 'idb'\" app/src"
  - "Embedded-coefficient invariant: a stored version's computed figures never move when the shared library changes after the version was built"

requirements-completed: [REC1-01]

coverage:
  - id: D1
    description: "The app builds and serves the recipe list and recipe page end to end; the seeded recipe opens from IndexedDB through the repository seam and its twelve rows render in the printed sheet's order"
    requirement: "REC1-01"
    verification:
      - kind: manual_procedural
        ref: "Task 2 tracer feedback gate — human-verified in a real browser: list shows one recipe (Olive Oil Ice Cream, 50 g oil · 800 g, 799.7 g), click-through lands on /recipe/olive-oil-ice-cream-v1 with the twelve-row ingredient table in order, two reloads still show exactly one recipe"
        status: pass
      - kind: other
        ref: "npm --prefix app run build"
        status: pass
    human_judgment: false
  - id: D2
    description: "computeBalance reproduces all nine printed-sheet figures (mass, fat, milkfat, olive-oil share of fat, MSNF, sugar, solids, PAC, POD) within the stated tolerances, and handles zero-row and single-row edge cases"
    requirement: "REC1-01"
    verification:
      - kind: unit
        ref: "app/src/domain/composition.test.js#computeBalance — churned olive oil printed sheet"
        status: pass
      - kind: unit
        ref: "app/src/domain/composition.test.js#computeBalance — edge cases"
        status: pass
    human_judgment: false
  - id: D3
    description: "seedIfEmpty writes the churned version exactly once on an empty store and is a no-op afterwards, tested against a plain in-memory repository"
    requirement: "REC1-01"
    verification:
      - kind: unit
        ref: "app/src/store/seed.test.js#seedIfEmpty"
        status: pass
    human_judgment: false
  - id: D4
    description: "A stored version's figures are provably independent of the shared ingredient library — mutating library after building a version does not move its computed PAC"
    requirement: "REC1-01"
    verification:
      - kind: unit
        ref: "app/src/domain/composition.test.js#embedded-coefficient invariant"
        status: pass
    human_judgment: false

duration: 12min
completed: 2026-09-06
status: complete
---

# Phase 1 Plan 1: Walking Skeleton Summary

**End-to-end recipe read: React 19 + Vite 8 + react-router 8 app reading the churned olive oil version out of IndexedDB through a repository seam, its twelve rows and framework-free balance math (799.7 g, 18.0% fat, PAC 24.1) reproducing the printed sheet within 0.1.**

## Performance

- **Duration:** 12 min (across the plan's three tasks; this continuation covered Task 3)
- **Started:** 2026-09-05T21:46:35-04:00
- **Completed:** 2026-09-05T21:58:27-04:00
- **Tasks:** 3
- **Files modified:** 20 (19 created in Task 2, 2 of those expanded in Task 3)

## Accomplishments
- Stood up the `app/` workspace (Vite + React JSX, react-router 8, idb, vitest) with all four flagged packages confirmed legitimate before install (Task 1)
- Wired the walking skeleton end to end: repository seam → seed-on-empty-store → router → recipe list → recipe page → twelve-row ingredient table, all reading through the store seam and none of it thrown away (Task 2, tracer)
- Reimplemented the balance module framework-free and proved it against the printed sheet: all nine figures (mass, fat, milkfat, olive-oil share of fat, MSNF, sugar, solids, PAC, POD) within tolerance, running under Vitest with no DOM present (Task 3)
- Proved the embedded-coefficient invariant: a stored version's figures do not move when the shared ingredient library changes after the version was built — the exact drift that corrupted historical batches before (D-05, Task 3)
- Proved seed idempotency: `seedIfEmpty` writes exactly once on an empty store, is a no-op on a populated one, and never touches an unrelated existing record (Task 3)

## Task Commits

Each task was committed atomically:

1. **Task 1: Package legitimacy gate before any install** — checkpoint only, no commit (user typed "approved")
2. **Task 2: End-to-end — the churned recipe opens from the store and its formula reads** (TDD tracer)
   - `4b96b8d` (test) — failing tests for balance and seed behavior
   - `e78e130` (feat) — wired the walking skeleton end to end
3. **Task 3: The printed sheet fixture — the figures agree within 0.1** (TDD)
   - `e5446f8` (test) — printed-sheet fixture and seed idempotency tests (no feat commit — see TDD Gate Compliance)

**Plan metadata:** committed separately after this summary.

## Files Created/Modified
- `app/package.json`, `app/package-lock.json` — workspace manifest, exact-pinned versions (react-router 8.3.1, idb 8.0.3, vite 8.2.2, vitest 5.0.0)
- `app/vite.config.js`, `app/vitest.config.js`, `app/index.html`, `app/.gitignore` — build and test config; vitest defaults to `environment: 'node'`
- `app/src/domain/composition.js` — framework-free balance module: `computeBalance`, `weakestBasis`, `COEFFICIENT_SET`
- `app/src/domain/composition.test.js` — the printed-sheet fixture, edge cases, weakestBasis, and the embedded-coefficient invariant (expanded in Task 3)
- `app/src/data/library.js` — twelve transcribed ingredient records with per-field basis
- `app/src/data/olive-oil.js` — the churned version record, rows embedding cloned ingredient coefficients
- `app/src/store/db.js` — `openStore`, the only file importing `idb`
- `app/src/store/repository.js` — the repository seam: `listVersions`, `getVersion`, `saveVersion`, `getAll`, `putAll`
- `app/src/store/seed.js`, `app/src/store/seed.test.js` — seed-on-empty-store and its idempotency tests (expanded in Task 3)
- `app/src/main.jsx`, `app/src/router.jsx` — bootstrap and route table (`/`, `/recipe/:id`)
- `app/src/ui/RecipeList.jsx`, `app/src/ui/RecipePage.jsx`, `app/src/ui/IngredientTable.jsx` — list, recipe page with reserved regions, and the twelve-row table
- `app/src/styles/app.css` — structural layout only, no visual tokens invented

## Decisions Made
- Version-embedded ingredient row is the primary identity model (assumption-delta `promote`); a shared library is a future source, never a render-time authority.
- Transcription verbatim from old-sprinkles data (dextrose PAC 190, salt PAC 580), not the competing 103-row seed database.
- Vitest environment defaults to `'node'` so the domain suite provably runs with no DOM; any future component test opts into a DOM environment per-file.

## Deviations from Plan

None - plan executed exactly as written.

## TDD Gate Compliance

Task 3 is `tdd="true"`, but its RED phase passed immediately (18/18 tests green on first run, no implementation change needed). Investigated: this is not a violation of TDD discipline — the domain and store modules under test (`composition.js`, `seed.js`) were already built and TDD'd in Task 2, the tracer, which wired the full walking skeleton including this math. Task 3's suite is a fixture-level characterization of that already-correct implementation (the nine printed-sheet figures, the embedded-coefficient invariant, and seed idempotency across three scenarios), not new behavior requiring new code. All nine printed-sheet figures were hand-verified against the balance module's formulas before the test file was written, confirming the pass was not a false negative masking a wrong test. Task 3 therefore has a `test(01-01)` commit (`e5446f8`) with no paired `feat(01-01)` commit — there was no implementation gap to fill. Task 2's own RED (`4b96b8d`) → GREEN (`e78e130`) sequence is intact and unaffected.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- The repository seam, router, and version-embedded record shape are proven end to end; plan 01-02 (method, authored notes, Impeccable direction contract) and 01-03 (formulation note, six balance figures) attach to this same seam and router without structural change.
- `method` and `authored` are deliberately absent from the version record — plan 01-02 adds them without changing this shape.
- No visual tokens (type, palette, spacing scale) have been invented; the Impeccable direction contract is written at the start of 01-02.

---
*Phase: 01-read-the-churned-recipe*
*Completed: 2026-09-06*

## Self-Check: PASSED

- All 20 key files verified present on disk (`[ -f ]`).
- All 4 commits verified in git log: `4b96b8d`, `e78e130`, `e5446f8`, `7bd592f`.
- All 9 printed-sheet acceptance figures re-verified passing via `npm --prefix app test` (18/18 tests, 0 failures).
- Plan-level `<verification>` re-run: `npm --prefix app run build` exits 0 ("built in" line present); `npm --prefix app test` exits 0 with 18 passing tests; no browser network API under `app/src`; exactly `app/src/store/db.js` imports `idb`.
