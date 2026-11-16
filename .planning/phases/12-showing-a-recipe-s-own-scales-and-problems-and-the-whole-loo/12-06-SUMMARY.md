---
phase: 12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo
plan: 06
subsystem: testing
tags: [playwright, webkit, probe, harness, own-scales]
requires: []
provides:
  - "12-cases.mjs: sketch 015 cases two, one, none and worst, plus inject and arrive, shared by every Phase 12 harness"
  - "12-stops-probe.mjs: modes report and check, facets pen, reading, editor, on a built app in WebKit"
  - "the bug row's steps reproduced on a build of the base commit e37db11a"
affects: [12-01, 12-02, 12-04, 12-05]
tech-stack:
  added: []
  patterns: ["probe reads PROBE_DIST and never builds", "each scale read inside its own .axis-mark"]
key-files:
  created:
    - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-cases.mjs
    - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-stops-probe.mjs
  modified: []
key-decisions:
  - "The probe requires PROBE_DIST (no default), so it can never fall back to serving app/dist"
  - "The New recipe entry's name field is a textarea (not an input) in the built app; the probe uses .nb__new textarea"
requirements-completed: [TASTE-04]
commits: 2
plan_head_before: e37db11a6f808f36d20c808a2812608557c22c28
plan_head_after: df24ded6
actuals:
  tokens: 14000
  tasks: 2
  commits: 2
duration: 25 min
completed: 2026-11-16
status: complete
---

# Phase 12 Plan 06: Stops probe and shared example cases Summary

**A WebKit stops probe (report and check; pen, reading and editor facets) over a shared 12-cases.mjs, with the bug row's steps reproduced on a build of the base commit where every facet fails.**

## Accomplishments

- `12-cases.mjs`: CASES `two`, `one`, `none` as `p12-capture.mjs` defines them, plus `worst` (long scale names, long end words, long problem words, `marks: {}`, `ticks: []`); `inject` is a plain function with no imports or closures that writes only the page's own IndexedDB; `arrive(page, appUrl, caseKey)` loads the route, waits for `.notebook-log`, injects and loads again.
- `12-stops-probe.mjs`: reads the build from `PROBE_DIST` (no default), serves it through `startServers({ appRoot })` on 127.0.0.1, aborts every other request, WebKit at 1366 by 1024 with touch and a fixed clock. `report` prints `REPORT <facet> <fact>`; `check` prints `PASS`/`FAIL` and exits 1 on any FAIL. `EDITOR_STOPS` is one named constant, so a veto of A1 is a one-line edit.
- The probe can fail: on the base build `check pen reading editor` exits 1 with a FAIL for each facet.

## What the bug row's steps showed on the base build

Build: the base commit `e37db11a6f808f36d20c808a2812608557c22c28` (no `(12-01)` commit exists in this checkout, so this checkout's own app was built to a scratch folder with `npm --prefix app run build -- --outDir "$TMPDIR/sprinkles-12/dist-base-06" --emptyOutDir`; app/dist was never touched, no base worktree was needed).

`report pen reading editor` (verbatim):

```
REPORT pen Coffee flavour anchors: ["faint","right","strong"]
REPORT pen Coffee flavour stop names: ["1: faint","2: leaning faint","3: right","4: leaning strong","5: strong"]
REPORT pen Body anchors: ["thin","right","heavy"]
REPORT pen Body stop names: ["1: thin","2: leaning thin","3: right","4: leaning heavy","5: heavy"]
REPORT reading case two cell Sweetness: more (4)
REPORT reading case two cell Body: heavy (4)
REPORT reading case two cell Coffee flavour: faint (2)
REPORT reading case one cell Sweetness: more (4)
REPORT reading case one cell Mint: strong (5)
REPORT editor .mk-stops: "faint to strong"
REPORT editor word right in "Right in the middle" (class "segmented__option", inside a Kind option: true)
```

(The full report also lists the Tempering, Temperature, Melt test and Melt style cells for both cases; they are not about scales.)

`check pen reading editor` on the base build exits 1:

```
FAIL pen Coffee flavour anchors: got ["faint","right","strong"], want ["faint","strong"]
FAIL pen Coffee flavour stop names: got ["1: faint","2: leaning faint","3: right","4: leaning strong","5: strong"], want ["1: faint","2","3","4","5: strong"]
FAIL reading case two Coffee flavour reads 2 of 5: got "faint (2)"
FAIL editor .mk-stops reads "faint · 2 · 3 · 4 · strong": got "faint to strong"
```

Passes on the base (so these are not the bug): Body's anchors and stop names (a middle scale, "right" is correct there), Body reads `heavy (4)`, Mint reads `strong (5)`, and no word "right" in the editor outside the Kind option "Right in the middle".

What rendered "right": the record pen draws the word "right" between a Low to high scale's two ends (the anchors line is `faint | right | strong`, and stops 2 to 4 are named "leaning faint", "right", "leaning strong"), and the reading says "faint (2)" for a mark of 2; the creation editor's stops line already differs by kind ("faint to strong") and carries no stray "right" (12-01's flagged assumption A1: the editor facet's FAIL rests only on the A1 form `faint · 2 · 3 · 4 · strong`).

Full output files: `${TMPDIR}sprinkles-12/report-base-06.txt` and `check-base-06.txt` (scratch, not committed).

## Task Commits

1. Task 1 (tracer): shared cases and pen facet - `7298cd0e`
2. Task 2: reading and editor facets, check mode, base reproduced - `df24ded6`

## Deviations from Plan

**1. [Rule 1 - Bug] The New recipe name field is a textarea**
- **Found during:** Task 2 (editor facet)
- **Issue:** The plan (via 11-walk.mjs) names `.nb__new input`; the built app renders a textarea in `form.nb__new` (NotebookPlace.jsx:230, test at NotebookPlace.test.jsx:515). The first editor run timed out waiting for the input.
- **Fix:** The probe uses `.nb__new textarea`.
- **Files modified:** 12-stops-probe.mjs
- **Commit:** `df24ded6`

**Total deviations:** 1 auto-fixed (1 bug in a copied selector). **Impact:** none on scope.

Other notes: writing the persisted plan commit ledger into the shared `.git` directory was blocked by the permission system, so `commits:` above is measured with `git rev-list --count e37db11a..HEAD` against the base commit named in the dispatch (2).

## Authentication Gates

None.

## Issues Encountered

None. No app files were changed (`git log --name-only --grep='(12-06)' -- app` prints nothing); no base worktree was created; no Vite server was started.

## Known Stubs

None.

## Threat Flags

None. The probe makes no request beyond 127.0.0.1 and writes only the scratch folder.

## For the orchestrator

- Base-build report for the reply on `bug-p11-low-to-high-scale-centre-mark`: the lines quoted under "What the bug row's steps showed on the base build". Do not close the row after wave 1; it closes in 12-05's orchestrator step (see the plan).
- Deploy: no app file changes in this plan; safe.

## Self-Check: PASSED

- 12-cases.mjs and 12-stops-probe.mjs exist; commits `7298cd0e` and `df24ded6` are ancestors of HEAD.
- Task 1 and Task 2 acceptance criteria re-run: all pass; Task 2's verify ended `BASE REPRODUCED`.
