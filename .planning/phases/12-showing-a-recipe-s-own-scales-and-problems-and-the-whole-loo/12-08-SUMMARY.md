---
phase: 12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo
plan: 08
subsystem: testing
tags: [playwright-webkit, regression-gate, walk-baseline, gap-closure]
requires:
  - phase: 12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo
    provides: "12-check.sh and its Phase 11 walk step (plan 12-05), the gap in 12-VERIFICATION.md"
provides:
  - "11-walk.mjs drives the current build: all 17 scenarios record on e37db11a and on main; record takes --baseline"
  - "11-walk-before.json re-recorded at e37db11a from a detached worktree: 12 scenarios, 94 snapshots"
  - "12-08-walk-trace.md and 12-08-trace-check.mjs: every difference between the old baseline and e37db11a traced to a named app commit, checked by command"
  - "12-check.sh ends GATE1 PASS"
affects: [12-round-two, 12-check.sh, 11-walk-check.sh]

actuals:
  tokens: 57400
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns:
    - "baseline moves only with a trace: reproduce at the recording commit, record old and new builds, map each DIFF line to one in-range commit"
    - "per-app-tree recordings (94 trees) give the commit that moved each leaf, not a guess from a hunk"

key-files:
  created:
    - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-08-walk-trace.md
    - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-08-trace-check.mjs
  modified:
    - .planning/phases/11-steps-structure-save-and-print/11-walk.mjs
    - .planning/phases/11-steps-structure-save-and-print/11-walk-record-base.sh
    - .planning/phases/11-steps-structure-save-and-print/11-walk-before.json

key-decisions:
  - "D-08-1 (Mark, 2026-11-16, 'All pre-Phase-12 fixes'): the baseline absorbs every post-Phase-11, pre-Phase-12 quick fix (class A one-row textareas, class B the rest), nothing after e37db11a"
  - "A hash DIFF line is attributed to the commit whose change is the last to move that step's hash into its e37db11a value; every earlier mover is a group of its own"
  - "WALK_PATCH defaults to none: 11-07's order patch is part of e37db11a and no longer applies"

patterns-established:
  - "NEUTRAL list in 11-walk-record-base.sh: an app commit after BASE joins it only with a text-included MATCH of BASE against main"

requirements-completed: [TASTE-04, PROOF-01, LOG-01]

duration: 43min
completed: 2026-11-16
status: complete
commits: 3
plan_head_before: d7cd5341e204e62d63edde7e7dc58256afecaaf8
plan_head_after: 37f0a8b931ba3b5e6cf370f29c0e462ddb7aa414
---

# Phase 12 Plan 08: The Phase 11 walk gate Summary

**The Phase 11 walk runs on the current app and its baseline is re-recorded at e37db11a, with all 1870 differences from the old baseline traced to eleven changes in nine named quick-fix commits; 12-check.sh now ends GATE1 PASS.**

All results are Playwright WebKit (playwright-core 1.63.0), device-unverified. No device row was written.

## Performance

- **Duration:** 43 min
- **Started:** 2026-11-16T13:43:00Z (about; first plan commit base d7cd5341 at 08:43 local)
- **Completed:** 2026-11-16T14:27:00Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments

- The walk's selectors now find what the app draws at e37db11a: tag-free field selectors (one-row textareas), `.nb__new textarea`, and the creation controls' current names. No step, expectation, scenario or seed rule was removed; compareResult, diffLeaves and takeSnapshot are byte-unchanged (hashes 6ad53f4475c6e449, bc6a3b813e4cc227, 1d028b77eb6c6537).
- Phase 12 moved nothing the walk sees: the e37db11a recording and the main recording, both with text, compare `MATCH 112 snapshots` (no DIFF, no NEW), covering the seven 261116-80u and 261116-80v app commits.
- The committed baseline reproduces: the walk and record script at 4d3b44f7, run on cf64aa70 with the order patch, print `MATCH 94 snapshots` against the committed file in today's WebKit.
- 1870 DIFF lines between that baseline and e37db11a, each mapped once by `12-08-trace-check.mjs` to eleven groups in nine commits in `cf64aa70..e37db11a` (none a Phase 11 plan commit, class consistent, evidence added by the commit). Last line `DIFF lines: 1870; attributed: 1870; unattributed: 0`; six selftest refusals fire.
- `11-walk-before.json` re-recorded by `11-walk-record-base.sh` from a detached worktree build of e37db11a (BASE=e37db11a, `--baseline`): 12 scenarios, 94 snapshots, methodHash on each. Its diff against the old file is exactly 1870 changed lines, the traced count.
- **12-check.sh ends `GATE1 PASS`** (suite 134 files, 4425 tests passed; probe 26 PASS, print 30, roundtrip 68, pdf 7, sim 7; walk `MATCH 94 snapshots; NEW create-recipe 3; NEW edit-first-version 3; NEW edit-stale 5; NEW create-save-refused 2; NEW edit-kept 5`). Selftest 10 PASS, seedtest 5, normtest 9. 11-walk-check.sh alone prints the same MATCH line.

## Task Commits

1. **Task 1 (tracer): repaired walk, e37db11a and main equal** - `8080e352` (test)
2. **Task 2: reproduction and the traced drift** - `e42dcb17` (docs)
3. **Task 3: baseline re-recorded at e37db11a, GATE1 PASS** - `37f0a8b9` (test)

**Plan metadata:** committed after this file (docs: complete plan).

## Files Created/Modified

- `.planning/phases/11-steps-structure-save-and-print/11-walk.mjs` - current selectors; `record <out> [--keep-text] [--baseline]`
- `.planning/phases/11-steps-structure-save-and-print/11-walk-record-base.sh` - BASE e37db11a, Phase 12 stranger rule with the NEUTRAL list, WALK_PATCH default none, `--baseline`
- `.planning/phases/11-steps-structure-save-and-print/11-walk-before.json` - the re-recorded baseline
- `.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-08-walk-trace.md` - selectors, reproduction, neutrality, drift table, group lines, derived coverage line
- `.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-08-trace-check.mjs` - read-only attribution check with `--selftest`

## Decisions Made

- Followed D-08-1 (Mark): every pre-Phase-12 fix is re-baselined, class A (2026-11-01 one-row textareas: 37a05413, 9ad146c4, d62d123d, 44c71a11) and class B (3e2eb6d4, dcafd03d, c1bf9258, 2d50ac10, c5373fb2).
- How the drift was traced (a method choice the plan left open): the twelve baseline scenarios were recorded, text kept, on all 94 distinct app trees reached by `git log cf64aa70..e37db11a -- app/` and their parents, using a scratch copy of the walk (the committed selectors, a scenario filter, and a regex for the Save button so builds older than 2d50ac10 record). For every DIFF line exactly one non-merge commit moves that leaf into its e37db11a value; merge 7910eb48 only carries c5373fb2. In all 162 hash steps the recording at 4d3b44f7 equals the committed baseline, so none of the drift is Phase 11's.
- A hash line is attributed to the last commit to move that step's hash; the earlier movers (3e2eb6d4, 2d50ac10) are groups of their own.

## Deviations from Plan

None - plan executed exactly as written. (The scratch per-tree recordings and the first runs that failed on stale `.err` files were working method, not plan changes; nothing under app/ was touched.)

## Groups marked "intended no" (for the orchestrator to raise with Mark)

Both are re-baselined under D-08-1. Neither is a change a maker sees; they are how the walk reads a textarea.

- **G8** (9ad146c4, 48 steps): the page's innerText loses one blank line per as-made grams row (14 per record-pen step) because the as-made field is a block-level textarea instead of an inline input. Measured: 281 lines at 9ad146c4's parent, 267 at 9ad146c4 on `record-pen-edit-handlers` / `set-up`.
- **G10** (44c71a11, 9 steps): the typed Done differently line now shows in the method region's textContent, because a textarea's text is its textContent and an input's value is not.

One more worth a glance, marked "intended yes" but with a wrinkle: **G11** (c5373fb2). After Save over this version, focus now rests on the Next version button where it used to land on the version identity heading. The commit's subject names Cancel; the walk step is Save over, the same mechanism (landing once per arrival).

## Issues Encountered

None blocking. A mid-run scratch recording failed on builds older than 2d50ac10 (the walk looks for "Save as new version"); it was fixed in the scratch copy only and all 94 trees recorded.

## Deploy

No app file, store shape, DB_VERSION or store-file-version changed (`git log --name-only --grep='(12-08)' -- app/` prints nothing; app/dist was never written). **Main is safe to deploy.**

## Orchestrator steps (the executor has no ArtifactData)

- Close Mark's List row `bug-p11-low-to-high-scale-centre-mark` on this real GATE1 PASS by 12-05's rule: read the row for its version, read the clock with `date -u +%Y-%m-%dT%H:%M:%S.000Z` just before the write, status done, resolvedAt from that read, reply naming 12-06's base-build probe, 12-01's and 12-02's commits, 261116-80v's amendment (no numbers on a Low to high scale), and the passing probe and print-check lines from this run's 12-check.sh (probe 26 PASS, print 30 PASS). Row `adoajjb9sgzbezmyrt4s` stays open for round two's paper check.
- REQUIREMENTS.md: TASTE-04, PROOF-01 and LOG-01 can be checked once the verifier confirms GATE1 PASS; PROOF-02 stays open for round two.

## Known Stubs

None.

## Threat Flags

None. This plan touches only test harness files under `.planning/`; no endpoint, auth path, file access pattern or schema.

## Next Phase Readiness

12-check.sh is a working regression gate for round two (rerun after Gate 2 lands). A round-two plan that changes a walked screen re-records through `11-walk-record-base.sh`, moving BASE with its own trace, as this plan did.

## Self-Check: PASSED

- Files exist: 12-08-walk-trace.md, 12-08-trace-check.mjs, 11-walk.mjs, 11-walk-record-base.sh, 11-walk-before.json.
- Commits found in history: 8080e352, e42dcb17, 37f0a8b9.
- `git worktree list` lists only the main checkout; no worktree under the scratch folders.
- Acceptance greps for Tasks 1 to 3 re-run after the last commit: all as expected.

---
*Phase: 12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo*
*Completed: 2026-11-16*
