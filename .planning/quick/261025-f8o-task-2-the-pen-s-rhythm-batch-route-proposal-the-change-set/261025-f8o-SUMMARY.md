---
phase: quick-261025-f8o
plan: 01
quick_id: 261025-f8o
subsystem: notebook-log
tags: [pen-rhythm, record-pen, why-blank, clear-hit-area, control-size, blank-axis, webkit-probe]
requires: [261025-f8n]
provides:
  - "The record pen's rhythm in the log column: 6, 12, 20, 32 and 18 under each head, no caption reserve"
  - "At draw and From freezer read cue, Why blank caption, options; a pick moves nothing"
  - "Clear is a box no taller than the 20px head line with an overflowing ::after target (24 fine, 44 coarse) at every width"
  - "The pen's segmented options and axis stops read 14 (--app-size-meta)"
  - "A blank axis renders its name alone"
  - "The reading's Tasting head gives 18 to its first cell"
  - "261025-f8o-rhythm-probe.mjs: WebKit probe on a scratch build, reusable by 261025-f8p"
affects: [261025-f8p]
tech-stack:
  added: []
  patterns:
    - "Design values read from custom properties through a temporary element, no px literal in the probe"
    - "Interval rows matched in document order by name, each within 1px"
key-files:
  created:
    - .planning/quick/261025-f8o-task-2-the-pen-s-rhythm-batch-route-proposal-the-change-set/261025-f8o-rhythm-probe.mjs
  modified:
    - app/src/ui/MarkOneField.jsx
    - app/src/ui/MarkOneField.test.jsx
    - app/src/ui/AxisMark.jsx
    - app/src/ui/AxisMark.test.jsx
    - app/src/ui/BatchRow.test.jsx
    - app/src/styles/notebook.css
    - app/src/styles/notebook.test.js
    - DESIGN.md
    - .planning/phases/10-the-creation-editor-without-save/10-walk-before.json
decisions:
  - "decide-p10-pen-caption-align: flex-end"
  - "decide-p10-control-text-size-r2: both 14"
  - "decide-p10-at-draw-caption: caption, the word Why blank"
  - "decide-p10-reading-head-interval: 18"
metrics:
  tasks: 3
  commits: 5
  tests_before: 3746
  tests_after: 3759
status: complete
actuals:
  tokens: 17000
  tasks: 3
  commits: 5
plan_head_before: db7a15d9360c2e3e99aa096390ccd7fad6f42366
plan_head_after: 60c7bd86fa28b72bde031929fabfa4cb66e863e7
requirements-completed:
  - decide-p10-pen-caption-align
  - decide-p10-control-text-size-r2
  - decide-p10-at-draw-caption
  - decide-p10-reading-head-interval
  - look-p10-pen-rhythm-board
---

# Phase quick-261025-f8o Plan 01: The pen's rhythm Summary

The record pen now reads four steps (6, 12, 20, 32) and 18 under each head instead of a stack of equal rows. In Playwright WebKit on a scratch build, every interval in the plan's table R1 to R39 reads within 0.05px of its target at 1366 coarse, 1366 fine and 393 coarse. The probe ends 200 PASS, 0 FAIL.

## What was built

**Task 1, At draw and From freezer end to end (tracer).**
- `MarkOneField.jsx`: a `span.pen-caption.segmented-field__caption#mo-<key>-why` reading "Why blank" between the head and the radiogroup, in every state. The radiogroup's `aria-labelledby` names the cue and the caption.
- `notebook.css`, a new rhythm block after the defects-head rule:
  - The head-line rule `.notebook-log .batch-margin--pen .axis-mark__head, ... .segmented-field__head` gives min-height `--app-notebook-pen-cue-line-h` and `align-items: flex-end`.
  - The Clear rule gives min-height 0 and `position: relative`. Its `::after` is the wide-touch mechanism lifted into the log: `--sheet-text-control-min` (24) by default, `--touch-min` (44) under `(pointer: coarse)`.
  - Mark-one section edited in place: the head's margin-bottom is `--gap-s`, the seam under a note is `--gap-s`, and `.mo-group > .segmented-field__caption` gets its own `--gap-xs`.
  - The phone `(max-width: 723.98px) and (pointer: coarse)` cue-margin step is deleted. The media list is five steps.

**Task 2, the rest of the column.**
- `notebook.css`: the field-row caption reserve is off (`min-height: 0`). The label margin is 0 (pen-scoped). `.batch-margin__field` is 12 above with no gap, Next time stays 32. `.note-block` is 12 above and below with no padding. A segmented field after a segmented field is 12 above. Every axis has margin-top 0 (the `:first-of-type` rule is replaced). `.tasting-head` gives 18. The reading's first conditions grid gives 18 (`.tasting-reading .tasting-reading__conditions:first-child`). The pen's options and stops read `--app-size-meta`.
- `AxisMark.jsx`: the state span renders only on a marked axis.

**Task 3, proof and records.**
- Probe extended: R1 to R39 gated at three configurations; control sizes, boxes and rows; state-span count; no caption wraps at 393, 723, 724 and 1366; reading RR1 and RR2 at 1366 and 393.
- DESIGN.md: five appended sentences and one new bullet, "The record pen's rhythm in the log column".
- Walk baseline: 48 `snapshot.textHash` leaves.

## Interpretation choices (from the plan)

1. Pen scope where a log-wide selector would reach the creation editor's Kind control. The head-line rule and the control-size rule are `.batch-margin--pen`-scoped, and so is the `.field-row__label` margin rule. The probe's pen heads (11) and option boxes (13) are pen-only. The Kind control is untouched; `notebook.test.js` pins that no non-pen rule names `.segmented-field__head` with a min-height.
2. Clear at a fine pointer: the `::after` is the text-control minimum (24) at a fine pointer and the touch floor (44) under a coarse one. Clear's box is its word at every pointer. The probe shows 24 at f1366 and 44 at c1366 and c393; a pick moved nothing at all three (825.23 to 825.23 at c1366, 760.73 at f1366, no change at c393).
3. P10_Pen's 393 panels draw the heads that hold a Clear at 44 (options to next caption 39.8, Every recipe to Hardness 41, anchors to Smoothness 49). The app, with Clear lifted at every width, reads 15.8, 17 and 25 at 393 as at 1366. This is Mark's decided item 1; the board may want redrawing.
4. The board's two additions were taken: `.notebook-log .note-block { margin-top: var(--gap-s) }` and the Why blank caption's own 6. The textarea to Melt test row reads 15.3 as the board does.
5. "(Not recorded)" lived only in AxisMark.jsx and AxisMark renders only in the pen, so the reading needed nothing.
6. No edit to `app.css`, `tokens.css` or `print.css` (`git diff` against the base is empty for all three).

Task 3 Step 1 changed nothing: no rule needed fixing; every row passed on the first run after Task 2.

## Probe results

Final line: **200 PASS, 0 FAIL** (c1366, f1366, c393 for scenario A; c1366 and c393 for the reading; c723 and c724 for the captions).

Interval values, measured/target, identical at all three configurations (c1366 = f1366 = c393 to 0.1px for every row):

| Row | Target | Measured | Row | Target | Measured |
| --- | --- | --- | --- | --- | --- |
| R1 Batch to Churn date | 18 | 18.0 | R22 -12 field to How did it turn out? | 12 | 12.0 |
| R2 | 6 | 6.0 | R23 | 6 | 6.0 |
| R3 | 2 | 2.0 | R24 textarea to Melt test | 15.3 | 15.3 |
| R4 Required to Churn duration | 12 | 12.0 | R25 | 6 | 6.0 |
| R5 | 6 | 6.0 | R26 Melt test field to Melt style | 15.8 | 15.8 |
| R6 | 12 | 12.0 | R27 | 6 | 6.0 |
| R7 | 6 | 6.0 | R28 options to Next time | 32 | 32.0 |
| R8 | 12 | 12.0 | R29 | 6 | 6.0 |
| R9 | 6 | 6.0 | R30 textarea to From freezer | 12 | 12.0 |
| R10 textarea to At draw | 12 | 12.0 | R31 From freezer to Why blank | 12 | 12.0 |
| R11 At draw to Why blank | 12 | 12.0 | R32 | 6 | 6.0 |
| R12 Why blank to options | 6 | 6.0 | R33 options to Every recipe | 20 | 20.0 |
| R13 options to Exit consistency | 15.8 | 15.8 | R34 Every recipe to Hardness | 17 | 17.0 |
| R14 | 6 | 6.0 | R35a, R35b | 6, 2 | 6.0, 2.0 |
| R15 options to Airiness | 15.8 | 15.8 | R36a, b, c anchors to next axis | 25 | 25.0 each |
| R16 | 6 | 6.0 | R37 anchors to This recipe only | 45 | 45.0 |
| R17 options to .tasting-head | 32 | 32.0 | R38 | 17 | 17.0 |
| R18 .tasting-head to Tasted | 18 | 18.0 | R39 anchors to Oil | 25 | 25.0 |
| R19 | 6 | 6.0 | RR1 reading Batch head to first cell | 18 | 18.0 (c1366, c393) |
| R20 Tasted field to Tasting temperature | 12 | 12.0 | RR2 reading Tasting head to first cell | 18 | 18.0 (c1366, c393) |
| R21 | 6 | 6.0 | | | |

Against the board (P10_Pen, `p-pen-measure.json`):
- Where f8p's work explains the board's figure: R1 (board 30.6, its 44px head row is f8p's), R4 and R20 (the board draws the trio on one line), R18 (board 36.6, f8p's h2 in a 44px row), and the board's R17 region seam.
- The 393 rows where the lifted Clear departs from the board (choice 3): R13, R15 (board 39.8, app 15.8), R34 (board 41, app 17), R36b (board 49, app 25).
- Every other row equals the board.

Other gates, at all three configurations:
- 11 pen heads are the 20px line (blank, marked and off).
- 5 Clears, each at most 20 tall; `::after` 44 coarse, 24 fine.
- 13 option boxes and 30 axis stops compute 14px. Options are 44 tall coarse and 32 fine, stops 44 x 44. Every segmented control stays on one row.
- Two state spans for the two marked axes (of six).
- 16 pen captions, none wraps (also at 723 and 724).
- Two "Why blank" captions in the Exit consistency caption's face (12px/600/uppercase); each radiogroup is named by two ids that exist.

RR1 and RR2 were not run against the base, but R-rows measured before Task 2 (R1 32.4, R4 38.4, R6 18, R13 3.8, R36 45) show the probe reads the rule changes.

## Verification

| Gate | Result |
| ---- | ------ |
| Walk at base before any edit | MATCH 94 snapshots |
| `npm --prefix app test` | 3759 passed, 120 files (base 3746 plus 13 added) |
| Probe on the final build | 200 PASS, 0 FAIL |
| Walk after the baseline update | MATCH 94 snapshots |
| Baseline diff since base | 48 `snapshot.textHash` lines, 0 other lines |
| `app.css`, `tokens.css`, `print.css` against base | unchanged |
| `git diff --name-only` base..HEAD | only paths in files_modified |

Walk leaves updated (48, every one a snapshot with `pens.record >= 1`): record-pen-edit-handlers 29, record-pen-blocked 6, record-pen-save 1, record-pen-kept-draft 2, correct-save 2, correct-kept-draft 2, tasting-remove-restore 5, tasting-save 1. A check over before and after found no other leaf differing and no pen-open snapshot left unchanged.

Existing tests edited, each because the decided change falsifies it:
- `MarkOneField.test.jsx`: the radiogroup's `aria-labelledby` is now the cue id and the Why blank id.
- `AxisMark.test.jsx` and `BatchRow.test.jsx`: a blank axis has no "(Not recorded)" and no state span.
- `notebook.test.js`: the media list went from six steps to five; the phone cue-margin test became an absence test; the `:first-of-type` axis assertion became the all-axes rule.

## Deviations from Plan

None needing a rule.
- The markup edit to `MarkOneField.jsx` was made before the RED run. The RED was re-proved by reverting the file to base: four MarkOneField tests failed, then passed with the change restored.
- `notebook.test.js` also pins that no `:first-of-type` selector remains and that app.css's `.segmented__option` still declares the Control size.

## Known Stubs

None.

## Threat Flags

None. A static caption string rendered as text, CSS reading existing tokens, and a loopback-only probe that aborts other hosts.

## For 261025-f8p's executor

- `.notebook-log .tasting-head` (this item gives it `margin-bottom: var(--app-notebook-log-group-gap)`); f8p retires `.tasting-head` and `.tasting-head__remove` and moves the 18 to the pen's head rule.
- `.notebook-log .mo-end` (`margin-top: var(--gap-l)`), to be replaced by the region seam on the new Tasting head.
- Probe rows R1, R4, R6, R17, R18 and R20, and the fill steps `getByLabel('Churn duration')`, `getByLabel('Tasting temperature')` and `waitForSelector('.tasting-head')`: f8p's labels put the trios on one line and its head is 44px. In the probe, `measureItems` treats `.tasting-head` as one box item and skips `.region-name` inside it.
- The walk baseline's pen-open text hashes change again; reuse `261025-f8n-walk-rebase.mjs`.
- DESIGN.md's new pen-rhythm bullet states the 18 and the 32 above Tasting.

## Follow-ups for /impeccable document

- `app.css` ~1945-1952: the comment over `.axis-mark__state` describes a blank-axis string the component no longer renders.
- DESIGN.md: the At draw and From freezer bullet's "not yet built" marker; the App skin bullet's "no size, gap or face moving", which the new rhythm bullet now qualifies.

## For the orchestrator

- P10_Pen's 393 panels draw the Clear heads at 44 (choice 3), so the board may want redrawing.
- Nothing was run on Mark's iPad or iPhone.

## Deferred Human Verification

Verified in Playwright WebKit on the Mac, in the real app on a scratch build, not on Mark's iPad or iPhone. The device look is Mark's, including the 44px Clear target under a thumb and the pen at 393.

## Self-Check: PASSED

Files found: the probe, `MarkOneField.jsx`, `AxisMark.jsx`, `notebook.css`, `notebook.test.js`, DESIGN.md and the walk baseline. Commits 5bc5fdc1, 33fc7b58, 456c9ee9, de8395b7 and 60c7bd86 are ancestors of HEAD; `git rev-list --count` from the base reads 5.
