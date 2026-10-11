---
phase: quick-261011-dkf
plan: 01
subsystem: tooling
tags: [marks-list, skill, claude-md]
requires: []
provides:
  - "/marks-list claims a row before acting, sets owner/needs on rows it adds, closes finished rows per CLAUDE.md"
affects: [.claude/skills/marks-list/SKILL.md]
key-files:
  modified:
    - .claude/skills/marks-list/SKILL.md
decisions:
  - "Claim first: step 4 writes handledAt with if_version before any route acts; step 5 keeps it"
  - "CLAUDE.md wins over the skill on closing rows and owner/needs"
metrics:
  duration: "~10 min"
  completed: "2026-10-11"
status: complete
actuals:
  tokens: 4500
  tasks: 1
  commits: 1
plan_head_before: 89063411443b50e3eaf9a6b406c5631df22c6dd6
plan_head_after: baa592e
---

# Phase quick-261011-dkf Plan 01: /marks-list claim-first, owner/needs, closure Summary

One edit to `.claude/skills/marks-list/SKILL.md` (commit baa592e): `/marks-list` now claims a row with `handledAt` plus `if_version` before any route acts, sets `owner`/`needs` on every row it adds, closes finished Run/Fix/Build rows per CLAUDE.md, waits on an empty `other` note, and records the page's `updatedAt` rule. The file went from 126 to 158 lines.

## What changed (seven regions, Texts A to G)

- Step 3: the page moves `updatedAt` only for an answer, a note, Done or Schedule (finding 7).
- Step 4 intro: empty `other` note on a still-open row is skipped and nothing is claimed (finding 4); then the claim, before the first route bullet (finding 2). A failed version check re-reads and restarts from step 3.
- Passed-check and failed-check bullets: a check Mark already pressed Done on gets only `handledAt` and the reply; an open check gets the reply only and stays open.
- Scheduled-todo bullet ending: `Start a step only once` names the claim's `handledAt`; the row closes when the quick's commits land unless a `check` it adds names it in `closes`.
- Step 5: re-read, reply with `if_version`, keep the claim's `handledAt`, never redo work on a conflict; the owner/needs rule stated once and named in every recipe that creates a row (finding 8).
- Boundaries: replaced the "only through a passed linked check" sentence with CLAUDE.md's closure rule (finding 3).

## Planner choices, as built

- (a) Step 5 keeps the claim's `handledAt`; a version conflict in step 5 retries the write and never redoes the work.
- (b) A row a `check` names in `closes` is finished when that check passes, not when its commits land (keeps the commit 002e35b check-closes-todo path alive).
- (c) Decisions, checks and looks stay Mark's until he marks them done, even once answered.
- (d) A scheduled todo the skill closes at quick landing also has its file moved `pending/` to `completed/`, as the passed-check path does.
- (e) The Run recipe now says the command stays on the list "until it has run and its row is closed", not until Mark's Done.
- (f) A todo that a passed check closes is updated without a claim, and still gets `handledAt` now.

## Accepted risk

T-dkf-05: a run that dies between the claim and step 5 leaves a row with `handledAt` and no `reply`, and later runs skip it. The row stays open on the page with no reply, and any answer or note Mark adds moves `updatedAt`, so it is picked up again. Not widened here.

## Verification

The plan's automated gate printed all checks passing before the commit (lines 1 to 30, untouched bullets, steps 6 and 7 and Boundaries head and tail byte-identical to 002e35b; steps 1 to 7; 158 lines, under 165; all new phrases present, all replaced phrases gone; claim sits before the first route bullet; each row recipe names its owner). After the commit: HEAD touches only the skill file, the index is empty, and `.planning/state.json` and the 03.6 `.gitkeep` remain unstaged. No file deletions in the commit.

## Deviations from Plan

None - plan executed exactly as written. The commit was made on `main` as the orchestrator directed (sequential run, no worktree); it is unpushed.

## Contradiction re-read

The full top-to-bottom re-read found no contradictions outside the seven edited regions. Step 3 still excludes `note` rows; only the claim and the no-claim todo case set `handledAt`; no sentence tells Claude to set a check or decide row's `status`; no Run row waits on Mark's Done alone; a `look` row acts on `closes` nowhere.

## Known Stubs

None.

## Notes

No Mark's List row was added or changed by the executor. Whether any planner choice (a) to (f) needs Mark's confirmation is the orchestrator's call.

## Self-Check: PASSED

- FOUND: .claude/skills/marks-list/SKILL.md
- FOUND: baa592e (ancestor of HEAD)
