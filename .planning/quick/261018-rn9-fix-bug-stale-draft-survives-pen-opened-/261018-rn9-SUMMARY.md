---
phase: quick-261018-rn9
plan: 01
quick_id: 261018-rn9
subsystem: draft
tags: [useKeptDraft, kept-draft, bug-fix]
requirements: [EDIT-05]
key-files:
  modified:
    - app/src/ui/useKeptDraft.js
    - app/src/ui/useKeptDraft.test.jsx
status: complete
completed: 2026-10-18
actuals:
  tasks: 2
  commits: 1
plan_head_before: 0abe67c7dee41b3ededef6e142a95ba0e5f4ed41
plan_head_after: 710a5286
---

# Quick 261018-rn9: stale draft survives a pen opened during the read

A matching stored draft that arrives after the maker has already opened a pen is now recorded as still stored, so a pen cleared back to clean deletes it and a dirty pen writes over it.

## Commit

- `710a5286` fix(draft): a pen opened during the read owns the stored draft (bug-stale-draft-survives-pen-opened-during-read)
  - Files: `app/src/ui/useKeptDraft.js` (one code line, `draftStoredRef.current = true;`, plus two comment lines in the late-read branch), `app/src/ui/useKeptDraft.test.jsx` (harness `controls`, `vi.useRealTimers()` in afterEach, two new tests).

## RED evidence (Task 1)

Before the edit to useKeptDraft.js, `npm --prefix app test -- useKeptDraft` gave 1 failed, 3 passed:

- Failing: `a pen opened while the read is out owns the stored draft (bug-stale-draft-survives-pen-opened-during-read) > deletes the stored draft once when that pen is cleared back to clean`
- Assertion: `AssertionError: expected "vi.fn()" to be called 1 times, but got 0 times` at `expect(repo.deleteDraft).toHaveBeenCalledTimes(1)` (useKeptDraft.test.jsx:257).
- Test (2), `writes that pen over the stored draft after the debounce while it stays dirty`, is a guard and passed before the fix.

## Counts

| Run | Before | After |
| --- | --- | --- |
| `npm --prefix app test -- useKeptDraft strictMode RecipePage` | 12 files / 310 tests | 12 files / 312 tests |
| `npm --prefix app test` | 96 files / 3007 tests | 96 files / 3009 tests |

## Gates (Task 2)

- Full suite: 96 files, 3009 tests passed.
- Commit-content gate: exit 0 (exactly two files; one hunk in useKeptDraft.js; only changed code line is `+draftStoredRef.current = true;`).
- Scope gate: exit 0 (app/ clean; .planning/phases holds only the two pre-existing untracked `.review-diagnostics/` folders; no commit naming the row touched .planning/phases).

## Note for the orchestrator

This commit (`710a5286`) moves Phase 9's base pin (`3f23c7f` in the 09-01, 09-07 and 09-17 plans). The orchestrator updates the pin in a separate doc edit. Mark's List row `bug-stale-draft-survives-pen-opened-during-read` is for the orchestrator to close.

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

- `app/src/ui/useKeptDraft.js` and `app/src/ui/useKeptDraft.test.jsx` exist and are committed in `710a5286`.
