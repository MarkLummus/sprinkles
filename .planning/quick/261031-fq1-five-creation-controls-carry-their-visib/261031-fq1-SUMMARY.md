---
phase: quick-261031-fq1
plan: 01
quick_id: 261031-fq1
subsystem: creation-editor-a11y
tags: [wcag-2.5.3, label-in-name, aria-label]
status: complete
requirements: [bug-p11-label-in-name-mismatches]
key-files:
  modified:
    - app/src/ui/CreationSteps.jsx
    - app/src/ui/CreationSteps.test.jsx
    - app/src/ui/CreationFlow.test.jsx
    - app/src/ui/CreationStructure.test.jsx
    - app/src/ui/IngredientTable.jsx
    - app/src/ui/IngredientTable.creating.test.jsx
actuals:
  tasks: 2
  commits: 2
plan_head_before: db1b2c0652da8f019f4f244682ffcafd9adc4cb9
plan_head_after: 26eabd80db9709788096196df0340d4f3ac6f708
---

# Phase quick-261031-fq1 Plan 01: Five creation controls carry their visible words in their names

Seven aria-label strings in the creation editor now contain their visible label verbatim (WCAG 2.5.3 Label in Name), guarded by two new Label in Name tests.

## Commits

- d3b52474: Task 1, CreationSteps.jsx (Add target, preview toggle, Add step) and the three suites that drive it
- 26eabd80: Task 2, IngredientTable.jsx RowActs (Move up, Move down, Add to step) and its suites

## RED failures

- Task 1: `AssertionError: expected 'Step 1, add a target' to be 'Step 1, Add target'` in the new Label in Name test (CreationSteps.test.jsx).
- Task 2 (source reverted to db1b2c06 for the run): `Expected: "Move up, Whole milk, 3.5% fat"  Received: "Move Whole milk, 3.5% fat up"` in the new Label in Name test (IngredientTable.creating.test.jsx).

## Results

- `npm --prefix app test`: 4237 passed in 130 files (4235 before, plus the 2 new tests).
- Filtered Task 1 run: 219 passed in 4 files.
- Both negative greps over app/src: 0 lines. Diff of CreationSteps.jsx and IngredientTable.jsx from db1b2c06: only aria-label lines (3 out, 3 in each).
- Nothing built; nothing under app/dist is newer than the plan file.

## Deviations from Plan

None - plan executed exactly as written. The Task 2 RED run was made by temporarily restoring IngredientTable.jsx from HEAD (`git checkout -- <file>`, then copying the edited version back), since the source edit had been applied in the same pass as the test.

## Findings for Mark

- (a) The two neighbours pass the new case-insensitive check and are untouched: a row's Remove is named `remove <ingredient>`; a target's Remove is named `Step N, remove target i`.
- (b) The Add to step chooser (`IngredientTable.jsx` lines 274-281) fails the same test once a step has a lead-in: it reads `Step 1, Warm` but is named `Add Heavy cream, 36% fat to step 1`. A step with no lead-in reads `Step 2`, which the name contains. It is not one of the five, so it is unchanged.
- (c) The sketch 014 snapshots, `.planning/canvas-generators/p11.py`, the generated P11 boards, sketch 014's README ("For the plan" 2) and CONTRACT.md still carry the old names.

No Mark's List row added; the orchestrator writes rows.

## Known Stubs

None.

## Threat Flags

None.

## Self-Check: PASSED

Both commits are ancestors of HEAD; all six modified files exist; four of six files named in the plan were touched by task 1 and three by task 2 (CreationStructure.test.jsx by both).
