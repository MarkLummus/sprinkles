# Phase 10: The creation editor, without Save - Research

**Researched:** 2026-10-19
**Domain:** In-repo wiring (React 19 + Vite JSX, no TypeScript; Vitest; `idb` behind `app/src/store/repository.js`). A `creating` mode on the shared Sheet, a route, a Notebook entry, and a kept `create` draft. No web research was needed or done.
**Confidence:** HIGH for every code claim (each cites a file and lines read this session); MEDIUM for the few `[ASSUMED]` items in the Assumptions Log.
**Baseline:** HEAD `e461a7a1` on `main`; `npm --prefix app test` = 113 files, 3475 tests, all passing, about 4 s [VERIFIED: ran it this session].

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

### The creation route
- **D-01:** The creation editor lives at `/notebook/new`, one fixed route, matching one draft at a time (sketch 013 decision 10). It mounts the shared Sheet in a `creating` mode with no stored version and no baseline (Phase 8 D-09). No stored id appears in the URL; the draft's own `recipeId` and `versionId` stay inside the draft. A route wrapper on `/notebook/new` finds the kept `create` draft first (`repository.listDrafts()` matched with `draftMatchesCreate`), then mounts the editor with that `versionId` and `recipeId`, because `useDraftWriter` and `useKeptDraft` are keyed by `versionId` from mount (`repository.getDraft(versionId)`); with none it redirects (D-02). (Mark, 2026-10-19) — **Reversibility:** costly — Phase 11's Save lands on `/notebook/:recipeId/:versionId`; the route the editor itself uses is referenced by the Notebook entry, Resume, Cancel and the redirect below, so a change later touches each.
- **D-02:** A reload of, or a direct visit to, `/notebook/new` when no `create` draft is kept replace-redirects to `/notebook`, silently. New behaviour: `NotebookRedirects.jsx` today redirects `/notebook/:recipeId` to its latest version or renders `RecipeNotFound`; reuse its component-effect and `{replace: true}` pattern, not its outcomes. The Notebook entry is the only way to start. (Mark, 2026-10-19)
- **D-03:** Cancel deletes the draft and lands on the Notebook, which then shows no draft row and offers New recipe again. The announcement is page-scoped ("Draft discarded", the three-scope rule of 03.3.1), on the Notebook. No confirmation dialog and no Undo: Phase 2's rule for a pen's Cancel carries forward, and nothing stored exists to restore. (Mark, 2026-10-19)
- **D-04:** Start writes the draft at once: pressing Start mints `recipeId` and `versionId` (`domain/id.js`), writes and awaits the name-only `create` draft through the repository seam, then navigates to `/notebook/new`. This immediate first write is new in this phase; every later edit goes through Phase 9's debounced hook (D-18 covers the restore of a name-only draft, the 250 ms debounce and the unmount flush, not an immediate write). From Start the Notebook shows the draft row and Resume in place of New recipe. (Mark, 2026-10-19)
- **D-04a:** A started creation stays kept until Cancel, even when every editable field is blank again (a name erased, nothing else typed). Today `isCreateDraftDirty` reads such a payload as blank (`draft.test.js:728-738`) and `useKeptDraft`'s persist branch deletes a draft that turns blank; `useKeptDraft.test.jsx:494-508` and `564-587` pin that deletion for `creating: true` as well, so those two tests change (clearing a creation's fields overwrites the stored `create` draft rather than deleting it), while the version-pen blank-deletion pin (`useKeptDraft.test.jsx:290-301`) stays. The source-text pins on `useKeptDraft.js` in `RecipePage.shell.test.js:258-293` (exact counts of `repository.getDraft(versionId)`, `repository.saveDraft(record)`, `repository.deleteDraft(versionId)`, `draftMatchesCreate(record)`, `onRestoreCreate(record.payload)`, `kind: 'create'`; no `cancelled` identifier) must still hold, so the widening is a `creating` condition on the existing branch, not a new call site. The Notebook's draft row reads "Untitled" while the name is empty. (Mark, 2026-10-19, Codex F-04)

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

### Deferred Ideas (OUT OF SCOPE)

- A `beforeunload` warning while a draft write is pending: would reverse Phase 4 D-17 and its pin; Mark's call if ever wanted (D-09a).
- A "Step 1" head on the creation table: a design change for Sid if Phase 11 wants steps to grow from a drawn one.
- Letting the maker add styles and machines (`todo-custom-ice-cream-type`, `todo-custom-machine`); steering a batch with known equipment (`todo-rethink-batch-equipment`).
- The Mise en Place auto-generator (prep notes pulled into Before you start from `prepNote`, stored by Phase 9 D-20 and read by nothing yet).

### Reviewed Todos (not folded)
- "Build the Recipe book print format" — no print in this phase (Phase 11 prints the bench sheet).
- "Write a product brief for phone-based jobs" — creation is not a phone job; keyword match only.
- "Consider a Mise en Place auto-generator" — a later Before you start feature; keyword match only.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| MAKE-04 | Start a blank recipe from the Notebook with only a name; same names allowed, Notebook warns | Notebook entry form + Start (Code Map D-04, D-08c); `recipeNameMessage` already holds "Enter a recipe name."; the same-name check is new and pure (Don't Hand-Roll) |
| MAKE-05 | Recipe name, one description (fills both), Version name starting "Version 1" | `blankCreateDraft` already sets `versionLabel: 'Version 1'` and `description: ''` (draft.js:531-547); band markup from board 2; Headnote reads the draft as read text (T-01) |
| MAKE-06 | Add rows from the library, grams, Remove deletes outright, live balance, "Not in the library yet" | Picker (board 3) over `repository.listLibrary()` + `filterLibrary`; `rowFromLibraryRecord` projection; sheetView needs no change (Architecture Pattern 2); flat table is automatic with `method: []` (verified by running) |
| MAKE-08 | Before you start notes | `NoteList` gains an editable `creating` branch (Authored.jsx:23); `beforeRegionShown` widened in RecipeSheet.jsx:88 |
| MAKE-09 | Style menu fills six bands and serving temperature; editable; Clear | `catalog.styles` rows already carry `bands` and `serveTempC.default` (data/styles.js:18-71); draft keys `style`, `targets`, `serveTempC` already exist |
| MAKE-11 | Survives a closed tab; Resume; abandoning leaves no record | `useKeptDraft` `creating` branch exists; D-04a widening; route wrapper (D-01/D-02); Cancel path (D-03) |
| TASTE-01 | 0 to 2 scales with name, two end labels, kind | `fitsCreateScale` shape (draft.js:445-451), `mintScaleKey(freshId())` (catalog.js:74), T-04 Kind control |
| TASTE-02 | 0 to 2 problems | `fitsCreateProblems` (draft.js:459-461): strings, at most `MAX_RECIPE_PROBLEMS` |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

From `./CLAUDE.md` and `./.claude/CLAUDE.md` (treated as locked, same authority as CONTEXT):

- Small reviewable steps; surface structural choices (routing, state, build, testing) instead of assuming. This phase adds one route and no new library, so no structural surprise; the one real choice is where the Shell-level notice lives (Open Question 1).
- Domain math in framework-free modules under `app/src/domain/` (no framework, DOM or store import); the domain suite runs under Vitest's `node` environment. New pure logic (live version, band parsing, style apply, scale/problem ops, same-name check) belongs there, with node tests.
- Every store access goes through `app/src/store/repository.js`; only that file imports `idb`.
- Every visual value reads a token from `app/src/styles/tokens.css`; no literals in components or stylesheets. All 30 tokens in the board rules already resolve [VERIFIED: checked every `var(--…)` in `.planning/canvas-generators/p10.py` P10_CSS against tokens.css, 0 missing].
- Notes and prose render as text; no `dangerouslySetInnerHTML` anywhere under `app/src`.
- English only in agent prose, commit messages and browser-test input values.
- Device UAT from `npm --prefix app run build && npm --prefix app run preview -- --host`, never the dev server. One Vite process per workspace.
- Every `a`, `Link`, `NavLink` carries a literal `tabIndex={0}`; every button/checkbox/radio renders through `ui/Button.jsx`, `Checkbox.jsx`, `Radio.jsx` (enforced by `ui/tabindex-scan.test.js`). A `select` is invisible to the scan: add `tabIndex={0}` by hand (IngredientsPlace.jsx:208-213 does).
- Impeccable decides design; every edit under `app/` goes through a GSD command. The `gsd-ui-review` step is shadowed by a project skill that runs the Impeccable audit.
- Project skill `sketch-findings-sprinkles` (read): 44 px targets under coarse pointers, 6 px caption gap, feedback co-located with the action (field, form, page scopes), "measure the DOM" for verification. Sketch 013 supersedes it wherever they differ.
- Mark's List: the end-of-phase iPad check is one check row (D-12). `gsd-executor` has no `ArtifactData` tool, so a plan with a Mark's List step must stop at a checkpoint and the orchestrator writes the row (memory: gsd-executor-has-no-artifactdata). Timestamps for list rows come from `date -u +%Y-%m-%dT%H:%M:%S.000Z`, never typed.

## Summary

The phase is wiring, and the existing modules already carry most of the contract. The `create` draft kind, its fit check, its blank payload, its restore/persist path in `useKeptDraft`, the scale definition contract, the four seeded styles with bands and default serving temperatures, the 111-entry library, the search function and the Notebook list all exist and are green. Four things are genuinely new: (1) a `creating` mode threaded through `RecipeSheet`, `Headnote`, `NoteList`, `FormulationNote` and `IngredientTable`; (2) a route wrapper + editor page for `/notebook/new` and a Notebook entry/draft row; (3) a Shell-level import refusal that must be known synchronously; (4) the log column (Style, Scales, Problems) and the picker.

`sheetView.js` needs no change. It already branches only on `mode === 'developing'`, so a synthetic version built from the draft, passed with `baseline: null` and mode `'creating'`, takes the reading path and produces the figures [VERIFIED: sheetView.js:34-60]. The flat, step-less table also needs no code: with `method: []` the step map is empty, so a step-1 portion falls into the single "unallocated" group and `showStepHeads` is false [VERIFIED: IngredientTable.jsx:560-561 and a node probe printing `Map(0) {} of step 1 -> null`].

The risk is not the logic, it is the pins. About a dozen source-text and CSS-contract tests constrain exactly where code and CSS may live (see "Pins" below). The most surprising ones: `RecipeSheet.jsx` may import only `react` and `./` siblings, and must keep exactly one `<IngredientTable`, one `<FormulationNote`, one `<Method`; `useKeptDraft.js` has exact call-site counts and an unused-import check; `router.jsx` is read as text for the order of `className="page-status-anchor"`, `<PageStatus`, `<RecipePage`; `.page-status` can sit in only one place per page or the 94-snapshot walk records a diff; `shell.css` and `notebook.css` pin their `@media` lists; the board's `.ing__*` rules are scoped `.place …` in the app, so the picker (inside `.notebook`) gets no filter styling unless the rules are re-homed.

**Primary recommendation:** Build the editor as a new page component beside `RecipePage` (not inside it), on top of a new pure `domain/creation.js` (live version, band parse, style apply, scale/problem/row ops, same-name check). Record the strict walk baseline first, before any `app/` change. Keep `RecipeSheet` additive: new `creating` props that pass through existing single `<IngredientTable>`/`<FormulationNote>` elements. Treat each pin in the Pins section as a design input, not an obstacle.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Draft shape, fit check, blank payload, dirty check | Domain (`domain/draft.js`) | — | Already there; payload keys are pinned by `draft.test.js` and are Mark's decision to change |
| Live version from draft (rows, bands, notes) for Balance | Domain (new pure module) | UI (`useMemo`) | Framework-free; node-testable; `rowFromLibraryRecord` + `parseGramsDraft` are domain |
| Style pick, Clear, band edit, scale/problem add/remove/key minting, same-name test | Domain (new pure functions) | UI handlers | Pure state transitions on the draft; one place for the "new object per change" identity rule |
| Persistence of the half-made recipe | Store via repository seam (`getDraft`/`saveDraft`/`deleteDraft`/`listDrafts`) | `useKeptDraft` | 250 ms debounce, unmount flush, restore-once under StrictMode are hook concerns |
| `/notebook/new` route, redirect when no draft | UI route wrapper | Router | Reads `listDrafts` + `draftMatchesCreate`; replace-redirects (D-02) |
| Import refusal while a creation is kept | UI Shell (sync ref) | Notebook/Creation page reports | Click handler must be synchronous (Shell.jsx:332-338) |
| Picker list/filter | UI (reuses `domain/ingredientSearch.js`) | CSS under `.notebook` | Same match rule as the Ingredients place (D-11 of Phase 9) |
| Page-scoped notices ("Draft discarded", import refused) | UI route components | Shell | `.page-status` is positioned against `.page-status-anchor`; one per page |

## Standard Stack

No new library. Everything is in the repo's pinned stack: React 19.2.8, react-router 8.3.1, idb 8.0.3, Vitest 5.0.0, Vite 8.2.2, jsdom 30.1.1, fake-indexeddb 6.2.5 [VERIFIED: app/package.json]. Tests use jsdom per-file via the `// @vitest-environment jsdom` docblock; the default environment is `node` [VERIFIED: app/vitest.config.js].

### Package Legitimacy Audit

No external packages are installed or recommended by this phase. `gsd-tools package-legitimacy check` was not run because there is nothing to check.

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| (none) | — | — | — | — | — | — |

**Packages removed due to [SLOP] verdict:** none. **Packages flagged [SUS]:** none.

### Existing modules to reuse (do not rebuild)

| Module | Use | Where |
|--------|-----|-------|
| `domain/draft.js` | `blankCreateDraft`, `draftMatchesCreate`, `buildDraftRecord`, `newestDraft`, `CREATE_DRAFT_KEYS` | draft.js:67-84, 95-101, 497, 510-524, 531-547 |
| `domain/id.js` | `freshId()` for recipeId, versionId, row ids, scale key ids | id.js:6 |
| `domain/versionRow.js` | `rowFromLibraryRecord(record, { id, grams, step = 1, ingredientName })` | versionRow.js:34-79 |
| `domain/lineage.js` | `parseGramsDraft` (`/^\d+(\.\d{1,2})?$/`) | lineage.js:201, 212 |
| `domain/catalog.js` | `SCALE_KINDS`, `MAX_RECIPE_SCALES`, `MAX_RECIPE_PROBLEMS`, `mintScaleKey` | catalog.js:18, 22-23, 74 |
| `domain/recipe.js` | `recipeNameMessage`, `RECIPE_NAME_REQUIRED` | recipe.js:5, 13 |
| `domain/ingredientSearch.js` | `filterLibrary(records, query, category)`, `libraryCategories(records)` | ingredientSearch.js:25, 36 |
| `ui/useKeptDraft.js` | `useDraftWriter`, `useKeptDraft`, `DRAFT_KEPT_STATUS` | useKeptDraft.js:19, 75, 11 |
| `ui/countWords.js` | `ingredientCountWords(shown, total, filtered)` | countWords.js |
| `ui/FieldFeedback.jsx`, `FoldRow`, `Segmented`, `Button`, `Radio` | field messages, folds, joined group, controls | see Code Map |

## Architecture Patterns

### System Architecture Diagram

```
Notebook place (/notebook)                       Shell (always mounted)
  New recipe -> entry form (name)                  importGuardRef (sync)  <- registered by pen pages
   Start: validate name (recipeNameMessage)        creationKeptRef (NEW, sync) <- boot read + Start/Cancel reports
     freshId x2 -> blankCreateDraft -> buildDraftRecord(kind 'create')
     await repository.saveDraft -> navigate('/notebook/new')
  draft row (listDrafts + draftMatchesCreate + newestDraft) -> Resume -> navigate('/notebook/new')
                                                    |
/notebook/new  -> CreationRoute (wrapper)           v
   repository.listDrafts() -> newest fitting 'create' record
        none -> navigate('/notebook', {replace:true})          (D-02, silent)
        found -> <CreationPage key={versionId} recipeId versionId initial={record.payload}/>
                                                    |
CreationPage (all hooks above any early return)
  useDraftWriter(versionId) ; useState(createDraft) ; library = repository.listLibrary() ; useCatalog()
  useKeptDraft({creating:true, createDraft, onRestoreCreate -> setCreateDraft, mode:'creating', ...})
     restore (once, StrictMode-safe) / persist (250 ms, now ALWAYS writes while creating) / flush on unmount
  live = buildLiveVersion(createDraft, libraryById, catalog)   [domain/creation.js, pure, useMemo]
  view = sheetView({version: live, baseline: null, mode: 'creating', penDraft: null, parentVersion: null,
                    showingChanges: false, batches: [], batchId: undefined})
  <div className="notebook mk-page">
     <header.notebook-band>  Recipe name + description (RecipeBand's open form)  | form.notebook-ceremony (Version name, Cancel)
     <div.notebook-body>
        <div.notebook-body__sheet> <RecipeSheet creating ...> (headnote, Before you start, table, picker/Add, Balance, Watch for)
        <aside.notebook-log aria-label="Setup"> Style | Scales | Problems
  Cancel -> discard draft (await delete) -> navigate('/notebook', {state: 'Draft discarded'}) -> Notebook shows no draft row
```

### Recommended Project Structure (new and changed files)

```
app/src/
├── domain/creation.js (+ .test.js)   NEW pure: liveVersion, parseBand, applyStyle, clearStyle, scale/problem ops, row ops, nameTaken
├── domain/recipe.js                  + same-name sentence/predicate (strings live here with RECIPE_NAME_REQUIRED)
├── ui/CreationRoute.jsx              NEW wrapper for /notebook/new (finds the draft, redirects, mounts the page)
├── ui/CreationPage.jsx               NEW the editor page (band, RecipeSheet, log column) — NOT inside RecipePage.jsx
├── ui/IngredientPicker.jsx           NEW picker (reuses filterLibrary/libraryCategories; exported summaryText/capitalised)
├── ui/CreationSetup.jsx (or three)   NEW Style / Scales / Problems regions of the log column
├── ui/RecipeSheet.jsx                + creating props (see Pins: imports must stay react or ./)
├── ui/{Headnote,Authored,FormulationNote,IngredientTable,Segmented}.jsx   additive creating branches / props
├── ui/NotebookPlace.jsx              + head, New recipe entry, Start, draft row, Resume, listDrafts
├── ui/Shell.jsx                      + creation-kept ref + context; refusal path
├── ui/useKeptDraft.js                creating persist branch always writes (D-04a)
├── router.jsx                        + { path: '/notebook/new', … } before '/notebook/:recipeId'
├── styles/notebook.css               + .notebook .mk-*, .pick*, band rules (rescoped)
└── styles/shell.css                  + .place .nb__head/.nb__new/.nb__draft* rules inside existing @media blocks
.planning/phases/10-…/                10-walk.mjs, 10-walk-record-base.sh, 10-walk-check.sh (strict), plans
```

### Pattern 1: Hook-order law and one-draft-per-page-instance
Every hook above every early return, in the order `useDraftWriter` → state → library/catalog reads → `useKeptDraft`; the page `return null` (library not yet loaded, restore not done) comes after them. The wrapper must mount the page with `key={versionId}` because `useDraftWriter(versionId)` and `useKeptDraft` read `versionId` from the first render only [VERIFIED: useKeptDraft.js:19-53, 133-189; `repository.getDraft(versionId)` at line 139].

### Pattern 2: A synthetic version, not a new view function
`sheetView` accepts `{ version, baseline, mode, penDraft, parentVersion, showingChanges, batches, batchId }` (sheetView.js:34). For `mode: 'creating'` every `'developing'`/`'recording'` branch is skipped, so `liveVersion = readingVersion = { ...version, rows: activeRows(version), method: activeSteps(version) }` (lines 39, 55-58) and `figures = buildFigures(liveVersion)` (line 60). Provide a version-like object:

```js
// Source: shape read from RecipeSheet.jsx:86-87 (version.method, version.authored.beforeYouStart, version.rows),
// figures.js:144 (version.targets), advisories.js:180-186 (version.method/equipment/process/targets), Headnote.jsx (sheetTitle, sheetDescription)
{
  id: draft.versionId, recipeId: draft.recipeId,
  sheetTitle: draft.name.trim() === '' ? 'Untitled' : draft.name, sheetDescription: draft.description,
  rows,                    // rowFromLibraryRecord(entry, { id: row.id, grams: parseGramsDraft(raw) ?? 0, step: portion.step })
  method: [],              // Phase 10 writes no steps
  authored: { beforeYouStart: draft.beforeYouStart },   // notes are {text}; NoteList reads note.text / note.inheritedFrom
  targets,                 // only bands whose two ends parse as finite, non-negative, low <= high (D-08b), as numbers
}
```
No `equipment`/`process` key: `subScaleAdvisory` and `hydrationAdvisory` return null for an absent block [VERIFIED: advisories.js:49, 124], so "Watch for" shows only the ultra-pasteurised and estimated-exposure advisories.

### Pattern 3: Restore seeds from the wrapper, and fresh Start must not announce "Draft kept"
The wrapper already holds the record `listDrafts` returned, so `useState(createDraft)` can start from `record.payload` and show no blank flash. `useKeptDraft` still does its own `getDraft` read and calls `onRestoreCreate` and `onPageStatus(DRAFT_KEPT_STATUS)` unconditionally [VERIFIED: useKeptDraft.js:175-185]. DRAFT_KEPT_STATUS is `'Draft kept. Cancel discards it.'` (line 11): right for Resume, wrong right after Start. The page decides what to pass as `onPageStatus` (e.g. ignore it when the route state says "just started"); `useKeptDraft.js` is not to be changed for this (its exact counts are pinned).

### Anti-Patterns to Avoid
- **Building the editor inside `RecipePage.jsx`.** That file's pins forbid new module-level functions and the shell's draft setters (RecipePage.shell.test.js:458-492, 343-353); it also calls `useKeptDraft(` exactly once.
- **Rebuilding `createDraft` during render.** The late-read rule compares object identity (`createDraftRef.current !== createDraftAtRead`, useKeptDraft.js:158); state only, a new object per change, the same object across renders.
- **Making `Shell.chooseImportFile` async.** It calls `fileInputRef.current?.click()` inside the click handler (Shell.jsx:332-338). Reading IndexedDB first would defer that click out of the user gesture; keep the decision a ref read (see Assumption A3).
- **A second `<IngredientTable`/`<FormulationNote`/`<Method` in RecipeSheet.** Each is pinned to exactly one.
- **Naming a new component `RecipePage…`** or putting `<Link` in `router.jsx` (router pins, below).

## Code Map: each decision and what the plan touches or leaves alone

Line numbers are from this session's reads. "Touch" = the plan edits it; "Leave" = pinned or settled.

| Decision | Current code (file:lines) | Touch / leave |
|----------|--------------------------|---------------|
| **D-01** route + wrapper | Route table router.jsx:110-133; `'/notebook/:recipeId'` at line 115 is `NotebookLatestRedirect`. Draft store keyed by `versionId` (db.js:61-62 `createObjectStore('drafts', { keyPath: 'versionId' })`); `listDrafts` repository.js:322-325. `notebookPaths.js` is "the one place every Notebook address is built" (header comment lines 1-5). | Touch: add `{ path: '/notebook/new', Component: <wrapper> }` before line 115; add a `newRecipePath` constant/function to `notebookPaths.js` (+ test in `notebookPaths.test.js`). Leave: the three exact route-object regexes at RecipePage.test.jsx:961-993 (`{ path: '/notebook/:recipeId/:versionId', Component: RecipePageForRoute }` etc.) and notebookPaths.test.js:86-… (`/notebook/:recipeId` → `NotebookLatestRedirect`). Wrapper: `listDrafts()` → filter `draftMatchesCreate` → `newestDraft` (two tabs could leave two). Mount `<CreationPage key={versionId}>`. |
| **D-02** silent redirect | `NotebookLatestRedirect` NotebookRedirects.jsx:50-72: `useEffect` → promise → `navigate(path, { replace: true })`, with a local `cancelled` flag. | Touch: new component in same style (the no-`cancelled` pin applies only to `useKeptDraft.js`, RecipePage.shell.test.js:619-624). Reuse the pattern, not the outcomes. |
| **D-03** Cancel + "Draft discarded" | `discardDraft()` useKeptDraft.js:44-50 clears timer/pending/`draftStoredRef` and fires `Promise.resolve().then(() => repository.deleteDraft(versionId)).catch(() => {})`; it returns nothing. Route-state-consumed-once pattern: useRouteIntents.js (`navigate({ pathname, search }, { replace: true, state: null })`). | Touch: Cancel handler = `discardDraft()` then navigate to `/notebook` with route state; Notebook consumes the state once and shows the page-scoped notice. Leave: `function discardDraft(` count is pinned to 1 (RecipePage.shell.test.js:252). See Pitfall 6 (the delete is not awaited). |
| **D-04** Start | `freshId()` id.js:6; `blankCreateDraft({recipeId, versionId, name})` draft.js:531; `buildDraftRecord({versionId, kind, payload, now})` draft.js:67-84 (payload is `structuredClone`d); `repository.saveDraft` repository.js:314-317; `recipeNameMessage` recipe.js:13 returns `'Enter a recipe name.'` (recipe.js:5). | Touch: NotebookPlace Start handler (in `ui/`, so the `kind: 'create'` count of 1 in useKeptDraft.js is unaffected). Await the write, then navigate. Prefer a pure `startCreation({name, ids, now})` → record in `domain/creation.js` for node tests. |
| **D-04a** always keep | Persist branch useKeptDraft.js:199-206 writes only `if (isCreateDraftDirty(createDraft))`; the no-record branch 227-236 deletes when `draftStoredRef.current`. `isCreateDraftDirty` draft.js:564-575. `import { … isCreateDraftDirty } from '../domain/draft.js'` is line 3. | Touch: in the `creating` branch always build the record (drop the `if`). That makes the `!record` branch unreachable for creating, keeps `buildDraftRecord(` at 3 and `deleteDraft(versionId)` at 3 (lines 49, 146, 233). **Remove `isCreateDraftDirty` from the line-3 import**: `unusedImports` runs on useKeptDraft.js (RecipePage.shell.test.js:83-92, 474-492 via NEW_MODULES). `isCreateDraftDirty` stays exported and tested in domain (draft.test.js:728-738 unchanged); it becomes unused app code, mention it, do not delete. Tests that change: useKeptDraft.test.jsx:494-508 and 564-587. |
| **D-05** flat table | `groupPortionsByStep` IngredientTable.jsx:36-84; `showStepHeads = !(groups.length === 1 && groups[0].kind === 'unallocated')` line 561; `displayNumbers([])` → empty Map, `displayNumberOf(map, 1)` → `null` (stepNumbers.js:27-47). | Leave as is: flatness is automatic when the version's `method` is `[]` and portions carry `step: 1`. Only add a regression test. |
| **D-06** no Sheet code | `RecipeSheet.jsx` contains no `sheetCode` (grep empty); the code is on the version row (VersionRow). | Nothing to build. |
| **D-07** live Balance from the library | `repository.listLibrary()` as IngredientsPlace.jsx:117-131; records are `{ id, entry }`; `rowFromLibraryRecord` throws on bad id/grams/entry (versionRow.js:34-70); `CatalogContext` holds `{scales, problems, machines, styles}` only (CatalogContext.jsx:5-10). Draft row = `{id, libraryId, portions:[{step, grams:string}]}`, exact keys (draft.js:412-427). | Touch: load the library once in the page, share it between picker and projection (a `Map` by id). Leave: `CREATE_DRAFT_KEYS` (draft.test.js pin). Guard the projection: a draft row whose `libraryId` is not in the map must not throw during render (Pitfall 7). |
| **D-08** grams | `parseGramsDraft` lineage.js:212; pen sentences `${row.ingredientName} needs an amount, or remove it` and `${row.ingredientName}'s amount is not a number` (lineage.js, `findBlockedRow`); single id `BLOCKED_ROW_ERROR_ID = 'ingredient-field-error'` IngredientTable.jsx:14; `FieldFeedback({error, errorId, required})` FieldFeedback.jsx:4; `.is-marked` row class IngredientTable.jsx (`className={isMarked || isBlocked ? 'is-marked' : undefined}`). | Touch: per-row message state (a map keyed by row id, shown on blur), per-row `errorId`. Do not reuse `blockedRowId`/`ingredient-field-error` (single-row design). Projection: `parseGramsDraft(raw) ?? 0`. |
| **D-08a** Balance visibility | `computeBalance` returns `null` for zero mass (`if (mass === 0) return null;` composition.js:24) so `buildFigures` returns `[]` and `FormulationNote` returns null (FormulationNote.jsx:10). The side region is unconditional (RecipeSheet.jsx:197-230). | Touch: `{(!creating \|\| view.figures.length > 0) && <div className="side-region">…}`. Leave: RecipeSheet.test.jsx:68 (empty reading Sheet still has `formulation-note-region`) holds because the condition is `creating` only. Verified: one 0 g row gives 0 figures; a 250 g row gives 6 (node probe). |
| **D-08b** bands | `buildFigures` takes `band` only when `hasOwnProperty.call(targets, spec.targetKey)` (figures.js:155) and `describeDeviation(value, null)` → `words: 'no target set'` (figures.js:104-107). `CREATE_BAND_KEYS = ['pac','pod','fat','msnf','sugar','solids']` (draft.js:391). Style rows: `id: 'philadelphia'`, `name: 'Philadelphia'` (data/styles.js:20-21), bands `{ pod: [14, 18], fat: [10, 18], msnf: [8, 12], solids: [36, 42] }` (line 23). | Touch: `parseBand(low, high)` pure; `parseGramsDraft` accepts up to 2 decimals and rejects '-', '1.234', '1e3', ' 5' (probe) – decide whether bands use it or a looser parser (Open Question 5). Draft `style` holds the row id. Picking a style: `targets = Object.fromEntries(entries.map(([k,[lo,hi]]) => [k, [String(lo), String(hi)]]))`, `serveTempC = String(style.serveTempC.default)`; keys absent from the style are removed (replace all six). |
| **D-08c** same name, Untitled | `NotebookPlace` already reads `recipes` (NotebookPlace.jsx:22-24). No "Untitled" string exists yet (grep). | Touch: pure `recipeNameTaken(recipes, name)` (trim, case-insensitive); the warning only in the Notebook entry; editor field has none. "Untitled" in: Sheet heading, `document.title`, draft row. |
| **D-09 / D-09a** leaving, no beforeunload | Unmount flush: useKeptDraft.js:250-261 (`pagehide`, `visibilitychange`, cleanup `flushPendingDraft()`). Pin: RecipePage.drafts.test.jsx:423-429 "registers no beforeunload handler anywhere while a pen holds ink". | Leave both. Nothing disables while creating. |
| **D-10 / D-10a** import refusal | `importGuardRef` Shell.jsx:197; `guardImport` 322-327; `chooseImportFile` 332-338; `ImportGuardContext` 36; `IMPORT_BLOCKED_STATUS = 'Close the open pen before importing.'` (24); Outlet wrapped at 500-502. Registration pattern in router.jsx:66-69 (`penOpen` effect → `guardImport(announcePageStatus)`). | Touch: Shell gains a creation-kept ref set at boot and updated on Start/Cancel; refusal calls a notice function. See Pitfalls 3, 4 and Open Question 1. Leave: Shell.importGuard.test.jsx:170-177 pattern (`notice()` reads the FIRST `.page-status`). |
| **D-11** strict walk | See "Walk harness" section. | New files only. |
| **D-12 / D-13** device and 393 checks | `09-places-check.mjs` is the precedent (WebKit, `hasTouch: true`, library store rewritten to the original 26 for board-matching, `--evidence` PNG pairs). | New check script modelled on it; picker side-by-side must run with the 26-entry library (the boards say "of 26"; the build has 111). |
| **Fixed**: scales, problems | `fitsCreateScale` requires exactly `['key','name','low','high','kind','group']`, `group === 'declared'`, `kind` `''` or in `SCALE_KINDS` (draft.js:445-451). `mintScaleKey(id)` → `'scale-' + id` (catalog.js:74-77). `MAX_RECIPE_SCALES = 2`, `MAX_RECIPE_PROBLEMS = 2` (catalog.js:22-23). | Touch: new scale = `{ key: mintScaleKey(freshId()), name: '', low: '', high: '', kind: '', group: 'declared' }`, minted in the click handler, never in render. |

## Pins: what each existing test would reject (route every new rule past these)

### Source-text pins on JS/JSX

| Test (file:lines) | What it enforces | Consequence for this phase |
|------|------------------|----------------------------|
| RecipePage.shell.test.js:142-330 (`JOBS`) via `jobProblems` (108-139) | For `RecipeSheet` (198-224): markers `<article className={sheetClassName}` ×1, `<IngredientTable` ×1, `<Method` ×1, `<FormulationNote` ×1, `useSheetTwoColumns()` ×1, `markedFigure(view, focusedFigureKey)` ×1, `{foot}` ×1; **allow-list `['react', './']`** (every `from '…'` specifier in RecipeSheet.jsx must be `react` or start with `./`). | RecipeSheet may not import `../domain/…` or `../store/…`. All creating logic reaches it as props or through `./` ui siblings. Pass the same single `<IngredientTable>` a `creating` prop. |
| same file, `useKeptDraft` entry 257-293 | Exact counts in useKeptDraft.js: `repository.getDraft(versionId)` 1, `repository.saveDraft(record)` 1, `repository.deleteDraft(versionId)` 3, `draftMatchesVersion(` 1, `buildDraftRecord(` 3, `draftMatchesCreate(record)` 1, `onRestoreCreate(record.payload)` 1, `kind: 'create'` 1, `setTimeout(flushPendingDraft, 250)` 1, `if (draftRestoreStartedRef.current) return;` 1, `draftRestoreStartedRef.current = true` 1, `onPageStatus(DRAFT_KEPT_STATUS)` 1, `window.addEventListener('pagehide', flushPendingDraft)` 1; `shellLacks` for RecipePage.jsx: `.getDraft(`, `.saveDraft(`, `.deleteDraft(`, `draftMatchesCreate(`, `onRestoreCreate` …; allow-list `['react','../store/repository.js','../domain/','./notebookPaths.js']`. | The D-04a widening is a condition change on the existing branch, not a new call. No new import in useKeptDraft.js outside the allow-list. A `useCreation` hook beside it is a different file and unconstrained. |
| same file 343-353, 489-492 | NEW_MODULES (incl. RecipeSheet.jsx, useKeptDraft.js, sheetView.js …) must not contain whole words `setPenDraft`, `setDraft`, `setBlockedMessage`, `setBlockedTarget`, `setBlockedDateMessage`, `setFieldErrors`, `setInvalidFieldTarget`, `setBlockedDateAttempt`, `setPendingUndo`, `setAmendingBatchId`, `setAmendBaseline`, `setAmendOpener`; no `dangerouslySetInnerHTML`. | Name the creation setter `setCreateDraft` (not `setDraft`). Fine in new files; avoid these words in RecipeSheet/useKeptDraft. |
| same file 619-624 | `useKeptDraft.js` has no identifier matching `/\bcancell?ed\b/` after comments are stripped. | Do not add `cancelled`/`canceled` there. |
| same file 458-492, 389-413 | RecipePage.jsx declares only `PageLoadFailed`, `RecipeNotFound`, `RecipePage`; calls each hook once above `if (loadFailed) return`. | Leave RecipePage.jsx untouched. |
| RecipePage.test.jsx:1159-1192 | RecipeSheet.jsx text (comments stripped) contains `showsMethodRegion({ mode, steps: methodSteps })`, `{methodRegionShown && (` + `<section className="method-region"`, `{beforeRegionShown && (` + `<section className="before-region" aria-label="Before you start"`, before-region before ingredient-table-region, `steps={methodSteps}`, no `beforeYouStart={`, and the exact string `'recipe-page' + (beforeRegionShown ? '' : ' recipe-page--no-before') + (methodRegionShown ? '' : ' recipe-page--no-method')`. | Change only the definition `beforeRegionShown = mode === 'developing' \|\| mode === 'creating' \|\| beforeNotes.length > 0` (RecipeSheet.jsx:88). In creating `showsMethodRegion` is false (`mode === 'developing' \|\| steps.length > 0`, Method.jsx:519-521) so the Sheet carries `recipe-page--no-method`, as the board does. |
| RecipeSheet.test.jsx:103-112 | Exactly one `<IngredientsHead` tag containing `onToggleShowChanges={onToggleShowChanges}`. | Leave. |
| RecipePage.test.jsx:926-954 | Reads router.jsx text: no `className="running-head"`, no `<Link\b[^>]*>`; `indexOf('className="page-status-anchor"') < indexOf('<PageStatus') < indexOf('<RecipePage')`; `/<RecipePage\s+key=/`. | Add nothing to router.jsx that puts `page-status-anchor`, `<PageStatus` or `<RecipePage…` earlier in the text than the existing ones, and no `<Link`. Put new wrappers in their own module and only the `{ path, Component }` object in router.jsx. `PageStatus` is *defined and exported* in router.jsx (line 87); a module imported by router.jsx cannot import it back (circular). |
| RecipePage.test.jsx:961-993 | Route objects for `/notebook/:recipeId/:versionId`, `…/batch/:batchId`, `/recipe/:id` and `/recipe/:id/batch/:batchId` match exact regexes; `key={`${recipeId}::${versionId}::${batchId ?? ''}`}`. | Do not reformat those lines. |
| tabindex-scan.test.js (read lines 1-140) | Every `<a`, `<Link`, `<NavLink`, `<button`, and radio/checkbox `<input type=…>` in non-test `.jsx` carries `tabIndex={0}`; raw `<button`/radio/checkbox only in `Button.jsx`, `Checkbox.jsx`, `Radio.jsx` (one allow-listed exception in GraduatedRule.jsx). `select`, text/number inputs and `textarea` are not scanned. | Use `<Button>`/`<Radio>`; give `<select>` `tabIndex={0}` by hand; a Resume that navigates is a `Button` + `useNavigate` (or a `Link` with `tabIndex={0}`). |
| seed-data-scan.test.js:105-131 | No non-data module holds a bracketed array literal containing all four core problem words or all six scale names; no import of `app/src/data` outside `store/seed.js`, `ui/catalog.fixtures.jsx`, `store/storeFile.fixtures.js`. | The "Every recipe" cues come from `useCatalog()` (`catalog.scales.filter(group === 'core').map(name).join(', ')`, `catalog.problems.map(name).join(' · ')`). Never import `data/styles.js`; read `catalog.styles`. |
| tokens.test.js:82-136 | Every `var(--x)` in any CSS or ui/domain JS resolves to a declared token; nothing declared and unread beyond a fixed list. | Board rules resolve (verified). Do not declare tokens. |
| NotebookPlace.test.jsx:95-98, 191-207 | "offers nothing to start" and the store stub (`getAll`, `getAllBatches`, `listRecipes` only). | Replace the first (T-03); add `listDrafts` to the stub, or wrap the new read so a missing method does not throw synchronously (the existing test sets only three methods, line 192-194 pattern). |
| Shell.test.jsx:15 and Shell.flyout.test.jsx:17 | `vi.mock('../store/repository.js', () => ({ repository: {} }))`. | Any `repository.listDrafts()` the Shell adds is a TypeError inside an effect unless wrapped as `Promise.resolve().then(() => repository.listDrafts()).catch(() => {})` (the codebase's own pattern, e.g. useKeptDraft.js:38). |
| Shell.test.jsx:202-231 | `Shell.jsx` source keeps `useLocation`, `useEffect` imports, `<details className="shell__more"` with `open={` and `onToggle={`, an effect ending `}, [pathname]);`, `<ul onClick={closeMore}>`. | Add effects/refs without disturbing those. |

### CSS-contract pins

| Test | Enforces | Consequence |
|------|----------|-------------|
| notebook.test.js:36-41 | every selector in notebook.css starts with `.notebook` | Every new rule: `.notebook .pick…`, `.notebook .mk-…`. (`.notebook-action` etc. already start with `.notebook` and are global classes, which is why Resume/Start/Cancel can reuse them on the Notebook place.) |
| notebook.test.js:43-53 | the `@media` conditions, in file order, are exactly `(min-width: 1366px)`, `(max-width: 1365.98px)`, `(max-width: 723.98px)`, `(pointer: coarse)`, `(max-width: 723.98px) and (pointer: coarse)`, `(forced-colors: active)` | The board's `@media (max-width:759.98px)` for `.mk-page` has no home; use `723.98px` (Open Question 6 notes the 724-759 gap the boards do not draw). Coarse rules (`.mk-add`, `.pick__head .text-control`, `.mk-band .ink-field` at `min-height: var(--touch-min)`) go in the existing `(pointer: coarse)` block. |
| notebook.test.js (no bare px, no hex) | `:\s*-?\d+(?:\.\d+)?px` and hex forbidden | Board rules already comply. |
| shell.test.js:69-83 | every shell.css selector starts `.shell`/`.place` (+ two named exceptions) | Notebook entry/draft rules: `.place .nb__head`, `.place .nb__new`, `.place .nb__draft` … |
| shell.test.js:100-110 and 141-152 | exactly five `@media` blocks (141-152); the places' conditions `(max-width: 1099.98px)`, `(max-width: 759.98px)`, `(pointer: coarse)` carry only `.place …` rules **that name an `nb__` or `ing__` class** | The board's `.nb__draft` phone rule (`@media (max-width:759.98px)`) belongs inside the existing `759.98px` places block as `.place .nb__draft`, `.place .nb__draft-act`. No new block. |
| shell.test.js:410-436 | the ten selectors allowed to declare `border-radius` | New shell.css rules declare none (the draft rail uses the existing `.place .nb__rail`). |
| shell.test.js:279-296 | `.shell`, `.shell__body`, `.shell__main` declare no transform/filter/perspective/will-change/contain/overflow | A Shell-level `.page-status-anchor` must not alter those. |
| binder.test.js:308-315 | in app.css, only `.text-control` and `a` declare `text-decoration: underline` | `.pick__act`'s underline goes in notebook.css (`.notebook .pick__act`), not app.css. |
| cross-cutting.test.js:101-137 | app.css `(pointer: coarse)` rule list and `.text-control` shape | Do not add to app.css's coarse union. |
| cross-cutting.test.js:863-900 | `.page-status` absolute, `.page-status-anchor` `position: relative`, `.page-status:empty` collapses | Reuse both classes; do not restyle. |
| print.test.js:196-284 | no non-print `@media` selector in app/notebook/shell/home.css may require a class a printed page renders (`region-name`, `pen-caption`, `headnote`, `target-chip`, `ps-*` …) when every required class is also rendered on the print route | New media selectors should require a `.notebook-log`/`.mk-*`/`.pick*` class, which no page renders. Run print.test.js after the CSS lands. |

## Sketch 013: what the build must reproduce

Authority: the five boards, CSS included; conformance is side by side in WebKit, not prose. Panels are inlined `.pc1366` / `.pc393` copies of the app's own CSS with the new rules from `.planning/canvas-generators/p10.py` (P10_CSS, lines 25-92 of that file; COARSE_P10 right after) [VERIFIED: read]. Measured numbers are Playwright WebKit with a coarse pointer, 2026-10-18; the iPad and iPhone are **not verified** (README "Not verified"); the browser's own select list is not drawn or measured.

**Board 1, `notebook-new-recipe.html` (10 panels; the last, "Option B · several drafts", is not a target).**
- Markup: `div.nb__head` > `h1.place__title` + `button.notebook-action` "New recipe"; the entry `form.nb__new[aria-label="New recipe"]` > `label.notebook-field` (caption `.notebook-caption` "Name", `input.ink-field` `autocomplete="off"`, `aria-describedby` the `span.field-error`) + `div.nb__new-actions` (Cancel `notebook-action--outline`, then Start `notebook-action`); draft list `ul.nb__drafts` > `li.nb__draft` (`span.nb__rail`, `h2.nb__name` no link, `p.nb__meta` > `span` "draft", `span.nb__draft-act` > Resume `notebook-action--outline`); then `p.nb__count`. The draft list sits above the count and is not counted.
- Words: New recipe, Name, Cancel, Start, draft, Resume, "Another recipe already has this name. You can still use it.", "Enter a recipe name.".
- Classes reused from the app: `place nb`, `place__title`, `nb__count/list/row/rail/name/meta`, `notebook-field`, `notebook-caption`, `ink-field`, `field-error`, `notebook-action`, `notebook-action--outline`. New: `nb__head`, `nb__new`, `nb__new-actions`, `nb__draft`, `nb__draft-act`, `nb__drafts` (rules in shell.css under `.place`).
- Measures: Resume 96×44, Start 75.7, name field 598.9×44, the 393 draft row stacks Resume below (the 759.98 rule).

**Board 2, `creation-editor.html` (4 panels, 1366 only).**
- Page: `div.notebook.mk-page` > `header.notebook-band` > `div.notebook-band__grid` > `section.notebook-recipe[aria-label=Recipe]` > `div.notebook-recipe__form` (`label.notebook-field` "Recipe name" `input.ink-field`, aria-label "Recipe name"; "Recipe description" `textarea.prose-field rows=3`) and `form.notebook-ceremony[aria-label="New recipe"]` (caption "New recipe · draft"; `label.notebook-field` "Version name" `input.ink-field required` + `span.field-requirement` "Required"; `div.notebook-ceremony__actions` > Cancel `notebook-action--outline`). No Save.
- Sheet: `article.recipe-page.recipe-page--no-method` > `div.recipe-band > header.headnote > h1` (+ `p.headnote__prose` only if a description exists) ; `section.before-region` (h2 "Before you start", `ul.authored__notes` of `span.authored__note-field` > `textarea.prose-field rows=2 aria-label="beforeYouStart note N"` + `button.text-control` "remove"; then `p.mk-add-row > button.text-control.mk-add` "Add note"); `section.ingredient-table-region` (h2; `table.ingredient-table.is-developing`, one `tbody`, rows with `td.ingredient-table__col-grams` > `span.ingredient-table__plan-grams` > `input.ink-field[inputmode=decimal]` + " g", `td.ingredient-table__col-name` name + optional `span.target-chip.ingredient-table__flag` + `span.ingredient-table__remove-gap` + `button.text-control` "remove", `td.ingredient-table__col-numeric` share; `tfoot` Total with empty share cell; then "Add ingredient" `mk-add-row`); `div.side-region` Balance/Watch for. Arrival panel: no table, the existing sentence "This version has no ingredient rows.", Add ingredient, no Balance.
- Log column: `aside.notebook-log[aria-label=Setup]` of three `section.batch-row.mk-region[aria-label]` (head `div.batch-row__head` > `div.batch-row__head-lead > h2.region-name`; Clear in `div.batch-row__head-acts > button.text-control[aria-label="Clear Style"]` only while a style is picked; body `div.mk-body`).
- Remove panels: Milk solids 9.2% to 6.6%, 1.4% below the 8% edge.
- Measures: editor pages 1249 (arrival) and 1825 (worked); remove panels 1528; Recipe name field 598.9×44; Add note 54.7, Add ingredient 88.8, Cancel 88.3; remove 44.7 to 88.8.

**Board 3, `ingredient-picker.html` (8 panels, 1366 and 393).**
- `div.pick[role=group][aria-label="Add ingredient"]` replaces the Add control under the table: `div.pick__head` (`span.pen-caption` "Add ingredient" + `button.text-control` "Cancel"); the Ingredients place's own filters (`form.ing__filters` with Name and Category select, All first); `div.ing__status` > `p.ing__count[role=status][aria-live=polite]` ("N ingredients" / "N of M ingredients") + `button.notebook-link.ing__clear` "Clear filters" while filtered; `ul.pick__list` of `li > button.pick__row` (`span.pick__name`, `span.pick__sum` "Category · summary", `span.pick__act` "Add" / "Added" with `aria-disabled` and class `pick__row--added`); none: `p.pick__none[role=status]` "Not in the library yet" with count "0 of N ingredients".
- After picking: picker closes; row appended last at 0 g, empty grams field focused (`.mk-focus` = `outline: var(--focus-outline-width) solid var(--sheet-ink); outline-offset: var(--focus-outline-offset)`).
- Measures: open picker 528×508 at 1366 (list 265 tall, six 44 px rows at 48 px pitch, scrolls inside), 528×528 with a name typed; rows A to Z by lowercased name then id.
- **Board ≠ build:** the boards use a 26-entry stand-in ("5 of 26"); the build seeds **111** entries [VERIFIED: node count, 26 in `library.js` + 85 in `librarySeedDb` = 111, 11 categories]. The picker's side-by-side check needs the original-26 mode that `09-places-check.mjs` already implements (it rewrites the library store).

**Board 4, `style-menu-and-bands.html` (16 panels, 1366 only).**
- Style region: `select.ink-field.mk-menu[aria-label=Style]` inside `div.mk-menu-wrap` (first option "No style" value `""`, then the style names); the open list `ul.mk-list` is a stand-in: **build nothing for it**. `label.notebook-field` "Serving temperature" > `span.mk-field-row` > `input.ink-field[type=number][step=any][aria-label="Serving temperature, degrees Celsius"]` + `span.mk-unit` "°C". Caption "Targets" (`span.notebook-caption`) then six `div.mk-band` rows (`span.mk-band__label` word + `<small>· TERM</small>`, `span.mk-band__ends` of two `input.ink-field[inputmode=decimal]` with aria-labels "<Label>, target low" / "target high", an en dash `span.mk-band__unit[aria-hidden]`, unit `%` for Fat, Milk solids, Sugar, Solids). Rows in order: Freezing · PAC, Sweetness · POD, Fat, Milk solids · MSNF, Sugar, Solids.
- Behaviour from CONTRACT section 4: picking replaces all six bands and the temperature; editing leaves the style picked; Clear = No style = bands stay, temperature emptied; Gelato -12.5 must fit (hence the 1.5× number field rule).
- Measures: menu 350×44; band fields 56×44 (temperature field 84×44); band row 350×45.

**Board 5, `scales-and-problems.html` (8 panels).**
- Scales: `p.pen-caption.mk-cue` "Every recipe" + `p.mk-core` (catalog-derived), "This recipe only" cue only once a scale exists, `div.mk-card` per scale (`div.mk-card__head`: `span.notebook-caption` "Scale n" + `button.text-control` "remove"; `label.notebook-field` Name; `div.mk-pair` Low end / High end; the joined Kind group; `p.mk-stops` "lo · leaning lo · right · leaning hi · hi" for Right in the middle, "lo to hi" for Low to high, only when both ends and the kind are set); `Add scale` gone at two. Problems: "Problem n", Name; `Add problem` gone at two. Just added: `span.field-requirement` "Required" under each empty Name/Low/High; Kind has no cell filled.
- Words: Scales, Problems, Every recipe, This recipe only, Scale 1/2, Problem 1/2, Name, Low end, High end, Kind, Right in the middle, Low to high, Add scale, Add problem, remove, Required.

**Existing roles the build reuses (not invented):** `ink-field`, `prose-field`, `text-control`, `segmented`/`segmented-field`/`segmented__option` (Segmented.jsx), `notebook-field`/`notebook-caption`/`notebook-action(--outline)`/`notebook-link`, `field-error`/`field-requirement` (FieldFeedback.jsx:7, 14), `batch-row__head*`, `region-name`, `pen-caption`, `ing__*` filter classes (see Pitfall 5), `nb__*` row classes, `fold-row` (FoldRow).

**README "Measured" and "Not verified":** all numbers are WebKit/Playwright/coarse on the dev machine; nothing on the iPad or iPhone; no sideways overflow on any panel; the select list is the browser's own and was not drawn.

## Walk harness (D-11): how to re-record a base and compare strictly

Files: `.planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-walk.mjs` (1544 lines), `09-walk-record-base.sh`, `09-walk-check.sh` [VERIFIED: read].

- **Recorder.** `node 09-walk.mjs record <out.json>` drives the BUILT app (`PROBE_DIST`, default `app/dist`) in Playwright WebKit 1366 wide, fixed clock `FIXED_ISO = '2026-10-14T12:00:00.000Z'`, counted `crypto.randomUUID`, third-party requests aborted; 12 scenarios (`SCENARIOS.push` ×12), 94 snapshots ("MATCH 94 snapshots"). `snapshot()` records URL, **`pageStatus: status('.page-status')` (the first `.page-status` in the document)**, `.form-status` texts, invalid fields, focus, pens, field values, buttons and a hash of `.notebook` innerText; `dumpStores()` dumps versions, batches, recipes, drafts (09-walk.mjs:137-228).
- **Base script.** `09-walk-record-base.sh` builds a detached `git worktree` of `BASE` into `$TMPDIR/sprinkles-09/dist-base` (symlinks `app/node_modules`), then records to `09-walk-before.json`. It refuses (exit 1, writes nothing) when a commit after BASE touches `app/` and is not `type(09-NN):` or "merge executor worktree". For Phase 10: BASE = the newest `app/`-touching commit, **`ec44fa72`** ("chore: merge executor worktree …") [VERIFIED: `git log -8 -- app/`; HEAD `e461a7a1` and the three commits above it are docs only]; the allowed-commit regex becomes `type(10):`/`type(10-NN):`; baseline file `10-walk-before.json`; scratch `sprinkles-10`. Record it **before the first `app/` change** (plan 1).
- **Why a new strict compare.** `compare()` (09-walk.mjs:1254-1264) runs `compareResult`, which lets a store difference through `ALLOWED_STORE_PATHS` (997-1096) and then asserts `REQUIRED_STORE_FIELDS` (1148+) — Phase 9's additions. A same-shape pair would still fail on any real difference (an allowed path requires `was` absent), but D-11 wants no allowance policy at all. Make `10-walk.mjs` a copy of `09-walk.mjs` (Phase 9 did the same from `08-walk.mjs`; plan 09-16 proves "walk identical outside lines 1-9 and 42" with a node diff — repeat that proof) whose `compare` runs only `diffLeaves(before, after, '', found)` (869-882) over every scenario/step, emits every leaf as `DIFF`, no `ALLOWED`/`REQUIRED` lines, and prints `MATCH <n> snapshots` only on zero diffs. Drop the `expected` and `selftest` modes or repoint `selftest` at doctored copies (change one store field and one snapshot field; both must be refused).
- **One-command check.** `10-walk-check.sh` = `09-walk-check.sh` with Phase 10 paths: `npm --prefix app run build -- --outDir "$SCRATCH/dist" --emptyOutDir`, `PROBE_DIST=… node 10-walk.mjs record "$OUT"`, `node 10-walk.mjs compare 10-walk-before.json "$OUT"`. It never writes `app/dist` (Mark's own `vite preview --host` serves it). Playwright: `playwright-core@1.63.0` at `/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs`, WebKit `webkit-2359` in `~/Library/Caches/ms-playwright` [VERIFIED: ls].
- **What the walk constrains in app code.** It opens only recipe/version routes and needs `.shell` and `.notebook`. Visible text inside `.notebook` is hashed, and `pageStatus` reads the first `.page-status`: a Shell-level `.page-status` placed before the recipe route's, or any new text on an existing recipe route, is a DIFF. Creation/Notebook surfaces are outside the walk by design (D-11).
- **Isolation habits to copy:** English-only typed values; dist to a scratch `--outDir`; the Phase 9 dist-guard idea (`09-dist-guard.sh scan`) is optional here because Phase 10 has no DB bump, but the build for the iPad check (D-12) is the one place `app/dist` is meant to be written.

## Phase 9 plan shape and proven commands

- Plan files carry front matter (`files_modified`, `estimate`, `must_haves.truths/artifacts/key_links`), `<objective>`, `<context>` with `<interfaces>`, then `<task type=…>` blocks with `<name>`, `<reversibility>`, `<files>`, `<read_first>`, `<action>`, `<verify><automated>…</automated><fails_when>…</fails_when></verify>`, `<acceptance_criteria>` with greps [VERIFIED: 09-04-PLAN.md]. SUMMARY files record `provides`, `affects`, `actuals`, `key-decisions`.
- Proven commands:
  - Whole suite: `npm --prefix app test` (about 4 s here).
  - Targeted: `npm --prefix app test -- src/ui/RecipePage.shell.test.js src/ui/useKeptDraft.test.jsx src/domain/draft.test.js`; styles: `npm --prefix app test -- src/styles`; the pin set for this phase: `npm --prefix app test -- src/ui/RecipePage src/ui/Shell src/ui/RecipeSheet.test.jsx src/ui/NotebookPlace.test.jsx src/ui/tabindex-scan.test.js src/store/seed-data-scan.test.js src/styles`.
  - Build to scratch: `npm --prefix app run build -- --outDir "${TMPDIR:-/tmp}/sprinkles-10/dist-NN" --emptyOutDir`.
  - Places measurement: `PROBE_DIST=… node .planning/phases/09-…/09-places-check.mjs --library original|current [--evidence <dir>]`.
- Executor conventions in memory: sonnet executors get absolute paths to Read rather than inlined fragments; worktree record-agent lists are whitespace-separated (comma-joined `--files` blocks cleanup-wave merge); push `main` after every wave merge because the harness forks from origin/main; the sentinel plan token must match the `gsd:dispatch` tag verbatim.

## Common Pitfalls

### Pitfall 1: Hook order and the StrictMode double restore
**What goes wrong:** a second `getDraft` read or a restore after typing overwrites ink. **Why:** React runs effects twice in dev StrictMode; `main.jsx` wraps the app in `<StrictMode>` (StrictMode's double effect run is development-only, so the built walk and preview will not show it [ASSUMED: React behaviour from training]). **Avoid:** keep `useKeptDraft`'s started-ref guard untouched; mount with `key={versionId}`; every hook above early returns; a jsdom test under `<StrictMode>` with `version: null`, `batchesLoaded: false` like `CreateHarness` (useKeptDraft.test.jsx:323-361). **Warning sign:** `getDraft` called twice, or "Draft kept" announced twice.

### Pitfall 2: `useDraftWriter`/`useKeptDraft` read `versionId` from the first render
The wrapper must find the draft first and pass its `versionId`; a page mounted with a placeholder id writes under the wrong key (useKeptDraft.js:139, 49). The draft's own `recipeId`/`versionId` come from the record, never the URL.

### Pitfall 3: `Shell.chooseImportFile` must stay synchronous
It reads `importGuardRef.current` and otherwise calls `fileInputRef.current?.click()` in the same tick (Shell.jsx:332-338). So the Shell needs to *already know*: read `repository.listDrafts()` once at mount (wrapped in `Promise.resolve().then(…).catch(…)`, see the `repository: {}` mocks), and have the Notebook's Start and the editor's Cancel (and a restore that deletes an unfit draft) report into a ref through a context, like `ImportGuardContext`. The hook files cannot report themselves: useKeptDraft.js's import allow-list has no context module. Re-reading on `pathname` change is a cheap second source of truth.

### Pitfall 4: Where the page-scoped notice lives
`.page-status` is `position: absolute` against `.page-status-anchor` (app.css:340-356, 389-391) and exists only in `RecipePageForRoute` (router.jsx:79-81). The Notebook (`div.list-page.place.nb`) and the editor need their own anchor + status; Shell-level refusals on other routes (Home, Ingredients, Search…) need one too. Constraints: (a) exactly one `.page-status` per page, and on recipe routes it must stay the first in the DOM (walk `pageStatus`, Shell.importGuard.test.jsx:170 `notice()`); (b) `PageStatus` lives in router.jsx, and Shell cannot import router.jsx without a cycle; (c) the router text pins (above). Options in Open Question 1.

### Pitfall 5: The picker's filter styling is scoped `.place` in the app, not in the board
shell.css defines `.place .ing__filters`, `.place .ing__field`, `.place .ing__field--category`, `.place .ing__filters select.ink-field`, `.place .ing__status`, `.place .ing__count`, `.place .ing__clear` (shell.css:443-490, 701-710, 768-775). The boards' CSS dropped the `.place` prefix (`.pc1366 .ing__filters{…}`), so the picker, inside `.notebook`, gets none of it in the build. The values must be re-homed under `.notebook .pick …` in notebook.css (or the filter markup extracted and given `.notebook`-scoped equivalents), including the select chevron and the 760-wide stacking the place uses. IngredientsPlace.jsx:189-232 holds the markup; `summaryText` (line 91) and `capitalised` (line 50) are unexported.

### Pitfall 6: Cancel races the Notebook's draft read
`discardDraft` fires the delete in a detached promise (useKeptDraft.js:49) and returns nothing, then the page navigates and the Notebook calls `listDrafts()`. IndexedDB orders overlapping transactions by creation, which usually makes this work, but D-03 ("the Notebook then shows no draft row") should not rest on microtask luck [ASSUMED: A2]. Have Cancel await the delete before navigating (call `repository.deleteDraft` directly from the page with `discardDraft` clearing the timers first, or make `discardDraft` return the promise; `function discardDraft(` count stays 1). Do not set state after discarding: with D-04a the persist effect would rewrite the record on the next `createDraft` change.

### Pitfall 7: A draft row whose library entry is gone
`rowFromLibraryRecord` throws a `TypeError` on a missing entry or composition (versionRow.js:54-66). D-07 leaves the entry-gone case to Phase 11, but an uncaught throw in render blanks the whole app (no error boundary was found in the files read). Guard the projection (skip the row, or keep it in the table without figures) so one bad row cannot crash the page.

### Pitfall 8: Grams, empties and the struck-baseline logic
`GramsCell` compares `draftPortion.grams !== String(portion.grams)` and strikes the "baseline" (IngredientTable.jsx:160); with an empty raw string and a numeric 0 the cell would show a false struck `0 g` (T-01). The creating branch needs the raw string for the field and the numeric value for the share; pass a rows→raw map separately from the projected rows. The row label comes from `rowAccessibleLabel` using `rowGrams(row)`, so an empty field reads "0 g".

### Pitfall 9: Signed temperature field quirks
The serving temperature is `type=number step=any`. React's `onChange` does not fire for a lone minus typed into an empty field; the app's precedent handles this with one handler on both change and input events and `validity.badInput` (BatchRow.jsx:82-120: `readSignedInput`, `shownSignedValue`, `MALFORMED_NUMBER_ENTRY = 'unreadable number'`). The create payload accepts any string (`serveTempC: isString`, draft.js:494). See Open Question 3.

### Pitfall 10: Segmented shares a radio group across two scale cards
`Segmented` derives the radio `name` and caption id from `groupLabel` (Segmented.jsx:29-30) and renders Clear once picked (45-53); two cards both labelled "Kind" would share one DOM group. Add optional props (a per-scale `name`, a unique accessible name, `clearable={false}`) with defaults that leave Segmented.test.jsx green, rather than a third near-copy (MarkOneField is already one).

### Pitfall 11: Focus ring after a touch pick
The board draws the new row's focus with an explicit `.mk-focus` outline. Script focus after a mouse/touch pick does not match `:focus-visible` ([CITED: project memory note "Mark's own sketch tab can be stale": "no :focus-visible after mouse-initiated script focus"]; not re-measured this session), so the iPad may show no ring even though focus is correct. Verify on WebKit and, if it fails, apply the board's outline through a class for that one landing.

### Pitfall 12: Two tabs, two create drafts
The store is keyed by `versionId`, so Start in a second tab can create a second `create` record. The wrapper and the Notebook should both use `newestDraft` over fitting records; Cancel deletes only the one on screen [ASSUMED: A5].

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Ids | custom UUID | `freshId()` | falls back when `randomUUID` is unavailable over LAN HTTP (id.js:1-6) |
| Scale key | string concat | `mintScaleKey(freshId())` | `scale-` prefix guarantees no core key or unsafe name |
| Grams parse | regex in the component | `parseGramsDraft(raw) ?? 0` | one rule for figure and message (lineage.js:203-214) |
| Row from library | copy fields by hand | `rowFromLibraryRecord` | `structuredClone` of the entry, validation (versionRow.js:34-79) |
| Balance, bands, deviation | arithmetic | `sheetView` → `buildFigures` | reading path already correct for `baseline: null` |
| Picker matching | new filter | `filterLibrary` / `libraryCategories` | Phase 9 D-11 says the picker reuses it (ingredientSearch.js:5-6) |
| Draft record, fit check, blank | object literals | `buildDraftRecord`, `draftMatchesCreate`, `blankCreateDraft` | keys pinned; unsafe-key and shape checks |
| Name gate | `!name` | `recipeNameMessage` | the app's own sentence |
| Core cues | array of names | `useCatalog()` | seed-data-scan rejects the literal |
| Kind control | new radio markup | `Segmented` with additive props | D-19 controls, tabindex, caption/Clear behaviour |

**Key insight:** nearly everything the editor shows is an existing role fed by a synthetic version; the new code is state transitions on the draft and layout glue.

## Code Examples

### Persist branch after D-04a (shape only)
```js
// Source: useKeptDraft.js:199-206 today; the condition is the only change.
if (creating) {
  record = buildDraftRecord({ versionId, kind: 'create', payload: createDraft, now: new Date().toISOString() });
}
```

### Start (shape only, in a ui handler or a pure helper)
```js
// Sources: id.js:6, draft.js:531 and 67, repository.js:314, recipe.js:13
const message = recipeNameMessage(name);
if (message) return setError(message);              // 'Enter a recipe name.'
const ids = { recipeId: freshId(), versionId: freshId() };
const record = buildDraftRecord({ versionId: ids.versionId, kind: 'create',
  payload: blankCreateDraft({ ...ids, name: name.trim() }), now: new Date().toISOString() });
await repository.saveDraft(record);                 // await before navigating (D-04)
navigate(NEW_RECIPE_PATH, { state: { started: true } });
```
(`name.trim()` vs raw: the draft accepts any string; Phase 11's `createRecipe` trims at Save, domain/newRecipe.js:61. Choose one and test it.)

### Replace-redirect wrapper (pattern)
```js
// Source: NotebookRedirects.jsx:50-72 (pattern); draft.js:95 newestDraft, 510 draftMatchesCreate
useEffect(() => {
  let cancelled = false;
  Promise.resolve().then(() => repository.listDrafts()).then((records) => {
    if (cancelled) return;
    const record = newestDraft(records.filter(draftMatchesCreate));
    if (record) setFound(record); else navigate('/notebook', { replace: true });
  }).catch(() => { if (!cancelled) navigate('/notebook', { replace: true }); });
  return () => { cancelled = true; };
}, []);
```

## State of the Art

Not applicable: no external technology choice. The relevant "current approach" facts are internal: Phase 8 cut RecipePage into hooks and `RecipeSheet` precisely so this phase mounts the same Sheet; Phase 9 settled the draft shape so Phase 10 and 11 "fill fields that exist and add none" (draft.js:340-346).

## CONTEXT.md line-number drift report

Every citation in CONTEXT.md was re-opened. All hold, with these notes:
- `RecipePage.shell.test.js:258-293` holds (the useKeptDraft entry spans 257-293).
- `draft.test.js:594` holds as a line but the example there is `style: 'gelato'` (line 594), not `'philadelphia'`; the lowercase-id convention is confirmed by `data/styles.js:20` (`id: 'philadelphia'`).
- `cross-cutting.test.js:101-137` pins the app.css `(pointer: coarse)` rule list and the `.text-control` rule, not underline; underline is pinned by `binder.test.js:308-315` alone. Neither test reads notebook.css for underline, so `.notebook .pick__act` with an underline is allowed, as T-02 intends.
- `shell.test.js:70-152` spans the scoping test (starts 69), the "places' three conditions" test (100-110) and the five-`@media` test (141-152); the `border-radius` list is 410-436.
- `Shell.jsx` lines (for D-10): `importGuardRef` 197, `guardImport` 322-327, `chooseImportFile` 332-338, Outlet 500-502.
- All other cites (`router.jsx:35-84` is 35-85; `NotebookPlace.jsx:58-67`; `Authored.jsx:23`; `composition.js:24`; `catalog.js:18`; `useKeptDraft.test.jsx:290-301, 494-508, 564-587`; `RecipePage.test.jsx:946-954, 1159-1192`; `RecipeSheet.test.jsx:68, 103-112`; `Shell.importGuard.test.jsx:170-177`; `NotebookPlace.test.jsx:95-98, 191-207`; `notebook.test.js:37-53`; `seed-data-scan.test.js:105-191`) match.

## Runtime State Inventory

Not a rename/refactor/migration phase. One related fact: **no stored shape changes** (the DB version stays 10; `DB_VERSION = 10` store/db.js:8). A kept `create` draft is device-local, is not in Export (`exportAll` reads only the file stores; "The drafts store is not read: drafts stay on the device", repository.js comment above `exportAll`), and Import is refused while one is kept (D-10).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node | build, tests, walk | ✓ | v24.21.0 | — |
| npm / Vite / Vitest | build + tests | ✓ | vite 8.2.2, vitest 5.0.0 | — |
| Playwright WebKit | walk, 393 measure, WebKit side-by-side | ✓ | playwright-core 1.63.0 at the npx cache; `webkit-2359` installed | — |
| git worktree | base recording | ✓ | repo is a git repo, worktree list shows only the main checkout | — |
| iPad (WebKit, 1366, coarse) | D-12 | not testable by the agent | — | Mark's List check row; steps walked in WebKit first |
| Network | nothing | not needed | — | — |

**Missing with no fallback:** none for the build. The iPad confirmation is Mark's and only counts as device-verified when he confirms.

## Validation Architecture

Skipped: `workflow.nyquist_validation` is `false` in `.planning/config.json`. Test commands are listed under "Phase 9 plan shape and proven commands". Suggested test homes: pure logic in `domain/creation.test.js` (node env, no docblock); component behaviour in jsdom files under `ui/` with `@vitest-environment jsdom`, mocking `../store/repository.js` per file (see `Shell.importGuard.test.jsx` and `useKeptDraft.test.jsx` harnesses); a StrictMode mount for the page.

## Security Domain

`security_enforcement` is on (ASVS level 1, block on high) [VERIFIED: config.json]. Local-only app, no network, no auth.

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2/V3 Authentication, Session | no | single local user |
| V4 Access Control | no | — |
| V5 Input Validation | yes | typed values are strings in the draft, validated by `draftMatchesCreate` on restore (exact keys, `carriesUnsafeKey`, shape checks); names, notes, descriptions, scale words render as React text children only; no `dangerouslySetInnerHTML` (pinned) |
| V6 Cryptography | no | `crypto.randomUUID`/`getRandomValues` via `freshId`, not security-sensitive |
| V12 Files/import | indirect | Import refused while a creation is kept (D-10) |

| Threat pattern | STRIDE | Mitigation |
|----------------|--------|------------|
| Prototype pollution via a user-typed key or id | Tampering | scale keys are minted (`scale-` prefix), row ids minted, `RESERVED_ROW_IDS` and `carriesUnsafeKey` already guard the draft; never index an object by typed text (use `Map`/array scans, as IngredientTable.jsx does with `gramsInputsRef`) |
| Stored text rendered as markup | Tampering/XSS | text children only (T-09-06 precedent: NotebookPlace.test.jsx "renders a name … holding angle brackets as text") |
| A route id read as a recipe id (`new`) | Spoofing | `/notebook/new` declared before `/notebook/:recipeId`; ids are UUIDs |
| Draft left behind after Cancel | Information disclosure | Cancel awaits the delete; "abandoning it leaves no record behind" (MAKE-11) |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | New non-print `@media` selectors that require only `.notebook`/`.mk-*`/`.pick*` classes will not trip `print.test.js` `judge` | Pins | A red test the executor fixes by re-scoping; low |
| A2 | IndexedDB orders a later readonly transaction after an earlier overlapping readwrite one, so Cancel-then-read usually sees the delete; but nothing guarantees the delete transaction is *created* first | Pitfall 6 | Notebook briefly shows a stale draft row; mitigated by awaiting the delete |
| A3 | A file chooser opened after an awaited IndexedDB read loses the user gesture on iOS WebKit (why D-10a insists on a synchronous ref) | Pitfall 3, Anti-Patterns | If wrong, an async check would also work; the synchronous design is still correct |
| A4 | React keeps a lone "-" in a controlled number input whose state is `''` (value comparison, no DOM write) | Pitfall 9 | Typed minus vanishes; solved by the BatchRow precedent |
| A5 | Two tabs can each Start a `create` draft (store keyed by versionId) | Pitfall 12 | Orphan draft; `newestDraft` handles display |
| A6 | React Router ranks the static `/notebook/new` above `/notebook/:recipeId` regardless of order; the plan still declares it first as D-01 requires | Pins | none; order is declared anyway |

## Open Questions (RESOLVED)

Each question below is settled in the plans (planner, 2026-10-20); the RESOLVED line names the plan and the choice.

1. **Where do the Shell-level import-refusal notice and the Notebook's "Draft discarded" appear (D-10a)?**
   - Known: one `.page-status` per page; recipe routes keep theirs first; PageStatus is defined in router.jsx; router text pins; Shell test mocks.
   - Unclear: a Shell-owned anchor in `.shell__main` rendered only when the routed page has not supplied its own, versus each place (`/notebook`, `/notebook/new`) rendering its own anchor and Shell refusals on other routes using a Shell-owned one.
   - Recommendation: give `/notebook` and `/notebook/new` their own `page-status-anchor` + status via a small shared component placed in its own module (not router.jsx); give the Shell a lazily rendered anchor used only when the current route has none; run RecipePage.test.jsx:926-954 and the walk to prove the recipe routes are unchanged. Planner should state the choice in its plan.
   - RESOLVED (plans 10-11 and 10-04): the recommendation, as planned. ui/PageNotice.jsx gives `/notebook` and `/notebook/new` their own anchor and status (10-11); RecipePageForRoute registers its existing announcer and the Shell renders its own fallback notice only while no routed page has registered one (10-04); router.jsx's anchor does not move; "Draft discarded." reaches `/notebook` as route state `{ discarded: true }`, a flag read once.
2. **"Draft kept" right after Start.** `onPageStatus(DRAFT_KEPT_STATUS)` fires on every restore. Recommendation: the page drops it when the route state says it was just started; announce it on Resume only.
   - RESOLVED (plan 10-11): the recommendation; the route state `{ started: true }` is read once and replaced with null, so Resume, a reload and a direct visit announce it and a fresh Start does not.
3. **Serving temperature unreadable entry.** Recommendation: follow the BatchRow precedent (`readSignedInput`/`shownSignedValue`, exported at BatchRow.jsx:85-96) or accept `event.target.value` and let Save validate; either way test a lone minus. Phase 11's Save must treat any non-numeric string as invalid.
   - RESOLVED (plan 10-08): the BatchRow precedent; an unreadable entry is kept as MALFORMED_NUMBER_ENTRY and shows blank, a test types a lone minus, and Phase 11's Save must refuse it.
4. **Same-name warning timing.** Board shows it under the field while typing; decide whether it updates per keystroke (recipes list already loaded) — recommended, since no write is involved.
   - RESOLVED (plan 10-03): per keystroke, the recommendation.
5. **Band parser.** `parseGramsDraft` rejects negatives and more than two decimals; bands like `9.25` pass, `-` fails. D-08b says "finite non-negative numbers with low at or below high"; recommend reusing `parseGramsDraft` for the two ends so there is one numeric rule, and add a test for `'10'`/`'10.5'`/`''`/`'x'`.
   - RESOLVED (plan 10-08): `parseGramsDraft` for both ends, the recommendation; tests cover equal ends, low above high, blank, '-1', '1.234', 'x' and '9.25'.
6. **724 to 759 px.** The board's `.mk-page` stretch rule is `max-width: 759.98px`; the pinned media list allows `723.98px` only. The boards draw 393 and 1366, so the gap is undrawn; confirm nothing odd at 744/768 in the WebKit pass.
   - RESOLVED (plans 10-05, 10-12 and 10-10): the board's 759.98 rules sit in notebook.css's pinned 723.98 block (10-05 for the band, 10-12 for the picker's filters), and 10-10 checks /notebook and /notebook/new for sideways overflow at 744 and 768 (and 393, 1024, 1366) on the final build.
7. **Row id and note keys.** Notes are index-keyed (`key={index}`, Authored.jsx:26); adding/removing notes with controlled textareas is fine, but focus after "Add note" is undrawn — recommend focusing the new textarea only if Mark asks.
   - RESOLVED (plans 10-05, 10-06 and 10-09), a discretion call that departs from the recommendation: every add moves focus into the item it added (the new note's textarea, the new row's grams field as the picker board draws it, the new scale's or problem's Name) and every remove moves focus to that list's add control. Rationale: Add scale and Add problem disappear at two and every remove button disappears with its row or card, so leaving focus in place would drop it to the page on iPad WebKit; the picker board already draws focus landing in the new row; one rule for every add is simpler than one for the picker alone. Undrawn, no visual change; it is listed for Mark in the phase summary and is cheap to reverse (one effect per list).

## Sources

### Primary (HIGH confidence, files read this session)
- `.planning/phases/10-the-creation-editor-without-save/10-CONTEXT.md`, `.planning/ROADMAP.md` (Phase 10, Before planning), `.planning/REQUIREMENTS.md`, `.planning/STATE.md` (Phase 10 mentions), `./CLAUDE.md`, `./.claude/CLAUDE.md`, `.claude/skills/sketch-findings-sprinkles/SKILL.md`
- `app/src/ui`: `RecipeSheet.jsx`, `sheetView.js`, `useKeptDraft.js` (+ its test), `RecipePage.jsx`, `NotebookPlace.jsx`, `NotebookRedirects.jsx`, `notebookPaths.js`, `Shell.jsx`, `IngredientsPlace.jsx`, `Segmented.jsx`, `Authored.jsx`, `IngredientTable.jsx`, `FormulationNote.jsx`, `Headnote.jsx`, `CatalogContext.jsx`, `RecipeBand.jsx`, `FieldFeedback.jsx`, `MarkOneField.jsx`, `Button.jsx`, `Radio.jsx`, `countWords.js`, `useRouteIntents.js`, `useAnnouncer.js`, `BatchRow.jsx` (signed field), `VersionRow.jsx` (ceremony)
- `app/src`: `router.jsx`, `main.jsx`, `domain/{draft,versionRow,lineage,composition,figures,catalog,recipe,newRecipe,rows,stepNumbers,advisories,ingredientSearch,id,penDraft}.js`, `store/{repository,catalog}.js`, `data/{styles,core-scales,core-problems}.js`
- Tests: `RecipePage.shell.test.js`, `RecipePage.test.jsx`, `RecipeSheet.test.jsx`, `useKeptDraft.test.jsx`, `NotebookPlace.test.jsx`, `Shell.importGuard.test.jsx`, `Shell.test.jsx`, `tabindex-scan.test.js`, `styles/{shell,notebook,binder,cross-cutting,print,tokens}.test.js`, `store/seed-data-scan.test.js`, `domain/draft.test.js`
- Styles: `shell.css` (places rules), `notebook.css` (action, field, media list), `app.css` (page-status)
- Sketch 013: `README.md`, `CONTRACT.md`, all five boards (panel captions and the creation-editor markup extracted), `.planning/canvas-generators/p10.py`, `places.py`
- Phase 9: `09-walk.mjs`, `09-walk-record-base.sh`, `09-walk-check.sh`, `09-dist-guard.sh`, `09-places-check.mjs`, `09-04-PLAN.md`, `09-04-SUMMARY.md`, plan `<automated>` lines, `09-RESEARCH.md` (Pitfall 12)
- Ran: the full test suite; node probes for `displayNumbers([])`, the zero-mass figures, `parseGramsDraft` samples, library counts; `git log` for the walk base; `ls` for Playwright.

### Secondary / Tertiary
- None. No web sources were used.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH (no new package; versions from package.json)
- Architecture: HIGH (every integration point read; two behaviours proven by probe)
- Pins and pitfalls: HIGH (read the asserting test code); A1-A6 are the only inferred items
- Sketch contract: HIGH for markup/words/measures (board text read); iPad behaviour unverified by design

**Research date:** 2026-10-19
**Valid until:** until the next `app/` commit lands (the line numbers are tied to HEAD `e461a7a1`); re-check pinned counts if Phase 10 plans change `useKeptDraft.js`, `RecipeSheet.jsx`, `router.jsx` or the two CSS files.
