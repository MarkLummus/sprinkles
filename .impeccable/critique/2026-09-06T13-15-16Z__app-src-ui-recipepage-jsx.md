---
target: "route:/recipe"
total_score: 23
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 2
target_identity: "file:/Users/mark/Documents/projects/sprinkles/app/src/ui/RecipePage.jsx"
target_fingerprint: "sha256:11965e9fd48414f143adb51c0770177ee1bbe2f03d99c6d73c27498e9dc5fc9b"
target_path: /Users/mark/Documents/projects/sprinkles/app/src/ui/RecipePage.jsx
timestamp: 2026-09-06T13-15-16Z
slug: app-src-ui-recipepage-jsx
---
Method: dual-agent (A: design review agent · B: detector evidence agent). Chrome would not resize in either agent; 1024 and 390 widths were emulated (body-width constraint in A, same-origin iframes in B) and agree on every measurement.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | No version name, date, or "no batch recorded yet"; tab title is "Sprinkles" on every route |
| 2 | Match System / Real World | 4 | Reads as a recipe; steps are lead-in, prose, typed chips; deviations in plain words |
| 3 | User Control and Freedom | 1 | No link back to the list from the recipe page; browser Back is the only exit |
| 4 | Consistency and Standards | 3 | Headnote and Margin region names are paragraphs while the other three are h2; list page uses default buttons |
| 5 | Error Prevention | 3 | Read-only view; basis note prevents mis-trusting a figure |
| 6 | Recognition Rather Than Recall | 2 | Step column says "8" but step 8 is off-screen at every width, with no link between them |
| 7 | Flexibility and Efficiency | 1 | Six rule buttons are the only focusable things; no anchors, no jump from row to step |
| 8 | Aesthetic and Minimalist Design | 2 | Five short columns stretched across 1020px; a 622px void between table and its figures |
| 9 | Error Recovery | 2 | "No recipe found for this version." is a dead-end paragraph |
| 10 | Help and Documentation | 3 | In-place basis notes are the right kind; the PAC sentence assumes the reader already knows PAC |
| **Total** | | **23/40** | **Acceptable** |

## Design Specificity Verdict

**LLM assessment:** Authored for this product, narrowly. The graduated rule with its hatched band and "inside 22–26", the Data column with a bare "estimated", the "carried forward / authored" legend, the "2 + 3" split-step cell, and the bookcloth running heads could not be lifted into another product. The page around those parts is generic: a 2:1 CSS grid with 48px padding and nothing else. No product name, no way back, no version strip, no date. The signature parts are authored; the spread is not yet composed.

**Deterministic scan:** CLI detector over app/src/ui and app/index.html: 0 findings. In-page detector on the live route: 16 findings. line-length 2 (p.headnote__prose ~168 chars/line, p.basis-note ~146); cramped-padding 13 (span.target-chip, zero vertical inset inside a 1px border; 16 chips exist); em-dash-overuse 1 (9 in body text, most in authored notes and asides, which are content; two are the app's: the fat breakdown and the basis note). The em-dash finding is mostly a false positive. The detector caught the chip inset the review walked past; the review found everything structural the detector cannot see.

**Visual overlays:** Assessment B left a tab open titled "[Human] Sprinkles critique" with the detected issues highlighted; the overlay server is stopped.

## Overall Impression

The instruments are right and the page is not. Every device the brief asked for exists and reads as designed. What is missing is the composition that puts them in front of the maker together. The brief's focal moment, the ingredient table and its formulation note on one page, does not occur at any width. Fixing the grid is the single biggest opportunity.

## What's Working

- The deviation is words and the band is hatch. "no target set" on sugar solids shows the system is honest about a missing target.
- The Data column as an exception-only word. Twelve rows carry the uncertainty principle without an icon or a colour, and it prints as-is.
- The method's typed chips under a bold lead-in, italic purpose beneath, is a bench-ready reading order.

## Priority Issues

- **[P0] The focal spread does not exist at any width.** Row 2 of .recipe-page takes its height from the ten-step method, so the formulation note starts 622px below the table at desktop and over 1000px below at 1024. At 390 the two-column grid still holds and the page is 605px wide; the method is off the right edge and grams wrap. Fix: table and note share one grid column with the method spanning both rows; add the brief's single breakpoint below 1280 to a one-column stack (headnote, table, formulation note, method, margin). Suggested: /impeccable adapt, /impeccable layout.
- **[P0] No exit.** RecipePage.jsx renders no link to /, and the not-found state is a bare paragraph. Fix: a running head at the top of the page carrying the product name as a link home, and the same link in the not-found paragraph. Suggested: /impeccable harden, /impeccable layout.
- **[P1] The graduated rule is drawn at 320px inside a 1020px column and its anchors label the column, not the rule.** The SVG keeps its 320-wide viewBox centred in a full-width button while the 0 and 40 anchors sit at the button's far edges; label at the left edge, bold value at the far right. Fix: max-width near 480px on .graduated-rule, anchors aligned to the baseline endpoints, value beside the label. Suggested: /impeccable layout.
- **[P1] The table stretches to fill its column.** Five short columns across 1020px; Grams 320px from Ingredient, Data 800px right. Fix: size to content or a max-width, right-align numeric columns, leftover width becomes margin. Suggested: /impeccable layout.
- **[P2] Measure and chip inset.** Headnote prose at 168 chars/line and basis note at 146 need a max-width near 65ch; every target chip has zero vertical inset. Fix: max-width on both paragraphs and a hair of vertical padding on the chip from the spacing tokens. Suggested: /impeccable typeset.

## Persona Red Flags

- **Alex:** figures 1200px below the fold; six Tab presses reach the rules and nothing else is focusable; no anchor from a row's step number to the step; leaves via browser Back.
- **Sam:** landmarks good. Headnote and Margin are paragraphs, so heading navigation skips two regions. Row-level aria-label carrying "contributing to PAC" is unlikely to be announced on a tr, so the focus trace is silent. Deviation words are aria-hidden and not in the rule's accessible name. Step numbers hidden inside an ol with list-style none, which VoiceOver drops without role="list".
- **Casey:** at 390 the page is 605px wide, the method is off-screen right, cells wrap ("370.4" / "g"). Rule buttons are large targets but the note is 3100px down. Nothing to transcribe into yet (Phase 2).
- **Mark, days later:** the list shows two default buttons and one bare row, no title, no sign of the 2 Aug batch. The recipe page has no date, lineage, or place for the short code. Authored row order holds; orientation and the way back do not.

## Minor Observations

- Adjacent marked rows' outlines collide with the row rules and read as one heavy box.
- No hover state on a rule; a mouse user discovers the trace only by clicking.
- Total fat shows no "estimated" line while MSNF does; correct per-field basis, reads as inconsistency because the basis note names rows, not fields.
- The basis note's PAC-relative-to-sucrose sentence is parseable only by its author.
- "Ingredient table" as a region name is redundant with the visible table.
- The advisory slot carries an aria-label on a plain div with no role.
- Tab title should lead with the recipe name.
- List page unstyled; Export and Import are browser defaults.

## Questions to Consider

- What if the formulation note were a column beside the table instead of a row beneath it?
- Should the step column be a link, and the step number a link back?
- Is the deviation in words the value and the number the annotation?
- What does this page look like with the method removed?
