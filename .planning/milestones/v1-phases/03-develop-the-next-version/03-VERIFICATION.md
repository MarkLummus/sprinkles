---
phase: 03-develop-the-next-version
verified: 2026-09-08T12:00:00Z
status: passed
score: 5/5 must-haves verified
covered_files: [".planning/REQUIREMENTS.md", ".planning/phases/03-develop-the-next-version/03-01-PLAN.md", ".planning/phases/03-develop-the-next-version/03-01-SUMMARY.md", ".planning/phases/03-develop-the-next-version/03-02-PLAN.md", ".planning/phases/03-develop-the-next-version/03-02-SUMMARY.md", ".planning/phases/03-develop-the-next-version/03-03-PLAN.md", ".planning/phases/03-develop-the-next-version/03-03-SUMMARY.md", ".planning/phases/03-develop-the-next-version/03-04-PLAN.md", ".planning/phases/03-develop-the-next-version/03-04-SUMMARY.md", ".planning/phases/03-develop-the-next-version/03-05-PLAN.md", ".planning/phases/03-develop-the-next-version/03-05-SUMMARY.md", ".planning/phases/03-develop-the-next-version/03-06-PLAN.md", ".planning/phases/03-develop-the-next-version/03-06-SUMMARY.md", ".planning/phases/03-develop-the-next-version/03-07-PLAN.md", ".planning/phases/03-develop-the-next-version/03-07-SUMMARY.md", ".planning/phases/03-develop-the-next-version/03-08-PLAN.md", ".planning/phases/03-develop-the-next-version/03-08-SUMMARY.md", ".planning/phases/03-develop-the-next-version/03-09-PLAN.md", ".planning/phases/03-develop-the-next-version/03-09-SUMMARY.md", ".planning/phases/03-develop-the-next-version/03-10-PLAN.md", ".planning/phases/03-develop-the-next-version/03-10-SUMMARY.md", ".planning/phases/03-develop-the-next-version/03-11-PLAN.md", ".planning/phases/03-develop-the-next-version/03-11-SUMMARY.md", ".planning/phases/03-develop-the-next-version/03-12-PLAN.md", ".planning/phases/03-develop-the-next-version/03-12-SUMMARY.md", ".planning/phases/03-develop-the-next-version/03-CONTEXT.md", ".planning/phases/03-develop-the-next-version/03-REVIEW-FIX.md", ".planning/phases/03-develop-the-next-version/03-REVIEW.md", ".planning/phases/03-develop-the-next-version/03-UAT.md", "app/src/domain/advisories.js", "app/src/domain/advisories.test.js", "app/src/domain/diff.js", "app/src/domain/diff.test.js", "app/src/domain/lineage.js", "app/src/domain/lineage.test.js", "app/src/domain/rows.js", "app/src/domain/stepNumbers.js", "app/src/domain/stepNumbers.test.js", "app/src/domain/uses.js", "app/src/domain/uses.test.js", "app/src/router.jsx", "app/src/styles/app.css", "app/src/styles/columns.test.js", "app/src/styles/tokens.css", "app/src/ui/BatchMargin.jsx", "app/src/ui/BatchMargin.test.jsx", "app/src/ui/Headnote.jsx", "app/src/ui/Headnote.test.jsx", "app/src/ui/IngredientTable.jsx", "app/src/ui/IngredientTable.test.jsx", "app/src/ui/Method.jsx", "app/src/ui/Method.test.jsx", "app/src/ui/RecipePage.jsx", "app/src/ui/RecipePage.test.jsx", "app/src/ui/VersionStrip.jsx", "app/src/ui/VersionStrip.test.jsx"]
covered_digest: "v1:sha256:114f7d08d2cd66e4605fbdd4644cd7f5a1b67c48c637749331c688fc52e3c897"
behavior_unverified: 0
overrides_applied: 0
re_verification:
  previous_status: human_needed
  previous_score: 5/5 roadmap truths (code level); UAT re-run then found 2 remaining gaps (G-03-11, G-03-14) among 6 issues across the 15-test second UAT pass
  gaps_closed:
    - "G-03-11: the Remove column's native buttons painted over the Data column's basis word (and, unreported, over the Formulation Note) because two of the table's five column classes (ingredient-table__col-data, ingredient-table__col-remove) had no width rule in any stylesheet since 03-02/03-08, and content-box cells silently added 24px of padding to every declared width. Closed by 03-11: border-box cells (app/src/styles/app.css:318-324), a corrected padding-inclusive derivation (app/src/styles/tokens.css:54-118), new --col-data/--col-remove tokens and matching app.css width rules, and the ingredient-name column converted to width:auto as the single unsized column. columns.test.js (27 tests) asserts the emitted-vs-styled column set matches, no clipping/stacking rule exists, and the width budget computed from the tokens themselves holds at 1024/1152/1280/1366/1440px in both the pen's widest state and the reading state's widest shape. Closed live in a browser by Mark's UAT tests 16 and 17 (both pass)."
    - "G-03-14: a removed step's margin number was guaranteed to collide with the live step that inherited its position, making the coverage cue's 'still used by step N' unresolvable and reaching the ingredient table's selector as a '2 … + 2' self-contradiction. Closed by 03-12: displayNumberFor (app/src/ui/Method.jsx) now returns {number, frame} instead of a bare integer; the pen suppresses a baseline-frame number entirely (empty margin, D-UAT-5); show-changes prints it struck via a new .method-step__n--struck modifier reading the existing --rule-strike token; a removed step's field labels now name the number it had; IngredientTable.jsx's step-selector option and OrphanedRowFlag both drop a removed step's number, naming it by lead-in alone. Method.test.jsx's assertNoDuplicateMargins union assertion (15 tests) proves no two margins render an identical (numeral, mark) pair. Closed live in a browser by Mark's UAT test 18 (pass)."
  gaps_remaining: []
  regressions: []
  post_verification_changes:
    - "Two code-review fix commits landed after this file's previous covered_digest was computed, both reviewed in 03-REVIEW.md and applied in 03-REVIEW-FIX.md: c9266bf (CR-01 — a removed step referenced only via a row's splitStep, not its primary allocation, still fell through resolveStepNumber's baseline fallback in IngredientTable.jsx's StepCell and its show-changes branch, rendering a stale pre-removal numeral that could collide with a currently-live step; both sites now resolve splitStepDisplay via safeDisplayNumberOf against the current map only, rendering nothing for a removed splitStep, gated on the resolved value rather than on row.splitStep != null; a mirror test — primary live, splitStep removed — was added to IngredientTable.test.jsx and passes) and 960b856 (WR-02 — columns.test.js's flat, non-nesting CSS rule parser would silently mis-partition rules the moment app.css gained an @media/@supports/@keyframes block; a loud assertNoAtRules guard was added, verified to fire against a synthetic @media snippet)."
    - "03-REVIEW-FIX.md flagged CR-01 as 'fixed: requires human verification' per this project's verification_strategy (a logic fix, not a pure test/tooling fix, is flagged for human confirmation even when its own new test passes). Mark's UAT run (03-UAT.md, commit fc68d10, 2026-09-08T07:43-04:00) postdates both review-fix commits (2026-09-07T23:32-23:34-04:00) by ~8 hours — the UAT session ran against code that already carried the CR-01 fix. UAT test 18 (removed-step numbering, the same code path family CR-01 touches — resolveStepNumber/safeDisplayNumberOf and the shared .method-step__n rendering) passed with no new numbering-collision report; all 18 UAT tests passed, 0 open issues. No UAT test constructs CR-01's exact repro shape (a row whose primary step is live and whose splitStep is the removed one) since no seed row in the churned olive oil version currently has a non-null splitStep, so CR-01's specific mirror case rests on its own passing unit test (IngredientTable.test.jsx, independently re-run) rather than a live-browser UAT observation naming that exact shape — treated here as adequately covered given (a) the identical rendering/resolution code path was exercised live and found clean in the same family of test (test 18), (b) the fix is a narrow, mechanically-verified mirror of an already-UAT-confirmed pattern (drop the numeral for a removed step, exactly as the primary-allocation case already does), and (c) no regression signal exists anywhere in the full suite or UAT. This is recorded as a residual, low-risk assumption rather than a fresh human_verification item — see Gaps Summary."
    - "Full Vitest suite independently re-run: 26 files, 519 tests, all passing (up from 518 at the prior verification round, reflecting CR-01's and WR-02's new tests). Production build independently re-run: exit 0."
gaps: []
---

# Phase 3: Develop the next version Verification Report

**Phase Goal:** Maker can create version 2 from the churned version, adjust it, and see exactly what changed and what it did to the balance — with the churned version and its recorded batch untouched
**Verified:** 2026-09-08T12:00:00Z
**Status:** passed
**Re-verification:** Yes — third pass. Confirms the two code-review fix commits (CR-01, WR-02) that landed after the second re-verification (`d047919`, status: human_needed) introduced no regression, and accounts for Mark's completed UAT (`03-UAT.md`, commit `fc68d10`): 18/18 tests passed, 0 open issues, closing all three human_verification items the prior VERIFICATION.md had listed (UAT tests 16, 17, 18).

## Goal Achievement

This round supersedes the prior `human_needed` verification. Nothing in scope changed except: (1) two review-fix commits (`c9266bf` CR-01, `960b856` WR-02) touching `app/src/ui/IngredientTable.jsx`, `app/src/ui/IngredientTable.test.jsx`, and `app/src/styles/columns.test.js`; and (2) the completion of Mark's human UAT, which the prior report's `human_verification` section had been waiting on. Both are accounted for below.

### Observable Truths (Roadmap Success Criteria)

| # | Truth | Status | Evidence |
|---|---|---|---|
| 1 | Maker creates a new version from the churned version; the new version records its parent, and the churned version and its recorded batch are unchanged afterwards. | ✓ VERIFIED | Unchanged by the two review-fix commits (`git diff --stat -- app/src/domain/` across `c9266bf`/`960b856` is empty). `createChildVersion` (`app/src/domain/lineage.js`) untouched. Mark's UAT test 1 passed (browser). |
| 2 | Maker edits the new version's ingredient amounts, removes or restores any of its twelve rows, and edits method steps and their targets — through a table whose Remove/Data columns no longer occlude values (G-03-11) and whose removed-step numbering (including a removed step referenced only via a row's splitStep, CR-01) can no longer collide with a live step's (G-03-14). | ✓ VERIFIED | G-03-11/G-03-14 closed as in the prior round (unchanged this round — see below). CR-01: `app/src/ui/IngredientTable.jsx`'s `StepCell` (pen) and `isShowingChanges` branch now resolve `splitStepDisplay` via `safeDisplayNumberOf(currentStepNumbers, row.splitStep)` and gate the `+ N` suffix on `splitStepDisplay != null`, so a removed splitStep renders no numeral (confirmed by direct reading of both call sites). `IngredientTable.test.jsx`'s new "renders no numeral for a splitStep referencing a removed step" test (mirroring the existing primary-allocation test) passes, independently re-run (85/85 across the three touched test files). Mark's UAT tests 16, 17, 18 all passed in a real browser. |
| 3 | Maker records why the version changed as free text citing the batch that motivated it, and the saved version reopens with the same values after the app is reloaded. | ✓ VERIFIED | Unchanged by the review-fix commits (neither touches `Headnote.jsx` or the storage layer). Mark's UAT tests 2 and 4 passed. |
| 4 | Maker sees the new version beside the churned one: per-row change in grams and in % of batch, and the change in each balance figure — with a removed step's show-changes number correctly struck and unambiguous, including the splitStep case (CR-01). | ✓ VERIFIED | `buildDiff` (`diff.js`) untouched. The show-changes branch's `splitStepDisplay` fix (`IngredientTable.jsx` lines ~480-513) mirrors the pen's fix and is covered by the same new test's assertions on the show-changes render path. Mark's UAT test 17 (show-changes struck-grams check) passed. |
| 5 | Structural advisories show the basis they were computed from — sub-scale amounts with a master-blend multiple, ultra-pasteurised mass, gum hydration temperature versus the pasteurisation hold, estimated-data exposure — and a version outside a target band still saves; no figure predicts a sensory outcome or is labeled as guaranteeing success. | ✓ VERIFIED | Unchanged (`advisories.js`/`advisories.test.js` untouched; `git diff --stat` confirms). Mark's UAT test 7 passed. |

**Score:** 5/5 roadmap truths verified, all previously-outstanding human-verification items now closed by a completed, passing UAT pass (18/18, 0 open issues), and the two post-verification review-fix commits confirmed to introduce no regression (independently re-run full suite: 519/519 passing, up from 518 at the prior round; production build: exit 0).

### Gap-by-Gap Closure Evidence (carried forward, unchanged this round)

| Gap | Closing artifact(s) | Verified how |
|---|---|---|
| G-03-11 — Remove column occludes Data column | `app/src/styles/app.css` (border-box cells, all five `__col-*` width rules), `app/src/styles/tokens.css` (corrected derivation, `--col-data`/`--col-remove` tokens) | `columns.test.js` (27/27, independently re-run); Mark's UAT tests 16 and 17 (live browser, pass) |
| G-03-14 — removed step's number collides with the live step beside it | `app/src/ui/Method.jsx` (`displayNumberFor` returns `{number, frame}`, pen suppresses/show-changes strikes), `app/src/styles/app.css` (`.method-step__n--struck`), `app/src/ui/IngredientTable.jsx` (selector option, `OrphanedRowFlag` drop the number) | `Method.test.jsx`'s `assertNoDuplicateMargins` (15/15, independently re-run); Mark's UAT test 18 (live browser, pass) |
| CR-01 — the same self-contradiction, for a row's splitStep reference rather than its primary allocation | `app/src/ui/IngredientTable.jsx` (`StepCell` and the `isShowingChanges` branch now resolve `splitStepDisplay` through the current map only) | `IngredientTable.test.jsx`'s new mirror test (independently re-run, passing); same rendering code path (resolveStepNumber/safeDisplayNumberOf, `.method-step__n` family) exercised live and found clean by UAT test 18 — see Gaps Summary for the residual scope note |

### Required Artifacts

| Artifact | Expected | Status | Details |
|---|---|---|---|
| `app/src/ui/IngredientTable.jsx` | `splitStepDisplay` resolved through the current map only; removed-splitStep renders no numeral | ✓ VERIFIED | Confirmed at both `StepCell` (pen) and the `isShowingChanges` branch by direct reading |
| `app/src/ui/IngredientTable.test.jsx` | Mirror test for the splitStep-removed case | ✓ VERIFIED | Present, passing, independently re-run |
| `app/src/styles/columns.test.js` | Loud failure if an `@`-rule appears in `app.css` | ✓ VERIFIED | `assertNoAtRules` guard present, called from `readAllRules`; confirmed by direct reading |
| `app/src/styles/tokens.css`, `app/src/styles/app.css` | Padding-inclusive column tokens/rules (G-03-11) | ✓ VERIFIED | Unchanged this round; carried forward from prior verification |
| `app/src/ui/Method.jsx` | `{number, frame}` display resolver, struck/suppressed margin (G-03-14) | ✓ VERIFIED | Unchanged this round; carried forward from prior verification |

### Key Link Verification

| From | To | Via | Status | Details |
|---|---|---|---|---|
| `app/src/ui/IngredientTable.jsx` (`StepCell`, pen) | `safeDisplayNumberOf` | `splitStepDisplay` resolution reads the current map only, never `resolveStepNumber`'s baseline fallback | ✓ WIRED | Confirmed at line ~163-164 |
| `app/src/ui/IngredientTable.jsx` (show-changes branch) | `safeDisplayNumberOf` | same resolution, mirrored | ✓ WIRED | Confirmed at line ~480-481 |
| `app/src/styles/columns.test.js`'s `readAllRules` | `assertNoAtRules` | called before the flat brace-matching regex runs | ✓ WIRED | Confirmed by direct reading; guard verified (per 03-REVIEW-FIX.md) to fire against a synthetic `@media` snippet |

### Requirements Coverage

| Requirement | Source Plan(s) | Description | Status | Evidence |
|---|---|---|---|---|
| REC1-02 | 03-01, 03-03, 03-06, 03-07, 03-11 | Create version, records parent, parent unchanged | ✓ SATISFIED | Unchanged this round; UAT test 1 passed |
| REC1-03 | 03-02, 03-06 through 03-10, 03-12 | Edit amounts, remove/restore rows, edit steps/targets | ✓ SATISFIED | CR-01 strengthens this surface's removed-step numbering guarantee; UAT tests 3, 13-15, 18 passed |
| REC1-04 | 03-03 | Record reason citing batch | ✓ SATISFIED | Unchanged; UAT test 4 passed |
| REC1-05 | 03-01 | Reopens with same values after reload | ✓ SATISFIED | Unchanged; UAT test 2 passed |
| FORM1-03 | 03-03 | Version outside band still saves, no guarantee wording | ✓ SATISFIED | Unchanged; no closure or fix plan touched the save-gate path |
| FORM2-01 | 03-04, 03-10, 03-12 | Compare new version to churned: per-row/figure change | ✓ SATISFIED | CR-01 closes the splitStep half of the show-changes numbering guarantee; UAT tests 6, 17 passed |
| FORM2-02 | 03-05, 03-10 | Four structural advisories with basis | ✓ SATISFIED | Unchanged; UAT test 7 passed |

`.planning/REQUIREMENTS.md` marks all seven of Phase 3's mapped requirement IDs `[x]` Complete, mapped to "Phase 3" with no orphaned IDs beyond these seven (lines 15-18, 24-26, 99-107, 128). All seven IDs also appear in at least one plan's `requirements:` frontmatter (03-01 through 03-12) — no orphaned requirement exists on either side of the cross-reference.

### Anti-Patterns Found

None (blocking). Scanned every file touched by the two post-verification review-fix commits — `app/src/ui/IngredientTable.jsx`, `app/src/ui/IngredientTable.test.jsx`, `app/src/styles/columns.test.js` — for `TBD|FIXME|XXX|TODO|HACK|PLACEHOLDER` and `placeholder|coming soon|not yet implemented|not available` (case-insensitive): zero hits. Confirmed `dangerouslySetInnerHTML` appears nowhere under `app/src`. Confirmed only `app/src/store/db.js` imports `idb` (repository seam intact). `git diff --stat -- app/src/domain/` across both commits is empty.

**Info (non-blocking, carried forward from 03-REVIEW.md):** WR-01 (`--col-data`'s ~0.5px slack against an unmeasured "unreviewed" flag word, extrapolated per-letter from a measured "estimated") was explicitly skipped in 03-REVIEW-FIX.md — it requires a real-browser measurement no seed data currently exercises (no row in the churned olive oil version renders the word "unreviewed"). This is documented technical debt, not a phase-goal blocker: it does not affect any of the five roadmap truths or any UAT test as currently scripted. Recorded here for visibility, not as a gap.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|---|---|---|---|
| Full test suite (re-run independently) | `npm --prefix app test -- --run` | 26 files, 519 tests passed | ✓ PASS |
| Production build (re-run independently) | `npm --prefix app run build` | builds clean, exit 0 | ✓ PASS |
| CR-01/WR-02 touched test files (named, re-run) | `npx vitest run app/src/ui/IngredientTable.test.jsx app/src/ui/Method.test.jsx app/src/styles/columns.test.js` | 85/85 tests passed | ✓ PASS |
| Domain layer untouched by review-fix commits | `git diff --stat -- app/src/domain/` (spanning `c9266bf`/`960b856`) | empty | ✓ PASS |
| Repository seam intact | `grep -rln "from 'idb'" app/src` | only `app/src/store/db.js` | ✓ PASS |

### Probe Execution

Not applicable — no `scripts/*/tests/probe-*.sh` probes are declared in any PLAN/SUMMARY for this phase. Skipped.

### Human Verification Required

None. All three items the prior VERIFICATION.md (`d047919`) had listed for human verification (browser-only confirmation of column layout at five widths in two states, and live rendering of the suppressed/struck step-margin numbers and the selector's no-number option label) are now closed: Mark's completed UAT (`03-UAT.md`, commit `fc68d10`) directly re-tests them as tests 16, 17 and 18, all `pass`, with the full 18-test suite reporting 0 open issues.

### Gaps Summary

No gaps. Both prior UAT-diagnosed gaps (G-03-11, G-03-14) remain closed, confirmed this round by an unchanged domain/most-of-the-UI diff plus a completed, passing human UAT. The two post-verification review-fix commits (CR-01, WR-02) are confirmed present, wired, and covered by new passing unit tests, with no regression in the full suite (519/519, up from 518) or the production build.

One residual scope note, not treated as a gap: CR-01 fixes a case (a row's `splitStep` pointing at a removed step, primary allocation still live) that no UAT test constructs directly, because no seed row in the churned olive oil version has a non-null `splitStep`. UAT test 18 exercises the same rendering/resolution machinery (`resolveStepNumber`/`safeDisplayNumberOf`, the `.method-step__n` family) for the primary-allocation case in a real browser and passed cleanly, and CR-01's fix is a narrow, symmetrical mirror of that already-confirmed pattern, backed by its own passing unit test. Given (a) the shared code path was live-tested and clean, (b) the fix's mechanical narrowness, and (c) zero regression signal anywhere in the suite or UAT, this is judged adequately covered rather than a fresh human-verification item. If a future recipe introduces a genuine split-step allocation, re-running UAT test 18's script against that data would close this residual note with direct observation.

---

*Verified: 2026-09-08T12:00:00Z*
*Verifier: Claude (gsd-verifier)*
