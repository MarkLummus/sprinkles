---
created: 2026-09-17T15:40:00.000Z
title: Two --gap-xl references still name the page's padding, which is now --gap-page
area: styles
severity: minor
files:
  - app/src/styles/tokens.css:172
  - app/src/styles/columns.test.js:43
  - app/src/styles/app.css:416
---

## Problem

`4bcac2f` (quick task 260917-gjo) gave the page gutter its own token. `.recipe-page`,
`.running-head`, `.page-status` and `.not-found` now read `var(--gap-page)`, which resolves to
`--gap-xl` by default and steps to `--gap-m` below 600px.

Two places still describe that padding as `--gap-xl` directly:

- **`app/src/styles/tokens.css` ~172-178** — the ingredient-column arithmetic, which derives its
  column widths from the page's available width and names `--gap-xl` as the page's padding in that
  derivation.
- **`app/src/styles/columns.test.js:43-44`** — the same arithmetic, asserted.

Neither is *wrong*. `--gap-page` is `--gap-xl` at the widths that arithmetic is stated for, so the
numbers still hold and the suite is green. The defect is that the relationship is no longer
**greppable**: someone changing the page gutter can no longer find these two by searching for the
token the rule actually reads, and the column arithmetic would silently go stale.

Found by the 260917-gjo planner, recorded rather than fixed because it was outside that task's file
scope.

## Why it matters

The column arithmetic is load-bearing — it is what stops the ingredient table overflowing the page.
It is coupled to the page's padding by derivation, and that coupling is now invisible to search. The
next person to touch the gutter has no way to discover it.

## Possible resolutions, not decided

1. Have both read `--gap-page`, if the arithmetic holds at the narrow step too — needs checking,
   because the columns may not be intended to re-derive below 600px.
2. Leave both reading `--gap-xl` but add a comment at each site naming `--gap-page` as the rule that
   actually sets the padding, so a grep for either token finds the other.
3. Decide the column arithmetic is deliberately pinned to the wide-width case and say so, which
   makes the current state correct and documented rather than accidental.

Option 2 is the cheapest and loses nothing; option 1 is the most correct if the arithmetic survives
the narrow step. Worth ten minutes with the numbers before choosing.
