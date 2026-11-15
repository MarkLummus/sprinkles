---
phase: 11-steps-structure-save-and-print
verified: 2026-11-15T17:45:00Z
status: passed
score: 6/6 must-haves verified
covered_files:
  - .planning/phases/11-steps-structure-save-and-print/11-01-PLAN.md
  - .planning/phases/11-steps-structure-save-and-print/11-01-SUMMARY.md
  - .planning/phases/11-steps-structure-save-and-print/11-02-PLAN.md
  - .planning/phases/11-steps-structure-save-and-print/11-02-SUMMARY.md
  - .planning/phases/11-steps-structure-save-and-print/11-03-PLAN.md
  - .planning/phases/11-steps-structure-save-and-print/11-03-SUMMARY.md
  - .planning/phases/11-steps-structure-save-and-print/11-04-PLAN.md
  - .planning/phases/11-steps-structure-save-and-print/11-04-SUMMARY.md
  - .planning/phases/11-steps-structure-save-and-print/11-05-PLAN.md
  - .planning/phases/11-steps-structure-save-and-print/11-05-SUMMARY.md
  - .planning/phases/11-steps-structure-save-and-print/11-06-PLAN.md
  - .planning/phases/11-steps-structure-save-and-print/11-06-SUMMARY.md
  - .planning/phases/11-steps-structure-save-and-print/11-07-PLAN.md
  - .planning/phases/11-steps-structure-save-and-print/11-07-SUMMARY.md
  - .planning/phases/11-steps-structure-save-and-print/11-08-PLAN.md
  - .planning/phases/11-steps-structure-save-and-print/11-08-SUMMARY.md
  - .planning/phases/11-steps-structure-save-and-print/11-09-PLAN.md
  - .planning/phases/11-steps-structure-save-and-print/11-09-SUMMARY.md
  - .planning/phases/11-steps-structure-save-and-print/11-10-PLAN.md
  - .planning/phases/11-steps-structure-save-and-print/11-10-SUMMARY.md
  - .planning/phases/11-steps-structure-save-and-print/11-11-PLAN.md
  - .planning/phases/11-steps-structure-save-and-print/11-11-SUMMARY.md
  - .planning/phases/11-steps-structure-save-and-print/11-12-PLAN.md
  - .planning/phases/11-steps-structure-save-and-print/11-12-SUMMARY.md
  - .planning/phases/11-steps-structure-save-and-print/11-13-PLAN.md
  - .planning/phases/11-steps-structure-save-and-print/11-13-SUMMARY.md
  - .planning/phases/11-steps-structure-save-and-print/11-14-PLAN.md
  - .planning/phases/11-steps-structure-save-and-print/11-14-SUMMARY.md
  - app/src/domain/creation.js
  - app/src/domain/creationSave.js
  - app/src/domain/creationSteps.js
  - app/src/domain/diff.js
  - app/src/domain/draft.js
  - app/src/domain/firstVersion.js
  - app/src/domain/lineage.js
  - app/src/domain/newRecipe.js
  - app/src/domain/penDraft.js
  - app/src/domain/recordDraft.js
  - app/src/router.jsx
  - app/src/store/repository.js
  - app/src/styles/app.css
  - app/src/styles/notebook.css
  - app/src/styles/shell.css
  - app/src/styles/tokens.css
  - app/src/ui/Authored.jsx
  - app/src/ui/BatchRow.jsx
  - app/src/ui/CreationPage.jsx
  - app/src/ui/CreationSetup.jsx
  - app/src/ui/CreationSteps.jsx
  - app/src/ui/EditRoute.jsx
  - app/src/ui/IngredientPicker.jsx
  - app/src/ui/IngredientTable.jsx
  - app/src/ui/IngredientsPlace.jsx
  - app/src/ui/Method.jsx
  - app/src/ui/NotebookPlace.jsx
  - app/src/ui/PrintSheetPages.jsx
  - app/src/ui/RecipeBand.jsx
  - app/src/ui/RecipeHistory.jsx
  - app/src/ui/RecipeList.jsx
  - app/src/ui/RecipePage.jsx
  - app/src/ui/RecipeSheet.jsx
  - app/src/ui/Segmented.jsx
  - app/src/ui/SheetCodeSearch.jsx
  - app/src/ui/Shell.jsx
  - app/src/ui/StepReading.jsx
  - app/src/ui/VersionRow.jsx
  - app/src/ui/notebookPaths.js
  - app/src/ui/oneLineField.js
  - app/src/ui/sheetView.js
  - app/src/ui/useBatchRecording.js
  - app/src/ui/useKeptDraft.js
  - app/src/ui/useRecipeData.js
  - app/src/ui/useRecordDraft.js
  - app/src/ui/useRouteIntents.js
  - app/src/ui/useVersionPen.js
covered_digest: "v4:sha256:c780bff2f4ba80149f91015b194aca96519d4bac1023811c997cf7c18fda3bd0"
behavior_unverified: 0
overrides_applied: 0
re_verification:
  previous_status: human_needed
  previous_score: 6/6
  gaps_closed: []
  gaps_remaining: []
  regressions: []
advisory:
  - finding: "WR-01 (11-REVIEW): a create draft can be written back for a recipe another tab already saved, leaving an unsaveable ghost draft that hides Edit"
    category: other
    reason: "Two-tab sequence; dispositioned open in 11-REVIEW-DISPOSITION.md. Not a success-criterion failure; the single-tab path is proven. Review not re-run for this regeneration (Mark's choice, 2026-11-15)."
    evidence_status: "reviewed earlier, not reproduced here"
  - finding: "WR-02: a kept edit draft reopened after another tab saved over the version silently overwrites that save"
    category: other
    reason: "Two-tab sequence; the in-transaction 'changed' guard compares against the records read at open. Dispositioned open."
    evidence_status: "reviewed earlier, not reproduced here"
  - finding: "WR-03: Save-over overwrites iceEd.style (unlisted style name) and servingTemperatureC the editor cannot represent"
    category: other
    reason: "Seeded versions with such names already have a batch or child, so they are not editable; reachable only by an imported equivalent."
    evidence_status: "reviewed earlier, not reproduced here"
  - finding: "WR-04: Cancel does not take the save lock; Save pressed while Cancel's delete is in flight can create the cancelled recipe"
    category: other
    reason: "Short window; dispositioned open."
    evidence_status: "reviewed earlier, not reproduced here"
  - finding: "WR-05: a failed or refused Save is announced through a status paragraph inserted already filled while focus moves to Save"
    category: other
    reason: "Screen-reader announcement gap; the message does show on screen. Dispositioned open."
    evidence_status: "reviewed earlier, not reproduced here"
---

# Phase 11: Steps, structure, save and print Verification Report

**Phase Goal:** A maker can author the new recipe's Instructions steps with the rows each uses, add, remove and reorder its steps and rows, save it as the recipe's first version, keep shaping that first version until it has a batch or a child version, and print it as a bench sheet
**Verified:** 2026-11-15T17:45:00Z
**Status:** passed
**Re-verification:** Yes. This regenerates the 2026-10-27 report, which went stale when 47 commits touched `app/src` after it was written. The old verdicts were not copied. Each truth was re-checked against the code at HEAD.

## Goal Achievement

All six roadmap success criteria hold at HEAD. The phase's own implementation files (`domain/creationSteps.js`, `creationSave.js`, `firstVersion.js`, `store/repository.js`, `store/db.js`) were not changed after 2026-10-27 except for the pen and tasting button labels in `penDraft.js` and `recordDraft.js` (commits 2d50ac10 and e6070b73, label strings only). The later work is UI: one-row textareas for iPad Tab, label-in-name fixes, step-number baseline, Edit-visibility fixes after a discarded draft, and focus fixes. I checked it for regressions against the truths below. The human checks the old report asked for are recorded as passed in `11-UAT.md` (status complete, 3 of 3, commit 2dddb44f), so no human item stays open.

### Observable Truths (ROADMAP success criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | While creating, the maker writes Instructions steps (lead-in, text, targets) and says which rows each step uses and in what portions, and the balance figures still follow | VERIFIED | `domain/creationSteps.js` (452 lines) exports `addStep`, `setStepField`, `addTarget`/`setTarget`/`removeTarget`, `toggleStepUses`, `placeRow`, `setLineGrams`, `rowLines`, `checkAllocation`, `normalizeAllocation`. `CreationPage.jsx` imports and calls them (lines 20-28, 458, 478, 493); `CreationSteps.jsx` (339 lines) and `IngredientTable.jsx` render them. `store/creation-roundtrip.test.js` passes. |
| 2 | While creating, the maker adds and removes steps and rows and moves steps and rows within their step, with Move up and Move down by touch and keyboard; a removal deletes outright with no dangling reference; no move changes a step's stored number or a row's id | VERIFIED | Named tests pass at HEAD: `moveStep (STRUCT-03)` (creationSteps.test.js:265), `removeRow with steps (STRUCT-01)` (:521), `never hands out a removed key again, and removing it twice throws` (:249). Controls are wired in `CreationPage.jsx` (`handleRemoveRow`, `handleMoveRow` at 429, `handleMoveStep` at 478, `handleRemoveStep` at 487) and render through `Button` (`CreationSteps.jsx` 252). The post-27-Oct commits only renamed accessible names to start with their visible words (26eabd80, d3b52474) and moved focus; the 8-file run below, including `CreationFlow.test.jsx`, passes against them. |
| 3 | Save creates the recipe and its first version in one step carrying everything authored, lands on the new page, after which the Notebook lists it with no Resume; a failed save leaves neither | VERIFIED | `repository.createRecipeWithVersion` (repository.js 163) is a single transaction. `CreationPage.handleSave` (line ~590-645) runs `creationSaveBlock`, `buildCreation`, ends the draft writer, awaits the transaction, then navigates with `saved: 'created'`; on a throw it resumes the writer and says so under Save. Tests pass: `repository.test.js:541` "writes neither the recipe nor the version when the version cannot be cloned, and the create draft stays", and `CreationFlow.test.jsx:1680` "writes the recipe and its version in one call, with the Sheet code, and lands on the new page". |
| 4 | After Save, the first version keeps Add, Remove and Move until it has a batch or a child, then shows none; no other saved version shows them; the pen's remove and restore on later versions works as before | VERIFIED | `domain/firstVersion.js` `firstVersionRefusal` / `editStateFor` is the one rule; `saveFirstVersionOver` (repository.js 206) re-checks inside its transaction and resolves a refusal instead of writing. Route `/notebook/:recipeId/:versionId/edit` is at `router.jsx:157` to `EditRoute`. `mode: 'creating'` is set only in `CreationPage.jsx` (213, 261); `ui/useVersionPen.js` and `ui/Method.jsx` import nothing from `creationSteps`. `EditFlow.test.jsx` and `RecipePage.edit.test.jsx` pass. The two late fixes to Edit visibility (6565fbed, 5012b5f9) trim the page's drafts list when a restored draft is discarded or a misfit draft is deleted, so Edit returns without a reload; they sit inside the eligibility gate and do not widen it. `DB_VERSION` is still 10 and `store/db.js` is unchanged since the phase base. |
| 5 | The created recipe prints as a bench sheet with its Sheet code, like the seeded ones; typing the code finds it, also after a reorder or other edit; a recipe with empty targets, equipment or process prints with no gap | VERIFIED | `store/sheet-code-created.test.js:62` "finds the same version, with the same stored code, after a Save-over that reorders steps and rows and renames the recipe" passes. `saveFirstVersionOver` refuses a code change. I built the app into a scratch directory and ran `11-print-check.mjs` against it: `32 PASS, 0 FAIL`, with gaps `[20,20]` for no-notes-no-steps, steps-no-targets and steps-none-used, and `[20,20,20]` for the full recipe. `SheetCodeSearch.jsx` was edited after 27 Oct (one-row textarea, Return still runs Find) and its tests pass in the full suite. |
| 6 | On screen the Sheet's steps read in the printed method treatment on the reading page, the pen's closed steps and the Preview step; Add note, Add ingredient and Add step sit on their heading's row; an unplaced row offers Add to step | VERIFIED | `ui/StepReading.jsx` (81 lines) exports the printed-treatment parts; `Method.jsx` and `CreationSteps.jsx` import them. The print check's `.mp-tags`, `.mp-why`, `.mp-aside` and `.ps-before` assertions pass in the scratch build. Add ingredient and Add step sit on heading rows (`CreationPage.jsx` 746/757 region, `CreationSteps.jsx`), and `IngredientTable.jsx` carries Add to step with its chooser. The step-number baseline fixes (438dc880, a9ea5e21) and the chooser label fix (62833ee1) are covered by tests that pass. |

**Score:** 6/6 truths verified (0 present, behavior-unverified). Every behavior-dependent truth (2, 3, 4, 5) had a passing named test, not presence alone. No `coincidental-reliance` found.

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `app/src/domain/creationSteps.js` | pure step and row ops, allocation invariant | VERIFIED | 452 lines; imported by `CreationPage.jsx`, `CreationSteps.jsx`, `IngredientTable.jsx`, `creationSave.js`; unchanged since 27 Oct |
| `app/src/domain/creationSave.js` | `creationSaveBlock`, `buildCreation`, `applyEditToVersion` | VERIFIED | 392 lines; called from `CreationPage.handleSave`; unchanged since 27 Oct |
| `app/src/domain/firstVersion.js` | eligibility rule, `sameRecord`, `VersionChangedError` | VERIFIED | 99 lines; one rule shared by page, route and store |
| `app/src/store/repository.js` | `createRecipeWithVersion`, `saveFirstVersionOver` | VERIFIED | one-transaction writes; unchanged since 27 Oct |
| `app/src/ui/EditRoute.jsx` | edit route over a saved first version | VERIFIED | 92 lines; mounted at `router.jsx:157` |
| `app/src/ui/CreationSteps.jsx`, `StepReading.jsx` | step editor and printed-treatment reading | VERIFIED | both imported and rendered |
| `app/src/ui/PrintSheetPages.jsx` | "Not in a step yet" head, no empty section | VERIFIED | print check 32 PASS |
| `11-print-check.mjs` | proof harness | VERIFIED | re-run by me at HEAD |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `CreationPage.handleSave` | `repository.createRecipeWithVersion` | `buildCreation`, then await (CreationPage.jsx:630) | WIRED | lands with `saved: 'created'` |
| `CreationPage.handleSave` | `repository.saveFirstVersionOver` | `applyEditToVersion` (CreationPage.jsx:605) | WIRED | edit mode passes `expected: stored` |
| `RecipePage` | `/edit` route | `editStateFor`, then navigate | WIRED | Edit hidden until batches, versions and drafts are read; restored-draft discard now trims the drafts list |
| `router.jsx` | `EditRoute` | path `/notebook/:recipeId/:versionId/edit` (line 157) | WIRED | |
| `Method.jsx` | `StepReading` parts | import | WIRED | reading page, pen closed steps, Show changes |

### Data-Flow Trace (Level 4)

| Artifact | Data variable | Source | Real data | Status |
|----------|---------------|--------|-----------|--------|
| Created recipe's page and print | stored `version.method`, `rows[].portions` | `createRecipeWithVersion` writes `buildCreation` output; page reads through the repository | yes (round-trip test, print check) | FLOWING |
| Edit editor | seed | `draftFromVersion(version, recipe, styles)` from the stored version | yes | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Phase-11 tests, 8 files | `npx vitest run` over `creationSteps`, `firstVersion`, `repository`, `sheet-code-created`, `creation-roundtrip`, `EditFlow`, `CreationFlow`, `RecipePage.edit` | 8 files, 325 tests passed | PASS |
| Full suite (orchestrator regression gate, run just before this dispatch) | `npm --prefix app test` | 132 files, 4340 tests passed | PASS |
| Print check on a scratch build of HEAD | `PROBE_DIST=<scratch dist> node 11-print-check.mjs` | `32 PASS, 0 FAIL` | PASS |
| WebKit walk against the baseline (`11-walk.mjs record`) | started on the scratch build | the recorder made no progress for over five minutes and I stopped it; no snapshots were compared | NOT COMPLETED (supplementary; see below) |

The walk is supplementary evidence from the original verification. Its baseline predates the label and focus fixes, so a mismatch would need a human reading anyway. Its absence does not weaken any truth: each is carried by a passing named test, the print check, and the iPad UAT below.

### Probe Execution

Step 7c: no `scripts/*/tests/probe-*.sh` and none declared in the plans. Not applicable.

### Requirements Coverage

Every ID in the 14 plans' `requirements:` frontmatter appears in REQUIREMENTS.md, and REQUIREMENTS.md maps exactly these seven IDs to Phase 11. None is orphaned. Plans 11-01 to 11-14 all have SUMMARY files.

| Requirement | Source plans | Description | Status | Evidence |
|-------------|--------------|-------------|--------|----------|
| MAKE-07 | 11-02, 11-04, 11-06, 11-07, 11-13, 11-14 | Author steps and say which rows each uses and in what portions | SATISFIED | Truths 1, 6 |
| MAKE-10 | 11-03, 11-09, 11-11, 11-13 | Save creates recipe and first version in one step; a failed save leaves neither | SATISFIED | Truth 3; forced-failure test |
| MAKE-12 | 11-05, 11-13 | Created recipe prints as a bench sheet; code finds it after any edit | SATISFIED | Truth 5; print check; UAT 2 |
| STRUCT-01 | 11-02, 11-08, 11-10, 11-13 | Add and remove steps and rows on a first version; removal cleans up | SATISFIED | Truths 2, 4 |
| STRUCT-02 | 11-02, 11-08, 11-10, 11-13 | Move up and Move down by touch and keyboard | SATISFIED | Truth 2; iPad UAT 2 passed |
| STRUCT-03 | 11-02, 11-08, 11-10, 11-13 | Step number and row id never change on reorder | SATISFIED | `moveStep (STRUCT-03)` test |
| STRUCT-04 | 11-01, 11-03, 11-10, 11-12, 11-13 | Controls only on a first version with no batch and no child | SATISFIED | Truth 4 |

REQUIREMENTS.md still lists all seven as `Pending` (lines 36-48 unchecked, traceability lines 115-124). The orchestrator should mark them complete. The 11-13 summary carries `requirements-completed: []` because it is a checkpoint plan; the other plans cover every ID.

### Human verification state

`11-UAT.md` is `status: complete`, 3 of 3 passed, updated 2026-11-15:

1. The export-first check (D-21) passed.
2. The iPad create, steps, Save, print and Edit check (`check-p11-ipad-create-steps-save-print-edit`, D-20) passed, including Move and remove by touch and keyboard, the printed Sheet code, and Search before and after Save-over.
3. The board-departure decisions passed: the identity-line decision and the two bug and decide rows were answered, and the other three departures went to Sid's redraw of sketch 014 per `11-UI-REVIEW.md`.

I found nothing new that the code at HEAD requires and the UAT does not cover. The post-27-Oct UI fixes (one-row textareas for iPad Tab, label-in-name, focus) are each pinned by tests that pass, and they were made against Mark's own bug rows. So no human verification item is open and the status is `passed`.

### Anti-Patterns Found

None blocking. A debt-marker grep (`TBD|FIXME|XXX`) over the creation, edit and step files (`CreationPage`, `CreationSteps`, `IngredientTable`, `StepReading`, `EditRoute`, `useKeptDraft`, `oneLineField`, `creationSteps`, `creationSave`, `firstVersion`, `repository`) returned only `XXXX-XXXX`, a Sheet-code format string at `repository.js:149`. `dangerouslySetInnerHTML` appears once under `app/src`, in a comment at `RecipeList.jsx:172` saying it is not used. `idb` is imported only by `store/db.js`.

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `app/src/ui/StepReading.jsx` | 11-21 | duplicated comment block (IN-05) | Info | none |

### Review Findings (advisory, not scored)

`11-REVIEW.md` reports 0 critical, 5 warnings and 6 info items, all dispositioned open. The advisory code review, UI review and state-machine audit were deliberately not re-run for this regeneration (Mark's choice, 2026-11-15), so these findings are carried over unchanged and not re-checked. None contradicts a success criterion on the single-tab path the proof covers. They are listed under `advisory:` above. WR-02 (a kept edit reopened after another tab saved over the version overwrites that save) and WR-01 (a ghost create draft for an already-saved recipe hides Edit) are the ones worth a later quick task.

### Gaps Summary

No gaps. The goal is achieved at HEAD: authored steps with per-step row portions, add/remove/move with the stored-number and row-id invariants, a one-transaction Save with a forced-failure test, a first-version Edit window enforced identically by the page, the route and the store transaction, a stored Sheet code that survives edits, and the printed-method treatment on every screen surface. The device checks are recorded as passed in `11-UAT.md`.

---

_Verified: 2026-11-15T17:45:00Z_
_Verifier: Claude (gsd-verifier)_
