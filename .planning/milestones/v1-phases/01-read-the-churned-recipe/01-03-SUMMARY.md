---
phase: 01-read-the-churned-recipe
plan: 03
subsystem: recipe-read
tags: [react, vitest, domain-math, svg, design-tokens]

requires:
  - phase: 01-02
    provides: "The direction contract, tokens.css, and the recipe page's reserved formulation-note region"
provides:
  - "The framework-free figures module (buildFigures, describeDeviation, FIGURE_SPECS) computing the six balance figures, their authored bands, and their deviation in words, with basis and estimated-row tracking per figure"
  - "GraduatedRule: one figure's printed scale, its authored band as a hatch (omitted entirely when none was authored), a tick, and the deviation in words — no colour literal, no font-family declaration"
  - "FormulationNote: the six rules under the ingredient table, in fixed order, with the milkfat/added-fat breakdown under the total fat rule"
  - "BasisNote: the one small-print note stating the coefficient set, both conventions, and the estimated rows, all derived from the domain modules"
affects: ["01-04", "phase-02-batch-record", "phase-03-develop-next-version"]

actuals:
  tokens: 8600
  tasks: 3
  commits: 4

tech-stack:
  added: []
  patterns:
    - "Figure descriptors are the only interface between domain math and the UI: FormulationNote and BasisNote call buildFigures and render its output, computing nothing of their own"
    - "SVG rule weights mirror the direction contract's named tokens as plain numeric constants (SVG presentation attributes read user-space units, not CSS lengths); only colour is threaded through as a CSS custom property (var(--ink))"
    - "Band presence is a key-presence branch (Object.prototype.hasOwnProperty on version.targets), never a value-truthiness branch — an authored [0, 0] band and an absent band stay distinguishable end to end"

key-files:
  created:
    - app/src/domain/figures.js
    - app/src/domain/figures.test.js
    - app/src/ui/GraduatedRule.jsx
    - app/src/ui/FormulationNote.jsx
    - app/src/ui/BasisNote.jsx
  modified:
    - app/src/ui/RecipePage.jsx
    - app/src/styles/app.css

key-decisions:
  - "Fixed two arithmetic inconsistencies in the plan's own describeDeviation behavior examples before writing the RED test (Rule 1): '20.5 vs band [16,20] -> 4.5% above 20%' is impossible (20.5-20=0.5, not 4.5) and was corrected to value 24.5, which the plan's own template reproduces exactly; '15.4 vs band [12,16] -> 0.6 below 16' pairs a value inside [12,16] with wording only the [16,20] band's lower edge produces, and was corrected to band [16,20]. Both fixes are documented inline in figures.test.js and verified against the general amount = |value - nearest bound| algorithm the plan's other three examples (22, 26, 27.4) already establish."
  - "PAC_LACTOSE is threaded into BasisNote's PAC-reference sentence (not just LACTOSE_FRACTION_OF_MSNF) to satisfy D-11's four-element small print with both cited domain constants, rather than only reusing COEFFICIENT_SET's pre-written display strings — keeps the note's numbers traceable to the constants the math actually uses, not just to a string composition.js happens to already contain."
  - "Rule stroke weights (baseline, graduation, band edge, tick, hatch) are local numeric constants in GraduatedRule.jsx rather than CSS var() references, because SVG presentation attributes read plain user-space numbers, not CSS px lengths; only stroke colour reads var(--ink) since colour literals are what the contract and threat model actually forbid."

patterns-established:
  - "A figure descriptor (key, label, unit, decimals, domain, value, band, deviation, contributorRowIds, basis, estimatedRowNames) is the stable contract between figures.js and every consuming component; plan 01-04's trace-to-contributors interaction reads contributorRowIds and basis from this same shape without new domain code."

requirements-completed: [REC1-01, FORM1-01]

coverage:
  - id: D1
    description: "buildFigures returns the six balance figures for the churned version, matching the printed sheet within 0.1, each with its band read only from version.targets and its deviation stated in words; degenerate inputs (zero rows, one row, reversed row order) behave as specified"
    requirement: "FORM1-01"
    verification:
      - kind: unit
        ref: "app/src/domain/figures.test.js#buildFigures — seeded olive oil version"
        status: pass
      - kind: unit
        ref: "app/src/domain/figures.test.js#buildFigures — degenerate inputs"
        status: pass
      - kind: unit
        ref: "app/src/domain/figures.test.js#describeDeviation"
        status: pass
    human_judgment: false
  - id: D2
    description: "The recipe page renders six graduated rules in fixed order (PAC, POD, Total fat, MSNF, Sugar solids, Total solids), each with the label, value, printed scale, authored band as a hatch (or no band element at all for sugar solids), tick, and deviation words; the total fat rule additionally shows milkfat, added fat, and the added-fat share of fat; no figure carries a colour literal or a verdict"
    requirement: "FORM1-01"
    verification:
      - kind: other
        ref: "npm --prefix app run build; npm --prefix app test (57 passing)"
        status: pass
      - kind: other
        ref: "grep -rIcE '#[0-9a-fA-F]{3,8}' app/src/ui/GraduatedRule.jsx app/src/ui/FormulationNote.jsx (0 matches)"
        status: pass
      - kind: other
        ref: "renderToStaticMarkup(<FormulationNote version={oliveOilVersion} />) inspected directly during execution — six rule blocks in order, sugar solids emits no <defs>/<rect>/band-edge <line> at all, fat breakdown text 'Milkfat 13.0% and added fat 5.0% — 28% of fat.'"
        status: pass
    human_judgment: true
    rationale: "The plan's own <verify> block defers the full visual read (hatch legibility, no colour used as a verdict, layout under the ingredient table) to a <human-check> harvested at end-of-phase per workflow.human_verify_mode=end-of-phase; every mechanically checkable fact behind it (exports, exact rendered markup and text via renderToStaticMarkup, absence of band elements for the null-band figure, absence of colour/font-family literals) is confirmed above."
  - id: D3
    description: "One basis note under the formulation block states the coefficient set, PAC-relative-to-sucrose convention, the lactose-as-54.5%-of-MSNF convention, and the version's estimated rows (whole milk, heavy cream, allulose, fine sea salt) — all four elements derived from the domain modules, none typed as a fixed list"
    requirement: "REC1-01"
    verification:
      - kind: unit
        ref: "grep -c COEFFICIENT_SET / LACTOSE_FRACTION_OF_MSNF / PAC_LACTOSE app/src/ui/BasisNote.jsx (all >=1); grep -rIl dangerouslySetInnerHTML app/src (0 matches)"
        status: pass
      - kind: other
        ref: "renderToStaticMarkup(<BasisNote version={oliveOilVersion} />) inspected directly during execution — exact strings 'coefficient set 2026.1 (slice transcription)', 'PAC relative to sucrose = 100', '54.5% of MSNF', and 'Whole milk, Heavy cream, Allulose, and Fine sea salt are estimated' all present"
        status: pass
    human_judgment: false

duration: 5min
completed: 2026-09-06
status: complete
---

# Phase 1 Plan 3: The Formulation Note, Six Balance Figures, and the Basis They Rest On Summary

**Framework-free figures module (buildFigures, describeDeviation, FIGURE_SPECS) driving six graduated-rule components and one basis note, reproducing the churned olive oil sheet's PAC 24.1, POD 13.0, fat 18.0%, MSNF 8.5%, sugar 13.5%, and solids 40.8% each against its authored band, with no colour ever carrying a verdict.**

## Performance

- **Duration:** 5 min
- **Started:** 2026-09-05T22:22:56-04:00
- **Completed:** 2026-09-05T22:27:31-04:00
- **Tasks:** 3
- **Files modified:** 7 (5 created, 2 modified)

## Accomplishments
- Built the figures module: six ordered descriptors with value, authored band, deviation in words, contributor rows, and worst-basis tracking, computing nothing `computeBalance`/`weakestBasis` already compute (Task 1, TDD)
- Proved the band-absent path is a key-presence branch, not a value-truthiness one — the sugar solids figure's `band` is genuinely `null`, never a synthesized zero-width range (D-10)
- Built `GraduatedRule` and `FormulationNote`: six rules read under the ingredient table in fixed order, each stating its deviation in words, with the sugar solids rule drawing no band element at all and the total fat rule showing milkfat/added-fat/added-fat-share beneath it (Task 2)
- Built `BasisNote`: one small-print note naming the coefficient set, both conventions, and the four estimated rows (whole milk, heavy cream, allulose, fine sea salt) — all four elements derived from `COEFFICIENT_SET`, `LACTOSE_FRACTION_OF_MSNF`, `PAC_LACTOSE`, and the figures' own `estimatedRowNames`, none typed as a fixed list (Task 3)

## Task Commits

Each task was committed atomically:

1. **Task 1: The figures module — six descriptors, their bands, and their deviation in words** (TDD)
   - `e9e6fa2` (test) — failing tests for FIGURE_SPECS, buildFigures against the seeded version, describeDeviation in isolation, and degenerate inputs
   - `a3d6548` (feat) — implemented FIGURE_SPECS, describeDeviation, buildFigures
2. **Task 2: The formulation note — six graduated rules under the table** — `a276f16` (feat)
3. **Task 3: The basis note — what the figures rest on, in small print** — `036380d` (feat)

**Plan metadata:** committed separately after this summary.

## Files Created/Modified
- `app/src/domain/figures.js` — `FIGURE_SPECS`, `describeDeviation`, `buildFigures`; framework-free, no DOM, no store import
- `app/src/domain/figures.test.js` — band-edge, above/below, absent-band, near-boundary-rounding, and degenerate-input coverage (29 tests)
- `app/src/ui/GraduatedRule.jsx` — one figure's printed scale, band hatch (or none), tick, and deviation words; no colour literal, no font-family declaration
- `app/src/ui/FormulationNote.jsx` — renders `buildFigures(version)` in order; the fat breakdown text under the total fat rule
- `app/src/ui/BasisNote.jsx` — the coefficient set, both conventions, and the estimated-rows clause, all derived
- `app/src/ui/RecipePage.jsx` — fills the reserved formulation-note region with `FormulationNote` and `BasisNote`
- `app/src/styles/app.css` — `.formulation-note__*`, `.graduated-rule__*`, and `.basis-note` rules, every value read through a `var(--…)` token

## Decisions Made
- Fixed two arithmetic inconsistencies in the plan's own `describeDeviation` behavior examples (see Deviations below) rather than encoding a mathematically impossible expectation into the test.
- Threaded `PAC_LACTOSE` (not just `LACTOSE_FRACTION_OF_MSNF`) into the basis note's PAC-reference sentence so both cited domain constants are load-bearing in the rendered text, not just imported for a grep check.
- Rule stroke weights are local numeric constants mirroring the direction contract's named tokens (SVG presentation attributes read user-space numbers, not CSS lengths); only stroke colour reads `var(--ink)`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Corrected an arithmetically impossible `describeDeviation` example in the plan's behavior spec**
- **Found during:** Task 1, writing the RED test
- **Issue:** The plan's behavior table pairs `value 20.5, band [16, 20]` with expected words `4.5% above 20%`. `20.5 - 20 = 0.5`, not `4.5` — the example cannot be produced by the amount-is-the-distance-to-the-nearest-bound algorithm every other example in the same table demonstrates (22/26 edge cases, 27.4 → `1.4 above 26`).
- **Fix:** Used `value 24.5` instead of `20.5` against the same band `[16, 20]`, which reproduces the plan's own expected words (`4.5% above 20%`) exactly under the correct algorithm. Documented inline in `figures.test.js`.
- **Files modified:** `app/src/domain/figures.test.js`
- **Verification:** `describeDeviation(24.5, [16, 20], 1, '%').words === '4.5% above 20%'` passes.
- **Committed in:** `e9e6fa2` (Task 1 RED commit)

**2. [Rule 1 - Bug] Corrected a band/value mismatch in a second `describeDeviation` example**
- **Found during:** Task 1, writing the RED test
- **Issue:** The plan pairs `value 15.4, band [12, 16]` with expected words `0.6 below 16`. `15.4` sits inside `[12, 16]` (it is not below the lower bound `12`), and the "below" wording template is `<amount> below <lo>` — which only produces `below 16` when `lo` is `16`, not `12`.
- **Fix:** Used band `[16, 20]` instead of `[12, 16]`, keeping value `15.4`, which reproduces the plan's expected words (`0.6 below 16`) exactly (`16 - 15.4 = 0.6`).
- **Files modified:** `app/src/domain/figures.test.js`
- **Verification:** `describeDeviation(15.4, [16, 20], 1, '').words === '0.6 below 16'` passes.
- **Committed in:** `e9e6fa2` (Task 1 RED commit)

---

**Total deviations:** 2 auto-fixed (both Rule 1 — corrections to internally inconsistent examples in the plan's own test specification, not to any implemented behavior). **Impact on plan:** Neither fix changed the implemented algorithm; both corrected which numeric example illustrates it, so the domain module's actual behavior matches every other example in the plan's table (band edges inside, amount = distance to nearest bound rounded to decimals, absent band branches on key presence). No scope creep.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Both requirements this plan shares with 01-01 (REC1-01) and 01-02 (FORM1-01, the plan's other requirement is standalone) are now ready: `gsd-tools requirements ready-ids` reports 2/2 ready to mark complete.
- The figure descriptor shape (`key, label, unit, decimals, domain, value, band, deviation, contributorRowIds, basis, estimatedRowNames`) is the stable contract plan 01-04's trace-to-contributors interaction reads from — no new domain code is needed to wire hover/focus highlighting of contributing rows.
- The formulation note and basis note are the phase's focal moment, now on screen; remaining phase work (per 01-CONTEXT.md) is the trace-to-contributors interaction itself (plan 01-04).
- FORM1-02 (the estimated/unreviewed flag on affected rows themselves, not just on the figures that rest on them) is not yet built — `IngredientTable.jsx` does not yet surface per-row basis. Confirm with plan 01-04 or a phase-close audit whether that row-level flag is in this phase's scope or deferred.

---
*Phase: 01-read-the-churned-recipe*
*Completed: 2026-09-06*

## Self-Check: PASSED

- All 7 key files verified present on disk (`[ -f ]`).
- All 4 commits verified in git log: `e9e6fa2`, `a3d6548`, `a276f16`, `036380d`.
- All acceptance criteria re-verified: `npm --prefix app test` reports 57 passing tests (≥35 and ≥28-baseline-plus-new required); `npm --prefix app run build` exits 0 ("built in" line present); `grep -c "no target set" app/src/domain/figures.test.js` = 4; hex-colour grep on `GraduatedRule.jsx`/`FormulationNote.jsx` = 0 matches; `dangerouslySetInnerHTML` grep on `app/src` = 0 matches; `COEFFICIENT_SET`/`LACTOSE_FRACTION_OF_MSNF`/`PAC_LACTOSE` each appear ≥1 time in `BasisNote.jsx`.
- Rendered markup inspected directly via `renderToStaticMarkup` during execution (not committed — scratch verification only): six rule blocks in fixed order, sugar solids emits zero band-related SVG elements, fat breakdown reads "Milkfat 13.0% and added fat 5.0% — 28% of fat.", basis note reads all four required D-11 elements verbatim.
