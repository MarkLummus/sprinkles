---
phase: quick-261122-tqn
plan: 01
subsystem: ui
tags: [react, version-pen, validation, lineage]
status: complete
requires: []
provides:
  - "The version pen refuses a live step's blank lead-in, blank instruction or one-sided target on both Save buttons, with the creation editor's word Required"
  - "REQUIRED, stepRequiredFields and blockedSaveStepField in lineage.js, read by both editors"
affects: [261122-tqo (Done and Remove this step focus, also Method.jsx)]
actuals:
  tokens: 7800
  tasks: 2
  commits: 2
plan_head_before: 8374320f5e844fb2276c748f246b70d2eada6725
plan_head_after: cad72d3f
key-files:
  modified:
    - app/src/domain/lineage.js
    - app/src/domain/penDraft.js
    - app/src/domain/creationSave.js
    - app/src/domain/lineage.test.js
    - app/src/domain/penDraft.test.js
    - app/src/ui/RecipeSheet.jsx
    - app/src/ui/Method.jsx
    - app/src/ui/RecipePage.perStep.test.jsx
key-decisions:
  - "Task 3 (Required under a target's blank side, the two-row chip) is HELD and not built; the refusal and focus for targets are built"
requirements-completed: [bug-pen-saves-blank-lead-in]
duration: 15min
completed: 2026-11-22
---

# Phase quick-261122-tqn Plan 01: Version pen refuses a blank step field Summary

The version pen now refuses a step with a blank lead-in, a blank instruction or a target with one side blank, on Save as new version and Save over this version, with the creation editor's word Required drawn after the lead-in or instruction. Task 1 and Task 2 are built. Task 3 is held (see below).

Commits (the summary commit follows them as the last commit):
- 970cc10e test: the version pen refuses a step's blank lead-in, blank instruction and one-sided target
- cad72d3f fix: the version pen refuses a blank lead-in, blank instruction or one-sided target, as the creation editor does

## What was built

- lineage.js exports `REQUIRED`, `stepRequiredFields(step)` (lead-in, instruction, then a target with one side blank, in that order; both-blank targets not listed; trimmed text) and `blockedSaveStepField`. `blockedSaveMessage` returns `REQUIRED` for the first blank step field after the version line and the rows; removed steps are skipped.
- penDraft.js `penSaveBlock` returns `{ message: 'Required', target: { kind: 'stepLeadIn' | 'stepInstruction' | 'stepTarget', ... } }` when no row blocks.
- creationSave.js reads `REQUIRED` and `stepRequiredFields` from lineage.js. Its output is unchanged: `creationSave.test.js` has no diff and passes.
- RecipeSheet.jsx passes a step block and message to Method. Method opens the step a block names (closing any other open step with its edits kept); StepPenBody marks (aria-invalid), describes (aria-describedby `step-field-error`), focuses and draws Required after a refused lead-in or instruction. Focus also reaches a refused target field through a Map of refs.

## Tests

Red (S/red.txt, before the fix): 13 of the 18 new tests failed at their named assertion. The domain cases failed with `expected null to deeply equal { message: 'Required', ... }`; the UI cases U1-U4, U7, U8 failed with `expected "vi.fn()" to not be called at all, but actually been called 1 times`; U5 failed with `expected null not to be null`. D5, D6, the two D7 cases that name the version line and a row, and U6 passed as bounds and guards.

Green: all 18 pass. Suite before: 136 files, 4538 tests. Suite after: 136 files, 4556 tests (4538 + 18; the plan's "+15" counted D7 as one test, it is four here).

## Omitted from Task 1 (belong to Task 3, held)

- U7 and U8 (a target's blank value, a target's blank label) assert only: the save is refused, nothing is stored, focus is in the blank field. Left out of them: the visible `Required` text, `aria-invalid` on the field, the `aria-describedby` wiring, `Required` being the field's next sibling inside its `.target-chip`, and the other side having no `aria-invalid`. None is committed as a failing or skipped test.
- No test for the two-row chip layout, and no Playwright measurement (`measure.mjs` was not written).

## Deviations from Plan

**1. [Rule 1 - Bug] lineage.test.js fixture steps carried no words**
- **Found during:** Task 2 full-suite run.
- **Issue:** the case "does not block on a blank Step 2 line while step 2 is removed and Step 3 holds a number" passes a method of bare `{ n, removed }` steps. The new rule correctly reads a step with no lead-in or instruction as blank, so the case got `Required` instead of null.
- **Fix:** the fixture's `stepTwo` helper now spreads a `words` object (lead-in and instruction) into both steps. The case's own intent is unchanged. This edits one existing test file the plan did not list.
- **File:** app/src/domain/lineage.test.js. **Commit:** cad72d3f.

**2. D7 split into four tests** so each ordering claim fails on its own line; counts differ from the plan's 15 (18 here).

Otherwise Tasks 1 and 2 as written. The Task 2 gates passed: `creationSave.test.js` no diff; `stepRequiredFields` and `blockedSaveStepField` each exported once; no `const REQUIRED = 'Required'` left in creationSave.js; `'step-field-error'` once in Method.jsx. Checks the plan put in Task 3 that do not depend on the chip: full suite green; scratch build to `${TMPDIR}/sprinkles-261122-tqn/dist` succeeded (not app/dist). No dev or preview server was started, port 4173 untouched, and nothing was measured in WebKit or Chromium (so nothing here is device-verified).

## Claude's discretion (from the plan, for Mark)

- "The same checks" is read as Phase 11 D-10's three: blank lead-in, blank instruction, a target with one side blank. Text is read trimmed.
- The pen keeps its one-at-a-time order: Version name, an amount, then the first step in method order (lead-in, instruction, targets). The creation editor shows every refusal at once.
- A step block announces nothing (no VERSION_BLOCKED_STATUS); focus moves to the field, described by Required.
- A refused Save opens the closed step it names and closes any other open step with its edits kept.
- The pen's step fields get the refusal only, not the creation editor's quiet "Required" before any Save.

## For the orchestrator

- **Task 3 is not built, and why.** It draws the word Required under a target's blank side, which turns the pen's one-line target chip into two rows. No board draws that layout, so it waits for a design decision from Mark. `app/src/styles/notebook.css` and the chip's markup are untouched (the only chip change is invisible ref callbacks on the two textareas).
- **What a maker sees today when a one-sided target refuses the save.** Nothing is stored. The step that holds the target opens (if it was closed, with any other open step closed, edits kept). Focus moves into the blank side's textarea (the label or the value field of that chip). No message is visible and none is announced: no Required line, no `aria-invalid`, no `aria-describedby` on the field, no status text (a step block sends no VERSION_BLOCKED_STATUS). A screen reader hears focus land in the field named "Step N, target M, label" or "value", with nothing saying why. A sighted maker sees the cursor in an empty field and nothing else changed. This is the gap Task 3 closes; it is a refusal without words until Mark decides the layout.
- **The plan's other undrawn choices, as built:** a refused Save opens the closed step it names; a blank instruction is refused too, not only the lead-in; one message at a time, in page order (Version name, amount, then steps).
- **Mark's List.** Do not close row bug-pen-saves-blank-lead-in as done: the lead-in and instruction halves are built, the target half refuses without a visible word. The executor has no ArtifactData.
- **Two same-cause cases not fixed** (planning probe): a target with both sides blank, and a removed step with a blank field. The pen stores both, and a backup holding them refuses to import. They are for Mark.
- app/dist is as it was; the only build went to the scratch directory. All results above are jsdom and Vitest, not device-verified.

## Self-Check: PASSED

- Commits 970cc10e and cad72d3f exist on branch worktree-agent-a9b5fabd7b076623e.
- Full suite green at 4556 tests; scratch build succeeded.
