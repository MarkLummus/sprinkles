---
phase: quick-261004-wc0
plan: 01
subsystem: marks-list-skill
tags: [skill, marks-list, todos, checks]
key-files:
  modified:
    - .claude/skills/marks-list/SKILL.md
status: complete
commits: 1
plan_head_before: 6be9fbc
plan_head_after: 002e35b
actuals:
  tokens: 1500
  tasks: 1
  commits: 1
completed: 2026-10-04
---

# Quick 261004-wc0: /marks-list closes the todos a passed check covers

A `check` row on Mark's List may now carry `closes` (todo doc ids), and a passed `done` check closes those todos as well as itself, so Mark presses Done once instead of twice.

## What changed (commit 002e35b, only `.claude/skills/marks-list/SKILL.md`)

- Step 3 also picks up a `check` with status `done` (note optional).
- Step 4, passed check: reads `closes`; for each todo not already `done`, if every other check naming it is also `done` and passed, updates it (`status: done`, `resolvedAt` now, reply `Closed with its passed check (<check doc id>).`) and moves its file `pending/` to `completed/` as the done-todo bullet does. If another linked check is open or failed, the todo stays `scheduled` and the reply says so.
- Step 4, failed check: closes the check with the defect in the reply, leaves the todos `scheduled`, proposes a `Fix: ...` row. An unclear check note goes to the decide row; its todos stay `scheduled`.
- Step 5: adds `Fix: ...` (status `open`, task in `detail`) to the follow-up rows; every `check` row Claude adds carries `closes` naming its Build, Fix or Draw todo.
- Boundaries: Claude sets a todo `done` only through a passed linked check; only `check` rows carry `closes`; a `look` row never closes a todo.

## Verification

The plan's automated gate printed `ALL_GATES_PASS`. Lines 1-30 and steps 6-7 are byte-identical to cfa9ae0, steps are numbered 1-7, all required substrings are present, HEAD touches only the skill file. The file is 126 lines (wc). I did not run a separate full-file contradiction read beyond the gate; the edits were written to match the checks the plan listed (step 3 still excludes `note` rows; `updatedAt` stays as read; version conflicts fall back to step 5's existing re-read).

## Deviations / things that did not go as planned

None in the edits. One note: the pre-commit HEAD assertion in the executor protocol would flag `main` as a protected branch. The orchestrator explicitly said to run on the main tree, and recent commits already sit on `main`, so I committed there. The commit is not pushed. The pre-existing modified and untracked files (canvas-generators, sketches, .impeccable) were not staged.

## Points to raise with Mark (from the planner)

1. `Fix: ...` rows are new. The skill did not say "Fix: ..." before; a failed check now leaves one as an `open` todo holding the proposed task. Mark schedules it, and the scheduled-todo bullet runs it.
2. Only `done` checks close todos. An open check whose answer says it passed is still closed by its reply alone and closes no todo.
3. A failed check leaves the original todo `scheduled` for Mark's own Done.
4. Checks written by executors or other sessions follow CLAUDE.md, not this skill, so they carry `closes` only if those sessions add it.
5. The trailing `</output>` line at the end of the skill has no opening tag. It was there before; left alone.

No Mark's List row was added (no ArtifactData tool in this run, and nothing here waits on Mark beyond the points above).

## Self-Check: PASSED

- `.claude/skills/marks-list/SKILL.md` exists; commit 002e35b exists and touches only that file.
