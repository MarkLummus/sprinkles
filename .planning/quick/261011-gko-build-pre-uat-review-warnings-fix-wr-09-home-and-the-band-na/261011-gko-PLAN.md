---
phase: quick-261011-gko
plan: 01
quick_id: 261011-gko
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/domain/draft.js
  - app/src/domain/draft.test.js
  - app/src/ui/RecipeList.jsx
  - app/src/ui/RecipeList.test.jsx
  - app/src/ui/RecipePage.jsx
  - app/src/ui/RecipePage.drafts.test.jsx
  - app/src/ui/Shell.jsx
  - app/src/ui/PrintSheet.jsx
  - app/src/store/db.js
  - app/src/store/repository.js
  - app/src/main.jsx
  - app/src/store/db.test.js
  - app/src/store/repository.test.js
  - .planning/phases/04-prepare-the-next-version-for-making/04-boot-blocked-probe.mjs
autonomous: true
requirements: [UX1-02]

# Scope: the batch item build-pre-uat-review-warnings (Mark's List), i.e. four findings from
# .planning/phases/04-prepare-the-next-version-for-making/04-REVIEW.md, all `open` in 04-REVIEW-DISPOSITION.md:
#   WR-04 a restored draft can save a batch the import check rejects  -> Task 1 (draft.js)
#   WR-09 Home and the band name a draft that then vanishes on click  -> Task 1 (Home) + Task 2 (band, rail)
#   WR-05 a failed load silently stops draft restore                  -> Task 2 (RecipePage.jsx)
#   WR-08 a second tab on the old database version hangs boot         -> Task 3 (db.js, repository.js, main.jsx)
# Orchestrator scope addition (Mark answered "keep" on decide-new-lines-import-block-and-too-long): the two
# comments above IMPORT_BLOCKED_STATUS (Shell.jsx) and PRINT_TOO_LONG_LINE (PrintSheet.jsx) are rewritten to say
# the wording is approved. Comments only. This is a separate commit inside Task 2, because the batch caps the
# plan at three tasks.
# Siblings 261011-gkm and 261011-gkn already shipped in quick 261011-dz2 (ff07724, ee4987d) and are not
# dispatched, so depends_on is [].
# Out of scope (do not touch): WR-01 and WR-02 (named out by the item), WR-03 (import overwrite), WR-06/07
# (fixed), IN-01..IN-05, the Home load in RecipeList.jsx (Promise.all) and the print route's loads (WR-05 names
# RecipePage only), the "New words" comment in SheetCodeSearch.jsx, every stylesheet (no CSS change),
# transfer.js, .planning/STATE.md, .planning/ROADMAP.md, this PLAN.md and the SUMMARY.md (the quick orchestrator
# commits docs), the pre-existing modified .planning/state.json, the untracked
# .planning/phases/03.6-per-step-shared-ingredients/.gitkeep and .planning/quick-batches/. No task writes to
# Mark's List. Device checks for this item are already on the list, so no task adds one.
# File-count note: Task 3 touches 6 files, one over the 5-file guide. Two of them are tests and one is the probe,
# and all six serve the one concern (a blocked database upgrade).

must_haves:
  truths:
    - "WR-04: draftMatchesVersion returns false for a record or Correct draft whose payload carries an Exit consistency, Airiness or Melt style word outside SEGMENT_OPTIONS, an At draw or From freezer word outside MARK_ONE_OPTIONS, a defect chip outside DEFECTS, a declared defect that is not one of the declared problems or appears twice, or a mark on an axis the pen does not offer. A blank string still fits every one of those fields. A record draft is checked against the version's declaredFlaws and declaredAxes. A Correct draft is checked against the snapshot of the batch it corrects. The review's reproduction (declaredDefects ['NotDeclared'], marks { oil: 3 }, exitConsistency 'garbage', defects ['whatever'] on a version that declares neither Oil nor any problem) returns false. draftMatchesVersion never throws, even for a batch with no snapshot."
    - "WR-09, Home: the lead names a draft ('Draft open on this version · Go to draft') only when draftMatchesVersion accepts it against its own version and that version's batches. That is the check the recipe page's restore runs, so a named draft always reopens on click. A stale draft is not named and the lead falls back to the most recently touched recipe. If the newest draft is stale and an older one fits, the older one is named. A Correct draft whose batch is gone is not named."
    - "WR-09, recipe page: the band's 'Draft: Version N · name' line and the History rail's draft node name another version's kept Next version draft only when draftMatchesVersion accepts it against that version. The name comes from a payload whose versionLabel has been checked to be a string."
    - "WR-05: when any of the recipe page's store reads fails (the version, its batches, the drafts list, the versions list, every batch, the recipe, the cited batch, the parent version), the page shows the one line 'Could not open the local store. Try reloading.' (the boot failure's own sentence, so no new words) instead of rendering nothing or a normal-looking page. The draft restore does not run, the kept draft stays in the store untouched, and no pen opens. The restore's quiet delete of a stale draft is caught, so a failed delete is no unhandled rejection."
    - "WR-08: if a connection on an older database version is held open in another tab, boot replaces 'Opening your recipes…' with 'Close other Sprinkles tabs to finish updating.' and boots to Home on its own once that tab closes. Proven in real WebKit and Chrome by the new probe. If a newer database version asks this build's connection to step aside, the connection closes and the tab reloads, so the next version bump cannot hang against this build."
    - "The comments above IMPORT_BLOCKED_STATUS in app/src/ui/Shell.jsx and PRINT_TOO_LONG_LINE in app/src/ui/PrintSheet.jsx say the wording is approved by Mark (2026-10-11) and name decide-new-lines-import-block-and-too-long. No code or string in either file changes."
    - "The full suite passes, including the tabindex scan and the cross-cutting token scan, and `npm --prefix app run build` succeeds. No CSS file changes. Only db.js under app/src imports idb."
  artifacts:
    - path: app/src/domain/draft.js
      provides: "draftMatchesVersion with value checks on a record or Correct payload against SEGMENT_OPTIONS, MARK_ONE_OPTIONS, DEFECTS and the declared problems and axes of the version or the corrected batch's snapshot"
      contains: "from './battery.js'"
    - path: app/src/ui/RecipeList.jsx
      provides: "HomeBody names only a draft that draftMatchesVersion accepts"
      contains: "draftMatchesVersion"
    - path: app/src/ui/RecipePage.jsx
      provides: "waitingPlanDraft filtered by draftMatchesVersion; loadFailed state, every load caught, PAGE_LOAD_ERROR line; the restore's stale-draft delete caught"
      contains: "export const PAGE_LOAD_ERROR = 'Could not open the local store. Try reloading.';"
    - path: app/src/store/db.js
      provides: "openStore({ onBlocked }) with blocked and blocking handlers"
      contains: "blocking("
    - path: app/src/store/repository.js
      provides: "repository.onBlocked(listener), sticky"
      contains: "onBlocked("
    - path: app/src/main.jsx
      provides: "the blocked boot line, registered before seedIfEmpty is awaited"
      contains: "const STORE_BLOCKED_LINE = 'Close other Sprinkles tabs to finish updating.';"
    - path: .planning/phases/04-prepare-the-next-version-for-making/04-boot-blocked-probe.mjs
      provides: "real-browser proof (WebKit, Chrome) that a held older-version connection shows the blocked line and boot finishes when it closes"
  key_links:
    - from: app/src/ui/RecipeList.jsx (HomeBody)
      to: app/src/domain/draft.js (draftMatchesVersion)
      via: "the same check RecipePage's restore effect runs, so Home names exactly the drafts that restore"
    - from: app/src/ui/RecipePage.jsx (waitingPlanDraft)
      to: app/src/ui/VersionRow.jsx and app/src/ui/RecipeHistory.jsx
      via: "draft and waitingDraft props, both fed from the one filtered waitingPlanDraft"
    - from: app/src/store/db.js (blocked)
      to: app/src/main.jsx (boot line)
      via: "repository.onBlocked, registered before await seedIfEmpty(repository)"
---

<objective>
Fix four open review warnings from Phase 04 before UAT, so the draft feature, the recipe page and boot do not fail silently. Per the batch item build-pre-uat-review-warnings, the findings come from .planning/phases/04-prepare-the-next-version-for-making/04-REVIEW.md and are all `open` in 04-REVIEW-DISPOSITION.md. WR-01 and WR-02 are out of scope.

- WR-04: a restored draft can no longer carry a value that would make Save write a batch the import validator rejects.
- WR-09: Home, the band and the History rail name only drafts that will actually reopen. The restore check is D-15's, and D-18 has Home naming the open draft.
- WR-05: a failed store read on the recipe page says so. Draft keeping (D-16) is never silently off, and the kept draft is never deleted because of a failed read.
- WR-08: a second tab on an older database version no longer hangs boot without a word, and this build steps aside for the next version bump.
- Orchestrator addition: the two comments that still call the import-block and too-long sentences proposed are rewritten to record Mark's approval (decide-new-lines-import-block-and-too-long = keep).

Purpose: these are the gaps the code review found at the edges of the draft feature (UX1-02: entered data survives a recoverable failure). Mark's end-of-phase UAT exercises exactly these paths.

Output: code and tests for the four fixes, one real-browser probe for WR-08, and the two comment rewrites. The SUMMARY records the baseline and final test counts, the probe output, the structural choices named in each task and the one new sentence pending Mark's approval.
</objective>

<execution_context>
@/Users/mark/.claude/gsd-core/workflows/execute-plan.md
@/Users/mark/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@/Users/mark/Documents/projects/sprinkles/CLAUDE.md
@/Users/mark/Documents/projects/sprinkles/.claude/CLAUDE.md
@/Users/mark/Documents/projects/sprinkles/.planning/STATE.md
@/Users/mark/Documents/projects/sprinkles/.planning/phases/04-prepare-the-next-version-for-making/04-REVIEW.md
@/Users/mark/Documents/projects/sprinkles/.planning/phases/04-prepare-the-next-version-for-making/04-REVIEW-DISPOSITION.md

# Source the tasks change (read each once; line numbers are as of base db4457b)
@/Users/mark/Documents/projects/sprinkles/app/src/domain/draft.js
@/Users/mark/Documents/projects/sprinkles/app/src/domain/battery.js
@/Users/mark/Documents/projects/sprinkles/app/src/domain/axes.js
@/Users/mark/Documents/projects/sprinkles/app/src/ui/RecipeList.jsx
@/Users/mark/Documents/projects/sprinkles/app/src/store/db.js
@/Users/mark/Documents/projects/sprinkles/app/src/store/repository.js
@/Users/mark/Documents/projects/sprinkles/app/src/main.jsx
# RecipePage.jsx is 2,581 lines: read only 640-1260 (RecipeNotFound, the load effects, the draft restore and
# persist effects, the early returns, waitingPlanDraft) and 2318-2380 (VersionRow and RecipeHistory props).
# transfer.js: read only 200-288 (validateMarks, validateTasting) and 349-443 (validateBatch), the checks WR-04 mirrors.
# Tests to extend: app/src/domain/draft.test.js (fixtures at 15-99), app/src/ui/RecipeList.test.jsx (HomeBody draft
# block at 342-445), app/src/ui/RecipePage.drafts.test.jsx (in-memory repository mock at 22-82, mountAt/flush at
# 137-173, sibling draft helpers at 684-759), app/src/store/db.test.js, app/src/store/repository.test.js.
# Probe pattern: .planning/phases/04-prepare-the-next-version-for-making/04-print-oversize-probe.mjs and the harness
# .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs (startServers, launch, check, finish).
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: A draft fits only when its values could be saved (WR-04), and Home names only a draft that fits (WR-09, Home)</name>
  <files>app/src/domain/draft.js, app/src/domain/draft.test.js, app/src/ui/RecipeList.jsx, app/src/ui/RecipeList.test.jsx</files>
  <behavior>
    - draft.test.js, record draft on oliveOilVersion (declaredAxes Body and Oil, declaredFlaws Bitter): fits with each SEGMENT_OPTIONS word in its own field, each MARK_ONE_OPTIONS word in atDraw and fromFreezer, a DEFECTS chip, declaredDefects ['Bitter'] and marks { body: 2, oil: 4 }. Refused with exitConsistency 'garbage', airiness 'fluffy', meltStyle 'runny', atDraw 'See below' (a printed-only word), fromFreezer 'maybe', defects ['whatever'], declaredDefects ['NotDeclared'], or declaredDefects ['Bitter', 'Bitter'].
    - draft.test.js, record draft on a clone of oliveOilVersion with declaredAxes [] and declaredFlaws []: the review's reproduction (declaredDefects ['NotDeclared'], marks { oil: 3 }, exitConsistency 'garbage', defects ['whatever']) is refused. marks { oil: 3 } alone is refused too, and marks { hardness: 3 } fits.
    - draft.test.js, Correct draft: declared problems and axes come from the corrected batch's snapshot, not the live version. A Correct draft with declaredDefects ['Bitter'] and marks { oil: 3 } fits on a version clone with declaredAxes [] and declaredFlaws [] while the batch (augustSecondBatch) snapshot declares them. A record draft with the same values on that clone is refused.
    - draft.test.js: draftMatchesVersion returns false, and never throws, for a Correct draft whose batch has no snapshot and whose payload ticks a declared defect.
    - RecipeList.test.jsx: a stale draft is not named: wrong shapeVersion, or a plan payload missing one of the version's rows. The lead falls back to the most recently touched recipe. If the newest draft is stale and an older one fits, the older one is named. A Correct draft whose batch is not in `batches` is not named. This flips the second assertion of the existing "a Correct draft links to its batch’s address…" case. A record draft whose declaredDefects are outside its version's declaredFlaws is not named. Every existing HomeBody draft case still passes.
  </behavior>
  <action>
Write the tests first, then run them and confirm the new refusal cases fail (the genuine red). Record that run for the SUMMARY. Then implement.

draft.js (WR-04): import SEGMENT_OPTIONS, MARK_ONE_OPTIONS and DEFECTS from './battery.js', and axesForVersion beside the existing AXES and STOPS import from './axes.js'. battery.js has no imports, so draft.js stays pure. Leave fitsRecordShape exactly as it is. Add a new function next to it, for example fitsRecordValues(candidate, declared), where declared is { flaws, axisKeys }. It returns false when:
- exitConsistency, airiness or meltStyle is neither '' nor one of SEGMENT_OPTIONS[field];
- atDraw or fromFreezer is neither '' nor one of MARK_ONE_OPTIONS;
- any defects entry is not in DEFECTS;
- any declaredDefects entry is not in declared.flaws, or the list holds a word twice;
- any marks key is not in declared.axisKeys.

These mirror validateTasting and validateBatch in app/src/store/transfer.js (lines 227-288, 349-443). Copy their option lists from battery.js; do not import transfer.js.

In draftMatchesVersion, call the value check on record.payload only. A record draft uses the version's declared lists. A Correct draft uses the snapshot of the batch found in `batches` by record.amendingBatchId. The amend branch already finds that batch, so reuse the lookup. Build declared lists defensively so the function never throws: flaws is the source's declaredFlaws when it is an array, else []. axisKeys is the keys of axesForVersion over { declaredAxes } when that is an array, else the four core keys. The batch's own snapshot may be absent (`batch.snapshot?.…`). The Correct draft's amendBaseline keeps the shape-only check: it is the comparison the dirty check reads and is never written, while WR-04 is about what Save writes. Note that choice in a short comment.

Update the JSDoc of draftMatchesVersion to say the payload's values must be ones the pen offers and Save could store. Keep the wording plain and in the existing comment style. The existing case "accepts as-made values and marks that name the version’s own rows and the six axes" stays green (oliveOilVersion declares Oil). Retitle it to say "the version’s axes".

RecipeList.jsx (WR-09, Home): import draftMatchesVersion beside newestDraft. In HomeBody, replace the "its version exists" filter with one that keeps a record only when its version is in `versions` and draftMatchesVersion(record, thatVersion, batches filtered to that version id) is true. Take newestDraft of the survivors. A fitting Correct draft always has its batch in `batches`, so draftBatchId becomes the amendingBatchId whenever draft.kind is 'amend' (drop the now-redundant batches.some check). Rewrite the D-18 comment above it: only a draft that will reopen on its version is named, the same check the recipe page's restore runs (WR-09).

RecipeList.test.jsx: draftOn currently builds a bare object with no shapeVersion or payload, which the new filter refuses. Rebuild it on buildDraftRecord from '../domain/draft.js'. Keep its (versionId, overrides) signature so the existing cases read the same. Give it a plan payload built from oliveOilVersion: every makeVersion spreads its rows, method and authored, the way draft.test.js's planPayload does. Spread overrides over the built record so updatedAt and kind overrides still apply. Add a small helper for a Correct draft with a blank 22-field record payload and an identical baseline, amendOpener 'correct', naming a batch id. Write the blank record locally, as draft.test.js does. Do not import RecipePage.jsx into this test. Then add the cases in behavior.

Scope: no other file. Do not change fitsPlanShape, KINDS, buildDraftRecord or newestDraft.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/domain/draft.test.js src/ui/RecipeList.test.jsx</automated>
  </verify>
  <done>The red run (new refusal cases failing) is recorded, then both files pass. `grep -c "from './battery.js'" app/src/domain/draft.js` is 1. `grep -c "draftMatchesVersion" app/src/ui/RecipeList.jsx` is at least 2 (the import and the filter). The review's reproduction case exists in draft.test.js and passes. `git diff --stat` for this commit lists exactly the four files. One commit, `fix(quick-261011-gko): …`, staged with four explicit paths.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: The band names only a draft that fits (WR-09), a failed read says so (WR-05), and two approved-wording comments</name>
  <files>app/src/ui/RecipePage.jsx, app/src/ui/RecipePage.drafts.test.jsx, app/src/ui/Shell.jsx, app/src/ui/PrintSheet.jsx</files>
  <behavior>
    - Band (WR-09): with withSibling on, a stored sibling plan draft that no longer fits its own version shows no band draft line and no rail draft node. Example: siblingPlanDraft('40 g oil') with one row deleted from payload.rows, or with payload.versionLabel set to 42. The existing case with a fitting sibling draft still reads 'Draft: Version 3 · 40 g oil'.
    - Failed read (WR-05): with a plan draft stored on VERSION and listBatchesForVersion rejecting, the page shows PAGE_LOAD_ERROR. No Next version pen opens, deleteDraft is never called, store.drafts still holds VERSION, and DRAFT_KEPT_STATUS is never announced.
    - Failed read (WR-05): with getVersion rejecting, the page shows PAGE_LOAD_ERROR, not an empty container.
    - Failed read (WR-05): with listVersions, listDrafts or getAllBatches rejecting, the page shows PAGE_LOAD_ERROR. One parametrised case is fine.
    - Stale-draft delete (WR-05): a stored draft that does not fit, with deleteDraft rejecting once, leaves the page in reading with no pen. The run reports no unhandled rejection (Vitest fails a run on one).
    - Every existing RecipePage.drafts.test.jsx case still passes.
  </behavior>
  <action>
First, the approved-wording comments, as their own commit before any code. These are comments only: no code, string or blank-line change.

In app/src/ui/Shell.jsx, replace the three-line comment directly above IMPORT_BLOCKED_STATUS (its parenthetical still says the sentence waits on Mark's approval) with these three lines:
- "// The page notice 'Close the open pen before importing.' (quick 261011-dz2,"
- "// decide-import-refreshes-open-recipe-pens = refuse). The one home of the sentence."
- "// Wording approved by Mark (2026-10-11): decide-new-lines-import-block-and-too-long."

In app/src/ui/PrintSheet.jsx, replace the two-line comment directly above PRINT_TOO_LONG_LINE (it opens by saying the sentence waits on Mark's approval) with these two lines:
- "// Wording approved by Mark (2026-10-11): decide-new-lines-import-block-and-too-long"
- "// (decide-print-oversized-text-policy = visible state). The one home of the sentence."

Commit just those two paths as `docs(quick-261011-gko): record Mark's approval of the import-block and too-long wording`. Leave the "New words" comment in SheetCodeSearch.jsx alone (not in scope).

Then write the RecipePage.drafts.test.jsx cases in behavior and run them to record the red. Make a load reject with vi.spyOn on the mocked `repository` object imported from '../store/repository.js'. afterEach already calls vi.restoreAllMocks. For the delete case, use store.deleteDraft.mockRejectedValueOnce. mountAt's flush stops after 40 turns without throwing, so it works when no .notebook-version ever renders. Import PAGE_LOAD_ERROR from './RecipePage.jsx' and never type the sentence in the test.

RecipePage.jsx, WR-09 (band and rail): where waitingPlanDraft is computed (about line 1242), keep the existing kind, other-version and same-recipe conditions. Add one: draftMatchesVersion(record, the record's version found in `versions`, allBatches filtered to that version id) is true. draftMatchesVersion is already imported. The VersionRow `draft` prop and the RecipeHistory `waitingDraft` prop both read this one variable. Change neither prop expression and neither component. Add a short comment: a draft that would not reopen on its own version is not named (WR-09), and the check also validates the payload's versionLabel the band prints.

RecipePage.jsx, WR-05 (loads):
- Export a constant beside the other page sentences near the top: PAGE_LOAD_ERROR = 'Could not open the local store. Try reloading.' This is word for word the boot failure line in app/src/main.jsx, so no new words. The comment says so.
- Add const [loadFailed, setLoadFailed] = useState(false) with the other page state, above every early return.
- Give every store read in the page's load effects a catch that, unless that effect's cancelled flag is set, calls setLoadFailed(true). That is getVersion(versionId), listBatchesForVersion, listDrafts, listVersions, getRecipe, getBatch for the cited batch, getVersion for the parent, and getAllBatches. Leave each effect's then branch as it is.
- Guard the restore effect so it does not start while loadFailed is true: add loadFailed to its early-return condition and to its dependency list. A page showing the failure line must not reopen a hidden pen, which would also make Import refuse with no pen in sight. Since listBatchesForVersion failing leaves batchesLoaded false, the restore never runs on that path and the kept draft is never judged against an empty batch list.
- In the restore effect's no-fit branch, the quiet delete of a stale draft is currently a bare statement with no catch. Write it the way discardDraft writes its delete: Promise.resolve().then(() => repository.deleteDraft(versionId)).catch(() => {}). Then call setDraftRestoreDone(true) as now.
- In the early returns, before the line that returns null while version is undefined, return a function component PageLoadFailed when loadFailed is true. Declare it next to RecipeNotFound. It renders the existing not-found container (the div with className "not-found", which already paints the Sheet ground with tokens) holding one paragraph with PAGE_LOAD_ERROR, and no link: the running head above already leads home, and a link would need tabIndex={0}. No CSS change, and no new class.

Scope: no other change in RecipePage.jsx. Not the persist effect, not the getDraft catch, not onPenOpenChange.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/ui/RecipePage.drafts.test.jsx src/ui/RecipePage.test.jsx src/ui/Shell.importGuard.test.jsx src/ui/PrintSheet.test.jsx src/ui/tabindex-scan.test.js</automated>
  </verify>
  <done>
- Comment commit: `grep -c "Wording approved by Mark (2026-10-11)" app/src/ui/Shell.jsx` is 1, and the same grep on app/src/ui/PrintSheet.jsx is 1. `! grep -qi "proposed copy" app/src/ui/Shell.jsx app/src/ui/PrintSheet.jsx` succeeds (both files match it today). `git show --stat HEAD~1` (the docs commit) lists exactly those two files. `git diff -U0 HEAD~2 HEAD~1 -- app/src/ui/Shell.jsx app/src/ui/PrintSheet.jsx | grep -E '^[+-][^+-]' | grep -vE '^[+-]//'` prints nothing, so only comment lines changed.
- Code commit: the red run is recorded, then the five files pass. `grep -c "export const PAGE_LOAD_ERROR = 'Could not open the local store. Try reloading.';" app/src/ui/RecipePage.jsx` is 1. `grep -v '^\s*//' app/src/ui/RecipePage.jsx | grep -c "setLoadFailed(true)"` is at least 8. `grep -nE '^\s+repository\.deleteDraft\(versionId\);' app/src/ui/RecipePage.jsx` prints nothing. `git diff --stat -- app/src/styles` is empty. One commit, `fix(quick-261011-gko): …`, staged with two explicit paths (RecipePage.jsx and its drafts test).
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: A blocked upgrade says what to do, and this build steps aside for the next one (WR-08)</name>
  <files>app/src/store/db.js, app/src/store/repository.js, app/src/main.jsx, app/src/store/db.test.js, app/src/store/repository.test.js, .planning/phases/04-prepare-the-next-version-for-making/04-boot-blocked-probe.mjs</files>
  <behavior>
    - db.test.js: open a raw connection at version 7 and hold it, so it is not closed. Then openStore({ onBlocked }) calls onBlocked once. After the raw connection closes, the openStore promise resolves at version 8 with all four stores.
    - db.test.js: with a connection from openStore() open and globalThis.location stubbed as { reload: vi.fn() }, a raw indexedDB.open(DB_NAME, 9) succeeds without its own blocked event, and reload was called once. Remove the stub afterwards.
    - db.test.js: openStore() with no argument still opens a fresh database at 8. The existing cases cover this and stay green.
    - repository.test.js: while a raw version-7 connection is held, createRepository() then onBlocked(listener) calls the listener. A listener registered after the event already fired is called at once, so registration is sticky. After the raw connection closes, listVersions() resolves to [].
    - Probe, WebKit and Chrome, on a scratch build: the app boots to Home with the blocked line never shown when no connection is held (control). When a same-origin page holds the database open at version 7, the boot line reads STORE_BLOCKED_LINE. Once that connection closes, Home's title 'Pick up where you left off' renders and the boot line is gone.
  </behavior>
  <action>
Write the db.test.js and repository.test.js cases first and record the red run. Both files use fake-indexeddb: db.test.js with a fresh IDBFactory per test, repository.test.js through fake-indexeddb/auto. For the held raw connection, follow seedOldProfile's request pattern but do not close the connection until the test says so. Poll for the onBlocked call with a short bounded loop of awaited ticks, never a fixed sleep.

db.js: openStore takes an options object, { onBlocked = () => {} } = {}, so every existing caller, including app/tests/db-reset.test.js, keeps calling openStore() unchanged. Pass two handlers to openDB beside upgrade:
- blocked(): calls onBlocked(). Another tab holds an older version open, so this open waits until that tab closes.
- blocking(currentVersion, blockedVersion, event): a newer version wants the database. Close this connection through event.target.close(), which idb hands over as the raw database, so the other tab can upgrade. Then call globalThis.location?.reload() so this tab comes back on the new build. Optional chaining keeps the node test environment safe.

Comment both in the file's own style. Explain that the close comes before the reload so the other tab is never left waiting. Say that the reload's pagehide flush can then no longer write, so up to the last 250 ms of typing can be lost, the same bound RecipePage's pagehide comment already accepts. Leave the upgrade callback unchanged. idb 8.0.3's signature is openDB(name, version, { upgrade, blocked, blocking, terminated }), confirmed in app/node_modules/idb/build/entry.d.ts.

repository.js: in createRepository, keep a blocked flag and a single listener slot. Pass openStore an onBlocked that sets the flag and calls the listener when one is set. Add a method onBlocked(listener) that stores the listener and calls it at once if the flag is already set. The seam stays the only path to the store, and main.jsx never imports db.js.

main.jsx: add a module-level constant STORE_BLOCKED_LINE = 'Close other Sprinkles tabs to finish updating.' with the comment "New words, pending Mark's approval." Directly after the line that renders the opening boot line, and before the await of seedIfEmpty, call repository.onBlocked with a listener that renders that line in the same app-boot paragraph. Nothing else changes: when the other tab closes, seedIfEmpty resolves and App renders as now, and the existing failure path is untouched. Do not export anything from main.jsx.

Probe (WebKit and Chrome), modelled on 04-print-oversize-probe.mjs:
- Import webkit from the same absolute playwright-core path. Import startServers, launch, check and finish from the 03.5 harness. Read STORE_BLOCKED_LINE out of app/src/main.jsx with a regex, so the sentence keeps one home.
- In each engine, run the control case first: a fresh context goes to the app root and shows Home with no blocked line.
- Then the blocked case, in a fresh context:
  - Page A navigates to a same-origin static file that runs no app code. Use the first .css file in the scratch build's assets directory, found with readdirSync.
  - Page A evaluates an indexedDB.open('sprinkles', 7) that resolves once open and keeps the result on window.
  - Page B navigates to the app root and waits for p.app-boot to carry the line.
  - Page A closes its held connection. Page B then shows h1.home__title 'Pick up where you left off', and no p.app-boot remains.
- Count every check and end with finish(failures, count, 'boot-blocked-probe').

Build to the executor's scratchpad, never app/dist, which Mark's vite preview on :4173 serves. Never touch :4173 or :8077. Kill any duplicate Vite process first, per the conventions. Run with the two commands in verify, with SCRATCH set to the absolute path of the executor's own scratchpad directory. Record the probe's full output, and both commands, in the SUMMARY. Chrome and Playwright's WebKit do not prove Mobile Safari: the iPad check is already on Mark's List. Do not add a row.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/store/db.test.js src/store/repository.test.js tests/db-reset.test.js</automated>
    <automated>npm --prefix app run build -- --outDir "$SCRATCH/gko-dist" --emptyOutDir && PROBE_DIST="$SCRATCH/gko-dist" node .planning/phases/04-prepare-the-next-version-for-making/04-boot-blocked-probe.mjs</automated>
  </verify>
  <done>The red run is recorded, then the three test files pass, and the probe ends "boot-blocked-probe: N checks passed" and exits 0 in both engines. `grep -v '^\s*//' app/src/store/db.js | grep -c "blocking("` is 1. `grep -v '^\s*//' app/src/store/repository.js | grep -c "onBlocked("` is at least 1. `grep -v '^\s*//' app/src/main.jsx | grep -c "repository.onBlocked("` is 1, and in `grep -n` output that line comes before `await seedIfEmpty(repository)`. `grep -rln "from 'idb'" app/src` lists only app/src/store/db.js. One commit, `fix(quick-261011-gko): …`, staged with six explicit paths.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| drafts store -> pen state | A stored draft (possibly from before an import replaced its version) is restored into a pen whose Save writes versions and batches |
| drafts store -> Home and band text | A stored draft's payload names a draft on screen (versionLabel) |
| store reads -> page state | A failed IndexedDB read leaves the page's state partial |
| another tab's connection -> this tab's boot | An open connection on another database version blocks or is blocked by this tab's open |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-261011-gko-01 | Tampering (a restored draft saves a batch the app's own import rejects) | app/src/domain/draft.js draftMatchesVersion | medium | mitigate | Task 1 checks the payload's values against SEGMENT_OPTIONS, MARK_ONE_OPTIONS, DEFECTS and the declared lists of the version or the corrected batch's snapshot, mirroring validateTasting and validateBatch. A draft that fails is deleted quietly by the existing restore, as before. |
| T-261011-gko-02 | Spoofing (the UI names a draft that is not there) | RecipeList.jsx HomeBody, RecipePage.jsx waitingPlanDraft | low | mitigate | Tasks 1 and 2 filter with the same draftMatchesVersion the restore runs, so a named draft always reopens. |
| T-261011-gko-03 | Tampering (unvalidated stored text printed in the band) | VersionRow.jsx waiting draft name | low | mitigate | Only a draft that passes fitsPlanShape (versionLabel is a string) and carriesUnsafeKey reaches the band. It renders as React text, with no dangerouslySetInnerHTML anywhere under app/src. |
| T-261011-gko-04 | Denial of service (a failed read silently turns draft keeping off; a kept draft is judged against an empty batch list and deleted) | RecipePage.jsx load effects, restore effect | medium | mitigate | Task 2 catches every load, shows PAGE_LOAD_ERROR in place of the page and keeps the restore from starting, so no pen opens and the kept draft stays stored. The stale-draft delete is caught. |
| T-261011-gko-05 | Denial of service (boot hangs on a blocked upgrade with no message; a future bump hangs against this build) | db.js openStore, main.jsx boot | medium | mitigate | Task 3 adds blocked (the boot line names the fix) and blocking (close, then reload). The probe proves the blocked path in WebKit and Chrome. |
| T-261011-gko-06 | Denial of service (the reload on blocking loses the last keystrokes) | db.js blocking | low | accept | At most the 250 ms debounce window, the same bound the pagehide flush already accepts. Earlier keystrokes are already stored. |
| T-261011-gko-SC | Tampering | npm/pip/cargo installs | high | accept | No package is installed or upgraded by this plan. idb 8.0.3, fake-indexeddb and playwright-core are already present. Any install found necessary stops the task for a human checkpoint. |
</threat_model>

<verification>
- Before Task 1, run `npm --prefix app test` and record the baseline file and test counts. The base is db4457b. After Task 3, run it again: the full suite passes, including app/src/ui/tabindex-scan.test.js and app/src/styles/cross-cutting.test.js. Record both counts in the SUMMARY.
- `npm --prefix app run build` (or the scratch build in Task 3) succeeds.
- The boot-blocked probe exits 0 in WebKit and Chrome. Its output is in the SUMMARY.
- `git status --porcelain` after the four commits shows only the pre-existing .planning/state.json, the untracked 03.6 .gitkeep, the untracked .planning/quick-batches/ directory and the orchestrator's docs.
- Source audit:
  - GOAL (the batch item) is covered: WR-04 by Task 1, WR-09 by Tasks 1 and 2, WR-05 by Task 2, WR-08 by Task 3, and the orchestrator's comment addition by Task 2's docs commit.
  - REQ UX1-02 is covered by Tasks 1 to 3.
  - CONTEXT: D-15 (the restore check) and D-18 (Home names the draft) are covered by Tasks 1 and 2, and D-16 (the draft lasts until Save or Cancel) by Task 2.
  - Exclusions per the item and scope: WR-01, WR-02, WR-03, IN-01 to IN-05.
</verification>

<success_criteria>
- A draft is offered back, named on Home, in the band or on the rail, only when it will reopen and its values could be saved.
- A recipe page that cannot read the store says so in one line, opens no pen and deletes no kept draft.
- Boot with an older-version tab open shows what to do and finishes once that tab closes. This build closes its connection and reloads when a newer version needs the database.
- The two approved sentences' comments record the approval. No code in those files changes.
- Four atomic commits with explicit pathspecs. No CSS change, no new dependency, and the repository seam stays the only path to idb.
</success_criteria>

<output>
Create `.planning/quick/261011-gko-build-pre-uat-review-warnings-fix-wr-09-home-and-the-band-na/261011-gko-SUMMARY.md` when done. Include:
- the baseline and final test counts and the red runs of each task;
- the probe output and the two commands to re-run it;
- the structural choices:
  - payload-only value checks, with the baseline kept shape-only;
  - Home and the band filtered with draftMatchesVersion, rather than importAll deleting drafts (that belongs with WR-03);
  - a failed read replaces the page, rather than continuing with empty batches (which would offer Save over on a churned version and delete a Correct draft);
  - a sticky repository.onBlocked;
  - blocking closes, then reloads;
- a "Pending wording" line naming 'Close other Sprinkles tabs to finish updating.' (main.jsx STORE_BLOCKED_LINE) for Mark's approval;
- a Deferred Human Verification section that points at the device checks already on Mark's List for this item and adds none.
</output>
