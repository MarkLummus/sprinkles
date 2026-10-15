# Phase 7: Creation primitives - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-10-14
**Phase:** 7-Creation primitives
**Areas discussed:** What a new root version carries, How the key allocator knows what was held, A row's step and name when a recipe has no steps

---

## What a new root version carries

| Option | Description | Selected |
|--------|-------------|----------|
| Leave them out, guard the advisories | No equipment, process or iceEd; advisories.js skips when absent | ✓ |
| Fill with neutral defaults | Seed keys with made-up values | |
| Caller supplies them | Required arguments to createRecipe | |

**User's choice:** Leave them out, guard the advisories.

| Option | Description | Selected |
|--------|-------------|----------|
| Caller gives the label; title is the name | versionLabel required; sheetTitle = name; coefficientSetId '' | ✓ |
| Label defaults to the name | | |
| Fixed first label | | |

**User's choice:** Caller gives the label; title is the name.
**Notes:** Scouting found `subScaleAdvisory` and `hydrationAdvisory` read `equipment` and `process` unguarded, so the guard is required, not optional.

---

## How the key allocator knows what was held

| Option | Description | Selected |
|--------|-------------|----------|
| Highest key in method, plus one | Removed steps count; no schema change | ✓ |
| Stored counter on the version | Needs a schema bump | |
| Also read the parent chain | | |

**User's choice:** Highest key in method, plus one.

---

## A row's step and name when a recipe has no steps

| Option | Description | Selected |
|--------|-------------|----------|
| Row builder takes a step, default 1 | method [] at creation; first added step gets key 1 | ✓ |
| Allocator also counts the keys rows name | | |
| Caller must pass a step with every row | | |

**User's choice:** Row builder takes a step, default 1.

| Option | Description | Selected |
|--------|-------------|----------|
| Entry's name; caller passes the id | Optional name override | ✓ |
| Entry's name only, no override | | |
| Builder makes the id itself | | |

**User's choice:** Entry's name; caller passes the id.

---

## Claude's Discretion

- Module and function names, rows-built-or-specs input, how blank input is refused, plan breakdown.

## Deferred Ideas

- Stored step-key counter; equipment/process/targets settings for a new recipe; the creation screen and saving.
