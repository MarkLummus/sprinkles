---
phase: 05-split-the-recipe-page
plan: 04
subsystem: ui
tags: [react, domain-module, vitest, refactor, record-pen]

requires:
  - phase: 05-split-the-recipe-page
    provides: "penDraft.js with usesListsDiffer (Plan 02); 05-walk.mjs and 05-walk-before.json (Plan 01)"
provides:
  - "app/src/domain/recordDraft.js: CHURN_DATE_BLOCKED_MESSAGE, isTastingBodyField, isDraftDirty, blankRecordDraft, draftFromBatch, tastingHasInk, tastingPayloadFromDraft, restoreDraftFromUndo, removeTastingSection, parseAllMeasuredFields, validateRecordDraft, buildChurnFieldsFromDraft, buildTastingFieldsFromDraft, batchSavedStatus (pure, framework-free)"
  - "RecipePage.jsx exports only RecipeNotFound, RecipePage and its eleven page strings"
affects: [05-05 useRecordDraft (builds on recordDraft.js), 05-06 after walk]

requirements-completed: [EDIT-01]

plan_head_before: b328e15ab9500d2d9f29086230c5bd6bf6f4434e
plan_head_after: c3e5a8907863575cd6d7df95636e6c67e97e50f4

actuals:
  tokens: 9000     # chars/4 over the added lines of the changed files (rough)
  tasks: 3
  commits: 3       # measured: git rev-list --count b328e15..HEAD, before this SUMMARY's own commit

tech-stack:
  added: []
  patterns:
    - "Domain module with the leading 'Pure. No framework, no DOM, no store import.' comment, relative .js imports only, named exports"
    - "A private helper (blankTastingFields) stays private; the page reaches it through an exported op (removeTastingSection)"

key-files:
  created:
    - app/src/domain/recordDraft.js
    - app/src/domain/recordDraft.test.js
  modified:
    - app/src/ui/RecipePage.jsx
    - app/src/ui/RecipePage.test.jsx
    - app/src/ui/RecipePage.drafts.test.jsx
    - app/src/ui/BatchRow.test.jsx

key-decisions:
  - "CHURN_DATE_BLOCKED_MESSAGE moved with validateRecordDraft, its only user, and is not re-exported from RecipePage.jsx (D-02); the eleven strings only the page's save, cancel and announce flow reads stay exported from it"
  - "removeTastingSection(draft) is handleRemoveTasting's state update as an exported op, so blankTastingFields stays private to recordDraft.js"
  - "The three tasks append the moved code to recordDraft.js in the order it was moved (save gate, then shape/dirtiness/tasting payload, then save assembly), not in RecipePage.jsx's old order; each function and comment is verbatim"

coverage:
  - id: D1
    description: "The record pen's save gate (CHURN_DATE_BLOCKED_MESSAGE, parseAllMeasuredFields, validateRecordDraft) lives in domain, tested under node: measurements first, then the date; no mutation; same input twice"
    requirement: EDIT-01
    verification:
      - kind: unit
        ref: "app/src/domain/recordDraft.test.js#validateRecordDraft"
        status: pass
      - kind: other
        ref: "node 05-walk.mjs compare 05-walk-before.json <after>: MATCH 94 snapshots (blocked-measurement and blocked-date scenarios included)"
        status: pass
    human_judgment: false
  - id: D2
    description: "The record draft's shape, dirtiness and tasting payload (isTastingBodyField, isDraftDirty, blankRecordDraft, draftFromBatch, tastingHasInk, tastingPayloadFromDraft, restoreDraftFromUndo, removeTastingSection) live in domain; no mutation, same input twice, fresh blank drafts, no module-level let or var"
    requirement: EDIT-01
    verification:
      - kind: unit
        ref: "app/src/domain/recordDraft.test.js (isDraftDirty, draftFromBatch, tastingHasInk and tastingPayloadFromDraft, restoreDraftFromUndo, removeTastingSection, shared state)"
        status: pass
      - kind: other
        ref: "node 05-walk.mjs compare 05-walk-before.json <after>: MATCH 94 snapshots"
        status: pass
    human_judgment: false
  - id: D3
    description: "The save assembly and the saved-status sentence (buildChurnFieldsFromDraft, buildTastingFieldsFromDraft, batchSavedStatus) live in domain; RecipePage.jsx exports only RecipeNotFound, RecipePage and the eleven page strings; RecipePage.test.jsx, RecipePage.drafts.test.jsx and BatchRow.test.jsx change imports only (it( counts equal to 4f1f98f: 108, 38, 206)"
    requirement: EDIT-01
    verification:
      - kind: unit
        ref: "app/src/domain/recordDraft.test.js (buildChurnFieldsFromDraft and buildTastingFieldsFromDraft, batchSavedStatus); app/src/ui/RecipePage.test.jsx; app/src/ui/BatchRow.test.jsx"
        status: pass
      - kind: other
        ref: "node 05-walk.mjs compare 05-walk-before.json <after>: MATCH 94 snapshots, after each of the three task commits"
        status: pass
    human_judgment: false

duration: ~20min
completed: 2026-10-14
status: complete
---

# Phase 5 Plan 04: Record helpers to domain Summary

**The record pen's pure helpers (save gate, draft shape and dirtiness, tasting payload, save assembly, saved-status sentence) moved from RecipePage.jsx into framework-free `domain/recordDraft.js`, so RecipePage.jsx exports no pure function any more and Plan 05's hook can build on a domain module**

## Performance

- **Duration:** about 20 min (start time was not captured at spawn; estimated from the clock, end 11:23Z)
- **Tasks:** 3 (one tracer, two auto)
- **Files:** 2 created, 4 modified
- **Suite:** 82 files, 2612 tests, all passing (baseline was 81 files, 2586; this plan adds 1 file and 26 tests)

## Accomplishments

- `recordDraft.js` holds fourteen exports, all moved verbatim with their comments except one new op, `removeTastingSection`. It imports only `./battery.js`, `./batch.js`, `./lineage.js` and `./penDraft.js` (for `usesListsDiffer`). Private: `TASTING_BODY_FIELD_KEYS`, `asMadeMapsDiffer`, `marksDiffer`, `stepChangesDiffer`, `blankTastingFields`, `toTextOrNull`.
- RecipePage.jsx lost about 420 lines. With Plan 02, every pure helper it exported at 4f1f98f (sixteen functions) is now imported from `app/src/domain/`; it exports `RecipeNotFound`, `RecipePage` and exactly the eleven page strings.
- `handleRemoveTasting`'s state update is `setDraft((prev) => removeTastingSection(prev))`; every other line of the handler is untouched. The two `onPageStatus(batchSavedStatus(record))` calls are written as before, so the source-text describe in RecipePage.test.jsx still finds two.
- The three test files import the moved names from `../domain/recordDraft.js`. `it(` counts equal 4f1f98f (RecipePage.test.jsx 108, RecipePage.drafts.test.jsx 38, BatchRow.test.jsx 206). The `RECORD_DRAFT_KEYS` pin against `blankRecordDraft()`'s keys is unchanged.
- `recordDraft.test.js` (26 tests, node, no jsdom docblock) covers the save gate; dirtiness with and without a baseline; `draftFromBatch` on a `structuredClone` (no mutation, nothing shared with the batch); the tasting payload and restore (nothing shared with the undo); `removeTastingSection`; the save assembly (blank to null, blank as-made rows dropped); `batchSavedStatus`; fresh `blankRecordDraft` objects; and a source check for no module-level `let` or `var` and no `TASTING_BODY_FIELD_KEYS.add/delete/clear`.
- The built app compares `MATCH 94 snapshots` against `05-walk-before.json` after each task commit.

## Task Commits

1. **Task 1 (tracer): the record pen's save gate, from validateRecordDraft in domain through handleSaveBatch to the built app** - `8031981` (refactor)
2. **Task 2: the record draft's shape, dirtiness and tasting payload move to domain** - `1f9d9c1` (refactor)
3. **Task 3: the save assembly and the saved-status sentence move to domain** - `c3e5a89` (refactor)

**Plan metadata:** committed after this file (docs: complete plan)

The tracer gate: the tracer's `<verify>` is automated-only, so it was re-run end to end after the commit's code was in place (focused tests, full suite, build, walk compare); it passed before Task 2 started.

## Files Created/Modified

- `app/src/domain/recordDraft.js` - the record pen's pure helpers (see Accomplishments)
- `app/src/domain/recordDraft.test.js` - node tests for all of them
- `app/src/ui/RecipePage.jsx` - declarations removed; imports from `../domain/recordDraft.js`; `parseGramsDraft`, `usesListsDiffer` and the `battery.js` import dropped as orphans
- `app/src/ui/RecipePage.test.jsx`, `app/src/ui/RecipePage.drafts.test.jsx`, `app/src/ui/BatchRow.test.jsx` - imports only

## Decisions Made

See key-decisions. `app/src/domain/draft.js` and `draft.test.js` are untouched (`git diff --stat 4f1f98f` over both is empty), per D-01.

## Deviations from Plan

None - plan executed exactly as written.

Environment note (not a deviation): the fresh worktree had no `app/node_modules`; it was copied from the main checkout with `cp -Rc`. No package was installed; `app/package.json` and `app/package-lock.json` are unchanged (T-05-SC). The sandbox rejects compound commands in worktrees, so the walk ran as three separate commands (build, record, compare) with literal scratch paths under the session scratchpad, not the plan's single `&&` chain. The `it(` count and `draft.js` checks were run as `git show` to a scratch file plus `grep -c` and `git diff --stat`, because the sandbox rejects `git` inside `node -e`. Same checks, same results.

## Noticed, not changed

- `app/src/domain/draft.js` line 18: the comment "order blankRecordDraft (RecipePage.jsx) builds them" now names the wrong home (blankRecordDraft is in `domain/recordDraft.js`). Left alone under D-01 (draft.js untouched).
- Comments in RecipePage.jsx that say "above" or "below" about moved code are now stale in position only: `(tastingHasInk above decides whether this is even called)` was moved with its function, but the comment above `handleStartAmending` ("draftFromBatch above") and the one above `handleRemoveTasting` ("tastingPayloadFromDraft, Task 2's restore reads it") still read as written. They name functions that are now imported.
- Carried over from Plans 02 and 03: `app/src/ui/Method.jsx` line 581 and `app/src/domain/stepNumbers.js` line 3 still name RecipePage.jsx as the home of pen helpers or handlers.

## Threat Notes

- T-05-06 (moved save assembly and dirty check): moved verbatim; the `it(` counts are pinned to 4f1f98f; the `RECORD_DRAFT_KEYS` pin is unchanged; the walk compares the batches and drafts stores after every record, correct and tasting scenario (MATCH 94 snapshots).
- T-05-07 (`draftFromBatch` reads of a stored batch): own-property reads and the asMade copy by own keys kept verbatim; a node test calls it on a `structuredClone` and checks nothing is mutated or shared with the batch.
- T-05-SC: no package installed; `app/package.json` and `app/package-lock.json` unchanged.

## Issues Encountered

None.

## Known Stubs

None.

## Threat Flags

None.

## Next Phase Readiness

Ready for Plan 05 (`useRecordDraft`). The record half of D-12 (`setDraft`, `setBlockedDateMessage` out of RecipePage.jsx) is still open: the record handlers remain in RecipePage.jsx and call the moved helpers through imports. `removeTastingSection` is the one new op; the hook's per-edit ops can sit beside it in `recordDraft.js`.

## Self-Check: PASSED

- FOUND: app/src/domain/recordDraft.js, app/src/domain/recordDraft.test.js
- FOUND: 8031981, 1f9d9c1, c3e5a89 (all ancestors of HEAD)
- Acceptance: `export const CHURN_DATE_BLOCKED_MESSAGE` once in recordDraft.js; no moved function or `CHURN_DATE_BLOCKED_MESSAGE` in comment-stripped RecipePage.jsx; `head -1 recordDraft.test.js` has no `@vitest-environment`; RecipePage.jsx's `export function` list is exactly `RecipeNotFound,RecipePage`; its `export const` list is exactly the eleven page strings; recordDraft.js imports are all `./name.js`; unused-import check exits 0; `it(` counts 108, 38, 206 equal base; `onPageStatus(batchSavedStatus(record))` twice
- `npm --prefix app test`: 82 files, 2612 tests passed; walk compare: MATCH 94 snapshots
