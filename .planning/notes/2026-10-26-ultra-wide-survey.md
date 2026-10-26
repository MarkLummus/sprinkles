---
date: "2026-10-26 01:30"
promoted: false
---

# Ultra-wide survey (Sid, 2026-10-26)

Mark, 2026-10-26: "we need to decide how each destination page deals with viewports that are REALLY wide. I'm looking at home on a ultra-wide monitor and it's unusable b/c it's so wide" and, on sketch 011 decision 16's cap: "The center from 1770 is also wrong. The left nav stays pinned left."

Measured on a scratch build of the current tree (`vite build --outDir` in the scratchpad, served by a static loopback server on 127.0.0.1:4317 with SPA fallback; not the 4173 preview, not a dev server), Playwright WebKit 1.63 and Google Chrome (Playwright `channel: 'chrome'`), fine pointer, windows 1000 tall, widths 1366, 1770, 1920, 2560 and 3440. Every frame number below is identical in both engines. Routes: Home `/`, Notebook `/notebook`, Ingredients `/ingredients` (Recipe book, Idea log and Kitchen are Placeholder pages on the same `.list-page` frame and were not measured separately), the recipe route `/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1` (one batch, the log beside), the batch route `/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1/batch/b8cc3566-…`, the creation editor `/notebook/new` (reached through the Notebook place's New recipe form, since the address alone redirects to `/notebook` without a draft), and the print route `/notebook/…/print`, which is a screen. Boards: canvas page "Ultra-wide" (`UW_Home`, `UW_Recipe`, generator `.planning/canvas-generators/ultrawide.py`, capture `ultrawide-capture.mjs`, measure `ultrawide-measure.mjs`). Screenshots for my own eyes only (scratchpad).

## The shell (every page)

| Window | Rail | Main area | Nav link (first) | Header tools (right edge) |
|---|---|---|---|---|
| 1366 | fly-out (hidden) | 0 to 1366 | — | 1318 |
| 1770 | 0 to 224 | 224 to 1770 (1546) | 20 to 203 | 1722 |
| 1920 | 0 to 224 | 224 to 1920 (1696) | 20 to 203 | 1872 |
| 2560 | 0 to 224 | 224 to 2560 (2336) | 20 to 203 | 2512 |
| 3440 | 0 to 224 | 224 to 3440 (3216) | 20 to 203 | 3392 |

The rail is pinned at the window's left edge from 1590 (`.shell__body` is a flex row the width of the window; `shell.css`). The header is `justify-content: space-between` with the page gutter, so the wordmark stays at 48 and the tools at the window's right edge. No horizontal overflow anywhere (`scrollWidth` = window).

## The list pages: Home, Notebook, Ingredients (`.list-page`, 48 gutter, no cap)

| Window | Page content (left to right) | Home row width | Home tally (left) | Home lead block | Notebook row | Ingredients filters |
|---|---|---|---|---|---|---|
| 1366 | 48 to 1318 | 1270 | 848 | 1270 | 1270 | 1270 |
| 1770 | 272 to 1722 | 1450 | 1252 | 1450 | 1450 | 1450 |
| 1920 | 272 to 1872 | 1600 | 1402 | 1600 | 1600 | 1600 |
| 2560 | 272 to 2512 | 2240 | 2042 | 2240 | 2240 | 2240 |
| 3440 | 272 to 3392 | 3120 | 2922 | 3120 | 3120 | 3120 |

What stretches: everything that is a row. The Home lead block (bordered), every Home row (rail, name, standing word, tally, actions: the tally sits 2650 px from the name at 3440 and the filled action at the far right), the Recipes section rule and the Enter Sheet code link, every Notebook row (the counts column at the far right; the description alone is capped at 65ch = 598.9), the Ingredients filters form (the Name field stays at 598.9, the Category select at 120; the row's category and figures columns stretch), and every Ingredients row. The widest prose on these pages is a row; the widest table is none (no table on Home or the Notebook; the Ingredients figures table is inside an open entry and capped at 65ch + 132).

## The recipe route, the batch route, the creation editor and the print route (`.notebook`, decision 16's cap)

| Window | `.notebook` frame | Band (content) | Sheet | Log | Gap, rail hairline to band | Leftover right of the frame |
|---|---|---|---|---|---|---|
| 1366 | 0 to 1366 | 32 to 1334 (1302) | 32 to 952 (920) | 984 to 1334 (350) | — (fly-out) | 0 |
| 1770 | 224 to 1770 | 256 to 1738 (1482) | 256 to 1356 (1100) | 1388 to 1738 | 32 | 0 |
| 1920 | 299 to 1845 | 331 to 1813 | 331 to 1431 | 1463 to 1813 | 107 | 75 |
| 2560 | 619 to 2165 | 651 to 2133 | 651 to 1751 | 1783 to 2133 | 427 | 395 |
| 3440 | 1059 to 2605 | 1091 to 2573 | 1091 to 2191 | 2223 to 2573 | 867 | 835 |

The batch route and the creation editor (`.notebook.mk-page`) give the same numbers to the pixel; the print route's frame is the same (the head 1482 wide; the page picture `.print-page` 816 wide, left in the frame, so 666 of frame to its right). The widest prose is the recipe description (815, the band's recipe column) and the Sheet's headnote (638 at 1366, 648 at 1770 and up); the widest table is the ingredient table (528 at 1366, 648 from 1770). Nothing stretches past 1482 from 1770: the band, History, the Sheet and the log all stop. The drift Mark named is the frame's: the content centres in the main area while the rail stays at the edge, so the ground between the rail's hairline and the band grows from 32 at 1770 to 427 at 2560 and 867 at 3440, with an equal leftover on the right.

## What the design says

- `DESIGN.md` "The App's frame: the shell": from 1590 the 224 rail stands in the page's flex row, pinned under the bar; nothing about a maximum for the frame. "The recipe route's width ladder": the content stops at 1482 and centres in the main area from a 1770 window with the rail. "The Sheet page and Home": Home is a list page on the gutter with its own cuts (1100, 760) "until it is measured the same way"; the Notebook and Ingredients places are list pages on Home's gutter (sketch 012). No brief, sketch or section names a width above 1920 (sketch 011's widest board is 1920; `route-recipe-version.md` "designed and tested at 1280 and wider").
- Sketch 011 decision 16 (the cap and the centring), 27 (the sticky nav), 28 (the pen's cut at 724), 31 (the table at 1366 and 1024), 33 (the rail returns at 1590); sketch 009 is touch at 1366 and says nothing about width above it.
- `shell.css`: `.shell__body { display: flex }`, `.shell__rail { flex: 0 0 224px; position: sticky }`, `.shell__main { flex: 1 1 auto }`, `.shell__head { justify-content: space-between; padding: 6px 48px }`. `notebook.css`: `.notebook { max-width: calc(1482 + 64); margin: 0 auto }`. `app.css`: `.list-page { padding: 48px }`, no cap.

## The proposal (decide-ultrawide-frame; decide-ultrawide-lists)

A, recommended: one block. The rail and the page travel together, capped at one new token, `--app-frame-max` = `--app-size-nav-w` + `--app-notebook-content-max` + 2 x `--app-notebook-gutter` = 224 + 1482 + 64 = 1770, and centred in the window; the header's wordmark and tools sit over the block's edges while the bar's ground and hairline still span the window. Drawn as `.shell__body { width: 100%; max-width: var(--app-frame-max); margin-inline: auto }` and `.shell__head { padding-inline: max(var(--gap-page), calc((100% - var(--app-frame-max)) / 2 + var(--gap-page))) }`; `notebook.css`'s own cap stays, since inside a 1546 main area it never bites again. Measured on the board at 2560: the rail 395 to 619, the nav links 415 to 598, the page 619 to 2165, the band 651 to 2133 (32 from the rail's hairline, as at 1770), the Sheet 1100 and the log 350, the wordmark at 443, the tools ending at 2117; Home's rows 667 to 2117 (1450, as at a 1770 window today), the tally at 1647. Nothing on the recipe route moves but the rail and the header's contents: the content was already at 619 to 2165 as built, because the main area's centre and the block's centre coincide. Below 1770 nothing changes (the block is the window).

B: the same block against the window's left edge, the leftover on the right (the rail at 0, the page to 1770, the tools over the block's right edge at 1722; 790 px of ground on the right at 2560, 1670 at 3440). C: as built (named for completeness; Mark called it wrong).

Home's own question inside the frame: the list fills the frame (1450 at the cap, as at 1770 today) or stops at the Sheet's width, 1100 (`--app-notebook-content-max` - `--app-notebook-gutter` - `--app-notebook-log-w`), the tally at 1297 on the board; the same answer would hold the Notebook and Ingredients lists (one rule on `.list-page`'s child). The recipe, batch, creation and print routes need no choice of their own: decision 16's cap already holds them at 1482.

Device-unverified: Mark's own ultra-wide monitor and browser were not measured; the numbers are WebKit and Chrome on the dev machine at the five widths above.
