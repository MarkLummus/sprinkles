---
phase: quick-261027-9zn
plan: 01
quick_id: 261027-9zn
subsystem: domain/lineage, phase-11 board specs
tags: [version-identity, board-specs, decide-p11-default-version-name-repeats]
status: complete
requirements: [decide-p11-default-version-name-repeats]
key-files:
  modified:
    - app/src/domain/lineage.js
    - app/src/domain/lineage.test.js
    - .planning/phases/11-steps-structure-save-and-print/11-board-save.mjs
    - .planning/phases/11-steps-structure-save-and-print/11-board-first-version.mjs
    - .planning/phases/11-steps-structure-save-and-print/11-board-selftest.mjs
actuals:
  tasks: 2
  commits: 1
plan_head_before: 2bc1e866946ac0e720a29819fcce6b97fe5b08d8
plan_head_after: 107b649f
completed: 2026-10-27
---

# Quick 261027-9zn: a default Version name reads once

`versionIdentity` prints the ordinal alone ("Version 1") when the label, trimmed and case-folded, equals the ordinal's own words; any other label keeps the long form, untrimmed. The four board panels that compared around the old stutter (vC1, fA1, fC1, vC1-seeded) compare the identity line itself again.

Commit: `107b649f` (one commit holding all five files, as Task 2 step 5 specifies; Task 1 produced no separate commit).

## RED and green (Task 1)

Base at c073701e: 130 files, 4229 tests, all passed.

After adding the four tests (before the change), `src/domain/lineage.test.js` showed 3 failed, 104 passed (107):

- equal label: `expected 'Version 1 · Version 1' to be 'Version 1'`
- spaces: `expected 'Version 1 ·   Version 1  ' to be 'Version 1'`
- lowercase: `expected 'Version 1 · version 1' to be 'Version 1'`
- the different-label test ('Version 2' at position 1 reads 'Version 1 · Version 2') passed, as planned.

After the change: 107 passed (107).

## Counts

- Full suite after: 130 files (unchanged), 4233 tests (N + 4), 0 failed.
- Five Phase 11 specs with --selftest: **1092 PASS, 0 FAIL** (still equals the last recorded 1092). PASS selftest lines in that run: 25.
- 11-board-selftest.mjs with --selftest: **19 PASS, 0 FAIL**. PASS selftest lines: 5.
- Identity PASS lines: `save.html vC1`, `first-version.html fA1`, `first-version.html fC1` (five-spec run), `save.html vC1-seeded` (selftest run), each `.notebook-version__identity[0] text`.
- Refusal lines present: `vC1-unseeded refused: missing`, `vC1-blind refused: selftest-blind`, `fC1~fA1 refused: present`.
- Save spec alone (Task 1 step 6): 39 PASS, 0 FAIL.

## Caller audit

Read only; none changed. Each prints versionIdentity's return as it is and none joins version.versionLabel beside it:

1. VersionRow.jsx 343: h2 text `versionIdentity(ordered, version)`, then the ` · Latest` span.
2. PrintSheet.jsx 85 into PrintSheetPages.jsx 90: `footText: [version.sheetTitle, identity, version.sheetCode].join(' · ')`.
3. RecipeList.jsx 164: `p.home__lead-meta`.
4. historyRail.js 59: the rail node's `name`. Its node name also reads once now (intended, route-recipe.md section 6); the `· Latest` there is in `stateWords`, separate.

## Deviations from Plan

None - plan executed as written. Line numbers in 11-board-save.mjs's elements block sat a few lines below the plan's quoted range; content matched.

## For the orchestrator

- Close Mark's List row `decide-p11-default-version-name-repeats` (status done, `resolvedAt` from the clock, a one-line reply naming the rule - label trimmed equals the ordinal's words, any case, prints once - and commit `107b649f`, or its merged hash).
- Phase 11 docs (11-01, 11-09, 11-10, 11-12 and 11-13 SUMMARYs, 11-UAT.md, 11-UI-REVIEW.md, 11-VERIFICATION.md) still describe the departure as it stood; they are history and were not edited.
- Mark's 4173 preview serves app/dist, which this task never rebuilt (scratch build only, to the TMPDIR sprinkles-11/dist-quick), so the change shows on his iPad only after `npm --prefix app run build && npm --prefix app run preview -- --host`.

## Known Stubs

None.

## Self-Check: PASSED

All five files in HEAD's commit (`git show --name-only HEAD`); commit 107b649f exists on the branch.
