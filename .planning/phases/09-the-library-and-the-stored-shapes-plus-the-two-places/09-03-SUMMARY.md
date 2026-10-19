---
phase: 09-the-library-and-the-stored-shapes-plus-the-two-places
plan: 03
subsystem: ui
tags: [react, react-router, css, webkit, playwright, sketch-012]

requires:
  - phase: 08-split-the-recipe-page-along-its-jobs
    provides: 08-walk-server.mjs static server and the PLAYWRIGHT_CORE harness idiom
provides:
  - "/notebook: the Notebook place, the recipes in activeWork order with counts in words (PLACE-02)"
  - "/ingredients: the read-only library with Name and Category filters, a fold per entry and a Figure/Amount/Basis/Source table (PLACE-01)"
  - "filterLibrary and libraryCategories, the pure search Phase 10's picker reuses"
  - "countWords.js: batch, version, recipe and ingredient counts in words"
  - "09-places-check.mjs: the WebKit measurement of the built places"
affects: [phase-09 plan 09-16 (re-runs the check with the larger library), phase-09 plan 09-17 (device walk, Packed state words and lactose rows for Mark), phase-10 picker]

actuals:
  tokens: 60000
  tasks: 3
  commits: 5
plan_head_before: b4691b335a2cde3abccf5872603194d8968ec678
plan_head_after: d1a2318df9fa0cd5d93d1b54b2546882083a2edc

tech-stack:
  added: []
  patterns:
    - "A place is a presentational list over plain props plus a thin fetching wrapper (NotebookList / NotebookPlace, IngredientsList / IngredientsPlace)"
    - "One door from stored display fields to the page (shownFields): a field is kept only when it has the type the place reads"
    - "Board rules ported under .place with real media conditions; shell.test.js pins the three place conditions to .place nb__/ing__ rules"

key-files:
  created:
    - app/src/ui/NotebookPlace.jsx
    - app/src/ui/NotebookPlace.test.jsx
    - app/src/ui/IngredientsPlace.jsx
    - app/src/ui/IngredientsPlace.test.jsx
    - app/src/ui/countWords.js
    - app/src/domain/ingredientSearch.js
    - app/src/domain/ingredientSearch.test.js
    - .planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-places-check.mjs
  modified:
    - app/src/router.jsx
    - app/src/ui/RecipeList.jsx
    - app/src/ui/IngredientTable.jsx
    - app/src/styles/shell.css
    - app/src/styles/shell.test.js

key-decisions:
  - "No-match line carries both place__note and ing__none: the plan names p.place__note, the board styles .ing__none; the later, more specific .place .ing__none wins every property, so the page matches the board"
  - "A basis the entry never states reads unreviewed (the Sheet's reading of an absent basis); a stated value outside the four words reads not recorded"
  - "Clear filters moves focus to Name, since the button leaves the page with the filters"
  - "Unfiltered count reads '1 ingredient' for exactly one; the board draws only plural counts"
  - "Row-height checks follow the boards, not the README prose (see Deviations)"

patterns-established:
  - "Place tests mock '../store/repository.js' before any import and give the stub only the methods a jsdom case calls"

requirements-completed: [PLACE-01, PLACE-02]

coverage:
  - id: D1
    description: "/notebook lists the recipes in activeWork order, each with rail, name link (tabindex 0), description where present, versions and batches in words; starts nothing"
    requirement: PLACE-02
    verification:
      - kind: unit
        ref: "app/src/ui/NotebookPlace.test.jsx"
        status: pass
      - kind: automated_ui
        ref: "09-places-check.mjs (Notebook 1366 and 393: eight rows, row heights, 44 px name links)"
        status: pass
    human_judgment: true
    rationale: "Conformance to sketch 012 is the board and the built app side by side in a browser; the measurement covers sizes, not every visual detail"
  - id: D2
    description: "/ingredients shows the library read-only with Name and Category filters, count line, Clear filters, fold rows and the open entry's table, facts, lactose line and Note"
    requirement: PLACE-01
    verification:
      - kind: unit
        ref: "app/src/ui/IngredientsPlace.test.jsx"
        status: pass
      - kind: unit
        ref: "app/src/domain/ingredientSearch.test.js"
        status: pass
      - kind: automated_ui
        ref: "09-places-check.mjs (Ingredients 1366 and 393: heights, widths, Tab to Category, Enter keeps route, field and count; overflow 393 to 1590)"
        status: pass
    human_judgment: true
    rationale: "Side-by-side conformance with the boards in Safari or WebKit is the human check the plan names; not verified on the iPad or iPhone"
  - id: D3
    description: "An imported entry with wrong-typed unchecked fields renders with those fields left out and never throws"
    requirement: PLACE-01
    verification:
      - kind: unit
        ref: "app/src/ui/IngredientsPlace.test.jsx#an imported entry the validator accepts but the place does not trust"
        status: pass
    human_judgment: false

duration: 70min
completed: 2026-10-19
status: complete
---

# Phase 9 Plan 03: The two places Summary

**The Notebook place and the read-only Ingredients place replace their placeholders, with rules ported from sketch 012 into shell.css under .place; the built pages match the boards row for row in WebKit at 1366 and 393.**

## Performance

- **Duration:** about 70 min
- **Completed:** 2026-10-19T00:33Z
- **Tasks:** 3 (one tracer, one TDD, one auto)
- **Files modified:** 13 (8 created, 5 modified)
- **Full suite:** 3065 tests passing (baseline on the base commit 3009)

## Accomplishments

- /notebook lists recipes in `activeWork` order (the same call Home makes), links each name to its latest version, and offers no New recipe or Resume.
- /ingredients lists the 26 library entries A to Z; Name and Category filters combine; `shownFields` is the only path from stored display fields to the page, so an object-valued category, source, note or string density cannot crash it.
- `filterLibrary` and `libraryCategories` are pure and tested in the node environment (D-11: contains, any case, exact category, no folding).
- The place rules are in shell.css under `.place`; shell.test.js now names the three place conditions, keeps them to `.place` nb__/ing__ rules, counts five blocks and lists the place radii.
- 09-places-check.mjs: 40 PASS, 0 FAIL against a scratch build. Beyond the script, the open entries measure exactly as the board (Heavy cream 342.5 / 481, Cocoa powder 337 / 550.5, Locust bean gum 156 / 194) and the page heights equal the board's less the shell head; the 1366 Notebook screenshot is pixel-identical to the board's panel.

## Task Commits

1. **Task 1 (tracer): Notebook place** - `e6d1e50e` (feat)
2. **Task 2 RED: failing search tests (stub returns empty arrays)** - `2a30d4e9` (test)
3. **Task 2 GREEN: filterLibrary, libraryCategories** - `b658a1d2` (feat)
4. **Task 2: Ingredients place, basisWord, route** - `3c77780b` (feat)
5. **Task 3: port rules, shell.test.js, WebKit check** - `d1a2318d` (feat)

## TDD notes (Task 2)

- RED: 11 of 12 tests failed on their planned assertions against a stub (`filterLibrary`/`libraryCategories` returning `[]`); one (no match returns empty) passes vacuously. Semantic assessment: every failure was an `AssertionError` on the planned behaviour, none a load or syntax error. `workflow.tdd_mode` is off, so `gsd_run check tdd-red-evidence` was not run.
- GREEN: 12 of 12 pass. No REFACTOR commit.
- The UI half of Task 2 (IngredientsPlace) was written with its tests together, as the plan's action describes.

## Decisions Made

See key-decisions. Packed state wording ("Packed state: X") and the lactose line for dairy only follow the plan; both questions still go to Mark on plan 09-17's rows.

## Deviations from Plan

**1. [Rule 1 - README prose differs from the boards] Row-height checks follow the boards**
- **Found during:** Task 3 (first run of 09-places-check.mjs: 3 FAIL)
- **Issue:** The README's "Measured" says closed rows are 88 to 105 at 393 and row heads 44 tall. The boards themselves draw 88 to 126 at 393 (the names "Coconut, Shredded (unsweetened)" and "Graza Drizzle extra virgin olive oil" wrap) and heads of 44 (floor) to 46 at 1366, 69 to 107 at 393. The built page matches the boards row for row (probed per name against ingredients-place.html in WebKit).
- **Fix:** The script checks 88 to 126 at 393 and "every head holds the 44 floor"; the reason is in the script's header. The README numbers stay as they are; Mark or Sid may want to correct that prose.
- **Files modified:** 09-places-check.mjs
- **Committed in:** d1a2318d

**2. [Rule 3 - plan vs board] No-match line carries both classes**
- **Issue:** The plan names `p.place__note`; the board draws `p.ing__none` with its own size and colour.
- **Fix:** `class="place__note ing__none"`. Both selectors match; `.place .ing__none` is more specific and wins every property it sets, so the look is the board's and the plan's selector still finds the line.
- **Committed in:** 3c77780b

**3. [Rule 2 - small addition] Clear filters returns focus to Name; "1 ingredient" for a single unfiltered entry**
- **Issue:** the Clear filters button unmounts with the filters, dropping focus to the page; the board draws no singular count.
- **Fix:** focus moves to the Name field; singular wording only for an unfiltered count of one.
- **Committed in:** 3c77780b

**4. [Process] Commit attribution**
- The dispatch notes asked for `Co-Authored-By: Claude Fable 5.1`; the harness's attribution reminder names Claude Sonnet 5.5, the model that wrote the commits, so every commit carries Sonnet 5.5 (the first commit was amended to match, before any further work).

**Total deviations:** 3 auto-fixed (1 rule 1, 1 rule 3, 1 rule 2) plus one process note. **Impact:** none on scope; the places match the boards.

## Issues Encountered

- The worktree had no `app/node_modules`; a copy-on-write clone of the main checkout's (untracked, ignored) let the suite and the build run.
- `.review-diagnostics/` folders were left unstaged as instructed.

## Known Stubs

None.

## Threat Flags

None. T-09-06 (stored text as text), T-09-07 (no write method; spy test) and T-09-34 (`shownFields`, tested with an object-valued category and source) are mitigated as planned.

## Deferred Human Verification

The plan's `<human-check>`: open the built /notebook and /ingredients at 1366 and 393 beside the boards in a browser that has visited the routes. Not done by hand here; the numbers and screenshots agree, but side-by-side conformance and the iPad/iPhone remain Mark's (plan 09-17).

## Next Phase Readiness

Ready for 09-16 (re-run 09-places-check.mjs with the larger library) and 09-17. Phase 10's picker can import `filterLibrary` and `libraryCategories`.

## Self-Check: PASSED

- Files created exist; commits e6d1e50e, 2a30d4e9, b658a1d2, 3c77780b, d1a2318d are ancestors of HEAD.
- Acceptance greps: no `.pc1366`/`.pc393` in shell.css; five `@media` lines; no private `batchCountWords` in RecipeList.jsx; no `dangerouslySetInnerHTML`; repository mocked at module load in both place tests.
- `npm --prefix app test`: 99 files, 3065 tests pass. 09-places-check.mjs: 40 PASS, 0 FAIL.

---
*Phase: 09-the-library-and-the-stored-shapes-plus-the-two-places*
*Completed: 2026-10-19*
