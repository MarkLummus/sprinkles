---
phase: 9
reviewers: [opencode, codex]
reviewed_at: 2026-10-17T20:35:15Z
plans_reviewed: [09-01-PLAN.md, 09-02-PLAN.md, 09-03-PLAN.md, 09-04-PLAN.md, 09-05-PLAN.md, 09-06-PLAN.md, 09-07-PLAN.md, 09-08-PLAN.md, 09-09-PLAN.md, 09-10-PLAN.md, 09-11-PLAN.md, 09-12-PLAN.md, 09-13-PLAN.md, 09-14-PLAN.md, 09-15-PLAN.md]
models:
  opencode: "openrouter/deepseek/deepseek-v4.1-flash#high"
  codex: "gpt-6.1-sol (reasoning=high)"
model_sources:
  opencode: "pinned"
  codex: "banner"
---

# Cross-AI Plan Review — Phase 9

<!-- gsd:plan-revision-conflicts:begin -->
## Plan-Revision Conflicts

<!-- gsd:plan-revision-conflicts:end -->

## OpenCode Review

# Cross-AI Plan Review — Phase 9 (15 plans)

**Verification basis:** I read the repo at HEAD `c722044` and the referenced source files directly. Findings citing `file:line` were checked against the working tree; a few Mark's-List / dataset-file items are flagged as unverifiable. The plans' factual grounding is unusually good — the collision count (18), the lactose constants, the hook guard line, the code callers, and the seed embed structure all check out. The problems are concentrated in fragile source-text tests the plans modify code around but do not name.

---

## 09-01

**Summary** — Converts the 103-row dataset offline into a reviewed module plus mapping/review/checks artifacts, and records the phase's before-walk at base commit `71add62`. The tracer framing, determinism tests, and the D-16 stop-for-review are appropriate for the highest-uncertainty work.

**Strengths**
- The lactose residual rule is mathematically correct. `computeBalance` adds `lactose * PAC_LACTOSE / mass` with `lactose = msnf * 0.545` (`app/src/domain/composition.js:35,43-44`); subtracting `0.545 * msnf_pct` from the dataset PAC and 0.16·lactose from POD makes 100 g reproduce the dataset exactly. The invariant test is the right proof.
- 18 key collisions confirmed by running `camelKey` over the dataset vs `app/src/data/library.js`; `heavy-cream-36`/`lambda-carrageenan` are real non-colliding same-ingredient matches (dataset ids camelCase to `heavyCream36`/`lambdaCarrageenan`, neither a key).
- Baseline isolation via a detached worktree at `71add62` (real commit, `git log` confirms) is the correct way to freeze "before".
- `app/vitest.config.js` sets only `environment: 'node'` (no `include`), so `app/scripts/*.test.mjs` is picked up by `vitest run` as the plan assumes.

**Concerns**
- **MEDIUM — the mapping example ignores the app's existing whole-milk entries.** `library.js` already holds `wholeMilk33` ("Whole Milk 3.3%") and `wholeMilk37` ("Whole Milk 3.7%"), and the dataset row is "Whole milk (3.25% fat)". The plan proposes new key `wholeMilk325`. Normalisation won't flag it: dataset name → `wholemilk325`, app → `wholemilk33`/`wholemilk35fat` — no equality, so `planMerge`'s name guard passes and the review list may not contrast it with `wholeMilk33`. The converter should explicitly compare against `wholeMilk33` in the review list.
- **MEDIUM — self-contradictory walk verify.** The verify compares `08-walk.mjs` and `09-walk.mjs` from `const FIXED_ISO` (line 69) to EOF, but the only other "usage" line is `console.error('Usage: node 05-walk.mjs …')` at `08-walk.mjs:904`, which is after line 69. Changing it (as "the usage lines" implies) fails the byte-identical check. The plan must say only the header comment (lines 4–9) changes and line 904 stays.
- **LOW — `coconut-milk` name guard won't fire.** Dataset "Coconut Milk" → `coconutmilk`; the app's is "Coconut Milk, Trader Joe's" → `coconutmilktraderjoes`. If marked `different`, a near-duplicate "Coconut Milk" entry lands (app's is category `fat`, dataset's `dairy`). It is on Mark's review list, but the automated guard does not catch it.

**Suggestions** — Name `wholeMilk33`/`wholeMilk37` in the review list's WHOLE-MILK row. Pin the exact slice the byte-identical check covers (e.g. "header comment lines 4–9 only"). Add the coconut-milk normalised-name pair to the review list explicitly.

**Risk** — LOW–MEDIUM. Sound core; two wording/spec gaps that would cost a round-trip.

---

## 09-02

**Summary** — Stores the Sheet code on every version: seeded codes committed for the 19 versions, an id-derived code for children/created roots, and print/search reading the stored field. Faithful to decision 19 and to the one-way derivation rule.

**Strengths**
- Respects `sheetCode.js`'s own rule that any change is a new tag, not an edit (`app/src/domain/sheetCode.js:14`); the legacy `sheetCode()` survives for the ratchet and the seed computation.
- Callers verified: `PrintSheet.jsx:125`, `PrintSheetPages.jsx:84`, `findVersionsByCode` at `sheetCode.js:189-199`, `SheetCodeSearch.jsx:80`. The set is complete.
- `saveOverVersion` spreads `...version` (`app/src/domain/lineage.js:162-173`) so the code is preserved for free; the plan only adds to `createChildVersion` and `createRecipe`.
- The `SEED_SHEET_CODES == sheetCode(seed)` ratchet is a strong content-freeze after the fact.

**Concerns**
- **LOW — exact-key fixture.** `newRecipe.test.js` pins exactly 17 keys (`newRecipe.test.js:37-55`); adding `sheetCode` makes 18. The plan says to update it — good, but this is the kind of assertion that must not be forgotten when 09-02 is executed in isolation.
- **LOW — `PrintSheet.test.jsx` asserts against `sheetCode(oliveOilVersion)`** (`PrintSheet.test.jsx:107-108,253,274`). Those still pass only because `SEED_SHEET_CODES['olive-oil-ice-cream-v1'] === sheetCode(oliveOilVersion)`. Correct, but it means the test is not actually proving the stored field is read until the fixture is changed; the plan does list changing fixtures.

**Suggestions** — Add an explicit assertion in `PrintSheet.test.jsx` that a version whose `sheetCode` differs from its content-derived code prints the stored value (proves the field, not the coincidence).

**Risk** — LOW. Well-scoped and verified.

---

## 09-03

**Summary** — Replaces the `/notebook` and `/ingredients` placeholders with the recipe list and the read-only library, a pure `filterLibrary`, shared count words, and a WebKit measurement script.

**Strengths**
- Reuses `activeWork` (`app/src/domain/lastEvent.js:111`) so the Notebook order cannot drift from Home.
- Route shape is valid: `router.jsx:113-119` already uses `Component:`, and `Shell.jsx:461` supplies `<Outlet context={storeRevision} />`, so `useOutletContext()` in the new places works.
- The measured behaviour is checkable and correct: 5 library names contain "milk", 4 are category `sugar` (verified), and "Whole Milk 3.3%" exists.
- `RecipeList.jsx:187` indeed holds a private `batchCountWords`; `IngredientTable.jsx:100` returns `'unreviewed'` for `'inherited'`; both facts the plan relies on hold.
- `tabindex-scan.test.js:14` confirms the select is a documented scan blind spot — the plan's explicit `tabIndex={0}` + WebKit check is the right mitigation.

**Concerns**
- **LOW — placeholder tests unaffected.** `styles/shell.test.js:314` pins `Placeholder.jsx` (kept), and `Shell.test.jsx:31` builds its own routes. The plan's claim they won't break is verified.
- **LOW — board-derived literal measurements.** Row heights (69/71–109) and Name/Category widths are pinned from the sketch README; these are the plan's own numbers, and drift is caught only by the new measurement script. Acceptable given "conformance is side-by-side".

**Suggestions** — None material.

**Risk** — LOW.

---

## 09-04

**Summary** — Adds the `create` draft kind with its own fit check to `draft.js`, and a `creating` branch to `useKeptDraft`, plus the `domain/catalog.js` definition contract.

**Strengths**
- The D-18 diagnosis is exactly right: `useKeptDraft.js:112` returns early without a loaded `version`, and the persist effect only writes plan/record/amend (`useKeptDraft.js:174-193`). The one-restore-path extension is the correct design.
- StrictMode acceptance test with `version: null` mirrors the existing harness (`useKeptDraft.test.jsx:17-25`).
- `draftMatchesCreate` reusing `carriesUnsafeKey` (`draft.js:112`) is the right prototype-pollution guard.

**Concerns**
- **HIGH — breaks `RecipePage.shell.test.js` and the plan says the suite is green.** The `useKeptDraft` job entry pins `['buildDraftRecord(', 2]` and `['repository.deleteDraft(versionId)', 3]` (`RecipePage.shell.test.js:262-275`). Those counts are exactly 2 and 3 today (`useKeptDraft.js:167,175` and `:49,122,191`). Adding a third `buildDraftRecord` branch (for `create`) and a delete for a non-fitting create record makes them 3 and 4 → two named cases go red. `RecipePage.shell.test.js` is **not** in `files_modified`, and Task 2's verification runs `npm --prefix app test` expecting pass.

**Suggestions** — Add `app/src/ui/RecipePage.shell.test.js` to the plan's files and update the two `useKeptDraft` markers (and consider adding a `create`-branch marker so the new path is itself pinned).

**Risk** — MEDIUM–HIGH. The design is correct; the plan will ship a broken suite unless the marker update is added.

---

## 09-05

**Summary** — Every stored row keeps a `libraryId` link; seed files embed through one helper; versions store `maxFillG`; the validator requires both.

**Strengths**
- Verified: 8 data files define `embed` (`olive-oil.js:54`, `pineapple.js:9`, `coconut.js:9`, `strawberry.js:15`, `standard-base.js:12`, `mocha.js:17`, `mexican-chocolate.js:20`, `underbelly-light-base.js:14`); olive-oil has exactly 12 embed calls; strawberry's two local IER definitions are at lines 34/52 used at 108/206/207.
- `versionRow.js:5` explicitly notes the id "never enters the row"; amending that comment is correct (decision 15).
- `validateVersion` genuinely does not validate `equipment` today (`transfer.js:491-546`), so adding it is net-new and safe.
- The LIB-08 proof (change the library entry after save; figures don't move) matches the Phase 6 pattern.

**Concerns**
- **MEDIUM — validator tightening ripples beyond the two tests the plan names.** `validateRow` requiring `libraryId` (transfer.js:98) affects every fixture that passes through `validateStoreFile`/`importStore`, not just `transfer.test.js`. `creation-roundtrip.test.js`, `seed-roundtrip.test.js`, `sheet-code-import.test.js` (09-10) and `library.test.js` build or read store files; the plan should widen the fixture sweep or state it explicitly. Rows built via `createBatch` copy a version's rows (which will carry `libraryId`), so those are fine.
- **LOW — null `libraryId` in the walk.** The two strawberry rows get `libraryId: null`; the plan's own 09-15 allow-list must be written to accept null (see 09-15).

**Suggestions** — State the full fixture sweep, or add a task bullet: "run the full suite and add `libraryId`/`maxFillG` to every hand-built store-file fixture the suite reports".

**Risk** — MEDIUM.

---

## 09-06

**Summary** — Enforces Sheet-code uniqueness/immutability inside the write transactions (`createVersion`, code-checking `saveVersion`), routes the child save through `createVersion`, and commits a colliding id pair.

**Strengths**
- The in-transaction read-check-write is the right fix for the two-tab race; the `importAll` abort pattern is the established precedent (`repository.js:158-180`).
- The brute-forced colliding pair mirrors `sheetCode.test.js`'s existing `COLLIDING_CODE` fixture.
- Refusal leaving the store untouched is correctly specified.

**Concerns**
- **HIGH — breaks `RecipePage.shell.test.js` with no update listed.** The `useVersionPen` job pins `['repository.saveVersion(', 2]` (`RecipePage.shell.test.js:233`). Today `useVersionPen.js:199` (child) and `:239` (save-over) each call `repository.saveVersion(`. Changing `:199` to `repository.createVersion(child)` drops the count to 1 → the marker case fails. `RecipePage.shell.test.js` is absent from `files_modified`, and Task 2's verification runs the full suite expecting pass. (`createChildVersion(`/`saveOverVersion(` markers stay 1 each.)
- **LOW — `saveVersion` on a not-yet-stored id.** `saveVersion` becomes "read stored record, compare codes"; if a version id has no stored record the "changed" check must not false-positive. Worth one explicit test.

**Suggestions** — Add `RecipePage.shell.test.js` to the plan; update the `repository.saveVersion(` marker to 1 and add `repository.createVersion(` = 1. Add a `saveVersion`-on-new-id case.

**Risk** — MEDIUM–HIGH. Same class of gap as 09-04.

---

## 09-07

**Summary** — Merges the converted entries under the 26 (`{...librarySeedDb, ...library}`), records every same-ingredient decision, and gates it with a conflict test plus the lactose invariant.

**Strengths**
- Merge order prevents any new key from overwriting an existing one; the plan's `deep-equal` on the 26 is a strong guard.
- The gate's "differs list must equal the recomputed set" makes both a new difference and a stale record fail — good design against Pitfall 4.
- Tolerance (0.0005 fractions, 0.05 PAC/POD) matches the observed near-misses.

**Concerns**
- **MEDIUM — the seven named conflicts assume specific deltas I could only partly confirm.** Some (salt 580 vs 586, dextrose basis, fructose POD) are named in the research from a prior run; I verified the structural facts but not each numeric delta against the dataset. If any named conflict's recomputed differs is empty, the note would be stale and the gate trips. The plan should let the converter emit the actual differs list and have the human note reference it rather than pre-asserting values.
- **LOW — precondition coupling.** Task 1's `<precondition>` guards on `approvedBy: Mark` in the mapping; good, but nothing enforces it if a run is resumed out of order.

**Suggestions** — Generate the seven notes from the converter's output rather than hand-asserting the two numbers.

**Risk** — MEDIUM.

---

## 09-08

**Summary** — Declared scales become `{key,name,low,high,kind,group}` definitions; readers take them as stored; child copies with `structuredClone`; validator accepts only definitions.

**Strengths**
- Correctly fixes the shared-reference bug: `createChildVersion` today does `declaredAxes: parent.declaredAxes` by reference (`lineage.js:141-142`). `structuredClone` is right.
- Only olive-oil declares axes (`olive-oil.js:120-121`); all other seed versions are `[]`, so the surface is small and verified.
- `validateDeclaredAxes` currently rejects the object shape explicitly (`transfer.js:345-361`) and uses `DECLARED_AXIS_NAMES` (`transfer.js:16`) — replacing that with `isScaleDefinition` + core keys is a clean cut.

**Concerns**
- **MEDIUM — `declaredOf` mid-flight.** `draft.js:176` uses `axesForVersion({declaredAxes})`; the plan moves it to read definition `key` fields. This must land before 09-11 changes `axesForVersion`'s signature, and it does (09-08 wave 2 vs 09-11 wave 4). Correct, but the sequencing is load-bearing and worth naming.
- **LOW — `olive-oil.test.js:122`** pins `declaredAxes` as `['Body','Oil']`; plan updates it. Fine.

**Suggestions** — Note the sequencing dependency on 09-11 explicitly in the plan.

**Risk** — LOW–MEDIUM.

---

## 09-09

**Summary** — `DB_VERSION` 9→10 with one bounded reset branch, `upgradeStores`, `seedTableIfEmpty`, the four seed tables (machines/styles/scales/problems), shared validators, the upgrade proof and two ratchets.

**Strengths**
- Verified the current reset branch (`db.js:24-29`) and the literal version pins: `db.test.js:84,116,152,224,270`, `db-reset.test.js:98,169`, and the "newer version" open at `db.test.js:284` expecting `toBe(10)`. The plan's Pitfall 1 is real and correctly located.
- The claim that `VERSION_SCHEMA_VERSION`/`BATCH_SCHEMA_VERSION` are not branched on holds: only the store file's own `schemaVersion` is branched (`transfer.js:577-581`); per-record `schemaVersion` is type-checked only (`transfer.js:402`).
- Style content matches the approved note exactly (Gelato −12.5, PAC/sugar blank, Sorbet egg-yolk/emulsifier `{min:0,max:0}`, plain-id equipment class/calibration family).
- Two ratchets (behavioural at `DB_VERSION+1`, static text scan) mirror `tabindex-scan.test.js`'s established idiom.

**Concerns**
- **MEDIUM — the reset "confirmation" is auto-selected.** Task 1 is `checkpoint:decision` with `auto_select="proceed"`, so the roadmap's "09-09 confirms the one-way reset before the bump" is not a human stop. The mitigation (no plan writes `app/dist`, so no device sees an intermediate build) is sound and stated, but the phase record should not claim a human confirmation that did not occur.
- **LOW — static ratchet brittleness.** Parsing `db.js` text for `deleteObjectStore|clear(` "outside the block" is fragile; a comment containing the token could confuse it. `db.js` has no `clear()` at all today, so a simpler assertion ("every `deleteObjectStore` lies between the `oldVersion < 10` line and the first guarded create") would be sturdier.

**Suggestions** — If the auto-selected reset is intended, say so and rely on the no-device-build argument rather than a "confirmation"; or downgrade it to a genuine human checkpoint.

**Risk** — MEDIUM (blast radius is one-way) but well-mitigated by design.

---

## 09-10

**Summary** — Store file schema 8→9 with the four tables travelling, file-wins import, and the Sheet-code rule enforced in the validator, pre-check and transaction.

**Strengths**
- `validateStoreFile`'s older-file branch (`transfer.js:577-582`) already produces `OLDER_EXPORT_MESSAGE` for `< STORE_SCHEMA_VERSION`, so bumping the constant to 9 gives the intended schema-8 refusal for free.
- `importAll`/`exportAll` are already single transactions (`repository.js:158-208`); extending 4→8 stores preserves the atomicity guarantee. Drafts correctly stay out (comment at `repository.js:181-184`).
- The in-transaction re-check closes the tab race; `importStore`'s pre-check gives a good message.

**Concerns**
- **MEDIUM — fixture churn.** `creation-roundtrip.test.js`, `seed-roundtrip.test.js`, `transfer.test.js` and `library.test.js` all build or expect store files; the plan lists them but their fixtures now need four arrays *and* canonical `sheetCode`/`libraryId`. This is a lot of mechanical edit that the plan acknowledges only in prose.
- **LOW — `separation of validator concerns.** Moving `validateLibraryRecord` into `seedTables.js` while `transfer.js` re-exports `UNSAFE_KEYS` (relied on by `versionRow.test.js`'s mirror test) must keep the export. The plan notes it.

**Suggestions** — Enumerate the exact fixtures to touch; add a "store-file fixture builder" helper to avoid four arrays hand-written per test.

**Risk** — MEDIUM.

---

## 09-11

**Summary** — Boot validation, one catalog held in a provider and passed into pure functions, reload after import, and the printed Tasting log reading the tables.

**Strengths**
- `main.jsx` is top-level-await and already seeds before render, so inserting an awaited read + validation + provider is straightforward.
- The import reload ordering (await `reloadCatalog()` before `setStoreRevision`) matches the actual handler (`Shell.jsx:347-353`).
- Correctly identifies that `axesForVersion` currently only has three callers (`PrintLogPages.jsx:186`, `draft.js:176`, tests) — small blast radius.

**Concerns**
- **HIGH — `PrintLogPages.test.jsx` source-text assertion breaks and is not named.** `PrintLogPages.test.jsx:164-174` reads `PrintLogPages.jsx` as text and asserts `expect(src).toContain('DEFECTS')` (line 173) and `expect(src).toContain('axesForVersion(version)')` (line 172). This plan's acceptance requires `grep -c "DEFECTS" PrintLogPages.jsx` to return 0 and changes the call to `axesForVersion(version, catalog)`. Both assertions fail. The plan lists `PrintLogPages.test.jsx` as modified but never describes this case, while Task 1's verify runs the file and the full suite.
- **MEDIUM — `BatchRow.jsx`'s stand-in snapshot** `{ snapshot: { declaredAxes: version.declaredAxes } }` (`BatchRow.jsx:1052-1056`) is addressed by 09-12, not here; fine, but the two plans must not both try to own it.

**Suggestions** — Explicitly rewrite the "import no literal list" case to assert the new sources (`axesForVersion(version, catalog)`, `problemNames(catalog.problems)`) and drop the `DEFECTS` literal expectation.

**Risk** — MEDIUM–HIGH for the same reason as 09-04/09-06: a named, verifiable test left unaccounted for.

---

## 09-12

**Summary** — `RecipePage` reads the catalog once and hands it to `BatchRow`; a new record pen uses `axesForVersion(version, catalog)` and `problemNames(catalog.problems)`.

**Strengths**
- Correctly keeps the catalog read at the route level and passed down as a prop (`D-02`), and forbids `BatchRow` importing the context.
- The acceptance greps (stand-in snapshots removed, `problemNames` present) are good structural checks.
- `RecipePage.shell.test.js`'s "imports nothing it does not use" is satisfied by `useCatalog` (import + one use = 2 occurrences).

**Concerns**
- **MEDIUM — `BatchRow.test.jsx` conversions.** Lines 43, 2043, 2061, 2079 build stand-in snapshots; the plan converts them to `axesForVersion(version, SEED_CATALOG)`. Fine, but note 09-13 subsequently changes `axesForBatch` to read `snapshot.coreScales`, so the plan's stated invariant ("no hand-built stand-in left in this file") must survive 09-13's edits too.
- **LOW — the nine RecipePage test files** wrapping in `CatalogFixture` is a lot of two-line edits; the plan lists them all, which is good.

**Suggestions** — None beyond coordination with 09-13.

**Risk** — LOW–MEDIUM.

---

## 09-13

**Summary** — `createBatch` snapshots `coreScales`/`coreProblems`; readers use the snapshot; import validates against the batch's own snapshot.

**Strengths**
- Caller enumeration is accurate: `batch.test.js` 34, `RecipePage.test.jsx` 7, `BatchRow.test.jsx` 3, `recordDraft.test.js` 1, `creation-roundtrip.test.js` 1, `seed-roundtrip.test.js` 1, and the seeded-batch data files total 12 (1+3+2+2+3+1) — all verified.
- `validateTasting` currently checks `defects` against global `DEFECTS` (`transfer.js:295`) and `validateMarks` only checks 1–5 (`transfer.js:255-265`); moving mark-key and defect-membership checks onto `snapshot.coreScales`/`coreProblems` is the correct D-03a fix.
- Removing `AXES`/`DEFECTS` imports from `transfer.js:11-12` is achievable once 09-08/09-13 land.

**Concerns**
- **MEDIUM — the hard-break window is wide.** Between Task 1 and Task 3 the UI and store callers fail. The plan explicitly scopes each task's verify, which is good, but a partial run leaves the tree red for several tasks. That's inherent to the change; worth flagging for the executor.
- **MEDIUM — `createBatch` throwing at module load.** Because data files call `createBatch` at import (`batch-2026-08-02.js:65`, etc.), a forgotten `catalog` throws at import time and can cascade through unrelated test files. The per-task sweep mitigates this but makes ordering load-bearing.
- **LOW — `validateTasting`'s `fromFreezer` mutual-exclusion** (`transfer.js:312-328`) must be recomputed against the snapshot-sourced defect lists, not just the mark keys.

**Suggestions** — Add an explicit "run the full suite after Task 1's data-file sweep before touching the UI" gate so the import-time break is caught early.

**Risk** — MEDIUM.

---

## 09-14

**Summary** — `draftMatchesVersion` takes a catalog; the domain's axis/problem constants are retired; a static scan proves no seed dataset is read from code at runtime; the upgrade proof shows marks survive a scale change.

**Strengths**
- Callers verified: `useKeptDraft.js:121`, `RecipePage.jsx:311`, `RecipeList.jsx:98` — all listed, and `RecipeList.jsx:98` is inside `HomeBody` (`RecipeList.jsx:89-101`).
- The `seed-data-scan.test.js` idea (fail on any `app/src` module importing `…/data/…` outside the seed path) is a good, testable encoding of criterion 6.
- The `db-upgrade-10.test.js` stability proof (rewrite/delete a scales row, reload catalog, marks unmoved through export/import/reopen) is exactly criterion 4.

**Concerns**
- **MEDIUM — scan exemption surface.** It must exempt `app/src/ui/catalog.fixtures.jsx` (built by 09-11, imported by tests), all of `app/src/data`, and `store/seed.js`. Verified no other runtime module imports `data/` today; but 09-11's `store/catalog.js` reads tables via the repository (no data import), which is correct and should be stated so a later author doesn't add one.
- **MEDIUM — solution-wide fixture sweep.** `axes.test.js` (many `AXES` uses), `battery.test.js`, `AxisMark.test.jsx`, `BatchRow.test.jsx`, `PrintLogPages.test.jsx`, `db-reset.test.js` all import the removed constants; the plan lists them, but `axes.test.js` alone has ~40 mentions, so this is substantial.
- **LOW — `RecipeList.nextVersion.test.jsx`** must be wrapped/passed a catalog too (plan lists it).

**Suggestions** — Have the scan exempt by an explicit allow-list of paths rather than a substring `'/data/'` (a future `data`-named module elsewhere would be wrongly exempted).

**Risk** — MEDIUM.

---

## 09-15

**Summary** — Re-walks the built result against the base before-walk with a per-path allow-list, re-measures the places at the larger library, and files Mark's List rows.

**Strengths**
- Per-path expected-value checks plus a doctored-file negative test is the right shape for D-15 ("not whole snapshots ignored"). The `diffLeaves` path format (`stores.versions[3].sheetCode`, `08-walk.mjs:843-862`) is exactly what the allow-list regexes target.
- The no-`app/dist` rule is stated consistently and is what makes 09-09's auto-selected reset acceptable.

**Concerns**
- **MEDIUM — null `libraryId` rows in the allow-list.** The expected value for `versions[i].rows[j].libraryId` / `batches[].snapshot.rows[].libraryId` must accept `null` for the two strawberry rows (09-05). If written strictly ("any other difference fails"), the walk fails on those. The plan does not say.
- **MEDIUM — child code resolution.** The walk's created child id comes from the localStorage counter; the plan says "codeFromVersionId(id) for one the walk created", which is correct, but the exact counter value (`00000000-0000-4000-8000-000000000001`) must be confirmed to match how `08-walk.mjs` seeds the counter.
- **LOW — Mark's List rows are unverifiable here** (no list access). Treat as an open item; the plan's timestamps-from-clock and `if_version` discipline matches `CLAUDE.md`.

**Suggestions** — State the null-libraryId acceptance explicitly and add a `null`-valued row to the doctored-file test so the allow-list is proven not to swallow it.

**Risk** — MEDIUM.

---

## Cross-plan assessment

**Dependency ordering** — Sound. Every `depends_on` is consistent with the wave assignment (1: 01–05; 2: 06–08; 3: 09; 4: 10–11; 5: 12; 6: 13; 7: 14; 8: 15). The load-bearing sequences are real and respected: 09-04's `create` kind before 09-11's catalog and 09-14's `draftMatchesVersion`; 09-08's definition shape before 09-11/09-13; 09-05/09-08 before 09-09's bump; 09-10's schema before 09-13's validators. No file is deliberately edited by two same-wave plans (09-10 and 09-11 touch disjoint files; the plans' `coupling_justified` notes are accurate).

**Cross-cutting risk — source-text tests are the phase's real hazard.** Three plans change code governed by exact-count/exact-string tests that the plans do not name:
- 09-04 → `RecipePage.shell.test.js:262-275` (`buildDraftRecord` 2→3, `deleteDraft` 3→4).
- 09-06 → `RecipePage.shell.test.js:233` (`repository.saveVersion(` 2→1).
- 09-11 → `PrintLogPages.test.jsx:172-173` (`DEFECTS` removed, `axesForVersion` signature changed).

Each of these is a concrete, reproducible red suite that the plan's own "full suite passes" criterion contradicts. This is the dominant risk of the phase and the most actionable fix: add the three test files to the respective plans with the updated expectations.

**Consensus summary** — The plans are technically strong and unusually faithful to source: the lactose math, the collision set, the reset branch, the hook guard, the code callers, the seed-embed structure and the style values all verify. Scope is well-controlled against the roadmap and requirements (LIB-04..09, CODE-01, TASTE-03, PLACE-01/02 all mapped). The main weaknesses are (1) three under-specified source-text test updates that will leave the suite red, (2) a few fixture-sweep and allow-list edge cases (null `libraryId`, validator tightening), and (3) the auto-selected one-way reset checkpoint presented as a confirmation.

**Overall risk: MEDIUM.** The design is sound and the one-way step is well-mitigated; but the phase will not pass its own acceptance criteria as written until the three named test files are added to 09-04, 09-06 and 09-11. No HIGH-severity security or data-loss issue beyond the (properly bounded) reset was found.

---

## Codex Review

Reviewed the repository at `39d369c`, including the referenced implementation, tests, plans, dataset and sketch contract. The current suite passes: **96 files, 3,000 tests**. Mark’s List was unavailable through this session’s tools, so external approval states remain unverified.

## 09-01

**Summary:** A sound converter plan with useful review gates and numerical checks. The alcohol exceptions need a more explicit contract.

**Strengths**

- The lactose subtraction matches the engine: `computeBalance` adds lactose-derived PAC and POD independently of the ingredient’s dairy flag (`app/src/domain/composition.js:35–44`). I independently applied the proposed conversion rules to the dataset; its milk-solids rows met the specified tolerances.
- The baseline strategy preserves the existing deterministic capture mechanism, including fixed identity generation and store dumps (`.planning/phases/08-split-the-recipe-page-along-its-jobs/08-walk.mjs:21–24`, `:169–203`).

**Concerns**

- **MEDIUM:** The alcohol treatment is ambiguous. The generic conversion gives `alcohol-40pct` an `other: 0.4` fraction because its dataset solids are 40%; only ethanol receives an explicit composition override. Saying the other alcohol rows are “flagged the same way” does not establish whether those solids remain. See `09-01-PLAN.md:131` and `/Users/mark/Downloads/sprinkles-ingredient-seed-db.json:1739–1754`.
- **LOW:** The automated output check accepts merely “at least 60” new entries. That would not detect a converter silently omitting several dataset rows (`09-01-PLAN.md`, Task 1 verification).

**Suggestions**

- Pin separate expected compositions and explanatory notes for ethanol, rum and alcohol 40%.
- Assert exact conservation: all 103 dataset IDs appear exactly once as a same-ingredient mapping or a new entry.

**Risk assessment:** **MEDIUM**, concentrated in conversion interpretation rather than architecture.

## 09-02

**Summary:** The stored-code design addresses the right constructors and readers while preserving printed identities.

**Strengths**

- Both constructors build versions explicitly, so adding the field there is necessary; save-over already spreads the existing version and naturally preserves it (`app/src/domain/newRecipe.js:62–80`, `app/src/domain/lineage.js:130–150`, `:162–172`).
- Keeping the legacy derivation protects existing paper. I verified **19 versions, 19 unique codes**, with olive oil still `64JH-G408`. The current encoding mechanism is at `app/src/domain/sheetCode.js:122–130`.

**Concerns**

- **LOW:** Stamping only `seedRecipeGroups` creates two representations of seeded versions: stamped aggregate records and unstamped direct exports. The aggregate currently contains those direct exports (`app/src/data/seed-recipes.js:74–77`); many tests import individual recipe modules directly.

**Suggestions**

- Identify which direct-export fixtures subsequently enter persistence or printing, and explicitly stamp or replace those fixtures.
- Keep a test proving the aggregate stamping does not mutate the original seed objects.

**Risk assessment:** **LOW**; the main implementation risk is fixture consistency.

## 09-03

**Summary:** The places follow the approved scope and reuse appropriate ordering and search seams. The detail rendering contract needs tightening.

**Strengths**

- Reusing `activeWork` preserves Home’s existing recipe grouping, recency ordering and duplicate-name behavior (`app/src/domain/lastEvent.js:111–132`).
- The proposed filters and ordering match the approved board’s deliberately simple search (`.planning/sketches/012-places/README.md:64–66`).

**Concerns**

- **MEDIUM:** The existing library validator deliberately ignores category, basis, source and note types (`app/src/store/transfer.js:209–215`). I confirmed that a record with object-valued category and source passes validation. The new page’s capitalization and React rendering can consequently fail on an accepted import.
- **MEDIUM:** The task omits packed state and hydration temperature from its detail rendering, although the approved board requires both when present (`.planning/sketches/012-places/README.md:34`). Existing entries contain these fields (`app/src/data/library.js:51`, `:88–91`).

**Suggestions**

- Define safe handling for every optional display field accepted by the validator, or explicitly extend validation for this new surface.
- Add Sucrose packed-state and Locust bean gum hydration cases.
- Include a failed repository-read state rather than leaving the page indefinitely loading.

**Risk assessment:** **MEDIUM**, with concrete compatibility and board-conformance gaps.

## 09-04

**Summary:** Extending the existing hook is appropriate, but the proposed creation-draft contract is incomplete enough to block the phase’s stored-shape goal.

**Strengths**

- The plan correctly identifies both existing obstacles: restoration requires a loaded version, and persistence recognizes only the existing pens (`app/src/ui/useKeptDraft.js:110–156`, `:162–201`).
- Reusing the existing writer retains debounce, unmount and pagehide behavior (`app/src/ui/useKeptDraft.js:29–49`, `:203–218`).

**Concerns**

- **HIGH:** The exhaustive allowed-key list has no Instructions/method field or step allocations; rows hold only ID, library ID and one grams string (`09-04-PLAN.md:105`). Creation must author steps and portions (`.planning/REQUIREMENTS.md:36`), and the current persisted model represents these as method steps and row portions (`app/src/domain/newRecipe.js:75–79`, `app/src/domain/draft.js:221–239`). Later implementation must either lose this information or change the supposedly settled contract.
- **HIGH:** Applying `isScaleDefinition` to drafts accepts only complete scale definitions. A partially typed scale can therefore make restoration reject—and delete—the entire creation draft (`09-04-PLAN.md:103–107`).
- **MEDIUM:** Adding a third `buildDraftRecord` call breaks the existing source-contract test, which requires exactly two (`app/src/ui/RecipePage.shell.test.js:267`). That test is absent from the plan’s changes.

**Suggestions**

- Define the full creation payload now, including method, allocations, stable keys and raw incomplete input.
- Separate draft-shape acceptance from saved-record validity.
- Update the source-contract assertions explicitly, preserving their ownership guarantees.
- Test dirty detection against the actual initial defaults, including `"Version 1"`.

**Risk assessment:** **HIGH**; revise before execution.

## 09-05

**Summary:** The copied-coefficients approach preserves the existing model and adds useful provenance without making calculations depend on the library.

**Strengths**

- `rowFromLibraryRecord` already clones the ingredient; adding an informational link preserves that isolation (`app/src/domain/versionRow.js:62–67`).
- Requiring the link on both version and snapshot rows fits the existing shared `validateRow` path (`app/src/store/transfer.js:98–125`).

**Concerns**

- **MEDIUM:** The constructor currently validates the entry but never validates `record.id` (`app/src/domain/versionRow.js:45–60`). Simply copying it into `libraryId` allows the constructor to produce a row that its new import validator rejects.
- **LOW:** “Exactly two strawberry definitions” must describe definition identities, not two row occurrences: seeded versions and batch snapshots repeat rows (`app/src/data/seed-recipes.js:58–61`).

**Suggestions**

- Validate the incoming library record ID with the same nonempty/reserved-name rules as `libraryId`.
- Express the strawberry exception assertion as an explicit set of permitted definition identities.

**Risk assessment:** **LOW** after aligning constructor and validator contracts.

## 09-06

**Summary:** The transaction design closes the intended race. The plan’s verification scope misses existing UI contracts that the API change necessarily breaks.

**Strengths**

- Moving checking into the write transaction improves on the current unconditional `db.put` (`app/src/store/repository.js:32–35`).
- The existing save handler already preserves the draft and reports failure through its catch path (`app/src/ui/useVersionPen.js:199–215`).

**Concerns**

- **HIGH:** Changing the handler to `createVersion` breaks existing UI mocks and assertions that expose only `saveVersion`. A concrete example presses “Save as a new version” and waits for `store.saveVersion` (`app/src/ui/RecipePage.beforeYouStart.test.jsx:259–272`); another does the same for row removal (`app/src/ui/RecipePage.perStep.test.jsx:207–219`).
- **MEDIUM:** The architectural test requires exactly two `repository.saveVersion` calls (`app/src/ui/RecipePage.shell.test.js:233`). The proposed change leaves one.

**Suggestions**

- Add the affected UI tests and source-contract test to this plan’s ownership.
- Assert one creation call and one save-over call, rather than weakening the architectural check.
- Add a UI collision case proving the pen and entered data remain available after refusal.

**Risk assessment:** **HIGH for execution readiness**, although the transaction approach itself is sound.

## 09-07

**Summary:** The merge and conflict gate are well structured, but the lactose invariant currently references records that the generated module intentionally excludes.

**Strengths**

- Spreading existing entries last protects their values mechanically, consistent with the existing seed-on-empty seam (`app/src/store/seed.js:21–27`).
- The proposed numerical invariant checks the actual engine rather than merely checking converted object fields (`app/src/domain/composition.js:26–44`).

**Concerns**

- **HIGH:** Task 3 evaluates every milk-solids check using `librarySeedDb[key]` (`09-07-PLAN.md:151`). However, same-ingredient rows are excluded from that module and retained only in `samePairs` (`09-01-PLAN.md:134–135`). `skim-milk-powder` is such a row; the existing entry is `skimMilkPowder` (`app/src/data/library.js:39–45`). The prescribed lookup is therefore undefined.
- **MEDIUM:** Substituting the merged library would also be wrong: intentionally retained app coefficients need not reproduce dataset totals.

**Suggestions**

- Run dataset invariants against converted candidates, including `samePairs[datasetId].converted`.
- Keep separate assertions for converted-candidate correctness and retained-app-value preservation.

**Risk assessment:** **HIGH** until the test-data contract is corrected.

## 09-08

**Summary:** The definition conversion and child cloning are necessary. Its intermediate draft implementation would reject ordinary core marks before the later catalog work arrives.

**Strengths**

- The plan fixes an actual reference-sharing problem: children currently share both declaration arrays with their parent (`app/src/domain/lineage.js:141–142`).
- Batch creation already deep-copies declarations, providing the right foundation for object definitions (`app/src/domain/batch.js:184–189`).

**Concerns**

- **HIGH:** Task 2 makes `declaredOf` return only declared definition keys. But `fitsRecordValues` checks **every** mark against that returned list (`app/src/domain/draft.js:165–176`). Checking core keys separately in `fitsRecordShape` does not help: a valid Sweetness mark still fails the later check. Plan 09-14 eventually repairs this, but 09-08 requires a green full suite.

**Suggestions**

- Preserve the union of core and declared keys during this intermediate stage.
- Add explicit tests for core-only, declared-only and combined marks before changing the helper.

**Risk assessment:** **HIGH** because the written intermediate implementation violates its own verification contract.

## 09-09

**Summary:** The bounded reset and seeded-table work cover the central upgrade requirements. The future-upgrade proof needs a fixed historical starting version.

**Strengths**

- The proposed reset extends an existing guarded upgrade pattern, including preserving the batch index (`app/src/store/db.js:24–55`).
- Generalizing the existing atomic seed operation retains its count-and-write protection against concurrent booting (`app/src/store/repository.js:130–151`).

**Concerns**

- **MEDIUM:** The behavioral ratchet’s task creates its starting profile at `DB_VERSION`, despite the truth requiring version 10 (`09-09-PLAN.md:151`). Once `DB_VERSION` becomes 11, that test exercises 11→12 and stops covering preservation of a version-10 profile.
- **MEDIUM:** `fake-indexeddb` supplies valuable upgrade tests but does not establish browser persistence behavior. The existing harness uses a fresh `IDBFactory` (`app/src/store/db.test.js:75–78`), while the WebKit walk starts fresh browser contexts (`08-walk.mjs:87`).
- **LOW:** Several declared truths—aborted upgrade rollback and concurrent seeding of the new tables—lack explicit test cases.

**Suggestions**

- Pin the preservation fixture to historical version **10**, independently of the current version.
- Add one WebKit stored-9→10 upgrade case, including reopening.
- Add explicit abort/retry and concurrent new-table seed cases.

**Risk assessment:** **MEDIUM**, with inherently significant consequences if upgrade protection regresses.

## 09-10

**Summary:** The eight-store transaction and repeated Sheet code check address the important import guarantees.

**Strengths**

- The existing import implementation already aborts explicitly on synchronous put failures; extending that pattern preserves atomicity (`app/src/store/repository.js:158–179`).
- Reusing the versions read for prechecks avoids an unnecessary additional read (`app/src/store/transfer.js:655–662`).

**Concerns**

- **MEDIUM:** Deriving core keys from `parsed.scales` introduces a dependency on unvalidated nested input (`09-10-PLAN.md:103`). The current validator validates versions before later arrays (`app/src/store/transfer.js:583–604`). Missing, non-array or null-containing scales must produce errors rather than throw while validating a version.
- **MEDIUM:** The described race test calls `importAll` directly after another write. That tests transaction enforcement, but does not by itself verify that `importStore` translates the resulting error correctly.

**Suggestions**

- Derive core keys defensively and add malformed-scales cases alongside valid versions.
- Add a controlled `importStore` test that inserts the competing write between precheck and transaction, then checks both the message and unchanged stores.

**Risk assessment:** **MEDIUM**.

## 09-11

**Summary:** Boot validation and catalog delivery fit the existing architecture. Post-import reload failure and the ordering contract need explicit treatment.

**Strengths**

- Boot already has a pre-mount asynchronous boundary suitable for validation (`app/src/main.jsx:27–38`).
- Reloading after import uses the correct existing integration point, immediately before the revision update (`app/src/ui/Shell.jsx:347–353`).

**Concerns**

- **MEDIUM:** Catalog reloading can fail after import has committed. The current handler has no catch around this new operation (`app/src/ui/Shell.jsx:347–353`), leaving the app with committed data and potentially stale displayed records.
- **MEDIUM:** The ordering test contradicts the helper contract: `coreScaleDefinitions` preserves supplied order, but the proposed axes test supplies key order and expects table order (`09-11-PLAN.md:126`, `:134`).
- **LOW:** A mocked `reloadCatalog` proves call sequencing, not that the real provider and routed data remain consistent.

**Suggestions**

- Specify truthful recovery for “import committed, catalog reload failed”; do not reuse “Nothing was changed.”
- Choose one sorting boundary and make helper tests reflect it.
- Add an integration case using the real provider and imported changed definitions.

**Risk assessment:** **MEDIUM**.

## 09-12

**Summary:** Reading context at the route and passing data into the presentational row is appropriately scoped.

**Strengths**

- The current fresh-record stand-in is exactly the path that needs replacement (`app/src/ui/BatchRow.jsx:1042–1056`).
- Keeping the Correct path separate preserves its existing snapshot-based declaration behavior (`app/src/ui/BatchRow.jsx:621–626`).

**Concerns**

- **MEDIUM:** The catalog becomes variable, but desktop `AxesGrid` renders only `core[0]` through `core[3]`; stacked layout maps every core axis (`app/src/ui/BatchRow.jsx:209–219`, `:240–245`). Accepted catalogs with additional core rows would display differently across widths.
- **LOW:** Checking only whether tests contain `CatalogFixture` is a weak acceptance condition; source-only tests need no provider, while a named fixture does not prove every mount uses it.

**Suggestions**

- Explicitly enforce the supported core-scale cardinality, or handle additional rows consistently with design approval.
- Test the chosen contract at both layout arrangements.
- Make provider coverage an executed mount check rather than a text-presence check.

**Risk assessment:** **MEDIUM**.

## 09-13

**Summary:** This plan follows the snapshot model through creation, correction, reading and import. Its principal remaining gap is proof using definitions beyond the incumbent goldilocks set.

**Strengths**

- Extending `createBatch` while leaving `completeRecord`’s snapshot untouched preserves the existing immutability boundary (`app/src/domain/batch.js:177–193`, `:206–212`).
- Checking mark keys against snapshot definitions closes a real validation gap: current validation checks mark values but not their keys (`app/src/store/transfer.js:255–264`).

**Concerns**

- **MEDIUM:** The prescribed tests concentrate on existing goldilocks scales. `stopWordsFor`, `readMarkWord` and `AxisMark` currently assume a `"right"` midpoint (`app/src/domain/axes.js:37–38`, `:87–90`; `app/src/ui/AxisMark.jsx:111–114`). Storing a kind therefore must not be mistaken for completing kind-aware presentation.
- **LOW:** Mutation tests against shared `SEED_CATALOG` can contaminate later tests unless they clone or restore the fixture.

**Suggestions**

- Round-trip a custom magnitude definition and renamed declared scale through creation and import.
- Explicitly hand kind-aware rendering to Phase 12.
- Mutate a cloned catalog when testing snapshot independence.

**Risk assessment:** **MEDIUM**, with a strong underlying implementation approach.

## 09-14

**Summary:** Retiring runtime seed constants completes the architectural goal. The stability proof needs a marked scale that actually changes.

**Strengths**

- The planned caller inventory covers all current runtime draft checks: restore, waiting-plan filtering and Home’s draft lead (`app/src/ui/useKeptDraft.js:121`, `app/src/ui/RecipePage.jsx:311`, `app/src/ui/RecipeList.jsx:98`).
- Existing tests already establish that declaration removal from a live version must not affect a batch (`app/src/domain/axes.test.js:97–103`).

**Concerns**

- **MEDIUM:** The upgrade proof changes Hardness, but the seeded batch marks only Sweetness and Oil (`app/src/data/batch-2026-08-02.js:57`). Its marked-word assertions could pass even if core-word lookup incorrectly used the current catalog. Deleting the table’s Oil row primarily tests a declared scale already embedded in the version (`09-14-PLAN.md:158`).
- **LOW:** The import scan catches conventional static imports but does not prove all runtime seed access is impossible; its claim should match its actual coverage.

**Suggestions**

- Change a **marked core scale**, such as Sweetness, and assert its old words after reload and round-trip.
- Also change/remove a later version’s declared definition and problem.
- Describe the scan as an architectural guard, supplemented by behavior tests.

**Risk assessment:** **MEDIUM**.

## 09-15

**Summary:** The checked allow-list is a sensible final regression gate, but its negative tests and library-size measurement modes need strengthening.

**Strengths**

- The inherited comparator reports exact paths and values, providing a suitable foundation for narrow exceptions (`08-walk.mjs:843–855`, `:885–895`).
- The plan preserves device verification as separate evidence, consistent with the sketch’s explicit statement that desktop WebKit measurements are not iPad verification (`.planning/sketches/012-places/README.md:68–70`).

**Concerns**

- **MEDIUM:** Checking only differences does not prove required additions exist. If `libraryId` remains absent in both files, `diffLeaves` emits nothing, so no allow-list check runs (`08-walk.mjs:843–855`; `09-15-PLAN.md:76`).
- **MEDIUM:** “Keep every 09-03 check” retains the 26-entry mobile row range while adding the larger-library range (`09-15-PLAN.md:101`). Those are distinct measured datasets: 88–105 versus 71–109 pixels (`.planning/sketches/012-places/README.md:47`, `:52`). Without fixture modes, valid new rows can fail the old assertions.
- **LOW:** The doctored recipe-name test exercises an unrelated path, not incorrect values at permitted paths.

**Suggestions**

- Assert required new fields independently of the diff.
- Add negative cases for a wrong permitted value and a missing required addition.
- Separate original-library fixture measurements from current-library measurements.
- Record side-by-side visual evidence; passing dimensions alone does not establish full board conformance.

**Risk assessment:** **MEDIUM**.

## Cross-plan assessment

**Recommendation: request changes before execution.** Requirement coverage is broad, but several written steps cannot meet their own green-suite acceptance criteria.

| Priority | Required correction | Plans |
|---|---|---|
| HIGH | Complete the creation-draft contract and preserve partially authored input | 09-04 |
| HIGH | Update UI mocks and architectural assertions for `createVersion` | 09-06 |
| HIGH | Evaluate converted same-ingredient candidates in dataset invariants | 09-07 |
| HIGH | Preserve core marks during the intermediate draft conversion | 09-08 |
| MEDIUM | Align accepted library shapes with safe Ingredients rendering | 09-03, 09-09, 09-11 |
| MEDIUM | Pin historical upgrade fixtures and strengthen final evidence | 09-09, 09-14, 09-15 |

The dependency waves otherwise follow the implementation’s main seams: domain shapes, repository transactions, boot catalog, consumers and final proof. The planned work largely stays within approved scope; deferring magnitude presentation and creation UI remains appropriate.

**Overall risk: HIGH as written.** The principal risks are incomplete contracts and verification dependencies, rather than the chosen architecture. All **15 plans** are covered above.

---

## Consensus Summary

Two grounded reviewers ran: opencode (DeepSeek v4.1 Flash, rated overall risk MEDIUM) and Codex (GPT, rated overall risk HIGH, "request changes before execution"). Both cite `file:line` evidence and both covered all 15 plans. Their overlap is real but their strongest findings differ, so the union is what matters. The orchestrator checked these against the repo: opencode's three HIGH findings (all real), Codex's plan 07 lookup bug (real), Codex's plan 08 `declaredOf` finding (consistent with `draft.js:165-176` and the plan text), and Codex's plan 04 contract gap (the plan's key list has no method steps or allocations).

### Agreed Strengths
- The lactose math, the 18-key collision count, the hook guard line (`useKeptDraft.js:112`) and the caller inventories verify against source.
- Reusing `activeWork`, the existing hook and the existing transaction pattern keeps the new work on established seams.
- The dependency waves follow the real seams; no reviewer found a wave-ordering error.
- Reviewing the full suite: 96 files and 3,000 tests pass today (Codex).

### Agreed Concerns
1. **Plans 04 and 06 break `RecipePage.shell.test.js` and the plans do not name it** (both reviewers). 04 changes the `buildDraftRecord(` count from 2 and the `deleteDraft` count from 3 (`:262-275`); 06 drops `repository.saveVersion(` from 2 to 1 (`:233`). Codex adds that 06 also breaks UI tests that wait on `store.saveVersion` (`RecipePage.beforeYouStart.test.jsx:259-272`, `RecipePage.perStep.test.jsx:207-219`); the orchestrator did not check those two.
2. **Plan 09's upgrade proof is thinner than its stakes** (both). opencode: the reset checkpoint is auto-selected, so do not call it a human confirmation, and the static ratchet should be anchored on `oldVersion < 10`. Codex: build the behavioural ratchet's starting profile at literal version 10, not `DB_VERSION`; add a WebKit 9→10 case and explicit abort and concurrent-seed cases.
3. **Plan 15's allow-list needs negative proof** (both). opencode: it must accept a null `libraryId`. Codex: checking only differences cannot prove a required addition exists; add a wrong-value and a missing-addition negative case.
4. **Fixture sweeps are under-specified** (both): plan 05 (every hand-built store-file fixture, plus validating the library record id before copying it into `libraryId`, from Codex) and plan 10 (four new arrays per fixture; make nested `scales` validation defensive, from Codex).

### Findings from one reviewer only (highest priority first)
- **HIGH (opencode, verified): plan 11 breaks `PrintLogPages.test.jsx:172-173`.** The "no literal list" case asserts `DEFECTS` and `axesForVersion(version)` are in the source; the plan removes both. No task rewrites the case. Codex did not raise this.
- **HIGH (Codex, verified): plan 07 Task 3 reads `librarySeedDb[key]` for `skim-milk-powder`, which plan 01 excludes** from that module and keeps only in `samePairs`. The lookup is undefined. Run the invariant on converted candidates, including `samePairs[id].converted`. opencode rated plan 07 MEDIUM and missed this.
- **HIGH (Codex): plan 08's `declaredOf` returns only declared keys, but `fitsRecordValues` checks every mark against it,** so a valid core mark (Sweetness) fails the check until plan 14. Keep core plus declared keys in the intermediate stage. opencode rated 08 LOW-MEDIUM.
- **HIGH (Codex, partly verified): plan 04's create-draft contract is incomplete.** The key list has rows with only id, libraryId and grams, and no method steps or portion allocations, which conflicts with criterion 2 ("nothing creation stores changes shape after this phase") once Phase 11 adds steps. Applying `isScaleDefinition` to drafts also means a half-typed scale rejects and deletes the whole draft. Separate draft acceptance from saved-record validity.
- **MEDIUM (Codex):** plan 03 renders library fields the validator does not type-check (an object-valued category passes import), and omits packed state and hydration temperature that the board requires; plan 11 has no recovery path when the catalog reload fails after a committed import, and its axes ordering test contradicts the helper's contract; plan 12 renders four core scales on desktop but all of them stacked; plan 13's tests only exercise goldilocks scales; plan 14's stability proof changes Hardness, which the seeded batch never marked; plan 15 keeps the 26-entry mobile row range beside the larger-library range.
- **MEDIUM (opencode):** plan 01's review list should contrast the new whole-milk row with `wholeMilk33` and `wholeMilk37`, and its walk verify must name header lines 4-9 only; plan 07 should generate the seven conflict notes from the converter; plan 13 needs a full-suite gate after the data-file sweep.
- **MEDIUM (Codex):** plan 01's alcohol rows (ethanol, rum, alcohol 40%) need pinned expected compositions, and the check should assert all 103 dataset ids appear exactly once, not just "at least 60".

### Divergent Views
- **Overall risk:** opencode MEDIUM, Codex HIGH. The gap is mostly plans 04, 07 and 08, where Codex found contract errors opencode did not.
- **Plan 09's auto-selected checkpoint:** opencode flags it as a record-keeping problem; Codex does not mention it.
- **Plan 14:** opencode worries about the data-scan exemption surface; Codex about which scale the stability proof changes. Both are valid and do not conflict.

**Recommendation:** replan with `/gsd-plan-phase 9 --reviews` before executing. The four HIGH items on plans 04, 06, 07 and 08 and the plan 11 test case would each leave the suite red or the stored shape unsettled as written.
