---
quick_id: 260915-x6n
slug: implement-sketch-009-s-settled-wide-touc
status: complete
date: 2026-09-15
commits: [246f172]
files_modified:
  - app/src/styles/app.css
  - app/src/styles/cross-cutting.test.js
  - app/src/styles/binder.test.js
---

# Sketch 009's settled wide-touch decisions, in the app

Three decisions Mark settled 2026-09-15, landed together because all three are
touch-mode rules and they earn one device test rather than three.

## What changed

**Decision C — the stop grows in height only at touch.** The 44px stop *width*
makes a 216px track, and a wide touch viewport gives each axis 213.3px, so the
track overflowed into its neighbour. Growing only the height gives a 38 × 44
target on the unchanged 186px track. The width and the track stay in the
width-keyed block: size may ride the pointer, geometry may not.

**Decision M4 — the melt row's caption-to-control gap.** The touch block grew
both caption lines to `--caption-line-h-touch` (44px) to reserve Clear's height,
which pushed Melt style's control 15.2px below Melt test's, because Melt test's
own field-row caption does not grow with it. Clear now takes its 44px target as
an overflowing `::after` hit area, so the line box never changes height — which
is what lets **one shared rule** serve both heads with no named exception: the
axes still reserve Clear's height so picking moves nothing, and the melt row
sits level. The head also carries the caption's own `font-size`, because the
em-based reserve otherwise resolved against the pen's inherited 16px (38.4px
against the caption's 28.8px, and that 9.6px was the whole residual
misalignment).

**Sketch 008's touch font bump.** The ink and prose fields take `--type-note`
(16px) at touch. A sixth top-level media block re-asserts it below 600px, where
the 600px step would otherwise drop it back to 13px — precisely where a phone's
auto-zoom bites hardest. Measured before taking it: 393 coarse still reports
scrollWidth 393 against innerWidth 393, so the larger text costs no overflow.

## Measured in the real app (playwright-core, DPR 2 — not a probe page)

| | stop | track | melt gaps | captions | controls | field text |
|---|---|---|---|---|---|---|
| 1366 coarse | 38 × 44 | 186, 27.3 spare | 6 / 6 | level | level | 16px |
| 1366 fine | 38 × 32 | 186 | 6 / 6 | −4.8 | −4.8 | 15px |
| 393 coarse | 44 × 44 | 216 | — | — | — | 16px, scrollWidth 393 |

Desktop is unchanged, and −4.8 is what sketch 007 draws — 009 only ever drew the
wide **touch** case, so it may only speak for touch.

Picking an axis moves nothing at either pointer: the head measures 28.8 before
and after at coarse, 24 before and after at fine. That was the risk in touching
the shared head rule, and it held.

## Tests

940/940 (from 936). Five style-contract tests pinned the *old* contract and were
updated to the new one — including one that resolved `.axis-mark__stop` by
first match across media blocks, which broke once the touch union gained its own
stop rule. Four new tests pin what actually changed, including a guard that
fails if a width or `flex-basis` ever reappears on the touch-union stop rule —
that is the exact regression that caused the phase to pause.

## Note

The `--caption-line-h-touch` token is now unused by these rules. Left in place
rather than removed: it is pre-existing, and removing a token is a wider change
than this task was asked for.
