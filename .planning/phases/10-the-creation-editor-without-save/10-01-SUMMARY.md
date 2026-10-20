---
phase: 10-the-creation-editor-without-save
plan: 01
subsystem: testing
tags: [playwright, webkit, walk, board-conformance, harness]

requires:
  - phase: 09-the-library-and-the-stored-shapes-plus-the-two-places
    provides: 09-walk.mjs record body, 09-walk-record-base.sh, 09-places-check.mjs plumbing
  - phase: 08-split-the-recipe-page-along-its-jobs
    provides: 08-walk-server.mjs static server
provides:
  - 10-walk-before.json, the Phase 10 baseline (12 scenarios, 94 snapshots) recorded from BASE ec44fa72
  - 10-walk.mjs, a strict walk whose compare allows no difference and refuses repeated names
  - 10-walk-check.sh, one command that builds to a per-checkout scratch dir, records and compares
  - 10-board-check.mjs, the side-by-side WebKit engine for full-page and anchored cropped panels
  - 10-board-012.mjs and 10-board-013-anchors.mjs, the engine's self-test specs
affects: [10-02, 10-03, 10-04, 10-05, 10-06, 10-07, 10-08, 10-09, 10-10, 10-11, 10-12]

actuals:
  tokens: 22000
  tasks: 3
  commits: 3

plan_head_before: 40eede750bbd8282d18fbe1861cf9931ec340e07
commits: 3
plan_head_after: acb5ddb9b42dc699b088d203ce65defd050dbaaf

tech-stack:
  added: []
  patterns:
    - "Strict walk compare: every leaf equal, no allowance machinery, a repeated scenario or step name is a DIFF"
    - "Board engine: a panel is full page (root holds .shell) or cropped (anchor found once on each side, boxes from the anchor, matches inside a scope)"
    - "Declared absence: absent is an expected-zero count on both sides; an elements selector the board draws none of is a FAIL"
    - "Frame { from, to }: the evidence band, compared within 1 px in every run, separate from the measurement scope"

key-files:
  created:
    - .planning/phases/10-the-creation-editor-without-save/10-walk.mjs
    - .planning/phases/10-the-creation-editor-without-save/10-walk-record-base.sh
    - .planning/phases/10-the-creation-editor-without-save/10-walk-check.sh
    - .planning/phases/10-the-creation-editor-without-save/10-walk-before.json
    - .planning/phases/10-the-creation-editor-without-save/10-board-check.mjs
    - .planning/phases/10-the-creation-editor-without-save/10-board-012.mjs
    - .planning/phases/10-the-creation-editor-without-save/10-board-013-anchors.mjs
  modified: []

key-decisions:
  - "The board context uses hasTouch true, like the app context, so both sides read the same coarse-pointer rules; pn1 and pn2 matched the built Notebook element for element with it"
  - "A draft written by the engine takes recipeId 'vanilla', versionId 'vanilla-v1' and name 'Vanilla' unless the panel's draft names its own; the boards draw Vanilla"
  - "Stand-in self-tests inject the 1 px font style scoped to the against panel's root (.p4-win.<id> *), so a board that sits on the same page as its stand-in cannot be changed on both sides at once"

patterns-established:
  - "A spec module is all a later plan needs: board file, panels with route, library, elements, absent, anchor, scope, frame"

requirements-completed: [MAKE-11]

duration: 40min
completed: 2026-10-20
status: complete
---

# Phase 10 Plan 01: The strict walk and the board engine Summary

**A baseline walk recorded from BASE ec44fa72 with a compare that allows nothing, and a WebKit engine that holds a built route or a stand-in panel to a sketch board panel element by element, full page or anchored crop.**

## Performance

- **Duration:** about 40 min
- **Completed:** 2026-10-20
- **Tasks:** 3 (one tracer, two auto)
- **Files created:** 7, none under app/

## Accomplishments

- `10-walk-before.json` holds 12 scenarios and 94 snapshots, recorded from a detached worktree build of ec44fa72. A second recording of the same dist compares as `MATCH 94 snapshots`, so the recording is deterministic.
- `10-walk.mjs`'s record body (from the playwright-core line through the RECORDED line) is byte-identical to `09-walk.mjs`'s, proven by a node comparison. The seven app/src imports and all of Phase 9's allowance policy are gone (0 references to app/src/data or app/src/domain).
- `compare` prints `MATCH <n> snapshots` or one DIFF per differing leaf, naming scenario, step and path, and a repeated scenario or step name is its own DIFF (`(duplicate)`).
- `selftest` prints five `PASS selftest` lines: the real pair, then a changed store leaf (`stores.recipes[0].name`), a changed snapshot leaf (`snapshot.pageStatus`), an added store key (`stores.versions[0].doctoredField`) and a repeated step (`(duplicate) after: step typed`), each refused at the doctored path.
- `10-walk-check.sh` builds into `$TMPDIR/sprinkles-10/walk-<checkout dir name>`, records, compares, and ends `MATCH 94 snapshots` on the unchanged tree.
- `10-board-check.mjs` reads each panel's kind from the board, measures a full page from the page origin and the document, measures a crop from its anchor inside its scope, declares absences, compares frames, and writes evidence pairs. The three self-test runs (below) print 130 + 280 lines of comparison with no FAIL.
- Proven against sketch 012's Notebook board and the unchanged built `/notebook` (pn1 at 1366, pn2 at 393): every comparison PASS, and each re-run with every font at 1 px produced a FAIL (`PASS selftest pn1`, `PASS selftest pn2`). No drift between sketch 012 and the built place was found, so no element was dropped from the spec.
- Proven on cropped 013 panels, each beside the full-page panel that draws the same region: eC1~eB1 (Sheet, 1480 tall on both sides), tB1~eB1 (Style), tA1~eA1 (Style with Clear declared absent on both) and sB1~eB1 (Scales with its frame, both bands 350 by 930). Seven negative panels are refused for what they are: eC1-unanchored (anchor), eC2~eB1 (count), eC2~eC1 (box), eB1~eA1 (missing), tA1-undeclared (undeclared), tA1~eB1 (present) and sB1~eA1 (frame).
- The combined run `10-board-012.mjs 10-board-013-anchors.mjs --selftest` printed 13 `PASS selftest` lines and `280 PASS, 0 FAIL` (with `--evidence`; 150 and 130 PASS when run as two separate commands), exit 0. `--evidence` wrote six app/board pairs, each pair byte-identical, plus a README.

## Task Commits

1. **Task 1 (tracer): strict before-walk at BASE** - `4c2362cd` (test)
2. **Task 2: one-command check and selftest** - `eebaa22c` (test)
3. **Task 3: board engine and its two self-test specs** - `acb5ddb9` (test)

## Verification Run

- Task 1: `10-walk-record-base.sh` then a second record of the same dist and `compare` -> `RECORDED ... 94 snapshots`, `MATCH 94 snapshots`.
- Task 2: `selftest` -> 5 PASS selftest lines; `10-walk-check.sh` -> `MATCH 94 snapshots`.
- Task 3: build to `$TMPDIR/sprinkles-10/dist-01`, then the engine over both specs with `--selftest` -> `PASS selftest` for pn1, pn2, eC1~eB1, tB1~eB1, tA1~eA1, sB1~eB1, the seven `refused:` lines, the `tA1~eA1 .batch-row__head-acts .text-control absent` line and the `sB1~eB1 frame` line.
- No change under app/: `git diff --stat ec44fa72 -- app/` is empty. Nothing writes app/dist and nothing starts Vite (the engine reads PROBE_DIST only).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] The worktree had no app/node_modules**
- **Found during:** Task 1 (the record script symlinks `$ROOT/app/node_modules` into its base worktree)
- **Issue:** a fresh agent worktree holds no installed dependencies, so `npm run build` and the base worktree's symlink target would not exist.
- **Fix:** an untracked symlink `app/node_modules` -> the main checkout's `app/node_modules` (already ignored by `app/.gitignore`). No package was installed.
- **Files modified:** none tracked.

**2. [Verification note] Two acceptance greps cannot match as written on this machine**
- `grep -c 'walk-$(basename'` and `grep -c -- '--outDir "$SCRATCH/dist" --emptyOutDir'` print 0 under macOS BSD grep (the `$` and `(` read as regex operators). The lines are present at 10-walk-check.sh lines 17 and 24; `grep -cF` prints 1 for each. The plan text is unchanged.

**3. [Design choice within the plan] hasTouch on the board context**
- The plan names a coarse pointer for the app side; the board context in 09-places-check.mjs had none. I gave the board context `hasTouch: true` too, so both sides read the same media rules. pn1 and pn2 pass either way in practice, since the boards' CSS is scoped static rules.

Otherwise the plan executed as written. No FIX ATTEMPT LIMIT was reached.

## Authentication Gates

None.

## Issues Encountered

- The sandbox rejects heredocs and compound git commands in Bash for this worktree; files were written with the Write and Edit tools and git steps were split into single commands.

## Known Stubs

None.

## Threat Flags

None. No new network endpoint, auth path or file access outside the plan's threat model: both harnesses serve the build on an ephemeral 127.0.0.1 port, abort every other host (board pages: file: only), and write only under `$TMPDIR/sprinkles-10` and the phase directory (T-10-01, T-10-02, T-10-03).

## Notes for the Orchestrator and Later Plans

- A later plan that runs `10-walk-check.sh` in an agent worktree needs `app/node_modules` there (a symlink to the main checkout's is enough).
- The panel `draft` field is laid over `blankCreateDraft({ recipeId: 'vanilla', versionId: 'vanilla-v1', name: 'Vanilla' })` unless it names its own recipeId, versionId or name. The `/notebook/new` arrival has not been exercised here (the route does not exist at BASE); plan 10-03 is the first to need it.
- Mark's List: no row needed; nothing in this plan leaves Mark a decision or a check.

## Self-Check: PASSED

- FOUND: 10-walk.mjs, 10-walk-record-base.sh, 10-walk-check.sh, 10-walk-before.json, 10-board-check.mjs, 10-board-012.mjs, 10-board-013-anchors.mjs under `.planning/phases/10-the-creation-editor-without-save/`
- FOUND commits: 4c2362cd, eebaa22c, acb5ddb9
