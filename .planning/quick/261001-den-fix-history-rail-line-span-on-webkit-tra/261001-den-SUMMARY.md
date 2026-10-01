---
phase: quick-261001-den
plan: 01
subsystem: ui
tags: [history-rail, webkit, css-calc, band-probe]
requires: []
provides:
  - "History track sized from the entry count and node tokens, independent of the strip's intrinsic width"
affects: [app/src/ui/RecipeHistory.jsx, app/src/styles/notebook.css]
tech-stack:
  added: []
  patterns: ["layout count passed as an inline custom property, read by a CSS calc()"]
key-files:
  created: []
  modified:
    - app/src/ui/RecipeHistory.jsx
    - app/src/ui/RecipeHistory.test.jsx
    - app/src/styles/notebook.css
    - app/src/styles/notebook.test.js
    - app/src/styles/tokens.test.js
    - .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-band-probe.mjs
key-decisions:
  - "Track width is (count - 1) x (node width + node gap) from an inline --app-notebook-history-count; left unchanged, no right edge (D-01)"
  - "The count is named in tokens.test.js LOCALLY_SET_CUSTOM_PROPERTIES; tokens.css untouched (D-02)"
requirements-completed: [UX1-03]
status: complete
actuals:
  tokens: 3800
  tasks: 2
  commits: 3
plan_head_before: 41dc46aa35ede884486f6a1d570ea22c30f22114
plan_head_after: c30d95d9cdd1985ed01a1e228db881c30cebe0cd
completed: 2026-10-01
---

# Quick 261001-den: History rail line span on WebKit Summary

The History track's gray line now ends at the last mark's centre by arithmetic from the entry count, so it no longer depends on the width WebKit gives the strip. Reproduced and confirmed fixed in Playwright WebKit 26.6.

Ran in the main checkout, on main, not a worktree. app/dist was rebuilt from the fixed source, which is what the :4173 preview serves.

## Verification status: engine-verified, device-unverified

The fix is verified in the WebKit engine, not on Mark's iPad.

- Playwright WebKit 26.6 (the same engine family as Safari on iPad) reproduced the bug on the pre-fix build and shows it fixed on the post-fix build, at 1366x1024, coarse and fine.
- This is evidence, not the device. The iPad itself is unverified until Mark checks it.
- The cause turned out to be broader than the plan's hypothesis. WebKit sizes the max-content strip from the nodes' text widths and ignores their 168px flex-basis, so the strip is 524.5px wide where Chromium gives 756px. It is not only the missing flex gap. The arithmetic fix does not read the strip's width, so it holds either way.
- After the fix WebKit still draws a strip 524.5px wide, with the last node (right edge 1006) overflowing it visibly. That was already so before the fix and is unchanged; only the track no longer follows the strip.

What Mark checks on the iPad: landscape, a recipe with four versions, hard-reload the :4173 preview first. The gray line should end at the fourth mark's centre, with no change to node positions, the left fade or scroll-to-view. If it still stops short there, measure the real app on the device through the proxy method rather than guessing again.

## WebKit readings (scratchpad rail-probe.mjs, /notebook/mexican-chocolate/mexican-chocolate-v4, 4 versions, 1366x1024)

| Engine, pointer | Build | Strip width | Track right edge minus last mark centre |
|-----------------|-------|-------------|------------------------------------------|
| WebKit coarse   | before | 524.5 | -231.5 |
| WebKit fine     | before | 524.5 | -231.5 |
| WebKit coarse   | after  | 524.5 | 0 |
| WebKit fine     | after  | 524.5 | 0 |
| Chromium coarse/fine | after | 756 | 0 |

After the fix the track runs 268 to 844 in WebKit, first mark centre to last mark centre (576px = 3 x 192), identical to Chromium. The WebKit script was not added to the repo.

## Commits

- 8903787 `test(261001-den)`: RED, count markup and track width pinned
- df69407 `fix(261001-den)`: count on the strip, track sized from it, tokens.test names the count
- c30d95d `test(261001-den)`: band probe short-strip and three-entry checks

## Results

**Task 1 RED** (RecipeHistory.test.jsx and notebook.test.js): 5 failed, 49 passed. The strip-structure test, the three count tests and the track-width test failed; the upright and lone-version "no count" test already held.
**Task 1 GREEN:** full suite 1421 passed (baseline 1417, plus 4 new; the strip test was edited and the track test replaced, none removed). Build clean. `probe rail 1920`: 13 checks passed.

**Task 2 RED** (pre-fix RecipeHistory.jsx and notebook.css restored from 41dc46a, rebuilt, `rail,history 1366,1920`): exit 1, 4 failed, nothing else:
```
FAIL rail width=1366: with the strip 24px short the track's right edge is at the last mark's centre (off by -24)
FAIL rail width=1920: with the strip 24px short the track's right edge is at the last mark's centre (off by -24)
FAIL history width=1366: with the strip 48px short the track's right edge is at the last mark's centre (off by -48)
FAIL history width=1920: with the strip 48px short the track's right edge is at the last mark's centre (off by -48)
band probe: 4 failed
```
**Task 2 GREEN** (fixed source, rebuilt): `rail,history 1366,1920` exit 0, 110 checks passed. Wider run `rail,history,folds,rhythm 393,723,1024,1365,1366,1920` exit 0, 651 checks passed (plan 03.5-24 recorded 630; the 21 extra are the new checks). Final suite after the probe commit: 1421 passed.

Acceptance checks: `git diff --name-only 41dc46a..HEAD -- app` lists exactly RecipeHistory.jsx, RecipeHistory.test.jsx, notebook.css, notebook.test.js, tokens.test.js; tokens.css has no diff; `git status --short app` is empty; the final app/dist has the count in a CSS asset (index-VpPR12Ph.css) and a JS asset (index-BuVme-F3.js).

## Deviations from Plan

None. One addition requested by the orchestrator: the before and after WebKit readings above. The band probe got no WebKit variant.

## Self-Check: PASSED

Files modified exist; commits 8903787, df69407, c30d95d are on main; `plan_head_before` and `plan_head_after` measured from the ledger (3 commits).
