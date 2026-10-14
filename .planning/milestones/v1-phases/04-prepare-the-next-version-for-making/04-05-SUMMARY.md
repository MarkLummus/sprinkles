---
phase: 04-prepare-the-next-version-for-making
plan: 05
subsystem: ui
tags: [react, record-pen, reading, mark-one, at-draw, from-freezer, sketch-010, d6, d9, d10, d12, d14, webkit, probe]

requires:
  - phase: 04-01
    provides: "shared Button, Checkbox, Radio; a disabled Radio still carries tabIndex={0} and leaves the Tab order natively"
  - phase: 04-03
    provides: "draft atDraw and fromFreezer, stored churn.atDraw and tasting.fromFreezer, MARK_ONE_OPTIONS, and the domain rule that drops a pick stored beside a mark"
provides:
  - "MarkOneField and MARK_ONE_OFF_REASON: the two-option mark-one control (blank, picked with Clear, off with its reason)"
  - "The record pen in the approved order: churn row, At the machine, Ingredient notes, At draw, Exit consistency, Airiness, Tasting head, Tasted row, How did it turn out?, Melt test and Melt style, Next time, From freezer, the scales, Any problems?"
  - "The reading in the same order: the churn figures, the notes, the At draw word or Exit consistency and Airiness; inside the Tasting fold the conditions, the tasting note, the melt fields, then the From freezer word or the scales and problems; Next time outside the fold"
  - "handleChangeMarkOne and handleClearMarkOne in RecipePage; BatchRow props onChangeMarkOne and onClearMarkOne"
  - "04-pen-probe.mjs: board atdraw | fromfreezer | whole | reading, and check (1440 comparisons, WebKit and Chrome, 1366 and 393 coarse)"
affects: [04-06, 04-07, 04-10]

actuals:
  tokens: 23314
  tasks: 2
  commits: 2
plan_head_before: bb59053f52d0d16357915f9741eedd3fb356d03a
plan_head_after: 920cb592d2a4fd26928a299e6f18c3c3d72c9bdc
commits: 2

tech-stack:
  added: []
  patterns:
    - "A mark-one control is born on Radio and Button and mirrors Segmented: the click is on onClick with a no-op onChange, and Clear moves focus to the first option only on a keyboard activation (event.detail 0)"
    - "The off state is dashed border plus written reason plus disabled inputs, never colour alone (UX1-03); the shared Radio keeps tabIndex={0} and the browser drops a disabled input from the Tab order"
    - "Board conformance is measured: the probe drives the built app into each board state and compares captions in order, boxes (2 px) and heights (8 px) in WebKit and Chrome"

key-files:
  created:
    - app/src/ui/MarkOneField.jsx
    - app/src/ui/MarkOneField.test.jsx
    - .planning/phases/04-prepare-the-next-version-for-making/04-pen-probe.mjs
  modified:
    - app/src/ui/BatchRow.jsx
    - app/src/ui/BatchRow.test.jsx
    - app/src/ui/RecipePage.jsx
    - app/src/ui/RecipePage.recordTasting.test.jsx
    - app/src/styles/notebook.css

key-decisions:
  - "fromFreezer joins TASTING_BODY_FIELD_KEYS in RecipePage so a From freezer pick or Clear retires a pending Restore tasting, as every tasting-body edit does; atDraw is a churn field and does not"
  - "The Tasting head carries the board's mo-end class (a 12 px margin above it), which the plan's selector list omitted but pen-states.html draws; without it the head sat flush under Airiness"
  - "renderNextTime() is one function called in two places (inside the open Tasting section, and after the churn section when it is closed), so the field has one definition"
  - "With the Tasting section closed Next time keeps its place after the churn section; this is not drawn in the sketch and is flagged for Mark below"

patterns-established:
  - "New mark-one style groups are drawn with .mo-group and .mo-hint under .notebook-log; the group takes no hairline when it follows a note (the note's underline is the rule)"

requirements-completed: [PRINT-03, UX1-01, UX1-03]

coverage:
  - id: D1
    description: "The record pen carries At draw after Ingredient notes and From freezer after Next time, each a two-option radio group (Nothing to note, Not evaluated) headed by its name in the group-cue face"
    requirement: PRINT-03
    verification:
      - kind: unit
        ref: "app/src/ui/MarkOneField.test.jsx; app/src/ui/BatchRow.test.jsx#At draw in the pen; #the open Tasting section in the approved order, and From freezer"
        status: pass
      - kind: automated_ui
        ref: "node .planning/phases/04-prepare-the-next-version-for-making/04-pen-probe.mjs board atdraw (332 MATCH, 0 DIFF) and board fromfreezer (332 MATCH, 0 DIFF)"
        status: pass
    human_judgment: false
  - id: D2
    description: "A tapped pick shows Clear and hides the group's evaluation fields; Clear returns them blank; the other option moves the pick; tapping the picked option again does nothing"
    requirement: PRINT-03
    verification:
      - kind: integration
        ref: "app/src/ui/RecipePage.recordTasting.test.jsx#At draw through the real pen and the real save; #From freezer through the real pen and the real save"
        status: pass
    human_judgment: false
  - id: D3
    description: "A mark in a group keeps its field on screen with both options off (dashed, secondary text, disabled) and the words Clear marks below to choose.; clearing the last mark turns them back on, blank"
    requirement: UX1-03
    verification:
      - kind: unit
        ref: "app/src/ui/MarkOneField.test.jsx#off; app/src/ui/BatchRow.test.jsx#a scale mark / a core problem / a declared problem turns the options off"
        status: pass
      - kind: automated_ui
        ref: "04-pen-probe.mjs board whole (480 MATCH): fullmix and full carry the off state at both widths in both engines"
        status: pass
    human_judgment: false
  - id: D4
    description: "The pen order and the reading order follow CONTRACT section 7; a pick or Clear never moves the tapped control (only what is below it moves)"
    requirement: PRINT-03
    verification:
      - kind: automated_ui
        ref: "04-pen-probe.mjs board whole and board reading (296 MATCH): pen heights equal the boards exactly; labels, cell boxes and reading heights match r1 to r5"
        status: pass
    human_judgment: false
  - id: D5
    description: "A pick saved through the real save is stored as the word beside no mark and read back as one word; a pick can never sit beside a mark (pen disables at the control, domain drops at the store)"
    requirement: PRINT-03
    verification:
      - kind: integration
        ref: "app/src/ui/RecipePage.recordTasting.test.jsx (saved.churn.atDraw, saved.tasting.fromFreezer, the .mo-lead reading cell); app/src/ui/BatchRow.test.jsx#never reads a word beside the marks it stands in for"
        status: pass
    human_judgment: false
  - id: D6
    description: "On the iPad, a tap on Nothing to note leaves the button under the finger while the fields go, Clear brings them back, the disabled options are skipped by Tab; and Next time's place with the Tasting section closed looks right"
    requirement: UX1-03
    verification: []
    human_judgment: true
    rationale: "Probes ran WebKit and Chromium on the built app; the iPad itself (touch, Full Keyboard Access off, tap-then-Tab) is not driven, and Next time's closed-section place is not drawn in the sketch"

duration: ~15min
completed: 2026-10-11
status: complete
---

# Phase 4 Plan 05: At draw and From freezer in the pen and the reading Summary

**A two-option MarkOneField (Nothing to note, Not evaluated) heads At draw and From freezer in the record pen with Clear and a dashed, disabled, worded off state; the pen and the reading follow the approved sketch 010 order, and a probe drives the built app against all of pen-states, pen-whole and pen-reading with 1440 comparisons and no DIFF in WebKit and Chrome.**

## Performance

- **Duration:** ~15 min (04-04 closed 06:28Z; this plan closed 06:44Z)
- **Tasks:** 2 (1 tracer, 1 auto)
- **Files:** 8 touched across two commits (3 created), none outside the plan's list
- **Suite:** 69 files, 2163 passed, 0 failed (baseline 2121, 68 files). `npm --prefix app run build` exits 0.

## Accomplishments

- **Tracer (Task 1): At draw end to end.** `MarkOneField` renders the board's markup (`div.segmented-field.mo-group[data-mo]`, the caption in the group-cue face labelling the radiogroup by `aria-labelledby`, `label.segmented__option` per option with `.is-off` when off, `.mo-hint` for the reason). The pen moves Exit consistency and Airiness under the notes, behind At draw; a pick removes them; a mark in either turns the options off. The reading puts the notes straight after the churn figures, then either the At draw word in one full-width `mo-lead` cell or the two fields. `.mo-*` rules were transcribed into `notebook.css` with the boards' panel scope replaced by `.notebook-log`, every value through an existing token. Tracer gate: the `<verify>` was automated-only and `human_verify_mode` is end-of-phase, so it was re-run end to end (full suite, build, `board atdraw`, 332 MATCH) and passed before expansion.
- **Task 2: From freezer and the new orders.** The open Tasting section now runs Tasted row, How did it turn out?, Melt test and Melt style (moved up from the foot), Next time (moved in), From freezer, then the scales with Any problems? as the grid's children. A pick hides the whole grid; a scale mark, a core problem or a declared problem turns the options off. `TastingReading` reads Tempering and Tasting temperature, the tasting note, Melt test and Melt style (one row of four when no note is written), then the From freezer word or the scales and problems; Next time stays outside the fold.
- **The probe.** `04-pen-probe.mjs` drives the built app into every board state (the pen states by tapping, the five readings by recording through the real pen and save) and compares with the board panel in WebKit and Chrome at 1366 and 393 coarse. Pen heights are equal to the boards to the decimal (for example 2600 and 1433 at 1366 in WebKit, 2743.3 and 1509.1 at 393); no comparison needed the 8 px height tolerance.

## Task Commits

1. **Task 1 (tracer): At draw in the pen, saved and read back as its one word** - `d1cdb2a` (feat)
2. **Task 2: From freezer, the Tasting section's new order, and the reading's new order** - `920cb59` (feat)

Neither commit lists `app/src/styles/tokens.css` (`git log --stat -2` greps to 0); `tokens.test.js` passes in the full suite.

## Files Created/Modified

- `app/src/ui/MarkOneField.jsx` - the two-option mark-one control, built on Radio and Button
- `app/src/ui/MarkOneField.test.jsx` - jsdom: blank, picked, off, stray value under off, tabindex under off, keyboard and mouse Clear
- `app/src/ui/BatchRow.jsx` - the pen's order, both groups, the reading's order, `renderNextTime()`
- `app/src/ui/BatchRow.test.jsx` - churn-section order, At draw pen and reading tests, tasting-section order, From freezer states, the five reading cases built through `createBatch` from Olive Oil v1
- `app/src/ui/RecipePage.jsx` - `handleChangeMarkOne`, `handleClearMarkOne`, `fromFreezer` in the tasting-body set
- `app/src/ui/RecipePage.recordTasting.test.jsx` - the real pen and real save for both groups, including the reading
- `app/src/styles/notebook.css` - `.mo-group`, `.mo-end`, `.mo-hint`, `.segmented__option.is-off`, `.mo-readgroup`, `.mo-lead` (no new token, tokens.css untouched)
- `.planning/phases/04-prepare-the-next-version-for-making/04-pen-probe.mjs` - the probe

## Decisions Made

See key-decisions. The settled form of the disabled-radio / tabindex question (CONTRACT section 11, open item 2) is as 04-01 left it: the shared Radio carries `tabIndex={0}`, and `disabled` takes the input out of the Tab order natively; `MarkOneField.test.jsx` pins both facts.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] The Tasting head needed the board's `mo-end` class**
- **Found during:** Task 1 (reading the board's markup before building)
- **Issue:** `pen-states.html` draws the Tasting head as `div.mo-end.tasting-head`, with `.mo-end { margin-top: var(--gap-l) }`. The plan's CSS list names `.mo-group`, `.mo-hint`, `.is-off`, `.mo-readgroup` and `.mo-lead` but not `.mo-end`, and without it the head sat flush under Airiness or the At draw group.
- **Fix:** the head carries `mo-end tasting-head`; the rule is in `notebook.css`. The probe's blank and mixed pens then matched the boards to the pixel.
- **Files modified:** `app/src/ui/BatchRow.jsx`, `app/src/styles/notebook.css`, `app/src/ui/BatchRow.test.jsx`
- **Commit:** `d1cdb2a`

**2. [Rule 3 - Blocking] Existing pins followed the new order**
- **Found during:** Tasks 1 and 2
- **Issue:** `BatchRow.test.jsx` pinned the old order (Exit consistency and Airiness before the notes; the melt block at the foot; the Tasting head as a bare `tasting-head`; 6 and 39 radios; 3 segmented heads; the melt cells before the tasting note). These are the order changes the plan makes.
- **Fix:** each expectation moved to the approved order or count (8 and 43 radios, 5 heads); no expectation about values or presence was loosened.
- **Files modified:** `app/src/ui/BatchRow.test.jsx`
- **Commits:** `d1cdb2a`, `920cb59`

**3. [Plan variation] A real-save test for At draw lands in Task 1**
- The plan names the From freezer real-save test under Task 2, but the tracer's goal is "tapped, saved, read back", so Task 1 carries the equivalent At draw test in `RecipePage.recordTasting.test.jsx`.

**Total deviations:** 1 auto-fixed bug, 1 blocking (test pins), 1 plan variation. **Impact:** none on any specified behaviour.

## Issues Encountered

None. The commit guard reports `main` as protected; commits went on `main` as 04-01 to 04-04 did, with no config change. The dev server was not used; the probe reads the built `app/dist`.

## Known Stubs

None.

## Threat Flags

None. T-04-13 (pen never lets a pick sit beside a mark) is mitigated at both layers and tested at both: the control disables the options while the group holds a mark (`MarkOneField.test.jsx`, `BatchRow.test.jsx`), and 04-03's domain drops any pick stored beside a mark. T-04-14 (the reading shows the word or the fields, never both) is covered by the `never reads a word beside the marks it stands in for` test and the r1 to r5 probe cases. T-04-SC: no package installed.

## Deferred Human Verification

human_judgment: true (D6). Mark is away, so these are recorded for end-of-phase UAT, not blocking:

- iPad (serve with `npm --prefix app run build && npm --prefix app run preview -- --host`, never the dev server): open Correct on the 2 Aug batch and tap Nothing to note under At draw. Exit consistency and Airiness go and the button stays under the finger; Clear brings them back. Mark a scale: the From freezer options go dashed with "Clear marks below to choose."; Tab from Next time skips the disabled options (Full Keyboard Access stays off).
- Next time's place with the Tasting section closed: it stays after the churn section, as today. The sketch does not draw this case.

## Items for Mark's List

This executor has no `ArtifactData` tool, so these rows are for the orchestrator to add.

- **look**, `owner: mark`, `needs: hands`, slug `p4-05-ipad-mark-one`: "At draw and From freezer on the iPad. Open Correct on the 2 Aug batch, tap Nothing to note under At draw (the button should stay under your finger as the fields go), Clear it, then mark a scale and check the From freezer options go dashed with 'Clear marks below to choose.' and Tab skips them." Where: Olive Oil v1, Correct. Serve the build, not the dev server.
- **look**, `owner: mark`, `needs: answer`, slug `p4-05-next-time-closed-tasting`: "Next time with the Tasting section closed stays where it was, after Ingredient notes and the At draw group, because sketch 010 only draws Next time inside the open section. Fine as is, or do you want it drawn?" (A look row: approve or change.)
- **info**, `owner: claude`, no action: the pen-probe lives at `.planning/phases/04-prepare-the-next-version-for-making/04-pen-probe.mjs`; `check` re-measures every board after a build.

## Next Phase Readiness

04-06 and 04-07 can build on both stored words reading in the pen and the reading. The printed log's At draw and From freezer boxes now have their on-screen home (PRINT-03). The probe is the regression check for any later change to the pen.

## Self-Check: PASSED

- Created files exist: `MarkOneField.jsx`, `MarkOneField.test.jsx`, `04-pen-probe.mjs` (FOUND)
- Commits `d1cdb2a`, `920cb59` are ancestors of HEAD; `git rev-list --count bb59053..HEAD` is 2 before this summary
- `npm --prefix app test`: 69 files, 2163 passed, 0 failed; `npm --prefix app run build` exits 0
- `node .planning/phases/04-prepare-the-next-version-for-making/04-pen-probe.mjs check`: 1440 MATCH, 0 DIFF (WebKit and Chrome, 1366 and 393 coarse)
- Acceptance: MarkOneField.jsx imports Radio and Button and holds no raw button or radio tag (the scan in the suite enforces it); `MARK_ONE_OFF_REASON` is "Clear marks below to choose."; no commit lists tokens.css
- Post-commit deletion check on each commit: no deletions
