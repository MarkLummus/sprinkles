---
phase: 9
reviewers: [codex, opencode]
reviewer_instances: [opencode-gemini-argon, opencode-astra]
reviewed_at: 2026-10-18T22:59:39Z
plans_reviewed: [09-01-PLAN.md, 09-02-PLAN.md, 09-03-PLAN.md, 09-04-PLAN.md, 09-05-PLAN.md, 09-06-PLAN.md, 09-07-PLAN.md, 09-08-PLAN.md, 09-09-PLAN.md, 09-10-PLAN.md, 09-11-PLAN.md, 09-12-PLAN.md, 09-13-PLAN.md, 09-14-PLAN.md, 09-15-PLAN.md, 09-16-PLAN.md, 09-17-PLAN.md]
models:
  codex: "gpt-6.1-sol (reasoning=high)"
  opencode: "openrouter/qwen/qwen3.8-max-0902#high"
  opencode-gemini-argon: "openrouter/google/gemini-4-argon#high"
  opencode-astra: "openrouter/openai/gpt-6-astra#high"
model_sources:
  codex: "banner"
  opencode: "pinned"
  opencode-gemini-argon: "pinned"
  opencode-astra: "pinned"
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

---

## OpenCode Review (opencode-gemini-argon)

Addendum, 2026-10-18. This lane ran separately from the round-4 pass as an alternates trial (Gemini 4 Argon, Kimi K3, DeepSeek v4 Pro on the same prompt; the other two outputs are under `.review-diagnostics/*-alternates-*/`). Its three HIGH findings were verified against source by Claude before this append: `app/src/styles/shell.test.js:60` and `:114` pin the selector roots and the `@media` count, `app/src/store/library.test.js:231` expects `data/olive-oil.js` among library importers, and `app/src/store/transfer.test.js:933` with `app/src/store/seed.test.js:120` expect the seeded library to hold exactly the 26 entries. None of the three files is owned by the plan that breaks it (09-03, 09-05, 09-07). Neither Codex nor Qwen raised any of them. Gemini 4 Argon is the OpenCode lane from the next round on.

## 09-01

1. **Summary**
   This plan converts `~/Downloads/sprinkles-ingredient-seed-db.json` (103 ingredients) offline into `app/src/data/library-seed-db.js`, introduces `app/src/domain/stages.js` (`STAGE_IDS`), records `09-walk-before.json` at base commit `3f23c7f`, and gates execution on Mark's review (`look-p9-library-mapping`) while surfacing `decide-p9-boot-check-scope` early. All Round 3 findings on this plan—scoping the `inherited` basis check to composition figures, exempting cultured dairy (`CULTURED_DAIRY_IDS`) from the `msnf * 0.017` derived acidity rule, and adding `app/src/domain/stages.js` and `stages.test.js` to `files_modified` and `artifacts`—have been cleanly resolved.

2. **Strengths**
   - **Verified lactose subtraction and acidity provenance:** Subtracting `msnf * 0.545` from dairy `sugar`, `pac`, and `pod` matches `computeBalance` in `app/src/domain/composition.js:35-44`, and `CULTURED_DAIRY_IDS` (`buttermilk`, `buttermilk-light`, `sour-cream`, `yogurt-3.5pct`) respects `.planning/notes/2026-10-18-sourced-formulation-bands.md:285` ("measured or label value; it varies with fermentation").
   - **Reconciled automated verify:** Task 1's inline Node verification now checks `e.basis[f] !== 'inherited'` only over `Object.keys(e.composition)` and separately verifies `titratableAcidity` provenance and the six D-20 keys.
   - **Deterministic base-walk guard:** `09-walk-record-base.sh` builds `3f23c7f` in a detached worktree and verifies that no non-Phase-9 commit has touched `app/` since `3f23c7f`.

3. **Concerns**
   - **LOW — Changing a row from `different` to `same` at Task 3 can trip `planMerge`'s `coefficients` guard:** Task 1 specifies that `planMerge` throws on "a `coefficients` id that is not in the dataset or names a same pair", while Task 3's resume instructions say to "edit `app/scripts/ingredient-mapping.json`". If Mark moves a dataset id (e.g., `coconut-milk` or `whole-milk`) into `same` during review without also removing its key from `mapping.coefficients`, `planMerge` will throw.

4. **Suggestions**
   - In Task 3's `<resume-signal>` (or in `planMerge`), note that moving an entry to `same` in `app/scripts/ingredient-mapping.json` also requires removing its id from `mapping.coefficients` (since `same` pairs keep the app's entry in `app/src/data/library.js`).

5. **Risk Assessment**
   **LOW.** The Round 3 verification contradiction and file-ownership gaps are resolved, and the converter's invariants are well-pinned.

---

## 09-02

1. **Summary**
   This plan introduces stored Sheet codes (`CODE-01`): it commits the 19 legacy content-derived codes in `app/src/data/seed-sheet-codes.js`, stamps copies in `app/src/data/seed-recipes.js`, adds `codeFromVersionId` in `app/src/domain/sheetCode.js` for `createChildVersion` and `createRecipe`, and switches `PrintSheet.jsx`, `PrintSheetPages.jsx`, and `findVersionsByCode` to read `version.sheetCode`.

2. **Strengths**
   - **Constructors and readers verified against source:** `createChildVersion` (`app/src/domain/lineage.js:130-151`) and `createRecipe` (`app/src/domain/newRecipe.js:62-80`) construct version records explicitly, `saveOverVersion` (`app/src/domain/lineage.js:162-174`) spreads `...version`, and `findVersionsByCode` (`app/src/domain/sheetCode.js:189-199`) is the single lookup used by `SheetCodeSearch.jsx:80`.
   - **Non-mutating stamp:** Stamping copies in `seedRecipeGroups` while keeping `oliveOilVersion` and `transcribedRecipeGroups` unmutated avoids side effects on module-level exports.

3. **Concerns**
   - **LOW/MEDIUM — Existing equality assertion in `app/src/data/seed-recipes.test.js:41` breaks when `seedRecipeGroups` stamps `sheetCode` onto copies while `transcribedRecipeGroups` stays unstamped:** `app/src/data/seed-recipes.test.js:38-43` currently asserts:
     ```js
     expect(seedRecipeGroups.slice(1)).toEqual(transcribedRecipeGroups);
     ```
     Because Task 1 stamps `sheetCode` onto every version in `seedRecipeGroups` while leaving `transcribedRecipeGroups` untouched ("`transcribedRecipeGroups` stays as it is; only `seedRecipeGroups` ... carries the codes"), `seedRecipeGroups.slice(1)`'s versions have `sheetCode` and `transcribedRecipeGroups`'s versions do not, causing `seed-recipes.test.js:41` to fail in Task 1's verify.

4. **Suggestions**
   - In Task 1, explicitly update `app/src/data/seed-recipes.test.js:41` (which is already in Task 1's `files`) so that it compares `seedRecipeGroups.slice(1)` against `transcribedRecipeGroups` with `sheetCode` stripped from each version (or with `SEED_SHEET_CODES[v.id]` stamped onto `transcribedRecipeGroups`), preserving the ordering and structure test alongside the new no-mutation test.

5. **Risk Assessment**
   **LOW.** `seed-recipes.test.js` is already owned by Task 1; noting line 41 prevents an immediate test failure during execution.

---

## 09-03

1. **Summary**
   This plan replaces the `/notebook` and `/ingredients` placeholders in `app/src/router.jsx:123,126` with `NotebookPlace` and `IngredientsPlace`, adds pure `filterLibrary` and `libraryCategories` in `app/src/domain/ingredientSearch.js`, extracts `countWords.js`, ports sketch 012's `.nb__*` and `.ing__*` CSS rules into `app/src/styles/shell.css`, and verifies layout in WebKit via `09-places-check.mjs`.

2. **Strengths**
   - **Defensive display and form submission:** `shownFields` protects `IngredientsPlace` from unvalidated optional fields (`category`, `basis`, `source`, `note`, `densityGPerMl`, `hydrationC`), and Round 5 added `event.preventDefault()` on `form.ing__filters` submission (`SheetCodeSearch.jsx:68` precedent) plus a WebKit Enter-key check.
   - **Shared ordering with Home:** `NotebookPlace` reuses `activeWork(versions, batches, recipes)` (`app/src/domain/lastEvent.js:111-133`), guaranteeing identical ordering with `RecipeList.jsx`.

3. **Concerns**
   - **HIGH — Adding `.nb__*` and `.ing__*` rules and `@media` blocks to `app/src/styles/shell.css` breaks four hard-pinned assertions in `app/src/styles/shell.test.js`, which is not in `09-03`'s `files_modified`:**
     Task 3 ports `.nb__*` and `.ing__*` rules—including `@media (max-width: 1099.98px)`, `@media (max-width: 759.98px)`, and `@media (pointer: coarse)`—into `app/src/styles/shell.css`, and runs `npm --prefix app test -- src/styles` in its automated verify. However, `app/src/styles/shell.test.js` enforces four strict invariants on `shell.css` that will immediately fail:
     1. `app/src/styles/shell.test.js:60-71` (`every rule is scoped under the .shell or .place root`): asserts every selector in `shell.css` starts with `.shell` or `.place` (or is `html` or `button.shell__place`). Any unprefixed `.nb__*` or `.ing__*` selector fails this test.
     2. `app/src/styles/shell.test.js:81-84` (`the only @media conditions allowed in shell.css are the fly-out cut and the phone cut`): asserts `[...mediaConditions].sort()` equals `['(max-width: 1589.98px)', '(max-width: 723.98px)'].sort()`. Adding `(max-width: 1099.98px)`, `(max-width: 759.98px)`, and `(pointer: coarse)` fails this test.
     3. `app/src/styles/shell.test.js:114-120` (`shell.css carries exactly two @media blocks`): asserts `expect(shellCssSource.match(/@media/g)).toHaveLength(2)`. Adding the places' `@media` blocks fails this test.
     4. `app/src/styles/shell.test.js:380-394` (`only .shell__sprinkle, .shell__place, the menu button and the wordmark link declare a border-radius`): asserts the exact sorted list of selectors in `shell.css` that declare `border-radius` is `['.shell__brand a', '.shell__import-errors', '.shell__menu', '.shell__place', '.shell__sprinkle']`. The board's `.nb__rail`, `.nb__name a`, `.ing__clear`, `.ing__rail`, and `.ing__head` all declare `border-radius` (`.planning/sketches/012-places/ingredients-place-103-entries.html:2933,2935,2945,2948,2949`), failing this test.

4. **Suggestions**
   - Either:
     1. Add `app/src/styles/shell.test.js` to `09-03-PLAN.md`'s `files_modified` and Task 3's `files`, and update `shell.test.js:60-71`, `:81-84`, `:114-120`, and `:380-394` to account for the `.nb__*`/`.ing__*` selectors, the three place `@media` blocks, and the five place `border-radius` selectors; **or**
     2. Follow the `app/src/styles/home.css` + `app/src/styles/home.test.js` pattern (`app/src/styles/home.test.js:1-7`) by placing the `.nb__*` and `.ing__*` rules in a new `app/src/styles/places.css` (imported in `app/src/main.jsx`) with its own `app/src/styles/places.test.js` token-discipline suite, leaving `shell.css` and `shell.test.js` untouched.

5. **Risk Assessment**
   **HIGH** until `shell.test.js` (or a separate `places.css`) is accounted for, because Task 3's automated verify (`npm --prefix app test -- src/styles`) is guaranteed to fail against `app/src/styles/shell.test.js:60-120, 380-394`.

---

## 09-04

1. **Summary**
   This plan establishes `app/src/domain/catalog.js` (`SCALE_KINDS`, `SCALE_GROUPS`, `MAX_RECIPE_SCALES`, `MAX_RECIPE_PROBLEMS`, `CORE_SCALE_COUNT`, `isScaleDefinition`, `scaleDefinition`, `mintScaleKey`), adds the `create` draft kind (`draftMatchesCreate`, `blankCreateDraft`, `isCreateDraftDirty`, `CREATE_DRAFT_KEYS`) to `app/src/domain/draft.js`, extends `app/src/ui/useKeptDraft.js` with a `creating` branch and edit-generation late-read protection, and updates `app/src/ui/RecipePage.shell.test.js`.

2. **Strengths**
   - **Late-read protection resolved (`useKeptDraft.js:126-130`):** Adding `createDraftRef` compared against `createDraftAtRead` prevents a slow `repository.getDraft(versionId)` resolution from overwriting input typed while the read was in flight, matching the edit path's `modeRef.current !== 'reading'` guard and verified by a deferred-`getDraft` test.
   - **Source-contract markers verified:** Reusing the single `repository.getDraft(versionId)` call (`app/src/ui/useKeptDraft.js:115`) and the three `repository.deleteDraft(versionId)` sites (`:49, :122, :191`) while incrementing `buildDraftRecord(` from 2 to 3 matches `app/src/ui/RecipePage.shell.test.js:257-286`.

3. **Concerns**
   - **LOW — Restore `useEffect` dependency array in `app/src/ui/useKeptDraft.js:156`:** Currently `useKeptDraft.js:156` has `}, [version, batchesLoaded, loadFailed]);`. When `creating` is `true`, `version` is `null` and `batchesLoaded` is `false` on mount, so the effect runs once on mount; including `creating` in that dependency array (`[creating, version, batchesLoaded, loadFailed]`) keeps the hook dependencies accurate.

4. **Suggestions**
   - Include `creating` in the restore `useEffect` dependency array at `app/src/ui/useKeptDraft.js:156`, and ensure the persist `useEffect` (`:165-184`) branches `if (creating) { ... } else if (persistedPen === 'plan' ...)` so a clean `create` draft always reaches the `if (!record)` cleanup branch at `:185`.

5. **Risk Assessment**
   **LOW.** All Round 3 concerns on `09-04` have been resolved and verified against the source.

---

## 09-05

1. **Summary**
   This plan adds `libraryId` to `rowFromLibraryRecord` (`app/src/domain/versionRow.js`), creates `app/src/data/library-embed.js` (`embedFromLibrary`) and switches all eight seed recipe files to use it, sets `libraryId: null` and six `null` D-20 coefficient keys on the two local strawberry definitions (`STRAWBERRIES_V1_V2_IER`, `DRIED_STRAWBERRY_V2_IER`), adds `maxFillG: null` to seeded equipment blocks, stamps `serveTempC` copied from `iceEd.servingTemperatureC` onto all 19 seeded versions, and extends `validateRow` and `validateVersion` in `app/src/store/transfer.js`.

2. **Strengths**
   - **Uniform embedded-ingredient shape for D-20:** Adding the six D-20 keys (`null`) to `STRAWBERRIES_V1_V2_IER` and `DRIED_STRAWBERRY_V2_IER` (`app/src/data/strawberry.js:34-68`) ensures every seeded row's embedded `ingredient` has the same own keys once `09-07` populates `app/src/data/library.js`.
   - **Verified `serveTempC` literals:** All 19 `iceEd` blocks across the eight seed files match the 17 numeric values (`-17` to `-14`) and 2 `null`s (`olive-oil-ice-cream-v1` and `underbelly-light-base-v1`).

3. **Concerns**
   - **HIGH — Dropping `import { library } from './library.js'` from `app/src/data/olive-oil.js` breaks `app/src/store/library.test.js:231`, halting Task 3's full-suite gate:**
     Task 1 instructs: "In `app/src/data/olive-oil.js` replace the local `embed` with `embedFromLibrary` and pass the key as a string ... drop the now-unused `library` import if nothing else reads it." Nothing else in `app/src/data/olive-oil.js` reads `library` (`olive-oil.js:5, 81-92`).
     However, `app/src/store/library.test.js:226-231` scans `app/src` for imports of `/library.js` and asserts:
     ```js
     expect(libraryImporters).toEqual(expect.arrayContaining(['store/seed.js', 'data/olive-oil.js']));
     ```
     Once `olive-oil.js` drops its `library.js` import in Task 1, `libraryImporters` becomes `['data/library-embed.js', 'store/seed.js']` and no longer contains `'data/olive-oil.js'`. When Task 3 runs `npm --prefix app test`, `app/src/store/library.test.js:231` will fail—and Task 3 explicitly instructs: "If the full suite names any other file, stop and report it rather than editing a file outside this plan."

4. **Suggestions**
   - Add `app/src/store/library.test.js` to `09-05-PLAN.md`'s `files_modified` (no other Wave 1 plan touches `library.test.js`) and update `app/src/store/library.test.js:231` from `'data/olive-oil.js'` to `'data/library-embed.js'`.
   - Also consider updating `app/src/store/transfer.test.js:933` (`expect(file.library).toHaveLength(Object.keys(library).length)`) in `09-05` Task 3 (since `09-05` already owns `transfer.test.js` in Wave 1) to `expect(file.library.length).toBeGreaterThanOrEqual(Object.keys(library).length)` so that `09-07` in Wave 2 does not fail on `transfer.test.js:933` when `seedIfEmpty` seeds the larger library (see `09-07` below).

5. **Risk Assessment**
   **HIGH** until `app/src/store/library.test.js:231` is included in `09-05`, because Task 1's instruction to drop the unused `library` import in `olive-oil.js` directly breaks `library.test.js:231` during Task 3's full-suite verification.

---

## 09-06

1. **Summary**
   This plan adds `sheetCodeProblems` and `SheetCodeError` to `app/src/domain/sheetCode.js`, enforces Sheet code uniqueness and immutability inside `repository.createVersion` and `repository.saveVersion` (`app/src/store/repository.js`), routes "Save as a new version" in `app/src/ui/useVersionPen.js:199` through `repository.createVersion`, and updates `RecipePage.shell.test.js`, `RecipePage.perStep.test.jsx`, `RecipePage.beforeYouStart.test.jsx`, and `RecipePage.drafts.test.jsx`.

2. **Strengths**
   - **Verified against source:** `app/src/ui/useVersionPen.js:199` (`handleSaveAsNewVersion`) and `:239` (`handleSaveOverVersion`) are the exact two `repository.saveVersion(` calls pinned by `app/src/ui/RecipePage.shell.test.js:233`, and `useVersionPen.js:211-215` keeps the pen open and releases `versionSaveLockRef` on rejection.
   - **Real collision pair and two-tab serialization:** Brute-forcing a colliding id pair for `codeFromVersionId` tests real transaction serialization across two `createRepository()` instances.

3. **Concerns**
   - None material. All Round 1–3 concerns on this plan are resolved.

4. **Suggestions**
   - Keep both the repository-level two-connection race test and the UI-level `SheetCodeError` retry test as specified.

5. **Risk Assessment**
   **LOW.**

---

## 09-07

1. **Summary**
   This plan merges `librarySeedDb` into `app/src/store/seed.js` (`{ ...librarySeedDb, ...library }`), adds the six D-20 coefficient keys and dairy `titratableAcidity` provenance to the 26 entries in `app/src/data/library.js`, writes `app/src/data/library-decisions.js` for all same-ingredient pairs and the seven named conflicts, and adds the conflict gate and lactose-once invariant tests in `app/src/data/library-seed-db.test.js`.

2. **Strengths**
   - **Round 3 concerns resolved:** `app/src/data/library.js` is now in `files_modified` and Task 1's `files`, the 26 entries' D-20 values are pinned by exact value (including the five dairy `titratableAcidity` values: `wholeMilk` `0.001496`, `heavyCream` `0.000918`, `skimMilkPowder` `0.01649`, `wholeMilk33` `0.001479`, `wholeMilk37` `0.001471`, matching `composition.msnf * 0.017` in `app/src/data/library.js`), and existing fields are checked against `3f23c7f:app/src/data/library.js`.

3. **Concerns**
   - **HIGH — `app/src/store/transfer.test.js:933` asserts `expect(file.library).toHaveLength(Object.keys(library).length)` (26) after `seedIfEmpty`, which fails in Task 3's `npm --prefix app test` once Task 1 merges `librarySeedDb` into `seedIfEmpty`:**
     Look at `app/src/store/transfer.test.js:922-935`:
     ```js
     it("still round-trips the seeded store's export through importStore and a real repository", async () => {
       const source = createRepository();
       await seedIfEmpty(source);
       const file = JSON.parse(JSON.stringify(await exportStore(source)));
       ...
       expect(file.library).toHaveLength(Object.keys(library).length);
       expect(await target.listLibrary()).toEqual(file.library);
     });
     ```
     Once Task 1 updates `app/src/store/seed.js` to seed `{ ...librarySeedDb, ...library }` (~109 entries), `file.library` has ~109 entries while `Object.keys(library).length` is 26. When Task 3 runs `npm --prefix app test`, `transfer.test.js:933` will fail—and `transfer.test.js` is not updated for this line in `09-07`, `09-08`, `09-09`, or `09-10`. (Note also that `09-08` is in Wave 2 alongside `09-07` and owns `transfer.test.js`.)
   - **MEDIUM — `app/src/store/seed.test.js:120-124, 181-182` and `app/src/store/library.test.js:32-38, 150` assert `record.entry` against `library[record.id]`, not just the count:**
     Task 1 says: "Update `seed.test.js` and `library.test.js`: where a test counts the seeded library, count `Object.keys({ ...librarySeedDb, ...library })`". However, `seed.test.js:123, 181-182` and `library.test.js:35, 38, 150` also loop over the seeded records and assert `expect(record.entry).toEqual(library[record.id])` (and `expect(repository.library.map(r => r.id)).toEqual(Object.keys(library))`). For any record from `librarySeedDb`, `library[record.id]` is `undefined`.

4. **Suggestions**
   - Update `app/src/store/transfer.test.js:933` in `09-05` Task 3 (which already owns `app/src/store/transfer.test.js` in Wave 1, avoiding any Wave 2 file overlap between `09-07` and `09-08`) to `expect(file.library.length).toBeGreaterThanOrEqual(Object.keys(library).length)`, and then pin the merged length in `09-10` when `transfer.test.js` is swept.
   - In `09-07` Task 1, specify that `seed.test.js:120-124, 181-182` and `library.test.js:32-38, 150` look up entries in `const merged = { ...librarySeedDb, ...library }` rather than `library[record.id]`.

5. **Risk Assessment**
   **HIGH** until `app/src/store/transfer.test.js:933` (and the `library[record.id]` lookups in `seed.test.js` and `library.test.js`) are addressed, as Task 3 runs the full test suite (`npm --prefix app test`).

---

## 09-08

1. **Summary**
   This plan converts `declaredAxes` on `oliveOilVersion` (`app/src/data/olive-oil.js:120`) and in test fixtures from name strings to scale definition objects `{ key, name, low, high, kind, group }`, updates `axesForVersion` and `axesForBatch` (`app/src/domain/axes.js`), deep-clones `declaredAxes` and `declaredFlaws` and copies `serveTempC` in `createChildVersion` (`app/src/domain/lineage.js:141-142`), adds `serveTempC: null` to `createRecipe` (`app/src/domain/newRecipe.js`), updates `declaredOf` in `app/src/domain/draft.js`, and updates `validateDeclaredAxes` in `app/src/store/transfer.js`.

2. **Strengths**
   - **Verified caller enumeration for `createChildVersion`:** All six callers of `createChildVersion` in `app/src` and `app/tests` pass a seeded version, a clone/spread of one, or a `createRecipe` root, all of which own `serveTempC` once `09-05` and `09-08` Task 2 run.
   - **Clean `declaredOf` transition:** Keeping the four core keys from `AXES` plus `declaredAxes.map(a => a.key)` in `declaredOf` (`app/src/domain/draft.js:173-177`) while dropping its call to `axesForVersion` avoids breaking core-mark validation before `09-15` and avoids a signature break when `09-11` adds `catalog` to `axesForVersion`.

3. **Concerns**
   - **LOW — Wave 2 coordination with `09-07` on `npm --prefix app test`:** Both `09-07` and `09-08` are in Wave 2 and both run `npm --prefix app test` in Task 3. If `09-07` merges before `09-08` (or when Wave 2 merges), `app/src/store/transfer.test.js:933` will fail unless updated (see `09-07` Concern 1; `09-08` owns `app/src/store/transfer.test.js` in Wave 2).

4. **Suggestions**
   - Update `app/src/store/transfer.test.js:933` in `09-05` (Wave 1) as suggested under `09-05` and `09-07` so both `09-07` and `09-08` pass `npm --prefix app test` independently and after merge.

5. **Risk Assessment**
   **LOW.**

---

## 09-09

1. **Summary**
   This plan bumps `DB_VERSION` from 9 to 10 in `app/src/store/db.js`, exports `upgradeStores` with the destructive reset bounded to `oldVersion > 0 && oldVersion < 10` (dropping `versions`, `batches`, `recipes`, `drafts`, and `library`), creates and seeds the `machines`, `styles`, `scales`, and `problems` object stores via `seedTableIfEmpty`, moves `validateLibraryRecord` to `app/src/store/seedTables.js` and adds the six D-20 coefficient checks, updates `app/src/store/library.test.js` and `app/src/store/transfer.test.js`, adds `app/tests/db-upgrade-10.test.js` and the two anti-reset ratchets in `app/src/store/db.test.js`, and creates `09-dist-guard.sh`.

2. **Strengths**
   - **Round 3 concerns resolved:** `app/src/store/library.test.js` (`:182-212`, the version-8 upgrade test) and `app/src/store/transfer.test.js` (`:875-879`, the bare library entry test) are now owned by `09-09` and updated for the `< 10` reset and the six required D-20 keys.
   - **Strong ratchets and `app/dist` guard:** Exporting `upgradeStores` enables both the behavioral ratchet at literal `RESET_BOUND = 10` and the comment-stripped static brace scan on `if (oldVersion > 0 && oldVersion < 10) {`.

3. **Concerns**
   - **LOW/MEDIUM — `createInMemoryRepository` in `app/src/store/seed.test.js:19-53` lacks `seedTableIfEmpty` until Task 3 updates it, and `:86, :130, :145, :174` assert exact `repository.writes` arrays:**
     In Task 2, `app/src/store/seed.js` is edited to call `repository.seedTableIfEmpty('machines', MACHINE_ROWS)`, and in Task 3 to call `seedTableIfEmpty` for `styles`, `scales`, and `problems`. In `app/src/store/seed.test.js:19-53`, `createInMemoryRepository` is a hand-written mock that only defines `listVersions`, `putAll`, `putAllBatches`, `putAllRecipes`, and `seedLibraryIfEmpty`—it does not define `seedTableIfEmpty`! And `seed.test.js:86, 130, 145, 174` assert `expect(repository.writes).toEqual(['library', 'recipes', 'batches', 'versions'])` (or subsets). Task 3 owns `app/src/store/seed.test.js` and runs it in Task 3's verify, so Task 3 must add `seedTableIfEmpty` to `createInMemoryRepository` in `seed.test.js`.

4. **Suggestions**
   - In Task 3, explicitly note that `createInMemoryRepository` in `app/src/store/seed.test.js:19-53` must implement `seedTableIfEmpty` (and `seedLibraryIfEmpty` delegating to it or recording writes consistently with `seed.test.js:86, 130, 145, 174`).

5. **Risk Assessment**
   **LOW.** Both HIGH findings from Round 3 on `09-09` are resolved.

---

## 09-10

1. **Summary**
   This plan bumps `STORE_SCHEMA_VERSION` from 8 to 9 in `app/src/store/transfer.js`, extends `exportAll` and `importAll` (`app/src/store/repository.js`) to all eight stores (`recipes`, `versions`, `batches`, `library`, `machines`, `styles`, `scales`, `problems`), validates the four new seed tables and `CORE_SCALE_COUNT` (4) both in `importStore`'s pre-check and inside `repository.importAll`'s transaction (`CoreScaleCountError`), requires canonical `sheetCode` and `serveTempC` on every imported version, enforces Sheet code uniqueness and immutability on import, and sweeps the store-file test fixtures via `app/src/store/storeFile.fixtures.js`.

2. **Strengths**
   - **Round 3 transactional race resolved:** `repository.importAll` now reads the `scales` store inside its readwrite transaction before queuing puts, merges incoming `scales` by `id`, and aborts with `CoreScaleCountError` if the resulting core scale count is not `CORE_SCALE_COUNT` (4), closing the two-import race Codex identified in Round 3.
   - **Defensive `fileCoreKeys`:** Computing `fileCoreKeys(parsed.scales)` without throwing when `parsed.scales` is missing or malformed prevents uncaught exceptions during version validation.

3. **Concerns**
   - **MEDIUM/HIGH — Four existing export/import round-trip tests in `app/src/store/seed-roundtrip.test.js` and `app/src/store/transfer.test.js` and `app/src/ui/BatchRow.test.jsx` will fail Task 1/Task 2's new `CORE_SCALE_COUNT` and `sheetCode` checks if updated only as described:**
     1. **`app/src/store/seed-roundtrip.test.js:121` spreads the unstamped `oliveOilVersion`:**
        Task 1's fixture sweep claims that in `seed-roundtrip.test.js`, "any version built in the test carries the code `createRecipe` or `createChildVersion` stored." However, `app/src/store/seed-roundtrip.test.js:121` actually builds its version via:
        ```js
        const version = { ...oliveOilVersion, id: `rt-${declaredFlaws.length}`, declaredFlaws };
        ```
        where `oliveOilVersion` is imported directly from `../data/olive-oil.js` (`seed-roundtrip.test.js:16`) and has **no** `sheetCode`! And even if it spread the stamped olive oil version, its `sheetCode` (`'64JH-G408'`) would collide with the seeded `'olive-oil-ice-cream-v1'` written by `await seedIfEmpty(first)` at `:126` when `validateStoreFile(exported)` (`:130`) and `importStore(second, exported)` (`:134`) run in Task 2!
     2. **`app/src/store/transfer.test.js:284` uses the unstamped `oliveOilVersion`:**
        `app/src/store/transfer.test.js:284-295` runs `const source = createInMemoryRepository([oliveOilVersion], [augustSecondBatch], [oliveOilRecipe]); const exported = await exportStore(source); ... await importStore(target, serialised);`. Because `oliveOilVersion` is the unstamped direct export from `../data/olive-oil.js`, it has no `sheetCode` and will fail Task 2's required `sheetCode` check in `importStore` unless `:284` and `:292` use `stampedSeedVersions()[0]`.
     3. **`createInMemoryRepository` (`app/src/store/transfer.test.js:21-72`) and `memoryRepository` (`app/src/ui/BatchRow.test.jsx:2116-2142`) export empty `scales` unless seeded by default:**
        In `transfer.test.js:259, 284, 519, 586, 1420` and `BatchRow.test.jsx:2185-2191`, the tests build a store file by calling `await exportStore(source)` on an in-memory repository (not `makeStoreFile` / `storeFileOf`) and pass it to `importStore(target, file)`. If `createInMemoryRepository` and `memoryRepository` default `scales` to `[]` instead of `structuredClone(SEED_CATALOG.scales)` (and similarly for `machines`, `styles`, `problems`), `exportStore(source)` will export `scales: []` (0 core scales) and `importStore` will reject the file with `$.scales: the scales table would hold 0 core scales after this import; Sprinkles reads exactly 4`!
     4. **`makeVersion(overrides = {})` (`app/src/store/transfer.test.js:78`) with overridden `id`:**
        `transfer.test.js:240, 260, 1032-1033` call `[makeVersion(), makeVersion({ id: 'v2' })]` or `makeVersion({ id: 'parent' })`, `makeVersion({ id: 'child', ... })`. If `makeVersion` computes `sheetCode: codeFromVersionId('v1')` before spreading `...overrides`, two versions with different `id`s in the same file will share `'v1'`'s `sheetCode` and fail Task 2's duplicate-code check in `importStore`.

4. **Suggestions**
   - In Task 1's fixture sweep:
     - In `app/src/store/seed-roundtrip.test.js:121`, set `sheetCode: codeFromVersionId(\`rt-\${declaredFlaws.length}\`)` on `version`.
     - In `app/src/store/transfer.test.js:284, 292`, use `stampedSeedVersions()[0]` (or `{ ...oliveOilVersion, sheetCode: SEED_SHEET_CODES[oliveOilVersion.id] }`).
     - In `createInMemoryRepository` (`app/src/store/transfer.test.js:21-72`) and `memoryRepository` (`app/src/ui/BatchRow.test.jsx:2116-2142`), default `machines`, `styles`, `scales`, and `problems` to `structuredClone(SEED_CATALOG.*)` so `exportStore(source)` produces a valid 4-core-scale catalog for `importStore`.
     - In `makeVersion(overrides = {})` (`app/src/store/transfer.test.js:78`), compute `const id = overrides.id ?? 'v1'` and set `sheetCode: codeFromVersionId(id)` before `...overrides` (and also update the literal `schemaVersion` / `Object.keys(exported)` checks at `transfer.test.js:231-232, 248, 309-339, 933, 950`).

5. **Risk Assessment**
   **MEDIUM.** All affected test files (`seed-roundtrip.test.js`, `transfer.test.js`, `BatchRow.test.jsx`) are already in `09-10-PLAN.md`'s `files_modified`, so calling out these exact lines makes the fixture sweep turnkey.

---

## 09-11

1. **Summary**
   This plan adds `app/src/store/catalog.js` (`readSeedTables`, `catalogFrom`, `loadCatalog`), `app/src/ui/CatalogContext.jsx`, and `app/src/ui/catalog.fixtures.jsx`, adds `coreScaleDefinitions` and `problemNames` to `app/src/domain/catalog.js`, adds `firstDamagedTable` and `bootDamagedLine` to `app/src/store/seedTables.js`, validates the five seed tables at boot in `app/src/main.jsx` before mounting `<App />`, reloads the catalog before incrementing `storeRevision` on import in `app/src/ui/Shell.jsx` (showing `IMPORT_RELOAD_LINE` if reload fails after commit), and updates `axesForVersion(version, catalog)` and `PrintLogPages.jsx` / `PrintSheet.jsx`.

2. **Strengths**
   - **Round 3 boot-fixture contradiction resolved:** The "odd display fields" library record in Task 2's behavior block now carries all six D-20 coefficient keys set to `null` (`fatStructural: null, ownEmulsifier: null, titratableAcidity: null, defaultStage: null, prepNote: null, requiresHeat: null`), so it passes `validateLibraryRecord` while still testing tolerance for malformed cosmetic fields (`category: { x: 1 }`, `note: 42`, `densityGPerMl: 'heavy'`), alongside a negative test that omits `defaultStage`.
   - **Single sorting boundary and truthful post-import error handling:** `catalogFrom` sorts by `order` then `id`, and `Shell.jsx` awaits `reloadCatalog()` before `setStoreRevision`, surfacing `IMPORT_RELOAD_LINE` if `reloadCatalog()` rejects.

3. **Concerns**
   - **LOW — Additional `AXES`, `CORE_AXIS_COUNT`, and `DEFECTS` references in `app/src/ui/PrintLogPages.test.jsx:15-19, 91-105, 125-138`:** Task 1 mentions that `PrintLogPages.test.jsx` reads expected counts from `coreScaleDefinitions(SEED_CATALOG.scales).length` and rewrites the source-text test at `:164-174`. Note that `PrintLogPages.test.jsx:28` (`const page2 = (version) => renderToStaticMarkup(<TastingLogPage version={version} footText={footFor(version, 2)} />);`) is the shared helper used by all `TastingLogPage` tests in that file, so adding `catalog={SEED_CATALOG}` to `page2` in `:28` covers every call site at once.

4. **Suggestions**
   - Pass `catalog = SEED_CATALOG` in `PrintLogPages.test.jsx:28`'s `page2` helper (`const page2 = (version, catalog = SEED_CATALOG) => renderToStaticMarkup(<TastingLogPage version={version} catalog={catalog} footText={footFor(version, 2)} />);`).

5. **Risk Assessment**
   **LOW.** All Round 3 findings on `09-11` are resolved.

---

## 09-12

1. **Summary**
   This plan wires the catalog into `RecipePage.jsx` (`const { catalog } = useCatalog()`) and passes it as a prop to `BatchRow.jsx`, which uses `axesForVersion(version, catalog)` and `problemNames(catalog.problems)` for a new batch's record pen while keeping `BatchRow` presentational, and wraps all `RecipePage` test mounts in `CatalogFixture`.

2. **Strengths**
   - **Verified `RecipePage.shell.test.js` import-usage rule:** Importing `useCatalog` by name and calling `useCatalog()` once in `RecipePage.jsx` satisfies `app/src/ui/RecipePage.shell.test.js:468-480` (each imported identifier appears at least twice in `RecipePage.jsx`).
   - **Unmutated `SEED_CATALOG` in cardinality tests:** Round 5 explicitly clones `SEED_CATALOG` via `structuredClone(SEED_CATALOG)` and asserts `SEED_CATALOG` is unmutated after the 4-core-scale desktop/stacked arrangement tests.

3. **Concerns**
   - **LOW — `HOOK_ORDER` in `app/src/ui/RecipePage.shell.test.js:327-335`:** Let's verify whether `RecipePage.shell.test.js` asserts an exact list of hook calls or only relative ordering of the listed hooks in `HOOK_ORDER`. Let's check: `HOOK_ORDER` checks `recipePage.indexOf(call)` for the 7 listed hooks (`useAnnouncer()`, `useRecipeData(versionId)`, `useDraftWriter(versionId)`, `useBatchRecording(`, `useVersionPen(`, `useKeptDraft(`, `useRouteIntents(`), so adding `const { catalog } = useCatalog();` above the early returns does not break `HOOK_ORDER`, and Task 1's verify runs `src/ui/RecipePage.shell.test.js` directly.

4. **Suggestions**
   - Keep `src/ui/RecipePage.shell.test.js` in Task 1's verify command as written.

5. **Risk Assessment**
   **LOW.**

---

## 09-13

1. **Summary**
   This plan updates `createBatch` (`app/src/domain/batch.js:177`) to require `{ catalog }` and snapshot `coreScales: coreScaleDefinitions(catalog.scales)` and `coreProblems: problemNames(catalog.problems)`, switches `axesForBatch` (`app/src/domain/axes.js`) and `coreProblemsForBatch` (`app/src/domain/battery.js`) to read only from `batch.snapshot`, updates the six seeded batch data files (12 `createBatch` calls) in Task 1 behind a contained-failure JSON-reporter gate, and updates `useBatchRecording.js` and the remaining test callers in Task 2.

2. **Strengths**
   - **Contained-failure gate after module-load seed changes:** Because `batch-2026-08-02.js`, `strawberry.js`, `mexican-chocolate.js`, `coconut.js`, `mocha.js`, and `pineapple.js` call `createBatch` at module import time, running Vitest with `--reporter=json` at the end of Task 1 and verifying that only Task 2's 4 file families fail immediately catches any missed seed call.
   - **Verified `useBatchRecording.js` import allow-list:** Passing `catalog` as a property of the argument object to `useBatchRecording` (`app/src/ui/RecipePage.jsx:142`) adds no new import to `useBatchRecording.js`, preserving `app/src/ui/RecipePage.shell.test.js:305`'s import allow-list.

3. **Concerns**
   - None material. All callers of `createBatch` and `axesForBatch` in `app/src` and `app/tests` match the plan's inventory.

4. **Suggestions**
   - Keep the contained-failure gate in Task 1's verify command as written.

5. **Risk Assessment**
   **LOW.**

---

## 09-14

1. **Summary**
   This plan updates `validateBatch` and `validateTasting` in `app/src/store/transfer.js` to validate `snapshot.coreScales` (requiring `CORE_SCALE_COUNT` = 4 core scale definitions with unique keys) and `snapshot.coreProblems`, validates `tasting.marks` and `tasting.defects` against the batch's own snapshot rather than the receiving profile's catalog or global `AXES`/`DEFECTS` (`D-03a`), removes `AXES` and `DEFECTS` imports from `transfer.js`, and adds `app/src/store/definition-roundtrip.test.js` for a custom `magnitude` scale and a renamed declared scale.

2. **Strengths**
   - **True historical independence (`D-03a`):** Validating `tasting.marks`, `tasting.defects`, and `snapshot.declaredAxes` against `batch.snapshot.coreScales` and `batch.snapshot.coreProblems` ensures an exported batch remains valid even if the receiving profile's tables have changed.
   - **Exercises both `magnitude` kind and key preservation across rename (`D-03b`):** `definition-roundtrip.test.js` tests a minted `scale-t1` with `kind: 'magnitude'` and `key: 'oil'` renamed to `'Olive'` with marks on both.

3. **Concerns**
   - **LOW — Malformed `snapshot.coreScales` or `snapshot.coreProblems` when `validateTasting` runs:** In `app/src/store/transfer.js:486-488`, `validateTasting(batch.tasting, batch.snapshot, ...)` runs even if `batch.snapshot.coreScales` or `batch.snapshot.coreProblems` had validation errors earlier in `validateBatch`. Task 1 notes that `validateTasting` reads the allowed mark keys from the snapshot "without throwing when either list is malformed, whose own errors `validateBatch` already reports"; ensure the same guard applies to `snapshot.coreProblems` (`Array.isArray(snapshot?.coreProblems) ? snapshot.coreProblems.filter(isNonEmptyString) : []`) before checking `tasting.defects`.

4. **Suggestions**
   - In `validateTasting`, guard both `snapshot?.coreScales` and `snapshot?.coreProblems` with `Array.isArray(...)` so a malformed `coreProblems` (e.g. `null` or a number) reports its error once in `validateBatch` and never throws `TypeError` when `validateTasting` checks `tasting.defects`.

5. **Risk Assessment**
   **LOW.**

---

## 09-15

1. **Summary**
   This plan passes `catalog` into `draftMatchesVersion(record, version, batches, catalog)` (`app/src/domain/draft.js`) and its callers (`useKeptDraft.js`, `RecipePage.jsx`, `RecipeList.jsx`), removes `AXES`, `CORE_AXIS_COUNT`, and `DEFECTS` from `app/src/domain/axes.js` and `app/src/domain/battery.js`, adds the static import and literal guard `app/src/store/seed-data-scan.test.js`, and extends `app/tests/db-upgrade-10.test.js` to prove that editing `sweetness`, deleting `oil`, renaming a core problem in the tables, or renaming `oil` on a child version does not move the 2 Aug batch's marks or words.

2. **Strengths**
   - **Non-vacuous stability proof:** Testing changes to `sweetness` and `oil`—the exact two scales marked `{ sweetness: 4, oil: 4 }` on the 2 Aug batch—proves that `axesForBatch` and `readMarkWord` read from the batch's snapshot rather than the live catalog.
   - **Exact-path allow-list in `seed-data-scan.test.js`:** Resolving relative import specifiers with `node:path` and checking exact file paths (plus stripping comments via `stripComments` before scanning bracketed array literals) prevents false positives and substring bypasses.

3. **Concerns**
   - **LOW — `app/src/store/transfer.test.js:1512, 1520` calls `draftMatchesVersion(plainDraft(), oliveOilVersion, [])` with 3 arguments:** In `app/src/store/transfer.test.js:1488-1522`, `plainDraft()` has `kind: 'plan'`. Task 1 notes "A plan draft does not read the catalog." As long as `draftMatchesVersion(record, version, batches, catalog)` checks `if (record.kind === 'plan') return fitsPlanShape(record.payload, version);` before touching `catalog`, those 3-argument calls in `transfer.test.js:1512, 1520` will continue to pass without editing `transfer.test.js`.

4. **Suggestions**
   - Ensure `draftMatchesVersion` in `app/src/domain/draft.js:273` keeps `if (record.kind === 'plan') return fitsPlanShape(record.payload, version);` above any read of `catalog`, and returns `false` (rather than throwing) if `catalog` is missing for a `record` or `amend` draft.

5. **Risk Assessment**
   **LOW.**

---

## 09-16

1. **Summary**
   This plan updates `09-walk.mjs` with the `D-15` store-dump allow-list (`ALLOWED_STORE_PATHS`), the independent required-additions pass (`REQUIRED_STORE_FIELDS`), the pre-walk `expected` self-check mode, and the 7-case `selftest` mode (now including the D-20 coefficient and acidity-provenance paths), records `09-walk-after.json` (`MATCH 94 snapshots`), and runs `09-places-check.mjs` in both `--library original` (with `--evidence`) and `--library current` modes.

2. **Strengths**
   - **Round 3 D-20 walk gap completely resolved:** `ALLOWED_STORE_PATHS`, `REQUIRED_STORE_FIELDS`, `expected` check `(d)`, and `selftest` (`wrongcoef`, `nocoef`) now explicitly cover `versions[i].rows[j].ingredient.<K>` and `batches[i].snapshot.rows[j].ingredient.<K>` for all six D-20 keys plus `.basis.titratableAcidity` and `.source.titratableAcidity`, looking up expected values in `app/src/data/library.js` via the seeded counterpart's `libraryId` (and expecting `null` / absent provenance on the two null-linked strawberry definitions).
   - **Verified against `diffLeaves` in `08-walk.mjs:843-856`:** Because all five dairy entries in `app/src/data/library.js` already have plain-object `basis` and `source` maps in `09-walk-before.json`, `diffLeaves` recurses into `basis` and `source` and emits leaf paths `stores.versions[i].rows[j].ingredient.basis.titratableAcidity` and `...source.titratableAcidity`, matching the plan's path patterns.

3. **Concerns**
   - **LOW — Walk-created batch in `record-pen-save` and `tasting-save` scenarios (`08-walk.mjs:644-666, 785-810`):** In `08-walk.mjs`, those two scenarios create a new batch (`id: '00000000-0000-4000-8000-000000000001'`) on `olive-oil-ice-cream-v1` in both the before-walk and the after-walk. Because Task 1 states "and a batch resolves through its `versionId`", resolving a batch's expected row `libraryId` and D-20 coefficients via `batch.versionId` (by looking up the version's row in `seedRecipeGroups` by `batch.versionId` and `row.id`) works identically for both seeded batches and the walk-created batch on `olive-oil-ice-cream-v1`.

4. **Suggestions**
   - Make sure the batch row lookup helper in `09-walk.mjs` resolves expected `libraryId` and D-20 coefficients by `(batch.versionId, row.id)` from `seedRecipeGroups` (rather than by `batch.id`), so it handles both seeded batches and the walk-created batch (`00000000-0000-4000-8000-000000000001`) seamlessly.

5. **Risk Assessment**
   **LOW.** The Round 3 HIGH finding on D-20 paths in the walk is thoroughly resolved.

---

## 09-17

1. **Summary**
   This plan runs a real WebKit 9-to-10 upgrade and reopen proof (`09-upgrade-check.sh` and `09-upgrade-check.mjs`) from a profile created by the `3f23c7f` base build to the final Phase 9 build on a shared origin, verifies via `09-dist-guard.sh` that `app/dist` was never modified during the phase, walks the iPad device-check steps in WebKit (`09-places-check.mjs --library current`), and updates Mark's List rows.

2. **Strengths**
   - **Real browser persistence and reopen verification:** Testing the 9-to-10 upgrade on a single origin (`http://sprinkles-upgrade.test`) in WebKit and then writing a draft record and reloading proves both that IndexedDB upgrades cleanly in WebKit and that reopening at version 10 does not trigger a second reset.
   - **Mechanical `app/dist` gate before hand-over:** Running `09-dist-guard.sh scan` and `check` before writing `check-p9-places-and-reset-on-ipad` enforces the safety premise of the recorded reset decision.

3. **Concerns**
   - **LOW — Raw `indexedDB.open('sprinkles')` connections inside `page.evaluate` in `09-upgrade-check.mjs`:** If `09-upgrade-check.mjs` opens `indexedDB.open('sprinkles')` inside `page.evaluate` to inspect version 9 or write `importedThing` / the draft record and does not call `db.close()` in a `finally` block (as `08-walk.mjs:173-203` does), an unclosed raw connection without a `versionchange` listener can block a subsequent open in the same context.

4. **Suggestions**
   - In `09-upgrade-check.mjs`, ensure every `indexedDB.open('sprinkles')` call inside `page.evaluate` closes `db.close()` in a `try ... finally` block (matching `08-walk.mjs:200-202`).

5. **Risk Assessment**
   **LOW.**

---

## Cross-Plan Assessment

### Verification of Round 3 Fixes
All five priority issues from Round 3 (`09-REVIEWS.md`) were verified against the updated plans and repository source and are **resolved**:
1. **`09-01` D-20 basis check, cultured dairy acidity, and `stages.js` ownership:** Resolved in `09-01-PLAN.md`.
2. **`09-09` and `09-11` invalidated tests (`library.test.js:182-204`, `transfer.test.js:875-878`, and `09-11`'s odd-display-fields boot fixture):** Resolved in `09-09-PLAN.md` and `09-11-PLAN.md`.
3. **`09-10` in-transaction core-scale cardinality check (`CoreScaleCountError`) and two-import race test:** Resolved in `09-10-PLAN.md`.
4. **`09-16` walk allow-list, required additions, `expected` mode, and `selftest` for embedded D-20 fields:** Resolved in `09-16-PLAN.md`.
5. **`09-04` creation late-restore protection (`createDraftRef`) and `09-07` `app/src/data/library.js` ownership and value pins:** Resolved in `09-04-PLAN.md` and `09-07-PLAN.md`.

### Remaining Actionable Blockers Found in Source Verification (Round 4)
Four concrete test-suite collisions against existing files in the repository remain and should be patched before execution so no plan hits a red gate:

1. **`09-03-PLAN.md` Task 3 (HIGH) — `app/src/styles/shell.test.js:60-71, 81-84, 114-120, 380-394`:**
   Adding `.nb__*` and `.ing__*` selectors, `@media (max-width: 1099.98px)`, `@media (max-width: 759.98px)`, `@media (pointer: coarse)`, and place `border-radius` declarations to `app/src/styles/shell.css` violates four hard-pinned tests in `app/src/styles/shell.test.js`, which is not in `09-03`'s `files_modified`. Either add `app/src/styles/shell.test.js` to `09-03` and update those four assertions, or put the places' rules in a new `app/src/styles/places.css` + `app/src/styles/places.test.js` (matching `home.css` + `home.test.js`).
2. **`09-05-PLAN.md` Tasks 1 & 3 (HIGH) — `app/src/store/library.test.js:231`:**
   Dropping `import { library } from './library.js'` from `app/src/data/olive-oil.js` in Task 1 breaks `expect(libraryImporters).toEqual(expect.arrayContaining(['store/seed.js', 'data/olive-oil.js']))` in `app/src/store/library.test.js:231` when Task 3 runs `npm --prefix app test`. Add `app/src/store/library.test.js` to `09-05` (no other Wave 1 plan touches it) and change `'data/olive-oil.js'` at line 231 to `'data/library-embed.js'`.
3. **`09-07-PLAN.md` Tasks 1 & 3 (HIGH) — `app/src/store/transfer.test.js:933`, `app/src/store/seed.test.js:123, 181-182`, and `app/src/store/library.test.js:35, 38, 150`:**
   Merging `librarySeedDb` into `seedIfEmpty` in `09-07` Task 1 causes `app/src/store/transfer.test.js:933` (`expect(file.library).toHaveLength(Object.keys(library).length)`) to fail when `09-07` Task 3 runs `npm --prefix app test`, and causes the `expect(record.entry).toEqual(library[record.id])` loops in `seed.test.js` and `library.test.js` to look up new keys in `library` (`undefined`) instead of `{ ...librarySeedDb, ...library }`.
4. **`09-10-PLAN.md` Tasks 1 & 2 (MEDIUM/HIGH) — `app/src/store/seed-roundtrip.test.js:121`, `app/src/store/transfer.test.js:21-72, 78, 284`, and `app/src/ui/BatchRow.test.jsx:2117`:**
   `seed-roundtrip.test.js:121` and `transfer.test.js:284` spread/use the unstamped direct export `oliveOilVersion` (no `sheetCode`), `createInMemoryRepository` (`transfer.test.js:21`) and `memoryRepository` (`BatchRow.test.jsx:2117`) need default `SEED_CATALOG` rows so `exportStore` -> `importStore` round-trips pass the 4-core-scale check, and `makeVersion(overrides)` (`transfer.test.js:78`) should derive `sheetCode` from `overrides.id ?? 'v1'`. (Also note `app/src/data/seed-recipes.test.js:41` in `09-02` Task 1.)


---

## OpenCode Review (opencode-astra)

Addendum, 2026-10-18. Run after the round-4 pass and the Gemini addendum, against a worktree pinned at `40b10c2` with the identical prompt (same plans, context, research, instructions and manifest), so it is directly comparable. Six minutes, all 17 plans. It independently reproduced Codex's two 09-10 HIGHs, Gemini's three HIGHs (09-03, 09-05, 09-07), Qwen's `library-link.test.js` gap and Codex's 09-04/09-08/09-09/09-11 MEDIUMs. Two findings are new and were verified by Claude: 09-01's review list shows coefficients for new entries only, while CONTEXT.md D-20 says the list shows Mark the planner's inferred values for the 26 existing entries too (the 4421 stabiliser mix, skim milk powder, cocoa, the coconut entries); and 09-04's late-read fix leaves `draftStoredRef` false (`useKeptDraft.js:25`) when the maker types and clears back to blank while the read is pending, so the clean-draft delete at `:185-191` never fires and the old stored draft reappears. It also warns that `transfer.test.js` and `Shell.flyout.test.jsx` already have owners in their waves, so the test files the HIGHs require must be assigned without creating a same-wave overlap.

I’ll check all 17 plans against the source and prior review dispositions, focusing on unresolved gaps and whether the verification steps exercise what they claim.

Several verification gates would fail as written: the new place CSS conflicts with existing shell-style tests, and the library refactor leaves import and count assertions unassigned. I’m also checking whether imports can pass the proposed validators yet leave a catalog that produces invalid batches.

The baseline passes: **96 test files, 3,007 tests**. Two proposed contracts still have gaps: four core scales can include a key already declared by a retained recipe, and the creation draft stores no history to prevent reusing a deleted step key. I also found that the library review omits the existing 26 entries’ proposed coefficients, which CONTEXT explicitly says Mark should see.


Reviewed against source at `59dd5be`, including the round-3 review in git and the current dispositions. Baseline verification passed: **96 test files, 3,007 tests**. I also checked the dataset, recomputed all 19 seeded Sheet codes, and reproduced the step-key reuse and proposed catalog-key collision scenarios.

Phase-specific browser checks and Mark’s List readbacks remain execution evidence; they were not performed in this review.

## 09-01

**Summary.** The converter and baseline design are well grounded, but the human-review artifact does not yet cover everything CONTEXT says Mark must approve.

**Strengths**
- The lactose subtraction addresses the actual calculation: `computeBalance` adds lactose from MSNF independently of the dairy flag at `app/src/domain/composition.js:35–44`. Testing milk chocolate as well as dairy is therefore necessary.
- The before-walk captures fields, focus, statuses and text hashes—not merely successful navigation—at `.planning/phases/08-split-the-recipe-page-along-its-jobs/08-walk.mjs:137–166`. Building the historical commit protects those observations from concurrent implementation.

**Concerns**
- **MEDIUM — The existing 26 entries’ proposed coefficients are missing from the prescribed review.** `.planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-CONTEXT.md:49` explicitly says Mark sees the inferred values for the existing entries, including the stabilizer blend, skim milk powder, cocoa and coconut entries. However, `09-01-PLAN.md:167` defines the Coefficients section as “one line per **new entry**” and defers existing entries to subsequent implementation. The checkpoint can therefore approve the generated review without showing these specified judgments.

**Suggestions**
- Add an “Existing 26 entries” coefficient table to the checkpoint artifact, explicitly identifying the inferred values named in D-20.
- Make the later seed-value assertions refer to the approved values, so approval and implementation cannot diverge.

**Risk Assessment: MEDIUM.** Numerical conversion has good controls; approval coverage needs completing before the checkpoint is considered sufficient.

## 09-02

**Summary.** The stored-code change reaches the correct constructors and readers. One existing equality assertion needs an explicit update.

**Strengths**
- Both print dependencies are real: `app/src/ui/PrintSheet.jsx:125` and `app/src/ui/PrintSheetPages.jsx:84` currently derive codes from content. The stored-code-differs tests will prove these readers actually switch.
- `printedContent` uses explicit fields at `app/src/domain/sheetCode.js:55–81`, excluding embedded coefficients and equipment. The other planned stored-field additions should not disturb legacy codes.
- I recomputed all 19 codes; they match the plan, including `64JH-G408`.

**Concerns**
- **LOW — Stamping copies breaks the existing seed-group equality test.** `app/src/data/seed-recipes.test.js:41` compares `seedRecipeGroups.slice(1)` directly with unstamped `transcribedRecipeGroups`. The proposed stamping makes them unequal. This file is already owned by the task, so this is a small omitted instruction rather than a dependency problem.

**Suggestions**
- Update that assertion to compare against explicitly stamped expected versions, preserving group order and all other fields.
- Retain the separate no-mutation assertion for direct exports.

**Risk Assessment: LOW.** The remaining issue is a predictable test adjustment in an already-owned file.

## 09-03

**Summary.** The routes, filtering and defensive rendering match the intended places. The CSS task cannot pass its prescribed verification without updating the stylesheet’s existing contracts.

**Strengths**
- Reusing `activeWork()` preserves Home’s grouping and recency order through its actual implementation at `app/src/domain/lastEvent.js:111–132`.
- Defensive handling of cosmetic fields is justified: `app/src/store/transfer.js:221–243` validates the library name and composition but leaves those fields unchecked.
- Preventing search-form submission follows the existing behavior at `app/src/ui/SheetCodeSearch.jsx:67–68`.

**Concerns**
- **HIGH — The stylesheet contract sweep is incomplete.** The planned `.nb__*`/`.ing__*` rules and three media conditions conflict with:
  - permitted selector roots at `app/src/styles/shell.test.js:60–69`;
  - the exact media-condition set at `:81–83`;
  - the exact two-media-block count at `:114–119`;
  - the exact border-radius selector list at `:380–382`.

  The approved board really adds radiused place selectors, including `.ing__head`, at `.planning/sketches/012-places/ingredients-place.html:2945–2949`. `shell.test.js` is not assigned to this plan, yet Task 3 runs that suite.

**Suggestions**
- Assign `app/src/styles/shell.test.js` to Task 3 and update its narrow contracts for the approved place rules, retaining token checks and existing shell-layout guarantees.

**Risk Assessment: HIGH until corrected.** This is a deterministic execution blocker, not merely a visual uncertainty.

## 09-04

**Summary.** The plan correctly distinguishes incomplete drafts from valid saved records. Two state-history cases remain outside the proposed contract.

**Strengths**
- The creation branch addresses the real version prerequisite at `app/src/ui/useKeptDraft.js:112`.
- The new dirty-input race test extends an existing late-read mechanism at `:126–130`; it does not assume repository reads resolve immediately.
- Reusing the existing writer preserves the snapshotting performed by `buildDraftRecord` at `app/src/domain/draft.js:71–80`.

**Concerns**
- **MEDIUM — The frozen payload cannot preserve step-allocation history after outright deletion.** The allocator at `app/src/domain/stepKeys.js:24–35` uses only the highest remaining step number. Its documented safety depends on retaining removed steps (`:4–10`). The creation payload stores current method steps but no watermark or issued-key history, while `.planning/ROADMAP.md:213–221` requires outright removal and no reused key. I reproduced allocating `3`, deleting it, restoring the remaining method, and allocating `3` again.
- **MEDIUM — The late-read fix misses “typed, then cleared.”** Under the prescribed branch order, a changed creation payload skips restore before setting `draftStoredRef.current`. That ref begins false at `app/src/ui/useKeptDraft.js:25`, while clean-draft deletion requires it to be true at `:185–191`. If the maker types and clears back to blank while the read is pending, the old stored draft survives and can reappear next visit. The round-3 fix covers dirty replacement, but not this clean outcome.

**Suggestions**
- Settle persistent step-allocation history for both creation drafts and editable first versions before declaring the shapes frozen.
- Track that a stored record exists even when local edits win; test pending read → type → clear → resolve → reopen, expecting the old draft to be gone.

**Risk Assessment: MEDIUM.** These are lifecycle gaps with specific, bounded fixes.

## 09-05

**Summary.** The library-link and temperature changes preserve the existing copy boundary. The full-suite gate has an unassigned source-contract failure.

**Strengths**
- Ingredient independence already rests on `structuredClone` in `app/src/domain/versionRow.js:65` and `app/src/data/olive-oil.js:54–58`. Adding an informational link without dereferencing it for calculations preserves that guarantee.
- The strawberry exceptions are genuinely separate recipe-owned definitions at `app/src/data/strawberry.js:34–68`.
- I verified the 19 Ice Ed temperatures: 17 numeric values and the two specified nulls.

**Concerns**
- **HIGH — Removing Olive Oil’s direct library import breaks an explicitly pinned importer.** `app/src/store/library.test.js:226–231` requires `data/olive-oil.js` among the direct library importers. Replacing its local embed helper removes that import. The plan does not own this test and explicitly tells the executor to stop on unexpected files.

**Suggestions**
- Assign `app/src/store/library.test.js` here and replace the expected importer with `data/library-embed.js`.
- Keep the existing restriction that only seeding and data modules import the library.

**Risk Assessment: HIGH until the test ownership is corrected.** The production design is straightforward; the prescribed execution otherwise stops.

## 09-06

**Summary.** Transactional code enforcement and failed-save recovery are well separated and target the actual write paths.

**Strengths**
- The unchecked single-version write is precisely at `app/src/store/repository.js:32–35`; moving read/check/write into one transaction closes the relevant race.
- The explicit abort pattern at `app/src/store/repository.js:158–179` already handles synchronous failures that could otherwise leave queued writes committing.
- The existing failure handler keeps the pen open and releases the lock at `app/src/ui/useVersionPen.js:211–215`. The proposed UI test verifies that behavior remains true for code collisions.

**Concerns**
- No new material concern in the prescribed production paths. The deliberate distinction between `createVersion`, save-over and seed bulk writes is stated rather than concealed.

**Suggestions**
- Keep both the two-connection collision test and the retry test. Store serialization does not establish preservation of entered text.

**Risk Assessment: LOW.** The central invariant is enforced at the correct persistence boundary.

## 09-07

**Summary.** Candidate conversion and retained app values are appropriately tested separately. The larger seed invalidates more assertions than the assigned count updates cover.

**Strengths**
- The merge extends the existing seed boundary at `app/src/store/seed.js:21–27`; spreading incumbent entries last protects their keys.
- The lactose invariant exercises the actual independent MSNF contribution at `app/src/domain/composition.js:35–44`.
- Comparing incumbent fields with the base file is stronger than merely comparing stored entries with the newly edited `library.js`.

**Concerns**
- **HIGH — An unowned export assertion still requires exactly the incumbent library size.** `app/src/store/transfer.test.js:922–934` exports a real seeded profile and asserts its library length equals `Object.keys(library).length`. After the larger seed lands, that assertion fails. This plan’s file list excludes `transfer.test.js`.
- **MEDIUM — Some assertions need a merged lookup, not only a new count.** `app/src/store/seed.test.js:119–124` checks every seeded record against `library[record.id]`. Updating its length alone leaves new entries compared with `undefined`. The task currently specifies count changes but not this lookup change.

**Suggestions**
- Assign the export assertion update before this plan’s full-suite gate, with file ownership coordinated to avoid concurrent edits.
- Use the merged seed for per-record expectations. In the transfer test, compare the exported library with the source repository’s actual library rather than an unrelated incumbent-only constant.

**Risk Assessment: HIGH until corrected.** The data design is sound, but the prescribed suite cannot pass unchanged.

## 09-08

**Summary.** Definition cloning and serving-temperature propagation are correctly coordinated. The saved representation of an authored style is still unsettled.

**Strengths**
- `createChildVersion` currently shares declared arrays at `app/src/domain/lineage.js:141–142`; cloning removes a real alias.
- Updating root and child together respects `app/src/store/creation-roundtrip.test.js:107–108`, which checks equal key sets and rejects own `undefined` values.

**Concerns**
- **MEDIUM — Open contract question: where does the chosen style persist?** The creation draft contains a style id, and `.planning/ROADMAP.md:214` says Save carries the authored style. However, the root record at `app/src/domain/newRecipe.js:62–80` has no style field, and the child constructor at `app/src/domain/lineage.js:130–149` has no style propagation rule. This plan fixes the root’s key set without settling that representation.

**Suggestions**
- Define whether the saved version retains a style id, a style snapshot, or only copied defaults.
- If the selection persists, assign its seed/default value, validator and child-copy behavior now. If only defaults persist, explicitly reconcile that with the roadmap’s “style included” promise.

**Risk Assessment: MEDIUM.** Current edits are coherent; the broader stored-shape freeze remains incomplete.

## 09-09

**Summary.** The bounded reset, rollback case and historical-version ratchet are strong. The new problem table needs a collection-level identity rule.

**Strengths**
- The existing synchronous upgrade and guarded creates at `app/src/store/db.js:24–55` support the proposed bounded reset.
- Changing the newer-version test is necessary: `app/src/store/db.test.js:284–292` currently opens literal version 10, which ceases to be newer after this bump.
- Seeding tables before the versions early return correctly follows the current boundary at `app/src/store/seed.js:22–24`.

**Concerns**
- **MEDIUM — Distinct problem ids can have duplicate problem words.** The planned row validator checks each `{id,name,order}` independently, but tasting identity is the word, as shown by `app/src/store/transfer.js:295–306`. Two valid rows with different ids and the same name can therefore pass table validation. Copying their names produces duplicate snapshot words, which the planned snapshot validator explicitly refuses in `.planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-14-PLAN.md:95`.

**Suggestions**
- Add a shared collection check for unique problem names.
- Apply it at boot and to the resulting imported problem table, including the transactional check.
- Test accepted catalog → recorded batch → export validation.

**Risk Assessment: MEDIUM.** Reset coverage is good; table validity must imply validity of records created from that table.

## 09-10

**Summary.** The transaction-level core-count fix addresses the previous race. Cardinality alone still does not establish a compatible resulting store, and the fixture sweep contains a demonstrably false exemption.

**Strengths**
- Eight-store import and export extend the existing atomic transaction boundaries at `app/src/store/repository.js:158–198`.
- The controlled race through `importStore` appropriately tests error translation as well as transaction refusal; the current generic catch is at `app/src/store/transfer.js:697–700`.

**Concerns**
- **HIGH — Four core scales can still collide with retained declared scales.** The plan checks incoming versions against file scale keys, then checks only the merged core count. A file with no versions can demote `sweetness` and promote `oil` to core. The resulting count remains four, while retained Olive Oil still declares Oil (`app/src/data/olive-oil.js:120`). Applying the proposed reader produces keys:
  `hardness, scoopability, smoothness, oil, body, oil`.

  `AxesGrid` reads and writes marks by `axis.key` at `app/src/ui/BatchRow.jsx:195–204`, so the two Oil controls share one mark. A newly created snapshot then fails the planned core/declared collision validation. This remains possible after the round-3 cardinality-race fix.
- **HIGH — Older files are not rejected before array validation.** The exemption at `09-10-PLAN.md:131` contradicts `app/src/store/transfer.js:577–604`: validation appends schema errors and continues through arrays. `app/src/ui/Shell.flyout.test.jsx:354–360` explicitly expects four errors. Adding four required arrays changes that to eight. Its mock calls the real importer by default (`:18–24`), so wrapping it in a provider does not solve this.
- **MEDIUM — The sweep omits a test created earlier in this phase.** `09-05-PLAN.md:116` introduces `library-link.test.js` with an export/import round trip, but the sweep at `09-10-PLAN.md:122–131` does not assign its transition to required codes, temperatures and populated catalog tables. Its eventual fixture choice may avoid some changes, but that is currently unspecified.

**Suggestions**
- Inside the write transaction, validate core-key compatibility across the **resulting versions and scales**, including retained local versions.
- Add import → record → export → validate coverage for the Oil-promotion scenario.
- Assign the Shell assertion update and the new library-link fixture explicitly, reconciling ownership with the other work in the wave.

**Risk Assessment: HIGH.** An accepted import can produce inconsistent records, and the full-suite gate has a guaranteed unassigned failure.

## 09-11

**Summary.** Normal catalog delivery is well planned. The failed-reload recovery message is truthful in isolation, but its proposed containment and surrounding UI are incomplete.

**Strengths**
- Pre-mount validation fits the existing boot failure boundary at `app/src/main.jsx:27–36`.
- The real-provider test is materially stronger than checking only that the revision increment at `app/src/ui/Shell.jsx:352–353` follows a mocked callback.

**Concerns**
- **MEDIUM — Holding `storeRevision` does not prevent new records rendering with the old catalog.** Navigation remains available at `app/src/ui/Shell.jsx:445–461`. A different recipe/version route mounts a new keyed page at `app/src/router.jsx:80`, whose data hook reads the store at `app/src/ui/useRecipeData.js:32–45` independently of the revision. After a committed import and failed catalog reload, navigation can therefore combine imported records with stale definitions.
- **LOW — The panel heading contradicts the proposed recovery line.** The existing title remains “This file can’t be imported” at `app/src/ui/Shell.jsx:421`, even when the new line says the import succeeded.
- **LOW — Empty-scales behavior is contradictory.** `09-11-PLAN.md:167` accepts empty lists, while `:169` requires exactly four core scales. An empty scales table needs an explicit expected result.

**Suggestions**
- Introduce a post-commit recovery state that prevents routed record use until the catalog is successfully reloaded or the page restarts.
- Test navigation after reload failure, not just an unchanged revision.
- Give that state an accurate heading and make the empty-scales case explicit.

**Risk Assessment: MEDIUM.** The normal path is covered; the failure path does not yet guarantee the consistency it claims.

## 09-12

**Summary.** The route-level context read and presentational prop boundary fit the existing components, with useful coverage of both layout arrangements.

**Strengths**
- The layout constraint is real: stacked rendering maps every core scale at `app/src/ui/BatchRow.jsx:209–219`, while desktop rendering explicitly places four at `:240–245`.
- Passing the catalog from RecipePage is consistent with its existing composition of data and pen hooks at `app/src/ui/RecipePage.jsx:89–142`.
- Testing both direct BatchRow rendering and the route-level tracer exercises different wiring failures.

**Concerns**
- No new material concern in this plan’s provider and prop changes. The four-scale policy is already dispositioned; I am not reopening that choice.

**Suggestions**
- Preserve the renamed-core tests in both arrangements and the assertion that the shared seed fixture remains unchanged.

**Risk Assessment: LOW.** The changes are localized and the test sweep is explicit.

## 09-13

**Summary.** Extending the batch’s existing one-time snapshot is the right mechanism, and the staged caller sweep is well bounded.

**Strengths**
- `createBatch` already copies rows and declared definitions once at `app/src/domain/batch.js:184–189`; adding core definitions at that boundary avoids a second snapshot mechanism.
- `completeRecord` preserves the original snapshot through its spread at `app/src/domain/batch.js:206–212`.
- Updating the exact snapshot-key assertion at `app/src/store/creation-roundtrip.test.js:147–153` prevents a predictable fixture failure.

**Concerns**
- No additional snapshot-copy or caller-ownership gap found. The accepted-catalog consistency issue is upstream; copying a bad catalog faithfully would not repair it.

**Suggestions**
- Retain the cloned-catalog mutation test and the contained-failure gate.
- Once collection validation exists, include one end-to-end proof that a validated catalog produces an importable batch.

**Risk Assessment: MEDIUM.** The surface is broad, but the snapshot mechanism and intermediate verification are appropriate.

## 09-14

**Summary.** Snapshot-based validation establishes the intended historical independence, including custom kinds and renamed definitions.

**Strengths**
- The dependency being removed is concrete: core defects currently validate against global `DEFECTS` at `app/src/store/transfer.js:295–296`.
- The From freezer exclusion reads the tasting’s own marks and words at `:318–324`, so preserving it while changing the allowed-definition source is correct.
- The current mark validator checks only numeric stops at `:255–264`; the proposed key-membership checks close a real omission.

**Concerns**
- No new material concern in the snapshot-validation boundary. The magnitude test appropriately claims storage and transfer coverage rather than kind-aware presentation.

**Suggestions**
- Keep the case where a snapshot-defined problem imports despite being absent from the receiving catalog.
- Preserve the reopen assertion; JSON round-tripping alone does not exercise persisted reopening.

**Risk Assessment: LOW.** The tests directly address the historical-data guarantee.

## 09-15

**Summary.** The final constant retirement and marked-scale stability proof target the correct remaining dependencies.

**Strengths**
- Both draft dependencies are real: the global axis list at `app/src/domain/draft.js:146–148` and global problem words at `:165`.
- Home uses the same draft validator as restoration at `app/src/ui/RecipeList.jsx:93–100`, so passing the catalog there is necessary to keep “Go to draft” honest.
- Checking `readMarkWord` after changing Sweetness exercises the actual anchor lookup at `app/src/domain/axes.js:87–90`.

**Concerns**
- No new material finding. The stated “plan drafts do not read the catalog” rule is compatible with the existing early return at `app/src/domain/draft.js:273`; there is no reason to invent a blanket missing-catalog throw.

**Suggestions**
- Preserve that early return and leave three-argument plan-draft callers valid.
- Keep the static scan described as an architectural guard, with behavioral tests supplying the runtime evidence.

**Risk Assessment: MEDIUM.** The retirement sweep is extensive, but the behavioral invariants are well chosen.

## 09-16

**Summary.** The allow-list now accounts for the added fields and tests its own refusal behavior. This is a strong verification design.

**Strengths**
- The existing diff function emits absent-to-object additions at the enclosing path and primitive-to-definition changes at the element path (`.planning/phases/08-split-the-recipe-page-along-its-jobs/08-walk.mjs:843–855`), matching the planned exact-value checks.
- Required-addition checks address the actual limitation of comparing only differing keys: fields absent from both inputs produce no difference.
- Separate library modes match the distinct measurement datasets at `.planning/sketches/012-places/README.md:46–52`.

**Concerns**
- No new material concern in the comparison mechanism. The previous D-20 omission is addressed by narrow coefficient/provenance paths, required fields and negative cases.

**Suggestions**
- Retain the distinction between expected-value checks and doctored-output tests: the former tests expectations against seeds; the latter tests whether incorrect output is refused.
- Keep evidence verdicts explicit when a measurement passes but a visual difference remains.

**Risk Assessment: MEDIUM.** The verifier is substantial, but its independent checks reduce the risk of a false pass.

## 09-17

**Summary.** The same-origin final-build upgrade and explicit evidence handoff appropriately finish the phase. One proof claim should be narrower than its mechanism.

**Strengths**
- Closing the old page before opening the new build is consistent with the existing connection-release behavior at `app/src/store/db.js:74–76`.
- Reopening with a retained draft distinguishes a successful one-time reset from repeated destruction.
- Row readbacks and versioned writes follow the actual List requirements at `CLAUDE.md:142–148`.

**Concerns**
- **LOW — An unchanged fingerprint does not prove that no intermediate build was ever served.** The guard specified at `.planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-09-PLAN.md:162` compares endpoint content. A transient replacement followed by restoration produces the same fingerprint. The scan and checksum are useful controls, but the conclusion “no build reached app/dist” is stronger than what they establish.

**Suggestions**
- Report the precise evidence: planned build commands use scratch output, and `app/dist` matches its pre-bump fingerprint at handoff.
- Keep the explicit checkpoint for any known intermediate device exposure or unavailable browser/List tooling; no heavier monitoring system is necessary for this phase.

**Risk Assessment: MEDIUM.** Completion still depends on actual browser runs and external List access, which the plan correctly leaves as execution prerequisites.

## Cross-plan assessment

**Recommendation: request bounded changes before execution.**

The round-3 fixes are substantially incorporated: the D-20 basis verification, coefficient ownership, reset-fixture updates, boot fixture, transactional core-count recount and walk allow-list now agree with their stated mechanisms. The remaining issues fall into three groups:

| Priority | Required adjustment | Plans principally affected |
|---|---|---|
| **Before execution** | Assign the stylesheet contracts, direct-library-import assertion, expanded-library assertions and Shell error-count update | 09-03, 09-05, 09-07, 09-10 |
| **Before declaring shapes settled** | Define persistent step-allocation history and the saved-style representation | 09-04, 09-08 |
| **Before accepting imported catalogs** | Check unique problem words and compatibility between resulting core keys and retained version declarations | 09-09, 09-10, 09-13, 09-14 |
| **Before closing lifecycle coverage** | Cover clean local edits during pending restore and navigation after failed catalog reload | 09-04, 09-11 |
| **Before library approval** | Show the existing 26 entries’ inferred coefficients in the review artifact | 09-01, 09-07 |

I checked the declared file sets: **the current multi-plan waves have no direct file overlap**. Preserve that when assigning the missing test edits. In particular, `transfer.test.js` and `Shell.flyout.test.jsx` already have owners elsewhere in their respective waves; adding them casually would create conflicts.

**Overall risk: HIGH as written, reducible to MEDIUM with these corrections.** The architecture does not need replacing. The blockers are specific executable-plan failures and a few incomplete state invariants. The most important product-level issue is that “valid table rows” plus “four core scales” does not yet guarantee that recording from the resulting store produces valid, round-trippable batches.

**Decision question:** Before approving the stored-shape freeze, can every accepted catalog and retained recipe combination be shown to produce a batch that the same build can export, import and reopen without rejection or ambiguous marks?


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

- **Existing tests the plans break without owning them** (Gemini addendum, three HIGH, verified by Claude): 09-03's new selectors and media blocks against `shell.test.js:60,114`; 09-05 dropping olive-oil's library import against `library.test.js:231`; 09-07's merged seed against the 26-entry counts in `transfer.test.js:933` and `seed.test.js:120`. Same class of gap as the agreed 09-10 sweep finding, spread across three more plans: each needs the test file added to its manifest with the approved rewrite.

- **Astra addendum, two new MEDIUMs**: 09-01's review checkpoint omits the 26 existing entries' inferred coefficients that D-20 says Mark sees; 09-04's late-read fix misses the typed-then-cleared case. Plus a wave-overlap caution on assigning the newly owned test files.

### Divergent Views

- **Core-scale identity on import** (Codex HIGH, OpenCode silent). Codex traced a store file with no versions that demotes Sweetness and promotes Oil to core: the count stays four, the retained olive-oil version still declares Oil (`olive-oil.js:120`), the reader returns Oil twice under one key, and the next recorded batch fails the planned collision validator. OpenCode praised the in-transaction recount without testing this case. Worth settling: a compatibility check across the resulting versions and scales inside the write transaction.
- **Are the stored shapes actually settled?** Codex raises two MEDIUMs OpenCode does not: 09-04's create draft stores no step-key watermark, so `stepKeys.js:24` reissues a deleted key after restore (Phase 11 promises no reuse, `ROADMAP.md:221`); and 09-08 fixes the root at 19 keys while the selected style has nowhere to persist (`newRecipe.js:62` has no style field, `lineage.js:130` no copy rule, Phase 11 promises to save it). OpenCode rates the shape-freeze as inherent to criterion 2 and acceptable.
- **09-09 problem names** (Codex MEDIUM): rows are validated one at a time, so two problem ids with the same word can enter the catalog, and 09-14's snapshot validator then rejects the export. OpenCode did not raise it.
- **09-11 failure containment** (Codex MEDIUM): holding `storeRevision` after a failed catalog reload stops one refresh but not navigation (`Shell.jsx:445` → `router.jsx:80` → `useRecipeData.js:32`), so imported records can render against the old catalog; and the panel heading still reads "This file can't be imported" (`Shell.jsx:421`) after a successful import. OpenCode accepted the design and raised only the fake-indexeddb import order.
- **09-15 three-argument callers** (OpenCode LOW-MEDIUM, Codex silent): `penDraft.test.js:586`, `pen-note-roundtrip.test.js:47` and `transfer.test.js:1512,1520` call `draftMatchesVersion` with three arguments on plan drafts; the plan must either forbid a missing-catalog throw or list the files.
- OpenCode's remaining LOWs (09-01 `renamed` precedence and ArtifactData stop rule, 09-03 repository stub at module load, 09-09 naming the constants-test file, 09-13 gate path slicing) are executor-summary material.
