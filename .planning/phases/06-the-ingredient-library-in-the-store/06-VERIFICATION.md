---
phase: 06-the-ingredient-library-in-the-store
verified: 2026-10-15T01:05:00Z
status: human_needed
score: 4/4 must-haves verified
covered_files:
  - ".planning/phases/06-the-ingredient-library-in-the-store/06-01-PLAN.md"
  - ".planning/phases/06-the-ingredient-library-in-the-store/06-01-SUMMARY.md"
  - ".planning/phases/06-the-ingredient-library-in-the-store/06-02-PLAN.md"
  - ".planning/phases/06-the-ingredient-library-in-the-store/06-02-SUMMARY.md"
  - ".planning/phases/06-the-ingredient-library-in-the-store/06-03-PLAN.md"
  - ".planning/phases/06-the-ingredient-library-in-the-store/06-03-SUMMARY.md"
  - "app/src/store/db.js"
  - "app/src/store/library.test.js"
  - "app/src/store/repository.js"
  - "app/src/store/seed.js"
  - "app/src/store/transfer.js"
covered_digest: "v3:sha256:6ca0edc04c5e4fea34ddd259b4f4146036b92da06172158265168ee77e9b1a8f"
behavior_unverified: 0
overrides_applied: 0
human_verification:
  - test: "On Mark's iPad, which holds a version-8 profile, build and serve with `npm --prefix app run build && npm --prefix app run preview -- --host` (never the dev server), then open the app."
    expected: "The app opens at database version 9 with every recipe, version and batch it held; Olive Oil's figures read as before."
    why_human: "A real WebKit upgrade of a real profile. fake-indexeddb proves the upgrade logic (db.test.js, library.test.js) but not the device. Nothing on screen shows the library."
---

# Phase 6: The ingredient library in the store Verification Report

**Phase Goal:** The ingredient library lives in the store behind the repository seam, seeded from `data/library.js`, carried by export and import, and a change to it never moves a stored version's or batch's figures
**Verified:** 2026-10-15
**Status:** human_needed (all automated truths verified; one deferred device check)
**Re-verification:** No, initial verification

## Goal Achievement

### Observable Truths (ROADMAP success criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | On an empty database the library is its own object store, seeded from `data/library.js` and read through the seam; outside the seed path no module under `app/src` imports `data/library.js` (tests aside); `idb` imported by `store/db.js` alone | VERIFIED | `db.js` has `DB_VERSION = 9` and a guarded `createObjectStore('library', { keyPath: 'id' })`, no index. `seed.js` calls `repository.seedLibraryIfEmpty(Object.entries(library).map(([id, entry]) => ({ id, entry })))`. Grep of non-test imports of the library data finds only `store/seed.js` and `data/*.js` seed recipe files. `idb` is imported only in `store/db.js`. Seam methods `listLibrary`, `getLibraryEntry`, `putAllLibrary`, `seedLibraryIfEmpty` exist in `repository.js`. Pinned by `library.test.js` "who reads data/library.js, and who imports idb". |
| 2 | A profile left at version 8 opens at 9 with the library store present and holding every seed entry; seeded recipes still open with their figures | VERIFIED | The reset branch `oldVersion > 0 && oldVersion < 8` is untouched (git diff of `db.js` adds only the version number, a comment and the library create). `db.test.js` builds a genuine version-8 database and checks all four records and the `by-version` index survive at 9. `library.test.js` "a profile left at version 8, through the seed" checks the four records unchanged, the full library, and Olive Oil's figures and batch snapshot balance equal. The device leg is the human item below. |
| 3 | Changing a library entry in the store leaves every stored version's figures and every batch's snapshot as they were, proven against real IndexedDB (fake-indexeddb) | VERIFIED | `library.test.js` "changing sucrose in the library leaves every stored version balance, six figures and batch snapshot as they were": seeds, changes sucrose (pac doubled, sugar halved), reads both sides through fresh connections. It is not vacuous: it asserts stored versions and batch snapshots use sucrose and that swapping the changed entry into a row would move PAC. The same figures hold through export and import into a fresh store. |
| 4 | An export carries the library beside recipes, versions and batches (drafts stay on device); importing restores all four in one transaction, and a part-way failure leaves every store as it was | VERIFIED | `exportAll()` reads `['recipes','versions','batches','library']` in one `readonly` transaction (spy test in `repository.test.js`, drafts not read). `exportStore` emits `library` at `STORE_SCHEMA_VERSION = 8`. `validateLibraryRecord` plus the required `$.library` array sit in `validateStoreFile`. `importAll` puts all four stores in one `readwrite` transaction with abort-by-hand on failure; `importStore` passes `library: parsed.library`. Atomic failure and unclonable-record cases are tested in `repository.test.js` and `transfer.test.js`; round-trip and held-seed cases are in `library.test.js`. |

**Score:** 4/4 truths verified (0 behavior-unverified). The behavior-dependent truths (one-transaction atomicity, abort on failure, held seed not overwriting an import) each have a passing named test in the suite.

### Plan-level must-haves

Spot-checked against code: DB_VERSION 9, library keyPath `id` with no index, reset branch text unchanged, `seedLibraryIfEmpty` as one transaction awaiting only the count, the seed's library step running first and the versions guard unchanged, schema 8 with the validator and required `library` array together, and the older-file refusal order (`$.app` line, then `OLDER_EXPORT_MESSAGE`, then `$.schemaVersion`) unchanged. REQUIREMENTS.md line 30 and the Out of Scope storage row now say the bump resets no profile at 8. `git diff f81fe36..HEAD -- app` touches under `app/src/ui` only `BatchRow.test.jsx` and `Shell.flyout.test.jsx`, as planned, and `app/package.json` is unchanged.

### Required Artifacts

| Artifact | Status | Details |
|----------|--------|---------|
| `app/src/store/db.js` | VERIFIED | Version 9, guarded library store, no async or await in upgrade. |
| `app/src/store/repository.js` | VERIFIED | Library methods, `seedLibraryIfEmpty`, four-store `importAll`, `exportAll`. |
| `app/src/store/seed.js` | VERIFIED | Independent library guard via one repository call, run before the versions guard. |
| `app/src/store/transfer.js` | VERIFIED | Schema 8, `validateLibraryRecord`, `exportStore` via `exportAll`, `importStore` passes library. |
| `app/src/store/library.test.js` | VERIFIED | Real-IndexedDB proofs for LIB-01, LIB-02 (store and round-trip legs), LIB-03. |

### Key Link Verification

| From | To | Status |
|------|----|--------|
| `seed.js` | `repository.seedLibraryIfEmpty` | WIRED |
| `repository.js` | `db.js` `library` store | WIRED |
| `transfer.js` | `repository.exportAll()` and `importAll({..., library})` | WIRED |
| `main.jsx` | `seedIfEmpty(repository)` | WIRED (unchanged) |
| `Shell.jsx` | `exportStore` and `importStore` | WIRED (unchanged) |

### Data-Flow Trace (Level 4)

Seed data flows from `data/library.js` through `seedLibraryIfEmpty` into the store, and out through `exportAll` into the file, and back through `importAll`, as the real-IndexedDB round-trip tests show. `listLibrary`, `getLibraryEntry` and `putAllLibrary` have no production caller (review IN-01). That is by design: Phase 7's row builder is the first reader, and nothing on screen reads the library in this phase.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Full suite | `npm --prefix app test -- --run` (run once) | 87 files, 2785 tests passed | PASS |

### Probe Execution

Step 7c: SKIPPED (no probes declared by the phase).

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| LIB-01 | 06-01, 06-02 | Library is an object store behind the seam, seeded on an empty database, then read only as the seed | SATISFIED | Truths 1 and 2 |
| LIB-02 | 06-02, 06-03 | A change to a library entry never moves a stored version's or batch's figures | SATISFIED | Truth 3, store and round-trip legs |
| LIB-03 | 06-03 | Export and import carry the library in the same one-transaction commit | SATISFIED | Truth 4 |

No orphaned requirements: REQUIREMENTS.md maps only LIB-01, LIB-02 and LIB-03 to Phase 6, and all three are claimed by plans.

### Anti-Patterns Found

No TBD, FIXME or XXX markers in the modified store files. Code review findings (06-REVIEW.md, all recorded `open`, none blocking):

| File | Pattern | Severity | Impact |
|------|---------|----------|--------|
| `repository.js:185-196` (WR-01) | `exportAll` leaves `tx.done` unobserved if a read fails | Warning | A failed read could surface a stray rejection. Export still rejects with the read error. |
| `library.test.js:220-231` (WR-02) | The import-scan guard misses some import spellings | Warning | Test-strength gap, not a production defect. Production grep is clean. |
| IN-01 to IN-04 | No production caller yet, triplicated abort handling, hard-coded newer-version number, path-named `$.library` line for older files | Info | None on the goal. |

### Human Verification Required

#### 1. Version-8 profile on the iPad

**Test:** On Mark's iPad, which holds a version-8 profile, run `npm --prefix app run build && npm --prefix app run preview -- --host` (not the dev server) and open the app.
**Expected:** The app opens with every recipe, version and batch it held, and Olive Oil's figures read as before.
**Why human:** A real WebKit upgrade of a real profile. fake-indexeddb cannot prove it. The library half is proven by the version-8 test in `library.test.js`, because nothing on screen shows the library.

Per `CLAUDE.md`, this deferred device check belongs on Mark's List as a `check` row (owner mark, needs hands). I did not add it; the orchestrator should.

### Gaps Summary

No gaps. All four ROADMAP success criteria are met in the code and by passing tests, and all three requirement IDs are accounted for. The status is `human_needed` only because the one deferred iPad check remains.

---

_Verified: 2026-10-15_
_Verifier: Claude (gsd-verifier)_
