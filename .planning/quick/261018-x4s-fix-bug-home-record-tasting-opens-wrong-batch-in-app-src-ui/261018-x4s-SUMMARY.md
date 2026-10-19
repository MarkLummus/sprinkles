---
phase: quick-261018-x4s
plan: 01
subsystem: ui
tags: [home, routing, bug-fix]
status: complete
key-files:
  modified:
    - app/src/ui/RecipeList.jsx
    - app/src/ui/RecipeList.test.jsx
decisions:
  - "Home keeps Record a tasting when the awaiting batch belongs to an older version and opens that batch under its own version"
metrics:
  completed: 2026-10-18
actuals:
  tasks: 2
  commits: 2
plan_head_before: 79e540f5951b173fdf2034b8a1450468b8f9faa0
plan_head_after: fe240415a4f71a1d5d7fd33e6b6360f1e764812e
commits: 2
---

# Quick 261018-x4s: Home's Record a tasting opens the awaiting batch under its own version

Home's Record a tasting link now pairs the newest batch with the version that batch was recorded against, so a recipe whose latest version (v4) has no batch yet links to `/notebook/mexican-chocolate/mexican-chocolate-v3/batch/mexican-chocolate-v3-batch-01` instead of the v4/v3-batch address that v4's page does not hold.

## Behaviour decision

Keep the action. When the latest version has no batch and the newest batch (recorded against an older version) still awaits a tasting, Record a tasting stays and points at that batch under its own versionId. Keep developing still goes to the latest version. The standing is recipe-wide on purpose (`standingFor` in `lastEvent.js`), the row word reads "Awaiting tasting" from that same standing, and the band already navigates to the batch's own address.

## Commits

- `746908c7` test(quick-261018-x4s): reproduce Home Record a tasting v4/v3 wrong-batch link (red; Test A failed, split length 1 vs 3)
- `fe240415` fix(quick-261018-x4s): pair Home's Record a tasting batch with its own version (green)

## What changed

- `app/src/ui/RecipeList.jsx`: RowActions' AWAITING_TASTING branch takes `entry.batches[0]` as `awaiting` and builds `notebookPath(entry.id, awaiting.versionId, awaiting.id)`. Header comment sentence updated. Nothing else touched; no route state added.
- `app/src/ui/RecipeList.test.jsx`: new describe block with Test A (HomeBody, v4 latest, v3 awaiting batch: corrected href exactly twice, no `v4/batch/` link, v4 recipe link present) and Test B (newer awaiting batch on v4 links under v4, no stale v3 batch link).

## Verification

- Targeted run (RecipeList.test.jsx + RecipeList.nextVersion.test.jsx): 54 tests passed (52 baseline + 2).
- Full suite: 113 files, 3469 tests passed (baseline 3467 + 2).
- Production build to a scratch outDir: exit 0 (chunk-size warning only, pre-existing).
- Grep checks: `awaiting.versionId` pairing count 1; old pairing count 0; `mexican-chocolate-v3-batch-01` present in the test.
- `RecipeList.nextVersion.test.jsx` untouched and green.

## Deviations from Plan

None - plan executed as written. One placement note: the new describe block sits after the "HomeBody - the recipe record is the name's source" block rather than directly after the App marks grammar block, so it follows the `renderBody` helper it uses.

## Open question for Mark

Home's Record a tasting still lands with no route state, so it opens the batch log, not the tasting pen (no `startTasting` state, pinned by quick 261012-e8l, RecipeList.nextVersion.test.jsx test 3). Whether Home should also send the band's `startTasting` state is a separate behaviour change Mark has not decided. The bug report's "no pen open" wording is explained by the wrong address; the pen question remains.

## Known Stubs

None.

## Threat Flags

None. The path is still built only through `notebookPath` (encodeURIComponent per segment).

## Self-Check: PASSED

- app/src/ui/RecipeList.jsx and RecipeList.test.jsx modified: FOUND
- Commits 746908c7 and fe240415 reachable from HEAD: FOUND
