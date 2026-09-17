# 260917-gjo — Context (locked decisions)

Mark asked for this on 2026-09-17. It is the observation the 260917-ewf planner recorded and
deliberately did not import into the new element — a pre-existing divergence, now to be closed.

## The defect

Three elements that should share a left edge do not, below 600px:

| Element | Declared inline edge | Below 600px |
|---|---|---|
| `.recipe-page` | `padding: var(--gap-xl)` — 48px (`app.css:417`) | `padding: var(--gap-m)` — **20px**, inside the `@media (max-width: 600px)` block (~2511) |
| `.running-head` | `padding: var(--gap-m) var(--gap-xl) 0` — 48px (`app.css:310`, its **only** rule anywhere) | unchanged, 48px |
| `.page-status` | `inset-inline-start: var(--gap-xl)` — 48px, anchored to follow the head (260917-ewf) | unchanged, 48px |

Above 600px all three agree at 48px. Below it the page moves to 20px and the other two do not, so on
a phone the running head and the save notice hang **28px right** of the content they head and overlay.

## Direction — the page's gutter wins

The narrow block's own comment says the page shell "is what actually frames the record at every
width". Its 20px is the deliberate phone gutter; the running head simply was never included when
that block was written. **Do not widen the page back to 48px.**

## Preferred shape — one shared value, not three parallel overrides

This project's standing rule is that a shared size stays shared: one value app-wide, split only for a
named exception. Resolve this with a single page-gutter custom property that all three consume —
`--gap-xl` by default, `--gap-m` below 600px — rather than adding a second `.running-head` rule and a
second `.page-status` rule inside the media block. Three restatements of one breakpoint is how these
three drifted apart in the first place.

**The constraint that makes the placement non-obvious:** `.page-status` and `.running-head` live in
the routed shell's `.page-head`, **outside** `.recipe-page`, so a property declared on `.recipe-page`
will not reach them. It needs a common ancestor, or `tokens.css`.

Follow the project's own convention for where a contextual value like this belongs. Check how
`tokens.css` is organised and whether it declares any media-dependent value today — the 260917-ewf
planner found it declares no `@media` at all, so if this would be the first, **say so and weigh it**
rather than doing it silently.

## Constraints

- No literal. Every value reads a custom property.
- No colour change, no motion, nothing moves on focus, hover or selection.
- The notice stays out of flow and must still reflow nothing.
- Do not touch the batch pen, the churn-date wiring, the version field errors, `PenFoot`,
  `router.jsx`'s key, or which channel any sentence uses.
- Do not edit anything under `.impeccable/` — the briefs are the orchestrator's.

## Verification

1. `npm --prefix app test` — baseline **977 passing across 34 files**. Report the real number; never
   adjust an assertion to hit it.
2. Two suites pin the stylesheet's media register — `binder.test.js` (an `@media` count plus an
   `allowedMedia` list) and `cross-cutting.test.js` (named conditions). If the approach changes the
   number or shape of at-rule blocks, **both** must be updated together or the suite reds.
3. Add coverage for the shared gutter itself, so a future edit cannot move one of the three without
   the others.
4. The orchestrator runs the browser check at 1024 and at 393, confirming all three left edges agree
   at both widths.
