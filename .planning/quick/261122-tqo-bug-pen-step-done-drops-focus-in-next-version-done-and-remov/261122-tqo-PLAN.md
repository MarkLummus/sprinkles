---
phase: quick-261122-tqo
plan: 01
quick_id: 261122-tqo
type: execute
wave: 2
depends_on: ["261122-tqn"]
files_modified:
  - app/src/ui/Method.jsx
  - app/src/ui/RecipePage.perStep.test.jsx
  - .planning/quick/261122-tqo-bug-pen-step-done-drops-focus-in-next-version-done-and-remov/261122-tqo-SUMMARY.md
autonomous: true

must_haves:
  truths:
    - "In the version pen (Next version on Olive Oil v1), Done on an open step closes it and focus lands on that step's own 'Step N, edit this step' button. This holds when Done is pressed from the keyboard (focus on Done) and when it is pressed by a pointer with focus left in the step's lead-in, as WebKit leaves it. document.activeElement is never the body after Done."
    - "Remove this step, on an open step that uses a removed row, leaves the step open and removed (the 'Removed step N, lead-in' field is still drawn) and focus lands on that step's own Done, the button in the line below. Done then closes the step and focus lands on 'Removed step N, edit this step'."
    - "Cancel on an open step still restores that step and lands focus on its Edit this step, as built. The closed step's Remove and Restore work as built."
    - "A Done that 261122-tqn refuses keeps the step open and leaves no focus request behind: opening an earlier step afterwards puts focus in that step's lead-in, not on the refused step's Edit this step."
    - "Nothing on screen changes: no new word, control, class or token. The creation editor (CreationSteps.jsx, CreationPage.jsx, useOnDemandField) is untouched."
  artifacts:
    - path: "app/src/ui/Method.jsx"
      provides: "Method's Done leaves a one-time focus request naming its step (editFocusRef, taken through takeEditFocus); StepPenBody focuses its Edit this step (editButtonRef) when it closes on that request, and Remove this step moves focus to the step's Done (doneButtonRef)"
      contains: "editButtonRef"
    - path: "app/src/ui/RecipePage.perStep.test.jsx"
      provides: "Four jsdom tests through the real RecipePage: Done by keyboard, Done by pointer, Remove this step then Done, and the refused-Done guard"
      contains: "bug-pen-step-done-drops-focus"
  key_links:
    - from: "app/src/ui/Method.jsx"
      to: "app/src/ui/Method.jsx"
      via: "Method's handleDoneStep writes editFocusRef on the path that closes the step; StepPenBody's effect on isOpen calls takeEditFocus() and focuses editButtonRef, the closed branch's Edit this step"
      pattern: "takeEditFocus"
    - from: "app/src/ui/RecipePage.perStep.test.jsx"
      to: "app/src/ui/Method.jsx"
      via: "The tests mount the whole RecipePage over Olive Oil v1, press Next version, open a step, press Done or Remove this step, and read document.activeElement"
      pattern: "bug-pen-step-done-drops-focus"
  prohibitions:
    - statement: "MUST NOT add a key to either StepPenBody branch or reorder, add or remove a top-level child of either branch: Cancel's focus landing depends on React reusing the Edit this step node as Cancel"
      verification: test
    - statement: "MUST NOT change Cancel's handler, the closed step's Remove/Restore, useOnDemandField, CreationSteps.jsx, CreationPage.jsx, Method.test.jsx or anything under app/src/styles"
      verification: test
    - statement: "MUST NOT build into app/dist or start a Vite process"
      verification: test
---

<objective>
Fix the Mark's List row `bug-pen-step-done-drops-focus` (cosmetic; found in passing by the state machine audit, `.planning/state-machines/2026-11-22-audit.md`, "Seen in passing"). In Next version, Done and Remove this step on an open step leave nothing focused. Cancel already returns focus to Edit this step. After this fix, Done returns focus to Edit this step, and Remove this step lands on a drawn neighbour: the step's own Done.

**Cause, traced at planning HEAD b06add6f.** Read in `app/src/ui/Method.jsx`, then confirmed by a jsdom probe through the real RecipePage (a scratch test outside the repo, with Method.jsx swapped by `vi.mock`; the repo was not touched).

- **Why Cancel keeps focus.** StepPenBody renders `isOpen ? <div className="method-step__body">…</div> : <div className="method-step__body">…</div>`, unkeyed. React pairs the two branches' children by position. Child slot 10 is a `<p>` in both: the open `method-step__done-cancel` line holds [Button Cancel, Button Done], and the closed `method-step__acts` line holds [Button Edit this step, span "·", Button Remove]. Slot 0 is Button against Button, so the Cancel node is kept and re-rendered as Edit this step. Focus never moves, because it was already on that node (quick 261114-gxe established this and kept it).
- **Why Done drops it.** Done is at slot 1, where the closed line has the span. React removes Done's node, and nothing moves focus, so it falls to the body. A pointer press in WebKit does not focus the button, so focus is still in the lead-in. The open-fields div at body slot 0 is replaced by the closed lead `<p>`, so that node goes too. Body again. No code ever moves focus on Done.
- **Why Remove this step drops it.** The button is drawn only while the step is live: `!draftStep.removed && flaggedRows.length > 0`. The press calls `onTogglePenStepRemoved(step.n)`, which is useVersionPen's `handleTogglePenStepRemoved` and sets the draft step's `removed`. The step stays open, because `openStepN` is unchanged. The condition turns false, so the `<p>` holding the focused button is removed. Nothing moves focus.
- **Probe output at b06add6f.** After Done, by keyboard and by pointer, `BODY`. After Remove this step, `BODY`, with the step still open ("Removed step 6, lead-in" present). After Cancel, `BUTTON label=Step 1, edit this step`.

**The fix, probed at planning on the scratch copy.** It does not rely on node reuse.
- **Done.** Method's `handleDoneStep(stepN)` leaves a one-time request naming the step (`editFocusRef`), written only on the path that closes the step. StepPenBody holds `editButtonRef` on the closed branch's Edit this step. A new effect on `isOpen` focuses that button when the step closes and `takeEditFocus()` claims the request. This is the project's own request pattern: CreationPage's `focusRequestRef` lets a handler leave a request, and an effect acts on it after the render that drew the target.
- **Remove this step.** StepPenBody holds `doneButtonRef` on the open branch's Done. Remove this step's handler toggles the step and then focuses Done. Done is drawn before and after the render, and its node is kept.
- **Probe output with the fix.** After Done, `BUTTON label=Step 1, edit this step` (keyboard) and `Step 2, edit this step` (pointer, from the lead-in). After Remove this step, `BUTTON text=Done` with the step open, and then after Done, `Removed step 6, edit this step`. Cancel is unchanged. Done, then the pen's Cancel, then Next version again: focus is on Version name, so nothing leaks into a later pen.
- **The refusal guard.** Planning added a refusal to the scratch copy's `handleDoneStep` (a blank lead-in returns early). Written after the check, the request left nothing behind: opening Step 1 after Step 3's refused Done put focus in Step 1's lead-in. Written before the check, focus went to "Step 3, edit this step". Test D below is that guard. It is why the request belongs on the closing path and not in StepPenBody's Done click.

**Against 261122-tqn.** That sibling adds the creation editor's Required checks (blank lead-in, one-sided target) to the pen step's Done path. This plan runs after it and reads Method.jsx as merged. A refused Done keeps the step open and is not a focus case here: whatever 261122-tqn does with focus on a refusal stays as it is. The one rule this plan adds is that the Done request is written immediately before the `setOpenStepN(null)` that Done reaches when it closes. That holds wherever 261122-tqn put its check, in Method's `handleDoneStep` or in StepPenBody before `onDone()`.

**Claude's discretion, recorded (the row says "a drawn neighbour" without naming one).** Remove this step lands on the step's own Done:
- Done is in the line directly below the line that went.
- A Return on Done keeps the step's edits and closes it. With this fix it then lands on Edit this step, with Restore beside it. That fits sketch-findings-sprinkles `references/cross-cutting-type-spacing-feedback.md:48`: "after a collapse, focus moves to the control that reopens".

Rejected:
- The step's Cancel, the next control in Tab order. Return on it puts the whole step back as the pen opened it, and that throws away the step's other edits. Quick 261114-gxe threat T-261114-gxe-01 is the same trap.
- The uses line's last control. It reads backwards, above the removed line.

If Mark prefers another landing, it is a one-line change in `handleRemoveThisStep`.

Purpose: a keyboard or switch user who presses Done or Remove this step keeps their place in the method, instead of being thrown to the top of the page.
Output: two commits, red then green, and the SUMMARY. About 25 lines added and 4 changed in Method.jsx, plus four tests in RecipePage.perStep.test.jsx.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.claude/CLAUDE.md

Read by range or by search, not whole:
- app/src/ui/Method.jsx, as merged from 261122-tqn. Find each place by its name (line numbers are at b06add6f and will have moved):
  - `export function StepPenBody`: the props list (onOpen, onDone, onCancel at :112-115) and the refs (`leadInRef` at :143).
  - The lead-in focus effect and its comment (:151-156).
  - The removed-row cross-flag line with Remove this step (:401-410).
  - The open branch's Done/Cancel line (:430-437).
  - The `{null}` slot comment (:483-487).
  - The closed branch's `method-step__acts` line with Edit this step and Remove/Restore (:489-505).
  - In `export function Method`: `openStepN` and its reset effect (:664-667), `handleOpenStep`, `handleDoneStep` and `handleCancelStep` (:669-678), and the StepPenBody call site (:742-762, `onDone` at :756).
  - Read whatever 261122-tqn changed on the Done path: `git log -p --grep=261122-tqn -- app/src/ui/Method.jsx`.
- app/src/ui/RecipePage.perStep.test.jsx: the harness (:1-185). That covers the repository mock, `installMatchMedia`, `flush`, `mountAt(VERSION_PATH)`, `buttonByText(scope, text)`, `buttonByLabel(label)`, `click`, `setValue` and `afterEach`. Also read the last describe, "Edit this step puts focus in the step's lead-in (bug-edit-this-step-focus-on-cancel)" (:1178-1217 at b06add6f), and its `penOpen` and `leadIn` helpers. That describe's Cancel test must keep passing. Also read any describe 261122-tqn appended after it.
- app/src/ui/CreationPage.jsx:200-204 and :308-312 (read only, do not edit): the focus request pattern this fix copies.
- app/src/ui/useVersionPen.js:132-147 (read only): `handleTogglePenStepRemoved` sets only the draft step's `removed` flag, and `handleRestorePenStep` is step Cancel's restore.
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Red. Four tests through the real RecipePage: Done by keyboard, Done by pointer, Remove this step, and the refused-Done guard</name>
  <precondition>261122-tqn is merged into this worktree's HEAD: `git log --oneline --grep=261122-tqn` prints at least one commit that touches app/src/ui/Method.jsx. If it prints nothing, stop and report that the worktree was forked before 261122-tqn merged. This plan is written against Method.jsx after that sibling.</precondition>
  <files>app/src/ui/RecipePage.perStep.test.jsx</files>
  <read_first>
    - app/src/ui/RecipePage.perStep.test.jsx (lines 1-185, and every describe from "bug-edit-this-step-focus-on-cancel" to the end of the file)
    - app/src/ui/Method.jsx (StepPenBody and Method's step handlers, the ranges named in context, as merged from 261122-tqn)
  </read_first>
  <behavior>
    - Test A, Done by keyboard (fails before the fix: activeElement is the body). Open the pen and open Step 1 by focusing "Step 1, edit this step" and clicking it. Find Done with buttonByText scoped to that step's `.method-step__done-cancel` line. Do not search the whole li, because the uses toggle also reads Done while its checklist is open. Focus Done inside act and click it. Then the textarea labelled "Step 1, lead-in" is gone and document.activeElement is buttonByLabel("Step 1, edit this step").
    - Test B, Done by pointer with focus left in the lead-in, as WebKit leaves it (fails before the fix: body). Open the pen and click "Step 2, edit this step". First assert that activeElement is the "Step 2, lead-in" textarea. Click Step 2's Done without focusing it. Then activeElement is buttonByLabel("Step 2, edit this step").
    - Test C, Remove this step (fails before the fix: body). Open the pen. Find the ingredient row by its accessible name: in `.ingredient-table`, the tr whose aria-label starts with "Allulose" (it reads "Allulose, 20 g, estimated" at b06add6f). Click its button reading "Remove". Allulose's only line is in Step 6, and Step 6 uses it. Click "Step 6, edit this step". In that step's li, assert that the `.method-step__flag` text contains "uses Allulose, which is removed". Focus the button reading "Remove this step" and click it. Then four things hold: the "Removed step 6, lead-in" textarea exists, so the step is still open; the li has no button reading "Remove this step"; activeElement is the Done in that li's `.method-step__done-cancel` line; and clicking that Done makes activeElement buttonByLabel("Removed step 6, edit this step").
    - Test D, a refused Done leaves no request (passes before and after the fix; it guards the fix). Open the pen and click "Step 3, edit this step". setValue the "Step 3, lead-in" textarea to an empty string. Click Step 3's Done. Assert the "Step 3, lead-in" textarea still exists, because 261122-tqn refuses. Click "Step 1, edit this step". Then activeElement is the "Step 1, lead-in" textarea. Step 3 sits after Step 1, so its effects run after Step 1's in the same commit. A request left by the refused Done would take focus to "Step 3, edit this step". Planning saw exactly that against a variant that wrote the request before the refusal check.
  </behavior>
  <action>
Step 0, before any edit. Create the folder ${TMPDIR:-/tmp}/sprinkles-tqo and write `git rev-parse HEAD` to the file BASE in it. Run the precondition check. Then run `npm --prefix app test` and record the file and test counts. Planning saw 136 files and 4538 tests before the batch, and 44 tests in RecipePage.perStep.test.jsx at b06add6f. Siblings merged since then move both numbers, so use what Step 0 reads.

Read the Done path in Method.jsx as 261122-tqn left it. Note three things in the SUMMARY: where its refusal lives (Method's handleDoneStep, or StepPenBody before onDone), what it checks, and whether a blank lead-in alone is refused at Done. Test D is written against that refusal. Suppose a blank lead-in is not refused at Done, but a one-sided target is. Then write Test D with a one-sided target on a step after Step 1 that has a target: blank one of its target's two fields. Read the olive oil data, app/src/data/olive-oil.js, to pick the step. If 261122-tqn put no refusal on Done at all, leave Test D out and say why in the SUMMARY; the plan then has three tests.

Append one describe at the end of app/src/ui/RecipePage.perStep.test.jsx, after the last describe there, named "Done and Remove this step keep focus on a drawn control (bug-pen-step-done-drops-focus)". Put a two-line comment above it naming the cause. Done's button has no partner in the closed step (a span stands in its place), so React removes it. Remove this step is drawn only while the step is live, so the press removes the focused button. Inside the describe, define `penOpen` and `leadIn(label)` the way the bug-edit-this-step-focus-on-cancel describe does, as locals. Here leadIn takes the full aria-label, because Test C needs "Removed step 6, lead-in". Use the file's own helpers: installMatchMedia, mountAt(VERSION_PATH), buttonByText, buttonByLabel, click and setValue. Focus with `await act(async () => element.focus())`. Write Tests A to D from the behavior block, each starting from a fresh mount.

Run the describe: `npm --prefix app test -- src/ui/RecipePage.perStep.test.jsx -t "bug-pen-step-done-drops-focus"`. Tests A, B and C must fail, each because document.activeElement is the body. That is the defect, not a lookup typo: a failure on a null element means a selector is wrong, so fix the test. Test D must pass. Keep the output for the SUMMARY.

Commit the test file alone, in English: "test(261122-tqo): Done and Remove this step on a pen step keep focus on a drawn control, red until the fix (bug-pen-step-done-drops-focus)". End the message with the attribution lines your session gives. Then write `git rev-parse HEAD` to ${TMPDIR:-/tmp}/sprinkles-tqo/RED.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/ui/RecipePage.perStep.test.jsx -t "bug-pen-step-done-drops-focus" 2>&1 | grep -E 'Tests +3 failed \| 1 passed'   [HEAD: the describe does not exist. EXPECT: the line matches (with Test D left out: 'Tests +3 failed' and no passed count for the describe)]</automated>
    <automated>grep -v '^ *//' app/src/ui/RecipePage.perStep.test.jsx | grep -cF 'bug-pen-step-done-drops-focus'   [HEAD=0 EXPECT>=1 @b06add6f]</automated>
    <automated>git diff --name-only "$(cat "${TMPDIR:-/tmp}/sprinkles-tqo/BASE")" "$(cat "${TMPDIR:-/tmp}/sprinkles-tqo/RED")"   [EXPECT: exactly app/src/ui/RecipePage.perStep.test.jsx]</automated>
  </verify>
  <done>Tests A, B and C fail because focus is on the body, and Test D passes. Every other test in the file still passes. The red commit holds the test file alone. BASE and RED are recorded.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Green. Done leaves a focus request for its step's Edit this step; Remove this step moves focus to the step's Done</name>
  <files>app/src/ui/Method.jsx</files>
  <read_first>
    - app/src/ui/Method.jsx (StepPenBody and Method's step handlers, the ranges named in context)
    - app/src/ui/CreationPage.jsx lines 200-204 and 308-312 (the request pattern, read only)
  </read_first>
  <behavior>
    - The describe from Task 1 passes in full: 4 of 4, or 3 of 3 if Test D was left out.
    - These still pass: the bug-edit-this-step-focus-on-cancel describe, including its Cancel test; Method.preview.test.jsx, including "Cancel still leaves focus on Edit this step"; Method.test.jsx (its six- and seven-button counts for an open step are unchanged); CreationSteps.test.jsx; and app/src/ui/tabindex-scan.test.js.
  </behavior>
  <action>
Fix bug-pen-step-done-drops-focus in app/src/ui/Method.jsx. Edit nothing else under app/. New comments go in function bodies as `//` line comments, in plain English, and cite bug-pen-step-done-drops-focus.

In `export function Method`, beside `openStepN`:
- Declare `const editFocusRef = useRef(null);`. The comment above it says what it is for. Done closes the step and its own button goes with it, so focus fell to the page. Done therefore leaves a request naming its step, and that step acts on it after the render that drew its Edit this step again. This is the request pattern CreationPage's focusRequestRef uses.
- Give `handleDoneStep` a `stepN` parameter, unless 261122-tqn already gave it one. In that function, directly before the `setOpenStepN(null)` that Done reaches when it closes the step, write `editFocusRef.current = stepN;`. Any check 261122-tqn put there stays before this line, so a refused Done returns without writing a request.
- Add `function takeEditFocus(stepN)`. It returns false unless editFocusRef.current equals stepN. When it does, it sets editFocusRef.current to null and returns true. So the request is taken once, by the one step it names.
- At the StepPenBody call site, pass Done its step: `onDone={() => handleDoneStep(step.n)}`. If 261122-tqn already changed this prop, keep its shape and make sure the step's n reaches handleDoneStep. Add the prop `takeEditFocus={() => takeEditFocus(step.n)}`.

In `export function StepPenBody`:
- Add `takeEditFocus = () => false,` to the destructured props, after onCancel. The default keeps direct renders of StepPenBody (Method.test.jsx) working.
- Beside `leadInRef`, declare `const editButtonRef = useRef(null);` and `const doneButtonRef = useRef(null);`.
- Directly after the existing lead-in effect, add a second effect on `[isOpen]`. When isOpen is false and takeEditFocus() returns true, it calls `editButtonRef.current?.focus()`. Its comment says Done's button has no partner in the closed step (a span stands in its place), so its node is removed and focus would fall to the page. It also says the effect asks Method whether this close was this step's Done, so Cancel's landing (the reused node) and every other close are left alone. Leave the existing lead-in effect and its comment as they are.
- Add `function handleRemoveThisStep()`. It calls `onTogglePenStepRemoved(step.n)`, then `doneButtonRef.current?.focus()`. Its comment covers three points. Remove this step is drawn only while the step is live, so the press removes the focused button. The step stays open, so focus goes to its own Done in the line below, which is drawn before and after the render. Done keeps the step's edits, where the step's Cancel would put the whole step back.
- In the removed-row cross-flag line, the Remove this step Button's onClick becomes `handleRemoveThisStep`. The closed step's Remove/Restore Button keeps its own onClick unchanged.
- On the open branch's Done Button in the `method-step__done-cancel` line, add `ref={doneButtonRef}`. Keep whatever onClick 261122-tqn left there.
- On the closed branch's Edit this step Button in the `method-step__acts` line, add `ref={editButtonRef}` as a new attribute line.

Do not:
- add a key or move, add or remove a top-level child of either branch;
- change Cancel's handler, handleCancelStep, handleOpenStep or the openStepN reset effect;
- change useOnDemandField, any className, any visible word or the `{null}` slot.

useRef and useEffect are already imported. Button passes ref straight to the native button (React 19, Button.jsx).

Run the Task 1 describe, then these files: `npm --prefix app test -- src/ui/RecipePage.perStep.test.jsx src/ui/Method.preview.test.jsx src/ui/Method.test.jsx src/ui/CreationSteps.test.jsx src/ui/tabindex-scan.test.js`. Then run the full suite. Then build to scratch to show the bundle builds, never into app/dist: `npm --prefix app run build -- --outDir "${TMPDIR:-/tmp}/sprinkles-tqo/dist" --emptyOutDir`. This starts no server.

Commit Method.jsx alone, in English: "fix(261122-tqo): Done on a pen step returns focus to Edit this step, Remove this step lands on Done (bug-pen-step-done-drops-focus)". The body gives the cause and the fix in two or three sentences each, and names the Remove this step landing as the planner's choice. End it with the attribution lines your session gives.

Write the SUMMARY. It holds: BASE and the Step 0 counts; what 261122-tqn's Done path looked like, and how Test D was written; the red and green outputs; the full-suite counts; the scope gate results; both commit hashes; and that nothing was run in a browser or on a device. It also carries the orchestrator notes below.
  </action>
  <verify>
    <automated>npm --prefix app test -- src/ui/RecipePage.perStep.test.jsx -t "bug-pen-step-done-drops-focus" 2>&1 | grep -E 'Tests +4 passed'   [after Task 1: 3 failed, 1 passed. EXPECT: the line matches (3 passed if Test D was left out)]</automated>
    <automated>npm --prefix app test -- src/ui/RecipePage.perStep.test.jsx src/ui/Method.preview.test.jsx src/ui/Method.test.jsx src/ui/CreationSteps.test.jsx src/ui/tabindex-scan.test.js 2>&1 | grep -E 'Tests +[0-9]+ passed' | grep -v failed   [EXPECT: a passed line with no failed count]</automated>
    <automated>npm --prefix app test 2>&1 | tail -6 | grep -E 'Tests +[0-9]+ passed' | grep -v failed   [EXPECT: the Step 0 test count plus 4 (plus 3 without Test D), no failed count, the same file count]</automated>
    <automated>npm --prefix app run build -- --outDir "${TMPDIR:-/tmp}/sprinkles-tqo/dist" --emptyOutDir   [EXPECT: exit 0; app/dist untouched]</automated>
    <automated>grep -v '^ *//' app/src/ui/Method.jsx | grep -cF 'editButtonRef'   [HEAD=0 EXPECT>=3 @b06add6f] the declaration, the ref attribute and the focus call</automated>
    <automated>grep -v '^ *//' app/src/ui/Method.jsx | grep -cF 'doneButtonRef'   [HEAD=0 EXPECT>=3 @b06add6f]</automated>
    <automated>grep -v '^ *//' app/src/ui/Method.jsx | grep -cF 'takeEditFocus'   [HEAD=0 EXPECT>=4 @b06add6f] the default prop, the effect, the function and the call site</automated>
    <automated>grep -v '^ *//' app/src/ui/Method.jsx | grep -cF 'onClick={() => onTogglePenStepRemoved(step.n)}'   [HEAD=2 EXPECT==1 @b06add6f GUARD MUTATION: the closed step's Remove/Restore losing its own toggle, or the cross-flag keeping the bare toggle]</automated>
    <automated>git diff --numstat "$(cat "${TMPDIR:-/tmp}/sprinkles-tqo/RED")" HEAD -- app/src/ui/Method.jsx   [EXPECT: deleted column <= 4: the handleDoneStep signature, the onDone call site, the Remove this step onClick and the Done Button line; everything else is added]</automated>
    <automated>git diff --quiet "$(cat "${TMPDIR:-/tmp}/sprinkles-tqo/BASE")" HEAD -- app/src/ui/CreationSteps.jsx app/src/ui/CreationPage.jsx app/src/ui/Method.test.jsx app/src/ui/useVersionPen.js app/src/styles   [EXPECT: exit 0]</automated>
    <automated>git diff --name-only "$(cat "${TMPDIR:-/tmp}/sprinkles-tqo/BASE")" HEAD -- app   [EXPECT: exactly app/src/ui/Method.jsx and app/src/ui/RecipePage.perStep.test.jsx]</automated>
  </verify>
  <done>Done on an open pen step lands focus on that step's Edit this step, by keyboard and by pointer. Remove this step leaves the step open and lands focus on its Done. Cancel lands where it did. A refused Done leaves no request behind. The full suite is green at the Step 0 count plus the new tests. The fix commit holds Method.jsx alone, and the SUMMARY is written.</done>
</task>

</tasks>

<threat_model>
ASVS level 1; block on high. This plan calls no external API, changes no store shape and installs no package.

## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| none new | A client-side focus change inside an existing component. No input is parsed, stored or sent anywhere new. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-tqo-01 | Tampering | step edits in the version pen | low | mitigate | Remove this step lands on Done, not on the step's Cancel, so a second Return keeps the step's edits instead of putting the whole step back (the T-261114-gxe-01 trap). Test C pins the landing. |
| T-tqo-02 | Denial of service | focus taken by the wrong step | low | mitigate | The request is written only on Done's closing path and is taken once, by the step it names. Test D pins that a refused Done leaves none behind. |
| T-tqo-03 | Tampering | a stray build overwriting app/dist, which Mark serves | low | mitigate | The only build goes to ${TMPDIR}/sprinkles-tqo/dist with --emptyOutDir. No Vite server starts, and port 4173 is not touched. |
| T-tqo-SC | Tampering | npm/pip/cargo installs | low | accept | This plan installs no package. |
</threat_model>

<verification>
- Task 1's red run shows Tests A, B and C failing on a body activeElement, with Test D passing, before Task 2 starts.
- The two commits are red then green, and each holds one file under app/.
- Every Task 2 verify line passes. The Method.jsx diff changes at most four existing lines. The creation editor, useVersionPen.js, Method.test.jsx and the styles have no diff.
- Nothing is claimed as browser- or device-verified. The audit's base reading (BODY after Done and after Remove this step) was Playwright WebKit and Chromium at fcc47e7f. This fix is verified in jsdom only.
</verification>

<success_criteria>
In Next version, Done on an open step returns focus to that step's Edit this step, and Remove this step keeps the step open with focus on its Done, so a keyboard user keeps their place in the method. Cancel, the closed step's Remove and Restore, 261122-tqn's refusal and the creation editor behave as before. Nothing on screen changes.
</success_criteria>

## For the orchestrator after the SUMMARY (executors have no ArtifactData)

- Mark's List: close `bug-pen-step-done-drops-focus` after the merge.
  - Set `status: "done"`.
  - Set `resolvedAt` from `date -u +%Y-%m-%dT%H:%M:%S.000Z`, read just before the write.
  - Add a one-line `reply`, for example: "Done now returns focus to Edit this step, and Remove this step lands on the step's Done; jsdom only, not seen on the iPad."
  - Use `if_version` from a read.
- Tell Mark which landing was chosen for Remove this step: the step's own Done. Cancel was rejected because a second Return would put the whole step back. If he wants another landing, it is a one-line change.
- Deploy after this item: safe. It is a focus change only, with no store shape, DB_VERSION or store file version change.
- One iPad step for chat, not a row: in Next version, Tab to a step's Edit this step, press Return, then Tab to Done and press Return. Expect the focus ring on that step's Edit this step.

<output>
Create `.planning/quick/261122-tqo-bug-pen-step-done-drops-focus-in-next-version-done-and-remov/261122-tqo-SUMMARY.md` when done
</output>
