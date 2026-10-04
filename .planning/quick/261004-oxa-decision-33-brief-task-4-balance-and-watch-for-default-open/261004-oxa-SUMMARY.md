---
phase: quick-261004-oxa
plan: 01
quick_id: 261004-oxa
subsystem: ui
tags: [folds, responsive, sketch-011, decision-33]
requires: []
provides:
  - useSheetTwoColumns, a 984 media read, node-guarded
  - Balance and Watch for open by default from 984
affects: [app/src/ui/RecipePage.jsx, app/src/ui/DerivedAdvisories.jsx, app/src/ui/useBelowDesktop.js]
tech-stack:
  added: []
  patterns: [a fifth copy of the file's node-guarded matchMedia hook shape]
key-files:
  created:
    - app/src/ui/RecipePage.folds.test.jsx
    - .planning/quick/261004-oxa-decision-33-brief-task-4-balance-and-watch-for-default-open/261004-oxa-probe.mjs
    - .planning/quick/261004-oxa-decision-33-brief-task-4-balance-and-watch-for-default-open/261004-oxa-baseline.json
  modified:
    - app/src/ui/useBelowDesktop.js
    - app/src/ui/useBelowDesktop.test.js
    - app/src/ui/RecipePage.jsx
    - app/src/ui/DerivedAdvisories.jsx
decisions:
  - Hook is useSheetTwoColumns over SHEET_TWO_COLUMNS_QUERY '(min-width: 984px)'; with no window it answers true.
  - DerivedAdvisories keeps its foldsOpen prop; RecipePage passes the 984 read, so the page has one media read per cut.
metrics:
  completed: 2026-10-04
status: complete
commits: 2
plan_head_before: edb922481b45b81e8b6b1f7caf1c627f5c309094
plan_head_after: 0fcc2c3f5826caac34c887b5b35a0491c43126d5
---

# Phase quick-261004-oxa Plan 01: Balance and Watch for open from 984 Summary

Balance and Watch for now open by default wherever the Sheet is two columns (984 and up), through one new node-guarded `(min-width: 984px)` hook; Version details, History, Tasting and the batch list keep their 1366 default.

## Result in one line for the orchestrator

Task 1 is built and the plan's fold, crossing and Chrome gates pass. The probe's `after` run exits 1 on two gate (c) readings (Mexican Chocolate v3 at 984 and 1024: the ingredients region's height grows). I did not loosen the gate; the cause is in the grid in `app.css`, outside this task's files. Details under "Probe failure".

## What was built (sketch 011 decision 33, brief (b) and task 4)

- `app/src/ui/useBelowDesktop.js`: `SHEET_TWO_COLUMNS_QUERY = '(min-width: 984px)'` and `useSheetTwoColumns()`, beside `useLogBesideSheet`, same shape as the four existing hooks. With no window or no `window.matchMedia` it answers `true`. The top comment over `BELOW_DESKTOP_QUERY` now says Balance and Watch for read the new query.
- `app/src/ui/RecipePage.jsx`: one `useSheetTwoColumns()` read above the first early return; Balance's `useFold(sheetTwoColumns)`; `<DerivedAdvisories foldsOpen={sheetTwoColumns} />`. VersionRow, RecipeHistory and BatchRow keep the 1366 read. The two comments that would have become false are rewritten.
- `app/src/ui/DerivedAdvisories.jsx`: comment only.
- `app/src/ui/RecipePage.folds.test.jsx` (new, jsdom): RecipePage mounted on Olive Oil v1's tasted batch behind a mutable-width `matchMedia`.
- `app/src/ui/useBelowDesktop.test.js`: S1 and S2 added.

Commits (test first):

- `8307785` test(261004-oxa): pin Balance and Watch for open from 984 (S1, S2, F1 to F5, probe, baseline)
- `0fcc2c3` feat(261004-oxa): Balance and Watch for open by default from 984 (sketch 011 decision 33, brief task 4)

The probe was not changed after the feat commit, so there is no third commit.

## RED then GREEN

- Failed before the change (6): S1, S2, F2 at 984, F2 at 1024, F4, F5.
- Passed before, as guards (9 of the 15 in the two files): F1 at 744 and 983, F3 at 1366, and the existing tests in `useBelowDesktop.test.js`.
- After the change, all 15 pass.

## Choices recorded

- Hook name `useSheetTwoColumns`, constant `SHEET_TWO_COLUMNS_QUERY`: reads as the brief says ("wherever the Sheet is two columns") and pairs with `useLogBesideSheet`. The four older hooks were not refactored into a helper.
- No window answers `true` (the desktop arrangement, as `useBelowDesktop`'s own no-window answer is), so every static render, `DerivedAdvisories`' default `foldsOpen = true` included, stays as it was. S2 proves it under node.
- `DerivedAdvisories` keeps its `foldsOpen` prop, so the page has one media read per cut and its static tests stay valid.
- `DerivedAdvisories.test.jsx` and `RecipePage.test.jsx` were not edited: the component's prop contract did not change, and the new jsdom file proves the width wiring by behaviour.

## Suite and build

- Before: 61 files, 1646 tests. After: 62 files, 1655 tests (plus one file, plus nine tests; none removed).
- `npm --prefix app run build` succeeds.

## Probe readings (WebKit, coarse pointer, 1000 high; fold states: v = Version details, h = History (Mexican Chocolate only), b = Balance, w = Watch for, t = Tasting (Olive Oil only))

Every "board" state below is the board panel's own fold state. Before-states are from `261004-oxa-baseline.json`.

| Cell | Folds before (all closed unless noted) | Folds after | Board folds | Side x, w after (board) | Side top, after (board) | scrollHeight before to after |
|------|------|------|------|------|------|------|
| mex3 744 | all closed | all closed | all closed | 80, 584 (80, 584) | 1009.5 (1318.6) | 1794 to 1794 |
| olive1 744 | all closed | all closed | all closed | 80, 584 (80, 584) | 1367.6 (1461.7) | 3348 to 3348 |
| mex3 983 | all closed | all closed | all closed | 80, 823 (80, 823) | 1009.5 (1318.6) | 1764 to 1764 |
| olive1 983 | all closed | all closed | all closed | 80, 823 (80, 823) | 1313.0 (1407.0) | 3241 to 3241 |
| mex3 984 | all closed | b, w open; v, h closed | b, w open; v, h closed | 640, 264 (640, 264) | 464.3 (540.3) | 1663 to 2313 (+650) |
| olive1 984 | all closed | b, w open; v, t closed | b, w open; v, t closed | 640, 264 (640, 264) | 546.0 (622.0) | 3183 to 3183 (+0) |
| mex3 1024 | all closed | b, w open; v, h closed | b, w open; v, h closed | 666.66, 277.33 (666.66, 277.33) | 464.3 (540.3) | 1663 to 2283 (+620) |
| olive1 1024 | all closed | b, w open; v, t closed | b, w open; v, t closed | 666.66, 277.33 (666.66, 277.33) | 546.0 (622.0) | 3183 to 3183 (+0) |
| mex3 1366 | all open | all open (equals baseline) | no board | 640, 264 | 755.8 | 2317 to 2317 |
| olive1 1366 | all open | all open (equals baseline) | no board | 640, 264 | 609.5 | 2802 to 2802 |

Before the change, the board-against-app fold mismatches were 8 (Balance and Watch for, at 984 and 1024, on both panels). After, there are none.

Gate results (after run): (a) fold states equal the boards at 744, 983, 984 and 1024 on both recipes: pass. (b) side column beside the ingredients at 984 and 1024 with x and width within 0.5 of the board, below the ingredients at 744 and 983: pass. (d) crossings in WebKit with a fine pointer on Olive Oil v1: 983 to 984 opens Balance and Watch for and leaves Version details and Tasting closed; back to 983 closes them; a Hide on Balance at 1024 then 1366 leaves Balance closed and opens Watch for and Version details: pass. (e) system Chrome with a fine pointer at 983 and 984 matches WebKit's fold states: pass. (c) 744, 983 and 1366 equal the baseline in every reading: pass. (c) at 984 and 1024: fold-version, fold-history, fold-tasting, the side column x and width, and Olive Oil v1's ingredients box equal the baseline; Mexican Chocolate v3's ingredients box does not (below).

## Probe failure (two gate (c) readings; reported, not loosened)

`FAIL (c) mex3-984: ingredients box equals the baseline` and `FAIL (c) mex3-1024: ingredients box equals the baseline`. The probe exits 1 (`261004-oxa-probe after: 2 failed`).

- Reading: the `.ingredient-table-region` box on Mexican Chocolate v3 is 537.2 tall before and 862.19 tall after at both widths. Its x, y and width are unchanged. The table inside it is 495.31 tall both before and after, so the extra height is empty space under the table. The method region moves down by the same 325 px (y 1033.5 to 1358.5 at 984).
- Cause: the side column spans the ingredients and method rows of the grid in `app.css`. Open Balance and Watch for make it 1433 tall at 984 (783 before), taller than the two rows, and the grid hands the surplus to the ingredients row. This is the layout the page already has at 1366: the 1366 baseline reads 862.19 for the same region, the same number. It is not caused by anything in this task's files, and I did not touch `app.css`.
- Olive Oil v1 is unaffected: its ingredients region is 758.94 before and after, because its table and method already outgrow the side column.
- The boards draw the same effect (984-batch: ingredients 978.7 tall in the board against 862.2 in the app, with the table 728 tall in the board against 495 in the app; the board's table is the D3 table, a sibling item's change). So this is what the boards show in kind, not a defect of this task. Mark's look at 984-batch and 1024-batch covers it.

## Ungated deltas of the open panels against the boards

| Cell | #fold-balance and #fold-check, app minus board | Cause when over 0.5 |
|------|------|------|
| mex3 984 | dx 0, dy -76, dw 0, dh 0 | The app's page above the panels is 76 px shorter than the board's: the board draws the band, the Go to batch row and the table as decided in decision 33 (brief tasks 1 to 3), which are sibling items. |
| mex3 1024 | dx 0, dy -76, dw 0, dh 0 | Same. |
| olive1 984 | dx 0, dy -76, dw 0, dh 0 | Same. |
| olive1 1024 | dx 0, dy -76, dw 0, dh 0 | Same. |

Also read, ungated: Olive Oil v1's side column is 2064.72 tall in the app and 2082.78 in the board at 984 and 1024 (18.06 more in the board). Not traced; it is not in the Balance or Watch for panels themselves (their heights match to 0.00) and so sits elsewhere in the column (the board's other drawn changes), outside this task.

## Deviations from Plan

None in the code. The one departure is that the final gate run is not green: the two (c) readings above, left as measured.

## Findings for Mark

1. The two fold cuts. From 984 to 1365 the Sheet is open and the band and log are closed: Balance and Watch for open, Version details, History, Tasting and the batch list closed. That is Mark's rule and README finding (5).
2. A consequence of each fold resetting at its own cut. On the 12.9 in iPad, a Balance or Watch for closed in portrait (1024) stays closed after a rotation to landscape (1366), while Version details, History and Tasting reset to open. Before this change a rotation reset all of them. If Mark wants rotation to reset Balance too, that is a one-line change and his call. (Tested: F5 and the probe's gate (d).)
3. The page is longer at 984 to 1365 on Mexican Chocolate v3 by the open panels: scrollHeight 1663 to 2313 (+650) at 984 and 1663 to 2283 (+620) at 1024. Olive Oil v1 does not change (3183 to 3183 at both), because its table and method already outgrow the side column.
4. On Mexican Chocolate v3 at 984 and 1024 the ingredients region is 325 px taller (empty space under the table, method pushed down by the same). Same cause and same number as the page already has at 1366 today. See "Probe failure".
5. The four acceptance boards (984-batch, 1024-batch, 983-batch, 744-batch) were drawn and awaiting Mark's look when this was built. This builds to them as drawn; the app panels match them in fold state, side column x and width, and panel size, and sit 76 px higher because of sibling items.

## Deferred Human Verification

Served from the build (`npm --prefix app run build && npm --prefix app run preview -- --host`; Mark's running preview already serves the rebuilt `app/dist`, so a hard reload is enough). Every reading above comes from Playwright WebKit and system Chrome, not from Mark's devices.

1. On the iPad at 1024 portrait, Olive Oil v1 and Mexican Chocolate v3: Balance and Watch for open beside the ingredients, and Version details and Tasting closed.
2. Rotate to 1366: everything open.
3. Hide Balance at 1024 and rotate: Balance stays hidden (finding 2).
4. On an iPad mini (744), if he has one: all closed.

## For Mark's List

I did not write rows (the constraints reserve that for the orchestrator). Suggested row:

- slug: `oxa-balance-open-984-device-check`
- kind: `check`
- title: "Balance and Watch for open from 984: look at the iPad in portrait and landscape; the one thing to look for is that a Hide on Balance at 1024 stays hidden after a rotation to 1366 (finding 2)"
- where.label: "On the iPad, recipe route (Olive Oil v1 and Mexican Chocolate v3) at 1024 portrait and 1366 landscape"
- addedBy: claude, status: open
- Second, optional row for the orchestrator to weigh: "Mexican Chocolate v3 at 984 and 1024: 325 px of empty space under the ingredient table (grid stretch, same as 1366 today); 984-batch and 1024-batch draw the same effect with the D3 table".

## Threat Flags

None. No new network, auth, file or schema surface.

## Known Stubs

None.

## Scope check

- `git status --porcelain app/` is empty.
- Under `app/`, the two commits touch only the five listed files.
- No commit touches `.planning/sketches`, `.planning/canvas-generators`, `DESIGN.md` or `.impeccable`. The uncommitted sketch README and the untracked files were left as they were.
- The probe served only ephemeral 127.0.0.1 ports; no Vite process was started and :4173, :5173 and :8011 were not requested.

## Self-Check: PASSED

- `app/src/ui/RecipePage.folds.test.jsx`, the probe, the baseline JSON: present.
- Commits `8307785` and `0fcc2c3`: present, test before feat.
- `npm --prefix app test`: 62 files, 1655 tests pass. Build succeeds. Probe `after`: all gates pass except the two (c) readings reported above.
