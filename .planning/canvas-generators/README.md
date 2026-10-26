# Canvas generators

Boards on the Claude Design canvases are made by the generators in this folder: edit the generator, regenerate, snapshot the approved boards into `.planning/sketches/NNN/`, then publish. Never hand-edit a board or a snapshot. Mark saves the canvas constantly, so read the artifact root (`project/canvas.json`) right before every publish and publish only the changed boards; never force.

## The three canvases

| Canvas | URL | Holds |
|---|---|---|
| Sprinkles (active) | https://claude.ai/artifact/JHwDoAYHDf9yQ1CcUZyATq | approved boards and boards still in play; pages newest first |
| Sprinkles Concepts | https://claude.ai/artifact/KiuMAYehfBgE4cUjZmNfmU | Mark's own original boards and images (not generated here); empty until the inventory is approved |
| Sprinkles Archive | https://claude.ai/artifact/1zrdQBJ57GkypsiDdgCBxB | boards and ideas not chosen: superseded drafts, rejected alternatives, option boards whose decision went another way; empty until the inventory is approved |

Rule: a board moves between canvases only after Mark approves `CANVAS-INVENTORY.md` (Mark's List row `look-canvas-inventory`), and `/marks-list` sends Sid back with his answer. Until then nothing is removed from the active canvas.

## Which generator feeds which page (active canvas)

| Page | Generator(s) |
|---|---|
| Ultra-wide | `ultrawide.py` (`ultrawide-capture.mjs`, `ultrawide-measure.mjs`; the survey note `.planning/notes/2026-10-26-ultra-wide-survey.md`) |
| Page notice shape | `noticeshape.py` (`noticeshape-capture.mjs`, `noticeshape-measure.mjs`, `noticeshape-options.json`; screenshots `noticeshape-shots/`) |
| Phase 11 steps, structure and save | `p11.py` (`p11-measure.mjs`), snapshot `snapshot014.py` |
| Log column rhythm | `p-rhythm.py` (`p-rhythm-measure.mjs`), `p-ladder.py` (`p-ladder-measure.mjs`), `p-pen-rhythm.py` (`p-pen-rhythm-capture.mjs`, `p-pen-rhythm-measure.mjs`; the control-size row's real-app probe `p-pen-rhythm-size-probe.mjs`, screenshots `p-pen-rhythm-shots/`); a board still in play is kept as generated under `boards/` until Mark approves it and it is snapshotted |
| Phase 10 creation editor | `p10.py` (`p10-run.sh`, `p10-measure.mjs`, `p10-restyle.py`), snapshot `snapshot013.py` |
| Phase 9 places | `places.py`, snapshot `snapshot012.py` |
| Phase 4 screens | `phase4screens.py` |
| Recipe-declared items | `declared.py`, `declared-canvas.py` |
| Print method | `sheetpages.py`, `method.py`, `p4print-canvas.py` |
| Print formats | `printstart.py`, `logforms.py`, `markone.py`, `markone-canvas.py`, `p4print-canvas.py`, snapshot `snapshot010.py` |
| Recipe route 03.5 | `gen.py` then `final.py` (final overwrites the route boards), and the option generators that name `page-13` (`pen.py`, `phone.py`, `showchanges.py`, `perstep.py`, `bys.py`, …) |
| Recipe route 03.5 concepts | `bysb.py` and the option generators that name `page-14` |
| Print formats superseded, Superseded print drafts | `printstart.py` (kept as superseded) |
| Home, Main, Recipe, Recipe History, Notebook, Recipe book, Idea log, Ingredients, Kitchen | hand-written boards from the first canvas session (2026-09-19 to 21); no generator |

## Moving a board to another canvas (the move pass, after approval)

A board is HTML, and the Artifact tool's `files` map copies another artifact's published files server side only for non-HTML files, so each board moves by hand:

1. Read the source canvas's `project/canvas.json` (the board's frame, `page` and title) and the board with `action: read`, `path: project/<Board>.dc.html`, `out_dir` in the scratchpad; any uploaded image it names (`/_blob/<id>`, Mark's Concepts boards) is read by its id as `path` and re-uploaded to the destination canvas with `publish`, `asset: true`, and the `src` repointed to the new `/_blob/` url.
2. Read the destination canvas's `project/canvas.json` (or write a new one with `createdOnFiles` for an empty canvas), add the board's entry (frame, `page`, `title`) and its name in `order`, add its page to `pages` when new, and publish the index with the board file in `files` under the same `project/` path, `root` the scratch folder.
3. Only then remove it from the source: read the source index again, take the entry out of `boards` and `order` (and its page from `pages` when the page is empty), and publish the index with `"project/<Board>.dc.html": null` in `files`. One canvas write at a time; the source index last so nothing is lost if a publish is refused.
4. Notes (titles and stickies) travel in the index's `notes` with their `page`; copy the ones on a moved page.

Record each move in `CANVAS-INVENTORY.md` (a Moved column) and in the sketch README that cites the board.
