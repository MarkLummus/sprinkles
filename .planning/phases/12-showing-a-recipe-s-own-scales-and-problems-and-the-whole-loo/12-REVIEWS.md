---
phase: 12
round: 2
reviewers: [opencode-astra, opencode-argon]
reviewed_at: 2026-11-22T00:46:34Z
plans_reviewed: [12-09-PLAN.md, 12-10-PLAN.md, 12-11-PLAN.md, 12-12-PLAN.md, 12-13-PLAN.md, 12-14-PLAN.md, 12-15-PLAN.md]
models:
  opencode-astra: "openrouter/openai/gpt-6-astra#high"
  opencode-argon: "openrouter/google/gemini-4-argon#high"
model_sources:
  opencode-astra: "pinned"
  opencode-argon: "pinned"
---

> Note: opencode-astra and opencode-argon share the opencode adapter; their consensus is cross-model, not cross-tool.

# Cross-AI Plan Review — Phase 12

Round two (Design gate 2): plans 12-09 to 12-15 only. Plans 12-01 to 12-08 were built before this
review and were not sent; their review is `12-REVIEWS-round-one.md`. The prompt carried the
round-two part of `12-RESEARCH.md` and sketch 016's `CONTRACT.md`. The Argon lane's first attempt
failed on OpenRouter credits and was re-run on the same prompt.

<!-- gsd:plan-revision-conflicts:begin -->
## Plan-Revision Conflicts
<!-- gsd:plan-revision-conflicts:end -->

## OpenCode Review (opencode-astra)

I’ll check all seven round-two plans against the built code and sketch 016, tracing the draft, focus, and verification paths before assessing each plan.

Two concrete gaps have emerged: 12-10’s width change can re-enable pen openers before the held draft’s restore finishes, and 12-14’s “Recipe name to Save” Tab walk stops before the Ingredients and Instructions controls. I also found existing phone-width pen tests that the plans haven’t assigned for updating.

Reviewed all **7 round-two plans** against repository HEAD `2f04f6e2`, the existing implementation, tests, harnesses, and approved sketch 016. I also parsed the board markup to verify panel IDs and numbered controls. This is a source-based plan review; the proposed implementations and new probes have not been executed.

## 12-09

### Summary
The route-level wrapper is the correct boundary for suppressing the editors without triggering their effects. Notebook and Home changes fit the existing component structure. The principal weakness is contradictory acceptance language around draft access and resizing: preserving pending typing necessarily writes the draft, and the surrounding Shell still reads drafts.

### Strengths
- **The guard is placed before the effects it must suppress.** `CreationRoute` reads drafts and may redirect at `app/src/ui/CreationRoute.jsx:35–46`; `EditRoute` reads the version, recipe, batches, and draft before deciding whether to redirect at `app/src/ui/EditRoute.jsx:42–86`. Wrapping these components prevents those operations on a narrow initial visit.
- **The existing width hook supports live crossings.** `app/src/ui/useBelowDesktop.js:39–49` uses the approved query and subscribes to changes. No second breakpoint mechanism is needed.
- **The persistence mechanism supports the intended ordinary crossing case.** Unmount calls `flushPendingDraft` at `app/src/ui/useKeptDraft.js:378–388`, and that function submits the waiting record at lines `45–54`.

### Concerns
- **MEDIUM — The draft-access requirements contradict both the intended behavior and the surrounding application.**  
  `.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-09-PLAN.md:32` promises that visiting either address “reads, writes and deletes nothing,” while line `68` extends that prohibition to resizing. But:
  - Shell reads drafts on pathname/state changes at `app/src/ui/Shell.jsx:293–320`.
  - Narrowing an active editor deliberately writes pending typing through `app/src/ui/useKeptDraft.js:387`.
  - The prescribed test checks `getDraft`, `saveDraft`, and `deleteDraft`, but not the `listDrafts` call used by `CreationRoute` (`app/src/ui/CreationRoute.jsx:38`).

  The wrapper design is sound; the absolute invariant and its test do not describe the same boundary.

- **LOW — The device rationale is inaccurate.**  
  `.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-09-PLAN.md:38` says the iPad is wider than 724. The approved contract explicitly includes narrow iPad split view at `.planning/sketches/016-entry-points-pen-preview-row-controls/CONTRACT.md:11`. This does not require adding a phone device check, but the rationale should reflect the approved width-based behavior.

### Suggestions
- State two separate invariants:
  1. A **cold narrow visit** never mounts an editor or mutates its draft.
  2. **Narrowing an active editor** preserves pending edits through the existing flush.
- Assert `listDrafts` is not called by the suppressed `CreationRoute` in the isolated route test; allow Shell’s established read in full-app tests.
- Wait explicitly for the asynchronous flush before asserting persisted content, rather than treating placeholder visibility as proof that storage has committed.

### Risk Assessment
**MEDIUM.** The implementation boundary is appropriate. Acceptance wording needs correction so executors do not remove necessary persistence or claim a stronger isolation guarantee than the application provides.

## 12-10

### Summary
This plan correctly recognizes the shared draft-key hazard and protects more than the visible band button. However, the proposed widening sequence creates a new interval in which recording becomes available before the held draft is restored. It also underestimates the existing tests and desktop states affected by the change.

### Strengths
- **The draft-loss mechanism is real and correctly identified.** `plan`, `record`, and `amend` share the same family at `app/src/domain/draft.js:557–560`; `saveDraft` permits same-family replacement at `app/src/store/repository.js:476–487`. Guarding handlers as well as markup is necessary.
- **Skipping restore before setting `draftStoredRef` is important.** Otherwise the no-record persistence branch deletes the stored draft at `app/src/ui/useKeptDraft.js:352–359`.
- **The own-version draft needs a separate band prop.** `waitingPlanDraft` excludes the current version at `app/src/ui/RecipePage.jsx:358–368` and also drives History at lines `470–474`. Reusing it would change the rail as well as the head.
- **Correct is a genuine additional entry point.** It currently ignores `recordingLocked` at `app/src/ui/BatchRow.jsx:788–795`, whereas Record another checks it at line `802`.

### Concerns
- **HIGH — Widening releases the guard before restoration finishes.**  
  `.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-10-PLAN.md:125` defines `planHeld` as `below724 && ownPlanDraft !== null`. Line `196` clears the held ref and starts another asynchronous restore when the page widens.

  As specified, widening immediately makes `planHeld` false and re-enables the batch-log openers, while `draftsLoaded` remains true. A recording opened during the second `getDraft` can then win the existing late-read rule: `app/src/ui/useKeptDraft.js:266–277` explicitly gives an already-open pen precedence over the stored draft. `handleStartRecording` opens that pen directly at `app/src/ui/useBatchRecording.js:121–133`, and subsequent persistence can replace the held plan record through the same-family write described above.

  The widening tests only wait for successful restoration; they do not attempt an opener while the reread is pending.

- **HIGH — The test migration is incomplete, creating a predictable integration failure.**  
  The planned changes to narrow expectations are concentrated in `.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-10-PLAN.md:169`. Existing suites also deliberately open Next version at 393:
  - `app/src/ui/RecipePage.perStep.test.jsx:83–94` fixes the width at 393, then waits for and presses Next version at lines `130` and `190`.
  - `app/src/ui/RecipePage.beforeYouStart.test.jsx:85–96` does the same; line `255` presses Next version.
  - `app/src/ui/RecipePage.edit.test.jsx:420–425` still expects Resume editing at width 600.

  These failures are consequences of the approved phone change, not defects in Preview step. They need explicit ownership before execution.

- **MEDIUM — “No desktop change” relies on a false stale-edit assumption.**  
  `.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-10-PLAN.md:127` reasons that an edit-kept version has no batch, so Correct never appeared. The repository already tests the opposite state: a kept edit whose version gained a batch, at `app/src/ui/RecipePage.edit.test.jsx:440–450`. Extending `recordingLocked` to Correct changes that desktop state too.

### Suggestions
- Keep a **held/restoring lock independent of width** until restoration has committed or the stored record has conclusively disappeared. Apply it to all competing pen openers.
- Add deferred-promise tests for widening: hold `getDraft` unresolved, attempt Record/Correct/Next version, then resolve or reject the read and verify draft preservation.
- Assign the existing 393 pen tests to a named migration task. Exercise pen behavior at a permitted width, or open wide and narrow where continued editing is specifically under test.
- Explicitly settle and test Correct’s behavior for a stale kept edit with a batch, including desktop.

### Risk Assessment
**HIGH.** The prescribed transition can reopen the data-loss path the plan is intended to close. The missing test migration also prevents a clean wave-four integration.

## 12-11

### Summary
The feature itself is a small, appropriate extension of `StepPenBody`. Reusing `StepReading` and resetting preview state on close are well-founded. The testing instructions need an environment correction, and removed steps are an unaddressed preview state.

### Strengths
- **The preview reset matches component lifetime.** `StepPenBody` retains its instance across open/closed branches (`app/src/ui/Method.jsx:143–148`), while Done and Cancel clear `openStepN` at lines `633–639`. Resetting on `isOpen === false` covers both.
- **The renderer already supplies the required content safely.** `app/src/ui/StepReading.jsx:63–77` renders lead-in, instruction, targets, purpose, and aside as React children.
- **The placement follows the approved addendum.** The existing purpose and aside fields precede the Uses wrapper at `app/src/ui/Method.jsx:266–307`, matching the contract’s “directly before the uses line” instruction.

### Concerns
- **MEDIUM — Interactive tests are assigned to a static-rendering suite.**  
  `.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-11-PLAN.md:90` puts press, Done/reopen, and Cancel/reopen tests in `Method.test.jsx`. That file intentionally uses `renderToStaticMarkup` in the Node environment (`app/src/ui/Method.test.jsx:1–12`), which cannot execute those interactions or effects.

  The existing page-level suite explicitly explains why interactive tests belong in jsdom at `app/src/ui/RecipePage.perStep.test.jsx:1–17`. The plan assigns only the Done case there.

- **MEDIUM — Removed-step preview behavior is unspecified.**  
  `.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-11-PLAN.md:88` passes every `draftStep` to `StepReading`. Removed steps can still open for editing through `app/src/ui/Method.jsx:450–462`. Their display number may come from the baseline at lines `652–657`, but `StepReading` neither checks `removed` nor marks removal (`app/src/ui/StepReading.jsx:63–77`). Meanwhile the clean recipe filters removed steps through `app/src/domain/rows.js:86–88`.

  Thus the prescribed preview can show a removed step as an ordinary numbered instruction, despite being described as how the step “will read.”

### Suggestions
- Keep static placement/count assertions in `Method.test.jsx`; put toggle, live-content, Done, Cancel, and reopening assertions in a jsdom suite.
- Define the removed-step preview treatment and add one regression case. The preview must communicate that the step is excluded from the saved clean reading.
- Account for the phone-test migration identified under 12-10 before adding more tests to `RecipePage.perStep.test.jsx`.

### Risk Assessment
**MEDIUM.** Core implementation risk is low, but the planned interactive verification cannot run in its assigned harness, and one reachable state lacks acceptance behavior.

## 12-12

### Summary
The domain/UI division is strong, and the plan handles several meaningful insertion edges. Two focus paths remain incomplete: the chosen landing group can diverge from the committed insertion, and cancelling the picker can target a control temporarily replaced by the Add-to-step chooser.

### Strengths
- **The insertion operation uses the correct placement authority.** `groupRows` derives step order from `uses` and unplaced order from `draft.rows` at `app/src/domain/creationSteps.js:93–100`. `toggleStepUses` moves placeholder grams into the selected step at lines `205–215`.
- **The stale-step guard addresses an actual exception.** `groupRows` throws for a non-live step at `app/src/domain/creationSteps.js:98–99`; checking liveness first is necessary for the proposed fallback.
- **Allocation assertions test a meaningful invariant.** `checkAllocation` checks missing portions, duplicate placement, and mismatched step sets at `app/src/domain/creationSteps.js:383–410`.
- **The 45-stop board reference exists.** The `rc-drawn` panel contains 45 numbered controls at `.planning/sketches/016-entry-points-pen-preview-row-controls/row-controls.html:13146`. Its first numbered stop is the heading’s Add ingredient button, so the walk must include its initial focused element.

### Concerns
- **MEDIUM — The insertion and focus destination can use different draft states.**  
  `.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-12-PLAN.md:127` calculates the landing group from render-time `createDraft`, then repeats the anchor check inside the functional updater over `prev`.

  The second check may fall back to unplaced while the first still selects the old step for focus—the exact batched-change case the plan claims to handle. `app/src/ui/IngredientTable.jsx:625–628` focuses only the exact `${rowId}:${group}` key, so the inserted row can exist without receiving focus.

- **MEDIUM — Cancel checks whether the row line exists, not whether its opener exists.**  
  The same plan line returns focus to the row’s Add ingredient unless the line is gone. But the unchanged chooser branch replaces all normal row acts with Cancel and step choices (`app/src/ui/IngredientTable.jsx:264–289`).

  Reachable sequence: open the ingredient picker from an unplaced row → open that row’s Add to step chooser → cancel the ingredient picker. The row remains, but its Add ingredient button does not. The existing focus resolver silently does nothing when the requested control is absent (`app/src/ui/CreationPage.jsx:322–349`).

### Suggestions
- Derive insertion and its actual landing group from one authoritative transition; resolve focus from the committed result rather than a separate pre-update calculation.
- Add a batched anchor-invalidation test asserting **both placement and focus**.
- Resolve Cancel’s target after rendering. If the opener was replaced by the chooser, use a defined available target.
- Explicitly include the initial heading button in the 45-stop recording to avoid an off-by-one walk.

### Risk Assessment
**MEDIUM.** Data placement is well protected. Focus recovery still has gaps that matter directly to the keyboard-first acceptance criteria.

## 12-13

### Summary
The field-scoped keyboard design matches the approved contract and sensibly reuses existing operations. The plan’s main weakness is that its fallback decision is made using a narrower experiment than the complete behavior it promises.

### Strengths
- **The key handler preserves existing text-field semantics.** `holdReturn` already exempts composition and suppresses Enter in one-line fields at `app/src/ui/oneLineField.js:10–13`. The plan preserves that fallback while leaving multiline fields’ ordinary Return behavior intact.
- **Separating keyed moves from button-focus requests is necessary.** Current move handlers explicitly request focus on Move buttons at `app/src/ui/CreationPage.jsx:425–436` and `479–485`. Reusing them unchanged would violate caret preservation.
- **Existing stable identities support the proposed approach.** Steps are keyed by stored `step.n` at `app/src/ui/CreationSteps.jsx:315–322`; creation rows use `${row.id}:${portion.step}` at `app/src/ui/IngredientTable.jsx:821–832`.
- **The plan follows the approved expansion to all six step fields.** That expansion is explicit in `.planning/sketches/016-entry-points-pen-preview-row-controls/CONTRACT.md:118`, overriding the older research recommendation.

### Concerns
- **MEDIUM — The fallback decision covers only the lead-in probe.**  
  `.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-13-PLAN.md:116–120` selects Branch A or B using lead-in moves. Other fields and grams are tested later at line `154`, while line `150` explicitly says CreationPage is not touched in that task.

  Passing the lead-in experiment does not establish row reconciliation or all field behavior. If grams or purpose fails later, the plan has no equally explicit recovery path despite those failures violating the same requirement.

- **MEDIUM — The browser test matrix is narrower than “every key path.”**  
  The prescribed grams probe at the same plan’s line `154` exercises Meta+Enter and a downward move within a step. It does not explicitly require:
  - Ctrl+Enter in grams;
  - both move directions with collapsed and ranged selections;
  - unplaced and split-row groups;
  - repeated moves reaching an endpoint.

  Those cases use distinct grouping paths: unplaced movement modifies `draft.rows`, while placed movement modifies `uses` (`app/src/domain/creationSteps.js:332–347`).

### Suggestions
- Make Branch B available after **any** field/row caret failure, and extend the implementation and verification file lists accordingly.
- Add a compact browser matrix covering both row-order mechanisms, both directions, both selection forms, and repeat-to-boundary behavior.
- Keep the existing independent iPad proof; passing this matrix still does not establish the hardware-keyboard behavior.

### Risk Assessment
**MEDIUM.** The architecture is appropriate, but the claimed verification coverage exceeds the specified experiments.

## 12-14

### Summary
The final gate and explicit separation of automated evidence from iPad acceptance are well designed. The handover steps need revision before they can prove PROOF-02: the proposed whole-editor Tab walk terminates too early, and the authoring sequence omits required input needed for its later Save.

### Strengths
- **The gate retains meaningful existing checks.** `12-check.sh` stops on command failure or a `FAIL` line at `.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-check.sh:30–43`, requires import evidence at lines `57–60`, and requires the baseline match at lines `65–68`.
- **The baseline expectation has a reasonable source basis.** The walk fixes its width at 1366 and separates the five new scenarios at `.planning/phases/11-steps-structure-save-and-print/11-walk.mjs:103–107`. Its button snapshot reads the notebook rather than the shell at line `220`.
- **Human proof remains genuinely pending.** The plan’s prohibition against completing PROOF-02 before Mark passes the rows is explicit at `.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-14-PLAN.md:65–67`.

### Concerns
- **HIGH — “From Recipe name Tab to Save” does not traverse the editor.**  
  `.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-14-PLAN.md:144` uses that sequence to prove every creation control, including Moves.

  In the actual DOM, Recipe name, Recipe description, Version name, Cancel, and Save are all in the band (`app/src/ui/CreationPage.jsx:687–745`). The editor body begins afterwards at line `760`; Ingredients and Instructions are mounted later at lines `762–821`. Ordinary forward Tab reaches Save **before any row or step control**.

  The automated walk at plan line `147` therefore cannot both follow the written step and prove all controls were reached.

- **MEDIUM — The written authoring sequence does not establish a saveable recipe.**  
  The same plan’s lines `143–145` explicitly enter grams only for the first picked ingredient, create a second step through Cmd+Return without explicitly filling its fields, then expect Save to succeed. New rows begin with blank grams (`app/src/domain/creation.js:158–162`), and new steps begin with blank lead-in and instruction (`app/src/domain/creationSteps.js:123–128`). Save checks every grams line and both fields of every live step at `app/src/domain/creationSave.js:182–203`.

  The executor would have to add authoring actions beyond the stated sequence to make the walk pass.

- **LOW — The final-build precondition omits 12-15’s summary.**  
  Dependencies include 12-15, but the concrete precondition at `.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-14-PLAN.md:102` only checks summaries 12-09 through 12-13. This is avoidable inconsistency in the final handover check.

### Suggestions
- Define a full Tab circuit with an explicit end marker after Setup, or separate band, Sheet, and Setup walks. Do not use the first encounter with Save as the endpoint.
- Make the script and the human row traverse exactly the same sequence; count matching PASS lines only after that equivalence is established.
- Explicitly instruct Mark to fill every added ingredient’s grams, the second step’s required fields, and each scale/problem’s required words.
- Specify the structural setup needed for Move tests—such as a group containing two rows—without prescribing recipe content.
- Include 12-15 in the summary precondition.

### Risk Assessment
**HIGH.** As written, the handover does not prove the phase’s keyboard-reach success criterion, and its Save expectation depends on unstated actions.

## 12-15

### Summary
This is the most self-contained plan. Removing the two More entries outright is consistent with how the shell exposes navigation. Preserving the narrow error-panel fallback is also correct. The remaining gap is mainly verification of the resize sequence used to justify that retained path.

### Strengths
- **Removing the duplicate controls is simpler than retaining unreachable branches.** The tab row is hidden from 724 up at `app/src/styles/shell.css:1078–1084`; More’s Import and Export are separate list items at `app/src/ui/Shell.jsx:729–740`, while the header controls remain at lines `589–609`.
- **The error panel can survive a width change.** Its reset effect depends on pathname, not width (`app/src/ui/Shell.jsx:287–291`), and `closeImportErrors` chooses the current-width focus target at lines `370–392`.
- **The retained import guards are real safeguards.** `chooseImportFile` checks the open pen, kept creation, kept edit, edit route, and unread state at `app/src/ui/Shell.jsx:459–482`. Removing only More’s callers preserves that behavior.

### Concerns
- **LOW — The new test does not exercise the retained transition.**  
  `.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-15-PLAN.md:115` justifies retaining the narrow error path through “open wide, then narrow,” but keeps tests that mount directly at 393 and dispatch a hidden-input change. That is exactly what `app/src/ui/Shell.flyout.test.jsx:399–405` does. It verifies the final state, not the subscription/closure behavior across the crossing.

- **LOW — Other directly affected comments remain inaccurate.**  
  The plan updates the hairline and focus comments, but `app/src/ui/Shell.jsx:449` still describes “Both Import buttons,” lines `681–690` describe five More items and two Import buttons, and `app/src/styles/shell.css:1263–1265` says all three header tools are duplicated in More.

### Suggestions
- Add one wide-to-narrow test: open an import error at 1024, narrow to 393, close with focus inside the panel, and verify focus on More’s summary.
- Update the directly orphaned comments alongside the removal.

### Risk Assessment
**LOW.** The implementation is narrowly scoped and supported by the existing shell structure.

## Cross-plan assessment

**Coverage complete: 12-09, 12-10, 12-11, 12-12, 12-13, 12-14, and 12-15.**

**Overall risk: HIGH until the draft-transition and iPad-proof gaps are corrected.**

The plans generally respect the approved design, existing domain boundaries, and storage constraints. The principal risks are transition correctness and whether the tests prove what their PASS labels claim.

### Required revisions before execution

1. **Close 12-10’s widening race.** Keep competing pen openers locked throughout held-draft restoration.
2. **Assign the phone-width test migration.** The nominally independent wave-four plans are not independently green against the current 393 pen suites. In particular, 12-11’s instruction to treat non-preview failures as implementation defects conflicts with 12-10’s intentional removal of Next version.
3. **Repair 12-14’s full-editor Tab path and authoring prerequisites.** Otherwise the milestone’s decisive device proof is incomplete.
4. **Make 12-12’s focus destination follow the committed insertion**, including cancellation when another chooser has replaced the opener.
5. **Align interactive tests and caret fallback coverage with their actual execution environments.**

**Recommendation: request changes, then proceed with the existing overall plan structure.** The product scope does not need reopening; the transition guards, test ownership, and proof steps do.


---

## OpenCode Review (opencode-argon)

## 12-09

### 1. Summary
Plan `12-09` implements the first slice of `PHONE-01`: wrapping `/notebook/new` and `/notebook/:recipeId/:versionId/edit` in `DeskOnly` so that below 724 px they render the placeholder markup (`"Done at the desk or on the iPad."`) without mounting `CreationRoute` or `EditRoute`, and gating `New recipe`, `Resume`, `Resume editing`, and Home's `Next version` on `useBelow724()`. The architectural choice to wrap the route `element` in `app/src/router.jsx` rather than guarding inside the route components is sound and guarantees kept drafts cannot be read, modified, or redirected away below 724 px. Two concrete implementation pitfalls in `app/src/ui/NotebookPlace.jsx` and `12-board-check.mjs` need attention during execution.

### 2. Strengths
- **Route-element boundary prevents draft side effects (`app/src/router.jsx:147,157`, `app/src/ui/CreationRoute.jsx:35-51`, `app/src/ui/EditRoute.jsx:42-91`):** Both `CreationRoute` and `EditRoute` fire `useEffect` reads on mount and call `navigate(..., { replace: true })` when a draft is missing or disqualified. Wrapping `<CreationRoute />` and `<EditRoute />` in `<DeskOnly>` at `app/src/router.jsx:147,157` ensures neither component mounts below 724 px, satisfying the "a kept draft is not touched" invariant by construction (`12-09-PLAN.md:124`).
- **Debounce-window persistence across width crossings (`app/src/ui/useKeptDraft.js:45-54,378-389`):** When the viewport narrows below 724 px, `DeskOnly` unmounts `CreationPage`, which triggers `useKeptDraft`'s cleanup at `app/src/ui/useKeptDraft.js:387` (`flushPendingDraft()`). Any keystrokes still inside the 250 ms debounce window (`app/src/ui/useKeptDraft.js:367`) are flushed immediately to `repository.saveDraft`, and `12-09-PLAN.md:126-128` explicitly tests this <250 ms crossing in both jsdom and Playwright WebKit.
- **Preserves existing static-markup tests (`app/src/ui/Placeholder.jsx:6-13`, `app/src/ui/Shell.test.jsx:70`):** Giving `Placeholder` an optional `note = "${name} is not built yet."` prop (`12-09-PLAN.md:120`) and defaulting `below724 = false` on `NotebookList`, `HomeBody`, `HomeLead`, `RecipeRows`, and `RowActions` (`12-09-PLAN.md:156`) keeps `Shell.test.jsx:70`, `NotebookPlace.test.jsx:50-150`, and `RecipeList.test.jsx:59-150` green in the node environment.

### 3. Concerns
- **[MEDIUM] `12-board-check.mjs` ignores `scope` on full-page panels unless `anchor` is also set (`.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-check.mjs:185-216` vs `.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-09-PLAN.md:188`):**
  In `notebook-home-more-393.html:13140-13142` and `one-line-page.html:13140-13141`, every `.fp-win.g2w-393[data-pid="..."]` contains `.shell`, so `12-board-check.mjs:705` classifies them as `kind === 'full'`. In `GATHER` (`12-board-check.mjs:185-216`), `cfg.scope` is **only** consulted inside `if (cfg.kind === 'full' && cfg.anchor)` (`:185-206`); in the `else if (cfg.kind === 'full')` branch (`:207-216`), `queryRoot` is `panelEl ?? document` and `cfg.scope` is ignored. `12-09-PLAN.md:188` states *"so the checks are scoped to `.shell__main` and never read More's list ... and no button, link or textarea in the page (`absent`)"*. If `12-board-places.mjs` sets `scope: '.shell__main'` without setting `anchor: '.shell__main'`, `absent: ['button', 'a', 'textarea']` on `desk-new` and `desk-edit` will query the entire `.shell` (matching the header and tab-bar buttons/links) and fail with `present`.
- **[MEDIUM] `NotebookList` renders `<NotebookHead>` and `<NotebookDraftRow>` in two separate return branches (`app/src/ui/NotebookPlace.jsx:293-307` vs `.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-09-PLAN.md:158,162`):**
  In `app/src/ui/NotebookPlace.jsx`, `NotebookList` has an early return when `work.length === 0` (`:293-300`) that renders `<NotebookHead ... />` (`:296`) and `{draft && <NotebookDraftRow ... />}` (`:297`), in addition to the main return (`:305-306`). `12-09-PLAN.md:158` instructs `NotebookList` to hand `below724` to `NotebookHead` and `NotebookDraftRow`, and `12-09-PLAN.md:171` checks `grep -c 'below724' >= 4`. If an executor only passes `below724` in the main return at `:305-306` and misses `:296-297`, the grep check will still pass (7 occurrences) and the seed-based tests in `12-09-PLAN.md:162` (`work.length === 8`) will not catch that an empty Notebook below 724 px still renders `New recipe` and `Resume`.
- **[LOW] Native `querySelectorAll` in `panel.absent` on Home tasted rows (`.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-check.mjs:279` vs `.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-09-PLAN.md:188`):**
  `12-09-PLAN.md:188` asks `12-board-places.mjs` to check *"the Home rows' `.home__actions` count and text with a tasted row's span absent"*. Because `12-board-check.mjs:279` passes `absent` selectors to native `queryRoot.querySelectorAll(selector)`, Playwright-only pseudo-selectors like `:has-text("Tasted")` throw a `DOMException`. On panel `home`, Olive Oil is the first row (`li.home__row:first-child`) and Pineapple is the third (`li.home__row:nth-child(3)`), so `absent` must use standard CSS selectors such as `.home__row:first-child .home__actions` or `.home__actions a[href="/notebook/olive-oil-ice-cream/olive-oil-ice-cream-v2"]`.

### 4. Suggestions
- In `12-board-places.mjs` (`12-09-PLAN.md:188`), explicitly set `anchor: '.shell__main'` (not just `scope: '.shell__main'`) on all five panels so `12-board-check.mjs:185` activates `scopeEl` on these `kind === 'full'` panels.
- In `app/src/ui/NotebookPlace.jsx:296-297` and `app/src/ui/NotebookPlace.test.jsx` (`12-09-PLAN.md:158,162`), pass `below724={below724}` in both the `work.length === 0` return (`:296-297`) and the non-empty return (`:305-306`), and include a `versions: []` test case at `below724: true` with and without a kept `draft`.
- In `12-board-places.mjs` (`12-09-PLAN.md:188`), use standard DOM selectors for `absent` (e.g., `.nb__head button`, `.nb__draft-act`, `.nb__row-act`, `.home__row:first-child .home__actions`).

### 5. Risk Assessment
**LOW-MEDIUM** — The code changes in `Placeholder.jsx`, `DeskOnly.jsx`, `router.jsx`, `NotebookPlace.jsx`, and `RecipeList.jsx` are small and isolated, with the main execution risks being the `anchor` vs `scope` behavior in `12-board-check.mjs:185-216` and the duplicate `<NotebookHead>`/`<NotebookDraftRow>` call sites in `NotebookPlace.jsx:296-306`.

---

## 12-10

### 1. Summary
Plan `12-10` implements the recipe page's phone head (`<724` px) and protects a kept `Next version` (`plan`) draft below 724 px per Mark's decision B (`decide-p12-record-with-draft-held`): keeping the `plan` pen shut on load without deleting its stored record, suppressing all record/tasting/correct actions on that version below 724 px, rendering the `Edit kept` and `Draft:` lines in `VersionRow.jsx`, and restoring the `plan` pen when the viewport widens to `>=724` px. The analysis of the single-key `drafts` store (`app/src/store/db.js:61-62`, `app/src/domain/draft.js:557-562`) and `RecipePage.shell.test.js` ownership pins is thorough, but there is a subtle race condition between `draftRestoreDone` (`useKeptDraft.js`) and `draftsLoaded` (`useRecipeData.js`) that affects `useRouteIntents.js`, as well as a pre-load flash of record buttons while `draftsLoaded` is `false`.

### 2. Strengths
- **Preserves `useKeptDraft` single-call-site invariants (`app/src/ui/useKeptDraft.js:210-305`, `app/src/ui/RecipePage.shell.test.js:258-295`):** `RecipePage.shell.test.js:264-280` pins exact occurrence counts of `repository.getDraft(versionId)` (1), `if (draftRestoreStartedRef.current) return;` (1), `draftRestoreStartedRef.current = true` (1), `onRestorePlan(record.payload, record.penOpenedAt)` (1), and `onPageStatus(DRAFT_KEPT_STATUS)` (1), and `:608-625` forbids any `cancelled`/`canceled` identifier in `useKeptDraft.js`. Re-running the existing restore `useEffect` via a `restoreRound` state dependency when `keepPlanShut` flips from `true` to `false` (`12-10-PLAN.md:196`) satisfies all of those source-text pins.
- **Preserves `RecipePage.test.jsx` Test K and Test L source-text pins (`app/src/ui/RecipePage.test.jsx:1255-1290`):** `RecipePage.test.jsx:1257` concatenates `RecipePage.jsx` and `useBatchRecording.js` and matches `function handleStartTasting(batch)` (`:1278`) and `onStartTasting={handleStartTasting}` on `<VersionRow>` (`:1282`). Destructuring `handleStartTasting: startTasting` and defining `const handleStartTasting = ...` as an arrow function in `RecipePage.jsx` (`12-10-PLAN.md:125`) keeps both regexes matching cleanly.
- **Separates `ownDraft` from `waitingPlanDraft` (`app/src/ui/RecipePage.jsx:358-369,451,470-474`):** Passing `ownDraft` as a separate prop to `VersionRow` (`12-10-PLAN.md:167`) prevents `RecipeHistory` (`:470-474`) from drawing a spurious draft node in the history rail when the held draft belongs to the current version.

### 3. Concerns
- **[HIGH] Race between `draftRestoreDone` and `draftsLoaded` can drop a valid `startTasting` route intent from Home (`app/src/ui/useRouteIntents.js:42-55`, `app/src/ui/useRecipeData.js:67-83`, `.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-10-PLAN.md:125`):**
  In `app/src/ui/useRouteIntents.js:43`, the `startTastingOnMount` effect checks `if (!startTastingOnMount || startTastingConsumedRef.current || !draftRestoreDone) return;` — unlike `startNextVersionOnMount` at `:67` (`if (!draftRestoreDone || !versionsLoaded || !draftsLoaded) return;`), it does **not** wait for `draftsLoaded`. Meanwhile, `12-10-PLAN.md:125` specifies that `handleStartAmending` in `RecipePage.jsx` refuses *"below 724 while drafts are not yet read (draftsLoaded false)"*. If `useKeptDraft`'s `repository.getDraft(versionId)` resolves before `useRecipeData`'s `repository.listDrafts()` sets `draftsLoaded = true`, `useRouteIntents.js:52-54` will set `startTastingConsumedRef.current = true`, clear `location.state`, and call `onStartAmending`, which will return early because `!draftsLoaded`! Once `draftsLoaded` becomes `true`, the intent is already consumed and the tasting pen will never open even when there is no held draft.
- **[MEDIUM] Record controls flash during initial load below 724 px before `draftsLoaded` settles (`app/src/ui/RecipePage.jsx:198`, `app/src/ui/VersionRow.jsx:449`, `app/src/ui/BatchRow.jsx:788,802,1335`, `.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-10-PLAN.md:125,161`):**
  In `12-10-PLAN.md:125`, `ownPlanDraft` is `null` while `draftsLoaded` is `false`, so `planHeld` (`below724 && ownPlanDraft !== null`) is `false`, and `editState` (`app/src/ui/RecipePage.jsx:198`) is `'loading'` (not `'editing'`). Consequently, on the first render after `version` and `recipe` load but before `draftsLoaded` is `true`, `VersionRow` (`editState !== 'editing' && !(ownDraft !== null)`) and `BatchRow` (`recordingLocked={editState === 'editing' || planHeld}`) will render `Record batch` / `Record tasting` / `Record another` / `Correct`, and then hide them once `draftsLoaded` resolves (the exact flash `T-11-56` at `app/src/ui/RecipePage.jsx:195-197` was written to prevent for `Edit`).
- **[MEDIUM] A `plan` draft written in the current session at `>=724` px is not in `RecipePage`'s `drafts` state (`app/src/ui/useRecipeData.js:67-83`, `app/src/ui/useKeptDraft.js:45-54`):**
  `useRecipeData.js:69` calls `repository.listDrafts()` only once per `versionId` on mount. If a user opens `Next version` at 1366 px, types changes (which `useKeptDraft` saves to IndexedDB via `repository.saveDraft`), and narrows the window below 724 px, the open pen stays open per CONTRACT section 11 number 5b. That works because `openPen === 'plan'`. However, in `12-band-probe.mjs` and `12-board-band.mjs` (`12-10-PLAN.md:131,202`), the page must be reloaded or navigated to after keeping the `plan` draft at 1366 px so `useRecipeData` reads `drafts` and `useKeptDraft` runs with `keepPlanShut: true` (`12-10-PLAN.md:131` does reload at 393, whereas `12-10-PLAN.md:202` says *"band-draft (the same with a Next version draft kept)"* — make sure `12-board-band.mjs` reloads at 393 or seeds the `plan` draft before visiting the route at 393).
- **[LOW] `absent` selectors in `12-board-band.mjs` must be valid CSS selectors (`.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-10-PLAN.md:202`):**
  `12-10-PLAN.md:202` says *"with Next version, Edit and Resume editing declared `absent`"*. In `app/src/ui/VersionRow.jsx:449-502`, those buttons carry no `aria-label` or `data-act`, and `12-board-check.mjs:279` uses native `querySelectorAll`. Use `.notebook-version__acts button.notebook-link` (for `band-tasted`, `band-awaiting`, `band-none`, `band-tasted-723`, `band-editable`) and `.notebook-version__acts button` (for `band-editing` and `band-draft`, where only the `<a class="notebook-link">Print sheet</a>` remains).

### 4. Suggestions
- To eliminate the `startTastingOnMount` race with `draftsLoaded`: either have `useKeptDraft` also expose `planHeld` (since `useKeptDraft` has already resolved `repository.getDraft(versionId)` by the time `draftRestoreDone` becomes `true` at `app/src/ui/useKeptDraft.js:302`), or gate `startTastingOnMount` in `app/src/ui/useRouteIntents.js:43` on `draftsLoaded` just like `startNextVersionOnMount` at `:67` (`if (!startTastingOnMount || startTastingConsumedRef.current || !draftRestoreDone || !draftsLoaded) return;` and add `draftsLoaded` to its dependency array at `:55` — note `RecipePage.shell.test.js:322-331` does not restrict `draftsLoaded` in `useRouteIntents.js`).
- In `12-board-band.mjs` (`12-10-PLAN.md:202`), seed the Coffee recipe, version, and `edit` / `plan` draft records via `panel.seed` (as `12-cases.mjs` does) or reload the route at 393 after creating them at 1366 so `RecipePage` mounts at 393 with `keepPlanShut: true`.

### 5. Risk Assessment
**MEDIUM** — This plan modifies `useKeptDraft.js` and `RecipePage.jsx`, which `CLAUDE.md` and `state-machine-audit` identify as a high-risk state-machine cluster, and must navigate strict source-text pins in `RecipePage.shell.test.js` and `RecipePage.test.jsx`.

---

## 12-11

### 1. Summary
Plan `12-11` adds `Preview step` (`p.method-step__targets > Button.text-control`) and the `.mk-preview` block (`StepReading`) to an open step in the version pen (`StepPenBody` in `app/src/ui/Method.jsx`), closing `bug-p11-pen-step-no-preview`. The component change in `Method.jsx` is clean and reuses existing `StepReading` and `.mk-preview` styles, but Task 1's test instructions for `app/src/ui/Method.test.jsx` conflict with that test file's `node` execution environment.

### 2. Strengths
- **Reuses `StepReading` and `.mk-preview` CSS without duplication (`app/src/ui/Method.jsx:8`, `app/src/ui/StepReading.jsx:63-80`, `app/src/styles/notebook.css:361-379`):** `.notebook .mk-preview` in `app/src/styles/notebook.css:361-379` is scoped under `.notebook`, not `.mk-page`, so it already styles `.mk-preview` inside the version pen with zero CSS changes, matching `pen-preview-step.html:13142-13143`.
- **Handles unkeyed `StepPenBody` lifecycle across `Done` and `Cancel` (`app/src/ui/Method.jsx:143-148,625-639`):** Because `StepPenBody` stays mounted when switching between its open and closed branches (`isOpen`), resetting `previewing` to `false` via `useEffect` when `isOpen` becomes `false` (`12-11-PLAN.md:86`) prevents a stale preview from reappearing when the step is reopened after `Done` or `Cancel`.
- **Accurate pin accounting (`app/src/ui/Method.test.jsx:1445-1462,1477-1486`):** `12-11-PLAN.md:68,90` accurately identifies the exact button-count pins in `Method.test.jsx` (`5 -> 6` at `:1447`, `6 -> 7` at `:1459`, and `9 -> 10` `<Button` tags in `Method.jsx` at `:1482`).

### 3. Concerns
- **[HIGH] `app/src/ui/Method.test.jsx` runs in the `node` environment (`renderToStaticMarkup`) and cannot simulate button clicks (`.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-11-PLAN.md:90` vs `app/src/ui/Method.test.jsx:1-12` and `app/src/ui/Method.recording.test.jsx:7-8`):**
  `12-11-PLAN.md:90` instructs Task 1 to add cases to `Method.test.jsx` where `Preview step` is *"pressed it reads Hide preview and the block stands right after the line with the typed lead-in, instruction, target, purpose and aside; Done then reopening shows Preview step; Cancel the same."*
  However, `app/src/ui/Method.test.jsx:1-12` has **no** `// @vitest-environment jsdom` docblock and runs in Vitest's `node` environment using `renderToStaticMarkup` (as documented at `app/src/ui/Method.test.jsx:5-7`, `app/src/ui/Method.jsx:97-99`, and `app/src/ui/Method.recording.test.jsx:7-8`: *"jsdom, because renderToStaticMarkup drops handlers and focus; a sibling of Method.test.jsx, which runs in the node environment"*). Because `previewing` is internal `useState(false)` on `StepPenBody` (`12-11-PLAN.md:86`), `renderToStaticMarkup` in `Method.test.jsx` cannot click `Preview step`, `Done`, or `Cancel`, and calling `document.createElement` in `Method.test.jsx` throws `ReferenceError: document is not defined`.
- **[LOW] Margin number on a removed step in `StepPenBody` (`app/src/ui/Method.jsx:696-704` vs `.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-11-PLAN.md:86`):**
  In `app/src/ui/Method.jsx:700-702`, a step in the developing pen renders `<span className="method-step__n">{marginInfo.frame === 'current' ? marginInfo.number : null}</span>` so a removed step (`marginInfo.frame === 'baseline'`) prints no number in its margin (`D-UAT-5, G-03-14`). `12-11-PLAN.md:86` says *"StepPenBody takes `number` (Method passes `marginInfo.number`)"*. Passing `marginInfo.frame === 'current' ? marginInfo.number : null` instead of `marginInfo.number` keeps the preview's `.method-step__n` consistent with the step's own margin if a removed step is opened and previewed.

### 4. Suggestions
- Move the interactive click/toggle/`Done`/`Cancel` unit test cases from `Method.test.jsx` (`12-11-PLAN.md:90`) into `app/src/ui/RecipePage.perStep.test.jsx` (or `app/src/ui/Method.recording.test.jsx`), which already run under `// @vitest-environment jsdom`, and keep `Method.test.jsx` to static-markup assertions on `renderOpenStepPenBody` (button count, `aria-label="Step 3, Preview step"`, and placement of `p.method-step__targets` after `purpose`/`aside` and before the uses wrapper).
- In `app/src/ui/Method.jsx:703`, pass `number={marginInfo.frame === 'current' ? marginInfo.number : null}` to `StepPenBody` (and default `number = null` in `StepPenBody` so `renderOpenStepPenBody` in `Method.test.jsx:1280` needs no required prop).

### 5. Risk Assessment
**LOW** — Self-contained UI addition in `Method.jsx`; resolving the `node` vs `jsdom` test placement in `Method.test.jsx` avoids a test-runner failure in Task 1.

---

## 12-12

### 1. Summary
Plan `12-12` implements the structural half of `STRUCT-05`: adding `addRowAfter` to `app/src/domain/creation.js`, reordering `RowActs` in `app/src/ui/IngredientTable.jsx` with per-row `Add ingredient`, anchoring the picker in `app/src/ui/CreationPage.jsx` with fallback to `addRow` when an anchor becomes stale, regrouping `CreationStep` in `app/src/ui/CreationSteps.jsx` into two groups, stripping `.dl-tab, .dl-flag` notes in `12-board-check.mjs`, and verifying with `12-board-rowcontrols.mjs` and `12-tab-probe.mjs`. While the domain and React changes are well-specified, inspecting `.planning/canvas-generators/p12g2.py` and `.planning/sketches/016-entry-points-pen-preview-row-controls/row-controls.html` reveals **two board-check mismatches** in Task 3 (`kr-preview` and `ai-pick`) that will cause `12-board-rowcontrols.mjs` to fail if written as described in `12-12-PLAN.md:191`.

### 2. Strengths
- **Safe stale-anchor handling (`app/src/domain/creationSteps.js:93-101`, `.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-12-PLAN.md:36,127`):** `groupRows(draft, group)` in `app/src/domain/creationSteps.js:98-99` throws a `RangeError` if `group` is a step `n` that is no longer in `liveSteps(draft)`. `12-12-PLAN.md:127` explicitly specifies `anchorHolds(draft, afterRowId, group)` checking `liveSteps(draft)` before calling `groupRows(draft, group)` both in `handlePick` and inside the `setCreateDraft((prev) => ...)` updater, falling back to `addRow` when the anchor row or its step was removed or placed while the picker was open.
- **Fixes landing focus for step-placed rows (`app/src/ui/CreationPage.jsx:770`, `app/src/ui/IngredientTable.jsx:625-628`, `.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-12-PLAN.md:127`):** Replacing `focusRowId ? "${focusRowId}:0" : null` at `app/src/ui/CreationPage.jsx:770` with `${rowId}:${group}` ensures `gramsInputsRef.current.get(creationFocusLine)?.focus()` at `app/src/ui/IngredientTable.jsx:627` focuses the newly added row's grams field when it lands inside a numbered step (`group !== 0`).
- **Anchoring strategy isolates 12-12 from 12-13's `.mk-keys` lines (`.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-12-PLAN.md:191`):** Because `row-controls.html` already includes `<p class="mk-keys">` under each region heading while `12-13` adds `<p class="mk-keys">` in the next wave, anchoring `12-board-rowcontrols.mjs` on `.ingredient-table` and `.method-region > ol.method-steps` keeps all `box` coordinates relative to the table and list origins below `.mk-keys`.

### 3. Concerns
- **[HIGH] Panel `kr-preview` in `row-controls.html` has a mismatched `.mk-preview` block from the two-field step (`.planning/canvas-generators/p12g2.py:130-134,297`, `.planning/sketches/016-entry-points-pen-preview-row-controls/row-controls.html:13153`, `CONTRACT.md` §9 bullet 2 vs `.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-12-PLAN.md:40,191`):**
  In `p12g2.py:297`, panel `kr-preview` was built from `ed_full` (where Step 1 has target `Heat to` / `82 °C`, purpose `Pulls the coffee into the cream.`, and aside `Do not let it boil.`), **but** `preview_block()` (`p12g2.py:130-134`) spliced in `CAP['ed_preview']['method']` from the plain two-field step (`row-controls.html:13153` caption: *"The block is the build's, from the two-field step"*). As `CONTRACT.md` section 9 bullet 2 states: *"The open preview on `row-controls.html` does not show a target or an aside. Its block is the build's preview of a two-field step, placed where section 5 puts it."*
  In the live app (`app/src/ui/CreationSteps.jsx:194-205`, `app/src/domain/creation.js:95-101`, `app/src/ui/StepReading.jsx:75-77`), pressing `Preview step` on a step that has a target, purpose, and aside renders all three inside `.mk-preview`. Consequently, if `12-board-rowcontrols.mjs` (`12-12-PLAN.md:191`) checks `.mk-preview (box, text)`, `p.method-step__acts (count, box)`, and `li.mk-step button (count, text, box, ...)` on `kr-preview` with the target, purpose, and aside written, `.mk-preview` `text` and `box.h` (plus the `box.y` of `p.method-step__acts` and Step 2 below it) will **fail** against the board!
- **[HIGH] Panel `ai-pick` in `row-controls.html` truncates `<ul class="pick__list">`, so checking `.pick` `box` will fail on height (`.planning/canvas-generators/p12g2.py:267-268,305`, `.planning/sketches/016-entry-points-pen-preview-row-controls/row-controls.html:13155` vs `.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-12-PLAN.md:191`):**
  In `p12g2.py:267-268`, `editor2('ed_picker', ..., cut_pick=True)` truncates `<ul class="pick__list">` after 2600 characters (`row-controls.html:13155`: *"the list cut short here"*), leaving only 8 `<li class="pick__row">` items on the board instead of all 111 library entries in the live app. In `12-board-check.mjs:325`, the `box` check compares `x`, `y`, `w`, **and `h`** within 1 px. Checking `.pick` with `checks: ['box']` (`12-12-PLAN.md:191`) on `ai-pick` will fail because `a.box.h` in the app (111 items) is ~4500 px taller than `b.box.h` on the board (8 items).
- **[LOW] `handleCancelPicker` focus fallback when an unplaced anchor row is in `choosing` mode (`app/src/ui/CreationPage.jsx:322-330,397-400` vs `.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-12-PLAN.md:127`):**
  In `12-12-PLAN.md:127`, when the picker was opened from a row (`opener: 'row'`), `handleCancelPicker` requests `{ kind: 'row-act', line: "${afterRowId}:${group}", act: 'add-ingredient' }`, or `'ingredient-target'` when that line is gone. If that unplaced row was switched into the `Add to step` chooser (`mk-row-acts--choosing`, `app/src/ui/IngredientTable.jsx:264-290`) while the picker was open, `tr[data-line="..."]` still exists in the DOM, but `[data-act="add-ingredient"]` is not rendered inside it (`Cancel · Step 1 · Step 2` are rendered instead), so `line?.querySelector('[data-act="add-ingredient"]')` at `app/src/ui/CreationPage.jsx:325` returns `null` and nothing receives focus unless it falls back to `.ingredient-table-region .mk-head-act`.

### 4. Suggestions
- For `kr-preview` in `12-board-rowcontrols.mjs` (`12-12-PLAN.md:191`): to match the board's `kr-preview` panel (where Step 1 has target, purpose, and aside open above `.mk-preview`, while `.mk-preview` shows only the two-field step), either:
  - in `kr-preview`'s `steps(page)`, open `Add target`, `Add purpose`, and `Add aside` on Step 1 without typing non-blank text into them (or type a one-sided target with no `Required` message—note a one-sided target renders `FieldFeedback`, so only blank target + open empty purpose/aside or `appStyle` hiding `.mk-preview .method-step__targets, .mk-preview .method-step__purpose, .mk-preview .method-step__aside { display: none !important }` reproduces the exact board geometry), **or**
  - check `.mk-preview__cue` (`box`, `text`) and `.mk-preview .method-step__lead` (`box`, `text`, `font`) and Step 1's controls above `.mk-preview`, rather than `.mk-preview`'s full `box`/`text` and the elements shifted below it (citing `CONTRACT.md` section 9 bullet 2).
- For `ai-pick` in `12-board-rowcontrols.mjs` (`12-12-PLAN.md:191`): check `.pick__head` (`box`, `text`) and `.pick .ing__filters` (`box`) instead of `.pick` (`box`), or pass `appStyle: '.pick__list > li:nth-child(n+9) { display: none !important }'` on the `ai-pick` panel so `.pick`'s height matches the board's 8-item cut (`p12g2.py:268`).
- In `app/src/ui/CreationPage.jsx:322-330`, if `target` is null in the `'row-act'` (and in 12-13, `'row-grams'`) branch, fall back to `page.querySelector('.ingredient-table-region .mk-head-act')` so focus never drops to `document.body`.

### 5. Risk Assessment
**MEDIUM-HIGH** — The domain and component changes are solid, but without addressing the `kr-preview` and `ai-pick` board construction quirks from `p12g2.py:130-134,267-268`, Task 3's `12-board-check.mjs` verification step will fail on `box`/`text` comparisons.

---

## 12-13

### 1. Summary
Plan `12-13` completes `STRUCT-05` by adding `editorKeys.js` (`Cmd+Return`/`Ctrl+Return` to add, `Ctrl+Cmd+Up`/`Down` to move while preserving the caret via React DOM's commit-phase selection restore), attaching `aria-keyshortcuts` to the step and row buttons, rendering `p.mk-keys` under the `Instructions` and `Ingredients` headings, and verifying with `12-keys-probe.mjs` and `12-board-keys.mjs`. The plan's two-branch strategy (Branch A relying on React 19's commit-phase restore, Branch B as a fallback) is well-reasoned from the research probes, but there is a **critical text mismatch** in Task 3's instructions regarding the apostrophe in `In a row's grams:` that will break `12-board-keys.mjs` if followed literally.

### 2. Strengths
- **Avoids racing React 19's commit-phase selection restore (`app/src/ui/CreationPage.jsx:425-437,479-486`, `.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-13-PLAN.md:62,114,118-120`):** Passing `{ keyed: true }` to `handleMoveStep` and `handleMoveRow` so `focusRequestRef.current` is left `null` lets React DOM's `restoreSelection` keep focus and `selectionStart`/`selectionEnd` on the moved `<textarea>` even when moving down re-inserts the DOM node.
- **Proper IME, modifier, and key-repeat guards (`app/src/ui/oneLineField.js:10-14`, `.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-13-PLAN.md:109-112`):** `keyIntent` checks `event.nativeEvent?.isComposing === true || event.keyCode === 229`, rejects `altKey` and `shiftKey`, returns `'ignore'` (still calling `event.preventDefault()`) on `event.repeat` for `Enter`, and composes cleanly with `holdReturn` for single-line fields while leaving plain `Enter` unprevented in multi-line fields (`instruction`, `purpose`, `aside`).
- **Keeps `RecipeSheet` `IngredientsHead` pin intact (`app/src/ui/RecipeSheet.jsx:139-146`, `app/src/ui/RecipeSheet.test.jsx:111-115`, `app/src/ui/RecipePage.test.jsx:1300-1310`):** Placing `<p className="mk-keys">` in `RecipeSheet.jsx` right after `<IngredientsHead ... />` when `mode === 'creating' && hasRows` keeps `<IngredientsHead>` rendered once and keeps the keys line visible under `<h2>Ingredients</h2>` when the picker is open (`ingredientsAct === null`).

### 3. Concerns
- **[HIGH] Contradictory apostrophe instruction in Task 3 will cause `12-board-keys.mjs` to fail on `p.mk-keys` text (`.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-13-PLAN.md:182` vs `.planning/canvas-generators/p12g2.py:95` and `.planning/sketches/016-entry-points-pen-preview-row-controls/row-controls.html:13146,13154-13157`):**
  `12-13-PLAN.md:182` states: *"one `<p className="mk-keys">In a row's grams: Cmd+Return adds an ingredient after it. Ctrl+Cmd+Up or Down moves it.</p>` ... The words are CONTRACT section 8's, verbatim, **typographic apostrophe as the board writes it** (read it from the board's markup)."*
  However, in `p12g2.py:95` (`KEYS_ROW = 'In a row\'s grams: ...'`) and `row-controls.html:13146` (`In a row&#x27;s grams: ...`), the board uses an **ASCII straight apostrophe `'` (`U+0027`, HTML entity `&#x27;`)**, **not** a curly/typographic apostrophe `’` (`U+2019`)! And `CONTRACT.md` section 8 (`CONTRACT.md:107`) also uses ASCII `'`. If the executor writes `’` (`U+2019`) in `RecipeSheet.jsx`, `12-board-check.mjs` (`b.text === a.text`) on `12-board-keys.mjs` (`rc-drawn`, `ai-pick`) will fail with `board "In a row's grams: ...", app "In a row’s grams: ..."`.
- **[MEDIUM] Pre-key vs post-key states on `kr-press`/`kr-added` and `kr-move`/`kr-moved` in `12-board-keys.mjs` (`.planning/canvas-generators/p12g2.py:293-296,299-302` vs `.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-13-PLAN.md:186`):**
  `12-13-PLAN.md:186` says: *"kr-press and kr-added (steps place the caret where the board's flag says and press Meta+Enter: focus on the new step's lead-in), kr-move and kr-moved (Control+Meta+ArrowDown: focus and the moved order)."*
  In `row-controls.html` (`p12g2.py:293-296`), `kr-press` and `kr-move` are the **before-keypress** panels (2 steps: Steep then Churn, with focus in `Step 1, instruction`), whereas `kr-added` (3 steps, focus in `Step 2, lead-in`) and `kr-moved` (2 steps: Churn then Steep, focus in `Step 2, instruction`) are the **after-keypress** panels. If `12-board-keys.mjs` presses `Meta+Enter` in `kr-press`'s `steps` or `Control+Meta+ArrowDown` in `kr-move`'s `steps`, the app will be in the post-keypress state while the board panel is in the pre-keypress state, failing `count`, `text`, `box`, and `focus`.
- **[LOW] Duplicate evidence filenames when `12-board-rowcontrols.mjs` and `12-board-keys.mjs` run together (`.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-board-check.mjs:605-611` vs `.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-13-PLAN.md:186,189`):**
  Both `12-board-rowcontrols.mjs` and `12-board-keys.mjs` target `row-controls.html` panels `rc-drawn`, `rc-full`, and `ai-pick`. In `12-board-check.mjs:605-611`, if `--evidence` is passed when running both specs together (`12-13-PLAN.md:189`, `12-14-PLAN.md:111`), any two panels across the specs that share `${board}-${label}` fail with `evidence: ... is written by two panels; give one a distinct label`.
- **[LOW] Branch B fallback selector if step `number` changes on move (`.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-13-PLAN.md:120,237`):**
  If Branch B (or the post-iPad `/gsd-quick` fallback at `12-13-PLAN.md:237`) is ever needed, note that a step field's `aria-label` (`Step ${number}, instruction`, `CreationSteps.jsx:103`) changes its display `number` when the step moves (`Step 2, instruction` -> `Step 1, instruction`), and only `lead-in` currently has `data-field="lead-in"`. A fallback lookup inside `li.mk-step[data-step="${request.n}"]` must match by field suffix (`textarea[aria-label$=", instruction"]`, etc.) or `data-field`, never the pre-move `aria-label`.

### 4. Suggestions
- In `12-13-PLAN.md:182`, replace *"typographic apostrophe as the board writes it"* with *"the ASCII straight apostrophe `'` (`In a row's grams: ...`) as `row-controls.html` (`&#x27;`) and `CONTRACT.md` section 8 write it"*.
- In `12-board-keys.mjs` (`12-13-PLAN.md:186`), ensure `kr-press` and `kr-move` stop after focusing `Step 1, instruction` (pre-key state), and only `kr-added` (presses `Meta+Enter`) and `kr-moved` (presses `Control+Meta+ArrowDown`) execute the key press. Also give every panel in `12-board-keys.mjs` a distinct `label` (e.g. `keys-rc-drawn-ing`, `keys-rc-drawn-method`, `keys-rc-full`, `keys-ai-pick`) so `--evidence` never collides with `12-board-rowcontrols.mjs`.
- In `app/src/ui/CreationSteps.test.jsx:41-60` and `app/src/ui/IngredientTable.creating.test.jsx:44-91`, wire `onAddStep`, `onMoveStep`, and `onAddRowAfter` spies in the test harnesses for Task 2's unit tests (`12-13-PLAN.md:152`).

### 5. Risk Assessment
**MEDIUM** — The keyboard handling and React 19 caret preservation are well-validated by research probes, provided the straight apostrophe in `p.mk-keys` and the pre/post panel states in `12-board-keys.mjs` are followed.

---

## 12-14

### 1. Summary
Plan `12-14` extends `12-check.sh` to run both Gate 1 and Gate 2 checks ending with `GATE2 PASS`, authors the three iPad check rows in `12-ipad-rows.md` and walks every numbered step in Playwright WebKit via `12-device-steps.mjs`, moves the two completed todo files to `.planning/todos/completed/`, and hands the rows to the orchestrator at a blocking checkpoint. The verification discipline and walk analysis are strong, but there is a **critical DOM-order error** in Row 2's whole-editor Tab step (`"from Recipe name Tab to Save"`) and a risk of copying stale pre-`e37db11a` selectors from `11-device-steps.mjs`.

### 2. Strengths
- **Rigorous proof that Round 2 does not perturb the 94-snapshot Phase 11 walk baseline (`.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-14-PLAN.md:218-230`, `.planning/phases/11-steps-structure-save-and-print/11-walk.mjs:103,200-273`):** `12-14-PLAN.md:218-230` verifies against `11-walk.mjs` that all baseline scenarios run at `WIDTH = 1366`, snapshot `.notebook` (never `.shell`), never press `Edit this step`, and never open `/notebook/new` or `/edit`, while the 5 `NEW` creation/edit scenarios use `.mk-head-act` and `aria-label`s that Round 2 preserves.
- **First-activation WebKit verification before human handoff (`.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-14-PLAN.md:32,147`):** Requiring `12-device-steps.mjs` to walk every numbered step of `12-ipad-rows.md` with single-activation discipline (`first activation missed`) and verify the step count per row against `12-ipad-rows.md` prevents handing unreachable instructions to Mark.
- **Live-data privacy and `app/dist` protection (`12-CONTEXT.md` D-12, `.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-14-PLAN.md:125,142,160`):** Prohibiting recipe-specific words/figures in `12-ipad-rows.md` (`D-12`) and enforcing scratch `--outDir` builds with `PROBE_DIST` guards keep Mark's served `app/dist` untouched.

### 3. Concerns
- **[HIGH] "from Recipe name Tab to Save" in Row 2 only walks 4 stops in `.notebook-band` and skips the entire editor body (`app/src/ui/CreationPage.jsx:685-828`, `app/src/ui/CreationSetup.jsx:234-340` vs `.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-14-PLAN.md:144,147`):**
  `12-14-PLAN.md:144` specifies in Row 2:
  *"from Recipe name Tab to Save (Expect every control outlined in turn, each Move button included, a grey one too, none skipped)"*.
  However, in `app/src/ui/CreationPage.jsx:685-754`, `Recipe name` (`:691`), `Recipe description` (`:706`), `Version name` (`:725`), `Cancel` (`:740`), and **`Save` (`:743`)** all live in `<header className="notebook-band">` at the **top** of the page (there is no footer `Save` in `CreationPage.jsx`: `RecipeSheet` is passed no `foot` prop at `:762-823`). `Before you start`, `Ingredients` (and its `Move` buttons), `Instructions` (and its `Move` buttons), `Balance`, `Watch for`, and `Setup` (`Style`, `Serving temperature`, `Targets`, `Scales`, `Problems`) all sit inside `<div className="notebook-body">` (`:760-828`), **after** `Save` in DOM and Tab order! Tabbing "from Recipe name to Save" takes only 4 Tab presses (`Recipe description` -> `Version name` -> `Cancel` -> `Save`) and stops before reaching a single ingredient row, step, or `Move` button!
- **[MEDIUM] `11-device-steps.mjs` contains stale pre-`e37db11a` selectors that will fail if copied into `12-device-steps.mjs` (`.planning/phases/11-steps-structure-save-and-print/11-device-steps.mjs:50-51,171-177,213,239,247-255,265` vs `.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-14-PLAN.md:136,147`):**
  `12-14-PLAN.md:136,147` instructs the executor to copy `11-device-steps.mjs`. Unlike `11-walk.mjs` (which `12-08` repaired), `11-device-steps.mjs` was never updated for the post-Phase-11 quick fixes and still uses:
  - `input[aria-label="${name}, grams"]`, `input[aria-label$=", lead-in"]`, and `.nb__new input` (`11-device-steps.mjs:171-177,213,219`) — all of which are now `<textarea>` (`app/src/ui/oneLineField.js:1-5`);
  - `'Move Sucrose up'` / `'Move Sucrose down'` (`11-device-steps.mjs:50-51`) — now `'Move up, Sucrose'` / `'Move down, Sucrose'` (`app/src/ui/IngredientTable.jsx:301,311`);
  - `'Step 1, add a step after it'` (`11-device-steps.mjs:239`) — now `'Step 1, Add step after it'` (`app/src/ui/CreationSteps.jsx:279`);
  - `'Add ${MILK} to a step'` and `'Add ${MILK} to step 1'` (`11-device-steps.mjs:247-248`) — now `'Add to step, ${MILK}'` and `'Step 1, Warm: add ${MILK}'` (`app/src/ui/IngredientTable.jsx:282,320`);
  - `'Step 2, change the ingredients'` (`11-device-steps.mjs:265`) — now `'Step 2, change ingredients'` (`app/src/ui/CreationSteps.jsx:211`).
- **[LOW] Task 1 precondition omits `12-15-SUMMARY.md` (`.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-14-PLAN.md:102`):**
  `12-14-PLAN.md:102` says `Every round-two app plan has landed: 12-09-SUMMARY.md to 12-13-SUMMARY.md exist`, omitting `12-15-SUMMARY.md` (even though `depends_on` at `:6` and Task 1's action at `:111` require `12-15`'s `12-board-more.mjs`).

### 4. Suggestions
- In `12-14-PLAN.md:144` (Row 2) and `12-device-steps.mjs` (`12-14-PLAN.md:147`), change *"from Recipe name Tab to Save"* to Tab from `Recipe name` through `Save`, `Before you start`, `Ingredients`, `Instructions`, `Balance`, `Watch for`, and `Setup` all the way to the last control of `Problems` (`Add problem` at the foot of `<aside aria-label="Setup">`, `app/src/ui/CreationSetup.jsx:331`).
- In `12-14-PLAN.md:136,147`, explicitly warn the executor to copy only the harness structure (`readyFor`, `press`, `tabTo`, `enter`) from `11-device-steps.mjs` and to take all field/control selectors from `11-walk.mjs` (lines 974-1035) and `p12g2c-capture.mjs`.
- Add `12-15-SUMMARY.md` to Task 1's `<precondition>` at `12-14-PLAN.md:102`.

### 5. Risk Assessment
**MEDIUM** — The DOM-order mistake in Row 2's Tab instruction (`Recipe name` to `Save`) would either cause `12-device-steps.mjs`'s whole-editor Tab check to fail or cause Mark's iPad check to stop after 4 Tabs in the header band; fixing the target end-control in `12-14-PLAN.md:144` resolves it cleanly.

---

## 12-15

### 1. Summary
Plan `12-15` removes `Import` and `Export` from the `More` disclosure (`<details className="shell__more">`) in `app/src/ui/Shell.jsx`, updates the static and jsdom Shell test suites (`Shell.test.jsx`, `Shell.importGuard.test.jsx`, `Shell.creationGuard.test.jsx`, `Shell.flyout.test.jsx`), documents why `closeImportErrors`'s narrow focus fallback to `moreSummaryRef` remains reachable, and verifies the `more` panel of `notebook-home-more-393.html` via `12-board-more.mjs`. The plan is well-scoped and shares no files with `12-09`, `12-10`, or `12-11` in Wave 4.

### 2. Strengths
- **Removes dead DOM nodes rather than gating them (`app/src/ui/Shell.jsx:703-742`, `app/src/styles/shell.css:1082-1084`):** Because `.shell__tabs` is `display: none` from 724 px up (`app/src/styles/shell.css:1082-1084`), `More` is only ever visible below 724 px. Removing `Import` and `Export` from `.shell__more` outright (`12-15-PLAN.md:26,85`) rather than gating them on `!below724` avoids leaving two permanently hidden buttons in the DOM at `>=724` px.
- **Retains reachable narrow Import error focus fallback and CSS rules (`app/src/ui/Shell.jsx:370-376`, `app/src/styles/shell.css:1186-1188,1255-1261`, `app/src/styles/shell.test.js:668-669`):** Keeping `(below724 ? moreSummaryRef : importRef)` in `closeImportErrors` (`12-15-PLAN.md:27,115`) handles the case where an import error panel opened at `>=724` px is closed after the viewport narrows below 724 px, and leaving `app/src/styles/shell.css` untouched keeps `app/src/styles/shell.test.js:668-669` (`expected a phone-block .shell__more li > button rule`) green.
- **Exact test pin inventory (`app/src/ui/Shell.test.jsx:145,176-183,244`, `app/src/ui/Shell.importGuard.test.jsx:169,188-194`, `app/src/ui/Shell.creationGuard.test.jsx:238,268-282,599-605`):** Every test line cited in `12-15-PLAN.md:66,87` matches the actual repository files and line numbers.

### 3. Concerns
- **[MEDIUM] Panel `more` in `notebook-home-more-393.html` was captured on `/notebook`, not `/` (`.planning/canvas-generators/p12g2-capture.mjs:47-48`, `.planning/canvas-generators/p12g2.py:231` vs `.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-15-PLAN.md:89`):**
  In `p12g2-capture.mjs:47-48`, `more_393` was captured after `await load('/notebook')`, so in `notebook-home-more-393.html:13143` (panel `more`) the `Notebook` tab in `.shell__tabs` carries `aria-current="page"` (which sets `font-weight: 600` via `.shell__tabs .shell__place[aria-current='page']` at `app/src/styles/shell.css:1200`). `12-15-PLAN.md:89` says *"One panel, `more`, by `panelSelector` `.fp-win.g2w-393[data-pid="more"]` at 393 with a coarse pointer, seed only, its steps opening More by pressing `.shell__more summary`"* without naming `route: '/notebook'`. If `12-board-more.mjs` uses `route: '/'`, `Home` will have `aria-current="page"` instead of `Notebook`, and if `12-board-more.mjs` does not set `anchor: '.shell__tabs'` (since `more` is a `kind === 'full'` panel where `p12g2.py:231` also stripped `New recipe` via `notebook(...)`), any full-page check outside `.shell__tabs` could see `.shell__main` before `12-09` lands.
- **[LOW] Outdated comments in `app/src/ui/Shell.jsx:449,681-687` (`app/src/ui/Shell.jsx:449,681-687` vs `.planning/phases/12-showing-a-recipe-s-own-scales-and-problems-and-the-whole-loo/12-15-PLAN.md:85,115`):**
  `12-15-PLAN.md:85,115` updates the hairline comment (`:715-719`) and the `closeImportErrors` comment (`:370-371`), but `app/src/ui/Shell.jsx:449` (`// Both Import buttons open the one hidden file input through here.`) and `:682-687` (`the fifth being More — Ingredients, Kitchen, Search, Import and Export. ... More's Import opens the same single hidden file input...`) still describe `More`'s `Import` and `Export` buttons.

### 4. Suggestions
- In `12-board-more.mjs` (`12-15-PLAN.md:89`), set `route: '/notebook'` and `anchor: '.shell__tabs'` so the active tab (`Notebook`) matches `notebook-home-more-393.html`'s `more` panel and the check is scoped strictly to `.shell__tabs` (completely independent of `12-09`'s changes in `.shell__main`), and use `absent: ['.shell__more button']`.
- Update the comments at `app/src/ui/Shell.jsx:449` and `:681-687` (and the test description at `app/src/ui/Shell.test.jsx:155`) alongside `:370-371` and `:715-719` so no comment in `Shell.jsx` claims `More` still holds `Import` and `Export`.

### 5. Risk Assessment
**LOW** — Very small, well-isolated deletion in `Shell.jsx` with straightforward test pin updates.

---

## Cross-Plan Comparison & Overall Risk Assessment

### Wave Structure & File Exclusivity
- **Wave 4 (`12-09`, `12-10`, `12-11`, `12-15`):** Zero file overlap across the four plans. Splitting `12-15` (`Shell.jsx` and `12-board-more.mjs`) out of `12-09` cleanly avoids any file contention in Wave 4. Note that if `12-15`'s `12-board-more.mjs` runs before `12-09` lands, anchoring `12-board-more.mjs` on `.shell__tabs` (`route: '/notebook'`) ensures it does not touch `.shell__main`.
- **Wave 5 (`12-12`) -> Wave 6 (`12-13`) -> Wave 7 (`12-14`):** Strictly sequential where files overlap (`CreationSteps.jsx`, `IngredientTable.jsx`, `CreationPage.jsx`, `REQUIREMENTS.md`, `ROADMAP.md`).

### Top Must-Fix Issues Before Execution
1. **`12-13-PLAN.md:182` (HIGH — Board Text Failure):** Fix the instruction claiming `In a row's grams:` uses a *"typographic apostrophe as the board writes it"*. Both `p12g2.py:95` and `row-controls.html:13146` (`&#x27;`) use the ASCII straight apostrophe `'` (`U+0027`). Using `’` (`U+2019`) will fail `12-board-keys.mjs`.
2. **`12-12-PLAN.md:191` (HIGH — Board Geometry/Text Failures on `kr-preview` and `ai-pick`):** Account for the two board shortcuts in `p12g2.py`:
   - `kr-preview` (`p12g2.py:130-134,297`, `CONTRACT.md` §9 bullet 2) spliced the two-field preview block into the written step (`ed_full`), so `.mk-preview` on the board lacks the target, purpose, and aside that the real app renders.
   - `ai-pick` (`p12g2.py:267-268,305`) truncated `<ul class="pick__list">` to 8 items, so checking `.pick` `box` will fail on `box.h` against the 111-item list in the live app (check `.pick__head` and `.pick .ing__filters` `box` instead, or cap the list with `appStyle`).
3. **`12-14-PLAN.md:144` (HIGH — Wrong Tab Walk Endpoint in Row 2):** In `app/src/ui/CreationPage.jsx:685-828`, `Save` is in `.notebook-band` at the top of the editor (4 Tabs after `Recipe name`), **before** `.notebook-body`. Change *"from Recipe name Tab to Save"* to Tab from `Recipe name` through `Save` and the entire editor to the end of `Problems` (`Add problem` in `<aside aria-label="Setup">`).
4. **`12-11-PLAN.md:90` (HIGH — Node vs. jsdom Test Environment):** `app/src/ui/Method.test.jsx` runs in Vitest's `node` environment (`renderToStaticMarkup`, no DOM/clicks). Move the interactive click/toggle/`Done`/`Cancel` cases to `app/src/ui/RecipePage.perStep.test.jsx` (which runs in `jsdom`).
5. **`12-10-PLAN.md:125` (HIGH — `startTastingOnMount` vs. `draftsLoaded` Race):** Because `app/src/ui/useRouteIntents.js:43` waits on `draftRestoreDone` but not `draftsLoaded`, refusing `handleStartAmending` while `!draftsLoaded` can consume and drop a valid `Record tasting` navigation from Home if `getDraft` resolves before `listDrafts`. Gate `useRouteIntents.js:43` on `draftsLoaded` (like `:67`) or derive `planHeld` from `useKeptDraft`'s own `getDraft` read.
6. **`12-09-PLAN.md:158,188` (MEDIUM — `12-board-check.mjs` `anchor` Requirement & `NotebookList` Empty Branch):** Set `anchor: '.shell__main'` (not just `scope: '.shell__main'`) in `12-board-places.mjs` so `12-board-check.mjs:185` activates scoping on `full` panels, and pass `below724` in both return branches of `NotebookList` (`app/src/ui/NotebookPlace.jsx:296-297,305-306`).

**Overall Round-Two Risk Level:** **MEDIUM** — The product design (`CONTRACT.md`) and codebase architecture are very well aligned, and addressing the six source-verified issues above will prevent false board-check failures, test-environment errors, and route-intent races during execution.


---

## Consensus Summary

Both reviewers read the repository and cite `file:line` evidence throughout; both gave every one of
the seven plans its own section. Astra asks for changes before execution and rates the round HIGH
risk; Argon rates it MEDIUM with six must-fix items. The findings below are the reviewers' claims.
They have not yet been checked against the code by the orchestrator.

### Agreed Strengths

- 12-09: guarding at the route element keeps `CreationRoute` and `EditRoute` from mounting below
  724, so their draft reads and redirects never run; the unmount flush in `useKeptDraft` carries
  pending typing across a width crossing.
- 12-10: the shared draft key between `plan`, `record` and `amend` is a real loss path and the plan
  guards handlers as well as markup; a separate own-draft prop keeps the History rail unchanged.
- 12-11: reusing `StepReading` and resetting the preview when the step closes fits how
  `StepPenBody` stays mounted.
- 12-12: the stale-anchor check before `groupRows` prevents a real `RangeError`.
- 12-13: keyed moves must not go through the button-focus request; composing with `holdReturn`
  keeps Return behaviour in the fields.
- 12-14: the Phase 11 walk baseline should not change, and PROOF-02 stays pending until Mark passes
  the rows.
- 12-15: removing More's Import and Export outright is right, and the narrow error-panel focus
  fallback stays reachable.

### Agreed Concerns

1. **12-14, HIGH (both): the whole-editor Tab step ends too early.** "From Recipe name Tab to Save"
   reaches Save after four stops, because Save sits in the band above the editor body
   (`app/src/ui/CreationPage.jsx:685-754`). As written it proves no row or step control.
2. **12-10, HIGH (both, different mechanisms): an asynchronous gap around the held-draft guard.**
   Astra: on widening, `planHeld` goes false before the second `getDraft` finishes, so a record pen
   opened in that interval can win the late-read rule and overwrite the plan draft. Argon: the
   start-tasting route intent does not wait for `draftsLoaded`, so refusing while drafts are unread
   consumes and drops a valid intent; the record controls can also flash before `draftsLoaded`.
3. **12-11, HIGH (Argon) / MEDIUM (Astra): interactive tests are assigned to `Method.test.jsx`,**
   which renders static markup in the node environment and cannot press a button.
4. **12-12, MEDIUM (Astra) / LOW (Argon): Cancel on the picker can find no target** when the
   anchor row has switched to its Add to step chooser, so focus is dropped.
5. **12-11, MEDIUM (Astra) / LOW (Argon): a removed step's preview is unspecified** (it would read
   as an ordinary numbered step; the margin number rule is not carried into the preview).
6. **12-14, LOW (both): the precondition lists summaries 12-09 to 12-13 and omits 12-15.**
7. **12-15, LOW (both): comments in `Shell.jsx` still describe More's Import and Export.**

### Divergent Views

Raised by Astra only:
- 12-10, HIGH: existing 393-wide suites press Next version or expect Resume editing
  (`RecipePage.perStep.test.jsx`, `RecipePage.beforeYouStart.test.jsx`, `RecipePage.edit.test.jsx`)
  and no plan owns their migration.
- 12-10, MEDIUM: extending `recordingLocked` to Correct changes a desktop state the plan says is
  unchanged (a kept edit whose version gained a batch).
- 12-09, MEDIUM: "reads, writes and deletes nothing" contradicts the intended flush on narrowing
  and Shell's own draft read; the test does not watch `listDrafts`.
- 12-12, MEDIUM: the landing group for focus is computed from render-time state while the insert
  re-checks the anchor inside the updater, so the two can disagree.
- 12-13, MEDIUM: the Branch A or B decision rests on a lead-in probe only; the key matrix is
  narrower than "every key path".
- 12-14, MEDIUM: the written authoring sequence leaves blank grams and a blank second step, so its
  Save cannot succeed as written.

Raised by Argon only (mostly board-check harness mismatches):
- 12-12, HIGH: board panel `kr-preview` shows a two-field preview block inside a fully written
  step, and `ai-pick` cuts the picker list to eight rows; `box` and `text` checks as planned would
  fail against the app.
- 12-13, HIGH: the plan says "typographic apostrophe as the board writes it", but the board and the
  contract use the ASCII apostrophe.
- 12-13, MEDIUM: `kr-press` and `kr-move` are before-key panels; pressing the key in their steps
  puts the app in the after-key state.
- 12-09, MEDIUM: `12-board-check.mjs` ignores `scope` on full-page panels unless `anchor` is set;
  `NotebookList` has two return branches and the empty one is easy to miss.
- 12-10, MEDIUM: a plan draft kept in the same session is not in the page's `drafts` state until a
  reload, which the board spec must allow for.
- 12-14, MEDIUM: `11-device-steps.mjs` holds selectors that no longer match the app; copying it
  would carry them over.
- 12-15, MEDIUM: the `more` panel was captured on `/notebook`, and the plan names no route.
- 12-13, LOW: evidence file names collide when the row-controls and keys specs run together.

The two reviews overlap little. Astra concentrates on state transitions and on whether the tests
prove what they claim; Argon concentrates on whether the board checks can pass as specified.
