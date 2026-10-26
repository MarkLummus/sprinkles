# Phase 11: Steps, structure, save and print - Research

**Researched:** 2026-10-26
**Domain:** React 19 / Vite 8 recipe editor on IndexedDB (`idb`): pure-domain step and allocation ops, one-transaction Save, a reopened first-version editor, the printed bench sheet, and the WebKit walk and board harnesses
**Confidence:** HIGH on code shapes and constraints (every discrete value below was read this session); MEDIUM on WebKit focus after a reorder (the roadmap's own medium-confidence item) and on the four judgement calls in Open Questions

## Summary

Phase 11 adds no package and no store shape. Everything it needs exists: the `create` draft already accepts `method` steps and per-row `portions` (`draft.js`), `nextStepKey` and `displayNumbers` already handle a step-key ledger and display numbers, the `drafts`, `recipes` and `versions` stores are all keyed by a single string, `importAll` is the transaction pattern to copy, and `transfer.js` is the contract a saved version must meet to export and re-import. The work is (1) pure ops for steps, allocation, move and removal, (2) a Save gate and a `{recipe, version}` builder that satisfy `transfer.js`, (3) two repository transactions, (4) a creation step editor, row controls and heading rows on the shared Sheet, (5) the screen treatment of reading steps, (6) an edit route, and (7) print and harness work.

The CONTEXT decisions are consistent with the code, but reading the code surfaced thirteen things CONTEXT does not say or cannot hold as written. The planner must resolve them in the plans; they are collected in "Findings that change the plan" (G-1 to G-13). The three most expensive if missed: **G-1** a version's kept drafts share one key (`versionId`), and `RecipePage`'s restore deletes any draft that is not a pen draft, so an edit draft on a saved version would be deleted the first time the version page opens; **G-2** a draft row's placeholder `step: 1` would silently attach every unplaced row to the first step the maker adds, so placement must be read from `step.uses`, never from `portion.step`; **G-4** criterion 6 changes the text of the reading page, and the walk's `textHash` covers that text, so D-19's "existing routes must match" needs a method-text normalisation or it fails on day one.

**Primary recommendation:** Build in this order, one plan per slice, each landing green: harness first (walk with allow-list and method-text normalisation, board modules), then pure domain ops and the repository transactions in parallel, then the reading-step treatment, the creation step editor and allocation, the structure controls, Save, the edit route, print, and the final proof. Keep the draft shape (`CREATE_DRAFT_KEYS`) untouched; add the edit draft as a sibling kind `'edit'`; make `step.uses` the single truth for placement; keep removed steps as hidden tombstones in the draft and strip them at Save.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
#### Edit on a saved first version (roadmap decisions 12 and 22; STRUCT-04)
- **D-01:** The reopened editor lives at its own route, `/notebook/:recipeId/:versionId/edit`, beside the page and print routes. It mounts the creation editor in `creating` mode with the stored version (and its recipe's name and description) as the starting draft. Cancel and Save both land on `/notebook/:recipeId/:versionId`. The route redirects to the page when the version is not a first version with no batch and no child. (Mark, 2026-10-26) — **Reversibility:** costly — the Notebook's Resume editing, the page's Edit, the import guard and the walk's allow-list all name this path.
- **D-02:** The edit's ink is a kept draft of the create shape (`CREATE_DRAFT_KEYS`), keyed by the version's id, marked as an edit of a saved version (a flag within the existing shape or a sibling kind; the planner chooses, and a change to `CREATE_DRAFT_KEYS` stays Mark's decision per Phase 10). It goes through `useKeptDraft` with the 250 ms debounce and unmount flush; Cancel deletes it; Save writes the version and deletes it. One-creation rules (`draftMatchesCreate`, the Notebook's single draft row, the `/notebook/new` redirect) concern create drafts of unsaved recipes only and must not match an edit draft. (Mark, 2026-10-26)
- **D-03:** Save-over replaces content and keeps identity: the same version id, the same Sheet code (roadmap decision 19, `codeFromVersionId`), the same `createdAt` and "Written" date; rows (with fresh `structuredClone`s of the library entries, LIB-08), method, Before you start, scales, problems, style, targets and serving temperature replaced; the recipe's name and description updated. No new History node, no edited-date field. The write is one transaction over recipes and versions (the same `createRecipeWithVersion` path or a sibling that puts over an existing id). (Mark, 2026-10-26) — **Reversibility:** costly — the stored shape gains nothing, so adding an edited date later is a shape change inside the closed reset window.
- **D-04:** While an edit draft is kept on a version: store import is refused on every route with the kept-creation refusal (Phase 10 D-10), the notice naming the recipe; on that version's page the acts row reads Resume editing in Edit's place and shows no Next version and no Record a batch, since either would close the edit window. Other recipes and versions are untouched. (Mark, 2026-10-26)
- **D-05:** The Notebook shows no separate draft row for a kept edit: the recipe's own row gains a Resume editing act that opens the edit route. New recipe stays available. (Mark, 2026-10-26)
- **D-06:** Save-over that finds the version now has a batch or a child (recorded in another tab while the edit was open) writes nothing: a form-level line under Save says the version has a batch (or a later version) and can no longer be edited; the draft is kept; Cancel discards it and lands on the page. The check runs inside the save transaction's read, not from the page's stale props. (Mark, 2026-10-26)
- **D-07:** Landing after Save-over shows the page notice card "Changes saved."; landing after the first Save shows "Recipe saved." (board). Both are the built `.page-status` card and clear after 5 s. (Mark, 2026-10-26)

#### What Save refuses (MAKE-10; the board draws name and version name)
- **D-08:** A row whose grams field is blank or unreadable refuses Save with the row's own field message (the pen's `blockedSaveMessage` rule and sentences, Phase 10 D-08's per-row message and `is-marked` outline); nothing is written. A saved version never carries a 0 g placeholder. (Mark, 2026-10-26)
- **D-09:** Rows no step uses are allowed at Save, with or without steps. A recipe with no steps saves a flat table as the seeded ones read; with steps, unplaced rows save with their one portion unallocated and read under the "Not in a step yet" head (D-12). (Mark, 2026-10-26)
- **D-10:** A step with an empty lead-in or empty instruction, and a target with only a label or only a value, refuse Save with Required under the empty field (the board stands Required under a just-added step's two fields). A step that uses no rows is allowed. An empty purpose or aside field is dropped at Save, not refused. (Mark, 2026-10-26)
- **D-11:** A recipe with no ingredient rows refuses Save with "Add at least one ingredient." under the Ingredients heading row; `createRecipe` and `transfer.js` keep their non-empty-rows checks. Together with the board's "Enter a recipe name." and Required under the version name, and Phase 10's scale and problem Required, these are the whole gate: `creationSaveBlock` composes them and Save does nothing while any stands. All messages show at once on the refused press; focus goes to the first refused field in page order. (Mark, 2026-10-26)

#### Unplaced rows and empty sections after Save
- **D-12:** The head over rows no step uses reads "Not in a step yet" everywhere: the creation editor (board, roadmap decision 25), the saved reading page, the version pen's grouped table and checklist labels, and the printed sheet. "Unallocated" retires from `IngredientTable.jsx` and `PrintSheetPages.jsx`, including the split-line name "…, Unallocated". No board draws the saved case; Sid is told, no redraw. (Mark, 2026-10-26)
- **D-13:** On the printed bench sheet an empty Targets, Equipment, Process or Before you start section is omitted with its heading and the next section closes up; no dash, no blank band. The on-screen Sheet already hides an empty Before you start and Instructions (`RecipeSheet` `--no-before` / `--no-method`). (Mark, 2026-10-26)

#### Focus, keyboard and struck values
- **D-14:** After remove on a step, focus goes to the next step's lead-in, else the previous step's lead-in, else the heading's Add step; a polite announcement names the removed step ("Step 2, Churn, removed"). (Mark, 2026-10-26)
- **D-15:** After remove on a row, focus goes to the next row's remove in the same group (step head or "Not in a step yet"), else the previous row's remove, else Add ingredient; a polite announcement names the ingredient. Phase 10's row remove adopts the same rule. (Mark, 2026-10-26)
- **D-16:** After Move up or Move down, focus stays on the same button of the moved item so repeated presses keep moving it; when that button turns off at the end of its list, focus moves to the item's other Move button; a polite announcement reads the new position ("Step 2 of 3"; "Whole milk, row 1 of 2 in step 1"). Off buttons carry `.mk-off` and `aria-disabled="true"`, stay in the tab order and do nothing on press (board, CONTRACT section 3). (Mark, 2026-10-26)
- **D-17:** The Add to step chooser (decision 014 1): opening puts focus on Cancel; Escape acts as Cancel and returns focus to Add to step; Tab moves through Cancel then the step controls in order; one chooser open at a time, opening another closes the first. Choosing a step moves focus to the moved row's remove (board). (Mark, 2026-10-26)
- **D-18:** Show changes on a later version, in the new tag row (decision 014 2): a changed target reads its label once, then the old value struck in the diff's strike colour, then the new value bold and underlined ("temp ~~80 °C~~ 85 °C"); a removed target is one struck tag; an added target carries the diff's added mark. No chip box anywhere in the method; the table's estimate flag `.target-chip.ingredient-table__flag` keeps its box. (Mark, 2026-10-26)

#### Proof and device check
- **D-19:** The walk harness runs with an allow-list: every existing route's snapshots and the store dumps must match Phase 10's result at this phase's base commit, and only the new edit route's snapshots and the records of a recipe the walk itself creates may differ. The before-walk is re-recorded at this phase's base commit if Phase 10's baseline no longer matches there (Phase 10 D-11's pattern, `10-walk.mjs` strict mode extended with the allow-list). The Save path has a forced-failure test proving a failed transaction leaves neither recipe nor version (roadmap Notes). (Mark, 2026-10-26)
- **D-20:** One iPad check at the end of the phase, from the production build (`npm --prefix app run build && npm --prefix app run preview -- --host`), as one check row on Mark's List: create a recipe with two steps and a split row, Move and remove by touch and by keyboard (the Move buttons' focus is the roadmap's medium-confidence item), Save, print to PDF and read the Sheet code, type it in Search, Edit and Save-over, type the code again. The steps are walked in WebKit first (verify-device-check-steps rule). Print is checked as the iPad PDF, not only in Chrome. (Mark, 2026-10-26)
- **D-21:** Before the first device build that can save a recipe, the export-first row goes on Mark's List (roadmap, the reset window), as a `check` row with `needs: "hands"`: export the store before testing Save on the device. The plan that lands Save adds the row; the orchestrator writes it (executors have no `ArtifactData`). (roadmap Notes; confirmed in discussion)

#### Fixed by sketch 014 and the roadmap (carry forward; do not re-decide)
- The four boards and their inlined CSS are the authority; `CONTRACT.md` sections 1 to 7 name every element, word and measure. Conformance is the board and the build side by side in WebKit, never prose or a test count. The boards add no token.
- Add note, Add ingredient and Add step sit on their heading's row in the Show/Hide control's look (013 decisions 29, 31, 33); Add ingredient is gone while the picker is open. Add step on the heading adds at the **beginning**; Add step on a step's acts row adds right after it; focus goes to the new step's lead-in. The heading's is the only Add step while there is no step.
- The open step in the creation editor has no box and no first-field margin (013 decision 32); the version pen keeps its box. Required stands under an empty lead-in and instruction. Preview step after Add target reads Hide preview while open and renders the step as the Sheet shows it, in the printed treatment, under the step's last field before the uses line (013 decision 34, decision 014 2).
- The step grammar is the version pen's open step (sketch 011 decisions 2 and 5): lead-in, instruction, targets, uses line ("uses nothing yet" / "uses …" · "change the ingredients" / "done" · "add a purpose" · "add an aside"), the Uses checklist, a purpose and an aside once added.
- Grams of a row in two steps are typed in the table, one line per step under each step's head with its own grams field and the build's portion line (roadmap decision 23); a split row with one line left reads as a one-line row (sketch 011 decision 56). Rows move within their step only (roadmap decision 9). Removing a step holding one line of a split row folds its grams back into the remaining line and the Balance stands (roadmap decision 24).
- Removing a row or a step deletes it outright and prunes what pointed at it: a removed row leaves every step's `uses`; a removed step's rows go back under "Not in a step yet" with their grams (roadmap decision 10, STRUCT-01). The stored step key never changes and no removed step's key is handed out again (`nextStepKey`, STRUCT-03); display numbers follow array order (`displayNumbers`). A row's id never changes.
- Every unplaced row's acts line ends with Add to step as soon as a step exists; pressed, the line becomes Cancel · "Step n, lead-in" per step ("Step n" alone with no lead-in); choosing ticks the row in that step's Uses and moves it under that head as its last row (decision 014 1).
- The ceremony reads "New recipe · draft" while creating and "Version 1 · editing" on the edit route, Cancel then Save (the filled action). After the first Save the page reads as a seeded root: Version 1 · Latest, no From version, "no reason recorded", History with one node, Batch margin not churned. Edit is an underlined word beside the filled Next version only while the version has no batch and no child; once a batch exists the acts row reads Next version alone and no other saved version ever shows Add, Remove or Move (STRUCT-04).
- Save goes through one `repository.createRecipeWithVersion` transaction over recipes, versions and drafts (roadmap Notes); the Sheet code is fixed at creation from the version id (roadmap decision 19), so a printed sheet finds its version after any edit. The slice order is the research's: steps and their allocation, then add, remove and move, then save, then print.
- 1366 only; no iPhone row (`todo-phone-jobs-product-brief`). Every new button, checkbox and radio renders through `ui/Button.jsx`, `Checkbox.jsx` or `Radio.jsx`; every link carries `tabIndex={0}`; every visual value reads a token.

### Folded Todos
- **Add a Preview Step link while editing a Step** (`.planning/todos/pending/2026-10-25-add-a-preview-step-link-while-editing-a-step.md`): Mark's note that actions like Add a target are hard to understand without seeing the result. Drawn as Preview step on `P11_Steps` (013 decision 34, `look-p11-preview-step` approve); this phase builds it with the step editor. Its file moves to completed when built.
- **Move the "Add ingredient" link to the heading row like "Add step"** (`.planning/todos/pending/2026-10-25-move-the-add-ingredient-link-to-the-heading-row-like-add-step.md`): drawn on every editor panel (013 decision 31, `look-p11-steps-r3` approve); this phase moves Add ingredient and Add note from under their lists (`CreationPage.jsx` `beforeFoot`, `notebook.css` `.mk-add-row`) to the heading rows. Its file moves to completed when built.

### Claude's Discretion
- Module homes and names: the step and structure ops as pure functions beside `domain/creation.js` (add, remove, move for steps and rows, place a row, set a step's uses, fold grams back), the edit route's component beside `CreationRoute.jsx`, how the saved version becomes a create-shaped draft and back, and the shape of the edit flag within D-02's constraint.
- The exact sentences of the stale-edit refusal (D-06), the step and row announcements (D-14 to D-16) and the import-refusal notice for a kept edit, within the existing sentences' shape.
- How the print omits empty sections (D-13) and where the printed "Not in a step yet" head sits, following sketch 010's grammar.

### Deferred Ideas (OUT OF SCOPE)

- The Recipe book print format (one page, the recipe only, no log): a second print format, its own todo and board (`.planning/todos/pending/2026-09-23-build-the-recipe-book-print-format.md`, canvas page "Print formats"). Not MAKE-12's bench sheet.
- An edited-date on a saved first version ("edited today"): rejected for now (D-03); would be a stored-shape addition after the reset window.

### Reviewed Todos (not folded)
- **Build the Recipe book print format** — a different print format; deferred as above.
- **Consider a "Mise en Place" auto-generator** — tagging ingredients to pull prep into Before you start; a new capability for a later phase.
- **Write a product brief for phone-based jobs** — parked on Mark's List (touched, waiting for `/marks-list`); Mark's note says recipe creation is not an iPhone job, which this phase honours (1366 only).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| MAKE-07 | Author Instructions steps (lead-in, text, targets) and say which rows each step uses and in what portions | `fitsCreateMethod` already accepts steps; allocation model G-2; step editor markup from `CONTRACT.md` section 2; split lines in the table (roadmap 23) |
| MAKE-10 | Save creates the recipe and first version in one step, lands on the new page, a failed save leaves neither behind | `createRecipeWithVersion` over `recipes`, `versions`, `drafts` (copy `importAll`); forced-failure test; Save gate that mirrors `transfer.js` (G-6); writer must end after Save (G-10) |
| MAKE-12 | Created recipe prints as a bench sheet with its Sheet code; typing the code finds it after later edits | Code is `codeFromVersionId(versionId)`, stored, never recomputed; Save-over keeps it; print reads the saved version only; D-13 finding G-5 |
| STRUCT-01 | Add and remove steps and rows on a first version, while creating and after Save; removal deletes outright and prunes | `creationSteps.js` ops with pruning and fold-back; tombstones (G-3); same editor on the edit route |
| STRUCT-02 | Reorder steps, and rows within a step, with Move up and Move down by touch and keyboard | Array-order moves; `aria-disabled` + `.mk-off`; focus request effect (G-13, D-14 to D-16) |
| STRUCT-03 | A step's stored number and a row's id never change on reorder | Moves splice the array only; display numbers derive (`displayNumbers`); property tests |
| STRUCT-04 | Add, Remove and Move controls only on a first version with no batch and no child; the pen's remove and restore on later versions unchanged | `isEditableFirstVersion` (pure), re-checked inside the save transaction (D-06); edit route redirect; the pen is not touched |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

Both `./CLAUDE.md` and `./.claude/CLAUDE.md` were read. Directives the plans must obey (treated as locked):

- Surface structural choices (routing, state, testing framework) rather than assuming; small reviewable steps. The routing choice here (edit route) and the draft kind are already Mark's (D-01, D-02); anything else structural goes in the plan as a stated choice.
- **Domain math lives in framework-free modules under `app/src/domain/`** (no framework, DOM or store import); domain tests run under Vitest's `node` environment (`vitest.config.js` default). New step, allocation and save-builder modules go there.
- **Every store access goes through `app/src/store/repository.js`**; no other module imports `idb`.
- **Every visual value reads a CSS custom property** from `app/src/styles/tokens.css`; no literal in a component or stylesheet. The boards add no token (sketch 014 `CONTRACT.md` section 6).
- **No `dangerouslySetInnerHTML`** under `app/src`; notes and prose render as text.
- **Every link carries a literal `tabIndex={0}`; every button, checkbox and radio renders through `ui/Button.jsx`, `Checkbox.jsx` or `Radio.jsx`** (`tabindex-scan.test.js` enforces it).
- Agent prose, commit messages and browser-test input values are English.
- Device UAT is served from `npm --prefix app run build && npm --prefix app run preview -- --host`, never the dev server. One Vite process per workspace; the harnesses build to a scratch `--outDir` and never touch `app/dist`.
- Every `app/` edit goes through a GSD command; Impeccable decides, GSD builds. TypeScript is not adopted. No `DB_VERSION` change from this phase on.
- Mark's List: `gsd-executor` has no `ArtifactData`, so a plan with a Mark's List step stops at a `checkpoint`, the orchestrator writes and reads back the rows, then spawns a continuation (memory: gsd-executor-has-no-artifactdata). See "Mark's List rows".
- `.claude/skills/sketch-findings-sprinkles/SKILL.md` was read: its index covers sketches 003 and 007 (page shell, battery, cross-cutting type and 44 px targets). Nothing in it contradicts sketch 014; sketch 014 and 013 are the authority for this phase.

## Architectural Responsibility Map

This is a single-tier browser app (no server). The tiers that matter are inside it.

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Step, row and allocation ops (add, remove, move, place, fold) | Domain (`app/src/domain`, pure) | UI handlers call them via functional `setCreateDraft` updates | Must be provable under the `node` environment; STRUCT-03 is a property of these functions |
| Save gate and `{recipe, version}` builder | Domain (pure) | UI shows the messages | Mirrors `transfer.js`; deterministic (ids and clock passed in, as `createRecipe` already does) |
| One-transaction Save, Save-over, orphan check | Store (`repository.js`) | Domain supplies the pure checks (`sheetCodeProblems`) | Atomicity and the stale-edit check must run inside the transaction (D-06, D-19) |
| Kept edit draft (key = version id) | Store (`drafts`) via `useKeptDraft` | Domain (`draftMatchesEdit`) | Existing 250 ms debounce and unmount flush; shares the key space with pen drafts (G-1) |
| Step editor, row controls, heading rows | UI (`CreationSteps.jsx`, `IngredientTable.jsx`, `RecipeSheet.jsx`) | CSS (`notebook.css`, `app.css`) | Shared Sheet in `creating` mode |
| Reading-step print treatment on screen | UI (`Method.jsx`, one shared reading-step component) | CSS (`app.css`, tokens `print.css` already reads) | Same grammar as `PrintSheetPages.jsx`, screen classes |
| Edit route and page acts (Edit, Resume editing) | UI (router, `EditRoute.jsx`, `VersionRow.jsx`, `NotebookPlace.jsx`) | Domain eligibility function | Redirect and hide logic must agree with the transaction's check |
| Sheet code and print | Domain (`codeFromVersionId`) and UI (`PrintSheetPages.jsx`) | Store holds the stored code | Code fixed at creation; print reads the saved version only |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.8 | UI | Pinned in `app/package.json` [VERIFIED: app/package.json, `"react": "19.2.8"`] |
| react-router | 8.3.1 | Routes (`createBrowserRouter`), `useNavigate`, `Navigate` | Existing router; the edit route is one more entry [VERIFIED: app/package.json, `"react-router": "8.3.1"`] |
| idb | 8.0.3 | IndexedDB, only inside `store/db.js` and `repository.js` | Existing seam [VERIFIED: app/package.json, `"idb": "8.0.3"`] |
| Vite | 8.2.2 + `@vitejs/plugin-react` 6.1.1 | Build; harnesses build to scratch `--outDir` | Ratified stack [VERIFIED: app/package.json] |
| Vitest | 5.0.0 | Tests; `node` default, `@vitest-environment jsdom` per file | Ratified [VERIFIED: app/package.json, app/vitest.config.js] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| fake-indexeddb | 6.2.5 | Real-IndexedDB semantics in `repository.test.js` | The forced-failure Save test (D-19) [VERIFIED: app/package.json devDependencies] |
| jsdom | 30.1.1 | Component tests | Creation flow, edit flow tests |
| playwright-core (npx cache, not a project dependency) | 1.63.0 | WebKit for the walk and board harnesses | `PLAYWRIGHT_CORE` path in the harnesses; WebKit build `webkit-2359` is installed [VERIFIED: `ls ~/Library/Caches/ms-playwright`, this session] |

### Alternatives Considered
None apply: the stack is ratified and CONTEXT locks the routes, the draft family and the transaction. No form library, no drag-and-drop library (Move up and Move down buttons are the specified control), no state library.

**Installation:** none. **Version verification:** versions read from `app/package.json` this session; no registry lookup is needed because nothing is installed.

## Package Legitimacy Audit

No external package is installed or upgraded by this phase, so the legitimacy gate has nothing to check.

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| (none) | — | — | — | — | — | No install |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

## Findings that change the plan (read before planning)

Each finding says what the code does, what CONTEXT assumed or left open, and the recommended resolution. A finding marked **Mark** needs his answer or a stated default he can veto; the rest are the planner's within CONTEXT's discretion.

### G-1. An edit draft shares its key with the version's pen drafts, and the recipe page deletes drafts it does not recognise

- The drafts store is keyed by the version id: `db.createObjectStore('drafts', { keyPath: 'versionId' });` [VERIFIED: app/src/store/db.js:62]. An edit draft for a saved version therefore has the same key as that version's `plan`, `record` and `amend` drafts. Only one can exist.
- The recipe page's restore runs `draftMatchesVersion(record, version, batches, catalog)` on whatever `getDraft(versionId)` returns and deletes a record that fails: `if (!(creating ? draftMatchesCreate(record) : draftMatchesVersion(record, version, batches, catalog))) { Promise.resolve().then(() => repository.deleteDraft(versionId)).catch(() => {});` [VERIFIED: app/src/ui/useKeptDraft.js:184-185]. `draftMatchesVersion` returns false for kind `create` (`if (record.kind === 'create') return false;` [VERIFIED: app/src/domain/draft.js:309]) and for any kind outside `const KINDS = ['plan', 'record', 'amend', 'create'];` [VERIFIED: app/src/domain/draft.js:53].
- Consequence: opening the saved version's page deletes its kept edit draft, whichever way D-02's "flag or sibling kind" is chosen. Home's lead already filters with `draftMatchesVersion` and would ignore the edit, which is fine; the recipe page's restore would not.
- **Resolve:** (a) make the edit a sibling kind `'edit'` (leaves `CREATE_DRAFT_KEYS` and `draftMatchesCreate` untouched; a kind check already makes every create consumer, the Notebook's single draft row, `CreationRoute`, Start's one-creation check and the Shell guard, ignore it, which is exactly D-02's "must not match an edit draft"). Add `draftMatchesEdit(record)` that runs the same payload check and requires `record.kind === 'edit'`. (b) In `useKeptDraft`'s restore, before the `draftMatchesVersion` test and only when `!creating`, leave a record of kind `'edit'` alone: `setDraftRestoreDone(true); return;` without setting `draftStoredRef.current`. The persist effect then neither writes nor deletes it (it only deletes when `draftStoredRef.current` is true). (c) Edit must not start, and the Edit link must not show, when the version already has a kept draft of any other kind (a Next version or Record pen in progress); the page already holds `drafts` from `useRecipeData`. (d) The edit route must redirect to the page when `getDraft(versionId)` returns a non-edit record, never overwrite it.
- Source-text pins to update for the sibling kind, named in the plan that changes them (`RecipePage.shell.test.js:258` onward, the `useKeptDraft` entry [VERIFIED: grep]): `['draftMatchesCreate(record)', 1]`, `["kind: 'create'", 1]`, `['onRestoreCreate(record.payload)', 1]`, `['repository.deleteDraft(versionId)', 3]` (stays 3 if the guard adds no call), `['draftMatchesVersion(', 1]`. The cleanest change keeps every count: add one hook parameter `creationKind = 'create'`; persist with `kind: creationKind` (replaces the `kind: 'create'` literal, so that marker changes, say so); restore with a single expression `creating ? matchesCreation(record, creationKind)`. The `shellLacks` list for `useKeptDraft` forbids `draftMatchesCreate(` and `onRestoreCreate` in `RecipePage.jsx` itself, so the edit page must not call them from the shell file either.

### G-2. Placement must be read from `step.uses`; a draft row's `step: 1` is a placeholder (the allocation model)

- A draft row is `{id, libraryId, portions: [{step, grams: string}]}` and every new row gets `portions: [{ step: 1, grams: '' }]` [VERIFIED: app/src/domain/creation.js `addRow`]. `fitsCreatePortion` requires `Number.isSafeInteger(portion.step) && portion.step > 0` [VERIFIED: app/src/domain/draft.js:412-420] and draft.test.js pins "refuses a portion whose step is 0" [VERIFIED: app/src/domain/draft.test.js:649]. The first step the maker adds gets `nextStepKey([])` = 1 [VERIFIED: app/src/domain/stepKeys.js:24-36, "An empty method gives 1"]. If placement were read from `portion.step`, every existing row would instantly belong to the new step 1, contradicting the board ("A step just added: five closed", every row unplaced, every row ending in Add to step).
- `groupPortionsByStep` treats a portion whose step does not resolve as unallocated: "A portion whose step does not resolve ... joins one trailing 'Unallocated' group" [VERIFIED: app/src/ui/IngredientTable.jsx:20-30, header comment of `groupPortionsByStep` at line 36].
- **Resolve (keep the draft shape; change meaning):**
  - **In the draft**, `step.uses` (ordered row ids) is the only truth for placement. A row used by k live steps has exactly k portions, one per such step, each `{step: <that step's n>, grams: <raw string>}`; a row used by no live step has exactly one portion `{step: 1, grams}` that means "unplaced" and is never read for placement. `isUniqueBy(portions, step)` still holds. A kept Phase-10 draft (rows at step 1, no method) is already valid under this reading.
  - **In the projection and in the saved version**, an unplaced row's single portion is written with `UNPLACED_STEP = 0` (a constant exported from the new domain module). `transfer.js` accepts it: `if (!isFiniteNumber(portion.step))` is the only step test on a portion [VERIFIED: app/src/store/transfer.js:111-113]. `displayNumberOf(map, 0)` is null, so the existing grouping puts the row under the unplaced head with no code change in `groupPortionsByStep`. The alternative that needs no new convention is `nextStepKey(method)` (an unissued key; with no steps that is 1, which is today's "rows wait at step 1", `creation-roundtrip.test.js:67`); 0 can never collide with an issued key, so 0 is recommended. **Planner's call; stated so the executor does not improvise.**
  - Group order inside a table group is the `rows` array order (the grouping iterates `rows`, then portions), so "last row of that step's group" and "Move up within a step" are array operations on `draft.rows`.
  - On load for Edit, derive placement the other way once: for each stored row, a portion whose step resolves to a stored step is placed there; rebuild every step's `uses` from that (rows order). A version created in the app is already consistent.

### G-3. Removed steps stay in the draft as hidden tombstones; Save strips them

- The create-draft header already decides this: "A step removed while creating therefore stays in the method with removed: true and the editor never shows it" [VERIFIED: app/src/domain/draft.js:360-364], and `fitsCreateStep` accepts `removed` as a boolean [VERIFIED: draft.js:433-436]. `nextStepKey` "reads the highest n over every step, removed ones included" [VERIFIED: stepKeys.js header]. CONTEXT: "no removed step's key is handed out again (`nextStepKey`, STRUCT-03)".
- Saving a tombstone would leak into the version pen: `penDraftFromVersion` copies `version.method` whole (`method: structuredClone(version.method)` [VERIFIED: app/src/domain/penDraft.js `penDraftFromVersion`]), so a creation-time deletion would reappear in the next version as a struck, restorable "removed" step. **Resolve:** blank the tombstone when removing (`{n, leadIn:'', instruction:'', uses:[], targets:[], removed:true}`), filter it everywhere in the editor and the projection, and drop it at Save and at Save-over. `.planning/research/ARCHITECTURE.md` ("Hard delete with reference pruning") agrees a reused key is harmless once pruning is in place and the saved first version holds no `removed` steps. The ledger only has to hold inside one editing session, because nothing references a first version's step keys until it has a batch or a child.

### G-4. D-19's "existing routes must match" cannot hold once reading steps change; the walk needs a method-text normalisation

- `snapshot()` hashes `document.querySelector('.notebook')?.innerText` into `textHash` [VERIFIED: .planning/phases/10-the-creation-editor-without-save/10-walk.mjs:178 `text: document.querySelector('.notebook')?.innerText ?? '',` and :182 `textHash: createHash('sha256').update(text).digest('hex')`]. `innerText` applies CSS `text-transform`.
- The walk visits Olive Oil v1, whose ten steps carry targets, purposes and asides (read this session: step 1 `temp room`, purpose; step 2 `temp 85 °C`, `hold 2 min`, aside; step 4 purpose and aside; and so on). Criterion 6 uppercases the target labels (`text-transform: uppercase` in the board's CSS) and adds the word "why" and an em dash before every purpose, so every Olive Oil snapshot's `textHash` changes by design.
- The Phase 10 baseline itself is still sound: `sh .planning/phases/10-the-creation-editor-without-save/10-walk-check.sh` at HEAD (`cf64aa70`, the newest commit to touch `app/`) printed `MATCH 94 snapshots` [VERIFIED: run this session]. A re-record is needed anyway, because the walk script changes (below), not because the baseline drifted.
- **Resolve:** `11-walk.mjs` replaces `textHash` with two values computed from markup both builds share: `textHash` over `.notebook` innerText with `.method-region` removed from a clone, and `methodHash` over the textContent of, per step, `.method-step__n`, `.method-step__lead`, each `.target-chip__label` and `.target-chip__value`, the `.method-step__purpose` text with a leading `why — ` removed, and the `.method-step__aside` text. The classes exist in the base build and the new one, so `11-walk-record-base.sh` records the baseline from BASE `cf64aa70` with the new script. Everything else stays strict. The allow-list is: (1) scenarios whose names the script lists as new (the create and edit walks) may exist only on the after side, their snapshots and the records they make are not compared; (2) nothing else. `selftest` gains doctorings proving a changed leaf in an existing scenario, a changed `methodHash`, and a removed step are still refused.

### G-5. The printed sheet has no Targets, Equipment or Process section to omit

- `PrintSheetPages.jsx` prints: the band (`Headnote`), Before you start (only when `blocks.notes.length > 0`, `before: blocks.notes.length > 0` in `wholePlan`), the Ingredients table, the Balance column, the Instructions (only when steps exist), and the closing foot [VERIFIED: app/src/ui/PrintSheetPages.jsx `SheetPage`, `wholePlan`]. `grep -n "equipment\|process" ui/PrintSheet.jsx ui/PrintSheetPages.jsx ui/Headnote.jsx ui/RecipeSheet.jsx ui/BasisNote.jsx` returns nothing [VERIFIED: grep, this session]. "Targets" appear only as the Balance gauges' bands; with none, `describeDeviation` returns `{ kind: 'none', amount: null, words: 'no target set' }` [VERIFIED: app/src/domain/figures.js:105-107].
- So D-13 and success criterion 5's "no gap" are already true for Before you start and Instructions, and the other three names describe sections that do not exist. **Resolve:** write the omission as a test over `sheetBlocks` and `SheetPage` for a created version with no notes, no steps, no targets, equipment or process (no throw, no empty heading, `layPages` gives pages without a blank band), and check one printed PDF of such a recipe in WebKit. Build nothing new unless that check shows a gap. **Mark** only if he meant something else by "Targets" (Open Question 6).
- `recipe-page--no-before` and `recipe-page--no-method` are on-screen grid-area modifiers (`app.css:489-510`, repeated in two media blocks at 2393-2411 and 3103-3111), set by `RecipeSheet.jsx` when a section is not drawn [VERIFIED: file reads]; they are not print rules. The printed sheet omits a section in `wholePlan`/`layPages`: `before: blocks.notes.length > 0` and `instructions: blocks.steps.length > 0 ? { ... } : null` [VERIFIED: PrintSheetPages.jsx `wholePlan`]. `print.css` has `.ps-before` and `.ps-instructions` as plain blocks; nothing in it needs to change for an empty section.
- Rename the head: "Unallocated" appears at three code sites, `IngredientTable.jsx:850` (the split-line name `…, Unallocated`), `IngredientTable.jsx:930` (the head), `PrintSheetPages.jsx:62` (`label: group.kind === 'unallocated' ? 'Unallocated' : ...`), and in `IngredientTable.test.jsx` [VERIFIED: grep]. Replace each with "Not in a step yet" (D-12).

### G-6. The Save gate must also mirror `transfer.js`, or a saved recipe can export a file that will not import

`validateStoreFile` is the only gate before an import, and the created version must pass it [VERIFIED: app/src/store/transfer.js]. What it requires of a version, quoted:

- Steps: `typeof step.removed !== 'boolean'`, `!Array.isArray(step.uses) || !step.uses.every(isNonEmptyString)`, `!Number.isSafeInteger(step.n)`, `!isNonEmptyString(step.leadIn)`, `!isNonEmptyString(step.instruction)`, `!Array.isArray(step.targets)`, and each target `!isPlainObject(target) || !isNonEmptyString(target.label) || !isNonEmptyString(target.value)` [VERIFIED: transfer.js:163-205]. So a saved step needs `removed: false` and a `uses` array even when empty, and no target may have an empty side. `purpose` and `aside` are not validated; drop them when empty (D-10).
- Notes: `if (!isStringOrNull(note.inheritedFrom))` where `isStringOrNull` is `value === null || typeof value === 'string'` [VERIFIED: transfer.js:70-72, 213]. A draft note is `{text}` only, so Save must write `{ text, inheritedFrom: null }`. CONTEXT does not say what an empty Before you start note does at Save; **recommend dropping empty notes** (as empty purpose and aside are dropped).
- Row: `removed` boolean, `libraryId` an own key (null or non-empty), `portions` non-empty with finite step and grams of at least zero [VERIFIED: transfer.js:103-160].
- Declared problems: at most two, unique, non-empty: `expected each declared problem once` [VERIFIED: transfer.js:398-414]. **D-11 lists no duplicate-problem check, but the create-draft header assigns it to Save** ("Two problems may hold the same words: refusing that is Phase 11's Save" [VERIFIED: draft.js:352-353 "unique problem words, ... is Save's job in Phase 11"; creation.js:305 "problems may hold the same words: refusing that is Phase 11's Save"]). Without it a saved recipe's export fails to re-import. **Add it to `creationSaveBlock`** with a sentence in the existing shape (the planner words it; flag it to Mark in the summary).
- Declared scales: `isScaleDefinition` and `group === 'declared'`, key not a core key, unique keys, at most `MAX_RECIPE_SCALES` [VERIFIED: transfer.js:371-390]. Phase 10's Required (name, both ends, kind) already covers what `isScaleDefinition` checks; same names on two scales are allowed by the validator.
- `serveTempC` is a required own key, null or a finite number [VERIFIED: transfer.js:663-665]. The draft holds a string, possibly the marker `'unreadable number'` (`MALFORMED_NUMBER_ENTRY` [VERIFIED: ui/BatchRow.jsx:82]); `Number(raw)` finite, else null. Small call: an unreadable entry could refuse Save with the temperature sentence the record pen already uses, or save null; recommend null (not in D-11), listed in Open Questions.
- A draft row whose library entry is missing is left out of `creationSheetVersion` silently (`if (!record) continue;` [VERIFIED: creation.js `creationSheetVersion`]); Save must never drop a row silently. Refuse with a message under that row (practically unreachable: import is refused while a draft is kept).
- `versionLabel` non-empty, `sheetTitle` and `sheetDescription` strings, `createdAt` non-empty [VERIFIED: transfer.js `validateVersion`].
- Save-time fields the draft does not hold: `schemaVersion` is 6 (`const VERSION_SCHEMA_VERSION = 6;` [VERIFIED: newRecipe.js:22]); `iceEd` and `targets` are optional to the validator but a child copies them only when the parent owns them (`KEYS_COPIED_WHEN_OWNED = ['coefficientSetName', 'targets', 'equipment', 'process', 'iceEd']` [VERIFIED: lineage.js:110]), so write both at creation (`targets: {}` when none). Seeded `iceEd` is `{ style, servingTemperatureC, hardness, overrunPercent }` with `style` a style **name** such as `'Gelato'` [VERIFIED: data/olive-oil.js:106]; the draft holds the style **id** (D-08b). Write `iceEd: { style: <style row name>, servingTemperatureC: <number|null>, hardness: null, overrunPercent: null }` and map name back to id from the catalog on Edit load. Nothing reads `iceEd` in `ui` or `domain` today [VERIFIED: grep, only `data/` files], so this is invisible to the app and cheap to change.
- Extend `store/creation-roundtrip.test.js` (it already proves a created root passes `validateStoreFile`, a child, a batch and a Sheet code [VERIFIED: file read]) to a version with steps, targets, a split row, an unplaced row, scales and problems.

### G-7. An untouched edit would lock the version (Mark)

The persist effect's `creating` branch always builds a record, "kept until Cancel, even when every field is blank (D-04a)" [VERIFIED: useKeptDraft.js, `if (creating) { record = buildDraftRecord(...)`]. On the edit route that would write an edit draft 250 ms after Edit is pressed, even if the maker changes nothing, and D-04 then hides Next version and Record a batch and refuses import until Resume or Cancel. **Recommend:** the edit page passes the seed payload as a `cleanPayload`; while the draft deep-equals it the hook takes its existing `!record` branch (delete if stored, write nothing), so an untouched Edit leaves no trace. It is an addition to the `creating` condition, not a new call site. **Mark** may prefer "kept until Cancel" as for creation (Open Question 3).

### G-8. Edit eligibility needs more than "no batch, no child"

`isEditableFirstVersion(version, versions, batches, drafts)` (pure) should be true only when: `version.parentVersionId === null`; no batch on the version; no version whose `parentVersionId` is this id; every row has a non-null `libraryId` (the create draft requires one: `isSafeName(row.libraryId)` [VERIFIED: draft.js `fitsCreateRow`]; Strawberry v1 has rows without one [VERIFIED: run this session]); and no kept draft of another kind on the version (G-1). Read this session: no seeded root qualifies (every seeded root has a batch or a child), so Edit appears only on recipes made in the app or imported. The same function runs on the page (props `version`, `versions`, `batches`, `drafts` are already loaded by `useRecipeData`), on the edit route, and, as a transaction read, inside `saveFirstVersionOver` (D-06).

D-04 hides Next version and Record a batch on the version's page while an edit is kept. The openers to cover, all found by grep: the acts row's Next version and, below 724, the record act (`VersionRow.jsx` acts block, `openPen === null &&`, line ~423 [VERIFIED]); `BatchRow.jsx` Record a batch / Record another / Record a tasting (lines ~769-780, ~1301-1309); the Home row actions `RecipeList.jsx:202` (Record a batch) and `:224` (Next version, which navigates with `state={{ startNextVersion: true }}`); and the two route intents in `useRouteIntents.js`. D-04 is silent on Home. **Recommend** a page-level refusal as the safety net (the handlers `onStartDeveloping` and `onStartRecording` do nothing while an edit is kept, and a pending route intent is consumed silently) plus hiding the page controls; Home may keep its links (they land on a page that reads Resume editing). Also decide the Edit link at narrow widths: sketch 014 is 1366 only, but the page's acts row renders at every width; hide Edit below the editor's width, or accept it (Open Question 5).

### G-9. D-18's "the diff's added mark" does not exist

D-18 says an added target "carries the diff's added mark". Neither the build nor any sketch defines one: `grep -n "added\b\|--added\|__added\|is-added" styles/app.css` finds only an unrelated comment [VERIFIED: grep]; Method.jsx says a new step "reads plain until Impeccable draws its mark (G-03.5-2a)" [VERIFIED: Method.jsx, show-changes branch comment]. `buildTargetDiff` returns `{label, from, to, changed}` per label, current labels first then baseline-only ones, `from: null` for an added target and `to: null` for a removed one [VERIFIED: diff.js:152-170], and today's markup maps over `step.targets`, so a removed target is never drawn. **Resolve:** render the tag row from `stepDiff.targets` (so removed targets appear as one struck tag), changed = label once, old value struck (`.struck-value`, ink, the Strike Rule), new value bold underlined; added = plain, as an added step reads, unless Mark names a mark. **Mark / Sid** (Open Question 2).

### G-10. Save must stop the draft writer before it navigates, or the unmount flush resurrects the draft

`useKeptDraft`'s unmount cleanup calls `flushPendingDraft()`; it returns early only when `endedRef.current` is set, which `discardDraft({ final: true })` does [VERIFIED: useKeptDraft.js, `function flushPendingDraft` and the unmount effect]. The save transaction deletes the draft; navigating away then unmounts the page, and any pending record (a keystroke inside the 250 ms window, or the persist effect's last write) is saved back under the new version's id. The Notebook would then show a draft row for a recipe that exists, violating criterion 3 ("no longer offers Resume").
**Resolve:** add one writer method `endDraft()` that sets `endedRef`, clears the timer and `pendingDraftRef`, and does not delete (the transaction already did). Call it after a successful save and before `navigate`. A debounce flush landing between the press and the commit is handled by the transaction deleting the draft and `endDraft()` running right after; to be safe also hold writes for the duration of the transaction and release them if it fails (same shape as `discardDraft({ final: true })`'s failure branch). `useDraftWriter`'s pinned markers are `function flushPendingDraft(` and `function discardDraft(`, count 1 each; a new `function endDraft(` does not disturb them.

### G-11. Pins and structure the editor changes

- `showsMethodRegion({ mode, steps })` is `return mode === 'developing' || steps.length > 0;` [VERIFIED: Method.jsx:519-521]. The Instructions region must show in `creating` with no step (the board is the heading row alone): add `|| mode === 'creating'` inside the function, not at the call site. `RecipePage.test.jsx:1167` pins the call expression `showsMethodRegion({ mode, steps: methodSteps })` and the `sheetClassName` string; `Method.test.jsx:1486` onward tests the function (add a creating case, the existing ones stay) [VERIFIED: file reads].
- `RecipeSheet.jsx:91-92` reads `const beforeRegionShown = mode === 'developing' || mode === 'creating' || beforeNotes.length > 0;` [VERIFIED]. The heading rows (`div.mk-head-row` holding the `h2.region-name` and a `Button.text-control.mk-head-act`) replace the bare `<h2 className="region-name">` in the Before you start section, in `IngredientsHead` (it already returns a bare heading when not below 724; pinned only for the tag that carries `onToggleShowChanges={onToggleShowChanges}`, `RecipeSheet.test.jsx:103-112`), and in `Method`'s heading. `CreationPage.jsx` stops passing `beforeFoot` and the Add ingredient half of `ingredientsFoot`; the open picker still goes in `ingredientsFoot`. `CreationPage.jsx:145-151` focus selectors (`.before-region .mk-add`, `.ingredient-table-region .mk-add`) become `.mk-head-act`.
- `IngredientTable.jsx:597` reads `const showStepHeads = !(groups.length === 1 && groups[0].kind === 'unallocated');` [VERIFIED]. The board draws the "Not in a step yet" head as soon as one live step exists even when it uses nothing, so with `isCreating` and at least one live step, `showStepHeads` is true. With no step the table stays flat.
- `renderCreatingEntry` draws one `<tr>` per entry with the grams field wired to `creationRows.gramsByRow` keyed by row id and `registerGramsInput(row.id, 0, ...)` [VERIFIED: IngredientTable.jsx `renderCreatingEntry`]. Split rows need per-line state: key the raw grams, the focus registry and the unreadable set by `${row.id}:${portionIndex}`, label multi-line fields `${name}, grams, portion n` as `GramsCell` does, and add the portion note (`formatPortionLine(portion.grams, rowGrams(liveRow), mass)`) when the row has more than one line.
- The reading restyle collides with a CSS pin: `cross-cutting.test.js:769` requires the base rule `.method-step__purpose, .method-step__aside` to keep `font-style: italic` and `font-family: var(--face-text)` [VERIFIED: file read]. Keep that rule and override it with a more specific selector, as the board does. The board scopes with `.method-step:not(.mk-step)`, which would also strip the box off the version pen's open step chips of fields (those are `li.method-step` without `.mk-step`); CONTRACT section 7 says they stay boxed. Scope the read-only restyle with a modifier on the read-only targets paragraph instead (for example `method-step__targets--tags`), not with `:not(.mk-step)`.
- Method.jsx markup pins the restyle changes: `Method.test.jsx:734-735` (`'<p class="method-step__purpose">Original purpose.</p>'`) and `:219` stay valid only if `target-chip__value` keeps its markup; `PrintSheetPages.test.jsx:317` (`not.toContain('target-chip')` inside `PrintInstructions`) is unaffected because print is untouched.

### G-12. An orphaned edit draft must not block import forever

If a batch or a child is made in another tab while an edit draft is kept, the edit is dead (D-06) but the draft stays until Cancel. The Shell refuses import for any kept edit; the Notebook shows Resume editing only for an eligible version; the edit route redirects an ineligible one. Together that is a deadlock with no Cancel. **Resolve:** whichever surface finds an edit draft whose version is gone, has a batch, or has a child deletes it quietly (the restore's own "no longer fits" rule): the edit route on redirect, and the Notebook on load (it already reads versions, batches and drafts). D-06's in-tab path still keeps the draft and says why, because the maker is looking at it.

### G-13. Focus after a move or a remove: do not trust the DOM to keep it

React reorders keyed siblings with `insertBefore`; moving a focused node can blur it in WebKit and Chrome [ASSUMED: standard DOM behaviour, not probed this session; the roadmap rates Move-button focus on iPad WebKit "medium confidence" and CONTEXT D-20 probes it on the device]. Implement D-14 to D-16 as a focus request (a ref set by the handler, acted on in an effect after the render that drew the target), the pattern `CreationPage.jsx` already uses (`focusRequestRef`, `pageRef.querySelector`). Give each target a stable selector: the control's own aria-label (`Step 2, move down`, `Whole milk, move up`). When the pressed Move button turns off at the end of its list, put focus on the item's other Move button (D-16). Prove it in WebKit with the walk (focus is part of `snapshot()`), then on the iPad.

## Architecture Patterns

### System Architecture Diagram

```
 Notebook (/notebook)                       Recipe page (/notebook/:r/:v)
  New recipe -> Start -> saveDraft(create)    acts row: Next version | Edit | Print sheet
  recipe row: Resume editing (edit draft)     (Edit only if isEditableFirstVersion and no other draft)
        |                                              |
        v                                              v
 /notebook/new  ---- CreationRoute            /notebook/:r/:v/edit ---- EditRoute
   finds kept `create` draft                    reads version, recipe, versions, batches, getDraft(v)
        |                                       redirect to page if ineligible / foreign draft
        |                                       seed = kept `edit` draft | draftFromVersion(version, recipe)
        +----------------+-----------------------+
                         v
                CreationPage (mode: create | edit)         <- hooks above early returns; restore once (StrictMode)
                 createDraft state (new object per change)
                 |  functional setCreateDraft(prev => op(prev, ...))
                 |        ^
                 |        |  pure ops: creationSteps.js (add/remove/move step, place/move/remove row,
                 |        |            toggle uses, fold grams) + creation.js (notes, grams, style, scales)
                 v        |
        creationSheetVersion(draft, library)  -> version-shaped object (live steps only, UNPLACED_STEP=0,
                 |                                multi-portion rows, targets that parse)
                 v
         sheetView(baseline:null, mode:'creating') -> RecipeSheet
           heading rows: Before you start | Ingredients | Instructions   (Add note / Add ingredient / Add step)
           IngredientTable (creating): step heads, split lines, row acts, "Not in a step yet", Add to step chooser
           CreationSteps (Instructions): open steps, Uses checklist, Preview step -> reading-step component
                 |
                 v  useKeptDraft(creating:true, creationKind) -> 250 ms debounce -> saveDraft (kind create | edit)
                 |
   Save pressed: creationSaveBlock(draft) -> messages for ALL refusals at once, focus first in page order
                 |  none:
                 v
        buildCreation(draft, library, styles, ids, now) -> { recipe, version }   (pure; = transfer.js-valid)
                 |
      create:  repository.createRecipeWithVersion({recipe, version})   one tx: recipes + versions + drafts
      edit:    repository.saveFirstVersionOver({recipe, version})      one tx: + batches (by-version) check
                 |  ok                                   |  { saved:false, reason } -> D-06 line, draft kept
                 v
        writer.endDraft() -> navigate(notebookPath(r, v), { replace: true, state: { focusVersion: true, saved: 'created'|'edited' } })
                 v
        RecipePageForRoute reads `saved` once -> announcePageStatus('Recipe saved.' | 'Changes saved.') (5 s) -> replaces state
```

### Recommended Project Structure
```
app/src/
├── domain/
│   ├── creationSteps.js      # NEW pure: UNPLACED_STEP, liveSteps, placementOf, addStep, removeStep,
│   │                         #   moveStep, setStepField, add/set target, toggleStepUses, placeRow,
│   │                         #   moveRow, removeRowPruned, setLineGrams, addGrams (decimal-safe), checkAllocation
│   ├── creation.js           # EDIT creationSheetVersion (method, multi-portion, sentinel); removeRow prunes uses
│   ├── creationSave.js       # NEW pure: creationSaveBlock, buildCreation, draftFromVersion,
│   │                         #   isEditableFirstVersion, applyEditToVersion (Save-over)
│   ├── newRecipe.js          # EDIT createRecipe: optional method/authored/scales/problems/targets/iceEd/serveTempC/description
│   └── draft.js              # EDIT add kind 'edit' + draftMatchesEdit (shares the payload check)
├── store/repository.js       # EDIT + createRecipeWithVersion, saveFirstVersionOver
└── ui/
    ├── CreationSteps.jsx     # NEW Instructions region for `creating` (heading row, open steps, Uses, Preview)
    ├── StepReading.jsx       # NEW one reading-step body (lead, tag row, why, aside) used by Method (3 branches) and Preview
    ├── EditRoute.jsx         # NEW /notebook/:r/:v/edit wrapper (CreationRoute's twin)
    ├── CreationPage.jsx      # EDIT mode prop, Save/Cancel, handlers, focus + announcements
    ├── IngredientTable.jsx   # EDIT creating lines, row acts, Add to step chooser, heads, "Not in a step yet"
    ├── RecipeSheet.jsx / Method.jsx / VersionRow.jsx / NotebookPlace.jsx / Shell.jsx / useKeptDraft.js / notebookPaths.js / router.jsx
    └── styles: notebook.css (mk-* editor rules under `.notebook`), app.css (reading-step treatment)
```
Keep creation ops out of `penDraft.js`: the version pen must provably be unable to add or remove structure (`.planning/research/ARCHITECTURE.md`, "Alternatives rejected"; CONTEXT canonical refs). `setPenStepField`, `setPenStepTarget` and `togglePenStepUses` only touch `draft.method` and would run on a create draft [VERIFIED: penDraft.js], so `setStepField` and target edits may mirror them or call them; `togglePenStepUses` must NOT be used for ticking, because ticking also moves portions (G-2).

### Pattern 1: Placement is read from `uses`, portions follow
**What:** every op keeps the invariant "row r has one portion per live step whose `uses` contains r, in step order; if none, exactly one placeholder portion".
**Example (shape; names are the plan's):**
```js
// Source: derived from draft.js fitsCreateRow / stepKeys.js nextStepKey / groupPortionsByStep, verified this session
export const UNPLACED_STEP = 0;
const liveSteps = (draft) => draft.method.filter((step) => !step.removed);
const placementOf = (draft, rowId) => liveSteps(draft).filter((step) => step.uses.includes(rowId)).map((step) => step.n);

export function addStep(draft, { afterN = null } = {}) {
  const step = { n: nextStepKey(draft.method), leadIn: '', instruction: '', uses: [], targets: [] }; // counts tombstones
  if (afterN === null) return { ...draft, method: [step, ...draft.method] };            // heading's Add step: at the beginning
  const at = draft.method.findIndex((s) => s.n === afterN);
  if (at < 0) throw new RangeError(`no step ${afterN}`);
  return { ...draft, method: [...draft.method.slice(0, at + 1), step, ...draft.method.slice(at + 1)] }; // step's own Add step
}

export function removeStep(draft, n) {                                                   // tombstone, fold, prune
  const gone = liveSteps(draft).find((s) => s.n === n);
  if (!gone) throw new RangeError(`no live step ${n}`);
  const rows = draft.rows.map((row) => {
    if (!gone.uses.includes(row.id)) return row;                                         // NOT `portion.step === n` alone (G-2)
    const line = row.portions.find((p) => p.step === n);
    const rest = row.portions.filter((p) => p.step !== n);
    if (rest.length === 0) return { ...row, portions: [{ step: 1, grams: line.grams }] }; // back to "Not in a step yet", grams kept
    return { ...row, portions: [{ ...rest[0], grams: addGrams(rest[0].grams, line.grams) }, ...rest.slice(1)] }; // roadmap 24
  });
  const method = draft.method.map((s) => (s.n === n ? { n, leadIn: '', instruction: '', uses: [], targets: [], removed: true } : s));
  return { ...draft, rows, method };
}
```
`addGrams` must be decimal-safe: the grams pattern is `/^\d+(\.\d{1,2})?$/` [VERIFIED: lineage.js:201], so add in integer hundredths (`Math.round(a * 100) + Math.round(b * 100)`), print without float noise, and keep the remaining line's raw text when either side does not parse (the maker is still typing).

### Pattern 2: One transaction, copied from `importAll`
**What:** `createRecipeWithVersion` reads every stored version, runs the pure Sheet-code check, queues the three writes, and aborts by hand on any failure so queued puts roll back. The abort block is `importAll`'s, verbatim.
**Example:**
```js
// Source: app/src/store/repository.js importAll (240-) and putVersionChecked (9-27), verified this session
async createRecipeWithVersion({ recipe, version }) {
  const db = await dbPromise;
  const tx = db.transaction(['recipes', 'versions', 'drafts'], 'readwrite'); // drafts: keyPath 'versionId' (db.js:62)
  const done = tx.done;
  const queued = [];
  try {
    const problems = sheetCodeProblems(await tx.objectStore('versions').getAll(), [version]);
    if (problems.length > 0) throw new SheetCodeError(problems);   // nothing written; the code is never re-drawn
    queued.push(tx.objectStore('recipes').put(recipe));
    queued.push(tx.objectStore('versions').put(version));          // an unclonable value throws here, after the recipe put queued
    queued.push(tx.objectStore('drafts').delete(version.id));
    await Promise.all([...queued, done]);
  } catch (error) {
    try { tx.abort(); } catch { /* already finished */ }
    for (const request of [...queued, done]) request.catch(() => {});
    throw error;
  }
}
```
`saveFirstVersionOver({ recipe, version })` has the same skeleton over `['recipes','versions','batches','drafts']`. Inside it, read `versions.getAll()`, find the stored one, count `batches` through the `by-version` index (`batches.createIndex('by-version', 'versionId')` [VERIFIED: db.js:52]), and when the version is gone, has a child (`some(v => v.parentVersionId === version.id)`) or a batch, abort and RESOLVE `{ saved: false, reason: 'gone' | 'has-child' | 'has-batch' }` (a business refusal is a value, not a throw); otherwise run `sheetCodeProblems(all, [version])` (its `changed` kind refuses a different code for the same id), put recipe and version, delete the draft, resolve `{ saved: true }`.

### Pattern 3: The forced-failure test (D-19)
Copy `repository.test.js:139-158`: `importAll` is given a batch holding `notClonable: () => {}`; the put throws `DataCloneError` before it queues, the catch aborts, and every store holds what it held. For Save: save a create draft, call `createRecipeWithVersion` with `{ ...version, notClonable: () => {} }`, expect rejection, then assert `listRecipes()` and `listVersions()` unchanged and `getDraft(version.id)` still present. Second case: a colliding Sheet code (the file already has a "stands on a colliding pair of ids" fixture at `repository.test.js:362`) gives a `SheetCodeError` and the same three assertions. Third case for Save-over: a batch recorded after the edit opened gives `{ saved: false, reason: 'has-batch' }` with the version and recipe unchanged and the draft kept.

### Pattern 4: Edit route twin of CreationRoute
`EditRoute` reads once in a component effect (not a router loader: the router is built before the store seeds, the reason `CreationRoute.jsx` gives), then mounts `<CreationPage key={versionId} record={record} mode="edit" />`. Redirects use `<Navigate replace>` or `navigate(..., { replace: true })` as `CreationRoute` does. Hooks above every early return; the restore runs once per page instance because `useKeptDraft` guards it with `draftRestoreStartedRef` (StrictMode runs effects twice in development; no cancelled flag).

### Pattern 5: Landing notice through route state, not text
`navigate(notebookPath(recipe.id, version.id), { replace: true, state: { focusVersion: true, saved: 'created' } })`. `RecipePageForRoute` (which owns `.page-status-anchor`, [VERIFIED: router.jsx:37-92]) reads `location.state?.saved` once, calls its own `announcePageStatus` with the constant sentence for that word, and replaces the state with `{ focusVersion: true }` (so the version-identity landing focus, read at first render as `Boolean(location.state?.focusVersion)` at `RecipePage.jsx:81`, survives). Route state carries an enum word only, never text (T-10-05's rule). `RecipePage.test.jsx:945` pins that `<RecipePage` follows `<PageStatus` and matches `/<RecipePage\s+key=/`; keep that tag as it is.

### Anti-Patterns to Avoid
- **Reading placement from `portion.step`** (G-2): the placeholder `1` collides with the first real step.
- **Putting add/remove/move into `penDraft.js`**: the version pen must stay unable to restructure.
- **A second `useKeptDraft` call site or a new `repository.deleteDraft(versionId)` call site**: the shell pins count them.
- **`Save` as two writes** (`saveRecipe` then `saveVersion`): a failure between them leaves a recipe with no version.
- **Computing the stale-edit check from page props**: it must read inside the save transaction (D-06).
- **Rendering stored text as markup, or keying a plain object by a stored id**: use `Map` or an array scan; `RESERVED_ROW_IDS` and `carriesUnsafeKey` exist for this.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Step key allocation | a counter or `length + 1` | `nextStepKey(method)` over the whole array, tombstones included | A count hands out a held key once a gap exists (stepKeys.js header) |
| Step display numbers | stored numbers, renumbering | `displayNumbers(method)` / `displayNumberOf` | Stored key is identity; renumbering was tested and rejected (`.planning/debug/steps-do-not-renumber-after-removal.md`) |
| Grams text rules and sentences | new regex or wording | `parseGramsDraft`, `gramsDraftMessage` (lineage.js) | One rule for the figure and the sentence; the pen and the creation table already share it |
| Table grouping, split lines, portion line | a second grouping | `groupPortionsByStep`, `formatPortionLine` | Print uses the same grouping; keep the order the screen shows |
| Sheet code | hashing content or a fresh random code | `codeFromVersionId(versionId)` (set inside `createRecipe`); `findVersionsByCode`; the repository's `sheetCodeProblems` check | Code is stored and never recomputed (CODE-01, roadmap 19) |
| Transaction + rollback | try/catch around separate puts | `db.transaction([...], 'readwrite')` + the `importAll` abort block | Atomicity is the criterion |
| Export validity | ad-hoc checks | run `validateStoreFile` in a test over the created version (`creation-roundtrip.test.js` pattern) | The Save gate exists to keep export/import round-tripping |
| Notices | new toast | `announcePageStatus` / `.page-status` card | Built; D-07 |
| Unsafe-key defence | new sanitiser | `RESERVED_ROW_IDS`, `carriesUnsafeKey` in `draft.js`, `Map`s | Already pinned by tests |
| Buttons, checkboxes | raw elements | `ui/Button.jsx`, `Checkbox.jsx` | `tabindex-scan.test.js` fails otherwise |
| WebKit measurement | prose or screenshots by eye | the board engine (`10-board-check.mjs` family) | Sketch conformance is "side by side in a browser, never prose" |

**Key insight:** every hard part (identity of steps, grouping, code stability, atomic multi-store writes, export validity) already has a tested home. The phase's risk is in the seams between them (G-1, G-2, G-10), not in new algorithms.

## Runtime State Inventory

Not a rename, refactor or migration phase. One note that the planner should treat as the equivalent check: the reset window closes here. Nothing in this phase may change `DB_VERSION` (`export const DB_VERSION = 10;` [VERIFIED: store/db.js:8]; `db.test.js` ratchets it), the object stores, or key paths. The edit draft is a new `kind` value inside an existing store; the unplaced sentinel is a new value convention for an existing numeric field. Neither is a shape change. Stored data: none to migrate (no real recipe exists yet). Live service config, OS-registered state, secrets, build artifacts: none.

## Common Pitfalls

### Pitfall 1: Hook order and StrictMode in the new routes
**What goes wrong:** an early `return null` above a hook, or a restore effect that runs twice in development and writes twice.
**Avoid:** every hook above the early returns; load in one component effect; reuse `useKeptDraft`'s once-per-instance guard; seed `useState` from the already-loaded record (as `CreationPage` does with `normalizeCreateDraft(record.payload)`). **Warning sign:** `RecipePage.strictMode.test.jsx` style failures; double `saveDraft` calls.

### Pitfall 2: Refusal messages vs the aria-hidden "Required"
`FieldFeedback` renders `Required` as `aria-hidden="true"` quiet guidance and swaps in the error text when an `error` is given [VERIFIED: ui/FieldFeedback.jsx]. A screen reader hears nothing for a refused Save except where focus lands. Move focus to the first refused field in page order (D-11), set `aria-invalid`, and wire `aria-describedby` to a visible error for the refused press (the pattern `IngredientTable` uses for a blocked row).

### Pitfall 3: Double press on Save
Two presses while the transaction is out would write twice (the second `put` is harmless, the second `navigate` is not). Use a lock ref and disable the button while saving, as `RecipeBand` does (`disabled={saving}`, `Saving…`), and treat `SheetCodeError` and any rejection as a form-level line ("Couldn't save the recipe. Try again." in the shape of `RECIPE_SAVE_ERROR`), draft kept.

### Pitfall 4: Fold, move and key stability
`moveStep` and `moveRow` splice the array and never touch `n` or `id`; React keys are `step.n` and `${row.id}:${portionIndex}`. A split row moved in one step's group can change its position in another group (group order is the `rows` order, G-2); say so in the plan, the board does not draw it. After `removeStep`, a row in three steps folds into the first remaining line only; test with three lines.

### Pitfall 5: `uses` and portions drift
Any op that edits `uses` without the matching portions (or the reverse) breaks the invariant. Add `checkAllocation(draft)` (pure, returns the first violation or null) and call it in every op's test and in a property-style test over random op sequences; call it once in dev behind no flag (no runtime cost worth guarding).

### Pitfall 6: Two Add step controls and focus
The heading's Add step inserts at the beginning; a step's own Add step inserts right after it; both focus the new step's lead-in through the focus request (`aria-label="Step n, lead-in"`). The new step's key is `nextStepKey`, its display number is its array position; the lead-in label uses the display number, so labels of later steps change on insert (tests must query by the label after the render).

### Pitfall 7: The pen's `useOnDemandField` is private
`add a purpose` / `add an aside` reuse `useOnDemandField` in `Method.jsx` (not exported; it opens when the value already has text and collapses on an empty blur). Export it (a one-word change) or move it to a tiny module both import; do not copy it.

### Pitfall 8: CSS tests that police new rules
`notebook.test.js` pins the `.notebook` prefix and the exact set of `@media` conditions, so no new `759.98px` block (use `723.98px` or `(pointer: coarse)`); `cross-cutting.test.js` and `binder.test.js` pin where underline lives (`.text-control`, `a`); `cross-cutting.test.js` also pins the exact selector list of `app.css`'s `(pointer: coarse)` block (seven rules, `.text-control` among them [VERIFIED: cross-cutting.test.js:~96-125 `expect(touchRules.map((r) => r.selector)).toEqual([...])`]), so new controls built as `.text-control` get their 44 px floor for free and no rule may be added to that block. `.mk-off` needs `text-decoration: none` and a secondary colour, so put it in `notebook.css` under `.notebook` and read `cross-cutting.test.js:101-137` and `binder.test.js:308-315` first (Phase 10's T-02 hit the same wall with `.pick__act`). `print.test.js` only judges rules inside non-print `@media` blocks that could match inside a printed page; unconditional rules in `app.css` for `.method-step__*` are outside its test.

### Pitfall 9: Device and engine
Chromium is not installed for Playwright here, only WebKit `webkit-2359` [VERIFIED: ls ms-playwright]. Never serve the device check from `vite`; use `build` + `preview --host`. Keep one Vite process.

## Code Examples

### Save gate: all refusals at once, in page order
```js
// Source: composes domain/recipe.js recipeNameMessage, lineage.js gramsDraftMessage, transfer.js rules (G-6)
export function creationSaveBlock(draft, { library }) {
  const blocks = []; // [{ id, message, target }], page order: band, ceremony, notes?, rows, steps, scales, problems
  const nameMessage = recipeNameMessage(draft.name);            // 'Enter a recipe name.' [VERIFIED: recipe.js:5]
  if (nameMessage) blocks.push({ id: 'recipe-name', message: nameMessage, target: { kind: 'recipeName' } });
  if (draft.versionLabel.trim() === '') blocks.push({ id: 'version-name', message: 'Required', target: { kind: 'versionName' } });
  if (draft.rows.length === 0) blocks.push({ id: 'no-rows', message: 'Add at least one ingredient.', target: { kind: 'addIngredient' } });
  for (const row of draft.rows) {
    if (!library.has(row.libraryId)) blocks.push({ id: `gone:${row.id}`, message: `${row.libraryId} is no longer in the library. Remove it.`, target: { kind: 'row', rowId: row.id } });
    row.portions.forEach((portion, line) => {
      const message = gramsDraftMessage(rowName(row, library), portion.grams);   // sentences from lineage.js:225-226
      if (message) blocks.push({ id: `grams:${row.id}:${line}`, message, target: { kind: 'row', rowId: row.id, line } });
    });
  }
  for (const step of draft.method.filter((s) => !s.removed)) {
    if (step.leadIn.trim() === '') blocks.push({ id: `lead:${step.n}`, message: 'Required', target: { kind: 'stepLeadIn', n: step.n } });
    if (step.instruction.trim() === '') blocks.push({ id: `text:${step.n}`, message: 'Required', target: { kind: 'stepInstruction', n: step.n } });
    // a target with exactly one empty side refuses; both sides empty is dropped at Save (Open Question 1)
  }
  // scales: name, low, high, kind; problems: non-empty; duplicate problem words (G-6)
  return blocks;
}
```
(The exact sentences for the new refusals are the planner's, in the shape of the existing ones.)

### Focus request after a move (D-16)
```js
// Source: CreationPage.jsx focusRequestRef + effect pattern (lines 140-153), extended
const afterMove = (kind, id, dir) => {
  focusRequestRef.current = { kind, id, dir };   // acted on after the render that drew the target
  announce(positionSentence(kind, id));          // polite live region: "Step 2 of 3"
};
// in the effect: find `[aria-label="Step 2, move down"]`; if it is now aria-disabled, focus the other Move button
```

### Reading step, one component (decision 014 2)
```jsx
// Source: PrintSheetPages.jsx PrintInstructions (mp-tags / mp-why / mp-aside), on the screen classes
<p className="method-step__targets method-step__targets--tags">
  {targets.map((t) => (
    <span className="target-chip" key={t.label}>
      <span className="target-chip__label">{t.label}</span>
      <span className="target-chip__value">{t.value}</span>
    </span>
  ))}
</p>
{purpose && <p className="method-step__purpose"><span className="method-step__purpose-label">why</span> — {purpose}</p>}
{aside && <p className="method-step__aside">{aside}</p>}
```
The CSS values are the board's (`P11_CSS`, read this session from `add-remove-move.html`), keyed to the tokens `print.css` already reads: `--gap-l`, `--gap-xs`, `--gap-s`, `--sheet-type-label`, `--sheet-type-section`, `--sheet-print-weight-cue`, `--sheet-print-weight-title`, `--sheet-print-tracking-caps`, `--rule-ink-field`, `--sheet-print-tag-underline-offset`, `--sheet-leading-helper`, `--rule-tick`, `--sheet-ink`.

## Surfaces the edit route and Save touch (D-01 to D-07)

| Surface | File | What changes | Interaction to watch |
|---------|------|--------------|----------------------|
| Routes | `app/src/router.jsx` | add `{ path: '/notebook/:recipeId/:versionId/edit', Component: EditRoute }` beside the page, batch and print routes (`router.jsx:123-130`) | `/batch/:batchId` and `/print` differ in the last segment, so no collision; `/notebook/new` stays first |
| Paths | `ui/notebookPaths.js` | `editPath(recipeId, versionId)` built on `notebookPath` (every segment `encodeURIComponent`) | `notebookPaths.test.js` pins `NEW_RECIPE_PATH` ordering; add edit cases |
| Create wrapper | `ui/CreationRoute.jsx` | none; it keeps `draftMatchesCreate`, which already ignores kind `'edit'` | its `newestDraft(records.filter(draftMatchesCreate))` must not see an edit |
| Edit wrapper | `ui/EditRoute.jsx` (new) | loads version, recipe, versions, version's batches, `getDraft(versionId)`; builds the seed record; redirects (G-1, G-8, G-12) | not-found for an unknown id or a recipe/version mismatch, as `PrintSheet` does (`RecipeNotFound`) |
| Editor | `ui/CreationPage.jsx` | `mode` prop: ceremony caption "Version 1 · editing" and form label "Edit version"; Save-over handler; Cancel and Save land on `notebookPath(recipeId, versionId)` (D-01); no "Draft kept" announcement on first entry | band keeps Recipe name and description fields as 013 draws |
| Kept draft | `ui/useKeptDraft.js`, `domain/draft.js` | `creationKind`, `draftMatchesEdit`, the non-creating guard, optional `cleanPayload` | the shell pins (G-1) |
| Notebook | `ui/NotebookPlace.jsx` | the recipe's own row gains Resume editing (opens `editPath`) when an eligible edit draft is kept (D-05); no separate draft row; New recipe stays; quiet cleanup of orphaned edit drafts (G-12) | `NotebookPlace.test.jsx:96,110` pin "no Resume while nothing is kept" and the create draft row; those stay true |
| Page acts | `ui/VersionRow.jsx` (and the pen openers, G-8) | Edit (underlined `.notebook-link`, after the filled Next version, `VersionRow.jsx:423` block) when eligible; Resume editing in its place and no Next version / Record a batch when an edit is kept (D-04) | `openPen === null &&` already gates the whole block |
| Shell guard | `ui/Shell.jsx` | `draftMatchesCreate` at lines 8, 272, 472 becomes "create or edit"; `creationStateFromRoute` (line 44) also answers 'present' for the edit address; the refusal for an edit names the recipe (the draft payload's `name`, rendered as text) | `chooseImportFile` is synchronous (Shell.jsx:428); keep a ref for the kept edit's name next to `creationStateRef` |
| Notice | `router.jsx` `RecipePageForRoute` | reads `location.state?.saved` once (Pattern 5); "Recipe saved." / "Changes saved." as constants; 5 s clear is `announcePageStatus`'s | keep `/<RecipePage\s+key=/` and the anchor-before-page order pinned at `RecipePage.test.jsx:945` |
| Save landing | `CreationPage.jsx` | `navigate(..., { replace: true, state: { focusVersion: true, saved } })` after `writer.endDraft()` (G-10) | `focusVersion` is read at first render (`RecipePage.jsx:81`) |

### How `Method.jsx` renders a step today (for the reading-step treatment and the creation hand-off)

Three branches share `li.method-step` > `span.method-step__n` + `div.method-step__body`: (1) the pen, only when `isDeveloping = mode === 'developing' && draftVersion != null && baselineVersion != null` (`Method.jsx:593`), which delegates to `StepPenBody`: open = `div.method-step__open-fields` (outlined box) with `input.prose-field.prose-field--lead-in`, `textarea.prose-field`, chips of two `input.ink-field` fields (`target-chip__label-field`, `target-chip__value-field`), then purpose/aside fields on demand, the uses line and `fieldset.method-step__uses`; closed = `p.method-step__lead`, `p.method-step__targets` of `span.target-chip` > `span.target-chip__label` + `span.target-chip__value` (with `span.struck-value` holding `${label} ${from}` when a target changed), `p.method-step__purpose`, `p.method-step__aside`, and `p.method-step__acts` "edit this step · remove/restore"; (2) Show changes (`isShowingChanges`), the same read-only markup fed by `stepDiff`; (3) reading, with `Skipped` strike handling and, while recording, `StepRecordingControls`. All three read-only branches render targets from `step.targets` (`key={target.label}` in two of them, `key={index}` in the pen), purpose and aside as bare `<p>`s. `Method.jsx` has no add-step, add-target or preview control anywhere. The creation editor therefore gets its own component (`CreationSteps.jsx`), reusing the pen's open-step grammar and class names, and renders its Preview step through the same `StepReading` component the three read-only branches use after 11-04.

## Source-text and CSS pins this phase changes (each plan names the ones it touches)

| Pin | Where | Why it moves | Plan |
|-----|-------|--------------|------|
| `useKeptDraft` markers: `draftMatchesCreate(record)`, `kind: 'create'`, `onRestoreCreate(record.payload)`, `repository.deleteDraft(versionId)` (3), `draftMatchesVersion(` (1), `buildDraftRecord(` (3) | `RecipePage.shell.test.js:258-293` | edit kind and the non-creating guard (G-1) | edit route |
| `useDraftWriter` markers (`function flushPendingDraft(`, `function discardDraft(`, each 1) | `RecipePage.shell.test.js:245` | `endDraft()` is additive | Save |
| `showsMethodRegion({ mode, steps: methodSteps })`, `<section className="method-region"`, `sheetClassName` string, `{beforeRegionShown && (` | `RecipePage.test.jsx:1167-1192` | none if the change is inside `showsMethodRegion` and Method (G-11) | steps editor |
| `showsMethodRegion` cases | `Method.test.jsx:1486-1510` | add a `creating` case | steps editor |
| One `<IngredientsHead` tag carrying `onToggleShowChanges={onToggleShowChanges}` | `RecipeSheet.test.jsx:103-112` | adding an `addAct` prop is fine | steps editor |
| `'<p class="method-step__purpose">Original purpose.</p>'` | `Method.test.jsx:734-735` | the "why" label span | reading-step treatment |
| Base rule `.method-step__purpose, .method-step__aside` keeps italic + text face | `cross-cutting.test.js:769` | override by a more specific selector, do not edit the base | reading-step treatment |
| `(pointer: coarse)` block selector list | `cross-cutting.test.js:~96-125` | add nothing to it | all CSS plans |
| `notebook.css` `.notebook` prefix and the exact `@media` set | `notebook.test.js:37-53` | new `mk-*` rules go under `.notebook`, no new media condition | steps editor |
| "Unallocated" strings | `IngredientTable.test.jsx` | D-12 rename | steps editor / print |
| `draft.test.js:649-654` portion step 0 refused; `:692-696` ledger fits | `draft.test.js` | stay as they are (the sentinel is only in the projection and the saved version) | none |
| `Shell.importGuard.test.jsx`, `Shell.creationGuard.test.jsx` | `ui/` | edit refusal cases | edit route |
| `db.test.js` ratchets (`DB_VERSION` 10) | `store/db.test.js` | must stay green | all |

## Harnesses (D-19) and how to extend them

**Walk.** `10-walk.mjs` records 94 WebKit snapshots across 12 scenarios and compares with no allowance; `compareResult`/`diffLeaves` print a `DIFF scenario / step / path` line per leaf and `selftest` doctors four things the compare must refuse [VERIFIED: file read, lines 832-1046]. Copy it to `11-walk.mjs` and:
1. Add the method-text normalisation of G-4 to `snapshot()` (`textHash` without `.method-region`, plus `methodHash`).
2. Add `ALLOWED_NEW_SCENARIOS` (names of the create and edit scenarios): a scenario present only in the after file is allowed; every other scenario, step and leaf stays strict. Do not allow a changed leaf in an existing scenario.
3. New scenarios (each its own context; ids come from the counted `crypto.randomUUID`, the clock is fixed at `2026-10-14T12:00:00.000Z`, so created records are deterministic): `create-recipe` (Notebook, New recipe, Start, add rows, two steps with a split row, Move and remove with keyboard presses, Save, assert the stores hold exactly one recipe, one version with a stored `sheetCode`, no draft; assert the notice text and focus), `create-save-refused` (every message at once, focus on the first, nothing stored), `edit-first-version` (Edit, change, Save-over, same id, same `sheetCode`, same `createdAt`, "Changes saved."), `edit-stale` (record a batch in a second page of the same context, then Save: nothing written, line shown, draft kept), `edit-kept` (reload keeps it; Next version absent; import refused).
4. Selftest additions: a doctored `methodHash` in an existing scenario is refused; a new-scenario name is the only thing allowed to appear on one side.
5. `11-walk-record-base.sh` (copy of `10-walk-record-base.sh`): `BASE=cf64aa70`, the stranger-commit regex becomes `^[0-9a-f]+ [a-z]+\(11(-[0-9]+)?\):|merge executor worktree`, scratch `sprinkles-11`, output `11-walk-before.json`. `11-walk-check.sh` copies `10-walk-check.sh` (builds to `$TMPDIR/sprinkles-11/walk-$(basename "$(pwd)")/dist`, never `app/dist`). Re-run `git log --format='%h %s' -3 -- app/` at plan time; BASE is the newest commit that touched `app/` before the first Phase 11 plan.

**Board engine.** `10-board-check.mjs` compares a built route to a sketch panel element by element (`count, box, size, font, color, border, outline, text, value, focus`), at 1366 and a coarse pointer, tolerance 1 px, from `.p4-win.<panel>` roots [VERIFIED: file header, lines 1-60]. It seeds a `create` draft from `panel.draft` merged over `blankCreateDraft` (so `rows`, `method` and any field can be set), then visits `panel.route`. Copy it to `11-board-check.mjs` and add: a `seed` option writing `recipes` and `versions` (and an `edit`-kind draft) for the after-Save and first-version panels, an `edit` kind for the fB1 panel, and the notice panel (vC1's `.page-status-anchor.mk-win-foot` is board-only; the app fixes the anchor to the viewport, so compare the card box, not its anchor). Board modules, one per file as Phase 10 did: `11-board-steps.mjs` (pA1 to pE1), `11-board-structure.mjs` (qA1 to qE1), `11-board-save.mjs` (vA1 to vC1), `11-board-first-version.mjs` (fA1 to fC1), `11-board-reading.mjs` (the reading step on the Olive Oil page and the pen's closed step, against pE1's reading markup and CONTRACT section 7). Run each module with `--selftest` once. The 014 boards are `.planning/sketches/014-steps-structure-save/{instructions-steps,add-remove-move,save,first-version}.html`; their panels are `pA1..pE1`, `qA1..qE1`, `vA1..vC1`, `fA1..fC1` [VERIFIED: grep of `class="p4-win ..."`].

## Sketch 014: what the plans must hit

Authority is the four board files, CSS included; `CONTRACT.md` sections 1 to 7 name them. Values are WebKit, coarse pointer, 1366 (Chrome in brackets where it differs by a pixel or two); every control is 44 tall (`--touch-min`); the boards add no token.

| Board / panel | Must hit |
|---------------|----------|
| All editor panels (section 1) | Before you start, Ingredients and Instructions each head a `.mk-head-row` (44 row, `h2.region-name` then `button.text-control.mk-head-act` 14 after it, 6 below): Add note 54.7×44, Add ingredient 88.8×44 [85], Add step 54.1×44 [52.8]. Add ingredient absent while the picker is open. Add scale and Add problem stay under their lists. |
| pA1 no step | Instructions heading row alone; flat table with each row's `remove · Move up · Move down` on the name cell's own line |
| pB1 step just added | `ol.method-steps > li.method-step.mk-step`; number top = lead-in top (0 px apart); lead-in `input.prose-field.prose-field--lead-in` bold, aria-label "Step n, lead-in", 44 tall; instruction `textarea.prose-field` 2 rows "Step n, instruction"; `span.field-requirement` "Required" under both; targets line with Add target 64×44 [61] and Preview step 77.5×44 [74.6] (Hide preview 78.8); uses line "uses nothing yet" + "change the ingredients" · "add a purpose" · "add an aside"; acts row `remove · Move up · Move down · Add step` (44.7, 51.7, 69, 54.1 wide), first Move up and last Move down `.mk-off` + `aria-disabled="true"`; table headed "Not in a step yet" with Add to step (69.9×44) on every row |
| pC1 two steps | a target and a purpose on step 1; step 2's Uses `fieldset.method-step__uses` (legend Uses) open; table under step heads (`tr.ingredient-table__step-head`), a step that uses nothing draws no head |
| pD1 split row | Whole milk one line per step, each with its own grams field and "400 g of 600 g · 58.0% in all" |
| pE1 preview | "Hide preview" while open; `div.mk-preview` role group "Step n, preview", under the last content field and before the uses line; cue "Preview" (12 px / 500 / uppercase / 0.04em); 504×136.4 for step 1 with one target, a purpose and an aside; left rule `--rule-graduation` solid `--sheet-ink` |
| qA1 to qE1 structure | numbers follow order after a Move; remove deletes outright (no strike, no restore); rows back under "Not in a step yet"; the removed step's 200 g fold back (Whole milk 600 g, 58.0%, no portion line); a row moves within its step only; chooser: Cancel (41.6, label "<row>, cancel") then "Step 1, Warm the milk" (133.5) and "Step 2, Churn" (83.9); the line wraps in the name cell with many steps (the board's `nowrap` is for its widths only) |
| vA1 to vC1 save | ceremony "New recipe · draft", Version name, Cancel (88.3×44) then Save (74.4×44 [88.4, 74.5]); refused: "Enter a recipe name." and Required under the version name; after Save the seeded-root page ("Version 1 · Latest", Written today, no From version, "no reason recorded", History 1 version, "not churned"), Next version (126.3×44) and Edit (26.3×44, underlined) 10 apart; notice "Recipe saved." 142.6×50, centred, 20 above the foot, 16/24, padding 12/20, radius 10, `--app-shadow-notice` |
| fA1 to fC1 first version | Edit beside Next version only with no batch and no child; "Version 1 · editing" (form label "Edit version"), Cancel and Save; once a batch exists, Next version alone |
| Reading step (section 7) | tag row: flex wrap, column gap `--gap-l`, row gap `--gap-xs`, baseline aligned; label 12 px / 500 / uppercase / 0.04em; value 14 px / 700 / underlined at offset 3 px; no chip border or padding; row 17 tall; why: caps label "why", em dash, sentence, 13 px text face, upright, leading 1.4, `--gap-xs` above, `--measure-prose`, 18.2 tall; aside: `--rule-tick` ink left rule, `--gap-s` padding and top margin, same face; order lead, targets, purpose, aside; the table's estimate flag and the open step's field chips keep their box |

**Words the boards fix:** Instructions, Add step, Add target, Preview step, Hide preview, Preview, uses nothing yet, uses, change the ingredients, done, add a purpose, add an aside, Uses, remove, Move up, Move down, Add to step, Cancel, Required, Step n, Not in a step yet, New recipe · draft, Version name, Save, Enter a recipe name., Recipe saved., Version 1 · Latest, Next version, Edit, no reason recorded, 1 version, not churned, Version 1 · editing.

**Drawn nowhere, settled by CONTEXT:** the saved page's "Not in a step yet" (D-12); the Notebook's Resume editing (D-05); the stale-edit line (D-06, wording is the planner's); "Changes saved." (D-07); every refusal other than the two drawn (D-08 to D-11); focus and announcements (D-14 to D-17); Show changes tags (D-18).
**Drawn nowhere and not settled:** remove for a mistaken target (none is drawn or offered; see Open Question 1); the Edit link at narrow widths; how "Resume editing" reads on the version page (D-04 gives the words, not the look); what the Add to step chooser does past two steps (README says wrap); an added target's mark (G-9).

## Recommended slice order and files (for the pattern mapper and planner)

CONTEXT's order is steps and allocation, then add/remove/move, then save, then print, with the edit route and the screen treatment. Ten plans, each landing green; `npm --prefix app test` (3771 tests, 120 files, about 4 s [VERIFIED: run this session]) is the floor for every plan. Wave suggestions assume worktrees (`use_worktrees: true`); two plans may share a wave only when their file sets are disjoint.

| Plan | Wave | Goal | Files touched | Reqs |
|------|------|------|---------------|------|
| 11-01 Proof scaffolding | 0 | Walk with allow-list + method normalisation, record-base and check scripts, board engine copy with `seed`, board modules written against the 014 boards (they fail until the build lands; run once with `--selftest`), re-record `11-walk-before.json` at BASE | `.planning/phases/11-.../11-walk.mjs`, `11-walk-record-base.sh`, `11-walk-check.sh`, `11-walk-before.json`, `11-board-check.mjs`, `11-board-*.mjs` | (proof) |
| 11-02 Step, row and allocation ops | 1 | Pure ops and the projection (G-2, G-3), `UNPLACED_STEP`, `checkAllocation`, `creationSheetVersion` with method and lines | `domain/creationSteps.js` (+test), `domain/creation.js` (+test) | MAKE-07, STRUCT-01 to 03 |
| 11-03 Transactions | 1 | `createRecipe` optional fields, `createRecipeWithVersion`, `saveFirstVersionOver`, forced-failure and stale-edit tests, export round-trip test | `domain/newRecipe.js` (+test), `store/repository.js` (+`repository.test.js`), `store/creation-roundtrip.test.js` | MAKE-10 |
| 11-04 Reading-step treatment | 1 | `StepReading.jsx` and the screen CSS on the reading page, the pen's closed steps and Show changes (D-18); export `useOnDemandField` | `ui/StepReading.jsx`, `ui/Method.jsx` (three branches), `styles/app.css`, `ui/Method.test.jsx`, `styles/*.test.js` as needed | criterion 6 |
| 11-05 Steps editor and allocation | 2 | Heading rows; `CreationSteps.jsx`; table lines, split rows, heads, "Not in a step yet" (D-12, screen); Preview step; hook up the ops | `ui/CreationSteps.jsx`, `ui/RecipeSheet.jsx`, `ui/Method.jsx` (`showsMethodRegion`, creating hand-off), `ui/IngredientTable.jsx` (+creating/remove tests), `ui/CreationPage.jsx`, `styles/notebook.css`, `ui/CreationFlow.test.jsx` | MAKE-07 |
| 11-06 Structure controls | 3 | Add/remove/move for steps and rows, Add to step chooser, focus and announcements (D-14 to D-17), `aria-disabled` Moves | `ui/CreationSteps.jsx`, `ui/IngredientTable.jsx`, `ui/CreationPage.jsx`, `styles/notebook.css`, new `ui/CreationStructure.test.jsx` | STRUCT-01 to 03 |
| 11-07 Save | 4 | `creationSaveBlock`, `buildCreation`, Save button and messages, `endDraft`, landing and notice, Notebook assertions; **checkpoint: orchestrator adds the D-21 row** | `domain/creationSave.js` (+test), `ui/CreationPage.jsx`, `ui/useKeptDraft.js` (`endDraft`), `router.jsx` (`saved`), `ui/NotebookPlace.test.jsx`, `ui/CreationFlow.test.jsx` | MAKE-10 |
| 11-08 Edit route and first version | 5 | `kind: 'edit'`, `draftMatchesEdit`, restore guard, `EditRoute`, Edit / Resume editing, D-04 openers, Notebook Resume editing, Shell guard, orphan cleanup, stale-edit line | `domain/draft.js` (+test), `ui/useKeptDraft.js`, `ui/notebookPaths.js`, `router.jsx`, `ui/EditRoute.jsx`, `ui/CreationPage.jsx`, `ui/VersionRow.jsx`, `ui/BatchRow.jsx`, `ui/RecipePage.jsx`, `ui/NotebookPlace.jsx`, `ui/Shell.jsx`, `domain/creationSave.js`, pins in `RecipePage.shell.test.js` | STRUCT-04, STRUCT-01 to 03 |
| 11-09 Print | 5 | "Not in a step yet" on the sheet (D-12), the empty-sections test and print check (G-5), Sheet code finds the created recipe after edits | `ui/PrintSheetPages.jsx`, `ui/PrintSheetPages.test.jsx`, `ui/PrintSheet.test.jsx`, `store/sheet-code-import.test.js` pattern | MAKE-12 |
| 11-10 Final proof and device check | 6 | Walk scenarios, all board modules green, full suite, todos moved to completed, **checkpoint: orchestrator adds the D-20 row** | `11-walk.mjs`, `11-board-*.mjs`, `.planning/todos/pending/2026-10-25-*` (two files, moved when built) | all |

11-02 and 11-03 and 11-04 touch disjoint files and may share a wave. 11-08 and 11-09 may share a wave only if 11-09 stays out of `IngredientTable.jsx` (the rename is in 11-05). If the planner folds 11-06 into 11-05 the plan is too large: the step editor, the table and the structure controls each carry their own board and tests.

**Per-plan verify commands (proven shape, Phase 10 plan 05):**
- Domain: `npm --prefix app test -- src/domain/creationSteps.test.js src/domain/creation.test.js src/domain/draft.test.js`
- Component: `npm --prefix app test -- src/ui/CreationFlow.test.jsx src/ui/IngredientTable.creating.test.jsx src/ui/RecipePage.shell.test.js src/ui/tabindex-scan.test.js src/styles`
- Store: `npm --prefix app test -- src/store/repository.test.js src/store/creation-roundtrip.test.js src/store/transfer.test.js`
- Browser: `P=.planning/phases/11-steps-structure-save-and-print; S="${TMPDIR:-/tmp}/sprinkles-11"; npm --prefix app run build -- --outDir "$S/dist-NN" --emptyOutDir && PROBE_DIST="$S/dist-NN" node $P/11-board-check.mjs $P/11-board-steps.mjs && sh $P/11-walk-check.sh`
- Phase gate: `npm --prefix app test` plus the walk's `MATCH` line and every board module with no FAIL.

## Mark's List rows (the plan that lands Save must make these checkpoints)

`gsd-executor` has no `ArtifactData`, so the plan stops at a `checkpoint:human-action`-style step; the orchestrator writes the rows, reads them back, and spawns a continuation (memory: gsd-executor-has-no-artifactdata; CLAUDE.md "Mark's List"). Row shape (CLAUDE.md): doc id starts with the kind word; `kind`, `title`, `where`, `addedBy: "claude"`, `status: "open"`, `createdAt`/`updatedAt` read with `date -u +%Y-%m-%dT%H:%M:%S.000Z` just before the write (never typed), `owner: "mark"`, `needs: "hands"`, `phase: "11"`; the title says what Mark will see, with no "Check:" prefix.
1. **D-21, export-first.** In the Save plan (11-07), before any device build that can save: `check-p11-export-store-before-saving`, `kind: "check"`, `needs: "hands"`: export the store from the app before testing Save on the iPad. Roadmap Notes and STATE.md say this row goes on before the first device build that can save a recipe.
2. **D-20, the iPad check.** In the final plan (11-10): `check-p11-ipad-create-steps-save-print-edit`, `kind: "check"`, `needs: "hands"`, `where` naming the production build (`npm --prefix app run build && npm --prefix app run preview -- --host`). Steps as CONTEXT D-20 gives them: create a recipe with two steps and a split row, Move and remove by touch and by keyboard (the Move buttons' focus is the roadmap's medium-confidence item), Save, print to PDF and read the Sheet code, type it in Search, Edit and Save-over, type the code again. Per memory "verify-device-check-steps-before-handing-over", walk every step in Playwright WebKit first (11-walk's scenarios cover most) and list in the row only steps reachable on the iPad; print is checked as the iPad PDF.
   The spawn brief for this research said the plan that lands Save adds both rows; CONTEXT D-20 says the iPad check is "at the end of the phase" and D-21 says the Save plan adds the export-first row. Recommendation: D-21 at the Save plan, D-20 at the final plan, because D-20's steps (Edit, Save-over, print) are not reachable on a build that stops at Save. If the orchestrator wants both written at Save, write D-20 then and keep its steps limited to what that build can do.
3. Per memory "list-is-for-batches-uat-is-one-at-a-time", these two are the only rows; everything else stays in chat.
4. At the end: move the two folded todos from `.planning/todos/pending/` to completed (the Preview step todo and the Add ingredient heading-row todo), only once built (memory: todo-files-stay-pending-until-built).

## State of the Art

| Old approach | Current approach | When changed | Impact |
|--------------|------------------|--------------|--------|
| Pen flags a removed step (`removed: true`, restorable) | Creation deletes outright; the draft keeps a hidden tombstone for the key ledger | roadmap decision 10, 2026-10-16 | The version pen is untouched (STRUCT-04); saved first versions hold no removed steps |
| Sheet code computed from content | Stored at creation from the version id | roadmap decision 19, Phase 9 | A printed code survives every edit; Save-over must keep it (the `changed` check in `sheetCodeProblems` refuses otherwise) |
| Screen steps: boxed chips, italic purpose and aside | The printed method's tag row, "why" word and callout, upright | sketch 010 D18 on screen, decision 014 2 | One shared reading-step component; walk text normalisation (G-4) |
| Notice line under a bar | Ink card at the foot, `.page-status` | decide-page-notice-shape, 2026-10-25 | Save needs only the words (D-07) |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | React's keyed reorder (`insertBefore`) can blur a focused button in WebKit and Chrome, so the focus request effect is needed | G-13 | If focus survives, the effect is redundant but harmless; if it does not and we omit the effect, D-16 fails on the iPad |
| A2 | `innerText` applies `text-transform`, so uppercase target labels change the walk's `textHash` | G-4 | If it did not, only the "why —" words would change the hash; the normalisation is needed either way. Plan 11-01 proves it by running the new walk against the old build |
| A3 | Every reader of a portion's `step` treats `0` as "a step that does not exist" (read: `rows.js:33`, `lineage.js:255`, `penDraft.js:97,187,219`, `sheetCode.js:75`; `diff.js:45-90` read only by grep) | G-2 | A Next version pen or diff on a recipe with an unplaced row could mis-pair a line. Test: create a version with an unplaced row, `createChildVersion`, `buildDiff`, open the pen |
| A4 | Stripping removed-step tombstones at Save is harmless because nothing references a first version's step keys until it has a batch or a child | G-3 | A batch recorded in another tab between the edit opening and Save-over would be refused by D-06 anyway |
| A5 | Writing `iceEd.style` as the style's name and mapping back to the id from the catalog on Edit load round-trips | G-6 | An unmatched name loads `style: null` with the bands kept; low impact because nothing reads `iceEd` |
| A6 | A both-sides-empty target chip is dropped at Save (CONTEXT refuses only a chip with exactly one empty side) | Save gate | Mark may want it refused |
| A7 | A first version created in the app has `uses` and portions consistent, so deriving `uses` from portions on Edit load is lossless | G-2 | Only an imported inconsistent version differs; Edit load may refuse such a version |
| A8 | The page notice flag and `focusVersion` can share route state, the notice flag being replaced after use | Pattern 5 | If the replace drops `focusVersion` the landing focus is lost; preserve it as shown |
| A9 | `iPad` print of a created recipe matches Chrome's PDF | Print | Safari prints differently (memory: safari-print-differs-from-chrome-print); the iPad PDF is the evidence, so the D-20 check stays |

## Open Questions

1. **Remove a mistaken target; both-empty chip.** Sketch 014 draws Add target and no remove control; the pen has none either. D-10 refuses a chip with one empty side. Recommendation: drop a chip with both sides empty at Save; do not add a remove control (a design change for Sid). **Mark** may prefer one.
2. **An added target's mark in Show changes (D-18).** No such mark exists (G-9). Recommendation: an added target reads plain, as an added step does; changed and removed per D-18. **Mark / Sid.**
3. **An untouched Edit (G-7).** Recommendation: no draft until the first change. **Mark** if he wants "kept until Cancel" as for creation.
4. **Home's Next version and Record a batch while an edit is kept (G-8).** D-04 covers the version page only. Recommendation: page-level refusal plus hidden controls on the page; Home unchanged.
5. **Edit below the editor's width.** Recommendation: show Edit at every width (the route works), or hide below 1024; no board draws it. Planner's call; flag in the plan.
6. **D-13's "Targets, Equipment, Process" (G-5).** They are not printed sections. Recommendation: test and check, build nothing; ask **Mark** only if he meant the Balance's target bands.
7. **Duplicate problem words and the unreadable serving temperature at Save (G-6).** Recommendation: refuse duplicates with a sentence of the planner's wording; save an unreadable temperature as null. Flag both to **Mark** in the summary.
8. **A library entry gone at Save-over (D-03).** D-03 says rows get fresh clones of the library entries; if an entry is missing, keep the stored row's `ingredient` rather than refuse. Planner's call.
9. **Unplaced sentinel 0 or an unissued key (G-2).** Recommendation: 0. Planner's call, stated once so the executor does not choose.
10. **The stale-edit line's wording (D-06), the announcements (D-14 to D-16), the import-refusal sentence for an edit (D-04).** Discretion within the existing sentences' shape; the planner writes them and lists them for Mark.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node | tests, build, harnesses | yes | v24.21.0 | none needed |
| npm | `npm --prefix app ...` | yes | 11.19.0 | none needed |
| Vitest, fake-indexeddb, jsdom | tests | yes | 5.0.0, 6.2.5, 30.1.1 | none needed |
| Playwright WebKit (`playwright-core` 1.63.0 in the npx cache, browser `webkit-2359`) | walk and board harnesses | yes | `/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs` exists | refill with `npx -y playwright-core@1.63.0 --version` |
| Playwright Chromium | Chrome bracketed numbers | no (only WebKit installed) | — | WebKit only; the harness is WebKit by design |
| iPad on the LAN | D-20 device check | Mark's hands | — | none; D-20 is Mark's check, after the WebKit walk |

**Missing dependencies with no fallback:** none. **With fallback:** Chromium (not needed).

## Verification commands and baseline

`workflow.nyquist_validation` is `false` in `.planning/config.json`, so no Validation Architecture section is written; the commands above are the verification shape. Baseline this session: `npm --prefix app test` gives 120 files, 3771 tests, all passing (about 4 s); the Phase 10 walk against HEAD gives `MATCH 94 snapshots`.

## Security Domain

`security_enforcement` is on (ASVS level 1, block on high) [VERIFIED: .planning/config.json].

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication / V3 Session | no | local single-user app, no accounts |
| V4 Access Control | no | no roles; the "who may edit" rule is data-state (no batch, no child), enforced in the transaction |
| V5 Input Validation | yes | the Save gate mirrors `transfer.js`; grams through `parseGramsDraft`; React text children only; `draftMatches*` check every kept draft before restore |
| V6 Cryptography | no | none; the Sheet code is an identifier, not a secret |
| V8 Data Protection / privacy | yes | all data stays on device; the harnesses abort every non-127.0.0.1 request; no network import without a stated policy |
| V12 Files / V13 API | no | no new file or network surface (import is refused while an edit is kept) |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Stored recipe text rendered as markup | Tampering | React text children; a test with `<` and `&` in a step, a target, a note and the recipe name; no `dangerouslySetInnerHTML` (grep) |
| Prototype-reaching keys in a draft or a version (`__proto__`, `constructor`, `prototype` as a row id, library id, step key) | Tampering | `fitsCreateRow` rejects reserved ids; `carriesUnsafeKey` rejects a record; look-ups by `Map` or array scan; `RESERVED_ROW_IDS` in `createRecipe` |
| Partial write leaves a recipe without a version | Tampering / integrity | one transaction + forced-failure test (D-19) |
| Edit draft deleted or overwritten by the recipe page or a pen | Tampering | kind `'edit'`, restore guard, Edit hidden when another draft exists (G-1) |
| Draft written back after Save | Information disclosure / integrity | `endDraft()` (G-10) |
| Stale edit overwrites a version that now has a batch or child | Tampering | check inside the save transaction (D-06) |
| Route state shown as text | Spoofing | enum words only, constant sentences (T-10-05's rule) |
| Id with `/` or `..` in an address | Tampering | `editPath` built on `notebookPath` (`encodeURIComponent`) |
| A saved recipe whose export cannot be imported | Denial of service (data trap) | the Save gate mirrors `transfer.js`; round-trip test (G-6) |
| Harness overwriting `app/dist` or reaching the network | Tampering / disclosure | scratch `--outDir`; 127.0.0.1 only; `11-walk-record-base.sh` refuses a moved BASE |

## Sources

### Primary (HIGH confidence): read in this session
- `.planning/phases/11-steps-structure-save-and-print/11-CONTEXT.md`; `.planning/ROADMAP.md` (Phase 11, Before planning decisions 9, 10, 12, 19, 22 to 25); `.planning/REQUIREMENTS.md`; `.planning/STATE.md` (Phase 11 lines); `.planning/config.json`
- `.planning/sketches/014-steps-structure-save/CONTRACT.md` and `README.md`, and the CSS and markup of `instructions-steps.html` and `add-remove-move.html` (the `P11_CSS` rules, panel markup)
- `.planning/phases/10-the-creation-editor-without-save/10-CONTEXT.md`, `10-walk.mjs`, `10-walk-check.sh`, `10-walk-record-base.sh`, `10-board-check.mjs` (header and arrive), `10-board-notebook.mjs`, `10-SECURITY.md`, plan verify lines
- `.planning/research/ARCHITECTURE.md` (Save path, Hard delete with reference pruning, Alternatives rejected)
- Code: `domain/draft.js`, `creation.js`, `penDraft.js`, `stepKeys.js`, `stepNumbers.js`, `uses.js`, `newRecipe.js`, `lineage.js`, `sheetCode.js`, `versionRow.js`, `recipe.js`, `rows.js`, `catalog.js`, `figures.js`, `diff.js` (target diff); `store/repository.js`, `db.js`, `transfer.js` (validators), `repository.test.js` (patterns), `creation-roundtrip.test.js`; `ui/Method.jsx`, `IngredientTable.jsx`, `PrintSheetPages.jsx`, `PrintSheet.jsx`, `RecipeSheet.jsx`, `sheetView.js`, `CreationPage.jsx`, `CreationRoute.jsx`, `CreationSetup.jsx` (partly), `useKeptDraft.js`, `NotebookPlace.jsx`, `RecipeBand.jsx`, `VersionRow.jsx` (acts), `Shell.jsx` (guard), `useRecipeData.js`, `useRouteIntents.js`, `PageNotice.jsx`, `FieldFeedback.jsx`, `Button.jsx`, `Authored.jsx`; `router.jsx`, `notebookPaths.js`; `styles/app.css`, `print.css`, `notebook.css` (rule lists), CSS and source-text test pins quoted above
- Commands run: `npm --prefix app test` (120 files, 3771 tests pass); `sh .../10-walk-check.sh` (MATCH 94 snapshots); a node script listing seeded roots (none editable); a node script listing Olive Oil's steps; `git log -- app/` (BASE `cf64aa70`)

### Secondary (MEDIUM confidence)
- `.claude/skills/sketch-findings-sprinkles/SKILL.md` (index only); memory notes listed in the project instructions (executor and Mark's List, WebKit rules, device UAT)

### Tertiary (LOW confidence)
- None used. Web search was not needed: no external library behaviour is in question (the stack is fixed and every API used is in the repo).

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH, nothing new, versions read from `package.json`
- Architecture: HIGH for the data model, transaction and routes (read and cross-checked against `transfer.js` and the pins); MEDIUM for focus behaviour after a reorder (A1)
- Pitfalls: HIGH, each traced to a line

**Research date:** 2026-10-26
**Valid until:** until the first Phase 11 plan commit changes `app/` (the BASE and the baseline in G-4 are tied to `cf64aa70`); otherwise 30 days

