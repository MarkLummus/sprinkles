---
phase: 12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo
plan: 11
subsystem: ui
tags: [react, version-pen, preview-step, jsdom, playwright-webkit, sketch-016]

requires:
  - phase: 12-04
    provides: the record pen and the board engine usage (12-board-pen.mjs shape)
  - phase: 12-05
    provides: the Gate 2 desk flow the board panels replay
  - phase: 12-08
    provides: the creation editor's own Preview step and preview block that the pen now mirrors
provides:
  - "Preview step on the version pen's open step (CONTRACT section 7, section 11 number 6)"
  - "12-board-penpreview.mjs: pen-pv-pen, pen-pv-pen-on, pen-pv-pen-tab1, pen-pv-pen-tab2"
  - "Method.preview.test.jsx: the first jsdom file for the pen's open step"
affects: [12-14 (runs 12-board-penpreview.mjs in 12-check.sh round two), 12-10 (shares the pen's Cancel focus pin)]

actuals:
  tokens: 21000
  tasks: 2
  commits: 2
plan_head_before: 875ef703710c1a01136029f37b0f69a2a407a7c4
plan_head_after: a8d145362e1c9ea0b8890d7565b293f80b11ba66

tech-stack:
  added: []
  patterns:
    - "A new child in one unkeyed branch of StepPenBody needs an empty child in the other, so Cancel's reused button node keeps focus"

key-files:
  created:
    - app/src/ui/Method.preview.test.jsx
    - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-penpreview.mjs
  modified:
    - app/src/ui/Method.jsx
    - app/src/ui/Method.test.jsx

key-decisions:
  - "A removed step opened in the pen gets no Preview step and no preview (review item 13); if Sid draws one later it is a /gsd-quick change to the one condition"
  - "StepPenBody takes number = null, passed as the margin's own rule (current frame's number, else none), so no removed step's preview could carry a baseline number"

requirements-completed: [PROOF-02]

duration: 24min
completed: 2026-11-22
status: complete
---

# Phase 12 Plan 11: Preview step in the version pen Summary

**Preview step on the version pen's open step: one control line before the uses line, a preview block that reads the typed step, put away when Done or Cancel closes the step, held to pen-preview-step.html in WebKit (104 PASS, 0 FAIL, self-tests PASS).**

## Performance

- **Duration:** 24 min
- **Started:** 2026-11-22T21:30Z
- **Completed:** 2026-11-22T21:54Z
- **Tasks:** 2
- **Files modified:** 4 (2 created, 2 modified)

## Accomplishments

- The pen's open step (Next version, Edit this step) draws `p.method-step__targets` holding Preview step alone, aria-label "Step n, Preview step", directly before its uses line: under the lead-in and instruction when no purpose or aside is written, after them when they are. Pressed, it reads Hide preview and `div.mk-preview` (role group, "Step n, preview") stands directly under it, holding the cue "Preview" and `StepReading` over the pen's draft step (lead-in, instruction, targets, purpose, aside).
- `previewing` is put away by an effect when `isOpen` turns false, so Done and Cancel close the preview with the step (they do not remount StepPenBody). A removed step opened in the pen draws neither the line nor the block.
- The pen's open step still has no Add target and no reorder control; Tab runs instruction, purpose and aside fields, Preview step, Change ingredients.
- Held against pen-preview-step.html panels pv-pen and pv-pen-on in Playwright WebKit with a coarse pointer at 1366: every box, text, font and aria-label within 1 px; `.mk-preview` declared absent on pv-pen; the 1 px font self-test fails the run as it should. The Tab order is measured in WebKit: after one Tab from the instruction `Step 1, Preview step` is `document.activeElement`, after two `Step 1, change ingredients` is.
- Every result is Playwright WebKit or jsdom, device-unverified.

## Task Commits

1. **Task 1 (tracer): Preview step on the pen's open step, pressed and shut, held against the board in WebKit** - `7d41961c` (feat)
2. **Task 2: pressing Preview step, Done and Cancel in jsdom, and the Tab order measured in WebKit** - `a8d14536` (test)

The tracer's `<verify>` (Method.test.jsx and tabindex-scan, a scratch build, the board run with `--selftest`) passed end to end before Task 2, so expansion followed.

## Files Created/Modified

- `app/src/ui/Method.jsx` - StepPenBody: `number` prop, `previewing` state and its reset effect, the Preview step line and the preview block on a live step, the StepReading import, one empty child in the closed form (see Deviations); Method passes `number` by the margin's rule.
- `app/src/ui/Method.test.jsx` - the open-step button pins and the source pin, and three static cases (line placement, placement after a written purpose and aside, an open removed step).
- `app/src/ui/Method.preview.test.jsx` (new, jsdom) - 12 cases that press the controls.
- `.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-penpreview.mjs` (new) - board spec for the four panels.

### Pins changed in existing test files

| File | Line | Was | Now |
| --- | --- | --- | --- |
| `app/src/ui/Method.test.jsx` | 1486 | open step buttons `toHaveLength(5)` | `toHaveLength(6)` (Preview step joined) |
| `app/src/ui/Method.test.jsx` | 1498 | open step with Remove this step `toHaveLength(6)` | `toHaveLength(7)` |
| `app/src/ui/Method.test.jsx` | 1521 | `<Button` tags in Method.jsx `toHaveLength(9)` | `toHaveLength(10)` |

Test names at those lines say Preview step joined (bug-p11-pen-step-no-preview). The new static cases are at 1303 onward. No test file outside this plan's `files_modified` was changed; `RecipePage.perStep.test.jsx` has no diff against the plan base.

## Decisions Made

- A removed step in the pen gets no Preview step (review item 13): it will not read in the version being made, and its closed form already shows it struck and marked removed. No board draws a removed step open, so this adds no words a board has not drawn.
- `number` follows the margin's rule (`marginInfo.frame === 'current' ? marginInfo.number : null`), so Method.test.jsx's `renderOpenStepPenBody` needed no new prop.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Cancel on an open step stopped landing focus on Edit this step**
- **Found during:** Task 2 (whole-suite run)
- **Issue:** `RecipePage.perStep.test.jsx` "still lands focus on Edit this step after Cancel on that step" failed. StepPenBody's open and closed forms are unkeyed on purpose, so React pairs their children by position and reuses the closed form's Edit this step button node as the open form's Cancel (bug-edit-this-step-focus-on-cancel). The Preview step block added one child to the open form and moved Done/Cancel off the closed form's matching position, so the node was no longer reused and focus fell to the body.
- **Fix:** an empty child (`{null}`) with a comment in the closed form before its Edit this step line, so both forms keep the same child count before that line.
- **Files modified:** `app/src/ui/Method.jsx`
- **Verification:** the perStep test passes again; a new case in `Method.preview.test.jsx` pins it and was shown to fail with the empty child removed; the board run is unchanged (104 PASS, 0 FAIL) because an empty child draws nothing.
- **Committed in:** `a8d14536`

---

**Total deviations:** 1 auto-fixed (1 bug).
**Impact on plan:** None on scope. The fix is inside Method.jsx, a file the plan owns; no test file of another plan was touched.

## Issues Encountered

- A plan assumption worth knowing: the plan said the Tab check belongs to Task 2 and the static counts to Task 1; both held as written. One of my own jsdom selectors (`[aria-label*="move"]`) over-matched the "remove" control and was narrowed to "move up" and "move down" before commit.

## Known Stubs

None.

## Threat Flags

None. T-12-35 (typed text rendered as markup): StepReading draws React text children only; no `dangerouslySetInnerHTML` was added, and the board run reads the preview's text back. T-12-36 (stale preview after Cancel, or a removed step previewed): `previewing` resets when `isOpen` turns false and a removed step draws no line; `Method.preview.test.jsx` presses Done, Cancel and a removed step (and a mutation that removes the reset fails two cases).

## Verification

- `cd app && npx vitest run`: 135 files, 4455 tests, all passing (baseline 134 files, 4440 tests; +1 file, +15 tests).
- Board run on a scratch build (`PROBE_DIST=<scratch>/dist-11 node 12-board-check.mjs 12-board-penpreview.mjs --selftest`): `104 PASS, 0 FAIL`; four lines `PASS selftest pen-pv-pen`, `pen-pv-pen-on`, `pen-pv-pen-tab1`, `pen-pv-pen-tab2`; focus PASS on tab1 (Preview step) and tab2 (Change ingredients).
- `sh .planning/phases/11-steps-structure-save-and-print/11-walk-check.sh`: `MATCH 94 snapshots` (plus NEW scenarios from later plans).
- Task 1 and 2 acceptance greps: Hide preview in Method.jsx 2 (>=1); mk-preview 2 (>=2); `<StepReading` 1; `toHaveLength(10)` 1; `Add target` in Method.jsx 0; jsdom docblock 1; Hide preview in the jsdom file 8; `pv-pen-tab` 2.
- Built only into a scratch `--outDir`; `app/dist` was not written; no Vite process was started.

## Left to the orchestrator

- Close Mark's List row `bug-p11-pen-step-no-preview` (executors have no ArtifactData; I did not read or write the list): read it for its version, read the clock with `date -u +%Y-%m-%dT%H:%M:%S.000Z` just before the write, status done, resolvedAt from that read, a one-line reply naming commits `7d41961c` and `a8d14536` and the board run's 104 PASS.
- Deploy: no store shape, DB_VERSION or store-file-version change; main is safe to deploy once this wave is merged.
- STATE.md and ROADMAP.md were not touched (parallel worktree).

## Next Phase Readiness

12-14 can run `12-board-penpreview.mjs` in `12-check.sh` round two as planned. Device proof of the Tab order on the iPad stays with PROOF-02's device check (D-11).

---
*Phase: 12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo*
*Completed: 2026-11-22*

## Self-Check: PASSED

- FOUND: app/src/ui/Method.preview.test.jsx
- FOUND: .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-penpreview.mjs
- FOUND commit 7d41961c, FOUND commit a8d14536 (ancestors of HEAD)
