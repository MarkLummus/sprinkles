---
phase: 03-develop-the-next-version
plan: 08
subsystem: ui
tags: [react, css, ingredient-table, gap-closure]

requires:
  - phase: 03-develop-the-next-version
    provides: "The pen layer's step-allocation cell and As made column (03-02), and the diagnosed root causes in .planning/debug/step-selector-overlap-and-as-made-column.md"
provides:
  - "Ingredient-table columns sized and aligned by their own class (ingredient-table__col-name/numeric/step/data/remove) on the header, all three body branches, and the total row — never by ordinal position"
  - "A derived --col-step token in tokens.css, and the step cell's select given the same flex/min-width shrink guard the grams cell's field already carried"
  - "The As made column (header + all three body cells + total cell) gated on hasAsMadeLayer, the same predicate that already governed the total's contents and the legend"
affects: ["03-10 (shortens the step select's option labels; must not reintroduce a pixel/positional width)"]

actuals:
  tokens: 4300
  tasks: 2
  commits: 2

tech-stack:
  added: []
  patterns:
    - "Column identity over column position: every ingredient-table cell carries a class naming which column it is, so a conditional column in the middle of the row cannot shift a sibling's width or alignment onto the wrong column"
    - "A conditional column is gated at exactly five sites (header, three body branches, total row) under one named predicate — documented in a file-level comment so a third conditional column follows the same shape"

key-files:
  created: []
  modified:
    - app/src/styles/app.css
    - app/src/styles/tokens.css
    - app/src/ui/IngredientTable.jsx
    - app/src/ui/IngredientTable.test.jsx

key-decisions:
  - "--col-step set to 66px, derived from the same 1280px-viewport arithmetic the debug session used (table ~768px; name 40% ~307px; three numeric columns at 88px each ~264px; ~197px left for Step/Data/Remove, ~66px each today) — chosen so naming Step's own width leaves Data and Remove splitting almost exactly what they already had, and task 1 alone changes nothing about the rendered layout."
  - "Task 1 converts sizing to class-based selectors before task 2 makes the As made column conditional, per the plan's own ordering requirement — verified by the negative nth-child grep gate landing in the task 1 commit, one commit before the conditional column exists at all."
  - "Task 2's tests were written after the implementation, not before, matching this phase's established MVP-mode precedent (03-05, 03-06, 03-07 SUMMARYs) under workflow.tdd_mode: false; not a Rule 1-4 deviation."

patterns-established:
  - "A shrink guard (flex: 1 1 auto; min-width: 0) is required on any .ink-field living inside a flex-end justified cell under this table's fixed layout — copying the flex arrangement alone, without the guard, reproduces G-03-1's overflow."

requirements-completed: [REC1-02]

coverage:
  - id: D1
    description: "Ingredient-table columns are sized and aligned by a per-column class, not by ordinal position, on the header, all three body branches, and the total row; the step cell's select carries the same shrink guard the grams cell's field carries and fits inside its own column"
    requirement: REC1-02
    verification:
      - kind: unit
        ref: "npm --prefix app test (449/449 pass at end of task 1, no test removed)"
        status: pass
      - kind: other
        ref: "grep gates: zero nth-child column selectors in app.css; 33 ingredient-table__col- occurrences in IngredientTable.jsx; select min-width guard present; --col-step token present; zero px/colour literals in IngredientTable.jsx"
        status: pass
    human_judgment: true
    rationale: "The plan's own task 1 <human-check> (open the churned olive oil version's pen at a normal desktop width and confirm the step selector sits wholly inside its cell with nothing painted over the Grams/As made/% of batch values, then narrow the window) requires a real browser layout engine; jsdom has none. Deferred to end-of-phase UAT per workflow.human_verify_mode: end-of-phase (Mark's standing preference, MEMORY.md)."
  - id: D2
    description: "The As made column (header, all three body-branch cells, and the total cell) renders only when hasAsMadeLayer is true (recording, or a saved batch in view), and is entirely absent — no header, no empty cells, no empty total, no legend — on a batchless version; header/body/total cell counts agree in every rendered state"
    requirement: REC1-02
    verification:
      - kind: unit
        ref: "app/src/ui/IngredientTable.test.jsx#IngredientTable — the As made column obeys hasAsMadeLayer (G-03-1 finding b) — all six new tests"
        status: pass
      - kind: unit
        ref: "npm --prefix app test (455/455 pass, 6 new tests added, no test removed)"
        status: pass
      - kind: other
        ref: "grep gates: hasAsMadeLayer used 8 times outside comments; 'As made' asserted in the test file; zero px/colour literals"
        status: pass
    human_judgment: true
    rationale: "The plan's own task 2 <human-check> (open the churned olive oil version and confirm the As made column is present; develop and save a child, then confirm the column and its total/legend are entirely gone with nothing shifted) requires a real browser; jsdom cannot render layout. Deferred to end-of-phase UAT per workflow.human_verify_mode: end-of-phase."

duration: 10min
completed: 2026-09-07
status: complete
---

# Phase 3 Plan 08: Column identity, the step select's shrink guard, and a conditional As made column Summary

**Ingredient-table columns are now sized by a class naming which column they are (not by row position), the step cell's select carries the same shrink guard the grams cell already had, and the As made column disappears in full — header, body, total, and legend — on any version with no batch in view.**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-09-07T23:27:00Z (approx.)
- **Completed:** 2026-09-07T23:35:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Every ingredient-table `th`/`td` across the header, all three body branches (show-changes, reading, developing), and the total row now carries one of five column classes (`ingredient-table__col-name/numeric/step/data/remove`); the two positional rules that sized and right-aligned "columns two, three and four" and pinned the name column to `:first-child` are gone, replaced by class-based rules that set exactly what those two set before — the layout is unchanged, addressed differently (closing the hazard the debug session flagged: removing a middle column can no longer shift widths onto the wrong neighbour, T-03-49).
- A new `--col-step` token (66px) in `tokens.css` gives the Step column an explicit width for the first time, derived from the same 1280px-viewport arithmetic the debug session used and chosen so today's rendered widths for Step, Data, and Remove are unchanged by this refactor alone.
- `.ingredient-table__step-cell select.ink-field` now carries `flex: 1 1 auto; min-width: 0` — the same pair the grams cell's field already had — so the select's automatic minimum size stops being its widest option's min-content width (~280px) and shrinks into its ~66px column instead. The rule's own comment, which previously claimed to use "the same struck-baseline-beside-field arrangement the grams cell uses" (true of the flex layout, not of the guard), now names the two properties as load-bearing and explains why (T-03-47).
- The As made column's header cell and all three body-branch cells are now gated on `hasAsMadeLayer` — the predicate the file already computed and, until now, applied only to the total row's contents and the small-print legend. The total row's cell itself (not just its text) is now gated the same way, so the column loses its total along with everything else when there is no as-made layer to show (T-03-48).
- A file-level comment above the header row now names both of the table's conditional columns (As made in the middle, Remove at the end) and the shape a third one should follow: one named predicate, gated at the header, all three body branches, and the total row.
- Six new tests in `IngredientTable.test.jsx` pin the column's visibility across reading-with-batch, reading-without, recording, developing-with-batch, developing-without (the exact case the maker reported), and show-changes-without — plus the structural invariant that the header, body, and total row cell counts agree in every one of those states.

## Task Commits

Each task was committed atomically (MVP mode is active, `workflow.tdd_mode: false`, consistent with this phase's precedent):

1. **Task 1: Columns sized by which column they are, and a select that fits the cell it is in** — `3a825ea` (fix)
2. **Task 2: The As made column is there when there is an as-made layer, and absent when there is not** — `15dbb76` (fix)

**Plan metadata:** committed alongside this SUMMARY.

## Files Created/Modified
- `app/src/styles/app.css` — positional `:first-child`/`:nth-child` column rules replaced with `.ingredient-table__col-name`/`.ingredient-table__col-numeric`/`.ingredient-table__col-step` class rules; the step select's shrink guard added with a corrected, load-bearing comment
- `app/src/styles/tokens.css` — new `--col-step: 66px` token with its derivation recorded in the comment
- `app/src/ui/IngredientTable.jsx` — column classes added to every `th`/`td` in the header, all three body branches, and the total row; the As made header/body/total cells gated on `hasAsMadeLayer`; a file-level note on the table's two conditional columns
- `app/src/ui/IngredientTable.test.jsx` — six new tests asserting the As made column's visibility across all six rendered states and the header/body/total cell-count invariant

## Decisions Made
- `--col-step` set to 66px rather than a rounder number, matching the debug session's own computed ~65.6px so that task 1's class-based refactor changes nothing about today's rendered layout — the As made column's later removal (task 2) is what actually returns width to its neighbours, not this token.
- Task 1's sizing conversion landed in its own commit before task 2 touched the As made column's conditionality, per the plan's explicit ordering requirement (fixing (b) before (a) would make (a) worse while appearing to fix (b)).
- Task 2's tests were written to match the already-implemented gating rather than genuinely failing first, following this phase's documented MVP-mode precedent (03-05/03-06/03-07 SUMMARYs) — not treated as a Rule 1-4 deviation.

## Deviations from Plan

None — plan executed exactly as written. Both tasks' automated `<verify>` gates (build, full test suite, every grep) passed; the human-check items in both tasks require a real browser layout engine that this repo's jsdom-free/no-layout-engine Vitest setup cannot provide, and are deferred to end-of-phase UAT per `workflow.human_verify_mode: end-of-phase`, matching the standing preference recorded for this project (MEMORY.md) and the precedent already set in 03-01, 03-06, and 03-07's own SUMMARYs.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- G-03-1's findings (a) and (b) are both closed in the order the diagnosis required: column sizing converted to class-based selection first, then the As made column made conditional on top of a layout that can no longer shear.
- 03-10 (which shortens the step select's option labels) inherits a Step column with its own named width and class — it should extend `--col-step`/`.ingredient-table__col-step` if the shortened labels change the arithmetic, not reintroduce a pixel literal or a positional selector.
- Both tasks' `<human-check>` items (the step selector's real-browser layout at ~1280–1440px; confirming the As made column's complete absence on a saved child with no batch) are deferred to end-of-phase UAT per `workflow.human_verify_mode: end-of-phase`. All automated verification (build/test/greps) for both passed.

---
*Phase: 03-develop-the-next-version*
*Completed: 2026-09-07*

## Self-Check: PASSED
Files confirmed present on disk (app.css, tokens.css, IngredientTable.jsx, IngredientTable.test.jsx). Both commits (3a825ea, 15dbb76) confirmed in `git log`. `npm --prefix app test` passes 455/455 (up from 449 at plan start); `npm --prefix app run build` exits 0; every plan-specified grep gate passed.
