---
phase: 08-split-the-recipe-page-along-its-jobs
plan: 05
subsystem: ui
tags: [react, refactor, hooks, route-state, record-pen, vitest, webkit-walk, test-audit]

requires:
  - phase: 08-split-the-recipe-page-along-its-jobs
    provides: plans 01-04's announcer, record loading, sheetView, RecipeSheet, version pen and kept-draft hooks, the shell test's job table and the 94-snapshot walk
provides:
  - cut 7 of 7: useRouteIntents.js (the consume-once route openers), which completes the six jobs EDIT-05 names
  - the bonus cut, landed: useBatchRecording.js (the record pen, tasting and batch save) and openBatchFor in sheetView.js
  - the shell test's completeness case, so a dropped job entry fails
  - 08-walk-after.json, the final 94-snapshot recording, MATCH with the Phase 5 baseline
  - 08-test-audit.mjs, the base-to-result test audit, ending AUDIT OK
affects: [phase-09, phase-10]

actuals:
  tokens: 18000
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns:
    - "A job hook that must call a handler owned by another hook takes it as an onX argument and is called after the hook that returns it"
    - "A rule the shell computes after its early returns and a hook needs above them is exported from sheetView as a pure helper (openBatchFor) and read by both"

key-files:
  created:
    - app/src/ui/useRouteIntents.js
    - app/src/ui/useBatchRecording.js
    - .planning/phases/08-split-the-recipe-page-along-its-jobs/08-walk-after.json
    - .planning/phases/08-split-the-recipe-page-along-its-jobs/08-test-audit.mjs
  modified:
    - app/src/ui/RecipePage.jsx
    - app/src/ui/sheetView.js
    - app/src/ui/RecipePage.test.jsx
    - app/src/ui/RecipePage.shell.test.js

key-decisions:
  - "The bonus cut's D-01 gate held (eight JOBS entries green, cut 7's walk MATCH 94 snapshots), so it was attempted and landed green in its own commit"
  - "openBatchFor(batches, batchId) in sheetView.js holds the openBatch rule; sheetView and handleStartTasting both read it, so the hook above the early returns needs no view"
  - "useBatchRecording is called after useDraftWriter and before useVersionPen; HOOK_ORDER no longer lists useRecordDraft() because the shell no longer calls it"

patterns-established:
  - "Phase 9's create editor reuses sheetView's null baseline and useKeptDraft's draft kinds; the record pen and route intents stay with the notebook page"

requirements-completed: [EDIT-05, EDIT-06]

duration: 12min
completed: 2026-10-17
status: complete
commits: 3
plan_head_before: 94c780ab33b2c8b1956c705d24888362fbb80239
plan_head_after: 1b0dcab09b75bb3632802899f0f35d6bdcb49037
---

# Phase 8 Plan 05: Route intents, the record pen and the proof Summary

**`RecipePage.jsx` is now a 509-line shell over eight job modules (announcer, record loading, sheet view, RecipeSheet, version pen, kept drafts, route intents and, as the bonus, the record pen). The final 94-snapshot WebKit walk matches the baseline, the full suite is green, and a base-to-result audit shows no existing test was removed or weakened.**

## Performance

- **Duration:** about 12 min
- **Completed:** 2026-10-17
- **Tasks:** 3 (all `type="auto"`, no checkpoints)
- **Files:** 8 (4 created, 4 modified)

## Accomplishments

- `useRouteIntents({ location, navigate, mode, batchId, batches, draftRestoreDone, versionsLoaded, draftsLoaded, versions, drafts, version, onStartAmending, onStartDeveloping })` reads `location.state?.startTasting` and `location.state?.startNextVersion`, holds both consume-once refs and effects with their dependency arrays verbatim, replaces the entry's state with `null` before opening a pen, and waits on `draftRestoreDone`. It returns nothing. The shell keeps `focusVersionOnMount` and `focusBatchOnMount`.
- The bonus cut landed. `useBatchRecording` holds `useRecordDraft()`, the three attempt counters with their refs, `batchSaveAction` and its lock, `focusBatchAttempt` and its ref, the nineteen batch handlers byte-identical (only `handleStartTasting` gained `const openBatch = openBatchFor(batches, batchId);` as its first line), `focusBatch()` and `restoreRecord(record)`, and the six batch status constants. The shell re-exports the constants so no test import changed.
- The shell test names every job positively and has the completeness case. A scratch run with the `useRouteIntents` entry renamed failed it, then the file was restored.
- `08-test-audit.mjs` proves test preservation from the base commit `78e962d8c988d735cf5f3c505e049b480e77ad6b` to the result, and was shown to fail on three kinds of weakening.

## Cut list (D-04)

| Cut | Job | Commit | Walk check |
|-----|-----|--------|------------|
| 1 | useAnnouncer | `87ed10ef160caef234d48c0598a7e04cf42f83d4` | MATCH 94 snapshots |
| 2 | useRecipeData | `1d2cad4381ad11e17655dd98b8031dc3a268bfbc` | MATCH 94 snapshots |
| 3 | sheetView | `fa2f491044b1fada7a2761543f3c9c5aa0e7d40e` | MATCH 94 snapshots |
| 4 | RecipeSheet | `f203b57cac70d013020510af5bef8a22ae2ff8eb` | MATCH 94 snapshots |
| 5 | useVersionPen and useDraftWriter | `5dcf66a206e0a76ff45c385becea9a362f1b262d` | MATCH 94 snapshots |
| 6 | useKeptDraft | `c5e6cc0f0b903b0a0af6c3922aa4b443b8716db8` | MATCH 94 snapshots |
| 7 | useRouteIntents (this plan) | `e4e1e6ef7f3eded679e2c14d98d1a8061df5a247` | MATCH 94 snapshots (the D-01 gate evidence) |
| Bonus | useBatchRecording (this plan) | `0517d2aeefad55f9a70abdb9927a6970539c63ba` | MATCH 94 snapshots |
| Proof | shell completeness, final walk, audit | `1b0dcab09b75bb3632802899f0f35d6bdcb49037` | MATCH 94 snapshots, recorded to 08-walk-after.json |

Bonus outcome: the bonus commit's hash and MATCH line are above. It was neither skipped nor reverted.

| Point | Suite (files / tests) | RecipePage.jsx lines |
|-------|-----------------------|----------------------|
| Base (e097454 / 78e962d) | 91 / 2932 | 1,837 |
| After plan 04 | 96 / 2988 | 992 |
| After cut 7 | 96 / 2992 | 947 |
| After the bonus cut | 96 / 2997 | 509 |
| Final | 96 / 2998 | 509 |

`useBatchRecording.js` is 567 lines and `useRouteIntents.js` is 75. The final suite holds 66 more tests than the base and none was deleted, skipped or weakened.

## Re-pointed describes (D-11), plans 03, 04 and this plan

| Plan | Describe | Old read target | New read target |
|------|----------|-----------------|-----------------|
| 03 | "the running head is gone; PageStatus anchors outside the keyed page" (`thisFilesRecipePageSource` only) | RecipePage.jsx | RecipePage.jsx and RecipeSheet.jsx, joined, page first |
| 03 | "the steps region is named Instructions" | RecipePage.jsx | RecipeSheet.jsx |
| 03 | "the empty Instructions section is left out" | RecipePage.jsx | RecipeSheet.jsx |
| 03 | "the Ingredients heading carries Show changes below 724 through the one handler" | RecipePage.jsx | RecipePage.jsx and RecipeSheet.jsx, joined, page first |
| 04 | "the version pen's refusal and failure route through announce, never onPageStatus" | RecipePage.jsx | RecipePage.jsx and useVersionPen.js, joined, page first |
| 05 | the same announce describe | RecipePage.jsx and useVersionPen.js | RecipePage.jsx, useVersionPen.js and useBatchRecording.js, joined, page first |
| 05 | "the band's record act is wired to the log's own handler" (source and raw no-SEAM case) | RecipePage.jsx | RecipePage.jsx and useBatchRecording.js, joined, page first |

In this plan only read expressions changed. With the bonus commit as `CUT`, `git diff "$CUT^..$CUT" -- app/src/ui/RecipePage.test.jsx` shows three changed lines, each holding `readFileSync(`, `new URL(`, `fileURLToPath(` and `.join(`, and no `expect(` line. The shell test diff of that commit removes two lines, `'useRecordDraft()',` from `HOOK_ORDER` and the `it.each(['useRecordDraft()'])` list line, with no `expect(` line removed. RecipePage.recordTasting, RecipePage.undoRetire and every BatchRow test passed unchanged.

## The test audit (ROADMAP criterion 4)

Run after the final commit: `node .planning/phases/08-split-the-recipe-page-along-its-jobs/08-test-audit.mjs 78e962d8c988d735cf5f3c505e049b480e77ad6b` ends `AUDIT OK`.

Section `RecipePage.test.jsx D-11 re-points`, copied from the audit:

```
describe('RecipePage.jsx — the version pen\'s refusal and failure route through announce, never onPageStatus', () => {
  -  const recipePageSource = readFileSync(recipePagePath, 'utf8')
  +  const recipePageSource = [readFileSync(recipePagePath, 'utf8'), readFileSync(... './useVersionPen.js' ...), readFileSync(... './useBatchRecording.js' ...)].join('\n')
describe('the running head is gone; PageStatus anchors outside the keyed page (260917-ewf, 03.5-02 Task 3 folded todo)', () => {
  -  const thisFilesRecipePageSource = readFileSync(thisFilesRecipePagePath, 'utf8')
  +  const thisFilesRecipeSheetPath = fileURLToPath(new URL('./RecipeSheet.jsx', import.meta.url));
  +  const thisFilesRecipePageSource = [readFileSync(thisFilesRecipePagePath, 'utf8'), readFileSync(thisFilesRecipeSheetPath, 'utf8')].join('\n')
describe('the steps region is named Instructions (Mark, 2026-09-24)', () => {
  -  const recipePagePathForInstructions = fileURLToPath(new URL('./RecipePage.jsx', import.meta.url));
  +  const recipePagePathForInstructions = fileURLToPath(new URL('./RecipeSheet.jsx', import.meta.url));
describe('the empty Instructions section is left out (261003-9bz)', () => {
  -  const recipePagePathForEmptyMethod = fileURLToPath(new URL('./RecipePage.jsx', import.meta.url));
  +  const recipePagePathForEmptyMethod = fileURLToPath(new URL('./RecipeSheet.jsx', import.meta.url));
describe('RecipePage.jsx — the band\'s record act is wired to the log\'s own handler (261002-wmz)', () => {
  -  const source = readFileSync(recipePagePath, 'utf8')
  +  const source = [readFileSync(recipePagePath, 'utf8'), readFileSync(... './useBatchRecording.js' ...)].join('\n')
  -    const raw = readFileSync(recipePagePath, 'utf8');
  +    const raw = [readFileSync(recipePagePath, 'utf8'), readFileSync(... './useBatchRecording.js' ...)].join('\n');
describe('RecipePage.jsx — the Ingredients heading carries Show changes below 724 through the one handler (261002-wn1)', () => {
  -  const source = readFileSync(fileURLToPath(new URL('./RecipePage.jsx', import.meta.url)), 'utf8')
  +  const source = [readFileSync(... './RecipePage.jsx' ...), readFileSync(... './RecipeSheet.jsx' ...)].join('\n')
```

(The audit prints each changed line in full; the `fileURLToPath(new URL(...))` wrappers are abbreviated to `...` here.) The `expect(` count in `RecipePage.test.jsx` is 265 at the base and now.

Section `Shell test review`, copied from the audit:

```
renamed: still loads its records through the repository seam  ->  still writes through the repository seam
renamed: declares no module-level function beyond joinNames, PageLoadFailed, RecipeNotFound and RecipePage  ->  declares no module-level function beyond PageLoadFailed, RecipeNotFound and RecipePage
renamed: the two hooks sit in the shell above the early returns  ->  the draft hooks sit above the early returns
removed: describe('the two hooks sit in the shell above the early returns', () => {
removed: it.each(['usePenDraft()', 'useRecordDraft()'])('%s is called exactly once, before the early returns', (call) => {
removed: it.each(['../domain/penDraft.test.js', '../domain/recordDraft.test.js'])(
removed: it('declares no module-level function beyond joinNames, PageLoadFailed, RecipeNotFound and RecipePage', () => {
removed: expect([...moduleFunctions].sort()).toEqual(['PageLoadFailed', 'RecipeNotFound', 'RecipePage', 'joinNames']);
removed: it('still loads its records through the repository seam', () => {
```

Accounting for every removed line (none is a comment line, and the audit's rule is that none removes an `expect(` line except the one plan 02 replaced):
- Three removed lines are the retitled `describe` and `it` openers of the three renames above (plans 02 and 04). Their bodies are unchanged except the expectation below.
- `expect([...moduleFunctions].sort()).toEqual([... 'joinNames'])` is the one `expect(` line, replaced by plan 02 with the same list minus `joinNames`, which moved to sheetView.
- `it.each(['usePenDraft()', 'useRecordDraft()'])` was narrowed by plan 04 (`usePenDraft()` has its own case in useVersionPen), and by the bonus cut in this plan to `['useBatchRecording(']`. The title and its two `expect(` lines are unchanged, and a new case asserts `useRecordDraft()` is called once in `useBatchRecording.js` and nowhere in the shell.
- `it.each(['../domain/penDraft.test.js', '../domain/recordDraft.test.js'])(` was widened by plan 02 to add `./sheetView.test.js`, a stronger check on the same title.

Teeth checks, each run in the working tree only and restored with `git checkout -- <file>` (the shell test restored by hand, since it held this plan's uncommitted additions); `git status --porcelain app/` showed nothing unexpected afterwards and every audit line below exited 1:
- (i) one character changed in a string literal on an `expect(` line of `RecipePage.drafts.test.jsx` (line 282, `less milk` to `less milq`): `AUDIT FAIL changed app/src/ui/RecipePage.drafts.test.jsx`
- (ii) the expected literal changed inside "the steps region is named Instructions" (`aria-label="Instructions"` to `"Instructionz"`): `AUDIT FAIL RecipePage.test.jsx changed line is not a read target: -    expect(tags[0]).toContain('aria-label="Instructions"');`, followed by the matching `+` line and two "holds an assertion or structure" lines
- (iii) the title `finds the first early return` changed in the shell test: `AUDIT FAIL shell test lost base title: finds the first early return`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] The audit's check D2 named a title that is not in the shell test**
- **Found during:** Task 3, first audit run
- **Issue:** The plan's D2 lists `each job check can fail` wrapped in single quotes, but the title plan 01 wrote is `each job check can fail: %s`. The audit failed with `AUDIT FAIL shell test lacks the added title: each job check can fail`, a defect in the audit's own spec and not in any test.
- **Fix:** The audit script looks for `'each job check can fail: %s'`, the title as written in the file. No test was edited. The audit then ended `AUDIT OK` on the unchanged result, and the three teeth checks still fire.
- **Files modified:** `.planning/phases/08-split-the-recipe-page-along-its-jobs/08-test-audit.mjs`
- **Committed in:** `1b0dcab`

**2. [Rule 3 - Blocking] HOOK_ORDER already listed `useRecordDraft()`**
- **Found during:** Task 2
- **Issue:** The plan's final `HOOK_ORDER` omits `useRecordDraft()`, which plan 04 left in the list, so the bonus cut would have failed the order case once the shell stopped calling it.
- **Fix:** The entry was dropped as the plan's final list prescribes; the order is `useAnnouncer()`, `useRecipeData(versionId)`, `useDraftWriter(versionId)`, `useBatchRecording(`, `useVersionPen(`, `useKeptDraft(`, `useRouteIntents(`.
- **Files modified:** `app/src/ui/RecipePage.shell.test.js`
- **Committed in:** `0517d2a`

**3. Comment rewording (no code change).** Three comments that described the shell now describe their new home: the record pen's `formStatus` comment, `handleStartTasting`'s reference to `startTastingOnMount` (now "in useRouteIntents", with a line saying why it computes `openBatch` itself), and the `onStartAmending` comment in `useRouteIntents.js` (committed in the bonus commit, since the opener moved).

**Total deviations:** 2 auto-fixed (1 bug in the audit spec, 1 blocking list entry), 1 wording note.
**Impact on plan:** None on the app or the stored data. The audit's check list is as the plan intended.

## Requirements

`gsd_run query requirements.ready-ids` was run for EDIT-05 and EDIT-06 after this summary was written; both conditions are met and REQUIREMENTS.md was updated: the six jobs EDIT-05 names each live in a module of their own with the shell calling each above its early returns, and the shell test names every module positively (EDIT-06) with the walk still at `MATCH 94 snapshots`.

## Authentication Gates

None.

## Known Stubs

None.

## Threat Flags

None. `useRouteIntents.js` reads two booleans from route state, consumes each once with `state: null` (three markers asserted, T-08-13). `useBatchRecording.js` moved the save path byte-identical: validation still runs before the lock, `freshId()` and the instant stay in `handleSaveBatch`, and every write stays on `repository.saveBatch` (T-08-14). `08-walk-after.json` is the same size and kind as Phase 5's committed recordings (T-08-15). The audit script is the mitigation for T-08-17. No package, network call, stored shape or database version changed.

## Issues Encountered

None. `08-walk-after.json` is 10 MB, the same size as the Phase 5 recordings it is compared against.

## Notes for the orchestrator

- No iPad check ran and no device row was added to Mark's List: the WebKit walk and the tests are the evidence, and the iPad is checked once, in Phase 12 (D-07).
- Phase 8 merges before Phase 9 executes (D-05). Phase 9 can widen `useKeptDraft`'s record branch and reuse `sheetView`'s null baseline; the batch side now sits behind `useBatchRecording`, which Phase 9's creation work never touches (D-02).
- Mark's List row `todo-split-recipepage` is this phase's own work and is closed by the orchestrator once the phase verifies. The executor did not write to Mark's List.
- `phase.complete` was not run.
- Pre-existing dirty state not touched: `.planning/state.json` modifications and the untracked `.review-diagnostics/` directory.

## Next Phase Readiness

Phase 8 has all of its plans executed and is ready for verification. Phase 9 is unblocked once Phase 8 merges.

## Self-Check: PASSED

- Files exist: `app/src/ui/useRouteIntents.js`, `app/src/ui/useBatchRecording.js`, `08-walk-after.json` (contains `"walk": "05"`), `08-test-audit.mjs`.
- Commits are ancestors of HEAD: e4e1e6e, 0517d2a, 1b0dcab.
- `git rev-list --count 94c780a..HEAD` was 3 before this summary commit, matching `commits: 3`.
- Full suite 96 files, 2998 tests, 0 failed; `sh 08-walk-check.sh 08-walk-after.json` ends `MATCH 94 snapshots`; the audit ends `AUDIT OK`; `git status --porcelain app/` prints nothing.
