---
phase: quick-261114-gxe
plan: 01
quick_id: 261114-gxe
subsystem: version-pen
tags: [focus, a11y, method, pen]
status: complete
requirements-completed:
  - bug-edit-this-step-focus-on-cancel
key-files:
  modified:
    - app/src/ui/Method.jsx
    - app/src/ui/RecipePage.perStep.test.jsx
  created:
    - .planning/quick/261114-gxe-edit-this-step-lands-focus-on-the-step-s/261114-gxe-probe.mjs
commits: 1
plan_head_before: 0d7fa2e8ac0248ac9d3337aa6802935164a93502
plan_head_after: 82a2ff193fe46a3442f8f77c724360399e328c5f
actuals:
  tokens: 4500
  tasks: 2
  commits: 1
completed: 2026-11-14
---

# Quick 261114-gxe: Edit this step lands focus in the step's lead-in

StepPenBody now focuses the open step's lead-in textarea when the step opens (a `leadInRef` plus an effect on `[isOpen]`), so Edit this step no longer leaves focus on the node that React reuses as the step's Cancel.

## Base and suite counts

- BASE code commit 5637d45d; executor HEAD at start 0d7fa2e8 (plan commit, no app change).
- Step 0 full suite: 132 files, 4327 tests passed. After: 132 files, 4330 tests passed (+3).
- `grep -c "setOpenStepN(stepN)" app/src/ui/Method.jsx` = 1 (guard held).

## Cause as reproduced

The built base app, in WebKit and Chrome, fine and coarse: after Edit this step (W2 keyboard, and W1 pointer), `document.activeElement` is the BUTTON reading Cancel. Second Return then pressed that Cancel, closed the step, and focus returned to "Step 2, edit this step". The cause in the plan (unkeyed branches reuse the Edit button node as Cancel) matched.

## Sketch re-check

Read: `grep -i focus` over 013 README/CONTRACT and 014 README/CONTRACT; `grep -i "edit this step"` over 011 README and DESIGN.md.
- 011 README line 107 (decision 5): steps edit one at a time via "edit this step", Done keeps, Cancel restores; no focus landing named.
- 013 README line 81 (decision 33) and 014 README line 66 / CONTRACT line 20: Add step "focus goes to the new step's lead-in" (the nearest drawn rule).
- DESIGN.md line 568: edit this step is an underlined word acting on what is on the page; no landing rule.
No rule names a different landing spot, so the lead-in stands.

## RED and GREEN

RED (describe "Edit this step puts focus in the step's lead-in (bug-edit-this-step-focus-on-cancel)"): 2 failed, 1 passed.
- Test A (keyboard) failed: activeElement was the reused `<button>`, not the lead-in textarea.
- Test B (pointer) failed: activeElement was a different textarea (Version name, autoFocus), not Step 2's lead-in.
- Test C (Cancel guard) passed.
GREEN after the 8 added lines in Method.jsx: 3 passed; Method, CreationSteps, CreationFlow, RecipePage.perStep suites 266/266.

## Browser walk (scratch builds of base and fix, 08-walk-server, 1366x1024)

Same readings in WebKit and Chrome, fine and coarse (28 PASS, 0 FAIL, both engines launched):

| Walk | Base | After |
| ---- | ---- | ----- |
| W1 pointer click/tap on Step 1 Edit this step | BUTTON "Cancel" | TEXTAREA "Step 1, lead-in" |
| W2 keyboard Return on Step 2 Edit this step | BUTTON "Cancel" | TEXTAREA "Step 2, lead-in" |
| W2 second Return | step closes, focus on "Step 2, edit this step" | step stays open, lead-in value unchanged, focus stays in lead-in |
| W3 Cancel (with typed " probe") | BUTTON "Step 1, edit this step"; closed lead restored | identical |
| W3 Done | BODY | BODY (identical) |

Deviation from plan expectation: at base the pointer path (W1) also landed on Cancel in real WebKit and Chrome (the plan's jsdom probe expected BODY for a pointer press with no focus on the button; Playwright's click and tap focus the button). Not a change to the fix. W1 scrollY was the same at base and after (about 1579 fine, 1849 coarse in WebKit; 1576 and 1845 in Chrome).

## Scope gates

- `git diff --numstat` for Method.jsx: 8 added, 0 deleted.
- CreationSteps.jsx, CreationPage.jsx and app/src/styles: no diff.
- Commit touches only Method.jsx, RecipePage.perStep.test.jsx and the probe.

## Commit

82a2ff19 `fix(261114-gxe): Edit this step puts focus in the step's lead-in` (one commit; commits measured 1 from the ledger).

## Deviations from Plan

None - plan executed exactly as written (the W1 base reading above is an observation, not a change). Commit trailers used the orchestrator's co-author line instead of the plan's.

## Notes for the orchestrator

- Close `bug-edit-this-step-focus-on-cancel` with reply: "Edit this step now lands focus in the step's lead-in; a second Return no longer cancels; verified in WebKit and Chrome, fine and coarse."
- The dist build is safe to deploy: no store, data or migration change.
- One iPad step for chat, not a row: on the version pen, Tab to "Edit this step" on step 1, press Return, expect the caret in the step's lead-in, and expect a second Return to leave the step open.
- Adjacent finding, out of scope and not fixed: Done on an open step drops focus to the page body, in both the base and the fix.
- Known stubs: none. Threat flags: none.

## Self-Check: PASSED

- Files exist: Method.jsx, RecipePage.perStep.test.jsx, 261114-gxe-probe.mjs.
- Commit 82a2ff19 is on main (HEAD).
