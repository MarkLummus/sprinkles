# Phase 6: The ingredient library in the store - Pattern Map

**Mapped:** 2026-10-14
**Files analyzed:** 13 (5 source, 8 test)
**Analogs found:** 13 / 13 (all in-repo, all git-tracked under `app/src/`)

No `app/src/ui` file is touched. All paths below are relative to `app/src/`.

## File Classification

| File | Role | Data Flow | Closest Analog | Match |
|------|------|-----------|----------------|-------|
| `store/db.js` | config (schema) | request-response | itself, guarded `recipes` create (l.41-43) | exact |
| `store/repository.js` | service (seam) | CRUD, batch | `listRecipes/getRecipe/putAllRecipes` (l.68-85) and `importAll` (l.91-112) | exact |
| `store/seed.js` | service | batch | itself (l.12-18) | exact |
| `store/transfer.js` | utility (validate/export/import) | transform | `validateRecipe` (l.186), `validateStoreFile` (l.519-558), `exportStore` (l.564) | exact |
| `data/library.js` | data | none | read only; no edit expected | n/a |
| `store/db.test.js` | test | real IDB | itself: `seedOldProfile` (l.46-69), reset tests (l.98-114) | exact |
| `store/repository.test.js` | test | real IDB | itself: draft tests (l.17-50) | exact |
| `store/seed.test.js` | test | in-memory fake repo | itself: `createInMemoryRepository` (l.8-35) | exact |
| `store/seed-roundtrip.test.js` | test | real IDB | its export/import round-trip (l.~84-100) | exact |
| `store/seed-coverage.test.js` | test | pure | `validateStoreFile` over whole seed (l.70-80) | exact |
| `store/transfer.test.js` | test | in-memory + real IDB | `createInMemoryRepository` l.14-52, `makeStoreFile` l.176-179 | exact |
| `data/seed-recipes.test.js` | test | pure | `validateStoreFile` at l.~64-75 | exact |
| new LIB-02 test (placement is the planner's pick; `store/seed-roundtrip.test.js` fits) | test | real IDB | `domain/composition.test.js:164-172` (in-memory mutation proof) plus roundtrip file | role-match |

## Pattern Assignments

### `store/db.js` (D-01)

Only change: `DB_VERSION = 9` (l.4) and one guarded create, placed after `drafts` (l.47-49). Leave the `oldVersion < 8` branch (l.23) untouched. Add one line to the l.22 comment ("It writes its own lift branch") saying this bump needs neither. Do not import `data/library.js` (D-05).

Copy (l.40-49):
```js
// D-11: the recipe record has no secondary lookup key, so no index.
if (!db.objectStoreNames.contains('recipes')) {
  db.createObjectStore('recipes', { keyPath: 'id' });
}
```
New: `if (!db.objectStoreNames.contains('library')) { db.createObjectStore('library', { keyPath: 'id' }); }`, no index (D-03), no `async` in the callback (l.50-53 comment).

### `store/repository.js` (D-04, D-07, D-07a)

Read/write methods: copy the recipes trio (l.68-85):
```js
async listRecipes() { const db = await dbPromise; return db.getAll('recipes'); },
async getRecipe(id) { const db = await dbPromise; return db.get('recipes', id); },
async putAllRecipes(recipes) {
  const db = await dbPromise;
  const tx = db.transaction('recipes', 'readwrite');
  await Promise.all(recipes.map((recipe) => tx.store.put(recipe)));
  return tx.done;
},
```
New: `listLibrary`, `getLibraryEntry(id)`, `putAllLibrary(records)` (the seed write and the LIB-02 test's changed-entry write; a `putAllLibrary([oneRecord])` serves the test, so no separate `saveLibraryEntry` is needed unless the planner wants it). Names are discretionary (CONTEXT).

`importAll` (l.91-112): extend the destructure to `{ recipes, versions, batches, library }`, the store list to `['recipes','versions','batches','library']`, and add `for (const record of library) queued.push(tx.objectStore('library').put(record));` inside the same `try`. The abort-by-hand catch (l.103-111) already covers the fourth store; keep it verbatim.

New single-transaction read (D-07a), modelled on `importAll`'s transaction setup (l.93):
```js
async readAll() {   // name discretionary
  const db = await dbPromise;
  const tx = db.transaction(['recipes', 'versions', 'batches', 'library'], 'readonly');
  const [recipes, versions, batches, library] = await Promise.all([
    tx.objectStore('recipes').getAll(), tx.objectStore('versions').getAll(),
    tx.objectStore('batches').getAll(), tx.objectStore('library').getAll(), tx.done,  // drop the done slot from the result
  ]);
  ...
}
```
Update the header comment (l.3-4) to name the library store.

### `store/seed.js` (D-04, D-04a, D-05)

Current (l.12-18): single guard `listVersions().length > 0 -> return`, then recipes, batches, versions in that order (versions last flips the check). Change to two independent guards, library written first:
```js
import { library } from '../data/library.js';
...
if ((await repository.listLibrary()).length === 0) {
  await repository.putAllLibrary(Object.entries(library).map(([id, entry]) => ({ id, entry })));
}
const existing = await repository.listVersions();
if (existing.length > 0) return;   // existing body unchanged
```
The `{ id, entry }` wrapper takes `entry` as the library object itself (D-02); the row builder in Phase 7 will `structuredClone(record.entry)`. Update the l.3-11 comment. The emptiness check goes through the repository (as l.13 does).

### `store/transfer.js` (D-06, D-07, D-07a, D-08)

- `STORE_SCHEMA_VERSION = 8` (l.25); also the comments at l.19 and l.512. The older-file gate (l.531-536) needs no change: a 7 file gets `OLDER_EXPORT_MESSAGE` first.
- `validateStoreFile`: add a block copied from the recipes block (l.551-555):
```js
if (!Array.isArray(parsed.recipes)) {
  errors.push('$.recipes: expected an array');
} else {
  parsed.recipes.forEach((recipe, index) => validateRecipe(recipe, `$.recipes[${index}]`, errors));
}
```
  as `$.library` with a new `validateLibraryRecord(record, path, errors)`. `scanForUnsafeKeys` (l.50-69) already runs over the whole payload (l.521), so it covers library entries with no new code.
- Validator shape: copy the "collect-all-errors, path-named" style of `validateRow` (l.94-125), using the existing helpers `isPlainObject` (l.32), `isNonEmptyString` (l.40), `isFiniteNumber` (l.36). Checks (D-08): `isNonEmptyString(record.id)`; `isPlainObject(record.entry)`; `isNonEmptyString(entry.name)`; `isPlainObject(entry.composition)` with every value `isFiniteNumber`. `validateRow` l.106 already does the `ingredient.composition` object check and is the closest excerpt for the composition loop.
- `exportStore` (l.564-575): replace the three reads (l.565-567) with the one new repository method; add `library` to the returned object.
- `importStore` (l.592-646): `getAll()` (l.603) and `listRecipes()` (l.624) are the pre-write resolve gates and stay; change l.642 to pass `library: parsed.library`. The two comments at l.640-641 ("three") update.

### Tests

**`store/db.test.js`** (D-01a). Hard-coded 8s to move to 9: l.79 title and l.81 (`toBe(8)`), l.108, l.188, l.225 title and l.234; also the header (l.1-4) and the "already at 8" test title (l.116), which becomes the version-8-fixture test. Note `holdOpen(7)` (l.226) stays: 7 to 9 still resets. The newer-version test opens `DB_NAME, 9` (l.248) and asserts `newer.version === 9` (l.256): this must become 10, or the "newer" open will not be newer. This one is easy to miss.

Version-8 fixture: reuse `seedOldProfile(8, { stores: ['versions','batches','recipes','drafts'], records: [...] })` (l.46-69, already creates `drafts` with keyPath `versionId` and the `by-version` batches index), then `openStore()` and assert the four records survive and `objectStoreNames.contains('library')`. The reset tests at l.98-114 show the assertion style. Extend the l.109 / l.235 store-name loops with `'library'`.

The "seeded recipes' computed balance figures equal before and after" and "library holds 26 seed entries" assertions need `seedIfEmpty`, which needs a repository, but `db.test.js` imports db.js only (header l.5-8). Put that composite test in `store/seed-roundtrip.test.js` (uses `createRepository` against fake-indexeddb, but its `beforeEach` gives a fresh `IDBFactory`; build the v8 profile by raw `indexedDB.open(DB_NAME, 8)` as `seedOldProfile` does) or export a helper. Planner's call. Reuse `computeBalance(rows)` from `domain/composition.js:22`.

Note: `grep` for `^  name: {` found 23 top-level keys in `data/library.js` by a crude pattern; CONTEXT says 26. Assert against `Object.keys(library).length` rather than a literal 26.

**`store/repository.test.js`**: pattern is `createRepository()` after a fresh `IDBFactory` (l.12-15); a reopen check is `createRepository()` twice (l.20-27). Add library put/list/get, and a test for the one-transaction read method (D-07a).

**`store/seed.test.js`**: `createInMemoryRepository` (l.8-35) is a hand-written fake with only `listVersions`, `putAll`, `putAllBatches`, `putAllRecipes`. It must gain `listLibrary` and `putAllLibrary` or every existing test throws. Add a `library` array and `writes.push('library')`. Four-combination tests (D-04): empty or filled versions x empty or filled library, driven by the constructor argument (currently `initial` versions only; add a second argument).

**`store/transfer.test.js`**: in-memory `createInMemoryRepository` (l.13-52) mirrors `importAll` as upserts; extend its destructure, its `upsert(library, ...)`, a `getLibrary`/read method, and the initial arguments. `makeStoreFile` (l.176-179) must include `library` (default a valid record) and `schemaVersion` follows `STORE_SCHEMA_VERSION`. Hard-coded 7s to move to 8: l.214 area (`expect(exported.schemaVersion).toBe(7)`), l.215 key list (add `'library'`), `expected 7` at l.278, the `it.each([1..6])` older-schema list (l.286, add 7), and the l.294 test title ("schemaVersion 7") and l.805 title. The failing-`importAll` test (l.760-776) shows the storage-failure pattern for the fourth store.

**`store/seed-coverage.test.js` (l.70-80) and `data/seed-recipes.test.js` (~l.64-75)**: both call `validateStoreFile({ app, schemaVersion: STORE_SCHEMA_VERSION, recipes, versions, batches })` and expect `ok`. With `library` required they fail until a `library` list is added to the payload (in each, build it from `Object.entries(library).map(([id, entry]) => ({ id, entry }))`).

**`store/seed-roundtrip.test.js`**: `seededFromStore()` (l.25-33) and the export, validate, import round-trip (l.~84-100) are the base for the "library survives round trip" assertion and for the LIB-02 test: seed, change one library record through `putAllLibrary`, re-read `listVersions()` / `getAllBatches()` from the store, `computeBalance` before and after, then export and import into a fresh `IDBFactory` and compare again.

### LIB-02 existing proof (do not rewrite)

`domain/composition.test.js:164-172` proves in memory that mutating `library.sucrose.composition.pac` after building a version leaves that version's PAC unchanged. It is the Phase 1 analog; the Phase 6 test goes further, through a real store. The mechanism is `embed()` in `data/olive-oil.js:54-60` (and the same helper in strawberry, coconut, standard-base, underbelly-light-base, mexican-chocolate, mocha, pineapple):
```js
function embed(ingredientName, ingredient, fields) {
  return { ingredientName, ingredient: structuredClone(ingredient), ...fields };
}
```
Nothing there changes in Phase 6. `data/library.js` is imported by those eight data files, `data/seed-recipes.test.js`, `domain/composition.test.js` and (new) `store/seed.js`.

## Shared Patterns

- **Seam rule:** only `store/db.js` imports `idb`; only `store/repository.js` calls `openStore`; `seed.js` and `transfer.js` take a `repository` parameter and never open the store. Tests for them use either an in-memory fake (`seed.test.js`, `transfer.test.js`) or the real `createRepository()` over `fake-indexeddb/auto`.
- **fake-indexeddb test boilerplate:** `import 'fake-indexeddb/auto'` first, `import { IDBFactory } from 'fake-indexeddb'`, and `beforeEach(() => { globalThis.indexedDB = new IDBFactory(); })` (`repository.test.js:6-15`, `seed-roundtrip.test.js:9-23`). `db.test.js` instead sets each IDB constructor on `globalThis` by hand (l.28-41) because it must not import `repository.js`.
- **One-transaction bulk put:** `tx = db.transaction(name, 'readwrite'); await Promise.all(items.map((i) => tx.store.put(i))); return tx.done;` (`repository.js:80-85`).
- **Validator style:** collect all errors with `$.path[index]` prefixes, no throws (`transfer.js:94-125`).
- **Conventions to honour:** no literal visual values (n/a here), no `dangerouslySetInnerHTML` (n/a), English commit messages.

## Docs reconciled by D-01 (not code)

`.planning/REQUIREMENTS.md` line 30 and the Out of Scope row at line 58 (per CONTEXT D-01).

## No Analog Found

None. The version-8-fixture test is the only new test shape, and `seedOldProfile` in `db.test.js` already supports it.

## Metadata

**Analog search scope:** `app/src/store/`, `app/src/data/`, `app/src/domain/composition*.js`
**Files scanned:** about 14 read or grepped
**Pattern extraction date:** 2026-10-14
