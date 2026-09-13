---
name: sketch-findings-sprinkles
description: Validated design decisions, CSS patterns, and visual direction from sketch experiments. Auto-loaded during UI implementation on sprinkles.
---

<context>
## Project: sprinkles

Sprinkles is a recipe app for home ice cream makers — recipes, batches, and observations connected so each attempt informs the next. Mark is the first user.

Design direction — the Formulation Cookbook, as recorded in DESIGN.md: cool text paper, print ink for everything the system prints, one pen blue for everything recorded, one bookcloth green that names regions and never carries state; a text face for prose and a grotesk with tabular numerals for anything counted; every control drawn in ink at hairline weight with no fill and no radius. Sketches test structure inside that world, not the world itself.

Reference points: the book spread on `route:/recipe` as built through GSD phase 03.1; the right-edge slideouts in `design-explorations/` (covered the page with a scrim — the anti-reference for "push, never cover"); the 2026-09-09 critique in `.impeccable/critique/`.

**These findings are app-wide targets.** The cross-cutting type/spacing/feedback rules apply to every surface and should be applied to the real app via `app/src/styles/tokens.css` — sizes, weights, and spacing transfer; typefaces stay the app's own (DESIGN.md's text face + grotesk). Applying them is a GSD job (phase plan or `/gsd-quick`); this skill is the source of truth the implementer reads.

Sketch sessions wrapped: 2026-09-12 (sessions ran 2026-09-09 → 2026-09-12).
</context>

<design_direction>
## Overall Direction

The page is a book spread: a 2fr/1fr grid whose front matter — the latest version row and its latest batch row — spans the whole page width, with lists and ceremonies opening beneath the row they belong to, pushing content down (never covering). The ingredient table reads in step order with portions. Recording is a pen drawn in ink: hairline controls, numbered 5-point goldilocks stops, pen blue for everything authored, blank visibly blank. Saving is decoupled — the churn record and the tasting record are independent paths with state-based labels. Feedback is co-located with the action: toasts that self-clear, Undo in the action row, focus that follows the collapse. Below 760px the arrangements step down and touch targets grow toward 44px; 393px must not overflow.
</design_direction>

<findings_index>
## Design Areas

| Area | Reference | Key Decision |
|------|-----------|--------------|
| Page shell & front matter | references/page-shell-front-matter.md | Front-matter rows span the whole page; no tray, no third column; table in step order with portions |
| Batch record & tasting battery | references/batch-record-tasting-battery.md; structural contract: references/batch-record-tasting-battery-structure.md | 5-point numbered goldilocks axes with core/declared split; standalone defects; note before texture (A); decoupled saves; hidden tasting default |
| Cross-cutting type, spacing & feedback | references/cross-cutting-type-spacing-feedback.md | Type roles, 6px caption gap, 44px targets below 760px, toast+undo conventions, measure-the-DOM verification |

## Theme

The winning theme file is at `sources/themes/default.css` (a copy of the Formulation Cookbook tokens, sourced from `app/src/styles/tokens.css` and DESIGN.md).

## Source Files

Original sketch HTML files are preserved in `sources/` for complete reference.
</findings_index>

<metadata>
## Processed Sketches

- 003-front-matter-rows (winner B — rows across the whole page)
- 007-full-battery (winner A — note before texture)

Excluded as superseded: 001-pushed-tray, 002-tray-at-top (both superseded by 003); 004-tiered-tastings, 006-light-tasting-entry (extra/light tastings dropped 2026-09-11); 005-folded-tasting-pen (one-pen premise overturned by 007's decoupled saves).
</metadata>
