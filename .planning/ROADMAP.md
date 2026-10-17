# Roadmap: Sprinkles

## Milestones

- ✅ **v1 Develop the next olive oil recipe** — Phases 1-4 and the inserted 03.x phases (shipped 2026-10-13). Archive: `milestones/v1-ROADMAP.md`; audit: `milestones/v1-MILESTONE-AUDIT.md`.
- ✅ **v1.1 Groundwork for creation** — Phases 5-7 (shipped 2026-10-15). The code is made ready for recipe creation; no creation UI ships and no screen changes. Archive: `milestones/v1.1-ROADMAP.md`; audit: `milestones/v1.1-MILESTONE-AUDIT.md`.
- 🚧 **v2.0 Recipe creation** — Phases 8-12 (in progress). A maker creates a new recipe from scratch in the Notebook, authors every section of it from a real ingredient library, and makes it from a printed sheet.

## Phases

<details>
<summary>✅ v1 Develop the next olive oil recipe (Phases 1-4, 14 phases incl. insertions) — SHIPPED 2026-10-13</summary>

- [x] **Phase 1: Read the churned recipe** - The churned olive oil recipe and its balance figures are legible in the app instead of on paper (completed 2026-09-05)
- [x] **Phase 2: Record the first batch** - The 2 Aug batch enters Sprinkles as what actually happened, snapshotted against the version it used (completed 2026-09-06)
- [x] **Phase 3: Develop the next version** - Version 2 is created, adjusted, and compared against the churned version without disturbing it (completed 2026-09-08)
- [x] **Phase 03.1: The imprint and the binder** (INSERTED) - The recipe page gains its front-matter band and every control leaves the printed spread; the pen reads as the page; the binder replaces browser chrome (completed 2026-09-09)
- [x] **Phase 03.2: The portion and the reset** (INSERTED) - Portions become the authored amount and the total derives; `step`/`splitStep` retire; the store resets to the new shape and the seed is rewritten, rather than migrating (completed 2026-09-10)
- [x] **Phase 03.3: The front-matter rows and the page in step order** (INSERTED) - The imprint and the tray retire into two front-matter rows; the table reads in step order; the pen's method opens read-only (completed 2026-09-10)
- [x] **Phase 03.3.1: The full battery: the record pen rebuilt from sketch 007** (INSERTED) - The record pen carries the full tasting battery as sketch 007 draws it (completed 2026-09-13)
- [x] **Phase 03.3.1.1: Record pen conformance polish** (INSERTED) - The 18 untriaged conformance gaps between the shipped record pen and the structural contract are closed (completed 2026-09-16)
- [x] **Phase 03.4: The design layer in code** (INSERTED) - The App palette, Sheet-prefixed tokens, the hand and Home land in code (completed 2026-09-22)
- [x] **Phase 03.5: Separate the recipe from the sheet** (INSERTED) - The recipe record and the version's Recipe Sheet are separate in the store, the routes and the page (completed 2026-10-02)
- [x] **Phase 03.6: Per-step shared ingredients** (INSERTED) - A shared ingredient's lines and a step can be removed without touching the other steps (completed 2026-10-06)
- [x] **Phase 03.7: Before you start as its own Sheet section** (INSERTED) - Before you start is its own Sheet section above the Ingredients, and the ingredients table prints by step groups
- [x] **Phase 03.7.1: Hide draw temperature** (INSERTED) - Time to draw temp. no longer shows on any screen
- [x] **Phase 4: Prepare the next version for making** - The new version prints as a bench sheet, matches back to its code, and the whole loop is usable and recoverable (completed 2026-10-13)

Full phase detail, plans and progress: `.planning/milestones/v1-ROADMAP.md`.

</details>

<details>
<summary>✅ v1.1 Groundwork for creation (Phases 5-7) — SHIPPED 2026-10-15</summary>

- [x] **Phase 5: Split the recipe page** (6/6 plans) - The recipe page's draft logic moves into pure domain operations behind hooks, leaving `RecipePage` as the route shell; the maker sees no change (completed 2026-10-14)
- [x] **Phase 6: The ingredient library in the store** (3/3 plans) - The ingredient library becomes an object store behind the repository seam, seeded, exported and imported, and editing it never moves a stored figure (completed 2026-10-14)
- [x] **Phase 7: Creation primitives** (3/3 plans) - Framework-free functions create a recipe with a root version, hand out step keys that are never reused, and build a row from a library ingredient (completed 2026-10-15)

Full phase detail, plans and progress: `.planning/milestones/v1.1-ROADMAP.md`.

</details>

### 🚧 v2.0 Recipe creation (In Progress)

**Milestone Goal:** A maker can create a new recipe from scratch in the Notebook, authoring every section of it from a real ingredient library, and make it from a printed sheet.

- [ ] **Phase 8: Split the recipe page along its jobs** - `RecipePage` is cut into the modules creating and editing will share; the maker sees no change
- [ ] **Phase 9: The library and the stored shapes, plus the two places** - The reviewed library reaches every profile with provenance, every shape creation will store is settled while a reset is still free, every seed dataset is rows in a store table, and the Ingredients and Notebook places list the library and the recipes
- [ ] **Phase 10: The creation editor, without Save** - A maker starts a recipe from the Notebook with only a name, authors all of it but its steps against live figures (rows, Version name, Before you start, its own scales and problems, its style and balance targets, a machine and process), and can Resume it; nothing is saved yet
- [ ] **Phase 11: Steps, structure, save and print** - A maker authors and shapes the new recipe's Instructions steps, saves it as its first version, which stays editable until it has a batch or a child version, and prints it as a bench sheet
- [ ] **Phase 12: Showing a recipe's own scales and problems, and the whole loop** - The record pen, the reading and the printed log show a created recipe's own scales and problems, and a created recipe survives print, batch, export and import on the iPad

## Before planning

These gates apply to the v2.0 phases below.

**The reset window.** Until a recipe can be saved, the store can still reset to a new shape, because it holds no real recipe. That ends in Phase 11, when Save lands and creation becomes saveable. Phase 10 builds the creation editor with deliberately no Save: a creation there is only its draft, nothing real is stored, and the window stays open through it. Phase 9 still holds every stored-shape change v2.0 needs (the library seed and entry shape, the scale definitions, the `create` draft kind) and the milestone's only database version change (9 to 10), which resets the store to the new shapes and reseeds it (decisions 2 and 5). From Phase 11 on, no phase or quick task changes `DB_VERSION`; a later shape change lifts records instead of dropping them. Before the first device build that can save a recipe (Phase 11's), Mark's List carries a row asking Mark to export his data.

**The design gate.** No sketch in `.planning/sketches/` (001 to 011) draws any surface v2.0 adds. Impeccable owns design and GSD phases consume approved boards: each new surface is drawn on a Claude Design canvas, approved by Mark, and snapshotted into `.planning/sketches/` before the phase that builds it is planned. Plans cite the snapshot by path, and conformance is measured side by side in WebKit, never argued from prose. Phase 8 changes no screen and has no design gate; Phases 9, 10, 11 and 12 each list the surfaces they wait for. Phase 9's two place boards are approved (sketch 012).

**Mark's decisions.** Listed in `research/SUMMARY.md`. Mark answered 1 to 15: the 12 decide rows on Mark's List, 6 and 15 earlier, and 4 closed when the Bitter bug row was fixed. 16 has no v2.0 phase. 17 to 21 were added later and are decided. Blocks names the phase each decision gated; a decided one gates nothing now, and that phase applies its answer.

| # | Decision | Answer | Blocks |
|---|----------|--------|--------|
| 1 | Library coefficient conflicts: dextrose basis, salt 580 or 586, fructose POD, strawberries, skim milk powder, and coconut milk and heavy cream (possibly different products) | DECIDED: keep the app's values for all seven, each recorded as decided (LIB-05) | Phase 9 |
| 2 | The Phase 6 D-05 amendment: clear the library on the version bump, or top it up | DECIDED: clear the library on the version bump and reseed it, amending Phase 6 D-05 (LIB-06) | Phase 9 |
| 3 | Scale kind: goldilocks with a fixed "right" middle, or plain magnitude | DECIDED: each scale picks its kind, goldilocks (the fixed middle word "right") or plain magnitude, with a label at each end; a scale definition carries its kind (TASTE-01, TASTE-03, TASTE-04) | Phase 9 (the definition's shape), Phase 10, Phase 12 |
| 4 | Bitter's fate, once Mark answers the open bug row `bug-new-version-loses-declared-defects` | DECIDED: the bug row is fixed and done (68ea742, a new version keeps the parent's declared problems); no longer a blocker | None |
| 5 | Scale shape: both shapes read side by side with no reset, or objects only with a reset (check the devices for real batches first). A reset conflicts with LIB-06 as written | DECIDED: definitions only, with a reset; no device holds real batches, so resets are fine (Mark). LIB-06 is amended to match, and olive oil's Body and Oil become definitions in the seeded versions; TASTE-03 stands | Phase 9 |
| 6 | Creation draft persistence in v2.0 (REQUIREMENTS.md lists it as MAKE-11) | DECIDED earlier: Resume stays (MAKE-11) | Phase 9 (the draft kind), Phase 10 |
| 7 | An ingredient not in the library: stop with a message, or a name-only row with limited figures. A name-only row is a new row shape, so it would land in Phase 9 | DECIDED: the picker says "Not in the library yet" and adds nothing; no name-only row, so nothing moves into Phase 9 (MAKE-06) | Phase 10 |
| 8 | The version name on a blank start | DECIDED: the Version name starts as "Version 1", which the maker can change (MAKE-05) | Phase 10 |
| 9 | What reordering rows means when the table reads in step order (STRUCT-02 says rows within a step) | DECIDED: rows move up and down within their step; STRUCT-02 stands | Phase 11 |
| 10 | Removing a row or step at creation: delete it outright, or flag it | DECIDED: delete it outright, and clean up anything that pointed at it (MAKE-06, STRUCT-01) | Phase 10 (a row), Phase 11 (a step) |
| 11 | Target bands pre-filled, or blank | DECIDED: the maker picks the ice cream style (Mark's examples: Philadelphia, French, gelato, sorbet) and the balance bands fill in from it; the maker can edit them or leave them blank (MAKE-09). Which styles, and the band numbers, are decision 17 | Phase 10 |
| 12 | Structure after the first save: a review step before Save, an editable first version with no batches, or accept the limit | DECIDED: the first version stays editable (add, remove, reorder) until it has a batch or a child version (STRUCT-04) | Phase 11 |
| 13 | Whether recipe names must be unique | DECIDED: two recipes may share a name; the Notebook warns (MAKE-04) | Phase 10 |
| 14 | One description or two (the recipe record and the Sheet each have one) | DECIDED: one description box that fills both the recipe description and the Sheet description (MAKE-05) | Phase 10 |
| 15 | A `libraryId` link on rows, or record it as deferred (LIB-08 states the link) | DECIDED earlier: the link stays (LIB-08) | Phase 9 |
| 16 | The `importAll` overwrite policy | OPEN | No v2.0 phase: library editing is out of v2.0; decide before library editing |
| 17 | Styles and their bands: which ice cream styles a maker picks from, and where each style's band numbers come from (Mark's List `decide-style-bands-source`) | DECIDED and APPROVED (Mark, 2026-10-17): four styles (Philadelphia, French, gelato, sorbet) with the bands from Mark's own research (`~/Downloads/Balance Bands`), approved on `look-style-bands` and recorded in `.planning/notes/2026-10-16-style-bands-draft.md`; PAC and sugar start blank (`decide-style-pac-band`); the maker can edit a band after choosing (MAKE-09) | Phase 9 (the approved values are seeded there; Phase 10's style board shows them) |
| 18 | Where seed data lives | DECIDED (Mark, 2026-10-16): every seed dataset is rows in store tables (LIB-09): the library, machines, ice cream styles with their bands, and the core scales and problems | Phase 9 |
| 19 | Sheet code durability: the code follows the content, keeps every printed code, or printing locks the structure | DECIDED (Mark, 2026-10-16, `decide-printed-code-after-edit`): the code is assigned when a version is created (a first version included), is unique, is stored with the version and never changes, whatever is edited (CODE-01). This reverses Phase 4 D-08 and D-09, which computed the code and never stored it | Phase 9 (the stored field), Phase 11 |
| 20 | Seed tables in export and import: travel in the store file, or rebuilt from the seed | DECIDED (Mark, 2026-10-16, `decide-seed-tables-transfer`): the machines, the styles with bands, and the core scales and problems travel in the store file like the library, so an import into a fresh profile restores them and rows a maker adds later are not lost (LIB-09) | Phase 9 |
| 21 | What a style row stores beyond the six bands | DECIDED (Mark, 2026-10-17, `decide-style-extra-fields`): everything in his seed for the style: egg yolk, overrun, stabilizer and emulsifier ranges, default serve temperature, default equipment class and calibration family, stored and not read in v2.0; how or whether to display them is later (LIB-09) | Phase 9 |

**Open questions from the Codex review.** Both are decided.

- (a) Equipment and process scope. The choice is DECIDED (Mark, 2026-10-16, `decide-equipment-process-scope`): the maker picks a conventional machine from a short list Mark names, and picking one fills its minimum and maximum fill (`minFillG`, and a new `maxFillG`, which nothing stores today). The machine table starts with Whynter at 700 g minimum fill; Mark adds other machines later. Whynter's maximum fill is seeded empty for now (Mark, 2026-10-16, `decide-whynter-max-fill`); Mark fills it in later, so it blocks nothing. Nothing reads either limit today, and a fill advisory is a later feature (Future Requirements). The decision register (`product-requirements/03-decision-register.md`, Supported equipment) needs that scope before a process schema or a design brief is approved. The chosen machine needs a storage field, so that change must land while the reset window is open, before Save in Phase 11. Process stays as stored today (pasteurise temperature and hold time).
- (b) Requirement IDs. DECIDED (Mark, 2026-10-16, `decide-requirement-id-prefix`). This milestone's tasting-scale requirements were SCALE-01 to SCALE-04, which collided with the product requirement SCALE-01 (quantity scaling); they are now TASTE-01 to TASTE-04, with a crosswalk in `REQUIREMENTS.md`. REC-03 and REC-05, which are not in `product-requirements/04-requirements.md`, are replaced by plain wording.

## Phase Details

### Phase 8: Split the recipe page along its jobs

**Goal**: `RecipePage` is cut along its separate jobs, so the creation editor in Phase 10 can mount the same Sheet and pen modules that editing uses, and the maker sees no change
**Depends on**: Phase 7 (v1.1, shipped). Independent of Phase 9; the two may run side by side (see Notes)
**Requirements**: EDIT-05, EDIT-06
**Success Criteria** (what must be TRUE):
  1. `RecipePage.jsx` is the route shell only: the announcer, record loading, the sheet view, the version pen, kept drafts and route intents each live in a module of their own (a hook, a pure `domain/` function or a component), and the Sheet renders through one component the creation editor can mount
  2. In the built app the maker sees no change: the recorded WebKit walk of 94 snapshots (the version pen, the record pen, a correction and a tasting, each opened, edited, saved, cancelled and kept after a reload) compares MATCH with its baseline
  3. The shell test names each new module and asserts that the shell imports it and that its job lives there, not only that code is gone from `RecipePage.jsx`
  4. Every existing test passes; tests whose code moved change only their imports, and none is deleted or weakened

**Plans:** 3/5 plans executed, waves 1 to 5 in sequence (every cut touches `RecipePage.jsx`)

Plans:
**Wave 1**
- [x] 08-01-PLAN.md — the walk runs from Phase 8 and matches at the base (tracer); shell effects and StrictMode restore pinned; cut 1 `useAnnouncer`

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 08-02-PLAN.md — cut 2 `useRecipeData`; cut 3 the pure `sheetView` with a nullable baseline

**Wave 3** *(blocked on Wave 2 completion)*
- [x] 08-03-PLAN.md — cut 4 `RecipeSheet` with the D-11 re-points; the no-stored-version component tests, empty and populated

**Wave 4** *(blocked on Wave 3 completion)*
- [ ] 08-04-PLAN.md — cut 5 `useVersionPen` with `useDraftWriter`; cut 6 `useKeptDraft` with the hook-level StrictMode test

**Wave 5** *(blocked on Wave 4 completion)*
- [ ] 08-05-PLAN.md — cut 7 `useRouteIntents`; the gated bonus `useBatchRecording`; the final shell test, walk and base-to-result test audit

**UI hint**: yes
**Notes**: No screen changes, so no design gate and no UI-SPEC. The walk is `.planning/milestones/v1.1-phases/05-split-the-recipe-page/05-walk.mjs` with its baseline `05-walk-before.json`, recorded at 4f1f98f before Phases 6 and 7 and later quick tasks landed: first confirm the baseline still matches at this phase's base commit, and if it does not, record a new before-walk there, as 05-01 did, before any code moves. The walk dumps the versions, batches, recipes and drafts stores, not the library, so Phase 9's larger library does not disturb it; Phase 9's reset does rewrite the seeded versions it dumps (decision 5: scales become definitions), so finish this phase's walk before Phase 9 merges, or re-record the baseline on Phase 9's result. Phase 9's `create` draft kind and this phase's kept-draft cut both touch the draft restore path; whichever lands second builds on the first. The research disagrees on when to extract record loading (early or late); settle it in discussion. The batch-recording controller is not among EDIT-05's jobs and creation does not need it; it can stay in place if the split runs long.

### Phase 9: The library and the stored shapes, plus the two places

**Goal**: While a reset is still free, every shape creation will store is settled: the reviewed ingredient library, with provenance, reaches every profile, and a recipe's own scale definitions, each carrying its kind, travel into the batches made from it. Beside them the two places open: the Ingredients place shows that library, read-only, and the Notebook place lists the recipes
**Depends on**: Phase 7 (v1.1, shipped). Independent of Phase 8. Planning waits for the design gate below; Mark's decisions for this phase (1, 2, 3, 5, 6, 15, 18, 19, 20 and 21) are answered, and decision 4 is closed. The Whynter row (minimum 700 g, maximum seeded empty, `decide-whynter-max-fill`) and the four styles with their approved bands and fields (`look-style-bands`) are Phase 9 inputs, because their rows are seeded here
**Requirements**: LIB-04, LIB-05, LIB-06, LIB-07, LIB-08, LIB-09, CODE-01, TASTE-03, PLACE-01, PLACE-02
**Success Criteria** (what must be TRUE):
  1. The library holds the reviewed dataset's entries beyond the current 26, each with its source and basis; the 26 existing entries keep their current values; each of the seven conflicts with the dataset is recorded as decided for the app's value, and a test fails on any same-ingredient conflict that has no recorded decision; and a dairy entry from the dataset counts its lactose once in PAC and POD
  2. A profile holding version-9 data opens at database version 10 with the larger library: the library is cleared and reseeded, the store resets to the new shapes and the seeded recipes are rewritten in them, proven from a stored version-9 profile in a real IndexedDB; and nothing creation stores changes shape after this phase: the drafts store keeps a creation draft (a `create` kind with its own fit check) instead of deleting it on restore, and a test fails if any later upgrade deletes a store for a profile at version 10 or above
  3. A row built from a library entry keeps the id of the entry it came from through save, export and import, and changing that entry afterwards moves no stored figure
  4. A scale is stored as a definition that carries its kind, and olive oil's Body and Oil are definitions in the seeded versions, with its 2 Aug batch reading as before; a batch keeps the definitions of the version it was made from, so changing or removing a scale on a later version moves none of its stored marks, through export, import and reopening
  5. The Ingredients place lists the library, read-only, with search by name and category, and the Notebook place lists the recipes; neither starts a recipe or changes a library entry
  6. The machines, the ice cream styles with their bands, and the core scales and problems are rows in store tables that the app reads, with no seed dataset read from a code constant at run time, and the database upgrade from 9 to 10 creates and seeds them
  7. A version stores its Sheet code, assigned when the version is created (a first version and every Next version) and unique; no edit to the recipe name, the Version name, the Sheet title or description, or any row, step or note changes it; the seeded versions keep the codes they print today, so sheets already in the binder still find them
  8. The machines, the styles with their bands, and the core scales and problems travel in the store file with the library: the file validator checks them, the store file version changes, and an export from one profile imported into a fresh profile restores them

**Plans**: TBD
**Design gate**: MET (Mark, 2026-10-17). The boards for the Notebook place (the recipe list) and the Ingredients place (the library, read-only, with search by name and category) are approved and snapshotted as `.planning/sketches/012-places/` (README `## Decisions`: the category filter is a select, the Notebook lists the most recently touched recipe first as Home does, the provenance columns read Basis and Source). Plans cite the snapshot by path.
**UI hint**: yes
**Notes**: This is v2.0's only database version change and it must land before Phase 11 can save a recipe. The converter runs offline once (a node script reading `~/Downloads/sprinkles-ingredient-seed-db.json`) and commits a reviewed module; nothing is fetched or parsed at runtime. The 26 existing keys must not change, because the seeded recipe files import entries by key (`data/library.js` holds 26 entries, counted 2026-10-16; the "12" in parts of the research is the olive oil recipe's row count). The seven conflicts keep the app's values (decision 1), so no existing basis changes; the conflict-gate test reads each recorded decision. The version-10 upgrade clears the library and reseeds it (decision 2, amending Phase 6 D-05), and resets the store to the new shapes, rewriting the seeded recipes (decision 5); nothing a maker made is lost, because no device holds real batches (Mark). The clear also removes library records an import wrote; that is harmless while the library is read-only, and is to be recorded in `db.js` and tested. The reset rewrites the seeded versions the Phase 8 walk dumps (see Phase 8's Notes). The stores for the machines, the styles, and the core scales and problems are stored-shape changes, so they land in this same 9 to 10 bump inside the reset window (decision 18, LIB-09). Their seed content is settled: the Whynter machine row (maximum fill empty, `decide-whynter-max-fill`) and the four styles, whose bands and other fields Mark approved (`look-style-bands`, `decide-style-extra-fields`; the values are in `.planning/notes/2026-10-16-style-bands-draft.md`). A style names its equipment class and calibration family as plain ids; they are not tables yet (Phase 9 context D-12). The record pen, the reading and the printed log read the core scales and problems from the tables, which touches this phase and needs discussion. The Sheet code (decision 19) is a stored field on the version, so it lands in this bump; it amends Phase 4 D-08 and D-09, and `sheetCode.js` stops deriving the code from content for new versions. The code is derived once from the version id, checked for clashes and stored, and the seeded versions keep the codes they print today (Phase 9 context D-04 to D-06). The new tables are part of the store file (decision 20): `transfer.js` exports, validates and imports them, and the store file version (8) changes. Criterion 2's draft kind is groundwork for MAKE-11, which Phase 10 delivers. The places replace today's placeholders at `/notebook` and `/ingredients` (`router.jsx`). The Notebook place lists the recipes and starts nothing: there is no creation editor until Phase 10, which adds the New recipe entry. The Ingredients place reads the library through the repository seam and never writes it; its search is the pure `filterLibrary(records, query, category)`, which Phase 10's picker reuses. Sketch 012 draws the matching as: the name contains the typed letters in any case, the category is exact, results stay A to Z. The research (`SUMMARY.md`) describes more (folding diacritics, matching every typed word, ranking a name-prefix first); any of that in the build is a design change to take back to Sid, and the discussion chose the board's matching (Phase 9 context D-11). The Phase 8 walk visits only version and batch routes under `/notebook/:recipeId/`, so the places do not disturb it. Every new button, checkbox and radio renders through `ui/Button.jsx`, `Checkbox.jsx` or `Radio.jsx`, every link carries `tabIndex={0}`, and every visual value reads a token.

### Phase 10: The creation editor, without Save

**Goal**: A maker can start a blank recipe from the Notebook with only a name and author everything its first version carries apart from its steps: the recipe's name and one description, its Version name, its Before you start, its rows from the library with grams and live balance figures, its own scales and problems, and its style, balance targets, equipment and process; a half-made recipe survives a closed tab. There is deliberately no Save, so nothing real is stored yet
**Depends on**: Phase 8 (the shared editor) and Phase 9 (the settled shapes, the scale definitions, the larger library, the `create` draft kind and the Notebook place). Planning waits for the design gate below (the Whynter row's maximum fill is seeded empty, `decide-whynter-max-fill`, so it waits on nothing); decisions 3, 6, 7, 8, 10, 11, 13, 14 and 17 are answered
**Requirements**: MAKE-04, MAKE-05, MAKE-06, MAKE-08, MAKE-09, MAKE-11, TASTE-01, TASTE-02
**Success Criteria** (what must be TRUE):
  1. The Notebook place offers New recipe, and a maker starts a blank recipe from it by giving only a name; a name another recipe already has is allowed and the Notebook warns of it; the creation editor opens with the Version name "Version 1", which the maker can change
  2. While creating, the maker writes the recipe's name, one description that fills both the recipe description and the Sheet description, and Before you start notes
  3. While creating, the maker picks rows from the library, enters grams and removes a row, which deletes it outright, and the balance figures follow each change; an ingredient not in the library reads "Not in the library yet" and adds nothing
  4. While creating, the maker defines 0 to 2 scales, each with a name, a label for each end and its kind (goldilocks, with the fixed middle word "right", or plain magnitude), and 0 to 2 problems; chooses an ice cream style, so the balance bands fill in, then edits them or leaves them blank; and picks a machine from the short list and sets the process, or leaves either empty, an empty one reading in the editor with no gap or error
  5. A half-made recipe survives a closed tab: the Notebook offers Resume and reopens it as it was left, scales, problems and targets included, and abandoning it leaves no record behind; there is no Save: however far a creation goes, the Notebook lists no new recipe, and the only record a creation writes is its draft

**Plans**: TBD
**Design gate**: Approved and snapshotted boards for the creation editor (name and its one description, Version name, Before you start, rows and the live Balance, a row's Remove included, since this phase removes a row), the ingredient picker (its "Not in the library yet" included), the Notebook's New recipe, its same-name warning and Resume, authoring scales and problems (each scale's kind included), and choosing a style with its balance bands, and picking a machine and setting the process. None is drawn yet. The style board shows the four styles with the bands Mark approved (decision 17); the machine and process boards wait on nothing further (the Whynter row's maximum fill is seeded empty).
**UI hint**: yes
**Notes**: No Save, by design: Save lands in Phase 11, once steps exist (see its Notes). Scales and problems, the style and balance targets, equipment and process are authored here, before Save: they moved from Phase 12 after the Codex review found that Phase 11 enables Save while Phase 12 added authoring that exists only at creation, so a recipe saved in Phase 11 could never gain it (Mark, 2026-10-16). A creation in this phase is only its `create` draft (Phase 9's kind, which Resume reads), so nothing real is stored, the reset window stays open through this phase, and no device build from it can save a recipe. The New recipe entry on the Notebook place is added here; Phase 9 built the list. Scale authoring writes Phase 9's definition shape, each scale carrying its kind. The seeded versions carry an `iceEd.style` field (null on olive oil), but the root version `createRecipe` builds leaves out `iceEd`, targets, equipment and process (Phase 7 D-02), so this phase adds them to the creation; the maker picks from four styles (decision 17), whose bands Mark approved (`look-style-bands`) and Phase 9 seeds. The machine and process are authored from the machine table Phase 9 seeds (Codex question (a), decided); the chosen machine needs a storage field, and that change lands in Phase 9's bump, before Save in Phase 11. The research's slice order for this phase: a `creating` mode on the shared Sheet with no baseline, then the picker and rows, then Resume. The root version `createRecipe` builds has no steps (`method: []`), while `rowFromLibraryRecord` gives a row's one portion `step: 1`, so until Phase 11 adds steps a creation row's portion names a step that does not exist; discussion settles what the editor shows for such a row, and Phase 11's allocation settles the reference before anything is saved. Removing a row here deletes it outright and prunes nothing, because no step uses a row yet; STRUCT-01's cleanup takes over in Phase 11. The picker reuses Phase 9's search and is measured at 393 and 1366 with the larger library. Import is refused while creation holds ink. Every new button, checkbox and radio renders through `ui/Button.jsx`, `Checkbox.jsx` or `Radio.jsx`, every link carries `tabIndex={0}`, and every visual value reads a token. Device checks run from the production build (`npm --prefix app run build && npm --prefix app run preview -- --host`), never the dev server.

### Phase 11: Steps, structure, save and print

**Goal**: A maker can author the new recipe's Instructions steps with the rows each uses, add, remove and reorder its steps and rows, save it as the recipe's first version, keep shaping that first version until it has a batch or a child version, and print it as a bench sheet
**Depends on**: Phase 10 (the creation editor). Planning waits for the design gate below; decisions 9, 10 and 12 are answered
**Requirements**: MAKE-07, MAKE-10, MAKE-12, STRUCT-01, STRUCT-02, STRUCT-03, STRUCT-04
**Success Criteria** (what must be TRUE):
  1. While creating, the maker writes Instructions steps (lead-in, text, targets) and says which rows each step uses and in what portions, and the balance figures still follow
  2. While creating a first version, the maker adds and removes steps and rows, and moves steps, and rows within their step, with Move up and Move down by touch and by keyboard; a removal deletes outright and leaves no dangling reference, and no move changes a step's stored number or a row's id
  3. Save creates the recipe and its first version in one step, carrying everything authored in the editor (its scales and problems, style, targets, equipment and process included), and lands on the new page, after which the Notebook lists the recipe and no longer offers Resume for it; a failed save leaves neither recipe nor version behind
  4. After Save, the first version keeps the same Add, Remove and Move controls, working as they did while creating, until it has a batch or a child version, and then shows none; no other saved version shows them, and the version pen's remove and restore on later versions works as before
  5. The created recipe prints as a bench sheet with its Sheet code, like the seeded ones, and typing that code finds it, also after a reorder or any other edit made after printing; a recipe with empty targets, equipment or process prints with no gap

**Plans**: TBD
**Design gate**: Approved and snapshotted boards for the creation editor's Instructions steps with their uses and portions, and the Add, Remove, Move up and Move down controls for steps and rows, both while creating and on a saved first version that has no batch and no child version. None is drawn yet.
**UI hint**: yes
**Notes**: Save lands here, once steps exist. Under decision 12 a saved first version can still gain structure until it has a batch or a child version, so Save before steps or scales is no longer a dead end; the authoring still moves before Save, as Mark instructed (2026-10-16): Phase 10 authors everything but the steps, and this phase adds the steps before the first save. This is where the reset window closes, because a recipe becomes saveable: from this phase on, no `DB_VERSION` change in v2.0, and the export-first row is on Mark's List before the first device build that can save. Save goes through the research's one-transaction `repository.createRecipeWithVersion` over recipes, versions and drafts, proven by a forced-failure test. The research's slice order for this phase: steps and their allocation, then add, remove and move, then save, then print. STRUCT-01's row half extends Phase 10's row removal: once steps use rows, removing a row prunes the `uses` that name it, removing a step prunes the portions that name it, and no removed step's key is handed out again (`nextStepKey`). Decision 10 settles removal at creation; STRUCT-01 reads the same delete-outright rule for a saved first version with no batch and no child, which nothing outside it points at, and discussion confirms it with Mark. STRUCT-04 leaves the version pen's remove and restore on later versions (Phase 3, 03.6) as it is. WebKit focus for the Move buttons is medium confidence: probe it on the iPad from the production build (`npm --prefix app run build && npm --prefix app run preview -- --host`), never the dev server. The Sheet code is fixed when the version is created (decision 19), so a printed sheet keeps finding its version after any edit, a reorder included. Print is checked as an iPad PDF, not only in Chrome. Every new button, checkbox and radio renders through `ui/Button.jsx`, `Checkbox.jsx` or `Radio.jsx`, every link carries `tabIndex={0}`, and every visual value reads a token.

### Phase 12: Showing a recipe's own scales and problems, and the whole loop

**Goal**: A batch recorded against a created recipe marks the recipe's own scales and problems, which the record pen, the reading and the printed log show, and a recipe created in the app survives the whole loop, checked on the iPad
**Depends on**: Phase 11 (Save and print), and through it Phase 10 (the scales and problems a recipe is created with) and Phase 9 (the scale definitions). Planning waits for the design gate below; decision 3 is answered and decision 4 is closed
**Requirements**: TASTE-04, PROOF-01, PROOF-02
**Success Criteria** (what must be TRUE):
  1. The record pen, the reading and the printed log show the recipe's own scales, each in its kind, and its problems, and "This recipe only" shows only for a recipe that has any
  2. A recipe created in the app round-trips: it prints, a batch recorded against it marks a custom scale, and after export and import it reopens with the same figures, Sheet code and marks
  3. On the iPad, from the production build, a maker creates a recipe end to end, its scales, problems and targets included, and prints it: Tab reaches every creation control, each Move button included, and after a move focus stays with the moved step or row

**Plans**: TBD
**Design gate**: Approved and snapshotted boards for the record pen, the reading and the printed log showing a recipe's own scales and problems, a scale of each kind among them, and showing none (sketches 007, 008 and 010 draw only the fixed declared scales).
**UI hint**: yes
**Notes**: Planning starts with a code read: SEED-261001-iq4 predates later work, and the research reports the "This recipe only" empty state already fixed; the plan restates what the code does now. Bitter's bug row is fixed and done (68ea742: a new version keeps the parent's declared problems), so Bitter needs nothing here. Scales and problems are authored in Phase 10, before Save, and a later version inherits them. A plain magnitude scale is drawn on the record pen, the reading and the printed log for the first time here. PROOF-01 and PROOF-02 close the milestone; device checks run from the production build (`build`, then `preview --host`).

## Progress

**Execution Order:**
Phases execute in numeric order: 8 → 9 → 10 → 11 → 12. Phases 8 and 9 are independent and may run side by side; Phase 10 needs both; Phase 11 needs Phase 10; Phase 12 needs Phase 11, and through it the scales and problems Phase 10 authors.

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 8. Split the recipe page along its jobs | v2.0 | 3/5 | In Progress | - |
| 9. The library and the stored shapes, plus the two places | v2.0 | 0/TBD | Not started | - |
| 10. The creation editor, without Save | v2.0 | 0/TBD | Not started | - |
| 11. Steps, structure, save and print | v2.0 | 0/TBD | Not started | - |
| 12. Showing a recipe's own scales and problems, and the whole loop | v2.0 | 0/TBD | Not started | - |

## Later

**After v2.0.** Not phases yet; each is numbered when its milestone is defined with `/gsd-new-milestone`. From `REQUIREMENTS.md` (Future Requirements) and Mark's v2.0 scope of 2026-10-16:

- Version evolution (structure edits on later versions): structure edits on a later version, and batches recording reordered or new steps. Deferred from Phase 03.5 (Mark, 2026-09-23), from v1.1 (Mark, 2026-10-14) and out of v2.0 (Mark, 2026-10-16), which allows structure edits on a first version only, until it has a batch or a child version.
- Show changes for dropped, added and moved steps and rows.
- Library editing (ING-01): creating and editing library ingredients, with provenance; decide the `importAll` overwrite policy first.
- Bounded transformation calculations (ING-02).
- The storage upgrade path: lift records instead of dropping stores, and show storage failures in the UI.
- Import hardening: the validator edge cases from the v1 audit.
- The Recipe book, Idea log and Kitchen places, and the Recipe book print format.

---
*Roadmap created: 2026-09-05; Milestone 1 archived 2026-10-14; v1.1 archived 2026-10-15; v2.0 phases added 2026-10-16 and revised the same day (the old Phase 10 split into Phases 10 and 11, the two places moved to Phase 9), then again after the Codex review and Mark's answers (scales, problems, style, targets, equipment and process moved to Phase 10; decisions 1 to 15 recorded, 17 added)*
