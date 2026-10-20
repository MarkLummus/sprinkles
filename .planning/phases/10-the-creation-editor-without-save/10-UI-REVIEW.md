# Phase 10 UI review

Impeccable audit of the changed surface (project override of the generic 6-pillar audit). Advisory; does not block verify. Source of truth: `.impeccable/critique/2026-10-20T16-43-19Z__app-src-ui-creationpage-jsx.md`.

## Verdict

**Ships, with revisions. 33/40.** One P1 that the sketch itself carries (a settled type role not applied to the log column's group cues), one P2 layout defect new to this route (the page notice hides the band's first caption), one P2 world-rule tension the approved board draws (App field chrome inside the Sheet frame), two P3 notes with no change proposed. Blank stays blank and no colour carries state both pass. Every control is 44 tall at 393 and 744, nothing overflows at any width from 393 to 1366, and the undrawn 724 to 759 range holds.

Method: HEAD 3e5def7e built to a scratch `--outDir` (app/dist and Mark's `vite preview` untouched), served on an ephemeral 127.0.0.1 port by `08-walk-server.mjs`, driven in Playwright WebKit 2359 and Chromium (system Chrome), coarse pointer, at 1366, 393, 744 and the undrawn 724, 740, 759, 760, 1024; a fresh profile per state with the draft written into the `drafts` store as the board engine writes it. Real DOM only (`getBoundingClientRect`, `getComputedStyle`). Board conformance was not redone (plan 10-10: 2660 PASS, 0 FAIL). Chromium agrees with WebKit on every colour, size, weight, radius, height and overflow figure; its only differences are `ch`-sized widths (prose-measure fields 542.1 against WebKit's 598.9) and 1 to 2 px of text metrics. Not verified on the iPad or iPhone.

## Findings, most severe first

### 1. P1 — The log column's group cues are set as captions, not as the Group cue role

- **Where:** `CreationSetup.jsx`, the `<p className="pen-caption mk-cue">` "Every recipe" and "This recipe only" in Scales and Problems, both widths.
- **Measured (WebKit 1366, the same at 393):** the cue is 12px, weight 500, uppercase, 0.48px tracking, secondary rgb(89,89,89), 16.2px line. Around it: the region name "Scales" 12px/600 uppercase secondary; the card head "Scale 1" 12px/600 uppercase secondary; the captions "Name", "Low end", "High end" 12px/600 uppercase secondary; "Kind" 12px/500. Four levels of structure in one voice ("SCALES" y 831.9, "EVERY RECIPE" y 870, the core names y 898.2, "THIS RECIPE ONLY" y 932.7, "SCALE 1" y 975.4). The record pen's own cue, `.notebook-log .axes-cue` (`notebook.css:1457`), renders the same two words at 14px/600, sentence case, App text colour, the 20px line.
- **Violates:** DESIGN.md Typography, the Group cue role (sketch 011 decision 40 C, Mark 2026-10-04; decision 58 B2): "They are headings in a face of their own, so a group never reads as one more item beneath it." It is also the note Mark left for Sid on 2026-10-01 (`.planning/notes/2026-10-01-for-sid-section-rhythm.md`, not promoted), which Phase 9's audit found no longer applied to the pen; this phase brings the defect back on a new surface.
- **Sketch status:** the board draws the caption face too (`p10.py` gives `.mk-cue` only `margin:0`), so this is a sketch defect, not a conformance gap. Mark approved the board as drawn, so he sees the redraw.
- **Fix:** sketch first. Sid gives `.mk-cue` the `axes-cue` face in `.planning/canvas-generators/p10.py`, regenerates, snapshots into `.planning/sketches/013-creation-editor/`, publishes after reading the artifact root. Then `/gsd-fast`: one rule in `app/src/styles/notebook.css` for `.notebook .mk-cue` carrying the same five declarations as `.notebook-log .axes-cue` (meta size, 600, no transform, no tracking, `--app-notebook-pen-cue-line-h`, App text), then re-run `10-board-scales.mjs` and `10-board-editor.mjs` side by side.

### 2. P2 — The page notice hides the band's first caption

- **Where:** `PageNotice.jsx` on `/notebook/new` (Draft kept on Resume; the Import refusal on every Shell route), every width.
- **Measured (WebKit 1366):** `.page-status` "Draft kept. Cancel discards it." at x 48, y 63, 301.2 × 30; the caption "Recipe name" at x 32, y 77, 598.9 × 15, wholly under it, so the band's first field reads "RE" for the five seconds the notice stands. "Cancel the new recipe draft before importing." lands in the same box. At 393 and 744 the same (screenshots). On the recipe route the same anchor (y 57, height 0) clips the lead name; here it covers a whole caption.
- **Violates:** the Caption-and-Helper Rule's premise (a caption labels its input) and the spirit of the page-notice rule ("out of flow so nothing moves" was never "over the first label"). The board draws no notice.
- **Fix:** Mark decides between (a) 30px of top room in the creation band and the Notebook head for the notice line, sketch first in `p10.py`, then `/gsd-quick` in `notebook.css` and `shell.css`; (b) the notice on these two routes at the right of the bar, level with Import, where nothing is under it (`/gsd-quick`, `shell.css`); (c) leave it, since it clears itself. Recommended: (b), nothing moves and nothing is hidden.

### 3. P2 — The picker carries App field chrome inside the Sheet frame

- **Where:** `IngredientPicker.jsx`, both widths.
- **Measured (WebKit 1366):** the picker box is the Sheet's (1px solid ink, 0 radius, no fill, 528 × 508), its rows ink on hairline dividers, "Add" an ink underline; but Name (502 × 44) and Category (120 × 44) carry a 10px radius, a white fill and a divider-grey border rgb(214,218,215), and Clear filters is the App link (14px/600 rgb(20,117,221), underlined, 78.6 × 44). The grams fields four rows up are the binder: 1px ink, 0 radius, no fill, pen blue rgb(31,61,122).
- **Violates:** DESIGN.md Components, the binder ("square, 1px ink border, no fill at rest"; "the Sheet keeps its binder") and the two-contexts rule (App chrome on paper).
- **Sketch status:** the board draws it this way (the Ingredients place's `.ing__field` reused inside `.pick`) and Mark approved it; recorded for his call, not a conformance gap.
- **Fix, if Mark wants the Sheet's own field here:** sketch first in `p10.py` (`.pick .ink-field` and the select take the binder; Clear filters the Sheet's text control), regenerate, snapshot, publish; then `/gsd-fast` in `notebook.css`.

### 4. P3 — An unparsable amount counts 0 g without a word on the figures (note, no change proposed)

On blur the row is marked (1px ink outline, weight 700) and says "Sucrose's amount is not a number" (12px, bold by the marked row's cascade, as the pen's blocked row does) while the Balance and Total recompute at 0 g: Total 1035.0 g to 885.0 g, PAC 19.6 to 5.9, POD 15.4 to 1.0 ("13.0 below 14"), the share "trace". D-08 chose the zero fallback and the standing is stated in words. If Mark wants the figures to say an amount is not counted, that is a wording decision for him.

### 5. P3 — Two link voices on one page, by context (note, no change proposed)

Sheet text controls (Add note 54.7 × 44, Add ingredient 88.8 × 44, remove 44.7 × 44, the picker's Cancel 41.6 × 44) are 13px/400 ink with the hairline underline; log text controls (Add scale 65.9 × 44, Add problem 86.5 × 44, remove 50 × 44, Clear 35.6 × 44) are 14px/600 blue companion underlined, as the batch log's own. Both on the approved boards; the same split Phase 9's audit recorded.

## What passed (measured)

- Blank stays blank: arrival draws the name alone in the headnote (no `.headnote__prose`), no notes, "This version has no ingredient rows.", no `.side-region`; Style reads "No style" with the temperature and all twelve band fields empty; "This recipe only" absent until a card exists; a just-added scale shows "Required" under Name, Low end and High end with no Kind cell filled; Clear on Philadelphia empties the temperature and leaves the bands (14–18, 10–18, 8–12, 36–42); "no target set" where none is. A blank name reads "Untitled" (D-08c) with "draft" as its meta.
- No colour carries state: the same-name line and "Enter a recipe name." are ink 12px/400; the invalid row carries words and `aria-invalid`; "Added" is a word plus `aria-disabled`; the picked Kind cell is the App's filled segment (rgb(20,117,221) under white) plus a checked radio, the pen's own treatment.
- Faces and inks: Georgia for the headnote (32px/700) and the description (16px); grotesk with `tabular-nums` on every field, cell and figure; bookcloth rgb(51,81,59) only on the Sheet's region names; the Before you start notes typed in the prose-field role (Georgia 16px, pen blue, 44 tall); no field in the hand.
- Touch floor at 393 and 744: every button, input, select, textarea, link and Kind cell on both routes is 44 or more (the only sub-44 hits are the Shell's brand link at 25.9 and the hidden radio inputs at 42 inside 44 labels, both outside this phase); fields read 16px; picker rows 48 tall.
- Overflow: `scrollWidth` equals `innerWidth` at 393, 724, 740, 744, 759, 760, 1024 and 1366 on `/notebook` with the entry open and on `/notebook/new` worked, with the picker open too.
- The undrawn 724 to 759: the band's two forms side by side (355 to 374.7 and 273 to 288.3 wide), the Sheet and the log stack (log at y 1284 under a 971px Sheet column), the picker 564 to 599 wide; nothing collapses. At 1024 the log still stacks (y 1763), as the ladder says.
- Focus: `:focus-visible` true with the 2px ink ring at 2px offset on Add note, Add ingredient, the Style menu, a Kind radio (its label draws it), Cancel, a grams field and a row's remove; the picker opens with focus in Name; a pick closes it and lands the row last at 0 g with its grams field empty, focused, ringed; Add scale focuses the new card's Name; at two scales Add scale is gone, the cards' radios carry distinct names and no Clear.
- Controls as drawn: New recipe 117.6 × 44 filled; Name 598.9 × 44; Cancel 88.3 then Start 75.7 × 44; Resume 96 × 44; Style menu 350 × 44; temperature 84 × 44 with "°C" beside; band fields 56 × 44 joined by "–"; Kind cells 131.3 and 87.8 × 44; the stops line "thin · leaning thin · right · leaning rich · rich" 14px secondary.
- Words: plain throughout; the Import refusal reads "Cancel the new recipe draft before importing."

## Asides (not Phase 10 findings)

- `.page-status` measures a 1px solid ink border in both engines where DESIGN.md says 1.5px; the rule is the recipe route's and predates this phase.
- Note for Sid `2026-10-01-for-sid-section-rhythm.md` (not promoted): finding 1 is its subject on a new surface; the pen itself is already right. Mark's call whether the note closes with finding 1 or stays open for the Sheet and the folds.

## For Mark

Nothing was written to Mark's List by this audit. Rows for Sarge to add if he agrees:

1. **look** — After Sid redraws the group cue (finding 1): `P10_Scales` beside the built log column at 1366 and 393.
2. **decide** — Where the page notice sits on `/notebook` and `/notebook/new` (finding 2): (a) top room in the band and head; (b) at the right of the bar beside Import, recommended; (c) leave it.
3. **decide** — The picker's filters (finding 3): (a) the Sheet's binder for Name, Category and Clear filters; (b) as drawn and built, the App's field inside the paper frame.
