---
created: 2026-11-21T13:58:43.730Z
title: Add undo for destructive operations
area: ui
severity: major
files:
  - .impeccable/critique/2026-11-21T13-42-15Z__generators-boards-p12g2-steporder-dc-html-7590d248.md
  - .planning/phases/11-steps-structure-save-and-print/11-CONTEXT.md
  - .claude/skills/sketch-findings-sprinkles/references/cross-cutting-type-spacing-feedback.md
---

## Problem

Mark (2026-11-21, in chat): we should track undo for destructive operations.

It came out of the Impeccable critique of the Phase 12 Gate 2 Add step boards. In the creation
editor, Remove on a step takes the whole step away with no confirmation and no way to take it
back; Phase 11 D-14 only moves focus and announces the removal. The critique's view was that a
way to restore a removed step would do more for safety than any placement of the Remove control.
Phase 12 Gate 2 answers the placement only (Remove stays the last stop, away from the fields); it
does not add undo.

The same question applies to every other act that discards something the maker made. Not yet
inventoried; candidates to check in the built app: Remove on an ingredient row, removing a scale,
a problem or a target while creating, Cancel on a draft or a kept edit, deleting a note in the
record pen, and Delete recipe (its own todo, 2026-10-28-add-a-delete-recipe-feature.md).

## Solution

TBD. Not part of Phase 12; a candidate for after v2.0.

1. Inventory the destructive acts in the built app and, for each, what is lost and whether
   anything already guards it.
2. Mark decides the scope and the pattern. The sketch findings already hold a toast-plus-undo
   convention (cross-cutting type, spacing and feedback reference); check whether it still stands
   against the page notice as built before choosing between undo, a confirmation, or both.
3. Sid draws it, then a phase plan or quick tasks build it.
