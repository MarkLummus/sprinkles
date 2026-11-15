---
phase: quick-261115-htp
plan: 01
quick_id: 261115-htp
subsystem: store/creation
tags: [wr-02, drafts, two-tabs, edit, fingerprint]
status: complete
key-files:
  modified:
    - app/src/domain/firstVersion.js
    - app/src/domain/firstVersion.test.js
    - app/src/ui/EditRoute.jsx
    - app/src/ui/CreationPage.jsx
    - app/src/ui/useKeptDraft.js
    - app/src/store/repository.js
    - app/src/store/repository.test.js
  created:
    - app/src/ui/EditRoute.staleEdit.test.jsx
    - .planning/quick/261115-htp-wr-02-11-review-md-phase-11-a-kept-edit-draft-reopened-after/261115-htp-probe.mjs
actuals:
  tasks: 3
  commits: 5
plan_head_before: d69f36f25430d7c9985411939076820deb54c30f
plan_head_after: 8d8db44a3bd1a244964d06fe0b49cdce43300e33
---

# Quick 261115-htp: WR-02 fixed, a kept edit reopened after another tab saved can no longer overwrite that save

Every edit record carries `baseFingerprint` (a 64-bit FNV-1a of the seed the edit began from). EditRoute opens a kept edit whose base differs from the version as it reads now with EDIT_CHANGED under Save, Save is refused before any write, and saveDraft refuses an edit write for a version no one has.

## Reproduction (planning, at 5ad63e63) and BASE
Two tabs over one real store: A types (edit draft kept), B resumes and saves a description, A types again (draft written back), a fresh tab C resumes it with no line under Save and Save lands on the version page with the description lost. Confirmed again in the built app at BASE (probe, below). BASE for this item: `d69f36f2` (after 261115-hto). Step 0 suite: 133 files, 4348 tests, all passing.

## RED then GREEN
- Task 1 RED (`EditRoute.staleEdit.test.jsx`, 3 tests): exactly 3 failed, on the planned lines and nothing earlier.
  - A: `expected null to be 'This version changed in another tab. ...'` at tab C's open-time line.
  - B: the same, at the old draft's open-time line.
  - C: `expected 'undefined' to be 'string'` on `typeof kept.baseFingerprint` (reopen and Save expectations before it passed).
  - GREEN: 3 passed, and the related 7 files (218 tests: staleEdit, EditFlow, stalePen, useKeptDraft, CreationFlow, RecipePage.edit, firstVersion) passed.
- Task 2 RED (`repository.test.js` + `firstVersion.test.js`): exactly 1 failed, `expected true to be false` (saveDraft of an edit for `v-no-version`). The five family-guard tests got `storeGuardVersions` and kept every expectation; the three fingerprint pins passed on write. GREEN: 115 tests across repository, firstVersion, staleEdit, EditFlow, stalePen passed.

## Probe (scratch builds `${TMPDIR}/sprinkles-htp/{base,after}-dist`, 1366x1024, two pages in one context)
WebKit and Chrome both launched. `check`: 18 PASS, 0 FAIL.
- Controls (base and after, both engines): a kept edit reopens with no line, Save writes over the version, the draft is gone. W0 after: the record carries a `baseFingerprint` string; base: `undefined`.
- Base reproduces WR-02 in both engines: C opens with no line, Save lands on the version page and the description reads the seed's original text, not "Saved by B.".
- Fixed build, both engines: C opens with EDIT_CHANGED, Save stays on the edit address with the line, the version's and recipe's description read "Saved by B.", the edit draft stays; Cancel lands on the version page, the draft is gone, "Saved by B." intact.
- W2 (draft with its base key removed): fixed build opens refused, Save writes nothing (title unchanged). Base build saves it over the version.

## Suite counts
Before 133 files / 4348 tests; after 134 files / 4355 tests, 0 failed (+1 file; +3 staleEdit, +1 repository, +3 fingerprint pins).

## Decisions
- **An edit kept before this change has no base and opens refused.** EDIT_CHANGED stands, Save writes nothing, typing keeps it without a base, Cancel ends it. Adopting the current version as its base would be the WR-02 overwrite. No saved content is lost; at most the ink of an edit begun before this build is stranded, and it can be read before Cancel. EDIT_CHANGED says "This version changed in another tab", which may read as untrue for an old draft whose version did not change; only existing wording is allowed, so it stays.
- **Strict inequality** (`keptEdit.baseFingerprint !== seedFingerprint`): an absent, non-string or forged base reads as changed. firstVersionRefusal's reason is read first.
- **The fingerprint covers the seed**, the part Save-over writes, so a change elsewhere in the stored records is never overwritten and need not refuse.
- **The saveDraft base check the review calls "ideally" is not done.** It would make the store import draftFromVersion and read recipes and styles inside the draft transaction, and it would refuse the write-back itself. With the open and Save guards, a written-back draft opens refused and can overwrite nothing.

## Scope gates
- `git diff 5ad63e63` over draft.js, creationSave.js, sheetCode.js, db.js, app/dist: clean. CREATE_DRAFT_KEYS and DB_VERSION untouched; no payload key added.
- CreationPage `^export const` count 7 before and after: no new on-screen sentence.
- `grep -rl 261115-htp app/src` = 3 (staleEdit, repository, firstVersion tests). baseFingerprint counts: EditRoute 4, CreationPage 3, useKeptDraft 3; one `export function fingerprint`.
- Changed files vs BASE are the plan's files_modified; app/dist and port 4173 untouched.

## Deviations from Plan
None of substance. Line numbers differed after 261115-hto as the orchestrator said (saveDraft already had `creating` and the `drafts` local); I extended that shape with an `editing` flag and a `noVersion` check. Expected counts were taken from the BASE run (133 / 4348) rather than the plan's 4340 baseline. The pre-commit protected-branch assertion did not apply: dispatched sequentially onto main.

## Known Stubs
None.

## Notes for the orchestrator
- The dist build is safe to deploy: no DB_VERSION, stored-shape or migration change. An edit draft kept before this build will open refused (see above); Mark's real data may hold one only if he left an edit open.
- Deferred Human Verification: none. No Mark's List row written.
- STATE.md, ROADMAP.md and BATCH.json not touched; this SUMMARY is uncommitted for the orchestrator.

## Self-Check: PASSED
Files exist (test file, probe, all modified sources); commits 80b3fd79, b5771919, c3b35c16, 375b5153, 8d8db44a are ancestors of HEAD.
