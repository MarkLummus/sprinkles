---
phase: 11-steps-structure-save-and-print
verified: 2026-10-27T04:31:00Z
status: human_needed
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
  - app/src/router.jsx
  - app/src/store/repository.js
  - app/src/styles/notebook.css
  - app/src/styles/shell.css
  - app/src/ui/BatchRow.jsx
  - app/src/ui/CreationPage.jsx
  - app/src/ui/CreationSetup.jsx
  - app/src/ui/CreationSteps.jsx
  - app/src/ui/EditRoute.jsx
  - app/src/ui/IngredientPicker.jsx
  - app/src/ui/IngredientTable.jsx
  - app/src/ui/Method.jsx
  - app/src/ui/NotebookPlace.jsx
  - app/src/ui/PrintSheetPages.jsx
  - app/src/ui/RecipeList.jsx
  - app/src/ui/RecipePage.jsx
  - app/src/ui/RecipeSheet.jsx
  - app/src/ui/Segmented.jsx
  - app/src/ui/Shell.jsx
  - app/src/ui/StepReading.jsx
  - app/src/ui/VersionRow.jsx
  - app/src/ui/notebookPaths.js
  - app/src/ui/useKeptDraft.js
  - app/src/ui/useVersionPen.js
covered_digest: "v4:sha256:d75486d0bc802b99ab11b70729bfa1e64262a910588d1b3dd2ac47d676826853"
behavior_unverified: 0
overrides_applied: 0
advisory:
  - finding: "WR-01 (11-REVIEW): a create draft can be written back for a recipe another tab already saved, leaving an unsaveable ghost draft that hides Edit"
    category: other
    reason: "Two-tab sequence; dispositioned open in 11-REVIEW-DISPOSITION.md. Not a success-criterion failure; the single-tab path is proven."
    evidence_status: "reviewed, not reproduced here"
  - finding: "WR-02: a kept edit draft reopened after another tab saved over the version silently overwrites that save"
    category: other
    reason: "Two-tab sequence; the in-transaction 'changed' guard compares against the records read at open. Dispositioned open."
    evidence_status: "reviewed, not reproduced here"
  - finding: "WR-03: Save-over overwrites iceEd.style (unlisted style name) and servingTemperatureC the editor cannot represent"
    category: other
    reason: "Seeded versions with such names already have a batch or child, so they are not editable; reachable only by an imported equivalent."
    evidence_status: "reviewed, not reproduced here"
  - finding: "WR-04: Cancel does not take the save lock; Save pressed while Cancel's delete is in flight can create the cancelled recipe"
    category: other
    reason: "Short window; dispositioned open."
    evidence_status: "reviewed, not reproduced here"
  - finding: "WR-05: a failed or refused Save is announced through a status paragraph inserted already filled while focus moves to Save"
    category: other
    reason: "Screen-reader announcement gap; the message does show on screen. Dispositioned open."
    evidence_status: "reviewed, not reproduced here"
human_verification:
  - test: "Run Mark's List row check-p11-ipad-create-steps-save-print-edit on the iPad from the production build (npm --prefix app run build && npm --prefix app run preview -- --host): create a recipe with two steps and a split row, Move and remove by touch and by keyboard, Save, print to PDF and read the Sheet code, type it in Search, Edit and Save-over, type the code again"
    expected: "Every step reads as the row says: the split row, the moves and removes by touch and by keyboard with focus staying on the moved item, Save, the printed PDF's Sheet code, Search finding it before and after Edit"
    why_human: "The iPad is WebKit at 1366 with a coarse pointer and a real keyboard; Move-button focus there is the roadmap's medium-confidence item, and Safari's print differs from any engine's emulation (D-20). The steps were walked in Playwright WebKit (32 PASS) but that is not the device."
  - test: "Export the store before testing Save on the device: Mark's List row check-p11-export-store-before-saving (D-21)"
    expected: "A store file exported from the device before the first build that can save a recipe is installed"
    why_human: "Closes the reset window; only Mark can do it on his device. Expected by design, not a gap."
  - test: "Decide the four recorded board departures (Mark's decision, not verification failures): the after-Save identity line 'Version 1 · Version 1 · Latest' vs the board's 'Version 1 · Latest'; a lone version's History 'Only this version so far' vs a one-node fold; the split line '600.0 g' vs '600 g'; fC1's board slip 'Not yet churned'"
    expected: "Mark chooses to keep the build, redraw the board, or change the build"
    why_human: "The plans allowed these departures; which side wins is a design decision that belongs to Mark."
---

# Phase 11: Steps, structure, save and print Verification Report

**Phase Goal:** A maker can author the new recipe's Instructions steps with the rows each uses, add, remove and reorder its steps and rows, save it as the recipe's first version, keep shaping that first version until it has a batch or a child version, and print it as a bench sheet
**Verified:** 2026-10-27T04:31:00Z
**Status:** human_needed
**Re-verification:** No, initial verification

## Goal Achievement

The code, wiring and behaviour for every roadmap success criterion exist in the repository, and each was checked against source and a passing test, not against the SUMMARY files. Nothing FAILED. The status is `human_needed` only because the phase defines human checks by design (the iPad row, D-20, and the export-first row, D-21), and four board departures wait on Mark.

### Observable Truths (ROADMAP success criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | While creating, the maker writes Instructions steps (lead-in, text, targets) and says which rows each step uses and in what portions, and the balance figures still follow | VERIFIED | `app/src/domain/creationSteps.js` (452 lines): `addStep`, `setStepField`, `addTarget`/`setTarget`/`removeTarget`, `toggleStepUses` (ticking a placed row into a second step adds a portion line), `setLineGrams`, `rowLines`, `checkAllocation`, `normalizeAllocation`. UI in `ui/CreationSteps.jsx` (333 lines) and `ui/IngredientTable.jsx` creating branch (`isCreating`, per-step lines). Round-trip test `store/creation-roundtrip.test.js` "created with steps, scales, problems and targets" passes the import check; the 11-13 device walk typed 400/200/100 into a split row with Total 856.0 g and the Balance stood. |
| 2 | While creating, the maker adds and removes steps and rows and moves steps and rows within their step, with Move up and Move down by touch and keyboard; a removal deletes outright with no dangling reference; no move changes a step's stored number or a row's id | VERIFIED | `moveStep` and `moveRow` swap array positions or a step's `uses` and never touch `n` or `row.id`; `removeStep` blanks to a tombstone and folds a split row's grams back (`dropLine`); a removed row leaves every step's `uses`. Controls render through `Button` (`CreationSteps.jsx` 251-267, `IngredientTable.jsx` 294-310), off buttons `mk-off` plus `aria-disabled="true"` and stay in tab order (D-16). Named tests pass: "moveStep (STRUCT-03) swaps neighbouring live steps and changes no key", "removeRow with steps (STRUCT-01) leaves checkAllocation null and no dangling reference", "removeStep never hands out a removed key again, and removing it twice throws". Device walk (WebKit, 32 PASS) did the moves and removes by tap and by keyboard with focus on the moved item. |
| 3 | Save creates the recipe and its first version in one step carrying everything authored, lands on the new page, after which the Notebook lists it with no Resume; a failed save leaves neither | VERIFIED | `repository.createRecipeWithVersion` (repository.js 163-188): one readwrite transaction over `recipes`, `versions`, `drafts`, with the create-draft delete in the same transaction and a hand abort on any failure. `CreationPage.handleSave` runs `creationSaveBlock`, `buildCreation` (carries method, authored, declaredAxes, declaredFlaws, targets, iceEd.style, serveTempC), then the transaction, then `navigate(..., { saved: 'created' })`. Forced-failure test passes: `repository.test.js` "writes neither the recipe nor the version when the version cannot be cloned, and the create draft stays", plus Sheet-code-clash and duplicate-id refusals that store nothing. `CreationFlow.test.jsx` "writes the recipe and its version in one call, with the Sheet code, and lands on the new page" passes. The draft is deleted in the same transaction, so the Notebook's Resume row does not survive Save. |
| 4 | After Save, the first version keeps Add, Remove and Move, working as they did while creating, until it has a batch or a child, then shows none; no other saved version shows them; the pen's remove and restore on later versions works as before | VERIFIED | `domain/firstVersion.js` `firstVersionRefusal` (gone, not-first, has-batch, has-child, unlinked-row) is the single rule used by the page (`editStateFor`), `EditRoute.jsx` and the store's `saveFirstVersionOver` transaction (repository.js 206-249, re-checks inside the transaction, resolves `{ saved: false, reason }`, keeps id, Sheet code and createdAt). The route `/notebook/:recipeId/:versionId/edit` is in `router.jsx` 157. Add/Remove/Move exist only in the creation branch: `mode="creating"` is set only in `CreationPage.jsx` (212, 260, 729); `penDraft.js` has no add/remove/move exports and `Method.jsx`/`useVersionPen.js` import none of `addStep`/`removeStep`/`moveStep`/`moveRow`. `EditFlow.test.jsx` (version with a batch redirects; gained batch or child during edit refuses inside Save and keeps the draft) and `RecipePage.edit.test.jsx` pass. `git diff cf64aa70 HEAD -- app/src/store/db.js` is empty and `DB_VERSION` is still 10, so the reset window closed without a shape change. |
| 5 | The created recipe prints as a bench sheet with its Sheet code, like the seeded ones; typing the code finds it, also after a reorder or other edit; a recipe with empty targets, equipment or process prints with no gap | VERIFIED | `newRecipe.js` 131 sets `sheetCode: codeFromVersionId(versionId)` once at creation; `saveFirstVersionOver` throws if a Save-over would change the code. `store/sheet-code-created.test.js` "finds the same version, with the same stored code, after a Save-over that reorders steps and rows and renames the recipe" passes. Print: `PrintSheetPages.jsx` heads unplaced rows "Not in a step yet" and no section renders when empty (D-13, D-27). I ran `11-print-check.mjs` against my own scratch build: `32 PASS, 0 FAIL`, including gaps `[20,20]` for no-notes-no-steps, steps-no-targets and steps-none-used. The walk typed the printed Sheet code into Search before and after Edit and found the same version id. |
| 6 | On screen the Sheet's steps read in the printed method treatment on the reading page, the pen's closed steps and the Preview step; Add note, Add ingredient and Add step sit on their heading's row; an unplaced row offers Add to step | VERIFIED | `ui/StepReading.jsx` exports `StepTargets` (tag row, no box), `StepPurpose` (caps "why" then the sentence), `StepAside`, `StepReading`; `Method.jsx` imports the three for the reading page, the pen's closed steps and Show changes; `CreationSteps.jsx` 196 draws `StepReading` for Preview step/Hide preview (159). `CreationPage.jsx` 746/757 and `CreationSteps.jsx` 276/304 place the adds on heading rows; `IngredientTable.jsx` 316 Add to step with the chooser (D-17). The five sketch 014 board specs ran 1092 PASS, 0 FAIL in plan 11-13. "Unallocated" no longer appears in any non-test source file. |

**Score:** 6/6 truths verified (0 present, behavior-unverified). Behavior-dependent truths (the invariants in 2, 3, 4 and 5) each had a passing named test, not presence alone. No `coincidental-reliance` found.

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `app/src/domain/creationSteps.js` | pure step and row ops, allocation invariant | VERIFIED | 452 lines, substantive; imported by `creationSave.js`, `CreationPage.jsx`, `CreationSteps.jsx`, `IngredientTable.jsx`; no framework/DOM/store import |
| `app/src/domain/creationSave.js` | `creationSaveBlock`, `buildCreation`, `draftFromVersion`, `applyEditToVersion` | VERIFIED | 392 lines; wired from `CreationPage.handleSave` and `EditRoute` |
| `app/src/domain/firstVersion.js` | eligibility rule, `sameRecord`, `VersionChangedError` | VERIFIED | one rule shared by page, route and store |
| `app/src/store/repository.js` | `createRecipeWithVersion`, `saveFirstVersionOver` | VERIFIED | one-transaction writes with in-transaction checks; only module importing `idb` is `store/db.js` |
| `app/src/ui/EditRoute.jsx` | edit route over a saved first version | VERIFIED | wired in `router.jsx`, reached from `RecipePage` Edit, `NotebookPlace`/`RecipeList` Resume editing |
| `app/src/ui/CreationSteps.jsx`, `StepReading.jsx` | step editor and printed-treatment reading | VERIFIED | both imported and rendered |
| `app/src/ui/PrintSheetPages.jsx` | "Not in a step yet" head, no empty section | VERIFIED | print check 32 PASS |
| `11-walk.mjs`, `11-board-*.mjs`, `11-print-check.mjs`, `11-device-steps.mjs` | proof harness | VERIFIED | walk and print check re-run by me |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `CreationPage.handleSave` | `repository.createRecipeWithVersion` | `buildCreation` then await | WIRED | create mode, lands with `saved: 'created'` |
| `CreationPage.handleSave` | `repository.saveFirstVersionOver` | `applyEditToVersion` | WIRED | edit mode passes `expected: stored` |
| `RecipePage` | `/edit` route | `editStateFor` then `onEdit` navigate | WIRED | Edit hidden until batches, versions and drafts are all read |
| `router.jsx` | `EditRoute` | path `/notebook/:recipeId/:versionId/edit` | WIRED | |
| `NotebookPlace`, `RecipeList`, `Shell` | edit draft | `draftMatchesEdit` | WIRED | Resume editing, import refused naming the recipe (D-04, D-05) |
| `Method.jsx` | `StepReading` parts | import | WIRED | reading page, pen closed steps, Show changes |

### Data-Flow Trace (Level 4)

| Artifact | Data variable | Source | Real data | Status |
|----------|---------------|--------|-----------|--------|
| Created recipe's page and print | stored `version.method`, `rows[].portions` | `createRecipeWithVersion` writes `buildCreation` output; page reads via repository | yes (walk shows stores hold the steps and rows) | FLOWING |
| Edit editor | seed | `draftFromVersion(version, recipe, styles)` from the stored version | yes | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Full suite | `npm --prefix app test -- --run` | 130 files, 4228 tests passed | PASS |
| Walk against the Phase 8 to 10 baseline plus new scenarios | `11-walk-check.sh` (scratch build in the session scratchpad; `app/dist` untouched) | `MATCH 94 snapshots; NEW create-recipe 3; NEW edit-first-version 3; NEW edit-stale 5; NEW create-save-refused 2; NEW edit-kept 5` (112 snapshots) | PASS |
| Print check on my own scratch build | `PROBE_DIST=<scratch dist> node 11-print-check.mjs` | `32 PASS, 0 FAIL` | PASS |
| Step invariants, forced-failure, code-after-edit, stale edit | named tests in `creationSteps.test.js`, `repository.test.js`, `sheet-code-created.test.js`, `EditFlow.test.jsx`, `CreationFlow.test.jsx` | all pass | PASS |

### Probe Execution

Step 7c: no `scripts/*/tests/probe-*.sh` and none declared in the plans. Not applicable.

### Requirements Coverage

Every ID in the phase's plan frontmatter appears in REQUIREMENTS.md; none is orphaned (the traceability table maps exactly MAKE-07, MAKE-10, MAKE-12 and STRUCT-01 to STRUCT-04 to Phase 11). Plans declaring each ID all have SUMMARY files.

| Requirement | Source plans | Description | Status | Evidence |
|-------------|--------------|-------------|--------|----------|
| MAKE-07 | 11-02, 11-04, 11-06, 11-07, 11-13, 11-14 | Author steps and say which rows each uses and in what portions | SATISFIED | Truth 1 and 6 |
| MAKE-10 | 11-03, 11-09, 11-11, 11-13 | Save creates recipe and first version in one step; failed save leaves neither | SATISFIED | Truth 3; forced-failure test |
| MAKE-12 | 11-05, 11-13 | Created recipe prints as a bench sheet; code finds it after any edit | SATISFIED | Truth 5 |
| STRUCT-01 | 11-02, 11-08, 11-10, 11-13 | Add and remove steps and rows on a first version; removal cleans up | SATISFIED | Truth 2 and 4 |
| STRUCT-02 | 11-02, 11-08, 11-10, 11-13 | Move up and Move down by touch and keyboard | SATISFIED (code, tests, WebKit walk); iPad device confirmation is human item 1 | Truth 2 |
| STRUCT-03 | 11-02, 11-08, 11-10, 11-13 | Step number and row id never change on reorder | SATISFIED | `moveStep`/`moveRow` tests |
| STRUCT-04 | 11-01, 11-03, 11-10, 11-12, 11-13 | Controls only on a first version with no batch and no child | SATISFIED | Truth 4 |

REQUIREMENTS.md still lists all seven as Pending; the orchestrator should mark them complete. The 11-13 summary carries `requirements-completed: []` because it is a checkpoint plan; the other plans cover every ID.

### Context Decisions (D-01 to D-27)

Spot-checked against code: D-01 (own `/edit` route, redirects when ineligible), D-02/D-23 (edit draft kind, `draftMatchesEdit`, no draft until first change), D-03 (same id, code, createdAt, enforced by a TypeError in the store), D-04/D-05/D-24 (Resume editing on page, Notebook, Home; import refused naming the recipe; Next version and Record a batch hidden), D-06 (check inside the transaction; refusal under Save; draft kept), D-07 (`saved: 'created' | 'edited'` notices), D-08 to D-11 and D-25 (`creationSaveBlock` composes the whole gate), D-12 ("Unallocated" retired), D-13/D-27 (print check), D-14 to D-17 (focus requests and `aria-disabled` Move buttons in code and tests), D-19 (walk allow-list, MATCH 94), D-22 (target remove control, `removeTarget`), D-26 (added target reads plain). D-20 and D-21 are the human items. Not exercised by me: the exact announcement sentences of D-14 to D-16 in a screen reader.

### Anti-Patterns Found

None blocking. Debt-marker grep (`TBD|FIXME|XXX`, and `TODO|HACK`) over the 32 non-test source files changed since the phase base `cf64aa70` returned nothing. No `dangerouslySetInnerHTML` outside a comment. `idb` is imported only by `store/db.js`.

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `app/src/ui/StepReading.jsx` | 11-21 | duplicated comment block (IN-05) | Info | none |

### Review Findings (advisory, not scored)

11-REVIEW.md reports 0 critical, 5 warnings and 6 info items, all dispositioned open. None contradicts a success criterion on the single-tab path the proof covers. The ones worth a later quick task: WR-02 (a kept edit reopened after another tab saved over the version overwrites that save without warning, because `expected` is re-read at open) and WR-01 (a ghost create draft for an already-saved recipe hides Edit). WR-03 can lose a stored style name or serving temperature, but only on a first version whose style is not in the four listed styles, which no seeded editable version has. WR-04 and WR-05 are a short race and a screen-reader announcement gap. Listed in `advisory:` above.

### Human Verification Required

1. **iPad check (D-20).** Row `check-p11-ipad-create-steps-save-print-edit` on Mark's List. Test: from the production build, create a recipe with two steps and a split row, Move and remove by touch and by keyboard, Save, print to PDF and read the Sheet code, type it in Search, Edit and Save-over, type the code again. Expected: each step reads as the row says, with focus staying on the moved item and Search finding the same version before and after Edit. Why human: real iPad WebKit, coarse pointer, hardware keyboard and Safari print; the Playwright WebKit walk (32 PASS) is not the device.
2. **Export first (D-21).** Row `check-p11-export-store-before-saving`. Expected by design.
3. **Four board departures for Mark to decide** (not failures): the after-Save identity line "Version 1 · Version 1 · Latest" against the board's "Version 1 · Latest"; a lone version's History "Only this version so far" against a one-node fold; the split line "600.0 g" against "600 g"; fC1's board slip "Not yet churned".

### Gaps Summary

No gaps. The goal is achieved in code: authored steps with per-step row portions, add/remove/move with the invariants, a one-transaction Save with a forced-failure test, a first-version Edit window enforced identically by the page, the route and the store transaction, a stored Sheet code that survives edits, and the printed-method treatment on every screen surface. The phase is held at `human_needed` solely for the iPad and export rows and Mark's four board decisions.

---

_Verified: 2026-10-27T04:31:00Z_
_Verifier: Claude (gsd-verifier)_
