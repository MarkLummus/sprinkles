---
phase: quick-261004-ox8
plan: 01
subsystem: ui
tags: [ingredient-table, d3-grid, css, sketch-011, decision-31, decision-32, decision-33]
requires:
  - phase: quick-261004-ox3
  - phase: quick-261004-ox4
  - phase: quick-261004-ox6
  - phase: quick-261004-ox7
provides:
  - "the ingredient table's D3 grid on screen from 724 up: As made first, plan amount, name, share; struck figure under the current one"
  - "ingredient-table--as-made on the table, set exactly when hasAsMadeLayer"
affects: [print Phase 04, sketch 011 brief tasks 3 and 4]
tech-stack:
  added: []
  patterns: ["one screen-only @media block appended last in app.css", "per-cell :has(> .struck-value) taken from the board's own CSS"]
key-files:
  created:
    - .planning/quick/261004-ox8-decision-33-brief-task-2-table-grid-from-724-d3-ingredientta/261004-ox8-probe.mjs
    - .planning/quick/261004-ox8-decision-33-brief-task-2-table-grid-from-724-d3-ingredientta/261004-ox8-baseline.json
  modified:
    - app/src/ui/IngredientTable.jsx
    - app/src/ui/IngredientTable.test.jsx
    - app/src/styles/app.css
    - app/src/styles/columns.test.js
    - app/src/styles/binder.test.js
    - app/src/styles/cross-cutting.test.js
key-decisions:
  - "Per-cell :has(> .struck-value) (the board's own selector) in place of brief (c)'s second table class"
requirements-completed: [REC1-01, FORM2-01]
status: complete
commits: 2
plan_head_before: 62b2ebd06e7d5414ff8176952a6655646387b867
plan_head_after: 69a484888ced96824690bbbef9c7155c1344551a
actuals:
  tokens: 14000
  tasks: 2
  commits: 2
completed: 2026-10-04
---

# Phase quick-261004-ox8 Plan 01: the ingredient table's D3 grid from 724 Summary

**From 724 up the ingredient table is the D3 grid: As made first in a 56px track, then the 64px plan amount, the name and the share, with a struck figure under the current one; it matches the sketch 011 boards row for row (0 differing rows, 20 states, WebKit and Chrome).**

## What was built

- `IngredientTable.jsx`: the table's className is now one template-literal expression, `ingredient-table`, plus ` ingredient-table--as-made` when `hasAsMadeLayer`, plus ` is-developing` when `isDeveloping`, with a short comment citing decisions 31, 32 and 33 brief (c). Nothing else in the file changed (no markup order, label or handler; no `.filter(`).
- `app.css`: one new block, `@media screen and (min-width: 724px)`, appended as the last block of the file (after `@media print`). It holds the plan's 19 rules, translated from `.planning/canvas-generators/ingredient-options.css` sections D, D2 and D3, every value through a token (no token added). The comment above it names decision 31 (D3, "keep things static when Show changes toggles"), decision 32 answers 2, 4 and 5, brief (c), that `screen` keeps print as it was (brief (g); Phase 04 owns print), the `:has` choice and that the column-form rules above now draw only print.
- Sources: sketch 011 decision 31 (D3), decision 32 answers 2, 4 and 5, decision 33 brief (c).
- RED then GREEN: commit 59ad7ee added the tests and 10 of them failed (reading-with-batch and recording class tests, the reworded heads test's second half, five D3 contract tests, the binder and cross-cutting media lists). The pen class test is the guard and passed before and after. Commit 69a4848 made them pass.
- Planner's choice, kept: per-cell `:has(> .struck-value)` selectors (the board's own) instead of a second table class. Reasons: a table-level class would make every amount and share cell a reversed flex column, which packs a lone figure at the foot of a taller cell (never drawn on the board) and needs JSX that works out whether any struck figure renders; app.css already relies on `:has()` in the record pen.
- Comments corrected (all three still said the old thing at HEAD): the `.struck-value` comment, the `.prose-struck-beneath` comment, and the phone block's "From 724 the base .struck-value rule keeps the figures side by side".

### Adaptation to HEAD (siblings had landed)

Plan anchors were written at eb106cb; HEAD was 62b2ebd. I read the current files and changed:
- The baseline is 62 files and 1667 tests (not 60 and 1640).
- app.css held 7 top-level `@media` blocks at 6 conditions (ox3, ox4 and ox7 had changed the counts); I added one block, so binder.test.js now pins 8 and cross-cutting.test.js 8 blocks at 7 conditions, and both lists gain `screen and (min-width: 724px)`.
- ox6's remove link on every split line makes Olive Oil v1's Whole milk and Sucrose Step 3 pen rows 14.39px taller than the 1600-pen board (rows 8 and 11); the probe exempts those rows' heights as planned (cell x and width still compared) and the table height is compared with the 28.78px added.
- The baseline JSON was captured on HEAD 62b2ebd after ox7, so olive1pen's "before" height is 1065.72 (the plan's 1036.9 predates ox6).

## The board table

WebKit coarse, deviceScaleFactor 1. nameMin before, after (board's equal to after); table height before, after (board's equal to after); differing rows before, after: 0 on every row.

| State @ width | nameMin | height | differing rows |
|---|---|---|---|
| mex3 @744 | 296.34, 376.48 | 504.19, 723.77 | 15, 0 |
| olive1 @744 | 377.28, 376.48 | 717.34, 728.73 | 20, 0 |
| mex3 @834 | 386.34, 466.48 | 504.19, 723.77 | 15, 0 |
| olive1 @834 | 467.28, 466.48 | 717.34, 728.73 | 20, 0 |
| mex3 @983 | 535.34, 615.48 | 504.19, 723.77 | 15, 0 |
| olive1 @983 | 616.28, 615.48 | 717.34, 728.73 | 20, 0 |
| mex3 @984 | 240.34, 320.48 | 504.19, 723.77 | 15, 0 |
| olive1 @984 | 321.28, 320.48 | 717.34, 728.73 | 20, 0 |
| mex3 @1024 | 267.00, 347.14 | 504.19, 723.77 | 15, 0 |
| olive1 @1024 | 347.94, 347.14 | 717.34, 728.73 | 20, 0 |
| mex3 @1366 | 240.34, 320.48 | 504.19, 723.77 | 15, 0 |
| olive1 @1366 | 321.28, 320.48 | 717.34, 728.73 | 20, 0 |
| mex3 @1600 | 247.00, 327.14 | 504.19, 723.77 | 15, 0 |
| olive1 @1600 | 327.94, 327.14 | 717.34, 728.73 | 20, 0 |
| mex3 @1920 | 360.34, 440.48 | 504.19, 723.77 | 15, 0 |
| olive1 @1920 | 441.28, 440.48 | 717.34, 728.73 | 20, 0 |
| under2 @1600 (no batch) | 301.91, 393.14 | 406.02, 557.30 | 13, 0 |
| base2 @1600 (no batch) | 395.73, 393.14 | 261.59, 242.20 | 8, 0 |
| olive1pen @1600 | 388.25, 393.14 | 1065.72, 1046.33 (board 1017.55) | 20, 0 |
| mex3pen @1600 | 293.98, 393.14 | 775.98, 842.98 | 15, 0 |

- olive1pen has 2 exempt rows (rows 8 and 11, ox6's extra link on Whole milk and Sucrose Step 3), each 14.39px taller than the board's; with those added the table height delta is 0.
- Chrome (system, coarse) reads the same 0 differing rows, 0 exempt except the same 2 on olive1pen, and a name column 1.3 to 1.4px wider than WebKit: 377.8, 467.8, 616.8, 321.8, 348.45, 321.8, 328.45, 441.8 at 744, 834, 983, 984, 1024, 1366, 1600, 1920 and 394.45 for the 1600 no-batch and pen boards (probe tolerance 2).
- Name column against the brief: 376 / 466 / 615 / 347 at 744 / 834 / 983 / 1024, 327 at 1600 with the rail, 440 at 1920 (WebKit, 376.48, 466.48, 615.48, 347.14, 327.14, 440.48). No name wraps (maxLines 1 everywhere), page overflow 0 everywhere. On the two no-batch boards (under2, base2) there is no As made head and the table class lacks the modifier.

## Behaviour

WebKit coarse, Chrome coarse and Chrome fine, at 744, 1024 and 1600 (all 27 cells):
- Show changes toggle (Mexican Chocolate v3 and v4, 12 plan amounts each): every plan amount moved 0 in both axes.
- Pen edit (v4, field filled with 999): the 12 grams fields moved at most 0.89 across in WebKit and 0.78 in Chrome, and 0 down (limits 1.0 and 0.5).
- Recording (Olive Oil v1, Record another, 121.5 typed): 14 As made fields, each 56 wide, at its As made track's left edge (0 offset), 10px clear of the plan amount, page overflow 0.

## Unchanged

- The 393 and 723 tables (Mexican Chocolate v3 and Olive Oil v1) and the print-emulated 1024 and 1600 tables equal the baseline within 0.5px (0 differing rows, 8 cells).
- DOM order unchanged: the struck figure is still the first child of `.ingredient-table__plan-grams`.

## Finding for ox6's four failing readings

ox6 reported four readings failing at coarse 1366 and 1600 on the board's B-removed panels (Whole milk Step 2 and Step 3: app 71.39 against board 75.33), because the board stacks a struck "120 g" above the input and the app did not stack. Now they agree. Re-running ox6's probe, `node 261004-ox6-probe.mjs board`: exit 0, "252 checks passed", and the four readings read 75 (app) against 75.33 (board) at both 1366 and 1600, coarse. The 393 cells that ox6 reported failing also pass now (ox7's phone rules; app 81 against board 81). The ox6 probe was not edited.
Running the exact group string `matrix,board` still exits 1 (1420 failed): `matrix` compares every cell against ox6's own pre-change baseline, and the phone (ox7) and the 724+ table (this item) have since changed the form on purpose, so those cells cannot equal a pre-ox6 baseline (393, 1366 and 1600 pen and removed cells, 1366 and 1600 fine pointer). That is an old regression check outliving its baseline, not a new defect; I did not loosen it.

## Findings for Mark

Built as the boards draw them and not changed here.
1. The table head reads on two lines from 724 up: INGREDIENT above, then AS / MADE and % OF BATCH. This follows from the board's own CSS (head cells placed by column only, the As made head box 0.55px wide). The brief's words describe one head line; a one-line head is about 16px shorter. If Mark wants it, Sid redraws first.
2. The step head's rule now spans only its words from 724 up (it spanned the full table before).
3. From 724 the table rows are grids. VoiceOver's table navigation should behave as it already does on the phone below 724, where rows carry their own aria-labels; device-unverified.
4. The plan amount and the names shift 66px (As made track 56 plus the 10px gap, token arithmetic pinned in columns.test.js) when a batch comes into view (decision 32 answer 4, accepted). Not separately measured as a before/after of one table: the no-batch boards (under2, base2) have no As made track and read a 393.14 name column against 327.14 with a batch at 1600, which is the 66px.

## Deviations from Plan

None - the plan was executed as written, with the HEAD adaptations above (counts, ox6's exempt rows, baseline sizes). No test removed; no threshold or check loosened.

## Known Stubs

None.

## Threat Flags

None.

## For Mark's List

- check: Look at the build on the iPad (12.9in at 1366 landscape and 1024 portrait), on the iPad mini or 11in portrait if he has one (744 and 834), and in Mac Safari at 1600. Open Mexican Chocolate v3 with its batch, turn Show changes on and off, then open Next version and change an amount. As made should stand first, the struck figure should sit under the amount, nothing should move when he toggles, and in Olive Oil v1's Record another each As made field should sit in the first column. Serve from the build (`npm --prefix app run build && npm --prefix app run preview -- --host`); his running preview already serves the rebuilt app/dist, so a hard reload is enough. Device-verified only when Mark confirms.
- decide: finding (1), the two-line head from 724. Options: "keep the two-line head as drawn", and "one head line: Sid redraws, then a quick" (recommended: it is what the brief's words describe, and the stagger is a side effect).

## Close

- Tests: 62 files, 1679 tests (baseline 62 files, 1667 tests; +12, none removed): 4 class tests, 1 heads test split into two, 7 D3 contract tests. `npm --prefix app test` green; `npm --prefix app run build` succeeds.
- Probe: `boards,behaviour,invariants` exit 0, 222 checks; `tracer` 4 checks.
- Every reading comes from Playwright WebKit and system Chrome, not Mark's devices. No :4173, :5173 or :8011 was requested and no Vite process was started.
- Commits: 59ad7ee (test), 69a4848 (feat). Nothing under .planning/sketches, .planning/canvas-generators, .impeccable or DESIGN.md was touched.

## Self-Check: PASSED
