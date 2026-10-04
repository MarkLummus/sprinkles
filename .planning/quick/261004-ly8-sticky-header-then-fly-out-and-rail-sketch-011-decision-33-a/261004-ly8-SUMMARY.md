---
phase: quick-261004-ly8
plan: 01
quick_id: 261004-ly8
subsystem: ui
tags: [shell, sticky-header, fly-out, rail, react, css, sketch-011-decision-33]
requires:
  - phase: quick-261004-ly7
    provides: --app-radius-control on .shell__place and the rail-scoped weight-600 active place
provides:
  - the sticky 57px App bar from 724 up, with the wordmark a link to Home at every width
  - the fly-out nav from 724 to 1589 (menu button, panel, scrim, focus, inert, Escape, Tab wrap)
  - the rail pinned under the bar from 1590
  - useBelowRail, the 1589.98 rung, and the header, z-order, scrim and shadow tokens
affects: [brief tasks 2 to 4 of sketch 011 decision 33, DESIGN.md arithmetic, notebook.css and app.css stale comments]
actuals:
  tokens: 26000
  tasks: 3
  commits: 9
plan_head_before: 3692270f41a441594176607847d04c8c71839cbd
plan_head_after: 099653e04680905b8c671e68870a42e1ae4fabbe
tech-stack:
  added: []
  patterns:
    - open state derived from the width (open = flyout && placesOpen), so crossing a cut drops the panel, scrim and inert in the same render
    - capture-phase document keydown that stops Escape before a page's bubble-phase listener
key-files:
  created:
    - app/src/ui/Shell.flyout.test.jsx
    - .planning/quick/261004-ly8-sticky-header-then-fly-out-and-rail-sketch-011-decision-33-a/261004-ly8-probe.mjs
    - .planning/quick/261004-ly8-sticky-header-then-fly-out-and-rail-sketch-011-decision-33-a/261004-ly8-baseline.json
  modified:
    - app/src/ui/Shell.jsx
    - app/src/ui/useBelowDesktop.js
    - app/src/styles/shell.css
    - app/src/styles/tokens.css
    - app/src/styles/app.css
    - app/src/styles/shell.test.js
    - app/src/styles/cross-cutting.test.js
    - app/src/ui/Shell.test.jsx
    - app/src/ui/useBelowDesktop.test.js
key-decisions:
  - "The tab row's cut moved to 723.98 in Task 2 with the fly-out, not in Task 1, so every commit leaves a coherent shell"
  - "The pinned rail uses height, not the brief's max-height, because 1600-sticky-rail draws it window-tall"
  - "The open fly-out panel resets height and align-self (stretch), because a non-normal align-self fits a fixed box to its content"
metrics:
  completed: 2026-10-04
status: complete
---

# Phase quick-261004-ly8 Plan 01: Sticky header, fly-out and pinned rail Summary

One-liner: a 57px sticky App bar from 724 up with the wordmark a link to Home, a focus-trapped fly-out nav from 724 to 1589 under it, and the 224 rail pinned under it from 1590, built to sketch 011 decision 33's boards and measured in Playwright WebKit and system Chrome.

**Read this first.** Mark decided on 2026-10-04 to build this now, to the boards as drawn, before looking at the 744 to 1366 boards. Those boards (744-batch, 834-batch, 983-batch, 984-batch, 1024-batch, 1366-batch, 744-sticky-nav, 984-sticky-nav, 1366-sticky-nav, 1600-sticky-rail) were drawn and awaiting his look when this was built. Mark will look on the device afterward, so his look covers the built app. 1600-batch, 1600-pen, 1600-no-batch, 1600-long-history and 1920-batch were approved.

Every reading below comes from Playwright WebKit and system Chrome on this Mac, not from Mark's iPad or iPhone.

## What was built, by state

- **Below 724** (as built, plus one change): the scrolling header (62 in WebKit, 63 in Chrome), the bottom tab row, More and the folded tools. The wordmark is now a link to Home. Everything else equals the pre-change baseline within 0.5.
- **724 to 1589**: a 57px sticky bar (44px controls, 6px above and below, a 1px hairline in the App divider colour, the opaque App ground) holding a 44 x 44 menu button labelled Places, the wordmark link, Search, Import and Export. No rail, no tab row; the Sheet gets the whole window (920 at 984, from 696). The menu opens the six places as a 224-wide panel from the bar's foot to the window's foot over a scrim; the bar stays live above both. Focus goes to Home; Tab and Shift-Tab wrap through the bar's controls and the six places; the page beneath is inert; it closes on Escape, the menu button, a scrim tap, a place chosen, and crossing 1590 or 724. Escape that closes it does not close an untouched pen.
- **From 1590**: no menu button; the rail stands in the flex row, sticky at the bar's foot (top 57, height the window less 57, scrolling itself in a short window).
- `html { scroll-padding-top }` reads `--app-size-header-h` from 724 up (0 below), so `#batch` scrollIntoView lands at 57.

## Commits (in order)

| Task | Commit | Message |
|---|---|---|
| 1 RED | bdac0f3 | test: pin the sticky header, the wordmark link and the header tokens |
| 1 GREEN | e19aa73 | feat: sticky App header from 984 with the wordmark a link to Home (brief task 5) |
| 1 fix | 3fa76b2 | test: .page-status reads the --app-z-notice token (still 10) |
| 2 RED | 4efce80 | test: pin the fly-out, its focus and close rules, and the two shell cuts |
| 2 GREEN | 5de6178 | feat: the fly-out from 724 to 1589 under the sticky header, tab row only below 724 (brief task 6, Rule A) |
| 3 RED | 162e43d | test: pin the sticky rail from 1590 |
| 3 RED (added) | 1a0d534 | test: the open fly-out panel stretches between its insets over the rail's align-self |
| 3 GREEN | 099653e | feat: pin the rail under the sticky header from 1590 (brief task 6) |

`commits: 9` in the frontmatter is the measured `git rev-list --count 3692270..HEAD`. One of the nine, cfa9ae0 (a docs commit to the marks-list skill), is not this plan's; eight are.

Ordering choice (recorded in the plan): the tab row's cut moved from 983.98 to 723.98 in Task 2, together with the fly-out, not in Task 1. Each commit therefore leaves a coherent shell: after Task 1 the bar is sticky from 984 and the rail is still in flow; after Task 2 the fly-out runs from 724 to 1589; after Task 3 the rail is pinned from 1590.

## RED then GREEN, per task

- **Task 1**: 6 shell.test.js tests and 1 Shell.test.jsx test failed before the change (bar rule, phone restore, the one `html` rule, the header-height token, the z order and notice token, the wordmark link rule, the link markup); the overflow guard passed before and after. All green after. The probe's `baseline` group was captured from a build of the unchanged source first, with the plan-time facts asserted (129 checks), and `header` passed (499 checks at that point).
- **Task 2**: 29 tests failed before (useBelowRail, the two-media-block pins, the 11 jsdom fly-out tests, the menu, scrim and z-order rules); all green after.
- **Task 3**: 2 tests failed before; a third (align-self) was added after the probe found the open panel 328 tall, failed, and went green with the fix.

## Probe results

Final run, `node 261004-ly8-probe.mjs header,flyout,rail,board`: exit 0, 1403 checks passed, no failure. Cells below are the `header` group (every cell also passes the `flyout` or `rail` checks that apply). "Before" values come from the baseline JSON captured from the unchanged source.

| Engine | Pointer | Width | Route | State | Bar h (before) | Bar top, scrolled 1500 | Menu x | Wordmark x (before) | Rail | Tab row | Main x / w | Sheet w (before) | #batch, 450-tall window | Overflow |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| webkit | coarse | 393 | batch | phone | 62 (62) | -1500 | - | 20 (20) | none (was none) | flex (was flex) | 0 / 393 | 393 (393) | 0.23 | 0 |
| webkit | coarse | 723 | batch | phone | 62 (62) | -1500 | - | 20 (20) | none (was none) | flex (was flex) | 0 / 723 | 723 (723) | -0.33 | 0 |
| webkit | coarse | 744 | batch | flyout | 57 (62) | 0 | 42 | 92 (48) | none (was none) | none (was flex) | 0 / 744 | 680 (680) | 57.05 | 0 |
| webkit | coarse | 834 | batch | flyout | 57 (62) | 0 | 42 | 92 (48) | none (was none) | none (was flex) | 0 / 834 | 770 (770) | 57.36 | 0 |
| webkit | coarse | 983 | batch | flyout | 57 (62) | 0 | 42 | 92 (48) | none (was none) | none (was flex) | 0 / 983 | 919 (919) | 57.36 | 0 |
| webkit | coarse | 984 | batch | flyout | 57 (68) | 0 | 42 | 92 (48) | none (was flex) | none (was none) | 0 / 984 | 920 (696) | 57.36 | 0 |
| webkit | coarse | 1024 | batch | flyout | 57 (68) | 0 | 42 | 92 (48) | none (was flex) | none (was none) | 0 / 1024 | 960 (736) | 57.36 | 0 |
| webkit | coarse | 1366 | batch | flyout | 57 (68) | 0 | 42 | 92 (48) | none (was flex) | none (was none) | 0 / 1366 | 920 (696) | 57.22 | 0 |
| webkit | fine | 1366 | batch | flyout | 57 (68) | 0 | 42 | 92 (48) | none (was flex) | none (was none) | 0 / 1366 | 920 (696) | 57.22 | 0 |
| webkit | fine | 1589 | batch | flyout | 57 (68) | 0 | 42 | 92 (48) | none (was flex) | none (was none) | 0 / 1589 | 1100 (919) | 57.22 | 0 |
| webkit | fine | 1590 | batch | rail | 57 (68) | 0 | - | 48 (48) | flex (was flex) | none (was none) | 224 / 1366 | 920 (920) | 57.22 | 0 |
| webkit | fine | 1600 | batch | rail | 57 (68) | 0 | - | 48 (48) | flex (was flex) | none (was none) | 224 / 1376 | 930 (930) | 57.22 | 0 |
| webkit | fine | 1920 | batch | rail | 57 (68) | 0 | - | 48 (48) | flex (was flex) | none (was none) | 224 / 1696 | 1100 (1100) | 57.22 | 0 |
| chrome | fine | 393 | batch | phone | 63 (63) | -1500 | - | 20 (20) | none (was none) | flex (was flex) | 0 / 393 | 393 (393) | 0.2 | 0 |
| chrome | fine | 744 | batch | flyout | 57 (63) | 0 | 42 | 92 (48) | none (was none) | none (was flex) | 0 / 744 | 680 (680) | 56.92 | 0 |
| chrome | fine | 984 | batch | flyout | 57 (68) | 0 | 42 | 92 (48) | none (was flex) | none (was none) | 0 / 984 | 920 (696) | 56.55 | 0 |
| chrome | fine | 1366 | batch | flyout | 57 (68) | 0 | 42 | 92 (48) | none (was flex) | none (was none) | 0 / 1366 | 920 (696) | 57.19 | 0 |
| chrome | fine | 1600 | batch | rail | 57 (68) | 0 | - | 48 (48) | flex (was flex) | none (was none) | 224 / 1376 | 930 (930) | 57.19 | 0 |
| chrome | fine | 1920 | batch | rail | 57 (68) | 0 | - | 48 (48) | flex (was flex) | none (was none) | 224 / 1696 | 1100 (1100) | 57.19 | 0 |
| webkit | coarse | 393 | home | phone | 62 (62) | -673 | - | 20 (20) | none (was none) | flex (was flex) | 0 / 393 | - (-) | - | 0 |
| webkit | coarse | 1024 | home | flyout | 57 (68) | 0 | - | 92 (48) | none (was flex) | none (was none) | 0 / 1024 | - (-) | - | 0 |
| webkit | fine | 1600 | home | rail | 57 (68) | 0 | - | 48 (48) | flex (was flex) | none (was none) | 224 / 1376 | - (-) | - | 0 |

Notes on the table:
- The wordmark box matches the boards exactly in WebKit (96.27 x 25.91, y 9.04 in the bar). Chrome sets the same text 97.75 x 26, so its bar is 57 (the 44px controls decide) but its phone header is 63 where WebKit's is 62; its wordmark sits at y 8.5 in the bar, on the Chrome board too.
- `#batch` cannot reach the window's top in a 900-tall window at 744 to 1024, because it sits in the document's last screen (the reading is the foot clamp, 436 to 460). The probe repeats the scroll in a 450-tall window, where every cell reads 57 within 0.5 (56.55 to 57.36) and the phone cells read 0. At 1366 and up, 900 can reach it and reads 57.2.
- Home ('/') cells at 393 coarse, 1024 coarse and 1600 fine: 62 / 57 / 57 bar, wordmark at 20 / 92 / 48, and the same rail and tab-row states as the batch cells.

Open fly-out (every fly-out cell, WebKit coarse 744, 834, 983, 984, 1024, 1366; WebKit fine 1366, 1589; Chrome fine 744, 984, 1366; window 900 tall): the panel is fixed at x 0, y 57, 224 wide and 843 tall (window less 57), z-index 5, shadow `rgba(20, 20, 20, 0.18) 4px 0px 16px 0px`, hairline `1px solid rgb(214, 218, 215)`, padding `6px 20px 32px 20px`, the six places at x 20, 183 wide, 44 tall, y 63, 120, 164, 208, 265, 309. The scrim is x 0, y 57, the window wide, 843 tall, `rgba(20, 20, 20, 0.28)`, z-index 4. Main is inert, the bar is not, focus is on Home, the page scroll does not move on opening, the menu button is on top at its centre and the scrim at the window's right edge. Also WebKit fine at 1366 x 954: the panel is 897 tall, still the window less 57.

Interactions (WebKit coarse 1024 and Chrome fine 1366, fresh contexts): Tab walks Notebook, Recipe book, Idea log, Ingredients, Kitchen and wraps to the menu button on the sixth press; Shift-Tab from the menu returns to Kitchen; Escape closes with focus on the menu and main live; a scrim tap, the menu button and choosing Notebook (path becomes /notebook) each close it with focus on the menu button. With an untouched Next version pen open, Escape closes the fly-out and the pen stays; a second Escape with the fly-out closed does close the pen (the pen's own listener is alive). Crossings (both engines): open at 1589, growing to 1590 leaves no menu or scrim, main live, the rail flex at x 0 and 224 wide, main at x 224; open at 724, shrinking to 723 leaves no menu or scrim, main live, the tab row flex.

Rail (WebKit fine and Chrome fine at 1590, 1600, 1920): no menu, wordmark at x 48, rail flex and sticky at x 0 and 224 wide, main at x 224 (width 1366, 1376, 1696), Sheet at x 256 / 920, x 256 / 930 and x 331 / 1100, overflow 0. At 1600 x 900 scrolled 640 the rail is at y 57, 843 tall, the places at y 63 to 309; at 1600 x 360 the rail is 303 tall with scrollHeight above that and `overflow-y: auto`. /kitchen at 1600 x 900 is no taller than the window.

Phone cells (393, 723): WebKit coarse 393 and 723 and Chrome 393 equal the baseline in every compared field. Chrome 723 has no baseline cell (the baseline list did not include it), so it is read structurally: static header, tab row flex, rail none, no menu, tools folded, `#batch` at 0.

## Board comparisons

Each compared within 0.5 on every box; all matched (0 px difference):

- 744-, 834-, 983-, 984-, 1024- and 1366-batch (WebKit; 984 and 1366 also in Chrome): the bar box, padding, hairline and ground; the menu button and its upright svg; the wordmark link; the sprinkles; Search, Import and Export; main x, y, width and padding-bottom; the Sheet x and width (32 / 680, 770, 919, 920, 960, 920).
- 1600-batch and 1920-batch (WebKit and Chrome): the same bar checks with no menu; the rail's x, y and width, places, padding and hairline; main x and width (224 / 1376 and 1696); the Sheet (256 / 930, 331 / 1100). The rail's height is not compared here: these two boards draw the rail as a column the height of the page (2765 and 2747), while the app's is pinned at 843. Only 1600-sticky-rail draws the pin.
- 1600-sticky-rail (WebKit and Chrome, 1600 x 900, scrolled 640): the bar, the wordmark, the tools, and the rail box (y 57, 843 tall) and places match.
- 744-, 984- and 1366-sticky-nav (WebKit, windows 744 x 1133, 984 x 768, 1366 x 954): panel 1's bar, nav box (224 x 1076, 711, 897 from y 57), places, scrim box and colour, shadow, ground, hairline and padding match; panel 0's bar matches. The app's bar stays at 0 with the page scrolled (1400, 2368 where the page clamps, 640).

## Suite

`npm --prefix app test`: 60 files, 1640 tests, all passing. Start of Task 1 (after ly3 to ly7): 59 files, 1612 tests. Delta: +1 file (Shell.flyout.test.jsx), +28 tests. No test was removed. Four existing tests in shell.test.js and one in cross-cutting.test.js were rewritten to the new cuts and token (the single `@media` condition and count, the old cut's name, and `.page-status` reading a token). `npm --prefix app run build` succeeds. The probe is the only live DOM measurement; jsdom covers the fly-out's behaviour (11 tests).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] cross-cutting.test.js pinned `.page-status` to the literal `z-index: 10`**
- **Found during:** Task 1, full suite (the plan's own change, `.page-status` reading `--app-z-notice`, broke it).
- **Fix:** the assertion now reads `var(--app-z-notice)`; shell.test.js pins the token at 10. The commit 3fa76b2 names it.
- **Files modified:** app/src/styles/cross-cutting.test.js. This is one app file outside the plan's nine. Task 3's scope check (`TOUCHED`, the `grep -vE` allowance) therefore flags it when run literally; the plan required both the token read and the file list, and they conflict. The check was not loosened.

**2. [Rule 1 - Bug] the probe's `#batch` scroll check could not pass as written**
- **Found during:** Task 1. At 900 tall, `#batch` sits in the document's last screen at 744 to 1024, so scrollIntoView reads the foot clamp (the baseline reads the same), not the scroll padding.
- **Fix:** the probe records whether 900 can reach it and repeats the scroll in a 450-tall window, where it can; both readings are asserted at 57 (bar) or 0 (phone). The 57 threshold is unchanged.

**3. [Rule 1 - Bug] a wrong plan-time fact for Chrome**
- **Found during:** baseline. Chrome's phone header is 63 (its wordmark line is 26 tall), not the 62 the plan measured in WebKit. The baseline asserts 62 for WebKit and 63 for Chrome, and the wordmark check in Chrome compares the baseline's own text box. The bar is 57 in both.

**4. [Rule 1 - Bug] a conditional hook call in my first Shell.jsx**
- **Found during:** Task 2, the jsdom resize test (`useBelowRail() && !useBelow724()` skips a hook). Both hooks are called every render now.

**5. [Rule 1 - Bug] the open panel was 328 tall, not the window less 57**
- **Found during:** Task 3's probe. The pinned rail's `align-self: flex-start` makes a fixed box with both insets fit its content in WebKit and Chrome. The open panel now declares `align-self: stretch` as well as `height: auto`; a test pins it (1a0d534).

**6. [Probe method] Playwright's `click()` on the menu button scrolled the page** (it scrolls a sticky element "into view" by its static position: to 0 in Chrome, by 51 in WebKit). The probe taps at the button's coordinates, as a finger does. The app never moved the page on opening (0 px).

Authentication gates: none.

## Findings for Mark

1. **The pinned rail uses `height`, not the brief's `max-height`.** The brief's text says max-height; its own acceptance board, 1600-sticky-rail, draws the rail 843 tall in a 900 window with its hairline to the window's foot. With max-height the hairline would stop under Kitchen, about 385 from the bar. The boards are the spec, so it is `height: calc(100vh - var(--app-size-header-h))`. 1600-batch and 1920-batch draw the rail page-tall; they conflict with 1600-sticky-rail on this one point, and the app follows the sticky board.
2. **An Import failure's error list renders inside the sticky bar**, which grows while it shows (the list is in `.shell__tools`). Not drawn.
3. **`.page-status` paints above the open fly-out** (the brief's order: scrim < panel < notice < bar).
4. **The menu button has no focus rule of its own**: it takes the app's global `:focus-visible` ring, while the shell's other stops keep their `.shell__place:focus` fallback. If iPad WebKit does not set `:focus-visible` on Tab, the button may show no ring; that is for the device check.
5. **Stale arithmetic comments outside this plan's files still name the 224 side nav in the 1366 and 984 sums**: notebook.css around 15, 895 and 935, and app.css near 2324 (and BatchRow.jsx's, if it carries one). Not edited. useBelowDesktop.js's two comments were corrected.
6. **Brief tasks 2 to 4 remain** (table widths and name columns 528 and 535, Go to batch from 724, Balance open from 984), so those numbers are not checked here.
7. **The 724 to 1366 and sticky boards were drawn and awaiting Mark's look when built** (see the note at the top).
8. **The Sheet at 1589 is 1100 wide** (the fly-out state at its top edge), against 920 one pixel later at 1590, where the rail returns. That follows the ladder arithmetic in the brief, and the probe reads it; I did not find a board for 1589.
9. **Scope check**: see deviation 1; the `app/` allowance in Task 3's automated verify flags `cross-cutting.test.js`.

## Deferred Human Verification

None of these have been run on a device. Serve from the build (`npm --prefix app run build && npm --prefix app run preview -- --host`; Mark's running preview already serves the rebuilt `app/dist`, so a hard reload is enough). The ArtifactData tool was not available to this agent, so no Mark's List row was filed: the orchestrator should file one row (suggested slug `ly8-sticky-header-device-check`, kind check, addedBy claude, status open) for the three checks below.

1. **iPad 1366 landscape, 1024 portrait, and 744 if he has an iPad mini**: the bar stays at the top while Safari's toolbars collapse and expand. The menu opens the panel by tap; a scrim tap and the menu close it; Search, Import and Export work while it is open. With a hardware keyboard (Full Keyboard Access off; tap, then Tab), Tab cycles the bar and the places, and Escape closes it. The on-screen keyboard over a field near the top does not hide the field under the bar.
2. **iPhone 393**: the scrolling header, the tab row and More are as before, and the wordmark goes Home.
3. **Mac at 1600 and 1920**: the rail stays under the bar while the page scrolls.

## Threat Flags

None. The fly-out reads and writes no data. The threat model's mitigations all hold: `open` is derived so inert cannot outlive a cut crossed (T-ly8-01, tests and probe crossings); Escape stops at the capture phase and the pen survives (T-ly8-02); shell.css's one `html` rule declares scroll-padding-top only and a test fails if any `html` rule there takes a background (T-ly8-03); the probe binds only ephemeral 127.0.0.1 ports (T-ly8-04); every commit was by explicit path and nothing touched .planning/sketches, .planning/canvas-generators, DESIGN.md or .impeccable (T-ly8-05).

## Known Stubs

None.

## Self-Check: PASSED

- Files exist: Shell.flyout.test.jsx, the probe, the baseline JSON, the SUMMARY.
- Commits exist: bdac0f3, e19aa73, 3fa76b2, 4efce80, 5de6178, 162e43d, 1a0d534, 099653e.
- Final probe run: exit 0, 1403 checks, 0 failures. Suite 60 files, 1640 tests, all passing. Build succeeds. `git status --porcelain app/` is empty.
