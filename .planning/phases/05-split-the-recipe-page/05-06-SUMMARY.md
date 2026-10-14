---
phase: 05-split-the-recipe-page
plan: 06
subsystem: testing
tags: [playwright, webkit, vitest, source-text-test, refactor-proof]

requires:
  - phase: 05-split-the-recipe-page
    provides: "05-walk.mjs and 05-walk-before.json (Plan 01); usePenDraft, useRecordDraft and the domain modules (Plans 02 to 05)"
provides:
  - "05-walk-after.json: 94 snapshots from the final build, MATCH against 05-walk-before.json"
  - "app/src/ui/RecipePage.shell.test.js: node source-text proof of D-12, the one-place resets, domain purity, hooks that stop at the draft, the route shell's shape, and text never markup"
affects: [phase 5 verification]

requirements-completed: [EDIT-01, EDIT-02, EDIT-03, EDIT-04]

plan_head_before: 0a841d380cca88cbea9b313b6e22a27e5cf6f526
plan_head_after: 35be26b3f82a2f4d753081b34a92c9139aa988ad

actuals:
  tokens: 1500     # chars/4 over RecipePage.shell.test.js; the generated 05-walk-after.json (10.2 MB) is excluded
  tasks: 2
  commits: 2       # measured: git rev-list --count 0a841d3..HEAD, before this SUMMARY's own commit

tech-stack:
  added: []
  patterns:
    - "Source-text proof: read the file, strip block and line comments, match with whole-word anchoring, in a node test with no docblock"

key-files:
  created:
    - .planning/phases/05-split-the-recipe-page/05-walk-after.json
    - app/src/ui/RecipePage.shell.test.js
  modified: []

key-decisions:
  - "05-walk-after.json is committed as the plan and the dispatch name it, although 05-01-SUMMARY advised keeping it in scratch (10.2 MB)."

coverage:
  - id: D1
    description: "The built app reads exactly as before: same page text, statuses, marked fields, focus, open pens, saved versions and batches, and kept drafts after a reload"
    requirement: EDIT-04
    verification:
      - kind: other
        ref: "node 05-walk.mjs compare 05-walk-before.json 05-walk-after.json: MATCH 94 snapshots; a second record run compares MATCH with the after file"
        status: pass
    human_judgment: false
  - id: D2
    description: "RecipePage.jsx has no direct draft setter (D-12), each reset is written once, the domain modules import only siblings, the hooks import only react and the domain, and the page declares only joinNames, PageLoadFailed, RecipeNotFound and RecipePage"
    requirement: EDIT-01
    verification:
      - kind: unit
        ref: "app/src/ui/RecipePage.shell.test.js (24 tests)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Existing tests changed only inside their import blocks across the phase; no test deleted or weakened; no dependency added"
    requirement: EDIT-04
    verification:
      - kind: other
        ref: "node check against 4f1f98f: no hunk past the first describe in RecipePage.test.jsx, RecipePage.drafts.test.jsx, BatchRow.test.jsx; it( counts 108, 38, 206 unchanged; git diff --quiet 4f1f98f on package.json, package-lock.json, draft.js, draft.test.js"
        status: pass
    human_judgment: false

duration: ~12min
completed: 2026-10-14
status: complete
---

# Phase 5 Plan 06: The after walk and the route shell proof Summary

**The final build's WebKit walk compares MATCH (94 snapshots) with the baseline recorded before any code moved, and a node source test pins RecipePage.jsx as a route shell with no draft setter, one-place resets and pure domain modules**

## Performance

- **Duration:** about 12 min
- **Completed:** 2026-10-14T11:37Z
- **Tasks:** 2 (one tracer, one auto)
- **Files:** 2 created, none modified
- **Suite:** 84 files, 2672 tests, all passing (baseline entering the plan was 83 files, 2648; this plan adds 1 file and 24 tests)

## Accomplishments

- The tracer: `npm --prefix app test` (83 files, 2648 tests), then a build to a scratch outDir (not `app/dist`), then `record` to `05-walk-after.json` (94 snapshots), then `compare 05-walk-before.json 05-walk-after.json` printed `MATCH 94 snapshots`. A second `record` to a scratch path compared `MATCH 94 snapshots` with the after file, so the after run is as deterministic as the baseline.
- No DIFF was found, so no fix was needed and neither JSON was touched. The baseline still has exactly one commit (`ba812fa`, Plan 01).
- `git log 4f1f98f..HEAD -- app/` lists only Phase 5 commits (05-02 to 05-05); no Phase 6 commit touched `app/`, so no DIFF could have come from outside the split.
- `RecipePage.shell.test.js` (node, first line is an import, no docblock) has seven describes: D-12 (five names, seven other hook setters, and an anchoring check that matches `setDraft(` and `setBlockedTarget(null)` but not `setDraftRestoreDone(true)` or `setDrafts(result)`); the two hooks called once each above `if (loadFailed) return`; one `setBlockedMessage(null)` and one `setBlockedTarget(null)` in usePenDraft.js and one `setBlockedDateMessage(null)` in useRecordDraft.js; domain purity (penDraft.js and recordDraft.js import only `./name.js`; their tests carry no `@vitest-environment`); the hooks import only `react` and `../domain/`, and neither mentions `repository`; the route shell (exactly four module-level functions, exactly two exports, `repository` still imported, no unused import); and no `dangerouslySetInnerHTML` in the six files. It passed on the code as it stood, with no code change.

## Task Commits

1. **Task 1 (tracer): the after walk from the final build to a MATCH with the baseline** - `7611501` (test)
2. **Task 2: the route shell's source proof** - `35be26b` (test)

**Plan metadata:** committed after this file (docs: complete plan)

The tracer gate: its `<verify>` is automated-only, so it was re-run end to end and passed before Task 2 started. The walk was not re-run after Task 2 because Task 2 changed no code under `app/` apart from adding the test file.

## Files Created/Modified

- `.planning/phases/05-split-the-recipe-page/05-walk-after.json` - the after observations and store dumps (10.2 MB, committed because the plan lists it as an output)
- `app/src/ui/RecipePage.shell.test.js` - the source-text proof

## Decisions Made

- Committed `05-walk-after.json` despite its size, following this plan and the dispatch over the Plan 01 advice to keep it in scratch.
- The unused-import check counts whole-word occurrences in the comment-stripped text and requires at least two per imported name (one for the import, one for a use), as the plan specifies. It handles `a as b` by checking the local name.

## Deviations from Plan

None - plan executed exactly as written.

Notes that are not deviations:

- The sandbox rejects compound commands in a worktree, so the plan's single `&&` verify chain ran as separate commands (test, build, record, compare, repeat record, compare) with literal scratch paths under the session scratchpad. The same checks, the same results.
- The fresh worktree had no `app/node_modules`; it was copied from the main checkout with `cp -Rc`. No package was installed; `app/package.json` and `app/package-lock.json` are unchanged (T-05-SC).
- The acceptance check that inspects `git` from inside `node -e` is rejected by the sandbox; the same script ran from a file in the scratchpad and printed ok for all three test files.

## Flagged prohibitions

- **No change to what a stored record or a kept draft holds (EDIT-04, safety).** The walk dumps the versions, batches, recipes and drafts stores at scenario ends and after reloads, and all of them compare MATCH, including the three kept-draft scenarios (version pen, record pen, Correct pen). This covers the draft payload shape, since `draftMatchesVersion` would otherwise have deleted a kept draft on reload.
- **No tidying of behaviour the maker meets (EDIT-04, values).** The D-13 observations are in the walk: the D-05 inconsistency (only a version-line or headnote edit clears the page status and the announcer), the own-field error clear (WR-03), and the blocked-churn-date and tasting scenarios. All compare MATCH. The tasting-body-only undo retirement has no click path (05-01 deviation); the Plan 04 `isTastingBodyField` tests and the Plan 05 hook tests cover it in node.
- **No new screen, control or caller (EDIT-02, product-scope).** No file under `app/` other than a new test file changed in this plan. The shell test pins that RecipePage.jsx declares no new function and exports only `RecipeNotFound` and `RecipePage`. Across the phase no dependency was added.

Assumption carried (EDIT-04, unclassified): "the maker sees no change" was judged in Playwright WebKit at 1366 wide with a fine pointer, plus the suite. The 393 iPhone width, a coarse pointer and the real devices were not walked. The split changes no markup, CSS or token. No row for Mark (D-11).

## Issues Encountered

None.

## Known Stubs

None.

## Threat Flags

None. T-05-11 (tampering with saved records): mitigated, the store dumps compare MATCH. T-05-12 (markup injection): mitigated, the shell test asserts no `dangerouslySetInnerHTML` in the six files. T-05-SC: no package installed.

## Next Phase Readiness

All five Phase 5 success criteria have a named check: SC1 and SC4 by the shell test and Plans 02 and 04, SC2 and SC3 by the shell test and Plans 03 and 05, SC5 by the walk. Ready for phase verification.

## Self-Check: PASSED

- FOUND: .planning/phases/05-split-the-recipe-page/05-walk-after.json, app/src/ui/RecipePage.shell.test.js
- FOUND: 7611501, 35be26b (both ancestors of HEAD)
- `npm --prefix app test`: 84 files, 2672 tests passed; walk compare: MATCH 94 snapshots; repeat compare: MATCH 94 snapshots
