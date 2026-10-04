---
phase: quick-261004-ox9
plan: 01
subsystem: ui
tags: [css, recipe-band, go-to-batch, sketch-011]
status: complete
commits: 2
plan_head_before: a8ba6fd
plan_head_after: 62b2ebd
requires: [261004-ox3, 261004-ox4, 261004-ox5]
provides: "the band's Go to batch row from 724 to 1365, in the band grid's second column under the Version section"
key-files:
  modified:
    - app/src/styles/notebook.css
    - app/src/styles/notebook.test.js
    - app/src/ui/GoToBatch.jsx
  created:
    - .planning/quick/261004-ox9-decision-33-brief-task-3-go-to-batch-from-724-to-1365-start/261004-ox9-probe.mjs
    - .planning/quick/261004-ox9-decision-33-brief-task-3-go-to-batch-from-724-to-1365-start/261004-ox9-baseline.json
decisions:
  - "One .notebook-jump box rule at the existing (max-width: 1365.98px) step with grid-column 2, instead of the brief's second rule under a new (min-width: 724px) and (max-width: 1365.98px) block; no @media condition added."
actuals:
  tasks: 2
  commits: 2
---

# Phase quick-261004-ox9 Plan 01: Go to batch from 724 to 1365 Summary

The band's Go to batch row now shows wherever the log sits below the Sheet (below 1366): from 724 to 1365 it is the band grid's third child placed in the second column, 32px under the Version section, start-aligned with the dot (sketch 011 decision 33 brief task 3, decision 43). It matches the board's three as-built panels within 0.5 in WebKit and Chrome, and the phone and 1366 are unchanged against a pre-change baseline.

## What was built

Commits (RED then GREEN, by explicit path):

- `595a5b8` test(261004-ox9): pins the row below 1366 (3 tests failed first: J2, J3, J4).
- `62b2ebd` feat(261004-ox9): notebook.css, GoToBatch.jsx (comment), the probe and the baseline JSON.

### `.notebook-jump` rules in notebook.css

Before (as ox5 left them):

| Where | Declarations |
|-------|--------------|
| top level | `display: none; justify-content: flex-start` |
| `(max-width: 723.98px)` | `display: flex; width: 100%; min-height: var(--touch-min); align-items: center; gap: var(--app-notebook-recipe-rail-gap); text-decoration: none; color: inherit` |

After:

| Where | Declarations |
|-------|--------------|
| top level | unchanged; its comment now says it hides the row from 1366 |
| `(max-width: 1365.98px)`, after `.notebook-band__grid` | `display: flex; grid-column: 2; width: 100%; min-height: var(--touch-min); align-items: center; gap: ...; text-decoration: none; color: inherit` |
| `(max-width: 723.98px)` | none (the rule and its comment are gone) |

No `@media` condition was added (the media-steps test is untouched and passes). GoToBatch.jsx: only the header comment changed (where it shows, the dot, "hides the row from 1366 up"); the JSX is as it was.

### Tests

The Go to batch describe was rewritten and retitled ("shows wherever the log sits below the Sheet, below 1366 ..."), with its comment. J1 (top-level display none) and J5 (typography selectors) were kept; J2 (the 1365.98px row box with grid-column 2), J3 (no rule under 723.98px) and J4 (exactly two display-declaring rules: none at top level, flex under 1365.98px) replace the old 723.98px box test and the "no rule under 1365.98px" test. No ox3/ox4/ox5 test needed a rewrite (the ox5 jump test reads the top-level rule only).

Suite: 1666 tests at the start (file count not recorded at the start), 62 files and 1667 tests at the end (the describe gains one test; no file added by this item). `npm --prefix app test` and `npm --prefix app run build` pass.

## Deviations from Plan

1. **CSS shape (planned deviation from the brief).** One rule at the existing step, with the phone's copy removed, rather than the brief's literal 724-1365 block. Reason: since decision 41 the phone row and the wide row read the same, so the brief's shape leaves two copies of one rule and a sixth `@media` condition. The probe proves the phone unchanged. If Mark prefers the brief's literal block, the change is mechanical.

2. **J2 omits `justify-content: flex-start` (plan said the rule carries it).** The top-level `.notebook-jump` rule already declares `justify-content: flex-start` (ox5), and ox5's test pins that "no other jump rule justifies". Repeating it would have broken that test or required loosening it. The computed value is `flex-start` in every shown cell (probe checks it, and the board panels agree). J2 asserts the declaration is absent from the 1365.98px rule, as the old 723.98px test did.

3. **Probe's phone comparison excludes the inert computed `grid-column-start`.** The plan's `after` group says every jump reading at 393 and 723 equals the baseline. One reading differs by construction: `grid-column: 2` is inert in the phone's flex-column band, but its computed value reports `2` where it reported `auto`. Every rendered reading (rect, height, gap, gapAbove, hits, focus, rowOne, anchors, overflow, dot, justify-content) equals the baseline. The probe pins the computed change on its own (`auto` to `2`) and compares everything else. Not a threshold change: this is the one reading the plan's own design moves. Flagging it because the plan text said "every reading".

### Auto-fixed issues

None.

## Measurements

Probe `261004-ox9-probe.mjs after,board`: 364 checks pass (WebKit coarse and system Chrome fine). The baseline (166 checks, including the board's own shape) was taken from a build of the unchanged source after ox5 before any CSS edit. Engine, pointer, route and width are as in the plan; the gap reads 31.58 in WebKit and 31.34 in Chrome (the text-to-text measure, plan tolerance 32 within 1; the board panels read the same numbers).

Columns: display before to after, then height, dx, dw, gap above, gap (control text to status text), five hits, focus landing (heading top, header bottom), page height shift (all five anchors moved the same), overflow.

| Cell | display | h / dx / dw / gapAbove / gap | hits | focus top / head | shift | overflow |
|------|---------|------------------------------|------|------------------|-------|----------|
| webkit mex3 393 | flex, flex | 44 / 0 / 0 / 20 / 31.58 | 5/5 | 511.8 / 0 | 0 | 0 |
| webkit mex3 723 | flex, flex | 44 / 0 / 0 / 20 / 31.58 | 5/5 | 558.4 / 0 | 0 | 0 |
| webkit mex3 724 | none, flex | 44 / 0 / 0 / 32 / 31.58 | 5/5 | 691.9 / 57 | 76 | 0 |
| webkit mex3 744 (board 44/0/0/32/31.58) | none, flex | 44 / 0 / 0 / 32 / 31.58 | 5/5 | 691.9 / 57 | 76 | 0 |
| webkit mex3 1024 (board 44/0/0/32/31.58) | none, flex | 44 / 0 / 0 / 32 / 31.58 | 5/5 | 706.6 / 57 | 76 | 0 |
| webkit mex3 1194 | none, flex | 44 / 0 / 0 / 32 / 31.58 | 5/5 | 706.6 / 57 | 76 | 0 |
| webkit mex3 1365 | none, flex | 44 / 0 / 0 / 32 / 31.58 | 5/5 | 706.6 / 57 | 76 | 0 |
| webkit mex3 1366 | none, none | hidden | n/a | n/a | 0 | 0 |
| webkit olive1 393 | flex, flex | 44 / 0 / 0 / 20 / 31.58 | 5/5 | 491.1 / 0 | 0 | 0 |
| webkit olive1 723 | flex, flex | 44 / 0 / 0 / 20 / 31.58 | 5/5 | 491.5 / 0 | 0 | 0 |
| webkit olive1 724 | none, flex | 44 / 0 / 0 / 32 / 31.58 | 5/5 | 536.0 / 57 | 76 | 0 |
| webkit olive1 744 | none, flex | 44 / 0 / 0 / 32 / 31.58 | 5/5 | 536.0 / 57 | 76 | 0 |
| webkit olive1 1024 | none, flex | 44 / 0 / 0 / 32 / 31.58 | 5/5 | 550.4 / 57 | 76 | 0 |
| webkit olive1 1194 (board 44/0/0/32/31.58) | none, flex | 44 / 0 / 0 / 32 / 31.58 | 5/5 | 550.9 / 57 | 76 | 0 |
| webkit olive1 1365 | none, flex | 44 / 0 / 0 / 32 / 31.58 | 5/5 | 550.9 / 57 | 76 | 0 |
| webkit olive1 1366 | none, none | hidden | n/a | n/a | 0 | 0 |
| chrome mex3 393 | flex, flex | 44 / 0 / 0 / 20 / 31.34 | 5/5 | 536.4 / 0 | 0 | 0 |
| chrome mex3 723 | flex, flex | 44 / 0 / 0 / 20 / 31.34 | 5/5 | 574.3 / 0 | 0 | 0 |
| chrome mex3 724 | none, flex | 44 / 0 / 0 / 32 / 31.34 | 5/5 | 704.8 / 57 | 76 | 0 |
| chrome mex3 744 (board 44/0/0/32/31.34) | none, flex | 44 / 0 / 0 / 32 / 31.34 | 5/5 | 704.8 / 57 | 76 | 0 |
| chrome mex3 1024 (board 44/0/0/32/31.34) | none, flex | 44 / 0 / 0 / 32 / 31.34 | 5/5 | 719.9 / 57 | 76 | 0 |
| chrome mex3 1194 | none, flex | 44 / 0 / 0 / 32 / 31.34 | 5/5 | 719.9 / 57 | 76 | 0 |
| chrome mex3 1365 | none, flex | 44 / 0 / 0 / 32 / 31.34 | 5/5 | 719.9 / 57 | 76 | 0 |
| chrome mex3 1366 | none, none | hidden | n/a | n/a | 0 | 0 |
| chrome olive1 393 | flex, flex | 44 / 0 / 0 / 20 / 31.34 | 5/5 | 491.8 / 0 | 0 | 0 |
| chrome olive1 723 | flex, flex | 44 / 0 / 0 / 20 / 31.34 | 5/5 | 491.6 / 0 | 0 | 0 |
| chrome olive1 724 | none, flex | 44 / 0 / 0 / 32 / 31.34 | 5/5 | 545.9 / 57 | 76 | 0 |
| chrome olive1 744 | none, flex | 44 / 0 / 0 / 32 / 31.34 | 5/5 | 545.9 / 57 | 76 | 0 |
| chrome olive1 1024 | none, flex | 44 / 0 / 0 / 32 / 31.34 | 5/5 | 560.5 / 57 | 76 | 0 |
| chrome olive1 1194 (board 44/0/0/32/31.34) | none, flex | 44 / 0 / 0 / 32 / 31.34 | 5/5 | 560.5 / 57 | 76 | 0 |
| chrome olive1 1365 | none, flex | 44 / 0 / 0 / 32 / 31.34 | 5/5 | 560.5 / 57 | 76 | 0 |
| chrome olive1 1366 | none, none | hidden | n/a | n/a | 0 | 0 |

At every shown width from 724 to 1365 the first grid row did not move, the shift is exactly 44 + 32 = 76, focus lands on `#batch` inside `.notebook-log` below the 57px sticky header and inside the window, the dot reads `"·"` with a 14px margin, the status reads "Awaiting tasting" (mex3) or "Tasted" (olive1), and each span is one line. The board comparison (gap, height, dx, dw, gapAbove within 0.5; display, justify-content, grid-column-start, dot and status equal) passes for all three panels in both engines.

Every reading comes from Playwright WebKit and system Chrome, not Mark's devices. Rebuilding app/dist already updates what Mark's :4173 preview serves; this run did not start, stop or request that preview, :5173 or :8011.

## Known Stubs

None.

## Threat Flags

None.

## For Mark's List

The orchestrator writes the rows; none were written here.

1. **Device check (deferred).** On the 12.9in iPad in portrait (1024), on Mexican Chocolate v3 and Olive Oil v1: under Next version the band reads "Go to batch · Awaiting tasting" or "Go to batch · Tasted" from the left; one tap anywhere on the row lands on the Batch heading below the sticky bar; in landscape (1366) there is no row; on the iPhone (393) the row is as before. Serve the build and hard reload (Cmd+Shift+R).
2. **Decide row.** The board still carries two OPTION panels ("the row inside the Version section", "Mark has not answered"). Decision 43 lists no open question, and this run built the as-drawn position: the band grid's third child, 32px under the band's first row. Recommended: keep it as built, since Mark's "dots like decision 34" answered the detached look. The other option is to move the row inside the Version section, a DOM move in RecipePage.jsx and VersionRow.jsx, as a new task.
3. **Documents (brief task 8, after approval).** DESIGN.md's band entry says "Below 724 the band also carries a Go to batch row", which is now below 1366. route-recipe-batch.md needs "Go to batch above 724". Not edited here.
4. **Print note for Phase 04 (note only).** The row is screen furniture (brief (g)). At portrait paper widths under 724 it printed already; a print layout 724 to 1365 wide now shows it too. Phase 04's print route owns hiding it.

## Self-Check: PASSED

- 595a5b8 and 62b2ebd exist on main.
- notebook.css, notebook.test.js, GoToBatch.jsx, the probe and the baseline JSON exist; `git status --porcelain app/` is empty.
- Under app/, the ox9 commits touch only notebook.css, notebook.test.js and GoToBatch.jsx; nothing under .planning/sketches, .planning/canvas-generators, .impeccable or DESIGN.md.
