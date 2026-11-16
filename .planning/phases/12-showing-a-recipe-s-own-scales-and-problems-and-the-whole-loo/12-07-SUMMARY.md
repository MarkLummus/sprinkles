---
phase: 12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo
plan: 07
subsystem: testing
tags: [board-engine, playwright-webkit, sketch-015, conformance]
requires: []
provides:
  - "12-board-check.mjs: Phase 11 board engine with one panel reference, an own-Page against side, the attr check and the appStyle option"
  - "12-board-selftest.mjs: read-self-1366 pass and five refusal stand-ins on sketch 015's boards"
affects: [12-04]
tech-stack:
  added: []
  patterns: ["one { selector, index } panel reference through every engine stage", "against side cached on its own Page"]
key-files:
  created:
    - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-check.mjs
    - .planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-selftest.mjs
  modified: []
key-decisions:
  - "attr checks are objects { attr: '<name>' } alongside the plain check names, reported as kind 'value'"
  - "appStyle is injected after route and steps with a fonts.ready wait, before the scroll reset"
requirements-completed: [TASTE-04, LOG-01]
duration: 20min
completed: 2026-11-16
status: complete
commits: 2
plan_head_before: e37db11a6f808f36d20c808a2812608557c22c28
plan_head_after: ca2cbbda5079b9ea77ee4c2654871b3974240b0c
actuals:
  tokens: 11600
  tasks: 2
  commits: 2
---

# Phase 12 Plan 07: Board engine for sketch 015 Summary

**11-board-check.mjs copied to 12-board-check.mjs with a selector-and-index panel reference through every stage, an against side on its own Page, an attr check and an appStyle option, proved on sketch 015's boards with no build.**

## What was done

- Task 1 (tracer): the engine finds a sketch 015 panel by `panelSelector` and `panelIndex`. A panel naming neither keeps the Phase 11 `.p4-win.<id>` lookup at index 0, and that class now appears in executable code in one helper only (`panelRef`). The reader, the kind and not-found test, the against side, the evidence lift and the 1 px style all take the `{ selector, index }` pair. `openBoard` gained a second cache for against sides. `read-self-1366` (reading panel against itself) passes all 13 checks and prints `PASS selftest read-self-1366`.
- Task 2: five stand-ins on record-pen.html and reading.html are refused for the right kinds: `pen-count` (count), `pen-missing` (anchor), `pen-undeclared` (undeclared), `read-blind` (selftest-blind), `pen-attr` (value). Run output: `19 PASS, 0 FAIL`, ending `ENGINE PROOFS PASS`. The evidence folder holds the board and app picture pair for `read-self-1366` plus README.md.
- The header of 12-board-check.mjs lists the four changes beside the Phase 11 list, and records that the evidence lift for an anchored full page is rewritten but not exercised (every sketch 015 panel is cropped) and that appStyle is first exercised by 12-04.

## Deviations from Plan

### Auto-fixed Issues

None. One note on commit shape: the engine was copied and all four changes were made in one pass, so the Task 1 commit holds the engine with the attr check and appStyle option already in it. Task 2's commit holds the five stand-ins and the selftest header. No behaviour differs from the plan.

## Verification

- Task 1 verify: `ENGINE SELF-HELD PASS`.
- Task 2 verify: `ENGINE PROOFS PASS` (read-self-1366 pass; refused: selftest-blind, count, anchor, undeclared, value).
- Acceptance greps: `p4-win` in non-comment lines = 1; `outDir|run build` in non-comment lines = 0; `127.0.0.1` present; `not exercised` present; `git diff` of Phase 11 harness files empty.
- Run with PROBE_DIST at an empty scratch folder; nothing read or built app/dist.

## Known Stubs

None.

## Threat Flags

None. The engine loads board pages from `file:` only and aborts every other request, as in Phase 11.

## Self-Check: PASSED

- 12-board-check.mjs and 12-board-selftest.mjs exist in the phase folder.
- Commits e0652a75 and ca2cbbda are on the branch.
