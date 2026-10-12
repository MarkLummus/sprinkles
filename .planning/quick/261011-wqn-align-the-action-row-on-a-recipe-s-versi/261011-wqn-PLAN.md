---
phase: quick-261011-wqn
plan: 01
quick_id: 261011-wqn
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/styles/notebook.css
  - app/src/styles/notebook.test.js
  - .planning/quick/261011-wqn-align-the-action-row-on-a-recipe-s-versi/261011-wqn-probe.mjs
  - .planning/quick/261011-wqn-align-the-action-row-on-a-recipe-s-versi/261011-wqn-before.json
  - .planning/quick/261011-wqn-align-the-action-row-on-a-recipe-s-versi/261011-wqn-SUMMARY.md
autonomous: true
requirements: [PRINT-01]

estimate:
  tokens: 70000
  raw_tokens: 70000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "The baseline run measured Version 4's acts row on a build of the unchanged source in Playwright WebKit (393, 724, 1024 and 1366 at a coarse pointer, plus 1366 fine) and in system Chrome (393, 724, 1024 and 1366, fine). The SUMMARY names the measured cause with those numbers. The cause is either the predicted one or a departure reported before any edit. Predicted: the row keeps flex's default stretch, so every control is as tall as the 44px line. A stretched <button> centres its text, but the Print sheet <a> computes display block and sets its text at the top of its box, so its text sits at least 5px above the text of the control before it."
    - "After the fix, the controls that share a line of the acts row have text tops and text bottoms within 0.5px of each other in every probe cell. From 724 up those are Next version, Show changes and Print sheet; below 724 they are the record act, Next version and Print sheet. One baseline."
    - "The fix moves no box. In every cell, the row and each control keep the baseline reading's x, y, width and height within 0.5px. Each control's 44px height (its touch target) is kept, the gaps stay one --app-notebook-acts-gap, and the first control still starts at the row's left edge. Every other visible a and button in .notebook-band keeps its baseline rect within 0.5px."
    - "The fix is one top-level rule in notebook.css, .notebook-version__acts > a.notebook-link. It declares only display: inline-flex and align-items: center, so it has no literal and no new token. The .notebook-version__acts rule still declares no align-items. Print sheet still draws its underline."
    - "`npm --prefix app test` passes with the new notebook.test.js cases and none removed. Under app/, the 261011-wqn commits touch only app/src/styles/notebook.css and app/src/styles/notebook.test.js. VersionRow.jsx (its copy included), app.css, tokens.css, DESIGN.md and .planning/sketches are unchanged."
  artifacts:
    - path: app/src/styles/notebook.css
      provides: "one top-level rule after .notebook-version__acts that centres the Print sheet anchor's text inside its stretched box, with a comment naming the measured cause"
      contains: ".notebook-version__acts > a.notebook-link"
    - path: app/src/styles/notebook.test.js
      provides: "a describe block pinning the new rule's exact declarations and the row's own rule carrying no align-items"
      contains: "261011-wqn"
    - path: .planning/quick/261011-wqn-align-the-action-row-on-a-recipe-s-versi/261011-wqn-probe.mjs
      provides: "`before` and `after` groups. Each builds the current source into a temp outDir, then measures the acts row's boxes, text rects, gaps and computed styles in WebKit and system Chrome"
    - path: .planning/quick/261011-wqn-align-the-action-row-on-a-recipe-s-versi/261011-wqn-before.json
      provides: "the pre-change readings per cell, and the prediction verdict"
  key_links:
    - from: app/src/styles/notebook.css
      to: app/src/ui/VersionRow.jsx
      via: "the new rule matches only the <a> that react-router's Link renders for Print sheet inside div.notebook-version__acts. The Button controls (Next version, Show changes, the record act) are <button> and do not match it"
      pattern: "className=\"notebook-link\" to=\\{printPath"
    - from: app/src/styles/notebook.css
      to: app/src/styles/app.css
      via: "the row's stretched 44px line comes from .notebook-action's min-height var(--touch-min), plus app.css's coarse-pointer button floor. app.css gives a <button> that floor but gives an <a> none, so the anchor's 44px hit area exists only because the row stretches it. The fix keeps the stretch"
      pattern: "min-height: var\\(--touch-min\\)"
---

<objective>
Line up the action row on a recipe's version details. Mark reported (2026-10-11, iPad) that on Version 4 the row shows a filled Next version, then Show changes, then Print sheet. Print sheet floats above the baseline of the other two, sits further right, and the row does not wrap. All three controls should sit on one baseline, left-aligned in the row.

Purpose: Print sheet is the version row's entry to the printed sheet (PRINT-01; Phase 4 D-05 placed it after Show changes, in the same underlined grammar). It must read as part of the row.

Output: a measured cause (the baseline probe readings), one scoped rule in notebook.css, a notebook.test.js block pinning it, and after-readings proving one baseline with no box moved.

The order is fixed by the task's constraint and Mark's working rule (measure the real DOM, never reason from CSS source alone):
1. Measure the row on a build of the unchanged source in WebKit and Chrome.
2. Name the cause from the numbers.
3. Pin the fix in a test.
4. Make the smallest CSS change.
5. Measure again.

The tracer-first ordering is not used: this quick task's constraint puts measurement first, and a one-rule CSS fix has no layers to slice.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@.claude/CLAUDE.md

Source facts the planner read. The probe must confirm them, so do not trust them:
- app/src/ui/VersionRow.jsx lines 423-463 render the row as div.notebook-version__acts, open only while no pen is open. Below 724 it holds the record act (Button, .notebook-action), Next version (Button, .notebook-link) and Print sheet. From 724 up it holds Next version (Button, .notebook-action), then Show changes (Button, .notebook-link, only when a parent version exists), then Print sheet. Print sheet is a react-router Link with className notebook-link and a literal tabIndex={0}, so it renders an <a>. Every other control is a <button> through app/src/ui/Button.jsx.
- app/src/styles/notebook.css lines 467-471: .notebook-version__acts declares display flex, gap var(--app-notebook-acts-gap) and flex-wrap wrap, and no align-items, so the row uses flex's default stretch. Lines 261-277: .notebook-action is inline-flex with align-items center and min-height var(--touch-min). Lines 297-309: .notebook-link sets padding 0 and no border, background, font or underline, with no display and no min-height. Lines 311-320: the comment on .notebook-recipe > .notebook-link says the version row's .notebook-link is "a row's flex child, where vertical stretch is wanted".
- app/src/styles/app.css lines 2449-2465: under (pointer: coarse), button, select and some field classes get min-height var(--touch-min), but an <a> gets none. Lines 195-201: the bare a rule sets colour, underline, thickness and offset, with no display. No rule anywhere sets margin-left auto, justify-content or align-self on this row or its children; the planner grepped every stylesheet.
- Seeded route: /notebook/mexican-chocolate/mexican-chocolate-v4. Version 4 has parent v3, so Show changes shows from 724 up. Earlier probes use this route (for example .planning/quick/261002-axn-stack-the-struck-old-figure-above-the-ne/261002-axn-probe.mjs line 25).
- Probe pattern to follow: .planning/quick/261004-ly5-recipe-band-buttons-rename-next-version-and-neighbours-keep/261004-ly5-probe.mjs. It imports webkit from /Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs, and startServers, launch, check, finish and REPO_ROOT from .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs. It opens a context with viewport, hasTouch and deviceScaleFactor 1, aborts every non-127.0.0.1 request, and throws when matchMedia('(pointer: coarse)') or innerWidth differ from the cell. The scratch-build pattern (startServers({ appRoot }), never writing app/dist, which Mark's own vite preview serves) is in .planning/phases/04-prepare-the-next-version-for-making/04-print-probe.mjs lines 28-31 and 265.
- Test pattern: app/src/styles/notebook.test.js reads notebook.css as text through readAllRules from app/src/styles/css-source.js. A rule is { selector, declarations, media }. Every selector must start with .notebook, and no declaration may hold a bare px or hex value. The block at lines 555-600 (quick 261004-ly5) shows the top(selector) and declared(rule, property) helpers.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Measure Version 4's acts row on the unchanged build in WebKit and Chrome, and name the cause</name>
  <files>.planning/quick/261011-wqn-align-the-action-row-on-a-recipe-s-versi/261011-wqn-probe.mjs, .planning/quick/261011-wqn-align-the-action-row-on-a-recipe-s-versi/261011-wqn-before.json</files>
  <read_first>
    - app/src/ui/VersionRow.jsx (lines 412-463)
    - app/src/styles/notebook.css (lines 261-345 and 467-471)
    - app/src/styles/app.css (lines 64-87, 195-205, 2440-2470)
    - .planning/quick/261004-ly5-recipe-band-buttons-rename-next-version-and-neighbours-keep/261004-ly5-probe.mjs (whole file: imports, openPage, park, raf, before/after structure)
    - .planning/phases/03.5-separate-the-recipe-from-the-sheet/03.5-probe-harness.mjs (lines 80-125 and 238-262: startServers, launch, check, finish)
    - .planning/phases/04-prepare-the-next-version-for-making/04-print-probe.mjs (lines 1-60: PROBE_DIST and the scratch build)
  </read_first>
  <action>
Write 261011-wqn-probe.mjs in the quick directory, modelled on the 261004-ly5 probe. It is an ES module run as `node <probe> before|after` from the repo root. Any other argument prints usage and exits 2.

Build. Each run builds the current source once into a fresh directory from mkdtemp under os.tmpdir(), using execFileSync on npm with the arguments --prefix, REPO_ROOT/app, run, build, --, --outDir and that directory. It then serves that directory through startServers({ appRoot }). The probe never writes app/dist and never starts a dev or preview server. If Mark's vite preview on :4173 is running, leave it alone.

Engines and cells. WebKit through webkit.launch() and system Chrome through the harness's launch(). There are nine cells:
- WebKit at 393, 724, 1024 and 1366 with hasTouch true (coarse; 1366 coarse is Mark's iPad).
- WebKit at 1366 with hasTouch false.
- Chrome at 393, 724, 1024 and 1366 with hasTouch false.
Each cell uses viewport height 1000 and deviceScaleFactor 1, and its route handler aborts any request whose host is not 127.0.0.1. Open /notebook/mexican-chocolate/mexican-chocolate-v4, wait for .notebook-version__acts and for document.fonts.ready, then wait two animation frames. Throw if the pointer state or innerWidth differ from the cell. Before reading, park the mouse at (1,1) and blur the active element.

Readings per cell, all from page.evaluate in the real DOM:
- The row: its rect, and its computed align-items, flex-wrap and column-gap.
- The rect of the row's parent, section.notebook-version.
- The resolved px of --touch-min and --app-notebook-acts-gap, from getComputedStyle(document.documentElement).
- For each child control of the row in DOM order:
  - tagName, trimmed text and class list;
  - its rect (x, y, width, height);
  - computed display, align-items, line-height, min-height, padding-top, padding-bottom, font-family, font-size, font-weight and text-decoration-line;
  - its text rect, from a Range that selects the control's contents (getBoundingClientRect: top and bottom).
- Group the controls into lines by box top (within 1px). For consecutive controls on a line, record the gap (next x minus previous right edge).
- The room between Print sheet's right edge and the parent section's right edge. This answers Mark's "against the right edge".
- The rects of every visible a and button inside .notebook-band, keyed by trimmed text plus class list, with a #n suffix on duplicates.
- One screenshot per cell of the row's locator, at the row's own bounds, written to the same os.tmpdir() run directory. Name each file after the group and the cell, and print every path.

The before group writes 261011-wqn-before.json in the quick directory, holding { prediction, departures, cells }. It also prints one compact JSON line per cell. For each line it gives the controls in order, with box y and height, text top and bottom, and gaps. It also gives the room to the right edge.

It then checks the planner's predicted cause and records each failure as a departure.
- P1: the row's computed align-items is normal or stretch.
- P2: on each line, every control's box height equals the line's tallest box within 0.5px, and that height is at least --touch-min.
- P3: wherever Print sheet shares a line with a control before it:
  - Print sheet is an A whose computed display is block;
  - every BUTTON on that line has its text centred in its box: (text top minus box top) and (box bottom minus text bottom) differ by at most 1px;
  - Print sheet's text top is at least 5px above the text top of the control before it.
  P3 must apply in at least the WebKit 1366 coarse cell. A cell where Print sheet starts its own line is reported as not applicable for P3.
- P4: every gap equals --app-notebook-acts-gap within 0.5px, and the first control's x equals the row's x within 0.5px.
Any departure prints a line starting DEPARTS, and the run exits non-zero through the harness's check and finish.

The after group reads 261011-wqn-before.json and takes the same readings. It checks:
- A1: on each line, every control's text top, and every control's text bottom, are within 0.5px of each other (one baseline; all three controls use the same face, size and weight, and the probe asserts that too).
- A2: the row's rect, and each control's rect, equal the baseline within 0.5px.
- A3: every keyed .notebook-band a and button rect equals the baseline within 0.5px, so no other row moved.
- A4: Print sheet's computed text-decoration-line includes underline.

Run `node .planning/quick/261011-wqn-align-the-action-row-on-a-recipe-s-versi/261011-wqn-probe.mjs before`. Then Read the WebKit 1366 coarse, WebKit 1024 coarse and Chrome 1366 PNGs, and confirm that the picture shows the reported defect.

If the run reports any DEPARTS line, stop here: make no edit under app/ and return the readings and the departing check as a blocker. That covers a P4 departure (a real horizontal offset whose cause the planner did not find) and P1 to P3 not reproducing in the WebKit 1366 coarse cell. Do not guess a different fix.

If the prediction holds, record for the SUMMARY:
- the cause, in plain words and with the numbers, per the prediction's four parts;
- the room to the right edge per cell. If the gaps all equal the token, "further right" is simply the row's order, and the SUMMARY says so.

Commit the probe and before.json with the subject `test(261011-wqn): measure the version row's Print sheet against its neighbours`.
  </action>
  <verify>
    <automated>node .planning/quick/261011-wqn-align-the-action-row-on-a-recipe-s-versi/261011-wqn-probe.mjs before && test -s .planning/quick/261011-wqn-align-the-action-row-on-a-recipe-s-versi/261011-wqn-before.json && node -e "const b=require('./.planning/quick/261011-wqn-align-the-action-row-on-a-recipe-s-versi/261011-wqn-before.json'); if(b.prediction!==true||Object.keys(b.cells).length!==9) process.exit(1)" && git diff --quiet HEAD -- app/</automated>
  </verify>
  <done>261011-wqn-before.json holds nine cells with prediction true. The before run printed the per-cell lines and the screenshot paths. The executor has the measured cause and the room-to-edge numbers ready for the SUMMARY. Nothing under app/ changed.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Pin and apply the one-rule fix, then re-measure both engines</name>
  <files>app/src/styles/notebook.test.js, app/src/styles/notebook.css, .planning/quick/261011-wqn-align-the-action-row-on-a-recipe-s-versi/261011-wqn-SUMMARY.md</files>
  <read_first>
    - app/src/styles/notebook.test.js (lines 1-45 and 555-600: imports, rules, the top() and declared() helpers)
    - app/src/styles/notebook.css (lines 297-320 and 467-471)
    - .planning/quick/261011-wqn-align-the-action-row-on-a-recipe-s-versi/261011-wqn-before.json
  </read_first>
  <behavior>
    - Test 1: a top-level rule (media undefined) with the selector `.notebook-version__acts > a.notebook-link` exists. Its declarations, split on semicolons, trimmed and with empties dropped, are exactly `display: inline-flex` and `align-items: center`, in that order. It sets nothing that sizes or moves the box: no padding, margin, min-height, height or line-height.
    - Test 2: the top-level `.notebook-version__acts` rule declares no align-items, so the row keeps flex's default stretch and every control keeps the 44px line as its hit area.
    - Test 3: the new rule sits in notebook.css after the `.notebook-version__acts` rule, compared by index in readAllRules order.
  </behavior>
  <action>
RED. Add a describe block to app/src/styles/notebook.test.js after the 261004-ly5 block. Title: "the version acts row sets Print sheet on its neighbours' baseline (quick 261011-wqn; Mark 2026-10-11)". Add the three behaviour tests above, reusing the file's rules array and the same top-level-rule lookup the 261004-ly5 block uses. Open the block with a two- to four-line comment giving the measured cause in plain words, with the WebKit 1366 coarse numbers from 261011-wqn-before.json. Run `npm --prefix app test -- src/styles/notebook.test.js` and confirm that Tests 1 and 3 fail. Commit with the subject `test(261011-wqn): pin the version row's Print sheet text to its neighbours' baseline`.

GREEN. In app/src/styles/notebook.css, add one top-level rule directly after the .notebook-version__acts rule (currently lines 467-471). The selector is `.notebook-version__acts > a.notebook-link`, and the rule declares display: inline-flex and align-items: center, nothing else.

Above it, write a comment in the file's own voice. Say that Mark reported (2026-10-11, quick 261011-wqn) Print sheet riding above Next version and Show changes. Give the measured cause: the row stretches every control to its 44px line, a stretched button centres its text, and the Print sheet link, a block, set its text at its top. Say this rule gives the link the button's own centring, the inline-flex grammar of .notebook-action, while the stretched box, which is also its touch target, stays as it was.

Constraints on the edit:
- Do not add align-items to .notebook-version__acts itself: that would shrink the link's 44px box.
- Do not touch the .notebook-link base rule (Rename and other placements read it), app.css, tokens.css or VersionRow.jsx.
- The values are keywords, so no token is needed and no literal is introduced.

Run `npm --prefix app test -- src/styles/notebook.test.js` (green). Commit with the subject `fix(261011-wqn): line Print sheet up with Next version and Show changes`.

Re-measure. Run `node .planning/quick/261011-wqn-align-the-action-row-on-a-recipe-s-versi/261011-wqn-probe.mjs after`; checks A1 to A4 must all pass in all nine cells. Read the WebKit 1366 coarse, WebKit 1024 coarse, WebKit 393 coarse and Chrome 1366 after-PNGs. Confirm that the three words share one line of text and that Print sheet keeps its underline. Then run the full `npm --prefix app test`.

Write 261011-wqn-SUMMARY.md. It contains:
- A before and after table per cell: each control's box (y, height), its text top and bottom, the gaps, and the room to the right edge.
- The named cause, and the fix (one rule, keyword values).
- What the screenshots showed.
- A "Deferred Human Verification" section for the orchestrator to turn into a Mark's List check row. Suggested id: check-version-row-print-sheet-baseline. Suggested title: "Print sheet sits on the same line as Next version and Show changes". The check: Mark opens Version 4 of Mexican Chocolate on the iPad, served from `npm --prefix app run build && npm --prefix app run preview -- --host`, never the dev server, and confirms the three words line up and Print sheet still opens the print route on a tap. Playwright WebKit is evidence, not the device.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/styles/notebook.test.js && node .planning/quick/261011-wqn-align-the-action-row-on-a-recipe-s-versi/261011-wqn-probe.mjs after && npm --prefix app test && test -f .planning/quick/261011-wqn-align-the-action-row-on-a-recipe-s-versi/261011-wqn-SUMMARY.md && test -z "$(git status --porcelain app/)" && SUBJECTS="$(git log --format=%s --grep='261011-wqn')" && printf '%s\n' "$SUBJECTS" | grep -qF "test(261011-wqn): pin the version row's Print sheet text to its neighbours' baseline" && printf '%s\n' "$SUBJECTS" | grep -qF "fix(261011-wqn): line Print sheet up with Next version and Show changes" && TOUCHED="$(git log --name-only --format= --grep='261011-wqn')" && ! printf '%s\n' "$TOUCHED" | grep '^app/' | grep -vE '^app/src/styles/notebook\.(css|test\.js)$' && ! printf '%s\n' "$TOUCHED" | grep -E '^\.planning/sketches/|^DESIGN\.md$'</automated>
    <human-check>Mark, on the iPad with Version 4 of Mexican Chocolate served from build plus preview --host: Next version, Show changes and Print sheet read on one line, and tapping Print sheet opens the print route. Deferred to Mark's List; no checkpoint.</human-check>
  </verify>
  <done>The new notebook.test.js block passes and the full suite is green. The after run passes A1 to A4 in all nine cells: one baseline, every box unchanged within 0.5px, no other band control moved, and the underline kept. Under app/, only notebook.css and notebook.test.js changed. The SUMMARY records the before and after numbers, the cause, the screenshots and the deferred device check.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| probe → local static servers | the probe serves a scratch build on ephemeral 127.0.0.1 ports and drives two browsers against it |
| probe build → Mark's preview | Mark's own vite preview on :4173 serves app/dist; a probe that rebuilt app/dist would change what he is looking at |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-261011-wqn-01 | Information disclosure | 261011-wqn-probe.mjs servers and browser contexts | low | mitigate | startServers binds 127.0.0.1 ephemeral ports only. Each context's route handler aborts every request whose host is not 127.0.0.1, as in the 261004-ly5 probe. |
| T-261011-wqn-02 | Tampering | app/dist, served by Mark's preview | low | mitigate | The probe builds into an mkdtemp directory under os.tmpdir() through --outDir and serves it with startServers({ appRoot }). It never writes app/dist and starts no dev or preview server. |
| T-261011-wqn-03 | Denial of service (Print sheet's touch target shrinks on the iPad) | notebook.css .notebook-version__acts | low | mitigate | The fix centres the anchor's text inside its existing box. Test 2 pins that the row declares no align-items, and the probe's A2 check pins every control's rect, the 44px height included, to the baseline within 0.5px. |
| T-261011-wqn-SC | Tampering | npm/pip/cargo installs | low | accept | No package is installed. The probe reuses the already installed playwright-core, the WebKit build under ~/Library/Caches/ms-playwright, and system Chrome. |
</threat_model>

<verification>
- `node .planning/quick/261011-wqn-align-the-action-row-on-a-recipe-s-versi/261011-wqn-probe.mjs after` exits 0: one baseline per line, and no box moved, in WebKit (393/724/1024/1366 coarse, 1366 fine) and Chrome (393/724/1024/1366).
- `npm --prefix app test` passes.
- `git log --name-only --format= --grep='261011-wqn'` lists only app/src/styles/notebook.css and app/src/styles/notebook.test.js under app/.
</verification>

<success_criteria>
- The SUMMARY names the cause from measured numbers, not from CSS reading.
- Next version, Show changes and Print sheet share one baseline from 724 up, as do the record act, Next version and Print sheet below 724, left-aligned with one token gap.
- Every control keeps its box and its 44px touch target. No copy changes, and no other row moves.
- One scoped notebook.css rule with keyword values, pinned by notebook.test.js.
- The device check waits for Mark on Mark's List.
</success_criteria>

<output>
Create `.planning/quick/261011-wqn-align-the-action-row-on-a-recipe-s-versi/261011-wqn-SUMMARY.md` when done
</output>
