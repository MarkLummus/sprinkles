---
phase: quick-260909-oox
plan: 01
subsystem: ui
tags: [react, jsx, vitest, forms, validation]

requires: []
provides:
  - "min=\"0\" floor on the three measured fields with no meaning below zero (come-up, overrun, meltdown loss)"
  - "One exported toNumberOrNull finiteness guard in RecipePage.jsx, replacing two identical local copies"
affects: [batch-recording, tasting-recording]

actuals:
  tokens: 1851
  tasks: 2
  commits: 2

tech-stack:
  added: []
  patterns:
    - "Browser-native min=\"0\" range check used instead of an app-side validation/colour rule, keeping the four-colour system untouched"
    - "A single module-level exported helper (alongside isDraftDirty/derivePenState) replaces duplicated inline arrow functions across two handlers"

key-files:
  created: []
  modified:
    - app/src/ui/BatchMargin.jsx
    - app/src/ui/BatchMargin.test.jsx
    - app/src/ui/RecipePage.jsx
    - app/src/ui/RecipePage.test.jsx

key-decisions:
  - "Floor placed on exactly three fields (comeUpMinutes, overrunPercent, meltdownLossG); drawTempC and tastingTempC left unfloored since both are legitimately negative"
  - "toNumberOrNull dedup approved by the user ahead of execution; collapsed both identical local copies (handleSaveBatch, handleSaveTasting) into one module-level export"

patterns-established:
  - "A rejected value is refused at the field itself via a native HTML attribute, never via app-side colour, outline, or a blocking save rule"

requirements-completed: [QUICK-260909-oox]

coverage:
  - id: D1
    description: "Come-up, Overrun and Meltdown loss inputs carry min=\"0\"; Draw temperature and Tasting temperature carry no min at all"
    requirement: "QUICK-260909-oox"
    verification:
      - kind: unit
        ref: "app/src/ui/BatchMargin.test.jsx#BatchMargin — a floor on the measured fields that cannot go below zero (260909-oox)"
        status: pass
    human_judgment: false
  - id: D2
    description: "toNumberOrNull is a single exported finiteness guard; unparsable ink and blank both save as null, '0' saves as 0, '-6' saves as -6"
    requirement: "QUICK-260909-oox"
    verification:
      - kind: unit
        ref: "app/src/ui/RecipePage.test.jsx#toNumberOrNull — nothing written and unparsable ink are the same fact, never a stored NaN (260909-oox)"
        status: pass
    human_judgment: false

duration: ~15min
completed: 2026-09-09
status: complete
---

# Quick Task 260909-oox: Reject impossible negative/non-finite measured values

**A `min="0"` floor on come-up, overrun and meltdown loss; one exported `toNumberOrNull` finiteness guard replacing two identical local copies in `RecipePage.jsx`.**

## Performance

- **Duration:** ~15 min
- **Tasks:** 2/2 completed
- **Files modified:** 4

## Accomplishments

- Added `min="0"` to the three number inputs that have no meaning below zero (Come-up, Overrun, Meltdown loss), leaving Draw temperature and Tasting temperature — both legitimately negative — untouched.
- Collapsed two identical local `toNumberOrNull` arrow functions (in `handleSaveBatch` and `handleSaveTasting`) into a single exported module-level helper that also guards on `Number.isFinite`, so unparsable ink (`'4o'`, `'abc'`, `'Infinity'`) now saves as `null` instead of a stored `NaN`.
- Added 4 new BatchMargin test cases (floor present on the three, absent on the two signed fields) and 6 new RecipePage unit tests (blank, a figure, a negative reading, a written zero, unparsable ink, `Infinity`).

## Task Commits

Each task was committed atomically:

1. **Task 1: A floor on the three fields that cannot go below zero — and on no others** - `84c915b` (feat)
2. **Task 2: One finiteness guard, in one place, on the way to the store** - `66d0849` (fix)

_TDD: RED confirmed before each GREEN implementation — Task 1's two floor assertions failed pre-implementation (the two no-floor assertions correctly passed, since no `min=` attribute existed anywhere yet); Task 2's 6 new assertions failed with `toNumberOrNull is not a function` pre-implementation._

## Files Created/Modified

- `app/src/ui/BatchMargin.jsx` - Added `min="0"` to comeUpMinutes, overrunPercent, meltdownLossG number inputs; one comment naming which fields have no meaning below zero and which two keep their sign
- `app/src/ui/BatchMargin.test.jsx` - 4 new cases asserting the floor's presence on the three unsigned fields and its absence on the two signed fields
- `app/src/ui/RecipePage.jsx` - Added `export function toNumberOrNull(raw)` after `derivePenState`; deleted both local `const toNumberOrNull` definitions (handleSaveBatch, handleSaveTasting)
- `app/src/ui/RecipePage.test.jsx` - Added `toNumberOrNull` to the named import; 6 new unit cases

## Decisions Made

- Dedup of the two identical `toNumberOrNull` copies into one exported helper — pre-approved by the user, executed as specified (no local re-derivation needed).
- No blocking save rule was added to the batch pen — that scope boundary (owned by `.impeccable/surfaces/route-recipe-batch.md`) was honored exactly as the plan's own scope discipline required.

## Deviations from Plan

None — plan executed exactly as written. Both tasks followed the grounded facts' label map and line citations precisely; the sibling item's prior edits to `RecipePage.jsx` (grams/asMade/draftVersion hunks) were left untouched, confirmed by inspecting the final diff.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- The record can no longer accept a stored `NaN` or a negative reading in any of the three fields that have no meaning below zero.
- Out of the machine and Tasting temperature remain exactly as they were — both save with their sign intact.
- Full suite green: 646 tests (up from the 636-test baseline, +10 new cases), `npm --prefix app run build` clean.
- No dependency added, no stylesheet touched (`git diff --quiet HEAD -- app/src/styles/` held throughout), no grams behavior touched.

---
*Quick task: 260909-oox*
*Completed: 2026-09-09*

## Self-Check: PASSED

All 4 modified files and the SUMMARY.md itself found on disk; both task commits (`84c915b`, `66d0849`) found in git log.
