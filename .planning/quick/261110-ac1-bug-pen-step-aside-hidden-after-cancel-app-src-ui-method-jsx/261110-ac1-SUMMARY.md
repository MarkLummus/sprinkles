---
phase: quick-261110-ac1
plan: 01
quick_id: 261110-ac1
status: complete
commits: 1
plan_head_before: 7910eb48f8bb924a6cc694e967bafb5cceffa266
plan_head_after: c275b1ad
requirements:
  - bug-pen-step-aside-hidden-after-cancel
key-files:
  modified:
    - app/src/ui/Method.jsx
    - app/src/ui/RecipePage.perStep.test.jsx
---

# Quick 261110-ac1: version-pen step reopens with its purpose and aside after Cancel

useOnDemandField gains `seedOpen(open)` (sets open state, moves no focus); StepPenBody's Edit this step calls it for purpose and aside from the draft's text before `onOpen`.

## RED (against base 7910eb48 Method.jsx)

All earlier assertions (field closed, opener present, Cancel, reopen) passed; the final ones failed:
- Step 2 aside: `AssertionError: expected null not to be null` (RecipePage.perStep.test.jsx:1146)
- Step 1 purpose: `AssertionError: expected null not to be null` (:1156)
- Step 3 mirror: `AssertionError: expected <textarea …(3)></textarea> to be null` (:1173)

## GREEN

All 3 pass. Targeted run (RecipePage.perStep CreationSteps CreationFlow CreationStructure CreationSetup Method): 8 files, 394 tests pass. Guard suites (CreationSteps CreationFlow CreationStructure CreationSetup Method.recording): 268 before, 268 after. Full suite: before 132 files / 4321 tests, after 132 files / 4324 tests.

Gates: exactly 2 code lines removed in Method.jsx (hook return line, `onClick={onOpen}`); `seedOpen` appears in Method.jsx alone among non-test .jsx; CreationSteps.jsx and its test untouched; only the two named files changed.

## Commit

- c275b1ad: fix: a step's purpose or aside that holds text shows again when the step reopens after Cancel (bug-pen-step-aside-hidden-after-cancel)

## Deviations from Plan

None. The Step 0 baseline was measured on the 7910eb48 base (4321 tests) rather than the plan's planning-time counts, as instructed.

## Mirror changed by design

Per the plan's discretion (confirmed by Mark): the seed is read in both directions. A step with no aside, where text was typed then cancelled, now reopens behind "Add aside" instead of drawing an empty aside field. Pinned by the third test.

## Notes for the orchestrator

Close Mark's List row bug-pen-step-aside-hidden-after-cancel after the merge (the executor has no ArtifactData). No build was made and no server started, so app/dist is as it was. The change is engine-independent React state and the jsdom test walks Mark's steps through the real page. If a device check is wanted anyway:
1. Open Olive Oil v1 and press Next version.
2. On Step 2 press Edit this step.
3. Clear the aside and press Tab. Expect: the aside closes behind Add aside.
4. Press the step's Cancel.
5. Press Edit this step again. Expect: the aside field shows its words and there is no Add aside.

## Self-Check: PASSED

Commit c275b1ad exists; both files modified; no stubs.
