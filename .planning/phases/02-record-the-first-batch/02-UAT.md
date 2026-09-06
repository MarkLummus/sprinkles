---
status: diagnosed
phase: 02-record-the-first-batch
source: [02-VERIFICATION.md]
started: 2026-09-06T20:35:00Z
updated: 2026-09-06T23:33:37Z
---

## Current Test

[testing paused — 1 item outstanding: test 8 second-batch step blocked on gap G-02-1]

## Tests

### 1. Tracer — record a batch with one as-made value and reopen it by URL
expected: Open the churned recipe, click Record a batch: the As made column appears with the churn date field focused and nothing pre-filled. Type a churn date and 383 beside whole milk's 370.4 g, leave every other cell empty, click Save batch. The URL becomes /recipe/olive-oil-ice-cream-v1/batch/{id}, the cell renders as plain blue text, and the margin reads "recorded {today} against {version label}". Opening that URL in a new tab, and reloading, shows the same 383 and the same empty cells.
result: issue
reported: "I don't see anything on the list page or the recipe page that says anything close to \"Record a Batch\". What I see is the recorded batch."
severity: major

### 2. Sized numeric columns, total row, trace threshold
expected: On the churned recipe the three numeric columns are right-aligned and no wider than their contents; lambda carrageenan reads "trace", guar gum reads "0.1%"; the plan total row reads 799.7 g. Recording a batch with 383/241/45/0 on four rows makes the as-made total read 804.3 g, and clearing the 0 on the lecithin row raises it to 805.5 g.
result: pass
note: "First reported 'I cannot clear the 0 on the lecithin row' while in the reading state (no entry to the pen layer — see gap G-02-1). Via Amend: 'was able to remove 0 on Soy lecithin row and Total updated correctly.'"

### 3. Method strikes and changed lines
expected: In recording mode, tick step 1's strike, type "blend 60 s" on step 8 and the Speed Δ line on step 9, leave step 3 alone, save. Step 1's prose reads struck with a visible "Skipped" text label (not a line alone); steps 8 and 9 show their blue changed lines; step 3 shows nothing; no target chip gains a second value; the whole method is operable and visibly focusable by keyboard.
result: issue
reported: "how do I trigger recording mode? \"Skipped\" on method step 1 is struck-thru like rest of step. seems like SKIPPED would not have strike-thru style applied."
severity: cosmetic

### 4. The churn section's measured values and the native leave-warning
expected: Every churn field is empty before typing with no trace of the recipe's targets. Type 20 for come-up, −6 for draw temperature, leave overrun blank, add draw/ingredient notes, save: the reading state shows 20, −6, and the word "unknown" for overrun, with notes in blue prose. Start recording again and try to close the tab: only the browser's native leave-warning appears, never an app-drawn one; reloading afterward shows no persisted draft.
result: issue
reported: "when Amending, no cancel button is visible and Save batch button is hard to find."
severity: major
note: "Expected behaviour itself passed: 'Leave dialog processing is correct. reloading afterward does not show a persisted draft.' The issue is the pen layer's controls (no cancel, Save batch hard to find), raised while amending during this test."

### 5. schemaVersion 2 export and import
expected: After recording a batch, the exported store file carries schemaVersion 2 with both versions and batches. Importing a hand-edited copy with one invalid field names the error by its path and leaves the store completely untouched, including the good batch beside it. Importing a genuine Phase 1 export is accepted with no batch appearing.
result: pass

### 6. A tasting saved with words alone
expected: A saved batch with no tasting shows the "not yet evaluated" wording with no colour, bold, or icon. Click Add a tasting: every field including date is empty; Save tasting stays disabled with explanatory text until words or a mark exist; the As-expected shortcut fills exactly "As expected, nothing to note"; a dateless save reads "date unknown"; a second, earlier-dated tasting sorts above the first.
result: issue
reported: "once a mark is made, it cannot be removed. otherwise pass"
severity: major

### 7. The marks — six axes, nine stops
expected: Adding a tasting shows six axes in a fixed order with anchor words at the ends (never adjectival) and no stop pre-selected. Tab into the hardness group; arrow keys, Home and End move a half-step at a time with a visible focus outline. Mark olive oil character 4.5, bitterness 5, sweetness 4, leave three unmarked, save: the three marked axes show their values, the other three read "unmarked", and nothing anywhere shows an average, total, or score.
result: pass

### 8. Amend, the batch list, and the seeded 2 Aug record
expected: After clearing site data and reloading, the 2 Aug batch is present exactly as transcribed: 383/241/45/0 as-made, the struck lecithin row, step 1 struck, steps 8/9's lines, the churn section's values, and the undated tasting with its three marks and three "unmarked" axes; identical after a second reload with no duplicate. Click Amend, change come-up to 22, save: the margin shows the amendment date beside the original churn date and the tasting is untouched. Record a second, later-dated batch: it appears in the margin's batch list, the version line moves to the newer churn date, and the older batch is unchanged when reopened by its own URL.
result: blocked
blocked_by: other
reason: "report the second batch is blocked. otherwise pass"
note: "Seeded 2 Aug record, second reload with no duplicate, and Amend (come-up 22, amendment date beside churn date, tasting untouched) all passed. Recording a second batch is blocked by gap G-02-1 (no Record a batch entry once a batch exists); retest the batch list / version line / older-batch-unchanged steps after that gap closes."

### 9. Product decision — scope of the batch snapshot (BATCH2-01 / Success Criterion 5)
expected: Confirm the intended reading before Phase 3 adds version editing. Today the ingredient table and method render the plan-side columns (grams, names, method prose) from the live version record, while every batch-scoped value (as-made, strikes, measurements, tastings) comes from the batch's own stored values; only the snapshot's version label and declared axes are consumed by the UI. The plan for 02-01 documents this as a deliberate "two shown on one spread, not merged" reading. Decide whether that satisfies the roadmap's wording that later edits to the recipe or ingredient data do not change what the batch shows, or whether the batch page must render its plan side from snapshot.rows once versions become editable.
result: skipped
reason: "Deferred follow-up: I'd rather decide during phase 3 planning"

## Summary

total: 9
passed: 3
issues: 4
pending: 0
skipped: 1
blocked: 1

## Gaps

- gap_id: G-02-1
  truth: "From the churned recipe a maker can start recording a new batch (Record a batch control visible), including when a batch already exists against the version"
  status: failed
  reason: "User reported: I don't see anything on the list page or the recipe page that says anything close to \"Record a Batch\". What I see is the recorded batch."
  severity: major
  test: 1
  root_cause: "BatchMargin.jsx renders the Record a batch control (sole caller of onStartRecording) only in the fallthrough branch reached when openBatch is falsy; the existing-batch branch offers only Amend and Add a tasting. seed.js always writes the 2 Aug batch and RecipePage auto-opens the most recent batch, so the zero-batch branch is unreachable on any store a maker can reach. Plan-level gap: 02-01-PLAN.md:237 gives Record a batch to the 'no batch yet' state alone and 02-03-PLAN.md:316 never designs a second-batch entry; the requirement lives only in verification prose. Side effect: a URL with a nonexistent batch id renders the empty state and wrongly says 'No batch recorded against this version yet.'"
  artifacts:
    - path: "app/src/ui/BatchMargin.jsx"
      issue: "if (openBatch) reading branch (lines 239-313) has no new-batch control; Record a batch stranded in fallthrough (316-324)"
    - path: "app/src/ui/RecipePage.jsx"
      issue: "lines 121-129 make openBatch non-null whenever a batch exists; handleStartRecording (131-144) unreachable in that state and does not reset amendingBatchId"
    - path: "app/src/store/seed.js"
      issue: "line 13 seeds a batch unconditionally, so the zero-batch state never occurs"
  missing:
    - "A Record a batch control in the saved-batch reading branch of the margin, worded distinctly from Amend (D-06: a correction is never a new event)"
    - "handleStartRecording explicitly sets amendingBatchId to null"
    - "Correct empty-state wording (or redirect) when the URL names a batch id that does not exist"
  debug_session: ".planning/debug/record-a-batch-entry-missing.md"


- gap_id: G-02-3
  truth: "A struck method step shows a visible \"Skipped\" text label that is itself legible, not rendered with the step's strike-through"
  status: failed
  reason: "User reported: \"Skipped\" on method step 1 is struck-thru like rest of step. seems like SKIPPED would not have strike-thru style applied."
  severity: cosmetic
  test: 3
  root_cause: "Method.jsx:48 renders the Skipped label as a span nested inside the lead paragraph that carries .method-step__lead--struck, and app.css:249-251 puts text-decoration: line-through on that paragraph. Per CSS Text Decoration L3, a decoration on a block propagates to all in-flow inline descendants and cannot be switched off by them, so the label is struck by construction; text-decoration: none on the label would be a no-op. 02-02-PLAN.md:154 asked for the label 'beside' the struck prose; it was placed inside. The automated gate only checked string presence."
  artifacts:
    - path: "app/src/ui/Method.jsx"
      issue: "line 48: Skipped span is a child of the struck <p>, inside the strike's propagation scope"
    - path: "app/src/styles/app.css"
      issue: "lines 249-251: line-through declared on the ancestor paragraph rather than scoped to the prose"
  missing:
    - "Render the Skipped label outside the struck element (sibling after the paragraph) or scope the strike to an inner span around the prose only"
    - "A component-level check that the label is not inside a line-through ancestor"
  debug_session: ".planning/debug/skipped-label-struck-through.md"

- gap_id: G-02-4
  truth: "While recording or amending a batch, the maker can see how to abandon the edit (a cancel control) and can readily find Save batch"
  status: failed
  reason: "User reported: when Amending, no cancel button is visible and Save batch button is hard to find."
  severity: major
  test: 4
  root_cause: "(1) No cancel was ever designed: route-recipe-batch.md:102 specifies abandonment only for document unload (native leave-warning), its In list names save and no cancel, and D-24 answered draft-loss-on-unload, not an in-app way out. setMode('reading') exists only inside saveBatch().then() at RecipePage.jsx:249 and :260, so recording mode has no non-saving exit; no Link/nav renders while recording and mode is not URL-derived (D-19), so Back does not leave it either. (2) Save batch is hard to find because (a) the brief's 'binder's button style' is never defined in the direction contract, so tokens.css has no button token and the only button rule is app.css:442 (margin-top only), leaving Save batch as bare UA chrome identical to every other button; and (b) the margin sits below the formulation note and BasisNote in a 2fr/1fr grid's narrow column, with seven recording fields above the button, so it lands at the foot of the page's longest column."
  artifacts:
    - path: "app/src/ui/BatchMargin.jsx"
      issue: "recording branch (155-237) renders no cancel and no navigation; Save batch at line 232 is an unclassed button"
    - path: "app/src/ui/RecipePage.jsx"
      issue: "no handleCancelRecording; both setMode('reading') calls are inside save callbacks (249, 260)"
    - path: "app/src/styles/app.css"
      issue: "line 442 is the only button rule (spacing only); 53-62 and 104-109 place the margin under the formulation note"
    - path: "app/src/styles/tokens.css"
      issue: "no button/control token because the direction contract defines none"
    - path: ".impeccable/surfaces/route-recipe-batch.md"
      issue: "lines 54, 70, 72, 102: cancel neither In nor Out; cites an undefined 'binder's button style'"
  missing:
    - "Product decision: abandoning a recording/amendment discards silently or confirms (D-24 did not answer this)"
    - "A cancel control in the recording branch with a handler that returns to reading (and restores the amended batch's URL state)"
    - "A button/control item in the direction contract resolving to a token so Save batch can carry primary-action weight"
    - "A layout decision for the recording state (e.g. collapse the formulation note while the pen layer is open; see Deferred Follow-Ups test 4)"
  debug_session: ".planning/debug/pen-layer-no-cancel-save-hard-to-find.md"

- gap_id: G-02-6
  truth: "While composing a tasting, a mark placed on an axis can be cleared again so the axis returns to unmarked before saving"
  status: failed
  reason: "User reported: once a mark is made, it cannot be removed. otherwise pass"
  severity: major
  test: 6
  root_cause: "Clearing a mark is unimplemented because it was never specified. AxisMark.jsx offers nine set-only radio stops (MARK_STOPS has no unmarked sentinel); as a controlled component it cannot return undefined, and clicking the checked stop fires no onChange. handleChangeTastingMark (RecipePage.jsx:285-287) is set-only with no delete branch. D-16 and brief §6 fix only setting behaviours; 02-RESEARCH.md Pattern 3 chose native radios and inherited their one-way latch silently. 02-03-SUMMARY.md:201 records the omission as a deliberate decision. Aggravating: isTastingSaveable flips true on the first mark and TastingForm has no Cancel, so one misclick leaves reload (discarding the whole draft) as the only escape; AxisMark is the only one-way control in the pen layer."
  artifacts:
    - path: "app/src/ui/AxisMark.jsx"
      issue: "nine set-only radio stops; no clear affordance, no unmarked stop, no click-again handler"
    - path: "app/src/ui/RecipePage.jsx"
      issue: "lines 282-287: handleChangeTastingMark writes only; no delete branch"
    - path: "app/src/domain/axes.js"
      issue: "MARK_STOPS has no null/unmarked sentinel"
    - path: "app/src/ui/BatchMargin.jsx"
      issue: "TastingForm (44-125) has no Cancel/Discard control"
  missing:
    - "Design decision (route past Impeccable): a tenth Unmarked stop at the left of the group, a per-axis Clear control, or click-again-to-clear (the last requires the role=radiogroup fallback from 02-RESEARCH A1)"
    - "A delete branch in handleChangeTastingMark so isTastingSaveable and the hint text return to their pre-mark state"
  debug_session: ".planning/debug/tasting-mark-cannot-be-cleared.md"

## Deferred Follow-Ups

- test: 4
  idea: "Should we hide the Formulation Note when entering a Batch or an Amendment to a Batch? Seems to be in the way..."
  deferred_at: 2026-09-06

- test: 3
  idea: "Would be nice to give a reason why a step was skipped; I guess I could use the \"What did you do differently\" text box to capture why the step was skipped"
  deferred_at: 2026-09-06

- test: 9
  idea: "Batch snapshot scope (BATCH2-01 / SC5): decide in Phase 3 planning whether a batch page renders its plan side (grams, names, method prose) from snapshot.rows once versions become editable, or keeps the current live-version reading. Mark: \"I'd rather decide during phase 3 planning\""
  deferred_at: 2026-09-06
