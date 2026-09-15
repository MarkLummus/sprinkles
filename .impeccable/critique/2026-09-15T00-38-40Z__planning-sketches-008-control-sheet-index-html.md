---
target: .planning/sketches/008-control-sheet/index.html
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 0
p2_count: 4
p3_count: 0
target_identity: "file:/Users/mark/Documents/projects/sprinkles/.planning/sketches/008-control-sheet/index.html"
target_fingerprint: "sha256:e3dbc086d3275cb1649d7cb1e4bd668ae30a1437f944a984811a2851705fbac2"
target_path: /Users/mark/Documents/projects/sprinkles/.planning/sketches/008-control-sheet/index.html
timestamp: 2026-09-15T00-38-40Z
slug: planning-sketches-008-control-sheet-index-html
---
Method: dual-agent (A: box_design · B: box_evidence), with parent live desktop and 393px-preset inspection. Agent browser access failed; independent source reviews completed.

The control language is now coherent. Joined single-choice groups, square-and-word independent choices, and standalone actions make a recognizable system. The next pass should make its states reliable and the sheet easier to read as a current reference.

Specificity: the paper/ink palette, compact measured fields, sans numerals and serif maker notes fit Sprinkles. This does not need a new visual identity. Real batch labels make the sheet useful; shared blue selection and whole-label focus should remain.

Priorities:

1. P2 — Make hover visibly work without movement (harden). Rest and hover Save batch both compute a 1px border in this browser. Hover compensation shrinks the sample from 101.58×34.25 to 100.58×33.25. Use a reliable whole-pixel weight, with dimensions held fixed; resolve shared seams for joined controls. The intended 1.5px focus ring also computes to 1px. This is observed rendering, not merely a preference for heavier lines.
2. P2 — Give focus, invalid and high-contrast selection distinct signals (harden). Numeric invalid and focus both render the same 1px ink outline, offset 2px. Reserve the outer ring for focus and let a persistent nearby error sentence identify invalid content; retain the value. Add invalid + focused and selected + focused + forced-colors specimens. Simulated high-contrast defects and Show changes outline the small square, while the real media rule outlines the whole selected control. Make the simulation and implementation agree. Actual forced-color mode was not runtime tested.
3. P2 — Separate the current system from its history (clarify/distill). The introduction still promises filled controls with paper-colored text, while independent choices now fill only their squares. The touch section has A-specific captions while B is active and claims the checkbox has no touch rule although this sheet gives it 44px. Keep approved examples first, unresolved decisions separately, and retired versions in optional history. This prevents someone implementing the system from copying a superseded rule.
4. P2 — Improve the sheet's hierarchy and comparison rhythm (layout/typeset). Current control sections have zero top margin: the next heading hugs the previous specimens. Long implementation paragraphs take more space than the examples. Give each family a clear gap, one short rule, and optional technical details. State captions are 11px and low contrast; they are essential evidence, so enlarge and darken them. On the 393 preset the comparison has 1003px of content within 353px: keep the contained scroll, add a visible cue, and preserve labels while panning. Short family jump links would reduce repeated scrolling.

Strengths to preserve: joined rating cells communicate the same one-of-set logic as categories; checkbox defects are clearly independent; whole-label focus identifies the target; blank ratings plus Clear avoid accidental midpoint defaults; numbers/units and maker prose have distinct type roles. Touch samples measured 44px high, and joined stops 44×44. No reason to reopen these decisions.

Cognitive load and personas: Mark can decode the historical context, but a future implementer has to reconstruct which rules are current. A keyboard user needs focused-invalid and high-contrast combinations to remain distinct. A phone reviewer loses context while panning the wide matrix. Five rating stops remain one structured decision, not an excessive list of unrelated options. The emotional friction is uncertainty about the reference, not the restrained visual identity.

| Nielsen heuristic | Score /4 | Reason |
|---|---|---|
| Status visibility | 3 | Selected, focused and blank examples are explicit. |
| Real-world match | 3 | Concrete recipe labels and familiar control families. |
| Control and freedom | 3 | Reversible specimen selections and axis Clear. |
| Consistency | 2 | Hover and state simulations diverge from their rules. |
| Error prevention | 2 | Missing combined error-state examples. |
| Recognition over recall | 2 | Current patterns mixed with history. |
| Efficiency | 3 | Width presets and simultaneous state comparison. |
| Minimalist design | 2 | Long prose and weak section separation. |
| Error recovery | 2 | Useful error sentence; error/focus collision. |
| Help and documentation | 3 | Detailed but partly stale explanations. |
| Total | 25/40 | Acceptable as a control reference; not a whole-app score. |

Counts: P0 0, P1 0, P2 4, P3 0. Detector returned 22 flags: 12 warnings (one low-contrast caption, nine duplicate tiny-text flags, annotation font, heading hierarchy), plus 10 palette advisories concerning sketch chrome (source lines10–26). Small faint state labels reinforce the hierarchy finding. Menlo and toolbar palette flags do not warrant changes to the app design.

Scope: critique only. Desktop and 393px frame preset reviewed live by parent; the latter is not an emulated phone viewport. Actual forced-color mode not tested. Missing radio arrow navigation and no-op action examples are documented specimen limits, not asserted production bugs. No UI source changes. No overlay injected because browser evaluation is read-only.
