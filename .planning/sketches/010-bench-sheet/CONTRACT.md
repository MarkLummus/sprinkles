# Sketch 010: structural contract

Read with the files themselves. Their markup and inlined CSS are the authority, and this note names what they hold, section by section, so the plan cites one source. Values are the boards' own. "Token" means a custom property already in `app/src/styles/tokens.css`; "literal" means a value the boards state directly, which Phase 4 turns into a token (CLAUDE.md: every visual value reads through a custom property).

All three printed pages: letter portrait, 816 px wide, white page (`#ffffff`), ink only (`--sheet-ink`, #141414). Measured colours on all three: ink alone. Smallest type: 12 px. No controls, no hover, no focus states: paper.

## Page 1: `page-1-batch-log.html` (batch log, front)

Page box `.lf`: 816 × 1056, padding 48 / 56 / 40 (top, sides, bottom; literal), a flex column, grotesk face (`--face-grotesk`).

In order, top to bottom:

1. **Side title** "At the machine": `h2.region-name` at `--sheet-type-section`, ink, margin below `--gap-m`.
2. **Churn date**: caption `.pen-caption`, then a ruled line `--sheet-field-w-date` wide (128 px), 32 px tall (literal), bottom rule `--rule-ink-field` (1 px).
3. **Field row** (flex, gap `--gap-l`): Time to draw temp. / Out of machine / Churn duration. Each is a caption, then a 96 px ruled line (literal), then its unit in `--sheet-type-control`: "min", "°C", "min".
4. **Exit consistency**: caption, then a mark-one row: a 14 px ink box (literal, 1 px border) before each option word. Options: "Smooth ribbon", "Wet, soupy", "Chunky, separated". Gap `--gap-m`; text `--sheet-type-control`.
5. **Airiness** (D3, no "(estimated)"): mark-one row "Low, dense", "Medium, standard", "High, airy".
6. **At the machine**: caption, then 5 writing lines. Each line is 32 px (literal) with a 1 px ink baseline.
7. **Ingredient notes**: caption, then 5 writing lines.
8. **Next time** (D5): the recipe's own section. An `h2.region-name` heading in the side-title face (not a caption), margin above `--gap-s`, then 4 writing lines.
9. **Foot**: pushed to the page's foot (`margin-top: auto`), rule above `--rule-ink-field`, `--sheet-size-small-print`, letter-spacing 0.02em. Reads "Olive Oil Ice Cream · Version 1 · 50 g oil · 800 g · [short code] · Page 1 of [m]". The short code and page count are placeholders.

Sections are spaced `--gap-m`. Measured: the content ends 41 px above the foot, and the foot ends on the 40 px bottom margin.

## Page 2: `page-2-tasting-log.html` (batch log, back)

Same page box, foot and section spacing as page 1. In order:

1. **Side title** "When you taste it".
2. **Tasted** (D2): a date line as on page 1.
3. **Field row**: Tempering (min) / Tasting temperature (°C) / Melt test ("g lost at 20 min"), ruled lines with units (D1).
4. **Melt style**: mark-one row "Watery, weeping", "Creamy puddle", "Stable foam".
5. **Axes**: a three-column grid (gap `--gap-l` × `--gap-m`).
   - Row 1 holds the cues: "Every recipe" across columns 1 and 2, "This recipe only" over column 3 (`.pen-caption`).
   - Then the scales, row-major: Hardness, Scoopability, Body / Smoothness, Sweetness, Oil, the pen's own desktop order. The declared axes (Body and Oil for Olive Oil v1) come from the version.
   - Each scale: the name (`.axis-mark__name`), then five columns `--sheet-stop-w` wide (38 px). Each column has its number 1 to 5 above (`--sheet-size-mark-stop`), an unfilled 22 px ink box (literal, 1 px), and beneath stops 1, 3 and 5 the anchors in italic text face (`--face-text`, `--sheet-type-control`): low / "right" / high (soft–hard, crumbly–gummy, thin–heavy, grainy–smooth, less–more, faint–strong).
6. **Any problems?** (D4): caption "Any problems?", helper "select all that apply" (`.pen-helper`), then a three-column grid matching the axes.
   - "Every recipe" spans columns 1 and 2, with the defects stacked: Coarse, icy / Sandy, gritty / Gummy, elastic / Greasy film. Each is a 14 px box and the word.
   - "This recipe only" sits in column 3: Bitter (the version's declared flaw).
7. **How did it turn out?**: caption, then 7 writing lines.
8. **Foot**: as page 1, "Page 2 of [m]".

Measured: the content ends 31 to 32 px above the foot.

## The Sheet: `sheet-balance-col2.html` (the Sheet's printed pages)

Markup: the build's own Sheet (`article.recipe-page` inside `.notebook > .notebook-body > .notebook-body__sheet`), Olive Oil v1 with no batch. CSS: the app's tokens.css, app.css and notebook.css resolved for print at 816 (the screen-only blocks dropped), app.css's own `@media print` block, then the edits below. The Sheet's own padding (`--gap-page`, 48 px) is the page margin.

**Layout** (E4): `.recipe-page` is a two-column grid, `minmax(0,1.65fr) minmax(0,1fr)`, with areas `'band band' 'before before' 'ingredients side' 'method method' 'foot foot'`. Measured columns: 436 px and 264 px, with a 32 px gap (`--gap-l`).

- **Band** (Sheet title "Olive Oil Ice Cream", Sheet description): as built.
- **Before you start**: as built, full width, above the table (decision 36, placement B).
- **Ingredients**, column 1:
  - Heading `h2.region-name` in ink (E5).
  - Table header row: "As made" | "Ingredient" (colspan 2, the build's own header over the grams and the name). Header rule as built.
  - One `tbody` per step group (as built, decision 45). Each opens with its step head ("Step 2" and the lead, as built). The step head's top border is `--rule-tick` (2.5 px) in ink (E7); its rule beneath is as built.
  - Each portion line: an As made cell 84 px wide (literal) holding a 72 × 24 px ruled line (literal, 1 px bottom), then the plan grams (the build's `.ingredient-table__col-grams`, right-aligned, no wrap), then the name (the build's own name cell, with its "estimated" flag and its portion note). There are no rules between portion lines (E8), no tick box (E1), and no share column (E2).
  - Measured widths: As made 90, Grams 81 (WebKit) or 75 (Chromium), Ingredient 264 or 271. Row heights 37 to 47 px; no name wraps.
  - Total row (`tfoot`): an empty As made cell, then "799.7 g", then "Total". The top rule is as built (`--rule-baseline`), bold as built.
- **Balance**, column 2, beside the table: the build's formulation note with its six gauges and basis note. The heading is the plain words "Balance" (`h2.region-name`, ink) with no Hide control (E4). The gauges scale to the column, 264 px, below their native 320 px (`max-width: var(--rule-width)`).
- **Watch for**: absent (E3).
- **Instructions**: as built, full width, under the table and Balance, with step 1 opening right after them. `.method-step` keeps `break-inside: avoid` from the print block.

**The as-built side of the delta**: `as-built-sheet-letter.html` is one column: band, Before you start, Ingredients (Grams | Ingredient | % of batch, 1.5 px rules on every row), Balance, Watch for, Instructions. Its headings print bookcloth green, and Balance and Watch for print their Hide controls.

## Text that is fixed

The quoted labels above are verbatim. Every option word, anchor and caption on the log pages comes from the built pens, except where D3 drops "(estimated)" and the brief's side titles name the sides. Mark's edits add the Sheet's "As made" header. The Sheet's other words are the version's own (Olive Oil v1), standing in for any version.
