---
phase: quick-261002-v2k
plan: 01
subsystem: styles
tags: [css, ios-overscroll, canvas, binder-test]
requires: []
provides:
  - "body is the only rule that paints the canvas; it reads var(--app-background) on every route"
affects: [app/src/styles/app.css, app/src/styles/binder.test.js]
key-files:
  modified:
    - app/src/styles/app.css
    - app/src/styles/binder.test.js
decisions:
  - "Overscroll canvas is App white on every route, not-found page included (Mark, 03.4 UAT round three, 2026-09-22)"
requirements: [G-03.4-9]
status: complete
commits: 1
plan_head_before: ab79a4012f9e76c207259c9d229edee3a7582243
plan_head_after: 3d9f9ce1d4143851f75a0ab478a9a80a9f712bca
actuals:
  tokens: 2500
  tasks: 2
  commits: 1
completed: 2026-10-02
---

# Phase quick-261002-v2k Plan 01: Paint the overscroll canvas white on every route Summary

Removed the `body:has(.not-found)` rule from app.css so the iOS rubber-band canvas is App white on every route, and re-pinned binder.test.js to "no rule hands the canvas back".

## What changed

- `app/src/styles/app.css`: deleted the `body:has(.not-found) { background: var(--sheet-ground); }` rule. Rewrote the canvas comment: it keeps the G-03.4-9 tag, the debug-doc reference, the propagation mechanism, and the No `html` selector prohibition, and no longer describes a split by context or a hand-back. `.not-found` still declares its own `var(--sheet-ground)`, so the page looks the same on screen.
- `app/src/styles/binder.test.js`: retitled the canvas describe block, revised its comment, and replaced the per-frame hand-back test with one test. No selector may start with `body:has(`, and the top-level `body` rule is the only rule that gives body a background. The body-declares-App-ground and no-html-background tests are unchanged.

## Verification

- RED seen first: with the override still in app.css, the new test failed with `expected no body:has(...) hand-back, found "body:has(.not-found)"` (1 failed, 43 passed).
- GREEN: binder suite 44 passed.
- Full suite: 55 files, 1507 tests passed (same as baseline). `npm --prefix app run build` succeeds.
- Sweep (excluding node_modules, dist): `body:has` appears only in binder.test.js (the new test). `per context` / `per-context` appears nowhere. `not-found` hits are RecipePage.jsx, NotebookRedirects.jsx, two test comments, shell.css and tokens.css comments about .not-found's own paper and gutter, cross-cutting.test.js padding pins, and the .not-found rules in app.css. None describes the canvas as handed back. DESIGN.md's only "canvas" mentions are about the Claude Design canvas. No other file needed a change.

## Deviations from Plan

None. The plan's two tasks were committed as the single commit the plan specifies (`3d9f9ce`), with the files staged by explicit path.

## Deferred human-check (end-of-run UAT)

Device check for Mark, in the engine that matters: `npm --prefix app run build`, then `npm --prefix app run preview -- --host`, and open `http://(Mac LAN IP):4173/notebook/no-such-recipe` on the iPhone and then the iPad. Pull down past the top and push up past the bottom. The rubber-band region should be white, not cream. The "no recipe found" box should keep its own cream paper with App white around it. Repeat on Home and on a real recipe route; both should stay white. If Safari tints its toolbar from the canvas, it should read white on the not-found route too.

## Known Stubs

None.

## Self-Check: PASSED

- app/src/styles/app.css, app/src/styles/binder.test.js: modified, in commit 3d9f9ce (verified via `git show --stat`).
