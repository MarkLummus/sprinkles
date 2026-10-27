---
phase: 11-steps-structure-save-and-print
plan: 14
subsystem: testing
tags: [playwright, webkit, walk, baseline, order-check, patch-guard]

requires:
  - phase: 11-steps-structure-save-and-print
    provides: 11-walk.mjs (record, compare, selftest), 11-walk-record-base.sh and the committed 11-walk-before.json (plan 11-01)
provides:
  - "11-walk.mjs record <out> --keep-text, orderProblems, ordercheck and ordertest"
  - "11-walk-record-base.sh knobs WALK_OUT, WALK_KEEP_TEXT and WALK_PATCH, with the patch guard"
affects: [11-07]

actuals:
  tokens: 4500
  tasks: 2
  commits: 2

plan_head_before: 619eba314d83e13a1c511aadb312ec0eee3e1767
commits: 2
plan_head_after: 7029a5633879d81e6813c618cc301988e96370ee

tech-stack:
  added: []
  patterns:
    - "Order-only comparison: text lines, fields, buttons and invalid compare as multisets; every other leaf, stores and methodHash included, by diffLeaves"
    - "Patch guard: the BASE worktree takes a patch only if it changes exactly two files, equals BASE outside two regions (git show), and equals the checkout inside them"

key-files:
  created: []
  modified:
    - .planning/phases/11-steps-structure-save-and-print/11-walk.mjs
    - .planning/phases/11-steps-structure-save-and-print/11-walk-record-base.sh

key-decisions:
  - "The changed-file rule reads git status --porcelain (untracked files included), not git diff --name-only, because a file the patch adds is untracked and diff would not list it"
  - "ordertest keeps to the six lines the plan names; fields, buttons and invalid reorder through the same multiset rule orderProblems applies to text"

requirements-completed: [MAKE-07]

coverage:
  - id: D1
    description: "record --keep-text keeps text and methodText; without it a BASE recording compares as MATCH 94 snapshots against 11-walk-before.json"
    requirement: "MAKE-07"
    verification:
      - kind: integration
        ref: "11-14-PLAN Task 1 verify: record base-again.json then compare -> MATCH 94 snapshots; git diff --quiet on 11-walk-before.json"
        status: pass
    human_judgment: false
  - id: D2
    description: "ordercheck passes only an order-only difference; ordertest shows it accepting same and a swap and refusing a changed line, store leaf, methodHash and field value"
    requirement: "MAKE-07"
    verification:
      - kind: unit
        ref: "node 11-walk.mjs ordertest order-plain.json -> six PASS ordertest lines; ordercheck of the file against itself prints FAIL ordercheck: no snapshot reordered (exit 1)"
        status: pass
    human_judgment: false
  - id: D3
    description: "The record script refuses a patch to another file, one whose groupPortionsByStep differs from the checkout, and an unrelated edit outside each region, before any build"
    requirement: "MAKE-07"
    verification:
      - kind: integration
        ref: "11-14-PLAN Task 2 verify: four FAIL patch lines, none of the four WALK_OUT files written"
        status: pass
    human_judgment: false
---

# Phase 11 Plan 14: Order-only baseline tools Summary

**The walk's record script now applies a patch to the BASE worktree only when it holds the row order alone, and 11-walk.mjs records snapshot text and proves two recordings differ in order of lines, fields, buttons and marked fields and nothing else.**

## Performance

- **Tasks:** 2 (a tracer, then an auto task)
- **Files modified:** 2, none under `app/`, none the committed baseline

## Accomplishments

- `record <out> --keep-text` adds `text` and `methodText` to each snapshot, the strings it hashes. Without the flag nothing changes: a BASE recording compares `MATCH 94 snapshots` against `11-walk-before.json`, and `selftest` still prints its ten PASS lines.
- `orderProblems(plain, ordered)` -> `{ problems, reordered, compared }`, with the modes `ordercheck` and `ordertest`. Text lines, fields, buttons and invalid compare as multisets; every stores leaf and every other snapshot leaf (methodHash and methodText included) must be equal. `ordercheck` prints `PASS ordercheck <n> of <m> snapshots reordered; ...`, or `FAIL ordercheck <scenario> / <step>: <what>` lines, or `FAIL ordercheck: no snapshot reordered`; the last exits 1 for a file checked against itself.
- `ordertest` on a BASE recording with text prints `PASS ordertest same`, `reorder`, `changed-line`, `store`, `method` and `field`: the file against itself gives reordered 0, two swapped lines give reordered 1, and each of a changed line, stores leaf, methodHash and field value is refused at the step it changed.
- `11-walk-record-base.sh` takes `WALK_OUT`, `WALK_KEEP_TEXT=1` and `WALK_PATCH` (default `11-walk-order.patch` once it exists, `none` skips). Given a patch, it applies it to the BASE worktree before the build and refuses with one `FAIL patch:` line, exit 1, nothing built or recorded, unless: exactly IngredientTable.jsx and Method.jsx change; each region (groupPortionsByStep to the next bare `}`, the `const usesNames` line) is found once in BASE, the patched worktree and the checkout; both files equal BASE outside their region; and both regions equal the checkout's.
- Shown refusing, in scratch: a patch to `app/src/main.jsx`; in-region comments that differ from the checkout (`groupPortionsByStep differs from the checkout`); the same plus an unrelated edit outside groupPortionsByStep in IngredientTable.jsx; the same plus one outside the usesNames line in Method.jsx. Also shown accepting: the in-region-only patch recorded to scratch once the same two edits were applied to this checkout (then reverted), so the passing path runs through the build and record.

## Task Commits

1. **Task 1 (tracer): record --keep-text, orderProblems, ordercheck, ordertest, WALK_OUT, WALK_KEEP_TEXT** - `26df4d93` (feat)
2. **Task 2: WALK_PATCH and the patch guard** - `7029a563` (feat)

Tracer gate: the Task 1 `<verify>` is automated-only, so under `end-of-phase` it was run end to end (record with text, ordertest, ordercheck refusal, plain record, compare, selftest, baseline unchanged) before Task 2.

## Verification

- Task 1 verify: exit 0; six `PASS ordertest` lines; `MATCH 94 snapshots`; ten `PASS selftest` lines; `git diff --quiet` on `11-walk-before.json` exit 0.
- Task 2 verify: exit 0; the four refusal logs hold the expected `FAIL patch:` lines and none of the four refused WALK_OUT files exists; six `PASS ordertest` lines again.
- Acceptance greps: `orderProblems` 1, `--keep-text` 9, `WALK_PATCH` 2, `WALK_OUT` 2, `WALK_KEEP_TEXT` 2, `11-walk-order.patch` 2, `FAIL patch:` 5, `changes outside groupPortionsByStep` 1, `changes outside the usesNames line` 1, `git show` 2. No commit of this plan touches `app/` or `11-walk-before.json`.
- Full suite after the plan: 122 files, 3931 tests passed. Baseline: the orchestrator's count on main at 619eba31 is the same 3931 (122 files); no `app/` file changed, so the count could not move. I ran the suite once, at the end.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] The changed-file rule uses `git status --porcelain`, not `git diff --name-only`**
- **Found during:** Task 2 design
- **Issue:** The plan names `git diff --name-only`. A file a patch adds is untracked after `git apply`, so diff would not list it and a patch adding a third file beside the two allowed would pass the file rule.
- **Fix:** `git -C <worktree> status --porcelain --untracked-files=all`, paths cut from each line. The refusal line is the plan's.
- **Files modified:** 11-walk-record-base.sh
- **Commit:** 7029a563

**2. [Rule 2 - Missing critical] A file the patch leaves unreadable is refused, not thrown**
- **Found during:** Task 2
- **Issue:** A patch that deletes one of the two files lists correctly under the file rule, and the later read would throw with no `FAIL patch:` line.
- **Fix:** A read error in any copy prints `FAIL patch: <file> region not found once in <copy>`.
- **Files modified:** 11-walk-record-base.sh
- **Commit:** 7029a563

**Total deviations:** 2 auto-fixed (1 bug, 1 missing critical). **Impact:** both tighten the guard; no plan text changed.

### Notes

- Recordings ran with `TMPDIR` pointed at a private scratch directory so a sibling wave-2 worktree could not share `sprinkles-11/base`. The plan's `$TMPDIR/sprinkles-11` paths are unchanged.
- The four refusal patches were built by a script outside the repo and not committed, as the plan asks.

## Known Stubs

None.

## Threat Flags

None: harness scripts only; no network, auth or schema surface in the app.

## Next Phase Readiness

Plan 11-07, Task 3 can run its sequence with these tools: `WALK_PATCH=none WALK_KEEP_TEXT=1 WALK_OUT=<plain>`, then `WALK_KEEP_TEXT=1 WALK_OUT=<patched>` with `11-walk-order.patch`, `ordertest <plain>`, `ordercheck <plain> <patched>`, then the plain `sh 11-walk-record-base.sh` for the new baseline. It should repeat the unrelated-edit refusal with the real patch.

## Self-Check: PASSED

- Modified files found: 11-walk.mjs, 11-walk-record-base.sh (under `.planning/phases/11-steps-structure-save-and-print/`).
- Commits found: 26df4d93, 7029a563.
