---
phase: 10-the-creation-editor-without-save
plan: 10
subsystem: testing
tags: [webkit, board-conformance, device-check, playwright, creation-editor]

requires:
  - phase: 10-the-creation-editor-without-save
    provides: 10-01 board engine; 10-03/05/07/08/09/12 board specs and the built creation editor; 10-11 kept-draft notices
provides:
  - extraWidths panel option in the board engine (sideways-overflow check at widths the boards do not draw)
  - the editor spec completed for the final build (worked draft, deviation words, side region, log column regions, page heights, overflow widths)
  - 10-device-steps.mjs, the iPad row's steps walked in WebKit on the final build
  - Mark's List row check-creation-editor-ipad (written by the orchestrator)
affects: [phase 10 verification, /gsd-verify-work]

actuals:
  tokens: 6000
  tasks: 3
  commits: 2

plan_head_before: f2cc7aae74a4b199fcc22873aff7204070332f91
commits: 2
plan_head_after: e79805b5f93f7495752c7e2831de37ae7784578e

tech-stack:
  added: []
  patterns:
    - "A device check's steps are walked in WebKit first: each waits for its ready state, activates once, and a second activation needed is a FAIL (no retry helper)"
    - "A full page compares document heights; a cropped panel compares its anchor's height on both sides"

key-files:
  created:
    - .planning/phases/10-the-creation-editor-without-save/10-device-steps.mjs
  modified:
    - .planning/phases/10-the-creation-editor-without-save/10-board-check.mjs
    - .planning/phases/10-the-creation-editor-without-save/10-board-editor.mjs
    - .planning/phases/10-the-creation-editor-without-save/10-board-notebook.mjs

key-decisions:
  - "eC1 and eC2 keep their .notebook-body__sheet anchor, so their pageHeight is the Sheet column's height on both sides (1480), never the crop's 1528 frame against the document"
  - "extraWidths loads the panel's app state at height 1024 and checks only scrollWidth against innerWidth"

requirements-completed: [MAKE-04, MAKE-05, MAKE-06, MAKE-08, MAKE-09, MAKE-11, TASTE-01, TASTE-02]

coverage:
  - id: D1
    description: "Every sketch 013 board panel matches the final build in WebKit at its widths, with evidence pairs"
    requirement: "MAKE-06"
    verification:
      - kind: automated_ui
        ref: "10-board-check.mjs over the five 013 specs: 2660 PASS, 0 FAIL"
        status: pass
    human_judgment: false
  - id: D2
    description: "No sideways overflow at 393, 744, 768, 1024 on /notebook and /notebook/new"
    requirement: "MAKE-06"
    verification:
      - kind: automated_ui
        ref: "extraWidths PASS lines for eA1, eB1, nA1"
        status: pass
    human_judgment: false
  - id: D3
    description: "The walked routes are unchanged (strict walk)"
    requirement: "MAKE-11"
    verification:
      - kind: automated_ui
        ref: "sh 10-walk-check.sh: MATCH 94 snapshots"
        status: pass
    human_judgment: false
  - id: D4
    description: "The iPad row's steps are reachable on first activation in WebKit"
    requirement: "MAKE-11"
    verification:
      - kind: automated_ui
        ref: "node 10-device-steps.mjs: 16 PASS, 0 FAIL"
        status: pass
    human_judgment: false
  - id: D5
    description: "A creation started on the iPad survives a closed tab, Resume brings it back, Import is refused, Cancel leaves nothing"
    requirement: "MAKE-11"
    verification: []
    human_judgment: true
    rationale: "The iPad is WebKit at 1366 with a coarse pointer and a real keyboard; only Mark's device confirms it (Mark's List row check-creation-editor-ipad)"

duration: 45min
completed: 2026-10-20
status: complete
---

# Phase 10 Plan 10: The final proof Summary

**The final build matches every sketch 013 board in WebKit (2660 PASS, 0 FAIL, 44 evidence pairs), holds the walked routes (MATCH 94), has no sideways overflow in the undrawn widths, and the iPad check's sixteen steps pass on their first activation, so one check row now waits on Mark.**

## Two records, kept apart

**Automated verification passed**

- `npm --prefix app test`: 120 files, 3728 tests, all green.
- Board run over the five 013 specs (notebook, editor, picker, style, scales) on a scratch build: `2660 PASS, 0 FAIL`, 44 panels, 44 evidence pairs, each of the eight scales panels printing its `<id> frame` PASS.
- `10-picker-current.mjs`: `14 PASS, 0 FAIL` (seven at 1366, seven at 393).
- `10-walk-check.sh`: `MATCH 94 snapshots`.
- `10-device-steps.mjs` in WebKit at 1366, coarse pointer: `16 PASS, 0 FAIL` (listed below).

**iPad verification pending**

- Mark's List row `check-creation-editor-ipad`, read back after the orchestrator's write: id `check-creation-editor-ipad`, status `open`, version `1`, owner mark, needs hands, kind check, phase "10", addedBy claude, createdAt and updatedAt 2026-10-20T16:32:28.000Z. No other row was added by this phase and there is no iPhone row (D-13).
- The boards' numbers and the WebKit walk are unverified on the device until Mark answers the row.

## Accomplishments

- `10-board-check.mjs`: the `extraWidths` panel option. For each width it loads the panel's app state (coarse pointer, height 1024; `newAppContext` takes an optional height) and checks only that `scrollWidth` is not above `innerWidth`, one PASS or FAIL per width.
- `10-board-editor.mjs`, completed for the final build: `WORKED_DRAFT` (Philadelphia with its four bands as strings, serveTempC '-14', the scale Creaminess thin to rich goldilocks, the problem Bitter) used by eB1, eC1 and eC2; `.graduated-rule__deviation` [count, text] on eB1, eC1, eC2 (six each, real words such as "1.4% below 8%") and declared absent on eA1; `pageHeight` on all four panels (eA1 board 1248.9 and app 1249, eB1 1825 and 1825, eC1 and eC2 anchor `.notebook-body__sheet` 1480 and 1480); eB1 gains `.side-region` [box], `.notebook-log .mk-region` [count, box] (three) and `.notebook-log .region-name` [count, text] (three); eA1 and eB1 gain `extraWidths` [393, 744, 768, 1024].
- `10-board-notebook.mjs`: nA1 gains `extraWidths` [744, 768, 1024]. All overflow PASS.
- `10-device-steps.mjs`: the iPad row's steps in one WebKit context at 1366 by 1024 with hasTouch; every request not to 127.0.0.1 aborted; stores dumped first and last.

### The sixteen PASS lines of 10-device-steps.mjs

1. the Notebook opens and the recipes, versions and batches are read first (8 recipes, 19 versions, 12 batches)
2. New recipe opens the entry
3. a name, Start, and /notebook/new opens
4. a description
5. Add note and a note
6. Add ingredient, Whole milk, 3.5% fat, 600 g
7. Add ingredient, Sucrose, 150 g
8. the Style menu, Philadelphia: -14 and the four bands fill in
9. Add scale: Creaminess, thin, rich, Right in the middle
10. Add problem: Bitter
11. Import is refused while the creation is kept: no file chooser, a notice says why
12. past the 250 ms debounce the creation is written, including Bitter, and the tab closes
13. /notebook opens again: the draft row reads Vanilla with Resume and no New recipe
14. Resume: every field is as left, and the notice reads "Draft kept. Cancel discards it."
15. Cancel: the Notebook says "Draft discarded.", offers New recipe, and lists no draft row
16. the recipes, versions and batches stores are as before and the drafts store is empty

The no-file-chooser check is not vacuous: with no draft kept, the same tap on Import fires `filechooser` (probed separately). The import refusal's wording, for chat: "Cancel the new recipe draft before importing."

## Task Commits

1. **Task 1 (tracer): the final build matches every board side by side, and the walked routes are unchanged** - `778e83e9`
2. **Task 2: walk the iPad check's steps in WebKit on the final build** - `e79805b5`
3. **Task 3 (checkpoint:human-action): the orchestrator puts the iPad check on Mark's List** - no commit; row written by the orchestrator and read back (above)

## Evidence pairs

Directory (scratch, not committed): `/private/tmp/claude-501/-Users-mark-Documents-projects-sprinkles/b7de6298-99b5-48cf-93e0-2fa4d8081f52/scratchpad/10-evidence` — 44 board and app PNG pairs and README.md (89 files): notebook 9, editor 4 (eA1, eB1, eC1, eC2), picker 8, style 15, scales 8 (each pictured as its framed band). Run logs: `.../scratchpad/all-run.txt` and `.../scratchpad/editor-run.txt` in the session scratchpad.

## Acceptance greps

- `pageHeight: true` in 10-board-editor.mjs: 4 (eC1 and eC2 still name the anchor `.notebook-body__sheet`).
- `extraWidths` in 10-board-check.mjs: 3 lines.
- `graduated-rule__deviation` in 10-board-editor.mjs: 3; the run prints "PASS ... eA1 .graduated-rule__deviation absent".
- `@media` count: notebook.css 6, shell.css 5 (no new block).
- 10-device-steps.mjs: `filechooser` 2, `127.0.0.1` 2, `first activation missed` 2.
- `beforeunload` under app/src outside tests: none. `from 'idb'` under app/src: only app/src/store/db.js.
- `10-walk-check.sh` ends `MATCH 94 snapshots`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] The worktree had no app/node_modules**
- Untracked, gitignored symlink to the main checkout's. Nothing installed.

### Notes

- **No FAIL needed classifying.** The first board run after the spec changes passed, so no build departure and no fixture or engine difference appeared, and no spec or engine defect of the absence or framing kind needed fixing. No file under app/ changed and no tolerance was loosened. The spec and engine edits made were those the plan prescribes (extraWidths, the worked draft, deviation words, heights, regions).
- **Scratch build location.** The sandbox refused shell variables in npm and git commands, so the check build went to `/var/folders/rs/11f8grj17lz9xdsd6dn_xzpw0000gn/T/sprinkles-10/dist-10` by literal path (the same `$TMPDIR/sprinkles-10/dist-10` the plan names). Nothing was built into app/dist. Evidence pictures went to the session scratch directory named above, as the project notes direct, not `$TMPDIR/sprinkles-10/evidence-10`.
- **The walk reads the stores directly** and checks that 'Bitter' is in the drafts store after the 300 ms wait, before closing the tab, so the closed-tab step does not depend on a pagehide flush.

**Total deviations:** 1 auto-fixed (Rule 3). **Impact:** none on scope.

## Authentication Gates

None.

## Known Stubs

None.

## Deferred Human Verification

- Mark's List row `check-creation-editor-ipad` (status open, version 1): on the iPad (Safari, landscape), from the production build served with `npm --prefix app run build && npm --prefix app run preview -- --host`, follow the row's ten steps. Expected: the creation survives the closed tab, Resume brings it back as left, Import is refused while it is kept, and Cancel leaves the Notebook with the same recipes as before.

## Threat Flags

None. Builds went to a scratch directory only (T-10-25); the row's first step is the production build and `preview --host` (T-10-24); row text was written by the orchestrator with fresh timestamps and no answer was acted on (T-10-26).

## Self-Check: PASSED

- Created: 10-device-steps.mjs and this file exist.
- Commits `778e83e9` and `e79805b5` are ancestors of HEAD.
