---
phase: quick-260912-vni
plan: 01
subsystem: design-references
tags: [sketch-007, structural-contract, phase-03.3.1, batch-record, tasting-battery]
requires:
  - ".planning/sketches/007-full-battery/index.html (source of every verbatim string)"
  - ".planning/sketches/007-full-battery/README.md (the eight rounds' settled decisions)"
  - ".claude/skills/sketch-findings-sprinkles/references/batch-record-tasting-battery.md (sibling findings file, untouched)"
provides:
  - ".claude/skills/sketch-findings-sprinkles/references/batch-record-tasting-battery-structure.md — the self-sufficient structural contract the Phase 03.3.1 planner, executors, and checker cite instead of the sketch HTML"
affects:
  - "Phase 03.3.1 plan tasks (must cite the contract per task; ROADMAP Phase notes now require it)"
tech-stack:
  added: []
  patterns:
    - "Citable-by-section-name reference file so executor fragments are never paraphrase-of-paraphrase"
key-files:
  created:
    - .claude/skills/sketch-findings-sprinkles/references/batch-record-tasting-battery-structure.md
  modified:
    - .planning/ROADMAP.md
    - .claude/skills/sketch-findings-sprinkles/SKILL.md
decisions:
  - "The contract records the axis Clear and validation announcements as persistent writes and only the removal/restore toasts as five-second guarded self-clears, matching the sketch's two announce paths exactly (plain announce vs announceTransient) rather than flattening them"
  - "The contract records the churn date as blank-in-the-app with the sketch's 2026-08-02 marked as the working case's real date in the depiction only, per the plan's settled-defaults instruction"
  - "SKILL.md's batch-record row names the structural contract inline in its existing Reference cell (one row per design area kept)"
metrics:
  duration: ~25min
  completed: 2026-09-13
status: complete
actuals:
  tokens: 6500        # chars/4 over the realized diff (26,044 chars)
  tasks: 2
  commits: 2
  plan_head_before: 3d8960e
---

# Quick Task 260912-vni: Sketch 007 structural contract Summary

Wrote the self-sufficient structural contract for sketch 007's settled full-battery record pen — twelve citable sections carrying every verbatim label, option, status string, keyboard rule, save matrix, and responsive number, so the Phase 03.3.1 planner, its task executors, and the checker read it INSTEAD OF the 33KB sketch HTML — and amended the 03.3.1 roadmap notes to require citing it per task with browser conformance checks.

## Tasks Completed

| Task | Name | Commit | Files |
| ---- | ---- | ------ | ----- |
| 1 | Write the structural contract the 03.3.1 planner, executors, and checker cite instead of the sketch | fe25a2c | .claude/skills/sketch-findings-sprinkles/references/batch-record-tasting-battery-structure.md (new, 329 lines) |
| 2 | Point the roadmap and the skill index at the contract | 599c4eb | .planning/ROADMAP.md, .claude/skills/sketch-findings-sprinkles/SKILL.md |

## Verification Results

- **Task 1 string gate: STRINGS-OK.** All 58 required strings present — the six AXES rows verbatim, the nine segmented options, the five chips, the Bitter aria-label, the group aria-label, all toast/error/save/undo strings, both footer save labels, the churn-row label, the ladder numbers (186/216/640/760/768/44px), and all eleven gate-checked section headers (the twelfth, "## Origin", is present too).
- **Task 1 label gate: LABELS-CHECKED, zero MISSING LABEL lines.** All 15 `class="lbl">` captions from the sketch HTML appear in the contract verbatim ("Churn date" through "Next time"); "Any problems?" and "Declared for this recipe" (attribute-bearing variants the gate's grep cannot catch) are also present verbatim.
- **First gate run caught two real defects** — my own hard line-wraps had split "Clear tasting" and "optional — for the batch, the tasting, or both" across lines inside the file. Fixed by rewrapping; second run passes clean. The gate did its tampering job (T-QVNI1-01).
- **Task 2 checks:** `grep -c` finds the contract filename exactly once in each of ROADMAP.md and SKILL.md; `git diff -U0` shows the ROADMAP change confined to one line — the Phase notes paragraph with exactly the one appended sentence — and SKILL.md changed only in the batch-record row's Reference cell; porcelain shows no other file under .planning or the skill directory moved.

## Deviations from Plan

None — plan executed exactly as written. Both tasks' automated verification gates were run for real and passed (output quoted above). The sibling findings file `batch-record-tasting-battery.md` is untouched.

## Key Decisions

- The contract distinguishes the sketch's two announcement paths exactly: the removal/restore toasts self-clear after five seconds guarded (announceTransient), while the per-axis Clear ("{Axis name} cleared.") and the validation announcement write persistently (plain announce) — the plan's prose flattened these; the HTML is authoritative and the contract records the difference.
- The contract's save matrix carries the eighth round's exact control labels per tasting state ("Save batch only" on the churn row; "Save batch" / "Save batch & tasting" on the footer, state-based never content-sniffed).
- The deferred section carries all ten recorded-not-built items as single liftable lines: the two ROADMAP P3s, the three eighth-round P3s, the persistence contract, the matchMedia caveat, the read-view summary line, the closed anchors question with Scoopability riding it, and the removed-shortcut revisit.

## Commits

- fe25a2c: docs(quick-260912-vni): write the sketch 007 structural contract for the record pen
- 599c4eb: docs(quick-260912-vni): point the 03.3.1 roadmap notes and the skill index at the structural contract

## Self-Check: PASSED

- Contract file exists: `.claude/skills/sketch-findings-sprinkles/references/batch-record-tasting-battery-structure.md` (329 lines).
- Commit fe25a2c exists (1 file changed, 329 insertions); commit 599c4eb exists (2 files changed, 2 insertions, 2 deletions).
- Sibling findings file `batch-record-tasting-battery.md` unmodified (not in either commit's diff).
- Both commits measured from plan base 3d8960e: `git rev-list --count 3d8960e..HEAD` = 2.

## Known Stubs

None — documentation-only change; no code, no store, no UI.
