# Sketch Wrap-Up Summary

**Date:** 2026-09-12
**Sketches processed:** 7 (2 included, 5 excluded)
**Design areas:** page shell & front matter; batch record & tasting battery; cross-cutting type, spacing & feedback
**Skill output:** `./.claude/skills/sketch-findings-sprinkles/`

## Included Sketches

| # | Name | Winner | Design Area |
|---|------|--------|-------------|
| 003 | front-matter-rows | B: rows across the whole page, table in step order | Page shell & front matter |
| 007 | full-battery | A: note before Texture & flavor | Batch record & tasting battery; cross-cutting rules |

## Excluded Sketches

| # | Name | Reason |
|---|------|--------|
| 001 | pushed-tray | Tray superseded by 003 (the no-third-column / tablet-first rule is recorded in the shell reference's what-to-avoid) |
| 002 | tray-at-top | No winner; redirect absorbed by 003 |
| 004 | tiered-tastings | Superseded 2026-09-11 — extra tasting records dropped entirely |
| 005 | folded-tasting-pen | One-pen premise overturned by 007's decoupled saves |
| 006 | light-tasting-entry | Superseded — no light tastings exist |

## Design Direction

The Formulation Cookbook: cool text paper, print ink, one pen blue for everything recorded, one bookcloth green naming regions only; text face for prose, grotesk with tabular numerals for anything counted; every control in ink at hairline weight, no fill, no radius. Structure inside that world: a 2fr/1fr book spread whose front matter (latest version row + latest batch row) spans the whole page; lists and ceremonies open beneath their row and push content down — never cover. The table reads in step order with portions. Recording is a pen with numbered 5-point goldilocks axes (core left, recipe-declared right of a hairline), a standalone defects checklist, the note before texture, and decoupled churn/tasting saves with state-based labels. Cross-cutting rules (type roles, 6px caption gap, 44px targets below 760px, toast+undo feedback) are app-wide targets for the real app's tokens.

## Key Decisions

- **Layout:** front-matter rows span both columns; no tray, no third column (tablet is the primary device); Balance level with Ingredients; baseline-weight rule closes the front matter; step-ordered table with portions and an as-written toggle.
- **Palette:** the Cookbook's four colors only — ground, ink, pen blue (authored), bookcloth (region names, never state). Selected controls fill pen blue with ground text plus a color-independent affordance.
- **Typography:** section heads 14px/600; labels 12px/500 (axis names 600); controls/helper/status 13px; written prose 16px at 1.5 leading, 70ch max; placeholders italic, entered prose roman; all-caps only wraps short captions.
- **Spacing:** caption-to-content gap 6px everywhere (measured in the DOM, not reasoned from CSS); fields 12px; sections 32px on graduation rules.
- **Interaction:** numbered 5-point stops with inline state and per-axis Clear; blank stays visibly blank; segmented 3-way categoricals; decoupled saves with state-based labels; hidden-tasting default with Add/Clear/Undo; toasts self-clear in 5s with scoped undo retirement; focus follows collapse/restore; touch targets 44px below 760px; 393px without horizontal overflow.
