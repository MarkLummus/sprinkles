---
created: 2026-09-22T17:06:07.795Z
title: Remove the Sprinkles home link from the recipe route
area: ui
severity: minor
files:
  - app/src/router.jsx:60-65
  - app/src/styles/app.css:373
  - app/src/styles/app.css:31
---

## Problem

The recipe route's routed shell (`RecipeRoute` in `app/src/router.jsx`) still draws a running head — a `.page-head` band holding `<Link to="/">Sprinkles</Link>` — above the keyed `RecipePage`. That link predates the app shell (03.4-03): now that every route renders inside the shell, whose wordmark and Home place already link to `/`, the per-route home link is redundant. Mark asked on 2026-09-22, mid-execution of 03.4's second gap-closure round, for it to go.

## Solution

Remove the `.running-head` link (and probably the `.running-head` paragraph) from `RecipeRoute`. Two things hang off the same band and need a decision rather than a blind delete:

- `.page-head` is also the fixed band the `PageStatus` notice anchors beneath (`app.css` ~line 300, "inset-block-start: 100% is that band's own bottom edge"). If the whole `.page-head` div goes, `PageStatus` needs a new anchor.
- Plan 03.4-09 made `.page-head` one of the three selectors in `body:has(.recipe-page, .page-head, .not-found)` (`app.css:31`) that hand the canvas back to the Sheet cream on paper frames. `.recipe-page` still covers the recipe route once it has loaded, but the loading state (before `RecipePage` renders `.recipe-page`) relied on `.page-head` for the cream canvas — check that state if the div is removed.

Simplest surgical version: drop only the `<Link>` / `.running-head` paragraph, keep the `.page-head` div as the status band, and retire any now-unused `.running-head` rules and tests. Route through `/gsd-quick`.
