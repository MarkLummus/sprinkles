---
phase: quick-261002-wmz
plan: 01
quick_id: 261002-wmz
subsystem: recipe-band
tags: [notebook, band, phone, record-act, sketch-011-decision-30]
status: complete
requires: [261002-wmy]
provides:
  - "VersionRow: below 724 the acts row leads with one filled record act (Record a tasting, Record another or Record a batch), Next version a text control"
  - "useBelow724 and BELOW_724_QUERY exported from app/src/ui/useBelowDesktop.js (one reader of the 724 cut)"
  - "RecipePage.handleRecordTasting, the SEAM(261002-wn0) handler"
affects: [261002-wn0, 261002-wn1]
key-files:
  created:
    - app/src/ui/VersionRow.record.test.jsx
    - .planning/quick/261002-wmz-filled-action-rule-below-724-the-band-s-one-filled-action-re/261002-wmz-probe.mjs
    - .planning/quick/261002-wmz-filled-action-rule-below-724-the-band-s-one-filled-action-re/261002-wmz-baseline.json
  modified:
    - app/src/ui/VersionRow.jsx
    - app/src/ui/RecipePage.jsx
    - app/src/ui/BatchRow.jsx
    - app/src/ui/useBelowDesktop.js
    - app/src/ui/VersionRow.test.jsx
    - app/src/ui/RecipePage.test.jsx
    - app/src/ui/useBelowDesktop.test.js
decisions:
  - "The hook moved: wmy added no JS below-724 signal, so BatchRow's local useBelow724 moved to useBelowDesktop.js and BatchRow imports it"
  - "Record a tasting goes through handleRecordTasting (the seam), which today opens the amend pen on the latest batch via handleStartAmending"
  - "Cancel from a band-opened pen stays put in the log (BatchRow's existing focus returns); no code added"
  - "The three-control wrap at 393 is measured and left as it is; 261002-wn1 removes it"
commits: 4
plan_head_before: 73309a798b38bc79c3d9b4c07ba0ac32ef675406
plan_head_after: 0caaefa5b255d8e20aadaf7f43448cf2b993acee
metrics:
  tasks: 3
  files: 10
actuals:
  tasks: 3
  commits: 4
---

# Phase quick-261002-wmz Plan 01: Filled action rule below 724 Summary

Below 724 the recipe band's acts row now leads with exactly one filled control, the record act the version is waiting on (Record a tasting, Record another or Record a batch, chosen by `standingFor(batches)`), and Next version is the underlined text control 10px after it. From 724 up the band is unchanged to the pixel.

## The rule as built

- `VersionRow.jsx` takes three new props: `below724` (default false), `onStartRecording` and `onRecordTasting` (both default no-ops). Below 724 it renders `button.notebook-action` first, with its word from `RECORD_ACT_WORDS` (a map keyed by the three `lastEvent.js` constants, in the style of Home's `STANDING_WORDS`). Next version keeps its ref, handler and `tabIndex={0}` and takes `notebook-link` instead of `notebook-action`. Show changes is untouched.
- The click handler calls `onRecordTasting()` when the standing is `AWAITING_TASTING`, `onStartRecording()` otherwise.
- `RecipePage.jsx` reads `useBelow724()` once, beside `useBelowDesktop()` and above the early returns, and passes `below724`, `onStartRecording={handleStartRecording}` and `onRecordTasting={handleRecordTasting}`.
- No CSS was added. The existing `.notebook-version__acts` (flex, wrap, the 10px gap) already draws the boards' row.

## Step 0 answers (wmy's state)

- (a) wmy added no JS below-724 signal: its Go to batch row is gated by CSS alone. So `useBelow724` moved from `BatchRow.jsx` (where it was local and unexported) to `useBelowDesktop.js`, exported with `BELOW_724_QUERY = '(max-width: 723.98px)'`. Its behaviour is unchanged. `BatchRow.jsx` imports it. Exactly one non-test module under `app/src/ui` holds the `723.98px)'` query literal.
- (b) wmy's `GoToBatch.jsx` reads the status through `standingFor` and the shared `STANDING_WORDS` in `lastEvent.js`. This item calls `standingFor(batches)` once in `VersionRow`, the same function.
- (c) The Go to batch row renders in `RecipePage`, as the last child of `.notebook-band__grid`, after `VersionRow`. It is outside `VersionRow` and was not touched. Every VersionRow test scopes to the acts group's markup, so the row cannot satisfy or break one.
- Suite baseline at Step 0: 56 files, 1529 tests.

## RED then GREEN

Task 1 RED, commit `ca3495f`:
- Tests A, B, C, G, H, K and M failed as planned.
- Tests D and E are guards and passed before and after.
- Test I (Next version still calls `onStartDeveloping`) passed at RED. It already held before the change, so it is a guard in effect.

Task 1 GREEN, commit `5fa1188`: the six touched files plus the probe and baseline went in. The tracer passed in WebKit (10 checks).

Task 2 RED, commit `4bcfa66`:
- Test L failed (no `handleRecordTasting` yet).
- Tests F and J passed at RED, because Task 1 had already wired the awaiting branch in `VersionRow`. They stay as pins.

Task 2 GREEN, commit `0caaefa`: `handleRecordTasting` and the `onRecordTasting` prop.

## The seam

- File: `app/src/ui/RecipePage.jsx`. Function: `handleRecordTasting`, defined right after `handleStartAmending`. The comment block above it opens with the marker `SEAM(261002-wn0)`.
- Today its whole body is `handleStartAmending(sortedBatches(batches)[0]);`. That opens the amend pen on the latest batch through the log's own Correct path, with Add tasting one tap inside the pen.
- 261002-wn0 replaces only this body, with the amend pen opened with the tasting step already open and no Correct.

Findings for wn0, not fixed here:
1. When the URL names an older batch, `openBatch` is not the latest. The seam amends `sortedBatches(batches)[0]`, the latest, so the pen corrects the latest batch while the log's head names the batch in view. `BatchRow` assumes "amend corrects the very batch in view".
2. This item returns by staying put in the log. wn0's description asks Save and Cancel to return the maker to the band for Record a tasting. That would differ from Record a batch and Record another unless wn0 extends it to all three.

## Return path as built

Cancel stays put and focus returns to the log's own opener (decision 30's least). Save lands on the saved batch's heading. No code was added for either, since BatchRow's existing focus returns apply.

Measured by the probe (all pass, both engines). `scrollY` is at click, with the pen open, and after Cancel:

| Sequence | Engine, width | scrollY |
| --- | --- | --- |
| B1 tasted-first, Cancel focuses `.batch-row__record` | WebKit 393c | 0, 4600, 3211 |
| | WebKit 723f | 0, 3510, 2586 |
| | Chrome 393c | 0, 4590, 3201 |
| | Chrome 723f | 0, 3478, 2578 |
| B2 none-first, Cancel focuses `.notebook-log .notebook-action` | WebKit 393c | 0, 1236, 656 |
| | WebKit 723f | 0, 984, 438 |
| | Chrome 393c | 0, 1238, 655 |
| | Chrome 723f | 0, 983, 439 |
| B3 awaiting-parent, Cancel focuses `.batch-row__correct` | WebKit 393c | 0, 1562, 1198 |
| | WebKit 723f | 0, 1239, 848 |
| | Chrome 393c | 0, 1564, 1200 |
| | Chrome 723f | 0, 1238, 851 |
| B5 awaiting-first, Save lands on the log's Batch heading, in view | WebKit 393c | 831 |
| | WebKit 723f | 615 |
| | Chrome 393c | 879 |
| | Chrome 723f | 612 |

In every sequence the Churn date is focused, empty and fully inside the viewport after the band click, so the assumption that `autoFocus` brings the pen into view held in WebKit. No scroll code was added. B3 confirms the seam's behaviour today: the amend pen opens (`.batch-row__date` present), exactly one Add tasting is in the pen, and 0 tasting stops are open. B4: Next version focuses Version name, and Cancel returns focus to the band's Next version, `notebook-link` below 724.

## Matrix

The matrix ran 6 cases x 9 widths x 2 engines. Below 724 that is 320, 375, 393 and 428 coarse, plus 723 fine and 723 coarse. From 724 up that is 724 fine, 724 coarse and 1366 fine.

Below 724, every cell passed:
- Labels are [label, "Next version"], plus "Show changes" for a parent case.
- The first child is the only `notebook-action`, all children are `tabindex 0`, and the filled left is 20.
- The filled height is 44, and Next version starts exactly 10px after the filled control.
- Row count is 1 for every no-parent case and for every case at 428 and 723.
- Band height delta equals the acts row's height delta (0, or +54 on a wrap).
- Overflow is 0, and the Go to batch gap is 20 in every cell.
- Record a batch buttons: band 1 and log 1 for the none cases; 0 and 0 otherwise.

393 coarse rows (filled width x 44; Next version left / width; row count; band height before to after, where the baseline was captured post-wmy):

| Engine | Case | Labels | Filled w | Next left / w | Show x | Rows | Band |
| --- | --- | --- | --- | --- | --- | --- | --- |
| WebKit | tasted-first | Record another | 148.19 | 178.19 / 84.25 | none | 1 | 530.38 to 530.38 |
| WebKit | tasted-parent | Record another | 148.19 | 178.19 / 84.25 | 272.44 | 1 | 402.19 to 402.19 |
| WebKit | awaiting-first | Record a tasting | 154.44 | 184.44 / 84.25 | none | 1 | 402.19 to 402.19 |
| WebKit | awaiting-parent | Record a tasting | 154.44 | 184.44 / 84.25 | 20 (wrapped) | 2 | 402.19 to 456.19 |
| WebKit | none-first | Record a batch | 145.38 | 175.38 / 84.25 | none | 1 | 402.19 to 402.19 |
| WebKit | none-parent | Record a batch | 145.38 | 175.38 / 84.25 | 269.63 | 1 | 402.19 to 402.19 |
| Chrome | tasted-first | Record another | 145.98 | 175.98 / 83.5 | none | 1 | 531.38 to 531.38 |
| Chrome | tasted-parent | Record another | 145.98 | 175.98 / 83.5 | 269.48 | 1 | 404.19 to 404.19 |
| Chrome | awaiting-first | Record a tasting | 152.19 | 182.19 / 83.5 | none | 1 | 404.19 to 404.19 |
| Chrome | awaiting-parent | Record a tasting | 152.19 | 182.19 / 83.5 | 20 (wrapped) | 2 | 404.19 to 458.19 |
| Chrome | none-first | Record a batch | 144.17 | 174.17 / 83.5 | none | 1 | 404.19 to 404.19 |
| Chrome | none-parent | Record a batch | 144.17 | 174.17 / 83.5 | 267.67 | 1 | 404.19 to 404.19 |

Heights are 44 throughout. The full per-cell lines for all widths are in the probe's output.

## Three-control fit for the parent cases (for 261002-wn1)

The sum of widths plus the two 10px gaps against the acts row's width (353 at 393), spare space in brackets (negative means it wraps):

| Width | Case | WebKit sum (spare) | Chrome sum (spare) | Rows |
| --- | --- | --- | --- | --- |
| 320 (row 280) | tasted-parent | 350.31 (-70.31) | 347.50 (-67.50) | 2 |
| 320 | awaiting-parent | 356.56 (-76.56) | 353.70 (-73.70) | 2 |
| 320 | none-parent | 347.50 (-67.50) | 345.69 (-65.69) | 2 |
| 375 (row 335) | tasted-parent | 350.31 (-15.31) | 347.50 (-12.50) | 2 |
| 375 | awaiting-parent | 356.56 (-21.56) | 353.70 (-18.70) | 2 |
| 375 | none-parent | 347.50 (-12.50) | 345.69 (-10.69) | 2 |
| 393 (row 353) | tasted-parent | 350.31 (+2.69) | 347.50 (+5.50) | 1 |
| 393 | awaiting-parent | 356.56 (-3.56) | 353.70 (-0.70) | 2 |
| 393 | none-parent | 347.50 (+5.50) | 345.69 (+7.31) | 1 |
| 428 (row 388) | all three | 31 to 40 spare | 34 to 42 spare | 1 |

Compared with decision 30's figures: awaiting-parent wraps at 393 by 0.7 in Chromium and 3.6 in WebKit, which matches exactly. tasted-parent fits at 393 with 5.5 spare in Chromium (WebKit 2.7). The wrap puts Show changes alone on the second row at x 20 and adds 54px to the band. 261002-wn1 removes it by moving Show changes; this item left it where it is and recorded it. At 320 and 375 all three parent cases wrap in both engines.

## From 724 up equals the baseline

For all six cases at 724 fine, 724 coarse and 1366 fine, in both engines: the acts row's labels, classes, each child's left, top, width and height, the row's own box and the band height equal the pre-change baseline within 0.5px. No acts row control reads Record. The log's Record a batch count is 1 for the none cases, and the band's count is 0. The baseline was captured from a build of the post-wmy, pre-wmz source before any `app/src` edit, with its precondition asserted in all 108 cells.

## Boards

Against 393-phone-log.html (393 coarse) and 723-phone-log.html (723 fine), panel by panel and in both engines. The board panels are Record another, Record a tasting, Record a batch, and the parent panel (Record a batch, Next version, Show changes). They were paired with tasted-first, awaiting-first, none-first and none-parent.
- Equal: labels and order, the one filled control and its fill and label colours (rgb(21, 118, 222) and white), the transparent underlined text controls and their colour, the filled left (20), the 10px gaps, and the row count (1 everywhere). The Go to batch gap is 20 on both. Overflow is 0.
- The app's filled control is exactly 2px wider than the board's in every panel in both engines (1px border on each side), inside the 0 to 4.5 tolerance. Example, WebKit tasted: app 148.19 against board 146.19. Text control widths are within 1px.
- At 393 every height is 44 in both app and board.
- At 723 fine the departures are the two decision 30 records, recorded and not asserted. The board's filled primitive is 41 tall against the app's 44 (`.notebook-action`'s `--touch-min` floor). The board's text controls are 17 tall, centred at y 12, against the app's 44 stretched ones ("the same to the eye").

## Record a batch counts

With no batch, below 724 the page carries two filled Record a batch buttons (band 1, log 1), as decision 30 answer 4 asks. From 724 up there is one, the log's (band 0, log 1). Both call `handleStartRecording` (Tests G and H).

## Verification and test count

- `npm --prefix app test`: 57 files, 1545 tests, all passing. Step 0 baseline was 56 files and 1529 tests, so +1 file (`VersionRow.record.test.jsx`) and +16 tests, none removed. No existing assertion needed changing.
- `npm --prefix app run build` passes.
- Probe, `matrix,behaviour,boards`: 1838 checks passed, 0 failures, exit 0. Tracer: 10 checks. Baseline: 324 checks.
- Commits of this item touch no stylesheet, token, sketch, canvas generator, `.impeccable` file, DESIGN.md or IngredientTable.jsx. `git status --porcelain app/src` is empty.
- The readings come from Playwright WebKit and system Chrome, not from Mark's devices. `app/dist` was rebuilt from the final code, so Mark's :4173 preview serves it. The preview was not started, stopped or requested.

## Deviations from Plan

None to the code. Three test notes:
- Test I passed at RED; Tests F and J passed at the Task 2 RED because Task 1 had wired the awaiting branch.
- Tests K and L share one describe block in `RecipePage.test.jsx`.
- The probe needed no fixes after its first complete run.

## Deferred: Mark's device check (human-check, end-of-run UAT)

Mark's :4173 preview serves the rebuilt `app/dist`. On each device he reloads the tab (a hard reload if it looks stale), then checks:
1. iPhone (393): Olive Oil v1's band shows a filled Record another with Next version underlined beside it. Tapping Record another opens the record pen with the Churn date in view. Cancel leaves him at the log, not back at the band.
2. iPhone: Coconut v2 shows a filled Record a tasting. Today it opens the Correct pen on that batch with Add tasting inside; 261002-wn0 changes this to open on Add tasting directly. Show changes wraps under the filled action on this version until 261002-wn1 moves it.
3. iPhone: Standard Base v1 shows two filled Record a batch buttons, one in the band and one in the log.
4. iPad, landscape 1366 and portrait 1024: the band is as before, with Next version filled and no record button in the band.

The change counts as device-verified only when Mark confirms.

## Known Stubs

None.

## Threat Flags

None. The band adds no input, endpoint or storage. The two controls call handlers the log already uses, and the seam amends `sortedBatches(batches)[0]`, the batch whose standing set the label (T-wmz-01, with the older-batch URL edge handed to wn0).

## Self-Check: PASSED

- FOUND: app/src/ui/VersionRow.record.test.jsx, the probe and the baseline JSON in the quick directory
- FOUND commits: ca3495f, 5fa1188, 4bcfa66, 0caaefa
- FOUND: `SEAM(261002-wn0)` and `onRecordTasting={handleRecordTasting}` in app/src/ui/RecipePage.jsx
