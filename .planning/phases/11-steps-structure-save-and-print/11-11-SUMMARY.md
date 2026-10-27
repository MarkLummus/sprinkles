---
phase: 11-steps-structure-save-and-print
plan: 11
subsystem: ui
tags: [react, creation-editor, save, validation-messages, aria, webkit, board-conformance]

requires:
  - phase: 11-steps-structure-save-and-print
    provides: 11-09 creationSaveBlock, lineSaveMessages, the Save gate, the focus map and the band's two messages; 11-10 the edit route and mode 'edit' on the same page
provides:
  - "CreationPage: saveMessages (block id to message) and lineMessages (lineSaveMessages) recomputed from the live gate after the first refused press, threaded to the step fields, the table, the setup cards and the Ingredients heading"
  - "CreationSteps: lead-in, instruction and target-side errors with aria-invalid and aria-describedby (ids create-step-n-lead-error, create-step-n-instruction-error, create-step-n-target-i-side-error)"
  - "IngredientTable creating entry: creationRows.lineMessages read by line key alone, a row's total overflow included"
  - "Segmented: optional error and errorId (radiogroup invalid and described, message under the radios)"
  - "CreationSetup: scale name/low/high/kind and problem messages (create-scale-key-field-error, create-problem-i-error), the repeated-problem sentence"
  - "RecipeSheet ingredientsMessage and IngredientPicker describedBy: the no-rows line under the Ingredients heading row, described by Add ingredient or the open picker's Name field"
  - "11-walk.mjs scenario create-save-refused; vB1 in 11-board-save.mjs"
affects: [11-12, 11-13]

actuals:
  tokens: 14700
  tasks: 3
  commits: 3

plan_head_before: 6598b43d154ead606ff2fe3028a3da8f993fa38a
commits: 3
plan_head_after: 378387c6e3b24901a36c0aa20aafbb35a7661b21

tech-stack:
  added: []
  patterns:
    - "One gate, two projections: the page builds saveMessages (by block id) for fields it names and lineMessages (by line key) for the table, so the table never recognises a block by its id prefix"
    - "An error replaces the quiet Required in the same FieldFeedback; the field carries aria-invalid and aria-describedby only while its error stands"
    - "A shared control gains optional error props and renders exactly as before without them (Segmented, IngredientPicker.describedBy)"

key-files:
  created: []
  modified:
    - app/src/ui/CreationPage.jsx
    - app/src/ui/CreationSteps.jsx
    - app/src/ui/CreationSteps.test.jsx
    - app/src/ui/IngredientTable.jsx
    - app/src/ui/IngredientTable.creating.test.jsx
    - app/src/ui/CreationSetup.jsx
    - app/src/ui/CreationSetup.test.jsx
    - app/src/ui/Segmented.jsx
    - app/src/ui/Segmented.test.jsx
    - app/src/ui/IngredientPicker.jsx
    - app/src/ui/IngredientPicker.test.jsx
    - app/src/ui/RecipeSheet.jsx
    - app/src/ui/CreationFlow.test.jsx
    - app/src/ui/EditFlow.test.jsx
    - .planning/phases/11-steps-structure-save-and-print/11-walk.mjs
    - .planning/phases/11-steps-structure-save-and-print/11-board-save.mjs

key-decisions:
  - "A line's refusal from Save wins over its blur message (lineMessages first, then the blur message); both clear on their own as the draft is fixed"
  - "Add ingredient is described by the no-rows line but not marked aria-invalid; the plan asks for the description only, and the picker's Name field takes the same description while the picker is open"
  - "The form-level line still shows one gone-entry sentence, not one per row: every gone block carries the same sentence and the case is unreachable from the editor"
  - "vB1 compares the ceremony's Required lines by count, box and text across .field-error and .field-requirement, because the board draws the Version name's Required as the quiet guidance and the build draws the refusal's error in the same place"

requirements-completed: [MAKE-10]

coverage:
  - id: M1
    description: "A refused Save shows every message at once in its own place, in the creation editor and on the edit route: step lead-in, instruction and target sides, each grams line (a row's total overflow under its last line), scale fields and unpicked kind, blank and repeated problems, no rows under the Ingredients heading row, each cleared as its field is fixed, nothing written while one stands"
    requirement: "MAKE-10"
    verification:
      - kind: unit
        ref: "app/src/ui/CreationSteps.test.jsx#a refused Save's messages (3 cases); IngredientTable.creating.test.jsx (2 new cases); CreationSetup.test.jsx#a refused Save's messages (5 cases)"
        status: pass
      - kind: integration
        ref: "app/src/ui/CreationFlow.test.jsx (7 new cases in the Save refuses block: grams plus lead-in at once, second press refocus, 308-digit overflow, no rows, no rows with the picker open, two problems Bitter, unpicked kind plus blank Low end)"
        status: pass
      - kind: integration
        ref: "app/src/ui/EditFlow.test.jsx (4 new cases: 308-digit overflow, blank lead-in with a second press, Version name plus repeated problem, no rows with and without the picker)"
        status: pass
    human_judgment: false
  - id: M2
    description: "Each refused field carries aria-invalid and aria-describedby naming its visible message, the scale's Kind radiogroup included through Segmented's own error props; quiet Required stays aria-hidden"
    requirement: "MAKE-10"
    verification:
      - kind: unit
        ref: "app/src/ui/Segmented.test.jsx (with and without error); IngredientPicker.test.jsx (describedBy given and omitted)"
        status: pass
      - kind: integration
        ref: "CreationSteps.test.jsx and CreationSetup.test.jsx assert aria-invalid, describedby and the aria-hidden quiet line"
        status: pass
    human_judgment: false
  - id: M3
    description: "A refused Save in WebKit names every problem at once, writes nothing but the kept draft, puts focus on the first refused field, and the refused editor matches sketch 014 vB1"
    requirement: "MAKE-10"
    verification:
      - kind: e2e
        ref: "11-walk.mjs create-save-refused (WebKit, built app): MATCH 94 snapshots; NEW create-save-refused 2"
        status: pass
      - kind: automated_ui
        ref: "11-board-check.mjs 11-board-save.mjs --selftest: 39 PASS, 0 FAIL, PASS selftest vB1; the five Phase 11 specs together 1053 PASS, 0 FAIL"
        status: pass
    human_judgment: false
  - id: M4
    description: "The wording of 'Enter a recipe name.' (drawn), 'Add at least one ingredient.' and 'This problem is already listed.' as they stand under the fields"
    verification: []
    human_judgment: true
    rationale: "Maker-facing sentences, Claude's wording within the existing sentences' shape (plan 11-09); for Mark in chat"

duration: 8min
completed: 2026-10-27
status: complete
---

# Phase 11 Plan 11: Every Save refusal shows in its own place Summary

**A refused Save, in the creation editor and on the edit route alike, now puts each message under its own field at once (step lead-ins, instructions and target sides, grams lines with a row's total overflow under its last line, scale fields and Kind, blank and repeated problems, and no-rows under the Ingredients heading), each field invalid and described by its visible message, all clearing as the draft is fixed, with the walk and sketch 014's vB1 holding it in WebKit.**

## Performance

- **Duration:** about 8 minutes (2026-10-27T03:36Z to 03:44Z)
- **Tasks:** 3 of 3 (Task 1 tracer, Tasks 2 and 3 auto)
- **Files:** 16 changed, none created
- **Tests:** baseline in this worktree 128 files, 4149 passing; at the end 128 files, 4173 passing (+24 tests, same files)

## Accomplishments

- `CreationPage` builds `saveMessages` (a Map of block id to message) and `lineMessages` (plan 11-09's `lineSaveMessages` over the same blocks) from the live gate once Save has been refused, so every message clears as its field is fixed. Nothing new is written while a refusal stands; the 11-09 lock and focus map are untouched.
- `CreationSteps`: lead-in, instruction and each target side take the error, `aria-invalid` and `aria-describedby`; the error replaces the quiet Required in the same `FieldFeedback`.
- `IngredientTable`: a creating line reads `creationRows.lineMessages` by `${rowId}:${step}` alone, ahead of the blur message. Two lines of one row that are each finite but overflow together show "…'s amount is not a number" under the last line only, marked, invalid and described (T-11-65), in both flows.
- `Segmented` gained optional `error` and `errorId`: the Kind radiogroup is invalid and described, the message sits under the radios; `CreationSetup` cards pass scale name/low/high/kind and problem messages, and a repeated problem says so under the second only. BatchRow's three uses render as before (BatchRow.test.jsx green).
- `RecipeSheet` draws the no-rows line under the Ingredients heading row (`ingredientsMessage`); Add ingredient is described by it, and while the picker is open in its place the picker's Name field is (`IngredientPicker.describedBy`), which is also where 11-09 already puts focus.
- Walk scenario `create-save-refused` and board panel `vB1` in WebKit.

## Task Commits

1. **Task 1 (tracer):** `a05b0cc2` (feat). Tracer gate: `<verify>` is automated-only, so the five-file verify and then the full suite (4173) were re-run before Task 2. Tracer verified end-to-end, expanding.
2. **Task 2:** `302176b6` (feat)
3. **Task 3:** `378387c6` (test)

## Verification

- Task 1 verify (five files): 198 passed. Task 2 verify files and the full suite: 128 files, 4173 passed. Acceptance greps all meet their thresholds: `saveMessages` in CreationSteps 7, `lineMessages` in IngredientTable 1, `lineSaveMessages(` in CreationPage 1, `aria-invalid` in CreationSteps 4, `repeat(308)` in CreationFlow.test 4 and EditFlow.test 2; `saveMessages` in CreationSetup 3, `aria-describedby` in Segmented 1 and `errorId` 4, `ingredientsMessage` in RecipeSheet 3, `problem-repeat` in CreationSetup 1.
- Board: `11-board-check.mjs 11-board-save.mjs --selftest` ends `39 PASS, 0 FAIL` with `PASS selftest vA1`, `PASS selftest vB1`, `PASS selftest vC1`. The five Phase 11 specs together: `1053 PASS, 0 FAIL` (steps, structure, reading, first-version and save, so nothing the Segmented, table or sheet changes touched moved).
- Walk: `sh 11-walk-check.sh` ends `MATCH 94 snapshots; NEW create-recipe 3; NEW edit-first-version 3; NEW edit-stale 5; NEW create-save-refused 2`; `selftest` and `seedtest` print all PASS lines; the twelve baseline scenario bodies compare `PASS scenarios identical` with 10-walk.mjs; `grep -c "'create-save-refused'"` prints 2.

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None.

## Threat Flags

None. T-11-32 (aria-invalid and aria-describedby on every refused field, tests assert the wiring), T-11-33 (the repeated-problem sentence under the second problem, nothing written), T-11-51 (Segmented's error props and the picker's describedBy) and T-11-65 (lineSaveMessages read by the table, the 308-digit case in CreationFlow, EditFlow and the table's own test) are each covered by the tests named above. No store shape changed; no `dangerouslySetInnerHTML`; no literal visual value (the new lines reuse `.field-error`).

## Notes for Mark and Sid (for chat)

- **Wording that is Claude's:** "Add at least one ingredient." under the Ingredients heading row and "This problem is already listed." under the second of two equal problems (both from plan 11-09's gate); "Enter a recipe name." is the board's.
- **One board reading, not a departure:** vB1 draws the Version name's Required as the quiet always-on line; after a refused Save the build draws the same word as the error in the same place, and the two measure the same (box and text).
- No mutation or board-side layout was changed to make a check pass; vB1 passed on its first run.

## Next Phase Readiness

Plan 11-12 can rely on the refused editor being complete in both modes. Plan 11-13's full-suite pass carries the new cases. The Mark's List rows named in plans 11-09 and 11-10 are unchanged by this plan; none was added (this plan leaves Mark no decision, check or look beyond the wording note above).

## Authentication Gates

None.

## Self-Check: PASSED

- Files found: app/src/ui/CreationPage.jsx, app/src/ui/CreationSteps.jsx, app/src/ui/IngredientTable.jsx, app/src/ui/CreationSetup.jsx, app/src/ui/Segmented.jsx, app/src/ui/IngredientPicker.jsx, app/src/ui/RecipeSheet.jsx, .planning/phases/11-steps-structure-save-and-print/11-walk.mjs, .planning/phases/11-steps-structure-save-and-print/11-board-save.mjs.
- Commits found: a05b0cc2, 302176b6, 378387c6.
