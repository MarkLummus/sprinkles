---
phase: 07-creation-primitives
plan: 02
subsystem: domain
tags: [step-keys, allocator, vitest, pure-domain]

requires:
  - phase: 06
    provides: togglePenStepRemoved flag-only removal, stored step key n as identity
provides:
  - "nextStepKey(method): next never-used step key, removed steps included, RangeError outside the safe-integer range"
  - "D-05a pin: pen removal of the highest step keeps it in method, flagged, key held"
affects: [07-03, v2 add-step, new-recipe first key]

actuals:
  tokens: 2100
  tasks: 2
  commits: 3
plan_head_before: 0840c54ede82095483357e72c3cf4817dbc554e4
plan_head_after: b4b1a57c9e9d75fa17e50013222d32bf9b090f7e

tech-stack:
  added: []
  patterns:
    - "Allocator scans the whole method array (never counts, never indexes by stored key); no stored counter"
    - "Domain functions throw RangeError on out-of-range input"

key-files:
  created:
    - app/src/domain/stepKeys.js
    - app/src/domain/stepKeys.test.js
  modified:
    - app/src/domain/penDraft.test.js

key-decisions:
  - "Supported range is safe integers for every key and the result; outside it nextStepKey throws RangeError rather than return a reused key (reversible: no caller yet)"
  - "D-05a pin removes the highest step (n 10), not step 3, because only that tells flagging from dropping"

requirements-completed: [MAKE-02]

coverage:
  - id: D1
    description: "nextStepKey returns the highest key over every step (removed included) plus one; 1 for an empty method; gap case gives highest+1, not count+1"
    requirement: MAKE-02
    verification:
      - kind: unit
        ref: "app/src/domain/stepKeys.test.js#nextStepKey — never reuses a key (criterion 2, D-05)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Pen removal of the highest step leaves it in method flagged removed and nextStepKey stays past it"
    requirement: MAKE-02
    verification:
      - kind: unit
        ref: "app/src/domain/penDraft.test.js#togglePenStepRemoved keeps the highest-numbered step in method, flagged (07 D-05a)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Safe-integer range: MAX_SAFE_INTEGER-1 gives MAX_SAFE_INTEGER; MAX_SAFE_INTEGER, 2**53, 2.5, NaN, Infinity, '3', undefined throw RangeError; no mutation of a frozen method"
    requirement: MAKE-02
    verification:
      - kind: unit
        ref: "app/src/domain/stepKeys.test.js#nextStepKey — the supported range is safe integers"
        status: pass
    human_judgment: false
  - id: D4
    description: "stepKeys.js imports nothing outside the domain, reads no clock or random source, tested under node"
    requirement: MAKE-02
    verification:
      - kind: unit
        ref: "app/src/domain/stepKeys.test.js#stepKeys.js stays pure (criterion 4)"
        status: pass
    human_judgment: false

duration: 8min
completed: 2026-10-15
status: complete
---

# Phase 7 Plan 02: Step-key allocator Summary

**`nextStepKey(method)` returns the highest step key over every step (removed ones included) plus one, with no stored counter, and throws RangeError outside the safe-integer range.**

## Performance

- **Duration:** 8 min
- **Completed:** 2026-10-15T10:14Z
- **Tasks:** 2
- **Files modified:** 3 (2 created, 1 edited additively)

## Accomplishments
- `app/src/domain/stepKeys.js`: pure allocator scanning the method array; steps 1-4 with 3 removed give 5, with 4 removed give 5, steps 1, 2, 4 give 5, empty gives 1.
- Safe-integer range: every key and the result must be a safe integer; `Number.MAX_SAFE_INTEGER - 1` gives `Number.MAX_SAFE_INTEGER`; a highest key of `Number.MAX_SAFE_INTEGER`, or a key of 2**53, 2.5, NaN, Infinity, '3' or undefined, throws RangeError. These throws are among the first in `app/src/domain` (reversible: no caller exists yet; switching to a returned value changes this file and its test only).
- D-05a pin in `penDraft.test.js`: `togglePenStepRemoved` on the olive oil version's step 10 keeps all 10 steps, flags step 10 removed, and `nextStepKey` still returns 11 (also after toggling back).

## Task Commits

1. **Task 1 (tracer): allocator and D-05a pin** - `a26c0b6` (feat)
2. **Task 2 (tdd): range, no-mutation, purity** - RED `8079f0c` (test), GREEN `b4b1a57` (feat)

## Files Created/Modified
- `app/src/domain/stepKeys.js` - nextStepKey
- `app/src/domain/stepKeys.test.js` - node-environment suite (criterion 2, range, no mutation, purity)
- `app/src/domain/penDraft.test.js` - additive import and one D-05a test

## Decisions Made
- Range and throw choice as above; D-05a pin removes the highest step so flagging and dropping are told apart.

## Deviations from Plan

None - plan executed exactly as written. (Task 2 followed RED then GREEN as two commits; Task 1's tracer verify passed end-to-end before Task 2.) `npm --prefix app ci` was run in the worktree to supply `node_modules`; package.json and package-lock.json are unchanged.

## Issues Encountered
None. The header comment names `versionRow.js` as Plan 01's file by the plan's own file list; it was not present in this worktree (Plan 01 runs in parallel).

## Known Stubs
None.

## Threat Flags
None. T-07-04 and T-07-05 mitigated as planned; T-07-SC: no package changes.

## Next Phase Readiness
Plan 03 can call `nextStepKey` and check a new recipe's first key is 1. Full suite: 88 files, 2812 tests, all passing.

## Self-Check: PASSED

- FOUND: app/src/domain/stepKeys.js, app/src/domain/stepKeys.test.js
- FOUND commits: a26c0b6, 8079f0c, b4b1a57
- `git diff --name-only 7038ce9 -- app/src` lists only this plan's three files; ui, store, data and penDraft.js untouched.
