---
phase: 10-the-creation-editor-without-save
plan: 09
subsystem: ui
tags: [react, creation-editor, scales, problems, css, webkit, board-conformance]

requires:
  - phase: 10-the-creation-editor-without-save
    provides: 10-01 board engine; 10-05 add/remove focus rule; 10-08 CreationSetup with the Style region
provides:
  - addScale, updateScale, removeScale, scaleStopsLine, addProblem, updateProblem, removeProblem (domain/creation.js)
  - Segmented's optional name and clearable props
  - the Scales and Problems regions in CreationSetup, after Style
  - the cue, core, pair, card, head and stops rules in notebook.css
  - 10-board-scales.mjs (eight cropped panels with declared absences and the Scales-to-Problems frame)
  - scales-and-problems.html with one Kind radio group per card (fixture correction), recorded in the sketch README
affects: [10-10]

actuals:
  tokens: 15100
  tasks: 3
  commits: 3

plan_head_before: 6442728b6488d1d93c537d010afde6106404850e
commits: 3
plan_head_after: 82d47ad26154462c6c61c25c701b24c7de4ca760

tech-stack:
  added: []
  patterns:
    - "A focus landing is a request left by the handler and consumed by an effect after the render that drew its target, found inside its own region (section ref), never by a document-wide Name query"
    - "Two cards that repeat a label are named groups (div.mk-card role group, aria-label 'Scale n' / 'Problem n') and give their repeated radio group its own name"

key-files:
  created:
    - .planning/phases/10-the-creation-editor-without-save/10-board-scales.mjs
  modified:
    - app/src/domain/creation.js
    - app/src/domain/creation.test.js
    - app/src/ui/CreationSetup.jsx
    - app/src/ui/CreationSetup.test.jsx
    - app/src/ui/CreationFlow.test.jsx
    - app/src/ui/Segmented.jsx
    - app/src/ui/Segmented.test.jsx
    - app/src/styles/notebook.css
    - .planning/canvas-generators/p10.py
    - .planning/sketches/013-creation-editor/scales-and-problems.html
    - .planning/sketches/013-creation-editor/README.md

key-decisions:
  - "A new scale's key is mintScaleKey(freshId()) minted once in the Add scale click handler; addScale refuses an empty or repeated key and a third scale"
  - "Problems are plain strings with no key of their own: a card's identity is its place, so its React key is the index"
  - "One focus effect with a request string ('new-scale', 'add-scale', 'new-problem', 'add-problem') serves both regions; new-* focuses the last card's Name inside the region, add-* the region's .mk-add"

requirements-completed: [TASTE-01, TASTE-02]

duration: 40min
completed: 2026-10-20
status: complete
---

# Phase 10 Plan 09: Scales and Problems in the log column Summary

**The creation editor's log column now reads Style, Scales, Problems: 0 to 2 scales of the recipe's own (name, two end words, a never-pre-picked kind, the stops line) and 0 to 2 problems, kept with the draft, matching sketch 013 in WebKit at 1366 and 393 (1367 PASS, 0 FAIL with the Style spec).**

## Accomplishments

- `domain/creation.js`: `addScale` (empty create scale, `group: 'declared'`, refuses an empty or repeated key and a third), `updateScale` (name, low, high or kind only; a kind outside '' and `SCALE_KINDS` is a RangeError; the key never moves), `removeScale`, `scaleStopsLine` (goldilocks joins `stopWordsFor` with ' · ', magnitude is 'low to high', null until both ends trimmed and the kind are set, typed words verbatim), `addProblem`, `updateProblem`, `removeProblem`. A draft after each still passes `draftMatchesCreate`.
- `Segmented.jsx`: optional `name` (radio group name and caption id stem) and `clearable` (default true). Every existing caller and test is unchanged.
- `CreationSetup.jsx`: the Scales and Problems regions after Style. Cues from the catalog ('Hardness, Scoopability, Smoothness, Sweetness' joined by ', '; the four core problems joined by ' · '). Cards are `div.mk-card` with `role="group"` and aria-label 'Scale n' / 'Problem n'. Required shows under each blank (trimmed) Name, Low end, High end. Kind is the joined group 'Right in the middle' / 'Low to high' (goldilocks / magnitude) with name `kind-<scale key>` and no Clear. Add scale and Add problem go at two. An add focuses the new card's Name and a remove focuses the region's add control, both in an effect after the render that drew the target, found inside the region's own section.
- `notebook.css`: `.mk-cue`, `.mk-core`, `.mk-pair`, `.mk-card`, `.mk-cue + .mk-card`, `.mk-card__head`, `.mk-stops`, all under `.notebook`, all tokens. `@media` count stays 6.
- `10-board-scales.mjs`: sA1 to sD1 and sA2 to sD2, anchor `.mk-region[aria-label="Scales"] .batch-row__head`, scope `.notebook-log`, frame Scales heading to bottom of Problems, twelve selectors each either measured or declared absent by state.
- Fixture correction: `p10.py` `segmented()` takes an optional name and `scale_card` passes `segment-kind-<n>`; `scales-and-problems.html` regenerated with its approved style block kept byte for byte and recorded in the sketch README.

## Task Commits

1. **Task 1 (tracer): add a scale, give it its words and a kind, and it comes back on Resume** - `2b581142`
2. **Task 2: problems, the two-of-each limit, Required and remove** - `5c548e66`
3. **Task 3: the Scales and Problems regions match sketch 013 and the scales board holds one Kind group per card** - `82d47ad2`

## Verification Run

- Task 1 verify (creation, Segmented, CreationFlow, tabindex-scan, seed-data-scan; CreationSetup added): 183 passed. Red seen for the scale functions before they were written. Tracer gate: green before Task 2 began.
- Task 2 verify: 188 passed. (The problem functions and their tests were written together; the red run for them was not separately observed.)
- Full `npm --prefix app test`: 120 files, 3728 tests, all green. `src/styles`: 378 passed.
- Fixture verify script: `SAME` (approved style block byte-identical to d14adb94's; markup differs only in the Kind radios' names).
- Board run over `10-board-scales.mjs`: `414 PASS, 0 FAIL`; with `10-board-style.mjs` (rerun, the column grew): `1367 PASS, 0 FAIL`. With `--selftest` on the scales spec: `PASS selftest` for all eight panels (a run with every font at 1 px fails). sC1 and sC2 `.segmented__option input:checked` count: board 2, app 2.
- Absent PASS lines per panel: sA1 and sA2 eight each, sB1 and sB2 one, sC1 and sC2 two, sD1 and sD2 two. Each of the eight panels prints one `<id> frame` PASS.
- `10-walk-check.sh`: `MATCH 94 snapshots`.
- Acceptance greps: the four scale exports 4; `mintScaleKey(freshId())` 1; `clearable` 3; the three problem exports 3; `This recipe only` 2; `Add problem` 1; `role="group"` 2; `@media` 6; `^\.notebook \.mk-card {` 1; `^\.notebook \.mk-stops {` 1; `segment-kind-%d` in p10.py 1; the frame's `Problems"]` selector 1.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] The worktree had no app/node_modules**
- Untracked, gitignored symlink to the main checkout's. Nothing installed.

**2. [Rule 1 - Existing tests broke on the new regions] Region counts**
- Two CreationFlow cases and one CreationSetup case asserted exactly one `.mk-region`. They now read the three regions in order (Style, Scales, Problems).

### Notes

- **The plan's `grep -c 'name="segment-kind-1-sC1"'` prints 1, not 2.** `grep -c` counts lines, and the two radios of a card sit on one line of the board. Counted as occurrences (`grep -o ... | wc -l`) the figures are the plan's: `segment-kind-sC1` 0 (was 4), `segment-kind-1-sC1` 2, `segment-kind-2-sC1` 2. The `git diff --stat d14adb94 -- .planning/sketches/013-creation-editor/` check names scales-and-problems.html only before the README edit; README.md is the other file, as the plan allows.
- **The board comparison passed on the first run**, so no FAIL needed classifying as a build departure or a fixture/engine difference, and no value was patched into app CSS.
- **Sandbox:** compound git commands and heredocs were refused in this worktree; files were written with Write/Edit and the git-calling Python check ran as a script file.
- **Canvas not republished.** The executor has no Artifact tool. The canvas board P10_Scales still serves the shared Kind radio name; the README records that a later `snapshot013.py` run from the canvas would bring it back until the canvas is republished from this `p10.py`.

## Authentication Gates

None.

## Known Stubs

None.

## Deferred Human Verification

- Open the built `/notebook/new` in Safari or Playwright WebKit at 1366 and at 393 beside `.planning/sketches/013-creation-editor/scales-and-problems.html`: nothing defined, one scale and one problem, two and two, just added. Expected: each state matches its board panel side by side (cues, cards, Kind cells, stops line, Required, add controls gone at two). The measurement covers boxes, fonts, colours and borders, not every visual detail. (Mark's List: no row written; the orchestrator owns those writes.)

## Threat Flags

None. Scale keys are minted with the 'scale-' prefix in the click handler (T-10-23); words render only as React text and field values (tests with `<b>` words); the fixture correction is generated from `p10.py` and proved by the SAME check (T-10-30).

## Self-Check: PASSED

- Created: 10-board-scales.mjs, this file.
- Commits `2b581142`, `5c548e66` and `82d47ad2` are ancestors of HEAD.
