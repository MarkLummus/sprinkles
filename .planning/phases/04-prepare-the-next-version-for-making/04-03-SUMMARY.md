---
phase: 04-prepare-the-next-version-for-making
plan: 03
subsystem: domain, store, ui
tags: [declared-problems, declared-scales, store-schema-7, batch-schema-4, at-draw, from-freezer, draw-temp-removed, d25, d26, d17, d6b]

requires:
  - phase: 04-01
    provides: "shared Button, Checkbox, Radio; the raw-control scan (the declared chips are born on Button)"
provides:
  - "version.declaredFlaws and batch.snapshot.declaredFlaws: lists of 0 to 2 unique words; tasting.declaredDefects: the ticked words or null"
  - "battery.js: declaredProblemsForBatch, MARK_ONE_OPTIONS, PRINTED_MARK_ONE_OPTIONS; BATTERY_FIELDS without the draw-temperature entry"
  - "BATCH_SCHEMA_VERSION 4, STORE_SCHEMA_VERSION 7, VERSION_SCHEMA_VERSION 6 (DB_VERSION untouched; 04-04 owns the one bump)"
  - "churn.atDraw and tasting.fromFreezer, stored only while their group holds no mark; draft fields atDraw and fromFreezer ready for 04-05's pen controls"
  - "The pen and the reading draw only what a version declares"
affects: [04-04, 04-05, 04-06, 04-07]

actuals:
  tokens: 34000
  tasks: 3
  commits: 3
plan_head_before: 4a0aab96a7c0ba82f7a668b9a9557da4bb3f0cc5
plan_head_after: 8c2d1a5c88812b3b8f1dd7f165671e71c3c36276
commits: 3

tech-stack:
  added: []
  patterns:
    - "A declared list is validated as a bounded array of unique plain words (validateDeclaredFlaws), and a tick must name a word in the same batch's own snapshot"
    - "A mark-one pick (At draw, From freezer) is normalised in the domain (markOneFor) and re-checked by the validator, so neither a save nor an import can store a pick beside a mark"
    - "Tests that touch declared items iterate seedRecipeGroups and take each expectation from the version under test; Body, Oil and Bitter are literals only in the Olive Oil case"

key-files:
  created: []
  modified:
    - app/src/domain/battery.js
    - app/src/domain/batch.js
    - app/src/domain/sheetCode.js
    - app/src/store/transfer.js
    - app/src/data/olive-oil.js
    - app/src/data/batch-2026-08-02.js
    - app/src/data/mexican-chocolate.js
    - app/src/data/pineapple.js
    - app/src/data/coconut.js
    - app/src/data/strawberry.js
    - app/src/data/standard-base.js
    - app/src/data/underbelly-light-base.js
    - app/src/data/mocha.js
    - app/src/ui/BatchRow.jsx
    - app/src/ui/RecipePage.jsx
    - app/src/domain/battery.test.js
    - app/src/domain/batch.test.js
    - app/src/store/transfer.test.js
    - app/src/store/seed-roundtrip.test.js
    - app/src/data/olive-oil.test.js
    - app/src/data/seed-recipes.test.js
    - app/src/ui/BatchRow.test.jsx
    - app/src/ui/BatchRow.dates.test.jsx
    - app/src/ui/BatchRow.signed.test.jsx
    - app/src/ui/PenFoot.test.jsx
    - app/src/ui/RecipePage.test.jsx
    - app/src/ui/RecipePage.recordTasting.test.jsx

key-decisions:
  - "With no declared scale, AxesGrid keeps its three-column grid and fills the cue slot and the first declared slot with two empty aria-hidden cells (axes-grid__void) so the core scales keep the width they have beside a declared one; the plan said only 'render the cue and hairline when a declared axis is present', and without the cells the third core scale would flow into the empty third column"
  - "The declared problems are read once at the top of BatchRow (amend reads the batch snapshot, record reads the live version), not inside the JSX, and shared by the chips and the group's presence"
  - "validateTasting takes the batch's snapshot as an argument so declaredDefects can be checked against that batch's own declaredFlaws"

requirements-completed: [PRINT-03, UX1-03]

coverage:
  - id: D1
    description: "A version declares 0 to 2 scales and 0 to 2 problems; a batch copies both lists into its snapshot at first save; the validator refuses a third, a repeat, an empty word and a tick the batch's own snapshot lacks"
    requirement: PRINT-03
    verification:
      - kind: unit
        ref: "app/src/store/transfer.test.js (declaredFlaws, declaredAxes, declaredDefects blocks); app/src/domain/batch.test.js#declaredDefects"
        status: pass
    human_judgment: false
  - id: D2
    description: "0, 1 and 2 declared problems round-trip: createBatch, the store file (exportStore, importStore, real fake-indexeddb repository), and from a tick made in the pen's draft through save, the reading's words, export and import"
    requirement: PRINT-03
    verification:
      - kind: unit
        ref: "app/src/store/seed-roundtrip.test.js#declared problems round-trip through the store file; app/src/ui/BatchRow.test.jsx#a tick made in the pen round-trips"
        status: pass
    human_judgment: false
  - id: D3
    description: "The pen and the reading draw nothing for a recipe that declares nothing, and one chip per declared word otherwise; the expectation comes from each seeded version"
    requirement: UX1-03
    verification:
      - kind: unit
        ref: "app/src/ui/BatchRow.test.jsx#the record pen draws only what each seeded version declares (D25)"
        status: pass
    human_judgment: false
  - id: D4
    description: "Time to draw temp. is gone from the field table, buildChurn, the validator, every seed and the amend save; a correction and a new record both save a churn object with no draw-temperature key"
    requirement: PRINT-03
    verification:
      - kind: unit
        ref: "app/src/ui/RecipePage.recordTasting.test.jsx; app/src/domain/battery.test.js; app/src/store/seed-roundtrip.test.js#the reseeded record shape"
        status: pass
    human_judgment: false
  - id: D5
    description: "atDraw and fromFreezer are stored only while their group holds no mark, stored as null otherwise, and refused on import beside a mark; every seeded batch has both present and null"
    requirement: PRINT-03
    verification:
      - kind: unit
        ref: "app/src/domain/batch.test.js#atDraw / #fromFreezer; app/src/store/transfer.test.js#atDraw / #fromFreezer; app/src/data/seed-recipes.test.js#every seeded batch carries the record shape"
        status: pass
    human_judgment: false
  - id: D6
    description: "The pen of a recipe that declares nothing, one problem and two problems reads well at 350 and 393 and in the row-major arrangement; the empty third column of the row-major grid with no declared scale looks right"
    requirement: UX1-03
    verification: []
    human_judgment: true
    rationale: "Layout of the pen against sketch 010 declared-pen-reading.html is not asserted by any test; the row-major no-declared case is not drawn in the sketch at all"

duration: ~15min
completed: 2026-10-11
status: complete
---

# Phase 4 Plan 03: Declared problems as lists, draw temperature removed, At draw and From freezer stored Summary

**Declared scales and problems are lists of 0 to 2 from the seed through the pen, the reading and the store file (schema 7, batch 4), Time to draw temp. is gone from every layer, and At draw / From freezer have a validated stored home that never sits beside a mark.**

## Performance

- **Duration:** ~15 min (record_start 06:08Z, finished 06:23Z)
- **Tasks:** 3 (1 tracer, 2 auto)
- **Files:** 27 touched across three commits (1034 insertions, 262 deletions), none created
- **Suite:** 67 files, 2104 passed, 0 failed (baseline 1991). `npm --prefix app run build` exits 0.

## Accomplishments

- **Tracer (Task 1).** `declaredFlaws` (version and snapshot) and `declaredDefects` (tasting) replace the single `declaredFlaw` and the `bitterDeclared` boolean from the seed through `createBatch` to the store file and back. `STORE_SCHEMA_VERSION` 7 reads a 6 file with the older-file sentence first. `validateDeclaredFlaws` refuses a third word, a repeat, an empty or non-string word; `validateDeclaredAxes` refuses more than two and a repeat; a tick must name a word in that batch's own `snapshot.declaredFlaws`. Olive Oil v1 carries `['Bitter']`, `VERSION_SCHEMA_VERSION` is 6. The data round trip goes through the real fake-indexeddb repository for 0, 1 and 2 declared problems. Tracer gate: the `<verify>` was automated-only and `human_verify_mode` is end-of-phase, so it was re-run (737 targeted tests) and passed before expansion.
- **The pen and the reading (Task 2).** One chip-toggle `Button` per declared word, the whole This recipe only problems group absent when the list is empty, the scales' This recipe only cue and the hairline absent when no scale is declared, the reading reads `tasting.declaredDefects`. `RecipePage` carries `declaredDefects` in the draft and `handleToggleDeclaredDefect(word)`.
- **Draw temperature and the mark-one picks (Task 3).** The draw-temperature entry leaves `BATTERY_FIELDS`, `buildChurn`, the validator, every seed and the amend save's carry. `MARK_ONE_OPTIONS` and `PRINTED_MARK_ONE_OPTIONS` are exported; `churn.atDraw` and `tasting.fromFreezer` are stored only while their group holds no mark (a `markOneFor` helper in the domain) and the validator refuses the contradiction on import (T-04-08). The record draft gains `atDraw` and `fromFreezer` so 04-05's controls only need to set them.

## Task Commits

1. **Task 1 (tracer): declared problems as a list of 0 to 2, seed to store file** - `e12f1dd` (feat)
2. **Task 2: the pen and the reading show only what a version declares** - `4b25207` (feat)
3. **Task 3: Time to draw temp. leaves the data; At draw / From freezer get a stored home** - `8c2d1a5` (feat)

Task 1 touched nothing under `app/src/ui` (`git show --stat e12f1dd -- app/src/ui` lists no file). Because the executor ran Task 2 next in the same session, no commit left the UI suites red for longer than the plan allowed.

## Decisions Made

See key-decisions. The settled storage form for At draw / From freezer (CONTRACT section 11 left it open for planning) is the plan's: two enumerated string fields, null when absent, never stored beside a mark.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] AxesGrid with no declared scale would have pushed the third core scale into the empty third column**
- **Found during:** Task 2
- **Issue:** The row-major grid places the cue row as (core cue, declared cue) and the scales as (core, core, declared, core, core, declared). Dropping the declared cue and the declared slot for a recipe with no declared scale lets the auto-placement flow Hardness, Scoopability, Smoothness into row-major columns 1, 2, 3, which is a layout the sketch does not draw and a regression of the existing look.
- **Fix:** When no scale is declared, the declared cue slot and the first declared slot render as `<div className="axes-grid__void" aria-hidden="true" />`, an empty grid cell with no style of its own. The cue, the hairline and (stacked) the whole declared group are absent as the plan asks. With one declared scale nothing changes.
- **Files modified:** `app/src/ui/BatchRow.jsx`, `app/src/ui/BatchRow.test.jsx`
- **Verification:** BatchRow.test.jsx pins the two void cells, no `axes-rule`, no `This recipe only`, stacked and row-major. The look itself is the deferred human check (D6).
- **Commit:** `4b25207`

**2. [Rule 3 - Blocking] sheetCode.js header comment named the retired field**
- **Found during:** Task 1
- **Issue:** The comment listing what the Sheet code does not read named `declaredFlaw`. Comment only; the golden vector (`64JH-G408`) is unaffected.
- **Fix:** Reworded to `declaredFlaws`. The file is not in the plan's `files_modified`.
- **Files modified:** `app/src/domain/sheetCode.js`
- **Commit:** `e12f1dd`

**3. [Plan variation] The invariant test imports RecipePage's draft builders into BatchRow.test.jsx**
- The plan puts the pen's half of the invariant (a tick made in the pen) in BatchRow.test.jsx. The pen's toggle handler lives inside `RecipePage`'s component body, so the test drives it through the pen's own draft shape and `buildTastingFieldsFromDraft` / `buildChurnFieldsFromDraft`, and checks the chip's pressed state from that draft. `RecipePage.jsx` opens IndexedDB on import, so the file now begins with `import 'fake-indexeddb/auto'` like seed-roundtrip.test.js does. The handler's set-membership behaviour is covered at the draft level (`isDraftDirty`, `tastingHasInk`, payload and restore tests), not by a click.

**Total deviations:** 1 auto-fixed bug, 1 blocking (comment), 1 plan variation. **Impact:** none on any specified behaviour.

## Items for Mark's List

This executor has no `ArtifactData` tool, so these rows are for the orchestrator to add (as 04-02 did).

- **decide**, `owner: mark`, `needs: answer`, slug `at-draw-from-freezer-seeded-null`: "Seeded batches have no At draw / From freezer answer. Keep them blank, or mark them Not evaluated where the group is empty?" Options: option-a Keep blank (recommended: the maker never said Not evaluated for these old batches, and a blank reads as unrecorded); option-b Mark Not evaluated where the group is empty. Every seeded batch (12 across the seeded recipes) stores both as null now.
- **look/info**, `owner: mark`, `needs: answer`, slug `draw-temp-20-dropped`: "The 2 Aug Olive Oil batch's Time to draw temp. of 20 min is dropped with the field (your decision D17, row build-remove-draw-temp-data-element). Nothing to do unless you want it kept as a note on that batch." If this row exists as a build row for the removal, close it: the work it asked for is finished in `8c2d1a5`.
- **look**, `owner: mark`, `needs: hands`, slug `declared-pen-none-one-two`: the pen of a recipe that declares nothing (Mexican Chocolate), Olive Oil, and a recipe with two scales and two problems, at 393 and at the 1366 touch width, against `.planning/sketches/010-bench-sheet/declared-pen-reading.html`. Serve with `npm --prefix app run build && npm --prefix app run preview -- --host`, never the dev server. In particular the row-major (not stacked) pen of a recipe that declares nothing is not drawn in the sketch.

## Issues Encountered

None. The commit guard reports `main` as protected; commits went on `main` as the orchestrator's note and 04-01 and 04-02 did, with no config change.

## Known Stubs

None. `atDraw` and `fromFreezer` are real stored fields with no control yet; the controls are 04-05's work and are named in the plan as the consumer, not a stub in this plan's goal.

## Threat Flags

None. T-04-07 (bounded unique word lists; ticks name words in the batch's own snapshot; `scanForUnsafeKeys` still runs first) and T-04-08 (a mark-one pick refused beside a mark, in the domain and on import) are mitigated as planned and each has a refusal test. T-04-09 accepted: the 2 Aug batch's draw temperature (20) is dropped. T-04-SC: no package installed.

## Deferred Human Verification

human_judgment: true (D6). The three-state pen look (none, one, two declared) and the row-major no-declared-scale grid; see the Mark's List rows above. Serve the build, not the dev server.

## Self-Check: PASSED

- Commits `e12f1dd`, `4b25207`, `8c2d1a5` are ancestors of HEAD; `git rev-list --count` from the recorded base is 3
- `npm --prefix app test -- --run`: 67 files, 2104 passed, 0 failed
- `npm --prefix app run build` exits 0
- Task 1 acceptance: the comment-stripped old-name check (`bitterDeclared|DECLARED_FLAW|declaredFlaw\b`) exits 0 over battery.js, batch.js, transfer.js and every data file; `BATCH_SCHEMA_VERSION = 4` and `STORE_SCHEMA_VERSION = 7` present; `declaredProblemsForBatch` exported; `git show --stat e12f1dd -- app/src/ui` lists no file
- Task 2 acceptance: the same check exits 0 over BatchRow.jsx and RecipePage.jsx; BatchRow.test.jsx holds the per-recipe describe over `seedRecipeGroups` and the 0/1/2 invariant test
- Task 3 acceptance: the comment-stripped `timeToDrawTempMinutes` check exits 0 over the domain, validator, UI and every data file; `MARK_ONE_OPTIONS` and `PRINTED_MARK_ONE_OPTIONS` exported with the exact words; batch.test.js proves `atDraw` is stored as null when `exitConsistency` is set
- Post-commit deletion check on each commit: no deletions
