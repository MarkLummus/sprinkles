# Sketch 011 — the recipe route, layout C

**Status:** SETTLED — layout C (Mark, 2026-09-24). Acceptance target for Phase 03.5; awaiting app implementation.
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
| 1366-batch.html | 1366 × 3800 | C · 1366 · iPad landscape · the log beside the Sheet, details, Balance and Tasting folded |
| 1024-batch.html | 1024 × 4600 | C · 1024 · iPad portrait · one column, the log below the Sheet, details, Balance and Tasting folded |
| 393-batch.html | 393 × 5800 | C · 393 · phone · one column, bottom tab row, details, Balance and Tasting folded |
| recipe-book-form-reference.html | 1600 × 2000 | Reference · the Recipe Book form of the Sheet on screen (/recipe-book/:recipeId, not built in 03.5) |

## The ladder

| Rung | Drawn at | Columns | Board | What changes |
|---|---|---|---|---|
| Desktop | 1600 | many | 1600-batch.html | the log in a column beside the Sheet, the Sheet reads whole |
| iPad landscape | 1366 | 2 | 1366-batch.html | the log beside the Sheet, folds closed |
| iPad portrait | 1024 | 1 | 1024-batch.html | the log below the Sheet, folds closed |
| Below iPad | 393 | 1 | 393-batch.html | a two-line ingredient list with the paper edge to edge, bottom tab row, folds closed |

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

## How the boards are made

Every board is generated, never hand-edited — `.planning/canvas-generators/gen.py` makes all but the long-history board, which `longhist.py` makes on top of gen.py. Each file here is the canvas `.dc.html` with the canvas support script removed and the app stylesheet asset inlined in a style element; the Caveat @font-face points at `../../../app/public/fonts/caveat-regular.woff2` and a Google Fonts Caveat link also remains; the `<x-dc>` and `<helmet>` wrappers and the `text/x-dc` script stay and are inert in a plain browser; each root element carries the board's fixed width and height; only the 393 board carries the app's narrow media bodies unwrapped from `phone-forced.css`.

To change a board: edit the generator (re-reading the as-built board, canvas.json and the stylesheet asset from the canvas first, per gen.py's SRC path), regenerate, grep the outputs for every approved change, publish, then re-snapshot here. Never patch a file in this folder.

Canvas: https://claude.ai/artifact/JHwDoAYHDf9yQ1CcUZyATq, page "Recipe route 03.5", versions 228–229.

## What is authority here

This sketch is the single authority for 03.5 agents — planner, checker, executors and UAT read the boards, including their CSS, not a paraphrase. Conformance is judged side-by-side in a browser that has visited the routes, never from prose or a test count.

- The Recipe Book board is a reference only (the form and its route are not built in 03.5), and its derived facts strip and footnote predate the 2026-09-24 Yield and time decision, which governs.
- Versions 3–8 on the long-history board are illustrative, not seed content.
- The not-chosen pen alternatives (focused-only controls and always-shown controls), layouts A and B, and the ingredient-table alternatives stay on the canvas only and are not live alternatives.

## How to view

```
python3 -m http.server 8011   # run from the repo root
```

then open `http://localhost:8011/.planning/sketches/011-recipe-route-c/index.html`. Serving from the repo root is what makes the font path resolve; a server rooted at `.planning/sketches/` (the 8077 habit from sketch 009) cannot reach it. For the iPad or iPhone, use the Mac's LAN address and hard-reload, since the server sends no cache headers.
