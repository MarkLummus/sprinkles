---
phase: 11-steps-structure-save-and-print
plan: 02
subsystem: domain
tags: [create-draft, steps, allocation, grams, projection, vitest]

requires:
  - phase: 10-the-creation-editor-without-save
    provides: the create draft (rows with one placeholder portion, empty method), creationSheetVersion, addRow/removeRow
provides:
  - "creationSteps.js: pure step, row, line and allocation ops over the create draft (UNPLACED_STEP, liveSteps, placementOf, groupRows, rowLines, addStep, removeStep, moveStep, setStepField, addTarget, setTarget, removeTarget, toggleStepUses, placeRow, moveRow, setLineGrams, addGrams, checkAllocation, normalizeAllocation)"
  - "creationSheetVersion projecting live steps and every line of a row (unplaced rows at step 0)"
  - "removeRow pruning the id from every step's uses"
  - "gramsDraftMessage refusing a parse that is not finite"
affects: [11-03, 11-05, 11-06, 11-07, 11-08, 11-09, 11-10]

actuals:
  tokens: 16000
  tasks: 2
  commits: 3
plan_head_before: d5afacf793af293604e552163276b00d568d0a2e
plan_head_after: 8bb09a7c2e777b06c09e4a898fec6a67bcbe594c

tech-stack:
  added: []
  patterns:
    - "Placement is read from live steps' uses only; a draft portion's step is the key its grams line is stored under, with a placeholder { step: 1 } for an unplaced row (RESEARCH G-2)"
    - "A step's uses list is that step's row order (each step orders its own rows)"
    - "A removed step stays as a blanked tombstone in the method as the key ledger; Save drops it"
    - "One fold policy, addGrams: exact hundredths read from the decimal text as BigInt up to Number.MAX_SAFE_INTEGER, blank identity, both texts joined by ' + ' otherwise"
    - "Seeded random-op invariant test with an independent decimal-string oracle (column addition, no Number, no BigInt)"

key-files:
  created:
    - app/src/domain/creationSteps.js
    - app/src/domain/creationSteps.test.js
  modified:
    - app/src/domain/creation.js
    - app/src/domain/creation.test.js
    - app/src/domain/lineage.js
    - app/src/domain/lineage.test.js

key-decisions:
  - "Unplaced rows project at UNPLACED_STEP = 0 (research open question 9); the draft keeps its placeholder portion at step 1 because draft.js refuses 0"
  - "groupRows and the other group-taking ops throw RangeError for a group that is neither UNPLACED_STEP nor a live step (the plan names throws only for moveRow's, so this is the same caller-bug rule applied to groupRows)"
  - "addStep's afterN must name a live step; a tombstone's key is a RangeError like an unknown one"
  - "addGrams reads Number only through parseGramsDraft's pattern test; the value is never computed through Number"

patterns-established:
  - "Domain ops throw RangeError for a key or row that is not live, so a double press changes nothing the second time"
  - "normalizeAllocation returns its argument (same object) when checkAllocation is already null, so a caller can compare by identity"

requirements-completed: [MAKE-07, STRUCT-01, STRUCT-02, STRUCT-03]

coverage:
  - id: D1
    description: "A step added to a Phase 10 draft and a row ticked into it reach the Sheet projection, placement read from uses, unplaced rows at step 0"
    requirement: STRUCT-01
    verification:
      - kind: unit
        ref: "app/src/domain/creationSteps.test.js#tracer: a step added to a Phase 10 draft and a row ticked into it"
        status: pass
      - kind: unit
        ref: "app/src/domain/creation.test.js#creationSheetVersion with steps (D-09, D-10, D-12, D-22)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Remove, move, place, split lines and targets keep every step key and row id stable, prune what they remove and fold grams as decided"
    requirement: STRUCT-02
    verification:
      - kind: unit
        ref: "app/src/domain/creationSteps.test.js#removeStep, moveStep, moveRow, placeRow, toggleStepUses beyond the tracer, targets and fields"
        status: pass
    human_judgment: false
  - id: D3
    description: "Each step orders its own rows: moving a split row in one step leaves the other step and draft.rows as they were"
    requirement: STRUCT-02
    verification:
      - kind: unit
        ref: "app/src/domain/creationSteps.test.js#moveRow ... moves two rows split across the same two steps independently in each step"
        status: pass
    human_judgment: false
  - id: D4
    description: "No removed step key is handed out again within one editing session; a saved method reopened can reissue a key removed before that Save"
    requirement: STRUCT-03
    verification:
      - kind: unit
        ref: "app/src/domain/creationSteps.test.js#step keys within one editing session"
        status: pass
    human_judgment: false
  - id: D5
    description: "addGrams never loses typed text and sums exactly in hundredths up to the safe-integer limit; grams are conserved across 500 random ops (small and near-limit amounts)"
    requirement: MAKE-07
    verification:
      - kind: unit
        ref: "app/src/domain/creationSteps.test.js#addGrams: the one fold policy, seeded random ops keep every invariant"
        status: pass
    human_judgment: false
  - id: D6
    description: "gramsDraftMessage refuses a 309-digit amount, so the creation table, the Save gate and the version pen refuse it"
    requirement: MAKE-07
    verification:
      - kind: unit
        ref: "app/src/domain/lineage.test.js#gramsDraftMessage names a 309-digit amount, which parses to Infinity, as not a number"
        status: pass
    human_judgment: false
  - id: D7
    description: "normalizeAllocation repairs a restored draft whose uses and portions disagree without losing a typed amount"
    requirement: STRUCT-01
    verification:
      - kind: unit
        ref: "app/src/domain/creationSteps.test.js#normalizeAllocation, seeded random ops (corrupt-and-repair every 25th op)"
        status: pass
    human_judgment: false

duration: 12min
completed: 2026-10-27
status: complete
---

# Phase 11 Plan 02: Step and row ops on the create draft Summary

**Pure create-draft ops for steps, placements and split grams lines, with placement read from step uses only, an exact BigInt-hundredths fold that never drops typed text, and a seeded 500-op invariant test against an independent decimal-string oracle.**

## Performance

- **Duration:** about 12 min
- **Started:** 2026-10-27T01:23Z (approximate; the start-time record was not taken before the first command)
- **Completed:** 2026-10-27T01:36Z
- **Tasks:** 2 (a tracer and an auto TDD task)
- **Files modified:** 6 (2 created, 4 modified), all under `app/src/domain/`

## Accomplishments

- `creationSteps.js` holds the whole op surface later plans call through functional draft updates. A step's `uses` is the only truth for placement and for that step's row order; a draft portion's step is only the key a grams line is stored under. `checkAllocation` returns null after every op.
- `creationSheetVersion` now projects live steps (targets with both sides non-blank, purpose and aside only when non-blank, uses in the step's own order) and one portion per line of a row, unplaced rows at `UNPLACED_STEP = 0`.
- Removing a step leaves a blanked tombstone (`removed: true`) so `nextStepKey` never reissues its key while the draft lives; rows fold their grams into their first remaining line in method order (not `row.portions[0]`), or return to the placeholder with their grams.
- `addGrams` is the single fold policy: blank identity, exact hundredths read from the decimal text as BigInt up to `Number.MAX_SAFE_INTEGER`, otherwise both texts joined by ` + ` (which reads as not a number, so the line shows its own message and Save refuses it).
- `normalizeAllocation` repairs a restored draft (dangling ids, repeated ids, stray portions, missing portions, removed steps still listing rows) folding with `addGrams`, and returns the same object when nothing needs repair.
- `gramsDraftMessage` refuses a parse that is not finite (a 309-digit amount reads as Infinity).

## Task Commits

1. **Task 1 (tracer): a step added to a Phase 10 draft and a row ticked into it reach the Sheet projection** - `1055d6cb` (test, RED), `5e8f9f6c` (feat)
2. **Task 2: remove, move, place, split lines, targets and grams, held by a property test** - `8bb09a7c` (feat)

**Plan metadata:** committed separately as `docs(11-02)` after this file.

## Tracer feedback gate

The tracer's `<verify>` is automated-only and was re-run end to end before expansion (143 tests across creationSteps, creation and draft suites, green). Tracer verified end-to-end; expanding.

## Files Created/Modified

- `app/src/domain/creationSteps.js` - the pure step, row, line and allocation ops (new)
- `app/src/domain/creationSteps.test.js` - behaviour cases, hand-worked addGrams edge literals, the own-order case, the one-editing-session key case, and the seeded random-op invariant and conservation test with its `decimalSum` oracle (new)
- `app/src/domain/creation.js` - `creationSheetVersion` projects live steps and every line (reads `liveSteps`, `rowLines`); `removeRow` prunes uses
- `app/src/domain/creation.test.js` - projection cases with steps, a removeRow pruning case, and the three unplaced pins moved (below)
- `app/src/domain/lineage.js` - `gramsDraftMessage` second test is `!Number.isFinite(parseGramsDraft(raw))`
- `app/src/domain/lineage.test.js` - the 309-digit case

## Pins moved (review concern L649@d52488be)

Three `creation.test.js` pins asserted step 1 for an unplaced row and now assert `UNPLACED_STEP` (0), because Task 1 projects unplaced rows at 0:

- line 106: `rowFromLibraryRecord(records.get('wholeMilk'), { id: 'row-a', grams: 600, step: 1 })` became `step: UNPLACED_STEP`
- line 114: `[{ step: 1, grams: 0 }]` became `[{ step: UNPLACED_STEP, grams: 0 }]`
- line 124: the no-portion case, title "at step 1" became "unplaced", expectation `[{ step: UNPLACED_STEP, grams: 0 }]`

## Decisions Made

See `key-decisions` above. All other behaviour follows the plan and CONTEXT as written, including Mark's two 2026-10-26 answers (`decide-p11-row-order-across-steps`, `decide-p11-step-key-reuse`).

## Deviations from Plan

None - plan executed exactly as written. Two small fixes to my own test fixtures while writing (not code changes): a tracer test that built an invalid draft (a step 1 "uses" of a row whose only portion sits at the placeholder 1 is a valid allocation, so the test now uses step 2), and a fixture helper argument order. Both were found by the first test run.

**Total deviations:** 0 auto-fixed. **Impact:** none.

## Issues Encountered

None. The plan's property test was checked for sensitivity with two throwaway mutations (addGrams routed back through Number; the fold target read from the first stored portion): each turned the expected tests red, then both were reverted.

## Test counts

- Baseline in this worktree at `d5afacf7`: 3771 tests, 120 files.
- Final: 3848 tests, 121 files, all passing (`npm --prefix app test -- --run`).

## Notes for Mark (for chat)

- A step removed while one of its lines holds something unreadable leaves both texts in the remaining line (`4. + 200`) rather than dropping either; the line then reads as not a number until the maker types one amount.
- The version pen now also refuses a 309-digit amount with "...'s amount is not a number" (it shares `gramsDraftMessage`).
- Each step keeps its own row order, so moving a row in one step leaves every other step as it was (`decide-p11-row-order-across-steps`).
- A step key removed before the first Save can come back after Edit, as `decide-p11-step-key-reuse` allows.

## Known Stubs

None.

## Threat Flags

None. No new network endpoint, auth path, file access or schema change; T-11-05, T-11-06, T-11-44 and T-11-45 are mitigated as the plan's register says (array scans only, `checkAllocation` after every op, `addGrams` conservation, `gramsDraftMessage` finite check).

## Requirements

`requirements-completed` lists MAKE-07, STRUCT-01, STRUCT-02, STRUCT-03 as the plan declares. REQUIREMENTS.md was not edited: sibling plans in this wave declare overlapping IDs, so the orchestrator's shared-ID gate owns marking them.

## Next Phase Readiness

Plans 11-05, 11-06, 11-07, 11-08, 11-09 and 11-10 can import these ops. Plan 11-07 and 11-10 should run `normalizeAllocation` on a restored kept draft; plan 11-09's `buildCreation` should refuse a draft `checkAllocation` rejects. Plan 11-03 edits `newRecipe.js`, `firstVersion.js` and `draft.js` in parallel; none of those were touched here.

## Self-Check: PASSED

- `app/src/domain/creationSteps.js` and `app/src/domain/creationSteps.test.js` exist.
- Commits `1055d6cb`, `5e8f9f6c`, `8bb09a7c` are ancestors of HEAD.
- Acceptance one-liners all print PASS (exports, addGrams literals, 309-digit message, own-order case); `draft.js`, `draft.test.js` and `penDraft.js` appear in none of this plan's commits.
