---
phase: quick-261025-rjq
plan: 01
quick_id: 261025-rjq
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/styles/app.css
  - app/src/styles/binder.test.js
  - .planning/quick/261025-rjq-fix-bug-pen-step-number-misaligned-the-v/261025-rjq-step-probe.mjs
autonomous: true
requirements:
  - bug-pen-step-number-misaligned

estimate:
  tokens: 50000
  raw_tokens: 50000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "In Playwright WebKit and in Chrome (playwright-core chromium with channel 'chrome'), deviceScaleFactor 1, at 1366x1024 fine, 1366x1024 coarse (hasTouch), 984x1024 fine and 984x1024 coarse, on /notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1 after Next version and then the button named 'Step 1, edit this step', the top of step 1's .method-step__n equals the top of its .prose-field--lead-in within 0.1px. On the base build they differ by 6.0 in all eight (planning measurement at 6e618a0b, e.g. WebKit 1366 coarse: number 2271.89, lead-in 2277.89, page coordinates)."
    - "In the same eight runs the gap from the lead-in field's bottom to the instruction field's top stays 6.0 (base 6.0): the rhythm between fields is unchanged."
    - "On the reading page (no pen) and in the pen with every step closed, every step's .method-step__n and .method-step__lead tops equal the base build's within 0.1px."
    - "With step 1 open, every later step's .method-step__n top equals the base build's minus 6.0 (within 0.1px): the open step is shorter by the removed margin and nothing else moves."
    - "The hairline outline on .method-step__open-fields is unchanged (Mark's no-box decision is for the Phase 11 creation editor only); .method-step__field keeps margin-top var(--gap-xs), so the purpose and aside fields outside the outline keep their margin."
    - "npm --prefix app test passes 3766 tests in 120 files (base 3765 in 120 at 6e618a0b; one test added to binder.test.js)."
    - "The strict walk's result is the same as at base: at 6e618a0b it prints exactly one line, FAIL correct-save: the page status starts with \"changed \" (Batch saved.), and exits 1 before compare runs (red since f58c861b, decide-notice-copy, not this task). After the change it prints that same single FAIL line and no other, and 10-walk-before.json is untouched."
  artifacts:
    - path: app/src/styles/app.css
      provides: "One new rule after .method-step__field: the open step's first field carries no top margin"
      contains: ".method-step__open-fields > .method-step__field:first-child"
    - path: app/src/styles/binder.test.js
      provides: "One test pinning the new rule and the unchanged .method-step__field margin"
      contains: ".method-step__open-fields > .method-step__field:first-child"
    - path: .planning/quick/261025-rjq-fix-bug-pen-step-number-misaligned-the-v/261025-rjq-step-probe.mjs
      provides: "record/check probe: number vs lead-in tops, field gap, reading and closed steps, in WebKit and Chrome at four configs"
  key_links:
    - from: app/src/styles/app.css
      to: app/src/ui/Method.jsx
      via: ":first-child matches because the lead-in label is the first element child of div.method-step__open-fields (Method.jsx open-step branch, lines 153-161)"
      pattern: "method-step__open-fields"
    - from: .planning/quick/261025-rjq-fix-bug-pen-step-number-misaligned-the-v/261025-rjq-step-probe.mjs
      to: .planning/phases/08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs
      via: "startServers({ appRoot: PROBE_DIST }) on ephemeral 127.0.0.1 ports"
      pattern: "startServers"
---

<objective>
Fix bug-pen-step-number-misaligned (Mark answered "fix" on Mark's List, 2026-10-25). In the version pen, an open step's margin number and its lead-in field do not share a top: the lead-in sits 6px low because `.method-step__field { margin-top: var(--gap-xs) }` (app/src/styles/app.css lines 1223-1226) also applies to the first field inside `.method-step__open-fields`. The closed step's `.method-step__lead` has margin 0 and lines up; the open step should too.

Purpose: the open step reads as the same step it was when closed, with its number level with its first line.
Output: one CSS rule, one binder test, and a probe that measures the fix in WebKit and Chrome against the base build.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.claude/CLAUDE.md

<interfaces>
As the files stand at 6e618a0b (app/ is identical to 616148a7):
- app/src/styles/app.css lines 1220-1226: a three-line comment ("The pen's own step fields (03-02, 03.1-04) ... the vertical rhythm between fields."), then `.method-step__field { display: block; margin-top: var(--gap-xs); }`. --gap-xs is 6px (tokens.css line 47).
- app/src/styles/app.css lines 1302-1309: the comment and `.method-step__open-fields { outline: var(--rule-graduation) solid var(--sheet-ink); outline-offset: var(--sheet-open-fields-offset); }`. The outline takes no space and stays.
- app/src/styles/app.css already uses the child combinator (for example `.batch-row__provenance > div`, line 1634) and bare `0` values (`margin: 0` in .method-steps and .method-step__lead). No `:first-child` appears in app.css yet; shell.css, notebook.css and print.css use it.
- app/src/ui/Method.jsx lines 153-207: the open branch renders `div.method-step__open-fields` whose first element child is `label.method-step__field` holding `input.prose-field.prose-field--lead-in`, then `label.method-step__field` holding the instruction `textarea.prose-field`, then the optional struck paragraph, removed label and targets. The purpose and aside `label.method-step__field` elements (lines 234 and 252) sit outside the outline, after other siblings, and are never a first child.
- The edit control is a Button with aria-label `Step 1, edit this step` (Method.jsx line 435 via fieldLabel, line 645).
- app/src/styles/binder.test.js: `ruleFor(selector)` (line 39) finds a rule by its whitespace-normalised selector from readAllRules (css-source.js line 85). The `.method-step__open-fields` outline test is at lines 147-152, inside the describe block that also holds the `.method-step__done-cancel` and `.method-step__changed` tests.
- Probe harness to copy from: .planning/quick/261025-f8p-task-3-tasting-as-a-peer-region-of-batch-temperature-and-the/261025-f8p-pen-probe.mjs lines 23-38 (startServers import, PLAYWRIGHT_CORE default and FAIL message, PROBE_DIST guard) and lines 116-130 (newContext: viewport, hasTouch, deviceScaleFactor 1, abort every request whose hostname is not 127.0.0.1). The retry-click pattern is .planning/phases/10-the-creation-editor-without-save/10-walk.mjs lines 226-241 (clickUntil, openNextVersionPen). Chrome launches with `chromium.launch({ channel: 'chrome' })` from the same playwright-core; /Applications/Google Chrome.app is installed and launched at planning time.

Planning measurement (scratch build of 6e618a0b, page coordinates = rect.top + scrollY, Olive Oil v1, step 1 open):
- Base: number-to-lead-in drop 6.0 in all eight runs (WebKit and Chrome x 1366 fine, 1366 coarse, 984 fine, 984 coarse); lead-in bottom to instruction top 6.0 in all eight.
- With the rule injected as a style tag (observation only, no repo edit): drop 0.0 in all eight; field gap 6.0; reading-page and closed-pen tops identical to base; steps 2 and 3 in the open state 6.0 higher than base.
</interfaces>
</context>

<tasks>

<task type="tracer">
  <name>Task 1: Measure the base, add the rule, measure again (WebKit and Chrome, four configs)</name>
  <files>.planning/quick/261025-rjq-fix-bug-pen-step-number-misaligned-the-v/261025-rjq-step-probe.mjs, app/src/styles/app.css</files>
  <read_first>
    - app/src/styles/app.css lines 1215-1230 and 1300-1312
    - app/src/ui/Method.jsx lines 145-210
    - .planning/quick/261025-f8p-task-3-tasting-as-a-peer-region-of-batch-temperature-and-the/261025-f8p-pen-probe.mjs lines 1-40 and 110-135
    - .planning/phases/10-the-creation-editor-without-save/10-walk.mjs lines 220-245
    - .planning/phases/08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs lines 60-95
  </read_first>
  <precondition>playwright-core exists at /Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs (or PLAYWRIGHT_CORE names another copy), and app/src/styles/app.css does not yet contain the new selector.</precondition>
  <action>
Implements bug-pen-step-number-misaligned. Never start a Vite dev or preview server, never write app/dist, and leave the running `vite preview --host` on 4173 (Mark's device server) alone: do not kill, restart or contact it. Every build goes to a scratch directory keyed by the checkout name: S="${TMPDIR:-/tmp}/sprinkles-rjq/$(basename "$(git rev-parse --show-toplevel)")".

1. Write the probe at .planning/quick/261025-rjq-fix-bug-pen-step-number-misaligned-the-v/261025-rjq-step-probe.mjs. Header comment in the f8p style: what it proves, the usage lines, that it starts no Vite server, never contacts 4173 or 8077, never writes app/dist, serves PROBE_DIST through 08-walk-server.mjs on ephemeral 127.0.0.1 ports and aborts every other host. Copy the f8p guards (PLAYWRIGHT_CORE default and FAIL message, PROBE_DIST must hold index.html). Import startServers from ../../phases/08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs and both webkit and chromium from playwright-core.
   Engines: WebKit, and Chrome via chromium.launch with channel 'chrome'. If Chrome fails to launch, print an INFO line with the first line of the error and carry on WebKit-only (the check then reports Chrome as INFO, not FAIL).
   Configs, each a fresh context with deviceScaleFactor 1 and the 127.0.0.1-only route: 1366x1024 fine (hasTouch false), 1366x1024 coarse (hasTouch true), 984x1024 fine, 984x1024 coarse. Record `matchMedia('(pointer: coarse)').matches` per run.
   Per run: goto /notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1 with waitUntil networkidle, wait for .method-step, await document.fonts.ready, settle 300ms. Measure "reading". Press the first button named 'Next version' with the clickUntil retry until form[aria-label="Next version"] appears, settle, measure "closed". Press the button named 'Step 1, edit this step' with the same retry until .method-step__open-fields appears, settle, measure "open".
   A measurement lists every li.method-step in order with page-coordinate tops (getBoundingClientRect().top + scrollY, rounded to 0.01) of .method-step__n and .method-step__lead (null when absent), and, inside .method-step__open-fields when present, the lead-in field (.prose-field--lead-in) top and bottom and the instruction field (the textarea.prose-field) top.
   Modes: `record <out.json>` writes { engine -> config -> { coarse, reading, closed, open } }. `check <after.json> --base <base.json>` prints one PASS/FAIL/INFO line per gate and ends "N PASS, M FAIL", exit 1 on any FAIL. Gates per engine and config, tolerance 0.1px:
   G1 open step 1: lead-in top minus number top is 0; print both values and the base's drop.
   G2 open step 1: instruction top minus lead-in bottom equals the base's value.
   G3 reading: every step's number and lead tops equal the base's.
   G4 closed: every step's number and lead tops equal the base's.
   G5 open, steps 2 to the last: each number top equals the base's minus the base's G1 drop for step 1.
   G6 coarse equals the config's hasTouch.
   Everything typed or printed is English.

2. Before touching app.css, build the base: npm --prefix app run build -- --outDir "$S/base-dist" --emptyOutDir. Record PROBE_DIST="$S/base-dist" into "$S/base.json". Run check with "$S/base.json" as both after and base: expect G1 to FAIL in every run with a drop of 6.0 (eight FAILs when Chrome launches) and every other gate to PASS. That is the red; note the counts for the SUMMARY. If the base drop is not 6.0 somewhere, stop and report the numbers instead of editing.

3. Add the rule to app/src/styles/app.css directly after the .method-step__field rule (line 1226), separated by one blank line, matching the file's comment style: a short comment saying the open step's first field starts at the step's top, level with its margin number as the closed step's lead is, and later fields keep the --gap-xs rhythm (bug-pen-step-number-misaligned, Mark 2026-10-25). The comment must not repeat the selector text. Then the rule: selector `.method-step__open-fields > .method-step__field:first-child`, one declaration, margin-top 0. No token is needed for 0 (the file already writes `margin: 0`); add no other value, and leave .method-step__field and .method-step__open-fields as they are.

4. Build the after: npm --prefix app run build -- --outDir "$S/after-dist" --emptyOutDir. Record into "$S/after.json" and run check against "$S/base.json". Every gate must PASS. If G1 passes but anything in G2 to G5 fails, stop and report the measured values; do not add a second rule.
  </action>
  <verify>
    <automated>S="${TMPDIR:-/tmp}/sprinkles-rjq/$(basename "$(git rev-parse --show-toplevel)")" && PROBE_DIST="$S/after-dist" node .planning/quick/261025-rjq-fix-bug-pen-step-number-misaligned-the-v/261025-rjq-step-probe.mjs check "$S/after.json" --base "$S/base.json" && grep -c 'method-step__open-fields > .method-step__field:first-child' app/src/styles/app.css</automated>
  </verify>
  <done>The base check FAILs G1 with a 6.0 drop in every run and passes the rest; the after check prints "N PASS, 0 FAIL" and exits 0 across WebKit and Chrome at all four configs; the grep prints 1 (baseline 0 at 6e618a0b); git diff -- app/src/styles/app.css shows only the added comment and rule.</done>
</task>

<task type="auto">
  <name>Task 2: Pin the rule in binder.test.js, run the suite and the strict walk, commit by path</name>
  <files>app/src/styles/binder.test.js</files>
  <read_first>
    - app/src/styles/binder.test.js lines 30-45 and 135-165
  </read_first>
  <action>
1. In app/src/styles/binder.test.js, add one test directly after the `.method-step__open-fields` outline test (ends line 152), same describe block, same style. Name it for what it pins: the open step's first field carries no top margin, so the lead-in starts level with the margin number, and the later fields keep --gap-xs between them (bug-pen-step-number-misaligned). Assert that ruleFor of the new selector exists with a failure message in the file's style, that its declarations match a margin-top of 0, and that ruleFor('.method-step__field') still declares margin-top var(--gap-xs). Touch no other test.

2. Run npm --prefix app test. Expect 3766 passed in 120 files (base 3765 in 120 at 6e618a0b).

3. Run the strict walk: sh .planning/phases/10-the-creation-editor-without-save/10-walk-check.sh with its output saved to "${TMPDIR:-/tmp}/sprinkles-rjq/walk.log". At 6e618a0b this walk is already red for a reason outside this task: it prints exactly one line, FAIL correct-save: the page status starts with "changed " (Batch saved.), and exits 1 before compare runs, because f58c861b (decide-notice-copy) changed the save-after-Correct notice and the walk was not updated. The walk records page state and stores, never geometry, so a margin cannot move it. Accept either (a) that same single FAIL line and no other FAIL, or (b) "MATCH 94 snapshots" if the walk was repaired upstream before you ran. Do not edit 10-walk.mjs or 10-walk-before.json, and do not rebaseline: this change lands in no snapshot. Any other outcome: stop and report the log lines.

4. Commit only this task's files, by path, never with -A or a directory: git add app/src/styles/app.css app/src/styles/binder.test.js .planning/quick/261025-rjq-fix-bug-pen-step-number-misaligned-the-v/261025-rjq-step-probe.mjs. Check that git diff --cached --name-only lists exactly those three files (Sid has uncommitted work under .planning/, such as the canvas generator files; leave it unstaged). Commit message: fix(261025-rjq): the pen's open step starts level with its number; its first field carries no top margin (bug-pen-step-number-misaligned, Mark 2026-10-25), with a short body naming the 6.0 to 0.0 measurement in WebKit and Chrome, and ending with the session's attribution lines. Do not commit the PLAN, the SUMMARY or STATE.md; the orchestrator does.
  </action>
  <verify>
    <automated>L="${TMPDIR:-/tmp}/sprinkles-rjq/walk.log"; mkdir -p "${L%/*}"; npm --prefix app test 2>&1 | grep -E 'Tests +3766 passed' && { sh .planning/phases/10-the-creation-editor-without-save/10-walk-check.sh > "$L" 2>&1; grep -E '^(FAIL|MATCH)' "$L"; } && [ "$(grep -c '^FAIL' "$L")" -le 1 ] && ! grep '^FAIL' "$L" | grep -qv '^FAIL correct-save: the page status starts with' && git diff --exit-code -- .planning/phases/10-the-creation-editor-without-save/10-walk-before.json && git show --name-only --format= HEAD</automated>
  </verify>
  <done>The suite reports 3766 passed in 120 files; walk.log holds either exactly one FAIL line (the correct-save page status line) or "MATCH 94 snapshots", and 10-walk-before.json has no diff; HEAD's commit lists exactly app/src/styles/app.css, app/src/styles/binder.test.js and the probe file.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| probe to network | The probe drives WebKit and Chrome against a local scratch build; any request to a host other than 127.0.0.1 is aborted |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-rjq-01 | Information disclosure | 261025-rjq-step-probe.mjs | low | mitigate | Every context aborts non-127.0.0.1 requests, as the f8p probe and 10-walk.mjs do; the build is served by 08-walk-server.mjs on an ephemeral loopback port, never 4173 and never with --host |
| T-rjq-02 | Tampering | app/src/styles/app.css | low | accept | One margin declaration: no input, no markup, no dependency, no new token |
| T-rjq-SC | Tampering | npm/pip/cargo installs | low | accept | No package is installed; playwright-core comes from the existing npx cache and Chrome is the installed app |
</threat_model>

<verification>
- The probe's after check passes every gate in WebKit and Chrome at 1366 fine, 1366 coarse, 984 fine and 984 coarse; the base check fails only G1, at 6.0.
- npm --prefix app test: 3766 passed in 120 files.
- The strict walk's result is the same as at base (the one pre-existing correct-save FAIL), or MATCH 94 if repaired upstream; 10-walk-before.json untouched.
- The commit holds exactly the three files.
</verification>

<success_criteria>
In the version pen with a step open, the margin number and the lead-in field share one top in WebKit and Chrome at 1366 and 984, fine and coarse; the gap between fields is still 6; the reading page and the closed steps have not moved.
</success_criteria>

<output>
Create `.planning/quick/261025-rjq-fix-bug-pen-step-number-misaligned-the-v/261025-rjq-SUMMARY.md` when done. Include:
- the base check's FAIL count and final line, and the after check's final line, with step 1's number top, lead-in top and field gap per engine and config (base and after);
- the test counts (base 3765, after 3766, 120 files) and the walk's FAIL or MATCH line, and that 10-walk-before.json did not change;
- under "For the orchestrator" (the executor writes no Mark's List row):
  - close Mark's List row bug-pen-step-number-misaligned (status done, resolvedAt from the clock, a one-line reply with the 6.0 to 0.0 measurement and the commit hash);
  - the strict walk has been red since f58c861b (decide-notice-copy): its correct-save scenario still expects the page status to start with "changed ", and the app now says "Batch saved.". This task leaves it alone; it needs its own route (a bug row for Mark or a /gsd-quick that updates the expectation and rebaselines the notice leaves);
  - Mark's 4173 preview serves app/dist, which this task never rebuilt, so the fix shows on his iPad only after a rebuild (npm --prefix app run build && npm --prefix app run preview -- --host).
</output>
