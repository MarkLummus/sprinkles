---
phase: quick-261018-x4u
plan: 01
subsystem: ui
tags: [ingredients-place, facts-line, copy]
requires: []
provides:
  - "Value-first facts line on the Ingredients place (decide-p9-facts-line-shape)"
affects: [app/src/ui/IngredientsPlace.jsx]
key-files:
  modified:
    - app/src/ui/IngredientsPlace.jsx
    - app/src/ui/IngredientsPlace.test.jsx
decisions:
  - "Hydration always shows the stored figure (trimmed(x, 2) + ' °C'); the source prose is neither a replacement nor an addition"
status: complete
commits: 1
plan_head_before: 79e540f5951b173fdf2034b8a1450468b8f9faa0
plan_head_after: 64169285
actuals:
  tasks: 1
  commits: 1
completed: 2026-10-18
---

# Quick 261018-x4u: Value-first facts line Summary

An open Ingredients entry now reads its facts value-first: "Density 0.994 g/ml · Ultra-pasteurised · Granulated, loose · Hydrates at 82 °C".

## What changed

- `factsText` in `app/src/ui/IngredientsPlace.jsx`: heat treatment and packed state push `capitalised(value)` with no label; hydration always pushes `Hydrates at ${trimmed(hydrationC, 2)} °C`. Order, guards and the middle-dot join are unchanged. Comment rewritten in plain English.
- `shownFields`: removed the `hydrationSource` key, which nothing reads now. The `source` local stays (used by `sourceOf`).
- Tests: four pinned expectations rewritten (Heavy cream, Locust bean gum, Sucrose, T-09-06 escape case) and one new four-fact case added.

## Verification

- RED first: exactly the five targeted cases failed for the expected reasons (label prefixes and source prose).
- `npm --prefix app test -- IngredientsPlace`: 29 passed (28 plus 1).
- `npm --prefix app test`: 113 files, 3468 tests passed (base 3467 plus 1).
- `npm --prefix app run build`: succeeds (only the pre-existing chunk-size warning).
- Grep gates: 0 non-comment lines with the old labels or `hydrationSource`; both `capitalised(fields.heatTreatment)` and `capitalised(fields.packedState)` present.
- `git show --stat HEAD` lists exactly the two files.

## Commits

- 64169285: feat(ingredients): value-first facts line (decide-p9-facts-line-shape)

## Deviations from Plan

The plan file was not present in the worktree (it was uncommitted in the main checkout at base 79e540f5); it was read read-only from `/Users/mark/Documents/projects/sprinkles/.planning/quick/261018-x4u-.../261018-x4u-PLAN.md`. No change to the work itself. Otherwise none; plan executed as written.

## Notes for the orchestrator

- `.planning/sketches/012-places` was not touched (out of scope per plan); it may still show the old labelled facts wording and needs a separate pass.
- Threat T-x4u-01: values stay React text children; the escape case still yields `&lt;u&gt;hot&lt;/u&gt;` with no `u` element.

## Known Stubs

None.

## Self-Check: PASSED

- app/src/ui/IngredientsPlace.jsx and IngredientsPlace.test.jsx: found, modified in commit 64169285.
- Commit 64169285 is an ancestor of HEAD.
