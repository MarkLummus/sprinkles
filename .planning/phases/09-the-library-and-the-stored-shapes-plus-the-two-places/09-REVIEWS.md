---
phase: 9
reviewers: [opencode]
reviewed_at: 2026-10-17T20:10:35Z
plans_reviewed: [09-01-PLAN.md, 09-02-PLAN.md, 09-03-PLAN.md, 09-04-PLAN.md, 09-05-PLAN.md, 09-06-PLAN.md, 09-07-PLAN.md, 09-08-PLAN.md, 09-09-PLAN.md, 09-10-PLAN.md, 09-11-PLAN.md, 09-12-PLAN.md, 09-13-PLAN.md, 09-14-PLAN.md, 09-15-PLAN.md]
models:
  opencode: "openrouter/deepseek/deepseek-v4.1-flash#high"
model_sources:
  opencode: "pinned"
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

## Consensus Summary

One reviewer ran (opencode, DeepSeek v4.1 Flash, over OpenRouter). It cites `file:line` evidence throughout, so it counts as a grounded review, but a single reviewer cannot show agreement. The orchestrator checked the three HIGH findings against the repo before recording them; all three are real.

### Agreed Strengths
Not applicable with one reviewer. Its strengths, for the record: the lactose math, the 18-collision count, the reset branch, the hook guard line and the call-site counts all check out against source.

### Agreed Concerns
Not applicable with one reviewer. Verified findings, highest priority first:

1. **HIGH, verified: plan 09-04 breaks `RecipePage.shell.test.js`.** The `useKeptDraft` marker pins `buildDraftRecord(` at 2 and `repository.deleteDraft(versionId)` at 3 (`RecipePage.shell.test.js:262-275`); those counts are exact today (`useKeptDraft.js:167,175` and `:49,122,191`). A `create` branch changes them. The file is not in 09-04's `files_modified` (only 09-12 and 09-13 name it).
2. **HIGH, verified: plan 09-06 breaks `RecipePage.shell.test.js`.** The `useVersionPen` marker pins `repository.saveVersion(` at 2 (`:233`); `useVersionPen.js:199` and `:239` are the two calls. Routing the child save through `createVersion` leaves 1. The file is not in 09-06's plan.
3. **HIGH, verified: plan 09-11 breaks `PrintLogPages.test.jsx`.** The "import no literal list" case asserts `src` contains `axesForVersion(version)` and `DEFECTS` (`PrintLogPages.test.jsx:172-173`). The plan changes the call to take a catalog and requires `DEFECTS` gone. The file is in the plan's `files_modified`, but no task describes rewriting this case.
4. **MEDIUM: plan 09-05 validator tightening.** Requiring `libraryId` reaches every hand-built store-file fixture (`creation-roundtrip`, `seed-roundtrip`, `sheet-code-import`, `library` tests), not just `transfer.test.js`. State the sweep.
5. **MEDIUM: plan 09-15 allow-list and null `libraryId`.** The two strawberry rows carry `libraryId: null`; the allow-list must accept null and the doctored-file test should include one.
6. **MEDIUM: plan 09-01.** The review list should contrast the new whole-milk row with the existing `wholeMilk33` and `wholeMilk37`; the walk verify says "usage lines" change but `08-walk.mjs:904` (after the cut point) must stay, so the plan should name header lines 4-9 only; the coconut-milk name guard will not fire.
7. **MEDIUM: plan 09-07.** Generate the seven conflict notes from the converter's output instead of asserting numbers by hand.
8. **MEDIUM: plan 09-09.** The reset checkpoint is `auto_select="proceed"`, so the record must not describe it as a human confirmation. The reviewer's suggested static ratchet (every `deleteObjectStore` between the `oldVersion < 10` line and the first guarded create) is sturdier than a text scan for `clear(`.
9. **MEDIUM: plan 09-13.** Run the full suite after the data-file sweep, before touching the UI, because a forgotten `catalog` throws at import time.
10. **LOW and MEDIUM, plans 09-10 and 09-14:** list the exact fixtures (a store-file fixture builder would help), and exempt the data-scan by an explicit path allow-list rather than a substring `/data/`.

### Divergent Views
None (one reviewer). Mark's List items were not verifiable by the reviewer; the plan checker already reviewed them.
