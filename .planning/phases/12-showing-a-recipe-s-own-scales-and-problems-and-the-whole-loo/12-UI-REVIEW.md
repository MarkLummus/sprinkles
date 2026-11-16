# Phase 12 UI review

Impeccable audit of the changed surface (project override of the generic 6-pillar audit). Advisory; does not block verify. Source of truth: `.impeccable/critique/2026-11-16T09-40-16Z__app-src-ui-axismark-jsx.md`.

## Verdict

**Ships. 35/40** (audit dimensions 18/20: Accessibility 3, Performance 4, Theming 4, Responsive 3, Implementation integrity 4). No P0, no P1. With ordinary words the build is right as design, not only as drawn: the Low to high scale is the existing track with one word taken away, its stops are named honestly, the read-back keeps its number in every form, and the printed row holds its 36 px. Two P2 findings share one cause and one decision of Mark's: nothing limits a scale's name or end words, and long ones run together under the pen's track and push the printed Tasting log's foot onto another sheet in Safari. One P3 is recorded with no change proposed. Blank stays blank and no colour carries state both pass. The flagged assumption A1 (the editor's stops line) is judged right; keep it.

Method: HEAD ab76dd86 built to a scratch `--outDir "$TMPDIR/sprinkles-12/dist-ui-review"` (app/dist and Mark's `vite preview` untouched; no Vite dev server), served on an ephemeral 127.0.0.1 port by `08-walk-server.mjs`, driven in Playwright WebKit with a coarse pointer at 1366, 768 and 393 (pen and reading), 1366 (creation editor; creation is 1366-only by decision) and the print route's page pictures at 816 × 1056; every facet repeated in Chromium (system Chrome) at 1366. The phase's probes were re-run on this build (`12-stops-probe.mjs report pen reading editor`; `12-print-check.mjs rows drop lines fit worst`: 23 PASS, 0 FAIL). Example recipes from `12-cases.mjs` (two, one, none, worst) plus three of this audit's own, injected the same way: `pair` (two Low to high scales), `worstMarked` and `worstEnds` (the long words, marked). Real DOM only (`getBoundingClientRect`, `getComputedStyle`, `scrollWidth`, the accessibility tree). `impeccable detect` not run: blind to `.jsx`, a null result. Board conformance not redone (12-04: 1090 PASS, 0 FAIL). **Nothing here is device-verified.**

## Findings, most severe first

### 1. P2 — Long end words run together under the pen's track

- **Where:** `AxisMark.jsx`'s `.axis-mark__anchors` (`app.css` 2070 to 2079), the record pen, any width.
- **Measured (WebKit; case `worst`):** the Low to high scale's anchors row is 216 px wide and its content 235 (Chromium 221): "barely there at all" spans 984 to 1089.1 and "overwhelmingly nutty" 1089.1 to 1218.7, 0 px between them, 18.7 px past the track's end. On screen it reads "barely there at alloverwhelmingly nutty". The Right in the middle scale reads "too thin and sparserighttoo thick and gluey" (content 260 of 216, 0 px gaps, 44.1 px past). At 768 the track is 186 px and the row ends 46.7 px outside its own 213.3 px mark. The same at 393. `scrollWidth` equals `innerWidth` at all three widths: the page does not scroll sideways. With ordinary words the row is right: faint 984 to 1010.9, strong 1161.1 to 1200, on a track 984 to 1200.
- **Violates:** the anchors row's own stated job (`app.css`: "the low/mid/high words sit under their own end/middle of the scale"); they are the only visible names of the ends, since the stops show bare numbers. Cause, measured: the row is the track's fixed width, `nowrap`, `space-between`, so the gap is what is left and reaches 0 when two words pass 216 px (186 at 768), or 188 px with "right" between them.
- **Sketch status:** not drawn. The three-word case is older than this phase; the two-word case is this phase's.
- **Fix:** the decision under finding 2. If Mark picks (b): `/gsd-quick`, the limits in the creation gate, with the pen's anchors measured at 768 with the longest allowed words and a gap of at least 6 px.

### 2. P2 — The printed Tasting log with long words: foot on a second sheet in Safari, low word crowding the name (Open Question 2)

- **Where:** `PrintLogPages.jsx` `LogScaleRow`, `print.css` `.lf-sc` and `.lf-srow`; the creation editor's Scales and Problems fields, which take any length.
- **Measured (`12-print-check.mjs worst` on this build, and this audit's page picture):** need 827.8 px of Safari's 810 (17.8 over); Chrome's 864 leaves 36.2. Rows 55 px (three-line name), 40 px (two-line name), problems 62.8 px on two lines: against case two, +19, +4 and +36.9. The low word is right-aligned against the "1" and grows leftward: "barely there at all" spans 237.9 to 342, 16.1 px inside the name column (104 to 254); "too thin and sparse" 24.1 px inside it; in the picture "BROWN BUTTER AND" and "barely" touch. The high word grows rightward into empty paper (ends at 689.9 of 774; the scale grid uses 370 of its 508 px), so its 54 px overrun harms nothing. Ordinary words (case two): Batch log 790 of 810, Tasting log 767.9 of 810, 42.1 spare.
- **Violates:** D-17 (each log stays one page). "Side 2 of 2" on a third face breaks a sheet meant to be printed on both sides and clipped.
- **Sketch status:** not drawn on sketch 010 or 015.
- **Fix: Mark decides.**
  - **(a) Leave it.** The failure needs end words near 100 px (about 17 letters) each; Mark's own are short. The pen and the paper stay breakable.
  - **(b) Limit the words in the creation editor. Recommended.** End words 12 characters, a scale's name 16, a problem 40, each refused at Save with a sentence under its field (the words are Mark's to choose). Basis: the print word column is 76 px and the measured words run 5.5 to 6.5 px a character; two 12-character ends are about 156 px of the pen's narrowest track (186), 184 with "right" between; a 16-character name stays on one printed line (150 px column, about 8.6 px a caps character), which leaves a second problems line (+36.9 of 42.1 spare) as the only growth, so the log always fits. One rule mends the pen, the printed crowding and the page count. Work: Sid draws the refused state on sketch 015 first, then `/gsd-quick` (the gate in `creationSave`/`creation.js`, messages in `CreationSetup.jsx`, and `12-print-check.mjs worst` re-set to the longest allowed words and turned from REPORT into PASS).
  - **(b2) The same with names to 24.** Two printed lines per name (+4 each): two such names and a second problems line come to 44.9 of 42.1, 2.8 px over in Safari, so the Tasting log's notes give up a line (4 to 3) when that happens. A phase plan, not a quick: layout by measurement on the log page.
  - **(c) Mend the paper only:** wrap end words in their 76 px column and drop notes lines as rows grow. The pen still runs together. A phase plan.
  - **(d) Widen the printed word columns** into the 138 px free at the right. Changes sketch 010's approved row for every recipe and leaves the pen as it is. Sketch first, then `/gsd-quick`.

### 3. P3 — "2 of 5" carries no end word on the reading (recorded, no change proposed)

- **Where:** `BatchRow.jsx` `TastingReading` through `readMarkText`.
- **Measured:** the cell reads "Coffee flavour" (12/600 caps) over "2 of 5" (14/400, tabular figures), 165 × 37 at 1366, 157 × 37 at 768, 166.5 × 37 at 393, the same cell and face as "heavy (4)" beside it; "3 of 5" beside "none (1)" likewise. Neither end word is on the reading unless the mark is at an end. Accessibility tree: "Body heavy (4) Coffee flavour 2 of 5".
- **Tension with:** D11 (familiar words by default): the direction of the number rests on the kind's meaning and the scale's name. Mark chose this form (decide-p12-low-to-high-read-back, candidate A) and the board is approved. Every form keeps the stop number, so the two grammars in one group share their one fact. No fix.

## Judged and held

- **A1, the editor's stops line "faint · 2 · 3 · 4 · strong": keep it.** Measured: 350 × 17, 14/400 grotesk, rgb(89, 89, 89) on white (7.0:1), 12 px under the Kind control, one line even with the long words (the other kind's line wraps to 34 px). It is the same five-part line as "thin · leaning thin · right · leaning heavy · heavy", it shows what the pen will name, and it says what "faint to strong" would not: the middle has no words. "faint to strong" would repeat the Kind's own label and the two fields above it. Not drawn on sketch 015 (CONTRACT: the editor's Scales "follow 12-CONTEXT D-01"); if Mark confirms, Sid draws the line into the sketch.
- **Stop names.** `group "Coffee flavour This recipe only"`: `radio "1: faint"`, `"2"`, `"3"`, `"4"`, `"5: strong"`. The visible anchors are `aria-hidden`, so each end word is heard once. A bare "2" is never ambiguous inside its named group; two Low to high scales together (`pair`) are two groups, "Coffee flavour This recipe only" and "Salt This recipe only".
- **Blank stays blank.** An unmarked scale shows its name alone (no "(n)", no Clear, no filled stop); the reading omits it, and drops the "Every recipe" cue when no core scale is marked.
- **No colour carries state.** The mark is the filled stop plus "(2)" beside the name plus Clear; the read-back is words and a figure in the App text colour.
- **Touch and width.** Stops 44 × 44 at 1366 and 393 (38 × 44 at 768, as before this phase); marks 350 (353) × 88, two Low to high marks 20 px apart; no horizontal scroll in any state.
- **Paper.** Every scale row 36 px; the Low to high row prints faint, 1, five ticks, 5, strong and an empty second line; the page pictures start 144 px down (48 + 96), 90 px of drop under WebKit print media; 13 and 4 notes lines.
- **Theming.** Two tokens added (`--sheet-print-clipboard-drop`, `--sheet-print-clipboard-drop-webkit`); no literal in the diff of `print.css` or `app/src/ui`.

## Minor observations (no work proposed)

- A long name with a mark pushes Clear to a second line and the mark from 88 to 108.2 px (name 291.4 of 350). It goes with a name limit.
- The editor's Name field clips a 36-character name at its right edge (seen in the picture, not measured). Phase 10's field; it goes with a name limit.
- A Right in the middle scale reads "heavy (4)" and "heavy (5)": only the number separates stops 4 and 5. Older than this phase.

## Not checked

- Mark's iPad and iPhone: nothing here is device-verified. Playwright WebKit and Chromium only; the Simulator was not run again (12-05's pictures stand).
- Real Safari print and paper: the page fit is `12-print-check.mjs`'s model (630 px width, 810 px room) and 12-05's WKWebView PDF, not redone, not printed, not clipped to a board.
- VoiceOver's actual speech, a hardware keyboard, and `:focus-visible` on the stops (unchanged code; a scripted focus does not raise it).
- Forced colours, larger text settings, and import of a recipe whose words are already long.
- Gate 2's surfaces (entry points below 724, Preview step in the version pen, row controls): outside this round.

## For Mark

1. Open Question 2: options (a) to (d) under finding 2; recommended (b), end words 12 characters, names 16, problems 40.
2. A1: keep "faint · 2 · 3 · 4 · strong" (recommended) or return to "faint to strong".
