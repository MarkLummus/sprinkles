---
name: gsd-ui-review
description: "Retroactive visual audit of implemented frontend code — runs the Impeccable audit (project override of the generic 6-pillar audit; Impeccable owns design QA per the working agreement)"
argument-hint: "[phase]"
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Grep
  - Agent
  - AskUserQuestion
  - Skill
  - mcp__gsd-browser__browser_navigate
  - mcp__gsd-browser__browser_snapshot
  - mcp__gsd-browser__browser_evaluate
  - mcp__gsd-browser__browser_console
  - mcp__gsd-browser__browser_screenshot
  - mcp__gsd-browser__browser_find_element
  - mcp__gsd-browser__browser_batch
  - mcp__gsd-browser__browser_wait_for
  - mcp__gsd-browser__browser_emulate_device
---

<objective>
Conduct the retroactive visual audit using the Impeccable audit method instead of the
generic 6-pillar audit. This project skill shadows the global GSD `gsd-ui-review` skill:
the capability registry dispatches `Skill("gsd-ui-review")` at `verify:post`, and this
file wins over the user-level install. Advisory — never blocks a phase.
Output: `{phase_num}-UI-REVIEW.md` (plus the Impeccable critique snapshot it summarizes).
</objective>

<context>
Phase: $ARGUMENTS — optional, defaults to last completed phase.
</context>

<process>

## 1. Establish the phase and the changed surface

- Resolve the phase number (argument, else last completed phase via `.planning/STATE.md` and
  `.planning/phases/`).
- Determine what the phase changed: the phase manifest / plan `files_modified`, plus
  `git log` since the phase's first plan commit. The audit scope is the UI surface those
  files render, not the whole app.

## 2. Run the audit as Impeccable

Load the `impeccable` skill and run its **audit** verb against the changed surface. Truth
sources, in order: DESIGN.md and PRODUCT.md (the Formulation Cookbook), the decision
register, `.impeccable/` (direction, prior critique snapshots), and
`.claude/skills/sketch-findings-sprinkles/` (validated cross-cutting targets: type roles,
6px caption gap, 44px touch targets below 760px, toast/undo feedback conventions).

Project-specific method rules — these override any generic instruction:

- **The file-based `impeccable detect` is blind to JSX.** Exit 0 on `.jsx` is a null result,
  never a pass. Verify in the page, not in the source.
- **Measure, then judge.** Run the app (`npm --prefix app run dev`), drive it with the
  gsd-browser tools, and measure the real DOM — computed gaps via `getBoundingClientRect`,
  computed font sizes/weights, horizontal overflow at 393px, compactness at 768px. Never
  reason from CSS source alone. (First click on a fresh route often misses — wait, re-find,
  probe state by JS.)
- **Judge against the world, not a universal rubric.** Cool text paper; print ink; one pen
  blue for everything recorded; bookcloth green names regions and never carries state; text
  face for prose, grotesk with tabular numerals for anything counted; hairline controls, no
  fill, no radius. Findings must cite the design decision they violate, not a taste preference.
- **Blank stays visibly blank; no color carries state.** These are standing audit axes.

## 3. Write the artifacts

1. **Impeccable critique snapshot** under `.impeccable/critique/` following its existing
   format and self-closing rule (a snapshot self-closes when its target file changes).
2. **`{phase_num}-UI-REVIEW.md`** in the phase directory — the GSD-facing summary:
   - Verdict and score against the project's quality bar (the impeccable audit's own result),
   - Ordered findings, most severe first, each with: the violated decision, the measured
     evidence (real numbers from the DOM), and the suggested fix as a brief revision —
   - Each fix phrased as work for `/gsd-quick`, `/gsd-quick-batch`, or a phase plan.

The `verify:post` consumer reads the summary and score from `UI-REVIEW.md`; the snapshot is
the source of truth.

## 4. Boundaries

- **Never edit anything under `app/`.** This audit evaluates and decides; every fix routes
  through a GSD command (the critique → brief revision → GSD plan/execute → re-critique loop).
- Advisory: a failing audit never blocks verify — findings become brief revisions.
- If the changed surface has no UI files, say so and stop.

</process>
