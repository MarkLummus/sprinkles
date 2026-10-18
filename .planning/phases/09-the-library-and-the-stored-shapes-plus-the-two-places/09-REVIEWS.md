---
phase: 9
reviewers: [codex, opencode]
reviewed_at: 2026-10-18T22:59:39Z
plans_reviewed: [09-01-PLAN.md, 09-02-PLAN.md, 09-03-PLAN.md, 09-04-PLAN.md, 09-05-PLAN.md, 09-06-PLAN.md, 09-07-PLAN.md, 09-08-PLAN.md, 09-09-PLAN.md, 09-10-PLAN.md, 09-11-PLAN.md, 09-12-PLAN.md, 09-13-PLAN.md, 09-14-PLAN.md, 09-15-PLAN.md, 09-16-PLAN.md, 09-17-PLAN.md]
models:
  codex: "gpt-6.1-sol (reasoning=high)"
  opencode: "openrouter/qwen/qwen3.8-max-0902#high"
model_sources:
  codex: "banner"
  opencode: "pinned"
---

# Cross-AI Plan Review — Phase 9

<!-- gsd:plan-revision-conflicts:begin -->
## Plan-Revision Conflicts

<!-- gsd:plan-revision-conflicts:end -->

Round 4, after the round-3 replan at 92d6761 and 9d928f4. Round 3 is in git at 3869044; round 2 (OpenCode) at 18d4c5b; round 1 (OpenCode and Codex) at 47604aa. The OpenCode lane (Qwen3.8 Max) timed out at the 11-minute floor on its first attempt and completed on a retry with a 40-minute cap; the lane is pinned back to DeepSeek v4.1 Flash for later rounds.

## Codex Review

Reviewed against source at `40b10c2`, including the prior dispositions. Baseline verification passed: **96 files, 3,007 tests**. No implementation changes were made; phase-specific browser and device evidence remains outstanding.

## 09-01

**Summary.** The converter, review checkpoint and reproducible baseline are well specified. The previous D-20 contradictions appear resolved.

**Strengths**
- Lactose subtraction matches the actual engine: lactose is added independently of the dairy flag at `app/src/domain/composition.js:35`, then contributes to PAC and POD at `:43`.
- The baseline captures meaningful behavior: fields and focus at `08-walk.mjs:150`, page-text hashes at `:166`, and stored records at `:170`.

**Concerns**
- No new material finding. I confirmed the input contains 103 ingredients and that no `app/` commit follows the proposed base, `3f23c7f`.

**Suggestions**
- Retain the independent known-answer tests alongside the generated conservation checks; they establish different things.

**Risk assessment: MEDIUM.** Conversion judgments require review, but the checkpoint and numerical checks provide appropriate controls.

## 09-02

**Summary.** Stored codes are introduced across the correct constructors and readers, with useful tests distinguishing stored values from recomputed ones.

**Strengths**
- Both print dependencies are real: `app/src/ui/PrintSheet.jsx:125` and `app/src/ui/PrintSheetPages.jsx:84` currently compute codes.
- Search currently hashes each candidate at `app/src/domain/sheetCode.js:193`; the proposed stored-field comparison removes that dependency.
- Running the existing derivation over all 19 seeded versions confirmed the listed codes.

**Concerns**
- No new material finding.

**Suggestions**
- Preserve the stored-code-differs tests and the exact seed-id/map equality check.

**Risk assessment: LOW.** The affected readers and constructors are explicitly covered.

## 09-03

**Summary.** The places follow the approved interaction contract and defend against optional fields that existing import validation accepts.

**Strengths**
- Reusing `activeWork()` preserves Home’s actual ordering and grouping mechanism at `app/src/domain/lastEvent.js:111`.
- Defensive display handling is justified: `validateLibraryRecord` checks name and composition but leaves cosmetic fields unchecked at `app/src/store/transfer.js:221`.
- Preventing form submission follows the existing implementation at `app/src/ui/SheetCodeSearch.jsx:68`.

**Concerns**
- No new material finding. The earlier missing submission handling is now addressed.

**Suggestions**
- Keep visual evidence separate from dimension checks, particularly for expanded provenance tables.

**Risk assessment: MEDIUM.** Responsive conformance remains execution work, but the specified checks are concrete.

## 09-04

**Summary.** The incomplete-input and late-restore contracts are strong, but the supposedly complete creation shape still lacks step-allocation history.

**Strengths**
- The new branch addresses the hook’s actual version prerequisite at `app/src/ui/useKeptDraft.js:112`.
- The deferred-read test extends the existing protection at `:126`, rather than assuming an immediate repository response.

**Concerns**
- **MEDIUM — Step keys can be reused after deletion and restoration.** The strict payload contract at `09-04-PLAN.md:122` stores the current method but no allocation watermark or issued-key history. `app/src/domain/stepKeys.js:24` derives the next key solely from remaining steps; its safety explicitly depends on retaining removed steps at `:4`. I reproduced allocating `3`, deleting that step, and receiving `3` again. Phase 11 instead requires outright removal and no reused key in `.planning/ROADMAP.md:221`.

**Suggestions**
- Settle a persistent watermark or issued-key ledger now, for both kept creations and editable first versions.
- Add an add → remove highest step → persist → restore → add case.

**Risk assessment: MEDIUM.** The immediate hook behavior is covered; the frozen shape does not yet support the promised later deletion behavior.

## 09-05

**Summary.** Library links, equipment limits and serving-temperature literals align with the existing data.

**Strengths**
- The link preserves an established copy boundary: `app/src/domain/versionRow.js:65` and `app/src/data/olive-oil.js:54` already clone ingredient records.
- The two strawberry exceptions are genuinely separate definitions at `app/src/data/strawberry.js:34` and `:52`.
- I verified all 19 Ice Ed temperatures: 17 numbers and the two specified nulls.

**Concerns**
- No new material finding. The six nullable coefficients now cover the recipe-owned definitions too.

**Suggestions**
- Keep the copy-independence assertion separate from link round-trip assertions.

**Risk assessment: LOW.** The changes preserve existing figures and have explicit exceptions.

## 09-06

**Summary.** Transactional uniqueness and failed-save recovery are appropriately separated.

**Strengths**
- The current unchecked write is precisely located at `app/src/store/repository.js:32`.
- The existing rejection handler leaves the pen open and releases the save lock at `app/src/ui/useVersionPen.js:211`.
- The architectural marker requiring two saves currently exists at `app/src/ui/RecipePage.shell.test.js:233`; its planned replacement preserves the check’s purpose.

**Concerns**
- No new material finding within the prescribed production write paths.

**Suggestions**
- Retain both concurrency and UI retry tests: transaction serialization does not establish input preservation.

**Risk assessment: LOW.** The plan covers persistence enforcement and recovery behavior directly.

## 09-07

**Summary.** The merge, approval gate and separation of converted candidates from retained app values are sound.

**Strengths**
- The invariant targets the engine’s real lactose contribution at `app/src/domain/composition.js:43`.
- Keeping candidate correctness separate from retained-value preservation respects the existing copied-entry mechanism at `app/src/data/olive-oil.js:57`.
- The base-file comparison supplements the otherwise weaker assertion that stored entries equal the newly edited `library.js`.

**Concerns**
- No new material finding. File ownership and representative D-20 values are now explicit.

**Suggestions**
- Preserve the base-file comparison as durable verification evidence, since it establishes that pre-existing fields stayed unchanged.

**Risk assessment: MEDIUM.** Dataset interpretation remains consequential, but approval and numerical gates cover it.

## 09-08

**Summary.** Definition cloning and temperature propagation are correct; one creation-related stored contract remains unspecified.

**Strengths**
- `createChildVersion` currently shares declared arrays at `app/src/domain/lineage.js:141`; cloning fixes a real alias.
- Coordinating root and child changes respects the exact-key invariant at `app/src/store/creation-roundtrip.test.js:107`.

**Concerns**
- **MEDIUM — Open design question: where does the selected style persist?** The creation draft defines a style id at `09-04-PLAN.md:122`, and Phase 11 promises to save the authored style at `.planning/ROADMAP.md:214`. However, `createRecipe` has no style field at `app/src/domain/newRecipe.js:62`, and the child constructor has no style-copy rule at `app/src/domain/lineage.js:130`. This plan fixes the root at 19 keys without settling that representation.

**Suggestions**
- Define whether a saved version carries a style id, a snapshot, or only copied defaults. If selection persists, specify validation and child propagation now.

**Risk assessment: MEDIUM.** Current changes are sound, but the “all stored shapes settled” claim remains incomplete.

## 09-09

**Summary.** The reset, historical-version ratchet and rollback proof are strong. Collection-level problem identity needs an additional invariant.

**Strengths**
- The existing synchronous, guarded upgrade at `app/src/store/db.js:24` supports the proposed bounded reset.
- The rewritten historical test correctly replaces the preservation expectation at `app/src/store/library.test.js:182`.

**Concerns**
- **MEDIUM — Distinct problem ids may carry duplicate names.** The planned validator checks rows individually at `09-09-PLAN.md:224`, while problem identity in tastings is the word itself: `app/src/store/transfer.js:295`. Two valid rows with different ids and the same name can therefore enter the catalog. The planned batch constructor copies both names, but `09-14-PLAN.md:95` requires unique snapshot problem words. A catalog accepted by the app could produce an export its own validator rejects.

**Suggestions**
- Add a shared collection check for unique problem names.
- Apply it to boot and the resulting imported table, and test recording/export after an attempted duplicate-name import.

**Risk assessment: MEDIUM.** Reset coverage is strong; the catalog acceptance contract needs to match snapshot validity.

## 09-10

**Summary.** The transactional count race is now fixed, but two execution blockers remain.

**Strengths**
- Extending the explicit-abort transaction at `app/src/store/repository.js:158` preserves atomic import.
- The existing consistent export transaction at `:185` provides the correct foundation for eight-store export.

**Concerns**
- **HIGH — Four core scales does not guarantee non-conflicting scale identities.** The plan validates incoming versions against file keys, then checks only the resulting core count (`09-10-PLAN.md:114`). A file containing no versions can demote `sweetness` and promote `oil` to core. The count remains four, while the retained olive-oil version still declares Oil at `app/src/data/olive-oil.js:120`. The planned reader then returns Oil twice under one mark key; a newly recorded batch subsequently fails the planned core/declared collision validator. I traced this merge and obtained combined keys ending `oil, body, oil`.
- **HIGH — The fixture sweep incorrectly excludes a necessarily failing test.** `09-10-PLAN.md:131` says old exports are refused before arrays are read. Actual validation records a schema error at `app/src/store/transfer.js:577` and continues through the arrays at `:583`. `app/src/ui/Shell.flyout.test.jsx:354` explicitly expects **four** errors; requiring four more arrays makes that expectation **eight**. Neither planned wrapping nor the current sweep updates it.

**Suggestions**
- Inside the write transaction, check core-key compatibility across the **resulting versions and scales**, including retained local versions.
- Test successful import → record → export → validate for the promotion scenario.
- Assign the Shell assertion update explicitly and reconcile file ownership/dependencies with the Shell test changes.

**Risk assessment: HIGH.** An accepted import can create inconsistent records, and the prescribed full-suite gate cannot pass unchanged.

## 09-11

**Summary.** Catalog delivery and truthful recovery are improved, but freezing `storeRevision` does not fully contain a failed reload.

**Strengths**
- Boot already has a pre-mount failure boundary at `app/src/main.jsx:27`.
- The real-provider test improves on merely checking the current revision increment at `app/src/ui/Shell.jsx:352`.

**Concerns**
- **MEDIUM — Navigation bypasses the proposed stale-data containment.** Holding `storeRevision` prevents one refresh, but navigation remains available through `app/src/ui/Shell.jsx:445`. A different version route remounts `RecipePage` at `app/src/router.jsx:80`, and `app/src/ui/useRecipeData.js:32` reads newly imported records independently of the revision. Those records can render against the old catalog.
- **LOW — The surrounding heading still contradicts successful import.** Putting `IMPORT_RELOAD_LINE` into the existing panel leaves its title reading “This file can’t be imported” at `app/src/ui/Shell.jsx:421`.

**Suggestions**
- Use an explicit post-commit recovery state that prevents record editing/navigation until catalog reload succeeds or the page reloads.
- Test navigation after reload failure and give the recovery state an accurate heading.
- Clarify that the empty-list acceptance case at `09-11-PLAN.md:167` excludes an empty scales table.

**Risk assessment: MEDIUM.** The normal path is covered; failure containment remains incomplete.

## 09-12

**Summary.** The route-level context read and presentational prop boundary fit the existing components.

**Strengths**
- Fresh recording and correction already select different sources at `app/src/ui/BatchRow.jsx:624`.
- The desktop grid really has four explicit positions at `app/src/ui/BatchRow.jsx:240`, supporting the proposed arrangement tests.
- The import-name source check exists at `app/src/ui/RecipePage.shell.test.js:470`, and the plan accommodates it.

**Concerns**
- No new material finding in provider coverage or the caller sweep.

**Suggestions**
- Keep the route tracer and direct component tests; neither substitutes for the other.

**Risk assessment: MEDIUM.** Numerous fixtures change, but their ownership is explicit.

## 09-13

**Summary.** Snapshot creation and historical reading align with the existing batch lifecycle.

**Strengths**
- `createBatch` already takes one-time copies at `app/src/domain/batch.js:184`; extending that boundary is appropriate.
- `completeRecord` preserves the snapshot through its spread at `app/src/domain/batch.js:206`.
- The contained-failure gate addresses module-load seed construction rather than waiting for the final suite.

**Concerns**
- No additional caller or snapshot-copy finding. Accepted-catalog validity needs the collection invariant identified in 09-09.

**Suggestions**
- Include a constructor/export validity case using a catalog that has passed the shared catalog checks.

**Risk assessment: MEDIUM.** The caller sweep is broad, but its intermediate failure boundary is controlled.

## 09-14

**Summary.** Snapshot-based validation establishes the intended independence from live catalog definitions.

**Strengths**
- Current core-defect validation reads the global list at `app/src/store/transfer.js:295`; replacing it addresses the actual dependency.
- The From freezer exclusion reads the tasting’s own values at `app/src/store/transfer.js:318`, so it can remain unchanged.
- The magnitude/rename round trip exercises more than the incumbent Body/Oil definitions.

**Concerns**
- No new material finding in this plan’s validation boundary.

**Suggestions**
- Preserve the receiving-catalog-missing-word test; it demonstrates that snapshot validation is actually used.

**Risk assessment: LOW.** The plan directly tests its central historical-data guarantee.

## 09-15

**Summary.** The final constant retirement and marked-scale stability proof are well targeted.

**Strengths**
- Both draft dependencies are real: global axis keys at `app/src/domain/draft.js:146` and global problem words at `:165`.
- Testing Sweetness and Oil targets definitions the seeded batch actually marked, rather than an unused scale.
- The architectural scan’s stated limits appropriately distinguish static imports from runtime behavior.

**Concerns**
- No new material finding in the retirement or stability work.

**Suggestions**
- Keep the assertion that each table/child edit actually landed before asserting the historical batch stayed unchanged.

**Risk assessment: MEDIUM.** The sweep is extensive, but the tests address observable independence.

## 09-16

**Summary.** The comparison now checks expected additions independently and tests its own refusal behavior.

**Strengths**
- The existing `diffLeaves` reports absent-to-object additions as whole values at `08-walk.mjs:843`, matching the proposed exact-value checks.
- Required-field checks address the real limitation of comparison at `:855`: fields missing from both inputs produce no difference.
- Separate library modes match the distinct measurement datasets recorded in `.planning/sketches/012-places/README.md:46` and `:51`.

**Concerns**
- No new material finding in the allow-list or evidence design.

**Suggestions**
- Keep doctored-file selftests separate from the seed-based expected-value checks; their failure modes differ.

**Risk assessment: MEDIUM.** The verifier is substantial, but its negative tests provide useful protection against false passes.

## 09-17

**Summary.** The final-build reset check and explicit evidence handoff complete the planned verification boundary.

**Strengths**
- A same-origin browser upgrade supplements the existing fake-IndexedDB tests and exercises the real upgrade path at `app/src/store/db.js:10`.
- Reopening with a retained draft distinguishes successful initial reset from repeated destruction.
- Actual row readbacks match the concurrency requirement in `CLAUDE.md:132` that existing-row writes use a read version.

**Concerns**
- No new implementation finding. ArtifactData was unavailable in this review, and the proposed browser scripts do not exist yet, so neither List outcomes nor phase-specific browser PASS results are verified.

**Suggestions**
- Keep those results pending until actual runs and readbacks exist, as the plan requires.

**Risk assessment: MEDIUM.** Completion depends on browser execution and the external List connection.

## Overall assessment

**Request changes before execution.** The previous round’s major fixes are substantially incorporated. The principal remaining blockers are both in **09-10**: resulting-store scale compatibility and the missed Shell assertion.

Also settle step-allocation history, the saved-style representation, unique problem names, and post-import reload failure containment. These are bounded contract fixes; the 17-plan structure otherwise provides strong coverage of the phase goals.

---

## OpenCode Review

The plans are in the repo and the base state looks right. Let me verify the load-bearing claims against source, in batches.


# Cross-AI Plan Review — Phase 9 (Round 4)

**Verification basis.** I checked the plans against the working tree at `40b10c2`. Every line citation below was read this session. Spot-checks included: `db.js` (DB_VERSION 9, reset branch, guarded creates), `sheetCode.js` (derivation tags, `printedContent`'s explicit exclusion list, golden vector at `sheetCode.test.js:43`), `transfer.js:11-12,29,255,273,345,613,875-879`, `repository.js:6-17,32-35,158,185`, `lineage.js:109,141-142`, `newRecipe.js` + `newRecipe.test.js:36-38`, `creation-roundtrip.test.js:107-108,147`, `draft.js:12,47,112,146,165`, `useKeptDraft.js:61-81,112`, `RecipePage.shell.test.js:233,263-267,468`, `RecipePage.jsx:39,142,267,305-317,462`, `RecipeList.jsx:93-101,187`, `router.jsx:112-127`, `axes.js:17-30,49-66`, `battery.js:1,46`, `BatchRow.jsx:3-4,186,269,624,1042-1051`, `PrintLogPages.jsx:172,186,195` + `PrintLogPages.test.jsx:164-174`, `useVersionPen.js:192,199,239`, `useBatchRecording.js:468`, `main.jsx`, `Shell.jsx:334-354`, `seed.js`, `library.js` (26 keys, msnf values, heavyCream basis, sucrose/locust fields), all eight data files (embed, iceEd counts/values, strawberry constants at `strawberry.js:34,52,108,206-207`), `db.test.js` (5× `toBe(9)`, open-at-10 at :284-292), `db-reset.test.js` (2 pins), `library.test.js:158,182`, `pen-note-roundtrip.test.js:47,64`, `penDraft.test.js:586`, `transfer.test.js:1512-1520`, `08-walk.mjs` (906 lines, import at :42, usage at :904, `diffLeaves` at :843-856, counter ids at :98,573,587, dumpStores at :170-204), `08-walk-check.sh` (fallback baseline), the dataset (`~/Downloads/sprinkles-ingredient-seed-db.json`: 103 ingredients, and the exact per-row figures plans 09-01/09-07 pin), `.planning/sketches/012-places/` (README "Measured" numbers), `.planning/notes/2026-10-16-style-bands-draft.md` (Gelato −12.5, blank PAC/sugar), `vitest.config.js`, `tabindex-scan.test.js:15`, `styles/shell.test.js:314`, and `git log 3f23c7f..HEAD -- app/` (empty — the base is currently correct).

**Headline:** this plan set is unusually well anchored — every file:line claim I checked resolved exactly, including the ones introduced by the round-3/4/5 amendments (D-19 values, D-20 coefficients, the moved base commit). I found one new MEDIUM enumeration gap (09-10), one LOW-MEDIUM caller gap (09-15), and a handful of LOWs. No HIGH findings. Round-3 dispositions I re-checked against source (09-01's verify rewrite, 09-09's ownership of `library.test.js`/`transfer.test.js` fixtures, 09-11's six-key boot fixture, the D-19 amendments across 09-05/09-08/09-09/09-10/09-16/09-17) all hold.

---

## 09-01

**Summary.** Converter + reviewed mapping + before-walk at `3f23c7f`, with a blocking human checkpoint. The round-3 rewrites (D-20 folded into Task 1, base moved to `3f23c7f` with a non-phase-commit guard) are coherent and match the repo state.

**Strengths.**
- Base-commit choice verified live: `git log --format='%h %s' 3f23c7f..HEAD -- app/` is currently empty, and `3f23c7f` is indeed "widen the Sweetness · POD rule to 0 to 40" — the record-base guard ("FAIL app/ changed after BASE…") is a real protection, not decoration.
- The byte-identical walk-copy check is exactly right for the actual file: `08-walk.mjs` is 906 lines, the server import is on line 42, the usage message ("Usage: node 05-walk.mjs…") is on line 904, and the header is 9 lines — the verify's `splice(41,1)` + `slice(9)` cut matches this layout precisely.
- Dataset literals verified against the real file: whole-milk (3.25/8.45/4.6/4.6/0.7), milk-chocolate (29.66/16/51.5/98.5/13.5/53), sweetened-condensed-milk (8/23/54.5/73/54.5/44), yogurt inconsistency (14.2+3.5 > 14.0), ethanol `{pac:744}`, rum-40pct (water 66.6, solids 0, pac 297), alcohol-40pct (water 60, solids 40, pac 297), heavy-cream-36 fat 36, goat-milk pod 5.1 — every pin in the plan corresponds to the data.
- `camelKey('yogurt-3.5pct') → 'yogurt35pct'` follows from the stated algorithm (strip non-alphanumerics after capitalisation).
- Vitest picks up `app/scripts/*.test.mjs`: `app/vitest.config.js` sets only `environment: 'node'`, so the default include glob covers `.test.mjs` under the app root.
- The conservation check (103 ids each once across `samePairs` ∪ `entries`) is a genuinely stronger guard than the round-1 "at least 60" it replaced.

**Concerns.**
- LOW — the mapping's `renamed` bucket has no stated precedence. The action defines refusals for `same`/`different`/unmapped collisions, and `camelKey` already resolves the one known odd key, but nothing says whether `renamed` overrides `different`'s key or is advisory. Two executors could produce different `entries` maps for the same approval.
- LOW — Task 2's Mark's List writes assume ArtifactData is reachable; plan 09-17 has an explicit stop-and-checkpoint rule for the same dependency, this plan does not. If the tool is unavailable mid-Task 2, the checkpoint rows (`decide-p9-library-*`) that Task 3's resume-signal requires would silently not exist.

**Suggestions.**
- One line in the mapping-file paragraph: key resolution order is `same` → `different` → `renamed` (override of the camelCased key) → camelKey, and `entries` in the checks file records the final key.
- Mirror 09-17's rule: "if ArtifactData is unavailable, stop and return a checkpoint naming it, rather than proceeding without the rows."

**Risk: LOW.** Well-verified inputs, deterministic outputs, human gate correctly placed.

---

## 09-02

**Summary.** Stored Sheet codes: seed stamping, id-derivation, print/search on the stored field, child/root assignment. All citations verified.

**Strengths.**
- Every call site cited is exact: `PrintSheet.jsx:125`, `PrintSheetPages.jsx:84`, `SheetCodeSearch.jsx:80`, golden vector `sheetCode.test.js:43`, and the three `footText` assertions in `PrintSheetPages.test.jsx` at **exactly** lines 354, 564, 604 (the round-3 "moved 15 lines" correction is right).
- The wave-1 merge-order safety claim checks out at the mechanism level: `printedContent` (`sheetCode.js:55+`) is built from explicit field lists ("never a spread, never dependent on key order") and its header comment (`sheetCode.js:26-31`) excludes declaredAxes, coefficients, targets bands, equipment and process — so plan 09-05's `libraryId`/`maxFillG`/`serveTempC`/D-20 additions cannot move a code, and 09-02's pin test (`SEED_SHEET_CODES[id] === sheetCode(version)`) survives either merge order.
- The stored-code-differs tests (round-1 fix) are the right shape: they prove the field is read, not the coincidence.
- The pre-bump window (profiles at 9 with code-less stored versions) is honestly stated, and is actually harmless for the reset scenario: a pre-bump stray build keeps `DB_VERSION` 9, so no device can reset into it.

**Concerns.**
- LOW — `findVersionsByCode` switching to the stored field means, between this plan and 09-09, a dev profile seeded before the stamp finds nothing at `/search`. Stated and accepted; no fallback is the right call, but the acceptance relies on 09-09's dist guard whose fingerprint is only taken at wave 3. Since pre-bump builds cannot trigger a reset, residual exposure is dev-machine-only. No change needed; noting the reasoning chain is longer than the plan text suggests.

**Suggestions.** None material.

**Risk: LOW.**

---

## 09-03

**Summary.** The two places per sketch 012, `filterLibrary`, CSS port, WebKit measurement. Every data-dependent test expectation I could check matches the real library.

**Strengths.**
- Test expectations verified against `data/library.js`: 'milk' matches exactly 5 entries (wholeMilk, wholeMilk33, wholeMilk37, skimMilkPowder, coconutMilk); category `sugar` is exactly 4 (sucrose, allulose, dextrose, fructose); heavyCream's basis is `{fat:'derived', msnf:'estimated'}` with source only for `fat` — so "MSNF 5.4% estimated with not recorded" is the real render; sucrose is `0.85` / `'granulated, loose'`; locustBeanGum carries `hydrationC: 82` with source "commonly cited 80–85 °C, varies by grade".
- The README "Measured" numbers the check script pins are quoted correctly (69 px rows; 88–105 at 393; 44 px floor; Name 598.9; Category 120; Clear filters 78.6×44; cuts at 760/1100; no overflow 393–1590), and the 26-entry vs 103-name dataset split is correctly deferred to 09-16's two modes.
- Placeholders confirmed at `router.jsx:123,126`; `batchCountWords` private at `RecipeList.jsx:187` (extraction, not copy, is right); the select blind spot in `tabindex-scan.test.js:15` is real, so the literal `tabIndex={0}` on the select plus a WebKit Tab check is the correct compensation.
- `shownFields` defensive typing (round-1 fix) is the right disposition given `validateLibraryRecord` genuinely does not type-check category/basis/source/note (`transfer.js:221+` checks id/name/composition).

**Concerns.**
- LOW — the node-environment static harness will hit the repository singleton: `repository.js` ends with `export const repository = createRepository()` and `createRepository` calls `openStore()` eagerly (`repository.js:6-17`), which needs a global `indexedDB`. `RecipePage.test.jsx:11,20` solves this with `vi.mock('../store/repository.js', () => ({ repository: {} }))`. The plan says "the existing harness" and mocks the repository for the jsdom cases, but never names this module-load trap for `NotebookPlace.test.jsx`/`IngredientsPlace.test.jsx` — an executor copying the wrong harness gets a confusing ReferenceError at import.

**Suggestions.**
- In Tasks 1 and 2's test paragraphs, name the stub explicitly: "mock `../store/repository.js` at module load, the `RecipePage.test.jsx:20` idiom, because the singleton opens IndexedDB at import."

**Risk: LOW.**

---

## 09-04

**Summary.** The `create` draft kind, its fit check, the full first-version payload, and the scale-definition contract. The round-1 HIGH fixes (hook marker counts, half-made drafts, method/portions in the payload) all hold against source.

**Strengths.**
- Marker arithmetic verified against the real file: `RecipePage.shell.test.js` pins `['repository.getDraft(versionId)', 1]` (:263), `['repository.deleteDraft(versionId)', 3]` (:265), `['buildDraftRecord(', 2]` (:267). The plan's "reuse the one read and both deletes, add a third `buildDraftRecord` branch" structure yields exactly the claimed 1/3/3 counts — this is a genuinely load-bearing detail and it is right.
- The restore guard is where the plan says (`useKeptDraft.js:112`: `if (!version || version.recipeId !== recipeId || !batchesLoaded || loadFailed) return;`), and the existing late-read idiom (`modeRef.current !== 'reading'`, visible at :128-131) is faithfully mirrored by the `createDraftRef` generation check.
- `CREATE_DRAFT_KEYS` counts to exactly the thirteen pinned names; the dirty-check defaults ('Version 1', `serveTempC: ''`) are tested against `blankCreateDraft` itself, not prose.
- The claim that existing consumers ignore a create record is verified: `RecipeList.jsx:93-101` filters on `versions.find(...)` (a create draft's versionId resolves to nothing) and `RecipePage.jsx:305-317` filters `record.kind !== 'plan'`.
- The round-3 payload change (machine/process out, serveTempC in) is correctly reasoned against `creation-roundtrip.test.js:107` — the root/child key-equality pin — and the cost-of-change paragraph gives Mark the real tradeoff.

**Concerns.**
- LOW — the late-read guard's correctness depends on Phase 10 holding `createDraft` as a state object replaced only on change; the plan documents this in the hook comment, which is the best available mitigation, but it is a contract with an unbuilt phase.
- LOW — the payload settles shapes before Phase 10/11 are designed; pinned three ways and gated behind Mark's decision, so acceptable, but criterion 2's "nothing creation stores changes shape after this phase" is doing real work on an unvalidated editor design.

**Suggestions.** None new — the round-2/3 dispositions cover both concerns.

**Risk: LOW-MEDIUM** (shape-freeze risk is inherent to the criterion, not the plan).

---

## 09-05

**Summary.** `libraryId` on rows, `maxFillG`, `serveTempC` copied from each version's own Ice Ed figure, validator tightening, and the LIB-08 proof. All 19 iceEd figures and file counts verified.

**Strengths.**
- The per-file serveTempC counts (1/1/2/3/2/4/4/2 = 19) and values match the data files exactly, including the two nulls (olive-oil v1, underbelly-light-base v1) and mexican-chocolate's file order (−17, −15, −16, −16). The "copy each from the iceEd line directly above, never from this list" instruction is the right anti-drift rule.
- `STRAWBERRIES_V1_V2_IER` / `DRIED_STRAWBERRY_V2_IER` verified module-private at `strawberry.js:34,52` with uses at :108,206-207 — the export + identity-set (not row-count) exception is correctly specified.
- `embed()` verified in all eight data files; olive-oil has exactly 12 call sites (13 `embed(` lines minus the definition), matching the acceptance grep.
- The fixture sweep is enumerated from a real grep and matches today's file set; the "stop and report rather than edit outside the plan" rule is the right posture.
- The `assumption_delta_decision` block (serveTempC promoted, `iceEd.servingTemperatureC` demoted to transcription detail) with the `toBe` invariant test is exactly how this should be recorded.

**Concerns.**
- MEDIUM (cross-plan with 09-10, attributed to both) — `library-link.test.js`, created here in Task 1, round-trips a **hand-assembled** version through `exportStore` → `importStore`. At wave 1 that version legitimately has no `sheetCode` and no `serveTempC`; from plan 09-10 both are required on every imported version, so this test goes red in wave 4 — and 09-10's "enumerated" sweep does not name the file (it did not exist when 09-10's grep ran). See 09-10 below for the fix; the cheapest repair on this side is a forward-pointer sentence in Task 1 ("this file's hand-built version is stamped by plan 09-10's sweep").

**Suggestions.**
- Add that forward pointer, or have Task 1 build the version through `createRecipe` + `rowFromLibraryRecord` once 09-02's `codeFromVersionId` is merged (fragile across wave-1 merge order — the forward pointer is better).

**Risk: LOW** (the one gap surfaces as a red test in 09-10's own verify, not as silent breakage).

---

## 09-06

**Summary.** In-transaction uniqueness/immutability for Sheet codes, the UI moved onto `createVersion`, and the refused-save-keeps-the-pen proof. All mechanism claims verified.

**Strengths.**
- The two-repository race test is meaningful, not theatre: `createRepository()` builds its own `dbPromise` per instance (`repository.js:6-17`), so two instances are two real connections and fake-indexeddb's transaction scheduling applies.
- The UI fallout is enumerated correctly: `useVersionPen.js:199` calls `repository.saveVersion(child)` today; `RecipePage.perStep.test.jsx` flushes on `store.saveVersion` at :216-219 with 10 "Save as a new version" presses (counted); the shell marker `['repository.saveVersion(', 2]` is at :233 — the 2→1+1 marker split with `createVersion` added to `shellLacks` keeps the architectural check at full strength.
- `pen-note-roundtrip.test.js:64` really does `saveVersion(child)` on a not-yet-stored id, so Task 2's "no 'changed' problem without a stored record" case is required, not hypothetical.
- The collision fixture follows a real precedent (`sheetCode.test.js:23-31,249-250` — two pinned pairs already exist for the legacy derivation).
- The round-2 canonical-code TypeError on `createVersion` closes the "code-less version takes part in no clash" hole at the right layer.

**Concerns.**
- LOW — the race test's assertion shape ("exactly one resolves, the store holds exactly one") is order-agnostic, which is correct; but if fake-indexeddb ever serialises the two transactions differently than browsers, the test could pass for a weaker reason. Acceptable; the WebKit walk and 09-17 give browser-level coverage elsewhere.

**Suggestions.** None material.

**Risk: LOW.**

---

## 09-07

**Summary.** Seed the merged library, the decision gate, the lactose invariant, and D-20 values on the 26. Every pinned literal I recomputed from `library.js` is arithmetically exact.

**Strengths.**
- The five dairy acidity literals check out to the last digit: msnf 0.088/0.054/0.97/0.087/0.0865 × 0.017 → 0.001496/0.000918/0.01649/0.001479/0.001471 at six places. The "rule equals literal" test (both asserted) prevents drift in either direction.
- The 26 keys named in the plan (wholeMilk33, wholeMilk37, stabilizerMix4421 included) are exactly the file's keys.
- The `candidate(datasetId)` design (round-1 HIGH fix) is correct and its acceptance grep (`librarySeedDb[checks.rows` returns 0) pins the anti-pattern out; the converted-correctness vs kept-app-value split into two describe blocks is the right structure.
- Generating the seven conflict notes from `samePairs[].differs` rather than hand-typed numbers, with the gate failing on a stale quote, is a solid round-1 fix.
- The approval check as the gate's first case closes the resumed-run hole.
- Merge order `{ ...librarySeedDb, ...library }` verified against the current `seed.js` structure — a one-line change at the right seam.

**Concerns.**
- LOW — Task 1's "every existing field kept" acceptance compares against `git show 3f23c7f:app/src/data/library.js`. If a legitimate quick task edits `library.js` between now and execution (09-01's base guard refuses to *record the walk* in that case, but this acceptance has no equivalent escape hatch), the check fails for the wrong reason. One sentence ("if the base moved, compare against the new base and say so") would suffice.

**Suggestions.** As above.

**Risk: LOW.**

---

## 09-08

**Summary.** Declared scales become definitions; children clone them; `serveTempC` lands on created roots and children; the draft fit check reads keys from definitions. The sequencing claims are verified and genuinely load-bearing.

**Strengths.**
- `lineage.js:141-142` shares `declaredAxes`/`declaredFlaws` by reference today — the `structuredClone` fix is real (D-03b).
- The "both changes in one task" reasoning is verified: `creation-roundtrip.test.js:107-108` pins child keys == root keys **and** rejects any own-`undefined` value, so `serveTempC` must join `newRecipe.js` and `lineage.js` together, and the unguarded copy is defended by that very pin plus the enumerated caller search — a better answer than an `Object.hasOwn` guard, as the plan argues.
- The ordering claim ("declaredOf stops calling `axesForVersion` here, before 09-11 re-signs it") is verified against source: `draft.js:12` imports `axesForVersion` today; the acceptance grep (`^import {...axesForVersion` returns 0 in draft.js) makes the wave-2-before-wave-4 dependency executable rather than prose.
- The "core keys stay in `declaredOf` until 09-15" fix (round-1 HIGH) is the correct call — returning only declared keys would break every core-mark fit check in between.
- `olive-oil.js:120-121` (`declaredAxes: ['Body', 'Oil']`, `declaredFlaws: ['Bitter']`) matches the plan's interface quote.

**Concerns.**
- LOW — none new. The kind-aware-presentation deferral to Phase 12 is correctly recorded as a header paragraph rather than code.

**Suggestions.** None.

**Risk: LOW.**

---

## 09-09

**Summary.** The 9→10 bump: bounded reset, four seed tables, moved validator with D-20 checks, ratchets, upgrade proof, dist guard. This is the phase's riskiest plan and it is also its most heavily fortified.

**Strengths.**
- Pitfall 1 is real and precisely located: `db.test.js:284` opens `indexedDB.open(DB_NAME, 10)` and :292 asserts `newer.version` is 10 — at `DB_VERSION` 10 this silently stops testing the blocking handler. The rewrite to `DB_VERSION + 1` is correct.
- The round-3/5 fixture ownership fixes hold against source: `library.test.js:158,182` really does assert Phase 6's keep-the-records upgrade (which `< 10` breaks), and `transfer.test.js:875-879` really is the bare-entry case the six-key requirement refuses — both quoted verbatim in the plan, both owned here with approved rewrites.
- The behavioural ratchet at a **literal** `RESET_BOUND = 10` (not `DB_VERSION`) is the right fix for the round-1 finding — a ratchet keyed to `DB_VERSION` would go vacuous at 11.
- `seed.js`'s current structure (library first, then the versions early-return) confirms that seeding the four tables "right after the library, before the versions check" is required for D-17's reseed-on-every-boot — the plan gets this ordering right.
- The dist guard is mechanically sound: `app/dist` exists (fingerprint is a hash, not "absent"), every build line in all 17 plans' automated verifies uses `--outDir` into scratch (I checked each), and the worktree-aware `--git-common-dir` resolution handles executor worktrees.
- The auto-selected checkpoint wording ("recorded, not confirmed") correctly implements the round-1 finding.

**Concerns.**
- LOW — Task 2 + Task 3 span 17 files at a 106k low-confidence estimate; the plan is at the edge of what one executor session should carry. The task split and per-task verifies mitigate, but this is the plan most likely to need a mid-execution replan.
- LOW — the round-3 note about where the "seed rows equal today's constants" test lives is ambiguous ("a test in this task asserts…"); plan 09-15 assumes it is in `seedTables.test.js`. If the executor puts it in a new `data/core-scales.test.js`, 09-15's constant removal breaks a file outside its `files_modified` (its search-and-update instruction would still catch it, but the file list would be wrong).

**Suggestions.**
- Name the file for the words-equal-constants test explicitly (`seedTables.test.js`), matching 09-15's assumption.

**Risk: MEDIUM** — inherent to being the one-way bump; mitigations (ratchets, guard, aborted-upgrade test, WebKit proof in 09-17) are as good as this repo has ever had.

---

## 09-10

**Summary.** Store-file schema 9, the eight-store import/export, code and core-count checks at both pre-check and transaction level, required `serveTempC`. The dual-level race designs are correct; one enumeration gap.

**Strengths.**
- Verified against source: `importAll`/`exportAll` are four-store single transactions today (`repository.js:158,185`), `transfer.js:11-12` imports `AXES`/`DEFECTS` (removed later by 09-14 as staged), and every file in the sweep exists and matches its described role (including `Shell.flyout.test.jsx` importing only older files and `Shell.importGuard.test.jsx` mocking `importStore`).
- The `CoreScaleCountError` in-transaction recount (round-5 HIGH fix) correctly closes the two-import race that the pre-check alone leaves open, and recognising the error by `error.name` keeps `transfer.js` free of a `repository.js` import that the Shell mocks would break — a subtle, correct choice.
- `fileCoreKeys` never-throws design plus the three malformed-scales cases answers the round-1 unvalidated-input finding completely.
- The required-`serveTempC` reasoning (schema bump covers old files; lift-later posture stated in the comment) is honest about its own expiry: it holds only until 09-17 hands Mark a build.

**Concerns.**
- **MEDIUM — the enumerated sweep misses `app/src/store/library-link.test.js`**, which plan 09-05 Task 1 creates in wave 1 with an explicit `exportStore` → `importStore` round trip of a hand-assembled version. That version will have no `sheetCode` (09-02 stamps only `seedRecipeGroups`; `createRecipe` roots gain codes but this fixture is built from `rowFromLibraryRecord` rows, not `createRecipe`) and no `serveTempC` until required. From this plan on, `validateVersion` refuses it, so the test goes red — and the plan's must_have ("every store-file test builds its file through `storeFile.fixtures.js` … the sweep is enumerated in Task 1 and Task 2, not left to whichever test goes red") is false as written. The planning-time grep (`grep -rln "validateStoreFile\|importStore\|exportStore\|importAll"`) could not see the file because it did not exist yet; that is exactly why the sweep should have been projected over the phase's own artifact list (09-05's Artifacts section names `library-link.test.js`). It will surface in this plan's verify (`npm test -- src/store …`), and the fix is small, but an executor following the plan's own "enumerated, not left to whichever test goes red" contract has no instruction for a file the enumeration missed.

**Suggestions.**
- Add to Task 1's sweep: "`store/library-link.test.js` (created by plan 09-05): its hand-built version gains `sheetCode: codeFromVersionId(id)` and `serveTempC: null`, or the test seeds a full profile and exports the stamped seed version." Alternatively, restate the sweep as a floor: "re-run the grep at execution; the enumeration names every file known at plan time, and any additional file found is swept by the same rules and named in the summary."

**Risk: LOW-MEDIUM** — the gap is caught by the plan's own verify, not by production behaviour.

---

## 09-11

**Summary.** Boot validation, catalog load/reload, the printed log on the catalog. The round-1 HIGH fix (the source-text test) is verified against the actual test.

**Strengths.**
- `PrintLogPages.test.jsx:164-174` is quoted accurately: the case really asserts `expect(src).toContain('axesForVersion(version)')` and `expect(src).toContain('DEFECTS')` — both of which this plan removes — and the rewrite (forbid the words, require the new call shapes) is specified down to the acceptance greps.
- `Shell.jsx:334-353` and `IMPORT_STORAGE_ERROR`'s exact text (`transfer.js:613`, "Nothing was changed") confirm the `IMPORT_RELOAD_LINE` design: without it, a failed reload after a committed import would tell the maker a lie. Holding `storeRevision` in that branch is the correct consistency choice.
- `main.jsx`'s current boot shape matches the interface quote exactly, so "readSeedTables inside the same try, check between read and render" slots in cleanly.
- The boot-posture truth (as strict as import on structure, as tolerant as the place on display) is stated, tested with a fixture whose six D-20 keys are present (round-5 HIGH fix), and tied to `decide-p9-boot-check-scope` — the asymmetry is deliberate rather than accidental.
- The real-provider Shell test (raw IndexedDB write inside mocked `importStore`) proves the thing the mocked-order test cannot.

**Concerns.**
- LOW — the real-provider case depends on importing `fake-indexeddb/auto` before `repository.js`'s module-load `createRepository()` (the singleton opens the DB at import; `repository.js` tail). The plan does say "import 'fake-indexeddb/auto' first", but given how easily import order is rearranged by formatting tools, this deserves a must-have truth or a comment requirement, not just an action clause.

**Suggestions.**
- Promote the import-order requirement into the behavior block or a code comment the test must carry.

**Risk: LOW.**

---

## 09-12

**Summary.** RecipePage reads the catalog and hands it to BatchRow; every page test supplies the provider. Small, well-scoped, correctly split out of 09-11.

**Strengths.**
- The "imports nothing it does not use" constraint is real and located (`RecipePage.shell.test.js:81-82,468` — each imported name must appear at least twice); `useCatalog` at import + one call passes it, and the plan says the quiet part out loud (a later edit that drops a use must adjust the case explicitly).
- Provider coverage as an executed check (no-provider mount must throw, per `useCatalog`'s design) is stronger than the round-1 grep it replaced.
- The cardinality tests (four renamed core scales in both stacked and desktop arrangements) plus the `structuredClone(SEED_CATALOG)` no-mutation rule (round-5 fix) close the shared-fixture contamination hole.
- `BatchRow.jsx:1042-1051` confirms the stand-in snapshot the plan replaces, and 09-13's dependency on its removal is stated in both plans.

**Concerns.**
- LOW — none new.

**Suggestions.** None.

**Risk: LOW.**

---

## 09-13

**Summary.** Batch snapshots gain `coreScales`/`coreProblems`; every reader and caller follows; a contained-failure gate between the data sweep and the UI. Caller enumeration verified to the unit.

**Strengths.**
- Every caller count is exact against source: `batch.test.js` 34, `RecipePage.test.jsx` 7, `BatchRow.test.jsx` 3, `recordDraft.test.js` 1, `creation-roundtrip.test.js` 1 (:142), `seed-roundtrip.test.js` 1 (:123), `useBatchRecording.js:468`, and 12 `createBatch(` calls across the six data files (1+3+2+2+3+1). This is the most precisely enumerated sweep in the phase.
- I traced the contained-failure gate's regex against the real failure set: after Task 1, the files that can fail are exactly `RecipePage*.test.jsx` (recordTasting's save path), `BatchRow*.test.jsx`, and the two roundtrip tests — all matched by the regex. `RecipePage.shell.test.js` is `.test.js` (not matched) but cannot fail after Task 1 because `useBatchRecording.js` text is untouched until Task 2; `db-reset.test.js:161`'s `axesForBatch` runs over seeded batches, which Task 1 gives `coreScales`. The gate is right.
- `creation-roundtrip.test.js:147`'s exact snapshot-key pin is owned in Task 2 as required.
- The kind-aware-presentation handoff to Phase 12 (header paragraph in `axes.js`) prevents "stores a kind" from being mistaken for "renders a kind" — `stopWordsFor`/`readMarkWord`/`AxisMark` genuinely do assume a goldilocks middle today.

**Concerns.**
- LOW — the gate's path extraction (`t.name.slice(t.name.indexOf('/app/')+5)`) assumes every JSON-reporter result name contains `/app/`. If it doesn't (reporter change, path shape), `indexOf` returns −1 and the slice produces garbage that matches nothing → the gate FAILs with nonsense names. It fails safe (stops the plan) but would be confusing; a basename fallback would cost two lines.

**Suggestions.**
- Slice from the repo root (`process.cwd()` or `git rev-parse --show-toplevel`) or fall back to matching on the basename when `/app/` is absent.

**Risk: LOW-MEDIUM** — biggest surface of any plan (20 files), but the gate bounds the blast radius well.

---

## 09-14

**Summary.** Import judges each batch by its own snapshot; `transfer.js` drops the domain constants; magnitude + renamed definitions round-trip. Correctly split from 09-13.

**Strengths.**
- All cited anchor points verified: `validateMarks` at `transfer.js:255` (values 1–5 only — the mark-key check genuinely does not exist yet), `validateTasting` at :273 (defects against `DEFECTS`), `validateDeclaredAxes` at :345 with `DECLARED_AXIS_NAMES` (:16) and `MAX_DECLARED = 2` (:18). The prohibition ("never the receiving profile's tables") matches D-03a and is testable both directions (accepted-though-table-lacks-it / refused-though-table-has-it).
- The dual core-key source (file's scales table for versions, snapshot for batches) is subtle but explicitly stated in a must-have truth, and the round-5 ledger shows both reviewers accepted it.
- Task 2's round trip exercises the two shapes the incumbent tests cannot (minted `magnitude` key; renamed declared scale under a kept key) — directly answering the round-1 finding that prescribed tests only covered goldilocks pairs.
- The From-freezer exclusion pinned unchanged is the right regression guard for a validator rewrite.

**Concerns.**
- LOW — none new.

**Suggestions.** None.

**Risk: LOW.**

---

## 09-15

**Summary.** Draft checks onto catalog/snapshot, domain constants retired, static seed-data scan, and the stability proof on the bumped database. One caller gap.

**Strengths.**
- The seed-data-scan allow-list is verifiably complete: today the only non-test importer of `app/src/data` from outside is `store/seed.js` (`seed.js:1-2`); the phase adds exactly two fixtures (`catalog.fixtures.jsx`, `storeFile.fixtures.js`), both allow-listed by exact path. The round-2 `stripComments` + bracketed-array-literal constraints keep the second case from firing on prose, and `data/core-*.js` are exempt by the "outside app/src/data" scope.
- Constant removal is contained: `battery.js:1` declares "No imports at all"; `AxisMark.jsx:2` imports only `STOPS, stopWordsFor` (which stay); `data/olive-oil.js:115` and `AxisMark.jsx:18` reference `AXES` in comments only — so the acceptance grep over imports (not text) is the right check and will pass.
- The stability proof now changes scales the 2 Aug batch actually marked (`{ sweetness: 4, oil: 4 }` — verified in the research and consistent with `olive-oil.js:120`'s declarations), asserts each edit landed before asserting the batch didn't move, and covers a later version's renamed definition. This is a materially stronger test than the round-1 Hardness version.
- `draftMatchesVersion(` survives as a shell-test marker under the 4-arg change (the marker is the prefix substring, verified at `RecipePage.shell.test.js:266`) — no marker churn, correctly unlisted from files_modified.

**Concerns.**
- LOW-MEDIUM — **three-argument external callers are unaccounted for.** `draftMatchesVersion` is called with three arguments, on plan drafts, at `penDraft.test.js:586`, `pen-note-roundtrip.test.js:47`, and `transfer.test.js:1512,1520` (all verified `kind: 'plan'`). The plan's "A plan draft does not read the catalog" keeps them green — but only if the executor does *not* add a missing-catalog TypeError, which is this phase's own dominant idiom for caller bugs (`rowFromLibraryRecord` in 09-05, `createVersion` in 09-06, `createBatch` in 09-13). None of the three files is in `files_modified`, and the plan neither names them nor forbids the throw. An executor following the house idiom breaks three files outside the plan with no instruction.

**Suggestions.**
- One sentence in Task 1: "`draftMatchesVersion` must not throw for a missing catalog when the record is a plan draft; the three existing three-argument plan-draft callers (`penDraft.test.js`, `pen-note-roundtrip.test.js`, `transfer.test.js`) stay green unedited." (Or add the catalog argument to them and list the files.)

**Risk: LOW.**

---

## 09-16

**Summary.** The allow-list compare, required-additions pass, expected-value pre-check, selftest, and two-mode places check with side-by-side evidence. The allow-list design is compatible with the actual diff engine.

**Strengths.**
- I verified the allow-list against `diffLeaves` (`08-walk.mjs:843-856`): a primitive→object change (declaredAxes name→definition) emits one diff at the element path with the whole object as `after`; a key added to an object (sheetCode, serveTempC, libraryId, maxFillG, the six coefficients, `basis/source.titratableAcidity`) emits one diff at the exact leaf path with `before=undefined`; a whole added array (`snapshot.coreScales`) emits one diff at the array path. Every allow-list entry shape in the plan corresponds to a real diff-emission shape — the design is not aspirational.
- The required-additions pass is necessary and correctly reasoned (a field missing from *both* files produces no diff — verified: `diffLeaves` unions object keys, but `undefined === undefined` stringifies equal only when the key exists on one side; a key absent on both sides never appears).
- The `expected` mode (round-2 fix) uses the allow-list's own functions — one definition per expected value — which is what makes it a real pre-check rather than a parallel implementation.
- The selftest's `servetemp` doctoring ("first seeded version whose serveTempC is a number, +1") correctly avoids the round-4 trap: −14 is five seeded versions' own value, so a fixed literal could pass unrefused. Verified against the data files.
- The two library modes keep the 26-entry (88–105 px) and 103-name (71–109 px) ranges in separate branches, matching README:47,52 — the round-1 dataset-conflation fix is intact.

**Concerns.**
- LOW — `compare` will now import `app/src/data/seed-recipes.js`, whose module graph (after 09-13) executes `createBatch` at load through `SEED_CATALOG`. All plain ESM today, but the walk tooling becomes coupled to the data graph's node-importability; a future framework import there breaks the walk harness, not just a test. Worth a comment in 09-walk.mjs, nothing more.

**Suggestions.** As above (comment only).

**Risk: LOW.**

---

## 09-17

**Summary.** WebKit 9→10 reset with reopen, dist-guard check before the device row, device steps walked first, Mark's List rows with readbacks. The right capstone, correctly split from 09-16.

**Strengths.**
- The single-origin two-build route-handler design is the correct way to prove browser persistence that fake-indexeddb cannot (round-1 finding, carried through two plan splits without being lost — the ledger trail 09-09→09-16→09-17 is consistent).
- Making 09-09's auto-selected reset safe *mechanically* (guard scan + fingerprint + check before writing the device row, with a stop-and-tell-Mark branch on FAIL) converts the phase's weakest premise ("no plan writes app/dist" by convention) into a checked invariant. I confirmed every automated build line in all 17 plans uses `--outDir` into scratch, so the scan will pass on arrival.
- The row-readback and PASS-line-quoting requirements (round-5 fix) make browser and Mark's List outcomes falsifiable in the summary rather than asserted.
- The device-row detail correctly words the reset as decisions 2 and 5 recorded, never as a fresh confirmation, and carries 09-16's evidence gaps forward.
- Base build `3f23c7f` verified as the newest app/ commit; the acceptance grep and worktree-cleanup check are executable.

**Concerns.**
- LOW — the upgrade check's expected library count is computed in node from `{...librarySeedDb, ...library}` (robust to Mark's approval outcome ✓), but the exact table counts (1/4/6/4) are literals — correct against the plan-09-09 seeds, and any change there should indeed fail here, so this is fine; noting only that they are the one place a seed change requires a synchronized edit.

**Suggestions.** None material.

**Risk: LOW.**

---

# Cross-Plan Assessment

**Wave structure and file overlap — verified clean.** For every multi-plan wave I compared `files_modified` sets pairwise: wave 1 (09-01…09-05), wave 2 (09-06/07/08) and wave 4 (09-10/11, with matching `coupling_justified` notes) have **zero file overlap**. Semantic merge interactions I traced are safe: 09-02's code pins survive 09-05's field additions because `printedContent` is explicit-field (`sheetCode.js:26-31`); 09-02's stamping spreads over 09-05's modified literals in either merge order; 09-03's `RecipeList.jsx` edit and 09-04's `RecipeList.test.jsx` edit are disjoint; 09-10 and 09-11 touch adjacent modules (`transfer.js` vs `seedTables.js`) without shared files. The load-bearing 09-08-before-09-11 ordering (draft.js drops the `axesForVersion` import before it is re-signed) is real (`draft.js:12`) and enforced by an acceptance grep.

**New findings this round (not previously dispositioned):**

1. **MEDIUM — 09-10's fixture sweep misses `library-link.test.js`** (created by 09-05 in wave 1; export→import of a hand-assembled version that will lack required `sheetCode`/`serveTempC`). Caught by 09-10's own verify, but the plan's "enumerated, not left to whichever test goes red" contract should enumerate it. Fix: one sweep line in 09-10 (or a forward pointer in 09-05).
2. **LOW-MEDIUM — 09-15's signature change has three unlisted three-argument callers** (`penDraft.test.js:586`, `pen-note-roundtrip.test.js:47`, `transfer.test.js:1512/1520`, all plan drafts). Green only if no missing-catalog throw is added; the phase's own caller-bug idiom makes that throw likely. Fix: one sentence forbidding it or listing the files.
3. **LOW — 09-01's `renamed` mapping bucket precedence** unspecified.
4. **LOW — 09-03's node-env test harness** must stub the repository singleton (`repository.js` opens IndexedDB at module load; the `RecipePage.test.jsx:20` idiom); the plan implies but never names it.
5. **LOW — 09-09 should name the file** for the seed-rows-equal-constants test that 09-15 later re-pins (`seedTables.test.js` is assumed by 09-15).
6. **LOW — 09-13's gate path-slicing** (`indexOf('/app/')+5`) is brittle though fail-safe.
7. **LOW — 09-01's Mark's List writes lack the ArtifactData-unavailable checkpoint rule** that 09-17 has.

**Round-3 dispositions re-verified against source:** 09-01's D-20 verify rewrite (composition-only inherited + separate acidity provenance) is internally consistent with 09-07's and 09-09's checks; 09-09's ownership of the `library.test.js` version-8 case and the `transfer.test.js` bare entry matches the real cases verbatim; 09-11's boot fixture six-key addition matches 09-09's validator; the D-19-as-amended chain (09-05 copies → 09-08 child copy → 09-09 reset proof reads −15 → 09-10 round trip → 09-16 allow-list from seed → 09-17 WebKit check) is arithmetically consistent with the 19 iceEd figures in the data files. None of the dispositions I checked is contradicted by source.

**Phase-goal coverage.** All eight success criteria map to executable proofs: criterion 1 (09-07's gate + invariants), 2 (09-09's upgrade proof + ratchets), 3 (09-05's library-link proof), 4 (09-08 + 09-14 + 09-15 Task 3), 5 (09-03 + 09-16 Task 2), 6 (09-09 tables + 09-11/12 reads + 09-15 scan), 7 (09-02 + 09-06 + 09-10), 8 (09-10 + 09-14). The two human gates (09-01 Task 3, 09-17's device row) sit where the decisions actually are.

**Overall risk: MEDIUM-LOW.** The plan set is exceptionally well-evidenced — dozens of line-level citations checked this session all resolved, including the post-amendment ones. Residual risk concentrates in (a) 09-09's sheer size at the one-way boundary, (b) the Mark-approval critical path blocking waves 2–10 by design, and (c) the two enumeration gaps above, both of which surface as red tests inside the phase's own verifies rather than as shipped defects. I recommend proceeding after folding findings 1 and 2 into 09-10 and 09-15 (each is a one-to-three-line plan edit); the LOWs can ride in executor summaries.

---

## Consensus Summary

Both reviewers read the plans against source at `40b10c2` and re-checked the round-3 dispositions; neither found one contradicted. Codex asks for changes before execution, naming two HIGH findings in 09-10. OpenCode found no HIGH, one MEDIUM (also in 09-10) and recommends proceeding after two small plan edits. The two reviews overlap on where the risk sits (09-10's import sweep, 09-09 as the one-way bump) and diverge on how settled the stored shapes are.

### Agreed Strengths

- The round-3 fixes hold against source: 09-01's D-20 verification split, 09-09's ownership of the `library.test.js` and `transfer.test.js` fixtures, 09-11's six-key boot fixture, and the D-19 serve-temperature chain (both reviewers recomputed the 19 Ice Ed figures).
- 09-02's stored Sheet codes and 09-06's in-transaction uniqueness are grounded in the real call sites (`PrintSheet.jsx:125`, `PrintSheetPages.jsx:84`, `repository.js:32`, `useVersionPen.js`).
- 09-08's `structuredClone` of declared definitions fixes a real alias at `lineage.js:141`.
- 09-13's caller sweep is exact (both counted the `createBatch` call sites) and its contained-failure gate bounds the blast radius.
- 09-16's allow-list matches how `diffLeaves` at `08-walk.mjs:843` actually emits additions, and the required-additions pass covers the field-missing-on-both-sides blind spot.
- 09-17 turns the "no plan writes app/dist" convention into a checked invariant.

### Agreed Concerns

- **09-10's fixture sweep is incomplete** (Codex HIGH, OpenCode MEDIUM, different files). Codex: `Shell.flyout.test.jsx:354` expects four schema errors today; the plan's claim that old exports are refused before the arrays are read is wrong (`transfer.js:577` records the error and continues at `:583`), so four required arrays make it eight and nothing updates that assertion. OpenCode: `library-link.test.js`, created by 09-05 in wave 1, round-trips a hand-built version with no `sheetCode` or `serveTempC`, which 09-10 then refuses; the planning-time grep could not see a file that did not exist yet. Both say the "enumerated, not left to whichever test goes red" contract is false as written. Fix: add both files to 09-10's sweep and restate the enumeration as a floor re-run at execution.
- **09-09 is the riskiest plan by size** (both MEDIUM): 17 files at the one-way boundary. Mitigations are judged as good as the repo has had.

### Divergent Views

- **Core-scale identity on import** (Codex HIGH, OpenCode silent). Codex traced a store file with no versions that demotes Sweetness and promotes Oil to core: the count stays four, the retained olive-oil version still declares Oil (`olive-oil.js:120`), the reader returns Oil twice under one key, and the next recorded batch fails the planned collision validator. OpenCode praised the in-transaction recount without testing this case. Worth settling: a compatibility check across the resulting versions and scales inside the write transaction.
- **Are the stored shapes actually settled?** Codex raises two MEDIUMs OpenCode does not: 09-04's create draft stores no step-key watermark, so `stepKeys.js:24` reissues a deleted key after restore (Phase 11 promises no reuse, `ROADMAP.md:221`); and 09-08 fixes the root at 19 keys while the selected style has nowhere to persist (`newRecipe.js:62` has no style field, `lineage.js:130` no copy rule, Phase 11 promises to save it). OpenCode rates the shape-freeze as inherent to criterion 2 and acceptable.
- **09-09 problem names** (Codex MEDIUM): rows are validated one at a time, so two problem ids with the same word can enter the catalog, and 09-14's snapshot validator then rejects the export. OpenCode did not raise it.
- **09-11 failure containment** (Codex MEDIUM): holding `storeRevision` after a failed catalog reload stops one refresh but not navigation (`Shell.jsx:445` → `router.jsx:80` → `useRecipeData.js:32`), so imported records can render against the old catalog; and the panel heading still reads "This file can't be imported" (`Shell.jsx:421`) after a successful import. OpenCode accepted the design and raised only the fake-indexeddb import order.
- **09-15 three-argument callers** (OpenCode LOW-MEDIUM, Codex silent): `penDraft.test.js:586`, `pen-note-roundtrip.test.js:47` and `transfer.test.js:1512,1520` call `draftMatchesVersion` with three arguments on plan drafts; the plan must either forbid a missing-catalog throw or list the files.
- OpenCode's remaining LOWs (09-01 `renamed` precedence and ArtifactData stop rule, 09-03 repository stub at module load, 09-09 naming the constants-test file, 09-13 gate path slicing) are executor-summary material.
