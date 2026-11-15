---
phase: quick-261114-ui5
plan: 01
quick_id: 261114-ui5
subsystem: ui
tags: [recipe-page, kept-draft, edit, bug-edit-missing-after-misfit-draft-dropped]
status: complete
requirements: [bug-edit-missing-after-misfit-draft-dropped]
key-files:
  modified:
    - app/src/ui/useKeptDraft.js
    - app/src/ui/RecipePage.jsx
    - app/src/ui/RecipePage.edit.test.jsx
  created:
    - .planning/quick/261114-ui5-edit-shows-at-once-when-a-kept-draft-tha/261114-ui5-probe.mjs
actuals:
  tasks: 2
  commits: 3
plan_head_before: 058422204d278687e64e14cad07f2f1dd0258118
plan_head_after: d670b474fe0455110f29acb031f8ec91db5c0410
commits: 3
completed: 2026-11-14
---

# Quick 261114-ui5: Edit shows at once when a kept draft that no longer fits is dropped

When the recipe page deletes a kept pen draft that no longer fits its version, it now also drops that draft from its own drafts list, so Edit shows at once on a first version with no batch instead of after a reload.

## BASE and counts

- BASE: `058422204d278687e64e14cad07f2f1dd0258118` (short 05842220; the plan was written at 168a5da2, main had moved by docs commits only).
- Full suite before: 132 files, 4330 tests. After: 132 files, 4334 tests, 0 failed.

## Change

- `useKeptDraft.js` (+8 lines): optional `onMisfitDeleted` (default no-op). The misfit branch chains a `.then((deleted) => { if (deleted) onMisfitDeleted(); })` after its `deleteDraft`.
- `RecipePage.jsx` (+5 lines): passes `onMisfitDeleted` that calls `setDrafts` with a functional updater dropping entries whose `versionId` is this page's. Filter is by versionId alone (the store holds one draft per version key), so garbage kinds are trimmed too.
- `CreationPage.jsx` is untouched; the default no-op keeps the creation editor as at BASE.
- Both diffs are additive: deleted column 0 on both files.

## RED then GREEN

RED (at BASE, commit ace14aed): A (misfit plan draft) and B (garbage kind `scribble`) failed on the acts-row expectation only, after the deleteDraft, store and no-Cancel expectations passed: `expected [ 'Next version', 'Print sheet' ] to deeply equal [ 'Next version', 'Edit', 'Print sheet' ]`. C (rejected delete) and D (delete resolves false) passed. `Tests 2 failed | 2 passed | 19 skipped`.

GREEN (after 5012b5f9): the new describe 4 passed; RecipePage.edit, RecipePage.drafts, useKeptDraft and CreationFlow suites 212 passed.

## Built-app probe (scratch builds, no app/dist, no Vite, no 4173)

1366x1024, fine pointer, Olive Oil v1 with its batches removed. Both WebKit and Chrome launched.

| Walk | Base build | Fixed build |
| --- | --- | --- |
| W0 control, no draft | Next version, Edit, Print sheet | same |
| W1 misfit plan draft | Next version, Print sheet (draft deleted, Edit missing); after reload Edit present | Next version, Edit, Print sheet at once; draft deleted; no Cancel; Edit after reload too |
| W2 garbage-kind draft | Edit missing | Edit shows; draft deleted |

`check`: 10 PASS, 0 FAIL (WebKit 5 PASS, Chrome 5 PASS). The IndexedDB ordering assumption in the plan (listDrafts arrives before the trim) held in both engines.

## Scope gates

- `git diff --numstat BASE` on useKeptDraft.js and RecipePage.jsx: 8/0 and 5/0.
- `git diff --quiet BASE -- CreationPage.jsx useRecipeData.js app/src/domain app/src/store app/src/styles`: exit 0.
- Changed files: the three app files above plus the probe; `onMisfitDeleted` count 2 / 1 / 0 in useKeptDraft / RecipePage / CreationPage.

## Commits

- ace14aed `test(261114-ui5)`: red tests
- 5012b5f9 `fix(261114-ui5)`: the callback and the trim
- d670b474 `test(261114-ui5)`: built-app probe

## Deviations from Plan

None to the code. One note: the commit trailers use `Co-Authored-By: Claude Sonnet 5.5` (the attribution the session's system reminder prescribes) rather than the model names the plan and the dispatch message named, which disagreed with each other.

## Orchestrator notes

- Close Mark's List row `bug-edit-missing-after-misfit-draft-dropped` with a reply such as: "A kept draft that no longer fits is now dropped from the page's list too, so Edit shows at once; tested red then green, and walked in WebKit and Chrome." (The executor cannot write to the list.)
- The dist build is safe to deploy: no store, data or migration change.
- No device step for Mark: a misfit draft cannot be made by hand on the iPad.

## Known Stubs

None.

## Threat Flags

None.

## Self-Check: PASSED

Files found: the three app files, the probe, this summary. Commits ace14aed, 5012b5f9, d670b474 are ancestors of HEAD.
