---
phase: quick-261005-db4
plan: 01
quick_id: 261005-db4
subsystem: ui
tags: [recording, as-made, ingredient-table, sketch-011-decision-56]
requires: []
provides:
  - "Recording and Correct read a split ingredient with one line left like the reading Sheet: no portion line, field named without a portion"
  - "A row with two or more lines drawn numbers its as-made fields by the lines drawn, values kept at the stored index"
affects: [app/src/ui/IngredientTable.jsx]
tech-stack:
  added: []
  patterns: ["name by lines drawn, read and write by stored index"]
key-files:
  created: []
  modified:
    - app/src/ui/IngredientTable.jsx
    - app/src/ui/IngredientTable.test.jsx
    - app/src/ui/IngredientTable.remove.test.jsx
    - app/src/ui/RecipePage.perStep.test.jsx
key-decisions:
  - "Sketch 011 README decision 56, Mark's answer A recommended (2026-10-05), built as briefed"
requirements-completed: [BATCH1-01]
metrics:
  duration: "about 15 minutes"
  completed: 2026-10-05
status: complete
commits: 2
plan_head_before: d4b6bb5
plan_head_after: f267b7eeb8b6cd0ad66f1a03b2d59ff85139448d
actuals:
  tokens: 6000
  tasks: 2
  commits: 2
---

# Phase quick-261005-db4 Plan 01: Recording reads like the Sheet Summary

On Olive Oil v2 (Whole milk's Step 2 line out), recording and Correct now draw Whole milk once with no portion line and one as-made field named "Whole milk, as made, grams", while every value stays written and read at its stored index.

## What changed

All in `app/src/ui/IngredientTable.jsx`:

- `renderReadingEntry`: `isSplit` is now `liveRow.portions.length > 1` in every mode. The recording ternary that kept the stored count is gone, and the comment above it is rewritten to cite decision 56.
- `AsMadeCell` takes a `drawnRow` prop (default `row`). In the recording branch `multiPortion` reads `drawnRow.portions.length > 1`, and the field's number is the line's 1-based position in `drawnRow.portions`, found by matching `line.index ?? i` against the stored `portionIndex`. With one line drawn there is no portion in the name.
- The reading call site passes `drawnRow={liveRow}`. The Show changes and pen call sites are untouched; they draw every stored line, so the stored row already is the lines drawn there.

Why nothing stored changes: the field's value is still `draftValues[portionIndex]` and its onChange still calls `onChangeAsMade(row.id, portionIndex, ...)`, both at the stored index. RecipePage, `buildChurnFieldsFromDraft`, `draftFromBatch` and `asMadeTotals` are untouched. Only the accessible name and whether one text span is drawn changed.

## Commits

- b3293f6 `test(261005-db4)`: R1 to R6 and the perStep mock extension (three test files only)
- f267b7e `feat(261005-db4)`: the component (IngredientTable.jsx only)

The test commit comes before the feat commit. Nothing pushed.

## Test cases and their RED failures

RED run (before the component change): 6 failed, 118 passed in the three files. Every other case, including all named guards, passed.

| Case | File | RED message |
| ---- | ---- | ----------- |
| R1 (case D flipped) | IngredientTable.test.jsx | `expected ' aria-label="Whole milk, 250.4 g, est…' not to contain 'ingredient-table__portion-note'` |
| R2 (03.6-03 recording case, value="250") | IngredientTable.test.jsx | `expected '<table class="ingredient-table ingred…' to match /<input[^>]*aria-label="Whole milk, as made, grams" value="250"\/>/` |
| R3 (two of three lines, new describe) | IngredientTable.test.jsx | `expected '<table …' to match /…aria-label="Whole milk, as made, grams, portion 2" value="249"\/>/`; received "portion 1" and "portion 3" |
| R4 (one field, stored index 1) | IngredientTable.remove.test.jsx | `TypeError: Cannot read properties of null (reading 'value')` (no field without a portion) |
| R5 (two of three, indexes 2 and 0) | IngredientTable.remove.test.jsx | `TypeError: Cannot read properties of null (reading 'value')` (no "portion 2" field; it was "portion 3") |
| R6 (Olive Oil v2 end to end) | RecipePage.perStep.test.jsx | `expected <span …(1)></span> to be null` (the Whole milk portion note was still drawn, at step (b)) |

R6 covers record, type 245 / 12.5 / 63, total "Total, plan 679.7 grams, as made 673.8 grams", Save batch storing `row-01` `[null, 245]` and `row-05` `[12.5, 63]`, the saved reading "Whole milk, 250.4 g, estimated, as made 245 g", and Correct reopening '245', '12.5', '63' with the same total. After the change it passes, including every step past (b). The perStep mock gained `batches` and `saveBatch` in the recordTasting pattern with no change to existing cases.

## Verification

- `npm --prefix app test -- IngredientTable.test IngredientTable.remove RecipePage.perStep`: 3 files, 124 tests, all pass.
- `npm --prefix app test` (full, including tabindex-scan): 63 files, 1860 tests, exit 0.
- `npm --prefix app run build`: exit 0.
- `grep` checks: `const isSplit = liveRow.portions.length > 1;` 1, `const isSplit = row.portions.length > 1;` 2, `const isSplit = ` 3, `drawnRow={liveRow}` 1. "decision 56" is present in all three test files.
- Scope: `git status --porcelain -- app/` empty; `git diff --name-only d4b6bb5..HEAD -- app/` lists only the four planned files; nothing under app/src/styles, domain, store or RecipePage.jsx changed. The two commits touch nothing under .impeccable, DESIGN.md, PRODUCT.md, .planning/sketches, .planning/canvas-generators, CLAUDE.md or .planning/state.json.

## Deviations from Plan

None - plan executed exactly as written. One note on process: the plan's pre-commit assertion in the executor protocol would refuse a commit on `main`; the orchestrator's instruction for this run was explicit that it runs sequentially on `main` with normal commits, so that instruction was followed.

## Notes

- `03.6-CONFORMANCE.md` "Open for Mark" item 2 and the sketch 011 README still describe the build before this change. This quick edited neither; whoever owns them updates them.
- No stubs added. No new threat surface: the write path is unchanged (T-261005-db4-01 mitigated by R2, R4, R5, R6 pinning the stored index).

## Not verified

- iPad (1366, coarse) and iPhone (393): not checked on a device. Only jsdom and static-markup tests ran.

## Deferred Human Verification

Suggested checks for decision 56. Serve with `npm --prefix app run build && npm --prefix app run preview -- --host`, never the dev server.

On the iPad (1366) and the iPhone (393):

1. Open Olive Oil v1, press Next version, remove Whole milk's Step 2 line, and save.
2. Press Record a batch. Whole milk reads once with no "of 250.4 g" line under it, and VoiceOver reads its as-made field as "Whole milk, as made, grams" with no portion.
3. Type 245 in Whole milk, 12.5 and 63 in Sucrose. The as-made total reads 673.8 g.
4. Save, then press Correct. The same three values come back.

No Mark's List rows filed; the orchestrator does that.

## Self-Check: PASSED

- b3293f6 and f267b7e exist in `git log`.
- All four modified files exist and are committed; SUMMARY exists at the path above.
