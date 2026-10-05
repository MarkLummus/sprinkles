---
phase: quick-261005-cm6
plan: 01
quick_id: 261005-cm6
subsystem: ui
tags: [pen, ingredient-table, per-step, blocked-save, domain]
requires: []
provides:
  - "Next version on a saved version with a line out reads the parent's figures for the struck line"
  - "A blocked save focuses and marks the blocked line alone; its sentence ends 'or remove it'"
  - "activeRows keeps a row with no portions array"
affects:
  - app/src/ui/IngredientTable.jsx
  - app/src/ui/RecipePage.jsx
  - app/src/domain/lineage.js
  - app/src/domain/rows.js
key-files:
  modified:
    - app/src/ui/IngredientTable.jsx
    - app/src/ui/RecipePage.jsx
    - app/src/ui/IngredientTable.test.jsx
    - app/src/ui/RecipePage.perStep.test.jsx
    - app/src/domain/lineage.js
    - app/src/domain/lineage.test.js
    - app/src/domain/rows.js
    - app/src/domain/rows.test.js
decisions:
  - "D-A: the parent's own figures are the parent of the version the pen opened on (RecipePage's parentVersion), passed to the table while the pen is open"
  - "D-B: a struck line reads the version the pen opened on, else its parent, else prints no portion line and no share"
  - "D-C: the pen's accessible name stays row-level and reads the row as it stood at open"
  - "D-D: the blocked-save sentence ends 'or remove it'"
  - "D-E: a blocked save marks and focuses the blocked line alone"
metrics:
  tasks: 3
  files: 8
  tests: "1857 passed, 63 files"
status: complete
commits: 6
plan_head_before: e0fde9d98e3c49777726d1ac52ac7fbacd94b4f3
plan_head_after: f2d6b4d090e15d764f55ee634aba5bd1873cad65
actuals:
  tokens: 7000
  tasks: 3
  commits: 6
---

# Quick 261005-cm6: Next version on a saved version with a line out

Mark's List row per-step-open-pen-with-line-out, his answer "fix". The pen opened on a saved version that already has a line out now reads the parent's figures for that struck line, announces no change that did not happen, and a blocked save lands on the line that blocks it.

## What changed, per finding

**WR-03 (struck line figures).** In `renderDevelopingEntry` (`app/src/ui/IngredientTable.jsx`) a new module function `rowHoldingLine(activeById, rowId, portionIndex)` says whether an active-row map holds the line at a stored position (a row kept whole holds every position; a copied row holds the positions its portions carry in `index`). A struck line reads the first of these that holds it: the version the pen opened on, then the parent. With neither it prints no portion line and no struck share; its struck amount and restore link stay. The portion line and the struck share both read the same figures. `ShareCell` strikes only when there is a baseline share. `RecipePage.jsx` now gives the table `parentVersion` while `mode === 'developing'` as well as while Show changes is on.

**WR-02 (false "was 54.5%, now 36.8%").** The pen's accessible name stays row-level (03.3-02) but reads the row as it stood when the pen opened, lines in (`openingRow ?? row`), and its "now" amount and the "was X g" join cover only the lines in now. The untouched Step 3 line of the child reads exactly `Whole milk, 250.4 g, estimated`; the struck Step 2 line reads `Whole milk, 250.4 g, estimated, removed`.

**WR-04 (blocked save).** `findBlockedRow` in `app/src/domain/lineage.js` now returns the blocked line's index, and a new `blockedSaveLineIndex` reads the same traversal as `blockedSaveMessage` and `blockedSaveRowId`. `RecipePage` stores the index on `blockedTarget` and passes `blockedLineIndex`. In the table the focus registry is still a Map, now keyed by a `rowId:lineIndex` string, every line registers its field, the effect keeps its `[blockedRowAttempt]` dependency, and only the blocked line carries `is-marked`. The sentence is now `<Name> needs an amount, or remove it`.

**IN-01.** `activeRows` in `app/src/domain/rows.js` reads `row.portions ?? []`, so a row with no portions array comes back as the same object and agrees with `isRowRemoved`.

## Decisions

- D-A. "The parent's own figures" is the parent of the version the pen opened on (`parentVersion`), the version Show changes compares against. A line pressed out in this session was in at open, so it keeps reading the version the pen opened on.
- D-B. First of: the version the pen opened on, its parent. Neither holds the line (no parent, parent not yet read, parent has it out too): no portion line, no share. The review proposed a bare amount; this follows Mark's "drop" answer on per-step-one-line-left. Not drawn on any board. Goes to Mark (below).
- D-C. The name stays row-level. A row wholly out at open has no opening share, so its name carries no share change.
- D-D. The blocked sentence ends "or remove it". `.impeccable/surfaces/route-recipe-version.md` line 111 still quotes the older sentence and was not edited.
- D-E. A blocked save marks and focuses the blocked line alone.

## Commits and RED failures

Each test commit precedes its fix commit and holds only its own paths.

| Commit | What |
| --- | --- |
| 6f0ef15 | test: G1, G2, H1 to H6 |
| 50f91bc | fix: struck lines read the parent; name reads the row at open |
| 43cef43 | test: ten messages, blockedSaveLineIndex, activeRows without portions |
| f67af67 | fix: findBlockedRow index, per-line sentence, activeRows guard |
| 57828b2 | test: K1, K2, blockedLineIndex on the existing blocked-row case |
| f2d6b4d | fix: focus and mark the blocked line |

RED, task 1 (8 failed, 109 existing passed):
- H1 `expected '<span class="struck-value">17.7%</span>' to be '...15.0%...'`
- H2 `expected '...28.0%...' to be '...15.0%...'`
- H3 `expected '...46.2%...' to be '...31.6%...'`
- H4 `expected the Step 2 line not to contain 'ingredient-table__portion-note'` (received '120 g of 250.4 g · 36.8% in all', share 17.7%)
- H5 `expected '120 g of 350.4 g · 44.9% in all' to be '120 g of 370.4 g · 46.3% in all'`
- H6 name read `was 370.4 g, now 120 + 260 g, ...` instead of `was 250.4 g, now 260 g, was 36.8%, now 37.7%`
- G1 `expected '120 g of 250.4 g · 36.8% in all' to be '120 g of 370.4 g · 46.3% in all'`
- G2 `expected '17.7%15.0%' to be '15.0%'`

RED, task 2: the ten blank-amount messages (`...or remove the row` vs `...or remove it`), the six blockedSaveLineIndex cases (`blockedSaveLineIndex is not a function`) and `TypeError: Cannot read properties of undefined (reading 'forEach')` at `activeRows` in rows.js.

RED, task 3: K1 `expected 'Whole milk, grams, portion 1' to be 'Whole milk, grams, portion 2'`; K2 focus already passed, the mark failed (`expected true to be false`: both Whole milk lines were marked).

Full suite after the last fix: 63 files, 1857 tests, all passing, including `tabindex-scan`. `npm --prefix app run build` exits 0. Measured commit count 6.

## Deviations from Plan

**1. [Rule 1 - Bug in the plan's test] K1's page-text assertion removed.** K1 asserted that the page text contains "Whole milk needs an amount, or remove it". A row-level block never writes that sentence to the page: `buildPenFields` stores it in `blockedMessage`, which only the version-line field (`versionLineError`) renders. A blocked row is shown by the mark and the focus alone. The assertion could not hold, so I removed it from K1 (amending the unpushed test commit before the fix, so history reads test then fix) and the sentence is pinned in the lineage domain tests instead. Not fixed: rendering the sentence for a row block would be new UI and is outside this plan. Recorded for Mark below.

No other deviations. No file outside the eight planned app files was touched.

## Known quirk, left as the plan pins it

After restoring the line that was out (G2) the Step 3 name reads `Whole milk, 250.4 g, was 36.8%, now 46.3%, estimated`: the grams phrase stays `250.4 g` because no draft amount differs from the stored one, although the row now totals 370.4 g. The plan pins this exact string, so it was built as written. A "was 250.4 g, now 370.4 g" phrase would be the more honest reading if Mark wants it.

## Out of scope, recorded for later

- WR-01 (diff.js row-level figures) and IN-02 (`lines[].removedChanged` unread, `DiffShareCell`'s empty strike).
- WR-03's other path: Show changes when the parent and the child both have the line out. It still prints a portion line over the parent's row without the line, and a struck share from diff.js's `shareFrom`. The review ties its fix to IN-02's `removedChanged`, so it waits for the same follow-up.
- A row-level blocked save never shows its sentence on the page (see Deviations). Mark may want it drawn.

## Proposed rows for Mark's List (not added by the executor)

- Decide, slug per-step-struck-line-no-figures. What does a struck line show in the pen when neither the version the pen opened on nor its parent has it in? Options: drop the portion line and the share, keeping the struck amount and restore link (as built, recommended), or print the bare amount.
- Note for the existing per-step-brief-amend row: the blocked-save sentence now ends "or remove it", and `.impeccable/surfaces/route-recipe-version.md` line 111 still quotes the older "or remove the row" wording.
- Decide or note, slug per-step-blocked-sentence-unseen. A blocked row save marks and focuses the line but the sentence is never on screen (only the version-line block shows its sentence). Does Mark want it shown?

## Not verified

The devices. No iPad (1366) or iPhone (393) check was run; the tests run under jsdom and renderToStaticMarkup only.

## Deferred Human Verification

Serve with `npm --prefix app run build && npm --prefix app run preview -- --host`, never the dev server. On the iPad (1366) and the iPhone (393): open Olive Oil v1, press Next version, remove Whole milk's Step 2 line, save, then press Next version on the saved version. The struck line reads "120 g of 370.4 g · 46.3% in all" and 15.0%. Clear Step 3's amount and press Save: the cursor lands in Step 3's field.

## Self-Check: PASSED

- All eight app files exist and are changed; `git status --porcelain -- app/` is empty.
- Commits 6f0ef15, 50f91bc, 43cef43, f67af67, 57828b2, f2d6b4d exist on main.
- `git diff --name-only e0fde9d..HEAD -- app/src/styles app/src/domain/diff.js .impeccable DESIGN.md PRODUCT.md .planning/sketches .planning/canvas-generators` prints nothing.
