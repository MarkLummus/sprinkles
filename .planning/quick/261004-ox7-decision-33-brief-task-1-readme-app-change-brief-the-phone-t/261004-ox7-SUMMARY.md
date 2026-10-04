---
phase: quick-261004-ox7
plan: 01
quick_id: 261004-ox7
subsystem: ui
tags: [css, ingredient-table, show-changes, pen, phone-forms, sketch-011, decision-31, p3]
requires:
  - phase: quick-261004-ox3
    provides: app.css Why label rule (not touched here)
  - phase: quick-261004-ox4
    provides: Clear rule in the coarse block (not touched here)
  - phase: quick-261004-ox6
    provides: IngredientTable.jsx remove links on split rows (DOM unchanged by this item)
provides:
  - "Below 724 the ingredient table reads plan / As made / struck, in Show changes, the Total and the pen (P3)"
  - "A probe measuring the built app against the five phone boards, a 320-723 sweep, a wide guard and a reading-view guard, in WebKit and system Chrome"
affects: [261004-ox8 (brief task 2, the grid from 724 up), Phase 04 print]
tech-stack:
  added: []
  patterns:
    - "display: contents on the amount's cell and its struck-holding slot so the struck figure takes grid line 3"
    - "share cell as a reversed flex column spanning three lines when the amount changed"
key-files:
  created:
    - .planning/quick/261004-ox7-decision-33-brief-task-1-readme-app-change-brief-the-phone-t/261004-ox7-probe.mjs
    - .planning/quick/261004-ox7-decision-33-brief-task-1-readme-app-change-brief-the-phone-t/261004-ox7-baseline.json
  modified:
    - app/src/styles/app.css
    - app/src/styles/cross-cutting.test.js
key-decisions:
  - "P3 replaces the three decision 24/25 stacking rules; cross-cutting.test.js pins follow (decision 31 supersedes them)"
  - "Probe checks were not loosened; the failing readings are reported as findings"
requirements-completed: [FORM2-01]
status: complete
commits: 3
plan_head_before: f84fd79fb68b53dbe74c3a4e5a1b1e7a72316558
plan_head_after: a8ba6fd53588b68a218bd19ef6253edec063ae5e
actuals:
  tokens: 13700   # chars/4 over the app and probe diff; the 800 KB baseline JSON is excluded
  tasks: 2
  commits: 3
duration: ~1h
completed: 2026-10-04
---

# Phase quick-261004-ox7 Plan 01: the phone reads plan / As made / struck Summary

**Below 724 a changed row reads its plan amount, As made, then the struck old figure, using CSS only (P3: the amount's cell gives up its box, the struck figure takes grid line 3, the share is a reversed flex column). Show changes on the Mexican Chocolate v4 table moves nothing already on screen, and the app matches the approved boards to 0.5px in WebKit and Chrome. Two readings the plan's checks did not expect are reported below as findings.**

## What was built

Three commits on `main`, by explicit path:

- `dbf72c6` RED: `cross-cutting.test.js` Tests A, B and C. A and C failed before the change, and B (the decision 31 pin) did too.
- `6a6f9f3` GREEN: P3 in `app.css`, plus the probe and the baseline JSON.
- `a8ba6fd` the probe's boards, sweep, wide and reading groups.

Rule diff in words, all inside the phone-forms `@media (max-width: 723.98px)` block:

- `.ingredient-table tr`: row gap goes from the hair to 0.
- `td.ingredient-table__col-grams`: becomes `display: contents` with `text-align: right`. It drops its grid placement and its padding, because a cell with no box has no use for them.
- `td.ingredient-table__col-name`: `grid-row: 1 / 4`, `text-align: left`.
- As made cell (`:nth-last-child(2)`): `margin-top: var(--gap-hair)`.
- The three stacking rules and their comment are deleted. Seven rules follow the `:empty` rule, in the planned order:
  - `tr:not(.ingredient-table__step-head)`: text-align right.
  - The slot holding a struck figure: `display: contents`.
  - The struck amount: block, grid line 3, a hair above, right-aligned.
  - A removed row's lone struck amount: line 1, no margin.
  - The share holding a struck figure: reversed flex column.
  - That share when the amount also changed: `grid-row: 1 / 4`, space-between.
  - The share's struck figure: margin 0.
- The `.prose-struck-beneath` comment is rewritten as the plan said ("the one place a struck value is a paragraph of its own"). It is a comment only.

No DOM, token, `IngredientTable.jsx` or other stylesheet change. Under `app/` only `app.css` and `cross-cutting.test.js` changed.

Why the new rules lose nothing against the three old ones: they set only display block and a zero right margin. P3's rules set display block and a zero margin on every struck figure in the amount's cell, and a zero margin on the share's (a flex item, so display is moot). As made never holds a struck figure. No other stylesheet mentions the table, so the phone block has the last word below 724.

`cross-cutting.test.js` changed because decision 31 supersedes the decisions 24/25 pins. The ordered selector list now ends with the seven P3 rules, each P3 declaration is pinned, and the list row's row gap is pinned at 0.

Adapted to HEAD: siblings ox3 to ox6 had landed. Their changes did not touch the phone-forms block, so the plan's anchors held by selector. I re-read the line numbers.

## Suite

Start: 62 files, 1666 tests, green. End: 62 files, 1666 tests, green; Test B replaced the 24/25 test one for one, so none was removed. `tabindex-scan.test.js` passes (26). `npm --prefix app run build` succeeds.

## Before and after, by board (mismatching checks out of 105)

| Board | Window | Before WebKit | Before Chrome | After (both engines) |
|---|---|---|---|---|
| 393-show-changes | 393 coarse | 52 | 52 | 0 |
| 723-show-changes | 723 fine | 52 | 52 | 0 |
| 723-show-changes | 723 coarse | 52 | 52 | 0 |
| 393-pen-changes | 393 coarse | 38 | 39 | 0 |
| 723-pen-changes | 723 fine | 41 | 41 | 0 |

The baseline JSON came from a build of the unchanged source. The precondition held: struck above the plan, plan dropping 18px (8.17 to 26.17), and the 393 board mismatching.

Cases board at 393 coarse:

- Panel 1 (Strawberry with its batch) matches by name in both engines.
- Panel 2 (Mocha v3) matches by name in both engines.
- Panel 3 (the live removed row) has the finding 2 mismatch below.
- Panels 4 and 5 are report only. Panel 4 rows: 35 / 49.39 / 63.78 (WebKit) and 35 / 49.39 / 49.39 (Chrome) / 55. Panel 5: 55. Every row of the app's Mexican Chocolate v4 Show changes is a changed row, 55 tall.

## The 393 numbers (WebKit, then Chrome, against each board's own reading)

Mexican Chocolate v4 with Show changes:

| | WebKit | Chrome |
|---|---|---|
| Table | 748.59 (board 748.59) | 748.59 (board 748.59) |
| Reading table, for comparison | 507.08 | 501.41 |
| Changed row | 55 | 55 |
| Total | 55 | 55 |
| Name track | 223.48 / 232.7 / 269 | 224.8 / 233.14 / 269 |
| Plan y, reading vs Show changes | 8.17 vs 8.17 | 8 vs 8 |

The name track at 393 is 223.5 in WebKit, as Sid read.

- Largest movement of any static figure, reading to Show changes: 0.
- Name-width delta: only the Salt row, 9.22 in WebKit and 8.34 in Chrome (axn finding 1, unchanged).

Pen after editing (WebKit; Chrome table 937.91 equals its board):

| Row | 393 coarse | Board |
|---|---|---|
| Table | 958.41 | 958.41 |
| Changed row | 81 | 81 |
| Share-only row | 61 | 61 |
| Removed row | 81 | |
| Total | 55 | 55 |
| Field | 52 x 44 | 52 x 44 |

At 393 the Cinnamon field is first and its struck parent is under it. The Total's struck number is under the current total.

Strawberry with its batch, a changed row with a hand: Whole Milk 3.5% is 77 in the app and 77 on the board in both engines. The order is plan, hand, struck, with right edges within 0.5. Lecithin stays at 35 (one line).

The live removed row:

- Cinnamon's slot `innerHTML` is exactly `<span class="struck-value">2.77 g</span>`.
- Its height is 36.91 in WebKit and 36.31 in Chrome, equal to an unchanged one-line row. That is the plan's real intent: the row is one line tall.
- The struck amount's y and right match the board. See finding 2 for the two mismatches.

## The 723 comparisons

- `723-show-changes` matches at 723 fine and at 723 coarse in both engines: table 748.59 each, rows 55, name track 553.48 / 562.7 / 599 (WebKit) and 554.8 / 563.14 / 599 (Chrome).
- `723-pen-changes` matches at 723 fine: table 736.34, changed row 63.25, share-only row 53, Total 55, field 52 x 26.25.
- 723 coarse pen has no board. Its order check passes and its field is 52 x 44; the table is 900.59.

## Sweep totals

Every integer width from 320 to 723, in four states each: 404 widths, WebKit coarse and Chrome fine.

| State | Collisions | Overflow | Largest static move | Narrowest name track (WebKit / Chrome) |
|---|---|---|---|---|
| mex4 Show changes | 0 | 0 | 0 | 150.48 / 151.8 |
| strawberry batch Show changes | 0 | 0 | 0 | 150.48 / 151.8 |
| mocha3 Show changes | 0 | 0 | 0 | 150.48 / 151.8 |
| mex4 pen, Chrome fine | 0 | 0 | 0 | 151.8 |
| mex4 pen, WebKit coarse | 0 | 0 | 8 (finding 1) | 150.48 |

- Every struck figure is last, at every width in all eight runs. The pen's narrowest name track at 320 is at least 149.5 in both engines.
- The Salt row's name delta (report only) tops out at 9.22 in WebKit and 8.34 in Chrome.

## The wide result

At 724 and 1366 fine, in both engines, for mex4 Show changes, straw-batch Show changes and the mex4 pen after editing: 12 reads, 0 differences from the baseline at 0.5px. Every struck figure (25, 17 and 14 per state) is still inline with its 2px margin. Nothing changed from 724 up.

## Reading-view table heights, before to after

| | WebKit 393c | WebKit 723f | Chrome 393c | Chrome 723f |
|---|---|---|---|---|
| mex4 | 515.92 to 507.08 | 515.59 to 506.75 | 515.59 to 501.41 | 515.59 to 501.41 |
| straw | 486.66 to 476.77 | 486 to 476.44 | 486 to 472.88 | 486 to 472.88 |
| untouched pen | 915.55 to 899.55 | 614.59 to 588.59 | 878.22 to 858.22 | 614.59 to 588.59 |

No row grows and none shrinks by more than 2px, which is the hair leaving rows with no lower figure. The row count, name x, plan right, share right and As made right are within 0.5 everywhere. Sid's reference figures hold: 516 to 507 for Mexican Chocolate v4 reading, Total 38 to 36, untouched pen 915 to 899.

## Deviations from Plan

None in code. Probe additions beyond the plan, so the findings can be read:

- `PROBE_FAIL_CAP` prints every failure, not the first 40.
- Panels 4 and 5 report every Show changes row, because the plan's "unchanged rows" list is empty. Every row in that table changes.
- `baseline.json` is written compact (800 KB, not 1.5 MB).

## Findings for Mark

The probe exits 1 on 2,036 checks, which come down to three distinct readings. I did not loosen any check or change any threshold. None looks like a P3 placement error, because the boards group matches the approved boards. The plan's checks assumed something the boards do not draw.

1. **The pen's share-only rows drop their current share 8px in WebKit with a coarse pointer.**
   - Five rows are affected: Cream, Dried Skimmed Milk Powder, Dextrose, Allulose and Stabilizer Mix 4421. Each moves from y 8.17 to 16.17 when a pen edit changes its share, at every width from 320 to 723.
   - Cause: the share cell becomes a reversed flex column, which packs from the bottom, inside the 44px first line the coarse field sets.
   - The app matches `393-pen-changes` within 0.5 for these rows (share-only row 61 on both). So the board draws this drop. The plan's "the current share stays put" holds for Show changes and not for this pen state.
   - Chrome with a mouse (26px line) and the Show changes states move 0. The field itself moves 0 everywhere.
   - Decision for Mark: is the drop fine, or should the board change?

2. **The live removed row (cases panel 3): 2 mismatches per engine.**
   - The app's Cinnamon row is 36.91 (WebKit) or 36.31 (Chrome). The board's constructed Salt row is 35.39.
   - The app's row equals an unchanged one-line row, and the amount struck matches the board. The board's row carries no "estimated" chip, so its line is about 1.5px shorter. This looks like a board-versus-app difference in the row's content, not in P3.
   - The lone struck share sits at the bottom of the taller row: y 10.07 (WebKit) or 9.31 (Chrome) against the board's 8.56 or 8.39. It is about 1.9px below the struck amount on line 1, where the board has 0.4px.

3. **The Total's plan figure moves up 1.33px in WebKit and 1.0px in Chrome in the reading view.**
   - Row heights: Total 38.33 to 36.33.
   - Cause: the amount's cell gave up its box, so its own 18px strut is gone and the number no longer takes the cell's offset. The "Total" label stays at y 9.5. The Total's amount now sits 1.33px above the label's top.
   - The 393 board draws the same offsets (the Total's plan y matches in the tracer and boards groups), so this is P3 as drawn. It fails only the reading-view plan y check, in 6 states per engine (the three states at each of 393c and 723f).

Other findings from the plan's list:

- Reading-view rows below 724 are up to 2px shorter (P3's row gap 0). Phone boards drawn before 2026-10-03 still draw 37px rows.
- In batch rows whose amount changed, one blank line (the As made line, about 17px) sits between a share and its struck figure. Mark approved this on the boards.
- Print: the phone block has no `screen` qualifier, so a print page narrower than 724 CSS px (A4 in Chrome is about 718) already prints the list form, and P3 rides along. Not scoped here. Left to Phase 04.
- The `.struck-value` comment ("immediately before the value that replaced it") becomes stale at the wide widths only when brief task 2 lands.
- The Salt row's name-width delta (axn finding 1) is unchanged by P3.
- A constructed board's rows can differ from the app's in details like the estimated chip. The cases board's panel 4 and 5 rows are report only, as planned.

## Threat Flags

None. CSS only; no new markup, endpoint or schema.

## Known Stubs

None.

## Deferred Human Verification

Mark's running preview already serves the rebuilt `app/dist`, so a hard reload is enough. Otherwise: `npm --prefix app run build && npm --prefix app run preview -- --host`. Then on the iPhone at 393:

- Mexican Chocolate v4: turn Show changes on and off. The plan amounts and the shares do not move, and the struck figure appears under each changed amount.
- Strawberry v2.1 with its batch: the hand stays put, and the struck figure is last.
- The Next version pen: editing an amount does not move its field, and the old amount appears under it. Look at the share-only rows (finding 1).

Engines, not devices: every reading above comes from Playwright WebKit and system Chrome, not Mark's devices.

## For Mark's List

I did not write list rows; the orchestrator files them.

1. kind `check`, slug `ox7-phone-p3-device-check`, title "iPhone: Show changes keeps plan and As made still".
   - `where`: the Mexican Chocolate v4 Show changes toggle, the Strawberry v2.1 batch view, and the Next version pen, all at 393.
   - What to look at: the three states in the section above.
2. kind `decide`, slug `ox7-pen-share-drop`, title "Pen: share-only rows drop their share 8px on a coarse pointer".
   - Options: (a) leave it, as the approved 393-pen-changes board draws it, recommended; (b) pin the current share to the top line and redraw the board.
   - `where`: the Next version pen on the iPad or iPhone, after editing an amount. Finding 1.

## Self-Check: PASSED

- Files exist: `app/src/styles/app.css`, `app/src/styles/cross-cutting.test.js`, the probe, the baseline JSON and this SUMMARY.
- Commits exist: `dbf72c6`, `6a6f9f3`, `a8ba6fd`.
- Under `app/`, the commits touch only `app.css` and `cross-cutting.test.js`. Nothing touches sketches, canvas-generators, DESIGN.md or `.impeccable`. `git status --porcelain app/` is empty.
