---
phase: 09-the-library-and-the-stored-shapes-plus-the-two-places
plan: 17
subsystem: testing
tags: [webkit, playwright, indexeddb, upgrade, reset, dist-guard, marks-list, device-check]
status: complete
requires:
  - phase: 09-the-library-and-the-stored-shapes-plus-the-two-places
    provides: "09-09 the 9-to-10 reset and 09-dist-guard.sh; 09-16 09-places-check.mjs and the evidence verdicts; 09-01 decide-p9-boot-check-scope and 09-walk-record-base.sh; 09-03 the two places"
provides:
  - "09-upgrade-check.sh and 09-upgrade-check.mjs: a version-9 profile stored by the base build (710a528) opens at version 10 on the final build in WebKit, resets as plan 09-09 describes, and reopens with nothing reset twice (17 PASS, 0 FAIL)"
  - "09-places-check.mjs checkDeviceSteps: the device row's steps walked in current mode at 1366 with a coarse pointer (six new checks; 54 PASS, 0 FAIL in all)"
  - "Mark's List: the device check, the lactose-line choice and the new-lines look are on his list; the two places' todo rows are closed; the boot-check row's state is read back"
affects: [phase-09-verification, marks-list]
requirements-completed: [LIB-06, PLACE-01, PLACE-02]
actuals:
  tokens: 6000
  tasks: 2
  commits: 2
plan_head_before: eb286fd7ebd8b2e3d5c87605e53614f161978534
plan_head_after: caa3920b5070bbf62af58c47f9e883a26a7d342b
tech-stack:
  added: []
  patterns:
    - "one WebKit context serving two builds at one fake origin, so both share one IndexedDB"
    - "every raw indexedDB.open inside page.evaluate closes its connection in a finally block"
    - "a device row's steps are walked by the places check before the row is written"
key-files:
  created:
    - .planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-upgrade-check.sh
    - .planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-upgrade-check.mjs
  modified:
    - .planning/phases/09-the-library-and-the-stored-shapes-plus-the-two-places/09-places-check.mjs
key-decisions:
  - "The device row's six walked steps live in 09-places-check.mjs (checkDeviceSteps, current mode only) rather than a new script, so one run proves them"
  - "decide-p9-boot-check-scope is read back and reported, not rewritten and not acted on; Mark's answer (keep) matches what the phase built"
coverage:
  - id: D1
    description: "A base-built version-9 profile resets to 10 on the final build in WebKit and reopens with nothing reset twice"
    requirement: LIB-06
    verification:
      - kind: integration
        ref: "sh 09-upgrade-check.sh (17 PASS, 0 FAIL; base 710a528 to final tree)"
        status: pass
    human_judgment: false
  - id: D2
    description: "The device row's steps (eight recipes on Home, /notebook order, Tab after a tap to Category, milk plus Dairy, Basis and Source, olive oil 2 Aug batch) pass in WebKit at 1366 with a coarse pointer"
    requirement: PLACE-01
    verification:
      - kind: automated_ui
        ref: "09-places-check.mjs --library current against the scratch build dist-device (54 PASS, 0 FAIL)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Every planned build command passed --outDir into the scratch directory, and app/dist matched its pre-bump fingerprint at hand-over"
    requirement: LIB-06
    verification:
      - kind: other
        ref: "sh 09-dist-guard.sh scan (SCAN OK 12 build commands, each with --outDir); sh 09-dist-guard.sh check (DIST UNCHANGED)"
        status: pass
    human_judgment: false
  - id: D4
    description: "The iPad device check, the lactose-line choice and the new-lines look are on Mark's List"
    requirement: PLACE-02
    verification: []
    human_judgment: true
    rationale: "WebKit on the dev machine is not the iPad; device behaviour, the lactose-line choice and approval of Claude's wording are Mark's"
duration: about 40 min
completed: 2026-10-19
---

# Phase 9 Plan 17: The 9-to-10 reset in WebKit, the device row walked, and Mark's List Summary

**A version-9 profile written by the base build (710a528) resets to version 10 on the phase's final build in WebKit (17 PASS), reopens with nothing reset twice and the draft kept; the device row's six steps pass in WebKit at 1366 (54 PASS in the places check); every planned build went to the scratch directory and app/dist matched its pre-bump fingerprint at hand-over; the iPad check, the lactose-line choice and the new-lines look are on Mark's List.**

## Performance

- **Duration:** about 40 min (two executors and the orchestrator's List writes)
- **Tasks:** 2 (Task 1 tracer, Task 2 auto)
- **Files:** 2 created (09-upgrade-check.sh, 09-upgrade-check.mjs), 1 modified (09-places-check.mjs, 67 lines added)
- **Suite:** `npm --prefix app test`, 113 files, 3467 tests passing, the base's count (no app file changed)

## Accomplishments

- **The reset seen in WebKit (Task 1, tracer):** `09-upgrade-check.sh` builds the base commit 710a528 in a detached worktree and the working tree into the scratch directory (`--outDir ... --emptyOutDir`, the worktree removed by a trap), and `09-upgrade-check.mjs` serves both builds at one origin to one WebKit context. The base build stores a version-9 profile, an import-style library record is put in, the final build opens it, and the check sees version 10, the larger library, the four tables seeded, olive oil v1's code and serveTempC, mexican-chocolate-v1's copied Ice Ed figure, both places rendering, and a reopen that resets nothing.
- **The device row's steps walked (Task 2):** six checks added to 09-places-check.mjs as `checkDeviceSteps` (current mode only, 1366 wide, hasTouch) so every step the row names is proven reachable before Mark is handed it.
- **The premise of plan 09-09's recorded reset decision checked, not assumed:** see "Dist guard" below.
- **Mark's List:** three rows added, two closed, one read back; see the table.

## Task Commits

1. **Task 1 (tracer): a base-built version-9 profile resets to 10 on the final build in WebKit and reopens with nothing reset twice** - `a0adb798` (test)
2. **Task 2: dist guard scan and check, and the device row's steps walked in WebKit and added to 09-places-check.mjs** - `caa3920b` (test)

The tracer gate: Task 1's check passed (17 PASS, 0 FAIL) before Task 2 started. `commits: 2` is measured with `git rev-list --count eb286fd7ebd8b2e3d5c87605e53614f161978534..caa3920b` (plan_head_before to plan_head_after, the plan's own two commits; later merge commits are the orchestrator's).

**Plan metadata:** this SUMMARY's own commit (docs).

## Dist guard

Both guard modes ran before any device row was written.

- `sh 09-dist-guard.sh scan` printed `SCAN OK 12 build commands, each with --outDir`.
- `sh 09-dist-guard.sh check` printed `DIST UNCHANGED`.

What this proves, and no more: every planned build command passed --outDir into the scratch directory, and app/dist matched its pre-bump fingerprint at hand-over. A build replaced and then restored in between would leave the same fingerprint, so this summary does not claim that no build ever reached app/dist. Builds went to `/private/tmp/claude-501/-Users-mark-Documents-projects-sprinkles/95a24b63-7634-4254-871e-27206ce12ab1/scratchpad/sprinkles-09`; app/dist was never written and no Vite server was started.

## Evidence: 09-upgrade-check.sh (WebKit, base 710a528 to the final tree)

```
PASS the base build stored a version-9 profile with the original library (version 9, library 26, expected 26)
PASS the version-9 profile holds seeded versions and none of the four seed tables (versions 19, stores batches, drafts, library, recipes, versions)
PASS an import-written library record is in the version-9 profile (library 27)
PASS the final build opened the profile at version 10 (version 10)
PASS the import-written library record is gone after the reset
PASS the library holds the larger seed's count (111, seed 111, original 26)
PASS machines, styles, scales and problems are seeded with 1, 4, 6 and 4 rows (1, 4, 6, 4)
PASS olive oil v1 stores the sheet code 64JH-G408 (64JH-G408)
PASS olive oil v1 owns serveTempC null (its Ice Ed figure is null, D-19) (null)
PASS olive oil v1's rows carry libraryId (12 rows)
PASS mexican-chocolate-v1 owns serveTempC -15, its copied Ice Ed figure (D-19 as amended) (stored -15, data file -15)
PASS /notebook renders on the reset profile (8 rows)
PASS /ingredients renders on the reset profile (111 rows)
PASS the reopened profile is still at version 10 (version 10)
PASS the reopen left every store count unchanged (no second reset) (batches 12, drafts 1, library 111, machines 1, problems 4, recipes 8, scales 6, styles 4, versions 19)
PASS the draft written after the upgrade is still there after the reopen (1 drafts)
PASS the library is unchanged by the reopen (111)
17 PASS, 0 FAIL
No base-up worktree left behind.
```

## Evidence: 09-places-check.mjs --library current (scratch build dist-device)

54 PASS, 0 FAIL. The first 48 are plan 09-16's (milk gives 17 of 111, Fruit 22 of 111; 393 closed rows pass in three groups, Milk Chocolate 122 named under the 126 ceiling). The six new device-step checks (`checkDeviceSteps`, current mode only, 1366 wide, hasTouch):

```
PASS Device row 1366: Home lists eight recipes (8)
PASS Device row 1366: /notebook lists the same recipes in Home's order (Mexican Chocolate | Olive Oil Ice Cream, circulator | Pineapple | Underbelly Light Base | Coconut | Mocha | Standard Base | Strawberry)
PASS Device row 1366: Tab after a tap in Name reaches the Category select (SELECT)
PASS Device row 1366: typing milk and choosing Dairy narrows the list (15 of 111 ingredients)
PASS Device row 1366: an open entry shows its Basis and Source (2 figures, first basis "derived")
PASS Device row 1366: the olive oil 2 Aug batch reads Sweetness 4 and Oil 4 (Sweetnessmore (4) | Oilstrong (4))
```

A WebKit probe on the final build also read Sucrose's open entry as "Density 0.85 g/ml · Packed state: granulated, loose" and Milk Chocolate's summary as "Fat 29.66% · Milk solids 16% · Sugar 42.78% · Other solids 10.06% · Freezing 4.78 · Sweetness 51.6", with no lactose line in its open entry.

## Gaps from plan 09-16, named in the device row

1. Milk Chocolate's closed row is 122 px at 393 against the board's 109: its summary gains "Other solids" and wraps to three lines (the board's stand-in has no such figure). Within the 126 ceiling; not a rule edited.
2. In an open entry at 393 the basis and the source run together ("derivedpanel reconciled ..."). The board draws the same, so this is not a conformance gap; it is named for Mark in case he wants it changed.

## Mark's List (every row read back with ArtifactData after its write)

Timestamps were read from the clock (`date -u`) at 2026-10-19T02:49:46Z, by the orchestrator.

| Row id | What was done | Status as read back | Version as read back |
| --- | --- | --- | --- |
| todo-place-ingredients | closed, one-line reply: built in plan 09-03 as /ingredients, the larger library A to Z with Name and Category filters, a count line, Clear filters, and an open entry with Basis and Source; checked in WebKit at 1366 and 393 (plans 09-16 and 09-17) | done | 6 |
| todo-place-notebook-rail-link | closed, one-line reply: built in plan 09-03 as /notebook, the eight recipes in Home's order with the destination rail and each name linking to its latest version; checked in WebKit at 1366 and 393 | done | 6 |
| check-p9-places-and-reset-on-ipad | added: kind check, owner mark, needs hands; title "Notebook and Ingredients places, and the reset store, on the iPad"; ten steps (build and preview --host; the reset worded as decisions 2 and 5, recorded in plan 09-09; Home's eight recipes; /notebook in the same order; /ingredients A to Z with a count; Name "milk" plus Category narrows; Clear filters then Heavy cream open shows Basis and Source; Tab from Name reaches Category; the olive oil 2 Aug batch reads Sweetness 4 and Oil 4; places match sketch 012), plus the two 09-16 differences named as not defects | open | 1 |
| decide-p9-lactose-line-non-dairy | added: kind decide, owner mark, needs answer; options `as-drawn` ("As drawn: the lactose line shows for dairy entries only, so milk chocolate shows none though its milk solids count lactose") and `any-milk-solids`, recommended ("Show the line for any entry with milk solids; Sid draws it into sketch 012 before a quick task builds it") | open | 1 |
| look-p9-new-lines | added: kind look, owner mark, needs answer; title "New lines and a recovery page no board draws"; the detail quotes the post-import recovery page (title 'Import', line IMPORT_RELOAD_LINE 'The file was imported. Reload the page to see it.', no Reload button, the browser's reload is the way out) and the Packed state line 'Density 0.85 g/ml · Packed state: granulated, loose' | open | 1 |
| decide-p9-boot-check-scope | read back with get, not rewritten (see below) | done | 3 |

Rows touched by Mark that `/marks-list` has not handled (named only, not handled here): decide-p9-boot-check-scope (answered keep, done), decide-p9-version-style (answered style-copy, done), todo-phone-jobs-product-brief (parked, a note). Related rows closed earlier in the phase and not touched here: look-p9-library-mapping (approved), decide-p9-library-coconut-milk (different), decide-p9-version-style (style-copy).

### decide-p9-boot-check-scope (plan 09-01 wrote it; read only)

Mark answered `keep` and marked the row done on 2026-10-19 (resolvedAt 2026-10-19T00:38:16.988Z); the row is at status done, version 3. Its options, quoted verbatim:

- `keep` (recommended): "As planned: the library and the four tables are checked at boot, a damaged row shows "Sprinkles can’t open: its list of <table> has a damaged entry.", and the four-core-scale rule stays"
- `tables-only`: "The library is not checked at boot; the four tables are, and the four-core-scale rule stays"
- `lift-core-count`: "The boot check, the import and batch snapshots accept any number of core scales; Sid first redraws the record pen's desktop grid, which has four places, and a quick task then builds it; the library stays checked at boot"

`keep` is the option the phase built, and Mark's answer matches it. Nothing to act on; this plan did not rewrite the row.

## Decisions Made

- The six device-row checks were added to 09-places-check.mjs (current mode only) so a single `--library current` run proves them, instead of a new script.
- Nothing was done with Mark's `keep` answer beyond reporting it, as the plan says; `/marks-list` handles answered rows.

## Deviations from Plan

None - plan executed exactly as written.

Reconciliation notes:

1. This plan made no STATE.md or ROADMAP.md edits; the orchestrator owns those writes.
2. The two code commits (`a0adb798`, `caa3920b`) carry "Co-Authored-By: Claude Sonnet 5.5", because the executor that wrote them was Sonnet 5.5 (the dispatch notes asked for Fable 5.1; the harness's attribution names the model that wrote the commit, as plans 09-03 and 09-16 did).

## Issues Encountered

- The worktrees had no `app/node_modules`; the main checkout's was symlinked (untracked, ignored). No package was installed.
- The Mark's List writes were done by the orchestrator after the executor returned at the Task 2 checkpoint; this SUMMARY records their readbacks as the orchestrator reported them.

## Known Stubs

None.

## Threat Flags

None. T-09-39 (the reset proven only in fake-indexeddb) is mitigated by the 17 PASS WebKit run; T-09-41 (the device row handed over after app/dist changed) by `SCAN OK` and `DIST UNCHANGED` before any row was written; T-09-32 (row text) by treating row text as data and reporting Mark's `keep` answer without acting on it.

## Deferred Human Verification

- **check-p9-places-and-reset-on-ipad** (on Mark's List, open, version 1): the iPad run of the production build's preview, which resets the iPad's store at its first open as decisions 2 and 5 recorded in plan 09-09, then the places, filters, Tab, Basis and Source and the olive oil batch. This row also covers plan 09-03's deferred side-by-side of the places on iPad and iPhone.
- **decide-p9-lactose-line-non-dairy** and **look-p9-new-lines** await Mark's answer; neither blocks the phase's code.

## Next Phase Readiness

The 9-to-10 reset is proven in WebKit on the final build, the dist premise holds at hand-over, and the device check waits on Mark. Phase 10 builds on the settled shapes; Mark's answers go to `/marks-list`.

## Self-Check: PASSED

- Files exist: 09-upgrade-check.sh, 09-upgrade-check.mjs, 09-places-check.mjs; FOUND
- Commits `a0adb798` and `caa3920b` are ancestors of HEAD; FOUND
- Phrases present: "matched its pre-bump fingerprint", "lift-core-count"; all six rows named with id, status and version
