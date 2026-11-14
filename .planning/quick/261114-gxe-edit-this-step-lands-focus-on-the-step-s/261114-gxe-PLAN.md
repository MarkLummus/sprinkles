---
phase: quick-261114-gxe
plan: 01
quick_id: 261114-gxe
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/ui/Method.jsx
  - app/src/ui/RecipePage.perStep.test.jsx
  - .planning/quick/261114-gxe-edit-this-step-lands-focus-on-the-step-s/261114-gxe-probe.mjs
autonomous: true
requirements:
  - bug-edit-this-step-focus-on-cancel

estimate:
  tokens: 50000
  raw_tokens: 50000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "In the version pen (Next version on Olive Oil v1), pressing 'Step 1, edit this step' opens Step 1 with focus in the field labelled 'Step 1, lead-in', whether the press is a keyboard Return on the focused button or a pointer click with no focus on the button. document.activeElement is that textarea, not a button reading Cancel."
    - "A second Return after Edit this step no longer cancels: the lead-in holds Return (holdReturn), so the step stays open, its lead-in value is unchanged and focus stays in it."
    - "Opening one step while another is open lands focus in the newly opened step's own lead-in."
    - "Cancel on an open step does what it did before (restores that step from the version the pen opened on) and focus after it lands where it landed at the base commit: on that step's own 'Step N, edit this step' button. Done's focus landing is also unchanged."
    - "The creation editor behaves exactly as at the base commit: CreationSteps.jsx, CreationPage.jsx and the useOnDemandField hook are untouched, and its suites pass."
    - "The built app shows the fix in Playwright WebKit and in Chrome at 1366x1024 with a fine and a coarse pointer, compared with a build of the base commit taken before the fix."
  artifacts:
    - path: app/src/ui/Method.jsx
      provides: "StepPenBody holds leadInRef on the open step's lead-in textarea and an effect that focuses it when the step opens (isOpen turns true)"
      contains: "leadInRef"
    - path: app/src/ui/RecipePage.perStep.test.jsx
      provides: "Three jsdom tests through the real RecipePage: keyboard open lands in the lead-in, pointer open lands in the lead-in, and the Cancel landing guard"
      contains: "bug-edit-this-step-focus-on-cancel"
    - path: .planning/quick/261114-gxe-edit-this-step-lands-focus-on-the-step-s/261114-gxe-probe.mjs
      provides: "Record/check browser probe over scratch builds of the base commit and of the fix, in WebKit and Chrome"
      contains: "record"
  key_links:
    - from: app/src/ui/Method.jsx
      to: app/src/ui/Method.jsx
      via: "StepPenBody's Edit this step (handleOpen) calls onOpen, which reaches Method's handleOpenStep, the only non-null setter of openStepN; isOpen turns true and the new effect calls leadInRef.current.focus()"
      pattern: "leadInRef"
    - from: app/src/ui/RecipePage.perStep.test.jsx
      to: app/src/ui/Method.jsx
      via: "The tests mount the whole RecipePage over Olive Oil v1, press Next version, then press a step's Edit this step, and read document.activeElement"
      pattern: "bug-edit-this-step-focus-on-cancel"
---

<objective>
Fix Mark's List row `bug-edit-this-step-focus-on-cancel` (minor; Mark said on 2026-11-14 to fix it): in the version pen, after Edit this step, focus goes into the opened step's first field, the lead-in ("Step N, lead-in"), not onto Cancel.

**Cause, confirmed at planning HEAD 5637d45d by a jsdom probe through the real RecipePage (the probe file was removed; the tree is clean).** It is not a focus call. React reuses the same `<button>` DOM node. StepPenBody (Method.jsx, `export function StepPenBody`) renders `isOpen ? <div className="method-step__body">…</div> : <div className="method-step__body">…</div>`. Both branches are the same element type at the same place, and their children are unkeyed. The closed branch's 10th child slot is `<p className="method-step__acts">` with [Button "Edit this step", span, Button "Remove"]. The open branch's 10th child slot is `<p className="method-step__done-cancel">` with [Button "Cancel", Button "Done"]. Positional reconciliation matches p to p, then Button to Button at index 0. So the focused Edit this step button is kept and re-rendered as the step's own Cancel. Focus never moves: it was already on the node that now reads Cancel. Probe output at HEAD: after focus + click on "Step 1, edit this step", activeElement is `BUTTON text=Cancel`, the same node as the Edit button (`same node: true`). It is the step's own Cancel, not the pen's.

The same reuse runs in reverse, and the plan must keep it. Probe at HEAD: after focus + click on the open step's Cancel, activeElement is the button labelled "Step 1, edit this step", the same node again. After Done, activeElement is BODY (Done sits at index 1, the closed branch has a span there, so the node is dropped).

**The fix (probed at planning on a temporary copy, then restored):** StepPenBody gets `leadInRef` on the open branch's lead-in textarea, plus an effect on `[isOpen]` that focuses it when `isOpen` is true. With that change the probe read: after open, `TEXTAREA label=Step 1, lead-in`. After opening Step 2 too, `Step 2, lead-in`. After Cancel, `BUTTON label=Step 1, edit this step`, the same as HEAD. After Done, BODY, the same as HEAD. Method.test.jsx, CreationSteps.test.jsx and RecipePage.perStep.test.jsx all passed (154/154).

**Rejected: keying the two branches or the two `<p>` lines so React stops reusing the node.** That would also break the reverse reuse, so focus after Cancel would drop to the body. The task forbids changing where focus goes after Cancel. Do not add a `key`, and do not restructure either branch's children.

**What the sketches say (looked at during planning; Task 1 re-checks).** Nothing names a different landing spot, so the row's chosen fix, the lead-in, stands:
- Sketch 011 README decision 5 (the pen's steps open one at a time through Edit this step, with Done and Cancel) names no focus landing. The pen boards (`1600-pen.html`, `393-pen-app.html`, `724-pen-range.html`) carry only the global `:focus`/`:focus-visible` CSS and draw no landing focus.
- The nearest drawn rule for a step's form opening: sketch 013 README decision 33 and sketch 014 README (the Add step bullet) and CONTRACT (the acts-row bullet) say "focus goes to the new step's lead-in". That is the creation editor's Add step, as the task notes.
- sketch-findings-sprinkles: "Add tasting opens the section and focuses the Tasted date" (an opener lands in its first field). Also "after a collapse, focus moves to the control that reopens" (`references/cross-cutting-type-spacing-feedback.md`). That is what Cancel does today (focus on Edit this step), and it is kept.
- DESIGN.md Components has no landing rule for a step opening. The one global `:focus-visible` ring applies to the lead-in. No CSS changes.

Claude's discretion, recorded:
- The effect keys on `isOpen` alone, with no "opened by press" flag. `openStepN` is Method-local, and its only non-null setter is `handleOpenStep` (`setOpenStepN(stepN)`, one occurrence). That is reached only through `onOpen` from the Edit this step button's `handleOpen`. `isOpen` is false when StepPenBody mounts, so the Version name `autoFocus` when the pen opens is untouched.
- `useOnDemandField` is not touched. CreationSteps.jsx imports it, and the creation editor must not change. Purpose and aside keep moving no focus when a step opens (`seedOpen`).
- The caret position inside the lead-in is the browser's default for a script focus. It is not part of this fix.
- On a touch device, focus in the lead-in raises the on-screen keyboard (iPhone), the same as Add step and Rename already do. Recorded, not changed.
- The browser walk uses the project's existing probe pattern (quick 261027-ubi): scratch builds through `--outDir`, served by `.planning/phases/08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs` on ephemeral 127.0.0.1 ports. That serves the production build, which is what preview serves. It never starts a Vite process, never touches the preview Mark runs on 4173, and never writes `app/dist`. It also lets the base build and the fixed build be compared side by side.

Purpose: a keyboard user who presses Return on Edit this step lands in the lead-in, ready to type, and a second Return no longer throws the step's edits away.
Output: about 8 added lines in Method.jsx (no line removed), three tests in RecipePage.perStep.test.jsx, and one probe script in the quick directory. One commit.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.claude/CLAUDE.md
@.planning/STATE.md

Read by range or by search, not whole:
- app/src/ui/Method.jsx: `export function useOnDemandField` (do not edit), `export function StepPenBody` through its `return isOpen ? (`, the open branch's lead-in textarea (`prose-field--lead-in`), the closed branch's `method-step__acts` line, and Method's `handleOpenStep` / `handleCancelStep`.
- app/src/ui/RecipePage.perStep.test.jsx: the harness (lines 1-185: the repository mock, `mountAt`, `buttonByText`, `buttonByLabel`, `click`, `setValue`, `afterEach`). Also the existing `stepOpen` / `penOpen` helpers in the one-row-textarea describe, and the `bug-pen-step-aside-hidden-after-cancel` describe at the end of the file. That describe's assertion that the reopened aside is not `document.activeElement` must keep passing.
- .planning/quick/261027-ubi-fix-bug-p11-step-number-leadin-misaligne/261027-ubi-baseline-probe.mjs: the analog to copy from. Take the header and usage block, the `PLAYWRIGHT_CORE` constant and its existence check, the `startServers` import, `VERSION_PEN`, `clickUntil`, `openPage` (aborts every non-127.0.0.1 request), the engines loop (webkit; chromium with `channel: 'chrome'`), and the record/check modes with PASS/FAIL lines.
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Base build walk, sketch re-check, failing tests, then the lead-in focus fix (one path end to end through the real RecipePage)</name>
  <files>app/src/ui/RecipePage.perStep.test.jsx, app/src/ui/Method.jsx, .planning/quick/261114-gxe-edit-this-step-lands-focus-on-the-step-s/261114-gxe-probe.mjs</files>
  <read_first>
    - app/src/ui/Method.jsx (the ranges named in context)
    - app/src/ui/RecipePage.perStep.test.jsx (lines 1-185, and the last two describes)
    - .planning/quick/261027-ubi-fix-bug-p11-step-number-leadin-misaligne/261027-ubi-baseline-probe.mjs (lines 1-140)
  </read_first>
  <behavior>
    - Test A (keyboard path; fails at base): open the pen (Next version). Focus the button labelled "Step 1, edit this step" inside act, then click it. document.activeElement is the textarea labelled "Step 1, lead-in". At base it is the reused button reading Cancel.
    - Test B (pointer path; fails at base): open the pen. With nothing focused on the button, click "Step 2, edit this step". document.activeElement is the textarea labelled "Step 2, lead-in". At base it is the body.
    - Test C (Cancel guard; passes at base and after): open the pen, open Step 1 (focus + click), focus that step's own Cancel (found inside the step's li, never the pen's), click it. document.activeElement is the button labelled "Step 1, edit this step", and no textarea labelled "Step 1, lead-in" remains.
  </behavior>
  <action>
Step 0, before any edit: record `BASE=$(git rev-parse HEAD)` and the full-suite counts from `npm --prefix app test -- --run` (planning saw 132 files and 4327 tests at 5637d45d; use whatever Step 0 shows). Re-run `grep -c "setOpenStepN(stepN)" app/src/ui/Method.jsx` [HEAD=1 EXPECT==1 @5637d45d GUARD MUTATION: a second setOpenStepN(stepN) call site]. If it is not 1, a second opening path exists: stop and report, because the effect-on-isOpen choice depends on it.

Write the probe script `.planning/quick/261114-gxe-edit-this-step-lands-focus-on-the-step-s/261114-gxe-probe.mjs`, copying the 261027-ubi analog's structure (header comment with usage, PLAYWRIGHT_CORE check, startServers from `../../phases/08-split-the-recipe-page-along-its-jobs/08-walk-server.mjs`, openPage, clickUntil, engines loop, record/check, PASS/FAIL lines ending "N PASS, M FAIL", exit 1 on any FAIL). It has two configs: "1366 fine" (1366x1024, no touch, dpr 1) and "1366 coarse" (1366x1024, touch, dpr 1).

Each config runs three walks. Each walk uses a fresh context (a fresh store that seeds itself), goes to `/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v1` on the walk server, and opens the pen with clickUntil on the "Next version" button until VERSION_PEN appears. "active" means tagName, aria-label and trimmed textContent (up to 40 characters) of document.activeElement, read by page.evaluate.
- W1, pointer: record window.scrollY. Press "Step 1, edit this step" with locator.click(), or locator.tap() in the coarse config. Record active and scrollY.
- W2, keyboard: focus "Step 2, edit this step" by script and press Enter. Record active and the value of the "Step 2, lead-in" textarea, if one exists. Press Enter again. Record active, whether the "Step 2, lead-in" textarea still exists, and its value.
- W3, Cancel and Done: open Step 1 with focus + Enter. Click into "Step 1, lead-in", press End and type " probe". Focus the Cancel button inside the li.method-step that holds that textarea (by script) and press Enter. Record active, and that li's `p.method-step__lead` textContent. Then open Step 2 with focus + Enter, focus the Done inside Step 2's li and press Enter. Record active.

Check mode compares after.json with base.json, per engine and config:
- PASS when base W2's open active is a BUTTON whose text is "Cancel". This shows the base build reproduces the bug.
- PASS when after W1's active is TEXTAREA "Step 1, lead-in".
- PASS when after W2's open active is TEXTAREA "Step 2, lead-in".
- PASS when, after W2's second Enter, the field still exists, its value equals its value before, and active is still that TEXTAREA.
- PASS when after W3's Cancel active equals base W3's (tag, label and text).
- PASS when after W3's closed lead text equals base W3's.
- PASS when after W3's Done active equals base W3's.
- INFO lines for the W1 scrollY values, base and after, and for what the Cancel and Done landings are.
Everything the script types or prints is English. It never contacts 4173 or 8077, starts no Vite server and never writes app/dist.

Still before any app edit, build the base and record it: `S="${TMPDIR:-/tmp}/sprinkles-gxe"`, `npm --prefix app run build -- --outDir "$S/base-dist" --emptyOutDir`, then `PROBE_DIST="$S/base-dist" node .planning/quick/261114-gxe-edit-this-step-lands-focus-on-the-step-s/261114-gxe-probe.mjs record "$S/base.json"`. Expected at base, from planning: W2's open active is the BUTTON reading Cancel in both engines. W3's Cancel active is the BUTTON labelled "Step 1, edit this step". Record what it actually shows. If Chrome does not launch, say so, and record WebKit alone.

Sketch re-check (per the row's chosen fix, "after a look at what the sketch says"). Run `grep -n -i "focus" .planning/sketches/013-creation-editor/README.md .planning/sketches/013-creation-editor/CONTRACT.md .planning/sketches/014-steps-structure-save/README.md .planning/sketches/014-steps-structure-save/CONTRACT.md` and `grep -n -i "edit this step" .planning/sketches/011-recipe-route-c/README.md DESIGN.md`. Read decision 5 in the 011 README. Confirm that no rule names a focus landing for Edit this step other than the lead-in. Record the lines read in the SUMMARY. The objective lists what planning found. If the re-check turns up a rule planning missed that names a different landing spot, follow the sketch: land focus there, change Tests A and B to expect that element, and say so in the SUMMARY and the commit body.

RED: add a describe to the end of app/src/ui/RecipePage.perStep.test.jsx named "Edit this step puts focus in the step's lead-in (bug-edit-this-step-focus-on-cancel)". Put a two-line comment above it naming the cause (the closed step's Edit this step button node is reused as the open step's Cancel). It holds Tests A, B and C from the behavior block. Use the file's own helpers (installMatchMedia, mountAt(VERSION_PATH), buttonByText for Next version, buttonByLabel, click) and focus with `await act(async () => element.focus())`, as the aside describe does. Find Test C's Cancel with buttonByText scoped to the li that holds the "Step 1, lead-in" textarea. Run the describe. A and B must fail, C must pass. Keep the failing output for the SUMMARY.

GREEN (Method.jsx, StepPenBody only; additive, so no existing line changes):
- Declare `const leadInRef = useRef(null);` beside the other refs in StepPenBody.
- Add a `useEffect` on `[isOpen]` that focuses `leadInRef.current` when `isOpen` is true, with a short comment. The comment cites bug-edit-this-step-focus-on-cancel, says the closed step's Edit this step button node is reused as Cancel, and says the branches stay unkeyed so focus after Cancel still lands on Edit this step.
- Add `ref={leadInRef}` as a new attribute line on the open branch's lead-in textarea (the one with `prose-field--lead-in`).
Do not touch useOnDemandField, handleOpen, Method's handlers, either branch's child order, or any className. Add no key. useRef and useEffect are already imported. Run the describe again: all three pass.
  </action>
  <verify>
    <automated>npm --prefix app test -- --run src/ui/RecipePage.perStep.test.jsx src/ui/Method.test.jsx src/ui/CreationSteps.test.jsx src/ui/CreationFlow.test.jsx && npm --prefix app test -- --run src/ui/RecipePage.perStep.test.jsx -t "bug-edit-this-step-focus-on-cancel" && test "$(grep -c "leadInRef" app/src/ui/Method.jsx)" -ge 3 && test "$(grep -c "bug-edit-this-step-focus-on-cancel" app/src/ui/RecipePage.perStep.test.jsx)" -ge 1 && test -s "${TMPDIR:-/tmp}/sprinkles-gxe/base.json"</automated>
    Gates and their baselines: `grep -c "leadInRef" app/src/ui/Method.jsx` [HEAD=0 EXPECT>=3 @5637d45d]; `grep -c "bug-edit-this-step-focus-on-cancel" app/src/ui/RecipePage.perStep.test.jsx` [HEAD=0 EXPECT>=1 @5637d45d]; `grep -c "setOpenStepN(stepN)" app/src/ui/Method.jsx` [HEAD=1 EXPECT==1 @5637d45d GUARD MUTATION: a second setOpenStepN(stepN) call site, which would give StepPenBody an opening path that is not a press]. The new describe shows 3 passed, after a recorded RED run with 2 failed and 1 passed.
  </verify>
  <done>base.json is recorded from a build of BASE taken before any app edit. The sketch re-check is recorded. Tests A and B failed before the fix and pass after it, and Test C passes both times. Method.jsx changed only by added lines inside StepPenBody.</done>
</task>

<task type="auto">
  <name>Task 2: Built-app walk in WebKit and Chrome against the base, full suite, scope gates, one commit</name>
  <files>app/src/ui/Method.jsx, app/src/ui/RecipePage.perStep.test.jsx, .planning/quick/261114-gxe-edit-this-step-lands-focus-on-the-step-s/261114-gxe-probe.mjs</files>
  <read_first>
    - .planning/quick/261114-gxe-edit-this-step-lands-focus-on-the-step-s/261114-gxe-probe.mjs (as written in Task 1)
  </read_first>
  <action>
Build the fix to scratch and walk it: `S="${TMPDIR:-/tmp}/sprinkles-gxe"`, `npm --prefix app run build -- --outDir "$S/after-dist" --emptyOutDir`, `PROBE_DIST="$S/after-dist" node .planning/quick/261114-gxe-edit-this-step-lands-focus-on-the-step-s/261114-gxe-probe.mjs record "$S/after.json"`, then `node .planning/quick/261114-gxe-edit-this-step-lands-focus-on-the-step-s/261114-gxe-probe.mjs check "$S/after.json" --base "$S/base.json"`. Every check passes in WebKit and in Chrome, in both configs. If a check fails, fix the cause and rebuild. Do not loosen the check. If an engine did not launch in both records, the SUMMARY says so; WebKit is required.

Run the full suite: `npm --prefix app test -- --run`. Tests = Step 0 count + 3, 0 failed, the same file count. This includes `app/src/ui/tabindex-scan.test.js` and the binder and cross-cutting style tests, which this change must not trip.

Scope gates against BASE:
- `git diff --numstat "$BASE" -- app/src/ui/Method.jsx`: the deleted column is 0, so the change is additive and neither Cancel, Done nor the branch structure changed.
- `git diff --quiet "$BASE" -- app/src/ui/CreationSteps.jsx app/src/ui/CreationPage.jsx app/src/styles` exits 0, so the creation editor and the styles are untouched.
- `git diff --name-only "$BASE"` lists only the three files in this plan's files_modified (plus this quick directory's own planning docs).

Commit once, in English: `fix(261114-gxe): Edit this step puts focus in the step's lead-in`. The body gives the cause (the closed step's Edit this step button node is reused as the open step's Cancel, so focus stayed on it), the fix (focus the lead-in when the step opens; branches left unkeyed so focus after Cancel still lands on Edit this step), the sketch re-check result, and the probe's PASS count per engine. End the body with these two lines, exactly:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VWwTRRV1yptqguV5CEBBew

Do not write to Mark's List; the executor has no ArtifactData. The SUMMARY gives the orchestrator:
- the row to close, `bug-edit-this-step-focus-on-cancel`, with a one-line reply;
- that the dist build is safe to deploy (no store, data or migration change);
- one iPad step for chat, not a row: on the version pen, Tab to "Edit this step" on step 1, press Return, expect the caret in the step's lead-in, and expect a second Return to leave the step open;
- the adjacent finding, out of scope and not fixed: Done on an open step drops focus to the page body, in both the base and the fix.
  </action>
  <verify>
    <automated>S="${TMPDIR:-/tmp}/sprinkles-gxe" && npm --prefix app run build -- --outDir "$S/after-dist" --emptyOutDir && PROBE_DIST="$S/after-dist" node .planning/quick/261114-gxe-edit-this-step-lands-focus-on-the-step-s/261114-gxe-probe.mjs record "$S/after.json" && node .planning/quick/261114-gxe-edit-this-step-lands-focus-on-the-step-s/261114-gxe-probe.mjs check "$S/after.json" --base "$S/base.json" && npm --prefix app test -- --run</automated>
    Gates: the probe check ends "0 FAIL" (a check of the base build against itself fails the after-checks by design, so the base build cannot pass it); full suite Tests [HEAD=4327 EXPECT==4330 @5637d45d] with 0 failed (if Step 0 reads a different count because main moved, expect the Step 0 count plus 3); `git diff --numstat "$BASE" -- app/src/ui/Method.jsx` deleted column [HEAD=0 EXPECT==0 @5637d45d GUARD MUTATION: changing or removing any existing Method.jsx line, such as adding a key to a branch or editing a Cancel handler]; `git diff --quiet "$BASE" -- app/src/ui/CreationSteps.jsx app/src/ui/CreationPage.jsx app/src/styles` exit status [HEAD=0 EXPECT==0 @5637d45d GUARD MUTATION: any edit to CreationSteps.jsx, CreationPage.jsx or app/src/styles].
  </verify>
  <done>The built fix lands focus in the lead-in in WebKit and in Chrome at 1366, with a fine and a coarse pointer. A second Return keeps the step open. Cancel's landing, Cancel's restore and Done's landing match the base build. The full suite is green at the base count plus 3. One commit holds the three files.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| none new | A client-side focus change inside an existing component. No input is parsed, stored or sent anywhere new. |
| probe → network | The probe serves a scratch build on 127.0.0.1 and aborts every request to another host. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-261114-gxe-01 | Tampering | Step edits in the version pen | low | mitigate | The bug lets a second Return discard a step's edits through Cancel. The fix moves focus into the lead-in, where holdReturn keeps Return inert. Test A and the probe's second-Enter check pin it. |
| T-261114-gxe-02 | Information disclosure | 261114-gxe-probe.mjs | low | mitigate | The walk server binds 127.0.0.1 on ephemeral ports (08-walk-server.mjs). The context aborts every non-127.0.0.1 request. The build goes to a scratch outDir and never to app/dist. |
| T-261114-gxe-SC | Tampering | npm/pip/cargo installs | low | accept | No package is installed or added. playwright-core is used from the existing npx cache outside the repo, as earlier quick probes did. |
</threat_model>

<verification>
- Tests A and B fail at BASE and pass after the fix; Test C passes at both (recorded RED then GREEN output).
- The probe check over scratch builds of BASE and of the fix: 0 FAIL in WebKit and Chrome, 1366 fine and coarse.
- Full suite at the Step 0 count plus 3, 0 failed.
- The Method.jsx diff only adds lines. The creation editor files and app/src/styles have no diff.
</verification>

<success_criteria>
- After Edit this step in the version pen, document.activeElement is the opened step's "Step N, lead-in" textarea, in jsdom and in the built app in WebKit and Chrome.
- A second Return leaves the step open with its edits.
- Cancel restores the step and focus after it lands on that step's Edit this step, exactly as at BASE. Done's landing is unchanged.
- The creation editor is unchanged. No visual or token change: the lead-in shows the existing global focus ring.
</success_criteria>

<output>
Create `.planning/quick/261114-gxe-edit-this-step-lands-focus-on-the-step-s/261114-gxe-SUMMARY.md` when done. It records: BASE and the Step 0 suite counts; the cause as reproduced; the sketch re-check lines; the RED and GREEN output; the probe's base and after landings per engine and config; the scope gate results; the commit hash. It also carries the orchestrator notes from Task 2: close `bug-edit-this-step-focus-on-cancel`, the dist build is safe, the one iPad step for chat, and the out-of-scope Done-landing finding.
</output>
