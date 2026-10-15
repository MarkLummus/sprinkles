---
phase: 06-the-ingredient-library-in-the-store
reviewed: 2026-10-14T00:00:00Z
depth: standard
files_reviewed: 14
files_reviewed_list:
  - app/src/data/seed-recipes.test.js
  - app/src/store/db.js
  - app/src/store/db.test.js
  - app/src/store/library.test.js
  - app/src/store/repository.js
  - app/src/store/repository.test.js
  - app/src/store/seed-coverage.test.js
  - app/src/store/seed.js
  - app/src/store/seed.test.js
  - app/src/store/transfer.js
  - app/src/store/transfer.test.js
  - app/src/ui/BatchRow.test.jsx
  - app/src/ui/Shell.flyout.test.jsx
  - app/tests/db-reset.test.js
findings:
  critical: 0
  warning: 2
  info: 4
  total: 6
status: issues_found
---

# Phase 6: Code Review Report

**Reviewed:** 2026-10-14
**Depth:** standard
**Files Reviewed:** 14
**Status:** issues_found

## Summary

I read all 14 files and the `f81fe36..HEAD` diff for `app/`. I traced the new transactional paths (`seedLibraryIfEmpty`, `importAll`, `exportAll`, `putAllLibrary`), the version 9 upgrade branch in `db.js`, and the library validator and schema-8 handling in `transfer.js`. I did not run the test suite.

I found no blockers. These points held up:
- **`seedLibraryIfEmpty`:** the emptiness check and the writes share one readwrite transaction. The `false` path awaits `done` before returning. The failure path aborts by hand and quiets every queued request, so there is no stray unhandled rejection and no partial seed.
- **`importAll`:** all four stores are in one readwrite transaction, with the same abort-and-quiet handling. A put that cannot be cloned aborts everything.
- **Version 9 upgrade:** the `oldVersion < 8` reset does not touch `library`, and the guarded `createObjectStore('library')` makes the bump from 8 additive. Version 8 profiles keep their records and the `by-version` index.
- **`validateLibraryRecord`:** the wrapper checks are consistent with `validateRow`. It refuses reserved-name ids, and `scanForUnsafeKeys` covers unsafe keys inside entries. It never throws.
- **Schema handling:** the version 8 gate and `OLDER_EXPORT_MESSAGE` handle version 7 and lower correctly.
- **Project rules:** only `db.js` imports `idb`, and nothing here uses `dangerouslySetInnerHTML`.

One real robustness gap remains in `exportAll` (WR-01), plus one weak guard test (WR-02) and four minor items.

## Warnings

### WR-01: `exportAll` leaves `tx.done` unobserved if a read fails

**File:** `app/src/store/repository.js:185-196`
**Issue:** `importAll`, `putAllLibrary` and `seedLibraryIfEmpty` all take `const done = tx.done` up front and quiet it on failure. `exportAll` does not. `tx.done` is only awaited after `Promise.all(...)` has resolved. If any of the four `getAll()` calls rejects, `Promise.all` throws first. `tx.done` was never subscribed to, and it rejects when the transaction aborts. That surfaces as an unhandled promise rejection, on top of the thrown error the caller sees. The transaction is also not aborted, so the "one moment" snapshot guarantee (D-07a) is not enforced on the error path. The sibling methods were written to avoid exactly this, so `exportAll` is inconsistent with its own file.
**Fix:**
```js
async exportAll() {
  const db = await dbPromise;
  const tx = db.transaction(['recipes', 'versions', 'batches', 'library'], 'readonly');
  const done = tx.done;
  try {
    const [recipes, versions, batches, library] = await Promise.all([
      tx.objectStore('recipes').getAll(),
      tx.objectStore('versions').getAll(),
      tx.objectStore('batches').getAll(),
      tx.objectStore('library').getAll(),
    ]);
    await done;
    return { recipes, versions, batches, library };
  } catch (error) {
    try { tx.abort(); } catch { /* already finished */ }
    done.catch(() => {});
    throw error;
  }
}
```

### WR-02: the "only db.js imports idb / only seed.js reads library.js" guard misses common import spellings

**File:** `app/src/store/library.test.js:220-231`
**Issue:** This test is the executable form of two project rules: the seam rule that only `store/db.js` imports `idb`, and the Phase 6 D-05 rule on who may read `data/library.js`. It matches only single-quoted static imports, `/from\s+'idb'/` and `/from\s+'[^']*\/library\.js'/`. It misses:
- a double-quoted `from "idb"` (a formatter or a new contributor could produce one),
- a dynamic `import('idb')`,
- a side-effect `import 'idb'`,
- subpaths such as `idb/build/...`.

A violation written in any of those forms leaves the test green, so it gives false assurance on a rule that is meant to be enforced. A broken import path, for example a library file renamed in a way that no longer ends in `/library.js`, would also pass silently.
**Fix:** Accept either quote and match dynamic imports and subpaths, for example:
```js
const IDB = /(?:from\s+|import\s*\(\s*|import\s+)['"]idb(?:\/[^'"]*)?['"]/;
const LIBRARY = /(?:from\s+|import\s*\(\s*|import\s+)['"][^'"]*\/library\.js['"]/;
```

## Info

### IN-01: `listLibrary`, `getLibraryEntry` and `putAllLibrary` have no production caller

**File:** `app/src/store/repository.js:96-121`
**Issue:** A grep across `app/src` (excluding tests) finds no caller outside `repository.js`. The comment says `putAllLibrary` "serves the tests that change an entry" and that the seed and import have their own methods. `listLibrary` and `getLibraryEntry` are also test-only. This is deliberate and documented, but it is untested-in-production API surface. CLAUDE.md section 2 asks for no speculative code, so keep it only if a later Phase 6 or ING plan will call it.
**Fix:** Confirm a planned consumer exists (ING-01, for example), or move the test-only writer into the test helpers.

### IN-02: the abort-and-quiet error handling is triplicated

**File:** `app/src/store/repository.js:104-121, 130-152, 158-180`
**Issue:** `putAllLibrary`, `seedLibraryIfEmpty` and `importAll` repeat the same try/catch block (abort by hand, swallow an already-finished abort, quiet every queued request and `done`, rethrow). The copies are exactly what WR-01 shows can drift apart. The next edit will likely patch one and miss the others.
**Fix:** Extract a small module-private helper, such as `async function runWrite(tx, body)`, that owns `done`, the `queued` array and the catch. Each method then supplies only its puts.

### IN-03: `db.test.js` hard-codes the "newer version" number

**File:** `app/src/store/db.test.js:284,292`
**Issue:** The blocking test opens version `10` and asserts `newer.version === 10`, a literal that is `DB_VERSION + 1` today. This commit had to bump it from 9 to 10, and the next `DB_VERSION` bump will force the same edit or break the test.
**Fix:** `const NEWER = DB_VERSION + 1;`, importing `DB_VERSION` (which `db.js` already exports).

### IN-04: a well-formed older (version 7 or lower) file shows a path-named `$.library` error among its refusal lines

**File:** `app/src/store/transfer.js:574-579, 598-602` (pinned by `app/src/ui/Shell.flyout.test.jsx:354-369`)
**Issue:** For an older file the maker sees `OLDER_EXPORT_MESSAGE` first, then `$.schemaVersion: expected 8, got 7`. A version 7 file has no `library`, so a technical `$.library: expected an array` line follows. The plain sentence already says the file cannot be imported, so the extra path lines are noise. `Shell.flyout.test.jsx` now asserts the count of 4 lines, which makes that noise part of the contract. This is the same pattern the earlier `recipes` bump produced.
**Fix:** If the older-file panel should read cleanly, return early after pushing `OLDER_EXPORT_MESSAGE` and the `$.schemaVersion` line for any numeric `schemaVersion` below `STORE_SCHEMA_VERSION`, and skip the shape checks. Otherwise leave it, since it costs nothing but wording.

---

_Reviewed: 2026-10-14_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
