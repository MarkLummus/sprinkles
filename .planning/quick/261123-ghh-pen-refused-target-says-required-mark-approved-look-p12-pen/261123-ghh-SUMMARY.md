---
phase: quick-261123-ghh
plan: 01
subsystem: ui
tags: [pen, method, target-chip, css-grid, required, sketch-016]
status: complete
requires: [261123-ghg]
provides:
  - "the version pen's refused target says Required directly after its blank side, wired with aria-invalid and aria-describedby"
  - "every open-step chip in the pen is the creation editor's flowing inline grid, so a changed value's struck value keeps one line"
affects: [app/src/ui/Method.jsx, app/src/styles/notebook.css]
tech-stack:
  added: []
  patterns: ["grid-auto-flow column with every child on row 1 and the error on row 2: markup order is the layout"]
key-files:
  created: []
  modified:
    - app/src/ui/Method.jsx
    - app/src/styles/notebook.css
    - app/src/ui/RecipePage.perStep.test.jsx
    - app/src/styles/notebook.test.js
key-decisions:
  - "The snapshot's four rules copied declaration for declaration, with .r3-chip replaced by .notebook; no other rule"
  - "WebKit two-target case B shifts the refused chip's value field 0.51 px: reported, no rule added"
requirements-completed: [look-p12-pen-target-required, bug-pen-saves-blank-lead-in]
plan_head_before: 93f733eb5fcb2d9213c3f95285d20736c043cba7
plan_head_after: 8ed16c3fcc55d399e8263b91061e3645c213f850
commits: 2
actuals:
  tokens: 14000
  tasks: 3
  commits: 2
---

# Phase quick-261123-ghh Plan 01: The pen's refused target says Required Summary

The version pen now stands Required directly after the blank side of a refused target, inside the chip, in the creation editor's word, place and grid; a changed value's struck value keeps one line.

## Authority

Sketch 016 CONTRACT section 13, `pen-target-required.html` (board `P12R3_PenTarget`), README decisions 42 to 46, and Mark's approval on 2026-11-23 (`look-p12-pen-target-required`, decision 44 included).

## Red and green

- Red, commit `55dc975b`: U7, U8, U9, U10, U12 and the four CSS tests failed; U11 passed as a bound. Failing lines are in the scratch folder as `red.txt`.
- Green, commit `8ed16c3f`: the same nine pass.
- Suite before: 137 files, 4605 tests. After: 137 files, 4613 tests (plus 8: U9 to U12 and four CSS tests; U7 and U8 were extended).

## What was built

- `app/src/ui/Method.jsx`, StepPenBody's open-step chips: each side gets `aria-invalid`, `aria-describedby` (the pen's one id, `step-field-error`) and a `FieldFeedback` directly after its textarea, rendered unconditionally so the focused field is never remounted. The word is `blockedMessage` (Required); no new words. Count gates: FieldFeedback 5 (base 3, plus 2), aria-invalid 4 (base 2, plus 2), STEP_FIELD_ERROR_ID 9 (base 5, plus 4).
- `app/src/styles/notebook.css`: the snapshot's four rules (`pen-target-required.html` lines 13156 to 13159) under `.notebook .method-step__open-fields .target-chip`, placed after the creation chip's grid rules: `inline-grid` with `grid-auto-flow: column`, `justify-content: start`, `column-gap: var(--gap-hair)`; `> *` on `grid-row: 1`; `> .struck-value` with `align-self: center`; `> .field-error` on `grid-row: 2`. One explanatory comment above.
- Tests: U7 to U12 in `RecipePage.perStep.test.jsx` and a new describe of four tests in `notebook.test.js`.
- No change to CreationSteps.jsx, FieldFeedback.jsx, app/src/domain, app/src/store or any gate file. No markup-injection line added.

## Side by side, board against app

Run on a scratch spec (not committed) with the Phase 12 board engine, `--selftest`, within 1 px.

| Panel | WebKit PASS | Chrome PASS | Selftest refuses |
|-------|-------------|-------------|------------------|
| pt-value | 29 | 29 | yes (both) |
| pt-label | 26 | 26 | yes (both) |
| pt-changed | 24 | 24 | yes (both) |

Both logs end `82 PASS, 0 FAIL` (WebKit and Chrome), with a `PASS selftest` line for each panel. The tracer run (WebKit, no selftest) ended `79 PASS, 0 FAIL`.

Readout of the built page (chip w x h; box positions from the chip's top-left):

| State | WebKit | Chrome |
|-------|--------|--------|
| Value blank | chip 503.97 x 65; struck value 77.6 wide, 1 line at (7, 15.5); label field 196.4 wide; value field 210 x 44 at (287, 1); Required 210 x 15 at (287, 49) | chip 452.83 x 64; struck value 72.83 wide, 1 line; fields 180 x 44; Required 180 x 14 at (265.83, 49) |
| Label blank (no struck value) | chip 436 x 65; label field 210 at (7, 1); Required 210 x 15 at (7, 49); value field at (219, 1) | chip 376 x 64; fields at 7 and 189, 180 wide; Required 180 x 14 |
| Value changed, not refused | chip 503.97 x 46; struck value 77.6 wide, 1 line | chip 452.83 x 46; struck value 72.83 wide, 1 line |

These agree with the README's figures: Required 210 x 15; chip 46 to 65 high in WebKit and 64 in Chrome; with no struck value the fields at 7 and 219 px, 210 wide; the struck value on one line, about 78 wide.

Two targets on Olive Oil v1 Step 2 (temp 85 °C, hold 2 min), each chip on its own line, the refused chip's first row unmoved except where noted:

| Case | WebKit | Chrome |
|------|--------|--------|
| A: target 2 refused | PASS. Growth 19 px; chip 1 unchanged; chip 2 grows 46 to 65 high, top unmoved | PASS. Growth 18 px; same |
| B: target 1 refused | FAIL by 0.51 px (see below). Growth 19 px; chip 2 lowered by exactly 19 | PASS. Growth 18 px; chip 2 lowered by exactly 18 |

Case B in WebKit: chip 1 is 503.97 wide, clamped to the step body by its 65 px struck value, so WebKit's auto columns shrink the two fields (209.47 and 209.48). Adding the Required row changes that split: the label field becomes 208.95 wide and the value field starts at x 286.97 instead of 287.48, 0.51 px over the 0.5 px pass rule. Everything else holds: the chips stay on separate lines, chip 2's size holds, chip 2 moves down by exactly the growth, and Required stands under the value field. No rule was added and no threshold changed; the numbers are in the scratch `board-diff.txt`. The same clamp is what the approved `pt-changed` board draws (fields 203.2 wide), so this is the snapshot's own grid at the container's edge, not an app departure. Whether 0.51 px is acceptable is for Mark and the orchestrator.

## Gate

The full `12-check.sh` was not run, as the batch notes direct: no Phase 12 gate file holds the pen's target chip (12-board-penpreview.mjs's Coffee has no target; 12-tab-probe.mjs reads the creation editor's chips; 11-walk.mjs reads reading-chip text), so no gate file changed. The orchestrator runs the full gate on main after the merge. The board engine was run on its own for the three drawn panels in both engines.

## Undrawn states and what the build does

1. Two targets on one step with one refused: nothing beyond the chip rule. Measured above; each chip stands on its own line in both engines, and the chip after a refused one moves down by exactly the growth. WebKit case B has the 0.51 px shift described above.
2. Both sides blank: never refused, no Required drawn, Save drops the target (U11).
3. Required clears at the next edit anywhere in the pen, Version name included (U9, U10); no new clearing code.
4. A pen kept open while the window narrows below 724: not drawn, not measured; the rule has no media condition.
5. A fine pointer at the desk: not drawn, not measured; the fields lose the touch floor's padding, so the chip's heights differ from 46 and 65.
6. What is announced: as built in 261122-tqn; a step block announces nothing, focus moves into the field, and Required describes it.

## Deviations from Plan

None in the app. The scratch spec's `openPen` fills the new target before the wait and fills Version name `hotter` as the plan says; the two-target readout scopes its chips by `#method-step-2` (the app's step id) instead of the creation editor's `data-step`.

## Device-unverified

Playwright WebKit and Chrome on a Mac, never Mark's iPad.

## For the orchestrator

- Close `look-p12-pen-target-required`: built as approved.
- Close `bug-pen-saves-blank-lead-in`: 261122-tqn held it open because the target half refused without a word; it now says Required.
- Check `decide-p12-pen-target-required-place` and close it if it is still open.
- The README's "Noticed, as built, for triage" (the squeezed struck value) is fixed by decision 44 and needs no row.
- Decide on the WebKit case B 0.51 px shift (two targets, first refused, first chip's struck value wide enough to clamp the chip). It is sub-pixel and in an undrawn state; if Mark wants it held, the next step is a sketch or board decision, not a rule here.
- The scratch spec `pentarget-spec.mjs` could be committed as a Phase 12 board spec and added to `12-check.sh`'s board step if the gate should hold this board. It was not, to keep the change to the item.
- A dist built from these commits is safe to deploy: no store write, no stored shape change, `DB_VERSION` unchanged.
- A device check is optional; the steps were walked in WebKit by the measurement script. One step per line:
  1. Open Olive Oil v1 in a wide window and press Next version.
  2. Type a Version name.
  3. On Step 1 press Edit this step and clear the target's value.
  4. Press Save as new version. Expect: Required under the empty value, inside the chip, and the cursor in it.
  5. Type a value. Expect: Required goes.
  6. Press Save as new version. Expect: Version saved.
- Scratch folder (logs, evidence pictures, specs): `/var/folders/rs/11f8grj17lz9xdsd6dn_xzpw0000gn/T/sprinkles-261123-ghh`.

## Self-Check: PASSED

- Files: app/src/ui/Method.jsx, app/src/styles/notebook.css, app/src/ui/RecipePage.perStep.test.jsx, app/src/styles/notebook.test.js all present and changed.
- Commits `55dc975b` and `8ed16c3f` are on the branch.
