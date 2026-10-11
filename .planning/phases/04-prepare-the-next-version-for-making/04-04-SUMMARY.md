---
phase: 04-prepare-the-next-version-for-making
plan: 04
subsystem: store
tags: [indexeddb, db-version-8, drafts-store, repository-seam, import-transaction, d16]

requires:
  - phase: 04-03
    provides: "The 04-03 record shapes (declared problem lists, At draw, From freezer) that the 8 bump reseeds into every profile; DB_VERSION left untouched for this plan"
provides:
  - "DB_VERSION 8: a profile below 8 drops versions, batches, recipes and drafts and recreates them, then seedIfEmpty reseeds"
  - "A drafts object store keyed by versionId, reached only through repository.getDraft, saveDraft, deleteDraft, listDrafts"
  - "repository.importAll({ recipes, versions, batches }): one readwrite transaction, aborted on any failed put"
  - "transfer.js IMPORT_STORAGE_ERROR; importStore returns it instead of throwing"
affects: [04-09, 04-05, 04-07]

actuals:
  tokens: 8400
  tasks: 2
  commits: 2
plan_head_before: 527cb3f01fa98f0b5ab35f09fb262781e90922d5
plan_head_after: 7d5c918c0bf2d52c1741f8f9edac0e06437a6879
commits: 2

tech-stack:
  added: []
  patterns:
    - "A DB bump resets only profiles below its own number (oldVersion < 8, a literal rather than DB_VERSION), so a later bump cannot inherit the wipe and writes its own lift branch"
    - "A multi-store write opens one transaction, keeps every queued request, and on failure aborts by hand and quiets the rejected requests, because an uncloneable put throws before it queues and would otherwise leave the earlier puts to commit"
    - "importStore wraps each store call and returns { ok: false, errors: [IMPORT_STORAGE_ERROR] }, so Shell renders a storage failure through the path it already uses for every refusal"

key-files:
  created:
    - app/src/store/repository.test.js
  modified:
    - app/src/store/db.js
    - app/src/store/db.test.js
    - app/tests/db-reset.test.js
    - app/src/store/repository.js
    - app/src/store/transfer.js
    - app/src/store/transfer.test.js
    - app/src/ui/BatchRow.test.jsx

key-decisions:
  - "The reset condition is the literal oldVersion < 8, not oldVersion < DB_VERSION: bounded to profiles below 8 on purpose (D-16 as corrected by research C3; Mark's standing rule is reset, not migrate, while no live data exists)"
  - "Drafts stay on the device: exportStore reads no drafts and STORE_SCHEMA_VERSION stays 7"
  - "importAll aborts the transaction by hand on a failed put; fake-indexeddb proved the abort is load-bearing (removing it fails the stores-unchanged test)"

patterns-established:
  - "Tests that need a real store import fake-indexeddb/auto first and give each test a fresh IDBFactory"
  - "The in-memory repository fixtures in transfer.test.js and BatchRow.test.jsx mirror importAll (upsert by id across the three stores)"

requirements-completed: [UX1-02, UX1-03]

coverage:
  - id: D1
    description: "DB_VERSION is 8 and a profile at 7 holding a version and a batch comes back with versions, batches, recipes and drafts present and empty; the reseed keeps the six figures and mass unmoved"
    requirement: UX1-02
    verification:
      - kind: unit
        ref: "app/src/store/db.test.js#resets a database first opened at version 7 (one version, one batch) to all four stores, empty"
        status: pass
      - kind: unit
        ref: "app/tests/db-reset.test.js#seedIfEmpty writes the seed back after the reset, and the six figures and mass read unmoved"
        status: pass
    human_judgment: false
  - id: D2
    description: "The reset is bounded: a profile already at 8 keeps its version and its draft when opened again"
    requirement: UX1-02
    verification:
      - kind: unit
        ref: "app/src/store/db.test.js#already at 8 keeps its records: a version and a draft survive a second open"
        status: pass
    human_judgment: false
  - id: D3
    description: "A draft saved through the repository seam survives a reopen of the store; listDrafts and deleteDraft work"
    requirement: UX1-02
    verification:
      - kind: unit
        ref: "app/src/store/repository.test.js#saveDraft then getDraft returns a structurally equal record after the store is reopened"
        status: pass
    human_judgment: false
  - id: D4
    description: "The export carries exactly app, schemaVersion, exportedAt, versions, batches, recipes and no draft"
    requirement: UX1-02
    verification:
      - kind: unit
        ref: "app/src/store/transfer.test.js#writes exactly the file keys and no draft anywhere in the result"
        status: pass
    human_judgment: false
  - id: D5
    description: "An import is one transaction: a batch the store cannot clone rejects importAll and recipes, versions and batches hold exactly what they held before"
    requirement: UX1-03
    verification:
      - kind: unit
        ref: "app/src/store/repository.test.js#rejects when a batch cannot be cloned, and all three stores hold exactly what they held before"
        status: pass
    human_judgment: false
  - id: D6
    description: "A storage failure during an import returns ok false with Couldn’t save this file. Nothing was changed. rather than throwing (importAll, getAll and listRecipes rejections)"
    requirement: UX1-03
    verification:
      - kind: unit
        ref: "app/src/store/transfer.test.js#importStore, a storage failure reads in words"
        status: pass
    human_judgment: false
  - id: D7
    description: "The sentence shows in the import panel, in words and never colour alone"
    requirement: UX1-03
    verification: []
    human_judgment: true
    rationale: "Shell.jsx is unchanged and already renders result.errors in the Import error panel; the unit tests prove importStore returns the sentence, but only a look at the panel on a real failure proves how it reads"

duration: 3min
completed: 2026-10-11
status: complete
---

# Phase 4 Plan 04: Drafts store and atomic import Summary

**DB_VERSION 8 with a bounded reset and a drafts store keyed by versionId behind the repository seam, plus a one-transaction import that reports a storage failure as one sentence in the import panel**

## Performance

- **Duration:** 3 min
- **Started:** 2026-10-11T06:25:45Z
- **Completed:** 2026-10-11T06:27:55Z
- **Tasks:** 2 (one tracer, one auto)
- **Files modified:** 8 (1 created)

## Accomplishments

- The store is at 8. A profile below 8 drops versions, batches, recipes and drafts and recreates them, and `seedIfEmpty` reseeds with 04-03's shapes. The condition is the literal `oldVersion < 8`, so a later bump cannot inherit the wipe and must write its own branch.
- `drafts` is an object store keyed by `versionId`. The repository gained `getDraft`, `saveDraft`, `deleteDraft` and `listDrafts`; only `db.js` imports `idb`. A draft survives a second `createRepository()` over the same database.
- Drafts stay on the device: `exportStore` is unchanged, `STORE_SCHEMA_VERSION` stays 7, and a test with a stored draft shows the export holds exactly the six file keys and no trace of it.
- `repository.importAll` writes recipes, versions and batches in one readwrite transaction. `importStore` now makes one `importAll` call and no `putAll*` call.
- A storage failure on any of the three store calls (`getAll`, `listRecipes`, `importAll`) returns `{ ok: false, errors: [IMPORT_STORAGE_ERROR] }`. Shell needed no change.

## Task Commits

1. **Task 1 (tracer): one store bump, drafts behind the seam, export carries no draft** - `807ae15` (feat)
2. **Task 2: an import is one transaction, and a storage failure reads in the import panel** - `7d5c918` (feat)

Tracer gate: the Task 1 verify (db, db-reset, repository, transfer, seed, seed-roundtrip) passed end to end before Task 2 began, and the full suite stayed green; the plan has no `gate="blocking-human"` and the tracer carries only an automated verify.

## Files Created/Modified

- `app/src/store/db.js` - DB_VERSION 8, the bounded reset including drafts, the guarded drafts store
- `app/src/store/repository.js` - draft methods and `importAll`
- `app/src/store/transfer.js` - `IMPORT_STORAGE_ERROR`; `importStore` through `importAll`, store calls wrapped
- `app/src/store/repository.test.js` - new: drafts survive a reopen; `importAll` writes all three and an uncloneable batch leaves all three unchanged
- `app/src/store/db.test.js`, `app/tests/db-reset.test.js` - version expectations at 8; the 7 reset; the "already at 8 keeps its records" bound
- `app/src/store/transfer.test.js` - export carries no draft; storage-failure sentence; seeded export round-trips through a real repository; in-memory fixture mirrors `importAll`
- `app/src/ui/BatchRow.test.jsx` - its in-memory repository fixture now offers `importAll`

## Decisions Made

- Bounded reset as a literal `8`, not `DB_VERSION` (plan decision, recorded in the db.js comments).
- The `importAll` catch aborts the transaction itself. An uncloneable value makes `put` throw synchronously before it queues, which leaves the transaction open with the earlier puts queued; without the abort they commit. Verified by removing the abort: the stores-unchanged test fails.
- The one transaction spans `recipes`, `versions` and `batches` only; `drafts` is never part of an import.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] BatchRow.test.jsx in-memory repository needed importAll**
- **Found during:** Task 2
- **Issue:** its round-trip test (`importStore` into a hand-built repository) mirrored `putAll*`, which `importStore` no longer calls, so the import would have thrown on a missing method. The file was not in the plan's `files_modified`.
- **Fix:** replaced the three `putAll*` stubs with one `importAll` stub that merges the three lists.
- **Files modified:** app/src/ui/BatchRow.test.jsx
- **Verification:** full suite green
- **Committed in:** 7d5c918

**2. [Rule 1 - Bug] First importAll left unhandled AbortError rejections**
- **Found during:** Task 2
- **Issue:** the first draft built its put list with `Promise.all(map(...))`; when the batch put threw, the earlier puts' request promises were orphaned and rejected with AbortError after the abort, failing the run with 2 unhandled errors.
- **Fix:** keep every queued request and attach a no-op catch to each in the failure path.
- **Files modified:** app/src/store/repository.js
- **Verification:** full suite reports no unhandled errors
- **Committed in:** 7d5c918 (before commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Neither widens scope; both keep the plan's own acceptance criteria true.

## Issues Encountered

None beyond the deviations. Baseline 2104 tests became 2121 (68 files); `npm --prefix app run build` exits 0.

## Authentication Gates

None.

## Known Stubs

None. The drafts store has no caller yet by design: 04-09 wires the pens to it.

## Threat Flags

None. The new surface (the drafts store) is local to the device, is read only through the seam, and never reaches the export (T-04-12, tested).

## Deferred Human Verification

human_judgment: true for D7 (the sentence in the import panel). Mark is away, so this is deferred to end-of-phase UAT:

- Open the app on the build (`npm --prefix app run build && npm --prefix app run preview -- --host`) and force a storage failure on import (for example, an import file big enough to exceed the browser quota, or a device in private browsing). Expect the Import error panel to read "Couldn’t save this file. Nothing was changed." in words, not colour alone, with nothing added to the store.
- Open the app once on the device after this build: the profile resets and reseeds (expected, no live data).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- 04-09 can wire the pens to `getDraft`, `saveDraft`, `deleteDraft` and `listDrafts`.
- No further DB bump is planned in Phase 4. A later bump must add its own branch; the reset here is closed to profiles below 8.

## Self-Check: PASSED

- FOUND: app/src/store/repository.test.js; FOUND commits 807ae15 and 7d5c918 on main (ancestors of HEAD)
- Acceptance: db.js holds `DB_VERSION = 8`, `createObjectStore('drafts', { keyPath: 'versionId' })` and `oldVersion < 8`; `grep -rl "from 'idb'" app/src` prints only db.js; transfer.js exports the exact `IMPORT_STORAGE_ERROR`, calls `importAll` once and no `putAll*`
- `npm --prefix app test -- --run`: 68 files, 2121 tests, 0 failing; `npm --prefix app run build` exits 0

---
*Phase: 04-prepare-the-next-version-for-making*
*Completed: 2026-10-11*
