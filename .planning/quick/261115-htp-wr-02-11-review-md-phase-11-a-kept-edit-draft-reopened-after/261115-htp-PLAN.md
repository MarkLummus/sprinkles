---
phase: quick-261115-htp
plan: 01
quick_id: 261115-htp
type: execute
wave: 2
depends_on: ["261115-hto"]
files_modified:
  - app/src/domain/firstVersion.js
  - app/src/domain/firstVersion.test.js
  - app/src/ui/EditRoute.jsx
  - app/src/ui/CreationPage.jsx
  - app/src/ui/useKeptDraft.js
  - app/src/ui/EditRoute.staleEdit.test.jsx
  - app/src/store/repository.js
  - app/src/store/repository.test.js
  - .planning/quick/261115-htp-wr-02-11-review-md-phase-11-a-kept-edit-draft-reopened-after/261115-htp-probe.mjs
autonomous: true
requirements:
  - WR-02

must_haves:
  truths:
    - "Two tabs over one store: tab A starts an edit and types (an edit draft is kept), tab B resumes it, changes the description and saves over the version, and tab A types again, which writes the edit draft back. A fresh tab that resumes that kept edit shows EDIT_CHANGED under Save from its first render. Pressing Save calls no repository write. B's saved content stays (the version's sheetDescription and the recipe's description still read 'Saved by B.'). The page stays on the edit address, focus goes to Save on every press, and the kept edit stays until Cancel (D-06). Cancel lands on the version page with the draft gone and B's content intact."
    - "An edit draft stored before this change carries no baseFingerprint. It opens on its ink (Draft kept.) with EDIT_CHANGED under Save from the first render, and Save writes nothing. Typing in it keeps it without a base, so retyping never makes it saveable. Cancel ends it, and the next Edit starts from the stored version."
    - "Single tab is unchanged. An edit kept in one tab and reopened shows no line under Save, and Save writes over the version and lands on the version page, as before. A fresh edit's Save is unchanged. A kept edit on a version that has gained a batch or a later version still shows EDIT_HAS_BATCH or EDIT_HAS_CHILD: firstVersionRefusal's reason is read before the base."
    - "Every edit record the editor writes carries baseFingerprint: the fingerprint of the seed that draftFromVersion gave when the edit began, or the kept record's own base when the edit was resumed. A kept edit is never re-based to the version as it reads now."
    - "repository.saveDraft resolves false and writes nothing for an edit record when no stored version has its versionId. Create writes and pen writes behave as 261115-hto left them."
    - "No DB_VERSION change and no stored-shape reset. app/src/domain/draft.js is unchanged, so CREATE_DRAFT_KEYS and the payload stay closed. No new on-screen sentence: CreationPage's exported strings are unchanged and EDIT_CHANGED is the only line used."
    - "The built app, in Playwright WebKit with two pages in one browser context: the base build reproduces the overwrite, and the fixed build refuses it and keeps B's save."
  artifacts:
    - path: app/src/domain/firstVersion.js
      provides: "fingerprint(value): a 16-hex-digit 64-bit FNV-1a of canonical(value), beside sameRecord"
      contains: "export function fingerprint"
    - path: app/src/ui/EditRoute.jsx
      provides: "Computes fingerprint(seed). Compares it with keptEdit.baseFingerprint and passes 'changed' as closedReason when they differ, after firstVersionRefusal's reason. Passes baseFingerprint (the kept record's, or the fresh seed's for a new edit) to CreationPage."
      contains: "baseFingerprint"
    - path: app/src/ui/CreationPage.jsx
      provides: "A baseFingerprint prop handed to useKeptDraft. handleSave refuses with 'changed' before taking the lock when closedReason is 'changed'."
      contains: "baseFingerprint"
    - path: app/src/ui/useKeptDraft.js
      provides: "A baseFingerprint parameter. The persist effect adds it to every edit record when it is a string."
      contains: "baseFingerprint"
    - path: app/src/store/repository.js
      provides: "saveDraft refuses an edit write (resolves false) when no version has the record's versionId, in the same readwrite transaction as the family guard"
      contains: "versions"
    - path: app/src/ui/EditRoute.staleEdit.test.jsx
      provides: "Three tests over one real fake-indexeddb store: the WR-02 two-tab sequence, a kept edit without a base, and the single-tab round trip with the record's base"
      contains: "261115-htp"
    - path: .planning/quick/261115-htp-wr-02-11-review-md-phase-11-a-kept-edit-draft-reopened-after/261115-htp-probe.mjs
      provides: "A record/check Playwright probe over scratch builds of BASE and the fix, in WebKit (required) and Chrome"
      contains: "record"
  key_links:
    - from: app/src/ui/EditRoute.jsx
      to: app/src/domain/firstVersion.js
      via: "seedFingerprint = fingerprint(seed). baseChanged is keptEdit !== null && keptEdit.baseFingerprint !== seedFingerprint. The refusal for a kept edit is refusal ?? (baseChanged ? 'changed' : null)."
      pattern: "fingerprint\\(seed\\)"
    - from: app/src/ui/EditRoute.jsx
      to: app/src/ui/CreationPage.jsx
      via: "The closedReason and baseFingerprint props on <CreationPage mode=\"edit\">"
      pattern: "baseFingerprint="
    - from: app/src/ui/CreationPage.jsx
      to: app/src/ui/useKeptDraft.js
      via: "useKeptDraft({ ..., baseFingerprint }). The persist effect's creating branch adds baseFingerprint to the record built for creationKind 'edit'."
      pattern: "baseFingerprint"
    - from: app/src/ui/CreationPage.jsx
      to: app/src/store/repository.js
      via: "handleSave returns before savingRef/endDraft and before repository.saveFirstVersionOver when editing && closedReason === 'changed'. A page whose base matched keeps expected = the records read at open, whose seed fingerprint equals the base, so the transaction's sameRecord check is the base check at Save."
      pattern: "closedReason === 'changed'"
---

<objective>
Fix WR-02 from .planning/phases/11-steps-structure-save-and-print/11-REVIEW.md (the "### WR-02" section). A kept edit draft reopened after another tab saved over the version silently overwrites that save. Mark's instruction (2026-11-15): "confirm that they reproduce; if they do then fix".

**Reproduced at planning HEAD 5ad63e63.** Planning used a throwaway two-tab test over one real fake-indexeddb store, modelled on app/src/ui/RecipePage.stalePen.test.jsx. The file was deleted afterwards and the tree under app/ is clean. The readings:
1. Tab A opens /edit on a stored first version and types 'Vanilla A'. An edit draft is kept, and its record keys are only buildDraftRecord's.
2. Tab B opens /edit, restores 'Vanilla A', types the description 'Saved by B.' and saves. The version's sheetDescription reads 'Saved by B.' and the draft is gone.
3. Tab A, still open, types 'Vanilla A2'. **The edit draft is written back** (kind edit, name 'Vanilla A2', description '').
4. Tab A presses Save on the page it still holds. It shows EDIT_CHANGED and writes nothing. This in-page path is already guarded at HEAD, and the review says so.
5. A fresh tab C opens /edit and restores 'Vanilla A2', with **no line under Save**. Save lands on the version page. **The version's sheetDescription and the recipe's description are now '': B's 'Saved by B.' is lost with no warning.**
6. Separately, at the repository boundary, `repository.saveDraft` of an edit record for a version id that no version has resolves true and stores it. No app path reaches this: EditRoute mounts the editor only over a stored version, and no code under app/src deletes a version. It is planned because the item asks for it.

Nothing landed since the review covers this. `git log --since=2026-10-27 -- app/src` shows no change to EditRoute.jsx, to saveFirstVersionOver or to saveDraft. saveDraft changes only in 261115-hto, this item's dependency.

**Cause.** EditRoute builds `stored` (Save-over's `expected`) from the records it reads when the route opens, not from the records the edit began against, and the kept record carries no base. A kept edit resumed over a version that moved therefore passes every check in saveFirstVersionOver.

**The fix, prototyped at planning in an isolated scratch copy of app/ (never in the shared tree).** It follows the review's suggested fix:
- `fingerprint(value)` in app/src/domain/firstVersion.js, beside sameRecord: a 64-bit FNV-1a of `canonical(value)`.
- Every edit record carries `baseFingerprint`, an extra record key. It is not a payload key (CREATE_DRAFT_KEYS is closed), and fitsCreationRecord already accepts other record keys. Its value is the fingerprint of the seed when the edit began.
- EditRoute compares a kept edit's base with `fingerprint(seed)` of the version as it reads now. When they differ, it passes `closedReason: 'changed'`, so EDIT_CHANGED stands under Save from the first render. It passes the kept record's own base on, so typing never re-bases.
- handleSave refuses a 'changed' page before the lock, with no write.
- saveDraft refuses an edit write when no version has the id.

With these, the three red UI tests and the saveDraft test passed. The scratch copy's full suite then passed, 133 files and 4344 tests, once the four family-guard tests that store edit drafts with no version were given a stored version (see Task 2).

**Why this holds at Save, not only at open.** There are two cases.
- **The base matched at open.** `expected` is then the records read at open, and their seed's fingerprint is the base. The transaction's sameRecord check against `expected` is the base check at the moment of Save. A save from another tab after the page opened is refused 'changed', as at HEAD.
- **The base did not match, or is absent.** Save never reaches the store, on the first press or any later one. A page's base never changes, so the refusal lasts as long as the page.

**Decisions recorded (Claude's discretion; Mark can overrule).**
- **A kept edit stored before this change has no baseFingerprint. It opens on its ink, refused.** EDIT_CHANGED stands under Save and Save writes nothing. Typing keeps it without a base, and Cancel ends it. Nothing records what such a draft was started from. The only other choice is to adopt the version as it reads now as the draft's base, and that is exactly the WR-02 overwrite. Refusing loses no saved content. At most it strands the ink of an edit begun before this build, which can be read and copied before Cancel. One cost: EDIT_CHANGED says "This version changed in another tab." That may be untrue for an old draft whose version did not change. Only existing wording is allowed (a new sentence means stop and report), so it stays.
- **The comparison is strict inequality** (`keptEdit.baseFingerprint !== seedFingerprint`). An absent, non-string or forged base reads as changed, never as a match.
- **The fingerprint covers the seed, not the whole stored records,** as the review suggests. The seed is exactly what Save-over writes. applyEditToVersion keeps every other field as the version stores it now. So a change from another tab outside the seed's fields is never overwritten and need not refuse.
- **The saveDraft base check the review calls "ideally" is not planned.** That check would refuse the write-back at step 3 itself. It would make the store import draftFromVersion and read recipes and styles inside the draft transaction. With the open and Save guards above, a written-back draft can no longer overwrite anything: it opens refused, and Cancel ends it.
- **No device check for Mark.** Two Safari tabs on the iPad would show the same thing as the WebKit walk. The orchestrator owns any list row.

Purpose: a maker's save in one tab is never silently replaced by an older kept edit from another tab.
Output: about 25 changed lines across five source files, a three-test two-tab file, a fingerprint pin, one saveDraft test plus fixture updates, and a probe. Five commits: test (red), fix, test (red, store), fix (store), probe.
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
- .planning/phases/11-steps-structure-save-and-print/11-REVIEW.md, the "### WR-02" section (lines 135-147 at planning).
- The 261115-hto SUMMARY under .planning/quick/261115-hto-wr-01-11-review-md-phase-11-a-create-draft-can-be-written-ba/ and `git log --oneline -8 -- app/src/store/repository.js app/src/ui/CreationPage.jsx`. These say what WR-01 changed in repository.saveDraft and CreationPage.handleSave. Extend that shape. Do not assume planning's line numbers.
- app/src/ui/EditRoute.jsx (92 lines at planning; read it whole).
- app/src/ui/CreationPage.jsx. The props and the mode 'edit' comment block are at about lines 141-151. useKeptDraft({...}) is at about 203-233. EDIT_CHANGED and editRefusalLine are at about 108-134. handleSave is at about 582-643: the field-refusal block `if (stands.length > 0)`, then `savingRef.current = true`, then the edit branch's saveFirstVersionOver.
- app/src/ui/useKeptDraft.js. The useKeptDraft parameter list is at about lines 144-171. The persist effect is at about 308-366: the `if (creating)` branch that calls buildDraftRecord with `kind: creationKind`.
- app/src/domain/firstVersion.js, lines 58-81 (canonical, sameRecord), and app/src/domain/firstVersion.test.js, lines 75-118 (the sameRecord cases and the purity test, which forbids crypto, Date and Math.random in code).
- app/src/domain/sheetCode.js, lines 42-45 and 120-129. fnv1a64 is the pattern to mirror: BigInt arithmetic, offset 0xcbf29ce484222325n, prime 0x100000001b3n. Do not import it or edit this file.
- app/src/ui/RecipePage.stalePen.test.jsx (239 lines, whole). It is the two-tab real-store harness to copy.
- app/src/store/repository.js saveDraft (about lines 451-484 at planning, before 261115-hto) and app/src/store/repository.test.js: makeVersion (about line 361) and the describe "a version’s one draft key is guarded by family" (about lines 868-930).
- .planning/quick/261114-ui5-edit-shows-at-once-when-a-kept-draft-tha/261114-ui5-probe.mjs (248 lines, whole). It is the probe analog.
- Do not edit: app/src/domain/draft.js, app/src/domain/creationSave.js, app/src/domain/sheetCode.js, app/src/store/db.js, app/src/ui/NotebookPlace.jsx, app/src/ui/Shell.jsx, app/src/ui/RecipeList.jsx, app/src/ui/RecipePage.jsx.
- Commit messages are English and end with these two lines:
  Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01VWwTRRV1yptqguV5CEBBew
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Base build, failing two-tab tests over the real store, then the base fingerprint end to end (one path: the edit record's base, EditRoute's comparison, the refused Save)</name>
  <files>app/src/ui/EditRoute.staleEdit.test.jsx, app/src/domain/firstVersion.js, app/src/ui/EditRoute.jsx, app/src/ui/CreationPage.jsx, app/src/ui/useKeptDraft.js</files>
  <precondition>261115-hto has merged into this branch: `git log --oneline -15 | grep -c 261115-hto` is at least 1. If not, stop and report: this item edits CreationPage.jsx and repository.saveDraft after it.</precondition>
  <read_first>
    - app/src/ui/RecipePage.stalePen.test.jsx (whole)
    - app/src/ui/EditRoute.jsx (whole)
    - app/src/ui/CreationPage.jsx (lines 108-151, 203-233, 582-643, by search after 261115-hto)
    - app/src/ui/useKeptDraft.js (lines 144-171 and 308-366)
    - app/src/domain/firstVersion.js (lines 58-81)
  </read_first>
  <behavior>
    - Test A (red at BASE). This is the review's sequence over one real store, in tabs opened with the harness's openTab and closed with a closeTab helper.
      1. storeVanilla.
      2. Tab A opens EDIT_PATH, types 'Vanilla A' into Recipe name, and settles 40 turns. Expect getDraft(VERSION_ID).kind to be 'edit'.
      3. Tab B opens EDIT_PATH and settles until Recipe name reads 'Vanilla A'. It types 'Saved by B.' into Recipe description, clicks Save, and settles until its path is PAGE_PATH. Expect getVersion's sheetDescription to be 'Saved by B.' and getDraft to be undefined.
      4. Tab A types 'Vanilla A2' and settles 40 turns. Expect getDraft's payload.name to be 'Vanilla A2' (the write-back).
      5. Tab A clicks Save and settles until a line stands under Save. Expect that line to be EDIT_CHANGED (the in-page path; it passes at BASE). Close tab A.
      6. Tab C opens EDIT_PATH and settles until Recipe name reads 'Vanilla A2'. **Expect the line under Save to be EDIT_CHANGED. This is the RED expectation.**
      7. Spy on repository.saveFirstVersionOver. Focus Recipe description, click Save, and settle 20 turns. Expect, in this order: the line under Save is EDIT_CHANGED; the path is EDIT_PATH; the spy was not called; document.activeElement is the Save button; getVersion's sheetDescription and getRecipe's description are both 'Saved by B.'; getDraft's kind is 'edit'.
      8. Focus Recipe description again, click Save, and settle 10 turns. Expect the spy still not called and focus on Save.
      9. Click Cancel and settle until the path is PAGE_PATH. Expect getDraft to be undefined, sheetDescription still 'Saved by B.', and the unhandled-rejection list empty.
    - Test B (red at BASE). A kept edit stored without a base.
      1. storeVanilla.
      2. repository.saveDraft a record built with buildDraftRecord: kind 'edit', payload the seed (seedOf(version, recipe)) with name 'Vanilla legacy'. Leave out baseFingerprint.
      3. Open EDIT_PATH and settle until Recipe name reads 'Vanilla legacy'. **Expect the line under Save to be EDIT_CHANGED. This is the RED expectation.**
      4. Spy on saveFirstVersionOver and click Save. Expect the spy not called, the line still EDIT_CHANGED, and getVersion's sheetTitle still 'Vanilla'.
      5. Type 'Vanilla legacy 2' and settle 40 turns. Expect the stored record's payload.name to be 'Vanilla legacy 2' and its baseFingerprint to be undefined.
      6. Expect no unhandled rejection.
    - Test C (passes at BASE until its last expectations). One tab.
      1. storeVanilla.
      2. Tab A opens EDIT_PATH, types 'Vanilla bean', and settles 40 turns. Read `kept = await repository.getDraft(VERSION_ID)`, then close tab A.
      3. Tab B opens EDIT_PATH and settles until Recipe name reads 'Vanilla bean'. Expect no line under Save.
      4. Click Save and settle until the path is PAGE_PATH. Expect the path PAGE_PATH, sheetTitle 'Vanilla bean', and the draft gone.
      5. Last, expect typeof kept.baseFingerprint to be 'string', and no unhandled rejection. **The typeof expectation is RED at BASE ('undefined').**
  </behavior>
  <action>
Step 0, before any edit under app/:
- `S="${TMPDIR:-/tmp}/sprinkles-htp"`, then `mkdir -p "$S"` and `git rev-parse HEAD > "$S/BASE"`. Planning was at 5ad63e63. BASE is HEAD after 261115-hto's merge.
- Record the full-suite counts from `npm --prefix app test`. Planning saw 132 files and 4340 tests at 5ad63e63, and 261115-hto adds its own.
- Build the base to scratch for Task 3: `npm --prefix app run build -- --outDir "$S/base-dist" --emptyOutDir`. Never write app/dist, and never touch the preview on 4173.
- Re-run the gate baselines in verify and note any that 261115-hto moved.

RED. Create app/src/ui/EditRoute.staleEdit.test.jsx by copying the harness of app/src/ui/RecipePage.stalePen.test.jsx: the docblock environment, 'fake-indexeddb/auto' as the first import, caseNumber ids with prefixes r-stale- and v-stale-, settle, openTab, field, buttonByText, click, type, storeVanilla, and beforeEach/afterEach with the unhandledRejection listener. Add:
- closeTab(tab), which unmounts, removes the container and drops the tab from the list;
- underSave(tab), which reads `.notebook-ceremony p.field-error` text or null;
- seedOf(version, recipe), which is normalizeAllocation(normalizeCreateDraft(draftFromVersion(version, recipe, catalog.styles)));
- vi.restoreAllMocks() first in afterEach.

Import EDIT_CHANGED from ./CreationPage.jsx and buildDraftRecord from ../domain/draft.js. Do NOT import fingerprint: a missing named export would stop the whole file loading at BASE and hide the behavioural reds.

Head the file with a comment naming WR-02 and its cause (Save-over's expected is re-read at open, and the kept edit carried no base). Name the describe "a kept edit begun on what the version no longer says (WR-02, 261115-htp)". Write Tests A, B and C from the behavior block. Test input values are English.

Run `npm --prefix app test -- src/ui/EditRoute.staleEdit.test.jsx`. Expected: all three fail.
- A fails on tab C's open-time EDIT_CHANGED expectation (received null). Every earlier expectation in A passes, including tab A's own EDIT_CHANGED.
- B fails on its open-time EDIT_CHANGED expectation (received null).
- C fails only on typeof kept.baseFingerprint (received 'undefined'), with the reopen and Save expectations before it passing.

Planning ran these exact sequences at 5ad63e63 and saw those three failures. If any fails earlier or for another reason, stop and report the output. Do not guess a fix. Keep the failing output for the SUMMARY. Commit the test alone: `test(261115-htp): a kept edit resumed after another tab saved over the version shows the changed line and Save writes nothing, red until the fix (WR-02)`.

GREEN:
- app/src/domain/firstVersion.js. After sameRecord, add an exported `fingerprint(value)`: a 64-bit FNV-1a over the UTF-16 code units (charCodeAt) of canonical(value), with BigInt arithmetic as sheetCode.js's fnv1a64 uses (same offset basis, same prime, masked to 64 bits), returned as the hash in lowercase hex padded to 16 digits. Give it a JSDoc. It should say that the function returns the same string for two values sameRecord calls equal, and a different one for any leaf change, except with negligible chance. It is not a security hash. The edit route keeps it as the base an edit began from (WR-02). Do not import from or edit sheetCode.js. Keep the module pure: the purity test forbids crypto, Date and Math.random in code.
- app/src/ui/EditRoute.jsx. Import fingerprint beside firstVersionRefusal. Right after `seed` is computed:
  - `seedFingerprint = fingerprint(seed)`;
  - `baseChanged = keptEdit !== null && keptEdit.baseFingerprint !== seedFingerprint` (strict inequality, so an absent or non-string base reads as changed);
  - the `refusal` stored for a kept edit becomes `refusal ?? (baseChanged ? 'changed' : null)` (firstVersionRefusal's reason first, as saveFirstVersionOver orders its reasons). A fresh edit stays null.
  - Store `baseFingerprint: keptEdit ? keptEdit.baseFingerprint : seedFingerprint` in `found`, and pass it to CreationPage as a new `baseFingerprint` prop. Never stamp the fresh fingerprint on a kept edit.

  Rewrite the header comment's kept-edit bullet to add that a kept edit whose base is not the fingerprint of what the version means now opens with 'changed' standing under Save, and Save is refused, never re-based (WR-02). Two cases give that: another tab saved over the version since the edit began, or the draft was kept before edits carried a base.
- app/src/ui/CreationPage.jsx:
  - Add `baseFingerprint = null` to the props and describe it in the mode 'edit' comment block: the base the page's edit records carry, from the edit route. Pass `baseFingerprint` to useKeptDraft beside cleanPayload.
  - In handleSave, directly after the field-refusal block (`if (stands.length > 0) { ... return; }`) and before `savingRef.current = true`, add this: when `editing && closedReason === 'changed'`, call setEditRefusal('changed'), set focusRequestRef.current to 'save', count the press with `setSaveAttempts((count) => count + 1)`, and return. Comment it: the base the edit began from is not what the version says now, so nothing is ended or written and Save-over is never called (WR-02). The press is counted so that a press which changes nothing still renders and moves focus, as the refusal block above does.
  - Do NOT swap saveFirstVersionOver's result for a refusal in place. Planning tried that, and on the second press focus did not move. The state ended where it began, React skipped the render, and the focus effect never ran.
  - Leave the create branch, and whatever 261115-hto changed there, as you find it.
- app/src/ui/useKeptDraft.js:
  - Add `baseFingerprint = null` to the parameter list beside cleanPayload. Document it: an edit page's base, written on every edit record so a later open can tell whether the version moved under it; null writes none.
  - In the persist effect's `if (creating)` branch, after buildDraftRecord, when `creationKind === 'edit'` and `typeof baseFingerprint === 'string'`, replace `record` with the record spread plus `baseFingerprint`. Create and pen records are unchanged.
  - buildDraftRecord and draft.js are unchanged. fitsCreationRecord already accepts other record keys, and Test C's reopen proves the round trip.

Run `npm --prefix app test -- src/ui/EditRoute.staleEdit.test.jsx`: three pass. Then run the related suites in verify: all pass. Commit: `fix(261115-htp): a kept edit carries the base it began from, and one whose base is not what the version says now opens refused (WR-02)`. In the body, give the cause, the strict comparison, the old-draft decision (refused, never re-based), and why Save is refused before the lock.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/ui/EditRoute.staleEdit.test.jsx src/ui/EditFlow.test.jsx src/ui/RecipePage.stalePen.test.jsx src/ui/useKeptDraft.test.jsx src/ui/CreationFlow.test.jsx src/ui/RecipePage.edit.test.jsx src/domain/firstVersion.test.js && test "$(grep -c baseFingerprint app/src/ui/EditRoute.jsx)" -ge 2 && test "$(grep -c baseFingerprint app/src/ui/CreationPage.jsx)" -ge 2 && test "$(grep -c baseFingerprint app/src/ui/useKeptDraft.js)" -ge 2 && test "$(grep -c 'export function fingerprint' app/src/domain/firstVersion.js)" -eq 1 && test -s "${TMPDIR:-/tmp}/sprinkles-htp/base-dist/index.html"</automated>
    Gates and their baselines:
    - `grep -c baseFingerprint app/src/ui/EditRoute.jsx` [HEAD=0 EXPECT>=2 @5ad63e63]
    - `grep -c baseFingerprint app/src/ui/CreationPage.jsx` [HEAD=0 EXPECT>=2 @5ad63e63]
    - `grep -c baseFingerprint app/src/ui/useKeptDraft.js` [HEAD=0 EXPECT>=2 @5ad63e63]
    - `grep -c 'export function fingerprint' app/src/domain/firstVersion.js` [HEAD=0 EXPECT==1 @5ad63e63]
    - `grep -c '^export const' app/src/ui/CreationPage.jsx` [HEAD=7 EXPECT==7 @5ad63e63 GUARD MUTATION: a new exported on-screen sentence in CreationPage] If 261115-hto changed this count, re-baseline at BASE and expect that value.
    - `grep -rl '261115-htp' app/src | wc -l` [HEAD=0 EXPECT>=1 @5ad63e63] after this task.
    - A recorded RED run of the new file showing 3 failed, on the three expectations named in the action, before the GREEN run showing 3 passed.
  </verify>
  <done>base-dist is built from BASE before any app edit. Tests A, B and C failed at BASE on tab C's open line, the old draft's open line and the record's typeof line, and nothing earlier failed. After the change all three pass, along with EditFlow, stalePen, useKeptDraft, CreationFlow, RecipePage.edit and firstVersion. Two commits: the red test, then the fix.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: saveDraft writes an edit draft only over a stored version, and the fingerprint's contract is pinned</name>
  <files>app/src/store/repository.test.js, app/src/domain/firstVersion.test.js, app/src/store/repository.js</files>
  <precondition>261115-hto has merged (as Task 1). Read its change to saveDraft first: `git log -p -3 -- app/src/store/repository.js`.</precondition>
  <read_first>
    - app/src/store/repository.js (saveDraft, by search, as 261115-hto left it)
    - app/src/store/repository.test.js (makeVersion by search, and the describe "a version’s one draft key is guarded by family" by search)
    - app/src/domain/firstVersion.test.js (lines 75-118)
  </read_first>
  <behavior>
    - New repository test (red at BASE), in the family-guard describe, named "saveDraft of an edit draft for a version id no version has writes nothing and resolves false (261115-htp)". Use a fresh createRepository() with no version stored. Expect saveDraft(edit('v-no-version')) to be false and getDraft('v-no-version') to be undefined. At BASE it resolves true.
    - Existing family-guard tests keep every expectation. Each test in that describe that saves an edit draft first stores a version under every id it saves one for.
    - Fingerprint pins (pass on write; Task 1 added the function), in a describe "fingerprint (WR-02, 261115-htp)":
      - The same string for the sameRecord case's a and b (equal leaves, different key order).
      - A different string for a leaf change, for '5' against 5, for a reordered array, and for a key holding undefined against an absent key.
      - Matches /^[0-9a-f]{16}$/.
      - fingerprint(undefined) equals itself on a second call.
  </behavior>
  <action>
RED:
- app/src/store/repository.test.js. In the describe "a version’s one draft key is guarded by family (T-11-46, D-06)", add a local helper beside the edit/plan/record builders: `storeGuardVersions(repository)`, which awaits repository.createVersion(makeVersion('v-guard')) and then repository.createVersion(makeVersion('v-other')). Comment it: an edit draft is written only over a stored version. Call it right after `const repository = createRepository();` in each test of that describe that saves an edit draft. At planning those were five tests:
  - saveDraft of a record draft over a stored edit draft;
  - saveDraft of an edit draft over a stored plan draft;
  - saveDraft within one family;
  - deleteDraft names a kind;
  - deleteDraft with no kind.

  Change no expectation. Why: planning ran the store fix with these fixtures unchanged. Three of them failed. 'deleteDraft with no kind' passed without testing anything, because nothing was stored to delete. Then add the new test from the behavior block.
- app/src/domain/firstVersion.test.js. Add fingerprint to the existing import from ./firstVersion.js and add the pin describe from the behavior block after the sameRecord describe.

Run `npm --prefix app test -- src/store/repository.test.js src/domain/firstVersion.test.js`. Expected: only the new repository test fails (expected true to be false), and the pins and every updated family-guard test pass. If 261115-hto already refuses an edit write without a version, the new test passes at BASE. Then record that in the SUMMARY, skip the GREEN step below, and commit only the tests and fixtures. If it fails another way, stop and report. Commit: `test(261115-htp): saveDraft refuses an edit draft for a version id no version has, red until the fix; pin fingerprint (WR-02)`.

GREEN, in app/src/store/repository.js saveDraft:
- An edit record opens the versions store in the same readwrite transaction as the drafts store. Extend the kind condition 261115-hto added for a create record, so the two-store transaction also opens for an edit record. If 261115-hto left saveDraft as it was, open `['drafts', 'versions']` for an edit record yourself, and read and put drafts through `tx.objectStore('drafts')`: idb's `tx.store` exists only on a one-store transaction.
- After the family guard, when `record.kind === 'edit'` and `await tx.objectStore('versions').get(record.versionId)` finds nothing, refuse in the guard's own form: quiet done, abort, resolve false.
- Pen writes keep their transaction as you find it.
- Add a sentence to saveDraft's comment: an edit draft is written only over a stored version, so the key never holds an edit for a version that is not there (WR-02). The edit route reaches no such write, because it mounts the editor only over a stored version and no code deletes one; the guard holds the store to what an edit means.

Run the suites in verify: all pass. Commit: `fix(261115-htp): saveDraft writes an edit draft only over a stored version (WR-02)`.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/store/repository.test.js src/domain/firstVersion.test.js src/ui/EditRoute.staleEdit.test.jsx src/ui/EditFlow.test.jsx src/ui/RecipePage.stalePen.test.jsx && test "$(grep -c storeGuardVersions app/src/store/repository.test.js)" -ge 6 && test "$(grep -c fingerprint app/src/domain/firstVersion.test.js)" -ge 2</automated>
    Gates and their baselines:
    - `grep -c storeGuardVersions app/src/store/repository.test.js` [HEAD=0 EXPECT>=6 @5ad63e63] one definition and five calls.
    - `grep -c fingerprint app/src/domain/firstVersion.test.js` [HEAD=0 EXPECT>=2 @5ad63e63]
    - A recorded RED run showing only the new repository test failing, with "expected true to be false", unless 261115-hto already covers it (then record that).
  </verify>
  <done>An edit write for a version id no version has resolves false and stores nothing. Every family-guard test stores the versions its edit drafts name and keeps its expectations. fingerprint's contract is pinned. The repository, firstVersion, staleEdit, EditFlow and stalePen suites pass. Two commits, or one if 261115-hto already covered the refusal.</done>
</task>

<task type="auto">
  <name>Task 3: Two-tab walk of the built app in WebKit and Chrome against the base build, full suite, scope gates, probe commit</name>
  <files>.planning/quick/261115-htp-wr-02-11-review-md-phase-11-a-kept-edit-draft-reopened-after/261115-htp-probe.mjs</files>
  <read_first>
    - .planning/quick/261114-ui5-edit-shows-at-once-when-a-kept-draft-tha/261114-ui5-probe.mjs (whole)
  </read_first>
  <action>
Write `.planning/quick/261115-htp-wr-02-11-review-md-phase-11-a-kept-edit-draft-reopened-after/261115-htp-probe.mjs` with the ui5 probe's structure:
- the header comment with usage and `S="${TMPDIR:-/tmp}/sprinkles-htp"`;
- the PLAYWRIGHT_CORE constant (default `/Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs`) and its existence check;
- `startServers` imported from `../../phases/08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs`;
- openPage aborting every request whose host is not 127.0.0.1;
- the engines loop: webkit, then chromium with `channel: 'chrome'`, with an INFO line when an engine does not launch;
- record and check modes, and PASS/FAIL lines ending "N PASS, M FAIL", with exit 1 on any FAIL.

One config: 1366x1024, no touch, dpr 1. Constants:
- PAGE `/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1` and EDIT = PAGE + '/edit';
- VERSION_ID `olive-oil-ice-cream-v1` and RECIPE_ID `olive-oil-ice-cream`;
- CHANGED, the literal 'This version changed in another tab. Cancel, then open it again.'

Two tabs are two pages in ONE browser context, so they share IndexedDB. Each walk W0, W1 and W2 uses its own fresh context.

Helpers:
- seed(page, base): the ui5 seed with no draft. It removes Olive Oil v1's batches, so the version becomes an editable first version, which ui5's W0 proved.
- dbGet(page, store, key): a page.evaluate IndexedDB get on 'sprinkles'.
- dbStripBase(page): get the draft at VERSION_ID; when one is there, delete its baseFingerprint key and put it back, in one readwrite transaction.
- openEdit(page, base): goto EDIT with networkidle, then wait for `textarea[aria-label="Recipe name"]`.
- waitDraftName(page, name): poll dbGet('drafts', VERSION_ID) every 100 ms for up to 3000 ms until payload.name equals name; return whether it did.
- waitName(page, name): wait up to 5000 ms for the Recipe name value to equal name.
- underSave(page): the text of `.notebook-ceremony p.field-error`, or null.
- pressSave(page): click the button named exactly 'Save', then wait up to 3000 ms, catching the timeout, for the path to equal PAGE or a line to stand under Save.

Use Playwright fill for typing (it fires input, so React's onChange runs).

Walks:
- W0, one tab.
  1. seed, then openEdit.
  2. Read the version's sheetTitle as titleBefore.
  3. Fill Recipe name 'Probe single' and waitDraftName.
  4. Read keptBaseType (typeof the stored record's baseFingerprint).
  5. Reload, openEdit, waitName 'Probe single', and read lineAtOpen.
  6. pressSave. Read path, the version's sheetTitle, and whether a draft is stored.
- W1, the WR-02 sequence.
  1. Page A: seed, openEdit, fill Recipe name 'Probe A', waitDraftName 'Probe A'.
  2. Page B = context.newPage(): openEdit, waitName 'Probe A', fill Recipe description 'Saved by B.', pressSave. Read bPath, the version's sheetDescription, the recipe's description, and whether a draft is stored (bDraft).
  3. Page A: fill Recipe name 'Probe A2'. Read writtenBack = waitDraftName 'Probe A2'. Close page A.
  4. Page C = newPage: openEdit, waitName 'Probe A2', read cLineAtOpen, pressSave. Read cPath, cLine, the version's sheetDescription, the recipe's description, and the stored draft's kind.
  5. When page C is still on EDIT: click the button named exactly 'Cancel' and wait up to 3000 ms for PAGE. Read cancelPath, whether a draft is stored, and the version's sheetDescription.
- W2, an old draft.
  1. seed, openEdit, read titleBefore.
  2. Fill Recipe name 'Probe legacy' and waitDraftName.
  3. dbStripBase, then reload, openEdit, waitName 'Probe legacy', and read lineAtOpen.
  4. pressSave. Read path and the version's sheetTitle.

Check mode compares after.json with base.json per engine:
- PASS, control (base and after both): W0 lineAtOpen is null, path equals PAGE, sheetTitle is 'Probe single', and no draft is stored. If base W0 fails, seeding did not work. Say so in the SUMMARY and rely on the component tests. Do not loosen the check.
- PASS, W0 after: keptBaseType is 'string'. INFO: base W0 keptBaseType (expected 'undefined').
- PASS, W1 setup (base and after both): bPath equals PAGE; both descriptions are 'Saved by B.'; bDraft is false; writtenBack is true.
- PASS, base reproduces WR-02: base W1 cLineAtOpen is null, cPath equals PAGE, and the version's sheetDescription after C's Save is not 'Saved by B.'. A FAIL here means the walk did not reproduce the bug. Stop and report; do not loosen the check.
- PASS, W1 after:
  - cLineAtOpen equals CHANGED;
  - after Save, cPath equals EDIT, cLine equals CHANGED, both descriptions are 'Saved by B.', and the draft's kind is 'edit';
  - after Cancel, cancelPath equals PAGE, no draft is stored, and sheetDescription is still 'Saved by B.'.
- PASS, W2 after: lineAtOpen equals CHANGED, path equals EDIT, and sheetTitle equals titleBefore. INFO: base W2 path and sheetTitle (expected saved).
- FAIL when webkit is missing from either file. INFO when chrome is missing.

Everything the script types or prints is English. It never contacts 4173 or 8077, starts no Vite server, and never writes app/dist.

Run:
1. `npm --prefix app run build -- --outDir "$S/after-dist" --emptyOutDir`.
2. `PROBE_DIST="$S/base-dist" node <probe> record "$S/base.json"`.
3. `PROBE_DIST="$S/after-dist" node <probe> record "$S/after.json"`.
4. `node <probe> check "$S/after.json" --base "$S/base.json"`.

Every PASS line must pass in webkit. Keep the INFO and PASS lines for the SUMMARY.

Then run the full suite, `npm --prefix app test`. Expect zero failures: the Step 0 counts plus the new tests (3 in EditRoute.staleEdit.test.jsx, 1 in repository.test.js, and the fingerprint pins). Run the scope gates in verify.

Commit the probe: `test(261115-htp): two-tab walk of the kept-edit overwrite over scratch builds, WebKit and Chrome (WR-02)`.

Write `.planning/quick/261115-htp-wr-02-11-review-md-phase-11-a-kept-edit-draft-reopened-after/261115-htp-SUMMARY.md`. It covers:
- planning's reproduction readings (this plan's objective) and the RED outputs of Tasks 1 and 2;
- the probe's lines;
- the full-suite counts before and after;
- the old-draft decision, and that EDIT_CHANGED may read as untrue for an old draft whose version did not change;
- that the saveDraft base check the review calls "ideally" is not done, and why;
- "Deferred Human Verification: none".
  </action>
  <verify>
    <automated>npm --prefix app test && node .planning/quick/261115-htp-wr-02-11-review-md-phase-11-a-kept-edit-draft-reopened-after/261115-htp-probe.mjs check "${TMPDIR:-/tmp}/sprinkles-htp/after.json" --base "${TMPDIR:-/tmp}/sprinkles-htp/base.json" && git diff --quiet "$(cat "${TMPDIR:-/tmp}/sprinkles-htp/BASE")" -- app/src/domain/draft.js app/src/domain/creationSave.js app/src/domain/sheetCode.js app/src/store/db.js app/dist && test "$(grep -rl '261115-htp' app/src | wc -l)" -ge 3</automated>
    Gates and their baselines:
    - `git diff --quiet BASE -- app/src/domain/draft.js app/src/domain/creationSave.js app/src/domain/sheetCode.js app/src/store/db.js app/dist` [HEAD: no diff EXPECT: no diff. GUARD: CREATE_DRAFT_KEYS, DB_VERSION, the Sheet code hash and Mark's dist are untouched]
    - `grep -rl '261115-htp' app/src | wc -l` [HEAD=0 EXPECT>=3 @5ad63e63] staleEdit test, repository test, firstVersion test.
    - `grep -c '^export const' app/src/ui/CreationPage.jsx` [HEAD=7 EXPECT==7 @5ad63e63 GUARD MUTATION: a new exported on-screen sentence in CreationPage] or the BASE value, if 261115-hto changed it.
    - The probe check prints 0 FAIL, and every webkit PASS line passes, including "base reproduces WR-02".
  </verify>
  <done>The base build reproduces the overwrite in WebKit, and the fixed build refuses it, keeps B's save, refuses an old draft, and leaves the single-tab path working. The full suite passes with only the new tests added. draft.js, creationSave.js, sheetCode.js, db.js and app/dist are untouched. The probe is committed and the SUMMARY is written.</done>
</task>

</tasks>

<threat_model>
ASVS level 1; block on high.

## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| tab to tab (same origin) | Two tabs share one IndexedDB. Another tab's writes (a Save-over, a written-back draft) cross into this tab's reads with no live refresh. |
| stored draft to EditRoute | A kept edit record is read back from the store. It may come from an older build with no base, or carry any value under baseFingerprint. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-htp-01 | Tampering (integrity of saved records) | EditRoute.jsx, CreationPage.jsx handleSave: Save-over from a resumed kept edit | high | mitigate | Every edit record carries baseFingerprint, the seed's fingerprint when the edit began. EditRoute passes 'changed' when it differs from fingerprint(seed) now. handleSave returns before any write on a 'changed' page. A page whose base matched keeps expected = the records whose seed has that fingerprint, so the transaction's sameRecord check guards Save. Tests A and B and probe W1 prove it. A 64-bit FNV collision would read as a match; at about 2^-64 per changed open, that is accepted. |
| T-htp-02 | Tampering | A stored edit record with an absent, non-string or forged baseFingerprint | medium | mitigate | Strict inequality against the fresh fingerprint. Anything but the exact value reads as changed. A kept edit is never re-based, and typing writes the kept record's own base (none for an old draft). Test B and probe W2 prove it. |
| T-htp-03 | Tampering | repository.saveDraft: an edit write for a version id no version has | low | mitigate | Refused inside the same readwrite transaction as the family guard, resolving false (Task 2). |
| T-htp-04 | Denial of service (of one edit) | A false 'changed': an old draft, or a styles table change that moves the seed's style id | low | accept | Save is refused and Cancel ends the edit. No saved record is touched. At most the ink of that kept edit is stranded, and it can be read before Cancel. |
| T-htp-05 | Tampering (race) | A stale tab's debounced write landing between EditRoute's getDraft and the editor's restore read | low | accept | The window is two reads on open, well under a second. It needs a third tab's write-back to land exactly then. The restore could then show a payload whose base the page did not compare. Recorded as residual. Closing it would make the shared restore hook compare bases. |
| T-htp-06 | Information disclosure | baseFingerprint | low | accept | It is a hash of local content in the drafts store, which exportAll never reads, so it never leaves the device. |
| T-htp-SC | Tampering | npm/pip/cargo installs | low | accept | This plan installs nothing. The probe loads playwright-core by path from the existing npx cache, as the ui5 probe does. |
</threat_model>

<verification>
- RED evidence. Task 1: three failures at BASE, on tab C's open line, the old draft's open line and the record's typeof line. Task 2: one failure, expected true to be false.
- GREEN. EditRoute.staleEdit, EditFlow, RecipePage.stalePen, useKeptDraft, CreationFlow, RecipePage.edit, firstVersion and repository suites pass, then the full suite with zero failures.
- Built-app walk. WebKit is required and Chrome is recorded if it launches. The base build reproduces the WR-02 overwrite. The fixed build shows EDIT_CHANGED, writes nothing and keeps 'Saved by B.'. The single-tab control passes in both builds.
- Scope. draft.js, creationSave.js, sheetCode.js, db.js and app/dist are unchanged. CreationPage's exported strings are unchanged.
</verification>

<success_criteria>
- A kept edit resumed after another tab saved over its version can no longer overwrite that save. EDIT_CHANGED shows from the first render, Save writes nothing on any press, and Cancel ends it.
- A kept edit stored before this change opens safely, refused, and is never re-based.
- One tab behaves as before.
- No DB_VERSION change, no stored-shape reset, no payload key added, no new on-screen sentence.
</success_criteria>

<output>
Create `.planning/quick/261115-htp-wr-02-11-review-md-phase-11-a-kept-edit-draft-reopened-after/261115-htp-SUMMARY.md` when done.
</output>
