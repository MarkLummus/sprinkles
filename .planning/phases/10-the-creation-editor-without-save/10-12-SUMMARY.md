---
phase: 10-the-creation-editor-without-save
plan: 12
subsystem: ui
tags: [react, ingredient-picker, library, css, webkit, board-conformance]

requires:
  - phase: 10-the-creation-editor-without-save
    provides: 10-01 board engine; 10-05 creating mode and .mk-add rules; 10-06 bare IngredientPicker, addedIds prop, mk-focus class
provides:
  - IngredientPicker with Name, Category, the polite count, Clear filters, category and summary on each row, Added and "Not in the library yet"
  - summaryText and capitalised exported from IngredientsPlace.jsx
  - .mk-focus, .pick and the place's .ing__ filter rules re-homed under .notebook .pick in notebook.css
  - 10-board-picker.mjs (eight Sheet crops against ingredient-picker.html) and 10-picker-current.mjs (seeded library at 1366 and 393)
affects: [10-10]

actuals:
  tokens: 40000
  tasks: 2
  commits: 2

plan_head_before: 6d45048ace8e228a13ca6413fe29a6c8967494fb
commits: 2
plan_head_after: 0732dc4945f6219431372ee113cfa198f071a462

tech-stack:
  added: []
  patterns:
    - "The picker reuses the place's own matching (filterLibrary, libraryCategories) and words (summaryText, capitalised, ingredientCountWords); no second copy"
    - "A summary line joins only the parts it has, so an entry with no non-zero figure reads its category alone"

key-files:
  created:
    - app/src/ui/IngredientPicker.test.jsx
    - .planning/phases/10-the-creation-editor-without-save/10-board-picker.mjs
    - .planning/phases/10-the-creation-editor-without-save/10-picker-current.mjs
  modified:
    - app/src/ui/IngredientPicker.jsx
    - app/src/ui/IngredientsPlace.jsx
    - app/src/ui/CreationFlow.test.jsx
    - app/src/styles/notebook.css

key-decisions:
  - "Pressing an Added row is a no-op by omitting its onClick, with aria-disabled kept as the only signal (not the disabled attribute), as the board draws it"
  - "No @media block, token or literal was added; the stacking rule sits in the existing 723.98 block and the touch floor in the existing coarse block"

requirements-completed: [MAKE-06]

duration: 35min
completed: 2026-10-20
status: complete
---

# Phase 10 Plan 12: The ingredient picker finds, refuses and matches the board Summary

**The picker filters exactly as the Ingredients place does, reads Added for an entry already on the recipe and "Not in the library yet" for no match, and its eight board panels match ingredient-picker.html in WebKit with 886 PASS and 0 FAIL, with the seeded library working at both widths (14 PASS).**

## Accomplishments

- `IngredientPicker.jsx`: head with Cancel, then `form.ing__filters` (Name, Category with All first and a literal `tabIndex={0}` on the select), `p.ing__count` through `ingredientCountWords`, Clear filters while a filter is on (clears both and focuses Name), then either `ul.pick__list` or `p.pick__none` reading "Not in the library yet". Each row holds the name, a summary and Add or Added; an entry in `addedIds` gets `pick__row--added`, `aria-disabled="true"` and no handler. Opening the picker focuses Name. A name typed into the picker can never become a row.
- The row summary joins the capitalised category (only when it is a non-blank string) and `summaryText(entry)` with empty parts dropped, so an all-zero entry reads its category alone and an object category does not throw (T-10-28).
- `IngredientsPlace.jsx`: `summaryText` and `capitalised` exported; the place shows the same as before.
- `notebook.css`: `.notebook .mk-focus`, `.notebook .pick*` and the place's filter rules re-homed under `.notebook .pick`; the stacking rule in the existing 723.98 block, the touch floor for `.pick__head .text-control` and `.pick .ing__clear` in the existing coarse block. `@media` count stays 6; the `.pick__act` underline lives in notebook.css, not app.css.
- `10-board-picker.mjs`: kA1, kA2, kB1, kB2 at 1366 and kC1 to kC4 at 393, every panel anchored at `.notebook-body__sheet`, original 26-entry library, draft with the board's name, description, two notes and two rows. Positive and absent selectors by state: open three absent, filtered two, no match seven, after the pick four.
- `10-picker-current.mjs`: builds nothing, keeps the seeded library, seven checks at each width read from the store (count, a new entry by name, the longest name, every category, scrolling, Added, re-add).

## Task Commits

1. **Task 1 (tracer): the picker finds, refuses and adds as the Ingredients place does** - `eec88a07`
2. **Task 2: the picker and the landing row match sketch 013 in WebKit at 1366 and 393** - `0732dc49`

## Verification Run

- Tracer gate: Task 1's verify (IngredientPicker, IngredientsPlace, CreationFlow, seed-data-scan, tabindex-scan) 144 passed before Task 2 began; re-run after the comment edit.
- `npm --prefix app test`: 118 files, 3647 tests, all green (binder.test.js, cross-cutting.test.js and notebook.test.js unchanged).
- Board run over the eight panels against a scratch build: `886 PASS, 0 FAIL`, no FAIL, no "anchor:" line. With `--selftest` (the 1 px font re-run): all eight `PASS selftest kXn`, `894 PASS, 0 FAIL`.
- Absent PASS lines per panel: kA1 3, kA2 2, kB1 7, kB2 4, kC1 3, kC2 2, kC3 7, kC4 4.
- `10-picker-current.mjs`: 14 PASS, 0 FAIL (seven at 1366, seven at 393).
- `10-walk-check.sh`: `MATCH 94 snapshots`.
- Acceptance greps: `@media` 6; `^\.notebook \.pick__row {` 1; `\.notebook \.pick \.ing__filters` 2; `.notebook-body__sheet` in the spec 2; build/outDir words in non-comment lines of 10-picker-current.mjs 0; `export function summaryText|capitalised` 2; "Not in the library yet" 1; `tabIndex={0}` 1; `aria-disabled` 1.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] The worktree had no app/node_modules**
- Untracked symlink to the main checkout's (gitignored). Nothing installed.

None otherwise: the board comparison passed first time, so no FAIL needed classifying as build departure or fixture/engine difference, and no value was patched into app CSS. The Name field is focused on open in the app while the board's is static; the border, colour and outline checks on `.pick .ing__filters .ink-field` still matched.

## Authentication Gates

None.

## Known Stubs

None.

## Deferred Human Verification

- With the original 26-entry library, open the built `/notebook/new` in Safari or Playwright WebKit at 1366 and at 393 beside `.planning/sketches/013-creation-editor/ingredient-picker.html`: the picker open, 'milk' typed, a name not in the library, and Sucrose just added. Expected: each state matches its board panel (the box, the filters, the count and Clear filters, the rows with Add and Added, Not in the library yet, the new row's focused grams field with the Balance moved). The measurement covers boxes, fonts, colours, borders and outlines, not every visual detail.

## Threat Flags

None. Entry names and summaries render as React text; only a library record's own button calls `onPick`; a typed name that matches nothing adds nothing (T-10-19); a non-string category is dropped (T-10-28).

## Self-Check: PASSED

- Created: IngredientPicker.test.jsx, 10-board-picker.mjs, 10-picker-current.mjs, this file.
- Commits `eec88a07` and `0732dc49` are ancestors of HEAD.
