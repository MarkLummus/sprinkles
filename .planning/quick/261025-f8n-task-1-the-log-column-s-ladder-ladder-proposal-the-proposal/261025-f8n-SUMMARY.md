---
phase: quick-261025-f8n
plan: 01
quick_id: 261025-f8n
subsystem: notebook-log
tags: [log-ladder, typography, headings, creation-editor, tasting-pen, reading, webkit-probe]
requires: []
provides:
  - "The Log Ladder in aside.notebook-log: region names 14/600 caps, h3 group cues, 14/400 content on the 20px line, one 12/600 caption face"
  - "261025-f8n-ladder-probe.mjs: WebKit probe on a scratch build, reusable by 261025-f8o and 261025-f8p"
  - "261025-f8n-walk-rebase.mjs: updates only snapshot.textHash leaves of the walk baseline, reusable by 261025-f8o and 261025-f8p"
affects: [261025-f8o, 261025-f8p]
tech-stack:
  added: []
  patterns:
    - "Faces asserted against the approved boards' measurement JSON, not literals"
    - "Walk baseline rebased by a script that refuses any leaf but snapshot.textHash"
key-files:
  created:
    - .planning/quick/261025-f8n-task-1-the-log-column-s-ladder-ladder-proposal-the-proposal/261025-f8n-ladder-probe.mjs
    - .planning/quick/261025-f8n-task-1-the-log-column-s-ladder-ladder-proposal-the-proposal/261025-f8n-walk-rebase.mjs
  modified:
    - app/src/styles/notebook.css
    - app/src/styles/tokens.css
    - app/src/ui/CreationSetup.jsx
    - app/src/ui/BatchRow.jsx
    - app/src/ui/MarkOneField.jsx
    - app/src/styles/notebook.test.js
    - app/src/ui/CreationSetup.test.jsx
    - app/src/ui/CreationFlow.test.jsx
    - app/src/ui/BatchRow.test.jsx
    - app/src/ui/MarkOneField.test.jsx
    - .planning/phases/10-the-creation-editor-without-save/10-walk-before.json
    - DESIGN.md
    - .planning/sketches/013-creation-editor/README.md
decisions:
  - "decide-p10-log-ladder-r2 (revised-h3-r2): every cue in the log is an h3 under its region's h2"
  - "decide-p10-any-problems-level-r2: Any problems? is a cue; the two labels under it are h4 captions in pen and reading alike"
  - "decide-p10-picked-option-face: a picked problem is grotesk content, not the hand"
  - "decide-p10-card-head: the creation card has no head; remove stands beside Name"
  - "decide-p10-caption-level, decide-p10-log-figure-face, decide-p10-ladder-reach"
metrics:
  tasks: 3
  commits: 6
  tests_before: 3734
  tests_after: 3746
status: complete
actuals:
  tokens: 33000
  tasks: 3
  commits: 6
plan_head_before: f2de102609118fa55db9369d964c76d2a627d7f0
plan_head_after: 58d2c9a11b5dec8bcbd5b89775991b794a8d7dac
requirements-completed:
  - decide-p10-log-ladder-r2
  - decide-p10-any-problems-level-r2
  - decide-p10-picked-option-face
  - decide-p10-card-head
  - decide-p10-ladder-reach
  - decide-p10-caption-level
  - decide-p10-log-figure-face
  - look-p10-log-ladder-board
  - look-p10-ladder-redraw
---

# Phase quick-261025-f8n Plan 01: The log column's ladder Summary

The log column now reads as three levels and one tag: 14px caps region names, 14px/600 h3 cues in sentence ink, 14/400 content on the 20px line, and one 12/600 caps caption face. It covers the creation editor, the record and tasting pens and the batch reading. A WebKit probe that failed on the base build (66 PASS, 75 FAIL) now ends 141 PASS, 0 FAIL at 1366 coarse, 1366 fine and 393 coarse.

## What was built

**Task 1, the creation editor end to end (tracer).**
- `notebook.css`: the region names read `--app-size-meta`, in their own rule, and the group label keeps 12. The caption skin `.notebook-log .pen-caption` gains weight 600 and the label tracking. `.notebook-log .axis-mark__name` takes the same caption face. The cue rule's selector is now `.axes-cue, .mk-cue, .mk-cue-targets`.
- The creation block uses the spacing scale. `.mk-cue` has margin `var(--gap-m) 0 calc(var(--gap-xs) - var(--gap-s))`. The first cue keeps the head's 18. A cue to its card is 12. Targets takes `margin: 0` and keeps 12 and 12. `.mk-core` reads 14 on the 20px line. `.mk-card__head` is gone, replaced by `.mk-caprow`.
- `CreationSetup.jsx`: the four cues and Targets are h3. Each card's first row is `.mk-caprow` holding the Name field and remove. The card keeps `role="group"` and its `aria-label` ("Scale 1" / "Problem 1").
- Probe `261025-f8n-ladder-probe.mjs`: faces are read from `p-pen-measure.json` and `p-ladder-measure.json`. The one literal is the hand at its floor (20px, Caveat, rgb(31, 61, 122)).

**Task 2, the pens and the reading.**
- `BatchRow.jsx`: the AxesGrid cues, the pen's Any problems?, and the reading's Any problems? (which gains `--cue`) are h3. The two labels under Any problems? are h4 captions in the pen and the reading. The picked words lose `app-hand`.
- `MarkOneField.jsx`: the At draw / From freezer caption is an h3 with the same classes and id.
- `notebook.css`: `.batch-row__cell-value` is 14/400 on the 20px line. New rules: `.tasting-reading__problems` as grotesk content, and `.notebook-log .app-hand` at `--size-hand-min`. `tokens.css`: the 20px log value-size token is deleted and nothing reads it.

**Task 3, the baseline and the records.**
- `261025-f8n-walk-rebase.mjs`: writes only `snapshot.textHash` leaves, byte-identical round trip proven. The walk ends MATCH 94 snapshots.
- DESIGN.md: The Log Ladder Rule, with the Group cue, Label and Log content roles, the Hand role and Hand Rule, the batch log and tasting battery entries, and the `app-log-value` frontmatter entry kept in step.
- Sketch 013 README: decision 27, plus decision 25's build line.

## Verification

| Gate | Result |
| ---- | ------ |
| Probe on the base build (`dist-base`) | 66 PASS, 75 FAIL (the probe measures something) |
| Probe on the final build, no surface filter, 3 contexts | 141 PASS, 0 FAIL |
| `npm --prefix app test` | 3746 passed, 120 files (base 3734 plus 12 added) |
| Strict walk (`10-walk-check.sh`) | MATCH 94 snapshots |
| `10-device-steps.mjs` | 16 PASS, 0 FAIL |
| Baseline diff since base (`10-walk-before.json`) | 85 `snapshot.textHash` lines changed, 0 other lines |
| Retired token grep (`app-notebook-log-value-size` in `app/src/styles` and `app/src/ui`) | 0 files |

Probe PASS counts by phase:
- Creation surface only, before the pens and reading changes: 33 PASS, 0 FAIL.
- Whole probe: 141 PASS, 0 FAIL.

### Walk snapshots whose textHash was updated (85 leaves, scenario / step)

- correct-kept-draft: typed, reloaded, cancelled
- correct-save: pen-opened, duration-edited, saved
- record-pen-blocked: measurements-typed, blocked-two-measurements, one-measurement-fixed, blocked-churn-date, churn-date-typed, cancelled
- record-pen-edit-handlers: set-up, blocked-before-churn-field, churn-field-after-block, blocked-before-tasting-field, tasting-field-after-block, blocked-before-segment, segment-after-block, blocked-before-axis-mark, axis-mark-after-block, blocked-before-axis-clear, axis-clear-after-block, blocked-before-axis-clear-last, axis-clear-last-after-block, blocked-before-segment-clear, segment-clear-after-block, blocked-before-segment-clear-last, segment-clear-last-after-block, blocked-before-mark-one, mark-one-after-block, blocked-before-mark-one-clear, mark-one-clear-after-block, blocked-before-defect, defect-after-block, blocked-before-declared-defect, declared-defect-after-block, blocked-before-step-change, step-change-after-block, blocked-before-as-made, as-made-after-block, cancelled
- record-pen-kept-draft: typed, reloaded, cancelled
- record-pen-save: filled
- tasting-remove-restore: pen-opened, tasting-restored, cancelled
- tasting-save: tasting-filled
- version-pen-blocked: pen-opened, blocked-blank-name, blocked-again-same-field, grams-edited-after-block, blocked-again-after-grams, version-line-edited-after-block, blocked-grams-line, blocked-grams-line-fixed, blocked-before-why-edit, why-edited-after-block, blocked-before-sheet-title-edit, sheet-title-edited-after-block, blocked-before-before-note-edit, before-note-edited-after-block, blocked-before-other-grams-edit, other-grams-edited-after-block, blocked-before-cancel, cancelled
- version-pen-kept-draft: typed, after-debounce, reloaded, cancelled
- version-pen-notice-edits: notice-shown-before-grams-edit, grams-edited-with-notice, notice-shown-before-version-line-edit, version-line-edited-with-notice, notice-shown-before-why-edit, why-edited-with-notice, notice-shown-before-sheet-title-edit, sheet-title-edited-with-notice, notice-shown-before-before-note-edit, before-note-edited-with-notice, notice-shown-before-other-grams-edit, other-grams-edited-with-notice, cancelled

Task 1's changes alone moved no hash. These hashes moved with Task 2's tag swaps (a `p` becomes an h3/h4, so `innerText` has one line break instead of two) and its case flips (the labels under Any problems? go to caps).

### Base-to-final text diff (`.notebook` innerText, c1366, five states)

Every changed line is one of the expected kinds:
- cue case: EVERY RECIPE to Every recipe, THIS RECIPE ONLY to This recipe only, TARGETS to Targets, ANY PROBLEMS? to Any problems?
- a label under Any problems? going to caps
- the dropped SCALE 1 and PROBLEM 1 lines
- "remove" moving to follow Name
- 12 blank lines removed where a p became an h3 or h4

Nothing else changed.

### Sketch 013 snapshot behind the redraw (information only)

The board check was run per spec on the base build and on the final build.

| Spec | Base | Final |
| ---- | ---- | ----- |
| notebook | 148 PASS, 0 FAIL | 148 PASS, 0 FAIL |
| picker | 886 PASS, 0 FAIL | 886 PASS, 0 FAIL |
| editor | 259 PASS, 0 FAIL | 255 PASS, 4 FAIL |
| style | 953 PASS, 0 FAIL | 724 PASS, 229 FAIL |
| scales | 298 PASS, 116 FAIL | 230 PASS, 184 FAIL |

Notebook and picker lose no PASS. Every FAIL in editor, style and scales traces to this item's changes in the log column. The specs and the snapshot HTML are untouched, and re-snapshotting is Sid's.
- editor: `eA1` pageHeight (1248.9 board vs 1242 app); `.notebook-log .mk-region` box x3. The regions are shorter because the card head left and the cues and core names changed size.
- style (229): `.region-name` box and font (board 12px, app 14px); `.mk-band` box; `.mk-band__ends .ink-field` box; the Clear `.text-control` box. The bands sit 5px lower under Targets as an h3 cue and a 14px region name.
- scales (184, base already 116): `.region-name` box; `.mk-core` box and font (15px on 22.5 to 14px on 20); `.mk-card__head .notebook-caption` and `.mk-card__head .text-control` count, text and box (the head is dropped); `.mk-card`, `.mk-card .ink-field`, `.segmented__option` and `.mk-add` boxes (moved by the head and spacing); the eight panel frame heights.

## Deviations from Plan

None needing a rule. Three things the plan said to do or not do, plus two small additions:

1. **The three drawn rules not ported, as the plan said.**
   - `p-pen.py`'s `h3.axes-cue, h3.pen-caption { margin: 0 }` is not ported: class rules already set every cue's margin, and the rule would zero the 6 between the pen's labels and their chips.
   - `p10.py`'s `margin: 0 0 var(--gap-xs)` on `h3.mk-cue-targets` is not ported: Targets keeps 12 above and 12 below ("Nothing moves").
   - `p-ladder.py`'s `.tasting-reading__group > h4.batch-row__group-label` is not ported: the modifier-class flip does the reading's cues instead.
2. **The pen's labels under Any problems? are h4, not the board's h3**, so the pen's outline nests them under Any problems? as the reading's does. The probe's outline check and a new unit test pin it.
3. **[Rule 3 - test fix] Six existing assertions the plan's line list did not name.** They pinned the old tags: G3, G5, G10 and the two D25 per-version tests in `BatchRow.test.jsx`, including the `scaleCues` regex. They were updated to the new tags in the Task 2 test commit. G10's record-pen outline went from `[2, 3]` to `[2, 3, 3, 3, 3, 3, 3, 4, 4]`.
4. **[Probe] Below 1366 the reading's Tasting fold starts closed**, so the probe opens it (`Show`) in `reading-olive` before measuring. Mexican Chocolate v3 is an untasted batch, so its reading holds no cues or cell values; it is checked for region names, captions, outline and containment.
5. **[Test] The retired-token test** writes the token name as a concatenation, so the plan's grep for the literal name over `app/src/styles` and `app/src/ui` reads 0.

## Known Stubs

None.

## Threat Flags

None. No new endpoint, auth path or file access. Markup changes are tag and class swaps with React text only, and the remove stays a `Button`.

## Left alone (out of scope, per the plan)

- History in the band, the Sheet, and the band's captions.
- The pen's intervals and control sizes (item 261025-f8o).
- Tasting as a peer region, "Temperature", and the churn trio (item 261025-f8p).
- `AxisMark.jsx` (its "(Not recorded)" is f8o's).
- The sketch 013 board specs and snapshot HTML (re-snapshotting is Sid's).

## For Mark

- Device-unverified. Everything was measured in Playwright WebKit on the Mac at 1366 coarse, 1366 fine and 393 coarse, in the real app. None of it has been checked on the iPad or the iPhone.
- Observation: the card's remove aligns to the bottom of the Name label (`align-items: flex-end`, as the plan and board say). When Name is empty its Required line is part of that label, so remove sits level with the Required line, not the input. Check it on the device with a just-added scale or problem.
- Sketch 013's snapshot HTML predates the 2026-10-25 redraw. The editor, style and scales specs of `10-board-check.mjs` FAIL until Sid re-snapshots (listed above).
- Items 261025-f8o and 261025-f8p must land after this one. Both reuse `261025-f8n-walk-rebase.mjs` and the probe.

## Self-Check: PASSED

Files found: the probe, the rebase script, notebook.css, tokens.css, CreationSetup.jsx, BatchRow.jsx, MarkOneField.jsx, DESIGN.md and the sketch 013 README. All six commits are ancestors of HEAD: cd0975d3, ac3a75fd, 4eab49a2, 466aa3b0, a9cbd419, 58d2c9a1.
