---
phase: quick-261004-ox5
plan: 01
quick_id: 261004-ox5
subsystem: ui
tags: [css, notebook, fold-row, batch-head, sketch-011, decisions-41-42]
status: complete
requires:
  - 261004-igr (the (min-width: 724px) block this folds into the base rules)
  - 261004-ox3, 261004-ox4 (landed first; ox4 added two media blocks)
provides:
  - small info labels (History, Go to batch, Tasting, Batches) read label, control word, dot, then the count/state/date at every width
  - batch head with a 32px column gap and the head's own 16px row gap
affects:
  - 261004-ox9 (shows Go to batch from 724 to 1365)
tech-stack:
  added: []
  patterns: [top-level rule per declaration instead of a media step, CSS ::before dot so aria-labels stay]
key-files:
  created:
    - .planning/quick/261004-ox5-dot-separated-small-info-labels-at-the-phone-sketch-011-deci/261004-ox5-probe.mjs
    - .planning/quick/261004-ox5-dot-separated-small-info-labels-at-the-phone-sketch-011-deci/261004-ox5-baseline.json
  modified:
    - app/src/styles/notebook.css
    - app/src/styles/notebook.test.js
decisions:
  - "Fold the (min-width: 724px) block into the base rules and delete it, rather than unwrap it at the file's foot: unwrapping would leave the base rules' space-between declarations dead."
  - "Go to batch's start alignment sits on the top-level .notebook-jump rule beside display none, so a later rule that shows the row (ox9) inherits it."
metrics:
  tasks: 2
  commits: 2
  plan_head_before: 276e04d
  plan_head_after: f84fd79
actuals:
  tokens: 70000
  tasks: 2
  commits: 2
completed: 2026-10-04
---

# Phase quick-261004-ox5 Plan 01: Dot-separated small info labels at the phone Summary

Sketch 011 decisions 41 and 42: History, Go to batch, Tasting and Batches now read label, control word, a dot, then the count, state or date, 32px from the control word, at 393 and 723 as they already did from 724; and the batch head keeps its pre-decision-34 height in the 350px log column (32px between date and actions on one line, the head's own 16px where they wrap).

Every reading below comes from Playwright WebKit (coarse pointer) and system Chrome (fine pointer), not from Mark's devices.

## The change as built (app/src/styles/notebook.css, rule by rule)

- `.notebook .fold-row`: `justify-content` space-between to flex-start (top-level); comment extended by one sentence.
- New top-level rule `.notebook .fold-row__count::before, .notebook .notebook-jump__status::before` (content `"\00b7"`, margin-right `var(--app-notebook-recipe-rail-gap)`), right after the count and status typography rule, with a comment on why it is CSS.
- `.notebook-jump` top-level rule: added `justify-content: flex-start` beside `display: none`; comment reworded (decisions 41 and 43).
- `.notebook-jump` in the `(max-width: 723.98px)` block: `justify-content: space-between` deleted; every other declaration kept.
- `.notebook-log .batch-row__head`: `justify-content: flex-start`, `row-gap: var(--app-notebook-log-head-outer-gap)`, `column-gap: var(--gap-l)`; the `gap` shorthand is gone; comment rewritten (decisions 34 A, 41, 42).
- The `(min-width: 724px)` block and its comment are deleted.

No JSX, app.css or tokens.css change. Under `app/`, the two commits touch only notebook.css and notebook.test.js.

Planner's choice kept: fold into the base rules rather than unwrap the block. Unwrapped at the file's foot, the base rules' `space-between` (fold row, Go to batch, batch head) would be overridden at every width and left as dead declarations; folding leaves one declaration per property per selector.

## RED, then GREEN

- RED, commit `bfec66c` (test file only): six tests failed (the media-steps test, the 723.98px Go to batch box test, and four in the new describe); every other test passed.
- GREEN, commit `f84fd79` (notebook.css, probe, baseline JSON): `notebook.test.js` green, full suite green, build green, probe `labels,board` 1342 checks passed, exit 0.

### Deviation: the media-steps list was longer than the plan assumed (as the batch note said)

ox4 had left seven named media conditions (1366, 1365.98, 723.98, 724, coarse, 723.98-and-coarse, forced-colors). The plan's "four media steps" became **six** after dropping 724px: 1366px, 1365.98px, 723.98px, (pointer: coarse), (max-width: 723.98px) and (pointer: coarse), (forced-colors: active). The test title and list were adapted to the real file; the pinned count is six, not four. The coarse block was already not last in the file (ox4's two blocks follow it); the test pins only the list and order, as before.

## Tests

- Before (Task 1 step 1): 62 files, 1666 tests, all passing.
- After: 62 files, 1666 tests, all passing; delta 0. The plan replaces igr's four-test describe ('small info labels start-aligned from 724') with a four-test describe for the all-width rules, edits the media-steps test and the 723.98px Go to batch box test in place, and so adds no net test. igr's four tests are replaced by their all-width successors (their pins on the 724 block cannot stand once the block is gone); nothing else was removed.
- `npm --prefix app run build` succeeds; app/dist is built from the final code.

## Probe results (261004-ox5-probe.mjs; WebKit coarse and Chrome fine)

Baseline captured from a build of the unchanged source (HEAD 276e04d plus nothing): precondition passed (346 checks), and `board-before` passed (127 checks) before any edit. Final: `labels,board` exit 0, 1342 checks, run twice on the final build.

Info gaps are the distance from the control word's text to the info's text. They read 31.3 to 31.6, not exactly 32, because the dot glyph carries side bearing; the board panels read the same (WebKit 31.57, Chrome 31.34), within 1 of 32 and within 0.5 of the panels. Row boxes are unchanged from the baseline (353 x 44 at 393, 683 x 44 at 723), every count row and the shown jump hit-tests to itself 4px from its right end, aria-labels are unchanged, overflow is 0 everywhere, and the band does not move.

| Cell (engine width route) | Info gaps before to after | Go to batch gap | Head, before to after (gap, height) | Overflow |
|---|---|---|---|---|
| webkit 393 mex3 | History 186.97 to 31.56 | 192.29 to 31.58 | vgap 16, 78.22 to vgap 16, 78.22 | 0 |
| webkit 393 olive1 | Tasting 127.91 to 31.57 | 244.4 to 31.58 | vgap 16, 78.22 to vgap 16, 78.22 | 0 |
| webkit 393 olive1-two | Batches 186.72 to 31.57 | 192.29 to 31.58 | vgap 16, 93.22 to vgap 16, 93.22 | 0 |
| webkit 723 mex3 | History 516.97 to 31.56 | 522.29 to 31.58 | hgap 292.74, 44 to hgap 32, 44 | 0 |
| webkit 723 olive1 | Tasting 457.91 to 31.57 | 574.4 to 31.58 | hgap 307.91, 44 to hgap 32.01, 44 | 0 |
| webkit 723 olive1-two | Batches 516.72 to 31.57 | 522.29 to 31.58 | hgap 308.27, 59 to hgap 32, 59 | 0 |
| webkit 744 mex3 | History 31.56 (unchanged) | hidden | hgap 32, 44 (unchanged) | 0 |
| webkit 744 olive1 | Tasting 31.57 (unchanged) | hidden | hgap 32.01, 44 (unchanged) | 0 |
| webkit 1366 mex3 | History 31.56 (unchanged) | hidden | vgap 32, 94.22 to vgap 16, 78.22 | 0 |
| webkit 1366 olive1 | Tasting 31.57 (unchanged) | hidden | vgap 32, 94.22 to vgap 16, 78.22 | 0 |
| webkit 1366 olive1-two | Batches 31.56 (unchanged) | hidden | vgap 32, 109.22 to vgap 16, 93.22 | 0 |
| webkit 1600 mex3 | History 31.56 (unchanged) | hidden | vgap 32, 94.22 to vgap 16, 78.22 | 0 |
| webkit 1600 olive1 | Tasting 31.57 (unchanged) | hidden | vgap 32, 94.22 to vgap 16, 78.22 | 0 |
| chrome 393 mex3 | History 191.5 to 31.34 | 198.55 to 31.34 | vgap 16, 58.19 to vgap 16, 58.19 | 0 |
| chrome 393 olive1 | Tasting 135.28 to 31.34 | 248.55 to 31.34 | vgap 16, 58.19 to vgap 16, 58.19 | 0 |
| chrome 393 olive1-two | Batches 190.14 to 31.34 | 198.55 to 31.34 | vgap 16, 73.19 to vgap 16, 73.19 | 0 |
| chrome 723 mex3 | History 521.5 to 31.34 | 528.55 to 31.34 | hgap 296.45, 24 to hgap 32, 24 | 0 |
| chrome 723 olive1 | Tasting 465.28 to 31.34 | 578.55 to 31.34 | hgap 314.78, 24 to hgap 32, 24 | 0 |
| chrome 723 olive1-two | Batches 520.14 to 31.34 | 528.55 to 31.34 | hgap 314.78, 39 to hgap 32, 39 | 0 |
| chrome 744 mex3 / olive1 | 31.34 (unchanged) | hidden | hgap 32, 24 (unchanged) | 0 |
| chrome 1366 mex3 / olive1 | 31.34 (unchanged) | hidden | vgap 32, 74.19 to vgap 16, 58.19 | 0 |
| chrome 1366 olive1-two | Batches 31.34 (unchanged) | hidden | vgap 32, 89.19 to vgap 16, 73.19 | 0 |
| chrome 1600 mex3 / olive1 | 31.34 (unchanged) | hidden | vgap 32, 74.19 to vgap 16, 58.19 | 0 |

Every head now computes flex-start, row-gap 16px, column-gap 32px. Log elements below a head moved up by exactly the head's height change (16 at 1366 and 1600, 0 elsewhere); nothing in the band moved. Go to batch stays hidden from 724 (that is 261004-ox9).

### Against the boards (same engine and pointer)

| App cell | Panel | App gap / panel gap | Row or head height, app / panel |
|---|---|---|---|
| webkit History, Go to batch (both), Tasting, Batches at 393 | info-labels-phone.html A | 31.56, 31.58, 31.58, 31.57, 31.57 / same (Batches panel 31.56, its words are constructed) | 353 x 44 / 353 x 44 |
| webkit the same five at 723 | info-labels-phone.html A | 31.56 to 31.58 / same | 683 x 44 / 683 x 44 |
| webkit head 393 | head-A-393 | vgap 16 / 16 | 78.22 / 78.22, change 0 / 0 |
| webkit head 723 | head-A-723 | hgap 32.01 / 32.01 | 44 / 44, change 0 / 0 |
| webkit head 744 | headrow-A2-744 | hgap 32.01 / 32.01 | 44 / 44 |
| webkit head 1366 and 1600 | headrow-A2-1366 | vgap 16 / 16 | 78.22 / 78.22, change -16 / -16 |
| chrome rows at 393 and 723 | A panels | 31.34 / 31.34 | same boxes |
| chrome head 393, 723, 744, 1366, 1600 | A, A2 panels | gaps equal | app 58.19 or 24 against the board's 78.19 or 44: the app's head buttons are 24px under a mouse, the board's are 44 at every pointer (actsChildH 24 / 44). The change is compared instead: 0 / 0 at 393, 723 and 744, -16 / -16 at 1366 and 1600. |

The dated Tasting row (`tasting2`) has no app cell because the seed has no dated tasting; the probe prints the board only: gap 31.57 (WebKit), 31.34 (Chrome), 353 x 44 at 393 and 683 x 44 at 723.

### Sid's captions beside the probe baseline (labels-measure.json, WebKit coarse, rounded)

| Row | Sid as built 393 / 723 | Probe baseline 393 / 723 |
|---|---|---|
| History | 187 / 517 | 186.97 / 516.97 |
| Go to batch awaiting | 192 / 522 | 192.29 / 522.29 |
| Go to batch tasted | 244 / 574 | 244.40 / 574.40 |
| Tasting | 128 / 458 | 127.91 / 457.91 |
| Batches | 186 / 516 | 186.72 / 516.72 (panel 186.44 / 516.44) |
| head | wrapped 16, 78.22 / one line 308, 44 | wrapped 16, 78.22 / one line 307.91, 44 |

The head at 1366: Sid's before 78.22 tall, 16 under the date; A 94.22 and 32; A2 78.22 and 16. The probe baseline reads 94.22 and 32, the build now reads 78.22 and 16.

### The head against igr's pre-igr baseline (information only)

| Engine and pointer | Before decision 34 (261004-igr-labels-baseline.json) | After 261004-ox5 |
|---|---|---|
| webkit coarse 1366 | 78.22 | 78.22 |
| webkit 1600 | 58.22 (that baseline read a fine pointer above 1366) | 78.22 here (coarse at every width in this probe); the change from the igr build is -16 either way |
| chrome fine 1366 | 58.19 | 58.19 |
| chrome fine 1600 | 58.19 | 58.19 |

So the head is exactly back to the height it had before decision 34 in every matching cell.

## Deviations from Plan

**1. [Rule 3 - Blocking] Probe race on the olive1-two cell.** The first baseline run read the page between the route change and the notebook re-render in WebKit at 393 and 1366 (no rows, no heads), so the baseline precondition failed and nothing was written. The probe now waits for the Batches row and a batch head after `recordAnotherBatch`; then the baseline was written. No CSS or threshold was touched.

**2. Media-step count.** See above: six, not four, because of ox4.

**3. Test delta 0.** See Tests.

No other deviations. No stubs added. No auth gates.

## Handoff for later items (261004-ox9, which shows Go to batch from 724 to 1365)

- The `(min-width: 724px)` block no longer exists.
- The Go to batch start alignment is on the top-level `.notebook-jump` rule (next to `display: none`).
- The dot is a top-level rule on `.notebook .notebook-jump__status::before`.
- ox9 only needs to give the row its box (display flex, width, min-height, align-items, gap, text-decoration, color) in its own range. The `(max-width: 723.98px)` `.notebook-jump` rule still carries those box declarations, no justify-content.
- `notebook.test.js`'s six-condition media list and the "Go to batch row shows below 724 only" describe will need the ox9 author's attention.

## For Mark's List

The orchestrator writes these rows; the executor did not.

1. A device check, deferred (every reading here is Playwright WebKit and system Chrome; the change counts as device-verified only when Mark confirms; a hard reload on the :4173 preview already serves the rebuilt app/dist):
   - iPhone at 393, Mexican Chocolate v3: History reads "History  Show · 4 versions" and Go to batch reads "Go to batch · Awaiting tasting".
   - iPhone at 393, Olive Oil v1: Tasting reads "Tasting  Show · tasted date unknown", and the batch head still has its actions under the date.
   - Tap each row near its blank right end: it still opens or jumps.
   - iPad at 1366: the batch head in the log column has its actions 16px under the date again, the height it had before quick 261004-igr.
2. The older phone boards still draw the count, state and date at the row's far end: 393-batch.html, 723-batch.html, 393-all-folded.html, 393-phone-log.html, 723-phone-log.html, and the count boards in 011-options-counts. The build now differs from them on those rows by design. Mark's answer 2 to decision 41 asks Sid to redraw them.

## Self-Check: PASSED

- notebook.css, notebook.test.js, the probe and the baseline JSON exist and are committed: `bfec66c` (RED test) and `f84fd79` (GREEN fix, probe, baseline).
- Scope: under `app/`, the 261004-ox5 commits touch only notebook.css and notebook.test.js; nothing touches .planning/sketches, canvas-generators, todos, .impeccable or DESIGN.md; `git status --porcelain app/` is clean.
- `npm --prefix app test` 1666 passed, `npm --prefix app run build` succeeds, probe `labels,board` exit 0 (1342 checks).
