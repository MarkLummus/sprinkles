---
phase: 9
reviewers: [opencode]
reviewed_at: 2026-10-18T00:06:16Z
plans_reviewed: [09-01-PLAN.md, 09-02-PLAN.md, 09-03-PLAN.md, 09-04-PLAN.md, 09-05-PLAN.md, 09-06-PLAN.md, 09-07-PLAN.md, 09-08-PLAN.md, 09-09-PLAN.md, 09-10-PLAN.md, 09-11-PLAN.md, 09-12-PLAN.md, 09-13-PLAN.md, 09-14-PLAN.md, 09-15-PLAN.md, 09-16-PLAN.md]
models:
  opencode: "openrouter/deepseek/deepseek-v4.1-flash#high"
model_sources:
  opencode: "pinned"
---

# Cross-AI Plan Review — Phase 9

<!-- gsd:plan-revision-conflicts:begin -->
## Plan-Revision Conflicts

<!-- gsd:plan-revision-conflicts:end -->

Round 2, after the replan at 6452e66. Round 1 (OpenCode and Codex) is in git at 47604aa.

## OpenCode Review


**Verification basis.** I read the referenced source directly (`db.js`, `repository.js`, `transfer.js`, `sheetCode.js`, `axes.js`, `versionRow.js`, `draft.js`, `useKeptDraft.js`, `useVersionPen.js`, `batch.js`, `newRecipe.js`, `lineage.js`, `component/draft` consumers, `router.jsx`, `main.jsx`, `Shell.jsx`, `RecipePage.shell.test.js`, `db.test.js`, `db-reset.test.js`, `olive-oil.js`, `seed-recipes.js`), ran the real `sheetCode()` over the seed, parsed the external dataset with node one-liners, checked the git history for `71add62`, and confirmed the `05-walk-before.json` snapshot count. Where a plan claim is verified I say so; where it is not, I flag it.

**Round-1 fixes confirmed present.** The genuinely load-bearing round-1 fixes are real: `RecipePage.shell.test.js:233` pins `repository.saveVersion(` at 2 and `:267` pins `buildDraftRecord(` at 2 (so plans 09-04/09-06 must move them, and do); `useVersionPen.js:199` and `:239` are the two `saveVersion` calls; `draft.js:173-177 declaratedOf` does call `axesForVersion`, so 09-08's core-key preservation is a real break to avoid; `PrintLogPages.test.jsx:165-173` really does assert the one-arg call and `DEFECTS`; `db.test.js:284` really opens literal 10. The 19 seeded codes in RESEARCH Pattern 4 reproduce exactly (including `64JH-G408`), and `05-walk-before.json` is 12 scenarios / 94 steps.

---

## 09-01
**Summary.** The offline converter and its reviewable mapping, plus the phase's before-walk at `71add62`. Well-scoped, and the conservation check (every dataset id in exactly one of `samePairs`/`entries`) plus the four D-10a exception pins are strong.
**Strengths.**
- Verified: `71add62` exists, is an ancestor of HEAD, and has **no `app/` commits after it** — so the base-commit build genuinely equals the current app tree, and the before-walk is sound.
- The alcohol rule (ethanol/rum-40pct/alcohol-40pct → `{pac}` only) matches the dataset rows exactly (pac 744/297/297), and the name guard + `nearNames` handle `heavy-cream-36`→`heavyCream` and `lambda-carrageenan`→`carrageenan`, which the dataset confirms do **not** collide by camelKey (verify: `heavyCream36`≠`heavyCream`).
- The byte-identity walk check (lines 1–9 and 42 only) is precise; the node `cut()` comparison is correct.
**Concerns.**
- **MEDIUM — rounding/literal mismatch that will surface in 09-07.** Task 1 pins sweetened condensed milk's `sugar` at `0.4197` but the stated rule is `Number(value.toFixed(6))`, which gives `0.419650`. A `toBe(0.4197)` assertion will fail. (`42.78/100` for milk chocolate happens to be exact at 6 dp; only this one is off.) Plan 09-07 Task 3 avoids the literal by asserting computed `pac/pod/solids`, so the bug is confined to 09-01's test.
- **MEDIUM — the whole phase gates on a human here.** Task 3 is `blocking-human auto` (no `auto_select`), and 09-07/09-09 (wave 2–3) depend on it. With `human_verify_mode: end-of-phase`, waves 2–9 stall until Mark answers. That is intended, but it is the phase's critical path.
- **LOW — wording.** "the union with the existing seven is exactly eleven" is correct in result (dataset has 10 categories, no `fat`; the app adds `fat`), but the plan conflates dataset-only and union counts in places. Harmless.
**Suggestions.** Change the sweetened-condensed-milk pin to `toBeCloseTo(0.4197, 4)` (or pin `0.41965` at 6 dp) so the literal matches the rule. Consider making 09-01 Task 3's checkpoint `auto_select` only if Mark has pre-approved the mapping.
**Risk Assessment: MEDIUM.** High-value and mostly correct; the two MEDIUM items are a test literal and a scheduling reality, not architectural.

---

## 09-02
**Summary.** Store the Sheet code on every version. Architecturally clean: legacy `sheetCode()` kept only for the seed computation, new `codeFromVersionId` sharing the FNV-1a/Crockford step, readers moved to the stored field.
**Strengths.**
- Verified the 19 codes: `sheetCode()` over `seedRecipeGroups` yields exactly the RESEARCH table, 0 duplicates, `olive-oil-ice-cream-v1 = 64JH-G408`.
- `findVersionsByCode` currently filters `sheetCode(version)` (`sheetCode.js:193`); the change to `version.sheetCode` is a small, correct edit.
- The "no-mutation of direct exports" test is the right guard for the `transcribedRecipeGroups`/`seedRecipeGroups` aliasing (they share objects today).
**Concerns.**
- **LOW — fixture discovery.** `newRecipe.test.js` pins an exact key list and must gain `sheetCode`; the plan names this. `store/library.test.js` and `data/seed-recipes.test.js` carry unstamped direct exports until 09-10 — correctly deferred, but two waves of "the fixture validates because the field isn't required yet" is a subtle window the plan should keep stating.
- **LOW — `PrintSheet.jsx` has a single `sheetCode(version)` at line 125 used in two places**; the plan's "drop the import if unused" is correct.
**Suggestions.** Add an explicit assertion that `SEED_SHEET_CODES` has exactly the 19 ids of `seedRecipeGroups` (not a subset) — the plan says "a version whose id has no entry throws", which covers it, but the test should also catch an orphan key.
**Risk Assessment: LOW.**

---

## 09-03
**Summary.** The Notebook and Ingredients places from sketch 012. Good: routes replace the placeholders (`router.jsx:123,126` use `element: <Placeholder>`; the plan uses `Component:`, matching lines 110–121), the tabindex select rule is handled, and `shownFields` defends against accepted-but-odd imports.
**Strengths.**
- Verified `RecipeList.jsx:187 batchCountWords` returns `'not yet made'` for 0 and the plan extracts it.
- Verified `activeWork` (`lastEvent.js:111`) returns `{id,name,latestVersion,versions,batches,…}` — the Notebook's order is genuinely Home's.
- Verified the 26-entry board select lists exactly the app's 7 categories and the board's `All, Dairy, Emulsifier, Fat, Fruit, Other, Stabilizer, Sugar` order, so a data-driven `libraryCategories` reproduces it.
**Concerns.**
- **LOW — the "eleven words" phrasing.** Task 2 says the select shows "the eleven words"; at 26 entries only 7 exist. The code path is data-driven (`libraryCategories(records)`), so behaviour is right; the prose misleads. The 103-board (11 categories) is the source of "eleven".
- **LOW — `shownFields` is a real robustness win but the plan's threat register calls the validator "unchanged";** it correctly rejects tightening the validator instead. Fine.
- **LOW — the WebKit measurement script's numbers are copied from the board's *injected* markup** (README explicitly says "on the built app with the board's markup and rules injected"); the plan renders the real app. Expect first-run divergence; the plan says "measure, then edit" — good.
**Suggestions.** Reflow the "eleven" prose to "the categories the library holds". Keep the `--library` split (it arrives in 09-16) in mind so 09-03's single-mode script isn't left asserting the wrong range.
**Risk Assessment: LOW.**

---

## 09-04
**Summary.** The `create` draft kind and the scale-definition contract, settling criterion 2's "nothing creation stores changes shape after this phase". Addresses the round-1 finding that the payload was incomplete.
**Strengths.**
- Verified `useKeptDraft.js:112` early-returns without a version, so the plan's single-restore-path design with `version: null` genuinely exercises a new branch.
- Verified the exact counts the plan must move (`buildDraftRecord(` 2→3, `deleteDraft` stays 3, `getDraft` stays 1) against `RecipePage.shell.test.js:263-267`.
**Concerns.**
- **MEDIUM — the payload is large and speculative.** It settles `method`, per-row `portions`, `targets`, `process`, `machine` before Phase 10/11 design. Criterion 2 justifies it, but this is the plan most exposed to "Phase 10 discovers a field is missing/needs a different shape", which under criterion 2 would *delete* kept drafts rather than migrate them. The plan mitigates by accepting half-made input and refusing unknown keys — meaning a new key added later silently invalidates old drafts.
- **LOW — `CREATE_DRAFT_KEYS` must exactly equal `blankCreateDraft`'s keys + the payload contract**, or `draftMatchesCreate` refuses every draft. That coupling deserves the same "two lists pinned equal" test `RECORD_DRAFT_FIELD_TYPES`/`RECORD_DRAFT_KEYS` already uses (`draft.js:20-45`).
**Suggestions.** Add the "payload key list equals `blankCreateDraft` keys" pin. State explicitly what happens if Phase 11 needs a new key (drafts incompatible → deleted) so the tradeoff is visible.
**Risk Assessment: MEDIUM.** The shape lock-in is the phase's most consequential irreversible-in-spirit decision.

---

## 09-05
**Summary.** `libraryId` on rows and `maxFillG` on equipment. Correct and well-swept; the round-1 "enumerate the fixture sweep" concern is addressed.
**Strengths.**
- Verified all eight data files define the identical `embed(ingredientName, ingredient, fields)` and olive-oil has exactly 12 call sites (`olive-oil.js:81-92`); `strawberry.js:34,52` definitions are module-private as claimed.
- Verified `rowFromLibraryRecord` (`versionRow.js:32`) validates the row `id` param but **not `record.id`**, so the plan's added `record.id` refusal is a real gap being closed.
**Concerns.**
- **LOW — required `libraryId` ripple.** I confirmed the store-file surface (`grep` over `validateStoreFile|importStore|exportStore|importAll|exportAll`) is the file set the plan names. `pen-note-roundtrip.test.js:64` calls `saveVersion(child)` on a `createChildVersion` child (rows cloned from a stamped version, so it keeps `libraryId`) and needs no edit — consistent with the plan.
- **LOW — the "exactly two null-linked definitions" test** compares a *set of distinct ingredients* by deep equality; if a future recipe adds a third own-definition this test fails by design. Good, but note it couples to `strawberry.js`.
**Suggestions.** None material.
**Risk Assessment: LOW.**

---

## 09-06
**Summary.** Enforce code uniqueness/immutability in the write transactions. The two-tab test and the refused-save UI case are the right proofs.
**Strengths.**
- Matches the repository's existing abort-by-hand pattern (`repository.js:158-180`); the plan's `createVersion` shape is faithful.
- Correctly identifies that routing the child save through `createVersion` drops `saveVersion(` from 2→1 at `RecipePage.shell.test.js:233` and adds `createVersion(` at 1.
**Concerns.**
- **LOW — `sheetCodeProblems` and code-less versions.** A version with no string `sheetCode` "takes part in no clash". Every app creation path sets one, but `putAll` (seed bulk write) and any hand-built test version do not. The plan's `repository.test.js` cases cover the important paths; the semantic hole (a code-less version can coexist) is only sealed by 09-10's import requirement, not by `createVersion`. Since `createVersion` is only called with a freshly-built child/root (both stamped in 09-02), acceptable.
- **LOW — save-over must not count a version against itself.** Covered by the behavior block ("its own code is not a clash").
**Suggestions.** Consider requiring a canonical `sheetCode` on `createVersion`'s input (a caller bug otherwise), which would close the hole at the source.
**Risk Assessment: LOW.**

---

## 09-07
**Summary.** Seed the merged library, record every same-ingredient decision, prove lactose-once. The `candidate(datasetId)` fix (round 1) is correct and important.
**Strengths.**
- Verified `library.js` has 26 keys, 4 `sugar`, and exactly 5 names containing "milk" (`Whole milk, 3.5% fat`, `Skim milk powder`, `Whole Milk 3.3%`, `Coconut Milk, Trader Joe's`, `Whole Milk 3.7%`) — so the board's "milk gives 5 of 26" is consistent.
- The "kept app values are a separate assertion" split correctly avoids asserting dataset totals on app-kept entries.
**Concerns.**
- **LOW/MEDIUM — the 09-01 literal mismatch propagates here** only if 09-07 re-pins it; the plan wisely asserts computed values instead.
- **LOW — the solids tolerance equals the measured maximum (0.15).** Research measured "solids within 0.15"; the two inconsistent rows are handled by the `msnf = solids − fat` rule, but a 0.15 bound with zero margin is brittle to a rounding change in 09-01. Consider 0.16.
**Suggestions.** Loosen the solids tolerance slightly or document why exactly 0.15.
**Risk Assessment: LOW.**

---

## 09-08
**Summary.** Declared scales become definitions carrying `kind`; children clone them; the validator and draft check move onto definitions.
**Strengths.**
- The round-1 HIGH fix is real and correctly reasoned: `fitsRecordValues` (`draft.js:165-168`) checks marks against `declared.axisKeys`, so `declaredOf` must keep the four core keys. The plan writes core-only/declared-only/combined cases first.
- The load-bearing sequencing (this plan before 09-11's signature change; `declaredOf` stops calling `axesForVersion`) is explicitly named.
**Concerns.**
- **LOW — the validator's core-key source is transitional.** In 09-08 `validateDeclaredAxes` takes `coreKeys` from `AXES`; 09-10 replaces it with the file's own scales table. Two waves of "core keys from different sources" is fine but should not be forgotten; both plans name it.
**Suggestions.** None material.
**Risk Assessment: LOW.**

---

## 09-09
**Summary.** `DB_VERSION` 9→10 with the bounded reset, four new seeded tables, and two ratchets. The heart of the phase.
**Strengths.**
- Verified `db.js:4` (`DB_VERSION = 9`), `:24` (reset `< 8`), `:54` (library create) — the plan's edits are exact.
- Verified `db.test.js` literal pins at 84/116/152/224/270 and the "newer version" open at `:284` (`toBe(10)` at `:292`); the plan's "open at `DB_VERSION + 1`" fix is necessary and correct (otherwise the test hangs/passes wrongly at 10).
- The behavioural ratchet starting from literal `RESET_BOUND = 10` (not `DB_VERSION`) is the correct fix for the round-1 finding.
**Concerns.**
- **MEDIUM — auto-selected reset is honest but is a real one-way gate.** The plan words it as a record, not a confirmation, and rests on "no plan writes `app/dist`". I verified every build in every 09 plan uses `--outDir` into `${TMPDIR}/sprinkles-09`; the rule holds. Still, the guarantee depends on *all 16* plans honouring it — a single stray `vite build` later would hand a device an intermediate v10 build whose batches lack `coreScales` (09-13). The plan states this; it is a coordination risk, not a defect.
- **LOW — `STORE_SCHEMA_VERSION` naming.** Plan 09-09's prose says it "mirrors `VERSION_SCHEMA_VERSION`" awkwardly; verified `VERSION_SCHEMA_VERSION` lives in `olive-oil.js:14` (6) and `newRecipe.js:19` (6), `BATCH_SCHEMA_VERSION` in `batch.js:20` (4). The plan's "nothing branches on them" is right.
- **LOW — static ratchet fragility** (comment-stripped, anchored on `oldVersion < 10`) is acceptable; `db.js` has no `.clear()` today, so the scan is clean.
**Suggestions.** Add a one-line guard test that **no** file under the phase's scripts/plans builds without `--outDir` (or a runtime check in `vite.config`) to make the "no `app/dist`" premise mechanical rather than conventional.
**Risk Assessment: MEDIUM.** Correct in construction; the risk is coordination (one stray build) rather than code.

---

## 09-10
**Summary.** The four tables travel in the store file (schema 8→9); import enforces the code rule; new `storeFileOf` fixture builder.
**Strengths.**
- Verified `STORE_SCHEMA_VERSION = 8` (`transfer.js:29`), `importAll`/`exportAll` write/read exactly four stores (`repository.js:158,185`).
- The round-1 fix (enumerate fixtures + shared builder) is comprehensive; I confirmed the store-file test surface matches the plan's list, with `Shell.flyout.test.jsx`/`Shell.importGuard.test.jsx` correctly exempt.
- The `CORE_SCALE_COUNT` merged-scales pre-check is a good fail-closed gate.
**Concerns.**
- **LOW — `fileCoreKeys` defensive reading** is right; the plan's three malformed-scales cases cover it.
- **LOW — importing the tables on the "file wins" rule** means an imported `scales` table can replace core-row words; the cardinality check prevents a bad count but not bad words. That is by design (D-14) and the boot check (09-11) validates rows.
**Suggestions.** None material.
**Risk Assessment: LOW.**

---

## 09-11
**Summary.** Read the catalog at boot, validate seed tables, reload after import, printed log reads it.
**Strengths.**
- Correctly identifies `PrintLogPages.test.jsx:165-173` as a case that must be rewritten (it asserts the one-arg call and `DEFECTS`), and `PrintLogPages.jsx:186,195` as the two reads.
- `IMPORT_RELOAD_LINE` for a committed-but-unreloaded import is a genuinely good recovery path (`Shell.jsx:352-353` is the target).
- `catalogFrom` as the single sorting boundary is a clean contract.
**Concerns.**
- **MEDIUM — `firstDamagedTable` checking the library too can brick boot.** `validateLibraryRecord` (`transfer.js:221`) only checks id/name/composition, so a malformed-but-accepted entry (object `category`, etc.) still passes — but any future validator tightening or a hand-edited store that fails stops the app. The plan flags this as "Claude's reading, Mark may narrow" and puts it on a decide row. Acceptable, but note 09-03 deliberately keeps `shownFields` defensive *because* the validator is loose; boot-refusing on the same loose validator is a different posture. The asymmetry is intentional but worth calling out.
- **LOW — Shell now depends on `useCatalog`**, which forces every Shell render path in tests to be wrapped (plan handles it).
**Suggestions.** In `firstDamagedTable`, consider validating the library with the *same* strictness `shownFields` tolerates (i.e., don't boot-refuse on cosmetic library fields) to avoid a store that renders fine but won't open.
**Risk Assessment: LOW/MEDIUM.**

---

## 09-12
**Summary.** The record pen reads the catalog; the page reads it once and passes it down.
**Strengths.**
- Verified `BatchRow.jsx:1052` uses `axesForBatch(openBatch or a stand-in {snapshot:{declaredAxes}})` and `:1091` maps `DEFECTS`; `:240-245` really does place `core[0..3]` in the desktop grid while the stacked list maps every core scale — so the `CORE_SCALE_COUNT` constraint is well motivated.
- The "no-provider mount must fail" acceptance is a better check than a text grep.
**Concerns.**
- **LOW — `RecipePage.shell.test.js` "imports nothing it does not use" requires each import used ≥2 times** (`:468-480`). Adding `useCatalog` (import + one call = 2) passes narrowly; if the plan later inlines the call, it breaks. Worth noting.
- **LOW — `BatchRow.test.jsx`'s stand-in** (`{snapshot:{declaredAxes}}`) is replaced by `axesForVersion(version, SEED_CATALOG)`; the acceptance grep guards it.
**Suggestions.** None material.
**Risk Assessment: LOW.**

---

## 09-13
**Summary.** `createBatch` snapshots core definitions; `axesForBatch` reads the snapshot; every caller updated; a contained-failure gate.
**Strengths.**
- Verified `batch.js:176` signature and that `createBatch` currently snapshots `declaredAxes`/`declaredFlaws` only; adding `coreScales`/`coreProblems` is the right shape.
- The round-1 fix — run the full suite after the data-file sweep, before the UI — addresses the module-load cascade risk well. The JSON-reporter gate is concrete.
- The "mutate `structuredClone(SEED_CATALOG)`, never the shared fixture" rule and the "kind is stored, not kind-aware presentation" handoff to Phase 12 are both correct.
**Concerns.**
- **LOW — `createBatch` requiring `catalog` throws at module load for any missed data file**, which is exactly why the gate exists. The plan's enumeration (12 calls) is verified: 1+3+2+2+3+1.
- **LOW — `BatchRow.test.jsx` is edited in waves 2, 4 and 6** (libraryId, sheetCode, createBatch catalog). Fine, but the file is a repeated touchpoint.
**Suggestions.** None material.
**Risk Assessment: LOW.**

---

## 09-14
**Summary.** Import judges each batch by its own snapshot; the magnitude/renamed-definition round trip. Split out of 09-13 to fit budget.
**Strengths.**
- Correctly removes `AXES`/`DEFECTS` from `transfer.js:11-12` and judges marks/defects from `snapshot` only — the D-03a requirement.
- `definition-roundtrip.test.js` (minted magnitude key + renamed `oil`) is the right coverage generalisation over the incumbent goldilocks pair.
**Concerns.**
- **LOW — `validateTasting`'s From-freezer exclusion** reads the tasting's own marks/defects/declared defects; the plan keeps it unchanged and pins two cases. Fine.
- **LOW — `snapshot.coreScales` held to exactly 4** duplicates the 09-10 import pre-check and 09-11 boot check; three enforcement points for one invariant is a lot, but it is the same constant.
**Suggestions.** None material.
**Risk Assessment: LOW.**

---

## 09-15
**Summary.** Kept-draft checks read the catalog; retire the domain constants; the static seed-data scan; the stability proof.
**Strengths.**
- Correctly carries the round-1 fix (change `Sweetness`, which the 2 Aug batch actually marks, not `Hardness`) — verified `batch-2026-08-02.js` marks `{ sweetness: 4, oil: 4 }`.
- `seed-data-scan.test.js` is honestly scoped as a static-import guard with an exact-path allow-list, and correctly keeps `store/catalog.js` off it.
- Verified `sheetPages.fixtures.js` is the only `.fixtures.` file besides the two planned ones, and it does not import `data/` — so the allow-list is complete.
**Concerns.**
- **LOW — the second scan case ("an array literal holding all four core problem words or all six scale names") could match comments/prose.** The plan says "array literal", so it should be regex-bounded; worth stating it strips comments like the sibling scan does (`RecipePage.shell.test.js` `stripComments`).
- **LOW — removing `AXES`/`CORE_AXIS_COUNT`/`DEFECTS` touches ~15 files** (verified). The plan enumerates the non-test consumers (`sweep` is empty; only tests + `draft.js`). Behavioral risk is low because 09-11/09-12/09-13 already moved the readers.
**Suggestions.** Specify comment-stripping in the second scan case.
**Risk Assessment: LOW.**

---

## 09-16
**Summary.** Re-walk with the allow-list + required-additions, the two-mode places check with PNG evidence, the WebKit 9→10 reset, and Mark's List rows.
**Strengths.**
- The allow-list **plus** required-additions design (round-1 HIGH fix) is correct: a field absent from *both* files makes no diff, so the additions pass is essential. The selftest's four doctored cases (name/nulllink/code/nocode) are exactly the right negatives, and "the child's id read from the dumped record, not assumed from the counter" is the right fix.
- Verified `05-walk-before.json` is 12 scenarios/94 steps; "MATCH 94 snapshots" is achievable.
- The `--library original|current` split (26 vs 103 numbers) correctly reflects that the board's 26-entry and 103-name row ranges are different datasets.
- One-origin dual-build `09-upgrade-check.mjs` is a sound way to see the reset with a reopen in WebKit, and the "no `app/dist`" rule is honoured by every build command.
**Concerns.**
- **HIGH (delivery) — this is one plan carrying the walk, the places evidence, the WebKit upgrade check, and five Mark's List rows.** The estimate is 96k and confidence "low". If any one of the four heavy artefacts is incomplete, the whole phase's proof is incomplete. Splitting the walk/places proof from the WebKit-upgrade/Mark's-List close would de-risk the phase tail.
- **MEDIUM — the allow-list is only as good as the expected-value functions.** `versions[i].sheetCode` for a walk-created child resolves via `codeFromVersionId(id)` (good), and `libraryId` resolves via the seeded row (good), but the declared-scale name→definition mapping must mirror exactly what 09-08 stored; a mismatch shows as a DIFF and the plan says "stop, do not widen". That is the correct policy but leaves a real chance of a late stop.
- **LOW — PNG evidence verdicts are human**; the plan says a difference is "a gap to report, not to fix here". Consistent with the reset-window discipline.
**Suggestions.** Consider splitting Task 3 (upgrade check + Mark's List) into its own plan so the walk/places proof can land and be reviewed independently. Add an explicit expected-value self-check for the declare `name→definition` mapping before running the walk.
**Risk Assessment: MEDIUM/HIGH.** Highest execution risk in the phase; the design is right, the packaging is heavy.

---

## Cross-plan findings

1. **Ordering is sound.** Waves respect all hard dependencies I could check: 09-09 (bump) needs 09-05/09-06/09-07/09-08; 09-10/09-11 need 09-09; 09-13 needs 09-12; 09-14 needs 09-13; 09-15 needs 09-14; 09-16 last. The transitional states (batches without `coreScales` between 09-09 and 09-13; `validateDeclaredAxes` core-key source moving twice) are explicitly named.
2. **Requirement coverage is complete.** LIB-04…LIB-09, CODE-01, TASTE-03, PLACE-01, PLACE-02 are all mapped; success criteria 1–8 each have an owning plan. No requirement is orphaned.
3. **The one-way migration is the phase's dominant risk**, and the plan-set handles it unusually well: fake-indexeddb proof + behavioural/static ratchets + a WebKit reset with reopen + the "no `app/dist`" convention. The residual risk is a stray build outside the plans, which is a process risk.
4. **`CORE_SCALE_COUNT` is a new invariant** enforced in three plans and surfaced to Mark only at the end (09-16). If lifted, 09-10/09-11/09-14 need rework and the pen's desktop grid needs a redesign. The decision row is the right mitigation, but the ordering means the rewrite would come after the bump — worth an earlier heads-up.
5. **The two real code-level bugs I found are small and fixable in-task:** the `0.4197` rounding literal (09-01/09-07) and the `CREATE_DRAFT_KEYS`/`blankCreateDraft` pin (09-04). Neither is architectural.

## Overall risk assessment: **MEDIUM**

The plan-set is unusually rigorous: every round-1 concern I spot-checked is genuinely incorporated, the plans cite real `file:line` facts (I verified ~20 of them), the walk/ratchet/upgrade proofs are the right instruments for a one-way shape change, and the "settle shapes while reset is free" strategy is coherent. The risks are (a) execution weight concentrated in 09-16, (b) a human gate on the phase's critical path via 09-01, (c) criterion-2 shape lock-in in 09-04, and (d) the process-only guarantee behind the reset's safety. None of these is a design flaw; all are manageable with the small fixes above. I would not block the phase on this review.

---

## Mark's decisions after review round 2 (2026-10-18)

- [x] D-19 (09-CONTEXT.md): each version stores a target serving temperature, a nullable number in degrees C, filled from the chosen style's default and editable; it lands in this phase's one 9 to 10 bump: the version shape, the create draft payload (09-04), the store file schema and validator (09-10) and the sketch/board it appears on (Phase 10 P10_Style). No PAC computation from it in this phase. Clear empties it (Mark, decide-p10-serve-temp-clear, 2026-10-18); picking a style fills it. Phase 9 changes nothing for pasteurise.

## Consensus Summary

One reviewer ran (OpenCode, DeepSeek 4.1 Flash), so nothing here is a 2+ reviewer agreement. It read the repo and cites `file:line` throughout, so it counts at full weight. I confirmed its first finding against the plan text and the dataset: 09-01 pins sweetened condensed milk's `sugar` at `0.4197`, but the stated rule (`Number(value.toFixed(6))`) gives `0.41965`.

### Agreed Strengths
- Every round-1 fix the reviewer spot-checked (about 20 `file:line` facts) is really in the plans, including the marker counts in `RecipePage.shell.test.js`, `declaredOf` keeping the four core keys, and the `PrintLogPages.test.jsx` case.
- The one-way 9→10 reset is proved four ways: fake-indexeddb, behavioural and static ratchets, and a WebKit reset with reopen.
- The 19 seeded Sheet codes reproduce exactly, including `64JH-G408`.

### Agreed Concerns
- **HIGH (delivery), 09-16:** one plan carries the walk, the places evidence, the WebKit upgrade check and five Mark's List rows (estimate 96k, low confidence). Suggested: move the upgrade check and the List rows into their own plan.
- **MEDIUM, 09-01:** the `0.4197` literal does not match the rounding rule (confirmed above).
- **MEDIUM, 09-04:** the `create` draft payload settles many fields before Phase 10 and 11 are designed. A key added later makes old kept drafts invalid. Suggested: pin `CREATE_DRAFT_KEYS` equal to `blankCreateDraft`'s keys, and state the consequence.
- **MEDIUM, 09-09:** the reset's safety rests on no plan building into `app/dist`. Suggested: a mechanical guard.
- **MEDIUM, 09-11:** boot refusal on a loose library validator; consider tolerating cosmetic library fields.
- **MEDIUM, 09-01:** the mapping checkpoint is on the critical path (waves 2 to 9 wait on Mark).
- The `CORE_SCALE_COUNT = 4` rule is enforced in three plans and shown to Mark only at the end (09-16). Suggested: an earlier heads-up.

### Divergent Views
None (single reviewer). Low items worth a look: 09-07's 0.15 solids tolerance has no margin; 09-15's second scan case should strip comments; 09-03's "eleven words" prose should read "the categories the library holds".
