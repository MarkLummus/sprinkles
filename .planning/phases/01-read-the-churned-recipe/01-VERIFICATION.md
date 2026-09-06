---
phase: 01-read-the-churned-recipe
verified: 2026-09-05T23:10:00Z
status: passed
score: 4/4 roadmap success criteria verified (all 3 requirements SATISFIED); 0 gaps found
behavior_unverified: 0
overrides_applied: 0
mvp_mode_note:
  guard_result: "gsd_run query user-story.validate returns valid:false for the literal ROADMAP Phase 1 Goal line (it is not written as 'As a X, I want Y, so that Z' — confirmed by the PLAN files' own provenance notes, which flag this three times and recommend running `/gsd mvp-phase 1`)."
  disposition: "Per gsd-core/references/verify-mvp-mode.md, this is surfaced as a discrepancy rather than silently coerced. Because ROADMAP.md already supplies four explicit, concrete, machine-checkable Success Criteria for this phase (the mandatory Step 2a roadmap contract), verification proceeded against those criteria instead of a fabricated User Flow Coverage table, which the reference itself says would be 'low-quality' against an ill-formed goal. This is a process/documentation gap, not a code defect — recommend running `/gsd mvp-phase 1` to formalize the ROADMAP Goal line before Phase 2."
human_verification:

  - test: "Open http://localhost/ after `npm --prefix app run dev`. Confirm the list shows one recipe (Olive Oil Ice Cream, 50 g oil · 800 g, 799.7 g); click through to /recipe/olive-oil-ice-cream-v1; reload twice and confirm still exactly one recipe."
    expected: "List renders the seeded recipe; navigation and reload behave as described; no duplicate seeding."
    why_human: "Visual rendering and reload persistence in a real browser/IndexedDB; not observable by static analysis."
  - test: "On /recipe/olive-oil-ice-cream-v1, read the page as a book spread: headnote, twelve-row ingredient table, ten numbered method steps with bold lead-ins and target chips (step 5 shows 69 °C, 40 min, 10–12 min), three carried-forward and two before-you-start notes under 'authored' legends, and an empty advisory slot."
    expected: "The spread reads as described, with no invented content in the advisory slot and no colour used as a status signal."
    why_human: "Visual composition, chip layout, and legend placement are not verifiable by grep or unit test."
  - test: "Beneath the ingredient table, read the six graduated rules: PAC, POD, Total fat (with milkfat/added fat breakdown and 28% of fat), MSNF, Sugar solids ('no target set', no band drawn), Total solids. Confirm hatched bands are legible and nothing is coloured red/green/amber or marked pass/fail."
    expected: "Six rules in fixed order, each stating its deviation in words; sugar solids shows no band; no colour carries a verdict."
    why_human: "Hatch-pattern legibility and 'no colour is a verdict' are visual judgments the plan's own verify block defers to a human check."
  - test: "Read the basis note under the six rules; confirm it names the coefficient set, both conventions, and the four estimated rows, and makes no claim about how the ice cream will turn out."
    expected: "One small-print note with the four required elements, factual tone only."
    why_human: "Tone/factuality judgment ('does not reassure, does not rate') is not mechanically checkable."
  - test: "Confirm the ingredient table's Data column shows the word 'estimated' on exactly four rows (whole milk, heavy cream, allulose, fine sea salt) and nothing on the other eight, visible without hovering or focusing anything."
    expected: "The word is visible at rest, not colour-only, not hover-only."
    why_human: "Visibility of text at rest vs. only-on-hover is a rendered-state check the plan defers to human verification."
  - test: "Tab through the page with the keyboard. Confirm all six figures take focus in visible order with a visible focus indicator. Focus PAC and confirm exactly seven rows are marked (whole milk, heavy cream, skim milk powder, sucrose, allulose, dextrose, fine sea salt); focus MSNF and confirm exactly three rows are marked. Confirm nothing on the page shifts by a pixel as focus changes."
    expected: "Keyboard-only operation reaches every figure in order; contributor marking matches the named row sets; no layout shift on focus change."
    why_human: "Keyboard tab order and pixel-identical layout across focus states require a real browser and cannot be confirmed by static analysis alone."
  - test: "Export the store from the recipe list, clear the browser's IndexedDB for the origin, reload (seed rewrites the recipe), then import the exported file and confirm the recipe reads identically (same twelve rows, same figures). Then edit the exported file so one row's grams is a quoted string and re-import; confirm the app refuses, names the offending row/field in words, and the store is left untouched."
    expected: "Round-trip export/import preserves the recipe exactly; a malformed import is refused with a named error and no partial write."
    why_human: "This is an end-to-end browser + IndexedDB + file-system interaction the plan's own verify block explicitly defers to a human check."
---

# Phase 1: Read the Churned Recipe Verification Report

**Phase Goal (ROADMAP.md, `mode: mvp`):** Maker can open the churned olive oil recipe in Sprinkles and read it whole — twelve ingredient rows, method, target bands, authored notes — with its balance figures and the basis they rest on.

**Verified:** 2026-09-05
**Status:** human_needed
**Re-verification:** No — initial verification

## MVP Mode Format Note

This phase is tagged `mode: mvp` in ROADMAP.md, which normally routes verification through the User Flow Coverage table (`gsd-core/references/verify-mvp-mode.md`), gated on the phase goal being written as "As a [role], I want to [capability], so that [outcome]."

Running the canonical guard against the literal ROADMAP Goal line:

```
gsd_run query user-story.validate --story "Maker can open the churned olive oil recipe in Sprinkles and read it whole — twelve ingredient rows, method, target bands, authored notes — with its balance figures and the basis they rest on."
→ valid: false ("Story must include ', so that [outcome].'")
```

confirms the guard fails: the ROADMAP Goal line was never restated as a proper user story via `/gsd mvp-phase 1`. All four executed plans acknowledge this explicitly in their own frontmatter ("a mechanical restatement of the ROADMAP `**Goal:**` line for Phase 1, which is not itself written in user-story form... Run `/gsd mvp-phase 1` to restate the ROADMAP Goal line itself").

Per the reference, this is surfaced as a discrepancy rather than silently patched. Because it would be unhelpful to refuse verification outright when ROADMAP.md already supplies four explicit, testable Success Criteria (the mandatory roadmap contract per Step 2a of the verifier's own process), this report verifies against those four criteria using the standard goal-backward methodology instead of fabricating a User Flow Coverage table from an ill-formed goal. **Recommendation: run `/gsd mvp-phase 1` to formalize the ROADMAP Goal line before Phase 2, so future verification runs the intended MVP flow.** This is a documentation/process gap, not a code defect, and does not by itself block phase completion.

## Goal Achievement

### Observable Truths (ROADMAP.md Success Criteria — the roadmap contract)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Maker opens the churned recipe and sees all twelve ingredient rows with grams, % of batch, and step allocation, alongside method, target bands, and authored notes | ✓ VERIFIED | `app/src/ui/IngredientTable.jsx` renders 12 rows (grams, %, step) from `oliveOilVersion.rows`; `app/src/ui/Method.jsx` renders 10 steps with typed targets; `app/src/ui/Authored.jsx` renders 3 carried-forward + 2 before-you-start notes; `app/src/data/olive-oil.js` carries `targets: {pac, pod, fat, msnf, solids}`. Wired into `app/src/ui/RecipePage.jsx`. Confirmed by direct source read and `npm --prefix app test` (72/72 passing). |
| 2 | Maker sees PAC, POD, total fat (milkfat + added fat separately), MSNF, sugar solids, total solids per 100 g, each against its target band with the calculation basis stated | ✓ VERIFIED | `app/src/domain/figures.js` `FIGURE_SPECS` defines the six figures in fixed order; `app/src/ui/FormulationNote.jsx` renders all six via `GraduatedRule`, with a dedicated fat-breakdown line (`Milkfat {…}% and added fat {…}% — {…}% of fat`); `app/src/ui/BasisNote.jsx` states the coefficient set, PAC-relative-to-sucrose convention, and lactose-as-54.5%-of-MSNF convention, reading from `COEFFICIENT_SET`/`LACTOSE_FRACTION_OF_MSNF`/`PAC_LACTOSE` rather than typed literals. |
| 3 | A figure resting on estimated or unreviewed ingredient data is flagged where the figure is shown, not only in a separate note | ✓ VERIFIED | `app/src/ui/GraduatedRule.jsx` prints `basisText` (`estimated: …` / `unreviewed: …`) beside the figure itself and folds it into the button's accessible name; `app/src/ui/IngredientTable.jsx` independently derives and prints the same word in a "Data" column per row. Both are text, never colour (`grep` confirms no hex literal in either file). |
| 4 | The figures on screen agree with the churned bench sheet's own figures for the same twelve rows | ✓ VERIFIED | `app/src/domain/composition.test.js` asserts all nine printed-sheet figures (mass 799.7, fat 18.0%, milkfat 13.0%, olive-oil share of fat 28%, MSNF 8.5%, sugar 13.5%, solids 40.8%, PAC 24.1, POD 13.0) within stated tolerance; test suite passes (72/72). `npm --prefix app run build` exits 0. |

**Score:** 4/4 roadmap success criteria verified.

### Requirements Coverage

| Requirement | Source Plan(s) | Description | Status | Evidence |
|---|---|---|---|---|
| REC1-01 | 01-01, 01-02, 01-03 | Open the churned recipe and see ingredients (grams, % of batch, step allocation), method, target bands, authored notes | ✓ SATISFIED | REQUIREMENTS.md marks REC1-01 Complete, Phase 1. Verified by Truth 1 above. |
| FORM1-01 | 01-03 | For any version, six balance figures per 100 g against target bands with calculation basis stated | ✓ SATISFIED | REQUIREMENTS.md marks FORM1-01 Complete, Phase 1. Verified by Truth 2 above. |
| FORM1-02 | 01-04 | A figure resting on estimated/unreviewed data is flagged where it is shown | ✓ SATISFIED | REQUIREMENTS.md marks FORM1-02 Complete, Phase 1. Verified by Truth 3 above. |

No orphaned requirements: REQUIREMENTS.md's Coverage table lists exactly REC1-01, FORM1-01, FORM1-02 for Phase 1, and all three appear in a plan's `requirements:` frontmatter field (01-01: REC1-01; 01-02: REC1-01; 01-03: REC1-01, FORM1-01; 01-04: FORM1-02).

### Required Artifacts (spot-checked against all four plans' `must_haves.artifacts`)

| Artifact | Expected | Status | Details |
|---|---|---|---|
| `app/package.json` | React 19 + Vite 8 + react-router 8 + idb 8 + vitest 5, pinned exact versions, `test: vitest run` | ✓ VERIFIED | Confirmed on disk; exact versions match SUMMARY claims. |
| `app/src/domain/composition.js` | `computeBalance`, `weakestBasis`, `COEFFICIENT_SET`, `LACTOSE_FRACTION_OF_MSNF`, `PAC_LACTOSE`, `POD_LACTOSE`; framework-free | ✓ VERIFIED | All exports present; no framework/DOM/store import; `0.545` present. |
| `app/src/domain/figures.js` | `buildFigures`, `describeDeviation`, `FIGURE_SPECS`; six ordered specs | ✓ VERIFIED | Confirmed; `pac`/`pod` specs both list `msnf` in `fields`, matching the load-bearing D-04 decision. |
| `app/src/data/library.js` | Twelve ingredient records with per-field basis | ✓ VERIFIED | 12 entries; `basis` fields present including `estimated` on wholeMilk.msnf, heavyCream.msnf, allulose.pac/pod, salt.pac. |
| `app/src/data/olive-oil.js` | Full version record: rows, targets, method, authored, declaredAxes | ✓ VERIFIED | All fields present and match printed-sheet values (370.4, 252.8, …, 0.16 g; targets without a `sugar` key; 10 method steps; 3+2 authored notes). |
| `app/src/store/repository.js` | Sole path to IndexedDB | ✓ VERIFIED | `grep -rl "from 'idb'" app/src` → only `app/src/store/db.js`. |
| `app/src/store/seed.js` | Seed-on-empty-store | ✓ VERIFIED | Present; tested for idempotency in `seed.test.js`. |
| `app/src/store/transfer.js` | `exportStore`, `validateStoreFile`, `importStore` | ✓ VERIFIED | All three exported; collect-all-errors validation; prototype-pollution guard via `Object.keys` scan (never property access); no import from store library. |
| `app/src/ui/IngredientTable.jsx` | 12 rows + Data column with estimated/unreviewed flag | ✓ VERIFIED | Confirmed; flag derived per-row via `weakestRowBasis`, never hand-typed. |
| `app/src/ui/GraduatedRule.jsx` | Rule with band hatch, tick, deviation words, basis flag, focusable | ✓ VERIFIED | Confirmed; native `<button>`, accessible name carries label/value/target/basis sentence; SVG band omitted entirely (no `<rect>`/edges) when `band` is `null`. |
| `app/src/ui/FormulationNote.jsx` | Six rules, fat breakdown | ✓ VERIFIED | Confirmed; computes nothing itself, only renders `buildFigures(version)` output. |
| `app/src/ui/BasisNote.jsx` | Coefficient set + conventions + estimated rows, derived | ✓ VERIFIED | Confirmed; imports `COEFFICIENT_SET`, `LACTOSE_FRACTION_OF_MSNF`, `PAC_LACTOSE`; estimated-rows list derived from `buildFigures`, not typed. |
| `app/src/ui/Method.jsx`, `Authored.jsx` | Ten steps / five authored notes | ✓ VERIFIED | Confirmed on disk and rendered from `RecipePage.jsx`. |
| `.impeccable/surfaces/route-recipe.md` `## Direction contract` | Seven required items | ✓ VERIFIED | Section present (`grep -c` = 1); type stacks, four colour roles, spacing scale, rule weights, focus treatment, block names, and open items all present per §4 preview. |
| `app/src/styles/tokens.css` | Contract values as CSS custom properties | ✓ VERIFIED | Contains `--ink`, `--ground`, `--pen-blue`/`--bookcloth`, `--focus-outline-*` (6 matches). |
| `CLAUDE.md`, `.claude/CLAUDE.md` | Landed structure recorded, stack ratified | ✓ VERIFIED | Root `CLAUDE.md` has no `## Status` section and records `app/` + three npm commands; `.claude/CLAUDE.md` Technology Stack/Conventions/Architecture all filled in and name `app/`; Constraints line says "ratified"; Developer Profile section untouched. |

### Key Link Verification

| From | To | Via | Status | Details |
|---|---|---|---|---|
| `RecipePage.jsx` | `repository.js` | `repository.getVersion(id)` | ✓ WIRED | Confirmed — loads version through the shared repository singleton (itself built by `createRepository()`), never through `idb` directly. |
| `RecipePage.jsx` | `figures.js` | `buildFigures(version)` | ✓ WIRED | Confirmed, computed once per render and passed down. |
| `main.jsx` | `seed.js` | `seedIfEmpty(repository)` | ✓ WIRED | Confirmed, awaited before mount. |
| `olive-oil.js` | `library.js` | `structuredClone(ingredient)` per row | ✓ WIRED | Confirmed — embedded-coefficient invariant proven by test (`composition.test.js`). |
| `FormulationNote.jsx` | `figures.js` | `buildFigures(version)` | ✓ WIRED | Confirmed, no arithmetic performed in the component itself. |
| `IngredientTable.jsx` | `figures.js` (via `RecipePage.jsx`) | `contributorRowIds` passed to mark rows | ✓ WIRED | Confirmed — `RecipePage.jsx` computes `markedRowIds` from the focused figure and passes it down. |
| `GraduatedRule.jsx` | `figures.js` | `estimatedRowNames` rendered beside figure | ✓ WIRED | Confirmed (`grep -c "estimatedRowNames"` ≥ 1). |
| `transfer.js` | `repository.js` | export/import via `getAll()`/`putAll()` | ✓ WIRED | Confirmed, no direct store-library import in `transfer.js`. |

### Data-Flow Trace (Level 4)

All rendered values (grams, % of batch, PAC/POD/fat/MSNF/sugar/solids, deviation words, basis flags, estimated-row names) trace to `computeBalance`/`buildFigures` output computed from `oliveOilVersion.rows`, which is itself loaded from IndexedDB via `repository.getVersion(id)` (seeded once from the same `oliveOilVersion` object). No static/hardcoded fallback values found in any UI component; no hollow props. ✓ FLOWING throughout.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|---|---|---|---|
| Full build succeeds | `npm --prefix app run build` | `✓ 98 modules transformed... built in 60ms` | ✓ PASS |
| Full test suite passes | `npm --prefix app test` | `Test Files 5 passed (5); Tests 72 passed (72)` | ✓ PASS |
| Printed-sheet figures assertion present | `grep -n "799.7" app/src/domain/composition.test.js` | Found, asserted with tolerance helper | ✓ PASS |
| No network API under app/src | `grep -rIhE 'fetch\(\|XMLHttpRequest\|sendBeacon\|EventSource\|WebSocket' app/src` | 0 matches | ✓ PASS |
| No raw-markup escape hatch | `grep -rIl dangerouslySetInnerHTML app/src` | 0 matches | ✓ PASS |
| No third-party origin referenced | `grep -rIn -E 'https?://' app/index.html app/src` (excl. w3.org) | 0 matches | ✓ PASS |
| No colour literal in figure/table components | `grep -rIcE '#[0-9a-fA-F]{3,8}' app/src/ui/*.jsx app/src/styles/app.css` | 0 matches | ✓ PASS |
| Git commits for all four plans exist | `git cat-file -e <hash>` × 17 hashes | All present | ✓ PASS |

### Probe Execution

No `scripts/*/tests/probe-*.sh` convention or explicit probe declarations exist in this phase's PLAN/SUMMARY files. Step 7c: SKIPPED (no probes declared or discovered).

### Anti-Patterns Found

`grep` scan across `app/src` and both `CLAUDE.md` files for `TBD|FIXME|XXX`, `TODO|HACK|PLACEHOLDER`, and placeholder-language phrases found no unresolved debt markers. One comment in `RecipePage.jsx` ("no placeholder text") is documentation of an intentional design decision (the empty advisory slot), not a stub marker. No blockers or warnings found.

### Human Verification Required

7 items deferred to end-of-phase per `workflow.human_verify_mode: end-of-phase`, harvested from each plan's `<human-check>` blocks and each SUMMARY's `coverage:` entries marked `human_judgment: true` (01-01 D1; 01-02 D4; 01-03 D2; 01-04 D1, D2, D3, D5). See the `human_verification` list in this document's frontmatter for the full text of each item. In summary, these cover:

1. List page and reload behavior in a real browser.
2. The recipe page's full visual read as a book spread (headnote, table, method, margin, empty advisory slot).
3. The six graduated rules' visual legibility (hatch bands, no colour verdicts).
4. The basis note's tone and completeness.
5. The estimated-flag's visibility at rest (not hover-only, not colour-only).
6. Keyboard tab order across all six figures and pixel-identical layout during contributor-row marking.
7. The full export → clear IndexedDB → reimport round trip, and rejection of a malformed import file.

None of these represent a known or suspected defect — they are the class of check (visual composition, real-browser interaction, tone) that cannot be settled by static analysis, and every mechanically-checkable fact underneath each one (exports, exact rendered text/markup via `renderToStaticMarkup`, absence of colour literals, absence of network calls, correct contributor-row-id sets) has already been confirmed in this report.

### Gaps Summary

No gaps found. All four ROADMAP Success Criteria are verified against the actual codebase (not merely claimed by SUMMARY.md), all three phase requirements are satisfied, `npm --prefix app run build` and `npm --prefix app test` both pass (72/72), and every artifact and key link declared across the four plans' `must_haves` frontmatter was independently confirmed present, substantive, and wired by direct source inspection — not by trusting the SUMMARY narrative.

The one open item is process-level, not code-level: the ROADMAP Phase 1 Goal line was never reformatted into proper user-story form via `/gsd mvp-phase 1`, despite the phase being tagged `mode: mvp`. This does not block the phase's goal from being achieved (verified above via the roadmap Success Criteria) but should be resolved before Phase 2 so future MVP-mode verification runs the intended user-flow framing.

---

*Verified: 2026-09-05*
*Verifier: Claude (gsd-verifier)*
