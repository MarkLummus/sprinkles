---
phase: 09-the-library-and-the-stored-shapes-plus-the-two-places
plan: 04
subsystem: domain
tags: [drafts, create-draft, useKeptDraft, scale-definition, catalog, vitest]

requires:
  - phase: 08-recipe-page-shell
    provides: useKeptDraft and useDraftWriter, the one restore path and the drafts store
provides:
  - "domain/catalog.js: the scale definition contract (SCALE_KINDS, SCALE_GROUPS, MAX_RECIPE_SCALES, MAX_RECIPE_PROBLEMS, CORE_SCALE_COUNT, isScaleDefinition, scaleDefinition, mintScaleKey)"
  - "domain/draft.js: the create kind (draftMatchesCreate, blankCreateDraft, isCreateDraftDirty, CREATE_DRAFT_KEYS, thirteen names)"
  - "useKeptDraft: creating, createDraft and onRestoreCreate inputs on the one restore path, with an edit-generation late-read check"
affects: [09-08, 09-09, 09-10, 09-11, 09-12, 09-13, 09-14, phase-10, phase-11]

actuals:
  tokens: 14300
  tasks: 2
  commits: 3
plan_head_before: b4691b335a2cde3abccf5872603194d8968ec678
plan_head_after: 11566c1de0b3f13a4b1295737d98c4b072a6d725

tech-stack:
  added: []
  patterns:
    - "A create draft is the whole first version as typed; draft acceptance (half-made fits) is a separate, looser check than saved-record validity (Save's job in Phase 11)"
    - "The method array is the creation's issued-key ledger: a removed step stays with removed: true, so nextStepKey never reissues a key across a closed tab"
    - "Late read on the creating path compares createDraftRef against the payload held when the read began; a changed payload wins and marks the stored record present"

key-files:
  created:
    - app/src/domain/catalog.js
    - app/src/domain/catalog.test.js
  modified:
    - app/src/domain/draft.js
    - app/src/domain/draft.test.js
    - app/src/ui/useKeptDraft.js
    - app/src/ui/useKeptDraft.test.jsx
    - app/src/ui/RecipePage.shell.test.js
    - app/src/ui/RecipeList.test.jsx

key-decisions:
  - "The create payload is thirteen names: recipeId, versionId, name required; description, versionLabel, beforeYouStart, rows, method, scales, problems, style, targets, serveTempC optional. No machine key and no process key (Mark, 2026-10-18)."
  - "draftMatchesVersion refuses kind create by name, so the recipe page's restore and Home's draft filter never act on a create record, even when its versionId equals a stored version's id."
  - "Creating reuses the hook's one read, restore-side delete and persist-side delete, so the shell test's buildDraftRecord( count is 3 and deleteDraft stays 3, getDraft stays 1."

requirements-completed: [LIB-06, TASTE-03]

duration: 7min
completed: 2026-10-19
status: complete
---

# Phase 9 Plan 04: The create draft kind and the scale definition contract Summary

**A create draft (the whole first version as typed, half-made included) is kept and restored through the existing useKeptDraft hook with no stored version, and the scale definition contract { key, name, low, high, kind, group } is fixed in domain/catalog.js.**

## Performance

- **Duration:** about 7 min
- **Completed:** 2026-10-19T00:29:00Z
- **Tasks:** 2 (Task 1 tracer, Task 2 tdd)
- **Files modified:** 8 (2 created, 6 modified)

## Accomplishments

- `catalog.js` fixes SCALE_KINDS (goldilocks, magnitude), SCALE_GROUPS (core, declared), at most two recipe scales and two recipe problems, CORE_SCALE_COUNT 4, `isScaleDefinition`, `scaleDefinition` and `mintScaleKey` ('scale-' + id, never a seeded key or an unsafe name).
- `draft.js` gains the create kind: `draftMatchesCreate` (needs no version, no batches; a name alone fits; a half-made draft fits), `blankCreateDraft` (Version name 'Version 1'), `isCreateDraftDirty`, and `CREATE_DRAFT_KEYS`, pinned equal to blankCreateDraft's keys and a literal list of the thirteen names.
- `useKeptDraft` keeps a create draft through its one restore path: reads once under StrictMode with version null and batches not loaded, restores through `onRestoreCreate`, writes kind create 250 ms after the last change, flushes on unmount, deletes the stored record when the draft is blank again, and writes no version, recipe or batch.
- The late read is guarded: a payload the editor replaced while `getDraft` was out wins over the stored one, the stored record is marked present, so the typed draft is written over it, or deleted when the maker cleared it back to blank.
- The method is the creation's issued-key ledger: a step may carry `removed: true`, and a restored method holding n 1, 2, 3 with 3 removed gives `nextStepKey` 4.
- A store holding a create draft changes neither Home nor the recipe page (regression test in RecipeList.test.jsx; draftMatchesVersion refuses the kind).

## Task Commits

1. **Task 1 (tracer): a name-only create draft is restored and kept through the hook, with no version** - `56885c34` (feat)
2. **Task 2: the definition contract's helpers, and a create draft leaves the existing pages alone** (tdd)
   - RED `245b04ca` (test): catalog.test.js and the HomeBody regression
   - GREEN `11566c1d` (feat): `scaleDefinition` and `mintScaleKey`

The tracer's `<verify>` was re-run end to end after its commit and passed (automated-only verify, `human_verify_mode` end-of-phase), so expansion continued.

## Files Created/Modified

- `app/src/domain/catalog.js` - the scale definition contract and its helpers
- `app/src/domain/catalog.test.js` - constants, scaleDefinition, isScaleDefinition, mintScaleKey
- `app/src/domain/draft.js` - the create kind: field table, fit check, starting payload, dirty check
- `app/src/domain/draft.test.js` - draftMatchesCreate, blankCreateDraft, isCreateDraftDirty and the CREATE_DRAFT_KEYS pin
- `app/src/ui/useKeptDraft.js` - creating, createDraft, onRestoreCreate; createDraftRef late-read check
- `app/src/ui/useKeptDraft.test.jsx` - StrictMode create harness: restore, half-made, debounce, unmount flush, blank delete, late read (restore / typed / typed-then-cleared), issued-key ledger
- `app/src/ui/RecipePage.shell.test.js` - the useKeptDraft job's markers for the creating branch
- `app/src/ui/RecipeList.test.jsx` - a create draft changes nothing Home shows

## The cost of a later payload change (stated as the plan requires)

`draftMatchesCreate` refuses a payload key outside CREATE_DRAFT_KEYS and a value that fails its field's check, and the hook's restore deletes a draft that does not fit. A new optional key leaves every kept create draft fitting (an absent optional field reads as its blank value). A renamed, removed or newly required key, or a narrowed field check, makes every create draft kept before the change fail at its next restore, and the restore deletes it. What is lost is at most the half-made creations kept on that device, never a saved recipe, version or batch. draft.test.js pins the key list three ways (the field table, blankCreateDraft, a literal list), so a payload change is Mark's decision.

Round 3 consequence: a create draft cannot carry a machine, a pasteurise temperature or a hold time (a payload holding any is refused as an unknown key). The version's equipment slot with maxFillG (plan 09-05), its process field and the machines table (plan 09-09) are unchanged, and a root version is created without equipment or process, as createRecipe builds it today. A later phase that wants either in creation adds an optional key, which keeps every kept create draft fitting. serveTempC (D-19) is in the payload as typed text, '' when empty.

## Decisions Made

- `Number.isSafeInteger` and `> 0` for a portion's step and a method step's n (the plan says positive integer; safe integers keep nextStepKey from throwing on a restored draft).
- `fitsCreateStep` reuses the plan draft's own `fitsMethodStep`, then adds the n and removed checks, as the plan specifies.
- The unsafe-key test isolates `carriesUnsafeKey` by putting `__proto__` inside a method step's targets, where every field check would otherwise pass.

## Deviations from Plan

None - plan executed exactly as written.

Notes that are not deviations:
- Task 1 is `type="tracer"` rather than `tdd="true"`, but its tests were written first and run red (blankCreateDraft is not a function) before the implementation, then committed with it in one commit as the plan's task structure has one commit per task.
- Task 2's draft.test.js pieces (the same-id case and the CREATE_DRAFT_KEYS block) were written in Task 1's commit because Task 1's tests needed the same helpers. The HomeBody regression passes at once, as it should: it pins behavior draftMatchesVersion's explicit create refusal already gives.
- Manual check of the acceptance criterion: adding a fourteenth key to blankCreateDraft alone failed five draft.test.js cases including the CREATE_DRAFT_KEYS block; the extra key was then removed.
- A mutation check on the hook (setting draftStoredRef false in the late-read branch) failed the typed-then-cleared create case and the edit path's clear case; reverted.

## Issues Encountered

- The worktree had no `node_modules`; `npm --prefix app ci` (lockfile install, no new package) restored them. No tracked file changed.

## Verification

- `npm --prefix app test -- src/domain/draft.test.js src/ui/useKeptDraft.test.jsx src/ui/RecipePage.shell.test.js`: 151 passed.
- Full suite `npm --prefix app test`: 97 files, 3052 tests passed (baseline on the base commit was 3009).
- Acceptance greps: `const KINDS = ['plan', 'record', 'amend', 'create']` found; `onRestoreCreate` found in the hook's input and call; catalog.js has 0 store or react imports; `['buildDraftRecord(', 3]` found in the shell test; `createDraftRef.current !== createDraftAtRead` found; `serveTempC` appears 4 times in draft.js; `export function mintScaleKey` and `export function scaleDefinition` each found once; `describe('CREATE_DRAFT_KEYS'` found.

## Known Stubs

None.

## Threat Flags

None. The mitigations in the plan's threat model are in place and tested: T-09-08 (unsafe keys in the record, a scale key and a library id, and a reserved row id), T-09-09 (the hook test asserts no version, recipe or batch write) and T-09-45 (the late-read cases).

## Notes for the orchestrator

- The plan's Round 6 deferred row about the edit path's "typed, then cleared" gap is already closed by quick task 261018-rn9 (commit 710a528) in the base: the existing test "deletes the stored draft once when that pen is cleared back to clean" passes on this branch and fails when the late-read branch stops marking the record present. No bug row needed on that account.
- 09-CONTEXT.md's carry-forward line naming "style and machine" in the create kind is superseded by Mark's 2026-10-18 decisions; this plan's code and comments state the current payload.

## Next Phase Readiness

- Phase 10 mounts useKeptDraft with `creating` true, starts from `blankCreateDraft`, holds `createDraft` as state (a new object per change), mints scale keys with `mintScaleKey(freshId())`, and fills `serveTempC` from the picked style's default.
- Phase 11 fills method and portions, runs the saved-record checks at Save (isScaleDefinition, unique problems, parsed grams, resolved references), and keeps a removed step's key in the method (or adds a watermark as an optional key).
- Plans 09-08 to 09-14 can import the definition contract from catalog.js; plan 09-11 adds `coreScaleDefinitions` and `problemNames` to it.

## Self-Check: PASSED

- FOUND: app/src/domain/catalog.js, app/src/domain/catalog.test.js
- FOUND commits: 56885c34, 245b04ca, 11566c1d (all ancestors of HEAD)
- Full suite green: 3052 tests
