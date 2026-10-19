---
phase: 09-the-library-and-the-stored-shapes-plus-the-two-places
plan: 12
subsystem: ui
tags: [catalog, record-pen, batch-row, recipe-page, context, vitest]
requires:
  - phase: 09-the-library-and-the-stored-shapes-plus-the-two-places
    provides: "09-11 CatalogContext/useCatalog/CatalogFixture, axesForVersion(version, catalog), problemNames; 09-09 SEED_CATALOG"
provides:
  - "BatchRow takes a catalog prop; a new record pen's axes are axesForVersion(version, catalog) and its Every recipe chips are problemNames(catalog.problems)"
  - "RecipePage reads const { catalog } = useCatalog() once, above its early returns, and passes it to BatchRow"
  - "Every jsdom test that mounts RecipePage renders it inside CatalogFixture"
affects: [09-13, 09-15, 09-17]
actuals:
  tokens: 9500
  tasks: 2
  commits: 2
plan_head_before: c4480f5caa67d0c3caf6dcab36e101129e5205d6
plan_head_after: 40ee8b0de730660eca2a27387e581bcefd74432d
tech-stack:
  added: []
  patterns:
    - "the catalog is read at the route level and passed down as a prop; BatchRow stays presentational and imports no context"
    - "provider coverage is an executed check: useCatalog throws without a provider, so a passing mount is a mount with the catalog"
key-files:
  created: []
  modified:
    - app/src/ui/BatchRow.jsx
    - app/src/ui/RecipePage.jsx
    - app/src/ui/BatchRow.test.jsx
    - app/src/ui/BatchRow.dates.test.jsx
    - app/src/ui/BatchRow.signed.test.jsx
    - app/src/ui/RecipePage.recordTasting.test.jsx
    - app/src/ui/RecipePage.a11y.test.jsx
    - app/src/ui/RecipePage.beforeYouStart.test.jsx
    - app/src/ui/RecipePage.drafts.test.jsx
    - app/src/ui/RecipePage.folds.test.jsx
    - app/src/ui/RecipePage.perStep.test.jsx
    - app/src/ui/RecipePage.shellEffects.test.jsx
    - app/src/ui/RecipePage.strictMode.test.jsx
    - app/src/ui/RecipePage.undoRetire.test.jsx
key-decisions:
  - "A Correct (openPen 'amend' with openBatch) keeps axesForBatch(openBatch) and the battery's DEFECTS chips; plan 09-13 moves both onto the batch's own snapshot"
requirements-completed: [LIB-09]
coverage:
  - id: D1
    description: "A new batch's record pen on the recipe page shows the core scales and the core problem chips the catalog holds, then the version's own declared scales and problems, in the same words and order as before"
    requirement: LIB-09
    verification:
      - kind: unit
        ref: "app/src/ui/RecipePage.recordTasting.test.jsx#Record another opens a pen whose Every recipe chips include a fifth problem the catalog holds"
        status: pass
      - kind: unit
        ref: "app/src/ui/BatchRow.test.jsx#draws a problem row the catalog holds beyond the four, as a chip in Every recipe"
        status: pass
      - kind: unit
        ref: "app/src/ui/BatchRow.test.jsx#the stacked list shows all four renamed core scales and both declared scales, in the catalog's order"
        status: pass
      - kind: unit
        ref: "app/src/ui/BatchRow.test.jsx#the desktop grid shows all four renamed core scales and both declared scales, in the catalog's order"
        status: pass
    human_judgment: false
  - id: D2
    description: "Provider coverage is executed: RecipePage mounted with no CatalogProvider fails with the error that names CatalogProvider, and the full suite passing shows every mount supplies the catalog"
    requirement: LIB-09
    verification:
      - kind: unit
        ref: "app/src/ui/RecipePage.recordTasting.test.jsx#mounted with no CatalogProvider above it, the page fails with the error that names CatalogProvider"
        status: pass
    human_judgment: false
status: complete
---

# Phase 9 Plan 12: The new record pen reads the catalog Summary

**A new batch's record pen now draws its core scales and Every recipe problem chips from the catalog the recipe page reads (useCatalog at the route, a catalog prop on BatchRow), while a Correct still reads the batch's own snapshot until plan 09-13.**

## Performance

- **Tasks:** 2 (Task 1 the tracer, Task 2 auto)
- **Files:** 14 changed, 0 created
- **Tests:** full suite 111 files, 3418 tests passing (baseline on this base: 111 files, 3411; 7 new cases)

## Accomplishments

- **BatchRow:** takes `catalog`; a new pen's axes are `axesForVersion(version, catalog)` and its Every recipe chips `problemNames(catalog.problems)`; a Correct keeps `axesForBatch(openBatch)` and `DEFECTS`. The comment explaining a fresh record's source was rewritten (it no longer borrows `axesForBatch` over a stand-in snapshot). BatchRow imports no context module.
- **RecipePage:** `import { useCatalog } from './CatalogContext.jsx'` and one `const { catalog } = useCatalog()` beside the other hooks, above the first early return; `catalog={catalog}` passed to BatchRow. `RecipePage.shell.test.js` passes unchanged (import plus one call).
- **Tests:** BatchRow.test.jsx, BatchRow.dates.test.jsx and BatchRow.signed.test.jsx pass `catalog={SEED_CATALOG}`; BatchRow.test.jsx builds its fresh-pen axes with `axesForVersion(version, SEED_CATALOG)` (no `snapshot: { declaredAxes` stand-in left). New cases: a fifth problem row draws a chip; a catalog of four renamed core scales is drawn in the pen, and (through AxesGrid) in both the stacked list and the desktop grid with both declared scales, in the catalog's order, none of the seed core names; the renamed and fifth-problem catalogs are `structuredClone`s and the last case asserts `SEED_CATALOG` still equals a clone taken at the top of the file. RecipePage.recordTasting.test.jsx mounts inside `CatalogFixture` (a `catalog` option on `mountAt`), proves the page reads the catalog (Record another, Add tasting, the fifth word is a chip), and proves the no-provider mount fails with the error naming CatalogProvider (caught by an error boundary).
- **Provider coverage:** eight further RecipePage jsdom test files render inside `CatalogFixture`.

## Task Commits

1. **Task 1 (tracer): a new record pen reads its scales and problem chips from the catalog** - `5718259b` (feat)
2. **Task 2: every test that mounts the recipe page supplies the catalog** - `40ee8b0d` (test)

The tracer gate: Task 1's verify (BatchRow files, RecipePage.recordTasting.test.jsx, RecipePage.shell.test.js: 5 files, 352 tests) passed before Task 2 expanded.

## Deviations from Plan

### Auto-fixed Issues

**1. [Plan inaccuracy] RecipePage.test.jsx needs no CatalogFixture**
- **Found during:** Task 2
- **Issue:** the plan lists RecipePage.test.jsx among the files that mount RecipePage and speaks of "its static renders, renderVersionsReading included". The file's own header says it "renders nothing of RecipePage itself": renderVersionsReading renders VersionRow, and the other cases read RecipePage.jsx/router.jsx as text. Nothing there reads the catalog.
- **Fix:** left unedited; wrapping a VersionRow render in a provider nothing reads would be noise. The full suite passing is the executed provider check (a mount without one throws).
- **Consequence:** the supplementary `grep -L "CatalogFixture" app/src/ui/RecipePage.test.jsx app/src/ui/RecipePage.*.test.jsx` lists RecipePage.test.jsx; the plan marks that grep as supplementary only.
- **Files modified:** none

**2. [Deviation - test adaptation] The cardinality cases use AxesGrid for the two arrangements**
- **Issue:** BatchRow chooses stacked or desktop through matchMedia hooks, which a static render under node cannot switch. The plan asks for both arrangements; the existing arrangement cases in BatchRow.test.jsx already render AxesGrid with an explicit `below`.
- **Fix:** both arrangements render `AxesGrid` over `axesForVersion(oliveOilVersion, renamedCatalog)` (the pen's own source) with `below` true and false; a separate case renders the whole BatchRow pen with the renamed catalog.

**Total deviations:** 2 (one plan inaccuracy, one test adaptation). **Impact:** none on product behaviour.

## Authentication Gates

None.

## Known Stubs

None.

## Threat Flags

None. T-09-33 (the pen draws only the catalog plan 09-11 validated at boot; chip words render as text inside Button) holds: no new surface; T-09-SC accepted, no package installed.

## Issues Encountered

- The worktree has an `app/node_modules` symlink to the main checkout's (gitignored, not staged).
- The sandbox refuses compound git commands, so every git call ran on its own. The plan commit ledger (`gsd-plan-head-before-09-12`) was written under the git dir; `commits: 2` was measured against the spawn HEAD `c4480f5c`.
- `09-dist-guard.sh check` prints DIST UNCHANGED; `app/dist` was never written. No build was needed (UI source and tests only).

## Next Phase Readiness

Plan 09-13 passes the page's catalog into `useBatchRecording` and `createBatch`, moves the Correct onto the batch's own snapshot (then `DEFECTS` and `axesForBatch`'s code constant leave BatchRow), and must keep BatchRow.test.jsx free of hand-built stand-in snapshots (`grep -v '^\s*//' app/src/ui/BatchRow.test.jsx | grep -c "snapshot: { declaredAxes"` returns 0 today).

## Self-Check: PASSED

- Acceptance greps: `axesForVersion(version, catalog)` and `problemNames(catalog.problems)` in BatchRow.jsx; `useCatalog()` in RecipePage.jsx; 0 CatalogContext imports in BatchRow.jsx; 0 hand-built stand-ins in BatchRow.test.jsx.
- Commits exist on this branch: 5718259b, 40ee8b0d.
- Full suite: 111 files, 3418 tests passing. `09-dist-guard.sh check`: DIST UNCHANGED.
