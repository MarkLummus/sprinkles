---
created: 2026-09-22T18:05:00.000Z
title: Paint the canvas (overscroll region) white on every route, including the paper frames
area: design
severity: cosmetic
files:
  - app/src/styles/app.css
  - app/src/styles/binder.test.js
---

## Problem

G-03.4-9 made body's background per-context: App white by default, with
body:has(.recipe-page, .page-head, .not-found) handing the canvas back to the Sheet's cream
behind the three paper frames. Mark confirmed the fix on device at 03.4 UAT round three
(2026-09-22, test 1) and ruled the split unnecessary: the rubber-band canvas should be white
on every route. Drop the :has() branch so body reads --app-background unconditionally, and
update the binder.test.js pin that asserts the per-context rule.
