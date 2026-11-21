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
- A version with a Next version draft kept: the pen does not open (today it reopens there at 393). The band stays in its reading form with one line in the same place and role: "Draft: Version 2 · less cream. Finish it at the desk or on the iPad.", that is "Draft: ", the waiting draft's name as the build already words it (the next ordinal, then the typed version name), then ". Finish it at the desk or on the iPad." Plain text, no link. Two lines at 393. The record act and Print sheet are drawn as staying.
- Unchanged: Rename, the Version fold, Go to batch, History, Show changes at the Ingredients head, the Sheet, the batch log and its pen.
- No sideways overflow at 393 or 723.

## 3. Notebook, Home and More at 393 (`notebook-home-more-393.html`)

- Notebook: no New recipe beside the title (`div.nb__head` holds the title alone). The count and the list are as built.
- Notebook with a kept new-recipe draft: the draft's row (`li.nb__draft`: rail, name as `h2.nb__name`, "draft") stands first, above the count, as built, without its Resume (`span.nb__draft-act` is not in the markup). Its name is not a link, as built.
- Home: a tasted recipe's row has no action (its `span.home__actions` is not in the markup): place, name, standing. Rows whose action is Record tasting or Record batch are as built. The lead block loses Next version the same way; Keep developing and Adapt, which only open the recipe page, are as built.
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

- In a step's lead-in or instruction: Cmd+Return does what the step's Add step does (a new step after it, focus in the new step's lead-in; nothing is typed into the field); Ctrl+Return does the same. Ctrl+Cmd+Up and Ctrl+Cmd+Down do what its Move up and Move down do, with the same announcement the buttons give today ("Step 2 of 2": the step's new place of the count). At the ends (up on the first step, down on the last) the key does nothing and says nothing, as a greyed Move does today.
- After a keyed move the caret stays where it was, in the same field of the moved step.
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
- **Whether a batch may be recorded while a Next version draft is held below 724** is not settled: the band line is drawn with the record act staying, and today that state is the open pen.
- **The picker opens under the table's Total also from a row** (confirmed by Mark). On a long table that is away from the row; where the page scrolls to is not drawn.
- **Everything is device-unverified.** The figures are Playwright WebKit and Chrome on a Mac, on board markup. Mark's iPad probe covered the keydowns on a probe page, not in the app. PROOF-02's iPad check (D-11) is the device evidence, after the build.

## 10. Not drawn

Anything at 393 for creating or editing a recipe (no iPhone for creating recipes); the creation editor's Before you start, Balance, Scales and Problems (unchanged); the header's Search, Import and Export from 724 up (unchanged); reordering steps in the version pen (deferred by Mark).
