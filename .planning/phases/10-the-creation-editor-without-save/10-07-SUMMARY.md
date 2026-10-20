---
phase: 10-the-creation-editor-without-save
plan: 07
subsystem: ui
tags: [react, creation-editor, grams-message, board-conformance, webkit]

requires:
  - phase: 10-the-creation-editor-without-save
    provides: 10-01 board engine; 10-05 creating mode and 10-board-editor.mjs panels eA1/eB1; 10-06 creation rows, renderCreatingEntry, creationRows contract
provides:
  - gramsDraftMessage(ingredientName, raw) in domain/lineage.js, read by findBlockedRow and the creating table
  - per-row, blur-timed grams message in IngredientTable's creating branch (own error id per row)
  - IngredientTable.creating.test.jsx, a stateful harness driven by input events and blurs
  - the table and remove panels (eA1, eB1 additions; eC1, eC2) in 10-board-editor.mjs
affects: [10-08, 10-10, 10-12]

actuals:
  tokens: 12000
  tasks: 2
  commits: 2

plan_head_before: 6d45048ace8e228a13ca6413fe29a6c8967494fb
commits: 2
plan_head_after: 408af3844620a58f90da2c2decbed37beecdc96a

tech-stack:
  added: []
  patterns:
    - "A creating row's line is derived at render from its current text, gated by a Set (keyed by row id) that a blur fills and a readable change empties, so typing never raises a line"
    - "Cropped board panels name anchor .notebook-body__sheet and measure from it"

key-files:
  created:
    - app/src/ui/IngredientTable.creating.test.jsx
  modified:
    - app/src/domain/lineage.js
    - app/src/domain/lineage.test.js
    - app/src/ui/IngredientTable.jsx
    - .planning/phases/10-the-creation-editor-without-save/10-board-editor.mjs

key-decisions:
  - "The pen's save gate and the creation table read the two grams sentences from one function, gramsDraftMessage; blockedSaveMessage returns exactly what it did"
  - "The per-row Set lives in IngredientTable (component state), not CreationPage, so creationRows' contract (10-06) is unchanged"

requirements-completed: [MAKE-06]

duration: 25min
completed: 2026-10-20
status: complete
---

# Phase 10 Plan 07: Per-row grams message and the creation table held to sketch 013 Summary

**A creation row whose grams field is left empty or unreadable says so under its own name, with the version pen's own sentence, once focus leaves it; the next readable value clears it, and typing never raises one. The creation table and Remove match sketch 013 at 1366 in WebKit: 216 PASS, 0 FAIL over eA1, eB1, eC1, eC2.**

## Accomplishments

- `domain/lineage.js`: `gramsDraftMessage(ingredientName, raw)` returns "<Name> needs an amount, or remove it" for blank/undefined, "<Name>'s amount is not a number" for what `parseGramsDraft` rejects, else `null`. `findBlockedRow` now builds its message through it; the sentence text still lives in one place. The 102 lineage tests (the pen's existing `blockedSaveMessage` cases among them) pass unchanged, and the new function has its own table of cases.
- `IngredientTable.jsx` (creating branch): a `Set` of row ids left unreadable in component state. Blur adds a row when `gramsDraftMessage` is non-null (then calls `creationRows.onBlurGrams`); a change that reads empties it; the line is derived at render from the field's current text for rows in the Set. A row showing a line has `<FieldFeedback>` ending its name cell (id `create-grams-error-<row id>`), the input `aria-invalid` and `aria-describedby` that id, and the `tr` class `is-marked`. The pen's `ingredient-field-error` id is not used.
- `IngredientTable.creating.test.jsx`: a harness holding the draft in state, projecting through `creationSheetVersion` each render, changing grams only via the native value setter plus an `input` event, and leaving via `focus()`/`blur()`. Seven cases: no line before a blur; the pen sentence, aria and is-marked after a blur with `onBlurGrams(rowId)`; two rows' lines at once with distinct ids and no `#ingredient-field-error`; clear on a readable value with the other row's line kept; typing an unreadable value stays silent until the next blur; and no strike, rows kept, shares ("100.0%", "trace") and total reading the projection at 0 g.
- `10-board-editor.mjs`: eA1 gains the no-rows sentence and Add ingredient; eB1 gains the board's five rows and the table elements plus the Balance figures' count and text; new cropped panels eC1 and eC2 (anchor `.notebook-body__sheet`, eB1's draft; eC2 presses remove on Skim milk powder's row and reads four rows left, Milk solids 6.6%).

## Task Commits

1. **Task 1 (tracer): a grams field left empty or unreadable says so under its own row** - `c1603583`
2. **Task 2: the creation table and Remove match sketch 013, measured in WebKit** - `408af384`

## Verification Run

- Red seen first: the new `gramsDraftMessage` cases failed (9) before the function existed; the creating test's clear/blur cases failed (5 of 7) before the table change.
- Tracer gate: Task 1's verify (lineage, creating, IngredientTable, remove, RecipePage.drafts) green, 268 passed, before Task 2 began.
- `npm --prefix app test`: 118 files, 3646 tests, all green (10-06 left 3630).
- Board run (scratch build, Playwright WebKit, coarse pointer): `216 PASS, 0 FAIL`; no `anchor:` FAIL for eC1 or eC2.
- `10-walk-check.sh`: `MATCH 94 snapshots`.
- Acceptance greps: `export function gramsDraftMessage` 1; "needs an amount, or remove it" 1 in lineage.js; `gramsDraftMessage(` 3 in IngredientTable.jsx; `create-grams-error-` 1; `eC1|eC2` and `skimMilkPowder` and `.notebook-body__sheet` present in the spec.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] The worktree had no app/node_modules**
- Untracked symlink to the main checkout's (gitignored). Nothing installed.

### Notes

- No FAIL appeared in the board run, so no table markup or CSS needed a fix: the 10-06 creating row already matched the board. No app CSS was touched and notebook.css, CreationPage.jsx and the picker files were not edited.
- The plan's cases said an empty row's share reads the projection; with the total at 0 g the cell reads an em dash and a 0 g row beside a nonzero total reads "trace" (the existing `formatShareOfBatch` words). The test asserts those, not a literal "0%".
- Deferred per the plan's ledger: a 309-digit amount shows no line while it counts as 0 g (the shared `parseGramsDraft` is the pen's too).
- The board build for the check went to the session scratchpad, not `$TMPDIR/sprinkles-10`, so the sibling plan's scratch dir is not touched; the walk check uses its own per-checkout dir.

## Authentication Gates

None.

## Known Stubs

None. `.planning/WINDOWS.md` untouched (ledger command not available to this agent).

## Deferred Human Verification

- Open the built `/notebook/new` holding the five rows in Safari or Playwright WebKit at 1366 beside `.planning/sketches/013-creation-editor/creation-editor.html` panels eB1, eC1 and eC2, press remove on Skim milk powder, and confirm the row is gone and Milk solids reads 6.6% (the plan's human-check; measurement covers boxes, fonts, colours and text, not every visual detail).

## Threat Flags

None. Row ids (minted UUIDs from 10-06) are used as a Set member and inside an `id` attribute React escapes; the ingredient name reaches the sentence as text (T-10-20).

## Self-Check: PASSED

- Created: app/src/ui/IngredientTable.creating.test.jsx, this file.
- Commits `c1603583` and `408af384` are ancestors of HEAD.
