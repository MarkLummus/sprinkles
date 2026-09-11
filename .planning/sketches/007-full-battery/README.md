---
sketch: 007
name: full-battery
question: "With the expanded criteria (goldilocks axes plus churn-phase and tasting-phase additions from the 2026-09-10 research pass), where does the defects checklist live, and how long does the full, uncollapsed record actually run?"
winner: null
tags: [batches, tastings, pen, recording, dimensions]
---

# Sketch 007: The full battery

## Design Question
Shaped 2026-09-10/11 with Mark, after deciding against extra tasting records (superseding sketches 004 and 006) and auditing the research pass's proposed fields against the existing dimension set. Settled going in: sweetness and all axes move to a 5-point goldilocks scale (too little / — / just right / — / too much); density/body is a genuine new core axis; churn duration, exit consistency, tempering time, and melt style are new fields; overrun becomes a 3-way category (low/medium/high) replacing the typed percentage; the defects checklist (coarse & icy, sandy & gritty, gummy & elastic, greasy film) is adopted as a real reversal of the earlier "no defect taxonomy" decision — but where it lives wasn't decided, hence this sketch.

This sketch shows the whole record uncollapsed, split into the same two sections as today (churned / tasting), specifically so its real length is visible rather than hidden behind disclosure.

## How to View
open .planning/sketches/007-full-battery/index.html

## External critique, 2026-09-11 — what was fixed vs. flagged

A critique of variant C at 2 columns caught a real correctness bug and several worthwhile craft fixes. Fixed directly, no product-decision conflict:

- **No more default selections.** Every stop and every segmented option (exit consistency, airiness, melt style) previously loaded with something pre-picked (blue), which could be mistaken for a real default — breaking the rule that blank must stay visibly blank. Nothing is selected on load now; clicking a selected stop or option again clears it.
- **Readable intermediate positions.** The two unlabeled stops between the labeled ends had no way to know what they meant once picked. Each axis now shows a small readout line: "not yet marked," or the picked word, or "leaning {word}" for the in-between stops.
- **Enlarged targets, still fits 3 columns.** Stops grew from 32×20 to 34×24 (the full track from 172px to 186px) — as large as they can get while still fitting a 192px-wide 3-column slot without overflow.
- **An explicit "Not tasted yet" state.** This sketch had dropped the optional-tasting affordance (from sketch 005) to test field-count/length in isolation. Restored it: the Tasting section opens collapsed to "Not tasted yet" + "Add a tasting," so a churn-only save reads as complete, not as an abandoned form. Toggle it in the toolbar.
- **Label clarifications:** "Time to temp." → "Time to draw temp."; "Air" → "Airiness (estimated)"; tasting "Temperature" → "Tasting temperature"; melt test's unit → "g lost at 20 min" (was ambiguous about lost/collected/remaining). Marked melt style and melt test both optional in their labels.
- **Fixed a real double-separator bug**, not just a stylistic complaint: `.next-time-shared`'s own textarea carries its own bottom-rule underline, and the section-break rule directly above it (`border-top`) sat close enough to read as two redundant lines. Removed the section-break rule for that one shared field, kept only its own underline.

## Bridge restructured, one question not two (2026-09-11, revised same day)
First pass: Mark's read on variant C was that "Anything stand out?" followed immediately by "How did it turn out?" landed as two separate questions. Fixed by merging under one eyebrow, with a segmented `Add a note` / `As expected` switch choosing between an open textarea and a static line.

**Superseded same day by the external critique's point 3**, which is a better answer to the same problem: "as expected" and "a note" aren't mutually exclusive states — you can have both an expected result *and* something worth writing down (the critique's own example: "there's a metallic aftertaste"). Framing them as a toggle you must choose between was wrong, not just under-designed. Current structure: **How did it turn out?** as the one eyebrow, the note field directly under it (open and typable immediately, no mode to pick), an "as expected, nothing to note" shortcut button beside it (fills the field, doesn't gate it), then "Any problems? Select all that apply" with the defect chips below as optional, clearly-secondary shortcuts. This drops the segmented toggle entirely — a direct reversal of the request that produced it, made because the critique's reasoning held up. Variants A and B were never part of this — they keep the same plain field-plus-shortcut-button pattern this now matches.

## Bitterness reclassified (2026-09-11)
Mark's call: bitterness isn't a goldilocks dimension — "too little bitterness" carries no real information the way "too little sweetness" does. It's a presence/severity flaw, not a two-directional scale. Moved out of the axes grid into its own toggle, "Declared for this recipe," kept separate from the universal defects checklist (coarse/icy, sandy/gritty, etc.) since it's specific to this recipe's declared concerns, not a general texture flaw. Oil character stays a goldilocks axis — the question there ("can I taste enough oil, or too much") genuinely has two directions.

## Caption-to-content spacing unified at 6px (2026-09-12)

Mark caught inconsistent eyebrow spacing across the page in two passes. First pass fixed the segmented-control pattern (Exit consistency, Airiness, Melt style) by targeting `label:has(+ .seg)`, raising it from the generic 12px field-separator margin to `--gap-xs` (6px), and made the axis head's hardcoded 4px into the same real token. That left every "caption and its content share one label" pattern (Churn date, Tasted, Melt test, Next time, etc.) still on its original 2px rule — untouched, so Mark's follow-up ("didn't change") was correct.

Confirmed the actual bug by rendering the sketch in a browser and measuring `getBoundingClientRect()` gaps directly rather than reasoning from the CSS alone: Melt test's box sat exactly 4px higher than Melt style's toggle row despite their eyebrows lining up, because one path used the 2px rule and the other the new 6px one. Fixed by raising the universal `label > span.lbl` margin-bottom to `var(--gap-xs)` — the one rule underlying every caption-with-inline-content instance on the page. Re-measured after the fix: every caption-to-content gap (inputs, textareas, segmented controls, axis rows) now reads exactly 6px, and Melt test's box and Melt style's toggles land on the same pixel row.

## Flow reordered, variant B dropped, shortcut removed (2026-09-11/12)

Mark's read on the concept sketch's tasting flow — Tasted on → How did it turn out? → Texture & flavor → Any problems? → Next time → Save — prompted three changes:

- **Variant B (distributed defects, one per axis) is gone.** Mark doesn't want defects scattered across axis boxes. `Any problems?` is now a single standalone section, always in the same place (after the axes grid), for both remaining variants.
- **The "as expected, nothing to note" shortcut is removed**, even though it exists to serve a real, previously-decided requirement — the churn-log audit's distinction between "never tasted" and "tasted, nothing to add." Mark's call: now that axis marks and the defects checklist both carry real signal on their own, a blank note reads clearly enough without the shortcut. Flagging that this removes a purpose-built disambiguator, not just a convenience button, in case it's worth revisiting once the record is actually used.
- **A and C are repurposed** from "where do defects live" to "where does the note sit" — the only remaining open question once B and the shortcut were gone. Both variants now share identical content (field-row, note, texture-block with axes + Any problems, melt-block); only the note's position moves, via CSS `order` on a flex column rather than duplicated markup:
  - **A:** note before Texture & flavor (the concept sketch's own order).
  - **C:** note after Texture & flavor / Any problems (closer to this sketch's original order).
- **Melt test and melt style moved to the bottom, together.** Mark's observation: both are optional and describe the same behavior (how it melts), so they belong as one block, not split across the top field-row and a mid-page segmented control. Now a `melt-block` at the end of the tasting body, matching the concept sketch's own placement (its "Optional melt test" disclosure sat just above "Next time").

## Pulled from a competing concept (2026-09-11)
Mark shared an alternate mockup of the same screen from another tool. Visually it's a different world — rounded corners, a checkmark icon, a filled primary button, one sans typeface throughout — none of which belongs in the Formulation Cookbook (square corners, no icons, hairline-border buttons, the serif/grotesk split), so none of that was adopted. Three structural ideas were genuinely better than what this sketch had, and are now built in:

- **Numbers on the stops themselves.** Each of the 5 stops now shows its digit (1–5) instead of being a blank square. This replaces the separate "readout" line from the last round — the value is legible the instant it's picked, with no extra text needed. Removed `readoutWords`/the `.readout` element entirely.
- **Inline state next to the axis name**, matching the concept's "Hardness (3)" / "Density / body (Not recorded)" pattern: `(N)` in pen blue once marked, `(Not recorded)` in muted italic text-face when not. A "Clear" text-control appears next to a marked axis to reset it explicitly, in addition to the existing click-the-same-stop-again shortcut.
- **Decoupled saving.** The concept's real insight on point 2 (batch-without-tasting) wasn't a collapse/expand toggle (what this sketch had) — it's two independent, always-visible save paths. The churn section now ends with its own "Save batch" and "You can add a tasting later," and the Tasting section (labeled "Tasting · optional") carries "Remove tasting" to clear whatever's been entered there. The page-level Save at the foot is relabeled "Save batch & tasting" for the combined case. This reads as complete either way without ever hiding the tasting fields, which the toggle did.

## Flagged, not changed: the critique's point 1 (2026-09-11)
The critique's central argument — that mixing intensity with preference on a scale is confusing, and that Hardness/Smoothness/Scoopability/Oil character should use purely descriptive anchors ("spoon sinks → spoon won't enter") with no labeled "right" middle, leaving the free-text note to say whether that suited the recipe — is well-reasoned, and it's exactly the No-Verdict Rule's own logic (a scale shouldn't itself declare a value good or bad). But it directly reverses a decision Mark made explicitly earlier this session: goldilocks/directional framing was chosen *because* the directionality is meant to drive future improvement suggestions (D07-adjacent), not as an oversight. Not reverting this without Mark weighing it against the critique directly — his call, not mine to make by inference.

One piece of point 1 *is* a plain bug, independent of that debate: Scoopability's anchors (crumbly ↔ gummy) aren't obviously opposite ends of one continuum the way soft↔hard or thin↔heavy read. They're two different failure modes (too little structure vs. too much stabilizer) that happen to bookend a good middle — real in ice cream science, but the wording doesn't make that continuum legible on first read. Left as-is pending the point-1 decision, since fixing the wording without knowing whether the axis stays goldilocks at all would be premature.

## Shorter anchor words (2026-09-11)
Mark's direction: the anchor labels under each stop should read cleanly at 3-column width. Sentence-length anchors ("can't find it", "rolls clean") were rewritten as single short words: soft/right/hard, crumbly/right/gummy, grainy/right/smooth, less/right/more, thin/right/heavy, faint/right/strong. "Just right" also shortened to "right" throughout, relying on the row's own axis name above to carry the rest of the meaning.

First pass forced each label into a fixed 32px box (matching one stop's width), which broke words mid-letter ("gummy" → "gum"/"my") once even a short word didn't fit. Fixed that by letting the three labels (low/mid/high — only three are ever shown) size to their own content and space themselves out with `justify-content: space-between`, with `white-space: nowrap` keeping every word on one line.

Second bug: `.stops5` and `.anchors5` are separate block containers, and neither had an explicit width — so each stretched to fill its column (300–600px depending on the axis grid setting), while the five 32px stop buttons only ever occupied 172px of that, left-aligned. The labels then spaced themselves across the *full* column width, not the 172px the stops actually occupy — only the left label happened to land correctly. Fixed by giving both `.stops5` and `.anchors5` an explicit `width: 172px` (5 × 32px stops + 4 × 3px gaps), so the labels now space themselves across exactly the track the stops occupy, at every column count.

## Common and declared flaws on one row (2026-09-11)
Mark's direction: don't give the recipe-declared flaw ("Bitter") its own separate block — combine it onto the same row as the universal defects, with a small extra gap marking it as a different kind of thing, trailing at the right end. Applied to variants A and C, where a single consolidated defects row exists. Variant B has no such row (defects live under their own axis), so "Bitter" stays on its own short line there — nothing to combine it into.

## Axis layout (added 2026-09-11)
Mark's note: the 5-point control is settled, but a single stacked column of six axes is wasteful — each axis box is far narrower than the page. "Axes: 1/2/3 columns" in the toolbar re-flows `#axes` as a grid, letting several dimensions share a row instead of running the full page width for a ~170px-wide control. Defaults to 2 columns.

## Variants
- **A: Standalone "Texture & defects" section** — one dedicated block of four toggle chips, sitting after the axes grid and the recipe's declared-flaw toggle, before melt style.
- **B: Distributed under each axis** — defects attach directly beneath the axis they diagnose (coarse/icy and sandy/gritty under Smoothness; gummy/elastic and greasy film under Density/body), no separate section at all.
- **C: Bridge into "How did it turn out?"** — the same four chips sit immediately above the free-text words field, framed as "Anything stand out?", positioning them as a quick prompt leading into the open field rather than a standalone diagnostic block.

## What to Look For
- Use "Toggle 100px ruler" — how much taller is this than sketch 005's already-long single-tasting pen? Seven axis rows plus the new draw-phase and tasting-phase fields is a real jump.
- In B, does tying defects to specific axes make the checklist feel earned (you're diagnosing what you just marked), or does it fragment the list so a defect is easy to miss because it's not where you'd look for it?
- In A, does a standalone section read as its own clinical inventory, at odds with the rest of the page's plain-language, non-diagnostic voice?
- In C, does bridging defects into the words field help (structured tags feeding a free-text account) or does it just visually crowd the one place on the page that's supposed to be the maker's own unstructured account?
- Try 1, 2, and 3 columns — at what point do the anchor words start feeling cramped against the 5 stops? Does 3 columns save real height, or does it stop being scannable?
- Given how long this reads even before any disclosure, is "fold everything into one pen" (sketch 005's premise) still viable at this field count, or does the churn/tasting split need to become two separate steps again — not two pens, but two moments within one flow?
