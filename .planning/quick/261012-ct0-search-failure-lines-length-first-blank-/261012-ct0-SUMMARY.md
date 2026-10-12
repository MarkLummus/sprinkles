---
phase: quick-261012-ct0
plan: 01
subsystem: search
tags: [sheet-code, search, copy, domain]
status: complete
requirements: [PRINT-04, UX1-03]
key-files:
  modified:
    - app/src/domain/sheetCode.js
    - app/src/domain/sheetCode.test.js
    - app/src/ui/SheetCodeSearch.jsx
    - app/src/ui/SheetCodeSearch.test.jsx
actuals:
  tokens: 9000
  tasks: 2
  commits: 3
plan_head_before: a86a5041a22403ce59b8679d3c2609421a7e7711
plan_head_after: c49a85b18e529e6467f497a898601139e8d0d164
---

# Quick 261012-ct0: Search failure lines, length first, blank folded into length

Search by Sheet code now checks length first (an empty field reads "This one has 0."), then a stray character, then the letter U, counting symbols by code point. It amends 261012-ck1.

## New order

| Order | Reason | Line |
|-------|--------|------|
| 1 | length (blank included, count 0) | A Sheet code has eight letters and numbers. This one has N. |
| 2 | other-character | Sheet codes use only letters and numbers. |
| 3 | letter-u | Sheet codes never use the letter U. |
| 4 | no match (well-formed) | No version has this code. |

The store-error line and handleSubmit (live-region behaviour) are unchanged.

## What changed

- `codeProblem` reads the symbols as an array of code points (`[...codeSymbols(input)]`), returns length if not eight, then walks for other-character, then U. The early `blank` return is gone.
- `SHEET_CODE_BLANK` and the `blank` case in `problemLine` are removed. The default case now serves a blank field with count 0.
- `normaliseCode` and `codeSymbols` are untouched.

## Grep findings this plan replaced

SHEET_CODE_BLANK, "Type a Sheet code." and the `'blank'` reason had these uses, all changed: sheetCode.js doc comment and early return; SheetCodeSearch.jsx export and `case 'blank'`; sheetCode.test.js blank and hyphens-only tests; SheetCodeSearch.test.jsx import, blank-submit test, repeat-submit pair and copy pin. A final grep of app/src finds none left.

## Decisions and notes

- A non-string input to `codeProblem` reads as length 0. It follows from merging blank into length; only callers other than the Search field can pass one. It still agrees with normaliseCode's null.
- Code-point counting: the ice-cream emoji alone reads 1, not 2. 'K7QM-2X9' plus an emoji is eight code points (nine UTF-16 units), so it reaches other-character, not length 9.
- Mark's text described 'K7QM-2X9!' as nine symbols. It has eight once the hyphen is dropped, so it reaches the other-character line, which is the line he expected. A nine-symbol input such as 'K7QM-2X9U!' reads length 9.
- The 261012-ck1 PLAN and SUMMARY and STATE.md still quote the removed "Type a Sheet code." copy. They are records and were left as written.
- Executors wrote nothing to Mark's List.

## Deviations from Plan

None. The plan executed as written. The emoji field test passed on Task 1's code, so no fix was needed in Task 2.

## Test results

- `npm --prefix app test -- src/domain/sheetCode.test.js src/ui/SheetCodeSearch.test.jsx`: 2 files, 55 tests passed (RED run before the code change: 6 failed, 48 passed).
- `npm --prefix app test` (full suite, once at the end): 78 files, 2512 tests passed.

## Commits

- f5c7519 test(261012-ct0): pin length first and blank as length 0
- beeee56 feat(261012-ct0): Sheet code search checks length first, blank reads 0
- c49a85b test(261012-ct0): pin an emoji as one Sheet code symbol through the field

## Known Stubs

None.

## Self-Check: PASSED

Four app files modified and committed; commits f5c7519, beeee56, c49a85b exist; no use of SHEET_CODE_BLANK, "Type a Sheet code" or `'blank'` remains under app/src.
