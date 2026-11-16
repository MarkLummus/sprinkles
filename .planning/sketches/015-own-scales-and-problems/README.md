---
sketch: 015
name: own-scales-and-problems
question: "What do a recipe's own scales and problems look like on the record pen, on the reading and on the printed Batch log and Tasting log (a scale of each kind, and none; the pen and the reading also at 393), what does a marked Low to high scale say back, and how do the two log pages start 1.5 in down for the clipboard and still stay one page each?"
winner: "Answered by Mark 2026-11-15 on Mark's List: the pen and the reading approved as drawn (look-p12-pen-and-reading); the read-back is candidate A (decide-p12-low-to-high-read-back); the Tasting log keeps 4 notes lines, the Batch log 13 (decide-p12-tasting-log-lines); the printed logs done with the note that the 2 3 4 under the ticks are not required (look-p12-printed-logs). The printed Low to high row is redrawn for that note and approved by Mark 2026-11-15 (look-p12-printed-row-ends-only). Acceptance target for Phase 12's first planning round (TASTE-04, 12-CONTEXT D-01 to D-03, D-15 to D-17)"
tags: [tasting, scales, problems, pen, reading, print, batch-log, tasting-log, clipboard, phase-12]
---

# 015 own scales and problems: the record pen, the reading and the printed logs (Phase 12 Gate 1)

Mark answered the four Gate 1 rows on 2026-11-15 (local). Three stand as drawn; the fourth asked for one change, which is drawn here and **approved by Mark 2026-11-15 (`look-p12-printed-row-ends-only`)**: on the printed Tasting log a Low to high scale has nothing under its ticks.

Authority: these boards, CSS included, are the authority. Conformance is the board and the built app side by side in a browser, never prose or a test count. `CONTRACT.md` names what the boards hold so a planner, a checker and UAT cite one source.

## What is here

| File | Canvas board (page "Phase 12 own scales and problems (Gate 1)") | What it draws | State |
|------|------------------------------------------------------------------|---------------|-------|
| `record-pen.html` | `P12_Pen` | The record pen's tasting, cut to the scales and Any problems?, at the 350 column (1366) and at 393, for three recipes: two own scales (one of each kind) and two own problems; one Low to high scale and one problem; none of its own (no "This recipe only" cue anywhere). | Approved (`look-p12-pen-and-reading`) |
| `reading.html` | `P12_Reading` | The reading's Tasting fold for the same three recipes, at 350 and 393. A marked Low to high scale reads back as candidate A. | Approved (`look-p12-pen-and-reading`) |
| `read-back-candidates.html` | `P12_ReadBack` | The three read-back candidates A, B and C side by side, the scale marked 1 to 5 and in the reading. | The record of the choice: A chosen, B and C not |
| `printed-logs.html` | `P12_Logs` | Letter pages at full size: the build's Batch log and Tasting log for comparison, then the drawn Batch log and three drawn Tasting logs (two, one and none of its own), each starting 1.5 in from the top of the paper. | Done with Mark's note; the Low to high row redrawn, approved by Mark 2026-11-15 (`look-p12-printed-row-ends-only`) |
| `tasting-log-lines.html` | `P12_LogLines` | The fullest Tasting log with 4 notes lines and with 5. | The record of the choice: 4 chosen. Its Low to high row carries the same redraw |

Three example recipes: Coffee declares Body (Right in the middle; thin, heavy) and Coffee flavour (Low to high; faint, strong) and the problems Bitter and Burnt taste; Mint chip declares Mint (Low to high; faint, strong) and Waxy chips; Mexican Chocolate v1 is as seeded and declares nothing. The example words are Sid's, not Mark's and not in the data.

Source: taken as served by the canvas (https://claude.ai/artifact/JHwDoAYHDf9yQ1CcUZyATq, version 1794791268-56d5, canvas version 514, read 2026-11-16 UTC) by `.planning/canvas-generators/snapshot015.py`. The only changes are that the canvas's `support.js` line is dropped and the Caveat upload points at the app's own copy, so each file opens on its own (checked: all five render in WebKit and Chrome from `file://` with no page errors). `p12.py` regenerates all five byte for byte (`canvas-generators/boards/P12_*.dc.html`, cmp checked against the served files). sha256: `record-pen.html` 9b99f13a, `reading.html` 4446a8aa, `read-back-candidates.html` 33beca82, `printed-logs.html` b54d4e95, `tasting-log-lines.html` 8f013be9.

How the boards are made: every panel is the built app's own markup (`p12-capture.mjs`: WebKit, coarse pointer, `app/dist` of 2026-11-15, the example recipes written into a throwaway IndexedDB) under the app's own stylesheets, with only the decided Low to high forms and the clipboard margin drawn over it. So what the boards keep as built is the build, and what they change is listed in `CONTRACT.md`.

Board titles on the canvas still say "proposed" (`P12_Pen`, `P12_Reading`) and "for Mark to pick" (`P12_ReadBack`): those three boards were approved or answered as served and were not republished, so the snapshot is the file Mark looked at. This README is the record of their state.

## Decisions

Mark's answers on Mark's List, 2026-11-15, in his words. Row text is data; the ids are the record. They are also written into `.planning/phases/12-*/12-CONTEXT.md` (D-01, D-02, D-17; commit fa72504c).

1. **The read-back is A** (`decide-p12-low-to-high-read-back`: "A"). A marked Low to high scale says back the end word at 1 and 5 and the number between: faint (1), 2 of 5, 3 of 5, 4 of 5, strong (5). Drawn on `P12_Reading`; `P12_ReadBack` keeps B (always "n of 5") and C (the nearer end word) as the record of what was not chosen. A Right in the middle scale reads as built, "heavy (4)", "right (3)".
2. **The Tasting log keeps 4 notes lines** (`decide-p12-tasting-log-lines`: "4 lines"); the Batch log 13 (it had no choice: 14 do not fit). Drawn on `P12_Logs`; `P12_LogLines` keeps the 5-line page as the record.
3. **The pen and the reading are approved as drawn** (`look-p12-pen-and-reading`: "Approve"). `P12_Pen` and `P12_Reading`.
4. **The printed logs: done, with one change** (`look-p12-printed-logs`, his note: "The 2 3 4 under their ticks are not required"). Redrawn the same day: the printed Low to high row keeps its low word, 1, the rule with its five ticks, 5 and its high word, and nothing stands under the ticks, neither "right" nor 2 3 4. The pen keeps its numbered stops. Everything else on the board stands. **Approved by Mark 2026-11-15 (`look-p12-printed-row-ends-only`, his note: "Approve").**

What Sid chose inside decision 4, for Mark to see on that row:

- The five bare ticks stay. Every printed scale has them and they are where the mark goes; a Low to high row differs from the others only in having no word under the middle tick.
- The row stays 36 px, in step with the scales above it (sketch 010 D19). With nothing in its second line the bare row measures 25 px in WebKit and Chrome, so the board gives every scale's second line the height "right" has today (small print set solid, 12 px): one rule on `.lf-sc`, no new class, and a Right in the middle row measures the same 36 with it.

## Measured (WebKit, coarse; Chromium beside it)

From `canvas-generators/p12-measure.json` and `p12-measure-chromium.json` (`p12-measure.mjs`), 2026-11-15. A drawn log page has 810 px of height in Safari's print (900 less the 90 px drop) and 864 in Chrome's (960 less 96).

| Page | Notes lines | Needs | Safari spare | Chrome spare | Scale rows |
|------|-------------|-------|--------------|--------------|------------|
| Batch log | 13 | 790 | 20 | 74 | none |
| Tasting log, Coffee (six scales, six problems) | 4 | 767.9 | 42.1 | 96.1 | all 36 |
| Tasting log, Mint chip (five, five) | 4 | 731.9 | 78.1 | 132.1 | all 36 |
| Tasting log, Mexican Chocolate (four, four) | 4 | 695.9 | 114.1 | 168.1 | all 36 |
| Tasting log, Coffee, 5 lines (not chosen) | 5 | 800.9 | 9.1 | 63.1 | all 36 |

The redraw moved no total: each page needs what it needed with the 2 3 4 drawn. Chromium agrees within 0.3 px. The pen and reading panels match the built app's own boxes (scales, chips, cues, reading cells: all equal), at 350 and 393.

Device-unverified: these are Playwright WebKit and Chromium measures of the drawn pages at Safari's and Chrome's print content widths, not a print from Mark's iPad. Safari print differs from Chrome print, so the one-page fit is proved only by a PDF from the iPad once the pages are built.

## For the plan

- The build today draws a Low to high scale as a Right in the middle one, with "right" under the middle (`bug-p11-low-to-high-scale-centre-mark`); the boards draw the decided forms over the built markup. Section by section in `CONTRACT.md`.
- `--sheet-print-clipboard-drop` is a proposed token name for the 1 in the two log pages add to the 0.5 in page margin; it is 96 px on the page picture and needs 90 px in WebKit print for the same inch (1 CSS px is 0.8 pt there). Only the two log pages take it (12-CONTEXT D-16).
- Printed pages carry no "Every recipe" / "This recipe only" cue (sketch 010 D23).
- Gate 2 (entry points below 724, Preview step in the version pen, the row controls) is not drawn here.

## Word limits (2026-11-16)

Mark's decision of 2026-11-16 (`12-UI-REVIEW.md` finding 2, option b, Sid's recommendation): the creation editor limits the words a maker types for a recipe's own scales and problems. A scale's name holds at most 16 characters, each of its end words 12, and a problem 40, all counted on the trimmed text. Save refuses a field over its limit with "Use N characters or fewer." under the field, writes nothing, and puts focus on the first refused field. The sentence is Claude's wording within the gate's existing shape, for Mark in chat. Built in quick `261116-80u`; the limits bound what the editor saves, not what a store file may hold (import is unchanged).

| File | Board | What it draws | State |
|------|-------|---------------|-------|
| `word-limits.html` | `P12_WordLimits` | The creation editor's Scales and Problems at 1366 after Save was refused: a scale name of 21 characters, a low end at its limit (12), a high end of 17 and a problem of 51. Three sentences stand, the low end stays quiet. | Drawn from the build by `canvas-generators/p12limits.py` on 2026-11-16 (capture `p12limits-capture.mjs`), not yet on the canvas, awaits Mark's look. |

sha256: `word-limits.html` e8a81039. The five files above are unchanged. `12-board-limits.mjs` holds the build to it at 1 px in WebKit, coarse.

What the longest allowed words measure (case `worst` in `12-cases.mjs`: names of 16 characters, end words of 12, problems of 40; WebKit, coarse, the scratch build of this commit, 2026-11-16). All device-unverified: Playwright WebKit and a WKWebView PDF, not a print or a pen on Mark's iPad.

- The printed Tasting log needs 804.8 px: 5.2 px spare of Safari's 810 at 630 px, 59.2 spare of Chrome's 864 at 672 px. Every scale row is 36 px. Each own scale's low word starts at or right of its name column's edge (word 199 and 197.4, edge 182). The longest high word, "overwhelming", runs 8.4 px past its 76 px column into empty paper. The WKWebView PDF holds Batch log and Side 1 of 2 on page 1 and Tasting log and Side 2 of 2 on page 2 only; the Tasting log's ink ends at 756.0 pt, the bottom margin line.
- The record pen's anchor words, gaps between neighbouring words (the 6 px floor is finding 1's): at 1366 and at 393 the track is 216 px, Burnt sugar note 58.77, Chocolate flecks 19.28 and 19.28. At 768 the track is 186 px: Burnt sugar note (Low to high, two words) 28.77; Chocolate flecks (Right in the middle, three words) 4.28 and 4.28. Every word stays inside its track and no width scrolls sideways.
- **For Mark:** the Right in the middle scale at 768 with two 12-character end words leaves 4.28 px between words, under the 6 px of finding 1. Words do not touch. Mark's 12-character limit cannot give 6 px at a 186 px track; the choices are to accept it, give that kind a lower end-word limit, or widen the track.

