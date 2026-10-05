---
phase: quick-261004-szl
plan: 01
subsystem: ui
tags: [batch-row, provenance, cleanup]
status: complete
requires: []
provides:
  - "Batch read view Recorded row shows the record date alone"
affects: [app/src/ui/BatchRow.jsx, app/src/ui/RecipePage.jsx]
key-files:
  modified:
    - app/src/ui/BatchRow.jsx
    - app/src/ui/BatchRow.test.jsx
    - app/src/ui/BatchRow.dates.test.jsx
    - app/src/ui/BatchRow.signed.test.jsx
    - app/src/ui/RecipePage.jsx
decisions:
  - "Recorded row drops the 'against <version>' suffix (Mark, 2026-10-04); the page already shows the version"
metrics:
  tasks: 2
  files: 5
actuals:
  tokens: 3000
  tasks: 2
  commits: 3
plan_head_before: f28102440f5f4c46c39532100f2e81894fb8affd
plan_head_after: 91e474aac1047b804701ce53b03b4382aea59fcf
completed: 2026-10-04
---

# Quick 261004-szl: Drop the "against <version>" suffix from the Recorded row

The batch read view's Recorded row now prints the record date alone, and the version-name value that only fed the old suffix is gone from RecipePage, BatchRow and the test fixtures.

Everything went as planned. No deviations.

## Before and after

- Before: `<dt>Recorded</dt><dd>4 Aug 2026 against Version 1 · 50 g oil · 800 g</dd>`
- After: `<dt>Recorded</dt><dd>4 Aug 2026</dd>`

## Commits

| Commit  | Message |
| ------- | ------- |
| bb10c28 | test(261004-szl): pin the Recorded row as the record date alone |
| ce751ea | fix(261004-szl): the batch read view's Recorded row shows the date alone |
| 91e474a | refactor(261004-szl): drop the version name the Recorded row no longer uses |

## RED and GREEN

- RED: `npm --prefix app test -- src/ui/BatchRow.test.jsx -t "Recorded fact"` failed against the old component. Received dd text: `4 Aug 2026 against Version 1 · 50 g oil · 800 g`.
- GREEN: same filtered run passed after the fix (1 passed). The three BatchRow files together: 3 files, 179 tests passed, same as the baseline. `grep -nw versionName app/src/ui/BatchRow.jsx` prints nothing.

## Orphans removed

Each was grepped first and had no other use.

- `versionName = null,` prop and its four-line comment in BatchRow.jsx: the only read was the dd line (`grep -rnw versionName app/src` showed BatchRow.jsx 426 and 1118 only, plus RecipePage and fixtures).
- RecipePage.jsx: the `versionName={versionName}` prop on `<BatchRow>`, and the four-line comment plus the const computing it.
- RecipePage.jsx lineage import: `sortedVersions` and `versionIdentity` (`grep -nw` showed them only in the import and in the removed const/comment).
- The `versionName="Version 1 · 50 g oil · 800 g"` fixture line in BatchRow.test.jsx, BatchRow.dates.test.jsx and BatchRow.signed.test.jsx.

After the change `grep -rnw versionName app/src` and `grep -nwE 'sortedVersions|versionIdentity' app/src/ui/RecipePage.jsx` both print nothing.

## Kept

`versionsForRecipe` stays imported in RecipePage.jsx: it is still used at line 1838 (`scopedVersions`). The grep prints the import (13) and that use.

## Full suite

`npm --prefix app test`: 62 files, 1679 tests, all passed. No test removed (the only test change is the renamed Recorded-fact test plus deleted fixture lines).

## Scope check

`git log --name-only --format= --grep="261004-szl" -- app/` lists only: BatchRow.jsx, BatchRow.test.jsx (two commits), BatchRow.dates.test.jsx, BatchRow.signed.test.jsx, RecipePage.jsx. No file deletions in the commits.

## Not done, on purpose

- No build and no Vite process: the build rewrites app/dist, which the :4173 preview server serves. Vitest runs only.
- No device check: the change removes text from one dd and the unit test pins the exact markup.
- This SUMMARY is not committed; the orchestrator handles the docs commit. The unrelated uncommitted files (.planning/STATE.md and untracked critique, quick-batch and todo files) were left alone.

## Known Stubs

None.

## Self-Check: PASSED

Commits bb10c28, ce751ea, 91e474a exist; the five files exist and the greps above hold.
