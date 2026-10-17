# Phase 9: The library and the stored shapes, plus the two places - Pattern Map

**Mapped:** 2026-10-17
**Files analyzed:** 26 new/modified
**Analogs found:** 25 / 26 (all analog paths are git-tracked under `app/src/` or `.planning/`)

All paths are relative to `/Users/mark/Documents/projects/sprinkles/app/src/` unless they start with `.planning` or `app/scripts`. RESEARCH.md Patterns 1-9 already hold the design; this map points each file at the real code to copy and quotes the load-bearing lines. Line numbers are from the files as read this session.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match |
|---|---|---|---|---|
| `store/db.js` (mod: v10, reset `< 10`, 4 new stores, exported upgrade fn) | migration/config | schema upgrade | itself, lines 11-61 | exact |
| `store/repository.js` (mod: `seedTableIfEmpty`, `list*`, `createVersion`, `saveVersion`, 8-store `importAll`/`exportAll`) | service (seam) | CRUD, transactional | `seedLibraryIfEmpty` + `importAll` + `exportAll`, lines 130-199 | exact |
| `store/seedTables.js` (new: pure validators for 4 tables) | utility | transform/validate | `validateLibraryRecord` in `store/transfer.js:215-245` | exact |
| `store/transfer.js` (mod: schema 9, new arrays, `validateVersion/Batch` additions) | service | file-I/O, validate | itself | exact |
| `store/seed.js` (mod: seed 5 tables) | service | batch | itself, lines 20-29 | exact |
| `main.jsx` (mod: validate, load catalog before mount) | bootstrap | request-response | itself | exact |
| `data/library-seed-db.js`, `data/library-decisions.js` (new) | data/config | batch | `data/library.js` (entry shape lines 8-18) | exact |
| `data/core-scales.js`, `core-problems.js`, `machines.js`, `styles.js` (new) | data | batch | `domain/axes.js:17-24` (`AXES`), `data/library.js` | role-match |
| `data/seed-sheet-codes.js` (new) | data | batch | `domain/sheetCode.test.js` golden vector (`'64JH-G408'`) + table in RESEARCH Pattern 4 | partial |
| `app/scripts/convert-ingredient-seed.mjs`, `ingredient-mapping.json` (new) | utility (offline) | transform | none in repo (`app/scripts/` does not exist) | none |
| `domain/axes.js`, `domain/battery.js` (mod: lists passed in) | utility (pure) | transform | `axesForBatch`/`axesForVersion`, `axes.js:41-60` | exact |
| `domain/catalog.js` (new, pure helpers) | utility | transform | `domain/axes.js` | role-match |
| `domain/sheetCode.js` (mod: id derivation, `sheetCodeProblems`, stored-field lookup) | utility | transform | itself, lines 105-131, 185-199 | exact |
| `domain/lineage.js` (mod: child code, clone `declaredAxes`) | utility | transform | itself, lines 125-166 | exact |
| `domain/newRecipe.js`, `domain/batch.js`, `domain/versionRow.js` (mod) | utility | transform | themselves | exact |
| `domain/draft.js` (mod: `create` kind, own fit check) | utility | transform | itself (`KINDS`, `draftMatchesVersion`) | exact |
| `domain/ingredientSearch.js` (new: `filterLibrary`) | utility | transform | `domain/sheetCode.js` `findVersionsByCode` (filter+sort, 189-199) | role-match |
| `ui/useKeptDraft.js` (mod: `create` branch) | hook | event-driven, debounce | itself, lines 100-151 | exact |
| `ui/CatalogContext.jsx` (new) + `ui/Shell.jsx` (mod) | provider | pub-sub | `Shell.jsx` `storeRevision` / `handleImportChange` | role-match |
| `ui/IngredientsPlace.jsx` (new) | component | request-response, read-only list | `ui/SheetCodeSearch.jsx` (page shell + filter form) and `ui/FoldRow.jsx` (disclosure) | role-match |
| `ui/NotebookPlace.jsx` (new) | component | request-response, read-only list | `ui/RecipeList.jsx` (+ `domain/lastEvent.js` `activeWork`) | exact |
| `ui/SheetCodeSearch.jsx`, `ui/PrintSheet.jsx`, `ui/PrintSheetPages.jsx` (mod: stored code) | component | request-response | themselves | exact |
| `ui/PrintLogPages.jsx`, `ui/BatchRow.jsx` (mod: catalog arg) | component | request-response | themselves | exact |
| `router.jsx` (mod: replace two Placeholder routes) | route | request-response | lines 123, 126 | exact |
| `store/db.test.js`, `tests/db-reset.test.js` (mod) + 9-to-10 proof | test | real IndexedDB | `db.test.js:60-90` (`seedOldProfile`) | exact |
| `ui/useKeptDraft.test.jsx` (new `create` StrictMode test) | test | hook | existing `useKeptDraft.test.jsx` mocks (lines 17-25) | exact |
| `.planning/phases/09-.../09-walk.mjs` (new) | test (walk) | batch | `.planning/phases/08-split-the-recipe-page-along-its-jobs/08-walk.mjs` | exact |

## Pattern Assignments

### `store/db.js` (migration)

**Analog:** itself. Keep the callback free of `async`; guarded creates stay; destructive branch moves behind `oldVersion < 10` and gains `library`.

Current (db.js:4, 24-29, 54-56):
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
Copy the library store guard for `machines`, `styles`, `scales`, `problems` (`{ keyPath: 'id' }`, no index). Update the two comments (lines 12-23) that describe the bound as "below 8" and the bump to 9 as needing no reset. Export the body as `upgradeStores(db, oldVersion, newVersion, transaction)` for the ratchet test. The `blocking()` handler (lines 74-77) is unchanged and reloads old tabs.

### `store/repository.js` (seam)

**Analog:** `seedLibraryIfEmpty`, `importAll`, `exportAll` (lines 130-199). Generalise to `seedTableIfEmpty(storeName, records)` with an allow-list of the five store names. The transaction shape to copy for every new write (`createVersion`, `saveVersion`, 8-store `importAll`):
```js
const db = await dbPromise;
const tx = db.transaction('library', 'readwrite');
const done = tx.done;
const queued = [];
try {
  if ((await tx.store.count()) > 0) { await done; return false; }
  for (const record of records) queued.push(tx.store.put(record));
  await Promise.all([...queued, done]);
  return true;
} catch (error) {
  try { tx.abort(); } catch { /* already finished */ }
  for (const request of [...queued, done]) request.catch(() => {});
  throw error;
}
```
For `importAll` extend the store list at line 160 and the destructured argument at line 158, and read stored versions inside the same tx (`await tx.objectStore('versions').getAll()`) before queuing puts, then run the pure `sheetCodeProblems`. `exportAll` (185-199) loops `['recipes','versions','batches','library']` in one readonly tx; extend that list and the destructuring. Drafts stay out of export (comment lines 181-184).

### `store/seed.js` (seed)

**Analog:** itself (lines 20-29). Seed the four new tables first (as `seedLibraryIfEmpty` goes first), then recipes and batches, versions last (the versions write flips the emptiness check):
```js
export async function seedIfEmpty(repository) {
  await repository.seedLibraryIfEmpty(Object.entries(library).map(([id, entry]) => ({ id, entry })));
  const existing = await repository.listVersions();
  if (existing.length > 0) return;
  await repository.putAllRecipes(...); await repository.putAllBatches(...); await repository.putAll(...);
}
```
Library seed becomes `{ ...newEntries, ...library }` so an existing key can never be overwritten.

### `store/seedTables.js` and `store/transfer.js` validators

**Analog:** `validateLibraryRecord` (transfer.js:215-245), currently private; export it from the shared module. Idiom to copy: `errors.push(`${path}.field: expected ..., got ${JSON.stringify(v)}`)`, `isPlainObject`, `isNonEmptyString`, `isFiniteNumber`, `UNSAFE_KEYS.has(record.id)` refusal on every table id and on scale `key`. Never throws; collects all errors with paths. Remove the global `AXES`/`DEFECTS` import at transfer.js:11-12 (D-03a); validate marks against the batch's own snapshot. `STORE_SCHEMA_VERSION` (line 29) 8 to 9; `OLDER_EXPORT_MESSAGE` path (lines 34, 577-579) already refuses old files.

### `domain/axes.js` and `domain/battery.js` (pure, lists passed in)

**Analog:** itself. Current global use to change (axes.js:49-60):
```js
export function axesForBatch(batch) {
  const core = AXES.slice(0, CORE_AXIS_COUNT);
  const declared = batch.snapshot.declaredAxes
    .map((name) => AXES.find((axis) => axis.name === name))
    .filter((axis) => axis != null);
  return [...core, ...declared];
}
```
New: `axesForBatch(batch)` = `[...batch.snapshot.coreScales, ...batch.snapshot.declaredAxes]` (no catalog); `axesForVersion(version, catalog)` = catalog core scales then `version.declaredAxes` objects. `STOPS`, `stopWordsFor`, `setMark` (writes by spread/delete, lines 106-114) stay. `AXES` becomes seed data (`data/core-scales.js` re-exports it with `kind`, `id`). Tests (`axes.test.js`) pass lists in directly, in `node`.

### `domain/sheetCode.js`

**Analog:** itself. Reuse and factor (lines 40, 43, 105-131, 189-199):
```js
export const SHEET_CODE_DERIVATION = 'sprinkles-sheet-code:1';
export const CROCKFORD_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
function fnv1a64(bytes) { let hash = FNV_OFFSET_BASIS; for (const byte of bytes) { hash ^= BigInt(byte); hash = (hash * FNV_PRIME) & MASK_64; } return hash; }
export function sheetCode(version) {
  const bytes = new TextEncoder().encode(canonicalPrintedContent(version));
  let bits = fnv1a64(bytes) >> 24n; // top 40 of 64 bits
  let symbols = '';
  for (let i = 0; i < CODE_SYMBOLS; i += 1) { symbols = CROCKFORD_ALPHABET[Number(bits & 31n)] + symbols; bits >>= 5n; }
  return `${symbols.slice(0, 4)}-${symbols.slice(4)}`;
}
```
Extract the "bits to XXXX-XXXX" step into a shared helper; add `codeFromVersionId(id)` with a NEW tag (file header rule: a change is a new tag, never an edit). Keep `sheetCode(version)` and its golden vector `'64JH-G408'` (`sheetCode.test.js:43`). `findVersionsByCode` keeps its sort (createdAt desc, then id) but filters `version.sheetCode === wanted`. Collision fixture precedent: `sheetCode.test.js:249` (`COLLIDING_CODE`, `collider('x259595')`); brute-force a pair for the new derivation.

### `domain/lineage.js`

**Analog:** itself. `createChildVersion` (125-151) builds by hand; add `sheetCode: codeFromVersionId(id)` and change the shared references:
```js
    declaredAxes: parent.declaredAxes,   // -> structuredClone(parent.declaredAxes)
    declaredFlaws: parent.declaredFlaws,
```
`saveOverVersion` (162-166) spreads `...version`, so the code is kept; add the regression test. `newRecipe.js:62-80` `createRecipe` also builds a root version by hand and needs the field.

### `domain/draft.js` and `ui/useKeptDraft.js` (`create` kind, D-18)

**Analog:** itself. Restore effect today (useKeptDraft.js:112-125):
```js
    if (draftRestoreStartedRef.current) return;
    if (!version || version.recipeId !== recipeId || !batchesLoaded || loadFailed) return;
    draftRestoreStartedRef.current = true;
    Promise.resolve()
      .then(() => repository.getDraft(versionId))
      .then((record) => {
        if (!record) { setDraftRestoreDone(true); return; }
        if (!draftMatchesVersion(record, version, batches)) {
          Promise.resolve().then(() => repository.deleteDraft(versionId)).catch(() => {});
          setDraftRestoreDone(true);
          return;
        }
```
Add a `creating` input whose guard is `!draftRestoreStartedRef.current` only, validate with a new version-free `draftMatchesCreate(record)`, call `onRestoreCreate(record.payload)`. Persist effect gains a third branch using `buildDraftRecord({ versionId, kind: 'create', payload, now })`; keep the 250 ms debounce and unmount flush. `draft.js` uses `KINDS = ['plan','record','amend']` (line 47) and `carriesUnsafeKey`; `draft.js:146,165` use global `AXES`/`DEFECTS` and must take the catalog. Test analog: `ui/useKeptDraft.test.jsx:17-25` mocks (`repository`, `getDraft`, `saveDraft`, `deleteDraft`) under StrictMode; pass `version: null`, `batchesLoaded: false`.

### `ui/NotebookPlace.jsx`

**Analog:** `ui/RecipeList.jsx` plus `activeWork` (`domain/lastEvent.js:111-133`, returns `{id, name, latestVersion, versions, batches, ...}` sorted by recency). Reuse the call exactly (same order as Home); link with `notebookPath(entry.id, entry.latestVersion.id)` from `ui/notebookPaths.js`. `batchCountWords` is private at `RecipeList.jsx:187`:
```js
function batchCountWords(count) {
  if (count === 0) return 'not yet made';
  return `${count} batch${count === 1 ? '' : 'es'}`;
}
```
Extract it to a shared module rather than copy. Page shell wrapper: `<div className="list-page place"><h1 className="place__title">`. Every link `tabIndex={0}`. No New recipe, no Resume. Markup classes from `.planning/sketches/012-places/` boards (`nb__list`, `nb__row`, `nb__rail`, `nb__name`, `nb__desc`, `nb__meta`).

### `ui/IngredientsPlace.jsx`

**Analogs:** `ui/SheetCodeSearch.jsx` (lines 60-100: `list-page place` shell, `<label className="notebook-field"><span className="notebook-caption">` plus `input.ink-field`, `storeRevision` effect reading through the repository with a cancelled flag, live-region status) and `ui/FoldRow.jsx` (row-head `Button` with `aria-expanded`/`aria-controls`, 'Show'/'Hide'). Basis words: `ui/IngredientTable.jsx:100` returns `'unreviewed'` for `inherited`. Row heads go through `ui/Button.jsx`; the Category `select` is invisible to `tabindex-scan.test.js`, so give it a literal `tabIndex={0}` and check it in WebKit. Search is `filterLibrary(records, query, category)` in `domain/ingredientSearch.js` (trimmed, case-insensitive `includes` on name, category exact, A to Z case-insensitive; follow the filter-then-sort shape of `findVersionsByCode`). Port board CSS per the 012 README (real media conditions at 760 and 1100, no `.pc1366`/`.pc393` wrappers); reuse existing tokens only.

### `router.jsx`

Replace lines 123 and 126 only:
```jsx
      { path: '/notebook', element: <Placeholder name="Notebook" /> },
      { path: '/ingredients', element: <Placeholder name="Ingredients" /> },
```
Keep `Placeholder.jsx` (recipe-book, idea-log, kitchen still use it; `styles/shell.test.js:314` pins it).

### `store/db.test.js` / `tests/db-reset.test.js`

**Analog:** `db.test.js:60-90` (`seedOldProfile(version, { stores, records })` over raw `indexedDB.open`, `globalThis.indexedDB = new IDBFactory()` in `beforeEach`). Update `toBe(9)` pins (db.test.js 84, 116, 152, 224, 270; db-reset.test.js 98, 169) to `DB_VERSION`, and the "newer version" open at literal 10 (db.test.js ~252-268) to `DB_VERSION + 1`. Add the 9-to-10 proof and the two ratchet tests (behavioural and static scan of `db.js` text; static scan precedent `ui/tabindex-scan.test.js`, `library.test.js:214-266`).

### `09-walk.mjs`

**Analog:** `.planning/phases/08-split-the-recipe-page-along-its-jobs/08-walk.mjs` (tracked). Copy as `09-walk.mjs`; keep the 94 snapshot comparison strict; replace whole-leaf comparison of the store dumps (`versions`, `batches`, `recipes`, `drafts`, ~lines 169-209) with an allow-list of path patterns with expected added values. Record the before-walk at the base commit before any app change.

### `data/library-seed-db.js` (converter output)

**Analog:** `data/library.js` entry shape (lines 8-18): `{ name, category, dairy?, heatTreatment?, densityGPerMl?, composition, basis, source, note? }`. All new figures `basis: 'inherited'`. Rules (stabilizer/emulsifier rows, lactose-once, `dairy` flag, `other` floor) are in RESEARCH Pattern 5; the invariant test is `computeBalance` over 100 g (constants at `domain/composition.js:6-10`).

## Shared Patterns

### Transaction-scoped check-then-write
**Source:** `store/repository.js:130-180` (quoted above). **Apply to:** `seedTableIfEmpty`, `createVersion`, `saveVersion`, `importAll`. Always hold `done`, collect `queued`, abort by hand in catch, quiet rejections.

### Pure functions take lists as arguments
**Source:** `domain/axes.js`, `domain/lastEvent.js` `activeWork(versions, batches, recipes = [])`. **Apply to:** all catalog consumers (`PrintLogPages.jsx:186,195`, `BatchRow.jsx` ~269/624/1052/1091, `draft.js`, `batch.js` `createBatch(..., { id, now, catalog })`). Domain imports no store or framework.

### Validator idiom
**Source:** `store/transfer.js:215-245`. Path-prefixed messages, collect all errors, never throw, refuse `UNSAFE_KEYS` ids/keys.

### Snapshot by structuredClone
**Source:** `domain/lineage.js:146-149` (`structuredClone(penFields.rows)`). **Apply to:** definitions copied into `batch.snapshot`, machine copy on a version (D-13), `declaredAxes` in `createChildVersion`.

### UI constraints
**Source:** `.claude/CLAUDE.md` Conventions. Buttons/checkboxes/radios via `ui/Button.jsx|Checkbox.jsx|Radio.jsx`; links `tabIndex={0}`; every visual value a token; no `dangerouslySetInnerHTML`.

### Seed ordering
**Source:** `store/seed.js:15-29`. Versions written last.

## No Analog Found

| File | Role | Data Flow | Reason |
|---|---|---|---|
| `app/scripts/convert-ingredient-seed.mjs`, `ingredient-mapping.json` | offline tool | transform | `app/scripts/` does not exist; use RESEARCH Pattern 5, Code Examples and the 100 g invariant. Node built-ins only. |
| `data/seed-sheet-codes.js` | data | batch | No precedent for a committed code map; values listed in RESEARCH Pattern 4; guard with a test equal to `sheetCode()` over the seed versions. |
| `ui/CatalogContext.jsx` | provider | pub-sub | No context provider found as a close analog; Shell's `storeRevision` state (Shell.jsx ~325-340) is the nearest hook. Reload catalog before `setStoreRevision`. |

## Metadata

**Analog search scope:** `app/src/store`, `app/src/domain`, `app/src/ui`, `app/src/data`, `router.jsx`, phase 8 walk.
**Files read:** db.js, repository.js (120-199), axes.js (1-60), sheetCode.js and lineage.js excerpts, useKeptDraft.js (100-125), FoldRow.jsx, Placeholder.jsx, SheetCodeSearch.jsx (60-100), transfer.js (215-245), seed.js, db.test.js (60-90), RecipeList.jsx (185-200), lastEvent.js (105-133), router.jsx.
**Pattern extraction date:** 2026-10-17
