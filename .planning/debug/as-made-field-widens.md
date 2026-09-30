---
status: diagnosed
trigger: "G-03.5-8a: The recording state's as-made field keeps a fixed width while typing. Mark: 'it gets wider as I type the numbers'"
created: 2026-09-29T00:00:00Z
updated: 2026-09-29T00:00:00Z
goal: find_root_cause_only
---

## Current Focus

bug_class: Bohrbug (deterministic, reproduced every run in Chromium; same CSS mechanism in WebKit)
hypothesis: CONFIRMED. The as-made input has no width of its own (.ink-field width:100%), so it takes the as-made column's width. That column is content-sized (width:1%, table-layout:auto), and its widest unbreakable content is the tfoot's live as-made total (nowrap, in the hand). The total is recomputed from draft.asMade on every keystroke, so each extra digit in the total widens the column, and the field grows with it. The field's own value plays no part.
test: done. Measured the built app on :4173 while typing; falsified with two CSS injections.
expecting: n/a
next_action: return ROOT CAUSE FOUND to the orchestrator (diagnose-only)

reasoning_checkpoint:
  hypothesis: "The as-made field widens because it is width:100% of a content-sized column whose width is set by the nowrap tfoot as-made total. The total re-renders from draft.asMade on every keystroke and gains 9px per extra digit (Caveat at 20px)."
  confirming_evidence:
    - "inputW equals the tfoot total span's width at every step: 51.91 (799.7 g), 60.91 (1913.7 g), 69.91 (13024.7 g); td = span + 12px padding"
    - "With the tfoot total hidden by injected CSS, the field holds 37.69px through 12345 typed (the header's 'MADE' min-content)"
    - "The Correct path (prefilled 120, caret inside) widens 9px per keystroke: 51.91 > 60.91 > 69.91 > 78.91 > 87.91 > 96.91"
  falsification_test: "If the field's own value drove its width, hiding the total would not stop the growth. It did stop it (A_hideTotal: constant 37.69px)."
  fix_rationale: "diagnose only. The field needs its own width, and the column needs a width the live total cannot push."
  blind_spots: "No WebKit binary is available (Playwright has Chromium only), so the iPad is not re-measured. The mechanism (auto table layout, percentage-width input, nowrap footer text) is engine-neutral, and Mark reports the same symptom on the iPad."
  candidate_causes:
    - "code/CSS: .ink-field width:100% with no as-made override (app.css:1395; the pen's grams field has one at app.css:859-862, the as-made field does not)"
    - "code/CSS: the content-sized numeric column (app.css:788-791) plus the nowrap tfoot total (app.css:918-920, IngredientTable.jsx:691-695)"
    - "data: the total's digit count. Realistic amounts that keep the total under 1000 g never widen it (probe 2: 0 changes in 45 keystrokes); appending digits (the Correct path) or any total at 1000 g or more does"
    - "environment: font digit widths. Eliminated: Caveat digits are equal-width (1111 = 8888 = 0000 = 36px)"
  and_gate: "yes. Growth needs (a) the field to have no fixed width AND (b) the column's width to follow the live total. Remove either and the field holds (A and B experiments)."

## Symptoms

expected: The recording state's as-made field (per-ingredient "as made" grams input in the Sheet while recording a batch) keeps a fixed width while typing.
actual: "it gets wider as I type the numbers" (Mark, UAT test 8 item 2; LADDER-CONFORMANCE measured the field at about 52px)
errors: none
reproduction: open the record pen (Olive Oil v1 -> Correct, or Record a batch on Standard Base), type a multi-digit amount into an as-made field, watch the field/column width. iPad (WebKit), likely desktop too.
started: discovered during 03.5 UAT

## Eliminated

- hypothesis: The input sizes to its own value (field-sizing: content, a size attribute, or a ch-based width)
  evidence: getComputedStyle(input).fieldSizing = "fixed" at every width. field-sizing: content applies only to textarea (app.css:306-309). The input has no size attribute (IngredientTable.jsx:290-301). With the tfoot total hidden, the field holds 37.69px through "12345".
  timestamp: 2026-09-29

- hypothesis: Caveat's proportional digits make the total's width change on every keystroke, even when the digit count holds
  evidence: Caveat 20px digit runs measure 1111 = 8888 = 0000 = 36px with and without tabular-nums. The width changes only when the total's digit count changes (799.7 -> 680.7 -> 691.7 -> 802.7 all measured 51.91px).
  timestamp: 2026-09-29

- hypothesis: The list form below 724 widens too
  evidence: At 393 coarse the input holds 64px (grid track var(--sheet-plan-grams-w), app.css:2485) through "12345". The tfoot total there overflows its 64px track instead (69.91px at 13024.7 g), which is a separate cosmetic effect.
  timestamp: 2026-09-29

## Evidence

- timestamp: 2026-09-29
  checked: IngredientTable.jsx AsMadeCell (285-309)
  found: The recording branch renders a bare <input type="text" inputMode="decimal" className="ink-field">. It has no size attribute and no sizing class, and sits directly in td.ingredient-table__col-numeric. It is not inside .ingredient-table__plan-grams, so the pen's fixed-width rule never reaches it.
  implication: Its width comes entirely from .ink-field and the cell.

- timestamp: 2026-09-29
  checked: app.css .ink-field (1384-1397), .ingredient-table (715-729), .ingredient-table__col-numeric (788-791), td numeric nowrap (796-798), tfoot numeric nowrap (918-920), .ingredient-table__plan-grams .ink-field (859-862)
  found: .ink-field is width:100% (line 1395). The table is table-layout:auto (line 724). The numeric columns are width:1% (content-sized, decision 15). Only the pen's grams field gets a fixed width (--sheet-grams-field-w 52px); the as-made field gets none.
  implication: The field is exactly as wide as the column's content box, and the column is as wide as its widest unbreakable content.

- timestamp: 2026-09-29
  checked: IngredientTable.jsx 406-411 and 691-695
  found: In recording mode, asMadeTotal is computed from draft.asMade on every render and printed in tfoot as <span className="sheet-hand">{asMadeTotalText}</span> in the same column. .sheet-hand is Caveat at 20px (--size-hand-min 1.25rem), and the cell is nowrap.
  implication: Each keystroke re-renders the total. The total is the column's widest nowrap content (the header wraps "AS / MADE", and a percentage-width input contributes 0 to min-content).

- timestamp: 2026-09-29
  checked: 03.5-11-SUMMARY.md:46, 180 and 03.5-11-PLAN.md:95; 03.5-table-probe.mjs readRecording (162-181)
  found: The plan anticipated `.ingredient-table td.ingredient-table__col-numeric .ink-field { width: var(--sheet-grams-field-w) }` for the case where the column SQUEEZES the field below 52px. The probe read the EMPTY field only (~51.9px), so the rule was dropped as "not needed". No step typed into the field.
  implication: The "≈52px" in LADDER-CONFORMANCE Open item 2 is the width of the string "799.7 g" in Caveat 20px, not a designed width. It was a coincidence of the seed's total.

- timestamp: 2026-09-29
  checked: The built app on http://localhost:4173 (the index-CrtH-8SI.js build Mark tested), headless Chrome, Olive Oil v1 batch route, "Record another", typing into the first as-made field (scratch asmade-probe.mjs)
  found: At 1366 coarse, 1366 fine and 984 fine the results are identical. empty/1/12/123 give input 51.91, td 63.91, total 799.7/680.7/691.7/802.7 g. "1234" gives input 60.91, td 72.91, total 1913.7 g. "12345" gives input 69.91, td 81.91, total 13024.7 g. The name column shrinks by the same amount (183.67 > 174.67 > 165.67), and the input's left edge moves left 9px per digit.
  implication: The field width equals the tfoot total's width at every step.

- timestamp: 2026-09-29
  checked: The Correct path (prefilled as-made "120"), appending digits keystroke by keystroke (asmade-probe3.mjs, 1366 coarse)
  found: The field widens 9px on EVERY keystroke: 51.91 > 60.91 > 69.91 > 78.91 > 87.91 > 96.91. The total goes 804.3 > 1804.3 > 11904.3 > 113004.3 > 1124104.3 > 11235204.3 g.
  implication: This matches "it gets wider as I type the numbers" literally. Typing into a prefilled field multiplies the value and adds a digit to the total each time.

- timestamp: 2026-09-29
  checked: Realistic entry (each as-made field typed with its plan amount; asmade-probe2.mjs) on Olive Oil (14 rows, 45 keystrokes) and Standard Base (6 rows, 15 keystrokes)
  found: 0 width changes. The totals stay under 1000 g.
  implication: The trigger is a total that crosses a digit boundary (1000 g and up, or a mistyped or appended value). A recipe whose total is near or above 1000 g, or any over-typing, triggers it.

- timestamp: 2026-09-29
  checked: Falsification by injected CSS (asmade-probe4.mjs, 1366 coarse)
  found: A) With the tfoot total hidden, the field holds 37.69px (td 49.69) through "12345" while the total reaches 13024.7 g. B) With a fixed 52px width on the as-made field (the rule 03.5-11 considered), the field holds 52px, but the TD still grows 64 > 72.91 > 81.91 and the name column still shrinks 183.58 > 174.67 > 165.67.
  implication: The total drives the column, and the column drives the field. A fixed field width alone stops the field growing, but the column and the name column still move.

- timestamp: 2026-09-29
  checked: The sibling case, the developing pen's grams column (asmade-probe5.mjs)
  found: The pen's grams field holds 52px (fixed rule), but the amount td grows 88.78 > 128.59 > 131.08 > 139.42 and the name column's left edge moves right by 50px. The row's own struck value and the tfoot's struck-plus-current total are nowrap content in the same content-sized column.
  implication: The same content-sized-column mechanism exists in the pen (out of scope for 8a; noted for the fix planner).

## Resolution

root_cause: "The recording state's as-made <input> (IngredientTable.jsx:290-301) has no width of its own. It inherits .ink-field's width:100% (app.css:1395), so it fills the as-made column. Since decision 15 (03.5-11) that column is content-sized (.ingredient-table__col-numeric width:1% under table-layout:auto, app.css:724, 788-791). Its widest unbreakable content is the tfoot's live as-made total (<span class=\"sheet-hand\">, Caveat 20px, nowrap, IngredientTable.jsx:691-695, app.css:918-920). The total is recomputed from draft.asMade on every keystroke (IngredientTable.jsx:406-411), so each extra digit in the total widens the column by 9px, and the field with it. The rule 03.5-11 anticipated (a fixed --sheet-grams-field-w on the as-made field) was dropped because the probe measured only the empty field, whose ~52px was the width of the seed total '799.7 g'."
fix: (diagnose only)
verification:
files_changed: []
