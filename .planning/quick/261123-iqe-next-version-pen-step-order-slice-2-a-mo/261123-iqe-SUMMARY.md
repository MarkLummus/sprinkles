---
phase: quick-261123-iqe
plan: 01
subsystem: ui
tags: [version-pen, step-order, sketch-017, was-step-mark, show-changes, phase-12-gate]
requires:
  - phase: quick-261123-ghk
    provides: the pen moves steps and saves the order; keptOrderChanged
provides:
  - "movedFromNumbers: each live step whose number differs from its parent number, once keptOrderChanged is true"
  - "buildDiff's stepOrderChanged and each step descriptor's movedFrom"
  - "The words ' was step N' in the Next version pen (closed and open step) and in Show changes"
  - "The Phase 12 gate holds pm-once and pm-twice leads, pm-removed, pm-open, so-a, so-read and so-table"
affects: [phase-12-gate]
tech-stack:
  added: []
  patterns:
    - "One rule (keptOrderChanged) read by the pen's dirty check and by the mark"
key-files:
  created: []
  modified:
    - app/src/domain/stepNumbers.js
    - app/src/domain/stepNumbers.test.js
    - app/src/domain/diff.js
    - app/src/domain/diff.test.js
    - app/src/ui/Method.jsx
    - app/src/ui/Method.test.jsx
    - app/src/ui/Method.preview.test.jsx
    - app/src/ui/RecipePage.stepOrder.test.jsx
    - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-penpreview.mjs
decisions:
  - "Choice A (decide-p12-pen-order-mark): the words ' was step N' in span.method-step__skipped-label, the type of 'removed'; no CSS, no token"
  - "A removal alone marks nothing new; once the order differs every changed number is marked, including one a removal shifted"
  - "buildDiff's step descriptors follow current.method's own order; both comments that said ascending key order are corrected"
  - "An open step with targets: the span stands after the fields and any struck words, before the chips line (undrawn state 1)"
metrics:
  duration: "about 1.5 hours"
  completed: 2026-11-23
status: complete
actuals:
  tokens: 9700
  tasks: 3
  commits: 5
plan_head_before: 5a9278a5e77931f087865b3ca7eefbaf1c8cc864
plan_head_after: d856fddef9ddbe7b9685e018ac4e6afad45827c3
---

# Phase quick-261123-iqe Plan 01: the "was step N" words in the Next version pen Summary

**A step whose number changed with the order says " was step N" after its words, in the pen (closed and open) and in Show changes, from one rule (`keptOrderChanged`), with no CSS, no token and no stored-shape change; the Phase 12 gate now holds seven marked sketch 017 panels in WebKit and Chrome.**

`actuals.commits` counts the five commits made before this file; the SUMMARY commit follows as the sixth. `actuals.tokens` is chars/4 over the realized diff (38,971 chars), the same scale as the estimate.

## What was built

The rule (sketch 017 CONTRACT section 5, choice A; README decision 9; decide-p12-pen-order-mark = A): compare the steps live in both the version (or the pen's draft) and its parent, each in its own order (`keptOrderChanged`, slice 1). When they stand in the same order nothing is marked. When they differ, every live step whose number differs from its number on the parent reads " was step N", N being that parent number. A removed step reads as built.

- `app/src/domain/stepNumbers.js`: `movedFromNumbers(method, baseMethod)` returns a Map from a stored key to its number on the base; empty unless `keptOrderChanged`; holds only live steps with a base number and a different number; entries in method's own order; never mutates. `keptOrderChanged`'s comment now names it instead of a future slice.
- `app/src/domain/diff.js`: `buildDiff` returns `stepOrderChanged` and gives every step descriptor (both shapes, including the no-baseline-step shape) `movedFrom`, a number or null. The Map is built once per call. The module header and the `buildDiff` doc comment no longer say "already ascending n": the descriptors follow `current.method`'s own order.
- `app/src/ui/Method.jsx`: one small module-level function `wasStepMark(stepDiff)` (null when `movedFrom == null`), used at three places: the pen's closed step (last child of `p.method-step__lead`, after the " removed" line), the pen's open step (last in `div.method-step__open-fields`, after the "removed" line and before the chips line), and Show changes (last child of the lead). The reading page, Preview step, the Ingredients table and the print files are untouched and carry no mark.
- No CSS rule, no token, no store, draft, `DB_VERSION` or `DRAFT_SHAPE_VERSION` change; no words beyond " was step N".

Marks per panel, word for word:

| Panel | Marks |
|---|---|
| pm-once (Sweeten up once) | Steep, Strain, Sweeten " was step 4", Rest " was step 3", Churn |
| pm-twice (up again) | Steep, Sweeten " was step 4", Strain " was step 2", Rest " was step 3", Churn |
| pm-removed (then Rest removed) | Steep, Sweeten " was step 4", Strain " was step 2", Rest " removed" with no number, Churn " was step 5" |
| pm-open (pm-twice, Sweeten open) | " was step 4" last in Sweeten's open fields; Strain and Rest closed and marked as in pm-twice |
| so-a (saved, Show changes on) | Steep 1, Sweeten 2 " was step 4", Strain 3 " was step 2", Rest struck 3 " removed", Churn 4 " was step 5" |
| so-read (Show changes off) | Steep, Sweeten, Strain, Churn numbered 1 to 4, no mark, no removed step |
| so-table | step heads "Step 1 Steep" and "Step 2 Sweeten", no mark |

## Red then green

Task 1 (tracer, end to end):
- RED `90df4cc0`: M1 to M8 (missing export) and D1 to D4 (missing fields), W1 and W2(b) failed. D5 passed as a bound (a move leaves both versions unmutated, before the field exists), and W2(a) passed as a bound (a removal alone marks nothing new).
- GREEN `a410c9db`: all pass.

Task 2:
- RED `656c417b`: W3, W4, P1, S1 failed. P2, P3, S2 passed as bounds (Preview step, an unmoved open step, and the reading and recording states carry no mark); S3 passed as a pin of Task 1's closed branch.
- GREEN `124fe711`: all pass.

Suite: 138 files and 4,668 tests before; 138 files and 4,692 tests after (24 new: 8 + 5 + 4 page, 1 + 3 preview, 3 Method; W2 counts as two).

## The gate

`12-board-penpreview.mjs` (chore `d856fdde`), slice 1's spec shapes and flows kept:
- pm-once and pm-twice gain `p.method-step__lead` and `span.method-step__skipped-label` (count, text, box, font).
- New panel steporder-pm-removed, with the one stated allowance (see undrawn state 8): box checks on the three steps above the removed one only; every count, text, font, aria and size check on every step.
- New panel steporder-pm-open (opened step 2 after the two moves).
- A third spec for `step-order-shown.html`: steporder-so-a (Show changes on, absent `.method-step__n-from`), steporder-so-read (absent mark, struck prose and `.method-step__n-from`) and steporder-so-table (absent mark).
- Header comment updated; the Preview step spec is unchanged.

Board engine, `--selftest`, scratch build:

| Engine | Result | Evidence |
|---|---|---|
| Playwright WebKit | 625 PASS, 0 FAIL | `${TMPDIR}/sprinkles-iqe/evidence-webkit` |
| Chrome (shim) | 625 PASS, 0 FAIL | `${TMPDIR}/sprinkles-iqe/evidence-chrome` |

Per panel, both engines identical: pm-moves 122/0, pm-once 26/0, pm-twice 29/0, pm-removed 113/0, pm-open 120/0, pm-table 14/0, so-a 55/0, so-read 30/0, so-table 15/0 (PASS/FAIL), and every panel prints its PASS selftest line.

## Side by side, board against app

Scratch script `${TMPDIR}/sprinkles-iqe/side-by-side.mjs` (not in the repo), 1366 x 1024, coarse pointer, both engines. Every element of each panel is read from the anchor's top-left on the board and in the app; differences above 1 px or in text are listed. Result in WebKit and Chrome alike:

| Panel | Difference board to app | Verdict |
|---|---|---|
| pm-moves, pm-table, pm-open, so-a, so-read, so-table | none above 1 px, no text difference; method region's own height differs (a stretched grid item, as slice 1 found) | match |
| pm-once, pm-twice | text of Sweeten's li and its Move up: the board's purple notes ("pressed; focus stays here", "pressed again") | expected (`.dl-flag` is not in the app) |
| pm-removed | removed step's number cell 0 wide on the board, 12 x 23 in the app in WebKit (11.1 x 24 in Chrome); its body 12 px right; its li 88 against 84; Churn 4 px lower | expected, undrawn state 8 |

Extra checks (both engines):
- The " was step 4" span on pm-once is 80.8 x 14.1 in WebKit (79.2 x 15 in Chrome), on the step's own line (its y is inside the lead's first line).
- li heights of pm-once and pm-twice are [88, 88, 88, 88, 88], the same as pm-moves: a marked step keeps its height.
- Open Sweeten on pm-open is 284.3 in WebKit (283 in Chrome), the board's own height: slice 1's 18 px (17 in Chrome) gap closed with the span.
- scrollWidth is not above innerWidth on any panel.
- Preview step pressed in the pm-open state: `.mk-preview` text is "PREVIEW 2 Sweeten. Stir in the dextrose and the salt.", no "was step".
- The saved child's `/print` page reads Steep, Sweeten, Strain, Churn as 1 to 4, with no "was step" in `#root`'s text.

## Phase 11 walk and the full gate

- `sh .planning/phases/11-steps-structure-save-and-print/11-walk-check.sh`: `MATCH 94 snapshots; NEW create-recipe 3; NEW edit-first-version 3; NEW edit-stale 5; NEW create-save-refused 2; NEW edit-kept 5`. No walk file was touched (`git diff` against the base shows none).
- `sh .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-check.sh`: suite 138 files, 4,692 tests; probe, print, roundtrip, pdf and sim steps green; walk MATCH 94; GATE1 PASS; board 4,667 PASS, 0 FAIL; phone, band, tabs (9 PASS), keys (101 PASS); last line `GATE2 PASS`.

## Deviations from Plan

**1. [Rule 1 - test bug] W2 split in two.** The plan's W2 (a) and (b) as one test failed on the second `openPen`: the first pen keeps its draft, so a remount restores a pen and Next version is no longer there. W2(a) and W2(b) are now two tests, each on its own fresh store, which is what "a fresh pen" and "a new pen" meant. Done in the Task 1 green commit `a410c9db`.

**2. [Rule 1 - test bug] W4's last assertion.** The plan said the pen on the reordered child "holds no ' was step' span". The saved child still has Rest removed, so the pen rightly draws its " removed" span (same class). The assertion now reads that the region's text has no "was step", which is the fact meant. In `124fe711`.

Both are test corrections only; no app code differs from the plan.

## Undrawn states (1 to 8) and what the build does

1. An open step with targets: the span stands after the two fields and any struck words, and before the chips line (where " removed" stands). CONTRACT says "last inside open-fields", which would put it after the chips; the board draws no step with targets. P1 pins the built order. Sid to draw or confirm.
2. A moved step whose words also changed: closed and in Show changes the new words stand in the lead with " was step N" after them, the parent's struck words beneath (S1, S3 pin it). Open, the span follows the struck words.
3. A step live in the draft but removed in the parent, or one the parent does not hold: no parent number, never marked (M6, M7).
4. A removal and a move that cancel, so a step's number equals its parent number: not marked (D4).
5. The pen opened on a version whose own order differs from its parent's: nothing is marked until a move; Show changes on that version marks against its own parent (W4).
6. Show changes below 724 down to 393: the same span, inline after the words, wrapping with the line. Boards are 1366 only; no narrow check was made.
7. One live step, or every step removed: no order can differ, no mark.
8. pm-removed draws the removed step's number cell 0 wide (drawn before 261123-ghg, dc03ad5c); the app gives it one figure's width. The gate allows exactly this (box checks on the three steps above only), and the side by side shows nothing else.

## Known Stubs

None.

## Threat Flags

None. The span is a number computed from array positions rendered as one React text child; no new endpoint, store write or file access.

Device-unverified: Playwright WebKit and Chrome on a Mac, never Mark's iPad.

## For the orchestrator

I have no access to Mark's List.
- bug-p11-pen-steps-no-reorder and decide-p12-pen-order-mark are built and can be closed once this lands. (decide-p12-pen-order-scope = order only was already honoured by slice 1.)
- Undrawn state 1 (the open step with targets) is built at the nearest precedent: Sid to draw or confirm.
- pm-removed's number cell (undrawn state 8) is stale on the board: Sid may redraw it from the built page, after which the gate's allowance can be dropped.
- Undrawn state 6 (Show changes at 393) is built but unchecked at width.
- Dist: a dist built from these commits is safe to deploy. The suite (138 files, 4,692 tests) and GATE2 pass; no store write, no `DB_VERSION` or draft shape change, no CSS.

## Self-Check: PASSED

All five commits (`90df4cc0`, `a410c9db`, `656c417b`, `124fe711`, `d856fdde`) are ancestors of HEAD; every modified file named in the frontmatter exists; no file under `.planning/phases/11-steps-structure-save-and-print`, `app/src/store`, `app/src/styles`, `IngredientTable.jsx`, `StepReading.jsx` or the print files changed.
