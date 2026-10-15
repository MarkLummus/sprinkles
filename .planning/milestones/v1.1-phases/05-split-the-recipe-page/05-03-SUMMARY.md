---
phase: 05-split-the-recipe-page
plan: 03
subsystem: ui
tags: [react, hook, domain-module, vitest, jsdom, refactor]

requires:
  - phase: 05-split-the-recipe-page
    provides: "penDraft.js with penDraftRow and restoreStepFromVersion (Plan 02); 05-walk.mjs and 05-walk-before.json (Plan 01)"
provides:
  - "app/src/ui/usePenDraft.js: usePenDraft() returning { penDraft, blockedMessage, blockedTarget, edit, open, close, restore, checkSave }"
  - "app/src/domain/penDraft.js: eleven pure pen ops (setPenField, setPenGrams, togglePenRowLines, togglePenLine, setPenStepField, setPenStepTarget, togglePenStepUses, togglePenStepRemoved, setPenNoteText, removePenNote) plus the builders penDraftFromVersion, penDraftVersion, penSaveBlock, penFieldsFromDraft"
  - "RecipePage.jsx carries no setPenDraft, setBlockedMessage or setBlockedTarget (D-12, the pen half)"
affects: [05-04 record helpers, 05-05 useRecordDraft, 05-06 after walk and the D-12 final grep]

requirements-completed: [EDIT-02]

plan_head_before: 2a1794ad5ee3496a6c0c5dc3845df83d5bde6b24
plan_head_after: eae7ee379212420bd56c303090729809a2d4159c

actuals:
  tokens: 10000    # chars/4 over the added lines of the five changed files (rough)
  tasks: 3
  commits: 3       # measured: git rev-list --count 2a1794a..HEAD, before this SUMMARY's own commit

tech-stack:
  added: []
  patterns:
    - "Hook owns the draft only (useState, no reducer); every change reaches one private clearBlock; the caller keeps locks, page status, announcer and repository calls"
    - "Pure ops are (draft, ...args) => draft, applied through a functional update by edit(op, ...args)"
    - "Hook test: jsdom docblock, Harness copies the hook return into a plain object, act() around every call, no @testing-library/react"

key-files:
  created:
    - app/src/ui/usePenDraft.js
    - app/src/ui/usePenDraft.test.jsx
  modified:
    - app/src/domain/penDraft.js
    - app/src/domain/penDraft.test.js
    - app/src/ui/RecipePage.jsx

key-decisions:
  - "D-09 for the pen: blockedAttemptRef moved into usePenDraft with blockedTarget. The attempt counter belongs to the block it accompanies, and checkSave is the only place that grows it"
  - "D-04's count of 16 reads as 11 edit handlers (handleChangePenField plus ten others) through edit(), and 5 lifecycle sites through the hook's other methods: open (handleStartDeveloping), close (Cancel and both saves, three sites) and restore (the kept-draft restore). All 16 pairs now reach the one private clearBlock"
  - "checkSave returns { blockedKind, fields }. A version-line block returns 'versionLine' and RecipePage announces VERSION_BLOCKED_STATUS; a row block returns 'row' and announces nothing, as before. The save lock and repository write stay in RecipePage (D-07)"
  - "penSaveBlock returns the target without an attempt; the hook stamps the attempt, so the pure function stays free of the counter"

coverage:
  - id: D1
    description: "Eleven pen edits are pure (draft, ...args) => draft ops in domain/penDraft.js; each returns a new draft, leaves its input deep-equal to a pre-call clone, and answers the same twice"
    requirement: EDIT-02
    verification:
      - kind: unit
        ref: "app/src/domain/penDraft.test.js (setPenField, setPenGrams, togglePenRowLines, togglePenLine, setPenStepField, setPenStepTarget, togglePenStepUses, togglePenStepRemoved, setPenNoteText, removePenNote)"
        status: pass
    human_judgment: false
  - id: D2
    description: "The blocked-save reset is written once: usePenDraft.js has one setBlockedMessage(null) and one setBlockedTarget(null), inside clearBlock; edit(), open(), close() and restore() all reach it; RecipePage.jsx has no pen setter"
    requirement: EDIT-02
    verification:
      - kind: unit
        ref: "app/src/ui/usePenDraft.test.jsx (edit, open, close, restore clear the block; return has exactly the eight keys; two edits in one batch both land)"
        status: pass
      - kind: other
        ref: "node comment-stripped grep: setBlockedMessage(null) and setBlockedTarget(null) once each in usePenDraft.js; no setPenDraft/setBlockedMessage/setBlockedTarget in RecipePage.jsx"
        status: pass
    human_judgment: false
  - id: D3
    description: "checkSave sets the block with an attempt that grows on every blocked press, or returns the fields createChildVersion and saveOverVersion take; the built fields and draft version come from penSaveBlock, penFieldsFromDraft and penDraftVersion"
    requirement: EDIT-02
    verification:
      - kind: unit
        ref: "app/src/domain/penDraft.test.js (penDraftFromVersion, penDraftVersion, penSaveBlock, penFieldsFromDraft); app/src/ui/usePenDraft.test.jsx (checkSave blocked twice gives attempt 1 then 2; clean draft returns fields)"
        status: pass
    human_judgment: false
  - id: D4
    description: "The maker sees no change: the built app's version pen, record pen, correction, tasting and kept drafts compare with the before baseline"
    requirement: EDIT-02
    verification:
      - kind: other
        ref: "node 05-walk.mjs compare 05-walk-before.json <after>: MATCH 94 snapshots, after each of the three task commits"
        status: pass
    human_judgment: false

duration: ~7min
completed: 2026-10-14
status: complete
---

# Phase 5 Plan 03: usePenDraft Summary

**The version pen's draft goes through one hook, `usePenDraft`: eleven edits are pure ops in `domain/penDraft.js` applied by `edit(op, ...args)`, and the blocked-save reset is written once instead of sixteen times in RecipePage.jsx**

## Performance

- **Duration:** about 7 min (clock read at start 10:49Z, end 10:56Z)
- **Tasks:** 3 (one tracer, two auto)
- **Files:** 2 created, 3 modified
- **Suite:** 81 files, 2586 tests, all passing (baseline was 80 files, 2551; this plan adds 1 file and 35 tests)

## Accomplishments

- `usePenDraft()` holds `penDraft`, `blockedMessage` and `blockedTarget` with `useState` and returns exactly `{ penDraft, blockedMessage, blockedTarget, edit, open, close, restore, checkSave }`. The only two null-resets live in the private `clearBlock`.
- All eleven pen edit handlers in RecipePage.jsx are one `versionPen.edit(<op>, ...)` call. `handleChangePenField` still clears the page status and the announcer first and is the only one that does (D-05). The ten others clear the block only, as before.
- Open, Cancel, both saves and the kept-draft restore are `versionPen.open`, `close` (three sites) and `restore`. RecipePage keeps `mode`, the page status, `announce`, `versionSaveAction`, `versionSaveLockRef`, `penOpenedAtRef`, `discardDraft`, the restore and persist effects, and the repository calls.
- `buildPenFields` is three lines: `versionPen.checkSave(version, scopedVersions)`, `announce(VERSION_BLOCKED_STATUS)` for a version-line block, `return fields`. The announce stays written in RecipePage.jsx, so the source-text describe in RecipePage.test.jsx still finds exactly `announce` called with it.
- The draft version, the pen's seed and the save's fields come from `penDraftVersion`, `penDraftFromVersion` and `penFieldsFromDraft`, which share one private `penDraftRows` (the row mapping RecipePage carried twice).
- RecipePage.jsx lost its pen setters, `blockedAttemptRef` and the imports they orphaned (`blockedSaveMessage`, `blockedSaveRowId`, `blockedSaveLineIndex`, `isLineRemoved`, `penDraftRow`, `toggleDraftRowLines`).

## Task Commits

1. **Task 1 (tracer): setPenField through usePenDraft.edit, from the Version name field to the built app** - `be19cf2` (feat)
2. **Task 2: open, close, restore and checkSave; the builders move to penDraft.js** - `f3c3753` (refactor)
3. **Task 3: the ten other pen edits as pure ops through edit(); the hook gives up its raw setters** - `eae7ee3` (refactor)

**Plan metadata:** committed after this file (docs: complete plan)

## Files Created/Modified

- `app/src/ui/usePenDraft.js` - the hook: state, `edit`, `open`, `close`, `restore`, `checkSave`, private `clearBlock` and `blockedAttemptRef`
- `app/src/ui/usePenDraft.test.jsx` - jsdom Harness wiring test (9 tests): edit clears the block and applies the op; two edits in one batch both land; open, close, restore; checkSave blocked (attempt 1, then 2) and clean; the return has exactly the eight keys
- `app/src/domain/penDraft.js` - eleven pen ops and four builders added, moved with their comments; now imports `./lineage.js` for the blocked-save and grams-parse functions
- `app/src/domain/penDraft.test.js` - node tests for every new function (purity, same input twice, the documented change, `__proto__` row id)
- `app/src/ui/RecipePage.jsx` - `versionPen = usePenDraft()`; every pen handler is a hook call plus the side effects the page owns

## Decisions Made

See key-decisions: the D-09 call for the pen, the reading of D-04's count of 16, the shape of `checkSave`'s return, and the attempt stamped by the hook rather than by `penSaveBlock`.

## Deviations from Plan

None - plan executed exactly as written.

Environment note (not a deviation): the fresh worktree had no `app/node_modules`; it was copied from the main checkout with `cp -Rc`. No package was installed; `app/package.json` and `app/package-lock.json` are unchanged (T-05-SC). The sandbox rejects compound commands in worktrees, so the walk ran as three separate commands (build, record, compare) with literal scratch paths under the session scratchpad, not the plan's single `&&` chain. Same three steps, same result: `MATCH 94 snapshots` after each task.

## Noticed, not changed

- The comment above `draftVersion` in RecipePage.jsx and the comment above `handleChangePenStepField`, `handleTogglePenLineRemoved` and the other nine pen handlers repeat what the moved ops' comments now say. The plan asked each handler to keep its comment block, so they stay.
- `app/src/ui/Method.jsx` line 581 and `app/src/domain/stepNumbers.js` line 3 still name RecipePage.jsx as the home of the pen helpers and handlers (carried over from Plan 02's notes). The handlers are still there, the helpers are not.

## Threat Notes

- T-05-04 (computed keys in pen ops): every op builds its result with object literals and spreads, which create own properties and never invoke the `__proto__` setter. Draft rows are read through `penDraftRow`. `penDraftFromVersion` is tested with a row id of `__proto__`.
- T-05-05 (kept-draft restore): the restore effect still runs `draftMatchesVersion` before `versionPen.restore(record.payload)`; the order is unchanged. The walk's kept-draft scenarios compare MATCH.
- T-05-SC: no package installed.

## Issues Encountered

None.

## Known Stubs

None.

## Threat Flags

None.

## Next Phase Readiness

Ready for Plan 04. The pen half of D-12 is met: RecipePage.jsx has no `setPenDraft`, `setBlockedMessage` or `setBlockedTarget`. The record half (`setDraft`, `setBlockedDateMessage`) is for Plans 04 and 05. `parseGramsDraft` is still imported in RecipePage.jsx because `buildChurnFieldsFromDraft` uses it until Plan 04 moves it.

## Self-Check: PASSED

- FOUND: app/src/ui/usePenDraft.js, app/src/ui/usePenDraft.test.jsx, app/src/domain/penDraft.js, app/src/domain/penDraft.test.js
- FOUND: be19cf2, f3c3753, eae7ee3 (all ancestors of HEAD)
- Acceptance: `head -1 usePenDraft.test.jsx` is the jsdom docblock; no `useReducer` in usePenDraft.js; `git diff HEAD -- app/package.json app/package-lock.json` empty; `announce(VERSION_BLOCKED_STATUS)` once and `versionPen.checkSave(version, scopedVersions)` once in RecipePage.jsx; `versionPen.close()` 3, `versionPen.restore(record.payload)` 1, `versionPen.edit(` 11; `blockedAttemptRef` 0 in RecipePage.jsx and 3 in usePenDraft.js; one `setBlockedMessage(null)` and one `setBlockedTarget(null)` in usePenDraft.js; no pen setter in RecipePage.jsx; unused-import check exits 0
- `npm --prefix app test`: 81 files, 2586 tests passed; walk compare: MATCH 94 snapshots
