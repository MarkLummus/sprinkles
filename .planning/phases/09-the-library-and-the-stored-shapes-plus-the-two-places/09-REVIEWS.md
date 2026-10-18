---
phase: 9
reviewers: [codex, opencode]
reviewed_at: 2026-10-18T21:04:20Z
plans_reviewed: [09-01-PLAN.md, 09-02-PLAN.md, 09-03-PLAN.md, 09-04-PLAN.md, 09-05-PLAN.md, 09-06-PLAN.md, 09-07-PLAN.md, 09-08-PLAN.md, 09-09-PLAN.md, 09-10-PLAN.md, 09-11-PLAN.md, 09-12-PLAN.md, 09-13-PLAN.md, 09-14-PLAN.md, 09-15-PLAN.md, 09-16-PLAN.md, 09-17-PLAN.md]
models:
  codex: "gpt-6.1-sol (reasoning=high)"
  opencode: "openrouter/deepseek/deepseek-v4.1-flash#high"
model_sources:
  codex: "banner"
  opencode: "pinned"
---

# Cross-AI Plan Review — Phase 9

<!-- gsd:plan-revision-conflicts:begin -->
## Plan-Revision Conflicts

<!-- gsd:plan-revision-conflicts:end -->

Round 3, after the D-20 amendment at 163f008. Round 2 (OpenCode) is in git at 18d4c5b; round 1 (OpenCode and Codex) at 47604aa.

## Codex Review

Source review completed for all 17 plans. The existing baseline passes **96 test files and 3,007 tests**. Planned behavior is assessed against the current source; it is not reported as implemented.

## 09-01

**Summary.** The converter is well specified, but the D-20 amendment introduces contradictions that must be resolved before execution.

- **Strengths:** Lactose subtraction matches the engine’s addition mechanism in `app/src/domain/composition.js:35–44`. Separating converted candidates from preserved app entries is appropriate.
- **Concerns — HIGH:** The amendment requires `basis.titratableAcidity = 'derived'`, but the automated verification rejects **every** basis value other than `inherited`. A correctly converted dairy entry therefore fails. See [09-01-PLAN.md:150](/Users/mark/Documents/projects/sprinkles/.planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-01-PLAN.md:150) and its verification at line 153.
- **Concerns — MEDIUM:** Applying `msnf × 0.017` to every milk-solids row labels yogurt acidity as derived. D-20 distinguishes cultured dairy, and `.planning/notes/2026-10-18-sourced-formulation-bands.md:285` requires a measured or label value for yogurt.
- **Suggestions:** Check `inherited` only for composition figures; separately check acidity provenance. Give cultured dairy an approved estimated value or `null` when unknown. Add `stages.js` and its test to the file manifest.
- **Risk Assessment: HIGH.** The prescribed verification currently rejects the prescribed output.

## 09-02

**Summary.** The stored-code change follows the actual creation and printing paths cleanly.

- **Strengths:** The legacy hash explicitly excludes embedded coefficients and equipment in `app/src/domain/sheetCode.js:26–30`, so D-20 need not change existing printed codes. I verified 19 unique seeded codes and Olive Oil’s `64JH-G408`.
- **Concerns:** No new material concern found. Both constructors really build records explicitly: `app/src/domain/lineage.js:130` and `app/src/domain/newRecipe.js:62`.
- **Suggestions:** Retain the stored-code-differs tests; they establish that readers use the field rather than reproduce the legacy calculation.
- **Risk Assessment: LOW.** The changes are localized and the compatibility checks are specific.

## 09-03

**Summary.** The places use suitable existing routing, ordering and display conventions.

- **Strengths:** `activeWork()` already supplies recipe identity, versions, batches and recency order in `app/src/domain/lastEvent.js:111–132`. Both target routes are currently placeholders at `app/src/router.jsx:123` and `:126`.
- **Concerns — LOW:** Task 2 specifies a search form without specifying submission handling. The existing search page explicitly prevents default submission in `app/src/ui/SheetCodeSearch.jsx:68`; the shared Button defaults to `type="button"` at `app/src/ui/Button.jsx:7`.
- **Suggestions:** Specify that Enter in Name preserves the current filters and route, and add that browser check. This is an unverified interaction gap; WebKit could not launch during this review.
- **Risk Assessment: MEDIUM.** Store access is straightforward; responsive layout and keyboard behavior remain the main execution work.

## 09-04

**Summary.** The draft contract handles incomplete input carefully, but its asynchronous restore behavior needs one additional contract.

- **Strengths:** Extending the existing hook addresses its real restrictions: the version prerequisite is at `app/src/ui/useKeptDraft.js:112`, and persistence currently recognizes only existing pen kinds at `:166–184`.
- **Concerns — MEDIUM:** [09-04-PLAN.md:126](/Users/mark/Documents/projects/sprinkles/.planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-04-PLAN.md:126) disables the existing late-read protection for creation. That protection currently preserves a pen opened while the read was pending at `app/src/ui/useKeptDraft.js:126–130`. If creation permits typing during `getDraft`, a late restore can replace that input.
- **Suggestions:** Either require editing to remain disabled until restoration finishes, or protect restoration with an edit-generation check. Test a deferred `getDraft` response arriving after input changes.
- **Risk Assessment: MEDIUM.** Shape checks are thorough; restoration can still lose input without the additional rule.

## 09-05

**Summary.** Library links, equipment limits and serving temperature are grounded in the actual stored records.

- **Strengths:** Rows already clone entries in `app/src/domain/versionRow.js:65` and `app/src/data/olive-oil.js:54–58`. I verified the 19 Ice Ed records contain exactly 17 numeric temperatures and the two specified nulls.
- **Concerns — LOW:** The two recipe-owned strawberry definitions bypass the library entirely at `app/src/data/strawberry.js:34` and `:52`. Adding D-20 fields only to library entries leaves these embedded definitions with a different coefficient shape.
- **Suggestions:** Explicitly decide whether these two definitions receive six nullable fields too. If intentionally exempt, document that downstream coefficient readers must tolerate their absence.
- **Risk Assessment: LOW.** D-19 is consistent with the source; the remaining question concerns D-20 shape consistency.

## 09-06

**Summary.** Transactional code enforcement and failed-save recovery fit the existing implementation.

- **Strengths:** The repository currently performs an unchecked put at `app/src/store/repository.js:32–34`. Moving read, check and write into one transaction addresses that gap. The existing failure handler leaves the pen open and releases the lock at `app/src/ui/useVersionPen.js:211–215`.
- **Concerns:** No new material concern found beyond the deliberately documented treatment of legacy test fixtures.
- **Suggestions:** Keep the concurrent-repository case and UI retry case as separate proofs: one establishes serialization, the other preserves the maker’s input.
- **Risk Assessment: LOW.** The plan covers both persistence failure and user-visible recovery.

## 09-07

**Summary.** The merge and conflict gate are sound, but D-20’s new file ownership is incomplete.

- **Strengths:** Existing seeding already writes `{ id, entry }` records through the repository at `app/src/store/seed.js:22`. Preserving original entries last in the merge protects their composition values.
- **Concerns — MEDIUM:** Task 1 now edits `app/src/data/library.js`, but neither its task file list nor frontmatter includes that file. Compare [09-07-PLAN.md:7](/Users/mark/Documents/projects/sprinkles/.planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-07-PLAN.md:7) with the amendment at line 103.
- **Suggestions:** Add the file explicitly. Pin representative coefficient values and acidity provenance, not just key presence and stage membership; those checks would accept incorrectly seeded values.
- **Risk Assessment: MEDIUM.** The amendment is executable, but ownership and semantic assertions need updating.

## 09-08

**Summary.** Definition copying and serving-temperature propagation follow the constructors correctly.

- **Strengths:** `createChildVersion` currently shares declared lists at `app/src/domain/lineage.js:141–142`; cloning fixes a real aliasing problem. Updating root and child together respects the exact-key assertion at `app/src/store/creation-roundtrip.test.js:107`.
- **Concerns:** No new material concern found. The numeric-parent and null-parent cases cover the amended D-19 behavior.
- **Suggestions:** Keep the mutation test that changes a child definition and checks the parent, since equality alone would not detect sharing.
- **Risk Assessment: LOW.** The affected shapes and callers are identified.

## 09-09

**Summary.** The reset proof is strong, but the plan misses existing tests that its new behavior necessarily invalidates.

- **Strengths:** The existing upgrade callback is synchronous and guarded in `app/src/store/db.js:24–55`. Preserving that structure while bounding destruction below 10 is appropriate.
- **Concerns — HIGH:** `app/src/store/library.test.js:182–204` explicitly asserts that a version-8 profile retains its records and draft. The proposed `< 10` reset necessarily invalidates those assertions. This file is absent from this plan’s ownership list.
- **Concerns — HIGH:** Requiring D-20 fields invalidates the accepted bare-entry case at `app/src/store/transfer.test.js:875–878`. The plan adds new validator tests but does not assign the existing fixture update.
- **Suggestions:** Include both test files in this plan. Replace the historical preservation expectation with the approved reset expectation, and update valid library fixtures with the six fields while retaining explicit missing-field refusal tests.
- **Risk Assessment: HIGH.** The full-suite gate cannot pass as currently prescribed.

## 09-10

**Summary.** Export consistency and Sheet-code enforcement are carefully handled, but the new catalog invariant lacks equivalent transactional protection.

- **Strengths:** `repository.importAll` already provides an all-or-nothing transaction with explicit abort handling at `app/src/store/repository.js:158–179`. Extending it to eight stores preserves that mechanism.
- **Concerns — HIGH:** The merged core-scale count is checked only before the transaction in [09-10-PLAN.md:113](/Users/mark/Documents/projects/sprinkles/.planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-10-PLAN.md:113). Two imports can each pass against four core rows, both demote the same core row, and each add a different core row. Sequential commits then leave **five** core scales, which boot refuses.
- **Suggestions:** Recompute the merged scale count inside `repository.importAll` before any puts, alongside the Sheet-code check. Add a controlled two-import race proving one import is refused and all its stores remain unchanged.
- **Risk Assessment: HIGH.** The pre-check does not establish the invariant claimed over the resulting store.

## 09-11

**Summary.** Catalog loading and truthful post-import recovery are appropriate, but the boot tests were not reconciled with D-20.

- **Strengths:** Boot already has a pre-mount store-opening boundary at `app/src/main.jsx:27–38`. Shell currently increments the revision directly after import at `app/src/ui/Shell.jsx:347–353`, making the proposed reload boundary easy to identify.
- **Concerns — HIGH:** The “odd display fields” fixture intentionally omits all six D-20 fields yet must pass boot validation at [09-11-PLAN.md:171](/Users/mark/Documents/projects/sprinkles/.planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-11-PLAN.md:171). It cannot pass the amended required-own-key validator.
- **Suggestions:** Add six valid nullable coefficient fields to that fixture. Keep its malformed cosmetic fields so it still proves display tolerance. Update the prose describing the validator’s checked structure.
- **Risk Assessment: MEDIUM.** The architecture is suitable; the specified acceptance case is contradictory.

## 09-12

**Summary.** The route-to-presentational-component catalog boundary is clear and supported by the current component structure.

- **Strengths:** `BatchRow` already distinguishes fresh recording from correction at `app/src/ui/BatchRow.jsx:621–625`. The desktop grid’s four explicit core positions are visible at `:240–244`, supporting the cardinality tests.
- **Concerns:** No additional source-backed gap found in this plan.
- **Suggestions:** Keep the direct BatchRow tests and route-level tracer test; they prove different parts of the wiring.
- **Risk Assessment: MEDIUM.** Provider coverage touches many tests, but the plan enumerates that work.

## 09-13

**Summary.** Snapshot creation and snapshot-only reading are aligned with the existing batch lifecycle.

- **Strengths:** `createBatch` already copies version-owned data once at `app/src/domain/batch.js:184–189`. `completeRecord` preserves the snapshot through its spread at `:206–212`.
- **Concerns:** No new material concern found. Updating module-load seed callers before UI callers is important because an omitted catalog would fail during import.
- **Suggestions:** Preserve the contained-failure gate and cloned-catalog mutation test as written.
- **Risk Assessment: MEDIUM.** The changes span many callers, but the intermediate failure boundary is explicit.

## 09-14

**Summary.** Validating historical batches against their own definitions achieves the intended independence from current tables.

- **Strengths:** Current defect validation depends on global `DEFECTS` at `app/src/store/transfer.js:295–296`; replacing that dependency addresses the actual historical-data problem. The From freezer exclusion reads the tasting’s own values at `:318–324`, so it can remain independent.
- **Concerns:** No new material concern found in the snapshot validation or definition round trip.
- **Suggestions:** Retain the case where the receiving catalog lacks a snapshot-defined problem; it distinguishes snapshot validation from accidental catalog validation.
- **Risk Assessment: LOW.** The plan exercises the intended boundary directly.

## 09-15

**Summary.** This completes the runtime catalog transition and tests changes to definitions the batch actually used.

- **Strengths:** Draft checks currently depend on global scale and problem lists at `app/src/domain/draft.js:146` and `:165`. The plan removes those dependencies from both payload and baseline checks.
- **Concerns:** No additional material gap found here. The D-20 walk incompatibility belongs to 09-16 rather than this stability proof.
- **Suggestions:** Retain the distinction between static architectural checks and behavior tests. The import scan cannot independently establish runtime data provenance.
- **Risk Assessment: MEDIUM.** Broad consumer changes remain, but the plan names them and finishes with the full suite.

## 09-16

**Summary.** The proof structure is rigorous, but its allow-list predates D-20 and will reject the amended seed.

- **Strengths:** The existing walk captures complete version and batch records at `.planning/phases/08-split-the-recipe-page-along-its-jobs/08-walk.mjs:169–199`. Required additions and negative self-tests supplement its leaf comparison appropriately.
- **Concerns — HIGH:** D-20 adds six fields inside embedded ingredients and adds acidity basis/source entries. Those changes propagate through the actual cloning paths at `app/src/data/olive-oil.js:54–58` and `app/src/domain/batch.js:187`. None appears in the allowed paths prescribed by [09-16-PLAN.md:89](/Users/mark/Documents/projects/sprinkles/.planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-16-PLAN.md:89).
- **Suggestions:** Add narrowly defined paths for the six coefficients and approved provenance additions, checking exact expected seed values. Extend required-field checks and add wrong-coefficient and missing-coefficient negative cases. Include any existing-note amendments explicitly rather than allowing whole ingredient objects.
- **Risk Assessment: HIGH.** A correct D-20 implementation currently cannot obtain the required MATCH result.

## 09-17

**Summary.** The final-build upgrade and reopen check is the appropriate browser-level complement to the store tests.

- **Strengths:** The base commit matches the current latest app change, `3f23c7f`. The existing connection-closing behavior at `app/src/store/db.js:74–76` supports upgrading between builds; reopening with a retained draft tests that the destructive branch does not run twice.
- **Concerns — LOW:** Browser and Mark’s List verification remain execution prerequisites. WebKit launch aborted during this review, and ArtifactData was unavailable, so neither browser reachability nor live row state was independently verified.
- **Suggestions:** Treat those checks as outstanding evidence. Record successful browser execution and row readbacks before reporting their outcomes.
- **Risk Assessment: MEDIUM.** The plan is well ordered, but its final evidence requires capabilities unavailable in this review session.

## Cross-plan assessment

**Coverage: 17/17 plans reviewed.** The requirement allocation is complete, and D-19’s seed counts, null cases and constructor propagation agree with the source.

**Overall risk: HIGH until the identified contradictions are corrected.** The main issues are executable-plan failures rather than a need to redesign the phase.

Priority fixes:

1. **Reconcile D-20 with converter verification and acidity provenance** in 09-01.
2. **Assign and update the reset and validator fixtures** in 09-09 and 09-11.
3. **Enforce core-scale cardinality inside the import transaction** in 09-10.
4. **Extend the walk’s exact-value checks for embedded D-20 fields** in 09-16.
5. **Specify creation’s late-restore protection** in 09-04 and update file ownership in 09-01/09-07.

The baseline test suite is healthy. These findings concern the prescribed changes and their acceptance checks; the existing passing suite does not establish that those future checks can pass.

---

## OpenCode Review

I'll verify these plans against the actual source. Let me start by exploring the repo.
I've verified the plans against the repo (db.js, sheetCode.js, axes.js, batch.js, transfer.js, versionRow.js, lineage.js, useKeptDraft.js, useVersionPen.js, RecipeList.jsx, router.jsx, main.jsx, Shell.jsx, the seed data files, 08-walk.mjs, and the notes), ran the Sheet-code derivation over the real seed, and read the ingredient dataset. Findings below cite what I checked.

# Cross-AI Plan Review — Phase 9 (round 3)

## 09-01

**Summary.** The converter + reviewed-mapping + before-walk plan is the most externally grounded of the set: the dataset (103 ingredients, `meta.version` "0.2-draft", sources `Goff/Mullan/UB/USDA`) and the six named collision/name rows (`heavy-cream-36`, `lambda-carrageenan`, `whole-milk`, `coconut-milk`) all exist as described. The byte-identical walk contract is achievable: `08-walk.mjs` is 906 lines, line 42 is the server import, line 904 is the `05-walk.mjs` usage message, lines 1–9 are the header/usage block.

**Strengths.**
- The base-commit reasoning is verified: `git log --format='%h %s' 3f23c7f..HEAD -- app/` is empty, so 3f23c7f really is the newest app tree before the phase; the guard that refuses a base when a non-phase commit touches `app/` is sound.
- The conservation check (103 ids each named once across `samePairs ∪ entries`) is a real anti-drop guard; the dataset count is truly 103.

**Concerns.**
- **HIGH — Task 1's own verify contradicts the D-20 amendment.** The verify asserts `Object.values(basis).some(b => b !== 'inherited')` must be empty, but the D-20 paragraph in the same task gives new dairy entries `titratableAcidity` basis `'derived'`. Every new milk-solids entry (e.g. `wholeMilk325`, `buffalo-milk`) makes `bad` non-empty and the gate prints `FAIL`/exits 1. The must-have truth "the basis inherited for every figure" is stale for the same reason. The amendment (and this truth/verify) must be reconciled — e.g. exempt `basis.titratableAcidity` from the all-inherited check.
- **MEDIUM — `app/src/domain/stages.js` (and its one-line test) is created by the D-20 paragraph but is absent from `files_modified`, `artifacts`, and every acceptance criterion.** Plan 09-09 imports `STAGE_IDS` from it, so the ownership gap is real for GSD's file-conflict handling.
- **MEDIUM — the D-20 six coefficients are not mirrored into 09-16's walk allow-list.** `dumpStores` (`08-walk.mjs:169-209`) dumps full `versions`/`batches` records, and `embedFromLibrary` will `structuredClone` the library entry, so adding the six keys to `library.js` (09-07) makes every seeded row's `ingredient` differ at `fatStructural/ownEmulsifier/titratableAcidity/defaultStage/prepNote/requiresHeat` plus `basis.titratableAcidity`/`source.titratableAcidity`. See the cross-plan finding.
- **LOW** — the alcohol/exception pins were recomputed in round 2 and are internally consistent; no new issue.

**Suggestions.** Add `app/src/domain/stages.js` (+`stages.test.js`) to `files_modified`/`artifacts`; fix the verify's basis assertion; forward the six coefficient paths to 09-16.

**Risk.** MEDIUM — the converter is high-value and well-specified, but it currently cannot pass its own automated gate as amended (D-20).

---

## 09-02

**Summary.** The stored-Sheet-code plan is correct and unusually verifiable. I ran `sheetCode()` over `seedRecipeGroups`: 19 versions, 0 duplicates, and every value matches RESEARCH Pattern 4 exactly (`olive-oil-ice-cream-v1` = `64JH-G408`, `mexican-chocolate-v1` = `4144-RCQJ`, …). `sheetCode.js:189-199` filters on `sheetCode(version) === wanted`, so the change to `version.sheetCode` is the right line; the golden vector at `sheetCode.test.js:43` is untouched.

**Strengths.**
- The "stamped copies, direct exports unmutated" test closes a real aliasing hazard (`seedRecipeGroups` must not mutate `oliveOilVersion`).
- The stored-code-differs case (print/find from the field, not the coincidence that they agree) is the right way to prove the field is read.

**Concerns.**
- **LOW** — after 09-02, `findVersionsByCode` reads `version.sheetCode`, but a profile still at DB v9 stores versions without that field, so code search would return `[]` until 09-09's reset forces a reload. Acceptable given the reset, but worth one sentence in the plan.
- **LOW** — the plan leans on 09-10 stamping the direct-export fixtures; that dependency is named, so no action.

**Suggestions.** Note the pre-bump search window explicitly; otherwise as written.

**Risk.** LOW.

---

## 09-03

**Summary.** The two places match the code: `router.jsx` still routes `/notebook` and `/ingredients` to `Placeholder`; `activeWork` exists at `lastEvent.js:111`; `batchCountWords` is genuinely private at `RecipeList.jsx:187`; `repository.listRecipes/getAllBatches/listVersions/listLibrary` all exist. The defensive/repository-failure handling is thoughtful.

**Strengths.**
- `shownFields` defends against an import-accepted but badly-typed entry without weakening the boot validator — a correct separation of concerns (and it is what makes 09-11's "tolerant at display" posture coherent).
- Reusing `activeWork` means Notebook order cannot drift from Home.

**Concerns.**
- **LOW** — the readme "26-entry" vs "103-name" ranges are handled in 09-16 but the merged library will hold ~109 entries, not 103 (83 new + 26); row height is per-row so the range still holds, but the summary wording in 09-16 should not call the current library "103".
- **LOW** — the "Packed state"/non-dairy lactose wording is correctly deferred to 09-17.

**Suggestions.** None material.

**Risk.** LOW.

---

## 09-04

**Summary.** The create-draft contract and `domain/catalog.js` are well-pinned. `draft.js:47` `KINDS`, `:173 declaredOf`, `:264 draftMatchesVersion`, and the hook guard at `useKeptDraft.js:112` are all as cited. The 13-name key list and the "cost of a later change" framing are exactly the kind of contract that prevents silent draft deletion.

**Strengths.**
- Reconciling the payload with criterion 2 (steps/portions now, machine/process removed) is explicit and reasoned, including the supersession of the CONTEXT carry-forward.
- The half-made-draft fit check vs `isScaleDefinition` split (restore vs Save validity) is correct.

**Concerns.**
- **LOW — the CONTEXT carry-forward still says the `create` kind carries "style and machine" (09-CONTEXT.md, "Fixed by earlier decisions").** The plan explains why machine is dropped, but the CONTEXT isn't updated, so a future reader sees a contradiction. Consider a one-line CONTEXT note.
- **LOW** — `CREATE_DRAFT_KEYS` pinned three ways is good; ensure the `draft.test.js` literal list is the one that fails if `blankCreateDraft` gains a key (the plan says it does).

**Risk.** LOW.

---

## 09-05

**Summary.** Verified: 8 seed files define local `embed(` (olive-oil has 13 matches = 1 def + 12 calls, matching the "12" acceptance); `rowFromLibraryRecord` header says the id "never enters the row" (`versionRow.js` top comment) and must be amended; `olive-oil.js:120-121` has `declaredAxes: ['Body','Oil']`, equipment `minFillG: 700`; the 19 `iceEd` blocks hold exactly the values listed (`olive-oil` null, `underbelly-light-base-v1` null, mexican-chocolate v1 `-15`, v2 `-16`, v3 `-16`, v4 `-17`, …), so "17 numbers, 2 nulls" is right.

**Strengths.**
- The D-19 copy rule (serveTempC = the line above's `servingTemperatureC`, written as a plain literal, no expression) keeps the data files plain data, and the `assumption_delta_decision` invariant test is well-formed.
- The enumerated fixture sweep (transfer.test.js as the only hand-built row/equipment source) matches what I found.

**Concerns.**
- **LOW/MEDIUM — D-20 interacts with this plan's embedded rows.** After 09-07 the embedded `ingredient` gains the six keys and `basis/source.titratableAcidity`; this is harmless to 09-05's tests, but the plan's "Consumed later" line should name the walk allow-list need (handled by the cross-plan finding).
- **LOW** — `maxFillG: null` is added to `KITCHEN_EQUIPMENT` and olive oil's block; the validator change ("minFillG/maxFillG null or finite ≥ 0") is fine.

**Risk.** LOW.

---

## 09-06

**Summary.** Verified against source: `useVersionPen.js:199` saves the child via `repository.saveVersion(child)` and `:239` saves over; `RecipePage.shell.test.js:233` pins `['repository.saveVersion(', 2]`; `importAll` (`repository.js:159-180`) is the abort-by-hand template the new `createVersion` copies. The in-transaction uniqueness design is correct for the two-tab race.

**Strengths.**
- Requiring a canonical `sheetCode` on `createVersion` input (TypeError for a code-less caller) is a good caller-bug guard given `sheetCodeProblems` ignores code-less versions.
- The committed colliding id pair (brute-forced) makes the race tests real rather than theoretical.

**Concerns.**
- **LOW** — `saveVersion` now reads all versions inside its transaction on every save; fine at this scale, but note it grows with version count (no index on the store today).
- **LOW** — the marker move (2→1 + `createVersion` 1) and `Shell.flyout`/`importGuard` are correctly identified; no gap.

**Risk.** LOW.

---

## 09-07

**Summary.** Well-amended for D-20 and consistent with the dataset facts I confirmed. The conflict gate (`samePairs[id].differs` quoted, never hand-asserted) and the `candidate(datasetId)` helper (avoiding the undefined lookup for same-pair-only rows like `skim-milk-powder`) are the right fixes from round 1/2.

**Strengths.**
- Separating "converted candidate correctness" from "kept app value preservation" is exactly the distinction the domain needs (the merged library must not be tested against dataset totals).
- The approval precondition (`approvedBy`/`approvedAt`) as the gate's first case closes a resume-out-of-order hole.

**Concerns.**
- **MEDIUM — D-20's six keys are written onto `library.js` here, and the seed merges `{...librarySeedDb, ...library}`; the six then ride every embedded row into 09-16's dumps (cross-plan finding).** Within this plan it's fine; note the downstream effect.
- **LOW** — Task 3 behavior "every composition field … basis inherited" stays correctly scoped to composition fields, so the D-20 `titratableAcidity` basis `derived` doesn't trip it.

**Risk.** LOW–MEDIUM (only because of the downstream walk interaction).

---

## 09-08

**Summary.** Verified the load-bearing facts: `lineage.js:109` `KEYS_COPIED_WHEN_OWNED`, `:140-141` hand-built child with shared `declaredAxes`; `draft.js:12` imports `AXES, STOPS, axesForVersion` and `:176 declaredOf` calls `axesForVersion({declaredAxes})`. The sequencing note (declaredOf must stop calling axesForVersion before 09-11 re-signs it) is correct and important.

**Strengths.**
- Keeping the union (core keys + declared keys) in `declaredOf` until 09-15, with core-only/declared-only/combined mark tests written first, prevents a green-suite break.
- Pairing `createRecipe`'s root and `createChildVersion`'s child in one task because `creation-roundtrip.test.js` pins child keys = root keys is exactly right.

**Concerns.**
- **LOW/MEDIUM — `serveTempC: parent.serveTempC` is an unconditional copy**, unlike the `Object.hasOwn`-guarded keys in `KEYS_COPIED_WHEN_OWNED`. A hand-built parent in a test that lacks the key would give the child an own `serveTempC: undefined`, which 09-05's "when the key is present, null or finite" check and 09-10's required key both reject. Either guard with `Object.hasOwn(parent,'serveTempC')` or enumerate the hand-built-parent fixtures. Verify the plan's claim that "every parent owns the key" holds for every test parent, not just seeded ones.
- **LOW** — `newRecipe.test.js` 18→19 keys is correctly noted.

**Risk.** LOW–MEDIUM.

---

## 09-09

**Summary.** The bump plan is verified against `db.js` (DB_VERSION 9, reset `< 8`), `seedLibraryIfEmpty` (`repository.js:130-152`, the transaction pattern to generalise), `seedOldProfile` (`db.test.js:49`), and the literal pins (`db.test.js:84/116/152/224/270`, newer open at `:284`; `db-reset.test.js:98/169`). The two ratchets (behavioural at literal v10, static anchored on `oldVersion < 10`) are the right shape.

**Strengths.**
- The `09-dist-guard.sh` fingerprint of the main checkout's `app/dist` (resolved via `--git-common-dir` from a worktree) mechanises the reset's safety premise — a genuine improvement from round 2.
- `upgradeStores` exported for direct driving is what makes both ratchets implementable.

**Concerns.**
- **MEDIUM — the D-20 propagation gap reaches the boot validator.** After D-20, `validateLibraryRecord` requires the six keys as own keys; plan 09-11's boot-check fixture omits them (see 09-11). Within 09-09 the amended validator and the truth are internally consistent, and the db-upgrade test asserting "every library record passes validateLibraryRecord" is right.
- **LOW** — the `--outDir`-scan premise depends on every plan's automated line carrying `--outDir`; I checked 09-02/03/11/13/15/16/17 and `08-walk-check.sh` — all do. Keep it that way when amending.
- **LOW** — `VERSION_SCHEMA_VERSION`/`BATCH_SCHEMA_VERSION` left unchanged is fine (nothing branches on them).

**Risk.** MEDIUM.

---

## 09-10

**Summary.** Store file schema 9 + import code checks are well-specified; `transfer.js:11-12` imports the domain constants today, `validateDeclaredAxes` at `:345` uses `DECLARED_AXIS_NAMES` (`:16`), `STORE_SCHEMA_VERSION` at `:29`. The `storeFileOf` builder and the enumerated sweep are the right response to round 1's fixture churn.

**Strengths.**
- `fileCoreKeys` never throwing on malformed nested scales (with the scales array reporting its own errors) is a real robustness fix.
- The two-level race test (direct `importAll` for the abort, wrapped `importStore` for the message) correctly separates the two behaviours.

**Concerns.**
- **MEDIUM — requiring `serveTempC` on every imported version is a new hard requirement derived from D-19.** The justification (schema-8 files refused first; every schema-9 file comes from a build that writes it) is sound *only if* no schema-9 build ever shipped without the field. Since the phase's guard says no build reached a device mid-phase, this holds — but it is the one place a future "schema-9 without serveTempC" file would be refused rather than tolerated. Consider noting the lift-later posture explicitly (as the plan does for the file-schema bump).
- **LOW/MEDIUM — the merged-scales cardinality pre-check (exactly `CORE_SCALE_COUNT` core rows) is an invented constraint**, only tangentially in LIB-09/D-14. It is surfaced on the decide row, but it adds a refusal path a maker could hit on a legitimate import (e.g. importing a file into a profile whose core rows were hand-edited). Flag it as the deliberate design choice it is.

**Risk.** MEDIUM.

---

## 09-11

**Summary.** Catalog load/boot-check/reload is well-designed and matches `main.jsx` (seed then `App`), `Shell.jsx:334-353` (`setImportErrors([]); setStoreRevision(...)`), `PrintLogPages.jsx:172/186/195`, and `PrintSheet.jsx:164`. The real-provider test and the failed-reload line (`IMPORT_RELOAD_LINE`) are good additions.

**Strengths.**
- Making `catalogFrom` the single sorting boundary and proving the key-order→order-field case in `store/catalog.test.js` (with `axesForVersion` proven to keep its given order) resolves the round-1 ordering contradiction cleanly.
- The `IMPORT_RELOAD_LINE` branch (truthful "the file was imported") plus holding `storeRevision` is the right recovery for a post-commit reload failure.

**Concerns.**
- **MEDIUM — Task 2's boot-check fixture is now inconsistent with D-20.** The behavior case expects `firstDamagedTable` to return `null` for `{ id:'odd', entry:{ name:'Odd', category:{x:1}, note:42, densityGPerMl:'heavy', composition:{fat:0.1} } }`, but after 09-09's D-20 amendment `validateLibraryRecord` requires the six coefficient keys as own keys, so this entry is *refused* at boot. The fixture must gain the six keys (null) for `null` to be the correct expectation. This plan was not amended for D-20.
- **LOW/MEDIUM — the CORE_SCALE_COUNT boot refusal is an invented constraint** (the record pen's desktop grid places four). Surfaced on `decide-p9-boot-check-scope`, so acceptable, but it is a boot-stopping refusal on a shape the CONTEXT never bound.

**Risk.** MEDIUM.

---

## 09-12

**Summary.** Correctly scoped down from 09-11 (log only; the pen is here). `BatchRow.jsx:4/269/622/1042-1055/1091` and `RecipePage`'s hooks-above-early-returns, plus `RecipePage.shell.test.js:468-480` (each import used ≥2×) are all as cited. The `useCatalog`-import-used-twice accommodation is real.

**Strengths.**
- Making provider coverage an *executed* check (mount without a provider throws) rather than a text grep is the right resolution.
- `BatchRow` staying prop-only (no context import) keeps it presentational.

**Concerns.**
- **LOW** — the cardinality test (four renamed core + two declared, both arrangements) is good; ensure it also keeps `SEED_CATALOG` unmutated.
- **LOW** — `RecipePage.shell.test.js` is correctly run in Task 1's verify.

**Risk.** LOW.

---

## 09-13

**Summary.** The snapshot-of-catalog change is well-guarded by the contained-failure gate (data files build batches at module load, so a mistake cascades). The `createBatch` interface change, the six seeded data files (12 calls), and the caller list all match a fresh grep. `axes.js` handing kind-aware presentation to Phase 12 is a correct scope boundary.

**Strengths.**
- The single-task-wide red window plus the JSON-reporter gate that only tolerates the Task 2 file set is a strong mechanism.
- The copy-independence test on `structuredClone(SEED_CATALOG)` (not the shared fixture) is right.

**Concerns.**
- **LOW/MEDIUM — `axesForBatch` spreading `snapshot.coreScales` makes any hand-built snapshot without it throw.** Plan 09-12 removed BatchRow.test stand-ins and `db-reset.test.js:161` reads a *seeded* batch (which gains `coreScales` in this plan's data files), so the risk is contained — but confirm no other test hand-builds a snapshot for `axesForBatch` (grep found only `axes.test.js`, `db-reset.test.js`, `BatchRow*`).
- **LOW** — the `creation-roundtrip.test.js` snapshot key list (add `coreScales`, `coreProblems`) is correctly called out.

**Risk.** LOW–MEDIUM.

---

## 09-14

**Summary.** The split-off import-checks plan is clean: `validateBatch` at `transfer.js:414-419` and `validateMarks`/`validateTasting` around `:255/:295` match the citations; snapshot-based validation is the correct D-03a reading. The magnitude/renamed round trip directly exercises TASTE-03.

**Strengths.**
- Judging a batch only by its own snapshot (accept a defect the receiving table lacks; refuse a mark the snapshot lacks) is the precise D-03a contract.
- `CORE_SCALE_COUNT` enforced on snapshots closes the "table the record pen can't place" hole.

**Concerns.**
- **LOW** — `validateDeclaredAxes` on a batch snapshot now takes the snapshot's core keys; on a version it takes the file's scale keys (09-10). This dual source is correct but subtle; the plan states it.

**Risk.** LOW.

---

## 09-15

**Summary.** Verified the constants to remove (`axes.js:17 AXES`, `:30 CORE_AXIS_COUNT`; `battery.js:46 DEFECTS`) and that `transfer.js` no longer imports them after 09-14. `draft.js:176` is the one in-domain caller to move to the catalog. The static seed-data scan and the "stability changes a *marked* scale" fix are correct.

**Strengths.**
- Honest framing of the scan as a static-import architectural guard with the runtime reads proven behaviourally.
- Changing Sweetness (marked 4 on the 2 Aug batch) rather than Hardness makes the stability proof non-vacuous — a real round-1 fix.

**Concerns.**
- **LOW — the second scan case ("array literal holding all four problem words or all six scale names") needs the `stripComments` + bracket-bound care the round-2 note already raised; the plan now says both. Verify the exempt `app/src/data/core-problems.js`/`core-scales.js` (inside `data`) don't trip it — they don't, by the "outside app/src/data" clause.**
- **LOW** — confirm `draft.js` loses its `AXES` import in Task 1 (it also imports `STOPS`, which stays).

**Risk.** LOW.

---

## 09-16

**Summary.** The walk allow-list, required-additions pass, selftest, expected-value pre-check, and two-mode places check are the right security posture for D-15. The split-out from round 2 is a good call. **But the D-20 amendment never reached this plan, and that is the review's most important finding.**

**Strengths.**
- The required-additions pass (a field absent from *both* files produces no diff, so differences alone can't prove an addition) is exactly the gap round 1 flagged.
- The expected-mode pre-check (with the allow-list's own functions) closes the "allow-list is only as good as its expected-value functions" gap.

**Concerns.**
- **HIGH — the allow-list omits the six D-20 coefficient paths and their basis/source companions.** `dumpStores` (`08-walk.mjs:169-209`) dumps full `versions` and `batches`, embedding each row's `ingredient` copy. Because `embedFromLibrary` does `structuredClone(library[key])` and 09-07 adds `fatStructural/ownEmulsifier/titratableAcidity/defaultStage/prepNote/requiresHeat` (plus `basis.titratableAcidity`/`source.titratableAcidity`) to `library.js`, every seeded version row and batch snapshot row gains these keys vs. the base-commit before-walk. The plan's `ALLOWED_STORE_PATHS` (sheetCode, libraryId, maxFillG, declaredAxes, coreScales/coreProblems, serveTempC) covers none of them, and the plan says "any other difference fails" and "no snapshot is skipped whole". The walk would emit DIFF lines for these paths and the plan would stop. Fix: add the nested path family `versions[i].rows[j].ingredient.<six>` and `.basis.titratableAcidity` / `.source.titratableAcidity` (and the same under `batches[i].snapshot.rows[j].ingredient.*`), each with expected values read from `data/library.js` by the row's `libraryId` (null-safe for the two strawberry local definitions). `09-16-PLAN.md` currently contains zero mentions of the six.
- **LOW — "the 103-name board's numbers" for `--library current`.** The merged library is ~109 entries (83 new + 26), so the wording is imprecise even though per-row heights still hold. Read all counts from the store (the plan already does).

**Suggestions.** Amend 09-16's allow-list and required-additions pass for the six coefficients + basis/source; add a selftest doctoring of one coefficient path.

**Risk.** HIGH as written (the phase's central "maker sees no change" proof would fail).

---

## 09-17

**Summary.** Verified the base build, the `09-dist-guard.sh` hand-over gate, and the device-row/Mark's-List work. The WebKit 9→10 reset with a reopen on the same origin is the right complement to the fake-indexeddb proof. The `09-places-check.mjs --library current` walk of the device steps matches the round-1 memory rule.

**Strengths.**
- Refusing to write the device row when `app/dist` changed is the correct consequence of the recorded reset decision.
- Reading `decide-p9-boot-check-scope` back rather than acting on it respects the List protocol.

**Concerns.**
- **MEDIUM — this plan's WebKit reset check and places walk inherit the D-20 gap indirectly:** the reset check reads specific fields (code, serveTempC, table counts), so it is *not* affected by the six coefficients; the two places don't show them. So 09-17 is largely safe — but the `--library current` run depends on 09-16's script, which needs the six fix. Note the dependency.
- **LOW** — the device-row detail correctly names decisions 2/5 as recorded, not re-confirmed.

**Risk.** MEDIUM (dependent on 09-16).

---

## Cross-plan findings (new this round)

1. **HIGH — D-20's amendment is incomplete across the plan set.** D-20 was applied to 09-01, 09-07, 09-09 (as the prompt states), but its effects reach **09-16** (walk allow-list / required additions — missing entirely) and **09-11** (boot-check fixture now refused by the stricter validator), and it **contradicts 09-01 Task 1's own verify**. The amendment should propagate to all four before execution.
2. **MEDIUM — missing ownership entry:** `app/src/domain/stages.js` (+ test) is created by 09-01 but declared nowhere.
3. **LOW — CONTEXT carry-forward staleness:** "the `create` draft kind carries … style and machine" contradicts 09-04's (correct) removal of machine; the CONTEXT was updated for D-19 but not this line.
4. **LOW/MEDIUM — invented constraints** (`CORE_SCALE_COUNT` at boot/import/snapshot, merged-scales cardinality) are reasonable but go beyond LIB-09/D-14 wording; they are surfaced on `decide-p9-boot-check-scope`, which is the right mitigation.

## Verification notes
- Confirmed by running: 19 seeded Sheet codes match RESEARCH Pattern 4 exactly (0 duplicates).
- Confirmed by reading: dataset (103, sources, ids), `db.js`, `sheetCode.js`, `axes.js`, `batch.js`, `battery.js`, `transfer.js`, `versionRow.js`, `lineage.js`, `useKeptDraft.js`, `useVersionPen.js`, `repository.js`, `RecipeList.jsx`, `main.jsx`, `router.jsx`, `Shell.jsx`, `seed.js`, all eight seed data files' `embed`/`iceEd`/equipment, `08-walk.mjs` (length + cited lines), style-bands note, `RecipePage.shell.test.js` markers, `db.test.js` pins and `seedOldProfile`.
- Could not execute the Vitest suite or the WebKit harness in this review; the runtime-read claims are traced statically.

## Overall risk assessment: MEDIUM–HIGH

The architecture is sound and almost every plan is well-evidenced against the real code; the base-commit, code table, and dataset facts all check out. What keeps this at MEDIUM–HIGH is that a very recent, in-place amendment (D-20) was applied to only three plans while its blast radius covers at least two more, and one of the three it touched now fails its own automated verify. These are mechanical, fixable gaps, not design flaws — but the phase cannot pass its own gates as the files currently stand. Recommend: reconcile 09-01's verify/must-have with D-20, add `stages.js` to 09-01's manifest, propagate the six coefficient paths to 09-16 (and fix 09-11's boot fixture), then proceed.

---

## Consensus Summary

Round 3, after the in-place D-20 amendment at 163f008 (six per-ingredient coefficients). Round 2 (OpenCode only) is in git at 18d4c5b and earlier; round 1 (OpenCode and Codex) at 47604aa. Both reviewers read the repo and cited `file:line` evidence; both covered all 17 plans. Neither could run WebKit; Codex ran the Vitest baseline (96 files, 3,007 tests passing), OpenCode ran the Sheet-code derivation over the seed (19 codes, 0 duplicates).

### Agreed Strengths
- The architecture and the non-D-20 plans are sound and well evidenced: stored Sheet code (09-02), transactional uniqueness (09-06), the catalog boundary (09-11 to 09-15), the batch snapshot (09-13, 09-14) and the reset ratchets (09-09) all match the source they cite.
- D-19's seed facts check out: 17 numeric Ice Ed temperatures and 2 nulls, constructors propagate the field, the Phase 8 walk dumps whole records.
- Base commit 3f23c7f is the newest app change; the dist guard mechanises the reset's safety premise.

### Agreed Concerns
- **HIGH, both: the D-20 amendment is incomplete.** It was applied to 09-01, 09-07 and 09-09, but its blast radius covers 09-16 (the walk allow-list has no path for the six coefficients or the acidity basis/source entries, so a correct D-20 seed cannot MATCH) and 09-11 (the boot-check "odd display fields" fixture omits the six keys and would now be refused by the stricter validator).
- **HIGH, both: 09-01 Task 1's own verify contradicts D-20.** The verify rejects any basis other than `inherited`, while the amendment gives dairy entries `basis.titratableAcidity = 'derived'`; the all-inherited must-have truth is stale for the same reason.
- **MEDIUM, both: `app/src/domain/stages.js` (and its test) is created by 09-01 but owned nowhere** (not in files_modified, artifacts or acceptance), while 09-09 imports it.
- **MEDIUM, both: 09-07 edits `app/src/data/library.js` but does not list it**, and its tests pin key presence only, not representative coefficient values or acidity provenance.
- **MEDIUM, both: the CORE_SCALE_COUNT cardinality rule is an invented constraint** beyond LIB-09/D-14 wording; Codex adds that 09-10 checks it only before the import transaction, so two racing imports can leave five core scales, which boot then refuses. Surfaced on `decide-p9-boot-check-scope`.

### Divergent Views
- Codex (HIGH) finds existing tests the 09-09 reset necessarily invalidates and that the plan does not own: `library.test.js:182-204` (a version-8 profile keeps its records) and `transfer.test.js:875-878` (a bare library entry accepted). OpenCode did not raise these.
- Codex (MEDIUM) flags 09-04's removal of the late-read protection in `useKeptDraft.js:126-130` as a way a late restore can overwrite typed input; OpenCode found 09-04 LOW risk and only asks for a CONTEXT carry-forward note (the `create` kind no longer carries machine).
- Codex (LOW) asks whether the two recipe-owned strawberry definitions in 09-05 also get the six nullable fields; OpenCode notes the walk fix must be null-safe for them. Same gap, different plan.
- OpenCode (LOW/MEDIUM) flags 09-08's unconditional `serveTempC: parent.serveTempC` copy (a hand-built parent without the key yields an own `undefined`, which 09-10's required-key check refuses); Codex found 09-08 clean.
- OpenCode (MEDIUM) notes 09-10's hard requirement of `serveTempC` on every imported schema-9 file; Codex did not.
- Cultured dairy: Codex (MEDIUM) says applying `msnf × 0.017` to yogurt labels a measured-or-label value as derived; D-20 names cultured dairy `estimated`. The converter rule in 09-01 should exclude yogurt-category rows.

Overall: Codex HIGH, OpenCode MEDIUM–HIGH. Both say the gaps are mechanical, not design flaws: propagate D-20 to 09-16 and 09-11, reconcile 09-01's verify and truth, add the file ownership lines, then execute.
