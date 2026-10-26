---
phase: quick-261025-uge
reviewed: 2026-10-25T22:40:00Z
depth: quick
files_reviewed: 5
files_reviewed_list:
  - app/src/styles/tokens.css
  - app/src/styles/shell.css
  - app/src/styles/shell.test.js
  - .planning/quick/261025-uge-ultra-wide-frame-the-rail-and-the-page-t/261025-uge-frame-probe.mjs
findings:
  critical: 0
  warning: 2
  info: 4
  total: 6
status: issues_found
---

# Quick 261025-uge: Code Review Report

**Reviewed:** 2026-10-25
**Depth:** quick (pattern scan plus a targeted read of the changed hunks and their neighbours)
**Files Reviewed:** 4 source files (tokens.css, shell.css, shell.test.js, the probe)
**Status:** issues_found

## Summary

The shipped CSS is correct as far as I can trace. Checks I made:

- **Percent bases.** The `100%` inside `padding-inline` resolves against the bar's containing block, `.shell`, which is the window width. The `100%` inside the fixed panel's `inset-inline-end` resolves against the viewport. Both agree.
- **Below 1770.** The `max()` collapses to `--gap-page`, so nothing moves.
- **`width: 100%`.** It is needed, because the auto inline margins disable flex-column stretch.
- **Containing blocks.** No transform, filter, contain or overflow was added, so the sticky bar and the fixed `.page-status-anchor` keep resolving against the viewport.
- **Notice position.** The anchor spans the window and the card centres in it. The block is now centred, so the window centre is the block centre and the notice position is unchanged.
- **Phone rule.** Its `padding` shorthand overrides the new `padding-inline` through source order.
- **Literals.** No literal visual value was added. `100%`, `2` and `/ 2` are arithmetic, not visual.
- **Tests.** `shell.test.js` passes 73/73.

No Critical issues. The defects are in the probe's gate strength and in some brittleness and duplication.

## Warnings

### WR-01: `compare` never checks that the after record covers the before record

**File:** `.planning/quick/261025-uge-ultra-wide-frame-the-rail-and-the-page-t/261025-uge-frame-probe.mjs:274`
**Issue:** `const keys = Object.keys(after)` makes `after` the only source of truth. A key present in `before` and absent from `after` is silently ignored. This happens when an engine was skipped, for example when Chrome is unavailable and `record` only logs `INFO chrome unavailable`. It also happens when a width or route was filtered through `PROBE_ENGINES`, `PROBE_WIDTHS` or `PROBE_ROUTES`. `compare` can then print `N PASS, 0 FAIL` and exit 0 on a reduced matrix. `meta.engines`, `meta.widths` and `meta.routes` are written but never read or compared.
**Fix:**
```js
const missing = Object.keys(before).filter((k) => !(k in after));
for (const k of missing) gate(false, `present ${k}: missing from the after record`);
```
Also fail when `JSON.stringify(beforeMeta.engines) !== JSON.stringify(afterMeta.engines)`, and likewise for widths and routes.

### WR-02: Shift and same gates pass vacuously when a selector matches nothing in both builds

**File:** `.planning/quick/261025-uge-ultra-wide-frame-the-rail-and-the-page-t/261025-uge-frame-probe.mjs:238-240`
**Issue:** `firstDiff` does `if (a == null && b == null) continue;`. If a selector in `SHELL_BOXES` or `ROUTES[*].boxes` stops matching, for example after a class rename, it is null in both builds and the gate passes with nothing measured. The same applies to the `creation` route. When `openCreation` returns `false` (no "New recipe" entry), `record` measures `/notebook` under the `creation` key. `.notebook`, `.recipe-page` and the other boxes are then null, so the notebook-route comparison skips them. The `shift` gate PASSes without having examined the notebook content. Only `target2560` fails on a null box.
**Fix:** Treat a null in the after record as a failure for every name in `SHELL_SHIFT` and for the route's required boxes. Keep the `a == null && b == null` skip only for a list of explicitly optional boxes, for example `tabs` above the phone width. For `creation`, fail the gate instead of recording when `present` is false, or mark the key and skip its gates visibly.

## Info

### IN-01: The bar's edge expression is written three times

**File:** `app/src/styles/shell.css:59` and `app/src/styles/shell.css:224`; `app/src/styles/shell.test.js:~817` (`SHARED_EDGE`)
**Issue:** `max(var(--gap-page), calc((100% - var(--app-frame-max)) / 2 + var(--gap-page)))` is duplicated in the bar, in the Import panel and in the test constant. The test pins them equal, which guards drift but does not remove it. Custom-property substitution is textual, so `--app-frame-edge: max(...)` would resolve per use site against each property's own percentage base. That would give the same result for padding and for the fixed inset, with one definition. If it is kept as is, nothing is broken.
**Fix:** Optional. Add a token and read it in both places, then update the test to pin the token and the two `var()` reads. Alternatively leave as is, since the pin test covers it.

### IN-02: The `padding` shorthand's inline part is now dead code at every width

**File:** `app/src/styles/shell.css:58-59`
**Issue:** `padding: var(--gap-xs) var(--gap-page)` is followed by `padding-inline: max(...)`, which always wins. The shorthand's inline half never applies, and only the block half does. The test pins that the shorthand stays and comes first, so this is deliberate, but it reads as a mistake to the next editor.
**Fix:** Either use `padding-block: var(--gap-xs)` and drop the shorthand (adjusting the test), or add a short comment that the shorthand is kept for the block half.

### IN-03: The fifth test pins the whole set of media conditions

**File:** `app/src/styles/shell.test.js:~846-852`
**Issue:** The "adds no breakpoint" test asserts the exact sorted list of media conditions in `shell.css`. Any future, unrelated breakpoint added to the file breaks this test for a reason that has nothing to do with the frame. The first half of the test, that no media rule reads `--app-frame-max`, is the real guard.
**Fix:** Keep the `--app-frame-max` loop. Drop the equality on the full list, or move it to the existing media-conditions test if one already owns that contract.

### IN-04: The probe hard-codes machine paths and magic numbers, and couples to a phase-08 file

**File:** `.planning/quick/261025-uge-ultra-wide-frame-the-rail-and-the-page-t/261025-uge-frame-probe.mjs:1-30, ~165, ~330`
**Issue:**
- The default `PLAYWRIGHT_CORE` is `/Users/mark/.npm/_npx/e41f203b7505f1fb/...`, an npx-cache hash that changes. It is overridable and the failure message is clear.
- The probe imports `startServers` from `../../phases/08-.../08-walk-server.mjs`, so a phase-08 cleanup would break it.
- The 2560 targets (395, 2165, 667, 1647.3 and so on) are literal copies of decision 59.
- `browser.close()` is not in a `finally`, so a mid-run throw leaves the browser to exit with the process.
- The probe measures with overlay or hidden scrollbars only. A classic always-visible scrollbar, as on Windows Chrome, shifts the window width and is not covered. `compare`'s 0.15 and 0.5 tolerances would not tell you whether the percent bases still agree there. This is low risk on a macOS-only user.

**Fix:** Optional. Resolve `playwright-core` through a package resolve or a documented env var only, and put the browser close in `finally`. State in the header that classic scrollbars are untested.

---

_Reviewed: 2026-10-25_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: quick_
