---
phase: quick-261004-ly5
plan: 01
quick_id: 261004-ly5
subsystem: notebook-styles
tags: [css, hover, hover-is-weight, band-buttons, probe]
requires: ["261004-ly4"]
provides:
  - "Recipe band buttons keep their resting box on :hover and :active"
affects: [app/src/styles/notebook.css, app/src/styles/notebook.test.js]
key-files:
  modified:
    - app/src/styles/notebook.css
    - app/src/styles/notebook.test.js
  created:
    - .planning/quick/261004-ly5-recipe-band-buttons-rename-next-version-and-neighbours-keep/261004-ly5-probe.mjs
    - .planning/quick/261004-ly5-recipe-band-buttons-rename-next-version-and-neighbours-keep/261004-ly5-before.json
decisions:
  - "Hover keeps its weight on the filled and outline actions (2px border, padding 1px less per side); the link gets padding 0 on hover and no new look. app.css is not touched."
requirements: [UX1-01]
status: complete
completed: 2026-10-04
duration: ~25 min
commits: 2
plan_head_before: f80242963d70b66489faa75f9bda0fb723ad91fc
plan_head_after: abd833c2513282c97c4d8a528c154c21994787ef
actuals:
  tokens: 21000
  tasks: 2
  commits: 2
---

# Phase quick-261004-ly5 Plan 01: Band buttons keep their resting width on hover and press Summary

Two top-level `:hover` rules in notebook.css (specificity 0,2,0) take the recipe band's button boxes back from app.css's global `button:hover`, so Rename, Next version, Show changes, the phone's record act and the Rename form's and Next version pen's Cancel and Save hold their width, height and position on hover and while pressed.

## The cause, as measured

Baseline run on a build of the unchanged source (`261004-ly5-before.json`, `prediction: true`): Playwright WebKit (1366 fine, 1366 coarse, 723 fine, 393 coarse) and system Chrome (1366 and 723 fine), Mexican Chocolate v3's batch route, three views (reading, Rename form, Next version pen), every visible button inside `.notebook-band`, each in a fresh page.

**The state that changed the box is `:hover`.** A pressed mouse button is also hovering, so `:active` read the same. `:focus-visible` changed nothing in any cell.

**The rule:** app.css's `button:hover, select:hover` (0,1,1) sets `border-width: var(--rule-hover)` (2px) and `padding: var(--gap-xs)` (6px) on every classed App button. It outranks the single-class rest rules `.notebook-action`, `.notebook-action--outline` and `.notebook-link` (0,1,0). That pair is correct for the Sheet's unclassed buttons.

| Class | Rest padding-left / border-top | Hover and active | Box change from rest (every cell) |
|---|---|---|---|
| `.notebook-action`, `.notebook-action--outline` | 20px / 1px | 6px / 2px | width -26 (2 x (1+20) = 42 down to 2 x (2+6) = 16), height 0 (min-height 44 holds it) |
| `.notebook-link` | 0 / 0 | 6px / 0 | width +12; height +12 on Rename at a fine pointer (a flex-column child that does not stretch), 0 elsewhere and at a coarse pointer |
| fold rows (control group) | 0 | 0 | 0 |
| any button on `:focus-visible` | | | 0 |

The same numbers held in all six cells and all three views: Rename (link), Next version (action from 724 on, link below), Show changes (link), the phone's record act (action), the Rename form's Cancel (outline) and Save (action), the pen's Cancel (outline) and Save as a new version (action). Save over this version did not show in the pen on this route, so it was not measured; it carries the same outline class and the same rule.

Neighbours moved with the changing button: a narrowed action pulls the buttons to its right 26px left.

Tap round trip (coarse), baseline: at WebKit 393, after tapping Rename then Cancel, the button that now sits under the tap point showed the hover box (Record a tasting 128.44 against 154.44 at rest, Next version link shifted 26px left). That is the same rule on a different button: WebKit's emulated pointer stays parked where the finger came down, which is also what a real tap leaves under iOS. The plan predicted no tap reading, so this is recorded as a finding, not a departure. After the fix the round trip returns every button to its resting box.

The todo's other suspect, the filled action's invisible 1px border, is identical in every state. It narrows nothing and is left as is.

## The change as built

RED, `d4a6aa6` `test(261004-ly5)`: a describe block in notebook.test.js, "band buttons keep their resting box on hover and press (quick 261004-ly5; Mark 2026-09-27)", with three tests. It reads tokens.css through `readCustomProperties` and `resolveTokenPx`. The three tests fail with the rules absent and the other 46 pass.

1. Hover and rest border-plus-padding are equal per axis (1 + 12 = 2 + 11 vertical, 1 + 20 = 2 + 19 horizontal), resolved from tokens.
2. `.notebook-link:hover` declares `padding: 0` and no border, decoration, weight, colour or background.
3. Both rules are top-level, each comma part matches `/^\.notebook-[\w-]+:hover$/` (two simple selectors, 0,2,0), and none carries `!important`.

GREEN, `abd833c` `fix(261004-ly5)`: notebook.css, directly after `.notebook-recipe > .notebook-link`:

```css
.notebook-action:hover,
.notebook-action--outline:hover {
  border-width: var(--rule-hover);
  padding: calc(var(--gap-s) + var(--app-rule-row) - var(--rule-hover)) calc(var(--gap-m) + var(--app-rule-row) - var(--rule-hover));
}
.notebook-link:hover {
  padding: 0;
}
```

A comment above them carries Mark's report, the measured numbers and the cascade reason. The commit also holds the probe and the baseline JSON.

After the fix, `node 261004-ly5-probe.mjs after` ran 826 checks and passed in WebKit (fine and coarse) and Chrome:

- Every subject's rect and the band's height equal the rest reading within 0.5 on hover, active and focus-visible, in all 18 cell-and-view combinations.
- Every rest rect equals the baseline.
- Actions read hover border-top 2px against 1px at rest, and hover padding-left 1px under rest.
- Links read padding-left 0 on hover.
- The tap round trips return Rename and Next version to their resting boxes.

## Discretion choice

Hover keeps its weight on the two actions (border to a whole 2px, padding losing exactly that much) rather than flattening to the resting box. It is DESIGN.md's written Hover-Is-Weight Rule, it keeps the outline action's visible thickening that Mark sees today, and the filled action's 2px border is in its own fill colour so it stays invisible. Flattening would remove an existing hover cue, and DESIGN.md line 268 lists App hover states as unresolved and Impeccable's to decide. `.notebook-link` has no border to thicken, so its hover restates padding 0 and adds no look, the way `.text-control:hover` does. Reversible: it is one rule, and flattening later swaps two declarations.

## Show changes and Hide changes widths (informational)

At 1366 the label renames itself by design (decisions_recorded 5), so its width follows its words. This fix does not touch it.

| Engine | Show changes | Hide changes |
|---|---|---|
| WebKit | 97.88 | 104.02 |
| Chrome | 98.02 | 103.27 |

## Suite

`npm --prefix app test`: 59 files, 1601 tests (baseline 1598 at Task 1 Step 1, plus the three new tests, none removed). `npm --prefix app run build` succeeds.

## Deviations from Plan

**1. [Probe scope] The baseline's tap round trip is informational, not a prediction check.**
- **Found during:** Task 1 Step 3.
- **Issue:** My first `before` run counted the tap round trip as a prediction check and exited non-zero on the WebKit 393 reading above. The plan lists no tap reading in its baseline prediction (the tap is an `after` check only), and the reading is the predicted `:hover` rule acting on the button under the tap point, so the cause was the one this plan fixes.
- **Fix:** `before` now logs the tap round trip as a finding and checks only the plan's listed predictions. Re-run: 241 checks passed, `prediction: true`. No `app/` file had been edited at that point.
- **Files modified:** the probe only.

**2. [Probe detail] The mouse is parked at (1, 1) instead of on the h1.** The Rename form replaces the h1, and a fixed corner point keeps every view uniform. Each cell and view asserts that no subject matches `:hover` at rest, so the parking is checked, not assumed.

No other deviations.

## Known Stubs

None.

## Threat Flags

None. The change is two CSS rules. The probe binds only the harness's ephemeral 127.0.0.1 servers, aborts every non-127.0.0.1 request, runs in throwaway contexts, and never touched :4173, :5173 or :8011.

## For Mark's List

The orchestrator writes the row; one deferred device check:

- **Band buttons keep their width on hover and press (261004-ly5).** Hard reload your build preview first.
  - Mac, with the mouse, Mexican Chocolate v3: hover and press Rename, Next version and Show changes. In the Rename form and the Next version pen, hover and press Cancel and Save. None of them changes width or nudges the button beside it, and the outline Cancel still thickens its border on hover.
  - iPad (1366) and iPhone (393): tap Rename then Cancel, and Next version then Cancel. The buttons come back at their own width.
  - It counts as device-verified only when Mark confirms.

Every reading above comes from Playwright WebKit and system Chrome on the Mac, not from Mark's devices. Rebuilding `app/dist` already updates what his :4173 preview serves; that preview was not started, stopped or requested. The todo `.planning/todos/pending/2026-09-27-band-buttons-narrow-on-hover-or-click.md` stays in pending until Mark confirms.

## Self-Check: PASSED

- FOUND: app/src/styles/notebook.css, app/src/styles/notebook.test.js, 261004-ly5-probe.mjs, 261004-ly5-before.json
- FOUND commits: d4a6aa6 (test), abd833c (fix)
- `git status --porcelain app/` empty; the 261004-ly5 commits touch only notebook.css and notebook.test.js under `app/`, and nothing under `.planning/sketches`, `.planning/canvas-generators` or DESIGN.md.
