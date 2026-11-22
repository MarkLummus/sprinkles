---
phase: 12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo
plan: 12
subsystem: ui
tags: [react, creation-editor, row-controls, tab-order, playwright-webkit, board-conformance]

requires:
  - phase: 12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo
    provides: "12-09 (PHONE-01 written in REQUIREMENTS.md; CreationFlow.test.jsx's one-line-page cases)"
provides:
  - "addRowAfter(draft, { rowId, libraryId, afterRowId, group }) in the domain"
  - "A row's Add ingredient (data-act add-ingredient) in the drawn place, with the anchored picker, the derived landing focus and Cancel back to the opener"
  - "A step's controls in sketch 016's two groups, in the board's Tab order (45 stops)"
  - "12-board-check.mjs change 5 (board notes left out), 12-board-rowcontrols.mjs (nine entries), 12-tab-probe.mjs (WebKit Tab walk)"
  - "STRUCT-05 written into REQUIREMENTS.md and ROADMAP's Phase 12 Requirements line"
affects: [12-13, 12-14, creation-editor]

actuals:
  tokens: 22271
  tasks: 3
  commits: 3
plan_head_before: 016ca8fb85dadb1c110a6404d478bf29c4382508
plan_head_after: a4f77c70318e72c38d6a8fa18a24707d277ba526

tech-stack:
  added: []
  patterns:
    - "A picker anchor read through one predicate over the update's own previous draft (liveness checked before groupRows), so a stale anchor can only fall back, never throw"
    - "A focus line derived at render from the committed draft (rowLines), not computed at pick time"
    - "Board engine leaves the board's own notes (.dl-tab, .dl-flag) out of the board side"

key-files:
  created:
    - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-rowcontrols.mjs
    - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-tab-probe.mjs
  modified:
    - app/src/domain/creation.js
    - app/src/domain/creation.test.js
    - app/src/ui/IngredientTable.jsx
    - app/src/ui/IngredientTable.creating.test.jsx
    - app/src/ui/CreationPage.jsx
    - app/src/ui/CreationFlow.test.jsx
    - app/src/ui/CreationSteps.jsx
    - app/src/ui/CreationSteps.test.jsx
    - app/src/ui/CreationStructure.test.jsx
    - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-check.mjs
    - .planning/REQUIREMENTS.md
    - .planning/ROADMAP.md

key-decisions:
  - "A pick whose anchor left its group while the picker was open lands as the heading's would (in no step, at the end): the simplest rule that never throws"
  - "When another row's Add ingredient re-anchors an open picker, that row becomes the opener Cancel returns to"
  - "12-board-rowcontrols.mjs exports coffeeBase so 12-tab-probe.mjs builds the same Coffee example the boards were drawn from"

patterns-established:
  - "Row Add ingredient never takes mk-head-act; the heading's control is found by that class and nothing else carries it"
  - "Stale-anchor safety: anchorHolds(draft, afterRowId, group) before addRowAfter, over the functional update's prev"

requirements-completed: [STRUCT-05]

coverage:
  - id: D1
    description: "addRowAfter lands a new row right after its anchor in a step group (ticked, one empty portion) or the unplaced group, with every other id and step key unchanged and the allocation invariant intact"
    requirement: STRUCT-05
    verification:
      - kind: unit
        ref: "app/src/domain/creation.test.js#addRowAfter (STRUCT-05, D-09)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Add ingredient on any row opens the picker in its built place, the pick lands right after that row in its step (or in no step), focus goes to the new row's grams, and the heading's Add ingredient still adds at the end in no step"
    requirement: STRUCT-05
    verification:
      - kind: integration
        ref: "app/src/ui/CreationFlow.test.jsx#Add ingredient on a row lands the pick right after it (STRUCT-05, D-09, CONTRACT section 5 and 11 number 9)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Cancel returns focus to the row's Add ingredient (or its Add to step chooser's Cancel, or the heading's); a stale anchor (row removed, step removed, row placed) falls back to the heading's landing with no error and focus agreeing with placement"
    requirement: STRUCT-05
    verification:
      - kind: integration
        ref: "app/src/ui/CreationFlow.test.jsx#an anchor that left its group while the picker was open"
        status: pass
    human_judgment: false
  - id: D4
    description: "A step's controls stand in two groups: targets with Add purpose, the uses line, the aside, a second targets line (Add aside, Preview step), the preview, then Add step, Move up, Move down, Remove; a row's acts read Add to step, Add ingredient, Move up, Move down, Remove"
    requirement: STRUCT-05
    verification:
      - kind: unit
        ref: "app/src/ui/CreationSteps.test.jsx and app/src/ui/CreationStructure.test.jsx and app/src/ui/IngredientTable.creating.test.jsx"
        status: pass
    human_judgment: false
  - id: D5
    description: "Every row-controls panel built equals the board within 1 px in Playwright WebKit at 1366 with a coarse pointer, and the specs can fail (--selftest; the old step markup fails them)"
    requirement: STRUCT-05
    verification:
      - kind: automated_ui
        ref: "node 12-board-check.mjs <round-one specs> 12-board-rowcontrols.mjs --selftest: 2006 PASS, 0 FAIL, nine PASS selftest rowcontrols-* lines"
        status: pass
    human_judgment: false
  - id: D6
    description: "Tab through the two regions in WebKit lands on 45 stops in the order the board numbers them, with the 1/4/5/6/9 and 1/7/8/9/12 counts, 1 and 2 Tabs from a row's grams, and the open Uses checklist order"
    requirement: STRUCT-05
    verification:
      - kind: automated_ui
        ref: "node 12-tab-probe.mjs: 9 PASS, 0 FAIL"
        status: pass
    human_judgment: false
  - id: D7
    description: "The Tab order on Mark's iPad with the Magic Keyboard"
    requirement: STRUCT-05
    verification: []
    human_judgment: true
    rationale: "Everything here is Playwright WebKit on a Mac; the iPad Tab walk is PROOF-02's device check (D-11), run once on this order"

duration: 75min
completed: 2026-11-22
status: complete
---

# Phase 12 Plan 12: Row controls in two groups and Add ingredient on a row Summary

**Add ingredient on each ingredient row lands the pick right after it (in its step, or in no step), a step's controls read in Sid's two groups, and WebKit Tab walks the 45 stops in the board's own numbering.**

## Performance

- **Duration:** about 75 min
- **Tasks:** 3 (one tracer, two auto)
- **Files modified:** 14 (2 created)

## Accomplishments

- `addRowAfter` in `app/src/domain/creation.js`, built from `addRow` and `toggleStepUses`: the new row lands right after the anchor in a step group (ticked in that step's uses, one empty portion at it) or after it in `draft.rows` in no step. It throws a RangeError for an anchor not in the group, a step that is not live and a duplicate row id.
- `RowActs` reads Add to step (only under "Not in a step yet" once a step exists), Add ingredient, Move up, Move down, Remove. Add ingredient is `text-control`, `data-act="add-ingredient"`, `aria-label="Add ingredient after <row>"`, on every line of a split row, never `mk-head-act`.
- The picker takes an anchor (`picking` is null or `{ afterRowId, group, opener }`). Pressing another row's Add ingredient while it is open re-anchors it and moves focus to its Name. Cancel returns to the row's Add ingredient, else the row's Add to step chooser's Cancel, else the heading's. A pick whose anchor is gone (row removed or placed, step removed) is added at the end in no step, with no throw: `anchorHolds` checks `liveSteps` before `groupRows`, over the update's own previous draft.
- `creationRows.focusLine` is derived at render from `rowLines` over the committed draft, so the grams line focused and the landing can never disagree (the `:0` literal is gone).
- `CreationStep` is regrouped without a class, `data-act` or `aria-label` change and without a wrapper: lead-in, instruction, first targets line (chips, Add target, Add purpose), purpose, uses line (sentence and Change ingredients only), the Uses checklist, the aside, a second targets line (Add aside, Preview step), the preview, then the acts line Add step, Move up, Move down, Remove.
- Board engine change 5: `.dl-tab, .dl-flag` are removed from the board side before any reading. `12-board-rowcontrols.mjs` holds nine entries over seven panels (one per region), and `12-tab-probe.mjs` reads the expected 45-stop order from the board's `i.dl-tab` numbers.
- STRUCT-05 is in REQUIREMENTS.md (text, traceability row, coverage 33, Phase 12: 6) and in ROADMAP's Phase 12 Requirements line.

## Verification

- `npx vitest run` (whole): 135 files, 4498 tests, all passing (baseline 4477; 21 new).
- `node 12-board-check.mjs` over 12-board-selftest, -pen, -reading, -logs, -limits and -rowcontrols with `--selftest` on a scratch build: 2006 PASS, 0 FAIL, nine `PASS selftest rowcontrols-*` lines. The same rowcontrols spec on a build with the old step markup prints FAIL lines (button order, boxes), so it can fail.
- `node 12-tab-probe.mjs`: 9 PASS, 0 FAIL (45 stops equal to the board's order; 1/4/5/6/9; 1/7/8/9/12; 1 and 2 Tabs from a row's grams; the checklist order). On the old step markup it prints FAIL at stop 27 ("Step 1, add purpose" expected, "Step 1, Preview step" found).
- `sh 11-walk-check.sh`: "MATCH 94 snapshots; NEW create-recipe 3; NEW edit-first-version 3; NEW edit-stale 5; NEW create-save-refused 2; NEW edit-kept 5", no DIFF.
- Task acceptance criteria all met (greps and the DOCS PASS line).
- No process of mine was left running; builds went to scratch directories under the scratchpad and `$TMPDIR`; `app/dist` untouched.

## Deviations from Plan

None in kind. Two small notes:

- **CreationFlow.test.jsx pins beyond the three the plan named.** `removeOf` in the "remove deletes a creation row outright" block found a row's first `text-control`, which is now Add ingredient; it finds `button[data-act="remove"]` instead (four cases failed until it did). Line 1069's `buttonByText('Add ingredient')` null check became a check over `.mk-head-act` buttons, so a row's button cannot make it ambiguous. Both inside files_modified.
- **kr-preview selector.** The plan said "step 1's controls and fields above the preview"; the step's targets lines are selected as `li.mk-step[data-step="1"] > .method-step__body > p.method-step__targets` because the app's own preview holds a `p.method-step__targets` inside `.mk-preview` that the board's two-field preview does not.

**Total deviations:** 0 auto-fixed bugs. **Impact:** none on scope.

## Known Stubs

None.

## Threat Flags

None. (T-12-37: node tests assert `checkAllocation`, ids and n after every landing, and the stale-anchor fallback is tested three ways. T-12-38: rows' buttons never carry `mk-head-act`, asserted in IngredientTable.creating.test.jsx and by the grep. T-12-39: the row name only enters an `aria-label` attribute and React text. T-12-40: the engine removes only `.dl-tab` and `.dl-flag`, and round one's specs and self-test rerun green.)

## Notes for 12-13 (same files: CreationSteps.jsx, CreationPage.jsx, IngredientTable.jsx)

- `RowActs` has a new prop `onAddAfter`, wired in `renderCreatingEntry` to `creationRows.onAddRowAfter(row.id, portion.step)`. `creationRows` gained `onAddRowAfter` (CreationPage `handleAddRowAfter(rowId, group)`). Cmd+Return in a row's grams should call that same handler (CONTRACT section 6); the `group` is `portion.step`.
- `picking` in CreationPage is now null or `{ afterRowId, group, opener: 'heading' | 'row' }`. Opening the picker from a grams-field key should use `opener: 'row'`; CONTRACT section 11 number 9a says Cancel then returns focus to that row's grams when Cmd+Return opened it, and `handleCancelPicker` today returns to the row's Add ingredient (focus kind `picker-opener`, line `${afterRowId}:${group}`). You will need a third opener value (or a field on the anchor) and a branch in the `picker-opener` resolver to find the line's grams textarea instead.
- Focus kinds added: `'picker-name'` (string request; the picker's Name textarea) and `{ kind: 'picker-opener', line }`. `findRefusedField`'s `ingredients` case still finds the heading's control by `.mk-head-act`, which rows never carry.
- Landing focus is `creationRows.focusLine`, derived at render from `focusRowId` and `rowLines`; do not recompute it at the key's handler.
- A step's body children are now, in order: lead-in label, instruction label, `p.method-step__targets` (1st), purpose label (when open), `p.method-step__uses-line`, Uses fieldset (when open), aside label (when open), `p.method-step__targets` (2nd), `div.mk-preview` (when pressed), `p.method-step__acts`. `12-tab-probe.mjs`, `12-board-rowcontrols.mjs` and CreationSteps.test.jsx's order test pin this. CreationPage's step-target lookups use the first `> .method-step__body > .method-step__targets`, which is unchanged. The `aria-keyshortcuts` attribute you add goes on the same buttons; the specs here deliberately check none.
- `12-board-rowcontrols.mjs` exports `coffeeBase` (imported by `12-tab-probe.mjs`); the engine only reads its default export.

## For the orchestrator (executors have no ArtifactData)

- Close Mark's List row `todo-add-ingredient-per-row` (built here): read it for its version, read the clock with `date -u +%Y-%m-%dT%H:%M:%S.000Z` just before the write, status done, `resolvedAt` from that read, a one-line reply naming this plan's commits (73f8c1dd, f6f961a8, a4f77c70). Its todo file moves to completed in 12-14 with the reorder todo's. `todo-reorder-row-controls` waits for 12-13.
- Deploy: no store shape, DB_VERSION or store-file-version change; main is safe to deploy.
- STRUCT-05 stays unchecked and Pending in REQUIREMENTS.md: it is shared with 12-13, which has not landed.

## Self-Check: PASSED

- Created files present: 12-board-rowcontrols.mjs, 12-tab-probe.mjs.
- Commits 73f8c1dd, f6f961a8, a4f77c70 are ancestors of HEAD.
