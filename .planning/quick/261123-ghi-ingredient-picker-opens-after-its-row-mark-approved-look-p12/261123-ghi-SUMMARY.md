---
phase: quick-261123-ghi
plan: 01
subsystem: creation-editor
tags: [ingredient-picker, ingredient-table, sketch-016, contract-13, phase-12-gate]
requires: [261123-ghh]
provides: [picker-after-its-row]
affects: [creation-editor, first-version-edit, phase-12-gate]
tech-stack:
  added: []
  patterns: [picker-as-table-row, filters-held-by-the-page, focus-request-picker-place]
key-files:
  created: []
  modified:
    - app/src/ui/CreationPage.jsx
    - app/src/ui/IngredientTable.jsx
    - app/src/ui/IngredientPicker.jsx
    - app/src/ui/CreationFlow.test.jsx
    - app/src/ui/IngredientPicker.test.jsx
    - app/src/styles/notebook.css
    - app/src/styles/notebook.test.js
    - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-rowcontrols.mjs
    - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-keys.mjs
decisions:
  - "The picker's place follows anchorHolds, the rule handlePick lands by, so it stands where the pick will land"
  - "Name and Category live in CreationPage's picking state; the picker takes no focus on mount"
  - "Fields inside the picker row stay start-aligned (the board's right alignment is not built)"
metrics:
  duration: about 1h20m
  completed: 2026-11-23
status: complete
actuals:
  tokens: 13700
  tasks: 3
  commits: 7
plan_head_before: ef6cba6adb24dc91cda22ecc574d8f46b98137c5
plan_head_after: 5e3232d2b657ff14061f169456e45d6f91de1aff
---

# Phase quick-261123-ghi Plan 01: Ingredient picker opens after its row Summary

In the creation editor at 1366 the ingredient picker is now a row of the ingredient table, after the row that opened it, named by its place, keeping Name and Category when it moves, and scrolling the page only as far as it needs. Mark approved the design on 2026-11-23 (Mark's List row `look-p12-picker-after-row`; sketch 016 CONTRACT section 13, README decisions 35 to 41).

`actuals.tokens` is chars/4 over `git diff plan_head_before..plan_head_after` (54619 chars). `commits: 7` counts the commits from `plan_head_before` to `plan_head_after`; this SUMMARY is committed after that and is the eighth.

## What was built, by file

- `app/src/ui/IngredientPicker.jsx`: a `label` prop names the group (`aria-label={label}`); the filters are controlled (`filters`, `onChangeFilters`, `NO_FILTERS` exported); the mount effect that focused Name is gone, so the picker takes no focus by itself.
- `app/src/ui/CreationPage.jsx`: `picking` holds `filters`. `pickerLine` uses `anchorHolds`, the same rule `handlePick` lands by. `pickerLabel` says the place ("Add ingredient after <row>, in step <n>", "..., not in a step yet", "Add ingredient at the end, not in a step yet", plain "Add ingredient" with no row, no step words when the recipe has no step). The picker element goes to the table as `creationRows.picker = { line, element }` (`line` null for the end), or to `ingredientsFoot` with no row. A new `'picker-place'` focus request focuses Name with `preventScroll` and calls `scrollPickerIntoView`: `by = min(max(0, picker bottom - innerHeight), row above's top - scroll-padding-top)`, `scrollBy(0, by)` only when `by` is not 0.
- `app/src/ui/IngredientTable.jsx`: `tr.ingredient-table__pick > td[colspan] > picker` is drawn right after the entry named by `picker.line`, inside its body; with `line` null it is the last row of the last body when that body is 'Not in a step yet', else a body of its own under a 'Not in a step yet' head row, present only while the picker is open. Every other mode draws what it drew.
- `app/src/styles/notebook.css`: the board's two picker-row rules (`tr.ingredient-table__pick` block with `padding: 0 0 var(--gap-s)`; its `td` block, padding 0, border 0) and one rule `.ingredient-table__pick .ink-field { text-align: start }`, all under `.notebook`, tokens and keywords only.
- Tests and gate: see below.

## Red then green

| Task | Red commit | Failed before | Green commit |
|------|------------|---------------|--------------|
| 1 From a row | e48068fe | R1, R2, R3, R4, R5, R7 (R6 held as a bound) | 75840410 |
| 2 Filters, end, scroll | 80068cfb | P1, P3, E1, E2, E3, E5, E6, E7 a, b, d, e | b5021828 |
| 3 CSS and gate | abc16fe3 | S1 (3 cases); board: 106 FAIL lines in pa-step, pa-other, pa-picked, pa-heading, pa-allplaced | 5e3232d2 (CSS), 8ffab77d (gate flow fix, below) |

E4 held as a bound. P2 (the label) and E7 (c) (no scroll when it fits) passed before the change because Task 1 had added `label` and nothing scrolled yet; both are bounds, not reds. pa-cancel passed before the CSS because a closed picker draws no picker row.

Suite: 137 files, 4625 tests at the start (the base after four sibling merges), 137 files, 4643 tests at the end (18 new cases: R3, R4, P2, P3 and the E cases, six E1 to E6 and five E7, plus three in notebook.test.js).

## Gate changes, file by file

- `12-board-rowcontrols.mjs`: the entry for panel `ai-pick` is removed (row-controls.html draws the picker under the Total, superseded by CONTRACT section 13). The default export is now an array of two specs: the row-controls spec with its other entries unchanged, and a spec on `picker-after-row.html` with six entries (`picker-pa-step`, `-pa-other`, `-pa-cancel`, `-pa-picked`, `-pa-heading`, `-pa-allplaced`), checks as the plan lists them. `coffeeBase` stays exported for `12-tab-probe.mjs`. Header comment updated.
- `12-board-keys.mjs`: the entry for `ai-pick` and its `pickerFromRow` helper are removed; the same checks (region name, keys line with its font, row buttons' `aria-keyshortcuts`, no head row) are held by `picker-pa-step`. Header comment updated.
- `12-check.sh` is unchanged.

## Board engine counts (PASS / FAIL per entry, `--selftest`, `--evidence`)

| Entry | WebKit | Chrome (shim) |
|-------|--------|---------------|
| picker-pa-step | 143 / 0 | 143 / 0 |
| picker-pa-other | 145 / 0 | 145 / 0 |
| picker-pa-cancel | 121 / 0 | 121 / 0 |
| picker-pa-picked | 137 / 0 | 137 / 0 |
| picker-pa-heading | 143 / 0 | 143 / 0 |
| picker-pa-allplaced | 138 / 0 | 138 / 0 |
| whole run (row-controls, keys, picker-after-row) | 2190 PASS, exit 0 | 2190 PASS, exit 0 |

Evidence folders (scratch, not in the repo): `/var/folders/rs/11f8grj17lz9xdsd6dn_xzpw0000gn/T/sprinkles-ghi/evidence-red`, `evidence-webkit`, `evidence-chrome`; logs `red.log`, `webkit.log`, `chrome.log` beside them. Chrome ran through a scratch `chrome-shim.mjs` (`PLAYWRIGHT_CORE`).

## Side by side: scroll, Tab, move and key readings (1366 x 1024, Coffee with eight rows)

Scratch probe `probe.mjs` in the same folder, output in `probe-webkit.json` and `probe-chrome.json`. The sticky header's bottom is 57 px and `scrollPaddingTop` reads 57px in both engines.

| Reading | WebKit | Chrome |
|---------|--------|--------|
| (a1) Heavy cream's Add ingredient; the row could only be scrolled to top 643 (page is 1860 high) | scrolled 202; row top 415.9; picker bottom 1024.4 | scrolled 200; row top 415.9; picker bottom 1023.8 |
| (a2) row near the top (151), the picker fits | scrollY unchanged (492); row top 125.9, picker bottom 734.4 | scrolled -25 (Chrome's own scroll anchoring followed the 25 px the heading row lost, not the new rule, which asks for 0); row top 149.9, picker bottom 757.8 |
| (a3) move to Dextrose's row while open (row at 800) | scrolled 0; row top 269.1; picker bottom 875.7 (fits) | scrolled 0; row top 268.9; picker bottom 875.5 |
| (b) Tab from Heavy cream's Add ingredient | Move up, Move down, Remove, Cancel, Name, Category, list rows | same |
| (b) Shift+Tab from Cancel | Heavy cream's Remove | same |
| (b) Tab from the last list row | Coffee beans' grams | same |
| (b) 'dex' typed, Tab from Category | Clear filters | same |
| (c) 'dex', Sugar, then Dextrose's Add ingredient | one picker; Name 'dex'; Category 'sugar'; focus in Name; after Dextrose; caret [0, 0]; list scrollTop 0 | same |
| (d) Cmd+Return in Coffee beans' grams | picker after Coffee beans, named 'Add ingredient after Coffee beans, in step 1', focus in Name; Cancel returns to Coffee beans' grams | same |
| (e) text-align of Name and Category in the built picker | start, start; scrollWidth 1366 = innerWidth | start, start; scrollWidth 1366 |
| (e) on the snapshot's drawn pa-step panel | right, right | right, right |

The row never went above the header in any reading. In every case where the page scrolled, the picker's foot stood at the window's foot within 1 px. No finding to report from this table.

## 12-check.sh

`sh .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-check.sh` ran once, end to end, and ended `GATE2 PASS` (exit 0). The suite step passed 4643 tests; the Phase 11 walk line read `MATCH 94 snapshots; NEW create-recipe 3; NEW edit-first-version 3; NEW edit-stale 5; NEW create-save-refused 2; NEW edit-kept 5`, then `GATE1 PASS`. The run took about 12 minutes. Log: `.../sprinkles-ghi/check.log`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] The pa-picked board state is not the plan's flow**
- **Found during:** Task 3, first WebKit run after the CSS (`picker-pa-picked`, 24 FAIL lines).
- **Issue:** The plan's step for pa-picked is `pickerFromRow`, then pick Egg yolk. The board draws that panel with Fine sea salt already placed in Step 2 and no 'Not in a step yet' body (two step heads, not three; Fine sea salt carries no Add to step). The build, made as the plan said, kept Fine sea salt unplaced, so the page and the board stood in different states, not different markup.
- **Fix:** the spec's `pickerPicked` flow places Fine sea salt into Step 2 first (as `pa-allplaced` does), then opens the picker from Heavy cream's row and picks Egg yolk. No check was changed or loosened.
- **Files modified:** `12-board-rowcontrols.mjs`
- **Commit:** 8ffab77d

**2. [Test plan wording] Two bounds in the red list**
- P2 and E7 (c) were already green at red time (see the table above); they are bounds, not reds.

No existing test failed on the picker's old place beyond the ones Tasks 1 and 2 named (the case at CreationFlow line 2807, rewritten as R5).

## Undrawn states and the two board points

Built as the plan decided, each from a stated precedent:

- A recipe with no step: after a row the picker is named "Add ingredient after <row>"; from the heading "Add ingredient at the end" (tests R4, E3).
- An empty table: the built place, named "Add ingredient" (E4).
- The opener's row leaves its group while the picker is open (unticked, Add to step, removed, its step removed): the picker moves to the end, named as from the heading, and takes no focus (E6; the existing anchor-lost cases still pass).
- The scroll rule from the heading and with an empty table: the same rule, the element above the picker standing in for the opener row.
- The move is announced by no new words: focus goes to Name inside the group whose name now says the place.
- After a move the list's own scroll is at its top and the caret is at the start of Name: [0, 0] in both WebKit and Chrome (measured in (c)).
- A window shorter than the row, the gap and the picker: the row stops at the header and the picker's foot runs below the window (the `min` in the rule).

Board against prose, text-align (the plan's undrawn state 8): the drawn panel's Name and Category compute `text-align: right` (the table's grams rule reaches them). The build keeps start, the built picker, with one scoped rule. Figures: board right and right, build start and start, in WebKit and in Chrome (table above).

Board against build, line height: inside the table the picker inherits the cell's line height of 18 px, so `div.pick` is 507 high in the gate (the board's own figure), against 508 as built outside the table in WebKit. Kept as drawn; the gate holds it (all pa-step box checks pass).

One small layout fact, not a finding: opening the picker removes the heading's Add ingredient, which shortens the heading row by about 25 px, so rows below it move up that much, before the picker's rows are added. That was already so with the picker in its old place.

## What other screens do

IngredientPicker is imported only by CreationPage. The version pen (RecipePage, mode 'developing'), the reading page, the record pen and Show changes pass no `creationRows.picker`, so they draw no picker row and nothing changes there. Print uses `groupPortionsByStep`, not the table. The first version's Edit address is the same component and gets the change; below 724 neither editor shows (DeskOnly).

## Known Stubs

None.

## Threat Flags

None. The accessible name is set as an attribute value from a stored ingredient name (T-ghi-01, no markup); one rule decides the picker's place and where the pick lands (T-ghi-02); the picker takes no focus by itself and E6 proves focus stays on an unticked Uses box (T-ghi-03); only the two superseded `ai-pick` entries left the gate and their checks moved with at least the same kinds (T-ghi-04).

## Device-unverified

Device-unverified: Playwright WebKit and Chrome on a Mac, never Mark's iPad.

## For the orchestrator

- No ArtifactData here. Please close `look-p12-picker-after-row` (Mark approved the design; the build now matches the approved board in six panels in WebKit and Chrome) and decide whether the text-align difference (board right, built start) or the state wording for the undrawn cases needs a row for Mark. The text-align difference is the only place the build departs from the drawn snapshot: right on the board, start as built, per the plan.
- The plan's pa-picked flow did not make the board's state (Fine sea salt placed in Step 2); the gate's flow was corrected, not the build. Worth a note to Sid: the pa-picked panel is the all-placed table with Egg yolk picked, not the Coffee example as first written.
- A dist built from these commits is safe to deploy: no stored shape change, no DB_VERSION change; the suite passes (4643 tests) and `12-check.sh` ends GATE2 PASS.
- This item depended on 261123-ghh only for the shared notebook stylesheet (its four target-chip rules sit above the new rules in `notebook.css`; no overlap).
- I did not re-baseline anything: the Phase 11 walk still matches 94 snapshots.

## Self-Check: PASSED

- Files: the nine modified files exist and are committed; `git status` was clean before this SUMMARY.
- Commits e48068fe, 75840410, 80068cfb, b5021828, abc16fe3, 8ffab77d, 5e3232d2 are ancestors of HEAD.
