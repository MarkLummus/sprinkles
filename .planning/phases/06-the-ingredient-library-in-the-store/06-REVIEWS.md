---
phase: 6
reviewers: [codex]
reviewed_at: 2026-10-14T12:03:12.000Z
plans_reviewed: [06-01-PLAN.md, 06-02-PLAN.md, 06-03-PLAN.md]
models:
  codex: "gpt-6.1-sol (reasoning=high)"
model_sources:
  codex: "banner"
---

# Cross-AI Plan Review — Phase 6

<!-- gsd:plan-revision-conflicts:begin -->
## Plan-Revision Conflicts
<!-- gsd:plan-revision-conflicts:end -->

## Codex Review

## 06-01

**Summary:** The upgrade design is sound and closely matches the existing database code. The genuine version-8 fixture, preserved reset boundary, and index assertions provide appropriate protection against losing existing records.

**Strengths**

- Preserving the `< 8` reset condition protects version-8 records; the existing guarded creates support adding another store without rebuilding the others. See [app/src/store/db.js:23](/Users/mark/Documents/projects/sprinkles/app/src/store/db.js:23).
- The proposed upgrade fixture exercises a real version change. The existing reopen test only opens the current database twice, so it cannot establish upgrade preservation. See [app/src/store/db.test.js:46](/Users/mark/Documents/projects/sprinkles/app/src/store/db.test.js:46) and [app/src/store/db.test.js:116](/Users/mark/Documents/projects/sprinkles/app/src/store/db.test.js:116).
- Moving the “newer database” test to version 10 is necessary: its current open at version 9 would cease triggering `versionchange` after this bump. See [app/src/store/db.test.js:248](/Users/mark/Documents/projects/sprinkles/app/src/store/db.test.js:248).

**Concerns**

- **LOW — The copied bulk-write pattern can partially commit after a synchronous cloning failure.** `putAllRecipes` queues puts inside `map()` without an abort handler. If a later `put()` throws synchronously, earlier requests can commit despite the method rejecting. The existing `importAll` explicitly handles this distinction. See [app/src/store/repository.js:80](/Users/mark/Documents/projects/sprinkles/app/src/store/repository.js:80) and [app/src/store/repository.js:86](/Users/mark/Documents/projects/sprinkles/app/src/store/repository.js:86). An isolated probe of the proposed `putAllLibrary` retained its first record after its second record failed cloning. Trusted bundled seed data makes immediate exposure limited.

**Suggestions**

- Give `putAllLibrary` the same explicit abort handling as `importAll`, or document its trusted, cloneable-input precondition and avoid implying that rejection guarantees no writes.

**Risk Assessment: LOW.** The upgrade itself is appropriately constrained and tested. The bulk-write failure behavior is a limited repository-contract weakness.

## 06-02

**Summary:** The independent seed guards and persistence-based LIB-02 proof cover the main phase goals well. However, the planned concurrency test proves duplicate-free insertion, while the stronger promise that a filled library is never overwritten remains unprotected.

**Strengths**

- Separating the library guard from the versions guard correctly handles upgraded profiles. The existing seed returns immediately when versions exist, and boot explicitly awaits seeding before rendering the app. See [app/src/store/seed.js:13](/Users/mark/Documents/projects/sprinkles/app/src/store/seed.js:13) and [app/src/main.jsx:27](/Users/mark/Documents/projects/sprinkles/app/src/main.jsx:27).
- The LIB-02 test checks the actual isolation mechanism: ingredient records are cloned into version rows, batch creation clones those rows again, and balance computation reads embedded coefficients. Fresh reads plus the “would change PAC” assertion make this a meaningful proof. See [app/src/data/olive-oil.js:54](/Users/mark/Documents/projects/sprinkles/app/src/data/olive-oil.js:54), [app/src/domain/batch.js:186](/Users/mark/Documents/projects/sprinkles/app/src/domain/batch.js:186), and [app/src/domain/composition.js:26](/Users/mark/Documents/projects/sprinkles/app/src/domain/composition.js:26).

**Concerns**

- **MEDIUM — The emptiness check and write have a race.** The plan explicitly performs `listLibrary()` followed by a separate `putAllLibrary()` transaction. See [06-02-PLAN.md:111](/Users/mark/Documents/projects/sprinkles/.planning/phases/06-the-ingredient-library-in-the-store/06-02-PLAN.md:111). A delayed tab can observe an empty library, pause, then overwrite entries another tab has seeded and subsequently imported. I reproduced this: an imported sucrose PAC of 200 reverted to the seed’s 100 when the delayed seed resumed. The proposed parallel-seed test checks only unique IDs and counts, which still pass after such an overwrite. See [06-02-PLAN.md:181](/Users/mark/Documents/projects/sprinkles/.planning/phases/06-the-ingredient-library-in-the-store/06-02-PLAN.md:181).
- **LOW — The interrupted-seed fake does not model upserts.** Its existing recipe and batch writers append, so retrying creates duplicates in the fake. The proposed recovery test checks write order and final version IDs without detecting that discrepancy. See [app/src/store/seed.test.js:22](/Users/mark/Documents/projects/sprinkles/app/src/store/seed.test.js:22) and [06-02-PLAN.md:176](/Users/mark/Documents/projects/sprinkles/.planning/phases/06-the-ingredient-library-in-the-store/06-02-PLAN.md:176).

**Suggestions**

- Perform the library emptiness check and conditional seed write within one repository-owned readwrite transaction. Retain the independent library/versions decisions.
- Add a deterministic interleaving test: pause one seed after its empty read, complete another seed and import, then resume the first.
- Make the fake upsert by ID, or verify interrupted recovery against fake-indexeddb and assert final contents of every affected store.

**Risk Assessment: MEDIUM.** Sequential boot and ordinary upgrades are covered well, but concurrent boot can overwrite imported library data.

## 06-03

**Summary:** The final transfer design should satisfy LIB-03: one transaction for export, one for import, drafts excluded, and library validation before writes. The main execution issue is introducing the new writable format before introducing its validator.

**Strengths**

- Extending the existing `importAll` transaction and keeping its abort handler preserves protection against synchronous cloning failures after earlier puts have queued. See [app/src/store/repository.js:91](/Users/mark/Documents/projects/sprinkles/app/src/store/repository.js:91).
- `exportAll` directly addresses the current three independent reads, which can observe different database states. Queuing all four reads in one readonly transaction implements the required consistency boundary. See [app/src/store/transfer.js:564](/Users/mark/Documents/projects/sprinkles/app/src/store/transfer.js:564).
- The existing unsafe-key scanner recursively visits the complete payload, so library entries inherit that protection without a separate scanner. See [app/src/store/transfer.js:55](/Users/mark/Documents/projects/sprinkles/app/src/store/transfer.js:55) and [app/src/store/transfer.js:521](/Users/mark/Documents/projects/sprinkles/app/src/store/transfer.js:521).
- The identified fixture changes match the source: BatchRow supplies its own transfer repository, while Shell asserts a fixed error count. See [app/src/ui/BatchRow.test.jsx:2116](/Users/mark/Documents/projects/sprinkles/app/src/ui/BatchRow.test.jsx:2116) and [app/src/ui/Shell.flyout.test.jsx:354](/Users/mark/Documents/projects/sprinkles/app/src/ui/Shell.flyout.test.jsx:354).

**Concerns**

- **MEDIUM — Task 1 opens a validation gap broader than the plan acknowledges.** It enables library imports while explicitly postponing validation. See [06-03-PLAN.md:128](/Users/mark/Documents/projects/sprinkles/.planning/phases/06-the-ingredient-library-in-the-store/06-03-PLAN.md:128). Missing `library` aborts, as described, but a cloneable malformed record such as `{ id: 'sucrose', entry: null }` passes the unchanged validator and commits successfully. I reproduced that intermediate behavior. The current write gate relies entirely on `validateStoreFile` rejecting malformed payloads. See [app/src/store/transfer.js:593](/Users/mark/Documents/projects/sprinkles/app/src/store/transfer.js:593).
- **LOW — The “older export message first” claim does not hold for the supplied Shell fixture.** The validator adds unsafe-key and app errors before the older-export message. The fixture omits `app`, so its first error is `$.app`, and changing its expected count to four does not change that ordering. See [app/src/store/transfer.js:521](/Users/mark/Documents/projects/sprinkles/app/src/store/transfer.js:521), [app/src/store/transfer.js:528](/Users/mark/Documents/projects/sprinkles/app/src/store/transfer.js:528), and [app/src/ui/Shell.flyout.test.jsx:311](/Users/mark/Documents/projects/sprinkles/app/src/ui/Shell.flyout.test.jsx:311).

**Suggestions**

- Land the library validator and required-array check in the same commit that enables library imports. Move the affected fixtures with that change.
- Either explicitly prioritize `OLDER_EXPORT_MESSAGE` and test the first rendered line, or narrow the plan’s wording to otherwise well-formed older exports.

**Risk Assessment: MEDIUM.** The completed design is coherent; task ordering temporarily permits invalid persisted records, and the error-order guarantee is overstated.

**Overall assessment: MEDIUM — revise before execution.** The plans cover all phase goals and keep scope controlled. Address the seed/import race and combine validation with the new import path.

Reviewed repository HEAD `c5bbc4f`. The existing targeted persistence and transfer suite passed **178/178 tests**. Additional probes ran in a temporary copy; repository files were unchanged.

---

## Consensus Summary

One reviewer ran (Codex), so there is no agreement across reviewers to weigh; this section lists what the single review asks to change, highest first.

### Agreed Strengths
- Single reviewer: the plans cover LIB-01 to LIB-03, keep scope controlled, and the genuine version-8 fixture, the preserved `< 8` reset boundary and the real-IndexedDB LIB-02 proof are sound.

### Agreed Concerns
- **MEDIUM, 06-02:** the library emptiness check (`listLibrary`) and the seed write (`putAllLibrary`) are two transactions, so a delayed second tab can overwrite library entries another tab seeded and an import changed (reproduced: an imported sucrose PAC of 200 reverted to 100). The planned parallel-seed test checks counts and unique ids only and would still pass. Suggestion: one repository-owned readwrite transaction for the check and the conditional write, plus a deterministic interleaving test.
- **MEDIUM, 06-03 Task 1:** the four-store import is enabled before the library validator lands, so a cloneable malformed record such as `{ id: 'sucrose', entry: null }` commits in the intermediate state. Suggestion: land the validator and the required-array check in the same commit as the import change.
- **LOW, 06-01:** the bulk write copied from `putAllRecipes` can partially commit after a synchronous cloning failure; `putAllLibrary` should abort explicitly like `importAll`, or state its trusted-input precondition.
- **LOW, 06-02:** the in-memory seed fake appends instead of upserting, so the interrupted-seed recovery test cannot see duplicates.
- **LOW, 06-03:** the claim that the older-export message comes first does not hold for the Shell fixture (its first error is `$.app`); prioritise `OLDER_EXPORT_MESSAGE` and test the first line, or narrow the wording to otherwise well-formed older exports.

### Divergent Views
- None (single reviewer).
