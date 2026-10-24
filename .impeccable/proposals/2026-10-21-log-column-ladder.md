# The log column's ladder (2026-10-21)

⚠️ DEGRADED: single-context (no sub-agent tool is exposed to this agent). `/impeccable typeset` and `/impeccable layout` were run as assessments only, by their references, on the log column as one surface across its grouped states; neither edited `app/` (Impeccable describes, GSD edits). Their mechanical scans (`impeccable detect --scope type` and `--scope layout` over `CreationSetup.jsx`, `BatchRow.jsx`, `AxisMark.jsx`, `Segmented.jsx`, `notebook.css`, `app.css`): 0 findings each. A clean scan is a floor: the defect is which role each label reads, which no detector sees.

Target: `aside.notebook-log` on the built app (HEAD 6ee9051b; `app/` unchanged since 61d2fe9c), scratch build served on an ephemeral port, WebKit 1366 × 744, coarse pointer. States measured by `.planning/phases/10-the-creation-editor-without-save/10-log-inventory.mjs` (every labelled element in the log with face and gap; `.planning/canvas-generators/log-inventory.json`; the log markup in `log-capture.json`): the creation editor (`/notebook/new`, a draft with two rows, Philadelphia, one scale, one problem); Olive Oil v1 reading (the batch margin with a tasted batch); the same with the version pen open (the log is unchanged by it); the record pen (Record another); the tasting pen (Add tasting); Mexican Chocolate v3 reading (an untasted batch). History is in the band, not the log, and is out of scope.

## Inventory: the ladder as built

| Surface | Region name | Group cue | Item / card head | Field or cell caption | Gaps |
|---|---|---|---|---|---|
| Creation editor (Style, Scales, Problems) | 12/600 caps 0.96px secondary, 16.2 line | "Every recipe", "This recipe only": 12/500 caps 0.48px secondary (`.pen-caption.mk-cue`); "Targets": 12/600 caps secondary (`.notebook-caption`) | core names 15/400 ink 22.5 line; "Scale 1", "Problem 1": 12/600 caps secondary | 12/600 caps 0.96px secondary (`.notebook-caption`); Kind: 12/500 caps 0.48px (`.pen-caption`) | head→cue 18; cue→core 12; core→cue 12; cue→card 12; card rows 12; stops→add 30; region seam 20 + rule + 20 |
| Batch margin, reading (Olive Oil v1) | 12/600 caps secondary | "Every recipe", "This recipe only": 14/600 sentence ink, 20 line (`h4.batch-row__group-label--cue`); "Any problems?": 12/600 caps secondary (`h4`) | cell value 20/600 ink | cell labels 12/600 caps 0.96px secondary | cue→cell 6; group seam 32; "Next time" (h3, 12/600 caps) 32 above, 7 below |
| Batch margin, reading (Mexican Chocolate v3) | same | none (untasted) | | same | cells 16/12; "Next time" 32 above |
| Version pen open | the log is the reading state above, unchanged | | | | |
| Record pen (churn) | 12/600 caps secondary | "At draw": 14/600 sentence ink 20 line (`.axes-cue`) | | 12/500 caps 0.48px secondary (`.pen-caption`), 14.4 line in the field rows | head→fields 18; caption→control 4 to 6; note blocks 6; At draw group 32 seams |
| Tasting pen (axes group) | "Tasting" 12/600 caps secondary (h3.region-name) | "From freezer", "Every recipe", "This recipe only": 14/600 sentence ink 20 line; "Any problems?": 12/500 caps secondary (`.defects-head .pen-caption`) | axis names 12/500 caps 0.48px **ink** (`.axis-mark__name`) | 12/500 caps 0.48px secondary | cue→first axis 21; axes 40 apart; group seam 32 (45 above a cue); Any problems?→chips 38 (12 + 6 under the cue); chips 6 under "Every recipe" |

What a user sees: five text levels (region, cue, item head, caption, value) in two faces that differ by a weight step and 0.04 em of tracking, plus the one cue the pen got from decision 40 C; the same word ("Out of machine", "Sweetness") in the pen's 12/500 and the reading's 12/600. In the creation editor every gap is 12.

## Typeset assessment (by reference/typeset.md)

- Authority and fit: the grotesk (`--face-grotesk`) with tabular numerals and the hand (Caveat) are authoritative (DESIGN.md); no family is unnecessary. Roles established in `tokens.css`: `--app-size-label` 12, `--app-size-meta` 14, `--app-notebook-size-body` 15, `--sheet-size-ink-field` 16, the hand 22; `--app-notebook-pen-cue-line-h` 20.
- Hierarchy: heading, label and metadata roles cannot be told apart at a glance inside the log: region name, caption and (in the creation editor) the group cue share 12 px caps secondary. Two caption classes (`.pen-caption` 500/0.04em, `.notebook-caption` 600/0.08em) carry no meaning.
- Scale and consistency: a deliberate ramp exists (12/14/15/16/20/22) but the roles are not mapped to it: the group cue is 12 in the creation editor and 14 in the pen; the item line under a cue is 15 (body) in the creation editor and 12 caps (axis name) in the pen.
- Reading: no prose in the log beyond the hand and helper lines; measure not at issue at 350 wide.
- Stress: long core lines wrap (Problems' four names take two lines at 15; at 14 on a 20 px line they still wrap, fine); zoom and fallback unaffected.
- Delivery: system grotesk, no web font to load for the log except the hand.

## Layout assessment (by reference/layout.md)

- Reading order (squint): the region heads and the hairlines survive the squint; the groups do not, except in the pen's axes grid where 32 px seams exist. In the creation editor the squint shows a stack of equal rows.
- Grouping: proximity is not doing the work; cards lean on their top rule, groups on nothing.
- Rhythm: one value (12) repeated in the creation editor; the pen and the reading state have the deliberate 32 / 6 cadence (decision 40 C) and read better for it.
- Structure: region > group > card > field is the right topology; it is only unmarked.
- Density: right for an authoring column at 1366.
- Adaptation: at 393 the log stacks under the Sheet (sketch 013); the ladder is width-independent.
- Extremes: two cards per group at most (decision 26); nothing overflows (1366 scrollWidth 1366).

## The proposal: one ladder, one scale, one rule

**Four levels.**
- L1 Region name: grotesk 12/600 caps, `--app-tracking-label`, `--app-text-secondary`, in the 44 px head row (`.region-name` in the log, unchanged; DESIGN.md Region name; sketch 011 decision 34).
- L2 Group cue: grotesk `--app-size-meta` (14)/600, sentence case, no tracking, `--app-text`, `--app-notebook-pen-cue-line-h` (20): sketch 011 decision 40 C, kept. Every label that stands over two or more things of one kind: Every recipe, This recipe only, At draw, From freezer, Any problems?, Targets.
- L3 Item: a line of content under a cue (the core names): grotesk 14/400 sentence `--app-text` on the 20 px line. Controls and fields keep their own faces (axis names stay the 12/500 caps ink of the axis mark; chips 13; fields 16; cell values 20/600; the hand 22).
- L4 Caption: one caption face in the log, the App's `.notebook-caption`: 12/600 caps, `--app-tracking-label`, `--app-text-secondary`, over one field, value or control (Name, Kind, Churn date, Out of machine, Next time, Serving temperature). `.pen-caption` in the log takes the same weight and tracking.

**The rule.** Count what stands under the label: two or more of one kind, a cue (L2); one field, value or control, a caption (L4); a line of content, an item (L3); a region, its name (L1). Actions (14/600 `--app-blue-text`) and the hand are not levels.

**The spacing scale.** Region seam `--gap-m` + rule + `--gap-m` (unchanged). Group seam `--gap-l` (32) above a cue that follows a group. Cue to a one-line list or chips `--gap-xs` (6); cue to a card or a control `--gap-s` (12). Between items `--gap-s`. A card: a rule, `--gap-s` inside. The first cue after a region head keeps the head row's own 18.

**No new token.** Every value above is in `tokens.css`.

## What it changes on each surface, and what it leaves alone

- Creation editor, Scales and Problems: cues to L2 (decision 25 on the canvas, not built); 32 above "This recipe only", 6 under a cue over the core names, 12 under a cue over a card; core names to L3; the card head dropped and remove beside Name (`decide-p10-card-head`); Kind's caption joins L4. Reopens sketch 013's card as approved, and decision 25's drawing (the face stands).
- Creation editor, Style: "Targets" to L2 (it heads six band rows). Serving temperature stays L4. Nothing moves.
- Record pen and tasting pen: captions take L4's weight and tracking (nothing moves); "Any problems?" to L2 (`decide-p10-any-problems-level`; reopens Mark's 2026-10-06 note, decision 58); the axes group, At draw and From freezer kept as decision 40 C built them; axis names left alone.
- Batch margin, reading state: already on the ladder except "Any problems?" (the same row); Next time stays a caption (it heads one line); cell labels are L4 already. Left alone otherwise.
- Version pen: the log is the reading state; nothing to change.
- Out of scope: History (in the band), the Sheet's regions (bookcloth), the band's captions.

## Which fixes it

Neither the rhythm board's A nor B alone: A spaces the creation editor, B also sizes its core line, and both start from decision 25's cue face, which the build lacks. The ladder is B plus the rule that makes the same words read the same on every surface (one caption face, Any problems? as a cue, Targets as a cue) and the card head call. Rows: `decide-p10-log-ladder` (supersedes `decide-p10-log-rhythm`), `decide-p10-any-problems-level`, `decide-p10-card-head`, `decide-p10-ladder-reach`; the board is `P10_LogLadder` (`look-p10-log-ladder-board`).

## After Mark answers

Sid redraws P10_Scales and P10_Editor (and the record pen boards only if the reach is every surface), updates the 013 snapshot and DESIGN.md's Typography (the ladder as named rules); then GSD: `/gsd-quick` for `notebook.css` (the cue rule, the gaps, the core line, the caption face) and `CreationSetup.jsx` (the card head), `/gsd-fast` for the `defects-head` and reading `h4` cue rules.

## Revision 2 (2026-10-21, later the same day)

**Rejected.** Mark, on P10_LogLadder's batch margin row: "sorry, I think this is horrible. strong(4) looks bigger and bolder than its parents; This recipe only looks smallest. same with Bitter - bigger than Any problems?, a different color, and a different typeface." And: "looks completely random." (His screenshot was gone from the temporary folder by the time it was read.) He is right: revision 1 left the values alone ("controls keep their faces"), so under a 14/600 cue the reading cell's 20/600 mark word and the 22 px hand were the largest and boldest things in their group, the region name (12 caps) sat below its own cues, and the two labels under Any problems? were cues like their parent. The hierarchy was inverted at both ends.

**The test now:** a reader with no key must see the levels from the type alone. The ladder is a sequence that never grows in size or weight going down a level.

| Level | Face | Where |
|---|---|---|
| L1 Region name | grotesk `--app-size-meta` 14 / 600, caps, `--app-tracking-label`, `--app-text-secondary`, in the 44 px head row | Batch, Tasting, Style, Scales, Problems. Up from 12: reopens the log's region-name size (sketch 011; DESIGN.md Region name stays 12 elsewhere in the App, so this is a log-only step, or the App's region names move with it: a question for the DESIGN.md write-up) |
| L2 Group cue | grotesk 14 / 600, sentence, no tracking, `--app-text`, `--app-notebook-pen-cue-line-h` 20 | the first-level label over two or more things of one kind: Every recipe, This recipe only (at the first level), At draw, From freezer, Any problems?, Targets. Decision 40 C, kept |
| L3 Caption | grotesk `--app-size-label` 12 / 600, caps, `--app-tracking-label`, `--app-text-secondary` | a tag over one field, value or control (Name, Kind, Churn date, Sweetness, Oil, Next time), and any label nested under a cue (Every recipe and This recipe only inside Any problems?). One face: `.pen-caption` in the log takes 600 and the tracking; the axis names join it (reopens sketch 007's ink axis name) |
| L4 Content | grotesk 14 / 400, sentence, `--app-text`, the 20 px line, tabular numerals | words, lists and figures under a cue or a caption: the core names, "more (4)", "strong (4)", "−6 °C", "30 min" (down from 20/600, `--app-notebook-log-value-size`, sketch 011's log value: `decide-p10-log-figure-face`); absent values stay 14/400 secondary |
| the hand | Caveat, `--sheet-pen-blue`, at `--size-hand-min` 20 (its legibility floor), weight 400 | the maker's own words (Mark, 2026-09-21: face and colour kept); under its cue by weight and face, never by size, so the cue above it must be 14/600 ink |
| controls | chips 13/400 ink; fields 16/400 in their boxes; the segmented cells 13/400 — **amended 2026-10-23:** the segmented option words and the axis stop digits both 14/400 `--app-size-meta` (the pen's choice controls at one size, the content size; see the 2026-10-23 revision below and `decide-p10-control-text-size-r2`) | the touch floor rule, not levels |

Checked against the sequence on every row of the board (re-measured, `p-ladder-measure.json`): creation Scales 14 caps > 14/600 cue > 14/400 core names, 12 caption > 16 field (a control); the pen's declared axes 14/600 cue > 12/600 caption (axis name) > the stops control; Any problems? 14/600 > 12/600 captions > 13/400 chips; the batch margin 14/600 cue > 12/600 caption > 14/400 value; Any problems? 14/600 > 12/600 This recipe only > the hand 20/400; the churn fields 14 caps region > 12/600 caption > 16 field. The one place size still rises going down is caption (12) to content (14) and caption to field (16): the caption is a tag on its content, lighter in colour and smaller than both, and the content is never bolder than the caption nor bigger than the cue. No surface breaks the sequence, so no surface was patched on its own.

**What changed from revision 1:** the region name up to 14 caps; every reading cell value down to 14/400 (mark words and figures); the hand down to its 20 px floor in the log; the labels nested under Any problems? become captions; the axis names join the caption face. Spacing unchanged from revision 1. The caption over a value under a cue stays (OIL over strong): it names the axis; cue + value alone would not say which.

**What each surface reads, top to bottom:**
- Creation editor, Scales: SCALES 14 caps · Every recipe 14/600 · Hardness, Scoopability, Smoothness, Sweetness 14/400 · This recipe only 14/600 · NAME 12 caps · Creaminess (field 16) · LOW END / HIGH END 12 caps · fields · KIND 12 caps · cells 13 · stops 14/400 secondary · Add scale 14/600 blue. Gaps 18, 6, 32, 12, 12, 12, 12, 12, 30.
- Record pen, axes: From freezer 14/600 · cells · Every recipe 14/600 · HARDNESS 12 caps · stops · … · This recipe only 14/600 · BODY, OIL 12 caps · stops · Any problems? 14/600 · EVERY RECIPE 12 caps · chips 13 · THIS RECIPE ONLY 12 caps · chip.
- Batch margin, reading: BATCH 14 caps · OUT OF MACHINE 12 caps · −6 °C 14/400 · the hand 20 · Every recipe 14/600 · SWEETNESS 12 caps · more (4) 14/400 · This recipe only 14/600 · OIL 12 caps · strong (4) 14/400 · Any problems? 14/600 · THIS RECIPE ONLY 12 caps · Bitter (hand 20) · NEXT TIME 12 caps · nothing written yet 14/400 secondary. Gaps 6 / 32 / 6 / 32 / 6 / 7 / 33 / 7 as built.
- Record pen, churn fields: BATCH 14 caps · CHURN DATE, OUT OF MACHINE 12 caps · fields 16 · AT THE MACHINE, INGREDIENT NOTES 12 caps · At draw 14/600 · cells 13 · EXIT CONSISTENCY, AIRINESS 12 caps · cells.

**Rows:** `decide-p10-log-ladder-r2` (as built / revised, recommended / revised with h3 cues), `decide-p10-any-problems-level-r2` (cue over captions, recommended / two cues as revision 1 / caption as 2026-10-06), `decide-p10-log-figure-face` (figures at 14/400, recommended / keep 20/600); `decide-p10-card-head` and `decide-p10-ladder-reach` stand unchanged; `decide-p10-log-ladder` and `decide-p10-any-problems-level` are for /marks-list to close as superseded. Board `P10_LogLadder` redrawn (only changed values in the accent).

## Revision 2a (2026-10-21, two comments on P10_LogLadder)

**Mark, on "Bitter" in the batch margin row:** "I never understood why we show this in ink color. I thought that the ink color was reserved for hand-written content, not selected options." (The automatic reply on that thread, that Bitter is ink because it is the chosen value, is wrong on the facts.)

He is right by his own 2026-09-21 approval. The slip is written down in two places: DESIGN.md's Hand role ("the maker's own saved words in the App: a tasting's note **and problems**", built in Phase 03.4) and sketch 011 decision 58 (2026-10-05/06, the reading's tasting groups: the picked problems "each in the hand as one line, as the pen's chips split"). Both are reopened. The rule now: a selected option shown in the reading state is content (L3, 14/400 grotesk, app text); only typed words take the hand. A problem the recipe declared (This recipe only, Bitter) is a label the maker wrote once when creating the recipe and picks per batch: content, not own words. The rest of the inventory has no other picked option in the hand (marked stops read as grotesk cell values; the style is a menu; Kind a segmented control). Surface affected: the batch margin's reading state only. Row `decide-p10-picked-option-face` (content, recommended / hand as built). Rule in the generator: `.notebook-log .tasting-reading__problems{font-family:var(--face-grotesk);font-size:var(--app-size-meta);font-weight:400;line-height:var(--app-notebook-pen-cue-line-h);color:var(--app-text)}`; measured on the proposed column: 14/400 grotesk rgb(20,20,20), was Caveat 22/400 rgb(31,61,122).

**Mark, on the key's "Cell value grotesk 14/400":** "cell value is larger than caption above it. is that ok according to new ladder?"

Settled, and said on the key in one sentence: the caption is a tag, not a level. It is smaller (12) and in the secondary colour by design so what it labels reads first, and the sequence that never grows going down applies to region (14/600 caps secondary) > cue (14/600 sentence ink) > content (14/400 ink). A caption over a value (SWEETNESS over more (4), row 3) is the same convention as a caption over a field (CHURN DATE over its 16 px box, row 4), both on the board, and every field in the app already works this way (Recipe name, Version name, Churn date). The other way, the caption in the sequence, means every value and figure drops to 12 (the batch margin's figures become the smallest text in the column) or every caption rises to 14/600 caps, the region name's exact face, which brings the same-face fault back on every field in the pen and the creation editor. Measured today: captions are 12/600 or 12/500 caps over 16 px fields in the pen and the creation editor, so the tag reading changes nothing there. Row `decide-p10-caption-level` (tag, recommended / in the sequence). The ladder is now stated as three levels and one tag; the key, the title and the rule on the board say so.

## Revision 2026-10-23: the pen's choice controls at one size (decide-p10-control-text-size, held by Mark; r2 follows the board)

The 2026-10-22 critique (P2) found the pen's choice controls at four sizes: option words 13 (`--sheet-type-control`), stop digits 15 (inherited from `body`'s `--sheet-size-table-body`), fields 16, cue 14/600. Mark answered "both at 15"; the quick planner measured (plan 261023-u23, fcdf61c8) that 15 wraps Exit consistency and Melt style onto two rows in the 350 px pen, and Mark held it for a board. The board is the control-size row of P10_PenRhythm (canvas page Log column rhythm), four candidates at 1366 coarse, 1366 fine and 393 coarse, measured on the board in WebKit and in the real app on a scratch build (`.planning/canvas-generators/p-pen-rhythm-size-probe.mjs`, `p-pen-rhythm-size-probe.json`; screenshots `p-pen-rhythm-shots/`). The options' widths below are summed with the shared hairlines overlapping (the plan's 360 is 357.8 here); the column is 350 at 1366 and 353 at 393.

| Candidate | Rule (pen only, `.notebook-log .batch-margin--pen`) | Exit consistency | Melt style | Rows at 1366 / 393 | Pen height 1366 coarse / fine / 393 |
|---|---|---|---|---|---|
| as built | none (13 / 15) | 322.1 | 315.9 | every control 1 / 1 | 2174 / 1869 / 2299 |
| both 15 | `font-size: var(--sheet-size-table-body)` on `.segmented__option` and `.axis-mark__stop` | 357.8 (7.8 over) | 350.8 (0.8 over at 1366) | Exit consistency 2, Melt style 2 at 1366; Exit consistency 2 at 393 | 2274 (+100) / 1945 (+76) / 2349 (+50) |
| both 14 | `font-size: var(--app-size-meta)` on both | 340.1 (9.9 spare) | 333.6 | every control 1 / 1 | 2174 / 1869 / 2299 |
| 15, pad 6 | both 15 and `--sheet-seg-pad-x: var(--gap-xs)` on the pen | 345.8 (4.2 spare) | 338.8 | every control 1 / 1 | 2174 / 1869 / 2299 |

The stops keep 44 × 44 and the options their 44 (coarse) and 32 (fine) boxes in every candidate; fields stay 16 (coarse) / 15 (fine) and the cues 14/600. On the proposed column (the change set of 2026-10-22 applied) the rows are the same: the change set moves no option width.

**Recommendation: both 14, `--app-size-meta`.** It is the one size that fits every control on one row at every width with room to spare (9.9 px at 1366, 12.9 at 393), it is the App's own content size rather than a Sheet table token reaching the log through `body`, and it keeps the ladder's order inside a choice: cue 14/600 over option words and stop digits 14/400, the way a cue sits over content everywhere else in the log; the stop digits give up 1 px, the option words gain 1. Fifteen is Mark's answer and it costs two wrapped controls and 50 to 100 px of pen; fifteen with the side padding at 6 fits, but it re-points a shared token (`--sheet-seg-pad-x`, 8 on the Sheet) in one place, a named exception the house rule asks us to avoid, and leaves 4.2 px of spare for Exit consistency, so a longer option word later wraps it again. The ladder's controls line is amended above; the batch-route change set of 2026-10-22 is unchanged by this (it moves no option width) and the two land in one `/gsd-quick` when Mark answers `decide-p10-control-text-size-r2`. Rule for the quick, once decided: `.notebook-log .batch-margin--pen .axis-mark__stop, .notebook-log .batch-margin--pen .segmented__option { font-size: var(--app-size-meta); }` in `notebook.css`'s log skin section; the creation editor's Kind control (outside the pen) stays 13, as the plan scoped it.

## Mark's answers (2026-10-22 and 2026-10-23, on Mark's List)

- `decide-p10-caption-level`: **a tag outside the sequence** (12/600 caps secondary over its value or field; the sequence region > cue > content, revision 2a as drawn).
- `decide-p10-log-figure-face`: **figures as content**, 14/400 like every other cell value (revision 2).
- `decide-p10-ladder-reach`: **every grouped surface in the log**: the creation editor, the record and tasting pens, the batch margin's reading state.

Still open before anything is built: `decide-p10-log-ladder-r2` (the ladder itself), `decide-p10-any-problems-level-r2`, `decide-p10-picked-option-face`, `decide-p10-card-head`. Then the "After Mark answers" step above: Sid redraws, then `/gsd-quick`.
