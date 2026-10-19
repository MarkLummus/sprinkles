---
phase: 09-the-library-and-the-stored-shapes-plus-the-two-places
plan: 10
subsystem: store
tags: [store-file, import, export, schema-9, sheet-code, catalog-conflicts, indexeddb, vitest]
requires:
  - phase: 09-the-library-and-the-stored-shapes-plus-the-two-places
    provides: "09-09 DB_VERSION 10, the four seed tables, SEED_TABLES, catalogConflicts, mergeById, CatalogConflictError; 09-06 sheetCodeProblems, SheetCodeError and the transactional version writes; 09-05 serveTempC and libraryId on every version; 09-02 stored Sheet codes and the stamped seed versions"
provides:
  - "STORE_SCHEMA_VERSION 9: the store file carries machines, styles, scales and problems beside recipes, versions, batches and library; exportAll and importAll cover eight stores in one transaction each"
  - "validateStoreFile requires the four arrays and validates each row with SEED_TABLES; a version's declared scales are checked against the core keys of the file's own scales table (fileCoreKeys, which never throws)"
  - "validateVersion requires a canonical sheetCode and an own serveTempC (null or a finite number)"
  - "importStore pre-checks the Sheet code rule and catalogConflicts over the merged scales, problems and versions; repository.importAll repeats both inside its transaction and importStore turns the thrown SheetCodeError or CatalogConflictError into the pre-check's path-named message"
  - "app/src/store/storeFile.fixtures.js: storeFileOf(parts) and stampedSeedVersions(), the test-only store-file builders"
affects: [09-11, 09-14, 09-15, 09-17, phase-10]
actuals:
  tokens: 24800
  tasks: 2
  commits: 3
plan_head_before: 170da9c2b50a55f6125ec49bf5818681515fc857
plan_head_after: cb9956de24e2df19cbb2919e9eb736ba68feb4c6
tech-stack:
  added: []
  patterns:
    - "one message function per rule (catalogConflictMessages, sheetCodeMessages) shared by the pre-check and the in-transaction error, so the two places cannot drift"
    - "a check that spans records is run twice: before the write for an early path-named refusal, and again over rows read inside the write transaction for the race"
    - "store-file tests build their file through storeFileOf; a race test wraps the real repository's importAll so a competing write lands after the pre-check"
key-files:
  created:
    - app/src/store/storeFile.fixtures.js
    - app/src/store/seed-tables-transfer.test.js
    - app/src/store/sheet-code-import.test.js
  modified:
    - app/src/store/transfer.js
    - app/src/store/repository.js
    - app/src/store/transfer.test.js
    - app/src/store/repository.test.js
    - app/src/store/library.test.js
    - app/src/store/library-link.test.js
    - app/src/store/seed-coverage.test.js
    - app/src/store/seed-roundtrip.test.js
    - app/src/store/creation-roundtrip.test.js
    - app/src/data/seed-recipes.test.js
    - app/src/ui/BatchRow.test.jsx
    - app/src/ui/Shell.flyout.test.jsx
key-decisions:
  - "Core-key source for declared-scale validation is the file's own scales table (rows with group 'core' and a non-empty string key), never a constant and never the receiving profile's table (D-03a)"
  - "Messages quote ids and codes with JSON.stringify, which equals the plan's literal quotes for ordinary strings and stays safe for odd ones"
  - "importAll checks the Sheet code rule before catalogConflicts, so a store that breaks both reports the code problem first"
  - "Both-in-the-file Sheet code clashes are worded at the later file path and name the earlier path in parentheses, so one line names both"
requirements-completed: [LIB-09, CODE-01]
coverage:
  - id: D1
    description: "An export from a seeded profile imported into a fresh, never-seeded profile restores machines, styles, scales, problems and the library; importing the same file twice leaves the same eight stores; a schema-8 file and a file missing styles are refused with no store changed"
    requirement: LIB-09
    verification:
      - kind: unit
        ref: "app/src/store/seed-tables-transfer.test.js#the four tables round-trip through the store file (LIB-09, decision 20, criterion 8)"
        status: pass
    human_judgment: false
  - id: D2
    description: "The file wins on a shared id, a new id is added, a local row the file lacks stays, and import never deletes, in every table"
    requirement: LIB-09
    verification:
      - kind: unit
        ref: "app/src/store/seed-tables-transfer.test.js#the file wins on a shared id, a new id is added, and a local row the file lacks stays"
        status: pass
      - kind: unit
        ref: "app/src/store/repository.test.js#importAll, through the repository seam"
        status: pass
    human_judgment: false
  - id: D3
    description: "The validator refuses a bad row in each of the four tables, a declared scale under a core key of the file's own scales table, and a malformed or missing scales value without throwing; a version without an own serveTempC, or with '-14', is refused, and -12.5 and a seeded -15 survive the round trip"
    requirement: LIB-09
    verification:
      - kind: unit
        ref: "app/src/store/transfer.test.js#the four seed tables in the file (LIB-09, decision 20)"
        status: pass
      - kind: unit
        ref: "app/src/store/seed-tables-transfer.test.js#a version's serving temperature survives the round trip (D-19)"
        status: pass
    human_judgment: false
  - id: D4
    description: "Import refuses a file whose resulting store a valid batch could not be recorded against: a fifth core scale, a promoted key a retained version declares, a second problem under an existing name; the same-id rename, the Body-only olive oil copy and the Creaminess promotion import"
    requirement: LIB-09
    verification:
      - kind: unit
        ref: "app/src/store/seed-tables-transfer.test.js#the import refuses a store a valid batch cannot be recorded against"
        status: pass
    human_judgment: false
  - id: D5
    description: "Two imports, or an import and another tab's createVersion, that each pass the pre-check cannot together commit a conflicting store: the transaction aborts with CatalogConflictError, importStore returns the pre-check's message (not IMPORT_STORAGE_ERROR), and the stores hold exactly what the other writer left"
    requirement: LIB-09
    verification:
      - kind: unit
        ref: "app/src/store/seed-tables-transfer.test.js#two imports that each pass the pre-check cannot together commit a conflicting store (T-09-36, T-09-46)"
        status: pass
    human_judgment: false
  - id: D6
    description: "Import requires a canonical sheetCode on every version, keeps it as written, and refuses a code shared in the file, a code a stored version of another id holds, and a changed code, before the write and again inside importAll's transaction (race at both levels); every refusal leaves all eight stores as they were"
    requirement: CODE-01
    verification:
      - kind: unit
        ref: "app/src/store/sheet-code-import.test.js"
        status: pass
    human_judgment: false
status: complete
---

# Phase 9 Plan 10: The four tables in the store file, and import keeps the Sheet code rule Summary

**Store file schema 9 carries the machines, styles, scales and problems tables with the library, and import refuses any clash, changed code or unusable catalog, before the write and again inside the write transaction.**

## Performance

- **Tasks:** 2 (Task 1 the tracer, Task 2 TDD)
- **Files:** 15 changed (3 created, 12 modified), 1135 insertions, 166 deletions
- **Tests:** full suite 109 files, 3387 tests passing (baseline on this base: 107 files, 3341)

## Accomplishments

- **Schema 9 (Task 1):** `STORE_SCHEMA_VERSION` is 9 with its history comment extended. `exportStore` writes the four tables; `validateStoreFile` requires each as an array and validates every row with `SEED_TABLES[table].validate` at `$.table[index]`. A schema-8 file is still refused with `OLDER_EXPORT_MESSAGE` first.
- **File's own core keys (D-03a):** `fileCoreKeys(scales)` returns the keys of the file's rows with group `core`, and `[]` for a scales value that is missing, not an array, or holds a null, a non-object or a row without a string key. The scales array's own errors are reported once, at `$.scales` or `$.scales[i]`; validating a version never throws on it. The keys are threaded through `validateStoreFile` to `validateVersion` and `validateBatch`; the old `CORE_AXIS_KEYS` constant and the `AXES` import are gone from `transfer.js`.
- **serveTempC required (D-19):** an own key, null or a finite number, kept as written. The comment states why no missing-key allowance exists and the lift-later posture.
- **Resulting-store pre-check:** `importStore` reads `listScales` and `listProblems`, builds the merged scales, problems and versions with `mergeById`, runs `catalogConflicts`, and words any conflict through the private `catalogConflictMessages`. The comment says the four-core-scale rule is a deliberate design choice, not a CONTEXT decision.
- **Eight stores:** `repository.importAll` and `exportAll` run over `FILE_STORES` (recipes, versions, batches, library, machines, styles, scales, problems), one transaction each; drafts stay out of both.
- **Sheet code (Task 2):** `validateVersion` requires `sheetCode === normaliseCode(sheetCode)`. `importStore` runs `sheetCodeProblems` before the write and words each problem through `sheetCodeMessages` (file paths of each side named). `importAll` reads versions, scales and problems inside its transaction, runs `sheetCodeProblems` then `catalogConflicts` before any put, and aborts with `SheetCodeError` or `CatalogConflictError`; `importStore` recognises both with `instanceof` and returns the pre-check's message, so `transfer.js` imports nothing from `repository.js` and compares no error name.
- **Fixtures:** `storeFile.fixtures.js` (`storeFileOf`, `stampedSeedVersions`) and the sweep below.

## Fixture sweep

Found with `grep -rln "validateStoreFile\|importStore\|exportStore\|importAll\|exportAll" app/src app/tests`, re-run at execution. The files beyond the plan's list were `ui/IngredientsPlace.test.jsx` (it only names `importAll` in a list of write methods it expects not to be called; no file builder, no change), `ui/Shell.jsx` and `store/seedTables.js` (production), and `ui/Shell.importGuard.test.jsx` (mocks `importStore`; no change). No further store-file builder was found.

Changed: `transfer.test.js` (memory repository with eight stores and `listScales`/`listProblems`, `makeVersion` with its own id's code and `serveTempC` null, `makeStoreFile` through `storeFileOf`, schema and key-list literals 8 to 9, the near-284 case on the stamped olive oil version), `repository.test.js`, `library.test.js`, `library-link.test.js`, `seed-recipes.test.js`, `seed-coverage.test.js`, `creation-roundtrip.test.js`, `seed-roundtrip.test.js` (the `rt-N` versions take `codeFromVersionId` of their own id), `BatchRow.test.jsx` (eight-store memory repository, stamped version), and `Shell.flyout.test.jsx` (only the older-export case: title, `toHaveLength(8)`, `'8 problems found'`; `git diff -U0` shows hunks at lines 354 and 358 only).

## Task Commits

1. **Task 1 (tracer): the four tables travel in the store file** - `89c075fd` (feat)
2. **Task 2 RED: failing tests for the Sheet code and catalog checks** - `e2ff89af` (test)
3. **Task 2 GREEN: import keeps every Sheet code as written** - `cb9956de` (feat)

The tracer gate re-ran Task 1's automated verify (15 files, 768 tests, green) and the full suite before Task 2 expanded.

## TDD Gate Compliance

- **RED:** `e2ff89af`. 15 of 32 tests failed in `sheet-code-import.test.js` and `seed-tables-transfer.test.js`, each on an assertion for the planned behaviour (`expected true to be false` for the validator and pre-check refusals, `expected undefined to be an instance of SheetCodeError` / `CatalogConflictError` for the transaction level, `expected { ok: true, errors: [] } to deeply equal { ok: false, ... }` for the two importStore-level races). The 17 that passed are the cases that import successfully and the Task 1 cases. No failure was an import, syntax or zero-test failure. Semantic assessment: the target tests executed and failed on the planned assertions for the intended reason. The format-based classifier (`gsd_run check tdd-red-evidence`) was not available (no `gsd_run`), so the evidence was read from the vitest report by hand; `workflow.tdd_mode` is not enabled.
- **GREEN:** `cb9956de`; full suite 109 files, 3387 tests.
- **REFACTOR:** none.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] library-link.test.js's hand-built version is a copy under its own id**
- **Found during:** Task 1
- **Issue:** the plan seeds the source profile and then saves the hand-built version. The hand-built version spreads `oliveOilVersion` under the seeded olive oil v1's id, whose stored code is `64JH-G408`; a code derived from that id would be refused as a changed code, and the unstamped version carries no code.
- **Fix:** the version is a structuredClone under the id `link-olive-oil-copy` with `sheetCode: codeFromVersionId(id)` and `serveTempC: null`; the source profile is seeded (`seedIfEmpty`) instead of putting the 26 library records and the recipe by hand. The link, save-export-import and moved-entry assertions are unchanged.
- **Files modified:** app/src/store/library-link.test.js
- **Commit:** 89c075fd

**2. [Deviation - acceptance criterion] `grep -c "sheetCodeProblems(" app/src/store/repository.js` returns 2, not 3 or more**
- **Found during:** Task 2
- **Issue:** the criterion counted createVersion, saveVersion and importAll. Plan 09-06 put the first two behind one helper (`putVersionChecked`, one call), so the file holds that call and importAll's.
- **Verification:** all three write paths are proven by tests (09-06's createVersion and saveVersion cases; this plan's transaction-level and importStore-level races).

**Total deviations:** 2 (one test-fixture bug avoided, one grep count that proxied for "all three write paths check"). **Impact:** none on product behaviour.

## Authentication Gates

None.

## Known Stubs

None.

## Threat Flags

None. T-09-21, T-09-22, T-09-23, T-09-36, T-09-43 and T-09-46 are mitigated and each has a test above; T-09-24 and T-09-SC are accepted as the plan states.

## Issues Encountered

- This worktree has an `app/node_modules` symlink to the main checkout's (gitignored, not staged).
- The per-plan commit ledger and the cwd-drift sentinel were not written: the sandbox refuses compound git commands and both live under the git dir. The base is the spawn HEAD `170da9c2`, recorded in the frontmatter, and `commits: 3` was measured with `git rev-list --count 170da9c2..HEAD` before this SUMMARY's own docs commit. Every commit ran from the worktree.
- `gsd_run` is not available here, so `requirements.mark-complete` was not run; STATE.md, ROADMAP.md and REQUIREMENTS.md are untouched, as the orchestrator owns them. `09-dist-guard.sh check` prints DIST UNCHANGED and `scan` prints SCAN OK; `app/dist` was never written.

## Next Phase Readiness

Plan 09-11 (boot check) can use the same `catalogConflicts`; its edit to `Shell.flyout.test.jsx` is the `mountAt` helper, a different hunk from this plan's older-export case. Plan 09-14 adds the batch snapshot checks to `validateBatch` (which now takes the file's core keys) and records and exports a batch after an accepted promotion import. Plan 09-15's seed-data scan should allow-list `storeFile.fixtures.js`. Once Mark's device holds a schema-9 file, a version field added later is optional on import or arrives with a schema bump.

## Self-Check: PASSED

- Created files exist: storeFile.fixtures.js, seed-tables-transfer.test.js, sheet-code-import.test.js (found on disk).
- Commits exist on this branch: 89c075fd, e2ff89af, cb9956de.
- Acceptance greps: `STORE_SCHEMA_VERSION = 9`; two `'machines', 'styles', 'scales', 'problems'` lines in repository.js; `storeFileOf` in transfer, library, seed-recipes and seed-coverage tests; `catalogConflicts(` in transfer.js and repository.js; `instanceof CatalogConflictError` in transfer.js; no `error.name ===` and no `from './repository.js'` in transfer.js; `8 problems found` in Shell.flyout.test.jsx.
- Full suite: 109 files, 3387 tests passing.
