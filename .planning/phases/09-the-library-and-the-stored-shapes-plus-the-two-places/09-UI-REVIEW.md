# Phase 9 UI review

Impeccable audit of the changed surface (project override of the generic 6-pillar audit). Advisory; does not block verify. Source of truth: `.impeccable/critique/2026-10-19T03-05-31Z__app-src-ui-ingredientsplace-jsx.md`.

## Verdict

**Ships, with revisions. 34/40.** One P1 layout defect that the sketch itself carries (so it goes back to the board before the app), two P2 wording revisions, two P3 notes with no change proposed. Blank stays blank and no colour carries state both pass. The record pen reads as before the phase.

Method: HEAD a1024fb9 served by `npm --prefix app run dev`, driven in Playwright WebKit 2359 and Chromium (system Chrome), coarse pointer, 1366 and 393, fresh profile per width (8 recipes, 111 entries), every linked route visited first. Real DOM only (`getBoundingClientRect`, `getComputedStyle`). Conformance to sketch 012 was not redone (plans 09-16, 09-17). Not verified on the iPad or iPhone.

## Findings, most severe first

### 1. P1 — Below the 760 cut, a long source is drawn in the same box as its basis

- **Where:** `/ingredients`, any open entry, width below 760 (the table-reads-as-list cut). Seen at 393 on Heavy cream's Fat row.
- **Measured (WebKit 393):** basis cell `derived` x 48, width **0**, height 34; source cell `panel reconciled three ways…` x 68, width 305, right-aligned, two lines. Rendered text: "derivedpanel reconciled three ways against a 36% regulatory floor". Chromium: basis width 0, source 305, the same. A short source behaves (Milk solids row: basis 221.8 wide, source 83.2, side by side).
- **Violates:** sketch 012's rule for the cut ("the figures table reads as a list, figure and amount then basis and source, as the ingredient table does below 724"). Two recorded values must stay two values. The board draws the same, so this is a sketch defect, not a conformance gap (plan 09-16 named it; `check-p9-places-and-reset-on-ipad` tells Mark to report it only if it looks wrong).
- **Fix:** sketch first. Sid redraws the list cut in `.planning/canvas-generators/places.py` (source on its own line under the basis, left-aligned, both in the same role), regenerates, snapshots into `.planning/sketches/012-places/`, publishes after reading the artifact root. Then `/gsd-quick`: the `app.css` list-cut rules for `.ing__figures` to match the redrawn board, verified side by side in WebKit at 393.

### 2. P2 — The boot line for the `problems` table reads as English, and names no way out

- **Where:** `main.jsx` via `bootDamagedLine` (`app/src/store/seedTables.js`), reached by damaging a row in the `problems` store.
- **Measured:** "Sprinkles can’t open: its list of problems has a damaged entry." rendered as `.app-boot`, 14px, secondary text, full width at 1366 — the same shape as its two siblings, which is right. The word is the problem: for this one table it reads "Sprinkles has a list of problems". The other four words (ingredients, machines, ice cream styles, scales) read as intended. The siblings each name a next step ("Close other Sprinkles tabs to finish updating.", "Try reloading."); this one does not.
- **Violates:** D-11 familiar words; the plain-words house rule.
- **Fix:** `/gsd-fast` on `SEED_TABLES.problems.word` (and, if Mark wants, a second sentence in `bootDamagedLine`) once he picks the word. See For Mark.

### 3. P2 — The facts line mixes three grammars

- **Where:** `IngredientsPlace.jsx` `factsText`, every open entry with facts.
- **Measured:** Heavy cream: "Density 0.994 g/ml · Heat treatment: ultra-pasteurised"; Sucrose: "Density 0.85 g/ml · Packed state: granulated, loose"; Locust bean gum: "Hydrates at commonly cited 80–85 °C, varies by grade" (the source's prose replaces the number wholesale whenever a source exists, so the temperature is never shown as a figure). 14px secondary text at both widths.
- **Violates:** the short-label, plain-words house rule; one voice per line.
- **Overlap:** the Packed state line is already on `look-p9-new-lines`; do not re-ask that. New here: the colon inconsistency and the hydration substitution.
- **Fix:** `/gsd-fast` on `factsText` once Mark picks the shape. See For Mark.

### 4. P3 — Basis and Source change type role across the cut (note, no change proposed)

15px app text at 1366; 14px secondary text at 393; Amount stays 15px app text at both. DESIGN.md allows provenance either role and the board draws it this way.

### 5. P3 — Two link treatments on one page (note, no change proposed)

Clear filters: blue companion rgb(20,117,221), weight 600, underlined, 78.6 by 44. Show / Hide in the row head: app text, weight 400, underlined, 14px. Both on the approved board; DESIGN.md gives the Notebook frame's controls the companion and keeps the global ink link rule.

## What passed (measured)

- Blank stays blank: Milk Chocolate opens with six figure rows and no facts, lactose or Note line; Locust bean gum with one row and one fact; "not recorded" only where a held figure lacks a source; no dash or "none" anywhere.
- No colour carries state: "not recorded" is secondary grey beside ink sources at 1366, but the word carries it and at 393 both are grey; Show / Hide is text plus `aria-expanded`; chips are `aria-pressed` with the square mark.
- Links and focus: Notebook name link ink, hairline underline, 44 tall; visited identical to unvisited; focus ring 2px solid ink, 2px offset, `:focus-visible` true on the link and the row head.
- Touch floor: name link, Name field, Category select, row head, Clear filters and chips all 44 tall; Name field 598.9 wide, select 120 at 1366.
- No horizontal overflow at 1366 or 393 on either place.
- Marks: rail 8 wide, 4px radius, Notebook rgb(253,91,87) and Ingredients rgb(56,139,87); current nav word rgb(223,7,2) (the on-subtle companion).
- Counts in words: "8 recipes"; "111 ingredients"; "17 of 111 ingredients" for milk; "15 of 111 ingredients" for milk plus Dairy; "0 of 111 ingredients" with "No ingredient matches. Try another name or category."; `role=status`, `aria-live=polite`; Clear filters returns focus to Name and leaves the page.
- Record pen (new batch, Add tasting open, both widths): Every recipe → Hardness, Scoopability, Smoothness, Sweetness with end words; Any problems? → Coarse, icy; Sandy, gritty; Gummy, elastic; Greasy film; 44 tall; 20 radios. Reads as before.
- Import recovery page: the Placeholder pattern (34px/800 title, 14px secondary line). Wording already before Mark on `look-p9-new-lines`; nothing to add.
- Home lead renders with the catalog in hand.

## Asides (not Phase 9 findings)

- `RecipeList.jsx` `tastingPath` (03.4 code) pairs the latest version with `batches[0]`: Home's "Record a tasting" lands on `/notebook/mexican-chocolate/mexican-chocolate-v4/batch/mexican-chocolate-v3-batch-01`, a v3 batch under the v4 URL, no pen open. For Sarge to triage as a bug row if he agrees.
- Several seeded Source strings carry file jargon ("Mark's ice cream editor (Ingredients.iei)", "imported (legacy .iei, already per-100g as-is)"). The place shows them verbatim as designed; the words are the dataset's.
- Note for Sid `2026-10-01-for-sid-section-rhythm.md` (not promoted): this task did not act on it. Measured in passing: the pen's "Every recipe" cue is now 14px/600 sentence case against 12px/500 uppercase scale captions, so the note's premise (same face as the items) no longer holds as written. Mark's call whether it stays open.

## For Mark

Rows for Sarge to add (the two existing rows `decide-p9-lactose-line-non-dairy` and `look-p9-new-lines` are not repeated):

1. **decide** — The boot line's word for the `problems` table. Options: (a) "its list of tasting problems has a damaged entry" (recommended); (b) "its list of problem words"; (c) keep "problems". Second question in the same row: add "Reload the page; if it stays, import a store file." or leave the line as one sentence (recommended: leave it, the line is D-17's one plain line).
2. **decide** — The facts line's shape. Options: (a) value-first, no labels where the value speaks: "Density 0.994 g/ml · Ultra-pasteurised · Granulated, loose · Hydrates at 80–85 °C" with the hydration source's extra words dropped from this line (recommended); (b) label-colon-value throughout: "Density: 0.994 g/ml · Heat treatment: ultra-pasteurised · Packed state: granulated, loose · Hydrates at: 80–85 °C"; (c) as built. Whichever he picks, the hydration figure should show as a number, with the source's prose after it in parentheses only if he wants it.
3. **look** — After Sid redraws the list cut for finding 1: the 393 board of an open entry with a long source, beside the built page.
