---
target: sketch007
total_score: 25
max_score: 36
na_heuristics: 10
p0_count: 0
p1_count: 2
target_identity: "file:/Users/mark/Documents/projects/sprinkles/.planning/sketches/007-full-battery/index.html"
target_fingerprint: "sha256:40a826aafae78defcf0476227a5c9f04e793978f4701db46167a626e19b6606c"
target_path: /Users/mark/Documents/projects/sprinkles/.planning/sketches/007-full-battery/index.html
timestamp: 2026-09-12T12-51-03Z
slug: planning-sketches-007-full-battery-index-html
---
Method: dual-agent (A: aef57b0937efdb76f · B: a7850cac32f45b885)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | `(N)`/`(Not recorded)` inline state is strong; the 900ms `flash()` save confirmation is easy to miss on a long scroll |
| 2 | Match System / Real World | 4 | Maker's own vocabulary throughout ("Time to draw temp.", "g lost at 20 min") |
| 3 | User Control and Freedom | 3 | Click-again-to-clear + explicit Clear link is solid; no undo on "Remove tasting" |
| 4 | Consistency and Standards | 3 | Two-Ink/No-Verdict rules held consistently, except the pre-filled numeric/text fields (see P1) |
| 5 | Error Prevention | 2 | No bounds/format checking on numeric fields; irreversible one-click "Remove tasting" |
| 6 | Recognition Rather Than Recall | 4 | Anchor words + inline state + adjacent units remove memory burden |
| 7 | Flexibility and Efficiency | 2 | Real repeated-use tool (29 churn logs), yet no shortcut to mark multiple axes faster; column toggle is designer-only chrome |
| 8 | Aesthetic and Minimalist Design | 3 | Consistent with the "full battery" density test; genuine crowding at narrow widths |
| 9 | Error Recovery | 1 | No error states designed; No-Verdict Rule raises a real open question here |
| 10 | Help and Documentation | n/a | Task-completion form for an expert-motivated user; not a documentation surface |
| **Total** | | **25/36** | **Acceptable, borderline Good (69%)** |

## Design Specificity Verdict

**LLM assessment**: Strongly on-system, not a reskin. The goldilocks 5-point stops, graduated anchor words, pen-blue-only-when-authored convention, and bookcloth region names are Formulation Cookbook vocabulary applied correctly and consistently — a generic form builder would not produce this. The plain labeled-number-input field-row is the one place that reads generic, but that's an honest gap (DESIGN.md itself says inputs aren't a built component yet), not a specificity failure.

**Deterministic scan**: `impeccable detect --json` returned 9 findings (exit code 2): 1 `all-caps-body` (warning), 7 `design-system-color` (advisory), 1 `repeating-stripes-gradient` (advisory). The live browser overlay independently confirmed only 2 of these 9 (`all-caps-body` + `repeating-stripes-gradient`) across both variants and all column states — the 7 `design-system-color` findings didn't reproduce in-DOM, a real CLI-vs-live discrepancy worth noting on its own.

Cross-checking against source: **8 of the 9 findings land entirely on the sketch's own toolbar/frame/ruler chrome** — the file's CSS explicitly comments this block "sketch chrome (not the design)" (`#variant-nav`, `.frame`, `.ruler` colors, and the ruler's repeating-gradient tick marks). These are false positives for evaluating the actual page design; they're debug tooling, not product surface.

The one exception is real: **`all-caps-body` on the "Any problems?" paragraph**. This is a genuine, partial regression from this session's own earlier fix — "Any problems?" was split into a short caption span plus a nested "Select all that apply." span with `text-transform: none` to stop a full sentence from being forced into caption styling. That fixed the *visual* result, but the parent `<p class="lbl">` still declares `text-transform: uppercase` over its whole (37-char) text content — the anti-pattern is patched at the child level, not removed at the source. The detector is correctly catching that the rule itself is still authored for short labels, not sentences.

## Overall Impression

This sketch is a disciplined, on-brand execution of a genuinely hard design problem (a maximally dense recording form), and this session's iteration history shows real rigor — measured spacing bugs, not eyeballed ones. The biggest opportunity isn't visual polish; it's that two real product questions are being answered implicitly through omission rather than decided explicitly: whether pre-filled demo values should exist at all (they currently contradict the sketch's own "blank must stay visibly blank" rule), and whether the six axes need internal hierarchy now that "four fixed core axes" vs. recipe-declared ones is a real product distinction (per PRODUCT.md) the layout doesn't yet express.

## What's Working

1. **The `(N)` / `(Not recorded)` inline state pattern** — collapses two previously separate affordances into one glance-readable spot, correctly adapted from a competing mockup while staying on-system (pen-blue text, no badge/icon).
2. **Decoupled saving** (Save batch / Remove tasting / Save batch & tasting) — solves batch-without-tasting without a hide/show toggle, keeping tasting fields visible and legible even unused, matching the product's batch/observation separation.
3. **Click-again-to-clear + explicit "Clear" link redundancy** on every axis — doesn't force memorizing one hidden interaction as the only undo path, without adding a fifth affordance.

## Priority Issues

**[P1] Pre-filled numeric/text fields are visually indistinguishable from real maker-entered data**
Why it matters: `Time to draw temp.` (20), `Out of machine` (−6°C), `Churn duration` (30), `Tempering` (8), `Tasting temperature` (−12°C), `Melt test` (3g), and "Soft, not greasy." all render in pen-blue on load — exactly the color reserved for authored values. This directly contradicts the "blank must stay visibly blank" rule this sketch's own README documents fixing for every stop and segmented control. A maker transcribing from a phone (PRODUCT.md's own scenario) could easily mistake this for their own prior entry.
Fix: clear these to empty/placeholder state by default, matching the treatment already applied to every toggle and stop.
Suggested command: `/impeccable harden`

**[P1] No sub-grouping or priority signal within the 6-axis grid**
Why it matters: Hardness, Scoopability, Smoothness, Sweetness, Body, and Oil render as six visually identical rows at every column count, with nothing distinguishing PRODUCT.md's "four fixed core axes" from the two recipe-declared ones. A maker scanning quickly has no cue for which axes are foundational.
Fix: a subgroup rule or bookcloth-weight running sub-head separating core from declared axes — without introducing a color-as-verdict layer.
Suggested command: `/impeccable layout`

**[P2] `all-caps-body` detector finding is a real, unresolved gap from this session's own earlier fix**
Why it matters: the "Any problems?" paragraph still declares `text-transform: uppercase` on its full cascaded text, even though a child override hides it visually for "Select all that apply." The rule is authored for short captions, not full sentences — patched symptom, not fixed cause.
Fix: move "Select all that apply." out of the `<p class="lbl">` entirely (a sibling element, not a nested span with an override), so the parent's uppercase rule only ever wraps the short caption it was designed for.
Suggested command: `/impeccable clarify`

**[P2] No responsive breakpoint; fixed 760px frame clips content with no visible affordance**
Why it matters: confirmed at a 500px viewport — `document.body.scrollWidth` (760) exceeds `window.innerWidth` (500), and at 2-column axis layout, whole axis labels and controls run off the right edge with nothing signaling more content exists off-screen. This is exactly PRODUCT.md's "Phone transcribes" scenario, on the single densest page in the app. DESIGN.md already anticipates this ("No breakpoint exists in code yet") — this sketch is a real forcing case for it.
Fix: default to 1-column axes below some width threshold as a first, minimal responsive rule.
Suggested command: `/impeccable adapt`

**[P3] "Remove tasting" has no confirmation and isn't visually distinguished from lower-stakes text controls**
Why it matters: one click wipes every tasting field, including manually entered axis marks, with no undo.
Fix: apply the same click-again idiom already used for clearing a single axis, or make it a two-step control.
Suggested command: `/impeccable harden`

## Persona Red Flags

**Casey (distracted, phone-based, PRODUCT.md's literal "Phone transcribes" scenario)**: Below 760px, the page requires horizontal scrolling with zero indication that Scoopability, Sweetness, Oil, the Bitter chip, or the melt-style control exist off-screen. The 1/2/3-column toggle that would help is sketch-chrome only — not present in the shipped product. Worse: the pre-filled "20", "−6", "Soft, not greasy." would read as *someone else's already-recorded data* to a maker mid-transcription, a real trust break at exactly the moment this page is meant to serve.

**Jordan (first-timer, unfamiliar with domain vocabulary)**: "Airiness (estimated)" and "g lost at 20 min" are precise but assume the reader already knows why airiness is estimated rather than measured, and what a melt test demonstrates. The recipe page's own graduated-rule pattern includes a "basis line" for exactly this kind of context; nothing analogous exists here.

## Minor Observations

- The `flash()` save confirmation is a 900ms text swap with no persistence — easy to miss if the click happens near the bottom of a long scroll.
- The live browser overlay and the CLI scanner disagree on the 7 `design-system-color` findings (CLI caught them, live overlay didn't reproduce any) — worth a tooling look independent of this critique, since it means the two detection paths aren't equivalent for this file.
- The `declared-flaw` "Bitter" chip's extra left margin to separate it from the universal defects reads correctly once verified un-clipped — a subtle, correct execution of an earlier README decision.

## Questions to Consider

1. If the numeric/text fields exist to demonstrate "what a filled record looks like," should a second, genuinely-blank version become the primary reference, given anyone skimming this file today would misjudge how much of the "blank stays blank" rule is actually applied?
2. Now that "four fixed core axes vs. recipe-declared" is a real product distinction, should that difference show up visually at all, or is treating all axes identically the intended simplicity?
