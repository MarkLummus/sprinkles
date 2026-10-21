---
phase: 10-the-creation-editor-without-save
verified: 2026-10-20T17:05:00Z
status: passed
score: 5/5 must-haves verified
covered_files:
  - ".planning/phases/10-the-creation-editor-without-save/10-01-PLAN.md"
  - ".planning/phases/10-the-creation-editor-without-save/10-01-SUMMARY.md"
  - ".planning/phases/10-the-creation-editor-without-save/10-02-PLAN.md"
  - ".planning/phases/10-the-creation-editor-without-save/10-02-SUMMARY.md"
  - ".planning/phases/10-the-creation-editor-without-save/10-03-PLAN.md"
  - ".planning/phases/10-the-creation-editor-without-save/10-03-SUMMARY.md"
  - ".planning/phases/10-the-creation-editor-without-save/10-04-PLAN.md"
  - ".planning/phases/10-the-creation-editor-without-save/10-04-SUMMARY.md"
  - ".planning/phases/10-the-creation-editor-without-save/10-05-PLAN.md"
  - ".planning/phases/10-the-creation-editor-without-save/10-05-SUMMARY.md"
  - ".planning/phases/10-the-creation-editor-without-save/10-06-PLAN.md"
  - ".planning/phases/10-the-creation-editor-without-save/10-06-SUMMARY.md"
  - ".planning/phases/10-the-creation-editor-without-save/10-07-PLAN.md"
  - ".planning/phases/10-the-creation-editor-without-save/10-07-SUMMARY.md"
  - ".planning/phases/10-the-creation-editor-without-save/10-08-PLAN.md"
  - ".planning/phases/10-the-creation-editor-without-save/10-08-SUMMARY.md"
  - ".planning/phases/10-the-creation-editor-without-save/10-09-PLAN.md"
  - ".planning/phases/10-the-creation-editor-without-save/10-09-SUMMARY.md"
  - ".planning/phases/10-the-creation-editor-without-save/10-10-PLAN.md"
  - ".planning/phases/10-the-creation-editor-without-save/10-10-SUMMARY.md"
  - ".planning/phases/10-the-creation-editor-without-save/10-11-PLAN.md"
  - ".planning/phases/10-the-creation-editor-without-save/10-11-SUMMARY.md"
  - ".planning/phases/10-the-creation-editor-without-save/10-12-PLAN.md"
  - ".planning/phases/10-the-creation-editor-without-save/10-12-SUMMARY.md"
  - ".planning/phases/10-the-creation-editor-without-save/10-board-check.mjs"
  - ".planning/phases/10-the-creation-editor-without-save/10-device-steps.mjs"
  - ".planning/phases/10-the-creation-editor-without-save/10-walk-check.sh"
  - "app/src/domain/creation.js"
  - "app/src/domain/draft.js"
  - "app/src/domain/lineage.js"
  - "app/src/domain/recipe.js"
  - "app/src/router.jsx"
  - "app/src/styles/notebook.css"
  - "app/src/styles/shell.css"
  - "app/src/ui/Authored.jsx"
  - "app/src/ui/CreationFlow.test.jsx"
  - "app/src/ui/CreationPage.jsx"
  - "app/src/ui/CreationRoute.jsx"
  - "app/src/ui/CreationSetup.jsx"
  - "app/src/ui/FormulationNote.jsx"
  - "app/src/ui/Headnote.jsx"
  - "app/src/ui/IngredientPicker.jsx"
  - "app/src/ui/IngredientTable.jsx"
  - "app/src/ui/IngredientsPlace.jsx"
  - "app/src/ui/NotebookPlace.jsx"
  - "app/src/ui/PageNotice.jsx"
  - "app/src/ui/RecipeSheet.jsx"
  - "app/src/ui/Segmented.jsx"
  - "app/src/ui/Shell.creationGuard.test.jsx"
  - "app/src/ui/Shell.jsx"
  - "app/src/ui/notebookPaths.js"
  - "app/src/ui/useKeptDraft.js"
covered_digest: "v3:sha256:526241d67955ba2a98fe9d6c52b39246e53527ec3235ed1bad47a03a7bd69733"
behavior_unverified: 0
overrides_applied: 0
human_verification:
  - test: "On the iPad (Safari, landscape), from the production build (`npm --prefix app run build && npm --prefix app run preview -- --host`), follow the ten steps of Mark's List row check-creation-editor-ipad: New recipe, a name, Start; fill in a description, a note, two ingredient rows, a style, a scale and a problem; try Import (refused); close the tab; reopen the Notebook; Resume; Cancel."
    expected: "The creation survives the closed tab, Resume brings back every field as left (scales, problems and targets included), Import is refused while the creation is kept, and Cancel leaves the Notebook with the same recipes as before and no draft row."
    why_human: "The iPad is WebKit at 1366 with a coarse pointer and a real keyboard. The phase's own convention is that this check happens on the device, not in Chromium or Playwright WebKit. The row is open (version 1) on Mark's List."
---

# Phase 10: The creation editor, without Save - Verification Report

**Phase Goal:** A maker can start a blank recipe from the Notebook with only a name and author everything its first version carries apart from its steps: the recipe's name and one description, its Version name, its Before you start, its rows from the library with grams and live balance figures, its own scales and problems, and its style and balance targets; a half-made recipe survives a closed tab. There is deliberately no Save, so nothing real is stored yet.
**Verified:** 2026-10-20T17:05:00Z
**Status:** human_needed
**Re-verification:** No, initial verification

## Goal Achievement

Every roadmap success criterion is backed by code I read and by checks I ran myself rather than took from the SUMMARYs. The one open item is the iPad device check, which the phase deliberately routes to Mark.

### Observable Truths (the five ROADMAP success criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | The Notebook place offers New recipe, and a maker starts a blank recipe from it by giving only a name; a name another recipe already has is allowed and the Notebook warns of it; the editor opens with the Version name "Version 1", which the maker can change | VERIFIED | `NotebookPlace.jsx` `NotebookHead` renders New recipe only while no draft is kept, then the entry form. `recipeNameMessage` refuses a blank name ("Enter a recipe name."). `recipeNameTaken` is a trimmed, case-insensitive warning that never blocks (`domain/recipe.js`). `handleStart` writes one name-only create draft through `repository.saveDraft` and then navigates to `/notebook/new`. `blankCreateDraft` sets `versionLabel: 'Version 1'` (`domain/draft.js:537`). `CreationPage` binds the Version name to an editable field. `CreationFlow.test.jsx:232` and `:250` pin Start's write and the "Version 1" value. |
| 2 | While creating, the maker writes the recipe's name, one description that fills both the recipe description and the Sheet description, and Before you start notes | VERIFIED | `CreationPage.jsx` has Recipe name and Recipe description fields. The draft holds a single `description`, and `creationSheetVersion` projects it as `sheetDescription`, so one box feeds both. Before you start is `authored.beforeYouStart`, edited through `addNote`, `updateNote` and `removeNote` in `domain/creation.js`, with `Authored.jsx` making `NoteList` editable in `creating` mode. |
| 3 | While creating, the maker picks rows from the library, enters grams, removes a row (deleted outright) and the balance figures follow; an ingredient not in the library reads "Not in the library yet" and adds nothing | VERIFIED | `IngredientPicker.jsx` reuses `filterLibrary`. A pick calls `addRow`, an entry already on the recipe reads "Added" with no `onClick`, and an empty result renders "Not in the library yet" with no list. Grams go through `setRowGrams`, `removeRow` filters the row out, and `creationSheetVersion` projects each row through `rowFromLibraryRecord` with `parseGramsDraft(raw) ?? 0`. The Sheet's `FormulationNote` and the figures follow from the new version object. `IngredientTable.jsx` carries the per-row grams message on blur. `IngredientPicker.test.jsx:111` pins the "Not in the library yet" case. |
| 4 | While creating, the maker defines 0 to 2 scales (name, an end label each, kind) and 0 to 2 problems; chooses an ice cream style so the bands fill in, then edits or blanks them; sees an empty target reading with no gap or error | VERIFIED | `CreationSetup.jsx` and `domain/creation.js`: `addScale` caps at `MAX_RECIPE_SCALES` and `addProblem` at `MAX_RECIPE_PROBLEMS`, and the add controls vanish at two. A scale carries name, `low`, `high` and `kind` (`goldilocks` "Right in the middle", `magnitude` "Low to high"), and a per-scale radio name keeps the two cards' groups apart. `applyStyle` replaces the six bands and the serving temperature from the catalog's style row, and `clearStyle` and `setBandEnd` leave the bands editable or blank. `creationTargets` feeds only readable bands to the Balance, so an unread band shows "no target set" and no error. `CreationFlow.test.jsx:1201` to `:1249` pin the "no target set" reading with no error. The seeded style bands (philadelphia, french, gelato, sorbet) all parse. |
| 5 | A half-made recipe survives a closed tab: the Notebook offers Resume and reopens it as left, scales, problems and targets included; abandoning it leaves no record; there is no Save, the Notebook lists no new recipe, and the only record a creation writes is its draft | VERIFIED | `useKeptDraft` has a `creating` branch (kind `create`) with a 250 ms debounced write, a flush on unmount, and a restore through `draftMatchesCreate` and `onRestoreCreate`. A started creation is overwritten, never deleted, by an edit (D-04a). `NotebookPlace` reads the drafts at load and draws the draft row with Resume. Cancel deletes the draft and is final only once the delete succeeds. A grep of `CreationPage`, `CreationRoute`, `CreationSetup`, `IngredientPicker`, `PageNotice` and `NotebookPlace` finds no repository call except `saveDraft` (once, in Start), `deleteDraft` (through the writer), `listDrafts` and `listLibrary`. `CreationFlow.test.jsx` spies on every non-drafts write (`WRITE_SPIES`) and asserts none is called. The suite has "a creation survives a closed tab" cases (`:566`). I re-ran `10-device-steps.mjs` in WebKit on a fresh build: 16 PASS, 0 FAIL, including the closed tab, Resume, Import refused, Cancel, and the recipes, versions and batches stores unchanged with the drafts store empty at the end. |

**Score:** 5/5 truths verified (0 present, behavior-unverified). The closed-tab and Cancel truths are behavior-dependent. Each is backed by passing tests that exercise the transition, and by my WebKit re-run, so none is left on symbol presence alone.

### CONTEXT decisions honored

| Decision | Honored | Evidence |
|----------|---------|----------|
| D-01 / D-02 fixed route `/notebook/new`, silent redirect with no draft | Yes | `router.jsx:123` registers it before `/notebook/:recipeId`. `CreationRoute` finds the newest create draft and otherwise `navigate(NOTEBOOK_PLACE_PATH, { replace: true })`. |
| D-03 Cancel: no dialog, no Undo, page-scoped "Draft discarded." | Yes | `handleCancel` and `DRAFT_DISCARDED_STATUS`. |
| D-04 / D-04a / D-04b Start writes at once, stays kept when blank, one draft at a time | Yes | `handleStart` re-reads the drafts and writes nothing if one exists. The persist effect has a `creating` branch that always writes. |
| D-05 / D-06 flat table, no step heads, no Sheet code | Yes | The creation table has no Step heads (`method: []`). No code is minted. |
| D-07 / D-08 / D-08a / D-08b Balance reads the library, grams parsing, side region only once there are figures, band validity | Yes | `creationSheetVersion`, `creationTargets`, and the `RecipeSheet.jsx:205` condition `(mode !== 'creating' || view.figures.length > 0)`. |
| D-09 / D-09a leave freely, no `beforeunload` | Yes | A grep of `app/src` outside tests finds no `beforeunload`. |
| D-10 Import refused while a creation is kept | Yes | `Shell.jsx` `creationStateRef` and `CREATION_IMPORT_BLOCKED_STATUS`. Refusal is exercised in `Shell.creationGuard.test.jsx` and in the WebKit walk (no file chooser fires). |
| D-11 strict 94-snapshot walk | Yes | See below. |
| No machine, no process in the editor | Yes | `CreationSetup.jsx` has only Style, Scales and Problems regions. |

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `app/src/domain/creation.js` | Pure helpers for notes, rows, style, bands, scales and problems | VERIFIED | 331 lines, framework-free, imports only domain modules. |
| `app/src/ui/CreationRoute.jsx` | The `/notebook/new` wrapper | VERIFIED | Wired in `router.jsx:123`. |
| `app/src/ui/CreationPage.jsx` | The editor | VERIFIED | Mounts `RecipeSheet` in `creating` mode, `IngredientPicker`, `CreationSetup` and `useKeptDraft`. |
| `app/src/ui/CreationSetup.jsx` | Style, Scales and Problems log column | VERIFIED | Rendered by `CreationPage`. |
| `app/src/ui/IngredientPicker.jsx` | The picker | VERIFIED | Rendered by `CreationPage` as `ingredientsFoot`. |
| `app/src/ui/PageNotice.jsx` | Page-scoped notice region | VERIFIED | Used by `CreationPage` and `NotebookPlace`. |
| `app/src/ui/NotebookPlace.jsx` | New recipe, entry, draft row, Resume | VERIFIED | The New recipe entry and draft row are in place. |
| `app/src/ui/Shell.jsx` | Import refusal while a creation is kept | VERIFIED | `creationStateRef` and the refusal path. |
| `app/src/ui/useKeptDraft.js` | `creating` branch kept until Cancel | VERIFIED | The persist effect always writes a create record. |

### Key Link Verification

| From | To | Via | Status |
|------|----|-----|--------|
| `NotebookPlace.handleStart` | `/notebook/new` | `repository.saveDraft`, then `navigate(NEW_RECIPE_PATH)` | WIRED |
| `CreationRoute` | `CreationPage` | `repository.listDrafts` filtered by `draftMatchesCreate` | WIRED |
| `CreationPage` | `RecipeSheet` | `creationSheetVersion` into `sheetView({ baseline: null, mode: 'creating' })` | WIRED |
| `CreationPage` | drafts store | `useKeptDraft({ creating: true, createDraft })` | WIRED |
| `CreationPage` | library | `repository.listLibrary` shared by the picker and the projection | WIRED |
| `CreationSetup` | draft | updater callbacks into `domain/creation.js` | WIRED |
| `Shell.chooseImportFile` | creation state | `creationStateFromRoute` and `creationStateRef` | WIRED |

### Data-Flow Trace (Level 4)

| Artifact | Data | Source | Real data | Status |
|----------|------|--------|-----------|--------|
| Balance figures in `RecipeSheet` | `view.figures` | draft rows through the library (`repository.listLibrary`) through `rowFromLibraryRecord` through `sheetView` | Yes | FLOWING |
| Style options | `catalog.styles` | boot catalog seeded from `STYLE_ROWS` | Yes | FLOWING |
| Draft row on the Notebook | `draft` | `repository.listDrafts` | Yes | FLOWING |

### Behavioral Spot-Checks and Proofs (run by me)

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Whole suite | `npm --prefix app test` | 120 files, 3728 tests passed | PASS |
| Strict walk, 94 snapshots against the recorded baseline | `sh 10-walk-check.sh` (scratch build) | `MATCH 94 snapshots` | PASS |
| All five sketch 013 boards against the final build in WebKit | `10-board-check.mjs` over the notebook, editor, picker, style and scales specs | 2660 PASS, 0 FAIL, matching 10-10-SUMMARY | PASS |
| The iPad steps in WebKit at 1366, coarse pointer | `10-device-steps.mjs` | 16 PASS, 0 FAIL | PASS |

### Probe Execution

Step 7c: SKIPPED. The phase declares no `probe-*.sh` scripts. Its proofs are the walk, board and device-step scripts above, which I ran.

### Requirements Coverage

All eight phase IDs appear in the PLAN frontmatter (10-10 claims all eight) and in REQUIREMENTS.md. No Phase 10 requirement is orphaned.

| Requirement | Source plans | Description | Status | Evidence |
|-------------|--------------|-------------|--------|----------|
| MAKE-04 | 10-02, 10-03, 10-10 | Blank recipe from the Notebook with only a name; shared names warned | SATISFIED | Truth 1 |
| MAKE-05 | 10-02, 10-05, 10-10 | Name, one description, Version name starting "Version 1" | SATISFIED | Truths 1 and 2 |
| MAKE-06 | 10-06, 10-07, 10-12, 10-10 | Rows from the library, grams, live balance, outright remove, "Not in the library yet" | SATISFIED | Truth 3 |
| MAKE-08 | 10-05, 10-10 | Before you start notes | SATISFIED | Truth 2 |
| MAKE-09 | 10-08, 10-10 | Style, bands filled and editable or blank, serving temperature, no machine or process | SATISFIED | Truth 4 |
| MAKE-11 | 10-01, 10-02, 10-04, 10-11, 10-10 | Survives a closed tab, Resume, abandoning leaves no record | SATISFIED in code and WebKit; iPad pending (human item) | Truth 5 |
| TASTE-01 | 10-09, 10-10 | 0 to 2 own scales with name, end labels and kind | SATISFIED | Truth 4 |
| TASTE-02 | 10-09, 10-10 | 0 to 2 own problems | SATISFIED | Truth 4 |

Note for the orchestrator: the REQUIREMENTS.md traceability table still reads "Pending" for MAKE-04, MAKE-05, MAKE-06, MAKE-08, MAKE-09 and MAKE-11, and their checkboxes are unticked. TASTE-01 and TASTE-02 already read Complete. This is bookkeeping for phase completion, not a code gap.

### Anti-Patterns Found

| File | Pattern | Severity | Impact |
|------|---------|----------|--------|
| (phase source files) | `TBD`, `FIXME`, `XXX`, `TODO`, `HACK`, `PLACEHOLDER` | none found | No debt markers in any file this phase touches. |
| `app/src` outside tests | `beforeunload`, `dangerouslySetInnerHTML`, `idb` imports | none beyond the existing rule | The only `idb` import is `store/db.js`. The one `dangerouslySetInnerHTML` match is a comment in `RecipeList.jsx`. |

Advisory code-review findings (10-REVIEW.md: 0 critical, 3 warnings, 8 info) are recorded as open in 10-REVIEW-DISPOSITION.md and are not re-run here. None of the three warnings defeats a success criterion:

- WR-01 is a stale Import refusal across tabs.
- WR-02 is the Notebook failing whole when the drafts read fails.
- WR-03 is that band ends beyond two decimals or with a comma are dropped without a message. The four seeded styles' bands all parse.

I read each against the goal and none changes a verdict, but WR-02 and WR-03 are worth a quick task. The Impeccable audit (10-UI-REVIEW.md, 33/40, no P0) is also advisory and was not re-run.

### Human Verification Required

#### 1. iPad creation check (Mark's List row `check-creation-editor-ipad`, open, version 1)

**Test:** On the iPad (Safari, landscape), from the production build (`npm --prefix app run build && npm --prefix app run preview -- --host`), follow the row's ten steps: New recipe, a name, Start; add a description, a note, two ingredient rows, a style, a scale and a problem; try Import; close the tab; reopen the Notebook; Resume; Cancel.
**Expected:** The creation survives the closed tab, Resume brings back every field as left (scales, problems and targets included), Import is refused while the creation is kept, and Cancel leaves the Notebook with the same recipes as before and no draft row.
**Why human:** The iPad is WebKit at 1366 with a coarse pointer and a real keyboard. The phase's own convention (CONTEXT D-12) is that this check happens on the device. Everything else, including the same sixteen steps in Playwright WebKit, is automated and passes.

### Gaps Summary

No gaps. All five roadmap success criteria, all eight requirement IDs and the CONTEXT decisions are backed by code I read and proofs I ran: the full suite (3728 tests), the strict walk (MATCH 94), the board run (2660 PASS, 0 FAIL) and the WebKit device steps (16 PASS). The status is `human_needed` solely because of the pending iPad device check. I found no `gaps_found` condition, no deferred items and no overrides.

---

_Verified: 2026-10-20T17:05:00Z_
_Verifier: Claude (gsd-verifier)_
