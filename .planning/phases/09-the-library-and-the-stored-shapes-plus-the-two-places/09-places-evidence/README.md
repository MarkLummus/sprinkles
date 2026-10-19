# Phase 9 places: side-by-side evidence

Written by `09-places-check.mjs --library original --evidence <this directory>` (plan 09-16).
The built app (WebKit, coarse pointer, the library store rewritten to data/library.js's 26 entries,
every route the places link to visited first in the same context) beside the matching panel of
sketch 012's boards (.planning/sketches/012-places/), at the same width. A 1366 app picture is the
full page; a 393 picture is the first screen (852 tall), as the board draws it.

| Place | State | Width | Shows | App | Board | Sizes |
| --- | --- | --- | --- | --- | --- | --- |
| notebook | list | 1366 | the seeded recipes, full page | `notebook-list-1366-app.png` | `notebook-list-1366-board.png` (notebook-place.html, panel `pn1`) | app 1366 by 1079; board 1366 by 1079 |
| ingredients | open | 1366 | the 26 entries, Heavy cream open, full page | `ingredients-open-1366-app.png` | `ingredients-open-1366-board.png` (ingredients-place.html, panel `pi1`) | app 1366 by 2452; board 1366 by 2452 |
| ingredients | milk | 1366 | Name typed: milk | `ingredients-milk-1366-app.png` | `ingredients-milk-1366-board.png` (ingredients-place.html, panel `pi7`) | app 1366 by 729; board 1366 by 729 |
| notebook | list | 393 | first screen | `notebook-list-393-app.png` | `notebook-list-393-board.png` (notebook-place.html, panel `pn2`) | app 393 by 852; board 393 by 852 |
| ingredients | top | 393 | first screen; Heavy cream is open, below the fold, as the board draws it | `ingredients-top-393-app.png` | `ingredients-top-393-board.png` (ingredients-place.html, panel `pi2`) | app 393 by 852; board 393 by 852 |
| ingredients | open | 393 | scrolled so Heavy cream sits where the board draws it | `ingredients-open-393-app.png` | `ingredients-open-393-board.png` (ingredients-place.html, panel `pi3`) | app 393 by 852, scrolled 1434; board 393 by 852 |
| ingredients | milk | 393 | Name typed: milk, first screen | `ingredients-milk-393-app.png` | `ingredients-milk-393-board.png` (ingredients-place.html, panel `pi8`) | app 393 by 852; board 393 by 852 |

A verdict per pair, from looking at both, is recorded in plan 09-16's SUMMARY.md.

## Verdicts (added by hand after looking at each pair; rerunning the script rewrites this file)

Every pair is byte-identical (`cmp` finds no difference between the app and board PNGs), and each picture was looked at: the rail colours, type, spacing, cuts, the open entry's table and lines, the count line and Clear filters all match.

| Pair | Verdict |
| --- | --- |
| notebook-list-1366 | matches |
| notebook-list-393 | matches |
| ingredients-open-1366 | matches |
| ingredients-top-393 | matches |
| ingredients-open-393 | matches |
| ingredients-milk-1366 | matches |
| ingredients-milk-393 | matches |

One visible oddity is in both the board and the built page, so it is not a conformance gap: in the open entry at 393 the basis and the source run together with no space ("derivedpanel reconciled three ways against a 36% regulatory floor" for Heavy cream's Fat). Plan 09-17 names it in the device row for Sid or Mark to rule on.
