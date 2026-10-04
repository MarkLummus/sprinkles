---
created: 2026-10-04T15:11:08.491Z
title: Update Impeccable between Phase 03.5 and Phase 04
area: design
severity: minor
files:
  - .planning/ROADMAP.md:462
  - .planning/ROADMAP.md:572
  - .impeccable/
---

## Problem

The installed Impeccable skill (`~/.claude/skills/impeccable`) is 4.2.0. The latest GitHub release is Skill 4.5.0 (`skill-v4.5.0`, 2026-10-02); npm lags at 4.1.0, so the update comes from GitHub, not `npm view`. Engine 0.1.9 to 0.1.11 shipped in the same window.

Release notes reviewed 2026-10-04:
- 4.4.0: detector findings measure what the browser draws and name the screen width; `audit`, `adapt` and `harden` exercise each control's primary gesture; new `/impeccable generate`; component-kit and first-viewport review. These can shift critique results.
- 4.5.0: ignore entries land where git reads them in a linked worktree (relevant to GSD worktree runs); padding findings no longer treat an unresolved CSS variable as zero.

Timing: after Phase 03.5 (Separate the recipe from the sheet) finishes, before Phase 4 (Prepare the next version for making) starts, so critiques inside one phase use one version.

## Solution

1. Before updating, confirm `.impeccable/` files and the critique loop work on 4.2.0.
2. Update the skill from the GitHub release.
3. Re-run a critique on a Phase 03.5 surface and compare to the earlier snapshot; note any findings that moved because of the new detector.
4. Update the project notes if the install path or commands changed.
