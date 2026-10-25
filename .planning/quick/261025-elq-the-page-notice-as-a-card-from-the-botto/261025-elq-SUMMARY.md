---
phase: quick-261025-elq
plan: 01
quick_id: 261025-elq
subsystem: ui-styling
tags: [page-notice, css, tokens, webkit-probe, app-skin]
status: complete
requirements: [decide-page-notice-shape, look-page-notice-card-page-styling, bug-save-notice-covers-title-393]
commits: 2
plan_head_before: e0257f676a927b00a08ae8ed0843737811c03333
plan_head_after: 95a6a6dcc6b0ab6d1a676afd7bbee2516e61bc39
key-files:
  created:
    - .planning/quick/261025-elq-the-page-notice-as-a-card-from-the-botto/261025-elq-notice-probe.mjs
  modified:
    - app/src/styles/tokens.css
    - app/src/styles/app.css
    - app/src/styles/cross-cutting.test.js
    - DESIGN.md
    - .planning/sketches/013-creation-editor/README.md
actuals:
  tasks: 2
  commits: 2
---

# Phase quick-261025-elq Plan 01: The page notice as a card from the bottom edge Summary

The page notice is now a 16px card in the App's skin (white ground, App text, divider hairline, 10px radius, new `--app-shadow-notice`), centred 20px above the window's foot (above the tab row below 724), anchored to a zero-height fixed box; the WebKit probe ends `195 PASS, 0 FAIL` against the board's BS record.

## Commits

- `060f0843` fix(261025-elq): the page notice is a card from the bottom edge in the App's skin with a shadow (decide-page-notice-shape BS; closes bug-save-notice-covers-title-393): tokens.css, app.css, cross-cutting.test.js, the probe
- `95a6a6dc` docs(261025-elq): DESIGN.md's page notice and Elevation & Depth name the card from the bottom edge; sketch 013 decision 23 superseded (decide-page-notice-shape BS): DESIGN.md, sketch 013 README

## What changed

- tokens.css: one token, `--app-shadow-notice: 0 4px 16px rgba(20, 20, 20, 0.18)` after `--app-shadow-flyout`, with the proposal's comment. The `--gap-page` comment's notice clause corrected (comment only; no value moved).
- app.css: `.page-status-anchor` is `position: fixed; inset-block: auto 0; inset-inline: 0`; `.page-status` is the card per the proposal's revised item 3; `.page-status:empty` gains `box-shadow: none`; the phone-forms block's last rule is now `.page-status { inset-block-end: calc(var(--app-size-tab-h) + var(--gap-m)); }`; the three comments name the new place and cite the proposal. The print rule is byte-identical.
- cross-cutting.test.js: five tests rewritten (phone-forms list, placement, anchor, four boxes, skin including the token value pin), one loosened by a filter (13px helper test). No test added or removed.
- No file under app/src/ui, router.jsx, main.jsx, shell.css or print.css changed (verified by the file list of `git diff --name-only e0257f67 HEAD`).

## Probe (261025-elq-notice-probe.mjs)

Base (before the change): `104 PASS, 91 FAIL`. After: `195 PASS, 0 FAIL`. Scratch build of this worktree, served on an ephemeral 127.0.0.1 port; Playwright WebKit, hasTouch, isMobile below 724, deviceScaleFactor 1.

Boxes are [x, y, w x h]. Skin in every shown state equals the BS record: 16px on 24px, padding 12px 20px, rgb(255, 255, 255) on rgb(20, 20, 20), 1px rgb(214, 218, 215), radius 10px, shadow rgba(20, 20, 20, 0.18) 0px 4px 16px 0px. Landing and at the top are identical in box in every scenario.

| Width | Scenario | Box | scrollY at landing |
|---|---|---|---|
| 1366 | S-mc (Save batch, Mexican Chocolate v1), "recorded 25 Oct 2026" | [581.1, 954, 203.7 x 50] | 0 |
| 1366 | S-oo (Olive Oil v1) | [581.1, 954, 203.7 x 50] | 0 |
| 1366 | R-mc (Import refused, record pen open) | [527.1, 954, 311.8 x 50] | 0 |
| 1366 | R-new (creation editor) | [497.5, 954, 370.9 x 50] | 0 |
| 393 | S-mc | [94.6, 726, 203.7 x 50] | 1142 |
| 393 | S-oo | [94.6, 726, 203.7 x 50] | 2886 |
| 393 | R-mc (More, then Import) | [40.6, 726, 311.8 x 50] | 0 |

Empty state: 0 x 0, border-top-width 0px, box-shadow none; the anchor is fixed, height 0, at [0, 1024, 1366, 0] and [0, 852, 393, 0]. After each save the notice cleared itself within 6.5 s and the empty shape held. The card overlapped neither the bar, the tab row, the recipe name nor the focused element in any scenario, landing or at the top.

Covered elements (INFO):

- 1366 S-mc: ingredient-table numeric cells "0.1%" and "8.5%", Sweetness POD figure, "no target set", Fat figure (graduated-rule).
- 1366 S-oo: exactly the board's six (TD numeric x2, BUTTON.graduated-rule Fat, SPAN, SPAN.graduated-rule__deviation, P.formulation-note__fat-breakdown), landing and at the top (gated equal by tag and class).
- 1366 R-mc: Fructose and Dried Skimmed Milk Powder name cells, "4.9%", Fat graduated-rule and its basis line.
- 1366 R-new: nothing.
- 393 S-mc: landing, the log's own DD "25 Oct 2026"; at the top, the Sucrose and Dextrose name cells.
- 393 S-oo: landing, the log's own DD; at the top, P.headnote__prose (equal to the board's atTop record).
- 393 R-mc: Cocoa Powder name cell, one INPUT.ink-field (43.4 x 26.7, the as-made grams field), "50 g" plan grams, Sucrose name cell, "6.3%".

## Tests and walk

- cross-cutting.test.js: 91 passed; the five rewritten tests were seen failing at base, and all 381 tests in `src/styles/` are green.
- Full suite: 3734 passed in 120 files, equal to the base count.
- Strict walk: `MATCH 94 snapshots`; 10-walk-before.json is unchanged.
- Negative and positive greps: token line 1 (baseline 0); "zero-height sticky box" 0 in app.css and 0 in DESIGN.md; "Three things float" 1; Sheet-Is-Flat parenthetical 1; decision 23 supersession 1; DESIGN.md 688 lines and the README 96 lines.

## Deviations from Plan

- **Wording, DESIGN.md Elevation & Depth:** the plan said to adjust the count word to match; "Two things float" became "Three things float" (the fly-out panel, the scrim, the notice card), and the card is described as the second floater that casts a shadow. Not a rule deviation.
- **Probe shape:** the E (empty) gates run inside the save scenarios, right after the record pen opens and before Save batch, rather than as a separate load-only scenario; both give the same empty shape on the same route.
- Otherwise none; the plan was executed as written.

## Known Stubs

None.

## Threat Flags

None. No new endpoint, auth path or markup path; the probe aborts every non-127.0.0.1 request.

## For the orchestrator

(The executor has no ArtifactData and wrote no Mark's List row.)

- Close `bug-save-notice-covers-title-393` and `look-page-notice-card-page-styling`, and `decide-page-notice-shape` if it is still open.
- Device check for Mark (iPad at 1366 coarse, iPhone at 393), the steps the probe walked: open Mexican Chocolate v1, press Record, press Save batch; then with the record pen open, press Import (the bar on the iPad; More, then Import on the iPhone). Two things to look at: the card 20px above the tab row on the iPhone, and the fixed card while the iOS keyboard is up.

## For Mark

- At 393, the Import refusal with the record pen open puts the card over part of an as-made field (the Cocoa Powder grams INPUT, 43.4 x 26.7) for its five seconds.
- The 5 s hold is unchanged, as the change set keeps it, and the proposal's question of 6 s got no answer.

## Follow-ups

- For /impeccable document: DESIGN.md line 472 (the page gutter paragraph still says "the save notice's left edge") and line 540 (the App radius list does not name the notice).
- For Sid: the Notebook and creation boards that still draw the notice under the bar.

## Deferred Human Verification

Verified in WebKit on the Mac only, not on Mark's iPad or iPhone.

## Self-Check: PASSED

- Probe file, app.css, tokens.css, cross-cutting.test.js, DESIGN.md and the sketch README exist and carry the commits above; `git rev-list --count e0257f67..HEAD` is 2.
