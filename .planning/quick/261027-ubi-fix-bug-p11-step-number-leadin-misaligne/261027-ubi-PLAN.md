---
phase: quick-261027-ubi
plan: 01
quick_id: 261027-ubi
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/styles/notebook.css
  - app/src/styles/notebook.test.js
  - .planning/quick/261027-ubi-fix-bug-p11-step-number-leadin-misaligne/261027-ubi-baseline-probe.mjs
autonomous: true
requirements:
  - bug-p11-step-number-leadin-misaligned

estimate:
  tokens: 45000
  raw_tokens: 45000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "In Playwright WebKit and in Chrome (playwright-core chromium, channel 'chrome'), at 1366x1024 with a fine pointer at DPR 1, a coarse pointer (hasTouch) at DPR 1, and a coarse pointer at DPR 2, the creation editor's open step 1 (/notebook, New recipe, Name 'Probe sorbet', Start, Add step, lead-in typed 'Warm the milk') has its .method-step__n text baseline within 1.0 px of its lead-in input's text baseline. Measured at planning on HEAD c90b6065 (DPR 1, lead-in baseline minus number baseline, positive means the number sits above the text): WebKit coarse +8.53, Chrome coarse +8.00, WebKit fine -0.58, Chrome fine -1.00. With the one rule injected, all four measured 0.00."
    - "Under a coarse pointer the lead-in field keeps its place (planning: top 690.00 WebKit, 688.00 Chrome) and the number moves down to meet its text (planning: 690.00 to 698.53 WebKit, 688.00 to 696.00 Chrome). Under a fine pointer the number keeps its place and the field moves down by at most 1.0 (planning: +0.58 WebKit, +1.00 Chrome)."
    - "The reading step is unchanged: on /notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1, step 1's number top, lead top and baseline difference equal the base build's within 0.1. At base the reading step aligns tops, so its number's baseline sits 4 px below its lead's (planning: -3.97 WebKit, -4.00 Chrome)."
    - "The Preview step inside the open creation step keeps its own alignment: its (lead top minus number top) and baseline difference equal the base build's within 0.1."
    - "The version pen and the reading page did not move: quick 261025-rjq's probe, checked on the after build against the base build, prints 48 PASS, 0 FAIL."
    - "The fix is one rule in app/src/styles/notebook.css, .notebook .mk-step declaring only align-items: baseline. It is a keyword: no token is read and none is added. app/src/styles/app.css, app/src/styles/print.css and every file under app/src/ui are unchanged."
    - "npm --prefix app test passes: 4233 tests in 130 files at base, plus the two tests this plan adds to notebook.test.js (118 tests in that file at base). The suite has no snapshot tests, so no snapshot changes."
  artifacts:
    - path: app/src/styles/notebook.css
      provides: "One top-level rule after .notebook .mk-step .prose-field--lead-in: the open creation step aligns its grid items on their first baselines"
      contains: ".notebook .mk-step {"
    - path: app/src/styles/notebook.test.js
      provides: "One describe naming the bug id: the rule exists with exactly one declaration, and no notebook.css rule on the bare .method-step declares align-items"
      contains: "bug-p11-step-number-leadin-misaligned"
    - path: .planning/quick/261027-ubi-fix-bug-p11-step-number-leadin-misaligne/261027-ubi-baseline-probe.mjs
      provides: "record/check probe: the number and lead-in text baselines of the open creation step, the reading step and the Preview step, plus the pen's open step for information, in WebKit and Chrome at three 1366 configs"
  key_links:
    - from: app/src/styles/notebook.css
      to: app/src/ui/CreationSteps.jsx
      via: "li.method-step.mk-step is app.css's .method-step grid (auto 1fr, no align-items). Its two items are span.method-step__n and div.method-step__body. The body's first baseline is the lead-in input's text baseline because the lead-in label is the body's first child (CreationSteps.jsx lines 78-95)"
      pattern: "mk-step"
    - from: .planning/quick/261027-ubi-fix-bug-p11-step-number-leadin-misaligne/261027-ubi-baseline-probe.mjs
      to: .planning/phases/08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs
      via: "startServers({ appRoot: PROBE_DIST }) on ephemeral 127.0.0.1 ports. No Vite server, app/dist and port 4173 untouched"
      pattern: "startServers"
---

<objective>
Fix bug-p11-step-number-leadin-misaligned. Mark answered "fix" on Mark's List on 2026-10-28. In the creation editor, a step open for editing shows its number (`.method-step__n`) above the lead-in's text line. Mark saw it on his iPad in Safari, landscape, from the production build.

Cause, measured at planning (HEAD c90b6065, Playwright WebKit and Chrome, 1366x1024):
- `li.method-step.mk-step` is app.css's `.method-step` grid. That rule declares no align-items, so its items stretch and the number's line starts at the row's top.
- Under a coarse pointer, app.css's `@media (pointer: coarse)` block gives every `.prose-field` a min-height of `var(--touch-min)` (44 px) and a font-size of `var(--sheet-type-note)` (16 px). The lead-in input centres its text in that 44 px box.
- So the lead-in's text baseline falls 8.53 px (WebKit) or 8.00 px (Chrome) below the number's. With a fine pointer the field is 26.5 px tall and the difference is -0.58 / -1.00, already within 1 px.

Note on the bug text: the lead-in is `input.prose-field.prose-field--lead-in[data-field="lead-in"]`, not an `.ink-field`. `.ink-field` is the class of the target chips' fields.

The sketch: `.planning/sketches/014-steps-structure-save/README.md` line 112 records the board's open step with "number top and lead-in top equal ... The lead-in field 44 tall". The board aligns tops, and its P11_CSS sets no align-items on `.mk-step`, so it draws the same offset. Mark's "fix" answer overrides that figure. This plan does not edit the sketch. It hands the change to the orchestrator (see output).

Purpose: the number reads as part of its step's first line on the iPad, as it already does with a fine pointer.
Output: one CSS rule in notebook.css, one describe in notebook.test.js, and a probe that measures the fix in WebKit and Chrome against the base build.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@.claude/CLAUDE.md
@app/src/ui/CreationSteps.jsx
@.planning/quick/261025-rjq-fix-bug-pen-step-number-misaligned-the-v/261025-rjq-step-probe.mjs

Planning measurements (HEAD c90b6065, DPR 1, page coordinates, open creation step 1 with lead-in "Warm the milk").

Base:

| Engine | Pointer | Number top / baseline | Lead-in top / height / baseline | Lead-in minus number baseline |
| ------ | ------- | --------------------- | ------------------------------- | ----------------------------- |
| WebKit | fine | 684.25 / 703.30 | 684.25 / 26.5 / 702.72 | -0.58 |
| WebKit | coarse | 690.00 / 709.05 | 690.00 / 44 / 717.58 | +8.53 |
| Chrome | fine | 682.25 / 701.25 | 682.25 / 26.5 / 700.25 | -1.00 |
| Chrome | coarse | 688.00 / 707.00 | 688.00 / 44 / 715.00 | +8.00 |

Computed styles at base:
- Number: 20px, -apple-system, line-height normal, padding 0, border 0.
- Lead-in, fine pointer: 15px Georgia 700, line-height 22.5px, padding 2px/2px, border 0, min-height 22.5px.
- Lead-in, coarse pointer: 16px, line-height 24px, min-height 44px.

Reading step (Olive Oil v1, step 1):
- WebKit: number 1582.81 / 1601.86, lead 1582.81 / 1597.89, difference -3.97.
- Chrome: number 1579.44 / 1598.44, lead 1579.44 / 1594.44, difference -4.00.

With `.notebook .mk-step { align-items: baseline }` injected through page.addStyleTag:
- The difference is 0.00 in all four runs.
- Coarse pointer: the number top moves to 698.53 (WebKit) and 696.00 (Chrome); the lead-in field top stays at 690.00 / 688.00.
- Fine pointer: the number top does not move; the lead-in field top moves to 684.83 (+0.58) / 683.25 (+1.00).
- The reading figures do not change.

The version pen's open step (Method.jsx, informational only): the same offset under a coarse pointer, +8.53 WebKit and +8.00 Chrome; -0.58 / -1.00 with a fine pointer.

At planning, quick 261025-rjq's probe ran against the HEAD build: `record` worked, and `check` of the base against itself printed 40 PASS, 0 FAIL (G5 skipped).

Processes at planning: one Vite process, Mark's `vite preview --host` on port 4173 (serving app/dist).
</context>

<tasks>

<task type="tracer">
  <name>Task 1: Measure the open creation step's number against its lead-in baseline, add the one rule, measure again in WebKit and Chrome</name>
  <files>.planning/quick/261027-ubi-fix-bug-p11-step-number-leadin-misaligne/261027-ubi-baseline-probe.mjs, app/src/styles/notebook.css</files>
  <precondition>playwright-core resolves at /Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs (or $PLAYWRIGHT_CORE), WebKit is in ~/Library/Caches/ms-playwright/webkit-2359, and Google Chrome is installed for channel 'chrome'. All three ran at planning. If one is missing, stop and report. Do not install anything.</precondition>
  <read_first>
    - app/src/ui/CreationSteps.jsx lines 77-95 (the li, the number span, the body, the lead-in label as the body's first child)
    - app/src/styles/app.css lines 1120-1134 (.method-step grid, .method-step__n), lines 1490-1516 (.prose-field, .prose-field--lead-in), lines 2459-2520 (the coarse-pointer block: .prose-field min-height and font-size)
    - app/src/styles/notebook.css lines 202-216 (the open step's existing rules; the new rule goes after the .prose-field--lead-in one)
    - .planning/quick/261025-rjq-fix-bug-pen-step-number-misaligned-the-v/261025-rjq-step-probe.mjs (the whole file: the harness shape to copy)
    - .planning/phases/08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs lines 81-97 (startServers returns appUrl and close)
    - .planning/sketches/014-steps-structure-save/README.md line 112 (the board's open-step figure)
  </read_first>
  <action>
Step 0, processes. Run `pgrep -fl vite` and `lsof -nP -iTCP:4173 -sTCP:LISTEN`. At planning, exactly one Vite process ran: Mark's `vite preview --host` on port 4173, serving app/dist.
- The workspace allows only one Vite process (.planning/notes/2026-10-01-engineering-notes.md). If more than one Vite process from this workspace is running, kill every one except the 4173 preview.
- Never kill or restart the 4173 preview, and never write app/dist. This task starts no Vite server. It builds to a scratch directory and serves that through `startServers` from 08-walk-server.mjs on ephemeral 127.0.0.1 ports, as quick 261025-rjq did.
- Fallback, only if that server cannot start: run `npm --prefix app run build` and use the 4173 preview that is already running, at http://127.0.0.1:4173. Do not start a second Vite process. Say in the SUMMARY that app/dist was rebuilt, because that changes what Mark's iPad loads from 4173.

Step 1, the base build, before any edit:
- Record `git rev-parse HEAD` as the base commit for the SUMMARY.
- Set `S="${TMPDIR:-/tmp}/sprinkles-ubi"` and run `npm --prefix app run build -- --outDir "$S/base-dist" --emptyOutDir`. The chunk-size warning is expected.

Step 2, write the probe at .planning/quick/261027-ubi-fix-bug-p11-step-number-leadin-misaligne/261027-ubi-baseline-probe.mjs, modelled on 261025-rjq-step-probe.mjs. Keep these from it:
- a header comment giving purpose, gates and usage;
- the PLAYWRIGHT_CORE path with its environment override;
- the clickUntil retry helper, for the missed first click after a navigation;
- a context route that aborts every request to a host other than 127.0.0.1;
- PASS, FAIL and INFO lines ending "N PASS, M FAIL", with exit 1 on any FAIL.

When playwright-core is missing, the probe prints FAIL and installs nothing. Everything the probe types or prints is English.

Modes:
- `record <out.json>` needs PROBE_DIST to name a directory that holds index.html. It launches webkit, and chromium with channel 'chrome', and writes JSON.
- `check <after.json> --base <base.json>` compares two recorded files and opens no browser.

Configs, each with a 1366x1024 viewport:
- "1366 fine": hasTouch false, deviceScaleFactor 1.
- "1366 coarse": hasTouch true, deviceScaleFactor 1.
- "1366 coarse dpr2": hasTouch true, deviceScaleFactor 2 (Mark's iPad DPR).

In each run, wait for document.fonts.ready and a 300 ms settle, then measure:
- (a) Reading. /notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1, the first `li.method-step`: its `.method-step__n` and its `.method-step__lead`.
- (b) Open creation step.
  1. Go to /notebook and press the button "New recipe".
  2. Fill the field labelled exactly "Name" with "Probe sorbet", press "Start" and wait for `.mk-page`.
  3. Press the button named exactly "Add step". That is the heading's button; each step's own carries the aria-label "Step n, add a step after it". Wait for `li.mk-step input[data-field="lead-in"]`.
  4. Fill the lead-in with "Warm the milk".
  5. Measure the first `li.mk-step`'s `.method-step__n`, its lead-in input, and the top of its first `textarea.prose-field` (the instruction).
- (c) Preview. Press "Step 1, preview the step", wait for `.mk-preview li.method-step`, and measure that li's `.method-step__n` and `.method-step__lead`.
- (d) Information only, no gate, and this task does not change it. On the Olive Oil page, press "Next version" until `form[aria-label="Next version"]` shows, then "Step 1, edit this step" until `.method-step__open-fields` shows. Measure that step's `.method-step__n` and `.prose-field--lead-in`.

For each element, record:
- its page top and height (the rect plus scrollY, rounded to 0.01);
- its text baseline;
- its computed font-size, line-height, first font family, padding-top and padding-bottom, border-top and border-bottom widths, and min-height.

Text baseline, defined the same way for both builds so the figures compare:
- Insert a span with display inline-block, width 0, height 0, vertical-align baseline, and margin, padding and border 0.
- Put it as the last child of the number span, as the first child of `.method-step__lead`, and directly after the lead-in input (insertAdjacentElement 'afterend'). After the input, the span shares the input's line box, whose baseline is the input's text baseline.
- Read the span's rect bottom plus scrollY and remove it at once.

The difference is the lead-in baseline minus the number baseline; positive means the number sits above the text. Also record `matchMedia('(pointer: coarse)').matches`.

Check gates (tolerance 0.1 unless a gate says otherwise):
- U1, open creation step: the difference is at most 1.0 in absolute value, in every run.
- U2, reading step: number top, lead top and difference equal the base's.
- U3, preview: (lead top minus number top) and the difference equal the base's.
- U4, the open creation step's lead-in field top: with a coarse pointer it equals the base's; with a fine pointer, after minus base lies between 0 and 1.0.
- U5: instruction top minus lead-in bottom equals the base's, so the field rhythm is unchanged.
- U6: the coarse match equals hasTouch.

Print one line per run with the open step's figures, and one INFO line per run for the pen, so the SUMMARY can copy them.

Step 3, record the base. Run `PROBE_DIST="$S/base-dist" node <probe> record "$S/base.json"`, then `node <probe> check "$S/base.json" --base "$S/base.json"`. Expect U1 to FAIL in exactly the four coarse runs (two engines, two coarse configs), at about +8.5 (WebKit) and +8.0 (Chrome), and every other gate to PASS. If a DPR-1 base figure differs from the planning table in context by more than 0.5, stop and report: the cause has moved.

Step 4, the fix, per Mark's "fix" answer on bug-p11-step-number-leadin-misaligned.
- In app/src/styles/notebook.css, directly after the `.notebook .mk-step .prose-field--lead-in` rule, add one top-level rule with the selector `.notebook .mk-step` and one declaration only: `align-items: baseline`.
- Above it, add a comment in the file's own voice saying:
  - the open creation step's number sits on its lead-in's text baseline (bug-p11-step-number-leadin-misaligned, Mark's List, fix, 2026-10-28);
  - under a coarse pointer the lead-in field is --touch-min tall and centres its text, so the grid's default stretch left the number about 8.5 px above it;
  - the li is app.css's .method-step grid, and baseline alignment matches the number's first baseline to the body's, which is the lead-in's because its label is the body's first child;
  - it is a keyword, so it reads no token and adds none. Alignment is none of the token-governed values (colour, face, size, spacing, rule weight).
- No comment line may begin with the selector text, so the line-anchored grep gate below counts only the rule.

Scope: `.mk-step` exists only in CreationSteps.jsx, which serves both the creation editor and the Edit of a saved first version. These stay untouched:
- the reading step;
- the Preview's nested `li.method-step` (align-items does not inherit);
- the version pen (Method.jsx, `.method-step__open-fields`);
- print.

Do not edit app.css, print.css or any .jsx file. If U1 still fails in either engine with this rule, stop and report the figures. Do not add a padding, line-height or literal nudge: the planning run measured 0.00 in both engines with this exact rule.

Step 5, the after build and the check.
- Run `npm --prefix app run build -- --outDir "$S/after-dist" --emptyOutDir`.
- Run `PROBE_DIST="$S/after-dist" node <probe> record "$S/after.json"`.
- Run `node <probe> check "$S/after.json" --base "$S/base.json"`. Every gate passes and the exit code is 0.

Commit. Stage by path only: app/src/styles/notebook.css and the probe. Never use `git add -A`: untracked `.review-diagnostics/` folders sit in four phase directories and are not this task's. Use this message, in English: `fix(261027-ubi): set the open creation step's number on its lead-in baseline (bug-p11-step-number-leadin-misaligned)`.
  </action>
  <verify>
    <automated>S="${TMPDIR:-/tmp}/sprinkles-ubi"; node .planning/quick/261027-ubi-fix-bug-p11-step-number-leadin-misaligne/261027-ubi-baseline-probe.mjs check "$S/after.json" --base "$S/base.json" && test "$(grep -c '^\.notebook \.mk-step {' app/src/styles/notebook.css)" = 1</automated>
  </verify>
  <done>
- The base check showed U1 failing only in the four coarse runs, at about +8.5 (WebKit) and +8.0 (Chrome).
- The after check prints "N PASS, 0 FAIL" and exits 0: in every engine and config, the open creation step's number and lead-in text baselines agree within 1.0 px.
- The reading step, the Preview step and the field rhythm equal the base.
- The line-anchored grep prints 1 (it printed 0 at c90b6065).
- One commit holds notebook.css and the probe.
  </done>
</task>

<task type="auto">
  <name>Task 2: Pin the rule in notebook.test.js, prove the pen and the reading page did not move, run the suite</name>
  <files>app/src/styles/notebook.test.js</files>
  <read_first>
    - app/src/styles/notebook.test.js lines 1-24 (imports, the file-level `rules` from readAllRules), lines 633-660 (the per-describe declarationList helper to copy), lines 1220-1240 (the latest .mk-step describe and its exact-selector lookups)
    - app/src/styles/css-source.js (readAllRules: each rule's selector, declarations and media)
  </read_first>
  <action>
Append one describe at the end of app/src/styles/notebook.test.js. Title it "the open creation step sets its number on its lead-in's text baseline (bug-p11-step-number-leadin-misaligned, Mark 2026-10-28)". Put one comment line above it with the measured cause: under a coarse pointer the lead-in is 44 px tall; the number sat +8.53 px (WebKit) and +8.00 px (Chrome) above its text before the fix and 0 after (quick 261027-ubi probe).

Define a local declarationList helper as the 633-660 describe does (split on ';', trim, collapse whitespace, drop empties). Write two tests:

1. A top-level rule (media undefined) whose selector is exactly `.notebook .mk-step` exists, and its declaration list equals exactly ['align-items: baseline']. A second declaration, such as a padding or line-height nudge, fails the test.
2. Split each notebook.css rule's selector on commas. No rule with a part that ends in the bare `.method-step` class declares align-items. Match each trimmed part against `/\.method-step\s*$/`: the `__n` and `__body` elements and the `.mk-step` rule do not match. This keeps app.css's stretch, and the tops-aligned figures, for the reading step and the Preview's nested step. At planning the only such rule is `.notebook .mk-preview .method-step`, which declares gap only.

Run the file alone, then the whole suite.

Then the pen regression, with quick 261025-rjq's probe against both scratch builds from Task 1 (S as in Task 1). Use the probe's full path, .planning/quick/261025-rjq-fix-bug-pen-step-number-misaligned-the-v/261025-rjq-step-probe.mjs:
- record the base build: `PROBE_DIST="$S/base-dist" node <rjq probe> record "$S/rjq-base.json"`;
- record the after build: `PROBE_DIST="$S/after-dist" node <rjq probe> record "$S/rjq-after.json"`;
- check: `PROBE_DIST="$S/after-dist" node <rjq probe> check "$S/rjq-after.json" --base "$S/rjq-base.json"`.

Expect "48 PASS, 0 FAIL". G1 to G6 cover the pen's open and closed steps and the reading page at 1366 and 984, fine and coarse, so a pass proves this rule moved neither the pen nor the reading step. If the rjq check fails, stop and report the failing lines: the rule has leaked outside the creation editor.

Commit. Stage app/src/styles/notebook.test.js by path, with the message `test(261027-ubi): pin the open creation step's baseline rule (bug-p11-step-number-leadin-misaligned)`.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/styles/notebook.test.js && npm --prefix app test</automated>
  </verify>
  <done>
- notebook.test.js passes with 120 tests (118 at base).
- The whole suite passes with 4235 tests in 130 files (4233 in 130 at base).
- The rjq check prints "48 PASS, 0 FAIL".
- One commit holds notebook.test.js.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| probe to network | The probe drives real browsers against a local static server. Every other host must stay unreached. |
| task to Mark's device environment | Mark's iPad loads app/dist from the running 4173 preview, and its IndexedDB lives on that origin. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-261027-ubi-01 | Information disclosure | 261027-ubi-baseline-probe.mjs | low | mitigate | The context route aborts every request whose hostname is not 127.0.0.1 (the rjq probe's filter). The servers bind ephemeral 127.0.0.1 ports only. |
| T-261027-ubi-02 | Denial of service | Mark's 4173 preview and app/dist | medium | mitigate | Build to "$S/base-dist" and "$S/after-dist" only. Never kill or restart the 4173 preview. The app/dist rebuild happens only on the named fallback, and the SUMMARY reports it. |
| T-261027-ubi-03 | Tampering | app/src/styles/notebook.css | low | accept | A layout keyword in an existing scoped stylesheet. No markup, no store access, no new input path. notebook.test.js's existing GUARD-05 tests still hold: no literal, every rule under .notebook. |
| T-261027-ubi-SC | Tampering | npm/pip/cargo installs | low | accept | This plan installs no package. playwright-core comes from the existing npx cache; when it is missing, the probe fails and the executor stops rather than installing. |
</threat_model>

<verification>
- Task 1's probe check passes in WebKit and Chrome at 1366 fine, 1366 coarse and 1366 coarse at DPR 2, with the open creation step's baselines within 1.0 px.
- The rjq probe prints 48 PASS, 0 FAIL against the base build.
- `npm --prefix app test` passes.
- After Task 2's commit, `git log -2 --name-only --format= | sort -u` lists exactly these three paths and no other:
  - .planning/quick/261027-ubi-fix-bug-p11-step-number-leadin-misaligne/261027-ubi-baseline-probe.mjs
  - app/src/styles/notebook.css
  - app/src/styles/notebook.test.js
- app.css, print.css and app/src/ui are untouched.
- `pgrep -fl vite` at the end shows the same processes as at Step 0, with no extra Vite process left running.
</verification>

<success_criteria>
- On the creation editor's open step, the number's text baseline is within 1.0 px of the lead-in's text baseline in WebKit and Chrome, with fine and coarse pointers, at DPR 1 and 2. The figures are recorded before and after.
- The reading step, the Preview step, the version pen and print are unchanged.
- One rule, no token added, no literal.
- The suite passes, and two commits name bug-p11-step-number-leadin-misaligned.
</success_criteria>

<output>
Create `.planning/quick/261027-ubi-fix-bug-p11-step-number-leadin-misaligne/261027-ubi-SUMMARY.md`. It holds:

- The base commit and the two commit hashes.
- A table, one row per engine and config, for the open creation step, base and after:
  - the number's top, height, baseline, font-size, line-height, font family, padding and border;
  - the lead-in's top, height, baseline, font-size, line-height, padding, border and min-height;
  - the difference.
- The offset and its direction in words, for example: "under a coarse pointer the number sat 8.53 px above the lead-in's text baseline in WebKit, 8.00 in Chrome; with a fine pointer it was within 1 px already".
- The reading step's comparison figures: unchanged, tops aligned, the number's baseline 4 px below its lead's.
- The Preview step: unchanged.
- The pen's INFO figures.
- The rjq check result.
- The test counts, and the line "no snapshot test changed (the suite has no snapshot tests)".
- Whether app/dist was rebuilt. It should not have been.

Under "For the orchestrator":
1. Close bug-p11-step-number-leadin-misaligned on Mark's List: status done, resolvedAt from the clock, and a one-line reply with the before and after figures and the commit hashes. The executor has no ArtifactData and writes no row.
2. Mark's 4173 preview serves app/dist, which this task did not rebuild. The fix reaches his iPad only after `npm --prefix app run build` and a reload, and it stays device-unverified until he confirms it on the iPad. Safe to push to dist: yes. The change is CSS only, with no store write.
3. The version pen's open step shows the same offset under a coarse pointer (planning: +8.53 WebKit, +8.00 Chrome, tops aligned since quick 261025-rjq). This task left it alone, as the bug text asked. It is a candidate bug for Mark to triage; the orchestrator decides whether it becomes a row.
4. The sketch 014 board draws the open step with the number top level with the 44 px field's top (README line 112; P11_CSS sets no align-items on .mk-step). On Mark's fix answer, the app now differs from that figure. Route the board and README update (P11_CSS in .planning/canvas-generators/p11.py) to Sid, so the sketch stays the single authority.
5. The reading step aligns tops, and its number's baseline sits 4 px below its lead's. That is outside this bug and is only reported here.
</output>
