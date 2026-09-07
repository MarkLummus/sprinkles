---
phase: 03-develop-the-next-version
plan: 09
subsystem: ui
tags: [react, domain, diff, gap-closure, uat]

requires:
  - phase: 03-develop-the-next-version
    provides: "The pen's per-field draft state, buildDiff, and uses.js cross-flags (plans 03-01, 03-02), and the diagnosed root causes in .planning/debug/removal-cross-flags-misbehave.md"
provides:
  - "buildStepDiff's per-field change flags (leadInChanged/instructionChanged/purposeChanged/asideChanged) and the absent-vs-empty normalisation on textFrom"
  - "Method.jsx driving its struck-beneath device from the changed field alone, in both the developing and show-changes branches, with removal marked by its own label or in-place stroke"
  - "uses.js's coveredRowsFor, the D-UAT-3 coverage cue naming the rows a removed step's removal did not orphan and the step that still covers them"
affects: ["03-10 (the flagged row's step-selector fix, S3, and the step display-number 03-09 threaded through one function for)"]

actuals:
  tokens: 10500
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns:
    - "A per-field change flag disjunction (leadInChanged || instructionChanged || purposeChanged || asideChanged === textChanged) replacing a device that was forced true by an unrelated removed flag"
    - "Absent-vs-empty normalisation applied at the comparison boundary (buildStepDiff), not at each call site, so every consumer of textFrom/purposeChanged/asideChanged inherits the same equality"
    - "A domain function pair that partitions a fact between two answers (orphanedRows / coveredRowsFor) rather than widening one function's rule to cover both cases"

key-files:
  created: []
  modified:
    - app/src/domain/diff.js
    - app/src/domain/diff.test.js
    - app/src/domain/uses.js
    - app/src/domain/uses.test.js
    - app/src/ui/Method.jsx
    - app/src/ui/Method.test.jsx

key-decisions:
  - "The coverage cue's wording groups covered rows by their identical set of covering steps (coverageSentence in Method.jsx), so two rows sharing one covering step are named once — \"soy lecithin and Graza Drizzle are still used by step 8\" — rather than once per row; not exercised by the seed's second case (step 2's two covered rows also share one covering step) but written for the general shape the domain function returns."
  - "The step number a cross-reference names is read through one function, stepDisplayNumber(step), rather than inlined at the coverage cue's string — the plan's own instruction so 03-10's derived display numbering is a one-line change there."
  - "removedRowsUsedBy's new guard (returns [] for a step that is itself removed) made the JSX-level gate on the cross-flag block redundant in principle; kept explicit in Method.jsx anyway (!draftStep.removed &&) as defense-in-depth against the exact historical bug (T-03-53), matching the plan's own instruction to gate at that call site."

requirements-completed: [REC1-03]

coverage:
  - id: D1
    description: "buildStepDiff reports which of a step's four text fields moved (leadInChanged/instructionChanged/purposeChanged/asideChanged), with textChanged as their disjunction, and normalises absent-vs-empty purpose/aside to compare equal on both sides"
    requirement: REC1-03
    verification:
      - kind: unit
        ref: "app/src/domain/diff.test.js#buildDiff — steps, per-field change flags (03-09)"
        status: pass
    human_judgment: false
  - id: D2
    description: "A step's struck-beneath device (lead-in/instruction, and now purpose/aside each beneath their own field) is driven only by the field(s) that changed, never by the step's removed flag, in both the developing and show-changes branches; a removed step marks removal via its own label (developing) or an in-place stroke (show-changes) instead of duplicating unchanged prose"
    requirement: REC1-03
    verification:
      - kind: unit
        ref: "app/src/ui/Method.test.jsx#Method — developing mode (removed-with-untouched-text, per-field, removed-and-changed cases)"
        status: pass
      - kind: unit
        ref: "app/src/ui/Method.test.jsx#Method — developing mode (show-changes removed/instruction/purpose cases)"
        status: pass
    human_judgment: true
    rationale: "The plan's own <human-check> (open the pen on the churned olive-oil version, remove Soy lecithin then step 1, confirm no duplicated struck copy; restore step 1 and type into Purpose only, confirm lead-in/instruction stay unstruck) is a genuine visual/interactive check with no jsdom or browser harness in this repo; deferred to end-of-phase UAT per workflow.human_verify_mode: end-of-phase, consistent with this phase's standing precedent (03-01, 03-06). All automated verification (build, full suite, the grep gates against the forced-strike expression and the strike/pixel literals) passed."
  - id: D3
    description: "uses.js exports coveredRowsFor, the D-UAT-3 coverage answer: for a removed step, which of its rows another step still covers and by which step, partitioning every row the removal touched between this and orphanedRows (unchanged). Method.jsx gates the removed-row cross-flag and its mislabelled control on the step not itself being removed, and renders the coverage cue in words in its place."
    requirement: REC1-03
    verification:
      - kind: unit
        ref: "app/src/domain/uses.test.js#coveredRowsFor (03-09, D-UAT-3)"
        status: pass
      - kind: unit
        ref: "app/src/ui/Method.test.jsx#Method — developing mode (coverage cue, no-coverage, exactly-one-control cases)"
        status: pass
    human_judgment: true
    rationale: "The plan's own <human-check> (remove step 1 in the pen and read the coverage sentence naming soy lecithin/Graza Drizzle and step 8, confirm only a restore control; remove step 2 and confirm the three gums flag in the table while sucrose/whole milk are named on the step) needs a real browser render; deferred to end-of-phase UAT per the same standing precedent. All automated verification (domain tests against the real seed data, rendering tests, build, greps) passed."

duration: 35min
completed: 2026-09-07
status: complete
---

# Phase 3 Plan 09: Per-field strike, removal marking, and the coverage cue Summary

**Split the pen's changed-text device from its removed marker (buildStepDiff now reports which of a step's four fields moved, normalised so an absent optional field and an empty one compare equal), and gave a removed step a words-form account of the rows it did not orphan via uses.js's new coveredRowsFor.**

## Performance

- **Duration:** ~35 min
- **Started:** 2026-09-07T19:04:00Z (approx.)
- **Completed:** 2026-09-07T19:13:00Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments
- `buildStepDiff` (diff.js) now returns `leadInChanged`/`instructionChanged`/`purposeChanged`/`asideChanged` alongside `textChanged` (their disjunction), and normalises an absent `purpose`/`aside` to compare equal against an empty-string one on both sides — closing the stray-keystroke route to the duplicated struck visual (T-03-54) and the "which field moved" question the display needed.
- `Method.jsx`'s struck-beneath paragraph is driven only by `leadInChanged || instructionChanged` in both the developing and show-changes branches — the `stepDiff.textChanged || removed` expression that was S1 itself is gone from both. Purpose and aside each get their own struck-beneath line beneath their own field, rendering only when that field moved and the parent's value is non-empty.
- A removed step in the developing branch renders no struck-beneath paragraph when its text is untouched — the fields stay live and editable, and the "removed" label alone carries the fact. Show-changes marks a removed step's prose struck in place (`method-step__prose--struck`, the reading state's existing treatment) with the label as a sibling, rather than forcing the struck-beneath device — closing finding (ii), so a saved child's removed step no longer prints its prose twice there either.
- `uses.js` exports `coveredRowsFor(version, step)`: for a removed step, the rows it used that another step still covers, with those covering steps, in the version's row and method order — `orphanedRows`' complement. `removedRowsUsedBy` now returns `[]` for a step that is itself removed.
- `Method.jsx` gates the removed-row cross-flag and its "remove this step" control (which restored, mislabelled, on an already-removed step — T-03-53) on the step not itself being removed, and renders the coverage cue in words in its place when the step covers any of its rows — "soy lecithin and Graza Drizzle are still used by step 8" for the seed's step 1, closing S2's legibility gap (D-UAT-3) without touching `orphanedRows`' rule.

## Task Commits

Each task was committed atomically:

1. **Task 1: Per-field step-text change flags and absent-vs-empty normalisation** - `3e4e607` (feat)
2. **Task 2: A step strikes what changed, marks removal without duplicating prose** - `237fb71` (fix)
3. **Task 3: A removed step accounts for its own rows in words (D-UAT-3)** - `e605c11` (feat)

**Plan metadata:** committed alongside this SUMMARY.

_MVP mode is active (`workflow.tdd_mode: false`), consistent with this phase's precedent (03-01, 03-02, 03-05, 03-06): each task's tests and implementation landed in one commit rather than separate RED/GREEN/REFACTOR commits._

## Files Created/Modified
- `app/src/domain/diff.js` — `buildStepDiff`'s four per-field flags, `textChanged` as their disjunction, absent-vs-empty normalisation on both sides, doc-block updated
- `app/src/domain/diff.test.js` — 14 new tests: each field in isolation, all-four, the aggregate identity, absent-vs-empty both directions for both fields, absent-vs-real-text, and the no-baseline-step case
- `app/src/domain/uses.js` — `removedRowsUsedBy`'s `step.removed` guard; new `coveredRowsFor` export and doc-block
- `app/src/domain/uses.test.js` — a guard test for `removedRowsUsedBy`, and a `coveredRowsFor` describe block (partition, no-uses-key, not-removed, both-removed cases) against the real seed data
- `app/src/ui/Method.jsx` — `showStruckBeneath`/`showPurposeStruck`/`showAsideStruck` per-field gates in both branches; show-changes removal marked via `method-step__prose--struck` in place; cross-flag gated on `!draftStep.removed`; `coveredRowsFor` import, `stepDisplayNumber`/`joinWithAnd`/`coverageSentence` helpers, and the coverage-cue paragraph
- `app/src/ui/Method.test.jsx` — rewrote the two tests that pinned the old forced-strike behaviour; added per-field, absent-field, removed-and-changed, coverage-cue, no-coverage, and exactly-one-control tests across both branches; `makeBaselineVersionWithProse` fixture

## Decisions Made
- Coverage cue wording groups rows by identical covering-step sets (`coverageSentence`), naming a shared step once rather than once per row.
- The cue's step number reads through one function, `stepDisplayNumber(step)`, per the plan's own instruction, so 03-10's derived display numbering only needs to change there.
- Kept the JSX-level `!draftStep.removed &&` gate on the cross-flag block even though `removedRowsUsedBy`'s new guard already makes `flaggedRows` empty on a removed step — defense-in-depth at the exact site of the historical bug (T-03-53), matching the plan's explicit instruction.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- G-03-3's symptoms 1 and 2 and the diagnosis's finding (i) are closed. Symptom 3 (the flagged row's step-selector jumping to Step 1) remains 03-10's, in `IngredientTable.jsx`, untouched here.
- `orphanedRows` and its existing test (`uses.test.js:54`) are unchanged; D-UAT-3's rule holds.
- The plan's two `<human-check>` items (both in Task 2 and Task 3's `<verify>` blocks — the pen's visual behaviour on the churned olive-oil version) are deferred to end-of-phase UAT per `workflow.human_verify_mode: end-of-phase`, consistent with this phase's standing precedent. All automated verification (`npm --prefix app test`: 417/417 pass, up from 385 at phase start; `npm --prefix app run build`: exits 0; every plan-specified grep gate) passed.

---
*Phase: 03-develop-the-next-version*
*Completed: 2026-09-07*

## Self-Check: PASSED
All key files (diff.js, diff.test.js, uses.js, uses.test.js, Method.jsx, Method.test.jsx, this SUMMARY) confirmed present on disk. All 4 commits (3e4e607, 237fb71, e605c11, a6599a3) confirmed in git log. `npm --prefix app test` passes 417/417 (up from 385 baseline); `npm --prefix app run build` exits 0.
