---
id: SEED-261001-iq4
status: dormant
planted: 2026-10-01
planted_during: "03.5 (Separate the recipe from the sheet), after UAT round 2 gap closure"
trigger_when: "when the batch record or tasting pen is next opened for design or planning, or when a milestone touches recipe authoring, observations or the decision register's batch rows"
scope: large
---

# SEED-261001-iq4: Recipe-specific tasting measures and failures, defined per recipe in the recipe creator/editor

Mark, 2026-10-01, iPad UAT note.

## Why This Matters

Mark wants to define, for a recipe, the tasting measurements and failures that only that recipe cares about:

- **Measures:** a 1–5 scale with a name and a label for each end. Example: Mexican Chocolate gets a "Heat" measure, with 1 = "Not there" and 5 = "Burn my lips".
- **Failures:** a yes/no flag. A recipe-specific failure is any problem only that recipe has.
- **Empty state:** when a recipe defines none, the "This recipe only" labels must not show at all.

This matches the product's core loop: a batch record the next version can cite should be able to say what *this* recipe is about, not only the core battery.

## Bug today (confirmed in code on 2026-10-01)

"This recipe only" appears for recipes with nothing recipe-specific. Mexican Chocolate's versions all carry `declaredAxes: []`, yet the label shows. Two places:

1. **Axes grid cue** (`app/src/ui/BatchRow.jsx`, around lines 238 and 254, `axes-cue--declared`) — for declared axes.
2. **Defects group** (`BatchRow.jsx`, around line 927) — the "This recipe only" cue is rendered unconditionally and holds one hard-coded failure, **Bitter** (`draft.bitterDeclared`, `onToggleBitter`). So every recipe shows the label and the Bitter chip, whether or not the recipe declares anything.

Hiding the label for an empty recipe is a small fix on its own, but it leaves Bitter with nowhere to live. That is why the fix belongs with this feature, not ahead of it. Decide Bitter's fate first (open question 3).

## What exists

- `app/src/domain/axes.js` holds a fixed catalog: `AXES`, groups `core` and `declared`. The declared pair is **Body** (thin/heavy) and **Oil** (faint/strong).
- A version's `declaredAxes` is a list of names resolved against that catalog. Batches snapshot `declaredAxes`, so a stored mark never moves when the recipe later changes. **Keep that invariant.**
- Failures: `DEFECTS` (four core chips) plus the single hard-coded Bitter.
- There is no editor UI for declaring measures or failures.

## Open design questions for Mark (before planning)

1. **Where do definitions live?** Per version (as `declaredAxes` does now, snapshotted into each batch) or per recipe across versions?
2. **Free-text measures:** a name plus low and high end labels instead of the fixed Body/Oil catalog. What happens to existing Body/Oil declarations and to Bitter in seeded and stored data? The project prefers reset over migration when there is no live data; check for real stored records first.
3. **Bitter:** does it become an ordinary recipe-declared failure that no recipe has by default?
4. **Which surface edits them?** The Next version pen, the recipe band, or a recipe settings fold.
5. **Sketch authority:** sketch 007 and 008 are the authority for the batch record. The new pen controls and the empty state need drawing first on a Claude Design canvas, per the existing sketch workflow. Also D11/D12 (plain words, open labels stay open) apply to the labels.

Product authority is `product-requirements/`. This touches the decision register's batch-observation rows, so Mark approves scope. Route to a phase or milestone item, not a quick task.

## When to Surface

**Trigger:** when the batch record or tasting pen is next opened for design or planning, or when a milestone touches recipe authoring, observations or the decision register's batch rows.

This seed will surface during `/gsd-new-milestone` when the milestone scope matches.

## Scope Estimate

**Large.** Domain model change (definitions, snapshot, a catalog replacement), an editor surface that is not drawn yet, store and seed changes, the record and read views, and tests. Sketch work comes first.

## Breadcrumbs

- `app/src/ui/BatchRow.jsx` — `AxesGrid` (declared cue, around lines 205–260), the defects group and the hard-coded Bitter chip (around lines 885–940), `axesForBatch(...)` call (around line 870)
- `app/src/domain/axes.js` — the fixed `AXES` catalog, `axesForBatch`
- `app/src/data/*.js` — every seeded version carries `declaredAxes`
- `.planning/sketches/007-full-battery/index.html` — the record pen's authority (axes cues `axes-cue--core` and `--declared`, defects groups)
- `.claude/skills/sketch-findings-sprinkles/references/batch-record-tasting-battery-structure.md` — contract text for the battery

## Notes

Captured by Claude on Mark's request during iPad UAT, 2026-10-01. Mark's own words for the example: "Mexican Chocolate might have a 'Heat' measure with Not There (1) and Burn my lips (5)."
