---
target: canvas board P10_LogRhythm (page Log column rhythm), as the served file
total_score: 14
max_score: 24
na_heuristics: 3,5,7,9
p0_count: 0
p1_count: 2
target_identity: "file:/Users/mark/Documents/projects/sprinkles/.planning/canvas-generators/out-rhythm/P10_LogRhythm.dc.html"
target_fingerprint: "sha256:b6c39cf169a9697c89195222ac62eb14215fc943bf55816a23dc1165162a8dab"
target_path: /Users/mark/Documents/projects/sprinkles/.planning/canvas-generators/out-rhythm/P10_LogRhythm.dc.html
timestamp: 2026-10-21T12-51-55Z
slug: nerators-out-rhythm-p10-logrhythm-dc-html-ad7bf7f6
---
⚠️ DEGRADED: single-context (no sub-agent/Task tool is exposed to this agent; Assessment A was finished and written down before the detector ran, then Assessment B; both in this one context)

Target: the canvas board `P10_LogRhythm` (page "Log column rhythm", https://claude.ai/artifact/JHwDoAYHDf9yQ1CcUZyATq, served at version 429, id 1792586558-e78a), critiqued as a local file `.planning/canvas-generators/out-rhythm/P10_LogRhythm.dc.html`, a copy of the served board. The generator's output (`p-rhythm.py`, scratch `rh/project/P10_LogRhythm.dc.html`) and the served file are byte-identical (sha256 b6c39cf1…8dab), so either is the board. Mode: Read (a design document whose reader must understand the log column's rhythm and choose between three columns).

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | what changed between the three columns is not shown; the reader diffs 18/12/12/12 against 18/6/32/6 by reading numbers |
| 2 | Match System / Real World | 3 | plain words and token names; "line normal", "tracking 0.96px" and "size sheet-type-control" are CSS, not Mark's words |
| 3 | User Control and Freedom | n/a | a static board; nothing to undo or exit |
| 4 | Consistency and Standards | 3 | one annotation grammar across all three columns; only the Scales region is dimensioned, Style and Problems are not |
| 5 | Error Prevention | n/a | no input |
| 6 | Recognition Rather Than Recall | 2 | no legend for the blue tick, dotted leader and bracket; the recommendation lives on Mark's List, not on the board |
| 7 | Flexibility and Efficiency | n/a | the canvas's own zoom and pan are the only interaction |
| 8 | Aesthetic and Minimalist Design | 2 | 57 labels in 11 to 12 px grey, leaders crossing the Style region's fields; every role labelled three times |
| 9 | Error Recovery | n/a | no errors to recover from |
| 10 | Help and Documentation | 2 | the title and the three subtitles explain the columns; nothing explains the notation |
| **Total** | | **14/24** | **Acceptable (58%)** |

n/a: heuristics 3, 5, 7, 9 (a static design document).

## Design Specificity Verdict

**LLM assessment.** Authored for this product: the three panels are the real log column (the built shell's stylesheets, every value a token, the measured DOM), and the labels name Sprinkles' own tokens (`app-size-meta`, `app-notebook-pen-cue-line-h`). The annotation layer is the one category-interchangeable part: blue ticks, dotted leaders and bracket dimensions are the generic spec-sheet convention, drawn in the App's `app-blue-text` so they at least belong to the palette. The missed opportunity is the one the board exists for: the three columns differ by a handful of values, and nothing marks which values differ, so the rhythm is documented but the choice is not made easy.

**Deterministic scan.** `impeccable detect --json` on the file: 0 failures, 4 advisory findings. Three `tiny-text` (11 px body text) and one `design-system-font-size` (11 px off the DESIGN.md type ramp, line 3630). All four are the board's own annotation (`.rh-dimlab small`, the token name under each dimension), not the log column; they stand as advisory for the document. Nothing in the three panels themselves was flagged: the cue face, captions and fields read the app's tokens.

**Visual overlays.** The board was served on a local static port (127.0.0.1:8411, the live server itself answers only its endpoints) and opened in Playwright WebKit as a fresh tab titled `[Human]`; injection preflight passed (title set, a script tag appended), `http://localhost:8400/detect.js` was injected from the critique's live server, and the page console reported `[impeccable] 3 anti-patterns found` (the three `tiny-text`), six overlay nodes drawn. The live server and the static server were stopped before this report. No Chrome or on-screen browser tab: the overlay existed in the headless WebKit page only, so there is no tab for Mark to look at. One console 404 is the canvas wrapper's `./support.js`, absent outside the canvas: a false positive, dropped.

## Overall Impression

A measured, honest spec: the numbers on it are real (WebKit, the real DOM) and the three columns line up so the eye can compare the Scales region at a glance. But it reads as three identical spec sheets rather than one argument. The single biggest opportunity: mark the deltas. Six values change between the columns (four gaps, one size, one line height); if those six were the only things in blue and everything unchanged were quiet, the choice would take five seconds.

## What's Working

- **The dimension column is the board's best idea.** 18 / 12 / 12 / 12 / 12 / 12 / 12 / 12 / 30 down the left of "As drawn" against 18 / 6 / 32 / 6 / 12 … in A and B says, without prose, what the rhythm is and what the revision does; the token name under each figure ties the drawing to `tokens.css`.
- **It proves the finding Mark raised.** In the as-drawn column the labels read `Group cue grotesk 14/600` directly above `Core names grotesk 15/400`: the item is larger than its heading, in the board's own measured words. That is the evidence for decision 25's follow-up and B's reason to exist.
- **Three real panels, one grammar.** The same roles, the same selectors, the same label order in every column, so a difference between columns is a difference in the design, never in the drawing.

## Priority Issues

- **[P1] The deltas are invisible.** Only six values differ across the three columns, and they look exactly like the fifty that do not. **Why it matters:** the board's job is to make the choice easy; today Mark has to read every dimension three times. **Fix:** in `p-rhythm.py`, compare each column's measured roles and gaps against "As drawn" and draw only the changed figures in the accent (filled bracket, bold figure, "was 12" under it), the unchanged ones in secondary; add a one-line "What changes" under each column's subtitle (A: four gaps; B: four gaps, the core names' size and line). **Suggested command:** /impeccable layout.
- **[P1] Every role is labelled in all three columns.** Nineteen labels × three = 57, at 12 px, and in the Style region the collision stacking pushes labels well below their elements so the leaders cross the fields (Field caption, Field value, Unit all run over Serving temperature). **Why it matters:** the Style region does not change between columns, so its 30 labels are noise that buries the Scales region, which does. **Fix:** label the roles once, in the first column; in A and B label only the roles whose spec changed; or drop Style's labels to a single "unchanged" note. **Suggested command:** /impeccable distill.
- **[P2] Only Scales is dimensioned.** Problems carries the same two cues and the same card, and A and B move its gaps too (32 above "This recipe only"), but no bracket shows it; Style's head-to-menu and Targets gaps are undimensioned. **Why it matters:** Mark's note was about "the rhythm of the sections", plural; a reader cannot tell whether A and B touch Problems. **Fix:** dimension Problems (and the region-to-region gap, 40 px of padding plus the rule) with the same brackets. **Suggested command:** /impeccable layout.
- **[P2] The recommendation is not on the board.** The title says "for Mark's choice"; the decide row names B as recommended; the board itself ranks nothing. **Why it matters:** the canvas is where Mark looks; the list is where he answers; the argument should be where he looks. **Fix:** a short "Recommended: B, because …" line in the B column's subtitle, and a one-sentence reason in each of the other two. **Suggested command:** /impeccable clarify.
- **[P3] Notation is unexplained and the token sums are hard to read.** No legend for tick, leader and bracket; "gap-xs + gap-s + gap-s" wraps to three lines under the 30 px bracket; "line normal" and "tracking 0.96px" are CSS words. **Fix:** a four-item legend at the top left; write sums on one line ("30: xs + s + s"); say "line 16" instead of "normal" by measuring the box, and "tracking 0.08em" instead of px. **Suggested command:** /impeccable clarify.

## Persona Red Flags

**Alex (Mark reading fast):** cannot find the six changed values without reading 57 labels; no "what changed" line; the recommendation is on another page (Mark's List). Will zoom to the Scales brackets and ignore the labels.

**Jordan (a reader new to the notation):** no legend; "line normal", "size sheet-type-control" and "tracking 0.96px" assume CSS; the 30 px bracket's three-line token sum reads as three separate things. Will trust the panels and skip the annotation.

**Sam (screen reader, zoom):** the annotation layer is positioned divs with no text alternative for the brackets and leaders, and the 11 px token names under the dimensions fall below the floor the detector flags; at 200% zoom the three columns (3268 px wide) demand horizontal travel, which the canvas's own pan handles. As a canvas board this is advisory, not blocking.

## Minor Observations

- Label text is `rgb(89,89,89)` on white at 12 px: about 7:1, fine; the 11 px token names likewise, but 11 px is below the app's own smallest size (12).
- The three subtitles are long single paragraphs in the 13 px grey caption face; they carry the argument and deserve the 15 px label face the column titles use.
- The leaders' dotted blue over the Kind cells' filled blue (Right in the middle) disappear for 130 px.
- Dimension brackets sit at the panel's left edge; the role ticks at the right; the eye reads two margins at once. Acceptable, but the brackets for the changed gaps could sit between the panel and its labels so delta and role share one margin.
- The "As drawn" subtitle says "12 px between everything"; the board itself measures 18 under the region head and 30 above Add scale, so the subtitle undersells its own evidence.

## Which revision the critique favours

**B.** The as-drawn column's own labels show the inversion (a 15 px item under a 14 px cue); A fixes the spacing but leaves that inversion standing, so the group still has to be read from white space alone, which is the kind of cue that fails in a dense column; B keeps A's 32 / 6 rhythm and brings the core names to the pen's 14 on the 20 px line, so the cue is the heaviest and the largest thing in its group and the column reads like the record pen it sits beside. The fields keep 16 px as inputs, which is right: a field is not an item under the cue. Nothing on the board argues for "As drawn".

## Questions to Consider

- What if the board showed only the differences, with the unchanged spec available in one column as a reference?
- Does the reader need the Style region at all, or is its presence here only proving that A and B leave it alone?
- What would the record pen's own group (the batch record's axes) look like placed beside column B as a fourth column: the existing standard the column is meant to match?
- If B is chosen, does the same 15-versus-14 rule apply to the Problems core line and to the card head, or only to the names under a cue?
