# Phase 9: The library and the stored shapes, plus the two places - Research

**Researched:** 2026-10-17
**Domain:** IndexedDB schema bump with reset (9 to 10), offline dataset conversion, stored Sheet codes, scale and problem definitions as table rows, a store-file schema change, a `create` draft kind, two read-only list places
**Confidence:** HIGH for what the codebase does and for the dataset facts (read and run this session); MEDIUM for the recommended shapes marked as discretion; every `[ASSUMED]` item is in the Assumptions Log.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Core scales and problems are rows (decision 18)
- **D-01:** The six scales (Hardness, Scoopability, Smoothness, Sweetness, and the declarable Body and Oil: name, low and high word, kind, core or declared) and the four core problem chips are seeded rows in store tables, as Mark said "all seed data is rows". The record pen, the reading and the printed log read them from there. (Mark, 2026-10-17)
- **D-02:** The app reads the tables once when it opens and passes the lists into the domain functions as an argument. `domain/axes.js` and `domain/battery.js` stay pure: no store, no framework, tests pass lists in directly. A table edit shows after a reload. (Mark, 2026-10-17)
- **D-03:** A batch copies the scale and problem definitions it used into its snapshot (SCALE-03, now TASTE-03), core ones included, so a later table edit never moves a stored mark. The battery's measured fields and segmented-control options stay constants; they are not scales or problems.
- **D-03a:** Import validates a batch against that batch's own snapshot of definitions, and a version's declared scales against the file's own definitions, never against the receiving profile's boot catalog (`transfer.js` and `draft.js` use the global `AXES` and `DEFECTS` today). After an import the app reloads the catalog before it next renders a scale or problem (the Shell's `storeRevision` is the hook); the plan states which. (Codex review, 2026-10-17)
- **D-03b:** A recipe's own scale has a key minted once, which survives renames and child versions and never equals a core key. The definition carries the `group` property the app uses today. `createChildVersion` currently shares `declaredAxes` by reference with the parent; once the list holds objects it copies them. (Codex review, 2026-10-17)

#### The Sheet code is stored (decision 19, CODE-01)
- **D-04:** At creation the code is derived once from the version's id (the existing Crockford alphabet, `XXXX-XXXX` grouping), checked against the codes already stored, and stored on the version. The same id gives the same code on any device. It never changes afterwards, whatever is edited. A clash on the check is a creation error, not a silent re-draw. (Mark, 2026-10-17)
- **D-04a:** Uniqueness is a rule over the resulting store, enforced inside the write transaction that stores a version, for creation and for import alike. It covers: two versions in one imported file, an imported version against a local one, two tabs creating at once, and an imported version that replaces one with the same id but a different code. An imported code is kept as written and checked, never recomputed; a clash refuses the import with a message. Separately from uniqueness, an import that replaces a version with the same id but a different stored code is refused (the code is immutable, CODE-01), and a refusal leaves every table unchanged; a test pins both. (Codex review, 2026-10-17)
- **D-04b:** `createChildVersion` (`lineage.js`) builds its record by hand: it must assign the child a fresh code. `saveOverVersion` must keep the version's own code and must not count it as a clash with itself. Phase 9 carries a regression check for each. (Codex review, 2026-10-17)
- **D-05:** The seeded versions get the code each prints today: the converter computes each seeded version's current content-derived code once (the existing `SHEET_CODE_DERIVATION` tag) and stores it, so every sheet already in the binder still finds its version. Olive oil v1 keeps its pinned golden-vector code. (Mark, 2026-10-17)
- **D-06:** The Enter Sheet code search (`SheetCodeSearch.jsx`) looks up the stored code on each version. No hashing at search time and no separate index. (Mark, 2026-10-17)
- **D-07:** This amends Phase 4 D-08 and D-09 (the code was computed and never stored). `sheetCode.js` keeps the old derivation only to compute the seeded versions' codes once; the print routes (`PrintSheet.jsx`, `PrintSheetPages.jsx`) print the stored field. Import validation requires the field.

#### The library
- **D-08:** All 103 ingredients in `~/Downloads/sprinkles-ingredient-seed-db.json` become library entries, merged with the existing 26: where a dataset ingredient is the same ingredient as one of the 26, the app's values stay and the case is recorded as decided (LIB-05). The 26 keep their keys. A converter flags any ingredient it cannot map cleanly, for Mark's review. (Mark, 2026-10-17)
- **D-09:** New entries are keyed by the dataset's own id, camelCased in the style of today's keys (`sucrose`, `skimMilkPowder`). A test fails on a clash with any of the 26 keys. Exception: a dataset ingredient whose camelCased key equals an existing key but is a different product keeps the app's entry and gets a distinct key (dataset `whole-milk`, 3.25% fat, is not the app's `wholeMilk`, 3.5% fat). The converter takes a reviewed mapping of dataset id to existing library id (the 18 key collisions Codex found, each marked same ingredient or different product), and Mark reviews the list before the library lands. (Mark, 2026-10-17; Codex review)
- **D-10:** Each new entry carries source text and a basis per figure, as the existing 26 do: the dataset's `sources` list and its PAC note become the source text, and every figure on a new entry has the basis `inherited`, which the app shows as "unreviewed". The dataset gives no basis per figure, only a source list per ingredient and a PAC note, so nothing is marked stated, derived or estimated until Mark reviews it. An entry the dataset does not source says "not recorded". (Mark, 2026-10-17: "Go ahead with unreviewed") Dairy rows do not count lactose twice in PAC or POD (LIB-07). (Mark, 2026-10-17)
- **D-10a:** The converter has known-answer checks and reviewed exceptions. Composition percentages are divided by 100; PAC and POD are not converted. Four rows are exceptions: sweetened condensed milk (added sucrose: zeroing the dairy sugars would lose it), yogurt (its 14% solids do not equal 14.2% MSNF plus 3.5% fat), milk chocolate (carries milk solids though its category is flavor), and ethanol (zero water and zero solids). Each gets a checked expected figure in a test. (Codex review, 2026-10-17)

#### Places, styles and machines
- **D-11:** Ingredient search is as sketch 012 draws it: the name contains the typed letters in any case, the category is exact, results stay A to Z (`filterLibrary(records, query, category)`, reused by Phase 10's picker). Anything smarter (folding accents, matching every word, ranking a prefix first) goes back to Sid as a design change. (Mark, 2026-10-17)
- **D-12:** A style row stores, beside its six balance bands, the other fields of Mark's balance research (egg yolk, overrun, stabilizer and emulsifier ranges, default serve temperature) and its default equipment class and calibration family as plain text ids. There are no equipment-class or calibration-family tables yet; nothing reads them, and they arrive with the balance-model feature as an update of the styles table that keeps the maker's added rows. The values are in `.planning/notes/2026-10-16-style-bands-draft.md`. PAC and sugar bands are blank. (Mark, 2026-10-17)
- **D-13:** A version records its machine as a copy of the row's values (name, minimum fill, maximum fill), taken when the maker picks it, as a row copies an ingredient's figures, so a later edit to the machines table never moves a stored version. `maxFillG` is a new stored field; Whynter seeds with 700 g minimum and no maximum. (Mark, 2026-10-17)

#### Import, proof, review and boot (second discussion, Phase 8 done)
- **D-14:** On import, the file wins for the machines, styles, scales, problems and library: a row with the same id replaces the local row (the `put`-by-id `importAll` already uses for recipes, versions and batches). Local rows the file does not hold stay; import never deletes. The validator requires every seed table in the file. This does not settle decision 16 (the `importAll` overwrite policy stays open for library editing). (Mark, 2026-10-17)
- **D-15:** The walk is re-recorded: a new before-walk at Phase 9's base commit, then the result is compared against it. The walk's 94 snapshots (fields, focus, statuses, a text hash; it captures no image) must MATCH. The store dumps may differ only on an explicit allow-list of paths with their expected added values checked, not whole snapshots ignored: scale definitions, stored Sheet codes, `libraryId`, machine fields, and the core problem definitions a batch snapshot now carries (D-03; `createBatch` stores none today); any other dump difference fails. The two new places are not in the walk: they are checked side by side against sketch 012 in WebKit, and the category select (the tabindex scan skips selects) is checked in the rendered page. The Phase 8 baseline is not reused. (Mark, 2026-10-17)
- **D-16:** The converter's output is a checkpoint inside the plan. The first plan writes the converter and the reviewed mapping file (the 18 key collisions marked same ingredient or different product, plus rows it flags as unmappable) and stops until Mark approves the list; the plans that seed the library, test the conflict gate and run the upgrade wait on it. The other plans can be planned now. The plan puts the review on Mark's List as a look row. (Mark, 2026-10-17)
- **D-17:** At boot an empty seed table (machines, styles, scales, problems) is reseeded from the committed seed, as `seedLibraryIfEmpty` does for the library. A row that fails its shape check stops the app opening, with a plain message that names the table; there is no half-working catalog. Validation covers the four new tables and the library (existing rows checked with `validateLibraryRecord`), and runs in `main.jsx` before `App` mounts. (Library included and the table-naming message: Claude's reading of "refuse a bad row", from the Codex review; Mark may narrow it.) (Mark, 2026-10-17)
- **D-18:** Phase 8 has landed. The `create` draft kind extends its kept-draft hook (`useKeptDraft`) instead of adding a second restore path. Today the hook cannot hold one: it starts restoring only with a loaded `version` and batches, sends every non-`plan` kind to `onRestoreRecord`, and persists only plan, record and amend drafts (deleting the stored draft otherwise). The acceptance contract: a StrictMode hook test restores and keeps a name-only `create` draft with `version` null and no batch-load prerequisite, through the 250 ms debounce and the unmount path, with no version or recipe written. (Codex review, 2026-10-17)

#### Fixed by earlier decisions (carry forward)
- Library: keep the app's values for all seven conflicts (LIB-05); clear and reseed on the bump, amending Phase 6 D-05 (LIB-06); the 26 keys never change; a row keeps a `libraryId` link and its figures do not move when the library changes (LIB-08).
- Seed tables travel in the store file (LIB-09, decision 20): the file validator checks them, the store file version (8) changes, and an import into a fresh profile restores them.
- Existing schema-8 export files are refused after the bump (the store file version changes); the seeded data is rewritten, and no maker data exists. A later change to the styles table is an update that preserves rows the maker added, not a destructive reseed.
- A scale is a definition carrying its kind, goldilocks or plain magnitude; olive oil's Body and Oil become definitions in the seeded versions; the 2 Aug batch reads as before (decisions 3 and 5).
- The `create` draft kind carries recipe id and version id, name and description, raw amounts, scales and problems, style and machine, and the rest of what a new recipe holds. Its fit check works with no stored version and accepts incomplete input (a name alone). It has its own fit check, and a test fails if any later upgrade deletes a store for a profile at version 10 or above. This is the milestone's only `DB_VERSION` change; from Phase 11 on a shape change lifts records.
- The places replace the placeholders at `/notebook` and `/ingredients`, start nothing, and write no library entry. Every new button, checkbox and radio renders through `ui/Button.jsx`, `Checkbox.jsx`, `Radio.jsx`; every link carries `tabIndex={0}`; every visual value reads a token.

### Claude's Discretion
- Table and store names, the in-memory catalog's shape, and how it reaches the components.
- The converter's mapping from the dataset's fields to the app's entry shape, within D-08 to D-10.
- How the 9-to-10 upgrade is proven from a stored version-9 profile in a real IndexedDB, and the field names of the scale definition (`{key, name, low, high, kind}` per the research).

### Deferred Ideas (OUT OF SCOPE)
- Equipment-class and calibration-family tables, the balance-model feature, and the serving-equipment decision (Mark's `decision-xx-serving-equipment.md`, not adopted, written for a different stack).
- A smarter ingredient search (accent folding, all-words matching, prefix ranking), if ever wanted, via Sid.
- Letting the maker add machines, styles, scales and problems (todos `todo-custom-machine`, `todo-custom-ice-cream-type`).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| LIB-04 | Library seeded beyond the 26 from the reviewed dataset, each entry with provenance | Converter rules, dataset facts, source-text expansion (sections "Library converter" and "Dataset facts") |
| LIB-05 | The 26 keep their values; seven conflicts recorded as decided | Mapping file plus conflict-gate test; the diff table shows more than seven differing pairs, so the gate needs a tolerance and a blanket "app value kept" record (Pitfall 4) |
| LIB-06 | A profile at 9 opens at 10: library cleared and reseeded, store reset, seeded recipes rewritten | `db.js` upgrade pattern, real-IndexedDB proof pattern in `db.test.js`, tests that pin version 9 or open at 10 (Pitfall 1) |
| LIB-07 | Dairy rows do not count lactose twice | Verified rule and invariant: 100 g of a converted row computes the dataset's own PAC and POD (Code Examples) |
| LIB-08 | A row keeps `libraryId`; figures do not move | `versionRow.js`, eight `embed()` copies in `data/*.js`, validator change (Pitfall 9) |
| LIB-09 | Every seed dataset is rows in a store table; tables travel in the store file | Store layer design: four tables, `seedTableIfEmpty`, extended `importAll` and `exportAll`, `STORE_SCHEMA_VERSION` 8 to 9 |
| CODE-01 | Sheet code assigned at creation, unique, stored, immutable | Stored-code design, in-transaction check, 19 baseline codes, collision-fixture precedent |
| TASTE-03 | A batch snapshots the recipe's definitions, kind included | Snapshot design (`coreScales`, `coreProblems`, `declaredAxes` as objects), consumers list |
| PLACE-01 | Ingredients place lists the library, read-only, with search by name and category | Sketch 012 board markup and rules, `filterLibrary`, figure labels (Pattern 8) |
| PLACE-02 | Notebook place lists the recipes | `activeWork()` reuse, board markup (Pattern 8) |
</phase_requirements>

## Summary

Phase 9 is one coordinated change to what the store holds, plus two read-only pages. The codebase is ready for it: every store access already goes through `app/src/store/repository.js`, the upgrade callback is a small guarded sequence in `db.js`, domain modules are pure and take their data as arguments, and the baseline is green (96 test files, 3000 tests, about 3 s) [VERIFIED: `npm --prefix app test` run this session]. No new package is needed; the converter is a node script over `~/Downloads/sprinkles-ingredient-seed-db.json` (103 ingredients, 85,401 bytes) [VERIFIED: file read and parsed this session].

The hard parts are not the pages. They are (1) the converter, where the dataset's PAC and POD already include lactose, its `sugars_pct` for dairy is lactose again, and about a dozen of the 103 rows need a review note (internally inconsistent figures, or a liquid the app's water-from-solids model cannot hold); (2) the Sheet code, where a stored, unique, immutable field has to be enforced inside the write transaction for creation, save-over and import, while 19 seeded versions keep the codes printed in the binder; (3) the scale and problem catalog, which has to reach `BatchRow`, `PrintLogPages`, `draft.js` and `transfer.js` without any of them importing the store; and (4) the number of existing tests that pin version 9, schema 8, name-list `declaredAxes` and computed codes. The research found three things the context does not yet say: two same-ingredient pairs whose keys do not collide (`heavy-cream-36` is the app's `heavyCream`, `lambda-carrageenan` is `carrageenan`), a `db.test.js` test that opens "a newer version" at 10 and will stop testing anything once `DB_VERSION` is 10, and that the `create` draft cannot reuse the hook's restore guard because `useKeptDraft.js:112` returns early without a loaded `version`.

**Primary recommendation:** Build in this order: (a) record the new before-walk at the base commit and write the converter plus mapping file, then stop at Mark's review (D-16); (b) in parallel, the domain and store shapes (definitions, catalog, stored code with its in-transaction check, tables, `DB_VERSION` 10 with the reset branch bounded to `oldVersion < 10`, store file 9, `create` draft kind); (c) after approval, seed the larger library, the conflict gate, the upgrade proof and the places; (d) finish with the re-walk against the allow-list and the side-by-side WebKit check of the two places.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Dataset to library conversion | Offline tooling (`app/scripts/`, node) | Reviewed data module in `app/src/data/` | Nothing is fetched or parsed at runtime (ROADMAP Phase 9 Notes) |
| Scale and problem definitions, Sheet code derivation, clash check, library search, `create` draft fit check | Domain (`app/src/domain/`, pure) | None | Domain modules import no framework, DOM or store |
| Tables, upgrade, uniqueness enforced in a transaction, seed-if-empty, export and import | Store (`db.js`, `repository.js`, `transfer.js`) | Domain supplies the pure rules | The repository seam is the only path to IndexedDB |
| Catalog load at boot and reload after import | App shell (`main.jsx`, `Shell.jsx`) | Store read through the seam | Domain functions receive lists as arguments (D-02) |
| Boot validation of seed tables and library | App shell (`main.jsx`) | Pure validators shared with `transfer.js` | Runs before `App` mounts (D-17) |
| Kept `create` draft (restore, persist, flush) | Browser hook (`useKeptDraft.js`) | Domain fit check and builder | D-18 extends the existing hook |
| Ingredients place, Notebook place | Browser (routed components) | Domain `filterLibrary`, `activeWork` | Read-only lists over repository reads |
| Sheet code lookup and print | Browser (`SheetCodeSearch`, `PrintSheet*`) | Stored field on the version | D-06, D-07 |

## Standard Stack

### Core
No new package. The versions below are what `app/package.json` pins [VERIFIED: app/package.json].

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react / react-dom | 19.2.8 | UI | Ratified stack (CLAUDE.md) |
| react-router | 8.3.1 | Routes for the two places | Already routes `/notebook` and `/ingredients` to placeholders (`router.jsx:123,126`) |
| idb | 8.0.3 | IndexedDB wrapper | Only `store/db.js` imports it |
| vite / @vitejs/plugin-react | 8.2.2 / 6.1.1 | Build | Ratified |
| vitest | 5.0.0 | Tests, `node` environment by default | `vitest.config.js` sets `environment: 'node'`; component tests opt into jsdom per file |
| fake-indexeddb | 6.2.5 | Real-IndexedDB tests | The pattern in `db.test.js` and `tests/db-reset.test.js` |
| jsdom | 30.1.1 | Component and hook tests | Docblock `@vitest-environment jsdom` |

### Supporting
| Tool | Version | Purpose | When to Use |
|------|---------|---------|-------------|
| node | 24.21.0 | Converter script, walk script | `node app/scripts/...`; built-ins only (`node:fs`, `node:path`) |
| playwright-core | 1.63.0 via `PLAYWRIGHT_CORE` (path exists) | The WebKit walk and side-by-side checks | Existing `08-walk.mjs` harness |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| In-transaction pure check for code uniqueness | A `unique: true` IndexedDB index on `versions.sheetCode` | The index enforces it in the engine, but a violation surfaces as a generic `ConstraintError`, so the specific refusal message D-04a asks for needs a pre-check anyway, and D-06 says "no separate index". Use the pure check inside the transaction; optionally add nothing else. |
| `clear()` on the library store in the upgrade | Delete and recreate the store | Delete and recreate is the pattern `db.js` already uses and `db.test.js` already proves. The research doc suggested `clear()`; the reset branch needs delete and recreate for four other stores anyway. |

**Installation:** none.

**Version verification:** no package is added, so there is nothing to look up on a registry [VERIFIED: nothing in this phase's scope calls for one].

## Package Legitimacy Audit

No external package is installed in this phase, so the audit is empty. **Packages removed due to SLOP verdict:** none. **Packages flagged SUS:** none. The converter and walk use node built-ins and the already-installed `playwright-core` path the Phase 8 walk uses.

## Architecture Patterns

### System Architecture Diagram

```
 OFFLINE (once, reviewed)                         BOOT (every open)
 ~/Downloads/...seed-db.json                      main.jsx
        |                                           |  openStore() -> upgrade 9 -> 10 (reset branch)
        v                                           v
 app/scripts/convert-*.mjs  --(mapping.json,        seedIfEmpty(repository)
   known-answer checks,        reviewed by Mark)     |  seedTableIfEmpty: library, machines, styles,
   flags unmappable rows)                            |                    scales, problems  (one tx each)
        |                                            |  then recipes, batches, versions (versions last)
        v                                            v
 app/src/data/library-seed-db.js  ----------->  validate tables + library (bad row => message names table, App never mounts)
 (reviewed module, merged under                       |
  the 26 hand keys)                                   v
                                                   loadCatalog(repository) -> { scales, problems, machines, styles }
                                                      |        ^
                                                      v        | reload on import success, BEFORE storeRevision++
                                                   <App> -> Shell (CatalogContext) -> routes
                                                      |
        +---------------------+----------------------+------------------------+
        v                     v                      v                        v
 /ingredients           /notebook              recipe page, print log      /search
 filterLibrary          activeWork             axesForVersion(v, catalog)  findVersionsByStoredCode
 (library records)      (versions,batches,     axesForBatch(batch)  <- snapshot carries core defs
                         recipes)              draftMatchesVersion(..., catalog)

 WRITE PATHS (all through repository.js, one transaction each)
 create child version --> repository.createVersion(v)   : tx reads stored codes, pure clash check, then put
 save over            --> repository.saveVersion(v)     : tx reads the stored record, refuses a changed code
 import               --> repository.importAll({8 tables}) : tx reads stored versions, pure checks, then puts; any problem aborts, tables unchanged
 draft (create kind)  --> saveDraft / deleteDraft        : keyed by the pre-minted versionId, never exported
```

### Recommended Project Structure
```
app/
├── scripts/                       # offline, never shipped
│   ├── convert-ingredient-seed.mjs
│   └── ingredient-mapping.json    # reviewed: dataset id -> existing key | "different" + new key
├── src/
│   ├── data/
│   │   ├── library.js             # the 26, unchanged
│   │   ├── library-seed-db.js     # converter output, reviewed, committed
│   │   ├── library-decisions.js   # recorded decisions for every same-ingredient pair (LIB-05)
│   │   ├── core-scales.js, core-problems.js, machines.js, styles.js   # seed rows (read only to seed)
│   │   └── seed-sheet-codes.js    # { versionId: code } computed once (D-05)
│   ├── domain/
│   │   ├── axes.js, battery.js    # take lists as arguments (D-02)
│   │   ├── sheetCode.js           # + id derivation, clash check; legacy derivation kept
│   │   ├── ingredientSearch.js    # filterLibrary(records, query, category)
│   │   ├── catalog.js             # pure helpers over { scales, problems }
│   │   └── draft.js               # + 'create' kind and its own fit check
│   ├── store/
│   │   ├── db.js                  # DB_VERSION 10, exported upgrade function
│   │   ├── repository.js          # + tables, seedTableIfEmpty, createVersion, extended import/export
│   │   ├── seedTables.js          # pure validators for the four tables (shared with transfer.js and boot)
│   │   └── transfer.js            # STORE_SCHEMA_VERSION 9
│   └── ui/
│       ├── IngredientsPlace.jsx, NotebookPlace.jsx
│       └── CatalogContext.jsx     # provider in Shell, reload after import
```

### Pattern 1: The 9-to-10 upgrade (reset, bounded)
**What:** Extend the existing reset branch from `oldVersion < 8` to `oldVersion < 10`, adding `library` to the dropped stores, then create the four new stores with the guarded creates. Keep the callback free of `async`.
**Current code, quoted** [VERIFIED: app/src/store/db.js:4, 24-29, 54-56]:
```js
export const DB_VERSION = 9;
      if (oldVersion > 0 && oldVersion < 8) {
        if (db.objectStoreNames.contains('versions')) db.deleteObjectStore('versions');
        if (db.objectStoreNames.contains('batches')) db.deleteObjectStore('batches');
        if (db.objectStoreNames.contains('recipes')) db.deleteObjectStore('recipes');
        if (db.objectStoreNames.contains('drafts')) db.deleteObjectStore('drafts');
      }
      if (!db.objectStoreNames.contains('library')) {
        db.createObjectStore('library', { keyPath: 'id' });
      }
```
**Recommendation:** export the callback body as `upgradeStores(db, oldVersion, newVersion, transaction)` so a test can drive it at a hypothetical version, and put the whole destructive branch behind one `oldVersion < 10` condition. Update the two comments in `db.js` that say a bump "needs neither a reset nor a lift" and the one that bounds the reset to profiles below 8.
**Ratchet for "a later upgrade must not delete a store at version 10 or above":** two tests. (1) Behavioural: open a profile at exactly 10 holding a record in every store (including `drafts` with a `create` record, and the four tables), then run `upgradeStores` through a raw open at `DB_VERSION + 1`; assert every store and record survives. It is vacuous until a later bump, then bites automatically. (2) Static: read `db.js` as text and assert every `deleteObjectStore` and `.clear()` sits inside the `oldVersion < 10` block (the repo already scans source text in `tabindex-scan.test.js` and `library.test.js:214-266`).

### Pattern 2: Seed tables behind the seam
Generalise `seedLibraryIfEmpty` [VERIFIED: repository.js:130-152, one readwrite transaction: count, then puts, abort by hand on failure] to `seedTableIfEmpty(storeName, records)` with an allow-list of the five store names. Add `listMachines`, `listStyles`, `listScales`, `listProblems`. Keep `seedLibraryIfEmpty` as a thin caller so `seed.test.js` and `library.test.js` keep their shape. `seedIfEmpty` seeds all five tables first, then recipes and batches, then versions last (the existing "versions flip the check" ordering, `seed.js:15-20`).

### Pattern 3: Catalog loaded once, passed in
`loadCatalog(repository)` returns `{ scales, problems, machines, styles }`. `main.jsx` awaits seed, then validates, then loads, then renders `<App catalog={catalog} />`. `Shell` holds it in state behind a `CatalogContext`. **After import (D-03a):** in `Shell.jsx`'s `handleImportChange` [VERIFIED: Shell.jsx:325-340] the success branch currently does `setImportErrors([]); setStoreRevision((revision) => revision + 1);`. The plan should state: `setCatalog(await loadCatalog(repository))` first, then `setStoreRevision(...)`, so routed pages keyed on `storeRevision` never render with the old catalog. Consumers that render scales or problems take the lists from context and pass them to the pure functions.

**Signature changes (recommended):**
- `axesForVersion(version, catalog)` = core scales from `catalog.scales` (group `core`, table order) then `version.declaredAxes` objects.
- `axesForBatch(batch)` = `batch.snapshot.coreScales` then `batch.snapshot.declaredAxes`. No catalog needed: the snapshot carries the core definitions (D-03).
- `createBatch(version, churnFields, tastingFields, { id, now, catalog })` writes `snapshot.coreScales` and `snapshot.coreProblems` (copies of the table rows, by `structuredClone`), keeps `declaredAxes` (now objects) and `declaredFlaws`.
- `draftMatchesVersion(record, version, batches, catalog)`: mark keys are checked against the version's core keys from the catalog plus its own declared keys, or against the corrected batch's own snapshot keys for an amend draft. `draft.js:146` and `:165` use the global `AXES` and `DEFECTS` today [VERIFIED: draft.js:146,165].
- `blank` / printed log: `PrintLogPages.jsx:186,195` reads `axesForVersion(version)` and `[...DEFECTS, ...(version.declaredFlaws ?? [])]` [VERIFIED]; both take the catalog.

**Definition shapes (Claude's discretion; recommended):**
- Scale: `{ key, name, low, high, kind, group }`, `kind` one of `'goldilocks'` or `'magnitude'`, `group` `'core'` or `'declared'`. Core keys stay `hardness`, `scoopability`, `smoothness`, `sweetness`; Body and Oil keep `body` and `oil` (marks are stored by these keys [VERIFIED: axes.js:17-24]; the 2 Aug batch marks `{ sweetness: 4, oil: 4 }` [VERIFIED: batch-2026-08-02.js tastingFields]).
- A table row is the definition plus `id` (equal to `key`), since the stores are `keyPath: 'id'`.
- Problem: keep problems as words. The tasting stores problem words (`defects`, `declaredDefects`), and `declaredFlaws` is already a list of words. A problem definition is `{ id, name }` in the table and `snapshot.coreProblems: [name, ...]` is the batch copy. Reshaping problems into keyed objects would rewrite stored tastings for no benefit in this phase. This is a recommendation, not a locked decision; see Open Question 1.
- A minted scale key must not equal any key in the scales table (including `body` and `oil`) and must not be an `UNSAFE_KEYS` name; use `freshId()` from `domain/id.js` with a prefix, minted once at creation and copied unchanged by `createChildVersion` (which must `structuredClone` the list, D-03b).

### Pattern 4: The stored Sheet code
**Derivation (new, from the id):** same alphabet and grouping, new function and new tag, never an edit of the old one. The old file says so itself: "A change to any of it is a NEW derivation tag (SHEET_CODE_DERIVATION), never an edit." [VERIFIED: sheetCode.js:14]. Existing constants to reuse [VERIFIED: sheetCode.js:40,43]:
```js
export const SHEET_CODE_DERIVATION = 'sprinkles-sheet-code:1';
export const CROCKFORD_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
```
Factor the FNV-1a 64 loop and the "top 40 bits to eight symbols, grouped XXXX-XXXX" step out of `sheetCode(version)` (`sheetCode.js:110-131`) so both derivations share it, with the byte input differing (`SHEET_CODE_ID_DERIVATION + id` for the new one). The old `sheetCode(version)` stays exported for the seed computation and the golden vector (`'64JH-G408'`, `sheetCode.test.js:43`).
**Check:** a pure `sheetCodeProblems(storedVersions, incomingVersions)` returns problems over the resulting store: (1) two different ids with the same code after the incoming rows replace stored rows by id; (2) an incoming row with a stored row of the same id and a different code. It is called inside the repository's write transaction, never from the UI alone.
**Write paths (repository):**
- `createVersion(version)`: one readwrite transaction on `versions`, `getAll`, pure check, put. Used where a child or a first version is stored.
- `saveVersion(version)` (save over): in the transaction read the stored record by id and refuse when its code differs; never count a version against itself.
- `importAll`: already one transaction over four stores [VERIFIED: repository.js:158-180]; it becomes one over eight, reads the stored versions inside it, runs the pure check, and aborts with a tagged error that `importStore` turns into a message. Keep `importStore`'s existing pre-checks (parent and recipe resolve) and add the code problems there too for a precise message; the in-transaction check is what closes the two-tab race.
**Consumers:** `lineage.js` `createChildVersion` builds its record by hand [VERIFIED: lineage.js:130-151] so it needs `sheetCode: codeFromVersionId(id)`; `saveOverVersion` spreads `...version` [VERIFIED: lineage.js:162-166] and keeps the code with no change; `newRecipe.js` `createRecipe` builds the root version by hand [VERIFIED: newRecipe.js:62-80] and needs the same field. `SheetCodeSearch.jsx:80` calls `findVersionsByCode(versions, code)`; make that filter on `version.sheetCode`. `PrintSheet.jsx:125` and `PrintSheetPages.jsx:84` call `sheetCode(version)` and must print `version.sheetCode`. `transfer.js` `validateVersion` must require the field and check its shape with `normaliseCode`-style rules.
**Seeded codes (D-05):** computed at HEAD `4f2b568` by running the existing `sheetCode()` over `seedRecipeGroups` [VERIFIED: node run this session, 19 versions, 0 duplicates]:

| Version id | Code | Version id | Code |
|---|---|---|---|
| olive-oil-ice-cream-v1 | 64JH-G408 | strawberry-v1 | N95Q-H35G |
| mexican-chocolate-v1 | 4144-RCQJ | strawberry-v2 | VXY7-T54A |
| mexican-chocolate-v2 | GQ9X-TDYQ | strawberry-v2-1 | 5XKG-WTQG |
| mexican-chocolate-v3 | TR42-P6KM | standard-base-v1 | PSJV-GZT0 |
| mexican-chocolate-v4 | N2MS-PP5E | standard-base-v2 | XGFN-DNT0 |
| pineapple-v1 | SE1M-QSAC | underbelly-light-base-v1 | CPXD-3J6G |
| coconut-v1 | 9A0Q-SMSK | underbelly-light-base-v2 | H8KH-C5DQ |
| coconut-v2 | 1F87-0MQK | mocha-v0 | ZDE7-P3JQ |
| mocha-v1 | K54H-XTPZ | mocha-v2 | CWFA-F70F |
| mocha-v3 | W1DE-AB2R | | |

Commit these as `data/seed-sheet-codes.js`. A test asserts the map equals `sheetCode()` over the seed versions as they stand (this pins that Phase 9 did not touch printed content: `sheetCode` ignores `libraryId`, `equipment`, `declaredAxes` and scale definitions [VERIFIED: sheetCode.js:26-31]). Where to stamp the field is a planner choice: stamping in `data/seed-recipes.js` leaves eight data files untouched; a literal in each file is more explicit.
**Collision fixture:** a 40-bit clash is not reachable by chance; `sheetCode.test.js` already pins a brute-forced colliding pair for the old derivation (`COLLIDING_CODE`, `collider('x259595')`, line 249). Brute-force a colliding id pair for the new derivation once (about 2^20 hashes) and commit the two ids, so the tests for "two imports clash", "import against local" and "two tabs creating at once" run for real.

### Pattern 5: Library converter (offline) and merge
- Script reads the dataset, a mapping file and the 26 existing keys; writes `data/library-seed-db.js`. The module exports the new entries only, and `seed.js` builds the seed as `{ ...newEntries, ...library }` so an existing key can never be overwritten.
- Entry shape is the existing one [VERIFIED: library.js:8-18]: `{ name, category, dairy?, heatTreatment?, densityGPerMl?, composition, basis, source, note? }`.
- The dataset carries no density, heat treatment or packed state; omit them.
- **Source text:** the dataset's `meta.sources` maps tags (`Goff`, `Mullan`, `UB`, `USDA`) to full citations [VERIFIED: dataset meta]. A row's `sources` entries look like `Goff 3.4` or `Mark's ice cream editor (Ingredients.iei)`. Write each figure's source as the joined citations; write the PAC figure's source from `pac_provenance` (it already says `calculated (lactose 4.61%...` for dairy). Every row has at least one source [VERIFIED: 81 rows with 1, 21 with 2, 1 with 3, 0 with none], so "not recorded" is reachable only from the display for a figure without text.
- **Basis:** every figure `inherited` (D-10).
- **Category:** keep the dataset's category word. The union with the existing seven is exactly eleven: dairy, egg, emulsifier, fat, fiber, flavor, fruit, other, polyol, stabilizer, sugar [VERIFIED: dataset and library categories; matches the eleven `<option>` words in `ingredients-place-103-entries.html`]. The board shows the category word capitalised.
- **Field rules** (all checked in `proto.mjs` this session against the 103 rows):
  - `fat`, `msnf`, `sugar` = pct / 100; `pac`, `pod` as is (they are already sucrose = 100 per 100 g as weighed, the same scale as the app's `composition.pac`).
  - Category `stabilizer` and `emulsifier` rows map to `composition.stabilizer` or `composition.emulsifier` = `solids_pct / 100` and drop `fat`. Without this rule lecithin and mono-diglycerides (dataset `fat_pct: 100`) become fat, and the gums become "other". The existing entries use `{ emulsifier: 1 }` and `{ stabilizer: 1 }`.
  - `other` = solids minus fat minus msnf minus sugar (minus emulsifier, stabilizer), floored at zero; flag a row that needed the floor by more than 0.05.
  - `dairy: true` only for category `dairy` with `msnf_pct > 0`. Dataset `coconut-milk` is category dairy with MSNF 0 and the file calls it non-dairy, so it must not carry the flag (`computeBalance` uses the flag to split milk fat from added fat [VERIFIED: composition.js:38-41]).
  - **Lactose once (LIB-07):** the engine adds lactose = `msnf * 0.545` to PAC (times 100) and to POD (times 16) itself [VERIFIED: composition.js:6-10,35,43-44]. For every row with `msnf_pct > 0`, subtract the lactose the engine will add: `sugar = max(0, sugars_pct - 0.545 * msnf_pct)`, `pac = pac - 0.545 * msnf_pct`, `pod = pod - 0.16 * 0.545 * msnf_pct`; omit a `pac` or `pod` residual under 0.1 in absolute value (rounding noise, e.g. whole milk residual PAC -0.01). The key test is an invariant, not a table: `computeBalance` over 100 g of the converted entry returns the dataset's own `pac`, `pod` and solids within a stated tolerance. Over all 20 rows with `msnf_pct > 0`, 100 g computes PAC within 0.052 and POD within 0.070 of the dataset, and solids within 0.15 on every row except the two internally inconsistent ones (`dried-buttermilk-powder-sweet`, `yogurt-3.5pct`) [VERIFIED: proto.mjs invariant summary, run this session].

### Pattern 6: The recorded-decision gate (LIB-05)
The mapping file marks each dataset id: `same` (with the existing key), `different` (with a new key), or a plain new row. `data/library-decisions.js` holds one record per `same` pair: `{ datasetId, libraryId, differs: [field, ...], decision: 'app value kept' }`. The gate test recomputes, for every `same` pair, the fields whose converted dataset value differs from the app's beyond a tolerance, and fails when the recorded `differs` list is not exactly that list. That makes both a new difference and a stale record fail. The seven named conflicts get a human note each. Names: dextrose basis, salt 580 or 586, fructose POD, strawberries, skim milk powder, coconut milk, heavy cream.

### Pattern 7: The `create` draft kind (D-18)
**What the code does today** [VERIFIED: useKeptDraft.js:112, 128-151, 166-193; draft.js:47,264-289]:
- `KINDS = ['plan', 'record', 'amend']`; `draftMatchesVersion` returns false for any other kind and needs a version.
- The restore effect returns at line 112 unless `version`, `version.recipeId === recipeId`, `batchesLoaded` and no `loadFailed`; a non-`plan` record goes to `onRestoreRecord(record)`.
- The persist effect writes only `plan` (via `isPenDraftDirty`) and `record` or `amend` (via `isDraftDirty`); otherwise it deletes the stored record when `draftStoredRef.current` is true.
**Recommended extension (one hook, one restore path):**
- Add `'create'` to `KINDS`; add `fitsCreateShape(payload, record)` and `draftMatchesCreate(record)` in `draft.js` taking no version and no batches. Required: `shapeVersion`, `kind === 'create'`, `versionId` a non-empty string, `payload.recipeId` and `payload.versionId` equal to the record's, `payload.name` a string; everything else optional but type-checked when present. A name alone fits (the contract in D-18). Reject any object with an unsafe key via the existing `carriesUnsafeKey`.
- `isCreateDraftDirty(payload)`: any non-blank ink; a blank draft deletes the stored record, like the other pens.
- Hook: new inputs `creating` (boolean), `createDraft`, `onRestoreCreate`. When `creating`, the restore effect's guard is `!draftRestoreStartedRef.current` alone (no `version`, no batches), it reads `repository.getDraft(versionId)`, validates with `draftMatchesCreate`, deletes a non-fitting record quietly, calls `onRestoreCreate(record.payload)` for a fitting one, sets `draftStoredRef.current = true`, announces `DRAFT_KEPT_STATUS` and sets `draftRestoreDone`. The persist effect gains a third branch building `buildDraftRecord({ versionId, kind: 'create', payload: createDraft, now })`. The unmount flush is unchanged.
- **Acceptance test (D-18):** a jsdom StrictMode harness like `useKeptDraft.test.jsx` (mocked `repository`, `getDraft`, `saveDraft`, `deleteDraft` [VERIFIED: useKeptDraft.test.jsx:17-25]) with `version: null`, `batchesLoaded: false`, and a name-only payload: asserts one `getDraft` call under StrictMode (the started-ref guard), the restore callback once, `saveDraft` after the 250 ms debounce with the draft's `kind: 'create'`, the unmount path flushing a pending record, and no `saveVersion`, `saveRecipe` or `putAll*` call.
- **Existing consumers already ignore a create record:** `RecipeList.jsx:93-101` only counts drafts whose version exists and fits, and `RecipePage.jsx:307-317` filters `record.kind !== 'plan'`. Add a regression test that a store holding a `create` draft changes neither page.
- Store: the drafts store stays `keyPath: 'versionId'`; the creation editor (Phase 10) mints `recipeId` and `versionId` when New recipe is pressed and keys the draft by `versionId`. Drafts are never exported [VERIFIED: repository.js:181-184 comment, exportAll reads four stores].

### Pattern 8: The two places
**Authority:** `.planning/sketches/012-places/` (three HTML boards, README `## Decisions`). Conformance is the built app and the board side by side in WebKit, never prose or a test count. The board CSS is the authority and is written per panel as `.pc1366 ...` and `.pc393 ...` rules with the `@media` already resolved; the port to the app's stylesheets restores real media conditions with the two cuts the README names (760 for both places, 1100 for the Ingredients row's category move) and the coarse-pointer touch floor. The boards add no token: every `var()` they use resolves in `tokens.css` [CITED: 012-places/README.md "Token naming points"]. Reuse `--sheet-size-select-chevron`, `--sheet-inset-select-chevron-x`, `--sheet-inset-select-chevron-y`, `--gap-select-chevron-room`, `--app-col-standing`, `--app-col-tally`, `--app-notebook-size-body`, `--app-notebook-desc-leading`, `--app-notebook-identity-size`, `--app-ingredients`, `--app-radius-rail` as they are; the README says not to copy them.
**Ingredients place** (board markup, verbatim classes): `main > div.list-page.place.ing > h1.place__title`, `form.ing__filters[role=search]` with two `label.notebook-field.ing__field` (Name text input, Category `select.ink-field`, All first then the eleven words), `div.ing__status > p.ing__count[role=status][aria-live=polite]` (count reads "N ingredients", "N of 26 ingredients" with a filter on; Clear filters only while a filter is on), `ul.ing__list > li.ing__row` holding `span.ing__rail` and a `button.ing__head[aria-expanded][aria-controls]` (name, category, a summary like `Sugar 100% · Freezing 190 · Sweetness 70`, then Show or Hide), and an open `div.ing__detail` with a Figure / Amount / Basis / Source table, then density, heat treatment, the lactose line, and the Note, each only where the entry has it.
- Row heads render through `ui/Button.jsx` (carries `tabIndex={0}`); the Category select is not covered by `tabindex-scan.test.js` (its header lists "the select element" as a blind spot) so give it `tabIndex={0}` and verify Tab reaches it in WebKit (D-15).
- Figure labels from the board: Fat, Freezing · PAC, Milk solids · MSNF, Other solids, Stabilizer, Sugar, Sweetness · POD (and Emulsifier). Amounts print as percent for composition fields and as a plain number for PAC and POD, with at most two decimals, trailing zeros trimmed, and a true minus for negatives (`−160`). The Basis column reuses the app's word for `inherited`: `IngredientTable.jsx:100` returns `'unreviewed'` [VERIFIED].
- The lactose helper line ("Lactose counts as 54.5% of milk solids in Freezing and Sweetness.") is drawn "only for dairy". `computeBalance` applies lactose to any row with MSNF, so milk chocolate (flavor, MSNF 16) is a case the board does not draw; see Open Question 4.
- Search: `filterLibrary(records, query, category)` in `domain/ingredientSearch.js`: name `includes` the trimmed query, case-insensitive, category exact (`All` matches all), result sorted by name A to Z case-insensitively ("Whole Milk 3.3%" before "Whole milk, 3.5% fat" per README). Nothing smarter (D-11). Pure, tested in `node`.
**Notebook place:** `div.list-page.place` with title, a count in words ("8 recipes", "1 recipe"), then `ul.nb__list > li.nb__row` (`span.nb__rail`, `h2.nb__name > a[tabindex=0]`, `p.nb__desc` only where the recipe has a description, `p.nb__meta` "N versions · N batches" / "not yet made"). The order is `activeWork(versions, batches, recipes)` exactly [VERIFIED: lastEvent.js:111-133 returns `latestVersion`, `versions`, `batches` per recipe, sorted by recency], the same call Home makes, so the order cannot drift. The link is `notebookPath(entry.id, entry.latestVersion.id)`. No New recipe, no Resume, no gap held for them. Home's `batchCountWords` is a private function in `RecipeList.jsx:187`; extract it rather than copy it.
**Routes:** replace `router.jsx:123` and `:126`. Keep `Placeholder.jsx` for Recipe book, Idea log and Kitchen; `styles/shell.test.js:314` pins that the placeholder renders its three classes once, and `Shell.test.jsx` builds its own routes so neither breaks.

### Pattern 9: Store file, import and validation
- `STORE_SCHEMA_VERSION` 8 to 9 [VERIFIED: transfer.js:29 `export const STORE_SCHEMA_VERSION = 8;`]. Tests use the constant, not a literal, so they move with it; the literal pins are the `DB_VERSION` ones listed in Pitfall 1.
- The file gains `machines`, `styles`, `scales`, `problems` arrays beside `library` (names are discretion). `validateStoreFile` requires all four (D-14) and validates each row with pure validators in `store/seedTables.js`, which `main.jsx` also calls on the stored tables (D-17). `validateLibraryRecord` is a private function today (`transfer.js:221`); export it from a shared module so the boot check can reuse it.
- Row id refusals: every id in the new tables is refused when it is an `UNSAFE_KEYS` name, exactly as `validateLibraryRecord` does for library ids [VERIFIED: transfer.js:227].
- `validateVersion` additions: required `sheetCode`; `declaredAxes` as definition objects (key, name, low, high, kind in the allowed set, group), at most two, unique keys, key not an unsafe name; `equipment.maxFillG` null or a finite number when `equipment` is present (nothing validates `equipment` today [VERIFIED: validateVersion reads no equipment, targets or process]); `rows[].libraryId` string or null.
- `validateBatch`/`validateTasting` additions (D-03a): the snapshot must carry `coreScales`, `coreProblems`, `declaredAxes` (objects) and `declaredFlaws`; `tasting.marks` keys must be keys in that snapshot's own scales (today only the 1 to 5 value is checked [VERIFIED: transfer.js:255-265]); `tasting.defects` words must be in `snapshot.coreProblems`; `declaredDefects` words in `snapshot.declaredFlaws` (already so [VERIFIED: transfer.js:298-308]). Remove the import of the global `AXES`/`DEFECTS` from `transfer.js:11-12`.
- Marks are stored under the scale key and set with `next[axisKey] = stop` [VERIFIED: axes.js:106-114]; a key of `__proto__` is refused by the unsafe-key scan only as an object key in the file, so validate scale `key` values explicitly.

### Anti-Patterns to Avoid
- **A catalog module that imports the store.** Domain stays pure; the lists arrive as arguments (D-02).
- **Recomputing an imported Sheet code.** It is kept as written and checked (D-04a).
- **A silent re-draw on a code clash.** It is a creation error (D-04).
- **Validating a batch against the receiving profile's catalog** (D-03a).
- **Reading the dataset or the mapping at runtime.** They are converter inputs only.
- **A second restore path for `create` drafts** (D-18).
- **Copying board CSS with its `.pc1366` and `.pc393` wrappers.** They are panel scaffolding, not app selectors.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Collision-free unique code | A second hash or a random re-draw | The existing FNV-1a 64 and Crockford step in `sheetCode.js`, shared | Same alphabet, grouping and test precedent; the new function differs only in its byte input and tag |
| Atomic read-check-write | A read then a separate write | One readwrite transaction in the repository, abort by hand on failure (the `importAll` pattern, `repository.js:158-180`) | Two tabs and import races are closed by transaction scope |
| Seed-if-empty | A count check outside the transaction | `seedTableIfEmpty`, the `seedLibraryIfEmpty` shape | The Codex review of Phase 6 reproduced the window |
| Upgrade proof | Mocking IndexedDB | `fake-indexeddb` with `seedOldProfile` as in `db.test.js` | Real object stores and real versionchange semantics |
| Ingredient fold | A new disclosure widget | `Button.jsx` with `aria-expanded` and `aria-controls` (the `FoldRow.jsx` convention) | The tabindex rule and iPad focus are solved there |
| Recency order | A new sort | `activeWork()` | The board's order is Home's own |
| Basis words | A new mapping | `IngredientTable.jsx` `'inherited'` to `'unreviewed'` | One vocabulary |
| Walk | A new harness | Copy `08-walk.mjs`, extend `compare` with the allow-list | 906 lines of deterministic capture already exist |

**Key insight:** every hard rule in this phase already exists once in this repo in a smaller form (seed-if-empty, atomic import, golden-vector code, source-text scanning tests). The work is to extend each one, not to invent a second.

## Runtime State Inventory

This is a reset and migration phase, so each category is answered explicitly.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | The `sprinkles` IndexedDB at version 9 on Mark's browsers and devices: stores `versions`, `batches` (index `by-version`), `recipes`, `drafts` (key `versionId`), `library` [VERIFIED: db.js]. It holds the seeded recipes and whatever Mark recorded while testing; Mark has said no device holds real batches (ROADMAP decision 5). | Data migration is a reset, not a lift: delete and recreate the five stores at `oldVersion < 10`, reseed at boot. Code edit: new stores, new shapes. The ROADMAP reminder to ask Mark for an export row applies before Phase 11, not now. |
| Live service config | None. The app has no server and makes no network call (privacy constraint in `.claude/CLAUDE.md`). | None, verified by the constraints and by `main.jsx`/`repository.js` having no fetch. |
| OS-registered state | None. | None. |
| Secrets and env vars | None. The converter reads one local file; the walk reads `PLAYWRIGHT_CORE`, `PROBE_DIST`. | None. |
| Build artifacts | `app/dist` is what `vite preview --host` serves to Mark's iPad and iPhone and will be stale after the bump; a device that kept the old service data opens the old DB until it loads the new build. The WebKit walk builds to `$TMPDIR/sprinkles-08/dist` and never writes `app/dist`. | Rebuild before device checks; use a Phase 9 scratch directory for the walk. The `blocking` handler reloads an old tab onto the new build. |
| Printed paper | Sheets already in the binder print the 19 content-derived codes above. The codes on paper are runtime state the repo cannot edit. | Stored codes for the seeded versions equal these exactly; the test pinning the map to `sheetCode()` guards it. Olive oil v1 stays `64JH-G408`. |
| Exports on disk | Any schema-8 export file Mark saved. | Refused after the bump with `OLDER_EXPORT_MESSAGE` (the existing refusal path, `transfer.js:34,577-579`); the context accepts this. |

**Nothing found in:** live service config, OS-registered state, secrets (verified by reading `main.jsx`, `repository.js`, `db.js`).

## Common Pitfalls

### Pitfall 1: Tests that pin version 9 or open "a newer version" at 10
**What goes wrong:** `db.test.js` has five `toBe(9)` pins (lines 84, 116, 152, 224, 270), `tests/db-reset.test.js` has two (98, 169), and the "steps aside when a newer version asks" test opens `indexedDB.open(DB_NAME, 10)` and expects `newer.version` to be 10 [VERIFIED: db.test.js 252-268]. At `DB_VERSION` 10 that open is not newer, no `versionchange` is raised, and the test either hangs or passes for the wrong reason.
**How to avoid:** change the "newer" open to `DB_VERSION + 1`; rewrite each pin against `DB_VERSION`; add the 9-to-10 proof (a stored version-9 profile with a recipe, version, batch, draft and library record opens at 10 with every store empty or reseeded and the four new stores present).
**Warning signs:** a test in `db.test.js` that times out.

### Pitfall 2: The reset branch grows instead of being bounded
**What goes wrong:** extending `oldVersion < 8` to `< 10` is right once; leaving the destructive code reachable for later upgrades is how real recipes get wiped after Phase 11.
**How to avoid:** the two ratchet tests in Pattern 1, and update the `db.js` comments that currently describe the bounds.

### Pitfall 3: Lactose counted twice, and a sugar column that is lactose
**What goes wrong:** copying `pac`, `pod` and `sugars_pct` as they are doubles lactose in PAC and POD, and `sugars_pct` for dairy is lactose again, so "other" (solids minus fat, MSNF and sugars) goes negative on 19 rows (18 dairy-like rows plus lecithin) [VERIFIED: python run: whole-milk other -4.6, skim-milk-powder -52.5, dried-buttermilk-powder-sweet -53.75, and so on].
**How to avoid:** the Pattern 5 rule and its 100 g invariant test over every row with `msnf_pct > 0`.
**Warning signs:** a dairy entry whose 100 g PAC is about twice the dataset's.

### Pitfall 4: The conflict gate is wider than seven
**What goes wrong:** comparing the 18 key collisions plus the two name matches, many more than seven pairs differ in some field [VERIFIED: proto.mjs]: sucrose (sugar 0.999 and PAC 99.9 against 1 and 100), dextrose (sugar 0.92, PAC 174.8, POD 74 against 1, 190, 70), fructose POD 173 against 170, salt PAC 586 against 580, the gums and lecithin (0.88 to 0.99 against 1), whole milk, heavy cream MSNF 0.056 against 0.054, skim milk powder, pineapple POD 10.8 against 10.82, stabilizer mix 4421 (no stabilizer fraction), strawberries, coconut milk. A gate that fails only on unrecorded "conflicts" would fail on the first run for the unnamed ones.
**How to avoid:** one record per same-ingredient pair (Pattern 6), the seven named conflicts carrying a note. Whole milk (3.25% against 3.5% fat) and coconut milk are expected to be marked "different product" in the mapping, with distinct keys.

### Pitfall 5: Two same-ingredient pairs do not collide by key
**What goes wrong:** D-09 builds the mapping from the 18 key collisions, but `heavy-cream-36` ("Heavy cream (36% fat)") is the app's `heavyCream` ("Heavy cream, 36% fat") and `lambda-carrageenan` is the app's `carrageenan` ("Lambda carrageenan") [VERIFIED: name comparison]. Left as new rows the library holds two entries for one ingredient, and the "heavy cream" conflict from decision 1 is never compared. The research doc `ARCHITECTURE.md` compared heavy cream with the 40% row (`heavy-cream-40`), which is a different product; the 36% row exists in the dataset.
**How to avoid:** the mapping file lists these two as `same`; add a test that fails when a new entry's normalised name matches an existing entry's name.

### Pitfall 6: Sheet code stability and printed content
**What goes wrong:** any Phase 9 edit that changes printed content (`sheetTitle`, `sheetDescription`, `versionLabel`, notes, rows' names, portions' grams or steps) would silently change a seeded version's content-derived code before it is pinned.
**How to avoid:** compute and commit the 19 codes before touching seed data (they are in Pattern 4 from HEAD), and test the map against `sheetCode()` over the seed.

### Pitfall 7: The dataset is internally inconsistent on a few rows
**Verified rows to flag in the review list** (D-08 asks the converter to flag what it cannot map cleanly):
- `yogurt-3.5pct`: MSNF 14.2 plus fat 3.5 is 17.7 against solids 14.0 (this is D-10a's yogurt).
- `dried-buttermilk-powder-sweet`: fat 5.78 plus MSNF 96.0 is 101.78 against solids 97.03.
- `goat-milk`: POD 5.1 against a lactose-implied 0.77; the other milks sit at 0.5 to 0.8.
- `buttermilk`, `buttermilk-light`, `sour-cream`, `buffalo-milk`: PAC residual after removing lactose is -0.3 to -1.4 (the dataset's PAC is lower than its own lactose).
- `ethanol` (water 0, solids 0, PAC 744), `rum-40pct` (water 66.6, solids 0.0), `alcohol-40pct` (water 60, solids 40): the app derives water as mass minus solids, so a non-water, non-solid liquid cannot be represented; keep `composition` empty and `pac` set, and record that in the entry note.
- `milk-chocolate` (D-10a): category flavor, MSNF 16. The residual rule gives sugar 0.4278 (51.5 minus 8.72 lactose), PAC 4.78, POD 51.6048, and 100 g computes the dataset's 13.5 and 53 [VERIFIED].
- `sweetened-condensed-milk` (D-10a): the residual rule gives sugar 0.4197, PAC 41.965, POD 41.9944, and 100 g computes 54.50, 44.00 and 73.00 solids [VERIFIED]; "zeroing the dairy sugars" would lose the 42% added sucrose.
Dataset id `yogurt-3.5pct` camelCases to `yogurt3.5pct`, the only key with a dot; give it a reviewed key (for example `yogurt35pct`) in the mapping.

### Pitfall 8: Core scale and problem consumers beyond the obvious three
**What goes wrong:** the consumers are `PrintLogPages.jsx`, `BatchRow.jsx` (axes at lines 269 and 1052, `DEFECTS` at 1091, `declaredProblemsForBatch` at 624), `AxisMark.jsx` (pure over one axis; `STOPS` and `stopWordsFor` stay), `draft.js`, `transfer.js`, `data/olive-oil.js`, `domain/batch.js`, `domain/lineage.js` and `domain/newRecipe.js` [VERIFIED: grep]. Test files that touch them: `axes.test.js` (40 mentions), `transfer.test.js` (21), `PrintLogPages.test.jsx` (18), `BatchRow.test.jsx` (11), plus a dozen more.
**How to avoid:** change the pure functions' signatures first, update the tests that call them to pass lists, then the components.

### Pitfall 9: `libraryId` has eight `embed` copies and two inline rows
**What goes wrong:** each seed file defines its own `embed(ingredientName, ingredient, fields)` that clones the entry and drops the key [VERIFIED: olive-oil.js:54, pineapple.js:9, coconut.js:9, strawberry.js:15, standard-base.js:12, mocha.js:17, mexican-chocolate.js:20, underbelly-light-base.js:14]; call sites pass `library.wholeMilk` (the value), so the key is not in scope. `strawberry.js:108,206,207` embed `STRAWBERRIES_V1_V2_IER` and `DRIED_STRAWBERRY_V2_IER`, deliberate local definitions.
**How to avoid:** one shared helper in `data/` that takes the key (`embedFromLibrary(name, 'wholeMilk', fields)`) and sets `libraryId`; or derive the key by identity lookup in each `embed`. Give the two inline strawberry definitions `libraryId: null` (Open Question 3). `rowFromLibraryRecord` (`versionRow.js:62-68`) sets `libraryId: record.id`; its header comment ("The record's id ... never enters the row") must be amended. `validateRow` accepts `libraryId` as string or null.

### Pitfall 10: `createBatch` and `createChildVersion` are pure and take no catalog
**What goes wrong:** `createBatch` (`batch.js:175-193`) snapshots rows, `declaredAxes` and `declaredFlaws` only; the seeded `augustSecondBatch` is built at module load from `oliveOilVersion`. Adding the core definitions needs them in scope at module load.
**How to avoid:** the seed constants (`data/core-scales.js`, `data/core-problems.js`) are importable by the seed modules and by `seed.js` (used to seed, not read by the app at run time); `createBatch` takes `catalog` in its options object. `createChildVersion` must `structuredClone(parent.declaredAxes)` once those are objects (`lineage.js:141` shares the reference today).

### Pitfall 11: Walk store dumps differ by design, not by accident
**What goes wrong:** the walk dumps `versions`, `batches`, `recipes` and `drafts` [VERIFIED: 08-walk.mjs:169-209 comments and the `stores.*` expectations]. After Phase 9 every version has `sheetCode`, `equipment.maxFillG`, `rows[].libraryId` and object `declaredAxes`, and every batch snapshot has `coreScales`, `coreProblems` and object `declaredAxes`. A saved-as-new child in the walk gets a code derived from its fixed id (`00000000-0000-4000-8000-000000000001`, from the counter `crypto.randomUUID`), so the expected value is computable.
**How to avoid:** record the before-walk at the base commit before any app change (there is no `08-walk-before.json` in the Phase 8 directory; the baseline `08-walk-check.sh` falls back to is `.planning/milestones/v1.1-phases/05-split-the-recipe-page/05-walk-before.json`, which D-15 says not to reuse). Copy the walk as `09-walk.mjs` and replace whole-snapshot leaf comparison for the store dumps with an allow-list of path patterns, each with its expected added value, and fail on any other difference.

### Pitfall 12: The hook's restore guard
See Pattern 7. A harness copy of the existing test that passes a `version` would pass without exercising the new path; the D-18 contract requires `version: null`.

### Pitfall 13: Stale statements in the repo
`ARCHITECTURE.md` compares heavy cream with the 40% row and says the draft kind needs "No `DB_VERSION` bump"; the first is corrected in Pitfall 5, and the second is moot because the bump to 10 happens anyway. It also says the library is "12" rows in places; the ROADMAP Notes record that the "12" is the olive oil recipe's row count and the library holds 26 entries [VERIFIED: 26 keys counted by keys.mjs].

## Code Examples

### Dairy residual rule and its invariant (verified prototype)
```js
// Source: scratchpad proto.mjs, run this session against the 103 rows.
// Constants are composition.js:6-10 [VERIFIED]: LACTOSE_FRACTION_OF_MSNF = 0.545, PAC_LACTOSE = 100, POD_LACTOSE = 16.
const lactose = msnf_pct * 0.545;
if (msnf_pct > 0) {
  sugar = Math.max(0, sugars_pct - lactose);
  pac = pac - lactose;            // engine adds lactose * PAC_LACTOSE / mass itself (composition.js:43)
  pod = pod - lactose * 0.16;     // engine adds lactose * POD_LACTOSE / mass itself (composition.js:44)
}
// Invariant test: for each converted entry with msnf > 0,
// computeBalance([{ ingredient: entry, portions: [{ step: 1, grams: 100 }] }]) has
// .pac and .pod within a stated tolerance of the dataset's pac and pod.
```
Measured: whole milk 4.61 against 4.6, skim milk powder 52.48 against 52.5, sweetened condensed milk 54.50 against 54.5 and POD 44.00 against 44 [VERIFIED].

### In-transaction clash check (shape)
```js
// Source: pattern from repository.js:158-180 (importAll), applied to codes. Names are discretion.
async createVersion(version) {
  const db = await dbPromise;
  const tx = db.transaction('versions', 'readwrite');
  const done = tx.done;
  try {
    const stored = await tx.store.getAll();
    const problems = sheetCodeProblems(stored, [version]); // pure, domain/sheetCode.js
    if (problems.length > 0) throw new SheetCodeError(problems);
    await Promise.all([tx.store.put(version), done]);
  } catch (error) {
    try { tx.abort(); } catch { /* already finished */ }
    done.catch(() => {});
    throw error;
  }
}
```

### Stored-code lookup (D-06)
```js
// Replaces sheetCode.js:189-199 findVersionsByCode: filter on the stored field, same sort.
return versions.filter((version) => version.sheetCode === wanted).sort(/* createdAt desc, then id */);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Sheet code computed from content on every read (Phase 4 D-08, D-09) | Code stored on the version, derived once from its id | This phase (Mark 2026-10-16, decision 19) | Edits no longer change a printed code; seeded codes pinned |
| Library seeded only into an empty library; never topped up (Phase 6 D-05) | Library cleared on the bump and reseeded | This phase (decision 2) | Larger library reaches existing profiles |
| `declaredAxes` is a list of names resolved against a global `AXES` | A list of definition objects carrying `kind` and `group`; core definitions copied into each batch snapshot | This phase (decisions 3, 5) | A batch reads from its own snapshot |
| Store file schema 8 with four arrays | Schema 9 with four more arrays (machines, styles, scales, problems) | This phase (decision 20) | Older exports refused |

**Deprecated/outdated:** the global `AXES` and `DEFECTS` constants as runtime sources (they become seed data only); `findVersionsByCode` hashing at search time.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Problems stay words (`{ id, name }` rows; `snapshot.coreProblems` is a list of names) rather than keyed objects | Pattern 3 | Phase 10 and 12 would author and read problems in a different shape; a later reshape lifts stored tastings |
| A2 | The dairy PAC and POD residual is `dataset - lactose`, omitted under 0.1, negatives kept; the alternative is clamping to zero | Pattern 5 | Dairy entries with negative residuals (buttermilk, goat milk, sour cream, yogurt, buffalo milk) compute 0.3 to 1.4 PAC points differently from the dataset |
| A3 | Yogurt's inconsistent solids should trust `solids_pct` (14.0) and derive MSNF as solids minus fat (0.105) | Pitfall 7 | Mark may prefer the dataset's 14.2% MSNF; this is a review-list item, not a default |
| A4 | The two inline strawberry definitions take `libraryId: null` | Pitfall 9 | If Mark wants a link to `strawberries`, rows would point at an entry whose figures differ from theirs |
| A5 | The new code derivation hashes a tagged id string with the existing FNV-1a 64 top-40-bit step | Pattern 4 | A different derivation is equally valid; only same id gives same code matters |
| A6 | A unique IndexedDB index is not needed; the in-transaction pure check is enough | Alternatives | A second tab on an older build could write a clashing version; the bump forces old tabs to reload via `blocking`, so low risk |
| A7 | `kind` values `'goldilocks'` and `'magnitude'` and `group` values `'core'`, `'declared'` | Pattern 3 | Names are discretion; the requirement says "goldilocks or plain magnitude" |
| A8 | Playwright WebKit renders the same as Mark's iPad for the side-by-side check | Pattern 8 | The README itself says the iPad and iPhone are unchecked; device confirmation stays with Mark |

## Open Questions

1. **Problem definition shape**
   - What we know: tastings store problem words; `declaredFlaws` is a word list; the context says definitions are copied into the batch snapshot.
   - What's unclear: whether a "definition" of a problem needs more than a name.
   - Recommendation: words (A1). Decide in the plan before Phase 10 authors problems.
2. **Dairy residual policy** (A2)
   - Recommendation: preserve the dataset total, show the flagged rows on the review list for Mark.
3. **`libraryId` on the two inline strawberry rows** (A4)
   - Recommendation: null, allowed by the validator.
4. **The lactose helper line for a non-dairy row with MSNF** (milk chocolate)
   - What we know: the board says the line appears "only for dairy"; the engine applies lactose to any row with MSNF.
   - Recommendation: show the line when `composition.msnf > 0`, and bring this to Sid as a one-line design note, since the boards draw no such entry.
5. **Where the seed codes are stamped** (`seed-recipes.js` or each data file) and the key for dataset ids with dots. Both are plan-level choices, noted in Pattern 4 and Pitfall 7.
6. **Mark's List rows.** `CLAUDE.md` asks that each Mark-facing decision be a row: the library review look row (D-16), closing `todo-place-ingredients` and `todo-place-notebook-rail-link`, and the device check of the two places. The researcher could not read the list in this run; the planner reads it first.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| node | converter, tests, walk | yes | 24.21.0 | none needed |
| npm | tests, build | yes | 11.19.0 | none needed |
| vitest suite | every plan | yes | 5.0.0, 96 files, 3000 tests green | none needed |
| `~/Downloads/sprinkles-ingredient-seed-db.json` | converter | yes | 103 ingredients, `meta.version` "0.2-draft (as-is PAC + legacy merge)" | none (blocking if missing) |
| `~/Downloads/Balance Bands/balance-seed.json` | style bands cross-check | yes | 0.1.0 | the approved note in `.planning/notes/` is the source of record |
| Playwright WebKit | walk and side-by-side checks | yes | `ms-playwright/webkit-2359`; `playwright-core` index at `PLAYWRIGHT_CORE` path exists | refill with `npx -y playwright-core@1.63.0 --version` |
| iPad / iPhone | device confirmation | not testable here | n/a | Mark confirms from the production build (`build` then `preview --host`) |

**Missing dependencies with no fallback:** none.

## Security Domain

`security_enforcement` is true, ASVS level 1, block on high [VERIFIED: .planning/config.json].

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | no accounts, local only |
| V3 Session Management | no | none |
| V4 Access Control | no | single local user |
| V5 Input Validation | yes | The store-file validator is the gate before any write; extend it to the four tables, `sheetCode`, scale definitions, `libraryId`, and `equipment.maxFillG`; collect all errors with paths (existing style) |
| V6 Cryptography | no | The Sheet code hash is an identifier, not a security control; no secret, no signature |
| V8 Data protection | yes | No network call, no external model; the converter runs offline over a local file |
| V12 Files | yes | Import parses JSON the maker chose; a refusal leaves every table unchanged |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Prototype pollution through an imported key or id used as an object key (scale `key` used in `marks`, row ids used in `asMade`, table ids) | Tampering | `scanForUnsafeKeys` over the payload plus explicit refusal of `__proto__`, `constructor`, `prototype` as ids and scale keys; `setMark` already writes by spread and delete [VERIFIED: axes.js:106-114] |
| Imported stored value rendered as markup (dataset `notes`, `sources`, recipe names) | Tampering / XSS | Render as text only; no `dangerouslySetInnerHTML` anywhere under `app/src` (CLAUDE.md; scanned in `RecipePage.shell.test.js`) |
| An import that silently changes an immutable code | Tampering | Refuse a same-id, different-code replacement; refusal leaves every table unchanged (D-04a) |
| A half-applied import | Tampering | One transaction over all eight stores, abort by hand on failure (`importAll` pattern) |
| A damaged seed table opening a half-working app | Denial of service | Boot validation that stops with a message naming the table (D-17) |
| Oversized or hostile text in a library entry | Denial of service | Out of scope for ASVS L1 here; the library is read-only and local |

## Project Constraints (from CLAUDE.md)

Extracted from `./CLAUDE.md` and `./.claude/CLAUDE.md`; the planner verifies each.
- Surgical changes; small reviewable steps; surface structural choices (routing, state, testing) rather than assuming them. The catalog's reach (context versus prop) is a structural choice for the plan to state.
- React with JSX via Vite; **TypeScript is not adopted**; commands `npm --prefix app run dev|build`, `npm --prefix app test`.
- Domain math in framework-free modules under `app/src/domain/`; no framework, DOM or store import; domain tests run in Vitest's `node` environment.
- Every store access goes through `app/src/store/repository.js`; no other module under `app/src` imports `idb`.
- Every visual value reads a CSS custom property from `app/src/styles/tokens.css`; no literals in components or stylesheets.
- No `dangerouslySetInnerHTML` under `app/src`; notes and prose render as text.
- Agent-facing prose, commit messages and browser-test input values are English.
- Device UAT is served from `npm --prefix app run build && npm --prefix app run preview -- --host`, never the dev server; only one Vite process per workspace.
- Every link carries a literal `tabIndex={0}`; every button, checkbox and radio renders through `ui/Button.jsx`, `Checkbox.jsx` or `Radio.jsx` (enforced by `ui/tabindex-scan.test.js`, which cannot see a `select`).
- Impeccable owns design; every edit under `app/` goes through a GSD command; the places consume the approved sketch 012 and are checked side by side in WebKit. The `sketch-findings-sprinkles` skill applies to the two places (type, spacing, 44 px touch floor below 760, 393 must not overflow).
- Phase 9 is v2.0's only `DB_VERSION` change; from Phase 11 on a shape change lifts records.
- Mark's List: read it at the start of work, add rows for decisions, checks and looks, close rows the work finishes, and read timestamps from `date -u` before each write. Defer human checks to end-of-phase UAT when Mark is away (`human_verify_mode: end-of-phase`).

## Sources

### Primary (HIGH confidence)
- Read this session: `app/src/store/db.js`, `repository.js`, `seed.js`, `transfer.js`; `domain/sheetCode.js`, `axes.js`, `battery.js`, `draft.js`, `lineage.js`, `newRecipe.js`, `versionRow.js`, `composition.js`, `batch.js` (createBatch region), `lastEvent.js` (`activeWork`); `ui/useKeptDraft.js`, `SheetCodeSearch.jsx`, `RecipeList.jsx`, `Shell.jsx` (import handler), `Button.jsx`, `FoldRow.jsx`; `router.jsx`, `main.jsx`; `data/library.js`, `olive-oil.js`, `seed-recipes.js`, `batch-2026-08-02.js`; `store/db.test.js`, `tests/db-reset.test.js`, `ui/useKeptDraft.test.jsx` (headers and test names).
- Run this session: the test suite (96 files, 3000 tests passed), `codes.mjs` (19 seeded Sheet codes), `keys.mjs` (18 key collisions, one odd key), `proto.mjs` (converter prototype, dairy invariant, app-versus-dataset diff), Python analysis of the dataset (categories, dairy rows, solids consistency, sources counts).
- `~/Downloads/sprinkles-ingredient-seed-db.json` and `~/Downloads/Balance Bands/balance-seed.json` (read and parsed).
- `.planning/phases/09-.../09-CONTEXT.md`, `09-DISCUSSION-LOG.md`, `.planning/ROADMAP.md` Phase 9 and "Before planning", `.planning/REQUIREMENTS.md`, `.planning/sketches/012-places/README.md` and the three boards' markup and CSS, `.planning/notes/2026-10-16-style-bands-draft.md`, `.planning/research/ARCHITECTURE.md`, `DESIGN.md` places paragraph, `.planning/config.json`.

### Secondary (MEDIUM confidence)
- `.planning/research/SUMMARY.md`, `PITFALLS.md` (cited for lineage only; where they disagree with the code, the code wins, see Pitfall 5 and 13).

### Tertiary (LOW confidence)
- None used. No web source was needed: every question is about this repository or a local file, so the documentation-lookup seam (Context7, web search) was not called.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH, no new package, versions read from `package.json`.
- Architecture: HIGH for what exists and where each change lands; MEDIUM for the recommended definition shapes (A1, A5, A7).
- Pitfalls: HIGH, each one checked against a file read or a command run this session.
- Dataset conversion: HIGH for the rules and invariants (prototype run), MEDIUM for the review-list judgements (A2, A3).

**Research date:** 2026-10-17
**Valid until:** 2026-11-16, or the first change under `app/src/store`, `app/src/domain/axes.js` or the dataset file, whichever comes first.
