---
phase: 11-steps-structure-save-and-print
plan: 03
subsystem: store
tags: [indexeddb, idb, transactions, drafts, optimistic-concurrency, react]

requires:
  - phase: 10-the-creation-editor-without-save
    provides: the create draft (CREATE_DRAFT_KEYS, draftMatchesCreate) and createRecipe's three-field call
provides:
  - createRecipe's optional fields (description, method, authored, declaredAxes, declaredFlaws, targets, iceEd, serveTempC)
  - repository.createRecipeWithVersion, one transaction over recipes, versions and drafts
  - repository.saveFirstVersionOver, one transaction that resolves { saved, reason } and refuses inside its own read
  - repository.saveVersion(version, { expected }), the version pen's overwrite guarded by VersionChangedError
  - domain/firstVersion.js (firstVersionRefusal, isEditableFirstVersion, editStateFor, sameRecord, VersionChangedError)
  - the 'edit' draft kind, draftMatchesEdit and draftFamily, with family-guarded saveDraft and deleteDraft
  - editPath(recipeId, versionId)
affects: [11-05, 11-09, 11-10, 11-12]

actuals:
  tokens: 21000
  tasks: 3
  commits: 6

plan_head_before: d5afacf793af293604e552163276b00d568d0a2e
plan_head_after: 008daef92e507b52bce8046791154aba4eb52773

tech-stack:
  added: []
  patterns:
    - "a business refusal is a resolved value ({ saved: false, reason }) with done quieted before the hand abort; a caller bug is a thrown TypeError"
    - "an expected-record check (sameRecord) inside the write's own transaction, not a cross-tab event"
    - "a draft key shared by two families is guarded in the store (draftFamily), not by UI exclusivity"

key-files:
  created:
    - app/src/domain/firstVersion.js
    - app/src/domain/firstVersion.test.js
  modified:
    - app/src/domain/newRecipe.js
    - app/src/domain/newRecipe.test.js
    - app/src/domain/draft.js
    - app/src/domain/draft.test.js
    - app/src/store/repository.js
    - app/src/store/repository.test.js
    - app/src/store/creation-roundtrip.test.js
    - app/src/ui/notebookPaths.js
    - app/src/ui/notebookPaths.test.js
    - app/src/ui/useVersionPen.js
    - app/src/ui/RecipePage.perStep.test.jsx

key-decisions:
  - "saveVersion with expected throws VersionChangedError where saveFirstVersionOver resolves a refusal: every existing caller and page-test stub reads a resolve of saveVersion as saved"
  - "VersionChangedError lives in the pure domain/firstVersion.js, not repository.js, because the page tests mock the repository module whole"
  - "saveDraft and deleteDraft treat a stored record whose kind is not a draft kind as belonging to no family (written over), so the store's existing kind-less test fixtures stay green"
  - "an unknown-kind record written over a stored record of a known family is refused (fails closed)"
  - "firstVersionRefusal reads activeRows, so a struck unlinked row does not block Edit"

requirements-completed: [MAKE-10, STRUCT-04]

duration: 10min
completed: 2026-10-27
status: complete

coverage:
  - id: D1
    description: "createRecipe accepts the optional fields a creation saves; the three-field call returns what it did before"
    requirement: MAKE-10
    verification:
      - kind: unit
        ref: "app/src/domain/newRecipe.test.js#createRecipe — what a creation saves"
        status: pass
    human_judgment: false
  - id: D2
    description: "createRecipeWithVersion writes recipe, version and the draft removal in one transaction; a failed put, a Sheet code collision or an existing id leaves nothing and keeps the draft"
    requirement: MAKE-10
    verification:
      - kind: integration
        ref: "app/src/store/repository.test.js#createRecipeWithVersion, through the repository seam"
        status: pass
    human_judgment: false
  - id: D3
    description: "A created version with steps, a split row, a step 0 row, scales, problems, targets and iceEd passes validateStoreFile and the child, diff and pen-draft readers accept it"
    requirement: MAKE-10
    verification:
      - kind: unit
        ref: "app/src/store/creation-roundtrip.test.js#a recipe created with steps, scales, problems and targets"
        status: pass
    human_judgment: false
  - id: D4
    description: "saveFirstVersionOver writes over a first version keeping its id, Sheet code and createdAt, and resolves a refusal (has-batch, has-child, gone, not-first, unlinked-row, draft-held, changed) writing nothing, with no unhandled rejection"
    requirement: STRUCT-04
    verification:
      - kind: integration
        ref: "app/src/store/repository.test.js#saveFirstVersionOver, through the repository seam"
        status: pass
    human_judgment: false
  - id: D5
    description: "The version pen's Save over this version is refused inside the store when its copy is stale or the version gained a batch, and the page names it under the pen"
    requirement: STRUCT-04
    verification:
      - kind: integration
        ref: "app/src/store/repository.test.js#saveVersion with expected, through the repository seam"
        status: pass
      - kind: integration
        ref: "app/src/ui/RecipePage.perStep.test.jsx#Save over this version is guarded by the store"
        status: pass
    human_judgment: false
  - id: D6
    description: "The edit draft kind, draftMatchesEdit and draftFamily; the store lets neither draft family overwrite or delete the other's on a version's key; editStateFor and editPath"
    requirement: STRUCT-04
    verification:
      - kind: unit
        ref: "app/src/domain/draft.test.js#draftMatchesEdit"
        status: pass
      - kind: integration
        ref: "app/src/store/repository.test.js#a version's one draft key is guarded by family"
        status: pass
      - kind: unit
        ref: "app/src/domain/firstVersion.test.js#editStateFor"
        status: pass
      - kind: unit
        ref: "app/src/ui/notebookPaths.test.js#editPath"
        status: pass
    human_judgment: false
  - id: D7
    description: "The wording of VERSION_CHANGED_STATUS and VERSION_HAS_BATCH_STATUS is Claude's, for Mark to read"
    verification: []
    human_judgment: true
    rationale: "Maker-facing sentences no test can judge; the plan marks them as Claude's wording for Mark in chat"
---

# Phase 11 Plan 03: Store and domain contracts for Save and Save-over Summary

**One-transaction create and Save-over for first versions, an expected-record guard on the version pen's overwrite, a family-guarded draft key with a new 'edit' kind, and the one rule for who may edit.**

## Performance

- **Duration:** 10 min (2026-10-27T01:25:42Z to 01:35Z)
- **Tasks:** 3 of 3
- **Files:** 13 (2 created, 11 modified), 1366 insertions and 50 deletions
- **Tests:** baseline 3771 passing in 120 files; at the end 3854 passing in 121 files (+83 tests, +1 file)

## Accomplishments

- **Create (Task 1, tracer).** `createRecipe` takes description, method, authored, declaredAxes, declaredFlaws, targets, iceEd and serveTempC, type-checks each (targets and iceEd refuse `null` and arrays) and structuredClones it; description fills both `recipe.description` and `version.sheetDescription`. The three-field call returns exactly what it did. `repository.createRecipeWithVersion` is one readwrite transaction over recipes, versions and drafts: it refuses a stored version id (TypeError) and a Sheet code clash (SheetCodeError), and a put the store cannot clone aborts it by hand, leaving neither record and the create draft kept. A created version with two steps, a split row, a step 0 row, a declared scale and problem, targets, iceEd and serveTempC passes `validateStoreFile`, and `createChildVersion`, `buildDiff` and `penDraftFromVersion` read it.
- **Save over (Task 2).** `firstVersionRefusal` is the one pure rule ('gone', 'not-first', 'has-batch', 'has-child', 'unlinked-row', in that order, reading active rows). `saveFirstVersionOver` runs it inside its own transaction read, then refuses 'draft-held' (a pen's draft holds the key) and 'changed' (the stored version or recipe is not `expected`). A refusal quiets `done` before the hand abort, writes nothing, leaves every draft, and resolves `{ saved: false, reason }`; the tests assert no unhandled rejection. A different Sheet code or createdAt is a TypeError.
- **Pen guard (Task 2).** `saveVersion(version, { expected })` widens `putVersionChecked`'s transaction to versions and batches and throws `VersionChangedError` ('gone', 'has-batch', 'changed') writing nothing; without `expected` it is the transaction it always was. `useVersionPen` passes `{ expected: version }` and announces `VERSION_CHANGED_STATUS` or `VERSION_HAS_BATCH_STATUS` through `announce`, the pen kept open with what was typed. The editor-first interleaving is a repository test (save-over first, then the stale pen is refused and the stored version stays the editor's).
- **Draft family (Task 3).** `'edit'` joins `KINDS`; `draftMatchesEdit` and `draftMatchesCreate` share a private `fitsCreationRecord`; `draftMatchesVersion` refuses 'edit' by name; `CREATE_DRAFT_KEYS` is untouched. `draftFamily` maps plan/record/amend/pen to 'pen'. `saveDraft` and `deleteDraft(versionId, kind)` are each one transaction guarded by family, so another tab's pen write or its post-batch discard can neither overwrite nor delete a kept edit draft, and the reverse. `editStateFor` answers 'editing' for any kept edit draft (stale or not), 'editable', or null. `editPath` builds `/notebook/<recipeId>/<versionId>/edit` with each id encoded.

## Task Commits

| Task | Commit | Kind |
| ---- | ------ | ---- |
| 1 | b68bf3d2 | test (RED) |
| 1 | 64cebd41 | feat (GREEN) |
| 2 | d37fcdf8 | test (RED) |
| 2 | 16b781f9 | feat (GREEN) |
| 3 | 4eb94381 | test (RED) |
| 3 | 008daef9 | feat (GREEN) |

## Decisions Made

- `saveVersion` with `expected` throws where `saveFirstVersionOver` resolves, as the plan specifies: every existing caller and page-test stub reads a resolve of `saveVersion` as saved.
- `VersionChangedError` lives in `domain/firstVersion.js` so the page tests' whole-module repository mock does not remove the class the pen tests with `instanceof`.
- `saveDraft` and `deleteDraft` treat a stored record whose `kind` is not a draft kind as belonging to no family. The store's existing tests save kind-less fixtures (`{ versionId, pen, fields }`), and `draftFamily` throws on an unknown kind, so a private `familyOrNull` wraps it. A record with an unknown kind written over a stored record of a known family is refused (fails closed). See the deviation below.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Kind-less draft fixtures versus a throwing draftFamily**
- **Found during:** Task 3
- **Issue:** The plan has `draftFamily` throw on any other value and `saveDraft` compare `draftFamily(stored.kind)` with `draftFamily(record.kind)`. The existing repository drafts tests store records with no `kind`, which would throw inside the transaction and break five existing cases.
- **Fix:** a private `familyOrNull(kind)` in repository.js catches the throw; a stored record with no known family is written over as before; a record with no known family over a stored known family is refused. `draftFamily` itself throws as specified, and the plan's pen/edit/create cases are tested.
- **Files modified:** app/src/store/repository.js
- **Commit:** 008daef9

**2. [Plan wording] Imports for the perStep page cases sit at the end of the file**
- **Found during:** Task 2
- **Issue:** The plan appends one describe block and keeps every line above in place because plan 11-07 cites line numbers in RecipePage.perStep.test.jsx; the new block needs two imports.
- **Fix:** the two import statements sit directly above the appended block (imports are hoisted), so no existing line moved. The diff for that file is additions only.
- **Files modified:** app/src/ui/RecipePage.perStep.test.jsx
- **Commit:** d37fcdf8

**Total deviations:** 2 (one Rule 3, one placement note). **Impact:** none on the contract; the first keeps the existing store tests green.

## Issues Encountered

None blocking. Two tool-environment notes: the sandbox refused two compound shell commands, which were split into separate commands, and a stray one-line file was written to the scratch area outside the project (`/private/tmp/claude-501/-Users-mark/Documents/placeholder`) that a delete was denied for; it is outside the repository and harmless.

## Known Stubs

None.

## Threat Flags

None. The plan's register covers the new surface (T-11-07 to T-11-12, T-11-46 to T-11-48, T-11-63); T-11-64 is accepted in the plan.

## Verification

- Task verify commands: all three green.
- Acceptance greps: Task 1 (1, 6, 1, db.js only, 6), Task 2 (1, 1, 3, 8, 4, 2, 2, 1, 1, 3, 1, 2, 2, 3 and the saveVersion-call scan prints PASS), Task 3 (1, 1, 1, 2, 1, 1) all meet their thresholds.
- `DB_VERSION = 10;` and the store definitions in db.js are unchanged; `idb` is imported only by db.js.
- Full suite: 3854 passing (121 files). `npm --prefix app run build` succeeds.

## Notes for Mark (for chat)

- Save-over now also refuses when another tab has a Next version or a batch pen open on the version ('draft-held'), and when another tab changed the version or renamed the recipe since Edit opened ('changed'); plan 11-10 words both lines.
- The version pen's Save over this version now refuses when another tab saved over the version or recorded a batch on it after the page was opened. It says "This version changed in another tab. Cancel, then reload the page." or "This version has a batch now. Save as a new version instead." (Claude's wording) and keeps the pen as typed.
- The plan has no Mark's List step, so no row was written.

## Self-Check: PASSED

- Created files exist: app/src/domain/firstVersion.js, app/src/domain/firstVersion.test.js.
- Commits b68bf3d2, 64cebd41, d37fcdf8, 16b781f9, 4eb94381, 008daef9 are ancestors of HEAD.
