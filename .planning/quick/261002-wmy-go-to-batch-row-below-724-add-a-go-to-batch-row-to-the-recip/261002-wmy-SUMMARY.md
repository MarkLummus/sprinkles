---
phase: quick-261002-wmy
plan: 01
quick_id: 261002-wmy
subsystem: recipe-band
tags: [notebook, band, phone, focus-landing, sketch-011-decision-30]
status: complete
requires: []
provides:
  - "GoToBatch: the band's Go to batch row below 724, status in Home's words"
  - "STANDING_WORDS exported from app/src/domain/lastEvent.js, read by Home and the band"
  - "id 'batch' on the batch log's Batch heading"
affects: [261002-wmz]
key-files:
  created:
    - app/src/ui/GoToBatch.jsx
    - app/src/ui/GoToBatch.test.jsx
    - .planning/quick/261002-wmy-go-to-batch-row-below-724-add-a-go-to-batch-row-to-the-recip/261002-wmy-probe.mjs
    - .planning/quick/261002-wmy-go-to-batch-row-below-724-add-a-go-to-batch-row-to-the-recip/261002-wmy-baseline.json
  modified:
    - app/src/domain/lastEvent.js
    - app/src/ui/RecipeList.jsx
    - app/src/ui/RecipePage.jsx
    - app/src/ui/RecipePage.test.jsx
    - app/src/ui/BatchRow.jsx
    - app/src/ui/BatchRow.test.jsx
    - app/src/styles/notebook.css
    - app/src/styles/notebook.test.js
decisions:
  - "The status reads the version in view's batches (the log's own), not Home's recipe-wide standing"
  - "The jump uses preventDefault and the existing focus landing, not browser fragment navigation"
  - "The row shows in every mode, a pen open included"
  - "No print rule was added"
commits: 3
plan_head_before: 78ab3b7834e90a9c7572f1ef19d295b52ec9d8b6
plan_head_after: 73309a798b38bc79c3d9b4c07ba0ac32ef675406
metrics:
  tasks: 3
  files: 12
actuals:
  tasks: 3
  commits: 3
---

# Phase quick-261002-wmy Plan 01: Go to batch row below 724 Summary

A one-tap "Go to batch" row sits in the recipe band below 724, after the Version block and before History, with a status in Home's own words (Tasted, Awaiting tasting, Not yet churned). Tapping it lands focus, with the landing ring, on the batch log's Batch heading. From 724 up the band is unchanged.

## What changed

- `app/src/ui/GoToBatch.jsx` (new): one `a.notebook-jump`, `href="#batch"`, `tabIndex={0}`, aria-label "Go to batch, <status>" (FoldRow's comma rule). It holds the `notebook-jump__control` span ("Go to batch") and the `notebook-jump__status` span. The click handler calls `preventDefault()` and then `onGo()`.
- `app/src/domain/lastEvent.js`: `STANDING_WORDS` moved here verbatim from `RecipeList.jsx`, with its comment. Home now imports it, so Home and the band read one map. `RecipeList.test.jsx` passes unchanged.
- `app/src/ui/RecipePage.jsx`: `<GoToBatch batches={batches} onGo={handleGoToBatch} />` is the last child of `.notebook-band__grid`, after `VersionRow`. `handleGoToBatch` bumps the existing `focusBatchAttempt` counter, the same two lines an amendment save runs.
- `app/src/ui/BatchRow.jsx`: `id="batch"` on the Batch h2. This is the only change in that file.
- `app/src/styles/notebook.css`:
  - a base `.notebook-jump { display: none }`
  - the row box inside the existing `(max-width: 723.98px)` block, all tokens
  - the two spans added to the `.fold-row__control` and `.fold-row__count` selector lists
  - no new `@media`, no print rule, no token, no literal

## Tests

- `npm --prefix app test`: 56 files, 1529 tests, all passing. The baseline was 55 files and 1516 tests, so +1 file and +13 tests, none removed.
- `npm --prefix app run build` succeeds.
- RED commit `438c9c2` failed for the stated reasons: the missing module, no `id="batch"`, no `GoToBatch` in RecipePage, no `.notebook-jump` rules, no shared selectors. GREEN is `73309a7`.

## Probe results

The probe is `261002-wmy-probe.mjs`. It drives the built app in WebKit and system Chrome. The baseline was captured from a build of the unchanged source, and the precondition (no `a.notebook-jump`) held in all 54 cells.

| Group | Checks | Result |
| --- | --- | --- |
| baseline | 54 | passed, wrote `261002-wmy-baseline.json` |
| tracer (WebKit, 393 coarse, Coconut v2, board panel p1) | 51 | passed |
| tracer,matrix (both engines, all groups) | 1468 | passed, exit 0 |

The matrix covers:
- 36 phone cells (320, 375, 393 and 428 coarse; 723 coarse and fine; 3 recipes; 2 engines)
- 18 guard cells (724 fine, 744 coarse, 1366 fine)
- keyboard order and Enter at 393 coarse and 723 fine
- panels p0, p1 and p2 of `393-phone-log.html` (coarse) and `723-phone-log.html` (fine), in both engines

Measured on the app, identical in both engines at every phone cell:
- Row height 44. Gap above 20 and gap below 20.
- Band height, History top and page height are each baseline +64 exactly. Overflow stays 0.
- Statuses: Olive Oil v1 reads Tasted, Coconut v2 reads Awaiting tasting, Underbelly Light Base v2 reads Not yet churned. The aria-labels match.
- Both spans stay on one line, with vertical centres at the row's middle. The status's right edge is the row's right edge. All five hit points resolve to the row.
- After a tap (coarse) or click (fine):
  - focus is on `#batch`, whose text is "Batch", and it carries `is-landing-focus`
  - it sits fully above the tab row (for example 393 coarse, Coconut v2: top 416.55 to bottom 432.73, floor 796)
  - the URL and `history.length` do not change
  - for Underbelly Light Base v2, "Not yet churned. Print the sheet, make it, then record what happened." and Record a batch are fully visible at every width, 320 included
- Keyboard: Tab from the last Version act lands on the row. The next Tab lands in History, or past it when History is one plain line. Enter on the row lands on `#batch`.
- Guards (724 fine, 744 coarse, 1366 fine): the row has computed `display: none`, a 0x0 rect, and is not reachable by Tab. Band height, History top, page height, overflow and displayed grid children all equal the baseline exactly.

## Board comparison

For panels p0, p1 and p2 against Olive Oil v1, Coconut v2 and Underbelly Light Base v2, in WebKit and system Chrome, all within 0.5px:
- the row's x from the shell, width, height, and the gaps above and below
- the control word's left offset, width and vertical centre
- the status's right offset, width and vertical centre

The computed font-size, weight, colour, text-decoration-line, underline offset and text of both spans are equal. Panel p3 reads "Not yet churned". Every comparison passed with no tolerance beyond 0.5px.

## Judgement calls for Mark

1. The status reads the version in view's batches (the log's own), not Home's recipe-wide standing, so the jump and its target always agree.
2. The jump calls `preventDefault` and lands through the existing focus landing with its ring, instead of browser fragment navigation. The URL gets no `#batch` and history gains no entry.
3. The row shows in every mode, including with a pen open. It is an in-page jump that loses no draft, and hiding it when a pen opens would shift the log 64px under the maker.
4. No print rule was added. Phase 4 owns print, and the band has none today.
5. The status shows "Not yet churned" until the batches load, as the log's own no-batch prose already does.

## Deviations from Plan

- Task 2 produced no separate commit. The `matrix` group was written into the probe with Task 1's probe commit, so the probe did not change afterwards, and `notebook.css` needed no fix. The matrix passed on its first run. The plan's `chore(261002-wmy): measure ...` commit would have been empty.
- The post-change build and probe runs were not committed. Only app/dist changed, and it is not tracked.

Otherwise the plan executed as written. No `line-height` fix was needed on the `.notebook-jump` rule. No Rule 1 to 3 deviations occurred.

## Deferred: Mark's device check (human-check, end-of-batch UAT)

Run `npm --prefix app run build && npm --prefix app run preview -- --host` (or use the :4173 preview, which serves the rebuilt `app/dist`), and hard-reload on each device.

- iPhone, portrait:
  - Olive Oil v1's band shows "Go to batch" underlined with "Tasted" at the row's right end, between the Version block and History.
  - Tapping anywhere on that row lands on the log's Batch heading with its ring.
  - Coconut v2 reads "Awaiting tasting".
  - Underbelly Light Base v2 reads "Not yet churned". After the jump, the "Not yet churned. Print the sheet..." line and the log's Record a batch are on screen.
  - With VoiceOver on, the row reads "Go to batch, Tasted, link".
- iPad, either orientation: no Go to batch row, and the band looks as before.

These readings are from two desktop engines, not Mark's devices.

## Known Stubs

None.

## Threat Flags

None. The row adds no input, endpoint or storage. The href is a literal, and the status words come only from the fixed map.

## Self-Check: PASSED

- FOUND: app/src/ui/GoToBatch.jsx, app/src/ui/GoToBatch.test.jsx
- FOUND: the probe and baseline JSON in the quick directory
- FOUND commits: 8c064f8, 438c9c2, 73309a7
