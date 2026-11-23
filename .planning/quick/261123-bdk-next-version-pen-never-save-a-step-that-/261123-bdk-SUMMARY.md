---
phase: quick-261123-bdk
plan: 01
subsystem: version-pen
tags: [pen, backup, validateStoreFile, step-save, bug]
requires: [quick-261122-tqn]
provides:
  - "penFieldsFromDraft applies one saved-step rule to the method both pen saves store"
affects: [app/src/domain/penDraft.js, app/src/domain/lineage.js]
key-files:
  modified:
    - app/src/domain/penDraft.js
    - app/src/domain/lineage.js
    - app/src/domain/penDraft.test.js
  created:
    - app/src/store/pen-step-roundtrip.test.js
decisions:
  - "Fix at the writer: validateStoreFile, transfer.js, db.js and repository.js are untouched (DB_VERSION stays 10)"
  - "A removed step's refused fields fall back to the version the pen opened on; edits that hold words are kept"
status: complete
metrics:
  tasks: 3
  tests_before: 4577
  tests_after: 4591
  files_before: 136
  files_after: 137
actuals:
  tokens: 3800
  tasks: 3
  commits: 5
plan_head_before: 8c0fbc2e9516faf99714ac4da92e214d89ebeba4
plan_head_after: 6af1e7b6e3d3514268f2ac7db97c973d827d1c75
completed: 2026-11-23
---

# Phase quick-261123-bdk Plan 01: The pen never saves a step the backup refuses Summary

The version pen now saves its method by one rule, so a version saved through "Save as new version" or "Save over this version" always passes `validateStoreFile` and imports from a backup; a both-blank target is dropped on any step, and a removed step's blank lead-in, instruction or one-sided target falls back to what the opened version holds.

## The rule

- At Save, every step in the pen's method saves as typed, except:
- (a) on any step, a target whose label and value both hold no words is dropped, as the creation editor drops it;
- (b) on a removed step, a lead-in or an instruction that holds no words, or a target with exactly one side that holds no words, saves as the version the pen opened on holds it: that step's own lead-in, instruction, or its target at the same position.
- "Holds words" is lineage.js `hasWords`: a string whose trimmed text is not empty, the rule the pen gate and the creation editor already read.
- Everything else on a removed step saves as typed (edits that hold words, uses, purpose, aside, the removed flag).
- On a live step the gate refuses (b)'s fields before Save, so only (a) ever acts there.

Each target is judged by its position in the draft before any is dropped, so a one-sided target falls back at its own position, not at a shifted one.

## How a removed step was stored before the fix (trace)

`penFieldsFromDraft` handed `penDraft.method` through untouched. `createChildVersion` and `saveOverVersion` (lineage.js) `structuredClone` it. Every step, removed or not, was therefore stored in place with the draft's text, `removed: true` marking the struck one. The pen's gate (`findBlockedStep`) skips removed steps, so nothing between the gate and the store looked at a removed step's fields. A removed step with a blank lead-in, instruction or one-sided or both-blank target was stored blank, and `validateStep` in transfer.js refused it on import. A live step's both-blank target was stored as `{ label: '', value: '' }` and refused the same way.

## Red then green

Red (Task 1, commit e6e534d1): R1 and R2 (both saves) failed at the check with `$.versions[11].method[0].targets[0]: expected { label: non-empty string, value: non-empty string }, got {"label":"","value":""}`. D1 failed on the target list (received the two blank targets as well).
Green (c0943a42): 169 tests passed across the three files.

Red (Task 2, commit 9f44ee15): 8 failed, 65 passed in the two files.
- R3 (blank lead-in, both saves): `method[0].leadIn: expected a non-empty string, got ""`
- R4 (blank instruction, both saves): `method[0].instruction: expected a non-empty string, got ""`
- R5 (one-sided target, both saves): `method[0].targets[0]: ... got {"label":"temp","value":""}`
- D2 and D3 failed on the saved fields. R6 and D4 passed as bounds, as the plan said.
Green (6af1e7b6): 236 tests passed across the four files named in the plan's verify.

Suite: 136 files and 4577 tests before; 137 files and 4591 tests after (14 new: R1 and R2, two; R3 to R6 over both saves, eight; D1 to D4, four).

## Changes

- `app/src/domain/penDraft.js`: new module-private `savedMethod(penDraft, version)`; `penFieldsFromDraft` reads it for `method`. The comment above `penFieldsFromDraft` states the rule. `penDraftVersion` keeps `penDraft.method` unchanged: the pen's live view is not the saved record.
- `app/src/domain/lineage.js`: `hasWords` now exported (keyword only; no third copy of the predicate).
- `app/src/store/pen-step-roundtrip.test.js` (new): export, JSON, `validateStoreFile`, `importStore` into a fresh store, for both saves, on the stored Olive Oil v1 and on a stored clean child of it.
- `app/src/domain/penDraft.test.js`: D1 to D4.

## Deviations from Plan

### Changed existing assertion

In `penFieldsFromDraft` case "carries the draft's own version line, citation, method, titles and authored", `expect(fields.method).toBe(draft.method)` became `toEqual`. The saved method is now a new array, equal for a clean draft. The edit went into the first red commit (it passes either way) rather than the green one.

### Other

- The `savedMethod` uses `step.targets ?? []` as the plan said. As a side effect a live draft step with no `targets` array now saves with `targets: []` (see the other-shape list).
- No other deviation. No existing test pinned the old pass-through.

## Guard gates

`git diff --quiet 8c0fbc2e HEAD -- app/src/ui app/src/store/transfer.js app/src/store/db.js app/src/store/repository.js app/src/domain/creationSave.js` exits 0. `DB_VERSION` is 10. The grep gates: `export function hasWords` appears once in lineage.js; `expect(fields.method).toBe(` appears zero times in penDraft.test.js.

## Other-shape check

A scratch script under the session scratchpad (not in the repo) built a child from the stored-shape Olive Oil v1 through `penFieldsFromDraft` and `createChildVersion`, appended it to an `exportStore` file, and ran `validateStoreFile` on it. Results on this worktree's HEAD:

- PASS: blank purpose and aside; padded lead-in; padded Version name; reason of spaces; blank Sheet title and description; blank Before you start note; every note removed; every row's lines out; every step removed; uses toggled; unreadable grams `'abc'` on a removed line (falls back to the stored amount).
- FAILS, outside the two cases, confirmed as the planner found: a whole number of 309 digits in a grams field on a line that is removed, or that sits in a removed step. `$.versions[19].rows[0].portions[0].grams: expected a finite number of at least zero, got null`. `Number()` reads the digits as `Infinity`, `penDraftRows` stores it (no fallback), the export writes `null`, and the check refuses it. Reproduced here in domain code only. Not fixed.
- Not reachable through the app: a kept draft step without a `targets` array. It now saves as `targets: []` through `savedMethod`, where before the fix it was stored without the array and the check refused it. The probe confirmed it passes after the fix.

Nothing was measured in a browser or on a device. All results are Vitest, in node, plus one node probe script.

## Known Stubs

None.

## Threat Flags

None. The fix is at the writer and loosens no import check (T-bdk-01, T-bdk-02 mitigated as planned).

## For the orchestrator

- Close Mark's List row `bug-pen-saves-step-backup-refuses`: the fix has landed on this branch (both cases, both saves, proven by round trip). The executor has no ArtifactData.
- New bug for Mark to triage (draft row, not written):
  - id: `bug-pen-huge-grams-on-removed-line-backup-refuses`; kind `bug`; owner `mark`; needs `answer`; severity `minor` (a 309-digit number is not something a maker types by accident; it needs a removed line or step).
  - Title: A removed line with a 309-digit number in its amount makes the backup refuse the version.
  - Detail, steps to repeat: 1. Open the pen on any version. 2. In an amount field type a whole number of 309 or more digits (for example 9 repeated 309 times). 3. Remove that line, or remove its step. 4. Save as a new version (or Save over). 5. Export a backup, then import it into an empty store. Expect: the import is refused naming `rows[i].portions[j].grams`. On a live line, `gramsDraftMessage` refuses the number at Save, so only a removed line or a line in a removed step gets through. Reproduced here in node by domain code (penFieldsFromDraft, createChildVersion, exportStore, validateStoreFile); not reproduced in the app screens.
  - Cause (unverified): `NUMERIC_GRAMS_PATTERN` accepts the digits and `Number()` reads them as `Infinity`; `parseGramsDraft` returns it, so `penDraftRows` keeps `Infinity` instead of falling back to the stored amount; IndexedDB keeps `Infinity`, the JSON export writes `null`, and `validateStoreFile` refuses `null`.
  - Options: `fix` (not recommended before he answers; the fix looks small, a finite check in `parseGramsDraft`), `defer`, `not-a-bug`.
- The Required word on a one-sided target chip (`decide-p12-pen-target-required-place`) is untouched.

## Self-Check: PASSED

- app/src/store/pen-step-roundtrip.test.js, app/src/domain/penDraft.js, app/src/domain/lineage.js, app/src/domain/penDraft.test.js exist and are committed.
- Commits e6e534d1, c0943a42, 9f44ee15, 6af1e7b6 are ancestors of HEAD.
