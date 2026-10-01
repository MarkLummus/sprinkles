---
phase: quick-261001-den
plan: 01
quick_id: 261001-den
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/ui/RecipeHistory.jsx
  - app/src/ui/RecipeHistory.test.jsx
  - app/src/styles/notebook.css
  - app/src/styles/notebook.test.js
  - app/src/styles/tokens.test.js
  - .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-band-probe.mjs
autonomous: true
requirements: [UX1-03]

estimate:
  tokens: 45000
  raw_tokens: 45000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "From 1366 up, the History rail's gray line runs from the first mark's centre to the last mark's centre whatever width the browser gives the strip. The track's length is arithmetic from the entry count and the node tokens: (count - 1) x (node width + node gap). The track's left edge is unchanged and the track has no right edge declaration (D-01)."
    - "RecipeHistory.jsx puts the entry count, the draft node included, on the strip as the inline custom property --app-notebook-history-count, rendered exactly (strip opening tag with style=\"--app-notebook-history-count:N\"). It is a layout count, not a visual value; tokens.css is untouched (D-01, D-02)."
    - "Nothing else moves: node positions, every token, the left fade, the scroll-to-view effect and the upright rail keep their CSS and markup. The diff under app/ touches five files: RecipeHistory.jsx, RecipeHistory.test.jsx, notebook.css, notebook.test.js, tokens.test.js (D-02)."
    - "The band probe fails when the track's right edge is more than 1px from the last mark's centre: the rail group's two existing assertions stay at 1px, the history group gains the same assertions at three entries, and a new check narrows the strip by one node gap per join (the hypothesised WebKit shortfall) and still requires the track to end at the last mark's centre. That check fails on the pre-fix build and passes on the fixed one (D-03)."
    - "The SUMMARY says plainly that the iPad result is device-unverified: no WebKit was available, Chromium cannot reproduce the symptom unaided, the cause is the planner's hypothesis, and Mark's iPad check is still owed (D-04)."
  artifacts:
    - path: app/src/ui/RecipeHistory.jsx
      provides: "the strip's inline --app-notebook-history-count, from entries.length"
      contains: "--app-notebook-history-count"
    - path: app/src/styles/notebook.css
      provides: "the track's width from the count and the node tokens; no right edge"
      contains: "var(--app-notebook-history-count)"
    - path: app/src/ui/RecipeHistory.test.jsx
      provides: "the count variable pinned on rendered markup, exact, at two, three and draft-included entries"
      contains: "--app-notebook-history-count"
    - path: app/src/styles/notebook.test.js
      provides: "the track's left, width formula and absent right pinned"
      contains: "--app-notebook-history-node-gap"
    - path: app/src/styles/tokens.test.js
      provides: "the count named as the one custom property set inline, so the unresolved-token gate stays honest"
      contains: "--app-notebook-history-count"
    - path: .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-band-probe.mjs
      provides: "short-strip and three-entry track checks; the fade reading keeps the count in step with its clones"
      contains: "--app-notebook-history-count"
  key_links:
    - from: app/src/ui/RecipeHistory.jsx
      to: app/src/styles/notebook.css
      via: "the strip's inline --app-notebook-history-count, read by the track's width calc"
      pattern: "--app-notebook-history-count"
    - from: app/src/styles/notebook.css
      to: app/src/styles/tokens.css
      via: "the track's width reads --app-notebook-history-node-w and --app-notebook-history-node-gap, the tokens the nodes themselves read"
      pattern: "--app-notebook-history-node-gap"
    - from: app/src/styles/tokens.test.js
      to: app/src/styles/notebook.css
      via: "LOCALLY_SET_CUSTOM_PROPERTIES names the count so the every-var-resolves gate accepts the track's read"
      pattern: "LOCALLY_SET_CUSTOM_PROPERTIES"
    - from: .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-band-probe.mjs
      to: .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs
      via: "imports the harness unchanged; startServers serves the checkout's app/dist on ephemeral 127.0.0.1 ports"
      pattern: "03.5-probe-harness.mjs"
---

<objective>
Make the History rail's gray line span every version on Mark's iPad in landscape (WebKit, wide touch, rail drawn horizontally from 1366), where today it stops shortly after the third mark of a four-version history.

**The defect.** `.notebook-history__track` (app/src/styles/notebook.css) is positioned from the strip's left and right edges, and the strip is `width: max-content`. The probable WebKit divergence (unverified, there is no WebKit here): the strip's intrinsic width leaves out the flex `gap` between nodes (`--app-notebook-history-node-gap`, 24px), so the strip, and the track measured from its right edge, comes out 24px x (N-1) short while the nodes still overflow it visibly. Four versions: 72px short, so the line ends between the third and fourth marks. Plan 03.5-24's probes (G-03.5-5) pass because Chromium includes the gap.

**The fix (D-01).** Make the track's length independent of intrinsic sizing. RecipeHistory.jsx passes the entry count on the strip as a CSS custom property; notebook.css sizes the track by arithmetic from the tokens the nodes use. The track keeps its `left` (the node list's padding plus half a mark) and loses `right`.

## Decisions

- **D-01** (orchestrator brief, 2026-10-01). Pass `entries.length` from RecipeHistory.jsx as `--app-notebook-history-count` on `.notebook-history__strip` (a layout count, not a visual value). Size `.notebook-history__track` as width = (count - 1) x (node width + node gap), from the first mark's centre to the last mark's centre, `left` unchanged (gap-xs + mark / 2), no `right`.
- **D-02** (orchestrator brief). Do not change node positions, tokens (tokens.css is untouched), the fade, the scroll-to-view effect or the upright rail.
- **D-03** (orchestrator brief). Pin it: a RecipeHistory test on rendered markup (the count variable, exact), and the band probe's track check at 1366 and 1920 passes with the track end equal to the last mark's centre. The probe's assertion fails when the track's right edge is more than 1px from the last mark's centre.
- **D-04** (orchestrator brief). The iPad result is device-unverified until Mark checks it, and the SUMMARY says so plainly.

## Planner's readings (taken 2026-10-01, before any edit)

- The probe's existing track assertions already fail beyond 1px: the rail group's `Math.abs(extent.rightToLastMark) <= 1` and the fade reading's `Math.abs(fadeReading.trackRightToLastMark) <= 1`. Leave both at 1px. They live in the `rail` group (widths 1366 and 1920, two entries), not the `history` group, which has no track check today. This plan adds one to the `history` group (three entries) so both groups cover it.
- The rail group's forced-overflow fade check clones ten nodes into the `<ol>` outside React and then requires the track to end at the last (cloned) mark's centre. Once the track is sized from the count, those clones are not counted and the check would fail by about 1920px, so the probe must set the count to the node total after cloning, as React would render it. React does not rewrite the strip's style on the scroll-driven re-render because the style value is unchanged.
- A Chromium run cannot catch this defect by itself, so Task 2 reproduces the hypothesised shortfall in the probe: narrow the strip by one node gap per join, then require the track to still end at the last mark's centre. That check fails against the old right-edge CSS and passes against the fix.
- tokens.test.js's unresolved-token gate (`every var() read resolves to a declared token`) would reject notebook.css reading a property no stylesheet declares. Its `LOCALLY_SET_CUSTOM_PROPERTIES` set is the documented place for a property set inline from JSX, so the count goes there. No `--app-*` token is added to tokens.css.
- The existing strip-structure test in RecipeHistory.test.jsx matches the strip's opening tag with no attributes; it must change with the markup.

## Coverage audit

- GOAL: the History rail's line reaches the last mark on the iPad. Covered by Task 1 (the fix), Task 2 (probe pins), the SUMMARY's device-unverified statement.
- REQ: UX1-03 (the build constraint the sibling gap plan 03.5-24 carried). Task 1.
- RESEARCH: none for this quick task.
- CONTEXT: D-01 Task 1; D-02 Task 1 (scope held) and the diff check in Verification; D-03 Tasks 1 and 2; D-04 Task 2's SUMMARY step.

Purpose: a maker with four or more versions sees the History rail drawn complete on the iPad, and the probe can now see this class of defect.

Output: the count variable and arithmetic track, their pins, a sharper probe, a rebuilt app/dist for Mark's iPad check, and a SUMMARY that is honest about what is and is not verified.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@./CLAUDE.md
@./.claude/CLAUDE.md
@.planning/STATE.md
@app/src/ui/RecipeHistory.jsx
@app/src/ui/RecipeHistory.test.jsx
@app/src/styles/notebook.css
@app/src/styles/notebook.test.js
@app/src/styles/tokens.test.js
@.planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-band-probe.mjs
@.planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs

<environment>
- Node is already on PATH (v24). Tests: `npm --prefix app test -- --run`, baseline 1417 passing. Build: `npm --prefix app run build` (a one-shot `vite build`, not a server).
- The harness (03.5-probe-harness.mjs) serves the checkout's own app/dist on ephemeral 127.0.0.1 ports and closes them itself. Reuse it unchanged. Never start `vite`, `vite dev` or `vite preview`. A dev server (pid 11248) and a preview server (pid 68288, port 4173) are already running and are not yours: do not stop, restart or probe them. The preview serves app/dist from disk, so a rebuild here is how the fix reaches Mark's iPad.
- Probe command, from the checkout root: `node .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-band-probe.mjs <groups> <widths>`.
- Run this in the main checkout and commit on main. Stage only the files this plan names, by path: the untracked `.impeccable/critique/` files in the working tree are not part of this work. Every commit message is English and ends with these two lines: `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` and `Claude-Session: https://claude.ai/code/session_01WeaQszVGJ9FPrW4pPwpmYE`. Do not push.
- If this turns out to be a worktree rather than the main checkout, say so in the SUMMARY's first lines: after merging, the orchestrator must run `npm --prefix app run build` in the main checkout, because the preview serves the main checkout's app/dist.
</environment>

<interfaces>
Geometry the arithmetic relies on (all from app/src/styles/notebook.css and tokens.css, read at planning time):
- `.notebook-history__nodes` is a flex row with `gap: var(--app-notebook-history-node-gap)` (24px), `padding: 0 var(--gap-xs)` (6px each side) and `min-width: max-content`. Each `.notebook-history__node` is `flex: 0 0 var(--app-notebook-history-node-w)` (168px). The mark (`--app-notebook-history-mark-size`, 12px) is the second grid row of the node and starts at the node's left edge.
- Mark i's centre sits at gap-xs + i x (node width + node gap) + mark / 2 from the strip's left. So the first mark's centre is the track's existing `left`, and the last mark's centre is `left` + (count - 1) x (node width + node gap). The track's `width` is that second term.
- The strip is `position: relative; width: max-content` and stays so. The track's `top`, `height` and `background` stay as they are.

Probe helpers already in 03.5-band-probe.mjs: `readAppRailTrackExtent(page)` returns `{ markCount, leftToFirstMark, rightToLastMark }` (track edges against mark centres); `readRailFadeReading(page)` clones ten nodes, scrolls the rail and returns `trackRightToLastMark`; `countedCheck(condition, label)` and `saveNextVersion(page, label)` come from main()'s scope and the harness.
</interfaces>
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Tracer: the track's length from the entry count, one path from JSX to a real render (D-01, D-02, D-03)</name>
  <files>app/src/ui/RecipeHistory.test.jsx, app/src/styles/notebook.test.js, app/src/ui/RecipeHistory.jsx, app/src/styles/notebook.css, app/src/styles/tokens.test.js</files>
  <read_first>app/src/ui/RecipeHistory.jsx (the strip at lines 112-114), app/src/ui/RecipeHistory.test.jsx (lines 83-99, the strip-structure test), app/src/styles/notebook.css (lines 431-455, the rail, strip and track rules), app/src/styles/notebook.test.js (lines 212-235, the "line runs first node to last" block), app/src/styles/tokens.test.js (lines 21-27 and 70-77, LOCALLY_SET_CUSTOM_PROPERTIES and the unresolved-token gate)</read_first>
  <behavior>
    - RecipeHistory, horizontal arrangement (belowDesktop false), two entries (root and successor): the strip's opening tag is exactly `<div class="notebook-history__strip" style="--app-notebook-history-count:2">`.
    - Three saved versions: the same tag with `:3`. Two saved versions with openPen `plan` and a draft: the same tag with `:3` (the draft node is an entry and a node).
    - belowDesktop true (the upright arrangement) and the lone-version one-line state: the markup does not contain `--app-notebook-history-count`.
    - The existing strip-structure test still pins the order, track first and then the node list, and no fade at rest, now with the strip's style attribute in the expected tag.
    - notebook.css: the top-level `.notebook-history__track` rule keeps `left: calc(var(--gap-xs) + var(--app-notebook-history-mark-size) / 2)`; its `width` is `calc((var(--app-notebook-history-count) - 1) * (var(--app-notebook-history-node-w) + var(--app-notebook-history-node-gap)))`; its declarations contain no `right` declaration. The strip rule (position relative, width max-content) and the nodes rule (padding, no z-index anywhere in the history rules) are unchanged.
    - tokens.test.js: the unresolved-token gate passes with the count named as the one locally set property.
  </behavior>
  <action>
    Work from the checkout root.

    Step 0, pin the starting point. Run `git rev-parse HEAD` before any edit and write the sha down as PRE (in the SUMMARY's working notes). Task 2's RED build and the diff checks below use it; a relative anchor would name whatever another session committed last.

    Step 1, RED. In app/src/ui/RecipeHistory.test.jsx, change the strip-structure test's expected opening tag to include the strip's `style` attribute with the count 2, then add a describe block named for this quick task ("RecipeHistory: the rail's entry count (261001-den)") holding the other behavior cases. Extract the strip tag with a regular expression on `<div class="notebook-history__strip"[^>]*>` and compare it with `toBe` against the exact string, so the count is pinned exactly and not by a loose match. In app/src/styles/notebook.test.js, replace the track test in the "line runs first node to last" block: keep its left assertion, replace the right assertion with the width formula above (escape the parentheses and the multiplication sign in the regular expression), and assert the track's declarations do not match a `right` declaration (anchor it on start-of-string or a space or semicolon before `right`, so `left` and `top` cannot match). Retitle that test to say the track's width runs one node-plus-gap step per join from the entry count. Leave the strip and nodes tests in that block alone. Run `npm --prefix app test -- --run src/ui/RecipeHistory.test.jsx src/styles/notebook.test.js`: it MUST fail on the count markup and on the width. Commit the RED tests with a `test(261001-den): ...` message ending with the two trailer lines.

    Step 2, GREEN (per D-01, D-02). In app/src/ui/RecipeHistory.jsx, give `div.notebook-history__strip` a `style` prop with one key, `'--app-notebook-history-count'`, valued `String(entries.length)` (a string, so no unit can be appended). Add one short comment beside it in the file's voice: it is a layout count, not a visual value, and notebook.css reads it so the track's length never depends on the strip's intrinsic width. Change nothing else in the file: the scroll effect, the fade and the upright branch stay exactly as they are.

    In app/src/styles/notebook.css, edit the `.notebook-history__track` rule only: keep `position`, `left`, `top`, `height` and `background`; delete the `right` declaration; add `width` reading `calc((var(--app-notebook-history-count) - 1) * (var(--app-notebook-history-node-w) + var(--app-notebook-history-node-gap)))`. Rewrite the comment above the rule: the line runs from the first mark's centre to the last mark's centre; its length is one node width plus one node gap per join, taken from the entry count RecipeHistory.jsx sets on the strip, because a browser may leave the node gap out of the strip's max-content width and a right edge measured from the strip then falls short by one gap per join (Mark's iPad, 2026-10-01, the line stopped after the third of four marks). Do not touch the strip rule, the nodes rule or the fade rule, and add no literal: the only bare number is the count's `1`.

    In app/src/styles/tokens.test.js, add `'--app-notebook-history-count'` to `LOCALLY_SET_CUSTOM_PROPERTIES` and rewrite the comment above it, whose first sentence ("No custom property is set inline via React's style prop any more") is no longer true: RecipeHistory.jsx sets the entry count inline, a layout count read by notebook.css's track width (261001-den), so it has no declaration in tokens.css by design. Do not add the name to tokens.css and do not edit any other test in that file.

    Run the two touched test files (green), then the full suite (green), then `npm --prefix app run build`, then the probe's rail group at 1920 (the existing real-render check: the track's left and right edges at the first and last mark's centres, and the board comparison). Run width 1920 only here: the rail group's 1366 pass includes the forced-overflow fade check, whose clones the count does not know about until Task 2 adapts it. Commit the GREEN changes with a `fix(261001-den): ...` message ending with the two trailer lines, staging the five files by path.
  </action>
  <verify>
    <automated>npm --prefix app test -- --run && npm --prefix app run build && node .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-band-probe.mjs rail 1920</automated>
  </verify>
  <acceptance_criteria>
    - Before the source change, the two touched test files fail on the count markup and the width formula (RED, recorded for the SUMMARY); afterwards the full suite passes with no test removed, so the total is 1417 plus the new tests.
    - `grep -c "app-notebook-history-count" app/src/ui/RecipeHistory.jsx` prints at least 1, and the same grep on app/src/styles/notebook.css prints at least 1; `git diff --stat PRE..HEAD -- app/src/styles/tokens.css` is empty (tokens.css untouched), PRE being the sha recorded in step 0.
    - `node .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-band-probe.mjs rail 1920` exits 0 against the fresh build.
    - `git diff --name-only PRE..HEAD -- app` lists exactly the five files in this task's `<files>`.
  </acceptance_criteria>
  <done>At 1920 in a real render of the rebuilt app the rail's track ends at the last mark's centre, with the track's length coming from the entry count and the node tokens instead of the strip's width. The count and the width are pinned on rendered markup and source text, the unresolved-token gate is satisfied through its documented exception, and RED and GREEN are committed.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Make the band probe able to see a short strip, prove it fails on the pre-fix build, then pass the lot (D-03, D-04)</name>
  <files>.planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-band-probe.mjs</files>
  <read_first>.planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-band-probe.mjs (lines 106-124 readAppRailTrackExtent, 162-219 readRailFadeReading, 515-574 the rail group, 680-690 the history group's open branch)</read_first>
  <behavior>
    - readRailFadeReading: after appending the ten clones, the strip's `--app-notebook-history-count` is set to the node list's child count, so the existing assertion (`Math.abs(fadeReading.trackRightToLastMark) <= 1`) keeps meaning "the track ends at the last mark's centre with the rail forced to overflow".
    - A new reader narrows `.notebook-history__strip` by one node gap per join (gap read from the node list's computed column gap, joins = mark count - 1), reads the track's left and right edges against the first and last mark's centres, and restores the strip's width before returning.
    - Rail group at 1366 and 1920 (two marks): with the strip narrowed, `Math.abs(rightToLastMark) <= 1` and `Math.abs(leftToFirstMark) <= 1`, each check labelled with its measured offset.
    - History group at 1366 and 1920 (three marks, in the open branch beside the node-count check): `readAppRailTrackExtent` gives markCount 3 with `Math.abs(leftToFirstMark) <= 1` and `Math.abs(rightToLastMark) <= 1`; and the narrowed-strip reading gives `Math.abs(rightToLastMark) <= 1`.
    - The rail group's two existing 1px assertions (extent.rightToLastMark and the fade reading's trackRightToLastMark) are not loosened and not removed.
  </behavior>
  <action>
    Work from the checkout root. Reuse the harness unchanged and add no new import to the probe.

    Step 1, edit the probe (per D-03). In `readRailFadeReading`, right after the clone loop, read `.notebook-history__strip`, set its `--app-notebook-history-count` custom property to `String(list.children.length)` with `style.setProperty`, and add a comment: the clones stand in for real entries, the track is sized from the count React renders, so the count follows the clones; React leaves it alone on the scroll re-render because its own style value has not changed. Add `readRailTrackShortStrip(page)` beside `readAppRailTrackExtent`, per the behavior block, returning `{ markCount, gap, leftToFirstMark, rightToLastMark }`, with a comment that it reproduces what a browser draws when it leaves the node gap out of the strip's max-content width (Mark's iPad, 2026-10-01). Add the rail group's short-strip checks after the existing extent checks (inside the same `if (extent)` flow, before the board comparison), and the history group's three-entry extent and short-strip checks inside `if (expectedOpen)` after the node-count check. Add a short note to the probe's header comment naming 261001-den and what the new checks guard. Do not edit the existing 1px assertions.

    Step 2, RED on the pre-fix build. The pre-fix revision is PRE, the sha Task 1's step 0 recorded (if it was lost, it is the parent of Task 1's RED commit, which `git log --oneline` shows). Restore the two source files that carry the fix from PRE: `git checkout PRE -- app/src/ui/RecipeHistory.jsx app/src/styles/notebook.css`. Run `npm --prefix app run build`, then `node .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-band-probe.mjs rail,history 1366,1920`. It MUST exit 1 with the short-strip checks failing (the track's right edge about one gap per join short: 24px at two marks, 48px at three) and every other check passing, the 1px assertions included, since Chromium includes the gap unaided. If anything else fails, stop and report it. Record the failing lines as RED in the SUMMARY.

    Step 3, GREEN. Restore the fix: `git checkout HEAD -- app/src/ui/RecipeHistory.jsx app/src/styles/notebook.css`, then confirm `git diff --stat HEAD -- app/src` prints nothing. Rebuild with `npm --prefix app run build` (the final app/dist must be built from the fixed source, since it is what Mark's iPad reads from the :4173 preview) and re-run `rail,history 1366,1920`: exit 0. Then run the wider regression once, `rail,history,folds,rhythm` at `393,723,1024,1365,1366,1920` (plan 03.5-24 recorded 630 checks for it; allow a few minutes): exit 0. A failure outside the rail and history track checks is reported in the SUMMARY, not fixed here, after confirming it also fails on the pre-fix build. Commit the probe with a `test(261001-den): ...` message ending with the two trailer lines, staging only the probe by path.

    Step 4, the SUMMARY (D-04). Write `.planning/quick/261001-den-fix-history-rail-line-span-on-webkit-tra/261001-den-SUMMARY.md` with the RED output from Task 1 and from step 2 above, the GREEN outputs, the full-suite count, and the check count of the wider probe run. State plainly, in its own short section near the top, that the iPad result is device-unverified: there is no WebKit in this environment; Chromium passed before the fix and cannot show the symptom unaided; the cause (WebKit leaving the node gap out of the strip's max-content width) is the planner's hypothesis; the probe's narrowed-strip check reproduces the hypothesised shortfall in Chromium and shows the fix survives it, which is evidence about the fix and not about the iPad. Name what Mark checks on the device: iPad in landscape, a recipe with four versions, hard-reload the :4173 preview first, and the gray line should end at the fourth mark's centre with no change to node positions, the fade or scroll-to-view. If the line still stops short there, the hypothesis is wrong and the next step is to measure the real app on the device through the proxy method rather than another guess.
  </action>
  <verify>
    <automated>npm --prefix app test -- --run && npm --prefix app run build && node .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-band-probe.mjs rail,history 1366,1920</automated>
    <human-check>Deferred to Mark's end-of-quick device check, once app/dist is rebuilt from the fix. On the iPad in landscape, open a recipe with four versions from the :4173 preview after a hard reload. The gray History line runs from the first mark to the fourth mark's centre; node positions, the left fade and scrolling to the version in view look as before.</human-check>
  </verify>
  <acceptance_criteria>
    - The RED run on the pre-fix build exits 1 with only the short-strip checks failing, and the GREEN run on the fixed build exits 0; both outputs are in the SUMMARY.
    - `grep -c "app-notebook-history-count" .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-band-probe.mjs` prints at least 2 (the fade reading and the short-strip reader), and the rail group's existing assertions still read `<= 1`.
    - `grep -l "app-notebook-history-count" app/dist/assets/*.css app/dist/assets/*.js` lists a CSS asset and a JS asset: the final build carries the fix.
    - `git status --short app` is empty after the restore, and the wider probe run `rail,history,folds,rhythm 393,723,1024,1365,1366,1920` exits 0 (or any unrelated failure is named in the SUMMARY with proof it predates the fix).
    - The SUMMARY has the device-unverified section and the iPad checklist.
  </acceptance_criteria>
  <done>The probe fails when the track's right edge is more than 1px from the last mark's centre at two and at three entries, and fails on the pre-fix build when the strip is one gap per join short. It passes on the fixed build, which is the one now in app/dist. The SUMMARY records RED and GREEN and states that the iPad result is device-unverified.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| probe to local network | The harness opens two ephemeral static servers to serve app/dist and the repo to headless Chrome |
| measured page to third parties | A measured page could fetch off-machine assets (fonts) |
| app data to markup | The new inline custom property is built in JSX from `entries.length` |

## STRIDE Threat Register

Threat IDs are unique within a phase; this quick task numbers its own, `T-qden-NN`.

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-qden-01 | Information disclosure | 03.5-probe-harness.mjs startServers | low | mitigate | Reuse the harness unchanged: it binds 127.0.0.1 on port 0 only and closes both servers in finish and finally. No second Vite process is started; the running dev and preview servers are not touched. |
| T-qden-02 | Information disclosure | measured page requests | low | mitigate | The harness's blockThirdPartyRequests aborts every request whose host is not 127.0.0.1; the probe reaches every page through openApp and openBoard, which install it. |
| T-qden-03 | Tampering | the strip's inline `--app-notebook-history-count` | low | accept | The value is `String(entries.length)`, a number from the app's own record list, never maker text, and it is set through React's style prop as a custom property, so no markup is built from data. The convention against `dangerouslySetInnerHTML` is untouched. |
| T-qden-04 | Denial of service | Mark's :4173 preview | low | mitigate | `vite build` only rewrites app/dist, the intended hand-off for the iPad check. The preview process is never stopped or restarted. |
| T-qden-SC | Tampering | npm/pip/cargo installs | low | accept | No package is installed. playwright-core is the path the harness already imports; if it is missing the executor stops rather than installing. |
</threat_model>

<verification>
- `npm --prefix app test -- --run` passes: 1417 plus the new tests, none removed.
- `node .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-band-probe.mjs rail,history 1366,1920`, against a fresh `npm --prefix app run build` of the fixed source, exits 0.
- The same command against the pre-fix source exits 1 on the short-strip checks only (RED, in the SUMMARY).
- `git diff --name-only PRE..HEAD -- app` (PRE as recorded in Task 1's step 0) lists exactly RecipeHistory.jsx, RecipeHistory.test.jsx, notebook.css, notebook.test.js and tokens.test.js; tokens.css, the upright rail's markup and CSS, the fade rule and the scroll effect are unchanged (D-02).
- No commit is pushed; each carries the two trailer lines.
</verification>

<success_criteria>
- The History rail's track is sized by arithmetic from the entry count and the nodes' own tokens, so its length no longer depends on the strip's intrinsic width (D-01).
- Node positions, tokens, the fade, the scroll-to-view effect and the upright rail are unchanged (D-02).
- The count variable is pinned exactly on rendered markup, the track's formula is pinned on source text, and the band probe checks the track's end against the last mark's centre at 1px at two and three entries and under a short strip (D-03).
- app/dist is rebuilt from the fixed source for Mark's iPad check.
- The SUMMARY states that the iPad result is device-unverified and what Mark checks (D-04).
</success_criteria>

<output>
Create `.planning/quick/261001-den-fix-history-rail-line-span-on-webkit-tra/261001-den-SUMMARY.md` when done.
</output>
