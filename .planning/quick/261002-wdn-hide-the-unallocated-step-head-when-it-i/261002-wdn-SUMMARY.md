---
phase: quick-261002-wdn
plan: 01
subsystem: ui
tags: [ingredient-table, step-head, unallocated, coconut]
requires: []
provides:
  - "IngredientTable draws no step-head row when its only group is Unallocated"
affects: [app/src/ui/IngredientTable.jsx]
tech-stack:
  added: []
  patterns: ["showStepHeads guard derived from the groups array; groupPortionsByStep unchanged"]
key-files:
  created:
    - .planning/quick/261002-wdn-hide-the-unallocated-step-head-when-it-i/261002-wdn-probe.mjs
    - .planning/quick/261002-wdn-hide-the-unallocated-step-head-when-it-i/261002-wdn-baseline.json
  modified:
    - app/src/ui/IngredientTable.jsx
    - app/src/ui/IngredientTable.test.jsx
key-decisions:
  - "A lone Unallocated head is hidden; any numbered group alongside it keeps both heads (Mark, 2026-10-02, option 1)"
requirements-completed: [REC1-01]
duration: ~20min
completed: 2026-10-02
status: complete
commits: 5
plan_commits: 3
plan_head_before: e129f29ca4e81f5ea937898e1ec5a6c71b8f262e
plan_head_after: 5e2714248e15578dfc30cce27709521a936a45e5
actuals:
  tokens: 5500
  tasks: 3
  commits: 5
---

# Phase quick-261002-wdn Plan 01: Hide a lone Unallocated step head Summary

The ingredient table no longer draws an "Unallocated" step-head row when that is its only group (Coconut v1 and v2); every portion row and the Total are unchanged, and numbered or mixed tables keep their heads.

Note on `commits`: the measured range `plan_head_before..plan_head_after` holds 5 commits. Three are this plan's (`cd3552e` RED test, `37ed3c1` GREEN fix, `5e27142` probe comparison fix). The other two (`ab5449c`, `2305fdf`) are Sid's sketch-011 docs commits that landed on main during the run and are not part of this plan.

## The rule as built

In `app/src/ui/IngredientTable.jsx`, right after the `groups` line: `const showStepHeads = !(groups.length === 1 && groups[0].displayNumber == null);`. The step-head `<tr>` renders only when `showStepHeads` is true. The Fragment, its key and the entries map are untouched; `groupPortionsByStep`, `columnCount`, the row renderers, the tfoot and all CSS are unchanged. One sentence was added to the component comment stating the rule and citing "Mark, 2026-10-02, option 1".

RED then GREEN (`IngredientTable.test.jsx`, describe block "a lone Unallocated group renders no step head (261002-wdn)"):

| Test | Case | Before the change | After |
| --- | --- | --- | --- |
| A | reading, every portion unresolved (both an empty map and a null map): no head, 2 tbody rows, Total present | FAIL (one head rendered) | pass |
| B | Show changes, lone Unallocated: no head, `struck-value` still present | FAIL | pass |
| C | pen with its only step removed: no head, one grams input per portion | FAIL | pass |
| D | guard: mixed numbered + Unallocated keeps both heads, in reading and in the pen | pass | pass |
| E | guard: numbered-only table keeps one head per group, no Unallocated | pass | pass |

D and E are regression guards: they passed before and after, by design.

## Audit (Task 2)

(a) `grep -rn "step-head" app/src` and `"Unallocated"` hit exactly what the plan listed, and no new hit: IngredientTable.jsx (render and comments), IngredientTable.test.jsx (stripStepHeadRows at 136, the numbered-head test at 699, the mixed test at 749, the colSpan regex at 869, and this task's block), app.css (905, 914, 2529), cross-cutting.test.js:289 (selector-order pin, unaffected because CSS is unchanged), tokens.css 464-465 (`--sheet-narrow-step-pad-t/-b`, still used by numbered tables, so they stay).

(b) No row-position selector depends on the head being the first tbody row. The only structural pseudo-class hits are the within-row cell rules `td.ingredient-table__col-numeric:nth-last-child(2)` and `:last-child` (app.css 2559 and 2565). `.ingredient-table tbody tr.is-marked` (975) and `tbody` display:block (2513) are not position-dependent. The `@media print` block (from 2696) carries no ingredient-table rule. The probe backs this up: every remaining row's cell boxes match the baseline within 0.5px.

(c) IngredientTable has one consumer, `RecipePage.jsx:1951`, so the Sheet, print, Show changes, recording and the pen all render the same component. The pen's draft table groups through `draftVersion.method` (`stepsForGrouping`); Tests C and D cover it.

(d) Full suite: no existing test asserted a lone Unallocated head, so none needed updating and none was removed.

## Measurements (Task 3)

These readings come from Playwright WebKit and system Chrome on the built app (`app/dist`, served on ephemeral 127.0.0.1 ports), not from Mark's iPad or iPhone. `node 261002-wdn-probe.mjs matrix` exits 0: 3204 checks passed, 2 engines x 2 widths x 9 cases. The baseline was captured from a build of the unchanged source (36 checks, precondition asserted: every Coconut cell had exactly one head reading "Unallocated"; Mexican Chocolate had numbered heads and no Unallocated).

Per cell: head height removed equals the table height change (within 1px); every ingredient row's height and cell boxes, the Total and the table width match the baseline within 0.5px; the first tbody row sits where the head row did; struck and input counts and page overflow equal the baseline.

| Engine | Width | Case | Head removed (px) | Table height before -> after | Rows | Total | Struck | Inputs | Overflow |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| webkit | 393 | coconut-v1 reading | 32.39 | 477.72 -> 445.33 | 11 | 1291.5 g | 0 | 0 | 0 |
| webkit | 393 | coconut-v1 batch | 32.39 | 477.72 -> 445.33 | 11 | 1291.5 g | 0 | 0 | 0 |
| webkit | 393 | coconut-v2 reading | 32.39 | 440.72 -> 408.33 | 10 | 800.5 g | 0 | 0 | 0 |
| webkit | 393 | coconut-v2 batch | 32.39 | 440.72 -> 408.33 | 10 | 800.5 g | 0 | 0 | 0 |
| webkit | 393 | coconut-v2 show-changes | 32.39 | 638.72 -> 606.33 | 10 | 1291.5 struck, 800.5 g | 21 | 0 | 0 |
| webkit | 393 | coconut-v2 pen | 32.39 | 768.53 -> 736.14 | 10 | 800.5 g | 0 | 10 | 0 |
| webkit | 393 | coconut-v2 recording | 32.39 | 880.72 -> 848.33 | 10 | 800.5 g | 0 | 10 | 0 |
| webkit | 393 | mexican-chocolate-v4 reading | 0 | 515.92 -> 515.92 | 12 | 911.7 g | 0 | 0 | 0 |
| webkit | 393 | mexican-chocolate-v4 show-changes | 0 | 749.92 -> 749.92 | 12 | 772.1 struck, 911.7 g | 25 | 0 | 0 |
| webkit | 1920 | coconut-v1 reading | 33.39 | 453.80 -> 420.41 | 11 | 1291.5 g | 0 | 0 | 0 |
| webkit | 1920 | coconut-v1 batch | 33.39 | 453.80 -> 420.41 | 11 | 1291.5 g | 0 | 0 | 0 |
| webkit | 1920 | coconut-v2 reading | 33.39 | 422.80 -> 389.41 | 10 | 800.5 g | 0 | 0 | 0 |
| webkit | 1920 | coconut-v2 batch | 33.39 | 422.80 -> 389.41 | 10 | 800.5 g | 0 | 0 | 0 |
| webkit | 1920 | coconut-v2 show-changes | 33.39 | 422.80 -> 389.41 | 10 | 1291.5 struck, 800.5 g | 21 | 0 | 0 |
| webkit | 1920 | coconut-v2 pen | 33.39 | 497.67 -> 464.28 | 10 | 800.5 g | 0 | 10 | 0 |
| webkit | 1920 | coconut-v2 recording | 33.39 | 497.67 -> 464.28 | 10 | 800.5 g | 0 | 10 | 0 |
| webkit | 1920 | mexican-chocolate-v4 reading | 0 | 495.53 -> 495.53 | 12 | 911.7 g | 0 | 0 | 0 |
| webkit | 1920 | mexican-chocolate-v4 show-changes | 0 | 481.14 -> 481.14 | 12 | 772.1 struck, 911.7 g | 25 | 0 | 0 |
| chrome | 393 | coconut-v1 reading | 32.39 | 477.39 -> 445.00 | 11 | 1291.5 g | 0 | 0 | 0 |
| chrome | 393 | coconut-v1 batch | 32.39 | 477.39 -> 445.00 | 11 | 1291.5 g | 0 | 0 | 0 |
| chrome | 393 | coconut-v2 reading | 32.39 | 440.39 -> 408.00 | 10 | 800.5 g | 0 | 0 | 0 |
| chrome | 393 | coconut-v2 batch | 32.39 | 440.39 -> 408.00 | 10 | 800.5 g | 0 | 0 | 0 |
| chrome | 393 | coconut-v2 show-changes | 32.39 | 638.39 -> 606.00 | 10 | 1291.5 struck, 800.5 g | 21 | 0 | 0 |
| chrome | 393 | coconut-v2 pen | 32.39 | 749.70 -> 717.31 | 10 | 800.5 g | 0 | 10 | 0 |
| chrome | 393 | coconut-v2 recording | 32.39 | 880.39 -> 848.00 | 10 | 800.5 g | 0 | 10 | 0 |
| chrome | 393 | mexican-chocolate-v4 reading | 0 | 515.59 -> 515.59 | 12 | 911.7 g | 0 | 0 | 0 |
| chrome | 393 | mexican-chocolate-v4 show-changes | 0 | 749.59 -> 749.59 | 12 | 772.1 struck, 911.7 g | 25 | 0 | 0 |
| chrome | 1920 | coconut-v1 reading | 33.39 | 451.42 -> 418.03 | 11 | 1291.5 g | 0 | 0 | 0 |
| chrome | 1920 | coconut-v1 batch | 33.39 | 451.42 -> 418.03 | 11 | 1291.5 g | 0 | 0 | 0 |
| chrome | 1920 | coconut-v2 reading | 33.39 | 420.42 -> 387.03 | 10 | 800.5 g | 0 | 0 | 0 |
| chrome | 1920 | coconut-v2 batch | 33.39 | 420.42 -> 387.03 | 10 | 800.5 g | 0 | 0 | 0 |
| chrome | 1920 | coconut-v2 show-changes | 33.39 | 420.42 -> 387.03 | 10 | 1291.5 struck, 800.5 g | 21 | 0 | 0 |
| chrome | 1920 | coconut-v2 pen | 33.39 | 497.67 -> 464.28 | 10 | 800.5 g | 0 | 10 | 0 |
| chrome | 1920 | coconut-v2 recording | 33.39 | 497.67 -> 464.28 | 10 | 800.5 g | 0 | 10 | 0 |
| chrome | 1920 | mexican-chocolate-v4 reading | 0 | 490.19 -> 490.19 | 12 | 911.7 g | 0 | 0 | 0 |
| chrome | 1920 | mexican-chocolate-v4 show-changes | 0 | 475.80 -> 475.80 | 12 | 772.1 struck, 911.7 g | 25 | 0 | 0 |

### The 393 gap, for Mark to judge on the phone

At 393 the Coconut gap from the "Ingredients" heading to the first tbody row is 6px before and after, in both engines, because the first tbody row (formerly the head, now the first ingredient) starts where the head row used to start. The first ingredient row therefore moved up from 38.39px to 6px below the heading, by exactly the removed head's height (32.39px, which includes the head's 14px top padding and 4px bottom padding). Nothing else moved. At 1920 the equivalent figures are 46.78 (WebKit) and 47.28 (Chrome) for the heading to the first tbody row, unchanged; the first ingredient row moved from 80.17 / 80.67 to 46.78 / 47.28.

### Mexican Chocolate v4

Unchanged in every cell (both engines, both widths, reading and Show changes): same single head ("Step 1" plus lead-in) and height, rows, cell boxes, Total, struck count (25) and table height.

## Tests

`npm --prefix app test`: 55 files, 1516 tests, all passing. Baseline was 1511, so +5 (tests A to E) and none removed. `npm --prefix app run build` succeeds, and `app/dist` is built from the final code (Mark's :4173 preview serves it with no restart).

Under `app/`, this plan's commits changed only `app/src/ui/IngredientTable.jsx` and `app/src/ui/IngredientTable.test.jsx`. No stylesheet, token, sketch, canvas-generator or .impeccable file was touched.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Probe flagged display:none cells as a layout shift**
- **Found during:** Task 3 (first matrix run: 128 failures, every one a hidden cell)
- **Issue:** A display:none cell (for example the Total row's hidden cells at 393) reports a 0x0 rect at the page origin, so its y relative to the row only tracks where the row sits. After the head row was removed the row moved, so the comparison reported a spurious y difference. Every failure had width 0 and height 0; none involved a laid-out cell.
- **Fix:** The probe's `sameRow` compares y only for laid-out cells (x, width and height are still compared for all cells). The matrix then passed (3204 checks). The plan's expectations were not adjusted; no measurement disagreed with them.
- **Files modified:** `261002-wdn-probe.mjs`
- **Commit:** 5e27142

Otherwise none: the plan executed as written.

## Deferred to Mark (end-of-run UAT, not blocking)

Mark's :4173 preview serves the rebuilt `app/dist`. Reload the tab on each device (hard reload if stale), then check:
1. iPad (1366, landscape): Coconut v2, then Coconut v1. No "UNALLOCATED" line above the ingredients; the rows and Total read as before, and nothing else moves.
2. iPhone (393): the same two recipes, plus whether the space between the Ingredients heading and the first row looks right now that the head's padding is gone (numbers above).
3. Coconut v2 with Show changes on: the struck old figures still show.
4. Mexican Chocolate v4: its Step heads are still there.

The change counts as device-verified only when Mark confirms.

## Known Stubs

None.

## Threat Flags

None. No new endpoint, auth path, file access or schema change; the change only decides whether one existing row renders. T-wdn-01 is mitigated by Test D (a table that mixes numbered and unresolved portions keeps both heads) and Tests A to C (no portion row is dropped).

## Self-Check: PASSED

- FOUND: app/src/ui/IngredientTable.jsx, app/src/ui/IngredientTable.test.jsx, 261002-wdn-probe.mjs, 261002-wdn-baseline.json
- FOUND commits: cd3552e, 37ed3c1, 5e27142
