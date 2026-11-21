# Sketch 016: structural contract

Read with the files themselves. Their markup and inlined CSS are the authority; this note names what they hold so a planner, a checker and UAT cite one source. Mark approved the boards on 2026-11-21 (his answers, by row, are in `README.md`). This is the build contract for round two of Phase 12 (12-CONTEXT D-06); the iPad Tab walk (D-11) runs once, on the order in section 5.

Targets: `recipe-head-below-724.html`, `notebook-home-more-393.html`, `one-line-page.html` (its "The page" row), `pen-preview-step.html`, `row-controls.html`. Records of choices, not targets: `one-line-page.html`'s "Three wordings" row (A chosen; B and C not), `add-step-place.html` (A chosen; its step group order is the first drawing's and is not built from).

Figures are Playwright WebKit with a coarse pointer, checked in Chrome. Every panel is the built app's markup (`app/dist` of 2026-11-16) with only the changes below drawn over it, so anything not named here is as built (`canvas-generators/p12g2-measure.mjs` prints the comparison). On each board the "As built" panels are for comparison and are not targets. Purple numbers and tags are notes, not in the app.

## 1. What "below 724" means

- Phone width is below 724, the app's one phone cut (`(max-width: 723.98px)`), a narrow iPad split view included (PRODUCT.md, "On the phone").
- The controls named in sections 2 and 3 are left out of the page there: not greyed, not hidden behind a disclosure. From 724 up nothing in sections 2 to 4 changes.
- Home's own layout cut is 760; the controls still go at 724.

## 2. The recipe page's head below 724 (`recipe-head-below-724.html`)

- The band's acts row (`div.notebook-version__acts`) holds, in order: one filled control (`button.notebook-action`), the record act the version waits on (Record another, Record tasting or Record batch, as built), then Print sheet (`a.notebook-link`). No Next version, no Edit, no Resume editing. Drawn for the three standings at 393 and for a tasted version at 723.
- A version that can be edited reads as any not yet churned version: Record batch, Print sheet.
- A version with an edit kept: the acts row holds Print sheet alone (the build already leaves the record act and Next version out while an edit is kept), and one line stands under the version identity, in the built draft line's place and role (`p.notebook-version__draft`, after `h2.notebook-version__identity`): "Edit kept. Finish it at the desk or on the iPad." Plain text, no link. One line at 393 (353 wide, 14 px).
- A version with a Next version draft kept: the pen does not open (today it reopens there at 393). The band stays in its reading form with one line in the same place and role: "Draft: Version 2 · less cream. Finish it at the desk or on the iPad.", that is "Draft: ", the waiting draft's name as the build already words it (the next ordinal, then the typed version name), then ". Finish it at the desk or on the iPad." Plain text, no link. Two lines at 393. The acts row holds Print sheet alone: no record act while the draft is kept (Mark, `decide-p12-record-with-draft-held`, B, 2026-11-21: "Leave Record out while a draft is kept. The head shows Print sheet and the Draft line only; no tasting on that version from the phone until the draft is finished or cancelled at the desk."). It is the same head as a version with an edit kept, with the Draft line in place of the Edit kept line.
- Which version loses Record: the one that holds the kept draft, that is, the version the draft was opened on, whose page shows the plain Draft line. Another version of the same recipe, whose band shows the Draft line as a link (section 11, number 2), keeps its record act: the drafts store holds one record per version, so a batch or tasting recorded on another version does not touch the kept draft (`12-RESEARCH.md`, Pitfall 5 and Open Question 1).
- Unchanged: Rename, the Version fold, Go to batch, History, Show changes at the Ingredients head, the Sheet, the batch log and its pen.
- No sideways overflow at 393 or 723.

## 3. Notebook, Home and More at 393 (`notebook-home-more-393.html`)

- Notebook: no New recipe beside the title (`div.nb__head` holds the title alone). The count and the list are as built.
- Notebook with a kept new-recipe draft: the draft's row (`li.nb__draft`: rail, name as `h2.nb__name`, "draft") stands first, above the count, as built, without its Resume (`span.nb__draft-act` is not in the markup). Its name is not a link, as built.
- Home, a row: a tasted recipe's row has no action below 724: its whole `span.home__actions` is not in the markup, Next version and Adapt both (the approved board draws it so; the build already hides a row's second action, Adapt, at this width, so Next version is the only thing a maker sees go). The row reads place, name, standing. Rows whose action is Record tasting or Record batch are as built.
- Home, the lead block: the board draws the seed's lead, which awaits a tasting (Record tasting, Keep developing), as built. A tasted lead is not drawn; the approved board's caption says it loses Next version the same way and keeps Adapt, which only opens the recipe page, so a tasted lead below 724 holds Adapt alone. (Corrected 2026-11-21 after the round-two research, question 3: this bullet first said "Keep developing and Adapt … are as built" for rows and lead alike, which disagreed with the drawn row.)
- More, open: Ingredients, Kitchen, the hairline, Search. No Import, no Export. The panel still sits on the tab row, as built.

## 4. The one-line page (`one-line-page.html`)

- Below 724 the New recipe address (`/notebook/new`) and a version's Edit address (`…/edit`) show this page in place of the editor, with or without a kept draft; a kept draft is not touched.
- It is the built placeholder place's markup inside the shell: `div.list-page.place > h1.place__title + p.place__note`. The title names the job: "New recipe", "Edit". The line, for both: "Done at the desk or on the iPad." (Mark, `decide-p12-desk-page-words`, A). One line at 393.
- No control on the page; the tab row is the way out (the Notebook tab reads as current on the board).
- Next version has no address of its own; its kept draft is section 2's band line.

## 5. The creation editor's row controls (`row-controls.html`; 1366 only)

A step's operations are two groups, kept together (Mark, 2026-11-21).

**The step's own group**, in Tab order (`li.method-step.mk-step`):
1. lead-in, then instruction (as built);
2. the target line (`p.method-step__targets`): each written target's chip (label, value, its Remove), then Add target, then Add purpose while no purpose is written;
3. the purpose field, when written (as built markup, in this place);
4. the uses line (`p.method-step__uses-line`): "uses …" and Change ingredients only; the Uses checklist, when open, follows it as built;
5. the aside field, when written (moved: the build has it above the uses line);
6. the group's last line (a second `p.method-step__targets`): Add aside while no aside is written, then Preview step. Preview step is always the group's last stop. Pressed, it reads Hide preview and the preview block (`div.mk-preview`, as built) stands under this line, above the list line.

**The list group**, the step's last line (`p.method-step__acts`): Add step · Move up · Move down · Remove. Remove is the step's last stop. A Move that cannot act stays `.mk-off`, `aria-disabled` and a Tab stop, as built.

What moved against the build: Add purpose (from the uses line to the target line), Add aside and Preview step (to their own line under the uses line), the written aside (below the uses line), the open preview (under Preview step), and the list line's order (Add step first, Remove last).

**An ingredient row**, the same two groups (`span.mk-row-acts`): after the grams, Add to step when the row is under "Not in a step yet" (as built), then Add ingredient · Move up · Move down · Remove.

**Add ingredient on a row** (D-09; `data-act="add-ingredient"`, aria-label "Add ingredient after <row>"): opens the built picker in its built place, under the table's Total; the heading's Add ingredient is away while it is open, as built. The picked ingredient lands right after that row: in the same step group and ticked in that step's Uses, or after it and in no step under "Not in a step yet". Focus goes to the new row's grams, as the build does after any pick. The heading's Add ingredient stays and still adds a row in no step.

**Tab counts** (the board's numbers; Tab walked on the board markup lands on them in order in WebKit and in Chrome). The two regions with two new steps: 45 stops (built 41). From a step's instruction:

| To | New step | Step with a target, purpose and aside written |
|----|----------|-----------------------------------------------|
| target (Add target, or the target's label) | 1 | 1 |
| aside (Add aside, or its field) | 4 | 7 |
| Preview step | 5 | 8 |
| Add step | 6 | 9 |
| Remove | 9 | 12 |

From a row's grams to Add ingredient: 1 on a row in a step, 2 on a row in no step.

## 6. Keys (`row-controls.html`)

- In any text field inside a step (lead-in, instruction, purpose, aside, a target's label and value; Mark, `look-p12-round-two-details`, number 8): Cmd+Return does what the step's Add step does (a new step after it, focus in the new step's lead-in; nothing is typed into the field); Ctrl+Return does the same. Ctrl+Cmd+Up and Ctrl+Cmd+Down do what its Move up and Move down do, with the same announcement the buttons give today ("Step 2 of 2": the step's new place of the count). At the ends (up on the first step, down on the last) the key does nothing and says nothing, as a greyed Move does today.
- After a keyed move the caret stays where it was, in the same field of the moved step, whichever of those fields it was in. Fields outside a step (Recipe name, Recipe description, Version name, the picker's Name, the targets and scales beside the Sheet) get no key.
- In a row's grams: Cmd+Return does what the row's Add ingredient does (the picker opens; the pick lands after that row); Ctrl+Cmd+Up and Ctrl+Cmd+Down move the row within its own step group, the Move buttons' limits and announcement as built ("Heavy cream, 36% fat, row 2 of 2 in step 1"), the caret staying in the grams.
- Remove has no key.
- Cmd+arrow, Option+arrow and Shift+Cmd+arrow keep their own work in the text (caret and selection); that conflict, not availability on the iPad, is why move is Ctrl+Cmd.
- The buttons carry `aria-keyshortcuts`: Add step and Add ingredient "Meta+Enter Control+Enter"; Move up "Control+Meta+ArrowUp"; Move down "Control+Meta+ArrowDown".
- How the maker learns them: one line of words under each region's heading row, once (`p.mk-keys`, a proposed class from existing tokens only: `--face-grotesk`, `--sheet-size-cross-flag`, `--gap-xs` above and below). Under Instructions: "In a step: Cmd+Return adds a step after it. Ctrl+Cmd+Up or Down moves it." Under Ingredients: "In a row's grams: Cmd+Return adds an ingredient after it. Ctrl+Cmd+Up or Down moves it." No words are added to a step's or a row's own lines.

## 7. Preview step in the version pen (`pen-preview-step.html`; 1366 only)

- The pen's open step (Next version, "Edit this step") gains one line under its two fields and before its uses line: `p.method-step__targets` holding Preview step alone (aria-label "Step n, Preview step"). Tab reaches it after the instruction and before Change ingredients.
- Pressed, it reads Hide preview and the creation editor's own preview block (`div.mk-preview`, role group "Step n, preview") stands under it, showing the step as it will read from what is typed.
- Cancel and Done are unchanged; either closes the preview with the step.
- Not in scope and unchanged: the pen's open step has no Add target; steps cannot be reordered in the pen.
- The pen's open step is not regrouped by section 5; that section is the creation editor's.

## 8. Words

Done at the desk or on the iPad. · New recipe · Edit · Edit kept. Finish it at the desk or on the iPad. · Draft: <draft name>. Finish it at the desk or on the iPad. · Add ingredient · Preview step · Hide preview · In a step: Cmd+Return adds a step after it. Ctrl+Cmd+Up or Down moves it. · In a row's grams: Cmd+Return adds an ingredient after it. Ctrl+Cmd+Up or Down moves it. Every other word on the boards is the build's.

## 9. Open build facts (drawn or stated, not settled by the boards)

- **The caret after a keyed move is drawn, not built.** Today the Move buttons keep focus on the button (the other Move when the pressed one turns off). Keeping the caret in its field, at its place, after Ctrl+Cmd+Up or Down is new behaviour with no built precedent in the app.
- **The open preview on `row-controls.html` does not show a target or an aside.** Its block is the build's preview of a two-field step, placed where section 5 puts it. What the preview shows for a step with a target, purpose or aside is the build's own preview and is not drawn here.
- **The Uses checklist is not drawn open** on the redrawn step. It follows the uses line as built; its place in the Tab order (after Change ingredients, which reads Done while open) is stated, not measured on the board.
- **Keys on a keyboard with no Cmd key are not drawn and not decided**, beyond Ctrl+Return for add.
- **Recording while a Next version draft is held below 724: settled by Mark** (`decide-p12-record-with-draft-held`, B, 2026-11-21): Record is left out on the version that holds the draft (section 2). The board draws the head only. Not drawn, and flagged for the plan: the batch log lower on the same page has record acts of its own (Record batch, Record another, Correct, the tasting); for his answer to hold ("no tasting on that version from the phone") they go too on that version below 724, as the build already does on a version with an edit kept.
- **The picker opens under the table's Total also from a row** (confirmed by Mark). On a long table that is away from the row; where the page scrolls to is not drawn.
- **Everything is device-unverified.** The figures are Playwright WebKit and Chrome on a Mac, on board markup. Mark's iPad probe covered the keydowns on a probe page, not in the app. PROOF-02's iPad check (D-11) is the device evidence, after the build.

## 10. Not drawn

Anything at 393 for creating or editing a recipe (no iPhone for creating recipes); the creation editor's Before you start, Balance, Scales and Problems (unchanged); the header's Search, Import and Export from 724 up (unchanged); reordering steps in the version pen (deferred by Mark).

## 11. Addendum: round-two details (Approved by Mark 2026-11-21, `look-p12-round-two-details`: "approve")

The round-two research (`12-RESEARCH.md`, "Open Questions") found eleven gaps. Question 1 was Mark's own row (`decide-p12-record-with-draft-held`; he chose B, see section 2). The entries below keep the research's numbers. Number 3 was already answered by an approved board; 2 and 4 to 11 were Sid's proposals and Mark approved them all as written, number 8 included. No panel was drawn for these: words carry each one. The bracketed "proposed" on each entry records where it came from.

2. **The band's draft line when the draft is kept on another version of the recipe (proposed).** Below 724 it reads the same sentence as the drawn case, "Draft: <draft name>. Finish it at the desk or on the iPad.", and the draft's name stays a link to the version the draft was opened on, as built (that page then shows the drawn line, plain, with the pen shut). On the draft's own version the name is plain text, as drawn. From 724 up the line is as built.
3. **Home's tasted lead and Adapt (answered by the approved board).** The row loses its whole actions span, as drawn; a tasted lead keeps Adapt alone, as the board's caption says. Section 3 is corrected to say this.
4. **The Notebook row of a recipe with an edit kept, below 724 (proposed).** No Resume editing on the row, and the row reads as any other recipe's row: rail, name as a link, its counts; no extra word and no resume styling (`nb__row--resume` is not applied). The recipe page's head carries the reason ("Edit kept. Finish it at the desk or on the iPad.").
5. **Crossing 724 while a page is open (proposed).** (a) A page opened narrow with a Next version draft held, then widened to 724 or more with no pen open: the pen opens with the draft, as it would on a fresh load at that width. (b) A pen that is open stays open when the window narrows below 724; nothing is taken from under the maker's hands. (c) The New recipe and Edit addresses show the editor from 724 up and the one-line page below it, swapping in place as the width crosses, with the draft kept as it is on leaving the page, so nothing typed is lost and it is there again when the window widens.
6. **Preview step in the version pen when a purpose or an aside is written (proposed).** Its line stands directly before the uses line, after the written purpose and aside. With neither written that is the drawn place, under the two fields. The preview block stands under it.
7. **The key lines when there is nothing to key (proposed; one part answered by the approved board).** Each line shows only while its region has something to key: the Instructions line with at least one step, the Ingredients line with at least one row. While the picker is open the Ingredients line stays under the heading, as the approved board's picker panel draws it.
8. **Keys in a step's other fields (proposed; Sid differs from the research here; approved, and section 6 now says it).** The three keys work from every text field inside the step: lead-in, instruction, purpose, aside, and a target's label and value. The line says "In a step", and a key that works in two of a step's fields and not in the others reads as broken. The caret stays in whichever field it was in. Fields outside a step (Recipe name, Recipe description, Version name, the picker's Name, the targets and scales beside the Sheet) get no key. A row's keys stay on its grams field, its only field.
9. **Add ingredient on a row, while the picker is open (proposed; one part answered by the approved board).** (a) Cancel returns focus to what opened the picker: that row's Add ingredient, or that row's grams when Cmd+Return opened it; the heading's Add ingredient when the heading opened it, as built. (b) The rows' Add ingredient stay while the picker is open, as the approved board's picker panel draws them; pressing another row's moves the landing place to after that row, the picker stays open and focus goes to its Name. (c) Cmd+Return in a row's grams while the picker is open does the same as that row's button.
10. **A keyboard with no Cmd key (proposed default).** Nothing is added for it: Ctrl+Return adds, as agreed; there is no key for move, and Move up and Move down remain the way to move.
11. **A held key (proposed default).** Holding Cmd+Return adds one step or opens the picker once: repeats are ignored. Holding Ctrl+Cmd+Up or Down keeps moving the step or row one place per repeat and stops at the end.

What the research settled from the code, with no decision needed (section 9): the caret after a keyed move (mechanism from the code, result on the iPad), what the open preview shows for a written step (the build's own reading of the step, targets, purpose and aside included), the Uses checklist's place and Tab order (after the uses line; Change ingredients, then the ticks, then the aside), and where the page goes when the picker opens from a row (to the picker's Name, then back to the new row's grams).
