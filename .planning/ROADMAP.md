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
- [ ] **Phase 9: The library and the stored shapes, plus the two places** - The reviewed library reaches every profile with provenance, every shape creation will store is settled while a reset is still free, and the Ingredients and Notebook places list the library and the recipes
- [ ] **Phase 10: The creation editor, without Save** - A maker starts a recipe from the Notebook with only a name, authors its rows, version line and Before you start against live figures, and can Resume it; nothing is saved yet
- [ ] **Phase 11: Steps, structure, save and print** - A maker authors and shapes the new recipe's Instructions steps, saves it as its first version and prints it as a bench sheet
- [ ] **Phase 12: A recipe's own scales, and the whole loop** - A new recipe gets its own scales and problems, targets, equipment and process, and a created recipe survives print, batch, export and import on the iPad

## Before planning

These gates apply to the v2.0 phases below.

**The reset window.** Until a recipe can be saved, the store can still reset to a new shape, because it holds no real recipe. That ends in Phase 11, when Save lands and creation becomes saveable. Phase 10 builds the creation editor with deliberately no Save: a creation there is only its draft, nothing real is stored, and the window stays open through it. Phase 9 still holds every stored-shape change v2.0 needs (the library seed and entry shape, the scale definitions, the `create` draft kind) and the milestone's only database version change (9 to 10). From Phase 11 on, no phase or quick task changes `DB_VERSION`; a later shape change lifts records instead of dropping them. Before the first device build that can save a recipe (Phase 11's), Mark's List carries a row asking Mark to export his data.

**The design gate.** No sketch in `.planning/sketches/` (001 to 011) draws any surface v2.0 adds. Impeccable owns design and GSD phases consume approved boards: each new surface is drawn on a Claude Design canvas, approved by Mark, and snapshotted into `.planning/sketches/` before the phase that builds it is planned. Plans cite the snapshot by path, and conformance is measured side by side in WebKit, never argued from prose. Phase 8 changes no screen and has no design gate; Phases 9, 10, 11 and 12 each list the surfaces they wait for. Phase 9's two place boards are independent of Mark's coefficient and scale decisions, so they can be drawn while those decisions wait.

**Mark's open decisions.** Listed in `research/SUMMARY.md` and not resolved here. Each is answered by Mark before or during the discussion of the phase it blocks.

| # | Decision | Blocks |
|---|----------|--------|
| 1 | Library coefficient conflicts: dextrose basis, salt 580 or 586, fructose POD, strawberries, skim milk powder, and coconut milk and heavy cream (possibly different products) | Phase 9 |
| 2 | The Phase 6 D-05 amendment: clear the library on the version bump, or top it up | Phase 9 |
| 3 | Scale kind: goldilocks with a fixed "right" middle, or plain magnitude | Phase 9 (the definition's shape), Phase 12 |
| 4 | Bitter's fate, once Mark answers the open bug row `bug-new-version-loses-declared-defects` | Phase 9 (SCALE-03), Phase 12 |
| 5 | Scale shape: both shapes read side by side with no reset, or objects only with a reset (check the devices for real batches first). A reset conflicts with LIB-06 as written | Phase 9 |
| 6 | Creation draft persistence in v2.0 (REQUIREMENTS.md lists it as MAKE-11) | Phase 9 (the draft kind), Phase 10 |
| 7 | An ingredient not in the library: stop with a message, or a name-only row with limited figures. A name-only row is a new row shape, so it would land in Phase 9 | Phase 10 (Phase 9 for a name-only row) |
| 8 | The version name on a blank start | Phase 10 |
| 9 | What reordering rows means when the table reads in step order (STRUCT-02 says rows within a step) | Phase 11 |
| 10 | Removing a row or step at creation: delete it outright, or flag it | Phase 10 (a row), Phase 11 (a step) |
| 11 | Target bands pre-filled, or blank | Phase 12 |
| 12 | Structure after the first save: a review step before Save, an editable first version with no batches, or accept the limit (STRUCT-04 says saved versions show no structure controls) | Phase 11 |
| 13 | Whether recipe names must be unique | Phase 10 |
| 14 | One description or two (the recipe record and the Sheet each have one) | Phase 10 |
| 15 | A `libraryId` link on rows, or record it as deferred (LIB-08 states the link) | Phase 9 |
| 16 | The `importAll` overwrite policy | No v2.0 phase: library editing is out of v2.0; decide before library editing |

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
**Plans**: TBD
**UI hint**: yes
**Notes**: No screen changes, so no design gate and no UI-SPEC. The walk is `.planning/milestones/v1.1-phases/05-split-the-recipe-page/05-walk.mjs` with its baseline `05-walk-before.json`, recorded at 4f1f98f before Phases 6 and 7 and later quick tasks landed: first confirm the baseline still matches at this phase's base commit, and if it does not, record a new before-walk there, as 05-01 did, before any code moves. The walk dumps the versions, batches, recipes and drafts stores, not the library, so Phase 9's larger library does not disturb it; the objects-only scale option would rewrite the seeded versions it dumps, so in that case finish this phase's walk before Phase 9 merges or re-record the baseline on Phase 9's result. Phase 9's `create` draft kind and this phase's kept-draft cut both touch the draft restore path; whichever lands second builds on the first. The research disagrees on when to extract record loading (early or late); settle it in discussion. The batch-recording controller is not among EDIT-05's jobs and creation does not need it; it can stay in place if the split runs long.

### Phase 9: The library and the stored shapes, plus the two places

**Goal**: While a reset is still free, every shape creation will store is settled: the reviewed ingredient library, with provenance, reaches every profile without touching a recipe, and a recipe's own scale definitions travel into the batches made from it. Beside them the two places open: the Ingredients place shows that library, read-only, and the Notebook place lists the recipes
**Depends on**: Phase 7 (v1.1, shipped). Independent of Phase 8. Planning waits for Mark's decisions 1, 2, 3, 5, 6 and 15, his answer on the Bitter bug row (decision 4), decision 7 as well if he picks a name-only row, and the design gate below
**Requirements**: LIB-04, LIB-05, LIB-06, LIB-07, LIB-08, SCALE-03, PLACE-01, PLACE-02
**Success Criteria** (what must be TRUE):
  1. The library holds the reviewed dataset's entries beyond the current 26, each with its source and basis; the 26 existing entries keep their current values; a test fails on any same-ingredient conflict that has no recorded decision; and a dairy entry from the dataset counts its lactose once in PAC and POD
  2. A profile holding the version-9 library opens at database version 10 with the larger library, and every recipe, version and batch it held is untouched with its figures unmoved, proven from a stored version-9 profile in a real IndexedDB; and nothing creation stores changes shape after this phase: the drafts store keeps a creation draft (a `create` kind with its own fit check) instead of deleting it on restore, and a test fails if any later upgrade deletes a store for a profile at version 10 or above
  3. A row built from a library entry keeps the id of the entry it came from through save, export and import, and changing that entry afterwards moves no stored figure
  4. A batch keeps the scale definitions of the version it was made from: changing or removing a scale on a later version moves none of its stored marks, through export, import and reopening; olive oil's Body and Oil scales and its 2 Aug batch read as before
  5. The Ingredients place lists the library, read-only, with search by name and category, and the Notebook place lists the recipes; neither starts a recipe or changes a library entry
**Plans**: TBD
**Design gate**: Approved and snapshotted boards for the Notebook place (the recipe list) and the Ingredients place (the library, read-only, with search by name and category). None is drawn yet. Both are independent of Mark's coefficient and scale decisions, so their boards can be drawn while those decisions wait.
**UI hint**: yes
**Notes**: This is v2.0's only database version change and it must land before Phase 11 can save a recipe. The converter runs offline once (a node script reading `~/Downloads/sprinkles-ingredient-seed-db.json`) and commits a reviewed module; nothing is fetched or parsed at runtime. The 26 existing keys must not change, because the seeded recipe files import entries by key (`data/library.js` holds 26 entries, counted 2026-10-16; the "12" in parts of the research is the olive oil recipe's row count). The dextrose and salt bases may need one research pass. The version-10 clear also removes library records an import wrote; that is harmless while the library is read-only, and is to be recorded in `db.js` and tested. If Mark picks the objects-only scale shape with a reset, LIB-06 ("no recipe, version or batch touched") must be amended in `REQUIREMENTS.md` first, and the reset rewrites the seeded versions the Phase 8 walk dumps. If he picks both shapes side by side, SCALE-03 no longer needs a reset and could move later, beside Phase 12's scales; it sits here so the roadmap is safe under either answer. Criterion 2's draft kind is groundwork for MAKE-11, which Phase 10 delivers. The places replace today's placeholders at `/notebook` and `/ingredients` (`router.jsx`). The Notebook place lists the recipes and starts nothing: there is no creation editor until Phase 10, which adds the New recipe entry. The Ingredients place reads the library through the repository seam and never writes it; its search is the research's pure `filterLibrary(records, query, category)`, which Phase 10's picker reuses. The Phase 8 walk visits only version and batch routes under `/notebook/:recipeId/`, so the places do not disturb it. Every new button, checkbox and radio renders through `ui/Button.jsx`, `Checkbox.jsx` or `Radio.jsx`, every link carries `tabIndex={0}`, and every visual value reads a token.

### Phase 10: The creation editor, without Save

**Goal**: A maker can start a blank recipe from the Notebook with only a name, write its name and description, its version line and its Before you start, pick its rows from the library with grams and live balance figures, and come back to a half-made recipe after closing the tab; there is deliberately no Save, so nothing real is stored yet
**Depends on**: Phase 8 (the shared editor) and Phase 9 (the settled shapes, the larger library, the `create` draft kind and the Notebook place). Planning waits for the design gate below and Mark's decisions 6, 7, 8, 10, 13 and 14
**Requirements**: MAKE-04, MAKE-05, MAKE-06, MAKE-08, MAKE-11
**Success Criteria** (what must be TRUE):
  1. The Notebook place offers New recipe, and a maker starts a blank recipe from it by giving only a name; the creation editor opens on that recipe
  2. While creating, the maker writes the recipe's name and description, its version line and its Before you start notes
  3. While creating, the maker picks rows from the library, enters grams and removes a row, and the balance figures follow each change
  4. A half-made recipe survives a closed tab: the Notebook offers Resume and reopens it as it was left, and abandoning it leaves no record behind
  5. There is no Save: however far a creation goes, the Notebook lists no new recipe, and the only record a creation writes is its draft
**Plans**: TBD
**Design gate**: Approved and snapshotted boards for the creation editor (name and description, version line, Before you start, rows and the live Balance, a row's Remove included, since this phase removes a row), the ingredient picker, and the Notebook's New recipe and Resume. None is drawn yet.
**UI hint**: yes
**Notes**: No Save, by design: Save lands in Phase 11, once steps exist (see its Notes). A creation in this phase is only its `create` draft (Phase 9's kind, which Resume reads), so nothing real is stored, the reset window stays open through this phase, and no device build from it can save a recipe. The New recipe entry on the Notebook place is added here; Phase 9 built the list. The research's slice order for this phase: a `creating` mode on the shared Sheet with no baseline, then the picker and rows, then Resume. The root version `createRecipe` builds has no steps (`method: []`), while `rowFromLibraryRecord` gives a row's one portion `step: 1`, so until Phase 11 adds steps a creation row's portion names a step that does not exist; discussion settles what the editor shows for such a row, and Phase 11's allocation settles the reference before anything is saved. Removing a row here prunes nothing, because no step uses a row yet; STRUCT-01's no-dangling-reference rule takes over in Phase 11. The picker reuses Phase 9's search and is measured at 393 and 1366 with the larger library. Import is refused while creation holds ink. Every new button, checkbox and radio renders through `ui/Button.jsx`, `Checkbox.jsx` or `Radio.jsx`, every link carries `tabIndex={0}`, and every visual value reads a token. Device checks run from the production build (`npm --prefix app run build && npm --prefix app run preview -- --host`), never the dev server.

### Phase 11: Steps, structure, save and print

**Goal**: A maker can author the new recipe's Instructions steps with the rows each uses, add, remove and reorder its steps and rows, save it as the recipe's first version, and print it as a bench sheet
**Depends on**: Phase 10 (the creation editor). Planning waits for the design gate below and Mark's decisions 9, 10 (for a step) and 12
**Requirements**: MAKE-07, MAKE-10, MAKE-12, STRUCT-01, STRUCT-02, STRUCT-03, STRUCT-04
**Success Criteria** (what must be TRUE):
  1. While creating, the maker writes Instructions steps (lead-in, text, targets) and says which rows each step uses and in what portions, and the balance figures still follow
  2. While creating a first version, the maker adds and removes steps and rows, and moves steps, and rows within a step, with Move up and Move down by touch and by keyboard; no removal leaves a dangling reference, and no move changes a step's stored number or a row's id
  3. Save creates the recipe and its first version in one step and lands on the new page, after which the Notebook lists the recipe and no longer offers Resume for it; a failed save leaves neither recipe nor version behind
  4. A saved version, the new one included, shows no Add, Remove or Move control
  5. The created recipe prints as a bench sheet with its Sheet code, like the seeded ones, and typing that code finds it
**Plans**: TBD
**Design gate**: Approved and snapshotted boards for the creation editor's Instructions steps with their uses and portions, and the Add, Remove, Move up and Move down controls for steps and rows. None is drawn yet.
**UI hint**: yes
**Notes**: Why Save lives here and not in Phase 10: structure cannot be added after the first save (STRUCT-04, and structure edits on later versions are out of v2.0), so a recipe saved before it had steps could never gain them; Save must not land before steps exist. This is where the reset window closes, because a recipe becomes saveable: from this phase on, no `DB_VERSION` change in v2.0, and the export-first row is on Mark's List before the first device build that can save. Save goes through the research's one-transaction `repository.createRecipeWithVersion` over recipes, versions and drafts, proven by a forced-failure test. The research's slice order for this phase: steps and their allocation, then add, remove and move, then save, then print. STRUCT-01's row half extends Phase 10's row removal: once steps use rows, removing a row prunes the `uses` that name it, removing a step prunes the portions that name it, and no removed step's key is handed out again (`nextStepKey`). The developing pen already removes and restores rows and steps on a saved version (Phase 3, 03.6), so discussion reads STRUCT-04's "no Remove" against it, alongside decision 12. WebKit focus for the Move buttons is medium confidence: probe it on the iPad from the production build (`npm --prefix app run build && npm --prefix app run preview -- --host`), never the dev server. The Sheet code changes under reorder; print follows Save, when no structure control is left. Print is checked as an iPad PDF, not only in Chrome. Every new button, checkbox and radio renders through `ui/Button.jsx`, `Checkbox.jsx` or `Radio.jsx`, every link carries `tabIndex={0}`, and every visual value reads a token.

### Phase 12: A recipe's own scales, and the whole loop

**Goal**: A maker can give a new recipe its own scales and problems and its balance targets, equipment and process, record a batch against them, and a recipe created in the app survives the whole loop, checked on the iPad
**Depends on**: Phase 11 (the creation editor with Save) and Phase 9 (the scale definitions). Planning waits for the design gate below, Mark's decisions 3 and 11, and his answer on the Bitter bug row (decision 4)
**Requirements**: MAKE-09, SCALE-01, SCALE-02, SCALE-04, PROOF-01, PROOF-02
**Success Criteria** (what must be TRUE):
  1. While creating, the maker authors balance targets, equipment and process, or leaves any of them empty, and an empty one reads, prints and records with no gap or error
  2. While creating, the maker defines 0 to 2 scales, each with a name and a label for each end, and 0 to 2 problems
  3. The record pen, the reading and the printed log show the recipe's own scales and problems, and "This recipe only" shows only for a recipe that has any
  4. A recipe created in the app round-trips: it prints, a batch recorded against it marks a custom scale, and after export and import it reopens with the same figures, Sheet code and marks
  5. On the iPad, from the production build, a maker creates a recipe end to end and prints it: Tab reaches every creation control, each Move button included, and after a move focus stays with the moved step or row
**Plans**: TBD
**Design gate**: Approved and snapshotted boards for authoring scales and problems in the creation editor; the record pen, the reading and the printed log showing a recipe's own scales and showing none (sketches 007, 008 and 010 draw only the fixed declared scales); and authoring balance targets, equipment and process.
**UI hint**: yes
**Notes**: Planning starts with a code read: SEED-261001-iq4 predates later work, and the research reports the "This recipe only" empty state already fixed and Bitter living only in olive oil's `declaredFlaws`; the plan restates what the code does now. Bitter is not touched until Mark answers its bug row. Scales and problems are authored at creation only, and a later version inherits them. PROOF-01 and PROOF-02 close the milestone; device checks run from the production build (`build`, then `preview --host`).

## Progress

**Execution Order:**
Phases execute in numeric order: 8 → 9 → 10 → 11 → 12. Phases 8 and 9 are independent and may run side by side; Phase 10 needs both; Phase 11 needs Phase 10; Phase 12 needs Phase 11.

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 8. Split the recipe page along its jobs | v2.0 | 0/TBD | Not started | - |
| 9. The library and the stored shapes, plus the two places | v2.0 | 0/TBD | Not started | - |
| 10. The creation editor, without Save | v2.0 | 0/TBD | Not started | - |
| 11. Steps, structure, save and print | v2.0 | 0/TBD | Not started | - |
| 12. A recipe's own scales, and the whole loop | v2.0 | 0/TBD | Not started | - |

## Later

**After v2.0.** Not phases yet; each is numbered when its milestone is defined with `/gsd-new-milestone`. From `REQUIREMENTS.md` (Future Requirements) and Mark's v2.0 scope of 2026-10-16:

- Version evolution (REC-03 and REC-05 on later versions): structure edits on a later version, and batches recording reordered or new steps. Deferred from Phase 03.5 (Mark, 2026-09-23), from v1.1 (Mark, 2026-10-14) and out of v2.0 (Mark, 2026-10-16), which allows structure edits at the creation of a first version only.
- Show changes for dropped, added and moved steps and rows.
- Library editing (ING-01): creating and editing library ingredients, with provenance; decide the `importAll` overwrite policy first.
- Bounded transformation calculations (ING-02).
- The storage upgrade path: lift records instead of dropping stores, and show storage failures in the UI.
- Import hardening: the validator edge cases from the v1 audit.
- The Recipe book, Idea log and Kitchen places, and the Recipe book print format.

---
*Roadmap created: 2026-09-05; Milestone 1 archived 2026-10-14; v1.1 archived 2026-10-15; v2.0 phases added 2026-10-16 and revised the same day (the old Phase 10 split into Phases 10 and 11, the two places moved to Phase 9)*
