---
phase: 11-steps-structure-save-and-print
plan: 01
subsystem: testing
tags: [playwright, webkit, walk, board-conformance, harness, method-hash]

requires:
  - phase: 10-the-creation-editor-without-save
    provides: 10-walk.mjs record body, 10-walk-record-base.sh, 10-board-check.mjs engine
  - phase: 08-split-the-recipe-page-along-its-jobs
    provides: 08-walk-server.mjs static server
provides:
  - 11-walk-before.json, the Phase 11 baseline (12 scenarios, 94 snapshots, each with textHash and methodHash) recorded from BASE cf64aa70
  - 11-walk.mjs, a strict walk whose compare admits only whole new scenarios named in ALLOWED_NEW_SCENARIOS, with selftest, seedtest and normtest
  - walk.seed() and walk.expectSeedKept() over the pure seedKeptProblems, the seed rule every new scenario is held to
  - 11-walk-check.sh, one command that builds to a per-checkout scratch dir, records and compares
  - 11-board-check.mjs, the Phase 10 engine plus seed, anchored full pages, the type check, the selftest-blind refusal and the notice and anchored-full evidence rules
  - 11-board-selftest.mjs, the engine's proof on sketch 014's save and first-version boards
affects: [11-04, 11-07, 11-09, 11-10, 11-11, 11-12, 11-13]

actuals:
  tokens: 29400
  tasks: 3
  commits: 3

plan_head_before: d5afacf793af293604e552163276b00d568d0a2e
commits: 3
plan_head_after: a6af5142eb95323e65defe8f2d3d966b91228f89

tech-stack:
  added: []
  patterns:
    - "Method hash: textHash cuts the .method-region out of the page root; methodHash hashes the region after exactly two normalisations (why label removed with its dash; each target chip read as JSON [label, old, new] whatever its markup order)"
    - "Whole-scenario allowance: a scenario present after only, named in ALLOWED_NEW_SCENARIOS, is reported 'NEW <name> <steps>' and is held to walk.seed / walk.expectSeedKept instead of the baseline"
    - "Board engine: a full page may name an anchor and is then measured like a crop; a panel under --selftest with no box, size or font check is refused as selftest-blind"
    - "In-page helpers (canonicalTargetText, readMethodText) are self-contained functions whose source is handed to page.evaluate, so snapshot() and normtest read chips by the same code"

key-files:
  created:
    - .planning/phases/11-steps-structure-save-and-print/11-walk.mjs
    - .planning/phases/11-steps-structure-save-and-print/11-walk-record-base.sh
    - .planning/phases/11-steps-structure-save-and-print/11-walk-check.sh
    - .planning/phases/11-steps-structure-save-and-print/11-walk-before.json
    - .planning/phases/11-steps-structure-save-and-print/11-board-check.mjs
    - .planning/phases/11-steps-structure-save-and-print/11-board-selftest.mjs
  modified: []

key-decisions:
  - "The baseline is re-recorded at BASE cf64aa70 from a detached scratch worktree (removed afterwards), not copied from Phase 10, because the snapshot gains methodHash and a cut textHash"
  - "The twelve scenario bodies stay byte-identical to 10-walk.mjs; every other leaf of the 94 snapshots equals Phase 10's recorded value (checked), only textHash and the new methodHash differ"
  - "vC1-seeded does not compare .notebook-version__identity: the board reads 'Version 1 · Latest', the build reads 'Version 1 · <label> · Latest' (see Deviations)"

patterns-established:
  - "A later plan adds a scenario below the '// ---- Phase 11 scenarios (ALLOWED_NEW_SCENARIOS) ----' marker, names it in ALLOWED_NEW_SCENARIOS, calls walk.seed() after its first open and walk.expectSeedKept(entry, recipeId) on every step it records with stores"
  - "A plan's board module holds at least one box, size or font check per panel, or the engine refuses it under --selftest"

requirements-completed: [STRUCT-04]

coverage:
  - id: D1
    description: "11-walk-before.json recorded at BASE cf64aa70 with textHash and methodHash: 12 scenarios, 94 snapshots; a second recording of the same dist compares as MATCH 94 snapshots"
    requirement: "STRUCT-04"
    verification:
      - kind: integration
        ref: "sh 11-walk-record-base.sh && 11-walk.mjs record base-again.json && 11-walk.mjs compare 11-walk-before.json base-again.json -> MATCH 94 snapshots"
        status: pass
    human_judgment: false
  - id: D2
    description: "compare admits only the five named new scenarios and refuses every doctored difference (selftest: real pair, eight refusals, one allowance)"
    requirement: "STRUCT-04"
    verification:
      - kind: unit
        ref: "node 11-walk.mjs selftest 11-walk-before.json -> ten PASS selftest lines"
        status: pass
    human_judgment: false
  - id: D3
    description: "walk.seed / walk.expectSeedKept / seedKeptProblems refuse a changed seeded record, a missing one and a stranger, and admit the scenario's own records"
    requirement: "STRUCT-04"
    verification:
      - kind: unit
        ref: "node 11-walk.mjs seedtest 11-walk-before.json -> same, changed, missing, stranger, own"
        status: pass
    human_judgment: false
  - id: D4
    description: "The method hash absorbs the printed method treatment (why label, chip order) and keeps every target value, a lead-in and a headnote word; the walk opens and records /notebook"
    requirement: "STRUCT-04"
    verification:
      - kind: e2e
        ref: "PROBE_DIST=<base build> node 11-walk.mjs normtest -> nine PASS normtest lines (WebKit)"
        status: pass
    human_judgment: false
  - id: D5
    description: "The board engine seeds stored records, anchors full pages, compares type properties, refuses a blind self-test and pictures a showing notice and an anchored full page"
    requirement: "STRUCT-04"
    verification:
      - kind: e2e
        ref: "11-board-check.mjs 11-board-selftest.mjs --selftest --evidence -> 16 PASS, 0 FAIL; first-version-fA1~vC1 pictures 548.7x207.2 on both sides"
        status: pass
    human_judgment: false

duration: 15min
completed: 2026-10-26
status: complete
---

# Phase 11 Plan 01: Phase 11 proof harnesses Summary

**The Phase 11 walk re-recorded at BASE cf64aa70 with a method hash that lets the printed method treatment through and no target value, an allow-list for five whole new scenarios held to a seed rule, and a board engine that seeds stored recipes, anchors full pages and refuses a blind self-test.**

## Performance

- **Duration:** 15 min
- **Started:** 2026-10-26T21:23 (local)
- **Completed:** 2026-10-26T21:38 (local)
- **Tasks:** 3
- **Files modified:** 6 created, none under `app/`

## Accomplishments

- `11-walk-before.json` holds 12 scenarios and 94 snapshots recorded from a detached build of cf64aa70; every snapshot carries `textHash` (page root text with the method region cut out) and `methodHash` (the region after two normalisations). Every other leaf equals Phase 10's recorded value. A second recording of the same dist compares `MATCH 94 snapshots`, and `11-walk-check.sh` on this unchanged tree ends the same.
- The compare keeps Phase 10's strictness for existing scenarios and admits only a scenario present after alone whose name is in `ALLOWED_NEW_SCENARIOS`, printing `NEW <name> <steps>` on the MATCH line. `selftest` shows the real pair passing, eight doctored copies refused (store leaf, snapshot leaf, added key, repeated step, methodHash, textHash, scenario missing, unnamed new scenario) and one allowed new scenario admitted.
- `walk.seed()` and `walk.expectSeedKept(entry, recipeId)` over `seedKeptProblems` hold a new scenario to the records it did not make; `seedtest` proves it refuses a changed seeded leaf, a missing record and a stranger, and accepts the scenario's own recipe, version, batch and draft.
- `normtest` (WebKit, base build) proves uppercase labels and a "why" label change neither hash, the base struck-first chip and plan 11-04's label-first chip hash the same, a wrong or swapped old/new value and a changed lead-in move `methodHash`, a changed headnote moves `textHash`, Mexican Chocolate v2's Show changes reads exactly `["temp",null,"75 °C"]` and `["hold","45 min","60 min"]`, and `/notebook` opens and records a non-empty text.
- `11-board-check.mjs` adds `seed` and `draftKind`, anchors on full pages, the `type` check, the `selftest-blind` refusal, notice evidence while the notice shows and anchored-full evidence by scope; `11-board-selftest.mjs` passes 16 comparisons with 0 FAIL, including vC1 seeded, unseeded refused for `missing`, blind refused for `selftest-blind`, fA1 against vC1 anchored and pictured, and fC1 against fA1 refused for `present`.

## Task Commits

1. **Task 1 (tracer): the Phase 11 walk recorded at BASE with the method hash** - `ab3efb90` (feat)
2. **Task 2: one-command check, selftest, seedtest and normtest** - `771fc7dc` (test)
3. **Task 3: the board engine with seed, anchored full pages and the type check** - `a6af5142` (feat)

**Plan metadata:** the docs commit that adds this file.

Tracer gate: the Task 1 `<verify>` carries only `<automated>`, so under `end-of-phase` it was re-run end to end (record, second record, compare: `MATCH 94 snapshots`) before expansion.

## Files Created/Modified

- `.planning/phases/11-steps-structure-save-and-print/11-walk.mjs` - record, compare, selftest, seedtest, normtest; `canonicalTargetText`, `readMethodText`, `seedKeptProblems`, `ALLOWED_NEW_SCENARIOS`
- `.planning/phases/11-steps-structure-save-and-print/11-walk-record-base.sh` - BASE=cf64aa70 recorder (refuses a stranger app/ commit after BASE; scratch worktree under `$TMPDIR/sprinkles-11`, removed on exit)
- `.planning/phases/11-steps-structure-save-and-print/11-walk-check.sh` - per-checkout scratch build, record, compare
- `.planning/phases/11-steps-structure-save-and-print/11-walk-before.json` - the baseline (about 13 MB, as Phase 10's)
- `.planning/phases/11-steps-structure-save-and-print/11-board-check.mjs` - the board engine
- `.planning/phases/11-steps-structure-save-and-print/11-board-selftest.mjs` - the engine's own spec on sketch 014

## Decisions Made

- BASE confirmed: `git log -3 -- app/` names cf64aa70 newest; the recorder's stranger-commit check passed (no non-Phase-11 app/ commit after it).
- `snapshot()` is kept as a thin wrapper over a new `takeSnapshot()` that also returns `methodCut`, so `step()` can fail a scenario when the method region's text is not found once in the page text while the recorded JSON gains no extra leaf.
- `walk: '05'` stays in the recorded file's header as in Phase 10 (the compare checks it equal on both sides).

## Deviations from Plan

### Plan-sanctioned drops and interpretation

**1. [Plan rule - genuine board/build difference] vC1-seeded does not compare `.notebook-version__identity` text**
- **Found during:** Task 3 verify
- **Issue:** The board's vC1 reads "Version 1 · Latest". The build's identity line is `versionIdentity(ordered, version)` = `Version ${n} · ${version.versionLabel}` plus " · Latest" (app/src/domain/lineage.js:58-62), so the seeded Vanilla version labelled "Version 1" reads "Version 1 · Version 1 · Latest" (board "Version 1 · Latest", app "Version 1 · Version 1 · Latest"). No stored label can make the current build read the board's words; `createRecipe` also refuses a blank label.
- **Fix:** Dropped the element from vC1-seeded with the reason in a comment (the plan's rule for a genuine difference: report both values, drop, tolerance stays), and used `.version-row__reason` text in the vC1-blind panel instead. vC1-seeded keeps name text and font, reason text, and the acts button text and font.
- **Follow-up for later plans:** 11-12's fA1 spec (`.notebook-version__identity` [text] on the seeded Vanilla root) will hit the same difference unless an earlier Phase 11 plan changes how a first version's identity reads (the board draws no label after "Version 1"). Not fixed here: no `app/` change is allowed in this plan.
- **Files modified:** `11-board-selftest.mjs`
- **Commit:** a6af5142

**2. [Plan wording] Marker line placement**
- The plan puts the marker "right after the twelfth SCENARIOS.push block and before record()" and its acceptance check slices 10-walk.mjs up to `async function record(` (which includes the three-line "record:" comment block) against 11-walk.mjs up to the marker. To make that equal the record comment block stays above the marker line; the marker and a short note follow it, directly above `async function record(`. Later plans append below the marker as intended.

**3. [Plan acceptance wording] regex-special criteria**
- `grep -c 'walk-$(basename' 11-walk-check.sh` and the `--outDir "$SCRATCH/dist"` grep print 0 as written because `$(` and `$S` are regex-special in BSD grep; with `grep -F` both print 1 (the lines are present).

**Total deviations:** 1 build/board difference reported and dropped by the plan's own rule, 2 wording notes. **Impact:** none on the harness; the identity-line difference is a finding for 11-12.

## Issues Encountered

None blocking. Full test suite: baseline in this worktree 120 files, 3771 tests passed; after this plan 120 files, 3771 tests passed (no `app/` change).

## Verification

- `sh 11-walk-record-base.sh` then `record` of the same dist then `compare`: `MATCH 94 snapshots`.
- `selftest`: 10 PASS lines; `seedtest`: 5; `normtest`: 9; `sh 11-walk-check.sh`: `MATCH 94 snapshots`.
- `11-board-check.mjs 11-board-selftest.mjs --selftest --evidence`: `16 PASS, 0 FAIL`; evidence README row for fA1~vC1 reads board 548.7x207.2, app 548.7x207.2; both PNGs exist.
- Acceptance greps all pass (scenario bodies identical to 10-walk.mjs; no `app/` file in this plan's commits; the engine builds nothing).
- Scenario-body check, ALLOWED_NEW_SCENARIOS (2+ hits), methodHash, `'.notebook, .nb'`, canonicalTargetText and seedKeptProblems greps pass.

## Known Stubs

None.

## Threat Flags

None: the plan adds harness scripts only and no network, auth, file-access or schema surface in the app. T-11-01 to T-11-04, T-11-41 to T-11-43 are mitigated as planned (every build passes `--outDir` into `$TMPDIR/sprinkles-11`; the recorder refuses a moved base and builds from a detached worktree; every context aborts non-127.0.0.1 requests).

## Next Phase Readiness

Ready for 11-04 and the later plans: run `sh 11-walk-check.sh` after each plan, `PROBE_DIST=<build> node 11-walk.mjs normtest` on 11-04's build, and give each board panel at least one box, size or font check.

## Self-Check: PASSED

- Created files found: 11-walk.mjs, 11-walk-record-base.sh, 11-walk-check.sh, 11-walk-before.json, 11-board-check.mjs, 11-board-selftest.mjs (all under `.planning/phases/11-steps-structure-save-and-print/`).
- Commits found: ab3efb90, 771fc7dc, a6af5142.
