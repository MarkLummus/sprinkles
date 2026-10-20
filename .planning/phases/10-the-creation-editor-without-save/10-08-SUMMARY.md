---
phase: 10-the-creation-editor-without-save
plan: 08
subsystem: ui
tags: [react, creation-editor, style-menu, balance-bands, css, webkit, board-conformance]

requires:
  - phase: 10-the-creation-editor-without-save
    provides: 10-01 board engine; 10-05 creating mode and the empty Setup aside; 10-06 rows and grams; 10-12 picker and notebook.css/CreationFlow.test.jsx hand-off
provides:
  - creationTargets, applyStyle, clearStyle, setBandEnd (domain/creation.js); creationSheetVersion's targets from the typed bands
  - CreationSetup with the Style region (menu, serving temperature, six bands), mounted in aside.notebook-log
  - the Style region's rules in notebook.css
  - 10-board-style.mjs (fifteen cropped panels against style-menu-and-bands.html)
affects: [10-09, 10-10]

actuals:
  tokens: 9700
  tasks: 2
  commits: 2

plan_head_before: 232aa9dbcc4b6f1ed0d25bc5f7fd32b9bc171f50
commits: 2
plan_head_after: c969ed122dabc81a1d72a797e7d9bf3da7723285

tech-stack:
  added: []
  patterns:
    - "Every setup change is an updater over the newest draft (onChange((prev) => ...)), the value read first; CreationPage passes setCreateDraft straight through"
    - "A band reaches the Balance only through creationTargets: both ends parse via parseGramsDraft, are finite, low <= high"

key-files:
  created:
    - app/src/ui/CreationSetup.jsx
    - app/src/ui/CreationSetup.test.jsx
    - .planning/phases/10-the-creation-editor-without-save/10-board-style.mjs
  modified:
    - app/src/domain/creation.js
    - app/src/domain/creation.test.js
    - app/src/ui/CreationPage.jsx
    - app/src/ui/CreationFlow.test.jsx
    - app/src/styles/notebook.css

key-decisions:
  - "Band keys come from FIGURE_SPECS' targetKey list, imported by creation.js from figures.js, instead of a second literal list; setBandEnd also refuses an end other than 0 or 1"
  - "The serving temperature keeps MALFORMED_NUMBER_ENTRY only through readSignedInput; CreationSetup does not import the constant (nothing there reads it)"

requirements-completed: [MAKE-09]

duration: 30min
completed: 2026-10-20
status: complete
---

# Phase 10 Plan 08: The Style region fills the bands and the Balance reads them Summary

**Choosing a style in the creation editor fills the six bands and the serving temperature, edits and Clear leave the bands standing, and the Balance reads a band only when both its ends are finite numbers with low at or below high; the Style region matches sketch 013 in WebKit (953 PASS, 0 FAIL over fifteen panels).**

## Accomplishments

- `domain/creation.js`: `creationTargets` (both ends through `parseGramsDraft`, `Number.isFinite`, low <= high; a 309-digit end gives no key), `applyStyle` (the row's id, exactly its bands as `String` values so a band it leaves out is gone, its default temperature as a string or '' when not finite), `clearStyle` (style null, temperature '', bands untouched), `setBandEnd` (one end kept as typed, a band with two blank ends removed, a key outside the six or an end other than 0 or 1 throws a RangeError). `creationSheetVersion`'s targets are `creationTargets(draft)`.
- `CreationSetup.jsx`: `section.batch-row.mk-region` aria-label Style with the head (Clear only while a style is picked), the browser's own `select.ink-field.mk-menu` (No style first, then the catalog styles from `useCatalog()` in stored order, a literal `tabIndex={0}`), the signed temperature field (type number, step any, `readSignedInput` and `shownSignedValue` on change and input, a wheel blurs it, '°C' beside it) and six `div.mk-band` rows from FIGURE_SPECS with twelve band fields and no error state. Every mutation is an updater passed to `onChange`.
- `CreationPage.jsx`: `<CreationSetup createDraft={createDraft} onChange={setCreateDraft} />` inside `aside.notebook-log`.
- `notebook.css`: `.mk-region` (and head, first child), `.mk-body`, `.mk-field-row` (and its two field widths), `.mk-unit`, `.mk-menu-wrap`, `.notebook-log .mk-menu`, `.mk-band` family, and the coarse band-field floor inside the existing coarse block. `@media` count stays 6; no new token, no literal, no rule for the board's drawn open list.
- `10-board-style.mjs`: fifteen cropped panels. Style panels anchor `.mk-region[aria-label="Style"]`, Balance panels `.notebook-body__sheet`. Drafts hold each panel's starting state and steps do the caption's action (selectOption by label, fill, Clear). Clear is measured on the nine picked panels and declared absent on tA1 and tG1.

## Task Commits

1. **Task 1 (tracer): pick a style and its bands and temperature fill in and the Balance reads them** - `aa585d82`
2. **Task 2: the temperature keeps what the browser cannot read, and the Style region looks as sketch 013 draws it** - `c969ed12`

## Verification Run

- Task 1 verify (creation, draft, CreationFlow, tabindex-scan, seed-data-scan): 217 passed before Task 2 began (tracer gate).
- Task 1 acceptance greps: `targets: creationTargets(draft)` 1; `No style` 1; `useCatalog()` 1; `<CreationSetup` 1; snapshot-call grep 0; `onChange((prev) =>` 5; `mk-list` 0.
- `CreationSetup.test.jsx` + `src/styles`: 385 passed. Full `npm --prefix app test`: 120 files, 3693 tests, all green.
- Board run over the fifteen panels against a scratch build: `953 PASS, 0 FAIL`, no FAIL, no DIFF, no "anchor:" line. Absent PASS lines: `tA1 .batch-row__head-acts .text-control absent` and `tG1 ... absent`.
- `10-walk-check.sh`: `MATCH 94 snapshots`.
- Task 2 acceptance greps: `@media` 6; `^\.notebook \.mk-band {` 1; `^\.notebook \.mk-region {` 1; `mk-list` in notebook.css 0; non-comment `absent:` in the spec 1; non-comment `tO1` 0; non-comment `anchor:` 3.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] The worktree had no app/node_modules**
- Untracked symlink to the main checkout's (gitignored). Nothing installed.

**2. [Rule 3 - Blocking] CreationSetup.test.jsx needs the repository mocked**
- `CatalogContext.jsx` imports the real repository, which opens IndexedDB at import; jsdom has none. The suite mocks `../store/repository.js` with an empty repository (the suite never reads the store), as the other jsdom suites do.

### Notes

- The board comparison passed on the first run, so no FAIL needed classifying as a build departure or a fixture/engine difference, and no value was patched into app CSS.
- `--selftest` on this spec prints 11 `PASS selftest` lines (all Style panels) and 4 `FAIL selftest tA2/tB2/tC2/tD5: the 1 px font run produced no FAIL`. That is by design: the Balance panels compare counts and text only (the plan's list), so a font change cannot fail them. The plan's verify does not use `--selftest`.
- `CreationSetup` imports `readSignedInput` and `shownSignedValue` from BatchRow.jsx but not `MALFORMED_NUMBER_ENTRY` (the plan's import list); the constant is only reached through `readSignedInput`, and the suite checks it from BatchRow.

## Authentication Gates

None.

## Known Stubs

None.

## Deferred Human Verification

- Open the built `/notebook/new` in Safari or Playwright WebKit at 1366 beside `.planning/sketches/013-creation-editor/style-menu-and-bands.html`: No style, each of the four styles, Fat edited, the temperature edited, emptied and refilled by Gelato, Clear on Philadelphia, and the Balance beside each. Expected: each state matches its board panel side by side, the menu showing the browser's own list when opened. The measurement covers boxes, fonts, colours and borders, not every visual detail, and the browser's own select list is not drawn. (Mark's List: no row written; the orchestrator owns those writes.)

## Threat Flags

None. Band text is only ever a value (`setBandEnd` accepts the six fixed keys and throws otherwise, T-10-21); an unreadable temperature is kept as the constant and shown blank, never parsed here, and Phase 11's Save must refuse it (T-10-22); style names render as React text.

## Self-Check: PASSED

- Created: CreationSetup.jsx, CreationSetup.test.jsx, 10-board-style.mjs, this file.
- Commits `aa585d82` and `c969ed12` are ancestors of HEAD.
