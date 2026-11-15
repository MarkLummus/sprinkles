# Phase 12: Showing a recipe's own scales and problems, and the whole loop - Context

**Gathered:** 2026-11-15
**Status:** Ready for planning (each planning round waits for its design gate, D-06)

<domain>
## Phase Boundary

A batch recorded against a created recipe marks the recipe's own scales and problems, and the record pen, the reading and the printed log show them, each scale in its kind (Right in the middle, or Low to high), with "This recipe only" only when the recipe has any (TASTE-04). A recipe created in the app survives the whole loop: print, a batch that marks a custom scale, export, import (PROOF-01), and creation is checked on the iPad from the production build (PROOF-02).

Folded in by Mark (2026-11-15, ROADMAP Phase 12 Design gate and Notes): the Low to high scale's stops (`bug-p11-low-to-high-scale-centre-mark`), Preview step in the version pen (`bug-p11-pen-step-no-preview`), a clipboard top margin on the printed batch and tasting logs (`adoajjb9sgzbezmyrt4s`), the creation editor's row-control order (`todo-reorder-row-controls`) and Add ingredient on each ingredient row (`todo-add-ingredient-per-row`), and the entry points left out below 724 with a one-line page at a hidden job's address (`todo-phone-hide-entry-points`; PRODUCT.md, "On the phone").

Sid's approved, snapshotted boards are the acceptance target for every drawn surface. This context settles what Mark decided before the boards and what the boards will not draw.

Not in this phase: authoring scales or problems after creation, more than 2 of either, reordering steps in the version pen (`bug-p11-pen-steps-no-reorder`, deferred by Mark), an iPhone device check, any `DB_VERSION` or store-file-version change, the Recipe book print format, Delete recipe.

</domain>

<decisions>
## Implementation Decisions

### The Low to high scale (TASTE-04; `bug-p11-low-to-high-scale-centre-mark`)
- **D-01:** A Low to high scale's five stops read ends only: stop 1 carries the low label, stop 5 the high label, and stops 2, 3 and 4 are their numbers alone. No "leaning", no "right", no middle word. This holds wherever the stops are shown: the record pen, the creation editor's Scales (where the bug was seen) and the printed log. A Right in the middle scale keeps its five words. (Mark, 2026-11-15)
- **D-02:** What a marked Low to high scale says back on the reading ("Soft (2)" is the other kind's rule) is Sid's to draw on the reading board; Mark approves it there. The plan takes the read-back from the approved board, not from this file. (Mark, 2026-11-15)
- **D-03:** Kind-aware presentation lands in the domain readers (`stopWordsFor`, `readMarkWord` in `app/src/domain/axes.js`, which today treat every scale as Right in the middle) and reads `kind` from the definition it is given: a batch's snapshot for a recorded batch, the version's declared scales for a blank log and a new batch. Stored marks stay stops 1 to 5; no stored shape changes. The plan that draws the Low to high scale closes `bug-p11-low-to-high-scale-centre-mark`. (roadmap Notes; confirmed in discussion)

### Fold-ins: requirement IDs and planning order
- **D-04:** REQUIREMENTS.md gains three IDs, one per new behaviour: hiding the entry points below 724 with the one-line page; the creation editor's row controls (their order, and Add ingredient on each row); the clipboard top margin on the printed logs. The two bug fixes (Preview step in the version pen, Low to high stops) get no ID: their Mark's List rows trace them, and Low to high sits under TASTE-04. The first plan that touches each behaviour writes its ID into REQUIREMENTS.md (text, traceability row, coverage count) and ROADMAP's Phase 12 Requirements line. (Mark, 2026-11-15)
- **D-05:** Suggested IDs, the planner may rename within the file's categories: `PHONE-01` (entry points below 724), `STRUCT-05` (row controls), `LOG-01` (clipboard margin). (Claude's proposal, not Mark's words)
- **D-06:** Two design gates, scales first. **Gate 1**: the boards for the record pen, the reading and the printed log showing a recipe's own scales and problems (a scale of each kind, and none; the tasting pen and reading also at 393). Once approved and snapshotted, `/gsd-plan-phase 12` plans and builds TASTE-04, D-01 to D-03, and the scripted round trip (D-10). **Gate 2**: the boards for the entry points below 724, Preview step in the version pen, and the row controls. Once approved, a second planning round plans them, and the iPad proof (D-11) runs after they land. ROADMAP's single Design gate paragraph is restated as these two gates by the first planning round. (Mark, 2026-11-15)
- **D-07:** The clipboard margin rides Gate 1, because ROADMAP puts it on the printed-log board that Gate 1 already needs; its paper check waits for the iPad rows (D-13). (Claude's reading of the roadmap; Mark chose "scales first" without naming the margin's gate)
- **D-08:** The order of a step's and an ingredient row's controls is Sid's to draw; Mark's brief is only that adding the next row is quick to reach by keyboard. (Mark, 2026-11-15)
- **D-09:** Add ingredient on an ingredient row opens the picker, and the picked ingredient lands right after that row in the same step group, ticked in that step's Uses; on a row under "Not in a step yet" it lands after it, unplaced. The heading's Add ingredient stays and still adds an unplaced row. (Mark, 2026-11-15, confirming the todo's reading)

### The whole-loop proof (PROOF-01, PROOF-02)
- **D-10:** PROOF-01 is proven by a scripted WebKit walk and nothing else: it creates a recipe with a scale of each kind and a problem, saves, prints, records a batch that marks a custom scale, exports, imports into an empty profile, and compares the records field by field (figures, Sheet code, marks). Mark does not run the batch, export or import by hand. (Mark, 2026-11-15)
- **D-11:** PROOF-02's iPad check covers creation only, as written in success criterion 3: create end to end with scales, problems and targets, Tab reaches every creation control, each Move button included, focus stays with the moved step or row, then print. It runs from the production build (`npm --prefix app run build && npm --prefix app run preview -- --host`) after the Gate 2 work lands, so the Tab walk runs once on the final control order. (Mark, 2026-11-15)
- **D-12:** The recipe Mark creates for the iPad check is a real one he will keep, with a scale of each kind and a problem. It is live data from then on. The check's steps therefore name controls and expected behaviour, never the recipe's words or figures. (Mark, 2026-11-15)
- **D-13:** The iPad check is handed over as `check` rows on Mark's List, in order: two or three rows of about ten numbered steps each (set-up, scales and targets; steps, Move and Tab; Save and print), each citing the others in `source`, walked in WebKit first. The last row carries the paper step: print the batch log and the tasting log from the iPad, put them on the clipboard, expect every printed line clear of the clip. The orchestrator writes the rows (executors have no `ArtifactData`). (Mark, 2026-11-15)
- **D-14:** The Gate 1 build gets no device row. Its checks are board against build in WebKit at 1366 and 393, mobile Safari in the iOS Simulator, and the log printed to PDF. The roadmap adds no iPhone check to this phase. (Mark, 2026-11-15)

### Printed log and clipboard (`adoajjb9sgzbezmyrt4s`)
- **D-15:** The printed batch log and tasting log pages start their print about 1.5 in from the top edge of the paper (today every page has a 0.5 in top margin). (Mark, 2026-11-15)
- **D-16:** Only the two log pages get the margin. The bench sheet pages keep 0.5 in and their room. (Mark, 2026-11-15)
- **D-17:** The room comes out of the ruled notes lines: fields, scales and problems keep their size, the notes lose a line or two, and each log stays one page, a recipe with two own scales and two own problems included. (Mark, 2026-11-15)

### Carried forward (do not re-decide)
- Scales and problems are authored at creation only, 0 to 2 of each, a later version inherits them, and a batch snapshots the definitions with their kind (TASTE-01 to TASTE-03; sketch 010 D25, D26). The pen, the reading and the log read the snapshot for a recorded batch (`axesForBatch`), never the live version.
- "This recipe only" shows only for a recipe that has any; the code already does this on the pen and in the creation editor (`BatchRow.jsx`, `CreationSetup.jsx`). The plan starts with a code read and restates what is built: SEED-261001-iq4 predates later work (roadmap Notes).
- Phone brief (PRODUCT.md, "On the phone", Mark 2026-11-15): phone width is below 724; New recipe, Edit, Resume editing, Next version (band and Home row), Import and Export are left out there, Print sheet stays; a kept new-recipe draft keeps its Notebook row without Resume; a hidden job's address shows a one-line page whose wording Sid draws. This overrides sketch 011 decision 30, sketch 013 decision 10 and Phase 11 D-04 / D-05 below 724. The tasting pen and the reading get 393 boards; the printed log does not.
- Preview step in the version pen is built from Sid's board, as the creation editor's (013 decision 34, decision 014 2); the plan that builds it closes `bug-p11-pen-step-no-preview`.
- No `DB_VERSION` change and no store-file-version change: the reset window closed in Phase 11, and D-12 makes the store live.
- Boards and their inlined CSS are the authority; conformance is board and build side by side in WebKit, never prose or a test count. Print is checked in Safari's engine, not only Chrome. Every new button, checkbox and radio renders through `ui/Button.jsx`, `Checkbox.jsx` or `Radio.jsx`; every link carries `tabIndex={0}`; every visual value reads a token (the `@page` descriptors are the one literal `print.css` allows).
- Sid draws creation boards at 1366 only; 393 only where the phone brief names the job.

### Claude's Discretion
- How `axes.js` branches on `kind` and what the readers return for a Low to high stop (within D-01 and the approved reading board).
- How the log pages take a taller top margin than the sheet pages (WebKit ignores named pages and `@page` margin boxes, so this is likely in-flow space inside the log page, not a second `@page` rule); how many notes lines remain.
- The walk's shape: how it extends the Phase 10 and 11 harnesses, how it reaches an empty profile for the import, and what "field by field" compares.
- The three IDs' names and wording (D-05), and how the two planning rounds are numbered.
- How the hidden entry points are left out below 724 (render or CSS) and how the one-line page is routed, within Sid's board.

### Folded Todos
- **Add "Add ingredient" to each ingredient row** (`.planning/todos/pending/2026-11-01-add-ingredient-on-each-ingredient-row-like-add-step.md`; row `todo-add-ingredient-per-row`): reading confirmed as D-09. Drawn in Gate 2, built before the iPad proof. Its file moves to completed when built.
- **Reorder the row controls** (`.planning/todos/pending/2026-11-01-reorder-row-controls-so-adding-the-next-row-comes-first.md`; row `todo-reorder-row-controls`): Sid's order (D-08). Drawn in Gate 2, built before the iPad proof. Its file moves to completed when built.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase definition
- `.planning/ROADMAP.md` Phase 12 (goal, success criteria 1 to 3, Design gate, Notes) and decision 3 (scale kind).
- `.planning/REQUIREMENTS.md` TASTE-04, PROOF-01, PROOF-02 (and TASTE-01 to TASTE-03 as built).
- `PRODUCT.md` "On the phone" (Mark, 2026-11-15): the phone brief the hidden entry points and the 393 boards follow.

### Design (the acceptance target once approved)
- Sid's Phase 12 boards, not drawn yet: Gate 1 (pen, reading, printed log with a recipe's own scales and problems, each kind and none; tasting pen and reading at 393; the log's clipboard margin) and Gate 2 (entry points below 724 and the one-line page; Preview step in the version pen; the row controls). Plans cite the snapshots under `.planning/sketches/` by path once they exist.
- `.planning/sketches/007-full-battery/README.md`, `index.html` — the record pen's scales (fixed declared scales only).
- `.planning/sketches/008-control-sheet/README.md`, `index.html` — the pen's controls.
- `.planning/sketches/010-bench-sheet/README.md`, `CONTRACT.md`, `declared-log-pages-none.html`, `declared-log-pages-two.html`, `declared-log-pages-olive-oil.html`, `declared-pen-reading.html`, `page-1-batch-log.html`, `page-2-tasting-log.html` — the printed log and the declared scales as drawn (D23, D25, D26).
- `.planning/sketches/013-creation-editor/` and `.planning/sketches/014-steps-structure-save/` (README, CONTRACT, boards) — the creation editor whose row controls and Preview step Gate 2 redraws.
- `.planning/sketches/011-recipe-route-c/` — the version pen's open step, and decision 30 that the phone brief overrides below 724.
- `DESIGN.md` — the direction.

### What this phase builds on
- `.planning/phases/11-steps-structure-save-and-print/11-CONTEXT.md` — D-01 to D-27 (Edit, Save, structure controls, focus rules D-14 to D-17 that the reordered controls must still satisfy, the walk allow-list D-19, the iPad check D-20).
- `.planning/phases/10-the-creation-editor-without-save/10-CONTEXT.md` — scale and problem authoring, the walk and device check pattern.
- `.planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-CONTEXT.md` — the scale definition shape and the batch snapshot.
- `.planning/phases/11-steps-structure-save-and-print/11-walk-check.sh`, `11-board-check.mjs`; `.planning/phases/10-the-creation-editor-without-save/10-walk-check.sh`, `10-board-check.mjs` — the harnesses the round-trip walk and board checks extend.
- `.planning/seeds/SEED-261001-iq4-recipe-specific-tasting-measures-and-failures.md` — the seed this phase answers; predates later work, so the plan restates what the code does now.

### Conventions
- `.claude/CLAUDE.md` Conventions (framework-free domain; store access through `app/src/store/repository.js`; tokens; `tabIndex={0}`; device UAT from the build).
- `CLAUDE.md` "Mark's List" — check rows: one numbered step per line, "Expect:", about ten steps per row.
- `.planning/notes/2026-10-01-engineering-notes.md` — one Vite process; device UAT from the build.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/src/domain/axes.js` — `STOPS`, `stopWordsFor`, `readMarkWord`, `axesForBatch`, `axesForVersion`, `setMark`. Its header comment names Phase 12 as where a magnitude scale's stop words, read-back and middle are decided; both readers ignore `kind` today.
- `app/src/domain/catalog.js` — the definition `{ key, name, low, high, kind, group }`, `SCALE_KINDS` (`goldilocks`, `magnitude`), `scaleDefinition`.
- `app/src/ui/AxisMark.jsx` (takes one definition; draws five stops), `MarkOneField.jsx`, `BatchRow.jsx` (the record pen and the reading: `markGroup('This recipe only', declaredAxes)`, `problemBlock('This recipe only', declaredProblems)`, the cue hidden when a recipe declares none).
- `app/src/ui/PrintLogPages.jsx` (`lf-*` classes: date box, fields, `lf-srow` scale rows with anchors and numbers, `lf-notes` / `lf-line` ruled lines, the "Every recipe" / "This recipe only" cues) and `app/src/styles/print.css` (`@page { size: letter; margin: 0.5in 0.75in; }`, in-flow page boxes because WebKit ignores margin boxes and named pages).
- `app/src/ui/CreationSetup.jsx` (Scales and Problems authoring, where a Low to high scale shows "right" today), `CreationSteps.jsx`, `CreationPage.jsx`, `IngredientTable.jsx`, `IngredientPicker.jsx` (the row controls and the picker Add ingredient per row reuses).
- `app/src/ui/Method.jsx` (the version pen's open step; the creation editor's Preview step to mirror), `RecipeBand.jsx`, `NotebookPlace.jsx`, `RecipeList.jsx`, `Shell.jsx` (the entry points to leave out below 724), `router.jsx`, `Placeholder.jsx`.
- `app/src/store/transfer.js` (`exportStore`, `importStore`, `validateStoreFile`, `STORE_SCHEMA_VERSION = 9`) and `repository.js` — the export and import the walk drives.

### Established Patterns
- A batch freezes its scale definitions in `snapshot.coreScales` and `snapshot.declaredAxes`; presentation reads the snapshot, so a kind-aware reader needs no migration.
- Board conformance through a board module per surface (`11-board-*.mjs`) run by the board check, side by side in WebKit; the walk harness with a strict mode and an allow-list.
- Three feedback scopes; focus and announcement rules for add, remove and move (Phase 11 D-14 to D-17).
- Source-text pins guard the shell and the Sheet's conditionals; a plan names each pin it changes.

### Integration Points
- `axes.js` readers gain the kind branch; `AxisMark`, the pen's read-back in `BatchRow.jsx`, `PrintLogPages.jsx` scale rows and `CreationSetup.jsx`'s stop preview consume it.
- The log pages' top space in `print.css` / `PrintLogPages.jsx`, with fewer `lf-line` rows.
- The creation editor's acts rows (order, Add ingredient per row into `IngredientPicker`) and the version pen's open step (Preview step).
- The 724 cut in the band, the Notebook, Home rows and More, and a one-line page for `/notebook/new`, the edit route and the version pen's address below 724.

</code_context>

<specifics>
## Specific Ideas

- Mark's picture of a Low to high scale on the pen: `faint  2  3  4  strong`, the two end labels and three bare numbers (D-01).
- The clipboard is a standard one: about 1.5 in of clear paper under the top edge, on the two pages written on at the bench (D-15, D-16).
- The iPad proof doubles as the first real use: Mark enters a recipe he means to make (D-12).

</specifics>

<deferred>
## Deferred Ideas

- Reordering steps in the version pen (`bug-p11-pen-steps-no-reorder`): deferred by Mark on 2026-11-01; structure edits on later versions are out of v2.0.
- An iPhone device check of the tasting pen with a recipe's own scales: not added to this phase (roadmap; D-14). Mark meets it when he tastes his own recipe.

### Reviewed Todos (not folded)
- **Build the Recipe book print format** — a second print format; parked on Mark's List.
- **Consider a "Mise en Place" auto-generator** — a new capability; parked on Mark's List.
- **Add a Delete recipe feature** — a new capability; parked on Mark's List. D-12's kept recipe does not need it.

</deferred>

---

*Phase: 12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loop*
*Context gathered: 2026-11-15*
