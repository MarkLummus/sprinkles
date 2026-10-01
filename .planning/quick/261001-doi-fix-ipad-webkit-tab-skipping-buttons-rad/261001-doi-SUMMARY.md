---
phase: quick-261001-doi
plan: 01
subsystem: ui
tags: [react, accessibility, webkit, keyboard, tabindex, css, playwright]
requires: []
provides:
  - "Every button, radio and checkbox under app/src/ui is an explicit Tab stop (tabIndex={0}); GraduatedRule reads tabIndex ?? 0"
  - "A WebKit and Chromium probe for Tab order, Tab stops per radio group and arrow keys (261001-doi-tab-probe.mjs)"
  - "One token-only .note-block rule giving the tasting note sketch 007's space above the axes, pinned by a CSS test and a notegap probe group"
affects: [batch record pen, plan pen, recipe band, ingredient table, method, axes grid]
requirements-completed: [UX1-01]
actuals:
  tokens: 13000
  tasks: 3
  commits: 3
plan_head_before: 5fb5ba6f3de9e9212506a6c309b6b8f6d3d2ccde
plan_head_after: fe75b892338c3342bf639c6ccc1b952ecf1083f9
key-files:
  created:
    - .planning/quick/261001-doi-fix-ipad-webkit-tab-skipping-buttons-rad/261001-doi-tab-probe.mjs
  modified:
    - app/src/ui/Segmented.jsx
    - app/src/ui/PenFoot.jsx
    - app/src/ui/AxisMark.jsx
    - app/src/ui/Authored.jsx
    - app/src/ui/GraduatedRule.jsx
    - app/src/ui/FoldRow.jsx
    - app/src/ui/RecipeBand.jsx
    - app/src/ui/IngredientTable.jsx
    - app/src/ui/Method.jsx
    - app/src/ui/VersionRow.jsx
    - app/src/ui/BatchRow.jsx
    - app/src/styles/app.css
    - app/src/styles/cross-cutting.test.js
    - .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-batches-probe.mjs
key-decisions:
  - "GraduatedRule reads tabIndex ?? 0: the caller's -1 (recording, developing) keeps the six rules off the tab path; reading now gives them an explicit tabindex"
  - ".note-block takes padding-bottom var(--gap-s) and margin-bottom var(--gap-m): the board's label margin inside the block, line 96's margin outside it"
duration: 13min
completed: 2026-10-01
status: complete
---

# Quick 261001-doi: iPad Tab skipping and the note-to-cue gap Summary

**tabIndex={0} on every button, radio and checkbox under app/src/ui so WebKit Tabs through the whole record pen, plus one token-only `.note-block` rule that restores sketch 007's space between the tasting note and the axes.**

Ran in the main checkout on main (not a worktree). The last `npm --prefix app run build` is from the final source, so the :4173 preview serves the fix to Mark's iPad as it stands.

## Device status: unverified

The iPad result is **device-unverified**. Every WebKit reading below is Playwright's own WebKit 26.6 at 1366 x 1024 with touch, which is evidence about the engine and not about Mark's iPad. Chromium passed Reading A before the fix only because it Tabs to every control unaided; it was never evidence that the app was correct for WebKit. Mark's checklist is at the end.

## Task commits

1. **Task 1 (tracer): Tab from Churn duration to Save batch** - `3ed2711` (fix)
2. **Task 2: every remaining button, radio and checkbox** - `3fb6e6f` (fix)
3. **Task 3: the note keeps the board's space above the axes** - `fe75b89` (fix)

Plan metadata (this SUMMARY, STATE) is left for the orchestrator's docs commit.

## Probe output

### RED, before any source change (build from 5fb5ba6)

WebKit, Reading A, from Churn duration (collapsed): `At the machine`, `Ingredient notes`, `Next time`, then `body` and out of the page into the shell (`Search`, `Import`, `Export`, `Home`, ...). Both radio groups and the Add tasting, Cancel and Save batch buttons absent. Reading B: 0 stops on either group. Reading C: Tab never reached the Exit consistency group within 6 presses. This matches the orchestrator's finding. Probe exit 1, 2 checks failed.

Chromium, Reading A: `radio:segment-exit-consistency`, `radio:segment-airiness-estimated-`, At the machine, Ingredient notes, Next time, Add tasting, Cancel, Save batch. Passed, as the plan required.

### GREEN, after Tasks 1 and 2, and again on the final build

Probe exit 0, 26 checks passed, run on the final build.

WebKit Reading A now reads the same eight as Chromium, in order: Exit consistency radios, Airiness radios, At the machine, Ingredient notes, Next time, Add tasting, Cancel, Save batch.

**Tab stops per radio group (stops, not radios):**

| Group | State | WebKit | Chromium |
|---|---|---|---|
| Exit consistency | nothing picked | 1 | 1 |
| Exit consistency | picked (Wet, soupy) | 1 (plus 1 Clear button) | 1 (plus 1 Clear button) |
| Airiness | nothing picked | 1 | 1 |
| Airiness | Exit picked | 1 | 1 |
| Hardness | nothing picked | 1 | 1 |
| Hardness | 3 picked | 1 (plus 1 Clear button) | 1 (plus 1 Clear button) |

WebKit does **not** count each radio as a stop: a radio group is one stop in both engines, and the explicit tabindex did not change that.

**Arrow keys (ArrowRight, ArrowRight, ArrowLeft)**, in both engines: exactly one radio checked after every press, always the focused one, changing each press.
- Exit consistency: Wet, soupy, Chunky, separated, Wet, soupy.
- Hardness: 2, 3, 2.

**Tasting open (Reading D)**, button and radio stops only, identical in WebKit and Chromium and ending at Save batch: Exit consistency, Airiness, Remove tasting, Hardness, Scoopability, Smoothness, Sweetness, Body, Oil, Coarse icy, Sandy gritty, Gummy elastic, Greasy film, Bitter, Melt style, Cancel, Save batch. The raw span is 27 stops in WebKit and 25 in Chromium: the two extra WebKit stops are text-entry fields (those are dropped from the comparison), not buttons or radios. I did not identify which two; the comparison does not depend on it.

## Gap readings (D-05)

Sketch 007 read (line 34 `label` margin, line 96 `.note-block` margin-bottom, the markup at 249-262). A grep of sketch 008 for `note-block`, `tasting-body` and `axes-cue` finds nothing: **008 draws no note block**, so it cannot disagree with 007.

Measured in a browser before editing, identical at all three combinations:

| | note block to cue | textarea to note-block bottom | textarea to cue |
|---|---|---|---|
| Board (007), 393 coarse / 1366 coarse / 1366 fine | 20 | 17.25 | 37.25 |
| App before | 0 | 3 | 3 |
| App after, same three | 20 | 15 | 35 |

These match the planner's numbers (20, 17.3, 37.3; app 3px), so no STOP condition tripped. After the fix the note-block-to-cue distance equals the board's exactly, and the textarea-to-cue distance reads 2.25px closer than the board. That residual is the two engines' differing strut under an inline-block textarea (the board's label line box against the app's paragraph and textarea); it is named in the plan, left alone, and sits inside the probe's tolerance (no more than 3px closer, 1px farther). The change is one rule, `.note-block { padding-bottom: var(--gap-s); margin-bottom: var(--gap-m); }`, 12 added lines in app.css with its comment, zero deleted, tokens only. This is the two-part reading the orchestrator approved over the brief's one-token description.

## Test and probe counts

- Full suite: **1454 passing** (baseline 1421; 6 new in Task 1, 25 in Task 2, 2 in Task 3; none removed). RED was observed before each source change: Task 1, 8 tests failing (4 Segmented, 4 PenFoot); Task 2, 10 failing across 7 files, then 5 in Method, 4 in VersionRow, 2 of the 5 new BatchRow tests (the other three were already green from Task 1); Task 3, the `.note-block` CSS pin plus all 6 notegap checks.
- `03.5-batches-probe.mjs notegap,keypad 393,1366`: **102 checks passed** (6 notegap at 393 coarse, 1366 coarse, 1366 fine; 96 keypad). No keypad failure.
- `261001-doi-tab-probe.mjs`: 26 checks passed.
- Completeness scan: read 33 offenders at the start of Task 2, prints `all tagged` now.

## What changed

- 39 sites tagged: 34 buttons, 2 radio inputs, 3 checkbox inputs, by inserting `tabIndex={0}` before the first handler prop. Labels, aria attributes, handlers, refs, disabled props and DOM order are unchanged. Shell.jsx, selects, textareas and text inputs untouched.
- Each touched component's test pins the exact tag count with `tabindex="0"` on rendered markup. Method's uses-list checkbox, which `renderToStaticMarkup` cannot reach, is pinned on comment-stripped source text (2 checkbox tags, 9 button tags). Locked ceremony, VersionRow and PenFoot tests assert `disabled=""` beside `tabindex="0"` (T-261001-doi-02).
- Segmented.test.jsx's radio test is retitled to state what holds (one shared name, an explicit tabindex) and makes no claim about Tab stops.
- BatchRow.test.jsx's order test now says DOM order is tab order because every stop carries tabindex 0 and none a positive one, and asserts no positive tabindex.

## Decisions Made

- **GraduatedRule.** Reading mode is now a Tab stop (`tabIndex ?? 0`); recording and developing keep -1, so the six rules stay off the page order there (the sheet's own recording design) but remain clickable. FormulationNote.test.jsx's reading test changed from "no tabindex at all" to 6 `tabindex="0"`; its recording and developing tests are unchanged.
- **.claude/CLAUDE.md was not edited, and no CLAUDE.md was.** Its link convention (every `<a>` carries `tabIndex={0}`) now has a sibling rule in the code for buttons, radios and checkboxes. Mark decides whether to record it.

## Deviations from Plan

None - plan executed exactly as written. Every STOP condition (WebKit launch, RED reproduction, WebKit order after the fix, WebKit reduced list against Chromium's, the board and app numbers) held.

Minor: the plan's Task 2 listed `FoldRow.test.jsx` as two exact-markup updates and `DerivedAdvisories.test.jsx` as two; in practice the suite forced one FoldRow regex plus one concatenated string, two DerivedAdvisories strings, four VersionRow strings, three Bitter strings and two BatchRow fold strings. All were `tabindex="0"` appended, nothing weakened.

## Sites not covered

The one `<select>` in VersionRow.jsx (rendered only with two or more citable batches) was assumed to Tab natively per the brief and was not exercised. The hidden file input in Shell.jsx (tabindex -1 on purpose) and the summary element were not touched.

## Known Stubs

None.

## Threat Flags

None. The change adds a numeric `tabindex` attribute and one CSS rule; no markup injection, no new endpoint, no package install.

## Mark's iPad checklist

1. Hard-reload the :4173 preview first. It serves the rebuilt `app/dist`.
2. Leave Full Keyboard Access off (turning it on has locked the keyboard until a power cycle).
3. Open a recipe's batch, tap Record another, tap Churn duration, press Tab. The focus ring should visit Exit consistency, Airiness, At the machine, Ingredient notes, Next time, Add tasting, Cancel and Save batch, in that order.
4. On an Exit consistency group, use the arrow keys: the selection should move, and Tab should leave the group.
5. Tap Add tasting. The Every recipe cue should sit a clear space below the note field, as on sketch 007. Measured in Chromium (the gap numbers are not a WebKit reading): app 20px from the note block to the cue and 35px from the textarea to the cue, against the board's 20px and 37.25px (the 2.25px difference is the strut residual above).
6. Press Tab through the axes: it should reach each axis group (one stop per group) and each defect chip.

If any of that fails on the device, say which step. The next move is then to measure the real app on the device through the proxy method, not another guess.

## Self-Check: PASSED

- Probe and SUMMARY files exist; the three commits `3ed2711`, `3fb6e6f`, `fe75b89` are on main (`git rev-list --count 5fb5ba6..HEAD` is 3).
- `git diff 5fb5ba6..HEAD --name-only` lists only plan files (app/src/ui, app/src/styles/app.css and cross-cutting.test.js, the two probes); no CLAUDE.md, tokens.css or Shell.jsx. app.css: 12 added, 0 deleted.
- `grep -c "tabIndex ?? 0" app/src/ui/GraduatedRule.jsx` is 1; `grep -c "tabIndex={0}"` is 2 in Segmented.jsx and 4 in PenFoot.jsx; the completeness scan prints `all tagged`.
- Final build is from the final source; both probes and the full suite were run against it.

---
*Quick task: 261001-doi*
*Completed: 2026-10-01*

## Device check

Mark confirmed on his iPad on 2026-10-01: Tab order now reaches the radios and the Add tasting, Cancel and Save batch buttons, and the note-to-"Every recipe" gap reads right. Device-verified by Mark, not by the WebKit probe.
