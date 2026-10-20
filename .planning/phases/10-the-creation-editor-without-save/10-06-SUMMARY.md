---
phase: 10-the-creation-editor-without-save
plan: 06
subsystem: ui
tags: [react, creation-editor, ingredient-picker, library, focus]

requires:
  - phase: 10-the-creation-editor-without-save
    provides: 10-02 creation spine and creationSheetVersion; 10-05 creating mode, beforeFoot, .mk-add-row and .mk-add, post-render focus rule
provides:
  - addRow, setRowGrams, removeRow on a create draft (domain/creation.js), and creationSheetVersion's finite grams reading
  - IngredientPicker (head with Cancel, library list A to Z, Add on each row)
  - IngredientTable creating branch (creationRows prop, renderCreatingEntry, isCreating)
  - RecipeSheet creationRows and ingredientsFoot props
  - CreationPage library load shared by picker and projection, picker state, focus landings, failed-library branch
affects: [10-07, 10-08, 10-09, 10-10, 10-12]

actuals:
  tokens: 16000
  tasks: 2
  commits: 2

plan_head_before: 623f0ee84fb8d5971f45f30d96968cd79cd0309e
commits: 2
plan_head_after: 18d58bb1ff0ebbcc013116c8865088bffda7a22a

tech-stack:
  added: []
  patterns:
    - "One focus request ref with named targets ('new-note', 'add-note', 'ingredient-target'); the page-level effect resolves the target after the render that drew it"
    - "A row just added is focused by the table's own effect keyed on creationRows.focusRowId, through the existing gramsInputsRef map"

key-files:
  created:
    - app/src/ui/IngredientPicker.jsx
  modified:
    - app/src/domain/creation.js
    - app/src/domain/creation.test.js
    - app/src/ui/IngredientTable.jsx
    - app/src/ui/RecipeSheet.jsx
    - app/src/ui/RecipeSheet.test.jsx
    - app/src/ui/CreationPage.jsx
    - app/src/ui/CreationFlow.test.jsx

key-decisions:
  - "Add note's focus selector narrowed from the first '.mk-add' to '.before-region .mk-add', since a second '.mk-add' (Add ingredient) now sits on the page"
  - "One 'ingredient-target' focus request serves both picker Cancel and remove: Add ingredient when drawn, else the picker's Cancel"

patterns-established:
  - "creationRows = { gramsByRow, focusRowId, onChangeGrams, onBlurGrams, onRemoveRow } is the one contract between CreationPage and the creating table; plan 10-07 adds the grams message to renderCreatingEntry"

requirements-completed: [MAKE-06]

duration: 25min
completed: 2026-10-20
status: complete
---

# Phase 10 Plan 06: Add, type and remove ingredient rows while creating Summary

**A maker picks library entries into the creation table, types grams (the draft keeps only the link and the raw text) and removes rows outright, with the Balance following every keystroke; a 309-digit paste reads as 0 g instead of throwing.**

## Accomplishments

- `domain/creation.js`: `addRow` (row ends last with one `{ step: 1, grams: '' }` portion; empty or duplicate id throws), `setRowGrams` (kept as typed), `removeRow` (order kept); unknown row ids throw a RangeError. `creationSheetVersion` passes `parseGramsDraft(raw)` on only when `Number.isFinite`, else 0, so an Infinity-sized amount stays on the table at 0 g.
- `IngredientPicker.jsx`: `div.pick[role=group][aria-label="Add ingredient"]` with head (caption and Cancel) and an A to Z list from `filterLibrary`; every button is `ui/Button`. Filters, count, summaries, Added and "Not in the library yet" are plan 10-12's.
- `IngredientTable.jsx`: `creationRows` prop; `isCreating` beside the unchanged `isDeveloping` (every `draftVersion` read stays gated on `isDeveloping`); `renderCreatingEntry` draws the board's row (raw grams field with ' g', name with its flag, `remove`, live share); the table's class adds `is-developing` through `isDeveloping || isCreating`; an effect keyed on `focusRowId` focuses the new row's field once.
- `RecipeSheet.jsx`: `creationRows` and `ingredientsFoot` props; one `<IngredientTable` still.
- `CreationPage.jsx`: library read once through `repository.listLibrary()`, shared by the picker and the projection; the page notice alone while it loads; on a failed read the band with Cancel stays and `div.not-found > p` carries PAGE_LOAD_ERROR in place of the Sheet and log column. Pick mints `freshId()` in the handler. Every draft change is a functional update.
- Focus: pick puts focus in the new row's empty field (class `mk-focus`); picker Cancel and remove both ask for `'ingredient-target'`, landed after the render that drew it (Add ingredient, or the picker's Cancel while the picker is open).

## Task Commits

1. **Task 1 (tracer): Add ingredient, pick, type grams, and the Balance follows** - `5c8a1261`
2. **Task 2: remove deletes a row outright, and the creation row reads as the board draws it** - `18d58bb1`

## Verification Run

- Red seen first for addRow, setRowGrams, removeRow and the Infinity case (6 failing) before the domain code was written.
- Tracer gate: Task 1's verify (creation, draft, CreationFlow, IngredientTable, IngredientTable.remove, RecipePage.shell, tabindex-scan) was green, 377 passed, before Task 2 began.
- `npm --prefix app test`: 117 files, 3630 tests, all green (10-05 left 3573).
- `10-walk-check.sh`: `MATCH 94 snapshots`.
- Acceptance greps: `creationRows={creationRows}` 1, `<IngredientTable` 1, `function renderCreatingEntry` 1, the `isCreating` and `isDeveloping` lines 1 each, `repository.listLibrary()` 1 in CreationPage, `freshId()` only inside the pick handler, `<button` 0 in IngredientPicker, `export function removeRow` 1, `creationRows.onRemoveRow(row.id)` 1.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] The worktree had no app/node_modules**
- Untracked symlink to the main checkout's (gitignored). Nothing installed.

**2. [Rule 1 - Bug] Add note's focus selector would have hit Add ingredient**
- **Found during:** Task 1 (a second `.mk-add` now exists on the page)
- **Fix:** plan 10-05's effect selected the first `.mk-add`; it now selects `.before-region .mk-add`.
- **Files modified:** app/src/ui/CreationPage.jsx
- **Commit:** `5c8a1261`

### Notes

- `removeRow` and its domain tests landed in Task 1's commit rather than Task 2's, since the domain test file was written once; Task 2's grep for it (baseline 0) reads 1 from the Task 1 commit on. No behaviour differs.
- `IngredientPicker` is passed `addedIds` by the page but does not read it (the plan lists it in the signature for 10-12); it is left out of the destructuring so nothing is unused.
- No CSS was added (the plan adds none): the picker has no `.pick` rules and `.mk-focus` has no outline until plan 10-12, so on screen the picker and the new row's focus ring are unstyled by design.
- The failed-library tests set `listLibrary` to reject persistently (StrictMode runs the load effect twice, so a once-only rejection would be consumed by the cancelled first run) and restore the stand-in in `finally`.

## Authentication Gates

None.

## Known Stubs

None. The picker's missing filters and states and the missing picker and `.mk-focus` rules are named plan 10-12 work, not stubs of this plan's goal. `.planning/WINDOWS.md` untouched (ledger command not available to this agent).

## Deferred Human Verification

- Open the built `/notebook/new` in Safari or Playwright WebKit and walk Add ingredient, a pick, typing grams and remove beside sketch 013 panels eB1 and ingredient-picker kB2. The picker is unstyled until 10-12, so only the table rows are comparable now.

## Threat Flags

None. Entry names render as React text; no `dangerouslySetInnerHTML`; row ids come from `freshId()` in the pick handler and per-row values live in Maps keyed by row id (T-10-18); a missing entry is skipped, an Infinity amount reads as 0 g, and a failed library read keeps the band and Cancel (T-10-17).

## Self-Check: PASSED

- Created: app/src/ui/IngredientPicker.jsx, this file.
- Commits `5c8a1261` and `18d58bb1` are ancestors of HEAD.
