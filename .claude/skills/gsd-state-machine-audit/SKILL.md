---
name: gsd-state-machine-audit
description: "The per-phase state machine audit. GSD dispatches it after a phase executes (the state-machine-audit capability's step at execute:post). Runs the state-machine-audit skill scoped to the app/src files the phase changed. Not for direct use: Mark and Claude invoke state-machine-audit."
user-invocable: false
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
  - Write
  - Edit
  - Agent
  - ArtifactData
  - ToolSearch
---

<objective>
After a phase executes, audit the implicit state machines in the files that phase changed, by
running `.claude/skills/state-machine-audit/SKILL.md` on the phase's diff. This step is advisory:
it never blocks the phase and never fixes anything.
</objective>

<process>
1. The argument is the phase number, as GSD passes it. Find the phase's range. The base is the commit the phase's first plan started from: the
   earliest `plan_head_before` in the phase's SUMMARY files, or, when none records it, the parent
   of the first commit whose message names the phase. The head is `HEAD`.
2. List the files in scope:
   `git diff --name-only <base>..HEAD -- app/src | grep -v '\.test\.'`.
   If the list is empty (a phase with no app change), say "State machine audit: no app/src
   change in this phase, skipped" and stop. Write nothing.
3. Read `.claude/skills/state-machine-audit/SKILL.md` and follow its process with that file list
   as the scope (its `diff <base>` form). Its boundaries apply unchanged.
4. Do not stop to ask Mark anything. Confirmed defects go to Mark's List as bug rows, as that
   skill says; a question becomes a decide row. Name the rows in the phase's final report.
5. Report in two or three lines: files in scope, claims checked, rows filed, the audit note's
   path.
</process>

<switch>
`workflow.state_machine_audit` in `.planning/config.json` turns this step off (`false`) and on.
The capability's source is `.planning/capabilities/state-machine-audit/capability.json`; `.gsd/`
is not in git, so a fresh clone installs it with
`gsd-tools capability install ./.planning/capabilities/state-machine-audit --scope project`.
</switch>
