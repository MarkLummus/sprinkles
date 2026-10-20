---
phase: 10-the-creation-editor-without-save
plan: 03
subsystem: ui
tags: [react, notebook, new-recipe-entry, same-name-warning, board-conformance, webkit]

requires:
  - phase: 10-the-creation-editor-without-save
    provides: 10-01 board engine (10-board-check.mjs) and strict walk; 10-02 the entry, Start and the draft row; 10-11 the draft row at load and the page notices
provides:
  - RECIPE_NAME_TAKEN and recipeNameTaken in domain/recipe.js
  - the Notebook entry's one line under Name (required sentence or same-name warning), aria-wired
  - Start that writes one draft per press and whose move into the editor is withdrawn by an entry Cancel or by leaving the place
  - the .nb__ entry and draft-row rules in shell.css under .place, inside the existing place media blocks
  - 10-board-notebook.mjs, nine full-page panels held to notebook-new-recipe.html
affects: [10-04, 10-10, 10-12]

actuals:
  tokens: 7500
  tasks: 2
  commits: 3

plan_head_before: 496dee227c800e2d3226db4e09e7ef3beb155e29
commits: 3
plan_head_after: 8eca4fa47838cd997b183f853687565a6a89c25a

tech-stack:
  added: []
  patterns:
    - "A pending start is three refs in the place (starting, withdrawn, mounted); the write is never withdrawn, only the move"
    - "One field-owned line (FieldFeedback) shows the required sentence or the same-name warning, never both"

key-files:
  created:
    - .planning/phases/10-the-creation-editor-without-save/10-board-notebook.mjs
  modified:
    - app/src/domain/recipe.js
    - app/src/domain/recipe.test.js
    - app/src/ui/NotebookPlace.jsx
    - app/src/ui/NotebookPlace.test.jsx
    - app/src/styles/shell.css

key-decisions:
  - "The in-flight guard, the withdrawn ref and the mounted ref live in NotebookPlace (not NotebookHead), so a head that remounts cannot lose them; the head only reports Cancel through an onCancel prop on NotebookList"
  - "aria-invalid is set for the required sentence only; the same-name warning sets aria-describedby alone (it is a warning, Start still starts)"

patterns-established:
  - "10-board-notebook.mjs: steps are plain Playwright functions run on the app side only; every panel full page, no anchor"

requirements-completed: [MAKE-04]

duration: 25min
completed: 2026-10-20
status: complete
---

# Phase 10 Plan 03: The Notebook entry says and looks as sketch 013 draws it Summary

**A blank name is refused with "Enter a recipe name.", a taken name is warned of and still starts, Start writes one draft per press, and the entry, title row and draft row match notebook-new-recipe.html in WebKit at 1366 and 393 (145 PASS, 0 FAIL).**

## Accomplishments

- `domain/recipe.js`: `RECIPE_NAME_TAKEN` (the board's words) and `recipeNameTaken(recipes, name)`: an array scan comparing the trimmed, lower-cased name with each string recipe name, code unit for code unit (no accent folding, no normalisation); a blank name and non-string names never match; `__proto__` is only compared.
- `NotebookPlace.jsx`: the entry keeps a `required` flag (set by Start over a blank name, cleared by the next keystroke). The line under Name is the required sentence while the flag is set, else the same-name warning, rendered through `FieldFeedback` with id `nb-new-name-error`; the input carries `aria-describedby` while a line shows and `aria-invalid="true"` for the required sentence only. Start reaches `onStart` only through the form's submit (click and Enter are one path).
- Start's lifetime: a `startingRef` guard makes presses while the write is out write nothing; the entry's Cancel sets `withdrawnRef`; `mountedRef` is cleared on unmount. When the write resolves the place navigates to `/notebook/new` only if neither is set; a withdrawn start in a place still shown puts the written record into the draft state (draft row with Resume in place of New recipe); a left place does nothing and the next visit reads the draft (10-11). A rejected write announces `PAGE_LOAD_ERROR` in the page notice only while the place is shown and leaves the entry open.
- `shell.css`: `.place .nb__head`, `.nb__head .place__title`, `.nb__new`, `.nb__new .notebook-field`, `.nb__new-actions`, `.nb__draft` (+ rail, name, meta), `.nb__draft-act`, `.nb__drafts` (with the list reset the board draws inline) and `.nb__drafts .nb__draft:first-child`, plus the stacked `.nb__draft` and `.nb__draft-act` inside the existing 759.98 places block. Five `@media` blocks, no new radius, every value a token.
- `10-board-notebook.mjs`: nine full-page panels (nA1, nA2, nB1, nB2, nC1, nC2, nD1 at 1366 or 393, nE1, nD2) with the plan's steps, elements and declared absences. The rejected "Option B · several drafts" panel is not a target.

## Task Commits

1. **Task 1 (tracer), RED: tests for the same-name check and the entry** - `33d7e6f1` (test)
2. **Task 1 (tracer), GREEN: the entry refuses, warns and starts once** - `70f85b04` (feat)
3. **Task 2: the entry and draft-row rules, measured in WebKit** - `8eca4fa4` (feat)

## Verification Run

- RED confirmed before the implementation: 6 of the 10 recipe cases and 7 of the 11 new entry cases failed.
- `npm --prefix app test`: 116 files, 3568 tests, all green (before this plan: 3551).
- Task 1 verify (recipe, NotebookPlace, CreationFlow, tabindex-scan): 113 passed, run green before Task 2 began (tracer gate).
- `npm --prefix app test -- src/styles`: 8 files, 378 tests green; shell.test.js and tokens.test.js untouched.
- Board run over a scratch build (`10-board-check.mjs 10-board-notebook.mjs`): `145 PASS, 0 FAIL` on the first run, no CSS adjustment needed. With `--selftest` (every font at 1 px) each of the nine panels produced a FAIL, so the spec bites: `154 PASS, 0 FAIL`.
- `sh 10-walk-check.sh`: `MATCH 94 snapshots`.
- Acceptance greps: `@media` in shell.css 5; `^\.place \.nb__head {` 1; `^\.place \.nb__draft {` 1; bare `.nb__`/`.pc1366`/`.pc393` selectors 0; `nE2` in the spec 0; `RECIPE_NAME_TAKEN` export line 1; `export function recipeNameTaken` 1; `recipeNameTaken(` in NotebookPlace.jsx 1; `nb-new-name-error` 2; `type="submit"` 1.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] The worktree had no app/node_modules**
- Untracked, gitignored symlink to the main checkout's; no package installed.

### Notes

- **Test and implementation committed separately.** The tracer is `tdd="true"`, so the RED commit (`33d7e6f1`) precedes the GREEN one; the plan asked for one task commit, this gives two for Task 1.
- **Board comparison passed without any measure-then-edit loop.** No FAIL arose, so no fixture or engine difference needed classifying; nothing was patched.
- **Human check not run.** The plan's `human-check` (Safari or WebKit side by side with the visited links, five states at both widths) is left for Mark or the phase UAT; the engine covers boxes, fonts, colours and borders, as the plan says, not every visual detail.
- A start that finds an existing create draft (D-04b) sets the draft state even when the place has since been left; React ignores it on an unmounted component. Not guarded because it is harmless.

## Authentication Gates

None.

## Known Stubs

None added by this plan.

## Threat Flags

None. T-10-10 (array scan, typed text never a key), T-10-11 (ref guard, tested with two presses plus a submit) and T-10-29 (two deferred-write tests) are mitigated and tested.

## Self-Check: PASSED

- Created and modified files exist: 10-board-notebook.mjs, recipe.js, recipe.test.js, NotebookPlace.jsx, NotebookPlace.test.jsx, shell.css, this file.
- Commits `33d7e6f1`, `70f85b04` and `8eca4fa4` are ancestors of HEAD.
