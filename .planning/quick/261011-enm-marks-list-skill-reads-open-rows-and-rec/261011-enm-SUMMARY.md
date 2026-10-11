---
phase: quick-261011-enm
plan: 01
subsystem: marks-list-skill
tags: [skill, marks-list, tokens, touched-flag]
requires: []
provides:
  - "/marks-list reads open rows and page-touched rows only, never the whole collection"
affects: [".claude/skills/marks-list/SKILL.md"]
tech-stack:
  added: []
  patterns: ["touched flag as the 'changed since handled' marker; claim clears it"]
key-files:
  created: []
  modified: [".claude/skills/marks-list/SKILL.md"]
decisions:
  - "Query (a) status ne done plus query (b) touched eq true replace the full list read"
  - "Step 3 and the claim use the page's touched flag in place of handledAt versus updatedAt"
metrics:
  duration: "~10 min"
  completed: 2026-10-11
status: complete
actuals:
  tokens: 3400
  tasks: 1
  commits: 1
plan_head_before: 7a8679eb44f40a73b55bafc844d60ddd34df65d1
plan_head_after: 0c1b259d5d5efab98b452bc9b06cc5ca90c63900
commits: 1
---

# Quick 261011-enm: /marks-list reads open and touched rows only

Step 1 of the skill now makes two paged `query` calls, (a) `status ne done` and (b) `touched eq true`, and never lists the whole collection (about 140,000 tokens, 134,000 of them Done history). Step 3 reacts only to a `touched: true` row, the step 4 claim clears `touched`, and step 5 carries it as its re-read shows it.

## Commit

- `0c1b259` docs: /marks-list reads open and touched rows, never the whole list (only `.claude/skills/marks-list/SKILL.md`; unpushed). It was amended once before the final hash: the first commit left the file at 181 lines, one over the plan gate's 180, so step 3 was rewrapped to 14 lines and the commit amended.

## Edits (nine regions, Texts A to I)

Step 1, step 3, the claim in the step 4 intro, the passed-check bullet, the failed-check bullet, the scheduled-todo "Start a step only once" sentence, the `handledAt`/`updatedAt` sentences in step 5, step 6, step 7. Lines 1 to 25, step 2, the sketch and app bullets, the Mark-added-todo, note and done-todo bullets, and Boundaries through `</process>` are byte-identical to baa592e. Task 1's automated gate prints ALL_GATES_PASS under bash and zsh. The file is 180 lines; the only lines wider than 100 columns are the three pre-existing ones (line 3 and the two Boundaries lines).

## Planner choices, as built

- (a) The passed-check bullet reads each `closes` todo by id with `get` and finds the other checks naming it with one `query.where: [["kind", "eq", "check"]]`, once per run and only when a passed check carries `closes`. An old failed check therefore still blocks a todo from closing.
- (b) Step 3 clears `touched` (writes only `touched: false` with `if_version`, `updatedAt` as read; no reply, no `handledAt`, not in the report) on a touched row that meets none of the reaction tests: a `note` kind row, or a look Mark pressed Done on with no note. An `other` answer still waiting for its note is excluded and keeps `touched`.
- (c) Step 5 carries `touched` "as this re-read shows it" and never sets it (the coordinator's draft said "as the claim left it"). The two differ only when Mark touches the row during the work; the re-read value keeps his re-touch for the next run.
- (d) Step 3 lists the page actions that set `touched` (answer, note, Done, Schedule, every todo Mark adds) and those that do not (phase edit, Park, Unpark, Unschedule, Reopen); the reopened-row sentence depends on it.

## Noticed, recorded and not changed

- Side effect: rows the skill adds carry no `touched` field, so they count as handled. A "Draw: ..." row it creates as `scheduled` is no longer picked up as new work by the next run (the old `handledAt`-missing test would have picked it up).
- Pre-existing: when Mark presses Decided or Done on a row that is already handled and has an answer, the page sets `touched` again and the row qualifies again. The old `updatedAt` rule did the same.

## Contradictions found outside the nine regions

None. The top-to-bottom re-read found no sentence still comparing `handledAt` with `updatedAt`, no full-list read, no skill write that sets `touched: true`, and no `note` kind row getting anything but `touched: false`.

## Deviations from Plan

**1. [Rule 3 - Blocking] Rewrapped step 3 to meet the plan's own line-count gate.** The wrapped Text B pushed the file to 181 lines against the gate's `-le 180`. Step 3 was greedily rewrapped (words unchanged, backtick spans unbroken) to 14 lines and the commit amended while still unpushed. Commit: 0c1b259.

**2. Committed on `main`.** The orchestrator asked for a sequential run on the main checkout, so the protected-branch pre-commit assertion was not satisfied by a feature branch; the commit follows that instruction. Not pushed.

## ArtifactData dry run

Not run by the executor (no ArtifactData tool); the orchestrator runs it and records the counts here.

### Dry run (orchestrator)

<!-- Orchestrator: replace this line with the counts, per the plan's <verification>:
1. Query (a) `where: [["status", "ne", "done"]]`: row count, cursor? (expect about 30)
2. Query (b) `where: [["touched", "eq", true]]`: row count (expect 0 plus anything touched since republish)
3. Checks query `where: [["kind", "eq", "check"]]`: row count and pages
4. Cross-checks: rows carry a version usable as `if_version`; every `touched: true` row in (a) also appears in (b);
   count of rows in (a) the old test would still have picked up (answer or note, handledAt missing or older than updatedAt)
5. If a query shape is rejected, fix the wording in SKILL.md and the matching gate literal, and say so here. -->

## Self-Check: PASSED

- FOUND: `.claude/skills/marks-list/SKILL.md`
- FOUND: commit 0c1b259 (HEAD, touches only the skill file)
- `.planning/state.json` and the 03.6 `.gitkeep` remain unstaged; no Mark's List row was added.


## Dry run results (orchestrator, read only, 2026-10-11)

- Query (a) `status ne done`: 30 rows (about 7,000 tokens). Shape accepted.
- Query (b) `touched eq true`: 0 rows. The boolean shape is accepted; the flag starts with page version 24, so none is set yet.
- Query `kind eq check`: 39 rows (about 12,000 tokens), read only when a passed check carries `closes`.
- Returned rows carry a version usable for `if_version`: yes.
- The first dry run with a 30-day `updatedAt` window on done rows returned more than 100 rows (the project is five weeks old), which is why the design moved to the `touched` flag.
