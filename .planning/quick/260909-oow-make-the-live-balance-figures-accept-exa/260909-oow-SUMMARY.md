---
phase: quick-260909-oow
plan: 01
subsystem: ui
tags: [react, grams-validation, recipe-page, ingredient-table, domain-lineage]

requires: []
provides:
  - "parseGramsDraft(value) exported from app/src/domain/lineage.js — the one rule every draft-grams reader takes"
  - "All four named draft-grams readers (RecipePage's draftVersion row map, its as-made save loop, its saved-child/save-over row map, IngredientTable's live-share reader) converted to parseGramsDraft"
affects: [recipe-page, batch-recording, version-pen]

key-files:
  created: []
  modified:
    - app/src/domain/lineage.js
    - app/src/domain/lineage.test.js
    - app/src/ui/RecipePage.jsx
    - app/src/ui/IngredientTable.jsx
    - app/src/ui/IngredientTable.test.jsx

key-decisions:
  - "asMadeTotals (app/src/domain/batch.js:169) is a fifth loose reader of draft grams, left out of scope per the plan's own scope boundary — it also serves stored batch records whose as-made values are already numbers, so converting it would change how an existing record's total reads."
  - "toNumberOrNull (app/src/ui/RecipePage.jsx, line 676) is quick item 260909-oox's site, left untouched."
  - "A batch record saved before this fix that holds an as-made value the rule now rejects loses that cell when the batch is amended: handleStartAmending refills the draft with String(value), and the save now drops any value the pattern rejects. This is the task's own stated rule applied to old data — no migration or exception was added."

requirements-completed: [QUICK-260909-oow]

duration: ~20min
completed: 2026-09-09
status: complete
---

# Quick Task 260909-oow: One grams rule for the pen and the save gate — Summary

**`parseGramsDraft` now owns the one non-negative-up-to-two-decimals rule; all four draft-grams readers in the plan pen, the as-made save loop, and the version-save row map read it, so the live figures on screen can never disagree with what the save gate accepts.**

## Accomplishments

- Exported `parseGramsDraft(value)` from `app/src/domain/lineage.js`, placed directly beneath `NUMERIC_GRAMS_PATTERN`, which stays module-private with `parseGramsDraft` as its only reader. `findBlockedRow` now calls `parseGramsDraft(draftRow.grams) === null` instead of testing the pattern directly.
- Converted all four draft-grams readers to the predicate, each using `??` (never `||`) so a typed `0` still takes effect (D-11):
  - `RecipePage.jsx`'s `draftVersion` row map (feeds `liveVersion` → `buildFigures` → the graduated rules)
  - `RecipePage.jsx`'s `handleSaveBatch` as-made loop — a rejected cell is now dropped exactly as a non-numeric one already was, with no new blocking rule added to the batch pen
  - `RecipePage.jsx`'s saved-child/save-over row map
  - `IngredientTable.jsx`'s live-share reader
- Added domain tests in `lineage.test.js` for `parseGramsDraft`: valid values, a written zero, blank/undefined, the four rejected forms (leading minus, exponent, three decimals, stray letter, surrounding whitespace), and an agreement property proving `parseGramsDraft` and `blockedSaveMessage` can never disagree.
- Added a component regression block in `IngredientTable.test.jsx` proving the plan pen's live share holds at the parent's own stored figure (50.0%) for each rejected value, and that a written `0` and a valid `25` still take effect.

## Task Commits

1. **Task 1: One predicate in the module that owns the rule** - `e3efbdd` (feat)
2. **Task 2: Every draft-grams reader takes the predicate** - `be86eb5` (fix)

## Verification

- `npm --prefix app test`: 30 files, 636 tests passed (618 baseline + 12 new domain tests + 6 new component tests).
- `grep -rn 'Number\.isFinite' app/src/ui/` — no matches; no reader under `app/src/ui` re-derives the grams rule.
- `grep -n 'asMadeTotals' app/src/domain/batch.js` — untouched.
- `grep -qF "const toNumberOrNull = (raw) => (raw === '' ? null : Number(raw));" app/src/ui/RecipePage.jsx` — unchanged (260909-oox's site).

## Deviations from Plan

None - plan executed exactly as written.

## Found-and-left observations (scope boundary)

1. **`asMadeTotals` (app/src/domain/batch.js:169)** — a fifth reader of draft grams (in recording mode `IngredientTable.jsx` feeds it `draft.asMade`'s typed strings at its own bracket write), carrying the same loose `Number.isFinite` guard. Left alone because it also serves stored batch records whose as-made values are already numbers; converting it would change how an existing record's total reads.

   **Resolved 2026-09-09: not a code follow-up.** Routing it through `parseGramsDraft` was planned (`ed03f93`) and withdrawn before execution (`d74d01d`). The plan pen's predicate is strict because a blocked save tells the maker which row is wrong; the batch pen has no such rule, so the same predicate there would silently substitute the plan's number for the maker's record on values like `.5`. The question is now an open decision in `.impeccable/surfaces/route-recipe-batch.md` — what an unreadable as-made amount does — and is answered there, with the batch pen's blocking rule, before any code changes.
2. **`toNumberOrNull` (`app/src/ui/RecipePage.jsx`)** — quick item `260909-oox`'s work. Left exactly as found.

## Named Consequence (accepted, not fixed)

Amending a batch saved before this fix that holds a value the new predicate rejects will silently drop that cell. `handleStartAmending` refills the draft with `String(value)` from the stored record, and `handleSaveBatch`'s as-made loop now drops any value `parseGramsDraft` rejects — a stored value that predates this rule (e.g. a negative or three-decimal figure that somehow reached storage before this fix existed) is silently dropped the next time that batch is amended and saved. No migration and no preservation path was added for this; it is the task's own stated rule applied to old data.

## Self-Check: PASSED

- `app/src/domain/lineage.js` — FOUND, `export function parseGramsDraft` present.
- `app/src/domain/lineage.test.js` — FOUND, `describe('parseGramsDraft', ...)` present.
- `app/src/ui/RecipePage.jsx` — FOUND, 3 call sites + 1 import of `parseGramsDraft`.
- `app/src/ui/IngredientTable.jsx` — FOUND, 1 call site + 1 import of `parseGramsDraft`.
- `app/src/ui/IngredientTable.test.jsx` — FOUND, new regression describe block present.
- Commit `e3efbdd` — FOUND in `git log`.
- Commit `be86eb5` — FOUND in `git log`.
