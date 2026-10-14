---
phase: quick-261014-e8b
plan: 01
subsystem: testing
tags: [vitest, source-text-test, stripComments, WR-02]
requires: []
provides:
  - "String-aware stripComments in RecipePage.shell.test.js"
affects: [app/src/ui/RecipePage.shell.test.js]
tech-stack:
  added: []
  patterns: ["single-pass regex: string alternative before comment alternative"]
key-files:
  created: []
  modified:
    - app/src/ui/RecipePage.shell.test.js
key-decisions:
  - "Used the string-aware single pass instead of the review's character-before-// one-liner (3 of 5 string cases still fail under the one-liner)"
metrics:
  duration: "about 5 min"
  completed: 2026-10-14
status: complete
actuals:
  tokens: 1200
  tasks: 2
  commits: 2
plan_head_before: b1f9bbc7c82c8d15fbd057f0caa9277c22f77b5b
plan_head_after: e505828e56cb159d128082ba10901e0c6cd8ac88
---

# Phase quick-261014-e8b Plan 01: String-aware stripComments Summary

stripComments now matches a string before a comment in one regex pass, so a `//` or `/*` inside a single-quoted, double-quoted or template string no longer hides the code after it from the D-12 setter check, the reset count or the markup check (WR-02).

`commits: 2` counts the two task commits (4017e41, e505828) measured before this SUMMARY was committed; the SUMMARY commit follows.

## Tasks

| Task | Name | Commit |
| ---- | ---- | ------ |
| 1 | Tracer: http://x line, red then green | 4017e41 |
| 2 | Widen cases, real-comments control, mutation proof | e505828 |

## RED evidence (Task 1)

Before the helper changed: `Tests  1 failed | 24 passed (25)`, the failing test being the `http://x` row (received `"const u = 'http:"`). After: `Tests  25 passed (25)`.

## Mutation proof (Task 2)

Run on a throwaway sibling copy (`RecipePage.shell.mutant.test.js`, deleted in the same loop step). Printed `MUTATION-PROOF-OK`.

- Old (batch-base) helper: `Tests  5 failed | 25 passed (30)`. Failing: the four setter rows (`http://x`, `"a // b"`, template `${base}//x`, `'/*' ... '*/'`) and `a reset or markup after a URL string is still seen`.
- Identity helper: `Tests  3 failed | 27 passed (30)`. Failing: `real comments are still stripped, a quote inside one included`, plus `usePenDraft.js imports only react and the domain` and `useRecordDraft.js imports only react and the domain` (the hook comments name the repository), as the plan predicted.

## Verification

- `npm --prefix app test -- src/ui/RecipePage.shell.test.js`: 30 passed (30).
- Full suite: 85 files, 2683 tests, all passing (baseline 2677 plus 6 new).
- Scope: `git status` showed only `app/src/ui/RecipePage.shell.test.js` modified; no mutant copy left; `git diff 37f630c` shows no change in lines 1-14 (first hunk starts at line 12 context, first change at line 15).

## Deviations from Plan

None - plan executed as written. The mutation command was run from a scratchpad script holding the plan's exact logic, because the sandbox rejects the long compound command inline. The plan-head ledger file could not be written inside the shared git dir from this worktree; the base `b1f9bbc` (the verified starting HEAD) was used for the commit count.

## Known Stubs

None.

## Self-Check: PASSED

- FOUND: app/src/ui/RecipePage.shell.test.js
- FOUND: 4017e41, e505828 (ancestors of HEAD)
