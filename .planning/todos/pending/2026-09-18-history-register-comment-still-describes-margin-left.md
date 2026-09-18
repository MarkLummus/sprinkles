---
created: 2026-09-18T12:14:45.000Z
title: The history register's comment still explains a margin-left the rule no longer uses
area: ui
severity: minor
files:
  - app/src/styles/app.css
---

## Problem

`app.css:779`, inside the `.history-register` block comment:

```
   `flex-wrap: wrap` plus `margin-left: auto` on the right block gives the
   shared right edge at width AND the whole-block drop at 393 in one rule.
```

The rule it describes was changed to logical properties in the hardening pass (`dc097cf`) so the
outline holds in both text directions:

```css
.history-register__record {
  margin-inline-start: auto;
  text-align: end;
  font-variant-numeric: tabular-nums;
}
```

The comment is the only place that still says `margin-left`. The reasoning it records — why a wrapping
flex line rather than a two-track grid, and why no `@media` block may be added here — is still exactly
right and worth keeping.

## Why it matters

Low. It is one stale identifier in a comment, and the surrounding explanation stays accurate.

It matters slightly more than a typo because this stylesheet's comments are load-bearing: they are
where the 393px reasoning lives, and a future reader grepping `margin-left` to find out what still
uses it will land here on a false hit.

## Possible resolution, not decided

Change the two words to `margin-inline-start`. Nothing else in the comment needs to move.

Worth folding into the next change that touches this block rather than spending a commit on it.
