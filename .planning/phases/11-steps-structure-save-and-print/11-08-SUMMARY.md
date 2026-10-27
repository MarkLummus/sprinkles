---
phase: 11-steps-structure-save-and-print
plan: 08
subsystem: ui
tags: [react, creation-editor, structure, move-remove-add, focus, announcer, webkit, board-conformance]

requires:
  - phase: 11-steps-structure-save-and-print
    provides: 11-02 creationSteps.js ops (moveStep, removeStep, moveRow, placeRow, groupRows); 11-06 CreationSteps.jsx and the focus-request effect; 11-07 the grouped creating table (tr[data-line]) and the walk baseline
provides:
  - "CreationSteps: p.method-step__acts under every step (remove, Move up, Move down, Add step) with .mk-off and aria-disabled on a move that cannot act"
  - "IngredientTable: RowActs on every creating line (remove, Move up, Move down, and Add to step under Not in a step yet once a step exists) and the Add to step chooser"
  - "CreationPage: handleMoveStep, handleRemoveStep, handleRemoveRow(rowId, group), handleMoveRow, handlePlaceRow; focus requests step-act, step-field, add-step-head, row-act; a polite structure announcer that empties and rewrites on the next frame"
  - "11-board-structure.mjs (qA1 to qE1, focus checked on qB1 and qE1) and 11-board-steps.mjs completed (pA1-table, pB1 with the step number box and acts, pB1-table, pC1-step2, pC1-table, pD1-table, pE1 over both steps)"
affects: [11-09, 11-10, 11-11, 11-13]

actuals:
  tokens: 17300
  tasks: 3
  commits: 3

plan_head_before: aff325f036156218b5236181f31249d546c890d7
commits: 3
plan_head_after: 610096baad51da5e28b87a45434cb299d8891616

tech-stack:
  added: []
  patterns:
    - "Every focus move after a structure change is a request in a ref (page: focusRequestRef, table: chooserFocusRef) acted on by an effect after the render that drew its target; no focus() call runs in a press's own handler"
    - "A line's act is found by tr[data-line] and [data-act]; a Move that turned off hands focus to the item's other Move button"
    - "The status region is emptied, then rewritten in requestAnimationFrame, so a repeated sentence is a change a polite region reads"
    - "A row's group for a Move or remove is the line's portion.step: a live step key, or UNPLACED_STEP (0) for Not in a step yet and for a flat table"

key-files:
  created:
    - app/src/ui/CreationStructure.test.jsx
    - .planning/phases/11-steps-structure-save-and-print/11-board-structure.mjs
  modified:
    - app/src/ui/CreationSteps.jsx
    - app/src/ui/IngredientTable.jsx
    - app/src/ui/CreationPage.jsx
    - app/src/styles/notebook.css
    - app/src/ui/IngredientTable.creating.test.jsx
    - app/src/ui/CreationFlow.test.jsx
    - .planning/phases/11-steps-structure-save-and-print/11-board-steps.mjs

key-decisions:
  - "A split row's remove is on every line and removes the whole row from every step (CONTRACT section 3: the step's Uses checklist is how a row leaves one step); its label stays 'remove <row>'"
  - "A split row's Move controls are named by step ('Move Whole milk, 3.5% fat up in step 2'); a one-line row keeps the board's 'Move <row> up'"
  - "The chooser span is display: inline-block with white-space: normal, not plain normal: it moves whole to the next line when it does not fit beside the name, as the board's nowrap line does, and still wraps inside the cell with many steps"
  - "Announcement sentences (Claude's wording within D-14 to D-16's shape): 'Step 2 of 3', 'Step 2, Churn, removed' ('Step 2 removed' with no lead-in), 'Whole milk, 3.5% fat removed', 'Whole milk, 3.5% fat, row 1 of 2 in step 1', '..., row 1 of 3, not in a step yet', '..., row 2 of 3' in a flat table, '... added to step 1'"

requirements-completed: [STRUCT-01, STRUCT-02, STRUCT-03]

coverage:
  - id: F1
    description: "Each step has remove, Move up, Move down and Add step; Move reorders the steps by touch and keyboard, keeps every stored key, and keeps focus on the moved step's own Move button (the other one when it turns off); a polite word reads the position, a repeat included"
    requirement: "STRUCT-02"
    verification:
      - kind: integration
        ref: "app/src/ui/CreationStructure.test.jsx 'Move on a step' (4 cases, StrictMode, keyboard press, status emptied then rewritten)"
        status: pass
      - kind: integration
        ref: "11-board-structure.mjs qA1 and qB1 (focus on 'Step 2, move down'), 'PASS selftest qB1'"
        status: pass
    human_judgment: false
  - id: F2
    description: "remove on a step deletes it outright (no strike, no restore), its rows return under Not in a step yet, focus goes to the next step's lead-in else the previous else the heading's Add step, and a removed step's key is not handed out again in the session"
    requirement: "STRUCT-01"
    verification:
      - kind: integration
        ref: "app/src/ui/CreationStructure.test.jsx 'remove on a step' (4 cases); 11-board-structure.mjs qC1"
        status: pass
    human_judgment: false
  - id: F3
    description: "remove on a row deletes the whole row (a split row from every step) and prunes every uses; focus goes to the next row's remove in the group, else the previous, else Add ingredient or the open picker's Cancel"
    requirement: "STRUCT-01"
    verification:
      - kind: integration
        ref: "app/src/ui/CreationStructure.test.jsx 'remove on a row' (4 cases); CreationFlow.test.jsx 'remove deletes a creation row outright' (focus now the previous row's remove)"
        status: pass
      - kind: unit
        ref: "app/src/ui/IngredientTable.creating.test.jsx 'both lines of a split row carry remove for the row, and a press on either removes the whole row'"
        status: pass
    human_judgment: false
  - id: F4
    description: "Move up and Move down on a row stay inside its step's group (or Not in a step yet); each step orders its own rows, so moving B up in step 1 leaves step 2 reading A, B; off moves are .mk-off, aria-disabled, focusable and do nothing; a split row's Move controls name their step so no two controls on the table share a name"
    requirement: "STRUCT-03"
    verification:
      - kind: integration
        ref: "app/src/ui/CreationStructure.test.jsx 'Move on a row stays within its own step' (4 cases, the per-step order case asserts both groups, the kept uses and draft.rows)"
        status: pass
      - kind: unit
        ref: "app/src/ui/IngredientTable.creating.test.jsx 'the acts line' (8 cases) and the unique-names case"
        status: pass
    human_judgment: false
  - id: F5
    description: "Add to step on a row under Not in a step yet opens the chooser (Cancel first and focused, one control per step), Escape acts as Cancel and returns focus to Add to step, one chooser at a time, choosing places the row as that step's last row with focus on its remove"
    requirement: "STRUCT-01"
    verification:
      - kind: integration
        ref: "app/src/ui/CreationStructure.test.jsx 'Add to step' (3 cases); IngredientTable.creating.test.jsx chooser cases"
        status: pass
      - kind: integration
        ref: "11-board-structure.mjs qE1 (focus on the chooser's Cancel)"
        status: pass
    human_judgment: false
  - id: F6
    description: "qA1 to qE1 and the completed steps panels (pA1-table, pB1, pB1-table, pC1-step2, pC1-table, pD1-table, pE1) match sketch 014 in WebKit at 1366 with a coarse pointer, focus included; the walked routes are unchanged"
    requirement: "STRUCT-02"
    verification:
      - kind: integration
        ref: "11-board-check.mjs 11-board-steps.mjs 11-board-structure.mjs --selftest -> 915 PASS, 0 FAIL, fifteen 'PASS selftest' lines"
        status: pass
      - kind: integration
        ref: "sh 11-walk-check.sh -> MATCH 94 snapshots"
        status: pass
    human_judgment: false
  - id: F7
    description: "Focus after a Move or a remove on the iPad (WebKit touch and a hardware keyboard)"
    requirement: "STRUCT-02"
    verification: []
    human_judgment: true
    rationale: "The roadmap's medium-confidence item; measured in desktop WebKit here with a keyboard press and a touch press, and confirmed on the device only in the phase's one iPad check (D-20)"
---

# Phase 11 Plan 08: Add, remove and move for steps and rows, with focus, a polite word and Add to step Summary

**While creating, every step and every row has remove, Move up and Move down (a step also Add step, an unplaced row also Add to step with a chooser), focus stays on the moved item or lands by D-14 to D-17's rules after the render, a polite status region says what changed even when the sentence repeats, and qA1 to qE1 plus the completed steps panels match sketch 014 in WebKit with 915 passes and no fail.**

## Performance

- **Duration:** about 20 minutes (2026-10-27T02:25Z to 02:44Z)
- **Tasks:** 3 (Task 1 tracer, Tasks 2 and 3 auto)
- **Files:** 9 changed (2 created)

## Accomplishments

- `CreationSteps.jsx`: each step ends with `p.method-step__acts` holding `Step n, remove`, `Step n, move up`, `Step n, move down` and `Step n, add a step after it` (data-act remove, move-up, move-down, add-after). The first live step's Move up and the last's Move down carry `.mk-off` and `aria-disabled="true"`, keep `tabindex 0` and have no click handler.
- `CreationPage.jsx`: functional-update handlers over plan 11-02's ops; the focus effect now resolves `step-act`, `step-field`, `add-step-head` and `row-act` requests after the render (the row-act line is found with `CSS.escape`); a `p.visually-hidden[role=status][aria-live=polite]` announcer is emptied and rewritten in `requestAnimationFrame`, and its frame is cancelled on unmount.
- `IngredientTable.jsx`: the creating line's old first-line-only remove becomes `span.ingredient-table__remove-gap` plus `span.mk-row-acts`. The chooser state (one open row id), a focus-request ref and an effect live in the table; Cancel, Escape on the span and choosing all go through the request. New `creationRows` members: `onMoveRow`, `onPlaceRow`; `onRemoveRow(rowId, group)`.
- `notebook.css`: `.notebook .mk-off`, `.notebook .mk-row-acts` (nowrap) and `.notebook .mk-row-acts--choosing` (inline-block, normal wrap). No new token, no `@media`, nothing in the coarse block.
- `CreationStructure.test.jsx` (20 cases, StrictMode, in-memory repository, a held animation frame) and 10 more cases in `IngredientTable.creating.test.jsx`.
- `11-board-structure.mjs` and the completed `11-board-steps.mjs`, run with `--selftest`.

## Task Commits

1. **Task 1 (tracer): each step has remove, Move up, Move down and Add step, and focus stays on the moved step** - `6fdd1cc9` (feat)
2. **Task 2: rows remove, move within their step and join a step from Add to step** - `3fe7d015` (feat)
3. **Task 3: qA1 to qE1 and the completed steps panels match sketch 014 in WebKit, focus included** - `610096ba` (test)

Tracer gate: Task 1's `<verify>` is automated-only, so it was re-run end to end (the whole suite, 4026 passing) before Task 2. Tracer verified end-to-end, expanding.

## Verification

- Full suite: baseline in this worktree 125 files, 4017 tests passed; after this plan 126 files, 4047 tests passed (30 added: 20 in CreationStructure.test.jsx, 10 in IngredientTable.creating.test.jsx).
- Board: `11-board-check.mjs 11-board-steps.mjs 11-board-structure.mjs --selftest` ends `915 PASS, 0 FAIL`, with `PASS selftest` for pA1-before, pA1-ingredients, pA1-instructions, pA1-table, pB1, pB1-table, pC1-step2, pC1-table, pD1-table, pE1, qA1, qB1, qC1, qD1 and qE1, and `PASS ... focus` for qB1 (`Step 2, move down`) and qE1 (`Heavy cream, 36% fat, cancel`). The first run of qA1 to qE1 had 27 FAILs (see deviation 1 and the draft's Philadelphia bands); every one was classified before editing and none was solved by widening the tolerance.
- Walk: `sh 11-walk-check.sh` ends `MATCH 94 snapshots` against the baseline plan 11-07 re-recorded.
- Acceptance greps: `add a step after it` in CreationSteps.jsx 1; `aria-disabled` 3; `aria-live="polite"` in CreationPage.jsx 1; `.notebook .mk-off` 1; `mk-row-acts` in IngredientTable.jsx 2; `to a step` 1; `CSS.escape` in CreationPage.jsx 1; `placeRow(` 1; `mk-row-acts--choosing` in notebook.css 1; `qE1` in 11-board-structure.mjs 2; `focus` 7; `pB1-table` 3; `pC1-step2|pC1-table|pD1-table` 5; the pE1 `.mk-step > .method-step__body > .method-step__targets` selector 1. `grep -c "moveStep("` in CreationPage.jsx prints 2, not 1: the second hit is `removeStep(`, which contains the substring.
- `tabindex-scan.test.js`, `cross-cutting.test.js`, `binder.test.js` and `notebook.test.js` pass: every new button renders through Button.jsx.

## Pins moved

- CreationFlow.test.jsx 'removes Heavy cream from the table and the saved draft ...': focus now lands on the previous row's remove (Whole milk's), per D-15 (the plan names this case). The two other Phase 10 remove cases (the only row; the picker open) keep Add ingredient and the picker's Cancel.
- IngredientTable.creating.test.jsx: the old case asserting one remove for a split row ('offers one remove for the row') became three: the line-line portion notes, unique names for each Move button and grams field, and both lines carrying `remove <row>` with a press on either removing the whole row. The harness gained `onRemoveRow`, `onMoveRow` and `onPlaceRow` that apply the real ops.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] The chooser's `white-space: normal` broke the board's chooser line**
- **Found during:** Task 3 (qE1)
- **Issue:** The plan gives `.mk-row-acts--choosing` `white-space: normal` so a chooser wraps. At the drawn widths the board's chooser does not wrap: its nowrap line does not fit beside Heavy cream's name and its estimate mark, so it moves whole to its own line (row 76.9 px). With plain normal wrap the build put Cancel on the name's line and the two step controls on the next, a row 101 px tall, 24 px taller down the whole page (pageHeight 1749.2 against 1725.1) and 14 boxes off.
- **Fix:** `.mk-row-acts--choosing` is `display: inline-block; white-space: normal`. An inline block that does not fit beside the name moves whole to the next line (the board), and one wider than the cell still wraps inside it (many steps).
- **Files modified:** app/src/styles/notebook.css
- **Commit:** 610096ba

**2. [Rule 3 - Blocking] The board's chooser carries no `mk-row-acts--choosing` class**
- **Found during:** Task 3 (qE1)
- **Issue:** The plan has qE1 compare `.mk-row-acts--choosing .text-control`, but the board's chooser span is a plain `.mk-row-acts` and the selector matches nothing there (the engine refuses it).
- **Fix:** qE1 compares the step controls by their shared name, `[aria-label^="Add Heavy cream, 36% fat to step"]` [count, box, text], plus Cancel by its label with the focus check; the chooser's three buttons are also in `.mk-row-acts .text-control`. The class stays in the build as a hook.
- **Files modified:** 11-board-structure.mjs
- **Commit:** 610096ba

**3. [Rule 3 - Blocking] The spec's drafts take the board's row order and Philadelphia's bands**
- **Found during:** Task 3
- **Issue:** The board's draft holds its rows as Whole milk, Heavy cream, Skim milk powder, Sucrose, Vanilla extract (its flat table and its Uses checklist read that order); plan 11-06's spec held a different order that no earlier panel compared. qA1 to qE1's Balance reads against Philadelphia's four bands ("target 14–18"); qC1 compares the deviation words.
- **Fix:** 11-board-steps.mjs's ROW_DEFS take the board's order with each step's uses in the order its table draws the rows; 11-board-structure.mjs's draft carries `style: 'philadelphia'` and its bands.
- **Files modified:** 11-board-steps.mjs, 11-board-structure.mjs
- **Commit:** 610096ba

**Total deviations:** 3 auto-fixed (1 bug, 2 blocking). **Impact:** the first is a build change to the board's value; the other two are fixtures.

### Notes

- **pD1 now draws Whole milk's line under Step 2.** The plan expected the board to lack it and measured only the Step 1 head and its three lines; the sketch file at this base draws it as Step 2's last row (200 g, uses line "Heavy cream, 36% fat, Vanilla extract, Whole milk, 3.5% fat"), as the plan allowed for. `pD1-table` therefore measures the whole tbody. There is no missing line to name for Sid.
- **Portion line wording, for Sid.** The board writes "400 g of 600 g · 58.0% in all"; the build's `formatPortionLine` writes "400 g of 600.0 g · 58.0% in all" (`formatGrams` prints one decimal, as the reading branch always has). `pD1-table` holds the two portion lines by count, font and type, not by text or box, and says why in a comment. I used the build's function and did not change `formatGrams`.
- **A split row's remove removes the whole row.** On either line, from every step; the step's Uses checklist is how a row leaves one step (CONTRACT section 3).
- **Phase 10 board specs left alone.** They are stale against sketch 014, as the dispatch said.
- **One announcer.** It sits as the first child of `.notebook.mk-page`; it is visually hidden and the boards' Sheet crops do not include it.

## Known Stubs

None.

## Threat Flags

None. No new endpoint, auth path, file access or schema surface. T-11-22: an off Move is `aria-disabled` with no handler and the page handlers guard the ends (the ops still throw RangeError), and CreationStructure.test.jsx and IngredientTable.creating.test.jsx press every off button; T-11-23: `removeRow` and `removeStep` prune, and the kept draft is asserted after each removal (rows, every uses, split rows).

## Notes for Mark and Sid

- For Mark in chat: the announcement sentences are my wording within D-14 to D-16's shape: "Step 2 of 3", "Step 2, Churn, removed" ("Step 2 removed" when the lead-in is blank), "Whole milk, 3.5% fat removed", "Whole milk, 3.5% fat, row 1 of 2 in step 1", "..., row 1 of 3, not in a step yet" (and "..., row 2 of 3" in a flat table), "... added to step 1". A split row's remove removes the whole row; a split row's Move controls name their step ("Move Whole milk, 3.5% fat up in step 2"); each step keeps its own row order, so moving a row in one step leaves every other step as it was (decide-p11-row-order-across-steps).
- For Sid: the board's pD1 now draws Whole milk's Step 2 line, so nothing is missing; the portion line's "600 g" against the build's "600.0 g" is the one text difference left on the steps boards (a `formatGrams` question, not a draw). qD1's step 1 uses line already reads the moved order on the board, as the build does.
- The device check (D-20) still has to confirm focus after a Move and a remove on the iPad; the WebKit runs here are desktop WebKit with a touch press and a keyboard press.

## Next Phase Readiness

Plan 11-09 (the Save gate) can read `rowLines` for the per-line grams refusals; plan 11-10's reopened editor mounts the same `CreationPage` handlers over a stored version, so remove, move and Add to step work on a saved first version through the same code. The walk baseline is unchanged from plan 11-07.

## Self-Check: PASSED

- Files found: app/src/ui/CreationSteps.jsx, app/src/ui/IngredientTable.jsx, app/src/ui/CreationPage.jsx, app/src/styles/notebook.css, app/src/ui/CreationStructure.test.jsx, app/src/ui/IngredientTable.creating.test.jsx, app/src/ui/CreationFlow.test.jsx, .planning/phases/11-steps-structure-save-and-print/11-board-structure.mjs, .planning/phases/11-steps-structure-save-and-print/11-board-steps.mjs.
- Commits found: 6fdd1cc9, 3fe7d015, 610096ba.
