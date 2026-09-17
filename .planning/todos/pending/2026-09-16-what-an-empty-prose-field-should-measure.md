---
created: 2026-09-17T02:15:00.000Z
title: What an empty prose field should measure — desktop height, the sketch departure, and autoGrow
area: ui
severity: minor
files:
  - app/src/styles/app.css:1351
  - app/src/styles/app.css:260
  - app/src/ui/BatchRow.jsx:99
  - .planning/sketches/008-control-sheet/index.html:141
  - .planning/sketches/008-control-sheet/index.html:166
  - .planning/sketches/007-full-battery/index.html
  - .claude/skills/sketch-findings-sprinkles/references/cross-cutting-type-spacing-feedback.md:37
---

## Problem

Three findings left open by quick task `260916-vv1` (critique issue 4, the 44px touch floor for
`.prose-field`). They are one question wearing three hats: **what should an empty prose field
measure?** Mark scoped `260916-vv1` to the touch floor only and deferred all three deliberately.

**1. Desktop prose fields are ~18px — the fix never reaches them.**

Measured in Chrome against the real app, record pen open, viewport **1366x937** with
`pointer: coarse` **false** and `(max-width: 759.98px)` **false** — true desktop. Three
`.prose-field` textareas (At the machine, Ingredient notes, Next time; the fourth sits in the
unopened tasting) each reported:

    height 18px · width 598px · rows 2 · min-height auto · padding 0/0
    line-height normal · font-size 15px · scrollHeight 17 · field-sizing content · no inline height

`rows="2"` is **inert**. `app.css:260-262` declares `textarea { field-sizing: content }`
unconditionally — deliberate, citing D-13 § 8 ("prose fields grow with their typed text") — so
the box sizes to content and an empty field is exactly one line. That rule's own comment says
`field-sizing` "degrades to the rows attribute ... where an engine does not yet support it, so
no feature query is written"; the reasoning is sound but Chrome *does* support it, so the
fallback never engages.

The sketch does not have this bug. `sketch 008:141` gives `.prose-field` three declarations the
app's transcription dropped:

| | sketch 008:141 | app app.css:1351 |
|---|---|---|
| `min-height` | `calc(var(--leading-note) * 1em)` | *absent* |
| `padding` | `var(--gap-hair) 0` | `0` |
| `line-height` | `var(--leading-note)` (1.5) | `inherit` |

That missing `min-height` is the whole cause. This is a genuine **conformance gap**, not a
design question — restoring the three would fix desktop and touch alike, to roughly 24px.
`.prose-field--empty`'s bottom-border rule ("the hairline-baseline fix for a blank named prose
field") exists because a blank content-sized field has no visible extent — the same cause,
already worked around once.

**2. The app is now stricter than the sketch, and carries a departure row.**

`sketch 008:166`'s touch `min-height` list is `.chip-toggle, .defect, .check, .seg .opt,
.text-control, .btn, .ink-field` — `.prose-field` is deliberately absent, and `:167` pairs
`.ink-field, .prose-field` for `font-size` only. `sketch 007:176-179` agrees. So the sketch's
own prose field is ~24px at touch, which **itself violates UX1-01's 44px target** — the critique's
finding is a finding against the sketch too. `260916-vv1` added the 44px floor app-side with
Mark's approval, so the app now exceeds the drawing. The standing rule is to draw app-side
decisions back into the sketch rather than leave departure rows.

Note `cross-cutting-type-spacing-feedback.md:37` summarises this ladder in prose and was
deliberately NOT edited by `260916-vv1`: it records what the *sketch* established, and
rewriting it to include something the sketch never drew would manufacture the departure the
rule forbids. It should be updated only once the sketch itself carries the floor.

**3. `autoGrow` is probably dead code.**

`BatchRow.jsx:99-103` sets `el.style.height = 'auto'` then `= scrollHeight + 'px'` on every
input event — which is exactly what `field-sizing: content` already does. Sketch 008:498 has
the same listener, for the same historical reason. Verified harmless (an inline `height` cannot
defeat `min-height`), but it looks redundant. Pre-existing; flagged, not removed, per
CLAUDE.md §3.

## Solution

Decide the underlying question first, then let the three follow from it: **should an empty prose
field have a minimum extent at every pointer type, or only where a touch target demands one?**

A likely shape, if the answer is "at every pointer type":

- Restore sketch 008:141's three declarations to `.prose-field`'s base rule — `min-height:
  calc(var(--leading-note) * 1em)`, `padding: var(--gap-hair) 0`, `line-height:
  var(--leading-note)`. Pure conformance; fixes desktop. Watch for interactions with
  `.batch-margin__field`'s own `line-height` absence and with `.prose-field--empty`'s border.
- Revise sketch 008:166 (and check 007:176-179) to carry the 44px prose floor at touch, so the
  app's `260916-vv1` change stops being a departure. Sketch first, app follows — the authority
  order used by `260916-ufq`.
- Then update `cross-cutting-type-spacing-feedback.md:37` to match the revised sketch.
- Decide `autoGrow`'s fate once `field-sizing`'s behaviour is settled — if it is redundant,
  removing it also removes the inline `height` it writes.

**Constraints:** doc/CSS work routes through a GSD command; Impeccable owns design decisions and
never edits `app/` directly. Any new value reads a token — no literals (DESIGN.md). Do not
reformat surrounding CSS: `binder.test.js` asserts the media-query strings and a
six-`@media`-block count, `cross-cutting.test.js` pins the touch-union selector list as exact
strings, and there is a no-bare-px gate.

**UAT:** the 44px floor can only be confirmed on the iPad (viewport **1366** with `pointer:
coarse` — no width threshold catches it). A Chromium pass at 759px exercises the same CSS branch,
so a failure there is real, but a pass is an inference about coarse pointers, not an
observation — SR-6 is the precedent, where Chromium reported 44px for a field the iPad rendered
at 29px.

**Blast radius when this is picked up:** the shared floor already reaches twelve fields, not
four — `Headnote.jsx:23`, `Method.jsx:150/158/228/255/459`, `Authored.jsx:24`,
`VersionRow.jsx:272`, plus `BatchRow.jsx:511/524/607/730`. Intended, since the token stays
shared, but it visibly changes the recipe-version page too.
