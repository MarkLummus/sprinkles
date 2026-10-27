---
phase: 11-steps-structure-save-and-print
plan: 09
subsystem: ui
tags: [react, creation-editor, save, indexeddb, validation-gate, webkit, board-conformance]

requires:
  - phase: 11-steps-structure-save-and-print
    provides: 11-03 createRecipe's optional fields and repository.createRecipeWithVersion; 11-02 the steps ops (groupRows, rowLines, checkAllocation); 11-08 the editor Save is wired into
provides:
  - "domain/creationSave.js: buildCreation, creationSaveBlock, lineSaveMessages and the constants NO_ROWS_MESSAGE, PROBLEM_REPEATED, LIBRARY_ENTRY_GONE"
  - "useDraftWriter.endDraft() and resumeDraft(): stop the writer without deleting, give it back when a save fails"
  - "CreationPage: Save after Cancel, one lock-and-gate ref, the setCreateDraft choke point, Saving..., RECIPE_CREATE_ERROR, the refusal messages and focus map"
  - "router.jsx: RECIPE_SAVED_STATUS and RecipePageForRoute reading state.saved once"
  - "11-walk.mjs scenario create-recipe; 11-board-save.mjs (vA1, vC1)"
affects: [11-10, 11-11, 11-12, 11-13]

actuals:
  tokens: 21500
  tasks: 3
  commits: 5

plan_head_before: 8dd83cdb56aecae406a0d9550683be9ffb36ac8b
commits: 5
plan_head_after: 15d73be4635454052b1e54acccae797d60abab75

tech-stack:
  added: []
  patterns:
    - "One ref is both the save lock and the draft-change gate: it is set before the first await, so a second press does nothing and the single setCreateDraft entry point drops every change while a save is out"
    - "The save ends the draft writer (timer cleared, record held, endedRef set) instead of deleting: the transaction deletes the draft, so a failed save leaves it where it was and resumeDraft writes back what was held"
    - "A refusal is a block { id, message, target }; lineSaveMessages is the one projection onto the table's line keys, so nothing recognises a block by its id prefix"
    - "Route state carries an enum word ('created'); the page owns the sentence"

key-files:
  created:
    - app/src/domain/creationSave.js
    - app/src/domain/creationSave.test.js
    - .planning/phases/11-steps-structure-save-and-print/11-board-save.mjs
  modified:
    - app/src/ui/useKeptDraft.js
    - app/src/ui/useKeptDraft.test.jsx
    - app/src/ui/CreationPage.jsx
    - app/src/router.jsx
    - app/src/ui/CreationFlow.test.jsx
    - app/src/store/creation-roundtrip.test.js
    - .planning/phases/11-steps-structure-save-and-print/11-walk.mjs

key-decisions:
  - "One savingRef is the lock, the gate and the choke point's switch; the plan names a lock ref and savingRef separately, but they never differ"
  - "A save that fails after the maker left the page still calls writer.resumeDraft (it works on refs), so text typed in the last 250 ms is written back; only React state is guarded by mountedRef"
  - "RecipePageForRoute announces on every run of its effect while state.saved is 'created' and guards only the state-dropping navigate with the ref: StrictMode's simulated unmount clears the notice timer, and a guarded announce would leave the notice on screen for good"
  - "The ceremony's Version name keeps its always-on Required line; a refusal replaces it with the error 'Required' and the aria wiring"
  - "Two scales that share a name are not refused: the plan lists the refusals and transfer.js does not ask for it (creation.js's addScale comment says Phase 11's Save would; for Mark)"

requirements-completed: [MAKE-10]

coverage:
  - id: S1
    description: "Save creates the recipe and its first version in one createRecipeWithVersion call carrying everything authored, trimmed, and lands on the new page, which reads as a seeded root"
    requirement: "MAKE-10"
    verification:
      - kind: unit
        ref: "app/src/domain/creationSave.test.js#buildCreation: the records a creation saves (15 cases)"
        status: pass
      - kind: integration
        ref: "app/src/store/creation-roundtrip.test.js#a recipe built by buildCreation (validateStoreFile, a child, buildDiff, penDraftFromVersion)"
        status: pass
      - kind: integration
        ref: "app/src/ui/CreationFlow.test.jsx#Save creates the recipe and its first version (9 cases, StrictMode, the real RecipePageForRoute)"
        status: pass
      - kind: integration
        ref: "11-walk.mjs create-recipe (WebKit, built app): one new recipe, one version with a Sheet code, no draft, seeded records unchanged"
        status: pass
    human_judgment: false
  - id: S2
    description: "'Recipe saved.' shows on landing and clears after 5 s; the Notebook then lists the recipe with no draft row and no Resume, including when text was typed inside the debounce window"
    requirement: "MAKE-10"
    verification:
      - kind: integration
        ref: "CreationFlow.test.jsx 'the landing carries the enum word only...' and 'the new page reads as a seeded root...'"
        status: pass
      - kind: unit
        ref: "app/src/ui/useKeptDraft.test.jsx#endDraft and resumeDraft (6 cases)"
        status: pass
    human_judgment: false
  - id: S3
    description: "While the transaction is out nothing races it (Save Saving..., Cancel and the band fields disabled, every other change dropped at setCreateDraft, navigate only while mounted); a double press writes once; a failed save writes nothing, keeps the draft, gives the writer back and says so under Save"
    requirement: "MAKE-10"
    verification:
      - kind: integration
        ref: "CreationFlow.test.jsx 'while the transaction is out' (4 cases on a held promise), 'two quick presses write once', 'a rejected save keeps the draft...'; the choke point was removed once to prove two of them fail without it"
        status: pass
    human_judgment: false
  - id: S4
    description: "The gate lists every refusal at once in page order, reads every field trimmed, refuses a row whose lines overflow together under its last line, and Save writes nothing while any stands; focus goes to the first refused field in each target kind's real control"
    requirement: "MAKE-10"
    verification:
      - kind: unit
        ref: "app/src/domain/creationSave.test.js#creationSaveBlock (18 cases) and #lineSaveMessages (2 cases)"
        status: pass
      - kind: integration
        ref: "CreationFlow.test.jsx 'Save refuses everything the store file would refuse' (11 cases: name, Version name, no rows with and without the picker, lead-in, instruction, target side, High end, unpicked kind, problems, 309 digits, the two-line overflow)"
        status: pass
    human_judgment: false
  - id: S5
    description: "The ceremony (vA1) and the after-Save page's notice, Next version and History caption (vC1) match sketch 014 in WebKit at 1366"
    requirement: "MAKE-10"
    verification:
      - kind: integration
        ref: "11-board-check.mjs 11-board-save.mjs --selftest --evidence -> 25 PASS, 0 FAIL, PASS selftest vA1 and vC1; the three Phase 11 specs together 923 PASS, 0 FAIL"
        status: pass
    human_judgment: false
  - id: S6
    description: "The after-Save page's identity line ('Version 1 · Version 1 · Latest') and a lone version's History ('Only this version so far') read differently from the board's 'Version 1 · Latest' and one-node fold with '1 version'"
    verification: []
    human_judgment: true
    rationale: "A design choice between the board and a build rule that earlier phases settled (lineage.js versionIdentity; RecipeHistory.jsx's lone-version line, 03.5-18); for Mark and Sid, not decided here"
  - id: S7
    description: "The export-first check row on Mark's List before any device build that can save (D-21)"
    verification: []
    human_judgment: true
    rationale: "Task 4 is the orchestrator's write: gsd-executor has no ArtifactData; the row's content is in this plan's checkpoint return and the continuation records its readback here"
  - id: S8
    description: "The wording of 'This problem is already listed.', 'Couldn’t save the recipe. Try again.' and 'An ingredient on this recipe is no longer in the library.'"
    verification: []
    human_judgment: true
    rationale: "Maker-facing sentences, Claude's wording within the existing sentences' shape, for Mark in chat"

duration: 21min
completed: 2026-10-27
status: checkpoint
---

# Phase 11 Plan 09: Save creates the recipe and its first version Summary

**Save writes the recipe and its first version in one transaction (rows as fresh library copies, steps in each step's own row order, notes, scales, problems, targets, style and serving temperature, all trimmed), lands on the new page with "Recipe saved." and leaves no Resume; every store-file fault is refused at once in page order, an overflowing row included, and nothing is written while the editor holds still during the save.**

## Status

Tasks 1 to 3 are done and committed. Task 4 (the export-first row on Mark's List) is the orchestrator's write and is returned as a checkpoint; this SUMMARY is the partial the continuation finishes (it adds the row's readback: id, status, version).

## Performance

- **Duration:** about 21 minutes (2026-10-27T02:47Z to 03:08Z)
- **Tasks:** 3 of 4 (Task 1 tracer, Task 2 auto, Task 3 auto; Task 4 the checkpoint)
- **Files:** 10 changed (3 created)
- **Tests:** baseline in this worktree 126 files, 4047 passing; after 127 files, 4110 passing (+63, +1 file)

## Accomplishments

- `creationSave.js`: `buildCreation(draft, { libraryById, styles, now })` builds through `createRecipe`'s optional fields. It throws a TypeError for a missing library entry, an allocation `checkAllocation` rejects and an amount that does not read, so an inconsistent draft is a save error with the draft kept, never a stored version. `creationSaveBlock` walks the table's own order (each live step in method order, its rows through `groupRows`, then the unplaced rows) and gives every block a target; `grams-total:${rowId}` targets the row's last line and is checked only when every line reads; `lineSaveMessages` is the one projection onto `${rowId}:${step}`.
- `useDraftWriter`: `endDraft()` clears the timer, holds the waiting record, sets `endedRef`; `resumeDraft()` writes the newest held record. No `deleteDraft` call was added (the three pinned stay three; the two pinned function markers stay one each).
- `CreationPage`: Save beside Cancel, `handleSave` (gate, then lock, build, end the writer, one transaction, navigate only while mounted), the one `setCreateDraft` entry point, the band's and ceremony's drawn messages, and `findRefusedField` mapping every target kind to the control the editor really draws (the picker's Name field when no row is added and the picker is open; a scale's Low end, High end, Name or first radio inside its own card).
- `router.jsx`: `RECIPE_SAVED_STATUS`; `RecipePageForRoute` announces it from the enum word `created`, then drops the word from the entry's state (focusVersion stays).
- `11-walk.mjs`: scenario `create-recipe` (a split row, a step moved by keyboard, Save, the stores, the Notebook); `11-board-save.mjs`: vA1 and vC1.

## Task Commits

1. **Task 1 (tracer), RED:** `1fe491b0` (test)
2. **Task 1 (tracer), GREEN:** `9e32cd01` (feat)
3. **Task 2, RED:** `aecb9d06` (test)
4. **Task 2, GREEN:** `abe97c28` (feat)
5. **Task 3:** `15d73be4` (test)

Tracer gate: Task 1's `<verify>` is automated-only, so it was re-run end to end (the whole suite, 4079 passing) before Task 2. Tracer verified end-to-end, expanding.

## TDD Gate Compliance

Both TDD tasks have a test commit before the feature commit. RED for Task 1 was a stub `buildCreation` that throws: 15 of 15 target cases failed on their own assertions (the TypeError cases failed because the stub threw a plain Error). RED for Task 2 was the missing `creationSaveBlock`: 20 failed, the 15 `buildCreation` cases already green. The format-based classifier was not run (the plan is `type: execute`, not `type: tdd`).

## Verification

- Task 1 verify (eight files): 406 passed. Task 2 verify and the full suite: 4110 passed in 127 files. Acceptance greps all meet their thresholds (`function endDraft(` 1, `function resumeDraft(` 1, `repository.deleteDraft(versionId)` 3, `createRecipeWithVersion(` 1 in CreationPage, `saved: 'created'` 1, RECIPE_SAVED_STATUS 1, `<Link` 0 in router.jsx, `function setCreateDraft(` 1, `setCreateDraftState(` 1, `disabled={saving}` 5, `export function creationSaveBlock` 1, `grams-total:` 2, `export function lineSaveMessages` 1, `repeat(308)` 2, Low end 1, High end 1, `creationSaveBlock(` 2).
- Board: `11-board-check.mjs 11-board-save.mjs --selftest --evidence` ends `25 PASS, 0 FAIL` with `PASS selftest vA1`, `PASS selftest vC1`, `evidence save-vC1` and `save-vC1-app.png` present (the card is in the picture). With 11-board-steps and 11-board-structure: `923 PASS, 0 FAIL`.
- Walk: `sh 11-walk-check.sh` ends `MATCH 94 snapshots; NEW create-recipe 3`; the scenario-region comparison with 10-walk.mjs prints PASS; `selftest` and `seedtest` print all PASS lines.
- Mutation check: removing the `savingRef` test from `setCreateDraft` fails two of the held-promise cases (restored).

## Deviations from Plan

### Auto-fixed Issues

**1. [Plan rule - genuine board/build difference] vC1 compares `.notebook-version__latest` and the History caption, not the identity text and the History count**
- **Found during:** Task 3 (first run: 20 PASS, 2 FAIL, both classified before any edit)
- **Issue:** (a) The board reads "Version 1 · Latest"; the build's identity line is `Version ${n} · ${versionLabel}` plus " · Latest", so the new recipe's default Version name reads "Version 1 · Version 1 · Latest" (plan 11-01 found the same on its seeded Vanilla). (b) The board draws History as a fold with one node and "1 version"; the build reads a lone saved version as one plain line, "Only this version so far" (RecipeHistory.jsx, 03.5-18, sketch 011 versions-1-vs-many). No stored label and no CSS can read either board value; both are product rules from earlier phases, outside this plan's files.
- **Fix:** `.notebook-version__identity` [text] became `.notebook-version__latest` [text] and `.notebook-history .fold-row__count` [text] became `.notebook-history .notebook-caption` [count, text]; both reasons are in the spec's comment. The tolerance stayed 1 px; no app code was touched.
- **Files modified:** 11-board-save.mjs
- **Commit:** 15d73be4

**2. [Plan wording] The walk's focus check after the keyboard move**
- **Found during:** Task 3
- **Issue:** The scenario has two steps, so the moved step is last and its Move down is off; focus lands on its other Move button (D-16), "Step 2, move up", not "Step 2, move down" as the three-step board shows.
- **Fix:** the scenario waits for "Step 2, move up".
- **Commit:** 15d73be4

**3. [Rule 3 - Blocking] The CreationFlow harness stood in for a page it had never mounted**
- **Found during:** Task 1
- **Issue:** The landing case mounts the real `RecipePageForRoute`, which reads `getVersion`, `listBatchesForVersion`, `listVersions`, `getRecipe` and `getBatch`; the in-memory repository had none of them and no store for created records.
- **Fix:** the mock gained those five reads over the seed groups plus the records `createRecipeWithVersion` stores, and the one assertion that pinned "no Save yet" now expects Save.
- **Files modified:** app/src/ui/CreationFlow.test.jsx
- **Commit:** 9e32cd01

**Total deviations:** 3 (1 plan-rule board difference, 1 wording, 1 blocking test fixture). **Impact:** none on the build; the first is a finding for Mark and Sid.

## Known Stubs

None.

## Threat Flags

None. T-11-24 (endDraft before the transaction, the Notebook test), T-11-25 (the lock, two presses one call), T-11-26 (enum word only), T-11-27 (the gate mirrors transfer.js; the round-trip test), T-11-52 (the held-promise cases) and T-11-53 (grams-total, lineSaveMessages) are each covered by the tests named above. `DB_VERSION` and every store shape are unchanged; there is no `dangerouslySetInnerHTML` and no literal visual value (the Save button and the line under it use classes that already existed).

## Notes for Mark and Sid

- **For Mark in chat (new sentences, Claude's wording):** "This problem is already listed." (D-25), "Couldn’t save the recipe. Try again." and the unreachable "An ingredient on this recipe is no longer in the library."; an unreadable serving temperature saves empty; while Save is out the editor holds still ("Saving…", Cancel and the fields off).
- **For Mark, a question:** `creation.js`'s `addScale` comment says Phase 11's Save refuses two scales with one name; the plan's gate lists no such refusal and the import check does not need one, so none was added. Say if you want it.
- **For Mark and Sid, two board departures (S6):** the after-Save page reads "Version 1 · Version 1 · Latest" for a first version left at its default name, and "Only this version so far" where the board draws a one-node History with "1 version". The choices are to change the build (drop the label when it repeats the ordinal; draw the fold for one version) or to redraw the board. Neither was decided here. Plan 11-12's fA1 will hit the first again.
- **For Sid:** the build keeps "Print sheet" beside Next version on the after-Save page because print (MAKE-12) starts from it; the board does not draw it (no redraw asked).

## Next Phase Readiness

Plan 11-11 can read `creationSaveBlock` and `lineSaveMessages(blocks)` to show every refusal in its place (the table's line keys are `${rowId}:${step}`); `findRefusedField` already maps every target kind. Plan 11-12's Shell guard reads `saved: 'created'`, which the landing now carries for one render. Plan 11-10's reopened editor can reuse `buildCreation`'s shape for Save over.

## Authentication Gates

None.

## Self-Check: PASSED

- Files found: app/src/domain/creationSave.js, app/src/domain/creationSave.test.js, app/src/ui/useKeptDraft.js, app/src/ui/useKeptDraft.test.jsx, app/src/ui/CreationPage.jsx, app/src/router.jsx, app/src/ui/CreationFlow.test.jsx, app/src/store/creation-roundtrip.test.js, .planning/phases/11-steps-structure-save-and-print/11-walk.mjs, .planning/phases/11-steps-structure-save-and-print/11-board-save.mjs.
- Commits found: 1fe491b0, 9e32cd01, aecb9d06, abe97c28, 15d73be4.
