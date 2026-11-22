---
phase: 12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo
reviewed: 2026-11-22T00:00:00Z
depth: standard
files_reviewed: 51
files_reviewed_list:
  - app/src/domain/axes.js
  - app/src/domain/axes.test.js
  - app/src/domain/creation.js
  - app/src/domain/creation.test.js
  - app/src/domain/creationSave.js
  - app/src/domain/creationSave.test.js
  - app/src/router.jsx
  - app/src/styles/notebook.css
  - app/src/styles/shell.css
  - app/src/ui/AxisMark.jsx
  - app/src/ui/AxisMark.test.jsx
  - app/src/ui/BatchRow.jsx
  - app/src/ui/CreationFlow.test.jsx
  - app/src/ui/CreationPage.jsx
  - app/src/ui/CreationSetup.test.jsx
  - app/src/ui/CreationSteps.jsx
  - app/src/ui/CreationSteps.test.jsx
  - app/src/ui/CreationStructure.test.jsx
  - app/src/ui/DeskOnly.jsx
  - app/src/ui/editorKeys.js
  - app/src/ui/editorKeys.test.js
  - app/src/ui/IngredientTable.creating.test.jsx
  - app/src/ui/IngredientTable.jsx
  - app/src/ui/Method.jsx
  - app/src/ui/Method.preview.test.jsx
  - app/src/ui/Method.test.jsx
  - app/src/ui/notebookPaths.test.js
  - app/src/ui/NotebookPlace.jsx
  - app/src/ui/NotebookPlace.test.jsx
  - app/src/ui/Placeholder.jsx
  - app/src/ui/PrintLogPages.jsx
  - app/src/ui/PrintLogPages.test.jsx
  - app/src/ui/RecipeList.jsx
  - app/src/ui/RecipeList.test.jsx
  - app/src/ui/RecipePage.beforeYouStart.test.jsx
  - app/src/ui/RecipePage.drafts.test.jsx
  - app/src/ui/RecipePage.edit.test.jsx
  - app/src/ui/RecipePage.jsx
  - app/src/ui/RecipePage.perStep.test.jsx
  - app/src/ui/RecipeSheet.jsx
  - app/src/ui/Shell.creationGuard.test.jsx
  - app/src/ui/Shell.flyout.test.jsx
  - app/src/ui/Shell.importGuard.test.jsx
  - app/src/ui/Shell.jsx
  - app/src/ui/Shell.test.jsx
  - app/src/ui/useKeptDraft.js
  - app/src/ui/useKeptDraft.test.jsx
  - app/src/ui/VersionRow.jsx
  - app/src/ui/VersionRow.landing.test.jsx
  - app/src/ui/VersionRow.record.test.jsx
  - app/src/ui/VersionRow.test.jsx
findings:
  critical: 0
  warning: 1
  info: 4
  total: 5
  necessity: 0
status: issues_found
---

# Phase 12: Code Review Report (round two)

This report covers the changes since a523336f. Round one's report is in git history at that commit.

**Reviewed:** 2026-11-22
**Depth:** standard
**Files Reviewed:** 51
**Status:** issues_found

## Summary

I read the delta of every file against a523336f and read the source of the four areas flagged as costliest: `useKeptDraft.js`, `CreationPage.jsx` (picker anchor and focus requests), `editorKeys.js` with its two call sites, and the `Method.jsx` Preview step. I ran the suites for those areas, `src/domain` and `tabindex-scan.test.js` one-shot. 37 files and 1546 tests passed, plus the 31 tabindex-scan tests. I edited no source.

No Critical findings. Specifics on the high-risk areas:

- **useKeptDraft restore and hold.** I traced the crossings: narrowing during a read, widening during the first read, widening then narrowing during the re-read, and a pen opened while shut. None can overwrite or delete a held record.
  - `planGuard` stays true across the `heldPlan` to `planRestoring` hand-off, because both change in one update.
  - The persist effect builds no record while `mode` is `reading`, and `draftStoredRef` is never set on the held branch, so it neither writes over nor deletes the held record.
  - Every pen opener on `RecipePage` goes through a wrapper that checks `planHeld`. `useRouteIntents` receives the wrapped handlers. `BatchRow` and `VersionRow` hide their controls from the same flag, so there is no second derivation of "plan held".
- **Preview slot in `Method.jsx`.** The `{null}` placeholder lines the closed and open forms up at child index 10, so the `Edit this step` to `Cancel` node reuse that the focus fix depends on holds.
- **CreationPage picker anchor.** `anchorHolds` checks step liveness before `groupRows`, so the throwing path is unreachable. `handlePick` re-checks the anchor against `prev` inside the functional update. The three focus requests (`picker-opener`, `row-grams`, `picker-name`) all fall back to the heading's Add ingredient.
- **editorKeys.** IME composition, Alt and Shift are screened out. Handled combinations are always prevented. `holdReturn` still runs for every other key in the one-line fields.
- **Project rules.** No literal visual values in the added CSS, no `dangerouslySetInnerHTML`, no `idb` import outside the repository, and domain modules import no framework. tabindex-scan passes.
- **Necessity.** None found.

One Warning and four Info items follow.

## Warnings

### WR-01: Add ingredient buttons on a split row share one accessible name

**File:** `app/src/ui/IngredientTable.jsx:309-316`
**Issue:** `RowActs` renders once per line of a row. A row ticked into two steps (a split row) therefore has two `Add ingredient` buttons, each labelled `Add ingredient after ${name}`. They land the pick in different groups: `onAddAfter` passes `portion.step`, so one anchors in step 1 and the other in step 2. The file's own comment says Move controls are named by step "so no two share a name", and the Move buttons do carry `${inStep}`. Add ingredient was left out of that rule. A screen reader user hears two identical controls with different effects. Dragon-style voice control ("click Add ingredient after Cream") cannot pick between them.
**Fix:** Name it as the Move buttons are named.
```jsx
aria-label={`Add ingredient after ${name}${inStep}`}
```
`inStep` is already computed above the return and is empty for an unsplit row, so existing single-line labels do not change. Update the matching test queries for split rows.

## Info

### IN-01: DeskOnly takes a live editor away on narrowing, unlike NotebookHead

**File:** `app/src/ui/DeskOnly.jsx:13-16`
**Issue:** `NotebookHead`'s comment says an entry already open as the window narrows "stays as it is, so nothing is taken from under the maker's hands". `DeskOnly` does the opposite for the creation and edit editors. If an iPad enters Split View or Slide Over below 724 px mid-edit, `CreationRoute` or `EditRoute` unmounts and the Placeholder replaces it. The draft is not lost: the unmount cleanup in `useKeptDraft` flushes the pending record, and widening reopens it. Two things are lost. The picker, step-chooser and focus state go with the editor. An in-flight Save loses its mounted page.
**Fix:** Either accept it and say so in the DeskOnly comment, since the contract says "neither mounts", or let an already-mounted editor stay until the route changes. Mark's call, since it is a PHONE-01 contract question.

### IN-02: Home's Record tasting does nothing visible on the phone while a plan draft is held

**File:** `app/src/ui/RecipeList.jsx:221-229`
**Issue:** At 724 px and above, a Record tasting link carrying `state.startTasting` lands on a page where the kept draft's pen reopens. Below 724 the draft stays shut, `handleStartAmending` refuses on `planHeld`, and `useRouteIntents` consumes the intent. The maker taps a filled action and arrives on a reading page with no pen and no notice. `VersionRow` does print the "Finish it at the desk or on the iPad" draft line, which is some explanation. The RecipePage comment ("Home's Record tasting ... all stop here") shows this was meant. It is still a dead-ended primary action on Home.
**Fix:** If Mark wants it fixed, `HomeBody` already computes `draft`. Below 724, when the lead recipe has a plan draft, draw `Keep developing` alone, or send `onPageStatus` a one-line notice when an intent is refused by `planHeld`.

### IN-03: Preview state survives a remove and restore of the open step

**File:** `app/src/ui/Method.jsx:144-148, 307-330`
**Issue:** `previewing` is reset only when `isOpen` goes false. The cross-flag `Remove this step` in the open form can remove the step while it stays open. The Preview block is then hidden by `!draftStep.removed`, but `previewing` stays true. Restoring the step brings the preview back already expanded.
**Fix:** `useEffect(() => { if (!isOpen || draftStep.removed) setPreviewing(false); }, [isOpen, draftStep.removed]);`

### IN-04: `planHeld` is a pure alias of `planGuard`

**File:** `app/src/ui/RecipePage.jsx:250`
**Issue:** `const planHeld = planGuard;` adds a second name for the one value. The rest of the file and the `VersionRow` and `BatchRow` props use `planHeld`, while `useKeptDraft` and the comments use `planGuard`. This is not duplicated logic, but a reader chasing "where is plan held derived" has to follow two names.
**Fix:** Destructure it under the page's name: `const { draftRestoreDone, heldPlan, planGuard: planHeld } = useKeptDraft({ ... });`

---

_Reviewed: 2026-11-22_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
