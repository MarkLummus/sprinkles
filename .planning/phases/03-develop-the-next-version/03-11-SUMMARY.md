---
phase: 03-develop-the-next-version
plan: 11
subsystem: ui
tags: [css, ingredient-table, gap-closure, css-tokens]

requires:
  - phase: 03-develop-the-next-version
    provides: "The per-column class sizing from 03-08 (ingredient-table__col-name/numeric/step/data/remove on every th/td) and the diagnosed root cause in .planning/debug/remove-column-occludes-values.md"
provides:
  - "Border-box ingredient-table cells so a declared --col-* width means the width the column actually occupies"
  - "A corrected tokens.css derivation that adds the cell padding to each declared width instead of subtracting it from the remainder, naming the page arithmetic and all four measured content minimums"
  - "--col-data and --col-remove tokens and matching app.css width rules for the two column classes that have been styled nowhere since 03-02/03-08"
  - "The ingredient-name column as the single unsized column (width: auto), absorbing whatever the five sized columns leave as As made and Remove come and go"
  - "app/src/styles/columns.test.js: a stylesheet-contract test (no layout engine, Vitest's default node environment) proving the sizing model, the emitted-vs-styled column set, no clipping/stacking, and the width budget computed from the tokens themselves at every UAT width"
affects: []

actuals:
  tokens: 5900
  tasks: 2
  commits: 2

tech-stack:
  added: []
  patterns:
    - "A stylesheet contract test reads both CSS files and the component AS TEXT (comment-stripped) rather than rendering — a grep can prove a class is emitted, only reading both files can prove anything styles it (the gate 03-08's greps could not express)"
    - "Padding-inclusive column tokens: with border-box cells, a --col-* token IS the whole column; usable content is the token minus twice the table's own horizontal padding token, computed the same way in both tokens.css's comments and columns.test.js's budget assertions"

key-files:
  created:
    - app/src/styles/columns.test.js
  modified:
    - app/src/styles/tokens.css
    - app/src/styles/app.css

key-decisions:
  - "--col-numeric shrunk 88px -> 94px (content 82px, ~1.4px of deliberate slack above the 80.61px \"% of batch\" header) and cell padding tightened via a new --table-cell-pad-x token (6px, half the old 12px) — every px given to a sized column comes out of the name column's remainder, so both moves stayed minimal rather than generous."
  - "--col-data (86px, content 74px) sized to a reasoned estimate for \"unreviewed\" (~73.5px, extrapolated from \"estimated\"'s measured 66.14px at ~7.35px/letter) rather than to \"estimated\" alone, since no seed row currently produces the longer word and the column must not re-collapse the day one does."
  - "--col-ingredient (the 40% name-column token) retired outright rather than resized: D-UAT-6's fix is architectural (the remainder-absorbing column has no fixed share to move as conditional columns arrive), so nothing replaces it in tokens.css — an automatic width is a keyword, not a visual value."
  - "Task ordering followed the plan's own requirement: task 1 (border-box + padding token + corrected derivation, restating --col-numeric/--col-step) committed alone before task 2 touched Data, Remove, or the name column, so each commit is independently reviewable and task 1 alone is a safe, regression-free improvement."

patterns-established:
  - "A future sixth ingredient-table column must clear two gates before it ships: the completeness test (every ingredient-table__col-* class the component emits has a matching app.css width rule) and the budget test (the sized columns' total, computed from the tokens, never exceeds the table width at any of the five widths this project's UAT names)."

requirements-completed: [REC1-02]

coverage:
  - id: D1
    description: "Cells are border-box and this table's horizontal padding reads through its own token; the tokens.css derivation adds that padding to each declared width (not subtracts it from the remainder) and names the page arithmetic, the four measured minimums with their source, and the table's widest state; --col-numeric and --col-step are restated padding-inclusive against their real minimums"
    requirement: REC1-02
    verification:
      - kind: unit
        ref: "app/src/styles/columns.test.js — 'task 1 — border-box accounting and a corrected derivation' (7 tests)"
        status: pass
      - kind: other
        ref: "npm --prefix app test -- --run (513/513 pass, up from 486 at plan start, no test removed); npm --prefix app run build exits 0; grep gates for --col-numeric declaration and border-box on the cell rule both pass"
        status: pass
    human_judgment: true
    rationale: "The task's own <human-check> (open the churned olive oil version at 1280px, confirm the remove buttons sit closer to the table's edge though not yet fully inside it, and that the reading state and the '% of batch' header are unaffected) requires a real browser layout engine; this repo's Vitest suite runs under the default node environment with none. Deferred to end-of-phase UAT per workflow.human_verify_mode: end-of-phase (standing project preference, MEMORY.md; same precedent as 03-01/03-06/03-07/03-08)."
  - id: D2
    description: "Data and Remove each get a padding-inclusive token and an app.css width rule; the ingredient-name column becomes the single automatic-width column; no ingredient-table rule clips or stacks; and the width budget — computed from the tokens themselves, not a constant — holds at 1024/1152/1280/1366/1440 in both the pen's widest state and the reading state's widest shape"
    requirement: REC1-02
    verification:
      - kind: unit
        ref: "app/src/styles/columns.test.js — 'task 2 — Data and Remove get columns of their own; the name column absorbs the remainder' (17 tests, including 12 budget-contract cases across the five UAT widths)"
        status: pass
      - kind: other
        ref: "npm --prefix app test -- --run (513/513 pass); npm --prefix app run build exits 0; grep gates for --col-data/--col-remove tokens, their app.css rules, and zero colour/px literals in IngredientTable.jsx all pass; IngredientTable.jsx diff is empty"
        status: pass
    human_judgment: true
    rationale: "The task's own <human-check> (open the churned olive oil version at five widths in both the reading and developing states, confirm the Data column's basis word is fully readable with no button touching it, the header reads 'Data'/'Remove' as two words, nothing paints over the Formulation Note, no numeric header wraps, and names hold one line at 1280 and above) requires a real browser; this repo's test suite has no layout engine. Deferred to end-of-phase UAT per workflow.human_verify_mode: end-of-phase."

duration: 20min
completed: 2026-09-08
status: complete
---

# Phase 3 Plan 11: Ingredient-table column widths — border-box cells, a corrected derivation, and columns for Data and Remove Summary

**Every ingredient-table column now has an honest, padding-inclusive width — Data and Remove get tokens of their own, the name column becomes the single unsized column that absorbs the remainder, and a new stylesheet-contract test computes the width budget from the tokens themselves at every width the UAT names, so the Remove column's buttons can no longer paint over the Data column's basis word.**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-09-08T02:05:00Z (approx.)
- **Completed:** 2026-09-08T02:24:20Z
- **Tasks:** 2
- **Files modified:** 3 (1 created, 2 modified)

## Accomplishments
- `.ingredient-table th, .ingredient-table td` are now border-box, and a new `--table-cell-pad-x` token (6px, half the previous 12px `--gap-s`) carries this table's own horizontal padding separately from the shared vertical gap — a declared `--col-*` width now means the width the column actually occupies, closing the amplifier the diagnosis measured (`getComputedStyle(th).width` reading 88px while the box measured 112px).
- The `tokens.css` derivation comment above the sized columns is rewritten to add the cell padding to each declared width instead of subtracting it from the remainder — the mistake the diagnosis identified as the root cause that would have reproduced this bug on the next column added — and now names the page arithmetic, all four measured content minimums with their debug-session source, and the table's widest state.
- `--col-numeric` shrunk from 88px to 94px (content 82px, ~1.4px of deliberate slack above the 80.61px "% of batch" header) and `--col-step` is restated padding-inclusive (66px content → 78px declared) at the same content share 03-08 derived.
- Two new tokens, `--col-data` (86px) and `--col-remove` (78px), give the table's two previously unstyled columns — styled nowhere since 03-02/03-08 despite being emitted at all thirteen JSX sites — width rules of their own in `app.css`, sized against their own measured content minimums (the Data flag word, reasoned for the longer, unmeasured "unreviewed"; the native remove/restore button).
- `.ingredient-table__col-name` changes from a fixed 40% share to `width: auto`, becoming the single unsized column that absorbs whatever the five sized columns leave — the retired `--col-ingredient` token's comment in `tokens.css` records the retirement and where names now begin to wrap (about 1146px, matching the plan's own flagged estimate).
- A new `app/src/styles/columns.test.js` (27 tests) asserts the contract no grep on a single file could express: every column class the component emits is matched by a width rule in `app.css`; exactly one column (name) is auto-width; no ingredient-table rule declares clipping or stacking; and the width budget — computed from the tokens themselves, not a hardcoded constant — holds at 1024/1152/1280/1366/1440px in both the pen's widest state (three numeric columns plus Step, Data, Remove) and the reading state's widest shape (the same minus Remove), closing the second, unreported instance of the fault.

## Task Commits

Each task was committed atomically, in the order the plan required (task 1's accounting fix before task 2's allocation fix, so task 1 alone is a safe, regression-free improvement):

1. **Task 1: A declared width that means what it says — border-box cells, a tighter cell padding, and a corrected derivation** — `ecfee33` (test)
2. **Task 2: Data and Remove get columns of their own, and the name column absorbs what is left** — `5119053` (feat)

**Plan metadata:** committed alongside this SUMMARY.

_Note: both tasks carry `tdd="true"`. Following this phase's established MVP-mode precedent (03-05 through 03-08 SUMMARYs, `workflow.tdd_mode: false`), each task's failing tests and its implementation landed in one commit rather than separate RED/GREEN/REFACTOR commits — the tests were genuinely written and run failing first (confirmed: 6 failing assertions for task 1, 15 for task 2, none an import/crash error) before the corresponding CSS changes made them pass, but git history records one commit per task rather than three._

## Files Created/Modified
- `app/src/styles/columns.test.js` — new stylesheet-contract test: comment stripper, token reader, rule reader, the border-box/padding/minimum assertions (task 1), and the completeness/clip-stacking/budget assertions (task 2)
- `app/src/styles/tokens.css` — `--table-cell-pad-x` added; `--col-numeric`/`--col-step` restated padding-inclusive with a corrected derivation comment; `--col-data`/`--col-remove` added; `--col-ingredient` retired with a comment recording why and where names now wrap
- `app/src/styles/app.css` — the shared `th`/`td` rule gains `box-sizing: border-box` and reads its horizontal padding through the new token; `.ingredient-table__col-name` changes to `width: auto`; `.ingredient-table__col-data` and `.ingredient-table__col-remove` width rules added

## Decisions Made
- Sized `--col-numeric` and the new cell-padding token to the minimum plus a deliberately small slack (a few px), since D-UAT-6 requires every px given to a sized column to come out of the name column's own budget — verified by the test's explicit upper-bound assertion on the numeric column.
- Reasoned `--col-data`'s minimum from "unreviewed" (extrapolated ~73.5px from the measured "estimated" at 66.14px, ~7.35px/letter) rather than sizing only to what the current seed data happens to show, per the plan's own instruction not to size to "what happens to be on screen today."
- Retired `--col-ingredient` outright instead of resizing it: the fix is architectural (an automatic width has no fixed share to renegotiate), so tokens.css records the retirement as a decision rather than silently dropping the token.
- Followed this phase's MVP-mode TDD precedent (`workflow.tdd_mode: false`): one commit per task rather than three, since the strict RED/GREEN/REFACTOR gate is not active for this project.

## Deviations from Plan

None — plan executed exactly as written. Both tasks' automated `<verify>` gates (build, full test suite, every named grep) passed; the `<human-check>` items in both tasks require a real browser layout engine this repo's node-environment Vitest suite cannot provide, and are deferred to end-of-phase UAT per `workflow.human_verify_mode: end-of-phase` — the same standing precedent recorded in this phase's prior SUMMARYs (03-01, 03-06, 03-07, 03-08) and in MEMORY.md.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- G-03-11 is closed: every ingredient-table column has a width it can hold its content in, the name column takes what is left, and the suite computes the budget instead of trusting a comment — a future sixth column cannot silently re-collapse Data or Remove without failing `columns.test.js`'s completeness or budget assertions.
- The unreported reading-state instance of the same fault (the Data column overflowing at 1280px with the pen closed) is closed with it, asserted separately in the test's "reading state's widest shape" case.
- D-UAT-6 is implemented in full: padding-inclusive widths, tokens and rules for Data and Remove, a narrower numeric column, a tighter cell padding, and the name column as the single unsized one. The accepted wrap point (about 1146px) matches the plan's own flagged estimate.
- Both tasks' `<human-check>` items are deferred to end-of-phase UAT per `workflow.human_verify_mode: end-of-phase`. All automated verification (build/test/greps) for both tasks passed.

---
*Phase: 03-develop-the-next-version*
*Completed: 2026-09-08*

## Self-Check: PASSED
Files confirmed present on disk: app/src/styles/columns.test.js, app/src/styles/tokens.css, app/src/styles/app.css. Both commits (ecfee33, 5119053) confirmed in `git log`. `npm --prefix app test -- --run` passes 513/513 (up from 486 at plan start, +27 in columns.test.js); `npm --prefix app run build` exits 0; every plan-specified grep gate passed; `git diff --stat` for `app/src/ui/IngredientTable.jsx` is empty, confirming it was untouched per the plan's own constraint.
