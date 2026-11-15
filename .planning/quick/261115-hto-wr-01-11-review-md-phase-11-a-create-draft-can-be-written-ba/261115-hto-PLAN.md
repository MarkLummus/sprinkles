---
phase: quick-261115-hto
plan: 01
quick_id: 261115-hto
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/store/repository.js
  - app/src/ui/CreationPage.jsx
  - app/src/store/repository.test.js
  - app/src/ui/CreationPage.twoTabs.test.jsx
  - .planning/quick/261115-hto-wr-01-11-review-md-phase-11-a-create-draft-can-be-written-ba/261115-hto-probe.mjs
  - .planning/phases/11-steps-structure-save-and-print/11-REVIEW-DISPOSITION.md
autonomous: true

must_haves:
  truths:
    - "Once another tab has saved a creation, no write from a tab still holding it (a keystroke's debounced write, a pagehide or unmount flush, or resumeDraft after a failed Save) stores a create draft under the saved version's id. saveDraft resolves false and writes nothing. The version check and the write share one readwrite transaction over drafts and versions, so it is ordered against createRecipeWithVersion."
    - "Save pressed in that tab lands on the saved recipe's page with replace and state { focusVersion: true }. It shows no 'Couldn’t save the recipe. Try again.' line, writes nothing over the stored version and leaves no draft. The Notebook shows no kept creation, the version offers Edit, and Import is not refused because of it."
    - "A create draft already stored under a saved version's id (a ghost from before this fix) still opens at /notebook/new as it does today. Its Save removes it and lands on the recipe, and Edit shows."
    - "Single-tab behaviour is unchanged. A failed Save with no version stored under the id keeps the draft, gives the writer back and shows the existing line. Pen and edit drafts write exactly as before, in a drafts-only transaction. Start's create draft writes as before. The full suite is green at 4340 + 8 tests."
    - "No DB_VERSION change, no stored-shape change, no new on-screen sentence (CreationPage.jsx keeps its 7 exported constants), and no change to CreationRoute, NotebookPlace, Shell, useKeptDraft, EditRoute, app/src/domain or app/src/styles."
    - "In Playwright WebKit (Chrome too, if it launches), two pages in one browser context over scratch builds: the base build shows the ghost, the generic line, no Edit and the Notebook draft row; the fixed build shows none of them."
  artifacts:
    - path: app/src/store/repository.js
      provides: "saveDraft opens ['drafts', 'versions'] for a create record and resolves false, writing nothing, when a version is stored under record.versionId. Other kinds keep the drafts-only transaction."
      contains: "['drafts', 'versions']"
    - path: app/src/ui/CreationPage.jsx
      provides: "handleSave's create failure path reads repository.getVersion(record.versionId). A stored version means saved elsewhere: discard the draft (final), then navigate to the recipe instead of resumeDraft."
      contains: "repository.getVersion"
    - path: app/src/store/repository.test.js
      provides: "A WR-01 describe: a create draft is refused once its version is stored (two repository instances as two tabs); a create draft on a free id, a plan draft and an edit draft on a stored version still write. The T-11-47 create case is reseeded draft-first, with its assertions unchanged."
      contains: "WR-01"
    - path: app/src/ui/CreationPage.twoTabs.test.jsx
      provides: "Two CreationRoute tabs over one real fake-indexeddb store: typed after, Save after, a pre-fix ghost, and a single-tab control."
      contains: "WR-01"
    - path: .planning/quick/261115-hto-wr-01-11-review-md-phase-11-a-create-draft-can-be-written-ba/261115-hto-probe.mjs
      provides: "A record/check two-page browser walk over scratch builds of BASE and of the fix, in WebKit (required) and Chrome (if it launches)"
      contains: "record"
  key_links:
    - from: app/src/ui/useKeptDraft.js
      to: app/src/store/repository.js
      via: "flushPendingDraft and resumeDraft call repository.saveDraft(record) with kind 'create'. The guard inside saveDraft is the single choke point, so useKeptDraft itself is not edited."
      pattern: "saveDraft"
    - from: app/src/ui/CreationPage.jsx
      to: app/src/store/repository.js
      via: "handleSave awaits repository.createRecipeWithVersion, which throws TypeError 'version … already exists'. In the catch, repository.getVersion(record.versionId) decides saved-elsewhere against the error's text."
      pattern: "repository.getVersion"
    - from: app/src/ui/CreationPage.jsx
      to: app/src/ui/useKeptDraft.js
      via: "The saved-elsewhere path calls writer.discardDraft({ final: true }), which deletes only a create-family record (deleteDraft with the 'create' family), so a pen's or an edit's draft is never touched."
      pattern: "discardDraft"
    - from: app/src/domain/firstVersion.js
      to: app/src/ui/RecipePage.jsx
      via: "editStateFor returns null while any draft holds the version's id. No ghost means 'editable', and Edit is drawn."
      pattern: "editStateFor"
---

<objective>
Fix WR-01 from `.planning/phases/11-steps-structure-save-and-print/11-REVIEW.md`. Mark said on 2026-11-15: "confirm that they reproduce; if they do then fix". The problem: once another tab has saved a creation, a tab still holding it can write the create draft back. The result is a ghost draft that cannot be saved and that hides Edit.

**It reproduces at planning HEAD 5ad63e63, every part of it.** Planning ran throwaway tests, then deleted them; the tree under app/ is clean.
- **Store.** Tab B holds a create draft. Tab A runs `createRecipeWithVersion` (a second `createRepository()` over the same fake-indexeddb), which stores the recipe and version and deletes the draft. Tab B's next `saveDraft(create record)` then resolves `true` and stores it again. `draftMatchesCreate(ghost)` is `true`, which is the predicate that NotebookPlace, CreationRoute and Shell's import guard read. `editStateFor` returns `null`, so there is no Edit. A second `createRecipeWithVersion` throws `TypeError: version v-1 already exists`.
- **Two tabs over one real store (jsdom, the RecipePage.stalePen.test.jsx harness).**
  - Path 1: tab A saves; tab B types in Recipe description. After the debounce the store holds a `create` draft carrying B's new text.
  - Path 2: tab A saves; tab B presses Save. B stays on `/notebook/new` with "Couldn’t save the recipe. Try again." under Save, and resumeDraft has written the `create` draft back.
  - Path 3: a third tab at `/notebook/new` opens the ghost, and its Save fails with the same line. On the recipe page the acts row has Next version but no Edit. In a control case with no ghost, Edit shows.
- **Built app, Playwright WebKit, two pages in one context (planning's own feasibility walk).** The HEAD build gave `{"afterType":"create","bUrl":"/notebook/new","bLine":"Couldn’t save the recipe. Try again.","afterSave":"create","acts":["Next version","Print sheet"],"draftRow":1}`.
- **Not covered by later fixes.** Nothing since the review (state machine audit 2026-11-10, ui5, gxe, the textarea fixes) touched `saveDraft` or handleSave's catch: `git log --since=2026-10-27 -- app/src/store/repository.js` is empty.
- **Import refusal** follows directly: Shell.jsx's import guard refuses while `records.some(draftMatchesCreate)` is true, and it is true for the ghost. It was not walked separately.

**The fix was probed at planning in an isolated scratch git worktree, then the worktree was removed.**
- Every red case below went green.
- The full suite passed: 134 files and 4346 tests, which is HEAD's 132 and 4340 plus planning's 2 scratch files and 6 tests. One existing test needed reseeding (see Task 1).
- The fixed build walked in WebKit gave `{"afterType":null,"bUrl":"/notebook/r-probe-wr01/v-probe-wr01","bLine":"","afterSave":null,"acts":["Next version","Edit","Print sheet"],"draftRow":0}`.

The fix, as the review suggested:
1. **Store guard (repository.saveDraft).** A create record opens `['drafts', 'versions']` in one readwrite transaction. When a version is stored under `record.versionId`, it takes the family guard's existing refusal branch: quiet `done`, abort, resolve false. Every create write in the app goes through saveDraft: the persist effect's debounced write, the pagehide, visibility and unmount flushes, resumeDraft, discardDraft's failure path and Start. So this one guard closes every write-back. Start mints a fresh id, which no version holds, so it is unaffected.
2. **Save treats a stored version as saved elsewhere (CreationPage.handleSave).** The create branch's catch reads `repository.getVersion(record.versionId)`. If a version is stored there, the page discards the draft (final, create family only) and navigates to that recipe, instead of resuming the writer and showing the line.

Claude's discretion, recorded:
- **Saved-elsewhere is decided by reading the store, not by matching the TypeError's message.** Version ids are drawn fresh at Start, so a version stored under this creation's id is this creation, saved by another tab. The read does not depend on the error text, and it covers a pre-fix ghost the same way. A failed read counts as "nothing stored", so the existing failure path runs unchanged.
- **The landing carries `{ focusVersion: true }` with no `saved: 'created'`, so nothing is announced.** This tab's Save wrote nothing. Any words typed here after the other tab saved are not in the stored version, so "Recipe saved." would claim this press saved them. Focus still lands on the version identity. The Shell re-reads drafts on the route change and finds none, because the discard is awaited before the navigate. To announce the existing "Recipe saved." instead, add `saved: 'created'` to that state; the orchestrator relays this choice to Mark.
- **The review's optional second line is not built.** That would be making CreationRoute, NotebookPlace's draftMatchesCreate, Shell and editStateFor ignore a create draft whose id is a stored version. The store guard is the only write path, so no new ghost can arise. Case U3 proves a ghost kept from before the fix clears on Save, as it already does on Cancel. Building it would edit four more modules for state that only an older build could have left behind (see "no live data: prefer reset over migration").
- **Words typed in the stale tab after the other tab saved are no longer kept.** The store refuses them. Telling the maker would need a new on-screen sentence, which is out of scope ("existing wording only"). It is reported for Mark instead.
- **For sibling 261115-htp (WR-02), which edits saveDraft next:** the transaction scope is a ternary keyed on `record.kind === 'create'`, in the same shape as putVersionChecked's `expected === null` ternary. WR-02's "refuse an edit write when no version has that id" widens that same condition to cover 'edit'.

API coverage, schema push and assumption-delta do not apply here: there is no external API, no schema file, and no model is generalised.

Purpose: a maker who saved a recipe in one tab never ends up with a stuck draft in another tab, one that blocks Save, Import and Edit.
Output: about 6 changed lines in repository.js and about 12 added lines in CreationPage.jsx, plus comments. 4 new store tests and 1 reseeded existing case. A new two-tab test file with 4 cases. One probe script. The WR-01 disposition row set to fixed. Three commits: the red tests, the fix, then the probe with the disposition row.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.claude/CLAUDE.md
@.planning/STATE.md

Read by range or by search, not whole:
- .planning/phases/11-steps-structure-save-and-print/11-REVIEW.md, section "### WR-01" (lines 106-133).
- app/src/store/repository.js: putVersionChecked (lines 19-45; the `expected === null ? … : …` transaction ternary is the shape to match), createRecipeWithVersion (lines 153-188), saveDraft and its comment (lines 446-484), deleteDraft (lines 485-520).
- app/src/ui/CreationPage.jsx: the props and the writer (lines 136-233), handleCancel (lines 531-560), and handleSave with its comment (lines 575-643).
- app/src/ui/useKeptDraft.js: useDraftWriter (lines 26-122): flushPendingDraft, discardDraft({ final }), endDraft, resumeDraft. Read only; do not edit.
- app/src/store/repository.test.js: the harness (lines 1-27: makeDraft, the per-test IDBFactory), createdPair and stores (lines 508-523), unhandledDuring (lines 588-602), storedRoot (lines 604-611), the T-11-47 it.each (lines 709-726), and the family-guard describe at the end of the file (lines 869-924).
- app/src/ui/RecipePage.stalePen.test.jsx (lines 1-183): the two-tabs-over-one-real-store harness to copy. It covers the import order with fake-indexeddb first, settle in real 10 ms turns, openTab with CatalogProvider initialCatalog, per-case ids from caseNumber, and the unhandledRejection collection.
- app/src/ui/CreationFlow.test.jsx: lines 1771-1806 ("a rejected save keeps the draft, gives the writer back…"), the single-tab failure test that must stay green unchanged.
- .planning/quick/261114-ui5-edit-shows-at-once-when-a-kept-draft-tha/261114-ui5-probe.mjs: the probe to copy (header and usage, PLAYWRIGHT_CORE check, startServers, openPage aborting non-127.0.0.1, the engines loop, record/check, PASS/FAIL).
- Optional, if it still exists: planning's feasibility walk, /private/tmp/claude-501/-Users-mark-Documents-projects-sprinkles/90e933b2-ff70-499a-b010-34ffc75bc83f/scratchpad/feasibility-walk.mjs (raw IndexedDB put/get helpers and the two-page flow). The plan below stands without it.
- Do not edit: app/src/ui/useKeptDraft.js, app/src/ui/CreationRoute.jsx, app/src/ui/NotebookPlace.jsx, app/src/ui/Shell.jsx, app/src/ui/EditRoute.jsx, app/src/store/db.js, app/src/domain/, app/src/styles/, app/src/ui/CreationFlow.test.jsx.
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Base build, failing tests over a real store (two repository instances, two CreationRoute tabs), then the saveDraft guard and the saved-elsewhere Save. One path end to end: a stale tab's write and Save, the store, the recipe page's Edit</name>
  <files>app/src/store/repository.test.js, app/src/ui/CreationPage.twoTabs.test.jsx, app/src/store/repository.js, app/src/ui/CreationPage.jsx</files>
  <read_first>
    - app/src/store/repository.js (lines 19-45, 153-188, 446-520)
    - app/src/ui/CreationPage.jsx (lines 136-233, 531-643)
    - app/src/ui/useKeptDraft.js (lines 26-122)
    - app/src/store/repository.test.js (lines 1-27, 508-611, 709-726, 869-924)
    - app/src/ui/RecipePage.stalePen.test.jsx (lines 1-183)
  </read_first>
  <behavior>
    Store, in a new describe at the end of app/src/store/repository.test.js named "a create draft is refused once its version is stored (WR-01)":
    - S1 (red at BASE). Two tabs are two `createRepository()` instances over the test's one IDBFactory. Tab B: `saveDraft(makeDraft(pair.version.id, { kind: 'create' }))`. Tab A: `createRecipeWithVersion(pair)`, where pair = createdPair(). Then B's `saveDraft(makeDraft(pair.version.id, { kind: 'create', fields: { note: 'typed in B after A saved' } }))`, run inside unhandledDuring. Expect result `false`, seen `[]`, `getDraft(pair.version.id)` undefined and `listDrafts()` `[]`. At BASE it fails on the first expectation: expected true to be false.
    - S2 (passes at BASE and after). A create draft whose id no version holds still writes and resolves true.
    - S3, an it.each over ['plan', 'edit'] (passes at BASE and after). With createdPair stored by createRecipeWithVersion, `saveDraft(makeDraft(id, { kind }))` resolves true and getDraft returns it: pens and edits are unchanged.
    Two tabs over one real store, in the new file app/src/ui/CreationPage.twoTabs.test.jsx, in one describe named "a creation saved in another tab (WR-01)". Every case first stores one create draft for this case's ids: blankCreateDraft with name 'Vanilla' and rows `[{ id: 'row-a', libraryId: 'sucrose', portions: [{ step: 1, grams: '150' }] }]`, an unplaced Sucrose row at 150 g, the smallest creation Save accepts.
    - U1 (red at BASE). Tabs A and B at /notebook/new, both with Recipe name drawn. A presses Save and lands on the page path, and getDraft is undefined. B types 'Typed in B after A saved.' into Recipe description, then settles 40 turns (400 ms real time, past the 250 ms debounce). Expect getDraft(VERSION_ID) undefined, `(await repository.listDrafts()).some(draftMatchesCreate)` false, and no unhandled rejections. At BASE it fails on the getDraft expectation, receiving a record of kind 'create' whose payload.description is B's text.
    - U2 (red at BASE). As U1 up to A's landing. Read savedByA = getVersion(VERSION_ID). B presses Save, then settle until B's pathname leaves /notebook/new. Expect: B's pathname is the page path; the line under Save (`.notebook-ceremony p.field-error`) is not RECIPE_CREATE_ERROR; getDraft undefined; sameRecord(getVersion(VERSION_ID), savedByA) true; B's `.page-status` text is '' after a further settle of 20 turns (no landing word, by design); no unhandled rejections. At BASE it fails on the pathname, which is still '/notebook/new', while the line reads RECIPE_CREATE_ERROR.
    - U3 (red at BASE). A ghost kept from before the guard. Store the create draft first. Then store the case's recipe and version with `repository.saveRecipe(recipe)` and `repository.createVersion(version)`, neither of which touches drafts; build them with createRecipe and rowFromLibraryRecord from library.sucrose as stalePen's storeVanilla does. Expect getDraft kind 'create'. One tab at /notebook/new: the editor opens (Recipe name drawn). Press Save, then settle until the pathname leaves /notebook/new. Expect the page path, getDraft undefined, and once settled the acts row (`.notebook-version__acts > *` trimmed texts) contains 'Edit'; no unhandled rejections. At BASE it fails on the pathname.
    - U4 (passes at BASE and after: the harness control and the single-tab pin). One tab at /notebook/new, Save. Expect the page path, getDraft undefined, `.page-status` text RECIPE_SAVED_STATUS ('Recipe saved.', imported from ../router.jsx), and the acts row containing 'Edit'.
  </behavior>
  <action>
Step 0, before any edit:
- Record `BASE=$(git rev-parse HEAD)`. Planning was at 5ad63e63; if main moved, use what it shows.
- Record the full-suite counts from `npm --prefix app test`. Planning saw 132 files and 4340 tests passing at 5ad63e63.
- Build the base to scratch for Task 2's walk: set `S="${TMPDIR:-/tmp}/sprinkles-hto"`, then run `npm --prefix app run build -- --outDir "$S/base-dist" --emptyOutDir`. Never build to app/dist. Never start a dev or preview server. Leave port 4173 alone.
- Re-run the gate baselines. Each is recorded in Task 2's verify block: [HEAD=0] for all three, and no app/src/ui/CreationPage.twoTabs.test.jsx at HEAD. The two diff-based guards in Task 2 read 0 at BASE by construction.
  - `grep -v '^\s*//' app/src/store/repository.js | grep -c "\['drafts', 'versions'\]"`
  - `grep -v '^\s*//' app/src/ui/CreationPage.jsx | grep -c 'repository.getVersion'`
  - `grep -c 'WR-01' app/src/store/repository.test.js`

RED (tests only):

(a) app/src/store/repository.test.js. Add the WR-01 describe (S1, S2, S3) at the end of the file. Use the file's own helpers (createRepository, makeDraft, createdPair, unhandledDuring). The beforeEach already gives each test a fresh IDBFactory, and two createRepository() calls in one test open the same database, so they act as two tabs. Put a two-line comment above the describe: a create draft written after another tab saved the creation would be a ghost no Save can clear, which hides Edit and refuses Import, so saveDraft refuses it in the same transaction that reads the versions.

(b) app/src/store/repository.test.js, the T-11-47 it.each named "refuses 'draft-held' when a %s draft holds the version's key…". Reseed the 'create' row only.
- Why: after the fix, saveDraft refuses a create draft on a stored version, so this row's seeding (storedRoot, then saveDraft) would silently store nothing. Save-over would then save, and the row would fail with result `{ saved: true }`. The refusal it pins, saveFirstVersionOver's 'draft-held' for a create draft, still matters for a ghost kept from before the guard.
- Change: inside the callback, when kind is 'create', save the foreign draft first, under createdPair().version.id. Then store the root with repository.saveRecipe(pair.recipe) and repository.createVersion(pair.version). Read expected from the store as storedRoot does: getVersion, then getRecipe.
- Leave the 'plan', 'record' and 'amend' rows exactly as they are (storedRoot, then saveDraft). Add one comment line explaining the create row's order.
- Leave every expectation, the test name and the it.each list unchanged.
- This reseed passes at BASE as well.

(c) app/src/ui/CreationPage.twoTabs.test.jsx, a new file. Its first line is the `// @vitest-environment jsdom` docblock. Then a header comment naming WR-01, the two tabs over one real store, and why fake-indexeddb is imported first. Then `import 'fake-indexeddb/auto'` before any module that imports the repository.
- Copy RecipePage.stalePen.test.jsx's harness: installMatchMedia, settle, openTab with CatalogProvider initialCatalog under StrictMode and MemoryRouter, a Where probe for tab.location, the field/buttonByText/click/type helpers, the unhandledRejection collection, and the beforeEach and afterEach with caseNumber ids `r-wr01-N` and `v-wr01-N`.
- Routes under the Outlet: '/notebook' as a plain element, '/notebook/new' as CreationRoute, and '/notebook/:recipeId/:versionId' as RecipePageForRoute.
- beforeEach also deletes every stored draft (listDrafts, then deleteDraft(record.versionId) for each) before storing this case's create draft. The store lives for the whole file, CreationRoute opens the newest create draft, and at BASE a case's ghost would otherwise be the one a later case opens.
- Add U1 to U4 from the behavior block. Test input values are English.

Run `npm --prefix app test -- src/store/repository.test.js src/ui/CreationPage.twoTabs.test.jsx`. Expected: exactly 4 failed (S1, U1, U2, U3), each for the reason given in the behavior block. Everything else passes, including S2, both S3 rows, U4 and all four T-11-47 rows.
- If any red case fails for another reason, stop and report the output rather than adjusting a test to fit. Examples: Recipe name never draws, A never lands, U4 fails, or an unhandled rejection appears.
- If any other existing test fails, stop and report as well.
- Keep the RED output for the SUMMARY.

Commit the tests alone, in English: `test(261115-hto): a creation saved in another tab leaves no ghost draft, red until the fix (WR-01)`. The body names the four red cases and the T-11-47 create-row reseed with its reason. End the body with the two trailer lines given in Task 2.

GREEN (app code only; the test files stay as committed):

1. app/src/store/repository.js, saveDraft only.
   - Add a `creating` flag, true when record.kind is 'create'.
   - Open the transaction over ['drafts', 'versions'] when creating, and over 'drafts' alone otherwise, as one ternary in the same shape as putVersionChecked's.
   - The idb wrapper defines `tx.store` only for a single-store transaction. So read and write the drafts store through `tx.objectStore('drafts')`, held in one local, in place of saveDraft's two `tx.store` uses. Touch no other function's `tx.store`.
   - After reading `stored`, when creating, read `tx.objectStore('versions').get(record.versionId)`. A record there takes the existing refusal branch: done.catch, tx.abort, return false. Fold it into the existing if, beside the family condition, so the abort path stays one block.
   - Leave the family logic, the catch block, deleteDraft, createRecipeWithVersion and every other method unchanged.
   - Extend saveDraft's comment by one or two sentences: a create draft is refused the same way, writing nothing, once a version is stored under its id. That happens when another tab saved the creation. The read sits in the same transaction, so it is ordered against createRecipeWithVersion, and no keystroke, flush or resume in a second tab can write a ghost back (WR-01).

2. app/src/ui/CreationPage.jsx, handleSave's catch only.
   - Before the existing `if (ended) writer.resumeDraft();`, and only when `editing` is false, read the stored version with `Promise.resolve().then(() => repository.getVersion(record.versionId))`, its rejection caught to undefined.
   - When a version comes back, another tab saved this creation:
     - await `writer.discardDraft({ final: true })` with its rejection caught and ignored. This removes any create draft still kept under the id, a ghost from before the guard. It deletes only the create family.
     - Then, only while `mountedRef.current`, navigate to `notebookPath(storedVersion.recipeId, storedVersion.id)` with `{ replace: true, state: { focusVersion: true } }`, and return.
     - Do not call resumeDraft, do not set saveFailed, and do not release savingRef or saving: the page is leaving, so a second press does nothing.
   - When nothing is stored, or the read failed, the existing lines run exactly as before.
   - The edit branch is untouched: with editing true the read is skipped.
   - Add no string constant, no export, no JSX and no new import (repository and notebookPath are already imported).
   - Extend handleSave's comment by one or two sentences:
     - A creation that fails because its version is already stored was saved in another tab. It ends here: its draft is discarded and the page goes to the recipe, with no landing word because this press wrote nothing.
     - The stored version decides this, not the error's text (WR-01).

Run the same two files again: all pass. Then run `npm --prefix app test -- src/store src/ui/CreationFlow.test.jsx src/ui/EditFlow.test.jsx src/ui/useKeptDraft.test.jsx src/ui/RecipePage.stalePen.test.jsx src/ui/NotebookPlace.test.jsx src/ui/Shell.creationGuard.test.jsx src/ui/Shell.importGuard.test.jsx`: all pass. CreationFlow's "a rejected save keeps the draft, gives the writer back…" is the single-tab failure pin. Its repository mock's getVersion finds nothing under the new id, so the old path runs.

Commit, in English: `fix(261115-hto): a creation saved in another tab leaves no ghost draft; Save there goes to the recipe (WR-01)`. The body gives the cause: saveDraft guarded only by family, and handleSave's catch resumed the writer. It then gives the two-part fix, the store-read decision and the silent landing. End it with the two trailer lines given in Task 2.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/store src/ui/CreationPage.twoTabs.test.jsx src/ui/CreationFlow.test.jsx src/ui/EditFlow.test.jsx src/ui/useKeptDraft.test.jsx src/ui/RecipePage.stalePen.test.jsx src/ui/NotebookPlace.test.jsx src/ui/Shell.creationGuard.test.jsx src/ui/Shell.importGuard.test.jsx && npm --prefix app test -- src/store/repository.test.js src/ui/CreationPage.twoTabs.test.jsx -t "WR-01" && test "$(grep -v '^\s*//' app/src/store/repository.js | grep -c "\['drafts', 'versions'\]")" -ge 1 && test "$(grep -v '^\s*//' app/src/ui/CreationPage.jsx | grep -c 'repository.getVersion')" -ge 1 && test -s "${TMPDIR:-/tmp}/sprinkles-hto/base-dist/index.html"</automated>
    Gates and their baselines are listed in Task 2's verify block. The RED run recorded 4 failed (S1, U1, U2, U3), each for its stated reason, with everything else passing. The GREEN run shows 0 failed.
  </verify>
  <done>base-dist was built from BASE before any edit. The RED commit holds the 8 new tests (4 red for the stated reasons) and the T-11-47 create-row reseed, which passes at BASE. The fix commit changes only saveDraft in repository.js and handleSave's catch in CreationPage.jsx, and every listed suite passes.</done>
</task>

<task type="auto">
  <name>Task 2: Two-page built-app walk in WebKit and Chrome against the base build, full suite, scope gates, the WR-01 disposition row, probe commit</name>
  <files>.planning/quick/261115-hto-wr-01-11-review-md-phase-11-a-create-draft-can-be-written-ba/261115-hto-probe.mjs, .planning/phases/11-steps-structure-save-and-print/11-REVIEW-DISPOSITION.md</files>
  <read_first>
    - .planning/quick/261114-ui5-edit-shows-at-once-when-a-kept-draft-tha/261114-ui5-probe.mjs (whole; about 250 lines)
    - .planning/phases/11-steps-structure-save-and-print/11-REVIEW-DISPOSITION.md (lines 1-10 and 50-58)
  </read_first>
  <action>
**The probe.** Write `.planning/quick/261115-hto-wr-01-11-review-md-phase-11-a-create-draft-can-be-written-ba/261115-hto-probe.mjs` by copying the ui5 probe's structure:
- the header comment, with usage under `S="${TMPDIR:-/tmp}/sprinkles-hto"`;
- the PLAYWRIGHT_CORE constant and its existence check (default `/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs`);
- `startServers` imported from `../../phases/08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs`;
- a context that aborts every request whose host is not 127.0.0.1;
- the engines loop: webkit, then chromium with `channel: 'chrome'`, printing an INFO line when an engine does not launch;
- record and check modes, PASS and FAIL lines ending "N PASS, M FAIL", exit 1 on any FAIL.

One config: 1366x1024, no touch, dpr 1. Each walk is one fresh browser context, so the store is fresh and seeds itself, and the context's pages are the tabs, sharing one IndexedDB.

Ids are RECIPE_ID `r-probe-wr01` and VERSION_ID `v-probe-wr01`, with PAGE `/notebook/r-probe-wr01/v-probe-wr01`. DRAFT is a plain record:
- shapeVersion 1, versionId VERSION_ID, kind 'create', updatedAt '2026-11-15T10:00:00.000Z';
- its payload is blankCreateDraft's thirteen keys for those ids with name 'Probe vanilla', and rows `[{ id: 'row-a', libraryId: 'sucrose', portions: [{ step: 1, grams: '150' }] }]`.

Helpers:
- **idbPut(page, record) and idbKind(page, id).** In page.evaluate, run `indexedDB.open('sprinkles')` with no version argument. Use one transaction on 'drafts': put the record, or get the id. Resolve on the transaction's complete event (true for a put, the stored record's kind or null for a get), then close the connection.
- **seed(page).** Goto `/notebook` (networkidle), wait for the New recipe button (the app has now seeded its store), then idbPut DRAFT.
- **openEditor(page).** Goto `/notebook/new` and wait for `textarea[aria-label="Recipe name"]`.
- **save(page).** Click the button named exactly 'Save'.
- **readLanding(page).** Return:
  - the pathname;
  - the line under Save (the texts of `.notebook-ceremony p.field-error`, joined);
  - the `.page-status` text;
  - the acts, as the trimmed texts of `.notebook-version__acts > *`, read after waiting up to 3000 ms (timeout caught) for one reading 'Edit'.
- **readNotebook(page).** Goto `/notebook`, wait for networkidle and then 500 ms, and return the count of `.nb__draft`.

Walks:
- W0 control, one page: seed, openEditor, save, wait up to 5 s for the URL to leave /notebook/new, readLanding, idbKind.
- W1 typed after, pages A and B:
  1. Seed on A, then openEditor on A and on B. A saves and waits for PAGE.
  2. B fills `textarea[aria-label="Recipe description"]` with 'Typed in B after A saved.', waits 800 ms, and reads afterType with idbKind.
  3. B saves, waits 1500 ms, then readLanding(B) and idbKind.
  4. A third page C opens PAGE and reads its acts as readLanding does, then readNotebook(C).
- W2 saved after, pages A and B: as W1 without the typing. A saves; B saves, waits 1500 ms, then readLanding(B) and idbKind.
- W3 ghost from an older build: seed on A, openEditor on A, A saves and waits for PAGE. Then idbPut DRAFT again, which is the ghost an older build could leave. Page B opens /notebook/new and records whether Recipe name is drawn within 5 s. B saves, waits 1500 ms, then readLanding(B) and idbKind.

Check mode compares after.json with base.json, per engine:
- **Controls, both builds.** W0 lands on PAGE, its page-status is 'Recipe saved.', no draft is stored, and the acts contain 'Edit'. If base W0 fails, seeding the state did not work; say so in the SUMMARY and rely on the component tests, without loosening the check.
- **The base build reproduces.**
  - W1: afterType 'create'; B stays on /notebook/new with the line 'Couldn’t save the recipe. Try again.'; the stored kind is 'create'; C's acts lack 'Edit'; the Notebook draft count is 1.
  - W2: B stays with that line, and kind 'create'.
  - W3: the editor opens; B stays with that line, and kind 'create'.
- **The fixed build.**
  - W1: afterType null; B lands on PAGE with an empty line; kind null; C's acts contain 'Edit' and equal after W0's acts; the Notebook draft count is 0.
  - W2: B lands on PAGE with an empty line, kind null and an empty page-status.
  - W3: the editor opens; B lands on PAGE; kind null; the acts contain 'Edit'.
- FAIL when webkit is missing from either file; INFO when chrome is.

Everything the script types or prints is English. It never contacts 4173 or 8077, starts no Vite process and never writes app/dist.

**Walk the builds.**
1. Build the fix: set `S="${TMPDIR:-/tmp}/sprinkles-hto"`, then run `npm --prefix app run build -- --outDir "$S/after-dist" --emptyOutDir`.
2. Run `PROBE_DIST="$S/base-dist" node .planning/quick/261115-hto-wr-01-11-review-md-phase-11-a-create-draft-can-be-written-ba/261115-hto-probe.mjs record "$S/base.json"`.
3. Run the same with `PROBE_DIST="$S/after-dist"`, writing `"$S/after.json"`.
4. Run `node .planning/quick/261115-hto-wr-01-11-review-md-phase-11-a-create-draft-can-be-written-ba/261115-hto-probe.mjs check "$S/after.json" --base "$S/base.json"`.

Every check must pass. If a fixed-build check fails while Task 1's tests pass, stop and report the readings rather than changing the fix.

**Full suite.** Run `npm --prefix app test`. The result must be the Step 0 counts plus 1 file and 8 tests, with 0 failed. Planning expects 133 files and 4348 tests. This includes app/src/ui/tabindex-scan.test.js and the style scans.

**Scope gates against BASE:**
- `git diff --quiet "$BASE" -- app/src/store/db.js app/src/domain app/src/styles app/src/ui/useKeptDraft.js app/src/ui/CreationRoute.jsx app/src/ui/NotebookPlace.jsx app/src/ui/Shell.jsx app/src/ui/EditRoute.jsx app/src/ui/CreationFlow.test.jsx` exits 0. This covers no DB_VERSION or shape change, the optional second line not taken, the writer unchanged and the single-tab pin unedited.
- `git diff --name-only "$BASE"` lists only this plan's files_modified, plus this quick directory's own planning docs.
- The diff of app/src/ui/CreationPage.jsx adds no JSX and no string constant. It holds only handleSave's catch lines and comment lines.

**The disposition row.** In .planning/phases/11-steps-structure-save-and-print/11-REVIEW-DISPOSITION.md, set WR-01 to fixed, and change nothing else:
- its frontmatter entry gets `disposition: fixed`;
- its table row's Disposition cell reads `fixed`.
WR-02's row belongs to sibling 261115-htp.

**Commit.** Commit the probe and the disposition row, in English: `test(261115-hto): built-app two-tab probe for a creation saved in another tab; WR-01 fixed`. The body gives the PASS count per engine. Every commit in this plan ends its body with these two lines, exactly:
Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VWwTRRV1yptqguV5CEBBew

**What the SUMMARY gives the orchestrator.** Do not write to Mark's List; the executor has no ArtifactData. The SUMMARY gives:
- WR-01 reproduced at BASE on every path and is fixed, tested red then green and walked in WebKit (and Chrome if it launched);
- the dist build is safe to deploy: no store version, no data shape and no migration change;
- two points for Mark, with no new wording built:
  1. A tab whose creation was saved elsewhere lands on the recipe without "Recipe saved.". Adding `saved: 'created'` to that landing state would announce it; it is a one-word change.
  2. Words typed in that tab after the other tab saved are not kept. Telling the maker would take a new sentence.
- no device step is needed: the WebKit walk is the engine evidence, and two tabs on one recipe is not a device-specific path;
- sibling 261115-htp widens the same saveDraft ternary for the 'edit' kind.
  </action>
  <verify>
    <automated>S="${TMPDIR:-/tmp}/sprinkles-hto" && npm --prefix app run build -- --outDir "$S/after-dist" --emptyOutDir && PROBE_DIST="$S/base-dist" node .planning/quick/261115-hto-wr-01-11-review-md-phase-11-a-create-draft-can-be-written-ba/261115-hto-probe.mjs record "$S/base.json" && PROBE_DIST="$S/after-dist" node .planning/quick/261115-hto-wr-01-11-review-md-phase-11-a-create-draft-can-be-written-ba/261115-hto-probe.mjs record "$S/after.json" && node .planning/quick/261115-hto-wr-01-11-review-md-phase-11-a-create-draft-can-be-written-ba/261115-hto-probe.mjs check "$S/after.json" --base "$S/base.json" && npm --prefix app test && PAGE_DIFF="$(git diff "$BASE" -- app/src/ui/CreationPage.jsx)" && test "$(printf '%s\n' "$PAGE_DIFF" | grep -c '^+export const')" -eq 0 && test "$(grep -c 'WR-01' app/src/store/repository.test.js)" -ge 1 && test "$(grep -c 'WR-01' app/src/ui/CreationPage.twoTabs.test.jsx)" -ge 1 && git diff --quiet "$BASE" -- app/src/store/db.js app/src/domain app/src/styles app/src/ui/useKeptDraft.js app/src/ui/CreationRoute.jsx app/src/ui/NotebookPlace.jsx app/src/ui/Shell.jsx app/src/ui/EditRoute.jsx app/src/ui/CreationFlow.test.jsx</automated>
    Gates and their baselines:
    - Probe check output ends "0 FAIL". Checking the base build against itself fails the after-checks, by design.
    - Full suite Tests [HEAD=4340 EXPECT==4348 @5ad63e63], Test Files [HEAD=132 EXPECT==133 @5ad63e63], 0 failed. If Step 0 read different counts because main moved, expect the Step 0 counts plus 8 tests and 1 file.
    - `grep -v '^\s*//' app/src/store/repository.js | grep -c "\['drafts', 'versions'\]"` [HEAD=0 EXPECT>=1 @5ad63e63]
    - `grep -v '^\s*//' app/src/ui/CreationPage.jsx | grep -c 'repository.getVersion'` [HEAD=0 EXPECT>=1 @5ad63e63]
    - BASE is the Step 0 value, set in the shell that runs this block. An unset BASE makes the git commands fail, and the chain stops.
    - Added `export const` lines in the captured diff of app/src/ui/CreationPage.jsx against BASE [HEAD=0 EXPECT==0 @5ad63e63 GUARD MUTATION: a new on-screen sentence constant]. The diff is captured first, so a failing git stops the chain instead of reading as clean.
    - The single-tab failure path (writer given back, the line under Save) is pinned by CreationFlow.test.jsx's "a rejected save keeps the draft, gives the writer back…", which stays unedited and green.
    - `grep -c 'WR-01' app/src/store/repository.test.js` [HEAD=0 EXPECT>=1 @5ad63e63]
    - `git diff --quiet "$BASE" -- app/src/store/db.js app/src/domain app/src/styles app/src/ui/useKeptDraft.js app/src/ui/CreationRoute.jsx app/src/ui/NotebookPlace.jsx app/src/ui/Shell.jsx app/src/ui/EditRoute.jsx app/src/ui/CreationFlow.test.jsx` exit status [HEAD=0 EXPECT==0 @5ad63e63 GUARD MUTATION: a DB_VERSION or shape change, the optional second line, an edit to the writer, or editing the single-tab pin]
  </verify>
  <done>The base build shows the ghost, the generic line, no Edit and the Notebook draft row in WebKit (and Chrome if it launched). The fixed build shows none of them, and the control walk passes in both. The full suite is green at the base counts plus 1 file and 8 tests. The scope gates hold. WR-01's disposition reads fixed. The probe is committed.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| tab ↔ tab, one IndexedDB | Two tabs of the same origin write the same drafts and versions stores. Neither sees the other's state except through the store. No new input is parsed. Stored draft records are already checked by draftMatchesCreate before they are restored. |
| probe → network | The probe serves scratch builds on 127.0.0.1 and aborts every request to another host. |

## STRIDE Threat Register

ASVS level 1. Any open high blocks; none is open.

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-261115-hto-01 | Tampering | repository.saveDraft: a create draft written back over a saved creation (the ghost that blocks Save, Import and Edit) | medium | mitigate | The version read and the put share one readwrite transaction over drafts and versions, so it is ordered against createRecipeWithVersion's transaction. A stored version means abort and resolve false, writing nothing. Pinned by S1 and U1. |
| T-261115-hto-02 | Tampering | CreationPage.handleSave: the saved-elsewhere path deleting the wrong draft | low | mitigate | It runs only when a version is stored under this creation's own id, which is drawn fresh at Start. discardDraft deletes only a create-family record, so a pen's or an edit's draft is never touched. The edit branch skips the read. Pinned by U2, U3 and the unchanged EditFlow suite. |
| T-261115-hto-03 | Tampering | CreationPage.handleSave: B's Save writing over A's stored version | low | mitigate | createRecipeWithVersion already refuses an existing id, writing nothing. U2 asserts the stored version is sameRecord-equal to what A saved. |
| T-261115-hto-04 | Denial of service | saveDraft: create writes now hold the versions store briefly | low | accept | Only create-kind writes widen their scope, one get per debounced write. Pen and edit writes keep the drafts-only transaction. |
| T-261115-hto-05 | Repudiation | Words typed in a stale tab after another tab saved are not kept | low | accept | That tab's Save leaves for the stored recipe with no claim that it saved them (no landing word). Telling the maker needs a new sentence, which goes to Mark through the SUMMARY. |
| T-261115-hto-06 | Information disclosure | 261115-hto-probe.mjs | low | mitigate | The walk server binds 127.0.0.1 on ephemeral ports (08-walk-server.mjs). The context aborts every non-127.0.0.1 request. Builds go to a scratch outDir, never to app/dist. |
| T-261115-hto-SC | Tampering | npm/pip/cargo installs | low | accept | No package is installed or added. playwright-core is used from the existing npx cache outside the repo, as earlier quick probes did. |
</threat_model>

<verification>
- At BASE, S1, U1, U2 and U3 fail for their stated reasons, while S2, S3, U4 and all four T-11-47 rows pass. After the fix every case passes. The RED and GREEN output is recorded.
- The probe check over scratch builds of BASE and of the fix ends in 0 FAIL, with WebKit recorded and Chrome recorded or reported.
- The full suite is at the Step 0 counts plus 1 file and 8 tests, with 0 failed.
- Only saveDraft (repository.js) and handleSave's catch (CreationPage.jsx) change in app code. db.js, app/src/domain, app/src/styles, useKeptDraft.js, CreationRoute.jsx, NotebookPlace.jsx, Shell.jsx, EditRoute.jsx and CreationFlow.test.jsx have no diff. CreationPage.jsx keeps 7 exported constants.
</verification>

<success_criteria>
- After another tab saves a creation, a tab still holding it can no longer write its create draft back. Its Save lands on the saved recipe and leaves no draft. The Notebook shows no kept creation, Import is not refused because of it, and the version offers Edit. This holds in jsdom over a real store, and in the built app in WebKit and Chrome.
- A ghost kept from before the fix clears on Save, as it already does on Cancel.
- Single-tab Save, Save failure, Cancel, pen drafts and edit drafts behave exactly as before. There is no new wording and no store version or shape change.
</success_criteria>

<output>
Create `.planning/quick/261115-hto-wr-01-11-review-md-phase-11-a-create-draft-can-be-written-ba/261115-hto-SUMMARY.md` when done. It records:
- BASE and the Step 0 suite counts;
- the RED output (S1, U1, U2 and U3 failing, each for its stated reason) and the GREEN output;
- the probe's base and after readings per engine, and whether Chrome launched;
- the full-suite counts and the scope gate results;
- the three commit hashes;
- the orchestrator notes from Task 2: WR-01 is fixed, the dist build is safe, the two points for Mark, no device step, and the note for sibling 261115-htp.
</output>
