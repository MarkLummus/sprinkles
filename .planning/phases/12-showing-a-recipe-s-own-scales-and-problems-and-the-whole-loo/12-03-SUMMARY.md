---
phase: 12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo
plan: 03
subsystem: testing
tags: [playwright, webkit, roundtrip, export, import, proof-01]
status: complete

requires:
  - phase: 12-01
    provides: Low to high scale readings and the printed log's scales, problems and Sheet code foot
provides:
  - "12-roundtrip.mjs: the PROOF-01 round trip in WebKit through the built app's own editor, Save, Export button and Import file input"
  - "12-roundtrip-check.sh: one command, a scratch build, two runs, a byte compare, ends ROUNDTRIP PASS"
affects: [12-05 (reruns 12-roundtrip.mjs on the final build), round two (reruns it unchanged after Gate 2)]

tech-stack:
  added: []
  patterns:
    - "A walk reads all nine stores (eight exported plus drafts) and compares whole sorted lists both ways, so a missing, extra or changed record each fails"
    - "Each scale is read or marked inside its own .axis-mark, never page-wide"

key-files:
  created:
    - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-roundtrip.mjs
    - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-roundtrip-check.sh
  modified: []

key-decisions:
  - "The walk is standalone (copies, does not import, the 11-walk.mjs helpers) so the 94-snapshot Phase 11 baseline stays untouched"
  - "--out is refused unless it resolves under the scratch folder ($TMPDIR or /tmp)"
  - "The check script requires a PASS line for each of create, print, batch, reading, export, import, compare, figures, seed, drafts and search in both runs, as well as no FAIL line"

requirements-completed: [PROOF-01]

commits: 2
plan_head_before: dfbf4d73bd87da495e3550231f73fa17b6122628
plan_head_after: 1481d02c59a2a2e6d749515dc3da6da4c7126c37

actuals:
  tokens: 9500
  tasks: 2
  commits: 2

duration: 45 min
completed: 2026-11-16
---

# Phase 12 Plan 03: The whole loop, scripted Summary

**A recipe made in the built app with a Body (Right in the middle) scale, a Coffee flavour (Low to high) scale and a Bitter problem prints, takes a batch marked 2 and 5, exports, imports into an empty profile and compares equal field by field, the same on two runs.**

## Accomplishments

- Task 1 (tracer): `12-roundtrip.mjs` drives the built creation editor in WebKit (1366 by 1024, touch, Date frozen with `setFixedTime`, counted UUIDs, only 127.0.0.1 requests), saves the recipe, exports through the shell's Export button (`waitForEvent('download')`), imports into a second fresh context through `setInputFiles('.shell__file-input', ...)`, and compares. RESEARCH A4 held: WebKit fires the download event and accepts `setInputFiles` on the hidden input, so no fallback was needed.
- Task 2: adds print (two log pages, the Tasting log's last two scales Body then Coffee flavour after the four core ones, the problems row ending Bitter, the Sheet code in both log feet and the last sheet foot), the batch (Coffee flavour 2, Body 5, Bitter ticked; the stored marks, declaredDefects and snapshot kinds asserted), the reading (`2 of 5`, `heavy (5)` in A and again in B), `buildFigures` over A's and B's stored versions with `isDeepStrictEqual`, the Balance figures' text as strings, the seed kept (B's eight stores before the import equal A's before creation), drafts apart (A held 0 at export; B holds none after the import), and a Sheet code search in B.
- `12-roundtrip-check.sh` builds to `${TMPDIR}/sprinkles-12/roundtrip-<checkout>/dist`, runs the walk twice with `--out`, `cmp`s the two dumps and ends `ROUNDTRIP PASS`.

## Verification

- Task 1 verify: 33 PASS lines, no FAIL (create, export, import, compare).
- Task 2 verify (`sh 12-roundtrip-check.sh`): exit 0, 68 PASS lines per run (136 over both), no FAIL, `two runs wrote identical made records and exported file`, `ROUNDTRIP PASS`.
- The walk can fail: a copy with the `2 of 5` expectation changed to `3 of 5` printed `FAIL reading A: Coffee flavour reads 3 of 5: got "2 of 5"` (and the same for B) and exited 1. The copy was deleted.
- All acceptance greps of both tasks hold (counts as the plan states; the check script mentions `ROUNDTRIP PASS` once and `app/dist` not at all outside comments).
- Sheet code of the made version in the runs: `688G-HZQN` (deterministic under the frozen clock and counted ids).

## Deviations from Plan

**1. [Rule 3 - Blocking] Stale selectors copied from 11-walk.mjs**
- **Found during:** Task 1, first runs
- **Issue:** The plan's driver text (via 11-walk.mjs) names `input[aria-label="{name}, grams"]`, `input[aria-label="Step 1, lead-in"]`, `textarea[aria-label="Step 1, instruction"]` and a chooser called `Add {name} to a step` with options `Add {name} to step 1`. In the built app the grams and lead-in fields are one-row textareas (the iPad Tab fixes, e.g. commit 3e180f90), and the row control is `Add to step, {name}`, whose chooser offers `Step 1, Churn: add {name}` (IngredientTable.jsx RowActs). The first run timed out at the picker's done-selector, then at the chooser.
- **Fix:** tag-free `[aria-label="..."]` selectors for the fields; the chooser driven through its real labels. Still no Move button and no More panel.
- **Files modified:** 12-roundtrip.mjs
- **Commit:** 8ec70a3e

**2. [Rule 3 - Blocking] The New recipe name field is a textarea** (noted by 12-06): used `.nb__new textarea`.

**Total deviations:** 2 auto-fixed (both stale selectors in the copied driver). No scope impact.

## Findings to carry forward

- 12-02's and 12-05's selectors from 11-walk.mjs have the same staleness: any walk that copies `input[aria-label="... grams"]` or `Add {name} to step N` from Phase 11 will time out on the current build.
- `commits:` above is measured against the dispatch base `dfbf4d73` (`git rev-list --count`), not a persisted ledger file.

## Authentication Gates

None.

## Known Stubs

None.

## Threat Flags

None. The walk makes no request beyond 127.0.0.1, uses only fresh Playwright contexts (their own IndexedDB), reads the build from PROBE_DIST (a scratch folder), refuses an `--out` outside scratch, and never touched Mark's profile or the build folder his preview serves. Its scratch files are under `${TMPDIR}sprinkles-12/`.

## For the orchestrator

- No Mark's List row changes (D-10 gives Mark no step here).
- Deploy: no app files changed in this plan; safe.
- This walk ran against a build of this worktree (holds 12-01, not 12-02). 12-05 reruns it on the final build.

## Self-Check: PASSED

- 12-roundtrip.mjs and 12-roundtrip-check.sh exist; commits `8ec70a3e` and `1481d02c` are ancestors of HEAD.
- Both tasks' verify commands pass and all acceptance greps hold.
