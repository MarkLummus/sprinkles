---
phase: 03-develop-the-next-version
verified: 2026-09-08T23:00:00Z
status: human_needed
score: 5/5 must-haves verified
covered_files: [".planning/REQUIREMENTS.md", ".planning/phases/03-develop-the-next-version/03-01-PLAN.md", ".planning/phases/03-develop-the-next-version/03-01-SUMMARY.md", ".planning/phases/03-develop-the-next-version/03-02-PLAN.md", ".planning/phases/03-develop-the-next-version/03-02-SUMMARY.md", ".planning/phases/03-develop-the-next-version/03-03-PLAN.md", ".planning/phases/03-develop-the-next-version/03-03-SUMMARY.md", ".planning/phases/03-develop-the-next-version/03-04-PLAN.md", ".planning/phases/03-develop-the-next-version/03-04-SUMMARY.md", ".planning/phases/03-develop-the-next-version/03-05-PLAN.md", ".planning/phases/03-develop-the-next-version/03-05-SUMMARY.md", ".planning/phases/03-develop-the-next-version/03-06-PLAN.md", ".planning/phases/03-develop-the-next-version/03-06-SUMMARY.md", ".planning/phases/03-develop-the-next-version/03-07-PLAN.md", ".planning/phases/03-develop-the-next-version/03-07-SUMMARY.md", ".planning/phases/03-develop-the-next-version/03-08-PLAN.md", ".planning/phases/03-develop-the-next-version/03-08-SUMMARY.md", ".planning/phases/03-develop-the-next-version/03-09-PLAN.md", ".planning/phases/03-develop-the-next-version/03-09-SUMMARY.md", ".planning/phases/03-develop-the-next-version/03-10-PLAN.md", ".planning/phases/03-develop-the-next-version/03-10-SUMMARY.md", ".planning/phases/03-develop-the-next-version/03-11-PLAN.md", ".planning/phases/03-develop-the-next-version/03-11-SUMMARY.md", ".planning/phases/03-develop-the-next-version/03-12-PLAN.md", ".planning/phases/03-develop-the-next-version/03-12-SUMMARY.md", ".planning/phases/03-develop-the-next-version/03-CONTEXT.md", ".planning/phases/03-develop-the-next-version/03-UAT.md", "app/src/domain/advisories.js", "app/src/domain/advisories.test.js", "app/src/domain/diff.js", "app/src/domain/diff.test.js", "app/src/domain/lineage.js", "app/src/domain/lineage.test.js", "app/src/domain/rows.js", "app/src/domain/stepNumbers.js", "app/src/domain/stepNumbers.test.js", "app/src/domain/uses.js", "app/src/domain/uses.test.js", "app/src/router.jsx", "app/src/styles/app.css", "app/src/styles/columns.test.js", "app/src/styles/tokens.css", "app/src/ui/BatchMargin.jsx", "app/src/ui/BatchMargin.test.jsx", "app/src/ui/Headnote.jsx", "app/src/ui/Headnote.test.jsx", "app/src/ui/IngredientTable.jsx", "app/src/ui/IngredientTable.test.jsx", "app/src/ui/Method.jsx", "app/src/ui/Method.test.jsx", "app/src/ui/RecipePage.jsx", "app/src/ui/RecipePage.test.jsx", "app/src/ui/VersionStrip.jsx", "app/src/ui/VersionStrip.test.jsx"]
covered_digest: "v1:sha256:e06669971e780e3bab4c806c958490eaa6207fb818aa6e19e91772d04a34e439"
behavior_unverified: 0
overrides_applied: 0
re_verification:
  previous_status: human_needed
  previous_score: 5/5 roadmap truths (code level); UAT re-run then found 2 remaining gaps (G-03-11, G-03-14) among 6 issues across the 15-test second UAT pass
  gaps_closed:
    - "G-03-11: the Remove column's native buttons painted over the Data column's basis word (and, unreported, over the Formulation Note) because two of the table's five column classes (ingredient-table__col-data, ingredient-table__col-remove) had no width rule in any stylesheet since 03-02/03-08, and content-box cells silently added 24px of padding to every declared width. Closed by 03-11: border-box cells (app/src/styles/app.css:318-324), a corrected padding-inclusive derivation (app/src/styles/tokens.css:54-118), new --col-data/--col-remove tokens and matching app.css width rules, and the ingredient-name column converted to width:auto as the single unsized column. A new app/src/styles/columns.test.js (27 tests) asserts the emitted-vs-styled column set matches, no clipping/stacking rule exists, and the width budget computed from the tokens themselves holds at 1024/1152/1280/1366/1440px in both the pen's widest state and the reading state's widest shape."
    - "G-03-14: a removed step's margin number was guaranteed to collide with the live step that inherited its position (removing baseline position k always shifts the next live step into current position k), making the coverage cue's 'still used by step N' unresolvable and reaching the ingredient table's selector as a '2 … + 2' self-contradiction. Closed by 03-12: displayNumberFor (app/src/ui/Method.jsx:105-115) now returns {number, frame} instead of a bare integer; the pen suppresses a baseline-frame number entirely (empty margin, D-UAT-5), show-changes prints it with a new .method-step__n--struck modifier reading the existing --rule-strike token (app/src/styles/app.css:526-528, D-UAT-4/D-UAT-5); a removed step's field labels now name the number it had; and IngredientTable.jsx's step-selector option and OrphanedRowFlag both drop a removed step's number entirely, naming it by lead-in alone. A new assertNoDuplicateMargins union assertion in Method.test.jsx (15 tests) proves no two margins render an identical (numeral, mark) pair, in the pen (single removal, a non-adjacent double removal at steps 1 and 5, and a last-step removal) and in show-changes."
  gaps_remaining: []
  regressions: []
human_verification:
  - test: "With the dev server running, open the churned olive oil version at 1280px and press Develop the next version."
    expected: "The remove buttons sit much closer to the table's right edge than before task 2's fix, though task 1 alone does not yet finish the job; nothing moves in the reading state except tighter gaps between columns, and the '% of batch' header still sits on one line."
    why_human: "This repo's Vitest suite runs under the default node environment with no layout engine; columns.test.js proves the tokens and rules are internally consistent with the measured minimums, not that the browser paints the boxes as computed (03-11 Task 1's own deferred human-check)."
  - test: "With the dev server running, open the churned olive oil version and check the ingredient table at 1024, 1152, 1280, 1366 and 1440px, in both the reading state (2 Aug batch's As made column in view) and with Develop the next version pressed. Confirm the Data column's basis word ('estimated') is fully readable with no remove button touching it, the header reads 'Data' and 'Remove' as two separate words, nothing paints over the Formulation Note, no numeric header wraps, and ingredient names sit on one line at 1280/1366/1440 (a wrap is expected and accepted at 1024). Then press show changes on a saved child and confirm a struck grams value and its replacement still read clearly."
    expected: "G-03-11 is closed at every width the UAT names, in both states, with no clipping or hiding used to fake the fix."
    why_human: "Real CSS box layout (table-layout: fixed, border-box width resolution) needs a browser; this repo's node-environment Vitest suite has none (03-11 Task 2's own deferred human-check)."
  - test: "In the pen on the churned olive oil version, remove step 1. Its margin must be empty, and the coverage cue beside it must name a step number that appears exactly once on the page — follow it and land on the step it means. Its field labels must name the step it was (check with VoiceOver or by reading the markup). Now remove step 2 as well and confirm the same: two empty margins, then live steps reading 1 upward, and the cue on each removed step resolving to one step. Open a flagged row's step selector: the removed step's option shows its lead-in and says it is removed, with no number, and no two options in the list start with the same number. Then save the child and press show changes: the struck steps wear their parent numbers with a stroke through them, the live steps read 1 to 9, and no numeral appears twice in the same form."
    expected: "G-03-14 is closed: a removed step's number can never be mistaken for the live step's beside it, in either state, and the coverage cue always resolves to exactly one findable step."
    why_human: "A real <select> element's option-matching/rendering behavior, a live CSS strike rendering, and the full save-then-reread round trip through the real UI need a browser; this repo's Vitest suite runs renderToStaticMarkup with no interactive DOM (03-12 Task 2's own deferred human-check, covering both of the plan's tasks together)."
---

# Phase 3: Develop the next version Verification Report

**Phase Goal:** Maker can create version 2 from the churned version, adjust it, and see exactly what changed and what it did to the balance — with the churned version and its recorded batch untouched
**Verified:** 2026-09-08T23:00:00Z
**Status:** human_needed
**Re-verification:** Yes — after gap closure (03-11 closing G-03-11, 03-12 closing G-03-14; both diagnosed and ruled in `03-UAT.md`'s second UAT pass after the first round's 03-06 through 03-10 closures)

## Goal Achievement

This is the second gap-closure re-verification for this phase. The first re-verification (superseded revision of this file) confirmed the four gaps from the first UAT pass (G-03-1, G-03-3, G-03-6, G-03-9) were closed. Mark then ran a full 15-test UAT pass against that closure and found 2 new/latent gaps — G-03-11 (a width-allocation fault in the ingredient table's Remove/Data columns, unreported since 03-02) and G-03-14 (a guaranteed collision between a removed step's margin number and the live step that inherits its position) — both diagnosed, ruled (D-UAT-5, D-UAT-6), and closed by plans 03-11 and 03-12. This round verifies those two closures against the actual codebase (not SUMMARY claims) and re-confirms nothing else regressed.

### Observable Truths (Roadmap Success Criteria)

| # | Truth | Status | Evidence |
|---|---|---|---|
| 1 | Maker creates a new version from the churned version; the new version records its parent, and the churned version and its recorded batch are unchanged afterwards. | ✓ VERIFIED | Unchanged by 03-11/03-12: `git diff --stat -- app/src/domain/` across both plans' commits is empty (confirmed directly and via each plan's own gate); `createChildVersion` (`app/src/domain/lineage.js`) is untouched. Mark's UAT test 1 passed the parent-untouched behavior in the browser. |
| 2 | Maker edits the new version's ingredient amounts, removes or restores any of its twelve rows, and edits method steps and their targets — **now through a table whose Remove/Data columns no longer occlude values (G-03-11) and whose removed-step numbering can no longer collide with a live step's (G-03-14)**. | ✓ VERIFIED | G-03-11: `app/src/styles/app.css` now carries width rules for all five `.ingredient-table__col-*` classes (`grep -c ingredient-table__col- app.css` = 5, confirmed by direct reading), border-box sizing on the shared cell rule (`app.css:318-324`), and a corrected padding-inclusive derivation in `tokens.css` naming the page arithmetic and four measured minimums; `app/src/styles/columns.test.js` (27/27 passing, independently re-run) computes the width budget from the tokens themselves at 1024/1152/1280/1366/1440px, asserting the sized columns never exceed the table width and the name column absorbs the remainder. G-03-14: `displayNumberFor` (`Method.jsx:105-115`) returns `{number, frame}`; the pen renders no margin for a baseline-frame (removed) step (`Method.jsx:164-167`) while show-changes renders it struck via a new `.method-step__n--struck` rule reading `--rule-strike` (`Method.jsx:347-351`, `app.css:526-528`); `IngredientTable.jsx`'s `StepCell` option label and `OrphanedRowFlag` both drop a removed step's number, naming it by lead-in alone (`IngredientTable.jsx:161-166`, `319-336`). `Method.test.jsx`'s `assertNoDuplicateMargins` (independently re-run, 15/15 passing) proves no two margins render an identical (numeral, mark) pair across single removal, non-adjacent double removal, last-step removal, and show-changes cases. |
| 3 | Maker records why the version changed as free text citing the batch that motivated it, and the saved version reopens with the same values after the app is reloaded. | ✓ VERIFIED | Unchanged by 03-11/03-12 (neither plan touched `Headnote.jsx` or the storage layer). Mark's UAT tests 2 and 4 (reload round-trip, reason/citation ceremony) both passed in the browser in the second UAT pass. |
| 4 | Maker sees the new version beside the churned one: per-row change in grams and in % of batch, and the change in each balance figure — **now with a removed step's show-changes number correctly struck and unambiguous (G-03-14 closed)**. | ✓ VERIFIED | `buildDiff` (`diff.js`) untouched by 03-11/03-12 (confirmed empty domain diff). `Method.test.jsx`'s show-changes tests confirm a removed step's margin now prints the parent number struck (`marked: true`) with live steps unmarked 1-9, and the union assertion holds — closing the identical latent defect in show-changes that G-03-14's diagnosis found alongside the pen instance. |
| 5 | Structural advisories show the basis they were computed from — sub-scale amounts with a master-blend multiple, ultra-pasteurised mass, gum hydration temperature versus the pasteurisation hold, estimated-data exposure — and a version outside a target band still saves; no figure predicts a sensory outcome or is labeled as guaranteeing success. | ✓ VERIFIED | Unchanged by 03-11/03-12 (`advisories.js`/`advisories.test.js` untouched; `git diff --stat` confirms). Mark's UAT test 7 passed in the second UAT pass. |

**Score:** 5/5 roadmap truths verified at the code/domain-logic level, both via direct source reading and independently re-run passing behavioral tests (not SUMMARY claims). Both target gaps (G-03-11, G-03-14) are confirmed closed by real, wired, tested code — see `re_verification.gaps_closed` above for the specific artifact/line evidence.

### Gap-by-Gap Closure Evidence

| Gap | Closing artifact(s) | Verified how |
|---|---|---|
| G-03-11 — Remove column occludes Data column | `app/src/styles/app.css:318-324` (border-box cells), `:341-372` (all five column-width rules, including new `__col-data`/`__col-remove`); `app/src/styles/tokens.css:54-118` (corrected derivation, `--table-cell-pad-x`, `--col-numeric` 94px, `--col-step` 78px, `--col-data` 86px, `--col-remove` 78px, `--col-ingredient` retired to `width: auto`) | Direct source reading; `app/src/styles/columns.test.js` (27/27, independently re-run) asserts the emitted-vs-styled column set matches, no clipping/stacking property exists, and the width budget holds at all five UAT widths in both the pen's widest state and the reading state's widest shape |
| G-03-14 — removed step's number collides with the live step beside it | `app/src/ui/Method.jsx:105-115` (`displayNumberFor` returns `{number, frame}`), `:164-167` (pen suppresses baseline-frame numbers), `:347-351` (show-changes marks them struck); `app/src/styles/app.css:511-528` (`.method-step__n--struck` reading `--rule-strike`, no new token); `app/src/ui/IngredientTable.jsx:161-166` (selector option drops the number for a removed step, stays present/disabled/valued on the stored key), `:319-336` (`OrphanedRowFlag` names by lead-in alone) | Direct source reading; `app/src/ui/Method.test.jsx` (`assertNoDuplicateMargins`, 15/15 independently re-run) and `app/src/ui/IngredientTable.test.jsx` (independently re-run) prove the union of every rendered margin/option numeral holds no duplicate, across single removal, non-adjacent double removal, last-step removal, and show-changes |

### Required Artifacts

| Artifact | Expected | Status | Details |
|---|---|---|---|
| `app/src/styles/tokens.css` | Padding-inclusive `--col-*` tokens for all five columns, corrected derivation | ✓ VERIFIED | `--table-cell-pad-x`, `--col-numeric` (94px), `--col-step` (78px), `--col-data` (86px), `--col-remove` (78px) all present with derivation comments naming measured minimums and their debug-session source; `--col-ingredient` retired with a recorded rationale |
| `app/src/styles/app.css` | Border-box cells, width rule for every emitted column class, name column auto-width | ✓ VERIFIED | `.ingredient-table th, .ingredient-table td { box-sizing: border-box; ... }`; five `.ingredient-table__col-*` rules present (`name` auto, `numeric`/`step`/`data`/`remove` each `var(--col-*)`) |
| `app/src/styles/columns.test.js` | Stylesheet-contract test: sizing model, emitted-vs-styled set, no clip/stack, width budget at five UAT widths | ✓ VERIFIED | New file, 27 tests, all passing (independently re-run) |
| `app/src/ui/Method.jsx` | Number resolver reporting its reference frame; struck margin in show-changes, suppressed margin in the pen | ✓ VERIFIED | `displayNumberFor` returns `{number, frame}`; both branches read `marginInfo.frame` distinctly; `fieldLabel` names a removed step's prior number |
| `app/src/styles/app.css` (Strike Rule) | `.method-step__n--struck` modifier reading `--rule-strike`, no new token | ✓ VERIFIED | Present at `app.css:526-528`, documented under the existing Strike Rule comment |
| `app/src/ui/IngredientTable.jsx` | Selector option and orphaned-row flag drop a removed step's number | ✓ VERIFIED | `StepCell`'s option label branches on `step.removed` to drop the number; `OrphanedRowFlag` names causing steps by `leadIn` alone unconditionally |
| `app/src/ui/Method.test.jsx`, `app/src/ui/IngredientTable.test.jsx` | Union-of-margins / no-duplicate-numeral assertions | ✓ VERIFIED | `assertNoDuplicateMargins` and the selector's no-duplicate-leading-numeral test both present and passing |

### Key Link Verification

| From | To | Via | Status | Details |
|---|---|---|---|---|
| `app/src/ui/IngredientTable.jsx` | `app/src/styles/app.css` | every `ingredient-table__col-*` class the component emits is matched by a width rule | ✓ WIRED | `columns.test.js`'s completeness assertion confirms the emitted set (`name, numeric, step, data, remove`) exactly matches the styled set |
| `app/src/styles/app.css` | `app/src/styles/tokens.css` | every sized column reads its width through its own `var(--col-*)`, no px literal | ✓ WIRED | Confirmed by direct reading and by `columns.test.js`'s "no px literal" assertions |
| `app/src/ui/Method.jsx` | `app/src/styles/app.css` | the show-changes margin number carries `.method-step__n--struck`; the pen's carries nothing because it prints nothing | ✓ WIRED | Confirmed at `Method.jsx:347-351` and `app.css:526-528` |
| `app/src/ui/IngredientTable.jsx` | the pen's own removed-step rule | the selector option and the orphaned-row flag name a removed step by its lead-in alone | ✓ WIRED | Confirmed at `IngredientTable.jsx:161-166` (option) and `:319-336` (flag) |

### Requirements Coverage

| Requirement | Source Plan(s) | Description | Status | Evidence |
|---|---|---|---|---|
| REC1-02 | 03-01, 03-03, 03-06, 03-07, 03-11 | Create version, records parent, parent unchanged | ✓ SATISFIED | Core mechanism unchanged; 03-11's column-width fix strengthens the surface it is edited through |
| REC1-03 | 03-02, 03-06, 03-07, 03-08, 03-09, 03-10, 03-12 | Edit amounts, remove/restore rows, edit steps/targets | ✓ SATISFIED | Core editing unchanged; G-03-1, G-03-3, G-03-6, G-03-9, G-03-11, G-03-14 all close defects in this surface |
| REC1-04 | 03-03 | Record reason citing batch | ✓ SATISFIED | Unchanged; untouched by this round's closure plans |
| REC1-05 | 03-01 | Reopens with same values after reload | ✓ SATISFIED (mechanism); interactive reload previously confirmed by Mark's UAT test 2 | Unchanged by 03-11/03-12 |
| FORM1-03 | 03-03 | Version outside band still saves, no guarantee wording | ✓ SATISFIED | Unchanged; no closure plan in this round touched the save-gate path |
| FORM2-01 | 03-04, 03-10, 03-12 | Compare new version to churned: per-row/figure change | ✓ SATISFIED | `buildDiff` unchanged; 03-12's struck-margin fix closes the show-changes half of G-03-14 |
| FORM2-02 | 03-05, 03-10 | Four structural advisories with basis | ✓ SATISFIED | Unchanged; confirmed by Mark's UAT test 7 (passed) |

`.planning/REQUIREMENTS.md` marks all seven of Phase 3's mapped requirement IDs `[x]` Complete, mapped to "Phase 3" with no orphaned IDs beyond these seven (cross-checked against `.planning/REQUIREMENTS.md` lines 15-18, 24-26, 99-107, 128).

### Anti-Patterns Found

None. Scanned every file this round's gap-closure plans (03-11, 03-12) modified — `app/src/styles/tokens.css`, `app/src/styles/app.css`, `app/src/styles/columns.test.js`, `app/src/ui/Method.jsx`, `app/src/ui/Method.test.jsx`, `app/src/ui/IngredientTable.jsx`, `app/src/ui/IngredientTable.test.jsx` — for `TBD|FIXME|XXX|TODO|HACK|PLACEHOLDER|placeholder|coming soon|not yet implemented|not available` (case-insensitive): zero hits. Confirmed `dangerouslySetInnerHTML` appears nowhere under `app/src`. Confirmed no module outside `app/src/store/db.js` imports `idb` (repository seam intact). Confirmed zero hex-color or `px` literals in `IngredientTable.jsx`/`Method.jsx`. Confirmed `git diff --stat -- app/src/domain/` across both plans' commits is empty — the domain layer's convention (no framework/DOM/store import) was never at risk since it was never touched.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|---|---|---|---|
| Full test suite (re-run independently) | `npm --prefix app test -- --run` | 26 files, 518 tests passed | ✓ PASS |
| Production build (re-run independently) | `npm --prefix app run build` | builds clean, exit 0 | ✓ PASS |
| Column-width contract (single named test file) | `npx vitest run app/src/styles/columns.test.js` | 27/27 tests passed | ✓ PASS |
| Step-numbering + selector contract (two named test files) | `npx vitest run app/src/ui/Method.test.jsx app/src/ui/IngredientTable.test.jsx` | 57/57 tests passed | ✓ PASS |
| All five `ingredient-table__col-*` classes now have a matching rule | direct reading of `app.css:341-372` | 5/5 classes styled (2 previously unstyled since 03-02) | ✓ PASS |
| No two rendered margins share an (numeral, mark) pair | direct reading of `Method.test.jsx`'s `assertNoDuplicateMargins` call sites (7 configurations) | all pass | ✓ PASS |
| Domain layer untouched by this round | `git diff --stat -- app/src/domain/` (spanning 03-11's and 03-12's commits) | empty | ✓ PASS |

### Probe Execution

Not applicable — no `scripts/*/tests/probe-*.sh` probes are declared in any PLAN/SUMMARY for this phase. Skipped.

### Human Verification Required

See the `human_verification` list in the frontmatter (3 items, harvested from 03-11's and 03-12's own `<human-check>` blocks, both explicitly deferred to end-of-phase UAT per `workflow.human_verify_mode: end-of-phase`, this phase's standing precedent). All three require a real browser (a CSS layout engine to confirm table/flex box resolution, or a live `<select>`/strike rendering) that this repo's `renderToStaticMarkup`-based, layout-engine-free Vitest setup cannot exercise. Every one of the underlying code changes for G-03-11 and G-03-14 is confirmed present, wired, and covered by a passing behavioral (not merely presence) unit test in this report — only the live-browser confirmation of the visual/interactive result remains, which is exactly what closes out `03-UAT.md`'s test 11 and test 14.

The thirteen other UAT tests (1-10, 12, 13, 15) already passed in Mark's second UAT pass and are not re-listed: neither 03-11 nor 03-12 touched the code paths those tests exercised (`git diff --stat` confirms `app/src/domain/`, `Headnote.jsx`, `BatchMargin.jsx`, `RecipePage.jsx`, `VersionStrip.jsx`, `router.jsx`, `advisories.js` all empty across both plans' commits).

### Gaps Summary

No gaps remain at the code level. Both UAT-diagnosed gaps from the second pass (G-03-11, G-03-14) are closed by real, wired, tested code, confirmed by direct source reading and independently re-run passing tests in this verification round — not taken from SUMMARY.md claims. The full test suite (518/518, independently re-run, up from 486 at the start of this closure batch: 486 → 513 after 03-11 → 518 after 03-12, no test removed) and production build (independently re-run, exit 0) both pass. What remains is exclusively the live-browser confirmation of visual column layout at five widths in two states, and the live rendering of the suppressed/struck step-margin numbers and the selector's no-number option label — three items, each traceable to 03-11's or 03-12's own deferred `<human-check>`, exactly matching UAT tests 11 and 14.

---

*Verified: 2026-09-08T23:00:00Z*
*Verifier: Claude (gsd-verifier)*
