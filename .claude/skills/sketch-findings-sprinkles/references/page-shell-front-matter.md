# Page Shell & Front Matter

Validated by sketch 003 (winner B), building on 001–002's rejections.

## Design Decisions

- **Front matter is two stacked outer rows spanning the whole page.** The version row first, then the batch row; each row has its own layout (version: headnote + metadata grid; batch: running head + figure cells). The rows cross both grid columns — they do not squeeze into column one.
- **Lists and ceremonies open beneath the row they belong to**, pushing the page down (push-never-cover). Later versions and later batches open under the version row; the Develop ceremony replaces the version row's metadata cell in place and pushes Balance down. There is no tray.
- **No third grid column.** Rejected in 001: a three-column shell does not survive a tablet as the primary device, and a 360px push wraps ingredient names at 1440. Column two stays the sole side region (Balance, rules, advisories, notes).
- **The batch record is page metadata, not a margin note.** The page holds the tip — the latest version and its latest batch — beside the headnote. Earlier versions/batches open on request beneath their row.
- **Balance stays level with Ingredients.** The front matter is sized so the side region's Balance note starts level with the Ingredients region name.
- **A baseline-weight rule (1.5px) closes the front matter** above Ingredients; inner row separators are 1px graduation weight.
- **The ingredient table reads in step order** with a "Table as written" toggle for the written order. In step order: groups by step with the step's lead-in as a full-width head row; a split ingredient appears once per step as a portion line ("120 g of 370.4 g · 46.3% in all" beneath its name); the Step column disappears; portions carry their own share in the numeric column. As made is recorded per portion.
- **"Before you start" lives at the head of the Method**, before step 1. Things to check and carried-forward Notes sit under Balance.
- **Absence labels follow the "Saying absence" guide rule** (e.g. "not churned yet" — say what isn't, plainly).

## CSS Patterns

```css
/* Page grid: 2fr/1fr with named areas; front matter spans both (winner B) */
.page { display: grid; grid-template-columns: 2fr 1fr; gap: var(--gap-l); padding: var(--gap-xl); align-items: start;
        grid-template-areas: 'front front' 'ingredients side' 'method side'; }
/* Tablet is the primary device: one column, front matter first */
/* (sketch tested 834/1024; stack below 1100px) */

/* Outer rows: hairline separators, gap-m rhythm */
.row { padding-bottom: var(--gap-m); margin-bottom: var(--gap-m); border-bottom: var(--rule-graduation) solid var(--ink); }
.front { border-bottom: var(--rule-baseline) solid var(--ink); padding-bottom: var(--gap-m); }

/* Version row: headnote + metadata, collapsing at container 760px */
.row-version { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(300px, 1fr); gap: var(--gap-l); align-items: start; }
@container (max-width: 760px) { .row-version { grid-template-columns: 1fr; } }

/* Figure cells: wrap-friendly, tabular numerals, pen blue */
.cells { display: grid; grid-template-columns: repeat(auto-fit, minmax(96px, max-content)); gap: var(--gap-s) var(--gap-l); }
.cell .k { font-size: var(--size-small-print); text-transform: uppercase; letter-spacing: 0.04em; }
.cell .v { font-size: var(--size-figure-value); font-weight: 700; color: var(--pen-blue); font-variant-numeric: tabular-nums; }

/* Openable lists/ceremonies under their row */
.list, .ceremony { display: none; margin-top: var(--gap-m); padding-top: var(--gap-s); border-top: var(--rule-graduation) solid var(--bookcloth); }
.list.open, .ceremony.open { display: block; } /* ceremony.open -> display: grid */

/* Step-ordered table */
table.step-order col.c-step { width: 0; }
table.step-order th:nth-child(5), table.step-order td:nth-child(5) { display: none; }
tr.step-head td { font-size: var(--size-small-print); text-transform: uppercase; letter-spacing: 0.04em;
                  padding-top: var(--gap-s); border-bottom-width: var(--rule-baseline); }
td .portion { display: block; font-size: var(--size-small-print); }
tr.total td { border-top: var(--rule-baseline) solid var(--ink); border-bottom: 0; font-weight: 700; }

/* In-place ink in the Develop ceremony: strike the plan, show the field */
td .was { text-decoration: line-through; text-decoration-thickness: var(--rule-strike); margin-right: var(--gap-xs); }
```

## HTML Structures

- `.page` with named grid areas: `front`, `ingredients`, `method`, `side` (and `side-top` for variant-C experiments — unused by the winner).
- Front matter: `.row.row-version` (headnote with h1/version line/prose, `.vmeta` definition grid, `.acts` control row) then `.row.row-batch` (head with region name + pen-blue date, `.cells`, tasting cells, `.words`).
- Openable trees under rows: `.vtree` (auto-fill `minmax(260px, 1fr)` grid of version lines with nested batch lines) and `.blist` (flex row of batch dates with metadata).
- Table: `table-layout: fixed`, tabular numerals, right-aligned numeric columns, `col` widths for num/step/data; `.step-head` rows carry the step's lead-in prose after the uppercase label.
- Method: `ol` with `grid-template-columns: 2ch 1fr`, grotesk figure numerals, lead-in bold, italic asides.

## What to Avoid

- **Right-edge trays and slideouts with a scrim** — the `design-explorations/` slideouts are the anti-reference: they covered the page. Push, never cover.
- **Three-column shells** — fail on tablet (the primary device) and squeeze the rule drawing/table.
- **Two tiny sub-columns inside column two** for version + batch metadata (sketch 002 synthesis D) — reads as cramped; give each its own full row instead.
- **Batch record in the margin** — the margin record (002 A–C) was rejected; the record belongs in the page's front matter.
- **Unbounded tasting lists** — superseded 2026-09-11: extra tasting records were dropped entirely; one tasting per batch.

## Origin

Synthesized from sketch: 003 (with rejections recorded from 001, 002)
Source files available in: `sources/003-front-matter-rows/`
