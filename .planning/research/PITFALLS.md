# Pitfalls Research

**Domain:** Adding recipe creation (first version authored from scratch) to the existing Sprinkles app: React 19 + Vite 8 + JSX, react-router 8, idb 8 over IndexedDB, Vitest 5; iPad WebKit is the real device; the printed bench sheet is the working surface.
**Researched:** 2026-10-15
**Milestone:** v2.0 Recipe creation (subsequent milestone; nothing here is generic web advice)
**Confidence:** HIGH for pitfalls grounded in code read this session (paths cited per item); MEDIUM for the WebKit behaviours (vendor bug reports, not Apple docs, flagged inline); LOW only where marked "unverified".

## How to read the phase labels

The roadmap does not exist yet, so each pitfall names a **working phase label**. The roadmapper should map them onto real phase numbers (v1.1 ended at Phase 7).

| Label | Working scope |
|-------|---------------|
| **P-Split** | Finish the `RecipePage` split; the maker sees no change |
| **P-Library** | Settle the coefficient conflicts, expand the library seed, record provenance |
| **P-Scales** | Recipe-defined scales and problems: the data shape, snapshot, validation |
| **P-Create** | Creation core: domain operations for add/remove/reorder, creation draft, atomic save, the editor in create mode |
| **P-Entry** | Notebook "new recipe" entry, the remaining sections (targets, equipment, process, Before you start), print of a fresh recipe |
| **P-Ingredients** | Read-only `/ingredients` place |
| **P-UAT** | Device walk on the iPad, WebKit first, one check at a time |

Ordering constraint the pitfalls below keep returning to: **P-Library and P-Scales (anything that changes a stored shape or the seed) must land before P-Create makes a recipe saveable on the iPad**, because the reset-not-migrate stance ends the day a real recipe can exist (Pitfall 5).

---

## Critical Pitfalls

### Pitfall 1: The creation draft is deleted by the code that restores drafts

**What goes wrong:** The maker types a long creation form, closes the tab or leaves for the bench, and comes back to an empty form. Or Home never offers "Go to draft" for it.

**Why it happens:** Every draft path in the app assumes the version already exists in the store.
- `RecipePage.jsx` restores a draft only after `version` has loaded; when `draftMatchesVersion(record, version, batches)` is false it calls `repository.deleteDraft(versionId)` "quietly" (restore effect, ~line 500).
- `domain/draft.js` `KINDS = ['plan', 'record', 'amend']`; an unknown kind fails the match. `fitsPlanShape` requires the payload to hold "exactly this version's rows and steps", so a draft with an added row or step cannot fit a version that has fewer.
- `ui/RecipeList.jsx` (Home) keeps a draft only when `versions.find(v => v.id === record.versionId)` exists, so a creation draft is invisible on Home.
- The drafts store is keyed by `versionId` (`db.js`: "one unsaved draft per version"). A creation draft has no version yet.

**How to avoid:**
1. Add a `create` draft kind with its own fit check that does not look for a stored version. Teach `draftMatchesVersion`, Home's filter and the restore path about it, or give creation its own restore path so the version-keyed one never sees it.
2. Allocate `recipeId` and `versionId` once, when the creation screen opens, and keep them inside the draft. Save is then idempotent (same ids), which also covers a double-tap on the iPad.
3. One creation draft slot per device, not one per visit. If every visit to the new-recipe route allocates a new id and writes a draft once dirty, older creation drafts become orphans no screen lists. The Notebook entry should read "Continue new recipe" when a creation draft exists; Cancel is the explicit discard.
4. Keep the existing rule that a pen never dirtied writes nothing (`draftStoredRef`), so merely opening the screen leaves no draft.
5. Reuse the debounce, `pagehide`/`visibilitychange` flush and the "Save and Cancel drop the pending write" ordering exactly as `flushPendingDraft` and `discardDraft` do. Do not re-derive them.

**Warning signs:** A jsdom test that reloads the creation page passes only because it seeds the draft after the version exists. Home shows no draft lead after typing in creation. `draftMatchesVersion` is called with `version === undefined` anywhere.

**Phase to address:** P-Create (draft kind and restore); P-Entry (the "Continue" affordance). Prove with a reload test against a real fake-indexeddb repository, then once on the iPad.

---

### Pitfall 2: Creating a recipe is two writes today; a failure between them leaves an orphan

**What goes wrong:** `saveRecipe` and `saveVersion` are separate `put`s (`repository.js`). If the second fails, or the tab closes between them, the store holds a recipe with no version (or a version with no recipe). Home's lead card reads `entry.latestVersion`; a recipe with no versions is the shape the rest of the app never expected. Separately, the draft delete is a third write, so a half-finished save can leave both the draft and the recipe.

**Why it happens:** Every existing save writes one record (a child version) or one batch. Creation is the first save that must write a recipe, a version and a draft deletion together.

**How to avoid:**
- Add one repository method (working name `createRecipeAtomic`) doing one readwrite transaction over `['recipes','versions','drafts']`, written in the abort-and-quiet shape `importAll` already uses (a put the store cannot clone throws before it queues; abort by hand or the queued puts commit).
- Do it through the seam only; `idb` stays imported by `store/db.js` alone.
- Hold the save lock the way `versionSaveLockRef` does for Save as a new version, and clear the pending debounced draft write first so a keystroke just before Save cannot write the draft back after it was deleted (the exact race `discardDraft` documents).
- Close audit item W1 from v1.1 is still open: `creation-roundtrip.test.js` runs `createRecipe` output through `validateStoreFile` only, never through a real fake-indexeddb round trip. Add the round-trip test with this method.

**Warning signs:** Two `await repository.save...` lines in a save handler. A creation test that mocks the repository. A recipe visible in `listRecipes()` but absent from Home after a forced failure.

**Phase to address:** P-Create.

---

### Pitfall 3: Reconciling the dataset conflicts by picking numbers, not by deciding what each number means

**What goes wrong:** Dextrose PAC 174.8 vs 190 and salt 586 vs 580 are resolved by overwriting one with the other, or the whole 103-row seed is converted by script and trusted. Figures then move for existing recipes, or two recipes using "dextrose" disagree, or the Ingredients place shows a value that no stored version carries.

**Why it happens (all verified in the files):**
- The two candidates are **different bases, not just different numbers.** `data/library.js` stores dextrose as `sugar: 1, pac: 190` (a solids-basis constant with the sugar share at 1). The seed DB (`~/Downloads/sprinkles-ingredient-seed-db.json`) stores `sugars_pct: 92, pac: 174.8` "as-is" (190 x 92% solids). Mixing 174.8 with `sugar: 1`, or 190 with `sugars_pct 92`, double-counts or drops the 8% bound water.
- **The seed DB contradicts itself.** Its `pac_provenance` says "calculated as-is ... x 92% solids" while its note says "PAC 190 on solids basis (=174.8 if water folded in - do NOT)". One row, two instructions.
- **Salt is a science question, not a transcription.** The seed DB's own note flags 586 as ignoring NaCl dissociation (true effect near 1170 by van't Hoff) and says "verify the convention before shipping". The existing library uses 580. Choosing 586 vs 580 does not answer it.
- **Ids collide.** The library's keys (`dextrose`, `salt`, `sucrose`, camelCase for others like `wholeMilk`) overlap the seed DB's ids (`dextrose`, `salt`, `sucrose`, kebab-case for others such as `butter-unsalted`). Same id, different record.
- **Unit conventions differ.** The Ice Ed export is name-keyed per-gram fractions; the library header records that pac/pod were converted by hand (x100, sucrose = 100). A scripted conversion that is off by 10 or 100 on one field type will look plausible on every row.
- **Basis vocabulary.** `library.js` defines `inherited` as "seed data, never reviewed", and `IngredientTable.weakestRowBasis` treats a missing basis as `inherited`, which lights the "unreviewed" flag. Bulk rows tagged `stated` would launder unreviewed numbers into trusted ones.

**How to avoid:**
1. Put each conflict to Mark as a decide row with the basis spelled out in plain words; do not let research or a plan resolve it (the register governs, Mark decides). Record the choice and the reason next to the value as provenance.
2. Keep the existing twelve-plus entries' coefficients **unchanged by id**: a test that pins every current `data/library.js` entry to its present values, and the existing "nine printed-sheet figures" parity test over the seeded recipes must stay green untouched.
3. New seed rows get new ids and never replace an existing id. A conflict row carries both values in its provenance note, with one chosen as the value.
4. Write the dataset conversion as a pure, tested module with known-answer rows (sucrose = 100 PAC and POD, dextrose both ways, salt) instead of a one-off script; commit its output as data, and keep runtime free of network (TRUST-01).
5. Bulk rows get `inherited` (or `estimated`) per field with the source citation (`Goff 3.4`, `Mullan 2`, `USDA`, `legacy .iei`) kept; none is `stated` unless a label or a reference supports it.
6. Keep a library-vs-embedded display rule in the design brief: a stored version's row shows the coefficients it embeds; the Ingredients place shows the library's. Where they differ (dextrose after a reconciliation), say so in words rather than letting the two disagree silently.

**Warning signs:** A diff that changes a number in `data/library.js` for an existing key. A seed-coverage test that counts rows but does not compare values. Any figure on the churned olive oil version or its 2 Aug batch moving by a hair. A conversion script with no tests.

**Phase to address:** P-Library, gated on Mark's decisions before planning (the decision rows go on Mark's List first).

---

### Pitfall 4: The expanded seed never reaches the device that already has a library

**What goes wrong:** Tests pass on a fresh fake-indexeddb, the build looks right on a clean profile, and Mark's iPad (already seeded at database version 9) keeps its old library forever. The read-only Ingredients place shows 12 entries on the device and 100+ in tests.

**Why it happens:** `repository.seedLibraryIfEmpty` seeds only when the library holds no record, and `store/seed.js` documents that as a decision: "a library holding any record is never topped up (D-05)". Expanding the seed contradicts that recorded decision. v1.1 checked a v8 profile on the iPad, not a v9 profile with an old library.

**How to avoid:**
- Revise D-05 explicitly (a decision-log entry, not a quiet code change). Options for the plan to choose between with Mark: a versioned top-up that adds only ids the library lacks and never touches an existing id (preferred; consistent with Pitfall 3); or a database bump with a library-only repopulate branch.
- Whatever the choice, it must run in one transaction (the property `seedLibraryIfEmpty` already has) and must be idempotent after an interrupted boot.
- Test it from a **stored v9 profile holding the old twelve entries**, not from empty. Then check on the iPad profile.
- `importAll` puts library records by id, so importing a pre-expansion file onto an expanded library overwrites reconciled values with the old ones (this is the open W3 audit item). With library editing out of scope this is low risk, but the Ingredients place makes the overwrite visible, so keep the "decide before library editing" note and add a test that records the current behaviour.

**Warning signs:** The seed change is entirely in `data/` plus a changed count in `seed.test.js`. No test constructs a profile before seeding the new rows. The iPad UAT step says "open Ingredients" without first stating what the device held.

**Phase to address:** P-Library; device check in P-UAT.

---

### Pitfall 5: The reset-not-migrate window closes the day a recipe can be created

**What goes wrong:** Mark creates a real recipe on the iPad during v2.0 UAT. A later phase in the same milestone (or a quick task) bumps `DB_VERSION`, and a returning profile loses it. Or the opposite: a shape change that should have been done as a reset while it was free (declared scales, library entry shape, draft kind) is left for a lift that nobody has written.

**Why it happens:** `db.js` resets only profiles below 8 (`oldVersion > 0 && oldVersion < 8`), and says so: "records Mark makes from now on are real, so a later bump must not inherit this wipe". PROJECT.md states the reset stays "until a recipe can be created from scratch". That moment is the end of P-Create, not the end of the milestone (retro lesson 4). A second hazard: the `blocking` handler closes the connection and reloads the other tab when a newer build opens, so a creation form with a lot of ink is reloaded and loses up to the last 250 ms.

**How to avoid:**
1. List every stored-shape change v2.0 needs (library entry fields, declared scale shape, draft `create` kind, any new field on a version) and land them all **before** the first phase that makes creation saveable on a device. Prefer shape changes that need no bump (additive fields, a new draft kind in the existing store).
2. If a bump is unavoidable, do it once, early, with the reset branch's bound stated in the code comment in words, and add a test that fails if the upgrade deletes any store for a profile at or above the new floor.
3. Put a Mark's List row before the first build that includes creation: "Export your data before pulling this build." Export and import exist (`exportAll`/`importAll`, one transaction each).
4. Tell Mark, in plain words in the milestone roadmap, which phase ends the reset stance.
5. Treat `blocking` during an open creation draft as a known limit: the draft survives (it is in the drafts store) but only up to the debounce; flush on `visibilitychange` as the existing code does.

**Warning signs:** `DB_VERSION` changes in any phase after P-Create. An upgrade branch that deletes stores without an `oldVersion` bound. A phase plan that says "migration later".

**Phase to address:** Roadmap ordering (P-Library and P-Scales before P-Create); enforced in P-Create's verification.

---

### Pitfall 6: Step identity at creation: key reuse, dangling references and shipped `removed` flags

**What goes wrong:** A step's stored number `n` is its identity (`stepNumbers.js`), referenced by every row's `portions[].step` and by nothing else; rows are referenced by `id` from steps' `uses` lists. Creation add/remove/reorder breaks one of these quietly:
- Hard-deleting a step and then adding one reuses its key (`nextStepKey` scans only the live array, by design with no stored counter). Any portion still pointing at the old key now silently attaches to the new step. An "undo delete" resurrects a step whose key a new step already holds.
- Deleting a row leaves its id in steps' `uses` lists; deleting a step leaves portions on a key no step has (they land in IngredientTable's "Unallocated" group, which exists as a safety net, not as a state a first version should ship in).
- Using the existing remove flag at creation ships `removed: true` steps and lines inside a root version that has no parent, so the first version carries "Removed" groups in its own reading.
- `rowFromLibraryRecord` defaults `step = 1`. If rows are added before any step exists, every portion points at a step that does not.
- Row ids derived from array length or position (`row-NN`) get reused after a delete. Use `freshId`.

**Why it happens:** The pen so far only edits what exists. `penDraft.js` has no step-add or row-add operation (v1.1 audit W2: "v2's step-add must call nextStepKey"), and `penDraftRows` and `blockedSaveMessage` iterate the stored version's rows, not the draft's (Pitfall 7).

**How to avoid:**
- Build creation operations in a pure module under `app/src/domain/` (add/remove/reorder step, add/remove/reorder row, set a portion's step) on top of `nextStepKey` and `rowFromLibraryRecord`; no framework, DOM or store import, node-environment tests.
- Within the creation session, **flag, don't delete**, using the existing remove machinery, and compact once at save in one operation: drop removed steps/lines/rows, prune `uses` of dropped row ids, reject any portion whose step is not in the method. Do not renumber the surviving keys (gaps are harmless because display numbers are derived).
- Keep a session high-water key in the draft if any path can delete in-session, so `nextStepKey`'s "never reuse" holds across undo.
- A property-style test: after any random sequence of add/remove/reorder/undo, every `portion.step` is a key in the method, every `uses` id is a row id, keys are unique, and no key is reissued.
- Decide in the brief what "no step yet" means for a row (a null step state that blocks Save, or a required first step at row-add time), instead of leaning on `step = 1`.

**Warning signs:** `method.length + 1` or `rows.length + 1` as an id. `filter(...)` removing a step from the array in a handler. A save that does not call a compaction function. A fresh recipe whose table shows an "Unallocated" or "Removed" group.

**Phase to address:** P-Create.

---

### Pitfall 7: The editor's validators, builders and diff UI all assume a stored parent

**What goes wrong:** Reusing the shared editor for creation by feeding it a blank "version" produces silent data loss and noise:
- `lineage.js` `blockedSaveMessage` walks `version.rows` (the stored rows) to find a blank or non-numeric amount. A row added in the session is not in `version.rows`, so a blank amount on it is never reported.
- `penDraft.js` `penDraftRows` maps `version.rows` and, when a draft amount is blank or unparsable, falls back to "that portion's own stored amount". For a row with no stored amount, that fallback is `undefined` or whatever placeholder the blank version carries: a blank saves as 0 g or NaN. The project's rule is that blank stays distinct from zero (Phase 2 key decision) and "needs an amount, or remove it" must fire.
- The pen seeds `reason`, `citedBatchId` and the lineage line "naming its parent and the batch" from a parent; the strike-old-value markup, "was 40 g, now 48 g" accessible names, `isPenDraftDirty(mode, penDraft, version)` and Show changes all read a baseline. With a placeholder baseline every field reads as changed, with empty "was" text.
- The save ceremony's version-line gate (`versionLineUnique`) is built around a scoped list of sibling versions; a root has none.

**Why it happens:** The two sides share one component because Mark asked for one editor. The seam that makes that safe is "a baseline or no baseline", which does not exist in the code today.

**How to avoid:**
- Give the editor an explicit `baseline = null` mode: no diff markup, no struck values, no lineage line, no reason/cited-batch fields, and its own dirty check against a blank draft.
- Make validators and builders iterate the **draft's** rows (the draft already keys rows by id), not `version.rows`. Add a test that a session-added row with a blank, "abc" and "-1" amount each blocks Save with the existing sentences.
- In creation, no amount fallback: a blank amount blocks (never 0, never NaN).
- Keep the form's own pre-validation: `createRecipe`, `rowFromLibraryRecord` and `nextStepKey` throw `TypeError`/`RangeError` for caller bugs by design (memory: throw for caller bugs, messages for maker input). The form must turn blank name, blank version line, no rows, a duplicate id and so on into the plain sentences before calling them, so a maker never reaches an uncaught throw.
- Edit-mode renders **no** Add/Move/Hard-remove controls. Structure edits on later versions are explicitly out of v2.0 (no batch-recording of changed structure, no Show changes for added/moved steps). A test on rendered markup for a saved version pins their absence. Because the editor is shared, this is the easy way for scope to leak.

**Warning signs:** `version.rows.map` or `version.rows` in a function the creation path calls. A snapshot of the creation screen containing the word "was". A creation test that never types an invalid amount into an added row.

**Phase to address:** P-Split (design the baseline-or-none seam while splitting) then P-Create (implement).

---

### Pitfall 8: Splitting the 1,837-line `RecipePage` changes behaviour without anyone noticing

**What goes wrong:** The maker sees a change (focus lost, a pen that no longer restores, a hover state, a fold default), or a hook-order crash appears only in one state.

**Why it happens (verified in the file and the tests):**
- Hook order is load-bearing: comments say hooks "must sit above the early returns" (`useBelowDesktop`, `useFold`, the effects at ~lines 500–700). Moving a region that contains hooks below a conditional return, or into a component rendered only when `version` has loaded, changes hook order between renders.
- The effects form a chain: restore waits on `version` + `batchesLoaded`; `startTasting` and `startNextVersion` wait on `draftRestoreDone`; persist waits on the same flag. Extracting the loader changes when those flags flip.
- `RecipePage.shell.test.js` pins the shell with **negative** source assertions (`not.toMatch(wholeWord(D12_SETTERS))`). Code moved out of `RecipePage.jsx` makes those pass vacuously. A split can go green while the thing it protects is no longer covered.
- A creation page has no loaded version. If creation is pushed through a loader hook that returns `undefined` until a version loads, the page stays on its loading state forever.
- The v1.1 retro lesson 3 says to extract the loader hook only when creation (the second consumer) exists, while PROJECT.md says to split first. Doing the loader extraction blind produces the wrong seam.

**How to avoid:**
- Split by job, not by line count. Phase one extracts the regions and the effect groups that do not depend on loading; extract the loader when creation's needs are written down as acceptance criteria (a source that can be "new, unsaved").
- Keep the recorded WebKit before-walk (94 snapshots, v1.1) as the gate: re-run the same walk on the post-split build and require MATCH. No screen changed in v1.1 or since (the only commits after v1.1 are docs), so the recorded before-state is still valid; confirm by checking `git diff` on `app/` since the walk.
- During a "no visible change" split, existing test files may change only in import paths. Any changed assertion is a review flag.
- Add **positive** source assertions (the extracted module exists, exports X, and the shell renders it) next to the negative ones, so moved code stays covered.
- Keep `RecipePageForRoute`'s `key` (`recipeId::versionId::batchId`) and the `onPenOpenChange` import guard intact; the creation route needs the same two properties (own key, registers as a pen so the Shell refuses Import while it is open).
- The v1.1 audit's IN-03 (`removeTasting`/`undoRemoveTasting` read render-time state) was deferred "to v2 creation". If the split touches them, fix with a test; do not carry the latent bug into a new hook.

**Warning signs:** Any `useEffect` inside a conditionally rendered child that previously lived above the early returns. A drop in the number of lines the shell test asserts on. Diffs to `RecipePage.*.test.jsx` beyond imports.

**Phase to address:** P-Split.

---

### Pitfall 9: Recipe-defined scales that resolve by name against a global catalog vanish silently

**What goes wrong:** A maker declares a scale called "Heat". Batches then show no Heat row, marks stored for it disappear from the reading, or editing the recipe's scale wording rewrites how an old batch reads.

**Why it happens:**
- A version's `declaredAxes` is a list of **names** looked up in the fixed `AXES` table (Body, Oil). `axesForBatch` and `axesForVersion` run `.filter((axis) => axis != null)`, so a name that resolves to nothing is dropped without error.
- `store/transfer.js` `validateDeclaredAxes` refuses anything but the declared-pair names (and the old `{name, low, high}` shape), max 2, unique. A custom scale fails import validation.
- `domain/draft.js` `declaredOf` derives allowed axis keys through `axesForVersion`; a custom scale's marks fail `fitsRecordValues` and a kept record draft is deleted.
- `PrintLogPages` and `BatchRow`'s axes grid read the same lookup.
- Marks are keyed by the axis `key`. A key derived from the label collides with a core key (`hardness`, `body`), with `__proto__`, or changes on rename so old marks no longer match.
- The name-reference model is exactly the drift pattern the project fears: change the catalog wording and every stored batch's reading changes.

**How to avoid:**
- Store the **definition** (stable `key`, name, low and high anchor words) on the version and clone it into the batch snapshot (`createBatch` already `structuredClone`s `declaredAxes`/`declaredFlaws`). A batch then reads only its own snapshot, as `axesForBatch` already promises.
- The key is generated once (`freshId`-style or a slug plus uniqueness check), stored, never recomputed from the label, and added to the reserved-name list that `transfer.test.js` pins against `domain/versionRow.js`.
- Update every consumer in one plan, with the list above as the checklist (`axes.js`, `transfer.js` including the batch tasting-versus-snapshot check, `draft.js`, `PrintLogPages.jsx`, `BatchRow.jsx`, the `data/*.js` seeds). A test that a batch with a custom-scale snapshot survives export, import, reopen and a kept-draft restore.
- Existing Body/Oil seeds and olive oil's `declaredFlaws: ['Bitter']` change shape with the model. That is a seeded-data change: it needs the seed to reach the device (Pitfall 4) or a reset while one is still free (Pitfall 5). Do not write a lift for data that exists only as seed.
- One `MAX_DECLARED` constant shared by the UI and `transfer.js` (today the limit of 2 is restated in more than one place). Normalise problem words (trim, case-fold for the uniqueness check) and refuse a word equal to one of the four core `DEFECTS` so two chips never share a label while writing to two different lists (`defects` vs `declaredDefects`).
- Put the open questions in SEED-261001-iq4 to Mark first: definitions per version or per recipe, the free-text name plus two end labels, the fate of the existing Body/Oil, where it is edited. The seed itself says to route to a phase, not a quick task, and to draw the surface first.

**Warning signs:** `AXES.find(` in a new code path. A custom scale test that stops at the editor and never reaches a batch. A marks object with a key no rendered axis owns.

**Phase to address:** P-Scales (model, snapshot, validation); the editing surface rides with P-Entry once drawn.

---

### Pitfall 10: Planning from the seed's stale "bug", and from other aged artifacts

**What goes wrong:** A plan spends effort fixing "This recipe only appears for recipes with nothing recipe-specific" and "Bitter is hard-coded", which the code no longer does.

**Why it happens:** SEED-261001-iq4 is dated 2026-10-01. In current code `BatchRow.jsx` renders the "This recipe only" group only when `declaredProblems.length > 0` (derived from the batch snapshot's `declaredFlaws`), and Bitter is data: olive oil's version carries `declaredFlaws: ['Bitter']`, Mexican Chocolate's carry `[]`. This is the retro's lesson 1 again: check the code before treating an artifact as open work. The same retro records twelve stale verifications at v1 close and one at v1.1.

**How to avoid:** First task of P-Scales: a short code read that restates what exists today (what the empty state does, where Bitter lives) and updates or closes the seed text. Re-run a phase's verifier when a quick task edits files that phase covers.

**Warning signs:** A plan task named after a bug without a failing test that reproduces it today.

**Phase to address:** P-Scales (planning step zero).

---

### Pitfall 11: Reorder that only works with a mouse

**What goes wrong:** Drag-to-reorder works in Chromium and in a desktop review, and fails or fights the OS on the iPad, which is the real device; keyboard users and the Tab path lose reachability; focus vanishes after a move.

**Why it happens (WebKit specifics; MEDIUM confidence, from vendor bug reports):**
- Safari and iOS WebKit do not focus a native button on tap or click, so a "Move up" button that relies on staying focused after it is pressed loses focus; on iOS the browser may blur it asynchronously after the click ([React Spectrum, "Building a Button Part 3"](https://react-spectrum.adobe.com/blog/building-a-button-part-3.html); [WebKit bug 241408](https://bugs.webkit.org/show_bug.cgi?id=241408)).
- Programmatic `focus()` outside a user gesture does not raise the software keyboard on iOS unless a hardware keyboard is attached ([WebKit bug 195884](https://bugs.webkit.org/show_bug.cgi?id=195884)). "Add row, then focus its amount field" from an effect after an async step will focus nothing visible on the iPad.
- Long-press drag on touch collides with text selection and scrolling; HTML5 drag-and-drop on touch is not dependable (unverified for the current iPadOS; verify in the device walk, do not assume).
- The project already learned that WebKit skips untagged controls (D-19): every new button must render through `ui/Button.jsx`, which carries `tabIndex={0}`, and `tabindex-scan.test.js` fails otherwise. Full Keyboard Access stays off, so UAT is tap-then-Tab.

**How to avoid:**
- Reorder is **Move up / Move down buttons** (through `Button`), disabled with the reason at the ends, in the same position as the Remove control. A drag handle, if Mark wants one later, is an addition, not the only path.
- React keys are the stable ids (`step.n`, `row.id`), never the index, so a move relocates the DOM node and the input being edited keeps its cursor; an index key remounts the row.
- After a move, set focus programmatically on the moved item's own Move control (in the click handler, synchronously, not from an effect after an async hop), and announce the new position in the existing live-region/page-status pattern ("Step moved to 2 of 5").
- When adding a row, call `focus()` inside the same user gesture that opened the picker's choice, or accept that the keyboard does not appear and scroll the new row into view.
- Row reorder has a design question that must be answered before building: the table groups lines by step (`groupPortionsByStep`), with entries in stored row order inside each group, so moving a row changes order only within its step group, and the printed sheet and sheet code follow stored order. A flat "reorder rows" control may appear to do nothing across groups.
- Verify in Playwright WebKit (installed), then on the iPad over the LAN from the production build (`build` then `preview --host`), one check at a time, with steps walked first by the agent. A Chromium pass proves nothing here.

**Warning signs:** `draggable`, `onDragStart` or a DnD library in the diff with no button alternative. `key={index}`. Focus restoration implemented in `useEffect`. A new `<button>` outside `ui/Button.jsx`.

**Phase to address:** P-Create (controls and focus); P-UAT (iPad confirmation).

---

### Pitfall 12: Building undrawn surfaces from prose

**What goes wrong:** Gap rounds after the fact: the creation screen, the Notebook "new recipe" entry, the Ingredients place, the step and row add/remove/reorder controls and the custom-scale editor drift from what Mark approves, then need UAT-round fixes. v1's Phase 03.3.1 took 18 gaps and 03.4 six more for this reason; Phase 03.5 alone ran to 31 plans.

**Why it happens:** `.planning/sketches/` runs 001 to 011 and none draws creation, the picker, reorder controls or the Ingredients place (checked this session). The recorded rule is that the sketch HTML (including its CSS) is the authority, drawn on a Claude Design canvas first, and that agents must read the file rather than a prose summary. Impeccable decides design; GSD executes the approved brief.

**How to avoid:**
- Treat "drawn and approved on the canvas" as a gate before planning each of those surfaces. The roadmap should show it as a dependency, not a task inside a build phase.
- Plans cite the snapshotted sketch file by path, and the executor and checker open it. Conformance is measured side by side in the browser, in WebKit, never argued from prose or test count.
- The new controls inherit the tokens rule: every visual value reads a CSS custom property from `styles/tokens.css`, `sheet-*`/`app-*` prefixed; no literals; the hand font only for observations and ideas, never for specs or app text.
- Words follow the language rules (plain, short, sentence case, Cancel first; D11/D12 open labels stay open).

**Warning signs:** A plan task that describes layout in sentences. A new CSS rule with a literal colour or size. A designer-facing question answered by an executor.

**Phase to address:** Before P-Create and P-Entry (design gate); P-Ingredients likewise.

---

## Moderate Pitfalls

### Pitfall 13: A first save is a point of no return for structure

**What goes wrong:** A maker saves the first version, notices a missing row, and has no way to add it: structure edits on later versions are out of v2.0, so the fix is "start a new recipe".
**Why it happens:** The scope line (creation only) is right for the cost, but it makes the first save an irreversible structure commitment for a tool whose point is iteration.
**Prevention:** Make this visible rather than discover it in UAT. Put the question to Mark as a decide row (for example: a root version with no child and no batch stays structure-editable until it is either cited or printed? or accept the limit and make Save a deliberate act with a read-back of rows and steps). Do not build either without his answer. Meanwhile drafts persist until Save, so the practical mitigation is a review step before Save, drawn first.
**Phase to address:** Roadmap/discuss; P-Create.

### Pitfall 14: Library entry shape, provenance and the missing row-to-library link

**What goes wrong:** Provenance is stored on library entries, but a row embeds a clone with no record of which entry it came from (`rowFromLibraryRecord`: "the record's id never enters the row"). Later, "this row's source changed" cannot be shown, and the Ingredients place cannot say which recipes use an entry.
**Prevention:** Decide before P-Create whether to add a `libraryId` (and the entry's provenance snapshot) to the cloned row; the row validator `validateRow` and the stored row shape must agree. If it is deferred, state that it is deferred so no one infers a link later from the name. `validateLibraryRecord` checks only name and composition today; add checks for the new provenance fields in the same plan that adds them (bounded, plain strings), with the store file's `schemaVersion` handled deliberately (`STORE_SCHEMA_VERSION` is 8).
**Phase to address:** P-Library.

### Pitfall 15: New sections ship empty and a screen assumes they are present

**What goes wrong:** `createRecipe` leaves out `targets`, `equipment`, `process` and `iceEd` on purpose (nothing invented). Most readers tolerate that (`figures.js` uses `version.targets ?? {}`; `subScaleAdvisory` and `hydrationAdvisory` return null when absent; `composition.js` returns null at zero mass), but each new authoring field adds a reader that must tolerate the previous state too. Inventing default bands to make the figures "look right" would break the no-invention rule.
**Prevention:** Authored-or-absent for every section; a fresh recipe with only a name, one row and no targets renders without a thrown error and without invented bands, in the read view, the pen, the print sheet and the batch pen. Print a freshly created recipe and check it on the iPad PDF, since Safari print differs from Chrome print.
**Phase to address:** P-Entry.

### Pitfall 16: Duplicate and unvalidated names

**What goes wrong:** Two recipes with the same name, a name that is only spaces, or a version line colliding with itself. `createRecipe` trims and throws on blank; nothing checks uniqueness across recipes, and `sheetTitle` is set to the trimmed recipe name, so renames diverge.
**Prevention:** Decide whether recipe names must be unique; if not, Home must still distinguish them. Form-side messages for blank/whitespace; trimmed value used everywhere including comparisons.
**Phase to address:** P-Create.

### Pitfall 17: The library picker at 100+ entries on the iPad

**What goes wrong:** A native `<select>` of 100+ options is awkward; a hand-built combobox adds accessibility and focus work; `VersionRow.jsx`'s one `select` is "neither scanned nor measured on WebKit" (engineering notes), so there is no WebKit precedent.
**Prevention:** Choose the control in the drawn surface (grouped by category with a filter field is the likely shape); the filter input must be a real text input (WebKit tabs into text entry), results rendered through `Button`. Measure on WebKit at 393 and 1366 coarse. Keep every library read through the repository seam.
**Phase to address:** P-Create (picker), P-Ingredients (shared listing).

### Pitfall 18: Import and the one-pen rule during creation

**What goes wrong:** Import (`importAll`) runs while a creation draft is open and overwrites library entries or collides with the screen's assumptions; or the creation screen forgets to register as a pen.
**Prevention:** The creation route registers through the same `onPenOpenChange`/`guardImport` path as the recipe page (`router.jsx`). Test that Import is refused while creation holds ink. Drafts are never exported (by design); say so on the Continue affordance so nobody expects a backup to carry them.
**Phase to address:** P-Create.

### Pitfall 19: Close-out tooling debts repeat

**What goes wrong:** Stale verifications (12 at v1, 1 at v1.1), unclosed debug sessions, and non-YAML summary frontmatter block the milestone close.
**Prevention:** A quick task that edits a finished phase's covered files re-runs that phase's verifier (for example anything touching `store/transfer.js`, covered by the library phase). Quote colon-bearing and flow-sequence frontmatter values. Close a debug session or quick task when its fix lands.
**Phase to address:** Every phase; checked at milestone close.

---

## Minor Pitfalls

### Pitfall 20: Free-text ids and prototype-pollution names

New free-text identifiers (scale keys, problem words, any library id) become object keys somewhere. Add them to the reserved list that `transfer.test.js` pins against `versionRow.js`, build maps with `Object.fromEntries` rather than bracket writes (the pen draft already does), and keep `scanForUnsafeKeys` over any new import field. Phase: P-Scales, P-Library.

### Pitfall 21: Notes and provenance render as text only

Dataset names, notes and provenance strings (the seed DB has free text such as "FLAG: ... do NOT") must render as text; `dangerouslySetInnerHTML` is forbidden under `app/src` and is grep-enforced. Phase: P-Ingredients.

### Pitfall 22: A dataset fetched at runtime

TRUST-01/IMP-01: no network under `app/src`. Bundle the converted seed as data at build time; never fetch the JSON. Phase: P-Library.

### Pitfall 23: Vite dev server for device checks, or two Vite processes

Device checks come from `build` then `preview --host`; one Vite process per workspace. Both are recorded in the engineering notes and cost a UAT round when forgotten. Phase: P-UAT.

### Pitfall 24: Tests that read stale frontmatter or fixed counts

`db.test.js` hard-codes the newer-version number (v1.1 IN-03) and `seed.test.js` counts rows. A seed expansion or version bump will fail them for non-bugs. Update them in the same plan and keep the assertion meaningful (compare values for the pinned existing entries, not just counts). Phase: P-Library.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Reuse the pen draft for creation by seeding a blank placeholder "version" | No new draft model, fastest path to a screen | Strike-old-value noise, silent 0 g/NaN on blank amounts, rows added in session unvalidated (Pitfall 7), draft deleted on restore (Pitfall 1) | Never as-is. Acceptable only if the baseline-or-none seam and draft-row iteration are built first |
| Hard-delete steps/rows in the creation session | Simple array filters | Key reuse, dangling `uses` and portions (Pitfall 6) | Only if every reference is pruned in the same operation and undo is not offered |
| Overwrite the existing library entry with the dataset's value | One source of truth in the Ingredients place | Existing recipes' embedded values then disagree with the library; trust in figures erodes | Never without Mark's decision and a provenance note |
| Resolve custom scales by name against `AXES` plus a new array | Tiny diff | Silent drop on unresolved names; wording drift (Pitfall 9) | Never |
| Defer the "top up the seed" question and ship the new data under the old guard | Smaller phase | The iPad keeps the old library (Pitfall 4) | Never |
| Keep `step = 1` as the default step for a new row | Matches the helper's default | Portions on a step that does not exist | Only when a step 1 is guaranteed to exist at that moment |
| Ship a lift for seeded data instead of resetting while free | Feels safer | Dead code for data that exists only as seed, and a lift nobody can test against real records | Only after a real recipe exists (after P-Create) |
| Drag-only reorder | Looks modern | Fails the Tab path and possibly touch on WebKit | Only as an addition to Move up/down |

## Integration Gotchas

Internal seams here (there are no external services; TRUST-01 forbids network).

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Repository seam (`store/repository.js`) | A second `await save...` for the second record, or importing `idb` in the new code | One transaction method per multi-store write; `idb` stays in `store/db.js` |
| Drafts store (`drafts`, keyPath `versionId`) | Adding `create` drafts without teaching restore, Home, and the fit check | New kind plus its own fit check and restore; one slot per device (Pitfall 1) |
| Library store (`library`, `{ id, entry }`) | Reading `data/library.js` at runtime for the Ingredients place | Read through the repository; `data/library.js` is imported by `store/seed.js` alone (audit-verified) |
| `createRecipe` / `rowFromLibraryRecord` / `nextStepKey` | Calling them and letting the throw reach the maker | Pre-validate in the form and show plain sentences; the throws are for caller bugs |
| Sheet code (`domain/sheetCode.js`) | Treating the code as stored or stable under reorder | It is computed from displayed step numbers and stored row order; a creation-time reorder changes it. Fine before any sheet is printed; once printed, it is one-way, and a new derivation needs a new tag |
| `transfer.js` validators | Adding a stored field without validator and `STORE_SCHEMA_VERSION` thought | Same plan updates validator, test and the pinned reserved-name set; decide the schema version deliberately |
| Router (`router.jsx`) | A creation route that reuses `RecipePageForRoute`'s key or skips the keyed remount | Own route and own key; the same import-guard registration |
| Impeccable | Executor edits `app/` from an Impeccable "fix" | Impeccable decides; every `app/` edit goes through a GSD command |

## Performance Traps

Scale here is one maker and a few hundred records; most of this is irrelevant. The real risks are device-shaped.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Whole-page re-render per keystroke in a 40-row creation table | Laggy typing on the iPad | Keep the amount inputs' state local per row until blur or debounce; do not rebuild the figures from the whole draft on every key if measured slow; measure on WebKit first | Roughly 30 or more rows plus live figures; measure, don't guess |
| Debounced draft writes of a large creation payload | Dropped keystrokes at `pagehide` | Keep the 250 ms debounce and the visibility/pagehide flush; test the flush | Any closing tab inside the window (accepted bound of 250 ms) |
| Native `<select>` of 100+ library entries | Hard to scan on touch | Filtered list through `Button` (Pitfall 17) | Above about 40 entries |
| Dev-server measurement on the device | "Seconds to load" (6 MiB unbundled) | Serve the build | Always, on the LAN |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Dataset or note text rendered as markup | Script injection from imported text (low, local app) | Render as text; the `dangerouslySetInnerHTML` ban is grep-enforced |
| New identifiers as object keys | Prototype mutation via `__proto__`, `constructor`, `prototype` | Extend the reserved list and the pinning test; `Object.fromEntries`; `scanForUnsafeKeys` on any new import field |
| Fetching the dataset at runtime | Breaks TRUST-01 (no external calls without a stated policy) | Bundle as data at build time |
| Import silently replacing library entries | Overwrites reconciled values with old ones (W3) | Test and document current behaviour now; decide the policy before any library editing |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Vocabulary from the book or the code ("coefficient", "portion", "declared") on screen | Maker cannot tell what a field means | Plain, short, sentence-case labels, no articles, Cancel first; technical depth available on demand (D11) |
| A creation screen the size of the whole recipe with no sense of progress | Maker loses their place on an iPad | Keep the sections in the order the sheet prints; the drawn surface decides folds; draft kept notice as the pen already does |
| Blank steps and rows allowed to save | A sheet prints with an empty line the maker cannot explain | Blocked-save sentences naming the row or step, with the existing focus-the-field behaviour |
| Colour as the only carrier of status | Unreadable without colour | Text, outline and weight (recorded rule) |
| Hover-only affordances for Move/Remove | Invisible on touch | Visible controls, touch-sized, with reasons when disabled |
| Estimated library rows flagged everywhere | Every figure for a new recipe reads "estimated" and the flag stops meaning anything | Decide the flag rule with the basis vocabulary in Pitfall 3 before seeding; show what the flag rests on |

## "Looks Done But Isn't" Checklist

- [ ] **Creation draft:** Often missing restore after reload and a Home or Notebook way back to it. Verify: type, reload, find it; then repeat on the iPad.
- [ ] **Create save:** Often missing atomicity. Verify: force the version write to fail; recipe, version and draft are all unchanged.
- [ ] **Library seed:** Often missing the device that already has a library. Verify: start from a stored v9 profile with the old twelve entries.
- [ ] **Coefficients:** Often missing a pin on existing entries. Verify: every current `data/library.js` key equals its pre-milestone value; the printed-sheet figures test passes untouched.
- [ ] **Steps:** Often missing pruning. Verify: after random add/remove/reorder/undo, every portion's step is in the method and every `uses` id is a row.
- [ ] **Amounts:** Often missing the blank case on an added row. Verify: blank, "abc", "-1" each block Save with the existing sentence; none saves as 0 or NaN.
- [ ] **Edit mode:** Often shows creation controls on later versions. Verify: a saved version's rendered markup has no Add, Move or hard Remove.
- [ ] **Reorder:** Often mouse-only. Verify: Tab reaches each Move button on WebKit; tapping Move up keeps the moved item focused; key is the id, not the index.
- [ ] **Custom scale:** Often stops at the editor. Verify: batch snapshot holds the definition; export, import, reopen and kept-draft restore all show the scale and its marks.
- [ ] **Blank sections:** Often throws on absent targets/equipment/process. Verify: a one-row recipe renders in read view, pen, print and batch pen.
- [ ] **Print:** Often checked in Chrome only. Verify: iPad PDF of a freshly created recipe.
- [ ] **Split:** Often "green tests" with moved code. Verify: the 94-snapshot WebKit walk still MATCHes; existing tests changed only in imports; positive source assertions exist.
- [ ] **Reset window:** Often forgotten. Verify: a test fails if the upgrade deletes a store at or above the new floor; the Mark's List export row exists before the first creation build.
- [ ] **Import guard:** Often not wired on the new route. Verify: Import is refused while creation holds ink.
- [ ] **Tab path:** Every new link, button, checkbox, radio goes through `ui/` components; `tabindex-scan.test.js` green.
- [ ] **Tokens:** No literal colour, face, size, spacing or rule weight in new CSS.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Orphan recipe or version (Pitfall 2) | LOW | Add the atomic method; one-off script via the repository to delete or complete the orphan; export first |
| Creation draft lost (Pitfall 1) | LOW (code), HIGH (maker's lost typing) | Fix restore; nothing recovers the typing, so ship the flush tests first |
| Wrong coefficient shipped (Pitfall 3) | MEDIUM | Stored versions and batches embed their own copies, so history does not move; correct the library entry and record the change in provenance; re-run the parity test; tell Mark which new recipes used the old value |
| Seed not reaching device (Pitfall 4) | LOW | Ship the top-up; no data loss |
| Real recipe wiped by a later bump (Pitfall 5) | HIGH | Only the last export recovers it; this is why the export row exists |
| Key reuse in a saved first version (Pitfall 6) | HIGH | Child versions and batches already reference the keys; fix forward with a lift written against real records; do not rewrite keys in place |
| Custom scale dropped on batches (Pitfall 9) | MEDIUM | Snapshots hold names only for old batches; for new ones the definition is the fix. Repair by re-snapshotting is forbidden (batch snapshot is taken once and never retaken) |
| Split regressed behaviour (Pitfall 8) | MEDIUM | Revert the split commit; re-run the before-walk; split in smaller pieces |
| Surface built without a drawing (Pitfall 12) | HIGH | UAT gap rounds; draw first, rebuild to the contract |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| 1 Creation draft deleted | P-Create (+ P-Entry affordance) | Reload test on real fake-indexeddb; Home/Notebook shows Continue; iPad check |
| 2 Non-atomic create | P-Create | Forced-failure test leaves all stores unchanged; round-trip test closes audit W1 |
| 3 Dataset conflicts | P-Library (Mark decisions first) | Pin test on existing entries; printed-sheet parity test untouched; decision rows answered |
| 4 Seed never reaches device | P-Library | Test from a stored v9 profile; iPad shows the expanded library |
| 5 Reset window closes | Roadmap ordering; P-Create verification | No `DB_VERSION` change after P-Create; bounded-reset test; export row on Mark's List |
| 6 Step identity | P-Create | Property test of invariants; no Removed/Unallocated group in a fresh first version |
| 7 Editor assumes a parent | P-Split (seam), P-Create | Added-row blank amount blocks; no diff markup in create mode; no structure controls in edit mode |
| 8 Split changes behaviour | P-Split | 94-snapshot WebKit walk MATCH; tests changed only in imports; positive source assertions |
| 9 Scales vanish by name | P-Scales | Custom-scale batch survives export/import/reopen/draft restore; all listed consumers updated |
| 10 Stale seed text | P-Scales (step zero) | Code read restated in the plan; failing test per claimed bug |
| 11 Reorder on WebKit | P-Create, P-UAT | Playwright WebKit then iPad; Tab reaches Move buttons; stable keys |
| 12 Undrawn surfaces | Design gate before P-Create/P-Entry/P-Ingredients | Snapshotted sketch cited by path; side-by-side measurement in WebKit |
| 13 First save irreversible | Roadmap/discuss; P-Create | Mark's decide row answered before planning |
| 14 Library link and provenance | P-Library | Decision recorded on `libraryId`; validator updated with tests |
| 15 Empty sections | P-Entry | One-row recipe renders everywhere; iPad PDF |
| 16 Names | P-Create | Form messages tested; Home distinguishes same-named recipes |
| 17 Picker at 100+ | P-Create | Measured on WebKit at 393 and 1366 |
| 18 Import guard | P-Create | Import refused while creation holds ink |
| 19 Close-out debts | Every phase | Verifier re-run after quick tasks; YAML quoting |
| 20 to 24 Minor | As listed | As listed |

## Sources

Project artifacts (HIGH, read this session):
- `/Users/mark/Documents/projects/sprinkles/.planning/PROJECT.md` (scope, key decisions, reset stance)
- `/Users/mark/Documents/projects/sprinkles/.planning/RETROSPECTIVE.md` (v1 and v1.1 lessons)
- `/Users/mark/Documents/projects/sprinkles/.planning/milestones/v1.1-MILESTONE-AUDIT.md` (open items W1, W2, W3, IN-03)
- `/Users/mark/Documents/projects/sprinkles/.planning/seeds/SEED-261001-iq4-recipe-specific-tasting-measures-and-failures.md`
- `/Users/mark/Documents/projects/sprinkles/.planning/notes/2026-10-01-engineering-notes.md` (tabindex rule, build-served UAT)
- Code: `app/src/store/db.js`, `store/repository.js`, `store/seed.js`, `store/transfer.js`; `domain/newRecipe.js`, `stepKeys.js`, `versionRow.js`, `stepNumbers.js`, `uses.js`, `rows.js`, `axes.js`, `battery.js`, `draft.js`, `penDraft.js`, `lineage.js`, `sheetCode.js`, `advisories.js`; `ui/RecipePage.jsx`, `RecipePage.shell.test.js`, `RecipeList.jsx`, `IngredientTable.jsx`, `BatchRow.jsx`, `Placeholder.jsx`; `router.jsx`; `data/library.js`, `data/olive-oil.js`
- Candidate dataset: `~/Downloads/sprinkles-ingredient-seed-db.json` (dextrose and salt rows, provenance and notes quoted above); `~/Downloads/ingredients.json` (Ice Ed export, name-keyed)
- `.planning/sketches/` listing (001 to 011, none for creation)

WebKit behaviour (MEDIUM; vendor bug reports and a design-system write-up, not Apple documentation; verify on the device):
- [React Spectrum, Building a Button Part 3: Keyboard Focus Behavior](https://react-spectrum.adobe.com/blog/building-a-button-part-3.html)
- [WebKit bug 241408](https://bugs.webkit.org/show_bug.cgi?id=241408) (buttons not focused on click; `:focus-visible` side effects)
- [WebKit bug 195884](https://bugs.webkit.org/show_bug.cgi?id=195884) (programmatic focus does not raise the software keyboard without a gesture)

No provider-seam cache entries were written: the web findings are LOW to MEDIUM confidence by source tier and the rest is first-party code.

---
*Pitfalls research for: adding recipe creation to the Sprinkles app (v2.0)*
*Researched: 2026-10-15*
