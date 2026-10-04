---
phase: quick-261004-ox2
plan: 01
quick_id: 261004-ox2
subsystem: shell
tags: [css, tab-row, font-weight, sketch-011-decision-38]
status: complete
commits: 3
plan_head_before: eb106cb3cebdc1183dedfd9338f7a9f4eddcf26d
plan_head_after: 6e377eefc4150f65f3f9f254e2484964113622a6
key-files:
  modified:
    - app/src/styles/shell.css
    - app/src/styles/shell.test.js
  created:
    - .planning/quick/261004-ox2-phone-tab-row-the-active-tab-takes-weight-600-like-the-rail/261004-ox2-probe.mjs
    - .planning/quick/261004-ox2-phone-tab-row-the-active-tab-takes-weight-600-like-the-rail/261004-ox2-baseline.json
actuals:
  tasks: 2
  commits: 3
---

# Quick 261004-ox2: the phone tab row's current tab takes weight 600

The phone tab row's current tab now computes font-weight 600, as the rail's current place does (sketch 011 decision 38, Mark's later answer 2026-10-04).

## The change

- One rule in the phone media block of `app/src/styles/shell.css`, placed after the icon-over-label rule: `.shell__tabs .shell__place[aria-current='page'] { font-weight: 600; }`, with a comment.
- One rewritten comment sentence above `.shell__place[aria-current='page']`: the old one said the tab row keeps its shipped weight and that the weight is scoped to `.shell__rail`.
- The base surface rule, the radius rule, the rail weight rule and every other phone-block rule are unchanged.

Commits:

- `8d8d601` test: probe and WebKit/Chrome baseline of the unchanged build (400 checks passed)
- `397e0c0` test (RED): new test plus the changed phone-block weight assertion; exactly those two failed before the CSS
- `6e377ee` feat (GREEN): the rule and the comment

Tests: 1640 before, 1641 after, none removed. Build succeeds. Under app/, the commits touch only `shell.css` and `shell.test.js`.

## Before and after (WebKit and system Chrome, built app; not Mark's devices)

Probe `after` group: 904 checks passed, against the baseline JSON.

| Engine | Width | Current tab | Weight | Surface | Radius | Recipe book label width | Lines | Overflow |
|---|---|---|---|---|---|---|---|---|
| WebKit | 393 and 723 | Home, Notebook, Recipe book, Idea log | 400 to 600 | rgb(243, 244, 242), unchanged | 10px, all four corners, unchanged | 69.82 to 72.47 when current, else 69.82 | one per tab | 0 |
| Chrome | 393 and 723 | Home, Notebook, Recipe book, Idea log | 400 to 600 | rgb(243, 244, 242), unchanged | 10px, all four corners, unchanged | 67.80 to 71.98 when current, else 67.80 | one per tab | 0 |

- Tab boxes equal the baseline within 0.5: 78.59 by 55 at 393 and 144.59 by 55 at 723. Recipe book stays on one line inside its tab at 600.
- Every non-current tab and More's summary read 400.
- On /ingredients with More open: no tab is current and all read 400; the Ingredients item in More reads 600 on its unchanged surface; the other More items read 400.
- The planner's numbers matched the fresh baseline (78.59 by 55, Recipe book 69.82 in WebKit). Nothing differed.

## Recorded readings

- **Descendant selector.** `.shell__tabs .shell__place[aria-current='page']` also reaches the current place inside More's open list (Ingredients, Kitchen, Search), where the surface already shows. This follows "like the rail": the weight goes wherever the surface goes. More's summary never carries aria-current and stays at 400. If Mark wants the tabs alone, a child combinator (`>`) is a one-character change.
- **Rejected: weight on the base `.shell__place[aria-current='page']` rule.** It is fewer lines, but from 724 up it would make the header's Search tool bold on /search, which no answer asks for, and it would move the change out of the tab-row block the item names.

## Decide row answered

261004-ly7's decide row on the tab's weight is answered: 600 (Mark's later answer, 2026-10-04). The orchestrator can close it on Mark's List.

## Deviations from Plan

None. The plan was executed as written. No stubs; no new security surface.

## Deferred Human Verification

On the iPhone at 393, served from `npm --prefix app run build && npm --prefix app run preview -- --host`:

- the current tab reads bold on its rounded subtle block on /, on a recipe, on /recipe-book and on /idea-log
- on /ingredients with More open, the Ingredients item reads bold

## For Mark's List

The orchestrator adds this row (the executor did not write list rows):

- kind: check
- slug: ox2-phone-tab-weight
- title: Check the phone tab row's current tab is bold
- where: iPhone at 393, build served with `npm --prefix app run build && npm --prefix app run preview -- --host`. Open /, a recipe, /recipe-book and /idea-log: the current tab reads bold on its rounded subtle block. Open /ingredients and More: Ingredients reads bold.
- close: the ly7 decide row on the tab's weight (answered, 600)

## Self-Check: PASSED

- Probe and baseline JSON exist; shell.css and shell.test.js changed.
- Commits 8d8d601, 397e0c0, 6e377ee exist on main.
