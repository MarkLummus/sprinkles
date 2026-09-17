---
target: app/src/ui/BatchRow.jsx
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 4
target_identity: "file:/Users/mark/Documents/projects/sprinkles/app/src/ui/BatchRow.jsx"
target_fingerprint: "sha256:9328af12c8a7d790f79e68c99d3b7249ad9eb0bef13fcf8d2c4a8c1f57d54bff"
target_path: /Users/mark/Documents/projects/sprinkles/app/src/ui/BatchRow.jsx
timestamp: 2026-09-16T18-58-36Z
slug: app-src-ui-batchrow-jsx
---
Method: dual-agent (A: design review, live-exercised · B: detector + measured DOM), run blind to the 2026-09-15 snapshot.

Scope: the record pen for recording a batch and an optional tasting, exercised live at /recipe/olive-oil-ice-cream-v1 at 1280/1440, and at 759/760/600 via a same-origin iframe probe (the harness would not relayout the top-level window).

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 1 | After save: zero [role=status] on the page, focus on <body>, scrolled to top, URL silently becomes /batch/<uuid>. The brief's "recorded ... against 50 g oil · 800 g" sentence never renders. |
| 2 | Match System / Real World | 4 | The paper sheet's own words throughout. "date unknown", "not measured", "This batch has not been tasted yet" are exactly right. |
| 3 | User Control and Freedom | 3 | Remove/Restore tasting is exemplary. Picking is one-way, against the brief's click-again-clears. |
| 4 | Consistency and Standards | 2 | Two error idioms of opposite quality; two identically-labelled Save ceremonies; "Links return after you save or cancel." rendered twice; four identical group cues. |
| 5 | Error Prevention | 2 | Churn date is the one required field and nothing says so until the save is refused — no required, no aria-required, no words. |
| 6 | Recognition Rather Than Recall | 3 | "Clear Exit consistency" sits ~296px right of the options it clears. |
| 7 | Flexibility and Efficiency | 3 | Native radios give arrow keys free; Home/End added. Ceremony B is 2,973px below ceremony A at 1280, 4,651px at 600. |
| 8 | Aesthetic and Minimalist Design | 3 | Restrained and handsome; docked for a measured 46px void under every group cue and the duplicated hint. |
| 9 | Error Recovery | 1 | Blank-date save scrolled 3,470->0, focused the date, rendered its sentence at y=1306 and y=4279 — neither inside the 873px viewport. |
| 10 | Help and Documentation | 3 | Nothing names what is required. |
| **Total** | | **25/40** | **Acceptable — significant improvements needed** |

## Design Specificity Verdict

Authored for this product, decisively — everywhere except the act of committing. A picked stop fills pen blue edge-to-edge with no weight and no underline. An unrecorded value prints "not measured" in INK at the unit's size: absence is smaller than a record without being dimmer. The six-axis battery split by a hairline spanning the defect groups is a domain instrument existing in no other product. Then the maker presses Save and the authorship stops: focus to <body>, no live region, scroll to top, silent URL change. The pen is beautifully authored for writing and entirely unauthored for committing.

Deterministic scan: `impeccable detect` exit 0 / [] on BatchRow.jsx and app/src/ui. These are NULL RESULTS, not passes — the detector parses HTML/CSS and does not read JSX. The same command over app/src/styles is a real scan and genuinely clean.

In-page detector (injection succeeded, live-server port 8400, stopped): 13 findings page-wide, ZERO inside the record pen (verified via node.contains against .batch-margin--pen). All 13 are `cramped-padding` on .target-chip in the Method section, outside this target.

Measured colour audit of the pen subtree: 623 ink, 263 transparent, 24 pen blue, 2 bookcloth, plus 78 rgb(0,0,0) on 39 visually-suppressed radios that paint no glyph and compute outline-style:none. No black pixel is ever rendered — false positive as a colour defect, real as a token-rule gap.

Contrast: ZERO failures. bookcloth 8.22:1, ink 17.16:1, pen blue 9.75:1, focus ring 17.16:1.

## Overall Impression

The care in this component is inverted. Removing a tasting — recoverable — gets a toast, a persistent Restore, a focus landing and a spoken confirmation. Saving the record — which cannot be re-made, because the ice cream is eaten — gets nothing. The biggest opportunity is to transplant the removal's feedback pattern onto the save.

## What's Working

1. Remove/Restore tasting. Toast at y=454, focus lands on Restore at y=450, both in viewport with no scroll jump. Restoring returned the note text, the Hardness (2) mark and the pressed "Coarse, icy" chip, announcing "Tasting restored." It works because feedback was put where the action was.
2. The two-ink discipline holds under a full record — confirmed by measurement: four colours, nothing else rendered, zero contrast failures, across 46 controls.
3. The inline malformed-number path: `4o` -> focus on that field, error directly beneath it, aria-invalid + aria-describedby wired, no red, bad value kept.

## Priority Issues

1. [P1] Saving says nothing and drops focus. activeElement is <body>, [role=status] count 0, page scrolls to top, URL changes. The .form-status live region lives INSIDE the pen and is unmounted by the save that should fill it. Correct->Cancel and Correct->Save both return focus correctly; it is specifically the first save of a new record, where the route changes, that loses it. The one irreversible moment on the surface; for a screen-reader user it is completely silent. FIX: mount the confirmation outside the pen, on the batch row, as a role=status carrying the brief's own sentence; return focus to the opener on every exit path, persisting opener identity across the route change. Command: /impeccable harden

2. [P1] The blocked save's sentence is never in the viewport. Blank churn date from the foot: scrollY 3,470->0, focus on the date at y=342, "Enter the date you churned." at y=1306 AND y=4279 in an 873px viewport, neither visible. The date input has no aria-invalid, no aria-describedby, no required; the hint is a plain <p> with no role=status. Only 6 of 59 controls in the pen have any error wiring, all MeasuredField. FIX: render the date's error as a .field-error inside its own label exactly as MeasuredField does; name the required field before the refusal. Command: /impeccable harden

3. [P1] The Save ceremony sits above the last field of the record, and before it in the tab path. Both assessments measured independently: Cancel/Save at top=1297, Next time textarea at top=1365; tab order Cancel(27), Save batch(28), Next time(29). "Next time" is the product's core promise and sits below the button that ends the session. A maker who tabs through and hits Enter saves without it. FIX: move Next time above the ceremony. Command: /impeccable layout

4. [P1] The four prose fields are 19px tall on every coarse pointer. Assessment B caught what A missed. At 759 and 600, At the machine / Ingredient notes / How did it turn out? / Next time all measure 560 x 19. Cause: the touch-union block at app.css:2284 lists button, select, .ink-field, .segmented__option, .chip-toggle, .text-control for min-height: var(--touch-min) — .prose-field is ABSENT, and its base rule sets no min-height. That branch is (max-width: 759.98px), (pointer: coarse), so it applies to every coarse pointer at every width, including the 1366 iPad. PRODUCT.md makes the phone the transcription device. FIX: add .prose-field to the touch-union min-height list. Command: /impeccable adapt

5. [P2] The signature instrument is unlabelled for assistive tech. Each axis's stops are correctly role=group aria-labelledby (AxisMark.jsx:82-83), but the core/declared cue rows (BatchRow.jsx:162, 166, 181-182) are bare <p class="pen-caption axes-cue"> with no id and no role, and the hairline is aria-hidden. The DEFECT cues 340px below (BatchRow.jsx:658, 684) carry id="defects-core-cue"/"defects-declared-cue" and are properly referenced. A screen-reader user hears six axes and never learns Body and Oil are "this recipe only". FIX: give the axes cues ids and point each group's aria-labelledby at them. Command: /impeccable harden

## Contract conflicts — Mark's decision, not a builder's

- Two ceremonies, identical labels. Both mounts render "Cancel | Save batch" verbatim in every state and call the same handler. The brief requires state-based labels ("Save batch only" / "Save batch & tasting") and two distinct scopes. The foot copy sits 2,973px below ceremony A at 1280, 4,651px at 600.
- Click-again-clears is gone on stops and segments, against brief sections 3 and 4. The code documents a deliberate reversal citing sketch 007 line 362 and DESIGN.md records it as shipped; the brief is the stale document.
- Ceremony A renders unconditionally; the brief says only while a tasting section is open.
- "Reading order is the sheet's page order" (brief section 6) is superseded by the front-matter revision and the brief has not caught up.

## Persona Red Flags

Sam (accessibility-dependent) — worst served. Silent saves with focus on <body>. Blank-date refusal announced by nothing. Core/declared split invisible (issue 5). "How did it turn out?" is a <p> outside its <label>, so unlike every other caption it is not click-to-focus. NO <main> element and no role=main anywhere on the page. Credit: 59/59 controls have accessible names, every aria reference resolves, focus ring measures 2px solid ink at 17.16:1 under real keyboard Tab, heading outline clean with zero level skips.

Casey (distracted, on a phone) — structurally defeated. At 600px the pen body ends at y=2485 and the foot ceremony sits at y=7136 in a 7,273px document. Stacked tasting is ~900px of axes alone. Targets are right except the four prose fields at 19px. Length defeats Casey, not geometry.

Riley (stress tester) — found the seam. Axes arrangement decided by React (useBelow760 + matchMedia listener), track geometry decided by CSS: two authorities for one boundary. Forced out of sync: 187px axis columns holding a 216px track, 21px horizontal overflow. STATED HONESTLY: produced in an iframe where neither resize nor matchMedia change ever fired, so a genuine top-level resize was not proven to trigger it, and fresh loads at 760 and 600 are both correct. The architecture permits the state and DESIGN.md already warns about this geometry. Worth a real-device resize test. Separately: a .field-error grows its label cell and pushes neighbours ~118px sideways, in a system whose rule is "nothing moves".

The transcriber (derived from PRODUCT.md) — Mark at the counter three days after churning, sheet in one hand, phone in the other. The sheet's order is not the pen's order. He puts the sheet down to find the Save, and the two Saves look identical so he cannot tell whether he already pressed one. He writes "churn 2 min longer" last because it is the last line on his sheet — and that field is below the Save button. His most common case, an undated tasting, the pen handles correctly.

## Minor Observations

- The 46px void under every group cue (cue bottom 189.2 -> first axis top 235.2, same at 600).
- letter-spacing: 0.04em as a raw literal at 16 sites in app.css (283, 435, 466, 501, 628, 920, 945, 985, 1085, 1134, 1217, 1235, 1425, 1460, 1647, 1808). tokens.css has 120 properties and NO tracking token. Otherwise token discipline is perfect: zero colour literals anywhere, zero inline styles in all four components.
- "Links return after you save or cancel." renders twice (y=177 and y=259).
- Four group cues ~340px apart inside a grid whose hairline already spans both.
- The segmented Clear is stranded ~296px right of its options; the per-axis Clear is fine.
- Clear precedes its subject in the tab path.
- readMarkWord degenerates: a seeded batch prints "right (3)" five times consecutively.
- The churn section has no region name while TASTING wears a bookcloth head.
- RECORDED and CHANGED print in pen blue — system timestamps painted as the maker's hand.
- .prose-field renders at 15px, inheriting the batch margin's table size rather than DESIGN.md's prose-field -> body (1rem).

## Questions to Consider

1. What if the record ended where the maker stops writing, instead of where the page ends? Picking one ending probably makes issue 3 and the two-ceremony conflict disappear together.
2. If saving is the only thing the maker cannot undo, why is it the only thing with no feedback?
3. Is "Next time" a field of the record, or the reason the record exists?
4. Does the tasting need to arrive all at once?
5. Who owns the responsive boundary — React or CSS? Right now both do.
6. What is the pen's one heavy element? DESIGN.md promises one per view; the open pen is hairline top to bottom.

## Run notes

- Assessment A saved two throwaway batches into the dev IndexedDB (churned 2 Aug and 9 Aug 2026, one with a tasting); the version now reads "3 later batches". A store reset clears them.
- The working live-server stop form is `live-server stop`, not `--stop`.
