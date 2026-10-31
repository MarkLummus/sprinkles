---
phase: quick-261031-fyo
plan: 01
subsystem: ui
tags: [copy, buttons, sketch-014-decision-11, look-button-words]
status: complete
commits: 3
plan_head_before: 1681f2fddcd34f3c0957c6913075daa61a87ff5c
plan_head_after: 2d50ac10b03d843dffabafe5ee0549e9768184a7
actuals:
  tasks: 3
  commits: 3
requirements:
  - look-button-words
key-files:
  modified:
    - app/src/ui/BatchRow.jsx
    - app/src/ui/VersionRow.jsx
    - app/src/ui/RecipeList.jsx
    - app/src/ui/IngredientTable.jsx
    - app/src/ui/Method.jsx
    - app/src/ui/useVersionPen.js
    - .planning/phases/11-steps-structure-save-and-print/11-walk.mjs
---

# Quick 261031-fyo: Boxed buttons read sentence case without articles

Five boxed-button labels now follow sketch 014 decision 11, with the tests, titles and comments that quote them.

| Was | Now |
|---|---|
| Record a batch | Record batch |
| Record a tasting | Record tasting |
| Save as a new version | Save as new version |
| remove this row | Remove this row |
| done differently | Done differently |

## Commits

- `c1bf9258` Record batch (BatchRow, VersionRow, RecipeList; 14 files)
- `e6070b73` Record tasting (VersionRow, RecipeList plus comments; 17 files)
- `2d50ac10` Save as new version, Remove this row, Done differently, Phase 11 walk (15 files)

## Results

- RED: after editing Task 1's tests only, `npm --prefix app test` failed 17 tests (9 files). All three tasks end at 4237 passed in 130 files, the same as at 2beebaa2.
- Old-label gate (multi-line perl over app/src and the Phase 11 walk): 0.
- Lower-case "done differently" remains only on the two `fieldLabel(step, false, 'done differently')` aria-label lines in Method.jsx and the two input aria-label regexes in Method.test.jsx.
- `git diff 2beebaa2 -- app/src/ui/Method.jsx` has no change to either fieldLabel line.
- The 'record-a-tasting' opener value is still on 23 lines.
- Net line change in app/ against 2beebaa2: -1 (VersionRow.test.jsx line 191, the duplicate `not.toContain`).

## Decisions

1. Done differently keeps its accessible name, "Step N, done differently" (decision 11's WCAG 2.5.3 ruling). Method.test.jsx's opener regex now pins name and visible text on the same button; the negative regex uses the new visible text.
2. VERSION_HAS_BATCH_STATUS (useVersionPen.js) now reads "This version has a batch now. Save as new version instead." This is the one visible string outside decision 11's table. It changed because it names the button; a stale name would send the maker looking for words not on screen. RecipePage.stalePen.test.jsx matches it exactly.

## What stayed, and why

- Identifiers: the 'record-a-tasting' opener value, recordTastingButtonRef, onStartTasting, startTasting, AWAITING_TASTING.
- Lower-case prose "record a batch" in app/src/store/repository.js (describes the act, not the label).
- "remove this step" comments (Method.jsx, useVersionPen.js, penDraft.js), which belong to db1b2c06.
- "Record another batch" in RecipePage.test.jsx (not one of the five).
- Busy labels Saving new version… and Saving this version….
- Old words still outside app/src: the Phase 08, 09 and 10 walks (records of completed phases), sketches 010 and 011 with their canvas generators (decision 11 keeps them as the record), and DESIGN.md line 611 (Impeccable's).

## Deviations from Plan

None. The edits were applied with a perl word-swap script over the planned files (same-line and comment-split forms) rather than line by line; the resulting file sets matched the plan's 14, 17 and 15 files exactly.

## Verification limits

- Not iPad-verified.
- app/dist was not rebuilt and no build was run, so Mark's 4173 preview shows the old words until he builds. The Phase 11 walk was only syntax-checked (`node --check`), not run.
- Mark's List was not touched; the orchestrator closes the `look-button-words` row.

## Self-Check: PASSED

Commits c1bf9258, e6070b73 and 2d50ac10 are ancestors of HEAD; suite 4237 passed.
