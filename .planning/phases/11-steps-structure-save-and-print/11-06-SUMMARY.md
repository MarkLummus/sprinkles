---
phase: 11-steps-structure-save-and-print
plan: 06
subsystem: ui
tags: [react, creation-editor, steps, targets, preview, webkit, board-conformance]

requires:
  - phase: 11-steps-structure-save-and-print
    provides: 11-01 walk and board engine; 11-02 creationSteps.js domain ops; 11-04 StepReading and the tag-row rules
provides:
  - CreationSteps.jsx, the creation editor's Instructions region (heading row, open steps, targets with a remove control, purpose and aside on demand, Preview step)
  - heading rows for Before you start, Ingredients and Instructions (Add note, Add ingredient, Add step) through RecipeSheet's beforeAct, ingredientsAct and creationMethod slots
  - 11-board-steps.mjs, pA1, pB1 and pE1 measured against sketch 014 in WebKit
affects: [11-07, 11-08, 11-11, 11-13]

actuals:
  tokens: 16200
  tasks: 3
  commits: 3

plan_head_before: 13490f29d91eaa0712e175046f079d3aa0b291ea
commits: 3
plan_head_after: a7db77474e6d1aa37ae544aa66518aa941d8ba95

tech-stack:
  added: []
  patterns:
    - "Editor-only step rules reach the open step through direct children (.notebook .mk-step > .method-step__body > .method-step__targets), so the Preview's reading step nested in the same .mk-step keeps the tag row's baseline alignment"
    - "A target's chip is an inline grid: the two fields and the remove stay its direct children, and a Required line sits under its own field by adjacent-sibling placement, so the DOM never changes while the maker types"
    - "Focus after an add or a remove is a focus request the page's effect acts on after the render, found by the step's data-step and the chip's place"

key-files:
  created:
    - app/src/ui/CreationSteps.jsx
    - app/src/ui/CreationSteps.test.jsx
    - .planning/phases/11-steps-structure-save-and-print/11-board-steps.mjs
  modified:
    - app/src/ui/CreationPage.jsx
    - app/src/ui/CreationFlow.test.jsx
    - app/src/ui/RecipeSheet.jsx
    - app/src/ui/RecipeSheet.test.jsx
    - app/src/ui/IngredientTable.jsx
    - app/src/ui/Method.jsx
    - app/src/ui/Method.test.jsx
    - app/src/styles/notebook.css

key-decisions:
  - "The target remove control sits inside its own span.target-chip after the value field (D-22; drawn on no board), so Add target and Preview step stay the targets line's direct .text-control children as the board draws them"
  - "A step with one target names its fields as the board does ('Step 1, target label'); a step with several names them by place ('Step 1, target 2 label')"
  - "Focus after a target's remove goes to the next target's label field, else the previous one's, else Add target"

patterns-established:
  - "A board panel whose element's box depends on rows a later plan builds (the step number is stretched to the step's height) drops that one box check, says why in the spec, and names the plan that restores it"

requirements-completed: [MAKE-07]

coverage:
  - id: C1
    description: "Add step on the Instructions heading adds a step at the beginning with focus in its lead-in; its lead-in and instruction are kept in the draft after the debounce and come back on Resume"
    requirement: "MAKE-07"
    verification:
      - kind: integration
        ref: "app/src/ui/CreationFlow.test.jsx 'Instructions while creating: the heading row and Add step' (StrictMode, in-memory repository)"
        status: pass
    human_judgment: false
  - id: C2
    description: "Targets with a remove control, Required under a one-sided target, purpose and aside on demand, and Preview step drawing the step in the printed treatment before the uses line"
    requirement: "MAKE-07"
    verification:
      - kind: unit
        ref: "app/src/ui/CreationSteps.test.jsx (13 cases) and CreationFlow.test.jsx focus cases"
        status: pass
    human_judgment: false
  - id: C3
    description: "The heading rows, the open step and the preview match sketch 014 pA1, pB1 and pE1 in WebKit at 1366 with a coarse pointer"
    requirement: "MAKE-07"
    verification:
      - kind: integration
        ref: "11-board-check.mjs 11-board-steps.mjs --selftest: PASS selftest pA1-before, pA1-ingredients, pA1-instructions, pB1, pE1; 86 PASS, 0 FAIL"
        status: pass
    human_judgment: false
  - id: C4
    description: "The recipe routes the walk covers are unchanged"
    requirement: "MAKE-07"
    verification:
      - kind: integration
        ref: "sh 11-walk-check.sh -> MATCH 94 snapshots"
        status: pass
    human_judgment: false
---

# Phase 11 Plan 06: Creation editor's Instructions steps Summary

**While creating, Add step on the Instructions heading adds open steps (lead-in, instruction, targets with a remove control, purpose and aside on demand, Preview step in the printed treatment), and Add note, Add ingredient and Add step stand on their heading rows, measured against sketch 014's pA1, pB1 and pE1 in WebKit.**

## Performance

- **Tasks:** 3 (Task 1 tracer, Tasks 2 and 3 auto)
- **Files:** 11 changed (3 created)
- **Duration:** about 15 minutes

## Accomplishments

- `CreationSteps.jsx`: the heading row (`div.mk-head-row` with `h2.region-name` and Add step), then one `li.method-step.mk-step[data-step]` per live step, numbered by `displayNumbers`. Each step's lead-in and instruction carry Required while empty (D-10). Targets: one `span.target-chip` per target holding the label field, the value field and the remove control; Add target and Preview step (Hide preview while open) stay the line's direct controls. Purpose and aside open on demand through the exported `useOnDemandField`. The Preview is `div.mk-preview` holding `StepReading` over the projected step, after the aside field and before the uses line. Every stored string is a React text child.
- `RecipeSheet` gains `beforeAct`, `ingredientsAct` and `creationMethod`; `beforeFoot` is gone (CreationPage was its only caller). `IngredientsHead` takes an `act` and, with none, returns today's two branches. `showsMethodRegion` keeps the section in creating mode.
- `CreationPage`: Add note and Add ingredient on their heading rows (Add ingredient absent while the picker is open), the step and target handlers as functional draft updates, and focus requests for a new step's lead-in, a new target's label and the field after a remove.
- `notebook.css`: the heading-row, open-step and preview rules, all under `.notebook`, all `var()` reads, no new token, no new `@media` (still five), nothing added to the coarse block.
- `11-board-steps.mjs`: pA1 (three anchored heading rows), pB1 and pE1.

## Task Commits

1. **Task 1 (tracer): Add step on the Instructions heading, and the add controls on their heading rows** - `d7e0a35a` (feat)
2. **Task 2: targets with a remove control, purpose and aside on demand, Preview step** - `069a4262` (feat)
3. **Task 3: pA1, pB1 and pE1 against sketch 014 in WebKit** - `a7db7477` (test)

Tracer gate: Task 1's `<verify>` is automated-only, so it was re-run end to end before Task 2 (the whole suite, 3978 passing). Tracer verified end-to-end, expanding.

## Verification

- Full suite: baseline in this worktree 124 files, 3970 tests passed; after this plan 125 files, 3994 tests passed (24 added: 13 in CreationSteps.test.jsx, 9 in CreationFlow.test.jsx, 1 in RecipeSheet.test.jsx, 1 in Method.test.jsx).
- Board: `11-board-check.mjs 11-board-steps.mjs --selftest` ends `86 PASS, 0 FAIL`, with `PASS selftest pA1-before`, `pA1-ingredients`, `pA1-instructions`, `pB1`, `pE1`.
- Walk: `11-walk-check.sh` ends `MATCH 94 snapshots`.
- Build: `npm --prefix app run build` to scratch succeeds.
- Acceptance greps: `mode === 'creating'` in Method.jsx 1; `export function useOnDemandField` 1; `showsMethodRegion({ mode, steps: methodSteps })` in RecipeSheet.jsx 1; `mk-head-act` in CreationPage.jsx 4; `beforeFoot` in CreationPage.jsx 0; `recipe-page--no-method` in RecipeSheet.test.jsx 1; `@media` in notebook.css 5; `StepReading` in CreationSteps.jsx 2; `remove target` 1; `useOnDemandField` 3; `mk-preview` in notebook.css 3; `.mk-step .method-step__targets` 0 and `.mk-step > .method-step__body > .method-step__targets` 10; `<button` in CreationSteps.jsx 0.

## Pins moved

- RecipeSheet.test.jsx: `renderCreating`'s `beforeFoot` argument became `beforeAct`; the creating case's `class="recipe-page recipe-page--no-method"` became `<article class="recipe-page">`; the bare `<h2 class="region-name">Before you start</h2>` assertion now reads the heading inside `div.mk-head-row` beside the given act; the 'draws no Instructions' case became 'draws the Instructions region and no step head or Sheet code' and expects `<section class="method-region" aria-label="Instructions">` (no step head, no Sheet code kept); one case added for the Ingredients act and the `creationMethod` slot.
- CreationFlow.test.jsx: three `.ingredient-table-region .mk-add` selectors became `.mk-head-act`; the Add note case reads `div.mk-head-row > button.text-control.mk-head-act` and no longer asserts no method region; one existing case that asserted `.method-region` null now asserts no `ol.method-steps`.
- Pins kept and passing: RecipePage.test.jsx:1167-1192 (the `showsMethodRegion` call, the section tag, `sheetClassName`, `{beforeRegionShown && (`), RecipeSheet.test.jsx's one `<IngredientsHead` tag with `onToggleShowChanges`, IngredientTable.test.jsx's plain call of `IngredientsHead`, notebook.test.js, cross-cutting.test.js, tabindex-scan.test.js.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] The remove control carries no `span.ingredient-table__remove-gap`**
- **Found during:** Task 2
- **Issue:** The plan draws the remove as that span holding a space, then a Button. Inside the chip, which is a flex or grid container, a whitespace-only span collapses to nothing, so it would be a zero-width empty element and the gap it is meant to make would not exist (the row-remove look works only on a name's inline line).
- **Fix:** The chip's remove is the Button alone, `Step n, remove target i`, with `margin-left: var(--gap-xs)` in notebook.css. Behaviour and accessible name are as planned.
- **Files modified:** app/src/ui/CreationSteps.jsx, app/src/styles/notebook.css
- **Commit:** 069a4262

**2. [Rule 3 - Blocking] The step number's box is not compared in pB1**
- **Found during:** Task 3
- **Issue:** Everything else in pB1 matched at the first run. The one FAIL was `.method-step__n` box: board 12 x 292.3, app 12 x 227.3. The number is a grid item stretched to the whole step's height, and the board's step holds a uses line with "change the ingredients" and an acts row that plans 11-07 and 11-08 build. Left, top and width match (0,50; 12 px).
- **Fix:** pB1 compares the number by font and text only, and the spec says why; the lead-in's box (same top) holds its level with the number. Plan 11-08, Task 3 should compare the number's box once the step holds those rows. This is a fixture difference, never patched into app CSS.
- **Files modified:** 11-board-steps.mjs
- **Commit:** a7db7477

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking). **Impact:** neither changes behaviour or the board result.

## Notes

- A target's Required stands under its own empty field through the chip's grid (adjacent-sibling placement), not through a wrapper, so typing a missing side never remounts a field. The grid is the build's own drawing, like the remove: no board draws a one-sided target.
- Phase 10's board specs (`10-board-editor.mjs`, `10-board-013-anchors.mjs`, `10-board-scales.mjs`, `10-board-picker.mjs`, `10-picker-current.mjs`, `10-crit-probe.mjs`, `10-device-steps.mjs`) select `.mk-add` for Add note and Add ingredient and declare `.method-region` absent against sketch 013's older boards. Those boards and these moved apart by design (013 decisions 29, 31 and 33, built here), so those specs would FAIL if re-run now. They are not part of the test suite and were left alone (outside this plan's files).
- Pressing Add ingredient's picker leaves the Ingredients heading bare (no `mk-head-row`) while the picker is open, as Phase 10's picker drew it; the row returns with Add ingredient once the picker closes.

## Known Stubs

None. The uses line reads `uses nothing yet` or the rows a step uses; "change the ingredients" and the acts row are plans 11-07 and 11-08's, named in the plan, not stubs.

## Threat Flags

None. No new endpoint, auth path, file access or schema surface. T-11-18: typed step text renders as text in the editor and the Preview (a test renders `<b>&amp;` and `<i>x</i>`); T-11-19: the draft reaches the editor only after the restore's `draftMatchesCreate`, and step keys are numbers found by array scan.

## Notes for Mark and Sid

The target remove control (D-22) is drawn on no board. It sits inside its target's chip, after the value field, and a one-sided target's Required stands under its empty field. Sid is told, no redraw. A step with several targets names their fields by place ("Step 1, target 2 label"). The two folded todos (Preview step; Add ingredient on the heading row) are built here; their files move to completed in plan 11-13.

## Next Phase Readiness

11-07 adds "change the ingredients" to the uses line and the table's step heads; the uses line here is `usesSentence` plus the two on-demand openers and already reads the step's `uses`. 11-08 adds each step's acts row and extends `11-board-steps.mjs` with the acts, both steps' targets lines and the step number's box. 11-11 adds the refused-press messages.

## Self-Check: PASSED

- Files found: app/src/ui/CreationSteps.jsx, app/src/ui/CreationSteps.test.jsx, 11-board-steps.mjs.
- Commits found: d7e0a35a, 069a4262, a7db7477.
