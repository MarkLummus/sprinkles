# Phase 11: Steps, structure, save and print - Context

**Gathered:** 2026-10-26
**Status:** Ready for planning

<domain>
## Phase Boundary

A maker finishes the recipe Phase 10 began: in the creation editor at `/notebook/new` (1366 only) they write Instructions steps (lead-in, instruction, targets, a purpose, an aside), say which rows each step uses and in what portions, add, remove and move steps and rows, and press Save, which creates the recipe and its first version in one transaction and lands on the new page. The first version stays reshapeable through an Edit act beside Next version until it has a batch or a child version. The created recipe prints as a bench sheet with its Sheet code and that code finds it after any later edit. On screen, the Sheet's Instructions steps take the printed method's treatment (sketch 010 D18, decision 014 2) on the reading page, in the version pen's closed steps and in the editor's Preview step. Requirements: MAKE-07, MAKE-10, MAKE-12, STRUCT-01, STRUCT-02, STRUCT-03, STRUCT-04.

Sketch 014 (four approved boards, `CONTRACT.md` sections 1 to 7) is the acceptance target for everything but print and fixes the words, layout and behaviour of every drawn surface. Print's authority is sketch 010's bench sheet and the built print. This context settles only what the boards do not draw.

Not in this phase: structure edits on any later version (the version pen keeps its remove and restore, STRUCT-04), the Recipe book print format, a second print format of any kind, phone layouts, any `DB_VERSION` change (the reset window closes here: from this phase on no store-shape bump in v2.0).

</domain>

<decisions>
## Implementation Decisions

### Edit on a saved first version (roadmap decisions 12 and 22; STRUCT-04)
- **D-01:** The reopened editor lives at its own route, `/notebook/:recipeId/:versionId/edit`, beside the page and print routes. It mounts the creation editor in `creating` mode with the stored version (and its recipe's name and description) as the starting draft. Cancel and Save both land on `/notebook/:recipeId/:versionId`. The route redirects to the page when the version is not a first version with no batch and no child. (Mark, 2026-10-26) — **Reversibility:** costly — the Notebook's Resume editing, the page's Edit, the import guard and the walk's allow-list all name this path.
- **D-02:** The edit's ink is a kept draft of the create shape (`CREATE_DRAFT_KEYS`), keyed by the version's id, marked as an edit of a saved version (a flag within the existing shape or a sibling kind; the planner chooses, and a change to `CREATE_DRAFT_KEYS` stays Mark's decision per Phase 10). It goes through `useKeptDraft` with the 250 ms debounce and unmount flush; Cancel deletes it; Save writes the version and deletes it. One-creation rules (`draftMatchesCreate`, the Notebook's single draft row, the `/notebook/new` redirect) concern create drafts of unsaved recipes only and must not match an edit draft. (Mark, 2026-10-26)
- **D-03:** Save-over replaces content and keeps identity: the same version id, the same Sheet code (roadmap decision 19, `codeFromVersionId`), the same `createdAt` and "Written" date; rows (with fresh `structuredClone`s of the library entries, LIB-08), method, Before you start, scales, problems, style, targets and serving temperature replaced; the recipe's name and description updated. No new History node, no edited-date field. The write is one transaction over recipes and versions (the same `createRecipeWithVersion` path or a sibling that puts over an existing id). (Mark, 2026-10-26) — **Reversibility:** costly — the stored shape gains nothing, so adding an edited date later is a shape change inside the closed reset window.
- **D-04:** While an edit draft is kept on a version: store import is refused on every route with the kept-creation refusal (Phase 10 D-10), the notice naming the recipe; on that version's page the acts row reads Resume editing in Edit's place and shows no Next version and no Record a batch, since either would close the edit window. Other recipes and versions are untouched. (Mark, 2026-10-26)
- **D-05:** The Notebook shows no separate draft row for a kept edit: the recipe's own row gains a Resume editing act that opens the edit route. New recipe stays available. (Mark, 2026-10-26)
- **D-06:** Save-over that finds the version now has a batch or a child (recorded in another tab while the edit was open) writes nothing: a form-level line under Save says the version has a batch (or a later version) and can no longer be edited; the draft is kept; Cancel discards it and lands on the page. The check runs inside the save transaction's read, not from the page's stale props. (Mark, 2026-10-26)
- **D-07:** Landing after Save-over shows the page notice card "Changes saved."; landing after the first Save shows "Recipe saved." (board). Both are the built `.page-status` card and clear after 5 s. (Mark, 2026-10-26)

### What Save refuses (MAKE-10; the board draws name and version name)
- **D-08:** A row whose grams field is blank or unreadable refuses Save with the row's own field message (the pen's `blockedSaveMessage` rule and sentences, Phase 10 D-08's per-row message and `is-marked` outline); nothing is written. A saved version never carries a 0 g placeholder. (Mark, 2026-10-26)
- **D-09:** Rows no step uses are allowed at Save, with or without steps. A recipe with no steps saves a flat table as the seeded ones read; with steps, unplaced rows save with their one portion unallocated and read under the "Not in a step yet" head (D-12). (Mark, 2026-10-26)
- **D-10:** A step with an empty lead-in or empty instruction, and a target with only a label or only a value, refuse Save with Required under the empty field (the board stands Required under a just-added step's two fields). A step that uses no rows is allowed. An empty purpose or aside field is dropped at Save, not refused. (Mark, 2026-10-26)
- **D-11:** A recipe with no ingredient rows refuses Save with "Add at least one ingredient." under the Ingredients heading row; `createRecipe` and `transfer.js` keep their non-empty-rows checks. Together with the board's "Enter a recipe name." and Required under the version name, and Phase 10's scale and problem Required, these are the whole gate: `creationSaveBlock` composes them and Save does nothing while any stands. All messages show at once on the refused press; focus goes to the first refused field in page order. (Mark, 2026-10-26)

### Unplaced rows and empty sections after Save
- **D-12:** The head over rows no step uses reads "Not in a step yet" everywhere: the creation editor (board, roadmap decision 25), the saved reading page, the version pen's grouped table and checklist labels, and the printed sheet. "Unallocated" retires from `IngredientTable.jsx` and `PrintSheetPages.jsx`, including the split-line name "…, Unallocated". No board draws the saved case; Sid is told, no redraw. (Mark, 2026-10-26)
- **D-13:** On the printed bench sheet an empty Targets, Equipment, Process or Before you start section is omitted with its heading and the next section closes up; no dash, no blank band. The on-screen Sheet already hides an empty Before you start and Instructions (`RecipeSheet` `--no-before` / `--no-method`). (Mark, 2026-10-26)

### Focus, keyboard and struck values
- **D-14:** After remove on a step, focus goes to the next step's lead-in, else the previous step's lead-in, else the heading's Add step; a polite announcement names the removed step ("Step 2, Churn, removed"). (Mark, 2026-10-26)
- **D-15:** After remove on a row, focus goes to the next row's remove in the same group (step head or "Not in a step yet"), else the previous row's remove, else Add ingredient; a polite announcement names the ingredient. Phase 10's row remove adopts the same rule. (Mark, 2026-10-26)
- **D-16:** After Move up or Move down, focus stays on the same button of the moved item so repeated presses keep moving it; when that button turns off at the end of its list, focus moves to the item's other Move button; a polite announcement reads the new position ("Step 2 of 3"; "Whole milk, row 1 of 2 in step 1"). Off buttons carry `.mk-off` and `aria-disabled="true"`, stay in the tab order and do nothing on press (board, CONTRACT section 3). (Mark, 2026-10-26)
- **D-17:** The Add to step chooser (decision 014 1): opening puts focus on Cancel; Escape acts as Cancel and returns focus to Add to step; Tab moves through Cancel then the step controls in order; one chooser open at a time, opening another closes the first. Choosing a step moves focus to the moved row's remove (board). (Mark, 2026-10-26)
- **D-18:** Show changes on a later version, in the new tag row (decision 014 2): a changed target reads its label once, then the old value struck in the diff's strike colour, then the new value bold and underlined ("temp ~~80 °C~~ 85 °C"); a removed target is one struck tag; an added target carries the diff's added mark. No chip box anywhere in the method; the table's estimate flag `.target-chip.ingredient-table__flag` keeps its box. (Mark, 2026-10-26)

### Proof and device check
- **D-19:** The walk harness runs with an allow-list: every existing route's snapshots and the store dumps must match Phase 10's result at this phase's base commit, and only the new edit route's snapshots and the records of a recipe the walk itself creates may differ. The before-walk is re-recorded at this phase's base commit if Phase 10's baseline no longer matches there (Phase 10 D-11's pattern, `10-walk.mjs` strict mode extended with the allow-list). The Save path has a forced-failure test proving a failed transaction leaves neither recipe nor version (roadmap Notes). (Mark, 2026-10-26)
- **D-20:** One iPad check at the end of the phase, from the production build (`npm --prefix app run build && npm --prefix app run preview -- --host`), as one check row on Mark's List: create a recipe with two steps and a split row, Move and remove by touch and by keyboard (the Move buttons' focus is the roadmap's medium-confidence item), Save, print to PDF and read the Sheet code, type it in Search, Edit and Save-over, type the code again. The steps are walked in WebKit first (verify-device-check-steps rule). Print is checked as the iPad PDF, not only in Chrome. (Mark, 2026-10-26)
- **D-21:** Before the first device build that can save a recipe, the export-first row goes on Mark's List (roadmap, the reset window), as a `check` row with `needs: "hands"`: export the store before testing Save on the device. The plan that lands Save adds the row; the orchestrator writes it (executors have no `ArtifactData`). (roadmap Notes; confirmed in discussion)

### Settled after research (Mark, 2026-10-26, in chat during /gsd-plan-phase 11)
- **D-22:** A target chip whose label and value are both empty is dropped at Save, and each target chip in the creation editor gains a remove control (the editor's row-remove look); a one-sided chip still refuses Save with Required (D-10). No board draws the chip's remove; Sid is told, no redraw. (Mark, 2026-10-26; research open question 1)
- **D-23:** Pressing Edit on a saved first version keeps no draft until the first change; the version is "editing" (import refused, Next version and Record a batch hidden, Resume editing shown) only once an edit draft exists. (Mark, 2026-10-26; research G-7)
- **D-24:** While an edit draft is kept on a version, Home hides that recipe's Next version and Record a batch shortcuts as well as the version page (D-04). (Mark, 2026-10-26; research G-8)
- **D-25:** Two declared problems with the same words refuse Save with a field message under the second, so every saved recipe re-imports (`transfer.js` rejects duplicates); the sentence is the planner's, within the existing shape. (Mark, 2026-10-26; research G-6)
- **D-26:** In Show changes on a later version an added target reads plain, as an added step does; changed targets strike the old value and underline the new, removed targets are one struck tag (D-18). No added mark is built. (Mark, 2026-10-26; research G-9)
- **D-27:** Success criterion 5's print clause reads: a recipe with no Before you start notes, no steps, or steps without targets prints with no empty heading and no blank band. The sheet has no Equipment or Process section; nothing new is built, a test and a WebKit print check prove it (D-13). (Mark, 2026-10-26; research G-5)

### Fixed by sketch 014 and the roadmap (carry forward; do not re-decide)
- The four boards and their inlined CSS are the authority; `CONTRACT.md` sections 1 to 7 name every element, word and measure. Conformance is the board and the build side by side in WebKit, never prose or a test count. The boards add no token.
- Add note, Add ingredient and Add step sit on their heading's row in the Show/Hide control's look (013 decisions 29, 31, 33); Add ingredient is gone while the picker is open. Add step on the heading adds at the **beginning**; Add step on a step's acts row adds right after it; focus goes to the new step's lead-in. The heading's is the only Add step while there is no step.
- The open step in the creation editor has no box and no first-field margin (013 decision 32); the version pen keeps its box. Required stands under an empty lead-in and instruction. Preview step after Add target reads Hide preview while open and renders the step as the Sheet shows it, in the printed treatment, under the step's last field before the uses line (013 decision 34, decision 014 2).
- The step grammar is the version pen's open step (sketch 011 decisions 2 and 5): lead-in, instruction, targets, uses line ("uses nothing yet" / "uses …" · "change the ingredients" / "done" · "add a purpose" · "add an aside"), the Uses checklist, a purpose and an aside once added.
- Grams of a row in two steps are typed in the table, one line per step under each step's head with its own grams field and the build's portion line (roadmap decision 23); a split row with one line left reads as a one-line row (sketch 011 decision 56). Rows move within their step only (roadmap decision 9). Each step orders its own rows: the reading table orders a step's rows by that step's `uses`, and the seeded Olive Oil v1 table is redrawn to match (Mark, 2026-10-26, `decide-p11-row-order-across-steps`; reverses the one-shared-order reading plans 11-02 and 11-08 built in review round 1). Removing a step holding one line of a split row folds its grams back into the remaining line and the Balance stands (roadmap decision 24).
- Removing a row or a step deletes it outright and prunes what pointed at it: a removed row leaves every step's `uses`; a removed step's rows go back under "Not in a step yet" with their grams (roadmap decision 10, STRUCT-01). The stored step key never changes and no removed step's key is handed out again within one editing session (`nextStepKey`, STRUCT-03; Mark, 2026-10-26, `decide-p11-step-key-reuse`: a key removed while creating, before the first Save, may be issued again after Edit; keys the version pen struck stay tombstones on Edit); display numbers follow array order (`displayNumbers`). A row's id never changes.
- Every unplaced row's acts line ends with Add to step as soon as a step exists; pressed, the line becomes Cancel · "Step n, lead-in" per step ("Step n" alone with no lead-in); choosing ticks the row in that step's Uses and moves it under that head as its last row (decision 014 1).
- The ceremony reads "New recipe · draft" while creating and "Version 1 · editing" on the edit route, Cancel then Save (the filled action). After the first Save the page reads as a seeded root: Version 1 · Latest, no From version, "no reason recorded", History with one node, Batch margin not churned. Edit is an underlined word beside the filled Next version only while the version has no batch and no child; once a batch exists the acts row reads Next version alone and no other saved version ever shows Add, Remove or Move (STRUCT-04).
- Save goes through one `repository.createRecipeWithVersion` transaction over recipes, versions and drafts (roadmap Notes); the Sheet code is fixed at creation from the version id (roadmap decision 19), so a printed sheet finds its version after any edit. The slice order is the research's: steps and their allocation, then add, remove and move, then save, then print.
- 1366 only; no iPhone row (`todo-phone-jobs-product-brief`). Every new button, checkbox and radio renders through `ui/Button.jsx`, `Checkbox.jsx` or `Radio.jsx`; every link carries `tabIndex={0}`; every visual value reads a token.

### Claude's Discretion
- Module homes and names: the step and structure ops as pure functions beside `domain/creation.js` (add, remove, move for steps and rows, place a row, set a step's uses, fold grams back), the edit route's component beside `CreationRoute.jsx`, how the saved version becomes a create-shaped draft and back, and the shape of the edit flag within D-02's constraint.
- The exact sentences of the stale-edit refusal (D-06), the duplicate-problem message (D-25), the step and row announcements (D-14 to D-16) and the import-refusal notice for a kept edit, within the existing sentences' shape.
- Research open questions 5, 8 and 9 (Edit below the editor's width, a library entry gone at Save-over, the unplaced sentinel): the planner decides once and states it in the plan.
- How the print omits empty sections (D-13) and where the printed "Not in a step yet" head sits, following sketch 010's grammar.
- How the walk's allow-list names the edit route and the created records (D-19).

### Folded Todos
- **Add a Preview Step link while editing a Step** (`.planning/todos/pending/2026-10-25-add-a-preview-step-link-while-editing-a-step.md`): Mark's note that actions like Add a target are hard to understand without seeing the result. Drawn as Preview step on `P11_Steps` (013 decision 34, `look-p11-preview-step` approve); this phase builds it with the step editor. Its file moves to completed when built.
- **Move the "Add ingredient" link to the heading row like "Add step"** (`.planning/todos/pending/2026-10-25-move-the-add-ingredient-link-to-the-heading-row-like-add-step.md`): drawn on every editor panel (013 decision 31, `look-p11-steps-r3` approve); this phase moves Add ingredient and Add note from under their lists (`CreationPage.jsx` `beforeFoot`, `notebook.css` `.mk-add-row`) to the heading rows. Its file moves to completed when built.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase definition
- `.planning/ROADMAP.md` Phase 11 (goal, success criteria 1 to 6, Design gate MET, Notes), "Before planning" (the reset window; decisions 9, 10, 12, 19, 22, 23, 24, 25).
- `.planning/REQUIREMENTS.md` MAKE-07, MAKE-10, MAKE-12, STRUCT-01, STRUCT-02, STRUCT-03, STRUCT-04 (and CODE-01, LIB-08 as they bear on Save).

### Design (the acceptance target)
- `.planning/sketches/014-steps-structure-save/README.md` — the four boards, Decisions (roadmap, 013 29 to 34, 014 1 and 2), "For the plan" 1 to 8, Measured, Not verified.
- `.planning/sketches/014-steps-structure-save/CONTRACT.md` — sections 1 to 7: every element, word and measure per board.
- `.planning/sketches/014-steps-structure-save/instructions-steps.html`, `add-remove-move.html`, `save.html`, `first-version.html` — the boards themselves, CSS included.
- `.planning/sketches/013-creation-editor/README.md` and `CONTRACT.md` — the editor the boards are drawn on (decisions 1 to 34).
- `.planning/sketches/010-bench-sheet/CONTRACT.md` sections 5 and 6 — the printed method treatment the on-screen steps adopt (decision 014 2); the print's own authority with the built `PrintSheetPages.jsx` and `print.css`.
- `.planning/sketches/011-recipe-route-c/` — the version pen's open step grammar (decisions 2, 5, 56).
- `DESIGN.md` — the Formulation Cookbook direction.

### What this phase builds on
- `.planning/phases/10-the-creation-editor-without-save/10-CONTEXT.md` — D-01 to D-13, T-01 to T-06 (the creation route, the `create` draft, rows without steps, leaving mid-creation, the import refusal, the walk and device check).
- `.planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-CONTEXT.md` — D-03b, D-04 (Sheet code from the version id), D-14, D-18.
- `.planning/phases/08-split-the-recipe-page-along-its-jobs/08-CONTEXT.md` — D-08 to D-10 (hook wiring, `sheetView` with no baseline, StrictMode restore).
- `.planning/phases/10-the-creation-editor-without-save/10-walk.mjs`, `10-walk-check.sh`, `10-walk-record-base.sh`, `10-board-check.mjs` — the walk and board harnesses to extend (D-19).
- `.planning/research/ARCHITECTURE.md` — "Hard delete with reference pruning", "Save path", "Data flow"; `.planning/research/PITFALLS.md`.
- `.planning/debug/steps-do-not-renumber-after-removal.md` — why the stored step key never moves.

### Conventions
- `.claude/CLAUDE.md` Conventions (framework-free domain; all store access through `app/src/store/repository.js`; tokens; `tabIndex={0}`; device UAT from the build; no `DB_VERSION` change from here).
- `.planning/notes/2026-10-01-engineering-notes.md` — one Vite process; device UAT from the build.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/src/domain/draft.js` — the `create` kind already accepts `method` (`fitsCreateMethod`: steps with `n`, `fitsMethodStep`, optional `removed`) and rows with portions keyed by step; `CREATE_DRAFT_KEYS` pinned.
- `app/src/domain/creation.js` — the pure creation ops (notes, rows, grams, style, scales, problems) the step and structure ops join; `creationSheetVersion` builds the live version (method empty today).
- `app/src/domain/stepKeys.js` (`nextStepKey`), `stepNumbers.js` (`displayNumbers`), `uses.js` (`stepsUsingRow`, `orphanedRows`), `penDraft.js` (`setPenStepField`, `setPenStepTarget`, `togglePenStepUses`: the step field ops to reuse or mirror; it must not gain add/remove, per the research).
- `app/src/domain/newRecipe.js` (`createRecipe`: extend with optional method, authored, scales, problems, style, targets, serveTempC; the three-field call stays), `lineage.js` (`blockedSaveMessage`, `gramsDraftMessage`, `parseGramsDraft`), `versionRow.js` (`rowFromLibraryRecord`), `sheetCode.js` (`codeFromVersionId`, `findVersionsByCode`), `id.js`.
- `app/src/store/repository.js` — `createRecipeWithVersion` does not exist yet; `importAll` is the one-transaction pattern (abort by hand on a failed put); `saveDraft`, `deleteDraft`, `listDrafts`.
- `app/src/ui/IngredientTable.jsx` (`groupPortionsByStep`, step heads, split lines, the "Unallocated" word to retire), `Method.jsx` (reading branch `.method-step__targets` / `.target-chip` / `.method-step__purpose` / `.method-step__aside`; pen branch gated on `baselineVersion != null`), `PrintSheetPages.jsx` (`.mp-tags` / `.mp-why` / `.mp-aside`, the grammar the screen adopts; "Unallocated" head), `PrintSheet.jsx`, `print.css`.
- `app/src/ui/CreationRoute.jsx`, `CreationPage.jsx` (`beforeFoot` add controls to move), `CreationSetup.jsx`, `useKeptDraft.js`, `NotebookPlace.jsx`, `notebookPaths.js` (`notebookPath`, `printPath`; add an edit path), `router.jsx` (`/notebook/new`, `/notebook/:recipeId/:versionId`, `/print`; `RecipePageForRoute` owns `.page-status-anchor`), `Shell.jsx` (import guard), `SheetCodeSearch.jsx`.
- `app/src/ui/Button.jsx`, `Checkbox.jsx`, `Radio.jsx`, `FieldFeedback.jsx`; the `text-control`, `ink-field`, `prose-field` roles; `.page-status` card.

### Established Patterns
- Hook-order law: every hook above the early returns; kept-draft restore once per page instance under StrictMode (Phase 8 D-10).
- Three feedback scopes (field, form, page); Cancel discards with no dialog; no `beforeunload` anywhere (Phase 4 D-17; Phase 10 D-09a).
- Source-text pins guard the shell, the kept draft and the Sheet's conditionals (Phase 10 T-01 to T-06): a plan names each pin it changes.
- Board conformance measured with `10-board-check.mjs` side by side in WebKit; a sketch 014 board module per surface.

### Integration Points
- The creation editor gains an Instructions region (`section.method-region`) under the Balance with steps, step heads in the table, and the structure controls; the edit route mounts the same editor over a stored version.
- Save: `creationSaveBlock` → `createRecipe` (extended) → `repository.createRecipeWithVersion` → `deleteDraft` → `navigate(notebookPath(...), {replace: true})` with the notice.
- The recipe page's acts row gains Edit / Resume editing and hides Next version and Record a batch while an edit draft is kept (D-04); `RecipeList`/`NotebookPlace` rows gain Resume editing (D-05).
- `Method.jsx` reading and pen branches, and the Preview step, render the printed treatment through the tokens `print.css` reads (CONTRACT section 7); `PrintSheetPages.jsx` and `print.css` stay as built except for D-12's word and D-13's omissions.

</code_context>

<specifics>
## Specific Ideas

- Mark decided in chat on 2026-10-26 that the on-screen Sheet shows steps as the print does ("decide it now for Phase 11"): targets as a tag row with no box, Why as the caps word and the sentence, the aside as a callout, all upright (decision 014 2, `look-p11-screen-steps-print-treatment` approve).
- "Not in a step yet" is the one phrase for unplaced rows on every surface, screen and print (D-12); book vocabulary like "Unallocated" retires (plain words rule).
- Add step on the heading adds at the beginning; Mark's words win over the decide row's option label (013 decision 33).

</specifics>

<deferred>
## Deferred Ideas

- The Recipe book print format (one page, the recipe only, no log): a second print format, its own todo and board (`.planning/todos/pending/2026-09-23-build-the-recipe-book-print-format.md`, canvas page "Print formats"). Not MAKE-12's bench sheet.
- An edited-date on a saved first version ("edited today"): rejected for now (D-03); would be a stored-shape addition after the reset window.

### Reviewed Todos (not folded)
- **Build the Recipe book print format** — a different print format; deferred as above.
- **Consider a "Mise en Place" auto-generator** — tagging ingredients to pull prep into Before you start; a new capability for a later phase.
- **Write a product brief for phone-based jobs** — parked on Mark's List (touched, waiting for `/marks-list`); Mark's note says recipe creation is not an iPhone job, which this phase honours (1366 only).

</deferred>

---

*Phase: 11-steps-structure-save-and-print*
*Context gathered: 2026-10-26*
