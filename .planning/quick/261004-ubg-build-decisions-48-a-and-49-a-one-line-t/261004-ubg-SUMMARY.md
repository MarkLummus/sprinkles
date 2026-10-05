---
phase: quick-261004-ubg
plan: 01
subsystem: styles
tags: [css, sheet, ingredient-table, grid, sketch-011]
requires: []
provides:
  - "One-line ingredient table head from 724 (sketch 011 decision 48 A)"
  - "Sheet grid rows from 984 that put the side column's surplus under the Instructions (decision 49 A)"
affects: [app/src/styles/app.css]
tech-stack:
  added: []
  patterns: ["a screen-only 984px media block, the ninth top-level @media in app.css"]
key-files:
  created: []
  modified:
    - app/src/styles/app.css
    - app/src/styles/columns.test.js
    - app/src/styles/cross-cutting.test.js
    - app/src/styles/binder.test.js
decisions:
  - "Dropped the % of batch head's own white-space: nowrap (the brief calls it redundant once thead th carries it); the rewritten ox8 test pins nowrap through the one rule"
  - "The 984 block is the last block in app.css so the suites' first-match ruleFor and mediaRuleFor still find the top-level and 983.98px rules first"
status: complete
commits: 4
plan_head_before: c4c760ae094d46fa250e713be5e62bc59caf982d
plan_head_after: c5e09fce9dfa0a38d1d13b5557be047a82acad4a
actuals:
  tokens: 2800
  tasks: 3
  commits: 4
metrics:
  completed: 2026-10-05
---

# Phase quick-261004-ubg Plan 01: Decisions 48 A and 49 A Summary

The ingredient table's head now reads on one line from 724, and from 984 the Instructions follow the table, with the side column's surplus moved to the foot of the left column. Both changes are style rules in `app/src/styles/app.css`, written test first.

Both decisions pass their own acceptance numbers. Two things did not go as the plan expected. They are under "Where the real DOM and the README disagree" below, stated with both numbers, and no check was loosened.

## What changed

**Decision 48 A**, in the existing `screen and (min-width: 724px)` D3 block, after the `:not(:last-child)` head rule:

- `.ingredient-table thead th { grid-row: 1; white-space: nowrap; width: auto; }`
- `.ingredient-table--as-made thead th.ingredient-table__col-numeric:not(:last-child) { justify-self: end; }`
- Removed the `white-space: nowrap;` line from `.ingredient-table thead th.ingredient-table__col-numeric:last-child` and kept its `text-align` and `grid-column`. The brief calls it redundant once the new rule lands, and the rewritten test pins nowrap through the one rule.

**Decision 49 A**, a new last block in app.css, `@media screen and (min-width: 984px)`:

- `.recipe-page { grid-template-rows: auto auto 1fr auto; }`
- `.recipe-page--no-method { grid-template-rows: auto 1fr auto; }`

Every value is a keyword or a grid line, so no token was needed. Print, the list form below 724 and the 983.98px block are untouched.

## Commits

| Hash | Message |
|---|---|
| 86ce580 | test(261004-ubg): pin the one-line ingredient head from 724 (sketch 011 decision 48 A) |
| 74af491 | feat(261004-ubg): the ingredient head reads on one line from 724, Ingredient where it stands (sketch 011 decision 48 A) |
| 612754b | test(261004-ubg): pin the Sheet's rows from 984, the surplus to the Instructions (sketch 011 decision 49 A) |
| c5e09fc | feat(261004-ubg): the Instructions follow the table from 984, the side column's surplus under them (sketch 011 decision 49 A) |

Each test commit failed for the expected reason before its feat commit (rule missing, count of 8, no 984 condition). The probe and this SUMMARY are not committed; the orchestrator's docs commit takes them.

## Test changes

- `columns.test.js`: two new D3 tests (the `thead th` rule declares row 1, nowrap and width auto; As made's head declares `justify-self: end`; the % of batch head keeps `text-align: right` and `grid-column: -2 / -1`). The 261004-ox8 test that pinned "exactly one th rule declares nowrap, the % of batch head, so As made keeps wrapping" is rewritten, not deleted. It now pins that exactly one rule whose selector contains `thead th` declares nowrap, and that it is `.ingredient-table thead th` in the 724 block. The test at line 166 (no top-level th rule forces nowrap) is unchanged and passes.
- `cross-cutting.test.js`: a new describe for the 984 rows block (exactly two rules in order, rows only, 1fr on the method row, or on the ingredients row without Instructions, checked against the top-level area rows, screen only). The media-condition list went from 7 to 8 conditions and the title from eight to nine blocks.
- `binder.test.js`: the at-rule gate went from 8 to 9 `@media` blocks and `allowedMedia` gained `screen and (min-width: 984px)`.

Full suite: 62 files, 1687 tests, all pass.

## Method of measurement

The existing build (`app/dist`, read only) was served by the 03.5 harness on ephemeral 127.0.0.1 ports. The probe added the edited source's own rules in the page (`addStyleTag`), read from `app/src/styles/app.css` by `readAllRules`, so the measured CSS is the committed text. There was no build and no Vite process, and :4173, :5173 and :8011 were not touched. The cascade assertion (notebook.css, shell.css and home.css carry no `thead` rule and no `.recipe-page` `grid-template-rows`) is TRUE, so adding the CSS after the bundle cascades the same as its place in app.css.

Probe: `.planning/quick/261004-ubg-build-decisions-48-a-and-49-a-one-line-t/261004-ubg-probe.mjs` (`tracer` and `all`). Each page was read in four states: base, +48 (the two decision 48 rules), +49 (the 984 block) and both. WebKit and system Chrome, both with a coarse pointer, at 724, 744, 983, 984, 1024, 1366, 1600 and 1920, for Olive Oil v1's batch (olive1), Mexican Chocolate v3's batch with Show changes off (mex3) and Standard Base v2 (base2), plus olive1 with the Next version pen open at 1600.

**The consequence: Mark's running :4173 preview does NOT show these changes until `npm --prefix app run build` runs.** I did not build.

## Results

The probe's `all` mode exits 1 with **20 failed checks, in two groups** (below). Everything else passes, including every G48 height, no-batch and pen gate, every G49 gate and every G49 unchanged gate, in both engines. The tracer run (WebKit, olive1 at 1366) passed 10 of 10.

### Decision 48 A: passes

- Olive Oil v1, both engines, every width 724 to 1920: head row 21.72 (WebKit) or 21.39 (Chrome) after, 52.5 or 52.17 before, so 30.78 shorter. The three head cells share one top, each is 14.39 tall, and the Ingredient cell's left edge does not move. As made's head box is 59.45 wide in WebKit (0.55 before) and its right edge is the right edge of the As made figures, within 0.5.
- Standard Base v2 and the Next version pen: head row unchanged in every state (21.72 WebKit, 21.39 Chrome, equal to base within 0.1).
- Page heights: Olive Oil v1 is 30 or 31px shorter at every width, as gated (30.78 within 1). Mexican Chocolate v3 is 31px shorter at 724, 744 and 983 and unchanged from 984.

### Decision 49 A: passes

- Mexican Chocolate v3, from 984, +49 and both: the gap from the table's bottom to the Instructions' top is 49 at 984, 1024, 1366 and 1600 in WebKit (48 in Chrome, within the 1px tolerance, and Olive Oil v1's own base gap reads 49 and 48 the same way). It was 396.89, 381.89, 396.89 and 389.39 in WebKit (366.37, 345.37, 366.37 and 366.37 in Chrome) before.
- Page height and side column height equal the matching state without the 984 block, within 1 (the numbers are identical in the table). Olive Oil v1 and Standard Base v2 at every width, and Mexican Chocolate v3 at 724, 744 and 983, read exactly as before (within 0.5).

### Readings per engine

Columns: head row (base / +48), As made head width (base / +48), gap from the table's bottom to the Instructions' top (base / +49 / both), page height (base / +48 / +49 / both), side column height (base / +48 / +49). A dash means the page has no such thing.

WebKit, coarse:

| page | head row | As made th | gap | page h | side h |
|---|---|---|---|---|---|
| olive1@724 | 52.5 / 21.72 | 0.55 / 59.45 | 189 / 189 / 189 | 3441 / 3411 / 3441 / 3411 | 132 / 132 / 132 |
| olive1@744 | 52.5 / 21.72 | 0.55 / 59.45 | 189 / 189 / 189 | 3441 / 3411 / 3441 / 3411 | 132 / 132 / 132 |
| olive1@983 | 52.5 / 21.72 | 0.55 / 59.45 | 189 / 189 / 189 | 3334 / 3303 / 3334 / 3303 | 132 / 132 / 132 |
| olive1@984 | 52.5 / 21.72 | 0.55 / 59.45 | 49 / 49 / 49 | 3276 / 3245 / 3276 / 3245 | 2081.59 / 2050.81 / 2081.59 |
| olive1@1024 | 52.5 / 21.72 | 0.55 / 59.45 | 49 / 49 / 49 | 3276 / 3245 / 3276 / 3245 | 2081.59 / 2050.81 / 2081.59 |
| olive1@1366 | 52.5 / 21.72 | 0.55 / 59.45 | 49 / 49 / 49 | 2819 / 2788 / 2819 / 2788 | 2081.59 / 2050.81 / 2081.59 |
| olive1@1600 | 52.5 / 21.72 | 0.55 / 59.45 | 49 / 49 / 49 | 2819 / 2788 / 2819 / 2788 | 2081.59 / 2050.81 / 2081.59 |
| olive1@1920 | 52.5 / 21.72 | 0.55 / 59.45 | 49 / 49 / 49 | 2780 / 2749 / 2780 / 2749 | 2042.59 / 2011.81 / 2042.59 |
| mex3@724 | 52.5 / 21.72 | 0.55 / 59.45 | 189 / 189 / 189 | 1825 / 1794 / 1825 / 1794 | 132 / 132 / 132 |
| mex3@744 | 52.5 / 21.72 | 0.55 / 59.45 | 189 / 189 / 189 | 1825 / 1794 / 1825 / 1794 | 132 / 132 / 132 |
| mex3@983 | 52.5 / 21.72 | 0.55 / 59.45 | 189 / 189 / 189 | 1810 / 1779 / 1810 / 1779 | 132 / 132 / 132 |
| mex3@984 | 52.5 / 21.72 | 0.55 / 59.45 | 396.89 / 49 / 49 | 2389 / 2389 / 2389 / 2389 | 1432.97 / 1432.97 / 1432.97 |
| mex3@1024 | 52.5 / 21.72 | 0.55 / 59.45 | 381.89 / 49 / 49 | 2359 / 2359 / 2359 / 2359 | 1402.97 / 1402.97 / 1402.97 |
| mex3@1366 | 52.5 / 21.72 | 0.55 / 59.45 | 396.89 / 49 / 49 | 2317 / 2317 / 2317 / 2317 | 1432.97 / 1432.97 / 1432.97 |
| mex3@1600 | 52.5 / 21.72 | 0.55 / 59.45 | 389.39 / 49 / 49 | 2302 / 2302 / 2302 / 2302 | 1417.97 / 1417.97 / 1417.97 |
| mex3@1920 | 52.5 / 21.72 | 0.55 / 59.45 | 336.89 / 49 / 49 | 2169 / 2169 / 2169 / 2169 | 1312.97 / 1312.97 / 1312.97 |
| base2@724 | 21.72 / 21.72 | - | - | 1274 (all four states) | 132 |
| base2@744 | 21.72 / 21.72 | - | - | 1274 (all four states) | 132 |
| base2@983 | 21.72 / 21.72 | - | - | 1274 (all four states) | 132 |
| base2@984 | 21.72 / 21.72 | - | - | 2031 (all four states) | 1154.97 |
| base2@1024 | 21.72 / 21.72 | - | - | 1941 (all four states) | 1064.97 |
| base2@1366 | 21.72 / 21.72 | - | - | 1974 (all four states) | 1154.97 |
| base2@1600 | 21.72 / 21.72 | - | - | 1884 (all four states) | 1064.97 |
| base2@1920 | 21.72 / 21.72 | - | - | 1839 (all four states) | 1019.97 |
| olive1 pen@1600 | 21.72 / 21.72 | - | 32 / 32 / 32 | 4059 (all four states) | 2972.19 |

Chrome, coarse:

| page | head row | As made th | gap | page h | side h |
|---|---|---|---|---|---|
| olive1@724 | 52.17 / 21.39 | 0.55 / 58.48 | 188 / 188 / 188 | 3421 / 3391 / 3421 / 3391 | 132 / 132 / 132 |
| olive1@744 | 52.17 / 21.39 | 0.55 / 58.48 | 188 / 188 / 188 | 3421 / 3391 / 3421 / 3391 | 132 / 132 / 132 |
| olive1@983 | 52.17 / 21.39 | 0.55 / 58.48 | 188 / 188 / 188 | 3314 / 3283 / 3314 / 3283 | 132 / 132 / 132 |
| olive1@984 | 52.17 / 21.39 | 0.55 / 58.48 | 48 / 48 / 48 | 3256 / 3225 / 3256 / 3225 | 2063.03 / 2032.25 / 2063.03 |
| olive1@1024 | 52.17 / 21.39 | 0.55 / 58.48 | 48 / 48 / 48 | 3256 / 3225 / 3256 / 3225 | 2063.03 / 2032.25 / 2063.03 |
| olive1@1366 | 52.17 / 21.39 | 0.55 / 58.48 | 48 / 48 / 48 | 2800 / 2769 / 2800 / 2769 | 2063.03 / 2032.25 / 2063.03 |
| olive1@1600 | 52.17 / 21.39 | 0.55 / 58.48 | 48 / 48 / 48 | 2800 / 2769 / 2800 / 2769 | 2063.03 / 2032.25 / 2063.03 |
| olive1@1920 | 52.17 / 21.39 | 0.55 / 58.48 | 48 / 48 / 48 | 2761 / 2730 / 2761 / 2730 | 2024.03 / 1993.25 / 2024.03 |
| mex3@724 | 52.17 / 21.39 | 0.55 / 58.48 | 188 / 188 / 188 | 1811 / 1780 / 1811 / 1780 | 132 / 132 / 132 |
| mex3@744 | 52.17 / 21.39 | 0.55 / 58.48 | 188 / 188 / 188 | 1811 / 1780 / 1811 / 1780 | 132 / 132 / 132 |
| mex3@983 | 52.17 / 21.39 | 0.55 / 58.48 | 188 / 188 / 188 | 1796 / 1765 / 1796 / 1765 | 132 / 132 / 132 |
| mex3@984 | 52.17 / 21.39 | 0.55 / 58.48 | 366.37 / 48 / 48 | 2317 / 2317 / 2317 / 2317 | 1362 / 1362 / 1362 |
| mex3@1024 | 52.17 / 21.39 | 0.55 / 58.48 | 345.37 / 48 / 48 | 2275 / 2275 / 2275 / 2275 | 1320 / 1320 / 1320 |
| mex3@1366 | 52.17 / 21.39 | 0.55 / 58.48 | 366.37 / 48 / 48 | 2247 / 2247 / 2247 / 2247 | 1362 / 1362 / 1362 |
| mex3@1600 | 52.17 / 21.39 | 0.55 / 58.48 | 366.37 / 48 / 48 | 2247 / 2247 / 2247 / 2247 | 1362 / 1362 / 1362 |
| mex3@1920 | 52.17 / 21.39 | 0.55 / 58.48 | 317.37 / 48 / 48 | 2121 / 2121 / 2121 / 2121 | 1264 / 1264 / 1264 |
| base2 at 724 to 1920 | 21.39 / 21.39 | - | - | 1270, 1270, 1270, 1922, 1908, 1866, 1866, 1824 (all four states each) | 132, 132, 132, 1046, 1032, 1046, 1046, 1004 |
| olive1 pen@1600 | 21.39 / 21.39 | - | 32 / 32 / 32 | 4041 (all four states) | 2957 |

Gap at widths below 984 is the side column's (stacked) position between the table and the Instructions, so it is 189 or 188 and does not move.

## Where the real DOM and the README disagree

**1. The G0 gate fails for Mexican Chocolate v3 (WebKit, base). I did not loosen it.** The plan's G0 expects the base gap of 399 at 984 and 1366, 352 at 1024 and 360 at 1600 (within 2). Read: 396.89, 381.89, 396.89 and 389.39. The checks that agree with the README: Olive Oil v1's base gap is 49 at 984, 1024, 1366 and 1600 (G0 passes), the base head row (52.5 against 52.17 is within the 0.5 tolerance), and the page heights (mex3 2,359 at 1024 against the README's 2,359; 2,317 at 1366 against 2,316).

The cause is in the README's own list, which mixes two measures. Its 399 at 984 and 1366 is the whole distance from the table's last line to the Instructions ("399 under the table's last line, 367 of it empty"). Its 352 at 1024, 360 at 1600 and the Chrome 313 and 334 are the empty part, which is the gap minus the 32px row gap. With that pair (gap minus 32) the real DOM reads WebKit 364.89 (984, 1366), 349.89 (1024), 357.39 (1600) against the README's 367, 352 and 360, and Chrome 334.37 (984, 1366, 1600) and 313.37 (1024) against 334 and 313. That fits to 2 to 2.6px in WebKit and 0.4 in Chrome. The remaining WebKit 2 to 2.6px (and the 0.33 in the head row) is unexplained; the served `app/dist` is stamped 21:21 to 21:22, newer than the 21:00:30 build the README names, so it may be a rebuild. The 984 and 1366 readings (396.89) miss the gate's 2px tolerance by 0.11. The mex3 +48 gap at 984 reads 412.28 (380.28 as empty space) against the README's 383.

None of this touches the acceptance of decision 49 A: the 49px and unchanged-height gates pass.

**2. The foot space under the Instructions does not read as the README says.** The plan's formula (the `.method-region` bottom against the `.side-region` bottom) reads 0 under the 984 block, because `.method-region` is a grid item and stretches to its row, so its box ends where the side column ends. I measured instead from the bottom of the Instructions' last child to the side column's bottom (ungated). With the 984 block only, WebKit reads 695.8 at 984 and 1366, 665.8 at 1024 and 680.8 at 1600; with both changes, 726.58, 696.58 and 711.58. The README says 732 at 984 and 1366 and 702 at 1024. So the foot is about 6px under the README's number with both changes, 36px under with the 984 block alone. Chrome reads 636.75 (984, 1366, 1600) and 594.75 (1024) with the 984 block only. The README's figures do not say which state they were drawn in. Not gated; the numbers are here for Mark's look at the device.

**3. Chrome's As made head is 58.48px wide, not 59.45 (G48, Olive Oil v1: 16 failed checks, +48 and both states at 8 widths).** The README says WebKit and Chrome agree to 1px, and they differ by 0.97, which is outside the plan's 0.5 gate. The word is slightly narrower in Chrome. The right edge still stands on the As made figures' right edge within 0.5 in Chrome, which is the thing the rule is for. The WebKit number is exactly 59.45.

**4. Mexican Chocolate v3's batch shows no As made figure in this DOM**, so the As made width and edge gates are not run for it (the probe prints a note for each case). The head's other gates (row height, shared top, 14.39 per cell, Ingredient unmoved) run and pass on it.

Failed checks in total: 4 (G0, mex3, WebKit) + 16 (G48, Chrome As made width) = 20. No other check failed.

## Deviations from Plan

None to the CSS, the tests or the commits. Two things in the probe differ from the plan's text: the foot space is measured as described in item 2 (the plan's formula reads 0 by construction), and the probe also prints the gap minus 32 so the README comparison in item 1 is visible. The G0 gate itself was kept as the plan wrote it and fails honestly.

Noticed, left alone: the comment above the 983.98px block still says it is "the one sanctioned breakpoint literal in the file". That was already stale before this quick (the 724px blocks), and the new 984 block adds another. I did not edit it.

## Known Stubs

None.

## Threat Flags

None. Two layout rules and one rows block; no new input, markup, script, or network surface.

## Deferred Human Verification

Suggested device checks, served from the build (`npm --prefix app run build && npm --prefix app run preview -- --host`). I filed no Mark's List rows (no ArtifactData tool in this run); these are for the orchestrator or Mark to add.

1. iPad at 1024 and 1366, and Mac Safari at 1600, Olive Oil v1's batch: the head reads "AS MADE INGREDIENT ... % OF BATCH" on one line, with As made standing over its figures' right edge.
2. Same widths, Mexican Chocolate v3's batch: the Instructions sit right under the table (about 49px), and the empty space is now at the foot of the left column, beside the tail of Watch for. Say whether that foot space bothers you as the middle gap did.
3. Standard Base v2: unchanged.
4. iPhone at 393: nothing changes.

## Self-Check: PASSED

- Files edited and committed: `app/src/styles/app.css`, `columns.test.js`, `cross-cutting.test.js`, `binder.test.js` (verified present; `git status --porcelain app/` is empty).
- Commits found: 86ce580, 74af491, 612754b, c5e09fc; they touch only those four app files.
- Full suite passes (1687 tests). Probe `all` exits 1 with the 20 failures stated above; nothing was loosened.
