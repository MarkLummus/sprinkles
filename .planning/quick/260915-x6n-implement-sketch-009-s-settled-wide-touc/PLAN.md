---
quick_id: 260915-x6n
slug: implement-sketch-009-s-settled-wide-touc
date: 2026-09-15
mode: quick
authority:
  - .planning/sketches/009-wide-touch/index.html (options C and M4)
  - .planning/sketches/009-wide-touch/README.md
  - .planning/sketches/008-control-sheet/index.html line 166
---

# Sketch 009's settled wide-touch decisions, in the app

Three decisions Mark settled on 2026-09-15. All three are touch-mode rules, so
they land together and get one device test rather than three.

## Objective

Make the app conform to sketch 009 at a wide touch viewport, and take sketch
008's approved font bump at the same time.

## Tasks

### Task 1 — Decision C: the stop grows in height only at touch

`app/src/styles/app.css`, the touch-mode block (`@media (max-width: 759.98px),
(pointer: coarse)`).

Today the stop's 44px sizing lives only in the **width-keyed** block, so at a
wide touch viewport the stop stays 38 × 32 — a 32px tap target. C grows the
height there and leaves the width alone:

```css
.axis-mark__stop { height: var(--touch-stop-height); }
```

`--stop-w` and `--track-stop` are untouched, so the 186px track still fits the
213.3px column. The width-keyed block keeps owning the 216px narrow track and
the 44px stop **width** — geometry stays width-keyed, exactly as the comment
above it requires.

Verify: at 1366/coarse the stop measures 38 × 44 and `.axis-mark__stops` stays
186px; at 1366/fine it stays 38 × 32; at 393 it stays 44 × 44 on a 216px track.

### Task 2 — Decision M4: the melt row's caption-to-control gap

Same block. Today:

```css
.axis-mark__head,
.segmented-field__head { min-height: var(--caption-line-h-touch); }   /* 44px */
```

That 44px reserve is what pushes Melt style's control 15.2px below Melt test's,
because Melt test's `.field-row__label` caption does not grow with it.

**The conflict this resolves.** `.axis-mark__head` and `.segmented-field__head`
share one rule. The axes need Clear's height reserved so picking moves nothing
(03.3.1.1-03's settled behaviour); the melt row needs the line *not* to grow, so
its gap matches its neighbour. Those look opposed — but only while Clear's
height is what the line reserves. Once Clear stops growing the line box (below),
a constant reserve satisfies both: picking still moves nothing, *and* the melt
row stays level. So this stays **one shared rule, no named exception** — the
shared-token rule holds.

- Retire the `--caption-line-h-touch` reserve from the touch block.
- The heads reserve `--caption-two-lines`, bottom-aligned (`align-items:
  flex-end`), and must carry the caption's own `font-size` so the `em` resolves
  against 12px and not the body's 16px. **2.4em of 16px is 38.4px against the
  caption's 28.8px, and that 9.6px was the entire remaining misalignment in a
  first draft of M4.**
- Clear inside those heads keeps a 44px tap target through an overflowing
  `::after`, which does not grow the line box.

Verify at 1366/coarse: melt-test and melt-style caption-to-control gaps both
6px, caption bottoms level, control tops level. At 1366/fine the melt row
returns to the sketch's −4.8. Picking an axis moves nothing at either pointer.

### Task 3 — Sketch 008's touch font bump

```css
.touch .ink-field, .touch .prose-field { font-size: var(--type-note) }   /* 008 line 166 */
```

In app terms, inside the touch-mode block: `.ink-field` and the prose fields
take `--type-note` (16px), retiring the pre-declared 13px departure. Besides
matching the sketch this stops iOS Safari auto-zooming the page on field focus,
which it does below 16px.

Watch the 600px block, which sets `.ink-field { font-size: var(--type-control) }`
— confirm which wins at 393 and that the result is deliberate.

## Acceptance

- Measured at 1366/coarse, 1366/fine and 393 with `playwright-core`, in the real
  app, not a probe page.
- `npm --prefix app test` green; `npm --prefix app run build` clean.
- No literal visual value added — every value reads through a token.
- Geometry and layout rules stay width-keyed; only sizes ride the pointer.

## Not in scope

SR-6 (the churn-row date box on the device) is untouched — cause still unknown,
and it needs the iPad. The conformance re-measure is the follow-up phase's.
