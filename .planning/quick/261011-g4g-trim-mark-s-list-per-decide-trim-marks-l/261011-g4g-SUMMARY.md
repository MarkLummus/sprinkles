---
phase: quick-261011-g4g
plan: 01
subsystem: marks-list
tags: [docs, skill, marks-list]
status: complete
key-files:
  modified:
    - .claude/skills/marks-list/SKILL.md
    - CLAUDE.md
commits: 2
plan_head_before: 604eeb084bbeb7b4ed5d4f54242a68e5c53e2b83
plan_head_after: 3a1b318
actuals:
  tokens: 9000
  tasks: 2
  commits: 2
---

# Quick 261011-g4g: Trim Mark's List Summary

The /marks-list skill and CLAUDE.md's Mark's List rule now add and handle only Mark-owned rows (decide, look, check, "Run:"). The skill checks `git log` before it retries a claimed row.

## Commits

- `88f1dc1` docs: /marks-list keeps decide, look and check rows and drops its own work queue (SKILL.md only)
- `3a1b318` docs: Mark's List rule adds only rows that wait on Mark (CLAUDE.md only)

Both are unpushed. Skill size: 196 lines / 2,670 words before; 159 lines (wc) / 2,155 words after.

## Planner choices (a) to (g), as built

- (a) Step 3's no-reaction examples gain "a todo Mark pressed Schedule on with no note". `scheduled` no longer routes anything.
- (b) A failed check's proposed `/gsd-quick` or `/gsd-debug` task becomes a Mark-owned "Run: ..." row.
- (c) "No follow-up lives only in a reply" covers next steps for Mark. A decided sketch redraw starts `sid` with the rule that Sid adds a look row when the board is ready. A `/gsd-quick` reports its commits and needs no row.
- (d) Boundaries' close rule keeps "a todo whose quick has landed".
- (e) The retry check reads `git log` for a commit since `handledAt` naming the row's doc id, title or task. If the work landed, only the reply is written, naming the commit.
- (f) The skill is about 19% shorter, not a third to a half. More would cut content the decision keeps.
- (g) Left alone: step 1 still says "two `query` calls" but lists three reads (a), (b), (c), a leftover from d281e34. Existing page rows with `owner: "claude"`, a `closes` list or a build-/fix-/draw- id are untouched; the skill just stops acting on those fields.

## Mark's amendment

The "a check points to its UAT item instead of copying it" clause was dropped. Check rows keep their full steps in `detail`. CLAUDE.md's Deferred human checks bullet is byte-identical (region gate). Neither file mentions swapping steps for a pointer.

## Deviations from Plan

None - plan executed exactly as written. Both gates print ALL_GATES_PASS after both commits.

## Contradictions found outside the edited regions

None that matter. Step 1 (a) still describes query (a) as "every open, scheduled and parked row"; that describes page statuses, not a route, so it was left alone.

## Mark's List

The executor wrote nothing to Mark's List. Replying on or closing `decide-trim-marks-list` is the orchestrator's call.

## Self-Check: PASSED

- 88f1dc1 and 3a1b318 are ancestors of HEAD.
- `.claude/skills/marks-list/SKILL.md` and `CLAUDE.md` exist; `git status --porcelain` is clean in the worktree.
