---
phase: 09-the-library-and-the-stored-shapes-plus-the-two-places
plan: 15
subsystem: domain
tags: [drafts, catalog, battery, seed-data, static-guard, indexeddb, upgrade, vitest]
status: complete
requires:
  - phase: 09-the-library-and-the-stored-shapes-plus-the-two-places
    provides: "09-14 import judges a batch by its snapshot (transfer.js free of AXES/DEFECTS); 09-13 snapshot.coreScales/coreProblems and createBatch with a catalog; 09-11 loadCatalog, CatalogContext, axesForVersion(version, catalog); 09-09 db-upgrade-10 proof; 09-08 declaredOf with core keys; 09-03/09-04 catalog.js and the draft kinds"
provides:
  - "draftMatchesVersion(record, version, batches, catalog): a record draft is checked against the catalog's core scales and problems plus the version's declared ones; a Correct draft against the corrected batch's own snapshot (coreScales, declaredAxes, coreProblems); a plan draft reads neither"
  - "useKeptDraft takes a catalog input; RecipePage passes it to useKeptDraft and to the waiting-plan-draft filter; HomeBody takes a catalog prop that RecipeList reads from useCatalog()"
  - "domain/axes.js and domain/battery.js hold no core scale or problem list: AXES, CORE_AXIS_COUNT and DEFECTS are gone, the words live only as seed rows in app/src/data"
  - "store/seed-data-scan.test.js: a static-import guard over app/src/data with an exact-path allow-list, plus a check for copied word lists"
  - "db-upgrade-10.test.js proves, on the bumped database, that definitions land on the tables' rows and that a batch's marks survive a later change to the tables, to a later version's own Oil, and an export, import and reopen"
affects: [09-16, 09-17]
actuals:
  tokens: 24000
  tasks: 3
  commits: 3
plan_head_before: a27be39cb0b97cd445d665781fdd416c430301e9
plan_head_after: 46d00486e52ac158dc564918405399433c6dd945
tech-stack:
  added: []
  patterns:
    - "the fit check takes the allowed lists as arguments (allowedFromCatalog for a record draft, allowedFromSnapshot for a Correct draft) and the domain keeps no list of its own"
    - "an architectural test resolves each relative import specifier with node:path against the importer and checks the target against exact paths, never a substring"
    - "a test changes a table through a raw IndexedDB transaction and a catalog through structuredClone, never the shared SEED_CATALOG"
key-files:
  created:
    - app/src/store/seed-data-scan.test.js
  modified:
    - app/src/domain/draft.js
    - app/src/domain/draft.test.js
    - app/src/domain/axes.js
    - app/src/domain/axes.test.js
    - app/src/domain/battery.js
    - app/src/domain/battery.test.js
    - app/src/domain/catalog.test.js
    - app/src/ui/useKeptDraft.js
    - app/src/ui/useKeptDraft.test.jsx
    - app/src/ui/RecipePage.jsx
    - app/src/ui/RecipeList.jsx
    - app/src/ui/RecipeList.test.jsx
    - app/src/ui/RecipeList.nextVersion.test.jsx
    - app/src/ui/AxisMark.jsx
    - app/src/ui/AxisMark.test.jsx
    - app/src/ui/BatchRow.test.jsx
    - app/src/ui/PrintLogPages.test.jsx
    - app/src/store/seedTables.test.js
    - app/src/data/core-problems.js
    - app/src/data/core-scales.js
    - app/tests/db-reset.test.js
    - app/tests/db-upgrade-10.test.js
key-decisions:
  - "A record draft with no catalog throws a TypeError naming the catalog (a caller bug), so the restore's catch ends the restore and keeps the draft; a plan draft and a Correct draft never read a catalog and never throw"
  - "A Correct draft and its baseline are both checked against the corrected batch's snapshot keys; a record draft's shape check and values check now use the same one allowed list"
  - "The seed-data scan's second case looks for the problem words and the scale names only (not the six keys), as the plan names"
requirements-completed: [LIB-09, TASTE-03]
coverage:
  - id: D1
    description: "A kept record draft is checked against the catalog, a Correct draft against its batch's snapshot, and a plan draft against neither; Home, the recipe page and useKeptDraft all pass the catalog"
    requirement: LIB-09
    verification:
      - kind: unit
        ref: "app/src/domain/draft.test.js#draftMatchesVersion: the catalog and the snapshot decide what a draft may name"
        status: pass
      - kind: unit
        ref: "app/src/ui/RecipeList.test.jsx#a record draft marking a core scale only the given catalog holds is named with that catalog and not with the seeded one"
        status: pass
      - kind: integration
        ref: "app/src/ui/useKeptDraft.test.jsx#restores a kept record draft that marks a core scale, checking it against the catalog"
        status: pass
    human_judgment: false
  - id: D2
    description: "The domain holds no core scale or problem list; the words live only as seed rows, and the seed rows are pinned as literals"
    requirement: LIB-09
    verification:
      - kind: unit
        ref: "app/src/store/seedTables.test.js#the seed rows carry the battery’s scales and problems"
        status: pass
      - kind: command
        ref: "grep -cE \"export const (AXES|CORE_AXIS_COUNT|DEFECTS)\\b\" app/src/domain/axes.js app/src/domain/battery.js returns 0 for both"
        status: pass
    human_judgment: false
  - id: D3
    description: "No module outside an exact-path allow-list imports from app/src/data, and none keeps its own array of the four problem words or six scale names"
    requirement: LIB-09
    verification:
      - kind: unit
        ref: "app/src/store/seed-data-scan.test.js#no seed dataset is imported from app/src/data outside the allow-list (criterion 6, LIB-09)"
        status: pass
      - kind: unit
        ref: "app/src/store/seed-data-scan.test.js#no module outside app/src/data keeps its own copy of the core problem words or scale names"
        status: pass
    human_judgment: false
  - id: D4
    description: "A stored version-9 profile opened at 10 lands olive oil's declared definitions and the 2 Aug batch's core definitions on the tables' rows"
    requirement: TASTE-03
    verification:
      - kind: integration
        ref: "app/tests/db-upgrade-10.test.js#criterion 2: a stored version-9 profile lands the definitions where they belong (TASTE-03)"
        status: pass
    human_judgment: false
  - id: D5
    description: "A batch's marks and words survive a rewritten Sweetness, a deleted Oil row, a renamed core problem and a later version's own renamed Oil, through export, import into a fresh profile and a reopen"
    requirement: TASTE-03
    verification:
      - kind: integration
        ref: "app/tests/db-upgrade-10.test.js#criterion 4: a batch’s marks survive a later change to the tables, through export, import and a reopen (TASTE-03)"
        status: pass
    human_judgment: false
---

# Phase 9 Plan 15: The battery reads only its tables and its snapshots Summary

**Kept-draft checks now read the catalog (record drafts) or the batch's own snapshot (Correct drafts), the domain's AXES, CORE_AXIS_COUNT and DEFECTS are retired, a static test guards every import into app/src/data, and the upgrade proof shows a batch's marks survive a later change to the scales and problems tables.**

## Performance

- **Duration:** about 6 min of wall clock (22:15 to 22:21 local)
- **Tasks:** 3 (Task 1 tracer, Task 2 auto, Task 3 auto/tdd)
- **Files:** 23 (1 created, 22 modified)
- **Suite:** 113 files, 3467 tests passing (baseline 112 files, 3450; net +17 cases: new cases in draft.test.js, RecipeList.test.jsx, useKeptDraft.test.jsx, seed-data-scan.test.js and db-upgrade-10.test.js, less the table-content cases for the retired constants in axes.test.js, which seedTables.test.js now pins as literals)

## Accomplishments

- **Catalog-aware fit check (Task 1, tracer):** `draftMatchesVersion(record, version, batches, catalog)`. A record draft's allowed mark keys are the catalog's core scale keys plus the version's declared keys, and its allowed defects are `problemNames(catalog.problems)`. A Correct draft (and its baseline) is checked against the corrected batch's `snapshot.coreScales`, `snapshot.declaredAxes` and `snapshot.coreProblems`. `fitsRecordShape` and `fitsRecordValues` take those lists as arguments, so `draft.js` now imports only `STOPS` from `axes.js` and only `SEGMENT_OPTIONS` and `MARK_ONE_OPTIONS` from `battery.js`. The plan-draft branch stays first and reads no catalog, so the three-argument callers in `penDraft.test.js`, `pen-note-roundtrip.test.js` and `transfer.test.js` pass unedited (`git diff --name-only` over those three files prints nothing). A record draft with no catalog throws a `TypeError` naming the catalog.
- **Wiring:** `useKeptDraft` takes `catalog`; `RecipePage` passes it to the hook and to the waiting-plan-draft filter; `RecipeList` reads `useCatalog()` and hands it to `HomeBody`. The wiring test in `RecipeList.test.jsx` shows Home naming a record draft that marks a core scale only the given catalog holds, and not naming it with `SEED_CATALOG`.
- **Constants retired (Task 2):** `AXES` and `CORE_AXIS_COUNT` are gone from `domain/axes.js`, `DEFECTS` from `domain/battery.js`; both headers now say the scales and problems are table rows the app reads at boot and passes in, that `STOPS`, `stopWordsFor`, `readMarkWord`, `setMark`, `BATTERY_FIELDS`, `SEGMENT_OPTIONS` and the mark-one options stay because they are the battery's controls, and (axes.js) keep plan 09-13's paragraph that `stopWordsFor`, `readMarkWord` and `AxisMark` read every scale as goldilocks with kind-aware presentation left to Phase 12. Every test that imported the constants now reads `SEED_CATALOG`; `seedTables.test.js` pins the six scales and four problem words as literal arrays.
- **Static guard (Task 2):** `seed-data-scan.test.js` resolves every relative import specifier of every non-test module under `app/src` and fails, naming the importer and the target, when one lands in `app/src/data` from a file outside the exact-path allow-list (`store/seed.js`, the files inside `data`, `ui/catalog.fixtures.jsx`, `store/storeFile.fixtures.js`). Its header calls it an architectural guard that cannot see a dynamic import or a threaded value; `store/catalog.js` is deliberately off the list. A second case fails on an array literal of all four problem words or all six scale names in any module outside `data`. Both cases strip comments first. Nine cases in all, including broken fixtures that show each check can fire and stay green for a comment, prose, a partial list, and a path that merely contains "data".
- **Upgrade proof (Task 3):** on a stored version-9 profile reseeded at 10, olive oil's `declaredAxes` equal `[body, oil]` as `scaleDefinition` of the scales table's rows, and the 2 Aug batch's `snapshot.coreScales` / `coreProblems` equal the tables' rows. Then Sweetness is rewritten (`flat` / `cloying`), the Oil row is deleted and `Coarse, icy` is renamed `Icy` through a raw IndexedDB transaction; each case first asserts the edit landed (the reloaded catalog, a batch created after the edit reading the new words, the stored child, the exported file) before asserting the batch is unmoved: Sweetness `less`/`more`, `readMarkWord(…, 4)` `more`, Oil `faint`/`strong` and `strong`, core problems starting `Coarse, icy`. A child of olive oil v1 with its own Oil renamed `Olive` / `mild` / `peppery` leaves the batch and olive oil v1's own definitions unmoved. All of it holds through `exportStore`, a JSON round trip, `importStore` into a fresh profile and a second repository, with olive oil's `sheetCode` `64JH-G408` unchanged.

## Task Commits

1. **Task 1 (tracer): a kept record draft is checked against the catalog, a Correct draft against its batch's snapshot** - `d36591d7` (feat)
2. **Task 2: retire the domain's scale and problem constants, and guard the seed imports** - `098e486b` (refactor)
3. **Task 3: after the bump, a batch's marks survive a later change to the tables, through export, import and a reopen** - `46d00486` (test)

The tracer gate re-ran Task 1's automated verify (15 files, 444 tests) and the full suite (112 files, 3458 tests) before Task 2 started.

## Decisions Made

- A record draft is the one kind that reads the catalog, and a missing one throws rather than returning false: a `false` makes the restore delete a kept draft over a caller's bug, while a throw ends the restore through its catch and keeps the draft (plan 09-15 round 4).
- The shape check and the values check for a record draft now use the same allowed mark-key list. Before, the shape check allowed all six `AXES` keys and the values check narrowed to core plus declared; the combined result is unchanged.
- The `seed-data-scan.test.js` allow-list has a stale-entry guard: each entry must exist and still import from `app/src/data`.

## Deviations from Plan

**1. [Rule 3 - Blocking] `catalog.test.js` imported the removed `AXES`.** `app/src/domain/catalog.test.js` (not in `files_modified`) had one case, "names the six seeded keys the axes module holds", that imported `AXES`. With the export gone the file would not load and the plan's own acceptance grep (`import { … AXES … }` lists no file) would fail. The case now reads the keys of `SEED_CATALOG.scales`. Commit `098e486b`.

**2. [Rule 1 - Stale reference] Two seed-data comments named the retired constants.** `app/src/data/core-problems.js` and `core-scales.js` said they were copied from `DEFECTS` and `AXES` and that a case "asserts the words are the same today". Both comments were updated to say the rows are the only place the words live and `seedTables.test.js` pins them as literals. Comment-only; commit `098e486b`.

**3. [Process] Commit attribution trailer.** The dispatch notes asked for a "Claude Fable 5.1" trailer; this agent runs as Sonnet 5.5 and the session's attribution reminder names that model, so all three commits carry `Co-Authored-By: Claude Sonnet 5.5` (as plans 09-13 and 09-14 did). No code effect.

**4. [Process] Plan commit ledger not written.** The sandbox refuses compound git commands, so `plan_head_before` is the spawn HEAD `a27be39c` (also the `PLAN_BASE` for the acceptance check on the three plan-draft callers), and `commits: 3` was measured with `git rev-list --count a27be39c..HEAD` before this SUMMARY's own commit.

**5. [Note] Task 3 is `tdd="true"` but wrote no failing test first.** It adds characterization tests over behaviour plans 09-09 to 09-14 already built, so every case passed on first run. To keep the stability cases from being vacuous, each asserts its edit landed first, and the Sweetness case also records a batch after the edit with `createBatch` and shows it reads the new words, so the equality for the old batch could fail if the snapshot were not protecting it.

Otherwise the plan ran as written.

**Total deviations:** 2 auto-fixed (1 blocking, 1 stale comment), 3 process notes. **Impact:** none on scope.

## Authentication Gates

None.

## Known Stubs

None.

## Issues Encountered

- `gsd_run` is not available in this sandbox, so no `requirements.mark-complete` was run; STATE.md, ROADMAP.md and REQUIREMENTS.md are untouched (the orchestrator owns them).
- The `app/node_modules` symlink into the worktree is gitignored and was never staged. `app/dist` was never written (builds went to a scratch directory); `09-dist-guard.sh check` prints DIST UNCHANGED.
- The three-argument plan-draft callers (`penDraft.test.js`, `pen-note-roundtrip.test.js`, `transfer.test.js`) pass unedited, as the plan requires.

## Threat Flags

None. T-09-29 (a record draft is checked against the page's catalog and a Correct draft against its batch's own snapshot, so a draft cannot reopen marks or defects Save would store but import would refuse) is mitigated and tested. T-09-30 (seed-data-scan.test.js resolves every static import and fails on one into app/src/data outside its exact-path allow-list; the behaviour tests cover what a static scan cannot) is mitigated and tested, including by hand once with a temporary import, a commented word list and an array literal in `ui/Button.jsx`, each reverted. T-09-SC accepted: no package installed.

## Next Phase Readiness

Plan 09-16 can re-walk the built app against the before-walk: the battery reads only the tables and each batch's own snapshot, and no domain constant for the core scales or problems remains. The walk should start from a reset store (a batch recorded before plan 09-13 has no `snapshot.coreScales`, and a Correct draft kept against one no longer fits).

## Self-Check: PASSED

- Created file exists: `app/src/store/seed-data-scan.test.js`.
- Commits `d36591d7`, `098e486b` and `46d00486` are on this branch.
- Acceptance: `grep -n "export function draftMatchesVersion(record, version, batches, catalog)" app/src/domain/draft.js` finds the signature; `grep -cE "export const (AXES|CORE_AXIS_COUNT|DEFECTS)\b"` returns 0 for `axes.js` and `battery.js`; `grep -rlE "import \{[^}]*\b(AXES|CORE_AXIS_COUNT|DEFECTS)\b" app/src app/tests` lists no file; `grep -c stripComments app/src/store/seed-data-scan.test.js` returns 4; `grep -n "cloying"` and `grep -n "createChildVersion"` find their cases in `app/tests/db-upgrade-10.test.js`; full suite 113 files, 3467 tests passing; build into a scratch directory succeeds; DIST UNCHANGED.
