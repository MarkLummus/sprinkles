---
version: 1
slug: "route"
primary_target: "route:/"
related_targets: ["route:/recipe","route:/recipe/batch"]
---

# Surface brief — Home and the shell outside the book

**Mode:** Operate. **Status:** direction chosen by Mark 2026-09-18 from the safer hand of seed `b9d24c7e` (re-roll round 1), with his steer recorded below. The earlier exploration was code-led; generated responsive Home mocks now also exist as inspiration. Not yet built; every edit under `app/` goes through a GSD command.

Product truth: `PRODUCT.md` and `product-requirements/03-decision-register.md`.

## Vocabulary amendment — 2026-09-19

D17 retires “Sprinkles Jar” as an active name. The colorful area is recipe context (recipe sidebar on desktop); expose About this recipe, History, and In the Recipe Book without an umbrella label. Recipe Sheet and Sheet name the paper presentation of a version. Idea log, Notebook, Recipe book, Ingredients, and Kitchen are the approved destination vocabulary. The earlier visual exploration remains evidence; this terminology amendment does not select a Home mock or settle a new layout.

## Home direction amendment — 2026-09-20

**Active work first**, selected by Mark as the preferred Home concept for continued exploration. Home should help the maker resume recipe development, record a batch, or return to a tasting, with Recipe book and Idea log within reach. This supersedes the earlier recipe-list-first composition and import-first primary action. It does not approve every visual detail of the mock.

Reference: the active-work responsive concept board, `exec-793bc09c-6ac8-4019-858b-788e03371e3f.png`, generated during this discussion. Its photographs, handwriting, slogans, exact colors, and geometry remain exploratory. A maker with no active work needs an intentional empty state; how active work is chosen or ordered remains open.

## Assets and processes amendment — 2026-09-23

`route-recipe.md` § "03.5 revision" (Phase 03.5, confirmed by Mark 2026-09-23) and D18 (assets and processes, `product-requirements/03-decision-register.md`) govern over § 1 below where they differ. On screen, paper holds inside **one** frame on a recipe route: the Recipe Sheet, an asset. The batch and tasting log is a process record and is App context on screen; the Sheet in its Notebook form carries only the batch in view's as-made grams and Instructions changes in pen blue. In print, the Sheet and the blank batch log stay paper. The Sheet has two forms, Notebook and Recipe Book, and the destination route picks the form. The **highlighter** § 1 reserves for the paper batch log is undecided again: whether it marks the printed log, the Sheet, or nothing is settled when that surface is next drawn (Mark, 2026-09-23). Routes: `/recipe/:id` and `/recipe/:id/batch/:batchId` become `/notebook/:recipeId/:versionId` and `/notebook/:recipeId/:versionId/batch/:batchId`, with the old paths redirecting; `/recipe-book/:recipeId` is reserved, not built; print sits at `…/print` under each, replacing `/recipe/:id/sheet`. Everything else in this brief stands.

## 1. Where this world applies

Mark, 2026-09-18: paper stays inside three frames and nowhere else.

- The Recipe Sheet within the recipe route, including its version draft: black ink, blue pen. Recipe-level metadata, History, and navigation on the same route belong to app context.
- The batch and tasting log (`route:/recipe/batch`): black, blue, and a **highlighter** — a new mark for the paper frames, not yet drawn; its colour and job are decided when that surface next changes.
- The printed sheet (`route:/print/recipe-sheet`): black on white.

Everything outside those frames — home, the shell and navigation, history and line of work, compare, import, later diagnosis — is this world. The Two-Ink and No-Verdict rules stay binding wherever plan and actual meet; the no-motion, no-shadow, no-radius binder does not cross the frame.

## 2. Job and audience

Mark, first. Arriving to find the recipe he is working on, see at a glance how far each one has come (versions, batches, the last verdict in his own words), and go into the book. Later arrivals: bring a recipe in, compare attempts, read the line of work.

## 3. Selected direction

**Colorful app context.** The product's own name taken literally, then disciplined: sprinkles are a mark-making system, never decoration. Chosen over The Pint Lid, The Flavour Board and the category standard (the chosen sketch is kept beside this brief as `route.sketch.html`; the others were throwaway); The Freezer Shelf, The Dipping Cabinet and The Riso Bulletin were rolled and set aside in earlier rounds.

**Palette amendment — approved 2026-09-21:** Option B with the revised lighter Ingredients green, plus the preview neutral set. DESIGN.md owns the exact values. Notebook is red, Recipe Book orange, Idea log yellow, Pantry light green (reserved), Ingredients leaf green, and Kitchen indigo. App blue is distinct from Recipe Sheet pen blue.

The earlier recipe-specific palette and unique-color-per-recipe rule are retired. Color identifies destinations; words identify recipes and state standing (D06). Shared action, link, focus, and feedback treatments remain open. No exploratory mock's color assignments override this amendment.

## Direction contract

THESIS: A clean, bright app that makes active work easy to resume, with color supporting guidance and destination identity. Sprinkle marks remain part of the visual direction; the Home exploration will settle imagery and count treatments.

OWN-WORLD: White ground, near-black ink, the approved destination accents and app neutrals from DESIGN.md; no recipe-specific colors. A sprinkle is a short rounded rod, slightly tilted; a tally is a row of them. Controls are plain, rounded, and quiet; colour sits in the marks, destination markers and active navigation; action-color assignments remain open, never in a whole region.

STORY: I see what I can continue now, with enough recipe and batch context to choose the next action. My trusted recipes and ideas remain close. Opening a recipe reveals its context and the distinct Recipe Sheet.

FIRST VIEWPORT: Brand and navigation, followed by active work and its relevant continuation action. Recipe book and Idea log remain accessible without competing equally for attention. Exact wording, arrangement, photos, counts, and device-specific composition remain under exploration. The previous recipe-row list, import-first filled action, and automatic sprinkle-drop animation are not requirements of this selected concept.

FORM: Colorful app context (formerly The Sprinkles Jar), grounded candidate 7 of 7 (literal-name slot), chosen from the safer hand of seed `b9d24c7e`, reroll 1, register safer.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## 4. Scope and boundaries

First surface: `route:/` (home) and the shell that frames every route, including the running head the book wears inside this world. Later surfaces inherit the world; each gets its own brief section, not a new identity round.

## 5. Open decisions

- How active work is selected and ordered; empty Home and multiple active recipes; which continuation action leads in each state.
- Home imagery, handwriting, component geometry, responsive composition, and any motion. The concept selection establishes priority, not approval of every mock detail.

- Shared interaction and feedback colors; contrast-tested text companions, tints, and interaction states. Base accents and neutrals are approved in DESIGN.md.
- How a tally reads past a dozen versions.
- The highlighter inside the batch log: colour, meaning, and whether it is the app palette's yellow.
- The book running head keeps its paper treatment; the sketched recipe-color option is retired.
