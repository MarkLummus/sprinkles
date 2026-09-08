---
status: diagnosed
trigger: "G-03-11: While developing the next version (the plan's pen is open), the ingredient table's Remove column and its row-remove buttons occlude the numeric column values (Grams, As made, % of batch)."
created: 2026-09-08T00:00:00Z
updated: 2026-09-08T01:20:00Z
---

## Current Focus

bug_class: Bohrbug (deterministic — pure CSS layout; reproduces at every width below ~1570px, every load)

hypothesis: |
  The Data and Remove columns are the only two ingredient-table columns with no width
  rule at all. Under `table-layout: fixed` they split whatever the sized columns leave —
  and the sized columns leave almost nothing, because with the cells' default
  `box-sizing: content-box` each named width has 24px of cell padding ADDED to it
  (--col-numeric:88px costs 112px of column, --col-step:66px costs 90px,
  --col-ingredient:40% costs 40%+24px). The 03-08 derivation recorded in tokens.css
  assumed the padding sat inside those widths, so it budgeted ~197px for
  Step+Data+Remove where the browser actually leaves 10.8px for Data+Remove.
  Both collapse to ~5px, and their contents — the word "estimated"/"unreviewed" and the
  60.45px `remove` button — overflow RIGHTWARD out of their own cells. The button is an
  opaque box painted after the Data cell in document order, so it lands on top of the
  flag word.

test: real-browser measurement (Playwright + installed Google Chrome) of every column
  box, every control box, and the Range rect of the Data cell's text, at 1024/1152/1280/
  1366/1440/1512/1600/1660/1680, in both reading and developing states; then six CSS
  interventions injected at runtime to isolate each contributing condition.

expecting: |
  If true: data and remove column widths ~5px at 1280; the remove button's border box
  starts to the RIGHT of the table's right edge; and its rect overlaps the Range rect of
  the word "estimated" by tens of px. Refuted if the columns have real widths or the
  overflow runs leftward.

next_action: DONE — confirmed by measurement; diagnose-only mode, no fix applied.

reasoning_checkpoint:
  hypothesis: |
    The Remove column and the Data column have zero declared width, so under
    table-layout:fixed they receive only the table's leftover space; the leftover is
    10.8px at a 1280px viewport because every other column's declared width has 24px of
    padding added to it (content-box), which the 03-08 width derivation did not account
    for. Both columns' contents therefore overflow right, and the opaque remove button
    paints over the Data column's word.
  confirming_evidence:
    - "Measured: .ingredient-table__col-data and .ingredient-table__col-remove used widths are 5.41px each at a 1280px viewport, 0.00px at 1024/1152px."
    - "Measured: getComputedStyle(th.col-numeric).width === '88px' while its getBoundingClientRect().width === 112px — box-sizing is content-box and table-layout is fixed, so the 24px of padding is added on top of every declared width."
    - "Measured: the remove button's border box at 1280 is 822.59→883.05 while its own td is 810.59→816 and the whole table ends at 816 — 67.05px of rightward overflow past the table itself."
    - "Measured: the Range rect of the word 'estimated' in the Data cell is 817.19→883.33; its horizontal overlap with the remove button's box is 60.46px — the word is completely covered."
    - "Measured: the 'Remove' <th> text overlaps the 'Data' <th> text by 26.99px at 1280 and 9.8px at 1366 (screenshot shows the header reading 'DAEMOVE')."
    - "grep: app.css and tokens.css contain no rule and no token for .ingredient-table__col-data or .ingredient-table__col-remove — the two classes are emitted by IngredientTable.jsx and styled nowhere."
    - "grep: app.css contains zero `overflow` declarations and zero @media rules, so nothing clips the overflow and nothing changes it by width."
  falsification_test: |
    Give the two unsized columns explicit widths at runtime and re-measure. If the
    hypothesis is right the overlap must go to zero without touching any other rule.
    Ran as intervention E: `.col-data{width:72px}.col-remove{width:64px}` →
    overlap -29.9px (gone), button 15.5px inside the table's right edge. Confirmed.
  fix_rationale: |
    The occlusion is a width-allocation fault, not a paint-order or z-index fault. Giving
    the two columns real widths (and making the declared widths mean what the derivation
    thought they meant) removes the overflow at its source rather than hiding it.
  blind_spots:
    - "Not measured on a batchless child in the pen (two numeric columns instead of three, ~112px more to share) — that state is arithmetically less severe but still short."
    - "Not measured with the 'unreviewed' flag (no seed row currently carries an inherited basis); it is a longer word than 'estimated' (66.14px) so the Data column's real need is slightly greater than measured."
    - "Only Chrome measured. Firefox/Safari fixed-table padding accounting is the same per CSS 2.1 §17.5.2.1, but not verified here."
    - "Only the 12-row olive oil seed; a longer ingredient name than 'Lambda carrageenan' (142.83px) would tighten the name column's own budget further."
  candidate_causes:
    - "code: IngredientTable.jsx:447/448/496/521/600/621/622 emit ingredient-table__col-data and ingredient-table__col-remove, classes that exist in no stylesheet (category: code)"
    - "config/tokens: tokens.css defines --col-ingredient/--col-numeric/--col-step but no --col-data/--col-remove, and its 03-08 derivation comment (lines 54-66) computes the remainder as 768-307-264=197px, treating the 12px cell padding as inside the declared widths (category: config)"
    - "environment/browser: under table-layout:fixed with the default box-sizing:content-box, a declared column width has its cell padding ADDED — 88px becomes 112px, 66px becomes 90px, 40% becomes 40%+24px (category: environment)"
    - "data: the flag word 'estimated' (66.14px) and the button label 'remove'/'restore' (60.45px control) are both wider than the ~41px content box those columns would have even under the derivation's own optimistic arithmetic (category: data)"
  and_gate: |
    YES — this needs more than one condition at once. Intervention B (box-sizing:border-box
    alone) reduced the overlap from 60.5px to 0.7px but did not eliminate it: the columns
    still had no width of their own and the word still ran 12.7px past its cell.
    Intervention E (widths alone, no box-sizing change) removed the overlap but squeezed
    the name column to 158px, below what "Lambda carrageenan" needs. Only C/D/F — declared
    widths for Data and Remove AND honest padding accounting AND a name column that yields
    the remainder instead of claiming 40% — clear it without a new defect. The missing
    width is the proximate cause; the padding mis-accounting is what turned a survivable
    shortfall (33.6px per column before 03-08) into a total collapse (5.41px after).

## Symptoms

expected: |
  While developing, every ingredient-table control sits inside its own column: the step
  selector inside Step (this part now holds after plan 03-08's fix), and the row-remove
  control inside its own column, with the Grams, As made and % of batch values readable
  beside them and nothing painted over them, at desktop (about 1280-1440px) and narrow
  widths.
actual: |
  User reported verbatim: "that part passes, but the Remove column and buttons occlude the
  values in the Data column." (The step selector no longer overlaps; the Remove column /
  remove-row buttons now paint over the numeric values.)
errors: None reported
reproduction: |
  Test 11 in UAT. npm --prefix app run dev; open the churned olive oil version
  (/recipe/olive-oil-ice-cream-v1); press "Develop the next version"; look at the
  ingredient table at a normal desktop width.
started: |
  Discovered during UAT re-verification after plan 03-08 (3a825ea "size ingredient-table
  columns by identity, not position" and 15dbb76 "gate the As made column on
  hasAsMadeLayer"). The Remove column itself has had no width since 3dc7812 (03-02).

## Eliminated

- hypothesis: "The remove control overflows LEFTWARD the way the step select did in G-03-1 (a flex-end container spilling at its start edge), painting back over % of batch / As made / Grams."
  evidence: |
    Measured at 1280px: the remove button's box is 822.59→883.05, its td is 810.59→816.
    overflowLeft = -12 (i.e. it starts 12px INSIDE the cell's left padding edge, as
    normal); overflowRight = +67.05. The remove cell is not a flex container at all —
    there is no .ingredient-table__col-remove rule in app.css. The overflow runs RIGHT,
    away from the numeric columns, which is why the numeric values are in fact untouched
    and the user's re-test said "that part passes". The damage lands on Data (its right
    neighbour) and on the Formulation Note region beyond the table.
  timestamp: phase-3

- hypothesis: "A z-index / stacking or paint-order rule makes the Remove column render above its neighbours."
  evidence: |
    grep for z-index, position, isolation across app.css: none on any table element.
    The button covers the word purely because it is an opaque replaced-ish control in a
    later sibling cell, so normal document paint order puts it on top. Removing the
    overlap needs a width change, not a stacking change — proved by intervention E, which
    changed only two widths and eliminated the overlap.
  timestamp: phase-3

- hypothesis: "This is a regression introduced by 03-08 alone."
  evidence: |
    Intervention A restored the pre-03-08 step sizing at runtime (--col-step:auto):
    Data and Remove each got 33.6px and the button still overlapped the word by 32.5px,
    still spilling 38.8px past the table's right edge. The defect predates 03-08; 03-08's
    --col-step (which costs 90px of used width, not 66px) roughly doubled it, from 32.5px
    of overlap to 60.5px. The Remove column has never carried a width — git log -S
    "Remove</th>" gives 3dc7812 (03-02), and git log -S "ingredient-table__col-remove"
    on app.css returns nothing.
  timestamp: phase-3

## Evidence

- timestamp: phase-0
  checked: .planning/debug/knowledge-base.md
  found: File does not exist. Read the sibling session .planning/debug/step-selector-overlap-and-as-made-column.md instead (the same table, the prior gap).
  implication: |
    That session's hazard note ("column sizing is positional; convert to class-based
    before making a column conditional") was acted on in 03-08, and its own arithmetic
    ("768 - 307 - 264 = ~197px for Step, Data and Remove, ~41.6px of content box after
    the 12px horizontal cell padding") was carried verbatim into tokens.css lines 54-66
    as the derivation for --col-step. That arithmetic is the thing to test first: it
    subtracts the padding from the remainder, which is only correct if the declared
    widths already include their padding.

- timestamp: phase-1
  checked: grep -n "col-data|col-remove" app/src/styles/app.css app/src/styles/tokens.css
  found: No match in either file.
  implication: |
    IngredientTable.jsx emits .ingredient-table__col-data (7 sites) and
    .ingredient-table__col-remove (3 sites) but neither class is styled anywhere. They
    are the only two of the five column classes with no width. Under table-layout:fixed
    they are "the remaining columns" that "equally divide the remaining horizontal table
    space" (CSS 2.1 §17.5.2.1).

- timestamp: phase-1
  checked: grep -n "overflow|@media|text-overflow|white-space" app/src/styles/app.css
  found: |
    Zero `overflow` declarations. Zero @media rules. One white-space rule
    (.ingredient-table__split-step { white-space: nowrap }).
  implication: |
    Nothing clips the overflow, nothing truncates it with an ellipsis, and no breakpoint
    changes the layout at any width — so whatever happens at 1280px happens at every
    width, scaled by the 2fr column's size.

- timestamp: phase-3
  checked: |
    Real-browser measurement. Playwright 1.63.0 driving the installed Google Chrome
    (channel:'chrome' — the bundled chromium build was stale), against the live dev
    server on :5199, viewport 1280x1400, on /recipe/olive-oil-ice-cream-v1 with
    "Develop the next version" pressed. Every thead th's getBoundingClientRect, every
    control's rect vs its own td's rect.
  found: |
    table 48→816 (768px wide, matching the .recipe-page 2fr column: 1280 - 96 padding
    - 32 gap = 1152; 2fr = 768).
      col-name    48    → 379.19   331.19px   (computed width 307.188px)
      col-numeric 379.19→ 491.19   112.00px   (computed width 88px)   Grams
      col-numeric 491.19→ 603.19   112.00px   (computed width 88px)   As made
      col-numeric 603.19→ 715.19   112.00px   (computed width 88px)   % of batch
      col-step    715.19→ 805.19    90.00px   (computed width 66px)
      col-data    805.19→ 810.59     5.41px   (computed width 0px)
      col-remove  810.59→ 816.00     5.41px   (computed width 0px)
    Controls vs their own cells:
      grams input  391.19→479.19  inside its cell (overflowRight -12) — fine
      step select  727.19→769.67  inside its cell (overflowRight -35.52) — 03-08 holds
      remove button 822.59→883.05 cell 810.59→816 — overflowRight +67.05
  implication: |
    Two facts at once. (1) box-sizing is content-box and table-layout is fixed, so a
    declared column width has its 24px of cell padding ADDED: 88px → 112px, 66px → 90px,
    40% → 40%+24px. The five sized columns therefore consume 331.19 + 336 + 90 = 757.19
    of 768, leaving 10.81px for the two unsized ones — 5.41px each, i.e. a content box of
    0px with 24px of padding overflowing it. (2) The remove button therefore begins
    6.59px PAST the table's own right edge and runs 67px beyond it. G-03-1's fix holds:
    the step select is comfortably inside its cell.

- timestamp: phase-3
  checked: |
    Range.getBoundingClientRect() of the Data cell's text node vs the remove button's
    border box, and of the two header cells' text, swept across nine viewport widths in
    the developing state.
  found: |
      vp    data  remove | "estimated" text     remove button       word/button overlap  header overlap  btn past table right
     1024   0.00   0.00  | 657.33→723.47        657.33→717.78        60.45px             32.39px         +72.45px
     1152   0.00   0.00  | 742.66→808.80        742.66→803.11        60.45px             32.39px         +72.45px
     1280   5.41   5.41  | 817.19→883.33        822.59→883.05        60.46px             26.99px         +67.05px
     1366  22.59  22.61  | 840.13→906.27        862.72→923.17        43.55px              9.80px         +49.84px
     1440  37.39  37.41  | 859.86→926.00        897.25→957.70        28.75px             -5.00px         +35.04px
     1512  51.80  51.80  | 879.06→945.20        930.86→991.31        14.34px            -19.41px         +20.65px
     1600  69.39  69.41  | 902.53→968.67        971.92→1032.38       -3.25px            -37.00px          +3.05px
     1680  85.39  85.41  | 923.86→990.00       1009.25→1069.70      -19.25px            -53.00px         -12.96px
  implication: |
    The occlusion is present at every width the UAT names (1280-1440) and clears only at
    a ~1570px viewport. At 1024 and 1152 both columns are literally 0.00px wide and
    Playwright reports the Remove <th> as not visible. The header labels "Data" and
    "Remove" also collide below ~1400px — the screenshot shows the header reading
    "DAEMOVE". The button also intrudes 35.05px (at 1280) into the .side-region, painting
    over the Formulation Note's figures.

- timestamp: phase-3
  checked: Full-page screenshot at 1280 (/tmp/sprinkles-dbg/page-1280.png)
  found: |
    Visually: the header row reads "DAEMOVE"/"DATAPAC" where Data, Remove and the
    Formulation Note's "PAC" all paint on the same pixels; the twelve `remove` buttons
    run down a strip that sits entirely outside the table's right edge, on top of the
    Formulation Note's "estimated: Whole milk, Heavy cream, Allulose..." lines; and the
    Data column's flag word survives only as the leading "e" of "estimated" peeking out
    to the left of each button.
  implication: |
    Matches the report exactly and adds a second casualty the user did not name: the
    Formulation Note region beneath the overflow.

- timestamp: phase-3
  checked: Content widths that set the real minimum for each column (measured in the same run)
  found: |
    widest ingredient name  "Lambda carrageenan"  142.83px
    Data flag word          "estimated"            66.14px   (header "Data"    32.39px)
    remove button           "remove"/"restore"     60.45px   (header "Remove"  54.89px)
    widest numeric header   "% of batch"           80.61px
  implication: |
    Data needs ~66 + 24 padding = ~90px of column; Remove needs ~61 + 24 = ~85px. Their
    combined real need is ~175px against the 10.81px they are given — a ~164px shortfall,
    which is where the ~60px of overlap and the ~67px of spill past the table come from.

- timestamp: phase-3
  checked: |
    Six CSS interventions injected at runtime (page.addStyleTag, no file on disk touched),
    viewport 1280, pen open — a strong-inference test that differentiates the candidate
    causes in one sweep.
  found: |
    BASELINE                                    name=331.2 num=112 step=90 data=5.4  remove=5.4  overlap=+60.5
    A  --col-step:auto (pre-03-08 step sizing)  name=331.2 num=112 step=33.6 data=33.6 remove=33.6 overlap=+32.5
    B  th/td{box-sizing:border-box}             name=307.2 num=88  step=66  data=65.4 remove=65.4 overlap= +0.7
    C  B + col-data:96px, col-remove:88px       name=254   num=88  step=66  data=96   remove=88   overlap=-29.9
    D  C + col-name 26%                         name=199.7 num=97.3 step=73 data=106.1 remove=97.3 overlap=-40.0
    E  col-data/col-remove widths only          name=158   num=112 step=90 data=96   remove=88   overlap=-29.9
    F  border-box + col-name:auto + all four
       columns given padding-inclusive widths   name=187   num=105 step=90 data=91   remove=85   overlap=-24.9
  implication: |
    A proves the defect predates 03-08 (overlap 32.5px with the old step sizing) and that
    --col-step merely doubled it. B proves the content-box padding accounting is a real
    contributing condition worth ~60px, but not sufficient alone (0.7px of overlap
    remains, and the word still runs 12.7px past its cell). E proves the missing widths
    are the proximate cause — two declarations, nothing else touched, overlap gone — but
    it steals the width from the name column (158px, against a 142.83px name plus 24px
    padding: the name would wrap). C/D/F clear it cleanly. F additionally makes the name
    column `width:auto` so it absorbs the remainder rather than claiming 40%, which keeps
    the arithmetic stable when the conditional As made and Remove columns come and go.

- timestamp: phase-3
  checked: Intervention F re-measured at 1024 / 1152 / 1280 / 1440
  found: |
      FIX-F @1024: name=16.3   data=91 remove=85  overlap=-24.8  name text height 17→53 (WRAPS)
      FIX-F @1152: name=101.7  data=91 remove=85  overlap=-24.9  name text height 17→35 (WRAPS)
      FIX-F @1280: name=187    data=91 remove=85  overlap=-24.9  name text height 17     (fits)
      FIX-F @1440: name=293.7  data=91 remove=85  overlap=-24.9  name text height 17     (fits)
  implication: |
    Any fix that gives Data and Remove honest widths must also decide what yields below
    ~1250px, because at 1024 the seven columns' real content needs (~476px of sized
    columns plus 24px padding each) exceed the 597px the 2fr column offers. The choices
    are: a narrower cell padding for this table, narrower --col-numeric (the numeric
    columns' widest content is the 80.61px "% of batch" header, not the 88px field), or
    accepting a wrapped ingredient name at narrow widths — which contradicts tokens.css
    line 40 ("wide enough that no bold name wraps"). This is a design question for the
    fix plan, not part of the root cause.

- timestamp: phase-3
  checked: Reading state (no pen, no Remove column) at 1280 and 1440
  found: |
      READING @1280: tableRight=816    dataCellWidth=10.8  "estimated" 817.2→883.3  sideRegionLeft=848    intrudes 35.3px into the Formulation Note
      READING @1440: tableRight=922.7  dataCellWidth=74.8  "estimated" 859.9→926.0  sideRegionLeft=954.7  intrudes -28.7px (clear)
  implication: |
    A second, quieter instance of the same fault that nobody has reported yet: with the
    pen closed and the As made column showing, the Data column is 10.8px wide at 1280 and
    its flag word already spills 67px past the table and 35px into the Formulation Note.
    UAT test 12 passed because the child version it examines has no As made column, which
    returns 112px to the remainder. Any fix should be verified in the reading state too,
    not only in the pen.

- timestamp: phase-3
  checked: git log -S on the two introducing strings
  found: |
    git log --oneline -S "Remove</th>"                 -- app/src/ui/IngredientTable.jsx  -> 3dc7812 feat(03-02)
    git log --oneline -S "ingredient-table__col-remove"-- app/src/ui/IngredientTable.jsx  -> 3a825ea fix(03-08)
    git log --oneline -S "ingredient-table__col-remove"-- app/src/styles/app.css          -> (no commits)
  implication: |
    The Remove column has existed without a width since 03-02. 03-08 named it with a
    class in the JSX and wrote rules for the other four column classes but not for this
    one or for Data, and at the same time spent 90px of used width on --col-step. The
    class was named as if it were styled; nothing styles it.

## Resolution

root_cause: |
  An AND of four contributing conditions. Removing any one alone does not clear the
  overlap without introducing a different defect (proved by interventions A, B and E).

  1. THE PROXIMATE DEFECT — the Data and Remove columns have no width anywhere.
     app/src/ui/IngredientTable.jsx emits `ingredient-table__col-data` (lines 447, 496,
     521, 600, 621) and `ingredient-table__col-remove` (lines 448, 601, 622), but
     app/src/styles/app.css defines rules only for `__col-name` (326-328),
     `__col-numeric` (336-339) and `__col-step` (341-343), and tokens.css defines only
     `--col-ingredient`, `--col-numeric` and `--col-step`. Under `table-layout: fixed`
     (app.css:311) the two unstyled columns are "the remaining columns", which "equally
     divide the remaining horizontal table space" — whatever is left, however little.

  2. THE AMPLIFIER — the declared widths cost 24px more each than the derivation assumed.
     `.ingredient-table th, td` set `padding: var(--gap-xs) var(--gap-s)` = 6px 12px
     (app.css:318-324) and box-sizing is the default `content-box`. Under fixed layout a
     declared cell width is a CONTENT width, so the padding is added: measured,
     `getComputedStyle(th).width === '88px'` while `getBoundingClientRect().width === 112`.
     --col-numeric:88px really costs 112px, --col-step:66px really costs 90px, and
     --col-ingredient:40% really costs 40%+24px. tokens.css lines 54-66 (03-08's own
     recorded derivation, carried verbatim from the G-03-1 debug session) computed the
     remainder as "768 - 307 - 264 = ~197px for Step, Data and Remove... ~41.6px of
     content box after the 12px horizontal cell padding" — subtracting the padding from
     the remainder instead of adding it to each declared width. The browser leaves
     768 - 331.19 - 336 - 90 = 10.81px, not 197px. Data and Remove get 5.41px each: a
     content box of 0px with 24px of padding overflowing it.

  3. THE CONTENT THAT CANNOT FIT — measured minimum content widths are 66.14px for the
     Data flag word ("estimated"; "unreviewed" is longer still) and a 60.45px button for
     `remove`/`restore` (RemoveRowControl, IngredientTable.jsx:192-198, an unstyled
     native <button> carrying Chrome's UA padding and border). Neither can shrink: the
     flag is a single unbreakable word and a <button> has no shrink guard. Their combined
     real need is ~175px against 10.81px given — a ~164px shortfall.

  4. THE PAINT ORDER THAT MAKES IT AN OCCLUSION RATHER THAN A SPILL — the overflow runs
     RIGHTWARD (unlike G-03-1's leftward flex-end spill; the remove cell is not a flex
     container at all), so the Remove cell's opaque button lands on the Data cell's text,
     and it is painted after it in document order. app.css has zero `overflow`
     declarations, so nothing clips either box, and zero @media rules, so no width
     escapes it.

  Measured consequence at a 1280px viewport, pen open on the churned olive oil version:
  the remove button's box is 822.59→883.05 while its own cell is 810.59→816 and the whole
  table ends at 816. It overlaps the word "estimated" (817.19→883.33) by 60.46px — total
  occlusion — spills 67.05px past the table's right edge, and intrudes 35.05px into the
  .side-region, painting over the Formulation Note. The "Remove" header text overlaps the
  "Data" header text by 26.99px ("DAEMOVE"). The overlap is 60.5px at 1024-1280,
  43.6px at 1366, 28.8px at 1440, and clears only at a ~1570px viewport.

  Not a regression of 03-08 alone. Intervention A (restoring the pre-03-08 step sizing at
  runtime) still overlapped by 32.5px — the Remove column has had no width since 03-02
  (3dc7812). 03-08 (3a825ea) named the two classes in the JSX without styling them and
  spent 90px of used width on --col-step, which took Data and Remove from 33.6px each to
  5.41px each and roughly doubled the overlap. G-03-1's own fix holds: the step select is
  measured at 727.19→769.67, comfortably inside its 715.19→805.19 cell.

fix: NOT APPLIED — diagnose-only mode (goal: find_root_cause_only)

verification: n/a — no fix applied

files_changed: []

## Fix Direction (not applied)

principle: |
  This is a width-allocation fault, not a paint-order fault. Fix it by giving every
  column an honest width; do not reach for overflow:hidden, z-index or a smaller font,
  which would hide the collision while leaving the flag word and the button unreadable.

steps: |
  1. Make the declared widths mean what the derivation thought they meant. Either set
     `box-sizing: border-box` on `.ingredient-table th, .ingredient-table td`, or write
     every --col-* token padding-inclusive and correct the derivation comment in
     tokens.css lines 54-66, which is currently wrong and will mislead the next builder.
     Measured effect of border-box alone: Data/Remove go from 5.41px to 65.4px and the
     overlap from 60.5px to 0.7px — necessary but not sufficient.
  2. Give Data and Remove their own tokens and rules, the way the other three columns
     have them — new `--col-data` and `--col-remove` in tokens.css (every visual value
     must read through a token) plus `.ingredient-table__col-data` /
     `.ingredient-table__col-remove` width rules in app.css. Measured minimums:
     Data needs >= 66.14px of content ("estimated"; check "unreviewed" too, which no seed
     row currently produces), Remove needs >= 60.45px of content (the `remove`/`restore`
     button). Add the padding on top if step 1 is not taken.
  3. Let the name column take the remainder rather than claim a share. With
     `.ingredient-table__col-name { width: auto }` it becomes the single unsized column
     and absorbs exactly what is left, which keeps the arithmetic correct as the As made
     and Remove columns come and go — the same "identity, not position" reasoning 03-08
     applied, extended to the width budget itself. Verified as intervention F: overlap
     -24.9px at 1024/1152/1280/1440.
  4. Decide what yields at narrow widths. At 1024px the 2fr column is 597.3px while the
     six non-name columns' real needs total ~476px, leaving 16.3px for the ingredient
     name — measured in intervention F, where "Lambda carrageenan" wrapped to three
     lines. tokens.css line 40 promises the name column is "wide enough that no bold name
     wraps", so something has to give below ~1250px: a tighter cell padding for this
     table, a narrower --col-numeric (its widest content is the 80.61px "% of batch"
     header, not the 88px field), or an explicit decision that names may wrap. This is a
     design call for the fix plan and probably for Mark.
  5. Verify in the reading state as well as the pen. At 1280 with the pen closed and the
     As made column showing, the Data column is already only 10.8px wide and its flag
     word spills 35.3px into the Formulation Note. UAT test 12 passed only because the
     child version it examines has no As made column.

tokens_needed: |
  Yes — `--col-data` and `--col-remove` in app/src/styles/tokens.css, beside the existing
  --col-ingredient / --col-numeric / --col-step, with their derivations recorded. The
  existing --col-step derivation comment (tokens.css:54-66) should be corrected at the
  same time; it is the source of the mis-accounting and will reproduce this bug if a
  sixth column is ever added.

## Why It Was Not Caught

- No layout engine in the test stack. Vitest runs the UI suite under jsdom, which
  computes no boxes, so no assertion about column width, overflow or overlap is
  expressible. `npm --prefix app test` is green at 455/455 with the columns at 0px.
- 03-08's own automated gates were greps, not measurements: "zero nth-child column
  selectors in app.css", "33 ingredient-table__col- occurrences in IngredientTable.jsx",
  "--col-step token present". Every one of them passes while two of the five column
  classes are styled nowhere — a grep can confirm a class is emitted but not that any
  rule matches it.
- The derivation that produced --col-step was arithmetic on paper, carried verbatim from
  the previous debug session's own comment, and never checked against a rendered box.
  A single getBoundingClientRect at 1280 would have shown 112px where 88px was assumed.
- G-03-1's much larger, leftward step-select overflow (~280px) visually masked this one:
  the same screen already looked broken, so a 60px rightward collision on the far right
  of the table read as part of that damage.
