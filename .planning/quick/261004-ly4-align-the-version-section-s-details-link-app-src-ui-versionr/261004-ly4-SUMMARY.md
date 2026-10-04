---
phase: quick-261004-ly4
plan: 01
quick_id: 261004-ly4
subsystem: ui/recipe-page
tags: [version-section, fold-row, measurement, sketch-011, todo-closed]
status: complete
requirements: [UX1-01]
commits: 2
plan_head_before: 04b4ebb895d6a5eb0fcbce31faa1240e3e527ecd
plan_head_after: f80242963d70b66489faa75f9bda0fb723ad91fc
key-files:
  created:
    - .planning/quick/261004-ly4-align-the-version-section-s-details-link-app-src-ui-versionr/261004-ly4-probe.mjs
    - .planning/quick/261004-ly4-align-the-version-section-s-details-link-app-src-ui-versionr/261004-ly4-measure.json
  moved:
    - .planning/todos/pending/2026-09-27-align-the-version-details-link.md -> .planning/todos/completed/
decisions:
  - "No app change: the measurement finds the Version fold row already aligned to the field sketch 011 draws."
actuals:
  tokens: 14000
  tasks: 2
  commits: 2
metrics:
  tests: 1598 (59 files), all passing, none added or removed
  checks: 780 probe checks passing
---

# Quick 261004-ly4: Version details control measured against sketch 011, already aligned

Nothing under `app/` changed. The Version section's "Show details" / "Hide details" already sits one 14px head gap after the VERSION caption, on its baseline, at the section's left edge, exactly where sketch 011's five width boards and `details-fold.html` draw it. The todo is closed with its cause, the shipped fix and these numbers.

## Outcome

- A re-runnable probe (`261004-ly4-probe.mjs`) reads the Version fold head in the built app (`app/dist`, rebuilt at HEAD 04b4ebb with ly3's change in) and in six boards, in Playwright WebKit and system Chrome. 780 checks pass; `261004-ly4-measure.json` holds every reading.
- 40 app readings: 2 engines x 5 widths (1366, 1024, 983, 723, 393) x 2 routes (Mexican Chocolate v3, Olive Oil v1) x 2 states (default, after one activation). 12 board loads: 6 boards x 2 engines.
- The planner's numbers at HEAD 1a58afa reproduce at 04b4ebb: WebKit row left 0, caption left 0.01, gap 14.01, word left 74.78 (Show) or 74.79 (Hide), baseline delta 0, row 44. Chrome 0 / 14 / 74.28 / 0.
- The word is "Hide details" by default at 1366 and "Show details" below. One activation shows the other word and the word's left edge does not move (within 0.5).
- The word sits 13% to 34% of the row's width left of the row's centre, so it is not centred.

## Cause history

- 2026-09-27 (todo filed): the control was 03.5-08's below-desktop `HistoryDisclosure`, a bare `.text-control` button and a direct flex item of the column `section.notebook-version`. Nothing set its width or text-align, so it stretched and showed its word in the middle. Read from the CSS at 7fbef79, not re-measured.
- 2026-09-28: 03.5-15 (commit 4f29572, sketch 011 decision 18) replaced it with `FoldRow`: caption, then the control word 14px after it. Canvas version 250 and decision 34's inventory draw it that way.

## App readings

Columns: engine, pointer, width, route, state, word, caption left in row, caption-to-word gap, word left in row, baseline delta, row height, then the matching width board's first panel (caption left / gap / word left) when it shows the same word. Every row also has row left in section 0 and row width equal to the section (checked, not tabulated).

| Engine | Pointer | Width | Route | State | Word | Caption left | Gap | Word left | Baseline delta | Row h | Board (same word) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| webkit | coarse | 1366 | mex3 | default | Hide details | 0.01 | 14.01 | 74.79 | 0 | 44 | 0.01 / 14.01 / 74.79 |
| webkit | coarse | 1366 | mex3 | toggled | Show details | 0.01 | 14.01 | 74.78 | 0 | 44 | details-fold: 0.01 / 14.01 / 74.78 |
| webkit | coarse | 1366 | olive1 | default | Hide details | 0.01 | 14.01 | 74.79 | 0 | 44 | 0.01 / 14.01 / 74.79 |
| webkit | coarse | 1366 | olive1 | toggled | Show details | 0.01 | 14.01 | 74.78 | 0 | 44 | details-fold: 0.01 / 14.01 / 74.78 |
| webkit | coarse | 1024 | mex3 | default | Show details | 0.01 | 14.01 | 74.78 | 0 | 44 | 0.01 / 14.01 / 74.78 |
| webkit | coarse | 1024 | mex3 | toggled | Hide details | 0.01 | 14.01 | 74.79 | 0 | 44 | details-fold: 0.01 / 14.01 / 74.79 |
| webkit | coarse | 1024 | olive1 | default | Show details | 0.01 | 14.01 | 74.78 | 0 | 44 | 0.01 / 14.01 / 74.78 |
| webkit | coarse | 1024 | olive1 | toggled | Hide details | 0.01 | 14.01 | 74.79 | 0 | 44 | details-fold: 0.01 / 14.01 / 74.79 |
| webkit | coarse | 983 | mex3 | default | Show details | 0.01 | 14.01 | 74.78 | 0 | 44 | 0.01 / 14.01 / 74.78 |
| webkit | coarse | 983 | mex3 | toggled | Hide details | 0.01 | 14.01 | 74.79 | 0 | 44 | details-fold: 0.01 / 14.01 / 74.79 |
| webkit | coarse | 983 | olive1 | default | Show details | 0.01 | 14.01 | 74.78 | 0 | 44 | 0.01 / 14.01 / 74.78 |
| webkit | coarse | 983 | olive1 | toggled | Hide details | 0.01 | 14.01 | 74.79 | 0 | 44 | details-fold: 0.01 / 14.01 / 74.79 |
| webkit | coarse | 723 | mex3 | default | Show details | 0.01 | 14.01 | 74.78 | 0 | 44 | 0.01 / 14.01 / 74.78 |
| webkit | coarse | 723 | mex3 | toggled | Hide details | 0.01 | 14.01 | 74.79 | 0 | 44 | details-fold: 0.01 / 14.01 / 74.79 |
| webkit | coarse | 723 | olive1 | default | Show details | 0.01 | 14.01 | 74.78 | 0 | 44 | 0.01 / 14.01 / 74.78 |
| webkit | coarse | 723 | olive1 | toggled | Hide details | 0.01 | 14.01 | 74.79 | 0 | 44 | details-fold: 0.01 / 14.01 / 74.79 |
| webkit | coarse | 393 | mex3 | default | Show details | 0.01 | 14.01 | 74.78 | 0 | 44 | 0.01 / 14.01 / 74.78 |
| webkit | coarse | 393 | mex3 | toggled | Hide details | 0.01 | 14.01 | 74.79 | 0 | 44 | details-fold: 0.01 / 14.01 / 74.79 |
| webkit | coarse | 393 | olive1 | default | Show details | 0.01 | 14.01 | 74.78 | 0 | 44 | 0.01 / 14.01 / 74.78 |
| webkit | coarse | 393 | olive1 | toggled | Hide details | 0.01 | 14.01 | 74.79 | 0 | 44 | details-fold: 0.01 / 14.01 / 74.79 |
| chrome | fine | all five | both | default or toggled (20 readings) | Show or Hide | 0 | 14 | 74.28 | 0 | 44 | 0 / 14 / 74.28 on every board panel |

The 20 Chrome readings are identical to each other and to every Chrome board panel, so they are collapsed into one row; each is listed individually in `261004-ly4-measure.json` and printed by the probe. Toggled readings are matched to `details-fold.html`'s panel for the same word (check e).

## Board panels' own readings

Caption left / gap / word left / baseline delta / row height.

| Engine | Board | Pointer | Panels |
|---|---|---|---|
| webkit | 1366-batch | fine | Hide: 0.01 / 14.01 / 74.79 / 0 / 44 (x2) |
| webkit | 1024-batch | fine | Show: 0.01 / 14.01 / 74.78 / 0 / 44 (x2) |
| webkit | 983-batch | fine | Show: 0.01 / 14.01 / 74.78 / 0 / 44 (x2) |
| webkit | 723-batch | fine | Show: 0.01 / 14.01 / 74.78 / 0 / 44 |
| webkit | 393-batch | coarse | Show: 0.01 / 14.01 / 74.78 / 0 / 44 |
| webkit | details-fold | fine | Show: 0.01 / 14.01 / 74.78 / 0 / 44; Hide: 0.01 / 14.01 / 74.79 / 0 / 44 |
| chrome | every board above | as above | all panels 0 / 14 / 74.28 / 0 / 44 |

## Deviations from Plan

**1. [Rule 1 - Bug in the plan's check] The "not centred" threshold was too strict**
- **Found during:** Task 1
- **Issue:** Check (a) asked for the word's centre to be more than a quarter of the row's width from the row's centre. The real offsets are 25.5% (WebKit 1366), 13.0% (WebKit 1024, row 306 wide), 17.9% (WebKit 393), 33.7% (Chrome 723). A quarter fails at 1024 although the word is plainly left-aligned (its left edge is exactly 14px after the caption, which is the actual alignment proof). The planner's tolerance was a guess, not a reading.
- **Fix:** the probe asserts more than 10% of the row's width (a centred word would be within a few px of 0). The decisive alignment checks (caption left 0, gap 14, word left equal to the board's) are unchanged.
- **Files modified:** `261004-ly4-probe.mjs`
- **Commit:** f6395a2

Otherwise none: the plan executed as written.

## Observation (not this item's)

At 1366 and 1024 the app's Version section is narrower than the boards' (about 451 against 549, and 306 against 403 in the planner's reading). The boards draw decision 33's final shell (sticky header and fly-out), which is quick 261004-ly8's work. The row's internal geometry is identical, and the probe measures offsets from the row and section edges, so width does not enter any check.

Also: the app's `.notebook .fold-row` takes `justify-content: flex-start` from 261004-igr's (min-width: 724px) block while the boards compute `space-between`. With no count on the Version row the head lands in the same place, so this is not a difference in any reading.

## Evidence limits

Every reading comes from Playwright WebKit and system Chrome on the Mac, not from Mark's devices. The harness's board loads use each board's own preview width (WebKit at 1366 is coarse for the app per Sid's convention, fine for the boards; the offsets agree either way).

## Verification

- `npm --prefix app run build`: succeeds.
- `node 261004-ly4-probe.mjs`: exits 0, 780 checks passed.
- `npm --prefix app test`: 1598 tests in 59 files pass, no test added or removed.
- Scope gate: no 261004-ly4 commit touches `app/`, `.planning/sketches/`, `.planning/canvas-generators/` or `.impeccable/`.
- Not staged: `.planning/sketches/011-recipe-route-c/README.md`, `.planning/todos/pending/2026-10-04-consider-a-mise-en-place-*`, `.impeccable/`, `.planning/quick-batches/`.
- SUMMARY.md, STATE.md and PLAN.md are left uncommitted for the orchestrator, as instructed.

## Known Stubs

None.

## For Mark's List

One look, deferred (the orchestrator writes the row):

- Serve from the build (`npm --prefix app run build && npm --prefix app run preview -- --host`, or a hard reload of the running preview).
- iPad at 1366 landscape, open Mexican Chocolate v3: the Version head reads VERSION, then "Hide details" right after it.
- iPad at 1024 portrait and iPhone at 393: it reads VERSION, then "Show details" right after it.
- Tap once: the word flips and does not move.
- If it still looks centred to Mark, the todo reopens (it is in `.planning/todos/completed/2026-09-27-align-the-version-details-link.md`).

## Self-Check: PASSED

- FOUND: 261004-ly4-probe.mjs, 261004-ly4-measure.json
- FOUND: .planning/todos/completed/2026-09-27-align-the-version-details-link.md (status: completed, ## Resolution); absent from pending/
- FOUND commits: f6395a2, f802429
