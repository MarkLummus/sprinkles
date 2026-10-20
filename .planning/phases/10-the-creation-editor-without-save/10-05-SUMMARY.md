---
phase: 10-the-creation-editor-without-save
plan: 05
subsystem: ui
tags: [react, creation-editor, before-you-start, headnote, board-conformance, webkit]

requires:
  - phase: 10-the-creation-editor-without-save
    provides: 10-01 board engine and strict walk; 10-02 creation editor spine (CreationPage over RecipeSheet in mode creating); 10-11 draft row at load and page notices
provides:
  - addNote, updateNote, removeNote on a create draft (domain/creation.js)
  - RecipeSheet creating mode for everything above the table: Before you start always drawn, a beforeFoot slot, the Balance only once there are figures
  - NoteList editable while creating; Headnote draws no empty prose while creating; the six rules out of the tab order while creating
  - Add note with focus into the new note, remove with focus to Add note
  - the editor band and add-control rules in notebook.css (.mk-add-row, .mk-add, mk-page measure and log padding, 723.98 stretch, coarse floor)
  - 10-board-editor.mjs, the WebKit spec for creation-editor.html panels eA1 and eB1
affects: [10-06, 10-07, 10-08, 10-09, 10-10]

actuals:
  tokens: 6000
  tasks: 3
  commits: 3

plan_head_before: 496dee227c800e2d3226db4e09e7ef3beb155e29
commits: 3
plan_head_after: 5cd4bc8caf93ec3ab1c25ddef604acdb0dd4352d

tech-stack:
  added: []
  patterns:
    - "A handler leaves a focus request in a ref; an effect after the render finds the target in the page root and focuses it once, so focus never goes to a control not yet drawn"
    - "NoteList adapters take the list key first: (_listKey, index, text) and (_listKey, index), each a functional update over the previous draft"

key-files:
  created:
    - .planning/phases/10-the-creation-editor-without-save/10-board-editor.mjs
  modified:
    - app/src/domain/creation.js
    - app/src/domain/creation.test.js
    - app/src/ui/RecipeSheet.jsx
    - app/src/ui/RecipeSheet.test.jsx
    - app/src/ui/Authored.jsx
    - app/src/ui/Headnote.jsx
    - app/src/ui/FormulationNote.jsx
    - app/src/ui/CreationPage.jsx
    - app/src/ui/CreationFlow.test.jsx
    - app/src/styles/notebook.css

key-decisions:
  - "Focus rule (RESEARCH Open Question 7, a discretion call): an add moves focus into the item it added, a remove moves focus to that list's Add control. It is undrawn, changes nothing visible, and is named here for Mark"
  - "The side-region (Balance and Watch for together) is drawn while creating only when view.figures is non-empty; the whole region goes, not only the Balance, since the plan's condition wraps the one div"

patterns-established:
  - "10-board-editor.mjs: full-page panels eA1 and eB1 name no anchor; later plans extend the same spec"

requirements-completed: [MAKE-05, MAKE-08]

duration: 25min
completed: 2026-10-20
status: complete
---

# Phase 10 Plan 05: Before you start, the headnote and the band, measured against sketch 013 Summary

**While creating, a maker adds, writes and removes Before you start notes (kept with the draft and back on Resume), the Sheet draws only the name, the written description and no bare Balance, and panels eA1 and eB1 match sketch 013 at 1366 in WebKit with 72 PASS and 0 FAIL.**

## Performance

- **Duration:** about 25 min
- **Completed:** 2026-10-20
- **Tasks:** 3 (one tracer, two auto)
- **Files:** 1 created, 10 modified

## Accomplishments

- `domain/creation.js`: `addNote`, `updateNote`, `removeNote`, each returning a new draft with a new `beforeYouStart` array; an index outside the list throws a RangeError (a caller bug); an empty note stays.
- `RecipeSheet.jsx`: `beforeRegionShown` includes mode `creating`; new `beforeFoot` prop rendered last inside the before-region section; the side-region is drawn while creating only with figures. The other pinned expressions and the markers are untouched.
- `Authored.jsx`: NoteList's field branch applies while developing or creating (local renamed `editable`).
- `Headnote.jsx`: no `p.headnote__prose` while creating with a blank description; `FormulationNote.jsx`: `tabIndex` -1 while creating.
- `CreationPage.jsx`: note handlers taking NoteList's own arguments, list key first, each a functional update; `p.mk-add-row > Button.text-control.mk-add` "Add note"; an effect with a ref on the page root focuses the new note's textarea after an add and Add note after a remove.
- `notebook.css`: `.notebook .mk-add-row`, `.notebook .mk-add`, `.notebook.mk-page .notebook-recipe__form` (max-width `--measure-prose`), `.notebook.mk-page .notebook-log` (padding-top 0), the stretch rule inside the existing 723.98 block, the `.mk-add` touch floor inside the existing coarse block. Still six `@media` blocks, every value a token.
- `10-board-editor.mjs`: panels eA1 and eB1, full pages with no anchor, eA1 declaring `.headnote__prose`, `.side-region`, `.method-region` absent.

## Task Commits

1. **Task 1 (tracer): Add note, write it, remove it, and it comes back on Resume** - `3439af7e` (feat)
2. **Task 2: the creation Sheet reads as the board draws it** - `589a55e2` (feat)
3. **Task 3: the editor band and the add controls, measured in WebKit** - `5cd4bc8c` (feat)

## Verification Run

- `npm --prefix app test`: 116 files, 3573 tests, all green (10-11 left 3551).
- Task 1 verify (creation, CreationFlow, Authored, RecipePage, RecipePage.shell, tabindex-scan): 301 passed. Red seen for the three note functions before they were written. Tracer gate: Task 1's verify was green before Task 2 began.
- Task 2 verify (RecipeSheet, Headnote, FormulationNote, RecipePage, RecipePage.shell, CreationFlow): 274 passed.
- Style suites (`src/styles`): 378 passed.
- Board run over eA1 and eB1 against a scratch build: `72 PASS, 0 FAIL`; with `--selftest`, `PASS selftest eA1` and `PASS selftest eB1` (a run with every font at 1 px fails) and `74 PASS, 0 FAIL`.
- `10-walk-check.sh`: `MATCH 94 snapshots`.
- Acceptance greps: `beforeRegionShown` expression 1; `{beforeFoot}` 1; the three note exports 3; `(_listKey, index, text) =>` 1 and `(_listKey, index) =>` 1; `setCreateDraft((prev) =>` 4; `mode !== 'creating' || view.figures.length > 0` 1; `mode === 'creating'` in FormulationNote 1; the three pinned component tags 3; `@media` count 6; `^\.notebook \.mk-add {` 1; `.notebook.mk-page .notebook-recipe__form` 1.
- Evidence pair for eB1 viewed (app beside board): everything above the Ingredients table is identical; the table, Balance and log column are the board's later plans.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] The worktree had no app/node_modules**
- Untracked symlink `app/node_modules` to the main checkout's (gitignored). No package installed.

### Notes

- **Focus rule, for Mark (undrawn, no visible change):** after Add note, focus is in the new note's textarea; after remove, focus is on Add note. It is the plan's discretion call (RESEARCH Open Question 7), so focus is never lost to the page when a control disappears. Plan 10-06 applies the same rule to the picker's landing.
- **Flow tests for the headnote and Balance rules live in RecipeSheet.test.jsx only.** The plan puts the headnote and Balance cases in Task 2's RecipeSheet.test.jsx; I did not duplicate them in CreationFlow.test.jsx, so Task 1's commit stays green before the Task 2 source changes.
- **Whole side-region omitted, not only the Balance.** The plan's condition wraps the one `div.side-region`, which also holds Watch for; with no figures there is nothing to watch for either. The board's eA1 draws neither (declared absent and compared).
- **First board run passed with no fix.** No FAIL to classify, so nothing was adjusted to the engine or fixture; no app rule takes a value the board does not hold.
- **Heavy Bash redirection tools were declined by the sandbox in places** (long heredocs); the same edits were made through Edit and short scripts. No effect on the result.

## Authentication Gates

None.

## Known Stubs

None added by this plan. The empty `aside.notebook-log` and the Sheet with no rows ("This version has no ingredient rows.") noted in 10-02's SUMMARY remain for plans 10-06 and 10-08. `.planning/WINDOWS.md` was not touched (the ledger command is not available to this agent).

## Deferred Human Verification

- Open the built `/notebook/new` (a creation named Vanilla, with a description and two notes) in Safari or Playwright WebKit at 1366 beside sketch 013 panels eA1 and eB1. The measured comparison passes (boxes, fonts, colours, borders, text); the plan names a side-by-side look for what the measurement does not cover. For the first look at eB1 only the part above the table is comparable until plan 10-07.

## Threat Flags

None. Notes and the description render as React text children and textarea values; tests cover a note holding angle brackets in the field, in a creating Sheet and in a reading Sheet (T-10-15). Every change keys on mode `creating`, and the pinned expressions, the markers and the strict walk hold (T-10-16).

## Self-Check: PASSED

- Created files exist: 10-board-editor.mjs, this file.
- Commits `3439af7e`, `589a55e2` and `5cd4bc8c` are ancestors of HEAD.
