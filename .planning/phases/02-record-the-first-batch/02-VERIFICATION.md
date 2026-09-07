---
phase: 02-record-the-first-batch
verified: 2026-09-07T00:30:00Z
status: human_needed
score: 5/5 must-haves verified
covered_files: [".planning/REQUIREMENTS.md", ".planning/phases/02-record-the-first-batch/02-01-PLAN.md", ".planning/phases/02-record-the-first-batch/02-01-SUMMARY.md", ".planning/phases/02-record-the-first-batch/02-02-PLAN.md", ".planning/phases/02-record-the-first-batch/02-02-SUMMARY.md", ".planning/phases/02-record-the-first-batch/02-03-PLAN.md", ".planning/phases/02-record-the-first-batch/02-03-SUMMARY.md", ".planning/phases/02-record-the-first-batch/02-04-PLAN.md", ".planning/phases/02-record-the-first-batch/02-04-SUMMARY.md", ".planning/phases/02-record-the-first-batch/02-05-PLAN.md", ".planning/phases/02-record-the-first-batch/02-05-SUMMARY.md", ".planning/phases/02-record-the-first-batch/02-UAT.md", "app/src/domain/axes.js", "app/src/domain/axes.test.js", "app/src/styles/app.css", "app/src/ui/AxisMark.jsx", "app/src/ui/AxisMark.test.jsx", "app/src/ui/BatchMargin.jsx", "app/src/ui/BatchMargin.test.jsx", "app/src/ui/Method.jsx", "app/src/ui/Method.test.jsx", "app/src/ui/RecipePage.jsx"]
covered_digest: "v1:sha256:9d31cd9d1489a32be05149f3db6a71084b1c3b4a2ed5b38f21efc796c0631aa5"
behavior_unverified: 0
overrides_applied: 0
re_verification:
  previous_status: human_needed
  previous_score: 5/5
  gaps_closed:
    - "G-02-1 — Record a batch entry unreachable once a batch exists: closed by 02-04 (Record another batch control in the saved-batch reading state, worded distinctly from Amend; unknown-address wording distinguished from zero-batch wording)"
    - "G-02-3 — Skipped label struck through with its own step: closed by 02-05 (strike scoped to an inner .method-step__prose--struck span; the Skipped label is a sibling after the closed span, structurally outside the propagation scope, asserted by Method.test.jsx)"
    - "G-02-6 — A tasting mark could not be cleared: closed by 02-05 (domain/axes.js setMark(marks, axisKey, null) removes the axis's own key without mutation; AxisMark renders a per-axis Clear control wired through the same onChange; RecipePage's handleChangeTastingMark now calls setMark)"
  gaps_remaining:
    - "G-02-4 — only half closed by design. The cancel control (abandon a recording/amendment without writing) is delivered and verified. The other half — 'Save batch is hard to find' (no button token/control weight in the direction contract; the recording margin sits ~1400px down the page's longest column) — is explicitly out of this plan's scope (A-3) and remains open against Impeccable. This is a tracked design debt item, not a code defect; it does not block any of the five ROADMAP success criteria."
  regressions: []
behavior_unverified_items: []
coincidental_reliance_items: []
human_verification:
  - test: "The new-batch door and the unknown-address wording (02-04 task 1 human-check, deferred to end-of-phase UAT): on the churned recipe with the 2 Aug batch showing, confirm the margin offers a way to record another batch worded so it cannot be read as a correction of the open batch; visit /recipe/olive-oil-ice-cream-v1/batch/does-not-exist and confirm the margin says no batch of this version has that address (not that the version has no batch)."
    expected: "\"Record another batch\" appears after the batch list, reads distinctly from \"Amend\", and opens the pen layer with an empty draft. The unknown-batch-id URL shows the 'No batch of this version has that address.' sentence, never the zero-batch sentence."
    why_human: "Visual/interactive click-through and real browser URL navigation; component test proves the markup strings render correctly but not that a human reads them as intended or that the click actually opens the pen layer."
  - test: "The cancel door (02-04 task 2 human-check, deferred to end-of-phase UAT): open the pen layer via the new control and cancel it; Amend, change a value, cancel, and confirm the saved value is unchanged with no amendment date added; Amend then cancel then record a genuinely new, later-dated batch and confirm both batches persist independently, the margin's batch list shows both, the version line moves to the newer date, and the older batch is unchanged when reopened by its own URL; confirm the native leave-warning still fires only while a draft is dirty and stops firing once cancelled."
    expected: "Cancel returns to the reading state immediately with no dialog of the app's own; nothing is written to the store on cancel; a new recording started after a cancelled amendment creates a distinct batch rather than overwriting the amended one; the browser's native beforeunload warning behaves exactly as before."
    why_human: "Real click-through, real repository writes/non-writes, and the native beforeunload dialog cannot be exercised by a react-dom/server render test (A-4); this is exactly the scenario UAT test 8 was blocked on."
  - test: "The struck-step label and the axis clear control (02-05 task 2 human-check, deferred to end-of-phase UAT): on the 2 Aug batch, confirm step 1 reads struck with 'Skipped' beside it carrying no strike-through. Open 'Add a tasting': with no axis marked, confirm no clear control appears and Save tasting is disabled with its hint; mark one axis and confirm only that axis grows a Clear control and Save tasting enables; click Clear and confirm the axis, the save gate, and the hint all return to exactly their pre-mark state; mark three axes, clear the middle one, and save — confirm the reading state shows two marks and 'unmarked' for the cleared axis and the three untouched axes; tab through an axis and confirm arrow keys/Home/End still move the mark, the focus outline is visible, and the Clear control takes its own tab stop with an accessible name naming its axis."
    expected: "The struck step's 'Skipped' text is legible (no line through it); a mark can be placed and then fully retracted with the form returning to its exact pre-mark state; keyboard navigation and focus visibility on the nine-stop group are unaffected by the new Clear control."
    why_human: "Visual strike/no-strike rendering, click-then-verify-state-reset, and keyboard focus/tab-order behavior all require a DOM environment and click simulation the render-only component tests (react-dom/server) cannot exercise (A-4 in both 02-04 and 02-05)."
  - test: "Confirm the intended scope of BATCH2-01 / SC5's snapshot guarantee once Phase 3 adds version editing."
    expected: "Mark explicitly deferred this decision to Phase 3 planning during UAT (test 9: \"Deferred follow-up: I'd rather decide during phase 3 planning\"). No further action is needed within Phase 2; this is carried forward as a Phase 3 planning input, not a re-verification blocker."
    why_human: "Already answered by explicit user decision in 02-UAT.md — listed here only so the decision is visible in this report's audit trail, not because it is outstanding."
---

# Phase 2: Record the first batch Verification Report

**Phase Goal:** Maker can record the 2 Aug batch against the churned version — what was actually done, what was measured, and how it turned out in their own words — and reopen it later unchanged
**Verified:** 2026-09-07T00:30:00Z
**Status:** human_needed
**Re-verification:** Yes — after gap closure (plans 02-04, 02-05, closing UAT gaps G-02-1, G-02-3, G-02-4 [partial], G-02-6)

**Note on mode (carried from initial verification):** ROADMAP.md marks this phase `mode: mvp`, but the Goal line is prose, not strict "As a ... I want to ... so that ..." form. This report verifies against the ROADMAP's five numbered Success Criteria in the standard goal-backward format, as the initial verification did and as the launching task instructs.

## What changed since the last verification

The prior verification (`02-VERIFICATION.md`, `human_needed`, 5/5 roadmap truths verified) was followed by a UAT session (`02-UAT.md`: 3 passed, 4 issues, 1 blocked, 1 skipped/deferred) that surfaced four gaps against the shipped code — none against the ROADMAP success criteria's core logic, all against reachability, legibility, or reversibility of controls the logic already computed correctly:

- **G-02-1** (major): no visible way to start a second batch once one exists — the `Record a batch` control lived only in a branch the seeded store could never reach.
- **G-02-3** (cosmetic): the `Skipped` label on a struck method step was itself struck through, defeating its purpose as a legible text marker.
- **G-02-4** (major): no cancel control while recording/amending, and `Save batch` hard to find.
- **G-02-6** (major): a placed tasting mark could not be removed — a one-way control in an otherwise fully reversible pen layer.

Two gap-closure plans ran: **02-04** (G-02-1 fully, G-02-4's cancel half) and **02-05** (G-02-3 fully, G-02-6 fully). This re-verification re-checks each closure against the actual codebase rather than trusting the SUMMARYs' claims.

## Goal Achievement

### Observable Truths (ROADMAP Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Maker records a batch against the churned version with its churn date, an as-made amount per row where it differed from the plan, and changed or skipped steps, all kept visibly separate from the recipe's planned values. | ✓ VERIFIED | Unchanged core logic (`asMadeFor`/`hasAsMade`, `isStruck`/`changedLineFor`, pen-blue `.ink-field`/`.ink-text` styling) still passes all `batch.test.js` cases. **Plus:** G-02-1 closed — `BatchMargin.jsx`'s `if (openBatch)` branch now renders `Record another batch` (line 300-302), reachable on every store state a maker can actually reach, proven by `BatchMargin.test.jsx`'s "saved-batch reading state" case. G-02-3 closed — `Method.jsx` line 43-54 now nests the strike in an inner `<span className="method-step__prose--struck">` closed before the sibling `Skipped` label opens; `app/src/styles/app.css:253` carries the renamed selector; `Method.test.jsx` asserts the struck element's closing tag precedes the label's opening tag. |
| 2 | Maker records come-up time, draw temperature, overrun, and meltdown; a field left blank stays visibly unknown and is never filled in from the recipe. | ✓ VERIFIED | Unchanged: `readMeasured` and its 6+ unit tests are untouched by either gap-closure plan; `BatchMargin.jsx`'s churn/tasting sections still route every measured value through it exclusively. |
| 3 | Maker records how the batch turned out in their own words, optionally adding structured dimensions and a next-time note, and can save with nothing but the words. | ✓ VERIFIED | `isTastingSaveable` gate unchanged and still tested. **Plus:** G-02-6 closed — `domain/axes.js`'s `setMark(marks, axisKey, stop)` (lines 66-74) removes the axis's own key on `stop === null`, never mutating its argument, built with spread+delete (no prototype-chain write); `axes.test.js` proves set/replace/clear/never-mutate and the cross-module assertion that clearing the last mark returns `isTastingSaveable` to `false`. `AxisMark.jsx` line 41-50 renders a `Clear` control only while `value !== undefined`, wired to `onChange(null)`; `RecipePage.jsx` line 310 confirms `handleChangeTastingMark` now writes through `setMark` (not a raw spread-and-assign). `AxisMark.test.jsx` confirms the control's conditional presence and its per-axis accessible name (`Clear {axis.label} mark`), so six on one form are distinguishable. |
| 4 | Maker reopens the batch and sees it together with the recipe version it used, its measured values, and its result. | ✓ VERIFIED | Unchanged route/derivation logic. **Plus:** the URL-address truthfulness half of G-02-1 is closed — `BatchMargin.jsx` line 333 now picks its fallthrough sentence from `batches.length`, so a URL naming a batch id this version does not have says so ("No batch of this version has that address.") instead of falsely claiming no batch exists at all; asserted by `BatchMargin.test.jsx`'s "unknown-address state" and "the two entry states are distinguishable" cases. |
| 5 | The batch holds the recipe rows and ingredient coefficients it was computed with; later edits to the recipe or to ingredient data do not change what the batch shows. | ✓ VERIFIED — scope question explicitly deferred by product decision | Unaffected by either gap-closure plan; `createBatch`'s snapshot-immunity behavior and its test are untouched. The scope question the initial verification flagged (whether the plan-side columns should also read from `snapshot.rows` once versions become editable) was put to Mark directly in UAT test 9, and Mark explicitly chose to defer it to Phase 3 planning rather than resolve it now — see Deferred Items below. |

**Score:** 5/5 truths verified (0 present-but-behavior-unverified; one scope question explicitly deferred by the product owner to Phase 3, not carried as an open verification question)

### Gap Closure Detail (G-02-1, G-02-3, G-02-4, G-02-6)

| Gap | UAT Report | Closure Plan | Status | Evidence |
|-----|-----------|--------------|--------|----------|
| G-02-1 | "I don't see anything ... that says anything close to 'Record a Batch'" | 02-04 Task 1 | ✓ CLOSED | `BatchMargin.jsx:300-302` renders `Record another batch` in the saved-batch reading branch; `RecipePage.jsx:138-139` `handleStartRecording` clears `amendingBatchId` first (confirmed load-bearing per T-02-24: without it a post-amendment recording would silently overwrite the amended batch). `BatchMargin.test.jsx` proves both the new control's presence and its wording differs from `Amend`. |
| G-02-3 | "'Skipped' ... is struck-thru like rest of step" | 02-05 Task 1 | ✓ CLOSED | `Method.jsx:43-54` — the strike-bearing span closes before the `Skipped` label span opens (sibling, not descendant); `app.css:253` carries the renamed `.method-step__prose--struck` selector with the same declaration and values. `Method.test.jsx` asserts the structural invariant directly (string search for the closing `</span>` before the label's opening tag), the exact class of assertion the original string-presence gate could not make. |
| G-02-4 | "no cancel button visible and Save batch button is hard to find" | 02-04 Task 2 | ⚠️ PARTLY CLOSED (by design, per plan A-3) | Cancel: `BatchMargin.jsx:236-238` renders a `Cancel` button beside `Save batch` in the recording branch only; `RecipePage.jsx:282-286` `handleCancelRecording` is a 3-statement pure reset (`setMode('reading')`, `setDraft(null)`, `setAmendingBatchId(null)`) — grep-confirmed no `repository.` call, no `setBatches` call, no `new Date()` inside it. `BatchMargin.test.jsx` confirms Cancel renders in recording mode and not in the reading state. **Findability ("Save batch is hard to find") is untouched** — no button token, no style rule, no layout change was added (confirmed: no new rule in `tokens.css`; `app.css`'s only new rule is `.axis-mark__clear`, unrelated). This half stays open against Impeccable per the plan's own A-3 assumption; it is tracked under Phase 2's `## Deferred Follow-Ups` and does not block any ROADMAP success criterion (the control exists and is operable — it is a discoverability/visual-weight concern, not a missing capability). |
| G-02-6 | "once a mark is made, it cannot be removed" | 02-05 Task 2 | ✓ CLOSED | `domain/axes.js:66-74` `setMark`; `AxisMark.jsx:41-50` conditional `Clear` control; `RecipePage.jsx:310` wired through `setMark`. `axes.test.js` proves the pure delete rule (set/replace/clear/never-mutate) and the cross-module save-gate assertion; `AxisMark.test.jsx` proves the control's conditional render and per-axis accessible name. |

### Required Artifacts (new/changed by gap closure)

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `app/src/ui/BatchMargin.jsx` | New-batch control, cancel control, address-aware fallthrough wording | ✓ VERIFIED | All three present, substantive, and covered by new render tests |
| `app/src/ui/BatchMargin.test.jsx` | Component test proving the margin's four states | ✓ VERIFIED | 102 lines, 6 `describe`/`it` blocks, all passing; renders through `renderToStaticMarkup`, no new dependency |
| `app/src/ui/RecipePage.jsx` | `handleStartRecording` clears amend target; `handleCancelRecording` added and wired | ✓ VERIFIED | Confirmed by direct read; 2 non-comment `setAmendingBatchId(null)` call sites |
| `app/src/ui/Method.jsx` | Strike scoped to an inner prose span; label a sibling | ✓ VERIFIED | Confirmed by direct read and `Method.test.jsx`'s structural assertion |
| `app/src/ui/Method.test.jsx` | Structural render assertion the label is outside the struck element | ✓ VERIFIED | 61 lines, asserts closing-before-opening tag order, plus regression guards for unstruck steps and the changed-line branch |
| `app/src/domain/axes.js` | `setMark` added, pure, framework-free | ✓ VERIFIED | Confirmed by direct read; no framework/DOM import (grep-confirmed); builds via spread+delete only |
| `app/src/domain/axes.test.js` | `setMark` set/replace/clear/never-mutate + cross-module assertion | ✓ VERIFIED | 146 lines, all cases present and passing |
| `app/src/ui/AxisMark.jsx` | Per-axis `Clear` control, conditional on a mark being present | ✓ VERIFIED | Confirmed by direct read; native radio group and keyboard semantics unchanged |
| `app/src/ui/AxisMark.test.jsx` | Render assertions on conditional presence and accessible name | ✓ VERIFIED | 39 lines, all cases passing |

### Key Link Verification (gap-closure specific)

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `BatchMargin.jsx` (reading state) | `RecipePage.jsx` | `onStartRecording` | ✓ WIRED | `Record another batch` button's `onClick` calls the same prop the zero-batch state already used |
| `BatchMargin.jsx` (recording state) | `RecipePage.jsx` | `onCancelRecording` | ✓ WIRED | `Cancel` button's `onClick`; prop declared and wired, 2 non-comment occurrences in each file |
| `RecipePage.jsx` `handleStartRecording` | component state | `setAmendingBatchId(null)` | ✓ WIRED | First statement in the function body, not only inside save callbacks |
| `AxisMark.jsx` `Clear` button | `RecipePage.jsx` `handleChangeTastingMark` | `onChange(null)` | ✓ WIRED | Same `onChange` prop the nine stops already use, carrying `null` as a sentinel for clear |
| `RecipePage.jsx` `handleChangeTastingMark` | `domain/axes.js` | `setMark(prev.marks, axisKey, stop)` | ✓ WIRED | Line 310, confirmed replacing the prior raw spread-and-assign |
| `Method.jsx` struck span | `app/src/styles/app.css` | `.method-step__prose--struck` | ✓ WIRED | Selector renamed consistently in both the component and the stylesheet; label's own rule untouched |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Full test suite passes | `npm --prefix app test` | 10 test files, 180/180 passed | ✓ PASS |
| Production build succeeds | `npm --prefix app run build` | exit 0, 103 modules transformed, built in 63ms | ✓ PASS |
| All 8 gap-closure commit hashes exist | `git log --oneline --all \| grep <hashes>` | all 8 found (`ad9f34a`, `86bbe15`, `ffa53d5`, `01ba390`, `1b94b68`, `2098520`, `307cb7a`, `13e3287`) | ✓ PASS |
| Dependency count unchanged | `node -p "... Object.keys(deps).length + Object.keys(devDeps).length"` | 7 | ✓ PASS |
| No debt markers in any of the 10 gap-closure-touched files | `grep -nE 'TBD\|FIXME\|XXX\|TODO\|HACK\|PLACEHOLDER'` | 0 matches | ✓ PASS |
| No color literals introduced | `grep -nE '#[0-9a-fA-F]{3,8}'` across touched files | 0 matches | ✓ PASS |
| `handleCancelRecording` writes nothing | direct read of function body | 3 statements: `setMode`, `setDraft(null)`, `setAmendingBatchId(null)` — no `repository.`, no `setBatches`, no `new Date()` | ✓ PASS |
| No app-drawn confirmation dialog for Cancel | `grep -n "window.confirm\|window.alert\|confirm(\|alert("` on `RecipePage.jsx`, `BatchMargin.jsx` | 0 matches | ✓ PASS |
| No network API call site under `app/src` | `grep -rIhE 'fetch\(\|XMLHttpRequest\|sendBeacon\|EventSource\|WebSocket'` | 0 matches | ✓ PASS |
| No new token added for the cancel/clear controls | `git log -- app/src/styles/tokens.css` | last touched in 02-01/02-03 (Phase 2 core), no commit in 02-04/02-05 touches it | ✓ PASS |

Interactive browser behavior (actually clicking Record another batch, Cancel, Clear, tabbing through the axis group, and the native `beforeunload` dialog) could not be spot-checked here — see Human Verification below; these are exactly the `<human-check>` items 02-04 and 02-05 explicitly deferred to end-of-phase UAT.

### Requirements Coverage

| Requirement | Source Plan(s) | Description | Status | Evidence |
|--------------|------------|-------------|--------|----------|
| BATCH1-01 | 02-01, 02-02, 02-03, 02-04, 02-05 | Batch against churned version: churn date, as-made per row, process deviations, kept separate | ✓ SATISFIED | Truth 1 above; unaffected core logic plus G-02-1/G-02-3 fixes strengthen reachability and legibility |
| BATCH1-02 | 02-02 | Measured values (come-up, draw temp, overrun, meltdown); blank stays unknown, never from recipe | ✓ SATISFIED | Truth 2 above, untouched by gap closure |
| BATCH2-01 | 02-01, 02-02 | Snapshot of rows/coefficients; later edits don't change what the batch shows | ✓ SATISFIED (scope question explicitly deferred by Mark to Phase 3) | Truth 5 above |
| BATCH2-02 | 02-01, 02-03, 02-04 | Reopen a batch together with its version, measured values, result | ✓ SATISFIED | Truth 4 above; G-02-1's address-aware wording fix strengthens this |
| OBS1-01 | 02-03, 02-05 | Record result in own words, optional structured dimensions + next-time note, save with words alone | ✓ SATISFIED | Truth 3 above; G-02-6 fix makes the structured-dimensions path fully reversible |

No orphaned requirements: all five IDs the phase declares in ROADMAP.md appear in at least one plan's `requirements:` frontmatter field (02-01 through 02-05 combined), and REQUIREMENTS.md's traceability table marks all five "Complete" against Phase 2.

### Anti-Patterns Found

None. Zero debt markers, zero color literals, zero `dangerouslySetInnerHTML`, zero new network API call sites, zero new dependencies, zero new design tokens across all 10 files touched by the gap-closure plans.

### Deferred Items

| # | Item | Addressed In | Evidence |
|---|------|-------------|----------|
| 1 | Whether the plan-side ingredient/method rendering should read from `openBatch.snapshot.rows` once versions become editable (BATCH2-01/SC5 scope question) | Phase 3 planning | UAT test 9: Mark's explicit response — "Deferred follow-up: I'd rather decide during phase 3 planning" |
| 2 | G-02-4's findability half — no button token/control weight in the direction contract, and the recording margin's foot-of-column position | Tracked against Impeccable (design work), not a GSD phase | 02-04-PLAN.md A-3, 02-04-SUMMARY.md's "Gap Closure Status" section, and Phase 2's `## Deferred Follow-Ups` (test 4) |

Neither item is a code defect and neither blocks any of the five ROADMAP success criteria — both are legitimate, explicitly-scoped deferrals to a later planning decision, not silently dropped work.

### Human Verification Required

Three click-through items — all harvested verbatim (in substance) from 02-04's and 02-05's `<human-check>` blocks, which were deferred to end-of-phase UAT per `workflow.human_verify_mode: end-of-phase` and A-4's stated limitation (render-only component tests cannot simulate a click, a tab sequence, or the native `beforeunload` dialog) — plus one already-resolved item included for audit-trail completeness. See the `human_verification` frontmatter above for full text.

1. **The new-batch door and unknown-address wording** (02-04 Task 1) — click-through confirmation that `Record another batch` opens an empty pen layer, and that an unknown batch URL states the correct fact.
2. **The cancel door** (02-04 Task 2) — click-through confirmation of cancel-without-writing, amend-then-cancel, and record-a-genuinely-new-batch-after-cancelling (this is also the exact scenario UAT test 8 was blocked on).
3. **The struck label and the axis clear control** (02-05 Task 2) — visual confirmation the `Skipped` label is unstruck, and click-through confirmation that a mark can be placed and fully retracted, with keyboard/tab-order unaffected.
4. **BATCH2-01/SC5 snapshot-scope** — already resolved by Mark's explicit deferral to Phase 3 planning; listed here only so the decision is visible in this report, not because further human input is needed within Phase 2.

### Gaps Summary

No blocking gaps at the code level. All four UAT-reported gaps (G-02-1, G-02-3, G-02-4, G-02-6) have real, substantive, tested fixes in the codebase — confirmed by direct reading of every changed file, not by trusting the SUMMARYs. G-02-4 is honestly only half-closed: the cancel control is real and verified; "Save batch is hard to find" is untouched by design (A-3) and remains open against Impeccable, tracked separately, and does not block any ROADMAP success criterion.

The phase does not reach `passed` status because the click-through behavior of the four newly-added/changed interactive controls (Record another batch, Cancel, Clear, and the unknown-address wording) has not yet been watched by a human — exactly the limitation both gap-closure plans' authors flagged (A-4: `react-dom/server` render tests prove markup, not clicks). All automated evidence (180/180 tests including 4 new component-test files, a clean build, all 8 gap-closure commits present, zero anti-patterns, all key links wired, all requirements satisfied) supports the gaps being closed at the code level.

Recommend running the three human-verification items above in one short UAT pass (they are substantially smaller in scope than the original 9-test session), then re-running verification to close this report to `passed`.

---
*Verified: 2026-09-07T00:30:00Z*
*Verifier: Claude (gsd-verifier)*
