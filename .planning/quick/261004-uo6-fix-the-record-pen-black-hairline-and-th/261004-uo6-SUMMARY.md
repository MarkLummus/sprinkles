---
phase: quick-261004-uo6
plan: 01
subsystem: styles
tags: [css, record-pen, focus-ring, tab-row, sketch-011-decision-38]
requires: []
provides:
  - "The record pen's declared defect hairline reads --app-divider at 393 and 1366"
  - "The phone tab row's five focus rings draw inside their stops"
affects: [app/src/styles/notebook.css, app/src/styles/shell.css]
tech-stack:
  added: []
  patterns: ["three-class rule to outrank app.css's two-class rule", "inset focus ring: outline-offset of minus the outline width"]
key-files:
  created:
    - .planning/quick/261004-uo6-fix-the-record-pen-black-hairline-and-th/261004-uo6-probe.mjs
  modified:
    - app/src/styles/notebook.css
    - app/src/styles/notebook.test.js
    - app/src/styles/shell.css
    - app/src/styles/shell.test.js
key-decisions:
  - "The ring fix covers all five tab stops, not More alone"
  - "No new token: calc(-1 * var(--focus-outline-width)) reads the existing one"
requirements: [BATCH1-01, UX1-01]
status: complete
commits: 4
plan_head_before: d5874c3189859d4b871a91fb856444458d817ad2
plan_head_after: eaff655e79398e7b7856f6aa203b0c7c3c9cf957
actuals:
  tokens: 6000
  tasks: 3
  commits: 4
completed: 2026-10-04
---

# Phase quick-261004-uo6 Plan 01: Record pen black hairline and clipped More focus ring Summary

Two CSS rules: the record pen's stacked "This recipe only" hairline under the defects now reads the divider gray, and the phone tab row's focus ring draws inside each stop so the window edge cannot cut it.

Everything went as planned. Every gate passed on the first run, in both engines. Nothing was loosened.

## The cause and the rule for each defect

**Hairline.** app.css has `.axes-grid--stacked > .defect-group--declared` (two classes) with a Sheet-ink top border. The record pen's skin sets `.notebook-log * { border-color: var(--app-divider) }` (one class). The two-class rule won, so that one hairline stayed `--sheet-ink`, rgb(20, 20, 20), while every other hairline in the pen read rgb(214, 218, 215). The fix is one rule in notebook.css, right after the skin's `*` rule:
`.notebook-log .axes-grid--stacked > .defect-group--declared { border-top-color: var(--app-divider); }`
Three classes outrank app.css's two. It declares colour only. app.css is not edited, so the Sheet outside the log keeps its ink.

**Ring.** The tab row is fixed to the window's foot. Each stop's box runs to the window's bottom edge, Home's to the left edge and More's to the right edge. The ring was drawn 4px outside the box (2px offset plus 2px width), so its bottom stroke lay past the window on every tab, and More's right stroke did too. The fix is one phone-block rule in shell.css:
`.shell__tabs > .shell__place:focus, .shell__tabs > .shell__more > .shell__place:focus { outline-offset: calc(-1 * var(--focus-outline-width)); }`
The ring's outer edge is now the stop's own edge, so it follows the stop's 10px radius. The boxes do not move.

## Where the black line sits

The black hairline is **the defects' "This recipe only" line**, the top border of `div.defect-group.defect-group--declared`. In the DOM it sits **below** "Any problems?" and the four Every recipe chips, and above "Bitter".

The axes' "This recipe only" line (`.axes-grid__group--declared`, above "Any problems?") was **already** the divider gray in the existing build: 1px solid rgb(214, 218, 215), in both engines, at 393 and 1366. Mark's row placed the black line above "Any problems?". The DOM does not agree with that wording. The device check below asks Mark to look at both lines.

At 1024 (the wide grid) the defect group carries no border at all (0px none), so nothing was black there before or after.

## The ring's scope

The fix covers all five tab stops, not More alone. In the existing build every tab's bottom stroke was off-screen (ring bottom 856 in a 852 window), Home's left stroke too (-4), and More's right stroke too (396.97 in a 393 window). Decision 38 B's own wording is "one shape down the rail and across the tab row". More is where Mark sees it, because closing More hands focus back to its summary. The items in More's open list are unchanged (outline-offset stays 2px).

## Commits and tests

| Commit | Message |
| ------ | ------- |
| 6f070c3 | test(261004-uo6): pin the declared defect group's hairline to the divider in the record pen |
| d69afd6 | fix(261004-uo6): the declared defect group's hairline reads the divider like every record pen hairline |
| 73768d5 | test(261004-uo6): pin the tab row's focus ring inside the window |
| eaff655 | fix(261004-uo6): the tab row's focus ring draws inside its stop, whole on the 10px radius |

Each test commit comes before its fix commit. Each failed for the expected reason before the fix (rule missing). The four commits touch only the four named app files.

Test changes:
- **notebook.test.js:** a new test in the record pen's skin describe. The rule exists at top level, declares `border-top-color: var(--app-divider)`, declares nothing else, and comes after the `.notebook-log *` rule.
- **shell.test.js, rewritten:** the focus-rule list went from two rules to three (`.shell__menu:focus-visible`, `.shell__place:focus`, and the tab-row rule). The first two are top-level and the tab-row rule is in the phone block.
- **shell.test.js, new:** the tab row's rule declares exactly `outline-offset: calc(-1 * var(--focus-outline-width))`.

Full suite: 62 files, 1689 tests, all passing.

## Readings

All numbers are from `261004-uo6-probe.mjs all`: 202 checks, exit 0. Both engines gave the same results except for sub-pixel box widths.

**Border colours, record pen** (WebKit and Chrome identical):

| Size | defect-group--declared top, base | defect-group--declared top, +fix | axes-grid__group--declared top, base and +fix | Border differences base to +fix | Log height |
| ---- | -------------------------------- | -------------------------------- | --------------------------------------------- | ------------------------------- | ---------- |
| 393 | 1px solid rgb(20, 20, 20) | 1px solid rgb(214, 218, 215) | 1px solid rgb(214, 218, 215) | 1 (that top colour) | equal (WebKit 2557.44, Chrome 2550.11) |
| 1024 | 0px none | 0px none | absent | 0 | equal (WebKit 1485.03, Chrome 1481.70) |
| 1366 | 1px solid rgb(20, 20, 20) | 1px solid rgb(214, 218, 215) | 1px solid rgb(214, 218, 215) | 1 (that top colour) | equal (WebKit 2452.61, Chrome 2445.28) |

Base list of `--sheet-ink` borders in the log: at 393 and 1366, exactly one, `div.defect-group.defect-group--declared "This recipe only Bitter"` border-top. At 1024, none. After the fix, none at any size.

**Ring boxes**, WebKit (Chrome matches within 0.03px). Window 393 by 852, tab row top 796; stop boxes top 797, bottom 852.

| Stop | Box left to right | Base ring (offset 2) | +fix ring (offset -2) |
| ---- | ----------------- | -------------------- | --------------------- |
| Home | 0 to 78.59 | -4 to 82.59, bottom 856 | 0 to 78.59, 797 to 852 |
| Notebook | 78.59 to 157.19 | 74.59 to 161.19, bottom 856 | 78.59 to 157.19, 797 to 852 |
| Recipe book | 157.19 to 235.78 | 153.19 to 239.78, bottom 856 | 157.19 to 235.78, 797 to 852 |
| Idea log | 235.78 to 314.38 | 231.78 to 318.38, bottom 856 | 235.78 to 314.38, 797 to 852 |
| More | 314.38 to 392.97 | 310.38 to 396.97, bottom 856 | 314.38 to 392.97, 797 to 852 |

At 723 by 1000 (tab row top 944, boxes 945 to 1000) the same pattern holds: base rings run to 1004 down and -4 to 726.97 across (Chrome 727), +fix rings equal the boxes exactly. Every stop at both sizes is focused, solid, 2px wide, with four 10px corner radii (the `--app-radius-control` value) in both states.

**More list item offset:** 2px in base and +fix, at 393 and 723, both engines.

**Screenshot crops** (bottom 72px of the 393 window, More's summary focused, 3x scale; saved under `os.tmpdir()` as `uo6-more-{webkit,chrome}-{base,fix}.png`):
- Base, both engines: the black ring is cut. Its right edge and its bottom edge run off the image, and its lower corners are not drawn.
- +fix, both engines: the ring is one whole rounded rectangle inside the More tab, all four corners rounded, with its right and bottom strokes on the window's edge.

## Gate results

All passed. Nothing failed, so there is no pair of failing numbers to report.
- G0 pen (base shows the defect, both engines, 393 and 1366): defect top is 1px solid `--sheet-ink`; axes top is `--app-divider`. Passed.
- G-pen (+fix): defect top is 1px solid `--app-divider`; no log element has a border side in `--sheet-ink` at any of the three sizes. Passed.
- G-pen surgical: exactly one border side differs at 393 and at 1366, none at 1024, log height equal within 0.01. Passed.
- G0 ring (base shows the clip, both engines, 393): More's ring box right (396.97 WebKit, 397 Chrome) passes the 393 window, and its bottom (856) passes 852. Passed.
- G-ring (+fix, all five stops, 393 and 723, both engines): focused, solid, width equals the token, offset plus width is 0, four radii equal the control radius, ring inside the window across and inside the tab row down, box equals base. Passed.
- G-list: More's list item keeps outline-offset 2px. Passed.

## Method of measurement

The existing build (`app/dist`, read only, served on ephemeral 127.0.0.1 ports by the 03.5 harness) in Playwright WebKit and system Chrome, both coarse (touch, scale 3). The probe added exactly the two rules, read from the edited notebook.css and shell.css text, into the page with `addStyleTag`. The pen was opened in a throwaway context (Record another, then Add tasting) and never saved. There was no build and no Vite process. :4173, :5173, :8011 and `app/dist` were not touched. These are readings from two engines, not from Mark's iPhone or iPad.

## Consequence

Mark's running :4173 preview serves the old build. It does not show either fix until `npm --prefix app run build` runs.

## Deviations from Plan

None - plan executed exactly as written. Small notes:
- The probe's `ring` mode was written together with `pen` in Task 1 rather than added in Task 2. It was first run for `ring` only after the shell.css fix. The result is the same file the plan describes.
- The plan ledger file for the commit count was seeded just after the first test commit, then corrected to the pre-commit HEAD, so `plan_head_before` above is the true base (d5874c3).
- The probe and this SUMMARY are uncommitted, for the orchestrator's docs commit.

## Known Stubs

None.

## Threat Flags

None. Two colour and outline-offset declarations only.

## Deferred Human Verification

Suggested Mark's List rows (the executor has no ArtifactData tool and filed none). Serve from `npm --prefix app run build && npm --prefix app run preview -- --host`.

1. **Record pen hairlines, iPhone 393 and iPad 1366 landscape.** Open Olive Oil v1, then Record another, then Add tasting. Every hairline in the pen is the same gray, including both "This recipe only" lines: the axes' one above "Any problems?" and the defects' one above Bitter. (The defects' line was the black one.)
2. **Tab row focus ring, iPhone.** Tap More, then tap More again to close it. The ring on More shows whole, with its four corners rounded on the 10px radius, inside the tab. If a keyboard is paired, tab across the row: each tab's ring is whole. Keep Full Keyboard Access off.

## Self-Check: PASSED

- FOUND: app/src/styles/notebook.css, notebook.test.js, shell.css, shell.test.js (modified, committed)
- FOUND: probe at .planning/quick/261004-uo6-fix-the-record-pen-black-hairline-and-th/261004-uo6-probe.mjs
- FOUND commits: 6f070c3, d69afd6, 73768d5, eaff655
- `git status --porcelain app/` is empty; the four commits touch only the four named app files.
