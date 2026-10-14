---
phase: 05-split-the-recipe-page
plan: 05
subsystem: ui
tags: [react, hook, domain-module, vitest, refactor, record-pen]

requires:
  - phase: 05-split-the-recipe-page
    provides: "usePenDraft.js and its test as the hook pattern (Plan 03); recordDraft.js with the record helpers (Plan 04); 05-walk.mjs and 05-walk-before.json (Plan 01)"
provides:
  - "app/src/ui/useRecordDraft.js: useRecordDraft() with the nine record state values and edit, clearFieldError, retireUndo, addTasting, removeTasting, undoRemoveTasting, openNew, openAmend, cancel, close, restore, checkSave, buildFields"
  - "app/src/domain/recordDraft.js: setRecordField, setRecordMark, toggleDefect, toggleDeclaredDefect, setStepChange, setAsMadePortion, openTastingSection, amendDraftFromBatch, recordFieldsFromDraft (pure)"
  - "RecipePage.jsx holds no record draft setter; the churn-date block resets in one place"
affects: [05-06 after walk and the D-12 final check]

requirements-completed: [EDIT-03]

plan_head_before: d66a3edd88b1c85fa391e230d829d96ee0bf753c
plan_head_after: 6d7fb5cee9223b496c0c5bb420ebfc48bb9fc802

actuals:
  tokens: 10500    # chars/4 over the inserted lines of the changed files (rough)
  tasks: 3
  commits: 3       # measured: git rev-list --count d66a3ed..HEAD, before this SUMMARY's own commit

tech-stack:
  added: []
  patterns:
    - "Record pen hook beside usePenDraft: useState only, one private clearDateBlock, edit(op, ...args) through a functional update, no raw setters exported"
    - "Pure (draft, ...args) => draft ops in a framework-free domain module, each tested for no mutation and for answering the same twice"

key-files:
  created:
    - app/src/ui/useRecordDraft.js
    - app/src/ui/useRecordDraft.test.jsx
  modified:
    - app/src/domain/recordDraft.js
    - app/src/domain/recordDraft.test.js
    - app/src/ui/RecipePage.jsx

key-decisions:
  - "D-09 call: the attempt counters that ride with a block moved into the hook with it: invalidFieldTarget with invalidFieldAttemptRef, blockedDateAttempt with dateBlockedAttemptRef. They are set in the same step as the block and reset with it, so they cannot disagree with it. addTastingAttempt, removeTastingAttempt, restoreAttempt and focusBatchAttempt (each with its ref) stay in RecipePage because they are focus landings for the page's own actions, read by BatchRow. formStatus, tastingStatus, recordStatus and announce stay too (the shell owns status)."
  - "D-06's count of 16 read as 11 edit handlers (through edit()) + 3 lifecycle sites (handleStartRecording, handleStartAmending, handleCancelRecording, through resetBlocks) + 2 clears inside the save gate (the measurement branch and the clean branch of checkSave). All 16 reach clearDateBlock; useRecordDraft.js has exactly one setBlockedDateMessage(null)."
  - "The restore effect's two record branches (kind 'record' and kind 'amend') became one else branch calling recordPen.restore(record), because the hook now tells them apart; the plan-kind branch and the order of draftMatchesVersion, the amend redirect and the restore are unchanged."
  - "The tasting-body pendingUndo retirement stays in RecipePage's handlers (isTastingBodyField(field) then recordPen.retireUndo()), as the plan specifies; node coverage of it is the pure isTastingBodyField tests from Plan 04 plus the hook test that edit() leaves pendingUndo alone and retireUndo() clears it."

coverage:
  - id: D1
    description: "Each change the record pen makes to its draft (field, axis mark, defect, declared problem, step change, as-made portion, opening the tasting, the amend draft, the built fields) is a pure op in domain/recordDraft.js, tested under node: no mutation, same input twice"
    requirement: EDIT-03
    verification:
      - kind: unit
        ref: "app/src/domain/recordDraft.test.js (setRecordField, setRecordMark, toggleDefect and toggleDeclaredDefect, setStepChange, setAsMadePortion, openTastingSection, amendDraftFromBatch, recordFieldsFromDraft)"
        status: pass
    human_judgment: false
  - id: D2
    description: "The churn-date block resets in one place (clearDateBlock) and all 16 sites reach it; per-handler differences kept (own-field error clear, form status, pendingUndo only on tasting-body fields, tasting add/remove/restore leave the block)"
    requirement: EDIT-03
    verification:
      - kind: unit
        ref: "app/src/ui/useRecordDraft.test.jsx (edit clears the block, clearFieldError, two edits in one batch, checkSave outcomes and attempts, tasting leaves the block, cancel resets)"
        status: pass
      - kind: other
        ref: "node check: useRecordDraft.js has exactly one setBlockedDateMessage(null) once comments are stripped"
        status: pass
      - kind: other
        ref: "node 05-walk.mjs compare 05-walk-before.json <after>: MATCH 94 snapshots after each of the three task commits (blocked measurement, blocked date, tasting remove and restore, correct and kept-draft scenarios included)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Opening, correcting, Cancel, closing after a save, restoring a kept draft, the save gate and the built fields are hook methods; RecipePage keeps mode, status, announce, the three status regions, the four focus counters, batchSaveAction, batchSaveLockRef, discardDraft, the restore and persist effects, the repository calls and navigation"
    requirement: EDIT-03
    verification:
      - kind: unit
        ref: "app/src/ui/useRecordDraft.test.jsx (openAmend baseline is a clone, openNew keeps opener, cancel, close, restore, return keys have no raw setter); app/src/ui/RecipePage.test.jsx and RecipePage.drafts.test.jsx (source-text describes unchanged)"
        status: pass
      - kind: other
        ref: "node check: comment-stripped RecipePage.jsx has none of setDraft, setBlockedDateMessage, setFieldErrors, setInvalidFieldTarget, setBlockedDateAttempt, setPendingUndo, setAmendingBatchId, setAmendBaseline, setAmendOpener"
        status: pass
    human_judgment: false

duration: ~35min
completed: 2026-10-14
status: complete
---

# Phase 5 Plan 05: useRecordDraft Summary

**Recording, correcting and tasting a batch now go through one hook, `useRecordDraft`, over pure record ops in `domain/recordDraft.js`; the churn-date block's reset is written once, and RecipePage.jsx holds no record draft setter**

## Performance

- **Duration:** about 35 min (start time was not captured at spawn; estimated from the clock, end 11:32Z)
- **Tasks:** 3 (one tracer, two auto)
- **Files:** 2 created, 3 modified
- **Suite:** 83 files, 2648 tests, all passing (baseline was 82 files, 2612; this plan adds 1 file and 36 tests)
- **RecipePage.jsx:** 1959 lines at the plan base, 1836 now

## Accomplishments

- `recordDraft.js` gained nine pure exports, each moved with its comment from the handler that used to hold the state update: `setRecordField`, `setRecordMark`, `toggleDefect`, `toggleDeclaredDefect`, `setStepChange`, `setAsMadePortion`, `openTastingSection`, `amendDraftFromBatch`, `recordFieldsFromDraft`. The only new import is `./axes.js` (for `setMark`).
- `useRecordDraft.js` (250 lines, `useState` and `useRef` only) holds the nine state values, the two save-gate attempt counters, the private `clearDateBlock` and `resetBlocks`, and thirteen methods. It returns no raw setter. `checkSave()` returns `{ outcome: 'measurement' | 'churnDate' | 'ok', parsed }`; `buildFields(parsed)` returns `{ churnFields, tasting }`; `removeTasting()` returns whether there was ink.
- RecipePage.jsx's eleven record edit handlers are one `recordPen.edit(op, ...args)` plus their own extra clears, exactly as the plan's Facts list them. Counts match the plan: 11 `recordPen.edit(`, 9 `recordPen.retireUndo()`, 5 of them conditional on `isTastingBodyField(field)`, and 1 `const hasInk = recordPen.removeTasting()`.
- `handleStartRecording`, `handleStartAmending`, `handleCancelRecording`, the two success branches of `handleSaveBatch` and the restore effect call `openNew`, `openAmend`, `cancel`, `close` and `restore`. `handleStartAmending` keeps its name and its `(batch, { opener = 'correct' } = {})` signature; both `onPageStatus(batchSavedStatus(record))` calls and every `announce(BATCH_SAVE_ERROR)` are written as before.
- `useRecordDraft.test.jsx` (15 tests, jsdom docblock on line 1, Harness pattern) proves the wiring: one churn-date reset path, own-field error clear, two edits in one batch, checkSave outcomes with growing attempts, tasting add/remove/restore leaving the block alone, edit() leaving `pendingUndo` and `retireUndo()` clearing it, openAmend's baseline being a clone, openNew keeping the opener, cancel's resets, close and restore leaving the blocks, and the exact return keys.
- The built app compares `MATCH 94 snapshots` against `05-walk-before.json` after each of the three task commits.

## Task Commits

1. **Task 1 (tracer): one record edit end to end, setRecordField through useRecordDraft.edit** - `65dcde4` (refactor)
2. **Task 2: the other record edits as pure ops through edit(); tasting add, remove and restore through the hook** - `f566fa0` (refactor)
3. **Task 3: opening, Cancel, closing, restoring and the save gate go through the hook** - `6d7fb5c` (refactor)

**Plan metadata:** committed after this file (docs: complete plan)

The tracer gate: the tracer's `<verify>` is automated-only, so it was re-run end to end after the commit's code was in place (focused tests, full suite, build, walk compare); it passed before Task 2 started.

## Files Created/Modified

- `app/src/ui/useRecordDraft.js` - the record pen's draft hook
- `app/src/ui/useRecordDraft.test.jsx` - jsdom wiring test
- `app/src/domain/recordDraft.js` - nine new pure exports
- `app/src/domain/recordDraft.test.js` - node tests for each, plus no-mutation and same-twice checks
- `app/src/ui/RecipePage.jsx` - record state and update code removed; handlers reduced to hook calls plus the side effects the page owns; imports trimmed (`setMark`, `blankRecordDraft`, `draftFromBatch`, `buildChurnFieldsFromDraft`, `buildTastingFieldsFromDraft`, `tastingHasInk`, `validateRecordDraft`, `removeTastingSection`, `restoreDraftFromUndo`, `tastingPayloadFromDraft` dropped as orphans)

## Decisions Made

See key-decisions. Two points the plan asked to be recorded:

- **The D-09 call** (which counters moved and which stayed, and why) is the first key-decision above.
- **The reading of D-06's count of 16** is the second.
- **T-05-08, `setAsMadePortion`'s verbatim bracket write.** The read is `Object.prototype.hasOwnProperty.call(asMade, rowId)`; the write is `asMade[rowId] = next` and `delete asMade[rowId]` on a fresh `{ ...draft.asMade }` copy, so a prototype-named row id could only change that copy's own prototype, never `Object.prototype`. Row ids are those the version stores, and a stored draft carrying such a key is refused by `draftMatchesVersion`. Moved verbatim, behaviour unchanged, no new exposure.

## Deviations from Plan

None - plan executed exactly as written.

Notes that are not deviations:

- The plan's last hook-test bullet says "the nine values and the fourteen methods". The interfaces block and the artifacts list name thirteen methods (edit, clearFieldError, retireUndo, addTasting, removeTasting, undoRemoveTasting, openNew, openAmend, cancel, close, restore, checkSave, buildFields). The test pins those thirteen; nothing is missing.
- The restore effect's two branches merged into one (see key-decisions); same behaviour.
- Environment: the fresh worktree had no `app/node_modules`; it was copied from the main checkout with `cp -Rc`. No package was installed; `app/package.json` and `app/package-lock.json` are unchanged (T-05-SC). The sandbox rejects compound commands in a worktree, so the walk ran as three separate commands (build, record, compare) with literal scratch paths under the session scratchpad, and the plan's single `&&` chain was not used. The same checks, the same results.

## Noticed, not changed

- Comments in RecipePage.jsx that say "above" about moved code are stale in position only: the one above `handleStartAmending` ("draftFromBatch above"), the one above `handleChangeRecordField` ("the 888-892 pattern"), and the one above `handleRemoveTasting` ("tastingPayloadFromDraft, Task 2's restore reads it"). Carried over from Plans 02 to 04.
- `app/src/domain/draft.js` line 18 still names RecipePage.jsx as the home of `blankRecordDraft` (Plan 04's note; draft.js is untouched under D-01).

## Threat Notes

- T-05-08 (`setAsMadePortion` row-id keys): accepted, moved verbatim; see Decisions Made.
- T-05-09 (kept draft restore): the restore effect still runs `draftMatchesVersion` before `recordPen.restore(record)` and still reroutes an amend draft to its own batch's address first; the order is unchanged. The walk's kept-draft scenarios compare MATCH.
- T-05-10 (prose in the record pen): the hook and ops render nothing; no `dangerouslySetInnerHTML` added.
- T-05-SC: no package installed; `app/package.json` and `app/package-lock.json` unchanged.

## Issues Encountered

None.

## Known Stubs

None.

## Threat Flags

None.

## Next Phase Readiness

Ready for Plan 06 (the after walk and the D-12 final check). The record half of D-12 holds now (`setDraft`, `setBlockedDateMessage` and the seven other record setters are gone from RecipePage.jsx); the pen half held after Plan 03. The 05-01 note that the tasting-body edit retiring `pendingUndo` cannot be reached by clicking is covered in node: `isTastingBodyField` in `recordDraft.test.js` (Plan 04) and, here, the hook tests that `edit()` leaves `pendingUndo` alone and `retireUndo()` clears it.

## Self-Check: PASSED

- FOUND: app/src/ui/useRecordDraft.js, app/src/ui/useRecordDraft.test.jsx, app/src/domain/recordDraft.js, app/src/domain/recordDraft.test.js
- FOUND: 65dcde4, f566fa0, 6d7fb5c (all ancestors of HEAD)
- Acceptance: `head -1 useRecordDraft.test.jsx` is `// @vitest-environment jsdom`; `recordPen.edit(setRecordField, field, value)` once and `recordPen.clearFieldError(field)` once; `recordPen.edit(` 11, `recordPen.retireUndo()` 9, conditional retire 5, `const hasInk = recordPen.removeTasting()` 1; comment-stripped RecipePage.jsx has none of the nine record setters; comment-stripped useRecordDraft.js has exactly one `setBlockedDateMessage(null)`; `onPageStatus(batchSavedStatus(record))` 2; `handleStartAmending(batch, { opener: 'record-a-tasting' })` 1; `invalidFieldAttemptRef|dateBlockedAttemptRef` in RecipePage.jsx 0; unused-import check exits 0; `app/package.json` and `app/package-lock.json` unchanged
- `npm --prefix app test`: 83 files, 2648 tests passed; walk compare: MATCH 94 snapshots
