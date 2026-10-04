---
phase: quick-261004-ox3
plan: 01
quick_id: 261004-ox3
subsystem: ui-styles
tags: [sketch-011, decision-39, version-details, row-gap, token]
status: complete
requires: [261004-ly6 (decision 37 Why row)]
provides: ["--app-notebook-details-gap-row: 8px", "even 8px rhythm in the Version details"]
key-files:
  created:
    - .planning/quick/261004-ox3-version-details-rhythm-sketch-011-decision-39-readme-mark-s/261004-ox3-probe.mjs
    - .planning/quick/261004-ox3-version-details-rhythm-sketch-011-decision-39-readme-mark-s/261004-ox3-baseline.json
  modified:
    - app/src/styles/tokens.css
    - app/src/styles/notebook.css
    - app/src/styles/app.css
    - app/src/styles/notebook.test.js
    - app/src/styles/cross-cutting.test.js
decisions:
  - "Token --app-notebook-details-gap-row is a literal 8px with its own name (Mark's answer 2)"
  - "WHY label: no margin-top, margin-bottom calc(-1 * var(--app-notebook-gap-hairline))"
actuals:
  tasks: 2
  commits: 2
plan_head_before: 6e377eefc4150f65f3f9f254e2484964113622a6
plan_head_after: 81fe551fcaddcfddd24dc408d4d749ac8cead357
commits: 2
completed: 2026-10-04
---

# Phase quick-261004-ox3 Plan 01: Version details rhythm (sketch 011 decision 39 B) Summary

In the Version details, Written, From version and Why now sit one 8px row gap apart (new App token `--app-notebook-details-gap-row`), and the WHY label is tucked 4px to its words by a negative bottom margin of the 4px hairline token.

## The change as built

- `app/src/styles/tokens.css`: `--app-notebook-details-gap-row: 8px;` straight after `--app-notebook-gap-hairline`, with a one-line comment naming version-details-rhythm.html B and decision 39.
- `app/src/styles/notebook.css`: `.notebook-version__details` reads `row-gap: var(--app-notebook-details-gap-row)`. Nothing else in the rule changed. The 4px token keeps its other readers (pen label-to-control gap, From batch fieldset, log notes).
- `app/src/styles/app.css`: `.version-row__reason-label` lost `margin-top: var(--gap-s)` and gained `margin-bottom: calc(-1 * var(--app-notebook-gap-hairline))`, with a comment above it. The comment above `.version-row__history` was rewritten so it no longer says the label shares its margin. The History rule's declaration is untouched.

## RED then GREEN

- Premise run on the unchanged build exited 0 (208 checks) and wrote the baseline: gaps 4/16/4 (with From version) and 16/4 (without) in all 18 cells in both engines, label marginTop 12px, list row-gap 4px, constructed From batch row 4/16/4/4. Each equalled the same-engine built panel.
- RED, `fc4404e` `test(261004-ox3): ...`: probe, baseline and the two tests. Only the two new tests failed (notebook.test.js Test A, cross-cutting.test.js Test B); 130 others passed.
- GREEN, `81fe551` `fix(261004-ox3): ...`: tokens.css, notebook.css, app.css only. Full suite green.
- End to end: rebuilt app/dist, `after` probe exited 0 with 298 checks, none failed, no tolerance touched.

## Tests

Suite at start: 60 files, 1641 tests. At end: 60 files, 1643 tests (+2, none removed). `npm --prefix app run build` succeeds.

## Probe readings

Every reading comes from Playwright WebKit and system Chrome, not from Mark's devices. WebKit: fine pointer at 1600, coarse at 1366 and 393. Chrome: fine at all three. Each cell was read in the app and in the same engine's `built` and `B` panels of version-details-rhythm.html. Columns: gaps before -> after (board built -> B); label marginTop/marginBottom and list rowGap before -> after (before: 12px/0px/4px); list height before -> after (delta; the board's delta); section height before -> after (delta; the board's delta); value height; flush offset (Why value x minus label x); page overflow. All gaps, line tops and list-minus-value heights equal the B panel within 0.5; label margins and row gap equal the panel's computed values; the value class is unchanged in every cell.

| Cell | Gaps | Label margins / row gap | List height | Section height | Value h | Flush | Overflow |
|---|---|---|---|---|---|---|---|
| webkit fine 1600 mex3 | 4/16/4 -> 8/8/4 (board 4/16/4 -> 8/8/4) | 12/0/4px -> 0px/-4px/8px | 155.5 -> 151.5 (-4; board -4) | 300.5 -> 296.5 (-4; board -4) | 82.5 | 0 | 0 |
| webkit fine 1600 mex2 | 4/16/4 -> 8/8/4 (board 4/16/4 -> 8/8/4) | 12/0/4px -> 0px/-4px/8px | 91.19 -> 87.19 (-4; board -4) | 236.19 -> 232.19 (-4; board -4) | 18.19 | 0 | 0 |
| webkit fine 1600 olive1 | 16/4 -> 8/4 (board 16/4 -> 8/4) | 12/0/4px -> 0px/-4px/8px | 70.19 -> 62.19 (-8; board -8) | 215.19 -> 207.19 (-8; board -8) | 18.19 | 0 | 0 |
| webkit coarse 1366 mex3 | 4/16/4 -> 8/8/4 (board 4/16/4 -> 8/8/4) | 12/0/4px -> 0px/-4px/8px | 155.5 -> 151.5 (-4; board -4) | 300.5 -> 296.5 (-4; board -4) | 82.5 | 0 | 0 |
| webkit coarse 1366 mex2 | 4/16/4 -> 8/8/4 (board 4/16/4 -> 8/8/4) | 12/0/4px -> 0px/-4px/8px | 91.19 -> 87.19 (-4; board -4) | 236.19 -> 232.19 (-4; board -4) | 18.19 | 0 | 0 |
| webkit coarse 1366 olive1 | 16/4 -> 8/4 (board 16/4 -> 8/4) | 12/0/4px -> 0px/-4px/8px | 70.19 -> 62.19 (-8; board -8) | 215.19 -> 207.19 (-8; board -8) | 18.19 | 0 | 0 |
| webkit coarse 393 mex3 | 4/16/4 -> 8/8/4 (board 4/16/4 -> 8/8/4) | 12/0/4px -> 0px/-4px/8px | 183 -> 179 (-4; board -4) | 328 -> 324 (-4; board -4) | 110 | 0 | 0 |
| webkit coarse 393 mex2 | 4/16/4 -> 8/8/4 (board 4/16/4 -> 8/8/4) | 12/0/4px -> 0px/-4px/8px | 91.19 -> 87.19 (-4; board -4) | 236.19 -> 232.19 (-4; board -4) | 18.19 | 0 | 0 |
| webkit coarse 393 olive1 | 16/4 -> 8/4 (board 16/4 -> 8/4) | 12/0/4px -> 0px/-4px/8px | 70.19 -> 62.19 (-8; board -8) | 215.19 -> 207.19 (-8; board -8) | 18.19 | 0 | 0 |
| chrome fine 1600 mex3 | 4/16/4 -> 8/8/4 (board 4/16/4 -> 8/8/4) | 12/0/4px -> 0px/-4px/8px | 154.5 -> 150.5 (-4; board -4) | 301.5 -> 297.5 (-4; board -4) | 82.5 | 0 | 0 |
| chrome fine 1600 mex2 | 4/16/4 -> 8/8/4 (board 4/16/4 -> 8/8/4) | 12/0/4px -> 0px/-4px/8px | 90.19 -> 86.19 (-4; board -4) | 237.19 -> 233.19 (-4; board -4) | 18.19 | 0 | 0 |
| chrome fine 1600 olive1 | 16/4 -> 8/4 (board 16/4 -> 8/4) | 12/0/4px -> 0px/-4px/8px | 69.19 -> 61.19 (-8; board -8) | 216.19 -> 208.19 (-8; board -8) | 18.19 | 0 | 0 |
| chrome fine 1366 mex3 | 4/16/4 -> 8/8/4 (board 4/16/4 -> 8/8/4) | 12/0/4px -> 0px/-4px/8px | 154.5 -> 150.5 (-4; board -4) | 301.5 -> 297.5 (-4; board -4) | 82.5 | 0 | 0 |
| chrome fine 1366 mex2 | 4/16/4 -> 8/8/4 (board 4/16/4 -> 8/8/4) | 12/0/4px -> 0px/-4px/8px | 90.19 -> 86.19 (-4; board -4) | 237.19 -> 233.19 (-4; board -4) | 18.19 | 0 | 0 |
| chrome fine 1366 olive1 | 16/4 -> 8/4 (board 16/4 -> 8/4) | 12/0/4px -> 0px/-4px/8px | 69.19 -> 61.19 (-8; board -8) | 216.19 -> 208.19 (-8; board -8) | 18.19 | 0 | 0 |
| chrome fine 393 mex3 | 4/16/4 -> 8/8/4 (board 4/16/4 -> 8/8/4) | 12/0/4px -> 0px/-4px/8px | 182 -> 178 (-4; board -4) | 329 -> 325 (-4; board -4) | 110 | 0 | 0 |
| chrome fine 393 mex2 | 4/16/4 -> 8/8/4 (board 4/16/4 -> 8/8/4) | 12/0/4px -> 0px/-4px/8px | 90.19 -> 86.19 (-4; board -4) | 237.19 -> 233.19 (-4; board -4) | 18.19 | 0 | 0 |
| chrome fine 393 olive1 | 16/4 -> 8/4 (board 16/4 -> 8/4) | 12/0/4px -> 0px/-4px/8px | 69.19 -> 61.19 (-8; board -8) | 216.19 -> 208.19 (-8; board -8) | 18.19 | 0 | 0 |

Constructed From batch row (mex3 at 1366, appended in a throwaway page with createElement, nothing saved): in both engines, WebKit coarse and Chrome fine, 4/16/4/4 before and 8/8/4/8 after, equal to the board's `batch-built-1366` and `batch-B-1366`.

Sid's readings, `.planning/canvas-generators/rhythm-measure.json` (WebKit, his): mex3 built box gaps 4/16/4, B 8/8/4, list 155.5 -> 151.5, section 300.5 -> 296.5; olive1 B 8/4, list 62.2, section 207.2; batch-1366 built 4/16/4/4, B 8/8/4/8. These equal the WebKit rows above. Sid's seen (ink) gaps for B, quoted from the README and not re-measured here: 13.5 / 11.5 / 13.

## Choices made

1. **Token name and value.** `--app-notebook-details-gap-row`, following `--app-notebook-log-cell-gap-row`. A literal 8px with its own name (Mark's answer 2), not twice the 4px hairline, and not `--app-notebook-gap-tight` (which also happens to be 8px).
2. **Negative margin.** Written as a negative of the 4px token, `calc(-1 * var(--app-notebook-gap-hairline))`, as the brief's step 2 says. It is needed because the dt and the dd are separate grid rows.
3. **notebook.css added to the item's file list.** The row gap that brief step 1 changes lives there, not in app.css or tokens.css. Later batch items that edit notebook.css, app.css, tokens.css, notebook.test.js or cross-cutting.test.js must run after this one.
4. **Written to From version moves from 4 to 8.** Mark did not ask for that by itself; it is how the rows become even (README decision 39, "Found while drawing" 3).

## Found, not changed

The `.version-row__history` rule in app.css has no rendered element under app/src; only a comment in VersionRow.jsx names it. It is pre-existing dead CSS. Its comment was rewritten as the brief asks; the rule was left in place, per CLAUDE.md's rule on pre-existing dead code.

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None.

## Threat Flags

None. No markup changed; the probe built its constructed row with createElement and textContent. Commits were by explicit path; the scope check below confirms nothing under .planning/sketches, .planning/canvas-generators, .planning/todos or DESIGN.md was touched.

## For Mark's List

One deferred device check (the orchestrator writes the row):

- **Title:** Version details rhythm on iPad and iPhone.
- **What to look at:** on the iPad at 1366 landscape and on the iPhone at 393, served from the build (a hard reload of Mark's running preview is enough), open the version details. On Mexican Chocolate v3, Written, From version and Why should look evenly spaced, with the WHY label sitting close to its words in the hand. Mexican Chocolate v2 and Olive Oil v1 should look the same, with "no reason recorded" under the label.
- **Status:** device-verified only when Mark confirms. The todo `.planning/todos/pending/2026-10-04-sid-needs-to-review-the-rhythm-of-the-version-section-detail.md` stays where it is until then; it is untracked and was not moved or staged.

## Self-Check: PASSED

- Commits `fc4404e` and `81fe551` exist on main.
- Probe, baseline, five app files and this SUMMARY exist.
- `after` probe, full suite (+2) and build ran green on the final code.
