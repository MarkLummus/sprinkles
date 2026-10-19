---
phase: 09-the-library-and-the-stored-shapes-plus-the-two-places
plan: 13
subsystem: domain
tags: [batch, snapshot, catalog, record-pen, vitest]
status: complete
requires:
  - phase: 09-the-library-and-the-stored-shapes-plus-the-two-places
    provides: "09-11 coreScaleDefinitions, problemNames, axesForVersion; 09-12 BatchRow catalog prop and RecipePage's useCatalog read; 09-09 SEED_CATALOG"
provides:
  - "createBatch(version, churnFields, tastingFields, { id, now, catalog }) writes snapshot.coreScales and snapshot.coreProblems beside the declared copies; a missing or malformed catalog throws a TypeError"
  - "axesForBatch(batch) = snapshot.coreScales then snapshot.declaredAxes; coreProblemsForBatch(batch) = a copy of snapshot.coreProblems"
  - "The twelve seeded batches are built with SEED_CATALOG"
  - "useBatchRecording takes a catalog input and the new-batch save passes it into createBatch; a Correct's Every recipe chips come from the batch's own snapshot"
affects: [09-14, 09-15, 09-16]
actuals:
  tokens: 10000
  tasks: 2
  commits: 2
plan_head_before: 5906254dc2b6ba06644839c60e354afbe75dfeee
plan_head_after: 5f0012c009f4d3d4f6d792e33ad3f0474584a29d
tech-stack:
  added: []
  patterns:
    - "the domain takes the catalog as an argument (D-02) and copies definitions into the batch once; no reader after that touches the catalog"
    - "test cases that need different core words build a batch through createBatch over structuredClone(SEED_CATALOG); the shared SEED_CATALOG is never mutated and no hand-built snapshot appears in BatchRow.test.jsx"
key-files:
  created: []
  modified:
    - app/src/domain/batch.js
    - app/src/domain/axes.js
    - app/src/domain/battery.js
    - app/src/domain/batch.test.js
    - app/src/domain/axes.test.js
    - app/src/domain/battery.test.js
    - app/src/domain/recordDraft.test.js
    - app/src/data/batch-2026-08-02.js
    - app/src/data/strawberry.js
    - app/src/data/mexican-chocolate.js
    - app/src/data/coconut.js
    - app/src/data/mocha.js
    - app/src/data/pineapple.js
    - app/src/data/olive-oil.test.js
    - app/src/ui/useBatchRecording.js
    - app/src/ui/RecipePage.jsx
    - app/src/ui/BatchRow.jsx
    - app/src/ui/BatchRow.test.jsx
    - app/src/ui/RecipePage.test.jsx
    - app/src/store/creation-roundtrip.test.js
    - app/src/store/seed-roundtrip.test.js
key-decisions:
  - "createBatch validates its catalog (an object with scales and problems arrays) and throws a TypeError otherwise: a caller bug, not a maker input. useBatchRecording's existing try/catch around createBatch turns it into the save-error line"
  - "batch.test.js wraps createBatch in a local helper that supplies SEED_CATALOG, so its 34 existing calls stay as written; the cases that need their own catalog call the raw import"
  - "axes.test.js's three hand-built snapshots moved onto batches built through createBatch, since axesForBatch now spreads snapshot.coreScales"
requirements-completed: [TASTE-03]
coverage:
  - id: D1
    description: "A batch keeps the core scale definitions and core problem words it was recorded with; a later change to the catalog it was taken from moves neither"
    requirement: TASTE-03
    verification:
      - kind: unit
        ref: "app/src/domain/batch.test.js#the core snapshot is a copy: a later change to the catalog it was taken from moves nothing (T-09-38)"
        status: pass
      - kind: unit
        ref: "app/src/domain/batch.test.js#snapshots the catalog's core scale definitions and its four core problem words (D-03)"
        status: pass
      - kind: unit
        ref: "app/src/domain/batch.test.js#completeRecord never retakes the core snapshot"
        status: pass
    human_judgment: false
  - id: D2
    description: "createBatch refuses a missing catalog with a TypeError"
    requirement: TASTE-03
    verification:
      - kind: unit
        ref: "app/src/domain/batch.test.js#throws a TypeError when the catalog is missing or malformed (a caller bug)"
        status: pass
    human_judgment: false
  - id: D3
    description: "The seeded 2 Aug batch reads as before: six scales, Sweetness 4 and Oil 4 marked, Bitter declared"
    requirement: TASTE-03
    verification:
      - kind: unit
        ref: "app/src/data/olive-oil.test.js#its 2 Aug batch reads six scales, its marks sit on keys of that list, and its declared problem is in the snapshot (D-03)"
        status: pass
    human_judgment: false
  - id: D4
    description: "A Correct and the reading show the words of the batch's own snapshot, while a new record pen on the same version shows the catalog's"
    requirement: TASTE-03
    verification:
      - kind: unit
        ref: "app/src/ui/BatchRow.test.jsx#a Correct shows the fifth core problem its batch was recorded with, and a new record pen on the same version does not"
        status: pass
      - kind: unit
        ref: "app/src/ui/BatchRow.test.jsx#a Correct shows the scale words its batch was recorded with, not the catalog the page holds now"
        status: pass
      - kind: unit
        ref: "app/src/ui/BatchRow.test.jsx#the reading shows the snapshot words, not the catalog words"
        status: pass
    human_judgment: false
  - id: D5
    description: "A batch saved from the record pen carries the catalog the page holds"
    requirement: TASTE-03
    verification:
      - kind: command
        ref: "grep -n 'now, catalog })' app/src/ui/useBatchRecording.js"
        status: pass
    human_judgment: true
    rationale: "The save handler is exercised only through its callers' static renders and the shell test; no test saves a batch through the mounted page and reads the stored snapshot's core words. Device or browser walk (plan 09-16) should record a batch and inspect it."
---

# Phase 9 Plan 13: Batches keep the core definitions they were recorded with Summary

**createBatch now copies the catalog's core scales and problem words into the batch's snapshot, every reader (axesForBatch, coreProblemsForBatch, a Correct's chips) takes them from that snapshot alone, and the record pen saves with the catalog the page holds.**

## Performance

- **Tasks:** 2 (Task 1 tracer, Task 2 auto)
- **Files:** 21 modified, none created
- **Suite:** 111 files, 3429 tests passing (baseline 3418; +11 new cases)

## Accomplishments

- `createBatch(..., { id, now, catalog })` writes `snapshot.coreScales` (`coreScaleDefinitions(catalog.scales)`) and `snapshot.coreProblems` (`problemNames(catalog.problems)`), in that order after `declaredFlaws`. Both are fresh objects and strings, so a later change to the catalog's rows cannot reach a stored batch. `completeRecord` is untouched and keeps the same references.
- `axesForBatch` is `[...snapshot.coreScales, ...snapshot.declaredAxes]`; `coreProblemsForBatch` sits beside `declaredProblemsForBatch` in battery.js (which still imports nothing).
- axes.js's header now says storing a kind is not kind-aware presentation: `stopWordsFor`, `readMarkWord` and `AxisMark` still treat every scale as goldilocks with "right" in the middle, and how a magnitude scale reads is Phase 12's (decision 3).
- Twelve seeded batches (1 + 3 + 2 + 2 + 3 + 1) pass `catalog: SEED_CATALOG`. The 2 Aug batch reads as before.
- `useBatchRecording` takes `catalog` as an argument (no new import, so RecipePage.shell.test.js's allow-list and its single `createBatch(` count are unchanged and the file needed no edit); RecipePage passes the catalog from `useCatalog()`.
- BatchRow's Correct chips are `coreProblemsForBatch(openBatch)`; the import of `DEFECTS` is gone from BatchRow.jsx. A new record pen still reads `problemNames(catalog.problems)`.

## Task Commits

1. **Task 1 (tracer): the seeded batch carries its definitions** - `5cbb130c` (feat)
2. **Task 2: the record pen saves with the page's catalog, a Correct reads the snapshot** - `5f0012c0` (feat)

## Verification

- Task 1 targeted run: 8 files, 389 tests passing.
- Contained-failure gate (JSON reporter, full suite): 7 failing files, every one in Task 2's set: `store/creation-roundtrip.test.js`, `store/seed-roundtrip.test.js`, `ui/BatchRow.test.jsx`, `ui/RecipePage.test.jsx`, and three files the plan's regex covers by pattern, `ui/RecipePage.drafts.test.jsx`, `ui/RecipePage.perStep.test.jsx`, `ui/RecipePage.recordTasting.test.jsx`. These three fail only because the page's save reached `createBatch` without a catalog; Task 2's `useBatchRecording` edit cleared them, so none of them needed a test edit. Printed `CONTAINED 7 failing files, all in the Task 2 set`. No seeded batch threw at import.
- Task 2 targeted run: 16 files, 595 tests passing. Full suite after: 111 files, 3429 tests passing.
- Acceptance checks: `catalog: SEED_CATALOG` totals 12 across the six data files; `coreScales: coreScaleDefinitions(catalog.scales)` in batch.js; `now, catalog })` in useBatchRecording.js; `coreProblemsForBatch(openBatch)` in BatchRow.jsx; `grep -v '^\s*//' app/src/ui/BatchRow.test.jsx | grep -c "snapshot: { declaredAxes"` returns 0; `'coreScales'` appears once in creation-roundtrip.test.js; `structuredClone(SEED_CATALOG)` in batch.test.js; axes.js's header names Phase 12.
- `09-dist-guard.sh check`: DIST UNCHANGED. No build was run.

## Deviations from Plan

**1. [Process] Commit attribution trailer.** The dispatch notes asked for a "Claude Fable 5.1" trailer; this agent runs as Sonnet 5.5 and the session's attribution reminder names that model, so both commits carry `Co-Authored-By: Claude Sonnet 5.5`. The first commit was amended to match before anything else was built on it. No code effect.

**2. [Rule 3 - Blocking] axes.test.js hand-built snapshots.** Three `axesForBatch` cases built `{ snapshot: { declaredAxes } }` by hand, which throws once `axesForBatch` spreads `snapshot.coreScales`. The plan's Task 1 instruction already named this class of caller ("moved onto a batch built through createBatch"); they now use a local `makeBatch` over `createBatch`. A fourth case was added: the core scales are read from `snapshot.coreScales` as stored, not from the catalog or a constant.

Otherwise the plan ran as written. The caller searches (`createBatch(` and `axesForBatch(`) matched the plan's interface lists exactly; no off-plan caller turned up.

**Total deviations:** 2 (1 process note, 1 Rule 3 within the plan's own instruction). **Impact:** none on scope.

## Decisions Made

- `createBatch` throws on a missing catalog rather than defaulting to the seed: the domain takes the catalog as an argument (D-02) and a default would hide a caller that forgot it.
- A local wrapper in batch.test.js (not a per-call edit) supplies `SEED_CATALOG` for the 34 existing calls.

## Flagged assumption (from the plan, carried)

[edge TASTE-03/unclassified] A batch's snapshot copies the core definitions at the moment `createBatch` runs. A correction and a tasting added later never retake them, so a batch recorded before a scales-table edit keeps the old words, also when reopened in the record pen, and nothing offers to move it onto the new words. Covered by the "Correct shows the scale words its batch was recorded with" case; the product choice itself is Mark's to confirm.

## Known Stubs

None.

## Issues Encountered

- A batch already in a browser's IndexedDB that was recorded before this plan has no `snapshot.coreScales`; `axesForBatch` would throw on it. The plan makes this a hard break (import checks and upgrade proof are plans 09-14 and 09-15), and the project has no live data to lift (reset over migration). Noted here so the device walk (09-16) starts from a reset store.
- No test saves a batch through the mounted page and reads the stored snapshot's core words; the wiring is covered by the grep acceptance check and the shell test's one-call count only. See coverage D5.

## Threat Flags

None. T-09-38 (tampering with the snapshot via a shared catalog) is mitigated and tested on a cloned catalog.

## Next Phase Readiness

Ready for 09-14 (import requires `coreScales` and `coreProblems` on every batch and checks marks and ticks against the batch's own snapshot). `validateBatch` accepts the new keys unchanged until then.

## Self-Check: PASSED

- Commits `5cbb130c` and `5f0012c0` are on this branch.
- Every file listed under key-files.modified exists on disk and is in the two commits.
