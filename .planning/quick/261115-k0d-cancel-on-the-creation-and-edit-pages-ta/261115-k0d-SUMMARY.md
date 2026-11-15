---
phase: quick-261115-k0d
plan: 01
quick_id: 261115-k0d
subsystem: ui
tags: [creation-editor, save-lock, cancel, race]
requires: []
provides:
  - "Cancel takes the save lock (savingRef) before its delete and gives it back only if the delete fails"
affects: [app/src/ui/CreationPage.jsx]
key-files:
  modified:
    - app/src/ui/CreationPage.jsx
    - app/src/ui/CreationFlow.test.jsx
    - app/src/ui/EditFlow.test.jsx
decisions:
  - "Cancel sets savingRef only, never setSaving: the screen is unchanged while the delete is out"
  - "The lock stays held after a successful delete, which also covers the create page's listDrafts read"
status: complete
commits: 1
plan_head_before: 1cd74191bfe9a7bdddb5544cc9a04b4be3ed1e14
plan_head_after: af101f6e1d7ff16f6fd8a80d0cbc26bf8523c55a
actuals:
  tokens: 6000
  tasks: 2
  commits: 1
metrics:
  completed: 2026-11-15
---

# Phase quick-261115-k0d Plan 01: Cancel takes the save lock Summary

Cancel on the New recipe page and the Edit page of a first version now takes the same `savingRef` lock Save uses, so a Save pressed while Cancel's delete is out does nothing instead of writing the recipe; a failed delete gives the lock back.

## What changed

`handleCancel` in `app/src/ui/CreationPage.jsx` gained two code lines: `savingRef.current = true;` under the existing guard, and `savingRef.current = false;` as the first statement of the catch after `writer.discardDraft({ final: true })`. Two comments (above `savingRef` and above `handleCancel`) were brought up to date. Nothing else in the file changed; the code diff against the base is exactly those two lines.

Fix commit: `af101f6e`.

## Red evidence (before the fix, unchanged CreationPage.jsx)

Exactly two failures, each on its not-called expectation; C2, C3, E2 passed.
- C1 (create page): `AssertionError: expected "vi.fn()" to not be called at all, but actually been called 1 times` (createRecipeWithVersion, CreationFlow.test.jsx:1928)
- E1 (edit page): `AssertionError: expected "vi.fn()" to not be called at all, but actually been called 1 times` (saveFirstVersionOver, EditFlow.test.jsx:762)

## Green

- Both files whole: 2 files, 137 tests pass.
- Full suite: 134 files, 4360 tests (4355 + the five new cases), zero failures.
- Scratch build into `$TMPDIR/sprinkles-k0d/dist` succeeds and writes index.html. `app/dist` and the preview on 4173 were not touched.
- Scope gates against the base: useKeptDraft.js, app/src/store, app/src/domain, app/src/styles and app/dist unchanged; CreationPage.jsx has exactly two changed code lines, both in handleCancel.

## Cases added

- Create page (CreationFlow.test.jsx, describe "while Cancel's delete is out (bug-creation-cancel-save-race)"):
  - C1: Save pressed inside the held delete, and again inside the held listDrafts read, writes nothing; Cancel lands on the Notebook with `{ discarded: true, createKept: false }`; screen shows no busy state while held.
  - C2: delete fails, lock returns, Save writes the recipe once and lands on it.
  - C3: delete fails, lock returns, a second Cancel discards and lands on the Notebook.
- Edit page (EditFlow.test.jsx, describe "Cancel holds the save lock while its delete is out (bug-creation-cancel-save-race)"):
  - E1: Save inside the held delete never calls saveFirstVersionOver; Cancel lands on the version page with null state; stored name stays "Vanilla".
  - E2: delete fails, lock returns, Save writes over the version once.

## Decisions

- Cancel sets the ref only and never calls `setSaving`, so Save reads Save and is enabled, and Cancel and the fields stay enabled while the delete is out. No busy state added.
- The lock is released only in the delete's catch. After a successful delete it stays held until the page leaves, which also closes the create page's `listDrafts` read; C1 pins both holds.
- Consequence recorded: while Cancel holds the lock, `setCreateDraft` drops edits, as it does during Save. A keystroke typed in those few milliseconds is not accepted (today it would be accepted and written back if the delete failed). This is the "same lock" Mark chose; it cannot be hit by hand.
- A second Cancel pressed while the first delete is out now does nothing (today it starts a second delete). Harmless.

## Deviations from Plan

None - plan executed exactly as written.

## Verification notes

- No browser walk. The gap is the few milliseconds of one IndexedDB delete and cannot be hit by hand. The jsdom cases hold the delete open with a deferred, the only way to put a Save inside it. No probe was invented.
- Deferred Human Verification: none.
- The build is safe to deploy: no stored shape, DB_VERSION or wording changed.
- The commit was made on `main`, as the orchestrator's sequential-execution instruction directs.

## For the orchestrator

The Mark's List row `bug-creation-cancel-save-race` is yours to close now that the fix commit `af101f6e` has landed (resolvedAt from `date -u`, a one-line reply). The executor has no ArtifactData and did not touch the list.

## Known Stubs

None.

## Threat Flags

None.

## Self-Check: PASSED

- app/src/ui/CreationPage.jsx, CreationFlow.test.jsx, EditFlow.test.jsx: modified, present.
- Commit af101f6e: present on main.
