---
phase: quick-261031-fdd
plan: 01
quick_id: 261031-fdd
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/styles/app.css
  - app/src/styles/notebook.css
  - app/src/styles/notebook.test.js
  - app/src/styles/cross-cutting.test.js
  - .planning/quick/261027-ubi-fix-bug-p11-step-number-leadin-misaligne/261027-ubi-baseline-probe.mjs
autonomous: true
requirements:
  - look-p11-reading-step-baseline
  - bug-p11-pen-step-number-leadin-misaligned

estimate:
  tokens: 45000
  raw_tokens: 45000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "On the reading page (/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1, step 1), in Playwright WebKit and in Chrome (playwright-core chromium, channel 'chrome') at 1366x1024 with a fine pointer, a coarse pointer, and a coarse pointer at DPR 2, the number's text baseline and the lead's text baseline coincide within 0.1 px. At planning (HEAD 6c2beb74) the lead's baseline sat 3.97 px (WebKit) / 4.00 px (Chrome) above the number's; with the rule injected, 0.00 in all six runs. The number keeps its place; the lead moves down 3.97 / 4.00."
    - "On the version pen's open step 1 (Next version, then 'Step 1, edit this step'), in the same six runs, the number's text baseline and the lead-in field's text baseline coincide within 0.1 px. At planning: coarse +8.53 (WebKit) / +8.00 (Chrome), fine -0.58 / -1.00; with the rule injected, 0.00 in all six. Under a coarse pointer the field keeps its place and the number moves down to its text; under a fine pointer the number keeps its place and the field moves down at most 1.0."
    - "The creation editor's Preview step reads the same: baselines within 0.1, the lead 3.97 / 4.00 below the number's top. The creation editor's open step (fixed in quick 261027-ubi) is unchanged: baselines 0.00, its lead-in field top and the field rhythm equal the base build's."
    - "Sketch 014 decision 10 is one app rule: app.css's top-level .method-step grid rule declares align-items: baseline, and no other rule in app.css or notebook.css declares align-items on the step li (a selector part ending in .method-step or .mk-step). notebook.css's .mk-step rule from 438dc880 and its comment are gone. No token read, none added, no literal."
    - "The 261027-ubi probe's U2 and U3 are re-based on decision 10 (baselines coincide; the lead moves down by the base's old offset) and a gate U7 covers the pen's open step. Its check of the after build against the HEAD build prints 42 PASS, 0 FAIL."
    - "npm --prefix app test passes: 4235 tests in 130 files at base and after (the two tests move, net zero); notebook.test.js 120 to 118, cross-cutting.test.js 91 to 93. The suite has no snapshot tests."
  artifacts:
    - path: app/src/styles/app.css
      provides: "The .method-step grid rule aligns its two items (number and body) on their first baselines, for every li.method-step the app renders"
      contains: "align-items: baseline"
    - path: app/src/styles/cross-cutting.test.js
      provides: "One describe naming sketch 014 decision 10: the .method-step rule's exact declaration list, and no other app.css or notebook.css rule declaring align-items on the step li"
      contains: "decision 10"
    - path: .planning/quick/261027-ubi-fix-bug-p11-step-number-leadin-misaligne/261027-ubi-baseline-probe.mjs
      provides: "U2 and U3 re-based on decision 10, U7 gating the pen's open step"
      contains: "U7"
  key_links:
    - from: app/src/styles/app.css
      to: app/src/ui/Method.jsx
      via: "li.method-step is a two-item grid: span.method-step__n and div.method-step__body. The body's first baseline is its first child's: p.method-step__lead on the reading, recording and closed pen steps (Method.jsx lines 384, 725, 780; StepReading.jsx line 69), and the lead-in input inside .method-step__open-fields on the pen's open step (Method.jsx lines 148-158)"
      pattern: "method-step__body"
    - from: app/src/styles/app.css
      to: app/src/ui/CreationSteps.jsx
      via: "li.method-step.mk-step (line 78) gets the same rule from app.css that notebook.css's .mk-step rule gave it, so dropping that rule changes nothing measured"
      pattern: "method-step mk-step"
---

<objective>
Sketch 014 decision 10, approved by Mark on 2026-10-31 (look-p11-reading-step-baseline): the step number sits on its lead-in's text baseline on every step, read or edited. This closes bug-p11-pen-step-number-leadin-misaligned.

The change, per the sketch's "For the plan" item 9:
- app.css's `.method-step` grid rule gains `align-items: baseline`.
- notebook.css's `.notebook .mk-step` rule (commit 438dc880, quick 261027-ubi) then says the same thing twice. It goes, with its comment, and its test moves from notebook.test.js to cross-cutting.test.js, asserting the rule on `.method-step`.
- Quick 261027-ubi's probe gates U2 and U3 on the old tops-aligned figures. They are re-based, and a new gate covers the pen's open step.

The rule reaches every `li.method-step`: the reading page and the batch sheet's recording steps (Method.jsx), the creation editor's open step and Preview (CreationSteps.jsx, StepReading.jsx), and the version pen's closed and open steps (Method.jsx). The struck number (`.method-step__n--struck`) is a text-decoration on the same text and needs nothing.

"The app.css test" in the task text: no test file is named after app.css. cross-cutting.test.js reads app.css through css-source.js, already pins the print block's `.method-step` rule, and covers rules that reach the whole app, so the moved test goes there (planner's choice).

Purpose: the number reads as part of its step's first line everywhere, as the creation editor's open step already does.
Output: one declaration in app.css, one rule and comment removed from notebook.css, one describe moved, the 261027-ubi probe re-based.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@.claude/CLAUDE.md
@.planning/quick/261027-ubi-fix-bug-p11-step-number-leadin-misaligne/261027-ubi-baseline-probe.mjs
@.planning/quick/261027-ubi-fix-bug-p11-step-number-leadin-misaligne/261027-ubi-SUMMARY.md

Sketch 014 README (.planning/sketches/014-steps-structure-save/README.md): decision 10 is line 87, "For the plan" item 9 is line 113. Mark approved the board on 2026-10-31.

Planning measurements. HEAD 6c2beb74 built to a scratch directory and probed with the unmodified 261027-ubi probe. "After" is the same build with `.method-step { align-items: baseline }` injected through a context init script in a scratch copy of the probe. Page coordinates in px. Diff is the lead's baseline minus the number's; positive means the number sits above the text.

Reading step (Olive Oil v1, step 1):

| Engine | Config | Base number top / baseline | Base lead top / baseline | Base diff | After lead top | After diff |
| ------ | ------ | -------------------------- | ------------------------ | --------- | -------------- | ---------- |
| WebKit | fine, coarse | 1582.81 / 1601.86 | 1582.81 / 1597.89 | -3.97 | 1586.78 | 0.00 |
| WebKit | coarse DPR 2 | 1593.31 / 1612.36 | 1593.31 / 1608.39 | -3.97 | 1597.28 | 0.00 |
| Chrome | all three | 1579.44 / 1598.44 | 1579.44 / 1594.44 | -4.00 | 1583.44 | 0.00 |

In every run the number's top and baseline do not move.

Preview step inside the open creation step:
- The tops were equal at base, and the diff was -3.97 (WebKit) / -4.00 (Chrome).
- After, the lead's top sits 3.97 / 4.00 below the number's top, and the diff is 0.00.

The version pen's open step 1, number against the lead-in field:

| Engine | Config | Base number top / baseline | Base field top / baseline | Base diff | After | After diff |
| ------ | ------ | -------------------------- | ------------------------- | --------- | ----- | ---------- |
| WebKit | fine | 2012.64 / 2031.69 | 2012.64 / 2031.11 | -0.58 | field top 2013.22, number unmoved | 0.00 |
| WebKit | coarse | 2271.89 / 2290.94 | 2271.89 / 2299.47 | +8.53 | number top 2280.42, field unmoved | 0.00 |
| WebKit | coarse DPR 2 | 2282.39 / 2301.44 | 2282.39 / 2309.97 | +8.53 | number top 2290.92, field unmoved | 0.00 |
| Chrome | fine | 2009.31 / 2028.31 | 2009.31 / 2027.31 | -1.00 | field top 2010.31, number unmoved | 0.00 |
| Chrome | coarse, coarse DPR 2 | 2268.56 / 2287.56 | 2268.56 / 2295.56 | +8.00 | number top 2276.56, field unmoved | 0.00 |

The creation editor's open step was 0.00 at base and stayed 0.00 after. Its field tops and the 6 px field rhythm did not move.

The number's box drops from the stretched row height (85.19 on the reading step, up to 329.66 on the pen) to its own line (23 WebKit, 24 Chrome). It is aria-hidden text with no border or background, so only its position changes on screen.

The unmodified probe's check of after against base printed 24 PASS, 12 FAIL. The failures were U2 and U3 in all six runs, exactly the gates this plan re-bases.

Rules that target the step li at HEAD (css-source.js readAllRules over app.css and notebook.css; a selector part ending in .method-step or .mk-step):
- app.css top-level `.method-step`: display grid, grid-template-columns auto 1fr, gap var(--gap-s).
- app.css `.method-step + .method-step`: margin-top only.
- app.css @media print `.method-step`: break-inside only.
- notebook.css `.notebook .mk-step`: align-items baseline (the rule this plan drops).
- notebook.css `.notebook .mk-preview .method-step`: gap only.
print.css has no `.method-step` rule. The print route (PrintSheetPages.jsx) renders no li.method-step.

Gate baselines at HEAD:
- `grep -c '^\.notebook \.mk-step {' app/src/styles/notebook.css` prints 1.
- The app.css `.method-step` block (`sed -n '/^\.method-step {/,/^}/p'`) holds no align-items, so `grep -q 'align-items: baseline'` on it fails.
- The test counts: notebook.test.js 120, cross-cutting.test.js 91, suite 4235 in 130 files.

Processes at planning: one Vite process, Mark's `vite preview --host` on port 4173 (pid 31386, serving app/dist).
</context>

<tasks>

<task type="tracer">
  <name>Task 1: Re-base the 261027-ubi probe on decision 10, add the baseline to app.css's .method-step grid, and measure base and after in WebKit and Chrome</name>
  <files>.planning/quick/261027-ubi-fix-bug-p11-step-number-leadin-misaligne/261027-ubi-baseline-probe.mjs, app/src/styles/app.css</files>
  <precondition>playwright-core resolves at /Users/mark/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs (or $PLAYWRIGHT_CORE), WebKit is in ~/Library/Caches/ms-playwright/webkit-2359, Google Chrome is installed for channel 'chrome', and app/node_modules exists so `npm --prefix app run build` works. All four held at planning. If one is missing, stop and report. Do not install anything.</precondition>
  <read_first>
    - .planning/quick/261027-ubi-fix-bug-p11-step-number-leadin-misaligne/261027-ubi-baseline-probe.mjs (the whole file: header lines 1-21, the check block from "// check" to the end)
    - app/src/styles/app.css lines 1114-1135 (.method-steps, .method-step, .method-step + .method-step, .method-step__n)
    - .planning/sketches/014-steps-structure-save/README.md lines 87 and 113 (decision 10 and "For the plan" item 9)
    - app/src/ui/Method.jsx lines 143-160 and 378-386 (the pen's open and closed step bodies: the lead-in field and the lead are each body's first content)
  </read_first>
  <action>
Step 0, processes. Run `pgrep -fl vite` and `lsof -nP -iTCP:4173 -sTCP:LISTEN`. At planning exactly one Vite process ran: Mark's `vite preview --host` on 4173, serving app/dist.
- The workspace allows only one Vite process (.planning/notes/2026-10-01-engineering-notes.md). If more than one Vite process from this workspace is running, kill every one except the 4173 preview.
- Never kill or restart the 4173 preview, and never write app/dist. This task starts no Vite server: it builds to a scratch directory, and the probe serves that through 08-walk-server.mjs on ephemeral 127.0.0.1 ports.

Step 1, the base build, before any edit. Record `git rev-parse HEAD` as the base commit for the SUMMARY (6c2beb74 at planning). Set `S="${TMPDIR:-/tmp}/sprinkles-fdd"` and run `npm --prefix app run build -- --outDir "$S/base-dist" --emptyOutDir`. The chunk-size warning is expected.

Step 2, re-base the probe's check mode (record mode stays as it is, so base and after files are measured identically). In .planning/quick/261027-ubi-fix-bug-p11-step-number-leadin-misaligne/261027-ubi-baseline-probe.mjs:
- U2, the reading step, becomes three conditions, each within TOL (0.1):
  - the number top equals the base's;
  - the lead top minus the base's lead top equals minus the base's diff, so the lead moves down by the base's old offset;
  - the diff is 0.
  Against a base already on decision 10 (diff 0) this reads as "unchanged", so the gate holds for later re-runs too. Print the after and base figures on the line, as now.
- U3, the Preview step, becomes two conditions, each within TOL:
  - (lead top minus number top) equals the base's (lead top minus number top) minus the base's diff;
  - the diff is 0.
- U7, new: the version pen's open step. This replaces the INFO pen line, and its figures print on the gate's line instead. Two conditions:
  - the pen's diff is 0 within TOL;
  - the pen's lead-in field top, after minus base: with a coarse pointer it equals 0 within TOL, and with a fine pointer it lies between -TOL and 1.0, the same shape as U4.
- Leave U1, U4, U5 and U6, the CONFIGS, the record mode, the 0.1 tolerance and the final "N PASS, M FAIL" line as they are.
- Update the header comment's gate list to match:
  - U2 and U3 now state decision 10's expectation and name quick 261031-fdd and sketch 014 decision 10 as the reason for the re-base;
  - add U7;
  - remove the line saying the pen gets INFO lines only and is left alone.
  Everything the probe prints stays English.

Step 3, record the base. Run `PROBE_DIST="$S/base-dist" node .planning/quick/261027-ubi-fix-bug-p11-step-number-leadin-misaligne/261027-ubi-baseline-probe.mjs record "$S/base.json"`, then check the base against itself with `node <probe> check "$S/base.json" --base "$S/base.json"`.
- Expect 24 PASS, 18 FAIL: U2, U3 and U7 fail in all six runs, because the base does not meet decision 10, and U1, U4, U5 and U6 pass.
- If a DPR-1 base figure differs from the planning tables in context by more than 0.5, stop and report: the cause has moved.

Step 4, the fix, per sketch 014 decision 10 and "For the plan" item 9. In app/src/styles/app.css, the top-level `.method-step` rule (the grid, line 1120 at planning) gains one declaration, `align-items: baseline`, as its last line. It keeps display, grid-template-columns and gap as they are.

Above the rule, add a short comment in the file's own voice saying:
- the number sits on its lead's text baseline on every step, read or edited (sketch 014 decision 10; look-p11-reading-step-baseline, Mark 2026-10-31; closes bug-p11-pen-step-number-leadin-misaligned);
- the body's first baseline is its first child's: the lead on a read step, the lead-in field on an open one;
- it is a keyword, so it reads no token and adds none.

No comment line may begin with the rule's selector text, so the line-anchored sed range in the verify finds only the rule.

Do not touch:
- `.method-step__n` or `.method-step__n--struck`;
- the `.method-step + .method-step` rule;
- the @media print `.method-step` rule;
- print.css, or any file under app/src/ui.

Leave notebook.css alone in this task; Task 2 drops its duplicate. If U2, U3 or U7 still fails in either engine with this rule, stop and report the figures. Do not add a padding, line-height or literal nudge: the planning run measured 0.00 everywhere with this exact rule.

Step 5, the after build and the check.
- Run `npm --prefix app run build -- --outDir "$S/after-dist" --emptyOutDir`.
- Run `PROBE_DIST="$S/after-dist" node <probe> record "$S/after.json"`.
- Run `node <probe> check "$S/after.json" --base "$S/base.json"`. Expect 42 PASS, 0 FAIL and exit 0.

Commit. Stage by path only: app/src/styles/app.css and the probe. Never use `git add -A`: untracked `.review-diagnostics/` folders sit in four phase directories and are not this task's. Use this message, in English: `fix(261031-fdd): every step's number sits on its lead's text baseline (look-p11-reading-step-baseline, bug-p11-pen-step-number-leadin-misaligned)`.
  </action>
  <verify>
    <automated>S="${TMPDIR:-/tmp}/sprinkles-fdd"; node .planning/quick/261027-ubi-fix-bug-p11-step-number-leadin-misaligne/261027-ubi-baseline-probe.mjs check "$S/after.json" --base "$S/base.json" && sed -n '/^\.method-step {/,/^}/p' app/src/styles/app.css | grep -q 'align-items: baseline'</automated>
  </verify>
  <done>
- The base check printed 24 PASS, 18 FAIL, with U2, U3 and U7 failing in all six runs: the reading and Preview diff at about -3.97 (WebKit) / -4.00 (Chrome), and the pen at about +8.5 / +8.0 coarse and -0.58 / -1.00 fine.
- The after check prints "42 PASS, 0 FAIL" and exits 0. On the reading step, the Preview step and the pen's open step, the number and lead baselines coincide within 0.1 px in both engines and all three configs. The creation editor's open step, its field top and its field rhythm equal the base.
- The sed-range grep finds align-items: baseline inside the `.method-step` block (it found none at 6c2beb74).
- One commit holds app.css and the probe.
  </done>
</task>

<task type="auto">
  <name>Task 2: Drop notebook.css's duplicate .mk-step rule, move its test to cross-cutting.test.js on .method-step, re-measure, run the suite</name>
  <files>app/src/styles/notebook.css, app/src/styles/notebook.test.js, app/src/styles/cross-cutting.test.js</files>
  <read_first>
    - app/src/styles/notebook.css lines 213-230 (the lead-in weight rule, then the comment and the one-declaration .mk-step rule from 438dc880, then the targets-line comment)
    - app/src/styles/notebook.test.js lines 1259-1286 (the last describe and the two comment lines above it)
    - app/src/styles/cross-cutting.test.js lines 1-62 (imports, STYLES_DIR, the file-level rules and ruleFor) and lines 1245-1276 (the end of the file)
    - app/src/styles/css-source.js (readAllRules: selector, declarations and media per rule)
  </read_first>
  <action>
Step 1, notebook.css. Delete the one-declaration rule whose selector is exactly `.notebook .mk-step` (align-items baseline) and the whole comment block directly above it, the one that opens "The open creation step's number sits on its lead-in's text baseline". Leave the `.prose-field--lead-in` weight rule above it and the targets-line comment and rules below it as they are, with one blank line between rules as the file has it. Change nothing else in notebook.css.

Step 2, notebook.test.js. Delete the last describe, titled "the open creation step sets its number on its lead-in's text baseline (...)", and the two comment lines directly above it. Change nothing else.

Step 3, cross-cutting.test.js. Append one describe at the end of the file, titled "every step sets its number on its lead's text baseline (sketch 014 decision 10; look-p11-reading-step-baseline, Mark 2026-10-31)".

Above it, put a comment of two or three lines saying:
- before the rule, the reading step's lead baseline sat 3.97 px (WebKit) / 4.00 px (Chrome) above the number's, and the pen's open step's lead-in sat 8.53 / 8.00 px below it under a coarse pointer;
- after it, both are 0 (quick 261031-fdd; the 261027-ubi probe, re-based);
- the rule replaces notebook.css's open-step rule from quick 261027-ubi.

Define a local declarationList helper as the moved describe did: split on ';', trim, collapse whitespace, drop empties. Then write two tests:
1. `ruleFor('.method-step')`, the top-level app.css rule, exists, and its declaration list equals exactly ['display: grid', 'grid-template-columns: auto 1fr', 'gap: var(--gap-s)', 'align-items: baseline']. A nudge added to the grid fails it.
2. Only that rule sets the step li's alignment. Read notebook.css with readAllRules(readFileSync(path.join(STYLES_DIR, 'notebook.css'), 'utf8')) beside the file's app.css rules, with every media included.
   - Collect each rule that declares align-items and has a comma-separated selector part that, trimmed, matches /\.(method-step|mk-step)\s*$/.
   - Leave out app.css's top-level `.method-step` itself (media undefined).
   - The result equals [].
   Element classes such as `.method-step__n` do not match. At planning, after Step 1, the only other li rules are `.method-step + .method-step` (margin-top), the print block's `.method-step` (break-inside) and `.notebook .mk-preview .method-step` (gap).

readFileSync, path and STYLES_DIR are already in scope in cross-cutting.test.js; add no import that is not needed.

Step 4, run the tests:
- `npm --prefix app test -- src/styles/notebook.test.js src/styles/cross-cutting.test.js`: 118 and 93 tests (120 and 91 at base).
- `npm --prefix app test`: 4235 in 130 files, unchanged, since the two tests moved.

Step 5, re-measure with notebook.css's rule gone, to prove the drop moved nothing. With S as in Task 1:
- run `npm --prefix app run build -- --outDir "$S/after-dist" --emptyOutDir`, then `PROBE_DIST="$S/after-dist" node .planning/quick/261027-ubi-fix-bug-p11-step-number-leadin-misaligne/261027-ubi-baseline-probe.mjs record "$S/after.json"`;
- run `node <probe> check "$S/after.json" --base "$S/base.json"`. Expect 42 PASS, 0 FAIL again.
- Do not run quick 261025-rjq's probe as a regression gate. Its G1 (pen open step tops equal) and its G3, G4 and G5 (reading and pen tops equal the base) encode the tops contract that decision 10 supersedes, so they fail by design against a pre-change base.

Commit. Stage by path only: app/src/styles/notebook.css, app/src/styles/notebook.test.js and app/src/styles/cross-cutting.test.js. Use this message, in English: `refactor(261031-fdd): drop notebook.css's open-step baseline rule, now app.css's, and move its test (look-p11-reading-step-baseline)`.
  </action>
  <verify>
    <automated>S="${TMPDIR:-/tmp}/sprinkles-fdd"; npm --prefix app test -- src/styles/notebook.test.js src/styles/cross-cutting.test.js && npm --prefix app test && test "$(grep -c '^\.notebook \.mk-step {' app/src/styles/notebook.css)" = 0 && node .planning/quick/261027-ubi-fix-bug-p11-step-number-leadin-misaligne/261027-ubi-baseline-probe.mjs check "$S/after.json" --base "$S/base.json"</automated>
  </verify>
  <done>
- notebook.test.js passes with 118 tests (120 at base), and cross-cutting.test.js with 93 (91 at base).
- The whole suite passes with 4235 tests in 130 files (4235 at base).
- The line-anchored grep for the `.notebook .mk-step` rule prints 0 (1 at base). `git diff HEAD~1 -- app/src/styles/notebook.css` shows only the removed comment block and rule.
- The re-measured check prints "42 PASS, 0 FAIL".
- One commit holds notebook.css, notebook.test.js and cross-cutting.test.js.
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
| T-261031-fdd-01 | Information disclosure | 261027-ubi-baseline-probe.mjs | low | mitigate | The context route still aborts every request whose hostname is not 127.0.0.1, and the servers bind ephemeral 127.0.0.1 ports only. The re-base touches check mode only and leaves the route as it is. |
| T-261031-fdd-02 | Denial of service | Mark's 4173 preview and app/dist | medium | mitigate | Builds go to "$S/base-dist" and "$S/after-dist" only. The 4173 preview is never killed or restarted, and app/dist is never written. |
| T-261031-fdd-03 | Tampering | app/src/styles/app.css, notebook.css | low | accept | One layout keyword added to an existing rule, and one duplicate removed. There is no markup, no store access and no new input path. binder.test.js's no-literal guard and notebook.test.js's GUARD-05 tests still hold. |
| T-261031-fdd-SC | Tampering | npm/pip/cargo installs | low | accept | This plan installs no package. playwright-core comes from the existing npx cache; when it is missing, the probe fails and the executor stops rather than installing. |
</threat_model>

<verification>
- The 261027-ubi probe's check of the final after build against the HEAD build prints 42 PASS, 0 FAIL in WebKit and Chrome at 1366 fine, 1366 coarse and 1366 coarse at DPR 2.
- `npm --prefix app test` passes with 4235 tests in 130 files.
- After Task 2's commit, `git log -2 --name-only --format= | sort -u` lists exactly these five paths and no other:
  - .planning/quick/261027-ubi-fix-bug-p11-step-number-leadin-misaligne/261027-ubi-baseline-probe.mjs
  - app/src/styles/app.css
  - app/src/styles/cross-cutting.test.js
  - app/src/styles/notebook.css
  - app/src/styles/notebook.test.js
- print.css and app/src/ui are untouched (`git diff --stat HEAD~2 -- app/src/styles/print.css app/src/ui` prints nothing).
- `pgrep -fl vite` at the end shows the same processes as at Step 0, with no extra Vite process left running.
</verification>

<success_criteria>
- On the reading step, the Preview step and the version pen's open step, the number's text baseline coincides with the lead's within 0.1 px in WebKit and Chrome, with fine and coarse pointers, at DPR 1 and 2. The base and after figures are recorded.
- The creation editor's open step is unchanged.
- One declaration in app.css, the duplicate gone from notebook.css, no token added and no literal.
- The suite passes, and the moved test pins the rule on `.method-step`.
</success_criteria>

<output>
Create `.planning/quick/261031-fdd-step-numbers-sit-on-their-lead-in-baseli/261031-fdd-SUMMARY.md`. It holds:

- The base commit and the two commit hashes.
- One table per area (reading step, Preview step, the pen's open step, the creation editor's open step), one row per engine and config, base and after, giving:
  - the number's top and baseline;
  - the lead's or field's top and baseline;
  - the diff.
- The offset and its direction in words, for example: "on the reading step the lead's baseline sat 3.97 px above the number's in WebKit, 4.00 in Chrome; now 0, the lead 3.97 / 4.00 lower and the number unmoved".
- The base and after check results (24 PASS, 18 FAIL, then 42 PASS, 0 FAIL).
- The test counts, and the line "no snapshot test changed (the suite has no snapshot tests)".
- Whether app/dist was rebuilt. It should not have been.

Under "For the orchestrator":
1. Close bug-p11-pen-step-number-leadin-misaligned on Mark's List, and look-p11-reading-step-baseline if it is still open. Each gets status done, resolvedAt from the clock, and a one-line reply with the before and after figures and the commit hashes. The executor has no ArtifactData and writes no row.
2. Mark's 4173 preview serves app/dist, which this task did not rebuild. The change reaches his iPad only after `npm --prefix app run build` and a reload, and it stays device-unverified until he sees it there. Safe to push to dist: yes. The change is CSS only, with no store write.
3. Quick 261025-rjq's probe (.planning/quick/261025-rjq-fix-bug-pen-step-number-misaligned-the-v/261025-rjq-step-probe.mjs) still encodes the superseded contract:
   - G1 holds the pen's open step to tops equal;
   - G3, G4 and G5 hold reading and pen tops equal to the base.
   Checked against a pre-fdd base, it now fails by design. This plan left it unedited; re-base it or retire it.
4. Sketch 014 README decision 10 still ends "waits on look-p11-reading-step-baseline". Decision 9 records its app commit (438dc880). Route the same record for decision 10 to Sid, with this plan's commits. Decision 10 notes that sketch 011's pen boards still draw tops; whether they change is Sid's call.
5. Two places the rule reaches that the probe does not measure:
   - The batch sheet's recording steps have the same body grammar, with the lead first.
   - A browser print of a page other than the print route prints the screen steps, and app.css's @media print keeps their grid.
   The print route (PrintSheetPages.jsx, print.css) renders no li.method-step and is unchanged.
</output>
