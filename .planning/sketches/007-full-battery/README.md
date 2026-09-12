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

## Hardening pass — 2026-09-12

Option A now opens with three axes columns at desktop width. The grid reflows as space narrows, rating buttons are 32px tall, and selected/unselected headings reserve the same height. Variant C also moves the actual note/texture DOM order so keyboard order follows the displayed order.

Ratings and categorical choices expose named radio groups, checked states and roving keyboard focus (arrows, Home and End); defects expose pressed state. Clicking a selected choice still clears it. Individual Clear returns focus to the scale. The always-visible tasting action is now Clear tasting, with an undo action; subsequent editing retires that undo so it cannot overwrite newer entries. Empty tastings change the footer to Save batch.

Long notes grow without clipping and accept multilingual/RTL text. Measurement previews accept blank values, signed temperatures and decimal point/comma input; malformed values remain in place with inline feedback and focus on the first error. Save/Cancel remain sketch-only and explicitly say that nothing was persisted.

Verified in browser: default 1280px three-column geometry and stable selected-state alignment; keyboard 3→4 with checked state; clear and undo restoring ratings/measurements; malformed number feedback and decimal comma acceptance; 390px reflow with no horizontal overflow; long accented, Japanese, Arabic and emoji notes without clipping. Detector flags remain for sketch chrome/ruler, short uppercase labels and repeated compact control spacing; these were reviewed rather than used to change the established style. No backend or real persistence was added.

## Typography pass — 2026-09-12

Preserved the notebook's system-sans/Georgia families, Option A and three-column desktop default. Added local type roles: section headings 14px/600; compact field labels 12px/500 and axis names 12px/600; actionable choices and helper text 13px; written notes 16px with 24px leading and a 70ch maximum. Status text now uses consistent regular sans instead of changing from italic serif to sans when selected. Placeholder prose is italic; entered prose stays roman blue. Adjusted categorical-choice horizontal padding to retain the side-by-side desktop groups with larger text.

Live verification: all six 192px axis headers stay 24px tall in both selected and unselected states; three-column axes height is approximately 202px (previously 203px). At 390px the page has no horizontal overflow, axes become one column, and long accented/Japanese/emoji notes grow without clipping. Existing local font stacks require no new downloads. Type detector retains one explained uppercase-label warning, with no other type findings. This pass changes typography only, not field meanings or save behavior.

## Three decisions settled (2026-09-12)

Mark's calls on the three open design questions, after the 25/36 critique:

- **Core vs. declared axes: the groups split side by side.** The four fixed core axes sit left; the recipe-declared pair (Body, Oil) sits right of a vertical hairline (graduation weight, the declared group's left border) — naming the distinction PRODUCT.md already makes, without spending region-name color or adding words. Revised same day on Mark's call: a first pass used a full-width horizontal rule under a ragged 3+1 core row; he preferred the groups side by side, which also removes the ragged cell. In 3-column mode (the default) the core group runs 2×2 and the declared group stacks one column; in 1/2-column modes and below a 720px viewport the groups stack and the split reverts to a horizontal rule.
- **Pre-filled demo values are gone.** The six example measurements (Time to draw temp. 20, Out of machine −6, Churn duration 30, Tempering 8, Tasting temperature −12, Melt test 3) and the "Soft, not greasy." note prose were examples rendered in pen-blue — indistinguishable from authored data, contradicting the sketch's own blank-stays-blank rule. All blanked; the record now opens the way a fresh one would. Churn date keeps 2026-08-02 — the working case's real date, not an example. Side effect: on load the footer save reads "Save batch" (empty tastings change it), which the hardening pass already specified.
- **Hidden-until-added becomes the primary tasting mode.** The default flips: the record opens with the tasting section collapsed to "Not added yet." + "Add tasting", the shorter first impression for churn-only recording. Always-visible stays in the toolbar as the comparison mode. The critique's praise for decoupled saving is unaffected — both modes keep the separate Save batch path and the Clear/Add/Remove controls. (Refined same day — see Second-round refinements.)

## Second-round refinements (2026-09-12)

- **"select all that apply" sits beside "Any problems?" again.** Mark wanted the hint inline like the Tasting headline hints, not stacked. The two now share one baseline row (a `.head` flex wrapper) as sibling elements — the hint reads lowercase "select all that apply" like "· optional", and `.lbl`'s uppercase still only wraps its short caption, so the all-caps source fix survives.
- **A responsive ladder for the axis split.** The side-by-side split needs the pen's full 640px width; at ~736px the vertical rule was touching the middle column's #5 stop. Below 760px viewport the 3-column mode now steps down to the 2-column arrangement (core 2×2 and Body/Oil side by side, groups stacked on the horizontal rule) instead of collapsing straight to one column; auto-fit collapses each group further once two 280px columns no longer fit. The explicit 1/2-column toolbar modes are untouched — only the default 3-column mode steps down.
- **The hidden tasting mode hides the whole section.** When "hidden until added" is active and nothing is recorded, the entire Tasting section is gone — no headline, no "Not added yet." line, no section rule. Remove tasting puts focus on the Add tasting control after collapsing; undo still restores and reopens. (The Add tasting control's placement was refined same day — see Third round.)

## Third round (2026-09-12)

- **One save ceremony when there is no tasting.** With the Tasting section absent, the churn row's own Save batch went too — it duplicated the footer's Save batch. The no-tasting flow now reads Ingredient notes → Next time → the footer: Cancel | Save batch | Add tasting. When the Tasting section is visible, the current order is kept: the churn section ends with its own Save batch and the footer reads Cancel | Save batch & tasting. The "You can add a tasting later." helper is gone entirely — the Add tasting link says it.

## Fourth round (2026-09-12)

- **The churn ceremony gains its Cancel.** The churn row now reads Cancel | Save batch — both pens' ceremonies carry the pair (Cancel first, per the page's own rule).
- **The footer label is state-based, not content-based.** updateSaveLabel no longer sniffs whether tasting fields hold values: with the Tasting section on the page the footer reads a fixed "Save batch & tasting"; with the section absent it reads "Save batch" (the batch-only save, Add tasting beside it). This retires the hardening pass's "empty tastings change the footer to Save batch" flip — an empty-but-visible tasting no longer relabels the button.
- **No "Tasting added." message.** Adding a tasting is its own evidence — the section opens and focus lands on the Tasted date — so the announcement is gone; the status line is cleared instead, so a stale "Tasting removed." cannot linger beside a visible section.
- **"Tasting removed." is a toast, not a line on the page.** Remove/clear feedback now self-clears after five seconds (guarded so it never wipes a newer message written in the meantime); the Undo control is the lasting affordance, retiring on the next edit as before. Fixes the lingering message between Next time and Cancel while the Tasting section was hidden.

## Browser verification (2026-09-12, gsd-browser)

All of today's rounds measured in a live browser against the real DOM:

- **Closed default:** Tasting section fully absent; all churn fields blank (churn date 2026-08-02 kept); footer reads Cancel | Save batch | Add tasting; empty status line; Undo hidden.
- **Open:** churn row Cancel | Save batch; footer Save batch & tasting; the split renders core 2×2 (two 197px columns) left of Body/Oil stacked (200px column) with the vertical hairline, minimum clearance from any stop to the rule 12px — the collision at ~736px is gone.
- **Removal:** empty tasting → "Tasting removed." toast, no Undo, focus on Add tasting. Tasting with data → "Tasting removed. You can undo this." + Undo; after five seconds the toast clears while Undo persists; Undo restores the section with its values (tasted date, tempering) and re-hides itself.
- **Widths:** iPad Mini 768 keeps the side-by-side split (12px clearance, no overflow) — the ≤760px threshold holds; iPhone 15 393 shows the stepped-down arrangement (groups stacked on the horizontal rule, single 329px columns), zero horizontal overflow, every control inside the viewport. The critique's responsive P2 (clipping below 760px) is resolved and verified.
- The "Any problems?" hint sits on the caption's line, after it, in lowercase — measured same-top, right-of-caption.

## Fifth round (2026-09-12)

Mark couldn't find the Undo after removing a tasting. Live reproduction with real input events found the undo does appear with data, but two things buried it:

- **Undo moves into the footer action row.** It was a lone text link floating between Next time and the footer — now it trails the footer row (Cancel | Save batch | Add tasting | Undo clear tasting), where the page's actions live.
- **Retirement is scoped to tasting edits.** The input listeners called forgetUndo on every field on the page — one keystroke in the churn section or Next time erased the undo. Now only edits inside the tasting retire it; the restore touches nothing else, so churn edits can't conflict with it. Verified live: churn edit after removal keeps the undo; a tasting edit after re-adding retires it; removing an empty tasting still shows no undo (nothing to restore).

## Sixth round (2026-09-12)

- **Tab order follows the eye in 3-column mode.** Mark's finding: in the side-by-side split, tab went block-order (all four core axes, then Body/Oil) — focus jumped *up* from Sweetness to Body. One DOM order can't serve both arrangements: row-major (Hardness, Scoopability, Body, Smoothness, Sweetness, Oil) is right when the groups sit side by side; core-then-declared is right when they stack. So the axes now re-render per arrangement: 3-column at desktop renders one flat row-major grid (a positioned hairline draws the core/declared boundary between columns 2 and 3), and the stacked arrangements (1/2-column toolbar modes, and 3-column below the 760px step-down via a matchMedia listener) render the grouped two-container DOM. In React this per-arrangement order is a trivial conditional render — the sketch records it as the intended structure.
- **Marks survive re-renders.** Column toggles and breakpoint crossings rebuild the stop buttons; marked stops are carried across by axis id and re-applied (verified: a Hardness mark survived 3-col → 2-col → 393px → 768px). A pending undo retires on re-render — its captured button references go stale.
- **"Tasting restored." is a toast too.** Undo's announcement now self-clears like the removal toast.

## Re-critique and undo completion (2026-09-12, evening)

Mark re-ran the critique on the settled sketch: **25/36 again, but zero P1s** — both earlier P1s confirmed resolved, and the previous P3's undo coverage acknowledged ("Remove tasting really collapses the section"). Remaining findings:

- **[P2] Churn segmented controls still retired the undo — fixed.** The fifth round scoped forgetUndo to tasting *fields*, but wireRadioGroup's click/keydown handlers still called it unconditionally, wired as they are for Exit consistency and Airiness in the churn section. The scoping now covers radios too (`inTasting`), verified live against the critique's exact reproduction: note → remove → Smooth ribbon → undo survives; Airiness too; undo restores; a tasting-side radio (melt style) still retires it.
- **[P2] The note placeholder biases toward defects** — "e.g. there's a metallic aftertaste" prompts a fault as the first response. Open: neutral prompt ("Flavor, texture, anything that stood out…") or blank — Mark's call.
- **[P3] The grouping signal is silent about its meaning** — the vertical rule and the Bitter gap mark a distinction without naming it. Open: compact group cue or an accessible description, keeping rule-only visually — Mark's call.
- Minor, for the phase plan: the two save scopes (churn-only vs combined) need an explicit persistence contract when this becomes functional; the churn date stays example content by design.

Both open findings settled with Mark the same evening and applied:

- **The note prompt is neutral** — placeholder now reads "e.g. flavor, texture, anything that stood out" instead of the metallic-aftertaste fault example.
- **The declared group is named** — a compact caption-face cue, "Declared for this recipe" (the vocabulary the Bitter toggle already uses), sits inside Body's box above its head: right of the vertical hairline in 3-column mode, under the horizontal rule when stacked. Rule-only visuals kept; no repeated headings per cell. Screen readers hear it as part of Body's box. Verified live in both arrangements; tab order unchanged.

## Seventh round — the 33/40 critique's top three (2026-09-12, night)

A full dual-agent critique of the settled sketch scored **33/40, zero P0/P1** (trend 22/36 → 25/36 → 25/36 → 33/40; the runs scored different heuristic sets, so read percentages: 61% → 69% → 69% → 83%). The detector's nine findings: eight false positives on the sketch chrome, one real — literal 4px micro-gaps (the stops' gap is the deliberate 186px track arithmetic; the field-unit and chips gaps have no such constraint). Mark chose the top-3 scope, feedback placement first. All three applied and verified live:

- **Feedback lives where the action is.** The tasting head now carries its own status line (`tasting-status`) and the Undo control: in always-visible mode, clearing shows "Tasting cleared. You can undo this." + Undo right beside Clear tasting — where the eye is — and focuses the Undo. An empty clear is no longer a silent no-op ("Nothing recorded to clear."). In hidden mode the Undo relocates to the footer row beside Add tasting (the section is gone, so that's where the eye is); that flow is unchanged from the fifth round. The relocation is a real DOM move (`placeUndo`); the page-foot status remains the save/AT channel. One regression found and fixed during verification: the Undo button initially existed only as a relocation target, so the whole init crashed (`forgetUndo` on null) — the button now lives statically in the head slot.
- **The Bitter chip is named** — visible "· declared" suffix in the chip and `aria-label="Declared for this recipe: Bitter"`, reusing the axes cue's vocabulary. The 26px gap now has a name.
- **Touch targets grow toward 44px below the step-down.** At ≤760px: stops 40×44 (track arithmetic scales to 5×40 + 4×4 = 216px, anchors re-aligned to match), chips and segmented options min-height 44, text controls min-height 44 (Add tasting included). Desktop is untouched: 34×32 stops on the 186px track, verified at 768px. Zero horizontal overflow at 393px, every control inside the viewport.

Recorded, not built (phase-plan carries): the two P3s (drop the underline on filled controls; name the two Cancels' scopes), the persistence contract for the two save scopes, the undo-retired-on-resize edge, and the critique's provocative question Mark asked to have explained — a **summary line on a saved record** ("Soft (2) · grainy · bitter" in the tasting head) belongs to the real app's batch *read* view, not this recording pen; the sketch has no saved/read state.

## Eighth round — re-critique and the two remaining P2s (2026-09-12, night)

The re-critique scored **33/40 again** (trend: 61% → 69% → 69% → 83% → 83%) and measured the seventh round's feedback co-location as **solved at both 1080px and 800px** — "the destructive moments are now the best-designed part of the page." The detector repeated its pattern: all seven color findings chrome-only, monotonous-spacing the lone product finding. Mark chose the two-P2 scope, targets first. Applied and verified live:

- **Touch targets finished.** The ≤760px block now also covers `.btn` (was 34px) and `.ink-field` inputs (was 28–30px) at min-height 44 — at 393px every button (Cancel, Save batch only, Save batch & tasting, Add tasting) and every date/number field measures 44 tall. Desktop untouched (34px buttons at 768, verified).
- **The ceremony's save scopes are named.** The churn-row save — which only ever renders while the Tasting section is open — is now "Save batch only", parallel to the footer's "Save batch & tasting"; the no-tasting state keeps the single unambiguous "Save batch". The two-Cancels half of the finding stays a phase-plan item: in the real product Cancel discards the whole pen draft (D-24), so its scope naming is a persistence-contract decision, not a sketch label.
- **Regression caught by re-verification and fixed:** the seventh round's empty-clear early return had also swallowed the hidden-mode path — "Remove tasting" on an empty tasting no-op'd instead of collapsing the section. Now: empty + visible mode → "Nothing recorded to clear." (section stays); empty + hidden mode → collapses, focus to Add tasting, "Tasting removed." at the foot, no undo (nothing to restore). All three paths re-verified live.

Carried for the phase plan, updated: the three P3s (undo adjacency in the wrapped head, visible words for intermediate stops, data-based undo that survives resize), the Cancel-scope question, the persistence contract, the matchMedia-under-emulation caveat, and the read-view summary line.

Also fixed same day, per Mark's go-ahead: the "Any problems?" all-caps finding at the source — "Select all that apply." is now a sibling helper paragraph, so `.lbl`'s uppercase rule only ever wraps its short caption (critique P2, first of the two).

Still open from the critique: the responsive clipping re-check (P2) — partially addressed by a new ≤720px rule that stacks the axis groups, but the rest of the page still needs the resize check; "Remove tasting" in always-visible mode lacking visible consequence (P3). The re-run of the critique is on hold per Mark.
