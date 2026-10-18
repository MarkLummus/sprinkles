---
phase: quick-261017-ttf
plan: 01
quick_id: 261017-ttf
subsystem: balance-rule
tags: [D30, sweetness, pod, graduated-rule, sketch-010]
requires: []
provides:
  - "Sweetness · POD rule runs 0 to 40 for every recipe, on screen and on the printed Sheet"
affects: [app/src/domain/figures.js]
key-files:
  modified:
    - app/src/domain/figures.js
    - app/src/domain/figures.test.js
    - app/src/ui/GraduatedRule.test.jsx
    - app/src/ui/PrintSheetPages.test.jsx
decisions:
  - "D30 (Mark, 2026-10-18, decide-p10-pod-rule-end: widen-to-40): the POD domain is [0, 40], like PAC"
status: complete
completed: 2026-10-18
commits: 1
plan_head_before: 5b19a5934110e3a56e05ceabdab86813a4410a5e
plan_head_after: 3f23c7f5ec94f200c4d7bf4e9fd6226aaad8385c
actuals:
  tokens: 1700
  tasks: 2
  commits: 1
---

# Phase quick-261017-ttf Plan 01: Widen the Sweetness · POD rule to 0 to 40 Summary

The pod spec in `FIGURE_SPECS` now reads `domain: [0, 40]` (sketch 010 D30), and the built app's Sweetness gauge measures within 0.02 px of the retaken sketch 010 boards in WebKit, so Task 2 needed no CSS or markup fix.

## Commits

| Task | Commit | Files |
| ---- | ------ | ----- |
| 1 | 3f23c7f `feat(261017-ttf): widen the Sweetness · POD rule to 0 to 40 (D30)` | app/src/domain/figures.js, figures.test.js, app/src/ui/GraduatedRule.test.jsx, PrintSheetPages.test.jsx |
| 2 | none (measurement only; the app matched the boards) | none |

## Task 1: RED evidence

Before the figures.js edit, exactly these six new tests failed and the 123 existing ones passed (6 failed, 123 passed, 129):

- figures.test.js: "prints the six scales as sketch 010 D30 draws them: Sweetness runs 0 to 40, like Freezing"
- figures.test.js: "keeps Sorbet's approved Sweetness band, 24 to 32, inside the rule with room past both edges (sketch 010 D30)"
- GraduatedRule.test.jsx: "draws Olive Oil v1's 12–16 band from 96 to 128, the tick at 104.37, and the anchors 0, inside 12–16, 40"
- GraduatedRule.test.jsx: "draws the pen with Whole milk portion 1 at 110 g: hollow was tick at 103.119, tick at 105.613, head 13.0 then 13.2"
- GraduatedRule.test.jsx: "draws Sorbet's approved 24–32 band with both edges inside the rule, at 192 and 256"
- PrintSheetPages.test.jsx: "prints the Sweetness gauge on 0 to 40: band 96 to 128, anchors 0, inside 12–16, 40 (sketch 010 D30)"

After the edit: three files, 129 tests pass; full suite 96 files, 3007 tests pass. `grep -rnE "0, ?30\]" app/src` finds the fat spec (figures.js:41), the fat fixture (GraduatedRule.test.jsx:18) and, new, the fat entry in the six-scales test (figures.test.js:49). No line restates the POD end.

## Task 2: WebKit measurement (Playwright WebKit, fine pointer, deviceScaleFactor 1)

Script: `/private/tmp/claude-501/-Users-mark-Documents-projects-sprinkles/26fd9527-06c0-4bfa-b5b0-7a67f6edff73/scratchpad/261017-ttf/measure.mjs`; raw data in `measure.json` beside it. Build served from `.../261017-ttf/dist` on 127.0.0.1:4199 only. Verdict: PASS, exit 0.

Offsets in CSS px from the gauge svg's left edge. Left anchor reads 0 in every row. Row A is the pen at 1280 with Whole milk portion 1 at 110 g.

| Row | svg width | band left | band right | left edge | right edge | value tick | hollow centre | right anchor | right anchor inset |
| --- | --------- | --------- | ---------- | --------- | ---------- | ---------- | ------------- | ------------ | ------------------ |
| A app pen | 320 | 96 | 128 | 96 | 128 | 105.61 | 104.37 | 40 | 0 |
| B screen-draft-kept .p4d1 | 320 | 96 | 128 | 96 | 128 | 105.61 | 104.37 | 40 | 0 |
| C screen-draft-kept-words .p4w1a | 320 | 96 | 128 | 96 | 128 | 105.61 | 104.37 | 40 | 0 |
| C screen-draft-kept-words .p4w1b | 320 | 96 | 128 | 96 | 128 | 105.61 | 104.37 | 40 | 0 |
| D app print route, Sheet page 1 | 245.55 | 73.67 | 98.22 | 73.67 | 98.22 | 80.09 | n/a | 40 | 0.02 |
| E sheet-page-1-formula | 245.55 | 73.66 | 98.22 | 73.66 | 98.22 | 80.09 | n/a | 40 | 0.02 |
| F sheet-balance-col2 | 246.05 | 73.81 | 98.42 | 73.81 | 98.42 | 80.25 | n/a | 40 | 0.02 |

User-unit attributes (320-unit drawing): A and B/C agree: band x 96, width 32, edges 96 and 128, tick 105.613039…, hollow x 103.119115… (A …045, boards …047). D, E and F: band x 96, width 32, edges 96 and 128, tick 104.369115… (D …045, boards …047). These are the plan's expected numbers.

Also checked and matching within 1 px: all eleven graduations for Sweetness, and band edges, tick and right anchor of the other gauges (Freezing, Fat, Milk solids; Sugar has no band in this recipe, so null on both sides). Freezing, Fat, Milk solids did not move. On the print route, Sugar and Solids are not on page 1, so D was compared on the four gauges page 1 holds.

D versus F differs by 0.5 px in svg width (245.55 vs 246.05), inside the 1 px rule; F is a taller board laid by a different frame.

Print route scales: `--sheet-print-picture-scale` 1; page 1's `.ps-fit` has `--sheet-print-fit-scale` 1.06667 and computed transform `matrix(1.06667, 0, 0, 1.06667, 0, 0)`. The svg width 245.55 in D is measured after that transform, and board E (816 wide) gives the same 245.55, so no layout or scale finding for Mark.

## Findings

- **Accessible name differs from the board in one clause, unrelated to D30.** The app's Sweetness button reads "Sweetness · POD, was 13.0, now 13.2, target 12–16, inside 12–16, estimated: Whole milk, Heavy cream, and Allulose". The board's aria-label omits "inside 12–16". The app's text comes from D-20 (04-10), pinned by existing tests in GraduatedRule.test.jsx ("names an inside figure after its target"). The plan's gate compared the label verbatim; the script compared it with ", inside 12–16" removed and the rest matches, so the pen state (was 13.0, now 13.2) is reproduced. The board's older label is the stale side; whether to retake it is Mark's or Sid's call.
- **Sketch 011 boards that still end the Sweetness rule at 30 (for the orchestrator; not edited).** All 42 files in `.planning/sketches/011-recipe-route-c/` that carry a Sweetness · POD gauge end it at 30 (anchor span `30`): 1024-batch, 1194-ladder, 1194-nav, 1366-batch, 1366-ingredient-options, 1366-ladder, 1366-nav, 1366-sticky-nav, 1600-batch, 1600-long-history, 1600-no-batch, 1600-pen, 1600-remove-link, 1600-sticky-rail, 1920-batch, 724-1365-go-to-batch, 984-batch, 984-sticky-nav, app-radius, as-made-line-out, batch-head-show-hide, before-you-start-heading-b, before-you-start-heading, before-you-start-pen-b, before-you-start-pen, before-you-start-position, before-you-start-states-b, before-you-start-states, blocked-row-sentence, empty-space-under-table, import-errors-placement, info-labels-bands, info-labels-batch-head, info-labels-log, notice-over-flyout, per-step-shared-ingredient, sheet-title-pen, split-remove-link, table-head-one-line, tasting-group-names, version-details-rhythm, why-row. In 010-bench-sheet, `as-built-recipe-page-1280.html` and `as-built-sheet-letter.html` also still end at 30 (as-built records of the earlier app; the four retaken boards end at 40). `012-places/ingredients-place.html` mentions "Sweetness" only in ingredient text and draws no gauge. `011-options-counts` and `011-options-show-changes` hold none.
- Vite process: none was running at the start (`pgrep -fl vite` empty), so nothing was stopped. The measurement preview was started and killed by the script; `pgrep -fl vite` is empty after.

## Deviations from Plan

None to the app. Two script-side adjustments in measure.mjs, both tolerant-comparison choices rather than app changes: the aria-label check ignores the D-20 ", inside 12–16" clause (see Findings), and gauges that are null on both sides (Sugar's band) or not on print page 1 (Sugar, Solids) are skipped rather than failed.

## Known Stubs

None.

## Self-Check: PASSED

- 3f23c7f exists and is an ancestor of HEAD; it touches exactly the four planned files.
- `git status --porcelain -- app/` is empty; nothing under .planning/sketches or .planning/canvas-generators was committed; no file in app/dist is newer than Task 1's test edit; no Vite process remains.
