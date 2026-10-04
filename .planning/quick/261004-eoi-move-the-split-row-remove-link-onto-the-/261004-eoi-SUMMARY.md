---
phase: quick-261004-eoi
plan: 01
subsystem: ui
tags: [ingredient-table, pen, remove-link, sketch-011, decision-26, decision-33]
requires:
  - sketch 011 decision 26 (the link stands 14px clear on the name's line)
  - sketch 011 decision 33 addendum "The split row's remove link" (Mark, 2026-10-04)
provides:
  - "Next version pen: a split row's remove/restore link on the name's line, portion line under it"
affects: [app/src/ui/IngredientTable.jsx]
key-files:
  created:
    - .planning/quick/261004-eoi-move-the-split-row-remove-link-onto-the-/261004-eoi-probe.mjs
    - .planning/quick/261004-eoi-move-the-split-row-remove-link-onto-the-/261004-eoi-baseline.json
  modified:
    - app/src/ui/IngredientTable.jsx
    - app/src/ui/IngredientTable.test.jsx
decisions:
  - "Only the order of the name cell's children changed; no stylesheet, token, label, handler or tabIndex moved."
metrics:
  duration: "about 25 minutes"
  completed: 2026-10-04
status: complete
requirements: [REC1-03]
commits: 3
plan_head_before: eb517bb2131ca6728694fe954f0ffd0fd466aa49
plan_head_after: 1303ba9cbd658a0cc6ec8f245c26f93d8486f69d
actuals:
  tokens: 40000
  tasks: 2
  commits: 3
---

# Phase quick-261004-eoi Plan 01: Split row's remove link on the name's line Summary

In the Next version pen, a split ingredient's remove (or restore) link now sits on the name's line, 14px clear of the name or the estimated tag, with the portion line as a block under both, at every width from 393 to 1600.

## What was built

`renderDevelopingEntry`'s name cell in `app/src/ui/IngredientTable.jsx` now renders, in this order: the name (struck when removed), the estimated tag when present, the orphan flag when present, `RemoveRowControl` (gap span plus link) on the first portion only, then the portion-line span. Before the change the portion line came before the orphan flag and the link, so the link started a new line under it. The JSX comment above `RemoveRowControl` now cites "sketch 011 decision 26; decision 33 addendum, Mark 2026-10-04". Nothing else changed: the reading and Show changes branches, `RemoveRowControl`, `OrphanedRowFlag`, labels, handlers, `tabIndex={0}`, class names, CSS and tokens are untouched.

## Commits

- `c49eec6` test(261004-eoi): pin the split row's remove link before its portion line (RED)
- `d9d1a72` fix(261004-eoi): put the split row's remove link on the name's line in the pen (GREEN, plus the probe and baseline JSON)
- `1303ba9` test(261004-eoi): hold the removed split row to its height floor at 393 in the probe (probe only; see the restore floor below)

`commits: 2` is measured with `git rev-list --count ${plan_head_before}..HEAD`.

## RED then GREEN

Tests A to D were added to `IngredientTable.test.jsx` and run before the edit: A (split row, remove), B (split row removed, restore) and C (orphaned split row) failed on the old order; D passed. D is a guard, not a change detector: a non-split row with an estimated tag keeps name, tag, gap, link and has no portion line, before and after. After the edit all four pass. One slip of mine in Test B was fixed in the GREEN commit: the portion line's share reads 86.3% when the row is removed (not 46.3%), so B now checks the grams part (`120 g of 370.4 g`) rather than the full line.

Re-grep for tests pinning the old order: `grep -rn "portion-note" app/src` finds only `IngredientTable.jsx`, `IngredientTable.test.jsx` (reading-mode tests, which render no remove link) and `app.css:940`. `cross-cutting.test.js:704` pins only the `.ingredient-table__remove-gap` word-spacing rule. No other test pinned the order, so none was updated.

## Measurements

Readings come from Playwright WebKit (coarse pointer) and system Chrome (mouse), against the built `app/dist`, not from Mark's devices. Baseline captured from a build of the unchanged source (190 checks, precondition passed: 4 portion notes and 12 links in every Olive Oil v1 cell, both split links under their portion line, Mexican Chocolate v4 has no portion notes). Contexts use Sid's options (`viewport {width, 1000}`, `hasTouch: coarse`, `isMobile: false`, `deviceScaleFactor: 1`).

Row heights are Whole milk / Sucrose, before then after. Gaps are Whole milk / Sucrose after. `note.top - btnBottom` is 0 in every cell (the portion line starts at the link's bottom). Overflow is 0 before and after in every cell.

| Engine | Pointer | Width | Case | Row heights before | Row heights after | Gaps | Table height before / after |
|---|---|---|---|---|---|---|---|
| webkit | coarse | 393 | olive-v1 pen | 95.3 / 93.39 | 75.39 / 75.39 | 13.98 / 13.97 | 1134.97 / 1097.06 |
| webkit | coarse | 393 | olive-v1 restore | 95.3 / 93.39 | 81 / 75.39 | 13.98 / 13.97 | 1170.97 / 1138.67 |
| webkit | coarse | 393 | mex4 pen | n/a | n/a | n/a | 915.22 / 915.22 |
| webkit | coarse | 723 | olive-v1 pen | 95.3 / 93.39 | 75.39 / 75.39 | 13.98 / 13.97 | 1117.06 / 1079.16 |
| webkit | coarse | 723 | mex4 pen | n/a | n/a | n/a | 827.59 / 827.59 |
| webkit | coarse | 744 | olive-v1 pen | 91.3 / 89.39 | 71.39 / 71.39 | 13.98 / 13.97 | 1074.84 / 1036.94 |
| webkit | coarse | 744 | mex4 pen | n/a | n/a | n/a | 790.38 / 790.38 |
| webkit | coarse | 984 | olive-v1 pen | 91.3 / 89.39 | 71.39 / 71.39 | 13.98 / 13.97 | 1114.66 / 1076.75 |
| webkit | coarse | 984 | mex4 pen | n/a | n/a | n/a | 907.91 / 907.91 |
| webkit | coarse | 1024 | olive-v1 pen | 91.3 / 89.39 | 71.39 / 71.39 | 13.98 / 13.97 | 1074.84 / 1036.94 |
| webkit | coarse | 1024 | mex4 pen | n/a | n/a | n/a | 848.19 / 848.19 |
| webkit | coarse | 1366 | olive-v1 pen | 91.3 / 89.39 | 71.39 / 71.39 | 13.98 / 13.97 | 1114.66 / 1076.75 |
| webkit | coarse | 1366 | mex4 pen | n/a | n/a | n/a | 907.91 / 907.91 |
| webkit | coarse | 1600 | olive-v1 pen | 91.3 / 89.39 | 71.39 / 71.39 | 13.98 / 13.97 | 1074.84 / 1036.94 |
| webkit | coarse | 1600 | olive-v1 restore | 91.3 / 89.39 | 71.39 / 71.39 | 13.98 / 13.97 | 1060.45 / 1022.55 |
| webkit | coarse | 1600 | mex4 pen | n/a | n/a | n/a | 790.38 / 790.38 |
| chrome | mouse | 393 | olive-v1 pen | 74.7 / 73.39 | 55.39 / 55.39 | 14.17 / 14.17 | 873.06 / 835.75 |
| chrome | mouse | 393 | olive-v1 restore | 74.7 / 73.39 | 63.25 / 55.39 | 14.17 / 14.17 | 987.22 / 957.77 |
| chrome | mouse | 393 | mex4 pen | n/a | n/a | n/a | 658.47 / 658.47 |
| chrome | mouse | 723 | olive-v1 pen | 74.7 / 73.39 | 55.39 / 55.39 | 14.17 / 14.17 | 873.06 / 835.75 |
| chrome | mouse | 723 | mex4 pen | n/a | n/a | n/a | 614.59 / 614.59 |
| chrome | mouse | 744 | olive-v1 pen | 70.7 / 69.39 | 51.39 / 51.39 | 14.17 / 14.17 | 834.84 / 797.53 |
| chrome | mouse | 744 | mex4 pen | n/a | n/a | n/a | 577.38 / 577.38 |
| chrome | mouse | 984 | olive-v1 pen | 70.7 / 69.39 | 51.39 / 51.39 | 14.17 / 14.17 | 834.84 / 797.53 |
| chrome | mouse | 984 | mex4 pen | n/a | n/a | n/a | 678.44 / 678.44 |
| chrome | mouse | 1024 | olive-v1 pen | 70.7 / 69.39 | 51.39 / 51.39 | 14.17 / 14.17 | 834.84 / 797.53 |
| chrome | mouse | 1024 | mex4 pen | n/a | n/a | n/a | 594.44 / 594.44 |
| chrome | mouse | 1366 | olive-v1 pen | 70.7 / 69.39 | 51.39 / 51.39 | 14.17 / 14.17 | 834.84 / 797.53 |
| chrome | mouse | 1366 | mex4 pen | n/a | n/a | n/a | 678.44 / 678.44 |
| chrome | mouse | 1600 | olive-v1 pen | 70.7 / 69.39 | 51.39 / 51.39 | 14.17 / 14.17 | 834.84 / 797.53 |
| chrome | mouse | 1600 | olive-v1 restore | 70.7 / 69.39 | 51.39 / 51.39 | 14.17 / 14.17 | 820.45 / 783.14 |
| chrome | mouse | 1600 | mex4 pen | n/a | n/a | n/a | 577.38 / 577.38 |

Every non-split row, every second-portion row, every column's left and width, every button's size, and Mexican Chocolate v4's pen are unchanged within 0.5 in every cell (the probe checked all of these in all 31 cells; no check on them failed).

### The restore floor at 393 (plan expectation corrected, decision accepted)

The plan expected every split row to be 15 to 25px shorter and the two split rows to be equal in height. That does not hold for the restore state at 393 (both engines), where the Whole milk row came out at 81 (WebKit, baseline 95.3, drop 14.3) and 63.25 (Chrome, baseline 74.7, drop 11.45), against Sucrose at 75.39 and 55.39.

Cause, measured with a scratch diagnostic and the baseline JSON: at 393 a removed row stacks the struck old value above the live value in the amount and share cells, which sets a height floor. The Whole milk second-portion row, which this change does not touch, already stands at that floor in the baseline restore state: 81 in WebKit and 63.25 in Chrome. The first portion row now lands on exactly that floor, with the link on the name's line (gap 13.98 and 14.17) and the portion line starting at the link's bottom, as intended. At 1600 the restore cells pass the original checks (71.39 and 51.39).

The coordinator accepted this (the placement is what Mark approved; the height expectation was wrong in the plan). Commit `1303ba9` relaxes ONLY the probe's drop and equal-height checks for the `olive-v1 restore` cells at 393 in both engines. For the removed Whole milk row there it now asserts the row is at or above the floor (the baseline second-portion row's height at the same width). The gap of 14, the gap span, the portion line after the link, the portion line starting at the link's bottom, and zero overflow are still checked there, as are the Sucrose drop of 15 to 25 and every other check. `probe matrix,board` now exits 0 (5728 checks passed). The measurement table above is unchanged: the numbers are what they were.

## Board comparison at 1600 (1600-remove-link.html, proposed panel)

| Engine | Pointer | Name | Gap app / board | Row height app / board | Button height app / board |
|---|---|---|---|---|---|
| webkit | coarse | Whole milk | 13.98 / 13.98 | 71.39 / 71.72 | 44 / 44 |
| webkit | coarse | Sucrose | 13.97 / 13.97 | 71.39 / 71.72 | 44 / 44 |
| chrome | mouse | Whole milk | 14.17 / 14.17 | 51.39 / 71.39 | 24 / 44 |
| chrome | mouse | Sucrose | 14.17 / 14.17 | 51.39 / 71.39 | 24 / 44 |

In WebKit with a coarse pointer, where the board and the app both draw a 44px link, the row height is within 1px of the board's (71.39 against 71.72). Pointer-height note: the board draws the link 44px at every pointer. With a mouse the app's link is 24px, so the app's split rows come out about 51px, not the board's 71. The gap and the placement match the board in both engines, and the height difference is the link's own size, not the layout. That is expected and is not a failure.

## Sid's before-readings beside the probe's baseline

Sid's `remove-link-probe-*.json` record the name cell's height (`cellH`) with the link under the portion line (`onNameLine: false`). The probe's baseline row heights are the same readings plus the row's 17.3px of padding:

| Reading | Sid's cellH (webkit coarse, 393 / 744+) | Baseline row height | Sid's cellH (chrome, 393 / 1024+) | Baseline row height |
|---|---|---|---|---|
| Whole milk | 78 / 91 | 95.3 / 91.3 | 58 / 71 | 74.7 / 70.7 |
| Sucrose | 76 / 89 | 93.39 / 89.39 | 56 / 69 | 73.39 / 69.39 |

(Sid's 744+ cell is 91 and the baseline row is 91.3; at 393 his 78 sits in a 95.3 row. The two instruments agree within their rounding.)

## Tests and build

- `npm --prefix app test`: 59 files, 1588 tests passed (1584 plus the 4 new tests; none removed).
- `npm --prefix app run build`: succeeded. `app/dist` is rebuilt from the final source, so Mark's :4173 preview serves it after a hard reload.
- Scope check: under `app/`, the two commits touch only `IngredientTable.jsx` and `IngredientTable.test.jsx`. Nothing under `.planning/sketches` or `.planning/canvas-generators` was touched, and no stylesheet or token changed.

## Deviations from Plan

None in the code. The plan's 15 to 25 drop and equal-height expectations were wrong for the restore state at 393; the probe was corrected in `1303ba9` (see the restore floor above).

## Known Stubs

None.

## Threat Flags

None. No new network endpoint, auth path, file access or schema change; only the order of nodes in one cell.

## Mark's device check (deferred, human-check)

Device UAT is served from the build (`npm --prefix app run build && npm --prefix app run preview -- --host`); his running preview already serves the rebuilt `app/dist`, so a hard reload is enough. The change counts as device-verified only when Mark confirms. On each device, open Olive Oil v1 and tap Next version.

1. iPhone (393): Whole milk's remove link sits on the name's line, after "estimated", with clear space before it, and the "120 g of 370.4 g ..." line sits under both. Sucrose's link sits after its name in the same way. Every other row's remove link is where it was.
2. iPad (1366 landscape, and portrait): the same two rows read the same way, and the table is otherwise unchanged.
3. Tap remove on Whole milk: "restore" takes the same place, on the struck name's line, above the portion line. Cancel the pen without saving. (At 393 expect this row to be as tall as its second-portion sibling, 81px in WebKit; see the restore floor above.)

## Self-Check: PASSED

- FOUND: app/src/ui/IngredientTable.jsx, app/src/ui/IngredientTable.test.jsx
- FOUND: 261004-eoi-probe.mjs, 261004-eoi-baseline.json
- FOUND commits: c49eec6, d9d1a72, 1303ba9
