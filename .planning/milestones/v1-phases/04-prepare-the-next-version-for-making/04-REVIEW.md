---
phase: 04-prepare-the-next-version-for-making
reviewed: 2026-10-11T00:00:00Z
depth: standard
files_reviewed: 52
files_reviewed_list:
  - app/src/data/batch-2026-08-02.js
  - app/src/data/coconut.js
  - app/src/data/mexican-chocolate.js
  - app/src/data/mocha.js
  - app/src/data/olive-oil.js
  - app/src/data/pineapple.js
  - app/src/data/standard-base.js
  - app/src/data/strawberry.js
  - app/src/data/underbelly-light-base.js
  - app/src/domain/axes.js
  - app/src/domain/batch.js
  - app/src/domain/battery.js
  - app/src/domain/draft.js
  - app/src/domain/sheetCode.js
  - app/src/domain/sheetPages.js
  - app/src/domain/sheetPages.fixtures.js
  - app/src/main.jsx
  - app/src/router.jsx
  - app/src/store/db.js
  - app/src/store/repository.js
  - app/src/store/transfer.js
  - app/src/styles/app.css
  - app/src/styles/home.css
  - app/src/styles/notebook.css
  - app/src/styles/print.css
  - app/src/styles/shell.css
  - app/src/styles/tokens.css
  - app/src/ui/Authored.jsx
  - app/src/ui/AxisMark.jsx
  - app/src/ui/BatchRow.jsx
  - app/src/ui/Button.jsx
  - app/src/ui/Checkbox.jsx
  - app/src/ui/FoldRow.jsx
  - app/src/ui/GraduatedRule.jsx
  - app/src/ui/IngredientTable.jsx
  - app/src/ui/MarkOneField.jsx
  - app/src/ui/Method.jsx
  - app/src/ui/notebookPaths.js
  - app/src/ui/PenFoot.jsx
  - app/src/ui/PrintLogPages.jsx
  - app/src/ui/PrintSheet.jsx
  - app/src/ui/PrintSheetPages.jsx
  - app/src/ui/Radio.jsx
  - app/src/ui/RecipeBand.jsx
  - app/src/ui/RecipeHistory.jsx
  - app/src/ui/RecipeList.jsx
  - app/src/ui/RecipePage.jsx
  - app/src/ui/Segmented.jsx
  - app/src/ui/SheetCodeSearch.jsx
  - app/src/ui/Shell.jsx
  - app/src/ui/VersionRow.jsx
  - .claude/CLAUDE.md
findings:
  critical: 0
  warning: 9
  info: 5
  total: 14
status: issues_found
---

# Phase 4: Code Review Report

**Reviewed:** 2026-10-11
**Depth:** standard
**Files Reviewed:** 52
**Status:** issues_found

## Summary

Phase 4 is in good shape where it is hardest. The page layout (`layPages`) held up under a 200,000-case randomised check I ran: every row, gauge, step, Total, basis note and foot was placed exactly once, and no page overflowed the usable height. The Sheet code is deterministic and the golden vector is pinned. The `importAll` transaction handles both of its failure paths, and the draft write, delete and flush ordering is sound. The 2,438 existing tests pass, and no `dangerouslySetInnerHTML`, `eval`, or stray literal in the stylesheets turned up.

The defects are all at the edges, in the import validator, in how the page copes with a changed store, and in a few unguarded loads.

- **Import validator.** `validateStoreFile` / `importStore` accept shapes the app never writes (orphan batches, duplicate ids, unknown mark axes, unformatted dates), and `validateStoreFile` itself throws on deeply nested JSON.
- **Import side effects.** Import silently overwrites by id with no confirmation, and nothing in an open page reacts to it.
- **Draft fit check.** `draftMatchesVersion` checks shape but not value domains.
- **Unguarded loads.** Several `RecipePage` loads have no `.catch`, and one of them quietly turns off draft keeping.
- **Print.** The Print button is live before the Sheet pages exist.
- **Sheet code search.** The search page has a loading race and a repeated-submit accessibility gap.

I ran small scripts for the layout fuzz, the seed export-to-import round trip, the validator gaps and the draft fit check. They are noted under each finding.

## Warnings

### WR-01: Import validator accepts records the app never writes (orphan batches, duplicate ids, unknown mark axes, unformatted dates)

**File:** `app/src/store/transfer.js:349-443` (validateBatch), `:227-288` (validateTasting), `:592-647` (importStore)
**Issue:** `importStore` checks that `parentVersionId` and `recipeId` resolve. Several other references and shapes are never checked. I confirmed each of these with a script against the seed data.
- **Orphan batches.** `batch.versionId` is never resolved against the file's versions or the store. A batch with `versionId: "nonexistent"` passes. It lands in `batches`, is reachable only through the `by-version` index, and appears nowhere. `getAllBatches()` still feeds it to Home's `activeWork` (filtered out) and to `allBatches` on the page.
- **Duplicate ids.** Two versions with the same `id` in one file pass (`validateStoreFile(...).ok === true`), and `put` silently keeps the last. Duplicate recipe ids, batch ids, row ids within a version, and step `n` within a version are likewise unchecked. Duplicate row ids and step numbers become duplicate React keys and duplicate `method-step-${n}` DOM ids on the page.
- **Mark axes.** `validateMarks` checks the 1-5 integer range but not the key. `marks: { bogus: 2 }` and a mark for `oil` on a batch whose `snapshot.declaredAxes` does not declare Oil are both accepted. `axesForBatch` then never renders them.
- **Dates.** `churnDate`, `tastedDate`, `recordedAt` and `createdAt` are checked only as strings or non-empty. `formatRecordDate("garbage")` returns `"NaN undefined undefined"`, and batches sort by a string compare of `churnDate`.
- **Other references.** `version.citedBatchId` and `step.uses` ids are not resolved.

This is the one gate before a write (T-04-01), and `schemaVersion` 7 files can come from outside the app.
**Fix:** Add after the per-record validation, before `importAll`.
```js
// in validateStoreFile, after the three loops
const dupes = (items, label) => {
  const seen = new Set();
  items.forEach((item, i) => {
    if (seen.has(item?.id)) errors.push(`${label}[${i}].id: duplicate id ${JSON.stringify(item.id)}`);
    seen.add(item?.id);
  });
};
if (Array.isArray(parsed.versions)) dupes(parsed.versions, '$.versions');
if (Array.isArray(parsed.batches)) dupes(parsed.batches, '$.batches');
if (Array.isArray(parsed.recipes)) dupes(parsed.recipes, '$.recipes');

// in importStore, beside the parent/recipe gates
const storeBatchVersionIds = fileIds; // plus store ids
parsed.batches.forEach((batch, i) => {
  if (!fileIds.has(batch.versionId) && !storeIds.has(batch.versionId)) {
    errors.push(`$.batches[${i}].versionId: refers to a version not present in this file or the store`);
  }
});

// validateTasting/validateBatch: marks keys against AXES keys, then against the snapshot's declared axes
// dates: /^\d{4}-\d{2}-\d{2}/ for churnDate/tastedDate; Date.parse for createdAt/recordedAt
```

### WR-02: `validateStoreFile` throws on deeply nested JSON, and the Shell never catches it, so the import silently does nothing

**File:** `app/src/store/transfer.js:55-68` (scanForUnsafeKeys), `app/src/ui/Shell.jsx:300-320` (handleImportChange)
**Issue:** `scanForUnsafeKeys` recurses with no depth limit. I ran `validateStoreFile` on a file with 20,000 nested arrays under an extra key. It throws `RangeError: Maximum call stack size exceeded`, which breaks the stated contract that the validator "collects every error found" and never throws. `handleImportChange` awaits `importStore(...)` outside any try/catch. A throw is an unhandled rejection: no error panel opens and the file input is already cleared, so the maker sees the Import button do nothing.
**Fix:** Bound the scan and guard the call.
```js
function scanForUnsafeKeys(value, path, errors, depth = 0) {
  if (depth > 64) { errors.push(`${path}: nested too deeply`); return; }
  // ...pass depth + 1 into both recursive calls
}
```
```js
let result;
try {
  result = await importStore(repository, parsed);
} catch {
  setImportErrors([IMPORT_STORAGE_ERROR]);
  return;
}
```
Also wrap `handleExport` (`Shell.jsx:281-292`) in a try/catch with a message. `exportStore` rejects if any of its three reads fails, and today that is also an unhandled rejection with no feedback.

### WR-03: Import overwrites by id with no confirmation, and nothing already open reacts to it

**File:** `app/src/ui/Shell.jsx:300-320`, `app/src/store/repository.js:77-98`, `app/src/router.jsx:33-72`, `app/src/ui/RecipePage.jsx:803-845`
**Issue:** `importAll` is a `put` per record, so a file holding an older copy of a version, batch or recipe replaces the newer local one with the same id. There is no summary or confirmation, and Import is reachable from every route. Two follow-on problems:
1. `storeRevision` reaches only `RecipeList` and `SheetCodeSearch` through the Outlet context. `RecipePage` and `PrintSheet` do not read it. A maker with a recipe page open (possibly mid-pen) who imports sees stale `version`, `batches` and `versions` state. The next Save (`saveVersion(updated)`, `saveBatch(record)`) writes from the stale in-memory copy and silently reverts the imported record.
2. Kept drafts for replaced ids are not touched. `draftMatchesVersion` only drops a draft whose shape no longer fits (rows, steps, portion counts), so a draft whose shape still fits is restored onto the replaced version, and its old ink is compared against the new content.

**Fix:** At minimum, key the routed pages on `storeRevision` so an import remounts them (`<RecipePage key={`${...}::${storeRevision}`} />` via `useOutletContext()` in `RecipePageForRoute` and `PrintSheetForRoute`), and call `repository.deleteDraft` for every imported version id inside `importAll`'s transaction (add `'drafts'` to the transaction's store list). Consider a one-line "N records will be replaced" confirmation when an incoming id already exists in the store with a different content.

### WR-04: `draftMatchesVersion` checks shape but not value domains, so a restored draft can save a batch that later fails the app's own import validator

**File:** `app/src/domain/draft.js:126-150` (fitsRecordShape), `:206-224`
**Issue:** `fitsRecordShape` verifies field presence and JS type, the `asMade` row ids, and that mark keys are known axes with values in 1-5. It does not verify:
- `exitConsistency`, `airiness`, `meltStyle`, `atDraw` and `fromFreezer` against `SEGMENT_OPTIONS` / `MARK_ONE_OPTIONS`;
- `defects` against `DEFECTS`;
- `declaredDefects` against `version.declaredFlaws` (or the amended batch's `snapshot.declaredFlaws`);
- mark keys against the version's `declaredAxes`.

I built a draft with `declaredDefects: ['NotDeclared']`, `marks: { oil: 3 }`, `exitConsistency: 'garbage'` and `defects: ['whatever']`. `draftMatchesVersion` returns `true`. The realistic route is an import that changed a version's `declaredFlaws` or `declaredAxes` after the draft was kept. Saving the restored pen then writes a batch whose `tasting.declaredDefects` are not in its own `snapshot.declaredFlaws`. `validateTasting` rejects exactly that, so the app's own export cannot be re-imported.
**Fix:** Add the domain checks to `fitsRecordShape`, for example:
```js
const declaredFlaws = version.declaredFlaws ?? [];
if (!candidate.declaredDefects.every((w) => declaredFlaws.includes(w))) return false;
if (!candidate.defects.every((d) => DEFECTS.includes(d))) return false;
for (const [field, options] of Object.entries(SEGMENT_OPTIONS)) {
  if (candidate[field] !== '' && !options.includes(candidate[field])) return false;
}
for (const field of ['atDraw', 'fromFreezer']) {
  if (candidate[field] !== '' && !MARK_ONE_OPTIONS.includes(candidate[field])) return false;
}
```
For an amend draft, check `declaredDefects` against the amended batch's snapshot instead of the live version.

### WR-05: A failed read in `RecipePage` silently disables draft keeping, and other loads have no `.catch`

**File:** `app/src/ui/RecipePage.jsx:803-845`, `:993-1052`, `:1005`
**Issue:** `getVersion`, `listBatchesForVersion`, `listDrafts`, `listVersions` and `getAllBatches` are all fire-and-forget with no `.catch`.
- If `listBatchesForVersion` rejects, `batchesLoaded` never becomes true. The restore effect then returns early forever, so `draftRestoreDone` never becomes true, and the persist effect (`if (!draftRestoreDone) return`) never runs. The page looks normal but nothing the maker types is kept, which is the point of the whole draft feature, and no message says so.
- A `getVersion` rejection leaves `version === undefined` and the page renders `null` forever.
- `repository.deleteDraft(versionId)` at `:1005` is neither returned nor caught, so a failure there is an unhandled rejection. Every other `deleteDraft` call in the file has `.catch(() => {})`.

**Fix:** Add `.catch` to the loads. At least `listBatchesForVersion` should still call `setBatchesLoaded(true)` (with `[]`, or with a visible error) so restore and persistence are not tied to its success. Return and catch the delete: `return repository.deleteDraft(versionId).catch(() => {})`.

### WR-06: Print button is live before the Sheet pages exist

**File:** `app/src/ui/PrintSheet.jsx:140-142`, `:155-164`, `app/src/ui/PrintSheetPages.jsx:399-420`
**Issue:** `sheet.pages` stays `null` until `document.fonts.ready` resolves and the measuring step runs, and `data-print-ready` is set only then. The Print button, however, is rendered immediately and calls `window.print()` unconditionally. On a slow font load (iPad over the LAN is the documented device) a press in that window prints the two log pages only, with no Sheet pages and no indication that anything is missing. The route already knows the state (`data-print-ready`), so the guard is free.
**Fix:**
```jsx
<Button className="notebook-action" disabled={!sheet.pages} onClick={() => window.print()}>
  Print
</Button>
```
Keep the `tabIndex` behaviour (the shared `Button` already does), and consider a visible "Preparing pages…" status while `!sheet.pages`.

### WR-07: Sheet code search has a loading race, no failure path, and a repeat-submit announcement gap

**File:** `app/src/ui/SheetCodeSearch.jsx:29-48`, `:71-73`
**Issue:**
- `versions` starts `null`. A submit before `listVersions()` resolves runs `findVersionsByCode(versions ?? [], code)`, finds nothing, and announces "No version has this code." for a code that exists.
- `listVersions()` has no `.catch`, so a store failure leaves the same state permanently with the same false message.
- The status text is only ever set, never cleared. Submitting the same unmatched code twice sets an identical string, so a `role="status"` live region does not re-announce it. A screen-reader user pressing Find again hears nothing.
- A malformed code (wrong length, the letter U) gets the same "No version has this code." as a well-formed code that is not in the store, so the maker cannot tell a typo from a missing sheet.

**Fix:** Disable Find (or queue the submit) until `versions !== null`. Catch the load and show a store-error sentence. Clear `result` at the start of `handleSubmit` and set the new text in a microtask or `requestAnimationFrame` so a repeat is re-announced. Use `normaliseCode(code) === null` to give a separate "Check the code: it has eight letters and numbers." message.

### WR-08: `openStore` has no `blocked` / `blocking` handlers, so a second open tab can hang boot forever

**File:** `app/src/store/db.js:8-55`, `app/src/main.jsx:18-23`
**Issue:** The 7 to 8 upgrade needs every connection to the old version closed. With another tab still open on version 7, `openDB` never resolves. `main.jsx` is then stuck on "Opening your recipes…" because `seedIfEmpty` awaits it, and it neither errors nor times out. The new code also gives no `blocking()` callback, so every future version bump will have the same problem against this build's tabs. The upgrade deletes all stores for any profile at 1 to 7, so this is also the moment the data is destroyed, and nothing tells the maker to close other tabs.
**Fix:**
```js
return openDB(DB_NAME, DB_VERSION, {
  upgrade(...) { /* as is */ },
  blocked() { /* surface: "Close other Sprinkles tabs to finish updating." */ },
  blocking() { /* this tab is the old one: db.close() and reload */ },
});
```
Wire `blocked` to a message `main.jsx` can render in place of the boot line.

### WR-09: Home and the recipe band name drafts that will not restore

**File:** `app/src/ui/RecipeList.jsx:91-103`, `app/src/ui/RecipePage.jsx:1237-1240`, `:2352`, `:2369-2373`
**Issue:** Home picks the lead and the "Draft open on this version · Go to draft" link from `listDrafts()` filtered only by "its version exists". The recipe page builds `waitingPlanDraft` and the History rail's draft node from `kind === 'plan'` records, with no fit check. Neither calls `draftMatchesVersion`. A draft made stale by an import is advertised on Home and in the band, and the link opens a page that deletes it quietly (restore effect `:1004-1008`). So a "Draft open" that is not there is shown and then vanishes on click. The band's "Draft: Version N" line also reads `payload.versionLabel` from unvalidated stored data.
**Fix:** Filter with `draftMatchesVersion(record, version, batchesForThatVersion)` before naming a draft. Home has `versions` and `batches` in hand, so it can do this cheaply. Alternatively have `importAll` delete the drafts it invalidates (see WR-03).

## Info

### IN-01: `MarkOneField` off-state reason is not tied to the disabled group

**File:** `app/src/ui/MarkOneField.jsx:58-83`
**Issue:** When `off`, both radios are disabled and `MARK_ONE_OFF_REASON` ("Clear marks below to choose.") is a sibling `<span>` with no association to the `radiogroup`. A screen-reader user lands on a group whose options are disabled and hears no reason; the reason is available only if they happen to read the caption row. This is the phase's screen-reader close-out, so the missing link is worth closing.
**Fix:** Give the hint an id and add `aria-describedby={off ? hintId : undefined}` to the `role="radiogroup"` div.

### IN-02: Print route link and foot render badly when the Sheet title is blank

**File:** `app/src/ui/PrintSheet.jsx:129-131`, `app/src/ui/PrintSheetPages.jsx:77`, `app/src/ui/PrintLogPages.jsx:15-17`
**Issue:** `validateVersion` allows `sheetTitle: ''`. The route head's `<Link>` then has no text, so it is an unnamed link and an empty tab stop. The closing foot and the log feet join `[sheetTitle, identity, code]` with " · ", producing a leading " · " on paper.
**Fix:** Fall back to the recipe name in the link, for example `{version.sheetTitle || recipe.name}`. Filter the empty parts out of the three foot joins: `[sheetTitle, identity, code].filter(Boolean).join(' · ')`.

### IN-03: Restore loses a stored draft if a pen is opened while the read is out

**File:** `app/src/ui/RecipePage.jsx:1009-1014`
**Issue:** "A pen the maker opened while the read was out wins over the stored one." In that branch `draftStoredRef` stays false, so the first debounce flush `put`s over the kept draft with no notice. The window is the time of one IndexedDB read, so it is tiny, but the replaced ink is the maker's kept work.
**Fix:** In that branch, either skip persistence for the new pen until the maker chooses, or restore the kept draft anyway and discard the freshly opened pen only if it is clean.

### IN-04: `putAll*` repository methods do not abort on a synchronous clone failure

**File:** `app/src/store/repository.js:26-31`, `:48-53`, `:66-71`
**Issue:** `importAll` documents and handles the case where a `put` throws before queuing and leaves the transaction open. `putAll`, `putAllBatches` and `putAllRecipes` have the same shape (`Promise.all(items.map(put))`) without that handling, so a throw part-way leaves the earlier puts to commit. They are used only by the seed (static data), so it is latent, but the two patterns now disagree.
**Fix:** Reuse `importAll`'s try/abort/quiet pattern in a shared helper, or note on the three methods that they are seed-only.

### IN-05: `exportStore` reads the three stores in separate transactions

**File:** `app/src/store/transfer.js:564-576`
**Issue:** Versions, batches and recipes are read in three consecutive awaits. A write from another tab (or a Save in this one) between them gives a file whose batches reference a version it does not contain; WR-01's missing batch-to-version gate means that file would then import.
**Fix:** Add a repository method that reads all three inside one read transaction, mirroring `importAll`.

---

_Reviewed: 2026-10-11_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
