---
created: 2026-09-17T01:23:44.351Z
title: Second staleness pass on route-recipe-batch.md — reading order and Clear focus
area: planning
severity: minor
files:
  - .impeccable/surfaces/route-recipe-batch.md:106
  - .impeccable/surfaces/route-recipe-batch.md:109
  - .impeccable/critique/2026-09-16T18-58-36Z__app-src-ui-batchrow-jsx.md
  - .claude/skills/sketch-findings-sprinkles/batch-record-tasting-battery-structure.md:540
---

## Problem

Two more passages in `.impeccable/surfaces/route-recipe-batch.md` state things the shipped
code and `DESIGN.md` already contradict. Both were found while grepping for quick task
`260916-tai` and deliberately left out of its scope, because each is a separate stale thread
needing its own reasoning — not a variant of the two `260916-tai` fixed (the twin Saves and
click-again-clears).

1. **Line 106 — reading order.** § 6 says "Reading order is the sheet's page order." The
   front-matter revision superseded that and the brief never caught up. This is the fourth
   conflict in the 2026-09-16 BatchRow critique register (critique line 73), and the only one
   of the four still open after `260916-tai`.

2. **Line 109 — the per-axis Clear's focus return.** § 6 states unconditionally that the
   per-axis Clear returns focus to the scale. Sketch findings
   (`batch-record-tasting-battery-structure.md`, ~line 540) record it as
   keyboard-activation only, gated on `event.detail === 0`, so a mouse-initiated Clear does
   not move focus. The brief overstates the behaviour.

Same species as `260916-tai`: the code and `DESIGN.md` are right, the brief is behind. The
cost of leaving it is not a broken app — it is that the next person to plan against this
brief plans against a false statement, which is exactly how the 03.3.1 critique cycle was
spent.

## Solution

Doc-only. No `app/` edits — not source, not CSS, not tests.

- Verify both passages against the live file first; the line numbers above are a
  2026-09-16 grep result and will have moved once `260916-tai`'s edits land. Re-grep rather
  than trusting them.
- Read `DESIGN.md` for the front-matter reading order, and the sketch-findings entry for the
  `event.detail === 0` gate, before writing either correction. Cite the authority in the
  revised prose as `260916-tai` did.
- Follow the file's own supersession house style (the line 115 precedent): where a passage is
  a dated record of what was decided when, append a supersession note rather than rewriting
  history; where it states the current contract, replace it.
- Log the revision in the file's own Status line, per the convention that file enforces on
  itself.
- Route through `/gsd-quick` — every edit in this project goes through a GSD command, and
  Impeccable never edits directly.

**Sequencing:** must run after `260916-tai` lands. Same file, so the two must not run
concurrently.
