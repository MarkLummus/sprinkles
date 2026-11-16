---
target: Phase 12 changed surface — a recipe’s own Low to high scale on the record pen (1366, 768, 393), its read-back on the tasting reading, the creation editor’s stops line at /notebook/new (1366), and the printed Batch log and Tasting log with the clipboard drop
total_score: 35
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 0
target_identity: "file:/Users/mark/Documents/projects/sprinkles/app/src/ui/AxisMark.jsx"
target_fingerprint: "sha256:fe20f298f03efbb9669ff9e54de610c87fd53b6f8a8631425a7ed2fb3c6ccb6c"
target_path: /Users/mark/Documents/projects/sprinkles/app/src/ui/AxisMark.jsx
timestamp: 2026-11-16T09-40-16Z
slug: app-src-ui-axismark-jsx
---
⚠️ DEGRADED: single-context (no sub-agent is exposed to this agent; the measured review and the judgement were made in one context; `impeccable detect` was not run because it is blind to JSX and a null result is not a pass).

Method: live audit of a scratch production build (HEAD ab76dd86, `vite build --outDir "$TMPDIR/sprinkles-12/dist-ui-review"`; app/dist and Mark's `vite preview` untouched, no Vite dev server), served on an ephemeral 127.0.0.1 port by `08-walk-server.mjs`, driven in Playwright WebKit with a coarse pointer at 1366, 768 and 393 (the pen and the reading), 1366 (the creation editor; creation is 1366-only by decision) and the print route's page pictures at 816 × 1056; every facet repeated in Chromium (system Chrome) at 1366. The phase's own probes were re-run on this build (`12-stops-probe.mjs report pen reading editor`; `12-print-check.mjs rows drop lines fit worst`: 23 PASS, 0 FAIL, the `worst` REPORT lines unchanged). The example recipes come from `12-cases.mjs` (two, one, none, worst) plus three of this audit's own built the same way: `pair` (two Low to high scales, Coffee flavour faint to strong and Salt none to a lot, marked 3 and 1), `worstMarked` and `worstEnds` (the long-word case with marks at the middle and at the ends). Real DOM only: `getBoundingClientRect`, `getComputedStyle`, `scrollWidth`, the accessibility tree (`ariaSnapshot`). Board conformance was not redone (plan 12-04: 1090 PASS, 0 FAIL across sketch 015's sixteen panels). Nothing here is device-verified: Playwright WebKit is not Mark's iPad, and no paper was printed.

Scope: `AxisMark.jsx` and `axes.js` (the Low to high stops on the record pen), `BatchRow.jsx` `TastingReading` (the read-back), `creation.js` `scaleStopsLine` through `CreationSetup.jsx` (the editor's stops line, assumption A1), `PrintLogPages.jsx`, `print.css` and the two clipboard-drop tokens (the printed logs). Nothing else.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 4 | a marked scale says its stop beside its name, "(2)", and gains Clear; an unmarked one shows its name alone; the reading shows only what was marked |
| 2 | Match System / Real World | 3 | "faint" and "strong" under the ends and bare 2 3 4 is how a maker thinks of "how much"; "2 of 5" on the reading carries no end word, so the direction rests on the scale's name |
| 3 | User Control and Freedom | 4 | Clear on every marked scale, unchanged; nothing new to undo |
| 4 | Consistency and Standards | 4 | one kind branch in `axes.js`, five surfaces saying the same thing: pen anchors, stop names, read-back, the editor's line, the printed row |
| 5 | Error Prevention | 2 | nothing limits a scale's name or end words, and long ones run together under the pen's track and push the printed Tasting log onto a second sheet in Safari |
| 6 | Recognition Rather Than Recall | 4 | the end words stand under stops 1 and 5 on the pen and beside 1 and 5 on paper; the editor's line shows the stops before Save |
| 7 | Flexibility and Efficiency | 4 | arrows, Home and End on the native radio group, unchanged |
| 8 | Aesthetic and Minimalist Design | 4 | the Low to high row is the Right in the middle row with one word taken away, on screen and on paper; nothing was added |
| 9 | Error Recovery | 3 | a maker who typed long words can shorten them in the editor, but nothing tells them the pen or the paper went wrong |
| 10 | Help and Documentation | 3 | the stops line under Kind is the explanation of what each kind will draw; nothing says which end of "2 of 5" is which on the reading |
| **Total** | | **35/40** | **Good (87.5%)** |

Audit dimensions (the audit verb's own table): Accessibility 3, Performance 4, Theming 4, Responsive 3, Implementation integrity 4: 18/20.

## Design Specificity Verdict

**LLM assessment.** Pass. The phase is Sprinkles' existing grammar with one word removed: the Low to high track is the same five 44 × 44 stops on the same 216 px track with the same 13 px italic anchors, and "right" is simply absent, so the two end words stand under stops 1 and 5 (faint 984 to 1010.9, strong 1161.1 to 1200 on a track 984 to 1200). The printed row keeps its 36 px with an empty second line, so six rows stay on one rhythm. The read-back keeps the number in every form. Two tokens were added, both `--sheet-print-clipboard-drop*`, and no literal entered a stylesheet or a component.

**Deterministic scan.** Not run: `impeccable detect` is blind to `.jsx`. The Phase 12 diff of `print.css` and `app/src/ui` adds no px, rem, em, % or colour literal outside `var()` and `calc()` of tokens (grep of the added lines: no hit).

**Visual overlays.** Not injected; every figure below is a DOM read. WebKit and Chromium agree on every geometry that does not depend on the system font's metrics (stops, cells, print rows identical; anchors within 2.2 px; the long-word overruns 235 against 221 and 260 against 247 of 216).

## Overall Impression

With ordinary words the build is right as design, not only as drawn. On the pen at 1366 and 393 a Low to high scale is 350 (353) × 88, its five stops 44 × 44, the anchors row 216 × 16 at 13 px italic ink (18.42:1), "faint" flush under stop 1 and "strong" flush under stop 5, the 110 px between them empty; the group is named "Coffee flavour This recipe only" and its stops "1: faint", "2", "3", "4", "5: strong". Two Low to high scales together (Coffee flavour and Salt) are two equal 88 px marks 20 px apart, and nothing confuses one's bare "2" with the other's because each is inside its own named group. On the reading, "heavy (4)" and "2 of 5" sit in equal cells (165 × 37 at 1366, 157 × 37 at 768, 166.5 × 37 at 393) in one face (14/400, tabular figures, App text colour) under 12/600 caps labels; "3 of 5" beside "none (1)" reads the same way. The printed Low to high row is 36 px like its neighbours with nothing under its ticks. The log pages' picture starts 144 px down (48 + 96), 90 px of drop under WebKit's print media, with 13 and 4 notes lines. `scrollWidth` equals `innerWidth` at 1366, 768 and 393 in every state measured, the long-word case included. What a board check could not see is the long-word state: no board draws it, and there the pen's anchors and the printed row both fail in the same way for the same reason.

## What's Working

- **The stop names.** Accessibility tree, WebKit: `group "Coffee flavour This recipe only"` with `radio "1: faint"`, `radio "2"`, `radio "3"`, `radio "4"`, `radio "5: strong"`; the Right in the middle scale beside it keeps "1: thin", "2: leaning thin", "3: right", "4: leaning heavy", "5: heavy". The visible anchors row is `aria-hidden`, so the end words are heard once, on their stops. A bare "2" is never ambiguous because the group carries the scale's name and its cue.
- **Blank stays blank.** An unmarked scale shows its name alone: no "(n)", no Clear, no stop filled. The reading leaves an unmarked scale out, and drops the "Every recipe" cue when no core scale was marked (case `worstEnds`: one cue, "This recipe only").
- **No colour carries state.** The mark is told by the filled stop, the "(2)" beside the name and the Clear control; the read-back is words and a figure in the App text colour.
- **The read-back keeps its number.** "faint (1)", "2 of 5", "strong (5)" beside "heavy (4)": every form carries the stop, so the two grammars in one group share their one fact. Read aloud the reading is "Body heavy (4) Coffee flavour 2 of 5".
- **The editor's stops line (A1).** "faint · 2 · 3 · 4 · strong", 350 × 17, 14/400 grotesk, rgb(89, 89, 89) on white (7.0:1), 12 px under the Kind control; the same five-part line as "thin · leaning thin · right · leaning heavy · heavy" under the other kind. It stays on one line even with the long words (the other kind's wraps to 34 px).
- **Paper.** Every scale row 36 px; the Low to high row prints faint, 1, five ticks, 5, strong and an empty second line; six problems on one row at 104 to 727.9 of 774; the Batch log needs 790 of Safari's 810 (20 spare), the Tasting log 767.9 (42.1 spare).
- **Touch and width.** Stops 44 × 44 at 1366 and 393 (38 × 44 at 768, as before this phase); no horizontal scroll anywhere.

## Priority Issues

- **[P2] Long end words run together under the pen's track.** Measured (WebKit; `worst`): the Low to high scale's anchors row is 216 wide and its content 235 (Chromium 221): "barely there at all" 984 to 1089.1 and "overwhelmingly nutty" 1089.1 to 1218.7, 0 px between them and 18.7 px past the track's end, so the line reads "barely there at alloverwhelmingly nutty". The Right in the middle scale reads "too thin and sparserighttoo thick and gluey" (content 260 of 216, 0 px gaps, 44.1 px past). At 768 the track is 186 and the row ends 46.7 px outside its own 213.3 px mark. Same at 393. The page does not scroll sideways. **Why it matters:** the anchors are the only visible names of the ends (the stops show bare numbers), and `app.css` states their purpose, "the low/mid/high words sit under their own end/middle of the scale"; run together they name nothing. Cause, measured not read: `.axis-mark__anchors` is the track's fixed width, `white-space: nowrap`, `justify-content: space-between`, so the gap is whatever is left and reaches 0 when the two words pass 216 px (186 at 768), or 188 with "right" between them. Not drawn on any board; the three-word case is older than this phase, the two-word case is this phase's. **Fix:** the same decision as the next issue (limit the words where they are typed). **Suggested command:** /impeccable harden (through `/gsd-quick`).
- **[P2] The printed Tasting log with long words: the foot moves to a second sheet in Safari, and the low word crowds the name (Open Question 2).** Measured (`12-print-check.mjs worst` on this build, and this audit's page picture): need 827.8 px of Safari's 810 (17.8 over; Chrome's 864 leaves 36.2). Rows: 55 px (a three-line name), 40 px (a two-line name), problems 62.8 px on two lines; against case two that is +19, +4 and +36.9. The low word is right-aligned against the "1" and grows leftward: "barely there at all" spans 237.9 to 342, 16.1 px inside the name column (104 to 254), and "too thin and sparse" 24.1 px inside it; in the picture "BROWN BUTTER AND" and "barely" touch. The high word grows rightward into empty paper (it ends at 689.9 of 774; the scale grid uses 370 of its 508 px), so its 54 px overrun harms nothing. **Why it matters:** D-17 says each log stays one page, and "Side 2 of 2" on a third face breaks a sheet meant to be printed on two sides and clipped. **Fix:** Mark decides; options and the recommendation are under "What is wrong" below. **Suggested command:** /impeccable harden (through `/gsd-quick`).
- **[P3] "2 of 5" carries no end word on the reading.** Measured: the cell reads "Coffee flavour" over "2 of 5"; neither "faint" nor "strong" is on the reading unless the mark is at an end. The direction rests on the kind's own meaning (Low to high: more is more) and the scale's name. Mark chose this form from the read-back candidates (decide-p12-low-to-high-read-back, candidate A) and the board is approved: recorded, no change proposed. If a maker names a scale whose direction is not obvious, the pen and the paper still show both ends. **Suggested command:** none.

## Persona Red Flags

**Alex (Mark, tasting at the iPad):** marks Coffee flavour 2 without reading anything twice; the end words are where his thumb starts and stops. No red flag with his own words.

**Jordan (first recipe, writes sentences as end words):** types "barely there at all" and "overwhelmingly nutty", sees a tidy line in the editor, saves, and finds the pen's ends run into one string and the Tasting log's foot on another sheet. Nothing warned them.

**Sam (VoiceOver):** hears "Coffee flavour This recipe only, group; 1: faint, radio button, 1 of 5; 2, radio button, 2 of 5" (WebKit's tree; real VoiceOver speech not heard). The bare numbers are honest: those stops have no word.

## Minor Observations

- With a long name and a mark, "(2)" and Clear no longer fit the name's line: Clear drops to a second line and the mark grows from 88 to 108.2 px (name 291.4 px of 350). Tidy, not broken; it goes with the name limit.
- The editor's Name field clips "Brown butter and toasted pecan depth" at its right edge (seen in the picture, not measured). Phase 10's field; it goes with the name limit.
- On the reading a long name wraps its caption to two lines (cell 52 px at 1366 and 393, 67 px at 768; 87 px at 768 when the value wraps as well) and both cells of the row grow together. Fine.
- A Right in the middle scale reads "heavy (4)" and "heavy (5)": the number is all that separates stops 4 and 5. Older than this phase; the Low to high read-back avoids it by design.
- The note "For Sid" on section rhythm (2026-10-01) touches the pen's group cues. They now read the Group cue role (14/600, sentence case) over 12/600 caps captions; nothing in this phase changes them and nothing was done about the note.

## What is wrong, what the standard says, what fixes it

**Wrong, in plain words:** nothing limits how long a scale's name and end words can be, and the pen's anchors row and the printed scale row were both drawn for a word or two. Long words run together on the pen and push the Tasting log's foot to another sheet in Safari.

**The standard:** D-17 (each log stays one page); the anchors' own stated job (each word under its end); the Throw-for-caller-bugs, message-for-maker-input rule (a maker's too-long word is answered with a sentence in place).

**The decision (Mark's), with the measured basis:**

- **(a) Leave it.** Costs nothing. Mark's own words are short; the failure needs end words near 100 px (about 17 letters) each. The pen and the paper stay breakable by any imported or later recipe.
- **(b) Limit the words in the creation editor (recommended).** End words 12 characters, a scale's name 16, a problem 40, each refused at Save with a sentence under its field ("Keep it to 12 letters" is a placeholder; the words are Mark's). Basis: the print word column is 76 px and the measured words run 5.5 to 6.5 px a character, so 12 fits; two 12-character ends are about 156 px of the pen's narrowest track (186 at 768), 184 with "right" between; a 16-character name stays on one printed line (150 px column, about 8.6 px a caps character), so the only growth left is a second problems line (+36.9 of the 42.1 px spare) and the log always fits. One rule mends the pen, the printed crowding and the page count. Character counts are a stand-in for widths; the gate is `12-print-check.mjs worst` re-set to the longest allowed words and turned from REPORT into PASS, plus the pen's anchors measured with a gap of at least 6 px at 768.
- **(b2) The same, with names to 24.** Two printed lines per name (+4 each): two such names and a second problems line come to 44.9 of the 42.1 px spare, 2.8 px over in Safari, so the Tasting log's notes must give up a line (4 to 3) when that happens. More room for names, at the cost of layout by measurement on the log page.
- **(c) Mend the paper only.** Let end words wrap in their 76 px column and drop notes lines as rows grow. The pen still runs together; rows grow further.
- **(d) Widen the printed word columns.** The scale grid uses 370 of 508 px, so 138 px is free at the right. Changes sketch 010's approved row for every recipe, moves the track, and leaves the pen as it is.

Recommended: (b). A five-stop scale's end is a word, and the editor is where the maker can still choose a shorter one. Sketch first is not needed for the limits themselves; Sid draws the refused state (the sentence under Low end, High end and Name) on sketch 015 so the sketch stays the authority, then `/gsd-quick`.

**A1 (the editor's stops line, "faint · 2 · 3 · 4 · strong"): keep it.** It is the same five-part line as the other kind's, it shows what the pen will name ("1: faint, 2, 3, 4, 5: strong"), and it says the one thing "faint to strong" would not: that the middle has no words. "faint to strong" would repeat the Kind's own label, Low to high, and the two fields above it. Read aloud it is "faint, 2, 3, 4, strong". Not drawn on sketch 015 (CONTRACT: the editor's Scales "follow 12-CONTEXT D-01"); if Mark confirms, Sid draws the line into the sketch.

## Questions to Consider

- Should the read-back for a middle stop ever name an end ("2 of 5, toward faint"), or is the number alone what a maker wants when reading down a column of batches?
- Is 16 characters enough for the names Mark expects to give his own scales, or is the notes line worth giving up for 24?
- Should an imported recipe with words over the limit be refused, shortened, or shown as it is until edited?
