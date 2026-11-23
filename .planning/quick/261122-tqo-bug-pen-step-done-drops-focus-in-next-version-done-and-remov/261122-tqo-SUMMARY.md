---
phase: quick-261122-tqo
plan: 01
subsystem: ui
tags: [react, version-pen, focus, a11y]
status: complete
requires: [261122-tqn]
provides:
  - "Done on an open pen step returns focus to that step's Edit this step; Remove this step on an open step lands focus on the step's own Done"
affects: []
actuals:
  tokens: 2600
  tasks: 2
  commits: 2
plan_head_before: d09e1fab5441cd5689011cbd0854cdb642ed8f78
plan_head_after: be6c238bbc3a182fed1bf21aad7f42697827dbb0
key-files:
  modified:
    - app/src/ui/Method.jsx
    - app/src/ui/RecipePage.perStep.test.jsx
key-decisions:
  - "Remove this step lands on the step's own Done, not Cancel (Cancel would put the whole step back on a second Return)"
  - "Test D rewritten against tqn as built: Done is never refused, so the guard is a refused Save after Done"
requirements-completed: [bug-pen-step-done-drops-focus]
completed: 2026-11-22
---

# Phase quick-261122-tqo Plan 01: Pen step Done and Remove this step keep focus Summary

Done on an open step in Next version now lands focus on that step's Edit this step, and Remove this step keeps the step open with focus on its Done; before, both dropped focus to the page body.

`plan_head_after` is the fix commit; the summary commit follows it, so `commits: 2` counts the red and green commits (measured `git rev-list --count d09e1fab..be6c238b` = 2).

## Base and counts

- BASE (worktree starting HEAD): d09e1fab5441cd5689011cbd0854cdb642ed8f78. Precondition met (261122-tqn's commits are in the history).
- Before the first change: 136 files, 4559 tests passing (the plan's 4538 is the pre-tqn count; tqn added 18 and the batch another 3).
- After: 136 files, 4563 tests passing (+4).

## What tqn's Done path looked like, and how Test D was written

261122-tqn put its refusal at Save (Method's block target, `penSaveBlock`), not at a step's Done. `handleDoneStep` is still just `setOpenStepN(null)`, so a step's Done is never refused. The plan's Test D (refused Done leaves no request behind) therefore has nothing to test and is dropped as written.

In its place Test D guards the real interaction with tqn: edit Step 3's lead-in to blank, press Done (step closes), press Save as new version. The save is refused, Step 3 opens, and focus is in "Step 3, lead-in", not on "Step 3, edit this step". This passes before and after the fix (a pass-before guard, like the plan's D). A refused Save's focus move (tqn's effect on `blocked.attempt`) and Done's request do not fight: the request is written only by Done, taken once by the closing effect, and tqn's focus effect runs when the step opens.

## Red and green

Red (commit 9888834e): `Tests 3 failed | 1 passed | 52 skipped`. A, B and C failed with `expected <body>… to be <button>`: after Done by keyboard, Done by pointer, and Remove this step then Done, `document.activeElement` was the body. D passed.

Green (commit be6c238b): the describe passes 4 of 4; RecipePage.perStep, Method.preview, Method, CreationSteps and tabindex-scan: 5 files, 225 tests passing (the Cancel focus test included); full suite 136 files, 4563 tests; scratch build to `${TMPDIR}/sprinkles-tqo/dist` exit 0 (app/dist untouched).

## What was built (Method.jsx, 34 added, 4 changed)

- Method: `editFocusRef`, `takeEditFocus(stepN)` (one-time, claimed by the step it names), `handleDoneStep(stepN)` writes the request directly before `setOpenStepN(null)`; StepPenBody gets `takeEditFocus` (default `() => false`) at the call site.
- StepPenBody: `editButtonRef` on the closed step's Edit this step, `doneButtonRef` on Done; a new effect on `[isOpen]` focuses Edit this step when the close was this step's Done; `handleRemoveThisStep` toggles the step then focuses Done.
- No key added, no top-level child of either branch moved, Cancel's handler, the closed step's Remove/Restore, the creation editor, useOnDemandField, styles untouched.

## Scope gates

- `editButtonRef` 3, `doneButtonRef` 3, `takeEditFocus` 4 (comment lines excluded); `onClick={() => onTogglePenStepRemoved(step.n)}` 1 (the closed step's Remove/Restore only).
- Method.jsx diff deletes 4 existing lines (signature, onDone call site, Remove this step onClick, Done Button line).
- `git diff --name-only d09e1fab..HEAD -- app`: exactly Method.jsx and RecipePage.perStep.test.jsx. Final `git status` before the green commit listed only Method.jsx as modified.

## Deviations from Plan

**1. [Plan instruction] Test D replaced.** As above: the instruction allowed leaving D out when Done is never refused; a different guard was written instead because a lingering-request failure is still possible after Done. Not a Rule 1-3 fix.

Otherwise the plan ran as written. Nothing was run in a browser or on a device; every result is jsdom and Vitest, not device-verified. No dev or preview server was started and port 4173 was not touched.

## For the orchestrator

- Close Mark's List row `bug-pen-step-done-drops-focus` after the merge: `status: "done"`, `resolvedAt` from `date -u +%Y-%m-%dT%H:%M:%S.000Z`, `if_version` from a read, reply e.g. "Done now returns focus to Edit this step, and Remove this step lands on the step's Done; jsdom only, not seen on the iPad."
- Tell Mark the landing chosen for Remove this step: the step's own Done. Cancel was rejected because a second Return would put the whole step back. It is a one-line change in `handleRemoveThisStep`.
- Deploy after this item: safe (focus change only, no store shape or DB_VERSION change).
- One iPad step for chat, not a row: in Next version, Tab to a step's Edit this step, press Return, then Tab to Done and press Return. Expect the focus ring on that step's Edit this step.

## Self-Check: PASSED

- Commits 9888834e and be6c238b exist on branch worktree-agent-ac8abb50dd6750de9.
- Full suite green at 4563 tests, 136 files; scratch build succeeded.
