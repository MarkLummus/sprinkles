---
phase: quick-260925-kix
plan: 01
subsystem: seed-data
tags: [mexican-chocolate, seed, history-rail, version-lineage]
status: complete
dependency-graph:
  requires: []
  provides:
    - mexicanChocolateV2 (app/src/data/mexican-chocolate.js)
    - MEXICAN_CHOCOLATE_V2_ID
  affects:
    - transcribedRecipeGroups (app/src/data/seed-recipes.js)
    - mexicanChocolateV3.parentVersionId / citedBatchId
    - .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-SEED-REVIEW.md
    - .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-09-PLAN.md
    - .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-CONTEXT.md
tech-stack:
  added: []
  patterns:
    - "Version chain re-parenting forces citedBatchId to null when the new parent has no batch (app keeps a cited batch on the parent, per RecipePage.jsx/VersionRow.jsx)"
key-files:
  created: []
  modified:
    - app/src/data/mexican-chocolate.js
    - app/src/data/seed-recipes.js
    - app/src/data/seed-recipes.test.js
    - .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-SEED-REVIEW.md
    - Ice Cream Log Pages/seed-transcription-sidecar.json
    - .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-09-PLAN.md
    - .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-CONTEXT.md
decisions:
  - "v2's citedBatchId is null (Mark, 2026-09-25) — the carried-forward Notes text (v1's Observations/to-fix list) never becomes a note, reason, or tasting on v2."
  - "v3's citedBatchId is forced to null after re-parenting to v2 (which has no batch) — a structural consequence of the app's cited-batch-on-parent rule, not a new authoring choice; v3's reason is left exactly as written pending Mark (open question 8)."
  - "v3's own reason (v1's to-fix list) is logged as an open question in the seed review rather than resolved here, per Mark's approval scope for this quick task."
metrics:
  duration: ~25min
  completed: 2026-09-25
actuals:
  tokens: 10210
  tasks: 2
  commits: 2
  plan_head_before: abeebe8
---

# Quick Task 260925-kix: Seed Mexican Chocolate v2 from the v2-2.ier export Summary

Mexican Chocolate's version chain now reads v1 → v2 → v3 → v4: v2 is transcribed from `~/Documents/Mexican Chocolate v2-2.ier`, found on disk 2026-09-25, and v3 is re-parented onto it with its own rows untouched.

## What Was Built

- **`mexicanChocolateV2`** (`app/src/data/mexican-chocolate.js`): 12 rows from the .ier export in file order (Whole Milk 3.3% 427g through Allulose 50g), `createdAt` taken from the file's own modification time (2026-01-11T23:22:38.000Z, converted from -05:00), `process`/`method` following the v4 precedent (the carried Notes text describes the same process and two steps v4 has), `reason: null`, `citedBatchId: null`, no batch, no tasting.
- **`mexicanChocolateV3`** re-parented: `parentVersionId`/`parentVersionLabel` now point at v2; `citedBatchId` forced from v1's batch id to `null` since the app keeps a cited batch on the parent version and v2 has none. v3's rows, process, iceEd and method are byte-for-byte unchanged.
- **`transcribedRecipeGroups`** (`app/src/data/seed-recipes.js`): Mexican Chocolate's `versions` array is now `[v1, v2, v3, v4]`; `batches` unchanged (v2 has no batch).
- **Tests** (`app/src/data/seed-recipes.test.js`): a new `mexicanChocolateV2` describe block (rows/grams, record fields, method-equals-v4), a rewritten lineage describe (`v1 -> v2 -> v3 -> v4`, ordered ids with ascending createdAt, `railEntries` names), and two new batch-invariant tests (no batch cites `mexican-chocolate-v2`; every non-null `citedBatchId` belongs to the citing version's parent).
- **`03.5-SEED-REVIEW.md`**: new sources-table row, a Documents-export note under the v1 section (v1.ier is v1 saved with a 60-minute Notes line, not a separate source), a full "Mexican Chocolate v2" section (field-by-field table, ingredient mapping, judgement calls 26–28), v3's Source line and judgement call 14 amended for the new parent, a rewritten four-version History paragraph, a v2 states-coverage row, and open question 8 about v3's `reason` under its new parent.
- **`seed-transcription-sidecar.json`**: a `mexican-chocolate-v2` entry between v1 and v3 (kcal per ingredient, `staleNotesText` identical to v4's, and a flag naming its v1 origin).
- **`03.5-09-PLAN.md`**: every truth, behavior, and human-check that asserted the old three-version reading (or the "gap"/"no v2" language) now describes the four-version chain, so plan 09's own "fix the data, never the assertion" rule cannot delete v2 when it eventually executes.
- **`03.5-CONTEXT.md`**: D-01's original text is kept as the historical record; a nested "Amended 2026-09-25" bullet records the corrected chain underneath it.

## Deviations from Plan

None — plan executed exactly as written. Every task's own `<verify>` automated gate (Task 1: MEXICAN_CHOCOLATE_V2_ID count, no removed rows in v3's diff, `app/src/store` untouched; Task 2: 13 grep/node gates over the review, sidecar and plan 09) passed on the first run with no fix-up needed.

## Known Stubs

None.

## Test Results

- `npm --prefix app test -- src/data/seed-recipes.test.js`: 19/19 passed.
- `npm --prefix app test` (full suite): **1269/1269 passed**, 49 test files.

## Self-Check: PASSED

- `app/src/data/mexican-chocolate.js` — FOUND, exports `MEXICAN_CHOCOLATE_V2_ID` and `mexicanChocolateV2`.
- `app/src/data/seed-recipes.js` — FOUND, Mexican Chocolate group holds `[v1, v2, v3, v4]`.
- `.planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-SEED-REVIEW.md` — FOUND, contains `## Mexican Chocolate v2`.
- `Ice Cream Log Pages/seed-transcription-sidecar.json` — FOUND, parses with a `mexican-chocolate-v2` entry between v1 and v3.
- Commit `fe4d457` — FOUND in `git log --oneline`.
- Commit `2759b48` — FOUND in `git log --oneline`.
