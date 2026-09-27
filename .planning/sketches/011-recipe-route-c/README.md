# Sketch 011 — the recipe route, layout C

**Status:** SETTLED — layout C (Mark, 2026-09-24); width ladder derived and approved (Mark, 2026-09-26, decision 16). Acceptance target for Phase 03.5; awaiting app implementation.
**Drawn:** 2026-09-23 to 2026-09-24.
**Question:** where recipe context, the Sheet and the batch log sit, from desktop to phone.

## Why this sketch exists

Phase 03.5 separates the recipe record from the Sheet (`.impeccable/surfaces/route-recipe.md` § "03.5 revision"); § 4 of that section says the chosen layout is drawn at 1366, 1024 and 393 on the Sprinkles canvas and snapshotted here as the acceptance target. 03.5 plans lock against this folder. It is numbered 011 because `010-bench-sheet` is reserved for the Phase 4 bench sheet (`04-CONTEXT.md` D-02).

## The boards

| File | Frame | What it shows |
|---|---|---|
| 1600-no-batch.html | 1600 × 3300 | C · header band · not yet churned |
| 1600-batch.html | 1600 × 3400 | C · header band · the 2 Aug batch in view, log beside the Sheet |
| 1600-pen.html | 1600 × 3700 | C · the pen open from Next version · edit this step, one step open (chosen 2026-09-24) |
| 1600-long-history.html | 1600 × 3500 | C · header band · History as a dated rail, eight versions, scrolling |
| 1920-batch.html | 1920 × 2900 | C · 1920 · wide · content capped at 1482 and centred in the main area |
| 1366-batch.html | 1366 × 3100 | C · 1366 · iPad landscape · side nav, the Sheet in two columns, the log beside it at 350, details, Balance and Tasting folded |
| 1024-batch.html | 1024 × 3400 | C · 1024 · iPad portrait · side nav, the Sheet in two columns, the log below it, details, Balance and Tasting folded |
| 984-batch.html | 984 × 3600 | C · 984 · narrowest with the side nav · the Sheet in two columns at 696, the log below it, folds closed |
| 983-batch.html | 983 × 3300 | C · 983 · widest below the side nav · bottom tab row, the Sheet in one column, the log below it, folds closed |
| 723-batch.html | 723 × 3500 | C · 723 · widest phone form · bottom tab row, band stacked, two-line ingredient list, 20px margin, folds closed |
| 393-batch.html | 393 × 5800 | C · 393 · phone · one column, bottom tab row, details, Balance and Tasting folded |
| recipe-book-form-reference.html | 1600 × 2000 | Reference · the Recipe Book form of the Sheet on screen (/recipe-book/:recipeId, not built in 03.5) |

## The ladder

Derived 2026-09-26 from measured content limits (decision 16), not picked. Four layouts; each cut is a sum of set values.

| Window | Nav | Sheet | Log | Table, margin, band | Boards |
|---|---|---|---|---|---|
| 1366 and up | side (224) | two columns | beside, 350 | column table, 48, band side by side | 1920, 1600, 1366 |
| 984 to 1365 | side (224) | two columns | below | column table, 48, band side by side | 1024, 984 |
| 724 to 983 | bottom tab row | one column | below | column table, 48, band side by side | 983 |
| below 724 | bottom tab row | one column | below | list table, 20, band stacked | 723, 393 |

From a 1770 window the content stops growing at 1482 (Sheet 1100 + 32 + log 350) and centres in the main area.

The 393 board was verified on Mark's iPhone over the LAN; the 393 board forces the app's narrow media rules because the canvas gives an artboard no narrow viewport of its own.

## Decisions

Taken in substance from `.planning/.continue-here.md` `<decisions_made>` and from `route-recipe.md` § "03.5 revision" parts 2 and 7, attributed to Mark with dates.

1. Layout C — recipe and version as App front matter across the top, History rail beneath, the log beside the Sheet at desktop and 1366, below it at 1024 and 393.
2. Sheet table style 6, and the hand (Caveat, pen blue, 20px minimum) for every batch edit on the Sheet — as-made grams and Instructions changes; this bends DESIGN.md's Hand Rule and the rule change is recorded in the 03.5 discussion.
3. The Source column becomes an "estimated" chip after the name, ink, target-chip outline.
4. History is a dated rail, versions only, oldest left, opening scrolled to the version in view, Notebook red filled/hollow/ring.
5. The pen opens from Next version with the ceremony in the version column of the band, steps edit one at a time via "edit this step", Done keeps the edit in the draft and Cancel restores the parent's step, remove sits on a closed step, only the ceremony saves — superseding the version brief's "the pen keeps the page" paragraph for steps. On the open step, Done is a hairline ink box and Cancel an underlined word, Cancel first (Sheet grammar; Mark, 2026-09-24). The step's uses control reads "change the ingredients", not "change" (Mark, 2026-09-24); the built app's "change" follows in 03.5.
6. Below desktop the folds are version Details, Balance with Things to check, and Tasting, closed by default and closed again on every visit with no stored state, while Ingredients, Instructions, Before you start and the churn cells stay open, and the Sheet reads whole at desktop and in print.
7. The control beside the Recipe name reads "Rename".
8. The destination caption is dropped from recipe views and the rail mark stays.
9. The Recipe name "Olive Oil Ice Cream, circulator" and the Sheet title "Olive Oil Ice Cream" are drawn to show the two names apart.
10. Carried forward notes are dropped: no block on the Sheet, no fold below desktop, "Notes" leaves the Sheet's parts list, the three seeded notes' words are dropped rather than moved, the inherited-note marker stays on Before you start notes, and removing carriedForward from code, seed, store and transfer validation is 03.5 scope.
11. Instructions names the steps region on screen and in print — screen-only, code identifiers keep method.
12. The Recipe Book form gets authored Yield and time fields as Sheet fields on the version, which time fields and how they sit beside the derived Makes, Age, Harden and Serve being settled when the form is built, and the form stays unbuilt in 03.5.
13. The Recipe Book form's footer names the Recipe name with its qualifier while the Sheet title stays the heading, and its running head is gone.
14. Phone logging is deferred out of 03.5 to the brief for phone-based jobs (`.planning/todos/pending/2026-09-24-write-a-product-brief-for-phone-based-jobs.md`), so the 393 board settles layout, not whether the log is entered on the phone.
15. The ingredient table's amount and name are two columns under one "Ingredient" head, at every width (Mark, 2026-09-25/26): the table sizes to content, so the amount, As made and % of batch take their figures' width (the numeric heads may wrap) and the name takes the rest, wrapping inside its own column; the "estimated" tag and the portion line stay with the name. At 393 the plan amount, the name and the share sit on line one, and as made sits under the plan amount on the same right edge. The side nav shows only from 1024 up (Mark, 2026-09-25) — superseded by decision 16, which puts the side nav's cut at 984.
16. The width ladder is derived from measured content limits (Mark, 2026-09-26; the study is https://claude.ai/artifact/2VNpa4tVnp2hh6E7iKYmnW). Set values: the Sheet's two-column minimum is 696 (as on the 1366 board; 660 was drawn and rejected as too bunched), the log's minimum and width beside the Sheet is 350, gutters are 32 (page margin, Sheet to log, page margin), and the content maximum is 1482 (the two-column Sheet stops gaining at about 1100), centred in the main area. Precedence: the log moves below the Sheet first; then the side nav and the Sheet's second column go together; the list-form ingredient table, the 20px page margin and the stacked band go together below 724 (moved up to 984 and rejected for its white space). So: log beside from 1366 (224 + 96 + 696 + 350), side nav and two-column Sheet from 984 (224 + 64 + 696), phone forms below 724 (band 660 + 64). Touch sizes follow the pointer only, no longer a width. The History rail's nodes sit on top of its line (Mark, 2026-09-26).

## How the boards are made

Every board is generated, never hand-edited — `.planning/canvas-generators/gen.py` makes all but the long-history board, which `longhist.py` makes on top of gen.py. Each file here is the canvas `.dc.html` with the canvas support script removed and the app stylesheet asset inlined in a style element; the Caveat @font-face points at `../../../app/public/fonts/caveat-regular.woff2` and a Google Fonts Caveat link also remains; the `<x-dc>` and `<helmet>` wrappers and the `text/x-dc` script stay and are inert in a plain browser; each root element carries the board's fixed width and height; each rung carries only the narrow media bodies its layout gets, unwrapped from `phone-forced.css` (the tab row below 984, the one-column Sheet below 984, the phone forms below 724, the touch floor only on the 393 board, since touch follows the pointer), and the 984 and 1024 boards force the two-column Sheet so a narrow viewer window cannot collapse them.

To change a board: edit the generator (re-reading the as-built board, canvas.json and the stylesheet asset from the canvas first, per gen.py's SRC path), regenerate, grep the outputs for every approved change, publish, then re-snapshot here. Never patch a file in this folder.

Canvas: https://claude.ai/artifact/JHwDoAYHDf9yQ1CcUZyATq, page "Recipe route 03.5", versions 228–229; the derived ladder and rail fix, version 242.

## What is authority here

This sketch is the single authority for 03.5 agents — planner, checker, executors and UAT read the boards, including their CSS, not a paraphrase. Conformance is judged side-by-side in a browser that has visited the routes, never from prose or a test count.

- The Recipe Book board is a reference only (the form and its route are not built in 03.5), and its derived facts strip and footnote predate the 2026-09-24 Yield and time decision, which governs.
- Mark and the 03.5 discussion, 2026-09-24: the Recipe Book board as drawn exposed the version structure (version selection, Next version and the History rail in the band, as in the Notebook), which the discussion settled is wrong. The Recipe Book shows one selected version only — no version selection, no Next version and no History — and its band carries the Recipe name (product brief; D18; 05-domain-and-language: Add to Recipe Book selects a trusted version without moving or duplicating history). This principle is settled now; the reference board itself is redrawn in the phase that builds the Recipe Book form, and the route stays reserved, not built, until then.
- Versions 3–8 on the long-history board are illustrative, not seed content.
- The not-chosen pen alternatives (focused-only controls and always-shown controls), layouts A and B, and the ingredient-table alternatives stay on the canvas only and are not live alternatives.

## How to view

```
python3 -m http.server 8011   # run from the repo root
```

then open `http://localhost:8011/.planning/sketches/011-recipe-route-c/index.html`. Serving from the repo root is what makes the font path resolve; a server rooted at `.planning/sketches/` (the 8077 habit from sketch 009) cannot reach it. For the iPad or iPhone, use the Mac's LAN address and hard-reload, since the server sends no cache headers.
