---
phase: 07-creation-primitives
plan: 01
subsystem: domain
tags: [version-row, library, structuredClone, vitest]

requires:
  - phase: 06
    provides: library store record shape { id, entry } (D-02)
provides:
  - rowFromLibraryRecord: builds a version row from a library record without touching the store
affects: [07-03, v2 creation screen]

actuals:
  tokens: 3500
  tasks: 2
  commits: 3
plan_head_before: 0840c54ede82095483357e72c3cf4817dbc554e4
plan_head_after: 01b08a84d4a2e2b0966bc8969feb254a8e5c1b06

tech-stack:
  added: []
  patterns: ["Domain constructors may throw TypeError on contract violations (first in app/src/domain)"]

key-files:
  created:
    - app/src/domain/versionRow.js
    - app/src/domain/versionRow.test.js
  modified: []

key-decisions:
  - "rowFromLibraryRecord refuses a bad row id, amount or step by throwing a TypeError with a fixed message; the first throw in app/src/domain. Reversible: no caller exists yet, so switching to a returned value is a one-file change (RESEARCH A1)."

requirements-completed: [MAKE-03]

coverage:
  - id: D1
    description: "A library record becomes a row deep-equal to the seeded olive oil row-03, with the same six figures, embedding a structuredClone of the entry"
    requirement: MAKE-03
    verification:
      - kind: unit
        ref: "app/src/domain/versionRow.test.js#rowFromLibraryRecord — the seeded olive oil row (criterion 3, D-06)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Defaults (name, step 1), 0 g accepted, TypeError refusals for bad id/amount/step, module purity"
    requirement: MAKE-03
    verification:
      - kind: unit
        ref: "app/src/domain/versionRow.test.js#defaults, refusals, purity describes"
        status: pass
    human_judgment: false

duration: 8min
completed: 2026-10-15
status: complete
---

# Phase 07 Plan 01: Row from library record Summary

**`rowFromLibraryRecord` builds a seeded-shape version row from a library record, embedding `structuredClone(record.entry)`, with TypeError refusals for a bad id, amount or step.**

## Performance

- **Duration:** about 8 min
- **Tasks:** 2 (a tracer and a TDD task)
- **Files:** 2 created

## Accomplishments

- A row built from the olive oil library record with `{ id: 'row-03', grams: 40, step: 8, ingredientName: 'Graza Drizzle' }` deep-equals `oliveOilVersion.rows[2]` and gives the same six balance figures, alone and swapped into the olive oil version.
- The embedded ingredient is a copy: editing the library entry afterwards moves neither the row nor its figures; the record's id never enters the row; the record is not mutated.
- Defaults: name falls back to `entry.name`, step to 1; 0 g is accepted; the portion has only `step` and `grams`.
- Refusals: id (non-empty string), grams (finite, at least 0), step (finite) throw a TypeError with fixed messages.
- Purity pinned by test: no import, no clock or random source, no environment docblock on the test.

## Task Commits

1. Task 1 (tracer): `d991e9b` feat(07-01) happy path and equality/copy tests
2. Task 2 RED: `12c4feb` test(07-01) defaults, refusals, purity pins (15 failing)
3. Task 2 GREEN: `01b08a8` feat(07-01) TypeError refusals

## Deviations from Plan

None - plan executed exactly as written. (Task 2 was committed as RED test then GREEN implementation per its `tdd="true"` flag, three commits in all.)

## Issues Encountered

None. `app/node_modules` was missing in the worktree; ran `npm --prefix app install` (no manifest changes).

## Verification

- `npm --prefix app test`: 88 files, 2819 tests passing (baseline 87 files, 2794).
- Only `app/src/domain/versionRow.js` and `versionRow.test.js` differ from `7038ce9` under `app/src`; `package.json` and `package-lock.json` unchanged.
- Three `new TypeError(` sites outside comments; no `import` statement in `versionRow.js`.

## Known Stubs

None.

## Threat Flags

None.

## Self-Check: PASSED

- FOUND: app/src/domain/versionRow.js
- FOUND: app/src/domain/versionRow.test.js
- FOUND commits: d991e9b, 12c4feb, 01b08a8
