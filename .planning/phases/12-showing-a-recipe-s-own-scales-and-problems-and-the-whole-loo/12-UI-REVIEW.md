# Phase 12 UI review

Impeccable audit of the changed surface (project override of the generic 6-pillar audit). Advisory; does not block verify.

**Overall, both rounds: ships at the desk and on the iPad; one P1 on the phone to mend before the phone is relied on. Round one 35/40 (no P0, no P1; its two P2 were answered by Mark's limits of 2026-11-16, quick 261116-80u). Round two 30/40 (no P0, one P1, two P2, four P3). Nothing in either round is device-verified.**

- Round one (plans 12-01 to 12-08, audited 2026-11-16): source of truth `.impeccable/critique/2026-11-16T09-40-16Z__app-src-ui-axismark-jsx.md`. Its text follows unchanged.
- Round two (plans 12-09 to 12-16, audited 2026-11-22): source of truth `.impeccable/critique/2026-11-22T22-57-09Z__app-src-ui-recipelist-jsx.md`. Its section is at the end of this file.

# Round one (2026-11-16)

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

# Round two (2026-11-22)

Scope: plans 12-09 to 12-16 (commits 989f866a..5f6e2c30). Below 724: the Notebook, Home, the one-line desk page, More and the recipe page's head (PHONE-01). At 1366: Preview step in the version pen, and the creation editor's row controls, Add ingredient on a row and the keys lines (STRUCT-05). Design authority: sketch 016 and its CONTRACT. Round one's surface is not re-audited.

## Verdict

**Ships at the desk and on the iPad. On the phone, one P1. 30/40** (audit dimensions 17/20: Accessibility 3, Performance 4, Theming 4, Responsive 3, Implementation integrity 3). No P0. What sketch 016 drew is built right and reads right: the desk's jobs are absent below 724, not greyed; every control measured below 724 is 44 px high; nothing scrolls sideways at 393, 723 or 724; the step's two groups are told apart by the list line's middots alone; Tab walks the drawn order with a visible ring on every stop; the keys lines teach in one quiet sentence each. The P1 is in a state the boards did not draw: with a Next version draft kept, Home below 724 still offers a filled Record batch or Record tasting and "Go to draft", and the page they lead to refuses both without a word about recording. Two P2: the one-line page names the iPad on an iPad and is silent about kept work, and the picker opened from a row does not say where the pick lands. Blank stays blank and no colour carries state both pass. Both of the executor's flagged cases: leave as built, agreed.

Method: HEAD 5f6e2c30 built to a scratch `--outDir "$TMPDIR/sprinkles-12/dist-ui-review-2"` (app/dist and Mark's `vite preview` untouched; no Vite dev server), served on an ephemeral 127.0.0.1 port by `08-walk-server.mjs`, driven in Playwright WebKit with a coarse pointer at 393, 723 and 724 (the phone surfaces and the cut) and 1366 (the editor and the pen); the Home, editor and pen-close facets repeated in Chromium (system Chrome). Every state was made through the built app's own controls, except the kept edit beside another version's draft, which needed a second, stale tab. Real DOM only (`getBoundingClientRect`, `getComputedStyle`, `getClientRects`, `scrollWidth`, `document.activeElement`, the accessibility tree) and page pictures read by eye. `impeccable detect` not run: blind to `.jsx`, a null result. Board conformance not redone (`12-check.sh`: GATE2 PASS). **Nothing here is device-verified.**

## Findings, most severe first

### 1. P1 — Below 724 Home offers a record action, and "Go to draft", on a version whose page refuses both

- **Where:** `RecipeList.jsx` (Home's lead and rows), a version that holds a Next version draft, below 724.
- **Measured (WebKit 393 and 723; Chromium the same):** the lead shows "Draft open on this version · Go to draft" (link 70 × 44) and a filled Record batch (327 × 44). Record batch lands on the version's page: no pen, `scrollY` 0, the status region empty, the head reading "Draft: Version 2 · less cream. Finish it at the desk or on the iPad." and Print sheet alone. Go to draft lands on the same page; no draft opens. A row's filled Record tasting (353 × 44) on Mexican Chocolate v3 with a draft held lands on its batch address the same way: no pen, `scrollY` 0, no record control in the batch log. The same press on Coconut v2 (no draft) opens the tasting pen and scrolls to it (`scrollY` 2106).
- **Violates:** PHONE-01 and sketch 016 CONTRACT section 1 (a control that cannot act below 724 is left out of the page) with section 2 (Mark, `decide-p12-record-with-draft-held`, B: no record on the version that holds the draft). Recording is the phone's first job (PRODUCT.md, "On the phone"). "Draft open on this version" is untrue at this width.
- **Sketch status:** not drawn. CONTRACT section 3 draws Home for the seed, which holds no draft.
- **Fix:** Sid draws Home's lead and row at 393 for a version that holds a draft (no record action; the lead's line reads the head's own sentence, no link) on `notebook-home-more-393.html`; Mark approves; then `/gsd-quick` on `RecipeList.jsx` with a board spec beside `12-board-places.mjs`.
- **For Mark as well:** with a draft left open at the desk, the phone cannot record a batch of that version at all. That is decision B as written; the measured walk is the kitchen case.

### 2. P2 — The one-line page names the iPad on an iPad, and says nothing about kept work

- **Where:** `DeskOnly.jsx`, `Placeholder.jsx`; `/notebook/new` and a version's `/edit` below 724.
- **Measured (393 and 723):** title 34/800 (353 × 40), "Done at the desk or on the iPad." 14/400, rgb(89, 89, 89), one line (353 × 17); no control in `main`; the Notebook tab current (`aria-current="page"`, 78.6 × 55); focus on `body`. The page is the same with an edit or a new-recipe draft kept and with none. "Edit" names no recipe and offers no way back to the version, whose page works at this width.
- **Violates:** CONTRACT section 1 counts a narrow iPad window as phone width; half of a 1366-wide iPad screen is about 678 px (not measured on the device), so the sentence is shown on the device it names. CONTRACT section 11 number 5c promises nothing typed is lost when an open editor narrows; the build keeps it and the page does not say so, while the head does ("Edit kept.").
- **Sketch status:** drawn and approved for the phone, with or without a kept draft. The iPad-window case and a kept-draft sentence are not drawn.
- **Fix: Mark decides the words.** Sid draws two states on `one-line-page.html`: a draft kept (the head's own sentence and its like for a new recipe) and a sentence that is true in a narrow iPad window; then `/gsd-quick` (`DeskOnly.jsx` reads the kept draft and never writes it).

### 3. P2 — The picker opened from a row does not say where the pick lands

- **Where:** `CreationPage.jsx` and the picker, opened from a row's Add ingredient; 1366.
- **Measured (WebKit; Chromium within 3 px):** the picker opens under the table's Total, 483 px below the row's button; the page scrolls 759 px to bring the picker's Name to y 518 and the row's button is then 84 px above the window's top. The picker's heading reads "Add ingredient"; nothing in it names a row or a step. Pressing another row's Add ingredient moves the landing place with no visible change.
- **Violates:** D-09's own point (the pick lands after that row, in that step): the one fact that separates the row's button from the heading's is not on screen once the picker is open. Recognition rather than recall. CONTRACT section 9 records the scroll as not drawn.
- **Fix:** Sid draws the picker's heading with the landing place on `row-controls.html`'s picker panel (the words of the button's own name, "Add ingredient after Heavy cream, 36% fat"); then `/gsd-quick`.

### 4. P3 — The draft's name in the head's line is a 16.5 px high link below 724

- **Measured (393):** on another version's page, "Draft: Version 3 · less cream. Finish it at the desk or on the iPad."; the name is a link 141.5 × 16.5. Its page shows the same sentence as plain text, the pen shut, Print sheet alone.
- **Violates:** the 44 px floor below 760 (sketch findings); and the link leads to a page that offers less than the one it leaves.
- **Fix: Mark decides.** Plain text below 724, as on the draft's own page (reverses CONTRACT section 11 number 2), then `/gsd-fast`; or leave it.

### 5. P3 — The Notebook's draft row below 724 gives no reason

- **Measured (393, 723):** rail, "Chocolate" (24/700, plain text), "draft" (14/400, grey), nothing else; Resume (96 × 44) at 724.
- **Tension with:** the head's desk sentence for an edit and a Next version draft; a new recipe has no head, so the row reads as a recipe that cannot be opened. Drawn so and approved (CONTRACT section 3).
- **Fix:** none unless Mark asks; then Sid draws the words on `notebook-home-more-393.html` and it goes to `/gsd-fast`.

### 6. P3 — A row's controls sit beside a short name and under a long one

- **Measured (1366):** Dextrose's row is 44 px high with Add ingredient at x 235.4 on the name's line; rows with a chip or a longer name are 63.9 px high with it at x 160 under the name. The four controls are 295 px; before this round the three were about 193.
- **Tension with:** one list line down the table. The board draws it so.
- **Fix:** recorded. If Mark wants one column, Sid draws the controls always on their own line; `/gsd-fast`.

### 7. P3 — Preview step is the first stop in the pen and the fifth in the creation editor (recorded, no change proposed)

- **Measured:** from the instruction, 1 Tab in the pen, 5 in the creation editor; the pen's uses line still holds Change ingredients · Add purpose · Add aside.
- **Deliberate:** CONTRACT section 7 (the pen's open step is not regrouped). A later board regroups it; a phase plan then.

## The two cases sketch 016 does not draw (Mark's List decide rows, not touched)

- **`decide-p12-phone-focus-after-pen-close`: leave as built. Agreed.** Measured: pen opened at 1366, window narrowed to 393 (the pen stays), Cancel: the pen is gone, `document.activeElement` is `body`, `scrollY` 0, no jump; the next Tab lands on Rename in WebKit and on the Version fold in Chromium. At 1366 the same Cancel returns focus to Next version. A phone cannot make the case and the cost is two or three Tabs. If the iPad shows Tab lost from `body` in a narrow window, the mend needs no board: land on the version identity, which already takes focus on arrival.
- **`decide-p12-phone-two-kept-lines`: leave as built. Agreed.** The app's own controls cannot make the state in one tab (a kept edit takes Next version off its version; a version with a child cannot be edited); it took a stale second tab. In it: at 1366 and 724 the head shows "Draft: Version 3 · less cream" and Resume editing; at 393 "Edit kept. Finish it at the desk or on the iPad." (353 × 17) and Print sheet. The waiting draft is still named at 393 in the History fold and on its own version's page. The Edit kept line explains this page's missing record act, so it is the one to keep.

## Judged and held

- **The cut at 724.** At 723: Notebook head the title alone, no Resume, no Resume editing, tasted Home rows with no action, More without Import and Export. At 724: Resume (96 × 44), Resume editing (146.4 × 44), Next version (628 × 44), Import and Export in the header. `scrollWidth` equals `innerWidth` at 393, 723 and 724 on every page measured.
- **The head below 724.** Record another (145.9 × 44), Record tasting or Record batch (132 × 44), then Print sheet (73.6 × 44). Edit kept: one line (353 × 17, 14/400, rgb(89, 89, 89) on white, 7.0:1). Own held draft: two lines (353 × 34), Print sheet alone, no record control in the batch log.
- **More, open.** Ingredients, Kitchen, a hairline, Search; links 75.5 × 49; panel 101.5 × 186 on the tab row.
- **The keys lines teach without shouting.** 12/400 grotesk, ink on Sheet paper (17.16:1), 6 px above and below, one line each (510.1 and 426.3 px of 528 in WebKit; 487.7 and 408.6 in Chromium); absent in an empty region; smaller than the heading (14/600 caps) and the controls (13/400 underlined) and not underlined, so never read as a control.
- **Focus.** Every stop in the editor shows a 2 px solid ink ring at 2 px offset. From a row's grams, Add ingredient is 1 Tab. From Step 2's instruction: Add target 1, Add purpose 2, Change ingredients 3, Add aside 4, Preview step 5, Add step 6, Move up 7, Move down 8, Remove 9.
- **No colour carries state.** A Move that cannot act is grey, loses its underline and is `aria-disabled`; it stays a stop. Preview step and Hide preview carry the state in their words.
- **Preview step in the pen.** 77.5 × 44, 1 Tab from the instruction; the block (504 × 63, a 1 px ink rule at the left) follows typing and is gone after Done and after Cancel.
- **Touch.** Every control measured below 724 is 44 px high or more, except the draft-name link (finding 4). In the editor at 1366 every control is 44 px high; list-line gaps are 12.2 px on a row and 20.2 px on a step.
- **Theming.** `.mk-keys` reads three existing tokens; no literal added in the round's CSS.

## Minor observations (no work proposed)

- Done pressed by keyboard on the pen's open step leaves focus on `body`; Cancel returns it to Edit this step. Older than this round (12-11 kept Cancel's focus); for Sarge to triage as a bug row if Mark wants it.
- Preview step carries no `aria-expanded`.
- The controls' names mix two grammars ("Step 1, Add target" beside "Step 1, add purpose"; "Move up, Heavy cream" beside "remove Heavy cream"). Heard only.
- A new two-field step is 298 px high: 94 px of fields and four 44 px control lines. Drawn so.
- The keys lines show on an iPad with no keyboard attached.
- "Done at the desk or on the iPad." under "Edit" can be read as "the edit is done". Mark's chosen words.

## Not checked (only a device can confirm)

- Mark's iPhone: the tab row and More under Safari's own bars, the 44 px targets under a thumb, Home's dead record action as it feels in the hand.
- Mark's iPad: the width of a half-screen window (about 678 px assumed) and what the one-line page shows there; Tab from `body` after a pen closes in a narrow window; Cmd+Return, Ctrl+Return and Ctrl+Cmd+Up and Down on the Magic Keyboard with the caret kept (PROOF-02's rows); the keys lines with no keyboard attached; where the page scrolls when the picker opens from a row with the on-screen keyboard up.
- VoiceOver's speech of `aria-keyshortcuts` and of the swapped Preview step words; forced colours; larger text settings (the Ingredients keys line has 17.9 px to spare).
- Not measured here: the Edit address for a version that can no longer be edited, the empty Notebook below 724, and a tasted Home lead (Adapt alone); the board specs and unit tests cover them.

## For Mark

1. Finding 1: approve drawing Home with a held draft at 393 (no record action, no Go to draft), and say whether decision B still stands for the kitchen case.
2. Finding 2: the one-line page's words in a narrow iPad window and with a draft kept.
3. Finding 3: the picker's heading names where the pick lands.
4. Finding 4: the draft's name as plain text below 724, or leave the link.
5. The two decide rows: leave as built, both.
