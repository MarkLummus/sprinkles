---
phase: quick-261012-ck1
plan: 01
quick_id: 261012-ck1
subsystem: search
tags: [sheet-code, search, live-region, copy]
requires: []
provides:
  - "codeProblem(input) in app/src/domain/sheetCode.js"
  - "four approved Sheet code lines in app/src/ui/SheetCodeSearch.jsx"
affects: [app/src/domain/sheetCode.js, app/src/ui/SheetCodeSearch.jsx]
key-files:
  modified:
    - app/src/domain/sheetCode.js
    - app/src/domain/sheetCode.test.js
    - app/src/ui/SheetCodeSearch.jsx
    - app/src/ui/SheetCodeSearch.test.jsx
decisions:
  - "Precedence is other character, then U, then length."
  - "normaliseCode and codeProblem read symbols through one private helper, codeSymbols."
status: complete
completed: 2026-10-12
commits: 3
plan_head_before: 751dabc6461729eaa90e4b6036bb3277188ce1d8
plan_head_after: 0742a6ce9625e6293c3c91067c28781cfd1ff844
actuals:
  tokens: 5500
  tasks: 2
  commits: 3
---

# Phase quick-261012-ck1 Plan 01: Search by Sheet code names why a code is wrong Summary

Search by Sheet code now says why a code is wrong, using Mark's four lines approved on 2026-10-12, through a pure `codeProblem` reader in the domain.

## What changed

- `app/src/domain/sheetCode.js`: the symbol-reading chain moved out of `normaliseCode` into a private `codeSymbols` helper (output of `normaliseCode` unchanged; its describe block passes unedited). New exported `codeProblem(input)` returns `null` when `normaliseCode` would accept, else `{ reason }`.
- `app/src/ui/SheetCodeSearch.jsx`: `SHEET_CODE_MALFORMED` and its pending-approval comment are gone. New exports `SHEET_CODE_BLANK`, `SHEET_CODE_WRONG_LENGTH(count)`, `SHEET_CODE_LETTER_U`, `SHEET_CODE_OTHER_CHARACTER`. `handleSubmit` calls `codeProblem(code)` and only on `null` runs `findVersionsByCode`. The empty-then-next-frame write and the focus call are untouched. The `normaliseCode` import is dropped. No markup, CSS, token, link or button change.

## Reasons and precedence

| Reason | Line |
|---|---|
| `blank` (not a string, empty or whitespace-only) | Type a Sheet code. |
| `other-character` (any symbol outside the alphabet that is not U) | Sheet codes use only letters and numbers. |
| `letter-u` (a U, nothing else outside the alphabet) | Sheet codes never use the letter U. |
| `length` with `count` (not eight symbols) | A Sheet code has eight letters and numbers. This one has N. |

Checked in that order: another character beats U, and U beats length. N is the symbol count after `normaliseCode`'s own steps, so I, L and O each count as one ('K7QM2X' reads 6, 'K7QM 2X9D OO' reads 10, 'hello' reads 5).

## Assumptions for Mark

1. A hyphens-only field (for example `----`) shows the length line with N = 0, not the blank line. The plan took "blank" literally as empty or whitespace-only. If Mark wants hyphens-only to read 'Type a Sheet code.', it is a one-line change in `codeProblem`.
2. A non-string input to `codeProblem` reads as blank. The Search field only ever passes a string, so this matters only to other callers.

## Tests

- Two touched files (`src/domain/sheetCode.test.js`, `src/ui/SheetCodeSearch.test.jsx`): 2 files passed, 54 tests passed.
- Full suite (`npm --prefix app test`): 78 files passed, 2511 tests passed, including `tabindex-scan.test.js` and the node-environment domain suite.
- Field-level pins: the four new lines, precedence, N for 6 and 10, exact copy of every constant, and the repeat-submit live-region behaviour looped over five lines (blank, length, U, other character, no match).

## Grep findings replaced

- `SheetCodeSearch.jsx` lines 15-17 (comment, pending-approval sentence, constant export), line 63 (assignment) and line 4 (the `normaliseCode` import).
- `SheetCodeSearch.test.jsx` line 18 (import), 'reads the same line for an empty and a blank submit' (now expects the blank line) and 'tells a malformed code from a missing sheet' (now a table of input and exact line).

No use of `SHEET_CODE_MALFORMED` or 'Check the code' remains under `app/src`.

## Historical records left as they are

The old sentence still appears in the 261011-al8 PLAN and SUMMARY and in `04-REVIEW.md`. They are records and were not edited.

## Deviations from Plan

None - plan executed as written. Two small notes:

- The worktree had no `app/node_modules`; a symlink to the main checkout's `app/node_modules` was made (untracked, not committed) so the tests could run.
- RED was committed before the plan-head ledger file was written, so the ledger base was recorded as the known base commit 751dabc (the commit the worktree was created from).

## Mark's List

Executors wrote nothing to Mark's List.

## Self-Check: PASSED

- sheetCode.js, sheetCode.test.js, SheetCodeSearch.jsx and SheetCodeSearch.test.jsx present and committed; under `app/`, the 261012-ck1 commits touch only these four files.
- Commits 269693f (test), 77b2cb0 (feat), 0742a6c (test) are ancestors of HEAD.
