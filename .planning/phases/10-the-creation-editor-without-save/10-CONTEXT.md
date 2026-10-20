# Phase 10: The creation editor, without Save - Context

**Gathered:** 2026-10-19 (revised the same day after a Codex review: D-02, D-04, D-04a, D-07, D-08, D-11; and after an Argon review: D-01, D-04a, D-08 to D-08c, D-10a, T-01 to T-06)
**Status:** Ready for planning

<domain>
## Phase Boundary

A maker starts a blank recipe from the Notebook with only a name and authors everything its first version carries apart from its steps: the recipe's name and one description, its Version name, its Before you start notes, its rows from the library with grams and live balance figures, its own scales (0 to 2, each with its kind) and problems (0 to 2), its ice cream style with the balance bands and the serving temperature it fills in. A half-made recipe survives a closed tab and the Notebook offers Resume. There is deliberately no Save: a creation is only its `create` draft (Phase 9's kind), nothing real is stored, the Notebook lists no new recipe, and the reset window stays open. Requirements: MAKE-04, MAKE-05, MAKE-06, MAKE-08, MAKE-09, MAKE-11, TASTE-01, TASTE-02.

Sketch 013 (five approved boards, 22 decisions, `CONTRACT.md`) is the acceptance target and fixes the words, layout and behaviour of every surface. This context settles only what the boards do not draw.

</domain>

<decisions>
## Implementation Decisions

### The creation route
- **D-01:** The creation editor lives at `/notebook/new`, one fixed route, matching one draft at a time (sketch 013 decision 10). It mounts the shared Sheet in a `creating` mode with no stored version and no baseline (Phase 8 D-09). No stored id appears in the URL; the draft's own `recipeId` and `versionId` stay inside the draft. A route wrapper on `/notebook/new` finds the kept `create` draft first (`repository.listDrafts()` matched with `draftMatchesCreate`), then mounts the editor with that `versionId` and `recipeId`, because `useDraftWriter` and `useKeptDraft` are keyed by `versionId` from mount (`repository.getDraft(versionId)`); with none it redirects (D-02). (Mark, 2026-10-19) — **Reversibility:** costly — Phase 11's Save lands on `/notebook/:recipeId/:versionId`; the route the editor itself uses is referenced by the Notebook entry, Resume, Cancel and the redirect below, so a change later touches each.
- **D-02:** A reload of, or a direct visit to, `/notebook/new` when no `create` draft is kept replace-redirects to `/notebook`, silently. New behaviour: `NotebookRedirects.jsx` today redirects `/notebook/:recipeId` to its latest version or renders `RecipeNotFound`; reuse its component-effect and `{replace: true}` pattern, not its outcomes. The Notebook entry is the only way to start. (Mark, 2026-10-19)
- **D-03:** Cancel deletes the draft and lands on the Notebook, which then shows no draft row and offers New recipe again. The announcement is page-scoped ("Draft discarded", the three-scope rule of 03.3.1), on the Notebook. No confirmation dialog and no Undo: Phase 2's rule for a pen's Cancel carries forward, and nothing stored exists to restore. (Mark, 2026-10-19)
- **D-04:** Start writes the draft at once: pressing Start mints `recipeId` and `versionId` (`domain/id.js`), writes and awaits the name-only `create` draft through the repository seam, then navigates to `/notebook/new`. This immediate first write is new in this phase; every later edit goes through Phase 9's debounced hook (D-18 covers the restore of a name-only draft, the 250 ms debounce and the unmount flush, not an immediate write). From Start the Notebook shows the draft row and Resume in place of New recipe. (Mark, 2026-10-19)
- **D-04a:** A started creation stays kept until Cancel, even when every editable field is blank again (a name erased, nothing else typed). Today `isCreateDraftDirty` reads such a payload as blank (`draft.test.js:728-738`) and `useKeptDraft`'s persist branch deletes a draft that turns blank; `useKeptDraft.test.jsx:494-508` and `564-587` pin that deletion for `creating: true` as well, so those two tests change (clearing a creation's fields overwrites the stored `create` draft rather than deleting it), while the version-pen blank-deletion pin (`useKeptDraft.test.jsx:290-301`) stays. The source-text pins on `useKeptDraft.js` in `RecipePage.shell.test.js:258-293` (exact counts of `repository.getDraft(versionId)`, `repository.saveDraft(record)`, `repository.deleteDraft(versionId)`, `draftMatchesCreate(record)`, `onRestoreCreate(record.payload)`, `kind: 'create'`; no `cancelled` identifier) must still hold, so the widening is a `creating` condition on the existing branch, not a new call site. The Notebook's draft row reads "Untitled" while the name is empty. (Mark, 2026-10-19, Codex F-04)
- **D-04b:** One create draft at a time, enforced at Start: before writing, Start re-reads `repository.listDrafts()`; when a `create` draft already exists (another tab started one, or this tab's list is stale), Start writes nothing and the Notebook draws that draft's row with Resume in place of the entry. No draft is ever replaced or deleted by Start, so no work is dropped. Two drafts can arise only when two Starts' writes overlap within one read; the Notebook then shows the newest and Cancel reveals the other (plan 10-11 tests it). (Mark, 2026-10-20, Mark's List `decide-second-create-draft-from-another-tab`, answered after the round-1 review's Agreed Concern 9)

### Rows without steps
- **D-05:** The Ingredients table while creating is flat, as `creation-editor.html` draws it: no Step heads, no Instructions section, no portion split, nothing on screen names a step. A row's one portion keeps `step: 1` in the draft (`fitsCreatePortion`), unseen; Phase 11's allocation settles the reference before anything is saved. Not the "Step 1 head" variant, which would be a design change for Sid. (Mark, 2026-10-19)
- **D-06:** The creation Sheet shows no Sheet code. The headnote is the name and the description as read text (the board). The code is minted from the version id and checked for clashes by Phase 11's Save (Phase 9 D-04); a draft has none. (Mark, 2026-10-19)
- **D-07:** The live Balance reads the library, not copied figures: the library records are loaded through `repository.listLibrary()` (as `IngredientsPlace.jsx` does; `CatalogContext` holds styles, scales, problems and machines only, and is not extended here) and one loaded collection is shared by the picker and the live row projection. On each change the editor builds a sheet row per draft row through `rowFromLibraryRecord(entry, grams)`, and the version copies the figures only at Save (LIB-08). `CREATE_DRAFT_KEYS` stays as pinned: a draft row is `{id, libraryId, portions: [{step: 1, grams: string}]}` (`fitsCreateRow`), its id minted once when it is added, with no row-level grams and never figures. A library edit therefore moves a draft's figures, never a stored version's; a draft row whose entry is gone is Phase 11's Save problem, not this phase's (import is refused while a draft exists, D-10). (Mark, 2026-10-19)
- **D-08:** Grams on a creation row use the version pen's parser and sentences: the portion keeps the raw string, the projection passes `parseGramsDraft(raw) ?? 0` to `rowFromLibraryRecord` (which takes a finite non-negative number), so an empty or unparsable field contributes 0 g while the row stays on the table and in the count. The zero fallback is creation's own (the pen falls back to the stored amount, which a creation has none of). The field message shows on blur: when focus leaves the field holding an empty or unparsable value, and clears on the next valid value; typing is never interrupted, and there is no blocked-save moment to drive it. Each row carries its own message and its own `is-marked` outline (a per-row error id, not the pen's single `ingredient-field-error` / `blockedRowId`), so several invalid rows can read their message at once. (Mark, 2026-10-19, Codex F-03, Argon ask 1)
- **D-08a:** The Balance region (`.side-region`) appears once any row has grams above 0, not once a row exists: `computeBalance` returns nothing for zero mass (`composition.js:24`) and `FormulationNote` renders nothing, so a first row at 0 g would leave a bare Balance heading. The board's "only once a row exists" is read as "once there are figures". `RecipeSheet.test.jsx:68` (the region renders for an empty version in reading mode) is unchanged: the condition is `creating` only. (Mark, 2026-10-19, Argon ask 2)
- **D-08b:** A target band reaches the live figures only when both ends parse as finite non-negative numbers with low at or below high (`buildFigures` takes `[lowNumber, highNumber]` or no band); otherwise the figure reads "no target set" and the band fields show no error. The draft's `style` holds the style row's id (`philadelphia`, as `draft.test.js:594` and `data/styles.js` use) while the select shows the row's name. (Mark, 2026-10-19, Argon ask 3)
- **D-08c:** The same-name warning compares trimmed names ignoring case against the stored recipes, and shows only in the Notebook's New recipe entry, as the board draws it; the editor's Recipe name field carries no such line. While the name is blank in the editor, the Sheet's heading, the document title and the Notebook's draft row all read "Untitled". (Mark, 2026-10-19, Argon ask 4)

### Leaving mid-creation
- **D-09:** The maker may leave the editor freely: a rail link, a Notebook link or browser back navigates at once, the kept draft flushes on unmount (the debounce path D-18 tests), and the Notebook shows the draft row with Resume. Creation is not an open pen: nothing disables and nothing asks. (Mark, 2026-10-19)
- **D-09a:** No `beforeunload` handler. Mark chose "warn only while a write is pending, the same rule the pens use"; the pens' rule, checked after the answer, is that no `beforeunload` handler exists anywhere (Phase 4 D-17, pinned by `RecipePage.drafts.test.jsx` "registers no beforeunload handler anywhere while a pen holds ink"). The create draft follows that rule as it stands: the debounce keeps the window to 250 ms of ink, flushed on unmount, and a tab closed inside it loses only that. Adding a warning would reverse D-17 and fail the pin; if Mark wants one it is a separate decision, not this phase's.
- **D-10:** Store import is refused whenever a `create` draft is kept, on every route, with the existing refusal the Shell uses for an open pen on the routed page (`decide-import-refreshes-open-recipe-pens` = refuse: the click is refused, no chooser opens, a notice says why). The notice names the open creation and points at Resume or Cancel. Reason: import replaces the library the draft's rows link to (Phase 9 D-14). (Mark, 2026-10-19)
- **D-10a:** Page-scoped notices need a home outside the recipe route: `.page-status-anchor` and `<PageStatus>` live only in `RecipePageForRoute` (`router.jsx:35-84`), and `RecipePage.test.jsx:946-954` pins their order there. The plan gives `/notebook` and `/notebook/new` (and every Shell route where D-10 can refuse) a `.page-status` region without moving that anchor, or updates that pin if it lifts it. `Shell.chooseImportFile` is a synchronous click handler reading `importGuardRef`; it must know at boot, and on every create-draft write or delete, whether a creation is kept, so the refusal happens before the file chooser opens on any route. "Draft discarded" reaches `/notebook` through route state consumed once, or a Shell-level announcer; `Shell.importGuard.test.jsx:170-177` is the pattern for the refusal notice.

### Proof and device check
- **D-11:** The 94-snapshot walk must MATCH. Re-record the before-walk at Phase 10's base commit with Phase 9's recorder (`09-walk.mjs`), then the finished phase is compared against that new baseline with no allow-list: this phase changes no stored shape and no existing route, so snapshots and store dumps alike must match. Phase 9's `09-walk.mjs` applies `ALLOWED_STORE_PATHS` and `09-walk-check.sh` hardcodes `09-walk-before.json`, so the plan adds a Phase 10 wrapper or strict mode that fails on every store difference and does not reuse Phase 9's allowance policy. The creation route, the Notebook entry and the picker are outside the walk and are checked side by side against sketch 013 in WebKit, board by board. (Mark, 2026-10-19)
- **D-12:** One iPad check at the end of the phase, from the production build (`npm --prefix app run build && npm --prefix app run preview -- --host`), as one check row on Mark's List: New recipe through a worked-on creation (rows, style, a scale, a problem), close the tab, Resume, Cancel. 1366 is the creation width; `P10_Editor` and `P10_Style` are drawn only there. The steps are walked in WebKit first (verify-device-check-steps rule). (Mark, 2026-10-19)
- **D-13:** The 393 panels of `P10_Notebook`, `P10_Picker` and `P10_Scales` are measured in Playwright WebKit at 393 with a coarse pointer against the boards. No iPhone row: creating recipes is not a phone job. (Mark, 2026-10-19)

### Fixed by sketch 013 and earlier decisions (carry forward; do not re-decide)
- The boards and their CSS are the authority; `CONTRACT.md` sections 1 to 6 name every element, word and measure. Conformance is side by side in a browser, never prose or a test count.
- Same names allowed, with "Another recipe already has this name. You can still use it."; Start with no name says "Enter a recipe name." (decisions 1, 11, 13).
- One description box fills both the recipe's and the Sheet's description; the Version name starts "Version 1", editable, Required under it (decisions 2, 3).
- The picker opens under the table, adds one ingredient per opening, closes on the pick with focus in the new row's empty grams field; an entry already on the recipe reads Added; no match reads "Not in the library yet" and adds nothing; matching is sketch 012's `filterLibrary` (decisions 4, 7; Phase 9 D-11).
- Remove on a row deletes it outright and the Balance follows; the Before you start note remove uses the row remove's link look (decisions 5, 19).
- The style is a `select` menu, "No style" first, then Philadelphia, French, Gelato, Sorbet; picking replaces all six bands and the serving temperature; Clear (and No style) leaves the bands and empties the temperature; editing a band or the temperature leaves the style picked; PAC and Sugar bands start blank; the Sweetness · POD rule runs 0 to 40 (decisions 6, 9, 14, 16, 17, 18, 21; Phase 9 D-12, D-19).
- The two scale kinds read "Right in the middle" and "Low to high"; nothing is pre-picked; Required stands under each empty field; 0 to 2 scales and 0 to 2 problems, the add controls gone at two; a scale's key is minted once and never equals a core key (decision 12; Phase 9 D-03b). The draft accepts any half-made state; validity is Save's job in Phase 11.
- No machine and no process in the editor; the log column reads Style, Scales, Problems (decisions 15, 20; `todo-rethink-batch-equipment`).
- The `create` draft payload is `CREATE_DRAFT_KEYS` as pinned by `draft.test.js`; a change to it is Mark's decision. The editor holds `createDraft` as state, a new object per change and the same object across renders (the hook's identity rule).
- Every new button, checkbox and radio renders through `ui/Button.jsx`, `Checkbox.jsx` or `Radio.jsx`; every link carries `tabIndex={0}`; every visual value reads a token and the boards add none.

### Tests and pins this phase changes (Argon review, 2026-10-19)
Source-text pins guard most of what this phase touches; a plan names each it changes and leaves the rest green.
- **T-01 `RecipeSheet` in `creating` mode:** `RecipeSheet.jsx` keeps the four pinned expressions (`RecipePage.test.jsx:1159-1192`: `showsMethodRegion(...)`, the `method-region` and `before-region` conditionals, the `recipe-page--no-before` / `--no-method` class string) and the `IngredientsHead` pin (`RecipeSheet.test.jsx:103-112`). In `creating`: `beforeRegionShown` is true, `NoteList` (`Authored.jsx:23`, today `developing` only) is editable and followed by Add note; the table region ends with Add ingredient or the open picker; `Headnote` renders the read-only heading and omits the empty `headnote__prose` paragraph as the board does; `FormulationNote` sets `tabIndex` -1 as it does for `developing`; `IngredientTable` renders no struck baseline values, no "was … now" label clauses (its `GramsCell` compares the raw string with the stored number and would strike a false `0 g` under an empty field), and its remove deletes the row outright instead of the pen's remove/restore toggle.
- **T-02 CSS home and scoping:** Notebook entry and draft-row rules (`.nb__head`, `.nb__new`, `.nb__draft`) go in `shell.css` under `.place`, inside its existing place `@media` blocks (`shell.test.js:70-152` pins the `.shell`/`.place` prefix, the five `@media` blocks and the ten `border-radius` selectors). Editor and picker rules go in `notebook.css`, every selector under `.notebook` (`notebook.test.js:37-53` pins the prefix and the exact six `@media` conditions, so no new `759.98px` block: use `723.98px` and `(pointer: coarse)`). `.pick__act`'s underline cannot sit in `app.css` (`binder.test.js:308-315`, `cross-cutting.test.js:101-137` pin underline to `.text-control` and `a`); `print.test.js:267-284` and `tokens.test.js:82-136` apply as they stand. The boards' `p10.py` rules are the values; their selectors are rescoped.
- **T-03 `NotebookPlace`:** `NotebookPlace.test.jsx:95-98` ("offers nothing to start") is Phase 9's pin and is replaced by this phase's pins for New recipe, the entry form and the draft row; its store stub (`191-207`) gains `repository.listDrafts`. The empty-list early return (`NotebookPlace.jsx:58-67`) still renders the head with New recipe or Resume and any draft row.
- **T-04 Scale Kind control:** `Segmented.jsx` derives the radio `name` and caption id from the group label and renders Clear once picked, so two scale cards would share one DOM radio group and show a Clear the board does not draw. The Kind cells use a per-scale radio name (keyed by `scale.key`) and no Clear. Labels "Right in the middle" and "Low to high" map to stored kinds `goldilocks` and `magnitude` (`SCALE_KINDS`, `domain/catalog.js:18`; `''` unpicked). The stops preview line renders only when both end words and the kind are set.
- **T-05 Seed-data scan:** the "Every recipe" cues are derived from the catalog (`useCatalog()`: the core scales' names joined with ", ", the core problems' words with " · "), never an array literal of those names, which `seed-data-scan.test.js:105-191` rejects outside `app/src/data`. The picker's row summary reuses `IngredientsPlace.jsx`'s `summaryText` and `capitalised`, exported.
- **T-06 Kept-draft pins:** as D-04a: two `creating: true` deletion cases in `useKeptDraft.test.jsx` change; the pen's stay; `RecipePage.shell.test.js:258-293` counts hold.

### Claude's Discretion
- The plan slicing, within the research's order: the `creating` mode on the shared Sheet, then the picker and rows, then style, scales and problems, then the Notebook entry and Resume. Each plan lands green.
- Module homes and names (a `useCreation` hook beside `useKeptDraft.js`, the picker and the log-column regions as components under `app/src/ui/`), the `creating` props of `RecipeSheet`, and how the draft's rows become sheet rows for the Balance.
- The wording of the import-refusal notice for a kept creation, within the existing sentence's shape.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase definition
- `.planning/ROADMAP.md` Phase 10 (goal, success criteria 1 to 5, Notes), "Before planning" (the reset window, the design gate, decisions 3, 6, 7, 8, 10, 11, 13, 14, 17, Open question (a)).
- `.planning/REQUIREMENTS.md` MAKE-04, MAKE-05, MAKE-06, MAKE-08, MAKE-09, MAKE-11, TASTE-01, TASTE-02.

### Design (the acceptance target)
- `.planning/sketches/013-creation-editor/README.md` — the five boards, Decisions 1 to 22, Measured, Not verified.
- `.planning/sketches/013-creation-editor/CONTRACT.md` — sections 1 to 6: every element, word and measure per board.
- `.planning/sketches/013-creation-editor/notebook-new-recipe.html`, `creation-editor.html`, `ingredient-picker.html`, `style-menu-and-bands.html`, `scales-and-problems.html` — the boards themselves, CSS included (the last panel of the Notebook board, "Option B · several drafts", is not a target).
- `.planning/sketches/012-places/` — the Notebook and Ingredients places the entry and the picker build on.
- `.planning/notes/2026-10-16-style-bands-draft.md` — the four styles' approved bands and serving temperatures (seeded in Phase 9; the editor reads the styles table).
- `.planning/notes/2026-10-18-balance-and-process-decisions.md` — the menu decision and what lands after this phase.
- `DESIGN.md` — the Formulation Cookbook direction; the Notebook and Ingredients places paragraph.

### What this phase builds on
- `.planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-CONTEXT.md` — D-03b (scale keys), D-11 (search), D-12 (styles table), D-14 (import), D-18 (the `create` kind in `useKeptDraft`), D-19 (serving temperature).
- `.planning/phases/08-split-the-recipe-page-along-its-jobs/08-CONTEXT.md` — D-08 (hook wiring), D-09 (`sheetView` with `baseline: null`, `RecipeSheet` with no stored version), D-10 (StrictMode restore).
- `.planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-walk.mjs`, `09-walk-record-base.sh`, `09-walk-check.sh` — the walk harness to re-record (D-11).
- `.planning/research/SUMMARY.md`, `ARCHITECTURE.md`, `PITFALLS.md` — the v2.0 research (slice order, hook-order law).

### Conventions
- `.claude/CLAUDE.md` Conventions (framework-free domain; all store access through `app/src/store/repository.js`; tokens; `tabIndex={0}`; device UAT from the build).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/src/domain/draft.js` — the `create` kind: `CREATE_DRAFT_KEYS`, `blankCreateDraft`, `draftMatchesCreate`, `isCreateDraftDirty`; a row is `{id, libraryId, portions:[{step, grams: string}]}` (`fitsCreateRow`, exact keys), bands are string pairs, `serveTempC` a string.
- `app/src/ui/useKeptDraft.js` — `creating`, `createDraft`, `onRestoreCreate`: restore with no version and no batches, persist of kind `create`, flush on unmount.
- `app/src/domain/newRecipe.js` (`createRecipe`, for Phase 11's Save), `app/src/domain/versionRow.js` (`rowFromLibraryRecord`, grams as a number), `app/src/domain/lineage.js` (`parseGramsDraft`), `app/src/domain/stepKeys.js`, `app/src/domain/id.js`.
- `app/src/domain/ingredientSearch.js` (`filterLibrary`) and `app/src/ui/IngredientsPlace.jsx` — the picker's filters, status line and matching.
- `app/src/ui/RecipeSheet.jsx` and `app/src/ui/sheetView.js` — accept `baseline: null` and no stored version (Phase 8 D-09).
- `app/src/ui/CatalogContext.jsx`, `app/src/store/catalog.js` — the boot catalog: styles (bands, serve temperature), core scales and problems, machines. The library is not in it: `repository.listLibrary()`.
- `app/src/domain/catalog.js` (`isScaleDefinition`), `axes.js`, `battery.js` — scale and problem definitions and the core sets the cues name.
- `app/src/ui/NotebookPlace.jsx`, `notebookPaths.js`, `NotebookRedirects.jsx` — the list the entry joins; the redirect pattern for D-02.
- `app/src/ui/Shell.jsx` — the import refusal for an open pen (D-10 extends it to a kept creation).
- `app/src/ui/Button.jsx`, `Checkbox.jsx`, `Radio.jsx`, `FieldFeedback.jsx`, `MarkOneField.jsx`, the `ink-field`, `prose-field`, `text-control` roles.

### Established Patterns
- Hook-order law: every hook above the early returns. The kept-draft restore runs once per page instance under StrictMode (Phase 8 D-10).
- Three feedback scopes (field, form, page); Cancel discards with no dialog; no `beforeunload` anywhere (Phase 4 D-17).
- A version embeds a `structuredClone` of its rows' figures at store time; a draft holds links and typed values only.
- The tabindex scan (`app/src/ui/tabindex-scan.test.js`) and the no-literal token rule apply to every new file.

### Integration Points
- `app/src/router.jsx`: `/notebook/new` before `/notebook/:recipeId`, so "new" is never read as a recipe id.
- The Notebook place: New recipe at the end of the title row; the draft row and Resume read the drafts store through the repository seam.
- Phase 11 takes over at Save: `createRecipe` plus the Sheet code, steps and allocation, landing on `/notebook/:recipeId/:versionId`.

</code_context>

<specifics>
## Specific Ideas

- Sketch 013 is the authority, CSS included; the boards show the built shell's own markup, so the build should reuse those class roles rather than invent parallel ones.
- The style control is the browser's own `select`; the board's open list is a stand-in and the build renders nothing for it.

</specifics>

<deferred>
## Deferred Ideas

- A `beforeunload` warning while a draft write is pending: would reverse Phase 4 D-17 and its pin; Mark's call if ever wanted (D-09a).
- A "Step 1" head on the creation table: a design change for Sid if Phase 11 wants steps to grow from a drawn one.
- Letting the maker add styles and machines (`todo-custom-ice-cream-type`, `todo-custom-machine`); steering a batch with known equipment (`todo-rethink-batch-equipment`).
- The Mise en Place auto-generator (prep notes pulled into Before you start from `prepNote`, stored by Phase 9 D-20 and read by nothing yet).

### Reviewed Todos (not folded)
- "Build the Recipe book print format" — no print in this phase (Phase 11 prints the bench sheet).
- "Write a product brief for phone-based jobs" — creation is not a phone job; keyword match only.
- "Consider a Mise en Place auto-generator" — a later Before you start feature; keyword match only.

</deferred>

---

*Phase: 10-The creation editor, without Save*
*Context gathered: 2026-10-19*
