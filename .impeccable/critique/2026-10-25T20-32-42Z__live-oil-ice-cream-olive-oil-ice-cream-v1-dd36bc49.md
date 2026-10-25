---
target: the built batch route, Olive Oil v1, re-critique after the ladder, the rhythm change set, the peer Tasting head, the churn trio and the ink notice card
total_score: 29
max_score: 36
na_heuristics: 10
p0_count: 0
p1_count: 0
target_identity: "url:http://localhost:4173/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1"
timestamp: 2026-10-25T20-32-42Z
slug: live-oil-ice-cream-olive-oil-ice-cream-v1-dd36bc49
---
Method: dual-agent (A: Sid, design review · B: Sid, detector and WebKit evidence, run in Bishop's place by Sarge's instruction; A's scores were written before B's numbers were read)

Target: the built batch route, /notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1 on the 4173 preview (rebuilt from main at 20:03 UTC; HEAD f58c861b), judged in Playwright WebKit at 1366 × 744 (coarse pointer), 723 × 1024 and 393 × 852, as the re-critique of 2026-10-22 (24/36, three P1s). Same persona tasks: record a churn and a tasting. Mode: Operate. States: the reading state (the seeded, tasted batch), the pen blank, the pen filled as the sheet would be (Record another → Add tasting → Save batch), the amend pen (Correct), the churn-only save, and Record a tasting from the band (723 and 393). Device-unverified: every number here is WebKit on the Mac; Mark's iPad and iPhone passes of 2026-10-25 are his evidence, not mine. Probe and screenshots: scratchpad `crit2/probe.mjs`, `crit2/out/measure.json`, `crit2/out/*.png`.

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 4 (was 3) | "Batch saved." lands 59 px below where Save was at 1366, 34 px at 393, 32 px under the focused Batch head at 1366; one place for every trigger |
| 2 | Match system / real world | 4 (4) | The sheet's words, now shorter: Churned, Duration, Temperature, Why blank |
| 3 | User control and freedom | 3 (3) | Clear is still 288 px to the right of a stop; its hit area is now 44 px tall at 1366 under a coarse pointer |
| 4 | Consistency and standards | 3 (was 1) | One caption face (24 of 24 in the pen), 18 under both heads, the same word the same style in pen and reading; one line left on the old face (RECORDED) |
| 5 | Error prevention | 3 (was 2) | Required stated before refusal; blank axes no longer shout "(Not recorded)"; the WebKit date-field paint is still device-unverified |
| 6 | Recognition rather than recall | 3 (3) | The Tasting fold is closed at 393 and 723, one meta line over the marks |
| 7 | Flexibility and efficiency | 3 (3) | Pen 2,232 px at 1366 and at 393 (was 2,279 / 2,395); Record a tasting opens on Tasted; nothing skippable, by Mark's one-column call |
| 8 | Aesthetic and minimalist design | 3 (was 2) | Nine visual steps where there were fourteen, five of them the ladder's; 16 type settings, now each a role |
| 9 | Error recovery | 3 (3) | In-place date refusal; "Your entries have been kept"; Undo on a removed tasting; unchanged |
| 10 | Help and documentation | n/a | No in-app documentation exists; the labels are the help by brief |
| **Total** | | **29/36** (was 24) | **Good** |

## Design specificity verdict

**Authored, for this product, and now dressed as one.** The 2026-10-22 verdict stood on the controls (the joined stops, Nothing to note / Not evaluated, Clear as the only way back, the hand for the maker's words) and faulted the dressing: caps captions over rounded fields at nineteen settings. The ladder fixes the dressing. Squinted, the pen at 1366 is two caps heads, five bold cue words, and groups: the churn trio, two notes, the At draw block, the tasting trio, note, melt pair, Next time, the From freezer block, four axes, two axes, chips, the ceremony. The reading state is the same path as cells. Nothing here could be a settings page now; the one thing that could is the inverse "Batch saved." card, and that is the right kind of generic.

**Deterministic scan:** in-page detector injected in the same six states as 2026-10-22 (reading and blank pen with tasting, at 1366, 723 and 393; `window.impeccableScanAsync` after `detect.js` from the live server on 8400). **Zero findings inside the log column in all six states** (was 4 `tight-leading` on the hand notes and 1 `skipped-heading` in the reading). Outside the surface, as before: 18 `cramped-padding` per state on the Sheet's target chips and method targets; 1–2 `line-length` on the headnote prose (~91 chars); 1 `tight-leading` on the Sheet's `.method-step__changed.sheet-hand` (1.00×, the sheet's own hand on the method); 1 `first-viewport-column-overflow` at 1366 on `article.recipe-page` (a page-level finding). No `text-occlusion` false positive this time. CLI `impeccable detect` was not run on the JSX (a null result, proved 2026-10-22).

**Visual overlays:** no user-visible overlay tab (Playwright, not the browser extension); 36 to 42 overlay nodes per injection; screenshots `crit2/out/reading-detect-*.png` and `pen-detect-*.png`.

**Where A and B agree:** the pen's interval list; the one caption face; the two heads as peers. **Where B saw what A did not:** the one retired caption face left on the reading's RECORDED line (12/500, 0.48 px), which the eye reads as "a bit lighter" and the table reads as a second face; the caption's three line boxes (14.4 in a field row, 16.2 standalone, ≈15 on an axis name), which is the one cause behind every interval that is not on the ladder. **Where A saw what the detector cannot:** everything about rhythm, the card's place, the fold at 393.

## Overall impression

The three P1s are closed and the column reads as one voice. Measured in the filled pen, identical at 1366 and 393: 18 under both heads; 6 from every caption to its control; 12 between fields, under a cue over a control, and under each seam rule; 20 at the region seam (20 + rule + 20) and after From freezer's options; 32 between groups and above the ceremony. Four residual values (15.3, 16, 17, 25) are the ladder's 12 and 20 plus the slack of a 20 px head line holding a 14.4 to 16.2 px caption at flex-end, which Mark approved on 2026-10-24 ("options to the next caption read 15.8"). The pen is 2,232 px tall at both widths (was 2,279 and 2,395). Control text: option words 14/400 (13 of 13), stop digits 14/400 (30 of 30), fields 16/400 (11 of 11), chips 13/400 (the ladder's own line). The Tasting head is an h2 in the Batch head's grammar (14/600 caps secondary, a 44 px row, Remove tasting 104 × 44 flush right where Correct and Record another sit), 20 + rule + 20 above it. Churned · Out of machine · Duration share one line (label tops 417.2 at 1366, 4,972.4 at 393; 120 + 119.5 + 81.9 with two 12s = 345.4 in 350); Tasted · Tempering · Temperature share one (325.8). Both date fields 120. The card: "Batch saved.", 135 × 50, `rgb(20,20,20)` on white text, 16/24, 12/20 padding, 10 px radius, `0 4px 16px rgba(20,20,20,.18)`, centred to 0.0 px, 20 px above the window's foot at 1366 and 76 (tab row 56 + 20) at 723 and 393, `role=status aria-live=polite`, gone at 5 s; focus on the Batch heading. The heading outline in every state: h2 Batch > h3 At draw; h2 Tasting > h3 From freezer, Every recipe, This recipe only, Any problems? > h4 Every recipe, This recipe only; reading h2 Batch, h2 Tasting, h3 cues, h4 This recipe only, h3 Next time. No skipped level. What is left is small and named below.

## What's working

1. **The ladder is legible without a key.** Region 14/600 caps secondary, cue 14/600 ink, content 14/400, caption 12/600 caps secondary as a tag: the same word is the same style in the pen and the reading ("Out of machine" 12/600/0.96 in both), and the sequence never grows going down. "hard (4)" under HARDNESS under Every recipe reads as value, tag, group.
2. **The save lands where the hand was.** At 393 the maker presses Save at viewport y 692 and the card appears at 726, over the log, 17:1 against the ground, and the page has scrolled the saved batch's head into view 278 px above it. At 1366 the card is 59 px under where Save was and 32 px under the focused head. One rule, every trigger, no colour as verdict.
3. **Tasting is a peer of Batch, in the outline and on the page.** Two h2s, two 44 px head rows, the same act slot, the same 18 to the first row, the region seam between them. Record a tasting (723, 393) opens the pen with the region present and focus on Tasted.

## Priority issues

- **[P2] One caption still wears the retired face.** The reading's RECORDED line (`dl.batch-row__provenance dt`) is 12/500 with 0.48 px tracking (`notebook.css` 1384 sets the size, `app.css` 1639 the weight and tracking); every other caption in the log is 12/600 with 0.96 px. Why: the ladder's rule is one caption face in the log, decided on `decide-p10-log-ladder-r2` and `decide-p10-ladder-reach` (every grouped surface in the log), and this is the last line outside it, on every saved batch. Fix: the dt takes the caption face (`font-weight: 600; letter-spacing: var(--app-tracking-label)`) in the log skin. Settled by the rule, no decision: command `/gsd-fast`.
- **[P3] The caption's line box is three heights, which is why 12 reads as 15 to 17.** A field-row caption sits on a 14.4 px line (`--sheet-leading-table`), a standalone caption on 16.2, an axis name on `normal` (≈15), all at flex-end in a 20 px head line; so options → next caption is 16, textarea → MELT TEST 15.3, cue → first axis name 17, anchors → next axis name 25. Mark approved flex-end knowing 15.8 (`decide-p10-pen-caption-align`), and P10_Pen draws it, so the board and the app conform. If one line box is wanted later it is one rule (the log's captions on one line height) and a /impeccable layout measure first; not open now.
- **[P3] At 393 the card lands on the Tasting fold row for its five seconds.** After a save with a tasting, the page scrolls the Batch head into view and the Tasting fold control ("Tasting · Show · tasted 21 Oct 2026") sits under the card (at 723, the Next time conclusion; at 1366, the Sheet's Freezing basis line). Mark chose B knowing the card covers the log at 393 (`decide-page-notice-shape`); the ladder's shorter reading moved what it covers from the Recorded line to the fold control. Inert, 5 s, no row; said here so the device check knows what to look for. Command, if ever: `/impeccable harden`.
- **[P3] The Tasting fold is closed below 1366.** At 393 and 723 a saved batch's marks sit behind "Tasting · Show · tasted 21 Oct 2026", one meta line, while Batch opens. Standing since sketch 011 (the 2026-10-22 critique's H6 finding, unchanged by this change set). A question for Mark below, not a row: no option has been drawn.
- **[P3] Chips at 13 under options and stops at 14.** The ladder's controls line keeps chips at `--sheet-type-control` (13), so under Any problems? the chip words are the smallest control text in the pen while every other choice is 14. By decision (`decide-p10-log-ladder-r2`, revision 2 as drawn). From the measured widths the Every recipe row at 14 would sum to about 355 in 350, so two chips per line instead of three and one; estimated, not measured. Command if Mark wants it: `/impeccable typeset`, then a decide row.

## Persona red flags ("record a churn and a tasting")

**Mark, iPad landscape, sheet in hand.** The churn trio is one line, the date field 120 (WebKit's intrinsic 16 px date box is 109; the iPad's own control is his to look at). A slip on a stop still means Clear 288 px to the right, but at 1366 under a coarse pointer the hit area is now 44 px tall (`::after`) around a 35.6 × 18.2 word. He saves at the foot and "Batch saved." appears 59 px under his thumb, 32 px under the head that says "churned 20 Oct 2026". An empty focused churn date may still paint today's date with a segment highlighted (WebKit on the Mac; not reproduced on the device by anyone yet).

**A newer maker on an iPhone, adding a tasting a week later.** The band's Record a tasting opens the pen with Tasting already standing as a region and focus on Tasted; the pen is the same 2,232 px as the desk's. Why blank now says what the dashed pair stores. After the save, the Tasting fold is closed and the card sits on its Show control for five seconds: the one moment the phone makes him wait.

**A keyboard or VoiceOver maker at 1366.** Regions are h2s, cues h3s, the nested captions h4s; the outline has no skip in any state; the five Clears and Remove tasting have distinct names; the card is a polite status that never takes focus, and focus lands on the saved record's h2. The page carries two h1s (the band's "Olive Oil Ice Cream, circulator" and the Sheet's "Olive Oil Ice Cream"), outside this surface.

## Cognitive load

Passes now: group headings distinct from items (cue face and 32 above); spacing encodes grouping (6 / 12 / 20 / 32); one caption face; one choice-control size apart from chips; short plain labels; no wizard, by brief. Fails: more than four items per group (four core axes, a six-field churn section) and a 2,232 px column with no progressive disclosure beyond Add tasting, both by Mark's 2026-10-24 ruling for one column. Decision points over four options: every axis (5 × 6), the Every recipe chip row (4). The pen holds 30 radios, 4 toggles, 5 fields, 7 Clears and 3 ceremony buttons as before; what changed is that the eye can now find the twelve groups they fall into.

## Emotional journey

Peak: the reading after save, blue script over 14/400 cells under caps tags, "hard (4)", "Creamy puddle", and the ink card at the foot saying the one thing that matters. The grotesk-while-typing to Caveat-when-saved reveal (sketch 013 decision 26) is sharper now that the typed face is the App's own. Valleys: the four axes are still the long stretch; the phone's closed Tasting fold after a save. End: strong, which it was not on 2026-10-22.

## Minor observations

- Cancel 15/600 blue outline, text acts 14/600 underlined, Hide 13/400 ink: three sizes of one blue word, as before. Cancel and Save batch share `.button`'s size with Next version (`--sheet-size-table-body`, 15, a Sheet token under an App button: the pending context rename), so this is a role, not a stray.
- "Required" (12/400 ink) and the fold counts (12/400 secondary): one role, two colours, as before.
- "Next time" in the reading is an h3 in the caption face: a heading to the outline, a tag to the eye. The ladder says a caption (it heads one line); the outline says a peer of Every recipe. One of them should give.
- The Hardness and Smoothness heads carry "(4)" and "(2)" in 13 px pen blue beside the 12 px caps name: the one place pen blue is app text rather than the maker's words.
- Units ("°C", "min", "g lost at 20 min") are 13/400 ink in the pen and 14/400 secondary in the reading.
- "Greasy film" is still alone on its second chip line at 350 wide.
- The pen's At draw options read secondary (`rgb(89,89,89)`) with dashed borders when marks exist below, with "Clear marks below to choose." at 13 px: the off state D10 drew, and the only grey control text in the column.
- The full-page captures show the bar painted mid-page; that is the screenshot's sticky-header artefact, not the app.

## Questions to consider

1. Should the Tasting fold open by default below 1366 when the batch in view has a tasting, so the marks a phone maker just typed are not behind one meta line and the card does not land on its Show control?
2. Is "Batch saved." enough without the date, now that the focused head beside it reads "churned 20 Oct 2026"? (Mark chose it over "Batch recorded 25 Oct 2026." on `decide-notice-copy`; said here only because the card is the one confirmation of an unrepeatable act.)
3. Does the pen want one caption line box (12 everywhere, no 15.3 / 16 / 17), or is the 20 px head line with its slack the rhythm Mark approved and wants kept?
4. Do the chips join the choice controls at 14, at the cost of two chips per line?
