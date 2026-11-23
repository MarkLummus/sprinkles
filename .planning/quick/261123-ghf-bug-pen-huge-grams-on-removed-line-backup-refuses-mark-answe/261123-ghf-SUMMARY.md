---
phase: quick-261123-ghf
plan: 01
subsystem: domain
tags: [pen, backup, penDraft, finite-amount]
provides:
  - "penDraftRows saves a typed amount that is not a finite number as the portion's stored amount"
affects: [version pen save, backup export and import]
actuals:
  tokens: 1500
  tasks: 2
  commits: 2
plan_head_before: 27a9f61f96495dc82782a93ce63c14c8443f393b
plan_head_after: 2996746f
key-files:
  modified:
    - app/src/domain/penDraft.js
    - app/src/domain/penDraft.test.js
    - app/src/store/pen-step-roundtrip.test.js
requirements-completed: [bug-pen-huge-grams-on-removed-line-backup-refuses]
status: complete
---

# Quick 261123-ghf: the pen no longer saves an amount a backup refuses

`commits: 2` counts the test commit and the fix commit measured from `plan_head_before`; this summary is committed after them.

## The rule

A line's amount that does not read as a finite number saves as the amount the version the pen opened on holds for that line, as a blank or unreadable amount already does. A whole number of 309 digits reads as Infinity, so it falls back.

## The trace

1. A maker types a whole number of 309 or more digits into a line's amount, then removes the line (or the step it sits in) and saves.
2. `NUMERIC_GRAMS_PATTERN` (lineage.js) accepts the digits.
3. `Number()` reads them as Infinity, so `parseGramsDraft` returns Infinity, not null.
4. `penDraftRows` fell back to the stored amount only on null (`?? portion.grams`), so it kept Infinity, and `penFieldsFromDraft` handed it to `createChildVersion` or `saveOverVersion`.
5. The pen gate (`findBlockedRow`) skips a removed line and a line in a removed step, so nothing refused it.
6. IndexedDB kept Infinity. The export wrote null (JSON has no Infinity).
7. `validateStoreFile` refused the file: `rows[i].portions[j].grams: expected a finite number of at least zero, got null`. The backup would not import.

## The fix and where it sits

`penDraftRows` in `app/src/domain/penDraft.js` reads `parseGramsDraft(draftPortion.grams)` once and uses it when `Number.isFinite` holds; otherwise it uses `portion.grams`. One comment clause was added above it. No other code changed.

Why there and not in `parseGramsDraft`: the finite check at the caller follows `creation.js` `finiteGrams` and `creationSave.js` `gramsOf`. Making `parseGramsDraft` return null for a non-finite value would also change the batch record's as-made figures, the creation editor's fold and range ends, and the pen table's per-line share cell, which is more than this bug needs. lineage.js is also edited later in this batch by 261123-ghk.

## Red, then green

Red (commit d356d76c, before the fix), 6 of the new tests failed:
- Round trip, removed line, both saves: `$.versions[11].rows[1].portions[0].grams: expected a finite number of at least zero, got null`.
- Round trip, line in a removed step, both saves: the same message at `rows[2].portions[0].grams`.
- D5 (penFieldsFromDraft): expected Infinity to be 252.8.
- D6 (penDraftVersion, live line): expected Infinity to be 252.8.
- The 308-digit bound (saves as typed, `Number('9'.repeat(308))`) and the gate bound (a live 309-digit line is refused with "Heavy cream's amount is not a number", naming row-02 line 0) passed before and after.

Green (commit 2996746f): `npm --prefix app test -- src/store/pen-step-roundtrip.test.js src/domain/penDraft.test.js src/domain/lineage.test.js` gave 3 files, 187 tests, all passing.

Full suite: before 137 files, 4596 tests; after 137 files, 4603 tests. The plan expected six new tests; D5 was written as two cases (the 309-digit case and the 308-digit bound), so there are seven.

Guard gate: `git diff --quiet 27a9f61f HEAD -- app/src/ui app/src/domain/lineage.js app/src/store/transfer.js app/src/store/db.js app/src/store/repository.js` exits 0. `DB_VERSION` is still 10. No stored shape change, no on-screen word change.

12-check.sh was not run, per the batch note (domain-only change; the orchestrator runs the full gate on main after the merge). The only gate step this change could move is `suite`, which passed above.

## The one behaviour change outside the removed cases

On a live line holding a 309-digit amount, the pen's live figures now read that line's stored amount (as they already do for 'abc') instead of Infinity. Save is still refused by the gate with the same sentence, "Heavy cream's amount is not a number", naming the row and line, because the gate reads the typed string, not `penDraftRows`.

## Deviations from Plan

None. Rule 4 not triggered. The only difference is the test count noted above (seven, not six).

## Verification limits

Nothing was measured in a browser or on a device. All results are Vitest in node. Not device-verified.

A dist built from these commits is safe to deploy: no stored shape change, no DB_VERSION change, no on-screen word change.

## For the orchestrator

- Mark's List row `bug-pen-huge-grams-on-removed-line-backup-refuses` can close once this lands. The executor has no ArtifactData, so the orchestrator closes it.
- Three adjacent readers were not changed and are reported for triage, none of them verified in the app:
  - `IngredientTable.jsx` keeps its own `parseGramsDraft(...) ?? portion.grams` for the per-line share cell, so a live 309-digit line's share cell may read differently from the row's other figures until the gate refuses Save.
  - The batch record's as-made path (`recordDraft.js` `buildChurnFieldsFromDraft`) keeps what `parseGramsDraft` returns. An as-made Infinity would export as null, which the store check accepts for as-made, so it would read as never touched. Whether the record's own gate refuses such an entry first was not checked.
  - The comment in `app/src/ui/sheetView.js` that repeats `penDraftRows`' fallback wording now omits the finite clause.

## Known Stubs

None.

## Self-Check: PASSED

- app/src/domain/penDraft.js, penDraft.test.js and pen-step-roundtrip.test.js changed as described.
- Commits d356d76c and 2996746f are on the branch.
