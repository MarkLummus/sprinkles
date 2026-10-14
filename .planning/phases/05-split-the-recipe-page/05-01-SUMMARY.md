---
phase: 05-split-the-recipe-page
plan: 01
subsystem: testing
tags: [playwright, webkit, indexeddb, before-after-walk, vite-build]

requires:
  - phase: 04-prepare-the-next-version-for-making
    provides: "04-draft-probe.mjs helpers (clickUntil, kept-notice wait, batch-pen selectors, markAxis) and the 03.5 probe harness"
provides:
  - "05-walk.mjs: record <out.json> and compare <a.json> <b.json> over the built app in WebKit"
  - "05-walk-before.json: the baseline of what the maker sees and what the stores hold, recorded from app/ at the phase base commit 4f1f98f"
affects: [05-06 after-walk and comparison, 05-02 to 05-05 (reuse the verify command)]

requirements-completed: [EDIT-04]

plan_head_before: 87378c8a22b4ceb2b1ffab898d8404e2597da182
plan_head_after: ba812fa527173a2c52b18b92e2cf24de4ae80ad7

actuals:
  tokens: 10566    # chars/4 over 05-walk.mjs only; the generated 05-walk-before.json (10.2 MB) is excluded
  tasks: 2
  commits: 2       # measured: git rev-list --count 87378c8..HEAD, before this SUMMARY's own commit

tech-stack:
  added: []
  patterns:
    - "Deterministic browser walk: context.clock.setFixedTime plus a localStorage-counted crypto.randomUUID, so two runs compare equal"
    - "Walk fails loudly: FAIL lines, exit 1, nothing written"

key-files:
  created:
    - .planning/phases/05-split-the-recipe-page/05-walk.mjs
    - .planning/phases/05-split-the-recipe-page/05-walk-before.json
  modified: []

key-decisions:
  - "Pen scope in a snapshot is the whole page when any pen is open: the version pen opens the whole sheet for editing and the record pen's as-made column sits in the ingredient table, so inputs and buttons are read from .notebook (and .pen-foot), not only from the pen's own form"
  - "Two scenarios added beyond the plan's ten, to observe what D-13 (b) and D-06 name but the ten cannot show: version-pen-notice-edits and record-pen-edit-handlers"

coverage:
  - id: D1
    description: "05-walk.mjs records snapshots and store dumps for the version pen, record pen, correction and tasting, and compares two recordings leaf by leaf"
    requirement: EDIT-04
    verification:
      - kind: other
        ref: "node .planning/phases/05-split-the-recipe-page/05-walk.mjs compare <copy> <hand-edited copy> prints DIFF and exits 1; two copies print MATCH"
        status: pass
    human_judgment: false
  - id: D2
    description: "05-walk-before.json holds every D-13 observation, each pen's save and each pen's kept draft through a reload, recorded from the unchanged app; two runs MATCH"
    requirement: EDIT-04
    verification:
      - kind: other
        ref: "record 05-walk-before.json, record a second run, compare: MATCH 94 snapshots (three further record runs also MATCH)"
        status: pass
    human_judgment: false

duration: ~50min
completed: 2026-10-14
status: complete
---

# Phase 5 Plan 01: Before-walk Summary

**Deterministic WebKit walk of the built app (`record` and `compare`) with a committed 94-snapshot baseline of the version pen, record pen, correction and tasting, recorded from app/ at base commit 4f1f98f**

## Performance

- **Duration:** about 50 min (start time was not captured at spawn; estimated)
- **Completed:** 2026-10-14T10:41Z
- **Tasks:** 2 (one tracer, one auto)
- **Files modified:** 2 created, none under app/
- **Walk run time:** 43 s for one full `record` (12 scenarios, 94 snapshots)

## Accomplishments

- `05-walk.mjs` drives the built app in WebKit at 1366 wide. Each scenario gets a fresh context with a fixed clock (`2026-10-14T12:00:00.000Z`, timers still run), a counted `crypto.randomUUID` (`sprinkles-walk-id-counter` in localStorage), and every non-127.0.0.1 request aborted. After each step it records the page, form, record and tasting status texts, the `aria-invalid` fields, the focused element, the open pens with every field value and button, and a sha256 of the page text; at scenario ends it dumps the versions, batches, recipes and drafts stores.
- `record` checks every expected fact first; a miss prints `FAIL <scenario>: <what>`, exits 1 and writes nothing. `compare` prints `DIFF <scenario> / <step> / <json path>: before=... after=...` for every differing leaf (or a scenario or step present in one file only) and exits 1, else `MATCH <n> snapshots`.
- `05-walk-before.json` (94 snapshots, 12 scenarios) was recorded with `git log 4f1f98f..HEAD -- app/` empty and `git status --porcelain app/` clean. Five `record` runs against one build were compared pairwise and all MATCH.

## Task Commits

1. **Task 1 (tracer): the walk end to end on one pen** - `aa389fe` (feat)
2. **Task 2: every D-13 observation, each pen's save and kept draft, recorded as the baseline** - `ba812fa` (feat)

**Plan metadata:** committed after this file (docs: complete plan)

## What the baseline records (observed today, not asserted from decisions)

Scenarios, in file order: `version-pen-kept-draft`, `version-pen-blocked`, `version-pen-notice-edits`, `record-pen-edit-handlers`, `version-pen-save`, `record-pen-blocked`, `record-pen-save`, `record-pen-kept-draft`, `correct-save`, `correct-kept-draft`, `tasting-remove-restore`, `tasting-save`.

Behaviour of today's page worth knowing before the split (all in the baseline file):

- **Version pen, blocked on the version line:** form status "Check the version. Your changes have been kept.", Version name marked and focused; a second blocked save refocuses it from another field. A grams edit clears the mark but leaves the form status. A version-line, Why or Sheet title edit clears the form status; a Before-you-start note edit and another grams line do **not** (only the version line, Why and the headnote fields use the clearing handler). With the kept-draft notice showing, only the version-line, Why and Sheet title edits clear the page status; a grams edit and a Before-you-start note edit leave it.
- **Blocked grams line:** marks and focuses that grams field; no form status is written (the row id path does not announce).
- **Record pen:** two malformed measurements mark both and focus the first; fixing one clears only its mark. A blank churn date shows "Enter the date you churned." inside the churn date's label and the form status "Check the churn date. Your entries have been kept."; typing a date clears the sentence. Every record edit handler clears the date block and (except the three Clear controls) the form status; the Clear controls leave focus on body and write "<name> cleared." to the form status.
- **Tasting removal:** "Tasting removed. You can restore it." lands in the record status (the end-of-record ceremony) and stays after Restore, which writes "Tasting restored." to the tasting status. A churn field edit keeps the Restore button.
- **Saves:** saved-as-new gives "Version saved." and the child address; save-over rewrites the child; a new batch gives "recorded 14 Oct 2026" and the batch address; a correction gives "changed 14 Oct 2026" and stamps `changed`; a tasting added to a tasting-less batch is stored.
- **Kept drafts:** version pen, record pen and Correct pen each reopen after a reload with their values and "Draft kept. Cancel discards it."; Cancel leaves the drafts store empty.

## Decisions Made

- Snapshot scope is the whole `.notebook` page whenever any pen is open (see key-decisions). The plan said "inside an open pen"; the version pen's grams, headnote and notes sit outside its `<form>`, so a form-only scope would have hidden the fields D-13 is about.
- Added two scenarios to the plan's ten (names above) so (b)'s page-status half and the per-handler differences of D-06 are observed. All ten named scenarios are present.

## Deviations from Plan

### Route changes (the plan asked for these to be named)

**1. D-13 (e), the tasting-body half has no click path**
- **Found during:** Task 2, `tasting-remove-restore`
- **Issue:** The plan's step "remove the tasting, then Add tasting and type a tasting note; Expect Restore tasting is gone" cannot be done by clicking. While a restore is pending the tasting section is collapsed and the page does not offer Add tasting (`onAddTasting` is null when `pendingUndo` is set, in both ceremonies), so no tasting-body field is editable with an undo pending. In the built app `pendingUndo` set always means the tasting section is closed.
- **Route taken:** the walk records the nearest reachable observations: Restore tasting present after a data removal, still present after a churn field edit, and Add tasting absent while the restore is pending (an expected fact). The retirement of `pendingUndo` by `isTastingBodyField` edits is a pure-ops property; Plans 02 to 05 must cover it in node tests of the record ops (it cannot show in a before/after walk).
- **Files modified:** 05-walk.mjs
- **Committed in:** ba812fa

**2. Selectors that differ from the plan's notes**
- The first `.save-ceremony` in the DOM is the pen foot's (Add tasting, Cancel, Save batch, no status region, no restore slot). The end-of-record ceremony (status region, Restore tasting) follows inside the pen. The walk clicks Restore tasting through the page role, not through the first ceremony.
- At draw is offered only while its group holds no other mark, so `record-pen-edit-handlers` clears the Hardness and Sweetness marks and both churn segments before picking it.

### Auto-fixed Issues

**1. [Rule 3 - Blocking] app/node_modules is absent in a fresh worktree**
- **Found during:** Task 1 verify (`npm --prefix app run build`)
- **Issue:** node_modules is gitignored, so the worktree had none; the build could not run.
- **Fix:** `cp -Rc` of the main checkout's `app/node_modules` into the worktree's `app/node_modules` (a copy, not an install; no package fetched, `app/package.json` and the lockfile untouched). The directory is gitignored.
- **Verification:** build succeeds; `git status --porcelain app/` stays empty.

**Total deviations:** 1 auto-fixed (1 blocking), 1 route change, 2 plan-scope additions (extra scenarios, wider snapshot scope).
**Impact on plan:** None on the baseline's meaning; the baseline covers every D-13 observation that can be reached, plus more.

## Issues Encountered

- The sandbox rejects compound commands in a worktree (variables in paths, `cd`, heredocs), so the walk was run with literal scratch paths. The plan's verify command uses `${TMPDIR:-/tmp}`; the equivalent below is what later plans should run.
- `05-walk-before.json` is 10.2 MB (every store dump is full records; the seeded versions embed their ingredient data). It is what the plan specifies; `compare` reads it in a moment. Plan 06 should keep its own after-file in the scratch directory, not commit it.

## Reuse for Plans 02 to 06

Build to a scratch directory (never `app/dist`, which `vite preview` on :4173 serves), record, compare:

```
npm --prefix app run build -- --outDir "$SCRATCH/dist" --emptyOutDir
PROBE_DIST="$SCRATCH/dist" node .planning/phases/05-split-the-recipe-page/05-walk.mjs record "$SCRATCH/after.json"
node .planning/phases/05-split-the-recipe-page/05-walk.mjs compare .planning/phases/05-split-the-recipe-page/05-walk-before.json "$SCRATCH/after.json"
```

A fresh worktree needs `app/node_modules` copied from the main checkout first. `record` takes about 45 s. `MATCH 94 snapshots` is the pass line; any `DIFF` line names the scenario, step and JSON path that moved. The baseline is from the unchanged app at 4f1f98f; no Phase 6 commit had touched `app/`, so Plan 06 has nothing to account for.

## Known Stubs

None.

## Threat Flags

None. The walk serves only the scratch build on ephemeral 127.0.0.1 ports, aborts every other host, uses fresh contexts, and never touches :4173 or :8077 (T-05-01). No package was installed (T-05-SC): `app/package.json` and `app/package-lock.json` are unchanged.

## Next Phase Readiness

Ready for Plan 02. No file under `app/` changed. Plan 06 runs the same walk after the last code change and compares.

## Self-Check: PASSED

- FOUND: .planning/phases/05-split-the-recipe-page/05-walk.mjs
- FOUND: .planning/phases/05-split-the-recipe-page/05-walk-before.json
- FOUND: aa389fe, ba812fa (both ancestors of HEAD)
- `git status --porcelain app/` empty; `git log 4f1f98f..HEAD -- app/` empty
