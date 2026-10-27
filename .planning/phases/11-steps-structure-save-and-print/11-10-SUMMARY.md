---
phase: 11-steps-structure-save-and-print
plan: 10
subsystem: ui
tags: [react, creation-editor, edit, save-over, drafts, indexeddb, webkit, board-conformance]

requires:
  - phase: 11-steps-structure-save-and-print
    provides: 11-03 saveFirstVersionOver, the edit draft kind, draftFamily and the family-guarded saveDraft and deleteDraft, editPath, firstVersionRefusal; 11-09 buildCreation, the saving lock, endDraft and resumeDraft, RECIPE_SAVED_STATUS
provides:
  - "domain/creationSave.js: draftFromVersion, applyEditToVersion, sameCreateDraft"
  - "EditRoute at /notebook/:recipeId/:versionId/edit; redirects that delete nothing; the refused state for a kept edit on a version that gained a batch or a child"
  - "CreationPage mode edit: Version 1 · editing, form Edit version, Save-over with expected, the EDIT_* lines, closedReason"
  - "useKeptDraft: creationKind and cleanPayload; useDraftWriter(versionId, family); every delete names its family; a restore leaves another family's record alone"
  - "router.jsx: the edit route and CHANGES_SAVED_STATUS for state.saved edited"
  - "11-walk.mjs makeVanilla and scenarios edit-first-version, edit-stale; 11-board-first-version.mjs (fB1)"
affects: [11-11, 11-12, 11-13]

actuals:
  tokens: 29600
  tasks: 3
  commits: 3

plan_head_before: 465bbb92dd6c1e339eb4838da60609f5321062f3
commits: 3
plan_head_after: 58d04565623ae6e13c2df977cdc71ebd553f895a

tech-stack:
  added: []
  patterns:
    - "A saved version is read for what it means: activeRows and activeSteps, placement derived once from the active lines, a placeholder portion never read for placement, struck steps kept as tombstones"
    - "A draft equal to cleanPayload builds no record, so the existing no-record branch deletes a stored one: an untouched Edit leaves no trace"
    - "A version's one draft key is guarded by family on both sides: the writer and the persist effect name their family in every delete, the restore leaves a foreign record alone"
    - "A walk scenario shares driving steps through a helper that takes a mark function (walk.step to record, quietMark to read the stores only)"

key-files:
  created:
    - app/src/ui/EditRoute.jsx
    - app/src/ui/EditFlow.test.jsx
    - .planning/phases/11-steps-structure-save-and-print/11-board-first-version.mjs
  modified:
    - app/src/domain/creationSave.js
    - app/src/domain/creationSave.test.js
    - app/src/ui/CreationPage.jsx
    - app/src/ui/useKeptDraft.js
    - app/src/ui/useKeptDraft.test.jsx
    - app/src/ui/RecipePage.shell.test.js
    - app/src/ui/RecipePage.drafts.test.jsx
    - app/src/ui/CreationFlow.test.jsx
    - app/src/router.jsx
    - .planning/phases/11-steps-structure-save-and-print/11-walk.mjs

key-decisions:
  - "applyEditToVersion lays style and serving temperature over the stored iceEd instead of replacing it, so hardness and overrun figures the editor does not author survive a Save-over"
  - "A restore that reads a record whose kind names no family deletes it whatever it is (deleteDraft with no kind), as it always did; only a record of a known foreign family is left alone"
  - "The fB1 fixture holds the board's two steps; 11-board-reading.mjs's root has a third (Churn) for the reading boards"

requirements-completed: [STRUCT-04, STRUCT-01, STRUCT-02, STRUCT-03]

coverage:
  - id: E1
    description: "The edit route opens the creation editor on a saved first version with its name, description, Version name, notes, rows and lines, steps, scales, problems, style, targets and serving temperature, and the ceremony reading Version 1 · editing (form Edit version)"
    requirement: "STRUCT-04"
    verification:
      - kind: integration
        ref: "app/src/ui/EditFlow.test.jsx#the edit route opens the editor on a saved first version (D-01)"
        status: pass
      - kind: integration
        ref: "11-board-first-version.mjs fB1 (WebKit, 1366): 24 PASS, 0 FAIL"
        status: pass
    human_judgment: false
  - id: E2
    description: "Opening converts what the saved version means: struck rows, lines and steps are not brought back, a step's rows keep their stored order, struck step keys stay tombstones, unresolved or doubled lines fold with addGrams, and a no-op Edit then Save-over keeps active row ids, links, placement, step order and grams; today's library entries apply on Save-over (D-03)"
    requirement: "STRUCT-01"
    verification:
      - kind: unit
        ref: "app/src/domain/creationSave.test.js#draftFromVersion and applyEditToVersion: Edit (STRUCT-04, D-03) (13 cases, the pen-saved root, the key promise both halves, the imported-record case)"
        status: pass
    human_judgment: false
  - id: E3
    description: "Save-over writes one saveFirstVersionOver call (two quick presses included) keeping id, Sheet code and createdAt, replaces the content, updates the recipe, lands on the page saying Changes saved. and writes no new History node; the page freezes while it is out"
    requirement: "STRUCT-04"
    verification:
      - kind: integration
        ref: "EditFlow.test.jsx#Save writes over the same version (4 cases, StrictMode)"
        status: pass
      - kind: integration
        ref: "11-walk.mjs edit-first-version (WebKit, built app): same id, code and date, swapped order with keys unchanged, one version, no draft, seeded records kept"
        status: pass
    human_judgment: false
  - id: E4
    description: "The edit draft is written only once the content differs from the saved version, ends on a change made back, on Cancel and on a successful Save-over, resumes on reload with Draft kept, and is never deleted by a redirect, the recipe page, a pen or another tab"
    requirement: "STRUCT-04"
    verification:
      - kind: integration
        ref: "useKeptDraft.test.jsx (edit kind, 8 cases) and EditFlow.test.jsx#the kept edit draft, #the route redirects and deletes nothing"
        status: pass
    human_judgment: false
  - id: E5
    description: "A kept edit whose version gained a batch or a later version stays reachable: the editor opens on it with the refusal under Save, Save re-checks inside the transaction and shows the store's refusal (batch, later version, another tab, changed, closed), the draft is kept, Cancel discards it and lands on the page, and a reload shows the same state"
    requirement: "STRUCT-04"
    verification:
      - kind: integration
        ref: "EditFlow.test.jsx#a kept edit whose version has since gained a batch or a later version stays reachable (D-06)"
        status: pass
      - kind: integration
        ref: "11-walk.mjs edit-stale (WebKit): a second tab records a batch through the real record pen, the edit draft survives its discard, Save is refused, a reload shows the refusal, Cancel discards"
        status: pass
    human_judgment: false
  - id: E6
    description: "The wording of the five stale-edit lines and Couldn’t save the changes. Try again. is Claude's, within D-06's shape"
    verification: []
    human_judgment: true
    rationale: "Maker-facing sentences no test can judge; for Mark in chat"

duration: 40min
completed: 2026-10-27
status: complete
---

# Phase 11 Plan 10: Edit a saved first version and save over it Summary

**A saved first version reopens in the creation editor at /notebook/:recipeId/:versionId/edit with what it means (nothing the pen struck comes back, each step keeps its own row order), keeps its ink as an edit draft only once it holds a change, and Save writes it back over the same version keeping its id, Sheet code and written date; a version that gained a batch or a child in another tab refuses inside the transaction and its kept edit stays reachable until Cancel.**

## Performance

- **Duration:** about 40 minutes
- **Tasks:** 3 of 3 (Task 1 tracer, Tasks 2 and 3 auto)
- **Files:** 13 changed (3 created)
- **Tests:** baseline in this worktree 127 files, 4110 passing; at the end 128 files, 4149 passing (+39 tests, +1 file)

## Accomplishments

- `draftFromVersion` / `applyEditToVersion` / `sameCreateDraft` in `creationSave.js`. Placement is derived from the active lines once (a placeholder `{ step: 1 }` portion is never read as a placement: a first run of the tests caught this), unresolved and doubled lines fold with `addGrams`, a step's `uses` keeps the stored order, and every stored removed step comes back as a blank tombstone. Save-over builds through `buildCreation`, so rows are fresh library copies.
- `EditRoute`: reads once in an effect, never deletes. Another family's draft, or a version that can no longer be edited with no edit kept, replaces the address with the page; a kept edit opens on its draft with the version's refusal (`closedReason`) already standing under Save.
- `CreationPage` mode `edit`: `Version 1 · editing`, form `Edit version`, Save-over through `saveFirstVersionOver({ recipe, version, expected })`, the five refusal lines, Cancel that ends on the page with no state. 11-09's lock, choke point and mounted guard apply unchanged.
- `useKeptDraft`: `creationKind`, `cleanPayload`, `useDraftWriter(versionId, family)`; every delete names a family or kind; the restore leaves a foreign-family record alone.
- Walk: `makeVanilla` holds create-recipe's driving steps; `edit-first-version` and `edit-stale` prove Save-over and the stale refusal in WebKit, the latter through the real record pen in a second tab. Board: fB1 24 PASS.

## Task Commits

1. **Task 1 (tracer):** `1ba28ce9` (feat). Tracer gate: `<verify>` is automated-only, so the full suite was re-run before expanding (4129 passing). Tracer verified end-to-end, expanding.
2. **Task 2:** `b3f6f53f` (feat)
3. **Task 3:** `58d04565` (test)

## Pins changed (RecipePage.shell.test.js, the useKeptDraft entry)

- `["kind: 'create'", 1]` became `['kind: creationKind', 1]`.
- Added `['draftMatchesEdit(record)', 1]` and `['draftFamily(record.kind) !== family', 1]`.
- `['repository.deleteDraft(versionId)', 3]` became `['repository.deleteDraft(versionId, ', 3]`.
- `'draftMatchesEdit('` added to `shellLacks`. The count of `buildDraftRecord(` stays 3.

## Verification

- Full suite: `npm --prefix app test -- --run`: 128 files, 4149 passed.
- Acceptance greps all meet their thresholds: `/notebook/:recipeId/:versionId/edit` in router 1; `CHANGES_SAVED_STATUS` line 1; `kind: creationKind` 1 and `kind: 'create'` 0; `repository.deleteDraft(versionId)` 0 and `repository.deleteDraft(versionId, ` 3; `cleanPayload` 3; `draftFamily(record.kind) !== family` 1; `Version 1 · editing` 1; `saveFirstVersionOver(` 1; `activeRows(` and `activeSteps(` in creationSave.js 1 each; `can no longer be edited` 5 and `in another tab` 2 in CreationPage; `deleteDraft` in EditRoute 0; `takes today's library entries` 1; `'edit-stale'` 2; `walk-stale-batch` 0; `second-tab-saved` 1.
- Walk: `sh 11-walk-check.sh` ends `MATCH 94 snapshots; NEW create-recipe 3; NEW edit-first-version 3; NEW edit-stale 5`; `selftest` and `seedtest` print all PASS; the scenario-region comparison with 10-walk.mjs prints `PASS scenarios identical`.
- Board: `11-board-check.mjs 11-board-first-version.mjs --selftest` ends `24 PASS, 0 FAIL` with `PASS selftest fB1`; the five Phase 11 specs together 1062 PASS, 0 FAIL.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Existing tests asserted the old one-argument deleteDraft**
- **Found during:** Task 2
- **Issue:** Naming the family in every delete changes the call to `deleteDraft(versionId, 'pen' | 'plan' | 'amend' | 'create' | 'edit')`. 15 existing cases asserted `toHaveBeenCalledWith(versionId)`.
- **Fix:** their expectations now name the family or kind (RecipePage.drafts.test.jsx 9 lines, useKeptDraft.test.jsx 3, CreationFlow.test.jsx 2); the create harness in useKeptDraft.test.jsx builds its writer with `'create'`. No behaviour assertion was weakened.
- **Commit:** b3f6f53f

**2. [Plan ordering] cleanPayload, the refusal lines and closedReason landed in Task 1's commit**
- **Issue:** the tracer must verify end to end, and an untouched Edit that writes a draft (T-11-30) or a Save-over that cannot read `{ saved: false, reason }` would not. Task 2's commit holds the family-scoped deletes, the restore guard and the tests for the redirect, refused and stale cases.
- **Commit:** 1ba28ce9, b3f6f53f

**3. [Plan wording] applyEditToVersion lays style and serving temperature over the stored iceEd**
- **Issue:** the plan says iceEd is taken from the built version, which would reset a stored hardness or overrun figure to null (the editor does not author them).
- **Fix:** `iceEd: { ...stored.iceEd, style, servingTemperatureC }`. For a version this app created the result is identical.
- **Commit:** 1ba28ce9

**4. [Plan wording] A restore reading a record whose kind names no family**
- **Issue:** `draftFamily` throws on an unknown kind and the real store treats such a record as belonging to no family. A garbage record on the key would otherwise never be deleted.
- **Fix:** the restore catches the throw, falls through to the fit check, and deletes an unfit garbage record with no kind (as before); a record of a known foreign family is left alone.
- **Commit:** b3f6f53f

**5. [Fixture difference] fB1 draws two steps; the shared Vanilla root has three**
- **Found during:** Task 3 (first board run: 22 PASS, 2 FAIL, `.method-step__n` and `.prose-field--lead-in` counts, board 2, app 3). Classified before any edit as a fixture difference: the build draws every step it is given.
- **Fix:** 11-board-first-version.mjs seeds the root with the board's two steps, and says why in its comment. No app code was touched.
- **Commit:** 58d04565

**Total deviations:** 5 (one blocking test fix, one ordering note, two wording notes, one fixture). **Impact:** none on the contract.

## Known Stubs

None.

## Threat Flags

None. T-11-28, T-11-29, T-11-30, T-11-31, T-11-54, T-11-55 and T-11-59 are each covered by the tests above; T-11-66 is accepted as the plan states (the imported-record case is a test). `DB_VERSION` and every store shape are unchanged; there is no `dangerouslySetInnerHTML` and no literal visual value.

## Notes for Mark (for chat)

- **Wording that is Claude's, within D-06's shape:** "This version has a batch now and can no longer be edited.", "This version has a later version now and can no longer be edited.", "This version has a Next version or a batch open in another tab. Close it there, then save.", "This version changed in another tab. Cancel, then open it again.", "This version can no longer be edited." and "Couldn’t save the changes. Try again."; the landing notice is "Changes saved.".
- A kept edit whose version gained a batch or a later version is never deleted for the maker: the edit address opens it with that line already under Save, and Cancel discards it.
- Edit then Save on a first version whose strikes the pen saved over makes those strikes final (the struck rows, lines and steps are not carried into the editor; D-03 replaces the rows).
- On Edit each step keeps the order its rows were saved in (decide-p11-row-order-across-steps). A step key removed while creating can be issued again after Edit, one the pen struck cannot (decide-p11-step-key-reuse).
- Save-over takes each row's ingredient figures fresh from today's library (D-03), so a version whose stored figures differ from the library's reads today's Balance after Edit then Save; the editor already shows that Balance while editing.
- The two board departures 11-09 recorded still stand on the page after Save: "Version 1 · Version 1 · Latest" for a default-named first version, and "Only this version so far" for a lone History. Plan 11-12's fA1 will meet the first again.

## Next Phase Readiness

Plan 11-12 can link `editPath(recipeId, versionId)` from the page's Edit link, the Notebook's Resume editing and the import guard, and add fA1 and fC1 to `11-board-first-version.mjs`. `EditRoute` already opens a kept edit on a version that can no longer be edited, so Resume editing needs no route change. `makeVanilla` and `quietMark` in 11-walk.mjs are there for its scenarios.

## Authentication Gates

None.

## Self-Check: PASSED

- Files found: app/src/ui/EditRoute.jsx, app/src/ui/EditFlow.test.jsx, app/src/domain/creationSave.js, app/src/ui/CreationPage.jsx, app/src/router.jsx, .planning/phases/11-steps-structure-save-and-print/11-walk.mjs, .planning/phases/11-steps-structure-save-and-print/11-board-first-version.mjs.
- Commits found: 1ba28ce9, b3f6f53f, 58d04565.
