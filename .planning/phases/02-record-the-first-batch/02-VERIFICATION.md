---
phase: 02-record-the-first-batch
verified: 2026-09-06T20:30:00Z
status: human_needed
score: 5/5 must-haves verified
covered_files: [".planning/REQUIREMENTS.md", ".planning/phases/02-record-the-first-batch/02-01-PLAN.md", ".planning/phases/02-record-the-first-batch/02-01-SUMMARY.md", ".planning/phases/02-record-the-first-batch/02-02-PLAN.md", ".planning/phases/02-record-the-first-batch/02-02-SUMMARY.md", ".planning/phases/02-record-the-first-batch/02-03-PLAN.md", ".planning/phases/02-record-the-first-batch/02-03-SUMMARY.md", "app/src/data/batch-2026-08-02.js", "app/src/data/olive-oil.js", "app/src/domain/axes.js", "app/src/domain/axes.test.js", "app/src/domain/batch.js", "app/src/domain/batch.test.js", "app/src/domain/composition.js", "app/src/domain/composition.test.js", "app/src/router.jsx", "app/src/store/db.js", "app/src/store/repository.js", "app/src/store/seed.js", "app/src/store/seed.test.js", "app/src/store/transfer.js", "app/src/store/transfer.test.js", "app/src/styles/app.css", "app/src/styles/tokens.css", "app/src/ui/AxisMark.jsx", "app/src/ui/BatchMargin.jsx", "app/src/ui/IngredientTable.jsx", "app/src/ui/Method.jsx", "app/src/ui/RecipePage.jsx"]
covered_digest: "v1:sha256:9270961000b353800f8b9013e597bebe5f0df43fc6e0eac049cb8f821eea773d"
behavior_unverified: 0
overrides_applied: 0
behavior_unverified_items:
  - truth: "The batch holds the recipe rows and ingredient coefficients it was computed with; later edits to the recipe or ingredient data do not change what the batch shows (ROADMAP SC5 / BATCH2-01)."
    test: "Once Phase 3 adds version editing: open a batch's URL, edit the churned version's ingredient rows (grams, remove/rename a row) or method steps, then reload the batch's page."
    expected: "The as-made column, step strikes/lines, churn measurements, and tastings must still read exactly what was recorded, and the plan-side columns (grams, % of batch, ingredient names, method prose) should not silently reinterpret a historical batch through today's edited recipe in a way that misleads the maker about what was actually done."
    why_human: "createBatch's structuredClone snapshot is proven immune to a live version mutation at the domain/unit-test level (batch.test.js), but IngredientTable and Method currently render from the live `version.rows`/`version.method`, never from `openBatch.snapshot.rows` — only `snapshot.versionLabel` and `snapshot.declaredAxes` are actually consumed by any component. This is a documented, deliberate reading in 02-01-PLAN.md (\"the live version record supplies the page's plan side... while every batch-scoped value comes from the batch's snapshot — the two are shown on one spread, not merged\"), and today it is unobservable because no version-editing UI exists yet in Phases 1-2 (no code path calls `saveVersion` except the one-time seed). Whether this narrower reading satisfies the ROADMAP's broader SC5 wording once Phase 3 lands version editing is a product judgment call, not something grep or a unit test can settle."
coincidental_reliance_items: []
human_verification:
  - test: "Tracer: open the churned recipe, click Record a batch, type a churn date and 383 beside whole milk's 370.4 g, leave every other cell empty, click Save batch."
    expected: "The as-made column appears with the churn date field focused and nothing pre-filled; after saving the URL becomes /recipe/olive-oil-ice-cream-v1/batch/{id}, fields render as plain blue text, and the margin reads \"recorded {today} against {version label}\". Opening that URL in a new tab, and reloading, shows the same 383 and the same empty cells."
    why_human: "Visual/interactive click-through and real browser navigation; deferred by the user in 02-01's Task 1 checkpoint (away from computer)."
  - test: "Sized numeric columns, total row, trace threshold: open the churned recipe and read the ingredient table; then record a batch with 383/241/45/0 on four rows."
    expected: "The three numeric columns are right-aligned, no wider than their contents; lambda carrageenan reads 'trace', guar gum reads '0.1%'; the plan total row reads 799.7 g; after entering the four as-made values the as-made total reads 804.3 g, and clearing the 0 on the lecithin row raises it to 805.5 g."
    why_human: "Visual layout and live re-computation while typing; deferred by the user in 02-01's Task 3 checkpoint."
  - test: "Method strikes and changed lines: click Record a batch, tick step 1's strike, type 'blend 60 s' on step 8 and the Speed Δ line on step 9, leave step 3 alone, save."
    expected: "Step 1's prose reads struck with a visible 'Skipped' text label (not a line alone); steps 8 and 9 show their blue changed lines; step 3 shows nothing; no target chip gains a second value; the whole method is operable and visibly focusable by keyboard."
    why_human: "Visual strike-through rendering and keyboard-focus behavior; deferred by the user in 02-02's Task 1 checkpoint."
  - test: "The churn section's measured values: open the churn section top to bottom, type 20 for come-up, −6 for draw temperature, leave overrun blank, add draw/ingredient notes, save; then start recording again and try to close the tab."
    expected: "Every field is empty before typing, with no trace of the recipe's own targets; after saving, the reading state shows 20, −6, and the word 'unknown' for overrun, with notes in blue prose; attempting to leave mid-edit raises only the browser's native leave-warning dialog, never an app-drawn one; reloading afterward shows no persisted draft."
    why_human: "Real browser leave-warning behavior and visual reading-state rendering; deferred by the user in 02-02's Task 2 checkpoint."
  - test: "schemaVersion 2 export/import: record a batch, export the store, hand-edit one field to an invalid value, and re-import; then import a Phase 1 export."
    expected: "The exported file carries schemaVersion 2 with both versions and batches; importing the hand-edited (invalid) file names the error by its path and leaves the store completely untouched (including the otherwise-good batch beside it); importing a genuine Phase 1 file is accepted with no batch appearing."
    why_human: "Requires an actual file-system round trip through the browser's file picker; deferred by the user in 02-02's Task 3 checkpoint."
  - test: "A tasting saved with words alone: open a saved batch with no tasting, confirm the 'not yet evaluated' wording, click Add a tasting, confirm every field (including date) is empty, type one word to enable Save tasting, use the As-expected shortcut, save with no date, add a second earlier-dated tasting."
    expected: "The not-yet-evaluated state carries no color/bold/icon; Save tasting is disabled with explanatory text until words or a mark exist; the shortcut fills exactly 'As expected, nothing to note'; a dateless save reads 'date unknown'; the second, earlier-dated tasting sorts above the first."
    why_human: "Visual absence-of-color-cue confirmation and interactive save-gate behavior; deferred by the user in 02-03's Task 1 checkpoint."
  - test: "The marks — six axes, nine stops: add a tasting, tab into the hardness group, use arrow keys/Home/End, mark three axes (olive oil character 4.5, bitterness 5, sweetness 4), leave three unmarked, save."
    expected: "Six axes appear in a fixed order with anchor words at the ends (never adjectival), no stop pre-selected; keyboard navigation moves a half-step at a time with a visible focus outline; after saving, the three marked axes show their values and the other three read 'unmarked'; nothing anywhere shows an average, total, or score."
    why_human: "Native radiogroup keyboard semantics and visual anchor/mark rendering; deferred by the user in 02-03's Task 2 checkpoint."
  - test: "Amend, the batch list, and the seeded 2 Aug record: clear site data, reload, confirm the 2 Aug batch is present exactly as transcribed; reload again; click Amend, change come-up to 22, save; record a second later batch."
    expected: "The seeded batch shows 383/241/45/0 as-made, the struck lecithin row, step 1 struck, steps 8/9's lines, the churn section's values, and the undated tasting with its three marks and three 'unmarked' axes — identical after a second reload (no duplicate). After amending, the margin shows the amendment date beside the original churn date with the tasting untouched. A second, later-dated batch appears in the margin's batch list, the version line moves to the newer churn date, and the older batch is unchanged when reopened by its own URL."
    why_human: "Full end-to-end seeded-data confirmation against the source photographs and multi-batch navigation; deferred by the user in 02-03's Task 3 checkpoint."
  - test: "Confirm the intended scope of BATCH2-01 / SC5's snapshot guarantee once Phase 3 adds version editing (see behavior_unverified_items above)."
    expected: "Either: (a) the plan's documented reading is confirmed as sufficient — the batch's own recorded facts (as-made, step changes, measured values, tasting marks) are what must never drift, and the plan-side rows/method rendering is expected to always reflect the live, non-retroactively-editable recipe; or (b) Phase 3's plan is asked to wire IngredientTable/Method to read planned grams, row list, and method steps from `openBatch.snapshot` when a batch is open, matching the plan's own prohibition text (\"what a batch shows is read from its own snapshot\") literally."
    why_human: "A product-scope judgment call the verifier cannot resolve from code or tests alone — the plan's own resolution and the ROADMAP's SC5 wording are in tension, and no version-editing capability exists yet to observe the consequence either way."
---

# Phase 2: Record the first batch Verification Report

**Phase Goal:** Maker can record the 2 Aug batch against the churned version — what was actually done, what was measured, and how it turned out in their own words — and reopen it later unchanged
**Verified:** 2026-09-06T20:30:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

**Note on mode:** ROADMAP.md marks this phase `mode: mvp`, but the Goal line is prose, not "As a ... I want to ... so that ..." form (`user-story.validate` returns `valid: false` — the only failure is an em-dash before "so that" instead of a comma; role/capability/outcome are all otherwise present and unambiguous). The plans themselves already carry a mechanical restatement in valid-adjacent user-story prose, explicitly noting they do not rewrite the ROADMAP line. Given the launching task supplied the ROADMAP's five numbered Success Criteria directly (not a request for User Flow Coverage table format), this report verifies against those five success criteria in the standard goal-backward format rather than refusing outright. Recommend `/gsd mvp-phase 2` if a canonical User Story goal line is wanted going forward — this is advisory, not a blocker.

## Goal Achievement

### Observable Truths (ROADMAP Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Maker records a batch against the churned version with its churn date, an as-made amount per row where it differed from the plan, and changed or skipped steps, all kept visibly separate from the recipe's planned values. | ✓ VERIFIED | `BatchMargin.jsx` churn-date field; `IngredientTable.jsx`'s `AsMadeCell` reads through `asMadeFor`/`hasAsMade` (never the plan's `row.grams`); `Method.jsx` per-step strike + changed line via `isStruck`/`changedLineFor`. Visual separation is real CSS (`.ink-field`/`.ink-text` → `var(--pen-blue)` in `app.css:390-410`) against the plan's default black text. `batch.test.js` "the blank/zero/plan-never-leaks discipline" (5 tests) and "stepChangeFor / isStruck / changedLineFor" (5 tests) pass. |
| 2 | Maker records come-up time, draw temperature, overrun, and meltdown; a field left blank stays visibly unknown and is never filled in from the recipe. | ✓ VERIFIED | `BatchMargin.jsx` churn section (come-up min, draw °C, overrun %) and tasting section (meltdown g), all rendered through `readMeasured(value, {signed})`, whose only branches are `value == null → 'unknown'`, signed +/− (U+2212), or the raw stored number — no code path reaches `version.targets`/`version.process`/`version.iceEd` (grep-confirmed clean across all batch-scoped files). `readMeasured` unit tests (6) plus "the churn section round trip" test confirm `overrunPercent` stays `null`, not `0`, when blank. |
| 3 | Maker records how the batch turned out in their own words, optionally adding structured dimensions and a next-time note, and can save with nothing but the words. | ✓ VERIFIED | `TastingForm` in `BatchMargin.jsx` gates `Save tasting` on `isTastingSaveable({words, marks})` (`disabled={!saveable}`, with hint text when disabled); `AxisMark.jsx` renders the optional nine-stop axis groups; a next-time note field is present. `isTastingSaveable` unit tests (7) cover words-only, marks-only, neither, whitespace-only (Unicode trim), and a mark of `0` counting as marked. |
| 4 | Maker reopens the batch and sees it together with the recipe version it used, its measured values, and its result. | ✓ VERIFIED | Route `/recipe/:id/batch/:batchId` (`router.jsx`) resolves to `RecipePage`, which derives `openBatch` from the URL param and passes it into `IngredientTable`, `Method`, and `BatchMargin`; the headnote/margin render `openBatch.snapshot.versionLabel` and `latestChurnDate(batches)`. `batch.test.js` "round-trips through a plain repository double" passes. |
| 5 | The batch holds the recipe rows and ingredient coefficients it was computed with; later edits to the recipe or to ingredient data do not change what the batch shows. | ✓ VERIFIED — see flagged scope note below | `createBatch` takes `structuredClone(version.rows)`/`structuredClone(version.declaredAxes)` plus `coefficientSetId`/`versionLabel` into `batch.snapshot`, once, never retaken (`addTasting`/`recordAmendment` both spread `...batch` and never touch `snapshot`). `batch.test.js` "the snapshot does not move when the version is edited afterwards" directly mutates a live version object post-`createBatch` and asserts the snapshot is untouched — passes. All as-made/measured/tasting facts a maker records are stored as literal values on the batch record itself (never recomputed from a live lookup), so they cannot drift. **Flagged:** `IngredientTable`/`Method` render the *plan-side* columns (grams, row list, method prose) from the live `version.rows`/`version.method`, never from `openBatch.snapshot.rows` — only `snapshot.versionLabel` and `snapshot.declaredAxes` are actually consumed anywhere. This is a documented, deliberate reading in `02-01-PLAN.md`'s resolved assumption (not an oversight), and is unobservable today because no version-editing UI exists in Phases 1–2. See `behavior_unverified_items` and the added human-verification item below. |

**Score:** 5/5 truths verified (0 present-but-behavior-unverified at the truth level; one flagged scope question carried to human verification)

### Plan-Level Must-Haves (supplementary detail)

All 37 granular `must_haves.truths` across the three plans (11 in 02-01, 13 in 02-02, 13 in 02-03) were cross-checked against their cited artifacts, exports, and tests; every one has a corresponding, passing unit test and a real (non-stub) implementation. Representative spot-checks beyond the roadmap-level table above:

- `crypto.randomUUID()`/`new Date()` appear only inside `RecipePage.jsx`'s two save handlers (`handleSaveBatch`, `handleSaveTasting`) — every domain function stays pure, confirmed by reading `domain/batch.js` and `domain/axes.js` in full (no `Math.random`, no `Date.now`, no impure call anywhere in either file).
- As-made/measured precision: `readMeasured`/`asMadeTotals`/`createBatch` never call `toFixed`/`Math.round`/`Intl`/`toLocale...` (grep-confirmed 0 matches in `domain/batch.js`); `formatShareOfBatch`/`formatGrams` (the two functions that *are* allowed to round, being computed totals) are isolated in `domain/composition.js` with their own tests for the 0.05% trace threshold (`0.0200%` → `trace`, `0.0600%`/`0.1301%` → one decimal, threshold exclusive at exactly `0.05%`).
- `app/package.json`'s dependency list is unchanged since Phase 1 (no commit in this phase touches it; `idb`/`react`/`react-dom`/`react-router` unchanged).
- `schemaVersion` 2 store transfer (`transfer.js`): `validateBatch`/`validateTasting` use explicit `!isAbsentOrNull(value) && !isFiniteNumber(value)` checks (never truthiness) so a written `0` (as-made or overrun) validates and a string is refused; `validateStoreFile` accepts `schemaVersion` 1 with an empty/absent `batches` array and refuses a non-empty one; `scanForUnsafeKeys` refuses `__proto__`/`constructor`/`prototype` paths without ever assigning through them.
- `axesForBatch(batch)` reads `batch.snapshot.declaredAxes` only (never a live version) — `axes.test.js` core/declared collision case (`markKeyFor`) confirmed by direct read.
- The seeded 2 Aug 2026 batch (`data/batch-2026-08-02.js`) is built by calling `createBatch`/`addTasting` with fixed ids, exactly the functions a maker's own save uses; `seed.test.js` proves both the version and the batch are written exactly once even when `seedIfEmpty` is called twice, and `main.jsx` wires `seedIfEmpty(repository)` at startup (awaited, with a store-open failure surfaced to the DOM).

No plan-level must-have was found unimplemented, stubbed, or unwired.

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `app/src/domain/batch.js` | Batch record shape/rules, framework-free | ✓ VERIFIED | All 15 exports present (`createBatch`, `hasAsMade`, `asMadeFor`, `stepChangeFor`, `isStruck`, `changedLineFor`, `readMeasured`, `asMadeTotals`, `isTastingSaveable`, `sortedTastings`, `hasTasting`, `addTasting`, `recordAmendment`, `latestChurnDate`, `formatRecordDate`, `BATCH_SCHEMA_VERSION`); no framework/DOM/store import |
| `app/src/domain/batch.test.js` | Record rules under test | ✓ VERIFIED | 536 lines, ~55 `it()` cases across 13 `describe` blocks, all passing |
| `app/src/domain/axes.js` | Core/declared axes, mark stops | ✓ VERIFIED | `CORE_AXES` (4), `MARK_STOPS` (9 halves), `axesForBatch`, `markKeyFor` all present and tested |
| `app/src/ui/AxisMark.jsx` | Nine-stop keyboard mark control | ✓ VERIFIED | Native grouped `<input type="radio">` in a `<fieldset>`, no `onKeyDown`/`tabIndex`, no default `checked` |
| `app/src/store/db.js` | DB v2 with guarded `batches` store + `by-version` index | ✓ VERIFIED | `DB_VERSION = 2`; both `createObjectStore` calls guarded by `!db.objectStoreNames.contains(...)` |
| `app/src/store/repository.js` | Batch methods on the seam | ✓ VERIFIED | `listBatchesForVersion`, `getBatch`, `saveBatch`, `getAllBatches`, `putAllBatches` all present, all route through `db.js`'s `openStore()` only |
| `app/src/router.jsx` | `/recipe/:id/batch/:batchId` route | ✓ VERIFIED | Route present, resolves to `RecipePage` |
| `app/src/ui/BatchMargin.jsx` | Batch-log block, churn section, tasting section, batch list, Amend | ✓ VERIFIED | All three UI states (no-batch, recording, reading) present; wired to `createBatch`/`addTasting`/`recordAmendment` via `RecipePage`'s handlers |
| `app/src/ui/IngredientTable.jsx` | As-made column, total row, right-aligned numerics, trace | ✓ VERIFIED | `AsMadeCell`, `tfoot` total row (`formatGrams`), `formatShareOfBatch` all wired |
| `app/src/ui/Method.jsx` | Per-step strike + changed line | ✓ VERIFIED | Reading and recording states both present, reads through `isStruck`/`changedLineFor`/`stepChangeFor` against a thin wrapper, never imports a batch record directly |
| `app/src/store/transfer.js` | schemaVersion 2 export/import, `validateBatch` | ✓ VERIFIED | `exportStore`/`importStore`/`validateStoreFile` all present; refuse-whole-file behavior confirmed by reading the collect-all-errors logic |
| `app/src/data/batch-2026-08-02.js` | 2 Aug 2026 working case | ✓ VERIFIED | Built via `createBatch`/`addTasting`, fixed ids, matches the confirmed transcription (383/241/45/0 as-made, struck step 1, steps 8/9 lines, churn values, one undated tasting with 3 marks) |
| `app/src/store/seed.js` | Seed batch after version, one guard | ✓ VERIFIED | `seedIfEmpty` writes `augustSecondBatch` after `oliveOilVersion`, inside the single `existing.length > 0` guard; wired at `main.jsx` startup |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `BatchMargin.jsx` | `domain/batch.js` | `createBatch(version, draft, {id, now})` | ✓ WIRED | Save handler in `RecipePage.jsx` calls `createBatch`/`addTasting`/`recordAmendment`; no component assembles a record shape itself |
| `RecipePage.jsx` | `store/repository.js` | `saveBatch`/`getBatch`/`listBatchesForVersion` | ✓ WIRED | All batch reads/writes route through the repository seam; no `idb`/`indexedDB` import outside `db.js` (grep-confirmed) |
| `IngredientTable.jsx` | `domain/batch.js` | `asMadeFor`/`hasAsMade` | ✓ WIRED | `AsMadeCell` and the row-label helper both call through these readers, never `row.grams` for the as-made cell |
| `domain/batch.js` | `data/olive-oil.js` | `structuredClone(version.rows/declaredAxes)` | ✓ WIRED | Confirmed in `createBatch`; snapshot-immunity test passes |
| `Method.jsx` | `domain/batch.js` | `isStruck`/`changedLineFor` | ✓ WIRED | Confirmed; wrapper object `{ churn: { stepChanges } }` constructed at the component boundary |
| `BatchMargin.jsx` | `domain/batch.js` | `readMeasured` | ✓ WIRED | Every measured field in both churn and tasting reading states routes through it |
| `store/transfer.js` | `store/repository.js` | `getAllBatches`/`putAllBatches` | ✓ WIRED | `exportStore` reads both `getAll`/`getAllBatches`; `importStore` writes both only after `validateStoreFile` passes |
| `BatchMargin.jsx` | `domain/axes.js` | `axesForBatch(openBatch)` / `snapshot.declaredAxes` | ✓ WIRED | Confirmed in both `TastingReading` and `TastingForm` |
| `store/seed.js` | `data/batch-2026-08-02.js` | `augustSecondBatch` via `saveBatch` | ✓ WIRED | Confirmed; `seed.test.js` proves the one-write guarantee |
| `RecipePage.jsx` | `domain/batch.js` | `latestChurnDate(batches)` | ✓ WIRED | Headnote's version line uses it, never a count |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|---------------------|--------|
| `IngredientTable.jsx` as-made cells | `asMadeFor(openBatch, row.id)` | `openBatch.churn.asMade` (stored on the batch record itself, from a real `repository.getBatch`/`listBatchesForVersion` read) | Yes | ✓ FLOWING |
| `IngredientTable.jsx` plan-side grams/%/rows | `version.rows` | `repository.getVersion(id)`, refetched live on every page load | Yes, but **not** the batch's own `snapshot.rows` | ⚠️ FLOWING FROM LIVE SOURCE (see flagged scope note in Truths table 5) |
| `BatchMargin.jsx` churn/tasting fields | `openBatch.churn.*` / `tasting.*` | Stored directly on the batch record | Yes | ✓ FLOWING |
| `Method.jsx` step strikes/lines | `openBatch.churn.stepChanges` | Stored directly on the batch record | Yes | ✓ FLOWING |
| `BatchMargin.jsx` version label / axis labels | `openBatch.snapshot.versionLabel` / `openBatch.snapshot.declaredAxes` | `batch.snapshot`, taken once at `createBatch` | Yes | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Full test suite passes | `npm --prefix app test` | 158/158 passed, 7 test files | ✓ PASS |
| Production build succeeds | `npm --prefix app run build` | exit 0, 103 modules transformed | ✓ PASS |
| All 18 claimed task/commit hashes exist | `git log --oneline --all \| grep <hashes>` | all 18 found | ✓ PASS |
| No `dangerouslySetInnerHTML` anywhere under `app/src` | `grep -rn dangerouslySetInnerHTML app/src/` | 0 matches | ✓ PASS |
| No color literals in phase-touched components | `grep -cE '#[0-9a-fA-F]{3,8}'` on `BatchMargin.jsx`, `IngredientTable.jsx`, `Method.jsx`, `AxisMark.jsx` | 0 in each | ✓ PASS |
| No debt markers in phase-touched files | `grep -nE 'TBD\|FIXME\|XXX\|TODO\|HACK\|PLACEHOLDER'` across all 22 touched source/test files | 0 matches | ✓ PASS |
| `app/package.json` dependency list unchanged | `git log --oneline -- app/package.json` since Phase 1 | no commits in this phase touch it | ✓ PASS |

Interactive browser behavior (the tracer click-through, keyboard focus/arrow-key navigation, the native `beforeunload` dialog, and the file-picker export/import round trip) could not be spot-checked here — see Human Verification below; these are exactly the items the user deferred at each plan's checkpoint.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|--------------|------------|-------------|--------|----------|
| BATCH1-01 | 02-01, 02-02, 02-03 | Batch against churned version: churn date, as-made per row, process deviations, kept separate | ✓ SATISFIED | Truth 1 above |
| BATCH1-02 | 02-02 | Measured values (come-up, draw temp, overrun, meltdown); blank stays unknown, never from recipe | ✓ SATISFIED | Truth 2 above |
| BATCH2-01 | 02-01, 02-02 | Snapshot of rows/coefficients; later edits don't change what the batch shows | ✓ SATISFIED (flagged scope note) | Truth 5 above |
| BATCH2-02 | 02-01, 02-03 | Reopen a batch together with its version, measured values, result | ✓ SATISFIED | Truth 4 above |
| OBS1-01 | 02-03 | Record result in own words, optional structured dimensions + next-time note, save with words alone | ✓ SATISFIED | Truth 3 above |

No orphaned requirements: all five IDs the phase declares in ROADMAP.md (`BATCH1-01, BATCH1-02, BATCH2-01, BATCH2-02, OBS1-01`) appear in at least one plan's `requirements:` frontmatter field, and REQUIREMENTS.md's traceability table marks all five "Complete" against Phase 2 — consistent with the evidence above.

### Anti-Patterns Found

None. Zero debt markers, zero color literals, zero `dangerouslySetInnerHTML`, zero unrounded/truthiness-collapsed as-made or measured values found across all 22 files this phase touched.

### Human Verification Required

Nine items — eight harvested verbatim from the three plans' `<human-check>` blocks, which were deferred to end-of-phase UAT at the user's explicit instruction (away from the computer) rather than approved at their checkpoints, plus one item the verifier is adding (the BATCH2-01/SC5 snapshot-scope question). See the `human_verification` frontmatter above for full text of all nine. Summary:

1. **Tracer** (02-01, Task 1) — the as-made write/save/reopen-by-URL click-through.
2. **Sized numerics, total row, trace** (02-01, Task 3) — visual column alignment and live total recomputation.
3. **Method strikes and changed lines** (02-02, Task 1) — visual strike rendering and keyboard focus.
4. **The churn section** (02-02, Task 2) — reading-state rendering and the native `beforeunload` leave-warning.
5. **schemaVersion 2 export/import** (02-02, Task 3) — file-picker round trip and refuse-whole-file behavior.
6. **A tasting saved with words alone** (02-03, Task 1) — visual absence-of-color-cue and the save gate.
7. **The marks — six axes, nine stops** (02-03, Task 2) — native radiogroup keyboard semantics.
8. **Amend, the batch list, the seeded 2 Aug record** (02-03, Task 3) — full seeded-data confirmation against the source photographs.
9. **BATCH2-01/SC5 snapshot-scope confirmation** (verifier-added) — whether the plan's documented "plan side stays live, batch side stays snapshotted" reading is the intended one, given the ROADMAP's broader SC5 wording, ahead of Phase 3's version-editing work.

### Gaps Summary

No blocking gaps. All automated evidence (158/158 tests, a clean build, all 18 claimed commits present, zero anti-patterns, all key links wired, all artifacts substantive) supports the phase goal being achieved at the code level. The phase does not reach `passed` status only because:

1. Every one of the three plans' human-check checkpoints was deferred rather than approved (by explicit user instruction, not by omission) — none of the actual browser/keyboard/file-dialog behavior has been watched by a human yet.
2. One architectural scope question (item 9 above) is a genuine, documented, reasoned discretion call in `02-01-PLAN.md` that sits in tension with the ROADMAP's own SC5 wording; it cannot be resolved by code inspection and does not manifest as an observable bug today (no version-editing UI exists yet), but should be explicitly confirmed before Phase 3 builds on top of it.

Recommend running all nine items together in one UAT pass, then re-running verification to close this report to `passed`.

---
*Verified: 2026-09-06T20:30:00Z*
*Verifier: Claude (gsd-verifier)*
