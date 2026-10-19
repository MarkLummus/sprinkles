---
phase: 09-the-library-and-the-stored-shapes-plus-the-two-places
plan: 14
subsystem: store
tags: [store-file, import, validation, batch-snapshot, catalog, indexeddb, vitest]
status: complete
requires:
  - phase: 09-the-library-and-the-stored-shapes-plus-the-two-places
    provides: "09-13 snapshot.coreScales and snapshot.coreProblems on every batch, createBatch takes a catalog; 09-10 schema 9 store file, import pre-checks, storeFileOf; 09-11 loadCatalog; 09-08 validateDeclaredAxes with core keys"
provides:
  - "validateBatch requires snapshot.coreScales (exactly CORE_SCALE_COUNT isScaleDefinition values, group 'core', unique keys) and snapshot.coreProblems (unique non-empty words), each failure path-named"
  - "validateTasting judges marks against the keys of the batch's own snapshot.coreScales and declaredAxes, and defects against snapshot.coreProblems; a malformed list is read through a guard and reported once by validateBatch"
  - "A batch's declared scales are held to the keys of its own snapshot.coreScales; a version keeps the file's own scales table (plan 09-10)"
  - "transfer.js imports no defect list or axis table from the domain; it keeps SEGMENT_OPTIONS and MARK_ONE_OPTIONS"
  - "definition-roundtrip.test.js: a magnitude scale and a renamed Oil through creation, export, import and reopening; a batch recorded after an accepted promotion and after a refused duplicate-name import each export, validate and import"
affects: [09-15, 09-16]
actuals:
  tokens: 9000
  tasks: 2
  commits: 2
plan_head_before: 5e963bf072bb51c9c2310b46cc1afaa8ee92f3c1
plan_head_after: 57515d63ae17e1cc81fbb7e3d197b2e2b63893a1
tech-stack:
  added: []
  patterns:
    - "a batch is valid by the definitions it carries: the validator reads only the batch's snapshot and never the receiving profile's tables (D-03a)"
    - "unvalidated nested lists are read through a non-throwing guard (snapshotKeys, snapshotCoreProblems) and their own errors are reported once, at the list's path"
key-files:
  created:
    - app/src/store/definition-roundtrip.test.js
  modified:
    - app/src/store/transfer.js
    - app/src/store/transfer.test.js
key-decisions:
  - "validateBatch no longer takes the file's core keys: a batch's declared scales are checked against snapshotKeys(snapshot.coreScales); validateStoreFile still passes the file's scales-table keys to versions only"
  - "A mark on a key outside the snapshot reports an extra path-named line beside any value error, so a bad key is named even when its value is also bad"
requirements-completed: [TASTE-03]
coverage:
  - id: D1
    description: "Import judges each batch by its own snapshot: core scales (exactly four, unique, group core), core problem words, marks on snapshot keys only, defects from the snapshot's words; the receiving profile's tables are never read"
    requirement: TASTE-03
    verification:
      - kind: unit
        ref: "app/src/store/transfer.test.js#a batch is judged by its own snapshot (D-03a)"
        status: pass
    human_judgment: false
  - id: D2
    description: "From freezer's exclusion is unchanged against the snapshot-sourced lists"
    requirement: TASTE-03
    verification:
      - kind: unit
        ref: "app/src/store/transfer.test.js#a batch is judged by its own snapshot (D-03a) > From freezer's exclusion reads the tasting's own marks and words (T-04-08)"
        status: pass
    human_judgment: false
  - id: D3
    description: "A magnitude scale (minted key) and a renamed Oil (key oil) keep their definitions, kind included, and every mark on its key through createVersion, saveBatch, export, JSON round trip, import into a fresh profile and a reopened store"
    requirement: TASTE-03
    verification:
      - kind: integration
        ref: "app/src/store/definition-roundtrip.test.js#keeps every definition, its kind included, and every mark on its key"
        status: pass
    human_judgment: false
  - id: D4
    description: "A catalog the app accepts records batches its own validator accepts: after an accepted promotion (sweetness demoted, creaminess core) and after a refused duplicate-name import, a batch recorded from loadCatalog's catalog exports, validates and imports"
    requirement: TASTE-03
    verification:
      - kind: integration
        ref: "app/src/store/definition-roundtrip.test.js#records a batch from an accepted promotion: its export validates and imports into a fresh profile"
        status: pass
      - kind: integration
        ref: "app/src/store/definition-roundtrip.test.js#records a batch after a refused duplicate-name import: it snapshots the four seeded words once each and exports"
        status: pass
    human_judgment: false
  - id: D5
    description: "A malformed coreProblems (null or 7) beside a tasting with a defect is refused with errors and validateStoreFile does not throw"
    requirement: TASTE-03
    verification:
      - kind: unit
        ref: "app/src/store/transfer.test.js#refuses a snapshot whose coreProblems is %s beside a tasting with a defect, with errors and no throw"
        status: pass
      - kind: integration
        ref: "app/src/store/definition-roundtrip.test.js#refuses a batch whose snapshot holds a malformed coreProblems list without throwing"
        status: pass
    human_judgment: false
---

# Phase 9 Plan 14: Import judges each batch by its own snapshot Summary

**validateBatch and validateTasting now read a batch's core scales, problem words, mark keys and defects from the batch's own snapshot (exactly four core scales, guarded lists), transfer.js drops the domain's defect list, and a magnitude scale and a renamed Oil are proven to survive creation, export, import and a reopen.**

## Performance

- **Tasks:** 2 (Task 1 tracer, Task 2 auto/tdd)
- **Files:** 3 (1 created, 2 modified)
- **Suite:** 112 files, 3450 tests passing (baseline 111 files, 3429; +21 cases: 16 in transfer.test.js, 5 in definition-roundtrip.test.js)

## Accomplishments

- **Snapshot-based import checks (Task 1):** `validateBatch` requires `snapshot.coreScales` (an array of exactly `CORE_SCALE_COUNT` `isScaleDefinition` values with group `core`, each key once) and `snapshot.coreProblems` (unique non-empty strings), through two small validators, `validateCoreScales` and `validateCoreProblems`. Errors are path-named (`$.batches[i].snapshot.coreScales[j]`, `...coreProblems`).
- **Marks and defects from the snapshot:** `validateTasting` takes the allowed mark keys from `snapshotKeys(coreScales) + snapshotKeys(declaredAxes)` and refuses a mark on any other key (`mystery`, or `body` on a batch that declares no Body) though the receiving tables hold it. Defects are checked against `snapshotCoreProblems(snapshot)`: a word the snapshot holds imports even when the receiving problems table lacks it. Both readers keep only well-formed entries and never throw, so a `null` or numeric `coreProblems`, or a `null` `coreScales`, is reported once by `validateBatch` and not again by `validateTasting`.
- **Dual core-key source (kept):** a batch's declared scales are held to its own snapshot's core keys; a version's stay held to the file's scales table (plan 09-10).
- **Constants gone:** `DEFECTS` is no longer imported by `transfer.js` (the axis table was already gone from plan 09-10). It keeps `SEGMENT_OPTIONS` and `MARK_ONE_OPTIONS`. Doc comments for `validateMarks`, `validateTasting` and `validateBatch` were rewritten.
- **From freezer exclusion unchanged:** it still reads the tasting's own marks, defects and declared defects; two cases pin it against the snapshot-sourced lists.
- **Definition round trip (Task 2):** a child of the stored olive oil v1 declares a magnitude scale (`scale-t1`, kind `magnitude`) and Olive (key `oil`, new words); the batch made from it with marks on both and on `sweetness` survives `exportStore`, a JSON round trip, `importStore` into a fresh profile and a second repository on the same database, with every definition deep-equal and every mark on its key. The accepted-promotion case (sweetness demoted, creaminess core) records a batch from `loadCatalog`'s catalog whose coreScales are hardness, scoopability, smoothness, creaminess and whose export imports; the refused-duplicate case records a batch whose coreProblems are the four seeded words once each.

## Task Commits

1. **Task 1 (tracer): import judges each batch by its own snapshot** - `624ffc7f` (feat)
2. **Task 2: a magnitude scale and a renamed declared scale survive the store file and a reopen** - `57515d63` (test)

The tracer gate re-ran Task 1's automated verify (4 files, 311 tests) and the full suite (111 files, 3445 tests) before Task 2.

## Files Created/Modified

- `app/src/store/transfer.js` - snapshot-based `validateBatch` / `validateTasting`, new `validateCoreScales`, `validateCoreProblems`, `snapshotKeys`, `snapshotCoreProblems`; `validateMarks` takes the allowed keys; `DEFECTS` import removed
- `app/src/store/transfer.test.js` - `makeBatch` snapshots carry `coreScales` and `coreProblems` (fresh clones per fixture); new describe "a batch is judged by its own snapshot (D-03a)"
- `app/src/store/definition-roundtrip.test.js` - new, 5 cases

## Decisions Made

- `validateBatch` lost its `coreKeys` parameter; the file's scales-table keys now reach versions only. A batch that is valid by its own snapshot stays valid whatever table it lands in.
- A mark on a foreign key reports its own line even when its value is also bad, so the key is always named.

## Deviations from Plan

**1. [Process] Commit attribution trailer.** The dispatch notes asked for a "Claude Fable 5.1" trailer; this agent runs as Sonnet 5.5 and the session's attribution reminder names that model, so both commits carry `Co-Authored-By: Claude Sonnet 5.5` (as plan 09-13 did). No code effect.

**2. [Process] Plan commit ledger not written.** The sandbox refuses compound git commands, so the `gsd-plan-head-before` ledger file was not created. `plan_head_before` is the spawn HEAD `5e963bf0`, and `commits: 2` was measured with `git rev-list --count 5e963bf0..HEAD` before this SUMMARY's own commit.

Otherwise the plan ran as written. No validator fix was needed for Task 2: the validator accepted the magnitude definition and the renamed key on the first run. `app/dist` was never written; `09-dist-guard.sh check` prints DIST UNCHANGED.

**Total deviations:** 2 (both process notes). **Impact:** none.

## Authentication Gates

None.

## Known Stubs

None.

## Issues Encountered

- A batch in a browser's IndexedDB recorded before plan 09-13 has no `snapshot.coreScales`, and an export file holding one is now refused at `$.batches[i].snapshot.coreScales`. The project has no live data to lift (reset over migration); the device walk (09-16) starts from a reset store.
- `gsd_run` is not available in this sandbox, so no `requirements.mark-complete` was run; STATE.md, ROADMAP.md and REQUIREMENTS.md are untouched (the orchestrator owns them).

## Threat Flags

None. T-09-27 (marks only on the batch's own snapshot keys, which pass `isScaleDefinition`) and T-09-28 (the validator reads only the snapshot; a test imports a batch whose defect the receiving table lacks and refuses one whose mark key the snapshot lacks) are mitigated and tested. T-09-SC accepted: no package installed.

## Next Phase Readiness

Plan 09-15 can retire the domain's axis and defect constants (nothing in `transfer.js` imports them) and extend the upgrade proof. Plan 09-16's walk can expect every batch to carry `coreScales` and `coreProblems`; the four-core-scale rule on a snapshot is the deliberate design choice recorded in plans 09-10 and 09-14 (lift-core-count removes it).

## Self-Check: PASSED

- Created file exists: `app/src/store/definition-roundtrip.test.js`.
- Commits `624ffc7f` and `57515d63` are on this branch.
- Acceptance: `grep -cE "import \{[^}]*\b(AXES|DEFECTS)\b" app/src/store/transfer.js` returns 0; `CORE_SCALE_COUNT` is used in the snapshot count check; `kind: 'magnitude'` is in definition-roundtrip.test.js; `creaminess` appears 5 times there; full suite 112 files, 3450 tests passing.
