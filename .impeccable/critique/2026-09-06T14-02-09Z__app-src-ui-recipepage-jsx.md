---
target: "route:/recipe"
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:/Users/mark/Documents/projects/sprinkles/app/src/ui/RecipePage.jsx"
target_fingerprint: "sha256:11965e9fd48414f143adb51c0770177ee1bbe2f03d99c6d73c27498e9dc5fc9b"
target_path: /Users/mark/Documents/projects/sprinkles/app/src/ui/RecipePage.jsx
timestamp: 2026-09-06T14-02-09Z
slug: app-src-ui-recipepage-jsx
---
Method: dual-agent (A: design review agent · B: detector evidence agent). 1440 resize honoured; 390 measured through a same-origin iframe (window minimum ~500). Second run, after the spread revision of 2026-09-06 (note beside the table, method beneath it).

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Focus marks rows silently; nothing says this is version 1 of 1 or that no batch exists yet |
| 2 | Match System / Real World | 3 | Sheet order, grams, and chips match the binder; PAC, POD, MSNF are bare acronyms with no gloss |
| 3 | User Control and Freedom | 2 | No link back to the list; browser Back is the only exit |
| 4 | Consistency and Standards | 3 | Two region names are paragraphs, three are headings; list page is default buttons and Arial |
| 5 | Error Prevention | 3 | Estimated data flagged on row and figure; 0.16 g lambda carrageenan reads "0.0%" |
| 6 | Recognition Rather Than Recall | 3 | Contributing rows now mark in view; no total row |
| 7 | Flexibility and Efficiency | 2 | Six rules are the only tab stops; no keyboard path to a step or row |
| 8 | Aesthetic and Minimalist Design | 3 | Calm and one-weight; 285px void between basis note and margin |
| 9 | Error Recovery | 2 | "No recipe found" is a bare paragraph with no way onward |
| 10 | Help and Documentation | 2 | Basis note is the only explanation and it is small-print jargon |
| **Total** | | **25/40** | **Acceptable** |

## Design Specificity Verdict

**LLM assessment:** Authored for this product, decisively. Rule with hatched band and tick, deviation in words, exception-only Data column, split-step cell, authored legend, bookcloth running heads; refusal of cards, shadows, tints, status colour holds everywhere. Identity evaporates only on the recipe list, the only door in.

**Deterministic scan:** CLI detector clean. In-page detector 15 findings; 2 are extension-injected false positives (glow border, status indicator outside #root). Real: cramped-padding 13 (span.target-chip, zero vertical inset; 16 chips exist), em-dash-overuse 1 (9 dashes, mostly authored content). The two line-length findings from run 1 are gone: headnote prose and method lead render at 638px, basis note at 434px.

**Short-window caveat (B):** at innerHeight 714, focusing Total solids scrolls 487px and only 5 of 12 marked rows stay visible; at 857 the scroll is 25px and all 12 stay visible. The six rules stack to ~1000px.

## Overall Impression

The revised spread works: first viewport at 1440 shows headnote, all twelve rows, five of six rules, first two steps. Remaining gaps are orientation and explanation, plus one contract violation now visible because the trace is in view: the table moves when rows go bold.

## What's Working

- The trace is in view and earns the layout change.
- Uncertainty stated at the point of use: Data column, row list under PAC, same words in the accessible name.
- Typographic discipline: counted values grotesk tabular, sentences Georgia with true italics, lowercase units.

## Priority Issues

- **[P1] The table moves on focus.** tr.is-marked { font-weight: 700 } widens bold text in an auto-layout table; Grams header shifts 8px, Ingredient column widens 8px. Contract forbids position change. Fix: table-layout: fixed with explicit column widths, or reserve bold width, or mark by outline alone. Suggested: /impeccable layout.
- **[P1] The margin is stranded below a void.** Formulation region spans grid rows 2–3; the method's height sets the shared row, so the note's box runs to 1211 while content ends at 958 and the margin starts at 1243 (285px void; 986→1148 at 1024). Fix: column two as one flow (wrapper holding note and margin) so the margin follows the note by one gap. Suggested: /impeccable layout.
- **[P2] The entry page does not belong to the product.** / has no page margin, default grey buttons at (0,0), no title, link with no underline or focus treatment. Fix: page margin token, running head, shared focus outline, buttons in the binder style. Suggested: /impeccable polish.
- **[P2] No total row, and a false zero.** Rows sum to 799.7 g, never shown; lambda carrageenan 0.16 g shows "0.0%". Fix: total row; one more decimal below 0.05% or "trace". Suggested: /impeccable harden.
- **[P3] Marked rows read as a stack of boxes.** Adjacent 1px outlines at 2px offset over 31px rows. Fix: one outline per contiguous run, or a heavier row rule. Suggested: /impeccable polish.

## Persona Red Flags

- **Alex:** cannot get from a rule to its rows without a mouse; no back link, no total row, six tab stops only.
- **Sam:** method ol with list-style none and hidden numbers may lose list semantics in VoiceOver; marked state only in a tr aria-label with no live region; heading navigation skips the margin. Landmarks and rule names are sound.
- **Casey:** at 390 the grid still renders two columns, page 605px wide, note column 132px, grams wrap.
- **Mark, days later:** list gives no sign which version printed or when; recipe page has no date or short code; no statement that there is nowhere yet to write the result.

## Minor Observations

- Chip label and value 2px apart fuse at a glance ("temp85 °C").
- Rule caps at 320px in a 437px column: two right edges.
- Step 10 body starts 11px further right than steps 1–9 (per-step grid).
- Total fat breakdown line sits outside its rule's outline.
- Sugar solids "no target set" tick floats on a bare rule.
- Mouse click on a rule draws the focus outline; the mark persists after mouse-up.
- Advisory slot aria-label on a plain div is ignored.
- Tab title is "Sprinkles" on both routes.
- Em-dash count is content, not interface.

## Questions to Consider

- Should the assessment (bold 20px figures) ever be heavier than the recipe it assesses (15px grams)?
- "PAC 24.1": what is the familiar word, and where does it sit?
- Is "state by weight" compatible with a proportional table, or does the contract need table-layout: fixed written in?
- Is the margin a region at the bottom of column two, or running commentary beside whatever it comments on?
