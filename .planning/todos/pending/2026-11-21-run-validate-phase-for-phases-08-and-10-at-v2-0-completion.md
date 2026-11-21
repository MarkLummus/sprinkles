---
created: 2026-11-21T12:56:32.588Z
title: Run validate-phase for phases 08 and 10 at v2.0 completion
area: planning
severity: minor
files:
  - .planning/phases/08-split-the-recipe-page-along-its-jobs/
  - .planning/phases/10-the-creation-editor-without-save/
---

## Problem

`/gsd-health` (2026-11-21) reports W009 for two v2.0 phases: each has a Validation Architecture
section in its `RESEARCH.md` but no `VALIDATION.md`.

- Phase 08, split the recipe page along its jobs
- Phase 10, the creation editor without Save

Mark (2026-11-21, in chat) asked that this be done at v2.0 milestone completion, not during
phase 12. Until then the two W009 warnings are expected.

## Solution

When v2.0 completion starts (`/gsd-audit-milestone` or `/gsd-complete-milestone`), run
`/gsd-validate-phase 08` and `/gsd-validate-phase 10` first, then re-run `/gsd-health` and confirm
both W009 warnings are gone.
