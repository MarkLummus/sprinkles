---
target: Phase 9 changed surface — the Notebook and Ingredients places, the Import recovery page, the boot line, the record pen's catalog scales and chips
total_score: 34
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 1
target_identity: "file:/Users/mark/Documents/projects/sprinkles/app/src/ui/IngredientsPlace.jsx"
target_fingerprint: "sha256:341abba437ee4bd0dcf839a4b3b46dc8b1ac6d4f4c103bab0b4861e4d278de0a"
target_path: /Users/mark/Documents/projects/sprinkles/app/src/ui/IngredientsPlace.jsx
timestamp: 2026-10-19T03-05-31Z
slug: app-src-ui-ingredientsplace-jsx
---
Method: live audit of the dev build (HEAD a1024fb9) in Playwright WebKit 2359 and Chromium (system Chrome), coarse pointer, 1366 and 393, a fresh profile per width (8 recipes, 111 library entries seeded), every route the places link to visited first. Measured with getBoundingClientRect and getComputedStyle; nothing judged from CSS source. Conformance to sketch 012 was not redone (plans 09-16, 09-17 hold it); this is quality against the world. Nothing here is verified on the iPad or iPhone.

Scope: /notebook (NotebookPlace.jsx), /ingredients (IngredientsPlace.jsx), Shell.jsx's post-import recovery page, main.jsx's damaged-table boot line (triggered by writing a bad row to the `problems` store, then cleaned up), BatchRow.jsx's record pen with Add tasting open, RecipeList.jsx's lead.

Verdict: ships, with one layout defect the sketch itself carries and two wording revisions.

Priority issues:
1. P1, layout (IngredientsPlace, open entry below the 760 cut): when a figure's source text is long, the basis and the source are drawn in one box. At 393 in WebKit, Heavy cream's Fat row: basis cell `derived` x 48, width 0, height 34; source cell `panel reconciled three ways…` x 68, width 305, right-aligned, two lines; the rendered text reads "derivedpanel reconciled three ways against a 36% regulatory floor". Chromium: basis width 0, source width 305, the same. A short source sits beside its basis (Milk solids row: basis 221.8 wide, source 83.2). The board draws the same, so this is a sketch defect, not a conformance gap. Violates sketch 012's own rule for the cut ("the figures table reads as a list, figure and amount then basis and source, as the ingredient table does below 724"): two recorded values must stay two values. Fix is sketch-first: redraw the list cut in `.planning/canvas-generators/places.py` so the source takes its own line under the basis, left-aligned, snapshot to `.planning/sketches/012-places/`, then `/gsd-quick` for `app.css`'s list-cut rules.
2. P2, wording (main.jsx, `bootDamagedLine`): "Sprinkles can’t open: its list of problems has a damaged entry." For the `problems` table the plain word collides with English and reads as "Sprinkles has a list of problems"; the other four words (ingredients, machines, ice cream styles, scales) read as intended. The line also names no way out, where its two siblings do ("Close other Sprinkles tabs to finish updating.", "Could not open the local store. Try reloading."). Rendered as the same `.app-boot` line as those siblings (14px, secondary text, full width), so the shape is consistent. Violates D-11 familiar words / the plain-words house rule. `/gsd-fast` once Mark picks the word.
3. P2, wording (IngredientsPlace `factsText`): one line mixes three grammars. "Density 0.994 g/ml" (label value), "Heat treatment: ultra-pasteurised" and "Packed state: granulated, loose" (label, colon, value), and "Hydrates at commonly cited 80–85 °C, varies by grade" (a sentence whose number is replaced wholesale by the source's prose whenever a source exists; the number itself is then never shown as a figure). Measured on Heavy cream, Sucrose and Locust bean gum at both widths; 14px secondary text. The Packed state line is already on `look-p9-new-lines`; the colon inconsistency and the hydration substitution are new. Violates the short-label, plain-words house rule. `/gsd-fast` once Mark picks the shape.
4. P3, note: Basis and Source change type role across the cut: 15px app text at 1366, 14px secondary text at 393, while Amount stays 15px app text at both. DESIGN.md allows provenance either role; the board draws it; recorded, no change proposed.
5. P3, note: two link treatments on one page. Clear filters is the blue companion (rgb(20,117,221)), weight 600, underlined, 78.6 by 44; Show / Hide inside the row head is app text, weight 400, underlined, 14px. Both are on the approved board (DESIGN.md gives the Notebook frame's own controls the companion and keeps the global ink link rule). Recorded, no change proposed.

Standing axes:
- Blank stays blank: pass. Milk Chocolate opens with its six figure rows and no facts, lactose or Note line; Locust bean gum opens with one row and one fact; "not recorded" shows only where a held figure lacks a source. No dash, no "none".
- No colour carries state: pass. "not recorded" is secondary grey where a recorded source is ink at 1366, but the words carry the meaning and at 393 both are grey. Show / Hide is text plus aria-expanded. The chips are aria-pressed with a square mark.
- Links and focus: the Notebook name link is ink, hairline underline, 44 tall, visited identical to unvisited (no a:visited leak); focus ring 2px solid ink, 2px offset, :focus-visible true, on the link and on the row head.
- Touch floor: every measured control is 44 tall (name link, Name field, Category select, row head, Clear filters, chips); the Name field is 598.9 wide and the select 120 at 1366.
- Overflow: scrollWidth equals innerWidth at 1366 and 393 on both places.
- Marks: rail 8 by 44 to 67 px, 4px radius, Notebook rgb(253,91,87) and Ingredients rgb(56,139,87); the current nav word is the on-subtle companion rgb(223,7,2).
- Counts in words: "8 recipes", "111 ingredients", "17 of 111 ingredients" (milk), "15 of 111 ingredients" (milk plus Dairy), "0 of 111 ingredients" with "No ingredient matches. Try another name or category."; the count is role=status, aria-live=polite; Clear filters returns focus to the Name field and leaves the page.
- Record pen (Add tasting open, new batch, both widths): Every recipe → Hardness, Scoopability, Smoothness, Sweetness with their end words; Any problems? → Coarse, icy; Sandy, gritty; Gummy, elastic; Greasy film, each 44 tall with the square mark; 20 radios. Reads as before the phase.
- Import recovery page: the Placeholder pattern (34px/800 title, 14px secondary line); wording plain; already before Mark on `look-p9-new-lines`.
- Home lead renders ("Mexican Chocolate · Version 4 · v4 · Record a tasting").

Aside, outside Phase 9's change (03.4 code, `RecipeList.jsx` `tastingPath`): the lead's Record a tasting link pairs the latest version with `batches[0]` and lands on /notebook/mexican-chocolate/mexican-chocolate-v4/batch/mexican-chocolate-v3-batch-01, a v3 batch under the v4 URL, with no pen open. For Sarge to triage, not a Phase 9 finding.

Aside, data not UI: several Source strings in the seeded library carry file jargon ("Mark's ice cream editor (Ingredients.iei)", "imported (legacy .iei, already per-100g as-is)"). The place shows them verbatim, as designed; the words are the dataset's.

Heuristic scores (0–4):
| Heuristic | Score | Basis |
|---|---:|---|
| System status | 4 | Live count line, Show/Hide, aria-expanded |
| Real-world match | 3 | "list of problems", facts-line grammar |
| User control | 4 | Clear filters, focus return, in-place fold |
| Consistency | 3 | Two link treatments; role shift across the cut |
| Error prevention | 4 | Read-only place, no submit |
| Recognition | 3 | Basis and source fused at 393 |
| Efficiency | 3 | 8043 px page at 111 entries, filters scroll away (approved) |
| Minimalism | 4 | Lines omitted when absent |
| Error recovery | 3 | Boot line names no way out |
| Help | 3 | Lactose helper on dairy only (open row) |
| Total | 34/40 | Ships with revisions |
