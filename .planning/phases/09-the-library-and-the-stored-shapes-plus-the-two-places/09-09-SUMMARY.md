---
phase: 09-the-library-and-the-stored-shapes-plus-the-two-places
plan: 09
subsystem: store
tags: [indexeddb, db-version, reset, seed-tables, validators, ratchet, dist-guard, vitest]
requires:
  - phase: 09-the-library-and-the-stored-shapes-plus-the-two-places
    provides: "09-01 STAGE_IDS; 09-02 stored Sheet codes and transactional createVersion/saveVersion; 09-04 catalog.js (CORE_SCALE_COUNT, scaleDefinition, isScaleDefinition); 09-05 serveTempC, libraryId and maxFillG on the seeded versions; 09-06 code-checking saveVersion; 09-07 the 111-entry seeded library with the six D-20 keys; 09-08 declared scales as definitions"
provides:
  - "DB_VERSION 10 and an exported upgradeStores(db, oldVersion, newVersion, transaction): the one destructive block, bounded to oldVersion < 10, drops versions, batches, recipes, drafts and library; the machines, styles, scales and problems stores are created"
  - "repository.seedTableIfEmpty(storeName, records) for library, machines, styles, scales and problems (TypeError for any other store), and listMachines, listStyles, listScales, listProblems"
  - "seedIfEmpty seeds the library, then machines, styles, scales and problems, then the recipes"
  - "app/src/store/seedTables.js: validateLibraryRecord (moved from transfer.js, plus the six D-20 checks), validateMachineRow, validateStyleRow, validateScaleRow, validateProblemRow, SEED_TABLES, catalogConflicts, mergeById, CatalogConflictError"
  - "data modules MACHINE_ROWS, STYLE_ROWS, CORE_SCALE_ROWS, CORE_PROBLEM_ROWS and SEED_CATALOG"
  - "09-dist-guard.sh (scan, fingerprint, check) and 09-dist-fingerprint.txt: the premise that no phase build writes app/dist is now a check"
  - "two ratchets (behavioural, from a literal version-10 profile; static, comment-stripped scan anchored on the reset block) that stop a later upgrade deleting a store"
affects: [09-10, 09-11, 09-12, 09-13, 09-14, 09-15, 09-16, 09-17, phase-10, phase-11]
actuals:
  tokens: 22000
  tasks: 3
  commits: 3
plan_head_before: 2914d6c670bc2ace79e91be0bc1e741f3cbf9980
plan_head_after: 79299cd82082a62c45bd5cb6fbb4e032900eb0c7
tech-stack:
  added: []
  patterns:
    - "an exported upgrade function over (db, oldVersion, newVersion, transaction), so a test can run it over a hand-built profile or abort its transaction"
    - "one readwrite transaction per seed table: count then puts, aborted by hand on failure"
    - "collect-every-error, path-named, never-throw validators shared by import and boot"
key-files:
  created:
    - app/src/store/seedTables.js
    - app/src/store/seedTables.test.js
    - app/src/data/machines.js
    - app/src/data/styles.js
    - app/src/data/core-scales.js
    - app/src/data/core-problems.js
    - app/src/data/seed-catalog.js
    - app/tests/db-upgrade-10.test.js
    - .planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-dist-guard.sh
    - .planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-dist-fingerprint.txt
  modified:
    - app/src/store/db.js
    - app/src/store/repository.js
    - app/src/store/seed.js
    - app/src/store/transfer.js
    - app/src/store/db.test.js
    - app/src/store/library.test.js
    - app/src/store/seed.test.js
    - app/src/store/transfer.test.js
    - app/tests/db-reset.test.js
key-decisions:
  - "Task 1 (the one-way reset) was a decision, not work: reset decision confirmed by Mark (proceed), restating decisions 2 and 5. Mark answered in chat on 2026-10-19 with 'Proceed' (option id proceed). It was not auto-selected on this run."
  - "The reset folds the earlier below-8 reset into one block: every profile below 10 gets the same five drops"
  - "seedTable is a closure inside createRepository, not a method reached through this, so a destructured seedLibraryIfEmpty keeps working"
  - "validateScaleRow checks each field by path first and only then asks isScaleDefinition(scaleDefinition(row)), so one bad field gives one error, not two"
  - "The store reads rows back in key order (alphabetical by id), so tests compare seed tables by id; nothing in this plan orders them for display"
requirements-completed: [LIB-06, LIB-09]
coverage:
  - id: D1
    description: "A stored version-9 profile opens at DB_VERSION 10 with every old store cleared and reseeded: the 111-entry library without the imported record, the seeded recipes in the new shapes (olive oil v1 stores 64JH-G408 with libraryId rows, definitions and serveTempC null; mexican-chocolate-v1 serveTempC -15; every version's serveTempC its own iceEd figure), drafts empty, all four seed tables seeded"
    requirement: LIB-06
    verification:
      - kind: unit
        ref: "app/tests/db-upgrade-10.test.js#opens at 10 with the larger library, the Whynter machine and the seeded recipes in the new shapes"
        status: pass
      - kind: unit
        ref: "app/src/store/library.test.js#a profile left at version 8 is reset and reseeded at DB_VERSION (decisions 2 and 5)"
        status: pass
    human_judgment: false
  - id: D2
    description: "An upgrade interrupted after the drops leaves the profile at 9 with its stores and records; the next open resets it at 10. Opening a version-10 profile again runs no destructive step"
    requirement: LIB-06
    verification:
      - kind: unit
        ref: "app/tests/db-upgrade-10.test.js#an upgrade interrupted after the drops leaves the profile at 9 with its stores and records, and the next open resets it at 10"
        status: pass
      - kind: unit
        ref: "app/tests/db-upgrade-10.test.js#opening a version-10 profile again runs no destructive step, and seeding twice writes nothing the second time"
        status: pass
    human_judgment: false
  - id: D3
    description: "No later upgrade can delete a store: a literal version-10 profile with a record in every store survives an open at DB_VERSION + 1, and no deleteObjectStore( or .clear( lies outside the anchored reset block of db.js"
    requirement: LIB-06
    verification:
      - kind: unit
        ref: "app/src/store/db.test.js#the reset never reaches a profile at version 10 or above (behavioural ratchet)"
        status: pass
      - kind: unit
        ref: "app/src/store/db.test.js#no delete or clear lies outside the reset block (static ratchet)"
        status: pass
    human_judgment: false
  - id: D4
    description: "The machines, styles, scales and problems tables hold Mark's approved rows, are seeded once per table even when two repositories boot at once, are refilled when emptied, and are left alone when they hold a row"
    requirement: LIB-09
    verification:
      - kind: unit
        ref: "app/src/store/seed.test.js#the seed tables, against a real IndexedDB"
        status: pass
      - kind: unit
        ref: "app/src/store/seedTables.test.js#the styles seed holds Mark’s approved numbers"
        status: pass
    human_judgment: false
  - id: D5
    description: "Every seed row passes its pure validator; the library validator requires the six D-20 keys as own keys with typed values; catalogConflicts reports core-count, declared-core-key and problem-name conflicts and passes the seed's own lists"
    requirement: LIB-09
    verification:
      - kind: unit
        ref: "app/src/store/seedTables.test.js"
        status: pass
      - kind: unit
        ref: "app/src/store/transfer.test.js#validateLibraryRecord / $.library (D-08)"
        status: pass
    human_judgment: false
  - id: D6
    description: "The reset's safety premise is mechanical: no phase build command lacks --outDir or names app/dist, and app/dist is unchanged since the fingerprint taken before DB_VERSION moved"
    requirement: LIB-06
    verification:
      - kind: command
        ref: "sh .planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-dist-guard.sh scan"
        status: pass
      - kind: command
        ref: "sh .planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-dist-guard.sh check"
        status: pass
    human_judgment: false
status: complete
---

# Phase 9 Plan 09: The 9-to-10 reset, the four seed tables and the shared validators Summary

**DB_VERSION 10 resets every profile below it into the new shapes, reseeds the larger library and four new seed tables (machines, styles, scales, problems), and two ratchets plus a dist guard hold the one-way step in place.**

## Performance

- **Tasks:** 3 (Task 1 a recorded decision; Task 2 the tracer; Task 3 TDD)
- **Files:** 19 changed (10 created, 9 modified), 1598 insertions, 204 deletions
- **Tests:** full suite 107 files, 3341 tests passing (baseline on this base: 105 files, 3293)

## Accomplishments

- **Reset decision (Task 1):** reset decision confirmed by Mark (proceed), restating decisions 2 and 5. Mark answered in chat on 2026-10-19 ("Proceed", option id `proceed`). No files were written for it. The other 2026-10-19 decisions (library mapping approved; coconut milk a different product, `coconutMilk208`; `decide-p9-boot-check-scope` keep; `decide-p9-version-style` style-copy, Phase 11) are recorded for the plans that use them and touch nothing here.
- **The bump (Task 2):** `upgradeStores` is exported and holds one destructive block, `if (oldVersion > 0 && oldVersion < 10) {`, that drops versions, batches, recipes, drafts and library; the guarded creates follow, plus machines, styles, scales and problems (`{ keyPath: 'id' }`, no index). No async keyword. `blocked()` and `blocking()` are unchanged. `VERSION_SCHEMA_VERSION` and `BATCH_SCHEMA_VERSION` stay as they are; the comment beside `DB_VERSION` says so.
- **Seam:** `seedTableIfEmpty` is the old `seedLibraryIfEmpty` transaction generalised (TypeError outside the five tables); `seedLibraryIfEmpty` calls it. The four list methods are one `getAll` each.
- **Proofs:** `tests/db-upgrade-10.test.js` stores a real version-9 profile (a recipe, a version, a batch, a draft, the 26 library records and an imported record) and opens it at 10; the interrupted-upgrade case aborts the versionchange transaction after `upgradeStores` has dropped the stores, finds the profile at 9 with every store and record, then opens it normally and finds it reset. `library.test.js`'s version-8 case now asserts the reset. `db.test.js` and `db-reset.test.js` read `DB_VERSION` everywhere (no literal 8, 9 or 10 in a `toBe`), and the newer-version case opens `DB_VERSION + 1`.
- **Ratchets:** the behavioural one builds a literal `RESET_BOUND = 10` profile over the written-out version-10 store list with a record in every store and opens it at `DB_VERSION + 1`; the static one strips comments, finds the anchor line and its closing brace and fails on any `deleteObjectStore(` or `.clear(` outside it, with cases proving the scan itself trips on a delete outside, a clear outside, a missing anchor, and does not trip on a comment.
- **Dist guard:** `09-dist-guard.sh` has `scan`, `fingerprint` and `check`. `scan` passes over all 10 build commands in the phase's automated lines and scripts, and was checked by hand to fail on a temporary script with a build line and no `--outDir`, and on one naming `--outDir app/dist` (the file was deleted before commit). The fingerprint of the main checkout's `app/dist` (`12fd378d...`, taken before `DB_VERSION` moved) is in `09-dist-fingerprint.txt`; `check` reports `DIST UNCHANGED`. Nothing in this run built; `app/dist` was never written.
- **Seed tables and validators (Task 3):** `validateLibraryRecord` moved to `store/seedTables.js` with its checks unchanged and gained the six D-20 checks (own key, null or a typed value, `defaultStage` against `STAGE_IDS`, `titratableAcidity` at least 0). The machine, style, scale and problem validators refuse an unsafe id and name each bad field by path; a style's `serveTempC` must be `{ default, min, max }` with the default inside its range. `catalogConflicts`, `mergeById` and `CatalogConflictError` are the one collection check import (plan 09-10) and boot (plan 09-11) share; the seed's own lists and every seeded version return `[]`. `transfer.js` imports from `seedTables.js` and re-exports `UNSAFE_KEYS`.
- **Seeded rows:** Whynter (`minFillG` 700, `maxFillG` null); the four styles with Mark's approved bands (no pac or sugar key, Gelato's serve temperature -12.5 unrounded); the six scales (four core, Body and Oil declared, all goldilocks); the four core problems as words.

## Task Commits

1. **Task 1: record the reset decision** - no commit (a decision; Mark's "Proceed" of 2026-10-19)
2. **Task 2 (tracer): bump, seam, machines, proofs, ratchets, dist guard** - `2c9716c1` (feat)
3. **Task 3 RED: failing tests** - `376cc041` (test)
4. **Task 3 GREEN: validators, seeding, transfer.js import** - `79299cd8` (feat)

## TDD Gate Compliance

- **RED:** `376cc041`. The tests were run against a no-behaviour `seedTables.js` stub (same export names, validators returning nothing, `catalogConflicts` and `mergeById` returning `[]`) with the real seed-row data modules, so every target test loaded and executed. 36 tests failed, every one on an assertion for the planned behaviour (for example `expected [] to deeply equal [ StringContaining "$.row.bands.pod" ]`, `expected [] to deeply equal [ { kind: 'core-count', count: 3 } ]`, `expected 'Error' to be 'CatalogConflictError'`, `expected [ 'library', 'machines' ] to deeply equal [ ... ]`); none was an import, syntax or zero-test failure. Semantic assessment: the target tests executed and failed on the planned assertions for the intended reason.
- The format-based classifier (`gsd_run check tdd-red-evidence`) was not available in this environment (no `gsd_run`), so the RED evidence was not machine-classified; the assessment above is by reading the vitest report. `workflow.tdd_mode` is not enabled in `.planning/config.json`.
- **GREEN:** `79299cd8`. The full suite passes.
- **REFACTOR:** none.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] db.test.js's version-8 case asserted the keep-the-records upgrade**
- **Found during:** Task 2
- **Issue:** `db.test.js` held a second case, 'a profile left at version 8 ... opens at 9 with all four records unchanged' (Phase 6's keep), beside the one in `library.test.js` the plan named. The `< 10` reset necessarily breaks it, and the plan's pin-rewrite instruction did not cover it.
- **Fix:** rewritten to assert the reset (every store present and empty, the batches `by-version` index kept), same as the `library.test.js` case.
- **Files modified:** app/src/store/db.test.js
- **Commit:** 2c9716c1

**2. [Rule 1 - Bug] Seed tables read back in id order, not seed order**
- **Found during:** Task 3 GREEN
- **Issue:** my RED tests compared `listStyles()` and the other lists to the seed arrays in seed order; IndexedDB returns rows in key order, so Philadelphia came back after French and Gelato.
- **Fix:** the real-IndexedDB cases in `seed.test.js` and `db-upgrade-10.test.js` compare both sides sorted by id. Nothing in the app orders these for display yet; whoever reads them for a menu sorts by `order`.
- **Files modified:** app/src/store/seed.test.js, app/tests/db-upgrade-10.test.js
- **Commit:** 79299cd8

**3. [Rule 3 - Blocking] The older fixture for the version-8 case needed an old-shaped version**
- **Found during:** Task 2
- **Issue:** the plan says `openVersion8Profile` stores "the same" recipe, version, batch and draft, but the current `oliveOilVersion` export already holds `libraryId` and `serveTempC`, so storing it could not show that the reset replaced a stored record with a reseeded one.
- **Fix:** the case stores a copy with `sheetCode`, `serveTempC` and each row's `libraryId` removed (the shape a version-8 build wrote), then asserts the reseeded record has all three.
- **Files modified:** app/src/store/library.test.js
- **Commit:** 2c9716c1

**Total deviations:** 3 auto-fixed (2 bugs in tests the plan did not list, 1 blocking). **Impact:** none on the product code; no scope added.

Other plan items resolved without change: no other library fixture in `transfer.test.js` needed the six keys (every other one spreads `structuredClone(library.sucrose)`), and the full suite named no other fixture.

## Known Stubs

None. (`seedTables.js` was a stub only between the RED and GREEN commits.)

## Threat Flags

None. No new network endpoint, auth path or file-access pattern; the new surface is the four IndexedDB stores, behind the same repository seam and validated by the shared validators. T-09-18 (the reset reaching a later profile) and T-09-40 (a stray build writing `app/dist`) are mitigated by the two ratchets and the dist guard as the plan's threat register states.

## Issues Encountered

- Between `2c9716c1` and `79299cd8` the full suite was red in `seed.test.js` (its in-memory repository had no `seedTableIfEmpty`), as the plan warned; Task 2's own verify does not include that file.
- This worktree has an `app/node_modules` symlink to the main checkout's (gitignored, not staged).

## Next Phase Readiness

Plan 09-10 can export and import the four tables with `SEED_TABLES` and run `catalogConflicts` and `mergeById` in its pre-check and inside `importAll`'s transaction. Plan 09-11 can validate the tables at boot with the same functions. Plan 09-17 must run `09-dist-guard.sh scan` and `check` before it writes the device row: if `check` fails, `app/dist` changed after the bump and the device hand-over stops. A device that opens the build from this phase loses its stored records on first open (decisions 2 and 5; Mark confirmed).

## Self-Check: PASSED

- Created files exist: seedTables.js, seedTables.test.js, machines.js, styles.js, core-scales.js, core-problems.js, seed-catalog.js, db-upgrade-10.test.js, 09-dist-guard.sh, 09-dist-fingerprint.txt (all found on disk).
- Commits exist on this branch: 2c9716c1, 376cc041, 79299cd8.
- Acceptance greps: `export const DB_VERSION = 10`, one `oldVersion < 10` block, no literal 8/9/10 `toBe` in db.test.js or db-reset.test.js, `RESET_BOUND = 10` and the anchor in db.test.js, `function validateLibraryRecord` absent from transfer.js, `seedTableIfEmpty('` four times in seed.js, `STAGE_IDS` imported in seedTables.js.
- Full suite: 107 files, 3341 tests passing. `09-dist-guard.sh scan` prints SCAN OK 10 build commands; `check` prints DIST UNCHANGED.
