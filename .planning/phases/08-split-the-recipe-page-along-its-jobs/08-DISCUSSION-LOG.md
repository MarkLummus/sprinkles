# Phase 8: Split the recipe page along its jobs - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-10-17
**Phase:** 8-Split the recipe page along its jobs
**Areas discussed:** Record-pen handlers, Order and risk of the cuts, Merge order with Phase 9, Proof of no change

---

## Record-pen handlers

| Option | Description | Selected |
|--------|-------------|----------|
| Extract them last, as a bonus | Do the six jobs first; cut the record-pen handlers into a hook if time allows, else they stay | ✓ |
| Extract them as part of the phase | A seventh required cut; thin shell, more risk to the record flows | |
| Leave them in the page | Cut only the six jobs | |

**User's choice:** Extract them last, as a bonus.

## Order and risk of the cuts

| Option | Description | Selected |
|--------|-------------|----------|
| Second, after the announcer | Research order; loading is mechanical and keeps loadFailed in one place | ✓ |
| Late, with the kept drafts | Move loading together with the draft restore | |
| You decide | Leave the order to the planner | |

**User's choice:** Second, after the announcer.

| Option | Description | Selected |
|--------|-------------|----------|
| Each cut lands green or is reverted | Own commit per cut; a cut that cannot be made green is dropped and noted | ✓ |
| Do not ship a partial split | Merge only when all six jobs are cut | |

**User's choice:** Each cut lands green or is reverted.

## Merge order with Phase 9

| Option | Description | Selected |
|--------|-------------|----------|
| Finish Phase 8 first | Phase 8 merges before Phase 9 executes | ✓ |
| Side by side | Both at once; baseline moves and the draft restore path conflicts | |

**User's choice:** Finish Phase 8 first.

## Proof of no change

| Option | Description | Selected |
|--------|-------------|----------|
| Re-record it first | If the old baseline no longer matches at the base commit, record a new before-walk there | ✓ |
| Investigate any difference first | Find what changed before recording a new baseline | |

**User's choice:** Re-record it first.

| Option | Description | Selected |
|--------|-------------|----------|
| No, the walk is the evidence | iPad is checked once, in Phase 12 | ✓ |
| Yes, one quick check at the end | A short device row on Mark's List | |

**User's choice:** No, the walk is the evidence.

## Claude's Discretion

Module names and homes, the props of `RecipeSheet`, and the shell test's exact assertions.

## Deferred Ideas

None.
