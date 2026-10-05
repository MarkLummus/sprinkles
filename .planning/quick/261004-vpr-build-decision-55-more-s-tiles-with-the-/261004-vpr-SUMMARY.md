---
phase: quick-261004-vpr
plan: 01
subsystem: shell
tags: [more, tab-row, tiles, hairline, sketch-011, decision-55]
requires: [quick-261004-vj2]
provides:
  - "More's open panel shows five tiles of one width, with a hairline between places and actions"
  - "button.shell__place: one top-level reset, no border wherever a place is a button"
affects: [app/src/ui/Shell.jsx, app/src/styles/shell.css]
key-files:
  modified:
    - app/src/ui/Shell.jsx
    - app/src/styles/shell.css
    - app/src/styles/shell.test.js
    - app/src/ui/Shell.test.jsx
    - app/src/ui/Shell.flyout.test.jsx
  created:
    - .planning/quick/261004-vpr-build-decision-55-more-s-tiles-with-the-/261004-vpr-probe.mjs
decisions:
  - "The root-scope test in shell.test.js names button.shell__place as a second exception, beside html"
requirements: [UX1-01]
status: complete
commits: 4
plan_head_before: 38f5c521f0a021972c492cca649b1f77faa7d286
plan_head_after: 42f5b885f85945c3119fef020cba70b2e0cb546c
actuals:
  tokens: 3000
  tasks: 3
  commits: 4
---

# Phase quick-261004-vpr Plan 01: More's tiles with the hairline (sketch 011 decision 55) Summary

More's open panel below 724 now shows five tiles of one width, with the rail's own hairline between Search and Import, and a place that is a button carries no border wherever it sits.

## What did not go as planned

- **The probe exits 1. Four gates fail, all the same one, all in WebKit.** G1, "the panel's right edge equals innerWidth". WebKit reads a gap of 0.031 px at 393 and at 723, on the Notebook page and on /ingredients (build 392.969, window 393). The gate is 0 within 0.01, so it fails, and I left it as the plan wrote it. This is not from the change. The dist as it is, before any fix, has the same 0.031 gap in WebKit (the base readings print it). The cause is almost certainly the five-way flex split of the tab row leaving More's right edge 1/32 px short. Chrome reads 0 in every case. I added one diagnostic gate of my own, G1b ("right gap equals base"), and it passes in both engines. G1b is not a replacement for G1. Sid's numbers round to one decimal, so he saw 0.0.
- Nothing else differed from the plan. Every other gate passes, including G0, which means the dist and the harness context agree with Sid's as-built numbers in both engines.
- The work ran on the `main` branch, as the orchestrator asked ("main tree, no worktree"). The four commits are on main. Nothing is pushed.

## What changed

Four commits, tests first for each change:

| Hash | Message |
|---|---|
| 1f604e6 | test(261004-vpr): pin the More hairline between places and actions |
| 2908df0 | feat(261004-vpr): the More hairline between places and actions |
| bdbcd5f | test(261004-vpr): pin the More tiles and the reset on a place that is a button |
| 42f5b88 | feat(261004-vpr): More tiles, and a place that is a button carries no border |

Files:
- `app/src/ui/Shell.jsx`: an `aria-hidden` li holding `hr.shell__divider`, between Search's item and Import's item. `<ul onClick={closeMore}>` is unchanged, so a tap on the rule closes More.
- `app/src/styles/shell.css`:
  - top level: `button.shell__place { appearance: none; border: none; background: none; color: inherit; cursor: pointer; }` replaces the tools row's `.shell__tools button` reset, in the same place in the file
  - phone block: `.shell__more li.shell__more-sep { min-height: 0 }`, `.shell__more li.shell__more-sep .shell__divider { margin-inline: 0 }`, `.shell__more li > button { width: 100% }`, `.shell__tabs .shell__more li .shell__place { padding-inline: var(--gap-xs) }`
  - the header comment names the two exceptions
- Tests:
  - `Shell.test.jsx`: the separator's exact markup and place (after Search, before Import); one separator; three `class="shell__divider"` in all, the rail's two still `aria-hidden`.
  - `Shell.flyout.test.jsx`: in jsdom at 393, open More, click the rule, More closes and focus is the summary.
  - `shell.test.js`: six new tests, in the describe "More's tiles and the hairline". They pin the two separator rules (phone block only, no top-level twin), the rail's `.shell__divider` unchanged, the one reset with exactly five declarations, the old tools-row reset gone, `width: 100%` and `padding-inline: var(--gap-xs)`. The root-scope test is amended.
- No other test counted More's list items or the dividers, so none needed a new count.
- Full suite: 62 files, 1722 tests, all pass. `git status --porcelain app/` is empty. The four commits touch only the five files above.

## Where the brief and the code disagreed

- **The root-scope test.** It admitted only `.shell`, `.place` and `html`. The brief's selector `button.shell__place` starts with `button`. I kept the brief's selector on purpose: at (0,1,1) it ties app.css's `button` and `button:hover`, and shell.css loads after app.css, so border none wins at rest and under hover. The test now admits exactly `html` and `button.shell__place`, and a new test pins the reset's exact selector, media (top level) and declarations. Nothing else is widened. The comment in the test and the header comment in shell.css say why.
- **Readings against Sid's and the board.** None differ except the 0.031 WebKit right-edge reading above. The board matches the build in every window (G9, 0 readings differ).

## The readings

Method per page: base reading first (the dist as it is), then the fix state. Tolerance 0.1 against Sid's one-decimal numbers, 0.01 for relations, 0.02 for "panel width minus 26" (LayoutUnit steps are 1/64 px).

**Panel and tiles, fix state** (coarse, 393 and 723 identical):

| Engine | Route | Panel | Tiles (all five) | Import / Export | Sid |
|---|---|---|---|---|---|
| WebKit | Notebook page | 101.5 x 284 | 75.5 x 49 | 75.5 x 49, border 0 | 101.5 x 284, 75.5 x 49 |
| WebKit | /ingredients | 105.219 x 284 | 79.219 x 49 | 79.219 x 49, border 0 | 105.2 x 284, 79.2 x 49 |
| Chrome | Notebook page | 97.578 x 279 | 71.578 x 48 | 71.578 x 48, border 0 | 97.6 x 279, 71.6 x 48 |
| Chrome | /ingredients | 102.438 x 280 | 76.438 wide; Ingredients 49 tall, the rest 48 | 76.438 x 48, border 0 | 102.4 x 280, 76.4 wide |

- Panel: border 1px solid in --app-divider, padding 12px, tab row top minus panel bottom -1 (as base). Tile width is the panel's width minus 26 in every case. Padding-left and right are 6 (--gap-xs).
- The rule (G4): li and hr as wide as the tiles, 1px tall, `1px solid rgb(214, 218, 215)`, margins 6/0/6/0. Search's bottom to the hr's top is 6, the hr's bottom to Import's top is 6. The li is `aria-hidden="true"` and holds no control.
- Current place (G3, /ingredients): `aria-current="page"`, background `rgb(243, 244, 242)` (--app-surface-subtle), weight 600, ink insets 6.007 (WebKit) and 6 (Chrome) each side.
- Ring (G5, Import focused): outline solid, 2px, offset 2px (both tokens). Ring top is 2 below the hr's bottom. Ring right is 8 inside the panel's inner right edge, ring left 8 inside its inner left edge. The ring bottom is above the panel's inner bottom.
- Tab row (G-tabs): the five stops' boxes equal base in every case.
- G0, base 393 Notebook page: WebKit panel 89.5 x 275, links 63.5 x 49, Import 39.125 x 51, Export 38.906 x 51 (1px solid); Chrome panel 85.578 x 270, links 59.578 x 48, Import 37.125 x 50, Export 37.328 x 50 (1px solid). All equal Sid's.
- Hover in More (G6, fine pointer, 393 and 723): base Import goes 1px to 2px (WebKit 39.125 x 51 to 41.125 x 53; Chrome 37.125 x 50 to 39.125 x 52), so hover was entered. Fix: Import and Export border 0 at rest and under hover, box unchanged (WebKit 75.5 x 49, Chrome 71.578 x 48).
- Header (G7, 724 and 1366): base Import and Export border 0 at rest and under hover. Control (old rule deleted, no new rule): Import border-top 1px solid in both engines, so the new rule holds border 0. Fix: border 0, rest and hover boxes equal base. Hover shrink is unchanged: WebKit Import 108.406 x 44 at rest, 80.406 x 32 under hover (Sid at 1366: 108.4 x 44, 80.4 x 32); Chrome 106.984 x 44 and 78.984 x 32 (Sid: 107.0 x 44, 79.0 x 32). The hover shrink is the open todo and is not fixed here.
- Taps (G8, 393 and 723, both engines): a tap on the rule closes More (the tap point was the `hr` itself, checked with `elementFromPoint`). Import fires a `filechooser` event, closes More, and there is exactly one `input[type=file]`. Export fires a `download` event and closes More. Kitchen, Ingredients and Search each close More.
- Board (G9, both engines, 393 and 723, rest / cur / ring): the board's panel, five tiles, hr and both 6px gaps equal the build's, rest and ring against the Notebook page, cur against /ingredients.
- Crops saved to the temp folder: `/var/folders/rs/11f8grj17lz9xdsd6dn_xzpw0000gn/T/vpr-<webkit|chrome>-<393|723>-<rest|cur|ring>.png` and `vpr-board-<engine>-<393|723>-<rest|cur|ring>.png`.

## The method

The existing build (`app/dist`, read only) was served on ephemeral 127.0.0.1 ports by the harness. The dist predates this quick, so in each page the old `.shell__tools button` rule was deleted from the CSSOM (exactly one each time), the separator was set by a DOM edit (exactly one each time), and the edited source's own rules were added with `addStyleTag`. The probe throws if shell.css still has the old reset or lacks any of the five rules. No build, no Vite process, :4173 untouched. A DOM edit is not a build. The probe is `261004-vpr-probe.mjs` in this folder. It is not committed (the orchestrator's docs commit takes it).

## The consequence

Mark's running preview does not show any of this until `npm --prefix app run build` runs.

## Still open, not touched

- The header's hover shrink (its todo row).
- The Import error list and its panel (decision 52).
- The notice stacking (decision 53, the next quick).

## Not verified

The iPhone and the iPad, the sticky hover after a tap on iOS, and VoiceOver. Both engines here are Playwright WebKit and system Chrome, not Mark's devices.

## Deferred Human Verification

No Mark's List rows were filed (this executor has no ArtifactData tool). Suggested checks, served from `npm --prefix app run build && npm --prefix app run preview -- --host`:

- iPhone, a Notebook page, More open: five tiles of one width with the icon over the word. Import and Export have no dark border. A light hairline sits between Search and Import.
- iPhone, on Ingredients: the current tile's grey surface has room around the word.
- iPhone: tap Import (the file picker opens), tap Export (the file is offered), tap the hairline (More closes).
- iPhone with VoiceOver: More's list reads five items, and the hairline is not announced.
- iPad from 724 and the Mac: the header's Import and Export look as before, with no border.

## Deviations from Plan

None to the code or the tests. Two notes on the probe:

- The WebKit right-edge gate fails four times on a pre-existing 0.031 px reading (described at the top). Not loosened.
- I added the diagnostic gate G1b to the probe, described above. It is labelled as mine in the probe's comments.

## Known Stubs

None.

## Threat Flags

None. One static aria-hidden li and five CSS rules; no new input, network or storage surface.

## Self-Check: PASSED

- Files exist: Shell.jsx, shell.css, shell.test.js, Shell.test.jsx, Shell.flyout.test.jsx, the probe, and this SUMMARY.
- Commits exist: 1f604e6, 2908df0, bdbcd5f, 42f5b88 (`git rev-list --count 38f5c52..HEAD` is 4).
- `npm --prefix app test`: 62 files, 1722 tests pass. `git status --porcelain app/` is empty.
- No commit touched `.planning/sketches`, `.planning/canvas-generators`, `.planning/todos`, `.planning/STATE.md` or `.impeccable`.
