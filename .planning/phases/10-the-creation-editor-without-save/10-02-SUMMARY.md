---
phase: 10-the-creation-editor-without-save
plan: 02
subsystem: ui
tags: [react, creation-editor, kept-draft, notebook, indexeddb-drafts]

requires:
  - phase: 10-the-creation-editor-without-save
    provides: 10-01 strict walk (10-walk-check.sh) and the board engine
  - phase: 09-the-library-and-the-stored-shapes-plus-the-two-places
    provides: the create draft shape (blankCreateDraft, draftMatchesCreate), the Notebook place, the drafts store
provides:
  - the /notebook/new route (CreationRoute) and the creation editor page (CreationPage) over the shared Sheet in mode creating
  - the Notebook's New recipe entry, Start, and the draft row with Resume
  - domain/creation.js (UNTITLED, creationTitle, normalizeCreateDraft, creationSheetVersion)
  - useKeptDraft's kept-until-Cancel rule and discardDraft({ final }) with failed-Cancel recovery
affects: [10-03, 10-04, 10-05, 10-06, 10-07, 10-08, 10-09, 10-11, 10-12]

actuals:
  tokens: 17700
  tasks: 2
  commits: 2

plan_head_before: 57e4a54a9e183ec40420f80369b9131f79f0b803
commits: 2
plan_head_after: 90368fe36d8fb0e2f15387478473b50d6f41644a

tech-stack:
  added: []
  patterns:
    - "The editor never reads a stored payload as stored: normalizeCreateDraft lays it over blankCreateDraft at the first state and at every restore"
    - "A final discard holds writes while its delete is out (endedRef), stays final on success, gives persistence back on failure"
    - "Start is a type=submit Button inside the entry form, so a click and Enter take the one path"

key-files:
  created:
    - app/src/domain/creation.js
    - app/src/domain/creation.test.js
    - app/src/ui/CreationRoute.jsx
    - app/src/ui/CreationPage.jsx
    - app/src/ui/CreationFlow.test.jsx
  modified:
    - app/src/ui/NotebookPlace.jsx
    - app/src/ui/NotebookPlace.test.jsx
    - app/src/ui/notebookPaths.js
    - app/src/ui/notebookPaths.test.js
    - app/src/router.jsx
    - app/src/ui/useKeptDraft.js
    - app/src/ui/useKeptDraft.test.jsx

key-decisions:
  - "CreationPage omits the plan's unused justStarted prop; plan 10-11 adds it with the notice that reads it"
  - "Start's rejected read or write is caught and left quiet in NotebookHead until plan 10-03 words it"
  - "isCreateDraftDirty stays exported and tested in domain/draft.js (draft.test.js) but no app code calls it now"

patterns-established:
  - "CreationFlow.test.jsx: Notebook and editor mounted whole under StrictMode over an in-memory repository, every non-drafts write a spy proven never called"

requirements-completed: [MAKE-04, MAKE-05, MAKE-11]

duration: 25min
completed: 2026-10-20
status: complete
---

# Phase 10 Plan 02: The creation editor without Save, opened end to end Summary

**New recipe, a name and Start write one name-only create draft and open /notebook/new, where the shared Sheet reads the creation in mode creating; the draft is kept as typed until Cancel, and Cancel is final once its delete succeeds.**

## Performance

- **Duration:** about 25 min
- **Completed:** 2026-10-20
- **Tasks:** 2 (one tracer, one tdd)
- **Files:** 5 created, 7 modified, all under app/src

## Accomplishments

- Notebook place: New recipe at the end of the title row opens `form.nb__new` (Name, Cancel, Start); Name takes focus, Cancel returns focus to New recipe. Start is `type="submit"`. A blank trimmed name does nothing (plan 10-03 adds the sentence). Start re-reads the drafts and, when a create draft exists, writes nothing and draws that draft's row with Resume in place of the entry (D-04b); otherwise it writes `blankCreateDraft` (name trimmed, Version 1) through `saveDraft`, awaits it, then navigates to `/notebook/new` with `{ started: true }`.
- Draft row as sketch 013 nE1/nD2 draws it (`ul.nb__drafts > li.nb__draft`), above the count, uncounted, in the list and empty branches; its name reads `creationTitle` (Untitled while blank).
- `/notebook/new` declared before `/notebook/:recipeId`; `CreationRoute` keeps the newest `draftMatchesCreate` record, mounts `CreationPage` keyed by its versionId, and replace-navigates to `/notebook` silently on none or a failed read. No id in the address.
- `CreationPage`: band with Recipe name and Recipe description, ceremony form "New recipe" with "New recipe · draft", Version name and Required, Cancel only (no Save, no Sheet code); `RecipeSheet` in mode `creating` with no baseline; tab title `Untitled · Sprinkles` while blank; draws nothing until the hook's restore read settles.
- `useKeptDraft`: the creating branch always builds the record (overwritten, never deleted); `discardDraft({ final })` returns the delete's promise, holds every write while the delete is out, drops held ink on success, and on failure clears `endedRef`, marks the record stored and writes the held or waiting record at once. The restore settles without restoring once ended. All RecipePage.shell.test.js pins hold with no line of that file changed.
- Cancel awaits the delete, then replace-navigates to `/notebook` with `{ discarded: true }`; a failed delete leaves the page where it is with every edit still kept.

## Task Commits

1. **Task 1 (tracer): New recipe, Start and the editor at /notebook/new, Cancel discards** - `26cf42e3` (feat)
2. **Task 2: the Sheet reads the creation, kept until Cancel, Cancel is final** - `90368fe3` (feat)

## Verification Run

- `npm --prefix app test`: 115 files, 3526 tests, all green (baseline 113 files, 3475 tests; the two new files are creation.test.js and CreationFlow.test.jsx).
- `sh .planning/phases/10-the-creation-editor-without-save/10-walk-check.sh`: `MATCH 94 snapshots`.
- Task 1 verify (CreationFlow, NotebookPlace, notebookPaths, RecipePage, tabindex-scan): 181 passed.
- Tracer gate: Task 1's verify re-run end to end after the commit passed before Task 2 began.
- Red seen for creation.js (module missing) before the module was written. A mutation check (removing the flush guard) failed three hook cases; removing only the persist effect's hold fails none, because the flush guard and the success handler already cover it (the hold is the plan's belt-and-braces).
- All Task 1 and Task 2 acceptance greps give the plan's counts (router route 1, NEW_RECIPE_PATH 1, `await repository.saveDraft(` 1, `type="submit"` 1, `creating: true` 1, endedRef 10, `deleteDraft(versionId)` 3, `normalizeCreateDraft(` 2 in CreationPage, no `<button` in the new files, no raw-HTML prop).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] The worktree had no app/node_modules**
- Untracked symlink `app/node_modules` to the main checkout's (gitignored). No package installed.

### Notes

- The plan's Task 1 text says every class the boards draw "already has rules in notebook.css and shell.css". In this tree `nb__head`, `nb__new`, `nb__new-actions`, `nb__drafts`, `nb__draft` and `nb__draft-act` have no rules yet (grep of app/src/styles finds none), so the new Notebook head, entry and draft row render unstyled until plan 10-03 ports the boards' rules and measures them with the 10-01 engine. The same holds for the editor band until plan 10-05. No CSS was added here, as the plan says. The walk does not visit the Notebook place, so it is unaffected.
- `CreationPage({ record })` has no `justStarted` prop (the plan's signature lists one); nothing reads it in this plan, so it was left for plan 10-11.
- `isCreateDraftDirty` is now unused by the app; it stays exported and tested in domain/draft.js.

## Authentication Gates

None.

## Known Stubs

- `aside.notebook-log` ("Setup") in CreationPage is empty by the plan; plan 10-08 fills it. `div.notebook-body__sheet` shows a Sheet with no rows ("This version has no ingredient rows.") until plan 10-06 adds rows. Neither is added to `.planning/WINDOWS.md` (the ledger command is not available to this agent).

## Threat Flags

None. The new route and the drafts writes are the ones the plan's threat model lists (T-10-04 to T-10-09, T-10-31).

## Self-Check: PASSED

- Created files exist: creation.js, creation.test.js, CreationRoute.jsx, CreationPage.jsx, CreationFlow.test.jsx, this file.
- Commits `26cf42e3` and `90368fe3` are ancestors of HEAD.
