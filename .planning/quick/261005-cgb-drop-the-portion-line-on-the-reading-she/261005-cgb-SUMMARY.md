---
phase: quick-261005-cgb
plan: 01
quick_id: 261005-cgb
subsystem: ui
tags: [reading-sheet, print, ingredient-table, per-step]
requires: []
provides:
  - "Reading Sheet (and print) draws no portion line for a split ingredient with exactly one line still in"
affects: [app/src/ui/IngredientTable.jsx]
key-files:
  modified:
    - app/src/ui/IngredientTable.jsx
    - app/src/ui/IngredientTable.test.jsx
    - app/src/ui/RecipePage.perStep.test.jsx
decisions:
  - "Count lines still in through liveRow (activeRows), not a second is-this-line-in rule; recording keeps the stored count"
metrics:
  tasks: 2
  files: 3
  tests: "1840 passed, 63 files"
status: complete
commits: 3
plan_head_before: 21e837a
plan_head_after: 949cf3f
actuals:
  tokens: 6000
  tasks: 2
  commits: 3
---

# Quick 261005-cgb: Drop the portion line when one line is left

One expression in `renderReadingEntry` now decides the portion line from the lines still in, so a split ingredient with one line left reads like a one-line row in the reading Sheet and in print.

## What changed

In `app/src/ui/IngredientTable.jsx`, `renderReadingEntry`: `liveRow` (from `baselineActiveById`, which is built by `activeRows`) is declared first, and `isSplit` became `(mode === 'recording' ? row : liveRow).portions.length > 1`. `liveRow` is used because `activeRows` already honours both a line's own `removed` flag and its step's removal through `isLineRemoved`. A row whose other line went with a removed step is counted the same as one whose line was removed alone, with no second rule. Recording shares this branch and keeps the stored count as built, since as made with a line out is still open for Mark (03.6-CONFORMANCE.md "Open for Mark" item 2). Show changes and pen `isSplit` lines (two occurrences of `row.portions.length > 1`), `multiPortion`, `rowAccessibleLabel`, `formatPortionLine`, rows.js and all styles are untouched. Print needed no change: `@media print` has no portion-line rule.

## Commits

- 07b01c7 `test(261005-cgb)`: pin no portion line when a split ingredient has one line left (cases A-F)
- 96a31f7 `feat(261005-cgb)`: drop the portion line when a split ingredient has one line left
- 949cf3f `test(261005-cgb)`: update the removed-step reading case to the one-line-left rule (deviation, below)

## Test cases and RED results

RED run before the feat commit: A, B, E failed; C, D, F passed.

- A (IngredientTable, reading, milk Step 2 out): FAIL. Name cell contained the portion note, `Whole milk<chip><span class="ingredient-table__portion-note">250.4 g of 250.4 g · 36.8% in all</span></td>`, so the expected name-cell markup was not found.
- B (IngredientTable, Gum slurry removed): FAIL. `expected ... not to contain 'ingredient-table__portion-note'`; Whole milk drew `250.4 g of 250.4 g · 37.6% in all`.
- C (guard, reading, every line in): pass. Both milk lines keep `120 g of 370.4 g` and `250.4 g of 370.4 g`.
- D (guard, recording, milk Step 2 out): pass. Portion line `250.4 g of 250.4 g · 36.8% in all` and field name `Whole milk, as made, grams, portion 2` stay. Comment notes this pin may change when Mark decides Open for Mark item 2.
- E (RecipePage.perStep, saved child reading state): FAIL. `expected <span class="ingredient-table__portion-note"> ... to be null`.
- F (RecipePage.perStep guard, v1 at rest): pass.

## Deviations from Plan

**1. [Rule 1 - Bug/stale pin] An existing case asserted the old behaviour**
- **Found during:** Task 1 GREEN run (the plan said all existing cases must pass unchanged).
- **Issue:** `IngredientTable.test.jsx` "draws no line of a removed step in the reading state, and no Unallocated head for it (plan 03.6-05)" asserted `5 g of 5.0 g · 100.0% in all` for a row left with one line after step 2 was removed. That is exactly the case the plan's truth 3 says must now have no portion line.
- **Fix:** replaced that one assertion with no portion note, the plain `Row A, 5 g` label, and kept the Unallocated, step-head and tfoot assertions.
- **Commit:** 949cf3f. It is a separate test commit because the feat commit was already made when the failure surfaced (my commit step was chained after a pipe that hid the test exit code). 96a31f7 therefore sits on a red suite for one commit; HEAD is green.

## Verification

- `npm --prefix app test`: 63 files, 1840 tests, all pass (includes tabindex-scan).
- `npm --prefix app run build`: exit 0.
- `git status --porcelain -- app/`: empty. `git diff --name-only 21e837a..HEAD` lists only the three planned app/src/ui files. Nothing under app/src/styles, .impeccable, DESIGN.md, PRODUCT.md or .planning/sketches changed. The staged todo rename, CLAUDE.md, .planning/state.json and the untracked files are as they were. Nothing pushed.

## Notes

- 03.6-CONFORMANCE.md "Open for Mark" item 1 and sketch 011 README decision 51's "Not drawn" sentence still describe the earlier build. This quick edited neither, because the README is Impeccable's and out of scope; whoever owns them updates them.
- Recording still draws the portion line with one line left, as scoped. That rides on Open for Mark item 2.

## Known Stubs

None.

## Not verified

iPad (1366), iPhone (393) and browser print preview were not exercised. Static-markup and jsdom tests only.

## Deferred Human Verification

Suggested checks for Mark's List row per-step-one-line-left. Serve with `npm --prefix app run build && npm --prefix app run preview -- --host`, never the dev server. On the iPad (1366) and the iPhone (393): open Olive Oil v1, press Next version, remove Whole milk's Step 2 line, save, and confirm the saved version's Sheet reads Whole milk once with no "of 250.4 g" line under it while Sucrose keeps both of its lines. Then open the browser's print preview and confirm the same.

## Self-Check: PASSED

Commits 07b01c7, 96a31f7, 949cf3f exist; the three modified files exist.
