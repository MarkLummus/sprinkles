---
phase: 09-the-library-and-the-stored-shapes-plus-the-two-places
plan: 07
subsystem: data
tags: [ingredient-library, seed, d-20, decisions-gate, vitest]
requires:
  - phase: 09-the-library-and-the-stored-shapes-plus-the-two-places
    provides: "plan 09-01 library-seed-db.js, approved ingredient-mapping.json, ingredient-seed-checks.json, STAGE_IDS; plan 09-05 embedFromLibrary and the strawberry null keys"
provides:
  - "app/src/store/seed.js seeds { ...librarySeedDb, ...library }: 85 new entries under the 26, the 26 winning any clash"
  - "The 26 entries in data/library.js own the six D-20 coefficient keys with the values Mark approved; the five dairy entries carry titratableAcidity with derived basis and a Goff source"
  - "app/src/data/library-decisions.js: 18 same records (app value kept) and 1 different-product record (coconut milk), the seven named conflicts with notes quoting the converter's figures"
  - "app/src/data/library-seed-db.test.js: the approval check, the recorded-decision gate, the lactose invariant on converted candidates, the four D-10a exceptions, the kept-app-value check, key and name clash checks"
affects: [09-09, 09-16, phase-10]
requirements-completed: [LIB-04, LIB-05, LIB-07]
plan_head_before: 6988235379874d72667c3ed24518f621ba2675a8
plan_head_after: ae6f0f60d0b70e4b4c5746bad2964cdc1776685e
actuals:
  tokens: 14000
  tasks: 3
  commits: 4
tech-stack:
  added: []
  patterns:
    - "A gate is a pure function returning named problems; the test runs it on the real data (expect none) and on mutated copies (expect the named problem)"
    - "Dataset invariants read the converted candidate (checks file for a same pair, new-entry module otherwise), never the merged library"
key-files:
  created:
    - app/src/data/library-decisions.js
    - app/src/data/library-seed-db.test.js
  modified:
    - app/src/store/seed.js
    - app/src/store/seed.test.js
    - app/src/store/library.test.js
    - app/src/data/library.js
key-decisions:
  - "Library seed is built as { ...librarySeedDb, ...library } so an existing key can never be overwritten by a new entry"
  - "Only coconut-milk gets a relation 'different' record: it is the one of the seven named conflicts the mapping marks different; whole-milk, also different, is not among the seven and has none, as the plan says"
  - "The named-conflict notes were generated from ingredient-seed-checks.json by a scratch script, then committed as plain data; the gate checks every quoted figure"
coverage:
  - id: D1
    description: "A fresh profile's library holds the 26 existing entries (values unchanged, six D-20 keys added) and every new reviewed entry with inherited basis"
    requirement: LIB-04
    verification:
      - kind: integration
        ref: "app/src/store/library.test.js#keeps the 26 existing entries as data/library.js has them and adds the reviewed dataset beside them (LIB-04, D-09)"
        status: pass
      - kind: unit
        ref: "app/src/store/seed.test.js#seedIfEmpty, the two independent guards (D-04)"
        status: pass
    human_judgment: false
  - id: D2
    description: "The six D-20 keys on every entry carry the approved values, and every seeded version and batch snapshot row embeds them"
    requirement: LIB-04
    verification:
      - kind: unit
        ref: "app/src/store/library.test.js#the six D-20 coefficient keys on every library entry"
        status: pass
    human_judgment: false
  - id: D3
    description: "Every same-ingredient pair is recorded as decided with the fields that differ, and a missing, stale or incomplete record fails the gate"
    requirement: LIB-05
    verification:
      - kind: unit
        ref: "app/src/data/library-seed-db.test.js#the recorded decision gate (LIB-05, criterion 1)"
        status: pass
    human_judgment: false
  - id: D4
    description: "Lactose counts once: 100 g of every converted candidate with milk solids computes the dataset PAC, POD and solids, and the four D-10a exceptions compute their hand-written figures"
    requirement: LIB-07
    verification:
      - kind: unit
        ref: "app/src/data/library-seed-db.test.js#the converted candidates count lactose once (LIB-07, D-10a, criterion 1)"
        status: pass
    human_judgment: false
duration: 15min
completed: 2026-10-19
status: complete
---

# Phase 9 Plan 07: Merged library seed, recorded decisions and gates Summary

**A fresh profile now seeds 111 library entries (85 reviewed dataset entries merged under the 26 existing ones, which keep every figure), the 26 own the six D-20 coefficient keys with Mark's approved values, and every same-ingredient case is recorded as "app value kept" behind a gate that recomputes each difference.**

## Performance

- **Tasks:** 3 (Task 1 tracer, Tasks 2 and 3 TDD)
- **Files:** 2 created, 4 modified (plus the SUMMARY)
- **Tests:** full suite 105 files, 3256 tests passing (baseline 104 files, 3224)

## Accomplishments

- **Merged seed (Task 1, tracer).** `seed.js` seeds `{ ...librarySeedDb, ...library }`. `seed.test.js` and `library.test.js` read expected entries and counts from a `seededLibrary` of the same shape (lookups at the old lines 120 to 124 and 181 to 182, 32 to 38 and 150; counts at all nine named places). A fake-indexeddb case shows each of the 26 stored entries deep-equals `data/library.js` and a new entry (first of `librarySeedDb`) is present with inherited basis.
- **D-20 on the 26.** Each entry gained `titratableAcidity, fatStructural, ownEmulsifier, defaultStage, prepNote, requiresHeat` after its existing fields. The five dairy entries gained `basis.titratableAcidity: 'derived'` and `source.titratableAcidity: 'MSNF × 0.017, Goff pp. 142, 407'`. The two `[verify]`/`[assumed]` values (allulose and vanilla extract `after_heat`) carry a code comment saying so. The base-commit comparison prints `OK every existing field kept`.
- **Recorded decisions (Task 2).** `library-decisions.js` holds 18 `same` records (`app value kept`, `differs` copied from the checks file) and one `different` record (coconut milk, `coconutMilk` kept, dataset row under `coconutMilk208`). The seven named conflicts carry notes built from `samePairs[id].differs`, for example `PAC 580 kept; the dataset says 586`.
- **The gate.** `gateProblems(records)` returns named problems: a missing record, a record naming a field that no longer differs, one omitting a field that does, an unknown dataset id, a missing quoted figure. The test runs it on the real list and on mutated copies (omitted field, extra field, reversed order, stray id, changed note number, removed pair).
- **Invariants (Task 3).** For every checks row with `msnfPct > 0`, 100 g of its converted candidate (checks file for a same pair such as skim-milk-powder, new entry otherwise) computes PAC within 0.06, POD within 0.08 and solids within 0.15. Milk chocolate (13.5, 53), sweetened condensed milk (sugar 0.41965, 54.5, 44, solids 73), yogurt (msnf 0.105) and ethanol (`{ pac: 744 }`) are pinned. Kept app values, key clashes, name clashes, inherited basis, six keys, acidity rule, dairy flag and gum fat rule each have their own case.

## Task Commits

1. **Task 1 (tracer): merged seed, six D-20 keys, updated tests** - `7dde55d3` (feat)
2. **Task 2 RED: failing gate for the recorded decisions** - `a8fc3303` (test)
3. **Task 2 GREEN: decisions recorded, app value kept** - `43d2e1f0` (feat)
4. **Task 3: lactose invariant, exceptions, key and name checks** - `ae6f0f60` (test)

The tracer gate: Task 1's verify (and the full suite, 3230 tests) passed before any expansion.

## TDD Gate Compliance

- **Task 2 RED** (`a8fc3303`): with `libraryDecisions` an empty stub, 6 of 11 tests failed on assertions naming the missing pairs (`allulose: expected one 'same' record, found 0`, and so on for all 18, plus the seven named conflicts). Semantic assessment: the target tests executed and failed on the planned assertion for the planned reason; no load, syntax or zero-test fault. The approval case and the tests that pass with an empty list (the mutation cases that expect a problem, the tolerance and absent-field unit cases) were green, as expected.
- **Task 2 GREEN** (`43d2e1f0`): 11 of 11 pass.
- **Task 3 has no separate RED commit.** Its behaviour (the converted candidates, the exceptions) already exists from plan 09-01, so its tests pass on first run, an unexpected green by the TDD rule. I investigated: the data under test is plan 09-01's, and this task's job is to pin it. To prove the tests can fail, I mutated the generated module in three places (milk chocolate sugar, yogurt msnf, ethanol PAC) and the tests failed on the named rows (`milk-chocolate solids 108.5 against 98.5`, yogurt msnf, ethanol composition), then restored the file with `git checkout -- app/src/data/library-seed-db.js`. The mutation also showed the milk chocolate exception case did not check solids (sugar does not feed PAC there), so that check was added before the commit.

## Deviations from Plan

None to the plan's content. Two notes of form:

- Mark changed none of the 26 coefficient values at plan 09-01's checkpoint (`existingCoefficients` was approved as proposed), so there is no difference between the plan's list and the approved map; `library.test.js` case (b2) holds `data/library.js` equal to the checks file's `existing` object for all 26.
- The base-file comparison used `710a528` as written; `data/library.js` is byte-identical between `710a528` and this plan's base, so the guard in plan 09-01 did not move it.

**Total deviations:** 0.

## Issues Encountered

- The worktree had no `app/node_modules`; the main checkout's was symlinked (gitignored, not staged). No package was installed.
- The per-plan commit ledger of protocol 0c was not written: the sandbox refuses compound git commands. `plan_head_before` is this worktree's spawn HEAD (`69882353`, the base the dispatch named), and `commits: 4` was measured with `git rev-list --count` before this SUMMARY's own commit.
- The converter's `samePairs[...].converted` holds `dairy` and `composition` only (no name, category or basis, which the plan's interface sketch listed). The gate and the invariants need only those two fields, so nothing changed.
- `transfer.test.js` was not touched (plan 09-05 moved its seeded-export case off the 26 already); the full suite needed no other file.

## Known Stubs

None.

## Threat Flags

None. The seed gains data only; T-09-14 and T-09-15 are mitigated by the key-clash test, the deep-equal on the 26 and the lactose invariant with its four exceptions.

## Next Phase Readiness

- Plan 09-09's version bump can clear every library and reseed from this seed; its `validateLibraryRecord` can require the six keys, which all 111 entries own.
- Plan 09-16's walk can read each seeded row's expected coefficients from `data/library.js` by `libraryId`; the paths that change on a seeded row's copy are exactly the six keys and, on the five dairy entries, `basis.titratableAcidity` and `source.titratableAcidity`.

## Self-Check: PASSED

- FOUND: app/src/data/library-decisions.js, app/src/data/library-seed-db.test.js
- FOUND commits 7dde55d3, a8fc3303, 43d2e1f0, ae6f0f60 (ancestors of HEAD)
- Full suite: `npm --prefix app test` 105 files, 3256 tests passed

---
*Phase: 09-the-library-and-the-stored-shapes-plus-the-two-places*
*Completed: 2026-10-19*
