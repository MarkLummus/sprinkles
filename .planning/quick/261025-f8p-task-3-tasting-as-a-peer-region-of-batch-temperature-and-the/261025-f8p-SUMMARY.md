---
phase: quick-261025-f8p
plan: 01
quick_id: 261025-f8p
subsystem: notebook-log
tags: [tasting-region, record-pen, labels, date-width, webkit-probe, walk-baseline]
requires: [261025-f8n, 261025-f8o]
provides:
  - "Tasting as a region, a peer of Batch, in the record pen: section[aria-label=Tasting], the Batch head's grammar, both heads 44, 18 under each, the region seam above"
  - "Temperature and Duration at their one source (battery.js), Churned in the pen and on the print log, --sheet-field-w-date at 120"
  - "261025-f8p-pen-probe.mjs (record and check modes) and 261025-f8p-walk-normalise.mjs"
affects: []
tech-stack:
  added: []
  patterns:
    - "Interval keys with an occurrence index so a probe's base and after builds compare key by key"
    - "Baseline re-recorded only after a normalised compare (old label prefixes rewritten) proves only textHash leaves differ"
key-files:
  created:
    - .planning/quick/261025-f8p-task-3-tasting-as-a-peer-region-of-batch-temperature-and-the/261025-f8p-pen-probe.mjs
    - .planning/quick/261025-f8p-task-3-tasting-as-a-peer-region-of-batch-temperature-and-the/261025-f8p-pen-measure.json
    - .planning/quick/261025-f8p-task-3-tasting-as-a-peer-region-of-batch-temperature-and-the/261025-f8p-walk-normalise.mjs
  modified:
    - app/src/ui/BatchRow.jsx
    - app/src/ui/PrintLogPages.jsx
    - app/src/domain/battery.js
    - app/src/styles/notebook.css
    - app/src/styles/app.css
    - app/src/styles/tokens.css
    - app/src/ui/BatchRow.test.jsx
    - app/src/ui/BatchRow.dates.test.jsx
    - app/src/ui/RecipePage.recordTasting.test.jsx
    - app/src/ui/RecipePage.undoRetire.test.jsx
    - app/src/ui/PrintLogPages.test.jsx
    - app/src/domain/battery.test.js
    - app/src/styles/notebook.test.js
    - app/src/styles/cross-cutting.test.js
    - .planning/phases/10-the-creation-editor-without-save/10-walk.mjs
    - .planning/phases/10-the-creation-editor-without-save/10-walk-before.json
    - DESIGN.md
    - .planning/sketches/007-full-battery/README.md
    - .impeccable/surfaces/route-print-recipe-sheet.md
decisions:
  - "decide-p10-tasting-gate: the region appears on Add tasting; Add tasting stays in the two ceremonies"
  - "decide-p10-churn-trio: date field 120 app-wide; Churned, Out of machine, Duration"
  - "look-p10-ladder-redraw: P10_Pen approved with Temperature and Churned"
metrics:
  tasks: 3
  commits: 3
  tests_before: 3759
  tests_after: 3765
status: complete
actuals:
  tokens: 60000
  tasks: 3
  commits: 3
plan_head_before: 1548c1eef7a5fd563e17696f7809aaaaf538c005
plan_head_after: 1aa815584ace1df2a2c028c335cad606c7103914
requirements-completed:
  - decide-p10-tasting-gate
  - decide-p10-churn-trio
  - look-p10-ladder-redraw
---

# Phase quick-261025-f8p Plan 01: Tasting a peer region of Batch, Temperature and the churn trio on one line Summary

In the record pen, Tasting is now a region of its own: a `section[aria-label="Tasting"]` whose first child is the Batch head's grammar (an h2 name and the status line in the lead, Restore tasting and Remove tasting in the acts, flush right), one 44px row for both heads, 18 under each, and the region seam (20, the row hairline in the divider colour, 20) above Tasting. "Temperature" and "Duration" come from `battery.js`, "Churned" is the date caption in the pen and on the print log, and the date field is 120 wide, so Churned, Out of machine, Duration and Tasted, Tempering, Temperature each stand on one line at 1366 coarse, 1366 fine and 393.

## What was built

**Task 1, Tasting a peer region (tracer).**
- `BatchRow.jsx`: the fragment around the tasting block became `<section aria-label="Tasting">`; the retired head became `div.batch-row__head.batch-row__head--tasting` with `.batch-row__head-lead` (`h2.region-name` "Tasting", then `p.tasting-status.pen-helper`, still rendered while empty so the live region keeps announcing) and `.batch-row__head-acts` (Restore tasting while an undo is pending, then Remove tasting with class `text-control`). Next time stays inside the region, between the melt block and From freezer.
- `notebook.css`: one block next to the Batch head's rules: the two pen heads at `min-height: var(--touch-min)` with `align-items: center`; the Tasting head's `margin-top` and `padding-top` `--gap-m`, `border-top` `--app-rule-row` solid `--app-divider`, `margin-bottom` `--app-notebook-log-group-gap`; the acts `margin-left: auto`; the acts' buttons `margin-top: 0` (outranks `.batch-margin button`'s 12 so the row is the decided 44, not the board's inherited 56). The board's `:empty` rule is left out on purpose (the status line is a live region). The retired `.mo-end` and `.tasting-head` rules left `notebook.css`, and its three rules left `app.css`.
- Walk harness: `addTasting` waits for `.batch-margin--pen .batch-row__head--tasting`; the two remove clicks use the file's own `button(page, 'Remove tasting')`.
- Walk: MATCH 94 snapshots against the untouched baseline (the innerText of the pen is the same words).

**Task 2, the labels and the width.**
- `battery.js`: `churnDurationMinutes` reads "Duration", `tastingTempC` reads "Temperature" (units, keys, errors unchanged). This reaches the pen captions, the inputs' accessible names ("Duration, minutes", "Temperature, degrees Celsius") and the print log's figures.
- `BatchRow.jsx`: the churn date caption reads "Churned"; the two reading-cell literals read "Temperature" and "Duration". `PrintLogPages.jsx`: `dateCaption="Churned"`. `tokens.css`: `--sheet-field-w-date: 120px` with its comment rewritten.
- Walk: `CHURN_DURATION` selects `input[aria-label^="Duration"]`; `fieldValue` reads 'Churned', 'Duration' and 'Temperature'.

**Task 3, the record.** DESIGN.md (line count unchanged at 692): the batch log entry names the peer head, the seam, the two one-line rows and the 120 date field; the log pages entry reads ("Churned", "Tasted"); the pen-rhythm bullet notes the region seam stands above Tasting in place of the 32. Sketch 007's README: line 27 carries the reversal sentence, and a new last section "Superseded in the app (2026-10-25)" lists index.html lines 242-246, line 27's clarification, line 41's 128 and lines 213 and 216, with Mark's quotes and answers; `index.html` is untouched. The print brief's lines 56, 58 and 64 read Churned, Duration and Temperature (line count unchanged).

## Probe results (Playwright WebKit, scratch build, never app/dist)

`261025-f8p-pen-probe.mjs check ... --part all`: **168 PASS, 0 FAIL** at c1366, f1366 (pointer coarse false) and c393, on path A (Olive Oil v1: Record another, then Add tasting) and path B (Home's Record a tasting, Mexican Chocolate v3). The Task 1 run with `--part head` read 102 PASS, 0 FAIL.

- One `section[aria-label="Tasting"]`, first child the head, lead h2 then status, Remove tasting's right edge on the pen's right edge, both heads 44 (the Tasting head's content box, as decided, not the board's 56), 18 under each, the seam 20 / 1px divider colour / 20, one face for both h2 names.
- Outline: h2 Batch > h3 At draw > h2 Tasting > h3 From freezer, Every recipe, This recipe only, Any problems?; no h3 reads Tasting; no retired class in the document.
- Path B focus is the Tasted date input. The churn-only pen has no Tasting section and two Add tasting buttons; with the region open none remain.
- Rows on one line (tops equal): Churned 120 + Out of machine 119.5 + Duration 81.9 = 345.4 of 350 (353 at 393); Tasted 120 + Tempering 81.9 + Temperature 99.9 = 325.8. Both date inputs 120 wide; the intrinsic date box (width auto) is 109.3 coarse and 104.4 fine, inside 120. Required stands under the Churned input inside its label.
- Reading (Olive Oil v1, Tasting fold open): cell labels include Duration and Temperature; neither old word anywhere in the log text.
- Base comparison: 48 (path A) and 40 (path B) unowned intervals equal the base within 0.5. Pen height, path A at 1366 coarse: 2387.8 base, 2232.0 now (the two rows are one line each); path B 2003.6 to 1847.8.
- Board deltas (INFO): exactly the two expected, -6 on the Airiness control to the Tasting name and -6 on the Tasting name to Tasted (the 12px button margin the board kept, zeroed here). Three more are not this item's: +6 on "Every recipe" to its chips and "This recipe only" to its chips (261025-f8n's drawing; the board has 0), and -24 at 393 on five Clear-head intervals (261025-f8o's choice 3: the lifted Clear target; reported there).

## Verification

| Gate | Result |
| ---- | ------ |
| Walk at base before any edit | MATCH 94 snapshots |
| `npm --prefix app test` | 3765 passed, 120 files (base 3759) |
| Walk after Task 1 | MATCH 94 snapshots, baseline untouched |
| Walk after Task 2 | normalised compare: 162 label leaves rewritten, 92 DIFF leaves, all `snapshot.textHash` (proved with 261025-f8n's rebase script, which refuses any other leaf; its result was byte-identical to the new recording); baseline re-recorded; `selftest` 5 PASS; 10-walk-check.sh MATCH 94 snapshots |
| Old words in `app/src` outside tests | none; none in 10-walk.mjs |
| Retired head or seam classes in `app/src` outside tests | none |

Tests added or changed: BatchRow.test.jsx (new: peer-region markup, no h3 or retired class; flipped: the tasting block anchor, Remove in the acts, the h3 test now an h2 test, the two outline tests, the pen order test, plus the label flips named by the three old words throughout); BatchRow.dates.test.jsx (Churned date); RecipePage.recordTasting.test.jsx (h2 Tasting); RecipePage.undoRetire.test.jsx (the Remove button by name); notebook.test.js (new describe of four tests for the head rules and the retired selectors; the 18 test re-anchored); battery.test.js (new labels test; signed labels); PrintLogPages.test.jsx (Churned, Duration, Temperature, negatives on the old words); cross-cutting.test.js (120).

Walk steps re-recorded (Task 2): textHash only, on 92 of 94 snapshots (every scenario's steps except `version-pen-save`'s two, whose text holds neither word); label leaves rewritten for the comparison only in the 12 record and correct scenarios: record-pen-edit-handlers 30 steps, record-pen-blocked 7, record-pen-save 1 (filled), record-pen-kept-draft 2, correct-save 2, correct-kept-draft 2, tasting-remove-restore 6, tasting-save 1. The pen-open and reading text changed because the words did.

## Deviations from Plan

None needing a rule. Notes:
1. **Probe fill selectors** use lower-case substrings ('duration', 'temperature') so one fill serves the base and the new build (Playwright's `getByLabel` matches case-insensitively by substring).
2. **Pen-rhythm bullet in DESIGN.md** got one clause (the region seam stands above Tasting in place of the 32), as 261025-f8o's summary asked; the line count is unchanged.
3. **Print brief lines 56 and 58** follow the same decided words as line 64 (a planner call the plan reported).
4. The probe file was not edited in Task 2; the row gates were already in it from Task 1's write (run with `--part all`).

## Correct pen on a version with two or more batches

Measured on Olive Oil v1 after saving a second batch (WebKit, 1366 coarse): the batch list stands above the Batch head with 18 between its bottom and the head; the head is `batch-row__head--after-list`, 59 tall (14px padding, 1px hairline, then the 44 row), and 18 sits under it to the first field. The head row's content is 44, as in the single-batch pen.

## Left alone

- `app.css` `.versions__ceremony-field .ink-field[type='date']` reads `--sheet-field-w-date` but no JSX renders that class (pre-existing; not deleted).
- `.impeccable/surfaces/route-recipe-batch.md` (lines 72, 82, 87, 170, 208) and `.planning/sketches/010-bench-sheet/CONTRACT.md` (lines 27, 28, 57, 59, 74) still name the old words (Churn date, Churn duration, Tasting temperature).
- Sketch 007's `index.html` (every line citation holds), SaveCeremony's Add tasting and Restore props, the focus landings, the reading's fold rows, Clear, Next time's place, the hand.
- Pre-existing, noted by the earlier items: `app.css` ~1945 comment over `.axis-mark__state`; DESIGN.md "not yet built" marker on the At draw bullet and the App skin bullet's "no size, gap or face moving".

## For Mark

- Device check, iPad (build plus `preview --host`, never the dev server): the Churned and Tasted date controls show their whole date at 120px, and the Tasting head stands as a peer of Batch on both entry paths. Device-unverified until then.
- Wording was drawn and approved on P10_Pen: "Temperature" (not "Served at") and "Churned" (not "Churn date").

## Known Stubs

None.

## Threat Flags

None. Static labels and CSS reading existing tokens; the probe and the walk abort every request to a host other than 127.0.0.1.

## Deferred Human Verification

Verified in Playwright WebKit on the Mac, in the real app on a scratch build. Not run on Mark's iPad or iPhone: the date control at 120px and the Tasting head's look under a thumb are his.

## Self-Check: PASSED

Files found: the probe, its measure record, the walk normaliser, `BatchRow.jsx`, `battery.js`, `notebook.css`, `tokens.css`, the walk baseline, DESIGN.md, sketch 007's README and the print brief. Commits d37dcbfe, 81e75a86 and 1aa81558 are ancestors of HEAD; `git rev-list --count` from the base reads 3.
