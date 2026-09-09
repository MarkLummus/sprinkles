---
target: whole recipe page, all states, after phase 03.1
total_score: 28
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 3
target_identity: "file:/Users/mark/Documents/projects/sprinkles/app/src/ui/RecipePage.jsx"
target_fingerprint: "sha256:52c418c7ac4e3623f0bb3f269b6aba876d37ba37ccb477b2051fd8c9f277a969"
target_path: /Users/mark/Documents/projects/sprinkles/app/src/ui/RecipePage.jsx
timestamp: 2026-09-09T11-54-37Z
slug: app-src-ui-recipepage-jsx
---
**Method: dual-agent (A: general-purpose design-review subagent · B: general-purpose detector/browser subagent)**

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | Rules strike and re-tick live; the blocked-save sentence sits beside both pairs. But Develop opens the page scrolled to step 8 with no cue why. |
| 2 | Match System / Real World | 4 | "was 40 g, now 48 g", "churned 2 Aug 2026", "inside 22–26", "trace", "unknown". The binder's own words throughout. |
| 3 | User Control and Freedom | 3 | Escape closes an untouched pen and returns focus to its opener; a touched pen needs Cancel. Cancel first, 12px gap. Remove has restore. |
| 4 | Consistency and Standards | 2 | The tasting date exists twice (ceremony and margin). Chip fields inherit 100% width. Step 10's body indents 11px past steps 1–9. Prose fields sometimes labelled, sometimes not. |
| 5 | Error Prevention | 3 | "4o", "-5" and blank all block the save with the row named, outlined and focused. But "-5" still flows into the live figures before Save. |
| 6 | Recognition Rather Than Recall | 2 | The batch margin's Draw notes, Ingredient notes and Next time are borderless, label-less prose fields: three invisible inputs and about 100px of blank paper. |
| 7 | Flexibility and Efficiency | 3 | Save is one Tab past the last authored note via the foot; uses checklist on demand; "As expected, nothing to note". The focus-on-open regression costs a scroll every time. |
| 8 | Aesthetic and Minimalist Design | 2 | Reading state is a 4. Pen states add 32 boxed buttons in the method, full-width chip fields, an 850px "done differently" band per step, and a 770px open-batch outline. |
| 9 | Error Recovery | 3 | Sentences name the row and say what to do ("needs an amount, or remove the row"). The version-line block masks grams blocks until it is filled, so errors surface one Save at a time. |
| 10 | Help and Documentation | 3 | Basis note, "basis:" on every advisory, anchors on every axis, placeholders as examples. Nothing explains "uses". |
| **Total** | | **28/40** | **Good** |

## Design Specificity Verdict

**LLM assessment.** The reading state is authored for this product and could not be mistaken for a recipe app or a calculator: the book spread, Georgia headnote and method against grotesk tabular figures, four colours and no fifth, the record in pen blue beside a black plan, six graduated rules that say their deviation in words. The developing state is now half the page it should be. The table and the formulation note are genuinely the printed page with a pen on it: struck 40 beside blue 48, struck 5.0% beside 5.9%, the total struck, the fat rule reading "was 18.0%, now 18.8%" with a hollow tick where the old figure stood. The method column, though, reads as a form again: 32 bordered buttons ("add purpose", "add aside", "change", "remove", one stack per step), target chips that have grown into 377px double-bordered field pairs, and five steps announcing "uses nothing yet". The recording state is the same split: the as-made column and Skipped are the page; the ten full-width centred "done differently" buttons and three invisible margin prose fields are not.

**Deterministic scan.** CLI detector over `app/src/ui` and `app/index.html`: exit 0, zero findings. Browser, four views: reading 15, batch reading 15, developing 2, recording 15. Discounting environment artifacts (`dark-glow` on the Chrome extension's own border element) and this world's conventions (`cramped-padding` on the 13 target chips and the current version-strip item, both pinned at zero vertical padding by design; `line-length` on the uses line, estimated from box width not text; `em-dash-overuse` counting authored recipe prose), one real family remains: `first-viewport-column-overflow` on the recipe article in reading, batch and recording states (column one 223–248% of the viewport tall while column two fits in 62–72%). That is the mechanical shadow of the column-two void under the table and the 2757px scroll the pen opens into. The detector did not catch the focus-on-open regression, the invisible prose fields, or the chip width; those are Assessment A's.

**Visual overlays.** Injection succeeded; the overlays are in the tab titled **[Human] Sprinkles critique** (reading view, 16 outlines). The Impeccable live server was stopped. Two measurements the detector could not take: at 1440 the spread is 875px + 437px with no horizontal overflow; emulated at 390 the table forces column one to 446px and the page overflows by about 293px in reading and 475px in developing. No breakpoint exists, which the brief documents as Phase 4 work. Every computed colour on a button, link, border, outline and field is a token; the one non-token paint is the date field's segment highlight, the named exception.

## Overall Impression

Phase 03.1 did what the last critique asked. The pen keeps the page where it matters most, at the table and the rules; the binder draws every control; Escape and focus return are the brief to the letter. The score moved from 25 to 28 and the reading state is still the product's promise made visible. What remains is a regression and a residue. The regression: pressing Develop scrolls the maker 2757px down to step 8's aside because every on-demand field that already has text focuses itself on mount. The residue: the method column in the pen still wears a stack of four bordered buttons per step, so the recipe stops reading as a recipe until you scroll past it. The single biggest opportunity is to finish the pen's method column the way the table was finished: text controls, not boxes, and nothing on a step until the maker asks for it.

## What's Working

- **The strike-and-beside grammar is real and live.** `GraduatedRule.jsx` lines 117–147 and `IngredientTable.jsx` lines 123–125 put the old value in ink before the field, the new in blue, and a hollow tick at the parent figure; the accessible name says "was 18.0%, now 18.8%". It works because it uses the page's own structure, so keyboard, screen reader and print read the same fact.
- **Every control is the binder's.** `app.css` lines 26–56 and 106–117: ink hairline, no fill, no radius, chevron drawn, spinners hidden, disabled as dashed stroke with a sentence, focus as a 1.5px ink outline heavier than the 1px state outline. Measured live: buttons transparent with a 1px ink border, checkboxes 13px ink squares, focus ring `1.5px rgb(20,20,20)`.
- **Escape and focus return.** Untouched plan, record and tasting pens close on Escape and land on Develop, Record another, and Add tasting respectively; a touched pen ignores Escape. Verified live for all three.

## Priority Issues

**[P0] Opening the pen focuses step 8's aside and scrolls the page to y=2757.** `Method.jsx` lines 55–57: `useOnDemandField` runs `fieldRef.current?.focus()` whenever `isOpen` is true, including on mount for every step whose purpose or aside already has text; the last one in DOM order wins over the version line's `autoFocus`. Every Develop press lands the maker at the bottom of the method with no cue why. Why it matters: the pen's first moment is the version line and the table, and the maker scrolls back to find them every time. Fix: focus only when the field was opened by the maker's own press (an `openedByUser` ref set in `openField`, checked in the effect). Verify: after Develop, `document.activeElement` is the version-line input and `scrollY` is 0. Command: /impeccable harden

**[P1] The method column in the pen is a form again.** 32 bordered buttons in the method region (`Method.jsx` lines 209–239, 252, 313), each on its own line; five steps read "uses nothing yet". The version brief calls these text controls, and the binder's Buttons treatment was written for the imprint's openers and saves. Fix: a text-control treatment for per-step and per-row controls (no border, hairline underline, small print); "add purpose · add aside" inline on one line; omit "uses nothing yet" until "change" is pressed. Command: /impeccable quieter

**[P1] Target chips swell to 377px field pairs; "done differently" is an 850px centred band.** `app.css` line 846 sets the chip fields to `width: auto`, but `.ink-field { width: 100% }` at line 1094 wins by source order, so each chip becomes two 181px fields inside a chip border. `.method-step__on-demand` is `display: block`, so the batch pen's per-step button stretches to the column with centred text. Fix: `.target-chip .ink-field { width: auto }` sized in `ch`; inline-block or the text-control treatment for on-demand controls. Command: /impeccable typeset

**[P1] The batch margin's prose fields are invisible.** `BatchMargin.jsx` lines 183–207: Draw notes, Ingredient notes and Next time are borderless `.prose-field`s with aria-labels only. Live: about 100px of blank paper under Overrun; the tasting's Words and Next time the same. The outline-only-on-focus rule was written for prose the maker is re-writing, not for a blank line the maker must find. A maker with "Soft, not greasy" on the sheet has nowhere obvious to put it. Fix: a small-print label word above each empty prose field, or a hairline baseline rule until it has text, the way the printed batch-log page rules its lines. Command: /impeccable clarify

**[P2] The Versions band's outlines collide and one spans the column.** The current version-strip item sits flush under the opener row, so its 2px-offset outline overlaps the button borders; the open batch entry is a block `li`, so its outline runs the full 770px, the heaviest element on the page in the reading state. "churned" sits 2px from the version label. Fix: `--gap-s` above the strip; `width: fit-content` on the open batch entry; `--gap-xs` before "churned". Command: /impeccable polish

**[P2] A negative grams value reaches the live figures.** `RecipePage.jsx` line 491 keeps any finite parsed number, so "-5" recomputes fat to "now 13.1%" before Save, while the blocked-save rule already rejects it. Fix: add `parsed >= 0` to the same guard. Command: /impeccable harden

## Persona Red Flags

**Alex (power user):** Develop, then scroll 2757px back up, every time. The version-line block masks every grams block until it is filled, so a run of errors surfaces one Save at a time. Tab path in the pen: about 150 stops, table at 7–42, method at 43–134, authored notes at 135–144, foot pair last, so Save is one Tab past the last note as promised. The current version's own strip entry is still a link to the page it is on, which the brief forbids.

**Sam (screen reader, keyboard):** Accessible names are good ("Graza Drizzle, was 40 g, now 48 g, was 5.0%, now 5.9%, as made 45 g"; "Step 3, instruction"). Headings are H1 then five H2s in page order. But the Batch legend is still a `p` (`BatchMargin.jsx` line 222) so the record is not in the outline; the tasting date is announced twice; the reason field has no name beyond its placeholder; the churn and tasting date inputs have an empty accessible name; a grams field holding "4o" reads "was 40 g, now …" for a value that is not a number.

**Riley (stress tester):** "-5" changes the figures live; "" and "4o" hold. Below about 1146px the name column collapses to zero under `table-layout: fixed` and ingredient names overprint the grams; no breakpoint exists (documented Phase 4). Ten "done differently" buttons at 850px each. Store counts unchanged after every pen was cancelled: 1 version, 1 batch.

**Mark at the kitchen table in the evening:** the reading state is the page he printed and the record is where his pen put it. Developing, he wants the number and the rule and gets them, then a method column he has to scroll past and a first landing at step 8 he did not ask for. Recording, he has the sheet in hand and "Soft, not greasy" to type, and the margin shows three numeric boxes then blank paper. The date field wants `mm/dd/yyyy` where the page prints "2 Aug 2026"; accepted as the named exception, still a mismatch met every batch.

## Minor Observations

- Column-two void: the balance note (678px) is taller than the table (436px), leaving about 225px of empty paper under the table before Method at 1440, mid-page rather than at the foot.
- Step 10's number column is 22px against 11px for steps 1–9, so its body indents 11px further; `min-width: 2ch` on the step number fixes it.
- The step select at 160px still clips "6. Allulose in, ther" and "8. Emulsify the oil," under the drawn chevron.
- "Links return after you save or cancel." repeats in every pen; it is the only sentence on the page addressed to a user of software.
- The churn date field is 770px and the tasting date 437px, against the brief's "sized to what it holds"; the measured-value fields are 437px for three digits and a sign.
- The reason field has a placeholder and no label, while the version line has a visible label.
- The data column's blank header in the pen leaves "estimated" floating in an unheaded column.
- `tokens.css` line 8 still says pen blue is "unused on screen this phase".
- Hover thickens a button's border to 1.5px without moving it: the one hover state the brief permits, done right.
- "recorded 4 Aug 2026 against 50 g oil · 800 g", "unknown" and "unmarked" render in pen blue; the Two-Ink "third voice" question stays open as documented.

## Status of the 2026-09-08 findings

| Finding | Status | Live evidence |
|---|---|---|
| P1 Developing pen is a form, not a page | Partial | About 150 focusables (was about 260); prose edits in place; uses on demand. Still 32 boxed buttons in the method, full-width chip fields, and the focus-on-open regression. |
| P1 Rules never strike the parent figure | Fixed | Fat head "was 18.0%, now 18.8%", hollow tick, while typing. |
| P1 Native control chrome breaks the four-colour system | Fixed, one named exception | Every control drawn in ink; only the date segment highlight is system blue. |
| P2 Escape did nothing | Fixed | Untouched pens close on Escape with focus returned. |
| P2 Save and Cancel abutting | Fixed | Cancel first, 12px gap, in ceremony and foot. |
| P2 Batch record a screen below the table | Fixed, moved | Ceremony in Versions; pair repeated in the foot band. |
| P2 Step select truncated | Partial | Widened to 160px; two options still clip. |
| P2 Blocked-save message far from the row | Fixed | Sentence beside both pairs; row outlined, bold, focused. |
| P2 Negative grams accepted | Partial | Save blocks; live figures recompute first. |
| P2 "4o" accepted silently | Fixed | Blocks with the row named; figures hold the last good value. |
| P2 Date placeholder vs printed date | Remains by decision | Native date input kept as the named exception. |
| P2 Heading levels inconsistent | Mostly fixed | H1 and five H2s; Batch and tasting legends remain `p`. |

## Questions to Consider

- If a prose field must be invisible until focused so the page keeps reading as a page, what is the page-native mark for a blank line the maker is expected to fill? The printed batch-log sheet answers with a ruled line; the screen answers with nothing.
- The method in the pen carries about 100 controls for a maker who, by the binder's evidence, changes one or two amounts and occasionally a chip. Should the method open read-only in the pen, with one "edit this step" text control per step?
- Versions holds "everything about the recipe that is not the recipe", yet also the largest outlined element on the page. Is "Versions" the region's name, or is it the imprint wearing a label the discussion settled too early?
