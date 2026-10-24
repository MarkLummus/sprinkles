# The batch route's log column: rhythm (2026-10-22)

`/impeccable layout` on the live built batch route, Mark's note "concerned about rhythm". Single context: no sub-agent tool is exposed to this agent, so the two assessments of `reference/layout.md` were run by Sid in order, the rendered one first and the mechanical scan second, and synthesised here. Nothing under `app/` is edited by this proposal; the change set below is written for `/gsd-quick`.

**Target.** `http://192.168.1.133:4173/notebook/mexican-chocolate/mexican-chocolate-v4/batch/…` (Mark's device server, the Vite preview of `app/dist` at HEAD's `app/`, 61d2fe9c). Mark's own batch lives in his iPad's IndexedDB, so the probe recorded a batch of the same shape in its own WebKit context (churn date, both figures, both notes, both picks, a tasting with date, figures, note, melt test and style, Next time, two marks, one problem) and measured that. Surface: `aside.notebook-log`, the churn section and tasting section, as the record pen (Record another, Correct, with Add tasting, with At draw picked) and as the reading state. Engines and widths: Playwright WebKit, coarse pointer, 1366 × 744 (the iPad's engine and width) and 393 × 852 (sketch 011 decision 30 allows phone logging). Chromium was not run: every value here is a computed CSS box, which the two engines lay out alike; the device itself is unverified (Mark's iPad is the evidence). Mexican Chocolate declares no scale and no problem, so "This recipe only" never draws on this route.

**Evidence.** Probe `.planning/phases/10-the-creation-editor-without-save/10-layout-probe.mjs` (`BASE_URL=… node 10-layout-probe.mjs .impeccable/layout`); its output `.impeccable/layout/layout-measure.json` (every labelled element, control and rule in the log, in document order, with face and the gap to the element above, eight states) and the screenshots `.impeccable/layout/<state>.png` (viewport) and `<state>-log.png` (the column). The reserved head boxes were measured separately (field-row caption, segmented head, axis head: box, text, margins).

**Authority read in full first:** `PRODUCT.md`, `DESIGN.md`, `.impeccable/surfaces/route-recipe-batch.md` (Operate; sketch 010 wins where they differ: At draw heads Exit consistency and Airiness, D6; its name sits 12 px under the note's underline, D13), `.impeccable/proposals/2026-10-21-log-column-ladder.md` revision 2a (the typography and the spacing scale this proposal spends), the critique of 2026-10-21 and `.planning/canvas-generators/log-inventory.json`. The note for Sid of 2026-10-01 (`.planning/notes/2026-10-01-for-sid-section-rhythm.md`, not promoted) is the same complaint: "we need to work on the rhythm of the sections"; this task touches it in the pen only, and the scope question it ends with (the pen only, or every sectioned surface) stays Mark's.

## Assessment 1: the rendered route (layout.md's seven questions)

- **Reading order (squint).** The reading state survives the squint: the two 44 px head rows, the hairline between Batch and Tasting, the three 14/600 cue words and the three hand lines stand out, and the groups come in order. The pen does not: blurred, the column at 1366 is a stack of equal rows (`.impeccable/layout/pen-filled-1366-log.png`). What survives are the three bold cue words (At draw, From freezer, Every recipe), the two 32 px steps above Next time and Tasting, and the Cancel/Save pair; the churn section's six fields, the tasting's six and the melt pair read as one list.
- **Grouping.** In the pen, proximity works against the groups. A prose field's caption sits 12 px above its own textarea and the next caption sits 6 px under that textarea's underline, so INGREDIENT NOTES reads as a caption of the rule above it. At draw sits 8.8 px under the Ingredient notes underline and 13.7 px over its first field: the cue is nearer the group before it than its own. The axes sit 54 px apart while the seam between the scales and Any problems? is 32: the list is looser than the seams around it. The hairlines (a textarea's underline, the Tasting rule) are doing the gathering that spacing should.
- **Rhythm.** No interval in the pen is drawn; most are arithmetic of a reserve. Every head line in the pen (a field-row caption, a segmented head, an axis head) reserves two caption lines, 28.8 px at 1366 and 44 px at 393, with its text at the foot, so a dead band of 8.8 to 13.8 px (24 to 29 at 393) sits above every label, a different amount per label kind. The measured "about 12" between a segmented control and the next caption is that dead band plus a border, not `--gap-s`. Between fields the interval runs 6, 12, 13.7, 18, 36.6, 47.9 and 53.8 at 1366, set by the component and not by meaning; between groups it runs 8.8, 21 and 32. The tight-and-generous contrast is inverted: items are often further apart than groups.
- **Structure.** The topology is right: region (Batch, Tasting) > group (At draw's two fields; From freezer's scales and Any problems?) > field, as sketch 010 drew it. Only the intervals are unmarked. One structural slip: the axis pitch is 40 in the box (the grid's 20 row gap plus the axis's own 20 top margin), so the stacked grid double-counts the step DESIGN.md names once ("m, 20px, between axes").
- **Density.** Right for a 350 column of transcription at 1366 and for the phone at 393 (the log is 2,279 px tall in the filled pen at 1366 and 2,355 at 393; the pen's two save ceremonies are the answer to that length already).
- **Adaptation.** At 393 the log stacks under the Sheet with a 20 gutter; every value in the table below is the same except where the head reserve is 44 instead of 28.8 (the segmented and axis heads under a coarse pointer below 724), which makes every dead band 15 px larger. The DOM order is the visual order in both widths (the inventory is in document order and its tops are monotonic). Nothing overflows: scrollWidth 1366 and 393.
- **Extremes.** A picked At draw hides 158 px at 1366 and the control does not move (D9, verified: At draw's top is 904.1 in both states). The off state (a mark in the group) draws dashed with its reason flush right on the cue's line, 16.9 px high, no added height. Long notes grow the textarea (`field-sizing: content`). The Melt test / Melt style row wraps in the 350 column (the row is drawn for a wider pen), which puts the melt pair 36.6 px apart, the same accidental interval as any wrapped field row.

## Assessment 2: the mechanical scan

`impeccable detect --json --scope layout app/src/ui/BatchRow.jsx app/src/ui/MarkOneField.jsx app/src/ui/Segmented.jsx app/src/ui/AxisMark.jsx app/src/styles/app.css app/src/styles/notebook.css app/src/styles/tokens.css` → `[]`. Zero findings: every length reads a token and no arbitrary value, overflow or stacking fault exists. The scan cannot see that the tokens are summed in the wrong places (a reserve plus a margin plus a row gap) or that one component's margin and another's gap meet at a seam; that is the whole finding, and it is in the measurements.

## The measured intervals

Visual intervals, text to text or text to box, WebKit, coarse pointer. "1366" is the iPad's width (the log a 350 column beside the Sheet); "393" the phone. Built values are rounded to 0.1; the proposed value is one token from `app/src/styles/tokens.css`.

### The churn section (record pen)

| Interval | Built 1366 | Built 393 | Proposed | Token |
|---|---|---|---|---|
| BATCH region name → CHURN DATE | 30.6 (18 + 12.6 reserve) | 30.6 | 18 | `--app-notebook-log-group-gap` (the head row's own gap, as the ladder keeps it) |
| caption → its field (Churn date, Out of machine, Churn duration) | 6 | 6 | 6 | `--gap-xs` (the Caption Rule) |
| Required → CHURN DURATION (a wrapped field row) | 36.6 (12 label margin + 12 row gap + 12.6 reserve) | 36.6 | 12 | `--gap-s` (the row gap alone) |
| Churn duration field → AT THE MACHINE | 18 (6 + 12 label margin) | 18 | 12 | `--gap-s` |
| AT THE MACHINE → its textarea | 12 (6 label gap + 6 caption margin) | 12 | 6 | `--gap-xs` |
| textarea underline → INGREDIENT NOTES | 6 | 6 | 12 | `--gap-s` |
| INGREDIENT NOTES → its textarea | 12 | 12 | 6 | `--gap-xs` |
| textarea underline → **At draw** | 8.8 (the reserve's dead band; no margin) | 24 | 12 | `--gap-s` (sketch 010 D13: the note's underline is the rule, the name 12 under it) |
| At draw → its two options | 7 | 7 | 12 (keep) · 12 + caption + 6 (the caption option) | `--gap-s`; `--gap-xs` under a caption |
| options → EXIT CONSISTENCY | 13.7 (12.6 reserve + border) | 28.8 | 12 | `--gap-s` |
| Exit consistency cells → AIRINESS | 13.6 | 28.8 | 12 | `--gap-s` |
| Airiness cells → NEXT TIME (tasting absent) | 33 | 33 | 32 | `--gap-l` (Next time is a field of the whole record, outside the group) |
| Airiness cells → the Tasting head row | 32 | 32 | 32 | `--gap-l` (`.mo-end`) |
| TASTING region name → TASTED | about 19 (6 + 12.6 reserve, the h3 baseline-aligned in a 56 px row) | about 19 | 18 | `--app-notebook-log-group-gap` |

### The tasting section (record pen)

| Interval | Built 1366 | Built 393 | Proposed | Token |
|---|---|---|---|---|
| Tempering field → TASTING TEMPERATURE (wrapped row) | 36.6 | 36.6 | 12 | `--gap-s` |
| Tasting temperature field → HOW DID IT TURN OUT? | 12 | 12 | 12 | `--gap-s` |
| eyebrow → its textarea | 6 | 6 | 6 | `--gap-xs` |
| textarea → MELT TEST | 47.9 (12 pad + 20 margin + 12.6 reserve + 3) | 47.9 | 12 | `--gap-s` (see the note on quick 261001-doi) |
| Melt test field → MELT STYLE (the melt row wraps at 350) | 36.6 | 36.6 | 12 | `--gap-s` |
| Melt style cells → NEXT TIME | 33 | 33 | 32 | `--gap-l` |
| Next time underline → **From freezer** | 8.8 | 24 | 12 | `--gap-s` (D13) |
| From freezer → its two options | 7 | 7 | 12 · or 12 + caption + 6 | as At draw |
| options → Every recipe | 21 | 21 | 20 | `--gap-m` (a cue after a control inside its group; the one interval revision 2a does not name, kept as built) |
| Every recipe → HARDNESS | 25.8 (12 + 13.8 reserve) | 25.8 | 12 (plus at most 5 from the 20 px head line) | `--gap-s` |
| axis anchors → the next axis name | 53.8 (20 row gap + 20 axis margin + 13.8 reserve) | 68 | 20 | `--gap-m` (DESIGN.md: 20 between axes) |
| last anchors → ANY PROBLEMS? | 32 | 32 | 32 | `--gap-l` (the stacked grid's gap) |
| ANY PROBLEMS? → Every recipe | 12 | 12 | 12 | `--gap-s` |
| Every recipe → the chips | 6 | 6 | 6 | `--gap-xs` |
| chip row → chip row | 6 | 6 | 6 | `--gap-xs` |
| chips → Cancel / Save batch | 32 | 32 | 32 | `--gap-l` |

### The reading state (pen closed), for the record

Batch head row → OUT OF MACHINE 18; label → value 2; value → the hand 18; hand → hand 4; hand → EXIT CONSISTENCY 16; value → rule 20; rule → Tasting head row 24; head → TEMPERING 12; value → the hand 20; hand → MELT TEST 12; melt → Every recipe 32; cue → HARDNESS 6; value → ANY PROBLEMS? 32; → Every recipe 6; → the hand 6; → NEXT TIME 32; → the hand 6; → rule 32; → RECORDED 12. The same at 393. This is already a ladder (region seam, 32 group seam, 12 and 16 to 20 between items, 6 under a cue, 2 under a cell label) and reads as one; nothing here changes. One mismatch for the record: At draw and From freezer draw as a 12 px caps cell label over their one word in the reading (D14) and as a 14/600 cue in the pen; the reading is right by the ladder's rule (one word under the label) and is left alone.

## The spatial thesis

- **The path.** Transcribe the sheet top to bottom: the churn's name and figures, the two notes, the At draw group, then the tasting's figures, note, melt, Next time, the From freezer group, the save. The reading state is the same path with the pen's values as cells.
- **What belongs together.** A caption with its own control, 6 (the Caption Rule), and nothing else may be nearer to a caption than its control. Fields of one section, 12 apart, whatever component draws them. A cue and the fields it heads: 12 under the cue, 12 between them. Groups and sections apart: 32, or a rule and 12 under it where sketch 010 names the rule as the seam (D13).
- **What leads.** The three cue words lead their groups by face (revision 2a, unchanged here) and now by space; a caption is a tag on its field, close to it and far from the field above.
- **The rhythm.** Four steps and no others in the pen: 6 (caption to control, cue to a list), 12 (between fields, under a cue over a control, under the seam rule), 20 (between axes, a cue after a control), 32 (between groups, above the ceremony). The reserve that added a fifth, sixth and seventh step is removed from the log column.
- **Across widths and pointers.** The same four steps at 393 and 1366. Under a coarse pointer Clear keeps its 44 px target as the overflowing hit area the wide-touch rule already gives it at 1366, at every width in the log, so no head line grows to hold it. The axis stops keep their 44 height and the fields their 44 floor; only the dead bands go.

## The change set (for `/gsd-quick`; tokens only, no new token)

All in `app/src/styles/notebook.css`, in the log skin section, scoped to `.notebook-log` (the pen renders only in the log column now, at every width, so no Sheet-foot rule moves). One optional markup change in `app/src/ui/MarkOneField.jsx` for the caption option.

1. **The reserve goes.** `.notebook-log .field-row .pen-caption { min-height: 0; }` (overrides app.css's two-line reserve, `--sheet-caption-two-lines`, inside the log). `.notebook-log .axis-mark__head, .notebook-log .segmented-field__head { min-height: var(--app-notebook-pen-cue-line-h); align-items: baseline; }` (one 20 px line at every width; overrides app.css's `--sheet-caption-line-h` at 1366 and `--sheet-caption-line-h-touch` under a coarse pointer below 724). Clear's 44 px target under a coarse pointer becomes the overflowing `::after` hit area at every width in the log: lift the mechanism of app.css's wide-touch block (`.segmented-field__head .text-control::after`, lines about 2795–2806) into `.notebook-log` under `(pointer: coarse)` for `.axis-mark__clear` and `.segmented-field__clear`, and keep the button's own box at the 20 px line. The rule at notebook.css about 1690 (`@media (max-width: 723.98px) and (pointer: coarse) .notebook-log .axes-grid__group > .axes-cue`) is retired with the reserve it compensated for.
2. **Between fields, 12.** `.notebook-log .field-row__label { margin-bottom: 0; }` (the row's 12 gap carries it; Required stays inside the label). `.notebook-log .batch-margin__field { margin-top: var(--gap-s); gap: 0; }` (12 above a prose field; 6 from its caption, the caption's own margin). `.notebook-log .batch-margin__field--next-time { margin-top: var(--gap-l); }` stands. `.notebook-log .note-block { padding-bottom: 0; margin-bottom: var(--gap-s); }` (12 from How did it turn out? to Melt test). `.notebook-log .segmented-field + .segmented-field { margin-top: var(--gap-s); }` (12 from At draw's options to Exit consistency, from Exit consistency to Airiness; the `.mo-group` is a `.segmented-field`, so one rule).
3. **The axes, 20.** `.notebook-log .axes-grid__group > .axis-mark { margin-top: 0; }` (the grid's `--gap-m` row gap is the one 20). `.notebook-log .axes-grid__group > .axes-cue { margin-bottom: calc(var(--gap-s) - var(--gap-m)); }` at every width (the base rule stands; the coarse-below-724 variant goes with item 1).
4. **The two seams, 12 under the rule (D13).** `.notebook-log .note-block + .mo-group, .notebook-log .batch-margin__field + .mo-group { margin-top: var(--gap-s); padding-top: 0; border-top: 0; }`. `.notebook-log .mo-group + .axes-grid { margin-top: var(--gap-m); }` stands (20).
5. **Under the cue, 12.** `.notebook-log .mo-group .segmented-field__head { margin-bottom: var(--gap-s); }` (today `--gap-xs`). With the caption option (item 7) the head keeps 12 to the caption and the caption its own 6 to the options.
6. **The Tasting head.** `.notebook-log .tasting-head { margin-bottom: var(--app-notebook-log-group-gap); }` (18, as the Batch head row's gap).
7. **At draw and From freezer: the caption question** (`decide-p10-at-draw-caption`). Mark's comment on P10_LogLadder: "this looks inconsistent with Exit Consistency and Airiness right below." It is: in `MarkOneField.jsx:49` one span carries `pen-caption` and `axes-cue`, so the name renders as the 14/600 cue and the control under it has no 12 px caption, while the two fields it heads each have one. Three ways out; the first is recommended.
   - **caption** (recommended): the cue stays; a caption in the log's caption face (`.pen-caption`, 12 caps secondary) is inserted between the head and the options, so the group reads cue > caption > control, caption > control, caption > control, the same shape revision 2a draws everywhere (three levels, the caption a tag). Markup: in `MarkOneField.jsx`, after `.segmented-field__head`, `<span className="pen-caption segmented-field__caption" id={`${groupName}-why`}>Why blank</span>` and `aria-labelledby={`${captionId} ${groupName}-why`}` on the radiogroup. The word is Mark's to settle; "Why blank" says what the control stores (sketch 010 D6: "the control exists to say why an evaluation is absent"); "Reason" is the shorter alternative. Clear and the off-state reason stay on the cue's line as D9 and D10 draw them. The reading state is unchanged (its cell label already is the caption). Cost: one more label per group; the pen grows 22 px per group.
   - **demote**: At draw and From freezer become captions (drop `axes-cue` from the span), so the pair, Exit consistency and Airiness are three captioned fields of equal rank and the group has no cue; the gather is carried by behaviour (a pick hides the two) and by the 12 under the note's rule alone. Consistent with the reading state's cell label, but it removes a level the ladder names (revision 2a lists At draw and From freezer as L2) and the first thing after the notes stops reading as a heading.
   - **keep**: as built, the cue over an uncaptioned pair; the inconsistency Mark saw stays and is said to be deliberate (the cue doubles as the control's name).
8. **Nothing in `app.css` or `tokens.css` moves**, and the reading state's rules are untouched.

## Against revision 2a

Typography: unchanged by this change set (2026-10-23: the pen's choice-control size is decided apart, in the ladder proposal's revision of 2026-10-23 and `decide-p10-control-text-size-r2`; this change set moves no option width, so the row counts measured there hold on the proposed column too, and both land in one `/gsd-quick`). Revision 2a's faces (region 14/600 caps secondary, cue 14/600 sentence ink on the 20 line, content 14/400, caption 12/600 caps as a tag) are not touched by this change set, and the measurements give no reason to touch them, so there is no revision 2b. Spacing: the change set spends revision 2a's scale (region seam unchanged; group seam `--gap-l`; cue to a list `--gap-xs`; cue to a control `--gap-s`; between items `--gap-s`) with three stated departures:

- **At draw and From freezer sit 12 under a rule, not 32 under the group before them.** Sketch 010 D13 names the note's underline as the group's rule and puts the name 12 under it; the brief says sketch 010 wins. The rule plus 12 is the seam.
- **A cue after a control inside its own group is 20** (From freezer's options → Every recipe), an interval revision 2a does not name, kept as built (`--gap-m`), between the 12 item step and the 32 seam.
- **The note block's 32 becomes 12.** Quick 261001-doi gave the How did it turn out? textarea 32 below it because the Every recipe cue then followed it (Mark's iPad note, 2026-10-01: the cue sat 3 px under the note). Since sketch 010's order the melt pair follows the note, a sibling field; the cue now stands under From freezer with its own seam. If Mark wants the note to stand apart from the figures after it, 20 (`--gap-m`) is the alternative.

## Verification (for the `/gsd-quick` that builds it)

1. Build to a scratch `--outDir` and serve it on an ephemeral port as `10-crit-probe.mjs` does (never 4173, no second Vite on the workspace); then `BASE_URL=http://127.0.0.1:<port> node .planning/phases/10-the-creation-editor-without-save/10-layout-probe.mjs <out dir>` (the probe allows only its BASE host). Read the eight states' intervals in `<out>/layout-measure.json` against the two tables above: every "Proposed" value within 1 px at 1366 and at 393 (the reserve rows must read the same at both widths).
2. Picking At draw or From freezer, and Clear, moves nothing above the control (its top unchanged between `record-blank-1366` and `record-atdraw-picked-1366`); the head line's height does not change when Clear appears (at most the 20 px line).
3. Under a coarse pointer at 393 and 1366, Clear's hit area is at least 44 tall (measure the `::after` box or tap with Playwright's touch at the button's centre ±20 px) while its line box is 20.
4. No caption wraps in a field row at 393, 723, 724 or 1366 (Tasting temperature is the longest).
5. `npm --prefix app test` (the tabindex scan and the battery tests) green.
6. Side by side in a browser, not prose: the pen at 1366 next to the proposed table, the pen at 393 next to it; and Mark on the iPad, which no WebKit run proves (the device check is Mark's).

## Open for Mark

- `look-p10-batch-route-layout`: this proposal (approve the change set, or ask for a change; a board of the pen as built beside the proposal can be drawn on the canvas if a drawing is wanted before GSD).
- `decide-p10-at-draw-caption`: caption, demote, or keep (item 7).
- Standing: `decide-p10-log-ladder-r2`, `decide-p10-ladder-reach` (the ladder's faces; this change set is spacing only and can go first or with them).
