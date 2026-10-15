---
phase: 06-the-ingredient-library-in-the-store
verified: 2026-10-15T01:25:00Z
status: passed
score: 4/4 must-haves verified
covered_files:
  - ".planning/phases/06-the-ingredient-library-in-the-store/06-01-PLAN.md"
  - ".planning/phases/06-the-ingredient-library-in-the-store/06-01-SUMMARY.md"
  - ".planning/phases/06-the-ingredient-library-in-the-store/06-02-PLAN.md"
  - ".planning/phases/06-the-ingredient-library-in-the-store/06-02-SUMMARY.md"
  - ".planning/phases/06-the-ingredient-library-in-the-store/06-03-PLAN.md"
  - ".planning/phases/06-the-ingredient-library-in-the-store/06-03-SUMMARY.md"
  - "app/src/data/seed-recipes.test.js"
  - "app/src/store/db.js"
  - "app/src/store/db.test.js"
  - "app/src/store/library.test.js"
  - "app/src/store/repository.js"
  - "app/src/store/repository.test.js"
  - "app/src/store/seed-coverage.test.js"
  - "app/src/store/seed.js"
  - "app/src/store/seed.test.js"
  - "app/src/store/transfer.js"
  - "app/src/store/transfer.test.js"
  - "app/src/ui/BatchRow.test.jsx"
  - "app/src/ui/Shell.flyout.test.jsx"
  - "app/tests/db-reset.test.js"
covered_digest: "v3:sha256:3369d2be806b54a841134d4e7033334aa8f8176fa8a9685536dcd9fae5b4a900"
behavior_unverified: 0
overrides_applied: 0
re_verification:
  previous_status: human_needed
  previous_score: 4/4
  gaps_closed:
    - "Version-8 profile on the iPad: recorded pass in 06-UAT.md (status complete, 423d324)"
  gaps_remaining: []
  regressions: []
---

# Phase 6: The ingredient library in the store Verification Report

**Phase Goal:** The ingredient library lives in the store behind the repository seam, seeded from `data/library.js`, carried by export and import, and a change to it never moves a stored version's or batch's figures
**Verified:** 2026-10-15
**Status:** passed
**Re-verification:** Yes, after code review fixes WR-01 (91d7274) and WR-02 (acbaec0) and after the device check was done

## Goal Achievement

### Observable Truths (ROADMAP success criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | On an empty database the library is its own object store, seeded from `data/library.js` and read through the seam; outside the seed path no module under `app/src` imports `data/library.js` (tests aside); `idb` imported by `store/db.js` alone | VERIFIED | `db.js:4` `DB_VERSION = 9`; `db.js:54-56` guarded `createObjectStore('library', { keyPath: 'id' })`, no index. `seed.js:21` calls `repository.seedLibraryIfEmpty(Object.entries(library).map(([id, entry]) => ({ id, entry })))`. Fresh grep of non-test imports of the library data: only `store/seed.js` and the `data/*.js` seed recipe files (strawberry, olive-oil, underbelly-light-base, pineapple, mexican-chocolate, mocha, standard-base, coconut). The only non-test `from 'idb'` is `store/db.js:1`. Seam methods `listLibrary`, `getLibraryEntry`, `putAllLibrary`, `seedLibraryIfEmpty` exist in `repository.js`. The scan guard is pinned in `library.test.js`, and WR-02 widened it to every import spelling. |
| 2 | A profile left at version 8 opens at 9 with the library store present and holding every seed entry; seeded recipes still open with their figures | VERIFIED (code and tests; device leg human-verified) | The reset branch is still `if (oldVersion > 0 && oldVersion < 8)` (`db.js:24`); the bump adds only the guarded library create. `db.test.js` builds a genuine version-8 database and checks its records and the `by-version` index survive at 9. `library.test.js` runs the version-8 profile through the seed and checks the four records unchanged, the full library, and Olive Oil's figures and batch snapshot balance equal. Device: 06-UAT.md test 1 (iPad, version-8 profile, built and previewed) `result: pass`, UAT status complete. |
| 3 | Changing a library entry in the store leaves every stored version's figures and every batch's snapshot as they were, proven against real IndexedDB (fake-indexeddb) | VERIFIED | `library.test.js` changes sucrose (pac doubled, sugar halved) in a real fake-indexeddb store and reads both sides through fresh connections. It is not vacuous: it asserts stored versions and batch snapshots use sucrose and that swapping the changed entry into a row would move PAC. The same figures hold through a whole export, validate and import into a fresh store. |
| 4 | An export carries the library beside recipes, versions and batches (drafts stay on the device); importing restores all four in one transaction, and a part-way failure leaves every store as it was | VERIFIED | `repository.js` `exportAll()` reads `['recipes','versions','batches','library']` in one `readonly` transaction and never names drafts; after WR-01 a failed read aborts the transaction and quiets the queued reads and `tx.done` (new test at `repository.test.js:188` rejects with the read error). `transfer.js` `STORE_SCHEMA_VERSION = 8`, `exportStore` calls `repository.exportAll()`, `validateLibraryRecord` plus required `$.library` array in `validateStoreFile` (lines 598-601), older-file refusal (`OLDER_EXPORT_MESSAGE`) kept ahead of the `$.schemaVersion` line. `importAll` puts all four stores in one `readwrite` transaction with abort-by-hand and quieting; `importStore` passes `library: parsed.library`. Atomic failure and unclonable-record cases tested in `repository.test.js:110-143` and `transfer.test.js`. |

**Score:** 4/4 truths verified (0 behavior-unverified). The behavior-dependent truths (one-transaction atomicity, abort on failure, held seed not overwriting an import, interrupted and parallel seeds) each have a passing named test, and the full suite is green.

### Plan-level must-haves and prohibitions

Spot-checked at HEAD: DB_VERSION 9 with library keyed by `id`, no index; reset branch text unchanged (prohibition holds); `db.js` imports no data module and writes no record; `seedLibraryIfEmpty` is a single transaction (count, then conditional puts) and the seed's library step runs before the versions guard, which is unchanged; no top-up of a filled library (prohibition holds); schema 8 with validator and required `library` array; no TBD, FIXME or XXX markers in the modified store files. `git diff f81fe36..HEAD -- app` touches under `app/src/ui` only `BatchRow.test.jsx` and `Shell.flyout.test.jsx`, as planned. REQUIREMENTS.md marks LIB-01 to LIB-03 complete.

### Required Artifacts

| Artifact | Status | Details |
|----------|--------|---------|
| `app/src/store/db.js` | VERIFIED | Version 9, guarded library store, no data import. |
| `app/src/store/repository.js` | VERIFIED | Library methods, `seedLibraryIfEmpty`, four-store `importAll`, `exportAll` with abort-and-quiet on failure. |
| `app/src/store/seed.js` | VERIFIED | Independent library guard via one repository call, run before the versions guard. |
| `app/src/store/transfer.js` | VERIFIED | Schema 8, `validateLibraryRecord`, `exportStore` via `exportAll`, `importStore` passes library. |
| `app/src/store/library.test.js` | VERIFIED | Real-IndexedDB proofs for LIB-01, LIB-02 (store and round-trip legs), LIB-03; import-scan guard widened by WR-02. |

### Key Link Verification

| From | To | Status |
|------|----|--------|
| `seed.js` | `repository.seedLibraryIfEmpty` | WIRED |
| `repository.js` | `db.js` `library` store | WIRED |
| `transfer.js` | `repository.exportAll()` and `importAll({..., library})` | WIRED |
| `main.jsx` | `seedIfEmpty(repository)` | WIRED (unchanged) |
| `Shell.jsx` | `exportStore` and `importStore` | WIRED (unchanged) |

### Data-Flow Trace (Level 4)

Seed data flows from `data/library.js` through `seedLibraryIfEmpty` into the store, out through `exportAll` into the file, and back through `importAll`, as the real-IndexedDB round-trip tests show. `listLibrary`, `getLibraryEntry` and `putAllLibrary` have no production caller (review IN-01). That is by design: Phase 7's row builder is the first reader, and nothing on screen reads the library in this phase.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Full suite | `npm --prefix app test -- --run` (run once) | 87 files, 2786 tests passed | PASS |

### Probe Execution

Step 7c: SKIPPED (no probes declared by the phase).

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| LIB-01 | 06-01, 06-02 | Library is an object store behind the seam, seeded on an empty database, then read only as the seed | SATISFIED | Truths 1 and 2 |
| LIB-02 | 06-02, 06-03 | A change to a library entry never moves a stored version's or batch's figures | SATISFIED | Truth 3, store and round-trip legs |
| LIB-03 | 06-03 | Export and import carry the library in the same one-transaction commit | SATISFIED | Truth 4 |

No orphaned requirements: REQUIREMENTS.md maps only LIB-01, LIB-02 and LIB-03 to Phase 6, and all three are claimed by plans.

### Security and Review

- 06-SECURITY.md: status verified, 16 of 16 threats closed, `threats_open: 0`.
- 06-REVIEW-DISPOSITION.md: WR-01 and WR-02 fixed (91d7274, acbaec0, both confirmed in code and tests above); IN-01 to IN-04 info findings remain `open`, none a must-have failure.

### Anti-Patterns Found

None blocking. No debt markers in modified files.

| File | Pattern | Severity | Impact |
|------|---------|----------|--------|
| IN-01 | `listLibrary`, `getLibraryEntry`, `putAllLibrary` have no production caller | Info | By design until Phase 7. |
| IN-02 | Abort-and-quiet handling is triplicated in `repository.js` | Info | Maintainability only. |
| IN-03 | `db.test.js` hard-codes the "newer version" number | Info | Test upkeep at the next bump. |
| IN-04 | A well-formed older file shows a path-named `$.library` line among its refusal lines | Info | Cosmetic. |

### Human Verification

The single human check is done. 06-UAT.md test 1, "Version-8 profile on the iPad": the app opens at database version 9 with every recipe, version and batch it held, and Olive Oil's figures read as before. Result: `pass` (status complete, committed 423d324). No other item needs a human.

### Gaps Summary

No gaps. All four ROADMAP success criteria hold at HEAD and by passing tests, all three requirement IDs are accounted for, the review warnings are fixed, security is closed, and the iPad check passed.

---

_Verified: 2026-10-15_
_Verifier: Claude (gsd-verifier)_
