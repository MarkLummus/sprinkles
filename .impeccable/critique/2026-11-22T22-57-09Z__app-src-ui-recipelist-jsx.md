---
target: Phase 12 round-two surface (plans 12-09 to 12-16) — the phone arrangement below 724 (Notebook, Home, the one-line desk page, More, the recipe page's head), Preview step in the version pen (1366), and the creation editor's row controls, Add ingredient on a row and the keys lines (1366)
total_score: 30
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 1
target_identity: "file:/Users/mark/Documents/projects/sprinkles/app/src/ui/RecipeList.jsx"
target_fingerprint: "sha256:c61112c7c3996463ea947d7fb0becd259e00b188cd2ea695f5d4c0ee707f0b4f"
target_path: /Users/mark/Documents/projects/sprinkles/app/src/ui/RecipeList.jsx
timestamp: 2026-11-22T22-57-09Z
slug: app-src-ui-recipelist-jsx
---
⚠️ DEGRADED: single-context (the measured review and the judgement were made in one context; `impeccable detect` was not run because it is blind to JSX and a null result is not a pass).

Method: live audit of a scratch production build (HEAD 5f6e2c30, `vite build --outDir "$TMPDIR/sprinkles-12/dist-ui-review-2"`; app/dist and Mark's `vite preview` untouched, no Vite dev server), served on an ephemeral 127.0.0.1 port by `08-walk-server.mjs`, driven in Playwright WebKit with a coarse pointer at 393, 723 and 724 (Notebook, Home, the two editor addresses, More, the recipe page's head) and at 1366 (the creation editor and the version pen). The Home, editor and pen-close facets were repeated in Chromium (system Chrome). Every state was made through the built app's own controls: recipes saved in the creation editor, edits and Next version drafts kept by typing and waiting past the debounce, the seed's Olive Oil v1 (tasted), Mexican Chocolate v3 (awaiting tasting) and Underbelly Light Base v2 (not churned). The one state the app's controls cannot reach in one tab (an edit kept on a version while another version holds a draft) was made with a second, stale tab. Real DOM only: `getBoundingClientRect`, `getComputedStyle`, `getClientRects`, `scrollWidth`, `document.activeElement`, the accessibility tree (`ariaSnapshot`), and page pictures read by eye. Board conformance was not redone (`12-check.sh` ends GATE2 PASS against sketch 016). Nothing here is device-verified.

Scope: `NotebookPlace.jsx`, `RecipeList.jsx`, `DeskOnly.jsx`, `Placeholder.jsx`, `Shell.jsx`, `VersionRow.jsx`, `RecipePage.jsx` below 724; `Method.jsx` (Preview step in the pen); `CreationSteps.jsx`, `CreationPage.jsx`, `IngredientTable.jsx`, `editorKeys.js`, `notebook.css` (`.mk-keys`). Round one (the Low to high scale, the printed logs) is not re-audited; snapshot `2026-11-16T09-40-16Z__app-src-ui-axismark-jsx.md` stands.

The target file is `RecipeList.jsx` because the one P1 is fixed there; this snapshot self-closes when that file changes.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 2 | Home's filled Record batch and Record tasting land on a head with Print sheet alone and nothing says why; the one-line page says nothing about work that is kept |
| 2 | Match System / Real World | 3 | the words are plain and short; "at the desk or on the iPad" is also shown on an iPad in a half-width window |
| 3 | User Control and Freedom | 3 | Cancel first everywhere; a draft kept at the desk cannot be finished or put away from the phone (Mark's decision B) |
| 4 | Consistency and Standards | 3 | Home still offers what the head leaves out; Preview step is the first stop in the pen and the fifth in the creation editor |
| 5 | Error Prevention | 3 | the desk's jobs are left out, not greyed; a stale picker anchor falls back safely |
| 6 | Recognition Rather Than Recall | 3 | the picker opened from a row does not say where the pick will land, and that row is scrolled out of view |
| 7 | Flexibility and Efficiency | 4 | Cmd+Return, Ctrl+Return, Ctrl+Cmd+Up and Down, `aria-keyshortcuts`, Add ingredient on every row |
| 8 | Aesthetic and Minimalist Design | 3 | the keys line is quiet; a new two-field step is 94 px of fields and four 44 px control lines |
| 9 | Error Recovery | 3 | nothing typed is lost across the cut; the phone gives no way on from a held draft but the desk |
| 10 | Help and Documentation | 3 | one line under each heading teaches the keys; the desk lines say where, not what is blocked |
| **Total** | | **30/40** | **Good (75%)** |

Audit dimensions: Accessibility 3, Performance 4, Theming 4, Responsive 3, Implementation integrity 3: 17/20.

## Design Specificity Verdict

**LLM assessment.** Pass. Round two adds no new shape. The phone arrangement is subtraction: the desk's controls are absent from the markup, never greyed. The desk page is the built placeholder place. The keys line is one 12 px grotesk sentence from three existing tokens. Add ingredient on a row is one more `text-control` in the row's middot-separated list line. The preview in the pen is the creation editor's own block.

**Deterministic scan.** Not run: `impeccable detect` is blind to `.jsx`. The round-two CSS diff is 12 added lines in `notebook.css` and `shell.css`; `.mk-keys` reads `--face-grotesk`, `--sheet-size-cross-flag` and `--gap-xs`, and no px, rem, em, % or colour literal was added outside `var()`.

**Visual overlays.** Not injected; every figure is a DOM read. WebKit and Chromium agree on every behaviour reported; text widths differ by the system font's metrics (the Ingredients keys line 510.1 px in WebKit, 487.7 in Chromium).

## Overall Impression

At the desk and on the iPad the round is right as design. The step's controls read as two groups without a box or a label: the step's own lines carry no separators, the list line carries middots (Add step · Move up · Move down · Remove), and the ingredient row's list line uses the same grammar. Tab walks them in the drawn order with a 2 px ink ring at 2 px offset on every stop. The keys lines teach in one sentence each and do not shout. Preview step in the pen follows typing and closes with the step.

On the phone, the pages that were drawn hold: every control is 44 px high, nothing scrolls sideways at 393, 723 or 724, and the cut is clean (Resume, Resume editing, New recipe, Next version, Edit, Import and Export all appear at 724 and are absent at 723). What the boards did not draw is where it fails: Home was drawn for a seed with no draft kept, and with one kept it offers a filled record action that the recipe page refuses.

## What's Working

- **The cut.** At 723 the Notebook head is the title alone, the draft row has no Resume, the recipe with an edit kept is class `nb__row` with no Resume editing; at 724 Resume (96 × 44) and Resume editing (146.4 × 44) are back. Home's tasted rows have no action at 723 and Next version (628 × 44) at 724. `scrollWidth` equals `innerWidth` at 393, 723 and 724 on every page measured.
- **The head below 724.** Tasted: Record another (145.9 × 44, filled) then Print sheet (73.6 × 44). Awaiting: Record tasting. Not churned or editable: Record batch (132 × 44). Edit kept: "Edit kept. Finish it at the desk or on the iPad." on one line (353 × 17, 14/400, rgb(89, 89, 89) on white, 7.0:1) and Print sheet alone. Own held draft: "Draft: Version 3 · less cream. Finish it at the desk or on the iPad." on two lines (353 × 34), Print sheet alone, and the batch log draws no record control.
- **More, open.** Ingredients, Kitchen, a hairline, Search: three links 75.5 × 49 in a panel 101.5 × 186 that sits on the tab row; the group's tree is `link "Ingredients"`, `link "Kitchen"`, `link "Search"`. Import and Export are in the header at 724 (108.4 × 44, 108.2 × 44).
- **The row controls.** After the grams: Add ingredient (88.8 × 44), Move up (51.7 × 44), Move down (69 × 44), Remove (48.2 × 44), 12.2 px apart with a middot in each gap; Add to step first under "Not in a step yet". From a row's grams, Tab lands on Add ingredient in 1. A Move that cannot act is rgb(89, 89, 89), not underlined, `aria-disabled`, still a stop: the state is carried by the missing underline and the attribute, not by colour alone.
- **The step.** From Step 2's instruction, Tab: Add target 1, Add purpose 2, Change ingredients 3, Add aside 4, Preview step 5, Add step 6, Move up 7, Move down 8, Remove 9; the contract's table exactly. Every stop shows `outline: solid 2px rgb(20, 20, 20)`, offset 2 px, `:focus-visible` true.
- **The keys lines.** 12/400 grotesk, ink on Sheet paper (17.16:1), 6 px under the heading row and 6 px above the table or the steps, one line each (510.1 and 426.3 px of 528 in WebKit). Absent in an empty region, present while the picker is open. Smaller than the heading (14/600 caps, bookcloth green) and the controls (13/400 underlined), not underlined, so it reads as a caption and is never mistaken for a control. `aria-keyshortcuts` is on Add step, Add ingredient, Move up and Move down and nowhere else.
- **Preview step in the pen.** One line under the two fields (77.5 × 44), 1 Tab from the instruction; pressed it reads Hide preview and `group "Step 1, preview"` stands under it (504 × 63, a 1 px ink rule at the left, 12 px padding, cue "Preview" 12/500 caps). It follows typing ("Steep. Changed while the preview is open.") and is gone after Done and after Cancel; reopened, the step starts with the preview shut.
- **Theming.** No literal added.

## Priority Issues

- **[P1] Below 724 Home offers a record action, and "Go to draft", on a version whose page refuses both.** Measured (WebKit 393 and 723; Chromium the same). A version that holds a Next version draft is Home's lead: "Draft open on this version · Go to draft" (the link 70 × 44) and a filled Record batch (327 × 44). Pressing Record batch lands on the version's page with no pen, `scrollY` 0, an empty status region, the head reading "Draft: Version 2 · less cream. Finish it at the desk or on the iPad." and Print sheet alone. Go to draft lands on the same page: no draft opens. A Home row's filled Record tasting (353 × 44) on Mexican Chocolate v3 with a draft held lands on its batch address the same way: no pen, `scrollY` 0, the batch log with no record control. The same press on Coconut v2, which holds no draft, opens the tasting pen and scrolls to it (`scrollY` 2106). **Why it matters:** PHONE-01 and sketch 016 CONTRACT section 1 say a control that cannot act below 724 is left out of the page, not left to fail; section 2 (Mark, `decide-p12-record-with-draft-held`, B) takes Record away on the version that holds the draft, and Home was not drawn in that state (section 3 draws the seed, which has no draft). Recording is the phone's first job (PRODUCT.md, "On the phone"); here the largest control on the phone's first screen does nothing, and the only clue is a 14 px grey line whose words are about the draft, not about recording. "Draft open on this version" is also untrue at this width: the draft stays shut. **Fix:** Sid draws Home's lead and row at 393 for a version that holds a draft (no record action; the lead's line reads the head's own sentence with no link), Mark approves, then `/gsd-quick` on `RecipeList.jsx`. **Suggested command:** sketch 016 board first, then `/gsd-quick`.
- **[P2] The one-line page names the iPad on an iPad, and says nothing about kept work.** Measured: `/notebook/new` and a version's `/edit` at 393 and 723 show the title (34/800, 353 × 40) and "Done at the desk or on the iPad." (14/400, rgb(89, 89, 89), one line, 353 × 17), no control in `main`, the Notebook tab current (`aria-current="page"`, 78.6 × 55); focus rests on `body`. The page is the same with an edit or a new-recipe draft kept and with none. "Edit" names no recipe and gives no way back to the version, whose page works at this width. **Why it matters:** CONTRACT section 1 counts a narrow iPad window as phone width. Half of a 1366-wide iPad screen is about 678 px (not measured on the device), below 724, so a maker on the iPad is told the job is done "on the iPad". And CONTRACT section 11 number 5c promises nothing typed is lost when an open editor narrows; the build keeps that promise (12-09's crossing probe) but the page does not say so, while the recipe page's head does ("Edit kept."). A maker whose editor just became one grey line has no sign the work is safe. **Fix:** Mark decides the words (his row `decide-p12-desk-page-words` chose A for the phone case). Sid draws two states on `one-line-page.html`: a draft kept (the head's own sentence, "Edit kept. Finish it at the desk or on the iPad.", and its like for a new recipe), and a sentence that is true in a narrow iPad window. Then `/gsd-quick` (`DeskOnly.jsx` reads the kept draft without touching it). **Suggested command:** sketch first, then `/gsd-quick`.
- **[P2] The picker opened from a row does not say where the pick lands.** Measured (1366, WebKit; Chromium within 3 px): Add ingredient on Heavy cream's row opens the picker under the table's Total, 483 px below the button; the page scrolls 759 px to bring the picker's Name to y 518 and the row's button is then 84 px above the top of the window. The picker's heading reads "Add ingredient" and nothing else in it names a row or a step. Pressing another row's Add ingredient moves the landing place with no visible change. **Why it matters:** the row's button is the whole reason for D-09 (the pick lands after that row, in that step), and the one fact that makes it different from the heading's button is on screen nowhere once the picker has opened. The button's own name already says it ("Add ingredient after Heavy cream, 36% fat"). CONTRACT section 9 records that where the page scrolls to "is not drawn". **Fix:** Sid draws the picker's heading with the landing place on `row-controls.html`'s picker panel (the words of the button's name; the heading's own button keeps "Add ingredient"), then `/gsd-quick`. **Suggested command:** sketch first, then `/gsd-quick`.
- **[P3] The draft's name in the head's line is a 16.5 px high link below 724.** Measured at 393: on another version's page the line reads "Draft: Version 3 · less cream. Finish it at the desk or on the iPad." with the name a link 141.5 × 16.5 on the first of two lines. Its page shows the same sentence as plain text, the pen shut and Print sheet alone. **Why it matters:** the 44 px floor below 760 (sketch findings), and the link leads to a page that offers less than the one it leaves. **Fix:** Mark decides: plain text below 724, as the draft's own page has it (reverses CONTRACT section 11 number 2), or leave it. If changed: `/gsd-fast`. **Suggested command:** `/gsd-fast` after Mark's answer.
- **[P3] The Notebook's draft row below 724 is the one kept thing with no reason.** Measured at 393 and 723: rail, "Chocolate" (24/700, plain text, not a link), "draft" (14/400, rgb(89, 89, 89)), nothing else; at 724 Resume (96 × 44) stands under it. **Why it matters:** an edit and a Next version draft both get the desk sentence on the recipe page's head; a new recipe has no head, so its row is where the sentence would go, and without it the row reads as a recipe that cannot be opened. Drawn so and approved (CONTRACT section 3). **Fix:** Sid draws the row with the words on `notebook-home-more-393.html` if Mark wants it; then `/gsd-fast`. **Suggested command:** none until Mark asks.
- **[P3] A row's controls sit beside a short name and under a long one.** Measured (1366): Dextrose's row is 44 px high with Add ingredient starting at x 235.4, on the name's line; the rows with a chip or a longer name are 63.9 px high with it at x 160, under the name. Before this round the three controls were about 193 px and shared the name's line more often; with Add ingredient they are 295 px. **Why it matters:** the row pitch and the controls' left edge change with the name's length, so the list line does not read as one column down the table. The board draws it so. **Fix:** recorded; if Mark wants one column, Sid draws the controls always on their own line and it goes to `/gsd-fast`. **Suggested command:** none.
- **[P3] Preview step is the first stop in the pen and the fifth in the creation editor.** Measured: from the instruction, 1 Tab in the pen, 5 in the creation editor; the pen's uses line still holds Change ingredients · Add purpose · Add aside, which the creation editor now splits over three lines. **Why it matters:** the same step is edited in two places with two orders. Deliberate: CONTRACT section 7 says the pen's open step is not regrouped. **Fix:** none in this phase; a later board regroups the pen's open step. **Suggested command:** none.

## The two cases sketch 016 does not draw

**Focus after a Next version pen closes below 724: leave as built. Agreed.** Measured: the pen opened at 1366, the window narrowed to 393 (the pen stays, as CONTRACT section 11 number 5b says), Cancel pressed: the pen is gone, the head reads Record batch and Print sheet, `document.activeElement` is `body`, `scrollY` 0, no jump. The next Tab lands on Rename in WebKit and on the Version fold in Chromium (measured); by the head's order the record act is then the third and the second stop (read from the DOM order, not walked). At 1366 the same Cancel returns focus to Next version. The case needs a pen opened wide and closed narrow, a phone cannot make it, and the cost is two or three Tabs with the page where it was. If Mark's iPad shows Tab lost from `body` in a narrow window, the mend needs no board: land on the version identity, which already takes focus on arrival (`is-landing-focus`).

**A kept edit with another version's draft waiting shows one line: leave as built. Agreed.** The app's own controls cannot make this state in one tab: an edit kept on a version takes Next version off it, and a version with a child cannot be edited. It took a second, stale tab. Measured in that state: at 1366 and 724 the head shows "Draft: Version 3 · less cream" (a link) and Resume editing; at 393 it shows "Edit kept. Finish it at the desk or on the iPad." (one line, 353 × 17) and Print sheet. The waiting draft is still named at 393 in the History fold ("Version 3 · less cream", "22 Nov · draft") and on its own version's page, which carries its own Draft line. The Edit kept line is the one that explains this page's missing record act, so it is the right one to keep.

## Persona Red Flags

**Alex (Mark, in the kitchen with the phone, a Next version draft left open at the desk):** opens Home, presses Record batch, lands on a page with Print sheet and a grey line about a draft. Presses back, presses it again. Nothing on the phone records this batch until he is at the desk.

**Jordan (iPad, the app beside a browser at half width):** opens New recipe from a bookmark and reads "Done at the desk or on the iPad." on the iPad.

**Sam (keyboard):** in the editor every stop has its ring and the order is the drawn one. In the picker opened from a row, nothing spoken or shown says where the pick will go.

## Minor Observations

- Done pressed by keyboard on the pen's open step leaves focus on `body` (WebKit, 1366); Cancel returns it to Edit this step. Older than this round (12-11 kept Cancel's focus and did not touch Done).
- Preview step and Hide preview swap their words and carry no `aria-expanded`; the words carry the state.
- The step and row controls' names mix two grammars: "Step 1, Add target", "Step 1, Preview step", "Step 1, Add step after it" beside "Step 1, add purpose", "Step 1, move up", "Step 1, remove"; "Move up, Heavy cream, 36% fat" beside "remove Heavy cream, 36% fat". Heard only.
- A new two-field step is 298 px high: 94 px of fields and four control lines of 44 px. Drawn so; the two groups are told apart by the list line's middots.
- The list line's controls are 12.2 px apart on a row and 20.2 px apart on a step.
- The keys lines show on an iPad with no keyboard attached. One 15 px line each.
- The Ingredients keys line has 17.9 px to spare in WebKit (510.1 of 528); at a larger text setting it wraps to two lines, which harms nothing.
- "Done at the desk or on the iPad." under "Edit" can be read as "the edit is done"; Done is also the control that closes a step. Mark's chosen words.
- On Home below 724 a lead whose version has an edit kept shows its name and "Version 1" and no action, at 724 as well. As built before this round.
- The note "For Sid" on section rhythm (2026-10-01) is about the batch pen's group cues; nothing in this round touches it.

## Questions to Consider

- With a draft left open at the desk, should the phone really be unable to record a batch of that version (decision B), or was B chosen for the head without Home and the kitchen in view?
- Should the one-line page say what the window needs (more width) instead of which device?
- Is Add ingredient on every row worth 89 px of every row's list line, or does it belong only on the last row of each step?
