---
phase: 09-the-library-and-the-stored-shapes-plus-the-two-places
plan: 11
subsystem: store-ui
tags: [catalog, boot-check, import-reload, context, print, indexeddb, vitest]
requires:
  - phase: 09-the-library-and-the-stored-shapes-plus-the-two-places
    provides: "09-09 DB_VERSION 10, the four list methods, SEED_TABLES, catalogConflicts; 09-10 the eight-store import; 09-08 declared scales as definitions; 09-04 CORE_SCALE_COUNT, scaleDefinition"
provides:
  - "store/catalog.js: readSeedTables(repository), catalogFrom(lists) (the one sorting boundary, order then id) and loadCatalog(repository)"
  - "ui/CatalogContext.jsx: CatalogContext, CatalogProvider({ initialCatalog }) with reloadCatalog, useCatalog() (throws outside a provider); ui/catalog.fixtures.jsx: CatalogFixture (tests only)"
  - "domain/catalog.js coreScaleDefinitions(scales) and problemNames(problems), both order-preserving; axesForVersion(version, catalog)"
  - "The printed Tasting log (TastingLogPage, PrintSheet) reads the core scales and core problems from the catalog"
  - "seedTables.js firstDamagedTable(lists) and bootDamagedLine(word); main.jsx refuses to mount App on a damaged row and shows one line naming the table"
  - "Shell awaits reloadCatalog() before storeRevision moves; IMPORT_RELOAD_LINE and the catalogStale recovery state withhold the routed page until a page reload"
affects: [09-12, 09-13, 09-14, 09-15, 09-17]
actuals:
  tokens: 15400
  tasks: 2
  commits: 3
plan_head_before: 79b5028fb9a99e4314a3d220a6821837793c3ee7
plan_head_after: c28bb0f9d1613f2347029ed6cf0279df07d69f2b
tech-stack:
  added: []
  patterns:
    - "the catalog is built once, by catalogFrom, and passed in: context at the route level, a prop below it, an argument to the pure functions"
    - "a boot check that reuses the store file's own validators and catalogConflicts, so boot and import hold one rule"
    - "a post-commit failure is contained by withholding the routed page, not by holding a counter"
key-files:
  created:
    - app/src/store/catalog.js
    - app/src/store/catalog.test.js
    - app/src/ui/CatalogContext.jsx
    - app/src/ui/catalog.fixtures.jsx
    - app/src/ui/Shell.catalog.test.jsx
  modified:
    - app/src/main.jsx
    - app/src/domain/catalog.js
    - app/src/domain/catalog.test.js
    - app/src/domain/axes.js
    - app/src/domain/axes.test.js
    - app/src/ui/PrintLogPages.jsx
    - app/src/ui/PrintLogPages.test.jsx
    - app/src/ui/PrintSheet.jsx
    - app/src/ui/PrintSheet.test.jsx
    - app/src/styles/print.test.js
    - app/src/store/seedTables.js
    - app/src/store/seedTables.test.js
    - app/src/ui/Shell.jsx
    - app/src/ui/Shell.test.jsx
    - app/src/ui/Shell.flyout.test.jsx
    - app/src/ui/Shell.importGuard.test.jsx
    - app/src/styles/binder.test.js
key-decisions:
  - "decide-p9-boot-check-scope = keep (Mark, 2026-10-19) built as stated: the library and the four tables are checked at boot with the store file's own validators, the four-core-scale rule stays, and a damaged row shows 'Sprinkles can’t open: its list of <table> has a damaged entry.'"
  - "A failed reload after a committed import withholds the routed page (catalogStale) and shows the placeholder pattern with the title 'Import' and IMPORT_RELOAD_LINE; storeRevision does not move; only a page reload leaves it"
  - "catalogFrom is the only place that sorts; the domain helpers keep the order they are given"
  - "firstDamagedTable adds catalogConflicts' table-level lines to the table they name (core-count to scales, problem-name to problems) after that table's row errors; declared-core-key is not reported at boot because boot reads no versions"
requirements-completed: [LIB-09, TASTE-03]
coverage:
  - id: D1
    description: "The blank Tasting log prints the core scales and core problems the tables hold, in table order, then the version's own declared ones, in the same words as before; the print route reads them from useCatalog"
    requirement: LIB-09
    verification:
      - kind: unit
        ref: "app/src/ui/PrintLogPages.test.jsx#prints the scales and problems of the catalog it is given"
        status: pass
      - kind: unit
        ref: "app/src/ui/PrintLogPages.test.jsx#the pages import no literal list of scales or problems"
        status: pass
      - kind: unit
        ref: "app/src/ui/PrintSheet.test.jsx"
        status: pass
    human_judgment: false
  - id: D2
    description: "Whatever order IndexedDB returns rows in (body before hardness), the catalog reads Hardness, Scoopability, Smoothness, Sweetness, Body, Oil; axesForVersion keeps the order it is handed"
    requirement: LIB-09
    verification:
      - kind: unit
        ref: "app/src/store/catalog.test.js#reads the scales in the battery order and the problems as the four words, although getAll returns key order"
        status: pass
      - kind: unit
        ref: "app/src/domain/axes.test.js#keeps the order it is handed and sorts nothing: a reversed scales list gives the core scales reversed"
        status: pass
    human_judgment: false
  - id: D3
    description: "A damaged row in the library or any of the four tables, a core count other than four, or a problem name on two rows stops the app opening with one line naming the table; odd display fields on a library entry still boot; a composition string or a missing defaultStage is refused"
    requirement: LIB-09
    verification:
      - kind: unit
        ref: "app/src/store/seedTables.test.js#firstDamagedTable, the boot check (D-17)"
        status: pass
      - kind: unit
        ref: "app/src/store/seedTables.test.js#bootDamagedLine"
        status: pass
    human_judgment: true
    rationale: "main.jsx's own branch (the line replacing App) has no test: main.jsx runs at import with top-level await and a real root. firstDamagedTable and bootDamagedLine, which decide it, are tested; the screen with a deliberately damaged store was not viewed"
  - id: D4
    description: "After a successful import the Shell awaits reloadCatalog before the routed page sees the new storeRevision; the real provider over fake-indexeddb shows the changed hardness words at the first render with the new revision"
    requirement: LIB-09
    verification:
      - kind: unit
        ref: "app/src/ui/Shell.catalog.test.jsx#awaits reloadCatalog before storeRevision moves"
        status: pass
      - kind: unit
        ref: "app/src/ui/Shell.catalog.test.jsx#shows the routed page the new words at the first render that sees the new storeRevision"
        status: pass
    human_judgment: false
  - id: D5
    description: "When reloadCatalog rejects after the import committed, the main area shows 'Import' and 'The file was imported. Reload the page to see it.' in place of the routed page, never the Import panel or 'Nothing was changed', and stays so after the rail's Notebook link and a router navigate to a version's address with no routed child mounting"
    requirement: LIB-09
    verification:
      - kind: unit
        ref: "app/src/ui/Shell.catalog.test.jsx#withholds every routed page, shows the recovery page and not the Import panel, and keeps doing so through navigation"
        status: pass
    human_judgment: true
    rationale: "The recovery page's title and line are Claude's wording and go to Mark on plan 09-17's look row"
status: complete
---

# Phase 9 Plan 11: The catalog read from the tables, the boot check and the import reload Summary

**The printed Tasting log now reads its core scales and problems from the stored tables through a catalog held once for the app, a damaged table stops the app opening with a plain line naming it, and an import reloads the catalog before any page re-renders.**

## Performance

- **Tasks:** 2 (Task 1 the tracer, Task 2 TDD)
- **Files:** 22 changed (5 created, 17 modified), 843 insertions, 77 deletions
- **Tests:** full suite 111 files, 3411 tests passing (baseline on this base: 109 files, 3387)

## Accomplishments

- **Catalog (Task 1):** `store/catalog.js` reads the five lists through the repository (`readSeedTables`), sorts the four catalog lists by `order` then `id` (`catalogFrom`, the one sorting boundary) and offers `loadCatalog`. `CatalogProvider` holds it in state with `reloadCatalog`; `useCatalog()` throws outside a provider. `main.jsx` mounts `<CatalogProvider initialCatalog={catalogFrom(lists)}>` around `App`. `CatalogFixture` is the test-only provider over `SEED_CATALOG`.
- **Pure helpers:** `coreScaleDefinitions` and `problemNames` keep the order given; `axesForVersion(version, catalog)` is the catalog's core definitions then the version's declared ones as stored. `axesForBatch` is untouched (plan 09-13).
- **Printed log:** `TastingLogPage({ version, catalog, footText })` reads `axesForVersion(version, catalog)` and `[...problemNames(catalog.problems), ...declaredFlaws]`; `PrintSheet` reads `useCatalog()`. `PrintLogPages.jsx` no longer imports the battery's defect words. The source-text case was rewritten against the catalog's words and expects `axesForVersion(version, catalog)` and `problemNames(catalog.problems)`; a new case renders a catalog with a renamed scale and problem.
- **Boot check (Task 2):** `firstDamagedTable` validates every row with `SEED_TABLES[table].validate` at `table[index]`, checking library, machines, styles, scales, problems in that order, and adds `catalogConflicts`' lines: `scales: expected exactly 4 core scales, found N` and `problems: "NAME" names more than one problem (A, B)`. The library is held to exactly the store file's validator (decide-p9-boot-check-scope = keep), the posture is commented where `BOOT_TABLES` is declared and above the function. `main.jsx` renders `bootDamagedLine(damaged.word)` instead of mounting `App` and logs `damaged.errors` with `console.error`.
- **Import reload:** `handleImportChange` awaits `reloadCatalog()` before `setImportErrors([])` and `setStoreRevision`. A rejection clears the Import panel, sets `catalogStale` and returns without moving the revision; while `catalogStale` is true `<main>` renders the placeholder page's markup (`div.list-page.place`, `h1.place__title` 'Import', `p.place__note` `IMPORT_RELOAD_LINE`) instead of the Outlet, so no routed page mounts on any route. Nothing clears it but a page reload.
- **Tests:** `Shell.catalog.test.jsx` (first import `fake-indexeddb/auto`, with its comment) covers the order, a refused import not reloading, the failed-reload page through a rail click and a router navigate, and the real provider over a real seeded repository with a raw IndexedDB write to the scales store.

## Task Commits

1. **Task 1 (tracer): the printed Tasting log reads its scales and problems from the tables** - `bb2f1699` (feat)
2. **Task 2 RED: failing tests for the boot check and the catalog reload on import** - `45d44140` (test)
3. **Task 2 GREEN: a damaged seed row stops the app opening, and an import reloads the catalog first** - `c28bb0f9` (feat)

The tracer gate: Task 1's automated verify (6 files, 150 tests, build into a scratch outDir) and the full suite passed before Task 2 expanded.

## TDD Gate Compliance

- **RED:** `45d44140`. `seedTables.test.js` failed 11 cases with `TypeError: bootDamagedLine is not a function` / `firstDamagedTable is not a function` (the exports did not exist yet); `Shell.catalog.test.jsx` failed 3 cases on the planned assertions (`expected "vi.fn()" to be called 1 times, but got 0 times`; `expected { revision: 1, low: 'soft' } to deeply equal { revision: 1, low: 'mushy' }`). Semantic assessment: the not-a-function failures are missing-export failures, not syntax or zero-test failures, and the Shell cases failed on the behaviour itself. `gsd_run check tdd-red-evidence` was not available; evidence read from the vitest report. `workflow.tdd_mode` is not enabled.
- **GREEN:** `c28bb0f9`; full suite 111 files, 3411 tests.
- **REFACTOR:** none.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] binder.test.js pinned main.jsx at three `app-boot` uses**
- **Found during:** Task 2
- **Issue:** `styles/binder.test.js` counts the `app-boot` class in `main.jsx` and expects exactly three (boot line, blocked line, store-open failure). The damaged-table line the plan requires is a fourth, so the pin necessarily broke. The file is not in the plan's `files_modified`.
- **Fix:** the case now expects four and names the damaged-table line in its title.
- **Files modified:** app/src/styles/binder.test.js
- **Commit:** c28bb0f9

**2. [Deviation - test adaptation] The "agrees with axesForBatch" case compares words, not whole objects**
- **Found during:** Task 1
- **Issue:** `axesForVersion` now returns scale definitions (with `kind`), while `axesForBatch` still returns the code constant's rows (no `kind`) until plan 09-13, so `toEqual` on the whole lists cannot hold.
- **Fix:** the case compares `key`, `name`, `low`, `high` and `group` of both lists, in order.
- **Files modified:** app/src/domain/axes.test.js
- **Commit:** bb2f1699

**Total deviations:** 2 (one pin the plan did not list, one test adapted to an interface that moves in plan 09-13). **Impact:** none on product behaviour.

## Authentication Gates

None.

## Known Stubs

None.

## Threat Flags

None. T-09-25 (boot with a damaged row), T-09-26 (stale catalog after import) and T-09-37 (failed reload after a committed import) are mitigated and each has a test above; T-09-SC accepted, no package installed.

## Issues Encountered

- This worktree has an `app/node_modules` symlink to the main checkout's (gitignored, not staged).
- The sandbox refuses compound git commands, so every git call ran as its own plain command from the worktree. The plan commit ledger (`gsd-plan-head-before-09-11`) and the cwd-drift sentinel were written under the git dir; `commits: 3` was measured against the spawn HEAD `79b5028f`.
- `gsd_run` is not available here, so `requirements.mark-complete` was not run; STATE.md and ROADMAP.md are untouched, as the orchestrator owns them. `09-dist-guard.sh check` prints DIST UNCHANGED and `scan` prints SCAN OK; `app/dist` was never written, and the builds went to a scratch outDir.
- main.jsx's damaged-table branch has no automated test of its own (the file runs at import with top-level await); the two functions it calls are tested. Plan 09-17 can walk it with a deliberately damaged store.

## Next Phase Readiness

Plan 09-12 can read `useCatalog()` at the route level in RecipePage and pass `catalog` down to BatchRow and the record pen; `CatalogFixture` is what its tests wrap. Plan 09-13 moves `axesForBatch` and the batch snapshot onto the catalog. Plan 09-15 retires the code constants (`AXES`, `DEFECTS`, `CORE_AXIS_COUNT`) and re-pins the cases that still compare to them (`PrintLogPages.test.jsx`, `seedTables.test.js`). Plan 09-17 should put the recovery page's title and `IMPORT_RELOAD_LINE` on Mark's look row and report the state of decide-p9-boot-check-scope.

## Self-Check: PASSED

- Created files exist: store/catalog.js, store/catalog.test.js, ui/CatalogContext.jsx, ui/catalog.fixtures.jsx, ui/Shell.catalog.test.jsx (found on disk).
- Commits exist on this branch: bb2f1699, 45d44140, c28bb0f9.
- Acceptance greps: `<CatalogProvider initialCatalog=` in main.jsx; `grep -c DEFECTS PrintLogPages.jsx` 0; no store or react import in domain/catalog.js or domain/axes.js; `axesForVersion(version, catalog)` expected in PrintLogPages.test.jsx and the one-argument expectation gone; `firstDamagedTable(lists)` in main.jsx; `await reloadCatalog()`, `IMPORT_RELOAD_LINE` and `catalogStale` in Shell.jsx; `catalogConflicts(` in seedTables.js; `fake-indexeddb/auto` on line 10 of Shell.catalog.test.jsx; `requiresHeat: null` in seedTables.test.js; `SEED_TABLES[table].validate` in seedTables.js.
- Shell.flyout.test.jsx: `git diff -U0` shows hunks at the import line and the mountAt helper only (the older-export case, plan 09-10's, untouched).
- Full suite: 111 files, 3411 tests passing. Build into a scratch outDir succeeds. `09-dist-guard.sh check`: DIST UNCHANGED.
