# Sketch 009 — the battery on a wide touch screen

**Status:** open, awaiting Mark's pick
**Drawn:** 2026-09-15
**Question:** what should a rating stop be at a viewport that is wide *and*
touch at the same time?

## Why this sketch exists

Sketches 007 and 008 only ever draw touch at narrow widths, where the axes
stack and a 216px track has room. Mark's iPad Pro 12.9 is **1366 CSS px, DPR 2,
`pointer: coarse`** — wide and touch at once, which no sketch had drawn. The app
therefore had nowhere correct to land, and phase 03.3.1.1 paused on exactly this
(handoff item 2, recorded as blocking).

009 is deliberately a **new** sketch rather than a state added to 008: 007
(`109733d`) and 008 (`0fa1015`) are pinned references that
`03.3.1.1-CONFORMANCE.md` cites by hash, and extending 008 would stale that
citation. Mark chose this split on 2026-09-15.

## The measured frame

The battery does not get the page width — it sits in the batch row, inside the
page's own column. Measured in the **real app** at 1366/coarse
(`playwright-core`, cached Chromium, DPR 2, 2026-09-15):

| | measured |
|---|---|
| `.axes-grid` | 640px |
| `grid-template-columns` | `213.328px 213.328px 213.328px` |
| `.axis-mark` | 213.3px |
| `.axis-mark__stops` | 186px |
| `.axis-mark__stop` | 38 × 32 |
| arrangement | row-major: two core axes, then one declared; hairline between columns 2 and 3 |

An earlier draft of this sketch let the grid take the full sheet width. Each
axis got 428.7px, **every option "fit"**, and the sketch hid the very problem it
exists to answer. The grid is now pinned to the measured 640px, and the six axes
carry the app's real names and anchor words, read out of the live DOM.

**This is the frame trap 007 and 003 already have on record** — 003's frame is
pinned at 1440 and does not track the viewport, so its absolute widths are not
comparable at any width. Check the frame before trusting any comparison.

## The four options

Each is drawn against the 213.3px column with the column edge marked.

| | stop | track | at 213.3px | verdict |
|---|---|---|---|---|
| **A** today | 38 × 32 | 186 | fits, 27.3 spare | tap target only 32px tall |
| **B** narrow-touch track as-is | 44 × 44 | 216 | **overflows 2.7** | this is the collision Mark saw |
| **C** height only | 38 × 44 | 186 | fits, 27.3 spare | **proposed** |
| **D** two columns | 44 × 44 | 216 | fits, 104 spare | layout rides the pointer; battery grows taller |

### Why C is proposed

C grows the stop in **height only**. The width stays 38px, so the track stays
186px and **no geometry moves at all** — it is a pure size change. That is
exactly the rule this phase settled after the regression that caused the pause:

> SIZE rules may ride the pointer; GEOMETRY and LAYOUT rules may not.

B is what the app briefly did (`f975ec0`), and the 2.7px overflow is precisely
why it had to be reverted (`99d84c3`). D works, but it is a layout change riding
`(pointer: coarse)` — the same shape of change as the regression, and it makes
the battery meaningfully taller.

C gives a 38 × 44 target (1,672px²) against B and D's 44 × 44 (1,936px²). It
clears WCAG 2.5.5's 44px in the vertical axis, where a stop is hardest to hit,
and misses it by 6px horizontally. That trade is the open question for Mark.

## Open questions for Mark

1. **Is 38 × 44 an acceptable target**, or does the full 44 × 44 matter enough to
   pay D's layout change?
2. **Do the axes stay 2 × 2 + 1 at wide touch**, or reflow?
3. **The Melt row** — still to be drawn here. 03.3.1.1 measured it 15px out of
   alignment at 1366/coarse (Melt test cap 28.8 / gap 6 / control top 1389.4;
   Melt style cap 16.2 / gap 19.9 / control top 1404.6), and whether sketch 007
   has the same misalignment is **unestablished**. That answer decides app-fix
   versus sketch-round, so it is worth settling in the same session.

## Also decided, not drawn here

Sketch 008's touch font bump — `.touch .ink-field, .touch .prose-field
{ font-size: var(--type-note) }` (16px) — is **approved by Mark** (2026-09-15)
and not yet implemented; the app ships 13px as a pre-declared departure. Besides
matching the sketch it stops iOS Safari auto-zooming the page on field focus,
which it does below 16px. The follow-up phase owns it.

## How to view

```
python3 -m http.server 8077   # rooted at .planning/sketches/
```

then `http://<lan-ip>:8077/009-wide-touch/` on the iPad. The toolbar switches
options; "show all" stacks them; the readout bottom-right prints the live
viewport, pointer type and per-option measurements from the device itself.

Hard-reload on the iPad (there are no cache headers on 8077) before concluding a
change did not take.
