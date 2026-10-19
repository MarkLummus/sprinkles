---
phase: 09-the-library-and-the-stored-shapes-plus-the-two-places
verified: 2026-10-19T03:30:00Z
status: human_needed
score: 8/8 must-haves verified
covered_files:
  - ".planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-01-PLAN.md"
  - ".planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-01-SUMMARY.md"
  - ".planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-02-PLAN.md"
  - ".planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-02-SUMMARY.md"
  - ".planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-03-PLAN.md"
  - ".planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-03-SUMMARY.md"
  - ".planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-04-PLAN.md"
  - ".planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-04-SUMMARY.md"
  - ".planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-05-PLAN.md"
  - ".planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-05-SUMMARY.md"
  - ".planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-06-PLAN.md"
  - ".planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-06-SUMMARY.md"
  - ".planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-07-PLAN.md"
  - ".planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-07-SUMMARY.md"
  - ".planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-08-PLAN.md"
  - ".planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-08-SUMMARY.md"
  - ".planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-09-PLAN.md"
  - ".planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-09-SUMMARY.md"
  - ".planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-10-PLAN.md"
  - ".planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-10-SUMMARY.md"
  - ".planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-11-PLAN.md"
  - ".planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-11-SUMMARY.md"
  - ".planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-12-PLAN.md"
  - ".planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-12-SUMMARY.md"
  - ".planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-13-PLAN.md"
  - ".planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-13-SUMMARY.md"
  - ".planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-14-PLAN.md"
  - ".planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-14-SUMMARY.md"
  - ".planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-15-PLAN.md"
  - ".planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-15-SUMMARY.md"
  - ".planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-16-PLAN.md"
  - ".planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-16-SUMMARY.md"
  - ".planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-17-PLAN.md"
  - ".planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-17-SUMMARY.md"
  - "app/src/data/library-decisions.js"
  - "app/src/data/library-seed-db.js"
  - "app/src/data/library.js"
  - "app/src/data/seed-catalog.js"
  - "app/src/data/seed-sheet-codes.js"
  - "app/src/domain/batch.js"
  - "app/src/domain/catalog.js"
  - "app/src/domain/draft.js"
  - "app/src/domain/lineage.js"
  - "app/src/domain/newRecipe.js"
  - "app/src/domain/sheetCode.js"
  - "app/src/domain/versionRow.js"
  - "app/src/main.jsx"
  - "app/src/router.jsx"
  - "app/src/store/catalog.js"
  - "app/src/store/db.js"
  - "app/src/store/repository.js"
  - "app/src/store/seed.js"
  - "app/src/store/seedTables.js"
  - "app/src/store/transfer.js"
  - "app/src/ui/IngredientsPlace.jsx"
  - "app/src/ui/NotebookPlace.jsx"
  - "app/src/ui/Shell.jsx"
  - "app/src/ui/useKeptDraft.js"
covered_digest: "v3:sha256:1e91bdb4064d0cc2dfb1e5d4195ec5a6e97ced01f721ee9f44345c9f23850420"
behavior_unverified: 0
overrides_applied: 0
human_verification:
  - test: "Mark's List row check-p9-places-and-reset-on-ipad: build and preview the app, open it on the iPad (a profile that held version 9 data), walk Notebook and Ingredients, and confirm the reset"
    expected: "The profile opens at database version 10 with 111 ingredients; Notebook lists the 8 recipes; Ingredients searches by name and category and opens an entry with figures, basis and source; neither place offers New recipe or any edit"
    why_human: "The WebKit run (17 PASS) and the 54 places measurements stand in for the device, but the iPad (coarse pointer, 1366, Mark's own stored profile) is the engine that matters to him and cannot be driven from here"
  - test: "Mark's List row decide-p9-lactose-line-non-dairy: decide whether the Ingredients place's lactose helper line shows on milk-solids entries that are not flagged dairy"
    expected: "Mark picks an option; today the line shows only where the entry has dairy === true (IngredientsPlace.jsx:303)"
    why_human: "A wording and scope decision about what the maker sees; no code can settle it"
  - test: "Mark's List row look-p9-new-lines: look at the new lines Phase 9 added to screens (counts, empty and none-found notes, Clear filters, the lactose helper)"
    expected: "Mark approves the words or asks for a change"
    why_human: "Plain-words copy is Mark's to approve (Impeccable and the decision register own it)"
---

# Phase 9: The library and the stored shapes, plus the two places - Verification Report

**Phase Goal:** While a reset is still free, every shape creation will store is settled: the reviewed ingredient library, with provenance, reaches every profile, and a recipe's own scale definitions, each carrying its kind, travel into the batches made from it. Beside them the two places open: the Ingredients place shows that library, read-only, and the Notebook place lists the recipes.
**Verified:** 2026-10-19
**Status:** human_needed
**Re-verification:** No - initial verification

## Goal Achievement

All eight ROADMAP success criteria hold in the code at HEAD 6346b17b. I did not take the SUMMARYs on trust: I read the stores, the seed, the places and the upgrade, ran the phase's own checks, and recomputed the seeded Sheet codes against the base commit. The remaining items are device and wording checks that Mark already has on his list, so the status is `human_needed`, not `passed`.

### Observable Truths

| # | Truth (ROADMAP SC) | Status | Evidence |
|---|--------------------|--------|----------|
| 1 | The library holds the dataset's entries beyond the 26, each with source and basis; the 26 keep their values; each of the seven conflicts is a recorded decision, a test fails on an unrecorded same-ingredient conflict; dairy lactose counts once | VERIFIED | `library-seed-db.js` holds 85 new entries, no key clash with the 26, 111 in all (the WebKit run reads 111). Every composition figure of every new entry has a basis and a source string (counted: 0 missing). The 26 compared with `710a528:library.js` field by field: 0 differences beyond the six D-20 coefficient keys. `library-decisions.js` holds one record per same pair (18) plus coconut as a different product; `library-seed-db.test.js` `gateProblems` fails on a missing record, an omitted or extra differing field, a changed quoted figure, and a stray id (tests exist and pass). Lactose: 23 milk-solids entries all satisfy `titratableAcidity = msnf x 0.017` or are cultured/null as the test pins; a test computes 100 g of every milk-solids candidate through `computeBalance` and holds PAC, POD and solids to the dataset within bounds. |
| 2 | A version-9 profile opens at version 10 with the larger library: cleared and reseeded, store reset to the new shapes, seeded recipes rewritten, proven from a stored v9 profile in real IndexedDB; the `create` draft kind persists instead of being deleted; a test fails if any later upgrade deletes a store at version 10 or above | VERIFIED | `db.js`: `DB_VERSION = 10`; the one destructive block is `if (oldVersion > 0 && oldVersion < 10)`. I ran `09-upgrade-check.sh` (builds base `710a528` and HEAD, drives Playwright WebKit): 17 PASS, 0 FAIL, including "library holds the larger seed's count (111)", "import-written library record is gone after the reset", four tables seeded 1/4/6/4, olive oil v1 stores `64JH-G408`, and "reopen left every store count unchanged (no second reset)". `useKeptDraft.js` lines 145-186: a `create` draft is checked with `draftMatchesCreate`, restored through `onRestoreCreate`, and persisted as kind `create` (lines 199-207); it is not deleted on restore. `db.test.js` carries the behavioural ratchet (version-10 profile with a record in every store survives `DB_VERSION + 1`) and the comment-stripped static ratchet on `RESET_ANCHOR`. |
| 3 | A row keeps the id of the library entry it came from through save, export and import; changing the entry afterwards moves no stored figure | VERIFIED | `validateRow` in `transfer.js:150` require `libraryId` as null or a non-empty safe string; `rowFromLibraryRecord` sets it. `library-link.test.js` does the proof in fake-indexeddb: saved row keeps `oliveOil`, survives `exportStore` then `importStore` into a fresh profile, and after `putAllLibrary` changes the entry, `computeBalance` and `buildFigures` of the stored version are equal to before (and the test shows a link-reading row would have moved). Seed: 211 rows, 208 carry a `libraryId` equal to a library entry with the row's `ingredient` deep-equal to it; the 3 without are strawberry's own rows, which carry `libraryId: null` by design (`strawberry.js:17`). |
| 4 | A scale is stored as a definition carrying its kind; olive oil's Body and Oil are definitions in the seeded versions, its 2 Aug batch reads as before; a batch keeps its version's definitions through export, import and reopen | VERIFIED | `isScaleDefinition` (`axes.js:53`) requires `kind` in `SCALE_KINDS` and a known group. Olive oil v1 `declaredAxes` = Body and Oil, each `{ key, name, low, high, kind: 'goldilocks', group: 'declared' }`. `createBatch` (`batch.js:177-203`) snapshots `declaredAxes`, `declaredFlaws`, and from the catalog the four `coreScales` definitions and `coreProblems`. All 12 seeded batches carry 4 core definitions, a problems list and definition-shaped declared axes. `definition-roundtrip.test.js` proves a minted magnitude scale, a renamed Oil, every mark on its key, and the export/import into a fresh profile. The 94-snapshot WebKit walk (olive oil batch included) compares `MATCH 94 snapshots` (below). |
| 5 | The Ingredients place lists the library, read-only, with search by name and category; the Notebook place lists the recipes; neither starts a recipe or changes an entry | VERIFIED | `IngredientsPlace.jsx` calls only `repository.listLibrary()`; filter by Name (text) and Category (select) through `filterLibrary`; opens an entry to figures with basis and source. `NotebookPlace.jsx` lists `activeWork` recipes, no New recipe, no Resume. Both routed in `router.jsx:125,128` and linked from the Shell rail. `09-places-check.mjs --library current` against a scratch build of HEAD: 54 PASS, 0 FAIL. Component tests spy every write method (T-09-07). See Warnings for WR-02. |
| 6 | Machines, styles with bands, core scales and problems are rows in store tables the app reads, no seed dataset read from a code constant at run time, and the 9-to-10 upgrade creates and seeds them | VERIFIED | `upgradeStores` creates `machines`, `styles`, `scales`, `problems`; `seed.js` fills each through `seedTableIfEmpty` in one transaction. My own grep: the only non-test module outside `app/src/data/` importing from `data/` is `store/seed.js`. `seed-data-scan.test.js` pins that with an allow-list. `main.jsx` reads the tables, validates them (`firstDamagedTable`) and mounts `CatalogProvider`; `RecipePage`, `RecipeList`, `PrintSheet` and `Shell` read through `useCatalog`. The retired `AXES` and `DEFECTS` constants are gone from `app/src` outside comments. WebKit run: tables seeded 1, 4, 6, 4. |
| 7 | A version stores its Sheet code at creation (first version and every Next version), unique; no edit changes it; seeded versions keep today's codes | VERIFIED | `lineage.js:159` and `newRecipe.js:84` assign `codeFromVersionId(id)` once. `repository.js` runs `sheetCodeProblems` inside the readwrite transaction in both `createVersion` and `saveVersion`: a changed code for the same id and a clash are refused (repository tests lines 374-445, both-tabs race included). Print (`PrintSheet.jsx:128`, `PrintSheetPages.jsx:83`) and search (`findVersionsByCode`) read the stored field. Seeded codes: I computed the legacy `sheetCode()` over the seeds of the base commit `710a528` (via `git archive`) and over HEAD; both give 19 codes, all equal to `SEED_SHEET_CODES`, golden `64JH-G408` present, 19 distinct. `lineage.test.js:420` shows a correction keeps the code whatever it edits. |
| 8 | The four tables travel in the store file with the library: validator checks them, store file version changes, an export imports into a fresh profile and restores them | VERIFIED | `STORE_SCHEMA_VERSION = 9` (was 8); `FILE_TABLES` and `exportStore` carry library, machines, styles, scales and problems; `validateStoreFile` runs `SEED_TABLES` validators and `catalogConflicts`. `seed-tables-transfer.test.js` ("an export from a seeded profile imported into a fresh, never-seeded profile restores all four tables", schema-8 file refused, five-core file refused, race cases) passes. |

**Score:** 8/8 truths verified (0 present-but-behavior-unverified). The state-transition truths (2, 4, 7) each have a passing behavioural test, and truth 2 has a real-IndexedDB WebKit run as well.

### Coincidental-reliance advisory

None recorded. The upgrade proof builds the old profile from the base commit's own build instead of a hand-built fixture, so its precondition is declared, not incidental.

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `app/src/data/library-seed-db.js` (2314 lines) | 85 reviewed entries with provenance | VERIFIED | Generated; imported by `store/seed.js` |
| `app/src/data/library-decisions.js` | One decision per same pair | VERIFIED | Gate in `library-seed-db.test.js` |
| `app/src/data/{machines,styles,core-scales,core-problems,seed-catalog}.js` | Seed rows for the four tables | VERIFIED | Whynter 700 g, max null; 4 styles; 6 scales; 4 problems |
| `app/src/data/seed-sheet-codes.js` | 19 stored codes | VERIFIED | Equals base-commit derivation |
| `app/src/store/{db,seed,seedTables,catalog,repository,transfer}.js` | v10 upgrade, tables, file schema 9 | VERIFIED | Read in full or in the load-bearing parts |
| `app/src/domain/{batch,draft,catalog,axes,sheetCode,lineage,newRecipe,versionRow}.js` | Snapshot, create draft, code, definitions | VERIFIED | |
| `app/src/ui/{IngredientsPlace,NotebookPlace,CatalogContext}.jsx`, `router.jsx`, `main.jsx` | Places and boot | VERIFIED | Wired, data flows from `listLibrary()` and the recipe reads |
| `.planning/phases/09-*/09-{walk,places-check,upgrade-check,dist-guard}` | Phase evidence | VERIFIED | Rerun below |

### Key Link Verification

| From | To | Via | Status |
|------|----|-----|--------|
| `main.jsx` | tables | `seedIfEmpty` then `readSeedTables` then `firstDamagedTable` then `CatalogProvider` | WIRED |
| `store/seed.js` | `data/*` | the only importer of seed data | WIRED |
| `Shell.jsx` import | catalog | `reloadCatalog` awaited before `storeRevision` bump (T-09-26) | WIRED |
| `RecipePage` record pen | `createBatch` | `catalog` from `useCatalog` | WIRED |
| `useKeptDraft` | `drafts` store | `create` kind restore and persist | WIRED |
| `router.jsx` | places | `/notebook`, `/ingredients` | WIRED |

### Data-Flow Trace (Level 4)

| Artifact | Variable | Source | Real data | Status |
|----------|----------|--------|-----------|--------|
| `IngredientsPlace` | `records` | `repository.listLibrary()` over IndexedDB | 111 rows in WebKit | FLOWING |
| `NotebookPlace` | `data` | `getAll`, `getAllBatches`, `listRecipes` | 8 rows in WebKit | FLOWING |
| Record pen scales and problems | `catalog` | `loadCatalog` over four tables | 6 scales, 4 problems | FLOWING |

### Behavioral Spot-Checks and Probe Execution

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Full suite | `npm --prefix app test` | 113 files, 3467 tests pass | PASS |
| No build reached `app/dist` | `sh 09-dist-guard.sh check` | `DIST UNCHANGED` | PASS |
| Walk shows the maker no change | `sh 09-walk-check.sh` (scratch build) | `ALLOWED 55312 store differences, each checked`, `REQUIRED 55312 additions present`, `MATCH 94 snapshots` | PASS |
| Places at the larger library | `node 09-places-check.mjs --library current` | 54 PASS, 0 FAIL | PASS |
| 9 to 10 reset in WebKit | `sh 09-upgrade-check.sh` | 17 PASS, 0 FAIL | PASS |
| 26 existing entries unchanged | node diff of `710a528:library.js` against HEAD | 0 differences beyond the six D-20 keys | PASS |
| Seeded codes equal the base commit's | node: legacy `sheetCode()` over base seeds | 19 of 19 equal | PASS |

### Requirements Coverage

Every ID in the plans' `requirements:` fields is in REQUIREMENTS.md, and every REQUIREMENTS.md ID mapped to Phase 9 is claimed by a plan. No orphans.

| Requirement | Source plans | Status | Evidence |
|-------------|--------------|--------|----------|
| LIB-04 | 09-01, 09-07 | SATISFIED | 85 new entries, provenance on every figure |
| LIB-05 | 09-01, 09-07 | SATISFIED | Truth 1; decisions file and gate |
| LIB-06 | 09-04, 09-05, 09-08, 09-09, 09-16, 09-17 | SATISFIED | Truth 2, WebKit 17/17 |
| LIB-07 | 09-01, 09-07 | SATISFIED | Truth 1, lactose test |
| LIB-08 | 09-05 | SATISFIED | Truth 3 |
| LIB-09 | 09-09, 09-10, 09-11, 09-12, 09-15 | SATISFIED | Truths 6 and 8 |
| CODE-01 | 09-02, 09-06, 09-10 | SATISFIED | Truth 7 |
| TASTE-03 | 09-04, 09-08, 09-11, 09-13, 09-14, 09-15 | SATISFIED | Truth 4 |
| PLACE-01 | 09-03, 09-16, 09-17 | SATISFIED | Truth 5 |
| PLACE-02 | 09-03, 09-16, 09-17 | SATISFIED | Truth 5 |

`REQUIREMENTS.md` still shows all ten as `[ ]` and `Pending` in its checklist and traceability table; that bookkeeping is for the orchestrator, not a code gap.

### Anti-Patterns Found

Scanned the 62 non-test files changed since `710a528` for `TBD`, `FIXME`, `XXX` (none; the `XXXX-XXXX` code-format strings are not markers), `TODO`, `HACK`, stub returns and `dangerouslySetInnerHTML` (none). The remaining "placeholder" hits are pre-existing seed comments and the other places' `Placeholder` routes (Recipe book, Idea log, Kitchen), out of this phase's scope. `app/package.json`, the lockfile and `app/dist` are unchanged.

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `app/src/ui/Shell.jsx` | 360 | `importStore` awaited with no try/catch; `scanForUnsafeKeys` (`transfer.js:81`) recurses without a bound (review WR-01) | Warning | A pathologically nested file throws and the Import panel shows nothing. No data loss; no must-have names it |
| `app/src/ui/IngredientsPlace.jsx` | 158-222 | Category filter state not reset when an import removes the selected category (WR-02) | Warning | Select reads "All" while the list stays filtered, until Clear filters. Edge case after an import only |
| generator and `seed-sheet-codes.js` and others | various | IN-01 to IN-05 | Info | Stale header comment, `,});`, a constant imported from a large module, composition fractions checked only for finiteness (tighten with Phase 10's picker), dead ternary and a dangling `aria-controls` |

All seven review findings are recorded `open` in `09-REVIEW-DISPOSITION.md`. None contradicts a success criterion, so none is a BLOCKER; they await triage.

### Human Verification Required

These three are already rows on Mark's List. I found no further items.

1. **iPad walk of the places and the reset** (`check-p9-places-and-reset-on-ipad`). Test: serve `npm --prefix app run build && npm --prefix app run preview -- --host`, open on the iPad that holds version-9 data. Expected: opens at version 10 with 111 ingredients, 8 recipes in the Notebook, search and open work, nothing offers to add or edit. Why human: his iPad is the engine that matters.
2. **Lactose line on non-dairy milk-solids entries** (`decide-p9-lactose-line-non-dairy`). Why human: a wording and scope decision.
3. **New on-screen lines** (`look-p9-new-lines`). Why human: plain-words copy needs his approval.

### Gaps Summary

No gaps. Every success criterion is backed by code I read and by a check I ran, and the phase's three non-test checks (dist guard, walk, WebKit upgrade) reproduce. What remains is Mark's own device check and two wording rows, plus triage of the two open review warnings (WR-01, WR-02), which are cheap, in-scope-for-a-quick-task fixes but do not block the goal.

---

_Verified: 2026-10-19_
_Verifier: Claude (gsd-verifier)_
