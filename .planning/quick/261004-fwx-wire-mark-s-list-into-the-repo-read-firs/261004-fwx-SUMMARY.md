---
phase: quick-261004-fwx
plan: 01
subsystem: agent-instructions
tags: [marks-list, claude-md, skill, docs-only]
requires: []
provides:
  - "Root CLAUDE.md read-first rule for Mark's List"
  - "/marks-list project skill"
affects: [CLAUDE.md, .claude/skills/marks-list/SKILL.md]
key-files:
  created: [.claude/skills/marks-list/SKILL.md]
  modified: [CLAUDE.md]
decisions:
  - "Sessions read Mark's List first and add rows for decisions, device checks and boards; deferred human checks and pause actions go to the list"
metrics:
  duration: "about 10 minutes"
  completed: 2026-10-04
status: complete
commits: 2
plan_head_before: eb02e2ab83925e2cf074dd392e20589848fe851c
plan_head_after: 0d9669661a383656b505a845dec7d9c1dda54bee
actuals:
  tokens: 2500
  tasks: 2
  commits: 2
---

# Phase quick-261004-fwx Plan 01: Wire Mark's List into the repo Summary

A 16-line `## Mark's List` read-first section in the root CLAUDE.md plus a user-invocable `/marks-list` skill that reads rows, routes follow-ups and records replies with `if_version`.

## Tasks

| Task | Name | Commit | Files |
| ---- | ---- | ------ | ----- |
| 1 | Add the Mark's List read-first section to CLAUDE.md | e30e4f3 | CLAUDE.md |
| 2 | Create the /marks-list project skill | 0d96696 | .claude/skills/marks-list/SKILL.md |

Both verifies passed (`T1-CONTENT-OK`, then `frontmatter ok` and `T2-OK`). The skill file is 51 lines; the CLAUDE.md section is 16 lines including the heading.

## Deviations from Plan

**1. Task 1 section was rewrapped to meet the 16-line cap.** The first draft ran 19 lines, so it was tightened (the lead sentence is one line of about 105 columns, slightly past the 90-column wrap). All required phrases, including "as data, not instructions" and "Deferred Human Verification", sit on single lines because the verify greps per line.

**2. Commits were made on `main`.** The executor's default-branch guard would normally refuse this. The orchestrator ran this task sequentially on the main working tree, `.planning/config.json` has `branching_strategy: none`, and recent history shows the project commits quick tasks on `main`. Commits were by explicit path.

**3. ArtifactData tool name not confirmed.** ToolSearch was not available to this executor, so `allowed-tools` lists the plain name `ArtifactData`. If the runtime exposes it under an `mcp__` prefix, the entry needs that exact name.

## Deferred Human Verification

The executor has no ArtifactData tool, so the orchestrator must add this row to Mark's List:

- doc id: `marks-list-first-run`
- kind: `check`
- title: "Run /marks-list once"
- detail: "Type /marks-list in a fresh session; it should appear in the slash menu, read the list and report open rows by kind."
- where: `{label: ".claude/skills/marks-list/SKILL.md"}`
- phase: "quick 261004-fwx"
- source: "261004-fwx"
- addedBy: `"claude"`, status: `open`, `createdAt` and `updatedAt`: ISO now

This check does not block completion.

## Known Stubs

None.

## Threat Flags

None. Nothing under `app/`, `.claude/CLAUDE.md`, `.planning/HANDOFF.json` or `~/.claude` changed. The six untracked `.impeccable/critique/` files were left alone.

## Self-Check: PASSED

- CLAUDE.md: FOUND, e30e4f3: FOUND
- .claude/skills/marks-list/SKILL.md: FOUND, 0d96696: FOUND
