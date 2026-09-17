---
created: 2026-09-17T15:45:00.000Z
title: DESIGN.md's responsive ladder understates what the 600px step now moves
area: design
owner: impeccable
severity: minor
files:
  - DESIGN.md:275
  - DESIGN.md:278
  - app/src/styles/tokens.css
  - app/src/styles/app.css
---

**Mark is fixing this one with Impeccable.** It is a DESIGN.md wording question, not a code change —
recorded here so it is not lost, not so a GSD task picks it up.

## Problem

`4bcac2f` (quick task 260917-gjo) made the page gutter a single shared token, `--gap-page`, read by
four boxes: `.recipe-page`, `.running-head`, `.page-status` and `.not-found`. `260917-h83` is adding
the recipe list route as a fifth. One `:root` step inside the existing `@media (max-width: 600px)`
block now moves all of them together.

DESIGN.md's responsive ladder still describes that step as though it moved one box:

- **line 278** — "**`max-width: 600px`** — the page padding shrinks to 20px, …". True, but "the page
  padding" now names a token that four (soon five) elements share, including two that are not the
  page: the running head above it and the save notice anchored beneath that head.
- **line 275** — "The 48px page padding is untouched here." Still accurate for the 1099.98px step,
  but it reads as though 48px were a property of the page rather than the default arm of a shared
  token.

Nothing here is false. The ladder is simply describing a one-element mechanism that became a
four-element one, and a reader following it would not learn that the running head and the notice
travel with the page.

## What a fix might say

That the app has one page gutter, expressed as `--gap-page`; that it is 48px by default and 20px
below 600px; and that everything framing a page reads it — the page body, the running head, the save
notice and the not-found body — so the left edge is a single decision rather than a per-element one.

Whether the ladder is the right home for that, or whether it belongs in DESIGN.md's token or layout
section with the ladder merely pointing at it, is a structural call for the design pass.

## Related

- `.planning/todos/pending/2026-09-17-gap-xl-references-no-longer-greppable-to-the-page-gutter.md`
  — the code-side remnant of the same change, which is GSD's to close.
