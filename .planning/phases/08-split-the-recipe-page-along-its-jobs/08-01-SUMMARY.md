---
phase: 08-split-the-recipe-page-along-its-jobs
plan: 01
subsystem: ui
tags: [react, hooks, refactor, webkit-walk, vitest, characterization-tests]

requires:
  - phase: 05-split-the-recipe-page
    provides: the 94-snapshot WebKit walk and its 05-walk-before.json baseline
provides:
  - the walk runnable from Phase 8 in one command (08-walk-check.sh), proven to match at the base commit and to load with the npx cache unreachable
  - characterization of onPenOpenChange, the tab title and the StrictMode draft restore on the unsplit page
  - cut 1 of 6: useAnnouncer.js, called once by RecipePage.jsx
  - the shell test's positive job table (NEW_MODULES, unusedImports, jobProblems, JOBS, HOOK_ORDER) for plans 02-05 to extend
affects: [08-02, 08-03, 08-04, 08-05]

actuals:
  tokens: 19200
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns:
    - "A cut = new module + shell edit + one JOBS entry in the shell test, one commit, green on the suite and the walk"
    - "Check functions are proven able to fire by one broken fixture each, asserting exactly one problem with the expected tag"

key-files:
  created:
    - .planning/phases/08-split-the-recipe-page-along-its-jobs/08-walk.mjs
    - .planning/phases/08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs
    - .planning/phases/08-split-the-recipe-page-along-its-jobs/08-walk-check.sh
    - app/src/ui/RecipePage.shellEffects.test.jsx
    - app/src/ui/RecipePage.strictMode.test.jsx
    - app/src/ui/useAnnouncer.js
  modified:
    - app/src/ui/RecipePage.jsx
    - app/src/ui/RecipePage.shell.test.js

key-decisions:
  - "The base walk matches 05-walk-before.json, so no 08-walk-before.json exists and every later compare uses the Phase 5 baseline (D-06)"
  - "The walk resolves PROBE_DIST with path.resolve because TMPDIR ends in a slash on this machine"
  - "The useAnnouncer call is one line, directly after const showingChanges, so the key-link pattern '= useAnnouncer();' matches"

patterns-established:
  - "Shell-test job entry: { name, file, specifier, call, hook, markers, shellLacks, allow } checked by jobProblems with seven tagged checks"
  - "A moved block keeps its comments and bytes; the shell keeps calling announce( and the three raw setters under the same names"

requirements-completed: []
requirements-advanced: [EDIT-05, EDIT-06]  # shared with plans 02-05; REQUIREMENTS.md deliberately not touched by this plan

duration: 15min
completed: 2026-10-17
status: complete
commits: 3
plan_head_before: 78e962d8c988d735cf5f3c505e049b480e77ad6b
plan_head_after: 87ed10ef160caef234d48c0598a7e04cf42f83d4
---

# Phase 8 Plan 01: Walk, characterization and the announcer cut Summary

**The 94-snapshot WebKit walk now runs from Phase 8 and matches the Phase 5 baseline at the base commit and after cut 1; the announcer lives in `useAnnouncer.js` behind a shell-test job table whose seven checks are each shown to fire.**

Base commit: 78e962d8c988d735cf5f3c505e049b480e77ad6b

## Performance

- **Duration:** about 15 min for this executor (Task 1's three files were drafted by an earlier executor that could not commit; this run verified them and committed)
- **Completed:** 2026-10-17
- **Tasks:** 3
- **Files modified:** 8 (6 created, 2 modified), 1,626 insertions and 61 deletions across the three task commits

## Accomplishments

- The walk runs in one command, `sh .planning/phases/08-split-the-recipe-page-along-its-jobs/08-walk-check.sh`, builds into a scratch directory (never `app/dist`) and ends `MATCH 94 snapshots`.
- The walk body from `const FIXED_ISO` onward is byte-identical to `05-walk.mjs`; the server is the 03.5 harness's server code with no Playwright import; playwright-core loads only through `PLAYWRIGHT_CORE`.
- `onPenOpenChange`, the tab title and the StrictMode restore-once are pinned on the unsplit page, and the StrictMode Save-over test is shown to fail without the started-ref guard.
- `useAnnouncer.js` owns the three status texts, their three timer refs and `announce`; `RecipePage.jsx` calls it once, first among its hooks, above the early returns, and went from 1,837 to 1,781 lines.
- The shell test gained its positive job table and a fixture test with seven broken fixtures and one clean one.

## Walk evidence

- Baseline used: `.planning/milestones/v1.1-phases/05-split-the-recipe-page/05-walk-before.json` (no `08-walk-before.json` was needed or committed; the D-06 fallback did not run).
- Base run 1 (at 78e962d): last line `MATCH 94 snapshots`.
- Base run 2 (determinism): last line `MATCH 94 snapshots`.
- No-cache run (npx cache made to throw by a `node --import` resolve hook, `PLAYWRIGHT_CORE` on a scratch `cp -R` copy of playwright-core 1.63.0): `RECORDED … 94 snapshots`, then `MATCH 94 snapshots`.
- Blocked-cache run (same hook, no `PLAYWRIGHT_CORE`): exit non-zero, stderr holds `npx cache blocked`; script printed `cache blocked as expected`.
- Missing path (`PLAYWRIGHT_CORE=/nonexistent`): `FAIL playwright-core not found at /nonexistent: refill the npx cache with …`, exit 1.
- Compare teeth (scratch copy with one `pageStatus` leaf edited): `DIFF version-pen-kept-draft / typed / snapshot.pageStatus: before="" after=" EDITED"`, exit 1.
- Post-cut-1 run (at 87ed10e): last line `MATCH 94 snapshots`.
- Nothing under `~/.npm` was moved or written; `git status --porcelain app/` was empty after Task 1.

## Test totals

| Point | Test files | Tests |
|-------|-----------|-------|
| Base (e097454 / 78e962d) | 91 | 2932 |
| After Task 2 | 93 | 2936 |
| After Task 3 | 93 | 2949 |

Task 3 added 13 cases (one each in three existing describes, one job case, one hook-order case, eight fixture cases). No test was deleted, skipped or weakened; `git diff` of `RecipePage.shell.test.js` for Task 3 shows no removed `expect(`, `it(`, `it.each(` or `describe(` line (it shows no removed line at all).

## Mutation check (Task 2)

Deleting `if (draftRestoreStartedRef.current) return;` from `RecipePage.jsx` (working tree only, restored with `git checkout -- app/src/ui/RecipePage.jsx`) turned the Save-over test red:

```
FAIL  src/ui/RecipePage.strictMode.test.jsx > a kept plan draft restores once under React.StrictMode > Save over this version reads the draft zero more times
AssertionError: expected "vi.fn()" to be called 1 times, but got 2 times
 ❯ src/ui/RecipePage.strictMode.test.jsx:191:28
    expect(store.getDraft).toHaveBeenCalledTimes(1);
```

The restore-once test stayed green under the mutation, so the Save-over test is the one that carries the guard.

## Task Commits

1. **Task 1 (tracer): the walk runs from this phase and matches at the base commit** - `356fc9b80d42f7ec5c06ce1b0b281627d8e8ac12` (test)
2. **Task 2: pin the shell effects and the StrictMode restore** - `6d915639b6b434fff4d8db1d79e44966013bb869` (test)
3. **Task 3: cut 1, the announcer moves into useAnnouncer** - `87ed10ef160caef234d48c0598a7e04cf42f83d4` (refactor)

## Files Created/Modified

- `.planning/phases/08-split-the-recipe-page-along-its-jobs/08-walk.mjs` - the 94-snapshot WebKit walk, record and compare, `walk: '05'` kept
- `.planning/phases/08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs` - static servers on ephemeral 127.0.0.1 ports, node built-ins only; exports `REPO_ROOT`, `startServers`
- `.planning/phases/08-split-the-recipe-page-along-its-jobs/08-walk-check.sh` - build to scratch, record, pick baseline, compare
- `app/src/ui/RecipePage.shellEffects.test.jsx` - onPenOpenChange and tab-title characterization
- `app/src/ui/RecipePage.strictMode.test.jsx` - page-level StrictMode restore-once and Save-over checks
- `app/src/ui/useAnnouncer.js` - `useAnnouncer()` returning `formStatus, setFormStatus, tastingStatus, setTastingStatus, recordStatus, setRecordStatus, announce`
- `app/src/ui/RecipePage.jsx` - state, refs and `announce` removed; one `useAnnouncer()` call; one import
- `app/src/ui/RecipePage.shell.test.js` - added `NEW_MODULES`, `unusedImports`, `jobProblems`, `JOBS`, `HOOK_ORDER` and four describes' worth of new cases

## Decisions Made

- No `08-walk-before.json`: the base build already matches the Phase 5 baseline twice (D-06).
- `jobProblems` takes sources with comments already stripped, and `JOBS` entries carry `file` (read by the test) and `specifier` (what the shell imports) separately.
- The fixture test is a single `it.each` of eight rows; the clean row's tag is `null`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] TMPDIR ends in a slash, so the walk server answered every request with 404**
- **Found during:** Task 1 (found by the earlier executor, carried here)
- **Issue:** `$TMPDIR` is `/var/folders/…/T/`, so `PROBE_DIST="$TMPDIR/sprinkles-08/dist"` contains `//`. The static server compares paths with `filePath.startsWith(root)`, which failed, every request returned 404 and the walk timed out on `.shell`.
- **Fix:** In `08-walk.mjs`, `DIST` is `path.resolve(process.env.PROBE_DIST ?? path.join(REPO_ROOT, 'app', 'dist'))`, placed above `const FIXED_ISO` with a comment. Everything from `const FIXED_ISO` on stays byte-identical to `05-walk.mjs`; the server is byte-identical to the harness's.
- **Files modified:** `.planning/phases/08-split-the-recipe-page-along-its-jobs/08-walk.mjs`
- **Verification:** the byte-identity check prints `walk body identical; server is Playwright-free`; both base runs end `MATCH 94 snapshots`.
- **Commit:** 356fc9b

**2. [Rule 1 - Bug] One comment in RecipePage.jsx said "formStatus below" after the move**
- **Found during:** Task 3
- **Issue:** the `useRecordDraft` comment says "formStatus below is the open pen's own form-status live region text"; after the cut `formStatus` is declared above it.
- **Fix:** changed "below" to "above" in that one comment; no code changed.
- **Files modified:** `app/src/ui/RecipePage.jsx`
- **Commit:** 87ed10e

**Total deviations:** 2 auto-fixed (1 blocking, 1 comment accuracy). **Impact:** none on behaviour; the walk and suite are green.

### Environment note (not a plan deviation)

The first attempt to commit Task 1 failed on the protected-branch guard. The orchestrator set `git.allow_default_branch_commits: true` in `.planning/config.json` (left uncommitted for the orchestrator, as instructed); all commits here are on `main`.

## Authentication Gates

None.

## Known Stubs

None.

## Threat Flags

None. The walk serves a scratch build on 127.0.0.1 and aborts other hosts (T-08-01); no new network endpoint, auth path or schema was added. Announced strings stay React text children; the shell test's "no dangerouslySetInnerHTML" case now covers `useAnnouncer.js` (T-08-03). The scratch playwright-core copy came from the same npx-cache directory and `~/.npm` was never written (T-08-16).

## Issues Encountered

None remaining.

## Next Phase Readiness

Plan 08-02 can start from `87ed10e`. For plans 02-05:

- Base commit for the test audit: `78e962d8c988d735cf5f3c505e049b480e77ad6b` (the line above).
- Each later cut adds one entry to `JOBS`, extends `NEW_MODULES` and `HOOK_ORDER`, and keeps every base case title and body.
- `RecipePage.jsx` is now 1,781 lines. The hook-call line for the announcer is line 169; `useRecordDraft()` follows it.
- Use `sh .planning/phases/08-split-the-recipe-page-along-its-jobs/08-walk-check.sh` as the walk check; it needs no `08-walk-before.json`.

## Self-Check: PASSED

- Files exist: `08-walk.mjs`, `08-walk-server.mjs`, `08-walk-check.sh`, `RecipePage.shellEffects.test.jsx`, `RecipePage.strictMode.test.jsx`, `useAnnouncer.js` (all present on disk).
- Commits are ancestors of HEAD: 356fc9b, 6d91563, 87ed10e.
- `git rev-list --count 78e962d..87ed10e` is 3, matching `commits: 3`.
- Full suite 93 files, 2949 tests, 0 failed; walk check ends `MATCH 94 snapshots`.
