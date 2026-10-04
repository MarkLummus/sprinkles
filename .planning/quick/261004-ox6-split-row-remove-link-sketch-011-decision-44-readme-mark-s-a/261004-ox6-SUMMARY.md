---
phase: quick-261004-ox6
plan: 01
quick_id: 261004-ox6
subsystem: ui
tags: [ingredient-table, remove-link, split-row, sketch-011-decision-44, webkit-probe]
requires: []
provides:
  - "A remove or restore link on every portion line of a split ingredient in the Next version pen, each toggling the whole ingredient, each with an aria-label '{remove|restore} {ingredient}, Step N' (', Unallocated' under that head)"
  - "A removed split ingredient's portion lines read its share of the batch the pen opened on (46.3%, not 86.3%)"
affects: [app/src/ui/IngredientTable.jsx]
tech-stack:
  added: []
  patterns: ["RemoveRowControl takes an optional lineName; groupPortionsByStep entries carry displayNumber"]
key-files:
  created:
    - app/src/ui/IngredientTable.remove.test.jsx
    - .planning/quick/261004-ox6-split-row-remove-link-sketch-011-decision-44-readme-mark-s-a/261004-ox6-probe.mjs
    - .planning/quick/261004-ox6-split-row-remove-link-sketch-011-decision-44-readme-mark-s-a/261004-ox6-baseline.json
  modified:
    - app/src/ui/IngredientTable.jsx
    - app/src/ui/IngredientTable.test.jsx
key-decisions:
  - "Option B of sketch 011 decision 44: a link on every line, each removes the whole ingredient; no per-portion removal (option C not built)"
  - "No new domain test: formatPortionLine was right and is already pinned at composition.test.js lines 151-155; the defect was the mass the pen passed it"
  - "Probe thresholds were not loosened: the matrix and board groups exit 1 with 6 failing readings, reported below"
requirements-completed: [REC1-03, UX1-01]
status: complete
duration: 55min
completed: 2026-10-04
commits: 4
plan_head_before: 81fe551fcaddcfddd24dc408d4d749ac8cead357
plan_head_after: edb922481b45b81e8b6b1f7caf1c627f5c309094
actuals:
  tokens: 14000
  tasks: 3
  commits: 4
---

# Phase quick-261004-ox6 Plan 01: A remove link on every line of a split ingredient Summary

Every line of a split ingredient in the Next version pen now has its own remove (or restore) link in decision 26's place, each toggling the whole ingredient and each naming its line to a screen reader ("remove Whole milk, Step 3"); a removed split ingredient's portion lines now read 46.3% in all, not 86.3%.

The probe's matrix and board groups do NOT exit 0: six readings fail. Two are a plan check that the physics of a height floor cannot meet at 393, and four are a board-versus-app difference that was already there before this change. Details under "Probe failures". Nothing was loosened.

## What was built

- **IngredientTable.jsx** (the only app source file changed):
  - `groupPortionsByStep` entries carry `displayNumber`; `renderEntry` passes it to `renderDevelopingEntry`.
  - `RemoveRowControl` takes an optional `lineName`; the button's props run `type`, `className`, `tabIndex={0}`, `aria-label`, `onClick`. The aria-label is `{word} {lineName}`, or omitted for a one-portion row.
  - `renderDevelopingEntry` renders `RemoveRowControl` on every portion line. `lineName` is set only for a split row: `{name}, Step N` or `{name}, Unallocated`. `onToggle` is still `onTogglePenRowRemoved(row.id)`, the whole row. The orphan flag and the `inputRef` stay on the first portion line.
  - The portion line passes `removed ? baselineMass : currentMass` to `formatPortionLine`, with a comment citing decision 44 finding 1.
- **IngredientTable.test.jsx**: Tests A to C of the 261004-eoi block updated for a link and aria-label on every split line; Test B also pins the exact notes and the struck shares through `formatShareOfBatch`; Test D unchanged (guard); Tests F and G added in a new describe.
- **IngredientTable.remove.test.jsx** (new, jsdom): Test E.
- **261004-ox6-probe.mjs** and **261004-ox6-baseline.json**: WebKit probe of the built app, groups `baseline`, `tracer`, `removed`, `matrix`, `board`.

## Test-first evidence

| Task | RED commit | Failing before | GREEN commit |
| --- | --- | --- | --- |
| 1: link on every line | aa59f37 | A, B, C, E failed; D (guard) passed | 8c88a89 |
| 2: removed row's share | a0418bd | B (tightened) and F failed on the share; G (guard) passed | edb9224 |

Tests D and G are guards: they pass before and after, and say so.

## Why there is no new domain test

`formatPortionLine` in `app/src/domain/composition.js` is correct and is already pinned under node at `composition.test.js` lines 151-155 ('120 g of 370.4 g · 46.3% in all' against the full batch, 799.68 g). The defect was the mass the pen passed it (`currentMass`, which leaves a removed row out), so the RED tests are component tests. They still run under the node environment through `renderToStaticMarkup`. `composition.test.js` ran as a guard. Nothing under `app/src/domain` changed.

## Baseline, and what the precondition proved

The baseline was captured from a build of the unchanged source, with the precondition asserted in all 18 cells before the JSON was written (168 checks): Olive Oil v1 pen had 4 portion notes and 12 links; the links with a note were exactly Whole milk and Sucrose with no aria-label and a gap of 14; the other Whole milk and Sucrose rows had no link; removed, Whole milk's one link read restore and both rows' notes read 86.3% in all (the defect); Mexican Chocolate v4 had 0 notes and links.

## Measurements

Playwright WebKit on a Mac, not Mark's devices. Heights are before to after, in px, in the order Whole milk Step 2, Sucrose Step 2, Whole milk Step 3, Sucrose Step 3. In every olive-v1 cell: the four split links' gaps read 13.98, 13.97, 13.98, 13.97 (decision 26's 14); `note.top - btnBottom` is 0 for all four; the aria-labels read `{remove|restore} Whole milk, Step 2`, `remove Sucrose, Step 2`, `... Whole milk, Step 3`, `remove Sucrose, Step 3` (restore for Whole milk in the removed cells); overflow is 0 before and after. Whole milk's two notes read '120 g of 370.4 g · 46.3% in all' and '250.4 g of 370.4 g · 46.3% in all' in every cell, pen and removed.

| Pointer | Width | Case | Split row heights | Table height |
| --- | --- | --- | --- | --- |
| coarse | 393 | pen | 75.39 to 75.39, 75.39 to 75.39, 63 to 75.39, 63 to 75.39 | 1097.06 to 1121.84 |
| coarse | 393 | removed | 81 to 81, 75.39 to 75.39, 81 to 81, 63 to 75.39 | 1138.67 to 1151.06 |
| coarse | 393 | mex4 | none | 915.22 to 915.22 |
| coarse | 1366 | pen | 71.39 to 71.39 (x2), 57 to 71.39 (x2) | 1036.94 to 1065.72 |
| coarse | 1366 | removed | 71.39 to 71.39 (x2), 57 to 71.39 (x2) | 1022.55 to 1051.33 |
| coarse | 1366 | mex4 | none | 790.38 to 790.38 |
| coarse | 1600 | pen | as 1366 | 1036.94 to 1065.72 |
| coarse | 1600 | removed | as 1366 | 1022.55 to 1051.33 |
| coarse | 1600 | mex4 | none | 790.38 to 790.38 |
| fine | 393 | pen | 55.39 to 55.39 (x2), 51.3 to 55.39, 49.39 to 55.39 | 852 to 862.09 |
| fine | 393 | removed | 63.25 to 63.25, 55.39 to 55.39, 63.25 to 63.25, 55 to 55.39 | 963.67 to 964.06 |
| fine | 393 | mex4 | none | 690.97 to 690.97 |
| fine | 1366 | pen | 51.39 to 51.39 (x2), 47.3 to 51.39, 45.39 to 51.39 | 798.13 to 808.22 |
| fine | 1366 | removed | as pen | 783.73 to 793.83 |
| fine | 1366 | mex4 | none | 577.38 to 577.38 |
| fine | 1600 | pen / removed / mex4 | as 1366 | 798.13 to 808.22 / 783.73 to 793.83 / 577.38 to 577.38 |

At rest, each Step 3 line is as tall as its ingredient's Step 2 line in every pen cell (within 0.5). The tracer (coarse, 1600, pen) passed 207 checks and the removed cell (coarse, 1600) passed 211, including the restore round trip: pressing restore on the Step 2 line brings both Whole milk lines back to remove, unstruck, with notes reading 46.3%.

Every non-split row and Mexican Chocolate v4's pen matched the baseline in every cell: the only checks that failed anywhere are the six listed below, and none of them is on a non-split row or on mex4.

## Probe failures (reported, not loosened)

`node .../261004-ox6-probe.mjs matrix,board` exits 1 with 6 failures. All other checks in both groups pass.

1. `coarse|393|olive-v1 removed`, Whole milk Step 3 row: "second line is taller than its baseline (81 vs 81)".
2. `fine|393|olive-v1 removed`, same row: 63.25 vs 63.25.
   - Cause: a removed row at 393 stacks the struck old value above the live one in the amount cell, which sets a height floor (81 coarse, 63.25 fine). Whole milk's Step 3 line already stood at that floor in the baseline, so the added link does not raise it. This is the same floor 261004-eoi found for its restore case. The link is there and 14px clear on that line; only the plan's "each is taller than its baseline" check cannot hold there. The four other second-line rows are taller, and every pen cell passes. A decision for the orchestrator or Mark: whether the check should read "taller, or already at the floor" for the removed case at 393.
3. to 6. `coarse|1366` and `coarse|1600`, B-removed, Whole milk Step 2 and Step 3: app 71.39 against the board's 75.33 (buttons agree at 44, so the plan compares them within 1).
   - Cause: not this change. On the board, the removed Whole milk row's grams cell stacks a struck "120 g" above the input (62 high), which makes the row 75.33; the app does not stack at 1366 or 1600, so its row is 71.39. The unchanged baseline already read 71.39 for the first line, so the 3.9px is a board-versus-app difference that predates decision 44. B-rest at the same widths agrees (71.39 against 71.72, within 1). It belongs to whoever owns the removed-row state of the board.

## Board comparison (B panels of split-remove-link.html)

All 18 tables mapped to their panels (B-rest and B-removed at table indices 2/3 at 1600, 8/9 at 1366, 14/15 at 393, one table each). In all 12 B-panel pairs (both pointers, three widths, rest and removed):
- 14 links on the board and in the app, all four split lines carry one on both, matching Sid's splitlink-measure.json.
- Every split link's gap matches the board's to within 0.01 (13.98, 13.97); the portion line follows the link on both, with its top at or below the button's bottom.
- Whole milk lines read restore on both in B-removed.
- Row heights agree within 1 wherever compared (buttons agree) except failures 3 to 6 above. Fine pointer: the board draws 44px buttons and the app's are 24, so heights are printed, not compared (for example 51.39 against 71.39 at 1366).
- B-removed Whole milk notes: the board reads '86.3% in all' (the as-built figure of README finding 1); the app now reads '46.3% in all'. That is the decided difference (Mark's answer 2), not a failure.

## Tests

`npm --prefix app test`: 61 files, 1646 tests, all passing. Before: 60 files, 1643 tests. The delta is one new file (IngredientTable.remove.test.jsx) and three new tests (E, F, G); none removed. `npm --prefix app run build` succeeds.

## Deviations from Plan

None to the code. The plan's own text counted 1640 tests at plan time; the true baseline when I started was 1643 (sibling items added three), and the delta above is against that.

The scope check holds: under app/ only IngredientTable.jsx, IngredientTable.test.jsx and IngredientTable.remove.test.jsx changed; nothing under app/src/domain, no stylesheet, token, sketch, canvas generator, .impeccable file or DESIGN.md.

## Known Stubs

None.

## Threat Flags

None. No new network endpoint, auth path or schema; the ingredient name renders as an attribute and as text, never as markup.

## For Mark's List

Not written by the executor. For the orchestrator to file:

- slug `ox6-split-remove-link-device-check`, kind `check`, addedBy `claude`, status `open`
- title "Split row: a remove link on every line, and the 46.3% after remove"
- where.label "Olive Oil v1, Next version, served from the build, on the iPhone and iPad"
- Steps: `npm --prefix app run build` has already refreshed app/dist, so a hard reload of the running preview is enough. (1) iPhone: Whole milk shows "remove" on its Step 2 line and its Step 3 line, each after the name and "estimated" with clear space, above its "... of 370.4 g" line; Sucrose the same. (2) Tap remove on Whole milk's Step 3 line: both Whole milk lines strike, both read restore, both portion lines read "46.3% in all", not 86.3%; tap restore on the Step 2 line and both come back. (3) iPad, landscape and portrait: the same. (4) Optional, VoiceOver: the Step 3 link reads "remove Whole milk, Step 3". Cancel the pen without saving.
- A second, smaller decision for Mark or Sid, not a device check: whether the 393 removed-row height check should accept a line already at the stacking floor (failures 1 and 2), and who owns the board's removed-row grams cell (failures 3 to 6).

The readings above are Playwright WebKit on a Mac. Rebuilding app/dist already updates what Mark's :4173 preview serves; the preview was not started, stopped or requested.

## Self-Check: PASSED

- app/src/ui/IngredientTable.remove.test.jsx, the probe and the baseline exist on disk.
- Commits aa59f37, 8c88a89, a0418bd and edb9224 exist.
