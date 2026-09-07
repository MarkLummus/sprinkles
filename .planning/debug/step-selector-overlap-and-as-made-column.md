---
status: diagnosed
trigger: "G-03-1: While developing a version, the ingredient table's step selector overlaps the Grams, As Made and % of batch values at a normal browser width; and the As Made column is visible on a version that has no batch in view."
created: 2026-09-07T00:00:00Z
updated: 2026-09-07T00:00:00Z
---

## Current Focus

bug_class: Bohrbug (deterministic — pure CSS layout; reproduces at every normal desktop width)

hypothesis_a: |
  The step selector overflows LEFT out of its cell because
  `.ingredient-table__step-cell` is a `display:flex; justify-content:flex-end`
  container whose `select.ink-field` child is given `width: auto` (overriding
  `.ink-field { width: 100% }`) but is NOT given the `flex: 1 1 auto; min-width: 0`
  pair that the sibling `.ingredient-table__grams-cell .ink-field` rule does give
  its input. With `min-width: auto` the select's automatic minimum size is its
  min-content width — the widest `<option>` string ("2. Gum slurry — the only
  high-heat step", ~38ch) — so it cannot shrink into the ~40-90px the fixed-layout
  Step column allots. Because the container justifies to `flex-end`, the ~200-250px
  of unshrinkable overflow is emitted at the START edge, i.e. leftward, painting
  over the % of batch, As made and Grams cells in that order. Nothing clips it:
  app.css contains zero `overflow` declarations.

hypothesis_b: |
  The As Made column renders unconditionally: IngredientTable.jsx line 346 emits
  `<th>As made</th>` and lines 374/400/450 emit its `<td>` with no guard, while the
  predicate that should govern it — `hasAsMadeLayer` (line 322, "recording, or a
  saved batch reading (D-22)") — is applied only to the tfoot as-made total (480)
  and the small-print legend (488). The column's presence was never wired to the
  predicate written for it.

test: confirm both in a real browser at ~1280-1440px on the churned version's pen
expecting: |
  (a) select bounding box left edge < its td's left edge by ~200px, spanning three
      columns; grams input's box stays inside its td.
  (b) an "As made" th present with empty tbody cells, empty tfoot cell and no legend
      on a version with no batch.
next_action: start the dev server and measure the boxes in Chrome

## Symptoms

expected: |
  The pen flow saves a child at its own URL with the churned version untouched, and the
  ingredient table renders legibly while developing: the step selector sits in its own cell
  and never overlaps the Grams, As Made or % of batch values; the As Made column is shown
  only when a batch is in view (recording, or a saved batch open in the margin), per the
  batch surface brief .impeccable/surfaces/route-recipe-batch.md section 3.
actual: |
  "pass with these observations: - the visual display of the ingredient table is broken: at a
  normal browser width, the step selector control is overlapping the Grams, As Made, and % of
  Batch column values. - when viewing the version (not a batch), the "As Made" column is
  visible in the ingredient table - should it be?"
errors: None reported
reproduction: |
  Test 1 in UAT — open the churned olive oil version (/recipe/olive-oil-ice-cream-v1), click
  "Develop the next version", look at the ingredient table at a normal desktop width; then save
  as a new version and view the child, which has no batch.
started: |
  Discovered during Phase 3 UAT on 2026-09-07 after plans 03-01..03-05. Step-allocation cell and
  its select added in 03-02; As Made column header has rendered unconditionally since Phase 2.

## Eliminated

## Evidence

- timestamp: phase-0
  checked: .planning/debug/knowledge-base.md
  found: File does not exist; no prior resolved-session patterns to match against
  implication: No known-pattern shortcut; investigate from first principles

- timestamp: phase-1
  checked: app/src/styles/app.css lines 306-341 (.ingredient-table)
  found: |
    table-layout: fixed; width: 100%. th:first-child width --col-ingredient (40%).
    th/td nth-child(2),(3),(4) width --col-numeric (88px). Columns 5 (Step), 6 (Data)
    and 7 (Remove, developing only) carry NO width, so they split the remainder equally.
  implication: |
    In the 2fr column of .recipe-page (grid-template-columns: 2fr 1fr, padding 48px,
    gap 32px), a 1280px viewport gives the table ~768px: 307px name + 3x88px numeric
    = 483px, leaving ~285px / 3 = ~95px per unsized column, ~41px of content box after
    the 12px cell padding either side. The Step column is structurally tiny.

- timestamp: phase-1
  checked: app/src/styles/app.css line 750 (.ink-field) vs 358 vs 397
  found: |
    Base .ink-field sets `width: 100%; box-sizing: border-box`.
    .ingredient-table__grams-cell .ink-field OVERRIDES with `width: auto; flex: 1 1 auto; min-width: 0`.
    .ingredient-table__step-cell select.ink-field OVERRIDES with `width: auto` ONLY.
  implication: |
    Differential: the two pen cells share an identical flex arrangement
    (display:flex; align-items:center; justify-content:flex-end; gap:--gap-strike),
    but only the grams cell carries the `flex: 1 1 auto; min-width: 0` shrink guard.
    The step cell dropped `width: 100%` without replacing it with anything that
    constrains the control. This is the single differing variable between a cell
    that behaves and a cell that does not.

- timestamp: phase-1
  checked: app/src/data/olive-oil.js lead-in strings
  found: |
    Ten steps; longest option label is "2. Gum slurry — the only high-heat step" (~38
    characters). At --size-ink-field 0.9375rem in the grotesk that is roughly 260-280px
    of text plus the select's padding, border and disclosure arrow.
  implication: |
    A select's min-content width in Chrome/Safari is the widest option's width, so the
    control's automatic minimum size is ~280-300px against a ~41-63px content box.
    The overflow is ~220-260px — which is 88+88+88 = 264px, exactly the three numeric
    columns the user named, in the order they named them.

- timestamp: phase-1
  checked: grep -n "overflow" app/src/styles/app.css
  found: Zero overflow declarations anywhere in the stylesheet.
  implication: |
    Nothing clips the overflowing select. The select is an atomic replaced box inside
    td 5, which paints after tds 2-4 in document order, so its opaque control chrome
    covers their text rather than sitting behind it — "overlapping", exactly as reported.

- timestamp: phase-1
  checked: app/src/ui/IngredientTable.jsx lines 322-324, 344-351, 374/400/450, 480, 488
  found: |
    hasAsMadeLayer = mode === 'recording' || Boolean(openBatch), with the comment
    "The as-made total appears only while an as-made layer is showing — recording, or
    a saved batch reading (D-22)". It gates tfoot's as-made cell (480) and the
    table-small-print legend (488). The <th>As made</th> (346) and all three AsMadeCell
    <td> sites (374, 400, 450) are ungated. AsMadeCell itself returns null when not
    recording and no openBatch.
  implication: |
    On a version with no batch the table renders a labelled "As made" column with an
    empty body, an empty total and no legend — internally incoherent by the file's own
    stated rule, independent of any brief ambiguity.

- timestamp: phase-1
  checked: app/src/ui/RecipePage.jsx lines 307-312
  found: |
    openBatch = URL-named batch, else the most recent batch by churn date, else null.
    It is not cleared while mode === 'developing'.
  implication: |
    On the churned olive oil parent openBatch is non-null, so the As Made column is
    legitimately in view there even in the pen; the child saved from it has no batch,
    so openBatch is null and the column is the pure empty case the user reported.
    The column costs --col-numeric (88px) of the fixed layout in BOTH cases, which
    aggravates finding (a) but is not its cause.

- timestamp: phase-1
  checked: .impeccable/surfaces/route-recipe-batch.md sections 3 and 4
  found: |
    "Ingredient table: an as-made column. A blue column beside grams, blank by default."
    and, of the recording ceremony, "the as-made column appears".
  implication: |
    The brief's "blank by default" and "the column appears" are in tension read
    literally, so the visibility rule is a design question for Mark; but D-22 as
    already encoded in hasAsMadeLayer answers it, and the code contradicts its own
    encoding.

## Resolution

root_cause: |
  FINDING (a) — the step selector overlaps Grams / As made / % of batch.
  An AND of six conditions, five standing and one defect:

  1. app/src/styles/app.css:311 — .ingredient-table uses `table-layout: fixed`,
     so a column's width is never set by its content. A control wider than its
     column cannot widen it; it can only overflow.
  2. app/src/styles/app.css:326-341 — th:first-child is pinned to --col-ingredient
     (40%) and th/td:nth-child(2),(3),(4) to --col-numeric (88px). Step, Data and
     Remove carry no width and split what is left. At a 1280px viewport the
     .recipe-page 2fr column gives the table 768px: 307.2 + 264 = 571.2 spoken for,
     196.8 remaining / 3 = 65.6px per column, ~41.6px of content box after the
     12px horizontal cell padding.
  3. THE DEFECT — app/src/styles/app.css:397-399:
       .ingredient-table__step-cell select.ink-field { width: auto; }
     cancels the base .ink-field `width: 100%; box-sizing: border-box`
     (app.css:750-760) without replacing it with the shrink guard its sibling
     rule carries (app.css:358-362):
       .ingredient-table__grams-cell .ink-field { width: auto; flex: 1 1 auto; min-width: 0; }
     Left at `min-width: auto`, the select's automatic minimum size is its
     min-content width — the widest <option> — so it cannot shrink into 41.6px.
  4. app/src/ui/IngredientTable.jsx:109 — option labels are `${step.n}. ${step.leadIn}`.
     The longest in app/src/data/olive-oil.js is "2. Gum slurry — the only high-heat
     step" (~39 chars, ~290px of text at --size-ink-field, ~320px once the control's
     padding, border and disclosure arrow are added).
  5. app/src/styles/app.css:390-395 — .ingredient-table__step-cell justifies to
     `flex-end`. An overflowing flex line under flex-end spills at the START edge,
     so the ~280px of unshrinkable overflow is emitted LEFTWARD, not rightward.
     This is what aims the damage at the numeric columns instead of at Data/Remove.
  6. app.css contains zero `overflow` declarations, so nothing clips it, and the
     select is an opaque atomic box inside td 5 — painted after tds 2-4 in document
     order, therefore on top of their values.

  Quantitative check: predicted leftward overflow ~280px against 88x3 = 264px of
  numeric columns. The select's left edge lands at or just past the Grams column's
  left edge and stops short of the name column — i.e. it covers exactly % of batch,
  As made and Grams and nothing more, which is precisely the three columns the user
  named. The symptom is width-invariant (app.css has no @media rules) and worsens
  as the window narrows.

  Introduced by commit 3dc7812 (03-02), which in one change added both the select
  and the 7th "Remove" column — the Remove column cut the Step column from ~98px to
  ~66px, so the same commit introduced the oversized control and shrank its home.
  The rule's own comment claims "the same struck-baseline-beside-field arrangement
  the grams cell uses"; it copied the flex arrangement and the `width: auto`
  override but dropped the two properties that made the grams cell safe.

  FINDING (b) — the As Made column shows on a version with no batch.
  app/src/ui/IngredientTable.jsx:322 already computes the governing predicate —
    const hasAsMadeLayer = mode === 'recording' || Boolean(openBatch);
  under the comment "The as-made total appears only while an as-made layer is
  showing — recording, or a saved batch reading (D-22)". That predicate gates only
  the tfoot as-made total (line 480) and the table-small-print legend (line 488).
  The column itself was never wired to it: `<th scope="col">As made</th>` (line 346)
  and all three `<td><AsMadeCell .../></td>` sites (lines 374, 400, 450) are
  unconditional, and AsMadeCell returns null when not recording with no openBatch.
  Result on a batchless version: a labelled column with an empty body, an empty
  total and no legend — incoherent by the file's own encoded rule, independent of
  any ambiguity in the brief. Per RecipePage.jsx:307-312, openBatch is the
  URL-named batch, else the newest batch, else null, and is not cleared while
  developing — so on the churned parent the column is legitimately in view even in
  the pen, and the child saved from it (no batch) is the pure empty case reported.

  Relationship between the two: (b) costs the fixed layout --col-numeric (88px)
  whether or not it carries anything, which aggravates (a). It is not its cause —
  dropping the column returns only ~29px to the Step column, against a ~280px
  shortfall.

fix: NOT APPLIED — diagnose-only mode (goal: find_root_cause_only)

verification: n/a — no fix applied

files_changed: []

## Fix Direction (not applied)

finding_a: |
  Constrain the select instead of freeing it. The minimal, symmetrical change is to
  give .ingredient-table__step-cell select.ink-field the same guard the grams field
  already has — `flex: 1 1 auto; min-width: 0;` alongside its `width: auto` — so the
  control shrinks to its cell like every other pen field. Because a shrunken select
  truncates its option text, the Step column also needs real width: either drop
  `width: auto` and let the base `width: 100%` apply, or size the Step column
  explicitly through a new token (every visual value must read through a custom
  property in tokens.css). Consider whether the option label needs the full lead-in
  at all — "2." with the lead-in only in the option list, or a shortened label —
  since the cell is a 40-90px slot by design.

finding_b: |
  Gate the column on the predicate that already exists: wrap the `<th>As made</th>`
  and the three `<td><AsMadeCell/></td>` sites in `hasAsMadeLayer`, the same flag the
  tfoot cell and the legend already use, and drop the tfoot's as-made cell with them.
  Confirm with Mark first: route-recipe-batch.md is in genuine tension — § 3 calls it
  "a blue column beside grams, blank by default" (reads as always present) while the
  ceremony paragraph says "the as-made column appears" on recording. D-22 as encoded
  in hasAsMadeLayer answers it; the brief should be amended to match whichever way
  he rules.

hazard: |
  The column sizing is positional — th/td:nth-child(2),(3),(4). Removing the As Made
  column shifts those selectors onto Grams, % of batch and Step, pinning Step to 88px
  and right-aligning it. Any fix that makes the column conditional MUST first convert
  the sizing to a <colgroup> or to class-based selectors, or it will make finding (a)
  worse while appearing to fix finding (b). The existing conditional "Remove" column
  is safe only because it is last.

## Why Neither Was Caught

- (a) is invisible to the current stack: Vitest runs under jsdom, which has no layout
  engine, so no assertion about box geometry, overflow or overlap is possible. There
  is no visual-regression or real-browser gate in the project.
- (b) had no test at all: app/src/ui/IngredientTable.test.jsx holds 4 tests and none
  assert the table's column headers. `grep -rn "As made" app/src/ui/*.test.jsx`
  returns nothing. The suite is green at 354/354 with both defects present.
