---
phase: quick-260925-lpd
plan: 01
subsystem: seed-data
tags: [standard-base, underbelly-light-base, strawberry, mocha, seed, comparisons-workbook, history-rail]
status: complete
dependency-graph:
  requires:
    - phase: quick-260925-kix
      provides: transcribedRecipeGroups' Mexican Chocolate v1->v2->v3->v4 chain, the seed-review/sidecar/plan-09 doc pattern this task extends
  provides:
    - standardBaseRecipe, standardBaseV1, standardBaseV2 (app/src/data/standard-base.js)
    - underbellyLightBaseRecipe, underbellyLightBaseV1 (+ batch), underbellyLightBaseV2 (app/src/data/underbelly-light-base.js)
    - strawberryRecipe, strawberryV1/V2/V2_1 (+ three batches) (app/src/data/strawberry.js)
    - mochaRecipe, mochaV0/V1/V2/V3 (+ three batches) (app/src/data/mocha.js)
    - six new library entries: wholeMilk35, wholeMilk37, coffeeBeans, strawberries, driedStrawberry, almondExtract
  affects:
    - transcribedRecipeGroups (app/src/data/seed-recipes.js) — now seven groups
    - .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-SEED-REVIEW.md
    - .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-09-PLAN.md
    - .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-CONTEXT.md
    - pineapple.js, coconut.js createdAt values (real .ier save times, decision 4)
tech-stack:
  added: []
  patterns:
    - "Ordering-placeholder createdAt values are commented with the exact words 'ordering placeholder — Mark to supply the real date' in both code and review, machine-grepped by the plan's own verify gates"
    - "A workbook verdict row (Sweetness/Texture/Scoopability/Flavor) becomes one appended tasting-note line, prefixed 'Comparisons workbook —', in the workbook's own words; only unambiguous words (good/great -> 3) become battery marks"
    - "A version sourced entirely from a spreadsheet column (no Ice Ed export) carries iceEd: { style: null, servingTemperatureC: null, hardness: null, overrunPercent: null } — the olive-oil precedent for 'no spec exists', not an omitted field"
key-files:
  created:
    - app/src/data/standard-base.js
    - app/src/data/underbelly-light-base.js
    - app/src/data/strawberry.js
    - app/src/data/mocha.js
  modified:
    - app/src/data/library.js
    - app/src/data/seed-recipes.js
    - app/src/data/seed-recipes.test.js
    - app/src/data/pineapple.js
    - app/src/data/coconut.js
    - .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-SEED-REVIEW.md
    - Ice Cream Log Pages/seed-transcription-sidecar.json
    - .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-09-PLAN.md
    - .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-CONTEXT.md
decisions:
  - "Mocha v2's rows are read from the printed page IMG_2465, not the re-saved Mocha v2.ier (which holds v3's own milk/sucrose/dextrose values) — Mark 2026-09-25, answer 1, the Mexican Chocolate v3 photo-wins precedent."
  - "Underbelly Light Base v1 is seeded entirely from the comparisons workbook's own column G, with a tasted batch built from its four verdict rows and no churn date — Mark 2026-09-25, answer 4."
  - "Seven createdAt values (standard-base-v1/v2, underbelly-light-base-v1, strawberry-v2, mocha-v0/v1/v2) are ordering placeholders, each labelled in code and in the review; every other new createdAt is a real print timestamp or .ier save time — Mark 2026-09-25, answer 2."
  - "Pineapple v1 and Coconut v1/v2's invented placeholder dates are replaced with their own .ier files' save times, converted to UTC; each batch's recordedAt now tracks its version's own createdAt rather than a second literal — decision 4."
metrics:
  duration: ~70min
  completed: 2026-09-25
actuals:
  tokens: 37438
  tasks: 3
  commits: 4
  plan_head_before: 2ec4cce
---

# Quick Task 260925-lpd: Seed Standard Base, Underbelly Light Base, Strawberry and Mocha Summary

`transcribedRecipeGroups` now holds seven recipes: Mexican Chocolate, Pineapple, Coconut, Standard Base, Underbelly Light Base, Strawberry and Mocha — eleven new versions, six new library entries, seven batches with workbook-sourced verdicts, and seven ordering-placeholder dates awaiting Mark's real values.

## What Was Built

- **Six library entries** (`app/src/data/library.js`): `wholeMilk35`, `wholeMilk37`, `coffeeBeans`, `strawberries`, `driedStrawberry` (all `basis: 'estimated'`, sourced from the latest `.ier` file that defines each name where files disagree), and `almondExtract` with an empty composition/basis (no Ice Ed file defines it; D-03, never zeroed).
- **`app/src/data/strawberry.js`**: V1 → V2 → V2.1, transcribed from IMG_2455-2457, their `.ier` exports and comparisons-workbook columns E/D/C. Three binder batches, each tasting note ending with the workbook's own verdict line. V2's createdAt is an ordering placeholder (no print timestamp; the `.ier`'s own time is the archive stamp, later than V2.1's print).
- **`app/src/data/mocha.js`**: v0 → v1 → v2 → v3, with v2's fourteen rows read from the printed page IMG_2465 (not the re-saved `Mocha v2.ier`, whose values match v3's instead — recorded only in the sidecar's `iceEdExportFlag`). Batches on v0, v2 and v3 only; v1 has none. Four ordering placeholders (v0, v1, v2's createdAt) and one real value (v3's own `.ier` save time).
- **`app/src/data/standard-base.js`**: v1 → v2 from `Standard Base.ier`/`Standard Base-2.ier`, both createdAt ordering placeholders tied to the same archive-stamp second, no batch (no binder page, no workbook column).
- **`app/src/data/underbelly-light-base.js`**: v1 seeded entirely from the comparisons workbook's column G (eight rows, no gellan split, `iceEd` all `null` — the olive-oil "no spec" precedent) with a tasted batch from its four verdict rows; v2 from its own `.ier`, parent v1, no batch, a real createdAt.
- **`app/src/data/seed-recipes.js`**: `transcribedRecipeGroups` now reads Mexican Chocolate, Pineapple, Coconut, Standard Base, Underbelly Light Base, Strawberry, Mocha — the order Mark approved.
- **`app/src/data/pineapple.js`, `coconut.js`**: the three invented placeholder `createdAt` values are replaced with each version's own `.ier` file's save time, converted to UTC; each batch's `now` now reads its version's `createdAt` directly rather than repeating a literal.
- **`app/src/data/seed-recipes.test.js`**: new describe blocks per recipe (row tables, record fields, batch/tasting fields, rail names/standings), a Pineapple/Coconut date-and-recordedAt test, a group-order test, and a generic any-group chain invariant that now covers all seven groups (recipeId match, strictly ascending createdAt, parent chaining, rail-name equality, batch-versionId membership) — 24 new tests (20 baseline -> 44), 1294 total across the suite.
- **`03.5-SEED-REVIEW.md`**: a source row, a full section (Source, Field-by-field, Ingredient mapping, Judgement calls 38-52) and a states-coverage row for each of the eleven new versions; an "Across the 2026-09-25 additions" section naming Mark's six decisions and four answers; a "Comparisons workbook" section with the column-mapping table and the four decision-3 conflicts; open questions 9-16 appended; open question 5 and judgement calls 15/19/22 resolved.
- **`seed-transcription-sidecar.json`**: four new top-level keys (`standard-base`, `underbelly-light-base`, `strawberry`, `mocha`) with `spec`/`errorFlags`/`printedTimestamp`, `kcalPer100gByIngredient` for `.ier`-only versions, `notesText`/`notesFlag` for versions whose typed Notes were not wholly transcribed, `mocha-v2`'s `iceEdExportFlag`, and `comparisonsWorkbook` entries on every workbook-mapped version — inserted by hand, the existing entries untouched.
- **`03.5-09-PLAN.md`**: truths, files, read_first and the human-check now name all eight recipes and the four new modules, so plan 09's own "fix the data, never the assertion" rule cannot silently drop them.
- **`03.5-CONTEXT.md`**: D-05 gains a nested "Amended 2026-09-25" bullet recording the four-recipe extension, D-01's amendment style.

## Deviations from Plan

None — plan executed exactly as written. Every reading the plan stated was independently re-verified against the source (binder photos converted with `sips` and viewed directly, `.ier` files read as JSON, the comparisons workbook parsed with Python's `zipfile`/`xml.etree`) before being transcribed into code; no discrepancy was found between the plan's stated values and the sources.

## Known Stubs

None.

## Test Results

- `npm --prefix app test -- src/data/seed-recipes.test.js`: 44/44 passed (20 baseline + 24 new, across all three tasks' additions).
- `npm --prefix app test` (full suite): **1294/1294 passed**, 49 test files.
- `git diff --name-only 9afe794 -- app/src/store`: empty (nothing under the store changed; no DB, store or version-schema constant moved).

## Self-Check: PASSED

- `app/src/data/standard-base.js` — FOUND, exports `standardBaseV1`/`standardBaseV2`, contains `standard-base-v2`.
- `app/src/data/underbelly-light-base.js` — FOUND, exports `underbellyLightBaseV1`/`V2`, contains `underbelly-light-base-v2`.
- `app/src/data/strawberry.js` — FOUND, contains `strawberry-v2-1`.
- `app/src/data/mocha.js` — FOUND, contains `mocha-v0`.
- `app/src/data/seed-recipes.js` — FOUND, `transcribedRecipeGroups` holds seven groups in the approved order.
- `.planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-SEED-REVIEW.md` — FOUND, contains `## Comparisons workbook` and `## Across the 2026-09-25 additions`.
- `Ice Cream Log Pages/seed-transcription-sidecar.json` — FOUND, parses; all four new recipe keys present with the specified per-version fields; existing `mexican-chocolate` entries intact.
- Commit `155bbc9` — FOUND in `git log --oneline` (Task 1: Strawberry + library).
- Commit `a598920` — FOUND in `git log --oneline` (Task 2: Mocha, Standard Base, Underbelly Light Base).
- Commit `5e51a19` — FOUND in `git log --oneline` (Task 3a: Pineapple/Coconut dates).
- Commit `727896b` — FOUND in `git log --oneline` (Task 3b: review/sidecar/plan-09/D-05 docs).
