---
phase: 09-the-library-and-the-stored-shapes-plus-the-two-places
verified: 2026-10-19T22:50:00Z
status: passed
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
  - "app/src/data/seed-recipes.js"
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
  - "app/src/styles/shell.css"
  - "app/src/ui/CatalogContext.jsx"
  - "app/src/ui/IngredientsPlace.jsx"
  - "app/src/ui/NotebookPlace.jsx"
  - "app/src/ui/RecipeList.jsx"
  - "app/src/ui/Shell.jsx"
  - "app/src/ui/useKeptDraft.js"
covered_digest: "v3:sha256:8f76543e4c02809f7da8d6d706cc253ceecc7575df758644d740c221af65e6ec"
behavior_unverified: 0
overrides_applied: 0
re_verification:
  previous_status: human_needed
  previous_score: 8/8
  gaps_closed: []
  gaps_remaining: []
  regressions: []
---

# Phase 9: The library and the stored shapes, plus the two places - Verification Report

**Phase Goal:** While a reset is still free, every shape creation will store is settled: the reviewed ingredient library, with provenance, reaches every profile, and a recipe's own scale definitions, each carrying its kind, travel into the batches made from it. Beside them the two places open: the Ingredients place shows that library, read-only, and the Notebook place lists the recipes.
**Verified:** 2026-10-19
**Status:** passed
**Re-verification:** Yes. The earlier report (status `human_needed`, 8/8) predates quick batch 261019-arp. It changed `app/src/store/seedTables.js`, `app/src/ui/IngredientsPlace.jsx` and `app/src/styles/shell.css` (commits 385c7bb6, 55891a98, 64169285), and quick 261018-x4s changed `app/src/ui/RecipeList.jsx`. This report re-reads the changed files, re-runs the phase's own checks at HEAD 4ef2f355, and recomputes the seeded-data claims from the modules.

## Why `human_needed` becomes `passed`

The earlier report held at `human_needed` for exactly three items: the iPad walk, the lactose-line decision and the new on-screen lines. `09-UAT.md` (status complete, 3 of 3 passed, 0 issues) closes all three:

1. The iPad walk of both places and the reset store: Mark passed `check-p9-places-and-reset-on-ipad` on 2026-10-19. The one defect he named (basis and source running together at 393) was already `decide-p9-393-source-own-line`, and it is built (385c7bb6).
2. The lactose line: Mark chose `any-milk-solids`, and 55891a98 builds it.
3. The new lines and the recovery page: Mark approved both as rendered.

No other item needs a human. Nothing here is behavior-unverified (see the truths table).

## Goal Achievement

### Observable Truths

| # | Truth (ROADMAP SC) | Status | Evidence |
|---|--------------------|--------|----------|
| 1 | The library holds the dataset's entries beyond the 26, each with source and basis; the 26 keep their values; each of the seven conflicts is a recorded decision and a test fails on an unrecorded same-ingredient conflict; dairy lactose counts once | VERIFIED | Counted by import: `library.js` has 26 entries and `library-seed-db.js` 85, so 111 in all. `library-decisions.js` and the `gateProblems` gate in `library-seed-db.test.js` (lines 69-183) fail on a missing record, an omitted or extra differing field and a stray id. The gate tests pass in the full run. The earlier field-by-field diff of the 26 against `710a528:library.js` (0 differences beyond the six D-20 keys) is unaffected: neither `library.js` nor `library-seed-db.js` changed after it. The lactose tests pass. |
| 2 | A version-9 profile opens at version 10 with the larger library: cleared, reseeded, store reset, seeded recipes rewritten, proven from a stored v9 profile in real IndexedDB; the `create` draft kind persists; a test fails if a later upgrade deletes a store at version 10 or above | VERIFIED | `db.js:8` `DB_VERSION = 10`; the one destructive block is `if (oldVersion > 0 && oldVersion < 10)` (`db.js:36`). I re-ran `09-upgrade-check.sh` (builds base `710a528` and HEAD, drives Playwright WebKit): 17 PASS, 0 FAIL. It covers: v9 profile stored with 26 entries, import-written record gone after the reset, 111 entries, tables seeded 1/4/6/4, olive oil v1 stores `64JH-G408`, `/notebook` 8 rows, `/ingredients` 111 rows, reopen leaves every store count unchanged (no second reset), and a draft written after the upgrade survives the reopen. The `db.test.js` ratchets and the `create` draft tests pass in the full run. |
| 3 | A row keeps the id of the library entry it came from through save, export and import; changing the entry afterwards moves no stored figure | VERIFIED | `transfer.js:150-152` requires `libraryId` as an own key, null or a non-empty non-reserved string. I recomputed over the seed modules: 211 rows, 208 carry a `libraryId` that resolves to a library entry, 3 are `null` by design, 0 dangling. `library-link.test.js` (save, export/import, then a library change moving no figure) passes. |
| 4 | A scale is stored as a definition carrying its kind; olive oil's Body and Oil are definitions in the seeded versions and its 2 Aug batch reads as before; a batch keeps its version's definitions through export, import and reopen | VERIFIED | Olive oil v1 `declaredAxes` read from the seed module: `body` and `oil`, each `{ key, name, low, high, kind: 'goldilocks', group: 'declared' }`. All 12 seeded batches carry 4 core scale definitions and a problems list. `isScaleDefinition` now lives in `domain/catalog.js:46` (the earlier report cited `axes.js`; the check is the same: kind in `SCALE_KINDS`, group in `SCALE_GROUPS`). `definition-roundtrip.test.js` passes. The places check reads the olive oil 2 Aug batch as "Sweetness 4, Oil 4". |
| 5 | The Ingredients place lists the library, read-only, with search by name and category; the Notebook place lists the recipes; neither starts a recipe or changes an entry | VERIFIED | `IngredientsPlace.jsx` reaches the store only through `repository.listLibrary()` (line 121); `NotebookPlace.jsx` through `getAll`, `getAllBatches` and `listRecipes`. Both are routed (`router.jsx:125,128`). I re-ran `09-places-check.mjs --library current` against a scratch build of HEAD (including the 385c7bb6, 55891a98 and 64169285 changes): 54 PASS, 0 FAIL, including `/notebook` listing Home's eight recipes in Home's order, `milk` plus Dairy narrowing to 15 of 111, an open entry showing Basis and Source, and no overflow at 393 to 1590. Component tests spy every write method. UAT test 1 passed on the iPad. |
| 6 | Machines, styles with bands, core scales and problems are rows in store tables the app reads; no seed dataset is read from a code constant at run time; the 9-to-10 upgrade creates and seeds them | VERIFIED | The WebKit upgrade run reports the four tables seeded 1, 4, 6, 4. `seed.js` is the module that imports `data/*` seeds; `seed-data-scan.test.js` pins that and passes. `main.jsx` reads the tables and mounts `CatalogProvider`. `SEED_TABLES` in `seedTables.js` now words the problems table "tasting problems" (82730c29), a copy change only. |
| 7 | A version stores its Sheet code at creation (first version and every Next version), unique; no edit changes it; seeded versions keep today's codes | VERIFIED | `lineage.js:159` and `newRecipe.js:84` assign `codeFromVersionId(id)` once. Over the seed modules: 19 versions, 19 codes, 19 distinct; golden `64JH-G408` is olive oil v1, and the WebKit run confirms it after the reset. The earlier recomputation of the legacy derivation over the base commit (19 of 19 equal) is unaffected: `seed-sheet-codes.js` and the lineage/sheet code modules did not change. Repository-level enforcement tests (changed code, clash, two-tab race) pass. |
| 8 | The four tables travel in the store file with the library: validator checks them, store file version changes, an export imports into a fresh profile and restores them | VERIFIED | `transfer.js:63` `STORE_SCHEMA_VERSION = 9` (was 8). `validateStoreFile` runs `SEED_TABLES` validators. `seed-tables-transfer.test.js` (fresh-profile restore, schema-8 refusal, five-core refusal) passes. The 85-entry file shape is validated by the same tests that ran green at HEAD. |

**Score:** 8/8 truths verified. 0 present-but-behavior-unverified: the state-transition truths (2, 4, 7) each have a passing behavioral test, and truth 2 also has the real-IndexedDB WebKit run above.

### Coincidental-reliance advisory

None. The upgrade proof builds the old profile from the base commit's own build rather than a hand-built fixture, so its precondition is declared, not incidental.

### Changes since the earlier report (what was re-read)

| Change | Commit | Check |
|--------|--------|-------|
| Facts line value-first (`Density x g/ml`, capitalised heat-treatment and packed-state values, `Hydrates at x °C`); `hydrationSource` dropped | 64169285 | Read `factsText` in `IngredientsPlace.jsx`; component tests updated and pass; no truth names the wording |
| Source on its own line below 760 (`grid-template-areas` `'fig amt' 'basis basis' 'src src'`, left-aligned) | 385c7bb6 | Read the `shell.css` diff; the 393 places check passes (no overflow, closed-row heights within the board's range) |
| Lactose line on any entry with `composition.msnf` finite, or `dairy === true` | 55891a98 | Read the condition at `IngredientsPlace.jsx:302`. Of 111 entries, 23 carry `msnf` and 1 of them is not flagged dairy, so the line now shows on that one. Every entry has a `composition`, so the property read cannot throw on the seed. Tests pass |
| Table word "tasting problems" | 82730c29 | `seedTables.js` diff; test updated |
| Home's "Record a tasting" links to the awaiting batch under its own version and asks the batch page to open the tasting pen | fe240415 | Out of Phase 9's scope (Phase 03.4 surface). `startTasting` is consumed in `useRouteIntents.js:26-55`, which is wired and tested; no Phase 9 truth depends on it |

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `app/src/data/library-seed-db.js` | 85 reviewed entries with provenance | VERIFIED | Imported by `store/seed.js` |
| `app/src/data/library-decisions.js` | One decision per same pair | VERIFIED | Gate in `library-seed-db.test.js` |
| `app/src/data/{machines,styles,core-scales,core-problems,seed-catalog}.js` | Seed rows for the four tables | VERIFIED | Seeded 1/4/6/4 in WebKit |
| `app/src/data/seed-sheet-codes.js` | 19 stored codes | VERIFIED | 19 distinct on the seeded versions |
| `app/src/store/{db,seed,seedTables,catalog,repository,transfer}.js` | v10 upgrade, tables, file schema 9 | VERIFIED | |
| `app/src/domain/{batch,draft,catalog,sheetCode,lineage,newRecipe,versionRow}.js` | Snapshot, create draft, code, definitions | VERIFIED | |
| `app/src/ui/{IngredientsPlace,NotebookPlace,CatalogContext}.jsx`, `router.jsx`, `main.jsx` | Places and boot | VERIFIED | Wired; data flows from the store |
| `.planning/phases/09-*/09-{places-check,upgrade-check,dist-guard,walk}*` | Phase evidence | VERIFIED | Re-run below |

### Key Link Verification

| From | To | Via | Status |
|------|----|-----|--------|
| `main.jsx` | tables | `seedIfEmpty`, `readSeedTables`, validation, `CatalogProvider` | WIRED |
| `store/seed.js` | `data/*` | the one importer of seed data (`seed-data-scan.test.js`) | WIRED |
| `RecipePage` record pen | `createBatch` | `catalog` from `useCatalog` | WIRED |
| `useKeptDraft` | `drafts` store | `create` kind restore and persist | WIRED |
| `router.jsx` | places | `/notebook`, `/ingredients` | WIRED |
| `RecipeList` "Record a tasting" | batch page tasting pen | `state.startTasting` read by `useRouteIntents` | WIRED |

### Data-Flow Trace (Level 4)

| Artifact | Variable | Source | Real data | Status |
|----------|----------|--------|-----------|--------|
| `IngredientsPlace` | `records` | `repository.listLibrary()` over IndexedDB | 111 rows in WebKit | FLOWING |
| `NotebookPlace` | `data` | `getAll`, `getAllBatches`, `listRecipes` | 8 rows in WebKit | FLOWING |
| Record pen scales and problems | `catalog` | `loadCatalog` over four tables | 6 scales, 4 problems | FLOWING |

### Behavioral Spot-Checks and Probe Execution

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Full suite (run once) | `npm --prefix app test` | 113 files, 3475 tests pass | PASS |
| Places at the larger library, WebKit, coarse pointer | `node 09-places-check.mjs --library current` on a scratch build of HEAD | 54 PASS, 0 FAIL | PASS |
| 9 to 10 reset in WebKit with reopen | `sh 09-upgrade-check.sh` (scratch builds, base worktree removed after) | 17 PASS, 0 FAIL | PASS |
| Seed data counts and links | node over `library.js`, `library-seed-db.js`, `seed-recipes.js` | 26 + 85 = 111; 8 recipes, 19 versions with 19 distinct codes, 12 batches each with 4 core scales and a problems list; 208 of 211 rows linked, 3 null, 0 dangling; olive oil `declaredAxes` are definitions with kind | PASS |
| Dist guard | `sh 09-dist-guard.sh check` | `FAIL DIST CHANGED since plan 09-09` (see below; expected, not a gap) | INFO |

**Dist guard note.** The guard exists so no automated build reaches `app/dist` before the end of the phase. It now reports a change because `app/dist` was rebuilt on 2026-10-19 07:53 (the fingerprint was taken 2026-10-19 01:30), after the automated plans. That is Mark's own device build: the roadmap and plan 09-17 assign the device build to Mark, and UAT test 1 records that he walked the iPad on it. `app/dist` is git-ignored and `git status` shows no change under `app/`. My own builds went to a scratch directory. The guard's purpose (no intermediate build served to a device before the phase finished) was met.

### Requirements Coverage

Every ID in the 17 plans' `requirements:` fields appears in REQUIREMENTS.md, and every REQUIREMENTS.md ID mapped to Phase 9 (ten) is claimed by at least one plan. No orphans.

| Requirement | Source plans | Status | Evidence |
|-------------|--------------|--------|----------|
| LIB-04 | 09-01, 09-07 | SATISFIED | Truth 1: 85 new entries with provenance |
| LIB-05 | 09-01, 09-07 | SATISFIED | Truth 1: decisions file and gate |
| LIB-06 | 09-04, 09-05, 09-08, 09-09, 09-16, 09-17 | SATISFIED | Truth 2: WebKit 17/17 |
| LIB-07 | 09-01, 09-07 | SATISFIED | Truth 1: lactose counted once |
| LIB-08 | 09-05 | SATISFIED | Truth 3 |
| LIB-09 | 09-09, 09-10, 09-11, 09-12, 09-15 | SATISFIED | Truths 6 and 8 |
| CODE-01 | 09-02, 09-06, 09-10 | SATISFIED | Truth 7 |
| TASTE-03 | 09-04, 09-08, 09-11, 09-13, 09-14, 09-15 | SATISFIED | Truth 4 |
| PLACE-01 | 09-03, 09-16, 09-17 | SATISFIED | Truth 5 |
| PLACE-02 | 09-03, 09-16, 09-17 | SATISFIED | Truth 5 |

`REQUIREMENTS.md` still shows all ten as unchecked and `Pending` in its checklist and traceability table (lines 19-28 and 103-127). That is bookkeeping for the orchestrator to update on phase completion, not a code gap.

### Anti-Patterns Found

Scanned the files changed since the earlier report, and re-grepped `app/src` for `TBD`, `FIXME`, `XXX` and `dangerouslySetInnerHTML`. No debt markers in any Phase 9 file. The only `dangerouslySetInnerHTML` hits are a comment in `RecipeList.jsx:162` and a test. The accessibility conventions hold (the tabindex scan test is in the green full run).

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `app/src/ui/Shell.jsx` | ~360 | `importStore` awaited with no try/catch; `scanForUnsafeKeys` recurses without a bound (review WR-01, open) | Warning | A pathologically nested file throws and the Import panel shows nothing. No data loss; no success criterion names it |
| `app/src/ui/IngredientsPlace.jsx` | 158-222 | Category filter state not reset when an import removes the selected category (WR-02, open) | Warning | Select reads "All" while the list stays filtered until Clear filters. Edge case after an import only |
| various | | IN-01 to IN-05 (open) | Info | Stale generator header, `,});`, a constant imported from a large module, composition fractions checked only for finiteness, a dead ternary and a dangling `aria-controls` |

All seven review findings are recorded `open` in `09-REVIEW-DISPOSITION.md`, awaiting Mark's triage. None contradicts a success criterion, so none is a BLOCKER.

### Human Verification Required

None. The previous three items are answered in `09-UAT.md` (3 passed, 0 issues). The related decide rows listed there (`decide-p9-boot-word-problems`, `decide-p9-facts-line-shape`, `decide-p9-393-source-own-line`) are UI-review follow-ups, not must-haves of this phase.

### Gaps Summary

No gaps. All eight success criteria hold in the code at HEAD 4ef2f355. The phase's own non-test checks reproduce after the last changes (places 54/54, WebKit upgrade 17/17, full suite 3475/3475), the seeded-data claims recompute from the modules, and Mark's device UAT is complete. Open items outside the goal: triage of WR-01 and WR-02 (cheap `/gsd-quick` fixes) and the REQUIREMENTS.md checkboxes.

---

_Verified: 2026-10-19_
_Verifier: Claude (gsd-verifier)_
