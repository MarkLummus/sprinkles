---
phase: quick-261002-axn
plan: 01
subsystem: ui
tags: [css, ingredient-table, show-changes, pen, sketch-011, decisions-24-25]
requires:
  - phase: 03.5
    provides: list-form ingredient table below 724, 03.5 probe harness
provides:
  - struck old figure stacked above the current one below 724 (amount, share, pen's struck parent)
  - removed row prints one struck amount in Show changes
  - probe measuring five boards and a 320-723 sweep in WebKit and system Chrome
affects: [ingredient-table, recipe-version-route]
tech-stack:
  added: []
  patterns: ["child-combinator rules in the 723.98px block hang the stacking on markup position, not on a new class"]
key-files:
  created:
    - .planning/quick/261002-axn-stack-the-struck-old-figure-above-the-ne/261002-axn-probe.mjs
  modified:
    - app/src/styles/app.css
    - app/src/styles/cross-cutting.test.js
    - app/src/ui/IngredientTable.jsx
    - app/src/ui/IngredientTable.test.jsx
key-decisions:
  - "Three rules in the existing 723.98px block, each display:block + margin-right:0; no token, no markup change"
  - "DiffGramsCell prints no current amount on a removed row; aria-label left as it was"
requirements-completed: [FORM2-01]
status: complete
commits: 4
plan_head_before: 314377d03604463e3bcabd153d5b2148cdbda707
plan_head_after: 35ada81f93ad451245a639241f6be7ccffaaf2fa
actuals:
  tokens: 10000
  tasks: 3
  commits: 4
duration: ~35min
completed: 2026-10-02
---

# Phase quick-261002-axn Plan 01: Stack the struck old figure above the new one Summary

Below 724, Show changes and the pen now stand the struck old amount and share above the current ones, right-aligned in the same tracks (three `display:block; margin-right:0` rules), and a removed row prints its one struck amount alone; both engines match the five sketch 011 boards within 1px and show zero collisions and zero overflow across 320 to 723.

**Device-unverified.** Nothing was checked on Mark's iPhone or iPad. Playwright WebKit (iPhone 14 profile) and system Chrome are not the device, and neither reproduces its text rendering. Mark's iPhone check of 393 Show changes and the pen is still owed, and decision 25's boards were still awaiting his look when this ran.

## Commits (on main)

| Commit | Message |
| --- | --- |
| 8e8b42c | fix: stack the struck old figure above the new one below 724 (app.css, cross-cutting.test.js, probe) |
| ffbc689 | test: pin a removed row's single struck amount (RED, failed first) |
| d2a3039 | fix: a removed row prints one struck amount in Show changes (`!rowDiff.removed &&` in DiffGramsCell + one comment sentence) |
| 35ada81 | docs: probe groups boards, sweep, sweep-fine, wide |

SUMMARY.md is uncommitted by instruction (the orchestrator commits it).

## What changed

- `app/src/styles/app.css`: three rules appended in the `(max-width: 723.98px)` block, after the `col-numeric:empty` rule, with one comment citing decisions 24 and 25. Selectors: `.ingredient-table__plan-grams > .struck-value` (Show changes amount and the Total's struck figure), `.ingredient-table td.ingredient-table__col-numeric > .struck-value` (struck share), `.ingredient-table td.ingredient-table__col-grams > .struck-value` (the pen's struck parent). From 724 up the base `.struck-value` rule is untouched.
- `app/src/ui/IngredientTable.jsx`: DiffGramsCell's second child is now `{!rowDiff.removed && ...}`.
- `app/src/styles/cross-cutting.test.js`: the phone-forms block test pins an exact ordered selector list with `toEqual`, so adding rules would have failed it. The list is extended by the three selectors, and one new test asserts each rule's `display:block` and `margin-right:0` (decisions 24 and 25).
- `app/src/ui/IngredientTable.test.jsx`: the never-reorders test pins the removed row's slot as exactly `<span class="ingredient-table__plan-grams"><span class="struck-value">20 g</span></span>`.

## Suite

55 files / 1506 tests pass (baseline 1505 plus the one new cross-cutting test; the unit-test pin is an added assertion in an existing test). `src/ui/tabindex-scan.test.js` passes (26 tests). Build succeeds. No assertion removed or weakened.

## Measured: 393 coarse (iPhone 14 profile), Mexican Chocolate v4 Show changes

Each figure is the app against the board, both read from the real DOM; every row, cell box, struck box and table height compared within 1px.

| Reading | WebKit app / board | Chrome app / board | Drawn in plan |
| --- | --- | --- | --- |
| Table height | 749.92 / 749.92 | 749.59 / 749.59 | 750 |
| Changed row (reading view 37) | 55 | 55 | 56 (from 38) |
| Total row (reading view 38.3) | 56.3 | 56 | |
| Name track, narrowest / widest-share rows / Total | 223.48 / 232.70 / 269 | 224.80 / 233.14 / 269 | 223 |
| Overflow | 0 | 0 | 0 |

Pen at 393 coarse (Whole Milk 600, Sucrose 36, Cocoa 45, Cinnamon removed), app and board agree:

| Reading | WebKit | Chrome | Drawn |
| --- | --- | --- | --- |
| Changed row (Whole Milk) | 81 / 81 | 81 / 81 | 81 |
| Share-only row (Cream) | 63 / 63 | 63 / 63 | 63 |
| Total | 56.33 / 56.33 | 56 / 56 | 56.3 |
| Field | 52 x 44 | 52 x 44 | 52 x 44 |
| Table height | 951.83 / 951.83 | 950.91 / 950.91 | |

Strawberry v2.1, batch in view, Show changes on, 393 coarse, matched by name to the cases board: Whole Milk 3.5% (changed row with a hand) 75 / 75 in both engines; Lecithin (unchanged) 37 / 37; Total 77.66 / 77.66 (WebKit), 77 / 77 (Chrome). The hand's top sits at or below the current amount's bottom minus 0.5, with right edges within 0.5.

Removed row, live (pen saved as "stack check" in a throwaway context, then Show changes): the Cinnamon slot `innerHTML` is exactly `<span class="struck-value">2.77 g</span>`; height 37 in both engines, equal to the cases board's removed row (37) and to an unchanged one-line row (37).

## Measured: 723 fine

| Board | Table height app / board (WebKit) | Chrome | Other |
| --- | --- | --- | --- |
| 723-show-changes.html | 749.59 / 749.59 | 749.59 / 749.59 | changed row 55; name track 553.48 / 562.70 / 599 (WebKit), 554.80 / 563.14 / 599 (Chrome) |
| 723-pen-changes.html | 753.34 / 753.34 | 753.34 / 753.34 | changed row 63.25, share-only 55, Total 56, field 52 x 26.25 |

Both engines, every row, cell, struck and field box within 1px of the boards.

## Measured: sweep, 320 to 723 (404 integer widths), by state, engine and pointer

Four states per engine, each swept off then on, coarse (iPhone 14 profile) and fine. Every cell below is identical for coarse and fine.

| State | Engine | Widths read | Collisions | Max overflow | Narrowest name track | Max name-track diff from off | Unchanged rows moved |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Mexican Chocolate v4 Show changes | WebKit | 404 | 0 | 0 | 150.48 | 9.22 (at 320) | 0 |
| Mexican Chocolate v4 Show changes | Chrome | 404 | 0 | 0 | 151.80 | 8.34 (at 320) | 0 |
| Mocha v3 Show changes | WebKit / Chrome | 404 | 0 | 0 | 150.48 / 151.80 | 0 | 0 |
| Strawberry v2.1 batch Show changes | WebKit / Chrome | 404 | 0 | 0 | 150.48 / 151.80 | 0 | 0 |
| Mexican Chocolate v4 pen (4 edits) | WebKit / Chrome | 404 | 0 | 0 | 150.48 / 151.80 | 0 | 0 |

36,362 checks passed per pointer run. `innerWidth` equalled the requested width at every step. Pen narrowest name track at 320 is 150.48 (WebKit), 151.80 (Chrome), above the 149.5 floor.

Wide group (724 and 1366, fine, fresh context each, both engines): all 25 struck figures in the amount and share cells are `display: inline` with `margin-right: 2px`. Nothing changed from 724 up.

## Deviations from Plan

### Findings and probe adjustments (no app change)

**1. [Finding] The name track is not equal to its reading-view width on one row of Mexican Chocolate v4.**
- Plan and decision 24 say Show changes leaves the name track at its reading-view width. The Salt row's name cell is 232.70 in the reading view and 223.48 with Show changes on (WebKit; 233.14 to 224.80 in Chrome), at every width 320 to 723 (max 9.22 at 320). Cause: the grid's third track is `max-content` per row, and Salt's struck share "10.0%" is wider than its current "0.1%". Every other row, and every row of Mocha v3, Strawberry v2.1 and the pen, keeps its width exactly. The board draws the same thing (app and board match within 1px).
- The plan's "223 at 393" is the narrowest row's width, not every row's: other rows are 232.70, and the Total is 269, in the reading view too. The probe asserts the floor that does hold (no name cell narrower than the reading view's narrowest, at every width) and reports the Salt row. No collision results. If Mark wants Salt's name unmoved, that is a drawing change for him, not something to fix here.

**2. [Finding] The plan's heights for Mexican Chocolate v4 and the batch row differ from the board's by 1 and 3px.**
- Changed row 55 (plan 56), reading-view row 37 (plan 38), Strawberry hand row 75 (plan 78), in both engines. The app and the boards agree exactly with each other (the boards draw 55, 37 and 75), so the probe compares to the board rather than to the plan's figures. The table is 749.92 against the board's 749.92 (plan 750).

**3. [Finding] The cases board draws its panels' tables 313px wide where the app's is 353 at 393.**
- Strawberry's name track and share right edge therefore differ by exactly 40px from the cases board (app name 223.48, board 183.48). Heights, amount tracks, struck tops and the hand match. The probe compares figures that hang off the right edge against the board's own right edge shifted by that 40px. Not changed here: boards are out of scope.

**4. [Probe] The struck-to-current right-edge check uses 1px in the pen, 0.5 elsewhere.** The pen slot's current content (a 52px field and " g") is 64.89 wide in a 64px track in WebKit (64.78 in Chrome), so it overhangs the struck figure's right edge by under 1px. The boards draw the same overhang (struck and field positions match within 1px). The Total's struck figure is exempt from the right-edge check, because it carries no unit; its stacking is still asserted.

**5. [Probe] The pen's off-state for the sweep is the unedited pen, not the reading view.** Reading-view rows have no 44px field, so heights differ for reasons that are not this change. Unchanged rows are compared between the unedited pen and the edited pen.

### Auto-fixed issues

None. The probe, not the app, absorbed items 1 to 5; no app code beyond the plan was touched.

## Auth gates

None.

## Known Stubs

None.

## Threat Flags

None. No new endpoint, auth path, file access or schema. T-axn-01 holds: the one JSX change removes a text child behind a boolean; values stay React text. The probe bound only 127.0.0.1 ephemeral ports, aborted every other host, ran the live save in a throwaway context, and started no Vite process; :5173 and :4173 were not touched (the build rewrote `app/dist`, which :4173 serves, as the constraints allowed).

## Self-Check: PASSED

- FOUND: app/src/styles/app.css, app/src/styles/cross-cutting.test.js, app/src/ui/IngredientTable.jsx, app/src/ui/IngredientTable.test.jsx, the probe
- FOUND commits: 8e8b42c, ffbc689, d2a3039, 35ada81 (4 measured from the ledger: `git rev-list --count 314377d..HEAD`)
- Diff confined to the five planned files; tokens.css, sketches, generators and CLAUDE.md untouched; untracked `.impeccable/critique/` files not staged; nothing pushed.
