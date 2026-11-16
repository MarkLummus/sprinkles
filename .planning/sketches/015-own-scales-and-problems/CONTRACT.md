# Sketch 015: structural contract

Read with the files themselves. Their markup and inlined CSS are the authority; this note names what they hold so a planner, a checker and UAT cite one source. Mark's answers of 2026-11-15 are in `README.md`; section 3's Low to high row is the redraw that awaits `look-p12-printed-row-ends-only`.

Targets: `record-pen.html`, `reading.html`, `printed-logs.html`. Records of choices, not targets: `read-back-candidates.html` (A chosen), `tasting-log-lines.html` (4 chosen).

Figures are WebKit with a coarse pointer; every panel is the built app's markup, so anything not named below is as built and measures equal to the build (`canvas-generators/p12-measure.mjs` prints the comparison).

## 1. The record pen (`record-pen.html`; approved)

- A recipe's own scales stand under the cue "This recipe only", after the scales under "Every recipe"; its own problems stand under their own "This recipe only" cue inside Any problems?. A recipe that declares none shows no "This recipe only" cue, on the scales or on the problems. All as built.
- A Right in the middle scale (Body) is as built: five stops, the words low, "right", high on the anchors line.
- A Low to high scale (Coffee flavour, Mint), the change: the anchors line reads the low word and the high word only, no "right"; the five stops carry no number (Mark, 2026-11-16), and their boxes are as built (44 x 44 each, the group 216 wide). The words stay under stops 1 and 5, not inside them: "faint" spans 0 to 26.9 and "strong" 177.1 to 216 of the 216. The scale's box stays 88 tall, as every scale's.
- The stops' names for a screen reader: "1: faint", "2", "3", "4", "5: strong" (the end word on 1 and 5 only).
- The same at 393; no horizontal overflow there.

## 2. The reading (`reading.html`; approved; read-back A)

- The Tasting fold lists only what was marked or ticked, under the build's own group labels (Every recipe, This recipe only, Any problems? with its own This recipe only). A recipe with nothing of its own stored shows only "Every recipe". As built.
- A marked Low to high scale says back: stop 1 the low word and its number, "faint (1)"; stop 5 the high word and its number, "strong (5)"; stops 2, 3 and 4 "2 of 5", "3 of 5", "4 of 5". Drawn: Coffee flavour marked 2 reads "2 of 5"; Mint marked 5 reads "strong (5)".
- A Right in the middle scale reads as built: "more (4)", "heavy (4)", "right (3)".
- Cell boxes are the build's; only the value's text changes.

## 3. The printed logs (`printed-logs.html`)

- Both log pages (`.print-page--log`) start 1.5 in from the top of the paper: the 0.5 in page margin plus a 1 in drop, the proposed token `--sheet-print-clipboard-drop` (96 px on the page picture; 90 px in WebKit print for the same inch). The bench sheet pages keep 0.5 in. The purple bar beside a page is a note and does not print.
- The room comes out of the notes lines only: Batch log 13 lines (built 14), Tasting log 4 (built 5). Fields, scales and problems keep their size. Each log is one page; the fits are in `README.md`.
- A recipe's own scales follow the four every recipe has, and its own problems follow the four every recipe has, in one row; no "Every recipe" / "This recipe only" cue prints (sketch 010 D23).
- A Right in the middle scale row is as built: low word, 1, the rule with five ticks, 5, high word, "right" under the middle tick.
- A Low to high scale row (redrawn 2026-11-15, awaits `look-p12-printed-row-ends-only`): low word, the rule with its five ticks, high word, no 1 and 5 and nothing under the ticks (Mark, 2026-11-16). In the markup it is the built row without its `span.lf-anchor.lf-mid` and its two `span.lf-num`.
- Every scale row is 36 px tall, the Low to high row included. The board holds that with one rule, `.lf-sc{grid-template-rows:auto calc(var(--sheet-size-small-print) * var(--sheet-print-leading-solid))}` (12 px for the second line whether or not a word stands in it); without it the bare row measures 25 px.
- The foot reads the recipe, the version and the Sheet code, as built.

## 4. Not drawn

The creation editor's Scales (its Low to high stops line reads the two ends joined by "to", "faint to strong", Mark 2026-11-16; its refused Save for over-long words is drawn in section 5); Gate 2's boards; the bench sheet pages.

## 5. Word limits (`word-limits.html`; drawn from the build 2026-11-16, awaits Mark's look)

Mark's decision of 2026-11-16 (`12-UI-REVIEW.md` finding 2, option b): a recipe's own scale name holds at most 16 characters, each end word 12 and a problem 40, counted on the trimmed text. Save refuses a field over its limit. The board is the creation editor's Scales and Problems at 1366 after Save was pressed (`P12_WordLimits`).

- Each over-long field's sentence, "Use 16 characters or fewer.", "Use 12 characters or fewer." or "Use 40 characters or fewer.", stands as `.field-error` under the field, in the place Required takes. The field is `aria-invalid` and described by the sentence.
- A field at its limit is quiet: no sentence, no mark. The board's Low end, "barely a few", is exactly 12 characters.
- A blank field still reads Required, never the limit sentence; a Kind has no limit.
- The stops line stands as built (for a Right in the middle scale, the five stop words).
- The pen and the printed logs keep the forms of sections 1 and 3 for words up to the limits. That is measured (see `README.md`, "Word limits"), not drawn.
