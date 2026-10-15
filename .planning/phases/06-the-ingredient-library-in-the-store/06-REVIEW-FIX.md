---
phase: 06-the-ingredient-library-in-the-store
fixed_at: 2026-10-14T00:00:00Z
review_path: .planning/phases/06-the-ingredient-library-in-the-store/06-REVIEW.md
iteration: 1
findings_in_scope: 2
fixed: 2
skipped: 0
status: all_fixed
---

# Phase 6: Code Review Fix Report

**Fixed at:** 2026-10-14
**Source review:** .planning/phases/06-the-ingredient-library-in-the-store/06-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 2
- Fixed: 2
- Skipped: 0

Verification ran in the main checkout (`use_worktrees` not used; edits on `main`). Full suite after each fix: 87 test files, 2786 tests, all passing (baseline 2785 plus the one new test). The four Info findings were out of scope and left alone.

## Fixed Issues

### WR-01: `exportAll` leaves `tx.done` unobserved if a read fails

**Files modified:** `app/src/store/repository.js`, `app/src/store/repository.test.js`
**Commit:** 91d7274
**Applied fix:** `exportAll` now takes `const done = tx.done` up front, keeps every queued read in a `queued` array, and on failure aborts the transaction and quiets `[...queued, done]` before rethrowing, mirroring `importAll`, `putAllLibrary` and `seedLibraryIfEmpty`. This goes one step past the review's suggested snippet: the review's version still left the already-queued `getAll` requests unhandled when a later read threw (the new test caught three `AbortError` unhandled rejections with the snippet as written), so the reads are collected and quieted as the siblings do. New test makes the library `getAll` throw and checks that the call rejects, `IDBTransaction.abort` is called once, and no `unhandledRejection` fires. It fails against the old code (abort never called) and passes now.

### WR-02: the "only db.js imports idb / only seed.js reads library.js" guard misses common import spellings

**Files modified:** `app/src/store/library.test.js`
**Commit:** acbaec0
**Applied fix:** Replaced the two single-quote-only regexes with `IDB_IMPORT` and `LIBRARY_IMPORT`, which accept either quote and match `from '...'`, side-effect `import '...'`, dynamic `import('...')` and `idb/...` subpaths. The test passes on the current tree. A temporary non-test file under `app/src/ui/` containing each of a double-quoted `from "idb"`, a dynamic `import('idb')`, a side-effect `import 'idb'`, a `"idb/build/index.js"` subpath, and a double-quoted `library.js` import made the guard fail each time; the file was removed afterward.

---

_Fixed: 2026-10-14_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
