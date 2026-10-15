---
phase: quick-261014-uy4
plan: 01
subsystem: domain
tags: [drafts, penDraft, noteOrigins, restore-check, vitest]
requires:
  - phase: quick-e8a (737d2be)
    provides: penDraft.noteOrigins, written by removePenNote
provides:
  - fitsNoteOrigins, called last by fitsPlanShape, so draftMatchesVersion refuses a plan draft whose noteOrigins the pen cannot read
affects: [RecipePage restore effect, RecipeList draft check]
actuals:
  tokens: 3000
  tasks: 2
  commits: 3
plan_head_before: e8301502056e1dc221cbd5586ff780adc414dd17
plan_head_after: 8e52c06ef07400919650f949d03e7c5bbc612820
tech-stack:
  added: []
  patterns: ["walk sparse arrays by index, never with every/some"]
key-files:
  created: []
  modified:
    - app/src/domain/draft.js
    - app/src/domain/draft.test.js
key-decisions:
  - "fitsNoteOrigins requires one in-range integer origin per draft note (length equality), not only in-range entries, because setPenNoteText falls back to the note's own index when an origin is missing"
  - "List keys are matched with has() against version.authored and payload.authored, so names that exist only on Object.prototype (toString) are refused"
requirements-completed: [EDIT-02]
duration: 2 min
completed: 2026-10-14
status: complete
---

# Phase quick-261014-uy4 Plan 01: Kept draft noteOrigins check Summary

**A kept plan draft whose noteOrigins the pen could not follow (for example `{beforeYouStart: [99]}`) is now refused by `draftMatchesVersion`, so the page deletes it on restore instead of throwing a TypeError on the next note edit.**

Closes Mark's List bug `bug-kept-draft-note-origins-unchecked` (from the Phase 5 security audit). I did not touch the list row. The orchestrator closes it.

## What a legitimate noteOrigins looks like

Read from the code, as the plan's objective records it:

- **Absent.** `penDraftFromVersion` and `setPenNoteText` never write the key, so a draft with no removal, and every draft kept before 737d2be, has none. Absent keeps passing.
- **Written only by `removePenNote`.** The value is a plain object `{ [listKey]: [integer, ...] }` where every entry is an integer from 0 up to the version list's length minus 1, and the array is exactly as long as the draft's own list for that key. The pen cannot add a note, so the two lengths never differ and an origin is never null. An empty array is legitimate (every note removed).
- **The only list key the app writes is `beforeYouStart`.** The rule does not hard-code it: a list key is known when `version.authored` and the draft's `authored` both hold it as an own key whose value is an array.
- Ordering and distinctness are not checked. The app writes strictly increasing origins, but a duplicate or out-of-order origin points at an existing note and cannot throw.

## Accomplishments

- `fitsNoteOrigins(payload, version)` in `app/src/domain/draft.js`, directly above `fitsPlanShape`, which returns it as its last statement. No new import; `draft.js` keeps its two imports and stays pure.
- Refused: a noteOrigins that is not a plain object (null, array, string); a list the version or the draft does not hold as its own array (`carriedForward`, `toString`); a list value that is not an array; an origin that is not an integer, is negative, or is at or past the version list's length (including NaN, a string, null, and a hole in a sparse array); an origins array whose length differs from the draft's list.
- Accepted: no noteOrigins, one removal (`[1]`), the low boundary (`[0]`), every note removed (`[]`), and a removal followed by an edit.
- Test A also proves the refused value is the crashing one: `setPenNoteText` on the `[99]` payload throws a TypeError before the check refuses it.
- Doc comments on `fitsPlanShape` and `draftMatchesVersion` name the new clause.

## Task Commits

1. **Task 1 (tracer, RED):** `cfeb268` (test) - tests A, B, C; A and C failed, B passed, before the rule existed. The commit hook did not refuse the red commit.
2. **Task 1 (GREEN):** `6169a57` (fix) - `fitsNoteOrigins` and the `fitsPlanShape` call.
3. **Task 2:** `8e52c06` (test) - one named `it` per clause plus the two doc-comment updates. I amended this commit twice to rewrap the JSDoc lines I had made too long; it was local and unpushed.

Plan metadata (SUMMARY.md) is left uncommitted for the orchestrator's docs commit.

## Files Created/Modified

- `app/src/domain/draft.js` - `fitsNoteOrigins` added; `fitsPlanShape` ends by calling it; two comments updated.
- `app/src/domain/draft.test.js` - imports `removePenNote`, `setPenNoteText` from `./penDraft.js`; new describe block "draftMatchesVersion: a plan draft's noteOrigins" (8 tests).

## Verification

- `npm --prefix app test -- --run`: 87 files, 2794 tests passing (2786 baseline plus 8 new).
- `npm --prefix app test -- --run src/domain/draft.test.js src/domain/penDraft.test.js src/store/pen-note-roundtrip.test.js`: 3 files, 88 tests passing, existing tests unchanged (including the older-draft restore test).
- `git diff e830150 -- app/src/domain/penDraft.js app/src/ui` is empty.
- `grep -c fitsNoteOrigins app/src/domain/draft.js` = 2; `grep -c "^import" app/src/domain/draft.js` = 2.

## Decisions Made

- Length equality is part of the rule, not just in-range entries. `setPenNoteText` falls back to the note's own index (`?? index`) when an origin is missing, so a short origins array would let a trailing note read past the version's list. The app never writes such a draft, so the clause rejects nothing it writes.
- Positions are walked with a plain `for` loop. `every` and `some` skip holes in a sparse array, and `structuredClone` keeps holes.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Known Stubs

None.

## Threat Flags

None. The change only narrows what a stored draft may contain.

## Threat Model Outcome

- T-261014-uy4-01 (mitigate): done. Tests A and C and the Task 2 clause tests pin it.
- T-261014-uy4-02 (mitigate): done. `has()` against both `authored` objects refuses `toString` (Test C).
- T-261014-uy4-03 (accept): left alone, named below.

## Possible follow-up for Mark's List (not added)

A sibling case the bug row did not cover: a plan draft with **no noteOrigins** whose `beforeYouStart` list is **longer than the version's**. An edit at an index past the version's list takes the `?? index` fallback in `setPenNoteText` and throws the same TypeError. The app cannot write that draft, because the pen cannot add a note, and the drafts store is neither exported nor imported (05-SECURITY.md), so severity is low. If Mark wants it closed, it is one more clause in `fitsNoteOrigins` or `fitsPlanShape`: the draft's list may not be longer than the version's. Candidate row: kind `bug`, severity `minor`, options `fix` / `defer` / `not-a-bug`. I did not add it.

## Next Phase Readiness

Ready for the orchestrator's docs commit and for closing `bug-kept-draft-note-origins-unchecked` on Mark's List. Restoring a refused draft is automatic: `RecipePage.jsx:511` deletes it and `RecipeList.jsx:98` stops naming it. Neither file was edited.

## Self-Check: PASSED

- FOUND: app/src/domain/draft.js, app/src/domain/draft.test.js
- FOUND commits: cfeb268, 6169a57, 8e52c06 (all ancestors of HEAD)
