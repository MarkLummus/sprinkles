---
phase: quick-261002-7xo
plan: 01
subsystem: testing
tags: [vitest, jsdom, react, signed-field, BatchRow, WR-01]
requires: []
provides:
  - "jsdom render tests for MeasuredField's onChange, onInput and onWheel on the signed fields"
affects: [03.5-VERIFICATION truth 26b, 03.5-REVIEW WR-01]
tech-stack:
  added: []
  patterns: ["per-file jsdom docblock sibling test (as useFold.reset.test.jsx)", "validity shadowed on the node; value moved through the HTMLInputElement prototype setter"]
key-files:
  created: [app/src/ui/BatchRow.signed.test.jsx]
  modified: []
decisions:
  - "Tests live in a sibling file, not BatchRow.test.jsx, so the node-environment describe block there keeps running with no window"
metrics:
  tasks: 2
  files: 1
status: complete
actuals:
  tokens: 3000
  tasks: 2
  commits: 2
plan_head_before: 36f8445650a9a7e6c0bff9724290bcc67c465345
plan_head_after: aa6ad42b26889904ab992f14a7887e89fe22d424
completed: 2026-10-02
requirements: [BATCH1-02]
---

# Phase quick-261002-7xo Plan 01: Signed-field handler tests Summary

Four jsdom render tests in `app/src/ui/BatchRow.signed.test.jsx` fire real events at the Out of machine input (through BatchRow in recording mode), so deleting onInput, neutralizing onChange, deleting onWheel, or bypassing readSignedInput now fails a named suite test. No app source changed.

## Commits

- 9072f63: test(261002-7xo): render MeasuredField's lone-minus onInput path under jsdom (tracer, 1 test)
- aa6ad42: test(261002-7xo): pin the onChange path, readable entry and wheel blur of the signed fields (3 tests)

## Mutant table

Each mutant was applied only to a copy of app/src under a `mktemp -d` directory (node_modules symlinked); a `cmp` guard confirmed each applied (no "MUTANT DID NOT APPLY"). Each run printed exactly one FAIL line.

| Mutant | sed edit | Failing test | Tests line |
|--------|----------|--------------|------------|
| onInput removed | `/onInput={field.signed ? handleEdit : undefined}/d` | a lone minus in an empty field reaches the draft as the constant through onInput alone | Tests  1 failed \| 3 passed (4) |
| onChange neutralized | `s/onChange={handleEdit}/onChange={() => {}}/` | an unreadable edit of a field holding -6 reaches the draft as the constant through onChange alone | Tests  1 failed \| 3 passed (4) |
| onWheel removed | `/onWheel={field.signed/d` | a wheel over the focused field blurs it and leaves -6 in place | Tests  1 failed \| 3 passed (4) |
| readSignedInput bypassed | `s/readSignedInput(event.target)/MALFORMED_NUMBER_ENTRY/` | a readable -6 typed over the constant reaches the draft as -6, never the constant | Tests  1 failed \| 3 passed (4) |

## Suite counts

- Before: 54 files, 1501 tests (baseline at HEAD 36f8445).
- After: 55 files, 1505 tests, all passing. `BatchRow.test.jsx` still runs 159 tests under node. `git diff HEAD` on `BatchRow.jsx` and `BatchRow.test.jsx` is empty (SOURCE-UNCHANGED).

## What closes and what does not

- **Only the missing-test half of WR-01 is closed.** The suite now fires the events the handlers answer to.
- **WR-01's double-call half stays open.** `handleChangeRecordField` still runs twice per readable keystroke (onInput and onChange both fire for a moved value). Fixing that needs a source change, which was out of scope. Test 2 deliberately does not pin the call count, and test 1's comment says a future fix that drops onChange on signed fields must revisit it.
- **Truth 26b's suite gap closes** (events are fired), but the wheel test proves a blur only. jsdom never steps a number input on wheel, so "value still -6" is trivially true there; the blur is the meaningful assertion. Chromium's value stepping stays evidenced by the 03.5-31 probe, not by this suite.
- The lone-minus and unreadable-edit tests rely on `validity.badInput` shadowed onto the node, because jsdom never reports badInput. They prove the handlers' routing, not the browser's badInput report.

## Sibling-file decision

The tests are in a new file, not `BatchRow.test.jsx`, because a jsdom docblock switches the environment for the whole file. `BatchRow.test.jsx` lines 702-712 hold `describe('BatchRow — the axes grid does not crash under Vitest\'s node environment (no window.matchMedia, this plan\'s own critical note)')` with the test "renders the tasting section with no window in scope, with no error thrown". Under jsdom it would still pass but `window` would be in scope, so it would prove nothing. The same split exists as `useFold.reset.test.jsx` beside `useBelowDesktop.test.js`.

## Note on the single-file command form

The orchestrator's form `npm --prefix app test -- --run app/src/ui/...` matches no files under Vitest 5; filters are relative to app/, so `src/ui/BatchRow.signed.test.jsx` is the working form.

## Deviations from Plan

None - plan executed exactly as written. Both tasks ran on main in the primary checkout, as the orchestrator directed.

## Known Stubs

None.

## Threat Flags

None.

## Self-Check: PASSED

- app/src/ui/BatchRow.signed.test.jsx exists; commits 9072f63 and aa6ad42 exist; each touches only that file.
