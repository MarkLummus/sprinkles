---
phase: 11-steps-structure-save-and-print
plan: 07
subsystem: ui
tags: [react, creation-editor, uses-checklist, step-heads, split-lines, row-order, walk-baseline]

requires:
  - phase: 11-steps-structure-save-and-print
    provides: 11-02 creationSteps.js ops (toggleStepUses, setLineGrams, rowLines, normalizeAllocation); 11-06 CreationSteps.jsx; 11-14 the record script's patch guard, ordercheck and ordertest
provides:
  - "CreationSteps: the uses line in the step's own order with change the ingredients / done, and the Uses checklist over every table row"
  - "IngredientTable: the creating table under step heads, Not in a step yet on every screen surface, split rows as one line per step keyed rowId:step (data-line) with the portion line"
  - "creationRows contract { gramsByLine, focusLine, onChangeGrams(rowId, step, value), onBlurGrams(rowId, step), onRemoveRow(rowId) }; setRowGrams removed"
  - "groupPortionsByStep and the pen's uses line in each step's own order; 11-walk-order.patch; 11-walk-before.json re-recorded at BASE plus that order"
affects: [11-08, 11-09, 11-10, 11-11, 11-13]

actuals:
  tokens: 19000
  tasks: 3
  commits: 3

plan_head_before: 59a88bfcce746d6b62a3d3b87e10a5c1f49bccc9
commits: 3
plan_head_after: 4d3b44f712d6e250c2a7dd91e1cca57b1388c0b4

tech-stack:
  added: []
  patterns:
    - "A creating line is keyed `${rowId}:${step}` (the projection's step: a live key or UNPLACED_STEP 0) in gramsByLine, the focus registry, the leftUnreadable set, the message id and tr[data-line]"
    - "The uses line and checklist are direct children of the step body (no wrapper), so the preview's nextElementSibling stays the uses line; Escape is handled on the line and the fieldset, gated on the checklist being open"
    - "The walk baseline is BASE plus a two-region patch: groupPortionsByStep's sort and the pen's usesNames line, the only code the record script lets through"

key-files:
  created:
    - .planning/phases/11-steps-structure-save-and-print/11-walk-order.patch
  modified:
    - app/src/ui/CreationSteps.jsx
    - app/src/ui/CreationSteps.test.jsx
    - app/src/ui/IngredientTable.jsx
    - app/src/ui/IngredientTable.test.jsx
    - app/src/ui/IngredientTable.creating.test.jsx
    - app/src/ui/CreationPage.jsx
    - app/src/ui/CreationFlow.test.jsx
    - app/src/ui/RecipeSheet.test.jsx
    - app/src/ui/Method.jsx
    - app/src/ui/RecipePage.perStep.test.jsx
    - app/src/domain/creation.js
    - app/src/domain/creation.test.js
    - app/src/domain/creationSteps.test.js
    - .planning/phases/11-steps-structure-save-and-print/11-walk-before.json

key-decisions:
  - "A row with several lines shows its remove control on its first line only (portionIndex 0): remove deletes the whole row, so one control per row says so; plan 11-08's acts line replaces it"
  - "The split line's note is the build's formatPortionLine, '400 g of 600.0 g · 58.0% in all' (formatGrams prints one decimal); the plan and CONTRACT quote '600 g'"
  - "The uses line and the checklist take Escape on the paragraph and the fieldset instead of a wrapper div, because the board draws them as direct children of the step body"

requirements-completed: [MAKE-07]

coverage:
  - id: E1
    description: "Each step's Uses checklist lists every table row; ticking a row makes the step use it (joining the end of the step's uses) and the uses line names the step's rows in that order, ending in change the ingredients / done"
    requirement: "MAKE-07"
    verification:
      - kind: unit
        ref: "app/src/ui/CreationSteps.test.jsx 'the Uses checklist' (3 cases) and 'names the rows the step uses on the uses line, in the step's own order'"
        status: pass
      - kind: integration
        ref: "app/src/ui/CreationFlow.test.jsx 'with two rows and one step the table reads Not in a step yet over both; ticking Whole milk draws Step 1 over it'"
        status: pass
    human_judgment: false
  - id: E2
    description: "As soon as a step exists the creation table reads under step heads with Not in a step yet last; with no step it stays flat; the word is the same on the reading page, the pen and the print; a lone unplaced group is headed only when the version has a live step and the lines sit at UNPLACED_STEP"
    requirement: "MAKE-07"
    verification:
      - kind: unit
        ref: "app/src/ui/IngredientTable.test.jsx 'D-09: a lone unplaced group is headed when the version has a live step' (4 cases) and the 261002-wdn cases A to C2"
        status: pass
      - kind: unit
        ref: "app/src/ui/IngredientTable.creating.test.jsx 'creating: step heads' (the table mounted alone, no currentStepNumbers)"
        status: pass
    human_judgment: false
  - id: E3
    description: "A row ticked in two steps reads one line per step with its own grams field, label, message on blur and portion line; the Balance follows the sum; unticking folds the grams and leaves a one-line row"
    requirement: "MAKE-07"
    verification:
      - kind: unit
        ref: "app/src/ui/IngredientTable.creating.test.jsx 'a row in two steps reads one line per step' (4 cases)"
        status: pass
      - kind: integration
        ref: "app/src/ui/CreationFlow.test.jsx 'a row ticked into two steps reads a line per step, the Balance follows their sum, and unticking one folds the grams back'"
        status: pass
    human_judgment: false
  - id: E4
    description: "A restored kept draft whose uses and portions disagree opens with the amounts folded and is rewritten consistent after the debounce"
    requirement: "MAKE-07"
    verification:
      - kind: integration
        ref: "app/src/ui/CreationFlow.test.jsx 'a restored kept draft whose uses and portions disagree opens with the amounts folded'"
        status: pass
    human_judgment: false
  - id: E5
    description: "Each step orders its own rows on the creation editor, the reading page, both pens, Show changes and the print; Olive Oil v1's steps 2 and 3 read their seeded uses lists"
    requirement: "MAKE-07"
    verification:
      - kind: unit
        ref: "app/src/ui/IngredientTable.test.jsx 'groupPortionsByStep reads each step in its own uses order' (7 cases); RecipePage.perStep.test.jsx pen uses line; PrintSheetPages.test.jsx unchanged and green"
        status: pass
    human_judgment: false
  - id: E6
    description: "The walk's baseline is BASE plus exactly the order: the real patch plus one unrelated line is refused before the re-record; ordercheck passes with every store, method hash and other leaf equal; ordertest refuses a changed line, store leaf, method hash and field value; the walk ends MATCH 94 snapshots"
    requirement: "MAKE-07"
    verification:
      - kind: integration
        ref: "Task 3 verify: refusal log 'FAIL patch: IngredientTable.jsx changes outside groupPortionsByStep', six PASS ordertest, 'PASS ordercheck 94 of 94 snapshots reordered', ten PASS selftest, 'MATCH 94 snapshots'"
        status: pass
    human_judgment: false
  - id: E7
    description: "The uses lines, the checklist, the step heads and the split lines match sketch 014's pC1 and pD1 in WebKit"
    requirement: "MAKE-07"
    verification: []
    human_judgment: true
    rationale: "Measured against the boards by plan 11-08, Task 3, once each row's acts line, which sets the rows' heights, exists (moved there with the row-order rework)"
---

# Phase 11 Plan 07: The Uses checklist, step heads and split lines, and each step's row order Summary

**While creating, each step's Uses checklist puts rows under that step's head with "Not in a step yet" for the rest, a row ticked in two steps splits into one grams line per step, and every surface that groups rows by step reads a step's rows in that step's own uses order, with the walk's baseline re-recorded at BASE plus exactly that order.**

## Performance

- **Duration:** about 17 minutes (2026-10-27T02:07Z to 02:24Z)
- **Tasks:** 3 (Task 1 tracer, Tasks 2 and 3 auto)
- **Files:** 14 changed (1 created), plus `11-walk-before.json` re-recorded

## Accomplishments

- `CreationSteps.jsx`: the uses line reads "uses nothing yet" or the names in the step's own uses order, then "change the ingredients" (reads "done" while open), then "· add a purpose" and "· add an aside" as sketch 014 draws them. The checklist is `fieldset.method-step__uses` (aria-label `Step n, uses`, legend Uses) over every row of the table in draft order; Escape on the line or the checklist closes it and returns focus to the toggle.
- `IngredientTable.jsx`: step heads draw as soon as a step exists; the lone unplaced group is headed when the version has a live step and every line sits at `UNPLACED_STEP` (D-09), while every 261002-wdn case stays headless; creating mode reads `currentStepNumbers ?? displayNumbers(steps)`; "Unallocated" is gone from the code and the old comments.
- Creating lines: `tr[data-line="rowId:step"]`, grams field named `Name, grams` or `Name, grams, portion n`, its own message on its own blur, and the portion line on a split row. Balance follows the sum through the projection; unticking folds the grams (plan 11-02's op) and leaves a one-line row with no portion line.
- `CreationPage.jsx`: `toggleStepUses` and `setLineGrams` through functional updates; the seed and every restore go through `normalizeAllocation`.
- `groupPortionsByStep` sorts every numbered and removed group stably by the row's index in that step's uses (a row the uses does not name after the named ones, the unplaced group in row order), and the pen's `usesNames` line follows the same order.
- `11-walk-order.patch` is BASE cf64aa70 plus those two regions only; `11-walk-before.json` is re-recorded from BASE plus the patch (12 scenarios, 94 snapshots, hashes only).

## Task Commits

1. **Task 1 (tracer): ticking a row in a step's Uses puts it under that step's head, the rest under Not in a step yet** - `dc824061` (feat)
2. **Task 2: a row in two steps reads one line per step with its own grams field and portion line** - `798e60da` (feat)
3. **Task 3: each step orders its own rows on every surface, walk baseline re-recorded at BASE with that order** - `4d3b44f7` (feat)

Tracer gate: Task 1's `<verify>` is automated-only, so under `end-of-phase` it was re-run end to end (the five named files, then the whole suite, 4005 passing) before Task 2. Tracer verified end-to-end, expanding.

## Verification

- Full suite: baseline in this worktree 125 files, 3994 tests passed; after this plan 125 files, 4017 tests passed (23 added).
- Before Task 3's change: `sh 11-walk-check.sh` ended `MATCH 94 snapshots` against plan 11-01's baseline (Tasks 1 and 2 left every walked route as BASE drew it).
- Task 3 verify, one run, exit 0: the record script refused `order-plus-outside.patch` (the real patch plus one comment line at the top of IngredientTable.jsx) with `FAIL patch: IngredientTable.jsx changes outside groupPortionsByStep`, exit 1, and `refused-order-outside.json` was not written; then `PASS ordertest same / reorder / changed-line / store / method / field`; `PASS ordercheck 94 of 94 snapshots reordered; stores, method and every other leaf equal`; the baseline re-recorded (`RECORDED ... 94 snapshots`); ten `PASS selftest` lines; and the final line `MATCH 94 snapshots`. No output line started `FAIL` or `DIFF` except the expected refusal, which is written to its own log.
- Acceptance greps: patch `diff --git` count 2 (one per file); baseline `12 94 hashes`; `removed[0]`/`removed[1]` in RecipePage.perStep.test.jsx 0; `git log --grep='(11-07)'` over the two walk scripts and over `app/src/data/` prints nothing; Task 1 and Task 2 grep criteria all met (`Not in a step yet` in IngredientTable.jsx 5, `'Unallocated'` outside comments 0, `>Unallocated<` in its test 0, `method-step__uses-item` 1, `toggleStepUses(` 1, `normalizeAllocation(` 2, `gramsByLine` 2 and `gramsByRow` 0 in IngredientTable.jsx, `data-line` 1, `export function setRowGrams` 0).
- `tabindex-scan.test.js` passes: every new button and checkbox renders through Button.jsx or Checkbox.jsx.

## Pins moved

- IngredientTable.test.jsx: the presence assertions on `>Unallocated<` (the trailing-head case, the 261002-wdn D guard in reading and the pen) now read `>Not in a step yet<`; the absence assertions (removed step in reading, 261002-wdn A, B, C, C2, and the E guard) now assert the absence of both words. Seven cases added for the order and four for D-09.
- RecipeSheet.test.jsx: `creationRowsOf` became `{ gramsByLine: new Map([['row-a:0', grams]]), focusLine: null, ... }`; its three creating cases keep their assertions.
- RecipePage.perStep.test.jsx: the removed step's five lines now read Locust bean gum, Guar gum, Lambda carrageenan, Sucrose, Whole milk (both removed-step cases); the Whole milk and Sucrose lines are found by the start of their aria-label, so no positional index into the removed list is left; one case added for the pen's uses line on Olive Oil v1's step 2. PrintSheetPages.test.jsx passes unchanged.
- CreationSteps.test.jsx: the uses line now holds three buttons (change the ingredients, add a purpose, add an aside) and a middot before each of the last two; 'in the table order' became 'in the step's own order'.
- IngredientTable.creating.test.jsx: the harness moved from `gramsByRow`/`setRowGrams` to `gramsByLine` built from `rowLines` and `setLineGrams`; the blur spy now receives `('sucrose-row', 0)`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] creationSteps.test.js moved off `setRowGrams`**
- **Found during:** Task 2
- **Issue:** The plan removes `setRowGrams` from creation.js as unused, and names only creation.test.js. creationSteps.test.js (plan 11-02's file, not in this plan's `files_modified`) calls it in five places (the Phase 10 fixture, one placeRow case and two seeded-random-op setups), so removing it broke that suite.
- **Fix:** Those five calls became `setLineGrams(draft, id, UNPLACED_STEP, grams)` on rows that are still unplaced; the stored result is identical (`[{ step: 1, grams }]`). `UNPLACED_STEP` and `setLineGrams` were already imported there.
- **Files modified:** app/src/domain/creationSteps.test.js
- **Commit:** 798e60da

**Total deviations:** 1 auto-fixed (1 blocking). **Impact:** a test-only edit in a sibling plan's file, forced by the plan's own removal.

### Notes

- **Portion line wording.** The plan and CONTRACT quote "400 g of 600 g · 58.0% in all". The build's `formatPortionLine` prints the row total through `formatGrams`, one decimal: "400 g of 600.0 g · 58.0% in all", exactly as the reading branch has always drawn it (IngredientTable.test.jsx pins '120 g of 370.4 g'). I used the build's function as the plan says and did not change `formatGrams`. Plan 11-08's board comparison will see "600.0 g" against the sketch's "600 g"; that is the one place the two differ.
- **Remove on a split row.** The plan says nothing about where a split row's remove control goes. I put it on the row's first line only, since it deletes the row outright; plan 11-08's acts line replaces it.
- **The pen's rows can reorder live.** `groupPortionsByStep` reads the pen's draft method, so unticking a row from a step's uses in the pen moves its line to the end of that step's group (a row the uses does not name sorts last). That follows Mark's answer; flagging it for 11-08 and UAT.
- The record script was run with a private `TMPDIR` so a sibling worktree could not share `sprinkles-11/base`.
- Phase 10 board specs under `.planning/phases/10-*/` are stale against sketch 014 and were left alone, as the dispatch asked. Plan 11-06's pB1 step-number box is still uncompared (11-08 adds it back).

## Known Stubs

None. The step's acts row and each row's acts line (remove, Move up, Move down, Add to step) are plan 11-08's, named in the plan, not stubs.

## Threat Flags

None. No new endpoint, auth path, file access or schema surface. T-11-20: line state lives in Maps and Sets keyed by `${rowId}:${step}`, never a bare object. T-11-21: an unreadable line projects as 0 and shows its own message on blur. T-11-58: the baseline was recorded from BASE plus the patch, the guard refused the patch with one unrelated line before the re-record, ordercheck and ordertest passed, and the walk matched.

## Notes for Mark and Sid

The saved reading page and the version pen now read "Not in a step yet" where the old word stood (D-12), and a saved recipe whose steps use no row reads every row under it (D-09); no board draws those cases. Sid is told, no redraw. Olive Oil v1's table now reads each step's rows in the order its seeded uses lists them (step 2: the three gums, Sucrose, Whole milk; step 3: Sucrose, Skim milk powder, Dextrose, Fine sea salt, Whole milk, Heavy cream), on screen and in print, and the version pen's "uses ..." line reads the same order (decide-p11-row-order-across-steps). Sketch 010's and 011's boards draw that table in the old row order: Sid is told, no redraw asked. The split line's "600.0 g" against the sketch's "600 g" is for Sid to settle when 11-08 measures pC1 and pD1.

## Next Phase Readiness

Plan 11-08 adds each row's acts line and the Add to step chooser on the `data-line` rows, the step's acts row, and measures pC1 and pD1 (the uses lines, the checklist, the step heads and the split lines) and pB1's step-number box in WebKit. Plan 11-09's gate reads `rowLines` for the per-line grams refusals. Every later walk check compares with the baseline re-recorded here.

## Self-Check: PASSED

- Files found: app/src/ui/CreationSteps.jsx, app/src/ui/IngredientTable.jsx, app/src/ui/CreationPage.jsx, app/src/ui/Method.jsx, .planning/phases/11-steps-structure-save-and-print/11-walk-order.patch, .planning/phases/11-steps-structure-save-and-print/11-walk-before.json.
- Commits found: dc824061, 798e60da, 4d3b44f7.
